---
title: 'Formulas'
permalink: /axyra/dev-ref/Formulas
---

Axyra Sheets carries a complete Excel-compatible formula parser and evaluator:
around 490 built-in functions, dynamic arrays with spill, structured references,
iterative calculation, and user-defined functions.

```java
System.out.println(Functions.count());          // how many are implemented
System.out.println(Functions.contains("XLOOKUP"));
for (String name : Functions.list()) { ... }
```

`Functions.list()` is the authoritative answer for a given build — prefer it over
any list in documentation.

# Writing and evaluating

Assigning a formula does not evaluate it. This is deliberate: bulk edits stay
cheap, and you decide when to pay for calculation.

```java
sheet.cell(1, 3).setFormula("B2*C2");

wb.recalculateDirty();   // only cells whose inputs changed
wb.recalculate();        // the whole dependency graph
```

`recalculateDirty()` is what you want almost always. `recalculate()` exists for
the cases where the dirty set cannot be trusted — after loading a file written by
another tool, or after registering a user-defined function whose results changed.

To evaluate an expression without writing it into a cell:

```java
CellValue total = wb.evaluate("SUM(Sales!B2:B50)");
CellValue local = wb.evaluate("SUM(B2:B50)", sheet);   // relative to a sheet
```

# Calculation mode

```java
wb.setCalcMode(CalcMode.MANUAL);
CalcMode mode = wb.calcMode();
```

| Mode | Behaviour |
|---|---|
| `AUTOMATIC` | The default |
| `MANUAL` | Nothing recalculates until you ask |
| `AUTOMATIC_EXCEPT_TABLES` | Automatic, except data tables |

The mode is a property of the workbook and is written to the file, so it
round-trips. Note that it describes intent for a spreadsheet *application* — in
Axyra Sheets you drive calculation explicitly regardless, so treat the setting as
metadata you preserve for whoever opens the file next.

## Iterative calculation

For deliberately circular models:

```java
wb.setIterativeCalc(true, 100, 0.001);   // enabled, max iterations, max change
```

Without it, a circular reference is an error. With it, the engine iterates until
either the change falls below the threshold or the iteration cap is reached.

# Arrays and spill

Modern dynamic-array formulas return a region and *spill* into the cells below
and to the right:

```java
sheet.cell(0, 0).setFormula("SORT(UNIQUE(A2:A100))");
wb.recalculateDirty();

String spilled = sheet.range("A1:A1").spillRange();   // e.g. "A1:A37"
```

The formula lives in one cell — the *anchor* — and the spilled cells are
computed, not authored. Writing into a cell a formula wants to spill into
produces `#SPILL!`.

Legacy CSE array formulas, entered with Ctrl+Shift+Enter in Excel, occupy their
range instead of spilling:

```java
sheet.range("E1:G3").setArrayFormula("MMULT(A1:C3, A5:C7)");
```

Both forms are supported and both round-trip. New code should prefer dynamic
arrays.

# Structured references

Table references work as they do in Excel:

```java
sheet.cell(10, 0).setFormula("SUBTOTAL(109, Sales[Amount])");
sheet.cell(11, 0).setFormula("SUM(Sales[[#Totals],[Amount]])");
```

They are adjusted when the table is renamed, resized, or has columns inserted.
See [Content Objects]({{ site.axyra_devref }}/Content_Objects).

# Localized formulas

The stored formula is always canonical English with `,` separators. Localization
is applied on the way in and out:

```java
cell.setFormulaLocalized("SUMME(B2:B50)", "de-DE");
String german = cell.formulaLocalized("de-DE");
String canonical = cell.formula();          // "SUM(B2:B50)"
```

Use this for a UI that presents formulas in the user's language. Do not store the
localized form — it is not portable.

# User-defined functions

Register a Java function and use it from a formula:

```java
wb.registerFunction("TRIANGLE", args -> args[0] * (args[0] + 1) / 2);

sheet.cell(0, 0).setFormula("TRIANGLE(10)");
wb.recalculateDirty();
CellValue result = sheet.value(0, 0);
double value = ((CellValue.Number) result).value();   // 55.0
```

`UserFunction` is a `@FunctionalInterface` taking `double[]` and returning
`double`. Arguments are coerced to numbers; the result is a number.

## Typed user-defined functions

When numbers are not enough — text arguments, range arguments, deliberate error
returns — register a `TypedUserFunction` instead. Each argument arrives as the
`CellValue` the engine evaluated for it:

```java
wb.registerTypedFunction("SECOND_LARGEST", args -> {
    if (!(args[0] instanceof CellValue.Array a)) {
        return CellValue.error(3);           // #VALUE!
    }
    double[] all = ...;                      // walk a.rows()
    return CellValue.number(secondLargest(all));
});
```

- A scalar operand — including a single-cell reference — arrives as
  `CellValue.Number`, `.Text`, `.Bool`, `.Error`, or `.Blank`.
- An area argument such as `A1:B2`, and an array literal such as `{1,2;3,4}`,
  arrive as `CellValue.Array` holding a row-major `CellValue[][]`.
- Return any scalar `CellValue`. Returning a `CellValue.Array` produces an array
  result the engine treats like any other. Returning `null` is a contract
  violation and surfaces as `#VALUE!`.
- A UDF that throws is not swallowed: the exception is mapped to `#VALUE!`.

Two constraints worth stating plainly:

- **A UDF must not call back into the same workbook while it runs.** The engine
  holds the model during evaluation; re-entering it is not supported.
- **UDFs are not stored in the file.** A workbook saved with `TRIANGLE(10)` in a
  cell will show `#NAME?` in Excel, and in your own application until the
  function is registered again. Register UDFs during workbook setup, before
  recalculating.

# Errors

Formula errors are values, not exceptions:

```java
CellValue v = sheet.value(0, 0);
if (v instanceof CellValue.Error e) {
    System.out.println("error code " + e.code());
}
```

`AxyraFormulaException` is thrown for problems with the *request* — a formula
that will not parse, for instance — not for a formula that evaluates to `#REF!`.

# Next

- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range)
- [Pivot Tables]({{ site.axyra_devref }}/Pivot_Table)
