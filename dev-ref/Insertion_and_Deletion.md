---
title: 'Insertion and Deletion'
---


The `Range` API to insert cells.

{% highlight java linenos %}
range.insert(InsertShift.RIGHT, InsertCopyOrigin.FORMAT_LEFT_ABOVE);
{% endhighlight %}

In this usage, the `Range` object not only represents the position to
insert cells but also how many cells to insert. For example, if you pass
a Range that represents B1:C2, then `insert()` will insert 4 cells. The
2nd argument
`io.keikai.api.Range.InsertShift` controls the shift direction of original cells, and it could
be `DEFAULT`, `RIGHT` or `DOWN`. The 3rd argument is of
`io.keikai.api.Range.InsertCopyOrigin`
that determines from which cells inserted cell should copy styles. It
could be `FORMAT_LEFT_ABOVE, FORMAT_RIGHT_BELOW`, or `FORMAT_NONE`.

To insert rows, the same method can be used, but you need to make your
range become a row range as follows:

{% highlight java linenos %}
range = range.toRowRange(); 
{% endhighlight %}

The same rule applies to columns with `toColumnRange()`.

The method for deletion is relatively simple. Just specify how other
cells shift after deletion with 2nd argument (`DEFAULT, LEFT, UP`):

{% highlight java linenos %}
range.delete(DeleteShift.LEFT);
{% endhighlight %}

`io.keikai.api.CellOperationUtil`
also can help us to insert (or delete) cells, rows, and columns. To
insert cells:

{% highlight java linenos %}
CellOperationUtil.insert(Range range, InsertShift shift, InsertCopyOrigin copyOrigin);
{% endhighlight %}

Delete:

{% highlight java linenos %}
CellOperationUtil.delete(Range range, DeleteShift shift)
{% endhighlight %}

If we want to insert 3 columns at current selection when a user click a
button, we may write:

{% highlight java linenos %}

    @Listen("onClick = #insert3Columns")
    public void onInsert3Columns(){
        AreaRef selection = ss.getSelection();
        //select the range that contains 3 column
        Range range = Ranges.range(ss.getSelectedSheet(), selection.getRow(),
                selection.getColumn(), selection.getRow() ,
                selection.getColumn()+2);

        //select all columns
        range = range.toColumnRange(); 
        //shift existing row right and copy style from left cells 
        CellOperationUtil.insert(range, InsertShift.RIGHT, InsertCopyOrigin.FORMAT_LEFT_ABOVE);
        ss.setMaxVisibleColumns(ss.getMaxVisibleColumns()+3);
    }
{% endhighlight %}

  - Line 13: If last column contains data, remember to increase the
    number of max visible column or it will be shifted to invisible
    area. The same rule applies on inserting rows.

If we want to delete cells and shift other cells to the left, we may
write:

{% highlight java linenos %}
    @Listen("onClick = #deleteCellLeft")
    public void onDeleteCellLeft(){
        AreaRef selection = ss.getSelection();

        Range range = Ranges.range(ss.getSelectedSheet(), selection);
        
        //move existing (right) cells left
        CellOperationUtil.delete(range, DeleteShift.LEFT);
    }
{% endhighlight %}
