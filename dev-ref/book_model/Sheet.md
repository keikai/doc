---
title: 'Sheet'
---

Keikai provides [`Range`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html) methods to create, delete, and clone a sheet.

# Create
[`createSheet(String name)`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html#createSheet-java.lang.String-)


# Delete
[`delete()`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html#deleteSheet--)

# Clone
Clone the current sheet by [`cloneSheet(String name)`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html#cloneSheet-java.lang.String-)

Clone a sheet from another Book e.g. a Book as a template by [`cloneSheetFrom(String name, Sheet sheet)`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html#cloneSheetFrom-java.lang.String-io.keikai.api.model.Sheet-)


# Hide/Unhide

```java
Ranges.range(srcSpreadsheet.getSelectedSheet()).setSheetVisible(Range.SheetVisible.HIDDEN);
Ranges.range(srcSpreadsheet.getSelectedSheet()).setSheetVisible(Range.SheetVisible.VISIBLE);
```