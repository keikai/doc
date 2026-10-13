# Migrate a spreadsheet workflow

Start from the user's existing code, dependency version, representative input,
and required output. Do not equate similarly named classes across libraries.
Inventory operations actually used: sheet selection, values and dates, formulas,
styles, templates, charts, pivots, file formats, encryption, and rendering.

Build a short operation mapping with the source behavior, verified Axyra operation,
and gap or test needed. Read official version-matched competitor documentation when
its semantics cannot be established from the supplied code/tests. Internal parity
matrices are discovery aids, not proof of compatibility or performance.

## Common migration boundaries

| Source concept | Axyra direction | Verify |
|---|---|---|
| Aspose.Cells workbook/worksheet/cells | `Workbook`, `Sheet`, `Cell`/`Range` | Explicit sheet creation, indexing, and workbook lifetime |
| POI workbook/sheet/row/cell | `Workbook`, `Sheet`, zero-based `cell(r, c)` and bulk ranges; no row objects | Missing cells, blanks, formula caches, dates; column width in characters (POI `15*256` → `15`) |
| Vendor styles (font + style objects) | One immutable `CellStyle` per look, built with `CellStyle.builder()` | `setStyle` replaces the whole style; number-format codes, fills, borders, fonts |
| Formula calculation (`evaluateAll`) | `Workbook.recalculate()`; writes already recalculate dependents | Supported formulas and error values; compare cached results |
| Vendor template processing | `TemplateMarkers` (`${...}` markers) | Marker grammar, empty lists, grouping, types; styles of grouped rows |
| Vendor PDF conversion | Axyra rendering options | Fonts, print areas, scaling, pagination, chart support |
| Vendor streaming API | Axyra streaming writer if requirements fit | Forward-only rows, commits, feature limits, and memory measurements |

Aspose marker templates cannot be assumed to work unchanged with Axyra's `${...}`
syntax. Inspect the actual template and convert it explicitly only within the
requested scope. Check expansion effects on formulas, totals, images, and formatting.
The template entry point is `TemplateMarkers`; its marker grammar and expansion
rules are in [pitfalls-templates.md](pitfalls-templates.md).

Classify vendor template processing (Aspose Smart Markers `&=`, DsExcel `{{ }}`) as
redesign, never as a direct mapping: besides the syntax, grouping, subtotals, date
values and the styles of generated rows change.

When more than a few templates must move, or new ones will keep arriving, write a
small converter in the project instead of editing files by hand:
- Never modify the originals; write converted copies.
- When an option has no marker equivalent but its effect can be reproduced in code
  around `TemplateMarkers.process` (for example sorting records first, or blanking or
  merging group cells afterwards), reproduce it, check it against the expected output,
  and record it as a semantic difference.
- Still list every marker or option without an Axyra marker equivalent, by file and
  cell, and say whether code reproduces it (and how that was verified) or a person must
  decide. New templates may use the same options. Do not guess, and never let a report
  that lacks such an effect look complete.
- Report per template what the calling code must change (for example subtotal rows
  holding values, dates passed as serials, repeated group labels, styles of grouped rows).
- Verify each converted template: process it with sample data, check that no `&=`,
  `{{` or `${` text remains, and compare with the source library's output when it is
  available.

For a single template, convert it once but keep the conversion as a script so it can
be repeated.

Libraries that recalculate lazily, or only on request, map to Axyra calls that
recalculate on every write. Keep an explicit `recalculate()` where the source
called its evaluator. Port a manual-calculation setting only if the old output
shows it: `CalcMode.MANUAL` is honoured and saved. POI `getCreationHelper()` and `XSSF*` classes have no Axyra
counterpart; map the behavior, not the class.

Use fully qualified names during migration if both libraries define `Workbook` or
`Cell`. Keep unrelated application logic intact. Remove the old dependency only
after remaining usages have been checked; never delete it while other code needs it.
Keikai UI migration is not a substitute for spreadsheet-library migration.

## Matching the old output

These apply whenever the replaced program's output is available. They describe Axyra; what
the old library did is read from its output, never assumed.

**What to compare before reporting `complete`.** For a workbook: every written cell's value,
formula, number format, font (name, size, colour, bold, italic), fill and alignment, plus merged
cells, sheet names and order, tables and charts. For an image or PDF: its pixel or page size and
page count. For console output: every line except text that names the library or its version.
Reopening the file you wrote is not enough on its own; list each difference that remains.

**Default font of workbooks the code creates.** A workbook created with `Workbook.create()`
uses Calibri 11 with automatic colour (no explicit colour element in `styles.xml`) as its
default ("Normal") font, and every cell without its own
font shows it. Spreadsheet libraries differ here. When the code creates a workbook (not when
it opens a file), read the default font of the old output (name, size and colour: the first
`<font>` in `xl/styles.xml`, or the style of any unformatted cell) and set the same right after
creating the workbook:

```java
Workbook wb = Workbook.create();
wb.setDefaultFont(wb.defaultStyle().toBuilder()
        .fontName(name)          // as read from the old output
        .fontSize(size)
        .fontColor(color)        // e.g. Color.theme(1) when the old output stores theme="1"
        .build());
```

A workbook opened from a file keeps the default it was saved with; do not change it.
A workbook opened from HTML, CSV or text is the exception: those files store no default font,
so it gets the created-workbook default (Calibri 11) and the rule above applies to it.

**Default row height.** `Workbook.setDefaultFont` does not change a sheet's default row
height (15 pt for a created sheet). Read `<sheetFormatPr defaultRowHeight>` from the old
output and call `Sheet.setDefaultRowHeight(h)` on each sheet the code creates. Charts
anchored to rows and every rendered page depend on it.

**Pivot tables.** A pivot the code creates or changes is built into the sheet as cells
when the workbook is saved or rendered, whether or not `refresh()` was called; there is
no way to save it with a blank area. Call `refresh()` where the original program updates
the pivot's data, and before reading pivot cells. A pivot in an opened file that the code
does not change keeps the cells the file had. If the old output's pivot area is blank
while Axyra's is filled, list that as a gap. The `.xls` writer does not keep the pivot definition (`pivotCount()` is 0
after reopening a saved `.xls`).

**Subtotals.** `Sheet.subtotal(firstRow, lastRow, groupColumn, hasHeaders, SubtotalFunction,
columns...)` inserts subtotal rows the way Excel's Data > Subtotal does (with
`hasHeaders = true` the block's first non-blank row is its header). Columns are sheet
columns, not offsets into the block. It returns the number of rows inserted, and 0 when the
block has no data, in which case Excel writes nothing either. Use it rather than building
subtotal rows by hand, and never add rows it did not insert.

**Text files.** For CSV, use `Workbook.saveCsv(path, CsvOptions.create().sheet(i))` (since
1.0.0-Beta): `sheet(int)` or `sheet(String)` picks the sheet without changing the active
sheet, and `delimiter(char)`, `values(CsvOptions.Values.RAW | FORMATTED)` and
`utf8Bom(boolean)` set the rest; values default to the formatted text (`"1,234.50"`),
`RAW` writes stored values. `Workbook.save(Path)` chooses the format from the extension
(`.csv`; `.tsv` and `.txt` are tab-separated) and `saveBytes("csv" | "tsv" | "txt")` returns
the same bytes; both write the active sheet, from A1, with CRLF line ends, as Excel's Save As
Text does. Use them for TSV and TXT, or when the active sheet is what should be written:
selecting a sheet with `Workbook.setActiveSheet(i)` changes the workbook for any later save.

**When the old output contradicts the program.** If the old output disagrees with what the
program's own calls ask for (for example, the program sets something the old output does not
show), implement the calls the way Excel performs them and list the
difference as a gap. Do not hand-write content only to reproduce the old output.

**Images and PDF pages.** Render exactly what the old code rendered, at the same size:

| Old output | Axyra call |
|---|---|
| a chart as an image | `Sheet.renderChartToPng(chartIndex, widthPx, heightPx)` (or `renderChartToSvg`) |
| a cell range as an image | `Workbook.renderRangePng(sheetIndex, "A1:D10", options)` |
| one page of a sheet | `Workbook.renderSheetPng(sheetIndex, options)`, with `ImageOptions.builder().page(n)` (1-based, the PDF's page numbering) |
| the workbook as PDF | `Workbook.renderPdf(path, PdfOptions)`; page setup lives on the `Sheet` |

Size an image with `ImageOptions.builder().targetWidthPx(w)` (the height keeps the aspect ratio)
or `scale(dpi / 96.0)`. Paper size is `Sheet.setPaperSize(code)` (ECMA-376 `ST_PaperSize`
codes); orientation, margins, print area and fit-to-page are also on the `Sheet`. Read the old
image's pixel size, or the old PDF's page size and count, and match them.

**A whole sheet on one page (PDF).** Excel cannot print a page cut to a sheet's content; it prints
on the sheet's own paper (`Sheet.paperSize()`), measured on Excel 16.0. When the program prints
each sheet on one page, keep the sheet's paper and fit the sheet onto it:
`PdfOptions.builder().fitTo(PdfOptions.Fit.PAGE)` (Excel's Fit Sheet on One Page); for all
columns on one page, `PdfOptions.Fit.WIDTH` (Fit All Columns on One Page). Keep the sheet's
orientation too. Use the option as it is: never compute a print scale, a paper size or an
orientation of your own to get closer to the old PDF (no `setPageScale`, `setLandscape` or
`setPaperSize` call that the original program does not make), and accept the page count the
option gives. List the old page size and count as a gap. Images are not pages: an image of a whole sheet still
matches the old image's pixel size, as above.

**Saving a picture from the workbook.** When the program saves a picture stored in the
workbook in that picture's own format, write `Sheet.pictureData(i)` unchanged
(`Sheet.pictureFormat(i)` names the format). Those bytes are the picture itself; decoding
and re-encoding changes its pixels. Do this even when the old output's file differs
from the stored bytes; list that difference as a gap.

**Tables.** A table's look comes from its table style, which is not the same as cell formats.
Compare the formats of the table's cells (a bold header row, fills) with the old output, and
add or remove explicit cell styles until they match.

## Evidence of equivalence

Use synthetic or approved fixtures covering ordinary rows, blanks, dates, decimal
amounts, formulas, errors, and any feature important to the user. Compare semantic
content, not ZIP byte equality: values and types, formulas and cached results,
number formats, sheet names, and required objects. Check totals with tolerances
appropriate to the original business rules; do not silently alter rounding policy.

Run the old implementation only if its dependencies and license are available.
Otherwise use supplied baseline outputs or a small explicit business oracle and
state that old/new execution equivalence is not yet verified. Include an independent
reader where practical; reading a workbook with its own writer is useful but may
miss shared defects. For PDFs, inspect pages and compare layout separately.

Report unsupported or unverified features as gaps with bounded alternatives. Never
promise full vendor compatibility from a successful simple export. Account for
evaluation marks separately; do not remove them to make comparisons pass.
