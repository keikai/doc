---
title: 'Manual Quick Start'
permalink: /axyra/quick-start/quick_start
---
Prefer to write the first program yourself? This path takes you from an empty
project to a saved `.xlsx` file in about ten minutes. To generate the project
with a coding assistant instead, use
[AI-Assisted Development]({{ site.axyra_devref }}/AI_Assisted_Development).

# 1. Add the dependency

```xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>axyra-sheets</artifactId>
    <version>{{ site.axyra_version }}</version>
</dependency>
```

The published JAR includes native libraries for the supported platforms.
The loader selects the matching library at runtime. If you build a thin JAR
from source, you must add the native resource yourself or use the
`-Daxyra.native.path` development override. See
[Native Library Loading]({{ site.axyra_devref }}/Native_Loader) for details.

## Evaluation Mode

You do not need a license key to follow this Quick Start. Without a key, Axyra Sheets runs in Evaluation Mode, which is intended for evaluation purposes only.

Evaluation output may include an evaluation notice or watermark. For full Evaluation Mode behavior, a 30-day full-featured evaluation key, and production licensing, see
[Licensing and Evaluation]({{ site.axyra_devref }}/License).

# 2. Create a workbook

`Workbook` implements `AutoCloseable`. It owns a native handle, so always close
it — a try-with-resources block is the simplest way.

```java
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.CellValue;
import java.nio.file.Path;

public class HelloAxyra {
    public static void main(String[] args) {
        try (Workbook wb = Workbook.create()) {
	    Sheet sheet = wb.createSheet("Sheet1");

            sheet.cell(0, 0).setValue(CellValue.text("Item"));
            sheet.cell(0, 1).setValue(CellValue.text("Qty"));
            sheet.cell(0, 2).setValue(CellValue.text("Price"));

            sheet.cell(1, 0).setValue(CellValue.text("Widget"));
            sheet.setNumber(1, 1, 12);
            sheet.setNumber(1, 2, 4.25);

            sheet.cell(1, 3).setFormula("B2*C2");

            wb.recalculate();
            wb.save(Path.of("hello.xlsx"));
        }
    }
}
```

A few things worth noting:

- **Rows and columns are 0-based.** `cell(0, 0)` is `A1`. Formulas, however, use
  ordinary A1 notation, so the formula on row index 1 refers to `B2` and `C2`.
- **Values are a sealed type.** `CellValue.text(...)`, `.number(...)`,
  `.bool(...)`, `.blank()`, `.error(code)`, and `.array(...)` are the factories.
  For plain numbers, `sheet.setNumber(row, col, value)` is a shortcut.
- **Formulas are not evaluated on assignment.** Call `wb.recalculate()` (or
  `wb.recalculateDirty()`) when you want values. Saving does not implicitly
  recalculate.

# 3. Read a value back

```java
CellValue total = sheet.value(1, 3);
if (total instanceof CellValue.Number number) {
    System.out.println(number.value());       // 51.0
}
System.out.println(sheet.cell(1, 3).formattedText()); // 51
```

Use the accessor on the matching `CellValue` variant to read the raw value.
`formattedText()` applies the cell's number format, which is what a spreadsheet
application would show.

# 4. A1 notation

If you would rather not count indices, `Sheet.range` accepts an ordinary A1
string, and so do formulas, named ranges, and every reference argument in the
API:

```java
import io.keikai.axyra.sheets.Range;

Range header = sheet.range("A1:D1");    // same as sheet.range(0, 0, 0, 3)
```

# Next

- [Read and Write Files]({{ site.axyra_tutorial }}/read_write) — open an
  existing workbook and edit it.
- [Workbook and Sheet]({{ site.axyra_devref }}/Workbook_and_Sheet) — the full
  model reference.
