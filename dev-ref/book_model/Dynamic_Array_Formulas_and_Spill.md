---
title: 'Dynamic Array Formulas and Spill'
toc: false
---

{% include version-badge.html version='7.0.0' %}

# Purpose

Support Excel 365 / Excel 2021 **dynamic array formulas**: a single formula
that returns more than one value automatically "spills" its result into the
neighbouring cells, and Keikai lets you enter, evaluate, import/export, and
inspect these spilled ranges from Java.

# Overview

Historically a formula produced exactly one value in the cell that evaluated it.
A **dynamic array formula** can return a whole array of values from one
formula, and that array *spills* into the cells below and to the right of the
formula cell. You write the formula once; Keikai fills in the rest.

Two roles describe the cells of a spilled result:

- The **anchor** is the single cell that owns the formula and produces the
  array.
- The **ghosts** are the auto-filled cells that display the projected
  values. A ghost holds **no formula of its own** — it only mirrors a slice
  of the anchor's result.

```
=UNIQUE(A1:A4) entered in C1
                                 spilled result (dynamic array)
  A          C                   +---------+
+-----+    +--------------+      | C1  anchor  -> owns =UNIQUE(A1:A4) |
| red |    | =UNIQUE(..)  | C1   | C2  ghost   -> projected "green"   |
+-----+    +--------------+      | C3  ghost   -> projected "blue"    |
| green|   |  (spills)    | C2   +---------+
+-----+    +--------------+
| blue |   |  (spills)    | C3
+-----+    +--------------+
| red  |
+-----+
```

If the range the array needs to occupy is **blocked** — a non-empty cell, a
merged region, or a cell inside an Excel Table sits in the way — the array
cannot spill. The anchor then shows a `#SPILL!` error instead of a result.

Dynamic-array spill is **not** the same thing as a legacy CSE (array) formula
(the ones entered with Ctrl+Shift+Enter). The distinction matters when you
query the model, so it has [its own section](#dynamic-array-spill-vs-legacy-cse-arrays)
below.

Dynamic-array evaluation is provided by the Rust engine (`axyra-sheets`). On a
non-engine backend the dynamic-array query methods described here return their
neutral defaults (`false` / `null` / empty list).

# Entering a spill formula

There is **no special "array entry" call** for dynamic arrays. You enter a
normal formula which returns an array, and it spills on its own from that cell. Use
the existing [`Range.setCellEditText`](https://keikai.io/javadoc/latest/io/keikai/api/Range.html)
on the anchor cell:

{% highlight java linenos %}
Sheet sheet = spreadsheet.getSelectedSheet();      // io.keikai.api.model.Sheet
Range anchor = Ranges.range(sheet, "C1");          // io.keikai.api.Range

// A single formula; the result spills down into C2, C3, ... automatically.
anchor.setCellEditText("=UNIQUE(A1:A10)");

// Read back a value — from the anchor or from any spilled (ghost) cell.
Object c2 = Ranges.range(sheet, "C2").getCellData().getValue();
{% endhighlight %}

## Spill-producing functions

Any formula resulting is an array will spill. The functions most commonly
used to produce a spill are:

| Function | Spills |
|----------|--------|
| `UNIQUE` | the distinct values of a range |
| `SORT` / `SORTBY` | a range sorted by its own values or by a key range |
| `FILTER` | the rows/columns of a range that match a condition |
| `SEQUENCE` | a generated grid of sequential numbers |
| `RANDARRAY` | a generated grid of random numbers |

Keikai also recognises the wider Excel 365 dynamic-array and lookup family,
including `XLOOKUP`, `XMATCH`, `LET`, `LAMBDA`, `SEQUENCE`, `CHOOSECOLS`,
`CHOOSEROWS`, `DROP`, `EXPAND`, `HSTACK`, `VSTACK`, `TAKE`, `TOCOL`, `TOROW`,
`WRAPCOLS`, `WRAPROWS`, `BYROW`, `BYCOL`, `MAKEARRAY`, `MAP`, `REDUCE`,
`SCAN`, `TEXTAFTER`, `TEXTBEFORE`, `TEXTSPLIT`, `VALUETOTEXT`, and
`ARRAYTOTEXT`. Those that return more than one value spill in the same way.

## Implicit intersection with `@`

Excel 365 uses the `@` operator for **implicit intersection** — telling a
formula to take the single value at the intersection of the current row/column
rather than spilling the whole array. Keikai evaluates the `@` operator so
that formulas authored in Excel 365 keep their meaning when imported and when
entered directly, e.g. `=@A1:A10`.

# Inspecting spill state from the model

The spill roles are exposed on
[`io.keikai.model.SCell`](https://keikai.io/javadoc/latest/io/keikai/model/SCell.html).
Reach the model sheet from a live component through the API bridge, the same
pattern used elsewhere in the model layer:

{% highlight java linenos %}
Sheet apiSheet = spreadsheet.getSelectedSheet();       // io.keikai.api.model.Sheet
SSheet sheet   = apiSheet.getInternalSheet();          // io.keikai.model.SSheet
SCell c1 = sheet.getCell(0, 2);                        // C1
{% endhighlight %}

The dynamic-array predicates (all **@since 7.0.0**):

{% highlight java linenos %}
boolean anchor = c1.isDaSpillAnchor();   // true ONLY on the formula-owning cell
boolean ghost  = c1.isDaSpillGhost();    // true on a projected (auto-filled) cell
boolean inDa   = c1.isInDaSpill();       // convenience: anchor OR ghost
{% endhighlight %}

- `isDaSpillAnchor()` is `true` on exactly one cell of a spill — the one that
  holds the formula.
- `isDaSpillGhost()` is `true` on the projected cells; the anchor returns
  `false` here.
- `isInDaSpill()` is simply `isDaSpillAnchor() || isDaSpillGhost()`.

## Reading the formula off a ghost

A ghost cell carries no formula of its own, but the formula bar still shows
the anchor's formula when a ghost is selected. Two accessors expose formula
text, differing in how they treat OOXML-internal prefixes:

{% highlight java linenos %}
String raw  = c1.getFormulaValue();       // e.g. "_xlfn.UNIQUE(A1:A10)"        (OOXML round-trip form)
String edit = c1.getFormulaEditValue();   // e.g. "UNIQUE(A1:A10)"              (formula-bar form)
{% endhighlight %}

- `getFormulaValue()` keeps the raw `_xlfn.` / `_xlws.` prefixes that the
  OOXML writer needs for Excel fidelity.
- `getFormulaEditValue()` strips the `_xlfn.` / `_xlws.` / `_xlpm.` prefixes
  so the text matches what the user sees in the formula bar.

# Dynamic-array spill vs legacy CSE arrays

Keikai supports two distinct kinds of array formula, and the model API keeps
them separate.

A **legacy CSE array** is created explicitly over a chosen region by calling
`SSheet.setCseArrayFormula(formula, region)`, and every cell in that region
becomes a member of the CSE array group. The cells report their state as *CSE
membership*.

A **dynamic-array spill** is not created through an API, but simply by entering a formula which returns an array. This arrays spills automatically to the neighbouring cells. The cells take on *anchor* and *ghost* roles — the anchor owns the formula and the ghosts mirror the projected values.

`SCell` provides a matching pair of query APIs so you can ask specifically
about CSE, specifically about dynamic arrays, or about **either**:

{% highlight java linenos %}
// Legacy CSE only:
boolean cse         = c1.isCseMember();       // @since 7.0.0
CellRegion cseRgn   = c1.getCseRegion();      // @since 7.0.0, or null

// Unified — matches a CSE array OR a dynamic-array spill:
boolean inArray     = c1.isInArrayRegion();   // @since 7.0.0
CellRegion arrayRgn = c1.getArrayRegion();    // @since 7.0.0, or null
{% endhighlight %}

The older methods still work but are **deprecated since 7.0.0** because their names do not say whether they mean CSE or dynamic arrays:

- `SCell.getArrayFormulaRegion()` → use `getCseRegion()` (CSE) or
  `getArrayRegion()` (unified).
- `SCell.isPartOfArrayFormulaGroup()` → use `isCseMember()` (CSE) or
  `isInArrayRegion()` (unified).
- `SSheet.setArrayFormula(formula, region)` → use `setCseArrayFormula(...)`.
  (This installs a **legacy CSE** array; it does **not** create a
  dynamic-array spill.)
- `SSheet.removeArrayFormula(cell)` → use `removeCseArrayFormula(cell)`.
- `SSheet.getAllArrayFormulas()` → use `getAllCseRegions()`.

# Painting spill outlines: viewport queries

For rendering the spill outline (the thin border Excel draws around a spilled
range), `SSheet` reports the spill ranges that overlap a viewport rectangle
(**@since 7.0.0**):

{% highlight java linenos %}
// zero-based, inclusive rectangle
List<SSheet.SpillRangeInfo> spills = sheet.getSpillRangesInViewport(0, 0, 49, 25);

for (SSheet.SpillRangeInfo info : spills) {
    // info.top / info.left / info.bottom / info.right — the range extent
    // info.phantom == false -> a successful spill
    // info.phantom == true  -> a blocked #SPILL! spill
}
{% endhighlight %}

`SpillRangeInfo` is a small immutable holder: `top`, `left`, `bottom`,
`right` (zero-based, inclusive) and a `phantom` flag. `phantom` is `false`
for a successful spill and `true` for a blocked `#SPILL!` spill.

# Supported operations

Dynamic-array spills behave consistently across the common editing and I/O
operations:

- **Import / export** — spilled formulas round-trip through `.xlsx`.
- **Copy / paste and cut / paste** of a spill range.
- **Insert / delete rows and columns** — the array re-spills to fit.
- **Sort and filter**.
- **Undo / redo**.
- **`@` implicit intersection**.
- **`#SPILL!`** is raised when the target range is obstructed, including when
  the spill would land inside an Excel Table.

# Current limitations

- **Spill can be blocked.** If the target range is obstructed by a non-empty
  cell, a merged region, or an Excel Table, the anchor yields `#SPILL!`
  rather than a result. Clear the obstruction to let the array spill.
- **`getAllArrayFormulas()` / `getAllCseRegions()` cover legacy CSE only.**
  They do not report dynamic-array spills, and (per their javadoc) they may
  also miss XLSX-imported CSE regions that live only in the engine core. For a
  dynamic-array outline, use `getSpillRangesInViewport(...)`; for a complete
  CSE outline within a viewport, use `getCseRegionsInViewport(...)`.
