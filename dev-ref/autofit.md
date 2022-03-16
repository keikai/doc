---
title: ''
---
AutoFit can change the width or height automatically to fit the content.
# AutoFit Width
{% include version-badge.html version='5.7.0' %}

## Manually
End users can autofit one column width by double-clicking a column header's border to make its width. Or you can select multiple columns to auto-fit them at once.

![]({{site.devref_image_folder}}/autofit.gif)

## By API
* AutoFit 1 column: [`Spreadsheet.setAutofitColumnWidth(SSheet sheet, int column)`](https://keikai.io/javadoc/latest/io/keikai/ui/Spreadsheet.html#setAutofitColumnWidth-io.keikai.model.SSheet-int-)
* AutoFit multiple columns: [`Spreadsheet.setAutofitColumnWidth(SSheet sheet, int fromColumn, int toColumn)`](https://keikai.io/javadoc/latest/io/keikai/ui/Spreadsheet.html#setAutofitColumnWidth-io.keikai.model.SSheet-int-int-)



# AutoFit Height 
To let keikai automatically resize a row height, please enable ["wrap text"](/dev-ref/Features_and_Usages#wrap-text). 


## By API
{% include version-badge.html version='5.9.0' %}

For those cases that [wrap text can't resize the height]((/dev-ref/Features_and_Usages#wrap-text)) e.g. a merged cell, call [CellOperationUtil.getAutoFitHeight()](https://keikai.io/javadoc/latest/io/keikai/api/CellOperationUtil.html#getAutoFitHeight-io.keikai.api.model.Sheet-int-int-) and apply the height to one or multiple cells.


```java
int currentHeight = range.getSheet().getRowHeight(range.getRow());
int autofitHeight = CellOperationUtil.getAutoFitHeight(spreadsheet.getSelectedSheet(),
        range.getRow(), range.getColumn());
if (autofitHeight != currentHeight) {
    range.setRowHeight(autofitHeight);
}
```
