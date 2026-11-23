---
title: 'Charts (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Charts
redirect_from:
  - /axyra/dotnet/dev-ref/Charts
---

Charts are live objects: you add one to a sheet's `Charts` collection, anchored to
a cell region, and set the rest as properties — or give it a chart sheet of its
own. They round-trip through the file formats and are drawn by the [rendering
pipeline]({{ site.axyra_dotnet_devref }}/Rendering) for PDF and image output. The
chart types live in the `Axyra.Sheets.Charts` namespace.

# Building a chart

```csharp
using Axyra.Sheets.Charts;

Chart chart = sheet.Charts.Add(ChartType.Column, "F2:M17");   // covers F2 through M17
chart.Title = "Revenue by Region";
chart.Series.Add("Q1", "Sheet1!$B$2:$B$8", "Sheet1!$A$2:$A$8");
chart.Series.Add("Q2", "Sheet1!$C$2:$C$8", "Sheet1!$A$2:$A$8");
chart.Legend.Position = LegendPosition.Bottom;
chart.ShowDataLabels = true;
```

Every assignment changes the chart at once, as in Excel's object model, and
reading a property returns the chart's current state. `Charts.Add` returns the
new chart; it is also `sheet.Charts[i]`, by its position on the sheet.

`ShowDataLabels = true` is saved with the chart and drawn in rendered output; for
per-series label settings, assign a `DataLabels` record to a series (see
[below](#data-labels-error-bars-and-trendlines)).

Series references are ordinary A1 strings and should be **absolute and
sheet-qualified** — a chart is not anchored to the cell its references are
relative to, so a relative reference has no useful base. A series name is
literal text or a cell reference such as `Sheet1!$B$1`. When the workbook is
saved, each series' current values are cached in the chart, so the chart shows
its data in Excel and in other viewers without a recalculation first.

# Chart types

`ChartType` lists twenty types:

| | | | |
|---|---|---|---|
| `Column` | `Bar` | `Line` | `Pie` |
| `Area` | `Scatter` | `Doughnut` | `Radar` |
| `Bubble` | `Combo` | `Surface` | `Stock` |
| `Waterfall` | `Histogram` | `Funnel` | `Treemap` |
| `Sunburst` | `BoxWhisker` | `Pareto` | `Map` |

The first twelve are the classic Excel types; the rest are the modern ones
introduced in Excel 2016 and later. All are read and written. Map charts are
preserved but currently render as a placeholder frame; the other listed types
have dedicated renderers. `chart.Type` can be changed later.

In a `Combo` chart each series picks its own plot type, and may use a secondary
value axis:

```csharp
Chart combo = sheet.Charts.Add(ChartType.Combo, "F20:M35");
combo.Series.Add("Revenue", "Sheet1!$B$2:$B$8", "Sheet1!$A$2:$A$8");        // a column series
combo.Series.Add("Margin", "Sheet1!$C$2:$C$8", "Sheet1!$A$2:$A$8",
        chartType: ChartType.Line, onSecondaryAxis: true);
```

# Common options

```csharp
Chart trend = sheet.Charts.Add(ChartType.Line, "O2:V17");
trend.TitleFormula = "Sheet1!$A$1";       // title from a cell instead of a literal
trend.AutoTitle = false;
trend.Legend.Position = LegendPosition.Right;
trend.Legend.Visible = true;
trend.CategoryAxis.Visible = true;
trend.ValueAxis.Visible = true;
trend.ValueAxis.Title = "Units";
trend.ValueAxis.Minimum = 0;              // null scales automatically
trend.Style = 12;                         // Excel style number (metadata; see below)
trend.Is3D = false;
trend.ChartArea.FillColor = Color.Parse("#FFFFFF");
trend.ChartArea.BorderColor = Color.Parse("#CCCCCC");
```

`Style` writes Excel's built-in style number (`<c:style val>`) and nothing else.
Excel expands that number from its own gallery when it opens the file; Axyra
Sheets does not, so it renders the chart with whatever explicit formatting you
gave it. Treat the style number as metadata you round-trip — to change how the
chart looks in PDF or PNG output, set the formatting explicitly.

## Type-specific options

```csharp
Chart stacked = sheet.Charts.Add(ChartType.Column, "A20:E35");
stacked.Grouping = ChartGrouping.Stacked;
stacked.GapWidth = 50;
stacked.Overlap = 100;

Chart ring = sheet.Charts.Add(ChartType.Doughnut, "A37:E50");
ring.HoleSize = 60;

Chart cylinders = sheet.Charts.Add(ChartType.Bar, "G37:L50");
cylinders.Is3D = true;
cylinders.BarShape = BarShape.Cylinder;
```

`Grouping` takes `Clustered`, `Stacked`, or `PercentStacked`. `GapWidth` and
`Overlap` are percentages, matching Excel's own scales — `Overlap = 100` is what
makes a stacked column chart look stacked rather than clustered. A value outside
Excel's range throws `ArgumentOutOfRangeException`.

## Anchoring

```csharp
chart.Anchor = "F2:M17";                                    // covers F2 through M17
chart.Anchor = DrawingAnchor.Cover(1, 5, 16, 12);           // the same, 0-based and inclusive
chart.Anchor = new DrawingAnchor(
        new AnchorPoint(1, 5, RowOffset: 38_100),           // EMU offsets within the corner cells
        new AnchorPoint(17, 13));
```

The anchor is a cell region, so the chart moves and resizes with the rows and
columns beneath it. An A1 range (or a `CellRange`) converts to a `DrawingAnchor`
that covers exactly those cells. The `AnchorPoint` offsets refine the position
inside the corner cells, in EMUs (914,400 per inch, 12,700 per point), for
pixel-exact placement. `DrawingAnchor` and `AnchorPoint` are in
`Axyra.Sheets.Drawing`.

# Chart sheets

A chart sheet holds one chart and no grid:

```csharp
ChartSheet tab = wb.ChartSheets.Add("Revenue", ChartType.Column);
Chart full = tab.Chart!;
full.Series.Add("Sales", "Data!$B$2:$B$10", "Data!$A$2:$A$10");

string name = tab.Name;
int count = wb.ChartSheets.Count;
wb.ChartSheets.RemoveAt(tab.Index);
```

The chart sheet is also a tab in `wb.Sheets`, where its `SheetType` is
`SheetType.Chart` — which is how you tell them apart when walking the sheets of an
unfamiliar workbook. A chart sheet's chart has no anchor, and it cannot hold one of
the Excel 2016 types (waterfall, funnel, …).

# Reading and modifying existing charts

```csharp
foreach (Chart existing in sheet.Charts)
{
    Console.WriteLine($"{existing.Type}: {existing.Title} ({existing.Series.Count} series)");
}
sheet.Charts[0].Title = "Updated";
```

A chart read from a file is the same live object as one you built: reading it
reflects the current state, and every assignment writes through. Use it to edit
a chart that came out of a file rather than building a fresh one. Detail the model
has no property for is kept as the file had it. `sheet.Charts.RemoveAt(i)` and
`sheet.Charts.Clear()` remove charts; the ones after a removed chart move down a
place.

# Data labels, error bars, and trendlines

`DataLabels`, `ErrorBars`, and `Trendline` are records that configure the
per-series decorations:

```csharp
ChartSeries q1 = chart.Series[0];
q1.DataLabels = new DataLabels { ShowValue = true, Position = DataLabelPosition.OutsideEnd };
q1.ErrorBars = new ErrorBars(ErrorBarValueType.Percentage, 5);
q1.Trendlines.Add(new Trendline(TrendlineType.Linear) { ShowRSquared = true });
```

These are read and written for every chart type that supports them, and are
drawn during rendering. Assign `null` to remove labels or error bars.

# Rendering a chart on its own

```csharp
byte[] png = chart.RenderPng(800, 450);          // width, height in pixels
string svg = chart.RenderSvg(800, 450);          // a standalone SVG document

byte[] page = wb.Sheets["Revenue"].RenderImage(ImageFormat.Png, new ImageOptions { Scale = 2.0 });
```

`RenderPng` and `RenderSvg` draw one chart at the size you ask for — the simplest
way to get a chart out of a workbook and into a report or an email. Rendering a
chart sheet through `wb.Sheets[...]` gives you the printed page with the chart,
without the surrounding grid.

{: .notice--info}
**Runnable example:** [`DevRef/ChartsExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/ChartsExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/charts`.

# Next

- [Pivot Tables]({{ site.axyra_dotnet_devref }}/Pivot_Table) — pivot charts
- [Rendering]({{ site.axyra_dotnet_devref }}/Rendering)
