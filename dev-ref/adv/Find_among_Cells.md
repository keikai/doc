---
title: 'Find among Cells'
---

Find a text among cells is a common function. Keikai spreadsheet doesn't
have this built-in function, but we can easily build our own with Keikai
API.

![ center](/assets/images/dev-ref/Zss-essentials-find-dialog.png " center")

We list the key method here. For complete code, please refer to the [example code
project](Download_Example_Source_Code).
This method starts finding from the next cell by rows of the current
selection. If nothing found, return the current selection. When reaching
the end of a sheet, it does not find from the beginning.

{% highlight java linenos %}
    protected Range findNext(Sheet sheet, Range currentSelection) {
        int lastColumn = Ranges.range(sheet).getDataRegion().getLastColumn();
        int lastRow = Ranges.range(sheet).getDataRegion().getLastRow();
        String keyword = keywordBox.getValue().trim();
        int row = getStartingRow(sheet, currentSelection);
        int column = getStartingColumn(sheet, currentSelection); 
        while (row <= lastRow){
            while (column <= lastColumn){
                Range cell = Ranges.range(sheet, row, column);
                if (cell.getCellData().getType() == CellType.STRING){
                    if (match(cell.getCellData().getEditText(), keyword)){
                        return cell;
                    }
                }
                column++;
            }
            column = 0;
            row++;
        }
        return currentSelection;
    }
{% endhighlight %}
