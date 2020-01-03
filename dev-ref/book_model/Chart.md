---
title: 'Chart'
---

# Overview

`io.keikai.api.model.Range` API can
allow you to add, move, and delete a charts of a Spreadsheet:

{% highlight java linenos %}

public Chart addChart(SheetAnchor anchor, Type type, Grouping grouping, LegendPosition pos);

public void deleteChart(Chart chart);

public void moveChart(SheetAnchor anchor,Chart chart);
{% endhighlight %}

A chart
`io.keikai.api.model.Chart` is a simple object that you can only 
get its ID and position. All chart types constant are listed in `io.keikai.api.model.Chart.Type`. 
Most chart types are supported except `OF_PIE, RADAR, STOCK, SURFACE_3D`, and `SURFACE`.
Supported grouping (`io.keikai.api.model.Chart.Grouping`) are `STANDARD,
STACKED, PERCENT_STACKED` and, `CLUSTERED`. Supported legend
positions (`io.keikai.api.model.Chart.LegendPosition`) are `BOTTOM,
LEFT, RIGHT, TOP`, and `TOP_RIGHT`. \[1\]

The `io.keikai.api.SheetAnchor` represents a chart's position on a sheet. 
When adding or moving a chart, you must provide one `SheetAnchor` to assign 
a chart's position. You can create a `SheetAnchor` by passing 4 index numbers, 
left-top corner's and right-bottom's row and column of a chart. When invoking `addChart()`,
you will get the newly-created chart object in returned value. You had
better store it somewhere you can retrieve it back later if you plan to
delete or move it. Otherwise, you can only get them from a `Sheet` method:

{% highlight java linenos %}
    public List<Chart> getCharts();
{% endhighlight %}

Then, use its ID or position to identify a chart.

# ZK Charts engine

We use ZK Charts as the default chart engine. We don't need any
changes in our code except export server for exporting PDF. Please refer
to [Export to PDF](Export_to_PDF)

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
row and last column represents symmetric position of a chart (right
bottom corner). For example, in the screenshot, the topmost chart whose
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
        SheetOperationUtil.addChart(Ranges.range(ss.getSelectedSheet(),new AreaRef("A1:B6")),
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

# Reference 

1.  Currently Spreadsheet cannot read legend position from an XLS file.
