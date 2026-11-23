# Pitfalls: output formats, rendering and content objects

Measured on `1.0.0-fl.20261116`; recheck against the resolved build by saving,
reopening and inspecting the output. Page setup, `PdfOptions`, charts and fonts are in
[enterprise.md](enterprise.md).

| Behavior | Consequence | Workaround |
|---|---|---|
| `.ods` writes a formula as OpenFormula when it has a translation, otherwise as its value (for example `XLOOKUP`); opening an ODS reads formulas back. With `new SaveOptions { FormulaPolicy = FormulaPolicy.Keep }`, such a save throws `ArgumentException` naming the cell, as does any CSV save | Some ODS cells become static values | Use `.xlsx` when every formula must stay live, and report the gap |
| `sheet.PivotTables.Add` and its field collections write no cells in memory. A pivot created or changed through the API is built (labels, values, grand totals) when the workbook is saved or rendered; a pivot in an opened file that you do not change is rebuilt only by `pivot.Refresh()` | Reading the pivot area before saving gives blanks (`UsedRange` null) | Call `Refresh()` before reading pivot cells, and for an opened pivot whose cells must be current |
| `Validation.List(...)` writes a quoted list and shows the in-cell arrow; a value containing a comma throws `ArgumentException`. `ShowDropdown` defaults to `true`; setting it to `false` *hides* the arrow (OOXML `showDropDown="1"`) | Arrow missing when `ShowDropdown = false` | Use `Validation.List`, or `new Validation(ValidationType.List) { Formula1 = "$X$1:$X$9" }` without touching `ShowDropdown` for values with commas. Check the saved `dataValidation` |
| A conditional format's `ConditionalStyle.FillColor` writes a solid pattern with the colour as foreground (`fgColor`); Excel's own files use the background colour | Usually renders the same, but differs from files saved by Excel | Accept, or compare in the target viewer when fidelity matters |
| `wb.Theme` is `null` for a newly created workbook (also after save/reopen); a loaded style colour can be automatic, indexed, themed or RGB. `Color.ToHex()` throws `InvalidOperationException` on a non-RGB colour (the default font colour is automatic) | Calling a theme member or `ToHex()` unconditionally throws | Null-check the theme and test `color.IsRgb` before `ToHex()`; preserve non-RGB colours by kind (`IsAuto`, `IsIndexed`, `IsTheme`) |
| `sheet.RenderImage()` / `range.RenderImage()` produce one full print page (A4 portrait = 794 × 1123 px at `Scale` 1.0). The range variant only limits the content to that range; it does not crop the image | Small data sits in the corner of a large image | Set `ImageOptions.WidthInPixels`/`Scale`, or crop the image afterwards |
| A streaming writer (`StreamWorkbook`) is write-only | It cannot open files and has no recalculation, charts, pivots, images, merges, validation or rendering | Use a full `Workbook` for those; see [enterprise.md](enterprise.md) |

## Rendering fidelity

`sheet.Sparklines.Add(SparklineType.Line, "Data!B2:M6", "N2:N6")` creates one sparkline
per destination cell: one data row for one cell, or matching source/destination row
counts. A shape mismatch throws `AxyraException`. An unqualified data reference is
qualified with the owning sheet's name.
`sheet.Consolidate(...)` aligns source ranges by position unless
`ConsolidateOptions { TopRow = true / LeftColumn = true }` asks for label matching.

Do not promise exact Excel visual equivalence without comparing representative
output; a nonempty PDF file alone is not a visual-fidelity test. Check PDF text
(for example with `pdftotext`) and page count, and look at the pages when layout
matters.

## Not supported

VBA is preserved in `.xlsm` round trips but never executed. `wb.VbaModules` only
reads module source, and no API runs a macro. Say so, and offer to port the macro
logic to C#.
