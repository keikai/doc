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
| Vendor template processing | `TemplateMarkers` (`${...}` markers) | Marker grammar, empty lists, grouping, types; inserted rows do not copy styles |
| Vendor PDF conversion | Axyra rendering options | Fonts, print areas, scaling, pagination, chart support |
| Vendor streaming API | Axyra streaming writer if requirements fit | Forward-only rows, commits, feature limits, and memory measurements |

Aspose marker templates cannot be assumed to work unchanged with Axyra's `${...}`
syntax. Inspect the actual template and convert it explicitly only within the
requested scope. Check expansion effects on formulas, totals, images, and formatting.
The template entry point is `TemplateMarkers` from `0.1.0.FL.20260915-Eval` on and
`SmartMarkers` before; there is no alias, so confirm which one the resolved artifact
has. The marker grammar and expansion rules are in [pitfalls-templates.md](pitfalls-templates.md).

Libraries that recalculate lazily, or only on request, map to Axyra calls that
recalculate on every write. Keep an explicit `recalculate()` where the source
called its evaluator, but do not port manual-calculation settings: Axyra neither
honors nor saves them. POI `getCreationHelper()` and `XSSF*` classes have no Axyra
counterpart; map the behavior, not the class.

Use fully qualified names during migration if both libraries define `Workbook` or
`Cell`. Keep unrelated application logic intact. Remove the old dependency only
after remaining usages have been checked; never delete it while other code needs it.
Keikai UI migration is not a substitute for spreadsheet-library migration.

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
