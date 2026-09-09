---
title: 'How to Write Data to Excel in Java (From a Database or JSON)'
permalink: /axyra/guides/write-data-to-excel-java
---

{% include axyra_example.html path="guides/WriteDataToExcelExample.java" %}

Getting rows out of a `ResultSet` or a JSON payload and into an `.xlsx`. There
are three ways to do it, and picking the wrong one is the difference between a
200 ms export and one that times out.

# Which approach

| Your data | Use | Why |
|---|---|---|
| A list of records or POJOs | `Sheet.importData` | Reflects the properties into columns, writes a header row, one JNI crossing per chunk |
| A numeric matrix | `Range.setNumbers` | Flat `double[]`, no boxing, no `CellValue` allocation — the fastest path in the API |
| Mixed types, known shape | `Range.setValues` | One crossing for the whole block |
| More rows than fit in memory | `StreamWorkbook` | Writes row by row to disk; flat memory regardless of row count |

What all four have in common: **never loop per cell.** Every `Cell` call crosses
the JNI boundary, so a million-cell loop is a million crossings.

# From a database

Map the `ResultSet` to records first, then hand the list over. Records are the
best fit because `importData` reads their components *in declaration order*,
which gives you deterministic column order for free.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.ImportOptions;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.style.CellStyle;

import java.nio.file.Path;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

record Sale(String region, String product, LocalDate orderDate, double amount) {}

List<Sale> rows = new ArrayList<>();
try (PreparedStatement ps = conn.prepareStatement(
             "SELECT region, product, order_date, amount FROM sales WHERE quarter = ?")) {
    ps.setString(1, "Q3");
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            rows.add(new Sale(
                    rs.getString("region"),
                    rs.getString("product"),
                    rs.getObject("order_date", LocalDate.class),
                    rs.getDouble("amount")));
        }
    }
}

try (Workbook wb = Workbook.create()) {
    Sheet sheet = wb.createSheet("Q3 Sales");

    CellStyle headerStyle = CellStyle.builder().bold().build();

    int written = sheet.importData(0, 0, rows, ImportOptions.builder()
            .columns("region", "product", "orderDate", "amount")
            .headers(true)
            .columnLabels("Region", "Product", "Order Date", "Amount")
            .headerStyle(headerStyle)
            .build());

    System.out.println(written + " rows including the header");
    wb.save(Path.of("q3-sales.xlsx"));
}
```

`importData` returns the number of rows written, counting the header when it is
enabled.

{: .notice--warning}
**Pin the column list.** Without `.columns(...)`, every readable property is
written in declaration order — so adding a field to the record silently adds a
column to next quarter's export. Naming the columns makes that a compile-time
concern instead of a surprise in a spreadsheet.

## Dates need a number format

`importData` converts `LocalDate`, `LocalDateTime`, and `java.util.Date` to
Excel date serials, but it does **not** apply a number format. Only the header
row gets a style, and only the one you pass. So a date column arrives looking
like `45900` until you format it:

```java
CellStyle dateStyle = CellStyle.builder().numberFormat("yyyy-mm-dd").build();
CellStyle money = CellStyle.builder().numberFormat("#,##0.00").build();

int lastRow = rows.size();                      // header is row 0
sheet.range(1, 2, lastRow, 2).setStyle(dateStyle);   // column C
sheet.range(1, 3, lastRow, 3).setStyle(money);       // column D
```

{: .notice--warning}
**`java.sql.Date` and `java.sql.Timestamp` are converted through the JVM's
default time zone**, because they are `java.util.Date` subclasses and that is
what the conversion has to assume. Read them as `LocalDate` /
`LocalDateTime` from the driver (`rs.getObject(col, LocalDate.class)`) and the
question does not arise.

# From JSON

`jackson-databind` is already on the classpath — the SDK uses it across the JNI
boundary — so deserialize into the same kind of record and reuse the path above.

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

ObjectMapper mapper = new ObjectMapper();

List<Sale> rows = mapper.readValue(json, new TypeReference<List<Sale>>() {});
sheet.importData(0, 0, rows, options);
```

{: .notice--info}
**`java.time` types need one more Jackson artifact.** The SDK pulls in
`jackson-databind` but not `jackson-datatype-jsr310`, so a record with a
`LocalDate` component fails to deserialize until you add it and register the
module:

```xml
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
</dependency>
```

```java
ObjectMapper mapper = new ObjectMapper()
        .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
```

{: .notice--info}
**`importData` does not read `Map`s.** Properties are discovered by reflection:
records first, then JavaBean getters, then public fields. A
`List<Map<String, Object>>` from a generic JSON parse will not work — bind to a
record, or build the block yourself with `setValues` as shown next.

If the JSON shape is genuinely dynamic, drive the columns yourself:

```java
import com.fasterxml.jackson.databind.JsonNode;

JsonNode array = mapper.readTree(json);
String[] columns = { "region", "product", "amount" };

// Header.
CellValue[][] header = new CellValue[1][columns.length];
for (int c = 0; c < columns.length; c++) {
    header[0][c] = CellValue.text(columns[c]);
}
sheet.range(0, 0, 0, columns.length - 1).setValues(header);

// Body, in one crossing.
CellValue[][] body = new CellValue[array.size()][columns.length];
for (int r = 0; r < array.size(); r++) {
    JsonNode node = array.get(r);
    for (int c = 0; c < columns.length; c++) {
        JsonNode field = node.get(columns[c]);
        body[r][c] = field == null || field.isNull() ? CellValue.blank()
                : field.isNumber() ? CellValue.number(field.asDouble())
                : field.isBoolean() ? CellValue.bool(field.asBoolean())
                : CellValue.text(field.asText());
    }
}
sheet.range(1, 0, array.size(), columns.length - 1).setValues(body);
```

`setValues` requires the array shape to match the range exactly, which is why
the row count is computed rather than guessed.

# The fast path for numbers

When the block is entirely numeric — a measurement matrix, a pivot of
aggregates — skip `CellValue` altogether. `setNumbers` takes a flat, row-major
`double[]`:

```java
int rowCount = 10_000, colCount = 12;
double[] flat = new double[rowCount * colCount];
// fill row-major: flat[r * colCount + c]

sheet.range(1, 0, rowCount, colCount - 1).setNumbers(flat);
```

This is the fastest way to get numbers into a sheet and the right choice for
loading a matrix out of a database.

# When the export is too big to hold in memory

`Workbook` builds the whole book in memory before writing a byte — the right
trade when you need to read, edit, recalculate, or lay out, and the wrong one
when you are pouring a result set into a file. `StreamWorkbook` writes each row
as it arrives, so a million rows costs the same memory as ten.

```java
import io.keikai.axyra.sheets.io.StreamStyle;
import io.keikai.axyra.sheets.io.StreamWorkbook;

try (StreamWorkbook out = StreamWorkbook.create(Path.of("big-export.xlsx"))) {
    int header = out.addStyle(StreamStyle.defaults().withBold());
    int money  = out.addStyle(StreamStyle.defaults().withNumberFormat("#,##0.00"));
    int date   = out.addStyle(StreamStyle.defaults().withNumberFormat("yyyy-mm-dd"));

    out.startSheet("Sales");

    out.row(0).addText("Region", header)
              .addText("Order Date", header)
              .addText("Amount", header)
              .commit();

    int r = 1;
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            out.row(r++)
               .addText(rs.getString("region"))
               .addDate(rs.getObject("order_date", LocalDate.class), date)
               .addNumber(rs.getDouble("amount"), money)
               .commit();
        }
    }
}
```

What you give up in exchange for flat memory:

- **Forward-only.** Rows go out in ascending index order and never come back;
  writing row 5 after row 9 throws.
- **Values, number formats, bold and italic only.** No charts, images, merges,
  conditional formats, comments, or validation — those need the whole-workbook
  model.
- **No recalculation.** Formulas are written verbatim. If the consumer must see
  a number before opening the file in Excel, supply the cached value with
  `setFormula(column, formula, cachedValue, style)`.
- **Styles are registered up front.** `addStyle` returns an `int` id; pass the id
  to the cell writers.
- **Commit every row.** The row builder is reused, so `commit()` is what actually
  emits it.

See [Streaming Large Files]({{ site.axyra_devref }}/Streaming) for the full
comparison, including the columnar backend for holding big sheets in memory.

# Common mistakes

| Symptom | Cause |
|---|---|
| Export takes minutes | A per-cell loop. Use `importData`, `setValues`, or `setNumbers`. |
| A date column shows `45900` | `importData` writes serials but applies no format. Style the column. |
| Dates are off by one day | `java.sql.Date` converted through the default time zone. Read `LocalDate` from the driver instead. |
| `importData` writes nothing useful from JSON | It cannot reflect over `Map`. Bind to a record, or build the block with `setValues`. |
| A new column appeared in the export after a code change | `.columns(...)` was not pinned, so a new field became a new column. |
| `AxyraException` from `importData` | Mixed element types in the list, or an unknown name in `.columns(...)`. |
| `setValues` throws | The array shape does not match the range. |
| Streaming writer throws on a row | Rows must be written in ascending order, and each needs `commit()`. |
| Formulas are blank in the streamed file | The streaming writer never recalculates. Supply a cached value. |

# Next steps

- [How to Create Excel Reports Automatically in Java]({{ site.axyra_guides }}/generate-excel-reports-java) — fill a designed template instead of building layout in code
- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range#importing-java-objects) — the `importData` reference
- [Streaming Large Files]({{ site.axyra_devref }}/Streaming) — streaming writer and columnar backend
- [Styles and Formats]({{ site.axyra_devref }}/Styles) — number format codes
