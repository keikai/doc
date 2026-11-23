# Pitfalls: writing values, formulas and styles

Measured on `1.0.0-fl.20261116`. Treat each row as a hypothesis for the version
the project resolves: confirm it by writing, saving, reopening and reading back.

## Workbook, sheets and cells

- `new Workbook()` starts with no sheets. `wb.Sheets` is an `IReadOnlyList<Sheet>`
  (`Count`, `foreach`, LINQ) with `Add` (appends), `Insert`, `Move`, `Remove`,
  `RemoveAt`, `Contains`, `IndexOf(name)` and `TryGet(name, out Sheet? s)`;
  `wb.Sheets["Nope"]` throws `KeyNotFoundException`.
- `sheet["B2"]` / `sheet["A1:C3"]` return a `CellRange` (one cell is still a range;
  it has `Value`, `Style`, `SetFormula`); only `sheet[row, column]` returns a `Cell`
  (`Formula`, `DateValue`, `Comment`, `Address`).
- Column widths are in characters: `sheet.Columns[0].Width = 15` (or
  `sheet.Columns["A"]`), `sheet.Columns[0].AutoFit()`; row heights in points:
  `sheet.Rows[0].Height = 20`. Defaults: 8.43 characters, 15 pt.
- `sheet.UsedRange` returns null for an empty sheet. A `CellRange` exposes zero-based
  `FirstRow`/`FirstColumn`/`LastRow`/`LastColumn`; `sheet[r, c].Address` gives A1.
- `sheet.FreezePanes(rows, cols)` does not change `ActiveCell` (empty on a new sheet).
  When selection matters, call `sheet.SetActiveCell("A2")`.
- Resolve a defined name with `wb.Names.TryGet(name, out NamedRange? named)`; reject a
  missing name, then use `named.AsRange()` (`wb.Names[name]` throws
  `KeyNotFoundException`). `wb.GetRange("LineItems")` throws `ArgumentException:
  reference names no sheet` and `sheet["LineItems"]` throws `bad cell reference`.
  Formulas (`wb.Evaluate("SUM(LineItems)")`) do resolve names.
- `Sheet`, `CellRange` and `Cell` are views of the workbook. After `Dispose`, reading
  or writing through them throws `ObjectDisposedException` ("workbook is closed"),
  while coordinate properties such as `FirstRow` or `Row` still answer; that does
  not make the view usable. Return extracted values or bytes.
- Integer indices are zero-based; A1 strings are one-based. `wb.FormulaToR1C1` /
  `FormulaToA1` anchors are the exception: one-based (`FormulaToR1C1("A1", 1, 1)` is
  `RC`), and an anchor of 0 is silently accepted with a shifted result.
- A `Sheet` follows its tab when other tabs are inserted, moved or deleted
  (`sheet.Index` is its current position); it throws `InvalidOperationException` once
  its own tab is deleted. Each `wb.Sheets[...]` call returns a new object without
  value equality, so `wb.Sheets.ToList().IndexOf(sheet)` is -1. Use `sheet.Index`.
- `cell.Value` is a `CellValue` (`Number`, `Text`, `Bool`, `Error`, `Blank`, `Array`);
  pattern-match it: `if (cell.Value is CellValue.Number n) total += n.Value;`. A blank
  cell reads `CellValue.Blank`. `cell.GetValue<double>()` throws
  `InvalidCastException` on text; `cell.TryGetValue(out double d)` does not.
  `cell.Formula` returns the expression without `=`, or `null` for a non-formula cell
  (including text such as `"=x"`).
- `double`, `int`, `long`, `string` and `bool` convert implicitly to `CellValue`;
  dates and `decimal` do not: use `cell.DateValue`/`DateTimeValue` and
  `CellValue.Of(12.50m)` (stored as a double).

## Values, formulas and styles

| Behavior | Consequence | Workaround |
|---|---|---|
| Value writes (`Value`, `SetValues`, `SetNumbers`, `Formula`) keep the cell's style, comment and hyperlink. `DateValue`/`DateTimeValue` add `yyyy-mm-dd` / `yyyy-mm-dd hh:mm:ss` only when the format is General | A date written into a `0.00` cell shows `46053.00` | Give date cells a date `NumberFormat`, or leave them General before `DateValue` |
| `CellRange.SetFormula` on a multi-cell range, `AutoFill` and `CopyTo` shift relative references like Excel (`$` anchors stay) | Relative formulas intentionally differ per destination | Use `SetFormulas(string[,])` when every cell needs literal formula text; read `GetFormulas()` back |
| A leading `=` is stripped by `Formula`, `SetFormula`, `SetFormulas` and `SetArrayFormula` | — | Omit it anyway; `GetFormulas()` returns text without it |
| Assigning `Style` replaces the whole style (an initializer's omitted properties mean defaults: General, Calibri 11). `CellRange.Style` returns only the top-left cell's style | `range.Style = range.Style with { ... }` flattens mixed formatting onto every cell | Change one attribute per cell: `cell.Style = cell.Style with { Font = cell.Style.Font with { Bold = true } }` |
| `CellStyle.QuotePrefix` is read-only (only read from an opened file) | Nothing marks text that looks like a formula | Write such strings as values: `cell.Value = "=x"` stays text, and `ImportData` keeps strings starting with `=` as text |

```csharp
using Axyra.Sheets.Style;

CellStyle header = new CellStyle
{
    Font = new Font { Bold = true, Color = Color.White },
    Fill = Fill.Solid(Color.FromRgb(31, 78, 121)),
    HorizontalAlignment = HorizontalAlignment.Center,
};
sheet["A1:C1"].Style = header;                                  // one look for the whole range
sheet["C2:C100"].Style = new CellStyle { NumberFormat = "#,##0.00" };
Cell total = sheet[100, 2];
total.Style = total.Style with { Font = total.Style.Font with { Bold = true } };  // keep the format
```

`Axyra.Sheets.Style.Color` clashes with `System.Drawing.Color`; alias it
(`using Color = Axyra.Sheets.Style.Color;`) when both are imported.

## `Sheet.ImportData` for records, classes and dictionaries

`sheet.ImportData(row, col, items, ImportOptions?)` suits stable schemas.

- **Column order:** C# records export properties in declaration order; other classes
  export public properties in **ordinal name order** (fields, in declaration order,
  only when there are no properties). Set `ImportOptions.Columns` whenever order matters.
- **Dictionaries:** each element is a row; keys become columns in first-met order
  across rows, and a missing key leaves a blank cell. Use `Columns` for a fixed order.
- **Elements:** every element must be the first element's type (dictionaries
  excepted); a `null` element or mixed types throw `AxyraException`.
- **Conversion:**
  - numbers (including `decimal`) become doubles, so check precision;
  - `null` (and a null `int?`) becomes a blank cell;
  - `DateOnly`, `DateTime` and `DateTimeOffset` become date serials **without a date
    format** — apply one afterwards, or write them with `cell.DateValue`;
  - enums and other types become `ToString()` text.
- **Headers:** written by default (`Headers = false` omits them), and the returned count
  includes the header row. An empty collection writes nothing and returns 0 unless
  `Columns` or `ColumnLabels` is given. `HeaderStyle` replaces the header cells'
  style; other existing styles stay.

Keep text identifiers such as `00042` as strings, and keep explicit number formats.

## Calculation

- Every cell write recalculates the formulas that depend on it, and reading a
  formula cell returns the current result. Results and saved caches are normally
  fresh without `Recalculate()`. `Save` itself does not recalculate.
- `wb.CalcMode = CalcMode.Manual` (`using Axyra.Sheets.Calc;`) suspends it: results wait
  for `wb.Recalculate()`. The mode is saved to and read from XLSX.
- Results can go stale in two cases:
  - the workbook is in `CalcMode.Manual` (also when an opened file was saved that way;
    switching back to `Automatic` does not recalculate by itself);
  - formulas in an opened file, whose stored results are trusted (and saved as they
    are) until something they depend on is edited.

  Call `wb.Recalculate()` once before saving whenever either applies. Volatile
  functions such as `RAND` recalculate on every write. Test before claiming that a
  value is stale.
