---
title: 'Book Model'
---
# Book Model Overview

When Spreadsheet loads an Excel file, the file is converted to
Spreadsheet's **book model** stored in memory. The root of
the book model is a book
([`io.keikai.api.model.Book`](https://keikai.io/javadoc/latest/io/keikai/api/model/Book.html)) and a
book contains one or more sheets
([`io.keikai.api.model.Sheet`](https://keikai.io/javadoc/latest/io/keikai/api/model/Sheet.html)) which
may contain many cells
([`io.keikai.api.model.CellData`](https://keikai.io/javadoc/latest/io/keikai/api/model/CellData.html)),
styles
([`io.keikai.api.model.CellStyle`](https://keikai.io/javadoc/latest/io/keikai/api/model/CellStyle.html),
[`io.keikai.api.model.Color`](https://keikai.io/javadoc/latest/io/keikai/api/model/Color.html)), fonts
([`io.keikai.api.model.Font`](https://keikai.io/javadoc/latest/io/keikai/api/model/Font.html)),
charts
([`io.keikai.api.model.Chart`](https://keikai.io/javadoc/latest/io/keikai/api/model/Chart.html)), and
pictures
([`io.keikai.api.model.Picture`](https://keikai.io/javadoc/latest/io/keikai/api/model/Picture.html)).

You can directly access model objects like `Book` or `Sheet`. However,
you should modify cell data (or rows and columns)via the
`io.keikai.api.Range` interface,
then Spreadsheet will handle subsequent synchronization stuff for you,
e.g. notify other referenced cells. A `Range` may represent a cell, a
row, a column, or a selection of cells containing one or more contiguous
blocks of cells, or a 3-D reference( Read more about 3-D reference in the [Reference Section](Spreadsheet_Data_Model#references)).  Because the underlying
implementation is complicated, you only can obtain a `Range` object
through a facade class named [`io.keikai.api.Ranges`](https://keikai.io/javadoc/latest/io/keikai/api/Ranges.html).

In this section, we will introduce some commonly-used API with examples.
For complete information, you can browse Javadoc under
`io.keikai.api.*` and `io.keikai.api.model.*`. To understand
example codes, we assume you already know what a composer is and how it works with components. If you are new to composer, please read [ZK Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Composer)first.

# Load A Book Model

In most cases, we create a book model by loading an Excel file instead
of creating it directly. Specifying an Excel file's path in Spreadsheet
component's attribute is the simplest way, and Spreadsheet will import
the file and construct a book model object. You can also use
[`io.keikai.api.Importer`](https://keikai.io/javadoc/latest/io/keikai/api/Importer.html) to
construct a Book object by your own and provide it to one or more
Spreadsheet components by `setBook()`. After Spreadsheet loads a book
model, we can get it by `Spreadsheet.getBook()`.

## By `src` Attribute

The `io.keikai.ui.Spreadsheet`'s `setSrc(java.lang.String)` can be called to display an Excel file
programmatically. Similar to `src` attribute, this method accepts
relative file path.

``` xml
<spreadsheet id="ss" height="100%" width="100%" src="/WEB_INF/books/blank.xlsx" />
```

Load by API

{% highlight java linenos %}
public class MyComposer extends SelectorComposer<Component> {

    @Wire
    Spreadsheet ss;
    
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        //initialize stuff here
        ss.setSrc("/WEB-INF/books/startzss.xlsx");

    }
}
{% endhighlight %}

  - Line 3: The annotation `@Wire` injects matched component object's
    reference to annotated variable according to the selector syntax. In
    this case, ZK injects a Spreadsheet component whose id is "ss" on
    the ZUL page. For details, please refer to [ZK Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Wire_Components).

To reload the same file, you should set src to null first and set it
back to the original file.

## By Importer

In the case where your Excel file is not from a static file path, the importer
interface along with `Spreadsheet.setBook()`can be used. Normally one
would obtain Book instance by importing an Excel book file. Use
`imports()` of
`io.keikai.api.Importer` to import
an Excel file. It returns `Book` instance which can be passed to
`setBook(Book)` to display the imported Excel file.

``` java
public class ImporterComposer extends SelectorComposer<Component> {

    @Wire
    Spreadsheet ss;
    
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);  //wire variables and event listeners
        //access components after calling super.doAfterCompose()
        Importer importer = Importers.getImporter();
        Book book = importer.imports(getFile(), "sample");
        ss.setBook(book);
    }
    
    private File getFile(){
        //get a file from a source
    }
}
```

# Create a New Book

You need to load a blank book file to create a new book instead of
instantiating a Book object. Please refer to BookUtil.java in Keikai Essentials.

# Access Sheets

The `Book` object is the root of Spreadsheet's data model, and we can
retrieve sheets from it, e.g. by its index `getSheetAt()`, or by the name
`getSheet()`. One book object might contain one or more sheets, and we
can know how many sheets it has by `getNumberOfSheets()`. However,
Spreadsheet only displays one sheet at a time and the
currently-displayed sheet is the *selected sheet*. We can get selected
sheet via `Spreadsheet.getSelectedSheet()` or set it via
`Spreadsheet.setSelectedSheet()`.

The `io.keikai.api.model.Sheet` allows us to get a sheet's status
such as protection (`isProtected()`), auto filter
(`isAutoFilterEnabled()`), hidden and freeze rows or columns
(`getRowFreeze()`), and properties such as name (`getSheetName()`),
row's width, column's height, charts, and pictures which the sheet
contains.

You can also `createSheet()`, `deleteSheet()`, `cloneSheet()`, and even
clone a sheet from another book by `cloneSheetFrom()`. Please refer to copySheet.zul in Keikai Essentials Project.

## Switch Sheets Example

Here we demonstate a basic usage: allowing users to use a listbox outside of the spreadsheet to select and switch to the selected sheet.

![]({{site.devref_image_folder}}/Zss-essentials-book-sheet.png)

**setSheet.zul**

``` xml

<div height="100%" width="100%" 
apply="io.keikai.essential.BookSheetComposer">
    <listbox id="sheetBox" mold="select"/>
    <spreadsheet id="spreadsheet" src="/WEB-INF/books/startzss.xlsx"
        maxrows="200" maxcolumns="40"
        width="100%" height="450px"/>
</div>
```

Then we listen the Listbox's onSelect event to change current selected
sheet.

{% highlight java linenos %}

public class BookSheetComposer extends SelectorComposer<Component>{
    
    @Wire
    Listbox sheetBox;
    @Wire
    Spreadsheet spreadsheet;
    //override
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        
        List<String> sheetNames = new ArrayList<String>();
        int sheetSize = spreadsheet.getBook().getNumberOfSheets();
        for (int i = 0; i < sheetSize; i++){
            sheetNames.add(spreadsheet.getBook().getSheetAt(i).getSheetName());
        }
        
        sheetBox.setModel(new ListModelList<String>(sheetNames));
    }
    
    @Listen("onSelect = #sheetBox")
    public void selectSheet(SelectEvent event) {
        String selected = (String)event.getSelectedObjects().iterator().next();
        spreadsheet.setSelectedSheet(selected);
    }
}
{% endhighlight %}

  - Line 14,15: Get each sheet's name from Spreadsheet's book model.
  - Line 18: Set name list to the Listbox.
  - Line 21: The annotation `@Listen` makes `selectSheet()` listen
    onSelect event of the Listbox whose id is `sheetBox`. That means
    when a user selects a sheet in the Listbox, the method
    `selectSheet()` will be invoked.(For complete syntax, please refer
    to [ZK Developer's Reference](http://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Wire_Event_Listeners)
  - Line 23,24: Change Spreadsheet's selected sheet when users select a
    sheet.

# Access Cells

When you want to change some data in a book or a sheet, you can directly
access their corresponding model objects, `Book` or `Sheet`. However,
there is not a cell object for you to access. Because a cell might
be referenced by other cells, accessing it directly may need to notify other
cells. This issue can get more complicated if you select multiple cells.

Hence, in order to encapsulate these complicated details, Spreadsheet
provides 2 classes, `Ranges` and `Range` (Notice that the first one ends with an S). The `Ranges` is a facade class that
has 2 kinds of method. One is used to select a range of cells and it
will return a `Range` object that can represent a cell, a row, a column,
or a selection of cells containing one or more contiguous blocks of
cells, or a 3-D blocks of cells.

**Getting Range object example**

``` java
//select single cell
Range range1 = Ranges.range(spreadsheet.getSelectedSheet(), row, column);

//select an area by cell reference
Range range2 = Ranges.range(spreadsheet.getSelectedSheet(), "A1:D4");
//select an area by 2 pairs of column and row index
Range range3 = Ranges.range(spreadsheet.getSelectedSheet()
                            , topRow, leftColumn, bottomRow, rightColumn);

//select a range of cells by the name you give in Excel 2007
Range range4 = Ranges.rangeByName(spreadsheet.getSelectedSheet(), "InputData");
```

Another is to get cell reference with specified row and column index.

**Getting cell reference example**

``` java
// Gets single cell reference, e.g. A1
String ref1 = Ranges.getCellReference(row, column);
// Gets single  cell reference with sheet name, e.g. Sheet1!A1
String ref2 = Ranges.getCellReference(spreadsheet.getSelectedSheet(), row, column);

// Gets a range of cell reference, e.g. A1:B2
String ref3 = Ranges.getAreaReference(topRow, leftColumn, bottomRow, rightColumn);
// Gets a range of cell reference with sheet name, e.g. Sheet1!A1:B2
String ref4 = Ranges.getAreaReference(spreadsheet.getSelectedSheet(),
                             topRow, leftColumn, bottomRow, rightColumn);

// Gets column reference, e.g. A or B
String ref5 = Ranges.getColumnReference(column);
// Gets a row reference, e.g. 1 or 12
String ref6 = Ranges.getRowReference(row);
```

## Read Data from Cells

After you get a `Range` object from `Ranges`, you can get cell related
data from it such as:

``` java
//get text from it
range.getCellEditText();
range.getCellFormatText();
//get an object that represents a cell's value, e.g. Double or String
range.getCellValue();

//gets the leftmost column index of this range
range.getColumn();
//gets the topmost row index of this range
range.getRow();

//change range to select entire row or column
range.toRowRange();
range.toColumnRange();
```

More methods will be introduced in later sections.

## Utility Class

`Ranges` and `Range` provide major APIs to access cells. In order to deal with the referencing relationships among cells, we also provides utility classes, [`io.keikai.api.CellOperationUtil`](https://keikai.io/javadoc/latest/io/keikai/api/CellOperationUtil.html) and [`io.keikai.api.SheetOperationUtil`](https://keikai.io/javadoc/latest/io/keikai/api/SheetOperationUtil.html), to help you change cell data and styles. You can use them without knowing more details about the underlying implementation, and they will handle those details for you such as synchronization and checking. We will introduce these 2 utility classes more in later sections.

# References

1.  A reference that refers to the same cell or range on multiple sheets
    is called a 3-D reference. A 3-D reference is a useful and
    convenient way to reference several worksheets that follow the same
    pattern and cells on each worksheet contain the same type of data,
    such as when you consolidate budget data from different departments
    in your organization.
