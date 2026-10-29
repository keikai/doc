# Pitfalls: output formats, rendering and content objects

Measured on `1.0.0-Beta-Eval`; recheck against the resolved build by saving,
reopening and inspecting the output. Page setup, `PdfOptions` and fonts are in
[enterprise.md](enterprise.md).

| Behavior | Consequence | Workaround |
|---|---|---|
| `.ods` writes a formula as OpenFormula when it has a translation, otherwise as its value (for example `XLOOKUP`); opening an ODS reads formulas back. With an explicit `FormulaPolicy.KEEP`, such a save throws `IllegalArgumentException` naming the cell, as does any CSV/TSV/TXT save | Some ODS cells become static values | Use `.xlsx` when every formula must stay live, and report the gap |
| `addPivotTable` and the field setters write no cells in memory. A pivot created or changed through the API is built (labels, values, grand totals) automatically when the workbook is saved or rendered; a pivot in an opened file that you do not change is rebuilt only by `PivotTableView.refresh()` | Reading the pivot area before saving gives blanks; an opened file's empty pivot stays empty | Call `refresh()` before reading pivot cells, and for an opened pivot whose cells must be current |
| `Validation.list(...)` writes a quoted list and shows the in-cell arrow; a value containing a comma throws. On the builder, `showDropdown(false)` *hides* the arrow (OOXML `showDropDown="1"`) | Arrow missing when `showDropdown(false)` is set | Use `Validation.list`, or the builder with `showDropdown` unset; for values with commas use a range: `builder().type("list").formula1("$X$1:$X$9")`. Check the saved `dataValidation` |
| `ConditionalFormat` `fillColor` writes a solid pattern with the colour as foreground; Excel's own files use the background colour | Usually renders the same, but differs from files saved by Excel | Accept, or compare in the target viewer when fidelity matters |
| `Workbook.theme()` returns `null` for a newly created workbook; a loaded style colour can be automatic, indexed, themed or RGB | Calling a theme method or `Color.toHex()` unconditionally can throw | Null-check the theme and call `color.isRgb()` before `toHex()`; preserve non-RGB colours by kind |
| `renderSheetPng`/`renderRangePng` produce one full print page (A4 portrait ≈ 794 px wide at scale 1.0). The range variant only limits the content to that range; it does not crop the image | Small data sits in the corner of a large image | Adjust `ImageOptions.scale`/`targetWidthPx`, or crop the image afterwards |
| A streaming writer (`StreamWorkbook`) is write-only | It cannot open files and has no recalculation, charts, pivots, images, merges, validation or rendering | Use a full `Workbook` for those; see [enterprise.md](enterprise.md) |

## Rendering fidelity

Do not promise exact Excel visual equivalence without comparing representative
output; a nonempty PDF file alone is not a visual-fidelity test. Check PDF text
(for example with `pdftotext`) and page count, and look at the pages when layout
matters.

## Not supported

VBA is preserved in `.xlsm` round trips but never executed. `vbaModules()` only
reads module source, and no API runs a macro. Say so, and offer to port the macro
logic to Java.
