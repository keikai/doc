---
title: 'Render to PDF and Images'
permalink: /axyra/tutorial/render
---

Axyra Sheets includes a full rendering pipeline: it lays out pages the way a
spreadsheet application would — honouring page setup, print areas, scaling,
freeze panes, fonts, borders, charts, and images — and rasterises or vectorises
the result.

# A PDF in one line

```java
try (Workbook wb = Workbook.open(Path.of("report.xlsx"))) {
    wb.renderPdf(Path.of("report.pdf"));
}
```

# Controlling the output

`PdfOptions` is a builder. Everything is optional.

```java
import io.keikai.axyra.sheets.io.PdfOptions;

PdfOptions options = PdfOptions.builder()
        .title("Q3 Report")
        .author("Finance")
        .sheetNames("Summary", "Detail")   // only these sheets
        .pageRange("1-4")                  // only these pages
        .watermark("CONFIDENTIAL")
        .bookmarks(true)                   // one outline entry per sheet
        .build();

wb.renderPdf(Path.of("report.pdf"), options);
```

To render into memory instead of onto disk:

```java
byte[] pdf = wb.renderPdf(options);
```

## Encryption and permissions

```java
PdfOptions locked = PdfOptions.builder()
        .userPassword("open-me")     // required to open the document
        .ownerPassword("owner")      // required to change permissions
        .allowPrint(true)
        .allowCopy(false)
        .allowModify(false)
        .build();
```

## Archival output

`.pdfA(true)` produces PDF/A output — fonts fully embedded, no encryption, no
transparency. It cannot be combined with the password options above.

## Fonts

Rendering needs the fonts the workbook asks for. Point the engine at your font
directories when the defaults are not enough:

```java
PdfOptions.builder().fontDirs(List.of("/usr/share/fonts", "/opt/corp-fonts")).build();
```

A missing font falls back to a metric-compatible substitute, which changes line
breaks. If output must be pixel-stable across machines, ship the fonts.

# Images

Per sheet, to any of six raster or vector formats:

```java
import io.keikai.axyra.sheets.io.ImageOptions;
import io.keikai.axyra.sheets.io.Renderer;

ImageOptions image = ImageOptions.builder()
        .scale(2.0)          // 2× the nominal size
        .gridLines(true)     // draw grid lines even if the sheet hides them
        .page(1)             // one page of a multi-page sheet
        .build();

byte[] png = wb.renderSheetPng(0, image);
byte[] svg = wb.renderSheetSvg(0, image);

// The Renderer facade covers the rest
byte[] jpg  = Renderer.toJpeg(wb, 0, image);
byte[] tiff = Renderer.toTiff(wb, 0, image);
```

Use `scale(...)` for a multiple of the nominal size, or `targetWidthPx(...)` to
pin the output to an exact pixel width and let the engine derive the scale.

# Page count

Useful for progress reporting, or for splitting a large render into chunks:

```java
int pages = wb.sheetPageCount(0);
```

# HTML

Not a render, strictly — HTML export reproduces the sheet as a styled table
rather than as paginated output. It is the right choice for previewing a sheet in
a browser.

```java
import io.keikai.axyra.sheets.io.HtmlOptions;

// One self-contained file: every sheet in it, every image inlined.
wb.saveHtml(Path.of("report.html"), HtmlOptions.create().singleFile(true));

// Or the package shape Excel's "Save as Web Page" writes — report.html plus a
// report_files/ sidecar — but with images inlined so the sidecar holds none.
wb.saveHtml(Path.of("report.html"), HtmlOptions.create().imagesAsBase64(true));
```

`singleFile` and `imagesAsBase64` are not combined: a single document always
inlines its images, so `imagesAsBase64` is ignored when `singleFile` is set.

# Next

- [Rendering]({{ site.axyra_devref }}/Rendering) — the full options reference,
  page-layout rules, and font resolution
- [Developer Reference]({{ site.axyra_devref }})
