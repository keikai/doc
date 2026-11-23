---
title: 'Workbook and Sheet (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Workbook_and_Sheet
redirect_from:
  - /axyra/dotnet/dev-ref/Workbook_and_Sheet
---

`Workbook` is the root of the object model and the owner of the native handle.
Everything else — sheets, ranges, cells, content objects — is reached from it,
and is only valid while it is open.

# Lifecycle

```csharp
using (Workbook wb = new Workbook())
{
    // ...
}
```

`Workbook` implements `IDisposable`. Disposing it releases the native memory
holding the entire book; `Dispose()` is idempotent. **Any `Sheet`, `CellRange`, or
`Cell` obtained from a workbook becomes invalid once it is disposed** — these are
lightweight views onto the native model, not detached copies — and using one
afterwards throws `ObjectDisposedException`. Do not let them escape the `using`
block.

The garbage collector cannot see the native memory a workbook holds, so a
long-running service that opens workbooks per request must dispose every one of
them. A workbook you forget is released when it is finalized, but that can be
much later than you expect.

## Creating and opening

| Call | Purpose |
|---|---|
| `new Workbook()` | An empty workbook with no sheets — add one with `wb.Sheets.Add` |
| `new Workbook(WorkbookStorage.Columnar)` | Empty, using the columnar storage backend — see [Streaming]({{ site.axyra_dotnet_devref }}/Streaming) |
| `Workbook.Open(string path)` | Open a file; format inferred from the extension |
| `Workbook.Open(path, new OpenOptions { Password = … })` | Open an encrypted file |
| `Workbook.Open(byte[] data, WorkbookFormat format)` | Open from memory |
| `Workbook.Open(byte[] data, WorkbookFormat format, OpenOptions options)` | Open encrypted, from memory |
| `Workbook.Open(Stream stream, WorkbookFormat format)` | Open from a stream |
| `Workbook.OpenAsync(…)` | Any of the above for a path or a stream, without blocking the calling thread |

`WorkbookFormat` names the format when there is no file name to infer it from:
`Xlsx`, `Xlsm`, `Xlsb`, `Xls`, `Ods`, `Csv`, `Json`, and others.
`WorkbookFormatExtensions.FromExtension("report.xlsx")` maps a file name or an
extension to its format.

# Sheets

```csharp
int n = wb.Sheets.Count;
Sheet first = wb.Sheets[0];
Sheet named = wb.Sheets["Summary"];

Sheet added = wb.Sheets.Add("Q4");
Sheet inserted = wb.Sheets.Insert(1, "Notes");
wb.Sheets[1].Name = "Appendix";          // rename
wb.Sheets.Move(1, 3);
wb.Sheets.RemoveAt(3);

wb.ActiveSheet = wb.Sheets[0];
Sheet active = wb.ActiveSheet;
```

`wb.Sheets` is a live `IReadOnlyList<Sheet>`: `Count`, an `int` indexer, a name
indexer, `foreach`, and LINQ. Looking up a name that is not there throws
`KeyNotFoundException`; `wb.Sheets.TryGet("Summary", out Sheet? sheet)` and
`Contains` test without throwing. Names compare ignoring case, as in Excel.

Sheet indices are 0-based and shift when sheets are inserted, deleted, or moved.
A held `Sheet` continues to refer to the same tab and its `Index` changes with
the tab. Once its own tab is removed, using it throws `InvalidOperationException`.

Renaming a sheet through `Name` also rewrites the formulas and names that refer
to it (`Data!A1` becomes `Appendix!A1`), and an invalid name (more than 31
characters, a `[ ] : * ? / \`, a duplicate) throws `AxyraException`.
`wb.Sheets.AddCopy(source, "January")` appends a deep copy of a sheet, also from
another workbook.

## Sheet properties

```csharp
Sheet sheet = wb.Sheets["Summary"];

string name = sheet.Name;
int index = sheet.Index;
SheetType type = sheet.SheetType;      // Worksheet, Chart, Dialog, MacroSheet, …
string? id = sheet.UniqueId;           // stable across renames

sheet.Visibility = Visibility.VeryHidden;
sheet.TabColor = Color.FromRgb(0xC0, 0x39, 0x2B);
sheet.RightToLeft = true;
```

`UniqueId` is the identifier to key your own data off, not `Name` — a rename
changes the name but not the id. `Color` here is `Axyra.Sheets.Style.Color`; in a
file that also imports `System.Drawing`, alias it with
`using Color = Axyra.Sheets.Style.Color;`.

## Headers, footers, and page setup

```csharp
PageSetup page = sheet.PageSetup;
page.Header = "&C&\"Calibri,Bold\"Quarterly Report";
page.Footer = "&LPrinted &D&RPage &P of &N";

page.DifferentFirst = true;
page.FirstHeader = "&CCover";

page.DifferentOddEven = true;
page.EvenHeader = "&L&F";
```

The `&`-codes are Excel's header/footer codes: `&C` centre, `&L` left, `&R`
right, `&P` page number, `&N` page count, `&D` date, `&F` filename. Everything
about how a sheet prints lives on `sheet.PageSetup` — see
[Rendering]({{ site.axyra_dotnet_devref }}/Rendering#page-setup).

## Rows and columns

```csharp
sheet.Rows[0].Height = 28.0;           // points
sheet.Columns[0].Width = 24.0;         // character units, as in Excel
sheet.Rows.DefaultHeight = 15.0;
sheet.Columns.DefaultWidth = 8.43;

sheet.Rows.Insert(10, 3);
sheet.Rows.Delete(10, 3);
sheet.Columns.Insert(4, 1);
sheet.Columns.Delete(4, 1);

sheet.FreezePanes(1, 0);               // freeze the first row
sheet.AutoFilter.Range = sheet["A1:F1"];
```

Row height is in **points**; column width is in Excel's **character units**
(the width of the '0' glyph in the default font), which is why the two use
different scales. `sheet.Rows[r].IsHeightCustom` and
`sheet.Columns[c].IsWidthCustom` distinguish an authored size from an inherited
default — relevant when you are deciding whether to auto-fit
(`sheet.Columns[c].AutoFit()`). A column can also be addressed by its letter:
`sheet.Columns["C"]`.

Inserting and deleting rows or columns adjusts what references the shifted
area, on every sheet: formulas (including references from other sheets), merged
regions, named ranges, conditional formats, validations, tables, chart series,
the print area, and anchored objects.

# Workbook settings

```csharp
wb.CalcMode = CalcMode.Manual;
wb.SetIterativeCalculation(true, 100, 0.001);
wb.Date1904 = false;
```

`CalcMode` is in the `Axyra.Sheets.Calc` namespace. `Date1904 = true` switches to
the 1904 date system used by legacy Mac workbooks. Changing it on a workbook that
already holds dates reinterprets those serial numbers — set it before populating
dates, not after.

The document properties are plain properties too: `wb.Title`, `wb.Author`,
`wb.Subject`, `wb.Company`, and the rest of the core and extended set, plus custom
properties through `wb.SetCustomProperty(name, value)` and `wb.CustomProperties`.

# Chart sheets

A chart sheet is a sheet whose entire body is one chart:

```csharp
ChartSheet revenue = wb.ChartSheets.Add("Revenue", ChartType.Column);   // a new tab
Chart chart = revenue.Chart!;
chart.Series.Add("Sales", "Data!$B$2:$B$10", "Data!$A$2:$A$10");

int position = revenue.Index;          // position among chart sheets
wb.ChartSheets.RemoveAt(position);
```

`wb.ChartSheets` is indexed by a chart sheet's position among the chart sheets,
not by its index among all sheets, and also by name
(`wb.ChartSheets["Revenue"]`). See [Charts]({{ site.axyra_dotnet_devref }}/Charts).

# Named ranges

```csharp
wb.Names.Add("TaxRate", "Config!$B$2");                // workbook-scoped
wb.Names.Add("Local", "$A$1:$A$10", wb.Sheets["Data"]);  // scoped to one sheet

foreach (NamedRange nr in wb.Names)
{
    Console.WriteLine(nr.Name + " = " + nr.Formula
            + (nr.IsWorkbookScoped ? " (workbook)" : $" (sheet {nr.SheetScope})"));
}

CellRange r = wb.Names["TaxRate"].AsRange();
wb.Names.Remove("Local");
```

A name's definition is a formula, not just a reference, so `Names.Add` also
covers constants (`"0.05"`) and expressions; adding a name that exists replaces
it. `AsRange()` only succeeds when the definition resolves to one rectangular
area, and throws `ArgumentException` otherwise. For any sheet-qualified reference,
`wb.GetRange("'Q1 Data'!B2:C10")` returns the cells directly.

Named ranges are adjusted by structural edits like any other reference, which
makes them the durable way to point at a region a user may move.

{: .notice--info}
**Runnable example:** [`DevRef/WorkbookAndSheetExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/WorkbookAndSheetExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/workbook-and-sheet`.

# Next

- [Cells and Ranges]({{ site.axyra_dotnet_devref }}/Cell_and_Range)
- [Formulas]({{ site.axyra_dotnet_devref }}/Formulas)
