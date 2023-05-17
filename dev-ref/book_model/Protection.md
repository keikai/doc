---
title: 'Protection'
---


# Protect a Sheet

If you enable "Protect Sheet" for a sheet in Excel, Spreadsheet
can read the setting and prevent users from editing the protected sheet. For example, you can click
    ![zss-essentials-protection-excel-icon.png]({{site.devref_image_folder}}/Zss-essentials-protection-excel-icon.png) of menu "Review" in
    Excel 2007 to protect a sheet.


## Builder API
Spreadsheet's API also allows you to enable / disable protection and get
protection status of a sheet. We suggest you using [`SheetProtection.Builder`](https://keikai.io/javadoc/latest/io/keikai/api/SheetProtection.Builder.html). With its fluent API, you can enable those permissions you care, and all other permission you don't set are disabled by default:

```java
static private SheetProtection PROTECTION_WITH_SELECTION = SheetProtection.Builder.create()
    .withPassword("password")
    .withSelectLockedCellsAllowed(true)
    .withSelectUnlockedCellsAllowed(true)
    .build();
range.protectSheet(PROTECTION_WITH_SELECTION);
...
range.unprotectSheet("password");
```

Let's use a simple example to demonstrate this usage:

![]({{site.devref_image_folder}}/Zss-essentials-protection.png) 

The screenshot above is a simple application. 
There is a label on the right showing current sheet's protection status. 
The "true" means the sheet is under protection and cannot be edited. 
The "Toggle Protection" button can toggle protection status of current selected sheet. 
We will explain the "Current Cell Locked Status" and "Toggle Lock" button in next section.

The controller's source code of the application above:

{% highlight java linenos %}
public class ProtectionComposer extends SelectorComposer<Component>{
    
    @Wire
    private Spreadsheet ss;
    @Wire
    private Label status;
    private static final String PASSWORD = "mypass";
    static private SheetProtection PROTECTION_WITH_SELECTION = SheetProtection.Builder.create().withPassword(PASSWORD).withSelectLockedCellsAllowed(true).withSelectUnlockedCellsAllowed(true).build();
    
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        updateSheetProtectionStatus(ss.getSelectedSheet());
    }
    
    @Listen("onClick = #toggleProtection")
    public void toggleProtection(){
        Sheet selectedSheet = ss.getSelectedSheet();
        if (selectedSheet.isProtected()) {
            Ranges.range(selectedSheet).unprotectSheet(PASSWORD);
        } else {
            Ranges.range(selectedSheet).protectSheet(PROTECTION_WITH_SELECTION);
        }
        updateSheetProtectionStatus(selectedSheet);
    }
    
    @Listen("onSheetSelect = #ss")
    public void selectSheet(SheetSelectEvent event) {
        updateSheetProtectionStatus(event.getSheet());
    }
    
    private void updateSheetProtectionStatus(Sheet sheet){
        status.setValue(Boolean.toString(sheet.isProtected()));
    }
}
{% endhighlight %}

  - Line 17: Toggle protection status of a sheet when clicking "Toggle
    Protection" button.
  - Line 19: Get protection status of the selected sheet.
  - Line 20: Disable protection of the selected sheet.
  - Line 22: Enable protection of the selected sheet, refer to [`io.keikai.Range`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html#protectSheet-io.keikai.api.SheetProtection-).
  - Line 29: Update protection status text in the panel when selecting a
    sheet.


# Allow Editing in a Protected Sheet

When you protect a sheet in Excel, all cells are read-only and cannot be edited by default. 
To enable some cells to be edited while leaving other cells read-only, you need to unlock the cells before you protect the worksheet. 


## Keikai Reads Cell Locked Status
Spreadsheet can also read unlocked cells of a protected sheet
configured in xlsx file. You can still edit the unlocked cells when loading
it in Spreadsheet.

The screenshot below is a protected sheet with B2 unlocked. You can see
the sheet protection status is "true, but cell lock status is "false" on
the right panel when selecting B2 which means B2 can be edited.

![]({{site.devref_image_folder}}/Zss-essentials-protection-unlock.png)


## Unlock Cells in Excel
Select one or more cells first, right click on selected cells, select "Format Cells...". 
In "Format Cell" dialog, you can uncheck a cell's locked status:

![]({{site.devref_image_folder}}/unlockCell.png)

After this, the cell is still editable when its sheet is protection enabled.

## Get/Set Locked Status in Java
Besides, Spreadsheet also allows you to lock / unlock cells and retrieve
locked status with API. In our example application, when you select
cells, the panel on the right will display its lock status. Clicking the
"Toggle Lock" buttons can switch lock status of cells.

Now, let's see the source code to understand how this can be achieved:

{% highlight java linenos %}
public class ProtectionComposer extends SelectorComposer<Component>{

    //omit codes for brevity

    @Listen("onClick = #toggleLock")
    public void toggleLock(){
        Range selection = Ranges.range(ss.getSelectedSheet(), ss.getSelection());
        CellStyle oldStyle = selection.getCellStyle();
        EditableCellStyle newStyle = selection.getCellStyleHelper().createCellStyle(oldStyle);
        newStyle.setLocked(!oldStyle.isLocked());
        selection.setCellStyle(newStyle);
        updateCellLockedStatus(newStyle.isLocked());
    }
    
    @Listen("onCellSelection = #ss")
    public void selectCells(CellSelectionEvent event) {
        CellStyle style = Ranges.range(ss.getSelectedSheet(), ss.getSelection()).getCellStyle();
        updateCellLockedStatus(style.isLocked());
    }
    
    private void updateCellLockedStatus(Boolean status){
        lockStatus.setValue(status.toString());
    }
}
{% endhighlight %}

  - Line 6: Switch cells' lock status.
  - Line 9, 11: A cell's lock status is of style information. So, to
    change a cell style is not as simple as calling a setter, please
    refer to [ Cell Style and Format](Cell_Style_and_Format) for more details.
  - Line 10: Use [`setLocked()`](https://keikai.io/javadoc/latest/io/keikai/api/model/impl/EditableCellStyleImpl.html#setLocked-boolean-) to lock or unlock a cell.
  - Line 12: Calling [`isLocked()`](https://keikai.io/javadoc/latest/io/keikai/api/model/CellStyle.html#isLocked--) to get lock status.
  - Line 16: Update cell's lock status text in the panel when selecting
    cells.


# Limited Edit under Sheet Protection

When a sheet is **protected**:

1.  Users can copy among unlocked cells
2.  Users can copy a locked cell and paste it an unlocked one.
      - This action doesn't copy the "locked" status. The unlocked cell
        keeps unlocked.
3.  If there is a locked cell in the affected target range while
    pasting, Keikai doesn't paste cells
4.  Cut an unlocked cell, the cell still keep unlocked
      - Without sheet protection, cut an unlocked cell, the cell
        restores to the default value (locked is true).
5.  Users can do "Clear Format", "Clear All", or "Clear Contents" on an
    unlocked cell.
6.  "Clear Formats" resets locked status to true. After this operation,
    an unlocked cell becomes locked.