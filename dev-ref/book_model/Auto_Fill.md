---
title: 'Auto Fill'
---

# Overview

The "auto fill" is a handy feature that helps you quickly insert some
data with regular pattern by dragging mouse. The text are copied, and
numbers are increased. Month and week day are also filled in cells with
their regular order.

Using API to perform "auto fill" is quite easy. Just select a range and
call `autoFill()` with destination range and file type:

{% highlight java linenos %}
srcRange.autoFill(destinationRange, AutoFillType.DEFAULT);
{% endhighlight %}

Currently, there are only 4 auto fill types supported which are
`DEFAULT, COPY, FORMATS, VALUE`. The `DEFAULT` type will fill content of
other cells according to source cell's content and first cell's style
will also be copied to other cells. If a cell contains month, weekday,
or time, other cells will be filled in regular increasing order. If a
cell contains text or number, other cells will be filled with copied
value. If you select 2 or more cells with number, other cells will be
filled with linearly-increased numbers. The `COPY` type will fill cells
with all content of source cells including data and style. The `FORMATS`
type will fill cells with style only. The `VALUE` type will fill cells
with data only (no style).

The utility class
`io.keikai.api.CellOperationUtil` also allows you to perform "auto fill" 
programmatically. You should prepare 2 Range objects, one is for source, 
and another is for destination. Then the method can fill cells from source to destination
according to specified auto fill type.

# Example

The screenshot below demonstrates filling 6 cells from our selection to
the right automatically in `DEFAULT` auto fill type. You can see that
first cell's style of each row is copied to the rest cells. ![]({{site.devref_image_folder}}/Zss-essentials-autoFill.png)

The following codes demonstrate how to achieve this function:

{% highlight java linenos %}
public class AutoFillComposer extends SelectorComposer<Component> {

    @Wire
    private Listbox fillTypeBox;
    @Wire
    private Intbox cellCountBox;
    @Wire
    private Spreadsheet ss;

    
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        fillTypeBox.setModel(getSupportedFillType());
    }

    @Listen("onClick = #fillButton")
    public void autoFill() {
        AreaRef selection = ss.getSelection();
        Range src = Ranges.range(ss.getSelectedSheet(), selection.getRow(),
            selection.getColumn(), selection.getLastRow(),
            selection.getLastColumn());
        Range dest = Ranges.range(ss.getSelectedSheet(), selection.getRow(),
            selection.getColumn(), selection.getLastRow(),
            selection.getLastColumn() + cellCountBox.getValue());
        CellOperationUtil.autoFill(src, dest, 
            (AutoFillType) fillTypeBox.getSelectedItem().getValue());
    }
    
    private ListModelList<AutoFillType> getSupportedFillType(){
        ListModelList<AutoFillType> list = 
            new ListModelList<Range.AutoFillType>();
        list.add(AutoFillType.DEFAULT);
        list.add(AutoFillType.COPY);
        list.add(AutoFillType.FORMATS);
        list.add(AutoFillType.VALUES);
        list.addToSelection(AutoFillType.DEFAULT);
        return list;
    }

}
{% endhighlight %}

  - Line 26, 27: The scope of Range for destination must include the one
    for source.
  - Line 33\~36: Currently, only DEFAULT, COPY, FORMATS, VALUE are
    supported.
