---
title: 'Backend Calculation Engine'
---

# Overview
Keikai provides the capability to use spreadsheets in a non-UI, headless fashion, like an automated backend calculation engine.

The key is the [Book Model](/dev-ref/book_model/Manipulating_Book_Model), which stores all cell data and formulas. You can directly access and manipulate this model programmatically, without needing to render a visual spreadsheet in a browser.

This enables loading data into a Book Model from any source (e.g. databases), executing calculations with formulas, and reading back results, all without any UI.

    Data   ----> Book Model  ----> Result

With this kind of usage, keikai can be a backend calculation engine or perform a automating operation.

## Benefits
Using Keikai as a backend calculation engine provides these benefits:

* No UI required - Automate spreadsheet workflows without rendering a visual interface.
* Update calculations via formulas - Formula logic can be modified without code changes, lowering maintenance effort.
* Leverage spreadsheet calculation power - Harness the calculation capabilities of spreadsheets for backend data processing.

# Steps
The general steps to use Keikai in headless way are:
1. [Import an XLSX file](/dev-ref/import) to instantiate a Book model. 
The file may contain predefined formulas.
2. [Load input data](/dev-ref/book_model/Manipulating_Book_Model) into the model with `Range` API.
Recommend to use named range instead of cell address for readability and stability.
3. Retrieve calculation output by reading cell values using the `Range` API.


By eliminating UI concerns, Keikai can serve as a powerful calculation engine for server-side automation processes. The XLSX format provides a portable way to apply spreadsheet logic across many use cases.


# A Servlet Example
Check [ApiServlet](https://github.com/keikai/dev-ref/blob/master/src/main/java/io/keikai/devref/external/ApiServlet.java).

You can visit http://localhost:8080/dev-ref/api?r=0&c=1

The parameters:
* `r`: row index, 0-based.
* `c`: column index, 0-based.

Then it will show you the cell value of **A2**.

The `ApiServlet` imports an xlsx file and return a cell value with `Range` API. It doesn't render any spreadsheet on a web page.

![]({{site.devref_image_folder}}/ApiServletArchitecture.png)