---
title: 'FAQ'
---
# Does Keikai support user permission control?
We provide API for you to build your owned permission control. User
    permission feature involves authentication and authorization which
    is out of Keikai function's scope. Since Keikai cannot identify a user, it
    cannot assign a user with corresponding permissions. But you can
    easily integrate existing framework like Spring Security and
    implement your user permission features with Keikai. Please refer to
    the following sections:
- Hide the toolbar and the context menu to prevent editing. Please
  refer to [Control Component](Control_Components).
- Disable available functions for different users. Please refer to
  [Disable Functions](/dev-ref/adv/Disable_Functions).
- Protect sheets and set available actions. Refer to `io.keikai.api.Range`.

You can see an example at [Use_Case/User_Permission](User_Permission).

# How do I save the content of Keikai or even save it to a database?

To save the content of Keikai, you can export it as an Excel file. It is also the way we implement the
"Save" function in zssapp. After exporting, you can save the file into a
BLOB type column of a database.

* How to export: [Export to Excel](/dev-ref/book_model/Export_to_Excel)

* Integrate custom saving process to Keikai toolbar's Save button: [Toolbar Customization](/dev-ref/adv/Toolbar_Customization)

Alternatively you can save data to the database referencing the [Tutorial](https://doc.keikai.io/tutorial/database).

# After exporting to a PDF file, the PDF shows unexpected fonts or has missing characters

There are many reasons, but we list the most common ones:

* You choose the wrong encoding for some characters.

- For example, you applied "Calibri" to a Chinese character. You can
  resolve it by applying the correct font.
    - The computer of your PDF viewer software doesn't install
      corresponding fonts.
  For Keikai doesn't embed fonts into a exported PDF file, your computer
  should install the corresponding fonts to display the file correctly. You can test it by opening the PDF file in another
    computer or different OS. Please check installed fonts on your
    computer. Installing missing fonts can solve this problem.

* iText bundled in Keikai will find fonts from the following paths. Please
check the fonts you apply are available in these paths: 

**It won't scan its subdirectories**

`   c:/windows/fonts`  
`   c:/winnt/fonts`  
`   d:/windows/fonts`  
`   d:/winnt/fonts`  
`   /Library/Fonts`  
`   /System/Library/Fonts`

**It will scan its subdirectories**

`   /usr/share/X11/fonts`  
`   /usr/X/lib/X11/fonts`  
`   /usr/openwin/lib/X11/fonts    `  
`   /usr/share/fonts`  
`   /usr/X11R6/lib/X11/fonts`

Extracted from FontFactoryImp com.lowagie.text.FontFactoryImp.

* The corresponding font is not installed the server that exports PDF files. <br/>
It might happen when you export a PDF on a Linux server without
    Microsoft fonts installed. (Unbuntu should install the package
    `ttf-mscorefonts-installer`, "installer for Microsoft TrueType core
    fonts"). You will find the exported PDF's size is smaller than the
    one exported correctly. Install the corresponding fonts can solve
    this issue.

# How do I know my file can be loaded correctly by Keikai?

In general, those functions we implement with the toolbar are supported.
However, the best way is to [download Keikai Demo App](https://keikai.io/download) and try it yourself. It's a ready-to-use web
application based on Keikai component. You just run the war with a Java
application server, then you can upload files via the menu, File / Open
/ Upload.

# Is Keikai 100% compatible with Excel?

Keikai's core value is to bring spreadsheets online and be able to control them fully in Java. Regarding Excel compatibility, while we support the most commonly used Excel features, that doesn't mean all features and all Excel versions are supported. Our documentation contains a list of supported features, for example:
- Supported [Formulas](/dev-ref/Supported_Formula_Functions)
- Supported [Chart types](/dev-ref/book_model/Chart)
- Supported format: [xlsx](/dev-ref/Import)

Please check our documentaiton for supported features, or consult with us if you have any doubts.

# Does Keikai support VB macro?

No. Even [MS Office 365](https://social.technet.microsoft.com/Forums/office/en-US/7c46823c-2581-47a6-baac-66fb99ac3ea8) doesn't support VB Macro in the Web.

If you need a similar function, you can port your macro to Java in your controller to achieve the same.

# How to validate an XLSX format Excel file

Validate it with [Open XML SDK 2.5 Productivity Tool for Microsoft Office](https://web.archive.org/web/20190116000204/https://www.microsoft.com/en-us/download/details.aspx?id=30425).

# Run out of heap when exporting / importing a large file

It is possible to encounter an error like `java.lang.OutOfMemoryError: Java heap
space` when exporting / importing a large file, since large file consumes more
memory during importing and exporting process. Please increase your JVM heap size. (You can
refer to [this document](https://docs.oracle.com/cd/E15523_01/web.1111/e13814/jvm_tuning.htm#PERFM164))

# What is the maximal rows and columns Keikai supports?

  - The max column is **16384** (2^14)
  - the max row is **1048576** (2^20)

Keikai renders cells on demand instead of rendering all cells at once in a
browser, but it loads a file's whole content into the memory. So the
bigger memory your server has, the more rows and columns Keikai can load.

Even if you have sufficient memory, loading time could be an issue.
Because loading time grows linearly with cell number. Under our test
machine, loading 1 million cells with texts takes 65 seconds, loading 2
million cells takes 139 seconds and loading 4 million cells takes 315
seconds. As the cell number grows, the time could be too long to be
acceptable by users. You can measure the loading time on your machine
first.

# Does Keikai support Excel form controls?

No, you can't import Excel's form controls into Keikai. However there are ways to achieve the same goal:

## Insert a checkbox or a radio symbol in cells and control it<br/>

![]({{site.devref_image_folder}}/checkmark-radio.jpg)

To enable the selection of checkmarks and radios, you can implement [Cell Clicking Event](/dev-ref/handling_events/Cell_Clicking_Event) listener and switch the symbols and perform corresponding selection actions. Please see [InvoiceBuilderController](https://github.com/keikai/dev-ref/tree/master/src/main/java/io/keikai/devref/usecase).

## Use ZK Components
Keikai works well with ZK Framework and you can leverage ZK Components in Keikai easily. Please refer to the menu in [Keikai Demo: Excel-like](https://keikai.io/demo/excel_like) and [Bringing intuitive input controls to the web spreadsheet user experience with Java](https://keikai.io/blog/p/insheet-control.html)

## Turn a cell into a button
Apply a border and a background you can easily make a cell look like a button. Then, control the cell in Java so that it works like a button.<br/>
![]({{site.devref_image_folder}}/cell-as-button.jpg)

Check `ui-controls.xlsx` in the example project.

To listen to the button clicking, please see [Cell Clicking Event](/dev-ref/handling_events/Cell_Clicking_Event).

## Create a custom context menu
Please refer to [Custom Context Menu](/dev-ref/adv/Custom_Context_Menu).
Then you can implement the application logic in an onCellClick event listener. 

## Data validation can display a dropdown list
Please refer to [Data Validation](Features_and_Usages#data-validation).

## Show an input component in a popup
![]({{site.devref_image_folder}}/cell-popup.jpg)

Please see [formControl.zul](https://github.com/keikai/dev-ref/blob/master/src/main/webapp/advanced/)

# Unable to get property 'appendCell' of undefined or null reference in IE

If you visit Keikai with IE11 and see such error message in developer tool's
console, it is most likely caused by using Compatibility View. Please turn it off
and reload the page again since ZK/Keikai don't support such legacy mode.

# Errors When Copying Massive Cells

## Request Parameter Over a Server's Limit

You might see similar errors in your server console when copying a large amount of cells. For example, in Tomcat the error message looks like:

`25-Jun-2018 12:14:26.420 INFO [http-nio-8080-exec-8]
org.apache.tomcat.util.http.Parameters.processParameters More than the
maximum number of request parameters (GET plus POST) for a single
request ([10,000]) were detected. Any parameters beyond this limit have
been ignored. To change this limit, set the maxParameterCount attribute
on the Connector.` `Note: further occurrences of this error will be
logged at DEBUG level.`

You need to increase the limit of `maxParameterCount` of your web container. [Read more](https://tomcat.apache.org/tomcat-7.0-doc/config/http.html).


# How do I understand xlsx file format?
Please read [Structure of a SpreadsheetML document](https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/structure-of-a-spreadsheetml-document?tabs=cs). You can also download [ECMA-376 Office Open XML file formats](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/).