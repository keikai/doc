---
title: 'Automatic Array Lifting'
toc: false
---

{% include version-badge.html version='7.0.0' %}

# Purpose

Support Excel 365 **automatic array lifting** (also called *broadcasting*): when
an ordinary single-result function receives a **range or array** where it
expects a single value, Keikai 7.0.0+ maps the function over every element and
*spills* the results into the neighbouring cells — instead of collapsing the
input to one value or returning `#VALUE!`.

# Overview

A function such as `ISNUMBER`, `ABS`, or `ROUND` was designed to take **one**
value and return **one** value. Historically, providing such a function a
multi-cell range was unsupported: implicit intersection reduced the range to a
single value in some cells and produced a `#VALUE!` error in others, depending
on the position of the formula cell. With Excel 365 dynamic arrays, the same formula
instead *lifts* over the range: it is evaluated once per element and the whole
result array spills, exactly like a purpose-built dynamic-array function
(see [Dynamic Array Formulas and Spill](/dev-ref/book_model/Dynamic_Array_Formulas_and_Spill)).

Consider a **source range** of nine cells (`A1:I1`) used in the **formula**
`=ISNUMBER(A1:I1)`. The table below contrasts the two behaviours when that same
formula is typed into two different **formula cells** — one inside the source
columns, one outside them:

| Legacy Excel (2007 / 2016), Keikai before 7.0.0 | Excel 365, Keikai 7.0.0 and higher |
|----------------------------|--------------|
| Formula cell inside the source columns: returns a single `TRUE` — implicit intersection reduces the range to the one value in the formula's own column. | Same formula cell becomes a **spill anchor**: the result lifts and spills nine values across the row (the anchor plus eight spilled cells). |
| Formula cell outside the source columns: returns `#VALUE!` — there is no row/column to intersect. | Same behaviour as above — a nine-value spill anchored on the formula cell. |
| Position-dependent; the result changes with where the formula sits. | Identical spill wherever the formula is entered. |

Before dynamic arrays support, a single value argument in a formula receiving a range
would either return a result based on a single intersecting element for some formulas, or a `#VALUE!` error in others. Under dynamic arrays the formula does not collapse
at all — it lifts and spills the full array, so every formula cell stays consistent.

# Per-argument lifting: scalar vs non-scalar slots

Whether a function lifts is decided **per argument**, not per function. Every
argument of every supported function is declared as one of two kinds:

| Argument kind | The slot expects | An array supplied there is |
|---------------|------------------|----------------------------|
| **scalar** | a single value | mapped **element-wise** (the function lifts, and the result spills) |
| **non-scalar** | a whole range / array | **consumed as-is** (the function does not lift) |

- A **scalar slot** wants one value. Put an array there and the function is
  evaluated once per element; the collected results spill. Example:
  `ISNUMBER(value)`, `ABS(number)`, `ROUND(number, digits)`.
- A **non-scalar slot** wants an entire collection or reference. An array there
  is passed through whole and the function returns its usual single value.
  Example: `SUM(range)`, `COUNT(range)`.

Because a function can mix the two kinds, lifting is naturally correct for
functions that take both a single value and a range:

| Function | Scalar slot(s) | Non-scalar slot(s) | Effect of an array in the scalar slot |
|----------|----------------|--------------------|---------------------------------------|
| `VLOOKUP(lookup_value, table_array, col_index, [range_lookup])` | `lookup_value`, `col_index` | `table_array` | one lookup per supplied key; results spill |
| `SUMIFS(sum_range, criteria_range, criteria, ...)` | `criteria` | `sum_range`, `criteria_range` | one sum per criterion; results spill |

# Examples

Enter the formula with the existing
[`Range.setCellEditText`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html);
there is no special "array" call. A scalar-slot function fed a range spills on
its own:

{% highlight java linenos %}
Sheet sheet = spreadsheet.getSelectedSheet();          // io.keikai.api.model.Sheet

// SOURCE cells: a range holding the input values (e.g. A1:I1).
// FORMULA cell: ISNUMBER expects one value, but is fed the whole range,
// so it lifts. The formula cell becomes the spill ANCHOR and the result
// spills into the adjacent cells (the spilled GHOST cells).
Ranges.range(sheet, "A2").setCellEditText("=ISNUMBER(A1:I1)");

// Read the value back from the anchor or from any spilled (ghost) cell.
Object anchor = Ranges.range(sheet, "A2").getCellData().getValue();   // anchor value
Object ghost  = Ranges.range(sheet, "B2").getCellData().getValue();   // a spilled value
{% endhighlight %}

Lifting is not limited to a literal range argument — any sub-expression that
evaluates to an array triggers it. `IF` lifts over an array **condition**,
producing one result per element:

{% highlight java linenos %}
// SOURCE cells hold the input values; the condition (source range > 2) is
// itself an array, so IF lifts. The FORMULA cell anchors the spill and the
// per-element results spill into the neighbouring GHOST cells.
Ranges.range(sheet, "A8").setCellEditText("=IF(A7:C7>2,\"big\",\"small\")");
{% endhighlight %}

Lifted functions **compose** — a lifted result can feed another scalar
function, and the whole chain spills once (e.g. `=IF(ISNUMBER(A2:A6),1,0)`,
where the inner `ISNUMBER` lifts over the source range and `IF` lifts over its
array result).

Because a non-scalar slot consumes the range whole, an aggregate does **not**
spill — it returns a single value in its own formula cell. This also collapses a
lifted array back to one value when an aggregate wraps it:

{% highlight java linenos %}
// FORMULA cell: SUM's argument is non-scalar, so the source range is consumed
// as-is and SUM returns one value in this single cell — no spill, no ghosts.
Ranges.range(sheet, "K1").setCellEditText("=SUM(A1:I1)");
Object total = Ranges.range(sheet, "K1").getCellData().getValue();    // single number

// FORMULA cell: ABS lifts over the source range, then SUM (non-scalar)
// collapses the lifted array to a single number — again, no spill.
Ranges.range(sheet, "K2").setCellEditText("=SUM(ABS(A1:I1))");
{% endhighlight %}

The spill follows the **orientation of the source range**: a horizontal source
range spills across a row, a vertical source range spills down a column.

The spilled result of a lifted formula uses the same **anchor / ghost** model
and the same model-inspection APIs (`isDaSpillAnchor()`, `isDaSpillGhost()`,
`getSpillRangesInViewport(...)`) documented on the
[Dynamic Array Formulas and Spill](/dev-ref/book_model/Dynamic_Array_Formulas_and_Spill)
page.

# Relationship to implicit intersection

Legacy single-value behaviour is what Excel calls **implicit intersection** —
picking the one value on the formula's own row or column. Under dynamic arrays a
formula lifts and spills by default; to *opt back in* to a single value you use
the `@` implicit-intersection operator, e.g. `=@ISNUMBER(A1:I1)`. Keikai
evaluates `@` so that formulas authored in older Excel keep their single-value
meaning when imported. See the
[Implicit intersection with `@`](/dev-ref/book_model/Dynamic_Array_Formulas_and_Spill#implicit-intersection-with-)
section for details.

# Migration note

Workbooks built for pre-dynamic-array Excel (2007, 2016) might rely on implicit
intersection returning a single value from a range argument. After upgrading,
such formulas **spill** instead. If you need the old single-value result,
prefix the formula with `@` (implicit intersection) or reference a single cell
rather than a range.