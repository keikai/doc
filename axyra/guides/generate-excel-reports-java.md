---
title: 'Automate Excel Reports in Java with Templates'
excerpt: 'Create an Excel report in Java with Axyra Sheets. Fill an XLSX template, calculate totals, render PDF, and trigger recurring reports from your scheduler.'
permalink: /axyra/guides/generate-excel-reports-java
keyword: 'excel report in java'
---

# Automate Excel Reports in Java with Templates

An Excel report in Java often needs application data and a layout that finance or operations can edit. This guide uses Axyra Sheets to fill a designed workbook with records, grouped subtotals, and totals, then save XLSX and PDF output. Keeping the layout in a template lets a report owner adjust fonts, colors, or column order without changing Java code. The same method supports automated Excel reporting when a scheduler supplies the reporting period and data.

## TL;DR

- Design the report in Excel and put template markers such as `${title}` and `${lines.amount}` in the cells where data belongs.
- Call `TemplateMarkers.process(sheet, data)` with a `Map<String, Object>`. A row whose markers point into a `List` is repeated once per record.
- Use aggregate markers such as `${lines.amount:sum}` for totals and `:group` with `:subtotal-sum` for grouped subtotals.
- Call `wb.recalculate()` before saving, then write XLSX with `save` and PDF with `renderPdf`.
- Scheduling and delivery belong to your application. Run the same method from a scheduler, a message consumer, or an HTTP endpoint.

## Table of contents

- [What is a template marker?](#what-is-a-template-marker)
- [How do you build an Excel report in Java?](#how-do-you-build-an-excel-report-in-java)
- [How do you design the report template?](#how-do-you-design-the-report-template)
- [How do you fill the template from Java?](#how-do-you-fill-the-template-from-java)
- [Which template markers are available?](#which-template-markers-are-available)
- [How do you add grouped subtotals?](#how-do-you-add-grouped-subtotals)
- [How do you generate XLSX and PDF in one run?](#how-do-you-generate-xlsx-and-pdf-in-one-run)
- [How do you run the report on a schedule?](#how-do-you-run-the-report-on-a-schedule)
- [When should you build the report in code instead?](#when-should-you-build-the-report-in-code-instead)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## What is a template marker?

A template marker is a placeholder of the form `${...}` written into a text cell of an Excel template. When you pass the template to `TemplateMarkers.process`, each marker is replaced with the value it names in a Java data map. A marker can name a single value, a field of every record in a list, or an aggregate over that list, so one template can describe a heading, a repeating detail section, and a totals row.

This approach is often called template-based reporting. It separates the two concerns of a report: the Java code decides *what* data the report contains, and the template decides *how* it looks.

## How do you build an Excel report in Java?

Start with a workbook whose cells contain markers for the values your application will supply. Query or calculate the report data, pass it to `TemplateMarkers.process`, recalculate the workbook, and save the result. The sections below show each step, including how to generate Excel reports in both editable XLSX and printable PDF formats.

## How do you design the report template?

Open Excel and design `sales-template.xlsx` with whatever fonts, fills, borders, merged cells, and charts you want. Then type markers into the cells where the data belongs. The following layout produces a simple sales report.

| | A | B | C | D |
|---|---|---|---|---|
| **1** | Sales Report `${title}` | | | |
| **2** | Region | Product | Qty | Amount |
| **3** | `${lines.region}` | `${lines.product}` | `${lines.qty}` | `${lines.amount}` |
| **4** | Total | | | `${lines.amount:sum}` |

Row 3 is the template row. All of its markers start with `lines`, and `lines` will be a `List` in the data map, so the engine repeats row 3 once for each record and inserts rows as needed. Row 4 moves down with the inserted rows, so the total always ends up directly below the data.

Format the template row the way you want every data row to look, for example with a number format on column D. Current builds copy the template row's styles to the inserted rows.

## How do you fill the template from Java?

Open the template, select its `Sales Report` worksheet by name, pass the data map
to `TemplateMarkers.process`, recalculate, and save. Selecting by name avoids an
Evaluation Mode notice sheet that may occupy index 0. The data is a
`Map<String, Object>`, and the first segment of each marker is a key in that map.
The remaining segments are resolved through map keys, record components,
JavaBean getters, or public fields.

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

    wb.recalculate();
    wb.save(Path.of("q3-sales.xlsx"));
}
```

The call to `recalculate()` is important. Row insertion and marker replacement change the cells that formulas depend on, and `save` writes the cached results without recalculating, so a report saved without this call can show stale totals.

## Which template markers are available?

The following table lists the marker forms and what each one produces.

| Marker | Meaning |
|---|---|
| `${title}` | A single value. A cell that contains exactly one marker keeps the value's type, so a number stays numeric and a boolean stays boolean. A marker mixed with other text produces text. |
| `${customer.address.city}` | A nested path. A `null` anywhere along the path renders as a blank cell. |
| `${lines.region}` | A field of each record in a list. It marks the row as a template row that repeats once per record. |
| `${lines.amount:sum}` | An aggregate over the whole list. The other aggregates are `:avg`, `:count`, `:min`, and `:max`. |
| `${lines.region:group}` | Groups the records by this field on a template row. |
| `${lines.amount:subtotal-sum}` | Placed on the row directly below a grouped template row, it produces that group's subtotal. The other forms are `-avg`, `-count`, `-min`, and `-max`. |
| `${lines.region:groupname}` | The current group's key, used on a subtotal row. |
| `${image:logo}` | Inserts a `byte[]` from the data map as a picture anchored at the cell. |

An unknown marker resolves to an empty cell instead of throwing an exception. This is convenient while you are iterating on a template, but it also means a misspelled key produces a silently empty column, so validate the data map in tests. The full grammar is in the [Template Markers reference](https://doc.keikai.io/axyra/dev-ref/Template_Markers).

### How are formulas on the template row handled?

Formulas on the template row are copied to every record row with the same rules Excel uses for fill-down. Relative references shift with the row, while `$`-anchored and sheet-qualified references stay fixed. A template row 3 that contains `=C3*D3` therefore becomes `=C4*D4`, `=C5*D5`, and so on, so you write the formula once in Excel where you can see it.

Formulas outside the repeated block are not widened. A `=SUM(D3:D3)` below the template row still covers only one cell after expansion, which is why the totals row in this guide uses the `${lines.amount:sum}` aggregate marker instead.

## How do you add grouped subtotals?

To group records, put a `:group` marker on the template row and a subtotal row directly below it.

| | A | B | C |
|---|---|---|---|
| **3** | `${lines.region:group}` | `${lines.product}` | `${lines.amount}` |
| **4** | `${lines.region:groupname}` subtotal | | `${lines.amount:subtotal-sum}` |

The engine groups the records by `region` in the order each key first appears, keeps the original record order inside each group, and emits row 4 once per group. The subtotal row is recognized only when it sits directly below a grouped template row.

{: .notice--warning}
**Check the formatting of every grouped row.** With `:group`, later data rows in a group can lose the template row's date format, and some builds have given detail rows the subtotal row's bold style. Read the saved file back in a test, and re-apply the data-row styles after `process` if you see this.

## How do you generate XLSX and PDF in one run?

The program below is a complete report job. It fills the designed template, saves an XLSX file for people who want to work with the numbers, and renders a PDF for people who only need to read them.

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

    public record Line(String region, String product, int qty, double amount) {}

    private final Path templateDir;

    public QuarterlyReport(Path templateDir) {
        this.templateDir = templateDir;
    }

    public void run(String quarter, List<Line> lines, Path outDir) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("title", quarter);
        data.put("generated", LocalDate.now());   // marker-only cells preserve the date value
        data.put("lines", lines);
        data.put("logo", Files.readAllBytes(templateDir.resolve("logo.png")));

        Path xlsx = outDir.resolve("sales-" + quarter + ".xlsx");
        Path pdf = outDir.resolve("sales-" + quarter + ".pdf");

        try (Workbook wb = Workbook.open(templateDir.resolve("sales-template.xlsx"))) {
            Sheet sheet = wb.sheet("Sales Report");

            TemplateMarkers.process(sheet, data);
            wb.recalculate();
            wb.save(xlsx);

            sheet.setPrintTitleRows("$1:$2");   // repeat the title and header on every page
            wb.renderPdf(pdf, PdfOptions.builder()
                    .title("Sales Report " + quarter)
                    .fitTo(PdfOptions.Fit.WIDTH)
                    .bookmarks(true)
                    .build());
        }
    }
}
```

The `generated` value is passed as a `LocalDate`. When the marker occupies the whole cell, `TemplateMarkers` preserves it as an Excel date serial; give that template cell a date number format such as `yyyy-mm-dd`. A marker mixed with surrounding text becomes text.

{: .notice--info}
**Keep the template outside the jar.** Load the template from a directory or an object store rather than from a classpath resource. The report owner can then replace the template file, and the next run picks up the new layout without a release.

Page setup for the PDF, such as paper size, orientation, and print area, belongs to the sheet. You can set it in the template itself or in code. See [How to Convert Excel to PDF in Java](https://doc.keikai.io/axyra/guides/convert-excel-to-pdf-java) for fonts, page setup, and watermarks.

## How do you run the report on a schedule?

Axyra Sheets produces the workbook, while scheduling, storage, email delivery, and retries remain the responsibility of your application. A monthly Excel report, for example, should query one closed accounting period and pass that period to the same report method used for an on-demand export. A scheduled Excel export can be triggered by a job scheduler or by an application framework. A schedule is often written as a [cron expression](https://en.wikipedia.org/wiki/Cron), which describes when a job runs in terms of minutes, hours, days, and months.

In a plain Java service, a `ScheduledExecutorService` is enough.

```java
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
QuarterlyReport report = new QuarterlyReport(Path.of("/srv/reports/templates"));

scheduler.scheduleAtFixedRate(() -> {
    try {
        report.run(currentQuarter(), loadLines(), Path.of("/srv/reports/out"));
    } catch (Exception e) {
        log.error("Report generation failed", e);
    }
}, 0, 1, TimeUnit.DAYS);
```

In a Spring application, annotate a method with `@Scheduled(cron = "0 0 6 * * MON")` to produce the report every Monday at 06:00. Whatever the trigger, open a separate `Workbook` for each run. A workbook is not shared between threads, and each run should start from a fresh copy of the template.

## When should you build the report in code instead?

Template markers fill a layout that is known in advance. They are not the right tool in the following situations.

| Situation | Better approach |
|---|---|
| The number or order of columns depends on the data | Build the sheet with the API, as shown in [How to Write Data to Excel in Java](https://doc.keikai.io/axyra/guides/write-data-to-excel-java) |
| The report contains millions of rows | Use the streaming writer described in [Streaming Large Files](https://doc.keikai.io/axyra/dev-ref/Streaming), because `process` works on a workbook held in memory |
| The reader needs to pivot the data interactively | Add a real pivot table, as described in [Pivot Tables](https://doc.keikai.io/axyra/dev-ref/Pivot_Table) |
| The report is a raw dump of a database query | Use the [JDBC to Excel exporter]({{ site.axyra_guides }}/export-database-to-excel-java) |

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| A value silently does not appear | The marker's first segment is not a key in the data map, and unknown markers render blank | Compare the marker path with your keys and record components |
| Only one row appears instead of one per record | The bound value is not a `List` | Pass a `List` for repeating sections |
| Totals are blank or stale in the saved file | `recalculate()` was not called after `process` | Call `wb.recalculate()` before `save` |
| A total covers only the first data row | A plain `SUM` formula below the block is not widened | Use an aggregate marker such as `${lines.amount:sum}` |
| A subtotal row was ignored | It is not directly below a template row with a `:group` marker | Move it to the row immediately below |
| A number arrives as text | The cell contains the marker plus other text | Put the marker alone in its own cell |
| A date arrives as text | The marker shares a cell with surrounding text | Put the `LocalDate` marker alone in a date-formatted cell |
| An image marker leaves the cell blank | The value is not a `byte[]` | Pass the image bytes, for example from `Files.readAllBytes` |

## FAQ

### How do I create Excel reports automatically in Java?

Design an Excel template with `${...}` markers, open it with `Workbook.open`, fill it with `TemplateMarkers.process(sheet, data)`, call `recalculate()`, and save it. Then call that method from a scheduler, a queue consumer, or a web endpoint so the report is produced without manual work.

### Can business users change the report layout without a code change?

Yes, they can, because the layout, fonts, colors, and charts live in the template file, and the Java code only supplies data. As long as the markers stay in place, the report owner can edit the template in Excel and the next run uses the new design.

### How do I add totals and subtotals to a generated Excel report?

Use an aggregate marker such as `${lines.amount:sum}` for a grand total. For subtotals, add a `:group` marker to the template row and put a row with `:subtotal-sum` and `:groupname` markers directly below it.

### Can I generate the same report as both XLSX and PDF?

Yes, both formats come from one run. After filling and recalculating the workbook, call `wb.save(path)` for the XLSX file and `wb.renderPdf(path, options)` for the PDF. Both outputs come from the same open workbook, so they always contain the same numbers.

### Does Axyra Sheets schedule or email reports by itself?

No, Axyra Sheets handles only workbook processing, which means filling, calculating, saving, and rendering. Scheduling, storage, delivery, and retries are handled by your application or framework, for example with a `ScheduledExecutorService` or Spring's `@Scheduled`.

## Next steps

- [Template Markers](https://doc.keikai.io/axyra/dev-ref/Template_Markers) is the full marker reference.
- [How to Convert Excel to PDF in Java](https://doc.keikai.io/axyra/guides/convert-excel-to-pdf-java) covers the distribution format.
- [Tables and Content Objects](https://doc.keikai.io/axyra/dev-ref/Content_Objects) explains table styles and banding for template rows.
