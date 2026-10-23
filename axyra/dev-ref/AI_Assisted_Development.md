---
title: 'AI-Assisted Development'
permalink: /axyra/dev-ref/AI_Assisted_Development
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
`$axyra-sheets` in Codex or `/axyra-sheets` in Claude Code. If it does not support
installed skills, put the downloaded folder in your workspace and begin with
`Read axyra-sheets/SKILL.md and the references it links, then ...`.

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

{% include axyra_cta.html touchpoint="ai_quickstart_end" ab=true topic="migration" %}

# Tips for working with AI

- Provide your Axyra dependency version.
- Describe the input and expected output clearly.
- Ask the assistant to build and run the code.
- Check the generated workbook, PDF, or image.

# Prompt examples

Use **prompt → expected result → what to verify** when describing a task.
This keeps the request reproducible and the success criteria visible.

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

# Next steps

## Migrate an existing spreadsheet workflow

Provide the current code, dependency versions, and a representative input or
expected output. Migration is an operation-by-operation mapping, not a package
name replacement.

```text
Use the Axyra Sheets skill to migrate the attached Apache POI sales export to
Axyra Sheets. Preserve sheet names, text identifiers, dates, formulas, styles,
and number formats. First map the POI operations to Axyra and identify any gaps.
Then implement the migration, remove POI only after no code uses it, build and
run both versions where possible, and compare their output. Do not claim
equivalence for anything you could not verify.
```

If the original library cannot run in your environment, provide a baseline file
or explicit expected values. Template syntax and rendering behavior may differ
between libraries and require separate checks.

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

For an enterprise reporting workflow, state the input schema, output
requirements, deployment platform, row counts, memory constraints, and important
edge cases. Scheduling, storage, and delivery remain responsibilities of your
application.
