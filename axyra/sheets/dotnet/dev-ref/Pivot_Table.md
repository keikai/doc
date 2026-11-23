---
title: 'Pivot Tables (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Pivot_Table
redirect_from:
  - /axyra/dotnet/dev-ref/Pivot_Table
---

Axyra Sheets does not merely preserve pivot tables through a round trip — it
computes them. The engine holds the pivot cache, applies the field layout,
filters, groupings, and calculated fields, and writes the resulting grid into the
sheet. The pivot types live in the `Axyra.Sheets.Pivots` namespace.

# Creating a pivot table

```csharp
using Axyra.Sheets.Pivots;

PivotTable pivot = sheet.PivotTables.Add("SalesPivot", "K1", "Data!$A$1:$I$200");

PivotTable same = sheet.PivotTables["SalesPivot"];
```

`PivotTables.Add(name, location, source)` takes the output anchor and the
sheet-qualified source range, whose first row holds the field names. It returns a
live `PivotTable` — a view onto the model, so every member reads or writes the
actual pivot table. Look one up later by name, or by position
(`sheet.PivotTables[0]`).

# Fields

```csharp
IReadOnlyList<string> available = pivot.SourceFields;   // what the cache offers

pivot.RowFields.Add("Region");
pivot.RowFields.Add("Product");             // nested, in order added
pivot.ColumnFields.Add("Quarter");
pivot.DataFields.Add("Amount", AggregateFunction.Sum);
pivot.DataFields.Add("Amount", AggregateFunction.Average, "Avg Amount");
pivot.FilterFields.Add("Channel");

int written = pivot.Refresh();
```

**The pivot's cells are written by `Refresh()`.** It recomputes the pivot from
the cache and writes the grid; it returns the number of cells written. Batch your
layout changes and refresh once. Saving and rendering rebuild a pivot you added
or changed through the API, but until then its cells are empty, so call
`Refresh()` before reading them in code. A change to the source cells alone does
not rebuild the pivot, as in Excel: refresh it to see the new values.

`FilterFields` is the report filter (Excel's "page" fields).

Fields are positional. `RowFields.RemoveAt(position)`,
`DataFields.RemoveAt(position)`, and `RowFields.Move(from, to)` work on the
0-based position within that axis, not on the source field name — which matters
when the same source field is used twice, as `Amount` is above.

`AggregateFunction` covers `Sum`, `Count`, `Average`, `Max`, `Min`, `Product`,
`CountNums`, `StdDev`, `StdDevp`, `Var`, and `Varp`.

# Filters

Settings that belong to a source field are on `pivot.Fields[name]`. Four kinds of
filter, matching Excel's own distinctions:

```csharp
// Explicit item selection
pivot.Fields["Region"].VisibleItems = new[] { "APAC", "EMEA" };

// A single item on a report filter
pivot.Fields["Channel"].PageItem = "Online";

// Label filters — on the field's own labels
pivot.Fields["Product"].LabelFilter = new PivotLabelFilter(PivotLabelFilterType.BeginsWith, "Wid");

// Value filters — on an aggregated data field
pivot.Fields["Region"].ValueFilter = new PivotValueFilter(0, PivotValueFilterType.Between, 1000.0, 50000.0);
pivot.Fields["Product"].TopNFilter = new PivotTopNFilter(0, 5);     // top 5 by data field 0
```

The first argument of a value or top-N filter is the 0-based position of the data
field the filter is measured against. Assign `null` to clear any of them, and read
the property to get the current filter (or `null`). Label, value, and top-N
filters apply to a field on the row or column axis.

# Sorting

```csharp
pivot.Fields["Region"].Sort = new PivotFieldSort(Ascending: true);                    // alphabetical
pivot.Fields["Region"].Sort = new PivotFieldSort(Ascending: false, ByDataField: 0);   // by data field 0
pivot.Fields["Region"].Sort = null;                                                   // clear
```

# Grouping

```csharp
pivot.Fields["OrderDate"].GroupByDate(PivotDateGroupBy.Months);
pivot.Fields["OrderDate"].GroupByDate(
        PivotDateGroupBy.Years, PivotDateGroupBy.Quarters, PivotDateGroupBy.Months);

pivot.Fields["Amount"].GroupByNumber(0, 10000, 1000);   // start, end, interval
pivot.Fields["Amount"].Ungroup();
```

Multi-component date grouping keeps the coarser levels as derived fields, which is
how Excel presents a Year → Quarter → Month hierarchy.

# Show values as

Recasting a data field as a percentage, a running total, a rank, or a difference:

```csharp
pivot.DataFields[0].ShowDataAs = new PivotShowDataAs(PivotShowDataAsType.PercentOfTotal);
pivot.DataFields[0].ShowDataAs = new PivotShowDataAs(PivotShowDataAsType.RunningTotal, "Region");
pivot.DataFields[0].ShowDataAs = null;
```

All eleven of Excel's *Show Values As* modes are available. A running total, a
difference, and an index name their base field. The engine computes these itself,
including the multi-level running totals and ranks that depend on the row
hierarchy.

# Calculated fields and items

```csharp
pivot.CalculatedFields.Add("Margin", "=Revenue-Cost");
pivot.DataFields.Add("Margin");
pivot.Fields["Region"].CalculatedItems.Add("Asia Pacific", "=APAC");

foreach (PivotCalculatedField field in pivot.CalculatedFields) { /* field.Name, field.Formula */ }
```

A calculated **field** is a formula over other fields, evaluated per cell, and is
placed in the values area like any other field. A calculated **item** is a formula
over other items within one field.

# Layout and style

```csharp
pivot.Layout = PivotLayout.Tabular;            // Compact, Outline or Tabular
pivot.ShowRowGrandTotals = true;
pivot.ShowColumnGrandTotals = false;
pivot.GrandTotalCaption = "All regions";
pivot.Style = new PivotStyle("PivotStyleMedium9") { ShowRowStripes = true };
```

# Slicers and timelines

Slicers and timelines are workbook-level objects that filter a pivot table:

```csharp
Slicer slicer = wb.Slicers.Add("RegionSlicer", pivot, "Region", "T2:V12");
slicer.SelectedItems = new[] { "APAC", "EMEA" };
slicer.Style = "SlicerStyleLight2";
IReadOnlyList<string> selected = slicer.SelectedItems;

Timeline timeline = wb.Timelines.Add("DateTimeline", pivot, "OrderDate", "T14:AA20");
timeline.Selection = new DateRange(new DateOnly(2026, 1, 1), new DateOnly(2026, 6, 30));
DateRange? period = timeline.Selection;
```

Changing a slicer selection changes the pivot table's filter state; refresh the
pivot to see it in the grid. Assigning a timeline selection refreshes its pivot
at once. A slicer selection of no items (`Array.Empty<string>()`) is Excel's
"Clear Filter"; a timeline selection of `null` removes the period.

# Pivot charts

A chart whose source is a pivot table follows the pivot's filters. Refresh the
pivot first, then add the chart by the pivot's position on the sheet:

```csharp
Chart pivotChart = sheet.Charts.AddPivotChart(0, ChartType.Column, "K30:R45");
```

See [Charts]({{ site.axyra_dotnet_devref }}/Charts).

{: .notice--info}
**Runnable example:** [`DevRef/PivotTableExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/PivotTableExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/pivot-table`.

# Next

- [Content Objects]({{ site.axyra_dotnet_devref }}/Content_Objects)
- [Charts]({{ site.axyra_dotnet_devref }}/Charts)
