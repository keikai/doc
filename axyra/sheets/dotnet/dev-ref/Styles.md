---
title: 'Styles and Formats (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Styles
redirect_from:
  - /axyra/dotnet/dev-ref/Styles
---

# CellStyle

`CellStyle` is an immutable record, built with an object initializer and applied
to a cell, a range, a row, or a column. The style types live in the
`Axyra.Sheets.Style` namespace.

```csharp
using Axyra.Sheets.Style;

var header = new CellStyle
{
    Font = new Font
    {
        Name = "Calibri",
        Size = 11,
        Bold = true,
        Color = Color.FromRgb(0xFF, 0xFF, 0xFF),
    },
    Fill = Color.FromRgb(0x2C, 0x3E, 0x50),     // a Color is a solid fill
    HorizontalAlignment = HorizontalAlignment.Center,
    VerticalAlignment = VerticalAlignment.Center,
    WrapText = true,
};

sheet["A1:D1"].Style = header;
```

A style groups its attributes the way Excel does: `Font`, `Fill`, and `Borders`
are nested records, while alignment, number format, and protection sit on
`CellStyle` itself. Being immutable, a style is safely shared across cells and
threads. To derive a variant, use `with`:

```csharp
CellStyle headerRight = header with { HorizontalAlignment = HorizontalAlignment.Right };
CellStyle headerItalic = header with { Font = header.Font with { Italic = true } };
```

**Applying a style replaces the cell's whole style.** A property you leave out of
the initializer takes the engine default (Calibri 11, no fill, no borders,
`General`); it does not keep what the cell had. To change one attribute of a
styled cell, start from its current style:

```csharp
CellStyle current = sheet["B2"].Style;
sheet["B2"].Style = current with { NumberFormat = "0.00" };
```

Styles are records, so two styles built with the same attributes are equal and
print readably. If `System.Drawing` is also imported, alias the colour
type: `using Color = Axyra.Sheets.Style.Color;`.

## Applying styles

```csharp
cell.Style = style;
range.Style = style;
sheet.Rows[0].Style = style;
sheet.Columns[0].Style = style;
```

Row and column styles are the defaults for cells that have none of their own,
and are the cheap way to style a whole column without touching every cell.
Assigning `null` to a row's or column's `Style` clears it. The engine also dedups
identical styles internally, so applying one style to a million cells is cheap.

## Named styles

Register a style once on the workbook and apply it by name. Named styles are
written to the file, so they appear in Excel's style gallery:

```csharp
wb.RegisterNamedStyle("Currency", currencyStyle);
sheet["C2:C100"].ApplyNamedStyle("Currency");

bool exists = wb.HasNamedStyle("Currency");
wb.UpdateNamedStyle("Currency", revised);   // repaints every cell using it
wb.RemoveNamedStyle("Currency");
```

`UpdateNamedStyle` is the reason to prefer named styles for anything a user might
restyle later — one call changes every cell that references it. Applying a name
that was never registered does nothing.

## Keeping styles outside the workbook

A `CellStyle` is an ordinary immutable .NET object, so you can cache it in a
static field or a dictionary and apply it to any number of workbooks. The .NET
API has no counterpart of the Java `CellStyle.toJson()` / `fromJson()` pair; to
ship a style definition through your own configuration, store its few properties
(font, colours as `"#RRGGBB"`, number format) and build the record from them.

# Colors

Several ways to specify a colour, and the distinction is not cosmetic:

```csharp
Color literal = Color.FromRgb(0xC0, 0x39, 0x2B);          // literal RGB
Color withAlpha = Color.FromArgb(0x80, 0xC0, 0x39, 0x2B);
Color packed = Color.FromArgb(unchecked((int)0xFFC0392B));  // packed ARGB
Color? parsed = Color.Parse("#C0392B");                   // null when not a colour
Color legacy = Color.FromIndex(10);                       // legacy indexed palette (.xls)
Color accent = Color.FromTheme(4);                        // a theme slot — follows the workbook theme
Color darker = Color.FromTheme(4, -0.25);                 // a theme slot, shaded 25% darker
Color automatic = Color.Automatic;                        // "automatic" — resolved by the consumer
```

Prefer `Color.FromTheme(...)` for anything that should follow the workbook's
theme. An RGB literal is frozen; a theme colour changes when the theme does,
which is what a user expects when they switch a workbook's theme. A colour read
back from a cell keeps its kind: inspect it with `IsRgb`, `IsTheme`, `IsIndexed`,
and `IsAuto`.

`Color.FromIndex(...)` exists for legacy `.xls` fidelity. Do not use it in new
workbooks. `Color.Black`, `White`, `Red`, `Green`, `Blue`, `Yellow`, and `Gray`
are predefined.

## Fills

```csharp
var solid = new CellStyle { Fill = Color.Parse("#2C3E50")! };
var patterned = new CellStyle
{
    Fill = new Fill { Pattern = PatternType.LightGrid, Foreground = Color.Black, Background = Color.White },
};
var linear = new CellStyle { Fill = GradientFill.Linear(90, Color.White, Color.FromRgb(0x4A, 0x90, 0xD9)) };
var radial = new CellStyle { Fill = GradientFill.Path(Color.White, Color.FromRgb(0x4A, 0x90, 0xD9)) };
```

`PatternType` covers Excel's eighteen fill patterns; a plain `Color` (a solid
fill) is the common case.

# Borders

Borders are per-edge. Each edge is a `BorderEdge(style, color)`:

```csharp
var boxed = new CellStyle
{
    Borders = new Borders
    {
        Top = new BorderEdge(BorderStyle.Thin, Color.Parse("#333333")),
        Bottom = new BorderEdge(BorderStyle.Double, Color.Parse("#333333")),
    },
};

var grid = new CellStyle { Borders = Borders.Around(BorderStyle.Thin, Color.FromRgb(0xCC, 0xCC, 0xCC)) };
```

`Borders.Around` puts the same edge on all four sides of each cell, so applied to
a range it draws a full grid. `BorderStyle` runs from `Hair` through `Thin`,
`Medium`, `Thick`, `Double`, and the dashed and dash-dot variants. A `Diagonal`
edge is drawn top-left to bottom-right unless you set `DiagonalUp = true` (and
`DiagonalDown = true` as well for a cross). Read one edge back with
`style.Borders.Top` or `style.Borders[Side.Top]`.

The engine resolves conflicts between neighbouring cells the way a spreadsheet
application does — the heavier style wins on a shared edge — so you do not need
to set both sides of a boundary.

# Themes

A theme supplies the colour slots and the major/minor fonts that theme-relative
styles resolve against:

```csharp
wb.Theme = new Theme { MajorFont = "Georgia", MinorFont = "Calibri" }
    .WithColor(Theme.Slot.Accent1, Color.Parse("#2C3E50")!)
    .WithColor(Theme.Slot.Hyperlink, "0563C1");          // or six hex digits
```

The slots are `Dark1`, `Light1`, `Dark2`, `Light2`, `Accent1`–`Accent6`,
`Hyperlink`, and `FollowedHyperlink` — the same twelve Excel exposes. `Theme` is a
record; `WithColor` returns a changed copy.

Changing the theme repaints every theme-relative colour in the workbook, and
leaves RGB literals alone.

# Number formats

A cell's *value* and its *display* are separate. The number format code maps one
to the other, using Excel's format-code syntax:

```csharp
var money = new CellStyle { NumberFormat = "#,##0.00;[Red](#,##0.00)" };
var date = new CellStyle { NumberFormat = "yyyy-mm-dd" };
```

`Cell.FormattedText` returns the formatted string. Read the raw value through the
matching `CellValue` variant, such as `CellValue.Number.Value`, or with
`cell.GetValue<double>()`. For dates, currencies, percentages, and anything with a
conditional section, these differ — which is the usual cause of "the number is
wrong" reports that turn out to be a format question.

## Formatting outside a workbook

`Formats` applies a format code without needing a cell, which is handy for
rendering the same values in your own UI:

```csharp
using Axyra.Sheets.Format;

string us = Formats.Format(1234.5, "#,##0.00");             // "1,234.50"
string german = Formats.Format(1234.5, "#,##0.00", "de-DE"); // "1.234,50"
```

## Parsing user input

`Formats.Parse` applies the same coercion a spreadsheet does when a user types
into a cell — recognising numbers, dates, times, percentages, currencies, and
booleans:

```csharp
ParsedValue pv = Formats.Parse("2026-12-31");   // Kind = Date, Number = the date serial
ParsedValue pct = Formats.Parse("50%");         // Kind = Number, Number = 0.5
```

`ParsedValue.Kind` is `Number`, `Date`, `Bool`, `Text`, or `Formula`. Use it when
you accept free-text input and want spreadsheet-compatible behaviour rather than
your own parsing rules.

{: .notice--info}
**Runnable example:** [`DevRef/StylesExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/StylesExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/styles`.

# Next

- [Cells and Ranges]({{ site.axyra_dotnet_devref }}/Cell_and_Range)
- [Content Objects]({{ site.axyra_dotnet_devref }}/Content_Objects) — conditional
  formats apply styles based on cell values
