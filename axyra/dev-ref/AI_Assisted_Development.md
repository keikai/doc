---
title: 'AI-Assisted Development'
permalink: /axyra/dev-ref/AI_Assisted_Development
excerpt: 'Use the Axyra Sheets skill to generate, migrate, build, and verify Java spreadsheet workflows with an AI coding assistant.'
---
# AI-friendly API

Axyra’s APIs are designed and refined for clarity, making them easier for AI coding agents to understand and use. For example, a method named `get` can be misleading if it also modifies data. We test how coding agents interpret and use our APIs, then refine them to reduce such ambiguity. The Axyra Agent Skill complements this API design with guidance grounded in official documentation and verified examples.

# Axyra Agent Skill

Use the **Axyra Sheets skill** with an AI coding assistant to build Java
spreadsheet workflows or migrate existing spreadsheet code. Grounded in Axyra
documentation, verified examples, and guidance for avoiding common mistakes, the
skill helps the assistant generate code that fits the Axyra API and your project.

AI assistance is a development workflow, not a separate Axyra API. The generated
application uses the same `io.keikai.axyra.sheets.*` classes as manually written
code.

The skill covers Excel import and export, template reports, formulas, charts,
pivots, PDF and image rendering, streaming exports, licensing issues, and
migration from Aspose.Cells, Apache POI, or another spreadsheet library. It was
verified against Axyra Sheets `1.0.0.FL.20261022-Eval`.

# Get the Axyra Sheets skill

Choose the installation method that fits your coding assistant:

<div class="axyra-install-options">
  <section class="axyra-install-option">
    <h2>Agent Skills CLI</h2>
    <p>Install from the Agent Skills marketplace into a supported coding assistant:</p>
    {% capture agent_skill_install %}npx skills add https://github.com/keikai/doc/tree/master/skills/axyra-sheets{% endcapture %}
    {% include copy_code.html code=agent_skill_install language="shell" event="copy_agent_skill_install" %}
  </section>
  <section class="axyra-install-option">
    <h2>Download ZIP</h2>
    <p>Download the folder and install it manually in your assistant's skill directory.</p>
    <a class="btn btn--success"
       href="{{ '/assets/downloads/axyra-sheets-skill.zip' | relative_url }}"
       download data-ga-event="download_agent_skill" data-download-trigger>Download the Axyra Sheets skill (ZIP)</a>
  </section>
</div>

<div class="axyra-download-dialog-host">
<dialog class="axyra-download-dialog" data-download-complete aria-labelledby="axyra-download-dialog-title">
  <div class="axyra-dialog-head">
    <p class="axyra-download-complete__status">&#10003; Your download has started. If it didn&rsquo;t, <a href="{{ '/assets/downloads/axyra-sheets-skill.zip' | relative_url }}" download>download the ZIP again</a>.</p>
    <button class="axyra-dialog-close" type="button" data-dialog-close aria-label="Close">&times;</button>
  </div>
  <p id="axyra-download-dialog-title" class="axyra-dialog-title" data-updates-ask>Stay up to date with Axyra</p>
  <p class="axyra-dialog-text" data-updates-ask>Get Axyra tips, examples, and updates about new releases and the Axyra Agent Skill by email.</p>
  <form class="axyra-updates-form" data-axyra-updates-form novalidate
        data-endpoint="{{ site.axyra_leads.updates_endpoint }}"
        data-contact-url="{{ site.axyra_leads.contact_url }}"
        data-product="{{ site.axyra_leads.updates_product }}"
        data-message="{{ site.axyra_leads.updates_message }}"
        data-touchpoint="download_complete">
    <label class="axyra-field">
      <span>Email</span>
      <input type="email" name="email" autocomplete="email" placeholder="you@company.com" required>
    </label>
    <div class="axyra-dialog-actions">
      <button class="btn btn--success" type="submit">Keep me updated</button>
      <button class="axyra-dialog-dismiss" type="button" data-dialog-close>No thanks</button>
    </div>
    <div class="axyra-form-status" role="status" aria-live="polite"></div>
  </form>
  <div class="axyra-dialog-done" data-updates-done hidden>
    <p class="axyra-dialog-title">Thanks, you&rsquo;re on the list</p>
    <p class="axyra-dialog-text">We&rsquo;ll email Axyra tips, examples, and release updates to <strong data-updates-email></strong>.</p>
    <p class="axyra-form-note" data-updates-preview hidden>Local preview: nothing was sent. The request is logged in the browser console.</p>
    <button class="btn btn--success" type="button" data-dialog-close>Close</button>
  </div>
  <p class="axyra-dialog-legal">You can unsubscribe at any time by emailing <a href="mailto:{{ site.axyra_leads.unsubscribe_email }}">{{ site.axyra_leads.unsubscribe_email }}</a>. See our <a href="{{ site.axyra_leads.privacy_url }}" target="_blank" rel="noopener">Privacy Policy</a>.</p>
</dialog>
</div>

For Codex, install the `axyra-sheets` folder in `~/.codex/skills/` (or your
configured `$CODEX_HOME/skills/` directory), then start a new session. For
Claude Code, install it in `~/.claude/skills/` or your project's
`.claude/skills/` directory. Other assistants may use a different skill
directory; follow their installation documentation. You can also inspect the
[skill source on GitHub](https://github.com/keikai/doc/tree/master/skills/axyra-sheets).

The skill guides your coding assistant; it does not install the Axyra library.
Your application still needs Java 17 or later and the Axyra Sheets dependency.
See [Installation]({{ site.axyra_devref }}/Installation).

# Start with a focused prompt

Copy this prompt into your coding assistant and change the workbook task. Include
the Axyra version used by your project and attach relevant source files or sample
inputs when you have them.

```text
Use the Axyra Sheets skill to create a Java 17 Maven application using Axyra Sheets
(io.keikai:axyra-sheets:{{ site.axyra_version }}).

Generate an XLSX sales report with columns Region, Q1, Q2, and Total.
Add three data rows, calculate Total with formulas, style the header,
freeze the first row, and save the result as sales-report.xlsx.

Compile and run the application, reopen sales-report.xlsx, and verify the totals
and number formats. Tell me where the output is saved and report anything you
could not verify.
```

If your assistant uses a shorthand for invoking an installed skill, use
`$axyra-sheets` in Codex or `/axyra-sheets` in Claude Code. If your coding assistant does not support installed skills, extract the downloaded folder into your workspace and ask the assistant to read `axyra-sheets/SKILL.md` before starting your task.

# Build and verify

Treat generated code as a draft until it compiles and its output has been
inspected. Ask the assistant to:

1. Build the project and run the generated code.
2. Reopen the output and check important values, formulas, and formats.
3. Inspect the final workbook, PDF, or image for layout and rendering issues.
4. Report the commands it ran and any checks it could not complete.

Without a license key, Axyra runs in Evaluation Mode and adds evaluation marks to
saved and rendered output. For production license configuration and evaluation
limits, see [Licensing and Evaluation]({{ site.axyra_devref }}/License).

# Tips for working with AI

- Provide your Axyra dependency version.
- Describe the input and expected output clearly.
- Ask the assistant to build and run the code.
- Check the generated workbook, PDF, or image.

# Prompt examples

The following examples show what to ask your coding assistant, the results to expect, and what to check in the generated output. Adapt the prompts to your own files and requirements.

## Create a report from CSV

**Prompt**

```text
Use the Axyra Sheets skill. Read sales.csv (Date, Region, Product, Qty, UnitPrice)
and create sales.xlsx with an Amount formula on each row, a grand total, bold
headers, currency formatting, and a frozen header row. Build and run the code.
```

**Expected result:** A runnable project and `sales.xlsx` containing typed dates
and numbers, stored formulas, formatting, and a frozen header row.

**What to verify:** Reopen the file and check the row count, formula results,
grand total, number formats, and visible layout.

## Update a workbook without losing formatting

**Prompt**

```text
Use the Axyra Sheets skill. Apply the prices in price-updates.csv to the matching
SKUs in price-list.xlsx and save price-list-updated.xlsx. Preserve existing
styles, comments, hyperlinks, formulas, and workbook structure. Build and run the
code, then compare the input and output.
```

**Expected result:** Only the matching price values change; the workbook's other
content and features remain intact.

**What to verify:** Check the number of updated SKUs, compare the new values with
the CSV, and confirm that styles, comments, links, formulas, and sheet names were
preserved.

## Improve the performance of a large export

Include realistic row counts, memory constraints, and whether the job mostly
reads or writes.

**Prompt**

```text
Use the Axyra Sheets skill. Profile this 100,000-row export on a representative
sample, remove avoidable per-cell work, and keep values, formulas, formats, and
the command line unchanged. Report the measurements, implementation changes, and
any trade-offs. Build and run the optimized version and compare its output with
the original.
```

**Expected result:** A measured optimization appropriate to the workflow, such
as bulk range operations or a streaming export, with its limitations explained.

**What to verify:** Compare before-and-after measurements and confirm that the
optimized output still meets the same checks as the original.

## Migrate an existing spreadsheet workflow

Give the assistant the code that produces the current workbook. For example,
this Apache POI export creates a text identifier, a date, an amount, a formula,
two number formats, a bold header, and a frozen row:

**Starting Apache POI code**

```java
Path output = Path.of("poi-sales.xlsx");
try (XSSFWorkbook wb = new XSSFWorkbook()) {
    Sheet sheet = wb.createSheet("Sales");
    Row header = sheet.createRow(0);
    String[] labels = {"Order ID", "Date", "Amount", "With Tax"};
    for (int c = 0; c < labels.length; c++) {
        header.createCell(c).setCellValue(labels[c]);
    }

    CellStyle headerStyle = wb.createCellStyle();
    Font headerFont = wb.createFont();
    headerFont.setBold(true);
    headerStyle.setFont(headerFont);
    for (Cell cell : header) cell.setCellStyle(headerStyle);

    Row row = sheet.createRow(1);
    row.createCell(0).setCellValue("00042");
    row.createCell(1).setCellValue(Date.valueOf("2026-10-27"));
    row.createCell(2).setCellValue(1250.0);
    row.createCell(3).setCellFormula("C2*1.2");

    DataFormat formats = wb.createDataFormat();
    CellStyle dateStyle = wb.createCellStyle();
    dateStyle.setDataFormat(formats.getFormat("yyyy-mm-dd"));
    row.getCell(1).setCellStyle(dateStyle);
    CellStyle moneyStyle = wb.createCellStyle();
    moneyStyle.setDataFormat(formats.getFormat("#,##0.00"));
    row.getCell(2).setCellStyle(moneyStyle);
    row.getCell(3).setCellStyle(moneyStyle);
    sheet.createFreezePane(0, 1);
    wb.getCreationHelper().createFormulaEvaluator().evaluateAll();

    try (OutputStream out = Files.newOutputStream(output)) {
        wb.write(out);
    }
}
```

**Prompt**

```text
Use the Axyra Sheets skill to migrate the Apache POI code above to Axyra Sheets
{{ site.axyra_version }}. Preserve the Sales sheet name, the text value "00042",
the date, formula, number formats, bold header, and frozen row. Build and run both
versions, reopen both files, compare their values, types, formulas, formats, and
sheet structure, and report every difference. Remove POI only after confirming
that no source file still uses it.
```

**Expected result:** A runnable Axyra implementation with an operation mapping
and comparison report. The migrated core should look like this:

```java
Path output = Path.of("axyra-sales.xlsx");
try (Workbook wb = Workbook.create()) {
    Sheet sheet = wb.createSheet("Sales");
    sheet.range("A1:D1").setValues(new CellValue[][] { {
        CellValue.text("Order ID"), CellValue.text("Date"),
        CellValue.text("Amount"), CellValue.text("With Tax")
    } });
    sheet.range("A1:D1").setStyle(CellStyle.builder().bold().build());

    sheet.cell(1, 0).setValue(CellValue.text("00042"));
    sheet.cell(1, 1).setDate(LocalDate.of(2026, 10, 27));
    sheet.cell(1, 2).setValue(CellValue.number(1250.0));
    sheet.cell(1, 3).setFormula("C2*1.2");
    sheet.cell(1, 1).setStyle(CellStyle.builder()
            .numberFormat("yyyy-mm-dd").build());
    sheet.range("C2:D2").setStyle(CellStyle.builder()
            .numberFormat("#,##0.00").build());
    sheet.freezePanes(1, 0);
    wb.save(output);
}
```

**What to verify:** Reopen both workbooks and compare the `Sales` sheet name,
cell types and values in `A1:D2`, formula text and cached result in `D2`, bold
header, date and money formats, frozen pane, default font, and default row
height. If POI cannot run, use its saved workbook as the baseline and say that
execution equivalence was not verified.

# Next steps

## Continue from a working example

Start with the [runnable examples](https://github.com/keikai/axyra-sheets-examples)
or the [manual Quick Start]({{ site.axyra_tutorial }}/quick_start), then add one
capability at a time:

- [Read and write an existing file]({{ site.axyra_tutorial }}/read_write)
- [Render PDF and images]({{ site.axyra_tutorial }}/render)
- [Fill an Excel template with Template Markers]({{ site.axyra_devref }}/Template_Markers)
- [Stream a large export]({{ site.axyra_devref }}/Streaming)
- [Configure licensing and Evaluation Mode]({{ site.axyra_devref }}/License)

The skill can also help diagnose dependency, native-library loading, platform,
and licensing problems. For deployment issues, provide the build file,
deployment configuration, target operating system and architecture, and the
complete error log so the assistant can reproduce the smallest failing case.

## Build an enterprise reporting workflow

Explore our [financial workflow](https://keikai.io/axyra/demo/demo.zul?id=financialDataFlow), [data cleansing](https://keikai.io/axyra/demo/demo.zul?id=financialDataCleansing) and [reporting](https://keikai.io/axyra/demo/demo.zul?id=financialReporting) examples to see how Axyra fits into a larger application. Try the live demos, then use the corresponding [GitHub projects](https://github.com/keikai/axyra-sheets-examples) as a starting point for your own workflow.

Give your coding assistant the example code, describe your input data and reporting requirements, and ask it to adapt the workflow to your application.

{% include axyra_cta.html touchpoint="ai_quickstart_end" ab=true topic="migration" %}
