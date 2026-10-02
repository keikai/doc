# Pitfalls: writing values, formulas and styles

Measured on `0.1.0.FL.20260922-Eval` (public API identical to `0.1.0.FL.20260916-Eval`)
and re-verified on `0.1.0.FL.20260930-Eval`; notes mark where the older build differs. Treat each row
as a hypothesis for the version the project resolves: confirm it by writing,
saving, reopening and reading back. When the build still shows the behavior, apply
the workaround and say so in the report.

## Workbook, sheets and cells

- `Sheet`, `Range` and `Cell` are views of the workbook. After `close()`, reading or
  writing through them throws `IllegalStateException` (for example `Range.values()`),
  while plain coordinate getters such as `firstRow()` may still answer; that does
  not make the view usable. Return extracted values or bytes.
- Java indices are zero-based; A1 references are one-based.
- A `Sheet` is a view of a sheet *index*. It has no `equals`, and every
  `sheet(...)`/`sheets()` call returns a new object, so `sheets().indexOf(sheet)`
  returns -1. Use `sheet.index()`, and fetch sheets by name again after inserting,
  moving or deleting sheets.
- Read values by pattern-matching the `CellValue` records (`Number`, `Text`, `Bool`,
  `Error`, `Blank`, `Array`): `if (v instanceof CellValue.Number n) n.value()`.
  `Cell.formula()` returns the expression without `=`, or `null` for a non-formula
  cell (including text such as `"=x"`).

## Values, formulas and styles

| Behavior | Consequence | Workaround |
|---|---|---|
| `Sheet.setNumber` and `Range.setNumbers` replace the cell completely, dropping its style, hyperlink and comment. `setNumbers` keeps them only if the array contains a `NaN` | Updating a formatted report loses number formats, fonts, fills, links and comments | Use `Cell.setValue` or `Range.setValues(CellValue[][])`, which keep all three; `setDate`, `setFormula`, `clear` and `importData` keep the style too |
| `Range.autoFill(target)` copies a formula verbatim, without shifting relative references, and does not track the copies as dependents | Silently wrong totals, even in the public create-file example; copies may keep stale results | Use `Range.copyTo(sheet, row, col)`, which shifts relative references and recalculates, or write each cell's formula with `setFormulas(String[][])`. Read `formulas()` back |
| `Range.setFormula` on a multi-cell range writes the same unshifted text into every cell, and each cell becomes its own dynamic-array anchor | Wrong references; `#SPILL!` for spilling formulas | Put a spilling formula only in the top-left cell; use `setFormulas` for per-row formulas |
| `Range.setArrayFormula("=A1*3")` keeps the leading `=` inside the expression and evaluates to `Error[code=3]`. `setFormula`/`setFormulas` strip it, but `0.1.0.FL.20260916-Eval` did not and returned `#VALUE!` for those too | Broken formulas, depending on the method and build | Never pass the `=`; `Range.formulas()` also returns text without it |
| `Range.setStyle` replaces the whole style; `Range.style()` returns only the top-left cell's style | `range.setStyle(range.style().toBuilder().bold().build())` flattens mixed formatting | Change one attribute per cell: `cell.setStyle(cell.style().toBuilder()...build())` |
| The `CellStyle` quote prefix has been reported as not saved (not yet confirmed) | Do not rely on it to protect text that looks like a formula | Write such strings as text values; `importData` keeps strings starting with `=` as text. Check the saved file |

## `Sheet.importData` for records, beans and JSON

`Sheet.importData(row, col, list[, ImportOptions])` suits stable schemas.

- **Column order:** records export in component order; JavaBeans export their
  `getX`/`isX` properties in **alphabetical** order; otherwise public fields are
  used. Set `ImportOptions` columns explicitly whenever the order matters.
- **Elements:** every element must be the same class; a `null` element or mixed
  classes throw.
- **Maps are not supported.** A `Map` is read as a bean and silently produces the
  wrong columns. For maps or dynamic JSON, build a rectangular `CellValue[][]` and
  call `Range.setValues`, handling absent and null values explicitly.
- **Conversion:**
  - `Number` (including `BigDecimal`) becomes a double, so check precision.
  - `null` becomes a blank cell.
  - `LocalDate`, `LocalDateTime` and `java.util.Date` become date serials
    **without a date format**. Apply one afterwards, or use `Cell.setDate`, which
    formats them.
  - Other types (enums, `Instant`) become `toString()` text.
- **Headers:** written by default, and the returned count includes the header row.
  For an empty list a header is written only when `columns` or `columnLabels` is
  given. `headerStyle` replaces the header cells' style; other existing styles stay.

Keep text identifiers such as `00042` as text, and keep explicit number formats.

## Calculation

- Every cell write recalculates the formulas that depend on it, and reading a
  formula cell re-evaluates it when needed. Results and saved caches are normally
  fresh without `recalculate()`. `save` itself does not recalculate.
- `setCalcMode(CalcMode.MANUAL)` does not suspend any of this. It is neither saved
  to nor read from XLSX, and iterative-calculation settings are not saved either.
  The Javadoc says otherwise; trust a test.
- Results can go stale in three cases:
  - formulas created by `Range.autoFill`, which are not tracked as dependents;
  - volatile functions such as `NOW` and `RAND`;
  - formulas in an opened file, whose stored results are trusted until something
    they depend on is edited.

  Call `recalculate()` before saving whenever any of these applies. It is also the
  simplest correct default. Test before claiming that a value is stale.
