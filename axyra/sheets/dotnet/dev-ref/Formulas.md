---
title: 'Formulas (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Formulas
redirect_from:
  - /axyra/dotnet/dev-ref/Formulas
---

Axyra Sheets carries a complete Excel-compatible formula parser and evaluator:
more than 500 built-in functions, dynamic arrays with spill, structured references,
iterative calculation, and user-defined functions written as C# delegates.

```csharp
using Axyra.Sheets.Formula;

Console.WriteLine(BuiltInFunctions.Count);              // how many are implemented
Console.WriteLine(BuiltInFunctions.Contains("XLOOKUP"));
foreach (string name in BuiltInFunctions.Names) { /* ... */ }
```

`BuiltInFunctions.Names` is the authoritative answer for a given build — prefer it
over any list in documentation. Names are upper-case and sorted, and `Contains`
ignores case.

# Writing and evaluating

In the default automatic mode, results are kept current for you. Writing a
formula evaluates it, and every later write recalculates the formulas that
depend on the changed cell, incrementally:

```csharp
sheet[1, 3].Formula = "B2*C2";
CellValue v = sheet[1, 3].Value;   // already evaluated

wb.RecalculateDirty();   // only cells marked dirty since the last calculation
wb.Recalculate();        // every formula cell
```

Formula text has no leading `=` (a typed one is dropped). A formula that does not
parse throws `AxyraFormulaException` and writes nothing.

`Save` does not recalculate, so call `Recalculate()` once before saving when a
result can be stale: for the untouched formulas (including volatile ones such as
`NOW`) of a file written by another tool (their stored results are
trusted until something they depend on changes), after registering a
user-defined function whose results changed, or in `Manual` mode. Never call it
inside a loop — it re-evaluates the whole workbook each time, while the
incremental updates are already cheap.

To evaluate an expression without writing it into a cell:

```csharp
CellValue total = wb.Evaluate("SUM(Sales!B2:B50)");
CellValue local = sheet.Evaluate("SUM(B2:B50)");   // relative to a sheet
```

`wb.Evaluate` resolves unqualified references against the first sheet;
`sheet.Evaluate` against that sheet.

# Calculation mode

```csharp
using Axyra.Sheets.Calc;

wb.CalcMode = CalcMode.Manual;
CalcMode mode = wb.CalcMode;
```

| Mode | Behaviour |
|---|---|
| `Automatic` | The default |
| `Manual` | Dependents are not recalculated when their inputs change; call `RecalculateDirty()` or `Recalculate()` |
| `AutomaticExceptTables` | Automatic, except data tables |

In `Manual` mode a formula is still evaluated when you write it; only the
automatic update of its dependents stops. Switching back to `Automatic` catches
up. The mode is a property of the workbook and is written to the file
(`<calcPr calcMode="manual">`), so it round-trips and also tells Excel how to
treat the file.

## Iterative calculation

For deliberately circular models:

```csharp
wb.SetIterativeCalculation(true, maxIterations: 100, maxChange: 0.001);
```

Without it, a circular reference is an error. With it, the engine iterates until
either the change falls below the threshold or the iteration cap is reached.
`wb.SetIterativeCalculation(true)` uses Excel's defaults of 100 passes and 0.001.

# Arrays and spill

Modern dynamic-array formulas return a region and *spill* into the cells below
and to the right:

```csharp
sheet[0, 1].Formula = "SORT(UNIQUE(A2:A100))";

string? spilled = sheet["B1"].SpillRange();   // e.g. "B1:B37"
```

The formula lives in one cell — the *anchor* — and the spilled cells are
computed, not authored. Writing into a cell a formula wants to spill into
produces `#SPILL!`. `SpillRange()` returns `null` for a cell that is not part of an
array.

Legacy CSE array formulas, entered with Ctrl+Shift+Enter in Excel, occupy their
range instead of spilling:

```csharp
sheet["E1:G3"].SetArrayFormula("MMULT(A1:C3, A5:C7)");
```

Both forms are supported and both round-trip. New code should prefer dynamic
arrays.

# Structured references

Table references work as they do in Excel:

```csharp
sheet[10, 0].Formula = "SUBTOTAL(109, Sales[Amount])";
sheet[11, 0].Formula = "SUM(Sales[[#Totals],[Amount]])";
```

They are adjusted when the table is renamed, resized, or has columns inserted.
See [Content Objects]({{ site.axyra_dotnet_devref }}/Content_Objects).

# Localized formulas

The stored formula is always canonical English with `,` separators. Localization
is applied on the way in and out:

```csharp
cell.SetLocalizedFormula("SUMME(B2:B50)", "de-DE");
string? german = cell.GetLocalizedFormula("de-DE");
string? canonical = cell.Formula;          // "SUM(B2:B50)"
```

Use this for a UI that presents formulas in the user's language. Do not store the
localized form — it is not portable. German, French, Spanish, Italian,
Portuguese, and Dutch function names are supported.

# User-defined functions

Register a C# function on the workbook and use it from a formula:

```csharp
wb.Functions.RegisterNumeric("TRIANGLE", args => args[0] * (args[0] + 1) / 2);

sheet[0, 0].Formula = "TRIANGLE(10)";
double value = sheet[0, 0].GetValue<double>();   // 55
```

`RegisterNumeric` is the fast path for numbers: the delegate takes `double[]` and
returns `double`. Arguments are coerced to numbers; text that is not a number
gives `#VALUE!`.

## Typed user-defined functions

When numbers are not enough — text arguments, range arguments, deliberate error
returns — use `Register` instead. Each argument arrives as the `CellValue` the
engine evaluated for it, and the result is a `CellValue`:

```csharp
wb.Functions.Register("SECOND_LARGEST", args =>
{
    if (args[0] is not CellValue.Array a)
    {
        return CellValue.OfError(CellError.Value);   // #VALUE!
    }
    double[] all = a.Values.Cast<CellValue>()
            .OfType<CellValue.Number>()
            .Select(n => n.Value)
            .OrderDescending()
            .ToArray();
    return all.Length < 2 ? CellValue.OfError(CellError.NotAvailable) : all[1];
});
```

- A scalar operand — including a single-cell reference — arrives as
  `CellValue.Number`, `.Text`, `.Bool`, `.Error`, or `.Blank`.
- An area argument such as `A1:B2`, and an array literal such as `{1,2;3,4}`,
  arrive as `CellValue.Array`, a matrix indexed `[row, column]`.
- Return any `CellValue` (numbers, strings, and booleans convert implicitly).
  Returning a `CellValue.Array` produces an array result the engine treats like
  any other. Returning `null` surfaces as `#VALUE!`.
- A function that throws is not swallowed silently: the exception is mapped to
  `#VALUE!`.

`Register` and `RegisterNumeric` share one namespace per workbook, ignoring case;
registering a name again replaces the function. `wb.Functions.Contains(name)`
tells what is registered. Two constraints worth stating plainly:

- **A UDF must not call back into the same workbook while it runs.** The engine
  holds the model during evaluation; re-entering it is not supported, and the
  formula becomes `#VALUE!`.
- **UDFs are not stored in the file.** A workbook saved with `TRIANGLE(10)` in a
  cell will show `#NAME?` in Excel, and in your own application until the
  function is registered again. Register UDFs during workbook setup, before
  recalculating.

# Errors

Formula errors are values, not exceptions:

```csharp
CellValue result = sheet[0, 0].Value;
if (result is CellValue.Error e)
{
    Console.WriteLine($"error {e.Display} (code {(int)e.Code})");
}
```

`CellValue.Error.Code` is a `CellError` whose number is Excel's `ERROR.TYPE` code.
`AxyraFormulaException` is thrown for problems with the *request* — a formula
that will not parse, for instance — not for a formula that evaluates to `#REF!`.

# Beyond Excel's formula bar

The .NET API also covers a few calculation tools of Excel's own UI:

- **Tracing:** `cell.Precedents`, `cell.Dependents`, and `cell.AllDependents` list
  the cells a formula reads and the cells that read it.
- **Goal seek:** `wb.GoalSeek(targetCell, 13.0, changingCell)` finds the input
  that makes a formula reach a value.
- **Reference style:** `wb.FormulaToR1C1(formula, row, column)` and
  `wb.FormulaToA1(...)` convert between A1 and R1C1.
- **Scenarios:** `sheet.Scenarios.Add(name, cells, values)` and
  `sheet.Scenarios.Show(index)` store and apply what-if inputs.

{: .notice--info}
**Runnable example:** [`DevRef/FormulasExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/FormulasExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/formulas`.

# Next

- [Cells and Ranges]({{ site.axyra_dotnet_devref }}/Cell_and_Range)
- [Pivot Tables]({{ site.axyra_dotnet_devref }}/Pivot_Table)
