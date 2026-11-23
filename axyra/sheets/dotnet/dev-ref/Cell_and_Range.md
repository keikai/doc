---
title: 'Cells and Ranges (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Cell_and_Range
redirect_from:
  - /axyra/dotnet/dev-ref/Cell_and_Range
---

Two ways to reach data: `Cell` for one cell with all of its attachments, and
`CellRange` for a rectangular block. Which you pick has real performance
consequences — see [Bulk access](#bulk-access-and-performance).

# Coordinates

Row and column indices are **0-based** throughout the API: `sheet[0, 0]` is `A1`.
Formula strings, named ranges, and the string indexer `sheet["A1:C3"]` use ordinary
**1-based A1 notation**, because that is what the file format and the user see.

Anywhere the API takes a reference — `sheet["…"]`, formula text, `wb.Names.Add`,
a chart's series reference, a pivot table's source — it is the 1-based A1 form.
Anywhere it takes `int row, int column`, it is 0-based.

```csharp
CellRange block = sheet["A2:D50"];           // identical to sheet.GetRange(1, 0, 49, 3)
CellRange qualified = wb.GetRange("Summary!A1");   // a sheet-qualified reference
Cell cell = sheet[4, 2];                     // C5
```

`sheet[row, column]` returns a `Cell`; `sheet["…"]` always returns a `CellRange`,
even for one cell. The sheet indexer also takes whole columns (`"B:D"`) and whole
rows (`"2:5"`). A sheet-qualified reference belongs on `wb.GetRange`.

# CellValue

`CellValue` is a closed record hierarchy — a value is exactly one of six things:

```csharp
CellValue number = 42.0;                                  // implicit from double, int, long
CellValue text = "hello";                                 // implicit from string
CellValue flag = true;                                    // implicit from bool
CellValue blank = CellValue.Empty;
CellValue error = CellValue.OfError(CellError.DivisionByZero);   // #DIV/0!
CellValue array = CellValue.OfArray(new CellValue[,] { { 1, 2 }, { 3, 4 } });
```

Because the set is closed, a `switch` expression handles each variant explicitly:

```csharp
static string Describe(CellValue v) => v switch
{
    CellValue.Number n => "number " + n.Value,
    CellValue.Text t => "text " + t.Value,
    CellValue.Bool b => "bool " + b.Value,
    CellValue.Error e => "error " + e.Display,
    CellValue.Array a => $"{a.RowCount}×{a.ColumnCount} array",
    _ => "blank",
};
```

Read a raw value through the matching variant, such as `CellValue.Number.Value`
or `CellValue.Text.Value`, or convert it in one step with `cell.GetValue<double>()`
(throws `InvalidCastException`) or `cell.TryGetValue(out double d)` (does not).
For an error, `CellValue.Error.Display` returns its Excel error string and `Code`
the `CellError` (`DivisionByZero`, `NotAvailable`, `Value`, …). In contrast,
`Cell.FormattedText` applies the cell's number format, which is what a
spreadsheet application shows.

Values are records, so they compare by content (`CellValue.Of(7) == 7.0`) and
print readably (`Number { Value = 7 }`). A `decimal` converts only explicitly,
through `CellValue.Of(19.99m)`, because it is stored as a `double`.

## Dates

Spreadsheets store dates as serial numbers, so the API converts explicitly:

```csharp
cell.DateValue = new DateOnly(2026, 3, 1);
cell.DateTimeValue = DateTime.Now;

DateOnly? d = cell.DateValue;
DateTime? dt = cell.DateTimeValue;
```

Setting a date also applies a date number format when the cell still has
`General`. Which epoch a serial number refers to depends on the workbook's
`Date1904` setting — see
[Workbook and Sheet]({{ site.axyra_dotnet_devref }}/Workbook_and_Sheet).

# Cell

A `Cell` is the single-cell view, and it is where everything attached to one cell
lives: value, formula, style, comment, threaded comments, rich text, hyperlink.

```csharp
Cell cell = sheet[4, 2];

cell.Value = 1499.0;
cell.Formula = "SUM(B2:B50)";
string? formula = cell.Formula;          // the formula text, or null
string shown = cell.FormattedText;
cell.Clear();

cell.Style = style;
cell.RichText = richText;
cell.Hyperlink = Hyperlink.Url("https://keikai.io");
cell.Comment = new Comment("Finance", "Adjusted after audit");
```

A `Cell` knows where it is: `cell.Sheet`, `cell.Row`, `cell.Column`, and
`cell.Address` (`"C5"`). The attachments use the types of the
`Axyra.Sheets.Content` and `Axyra.Sheets.Style` namespaces; assigning `null`
removes a comment or a hyperlink.

## Localized formulas

For a UI that shows function names and argument separators in the user's
language:

```csharp
cell.SetLocalizedFormula("SUMME(B2:B50)", "de-DE");
string? shownInGerman = cell.GetLocalizedFormula("de-DE");
```

The stored formula is always canonical English; localization is a presentation
concern applied on the way in and out.

## Threaded comments

Modern Excel comments are threads with replies and a resolved flag, distinct from
legacy notes:

```csharp
ThreadedComment thread = cell.ThreadedComments.Add("alice", "Is this final?");
thread.Reply("bob", "Yes, signed off.");
thread.Resolved = true;

foreach (ThreadedComment tc in cell.ThreadedComments) { /* ... */ }
```

`cell.Comment = new Comment(author, text)` writes a **legacy note** instead. The
two coexist in the file format; do not expect one API to see the other's content.

# Range

```csharp
CellRange r = sheet.GetRange(1, 0, 49, 3);     // rows 1–49, columns 0–3
CellRange same = sheet["A2:D50"];

int rows = r.RowCount, columns = r.ColumnCount;
int top = r.FirstRow, right = r.LastColumn;
```

`CellRange` is the type's name rather than `Range`, so it never collides with
`System.Range` under implicit usings.

## Bulk access and performance

Every `Cell` read or write crosses into the native engine. Every `CellRange` call
crosses once for the whole block. For anything beyond a handful of cells, this
is the difference that matters:

```csharp
// One native call for 49 × 4 cells
CellValue[,] values = r.GetValues();
r.SetValues(values);

// Faster still when everything is numeric — no boxing, no CellValue
double[,] numbers = r.GetNumbers();
r.SetNumbers(numbers);

string?[,] formulas = r.GetFormulas();
r.SetFormulas(formulas);
```

Blocks are rectangular arrays indexed `[row, column]` from the range's top-left
cell, and their shape must match the range exactly. `SetValues` also takes an
`object?[,]` of plain .NET values — numbers, strings, booleans, `DateOnly`,
`DateTime`, and `null` for a blank. `SetNumbers` also takes a row-major
`ReadOnlySpan<double>` (an array, a slice of a larger buffer), the right choice for
loading a matrix out of a database.

`GetNumbers()` returns `NaN` for every cell that is not a number (blank, text,
boolean, error), and `SetNumbers` writes a `NaN` as a blank cell. Like
`SetValues`, it keeps each cell's style, comment, and hyperlink. In
`SetFormulas`, a `null` entry leaves the cell unchanged and an empty string clears
it.

## Formulas over a range

```csharp
CellRange totals = sheet["E2:E50"];
totals.SetFormula("C2*D2");                                // E3 gets C3*D3, E4 gets C4*D4, …
sheet["G1:I3"].SetArrayFormula("MMULT(A1:C3, A5:C7)");     // one legacy CSE array formula
string? spilled = sheet["K1"].SpillRange();                // the area a dynamic array spilled into
```

`SetFormula` behaves like typing a formula into a selection with Ctrl+Enter:
relative references shift for each cell, `$`-anchored ones stay fixed. To extend
existing cells the way Excel's fill handle does, use `AutoFill(destination)`, copy
a source with `CopyTo(sheet, row, column)`, or write each cell's own formula with
`SetFormulas`; all of them keep `$`-anchored references fixed. `SetArrayFormula`
writes a single formula occupying the whole range. Modern dynamic arrays spill on
their own — see [Formulas]({{ site.axyra_dotnet_devref }}/Formulas).

## Operations

```csharp
r.Sort(new SortKey(0), new SortKey(2, Ascending: false));
r.Sort(0);                                     // one column, ascending
r.SortLeftToRight(new SortKey(0));             // sort columns instead of rows
r.Sort(new SortKey(1) { CustomOrder = new[] { "High", "Medium", "Low" } });

sheet["A2:D2"].AutoFill(sheet["A2:D20"]);      // extend row 2 down
r.RemoveDuplicates(new[] { 0, 1 }, hasHeader: true);

r.CopyTo(otherSheet, 0, 0);
r.CopyTo(otherSheet, 0, 0, PasteType.Values);  // paste-special

r.Merge();
r.Unmerge();
r.AutoMerge(true);
```

Column numbers inside a range operation (sort keys, duplicate keys) count from the
range's first column, not the sheet's. `AutoFill` follows Excel's fill handle: the
destination must be on the same sheet and extend the source along one axis. It
continues numeric series, repeats text, and shifts relative references in
formulas.

`CopyTo` with a `PasteType` covers paste-special: `Values`, `Formulas`, `Formats`,
or `Comments`. Without it, everything is copied.

## Attaching content

In .NET the things you attach to a block are added through the sheet's collections,
which take the range:

```csharp
r.Style = style;
r.ApplyNamedStyle("Currency");
sheet.Validations.Add(r, validation);
sheet.ConditionalFormats.Add(r, rule);
sheet.Tables.Add("Sales", sheet["G1:J50"], "Region", "Q1", "Q2", "Total");
```

See [Styles]({{ site.axyra_dotnet_devref }}/Styles) and
[Content Objects]({{ site.axyra_dotnet_devref }}/Content_Objects).

# Importing .NET objects

`Sheet.ImportData` writes a collection of objects as rows, reading properties by
name:

```csharp
var sales = new List<Sale> { new("APAC", 1200, 1450), new("EMEA", 980, 1100) };

int written = sheet.ImportData(0, 0, sales, new ImportOptions
{
    Columns = new[] { "Region", "Q1", "Q2" },
    Headers = true,
    ColumnLabels = new[] { "Region", "Q1", "Q2" },
    HeaderStyle = boldStyle,
});

record Sale(string Region, double Q1, double Q2);
```

Returns the number of rows written, including the header row. Without `Columns`,
a record's properties are written in declaration order, and a dictionary's keys
in the order first met, but a plain class's public properties are written in
**alphabetical** order — pin the column list explicitly whenever the order
matters or the class may gain properties later. `DateOnly` and `DateTime` values
become date serials; apply a date number format to those columns.

For filling an existing template rather than writing a fresh block, see
[Template Markers]({{ site.axyra_dotnet_devref }}/Template_Markers).

{: .notice--info}
**Runnable example:** [`DevRef/CellAndRangeExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/CellAndRangeExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/cell-and-range`.
