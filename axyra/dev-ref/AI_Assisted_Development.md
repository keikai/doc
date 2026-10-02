---
title: 'AI-Assisted Development'
permalink: /axyra/dev-ref/AI_Assisted_Development
---

Use the **Axyra Sheets skill** with an AI coding assistant to build Java
spreadsheet workflows or migrate existing spreadsheet code. The skill gives your
assistant the rules that most often break generated Axyra code, an index of the
exact API signatures of the library version, and a way to verify the generated
output, so it spends less time searching documentation and more time on your task.

AI assistance is a development workflow, not a separate Axyra API. The generated
application uses the same `io.keikai.axyra.sheets.*` classes as manually written
code.

# Get the Axyra Sheets skill

[Download the Axyra Sheets skill (ZIP)]({{ '/assets/downloads/axyra-sheets-skill.zip' | relative_url }}){: .btn .btn--success}

The ZIP contains an `axyra-sheets` folder. Keep it intact so the assistant can
follow its links:

- `SKILL.md` — the decision rules, a short API cheat sheet, the license start-up
  code, and how to verify results. Most tasks need nothing else.
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
result includes `.../skills/axyra-sheets/SKILL.md`.

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
it instead -- in Codex, `$axyra-sheets` invokes it explicitly. If the skill is not
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

Without a license key, the application runs in Evaluation Mode. Distributed
production builds visibly mark saved workbook output; development builds do so
when enforcement is enabled. This is expected during the Quick Start. An invalid
or expired key does not throw either, so ask the assistant to check
`isLicensed()` right after `setLicense` and stop with a clear message. A batch job
that fails partway through with an "evaluation limit reached" `AxyraException`
is usually running unlicensed. See
[Licensing and Evaluation]({{ site.axyra_devref }}/License).

# Rules that prevent common AI mistakes

The skill gives the assistant these as rules, each with the alternative to use.
They are also a useful checklist when you review generated code.

**Lifetime and threads**
- Keep every `Workbook`, `Sheet`, `Range`, and `Cell` use inside the workbook's
  try-with-resources block. These objects are views over native memory; return
  extracted values, not views.
- Do not share one `Workbook` (or its views) between threads. For parallel jobs,
  read a template once as bytes and open a separate workbook in each task.

**Writing**
- Java row and column indices are 0-based; formulas and A1 references are
  1-based. Formula strings omit the leading `=`.
- Update existing cells with `Cell.setValue` or `Range.setValues`.
  `setNumber`/`setNumbers` replace the whole cell, so its style, comment and
  hyperlink are lost.
- To fill a formula down, use `Range.copyTo` or per-cell `setFormulas`;
  `autoFill` copies formulas without shifting their references.
- Keep identifiers such as `00042` as text, and give dates an explicit date format.

**Calculation and speed**
- Calculate at most once, before reading results or saving — never call
  `recalculate()` inside a loop, where it re-evaluates the whole workbook on every
  iteration.
- Read and write ranges in bulk (`Range.values()`, `Range.setValues`) instead of
  cell by cell, and find the data extent once instead of probing cells.

**Output formats**
- `.ods` output keeps values, not formulas. Deliver `.xlsx` when formulas must
  stay live, and say so.
- Refresh a pivot table before saving or rendering it, or its cells are empty
  outside Excel.
- The streaming writer is for new, write-only, forward-only files: it cannot open
  or edit a workbook, recalculate, or add charts, pivots, or images.

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
reported; the numbers come from its own runs. Use the "What to check" notes when
you review an assistant's work on a similar task.

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
> `setValues` keeps each cell's style, comment and hyperlink; `setNumber` and
> `setNumbers` would drop them. The program takes about 0.8 s.
>
> Verified by comparing the input and output packages: every part except
> `sheet1.xml` is byte-identical (styles, comments, hyperlinks, defined names);
> with the price values masked, `sheet1.xml` is identical too; exactly 1,500 price
> cells changed, each matching the CSV.

**What to check:** the assistant used a style-preserving write and proved that
nothing else changed, instead of assuming it.

## A requirement the library cannot meet

```text
Use the Axyra Sheets skill. Our LibreOffice users need budget.xlsx as an
OpenDocument file with all formulas kept live, so the totals update when they
edit the figures. Produce budget.ods.
```

**Response (excerpt):**

> **budget.ods does not keep live formulas.** This Axyra version writes ODS files
> with cached values only. The totals are correct numbers but will not update when
> users edit the figures. I tested it: the input has 9 formulas, the ODS has 0
> `table:formula` attributes, and every ODS save path gave the same result.
>
> I also saved budget.xlsx with the formulas kept; LibreOffice opens XLSX natively,
> so its totals stay live. In my test, changing B2 in the reopened XLSX updated F2.
> I did not open either file in LibreOffice itself. If an ODS file is required,
> convert that XLSX outside Axyra, for example with LibreOffice.

**What to check:** the limitation is stated plainly and backed by a test, and a
working alternative is delivered. Be wary of any answer that "confirms" a
capability it could not demonstrate.

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
> checked the result. That file is not an active license: `setLicense` returns
> state `EVALUATION` without throwing. Evaluation mode adds the
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
