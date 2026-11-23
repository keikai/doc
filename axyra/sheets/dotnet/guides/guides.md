---
title: 'Axyra Sheets Guides for .NET'
excerpt: 'Task-oriented C# guides for Axyra Sheets for .NET: create, read, write, recalculate, export, and convert Excel files to PDF without Office.'
permalink: /axyra/sheets/dotnet/guides/
redirect_from:
  - /axyra/dotnet/guides/
toc: false
sidebar:
  nav: "axyra-dotnet-guides"
---

Task-oriented walkthroughs for C# and .NET developers. Each one starts from an
empty console project and ends with a complete, runnable program, and each links
into the [Developer Reference]({{ site.axyra_dotnet_devref }}) for the full API rather
than restating it.

Every guide uses the `Axyra.Sheets` NuGet package (.NET 8 or later) from the
evaluation feed; the one-time setup is in
[What you need]({{ site.axyra_dotnet }}/guides/create-excel-file-csharp#what-you-need).
If you are new to Axyra Sheets, start with the
[Quick Start]({{ site.axyra_dotnet_tutorial }}/quick_start) instead — it is shorter and
covers the object model these guides assume.

# Guides

| Guide | What it covers |
|---|---|
| [How to Create an Excel File in C#]({{ site.axyra_dotnet }}/guides/create-excel-file-csharp) | An `.xlsx` from scratch: values, formulas, formatting, column widths |
| [How to Read an Excel File in C#]({{ site.axyra_dotnet }}/guides/read-excel-file-csharp) | Opening a workbook or an upload, reading typed values in bulk, handling formula errors |
| [Read Excel Cell Values in C#]({{ site.axyra_dotnet }}/guides/read-excel-cell-values-csharp) | Text, numbers, dates, blanks, errors, and formula results mapped to typed C# records |
| [Read Large Excel Files Efficiently in C#]({{ site.axyra_dotnet }}/guides/read-large-excel-files-efficiently-csharp) | Bulk range reads, bounded async row batches, numeric fast paths, memory and concurrency limits |
| [Recalculate Excel Formulas in C#]({{ site.axyra_dotnet }}/guides/evaluate-recalculate-excel-formulas-csharp) | Automatic and manual calculation, `Recalculate()` vs `RecalculateDirty()`, expression evaluation, formula errors |
| [How to Convert Excel to PDF in C#]({{ site.axyra_dotnet }}/guides/convert-excel-to-pdf-csharp) | Server-side PDF rendering, page setup, fonts, watermarks, ASP.NET Core downloads |
| [How to Write Data to Excel in C#]({{ site.axyra_dotnet }}/guides/write-data-to-excel-csharp) | Populating a sheet from a list, an ADO.NET query, or JSON, including very large streaming exports |
| [How to Export Excel Files in C#]({{ site.axyra_dotnet }}/guides/export-excel-files-csharp) | XLSX, XLS, CSV, ODS, JSON, PDF, HTML, streams, encryption, and values-only output |
| [Automate Excel Reports in C# with Templates]({{ site.axyra_dotnet }}/guides/generate-excel-reports-csharp) | Filling a designed template with template markers, totals, PDF output, and scheduling with a background service |

# Where to go next

- [Quick Start]({{ site.axyra_dotnet_tutorial }}/) — the guided path, in order
- [Developer Reference]({{ site.axyra_dotnet_devref }}) — the API, by topic
- [Supported Formats]({{ site.axyra_dotnet_devref }}/Supported_Formats) — what is
  modeled, what is preserved, and the known limits
- [Guides for Java]({{ site.axyra_guides }}/) — the same tasks with the Java SDK
