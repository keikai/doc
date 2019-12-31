---
title: 'Keikai Demo App'
---

# Overview

Keikai Spreadsheet Demo App is a web-based Excel like application based on the Keikai component. We created it to demonstrate Spreadsheet's
numerous powerful features. You can also use this application as a basis
of your application and add more functions like authentication on top of it.

Please follow these steps to run this application:

1.  Download Keikai spreadsheet Demo App from [Keikai Download Page](https://keikai.io/download). Depending on the features you require, choose OSE or EE evaluation version accordingly.
2.  Unzip the zip file and deploy the Spreadsheet App's WAR file to your
    application server according to its instruction.
      -   
        For Tomcat just put the war file in `[CATALINA_HOME]\webapps`.
3.  Start your application server and connect it with your browser.
      -   
        For Tomcat, just visit <http://localhost:8080/keikai-app> then you can start to experience the power of Spreadsheet App.

After you visit Spreadsheet App, you should see its user interface like
the screenshot below: 
![center](/assets/images/dev-ref/Zss-essentials-zssapp.png) 

You might notice that we added a menu on top of the Spreadsheet component and enabled the 3 leftmost buttons ("New Book", "Save Book", and "Export to PDF") on the toolbar. These are application specific and we have implemented them in this Demo App. You can reference this application to implement your own.

# Features

Here we focus on features we created specially for the Spreadsheet Demo App. For component's features, please refer
to [Features and Usage](Features_and_Usage).

## File Menu

The "File" menu contains many file operations such as load, save, and
export.

![center](/assets/images/dev-ref/Zss-essentials-zssapp-file.png)

Each menu item and its function description are:

<table>
<thead>
<tr class="header">
<th><center>
<p>Menu Item</p>
</center></th>
<th><center>
<p>Description</p>
</center></th>
<th><center>
<p>EE Only</p>
</center></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>New</p></td>
<td><p>create a book with 2 blank sheets which equals to click the New Book icon on the toolbar</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>Open</p></td>
<td><p>open a book list dialog that allows you to open, delete, and upload a file.</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>Save</p></td>
<td><p>save current book which equals to click the Save Book icon on the toolbar</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>Save As</p></td>
<td><p>save current book as another file</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>Save &amp; Close</p></td>
<td><p>save current book then close it</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>Close</p></td>
<td><p>close current book</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>Export</p></td>
<td><p>export current book as an Excel file</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>Export PDF</p></td>
<td><p>export current book as a PDF file which equals to click the Export PDF icon on the toolbar</p></td>
<td><p>yes</p></td>
</tr>
</tbody>
</table>

When you select "Open or Manage Books", the dialog below appears and you
can open, delete, or upload a book. 

![center](/assets/images/dev-ref/Zss-essentials-zssapp-file-booklist.png)

## Edit Menu

The "Edit" menu has "Undo" and "Redo". Undo and Redo will be performed when you click on them. 

![center](/assets/images/dev-ref/Zss-essentials-zssapp-edit.png)

Each menu item and its function description are:

<table>
<thead>
<tr class="header">
<th><center>
<p>Menu Item</p>
</center></th>
<th><center>
<p>Description</p>
</center></th>
<th><center>
<p>EE Only</p>
</center></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>Undo</p></td>
<td><p>erase the last change you made</p></td>
<td><p>yes</p></td>
</tr>
<tr class="even">
<td><p>Redo</p></td>
<td><p>revert the effects of the undo action</p></td>
<td><p>yes</p></td>
</tr>
</tbody>
</table>

## View Menu

The "View" menu can control different view options.

![center](/assets/images/dev-ref/Zss-essentials-zssapp-view.png)

Each menu item and its function description are:

<table>
<thead>
<tr class="header">
<th><center>
<p>Menu Item</p>
</center></th>
<th><center>
<p>Description</p>
</center></th>
<th><center>
<p>EE Only</p>
</center></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>Formula Bar</p></td>
<td><p>control visibility of the formula bar</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>Freeze Rows &amp; Columns</p></td>
<td><p>freeze rows and columns according to current selection. It freezes the rows above and the columns left to the current selected cell.</p></td>
<td><p>yes</p></td>
</tr>
<tr class="odd">
<td><p>Unfreeze Rows &amp; Columns</p></td>
<td><p>unfreeze rows and columns</p></td>
<td><p>yes</p></td>
</tr>
<tr class="even">
<td><p>Freeze Row</p></td>
<td><p>shortcut menu to freeze row 1 to row 5</p></td>
<td><p>yes</p></td>
</tr>
<tr class="odd">
<td><p>Freeze Col</p></td>
<td><p>shortcut menu to freeze column A to column E</p></td>
<td><p>yes</p></td>
</tr>
</tbody>
</table>

The screenshot below shows a result after selecting "Freeze Rows &
Columns" when selection box stays in B2. It freezes the row above and
the column left to current selection:

![center](/assets/images/dev-ref/Zss-essentials-zssapp-freeze.png)

# Configuration

## Repository Root

Cloud Drive is the folder where your files are uploaded to. Keikai Demo App will read Excel files from this folder.
You can specify the path/folder via system property.

``` xml
kkapp.repository.root
```

For example, in a Tomcat server, we can assign the following value into
TOMCAT\_HOME/conf/catalina.properties. In this case, Cloud Drive folder
will be changed to c:\kkapp\\books.

``` xml
kkapp.repository.root=c:\kkapp\\books
```

## Auto Save

Demo App supports auto save, and it is triggered in the following cases:

1.  When user changes the file content, and reaches the specified saving time.
2.  Last editing user for the book leaves the book, e.g. opens another book or
    closes the browser.
3.  When server shuts down normally.

By default, the app saves all changes every 15 minutes, but you can
change the frequency via configuration. The following example demonstrates how you can change the saving frequency to 5 minutes (300 seconds).

**Example in zk.xml**

``` xml
<library-property>
    <name>kkapp.save.period.second</name>
    <value>300</value>
</library-property>
```
