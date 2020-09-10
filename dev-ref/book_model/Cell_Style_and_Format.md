---
title: 'Cell Style and Format'
---

# Overview

There are 2 parts of information stored in cells, one is **"data"** and
another is **"style"**. In this section, we are going to introduce the
"style" part which includes alignment, border, border color, font
family, font size, and font style.

Spreadsheet supported border style and font depending upon a browser's capability.

| Style Feature | Limitation                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Font Family   | Because of browser limitation, available fonts depend on installed fonts on client side              |
| Border Style  | Because of browser limitation, only **solid**/**dashed**/ **dotted** border style are supported now. |

# Get Style
To get "style" information stored in
[`io.keikai.api.model.CellStyle`](https://keikai.io/javadoc/latest/io/keikai/api/model/CellStyle.html) object, you must get
[`io.keikai.api.Range`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html) object first.

```java
CellStyle style = range.getCellStyle();
```

Then, we can get a cell's alignment, border setting, and cell color via
`CellStyle`. Every getter method of `CellStyle` has a clear name to
indicate what information it returns. Please refer its javadoc for
complete list.



## Alignment

```java
// get Range object for a cell 
Range range = Ranges.range(spreadsheet.getSelectedSheet(), rowIndex, columnIndex);
// get CellStyle
CellStyle style = range.getCellStyle();

//horizontal alignment
Alignment alignment = style.getAlignment();
//vertical alignment
VerticalAlignment verticalAlignment = style.getVerticalAlignment();
```

## Border

```java
// get CellStyle
CellStyle style = range.getCellStyle();

//border type
BorderType borderType = style.getBorderTop();

//color
Color color = style.getBorderTopColor();
```


There is one corresponding method to get its border and border color
respectively for each side (top, bottom, left, and right) of a cell.

## Cell Background Color

{% highlight java linenos %}
// get Range object for a cell 
Range range = Ranges.range(spreadsheet.getSelectedSheet(), rowIndex, columnIndex);
// get CellStyle
CellStyle style = range.getCellStyle();

String colorCode = style.getBackgroundColor().getHtmlColor();
{% endhighlight %}

## Font

Those information about font can be retrieve via
[`io.keikai.api.model.Font`](https://keikai.io/javadoc/latest/io/keikai/api/model/Font.html), and we can
get this object by `CellStyle`'s `getFont()`. Here are some examples:

{% highlight java linenos %}
// get Range object for a cell 
Range range = Ranges.range(spreadsheet.getSelectedSheet(), rowIndex, columnIndex);
// get CellStyle
Font font = range.getCellStyle().getFont();

//font family name, e.g. Arial
font.getFontName();

//font size, e.g. 12, 14
font.getFontHeightInPoint()

font.getColor();

//could return Boldweight.BOLD or Boldweight.NORMAL 
font.getBoldweight();

font.isItalic();
font.isStrikeout();

//return Font.Underline
font.getUnderline();
{% endhighlight %}

# Change Style

## `CellOperationUtil`
The easiest way is to call `applyYYY()` methods on the helper class:

[`io.keikai.api.CellOperationUtil`](https://keikai.io/javadoc/latest/io/keikai/api/CellOperationUtil.html) 


It supports almost all cell related operations you want. We recommend you 
to use this utility class because the utility class will look for 
existing `CellStyle` object which equal to the new style to reuse first. 
If no existing style matches, it just create new one. 
It will also skip those cells that have equal style as
new style. So you don't have to check by yourself. This can avoid
creating redundant `CellStyle`.

**Change style example**

{% highlight java linenos %}
Range selection = Ranges.range(spreadsheet.getSelectedSheet()
    , spreadsheet.getSelection());

//change horizontal alignment
CellOperationUtil.applyAlignment(selection, Alignment.CENTER);
//change vertical alignment
CellOperationUtil.applyVerticalAlignment(selection, VerticalAlignment.TOP);

//change border
CellOperationUtil.applyBorder(selection, ApplyBorderType.EDGE_TOP
                                , BorderType.THIN, "#FF00FF");
{% endhighlight %}

All methods of `CellOperationUtil` require a Range object. You can use
Ranges to select one or more cells. In this example, we get the current
user-selected cells and pass it to `CellOperationUtil.applyAlignment()`.
Then `CellOperationUtil` will do those details stuffs for us to change
horizontal alignment.

## Using `Range` API

Although the utility class
(`io.keikai.api.CellOperationUtil`) provides convenience, 
but it doesn't provide complete API to change all
properties for a style. Sometimes you still need to use `Range` API.

Because one `CellStyle` might associate with multiple cells, you can't directly change a value of a `CellStyle`. You need to clone the current `CellStyle` and change the values in newly-cloned `CellStyle` object.


Steps to change the style of a cell:

1. {% include version-badge.html version='5.3.0' %} Change styles with Builder pattern API.<br/> It will clone the specified `CellStyle` and change styles on the cloned object.
2. Set it back to the original `Range` object.

The following codes demonstrate how to change alignment:

{% highlight java linenos %}
public void applyAlignment() {
    Range selection = Ranges.range(ss.getSelectedSheet(), ss.getSelection());
    CellStyle oldStyle = selection.getCellStyle();
    CellStyle newStyle = selection.getCellStyleHelper().builder(oldStyle)
            .alignment((Alignment)hAlignBox.getSelectedItem().getValue()).build();
    selection.setCellStyle(newStyle);
}
{% endhighlight %}

  - Line 4: Get a [`CellStyle.Builder`](https://keikai.io/javadoc/latest/io/keikai/api/model/CellStyle.Builder.html) with an existing style. It will clone the existing style.
  - Line 5: Change the style with methods and call `build()` to get newly-created [`CellStyle`](https://keikai.io/javadoc/latest/io/keikai/api/model/CellStyle.html).
  - Line 6: Set newly-created cell style object back to the range to apply the change.

# Example

The example below can display a cell's alignment and border status and change the alignment of cells:

![]({{site.devref_image_folder}}/Zss-essentials-cellStyle-alignment.png )

Check the complete the example at [cellStyle.zul](https://github.com/keikai/dev-ref/blob/master/src/main/webapp/cellStyle.zul) and [CellStyleComposer.java](https://github.com/keikai/dev-ref/blob/master/src/main/java/io/keikai/devref/CellStyleComposer.java)
