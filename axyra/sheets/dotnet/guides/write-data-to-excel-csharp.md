---
title: 'How to Write Data to Excel in C#'
permalink: /axyra/sheets/dotnet/guides/write-data-to-excel-csharp
redirect_from:
  - /axyra/dotnet/guides/write-data-to-excel-csharp
---

Write .NET records into a worksheet with `Sheet.ImportData`, apply number formats,
and save an XLSX file with Axyra Sheets. Text identifiers such as `00042` remain
text; numeric amounts remain numbers and can be used by Excel formulas.

# What you need

Use .NET 8 or later and the `Axyra.Sheets` NuGet package. Configure the evaluation
feed in `nuget.config` as shown in [Installation]({{ site.axyra_dotnet_devref }}/Installation),
then add the package version your application targets:

```sh
dotnet new console -n WriteExcel
cd WriteExcel
dotnet add package Axyra.Sheets --version {{ site.axyra_dotnet_version }}
```

Evaluation requires no key and keeps notice sheets/banners in output. Dispose each
workbook to release native resources. See [Licensing]({{ site.axyra_dotnet_devref }}/License).

# Minimal export

Replace `Program.cs` with this complete program:

```csharp
using Axyra.Sheets;

var sales = new List<Sale>
{
    new("00042", "Laptop", 1250),
    new("00043", "Mouse", 80),
};

using Workbook wb = new Workbook();
Sheet sheet = wb.Sheets.Add("Sales");
sheet.ImportData(0, 0, sales);
wb.Save("sales.xlsx");

public sealed record Sale(string OrderId, string Product, double Amount);
```

Records import their properties in declaration order. Plain classes use property-name
order, so specify `ImportOptions.Columns` when your report schema needs a stable
order. Property names in `Columns` are case-sensitive. A list of primitive strings
is not an object table; use a record or a bulk value block instead.

# A formatted sales report

This complete program sets explicit columns and labels, formats currency, adds a
SUM formula and writes `output/sales.xlsx`:

```csharp
using Axyra.Sheets;
using Axyra.Sheets.Style;

const string output = "output/sales.xlsx";
Directory.CreateDirectory("output");

var sales = new List<Sale>
{
    new("00042", "Laptop", 1250),
    new("00043", "Mouse", 80),
};

using (Workbook wb = new Workbook())
{
    Sheet sheet = wb.Sheets.Add("Sales");
    sheet.ImportData(0, 0, sales, new ImportOptions
    {
        Columns = new[] { nameof(Sale.OrderId), nameof(Sale.Product), nameof(Sale.Amount) },
        ColumnLabels = new[] { "Order ID", "Product", "Amount" },
        HeaderStyle = new CellStyle { Font = new() { Bold = true } },
    });
    sheet[3, 0].Value = "Total";
    sheet[3, 2].Formula = "SUM(C2:C3)";
    sheet["C2:C4"].Style = new CellStyle { NumberFormat = "#,##0.00" };
    for (int c = 0; c < 3; c++)
    {
        sheet.Columns[c].Width = 18;
    }
    wb.Save(output);
}
Console.WriteLine("Saved " + output);

public sealed record Sale(string OrderId, string Product, double Amount);
```

Run `dotnet run`. It prints `Saved output/sales.xlsx`. Reopening the saved file in
the verification program produces:

| Order ID | Product | Amount |
|---|---|---|
| 00042 | Laptop | 1,250.00 |
| 00043 | Mouse | 80.00 |
| Total | | 1,330.00 |

The ID in A2 is text, C4 retains `SUM(C2:C3)`, and the header is bold. These saved
values, formula and formatting are checked by the guide verification harness.
The total row in this two-record fixture is fixed; use the next pattern for
variable-length input.

# Variable-length totals

After importing a `List<Sale> sales` into `sheet`, derive the zero-based total row
from its count. Handle an empty list without constructing a backwards SUM range:

```csharp
int totalRow = sales.Count + 1;
sheet[totalRow, 0].Value = "Total";
if (sales.Count == 0)
{
    sheet[totalRow, 2].Value = 0;
}
else
{
    sheet[totalRow, 2].Formula = $"SUM(C2:C{totalRow})";
}
sheet.GetRange(1, 2, totalRow, 2).Style = new CellStyle { NumberFormat = "#,##0.00" };
```

A formula setter calculates normally in automatic mode. With manual calculation
or stale imported caches, call `wb.Recalculate()` before saving results that must
be current. Saving alone does not recalculate.

# Dates and decimal amounts

`ImportData` converts dates to Excel serial numbers; give their columns a date
format. In a workbook with a `sheet` variable, use:

```csharp
public sealed record DatedSale(string OrderId, DateOnly OrderDate, decimal Amount);

var orders = new List<DatedSale>
{
    new("00042", new DateOnly(2026, 10, 16), 1250.00m),
    new("00043", new DateOnly(2026, 10, 17), 80.00m),
};
sheet.ImportData(0, 0, orders);
sheet.GetRange(1, 1, orders.Count, 1).Style = new CellStyle { NumberFormat = "yyyy-mm-dd" };
sheet.GetRange(1, 2, orders.Count, 2).Style = new CellStyle { NumberFormat = "#,##0.00" };
```

Amounts are stored as spreadsheet numbers; use a number format for their display.
Validate precision requirements when converting application decimal values.

# JSON input

Deserialize JSON to typed records to preserve numbers and dates. This fragment
uses `System.Text.Json`, the `DatedSale` record above and an existing `sheet`:

```csharp
string json = """
    [ { "orderId": "00042", "orderDate": "2026-10-16", "amount": 1250.00 },
      { "orderId": "00043", "orderDate": "2026-10-17", "amount": 80.00 } ]
    """;
List<DatedSale> fromJson = JsonSerializer.Deserialize<List<DatedSale>>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
sheet.ImportData(0, 0, fromJson);
```

Untyped `Dictionary<string, object?>` deserialization produces `JsonElement` values.
Convert those to ordinary CLR strings, numbers, booleans and nulls before import,
or use typed records as above; otherwise numeric JSON values can arrive as text.

# Database input

Given an open ADO.NET `connection`, an existing `sheet`, the `Sale` record above
and a `CancellationToken cancellationToken`, read a small result set into records:

```csharp
await using DbCommand command = connection.CreateCommand();
command.CommandText = "SELECT order_id, product, amount FROM sales ORDER BY order_id";
await using DbDataReader reader = await command.ExecuteReaderAsync(cancellationToken);

var sales = new List<Sale>();
while (await reader.ReadAsync(cancellationToken))
{
    sales.Add(new Sale(reader.GetString(0), reader.GetString(1), reader.GetDouble(2)));
}
sheet.ImportData(0, 0, sales);
```

Add `using System.Data.Common;` for these ADO.NET types. The verification harness
executes this against an in-memory SQLite database and checks the saved field types
and values. For very large results, materializing all rows as a list can consume
substantial memory; use a forward-only export when calculation/rendering is unnecessary.

# Large forward-only exports

With `using Axyra.Sheets.IO;`, an application-provided
`IAsyncEnumerable<Sale> ReadSalesAsync(CancellationToken)` and a cancellation token,
write rows as they arrive:

```csharp
using (var writer = new StreamWorkbook("large-export.xlsx"))
{
    int bold = writer.AddStyle(StreamStyle.Default with { Bold = true });
    int money = writer.AddStyle(new StreamStyle { NumberFormat = "#,##0.00" });

    writer.StartSheet("Sales");
    writer.StartRow(0).AddText("Order ID", bold).AddText("Product", bold).AddText("Amount", bold).Commit();

    int row = 1;
    await foreach (Sale sale in ReadSalesAsync(cancellationToken))
    {
        writer.StartRow(row++).AddText(sale.OrderId).AddText(sale.Product).AddNumber(sale.Amount, money).Commit();
    }
}   // Dispose finishes the file
```

Commit rows in increasing index order. The writer cannot edit existing workbooks,
calculate formulas or render PDF. Dates require a registered date style. The guide
harness exercises this path with 25,000 rows and reopens the output to check the
text ID, numeric amount and format. See [Streaming]({{ site.axyra_dotnet_devref }}/Streaming).

# Verify your export

Reopen by sheet name, because evaluation output adds a notice sheet before your
business sheets. Check types as well as displayed text: `00042` must remain text,
amounts must remain numbers, and calculated totals should retain their formulas.
Value writes preserve existing formatting; assigning a new `CellStyle` replaces
that cell's style, so use record `with` updates when changing only one attribute.

[Complete runnable example]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/Guides/WriteDataToExcelExample.cs).
From the examples repository's `dotnet/` directory run:

```sh
dotnet run --project src/Axyra.Sheets.Examples -- guides/write-data-to-excel
```

# Next

- [Read Excel in C#]({{ site.axyra_dotnet_guides }}/read-excel-file-csharp)
- [Export formats]({{ site.axyra_dotnet_guides }}/export-excel-files-csharp)
- [Cells and ranges]({{ site.axyra_dotnet_devref }}/Cell_and_Range)
- [Styles]({{ site.axyra_dotnet_devref }}/Styles)
