---
title: 'Pivot Tables'
permalink: /axyra/dev-ref/Pivot_Table
---

Axyra Sheets does not merely preserve pivot tables through a round trip — it
computes them. The engine holds the pivot cache, applies the field layout,
filters, groupings, and calculated fields, and writes the resulting grid into the
sheet.

# Creating a pivot table

```java
int index = sheet.addPivotTable("SalesPivot", "H1", "Data!A1:E500");

PivotTableView pivot = sheet.pivotTable("SalesPivot");
```

`addPivotTable(name, location, sourceRef)` takes the output anchor and the source
range. `sheet.pivotTable(name)` or `pivotTable(index)` returns a live
`PivotTableView` — a view onto the model, so every call reads or writes the
actual pivot table.

# Fields

```java
pivot.sourceFields();                     // what the cache offers

pivot.addRowField("Region");
pivot.addRowField("Product");             // nested, in order added
pivot.addColumnField("Quarter");
pivot.addDataField("Amount", AggregateFunction.SUM);
pivot.addDataField("Amount", AggregateFunction.AVERAGE, "Avg Amount");
pivot.addFilterField("Channel");
pivot.addPageField("Year");

pivot.refresh();
```

**Nothing appears in the sheet until `refresh()`.** It recomputes the pivot from
the cache and writes the grid; it returns the number of cells written. Batch your
layout changes and refresh once.

Fields are positional. `removeRowField(position)`, `removeDataField(position)`,
and `moveRowField(from, to)` work on the 0-based position within that axis, not
on the source field name — which matters when the same source field is used
twice, as `Amount` is above.

`AggregateFunction` covers `SUM`, `COUNT`, `AVERAGE`, `MAX`, `MIN`, `PRODUCT`,
`COUNT_NUMS`, `STD_DEV`, `STD_DEVP`, `VAR`, and `VARP`.

# Filters

Four kinds, matching Excel's own distinctions:

```java
// Explicit item selection
pivot.setItemFilter("Region", "APAC", "EMEA");

// A single item on a page/report filter
pivot.setPageFilter("Year", "2026");

// Label filters — on the field's own labels
pivot.setLabelFilter("Product", PivotLabelFilterType.BEGINS_WITH, "Wid");

// Value filters — on an aggregated data field
pivot.setValueFilterBetween("Region", 0, 1000.0, 50000.0);
pivot.setTopNFilter("Region", 0, 5, false);      // top 5 by data field 0
```

The `dataField` argument on value and top-N filters is the 0-based position of
the data field the filter is measured against. Each has a matching
`clearLabelFilter` / `clearValueFilter` / `clearTopNFilter` and a getter that
returns the current filter, or `null`.

# Sorting

```java
pivot.sortField("Region", true);                  // alphabetical
pivot.sortFieldByValue("Region", false, 0);       // by data field 0, descending
pivot.clearFieldSort("Region");
```

# Grouping

```java
pivot.groupFieldByDate("OrderDate", PivotDateGroupBy.MONTHS);
pivot.groupFieldByDate("OrderDate",
        PivotDateGroupBy.YEARS, PivotDateGroupBy.QUARTERS, PivotDateGroupBy.MONTHS);

pivot.groupFieldNumeric("Amount", 0, 10000, 1000);   // start, end, interval
pivot.ungroupField("Amount");
```

Multi-component date grouping creates one grouped field per component, which is
how Excel presents a Year → Quarter → Month hierarchy.

# Show values as

Recasting a data field as a percentage, a running total, a rank, or a difference:

```java
pivot.setShowDataAs(0, PivotShowDataAsType.PERCENT_OF_TOTAL);
pivot.setShowDataAs(0, PivotShowDataAsType.RUNNING_TOTAL);
pivot.clearShowDataAs(0);
```

The argument is the data field's position. The engine computes these itself,
including the multi-level running totals and ranks that depend on the row
hierarchy.

# Calculated fields and items

```java
pivot.addCalculatedField("Margin", "Revenue - Cost");
pivot.addCalculatedItem("Region", "Americas", "'North' + 'South'");

pivot.calculatedFields();
pivot.calculatedItems();
```

A calculated **field** is a formula over other fields, evaluated per cell. A
calculated **item** is a formula over other items within one field.

# Layout and style

```java
pivot.setStyle("PivotStyleMedium9");
pivot.setStyle(PivotStyle.of("PivotStyleMedium9").withRowStripes());

PivotLayout layout = ...;   // compact / outline / tabular, subtotals, grand totals
```

# Slicers and timelines

Slicers and timelines are workbook-level objects that filter one or more pivot
tables:

```java
wb.addSlicer("RegionSlicer", "Region", "SalesPivot",
        0, 0, 8, 8, 14);   // sheet, from row/column, to row/column
wb.setSlicerSelection("RegionSlicer", "APAC", "EMEA");
wb.setSlicerStyle("RegionSlicer", "SlicerStyleLight2");
String[] selected = wb.slicerSelection("RegionSlicer");

wb.addTimeline("DateTimeline", "SalesPivot", "OrderDate");
LocalDate[] range = wb.timelineRange("DateTimeline");
```

Changing a slicer selection changes the pivot table's filter state; refresh the
pivot to see it in the grid.

# Pivot charts

A chart whose source is a pivot table follows the pivot's filters. Build the
chart against the pivot's output range and add it as usual — see
[Charts]({{ site.axyra_devref }}/Charts).

# Next

- [Content Objects]({{ site.axyra_devref }}/Content_Objects)
- [Charts]({{ site.axyra_devref }}/Charts)
