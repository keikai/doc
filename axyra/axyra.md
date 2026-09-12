---
title: 'Axyra Sheets Documentation'
permalink: /axyra
toc: false
---

**Axyra Sheets** is an embeddable, Excel-compatible spreadsheet **engine**. It is written
in Rust and shipped to Java through a native SDK, so it reads and writes real
spreadsheet files, evaluates formulas, and renders pages to PDF or images
entirely on the server — with no browser and no UI.

# Documentation

| | |
|---|---|
| **[Quick Start]({{ site.axyra_tutorial }})** | Start with AI-assisted development or build your first workbook manually. |
| **[Developer Reference]({{ site.axyra_devref }})** | The full guide: AI-assisted development, workbook and sheet model, formulas, charts, import/export, rendering, and licensing. |
| **[Javadoc]({{ site.axyra_javadoc }})** | Generated API documentation for every public class in `io.keikai.axyra.sheets`. |

# What it does

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
