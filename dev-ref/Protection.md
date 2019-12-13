---
title: 'Protection'
---


# Protect a Sheet

If you enable "Protect Sheet" for a sheet in Excel \[1\] , Spreadsheet
can read the setting and prevent you from editing the protected sheet.
Spreadsheet's API also allows you to enable / disable protection and get
protection status of a sheet. Let's use a simple example to demonstrate
this usage:

![center](/assets/images/dev-ref/Zss-essentials-protection.png) The screenshot above
is a simple application. There is a label on the right showing current
sheet's protection status. The "true" means the sheet is under
protection and cannot be edited. The "Toggle Protection" button can
toggle protection status of current selected sheet. We will explain the
"Current Cell Locked Status" and "Toggle Lock" button in next section.

The controller's source code of the application above:

{% highlight java linenos %}
public class ProtectionComposer extends SelectorComposer<Component>{
    
    @Wire
    private Spreadsheet ss;
    @Wire
    private Label status;

    
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        updateSheetProtectionStatus(ss.getSelectedSheet());
    }
    
    @Listen("onClick = #toggleProtection")
    public void toggleProtection(){
        Sheet selectedSheet = ss.getSelectedSheet();
        if (selectedSheet.isProtected()) {
            Ranges.range(selectedSheet).unprotectSheet("password");
        } else {
            Ranges.range(selectedSheet).protectSheet("password",
                true, true, false, false, false, false, false,
                false, false, false, false, false, false, false, false);
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

  - Line 16: Toggle protection status of a sheet when clicking "Toggle
    Protection" button.
  - Line 18: Get protection status of the selected sheet.
  - Line 19: Disable protection of the selected sheet.
  - Line 21-23: Enable protection of the selected sheet, refer to `io.keikai.Range`.
  - Line 30: Update protection status text in the panel when selecting a
    sheet.

# Unlock Specific Area of a Protected Sheet

When you protect a sheet in Excel, all cells are locked and cannot be
edited by default. To enable some cells to be edited while leaving other
cells locked, you can unlock the cells before you protect the worksheet.
\[2\] Spreadsheet can also read unlocked cells of a protected sheet
configured in Excel. You can still edit the unlocked cells when loading
it in Spreadsheet.

The screenshot below is a protected sheet with B2 unlocked. You can see
the sheet protection status is "true, but cell lock status is "false" on
the right panel when selecting B2 which means B2 can be edited.

![center](/assets/images/dev-ref/Zss-essentials-protection-unlock.png)

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
  - Line 9,11: A cell's lock status is of style information. So, to
    change a cell style is not as simple as calling a setter, please
    refer to [ Cell Style and
    Format](Cell_Style_and_Format)
    for more details.
  - Line 10: Use `setLocked()` to lock or unlock a cell.
  - Line 12: Calling `isLocked()` to get lock status.
  - Line 16: Update cell's lock status text in the panel when selecting
    cells.

<references/>

# Limited Edit under Sheet Protection

`since 3.9.2`

When a sheet is **protected**:

1.  Users can copy among unlocked cells
2.  Users can copy a locked cell and paste it an unlocked one.
      -   
        This action doesn't copy the "locked" status. The unlocked cell
        keeps unlocked.
3.  If there is a locked cell in the affected target range while
    pasting, Keikai doesn't paste cells
4.  Cut an unlocked cell, the cell still keep unlocked
      -   
        Without sheet protection, cut an unlocked cell, the cell
        restores to the default value (locked is true).
5.  Users can do "Clear Format", "Clear All", or "Clear Contents" on an
    unlocked cell.
6.  "Clear Formats" resets locked status to true. After this operation,
    an unlocked cell becomes locked.

<!-- end list -->

1.  For example, you can click
    ![zss-essentials-protection-excel-icon.png](/assets/images/dev-ref/Zss-essentials-protection-excel-icon.png) of menu "Review" in
    Excel 2007 to protect a sheet.
2.  Steps to unlock cells in Excel 2007: select one or more cells first,
    right click on selected cells, select "Format Cells...", select
    "Protection" tab, uncheck "Locked" item. After this, the cell is
    still editable when its sheet is protection enabled.
