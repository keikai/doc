---
title: 'How to Read an Excel File in Java (XLSX Parsing Guide)'
permalink: /axyra/guides/read-excel-file-java
---

Reading Excel files in Java is a common starting point for processing customer
uploads, importing business records, or checking data from another system. In
this guide, we’ll use Axyra Sheets for Java to open an XLSX workbook, locate its
populated cells, and extract values in bulk. We’ll also handle dates, formatted
text, formula results, and error cells so your application can interpret the
data correctly.

The same code path reads XLSX, XLSM, XLSB, XLS, ODS, CSV, and JSON.

{: .notice--info}
**Writing a file instead?** See
[How to Create an Excel File in Java]({{ site.axyra_guides }}/create-excel-file-java).

# What you need

Java 17 or later plus the dependency; the native libraries ship inside the jar.
See [Installation]({{ site.axyra_devref }}/Installation) if you need the Gradle
coordinates or hit a platform problem.

```xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>axyra-sheets</artifactId>
    <version>{{ site.axyra_version }}</version>
</dependency>
```

# Step 1 — Open the workbook

The format is detected from the file name, so one call covers every supported
format.

```java
import io.keikai.axyra.sheets.Workbook;
import java.nio.file.Path;

try (Workbook wb = Workbook.open(Path.of("report.xlsx"))) {
    // ...
}
```

When the file arrives over HTTP or comes out of a database there is no name to
infer from, so state the format explicitly:

```java
byte[] bytes = ...;
try (Workbook wb = Workbook.openBytes(bytes, "xlsx")) { ... }

try (var in = request.getInputStream();
     Workbook wb = Workbook.open(in, "xlsx")) { ... }
```

Encrypted workbooks take a password on the same call:

```java
Workbook wb = Workbook.open(Path.of("secret.xlsx"), "pa55w0rd");
Workbook fromMemory = Workbook.openBytes(bytes, "xlsx", "pa55w0rd");
```

{: .notice--warning}
**Always close the workbook.** It owns native memory outside the JVM heap that
the garbage collector cannot reclaim, and `Sheet`, `Range`, and `Cell` are views
that become invalid the moment it closes. Do not return one from the method that
opened it.

# Step 2 — Walk the sheets

```java
import io.keikai.axyra.sheets.Sheet;

for (int i = 0; i < wb.sheetCount(); i++) {
    Sheet sheet = wb.sheet(i);
    System.out.println(i + ": " + sheet.name() + " (" + sheet.sheetType() + ")");
}

Sheet byName = wb.sheet("Q3 Sales");
```

`sheetType()` matters when you are iterating blindly: a workbook can contain
chart sheets, dialog sheets, and macro sheets, and only `WORKSHEET` holds a
grid. Hidden sheets are included in the count — check
`sheet.visibility()` if you want to skip them.

# Step 3 — Find where the data is

Do not guess the extent. `usedRange()` returns the populated block, or `null`
for an empty sheet.

```java
import io.keikai.axyra.sheets.Range;

Range used = sheet.usedRange();
if (used == null) {
    return;   // nothing on this sheet
}
System.out.printf("data in rows %d-%d, cols %d-%d (%d x %d)%n",
        used.firstRow(), used.lastRow(),
        used.firstColumn(), used.lastColumn(),
        used.rowCount(), used.colCount());
```

Remember that these indices are **0-based**, so `firstRow() == 0` is spreadsheet
row 1.

# Step 4 — Read the values in bulk

One `Range` call crosses the JNI boundary once for the whole block. A loop of
`sheet.value(r, c)` crosses it once per cell, which is the difference between
milliseconds and minutes on a large sheet.

```java
import io.keikai.axyra.sheets.CellValue;

CellValue[][] grid = used.values();      // row-major
for (CellValue[] row : grid) {
    for (CellValue v : row) {
        // ...
    }
}
```

When you know the block is numeric, `numbers()` is faster still — a flat,
row-major `double[]` with no boxing and no `CellValue` allocation:

```java
double[] flat = sheet.range("B2:D10000").numbers();
```

To read the formulas rather than their results:

```java
String[][] formulas = used.formulas();   // null entries where there is no formula
```

# Step 5 — Handle each value type

`CellValue` is a sealed interface with exactly six variants, so `instanceof`
patterns cover the space:

```java
static String describe(CellValue v) {
    if (v instanceof CellValue.Number n) return "number " + n.value();
    if (v instanceof CellValue.Text t)   return "text " + t.value();
    if (v instanceof CellValue.Bool b)   return "bool " + b.value();
    if (v instanceof CellValue.Error e)  return "error " + e.display();  // "#DIV/0!"
    if (v instanceof CellValue.Array a)  return a.rowCount() + "x" + a.colCount() + " array";
    return "(blank)";
}
```

{: .notice--info}
**On Java 21 or later** you can switch over the variants instead
(`case CellValue.Number n -> ...`) and let the compiler prove exhaustiveness.
The Java library targets Java 17, where pattern matching for `switch` is not yet
available, so the samples here use `instanceof`.

If you want what a spreadsheet application would *show* — the number format
applied, so `1499` becomes `$1,499.00` — read the formatted text instead of the
raw value:

```java
String shown = sheet.cell(4, 2).formattedText();
```

That is a per-cell call, so use it for display, not for bulk extraction.

# Step 6 — Formula results and error cells

A formula cell carries the value the writing application cached, so reading it
usually needs no work on your part. Recalculate when you do not trust that cache
— a file written by another tool, or one you have just edited:

```java
wb.recalculate();        // everything
wb.recalculateDirty();   // only what your edits invalidated
```

{: .notice--info}
**A formula error is a value, not an exception.** `#DIV/0!` arrives as
`CellValue.Error`, and `AxyraFormulaException` is reserved for a malformed
*request* — a formula string that will not parse. So a sheet full of `#REF!`
reads cleanly; you decide what to do about it.

```java
if (v instanceof CellValue.Error e) {
    log.warn("cell holds {} (ERROR.TYPE {})", e.display(), e.code());
}
```

You can also evaluate an expression against the open workbook without writing it
anywhere:

```java
CellValue total = wb.evaluate("SUM('Q3 Sales'!B2:B100)");
```

# Step 7 — Dates

Spreadsheets store dates as serial numbers, so a date cell reads back as
`CellValue.Number`. Convert through the cell:

```java
import java.time.LocalDate;
import java.time.LocalDateTime;

LocalDate d = sheet.cell(1, 0).dateValue();
LocalDateTime dt = sheet.cell(1, 1).dateTimeValue();
```

Which epoch the serial refers to depends on the workbook's `date1904` flag,
which the conversion already accounts for — see
[Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range#dates).

# The complete program

Reads every worksheet and prints the used range as TSV.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Range;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.SheetType;
import io.keikai.axyra.sheets.Workbook;

import java.nio.file.Path;

public class ReadExcelFile {

    public static void main(String[] args) {
        try (Workbook wb = Workbook.open(Path.of("report.xlsx"))) {
            for (int i = 0; i < wb.sheetCount(); i++) {
                Sheet sheet = wb.sheet(i);
                if (sheet.sheetType() != SheetType.WORKSHEET) {
                    continue;
                }

                Range used = sheet.usedRange();
                if (used == null) {
                    System.out.println("== " + sheet.name() + " (empty)");
                    continue;
                }

                System.out.printf("== %s  rows %d-%d, cols %d-%d%n",
                        sheet.name(),
                        used.firstRow(), used.lastRow(),
                        used.firstColumn(), used.lastColumn());

                for (CellValue[] row : used.values()) {
                    StringBuilder line = new StringBuilder();
                    for (CellValue v : row) {
                        if (line.length() > 0) {
                            line.append('\t');
                        }
                        line.append(text(v));
                    }
                    System.out.println(line);
                }
            }
        }
    }

    private static String text(CellValue v) {
        if (v instanceof CellValue.Number n) return String.valueOf(n.value());
        if (v instanceof CellValue.Text t)   return t.value();
        if (v instanceof CellValue.Bool b)   return String.valueOf(b.value());
        if (v instanceof CellValue.Error e)  return e.display();
        if (v instanceof CellValue.Array a)  return "[array]";
        return "";
    }
}
```

# Common mistakes

| Symptom | Cause |
|---|---|
| Reading is unbearably slow | A per-cell loop. Use `Range.values()` or `numbers()` — one crossing for the whole block. |
| Everything is off by one row | Indices are 0-based; spreadsheet row 1 is index `0`. |
| `IllegalStateException` from a `Sheet` or `Range` | The workbook was closed. Views do not outlive it — extract what you need before closing. |
| A date reads as `50000.0` | That is the serial number. Use `cell.dateValue()` / `dateTimeValue()`. |
| A currency cell reads as `1499.0`, not `$1,499.00` | `values()` gives raw values. `formattedText()` applies the number format. |
| Formula cells look stale | You are seeing the cache the writing tool left. Call `recalculate()`. |
| Iterating sheets hits something with no grid | Chart, dialog, and macro sheets are sheets too. Filter on `sheetType()`. |

# Next steps

- [How to Convert Excel to PDF in Java]({{ site.axyra_guides }}/convert-excel-to-pdf-java) —
  render what you just opened
- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range) — the full data-access API
- [Supported Formats]({{ site.axyra_devref }}/Supported_Formats) — per-format behaviour and limits
- [Formulas]({{ site.axyra_devref }}/Formulas) — evaluation, arrays, error semantics

# Beyond Reading Excel Data

Once your application can read spreadsheet values, it can check them against
business rules, map them to database records, or pass them to another service.
With Axyra Sheets, you can also update the open workbook, recalculate formulas,
and save the result or render it as PDF. This lets an Excel import grow into a
workflow that reads incoming data, processes it, and returns an updated report.
