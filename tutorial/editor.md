---
title: 'Online Editor'
toc: false
---

First we talk about displaying a Keikai spreadsheet in your browser for viewing and editing.

Keikai is based on [ZK UI framework](http://www.zkoss.org), and it provides [a powerful, XML format UI language](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/UI_Composing/ZUML). You can easily create a Keikai spreadsheet by the `spreadsheet` XML tag. This can be done by specifying:

**editor.zul**
```xml
<spreadsheet width="100%" height="100%"
            showToolbar="true" showFormulabar="true" 
            showSheetbar="true" showContextMenu="true"
            src="/WEB-INF/books/demo_sample.xlsx"/>      //load demo_sample.xlsx into Keikai
```

That's it! Your first Keikai spreadsheet is now ready!

Now you can visit the page URL (http://localhost:8080/tutorial/editor.zul) with your browser. Referring to the image below, you will see the specified xlsx file(3) loaded with toolbar(1), formula bar(2), sheet bar(5) and context menu(4).


![](/assets/images/dev-ref/essentials-feature-ui.png)

Keikai has a familiar spreadsheet UI interface, end users can view and edit the spreadsheet in the way they already know, such as changing cell content, font, color, format, formulas, copy/paste, and more.
