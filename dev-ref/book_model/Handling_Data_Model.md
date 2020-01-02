---
title: 'Handling Data Model'
---

Spreadsheet data model is the place where all Spreadsheet cell data
stores. Spreadsheet is like a painter which paints its data model in
grid-like layout for you. Every action you take on a Spreadsheet (e.g.
insertion or deletion) involves a change to its data model. The
following sections introduce those APIs to handle a Spreadsheet data
model by corresponding user action.

For each cell/row/column operation, you need to get a Range object. The
helper class `Ranges` supports various methods to create a Range object
like:

{% highlight java linenos %}
        // a book
        Ranges.range(spreadsheet.getBook());
        // a sheet
        Ranges.range(spreadsheet.getSelectedSheet());
        // a row
        Ranges.range(spreadsheet.getSelectedSheet(), "A1").toRowRange();
        // multiple cells
        Ranges.range(spreadsheet.getSelectedSheet(), "A1:B4");
        Ranges.range(spreadsheet.getSelectedSheet(), 0, 0, 3, 1);
        // a cell
        Ranges.range(spreadsheet.getSelectedSheet(),  3, 3);
{% endhighlight %}
