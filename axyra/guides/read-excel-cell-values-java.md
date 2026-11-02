---
title: 'Read Excel Cell Values in Java with Axyra Sheets'
excerpt: 'Read Excel cell values in Java with Axyra Sheets while preserving text, numbers, dates, booleans, blanks, formulas, errors, and display formats.'
permalink: /axyra/guides/read-excel-cell-values-java
keyword: 'read Excel cell values in Java'
---

# Read Excel Cell Values in Java with Axyra Sheets

When importing orders from Excel, a Java application may need to read an order ID as text, an order date as `LocalDate`, and an amount as a number. The displayed cell text does not always match the underlying value: a date is stored as a numeric serial, while an identifier may contain leading zeros that must be preserved.

This guide shows how to read Excel cell values in Java with Axyra Sheets and map them to application fields. It covers text, numbers, dates, blanks, errors, and formula results, and explains when to use raw values or formatted display text.

## TL;DR

- Axyra's `CellValue` model preserves six variants: `Number`, `Text`, `Bool`, `Error`, `Blank`, and `Array`.
- Read a mixed block with one `Range.values()` call, then validate each typed value in Java.
- Convert known date columns with `dateValue()` or `dateTimeValue()`; Axyra accounts for the workbook's 1900 or 1904 date system.
- Choose the right representation: `value()` for raw or calculated values, `formattedText()` for displayed text, and `formula()` for formula source.
- Treat Excel errors as data that can be collected and reported instead of terminating the entire import.
- Keep identifiers as text. Converting a long account number to `double` can lose digits.

## Table of contents

- [How does Axyra preserve Excel cell types?](#how-does-axyra-preserve-excel-cell-types)
- [How do you read a block of mixed values?](#how-do-you-read-a-block-of-mixed-values)
- [How do you convert CellValue safely?](#how-do-you-convert-cellvalue-safely)
- [How do you read Excel dates and times?](#how-do-you-read-excel-dates-and-times)
- [What is the difference between raw and formatted text?](#what-is-the-difference-between-raw-and-formatted-text)
- [How do formulas, blanks, arrays, and errors behave?](#how-do-formulas-blanks-arrays-and-errors-behave)
- [How do you map a row to a Java record?](#how-do-you-map-a-row-to-a-java-record)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## How does Axyra preserve Excel cell types?

Axyra returns a sealed `CellValue` instead of guessing a Java type or coercing every value to text. Imports can therefore validate each cell explicitly and report a precise error without discarding its original meaning. A value is exactly one of these six variants:

| Variant | Meaning | Read with |
|---|---|---|
| `CellValue.Text` | Text, including IDs with leading zeros | `value()` |
| `CellValue.Number` | Any numeric value, including date serials | `value()` |
| `CellValue.Bool` | `TRUE` or `FALSE` | `value()` |
| `CellValue.Blank` | No value | no accessor needed |
| `CellValue.Error` | An Excel error such as `#DIV/0!` | `display()` or `code()` |
| `CellValue.Array` | An explicit array value used by array-aware APIs | `rows()`, `get()`, `rowCount()`, or `colCount()` |

The type describes the stored or calculated value, not its visual style. A currency cell and a percentage cell can both be `CellValue.Number`; their number formats differ.

## How do you read a block of mixed values?

Open the workbook and select the worksheet by name, then read a rectangular range with `values()`. This example prints the values from an `Orders` worksheet; `toDebugText` is defined in the next section.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Range;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;

import java.nio.file.Path;

try (Workbook wb = Workbook.open(Path.of("orders.xlsx"))) {
    Sheet sheet = wb.sheet("Orders");
    Range used = sheet.usedRange();
    if (used != null) {
        CellValue[][] rows = used.values();
        for (CellValue[] row : rows) {
            for (CellValue value : row) {
                System.out.println(toDebugText(value));
            }
        }
    }
}
```

The returned array is row-major. `rows[0][0]` corresponds to the top-left cell of the range, not necessarily A1. Use `used.firstRow()` and `used.firstColumn()` if an error report needs the original worksheet coordinates.

## How do you convert CellValue safely?

Handle every variant deliberately. On Java 17, an `instanceof` chain keeps the code straightforward:

```java
static String toDebugText(CellValue value) {
    if (value instanceof CellValue.Text text) {
        return text.value();
    }
    if (value instanceof CellValue.Number number) {
        return Double.toString(number.value());
    }
    if (value instanceof CellValue.Bool bool) {
        return Boolean.toString(bool.value());
    }
    if (value instanceof CellValue.Error error) {
        return error.display();
    }
    if (value instanceof CellValue.Array array) {
        return "[array " + array.rowCount() + "x" + array.colCount() + "]";
    }
    return "";                     // CellValue.Blank
}
```

The helper above is for inspecting values during development. For application fields, use typed conversion helpers such as the following and report values that do not match the expected column type.

```java
static String requiredText(CellValue value, String column) {
    if (value instanceof CellValue.Text text && !text.value().isBlank()) {
        return text.value();
    }
    throw new IllegalArgumentException(column + " must contain text");
}

static double requiredNumber(CellValue value, String column) {
    if (value instanceof CellValue.Number number) {
        return number.value();
    }
    throw new IllegalArgumentException(column + " must contain a number");
}
```

Avoid silent coercion unless the import specification allows it. A text value of `"12"` may be a data error, not permission to parse it as a number.

## How do you read Excel dates and times?

Excel does not store a separate date type. It stores a number and applies a date number format. That means `value()` returns `CellValue.Number` for both `45123` and a cell displayed as `2023-07-16`.

When the schema says a cell is a date, convert through `Cell`:

```java
import java.time.LocalDate;
import java.time.LocalDateTime;

LocalDate orderDate = sheet.cell(row, orderDateColumn).dateValue();
LocalDateTime createdAt = sheet.cell(row, createdAtColumn).dateTimeValue();
```

These methods account for the workbook's 1900 or 1904 date system. Do not hard-code an epoch or infer a date merely because the number format happens to contain `d`, `m`, or `y`.

{: .notice--info}
**Let the column contract decide.** One numeric serial could mean a date in `Order Date` and an ordinary quantity in `Units`. Header mapping or an import schema is more reliable than guessing from the value.

For a large mixed import, bulk-read the row values, validate that the date position contains a `CellValue.Number`, and call `dateValue()` only for that cell. This preserves bulk performance for the rest of the row.

## What is the difference between raw and formatted text?

Use raw values for calculations and imports. Use formatted text when the exact displayed string is the requirement.

```java
Cell cell = sheet.cell(4, 2);
CellValue raw = cell.value();          // Number(1499.0)
String shown = cell.formattedText();   // "$1,499.00" with a currency format
```

`formattedText()` is useful for previews, audit exports, and user-facing error messages. It is a per-cell call, so it is slower than `Range.values()` over a large grid. It can also hide the distinction between text and a formatted number.

| Need | Prefer |
|---|---|
| Database import or validation | `value()` / `values()` |
| Numeric calculation | `CellValue.Number.value()` or `Range.numbers()` |
| User-visible preview | `formattedText()` |
| Formula source | `formula()` / `formulas()` |
| Formula result | `value()` / `values()` |

## How do formulas, blanks, arrays, and errors behave?

A formula cell has two relevant readings:

```java
String formula = sheet.cell(7, 4).formula();   // e.g. "C8*D8", no leading '='
CellValue result = sheet.cell(7, 4).value();   // calculated or cached result
```

`formula()` returns `null` when the cell has no formula. `Range.formulas()` returns a rectangular `String[][]` with `null` entries for ordinary cells.

An Excel error is a value, not an exception. A cell containing `#REF!` or `#DIV/0!` returns `CellValue.Error`; malformed formula text passed to the API is the case that can throw a formula exception.

Treat blanks explicitly. Do not automatically convert `CellValue.Blank` to zero, `false`, or an empty string unless the business rule says those values are equivalent.

Dynamic-array formulas spill their results into worksheet cells. Reading the anchor or a spill cell with `value()` returns the scalar value at that coordinate, not the whole spill as `CellValue.Array`. Use `sheet.range(anchor).spillRange()` when you need the spill extent.

For advanced APIs that explicitly exchange arrays, such as typed user-defined functions, `CellValue.Array` provides `rows()` and `get(row, column)`. Ordinary worksheet reads normally return the scalar value at each cell coordinate.

## How do you map a row to a Java record?

Suppose an orders table has Order ID, Customer, Order Date, and Amount in four consecutive columns. This mapper keeps identifiers as text and reads the date through the Axyra cell API. Source identifiers must already be stored as text: converting a numeric cell to `String` cannot recover leading zeros or digits that Excel has already discarded.

```java
record OrderRow(String orderId, String customer,
                LocalDate orderDate, double amount) {}

static OrderRow mapOrder(Sheet sheet, int row, int firstColumn,
                         CellValue[] values) {
    if (values.length < 4) {
        throw new IllegalArgumentException("Row " + (row + 1) + " has too few columns");
    }

    String orderId = requiredText(values[0], "Order ID");
    String customer = requiredText(values[1], "Customer");

    if (!(values[2] instanceof CellValue.Number)) {
        throw new IllegalArgumentException("Order Date must be an Excel date");
    }
    LocalDate orderDate = sheet.cell(row, firstColumn + 2).dateValue();
    double amount = requiredNumber(values[3], "Amount");

    return new OrderRow(orderId, customer, orderDate, amount);
}
```

Here `row` is the absolute zero-based worksheet row, while `values` is one row returned by `Range.values()`. Pass `used.firstColumn()` as `firstColumn`; otherwise a table that begins after column A would read the date from the wrong cell. Spreadsheet indices are zero-based, while row numbers shown in Excel are one-based.

{: .notice--warning}
**Do not turn identifiers into doubles.** Excel numbers retain about 15 significant digits. Account numbers, tracking codes, and IDs with leading zeros should be `CellValue.Text` and Java `String` values.

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| A date appears as `50000.0` | Dates are stored as numbers | Use `dateValue()` or `dateTimeValue()` for a known date column |
| An ID loses leading zeros | It was treated as a number | Require `CellValue.Text` and map it to `String` |
| A 16-digit identifier changes | It passed through `double` | Keep it as text from Excel through the database |
| Currency has no symbol | Raw value was read | Use `formattedText()` only when display text is required |
| Empty cells become zero | Blank was coerced | Handle `CellValue.Blank` as its own case |
| The import stops on `#DIV/0!` | Error cells were not handled | Detect `CellValue.Error` and report `display()` |
| Formula text starts with an unexpected format | A leading `=` was assumed | Axyra formula strings omit the leading `=` |
| Bulk values are mapped to the wrong Excel cells | The used range did not begin at A1 | Add `firstRow()` and `firstColumn()` offsets |

## FAQ

### Why use Axyra to read Excel cell values in Java?

Axyra combines bulk range reads with a typed value model. A Java application can import large mixed ranges efficiently while preserving numbers, text IDs, booleans, blanks, formula results, and errors. Separate date, formatting, and formula APIs prevent display concerns from changing business data.

### How do I read a string from an Excel cell in Java?

Call `cell.value()` and check for `CellValue.Text`. Then use `text.value()`. For a large block, call `range.values()` once and perform the same type check in Java.

### How do I read a number from an Excel cell?

Check for `CellValue.Number` and call `number.value()`. Use `Range.numbers()` for a known numeric matrix; it returns a flat `double[]` and uses `NaN` for nonnumeric cells.

### How do I tell whether a number is a date?

The raw value alone cannot tell you. Use your import schema or mapped column name. For a known date cell, call `dateValue()` or `dateTimeValue()`.

### How do I read exactly what Excel displays?

Call `cell.formattedText()`. It applies the cell's number format, so it may return strings such as `$1,499.00` or `16-Oct-2026`. Use it selectively because it is a per-cell display operation.

### What does `value()` return for a formula cell?

It returns the formula result as a `CellValue`. Call `formula()` to get the formula text. If results from an opened file may be stale, recalculate once before trusting them.

## Next steps

- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range) is the complete value and range reference.
- [How to Read an Excel File in Java]({{ site.axyra_guides }}/read-excel-file-java) covers opening files, walking sheets, and used ranges.
- [How to Read Large Excel Files Efficiently in Java]({{ site.axyra_guides }}/read-large-excel-files-efficiently-java) focuses on bulk access and memory.
- [Recalculate Excel Formulas in Java with Axyra Sheets]({{ site.axyra_guides }}/evaluate-recalculate-excel-formulas-java) explains cached results and calculation modes.
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_site_link }}/java#pricing), and [product details]({{ site.axyra_site_link }}).
