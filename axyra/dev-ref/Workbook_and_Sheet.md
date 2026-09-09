---
title: 'Workbook and Sheet'
permalink: /axyra/dev-ref/Workbook_and_Sheet
---

{% include axyra_example.html path="devref/WorkbookAndSheetExample.java" %}

`Workbook` is the root of the object model and the owner of the native handle.
Everything else — sheets, ranges, cells, content objects — is reached from it,
and is only valid while it is open.

# Lifecycle

```java
try (Workbook wb = Workbook.create()) {
    ...
}
```

`Workbook` implements `AutoCloseable`. Closing it releases the native memory
holding the entire book. **Any `Sheet`, `Range`, or `Cell` obtained from a
workbook becomes invalid once it is closed** — these are lightweight views onto
the native model, not detached copies. Do not let them escape the
try-with-resources block.

Leaking a workbook leaks native memory that the Java garbage collector cannot
reclaim on your behalf, so a long-running service that opens workbooks per
request must close every one of them.

## Creating and opening

| Call | Purpose |
|---|---|
| `Workbook.create()` | An empty workbook with one sheet |
| `Workbook.createColumnar()` | Empty, using the columnar storage backend — see [Streaming]({{ site.axyra_devref }}/Streaming) |
| `Workbook.open(Path)` | Open a file; format inferred from the name |
| `Workbook.open(Path, String password)` | Open an encrypted file |
| `Workbook.openBytes(byte[], String format)` | Open from memory |
| `Workbook.openBytes(byte[], String format, String password)` | Open encrypted, from memory |
| `Workbook.open(InputStream, String format)` | Open from a stream |

The `format` argument is a lowercase extension: `"xlsx"`, `"xlsm"`, `"xlsb"`,
`"xls"`, `"ods"`, `"csv"`, `"json"`.

# Sheets

```java
int n = wb.sheetCount();
Sheet first = wb.sheet(0);
Sheet named = wb.sheet("Summary");

Sheet added = wb.createSheet("Q4");
Sheet inserted = wb.insertSheet(1, "Notes");
wb.renameSheet(1, "Appendix");
wb.moveSheet(1, 3);
wb.deleteSheet(3);

wb.setActiveSheet(0);
Sheet active = wb.activeSheet();
```

Sheet indices are 0-based and shift when sheets are inserted, deleted, or moved.
If you hold a `Sheet` across such an operation, re-fetch it — its index is no
longer what it was.

## Sheet properties

```java
Sheet sheet = wb.sheet(0);

sheet.name();
sheet.index();
sheet.sheetType();                   // WORKSHEET, CHART, DIALOG, MACRO_SHEET, …
sheet.uniqueId();                    // stable across renames

sheet.setVisibility(Visibility.VERY_HIDDEN);
sheet.setTabColor(Color.rgb(0xC0, 0x39, 0x2B));
sheet.setRightToLeft(true);
```

`uniqueId()` is the identifier to key your own data off, not `name()` — a rename
changes the name but not the id.

## Headers, footers, and page setup

```java
sheet.setHeader("&C&\"Calibri,Bold\"Quarterly Report");
sheet.setFooter("&LPrinted &D&RPage &P of &N");

sheet.setDifferentFirst(true);
sheet.setFirstHeader("&CCover");

sheet.setDifferentOddEven(true);
sheet.setEvenHeader("&L&F");
```

The `&`-codes are Excel's header/footer codes: `&C` centre, `&L` left, `&R`
right, `&P` page number, `&N` page count, `&D` date, `&F` filename.

## Rows and columns

```java
sheet.setRowHeight(0, 28.0);          // points
sheet.setColumnWidth(0, 24.0);        // character units, as in Excel
sheet.setDefaultRowHeight(15.0);
sheet.setDefaultColumnWidth(8.43);

sheet.insertRows(10, 3);
sheet.deleteRows(10, 3);
sheet.insertColumns(4, 1);
sheet.deleteColumns(4, 1);

sheet.freezePanes(1, 0);              // freeze the first row
sheet.setAutoFilter(sheet.range("A1:F1"));
```

Row height is in **points**; column width is in Excel's **character units**
(the width of the '0' glyph in the default font), which is why the two use
different scales. `isRowHeightCustom(row)` and `isColumnWidthCustom(col)`
distinguish an authored size from an inherited default — relevant when you are
deciding whether to auto-fit.

Inserting and deleting rows or columns adjusts formulas, merged regions, named
ranges, conditional formats, validations, tables, and anchored objects that
reference the shifted area.

# Workbook settings

```java
wb.setCalcMode(CalcMode.MANUAL);
wb.setIterativeCalc(true, 100, 0.001);
wb.setDate1904(false);
```

`setDate1904(true)` switches to the 1904 date system used by legacy Mac
workbooks. Changing it on a workbook that already holds dates reinterprets those
serial numbers — set it before populating dates, not after.

# Chart sheets

A chart sheet is a sheet whose entire body is one chart:

```java
int index = wb.addChartSheet("Revenue", chart);
ChartView view = wb.chartSheetChart(0);
wb.removeChartSheet(0);
```

See [Charts]({{ site.axyra_devref }}/Charts).

# Named ranges

```java
wb.addName("TaxRate", "Config!$B$2");            // workbook-scoped
wb.addName("Local", "$A$1:$A$10", wb.sheet(0));  // scoped to one sheet

for (NamedRange nr : wb.names()) {
    System.out.println(nr.name() + " = " + nr.formula()
            + (nr.isWorkbookScoped() ? " (workbook)" : " (sheet " + nr.sheetScope() + ")"));
}

Range r = wb.findName("TaxRate").asRange();
wb.removeName("Local");
```

A name's definition is a formula, not just a reference, so `addName` also covers
constants (`"=0.05"`) and expressions. `asRange()` only succeeds when the
definition resolves to a contiguous area.

Named ranges are adjusted by structural edits like any other reference, which
makes them the durable way to point at a region a user may move.

# Next

- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range)
- [Formulas]({{ site.axyra_devref }}/Formulas)
