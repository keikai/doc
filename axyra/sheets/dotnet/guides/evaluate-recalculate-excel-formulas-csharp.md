---
title: 'Recalculate Excel Formulas in C# with Axyra Sheets'
excerpt: 'Recalculate Excel formulas in C# and .NET with Axyra Sheets. Evaluate formulas without Excel, refresh cached results, and control automatic or manual calculation.'
permalink: /axyra/sheets/dotnet/guides/evaluate-recalculate-excel-formulas-csharp
redirect_from:
  - /axyra/dotnet/guides/evaluate-recalculate-excel-formulas-csharp
keyword: 'recalculate Excel formulas in C#'
sidebar:
  nav: "axyra-dotnet-guides"
---

# Recalculate Excel Formulas in C# with Axyra Sheets

A .NET application may update sales assumptions in an Excel forecast, fill inputs in a financial template, or calculate totals before exporting a report. In each case, it needs current formula results without requiring someone to open the file in Excel.

This guide shows how to evaluate and recalculate Excel formulas in C# with Axyra Sheets. You will write formulas, read their results, update an existing workbook, and recalculate before reading or exporting results when a refresh is needed. It also explains cached results and automatic and manual calculation modes.

## TL;DR

- Axyra evaluates Excel formulas inside your .NET process; no desktop Excel process or Office interop is required.
- Automatic mode evaluates new formulas immediately and recalculates dependent formulas incrementally after input changes.
- `Formula` returns formula source, `Value` returns its result, and `Evaluate(...)` calculates an expression without writing a cell.
- Use `RecalculateDirty()` for dirty formulas or one full `Recalculate()` at a workflow boundary; never recalculate inside a row or cell loop.
- `Save()` writes the current state and does not trigger a full recalculation.
- Formula errors such as `#DIV/0!` are typed `CellValue.Error` values that an application can inspect and report.

## Table of contents

- [How does Axyra calculate Excel formulas in C#?](#how-does-axyra-calculate-excel-formulas-in-c)
- [How do you read the formula and its result?](#how-do-you-read-the-formula-and-its-result)
- [When do you need to recalculate?](#when-do-you-need-to-recalculate)
- [What is the difference between Recalculate and RecalculateDirty?](#what-is-the-difference-between-recalculate-and-recalculatedirty)
- [How does manual calculation mode work?](#how-does-manual-calculation-mode-work)
- [How do you evaluate an expression without writing a cell?](#how-do-you-evaluate-an-expression-without-writing-a-cell)
- [How do you handle formula errors and arrays?](#how-do-you-handle-formula-errors-and-arrays)
- [What is a safe open-edit-save workflow?](#what-is-a-safe-open-edit-save-workflow)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## How does Axyra calculate Excel formulas in C#?

Axyra parses formulas, tracks their dependencies, and calculates results in the .NET process, through its native engine. In the default automatic mode, setting a formula evaluates it immediately, and later writes recalculate formulas that depend on the changed cells. This gives server-side applications current results without automating Excel or adding an office-suite runtime. The following example creates a workbook, writes two input values, and calculates their product. Later snippets using `sheet` and `wb` belong inside an open workbook scope.

```csharp
using Axyra.Sheets;

using Workbook wb = new Workbook();
Sheet sheet = wb.Sheets.Add("Calculation");
sheet[1, 1].Value = 3;
sheet[1, 2].Value = 17;
sheet[1, 3].Formula = "B2*C2";   // no leading '='

CellValue result = sheet[1, 3].Value;
// Number { Value = 51 }
```

Within the same workbook scope, changing B2 updates the dependent formula in D2:

```csharp
sheet[1, 1].Value = 4;
double total = sheet[1, 3].GetValue<double>();
// 68
```

This incremental calculation makes a full-workbook recalculation after every edit unnecessary.

## How do you read the formula and its result?

A formula cell has source text and a result:

```csharp
Cell cell = sheet[1, 3];

string? source = cell.Formula;   // "B2*C2"
CellValue value = cell.Value;    // Number { Value = 68 }
```

For a block, read both in bulk:

```csharp
CellRange block = sheet["D2:D10000"];
string?[,] formulas = block.GetFormulas();
CellValue[,] values = block.GetValues();
```

Entries in `formulas` are `null` where a cell does not contain a formula. Formula text uses canonical English names and comma separators. If the application presents localized formula text, use `SetLocalizedFormula(...)` and `GetLocalizedFormula(...)` at the UI boundary; keep canonical formulas in storage and code:

```csharp
sheet[3, 0].SetLocalizedFormula("=SUMME(B2:C2)", "de-DE");
string? stored = sheet[3, 0].Formula;                     // "SUM(B2:C2)"
string? german = sheet[3, 0].GetLocalizedFormula("de");   // "SUMME(B2:C2)"
```

## When do you need to recalculate?

Most workflows do not need a full recalculation after every change. Add one at a clear boundary when at least one of these conditions applies:

- The workbook was opened from Excel or another tool, and formulas you did not touch may carry stale cached results.
- The workbook contains volatile functions such as `NOW()` whose cached values must be refreshed for this run.
- The application registered a user-defined function and its implementation or inputs outside the sheet changed.
- The workbook is in `CalcMode.Manual` and dependent formulas have not been updated.
- You are about to export cached values, render output, or make a business decision that must use a fully refreshed model.

```csharp
using Workbook wb = Workbook.Open("forecast.xlsx");
Sheet inputs = wb.Sheets["Inputs"];
inputs[4, 2].Value = 1.08;

wb.Recalculate();
wb.Save("forecast-updated.xlsx");
```

`Save()` writes the state currently held by the workbook. It does not trigger a whole-workbook calculation.

{: .notice--info}
**Recalculate once, not in the loop.** A full recalculation walks every formula. Put it after the edits and before the read, render, or save that requires current results.

## What is the difference between Recalculate and RecalculateDirty?

`RecalculateDirty()` evaluates formulas marked dirty since the last calculation. `Recalculate()` evaluates every formula cell.

| Method | Scope | Use it when |
|---|---|---|
| Automatic dependency updates | Dependents of each write | Normal edits in automatic mode |
| `RecalculateDirty()` | Formula cells currently marked dirty | Manual mode or controlled batches where the dirty set is trustworthy |
| `Recalculate()` | Every formula cell | Opened caches may be stale, volatile functions must refresh, or final output needs a known full refresh |

## How does manual calculation mode work?

In automatic mode, changing an input updates formulas that depend on it. Manual mode lets an application apply a group of input changes before requesting recalculation, which can be useful for large updates. Set `CalcMode.Manual`, apply the changes, then call `RecalculateDirty()` for affected formulas or `Recalculate()` for a full refresh.

```csharp
using Axyra.Sheets.Calc;

wb.CalcMode = CalcMode.Manual;

sheet[1, 1].Value = 10;
sheet[1, 2].Formula = "B2*2";  // newly written formula evaluates to 20
sheet[1, 1].Value = 12;
// C2 still has the previous result, 20, until recalculation.

wb.RecalculateDirty();
CellValue refreshed = sheet[1, 2].Value; // Number { Value = 24 }
```

A newly written formula is still evaluated in manual mode. What stops is the automatic update of its dependents after later input changes. The mode also round-trips to XLSX, so check it when opening a file you did not create:

```csharp
if (wb.CalcMode == CalcMode.Manual)
{
    wb.Recalculate();
}
```

Use manual mode for a measured reason, such as applying a large batch before one calculation. Return to automatic mode if that is how the delivered file should behave in Excel; switching back also brings the stale results up to date.

```csharp
wb.CalcMode = CalcMode.Automatic;
```

## How do you evaluate an expression without writing a cell?

Use `Evaluate(...)` when the application needs an answer but should not change the workbook.

```csharp
CellValue grandTotal = wb.Evaluate("SUM(Sales!D2:D5000)");
CellValue localTotal = sheet.Evaluate("SUM(D2:D5000)");
```

The first expression contains an explicit sheet reference. The second is evaluated relative to the sheet it is called on. `wb.Evaluate` resolves unqualified references against the first sheet, which in a file saved by an evaluation build is the **Axyra Evaluation Copy** notice sheet, so qualify the sheet or call `Evaluate` on the `Sheet`. The expression uses the same canonical syntax as a stored formula; a leading `=` is optional.

Evaluation returns a `CellValue`, so inspect its variant rather than assuming a number.

```csharp
switch (grandTotal)
{
    case CellValue.Number number:
        Console.WriteLine(number.Value);
        break;
    case CellValue.Error error:
        throw new InvalidOperationException("Formula returned " + error.Display);
}
```

## How do you handle formula errors and arrays?

An error result is data:

```csharp
if (sheet[5, 4].Value is CellValue.Error error)
{
    Console.WriteLine(error.Display); // for example #DIV/0!
}
```

An exception is reserved for a malformed API request, such as formula text that cannot be parsed (`AxyraFormulaException`). You can therefore scan a workbook containing `#REF!` and report all bad cells in one pass.

Modern dynamic-array formulas spill from an anchor cell:

```csharp
sheet[0, 0].Formula = "SORT(UNIQUE(D2:D100))";
string? spill = sheet["A1"].SpillRange();
```

If another value blocks the spill area, the result is `#SPILL!`. Treat the anchor as the authored cell and do not write into its calculated spill cells.

Circular references return an error unless iterative calculation is enabled deliberately:

```csharp
wb.SetIterativeCalculation(true, maxIterations: 100, maxChange: 0.001);
```

## What is a safe open-edit-save workflow?

This pattern recalculates once, verifies a critical result before saving, and reopens the output to confirm that its formula and cached result round-trip.

```csharp
using Axyra.Sheets;
using Axyra.Sheets.Calc;

const string input = "forecast.xlsx";
const string output = "forecast-updated.xlsx";

using (Workbook wb = Workbook.Open(input))
{
    Sheet inputs = wb.Sheets["Inputs"];
    inputs[4, 2].Value = 1.08;

    // Full refresh because the opened file may contain untouched,
    // volatile, or manually calculated formulas.
    wb.Recalculate();

    if (wb.Sheets["Summary"][8, 3].Value is CellValue.Error error)
    {
        throw new InvalidOperationException("Summary!D9 returned " + error.Display);
    }

    wb.CalcMode = CalcMode.Automatic;
    wb.Save(output);
}

// Verify the file that will be delivered, not only the in-memory model.
using (Workbook check = Workbook.Open(output))
{
    Cell d9 = check.Sheets["Summary"][8, 3];
    if (d9.Formula == null)
    {
        throw new InvalidOperationException("Summary!D9 lost its formula");
    }
    if (d9.Value is CellValue.Error reopened)
    {
        throw new InvalidOperationException("Summary!D9 reopened as " + reopened.Display);
    }
    Console.WriteLine($"Summary!D9 = {d9.Formula} -> {d9.FormattedText}");
}
```

For high-risk outputs, compare the reopened result with an expected business value instead of checking only that it is not an error.

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| Formula text is rejected or returns `#NAME?` | It uses localized separators or function names | Use canonical English formula text, or `SetLocalizedFormula` |
| Results in the saved file are stale | `Save()` was expected to recalculate | Call `Recalculate()` once when the workflow requires it |
| A large update is unexpectedly slow | Full recalculation runs inside the loop | Apply edits first, then recalculate once |
| A dependent value does not change | Workbook is in `CalcMode.Manual` | Call `RecalculateDirty()` or `Recalculate()` and review the mode |
| `#DIV/0!` throws the import off | Error results were treated as exceptions | Handle `CellValue.Error` as a value |
| A dynamic-array formula returns `#SPILL!` | The output area is blocked | Clear the spill area or move the formula |
| `wb.Evaluate("SUM(D2:D9)")` returns `0` on a reopened file | Unqualified references resolve against the first sheet, the evaluation notice sheet | Qualify the sheet or use `sheet.Evaluate(...)` |
| A UDF works in C# but shows `#NAME?` in Excel | .NET UDF implementations registered with `wb.Functions` are not stored in the file | For Excel recipients, use supported Excel formulas or export calculated values. .NET UDFs run within Axyra. |
| `ValuesOnly` output contains old results | Cached values were exported before refresh | Recalculate before the values-only save |

## FAQ

### Why use Axyra to calculate Excel formulas in C#?

Axyra provides formula parsing, dependency tracking, automatic and manual calculation modes, expression evaluation, and typed error results in one .NET API. Applications can calculate and verify workbook results in an ASP.NET Core service, a background worker, or a batch job without launching Excel.

### Does Axyra automatically calculate Excel formulas?

Yes, in automatic mode. Writing a formula evaluates it, and later input writes update dependent formulas incrementally. A full `Recalculate()` is only needed when the current cache cannot be trusted or the workbook is in manual mode.

### Does saving an Excel file recalculate formulas?

No. `Save()` writes the workbook's current formula text and cached results. Recalculate explicitly before saving when the workflow requires a full refresh.

### How do I get a formula instead of its result?

Read `cell.Formula` or call `range.GetFormulas()`. Read `Value` or call `GetValues()` for results. Axyra formula strings omit the leading `=`.

### What is the difference between `RecalculateDirty()` and `Recalculate()`?

`RecalculateDirty()` processes formulas marked dirty. `Recalculate()` evaluates every formula in the workbook. Use the smaller scope when it is sufficient; use the full call when opened caches or volatile formulas may be stale.

## Next steps

- [Formulas]({{ site.axyra_dotnet_devref }}/Formulas) covers calculation modes, arrays, errors, and user-defined functions.
- [Read Excel Cell Values in C# with Axyra Sheets]({{ site.axyra_dotnet }}/guides/read-excel-cell-values-csharp) explains formula results alongside strings, numbers, and dates.
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_sheets }}/contact-sales), and [product details]({{ site.axyra_site_link }}).
