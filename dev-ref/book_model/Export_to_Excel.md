---
title: 'Export to Excel'
toc: false
---

One of Keikai's powerful feature is to export its book model as an
Excel file, then you can continue to work with the exported file with Microsoft Excel. Besides,
exporting to a file is also the only way to persist a book model completely and import it back in the future.

Keikai only exports those styles and features it supports. (please see [Features and Usages](/dev-ref/Features_and_Usages)) But it still exports unsupported functions in a formula.

# Exporter

To export, you need to get an [`io.keikai.api.Exporter`](https://keikai.io/javadoc/latest/io/keikai/api/Exporter.html) first. You can get different [`io.keikai.api.Exporter`](https://keikai.io/javadoc/latest/io/keikai/api/Exporter.html) by its type:

```java
Exporters.getExporter();       //get default exporter, xlsx
Exporters.getExporter("excel");//get xlsx exporter (same as "xlsx")
Exporters.getExporter("xlsx"); //get xlsx exporter
Exporters.getExporter("xlsm"); //get xlsx exporter (same as "xlsx")
Exporters.getExporter("xls");  //get xls exporter, deprecated
```

The `"excel"`, `"xlsx"`, and `"xlsm"` types all return the **same** xlsx exporter; only `"xls"` differs. Note that the exporter type does **not** decide whether the output is `.xlsx` or `.xlsm` — see below.


# Export a Macro-Enabled Workbook (xlsm)
{% include version-badge.html version='7.0.0' %}

`.xlsx` and `.xlsm` are the same underlying OOXML format; an `.xlsm` is simply an xlsx that additionally carries a VBA macro part (`xl/vbaProject.bin`) and declares the macro-enabled content type. For this reason there is no separate "xlsm exporter": the xlsx exporter handles both.

**The output format is decided by the book's content, not by the exporter type.** Whenever the book carries a VBA macro project, the xlsx exporter automatically writes a **macro-enabled** workbook — it declares the `application/vnd.ms-excel.sheet.macroEnabled.main+xml` content type and includes the `xl/vbaProject.bin` part, so the file opens in Excel as an `.xlsm` with the macros intact. When the book has no VBA project, the very same exporter writes a plain `.xlsx`.

A book carries a VBA project when either:

* it was imported from a macro-enabled `.xlsm` file (see [Import a Macro-Enabled Workbook](/dev-ref/Import)), or
* you install one programmatically with `Book.setVbaProject(byte[])`.

``` java
//install a VBA project onto a book so the export becomes macro-enabled
book.setVbaProject(vbaProjectBytes); // raw xl/vbaProject.bin bytes
//Book.getType() now reports BookType.XLSM
Exporter exporter = Exporters.getExporter("excel");
exporter.export(book, out); // writes an .xlsm with the macros
```

When you make the exported file downloadable, use the macro-enabled MIME type and an `.xlsm` file name, e.g. `application/vnd.ms-excel.sheet.macroEnabled.12`.

> **Note:** VBA macros are only supported for the xlsx/xlsm format. The deprecated xls (BIFF8) format cannot carry an OOXML VBA part.

# Usage Example
The following codes demonstrate how to export a book model to a temporary file with and make users download it in a browser:

{% highlight java linenos %}
public class ExportComposer extends SelectorComposer<Component> {
    @Wire
    private Spreadsheet ss;
    
    
    @Listen("onClick = #exportExcel")
    public void doExport() throws IOException{
        Exporter exporter = Exporters.getExporter();
        Book book = ss.getBook();
        File file = File.createTempFile(Long.toString(System.currentTimeMillis()),"temp");
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(file);
            exporter.export(book, fos);
        }finally{
            if(fos!=null){
                fos.close();
            }
        }
        //generate file name upon book type (2007,2003)
        String dlname = BookUtil.suggestName(book);
        Filedownload.save(new AMedia(dlname, null, null, file, true));
    }
}
{% endhighlight %}

- Line 8: Get a default `Exporter` which exports as xlsx format.
- Line 14: Currently, we only support exporting whole book.


