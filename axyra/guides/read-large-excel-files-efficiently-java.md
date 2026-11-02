---
title: 'Read Large Excel Files Efficiently in Java with Axyra Sheets'
excerpt: 'Read large Excel files efficiently in Java with Axyra Sheets. Load a workbook once, extract ranges in bulk, and process rows in bounded batches.'
permalink: /axyra/guides/read-large-excel-files-efficiently-java
keyword: 'read large Excel files in Java'
---

# Read Large Excel Files Efficiently in Java with Axyra Sheets

Importing a transaction history or inventory report can mean processing hundreds of thousands of Excel rows. The application needs to read the required fields, validate each row, and send the results to a database or another service without retaining unnecessary copies of the data.

This guide uses Axyra Sheets to implement a practical approach in Java: open the workbook once, read data in bulk, and process manageable row batches. It explains how to choose a batch size, handle numeric data, and measure the time and memory used by the complete import.

## TL;DR

- Open the workbook once and identify the worksheet and data range required by the import.
- Use `Range.values()` to read mixed cell values in bulk, or `Range.numbers()` for a known numeric matrix.
- Process one row batch at a time instead of retaining all extracted rows in a list.
- Use try-with-resources to close the workbook after extraction, and limit how many files are processed concurrently.
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

With Axyra Sheets, `Workbook.open(...)` opens the workbook and `Range.values()` returns a block of typed cell values as `CellValue[][]`. The application can then validate those values and map them to records. The example uses 5,000 rows per batch as a starting point.

## How do you read and process rows in batches?

This reader opens a worksheet by name and passes each batch to a `Consumer` for processing. The first row of the used range is treated as a header; the table does not have to begin at A1. If the worksheet contains report titles or notes above the table, locate the header explicitly before reading the data rows.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Range;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.SheetType;
import io.keikai.axyra.sheets.Workbook;

import java.nio.file.Path;
import java.util.function.Consumer;

public final class LargeSheetReader {
    private static final int ROW_BATCH_SIZE = 5_000;

    public static void read(Path input, String sheetName,
                            Consumer<CellValue[][]> consumer) {
        try (Workbook wb = Workbook.open(input)) {
            Sheet sheet = wb.sheet(sheetName);
            if (sheet.sheetType() != SheetType.WORKSHEET) {
                throw new IllegalArgumentException(
                        sheetName + " is not a worksheet");
            }
            Range used = sheet.usedRange();
            if (used == null || used.rowCount() < 2) {
                return;
            }

            int firstDataRow = used.firstRow() + 1;
            int lastDataRow = used.lastRow();
            int firstColumn = used.firstColumn();
            int lastColumn = used.lastColumn();

            for (int start = firstDataRow; start <= lastDataRow;
                 start += ROW_BATCH_SIZE) {
                int end = Math.min(start + ROW_BATCH_SIZE - 1, lastDataRow);
                CellValue[][] rows = sheet
                        .range(start, firstColumn, end, lastColumn)
                        .values();
                consumer.accept(rows);
            }
        }
    }
}
```

Start with a few thousand rows per batch, then measure. Small batches require more read calls; large batches create larger temporary arrays. Adjust the row count for the number of columns and the memory available to the application.

Batching limits the temporary arrays and records created during extraction. The workbook itself remains open in memory, so the process still needs enough memory for the workbook model.

The consumer runs once per batch. Use it to validate the rows, map the fields your application needs, and write accepted records to the destination. Complete that work before returning, and avoid adding every batch to a shared list. For database imports, choose transaction boundaries according to your all-or-nothing or partial-import policy.

## When should you use a numeric bulk read?

For mixed business data such as product codes, dates, and amounts, `values()` preserves the cell types needed for validation. For a known numeric matrix, such as a block of measurements, `Range.numbers()` returns a flat row-major `double[]` without creating `CellValue` objects:

```java
Range amounts = sheet.range("D2:F50001");
double[] values = amounts.numbers();
int columns = amounts.colCount();

for (int i = 0; i < values.length; i++) {
    int rowOffset = i / columns;
    int columnOffset = i % columns;
    double value = values[i];
    if (!Double.isNaN(value)) {
        consumeNumber(rowOffset, columnOffset, value);
    }
}
```

`numbers()` returns `NaN` for blanks, text, booleans, and error cells. Use it only when that behavior fits the data contract. For mixed business rows, `values()` is clearer and safer.

## How do you control memory and concurrency?

Keep only the data needed for the current processing step, close resources promptly, and limit parallel imports. With Axyra, the open workbook uses native memory outside the Java heap, while extracted arrays and application records also use heap space. Size the process for both:

- Open the workbook as late as possible and close it as soon as extraction ends.
- Do not cache `Workbook`, `Sheet`, `Range`, or `Cell` objects.
- Do not keep every batch in a list. Map and release one batch at a time.
- Do not share one workbook across threads. A workbook can be used by one thread at a time.
- If several independent files must be imported in parallel, give each task its own workbook and cap concurrency according to memory measurements.

File format can affect opening time and memory use. If your workflow accepts several formats, compare representative files in each format before choosing one for intermediate storage.

## How should you benchmark the import?

Measure the complete path, not just the loop. Record at least:

- file format, file size, sheet dimensions, and formula density;
- open time, extraction time, validation time, and database-write time;
- peak process memory, including native memory;
- Axyra version, JVM version, operating system, and CPU architecture.

Compare per-cell and bulk access using the same range and data. Start with a small sample, then test the recommended approach on representative full-size files. Repeat the test and record the timings for each processing stage.

An Axyra benchmark using a workbook with 20,000 rows and 40,000 formulas measured `Range.values()` at about eight times the speed of per-cell reads. Test with your own files to measure the effect of row count, column count, and cell types on extraction time.

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| The import takes minutes although the sheet is modest | One `value()` call per cell | Read a rectangle with `Range.values()` |
| Memory keeps rising between requests | Workbooks are not closed, or batches are retained | Use try-with-resources and release each batch |
| The code fails on an empty sheet | `usedRange()` returned `null` | Check for `null` before reading coordinates or values |
| The Java heap looks healthy but the process is killed | Native workbook memory is outside `-Xmx` | Limit concurrent open workbooks and close promptly |
| Parallel tasks throw "workbook is already in use" | One workbook is shared across threads | Open a separate workbook per task |
| A numeric fast path silently skips text or errors | `numbers()` maps non-numbers to `NaN` | Use `values()` when types are mixed |

## FAQ

### Does reading in batches reduce memory use?

It reduces the temporary arrays and records held during extraction, provided each batch is processed and released before the next one is retained. In this Axyra example, the workbook remains loaded while the batches are read, so batching does not remove the memory needed for the workbook itself.

### How should Java process a very large existing Excel file?

Open the file once, read the required data in manageable batches, validate and process each batch, then close the workbook. Test representative files under the memory and concurrency limits of the deployment environment. The example above implements this workflow with Axyra Sheets.

### What batch size should I use?

There is no universal value. Start around 2,000 to 10,000 rows, measure extraction time and peak memory, then adjust. Column count and cell types matter as much as row count.

### Is `Range.values()` always better than `Range.numbers()`?

No. `values()` preserves all six `CellValue` variants and is best for mixed rows. `numbers()` is faster and smaller for a known numeric matrix, but nonnumeric cells become `NaN`.

### Can I read one workbook from several threads?

No. Keep one workbook on one thread. Independent workbooks can be processed in parallel, subject to a concurrency limit based on memory.

### Does increasing `-Xmx` solve large workbook failures?

Not necessarily. The workbook model uses native memory outside the Java heap. Heap sizing can help your own records and arrays, but prompt closure and bounded concurrency are still required.

## Next steps

- [How to Read an Excel File in Java]({{ site.axyra_guides }}/read-excel-file-java) covers the complete basic read flow.
- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range) documents `values()`, `numbers()`, and range coordinates.
- [Read Excel Cell Values in Java with Axyra Sheets]({{ site.axyra_guides }}/read-excel-cell-values-java) continues with strings, numbers, dates, blanks, and errors.
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_site_link }}/java#pricing), and [product details]({{ site.axyra_site_link }}).
