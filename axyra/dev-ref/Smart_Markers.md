---
title: 'Smart Markers'
permalink: /axyra/dev-ref/Smart_Markers
---

Smart markers are a templating layer: design a spreadsheet in Excel with
`${...}` placeholders, then fill it from a Java `Map` at runtime. Your report
layout lives in a file your users can edit, not in your code.

```java
import io.keikai.axyra.sheets.template.SmartMarkers;

try (Workbook wb = Workbook.open(Path.of("invoice-template.xlsx"))) {
    Map<String, Object> data = Map.of(
            "customer", customer,          // a record, bean, or Map
            "lines", lineItems,            // a List
            "logo", logoBytes);

    SmartMarkers.process(wb.sheet(0), data);
    wb.recalculateDirty();
    wb.renderPdf(Path.of("invoice.pdf"));
}
```

Every marker in the sheet's used range is processed in one pass.

# Marker kinds

## Scalar and nested paths

```
${name}
${customer.address.city}
```

Each hop resolves through a `Map` key, a record component, a JavaBean getter, or
a public field — in that order. A `null` anywhere along the chain renders as a
blank cell, so a partially-populated object does not break the report.

A cell that is **exactly** one marker keeps the value's type — a number stays a
number, a boolean stays a boolean. A marker embedded in surrounding text
(`Dear ${customer.name},`) yields text. This distinction matters if you intend
to sum the column afterwards.

## Lists

```
${people.name}   ${people.dept}   ${people.age}
```

A row containing `${list.field}` markers is a **template row** bound to
`data.get("list")`. The row is repeated once per record, inserting rows as
needed.

- Static text and values on the template row are copied to every record row.
- Formula cells get Excel fill-down semantics: row-relative references shift by
  the record offset, while `$`-anchored and sheet-qualified references stay put.
- One list binds per template row — the first `${list.field}` marker whose
  leading segment resolves to a `List` wins.

## Aggregates

```
${people.age:sum}
```

Also `:avg`, `:count`, `:min`, `:max`. An aggregate evaluates over the whole
list and may sit in any cell that is *not* a template row — a totals row below
the table, or a summary block elsewhere on the sheet.

`:count` counts non-null values of any type. The numeric aggregates render blank
when the field has no numeric values at all, rather than zero — blank is honest
about "nothing to average"; zero is not.

## Grouping and subtotals

```
${people.dept:group}          ← on the template row
${people.age:subtotal-sum}    ← on the row immediately below
```

`:group` groups the records by that field: keys in stable first-appearance
order, original record order within each group. A **subtotal row** placed
immediately below the template row is emitted once per group, carrying that
group's aggregate. Subtotal markers are `:subtotal-sum`, `-avg`, `-count`,
`-min`, `-max`, and `${people.dept:groupname}` prints the group's key.

A subtotal row is only recognised directly under a grouped template row.

## Images

```
${image:logo}
${image:people.photo}     ← on a template row, one image per record
```

The value must be a `byte[]`. It is inserted as a picture with a one-cell anchor
at that cell, defaulting to 1 × 0.75 inch, and the cell itself is blanked. A
non-`byte[]` value simply blanks the cell.

# A worked example

Template:

| | A | B | C |
|---|---|---|---|
| **1** | `${image:logo}` | Invoice for `${customer.name}` | |
| **2** | Item | Qty | Amount |
| **3** | `${lines.item}` | `${lines.qty}` | `=B3*1.05` |
| **4** | **Total** | | `${lines.amount:sum}` |

```java
record Line(String item, int qty, double amount) {}

Map<String, Object> data = Map.of(
        "logo", Files.readAllBytes(Path.of("logo.png")),
        "customer", Map.of("name", "Acme Corp"),
        "lines", List.of(
                new Line("Widget", 12, 51.0),
                new Line("Gadget", 3, 27.0)));

SmartMarkers.process(wb.sheet(0), data);
```

Row 3 repeats twice, `=B3*1.05` becomes `=B3*1.05` and `=B4*1.05`, and the total
in row 5 sums the amounts.

# Behaviour worth knowing

- **Unknown markers resolve to empty**, not to an error. A template referring to
  a field your data does not carry produces a blank cell. Convenient for
  optional fields; quiet when you have a typo — check the output.
- **Cell styles are not copied to inserted rows.** Style the template row via
  its row style, or apply styling after processing.
- **Markers are text, so processing is destructive.** `process` rewrites the
  sheet. Open the template fresh for each render rather than reusing a processed
  workbook.
- **Recalculate afterwards.** Filled-down formulas are formulas; they hold no
  value until you recalculate.

# When to use something else

Smart markers are built entirely on the public read/write API, and they are the
right tool when a non-programmer owns the layout. When the layout is fixed and
lives in code, `Sheet.importData` is more direct — see
[Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range).
