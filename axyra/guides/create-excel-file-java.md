---
title: 'How to Create an Excel File in Java (Step-by-Step)'
permalink: /axyra/guides/create-excel-file-java
---

Creating an Excel file in Java lets applications deliver sales summaries,
inventory lists, and other business data in a format people can review and
edit. In this guide, we’ll use Axyra Sheets for Java to build an XLSX sales
report from scratch, with headers, numeric data, formulas, number formatting,
and a frozen header row. The steps come together in a complete program that
saves a workbook you can open in Excel.

{: .notice--info}
**Already know the object model?** The
[Quick Start]({{ site.axyra_tutorial }}/quick_start) is the five-minute version.
This guide is the longer one, and it produces a file you would be willing to send
to someone.

# What you need

- **Java 17 or later.** The API uses sealed interfaces and records.
- **The dependency.** Native libraries for the supported platforms are bundled
  in the jar, so there is nothing else to install.

```xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>axyra-sheets</artifactId>
    <version>{{ site.axyra_version }}</version>
</dependency>
```

```groovy
implementation "io.keikai:axyra-sheets:{{ site.axyra_version }}"
```

# Step 1 — Create the workbook

`Workbook.create()` gives you an empty workbook. Add the first sheet explicitly
and keep the returned view:

```java
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.Sheet;

try (Workbook wb = Workbook.create()) {
    Sheet sheet = wb.createSheet("Q3 Sales");
    // ...
}
```

`Workbook` implements `AutoCloseable` and owns native memory that the garbage
collector cannot reclaim, so the try-with-resources block is not optional. See
[Workbook and Sheet]({{ site.axyra_devref }}/Workbook_and_Sheet) for the full
lifecycle.

{: .notice--warning}
**Rows and columns are 0-based; formulas are not.** `cell(0, 0)` is `A1`, so the
cell at row index 1 is row **2** in a formula. This trips up everyone once.

# Step 2 — Write the header and the data

Set a whole block in one call rather than looping cell by cell. Each `Range`
call crosses the JNI boundary once for the entire block; a per-cell loop crosses
it once per cell.

```java
import io.keikai.axyra.sheets.CellValue;

sheet.range("A1:D1").setValues(new CellValue[][] {
    { CellValue.text("Region"), CellValue.text("Q1"),
      CellValue.text("Q2"),     CellValue.text("Total") }
});

sheet.range("A2:C4").setValues(new CellValue[][] {
    { CellValue.text("APAC"),     CellValue.number(1200), CellValue.number(1450) },
    { CellValue.text("EMEA"),     CellValue.number(980),  CellValue.number(1100) },
    { CellValue.text("Americas"), CellValue.number(1610), CellValue.number(1720) },
});
```

`setValues` takes a row-major `CellValue[][]` whose shape must match the range.
When every value is numeric, `setNumbers(double[])` is faster still — it is a
flat array with no boxing and no `CellValue` allocation. That is the path to use
when the data comes out of a database; see
[Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range#bulk-access-and-performance).

# Step 3 — Add formulas

Write the per-row total into column D, and a grand total underneath the data.

```java
sheet.cell(1, 3).setFormula("B2+C2");
sheet.cell(2, 3).setFormula("B3+C3");
sheet.cell(3, 3).setFormula("B4+C4");

sheet.cell(4, 0).setValue(CellValue.text("Total"));
sheet.range("B5:D5").setFormula("SUM(B2:B4)");
```

`Range.setFormula` writes *the same formula text* to every cell in the range, so
`B5:D5` all get `SUM(B2:B4)` — which is wrong for `C5` and `D5`. To shift the
references the way Excel's fill handle does, write one cell and auto-fill from it
instead:

```java
sheet.cell(4, 1).setFormula("SUM(B2:B4)");
sheet.range("B5:B5").autoFill(sheet.range("B5:D5"));
```

{: .notice--warning}
**Assigning a formula does not evaluate it.** Saving does not either. Call
`wb.recalculate()` (or `wb.recalculateDirty()`) before you read a computed value
or write the file, or the cells will carry no result.

```java
wb.recalculate();
```

# Step 4 — Style it

Styles are immutable values built once and applied to a range.

```java
import io.keikai.axyra.sheets.style.CellStyle;
import io.keikai.axyra.sheets.style.Color;
import io.keikai.axyra.sheets.style.BorderStyle;
import io.keikai.axyra.sheets.style.HAlign;

CellStyle header = CellStyle.builder()
        .bold()
        .fontColor(Color.parse("#FFFFFF"))
        .fill(Color.parse("#2F5597"))
        .horizontalAlign(HAlign.CENTER)
        .allBorders(BorderStyle.THIN, Color.parse("#1F3864"))
        .build();

CellStyle money = CellStyle.builder()
        .numberFormat("#,##0.00")
        .build();

CellStyle totalRow = CellStyle.builder()
        .bold()
        .numberFormat("#,##0.00")
        .build();

sheet.range("A1:D1").setStyle(header);
sheet.range("B2:D4").setStyle(money);
sheet.range("A5:D5").setStyle(totalRow);
```

`numberFormat` takes an Excel format code, so anything valid in Excel's *Format
Cells* dialog works here — `"#,##0.00"`, `"0.0%"`, `"yyyy-mm-dd"`, and
conditional sections such as `"#,##0.00;[Red]-#,##0.00"`. See
[Styles and Formats]({{ site.axyra_devref }}/Styles).

If the same style repeats across sheets, register it once by name and apply it by
name:

```java
wb.registerNamedStyle("Currency", money);
sheet.range("B2:D4").applyNamedStyle("Currency");
```

# Step 5 — Column widths and a frozen header

```java
sheet.setColumnWidth(0, 14.0);   // Excel character units
for (int col = 1; col <= 3; col++) {
    sheet.autoFitColumn(col);
}
sheet.freezePanes(1, 0);         // keep row 1 visible while scrolling
```

Column width is in Excel's character units (the width of the `0` glyph in the
default font), not points — row height is the one measured in points.
`autoFitColumn` measures the rendered text, so it needs the fonts the workbook
asks for to be available; see [Rendering]({{ site.axyra_devref }}/Rendering) if
your output runs in a container.

# Step 6 — Save

The format comes from the file extension.

```java
import java.nio.file.Path;

wb.save(Path.of("q3-sales.xlsx"));
```

To send the file straight to an HTTP response or into object storage instead,
skip the disk entirely:

```java
byte[] bytes = wb.saveBytes("xlsx");
wb.save(response.getOutputStream(), "xlsx");
```

`.xls`, `.xlsb`, `.ods`, `.csv`, and `.json` all work the same way — see
[Supported Formats]({{ site.axyra_devref }}/Supported_Formats) for what each one
can carry.

# The complete program

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.style.BorderStyle;
import io.keikai.axyra.sheets.style.CellStyle;
import io.keikai.axyra.sheets.style.Color;
import io.keikai.axyra.sheets.style.HAlign;

import java.nio.file.Path;

public class CreateExcelFile {

    public static void main(String[] args) {
        try (Workbook wb = Workbook.create()) {
            Sheet sheet = wb.createSheet("Q3 Sales");

            // Header and data, one call each.
            sheet.range("A1:D1").setValues(new CellValue[][] {
                { CellValue.text("Region"), CellValue.text("Q1"),
                  CellValue.text("Q2"),     CellValue.text("Total") }
            });
            sheet.range("A2:C4").setValues(new CellValue[][] {
                { CellValue.text("APAC"),     CellValue.number(1200), CellValue.number(1450) },
                { CellValue.text("EMEA"),     CellValue.number(980),  CellValue.number(1100) },
                { CellValue.text("Americas"), CellValue.number(1610), CellValue.number(1720) },
            });

            // Per-row totals, then a grand-total row.
            sheet.cell(1, 3).setFormula("B2+C2");
            sheet.cell(2, 3).setFormula("B3+C3");
            sheet.cell(3, 3).setFormula("B4+C4");

            sheet.cell(4, 0).setValue(CellValue.text("Total"));
            sheet.cell(4, 1).setFormula("SUM(B2:B4)");
            sheet.range("B5:B5").autoFill(sheet.range("B5:D5"));

            wb.recalculate();

            // Styling.
            CellStyle header = CellStyle.builder()
                    .bold()
                    .fontColor(Color.parse("#FFFFFF"))
                    .fill(Color.parse("#2F5597"))
                    .horizontalAlign(HAlign.CENTER)
                    .allBorders(BorderStyle.THIN, Color.parse("#1F3864"))
                    .build();
            CellStyle money = CellStyle.builder().numberFormat("#,##0.00").build();
            CellStyle totalRow = CellStyle.builder()
                    .bold()
                    .numberFormat("#,##0.00")
                    .build();

            sheet.range("A1:D1").setStyle(header);
            sheet.range("B2:D4").setStyle(money);
            sheet.range("A5:D5").setStyle(totalRow);

            // Layout.
            sheet.setColumnWidth(0, 14.0);
            for (int col = 1; col <= 3; col++) {
                sheet.autoFitColumn(col);
            }
            sheet.freezePanes(1, 0);

            wb.save(Path.of("q3-sales.xlsx"));
            System.out.println("wrote q3-sales.xlsx");
        }
    }
}
```

Open `q3-sales.xlsx` and you get a header row in white on blue, three data rows
with thousands separators and two decimals, a bold total row, and a header that
stays put when you scroll.

# Common mistakes

| Symptom | Cause |
|---|---|
| Computed cells are empty in the saved file | `recalculate()` was never called. Assigning a formula does not evaluate it, and saving does not either. |
| The formula refers to the wrong row | Indices are 0-based, A1 references are 1-based. Row index 1 is row `2`. |
| Every cell in a range has an identical formula | That is what `Range.setFormula` does. Use `autoFill` to shift references. |
| Native memory grows over time in a service | A `Workbook` escaped its try-with-resources. Close every one. |
| `IllegalStateException` on a `Sheet` or `Range` | The workbook was already closed. These are views, not copies. |
| `UnsatisfiedLinkError` in a container but not locally | The image was built for a different architecture, or a shading step dropped `native/**`. See [Native Library Loading]({{ site.axyra_devref }}/Native_Loader). |

# Next steps

- [How to Write Data to Excel in Java]({{ site.axyra_guides }}/write-data-to-excel-java) —
  populate a sheet from a database or JSON instead of literals
- [How to Convert Excel to PDF in Java]({{ site.axyra_guides }}/convert-excel-to-pdf-java) —
  render what you just built
- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range) — the full data-access API
- [Styles and Formats]({{ site.axyra_devref }}/Styles) — fonts, fills, borders, number formats

# Beyond Your First Excel File

Once you can create and format a workbook, you can connect it to live
application data and build reports with multiple sheets, charts, and pivot
tables. Axyra Sheets can also render the workbook as PDF or images, giving you
both an editable Excel file and a version for sharing or previewing. The same
workbook creation steps can become part of a download endpoint or a scheduled
reporting job.
