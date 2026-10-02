---
title: 'Rendering'
permalink: /axyra/dev-ref/Rendering
---

The rendering pipeline lays out a workbook into pages much like a spreadsheet application, then exports those pages to PDF, image formats such as PNG, or SVG. These formats use the same page layout, so a PDF page and a PNG of the same sheet remain consistent. HTML export is handled separately and represents a sheet as a styled table.

# Page setup

Pagination comes from the workbook's own page setup, so most of what decides how
output looks is on the `Sheet`, set before you render. The render options carry
document-level concerns — which sheets, which pages, metadata, encryption — and
cannot substitute for it.

```java
Sheet sheet = wb.sheet(0);

sheet.setPrintArea("A1:H60");        // or null to clear
sheet.setLandscape(true);
sheet.setPaperSize(9);               // ECMA-376 ST_PaperSize: 1=Letter, 9=A4
sheet.setPageMargins(0.5, 0.5, 0.75, 0.75, 0.3, 0.3);  // L R T B header footer, inches
sheet.setPrintTitleRows("$1:$1");    // repeat the header row on every page
sheet.setPageScale(80);              // percent; disables fit-to-page
sheet.fitToPage(1, 1);               // or fit the printout to 1 page wide by 1 tall
```

Headers and footers, gridline and heading printing, page breaks, and page order
live on the sheet as well; the Javadoc for `Sheet` lists the full set. Because
PDF and image output share one layout pass, these settings apply to both.

[How to Convert Excel to PDF in Java]({{ site.axyra_guides }}/convert-excel-to-pdf-java)
walks through a complete A4, landscape, repeated-header conversion.

# PDF

```java
wb.renderPdf(Path.of("out.pdf"));
wb.renderPdf(Path.of("out.pdf"), options);
byte[] pdf = wb.renderPdf(options);

// or via the facade
Renderer.toPdf(wb, Path.of("out.pdf"), options);
byte[] same = Renderer.toPdf(wb, options);
```

## PdfOptions

```java
PdfOptions options = PdfOptions.builder()
        .title("Q3 Report")
        .author("Finance")
        .sheets(0, 2, 3)                  // by index
        .sheetNames("Summary", "Detail")  // or by name
        .pageRange("1-4,7")
        .fitTo(PdfOptions.Fit.WIDTH)
        .watermark("CONFIDENTIAL")
        .bookmarks(true)
        .fontDirs(List.of("/opt/corp-fonts"))
        .build();
```

| Option | Effect |
|---|---|
| `title`, `author` | PDF document metadata |
| `sheets(int...)`, `sheetNames(String...)` | Restrict which sheets are rendered |
| `pageRange(String)` | Restrict which pages, after layout — `"1-4,7"` |
| `fitTo(Fit)` | Override the workbook's scaling — `WIDTH`, `HEIGHT`, or `PAGE` |
| `watermark(String)` | Diagonal text on every page |
| `bookmarks(boolean)` | A PDF outline entry per sheet |
| `fontDirs`, `addFontDir` | Where to look for fonts |
| `pdfA(boolean)` | PDF/A archival output |
| `userPassword`, `ownerPassword`, `allowPrint`, `allowCopy`, `allowModify` | Encryption and permissions |

`pageRange` applies *after* pagination, so page 1 means the first page of the
rendered output, not of a particular sheet. Combine it with `sheets(...)` when
you want page 1 of a specific sheet.

## Encryption and permissions

```java
PdfOptions.builder()
        .userPassword("open-me")
        .ownerPassword("owner")
        .allowPrint(true)
        .allowCopy(false)
        .allowModify(false)
        .build();
```

The user password is required to open the document; the owner password is
required to change permissions. Permissions without an owner password are
advisory — any competent PDF tool can ignore them.

## PDF/A

`.pdfA(true)` embeds all fonts, drops transparency, and disallows encryption.
It cannot be combined with the password options: an archival document that
cannot be opened without a secret is not archival.

# Images

```java
ImageOptions image = ImageOptions.builder()
        .targetWidthPx(1600)     // pin the width and derive the scale
        .gridLines(true)
        .page(1)                 // one page of a multi-page sheet
        .fontDirs(List.of("/opt/corp-fonts"))
        .build();

byte[] png = wb.renderSheetPng(0, image);
byte[] svg = wb.renderSheetSvg(0, image);
byte[] jpg = Renderer.toJpeg(wb, 0, image);
byte[] gif = Renderer.toGif(wb, 0, image);
byte[] bmp = Renderer.toBmp(wb, 0, image);
byte[] tif = Renderer.toTiff(wb, 0, image);
```

Set `scale` **or** `targetWidthPx`, not both — the latter wins and makes the
former redundant. `gridLines` overrides the sheet's own grid-line setting, which
is what you want for a data preview and not what you want for a formatted
report.

SVG represents text as vector glyph outlines. It scales without resampling, but
the text is not selectable or searchable. Prefer it when resolution-independent
output matters; use HTML when searchable text matters.

## Page counts

```java
int pages = wb.sheetPageCount(0);
int same  = Renderer.pageCount(wb, 0);
```

Pagination depends on page setup, scaling, print area, and the fonts available —
so the count is a property of the render, not of the data. Ask for it rather than
computing it yourself.

# HTML

HTML export is not paginated. It reproduces the sheet as a styled table, which is
the right shape for a browser preview and the wrong shape for print.

There are two output shapes, and `HtmlOptions` picks between them.

```java
// The package (the default for a path)
wb.saveHtml(Path.of("report.html"), HtmlOptions.create());

// The single document
wb.saveHtml(Path.of("report.html"), HtmlOptions.create().singleFile(true));
```

| Shape | What is written |
|---|---|
| Package — the default | `report.html` plus a `report_files/` directory beside it: one page per sheet (`sheetNNN.htm`), the shared `stylesheet.css`, the sheet tab strip `tabstrip.htm`, one file per image (`imageNNN.png`), and the `filelist.xml` manifest |
| `singleFile(true)` | One self-contained file with every sheet in it and every image inlined as a `data:` URI |

The package is the shape Excel's own *Save as Web Page* writes, and what tools
that consume exported spreadsheet HTML expect — without it a multi-sheet workbook
has no way to reach sheets 2..n. Choose the single document when the page is
mailed, embedded, or served from memory and there must be nothing to lose track of.

`Workbook.save(path)` on a `.html` or `.htm` name writes the package. A byte sink
has nowhere to put a second file, so `Workbook.saveBytes("html")` always produces
the single document.

# Fonts

This is the single biggest source of "the output looks different on the server"
reports.

```java
PdfOptions.builder().fontDirs(List.of("/usr/share/fonts", "/opt/corp-fonts")).build();
ImageOptions.builder().addFontDir("/opt/corp-fonts").build();
```

The engine resolves a font by family, weight, and style, and falls back to a
metric-compatible substitute when the requested face is missing. A substitute has
different glyph widths, so **line breaks and column overflow change** — the
output is not merely a different typeface.

If output must be identical across machines:

1. Ship the exact fonts with your application.
2. Pass their directory explicitly rather than relying on system fonts.
3. Pin the same set in CI as in production. A container image is the easy way to
   guarantee this; a developer's laptop with Microsoft fonts installed and a slim
   Linux container without them is the classic mismatch.

CJK text needs a CJK-capable font present. The engine applies kinsoku line
breaking (no opening bracket at a line end, no closing bracket or period at a
line start), but a font that lacks the glyphs cannot be substituted
meaningfully — the result is tofu, not a fallback.

# What gets rendered

Charts, images, shapes, SmartArt, WordArt, sparklines, conditional-format colour
scales and data bars and icon sets, borders with correct conflict resolution,
merged cells, freeze panes, rotated and wrapped text, headers and footers, page
breaks, print titles, and watermarks.

The renderer draws the computed appearance of the workbook. Map charts are the
current exception: they render as a placeholder frame because geographic region
geometry is not yet part of the renderer.

# Next

- [Supported Formats]({{ site.axyra_devref }}/Supported_Formats)
- [Import and Export]({{ site.axyra_devref }}/Import_and_Export)
