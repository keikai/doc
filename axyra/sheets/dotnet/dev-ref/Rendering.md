---
title: 'Rendering (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Rendering
redirect_from:
  - /axyra/dotnet/dev-ref/Rendering
---

Use a full `Workbook` for PDF, images and HTML. `StreamWorkbook` cannot render.
Sheet page setup controls the print area, orientation, margins and repeated
headers. `PdfOptions` controls export selection, fit, fonts and PDF options.

```csharp
using Axyra.Sheets;
using Axyra.Sheets.IO;

using Workbook wb = new();
Sheet sheet = wb.Sheets.Add("Sales");
sheet["A1:B2"].SetValues(new object?[,] { { "Region", "Amount" }, { "APAC", 1250 } });
sheet.PageSetup.PrintArea = "A1:B2";
sheet.PageSetup.Orientation = PageOrientation.Landscape;
wb.SavePdf("sales.pdf", new PdfOptions { SheetNames = new[] { "Sales" }, FitTo = PdfFit.Page });
```

`FitTo` overrides the selected sheets' scaling for this export. Sheet selection
is by name here so evaluation notice sheets do not shift an index. Explicitly
selecting a hidden sheet exports it; an unknown name throws `AxyraException`.

`wb.ToPdf()` returns bytes; `sheet.RenderImage(ImageFormat.Png, options)` renders
an image. See the [rendering tutorial]({{ site.axyra_dotnet_tutorial }}/render)
for image formats, async output and further options.

Install fonts needed by your documents and pass application font directories in
`PdfOptions.FontDirectories` where necessary. Font substitution can change line
breaks and pagination; CJK output requires suitable CJK fonts.

Recalculate stale/manual formula caches before export. Check the page count and
visually inspect representative pages when appearance matters. A nonempty PDF
alone does not establish Excel layout equivalence. Evaluation output keeps its
banner; include it when judging pagination.
