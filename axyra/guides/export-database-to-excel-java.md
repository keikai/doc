---
title: 'Export Database Data to Excel with Java and JDBC'
excerpt: 'Build a Java export to Excel from JDBC data with Axyra Sheets. Map SQL values to spreadsheet cells, format dates, and stream large results to XLSX.'
permalink: /axyra/guides/export-database-to-excel-java
keyword: 'java export to excel'
---

# Export Database Data to Excel with Java and JDBC

Java export to Excel is a common requirement when finance, operations, or customers need to review database records outside an application. This guide shows how to turn a JDBC query result into a formatted XLSX workbook with Axyra Sheets for Java. The example supports any `SELECT` statement, maps SQL types to spreadsheet cells, and explains when to stream a large result instead of holding it in memory. It also answers the practical question of how to export database data to Excel in Java without tying the exporter to one table.

## TL;DR

- Read the column names and SQL types from `ResultSetMetaData`, convert each row to `CellValue[]`, and write the whole block with one `Range.setValues` call instead of writing cell by cell.
- Map `DATE` and `TIMESTAMP` columns to Excel date serials and give those columns a date number format, otherwise they appear as plain numbers such as `45900`.
- Export long identifiers and account numbers as text, because Excel keeps only 15 significant digits of a number.
- When the result set has hundreds of thousands of rows, write it with `StreamWorkbook`, which keeps memory use flat by writing each row to disk as it arrives.

## Table of contents

- [What do you need before you start?](#what-do-you-need-before-you-start)
- [Which export approach fits your query?](#which-export-approach-fits-your-query)
- [How does a Java export to Excel work with JDBC?](#how-does-a-java-export-to-excel-work-with-jdbc)
- [How do you export any ResultSet to an Excel sheet?](#how-do-you-export-any-resultset-to-an-excel-sheet)
- [How should SQL types map to Excel cell values?](#how-should-sql-types-map-to-excel-cell-values)
- [How do you make the exported sheet easy to use?](#how-do-you-make-the-exported-sheet-easy-to-use)
- [How do you export several tables into one workbook?](#how-do-you-export-several-tables-into-one-workbook)
- [How do you export a very large table without running out of memory?](#how-do-you-export-a-very-large-table-without-running-out-of-memory)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## What do you need before you start?

You need Java 17 or later, a JDBC driver for your database, and the Axyra Sheets dependency. The native engine ships inside the jar, so there is nothing else to install. The artifact is served from ZK's repository rather than Maven Central, so also add the `<repositories>` entry described in the [Axyra Sheets installation guide](https://doc.keikai.io/axyra/dev-ref/Installation).

```xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>axyra-sheets</artifactId>
    <version>1.0.0.FL.20261022-Eval</version>
</dependency>
```

## Which export approach fits your query?

The right approach depends on whether you know the columns at compile time and on how many rows the query returns. The following table summarizes the three options covered in this guide.

| Situation | Approach | Why it fits |
|---|---|---|
| A fixed query whose columns map to a Java record | `Sheet.importData` with a list of records | The record defines column order and types, so the code stays short |
| Any query, including ones built at runtime | `ResultSetMetaData` plus `Range.setValues` | Column names and types come from the driver, so one exporter serves every query |
| More rows than you want to hold in memory | `StreamWorkbook` | Rows are written to disk one at a time, so memory use does not grow with the row count |

The record-based approach is covered in detail in [How to Write Data to Excel in Java](https://doc.keikai.io/axyra/guides/write-data-to-excel-java). This guide focuses on the generic exporter, because it is the one most teams end up needing once users ask for "an export button on every report".

## How does a Java export to Excel work with JDBC?

The application runs a parameterized SQL query, reads its rows and column metadata through JDBC, writes the values into an Axyra workbook, and saves that workbook as XLSX. This is a database to Excel in Java workflow: JDBC handles the source data, while Axyra handles spreadsheet values, styles, and file output. If the columns are fixed, a record-based export is simpler; if the query changes at runtime, the metadata-driven exporter below avoids a separate mapping for every query.

## How do you export any ResultSet to an Excel sheet?

A `ResultSetMetaData` object describes the columns of a query result: how many there are, what each one is called, and which SQL type the driver reports for it. It is part of the standard JDBC API, and the [Oracle JDBC tutorial](https://docs.oracle.com/javase/tutorial/jdbc/basics/retrieving.html) explains how a `ResultSet` is read row by row. Because the metadata is available at runtime, an exporter that reads it can handle any `SELECT` statement without knowing the columns in advance.

The exporter below writes a bold header row from the column labels, converts each row into an array of `CellValue`, and then writes the whole body with a single `Range.setValues` call. Writing the block at once matters for performance, because every individual cell call crosses from Java into the native engine, while a range call crosses only once.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.style.CellStyle;

import java.nio.file.Path;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DatabaseExporter {

    /** Writes the result set to the sheet starting at A1 and returns the number of data rows. */
    public static int export(ResultSet rs, Sheet sheet) throws SQLException {
        ResultSetMetaData md = rs.getMetaData();
        int cols = md.getColumnCount();

        CellValue[][] header = new CellValue[1][cols];
        for (int c = 0; c < cols; c++) {
            header[0][c] = CellValue.text(md.getColumnLabel(c + 1));
        }
        sheet.range(0, 0, 0, cols - 1).setValues(header);
        sheet.range(0, 0, 0, cols - 1).setStyle(CellStyle.builder().bold().build());

        List<CellValue[]> rows = new ArrayList<>();
        while (rs.next()) {
            CellValue[] row = new CellValue[cols];
            for (int c = 0; c < cols; c++) {
                row[c] = SqlCells.toCell(rs, c + 1, md.getColumnType(c + 1));
            }
            rows.add(row);
        }

        if (!rows.isEmpty()) {
            sheet.range(1, 0, rows.size(), cols - 1)
                 .setValues(rows.toArray(new CellValue[0][]));
        }
        return rows.size();
    }

    public static void main(String[] args) throws Exception {
        try (Connection conn = DriverManager.getConnection(args[0]);
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT order_id, customer, order_date, amount, paid FROM orders WHERE order_date >= ?")) {
            ps.setObject(1, java.time.LocalDate.of(2026, 7, 1));

            try (ResultSet rs = ps.executeQuery();
                 Workbook wb = Workbook.create()) {
                Sheet sheet = wb.createSheet("Orders");
                int count = export(rs, sheet);
                wb.save(Path.of("orders.xlsx"));
                System.out.println(count + " rows exported");
            }
        }
    }
}
```

`Range.setValues` requires the array to have exactly the same shape as the target range, which is why the range is computed from `rows.size()` and the column count rather than from a fixed address. The empty-result check avoids building a range with zero rows.

## How should SQL types map to Excel cell values?

A spreadsheet cell holds one of a small number of value kinds: a number, text, a boolean, an error, or nothing. Dates are not a separate kind. Excel stores a date as a serial number that counts days from an epoch, and the cell's number format is what makes that number look like a date. The `SqlCells.toCell` helper used above applies the following mapping.

| SQL type | Cell value | Notes |
|---|---|---|
| `INTEGER`, `SMALLINT`, `DECIMAL`, `NUMERIC`, `DOUBLE`, `REAL` | Number | Read through `getBigDecimal` so that `NULL` can be told apart from zero |
| `BIGINT` | Number, or text for identifiers | Excel keeps 15 significant digits, so long IDs must be text |
| `DATE` | Number (date serial) | Needs a date number format on the column |
| `TIMESTAMP` | Number (serial with a time fraction) | Needs a date-time number format |
| `BOOLEAN`, `BIT` | Boolean | Shown as `TRUE` or `FALSE` |
| `CHAR`, `VARCHAR`, `CLOB`, and everything else | Text | Read with `getString` |
| `NULL` in any column | Blank | Keeps the cell empty rather than writing `0` or `"null"` |

```java
import io.keikai.axyra.sheets.CellValue;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

final class SqlCells {

    // In Excel's 1900 date system, any date from 1900-03-01 onward has a serial
    // equal to the number of days since 1899-12-30.
    private static final LocalDate EXCEL_EPOCH = LocalDate.of(1899, 12, 30);

    static CellValue toCell(ResultSet rs, int i, int sqlType) throws SQLException {
        switch (sqlType) {
            case Types.TINYINT, Types.SMALLINT, Types.INTEGER, Types.BIGINT,
                 Types.DECIMAL, Types.NUMERIC, Types.REAL, Types.FLOAT, Types.DOUBLE: {
                BigDecimal n = rs.getBigDecimal(i);
                return n == null ? CellValue.blank() : CellValue.number(n.doubleValue());
            }
            case Types.DATE: {
                LocalDate d = rs.getObject(i, LocalDate.class);
                return d == null ? CellValue.blank() : CellValue.number(serial(d));
            }
            case Types.TIMESTAMP: {
                LocalDateTime t = rs.getObject(i, LocalDateTime.class);
                return t == null ? CellValue.blank() : CellValue.number(serial(t));
            }
            case Types.BOOLEAN, Types.BIT: {
                boolean b = rs.getBoolean(i);
                return rs.wasNull() ? CellValue.blank() : CellValue.bool(b);
            }
            default: {
                String s = rs.getString(i);
                return s == null ? CellValue.blank() : CellValue.text(s);
            }
        }
    }

    static double serial(LocalDate d) {
        return ChronoUnit.DAYS.between(EXCEL_EPOCH, d);
    }

    static double serial(LocalDateTime t) {
        return serial(t.toLocalDate()) + t.toLocalTime().toSecondOfDay() / 86_400.0;
    }
}
```

Reading `DATE` and `TIMESTAMP` columns as `LocalDate` and `LocalDateTime` is deliberate. The older `java.sql.Date` and `java.sql.Timestamp` classes are converted through the JVM's default time zone, which can move a date by one day when the server and the database disagree about the zone.

{: .notice--warning}
**Keep identifiers as text.** Excel limits numeric precision to 15 significant digits, as described in [Microsoft's Excel precision documentation](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/floating-point-arithmetic-inaccurate-result). A 16-digit order number or card token exported as a number can be rounded. If a `BIGINT` or `DECIMAL` column holds identifiers rather than quantities, write it with `CellValue.text(rs.getString(i))`. The same applies to codes with leading zeros, such as `00042`.

## How do you make the exported sheet easy to use?

Raw values are only part of a usable export. The reader also expects dates that look like dates, a header that stays visible while scrolling, and a filter on every column. The following code applies those finishing touches after `export` has returned the row count.

```java
import io.keikai.axyra.sheets.style.CellStyle;

int rowCount = DatabaseExporter.export(rs, sheet);
int lastRow = rowCount;          // the header is row 0
ResultSetMetaData md = rs.getMetaData();
int cols = md.getColumnCount();

CellStyle date = CellStyle.builder().numberFormat("yyyy-mm-dd").build();
CellStyle dateTime = CellStyle.builder().numberFormat("yyyy-mm-dd hh:mm").build();
CellStyle money = CellStyle.builder().numberFormat("#,##0.00").build();

for (int c = 0; c < cols && rowCount > 0; c++) {
    int type = md.getColumnType(c + 1);
    if (type == Types.DATE) {
        sheet.range(1, c, lastRow, c).setStyle(date);
    } else if (type == Types.TIMESTAMP) {
        sheet.range(1, c, lastRow, c).setStyle(dateTime);
    } else if (type == Types.DECIMAL || type == Types.NUMERIC) {
        sheet.range(1, c, lastRow, c).setStyle(money);
    }
    sheet.setColumnWidth(c, 16);
}

sheet.freezePanes(1, 0);                                   // keep the header visible
sheet.setAutoFilter(sheet.range(0, 0, lastRow, cols - 1)); // filter buttons on the header
```

Two details in this code are worth explaining. First, the column widths are set explicitly because `autoFitColumn` measures the raw value and ignores the number format, so a formatted amount such as `8,060.00` can end up too narrow and display as `####`. Second, `Range.setStyle` replaces the whole style of each cell, so apply the number format before any other formatting you want to keep, or build one style that contains everything.

## How do you export several tables into one workbook?

Users often want one file with a sheet per table, for example orders, customers, and invoices for the same period. Create one sheet per query and reuse the same exporter for each.

```java
Map<String, String> queries = new LinkedHashMap<>();
queries.put("Orders",    "SELECT * FROM orders WHERE period = '2026-Q3'");
queries.put("Customers", "SELECT * FROM customers");
queries.put("Invoices",  "SELECT * FROM invoices WHERE period = '2026-Q3'");

try (Workbook wb = Workbook.create()) {
    for (Map.Entry<String, String> q : queries.entrySet()) {
        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(q.getValue())) {
            DatabaseExporter.export(rs, wb.createSheet(q.getKey()));
        }
    }
    wb.save(Path.of("q3-export.xlsx"));
}
```

Sheet names must follow Excel's rules: at most 31 characters, unique within the workbook, and without the characters `\ / ? * [ ] :`. If you derive sheet names from table names or user input, sanitize them before calling `createSheet`.

## How do you export a very large table without running out of memory?

A `Workbook` holds the entire workbook in memory until you save it, which is the right trade-off when you need formulas, charts, or layout, but a poor one when you only need to pour a large result set into a file. For that case Axyra Sheets provides `StreamWorkbook`, a write-only writer that sends each row to disk as soon as you commit it. Memory use stays flat whether the table has ten thousand rows or a million.

```java
import io.keikai.axyra.sheets.io.StreamRow;
import io.keikai.axyra.sheets.io.StreamStyle;
import io.keikai.axyra.sheets.io.StreamWorkbook;

import java.math.BigDecimal;

try (PreparedStatement ps = conn.prepareStatement(
        "SELECT order_id, customer, order_date, amount FROM orders",
        ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)) {
    ps.setFetchSize(1_000);   // let the driver stream rows instead of loading them all

    try (ResultSet rs = ps.executeQuery();
         StreamWorkbook out = StreamWorkbook.create(Path.of("orders-full.xlsx"))) {
        int bold  = out.addStyle(StreamStyle.defaults().withBold());
        int date  = out.addStyle(StreamStyle.defaults().withNumberFormat("yyyy-mm-dd"));
        int money = out.addStyle(StreamStyle.defaults().withNumberFormat("#,##0.00"));

        out.startSheet("Orders");
        out.row(0).addText("Order ID", bold).addText("Customer", bold)
                  .addText("Order Date", bold).addText("Amount", bold).commit();

        int r = 1;
        while (rs.next()) {
            StreamRow row = out.row(r++)
                    .addText(rs.getString("order_id"))
                    .addText(rs.getString("customer"))
                    .addDate(rs.getObject("order_date", LocalDate.class), date);
            BigDecimal amount = rs.getBigDecimal("amount");
            if (amount == null) {
                row.skip();
            } else {
                row.addNumber(amount.doubleValue(), money);
            }
            row.commit();
        }
    }
}
```

Keeping memory low requires cooperation from the JDBC driver as well, because some drivers load the whole result set into memory by default. `setFetchSize` asks the driver to fetch rows in batches. Its exact behavior is driver-specific: the PostgreSQL driver, for example, only honors it when auto-commit is turned off on the connection. Check your driver's documentation if memory still grows during the export.

The streaming writer has a narrower feature set than `Workbook`. Rows must be written in ascending order and committed one by one, formulas are not recalculated, and formatting is limited to values, number formats, bold, and italic. The [Streaming Large Files reference](https://doc.keikai.io/axyra/dev-ref/Streaming) lists the full set of differences. For an Excel export Java service that receives unpredictable query sizes, set a row threshold and switch to this approach before allocating the full `CellValue[][]` block.

{: .notice--info}
**One sheet holds at most 1,048,576 rows.** This limit comes from the XLSX format itself and is listed in Microsoft's [Excel specifications and limits](https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3). If a table can exceed it, split the export by a natural key such as month or region, either into separate sheets or into separate files.

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| The export takes minutes | Values are written one cell at a time | Build a `CellValue[][]` and write it with one `setValues` call |
| A date column shows numbers such as `45900` | The serial was written without a date format | Apply a `yyyy-mm-dd` number format to the column |
| Dates are one day early or late | `java.sql.Date` was converted through the JVM time zone | Read the column as `LocalDate` with `getObject(i, LocalDate.class)` |
| Long IDs end in `000` | The ID was exported as a number and rounded to 15 digits | Export identifier columns as text |
| Empty values appear as `0` | `getDouble` returns `0` for SQL `NULL` | Use `getBigDecimal` or check `wasNull()` and write a blank |
| `OutOfMemoryError` on a large table | The whole result set and workbook are in memory | Use `StreamWorkbook` and set a fetch size |
| `createSheet` fails | The sheet name is too long, duplicated, or contains a reserved character | Sanitize names derived from tables or user input |

## FAQ

### How do I export data to Excel in Java from a database?

Run the query with JDBC, read the column labels and types from `ResultSetMetaData`, convert each row into an array of `CellValue`, and write the whole block to a sheet with `Range.setValues`. Then save the workbook with `wb.save(Path.of("export.xlsx"))`. This Excel export Java code works with any `SELECT` statement whose values fit the spreadsheet's supported cell types.

### Can I export a database table to Excel without Apache POI?

Yes, you can, because Axyra Sheets for Java reads and writes XLSX files with its own engine, so it does not depend on Apache POI. It also calculates formulas and renders PDF, which is useful when the export later grows into a report.

### How do I export a large database table to Excel in Java?

Use `StreamWorkbook`, which writes each row to the file as soon as it is committed, and set a fetch size on the JDBC statement so the driver does not load the entire result set at once. Memory use then stays roughly constant regardless of the number of rows.

### How do I keep dates from showing as numbers in the exported file?

Excel stores dates as serial numbers, so the column needs a date number format such as `yyyy-mm-dd`. Apply it to the date columns with `Range.setStyle` after writing the values, or pass a date style to `addDate` when you use `StreamWorkbook`.

### How do I export the result to CSV instead of XLSX?

Save the same workbook with a `.csv` file name, for example `wb.save(Path.of("orders.csv"))`. CSV holds one sheet of plain text, so formatting is lost, and Axyra Sheets neutralizes cells that start with `=`, `+`, `-`, or `@` to protect readers from CSV injection.

## Next steps

- [How to Write Data to Excel in Java](https://doc.keikai.io/axyra/guides/write-data-to-excel-java) explains `importData` for records and JSON.
- [How to Create Excel Reports Automatically in Java](https://doc.keikai.io/axyra/guides/generate-excel-reports-java) shows how to fill a designed template instead of building the layout in code.
- [How to Import Excel Data into a Database in Java]({{ site.axyra_guides }}/import-excel-to-database-java) covers the opposite direction.
- [Streaming Large Files](https://doc.keikai.io/axyra/dev-ref/Streaming) describes the streaming writer in detail.
