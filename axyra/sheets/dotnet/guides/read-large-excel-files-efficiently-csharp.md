---
title: 'Read Large Excel Files Efficiently in C# with Axyra Sheets'
excerpt: 'Read large Excel files efficiently in C# and .NET with Axyra Sheets. Load a workbook once, extract ranges in bulk, and process rows in bounded async batches.'
permalink: /axyra/sheets/dotnet/guides/read-large-excel-files-efficiently-csharp
redirect_from:
  - /axyra/dotnet/guides/read-large-excel-files-efficiently-csharp
keyword: 'read large Excel files in C#'
sidebar:
  nav: "axyra-dotnet-guides"
---

# Read Large Excel Files Efficiently in C# with Axyra Sheets

Importing a transaction history or inventory report can mean processing hundreds of thousands of Excel rows. The application needs to read the required fields, validate each row, and send the results to a database or another service without retaining unnecessary copies of the data.

This guide uses Axyra Sheets to implement a practical approach in C#: open the workbook once, read data in bulk, and process manageable row batches. It explains how to choose a batch size, handle numeric data, keep the import asynchronous, and measure the time and memory used by the complete import.

## TL;DR

- Open the workbook once and identify the worksheet and data range required by the import.
- Use `CellRange.GetValues()` to read mixed cell values in bulk, or `CellRange.GetNumbers()` for a known numeric matrix.
- Process one row batch at a time instead of retaining all extracted rows in a list.
- Dispose the workbook with `using` after extraction, and limit how many files are processed concurrently.
- Measure file opening, extraction, validation, and destination writes separately before deciding what to optimize.

## Table of contents

- [What approach should you use for a large Excel import?](#what-approach-should-you-use-for-a-large-excel-import)
- [How do you read and process rows in batches?](#how-do-you-read-and-process-rows-in-batches)
- [When should you use a numeric bulk read?](#when-should-you-use-a-numeric-bulk-read)
- [How do you control memory and concurrency?](#how-do-you-control-memory-and-concurrency)
- [How should you benchmark the import?](#how-should-you-benchmark-the-import)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## What approach should you use for a large Excel import?

A slow Excel import may spend time parsing the file, extracting values, validating rows, or writing to the destination. Reading unused data, retaining duplicate records, and making a database or network call for every row can all add overhead. Measure these stages separately so you can improve the part that takes the most time.

For the example below, open the workbook once and read rectangular blocks of rows. Process each block before reading the next one, and use batched writes if the destination supports them. This keeps temporary processing data manageable and avoids repeating setup work for each row.

With Axyra Sheets, `Workbook.OpenAsync(...)` opens the workbook on the thread pool and `CellRange.GetValues()` returns a block of typed cell values as `CellValue[,]`. The application can then validate those values and map them to records. The example uses 5,000 rows per batch as a starting point.

## How do you read and process rows in batches?

This reader opens a worksheet by name and passes each batch to an asynchronous callback, so the callback can `await` a database or HTTP write before the next batch is read. The first row of the used range is treated as a header; the table does not have to begin at A1. If the worksheet contains report titles or notes above the table, locate the header explicitly before reading the data rows.

```csharp
using Axyra.Sheets;

public static class LargeSheetReader
{
    private const int RowBatchSize = 5_000;

    public static async Task ReadAsync(string input, string sheetName,
        Func<CellValue[,], CancellationToken, Task> processBatch,
        CancellationToken cancellationToken = default)
    {
        using Workbook wb = await Workbook.OpenAsync(input, cancellationToken: cancellationToken);
        Sheet sheet = wb.Sheets[sheetName];
        if (sheet.SheetType != SheetType.Worksheet)
        {
            throw new ArgumentException($"{sheetName} is not a worksheet", nameof(sheetName));
        }
        CellRange? used = sheet.UsedRange;
        if (used == null || used.RowCount < 2)
        {
            return;
        }

        int firstDataRow = used.FirstRow + 1;
        int lastDataRow = used.LastRow;
        int firstColumn = used.FirstColumn;
        int lastColumn = used.LastColumn;

        for (int start = firstDataRow; start <= lastDataRow; start += RowBatchSize)
        {
            int end = Math.Min(start + RowBatchSize - 1, lastDataRow);
            CellValue[,] rows = sheet.GetRange(start, firstColumn, end, lastColumn).GetValues();
            await processBatch(rows, cancellationToken);
        }
    }
}
```

Call it with the batch handler of your import, for example one that validates the rows and writes them in one database round trip:

```csharp
await LargeSheetReader.ReadAsync("transactions.xlsx", "Transactions",
    async (rows, ct) =>
    {
        List<Transaction> accepted = Validate(rows);
        await repository.InsertBatchAsync(accepted, ct);
    },
    cancellationToken);
```

Start with a few thousand rows per batch, then measure. Small batches require more read calls; large batches create larger temporary arrays. Adjust the row count for the number of columns and the memory available to the application.

Batching limits the temporary arrays and records created during extraction. The workbook itself remains open in memory, so the process still needs enough memory for the workbook model.

The callback runs once per batch. Use it to validate the rows, map the fields your application needs, and write accepted records to the destination. Complete that work before returning, and avoid adding every batch to a shared list. For database imports, choose transaction boundaries according to your all-or-nothing or partial-import policy.

The workbook stays in use by one logical flow: the reader does not touch it while the callback is awaited, so continuing on another thread-pool thread after an `await` is fine. What is not allowed is two threads calling into the same workbook at once.

## When should you use a numeric bulk read?

For mixed business data such as product codes, dates, and amounts, `GetValues()` preserves the cell types needed for validation. For a known numeric matrix, such as a block of measurements, `CellRange.GetNumbers()` returns a `double[,]` without creating `CellValue` objects:

```csharp
CellRange amounts = sheet["D2:F50001"];
double[,] values = amounts.GetNumbers();

for (int rowOffset = 0; rowOffset < values.GetLength(0); rowOffset++)
{
    for (int columnOffset = 0; columnOffset < values.GetLength(1); columnOffset++)
    {
        double value = values[rowOffset, columnOffset];
        if (!double.IsNaN(value))
        {
            ConsumeNumber(rowOffset, columnOffset, value);
        }
    }
}
```

`GetNumbers()` returns `double.NaN` for blanks, text, booleans, and error cells. Use it only when that behavior fits the data contract. For mixed business rows, `GetValues()` is clearer and safer.

## How do you control memory and concurrency?

Keep only the data needed for the current processing step, dispose resources promptly, and limit parallel imports. With Axyra, the open workbook uses native memory outside the .NET garbage-collected heap, while extracted arrays and application records live on the managed heap. Size the process for both:

- Open the workbook as late as possible and dispose it as soon as extraction ends.
- Do not cache `Workbook`, `Sheet`, `CellRange`, or `Cell` objects, for example in a singleton service.
- Do not keep every batch in a list. Map and release one batch at a time.
- Do not share one workbook across threads. A workbook can be used by one thread at a time; a second concurrent call throws `AxyraException` ("workbook is already in use").
- If several independent files must be imported in parallel, give each task its own workbook and cap concurrency according to memory measurements.

`Parallel.ForEachAsync` expresses that cap directly. Each file gets its own workbook inside `ReadAsync`:

```csharp
var options = new ParallelOptions
{
    MaxDegreeOfParallelism = 2,      // measured: two open workbooks fit the memory budget
    CancellationToken = cancellationToken,
};

await Parallel.ForEachAsync(files, options, async (file, ct) =>
{
    await LargeSheetReader.ReadAsync(file, "Transactions", ImportBatchAsync, ct);
});
```

File format can affect opening time and memory use. If your workflow accepts several formats, compare representative files in each format before choosing one for intermediate storage.

## How should you benchmark the import?

Measure the complete path, not just the loop. Record at least:

- file format, file size, sheet dimensions, and formula density;
- open time, extraction time, validation time, and database-write time;
- peak process memory, including native memory (the process working set or `dotnet-counters`, not only `GC.GetTotalMemory`);
- Axyra version, .NET runtime version, operating system, and CPU architecture.

A `Stopwatch` around each stage is enough to start:

```csharp
using System.Diagnostics;

var clock = Stopwatch.StartNew();
using Workbook wb = await Workbook.OpenAsync("transactions.xlsx", cancellationToken: cancellationToken);
TimeSpan openTime = clock.Elapsed;

clock.Restart();
CellValue[,] block = wb.Sheets["Transactions"].UsedRange!.GetValues();
TimeSpan extractTime = clock.Elapsed;

long workingSet = Environment.WorkingSet;   // sample it after each stage
Console.WriteLine($"open {openTime.TotalMilliseconds:F0} ms, extract {extractTime.TotalMilliseconds:F0} ms, working set {workingSet / 1_048_576} MB");
```

Compare per-cell and bulk access using the same range and data. Start with a small sample, then test the recommended approach on representative full-size files. Repeat the test and record the timings for each processing stage.

On a sheet with 20,000 rows and 40,000 formulas, reading the block with `GetValues()` was several times faster than reading each cell's `Value` in a loop, and the gap grows with the number of cells. Test with your own files to measure the effect of row count, column count, and cell types on extraction time.

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| The import takes minutes although the sheet is modest | One `Value` read per cell | Read a rectangle with `CellRange.GetValues()` |
| Memory keeps rising between requests | Workbooks are not disposed, or batches are retained | Use `using` and release each batch |
| `NullReferenceException` on an empty sheet | `UsedRange` returned `null` | Check for `null` before reading coordinates or values |
| The managed heap looks healthy but the container is OOM-killed | Native workbook memory is outside the GC heap | Limit concurrent open workbooks and dispose promptly |
| Parallel tasks throw "workbook is already in use" | One workbook is shared across threads | Open a separate workbook per task |
| A numeric fast path silently skips text or errors | `GetNumbers()` maps non-numbers to `NaN` | Use `GetValues()` when types are mixed |

## FAQ

### Does reading in batches reduce memory use?

It reduces the temporary arrays and records held during extraction, provided each batch is processed and released before the next one is retained. In this Axyra example, the workbook remains loaded while the batches are read, so batching does not remove the memory needed for the workbook itself.

### How should C# process a very large existing Excel file?

Open the file once, read the required data in manageable batches, validate and process each batch, then dispose the workbook. Test representative files under the memory and concurrency limits of the deployment environment. The example above implements this workflow with Axyra Sheets.

### What batch size should I use?

There is no universal value. Start around 2,000 to 10,000 rows, measure extraction time and peak memory, then adjust. Column count and cell types matter as much as row count.

### Is `GetValues()` always better than `GetNumbers()`?

No. `GetValues()` preserves all six `CellValue` variants and is best for mixed rows. `GetNumbers()` is faster and smaller for a known numeric matrix, but nonnumeric cells become `NaN`.

### Can I read one workbook from several threads?

No. Keep one workbook on one thread at a time. Independent workbooks can be processed in parallel, subject to a concurrency limit based on memory.

### Does raising the GC heap limit solve large workbook failures?

Not necessarily. The workbook model uses native memory outside the managed heap, so settings such as `GCHeapHardLimit` do not cover it, and a container memory limit must leave room for both. Prompt disposal and bounded concurrency are still required.

### Does Axyra parse the file incrementally from a stream?

No. `Workbook.Open(stream, format)` reads the whole stream into memory first and then parses it; there is no incremental streaming parse. For very large *exports*, the forward-only `StreamWorkbook` writer keeps memory flat; see [How to Write Data to Excel in C#]({{ site.axyra_dotnet }}/guides/write-data-to-excel-csharp).

## Next steps

- [How to Read an Excel File in C#]({{ site.axyra_dotnet }}/guides/read-excel-file-csharp) covers the complete basic read flow.
- [Cells and Ranges]({{ site.axyra_dotnet_devref }}/Cell_and_Range) documents bulk values, numbers, and range coordinates.
- [Read Excel Cell Values in C# with Axyra Sheets]({{ site.axyra_dotnet }}/guides/read-excel-cell-values-csharp) continues with strings, numbers, dates, blanks, and errors.
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_sheets }}/contact-sales), and [product details]({{ site.axyra_site_link }}).
