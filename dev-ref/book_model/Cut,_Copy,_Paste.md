---
title: 'Cut, Copy, Paste'
---

# Overview

To copy a range of cells, you should use `io.keikai.api.Ranges` to select
them and call `paste(Range)` with another `Range` object for destination
like:

{% highlight java linenos %}
//src and desitination belong to different sheets
Range src = Ranges.range(ss.getSelectedSheet(), ss.getSelection());
Range destination = Ranges.range(getDestinationSheet(), ss.getSelection());
{% endhighlight %}

# CellOperationUtil

With the help of [`io.keikai.api.CellOperationUtil`](https://keikai.io/javadoc/latest/io/keikai/api/CellOperationUtil.html),
we can easily perform copying and cutting, and it also provides methods
for "paste special" such as `pasteValue()`, or `pasteFormula()`. These
methods all require 2 `Range` objects as arguments. One is source and
another is destination.

To **cut** a range of cells, you should use

```java
CellOperationUtil.cut(srcRange, destRange);
```

To **copy** a range of cells, you should use

```java
CellOperationUtil.paste(srcRange, destRange);
```

The usages for `pasteFormula()`, `pasteValue()`, `pasteTranspose()`, and
`pasteAllExceptBorder()` are all the same.

# Range

Copy cells with Range API is also simple:

{% highlight java linenos %}
Range src = Ranges.range(ss.getSelectedSheet(), ss.getSelection());
Range destination = Ranges.range(getDestinationSheet(), "A1");
src.paste(destination, true);
{% endhighlight %}

There is also a [`pasteSpecial()`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html#pasteSpecial-io.keikai.api.Range-io.keikai.api.Range.PasteType-io.keikai.api.Range.PasteOperation-boolean-boolean-) to do special pasting like pasting value only or pasting formula only.



# Example

The following codes copy a selection range to the same position of
another sheet when a user clicks a button.

{% highlight java linenos %}

public class CopyCutComposer extends SelectorComposer<Component> {

    @Wire
    private Spreadsheet ss;


    @Listen("onClick = #copyButton")
    public void copyByUtil() {
        Range src = Ranges.range(ss.getSelectedSheet(), ss.getSelection());
        Range dest = Ranges.range(getResultSheet(), ss.getSelection());
        CellOperationUtil.paste(src, dest);
    }
    
    //omitted codes...
}
{% endhighlight %}
