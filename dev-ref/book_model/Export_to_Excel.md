---
title: 'Export to Excel'
toc: false
---

One of Spreadsheet's powerful feature is to export its book model as an
Excel file, then we can open the file with Microsoft Excel. Besides,
exporting to a file is also the only way to persist a book model
completely and import it back in the future. 


# Exporter

To export, you need to get an Exporter first. You can get different [`io.keikai.api.Exporter`](https://keikai.io/javadoc/latest/io/keikai/api/Exporter.html) by its type:

```java
Exporters.getExporter();       //get default exporter, xlsx
Exporters.getExporter("xlsx"); //get xlsx exporter
Exporters.getExporter("xls");  //get xls exporter
```


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


