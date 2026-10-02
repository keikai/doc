# Pitfalls: output formats, rendering and content objects

Measured on `0.1.0.FL.20260922-Eval`, re-verified on `0.1.0.FL.20260930-Eval`; recheck against the resolved build by saving,
reopening and inspecting the output. Page setup, `PdfOptions` and fonts are in
[enterprise.md](enterprise.md).

| Behavior | Consequence | Workaround |
|---|---|---|
| `.ods` output writes cached values only, never formulas. ODS import ignores formulas too. `SaveOptions` (including `FormulaPolicy.KEEP`) applies only to XLSX; other formats ignore it | An ODS file is a static snapshot | Recalculate before saving. Use `.xlsx` when formulas must stay live, and report the gap. Never claim ODS formulas work |
| `addPivotTable` and the field setters write no cells. The saved pivot is marked to rebuild when Excel opens it, but its cells are empty for any other reader or renderer. Only `PivotTableView.refresh()` writes the labels, values and grand totals as cells | Pivot looks empty in non-Excel readers, in validation, and in PDF/PNG output (headers only) | Call `refresh()` after configuring fields and before saving or rendering |
| `Chart` builder `showDataLabels(true)` affects rendered images only; it is not saved | Saved chart has no data labels | Add `.dataLabels(DataLabels.value())` after each `.series(...)`; verify `<c:dLbls>` in the saved chart |
| `Validation.list(...)` joins the items without quotes and sets `showDropdown(true)`, written as OOXML `showDropDown="1"`, which *hides* Excel's in-cell arrow | Dropdown arrow missing in Excel | `Validation.builder().type("list").formula1("\"Draft,Approved,Rejected\"").showDropdown(false)`; check the saved `dataValidation` |
| `ConditionalFormat` `fillColor` writes a solid pattern with the colour as foreground; Excel's own files use the background colour | Usually renders the same, but differs from files saved by Excel | Accept, or compare in the target viewer when fidelity matters |
| `autoFitColumn` counts the characters of the raw value (plus padding), ignoring number format and font | `8,060.00` in an auto-fitted column shows as `####` | Set widths explicitly for formatted numbers |
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
