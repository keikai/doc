---
title: 'Read and Write Files (.NET)'
permalink: /axyra/sheets/dotnet/quick-start/read_write
redirect_from:
  - /axyra/dotnet/quick-start/read_write
---

Open, read, modify, and save Excel files with Axyra Sheets for .NET.

# Open a file

```csharp
using Axyra.Sheets;

using Workbook wb = Workbook.Open("report.xlsx");
Console.WriteLine($"{wb.Sheets.Count} sheets");
foreach (Sheet sheet in wb.Sheets)
{
    Console.WriteLine("  " + sheet.Name);
}
```

The format is detected from the file extension. XLSX, XLSM, XLSB, XLS (BIFF8), ODS, CSV,
and JSON all open through the same call — see
[Supported Formats]({{ site.axyra_dotnet_devref }}/Supported_Formats). Paths are
plain strings, resolved against the current directory.

Evaluation note: Files saved in Evaluation Mode include an Axyra Evaluation Copy sheet. When working with evaluated output, prefer looking up sheets by name (`wb.Sheets["Q3"]`) rather than relying on sheet position.

For an encrypted workbook, pass the password in `OpenOptions`:

```csharp
using Axyra.Sheets.IO;

using Workbook wb = Workbook.Open("secret.xlsx", new OpenOptions { Password = "pa55w0rd" });
```

# Open from memory or a stream

Useful when the file arrives over HTTP or out of a database. The format is
explicit here, because there is no file name to infer it from:

```csharp
byte[] bytes = LoadFromDatabase();
using (Workbook wb = Workbook.Open(bytes, WorkbookFormat.Xlsx)) { /* ... */ }

using (Stream input = upload.OpenReadStream())          // e.g. an ASP.NET Core IFormFile
using (Workbook wb = Workbook.Open(input, WorkbookFormat.Xlsx)) { /* ... */ }
```

`Open(Stream, …)` reads the rest of the stream into memory first and leaves the
stream open; closing it is up to you.

## Without blocking a thread

In a web application or a UI, use the asynchronous form. The engine parses the
file on the thread pool, so the request or UI thread is free in the meantime:

```csharp
using Workbook wb = await Workbook.OpenAsync("report.xlsx", cancellationToken: ct);
```

The engine parses a file in one call that cannot be interrupted, so the
`CancellationToken` is observed before the read starts and after it ends.

# Edit

```csharp
Sheet sheet = wb.Sheets["Q3"];

// A single cell
sheet[4, 2].Value = 1499.0;

// A whole block, in one native call
CellRange block = sheet["B2:D50"];
block.SetNumbers(new double[3 * 49]);   // row-major, 3 × 49 values

// Structure
sheet.Rows.Insert(10, 3);
sheet.Columns.Delete(7, 1);
sheet.Columns[0].Width = 24.0;
sheet.FreezePanes(1, 0);
```

Prefer the `CellRange` bulk members (`SetValues`, `SetNumbers`, `SetFormulas`) over
per-cell loops. Each `Cell` read or write crosses into the native engine; a
`CellRange` call crosses once for the whole block.

# Recalculate

Every edit recalculates the formulas that depend on it, so values you read back
are normally current without any extra call. Saving does not recalculate.

Formulas in an opened file that your edits did not touch keep the results the
file was saved with. Call `Recalculate()` once, before reading or saving, when
those cached results may be stale (a file written by another tool), when the
workbook uses volatile functions such as `NOW()` or `RAND()`, or when the
workbook is in `CalcMode.Manual`:

```csharp
wb.Recalculate();        // the whole workbook; once, not inside a loop
```

You can also evaluate an expression without storing it anywhere:

```csharp
CellValue answer = wb.Evaluate("SUM(Q3!B2:B50)");
```

# Save

```csharp
wb.Save("report-edited.xlsx");
```

Saving to a different format is a matter of the extension, or of the sink:

```csharp
wb.Save("report.csv");                                              // by extension
byte[] xlsb = wb.ToByteArray(WorkbookFormat.Xlsb);                  // to memory
wb.Save(output, WorkbookFormat.Xlsx);                               // to a stream
wb.Save("report.xlsx", new SaveOptions { Password = "pa55w0rd" });  // encrypted
```

In ASP.NET Core, where synchronous writes to the response are not allowed, use
`SaveAsync`:

```csharp
await wb.SaveAsync(response.Body, WorkbookFormat.Xlsx, cancellationToken: ct);
```

`SaveOptions` controls what goes into an XLSX — most usefully, whether formulas
are written at all:

```csharp
using Axyra.Sheets.IO;

wb.Save("report.xlsx", new SaveOptions
{
    FormulaPolicy = FormulaPolicy.ValuesOnly,   // Keep | Blank | ValuesOnly
    SkipComments = true,
    SkipHyperlinks = true,
});
```

`ValuesOnly` writes each formula's last calculated result instead of the
formula, which is what you want when the recipient should not see how a number
was derived. Recalculate first if any of the cases above applies, or you will
write stale values. `SaveOptions` is a record, so `options with { SkipComments = false }`
copies it with one change.

# What survives a round trip

Axyra Sheets preserves parts of a workbook it does not itself model — the
so-called *verbatim* parts — so that opening and saving a file does not silently
discard features. VBA modules, custom XML parts, unknown extension lists, and
OLE embeddings are carried through unchanged.

That said, a round trip is not byte-identical: the engine rewrites the parts it
does understand. If you need to prove that a specific feature survives for your
files, test it against your files.

{: .notice--info}
**Runnable example:** [`Tutorial/ReadWriteExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/Tutorial/ReadWriteExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- tutorial/read-write`.

# Next

- [Render to PDF and Images]({{ site.axyra_dotnet_tutorial }}/render)
- [Import and Export]({{ site.axyra_dotnet_devref }}/Import_and_Export) — per-format
  behavior and options
- [Streaming Large Files]({{ site.axyra_dotnet_devref }}/Streaming) — for sheets too
  large to hold in memory
