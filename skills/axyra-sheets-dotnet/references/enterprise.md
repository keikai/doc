# Enterprise workflow decisions

Select a workflow from the user's input, output, scale, and deployment constraints.
Reuse source routing in [sources.md](sources.md) instead of inventing API names. Facts below
were verified on `1.0.0-fl.20261116`; recheck them for the resolved build.

## Database or JSON to Excel

Use `sheet.ImportData` for stable schemas, and `CellRange.SetValues(object?[,])` /
`SetValues(CellValue[,])` for dictionaries or dynamic JSON (`System.Text.Json`
elements must be converted to .NET values first). Column order, type conversion and
the dictionary trap are in [pitfalls-writing.md](pitfalls-writing.md).

For large query results (`DbDataReader`, EF Core `AsAsyncEnumerable`), avoid
materializing the full result if bounded memory is required; write in blocks or use
`StreamWorkbook`. For an HTTP download, follow the application's existing response
conventions (`wb.ToByteArray(WorkbookFormat.Xlsx)` or `wb.Save(stream,
WorkbookFormat.Xlsx)` into the response stream); do not add a web framework simply to
demonstrate the library.

## Template reports and scheduled output

Use `TemplateMarkers`; grammar, expansion pitfalls and tests are in
[pitfalls-templates.md](pitfalls-templates.md).

## Charts

Charts live in `sheet.Charts` (`Axyra.Sheets.Charts`; anchors in `Axyra.Sheets.Drawing`).
Series references are sheet-qualified absolute A1 strings.

```csharp
using Axyra.Sheets.Charts;
using Axyra.Sheets.Drawing;

Chart chart = sheet.Charts.Add(ChartType.Column, DrawingAnchor.Cover("E2:L18"));
chart.Series.Add("Sales", "Sales!$B$2:$B$5", "Sales!$A$2:$A$5");   // name, values, categories
chart.Title = "Sales by region";
chart.Legend.Position = LegendPosition.Bottom;
byte[] png = chart.RenderPng(640, 400);
```

`new DrawingAnchor(fromRow, fromColumn, toRow, toColumn)` is zero-based with the end
cell exclusive (`(1, 1, 6, 5)` covers `B2:E6`); `DrawingAnchor.Cover("B2:F7")` covers
the A1 range inclusively. Charts are printed where they are anchored: a chart beside
the data often spills onto a second portrait page. Anchor it below the data, or set
`Orientation`/`FitToPages` (or `PdfOptions.FitTo`), and check the PDF page count.

## PDF and image reports

Use a full workbook for formulas, charts, layout, and rendering.

**Page setup belongs to the sheet (`sheet.PageSetup`):**
- `PaperSize` takes an ECMA code (9 = A4, the default for a new sheet).
- `Orientation = PageOrientation.Landscape`.
- `Margins = new PageMargins(left, right, top, bottom, header, footer)`, in inches.
- `PrintArea`, `PrintTitleRows` (e.g. `"$1:$1"`), `PrintTitleColumns`.
- `FitToPages(wide, tall)`, `Scale`; `AddRowBreak`/`AddColumnBreak`.

**`PdfOptions` (`Axyra.Sheets.IO`) carries document-level concerns:**
- sheet selection (`SheetNames` / `Sheets`), `PageRange` (1-based, `"2-5,8"`);
- `FitTo` (`PdfFit.Width`/`Height`/`Page`), which **overrides** each selected sheet's
  own scaling for this export;
- passwords and permissions, `Watermark`, `Bookmarks`, `PdfA`;
- `FontDirectories`.

```csharp
using Axyra.Sheets.IO;

sheet.PageSetup.Orientation = PageOrientation.Landscape;
sheet.PageSetup.PrintTitleRows = "$1:$1";
wb.SavePdf("report.pdf", new PdfOptions { SheetNames = new[] { "Sales" }, FitTo = PdfFit.Width });
byte[] pdf = wb.ToPdf();                               // same document as bytes
```

**Selection rules:** by default all visible sheets are exported; hidden sheets are
exported when selected explicitly. An unknown sheet name, or a page range that selects
nothing, throws `AxyraException` ("pdf render: Invalid export options: ...").

**Fonts:**
- Rendering scans the system font directories. The Java SDK measured that
  `C:\Windows\Fonts` is not scanned; not re-verified for .NET on Windows, so on
  Windows pass it (or an application font folder) in `FontDirectories`.
- Metric-compatible fallbacks are bundled: Calibri→Carlito (verified in PDF output on
  macOS), Cambria→Caladea, Arial→Liberation Sans.
- CJK text needs installed CJK fonts, such as Noto.

Recalculate after edits when results are needed. Do not promise exact Excel visual
equivalence without comparing representative output; a nonempty PDF file alone is
not a visual-fidelity test.

## High-volume export

Choose `StreamWorkbook` (`Axyra.Sheets.IO`) for sequential, write-only output.

```csharp
using (var writer = new StreamWorkbook("orders.xlsx"))
{
    int bold = writer.AddStyle(StreamStyle.Default with { Bold = true });
    int date = writer.AddStyle(new StreamStyle { NumberFormat = "yyyy-mm-dd" });
    writer.StartSheet("Orders");
    writer.StartRow(0).AddText("Order ID", bold).AddText("Date", bold).Commit();
    writer.StartRow(1).AddText("00042").AddDate(new DateOnly(2026, 1, 31), date).Commit();
}   // Dispose finishes the file
```

**Row contract:**
- Rows are zero-based and **strictly ascending**; repeating a committed row or going
  back throws `AxyraIoException`.
- Each row is built with `StartRow(i)...` and written only by `Commit()`. An
  uncommitted row is silently discarded (and the same index may be started again).
- `StartSheet` must come first. The file is complete only after `Finish()`/`Dispose()`.

**Styles:**
- `AddStyle(StreamStyle)` returns the index used in `AddNumber(v, style)`. Register
  a style before using its index; the writer does not validate indices.
- A style carries only a number format and bold/italic.
- Dates need a date-format style or they show as serial numbers.

**Not available:** opening existing files, recalculation, charts, pivots, images,
merges, comments, validation, and rendering. The only target is a file path (no
`Stream`).

**Worksheet limits:** a worksheet holds at most 1,048,576 rows × 16,384 columns.
The writer throws `AxyraIoException: cell out of range` beyond that and does not roll
over, so partition into further `StartSheet` calls yourself.

When requirements combine large volume with pivots or rendering, discuss measured
memory needs or split summary and detail output rather than promising all features
with constant memory. Benchmarks require a stated data shape and environment.

## Runtime acceptance

Native loading, evaluation mode, license checks and threading are in
[pitfalls-license.md](pitfalls-license.md). Output-format limits are in
[pitfalls-output.md](pitfalls-output.md).

Test format and type correctness and saved formula results, not only successful
method returns.
