# Pitfalls: writing values, formulas and styles

Measured on `1.0.0-Beta.FL.20261012-Eval`. Treat each row as a hypothesis for the version
the project resolves: confirm it by writing, saving, reopening and reading back.

## Workbook, sheets and cells

- `Sheet`, `Range` and `Cell` are views of the workbook. After `close()`, reading or
  writing through them throws `IllegalStateException` (for example `Range.values()`),
  while plain coordinate getters such as `firstRow()` may still answer; that does
  not make the view usable. Return extracted values or bytes.
- Java sheet/cell indices are zero-based; A1 references are one-based. Formula
  conversion anchors (`formulaToR1C1` / `formulaToA1`) are the exception: they are 1-based.
- A `Sheet` follows its tab when other sheets are inserted, moved or deleted
  and exposes its current position through `index()`. It has no `equals`, and every
  `sheet(...)`/`sheets()` call returns a new object, so
  `sheets().indexOf(sheet)` returns -1. Use `sheet.index()` for its current position.
- Read values by pattern-matching the `CellValue` records (`Number`, `Text`, `Bool`,
  `Error`, `Blank`, `Array`): `if (v instanceof CellValue.Number n) n.value()`.
  `Cell.formula()` returns the expression without `=`, or `null` for a non-formula
  cell (including text such as `"=x"`).

## Values, formulas and styles

| Behavior | Consequence | Workaround |
|---|---|---|
| Value writes (`setValue`, `setValues`, `setNumber`, `setNumbers`) keep the cell's style, comment and hyperlink; `setDate` keeps them and adds a date format | — | Read the style and attached objects back when preservation matters |
| `Range.setFormula` on a multi-cell range, `Range.autoFill` and `Range.copyTo` shift relative references like Excel (`$` anchors stay) | Relative formulas intentionally differ per destination | Use `setFormulas(String[][])` when every cell needs literal formula text; read `formulas()` back |
| `Range.setArrayFormula("=A1*3")` keeps the leading `=` inside the expression and evaluates to `Error[code=3]`; `setFormula`/`setFormulas` strip it | Broken formula | Never pass the `=`; `Range.formulas()` also returns text without it |
| `Range.setStyle` replaces the whole style; `Range.style()` returns only the top-left cell's style | `range.setStyle(range.style().toBuilder().bold().build())` flattens mixed formatting | Change one attribute per cell: `cell.setStyle(cell.style().toBuilder()...build())` |
| There is no API to set a quote prefix (`CellStyle.quotePrefix()` only reads one from an opened file) | Nothing marks text that looks like a formula | Write such strings as text values (`CellValue.text("=x")` stays text); `importData` keeps strings starting with `=` as text |

## `Sheet.importData` for records, beans and JSON

`Sheet.importData(row, col, list[, ImportOptions])` suits stable schemas.

- **Column order:** records export in component order; JavaBeans export their
  `getX`/`isX` properties in **alphabetical** order; otherwise public fields are
  used. Set `ImportOptions` columns explicitly whenever the order matters.
- **Maps:** each `Map` element is a row; its keys become the columns in
  the order first met across the rows, and a missing key leaves a blank cell. Use
  `ImportOptions` columns for a fixed order.
- **Elements:** every element must be the same class (or all maps); a `null` element
  or mixed classes throw `AxyraException`.
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
- `setCalcMode(CalcMode.MANUAL)` suspends it: results wait for `recalculate()`. The
  mode is saved to and read from XLSX.
- Results can go stale in two cases:
  - the workbook is in `CalcMode.MANUAL` (also when an opened file was saved that way);
  - formulas in an opened file, whose stored results are trusted (and saved as they
    are) until something they depend on is edited.

  Call `recalculate()` once before saving whenever either applies. Volatile functions
  such as `RAND` recalculate on every write. Test before claiming that a value is stale.
