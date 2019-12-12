---
title: 'Performance Guide'
---

We list optimization tips for some scenarios.

# Calling Multiple Range Methods

When calling `Range` setter method, Keikai spreadsheet will automatically
check cell dependencies, update the dependent cells and refresh the
spreadsheet UI of the range. However, in following cases, developers
might not want such "automation" and like to control the evaluation and
update by themselves:

  - Change a lot of cells in a batch.

<!-- end list -->

  -   
    If we don't disable auto refresh in such case, the Keikai spreadsheet
    will generate a lot of small AU response to a browser which slows
    down browser rendering speed.

<!-- end list -->

  - initialize a book upon a data source (e.g. a database) before Keikai
    spreadsheet renders itself.

<!-- end list -->

  -   
    Sometimes we need to load the data from a database to initialize a
    sheet before Keikai spreadsheet renders in a browser. Disable the auto
    refresh can eliminate Spreadsheet's unnecessary internal
    calculations for rendering.

In order to manually control UI update, we have to:

1.  disable auto-refresh with `setAutoRefresh(false)`
2.  notify changed area with `notifyChange()`

<!-- end list -->

``` java
    private void loadData() {
        Sheet sheet = ss.getSelectedSheet();
        for (int column  = 0 ; column < COLUMN_SIZE ; column++){
            for (int row = 0 ; row < ROW_SIZE ; row++ ){
                Range range = Ranges.range(sheet, row, column);
                range.setAutoRefresh(false);
                range.getCellData().setEditText(row+", "+column);
                CellOperationUtil.applyFontColor(range, "#0099FF");
                CellOperationUtil.applyAlignment(range, Alignment.CENTER);
            }
        }
        Ranges.range(ss.getSelectedSheet(), 0, 0, ROW_SIZE, COLUMN_SIZE).notifyChange();
                ...
    }
```

  - line 6: disable the auto-refresh before changing cells (calling
    setter)
  - line 12: notify the changed range of cells or just the whole sheet

You can run
<http://books.zkoss.org/wiki/ZK_Spreadsheet_Essentials/Download_Example_Source_Code>
to know the speed difference between 2 cases.

## Notify Affected Range

When notifying a change, remember to choose an affected range, not just
those cells you modify. The following cases explain the reasons:

  - Change a cell referenced by a formula in another cell.

<!-- end list -->

  -   
    If you change a cell, all those cells that contain a formula
    referencing the cell should also require an update.

<!-- end list -->

  - Insertion / deletion of cells / rows / columns.

<!-- end list -->

  -   
    If you insert a column, all columns after the inserted column also
    require an update.

### Notify the whole sheet

If the affected cells are too distributed, you can consider notifying
the whole sheet. But this might make a sheet blank for a moment because
it will re-render the whole sheet.

``` java
Ranges.range(ss.getSelectedSheet()).notifyChange();
```

### Notify the cached area

If rendering a whole sheet is too slow, you can also consider to notify
the currently cached area.

``` java
Spreadsheet ss;
// change cells
ss.notifyLoadedAreaChange();
```

# No Auto-Adjusting Row Height

`since 3.8.3`

If your application doesn't allow users to do any operation that needs a
row height calculation e.g. enable / disable wrap text, change a font
size, then you can set the attribute `ignoreAutoHeight` to `true`. This
will improve client-side rendering speed much because it avoids
time-consuming cell's height calculating for each row.

``` xml
<!-- default is false -->
<spreadsheet  ignoreAutoHeight="true"/>
```

# Initialize with Large Data

## Implement PostImport

`since 3.9.1`

A typical use case is loading a template file and inserting application
data from a database at the beginning. Normally, this will generate lots
of internal events and trigger formula dependency recalculation which is
unnecessary before showing Keikai spreadsheet to a browser. You can
implement
<javadoc directory="keikai">io.keikai.api.PostImport</javadoc> and put
your initialization logic in `process()`. Then Keikai will invoke
`process()` right after the file importing and turn off those
unnecessary update triggered by `Range` API. Therefore, it can speed up
the data/formula inserting.

``` java
public class PostImportComposer extends SelectorComposer<Component> implements PostImport{

    @Wire
    private Spreadsheet ss;
    @Wire("checkbox")
    private Checkbox postImportingBox;
    private String src = "/WEB-INF/books/blank.xlsx";
    private final File FILE = new File(WebApps.getCurrent().getRealPath(src));
    private Importer importer = Importers.getImporter();
    private String POST_IMPORT_KEY = "post-import";

    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        long start = System.currentTimeMillis();
        if (isPostImported()){
            loadWithPostImporting();
        }else{
            loadDirectly();
        }
        long end = System.currentTimeMillis();
        postImportingBox.setChecked(isPostImported());
        Clients.showNotification("consumed (ms):"+(end-start));
    }

    @Override
    public void process(Book book) {
        initializeMassiveFormulas(book.getSheetAt(0));
    }

    /**
     * Increase row and column here, you will see bigger time difference between post importing and non-post importing. 
     * @param sheet
     */
    private void initializeMassiveFormulas(Sheet sheet){
        for (int row = 0 ; row < 1500 ; row++){
            for (int col = 0 ; col < 50 ; col++){
                String editText; 
                if (row > 0 ){
                    editText = "=" +Ranges.getCellRefString(row-1, col);
                }
                else{
                    editText = ""+(row+col);
                }
                Ranges.range(sheet, row, col).setCellEditText(editText);
            }
        }
    }
    
    private void loadWithPostImporting() throws IOException{
        Book book = importer.imports(FILE, "blank", this);
        ss.setBook(book);
    }
    
    private void loadDirectly() throws IOException{
        Book book = importer.imports(FILE, "blank");
        ss.setBook(book);
        initializeMassiveFormulas(ss.getSelectedSheet());
    }
...
}
```

## Initialize Asynchronously

If the data to insert is too large, so that it still consumes a long
time you can't accept. Then you can insert the data in 2 phases. First,
just insert a small part of data (e.g. 500 rows) since Keikai doesn't
render all rows to a browser and a user's screen size is also limited. A
user can't see all rows at once in the beginning. Then send an
<https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/UI_Patterns/Long_Operations/Use_Echo_Events>
to insert the rest of the data.
