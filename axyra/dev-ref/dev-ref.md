---
title: 'Axyra Sheets Developer Reference'
permalink: /axyra/dev-ref
toc: false
---

{: .notice--warning}
This is the reference for **Axyra Sheets**, the headless spreadsheet engine
(`io.keikai.axyra.sheets.*`). It has its own brand and is a different product
from Keikai Spreadsheet, the browser UI component (`io.keikai.api.*`) — that has its
[own developer reference]({{ site.baseurl }}/dev-ref). See
[Axyra Sheets vs. Keikai Spreadsheet]({{ site.axyra_devref }}/Axyra_vs_Keikai).

This documentation covers what you need to build with Axyra Sheets: the object
model, the API surface area by area, per-format behaviour, and the operational
concerns of shipping a native library.

# Prerequisites

Java 17 or later, and familiarity with spreadsheet concepts (cells, ranges,
formulas, number formats). No web framework is assumed — Axyra Sheets is a
library, not a component.

# Setup and operations

| | |
|---|---|
| [Installation]({{ site.axyra_devref }}/Installation) | Maven coordinates, bundled native libraries, supported platforms |
| [Native Library Loading]({{ site.axyra_devref }}/Native_Loader) | How the native library is found, extracted, and overridden |
| [Architecture]({{ site.axyra_devref }}/Architecture) | The Rust engine, the crate layering, and where the JNI boundary sits |
| [Licensing and Evaluation]({{ site.axyra_devref }}/License) | Evaluation Mode, 30-day evaluation keys, and production licenses |

# AI-assisted development

| | |
|---|---|
| [AI-Assisted Development]({{ site.axyra_devref }}/AI_Assisted_Development) | Give an AI coding assistant reliable Axyra context, generate a project, and verify its workbook output |

# The object model

| | |
|---|---|
| [Workbook and Sheet]({{ site.axyra_devref }}/Workbook_and_Sheet) | Lifecycle, sheet management, chart sheets, workbook settings |
| [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range) | `CellValue`, bulk reads and writes, structural edits, sorting, filling |
| [Formulas]({{ site.axyra_devref }}/Formulas) | Evaluation, calculation modes, arrays and spill, user-defined functions |
| [Styles and Formats]({{ site.axyra_devref }}/Styles) | `CellStyle`, colours, borders, themes, number format codes |

# Content

| | |
|---|---|
| [Charts]({{ site.axyra_devref }}/Charts) | The 20+ chart types, series, axes, layout, chart sheets |
| [Pivot Tables]({{ site.axyra_devref }}/Pivot_Table) | Fields, aggregation, filters, sorting, calculated fields, slicers, timelines |
| [Tables and Content Objects]({{ site.axyra_devref }}/Content_Objects) | Tables, conditional formats, validation, comments, hyperlinks, form controls, SmartArt, sparklines |

# Input and output

| | |
|---|---|
| [Import and Export]({{ site.axyra_devref }}/Import_and_Export) | Opening and saving, encryption, digital signatures, verbatim preservation |
| [Supported Formats]({{ site.axyra_devref }}/Supported_Formats) | Per-format support matrix and known limits |
| [Rendering]({{ site.axyra_devref }}/Rendering) | PDF, images, and HTML; page layout and font resolution |
| [Streaming Large Files]({{ site.axyra_devref }}/Streaming) | The write-only streaming API and the columnar backend |
| [Smart Markers]({{ site.axyra_devref }}/Smart_Markers) | Filling a template from Java objects |

# Migrating

| | |
|---|---|
| [Axyra Sheets vs. Keikai Spreadsheet]({{ site.axyra_devref }}/Axyra_vs_Keikai) | How the two products differ, and which to pick |

# Javadoc

Generated API documentation for every public class:
[{{ site.axyra_javadoc }}]({{ site.axyra_javadoc }})
