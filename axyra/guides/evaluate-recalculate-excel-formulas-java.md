---
title: 'Recalculate Excel Formulas in Java with Axyra Sheets'
excerpt: 'Recalculate Excel formulas in Java with Axyra Sheets. Evaluate formulas without Excel, refresh cached results, and control automatic or manual calculation.'
permalink: /axyra/guides/evaluate-recalculate-excel-formulas-java
keyword: 'recalculate Excel formulas in Java'
---

# Recalculate Excel Formulas in Java with Axyra Sheets

A Java application may update sales assumptions in an Excel forecast, fill inputs in a financial template, or calculate totals before exporting a report. In each case, it needs current formula results without requiring someone to open the file in Excel.

This guide shows how to evaluate and recalculate Excel formulas in Java with Axyra Sheets. You will write formulas, read their results, update an existing workbook, and recalculate before reading or exporting results when a refresh is needed. It also explains cached results and automatic and manual calculation modes.

## TL;DR

- Axyra evaluates Excel formulas inside Java; no desktop Excel process is required.
- Automatic mode evaluates new formulas immediately and recalculates dependent formulas incrementally after input changes.
- `formula()` returns formula source, `value()` returns its result, and `Workbook.evaluate(...)` calculates an expression without writing a cell.
- Use `recalculateDirty()` for dirty formulas or one full `recalculate()` at a workflow boundary; never recalculate inside a row or cell loop.
- `save()` writes the current state and does not trigger a full recalculation.
- Formula errors such as `#DIV/0!` are typed `CellValue.Error` values that an application can inspect and report.

## Table of contents

- [How does Axyra calculate Excel formulas in Java?](#how-does-axyra-calculate-excel-formulas-in-java)
- [How do you read the formula and its result?](#how-do-you-read-the-formula-and-its-result)
- [When do you need to recalculate?](#when-do-you-need-to-recalculate)
- [What is the difference between recalculate and recalculateDirty?](#what-is-the-difference-between-recalculate-and-recalculatedirty)
- [How does manual calculation mode work?](#how-does-manual-calculation-mode-work)
- [How do you evaluate an expression without writing a cell?](#how-do-you-evaluate-an-expression-without-writing-a-cell)
- [How do you handle formula errors and arrays?](#how-do-you-handle-formula-errors-and-arrays)
- [What is a safe open-edit-save workflow?](#what-is-a-safe-open-edit-save-workflow)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## How does Axyra calculate Excel formulas in Java?

Axyra parses formulas, tracks their dependencies, and calculates results in the Java process. In the default automatic mode, `setFormula(...)` evaluates a formula immediately, and later writes recalculate formulas that depend on the changed cells. This gives server-side applications current results without automating Excel or adding an office-suite runtime. The following example creates a workbook, writes two input values, and calculates their product. Later snippets using `sheet` and `wb` belong inside an open workbook scope.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;

try (Workbook wb = Workbook.create()) {
    Sheet sheet = wb.createSheet("Calculation");
    sheet.cell(1, 1).setValue(CellValue.number(3));
    sheet.cell(1, 2).setValue(CellValue.number(17));
    sheet.cell(1, 3).setFormula("B2*C2");   // no leading '='

    CellValue result = sheet.cell(1, 3).value();
    // CellValue.Number(51.0)
}
```

Within the same workbook scope, changing B2 updates the dependent formula in D2:

```java
sheet.cell(1, 1).setValue(CellValue.number(4));
double total = ((CellValue.Number) sheet.cell(1, 3).value()).value();
// 68.0
```

This incremental calculation makes a full-workbook recalculation after every edit unnecessary.

## How do you read the formula and its result?

A formula cell has source text and a result:

```java
Cell cell = sheet.cell(1, 3);

String source = cell.formula();  // "B2*C2"
CellValue value = cell.value();  // Number(68.0)
```

For a block, read both in bulk:

```java
Range block = sheet.range("D2:D10000");
String[][] formulas = block.formulas();
CellValue[][] values = block.values();
```

Entries in `formulas` are `null` where a cell does not contain a formula. Formula text uses canonical English names and comma separators. If the application presents localized formula text, use `setFormulaLocalized(...)` and `formulaLocalized(...)` at the UI boundary; keep canonical formulas in storage and code.

## When do you need to recalculate?

Most workflows do not need a full recalculation after every change. Add one at a clear boundary when at least one of these conditions applies:

- The workbook was opened from Excel or another tool, and formulas you did not touch may carry stale cached results.
- The workbook contains volatile functions such as `NOW()` whose cached values must be refreshed for this run.
- The application registered a user-defined function and its implementation or inputs outside the sheet changed.
- The workbook is in `CalcMode.MANUAL` and dependent formulas have not been updated.
- You are about to export cached values, render output, or make a business decision that must use a fully refreshed model.

```java
try (Workbook wb = Workbook.open(Path.of("forecast.xlsx"))) {
    Sheet inputs = wb.sheet("Inputs");
    inputs.cell(4, 2).setValue(CellValue.number(1.08));

    wb.recalculate();
    wb.save(Path.of("forecast-updated.xlsx"));
}
```

`save()` writes the state currently held by the workbook. It does not trigger a whole-workbook calculation.

{: .notice--info}
**Recalculate once, not in the loop.** A full recalculation walks every formula. Put it after the edits and before the read, render, or save that requires current results.

## What is the difference between recalculate and recalculateDirty?

`recalculateDirty()` evaluates formulas marked dirty since the last calculation. `recalculate()` evaluates every formula cell.

| Method | Scope | Use it when |
|---|---|---|
| Automatic dependency updates | Dependents of each write | Normal edits in automatic mode |
| `recalculateDirty()` | Formula cells currently marked dirty | Manual mode or controlled batches where the dirty set is trustworthy |
| `recalculate()` | Every formula cell | Opened caches may be stale, volatile functions must refresh, or final output needs a known full refresh |

## How does manual calculation mode work?

In automatic mode, changing an input updates formulas that depend on it. Manual mode lets an application apply a group of input changes before requesting recalculation, which can be useful for large updates. Set `CalcMode.MANUAL`, apply the changes, then call `recalculateDirty()` for affected formulas or `recalculate()` for a full refresh.

```java
import io.keikai.axyra.sheets.calc.CalcMode;

wb.setCalcMode(CalcMode.MANUAL);

sheet.cell(1, 1).setValue(CellValue.number(10));
sheet.cell(1, 2).setFormula("B2*2");  // newly written formula evaluates to 20
sheet.cell(1, 1).setValue(CellValue.number(12));
// C2 still has the previous result, 20, until recalculation.

wb.recalculateDirty();
CellValue refreshed = sheet.cell(1, 2).value(); // CellValue.Number(24.0)
```

A newly written formula is still evaluated in manual mode. What stops is the automatic update of its dependents after later input changes. The mode also round-trips to XLSX, so check it when opening a file you did not create:

```java
if (wb.calcMode() == CalcMode.MANUAL) {
    wb.recalculate();
}
```

Use manual mode for a measured reason, such as applying a large batch before one calculation. Return to automatic mode if that is how the delivered file should behave in Excel.

```java
wb.setCalcMode(CalcMode.AUTOMATIC);
```

## How do you evaluate an expression without writing a cell?

Use `Workbook.evaluate(...)` when the application needs an answer but should not change the workbook.

```java
CellValue grandTotal = wb.evaluate("SUM(Sales!D2:D5000)");
CellValue localTotal = wb.evaluate("SUM(D2:D5000)", sheet);
```

The first expression contains an explicit sheet reference. The second is evaluated relative to the supplied sheet. The expression uses the same canonical syntax as a stored formula and omits the leading `=`.

Evaluation returns a `CellValue`, so inspect its variant rather than assuming a number.

```java
if (grandTotal instanceof CellValue.Number number) {
    System.out.println(number.value());
} else if (grandTotal instanceof CellValue.Error error) {
    throw new IllegalStateException("Formula returned " + error.display());
}
```

## How do you handle formula errors and arrays?

An error result is data:

```java
CellValue value = sheet.cell(5, 4).value();
if (value instanceof CellValue.Error error) {
    System.out.println(error.display()); // for example #DIV/0!
}
```

An exception is reserved for a malformed API request, such as formula text that cannot be parsed. You can therefore scan a workbook containing `#REF!` and report all bad cells in one pass.

Modern dynamic-array formulas spill from an anchor cell:

```java
sheet.cell(0, 0).setFormula("SORT(UNIQUE(D2:D100))");
String spill = sheet.range("A1:A1").spillRange();
```

If another value blocks the spill area, the result is `#SPILL!`. Treat the anchor as the authored cell and do not write into its calculated spill cells.

Circular references return an error unless iterative calculation is enabled deliberately:

```java
wb.setIterativeCalc(true, 100, 0.001);
```

## What is a safe open-edit-save workflow?

This pattern recalculates once, verifies a critical result before saving, and reopens the output to confirm that its formula and cached result round-trip.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.calc.CalcMode;

import java.nio.file.Path;

public final class RecalculateForecast {
    public static void main(String[] args) {
        Path input = Path.of("forecast.xlsx");
        Path output = Path.of("forecast-updated.xlsx");

        try (Workbook wb = Workbook.open(input)) {
            Sheet inputs = wb.sheet("Inputs");
            inputs.cell(4, 2).setValue(CellValue.number(1.08));

            // Full refresh because the opened file may contain untouched,
            // volatile, or manually calculated formulas.
            wb.recalculate();

            CellValue check = wb.sheet("Summary").cell(8, 3).value();
            if (check instanceof CellValue.Error error) {
                throw new IllegalStateException(
                        "Summary!D9 returned " + error.display());
            }

            wb.setCalcMode(CalcMode.AUTOMATIC);
            wb.save(output);
        }

        // Verify the artifact that will be delivered, not only the in-memory model.
        try (Workbook check = Workbook.open(output)) {
            CellValue result = check.sheet("Summary").cell(8, 3).value();
            String formula = check.sheet("Summary").cell(8, 3).formula();
            if (formula == null) {
                throw new IllegalStateException("Summary!D9 lost its formula");
            }
            if (result instanceof CellValue.Error error) {
                throw new IllegalStateException(
                        "Summary!D9 reopened as " + error.display());
            }
        }
    }
}
```

For high-risk outputs, compare the reopened result with an expected business value instead of checking only that it is not an error.

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| Formula text is rejected or returns `#NAME?` | It uses localized separators or function names | Use canonical English formula text |
| Results in the saved file are stale | `save()` was expected to recalculate | Call `recalculate()` once when the workflow requires it |
| A large update is unexpectedly slow | Full recalculation runs inside the loop | Apply edits first, then recalculate once |
| A dependent value does not change | Workbook is in `CalcMode.MANUAL` | Call `recalculateDirty()` or `recalculate()` and review the mode |
| `#DIV/0!` throws the import off | Error results were treated as exceptions | Handle `CellValue.Error` as a value |
| A dynamic-array formula returns `#SPILL!` | The output area is blocked | Clear the spill area or move the formula |
| A UDF works in Java but shows `#NAME?` in Excel | Java UDF implementations are not stored in the file | For Excel recipients, use supported Excel formulas or export calculated values. Java UDF implementations run within Axyra. |
| `VALUES_ONLY` output contains old results | Cached values were exported before refresh | Recalculate before the values-only save |

## FAQ

### Why use Axyra to calculate Excel formulas in Java?

Axyra provides formula parsing, dependency tracking, automatic and manual calculation modes, expression evaluation, and typed error results in one Java API. Applications can calculate and verify workbook results in a server, batch job, or service without launching Excel.

### Does Axyra automatically calculate Excel formulas?

Yes, in automatic mode. Writing a formula evaluates it, and later input writes update dependent formulas incrementally. A full `recalculate()` is only needed when the current cache cannot be trusted or the workbook is in manual mode.

### Does saving an Excel file recalculate formulas?

No. `save()` writes the workbook's current formula text and cached results. Recalculate explicitly before saving when the workflow requires a full refresh.

### How do I get a formula instead of its result?

Call `cell.formula()` or `range.formulas()`. Call `value()` or `values()` for results. Axyra formula strings omit the leading `=`.

### What is the difference between `recalculateDirty()` and `recalculate()`?

`recalculateDirty()` processes formulas marked dirty. `recalculate()` evaluates every formula in the workbook. Use the smaller scope when it is sufficient; use the full call when opened caches or volatile formulas may be stale.

## Next steps

- [Formulas]({{ site.axyra_devref }}/Formulas) covers calculation modes, arrays, errors, and user-defined functions.
- [Read Excel Cell Values in Java with Axyra Sheets]({{ site.axyra_guides }}/read-excel-cell-values-java) explains formula results alongside strings, numbers, and dates.
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_site_link }}/java#pricing), and [product details]({{ site.axyra_site_link }}).
