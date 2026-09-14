---
title: 'AI-Assisted Development'
permalink: /axyra/dev-ref/AI_Assisted_Development
---

Use an AI coding assistant to turn a spreadsheet requirement into a working
Axyra Sheets program. You describe the input, transformation, and output; the
assistant drafts the Java code; then you build the project and inspect the
generated workbook.

AI assistance is a development workflow, not a separate Axyra API. The generated
application uses the same `io.keikai.axyra.sheets.*` classes as manually written
code.

# Before you prompt

Give the assistant authoritative Axyra context instead of asking it to guess the
API:

- [Axyra Sheets Developer Reference]({{ site.axyra_devref }})
- [Runnable examples](https://github.com/keikai/axyra-sheets-examples)

State that the project uses Java 17 or later and the Maven artifact
`io.keikai:axyra-sheets:{{ site.axyra_version }}`.

# Start with a focused prompt

Copy this prompt into your coding assistant and change the workbook task:

```text
Create a Java 17 Maven application using Axyra Sheets
(io.keikai:axyra-sheets:{{ site.axyra_version }}).

Generate an XLSX sales report with columns Region, Q1, Q2, and Total.
Add three data rows, calculate Total with formulas, style the header,
freeze the first row, and save the result as sales-report.xlsx.

Use try-with-resources for Workbook, use Range bulk operations where practical,
and call recalculate() before reading formula results or saving the file.
Only use APIs documented at https://doc.keikai.io{{ site.axyra_devref }} or demonstrated
in https://github.com/keikai/axyra-sheets-examples.
```

Ask for one observable result at a time. A prompt such as “create one XLSX file”
is easier to verify than a single request that also introduces HTTP endpoints,
database access, templates, and deployment.

# Build and verify

Treat generated code as a draft until it compiles and its output has been
opened or inspected.

```bash
mvn clean package
mvn exec:java
```

Check all three layers:

1. **Build:** imports and method signatures match the installed Axyra version.
2. **Workbook model:** formulas were recalculated and expected cells contain the
   correct raw and formatted values.
3. **Output:** open the XLSX, PDF, or image and verify layout, fonts, formulas,
   and page breaks.

Without a license key, the application runs in Evaluation Mode. Distributed
production builds visibly mark saved workbook output; development builds do so
when enforcement is enabled. This is expected during the Quick Start. See
[Licensing and Evaluation]({{ site.axyra_devref }}/License).

# Rules that prevent common AI mistakes

- Keep every `Workbook`, `Sheet`, `Range`, and `Cell` use inside the workbook's
  try-with-resources block. These objects are views over native memory.
- Java row and column indices are 0-based; formulas and A1 references are
  1-based.
- Prefer `Range.setValues`, `setNumbers`, and other bulk methods over large
  per-cell loops.
- Assigning a formula does not calculate it. Call `recalculateDirty()` or
  `recalculate()` before consuming its result.
- Do not invent API names from Apache POI, Keikai Spreadsheet, or another
  spreadsheet library. Verify unfamiliar calls against the Developer Reference
  and compile the generated code.
- Do not hide or remove Evaluation Mode markings. Use a 30-day evaluation or
  production license when clean output is required.

# Continue from a working example

The fastest way to expand a solution is to give the assistant a compiling Axyra
example and request one change. Start with the
[manual Quick Start]({{ site.axyra_tutorial }}/quick_start), then ask it to add
one of these capabilities:

- [Read and write an existing file]({{ site.axyra_tutorial }}/read_write)
- [Render PDF and images]({{ site.axyra_tutorial }}/render)
- [Fill an Excel template with Smart Markers]({{ site.axyra_devref }}/Smart_Markers)
- [Stream a large export]({{ site.axyra_devref }}/Streaming)
