---
title: 'Axyra Sheets for .NET Documentation'
permalink: /axyra/sheets/dotnet/
redirect_from:
  - /axyra/dotnet/
toc: false
---

**Axyra Sheets** is an embeddable, Excel-compatible spreadsheet processing
**engine**, available to .NET applications as a NuGet package. It reads and writes
spreadsheet files, calculates formulas, and renders PDF or images without
requiring Microsoft Office.

```csharp
using Axyra.Sheets;

using Workbook wb = new Workbook();
Sheet sheet = wb.Sheets.Add("Sales");
sheet["A1:B1"].SetValues(new object?[,] { { "Units", "Price" } });
sheet["A2:B2"].SetNumbers(new double[] { 12, 4.25 });
sheet[1, 2].Formula = "A2*B2";       // 51, calculated as you write
wb.Save("sales.xlsx");
```

# Documentation

| | |
|---|---|
| **[Quick Start]({{ site.axyra_dotnet_tutorial }})** | Start with AI-assisted development or build your first workbook manually. |
| **[Developer Reference]({{ site.axyra_dotnet_devref }})** | The full guide: AI-assisted development, workbook and sheet model, formulas, charts, import/export, rendering, and licensing. |
| **[Task Guides]({{ site.axyra_dotnet }}/guides/)** | Practical C# workflows for reading, writing, formulas, exports, PDF and reports. |
| **API reference** | The `Axyra.Sheets` package ships XML documentation for every public type in the `Axyra.Sheets` namespaces; your IDE shows it as IntelliSense. |

Looking for Java? See the [Axyra Sheets for Java documentation]({{ site.axyra }}/).

# What it does
Axyra Sheets provides server-side spreadsheet processing for .NET applications, from file import and formula calculation to charts, pivot tables, and PDF/image rendering. It works directly with Excel files without requiring Microsoft Office.

| Area | Summary |
|---|---|
| **File formats** | XLSX, XLSM, XLSB, legacy XLS (BIFF8), ODS, CSV, JSON — read and write |
| **Formulas** | Excel-compatible parser and evaluator, 500+ built-in functions, array/spill semantics, iterative calculation, user-defined functions written as C# delegates |
| **Content objects** | Charts, pivot tables, tables, slicers, timelines, conditional formats, data validation, comments and threaded comments, hyperlinks, form controls, SmartArt, sparklines, OLE objects, VBA modules |
| **Output** | PDF (with encryption, watermarks, PDF/A), PNG / SVG / JPEG / GIF / BMP / TIFF, HTML |
| **Security** | Workbook encryption (read and write), OPC digital signatures, sheet and range protection |
| **Scale** | A columnar backend and a streaming writer for large sheets |
| **.NET shape** | `IDisposable` workbooks, properties and indexers, records with `with`, `async` open/save/render, nullable annotations; `net8.0` and `net10.0` |

{: .notice--warning}
Looking for a UI spreadsheet component? Visit [Keikai Spreadsheet](https://keikai.io) instead, or see [how Axyra Sheets and Keikai Spreadsheet compare]({{ site.axyra_dotnet_devref }}/Axyra_vs_Keikai).
