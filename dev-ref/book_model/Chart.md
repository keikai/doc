---
title: 'Chart'
---

# Overview

The follwing `io.keikai.api.model.Range` methods allow you to add, move, and delete a chart:

```java

public Chart addChart(SheetAnchor anchor, Type type, Grouping grouping, 
                        LegendPosition pos);

public void deleteChart(Chart chart);

public void moveChart(SheetAnchor anchor,Chart chart);
```


# Supported Chart Types
* AREA
* BAR
* BUBBLE
* COLUMN
* DOUGHNUT
* LINE
* PIE
* SCATTER

All type constants are listed in [`io.keikai.api.model.Chart.Type`](https://keikai.io/javadoc/latest/io/keikai/api/model/Chart.Type.html). 


# Supported grouping 
`STANDARD, STACKED, PERCENT_STACKED` and, `CLUSTERED`. (See [`io.keikai.api.model.Chart.Grouping`](https://keikai.io/javadoc/latest/io/keikai/api/model/Chart.Grouping.html)) 

# Supported legend positions 
`BOTTOM, LEFT, RIGHT, TOP`, and `TOP_RIGHT` （See [`io.keikai.api.model.Chart.LegendPosition`](https://keikai.io/javadoc/latest/io/keikai/api/model/Chart.LegendPosition.html)).


# Positions
A chart `io.keikai.api.model.Chart` is a simple object that you can only 
get its ID and position. The `io.keikai.api.SheetAnchor` represents a chart's position on a sheet. 
When adding or moving a chart, you must provide one `SheetAnchor` to assign 
a chart's position. You can create a `SheetAnchor` by passing 4 index numbers, 
left-top corner's and right-bottom's row and column of a chart. When invoking `addChart()`,
you will get the newly-created chart object in returned value. You had
better store it somewhere you can retrieve it back later if you plan to
delete or move it. Otherwise, you can only get them from a `Sheet` method:

```java
    public List<Chart> getCharts();
```

Then, use its ID or position to identify a chart.

# ZK Charts engine

Keikai uses [ZK Charts](https://www.zkoss.org/product/zkcharts) as the default chart engine.

# Example

The screenshot below is a application that can add, move and delete a
chart. For simplicity, this application only adds pie charts.

![center]({{site.devref_image_folder}}/Zss-essentials-chart.png)

When we click "Add", it will add a pie chart with the data from A1:B6
and add a items in the Listbox on the top right corner. Select a chart
item in the listbox, enter destination row and column index in 2
Intboxes, then click "Move". The selected chart will be moved to
specified position. The "Delete" button will delete the selected chart.

Notice that there are 5 columns in the Listbox on the top right corner
which display information about charts we add. The ID is a chart's ID
generated automatically by Spreadsheet. The row and column represents a
chart's position of the left top corner in 0-based index and the last
row and last column represents right bottom corner. 
For example, in the screenshot, the topmost chart whose
ID is "rid1", its left top corner is at "F1" represented in column index
"5" and row index "0". Its right bottom corner is at "K9" represented in
column index "10" and row index "8". in column index "1" and row index
"6". Its right bottom corner is at "C12" represented in column index
"11" and row index "2". These position information is stored in
`SheetAnchor`. When adding or moving a picture, you must provide one
`SheetAnchor` to assign a picture's position. The `SheetOperationUtil`
provides methods to simplify this.

Let's see this application's controller codes:

{% highlight java linenos %}
public class ChartComposer extends SelectorComposer<Component> {

    @Wire
    private Intbox toRowBox;
    @Wire
    private Intbox toColumnBox;
    @Wire
    private Spreadsheet ss;
    @Wire
    private Listbox chartListbox;

    private ListModelList<Chart> chartList = new ListModelList<Chart>();

    @Listen("onClick = #addButton")
    public void addByUtil(){
        SheetOperationUtil.addChart(Ranges.range(ss.getSelectedSheet(),
                                    new AreaRef("A1:B6")),
        Type.PIE, Grouping.STANDARD, LegendPosition.RIGHT);
        refreshChartList();
    }
    
    @Listen("onClick = #moveButton")
    public void moveByUtil(){
        if (chartListbox.getSelectedItem() != null){
            SheetOperationUtil.moveChart(Ranges.range(ss.getSelectedSheet()),
                    (Chart)chartListbox.getSelectedItem().getValue(),
                    toRowBox.getValue(), toColumnBox.getValue());
            refreshChartList();
        }
    }
    
    @Listen("onClick = #deleteButton")
    public void deleteByUtil(){
        if (chartListbox.getSelectedItem() != null){
            SheetOperationUtil.deleteChart(Ranges.range(ss.getSelectedSheet()), 
                    (Chart)chartListbox.getSelectedItem().getValue());
            refreshChartList();
        }
    }

    private void refreshChartList(){
        chartList.clear();
        chartList.addAll(ss.getSelectedSheet().getCharts());
        chartListbox.setModel(chartList);
    }
}
{% endhighlight %}

- Line 16: `SheetOperationUtil.addChart()` converts a range of cells
automatically to chart data based on a predefined assumption. For
example, it will assume that the first column contains category
labels.


# Display Empty Values as Gap or Zero
{% include version-badge.html version="5.3.0" %}

Default: **false**

When a chart's data source contains a blank cell (empty value), Keikai displays it as 0. You can choose to display it as a **gap** like:

![]({{site.devref_image_folder}}/empty-cell-as-gap.png)


There are several ways to configure depending on how big scope you want to apply:
## Page Scope
Put the `<custom-attribute>` in a zul.
```xml
<custom-attributes io.keikai.chart.emptyAsGaps="true"/>
```

## Application Scope

**zk.xml**
```xml
    <library-property>
        <name>io.keikai.chart.emptyAsGaps</name>
        <value>true</value>
    </library-property>
```

Please read [ZK Configuration Reference](https://www.zkoss.org/wiki/ZK_Configuration_Reference/zk.xml/The_Library_Properties) for details.

## Limitation
Combo charts don't support this.


# Limitation 

1.  Currently Spreadsheet cannot read legend position from an XLS file.

# Sparklines
Please see [Features_and_Usages#sparklines](/dev-ref/Features_and_Usages#sparklines)