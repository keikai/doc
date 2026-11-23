---
title: 'Automate Excel Reports in C# with Templates'
excerpt: 'Create an Excel report in C# and .NET with Axyra Sheets. Fill an XLSX template, calculate totals, render PDF, and run recurring reports from a .NET background service.'
permalink: /axyra/sheets/dotnet/guides/generate-excel-reports-csharp
redirect_from:
  - /axyra/dotnet/guides/generate-excel-reports-csharp
keyword: 'excel report in C#'
sidebar:
  nav: "axyra-dotnet-guides"
---

# Automate Excel Reports in C# with Templates

An Excel report in C# often needs application data and a layout that finance or operations can edit. This guide uses Axyra Sheets to fill a designed workbook with records, grouped subtotals, and totals, then save XLSX and PDF output. Keeping the layout in a template lets a report owner adjust fonts, colors, or column order without changing C# code. The same method supports automated Excel reporting when a scheduler supplies the reporting period and data.

## TL;DR

- Design the report in Excel and put template markers such as `${title}` and `${lines.amount}` in the cells where data belongs.
- Call `TemplateMarkers.Process(sheet, data)` with a `Dictionary<string, object?>` or an anonymous object. A row whose markers point into a `List<T>` is repeated once per record.
- Use aggregate markers such as `${lines.amount:sum}` for totals and `:group` with `:subtotal-sum` for grouped subtotals.
- Call `wb.Recalculate()` before saving, then write XLSX with `Save` and PDF with `SavePdf`.
- Scheduling and delivery belong to your application. Run the same method from a `BackgroundService`, a message consumer, or an ASP.NET Core endpoint.

## Table of contents

- [What is a template marker?](#what-is-a-template-marker)
- [How do you build an Excel report in C#?](#how-do-you-build-an-excel-report-in-c)
- [How do you design the report template?](#how-do-you-design-the-report-template)
- [How do you fill the template from C#?](#how-do-you-fill-the-template-from-c)
- [Which template markers are available?](#which-template-markers-are-available)
- [How do you add grouped subtotals?](#how-do-you-add-grouped-subtotals)
- [How do you generate XLSX and PDF in one run?](#how-do-you-generate-xlsx-and-pdf-in-one-run)
- [How do you run the report on a schedule?](#how-do-you-run-the-report-on-a-schedule)
- [When should you build the report in code instead?](#when-should-you-build-the-report-in-code-instead)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## What is a template marker?

A template marker is a placeholder of the form `${...}` written into a text cell of an Excel template. When you pass the template to `TemplateMarkers.Process`, each marker is replaced with the value it names in your data. A marker can name a single value, a property of every record in a list, or an aggregate over that list, so one template can describe a heading, a repeating detail section, and a totals row.

This approach is often called template-based reporting. It separates the two concerns of a report: the C# code decides *what* data the report contains, and the template decides *how* it looks.

## How do you build an Excel report in C#?

Start with a workbook whose cells contain markers for the values your application will supply. Query or calculate the report data, pass it to `TemplateMarkers.Process`, recalculate the workbook, and save the result. The sections below show each step, including how to generate Excel reports in both editable XLSX and printable PDF formats.

## How do you design the report template?

Open Excel and design `sales-template.xlsx` with whatever fonts, fills, borders, merged cells, and charts you want. Then type markers into the cells where the data belongs. The following layout produces a simple sales report.

| | A | B | C | D |
|---|---|---|---|---|
| **1** | Sales Report `${title}` | | | |
| **2** | Region | Product | Qty | Amount |
| **3** | `${lines.region}` | `${lines.product}` | `${lines.qty}` | `${lines.amount}` |
| **4** | Total | | | `${lines.amount:sum}` |

Row 3 is the template row. All of its markers start with `lines`, and `lines` will be a `List<T>` in the data, so the engine repeats row 3 once for each record and inserts rows as needed. Row 4 moves down with the inserted rows, so the total always ends up directly below the data.

Format the template row the way you want every data row to look, for example with a number format on column D. Every emitted row takes the template row's cell formats.

## How do you fill the template from C#?

Open the template, select its `Sales Report` worksheet by name, pass the data
to `TemplateMarkers.Process`, recalculate, and save. Selecting by name avoids an
Evaluation Mode notice sheet that may occupy index 0. The data is a
`Dictionary<string, object?>`, and the first segment of each marker is a key in it.
The remaining segments are resolved through dictionary keys, public properties
(record properties included), or public fields. A segment matches the property
with the same name or its PascalCase form, so `${lines.region}` reads a record's
`Region` property.

```csharp
using Axyra.Sheets;
using Axyra.Sheets.Template;

using Workbook wb = Workbook.Open("sales-template.xlsx");
TemplateMarkers.Process(wb.Sheets["Sales Report"], new Dictionary<string, object?>
{
    ["title"] = "Q3 2026",
    ["lines"] = new List<Line>
    {
        new("APAC", "Widget", 12, 51.00),
        new("APAC", "Gadget", 3, 27.00),
        new("EMEA", "Widget", 8, 34.00),
    },
});

wb.Recalculate();
wb.Save("q3-sales.xlsx");

public sealed record Line(string Region, string Product, int Qty, double Amount);
```

The data can also be any object whose public properties are the top-level keys, which suits an anonymous type: `TemplateMarkers.Process(sheet, new { title = "Q3 2026", lines })`.

A repeating section must be a list such as `List<T>`, **not an array**. An array in the data is not treated as a list, so `${lines.region}` over a `Line[]` resolves as an unknown marker and renders blank.

Calling `Recalculate()` once after `Process` is cheap insurance. Marker replacement and row insertion go through the normal cell API, so formulas that depend on the filled cells update as usual; but the template came from a file, so a formula the fill does not touch keeps the result Excel stored in the template, and `Save` writes cached results without recalculating.

## Which template markers are available?

The following table lists the marker forms and what each one produces.

| Marker | Meaning |
|---|---|
| `${title}` | A single value. A cell that contains exactly one marker keeps the value's type, so a number stays numeric and a `bool` stays boolean. A marker mixed with other text produces text. |
| `${customer.address.city}` | A nested path. A `null` anywhere along the path renders as a blank cell. |
| `${lines.region}` | A property of each record in a list. It marks the row as a template row that repeats once per record. |
| `${lines.amount:sum}` | An aggregate over the whole list. The other aggregates are `:avg`, `:count`, `:min`, and `:max`. |
| `${lines.region:group}` | Groups the records by this property on a template row. |
| `${lines.amount:subtotal-sum}` | Placed on the row directly below a grouped template row, it produces that group's subtotal. The other forms are `-avg`, `-count`, `-min`, and `-max`. |
| `${lines.region:groupname}` | The current group's key, used on a subtotal row. |
| `${image:logo}` | Inserts a `byte[]` from the data as a picture anchored at the cell. |

An unknown marker resolves to an empty cell instead of throwing an exception. This is convenient while you are iterating on a template, but it also means a misspelled key produces a silently empty column, so validate the data in tests. The full grammar is in the [Template Markers reference]({{ site.axyra_dotnet_devref }}/Template_Markers).

### How are formulas on the template row handled?

Formulas on the template row are copied to every record row with the same rules Excel uses for fill-down. Relative references shift with the row, while `$`-anchored references stay fixed. A template row 3 that contains `=C3*D3` therefore becomes `=C4*D4`, `=C5*D5`, and so on, so you write the formula once in Excel where you can see it.

Formulas outside the repeated block are not widened. A `=SUM(D3:D3)` below the template row still covers only one cell after expansion, which is why the totals row in this guide uses the `${lines.amount:sum}` aggregate marker instead.

## How do you add grouped subtotals?

To group records, put a `:group` marker on the template row and a subtotal row directly below it.

| | A | B | C |
|---|---|---|---|
| **3** | `${lines.region:group}` | `${lines.product}` | `${lines.amount}` |
| **4** | `${lines.region:groupname}` subtotal | | `${lines.amount:subtotal-sum}` |

The engine groups the records by `Region` in the order each key first appears, keeps the original record order inside each group, and emits row 4 once per group. The subtotal row is recognized only when it sits directly below a grouped template row.

{: .notice--warning}
**Check the formatting of every grouped row.** With `:group`, detail rows after the first one can come out with the subtotal row's style, for example bold, instead of the template row's. Read the saved file back in a test, and re-apply the data-row styles after `Process` if you see this. Without `:group`, every emitted row takes the template row's formats.

## How do you generate XLSX and PDF in one run?

The class below is a complete report job. It fills the designed template, saves an XLSX file for people who want to work with the numbers, and renders a PDF for people who only need to read them. Opening, saving, and rendering use the `…Async` methods, so the job does not block a thread-pool thread while the engine works.

```csharp
using Axyra.Sheets;
using Axyra.Sheets.IO;
using Axyra.Sheets.Template;

public sealed class QuarterlyReport(string templateDir)
{
    public sealed record Line(string Region, string Product, int Qty, double Amount);

    public async Task RunAsync(string quarter, List<Line> lines, string outDir,
        CancellationToken cancellationToken = default)
    {
        var data = new Dictionary<string, object?>
        {
            ["title"] = quarter,
            ["generated"] = DateOnly.FromDateTime(DateTime.Today),   // marker-only cells keep the date value
            ["lines"] = lines,
            ["logo"] = await File.ReadAllBytesAsync(Path.Combine(templateDir, "logo.png"), cancellationToken),
        };

        string xlsx = Path.Combine(outDir, $"sales-{quarter}.xlsx");
        string pdf = Path.Combine(outDir, $"sales-{quarter}.pdf");

        using Workbook wb = await Workbook.OpenAsync(
            Path.Combine(templateDir, "sales-template.xlsx"), cancellationToken: cancellationToken);
        Sheet sheet = wb.Sheets["Sales Report"];

        TemplateMarkers.Process(sheet, data);
        wb.Recalculate();
        await wb.SaveAsync(xlsx, cancellationToken: cancellationToken);

        sheet.PageSetup.PrintTitleRows = "$1:$2";   // repeat the title and header on every page
        await wb.SavePdfAsync(pdf, new PdfOptions
        {
            Title = "Sales Report " + quarter,
            FitTo = PdfFit.Width,
            Bookmarks = true,
        }, cancellationToken);
    }
}
```

The `generated` value is passed as a `DateOnly`. When the marker occupies the whole cell, `TemplateMarkers` stores it as an Excel date serial; give that template cell a date number format such as `yyyy-mm-dd`. A marker mixed with surrounding text becomes text. `DateTime` and `DateTimeOffset` work the same way.

{: .notice--info}
**Keep the template out of the assembly.** Load the template from a directory or a blob store rather than from an embedded resource. The report owner can then replace the template file, and the next run picks up the new layout without a redeployment. To produce many reports from one template in parallel, read the template once with `File.ReadAllBytes` and open one workbook per report with `Workbook.Open(bytes, WorkbookFormat.Xlsx)`.

Page setup for the PDF, such as paper size, orientation, and print area, belongs to the sheet. You can set it in the template itself or in code. See [How to Convert Excel to PDF in C#]({{ site.axyra_dotnet }}/guides/convert-excel-to-pdf-csharp) for fonts, page setup, and watermarks.

The .NET examples project has a runnable version of this flow that builds its own template and writes `sales-Q3-2026.xlsx` and `sales-Q3-2026.pdf`: `src/Axyra.Sheets.Examples/Guides/GenerateReportExample.cs`, run with `dotnet run --project src/Axyra.Sheets.Examples -- guides/generate-report`.

## How do you run the report on a schedule?

Axyra Sheets produces the workbook, while scheduling, storage, email delivery, and retries remain the responsibility of your application. A monthly Excel report, for example, should query one closed accounting period and pass that period to the same report method used for an on-demand export. A scheduled Excel export can be triggered by a job scheduler or by the application host. A schedule is often written as a [cron expression](https://en.wikipedia.org/wiki/Cron), which describes when a job runs in terms of minutes, hours, days, and months.

In an ASP.NET Core application or a Worker Service, a `BackgroundService` with a `PeriodicTimer` is enough:

```csharp
public sealed class DailyReportService(QuarterlyReport report, ILogger<DailyReportService> log)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromDays(1));
        do
        {
            try
            {
                List<QuarterlyReport.Line> lines = await LoadLinesAsync(stoppingToken);
                await report.RunAsync(CurrentQuarter(), lines, "/srv/reports/out", stoppingToken);
            }
            catch (Exception e) when (e is not OperationCanceledException)
            {
                log.LogError(e, "Report generation failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
```

Register it in `Program.cs`:

```csharp
builder.Services.AddSingleton(new QuarterlyReport("/srv/reports/templates"));
builder.Services.AddHostedService<DailyReportService>();
```

For calendar schedules, a job library such as Quartz.NET or Hangfire takes a cron expression, for example `0 6 * * MON` to produce the report every Monday at 06:00. Whatever the trigger, open a separate `Workbook` for each run. A workbook is not shared between threads, and each run should start from a fresh copy of the template.

## When should you build the report in code instead?

Template markers fill a layout that is known in advance. They are not the right tool in the following situations.

| Situation | Better approach |
|---|---|
| The number or order of columns depends on the data | Build the sheet with the API, as shown in [How to Write Data to Excel in C#]({{ site.axyra_dotnet }}/guides/write-data-to-excel-csharp) |
| The report contains millions of rows | Use the streaming writer `StreamWorkbook`, described in [Streaming Large Files]({{ site.axyra_dotnet_devref }}/Streaming), because `Process` works on a workbook held in memory |
| The reader needs to pivot the data interactively | Add a real pivot table, as described in [Pivot Tables]({{ site.axyra_dotnet_devref }}/Pivot_Table) |
| The report is a raw dump of a database query | Map the query to records and use `Sheet.ImportData`, as shown in [How to Write Data to Excel in C#]({{ site.axyra_dotnet }}/guides/write-data-to-excel-csharp#sources) |

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| A value silently does not appear | The marker's first segment is not a key in the data, and unknown markers render blank | Compare the marker path with your keys and property names |
| Only one row appears instead of one per record, or the row is blank | The bound value is an array or another non-list type | Pass a `List<T>` for repeating sections |
| Totals are blank or stale in the saved file | `Recalculate()` was not called after `Process` | Call `wb.Recalculate()` before `Save` |
| A total covers only the first data row | A plain `SUM` formula below the block is not widened | Use an aggregate marker such as `${lines.amount:sum}` |
| A subtotal row was ignored | It is not directly below a template row with a `:group` marker | Move it to the row immediately below |
| A number arrives as text | The cell contains the marker plus other text | Put the marker alone in its own cell |
| A date arrives as text | The marker shares a cell with surrounding text | Put the `DateOnly` marker alone in a date-formatted cell |
| An image marker leaves the cell blank | The value is not a `byte[]` | Pass the image bytes, for example from `File.ReadAllBytesAsync` |
| The second report from the same workbook is wrong | `Process` changes the sheet in place | Open a fresh copy of the template for every report |

## FAQ

### How do I create Excel reports automatically in C#?

Design an Excel template with `${...}` markers, open it with `Workbook.Open` or `Workbook.OpenAsync`, fill it with `TemplateMarkers.Process(sheet, data)`, call `Recalculate()`, and save it. Then call that method from a `BackgroundService`, a queue consumer, or an ASP.NET Core endpoint so the report is produced without manual work.

### Can business users change the report layout without a code change?

Yes, they can, because the layout, fonts, colors, and charts live in the template file, and the C# code only supplies data. As long as the markers stay in place, the report owner can edit the template in Excel and the next run uses the new design.

### How do I add totals and subtotals to a generated Excel report?

Use an aggregate marker such as `${lines.amount:sum}` for a grand total. For subtotals, add a `:group` marker to the template row and put a row with `:subtotal-sum` and `:groupname` markers directly below it.

### Can I generate the same report as both XLSX and PDF?

Yes, both formats come from one run. After filling and recalculating the workbook, call `wb.Save(path)` for the XLSX file and `wb.SavePdf(path, options)` for the PDF. Both outputs come from the same open workbook, so they always contain the same numbers.

### Does Axyra Sheets schedule or email reports by itself?

No, Axyra Sheets handles only workbook processing, which means filling, calculating, saving, and rendering. Scheduling, storage, delivery, and retries are handled by your application or framework, for example with a hosted `BackgroundService`, Quartz.NET, or Hangfire.

## Next steps

- [Template Markers]({{ site.axyra_dotnet_devref }}/Template_Markers) is the full marker reference.
- [How to Convert Excel to PDF in C#]({{ site.axyra_dotnet }}/guides/convert-excel-to-pdf-csharp) covers the distribution format.
- [Tables and Content Objects]({{ site.axyra_dotnet_devref }}/Content_Objects) explains table styles and banding for template rows.
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_sheets }}/contact-sales), and [product details]({{ site.axyra_site_link }}).
