---
name: axyra-sheets
description: Build and troubleshoot Java spreadsheet workflows with Axyra Sheets, or migrate existing Aspose.Cells, Apache POI, or other spreadsheet-library code to Axyra. Use for Excel import/export, template reports, formulas, charts, and PDF rendering with Axyra; not for Axyra Docs or the Keikai browser UI.
---

# Axyra Sheets development

Axyra Sheets is a Java spreadsheet engine (`io.keikai.axyra.sheets.*`). It is not
Keikai's `io.keikai.api.*` UI API. Facts here were measured on `0.1.0.FL.20260922-Eval` and re-verified on
`0.1.0.FL.20260930-Eval` (same public API; every probed behaviour unchanged).

## How to use this skill

This file is enough for most tasks. Work in this order and stop as soon as you can:

1. **Rules and pitfalls below.** They cover the behaviours that break code most often.
2. **Signatures: grep [api-index.md](references/api-index.md)** — every public type and
   member of 0.1.0.FL.20260930-Eval (identical to 20260922), one per line. Never read it whole:
   `grep -E '^Sheet\.(set|cell)' .../api-index.md`, `grep -i '^pdfoptions' ...`.
   Do not unzip the `-javadoc` JAR for signatures; use it only when you need Javadoc
   *prose*, and grep inside it rather than reading pages. If the project resolves a
   different version, confirm signatures with `javap` on that JAR.
3. **A reference file — only when its trigger applies:**

| Open only if the task… | File |
|---|---|
| uses `TemplateMarkers` / `${...}` templates | [pitfalls-templates.md](references/pitfalls-templates.md) |
| imports records/beans/JSON with `importData`, or edits formatted cells in bulk | [pitfalls-writing.md](references/pitfalls-writing.md) |
| renders PNG, or a chart/pivot/validation result looks wrong | [pitfalls-output.md](references/pitfalls-output.md) |
| is *about* a license problem, evaluation marks, native loading or threads | [pitfalls-license.md](references/pitfalls-license.md) |
| needs PDF page setup, fonts, or `StreamWorkbook` details | [enterprise.md](references/enterprise.md) |
| ports Aspose.Cells / POI / other-library code | [migration.md](references/migration.md) |
| needs a documentation page or official example for a topic this file does not cover | [sources.md](references/sources.md) |

Do not open a file "just in case": each costs context for the rest of the task.

**Citing sources.** List only what you actually opened: this skill's files, the api-index,
`javap` output, a Javadoc page (from the `-javadoc` JAR next to the resolved artifact, or
`https://mavensync.zkoss.org/eval/io/keikai/axyra-sheets/<version>/`), a page under
`https://doc.keikai.io/axyra/`, an example in `https://github.com/keikai/axyra-sheets-examples`,
or your own test. Never cite a page you did not read.

## License (standard start-up)

```java
LicenseInfo info = Workbook.setLicense(Files.readString(Path.of(System.getenv("AXYRA_LICENSE_FILE"))).trim());
if (!info.isLicensed()) throw new IllegalStateException("Axyra license not active: " + info.state());
```

An invalid or expired license does **not** throw; the process silently enters
evaluation mode ("Axyra Evaluation Copy" first tab, banner on PDF/PNG, 100
opens/saves/renders per process, then `AxyraException`). Never copy license values
into code or reports, and never remove or hide evaluation marks.

## Core API (exact signatures; imports in api-index `Type :: … in package`)

```
Workbook.create()/open(Path) → Workbook   (AutoCloseable; create() has 0 sheets)
Workbook.createSheet(String) · sheet(String|int) · save(Path) · save(Path, SaveOptions)
Workbook.recalculate() · renderPdf(Path, PdfOptions) · static licenseStatus()
Sheet.cell(int r, int c) · range(String a1) · range(r1,c1,r2,c2) · usedRange()
Sheet.importData(int r, int c, List<T>[, ImportOptions]) · freezePanes(int rows, int cols)
Sheet.setColumnWidth(int col, double chars) · addChart(Chart) · addPivotTable(String, String, String)
Sheet.pivotTable(int|String) → PivotTableView.refresh() · setPaperSize(9=A4) · setLandscape(boolean)
Sheet.setPrintArea(String) · fitToPage(int w, int h)
Cell.value() → CellValue · setValue(CellValue) · setFormula(String) · setDate(LocalDate)
Cell.formula() → String|null · setStyle(CellStyle) · style()
Range.values() → CellValue[][] · setValues(CellValue[][]) · setFormulas(String[][]) · formulas()
Range.copyTo(Sheet, int r, int c) · setStyle(CellStyle) · setValidation(Validation) · addConditionalFormat(ConditionalFormat)
CellValue.number(double) · text(String) · bool(boolean) · blank()
  read: if (v instanceof CellValue.Number n) n.value()   (records Number/Text/Bool/Error/Blank/Array)
CellStyle.builder().bold().fill(Color.rgb(r,g,b)).numberFormat("#,##0.00").build(); style.toBuilder()
PdfOptions.builder().sheetNames("Report").build()
Chart.column()/bar()/line() → Chart.Builder .title(..) .series(name, valuesRef, categoriesRef) .anchor(..) .build()
Validation.builder() · ConditionalFormat.builder() · DataLabels.value() · ImportOptions.builder()
StreamWorkbook.create(Path) · addStyle(StreamStyle) → int · startSheet(String) · row(int) → StreamRow
StreamStyle.defaults().withNumberFormat(String).withBold()
StreamRow.addNumber(double[, int style]) · addText(..) · addDate(LocalDate, int style) · commit(); finish()/close()
TemplateMarkers.process(Sheet, Map<String,Object>)
```

Indices are zero-based; A1 strings are one-based. Formula strings omit the leading `=`.

## Rules and pitfalls that break code most often

**Lifetime and threads**
- `Workbook` goes in try-with-resources. `Sheet`, `Range`, `Cell` are views: after
  `close()` reading them throws `IllegalStateException`. Return extracted values, not views.
- One `Workbook` per thread at a time; sharing one throws `AxyraException: workbook is
  already in use`. Separate workbooks run in parallel: load or open a template once per thread (or per task).

**Writing**
- `setNumber`/`setNumbers` replace the cell, dropping its style, comment and hyperlink.
  Update existing cells with `Cell.setValue` / `Range.setValues` (they keep all three).
- `Range.setStyle` replaces the whole style; change one attribute per cell with
  `cell.setStyle(cell.style().toBuilder()...build())`.
- `autoFill` does not shift references. Fill down with `Range.copyTo` or per-cell
  `setFormulas`; `Range.setFormula` on a multi-cell range writes the same unshifted text.
- `importData`: `Map` elements are not supported (wrong columns) — build `CellValue[][]`
  and `setValues`. `LocalDate` becomes a date serial *without* a date format: apply one
  (or use `Cell.setDate`). JavaBeans export properties alphabetically; set columns explicitly.
- Keep identifiers like `00042` as text; strings starting with `=` written as text stay text.

**Calculation**
- Writes recalculate dependents and reads re-evaluate, so results are normally fresh;
  `save` itself does not recalculate. Call `recalculate()` before saving after
  `autoFill`, with volatile functions, or for an opened file's untouched formulas.
- `setCalcMode(MANUAL)` does not stop that and is not saved (the Javadoc says otherwise).

**Performance** (measured: 20,000 rows, 40,000 formulas)
- Every write already recalculates its dependents incrementally (~7 µs per edit here),
  while `Workbook.recalculate()` re-evaluates the whole workbook (~120 ms here). Never call
  `recalculate()` inside a loop; call it at most once, before saving, when a case under
  *Calculation* applies.
- Per-cell `cell(r,c).value()` / `setValue` cost a native call each: bulk `Range.values()` was
  ~8× faster for reads and `Range.setValues(CellValue[][])` ~3× faster for writes. Bulk
  `setFormulas` is no faster than per-cell `setFormula` (parsing dominates).
- Find the data extent once (`usedRange()` or one bulk read of a column) instead of probing
  cell by cell. Measure before and after on a sample just large enough to show the trend
  (e.g. 1k and 5k rows) and extrapolate; never run the slow version at full scale.
- `StreamWorkbook` bounds memory only for new, write-only files (limits below); it cannot
  speed up editing an existing workbook.

**Output**
- `.ods` output keeps cached values only, never formulas (SaveOptions/FormulaPolicy apply to
  XLSX only). Use `.xlsx` for live formulas and state the gap; never claim ODS formulas work.
- Pivots have no cells until `PivotTableView.refresh()` — call it before saving or rendering.
- Chart `showDataLabels(true)` is render-only; add `.dataLabels(DataLabels.value())` after each series.
- `Validation.list(...)` writes an unquoted list and hides the dropdown arrow; use
  `Validation.builder().type("list").formula1("\"A,B,C\"").showDropdown(false)`.
- `autoFitColumn` ignores number formats (`8,060.00` can show `####`); set widths explicitly.
- Single-sheet PDF: `wb.renderPdf(path, PdfOptions.builder().sheetNames("X").build())`;
  page setup (paper, landscape, print area, fit) belongs to the `Sheet`.
- `StreamWorkbook` is write-only and forward-only (strictly ascending rows, `commit()` each
  row, `finish()`): no opening files, recalculation, charts, pivots, images, merges,
  validation or rendering.
- Templates: a marker cell holding a `LocalDate` becomes text; with `:group` only the first
  inserted row reliably keeps the date format — re-apply data-row styles after `process`.
- VBA is preserved in `.xlsm` but never executed; no API runs macros. Offer a Java port.
- POI's `getCreationHelper()` / `XSSF*` classes and other vendors' APIs do not exist in
  Axyra; map the behaviour, not the class.

## Deliver and verify

Write the program, compile, and run one focused check: save, reopen (or unzip the
XLSX) and confirm the values, types, formulas and formats the task asks for. Test a
behaviour before claiming it; do not assert version-dependent behaviour you did not
observe.

This skill tells you what to look for; it is not evidence of what happened in the
user's environment. When diagnosing a reported failure, reproduce it first (on a copy,
with the original code and inputs) and quote the error or output you observed; then
show the fix removes it. If you cannot reproduce it, say so and label the cause as
likely rather than confirmed.

Report changed files, commands run, results, and gaps, separating verified
behaviour from assumptions. Name the sources you actually used (this skill, the
api-index, a Javadoc page, a test).
