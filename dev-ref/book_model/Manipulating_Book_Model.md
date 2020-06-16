---
title: Manipulating Book Model
toc: false
---

Spreadsheet book model is the place where all spreadsheet cell data
stores. Spreadsheet is like a painter which paints its book model in
grid-like layout in your browser. Every action you take on a spreadsheet (e.g.
insertion or deletion) involves a change to its book model. The
following sections introduce those APIs to handle a spreadsheet book
model by corresponding user action.

# Commonly-used API

You can do most operations with the following classes:

* [CellOperationUtil](https://keikai.io/javadoc/latest/io/keikai/api/CellOperationUtil.html)
* [SheetOperationUtil](https://keikai.io/javadoc/latest/io/keikai/api/SheetOperationUtil.html)
* [Range](https://keikai.io/javadoc/latest/io/keikai/api/Range.html)

# Create a `Range` by `Ranges`

For each cell/row/column operation, you need to get a `Range` object. The
helper class [`Ranges`](https://keikai.io/javadoc/latest/io/keikai/api/Ranges.html) supports various methods to create a Range object
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