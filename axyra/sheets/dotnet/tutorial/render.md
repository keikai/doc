---
title: 'Render to PDF and Images (.NET)'
permalink: /axyra/sheets/dotnet/quick-start/render
redirect_from:
  - /axyra/dotnet/quick-start/render
---

Axyra Sheets includes a full rendering pipeline that lays out pages much like a spreadsheet application, honoring page setup, print areas, scaling, fonts, borders, charts, and images, and exports the result to PDF or image formats.

# A PDF in one line

```csharp
using Workbook wb = Workbook.Open("report.xlsx");
wb.SavePdf("report.pdf");
```

`wb.Save("report.pdf")` does the same: a `.pdf` extension goes to the renderer.

# Controlling the output

`PdfOptions` is a record. Set only what you need in an object initializer;
everything is optional.

```csharp
using Axyra.Sheets.IO;

var options = new PdfOptions
{
    Title = "Q3 Report",
    Author = "Finance",
    SheetNames = new[] { "Summary", "Detail" },   // only these sheets
    PageRange = "1-4",                             // only these pages
    Watermark = "CONFIDENTIAL",
    Bookmarks = true,                              // one outline entry per sheet
};

wb.SavePdf("report.pdf", options);
```

To render into memory instead of onto disk, or without blocking the calling thread:

```csharp
byte[] pdf = wb.ToPdf(options);
await wb.SavePdfAsync("report.pdf", options);
```

Because `PdfOptions` is a record, `options with { Watermark = "DRAFT" }` makes a
variant without repeating the other settings.

## Encryption and permissions

```csharp
var locked = new PdfOptions
{
    UserPassword = "open-me",     // required to open the document
    OwnerPassword = "owner",      // required to change permissions
    AllowPrint = true,
    AllowCopy = false,
    AllowModify = false,
};
```

## Archival output

`PdfA = true` produces PDF/A-2b output — fonts fully embedded, no encryption, no
transparency. It cannot be combined with the password options above.

## Fonts

Rendering needs the fonts the workbook asks for. Point the engine at your font
directories when the defaults are not enough:

```csharp
var withFonts = new PdfOptions { FontDirectories = new[] { "/usr/share/fonts", "/opt/corp-fonts" } };
```

The renderer scans the usual macOS and Linux font directories, but not
`C:\Windows\Fonts`; on Windows, pass that folder (or your application's font
folder) in `FontDirectories`. Metric-compatible substitutes are bundled for Calibri
(Carlito), Cambria (Caladea), and Arial (Liberation Sans). Other missing fonts
fall back to a different font, which changes line breaks, and CJK text needs
CJK fonts (such as Noto) installed. If output must be pixel-stable across
machines, ship the fonts.

# Images

A sheet renders one printed page of itself, to any of six raster or vector formats:

```csharp
var image = new ImageOptions
{
    Scale = 2.0,          // 2× the nominal size
    Gridlines = true,     // draw grid lines even if the sheet hides them
    Page = 1,             // one page of a multi-page sheet
};

Sheet summary = wb.Sheets["Summary"];   // look the sheet up by name

byte[] png  = summary.RenderImage(ImageFormat.Png, image);
byte[] svg  = summary.RenderImage(ImageFormat.Svg, image);
byte[] jpg  = summary.RenderImage(ImageFormat.Jpeg, image);
byte[] tiff = summary.RenderImage(ImageFormat.Tiff, image);
```

Look the sheet up by name: a file saved in Evaluation Mode starts with an extra
**Axyra Evaluation Copy** sheet, so `wb.Sheets[0]` is not necessarily your first
sheet. `ImageFormat` also has `Gif` and `Bmp`. A range renders itself too, as a
print-area override: `summary["A1:F20"].RenderImage(ImageFormat.Png)`.

Use `Scale` for a multiple of the nominal size, or `WidthInPixels` to pin the
output to an exact pixel width and let the engine derive the scale.

# Page count

Useful for progress reporting, or for splitting a large render into chunks:

```csharp
int pages = wb.Sheets["Summary"].GetPageCount();
```

# HTML

Not a render, strictly — HTML export reproduces the sheet as a styled table
rather than as paginated output. It is the right choice for previewing a sheet in
a browser.

```csharp
// The package shape Excel's "Save as Web Page" writes — report.html plus a
// report_files/ sidecar holding each sheet, the stylesheet and the images.
wb.Save("report.html");

// Or one self-contained file: every sheet in it, every image inlined.
wb.SaveHtml("report.html", new HtmlOptions { SingleFile = true });
```

The package is the default for a path, and the shape a multi-sheet workbook needs
for its sheet tabs to work. Pick the single document when the file has to travel
on its own; `wb.ToByteArray(WorkbookFormat.Html)` always returns the single document.

{: .notice--info}
**Runnable example:** [`Tutorial/RenderExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/Tutorial/RenderExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- tutorial/render`.

# Next

- [Rendering]({{ site.axyra_dotnet_devref }}/Rendering) — the full options reference,
  page-layout rules, and font resolution
- [Developer Reference]({{ site.axyra_dotnet_devref }})
