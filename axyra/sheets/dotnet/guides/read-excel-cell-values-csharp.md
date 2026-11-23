---
title: 'Read Excel Cell Values in C# with Axyra Sheets'
excerpt: 'Read Excel cell values in C# and .NET with Axyra Sheets while preserving text, numbers, dates, booleans, blanks, formulas, errors, and display formats.'
permalink: /axyra/sheets/dotnet/guides/read-excel-cell-values-csharp
redirect_from:
  - /axyra/dotnet/guides/read-excel-cell-values-csharp
keyword: 'read Excel cell values in C#'
sidebar:
  nav: "axyra-dotnet-guides"
---

# Read Excel Cell Values in C# with Axyra Sheets

When importing orders from Excel, a .NET application may need to read an order ID as text, an order date as `DateOnly`, and an amount as a number. The displayed cell text does not always match the underlying value: a date is stored as a numeric serial, while an identifier may contain leading zeros that must be preserved.

This guide shows how to read Excel cell values in C# with Axyra Sheets and map them to application fields. It covers text, numbers, dates, blanks, errors, and formula results, and explains when to use raw values or formatted display text.

## TL;DR

- Axyra's `CellValue` is a closed hierarchy of six variants: `Number`, `Text`, `Bool`, `Error`, `Blank`, and `Array`. Pattern matching over it is the natural way to read a cell.
- Read a mixed block with one `CellRange.GetValues()` call, then validate each typed value in C#.
- Convert known date columns with `DateValue` or `DateTimeValue`; Axyra accounts for the workbook's 1900 or 1904 date system.
- Choose the right representation: `Value` / `GetValues()` for raw or calculated values, `FormattedText` for displayed text, and `Formula` / `GetFormulas()` for formula source.
- Treat Excel errors as data that can be collected and reported instead of terminating the entire import.
- Keep identifiers as text. Converting a long account number to `double` can lose digits.

## Table of contents

- [How does Axyra preserve Excel cell types?](#how-does-axyra-preserve-excel-cell-types)
- [How do you read a block of mixed values?](#how-do-you-read-a-block-of-mixed-values)
- [How do you convert CellValue safely?](#how-do-you-convert-cellvalue-safely)
- [How do you read Excel dates and times?](#how-do-you-read-excel-dates-and-times)
- [What is the difference between raw and formatted text?](#what-is-the-difference-between-raw-and-formatted-text)
- [How do formulas, blanks, arrays, and errors behave?](#how-do-formulas-blanks-arrays-and-errors-behave)
- [How do you map a row to a C# record?](#how-do-you-map-a-row-to-a-c-record)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## How does Axyra preserve Excel cell types?

Axyra returns a `CellValue` instead of guessing a .NET type or coercing every value to text. Imports can therefore validate each cell explicitly and report a precise error without discarding its original meaning. A value is exactly one of these six variants:

| Variant | Meaning | Read with |
|---|---|---|
| `CellValue.Text` | Text, including IDs with leading zeros | `Value` (`string`) |
| `CellValue.Number` | Any numeric value, including date serials | `Value` (`double`) |
| `CellValue.Bool` | `TRUE` or `FALSE` | `Value` (`bool`) |
| `CellValue.Blank` | No value | no accessor needed |
| `CellValue.Error` | An Excel error such as `#DIV/0!` | `Display` or `Code` (a `CellError`) |
| `CellValue.Array` | An explicit array value used by array-aware APIs | `RowCount`, `ColumnCount`, the `[row, column]` indexer, or `Values` |

The type describes the stored or calculated value, not its visual style. A currency cell and a percentage cell can both be `CellValue.Number`; their number formats differ. Because the variants are records, they also print readably while debugging: `Number { Value = 1250 }`.

## How do you read a block of mixed values?

Open the workbook and select the worksheet by name, then read a rectangular range with `GetValues()`. This example prints the values from an `Orders` worksheet; `ToDebugText` is defined in the next section.

```csharp
using Axyra.Sheets;

using Workbook wb = Workbook.Open("orders.xlsx");
Sheet sheet = wb.Sheets["Orders"];
CellRange? used = sheet.UsedRange;
if (used != null)
{
    CellValue[,] values = used.GetValues();
    for (int r = 0; r < values.GetLength(0); r++)
    {
        for (int c = 0; c < values.GetLength(1); c++)
        {
            Console.WriteLine(ToDebugText(values[r, c]));
        }
    }
}
```

The returned array is indexed `[row, column]`. `values[0, 0]` corresponds to the top-left cell of the range, not necessarily A1. Use `used.FirstRow` and `used.FirstColumn` if an error report needs the original worksheet coordinates.

## How do you convert CellValue safely?

Handle every variant deliberately. A `switch` expression keeps the code straightforward and makes a forgotten case obvious:

```csharp
static string ToDebugText(CellValue value) => value switch
{
    CellValue.Text text => text.Value,
    CellValue.Number number => number.Value.ToString(CultureInfo.InvariantCulture),
    CellValue.Bool flag => flag.Value ? "TRUE" : "FALSE",
    CellValue.Error error => error.Display,
    CellValue.Array array => $"[array {array.RowCount}x{array.ColumnCount}]",
    _ => "",                          // CellValue.Blank
};
```

The helper above is for inspecting values during development. For application fields, use typed conversion helpers such as the following and report values that do not match the expected column type.

```csharp
static string RequiredText(CellValue value, string column) =>
    value is CellValue.Text text && !string.IsNullOrWhiteSpace(text.Value)
        ? text.Value
        : throw new FormatException($"{column} must contain text");

static double RequiredNumber(CellValue value, string column) =>
    value is CellValue.Number number
        ? number.Value
        : throw new FormatException($"{column} must contain a number");
```

Avoid silent coercion unless the import specification allows it. A text value of `"12"` may be a data error, not permission to parse it as a number.

For a single cell, `cell.GetValue<T>()` and `cell.TryGetValue(out T value)` do the same checks for you. `GetValue<double>()` throws `InvalidCastException`, naming the cell, when the cell does not hold a number; `TryGetValue` returns `false` instead:

```csharp
if (sheet[1, 3].TryGetValue(out double amount))
{
    Console.WriteLine(amount);
}
string orderId = sheet[1, 0].GetValue<string>();   // text only; a number throws
```

## How do you read Excel dates and times?

Excel does not store a separate date type. It stores a number and applies a date number format. That means `Value` returns `CellValue.Number` for both `45123` and a cell displayed as `2023-07-16`.

When the schema says a cell is a date, convert through `Cell`:

```csharp
DateOnly? orderDate = sheet[row, orderDateColumn].DateValue;
DateTime? createdAt = sheet[row, createdAtColumn].DateTimeValue;
```

These properties account for the workbook's 1900 or 1904 date system and return `null` for a blank cell. Do not hard-code an epoch, call `DateTime.FromOADate` yourself, or infer a date merely because the number format happens to contain `d`, `m`, or `y`.

{: .notice--info}
**Let the column contract decide.** One numeric serial could mean a date in `Order Date` and an ordinary quantity in `Units`. Header mapping or an import schema is more reliable than guessing from the value.

For a large mixed import, bulk-read the row values, validate that the date position contains a `CellValue.Number`, and read `DateValue` only for that cell. This preserves bulk performance for the rest of the row.

## What is the difference between raw and formatted text?

Use raw values for calculations and imports. Use formatted text when the exact displayed string is the requirement.

```csharp
Cell cell = sheet[4, 3];
CellValue raw = cell.Value;           // Number { Value = 1499 }
string shown = cell.FormattedText;    // "$1,499.00" with a currency format
```

`FormattedText` is useful for previews, audit exports, and user-facing error messages. It is a per-cell call, so it is slower than `CellRange.GetValues()` over a large grid. It can also hide the distinction between text and a formatted number.

| Need | Prefer |
|---|---|
| Database import or validation | `Value` / `GetValues()` |
| Numeric calculation | `CellValue.Number.Value` or `CellRange.GetNumbers()` |
| User-visible preview | `FormattedText` |
| Formula source | `Formula` / `GetFormulas()` |
| Formula result | `Value` / `GetValues()` |

## How do formulas, blanks, arrays, and errors behave?

A formula cell has two relevant readings:

```csharp
string? formula = sheet[7, 4].Formula;   // e.g. "C8*D8", no leading '='
CellValue result = sheet[7, 4].Value;    // calculated or cached result
```

`Formula` is `null` when the cell has no formula. `CellRange.GetFormulas()` returns a rectangular `string?[,]` with `null` entries for ordinary cells.

An Excel error is a value, not an exception. A cell containing `#REF!` or `#DIV/0!` returns `CellValue.Error`; its `Code` is a `CellError` such as `CellError.DivisionByZero`. Malformed formula text passed to the API is the case that throws, as an `AxyraFormulaException`.

Treat blanks explicitly. Do not automatically convert `CellValue.Blank` to zero, `false`, or an empty string unless the business rule says those values are equivalent. `GetValue<double?>()` and `GetValue<string>()` read a blank cell as `null`, which keeps "no value" distinct from `0` and `""`.

Dynamic-array formulas spill their results into worksheet cells. Reading the anchor or a spill cell with `Value` returns the scalar value at that coordinate, not the whole spill as `CellValue.Array`. Use `sheet[anchor].SpillRange()` when you need the spill extent.

For advanced APIs that explicitly exchange arrays, such as user-defined functions registered with `wb.Functions.Register`, `CellValue.Array` provides `RowCount`, `ColumnCount` and the `[row, column]` indexer. Ordinary worksheet reads return the scalar value at each cell coordinate.

## How do you map a row to a C# record?

Suppose an orders table has Order ID, Customer, Order Date, and Amount in four consecutive columns. This mapper keeps identifiers as text and reads the date through the Axyra cell API. Source identifiers must already be stored as text: converting a numeric cell to `string` cannot recover leading zeros or digits that Excel has already discarded.

```csharp
public sealed record OrderRow(string OrderId, string Customer, DateOnly OrderDate, double Amount);

static OrderRow MapOrder(Sheet sheet, CellRange block, CellValue[,] values, int r)
{
    if (values.GetLength(1) < 4)
    {
        throw new FormatException($"Row {block.FirstRow + r + 1} has too few columns");
    }

    string orderId = RequiredText(values[r, 0], "Order ID");
    string customer = RequiredText(values[r, 1], "Customer");

    if (values[r, 2] is not CellValue.Number)
    {
        throw new FormatException("Order Date must be an Excel date");
    }
    DateOnly orderDate = sheet[block.FirstRow + r, block.FirstColumn + 2].DateValue!.Value;
    double amount = RequiredNumber(values[r, 3], "Amount");

    return new OrderRow(orderId, customer, orderDate, amount);
}
```

Here `values` is the block returned by `block.GetValues()` and `r` is a row inside it, so the absolute zero-based worksheet row is `block.FirstRow + r`. Adding `block.FirstColumn` matters: without it, a table that begins after column A would read the date from the wrong cell. Spreadsheet indices are zero-based, while row numbers shown in Excel are one-based.

Call it once per data row, skipping the header:

```csharp
CellRange block = sheet.UsedRange!;
CellValue[,] values = block.GetValues();
var orders = new List<OrderRow>();
for (int r = 1; r < values.GetLength(0); r++)
{
    orders.Add(MapOrder(sheet, block, values, r));
}
```

A file saved by an evaluation build carries a notice row below the table, which this loop would reject with a `FormatException` ("Customer must contain text"). Real imports should define where the table ends, for example at the first blank Order ID, rather than trusting the used range.

{: .notice--warning}
**Do not turn identifiers into doubles.** Excel numbers retain about 15 significant digits. Account numbers, tracking codes, and IDs with leading zeros should be `CellValue.Text` and C# `string` values. Use `decimal` for money in your own model, converting from the cell's `double` with your rounding rules.

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| A date appears as `50000` | Dates are stored as numbers | Use `DateValue` or `DateTimeValue` for a known date column |
| An ID loses leading zeros | It was treated as a number | Require `CellValue.Text` and map it to `string` |
| A 16-digit identifier changes | It passed through `double` | Keep it as text from Excel through the database |
| Currency has no symbol | Raw value was read | Use `FormattedText` only when display text is required |
| Empty cells become zero | Blank was coerced | Handle `CellValue.Blank` as its own case |
| The import stops on `#DIV/0!` | Error cells were not handled | Detect `CellValue.Error` and report `Display` |
| `InvalidCastException` from `GetValue<T>()` | The cell holds another type | Use `TryGetValue` or pattern-match on `CellValue` |
| Formula text starts with an unexpected format | A leading `=` was assumed | Axyra formula strings omit the leading `=` |
| Bulk values are mapped to the wrong Excel cells | The used range did not begin at A1 | Add `FirstRow` and `FirstColumn` offsets |

## FAQ

### Why use Axyra to read Excel cell values in C#?

Axyra combines bulk range reads with a typed value model. A .NET application can import large mixed ranges efficiently while preserving numbers, text IDs, booleans, blanks, formula results, and errors. Separate date, formatting, and formula APIs prevent display concerns from changing business data.

### How do I read a string from an Excel cell in C#?

Check `cell.Value is CellValue.Text text` and use `text.Value`, or call `cell.GetValue<string>()`, which throws for a cell that is not text. For a large block, call `range.GetValues()` once and perform the same type check in C#.

### How do I read a number from an Excel cell?

Match `CellValue.Number` and use its `Value`, or call `cell.GetValue<double>()` / `cell.TryGetValue(out double d)`. Use `CellRange.GetNumbers()` for a known numeric matrix; it returns a `double[,]` and uses `double.NaN` for nonnumeric cells.

### How do I tell whether a number is a date?

The raw value alone cannot tell you. Use your import schema or mapped column name. For a known date cell, read `DateValue` or `DateTimeValue`.

### How do I read exactly what Excel displays?

Read `cell.FormattedText`. It applies the cell's number format, so it may return strings such as `$1,499.00` or `16-Oct-2026`. Use it selectively because it is a per-cell display operation.

### What does `Value` return for a formula cell?

It returns the formula result as a `CellValue`. Read `Formula` to get the formula text. If results from an opened file may be stale, recalculate once before trusting them.

## Next steps

- [Cells and Ranges]({{ site.axyra_dotnet_devref }}/Cell_and_Range) is the complete value and range reference.
- [How to Read an Excel File in C#]({{ site.axyra_dotnet }}/guides/read-excel-file-csharp) covers opening files, uploads, and used ranges.
- [How to Read Large Excel Files Efficiently in C#]({{ site.axyra_dotnet }}/guides/read-large-excel-files-efficiently-csharp) focuses on bulk access and memory.
- [Recalculate Excel Formulas in C# with Axyra Sheets]({{ site.axyra_dotnet }}/guides/evaluate-recalculate-excel-formulas-csharp) explains cached results and calculation modes.
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_sheets }}/contact-sales), and [product details]({{ site.axyra_site_link }}).
