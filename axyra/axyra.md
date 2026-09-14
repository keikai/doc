---
title: 'Axyra Sheets Documentation'
permalink: /axyra
toc: false
---

**Axyra Sheets** is an embeddable, Excel-compatible spreadsheet processing
**engine**, available to Java applications as a library. It reads and writes
spreadsheet files, calculates formulas, and renders PDF or images without
requiring Microsoft Office.

# Documentation

| | |
|---|---|
| **[Quick Start]({{ site.axyra_tutorial }})** | Start with AI-assisted development or build your first workbook manually. |
| **[Guides]({{ site.axyra_guides }})** | Task-oriented walkthroughs for creating and reading Excel files, exporting application data, generating reports, and converting Excel to PDF. |
| **[Developer Reference]({{ site.axyra_devref }})** | The full guide: AI-assisted development, workbook and sheet model, formulas, charts, import/export, rendering, and licensing. |

# What it does
Axyra Sheets provides server-side spreadsheet processing for Java applications, from file import and formula calculation to charts, pivot tables, and PDF/image rendering. It works directly with Excel files without requiring Microsoft Office.

| Area | Summary |
|---|---|
| **File formats** | XLSX, XLSM, XLSB, legacy XLS (BIFF8), ODS, CSV, JSON — read and write |
| **Formulas** | Excel-compatible parser and evaluator, ~490 built-in functions, array/spill semantics, iterative calculation, user-defined functions |
| **Content objects** | Charts, pivot tables, tables, slicers, timelines, conditional formats, data validation, comments and threaded comments, hyperlinks, form controls, SmartArt, sparklines, OLE objects, VBA modules |
| **Output** | PDF (with encryption, watermarks, PDF/A), PNG / SVG / JPEG / GIF / BMP / TIFF, HTML |
| **Security** | Workbook encryption (read and write), OPC digital signatures, sheet and range protection |
| **Scale** | A columnar backend and a streaming writer for large sheets |

{: .notice--warning}
Looking for a UI spreadsheet component? Visit [Keikai Spreadsheet](https://keikai.io) instead, or see [how Axyra Sheets and Keikai Spreadsheet compare]({{ site.axyra_devref }}/Axyra_vs_Keikai).
