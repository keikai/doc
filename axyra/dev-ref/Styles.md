---
title: 'Styles and Formats'
permalink: /axyra/dev-ref/Styles
---

# CellStyle

`CellStyle` is an immutable value built through a builder, and applied to a cell,
a range, a row, or a column.

```java
import io.keikai.axyra.sheets.style.*;

CellStyle header = CellStyle.builder()
        .fontName("Calibri")
        .fontSize(11)
        .bold(true)
        .fontColor(Color.rgb(0xFF, 0xFF, 0xFF))
        .fill(Color.rgb(0x2C, 0x3E, 0x50))
        .horizontalAlign(HAlign.CENTER)
        .verticalAlign(VAlign.CENTER)
        .wrapText(true)
        .build();

sheet.range("A1:D1").setStyle(header);
```

Being immutable, a style is safely shared across cells and threads. To derive a
variant, use `toBuilder()`:

```java
CellStyle headerRight = header.toBuilder().horizontalAlign(HAlign.RIGHT).build();
```

## Applying styles

```java
cell.setStyle(style);
range.setStyle(style);
sheet.setRowStyle(0, style);
sheet.setColumnStyle(0, style);
```

Row and column styles are the defaults for cells that have none of their own,
and are the cheap way to style a whole column without touching every cell.

## Named styles

Register a style once on the workbook and apply it by name. Named styles are
written to the file, so they appear in Excel's style gallery:

```java
wb.registerNamedStyle("Currency", currencyStyle);
sheet.range("C2:C100").applyNamedStyle("Currency");

wb.hasNamedStyle("Currency");
wb.updateNamedStyle("Currency", revised);   // repaints every cell using it
wb.removeNamedStyle("Currency");
```

`updateNamedStyle` is the reason to prefer named styles for anything a user might
restyle later — one call changes every cell that references it.

## Serializing a style

```java
String json = style.toJson();
CellStyle restored = CellStyle.fromJson(json);
```

Useful for caching styles outside the workbook, or for shipping a style
definition through your own configuration.

# Colors

Five ways to specify a colour, and the distinction is not cosmetic:

```java
Color.rgb(0xC0, 0x39, 0x2B);      // literal RGB
Color.argb(0x80, 0xC0, 0x39, 0x2B);
Color.of(0xFFC0392B);             // packed ARGB
Color.parse("#C0392B");
Color.indexed(10);                // legacy indexed palette (.xls)
Color.theme(4);                   // a theme slot — follows the workbook theme
Color.theme(4, -0.25);            // a theme slot, shaded 25% darker
Color.auto();                     // "automatic" — resolved by the consumer
```

Prefer `Color.theme(...)` for anything that should follow the workbook's theme.
An RGB literal is frozen; a theme colour changes when the theme does, which is
what a user expects when they switch a workbook's theme.

`Color.indexed(...)` exists for legacy `.xls` fidelity. Do not use it in new
workbooks.

## Fills

```java
.fill(Color.parse("#2C3E50"))                                  // solid
.fillPattern(PatternType.LIGHT_GRID, foreground, background)   // patterned
.gradientFill(90, Color.parse("#FFFFFF"), Color.parse("#4A90D9"))
.pathGradientFill(Color.parse("#FFFFFF"), Color.parse("#4A90D9"))
```

`PatternType` covers Excel's eighteen fill patterns; `SOLID` with `fill(...)` is
the common case.

# Borders

Borders are per-edge. `Side` is `LEFT`, `RIGHT`, `TOP`, `BOTTOM`, or `DIAGONAL`:

```java
CellStyle boxed = CellStyle.builder()
        .border(Side.TOP,    BorderStyle.THIN,   Color.parse("#333333"))
        .border(Side.BOTTOM, BorderStyle.DOUBLE, Color.parse("#333333"))
        .build();

CellStyle grid = CellStyle.builder()
        .allBorders(BorderStyle.THIN, Color.parse("#CCCCCC"))
        .build();
```

`BorderStyle` runs from `HAIR` through `THIN`, `MEDIUM`, `THICK`, `DOUBLE`, and
the dashed and dash-dot variants. A diagonal border also needs
`diagonalUp(true)` or `diagonalDown(true)` to say which way it runs.

The engine resolves conflicts between neighbouring cells the way a spreadsheet
application does — the heavier style wins on a shared edge — so you do not need
to set both sides of a boundary.

# Themes

A theme supplies the colour slots and the major/minor fonts that theme-relative
styles resolve against:

```java
Theme theme = Theme.builder()
        .majorFont("Georgia")
        .minorFont("Calibri")
        .color(Theme.Slot.ACCENT1, Color.parse("#2C3E50"))
        .color(Theme.Slot.HYPERLINK, Color.parse("#0563C1"))
        .build();
```

The slots are `DARK1`, `LIGHT1`, `DARK2`, `LIGHT2`, `ACCENT1`–`ACCENT6`,
`HYPERLINK`, and `FOLLOWED_HYPERLINK` — the same twelve Excel exposes.

Changing the theme repaints every theme-relative colour in the workbook, and
leaves RGB literals alone.

# Number formats

A cell's *value* and its *display* are separate. The number format code maps one
to the other, using Excel's format-code syntax:

```java
CellStyle money = CellStyle.builder()
        .numberFormat("#,##0.00;[Red](#,##0.00)")
        .build();

CellStyle date = CellStyle.builder().numberFormat("yyyy-mm-dd").build();
```

`Cell.formattedText()` returns the formatted string. Read the raw value through
the matching `CellValue` variant accessor, such as `CellValue.Number.value()`.
For dates, currencies, percentages, and anything with a conditional section,
these differ — which is the usual cause of "the number is wrong" reports that
turn out to be a format question.

## Formatting outside a workbook

`Formats` applies a format code without needing a cell, which is handy for
rendering the same values in your own UI:

```java
import io.keikai.axyra.sheets.format.Formats;

Formats.format(1234.5, "#,##0.00");             // "1,234.50"
Formats.format(1234.5, "#,##0.00", "de-DE");    // "1.234,50"
```

## Parsing user input

`Formats.parse` applies the same coercion a spreadsheet does when a user types
into a cell — recognising numbers, dates, times, percentages, currencies, and
booleans, and reporting the format code it inferred:

```java
ParsedValue pv = Formats.parse("31/12/2026");
```

Use it when you accept free-text input and want spreadsheet-compatible behaviour
rather than your own parsing rules.

# Next

- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range)
- [Content Objects]({{ site.axyra_devref }}/Content_Objects) — conditional
  formats apply styles based on cell values
