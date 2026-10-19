---
title: 'AI-Assisted Development'
permalink: /axyra/dev-ref/AI_Assisted_Development
---
# AI-friendly API

Axyra’s APIs are designed and refined for clarity, making them easier for AI coding agents to understand and use. For example, a method named `get` can be misleading if it also modifies data. We test how coding agents interpret and use our APIs, then refine them to reduce such ambiguity. The Axyra Agent Skill complements this API design with guidance grounded in official documentation and verified examples.

# Axyra Agent Skill

Use the **Axyra Sheets skill** with an AI coding assistant to build Java
spreadsheet workflows or migrate existing spreadsheet code. The skill gives your
assistant the rules that most often break generated Axyra code, an index of the
exact API signatures of the library version, and a way to verify the generated
output, so it spends less time searching documentation and more time on your task.

AI assistance is a development workflow, not a separate Axyra API. The generated
application uses the same `io.keikai.axyra.sheets.*` classes as manually written
code.

The skill covers Excel import and export, template reports, formulas, charts,
pivots, PDF and image rendering, streaming exports, licensing issues, and guidance for migrating existing spreadsheet code to Axyra, including code written with Aspose.Cells or Apache POI. Its rules and API index were verified against Axyra Sheets `1.0.0-Beta.FL.20261008-Eval`.

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
  <button class="axyra-dialog-close" type="button" data-dialog-close aria-label="Close">&times;</button>
  <p class="axyra-download-complete__status">&#10003; Your download has started. If it didn&rsquo;t, <a href="{{ '/assets/downloads/axyra-sheets-skill.zip' | relative_url }}" download>download the ZIP again</a>.</p>
  <p id="axyra-download-dialog-title" class="axyra-dialog-title">Stay up to date with Axyra</p>
  <p class="axyra-dialog-text">Get Axyra tips, examples, and updates about new releases and the Axyra Agent Skill by email.</p>
  <form class="axyra-updates-form" data-axyra-updates-form novalidate
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
  <p class="axyra-dialog-legal">You can unsubscribe at any time by emailing <a href="mailto:{{ site.axyra_leads.unsubscribe_email }}">{{ site.axyra_leads.unsubscribe_email }}</a>. See our <a href="{{ site.axyra_leads.privacy_url }}" target="_blank" rel="noopener">Privacy Policy</a>.</p>
</dialog>
</div>

The ZIP contains an `axyra-sheets` folder. Keep it intact so the assistant can
follow its links:

- `SKILL.md` — the decision rules, a short API cheat sheet, the license start-up
  code, and how to verify results. Most tasks need nothing else.
- `agents/openai.yaml` — the display name and default prompt that Codex shows
  for the skill.
- `references/api-index.md` — every public type and method of the library
  version, one per line. The assistant searches it for exact signatures instead
  of reading Javadoc pages.
- `references/*.md` — topic notes (writing and styles, templates, output formats,
  license and threads, PDF and streaming, migration, documentation sources). The
  assistant opens one only when the task touches that topic.

You can also inspect the
[skill source on GitHub](https://github.com/keikai/doc/tree/master/skills/axyra-sheets).

For Codex, extract that folder into `~/.codex/skills/` (or your configured
`$CODEX_HOME/skills/` directory). The result should include
`~/.codex/skills/axyra-sheets/SKILL.md`. Start a new session if the skill does
not appear in the skill list. Review an existing installation before replacing it.

For Claude Code, extract it into `~/.claude/skills/` for all your projects, or into
your project's `.claude/skills/` directory to share it with your team, so that the
result includes `.../skills/axyra-sheets/SKILL.md`. Claude Code loads the skill
automatically when a task matches it; type `/axyra-sheets` to invoke it
explicitly.

For other assistants that support skills, use their documented skill installation
location. If your assistant does not support skill installation, extract the folder
into your workspace and ask it to read `axyra-sheets/SKILL.md` first; that file
says which reference to open for which kind of task, so the assistant does not need
to load every reference up front.

The skill is guidance for your coding assistant, not the Java library itself.
Your application still needs Java 17 or later and the Axyra Sheets dependency;
see [Installation]({{ site.axyra_devref }}/Installation).

# How the skill uses Axyra resources

The skill tells the assistant to stop at the first source that answers:

1. **The skill's own rules** for behavior that commonly goes wrong.
2. **The API index** in the skill for exact class and method signatures. It
   matches the library version named at its top; for another version, the
   assistant checks signatures with `javap` against the JAR your build resolves.
3. **The `-javadoc` JAR** of your resolved version, from your local Maven or Gradle
   cache or the same repository as the library, when it needs the description of a
   method rather than its signature. The public
   **[Javadoc]({{ site.axyra_javadoc }})** site tracks the latest release, so it is
   a last resort for a pinned or older version.
4. **Documentation** and
   **[runnable examples](https://github.com/keikai/axyra-sheets-examples)** for a
   workflow the skill does not cover.

Signatures do not prove behavior: for anything the result depends on, the
assistant writes a short test against your build. When it reports its work, it
should name only the sources it actually opened.

No access to Axyra's engine source repository is required. Give the assistant your
project's dependency version, deployment platform, input data, and expected output.
For a new project, use the dependency described in the installation guide; for an
existing project, verify APIs against the version it actually resolves.

# Start with a focused prompt

Copy this prompt into your coding assistant and change the workbook task. The
prompts on this page name the skill in plain words, so they work with any
assistant. If yours uses a shorthand for invoking an installed skill, you can use
it instead: `$axyra-sheets` in Codex, `/axyra-sheets` in Claude Code. If the skill is not
installed, replace the opening phrase with `Read axyra-sheets/SKILL.md and the
references it links, then`.

```text
Use the Axyra Sheets skill to create a Java 17 Maven application using Axyra Sheets
(io.keikai:axyra-sheets:{{ site.axyra_version }}).

Generate an XLSX sales report with columns Region, Q1, Q2, and Total.
Add three data rows, calculate Total with formulas, style the header,
freeze the first row, and save the result as sales-report.xlsx.

Configure a runnable main class and provide the exact build and run commands.
Compile and run the application, then reopen sales-report.xlsx and verify the
totals and number formats. Tell me where the output is saved and report any
dependency, native-library, or API mismatch you cannot resolve.
```

Ask for one observable result at a time. A prompt such as “create one XLSX file”
is easier to verify than a single request that also introduces HTTP endpoints,
database access, templates, and deployment.

# Build and verify

Treat generated code as a draft until it compiles and its output has been
opened or inspected.

Run the build and execution commands generated for your project. For a Maven
application, `mvn clean package` builds it; `mvn exec:java` runs it when the
Exec Maven Plugin and main class have been configured. Ask the assistant to
report commands it actually ran, including any skipped or blocked checks.

Check all three layers:

1. **Build:** imports and method signatures match the installed Axyra version.
2. **Workbook model:** formulas were recalculated and expected cells contain the
   correct raw and formatted values.
3. **Output:** open the XLSX, PDF, or image and verify layout, fonts, formulas,
   and page breaks.

Without a license key, the application runs in Evaluation Mode: saved
workbooks, PDFs, and images carry evaluation marks. This is expected during the
Quick Start. By default an invalid or expired key does not throw either; for
production code, ask the assistant to install the key with
`LicenseMode.REQUIRED`, which throws instead of falling back to Evaluation Mode:

```java
String licenseFile = System.getenv("AXYRA_LICENSE_FILE");
if (licenseFile == null || licenseFile.isBlank()) {
    throw new IllegalStateException("AXYRA_LICENSE_FILE is not set");
}
Workbook.setLicense(
        Files.readString(Path.of(licenseFile)).trim(),
        LicenseMode.REQUIRED);   // throws AxyraException if the key is not in force
```

Evaluation Mode adds an "Axyra Evaluation Copy" first sheet to saved workbooks
and a banner to PDF and image pages, and allows 100 opens, saves, renders, and
streaming workbook creations combined per process. A batch job that fails partway through with an "evaluation limit reached"
`AxyraException` is usually running unlicensed. See
[Licensing and Evaluation]({{ site.axyra_devref }}/License).

{% include axyra_cta.html touchpoint="ai_quickstart_end" ab=true topic="migration" %}

# Rules that prevent common AI mistakes

The skill gives the assistant these as rules, each with the alternative to use.
They are also a useful checklist when you review generated code.

**Lifetime and threads**
- Keep every `Workbook`, `Sheet`, `Range`, and `Cell` use inside the workbook's
  try-with-resources block. These objects are views over native memory; return
  extracted values, not views.
- Do not share one `Workbook` (or its views) between threads; doing so throws
  `AxyraException: workbook is already in use`. For parallel jobs, read a template
  once as bytes and open a separate workbook in each task (`Workbook.openBytes`).

**Writing**
- Java row and column indices are 0-based; formulas and A1 references are
  1-based. Formula strings omit the leading `=`.
- `Range.setStyle` replaces the whole style. To change one attribute, such as
  bold, on cells with mixed formatting, update each cell from
  `cell.style().toBuilder()`.
- `Sheet.importData` orders JavaBean properties alphabetically and writes
  `LocalDate` values as date serials without a date format. Set columns
  explicitly, and apply a date format (or use `Cell.setDate`).
- Keep identifiers such as `00042` as text, and give dates an explicit date format.

**Calculation and speed**
- Every write already recalculates the formulas that depend on it, so results are
  normally current. `save` does not recalculate: call `recalculate()` once before
  saving when an opened file's formulas were not touched, or in `MANUAL`
  calculation mode. Never call it inside a loop,
  where it re-evaluates the whole workbook on every iteration.
- Read and write ranges in bulk (`Range.values()`, `Range.setValues`) instead of
  cell by cell, and find the data extent once instead of probing cells.

**Output formats**
- A pivot table's cells exist only after `PivotTableView.refresh()`; call it
  before reading them in code. Saving and rendering refresh it for you.
- The streaming writer is for new, write-only, forward-only files: it cannot open
  or edit a workbook, recalculate, or add charts, pivots, or images.
- VBA in `.xlsm` files is preserved but never executed. Ask for a Java port of the
  macro logic instead.

**Honesty**
- Do not invent API names from Apache POI, Keikai Spreadsheet, or another
  spreadsheet library. Verify unfamiliar calls against the API index or the JAR
  and compile the generated code. When migrating, remove the old dependency only
  after no code uses it.
- Do not hide or remove Evaluation Mode markings. Use a 30-day evaluation or
  production license when clean output is required.
- When a result depends on a behavior, test it; when a failure is reported,
  reproduce it first and quote what you observed.

# Ask for performance work

Give the assistant the realistic data size and whether the job mostly reads or
writes. Ask it to measure the current code on a small sample (for example 1,000
and 5,000 rows) and extrapolate, rather than running a slow version at full size,
then to report before-and-after timings and to keep the output identical. Most
speed-ups come from removing repeated `recalculate()` calls and per-cell loops, and
from choosing formulas the engine evaluates cheaply.

# Example prompts and responses

These examples show what to ask for and what a good response looks like. Each
response is a condensed excerpt of what an assistant using the skill actually
reported in runs on Axyra Sheets 0.1.0; the numbers come from its own runs, and
the behaviour shown still applies to 1.0.0-Beta. Use the "What to check" notes
when you review an assistant's work on a similar task.

## Create a report from a CSV file

```text
Use the Axyra Sheets skill. Read sales.csv (Date, Region, Product, Qty, UnitPrice)
and create sales.xlsx: an Amount formula on each row, a grand total, bold
headers, currency formatting, and a frozen header row.
```

**Response (excerpt):**

> Dates are written as real dates (`Cell.setDate`, format `yyyy-mm-dd`); Qty and
> UnitPrice are numbers. Amount is a live formula on each row (`D2*E2` …) and the
> grand total is `SUM(F2:F4)`, built from the actual row count. Currency format
> `"$"#,##0.00` applies to UnitPrice, Amount and the total; column widths are set
> explicitly so the values don't show as `####`.
>
> Verified: the program reopens the saved file and prints Amount 20, 60, 10 and a
> total of $90.00. I also unzipped the XLSX and confirmed the stored formulas and
> cached values, the bold header font, and the frozen pane.
>
> Assumption: the task doesn't name a currency, so I used `$`.

**What to check:** formulas are stored rather than hard-coded values, the output
was reopened after saving, and assumptions are stated.

## Update values without losing formatting

```text
Use the Axyra Sheets skill. price-list.xlsx has 2,000 SKUs with formatted price
cells, some with comments or links. Apply the 1,500 new prices in
price-updates.csv (not in sheet order) and save price-list-updated.xlsx. Apart
from the changed prices, the file must stay identical.
```

**Response (excerpt):**

> I read the SKU and Price columns in bulk with `Range.values()`, replaced the
> prices from the CSV, and wrote the column back with one `Range.setValues` call.
> `setValues` keeps each cell's style, comment and hyperlink. The program takes
> about 0.8 s.
>
> Verified by comparing the input and output packages: every part except
> `sheet1.xml` is byte-identical (styles, comments, hyperlinks, defined names);
> with the price values masked, `sheet1.xml` is identical too; exactly 1,500 price
> cells changed, each matching the CSV.

**What to check:** the assistant used a style-preserving write and proved that
nothing else changed, instead of assuming it.

## Diagnose a job that fails partway through

```text
Use the Axyra Sheets skill. Our nightly batch job stamps every workbook in
inputs/batch. Every output has an unexpected first sheet named
"Axyra Evaluation Copy", and the job crashes partway through with an
AxyraException. Find the root cause and fix it; fail fast if the license is not
active.
```

**Response (excerpt):**

> **Root cause:** the job installed the license from `config/axyra.lic` and never
> checked the result. That file is not an active license: `setLicense` falls
> back to Evaluation Mode without throwing. Evaluation mode adds the
> "Axyra Evaluation Copy" sheet and limits opens and saves to 100 per process; each
> file costs one of each, so the job died on file 51.
>
> **Reproduced** on a copy with the original code: it stopped with
> `AxyraException: evaluation limit reached …` after writing 50 files.
>
> **Fix:** the license is read from the file in `AXYRA_LICENSE_FILE`, and the
> program exits with a clear message before opening any workbook if the variable
> is unset, the file is unreadable, or `isLicensed()` is false. All 60 files now
> process cleanly. Evaluation marks are not removed or hidden.

**What to check:** the failure was reproduced and the error quoted before the fix,
and the fix addresses the cause rather than the symptom.

## Speed up a slow export

```text
Use the Axyra Sheets skill. statement.xlsx is built from 24,000 transactions,
newest first, with a running-balance formula on each row. It takes more than
10 minutes; we need it under 20 seconds. Keep the balances as live formulas.
```

**Response (excerpt):**

> **Cause:** each balance formula refers to the row below it, and the rows were
> written newest first. Every write recalculates the cells that depend on it, so
> each new formula re-evaluated everything already written above it: quadratic
> work.
>
> **Measured on samples** rather than at full size: 1,000 rows took 2.3 s, 2,000
> took 6.7 s, and 4,000 took 25.6 s (about 4× per doubling). That extrapolates to
> about 15 minutes for 24,000 rows.
>
> **Fix:** write the rows oldest first. Each formula then references only existing
> cells and nothing depends on it yet. The full statement now takes about 4.5 s
> including Maven start-up, the output for 4,000 rows is byte-identical to the
> original, and an independent check of all 24,000 balances found no mismatches.

**What to check:** the cause was measured, the slow version was not run at full
size, timings are reported before and after, and the output is unchanged.

## A ticket that asks for another library's API

```text
Use the Axyra Sheets skill. Make the header row A1:C1 (Name, Qty, Price) bold
with a yellow fill. The ticket says: use XSSFCellStyle for styling, but do not
add Apache POI.
```

**Response (excerpt):**

> These two requirements conflict: `XSSFCellStyle` is an Apache POI class and
> cannot be used without adding POI. I kept "no POI" and met the intent with
> Axyra's `CellStyle`:
>
> | POI | Axyra |
> |---|---|
> | `createCellStyle()` + `XSSFFont.setBold(true)` | `CellStyle.builder().bold()` |
> | `setFillForegroundColor(...)` + `SOLID_FOREGROUND` | `.fill(Color.rgb(0xFF, 0xFF, 0x00))` |
> | `cell.setCellStyle(style)` per cell | `sheet.range("A1:C1").setStyle(style)` |
>
> If the ticket author needs the POI class itself, that means adding the POI
> dependency, which is a decision to revisit with them.

**What to check:** no invented API and no hidden dependency; the conflict is
surfaced for a person to decide.

## Export JSON with correct types

```text
Use the Axyra Sheets skill. Export orders.json to orders.xlsx: one row per order with
columns orderId, customer, orderDate, amount, discount, coupon and a bold header. Keep
orderId as text with its leading zeros, make orderDate a real date shown as yyyy-mm-dd,
show amount with two decimals, and leave missing or null values blank. Customer names
are untrusted input.
```

**Response (excerpt):**

> I build a `CellValue[][]` from the JSON and write it with one `Range.setValues`
> call. `orderId`, `customer` and `coupon` are written with `CellValue.text`, so
> `00042` keeps its zeros and a customer named `=HYPERLINK("http://evil")` is
> stored as a plain string, never as a formula. `orderDate` is parsed to a
> `LocalDate` and written with `Cell.setDate` in a `yyyy-mm-dd` style; `amount` is
> a number with format `0.00`. Missing keys, JSON `null` and empty strings become
> blank cells.
>
> Verified by unzipping the XLSX: the IDs are text cells with format `@`, the
> sheet has no formula anywhere, dates are numeric serials (46082 = 2026-03-01),
> and null or missing fields have no cell at all.
>
> Note: the names are safe in the XLSX because they are text cells. If this data
> is later exported to CSV, it needs separate escaping.

**What to check:** IDs stay text, dates are real dates, and formula-like input is
never stored as a formula.

## Export a pivot table to PDF

```text
Use the Axyra Sheets skill. sales-data.xlsx has 200 sales rows (Region, Product,
Quarter, Amount). Add a Summary sheet with a pivot table: Region as rows, Quarter as
columns, Sum of Amount as values. Set it to print on one A4 landscape page, save
summary.xlsx, and export only the Summary sheet to summary.pdf.
```

**Response (excerpt):**

> I added a `Summary` sheet with a pivot over `Data!$A$1:$D$201` and called
> `refresh()`, so the pivot's cells exist in the saved file and in the PDF. The
> refreshed pivot fills `A1:F7`, including grand totals. Page setup belongs to
> the sheet: paper size 9 (A4), landscape, print area `$A$1:$F$7`, and
> `fitToPage(1, 1)`. The PDF is rendered with
> `PdfOptions.builder().sheetNames("Summary")`.
>
> Verified: a checker reopened summary.xlsx and summed the 200 rows by Region and
> Quarter, with 0 mismatches and a grand total of 59,100. `pdfinfo` reports one
> 841.89 × 595.28 pt page (A4 landscape), and `pdftotext` shows only the pivot. I
> did not check the PDF's appearance visually.

**What to check:** the pivot was refreshed before saving and rendering, and the
PDF was checked for page count, size, and content.

## Generate files in parallel

```text
Use the Axyra Sheets skill. Generate one invoice per customer from
invoice-template.xlsx and lines.csv (24 customers) as invoices/<customerId>.xlsx,
using a fixed pool of 4 worker threads. Load the template once. Fill in the customer
id, line items, a 5% tax rate, subtotal, tax rounded to cents and total, and keep the
template's layout and logo. Report the wall time.
```

**Response (excerpt):**

> The template is read into bytes once. A `Workbook` must not be shared between
> threads, so each task opens its own copy with `Workbook.openBytes(bytes, "xlsx")`
> on `Executors.newFixedThreadPool(4)`. Tasks find their cells through the
> template's named ranges (`CustomerId`, `LineItems`, `TaxRate`, `Subtotal`,
> `Tax`, `Total`), and the tax is `ROUND(D14*B18,2)`. All writes go to cells the
> template already has, so its number formats stay.
>
> Wall time, from reading the template to the last save and excluding JVM
> start-up: 26–29 ms over 4 runs for all 24 invoices.
>
> Verified: a checker reopened all 24 files and compared id, subtotal, tax and
> total with the CSV, with no mismatches. The logo image has the same SHA-1 as
> the template's.

**What to check:** one workbook per task, every output checked, and a measured
time rather than an estimate.

## Scale an export to 100,000 rows

```text
Use the Axyra Sheets skill. This program writes data.xlsx with N rows (row i holds
i, 2i, 3i, 4i, 5i; column A formatted 0, columns B–E #,##0.00). Make it handle
100,000 rows efficiently while keeping the same values, column order, number formats
and command line; it must still work for 1,000 rows. Explain any API or design changes.
```

**Response (excerpt):**

> The export only creates a new file and writes it once, in order, so I switched
> from `Workbook` to `StreamWorkbook`. The old code made two native calls per cell
> (`setValue` and `setStyle`), 1,000,000 calls for 100,000 rows. Now each format
> is registered once with `addStyle(StreamStyle.defaults().withNumberFormat(...))`,
> each row is written with `row(r).addNumber(x, style)` and `commit()`, and
> `finish()` closes the file.
>
> | Rows | Before (time / peak memory) | After |
> |---|---|---|
> | 1,000 | 0.77 s / 93 MB | 0.72–0.77 s / 79–84 MB |
> | 100,000 | 2.31 s / 384 MB | 1.00 s / 79 MB |
>
> Trade-off: `StreamWorkbook` is write-only and forward-only. It cannot open
> files, recalculate, or add charts, pivots, merges, validation, or rendering; if
> the export later needs any of those, it has to go back to `Workbook`. A verifier
> found no wrong values or formats at either size.

**What to check:** before-and-after numbers at both sizes, identical output, and
the trade-off stated.

## Run a VBA macro

```text
Use the Axyra Sheets skill. Open prices.xlsx, run the ApplyDiscount VBA macro
(ApplyDiscount.bas) on it, and save discounted.xlsx. If that can't be done, explain
the limit and the closest supported alternative.
```

**Response (excerpt):**

> **Axyra cannot execute VBA.** No public API runs macros. `Workbook.vbaModules()`
> reads macro source embedded in a workbook, and VBA is kept when you save as
> `.xlsm`, but it is never run. In this case prices.xlsx has no VBA project at
> all; the macro exists only as the separate `.bas` file.
>
> The closest supported alternative is a Java port of the macro's logic. It reads
> `B2:B4`, the macro's range, with `Range.values()`, multiplies each value by 0.9,
> and writes back with `Range.setValues`, which keeps the cell styles. It follows
> VBA's coercion: an empty cell counts as 0, numeric text becomes a number, and
> anything else fails with "Type mismatch".
>
> Verified: B2:B4 went from 100, 250, 40 to 90, 225, 36. This is a hand port, not
> execution, so if the `.bas` file changes, the Java code must be updated to match.

**What to check:** the limit is stated first, no macro API is invented, and the
port is labeled as a port.

## Diagnose a container deployment failure

```text
Use the Axyra Sheets skill. Our report service ran fine as a plain java job on an
Ubuntu VM. In its new container image every run fails with "NoClassDefFoundError:
Could not initialize class io.keikai.axyra.sheets.Workbook", although the Axyra JAR is
on the classpath. Using the Dockerfile, the Kubernetes CronJob and the smoke-test log,
find the root cause and fix the deployment. The cluster requires non-root, a read-only
root filesystem, no privilege escalation and all capabilities dropped; the license
comes from a secret.
```

**Response (excerpt):**

> **Root cause:** the base image is Alpine, which uses musl libc, while Axyra's
> native engine `libaxyra_jni.so` is built for glibc. The error in the ticket is a
> consequence. The first error in the log is `UnsatisfiedLinkError … Error loading
> shared library liblzma.so.5`, raised while `Workbook` initializes. The license
> code logged it as a warning and carried on, so every later use of `Workbook`
> failed with `NoClassDefFoundError`.
>
> **Second, latent failure:** the native library is extracted to
> `java.io.tmpdir` on every start, and the CronJob's read-only root filesystem
> leaves nothing writable at `/tmp`. I reproduced this locally with a read-only
> temporary directory.
>
> **Fix:** a glibc base image (`eclipse-temurin:21.0.4_7-jre-jammy`), an
> `emptyDir` volume mounted at `/tmp`, and a start-up check that exits if the
> engine cannot load or the license is not active. Not verified: there is no
> Docker or Kubernetes here, so the image build and a cluster run still need
> checking in CI.

**What to check:** the first error in the log was found, not just the last one,
and what was verified is separated from what still needs checking.

# Migrate an existing spreadsheet workflow

Provide your current code, dependency version, and a small representative input
or expected output. The skill helps map operations and identify compatibility
gaps; migration is not a package-name replacement.

```text
Use the Axyra Sheets skill to migrate the attached Aspose.Cells sales export to Axyra.
Preserve sheet names, text identifiers, dates, formulas, and number formats.
Generate XLSX and PDF output. First map the operations and identify any gaps,
then implement the migration and compare results with the supplied baseline.
Do not claim output equivalence for anything you could not test.
```

If the original library cannot run in your environment, provide a baseline file
or explicit expected values. Template syntax and rendering behavior may differ
between libraries and require separate checks.

# Build an enterprise reporting workflow

State the input schema, output requirements, and important edge cases. For example:

```text
Use the Axyra Sheets skill to export our Java sales records to an XLSX file.
The columns are Order ID, Order Date, Region, and Amount. Preserve leading zeros
in IDs, format dates as yyyy-mm-dd, and show amounts with two decimal places.
Treat missing amounts as blank and include headers even when there are no rows.
Add tests that reopen the output and verify values, types, and formatting.
Keep our existing build system and application framework.
```

You can extend a working export with templates, charts, pivots, or PDF output.
For large datasets, include row counts and memory constraints so the assistant
can assess streaming tradeoffs. Scheduling and delivery remain responsibilities
of your application.

# Continue from a working example

The fastest way to expand a solution is to give the assistant a compiling Axyra
example and request one change. Start with the
[manual Quick Start]({{ site.axyra_tutorial }}/quick_start), then ask it to add
one of these capabilities:

- [Read and write an existing file]({{ site.axyra_tutorial }}/read_write)
- [Render PDF and images]({{ site.axyra_tutorial }}/render)
- [Fill an Excel template with Template Markers]({{ site.axyra_devref }}/Template_Markers)
- [Stream a large export]({{ site.axyra_devref }}/Streaming)
