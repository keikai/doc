---
title: 'Import Excel Data into a Database with Java: Validate and Insert XLSX Rows'
excerpt: 'Import Excel to a database in Java with Axyra Sheets and JDBC. Read uploads, validate rows, batch insert records, and return an annotated error workbook.'
permalink: /axyra/guides/import-excel-to-database-java
keyword: 'import excel to database java'
---

# Import Excel Data into a Database with Java: Validate and Insert XLSX Rows

Import Excel to database Java workflows usually begin with a file prepared by customers, suppliers, or internal teams. The difficult part is deciding what to do when a column is missing, a date is typed as text, or one row in five thousand has an invalid value. This guide uses Axyra Sheets to read an uploaded workbook, map columns by header name, validate rows, and insert approved records with JDBC batches. It also shows how to return the file with problems highlighted so users can correct it.

## TL;DR

- Open the uploaded file with `Workbook.open(inputStream, "xlsx")` and read the whole data block at once with `usedRange().values()`.
- Find columns by their header text rather than by position, so that users can reorder or add columns without breaking the import.
- Convert and validate each row into a Java record, and collect errors with their row and column instead of stopping at the first one.
- Insert the valid rows with `PreparedStatement.addBatch` inside one transaction.
- Mark invalid cells in the same workbook with a fill color and a comment, and return it to the user as an error report.

## Table of contents

- [What does a reliable Excel import look like?](#what-does-a-reliable-excel-import-look-like)
- [How does an import Excel to database Java workflow work?](#how-does-an-import-excel-to-database-java-workflow-work)
- [How do you read the uploaded Excel file?](#how-do-you-read-the-uploaded-excel-file)
- [How do you map columns by header name?](#how-do-you-map-columns-by-header-name)
- [How do you convert and validate each row?](#how-do-you-convert-and-validate-each-row)
- [How do you insert the rows into the database efficiently?](#how-do-you-insert-the-rows-into-the-database-efficiently)
- [How do you give users an error report they can fix?](#how-do-you-give-users-an-error-report-they-can-fix)
- [Should a bad row reject the whole file?](#should-a-bad-row-reject-the-whole-file)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## What does a reliable Excel import look like?

A reliable import treats the spreadsheet as untrusted input. It does not assume that columns are in a fixed order, that every cell has the expected type, or that the file contains only the rows you expect. The pipeline in this guide has five stages, and each one has a single responsibility.

| Stage | What it does | Axyra Sheets API |
|---|---|---|
| Read | Opens the workbook from a file, byte array, or stream | `Workbook.open`, `Workbook.openBytes` |
| Map | Finds each required column by its header text | `Range.values()` on the header row |
| Validate | Converts cells to Java types and records every problem | `CellValue` pattern matching |
| Load | Inserts valid rows in batches inside a transaction | Standard JDBC |
| Report | Highlights invalid cells and adds an explanation | `Cell.setStyle`, `Cell.setComment` |

The example imports a product price list with four columns: SKU, name, price, and the date from which the price is valid.

## How does an import Excel to database Java workflow work?

The application accepts an Excel file upload in Java, reads the workbook with Axyra Sheets, validates each row, and writes the accepted values through JDBC. The upload should be treated as untrusted input: file format checks, header validation, type conversion, and database constraints all have separate jobs. If you need Java code to read an Excel file and insert it into a database, the example below follows an all-or-nothing policy: a file with validation errors is returned for correction before any insert runs.

## How do you read the uploaded Excel file?

When the file comes from an upload or a message queue, there is no file name to detect the format from, so pass the format explicitly. Axyra Sheets reads XLSX, XLSM, XLSB, XLS, ODS, and CSV with the same API, which means one import can accept all of them.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Range;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;

static Sheet firstUserSheet(Workbook wb) {
    return wb.sheets().stream()
            .filter(sheet -> !sheet.name().equals("Axyra Evaluation Copy"))
            .findFirst()
            .orElseThrow(() -> new ImportException("The workbook has no data sheet."));
}

try (InputStream in = upload.getInputStream();
     Workbook wb = Workbook.open(in, "xlsx")) {

    Sheet sheet = firstUserSheet(wb);
    Range used = sheet.usedRange();
    if (used == null) {
        throw new ImportException("The data sheet is empty.");
    }

    CellValue[][] grid = used.values();   // one call for the whole block
    // ... map, validate, load
}
```

`firstUserSheet` skips the notice sheet that an Evaluation Mode save places at
the front of a workbook. `usedRange()` returns the block of populated cells, or
`null` for an empty sheet. Reading that block with `values()` makes a single call
into the native engine, which is much faster than reading cells one at a time.
Keep in mind that the indices inside `grid` are relative to the used range, so
`grid[0]` is the first populated row, not necessarily spreadsheet row 1. The
[How to Read an Excel File in Java](https://doc.keikai.io/axyra/guides/read-excel-file-java)
guide covers reading in more depth.

{: .notice--warning}
**Close the workbook before you return.** A `Workbook` owns native memory outside the Java heap, and `Sheet`, `Range`, and `Cell` objects stop working once it is closed. Extract the values you need inside the `try` block and return plain Java objects.

## How do you map columns by header name?

Users rearrange columns, insert a comment column, or export the file from a different system with a different order. If the import reads columns by position, any of these changes silently loads the wrong data into the wrong field. Mapping by header text makes the import tolerant of such changes and lets it fail with a clear message when a required column is genuinely missing.

```java
static Map<String, Integer> mapHeaders(CellValue[] headerRow, String... required) {
    Map<String, Integer> found = new HashMap<>();
    for (int c = 0; c < headerRow.length; c++) {
        if (headerRow[c] instanceof CellValue.Text t) {
            found.put(normalize(t.value()), c);
        }
    }

    List<String> missing = new ArrayList<>();
    Map<String, Integer> columns = new LinkedHashMap<>();
    for (String name : required) {
        Integer index = found.get(normalize(name));
        if (index == null) {
            missing.add(name);
        } else {
            columns.put(name, index);
        }
    }
    if (!missing.isEmpty()) {
        throw new ImportException("Missing required columns: " + String.join(", ", missing));
    }
    return columns;
}

static String normalize(String header) {
    return header.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
}
```

Normalizing the header text removes differences in case and spacing, so `"Valid From"`, `"valid from"`, and `" Valid  From "` all match.

## How do you convert and validate each row?

Each cell arrives as a `CellValue`, which is one of `Number`, `Text`, `Bool`, `Error`, `Array`, or `Blank`. The conversion step turns those values into the Java types the database expects and records every problem it finds, together with the row and column, so that the user can see all errors at once instead of fixing them one upload at a time.

```java
record Price(String sku, String name, BigDecimal price, LocalDate validFrom) {}

record RowError(int row, int column, String message) {}

static List<Price> validate(CellValue[][] grid, Map<String, Integer> col,
                            List<RowError> errors, boolean date1904) {
    List<Price> valid = new ArrayList<>();

    for (int r = 1; r < grid.length; r++) {            // row 0 is the header
        CellValue[] row = grid[r];
        if (Arrays.stream(row).allMatch(v -> v instanceof CellValue.Blank)) {
            continue;                                   // skip empty rows
        }
        int before = errors.size();

        String sku = text(row[col.get("SKU")]);
        if (sku.isEmpty()) {
            errors.add(new RowError(r, col.get("SKU"), "SKU is required."));
        }

        String name = text(row[col.get("Name")]);

        BigDecimal price = null;
        CellValue p = row[col.get("Price")];
        if (p instanceof CellValue.Number n && n.value() >= 0) {
            price = BigDecimal.valueOf(n.value()).setScale(2, RoundingMode.HALF_UP);
        } else {
            errors.add(new RowError(r, col.get("Price"), "Price must be a number of zero or more."));
        }

        LocalDate validFrom = null;
        CellValue d = row[col.get("Valid From")];
        if (d instanceof CellValue.Number n) {
            validFrom = excelDate(n.value(), date1904);
        } else if (d instanceof CellValue.Text t) {
            try {
                validFrom = LocalDate.parse(t.value().trim());
            } catch (DateTimeParseException e) {
                errors.add(new RowError(r, col.get("Valid From"), "Use a date such as 2026-07-01."));
            }
        } else {
            errors.add(new RowError(r, col.get("Valid From"), "Valid From is required."));
        }

        if (errors.size() == before) {
            valid.add(new Price(sku, name, price, validFrom));
        }
    }
    return valid;
}

static LocalDate excelDate(double serial, boolean date1904) {
    long days = (long) serial;
    if (date1904) {
        return LocalDate.of(1904, 1, 1).plusDays(days);
    }
    LocalDate epoch = days < 60
            ? LocalDate.of(1899, 12, 31)
            : LocalDate.of(1899, 12, 30);
    return epoch.plusDays(days);
}

static String text(CellValue v) {
    if (v instanceof CellValue.Text t) return t.value().trim();
    if (v instanceof CellValue.Number n) return BigDecimal.valueOf(n.value()).stripTrailingZeros().toPlainString();
    return "";
}
```

A few details in this code deserve explanation. Excel stores dates as serial numbers, so a properly formatted date cell arrives as `CellValue.Number`. Pass `wb.date1904()` into `validate` so the helper uses the workbook's date system and handles Excel's 1900 leap-year compatibility rule. A date typed as text is parsed as ISO-8601 and reported if it does not parse. Finally, a cell that shows a formula error such as `#N/A` arrives as `CellValue.Error`, which the code treats as invalid input rather than as an exception.

{: .notice--info}
**Identifiers can lose leading zeros before they reach your code.** If a user types `00042` into a cell formatted as a number, Excel stores the number `42`. The `text` helper cannot restore the zeros. Ask users to format identifier columns as text in your template, or pad the value to the expected length when the business rule allows it.

## How do you insert the rows into the database efficiently?

A batch insert sends many rows to the database in one round trip instead of one statement per row. JDBC supports this through `addBatch` and `executeBatch`, which are described in the [`java.sql.Statement` documentation](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Statement.html). Running the batches inside one transaction means that either all valid rows are stored or none are, which keeps the table consistent if the database rejects a row halfway through.

```java
static void insert(Connection conn, List<Price> prices) throws SQLException {
    String sql = "INSERT INTO price_list (sku, name, price, valid_from) VALUES (?, ?, ?, ?)";
    boolean autoCommit = conn.getAutoCommit();
    conn.setAutoCommit(false);

    try (PreparedStatement ps = conn.prepareStatement(sql)) {
        int pending = 0;
        for (Price p : prices) {
            ps.setString(1, p.sku());
            ps.setString(2, p.name());
            ps.setBigDecimal(3, p.price());
            ps.setObject(4, p.validFrom());
            ps.addBatch();

            if (++pending == 500) {          // flush in chunks to bound driver memory
                ps.executeBatch();
                pending = 0;
            }
        }
        if (pending > 0) {
            ps.executeBatch();
        }
        conn.commit();
    } catch (SQLException e) {
        conn.rollback();
        throw e;
    } finally {
        conn.setAutoCommit(autoCommit);
    }
}
```

If the import should update existing rows rather than fail on a duplicate key, replace the `INSERT` with your database's upsert statement, such as `INSERT ... ON CONFLICT` in PostgreSQL or `MERGE` in SQL Server and Oracle. For very large files, many teams first load the rows into a staging table and then move them into the real table with one SQL statement, which keeps the validation logic in Java and the set-based work in the database.

## How do you give users an error report they can fix?

A list of messages such as "row 418, column D" forces users to search the file by hand. A better report is the user's own file, with every invalid cell highlighted and explained. Because the workbook is still open, you can write the errors back into it and return it as the response to the upload.

```java
import io.keikai.axyra.sheets.style.Color;

static byte[] annotate(Workbook wb, Sheet sheet, Range used, List<RowError> errors) {
    Color invalid = Color.rgb(255, 199, 206);   // light red

    for (RowError e : errors) {
        int row = used.firstRow() + e.row();          // grid index to sheet index
        int col = used.firstColumn() + e.column();
        var cell = sheet.cell(row, col);
        cell.setStyle(cell.style().toBuilder().fill(invalid).build());
        cell.setComment("Import", e.message());
    }
    return wb.saveBytes("xlsx");
}
```

The caller passes the same data sheet used for validation, so an Evaluation Mode
notice sheet cannot redirect the annotations. The code adds the fill to the
cell's existing style through `toBuilder()`, rather than replacing the style, so
number formats and fonts in the user's file stay intact. The errors are stored as
grid indices, so the code adds the used range's first row and column to convert
them back into sheet coordinates.

## Should a bad row reject the whole file?

There are two common policies, and the right one depends on how the imported data is used.

| Policy | Behavior | Good fit for |
|---|---|---|
| All or nothing | If any row is invalid, nothing is inserted and the annotated file is returned | Price lists, master data, and anything where a partial load would be inconsistent |
| Partial import | Valid rows are inserted, invalid rows are returned for correction | Large operational uploads, such as inventory counts, where most rows are independent |

With the all-or-nothing policy, call `insert` only when the error list is empty. With a partial import, call it with the valid rows and return the annotated file alongside a count of what was stored. In both cases, tell the user the outcome in plain terms, for example "4,812 rows imported, 3 rows need correction".

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| The import is slow on large files | Cells are read one at a time | Read the block with `usedRange().values()` |
| Data lands in the wrong database column | Columns are read by position | Map columns by header name |
| Dates are stored as numbers such as `45900` | The date serial was not converted | Convert `CellValue.Number` to `LocalDate` |
| Dates are four years off | The workbook uses the 1904 date system | Read dates with `cell.dateValue()` |
| SKU `00042` is stored as `42` | The cell was a number in the source file | Ask for a text-formatted column, or pad the value |
| The import stops at the first bad row | Validation throws instead of collecting errors | Collect `RowError` objects and report them together |
| The table is half-filled after a failure | Rows were committed one at a time | Insert inside a transaction and roll back on failure |
| `IllegalStateException` after the method returns | A `Sheet` or `Range` was used after the workbook closed | Extract plain values inside the `try` block |

## FAQ

### How do I import Excel data into a database in Java?

Open the file with `Workbook.open`, read the data block with `usedRange().values()`, map the columns by header text, convert each row into a Java record while collecting validation errors, and insert the valid records with a JDBC batch inside a transaction.

### How do I import an Excel file in Java after a user uploads it?

Read the upload as an `InputStream` or a byte array and open it with `Workbook.open(in, "xlsx")` or `Workbook.openBytes(bytes, "xlsx")`. The format must be given explicitly because there is no file name to detect it from. For an upload endpoint, see [Import and Export Excel in Spring Boot]({{ site.axyra_guides }}/spring-boot-excel-import-export).

### How do I handle dates when importing Excel into a database?

A formatted date cell arrives as a serial number. Convert it with `wb.date1904()` and Excel's 1900 leap-year compatibility rule, as shown above, or call `cell.dateValue()`, which handles the workbook's date system. If users type dates as text, parse them and report the ones that do not match the expected format.

### Can I import CSV files with the same code?

Yes, you can pass `"csv"` as the format, and Axyra Sheets detects the delimiter, quoting, encoding, and column types. The rest of the pipeline, including header mapping and validation, stays the same.

### How do I show users which rows failed to import?

Write the errors back into the uploaded workbook. Give each invalid cell a fill color with `cell.style().toBuilder().fill(...)`, attach the message with `cell.setComment`, and return the file with `wb.saveBytes("xlsx")`. Users can then fix the highlighted cells and upload the same file again.

## Next steps

- [How to Read an Excel File in Java](https://doc.keikai.io/axyra/guides/read-excel-file-java) explains bulk reading and value types.
- [How to Export Database Data to Excel in Java]({{ site.axyra_guides }}/export-database-to-excel-java) covers the opposite direction.
- [Cells and Ranges](https://doc.keikai.io/axyra/dev-ref/Cell_and_Range) is the full data-access reference.
