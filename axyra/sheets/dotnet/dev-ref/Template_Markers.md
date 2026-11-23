---
title: 'Template Markers (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Template_Markers
redirect_from:
  - /axyra/dotnet/dev-ref/Template_Markers
---

`TemplateMarkers.Process` fills a sheet in place from .NET objects or a dictionary.
Open a fresh template for each report. A marker-only cell keeps a numeric value;
mixed text such as `Amount: ${amount}` becomes text.

```csharp
using Axyra.Sheets;
using Axyra.Sheets.Template;

using Workbook wb = new();
Sheet sheet = wb.Sheets.Add("Report");
sheet["A1:B3"].SetValues(new object?[,]
{
    { "Region", "Amount" },
    { "${lines.region}", "${lines.amount}" },
    { "Total", "${lines.amount:sum}" },
});
var data = new Dictionary<string, object?>
{
    ["lines"] = new List<object>
    {
        new { Region = "North", Amount = 12.5 },
        new { Region = "South", Amount = 7.5 },
    },
};
TemplateMarkers.Process(sheet, data);
wb.Save("report.xlsx");
```

A list marker repeats its template row. In this package, supply a `List<T>` (an
`IList` that is not an array): arrays are treated as unknown scalar values and
render blank. Lowercase marker paths can resolve PascalCase .NET properties.

Aggregate suffixes include `sum`, `avg`, `count`, `min` and `max`. Use an aggregate
marker for totals: a formula such as `SUM(B2:B2)` below a repeated block is not
widened automatically. Formulas inside a repeated row shift relative references;
absolute references stay fixed.

Unknown markers render blank. Empty lists blank their marker cells without
inserting rows. Output rows take template-row formatting; dates need a suitable
number format in that template. Group/subtotal marker workflows can copy subtotal
styles onto later detail rows in this build; check all data-row styles.

Validate zero, one and multiple records, reopen the saved result and check types,
expanded formulas and totals. Runnable counterpart: `dev-ref/template-markers`.
