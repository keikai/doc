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
