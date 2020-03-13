---
title: 'Introduction'
---
# Background

Keikai spreadsheet is an AJAX component that delivers Excel-like experience
to your Java web application. It has a grid-like user interface with
a toolbar, a formula bar, and a sheet bar; it provides popular spreadsheet features
such as editing text and styles, merging and sorting cells, and inserting,
deleting, and freezing rows and columns. In addition Keikai supports more than 200 commonly used Excel built-in formulas and you can even add your own. Some other handy features like "auto fill", "filter", and "sheet/cell protection" are also
supported.

Being able to import and export Excel files are just the most basic features provided. You can do much more with Keikai. 
In contrast to other online spreadsheets such as Google Docs and Microsoft Excel Online, you can integrate Keikai spreadsheet with your enterprise back-end systems and create collaborative and dynamic spreadsheet-driven enterprise applications easily. You
can call versatile Java APIs to control and configure Keikai spreadsheet. You can register event listeners so that an action can be
automatically triggered when any specified cell, range, or name changes.
You can make cells reference to the backend Java beans, so that any changes
on the backend data can automatically reflect on Keikai spreadsheet. You can
create your own custom formulas in Java and use them in the
spreadsheet just like other built-in formulas. You can even provide an online
spreadsheet service with Keikai.

Keikai spreadsheet is an extensible, customizable, and integrable Java AJAX
web spreadsheet component, on the front-end it has an AJAX user interface in the browser, 
and on the back-end a server side Excel-like data and logic. No ActiveX or any other
plug-ins are required.

# Architecture

**Overview** 

![]({{site.devref_image_folder}}/Essentials-app-architecture.png)

**More Details** 

![]({{site.devref_image_folder}}/Essentials-architecture.png)

Keikai spreadsheet component consists of three major parts -- the
client-side UI , the server-side component, and the book data model with
the formula evaluation engine. The UI is a grid like widget that you can
in-place edit the content of each cell. The component is a server-side
instance which your controller usually works with. The data model stores
the actual Spreadsheet data. The formula evaluation engine is
responsible for formula parsing and calculations.

# Use in JSP

If you have an existing JSP project that you wish to include spreadsheet features, you can use Keikai in JSP with custom tag library and interact with it by writing Javascript. Please refer to [ Using Spreadsheet in JSP]({{devref}}/Keikai_in_JSP "wikilink")
for details. 


# Supported Browsers

For best user experience, we recommend using one of the following
browsers: 
* Chrome
* Firefox
* Safari
* Edge
* IE11 and higher

# Next Step

You can visit [Keikai Demo](https://keikai.io/demo/) or [Run it up locally](https://doc.keikai.io/tutorial).
