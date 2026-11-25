---
title: "How to Create Charts in Excel Using Java"
excerpt: "Create editable Excel charts in Java with Axyra Sheets. Configure data series, titles, axes, and colors, then save XLSX or export PNG and PDF."
permalink: "/axyra/sheets/java/guides/create-excel-charts-java"
keyword: "create charts in Excel using Java"
redirect_from: ["/axyra/guides/create-excel-charts-java"]
code_link_style: "text"
---

Create Excel charts programmatically with Axyra Sheets, a Java library for reading, writing, and processing Excel files: connect worksheet data to chart series, set titles, axes, colors, and labels, then save an editable XLSX file. Microsoft Excel does not need to be installed on the server.

This tutorial compares actual and target revenue across four regions. Blue columns show actual revenue; orange columns show targets. The workbook keeps both the source data and an editable Excel chart.

## TL;DR

- Write category labels and numeric revenue values into the worksheet before creating the chart.
- Use `Chart.column()`, connect the values and category ranges, set titles and axes, then save an editable XLSX.
- Update the chart as your data grows, or export it to PNG and PDF for a dashboard or report.

## Table of contents

- [Create an Excel column chart from worksheet data](#create-an-excel-column-chart-from-worksheet-data)
- [Run the complete Java example](#run-the-complete-java-example)
- [Update an existing Excel chart with new data](#update-an-existing-excel-chart-with-new-data)
- [Export Excel charts to PNG or PDF in Java](#export-excel-charts-to-png-or-pdf-in-java)
- [Other chart types: line and pie](#other-chart-types-line-and-pie)
- [FAQ](#faq)

![Clustered column chart comparing actual and target revenue across four regions]({{ '/assets/images/axyra-guides/excel-column-chart-java.png' | relative_url }})

Actual and target revenue for four regions, rendered from the example workbook.

## Create an Excel column chart from worksheet data

Start with a Sales worksheet containing this small dataset in A1:C5. Write the revenue as numeric values, with region labels in column A:

| Region | Actual (USD) | Target (USD) |
| --- | --- | --- |
| North | 125,000 | 120,000 |
| South | 98,000 | 105,000 |
| East | 142,000 | 135,000 |
| West | 110,000 | 115,000 |

Inside the open workbook, build the chart, add it to the sheet, and save:

```java
Chart chart = Chart.column()
        .title("Actual vs Target Revenue")
        .grouping("clustered")
        .series("Actual", "Sales!$B$2:$B$5", "Sales!$A$2:$A$5",
                Color.parse("#2F5597"))
        .series("Target", "Sales!$C$2:$C$5", "Sales!$A$2:$A$5",
                Color.parse("#ED7D31"))
        .categoryAxisTitle("Region")
        .valueAxisTitle("Revenue (USD)")
        .legend(LegendPosition.BOTTOM)
        .showDataLabels(true)
        .anchor(1, 4, 18, 13)
        .build();
sheet.addChart(chart);
wb.save(Path.of("sales-chart.xlsx"));
```

Each series takes a name, values reference, then category labels reference; the fourth argument assigns its color. Both series share four labels, exclude the header, and use absolute references qualified with the sheet name. For a sheet name containing spaces, use a reference such as `'Regional Sales'!$B$2:$B$5`.

The category axis names the regions, and the value axis states the currency. The zero-based anchor places the chart from E2 toward N19, leaving the table visible. A column chart uses vertical columns; `Chart.bar()` creates horizontal bars.

## Run the complete Java example

Use Java 17 or later and Maven. The complete program creates the workbook and dataset, configures the chart, and saves sales-chart.xlsx:

[Complete runnable Java example: CreateExcelCharts.java](https://github.com/keikai/axyra-sheets-examples/blob/main/java/guide-projects/create-charts/src/main/java/CreateExcelCharts.java)

```shell
git clone https://github.com/keikai/axyra-sheets-examples.git
cd axyra-sheets-examples/java/guide-projects/create-charts
mvn compile exec:java -Dexec.mainClass=CreateExcelCharts
```

Open sales-chart.xlsx in the project directory. Edit a region’s revenue in Excel to work with the chart and its source data.

For an existing application, see [Installation](https://doc.keikai.io/axyra/sheets/java/dev-ref/Installation). Without an installed license, the example runs in evaluation mode; see [Licensing and evaluation](https://doc.keikai.io/axyra/sheets/java/dev-ref/License).

## Advanced: update or export the same sales chart

### Update an existing Excel chart with new data

Add a fifth region to A6:C6, then extend both series to include it. Axyra Sheets lets you modify the chart directly in Java and save the updated workbook:

```java
ChartView chart = sheet.chart(0);
chart.setSeries(0, "Actual", "Sales!$B$2:$B$6", "Sales!$A$2:$A$6");
chart.setSeries(1, "Target", "Sales!$C$2:$C$6", "Sales!$A$2:$A$6");
wb.save(Path.of("sales-chart-updated.xlsx"));
```

Run mvn exec:java -Dexec.mainClass=UpdateExcelChart. [UpdateExcelChart.java](https://github.com/keikai/axyra-sheets-examples/blob/main/java/guide-projects/create-charts/src/main/java/UpdateExcelChart.java) includes opening the report and adding the new row.

### Export Excel charts to PNG or PDF in Java

Use PNG for a dashboard or email, or PDF for a fixed report. In an open workbook, these calls export the chart alone and the Sales worksheet respectively:

```java
Files.write(Path.of("sales-chart.png"),
        sales.renderChartToPng(0, 1200, 700));
wb.renderPdf(Path.of("sales-chart.pdf"), PdfOptions.builder()
        .sheetNames("Sales").build());
```

Run mvn exec:java -Dexec.mainClass=ExportExcelChart after creating the chart. The complete example sets up a single landscape PDF page with the source table and chart, and omits data labels in that smaller chart to keep it readable.

[Complete PNG/PDF export source](https://github.com/keikai/axyra-sheets-examples/blob/main/java/guide-projects/create-charts/src/main/java/ExportExcelChart.java)

View the reference outputs: [chart PNG](https://github.com/keikai/axyra-sheets-examples/blob/main/java/guide-projects/create-charts/expected/sales-chart.png) · [sales report PDF](https://github.com/keikai/axyra-sheets-examples/blob/main/java/guide-projects/create-charts/expected/sales-chart.pdf)

## Other chart types: line and pie

For monthly trends, use a line chart; for a few nonnegative shares of one total, use a pie chart. The example project supplies a Monthly worksheet and reuses the Sales values:

```java
monthly.addChart(Chart.line().title("Monthly Revenue")
        .series("Revenue", "Monthly!$B$2:$B$13", "Monthly!$A$2:$A$13")
        .anchor(1, 3, 18, 12).build());
sheet.addChart(Chart.pie().title("Revenue Share by Region")
        .series("Actual", "Sales!$B$2:$B$5", "Sales!$A$2:$A$5")
        .anchor(20, 4, 37, 13).build());
```

![Line chart showing illustrative monthly revenue from January through December]({{ '/assets/images/axyra-guides/excel-line-chart-java.png' | relative_url }})



![Pie chart showing actual revenue shares for North, South, East, and West]({{ '/assets/images/axyra-guides/excel-pie-chart-java.png' | relative_url }})

Line: illustrative monthly revenue with seasonal variation. Pie: the same four regional actual-revenue values. Both are Axyra-rendered output.

[Open the editable line and pie chart workbook](https://github.com/keikai/axyra-sheets-examples/blob/main/java/guide-projects/create-charts/expected/chart-variants.xlsx).

## FAQ

### Are the charts editable in Excel?

Yes. The XLSX stores chart definitions and their worksheet references, so recipients can edit both the chart and source values.

### Can chart values come from formulas?

Yes. Use the formula result cells as series values. If you use manual mode or an existing workbook contains outdated results, call `wb.recalculate()` after changing the data and before exporting the report.

## Create your own Excel charts with Java

Adapt the [runnable sales chart example](https://github.com/keikai/axyra-sheets-examples/tree/main/java/guide-projects/create-charts) to your own dataset, series, colors, and labels. [Explore the chart APIs](https://doc.keikai.io/axyra/sheets/java/dev-ref/Charts) for the next step in your report.
