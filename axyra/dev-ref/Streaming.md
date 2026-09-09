---
title: 'Streaming Large Files'
permalink: /axyra/dev-ref/Streaming
---

{% include axyra_example.html path="devref/StreamingExample.java" %}

Two independent mechanisms for workbooks that are too large to treat casually:
a **streaming writer** for generating big files, and a **columnar backend** for
holding big sheets in memory.

# The streaming writer

`StreamWorkbook` writes rows straight to disk. It never builds the whole
workbook in memory, so its footprint is flat regardless of how many rows you
write.

```java
import io.keikai.axyra.sheets.io.*;

try (StreamWorkbook out = StreamWorkbook.create(Path.of("big.xlsx"))) {
    int header = out.addStyle(StreamStyle.defaults().withBold());
    int money  = out.addStyle(StreamStyle.defaults().withNumberFormat("#,##0.00"));

    out.startSheet("Data");

    out.row(0).addText("Region", header)
              .addText("Amount", header)
              .commit();

    for (int i = 0; i < 1_000_000; i++) {
        out.row(i + 1).addText(region(i))
                      .addNumber(amount(i), money)
                      .commit();
    }
}
```

## The rules

The constraints are what buy you the flat memory profile:

- **Write-only, forward-only.** You cannot read back a cell, and you cannot
  return to an earlier row. Rows must be written in ascending index order.
- **Styles are registered up front.** `addStyle` returns an `int` id; pass that
  id to the cell writers. `StreamStyle` deliberately covers only number format,
  bold, and italic — a full `CellStyle` would require the style table the
  streaming writer does not keep.
- **Commit every row.** The row builder is reused. Call `commit()` before asking
  for the next row, or the uncommitted values are discarded.
- **Finish the package.** `finish()` writes the trailing package parts and lets
  you surface a write error at a specific point. A normal `close()` does this
  automatically, so try-with-resources is sufficient. `isFinished()` tells you
  whether it has happened.

## Row API

```java
// Sequential — appends to the next column
out.row(i)
        .addText("APAC")
        .addNumber(1200.0, money)
        .addBoolean(true)
        .skip()
        .addDate(LocalDate.now(), dateStyle)
        .commit();

// Positional — writes at an explicit column
out.row(i + 1)
        .setText(0, "APAC")
        .setNumber(2, 1200.0, money)
        .setFormula(3, "C" + (i + 2) + "*1.05")
        .commit();
```

The sequential and positional styles can be mixed on one row; `skip()` leaves a
column blank when appending. After composing the row, call `commit()` exactly
once.

`addDate` requires a style, because a date with no number format displays as a
serial number — the API makes you supply one rather than producing output that
looks broken.

# The columnar backend

A workbook whose storage is organised by column rather than by row:

```java
Workbook wb = Workbook.createColumnar();
```

It is a full `Workbook` — everything in the API works. What differs is the
storage layout, which changes the shape of the performance curve:

| | Row-oriented (default) | Columnar |
|---|---|---|
| Wide, sparse sheets | Good | Good |
| Tall, dense, homogeneous columns | Higher memory | Substantially less memory |
| Bulk column reads and writes | Good | Faster |
| Scattered single-cell edits | Faster | Slower |

Reach for it when a sheet is tall and its columns are type-homogeneous — a data
export, a query result, a time series. For an ordinary workbook with formatting,
charts, and mixed content, the default is the better choice.

The backend is an in-memory decision and does not affect the file written. A
columnar workbook saves to an ordinary `.xlsx`.

# Reading large files

There is no streaming reader. Opening a workbook parses it into the model, so
peak memory scales with the file.

What actually helps, in order of effect:

1. **Use `Range` bulk accessors, not per-cell loops.** `numbers()` and
   `setNumbers(double[])` are one native call for a whole block and involve no
   boxing at all. This is usually the difference that matters, and it is often
   worth an order of magnitude.
2. **Use the columnar backend** when the sheet suits it.
3. **Close workbooks promptly.** They hold native memory the JVM's garbage
   collector will not reclaim for you. In a request-scoped service, a leaked
   workbook is a leak that no heap tuning will fix.
4. **Prefer `.xlsb`** for intermediate files you control. It parses faster and
   is smaller than `.xlsx`.

# Next

- [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range) — the bulk accessors
- [Import and Export]({{ site.axyra_devref }}/Import_and_Export)
