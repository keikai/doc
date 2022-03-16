---
title: 'Freeze Rows and Columns'
toc: false
---

Freeze rows or columns is useful when displaying lots of data. `Range`
allows you to freeze rows and columns easily like:

{% highlight java linenos %}
//freeze first row and first column
range.setFreezePanel(1,1);

//unfreeze
range.setFreezePanel(0, 0);
{% endhighlight %}

This method accepts row and column number starting from 1 as a
parameter. Calling these methods will take effect on the sheet that
`Range` represents only. Passing `0` means to unfreeze it.

The screenshot below is the example application to demonstrate the API
usage. If we click "Freeze" button, it will freeze row and column
according to current selection. ![]({{site.devref_image_folder}}/Zss-essentials-freeze.png)

The code is like:

{% highlight java linenos %}
public class FreezeComposer extends SelectorComposer<Component> {

    @Wire
    private Spreadsheet ss;

    @Listen("onClick = #freezeButton")
    public void freeze() {
        Ranges.range(ss.getSelectedSheet())
        .setFreezePanel(ss.getSelection().getRow(), ss.getSelection().getColumn());
    }
    
    @Listen("onClick = #unfreezeButton")
    public void unfreeze() {
        Ranges.range(ss.getSelectedSheet()).setFreezePanel(0,0);
    }
}
{% endhighlight %}
