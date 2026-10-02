# Enterprise workflow decisions

Select a workflow from the user's input, output, scale, and deployment constraints.
Reuse source routing in [sources.md](sources.md) instead of inventing API names. Facts below
describe `0.1.0.FL.20260922-Eval` and were re-verified on `0.1.0.FL.20260930-Eval`; recheck them for the resolved build.

## Database or JSON to Excel

Use `Sheet.importData` for stable schemas, and `Range.setValues` with a
`CellValue[][]` for maps or dynamic JSON. Column order, type conversion and the
map trap are in [pitfalls-writing.md](pitfalls-writing.md).

For large JDBC results, avoid materializing the full result set if bounded memory
is required. Inspect driver fetch behavior as well as the workbook API. For an
HTTP download, follow the application's existing response and error conventions;
do not add a web framework simply to demonstrate the library.

## Template reports and scheduled output

Use `TemplateMarkers`; grammar, expansion pitfalls and tests are in
[pitfalls-templates.md](pitfalls-templates.md).

## PDF and image reports

Use a full workbook for formulas, charts, layout, and rendering.

**Page setup belongs to the sheet:**
- `setPaperSize(int)` takes an ECMA code (9 = A4).
- `setLandscape`.
- `setPageMargins`, in inches.
- `setPrintArea`, `setPrintTitleRows`/`Columns`.
- `fitToPage(w, h)`, `setPageScale`.

**`PdfOptions` carries document-level concerns:**
- sheet selection (`sheetNames` / `sheets`), `pageRange`;
- `fitTo`, which **overrides** each selected sheet's own scaling when set;
- passwords, watermark, bookmarks, PDF/A;
- `fontDirs`.

**Selection rules:** hidden sheets are exported when selected explicitly. An unknown
sheet name, or a page range that selects nothing, throws.

**Fonts:**
- Rendering scans the usual macOS and Linux font directories, **but not
  `C:\Windows\Fonts`**. On Windows, pass it (or an application font folder) in
  `fontDirs`/`addFontDir`.
- Metric-compatible fallbacks are bundled: Calibri→Carlito, Cambria→Caladea,
  Arial→Liberation Sans.
- CJK text needs installed CJK fonts, such as Noto.

Recalculate after edits when results are needed. Do not promise exact Excel visual
equivalence without comparing representative output; a nonempty PDF file alone is
not a visual-fidelity test.

## High-volume export

Choose `StreamWorkbook` for sequential, write-only output.

**Row contract:**
- Rows are zero-based and **strictly ascending**; repeating or going back throws.
- Each row is built with `row(i)...` and written only by `commit()`. An uncommitted
  row is silently discarded.
- The file is complete only after `finish()`/`close()`.

**Styles:**
- `addStyle(StreamStyle)` returns the index used in `addNumber(v, style)`. Register
  a style before using its index; the writer does not validate indices.
- A style carries only a number format and bold/italic.
- Dates need a date-format style or they show as serial numbers.

**Not available:** opening existing files, recalculation, charts, pivots, images,
merges, validation, and rendering. The only target is `create(Path)`, and text is
stored inline.

**Worksheet limits:** a worksheet holds at most 1,048,576 rows × 16,384 columns.
The writer throws beyond that and does not roll over, so partition into further
`startSheet` calls yourself.

When requirements combine large volume with pivots or rendering, discuss measured
memory needs or split summary and detail output rather than promising all features
with constant memory. Benchmarks require a stated data shape and environment.

## Runtime acceptance

Native loading, evaluation mode, license checks and threading are in
[pitfalls-license.md](pitfalls-license.md). Output-format limits are in
[pitfalls-output.md](pitfalls-output.md).

Test format and type correctness and saved formula results, not only successful
method returns.
