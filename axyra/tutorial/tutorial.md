---
title: 'Axyra Sheets Quick Start'
permalink: /axyra/quick-start
---
Axyra Sheets is a Java API for server-side spreadsheet processing, including reading, writing, calculating, and rendering Excel files. It supports modern formulas, charts, pivot tables, PDF/image output, and other advanced spreadsheet workflows without requiring Microsoft Office.

# Choose how you want to start

Axyra Sheets supports two equally valid development paths. Both produce the same
Java project and use the same public API; the difference is whether you write the
first implementation yourself or collaborate with an AI coding assistant.

| Path | Start here |
|---|---|
| **AI-assisted development** | **[Build with an AI coding assistant]({{ site.axyra_devref }}/AI_Assisted_Development)** — give your assistant the Axyra documentation and examples, describe the spreadsheet task, then verify the generated workbook. |
| **Manual development** | **[Build your first workbook by hand]({{ site.axyra_tutorial }}/quick_start)** — add the dependency, create cells and formulas, recalculate, and save an XLSX file. |

If you are unsure, start with the AI-assisted path. It still shows the generated
code and the commands used to build it, so you remain in control of the result.

# Continue learning

After creating your first workbook, continue with these short exercises:

1. **[Read and Write Files]({{ site.axyra_tutorial }}/read_write)** — open an
   existing XLSX, edit it, recalculate, and save it back.
2. **[Render to PDF and Images]({{ site.axyra_tutorial }}/render)** — turn a
   workbook into a paginated PDF or a PNG.

# Requirements

- **Java 17** or later.
- One of the supported platforms: macOS (x86-64, aarch64), Linux (x86-64,
  aarch64), Windows (x86-64). The published SDK bundles a native library for
  each supported platform.
- No license key is required to start. The SDK initially runs in Evaluation
  Mode; distributed production builds mark saved workbook output. See
  [Licensing and Evaluation]({{ site.axyra_devref }}/License).

# Where to go next

Once the tutorial makes sense, the
[Developer Reference]({{ site.axyra_devref }}) covers each area in depth, and
the [Javadoc]({{ site.axyra_javadoc }}) documents every public class.
