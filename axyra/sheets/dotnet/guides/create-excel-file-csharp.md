---
title: 'How to Create an Excel File in C#'
permalink: /axyra/sheets/dotnet/guides/create-excel-file-csharp
redirect_from:
  - /axyra/dotnet/guides/create-excel-file-csharp
---

Creating an Excel file in C# lets .NET applications deliver sales summaries,
inventory lists, and other business data in a format people can review and
edit. In this guide, we’ll use Axyra Sheets for .NET to build an XLSX sales
report from scratch, with headers, numeric data, formulas, number formatting,
and a frozen header row. The steps come together in a complete program that
saves a workbook you can open in Excel. No Excel installation and no Office
interop are involved.

**Already know the object model?** The
[Quick Start](/axyra/sheets/dotnet/quick-start/quick_start) is the shorter version.
This guide is the longer one, and it produces a file you would be willing to send
to someone.

# What you need

- **.NET 8 or later.** The package targets `net8.0` and `net10.0`.
- **The NuGet package.** Native engine libraries for the supported platforms
  (Windows x64, Linux x64/arm64, macOS arm64/x64) are bundled in the package, so
  there is nothing else to install.

The package is served from ZK’s evaluation feed rather than nuget.org. Register
the feed in a `nuget.config` next to your solution or project file:


```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="axyra-eval" value="https://mavensync.zkoss.org/eval/nuget/index.json" />
  </packageSources>
</configuration>
```


Then add the package. The feed holds prerelease builds only, so pass
`--prerelease` (or name an exact version with `--version`):


```sh
dotnet new console -n CreateExcelFile
cd CreateExcelFile
dotnet add package Axyra.Sheets --prerelease
```


nuget.org stays available alongside the feed. See
[Installation](/axyra/sheets/dotnet/dev-ref/Installation) for licensed (non-evaluation)
packages installed from a local folder.

# Step 1 — Create the workbook

`new Workbook()` gives you an empty workbook. Add the first sheet explicitly and
keep the returned view:


```csharp
using Axyra.Sheets;

using Workbook wb = new Workbook();
Sheet sheet = wb.Sheets.Add("Q3 Sales");
// ...
```


`Workbook` implements `IDisposable` and owns native memory that the garbage
collector cannot see, so the `using` declaration is not optional. A workbook you
forget to dispose is eventually released by its finalizer, but native memory does
not count toward the GC’s heuristics, so “eventually” can be a long time in a
busy service. See [Workbook and Sheet](/axyra/sheets/dotnet/dev-ref/Workbook_and_Sheet)
for the full lifecycle.

**Rows and columns are 0-based; formulas are not.** `sheet[0, 0]` is `A1`, so the
cell at row index 1 is row **2** in a formula. This trips up everyone once.

# Step 2 — Write the header and the data

Set a whole block in one call rather than looping cell by cell. Each `CellRange`
call crosses into the native engine once for the entire block; a per-cell loop
crosses it once per cell.


```csharp
sheet["A1:D1"].SetValues(new object?[,]
{
    { "Region", "Q1", "Q2", "Total" },
});

sheet["A2:C4"].SetValues(new object?[,]
{
    { "APAC",     1200, 1450 },
    { "EMEA",      980, 1100 },
    { "Americas", 1610, 1720 },
});
```


`SetValues` takes a rectangular `[row, column]` array whose shape must match the
range, or it throws `ArgumentException`. Plain .NET values convert as you would
expect: numbers become numeric cells, strings become text, `bool` becomes a
boolean, and `null` clears the cell. When every value is numeric,
`SetNumbers(double[,])` is faster still: primitive doubles, no boxing and no
per-cell objects. That is the path to use when the data comes out of a database;
see [Cells and Ranges](/axyra/sheets/dotnet/dev-ref/Cell_and_Range#bulk-access-and-performance).

# Step 3 — Add formulas

Write the per-row total into column D, and a grand total underneath the data.


```csharp
sheet["D2:D4"].SetFormula("B2+C2");          // D3 = B3+C3, D4 = B4+C4

sheet[4, 0].Value = "Total";
sheet["B5:D5"].SetFormula("SUM(B2:B4)");     // C5 = SUM(C2:C4), D5 = SUM(D2:D4)
```


`CellRange.SetFormula` on a multi-cell range fills it the way Excel’s Ctrl+Enter
does: the formula text is written for the top-left cell, and relative references
shift for every other cell, while `$`-anchored references stay fixed. Formula
text has no leading `=`. `CellRange.CopyTo` and `CellRange.AutoFill` shift
references the same way when you copy an existing formula.

Do not fill a range with a formula that spills, such as `SEQUENCE(5)`: every cell
becomes its own dynamic-array anchor and shows `#SPILL!`. Put a spilling formula
in a single cell.

**Formulas are calculated as you write them.** Each write recalculates the
cells that depend on it, so `D5` already holds `8060` here and the saved file
carries that result. Saving itself does not recalculate: call `wb.Recalculate()`
once before saving only when results can be stale — in `CalcMode.Manual`, or
for untouched formulas in a workbook you opened.

# Step 4 — Style it

Styles are immutable `record`s, built once with an object initializer and
applied to a range.


```csharp
using Axyra.Sheets.Style;

var header = new CellStyle
{
    Font = new() { Bold = true, Color = Color.White },
    Fill = Color.FromRgb(0x2F, 0x55, 0x97),
    HorizontalAlignment = HorizontalAlignment.Center,
    Borders = Borders.Around(BorderStyle.Thin, Color.FromRgb(0x1F, 0x38, 0x64)),
};

var money = new CellStyle { NumberFormat = "#,##0.00" };

var totalRow = new CellStyle
{
    Font = new() { Bold = true },
    NumberFormat = "#,##0.00",
};

sheet["A1:D1"].Style = header;
sheet["B2:D4"].Style = money;
sheet["A5:D5"].Style = totalRow;
```


`NumberFormat` takes an Excel format code, so anything valid in Excel’s *Format
Cells* dialog works here — `"#,##0.00"`, `"0.0%"`, `"yyyy-mm-dd"`, and
conditional sections such as `"#,##0.00;[Red]-#,##0.00"`. See
[Styles and Formats](/axyra/sheets/dotnet/dev-ref/Styles).

Assigning a style replaces the cell’s whole style; a property you leave out takes
the engine default. To change one attribute of an existing style, copy it with
`with`: `sheet["A1"].Style = sheet["A1"].Style with { WrapText = true };`.

If you also reference `System.Drawing`, alias the color type with
`using Color = Axyra.Sheets.Style.Color;`.

If the same style repeats across sheets, register it once by name and apply it by
name:


```csharp
wb.RegisterNamedStyle("Currency", money);
sheet["B2:D4"].ApplyNamedStyle("Currency");
```


# Step 5 — Column widths and a frozen header


```csharp
sheet.Columns[0].Width = 14.0;   // Excel character units
for (int col = 1; col <= 3; col++)
{
    sheet.Columns[col].AutoFit();
}
sheet.FreezePanes(1, 0);         // keep row 1 visible while scrolling
```


Column width is in Excel’s character units (the width of the `0` glyph in the
default font), not points — row height (`sheet.Rows[0].Height`) is the one
measured in points. `AutoFit` sizes the column to the formatted text of its
cells, so call it after you apply number formats, as here.

# Step 6 — Save

The format comes from the file extension.


```csharp
wb.Save("q3-sales.xlsx");
```


To send the file straight to an HTTP response or into object storage instead,
skip the disk entirely. `ToByteArray` returns the bytes, and the `Stream`
overloads write to any writable stream and leave it open:


```csharp
byte[] bytes = wb.ToByteArray(WorkbookFormat.Xlsx);
await wb.SaveAsync(stream, WorkbookFormat.Xlsx);
```


In an ASP.NET Core minimal API, for example, return the bytes as a file result:


```csharp
app.MapGet("/reports/q3-sales.xlsx", () =>
{
    using Workbook wb = new Workbook();
    Sheet sheet = wb.Sheets.Add("Q3 Sales");
    // ... fill and style the sheet as above ...
    return Results.File(wb.ToByteArray(WorkbookFormat.Xlsx),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "q3-sales.xlsx");
});
```


`.xls`, `.xlsb`, `.ods`, `.csv`, and `.json` all work the same way — see
[Supported Formats](/axyra/sheets/dotnet/dev-ref/Supported_Formats) for what each one
can carry.

# The complete program

Put this in `Program.cs` of the console project from [What you need](#what-you-need):


```csharp
using Axyra.Sheets;
using Axyra.Sheets.Style;

using Workbook wb = new Workbook();
Sheet sheet = wb.Sheets.Add("Q3 Sales");

// Header and data, one call each.
sheet["A1:D1"].SetValues(new object?[,]
{
    { "Region", "Q1", "Q2", "Total" },
});
sheet["A2:C4"].SetValues(new object?[,]
{
    { "APAC",     1200, 1450 },
    { "EMEA",      980, 1100 },
    { "Americas", 1610, 1720 },
});

// Per-row totals, then a grand-total row. References shift per cell.
sheet["D2:D4"].SetFormula("B2+C2");
sheet[4, 0].Value = "Total";
sheet["B5:D5"].SetFormula("SUM(B2:B4)");

// Styling.
var header = new CellStyle
{
    Font = new() { Bold = true, Color = Color.White },
    Fill = Color.FromRgb(0x2F, 0x55, 0x97),
    HorizontalAlignment = HorizontalAlignment.Center,
    Borders = Borders.Around(BorderStyle.Thin, Color.FromRgb(0x1F, 0x38, 0x64)),
};
var money = new CellStyle { NumberFormat = "#,##0.00" };
var totalRow = new CellStyle
{
    Font = new() { Bold = true },
    NumberFormat = "#,##0.00",
};

sheet["A1:D1"].Style = header;
sheet["B2:D4"].Style = money;
sheet["A5:D5"].Style = totalRow;

// Layout.
sheet.Columns[0].Width = 14.0;
for (int col = 1; col <= 3; col++)
{
    sheet.Columns[col].AutoFit();
}
sheet.FreezePanes(1, 0);

wb.Save("q3-sales.xlsx");
Console.WriteLine("wrote q3-sales.xlsx");
```


Run it with `dotnet run`. Open `q3-sales.xlsx` and you get a header row in white
on blue, three data rows with thousands separators and two decimals, a bold total
row, and a header that stays put when you scroll.

A runnable copy of this program is in the .NET examples project:
`src/Axyra.Sheets.Examples/Guides/CreateExcelFileExample.cs`, run with
`dotnet run --project src/Axyra.Sheets.Examples -- guides/create-excel-file`.

**Evaluation builds add a notice sheet.** Without a license, every saved workbook
gets an extra **Axyra Evaluation Copy** sheet at index 0. Look sheets up by name
(`wb.Sheets["Q3 Sales"]`) rather than by index when you reopen a saved file. See
[Licensing and Evaluation](/axyra/sheets/dotnet/dev-ref/License).

# Common mistakes

| Symptom | Cause |
| --- | --- |
| Computed cells are stale in the saved file | The workbook is in `CalcMode.Manual`, or formulas in an opened file were not touched. Saving does not recalculate; call `Recalculate()` once before saving. |
| The formula refers to the wrong row | Indices are 0-based, A1 references are 1-based. Row index 1 is row `2`. |
| A filled range shows `#SPILL!` | A spilling (dynamic-array) formula was written into a multi-cell range. Put it in a single cell. |
| `ArgumentException` from `SetValues` | The array’s shape does not match the range. A `"A2:C4"` range needs a `[3, 3]` array. |
| Native memory grows over time in a service | A `Workbook` escaped its `using`. Dispose every one. |
| `ObjectDisposedException` on a `Sheet` or `CellRange` | The workbook was already disposed. These are views, not copies. |
| `TypeInitializationException` wrapping `DllNotFoundException` in a container but not locally | The image was built for a different runtime identifier, or a trimmed/single-file publish left the native library out. Publish for the target RID and see [Native Library Loading](/axyra/sheets/dotnet/dev-ref/Native_Loader). |

# Next steps

- [How to Write Data to Excel in C#](/axyra/sheets/dotnet/guides/write-data-to-excel-csharp) —
  populate a sheet from a list, a database, or JSON instead of literals
- [How to Convert Excel to PDF in C#](/axyra/sheets/dotnet/guides/convert-excel-to-pdf-csharp) —
  render what you just built
- [Cells and Ranges](/axyra/sheets/dotnet/dev-ref/Cell_and_Range) — the full data-access API
- [Styles and Formats](/axyra/sheets/dotnet/dev-ref/Styles) — fonts, fills, borders, number formats
- **Explore Axyra Sheets** — See [live demos](https://keikai.io/axyra/demo/), [pricing](/axyra/sheets/contact-sales), and [product details](https://keikai.io/axyra).

# Beyond Your First Excel File

Once you can create and format a workbook, you can connect it to live
application data and build reports with multiple sheets, charts, and pivot
tables. Axyra Sheets can also render the workbook as PDF or images, giving you
both an editable Excel file and a version for sharing or previewing. The same
workbook creation steps can become part of an ASP.NET Core download endpoint or
a scheduled background job.
