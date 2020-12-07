---
title: 'Performance Guide'
---

Here we introduce some performance optimization tips for different scenarios.

# Calling Multiple Range Methods

When calling the `Range` setter method, Keikai spreadsheet will automatically
check cell dependencies, update the dependent cells and refresh the
spreadsheet UI of the range. However, in following cases, developers
might not want such "automation" and would rather control the evaluation and
update by themselves:

- Change a lot of cells in a batch.
- If we don't disable auto refresh in such case, Keikai spreadsheet
  will generate a lot of small AU responses to the browser which slow
  down browser rendering speed.
- Initialize a book upon a data source (e.g. a database) before Keikai
  spreadsheet renders itself.
- Sometimes we need to load the data from a database to initialize a
  sheet before Keikai spreadsheet renders in a browser. Disable the auto
  refresh can eliminate Spreadsheet's unnecessary internal
  calculations for rendering.

In order to manually control UI update, we have to:

1.  disable auto-refresh with `setAutoRefresh(false)`
2.  notify changed area with `notifyChange()`

<!-- end list -->

{% highlight java linenos %}
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
{% endhighlight %}

  - line 6: disable the auto-refresh before changing cells (calling
    setter)
  - line 12: notify the changed range of cells or just the whole sheet

You can run [Example Source](Download_Example_Source_Code) to see how the performance differs between the 2 cases.

## Notify Affected Range

When notifying a change, remember to choose all affected range, not just
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
the whole sheet instead. Note that you may see a flash (blank sheet for a moment) because
it will re-render the whole sheet.

{% highlight java linenos %}
Ranges.range(ss.getSelectedSheet()).notifyChange();
{% endhighlight %}

### Notify the cached area

If rendering the whole sheet is too slow in your case, you can also consider to notify
the currently cached area.

{% highlight java linenos %}
Spreadsheet ss;
// change cells
ss.notifyLoadedAreaChange();
{% endhighlight %}

# No Auto-Adjusting Row Height

If your application doesn't allow users to do any operation that needs a
row height calculation e.g. enable / disable wrap text, change a font
size, then you can set the attribute `ignoreAutoHeight` to `true`. This
will improve client-side rendering speed a lot because it will skip calculating 
the row height which is time-consuming.

{% highlight java linenos %}
<!-- default is false -->
<spreadsheet  ignoreAutoHeight="true"/>
{% endhighlight %}

# Initialize with Large Data

## Implement PostImport

One typical use case in Keikai is loading a template file and inserting application
data from a database in the beginning. Normally, this will generate lots
of internal events and trigger formula dependency recalculation which is
unnecessary before showing Keikai spreadsheet to a browser. If you have lots of data, you can implement
<javadoc directory="keikai">io.keikai.api.PostImport</javadoc> and put
your initialization logic in `process()`. Then Keikai will invoke
`process()` right after the file is imported and turn off those
unnecessary update triggered by `Range` API. This can speed up
the data/formula inserting.

{% highlight java linenos %}
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
{% endhighlight %}

## Initialize Asynchronously

If the data to be inserted is too large, and it's slow even with PostImport implemented, you can insert the data in 2 phases. First,
just insert a small part of data (e.g. 500 rows) since Keikai doesn't
render all rows to the browser and a user's screen size is limited anyway. Then, send an [Echo Event](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/UI_Patterns/Long_Operations/Use_Echo_Events)
to insert the rest of the data.


# Import a Large File
The major factor that determines the importing time is **the total number of cells** instead of **the number of sheets**. Importing One file having 1 sheet, 10 thousand cells takes longer time than a file having 20 sheets, 1 thousand cells in total.

## Clear unnecessary cells
If a sheet contains only 100 rows of data, but you applied cell background color to 5000 rows, then Keikai still needs to process those (unnecessary) 4900 rows which is a waste of time. Hence, you can reduce the importing time by: 
* **clear/delete those unnecessary cells**
* **move those cells with data into a new sheet**


## Split the File
If you have a big file with multiple sheets and massive cells, and it takes a long time to import, you can split the file into multiple smaller files and import them separately. For example, you split a big file into `a-1.xlsx` and `a-2.xlsx`. Then, import the 1st file first, after Keikai shows the first file, starts to import the 2nd file. Keep the reference of the 2 `Book`. Allow users to switch among 2 books by calling [`Spreadsheet::setBook()`](https://keikai.io/javadoc/latest/io/keikai/ui/Spreadsheet.html#setBook-io.keikai.api.model.Book-).


# Import formula cache
An Excel file contains formula calculated result as a cache, you can configure to show the cached value instead of having Keikai to re-evaluate formulas at importing. Please see [Configuration#importing](/dev-ref/Configuration#importing).


# Trouble Shooting
If you have tried the relevant techniques above or if you are not sure why your project is slow, we recommend you to analyze your page according to
[Step by Step Trouble Shooting](https://www.zkoss.org/wiki/ZK%20Developer's%20Reference/Performance%20Monitoring/Step%20by%20Step%20Trouble%20Shooting) to find the performance bottleneck. Then, deal with the bottleneck or consult with us. 
