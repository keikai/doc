---
title: 'Tables and Content Objects (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Content_Objects
redirect_from:
  - /axyra/dotnet/dev-ref/Content_Objects
---

Everything a workbook holds beyond values, formulas, and styles: tables,
conditional formats, validation, comments, hyperlinks, form controls, SmartArt,
sparklines, embedded objects. All are read, written, and — where they are
visible — rendered.

Two shapes recur. Objects that live in the workbook — tables, form controls,
threaded comments — are **live objects** in a collection: `Add` returns the
object, and its properties read and write the model directly. Rules and values you
build — validations, conditional-format rules, comments, hyperlinks, rich text —
are **records** you assign or add whole. The types live in `Axyra.Sheets.Tables`,
`Axyra.Sheets.Content`, and `Axyra.Sheets.Drawing`.

# Tables

A table (Excel's "list object") gives a range a name, a header row, banded
styling, an optional totals row, and structured references.

```csharp
using Axyra.Sheets.Tables;

Table sales = sheet.Tables.Add("Sales", "A1:D50", "Region", "Q1", "Q2", "Total");

sales.Style = new TableStyle("TableStyleMedium9") { ShowRowStripes = true };
sales.ShowHeaderRow = true;
sales.Columns["Total"].TotalsFunction = TotalsRowFunction.Sum;
sales.ShowTotalsRow = true;

foreach (Table t in sheet.Tables) { /* t.Name, t.Range, t.Columns */ }
sales.Range = sheet["A1:D80"];                 // Excel's "Resize Table"
sheet.Tables.Remove("Sales");
```

Without column names, `Tables.Add` reads the header from the range's first row,
as Excel's *Format as Table* does. Table names are unique within the workbook;
`sheet.Tables["Sales"]` looks one up ignoring case. `table.ConvertToRange()` is
Excel's *Convert to Range*: the table goes and the cells stay.

Tables are what make structured references work:

```csharp
sheet[50, 3].Formula = "SUBTOTAL(109, Sales[Total])";
```

## Auto-expansion

Typing below a table extends it, as it does in Excel:

```csharp
sheet.Tables.AutoExpand(50, 0, "APAC");
```

Call it when your application writes a value adjacent to a table and you want
the table's range, banding, and column formulas to follow.

# Conditional formats

A conditional format is a rule record — its kind decides what it matches — plus
the `ConditionalStyle` to apply when it matches, added to the sheet over a range:

```csharp
using Axyra.Sheets.Content;

sheet.ConditionalFormats.Add("B2:B100", new CellValueRule(ComparisonOperator.GreaterThan, "1000")
{
    Style = new ConditionalStyle
    {
        FillColor = Color.Parse("#FFF3CD"),
        FontColor = Color.Parse("#8A6D3B"),
        Bold = true,
    },
    Priority = 1,
});
```

The rule kinds mirror Excel's:

| Rule record | Rule |
|---|---|
| `CellValueRule(operator, formula1, formula2)` | Cell value comparison, including `Between` |
| `TextRule(TextRuleOperator, text)` | Text that `Contains`, `NotContains`, `BeginsWith`, or `EndsWith` |
| `CellContentRule(CellContent)` | `Blanks`, `NonBlanks`, `Errors`, or `NonErrors` |
| `DuplicateValuesRule(unique)` | Duplicated or unique values |
| `TopBottomRule(rank, bottom, percent)` | Top or bottom N, by count or percent |
| `AverageRule(below, includeEqual, standardDeviations)` | Above or below average, optionally by standard deviations |
| `DateOccurringRule(TimePeriod)` | Relative dates — today, this week, last month, … |
| `FormulaRule(formula)` | An arbitrary formula |
| `ColorScaleRule.TwoColor(…)` / `ThreeColor(…)` | Two- or three-colour scale |
| `DataBarRule(color)` | In-cell bar |
| `IconSetRule(IconSetType)` | Icon set |

The style to apply is a `ConditionalStyle` — `FillColor`, `FontColor`, `Bold`,
`Italic`, `Underline`, `Strikethrough`, `NumberFormat`, `Borders` — rather than a
full `CellStyle`. Only the properties you set are overridden; the cell keeps the
rest of its own style.

`Priority` decides which rule wins when several match the same cell — lower runs
first, as in Excel's rule manager — and `StopIfTrue` stops the rules after it.

```csharp
foreach (RangeConditionalFormat cf in sheet.ConditionalFormats) { /* cf.Range, cf.Rule */ }
sheet.ConditionalFormats.RemoveAt(0);
sheet.ConditionalFormats.Clear();
```

A rule reads back as the record of its kind, so pattern matching tells the kinds
apart. Color scales, data bars, and icon sets are evaluated by the engine, so they
appear correctly in PDF and image output — not only in Excel.

# Data validation

```csharp
sheet.Validations.Add("A2:A100", Validation.List("APAC", "EMEA", "Americas"));
sheet.Validations.Add("B2:B100", Validation.WholeNumber(ValidationOperator.Between, "1", "100"));
sheet.Validations.Add("C2:C100", Validation.Decimal(ValidationOperator.GreaterThan, "0"));
sheet.Validations.Add("D2:D100", Validation.Date(ValidationOperator.Between, "DATE(2026,1,1)", "DATE(2026,12,31)"));
sheet.Validations.Add("E2:E100", Validation.TextLength(ValidationOperator.LessThanOrEqual, "40"));
sheet.Validations.Add("F2:F100", Validation.Custom("AND(F2>0, F2<G2)"));
```

A `Validation` is a record, so the input message, the error alert, and the
dropdown behaviour are added with `with` (or set in an object initializer):

```csharp
Validation region = Validation.List("APAC", "EMEA", "Americas") with
{
    AllowBlank = false,
    InputTitle = "Region",
    InputMessage = "Pick a sales region.",
    ErrorTitle = "Invalid region",
    ErrorMessage = "Pick one of the listed regions.",
    ErrorStyle = ValidationErrorStyle.Stop,
};
sheet.Validations.Add("A2:A100", region);
```

A list rule shows its in-cell dropdown arrow; set `ShowDropdown = false` to hide
it. `Validation.List` refuses an item containing a comma (it would become two
items); take such items from a range instead:
`new Validation(ValidationType.List) { Formula1 = "=$X$1:$X$20" }`.

Validation is metadata: Axyra Sheets stores and preserves it, and a consuming
application enforces it. Writing a value that violates a rule is not rejected —
if you need enforcement, check before writing.

# Comments

Two distinct mechanisms, both preserved:

```csharp
// Legacy note
cell.Comment = new Comment("Finance", "Adjusted after audit");
cell.SetCommentLayout(180.0, 90.0, visible: true);   // width pt, height pt, shown
cell.Comment = null;

// Modern threaded comment
ThreadedComment thread = cell.ThreadedComments.Add("alice", "Is this final?");
thread.Reply("bob", "Signed off.");
thread.Resolved = true;
```

They are separate features in the file format. `cell.Comment` will not return a
threaded comment, and `cell.ThreadedComments` will not return a note.
`Comment.Rich(author, runs…)` builds a note from formatted runs.

# Rich text

Runs of differently-formatted text within one cell:

```csharp
cell.RichText = new RichText(
    new TextRun("Total: "),
    new TextRun("overdue") { Bold = true, Color = Color.Parse("#C0392B") });

RichText? rt = cell.RichText;              // null when the cell is plain
foreach (TextRun run in rt!.Runs) { /* run.Text, run.Bold, run.Color, … */ }
```

A run sets only what it changes; everything else comes from the cell's font.

# Hyperlinks

```csharp
cell.Hyperlink = Hyperlink.Url("https://keikai.io");
cell.Hyperlink = Hyperlink.Url("https://keikai.io", "Keikai");
cell.Hyperlink = Hyperlink.Internal("Summary!A1", "Back to summary");
cell.Hyperlink = Hyperlink.Email("sales@example.com", "Quote request", "Email sales");

Hyperlink? link = cell.Hyperlink;
bool isInternal = link!.IsInternal;
bool isEmail = link.IsEmail;

cell.Hyperlink = null;                     // remove it
```

# Form controls

Checkboxes, option buttons, combo boxes, list boxes, spinners, scroll bars, and
buttons — with their linked cells:

```csharp
using Axyra.Sheets.Drawing;

FormControl approved = sheet.FormControls.Add(FormControlType.CheckBox, "H2:J3", "Approved");
approved.LinkedCell = "$K$2";
approved.Checked = true;
```

Types: `CheckBox`, `OptionButton`, `Button`, `ComboBox`, `ListBox`, `ScrollBar`,
`SpinButton`, `EditBox`, `Label`, `GroupBox`.

A control's linked cell is the bridge to the model: a checkbox writes
`TRUE`/`FALSE` into it, a combo box writes the selected index. Formulas reading
that cell recalculate as usual.

# Other content

| Member | What it covers |
|---|---|
| `sheet.SmartArts` | Diagram layouts, with colour and 3-D effects; rendered |
| `sheet.Sparklines` | In-cell mini charts — line, column, and win/loss groups |
| `wb.Slicers`, `wb.Timelines` | Pivot filter widgets — see [Pivot Tables]({{ site.axyra_dotnet_devref }}/Pivot_Table) |
| `sheet.Pictures`, `sheet.Shapes` | Pictures, shapes, text boxes, connectors |
| `wb.OleObjects` | Embedded documents, preserved verbatim |
| `wb.VbaModules` | Macro modules, readable source, preserved verbatim (not executed) |
| `wb.XmlMaps` | XML maps and their cell bindings |
| `wb.Connections` | External data connections |
| `wb.ExternalLinks` | References to other workbooks — see below |
| `sheet.ProtectedRanges`, `wb.WriteProtection` | Protection — see below |
| `wb.CustomProperties` | Workbook custom document properties |

VBA modules are **preserved, not executed**. A `.xlsm` opened and saved keeps
its macros; Axyra Sheets never runs them.

# External links

References to other workbooks, and the cached values that let them evaluate
while the other workbook is absent:

```csharp
int count = wb.ExternalLinkCount;
foreach (ExternalLink external in wb.ExternalLinks) { /* external.Name, external.SheetNames */ }
string? source = wb.ExternalLinkSource(0);
wb.SetExternalLinkSource(0, "/new/path/prices.xlsx");
wb.RemoveExternalLink(0);
```

`SetExternalLinkSource` is how you re-point a workbook whose dependencies moved
— a common need when files are processed on a server rather than in the folder
they were authored in. Both it and `RemoveExternalLink` return whether a link
existed at that index.

# Protection

Three independent levels:

```csharp
// Sheet — which cells may be edited
sheet.Protect();
sheet.Protect("pa55w0rd");
sheet.Protect("pa55w0rd", new SheetProtection { Sort = true, AutoFilter = true });   // what stays permitted

// Ranges within a protected sheet that remain editable
sheet.ProtectedRanges.Add("Editors", "B2:D50", "range-pw");
bool rangeOk = sheet.ProtectedRanges.VerifyPassword("Editors", "range-pw");
foreach (ProtectedRange pr in sheet.ProtectedRanges) { /* pr.Name, pr.Sqref */ }
sheet.ProtectedRanges.Remove("Editors");

// Workbook structure — adding, deleting, reordering sheets
wb.Protect(lockWindows: false);
wb.Protect("pa55w0rd");
bool locked = wb.IsStructureLocked;

// Workbook write protection — "open read-only unless you know the password"
wb.SetWriteProtection("pa55w0rd");
bool writeProtected = wb.IsWriteProtected;
wb.RemoveWriteProtection();
```

`sheet.Unprotect("pa55w0rd")` and `wb.Unprotect("pa55w0rd")` return `false` for a
wrong password and leave the protection in place. A cell is protected when the
sheet is protected **and** the cell's style has `Locked = true` — the default.
Unlock the cells you want editable with `new CellStyle { Locked = false }`.

Protection is enforced by consuming applications, not by the engine — the same
caveat as validation. A password here restricts editing, it does not encrypt.
Encrypting the file is the mechanism that actually keeps data out; see
[Import and Export]({{ site.axyra_dotnet_devref }}/Import_and_Export).

{: .notice--info}
**Runnable example:** [`DevRef/ContentObjectsExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/ContentObjectsExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/content-objects`.

# Next

- [Pivot Tables]({{ site.axyra_dotnet_devref }}/Pivot_Table)
- [Import and Export]({{ site.axyra_dotnet_devref }}/Import_and_Export)
