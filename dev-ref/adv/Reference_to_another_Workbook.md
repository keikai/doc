---
title: 'Reference to another Workbook'
toc: false
---

Spreadsheet supports external reference: a cell in one spreadsheet can
reference to a cell of another spreadsheet. This feature is useful when
you want to apply a different view for data but don't want to change
original book. It also can be used when you want to merge data from
multiple books.

Before using this feature, you should build a book series by
`io.keikai.api.BookSeriesBuilder`
for all book models including source book and target one. Then, use the
syntax below to reference cells inside book series:

**`=[BOOK_NAME]SHEET_NAME!CELL_REFERENCE`**

For example:

`=[sourceBook.xlsx]source!A2`

Assume that we have a book with personal profile named "profile.xlsx" as
follows.

![center]({{site.devref_image_folder}}/Essentials-reference-profile.png)

Now we want to create a resume for it without modifying "profile.xlsx".
Therefore, we can make cells of "resume.xlsx" reference to
"profile.xlsx". The screenshot is below:

![center]({{site.devref_image_folder}}/Essentials-reference-resume.png)

The following codes demonstrate how to achieve the resume:

{% highlight java linenos %}
public class BookSeriesComposer extends SelectorComposer<Component> {
    
    @Wire
    Spreadsheet ss;
    
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        
        Importer importer = Importers.getImporter();
        Book book1 = importer.imports(getFile("/WEB-INF/books/resume.xlsx"),"resume.xlsx");
        Book book2 = importer.imports(getFile("/WEB-INF/books/profile.xlsx"),"profile.xlsx");
        //can load more books...
        
        ss.setBook(book1);
        
        BookSeriesBuilder.getInstance().buildBookSeries(new Book[]{book1,book2});
    }

    private File getFile(String path){
        return new File(WebApps.getCurrent().getRealPath(path));
    }
}
{% endhighlight %}

  - Line 11\~12: Get all related books.
  - Line 17: Use `BookSeriesBuilder` to build a book series with
    referencing and referenced books.

After completing above steps, you can use external cell reference in a
book to reference another one.


# Import/Export
Assuming the original cell address in Excel is:
`='/myAbsolutePath/[source.xlsx]Input'!A4`

When importing it into keikai, keikai will remove its file path:
`=[source.xlsx]Input!A4`

If you export it, Keikai won't restore the file path.