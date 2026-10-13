---
title: 'How to Create Excel Reports Automatically in Java'
permalink: /axyra/guides/generate-excel-reports-java
---

Generating Excel reports automatically in Java helps teams produce recurring
sales summaries, invoices, and operational reports from current application
data. In this guide, we’ll use Axyra Sheets for Java to fill a reusable Excel
template with records, grouped data, and totals, then save the report as XLSX
and PDF. Keeping the layout in a template lets report authors adjust its
appearance in Excel while the Java code supplies the data.

That is what **template markers** do. A marker is `${...}` in a text cell of a
template you hand to `TemplateMarkers.process`.

# The template

Design `sales-template.xlsx` in Excel with whatever fonts, colors, borders,
merges, and charts you want. Name the sheet **Sales Report** and put markers
where the data belongs:

| | A | B | C | D |
|---|---|---|---|---|
| **1** | Sales Report — `${title}` | | | |
| **2** | Region | Product | Qty | Amount |
| **3** | `${lines.region}` | `${lines.product}` | `${lines.qty}` | `${lines.amount}` |
| **4** | Total | | | `${lines.amount:sum}` |

Row 3 is a **template row**: because its markers all start with `lines`, and
`lines` resolves to a `List`, the row is repeated once per record, inserting rows
as needed. Row 4 slides down accordingly.

# Filling it

```java
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.template.TemplateMarkers;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

record Line(String region, String product, int qty, double amount) {}

try (Workbook wb = Workbook.open(Path.of("sales-template.xlsx"))) {
    TemplateMarkers.process(wb.sheet("Sales Report"), Map.of(
            "title", "Q3 2026",
            "lines", List.of(
                    new Line("APAC", "Widget", 12, 51.00),
                    new Line("APAC", "Gadget", 3, 27.00),
                    new Line("EMEA", "Widget", 8, 34.00))));

    wb.recalculate();   // refresh template formulas that process did not touch
    wb.save(Path.of("q3-sales.xlsx"));
}
```

The data is a `Map<String, Object>`. Each marker's leading segment is a key in
it; the rest of the path resolves through map keys, record components, JavaBean
getters, or public fields.

Look the template sheet up by name rather than with `wb.sheet(0)`: a file saved
in Evaluation Mode starts with an extra **Axyra Evaluation Copy** sheet, so index
`0` would not be your template.

The markers write values and the formulas on the template row are filled down and
calculated as they are inserted. `recalculate()` is there for the template's
other formulas, which keep the results cached in the template file until
recalculated.

# What the markers can do

| Marker | Meaning |
|---|---|
| `${title}` | Scalar. A cell that is *exactly* one marker keeps the value's type — number stays numeric, boolean stays boolean, and a `LocalDate` becomes a date formatted `yyyy-mm-dd`. A marker embedded in other text yields text. |
| `${customer.address.city}` | Nested path. A `null` anywhere along the chain renders blank. |
| `${lines.region}` | List field — marks the template row, repeated per record. |
| `${lines.amount:sum}` | Aggregate over the whole list. Also `:avg`, `:count`, `:min`, `:max`. |
| `${lines.region:group}` | Group the records by that field on a template row. |
| `${lines.amount:subtotal-sum}` | On the row directly below a grouped template row: that group's subtotal. Also `-avg`, `-count`, `-min`, `-max`. |
| `${lines.region:groupname}` | The current group's key, on a subtotal row. |
| `${image:logo}` | Insert a `byte[]` as a picture anchored at the cell. |

Unknown markers resolve to empty rather than failing, which is forgiving during
template iteration and worth remembering when a value silently does not appear.

## Formulas on the template row

Formulas are copied to every record row with Excel fill-down semantics:
row-relative references shift by the record offset, while `$`-anchored and
sheet-qualified references stay put. So a template row 3 containing `=C3*D3`
becomes `=C4*D4`, `=C5*D5`, and so on — you write the formula once, in Excel,
where you can see it.

## Grouping with subtotals

Template row with a `:group` marker, subtotal row immediately below it:

| | A | B | C |
|---|---|---|---|
| **3** | `${lines.region:group}` | `${lines.product}` | `${lines.amount}` |
| **4** | `${lines.region:groupname}` subtotal | | `${lines.amount:subtotal-sum}` |

Records are grouped in stable first-appearance key order, keeping their original
order inside each group, and row 4 is emitted once per group.

{: .notice--warning}
**A subtotal row is only recognized directly under a grouped template row.**
Inserted rows copy the template row's cell styles, so put the formatting you
want on the template row itself.
Banding that alternates between rows has to come from a table style or a
conditional format in the template.

# The complete program

A scheduled job that pulls the quarter's rows, fills the designed template,
renders a PDF for distribution, and writes both.

```java
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.io.PdfOptions;
import io.keikai.axyra.sheets.template.TemplateMarkers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QuarterlyReport {

    record Line(String region, String product, int qty, double amount) {}

    private static final Path TEMPLATE = Path.of("templates/sales-template.xlsx");

    public void run(String quarter, List<Line> lines, Path outDir) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("title", quarter);
        data.put("generated", LocalDate.now());
        data.put("lines", lines);
        data.put("logo", Files.readAllBytes(Path.of("assets/logo.png")));

        Path xlsx = outDir.resolve("sales-" + quarter + ".xlsx");
        Path pdf = outDir.resolve("sales-" + quarter + ".pdf");

        try (Workbook wb = Workbook.open(TEMPLATE)) {
            Sheet sheet = wb.sheet("Sales Report");   // by name, not index

            TemplateMarkers.process(sheet, data);
            wb.recalculate();   // refresh template formulas that process did not touch

            sheet.setPrintTitleRows("$1:$2");   // title + header on every page
            wb.save(xlsx);

            wb.renderPdf(pdf, PdfOptions.builder()
                    .title("Sales Report " + quarter)
                    .fitTo(PdfOptions.Fit.WIDTH)
                    .bookmarks(true)
                    .build());
        }
    }
}
```

Open the template in Excel, change a color, save it — the next run picks it up.
No Java changes, no redeploy.

{: .notice--info}
**Keep the template out of the code path.** Load it from a directory or object
store rather than a classpath resource baked into the jar, and whoever owns the
report's appearance can change it without a release.

# When to build in code instead

Template markers fill a designed layout. They are the wrong tool when:

- **The shape is not known in advance** — a variable number of columns, a
  pivot whose fields depend on the data. Build it with the API; see
  [How to Write Data to Excel in Java]({{ site.axyra_guides }}/write-data-to-excel-java).
- **The export is enormous.** `process` works on an open workbook in memory.
  For millions of rows, stream instead — see
  [Streaming Large Files]({{ site.axyra_devref }}/Streaming).
- **You need a real pivot table, not a grouped list.** See
  [Pivot Tables]({{ site.axyra_devref }}/Pivot_Table).

# Common mistakes

| Symptom | Cause |
|---|---|
| A marker stays as literal `${...}` text | The cell was never processed: `process` was given a different sheet (for example `wb.sheet(0)` on a file with an evaluation sheet in front), or the marker is not plain text in the cell. Unknown keys render blank, not literal. |
| A value silently does not appear | Same cause, from the other direction: unknown markers resolve to empty rather than failing. Verify the path against your record components. |
| Only one row appears instead of many | The bound value is not a `List`, or a different list marker won the row. One list binds per template row. |
| A subtotal row was ignored | It must sit directly below a template row carrying a `:group` marker. |
| A number arrives as text | The cell contained the marker plus other text. A cell that is exactly one marker preserves the type. |
| An image marker left the cell blank | The value was not a `byte[]`. |

# Next steps

- [Template Markers]({{ site.axyra_devref }}/Template_Markers) — the full marker reference
- [How to Convert Excel to PDF in Java]({{ site.axyra_guides }}/convert-excel-to-pdf-java) — distribution format
- [Pivot Tables]({{ site.axyra_devref }}/Pivot_Table) — real pivots rather than grouped lists
- [Tables and Content Objects]({{ site.axyra_devref }}/Content_Objects) — table styles and banding for template rows

# Beyond a Single Report Template

Once a template can be filled from Java, your application can run the same
process for different customers, departments, or reporting periods. Combine
Axyra Sheets with your application's scheduler and delivery logic to generate
updated XLSX and PDF reports on demand or at regular intervals. Charts, pivot
tables, and image rendering can extend the output with visual summaries and
previews, turning a template-based report into a broader spreadsheet automation
workflow.
