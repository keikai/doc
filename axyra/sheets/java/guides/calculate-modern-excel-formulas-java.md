---
title: 'Calculate Excel Formulas in Java: XLOOKUP, FILTER & More'
excerpt: 'Calculate XLOOKUP, FILTER, UNIQUE, and SORT in Java with Axyra Sheets. Update dependent formulas automatically and save Excel reports with calculated results.'
permalink: /axyra/sheets/java/guides/calculate-modern-excel-formulas-java
redirect_from:
  - /axyra/guides/calculate-modern-excel-formulas-java
keyword: 'calculate Excel formulas in Java'
code_link_style: text
---

Calculate modern Excel formulas such as XLOOKUP, FILTER, UNIQUE, and SORT with Axyra Sheets, a Java library for reading, writing, and processing Excel files. Your application can evaluate formulas and save an Excel workbook with calculated results without launching Microsoft Excel.

In this example, a nightly sales batch looks up product prices and produces a regional summary. A late quantity correction changes total revenue from **445 to 495**. This example also shows how dependent formulas update automatically when an input changes.

| Report state | First order quantity | First order amount | Total revenue |
|---|---|---|---|
| Before correction | 2 | 50 | 445 |
| After correction | 4 | 100 | 495 |

## TL;DR

- Use Java 17+ and Maven to run the sample project.
- Write formula strings without the leading `=`.
- Write a dynamic-array formula into one anchor cell and leave its spill area empty.
- Automatic mode updates dependent formulas after input changes.
- For manual calculation, call `wb.recalculate()` after the edits and before saving.
- The saved XLSX retains both formulas and calculated results.

## Table of contents

- [Run the sample project](#run-the-sample-project)
- [What is in the input workbook?](#what-is-in-the-input-workbook)
- [How to calculate XLOOKUP in Java](#how-to-calculate-xlookup-in-java)
- [How to use FILTER, UNIQUE, and SORT in Java](#how-to-use-filter-unique-and-sort-in-java)
- [The complete Java program](#the-complete-java-program)
- [What results should you expect?](#what-results-should-you-expect)
- [How to automatically recalculate Excel formulas in Java](#how-to-automatically-recalculate-excel-formulas-in-java)
- [What should you check in production?](#what-should-you-check-in-production)
- [FAQ](#faq)

## Run the sample project

[Open the runnable sample project](https://github.com/keikai/axyra-sheets-examples/tree/main/java/guide-projects/calculate-formulas). It includes a Maven POM, Java sources, and the input workbook `input/sales-input.xlsx`.

```shell
git clone https://github.com/keikai/axyra-sheets-examples.git
cd axyra-sheets-examples/java/guide-projects/calculate-formulas
mvn compile exec:java -Dexec.mainClass=ModernFormulaBatch
```

The program writes `output/sales-calculated.xlsx`. To process another workbook with the same sheet names and layout:

```shell
mvn exec:java -Dexec.mainClass=ModernFormulaBatch -Dexec.args="input/sales-input.xlsx output/custom-report.xlsx"
```

For an existing application, follow [Installation]({{ site.axyra_devref }}/Installation). Without an installed license, the example runs in evaluation mode; see [Licensing and evaluation]({{ site.axyra_devref }}/License).

## What is in the input workbook?

The **Products** sheet contains this price lookup table in A1:B4:

| SKU | Price |
|---|---|
| P100 | 25 |
| P200 | 40 |
| P300 | 15 |

The **Sales** sheet has headers Region, SKU, Qty, Unit price, and Amount. Its input records occupy A2:C5:

| Region | SKU | Qty |
|---|---|---|
| North | P100 | 2 |
| South | P200 | 3 |
| North | P300 | 5 |
| East | P100 | 8 |

D2:E5 is reserved for formulas. The program creates a **Summary** sheet for the region list, North orders, and total revenue. The project also includes `CreateFormulaInput.java` to regenerate the sample input.

## How to calculate XLOOKUP in Java

Use XLOOKUP to find the unit price for each SKU. Inside the open workbook, fill D2:D5 with the lookup formula, then calculate the amount in E2:E5:

```java
sales.range("D2:D5").setFormula(
        "XLOOKUP(B2,Products!$A$2:$A$4,Products!$B$2:$B$4,0)");
sales.range("E2:E5").setFormula("C2*D2");
```

`Range.setFormula(...)` adjusts relative references across the range. In D3, the lookup key becomes B3; in E3, the amount formula becomes `C3*D3`. The `$`-anchored product lookup ranges stay fixed.

The lookup's final argument uses zero for an unknown SKU. For a pricing report, validate product keys and choose how missing prices should be handled before calculating invoice or revenue totals.

## How to use FILTER, UNIQUE, and SORT in Java

Use one anchor cell for each dynamic-array formula. The first formula produces a sorted region list beginning at Summary!A2; the second produces the North order detail beginning at C2:

```java
summary.cell(1, 0).setFormula("SORT(UNIQUE(Sales!A2:A5))");
summary.cell(1, 2).setFormula(
        "FILTER(Sales!A2:E5,Sales!A2:A5=\"North\",\"No orders\")");
```

`UNIQUE` removes repeated regions, and `SORT` orders the result as East, North, South. `FILTER` returns the two North orders, or the text `No orders` when no rows match.

Keep the output areas separate and empty before writing the anchors. Here, A2:A4 holds the region list and C2:G3 holds the filtered detail. Writing the same dynamic-array formula into every output cell would create competing anchors.

## The complete Java program

The program opens the input workbook, adds the formulas, changes the first quantity from 2 to 4, and saves the report. It checks the updated values before calling `recalculate()`, so you can see automatic recalculation in action.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.calc.CalcMode;
import io.keikai.axyra.sheets.formula.Functions;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public final class ModernFormulaBatch {
    public static void main(String[] args) throws Exception {
        Path input = Path.of(args.length > 0 ? args[0] : "input/sales-input.xlsx");
        Path output = Path.of(args.length > 1 ? args[1] : "output/sales-calculated.xlsx");
        Files.createDirectories(output.toAbsolutePath().getParent());
        for (String name : List.of("XLOOKUP", "FILTER", "UNIQUE", "SORT")) {
            if (!Functions.contains(name)) {
                throw new IllegalStateException("Missing function: " + name);
            }
        }

        try (Workbook wb = Workbook.open(input)) {
            Sheet sales = wb.sheet("Sales");
            wb.setCalcMode(CalcMode.AUTOMATIC);
            sales.range("D2:D5").setFormula(
                    "XLOOKUP(B2,Products!$A$2:$A$4,Products!$B$2:$B$4,0)");
            sales.range("E2:E5").setFormula("C2*D2");

            // Each dynamic-array formula has one anchor and an empty spill area.
            Sheet summary = wb.createSheet("Summary");
            summary.cell(0, 0).setValue(CellValue.text("Regions"));
            summary.cell(1, 0).setFormula("SORT(UNIQUE(Sales!A2:A5))");
            summary.cell(0, 2).setValue(CellValue.text("North orders"));
            summary.cell(1, 2).setFormula(
                    "FILTER(Sales!A2:E5,Sales!A2:A5=\"North\",\"No orders\")");
            summary.cell(0, 8).setValue(CellValue.text("Revenue"));
            summary.cell(1, 8).setFormula("SUM(Sales!E2:E5)");

            requireNumber(summary.cell(1, 8).value(), 445, "Initial revenue");
            // A late correction demonstrates automatic dependent recalculation.
            sales.cell(1, 2).setValue(CellValue.number(4));
            requireNumber(sales.cell(1, 4).value(), 100, "Corrected order");
            requireNumber(summary.cell(1, 8).value(), 495, "Corrected revenue");

            // Recalculate once after the edits and before saving the report.
            wb.recalculate();
            summary.setColumnWidth(0, 16);
            summary.setColumnWidth(2, 18);
            summary.setColumnWidth(8, 18);
            wb.save(output);
        }

        try (Workbook check = Workbook.open(output)) {
            Sheet sales = check.sheet("Sales");
            Sheet summary = check.sheet("Summary");
            requireNumber(sales.cell(1, 4).value(), 100, "Saved order");
            requireNumber(summary.cell(1, 8).value(), 495, "Saved revenue");
            requireText(summary.cell(1, 0).value(), "East");
            requireText(summary.cell(2, 0).value(), "North");
            requireText(summary.cell(3, 0).value(), "South");
            requireNumber(summary.cell(1, 6).value(), 100, "First North order");
            requireNumber(summary.cell(2, 6).value(), 75, "Second North order");
            if (!"C2*D2".equals(sales.cell(1, 4).formula())) {
                throw new IllegalStateException("Order formula was not retained");
            }
            System.out.println("Revenue: " + summary.cell(1, 8).formattedText());
            System.out.println("Regions: East, North, South");
            System.out.println("North order amounts: 100, 75");
        }
        System.out.println("Wrote " + output);
    }

    private static void requireNumber(CellValue value, double expected, String label) {
        if (!(value instanceof CellValue.Number n)
                || Math.abs(n.value() - expected) > 0.000001) {
            throw new IllegalStateException(label + ": " + value);
        }
    }

    private static void requireText(CellValue value, String expected) {
        if (!(value instanceof CellValue.Text t) || !expected.equals(t.value())) {
            throw new IllegalStateException("Expected " + expected + ", got " + value);
        }
    }
}
```

[View ModernFormulaBatch.java on GitHub](https://github.com/keikai/axyra-sheets-examples/blob/main/java/guide-projects/calculate-formulas/src/main/java/ModernFormulaBatch.java).

The program reads an existing workbook and saves to a separate output path, so the original sales input remains available for the next batch. A scheduler can call this program once per reporting period.

## What results should you expect?

Before the correction, the order amounts are 50, 120, 75, and 200, totaling 445. Changing Sales!C2 from 2 to 4 changes the first amount to 100 and total revenue to 495.

| Output | Result in the saved report |
|---|---|
| Sales!D2:D5 | 25, 40, 15, 25 |
| Sales!E2:E5 | 100, 120, 75, 200 |
| Summary!A2:A4 | East, North, South |
| Summary!C2:G3 | Two North orders, with amounts 100 and 75 |
| Summary!I2 | 495 |

The console output includes:

```text
Revenue: 495
Regions: East, North, South
North order amounts: 100, 75
Wrote output/sales-calculated.xlsx
```

[Open the example output workbook](https://github.com/keikai/axyra-sheets-examples/blob/main/java/guide-projects/calculate-formulas/expected/sales-calculated.xlsx). It retains the formulas as well as their results, so recipients can continue working with the report.

## How to automatically recalculate Excel formulas in Java

In automatic mode, changing an input updates dependent formulas. If you use manual mode, or an existing workbook contains outdated formula results, call `wb.recalculate()` after making changes and before saving. Saving alone does not recalculate formulas.

In this example, the first order amount and total revenue change immediately after the quantity edit. The program reads 100 and 495 before the final `recalculate()` call.

A batch job can use `CalcMode.MANUAL` to apply several changes before calculating the results. An input workbook can carry its calculation mode from Excel, so set the intended mode when the job opens it.

Do not call a full `recalculate()` inside every row iteration. Apply the edits first, then recalculate when needed. See [Recalculate Excel Formulas in Java]({{ site.axyra_guides }}/evaluate-recalculate-excel-formulas-java) for calculation modes and `recalculateDirty()`.

For a directory of reports, open and close a separate workbook for each job. Each parallel worker needs its own workbook instance.

## What should you check in production?

Validate the input sheet names, product keys, and record count. This example has four sales rows and three product rows; build the formula ranges from your actual dataset size when adapting it.

Inspect `CellValue` variants when reading calculated results. Your application can handle `CellValue.Error` values such as `#N/A`, `#VALUE!`, or `#SPILL!` and show the relevant cell to the user. Include unknown product keys, empty filter results, and occupied spill areas in your report's input checks.

Use `Functions.list()` or `Functions.contains(...)` to check which functions are available in your version. See the [Formulas reference]({{ site.axyra_devref }}/Formulas) for the calculation API.

## FAQ

### Does the user need to open Excel to calculate this report?

No. Axyra calculates these formulas in the Java job, and the saved output contains their results. Spreadsheet applications can still recalculate the retained formulas later.

### Is FILTER the same as filtering rows in Java?

It can select the same business records, but here the selection is stored as a workbook formula with a spill result. Use Java filtering for a fixed export; use the formula when the selection rule should remain in the workbook.

### Does saving guarantee fresh formula caches?

No. When results need recalculation, call `wb.recalculate()` after making changes and before saving.

## Next steps

- [Run the formula sample project](https://github.com/keikai/axyra-sheets-examples/tree/main/java/guide-projects/calculate-formulas) with your own sales data.
- [Create charts in Excel using Java]({{ site.axyra_guides }}/create-excel-charts-java) to visualize the report.
- [Apply styles and formatting in Excel using Java]({{ site.axyra_guides }}/apply-excel-styles-formatting-java) to make the output easier to read.
