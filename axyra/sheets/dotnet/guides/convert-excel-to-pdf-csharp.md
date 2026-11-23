---
title: 'How to Convert Excel to PDF in C#'
excerpt: 'Convert Excel to PDF in C# and .NET without Office interop. Render XLSX to PDF on the server with Axyra Sheets, control sheets, page setup, fonts, watermarks, and encryption, and stream the PDF from ASP.NET Core.'
permalink: /axyra/sheets/dotnet/guides/convert-excel-to-pdf-csharp
redirect_from:
  - /axyra/dotnet/guides/convert-excel-to-pdf-csharp
keyword: 'convert Excel to PDF in C#'
sidebar:
  nav: "axyra-dotnet-guides"
---

Converting Excel to PDF in C# helps .NET applications share reports, invoices,
and other spreadsheet documents in a format intended for viewing and printing.
In this guide, we'll use Axyra Sheets for .NET to render an Excel workbook as PDF
on the server, without installing Excel, using Office interop, or running an
Office process. We'll start with a basic conversion, then configure sheet
selection, page layout, fonts, watermarks, and PDF output options. For a short
walkthrough of Axyra before diving in, see [Quick Start]({{ site.axyra_dotnet_tutorial }}/).
The package setup is in
[How to Create an Excel File in C#]({{ site.axyra_dotnet }}/guides/create-excel-file-csharp#what-you-need).

# The one-liner

```csharp
using Axyra.Sheets;

using Workbook wb = Workbook.Open("report.xlsx");
wb.SavePdf("report.pdf");
```

That is the whole conversion. Everything below is about controlling the result.
`wb.Save("report.pdf")` does the same, because `Save` routes a `.pdf` extension to
the renderer.

To return it from an ASP.NET Core endpoint instead of writing a file, render to
bytes with `ToPdf` and hand them to `Results.File`:

```csharp
app.MapGet("/reports/q3.pdf", async (CancellationToken ct) =>
{
    using Workbook wb = await Workbook.OpenAsync("report.xlsx", cancellationToken: ct);
    byte[] pdf = wb.ToPdf();
    return Results.File(pdf, "application/pdf", "report.pdf");
});
```

`SavePdfAsync(stream)` renders on the thread pool and writes to any `Stream`
asynchronously, so it is also safe on `HttpResponse.Body`, where Kestrel refuses
synchronous writes.

# Choosing what goes in

By default every visible worksheet is rendered. `PdfOptions` narrows it and adds
document metadata. Like every options type in the SDK, it is a `record` with
`init` properties.

```csharp
using Axyra.Sheets.IO;

var options = new PdfOptions
{
    Title = "Q3 Report",
    Author = "Finance",
    SheetNames = new[] { "Summary", "Detail" },   // by name
    PageRange = "1-4",                            // only these pages of the result
    Bookmarks = true,                             // one outline entry per sheet
};

wb.SavePdf("report.pdf", options);
```

Sheets can also be selected by 0-based index with `Sheets = new[] { 0, 2, 3 }`;
both lists are combined, in workbook order. Listing a hidden sheet explicitly
includes it, which is how you render something the workbook does not show
interactively. Because `PdfOptions` is a record, `options with { Watermark = "DRAFT" }`
copies it with one change.

{: .notice--warning}
**`SheetNames` is case-sensitive, and an unknown name fails the render** (an
`AxyraException` whose message starts `pdf render: Invalid export options:`)
rather than being silently skipped. This differs from `wb.Sheets["summary"]`,
which ignores case as Excel does. Feed it names you read back from `sheet.Name`,
not names typed by hand.

# Page layout

Pagination comes from the workbook's own page setup, so the highest-leverage
control is on the sheet's `PageSetup`, before you render:

```csharp
Sheet sheet = wb.Sheets["Summary"];
PageSetup page = sheet.PageSetup;

page.PrintArea = "A1:H60";                  // or null to clear
page.Orientation = PageOrientation.Landscape;
page.PaperSize = 9;                         // ECMA-376 ST_PaperSize: 1=Letter, 9=A4
page.Margins = new PageMargins(0.5, 0.5, 0.75, 0.75, 0.3, 0.3);  // L R T B header footer, inches
page.PrintTitleRows = "$1:$1";              // repeat the header row on every page
page.PrintGridlines = true;
page.Scale = 80;                            // percent; turns fit-to-page off
```

To make a wide sheet fit without hand-tuning the scale, override fit-to-page for
every selected sheet at render time:

```csharp
var fitted = new PdfOptions
{
    FitTo = PdfFit.Width,   // Width | Height | Page
};
```

`PdfFit.Width` puts all columns on one page width and lets the height run on —
usually what you want for a wide table. `PdfFit.Page` squeezes the whole sheet onto
a single page, which on a large sheet produces something unreadable. The override
applies to this export only; the workbook's page setup is not changed.

Margins are in inches and page scale is a percentage, both matching Excel's own
semantics. `PageMargins` is a record, so `page.Margins = page.Margins with { Top = 1.0 }`
changes one margin. See [Rendering]({{ site.axyra_dotnet_devref }}/Rendering) for the full
layout reference.

# How many pages will it be?

Useful for progress reporting, or for splitting a big render into chunks:

```csharp
int pages = wb.Sheets["Summary"].GetPageCount();
```

The count is a method on the sheet, so look the sheet up by name. A file saved in
Evaluation Mode starts with an extra **Axyra Evaluation Copy** sheet, so index
`0` is not necessarily your first sheet.

# Fonts

This is the one that bites in production. The renderer needs the fonts the
workbook asks for. Metric-compatible substitutes are bundled only for Calibri
(Carlito), Cambria (Caladea), and Arial (Liberation Sans); any other missing font
falls back to a font with different metrics, which changes line breaks and
therefore pagination. CJK text needs CJK fonts, such as Noto, installed.

The renderer scans the operating system's font folders. To make output
independent of what a given machine happens to have installed, ship the fonts
with your application and pass their folder in `FontDirectories`:

```csharp
var withFonts = new PdfOptions
{
    FontDirectories = new[] { "/usr/share/fonts", Path.Combine(AppContext.BaseDirectory, "fonts") },
};
```

Directories that do not exist are skipped rather than failing the render — which
is convenient and also why a typo in a path shows up as subtly different output
rather than as an error.

{: .notice--warning}
**A slim container image usually ships no fonts at all.** The
`mcr.microsoft.com/dotnet/aspnet` images are no exception. If output must be
pixel-stable across machines, install the fonts in the image (or copy them into
the publish output) and point `FontDirectories` at them. "It looks right on my
laptop" is not evidence.

# Watermarks

```csharp
var marked = new PdfOptions
{
    Watermark = "CONFIDENTIAL",
};
```

# Encryption and permissions

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

Permissions are requests the PDF format makes of the reader application, not
enforcement — anything that can display the document can extract its content.
Treat them as intent, and use the user password when you need an actual gate.
Setting a permission to `false` without any password throws, because an
unencrypted PDF carries no permissions.

# Archival output

```csharp
var archival = new PdfOptions { PdfA = true };
```

PDF/A embeds fonts fully and drops encryption and transparency, so it **cannot**
be combined with the password options above.

# The complete program

Converts every visible worksheet to a landscape, A4, fit-to-width PDF with a
repeated header row and per-sheet bookmarks. Put it in `Program.cs` of a
console project that references `Axyra.Sheets`:

```csharp
using Axyra.Sheets;
using Axyra.Sheets.IO;

const string source = "report.xlsx";
const string target = "report.pdf";

using Workbook wb = Workbook.Open(source);
var worksheets = new List<string>();

foreach (Sheet sheet in wb.Sheets)
{
    // Naming a hidden sheet would render it, so skip those too.
    if (sheet.SheetType != SheetType.Worksheet || sheet.Visibility != Visibility.Visible)
    {
        continue;
    }
    worksheets.Add(sheet.Name);

    PageSetup page = sheet.PageSetup;
    page.Orientation = PageOrientation.Landscape;
    page.PaperSize = 9;                                    // A4
    page.Margins = new PageMargins(0.5, 0.5, 0.75, 0.75, 0.3, 0.3);
    page.PrintTitleRows = "$1:$1";                         // header on every page
}

var options = new PdfOptions
{
    Title = "Quarterly Report",
    Author = "Finance",
    SheetNames = worksheets,
    FitTo = PdfFit.Width,
    Bookmarks = true,
    FontDirectories = new[] { "/usr/share/fonts" },
};

await wb.SavePdfAsync(target, options);

foreach (string name in worksheets)
{
    Console.WriteLine($"{name}: {wb.Sheets[name].GetPageCount()} page(s)");
}
Console.WriteLine("wrote " + target);
```

A runnable copy is in the .NET examples project:
`src/Axyra.Sheets.Examples/Guides/ExcelToPdfExample.cs`, run with
`dotnet run --project src/Axyra.Sheets.Examples -- guides/convert-excel-to-pdf`.

{: .notice--info}
**Evaluation builds render a notice too.** Without a license, a workbook that
was saved by an evaluation build carries the **Axyra Evaluation Copy** sheet, a
visible worksheet, so this program renders it as well, and PDF output carries an
evaluation banner. See [Licensing and Evaluation]({{ site.axyra_dotnet_devref }}/License).

# Other output formats

The same layout engine drives images. One printed page of a sheet, or a
rectangle of it, renders to PNG, SVG, JPEG, GIF, BMP or TIFF:

```csharp
var image = new ImageOptions
{
    Scale = 2.0,          // 2x nominal size (192 DPI)
    Gridlines = true,
    Page = 1,             // one page of a multi-page sheet, 1-based
};

Sheet summary = wb.Sheets["Summary"];

byte[] png  = summary.RenderImage(ImageFormat.Png, image);
byte[] svg  = summary.RenderImage(ImageFormat.Svg, image);
byte[] jpg  = summary.RenderImage(ImageFormat.Jpeg, image);
byte[] tiff = summary.RenderImage(ImageFormat.Tiff, image);

byte[] thumb = summary["A1:F20"].RenderImage(ImageFormat.Png, new ImageOptions { WidthInPixels = 320 });
```

Use `WidthInPixels` instead of `Scale` when you need an exact pixel width — the
engine derives the scale and keeps the aspect ratio. `RenderImageAsync` is the
non-blocking form. For a browser preview rather than paginated output, HTML
export is usually the better fit; see [Rendering]({{ site.axyra_dotnet_devref }}/Rendering).

{: .notice--info}
**XPS output is not available.** Saving to `.xps` throws `AxyraIoException`. Use
PDF for paginated output.

# Common mistakes

| Symptom | Cause |
|---|---|
| Line breaks and pagination differ between machines | Different fonts available. Ship the fonts and set `FontDirectories`. |
| Columns spill onto a second page | The sheet's own scale/fit setting. Use `FitTo = PdfFit.Width` or `PageSetup.Scale`. |
| The header row appears only on page 1 | `PageSetup.PrintTitleRows = "$1:$1"` was not set. |
| Render fails with "Invalid export options" | An unknown or wrongly cased sheet in `SheetNames`, a `PageRange` that selects no pages, or a permission without a password. Read names from the workbook. |
| PDF/A output rejects the password options | PDF/A forbids encryption. Pick one. |
| Blank or clipped pages | A print area narrower than the data, or a stale one saved in the file. Check `sheet.PageSetup.PrintArea`. |
| `InvalidOperationException: Synchronous operations are disallowed` | The PDF was written to `HttpResponse.Body` with a synchronous call. Use `Results.File(wb.ToPdf(), ...)` or `await wb.SavePdfAsync(response.Body)`. |
| Charts render but a map chart is an empty frame | Map charts are read and written but currently render as a placeholder. |

# Next steps

- [Rendering]({{ site.axyra_dotnet_devref }}/Rendering) — the full options reference, page-layout rules, font resolution
- [Automate Excel Reports in C# with Templates]({{ site.axyra_dotnet }}/guides/generate-excel-reports-csharp) — generate the workbook you are converting
- [Charts]({{ site.axyra_dotnet_devref }}/Charts) — what renders and how
- [Supported Formats]({{ site.axyra_dotnet_devref }}/Supported_Formats) — every output format
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_sheets }}/contact-sales), and [product details]({{ site.axyra_site_link }}).

# Beyond Excel-to-PDF Conversion

PDF conversion can be the final step of an automated reporting workflow.
Before rendering, Axyra Sheets can populate a workbook from application data,
recalculate formulas, and add charts or formatting. You can then save an
editable XLSX alongside the PDF, or render individual sheets as images for
previews. This allows one workbook to supply both the working spreadsheet and
the documents your application distributes.
