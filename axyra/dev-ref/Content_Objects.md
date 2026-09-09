---
title: 'Tables and Content Objects'
permalink: /axyra/dev-ref/Content_Objects
---

{% include axyra_example.html path="devref/ContentObjectsExample.java" %}

Everything a workbook holds beyond values, formulas, and styles: tables,
conditional formats, validation, comments, hyperlinks, form controls, SmartArt,
sparklines, embedded objects. All are read, written, and — where they are
visible — rendered.

# Tables

A table (Excel's "list object") gives a range a name, a header row, banded
styling, an optional totals row, and structured references.

```java
sheet.range("A1:D50").createTable("Sales", "Region", "Q1", "Q2", "Total");

sheet.setTableStyle("Sales", tableStyleInfo);
sheet.setTableHeaderRow("Sales", true);
sheet.setTableTotalsRow("Sales", true);

for (Table t : sheet.tables()) { ... }
sheet.resizeTable("Sales", sheet.range("A1:D80"));
sheet.removeTable("Sales");
```

Tables are what make structured references work:

```java
sheet.cell(50, 3).setFormula("SUBTOTAL(109, Sales[Total])");
```

## Auto-expansion

Typing below a table extends it, as it does in Excel:

```java
sheet.autoExpandTables(50, 0, "APAC");
```

Call it when your application writes a value adjacent to a table and you want
the table's range, banding, and column formulas to follow.

# Conditional formats

A conditional format is a rule plus the style to apply when it matches, added to
a range:

```java
import io.keikai.axyra.sheets.content.ConditionalFormat;

range.addConditionalFormat(ConditionalFormat.builder()
        .cellIs("greaterThan", "1000")
        .fillColor(Color.parse("#FFF3CD"))
        .fontColor(Color.parse("#8A6D3B"))
        .bold()
        .priority(1)
        .build());
```

The rule kinds mirror Excel's:

| Builder call | Rule |
|---|---|
| `cellIs(operator, formula)` | Cell value comparison |
| `between(low, high)` | Value in range |
| `containsText` / `notContainsText` / `beginsWith` / `endsWith` | Text matching |
| `containsBlanks` / `notContainsBlanks` | Blankness |
| `containsErrors` / `notContainsErrors` | Error state |
| `duplicateValues()` / `uniqueValues()` | Duplication |
| `top10(rank, bottom, percent)` | Top or bottom N, by count or percent |
| `aboveAverage(below, includeEqual)` | Above or below average, optionally by standard deviations |
| `dateOccurring(TimePeriod)` | Relative dates — today, this week, last month, … |
| `expression(formula)` | An arbitrary formula |
| `colorScale(Color...)` | Two- or three-colour scale |
| `dataBar(Color)` | In-cell bar |
| `iconSet(name)` | Icon set |

The style to apply is set on the same builder — `fillColor`, `fontColor`,
`bold()`, `italic()`, `underline()`, `strikethrough()`, `numberFormat`,
`border`, `borderSide` — rather than by handing it a `CellStyle`. Only the
properties you set are overridden; the cell keeps the rest of its own style.

`priority` decides which rule wins when several match the same cell — lower runs
first, as in Excel's rule manager.

```java
sheet.conditionalFormats();
sheet.removeConditionalFormat(index);
sheet.clearConditionalFormats();
```

Color scales, data bars, and icon sets are evaluated by the engine, so they
appear correctly in PDF and image output — not only in Excel.

# Data validation

```java
import io.keikai.axyra.sheets.content.Validation;

range.setValidation(Validation.list("APAC", "EMEA", "Americas"));
range.setValidation(Validation.wholeNumber("between", "1", "100"));
range.setValidation(Validation.decimal("greaterThan", "0", null));
range.setValidation(Validation.date("between", "DATE(2026,1,1)", "DATE(2026,12,31)"));
range.setValidation(Validation.textLength("lessThanOrEqual", "40", null));
range.setValidation(Validation.custom("AND(A1>0, A1<B1)"));
```

The builder adds the input message, the error alert, and the dropdown behaviour:

```java
Validation.builder()
        .type("list")
        .formula1("\"APAC,EMEA,Americas\"")
        .showDropdown(true)
        .allowBlank(false)
        .inputMessage("Region", "Pick a sales region.")
        .errorMessage("Invalid region", "Pick one of the listed regions.")
        .errorStyle("stop")
        .build();
```

Validation is metadata: Axyra Sheets stores and preserves it, and a consuming
application enforces it. Writing a value that violates a rule is not rejected —
if you need enforcement, check before writing.

# Comments

Two distinct mechanisms, both preserved:

```java
// Legacy note
cell.setComment("Finance", "Adjusted after audit");
cell.setCommentLayout(180.0, 90.0, true);   // width pt, height pt, visible
cell.removeComment();

// Modern threaded comment
String id = cell.addThreadedComment("alice", "Is this final?");
cell.addThreadedReply(id, "bob", "Signed off.");
cell.setThreadedCommentResolved(id, true);
```

They are separate features in the file format. `comment()` will not return a
threaded comment, and `threadedComments()` will not return a note.

# Rich text

Runs of differently-formatted text within one cell:

```java
import io.keikai.axyra.sheets.content.RichText;

cell.setRichText(RichText.builder()
        .run("Total: ")
        .run("overdue", RichText.run().bold().color(Color.parse("#C0392B")))
        .build());

RichText rt = cell.richText();
for (RichText.RunInfo run : rt.runs()) { ... }
```

# Hyperlinks

```java
cell.setHyperlink("https://keikai.io");
cell.setHyperlink(Hyperlink.url("https://keikai.io", "Keikai"));
cell.setHyperlink(Hyperlink.internal("Summary!A1", "Back to summary"));
cell.setHyperlink(Hyperlink.email("sales@example.com", "Quote request", "Email sales"));
cell.removeHyperlink();

Hyperlink link = cell.hyperlink();
link.isInternal();
link.isEmail();
```

# Form controls

Checkboxes, option buttons, combo boxes, list boxes, spinners, scroll bars, and
buttons — with their linked cells:

```java
import io.keikai.axyra.sheets.content.FormControl;
import io.keikai.axyra.sheets.content.FormControlType;
```

Types: `CHECK_BOX`, `OPTION_BUTTON`, `BUTTON`, `COMBO_BOX`, `LIST_BOX`,
`SCROLL_BAR`, `SPIN_BUTTON`, `EDIT_BOX`, `LABEL`, `GROUP_BOX`.

A control's linked cell is the bridge to the model: a checkbox writes
`TRUE`/`FALSE` into it, a combo box writes the selected index. Formulas reading
that cell recalculate as usual.

# Other content

| Class | What it covers |
|---|---|
| `SmartArt` | Diagram layouts, with colour and 3-D effects; rendered |
| `Sparkline`, `SparklineGroup`, `SparklineStyle` | In-cell mini charts |
| `Slicer`, `Timeline` | Pivot filter widgets — see [Pivot Tables]({{ site.axyra_devref }}/Pivot_Table) |
| `OleObject` | Embedded documents, preserved verbatim |
| `VbaModule` | Macro modules, preserved verbatim (not executed) |
| `XmlMap`, `XmlMapBinding` | XML maps and their cell bindings |
| `DataConnection` | External data connections |
| `ExternalLink` | References to other workbooks — see below |
| `ProtectedRange`, `WriteProtection` | Protection — see below |
| `CustomProperty` | Workbook custom document properties |

VBA modules are **preserved, not executed**. A `.xlsm` opened and saved keeps
its macros; Axyra Sheets never runs them.

# External links

References to other workbooks, and the cached values that let them evaluate
while the other workbook is absent:

```java
wb.externalLinkCount();
for (ExternalLink link : wb.externalLinks()) { ... }
wb.externalLinkSource(0);
wb.setExternalLinkSource(0, "/new/path/prices.xlsx");
wb.removeExternalLink(0);
```

`setExternalLinkSource` is how you re-point a workbook whose dependencies moved
— a common need when files are processed on a server rather than in the folder
they were authored in.

# Protection

Three independent levels:

```java
// Sheet — which cells may be edited
sheet.protect();
sheet.protect("pa55w0rd");
sheet.protect("pa55w0rd", sheetProtectionOptions);   // what stays permitted

// Ranges within a protected sheet that remain editable
sheet.addProtectedRange("Editors", "B2:D50", "range-pw");
sheet.verifyProtectedRangePassword("Editors", "range-pw");
sheet.protectedRanges();
sheet.removeProtectedRange("Editors");

// Workbook structure — adding, deleting, reordering sheets
wb.protect(true, false);                  // lockStructure, lockWindows
wb.protectStructure("pa55w0rd");
wb.isStructureProtected();

// Workbook write protection — "open read-only unless you know the password"
wb.setWriteProtection("pa55w0rd");
wb.isWriteProtected();
wb.removeWriteProtection();
```

A cell is protected when the sheet is protected **and** the cell's style is
`locked(true)` — the default. Unlock the cells you want editable via
`CellStyle.builder().locked(false)`.

Protection is enforced by consuming applications, not by the engine — the same
caveat as validation. A password here restricts editing, it does not encrypt.
Encrypting the file is the mechanism that actually keeps data out; see
[Import and Export]({{ site.axyra_devref }}/Import_and_Export).

# Next

- [Pivot Tables]({{ site.axyra_devref }}/Pivot_Table)
- [Import and Export]({{ site.axyra_devref }}/Import_and_Export)
