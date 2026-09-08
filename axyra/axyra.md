---
title: 'Axyra Sheets Documentation'
permalink: /axyra
toc: false
---

**Axyra Sheets** is an embeddable, Excel-compatible spreadsheet **engine**. It is written
in Rust and shipped to Java through a native SDK, so it reads and writes real
spreadsheet files, evaluates formulas, and renders pages to PDF or images
entirely on the server — with no browser and no UI.

{: .notice--warning}
**Axyra Sheets is not Keikai Spreadsheet.** They are two different products under
the same Keikai brand, with different APIs, different artifacts, and separate
documentation. If you are looking for the browser-based spreadsheet UI component
(`io.keikai.api.*`, ZK / JSP / JSF integration), you want the
[Keikai Spreadsheet documentation]({{ site.baseurl }}/dev-ref) instead — see
[Axyra Sheets vs. Keikai Spreadsheet]({{ site.axyra_devref }}/Axyra_vs_Keikai)
for a side-by-side comparison.

# Documentation

| | |
|---|---|
| **[Tutorial]({{ site.axyra_tutorial }})** | Start here. Add the dependency, create a workbook, read and write a file, and render a PDF — in about ten minutes. |
| **[Developer Reference]({{ site.axyra_devref }})** | The full guide: workbook and sheet model, cells and ranges, formulas, styles, charts, pivot tables, import/export, rendering, and licensing. |
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

# Which product do I need?

| You want to… | Use |
|---|---|
| Show an interactive, Excel-like spreadsheet **in the browser** | [Keikai Spreadsheet]({{ site.baseurl }}/dev-ref) |
| Read, write, calculate, or render spreadsheet files **on the server**, headless | **Axyra Sheets** |
| Both — a UI plus server-side file processing | Keikai Spreadsheet for the UI; Axyra Sheets is the engine underneath it |

Keikai Spreadsheet's own API (`io.keikai.api.*`) is unchanged and remains
supported. Internally it now delegates to Axyra Sheets, but existing callers do
not need to change anything. New, headless projects should target
`io.keikai.axyra.sheets.*` directly.
