---
title: 'Axyra Sheets for .NET Developer Reference'
permalink: /axyra/sheets/dotnet/dev-ref/
redirect_from:
  - /axyra/dotnet/dev-ref/
toc: false
---

Axyra Sheets for .NET is a C# API for processing spreadsheets on the server. It can read, write, calculate, and render Excel files, with support for modern formulas, charts, pivot tables, and PDF/image output.

This documentation covers what you need to build with Axyra Sheets: the object
model, the API surface area by area, per-format behaviour, and the operational
concerns of shipping a native engine inside a NuGet package.

# Prerequisites

.NET 8 or later, and familiarity with spreadsheet concepts (cells, ranges,
formulas, number formats). No web framework is assumed — Axyra Sheets is a
library, not a component, and works the same in a console app, a worker service,
an ASP.NET Core application, or an Azure Function.

# Setup and operations

New to Axyra Sheets? Start with the [Quick Start]({{ site.axyra_dotnet_tutorial }}/quick_start).

| | |
|---|---|
| [Installation]({{ site.axyra_dotnet_devref }}/Installation) | The NuGet package, package sources, bundled native libraries, supported platforms |
| [Native Library Loading]({{ site.axyra_dotnet_devref }}/Native_Loader) | How the native library is found and loaded, publishing, and the local override |
| [Architecture]({{ site.axyra_dotnet_devref }}/Architecture) | The Rust engine, the crate layering, and where the native boundary sits |
| [Licensing and Evaluation]({{ site.axyra_dotnet_devref }}/License) | Evaluation Mode, 30-day evaluation keys, and production licenses |

# AI-assisted development

| | |
|---|---|
| [AI-Assisted Development]({{ site.axyra_dotnet_devref }}/AI_Assisted_Development) | Give an AI coding assistant reliable Axyra context, generate a project, and verify its workbook output |

# The object model

| | |
|---|---|
| [Workbook and Sheet]({{ site.axyra_dotnet_devref }}/Workbook_and_Sheet) | Lifecycle, sheet management, chart sheets, workbook settings |
| [Cells and Ranges]({{ site.axyra_dotnet_devref }}/Cell_and_Range) | `CellValue`, bulk reads and writes, structural edits, sorting, filling |
| [Formulas]({{ site.axyra_dotnet_devref }}/Formulas) | Evaluation, calculation modes, arrays and spill, user-defined functions |
| [Styles and Formats]({{ site.axyra_dotnet_devref }}/Styles) | `CellStyle`, colours, borders, themes, number format codes |

# Content

| | |
|---|---|
| [Charts]({{ site.axyra_dotnet_devref }}/Charts) | The 20 chart types, series, axes, layout, chart sheets |
| [Pivot Tables]({{ site.axyra_dotnet_devref }}/Pivot_Table) | Fields, aggregation, filters, sorting, calculated fields, slicers, timelines |
| [Tables and Content Objects]({{ site.axyra_dotnet_devref }}/Content_Objects) | Tables, conditional formats, validation, comments, hyperlinks, form controls, SmartArt, sparklines |

# Input and output

| | |
|---|---|
| [Import and Export]({{ site.axyra_dotnet_devref }}/Import_and_Export) | Opening and saving, async I/O, encryption, digital signatures, verbatim preservation |
| [Supported Formats]({{ site.axyra_dotnet_devref }}/Supported_Formats) | Per-format support matrix and known limits |
| [Rendering]({{ site.axyra_dotnet_devref }}/Rendering) | PDF, images, and HTML; page layout and font resolution |
| [Streaming Large Files]({{ site.axyra_dotnet_devref }}/Streaming) | The write-only streaming API and the columnar backend |
| [Template Markers]({{ site.axyra_dotnet_devref }}/Template_Markers) | Filling a template from .NET objects and dictionaries |

# Choosing the right product

| | |
|---|---|
| [Axyra Sheets vs. Keikai Spreadsheet]({{ site.axyra_dotnet_devref }}/Axyra_vs_Keikai) | Potix offers two spreadsheet solutions. How they differ and which to pick |

# API reference

The `Axyra.Sheets` package carries XML documentation for every public type and
member. Visual Studio, Rider, and VS Code show it as IntelliSense and in their
object browsers; no separate download is needed.
