---
title: 'Trace Formulas'
---

{% include version-badge.html version='5.6.0' %}

# Overview

Spreadsheet can highlight a cell's precedents or dependents with a highlighted border in a sheet. Besides, you can also get a set of precedents or dependents to process further. Check [traceFormula.zul](https://github.com/keikai/dev-ref/blob/master/src/main/webapp/advanced/traceFormula.zul).


# Show Precedents/Dependents in a Browser

You can call methods on [`Spreadsheet`](https://keikai.io/javadoc/latest/io/keikai/ui/Spreadsheet.html) to show precedents/dependents in a browser.

## [`Spreadsheet.tracePrecedents(Sheet sheet, CellRef cellRef)`](https://keikai.io/javadoc/latest/io/keikai/ui/Spreadsheet.html#tracePrecedents-io.keikai.api.model.Sheet-io.keikai.api.CellRef-)

![]({{site.devref_image_folder}}/precedents.jpg)

At J13, its formula is `=SUM(F13:I13)`, so `F13:I13` (enclosed by green border) is its **precedents**.


## [`Spreadsheet.traceDependents(Sheet sheet, CellRef cellRef)`](https://keikai.io/javadoc/latest/io/keikai/ui/Spreadsheet.html#traceDependents-io.keikai.api.model.Sheet-io.keikai.api.CellRef-)

![]({{site.devref_image_folder}}/dependents.jpg)

Both J13 and F15 (enclosed by red border) reference to F13, so `F13` has 2 **dependents**.



# Get a Set of Precedents/Dependents
You can also get a set of precedents/dependents of a cell to process further with:

* [`Range.getDirectPrecedents()`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html#getDirectPrecedents--)
* [`Range.getDirectDependents()`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html#getDirectDependents--)


