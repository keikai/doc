---
title: 'Rendering'
permalink: /axyra/dev-ref/Rendering
---

{% include axyra_example.html path="devref/RenderingReferenceExample.java" %}

The rendering pipeline lays out a workbook into pages much like a spreadsheet application, then exports those pages to PDF, image formats such as PNG, or SVG. These formats use the same page layout, so a PDF page and a PNG of the same sheet remain consistent. HTML export is handled separately and represents a sheet as a styled table.

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

```java
wb.saveHtml(Path.of("out.html"), HtmlOptions.create()
        .singleFile(true)
        .imagesAsBase64(true)
        .cssSeparately(false)
        .attachedFilesDirectory("assets")
        .imageUrlPrefix("/static/sheets/"));
```

| Option | Effect |
|---|---|
| `singleFile(true)` | Everything in one `.html` — no sidecar files |
| `imagesAsBase64(true)` | Inline images as data URIs; needed for a true single file |
| `cssSeparately(true)` | Emit a separate stylesheet instead of inline styles |
| `attachedFilesDirectory` | Where sidecar files are written |
| `imageUrlPrefix` | Prefix for image URLs, when they are served from elsewhere |

`singleFile(true)` with `imagesAsBase64(false)` is contradictory — the images
would have nowhere to live. Set them together.

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
