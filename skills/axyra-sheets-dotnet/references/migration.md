# Migrate a .NET spreadsheet workflow

Start from the user's existing code, package versions, representative input, and
required output. Do not equate similarly named classes across libraries.
Inventory operations actually used: sheet selection, values and dates, formulas,
styles, templates, charts, pivots, file formats, encryption, and rendering.

Build a short operation mapping with the source behavior, verified Axyra operation,
and gap or test needed. Read official version-matched competitor documentation when
its semantics cannot be established from the supplied code/tests. Internal parity
matrices are discovery aids, not proof of compatibility or performance.

## Indexing and object model by library

| Source | Indices | Workbook / sheet | Cell access | Watch |
|---|---|---|---|---|
| NPOI (`XSSFWorkbook`, `HSSFWorkbook`, `SXSSFWorkbook`) | zero-based | `CreateSheet` → `wb.Sheets.Add` | `sheet.GetRow(r)?.GetCell(c)` / `CreateRow(r).CreateCell(c)` → `sheet[r, c]`; no row objects | Missing rows/cells, `CellType`, `DateUtil`, column width in 1/256 characters (`15 * 256` → `Columns[i].Width = 15`) |
| EPPlus (`ExcelPackage`) | **one-based** `Cells[row, col]` | `package.Workbook.Worksheets.Add` → `wb.Sheets.Add` | `ws.Cells["A1"].Value` / `Cells[r, c]` → `sheet["A1"]` / `sheet[r - 1, c - 1]` | Every numeric index shifts by one; `LoadFromCollection` → `ImportData`; `Calculate()` |
| ClosedXML (`XLWorkbook`) | **one-based** `Cell(row, col)`, `Row(n)`, `Column(n)` | `AddWorksheet` → `wb.Sheets.Add` | `ws.Cell(1, 1).Value` / `ws.Cell("A1")` → `sheet[0, 0]` / `sheet["A1"]` | Index shift; mutable `.Style` chains → immutable `CellStyle` records; `InsertTable` → `ImportData` + `Tables.Add` |
| Aspose.Cells for .NET | zero-based | `new Workbook()` **already has a sheet**; Axyra's has none | `Cells["A1"].PutValue(v)` / `Cells[r, c]` → `sheet["A1"].Value` / `sheet[r, c].Value` | `GetStyle()`/`SetStyle()` and `StyleFlag` → `cell.Style with { ... }`; `CalculateFormula()`; Smart Markers |

## Common migration boundaries

| Source concept | Axyra direction | Verify |
|---|---|---|
| Vendor styles (mutable style objects, `CreateCellStyle`, `.Style.Font.Bold = true`) | One immutable `CellStyle` record per look (`new CellStyle { ... }`, `with` for variants) | Assigning `Style` replaces the whole style; number-format codes, fills, borders, fonts |
| Date writes (`DateTime` values, `DateUtil`, EPPlus `Numberformat.Format`) | `cell.DateValue` / `DateTimeValue` (adds a date format only to General cells) or serials + `NumberFormat` | Saved number formats and serials; `ImportData` writes serials without a format |
| Formula calculation (`evaluateAll`, `Calculate()`, `CalculateFormula()`) | `wb.Recalculate()`; writes already recalculate dependents | Supported functions and error values; compare cached results |
| Collection export (`LoadFromCollection`, `InsertTable`, `ImportCustomObjects`) | `sheet.ImportData` (+ `sheet.Tables.Add` for a table) | Column order (classes sort properties by name), dates, nulls, headers |
| Vendor template processing | `TemplateMarkers` (`${...}` markers) | Marker grammar, empty lists, grouping, types; styles of grouped rows |
| Vendor PDF conversion (`Save(SaveFormat.Pdf)`, add-on libraries) | `wb.SavePdf` / `ToPdf` with `PdfOptions`; page setup on `sheet.PageSetup` | Fonts, print areas, scaling, pagination, chart support |
| Vendor streaming API (`SXSSFWorkbook`, `LightCells`) | `StreamWorkbook` if requirements fit | Forward-only rows, commits, feature limits, and memory measurements |
| `Stream`-based save/open | `wb.Save(stream, WorkbookFormat.Xlsx)`, `Workbook.Open(stream, format)`, `ToByteArray` | The format argument is required for streams and bytes |

Aspose Smart Marker (`&=`) templates, and EPPlus/ClosedXML.Report (`{{ }}`) templates,
cannot be assumed to work unchanged with Axyra's `${...}` syntax. Inspect the actual
template and convert it explicitly only within the requested scope. Check expansion
effects on formulas, totals, images, and formatting. The template entry point is
`TemplateMarkers.Process`; its grammar and expansion rules are in
[pitfalls-templates.md](pitfalls-templates.md).

Classify vendor template processing as redesign, never as a direct mapping: besides
the syntax, grouping, subtotals, date values and the styles of generated rows change.

When more than a few templates must move, or new ones will keep arriving, write a
small converter in the project instead of editing files by hand:
- Never modify the originals; write converted copies.
- When an option has no marker equivalent but its effect can be reproduced in code
  around `TemplateMarkers.Process` (for example sorting records first, or blanking or
  merging group cells afterwards), reproduce it, check it against the expected output,
  and record it as a semantic difference.
- Still list every marker or option without an Axyra marker equivalent, by file and
  cell, and say whether code reproduces it (and how that was verified) or a person must
  decide. New templates may use the same options. Do not guess, and never let a report
  that lacks such an effect look complete.
- Report per template what the calling code must change (for example subtotal rows
  holding values, dates passed as serials, repeated group labels, styles of grouped rows,
  `List<T>` instead of arrays).
- Verify each converted template: process it with sample data, check that no `&=`,
  `{{` or `${` text remains, and compare with the source library's output when it is
  available.

For a single template, convert it once but keep the conversion as a script so it can
be repeated.

Libraries that recalculate lazily, or only on request, map to Axyra calls that
recalculate on every write. Keep an explicit `Recalculate()` where the source
called its evaluator. Port a manual-calculation setting only if the old output
shows it: `CalcMode.Manual` is honoured and saved. NPOI `ICreationHelper`,
`IFormulaEvaluator`, EPPlus `ExcelRange` and ClosedXML `IXLRange` have no Axyra
counterpart class; map the behavior, not the class.

Both NPOI/EPPlus/ClosedXML/Aspose and Axyra define `Workbook`, `Cell` or `Color`; use
namespace aliases (`using AxWorkbook = Axyra.Sheets.Workbook;`) while both packages are
referenced. Keep unrelated application logic intact. Remove the old `PackageReference`
only after remaining usages have been checked; never delete it while other code
needs it. Keikai UI migration is not a substitute for spreadsheet-library migration.

## Matching the old output

These apply whenever the replaced program's output is available. They describe Axyra; what
the old library did is read from its output, never assumed.

**What to compare before reporting `complete`.** For a workbook: every written cell's value,
formula, number format, font (name, size, colour, bold, italic), fill and alignment, plus merged
cells, sheet names and order, tables and charts. For an image or PDF: its pixel or page size and
page count. For console output: every line except text that names the library or its version.
Reopening the file you wrote is not enough on its own; list each difference that remains.

**Default font of workbooks the code creates.** `new Workbook()` uses Calibri 11 with automatic
colour (no colour element in `styles.xml`) as its default ("Normal") font, and every cell
without its own font shows it. Spreadsheet libraries differ here. When the code creates
a workbook (not when it opens a file), read the default font of the
old output (the first `<font>` in `xl/styles.xml`, or the style of any unformatted cell)
and set the same right after creating the workbook:

```csharp
using Workbook wb = new Workbook();
wb.DefaultFont = wb.DefaultFont with
{
    Name = fontName,          // as read from the old output
    Size = fontSize,
    Color = fontColor,        // e.g. Color.FromTheme(1) when the old output stores theme="1"
};
```

A workbook opened from a file keeps the default it was saved with; do not change it.
A workbook opened from HTML, CSV or text is the exception: those files store no default
font, so it gets the created-workbook default (Calibri 11) and the rule above applies.

**Default row height.** Setting `wb.DefaultFont` does not change a sheet's default row
height (15 pt for a created sheet). Read `<sheetFormatPr defaultRowHeight>` from the old
output and set `sheet.Rows.DefaultHeight = h` on each sheet the code creates. Charts
anchored to rows and every rendered page depend on it.

**Pivot tables.** A pivot the code creates or changes is built into the sheet as cells
when the workbook is saved or rendered, whether or not `Refresh()` was called; there is
no way to save it with a blank area. Call `Refresh()` where the original program updates
the pivot's data, and before reading pivot cells. A pivot in an opened file that the code
does not change keeps the cells the file had. If the old output's pivot area is blank
while Axyra's is filled, list that as a gap. The `.xls` writer does not keep the pivot
definition (`PivotTables.Count` is 0 after reopening a saved `.xls`).

**Subtotals.** `CellRange.Subtotal(groupBy, SubtotalFunction, totalColumns, hasHeaders)`
inserts subtotal rows the way Excel's Data > Subtotal does; `groupBy` and `totalColumns`
count from the range's first column. It returns the number of rows inserted. Use it
rather than building subtotal rows by hand, and never add rows it did not insert.

**Text files.** For CSV, use `wb.SaveCsv(path, new CsvOptions { SheetName = "Data" })`
(or `SheetIndex`): it picks the sheet without changing the active sheet; `Delimiter`,
`Values` (`CsvValues.Formatted`, the default, writes the displayed text such as
`"1,234.50"`; `CsvValues.Raw` writes stored values) and `Utf8Bom` set the rest.
`wb.Save(path)` chooses the format from the extension (`.csv`; `.tsv`/`.txt` are
tab-separated) and writes the active sheet, from A1, with CRLF line ends, as Excel's
Save As Text does. Setting `wb.ActiveSheet` changes the workbook for any later save.

**When the old output contradicts the program.** If the old output disagrees with what the
program's own calls ask for, implement the calls the way Excel performs them and list the
difference as a gap. Do not hand-write content only to reproduce the old output.

**Images and PDF pages.** Render exactly what the old code rendered, at the same size:

| Old output | Axyra call |
|---|---|
| a chart as an image | `chart.RenderPng(widthPx, heightPx)` (or `RenderSvg`) |
| a cell range as an image | `sheet["A1:D10"].RenderImage(ImageFormat.Png, options)` |
| one page of a sheet | `sheet.RenderImage(ImageFormat.Png, new ImageOptions { Page = n })` (1-based, the PDF's page numbering) |
| the workbook as PDF | `wb.SavePdf(path, PdfOptions)`; page setup lives on `sheet.PageSetup` |

Size an image with `ImageOptions.WidthInPixels` (the height keeps the aspect ratio) or
`Scale = dpi / 96.0`. Paper size is `sheet.PageSetup.PaperSize` (ECMA-376 `ST_PaperSize`
codes); orientation, margins, print area and fit-to-page are also on `PageSetup`. Read
the old image's pixel size, or the old PDF's page size and count, and match them.

**A whole sheet on one page (PDF).** Excel cannot print a page cut to a sheet's content; it
prints on the sheet's own paper (`PageSetup.PaperSize`). When the program prints each sheet on
one page, keep the sheet's paper and fit the sheet onto it: `new PdfOptions { FitTo =
PdfFit.Page }` (Excel's Fit Sheet on One Page); for all columns on one page, `PdfFit.Width`.
Keep the sheet's orientation too. Use the option as it is: never compute a print scale, a
paper size or an orientation of your own to get closer to the old PDF, and accept the page
count the option gives. List the old page size and count as a gap.

**Saving a picture from the workbook.** When the program saves a picture stored in the
workbook in its own format, write `sheet.Pictures[i].Data` unchanged (`.Format` names the
format). Those bytes are the picture itself; decoding and re-encoding changes its pixels.

**Tables.** A table's look comes from its table style, which is not the same as cell formats.
Compare the formats of the table's cells (a bold header row, fills) with the old output, and
add or remove explicit cell styles until they match.

## Evidence of equivalence

Use synthetic or approved fixtures covering ordinary rows, blanks, dates, decimal
amounts, formulas, errors, and any feature important to the user. Compare semantic
content, not ZIP byte equality: values and types, formulas and cached results,
number formats, sheet names, and required objects. Check totals with tolerances
appropriate to the original business rules (`decimal` amounts become doubles); do not
silently alter rounding policy.

Run the old implementation only if its packages and license are available (EPPlus 5+
needs its license configured; unlicensed Aspose output carries evaluation marks). Otherwise
use supplied baseline outputs or a small explicit business oracle and state that
old/new execution equivalence is not yet verified. Include an independent reader where
practical; reading a workbook with its own writer is useful but may miss shared
defects. For PDFs, inspect pages and compare layout separately.

Report unsupported or unverified features as gaps with bounded alternatives. Never
promise full vendor compatibility from a successful simple export. Account for
evaluation marks separately; do not remove them to make comparisons pass.
