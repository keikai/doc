---
title: 'Spill Range Operator'
toc: false
---

{% include version-badge.html version='7.0.0' %}

# Purpose

Support the Excel **spilled-range operator** `#`. Writing `ref#` (for
example `B1#`) references the **entire** spilled range that is anchored on a given reference cell. This lets a formula depend on a
dynamic array's full result without hard-coding its size — when the source
spill grows or shrinks, every formula that reads it through `#` follows
automatically and pulls the full array.

# Overview

A dynamic array formula produces a whole array of values that *spills* out
of the cell that owns it (see
[Dynamic Array Formulas and Spill](/dev-ref/book_model/Dynamic_Array_Formulas_and_Spill)).
The `#` operator allows for easy referencing of a spilled region from a given cell. the
spilled region has no fixed address, so a plain range like `B1:B3` would
break if source array changed size.

The spilled-range operator names the region by its **anchor**. `B1#` means
"the whole array that spilled out of `B1`", whatever its current extent.
Since the operator yields an array, the referencing formula spills too.

```
  B (source spill)              D (=B1#)
+----------------------+      +----------------------+
| B1  =UNIQUE(A1:A5)   | ---> | D1  =B1#   (anchor)  |
|      -> 1  (anchor)  |      |      -> 1            |
+----------------------+      +----------------------+
| B2   2     (ghost)   |      | D2   2     (ghost)   |
+----------------------+      +----------------------+
| B3   3     (ghost)   |      | D3   3     (ghost)   |
+----------------------+      +----------------------+
```

`=B1#` in `D1` re-spills the same `{1, 2, 3}` into `D1:D3` and draws a spill
outline around the multi-cell result, exactly like the original array.

The `#` operator is the user-facing form of the internal Excel function
**`ANCHORARRAY`**. Users do not type `ANCHORARRAY(...)`, and use the `#` operator instead.
`_xlfn.ANCHORARRAY` is the display for older Excel versions for the same operator. See Microsoft's
[Spilled range operator](https://support.microsoft.com/en-us/office/spilled-range-operator-3dd5899f-bca2-4b9d-a172-3eae9ac22efd)
for the Excel reference.

# Entering a spill-range reference

There is no special call for the `#` operator — you simply use it as part of a normal formula with the existing
[`Range.setCellEditText`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html),
and read results back with
[`Range.getCellData`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html):

{% highlight java linenos %}
Sheet sheet = spreadsheet.getSelectedSheet();     // io.keikai.api.model.Sheet

// B1 owns a dynamic array; it spills {1, 2, 3} into B1:B3.
Ranges.range(sheet, "B1").setCellEditText("=UNIQUE(A1:A5)");

// D1 references the WHOLE spilled range anchored at B1.
// This re-spills {1, 2, 3} into D1:D3 with its own spill outline.
Ranges.range(sheet, "D1").setCellEditText("=B1#");

// Read back a value from the anchor or from any re-spilled (ghost) cell.
Object d2 = Ranges.range(sheet, "D2").getCellData().getValue();   // 2
{% endhighlight %}

Because `B1#` produces a dynamic-array spill array, `D1` also becomes a spill
**anchor** and `D2` / `D3` are spill **ghosts** — the same anchor + ghost
model documented on the
[Dynamic Array Formulas and Spill](/dev-ref/book_model/Dynamic_Array_Formulas_and_Spill)
page. 

## Using a spill-range reference inside another formula

The reference can be used as argument for any formula which accepts a range. Since the whole
spilled region is passed, the enclosing formula still targets the entire array when the source
array resizes.

`SUM` over the reference aggregates the full spill region. The result is a
single value, so it does **not** spill and shows no spill outline:

{% highlight java linenos %}
// Sum every value that spilled out of B1, whatever its current size.
Ranges.range(sheet, "F1").setCellEditText("=SUM(B1#)");
Object total = Ranges.range(sheet, "F1").getCellData().getValue();   // 6
{% endhighlight %}

`INDEX` picks a specific element out of the spilled range:

{% highlight java linenos %}
// The 2nd element of the range spilled from B1.
Ranges.range(sheet, "F2").setCellEditText("=INDEX(B1#, 2)");
Object second = Ranges.range(sheet, "F2").getCellData().getValue();   // 2
{% endhighlight %}

# Error semantics

The `#` operator reports two distinct errors, matching Excel:

| Error | When |
|-------|------|
| `#REF!`   | `ref` is **not a spill anchor** — it is a plain cell, an empty cell, or a spill *ghost*. Only the anchor of a spilled range is a valid `#` target. |
| `#SPILL!` | The `ref#` formula's **own** output range is blocked (obstructed target), the same as for any dynamic-array spill. |
