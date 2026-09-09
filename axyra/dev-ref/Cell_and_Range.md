---
title: 'Cells and Ranges'
permalink: /axyra/dev-ref/Cell_and_Range
---

{% include axyra_example.html path="devref/CellAndRangeExample.java" %}

Two ways to reach data: `Cell` for one cell with all of its attachments, and
`Range` for a rectangular block. Which you pick has real performance
consequences — see [Bulk access](#bulk-access-and-performance).

# Coordinates

Row and column indices are **0-based** throughout the API: `cell(0, 0)` is `A1`.
Formula strings, named ranges, and `range(String)` use ordinary **1-based A1
notation**, because that is what the file format and the user see.

Anywhere the API takes a reference — `sheet.range(String)`, formula text,
`addName`, a chart's series reference, a pivot table's source — it is the 1-based
A1 form. Anywhere it takes `int row, int col`, it is 0-based.

```java
sheet.range("A2:D50");        // identical to sheet.range(1, 0, 49, 3)
wb.range("Summary!A1");       // a sheet-qualified reference
```

# CellValue

`CellValue` is a sealed interface — a value is exactly one of six things:

```java
CellValue.number(42.0);
CellValue.text("hello");
CellValue.bool(true);
CellValue.blank();
CellValue.error(2);                     // #DIV/0!
CellValue.array(new CellValue[][] {...});
```

Because it is sealed, you can handle each variant explicitly:

```java
String describe(CellValue v) {
    if (v instanceof CellValue.Number n) return "number " + n.value();
    if (v instanceof CellValue.Text t)   return "text " + t.value();
    if (v instanceof CellValue.Bool b)   return "bool " + b.value();
    if (v instanceof CellValue.Error e)  return "error " + e.code();
    if (v instanceof CellValue.Array a) {
        return a.rowCount() + "×" + a.colCount() + " array";
    }
    return "blank";
}
```

Read a raw value through the matching variant accessor, such as
`CellValue.Number.value()` or `CellValue.Text.value()`. For an error,
`CellValue.Error.display()` returns its Excel error string. In contrast,
`Cell.formattedText()` applies the cell's number format, which is what a
spreadsheet application shows.

## Dates

Spreadsheets store dates as serial numbers, so the API converts explicitly:

```java
cell.setDate(LocalDate.of(2026, 3, 1));
cell.setDateTime(LocalDateTime.now());

LocalDate d = cell.dateValue();
LocalDateTime dt = cell.dateTimeValue();
```

Which epoch a serial number refers to depends on the workbook's
`date1904` setting — see
[Workbook and Sheet]({{ site.axyra_devref }}/Workbook_and_Sheet).

# Cell

A `Cell` is the single-cell view, and it is where everything attached to one cell
lives: value, formula, style, comment, threaded comments, rich text, hyperlink.

```java
Cell cell = sheet.cell(4, 2);

cell.setValue(CellValue.number(1499.0));
cell.setFormula("SUM(B2:B50)");
cell.formula();                   // the formula text, or null
cell.formattedText();
cell.clear();

cell.setStyle(style);
cell.setRichText(richText);
cell.setHyperlink("https://keikai.io");
cell.setComment("Finance", "Adjusted after audit");
```

## Localized formulas

For a UI that shows function names and argument separators in the user's
language:

```java
cell.setFormulaLocalized("SUMME(B2:B50)", "de-DE");
String shown = cell.formulaLocalized("de-DE");
```

The stored formula is always canonical English; localization is a presentation
concern applied on the way in and out.

## Threaded comments

Modern Excel comments are threads with replies and a resolved flag, distinct from
legacy notes:

```java
String id = cell.addThreadedComment("alice", "Is this final?");
cell.addThreadedReply(id, "bob", "Yes, signed off.");
cell.setThreadedCommentResolved(id, true);

for (ThreadedComment tc : cell.threadedComments()) { ... }
```

`setComment(author, text)` writes a **legacy note** instead. The two coexist in
the file format; do not expect one API to see the other's content.

# Range

```java
Range r = sheet.range(1, 0, 49, 3);     // rows 1–49, cols 0–3
Range same = sheet.range("A2:D50");

r.rowCount(); r.colCount();
r.firstRow(); r.lastColumn();
```

## Bulk access and performance

Every `Cell` call crosses the JNI boundary. Every `Range` call crosses it once
for the whole block. For anything beyond a handful of cells, this is the
difference that matters:

```java
// One native call for 49 × 4 cells
CellValue[][] values = r.values();
r.setValues(values);

// Faster still when everything is numeric — no boxing, no CellValue
double[] nums = r.numbers();
r.setNumbers(nums);

String[][] formulas = r.formulas();
r.setFormulas(formulas);
```

`numbers()` / `setNumbers(double[])` are row-major and flat. They are the fastest
path in the API and the right choice for loading a matrix out of a database.

## Formulas over a range

```java
r.setFormula("A2*1.05");      // writes this exact formula to every cell
r.setArrayFormula("MMULT(A1:C3, E1:G3)");   // one legacy CSE array formula
r.spillRange();               // the area a dynamic-array formula actually spilled into
```

The distinction matters: `setFormula` writes the same formula text to every
cell. To shift relative references as Excel's fill handle does, set the formula
on a source range and call `autoFill(destination)`. `setArrayFormula` writes a
single formula occupying the whole range. Modern dynamic arrays spill on their
own — see
[Formulas]({{ site.axyra_devref }}/Formulas).

## Operations

```java
r.sort(SortKey.asc(0), SortKey.desc(2));
r.sort(0, true);                       // one column, ascending
r.sortLeftToRight(SortKey.asc(0));     // sort columns instead of rows
r.sort(SortKey.customOrder(1, "High", "Medium", "Low"));

r.autoFill(sheet.range("A10:D20"));    // extend a series
r.removeDuplicates(new int[] {0, 1}, true);

r.copyTo(otherSheet, 0, 0);
r.copyTo(otherSheet, 0, 0, "values");  // paste-special

r.merge();
r.unmerge();
r.autoMerge(true);
```

`copyTo` with a paste type covers paste-special: values only, formats only,
formulas, and so on. Without it, everything is copied.

## Attaching content

```java
r.setStyle(style);
r.applyNamedStyle("Currency");
r.setValidation(validation);
r.addConditionalFormat(format);
r.createTable("Sales", "Region", "Q1", "Q2");
```

See [Styles]({{ site.axyra_devref }}/Styles) and
[Content Objects]({{ site.axyra_devref }}/Content_Objects).

# Importing Java objects

`Sheet.importData` writes a list of POJOs or records as rows, reading properties
by name:

```java
record Sale(String region, double q1, double q2) {}

List<Sale> sales = List.of(new Sale("APAC", 1200, 1450), new Sale("EMEA", 980, 1100));

sheet.importData(0, 0, sales, ImportOptions.builder()
        .columns("region", "q1", "q2")
        .headers(true)
        .columnLabels("Region", "Q1", "Q2")
        .headerStyle(boldStyle)
        .build());
```

Returns the number of rows written. Without `columns(...)`, all readable
properties are written in declaration order — pin the column list explicitly if
the class may gain fields later.

For filling an existing template rather than writing a fresh block, see
[Smart Markers]({{ site.axyra_devref }}/Smart_Markers).
