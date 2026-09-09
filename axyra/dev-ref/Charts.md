---
title: 'Charts'
permalink: /axyra/dev-ref/Charts
---

{% include axyra_example.html path="devref/ChartsExample.java" %}

Charts are built with a per-type builder, anchored to a cell region, and either
embedded in a sheet or given a chart sheet of their own. They round-trip through
the file formats and are drawn by the [rendering
pipeline]({{ site.axyra_devref }}/Rendering) for PDF and image output.

# Building a chart

```java
import io.keikai.axyra.sheets.content.Chart;
import io.keikai.axyra.sheets.content.LegendPosition;

Chart chart = Chart.column()
        .title("Revenue by Region")
        .series("Q1", "Sheet1!$B$2:$B$8", "Sheet1!$A$2:$A$8")
        .series("Q2", "Sheet1!$C$2:$C$8", "Sheet1!$A$2:$A$8")
        .legend(LegendPosition.BOTTOM)
        .showDataLabels(true)
        .anchor(1, 5, 16, 12)      // fromRow, fromCol, toRow, toCol
        .build();

int index = sheet.addChart(chart);
```

Series references are ordinary A1 strings and should be **absolute and
sheet-qualified** — a chart is not anchored to the cell its references are
relative to, so a relative reference has no useful base.

# Chart types

`Chart` exposes a static factory per type:

| | | | |
|---|---|---|---|
| `column()` | `bar()` | `line()` | `pie()` |
| `area()` | `scatter()` | `doughnut()` | `radar()` |
| `bubble()` | `combo()` | `surface()` | `stock()` |
| `waterfall()` | `histogram()` | `funnel()` | `treemap()` |
| `sunburst()` | `boxWhisker()` | `pareto()` | `map()` |

The first twelve are the classic Excel types; the rest are the modern ones
introduced in Excel 2016 and later. All are read and written. Map charts are
preserved but currently render as a placeholder frame; the other listed types
have dedicated renderers.

# Common options

```java
Chart.line()
        .title("Trend")
        .titleFormula("Sheet1!$A$1")     // title from a cell instead of a literal
        .autoTitle(false)
        .legend(LegendPosition.RIGHT)
        .legendVisible(true)
        .categoryAxisVisible(true)
        .valueAxisVisible(true)
        .style(12)                       // Excel style number (metadata; see below)
        .threeD(false)
        .chartAreaFill(Color.parse("#FFFFFF"))
        .chartAreaBorder(Color.parse("#CCCCCC"))
        .build();
```

`style(n)` writes Excel's built-in style number (`<c:style val>`) and nothing
else. Excel expands that number from its own gallery when it opens the file;
Axyra Sheets does not, so it renders the chart with whatever explicit formatting
you gave it. Treat the style number as metadata you round-trip — to change how
the chart looks in PDF or PNG output, set the formatting explicitly.

## Type-specific options

```java
Chart.column().grouping("stacked").gapWidth(50).overlap(100);   // stacked bars
Chart.doughnut().holeSize(60);
Chart.bar().barShape("cylinder");
```

`grouping` takes `"clustered"`, `"stacked"`, or `"percentStacked"`. `gapWidth`
and `overlap` are percentages, matching Excel's own scales — `overlap(100)` is
what makes a stacked column chart look stacked rather than clustered.

## Anchoring

```java
.anchor(1, 5, 16, 12)
.anchorOffsets(0, 0, 0, 0)   // EMU offsets within the from/to cells
```

The anchor is a cell region, so the chart moves and resizes with the rows and
columns beneath it. `anchorOffsets` refines the position inside the first and
last cells, in EMUs (914,400 per inch), for pixel-exact placement.

# Chart sheets

A chart sheet holds one chart and no grid:

```java
int i = wb.addChartSheet("Revenue", chart);

ChartView view = wb.chartSheetChart(i);
String name = wb.chartSheetName(i);
int count = wb.chartSheetCount();
wb.removeChartSheet(i);
```

`Sheet.sheetType()` reports `CHART` for these, which is how you tell them apart
when walking the sheets of an unfamiliar workbook.

# Reading and modifying existing charts

```java
ChartView view = ...;   // from chartSheetChart, or the sheet's charts
```

`ChartView` is a live view onto a chart in the model — reading it reflects the
current state, and setters write through. Use it when editing a chart that came
out of a file rather than building a fresh one.

# Data labels, error bars, and trendlines

`DataLabels`, `ErrorBars`, and `Trendline` in
`io.keikai.axyra.sheets.content` configure the per-series decorations:

```java
import io.keikai.axyra.sheets.content.*;
```

These are read and written for every chart type that supports them, and are
drawn during rendering.

# Rendering a chart on its own

```java
byte[] png = wb.renderSheetPng(chartSheetIndex, ImageOptions.builder().scale(2.0).build());
```

Rendering a chart sheet gives you the chart as an image without the surrounding
grid — the simplest way to get a chart out of a workbook and into a report or an
email.

# Next

- [Pivot Tables]({{ site.axyra_devref }}/Pivot_Table) — pivot charts
- [Rendering]({{ site.axyra_devref }}/Rendering)
