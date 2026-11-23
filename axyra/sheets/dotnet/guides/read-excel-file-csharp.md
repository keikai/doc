---
title: 'How to Read an Excel File in C# (XLSX Example)'
excerpt: 'Read Excel rows in C# and .NET, preserve text IDs, and handle numbers and formulas. Includes a complete console program and an upload example for ASP.NET Core.'
code_link_style: text
permalink: /axyra/sheets/dotnet/guides/read-excel-file-csharp
redirect_from:
  - /axyra/dotnet/guides/read-excel-file-csharp
keyword: 'read Excel file in C#'
sidebar:
  nav: "axyra-dotnet-guides"
---

Read an Excel worksheet and print its rows with a few C# API calls. This Axyra Sheets example keeps order ID `00042` as text and reads the formula total as a number. The same workbook API can then [update an amount and save the file](#update).

**Quick excerpt:** this uses `Text()` from [the complete program](#complete-example) below. Copy that program to run the example.

```csharp
using Workbook wb = Workbook.Open("input/sales.xlsx");
Sheet sheet = wb.Sheets["Sales"];
CellValue[,] rows = sheet["A1:C4"].GetValues();
for (int r = 0; r < rows.GetLength(0); r++)
{
    Console.WriteLine($"{Text(rows[r, 0]),-10}{Text(rows[r, 1]),-10}{Text(rows[r, 2])}");
}
```

The complete program below supplies the `using` directives and the `Text()` helper. It prints the sample workbook's business region, including its header and total:

```text
Order ID  Product   Amount
00042     Laptop    1250
00043     Mouse     80
Total               1330
```

The sample's range is `A1:C4`; see [unknown row counts](#adapt) for other layouts.

## Run the complete example
{: #setup}

Use .NET 8 or later; Microsoft Excel is not required. Create a console project and add the package from the Axyra evaluation feed (register the feed `{{ site.axyra_dotnet_feed_url }}` in a `nuget.config` first, as shown in [How to Create an Excel File in C#]({{ site.axyra_dotnet }}/guides/create-excel-file-csharp#what-you-need)):

```shell
dotnet new console -n ReadExcelFile
cd ReadExcelFile
dotnet add package Axyra.Sheets --prerelease
```

Replace `Program.cs` with [the complete program](#complete-example), put the workbook at `input/sales.xlsx`, and run `dotnet run`. Evaluation needs no key and adds notices; production use requires a commercial license. [Licensing details]({{ site.axyra_dotnet_devref }}/License).

<details markdown="1">
<summary>No sample workbook at hand? Create input/sales.xlsx with C#</summary>

This program writes a workbook with the same layout as the sample: text order IDs, numeric amounts formatted `#,##0.00`, and a `SUM` total in `C4`. Run it once in a separate console project (or temporarily as your `Program.cs`).

```csharp
using Axyra.Sheets;
using Axyra.Sheets.Style;

Directory.CreateDirectory("input");
using Workbook wb = new Workbook();
Sheet sales = wb.Sheets.Add("Sales");
sales["A1:C3"].SetValues(new object?[,]
{
    { "Order ID", "Product", "Amount" },
    { "00042",    "Laptop",  1250 },
    { "00043",    "Mouse",     80 },
});
sales[3, 0].Value = "Total";
sales[3, 2].Formula = "SUM(C2:C3)";
sales["C2:C4"].Style = new CellStyle { NumberFormat = "#,##0.00" };
wb.Save("input/sales.xlsx");
```

A string written through `SetValues` stays text, so `00042` keeps its leading zeros.

</details>

### Complete C# program
{: #complete-example}

<details markdown="1">
<summary>Expand the complete Program.cs and copy code</summary>

{% capture complete_csharp %}using System.Globalization;
using Axyra.Sheets;

string input = args.Length == 0 ? "input/sales.xlsx" : args[0];

using Workbook wb = Workbook.Open(input);
Sheet sheet = wb.Sheets["Sales"];
CellValue[,] rows = sheet["A1:C4"].GetValues();
for (int r = 0; r < rows.GetLength(0); r++)
{
    Console.WriteLine($"{Text(rows[r, 0]),-10}{Text(rows[r, 1]),-10}{Text(rows[r, 2])}");
}

static string Text(CellValue value) => value switch
{
    CellValue.Text t => t.Value,
    CellValue.Number n => n.Value.ToString(CultureInfo.InvariantCulture),
    CellValue.Bool b => b.Value ? "TRUE" : "FALSE",
    CellValue.Error e => e.Display,
    CellValue.Array => "[array]",
    _ => "",                                  // CellValue.Blank
};{% endcapture %}
{% include copy_code.html code=complete_csharp language="csharp" event="copy_read_excel_example_csharp" %}

To use another workbook with the same layout, pass its path: `dotnet run -- /path/to/file.xlsx`. For a different layout, change the `"Sales"` sheet name and the range too.

</details>

The .NET examples project has a related runnable program that walks every worksheet's used range: `src/Axyra.Sheets.Examples/Guides/ReadExcelFileExample.cs`, run with `dotnet run --project src/Axyra.Sheets.Examples -- guides/read-excel-file`.

## Common reading scenarios
{: #adapt}

**Unknown row count or empty worksheet.** Inside the open workbook, use:

```csharp
CellRange? used = sheet.UsedRange;
if (used != null)
{
    CellValue[,] values = used.GetValues();
    // Validate headers, identify business rows, then process them.
}
```

A used range may include totals, formatting, or notes, and in an evaluation build a notice row that is appended below each sheet's data when the file is saved. It is not automatically a list of valid records; identify the end of the table explicitly, for example by a `Total` footer.

**Dates, display text, and formulas.** Use the value your application needs:

| Need | API |
| --- | --- |
| Raw text, numbers, blanks, and error values | `range.GetValues()` |
| Displayed currency or number text | `cell.FormattedText` |
| An Excel date converted to `DateOnly` / `DateTime` | `cell.DateValue` / `cell.DateTimeValue` |
| A typed scalar, throwing if it does not convert | `cell.GetValue<double>()`, `cell.GetValue<string>()` |
| Formula expressions | `range.GetFormulas()` |

Dates are stored as serial numbers. Formula results come from the file's saved results until something they depend on changes; call `wb.Recalculate()` before reading when those saved results may be stale (for example, a file written by a program that does not calculate). A `CellValue.Error` should be reported or rejected according to your import rules, rather than silently converted to zero.

**Uploaded file or a larger workbook.** Use `Workbook.Open(stream, WorkbookFormat.Xlsx)` for a `Stream` or `Workbook.Open(bytes, WorkbookFormat.Xlsx)` for a `byte[]`, inside a `using`. Without a file name there is no extension, so the format is passed explicitly. In ASP.NET Core, `OpenAsync` keeps the request thread free while the engine parses the upload:

```csharp
app.MapPost("/orders/import", async (IFormFile file, CancellationToken ct) =>
{
    await using Stream upload = file.OpenReadStream();
    using Workbook wb = await Workbook.OpenAsync(upload, WorkbookFormat.Xlsx, cancellationToken: ct);
    CellRange? used = wb.Sheets["Sales"].UsedRange;
    return Results.Ok(new { rows = used?.RowCount ?? 0 });
}).DisableAntiforgery();
```

`Open(Stream, …)` reads the whole stream into memory first and does not close it. For bounded processing of big files, follow [the large Excel reading guide]({{ site.axyra_dotnet }}/guides/read-large-excel-files-efficiently-csharp).

## Continue: update and save
{: #update}

Suppose the first order amount changes from `1250` to `1500`. The workbook already contains `SUM(C2:C3)`, so the same API can return a corrected report:

```csharp
using Workbook wb = Workbook.Open("input/sales.xlsx");
Sheet sales = wb.Sheets["Sales"];
sales[1, 2].Value = 1500;
Console.WriteLine(sales[3, 2].FormattedText); // 1,580.00
wb.Save("sales-updated.xlsx");
```

No `Recalculate()` call is needed here: calculation is automatic, so writing `C2` updates the `SUM` that depends on it, and the save writes the new total of `1580`. [See the paired guide to writing C# data to Excel]({{ site.axyra_dotnet }}/guides/write-data-to-excel-csharp).

## Troubleshooting and FAQ

**Why did `00042` lose its zeros?** The source cell must contain text. Reading a numeric cell cannot recover leading zeros that were never stored as text; use `cell.FormattedText` when you need a numeric cell's displayed representation.

**Why does `wb.Sheets[0]` return the wrong sheet?** A file saved by an evaluation build starts with an extra **Axyra Evaluation Copy** sheet. Look sheets up by name, as the examples do, or use `wb.Sheets.TryGet("Sales", out Sheet? sheet)` to test without throwing.

**Why do I get `ObjectDisposedException` after the method returns?** `Sheet`, `CellRange` and `Cell` belong to their open workbook. Return extracted .NET values (records, lists) and dispose the workbook after extraction.

**Need to import business records?** Validate required headers and values before persistence. Continue with [reading typed cell values]({{ site.axyra_dotnet }}/guides/read-excel-cell-values-csharp) or the [cell and range reference]({{ site.axyra_dotnet_devref }}/Cell_and_Range).

## Explore more with Axyra

Continue with a related workflow:

- **[Read Excel cell values into typed fields]({{ site.axyra_dotnet }}/guides/read-excel-cell-values-csharp)** — map text, numbers, dates, blanks, and errors to a C# record.
- **[Modify and save Excel](#update)** — change an amount and verify the saved formula total.

Try the live demos:

- **[Financial data cleansing]({{ site.axyra_site_link }}/demo/demo.zul?id=financialDataCleansing)** — explore a validation and cleansing workflow.
- **[Formulas and recalculation]({{ site.axyra_site_link }}/demo/demo.zul?id=engineFormulas)** — explore calculated workbook results.

[Explore Axyra demos]({{ site.axyra_site_link }}/demo/){: .btn .btn--success }
