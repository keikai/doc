---
title: 'How to Convert Excel to PDF in Java'
permalink: /axyra/guides/convert-excel-to-pdf-java
---

{% include axyra_example.html path="guides/ExcelToPdfExample.java" %}

Converting a spreadsheet to PDF on the server, with no Excel installed and no
headless Office process. Axyra Sheets lays out pages the way a spreadsheet
application would — page setup, print areas, scaling, freeze panes, fonts,
borders, charts, and images — and writes the PDF itself.

# The one-liner

```java
import io.keikai.axyra.sheets.Workbook;
import java.nio.file.Path;

try (Workbook wb = Workbook.open(Path.of("report.xlsx"))) {
    wb.renderPdf(Path.of("report.pdf"));
}
```

That is the whole conversion. Everything below is about controlling the result.

To stream it to an HTTP response instead of writing a file:

```java
byte[] pdf = wb.renderPdf(options);
response.setContentType("application/pdf");
response.getOutputStream().write(pdf);
```

# Choosing what goes in

By default every visible worksheet is rendered. `PdfOptions` narrows it and adds
document metadata.

```java
import io.keikai.axyra.sheets.io.PdfOptions;

PdfOptions options = PdfOptions.builder()
        .title("Q3 Report")
        .author("Finance")
        .sheetNames("Summary", "Detail")   // by name (case-sensitive)
        .pageRange("1-4")                  // only these pages of the result
        .bookmarks(true)                   // one outline entry per sheet
        .build();

wb.renderPdf(Path.of("report.pdf"), options);
```

Sheets can also be selected by 0-based index with `.sheets(0, 2, 3)`. Listing a
hidden sheet explicitly includes it, which is how you render something the
workbook does not show interactively.

{: .notice--warning}
**`sheetNames` is case-sensitive and an unknown name fails the render** rather
than being silently skipped. Feed it names you read back from
`wb.sheet(i).name()`, not names typed by hand.

# Page layout

Pagination comes from the workbook's own page setup, so the highest-leverage
control is on the `Sheet`, before you render:

```java
import io.keikai.axyra.sheets.Sheet;

Sheet sheet = wb.sheet(0);

sheet.setPrintArea("A1:H60");        // or null to clear
sheet.setLandscape(true);
sheet.setPaperSize(9);               // ECMA-376 ST_PaperSize: 1=Letter, 9=A4
sheet.setPageMargins(0.5, 0.5, 0.75, 0.75, 0.3, 0.3);  // L R T B header footer, inches
sheet.setPrintTitleRows("$1:$1");    // repeat the header row on every page
sheet.setPrintGridlines(true);
sheet.setPageScale(80);              // percent; disables fit-to-page
```

To make a wide sheet fit without hand-tuning the scale, override fit-to-page for
every selected sheet at render time:

```java
PdfOptions fitted = PdfOptions.builder()
        .fitTo(PdfOptions.Fit.WIDTH)   // WIDTH | HEIGHT | PAGE
        .build();
```

`Fit.WIDTH` puts all columns on one page width and lets the height run on —
usually what you want for a wide table. `Fit.PAGE` squeezes the whole sheet onto
a single page, which on a large sheet produces something unreadable.

Margins are in inches and page scale is a percentage, both matching Excel's own
semantics. See [Rendering]({{ site.axyra_devref }}/Rendering) for the full
layout reference.

# How many pages will it be?

Useful for progress reporting, or for splitting a big render into chunks:

```java
int pages = wb.sheetPageCount(0);
```

# Fonts

This is the one that bites in production. The renderer needs the fonts the
workbook asks for; a missing font falls back to a metric-compatible substitute,
which changes line breaks and therefore pagination.

```java
import java.util.List;

PdfOptions withFonts = PdfOptions.builder()
        .fontDirs(List.of("/usr/share/fonts", "/opt/corp-fonts"))
        .build();
```

Directories that do not exist are skipped rather than failing the render — which
is convenient and also why a typo in a path shows up as subtly different output
rather than as an error.

{: .notice--warning}
**A slim container image usually ships no fonts at all.** If output must be
byte-stable across machines, install the fonts in the image (or mount them) and
point `fontDirs` at them. "It looks right on my laptop" is not evidence.

# Watermarks

```java
PdfOptions marked = PdfOptions.builder()
        .watermark("CONFIDENTIAL")
        .build();
```

# Encryption and permissions

```java
PdfOptions locked = PdfOptions.builder()
        .userPassword("open-me")     // required to open the document
        .ownerPassword("owner")      // required to change permissions
        .allowPrint(true)
        .allowCopy(false)
        .allowModify(false)
        .build();
```

Permissions are requests the PDF format makes of the reader application, not
enforcement — anything that can display the document can extract its content.
Treat them as intent, and use the user password when you need an actual gate.

# Archival output

```java
PdfOptions archival = PdfOptions.builder().pdfA(true).build();
```

PDF/A embeds fonts fully and drops encryption and transparency, so it **cannot**
be combined with the password options above.

# The complete program

Converts a workbook to a landscape, A4, fit-to-width PDF with a repeated header
row and per-sheet bookmarks.

```java
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.SheetType;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.io.PdfOptions;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class ExcelToPdf {

    public static void main(String[] args) {
        Path source = Path.of("report.xlsx");
        Path target = Path.of("report.pdf");

        try (Workbook wb = Workbook.open(source)) {
            List<String> worksheets = new ArrayList<>();

            for (int i = 0; i < wb.sheetCount(); i++) {
                Sheet sheet = wb.sheet(i);
                if (sheet.sheetType() != SheetType.WORKSHEET) {
                    continue;
                }
                worksheets.add(sheet.name());

                sheet.setLandscape(true);
                sheet.setPaperSize(9);                 // A4
                sheet.setPageMargins(0.5, 0.5, 0.75, 0.75, 0.3, 0.3);
                sheet.setPrintTitleRows("$1:$1");      // header on every page
            }

            PdfOptions options = PdfOptions.builder()
                    .title("Quarterly Report")
                    .author("Finance")
                    .sheetNames(worksheets.toArray(new String[0]))
                    .fitTo(PdfOptions.Fit.WIDTH)
                    .bookmarks(true)
                    .fontDirs(List.of("/usr/share/fonts"))
                    .build();

            wb.renderPdf(target, options);

            int pages = wb.sheetPageCount(0);
            System.out.println("wrote " + target + "; first sheet is " + pages + " page(s)");
        }
    }
}
```

# Other output formats

The same layout engine drives images. Per sheet, to six raster or vector
formats:

```java
import io.keikai.axyra.sheets.io.ImageOptions;
import io.keikai.axyra.sheets.io.Renderer;

ImageOptions image = ImageOptions.builder()
        .scale(2.0)          // 2x nominal size
        .gridLines(true)
        .page(1)             // one page of a multi-page sheet
        .build();

byte[] png  = wb.renderSheetPng(0, image);
byte[] svg  = wb.renderSheetSvg(0, image);
byte[] jpg  = Renderer.toJpeg(wb, 0, image);
byte[] tiff = Renderer.toTiff(wb, 0, image);
```

Use `targetWidthPx(...)` instead of `scale(...)` when you need an exact pixel
width — the engine derives the scale. For a browser preview rather than
paginated output, HTML export is usually the better fit; see
[Rendering]({{ site.axyra_devref }}/Rendering).

{: .notice--info}
**XPS output is not available.** Use PDF for paginated output.

# Common mistakes

| Symptom | Cause |
|---|---|
| Line breaks and pagination differ between machines | Different fonts available. Ship the fonts and set `fontDirs`. |
| Columns spill onto a second page | The sheet's own scale/fit setting. Use `fitTo(Fit.WIDTH)` or `setPageScale`. |
| The header row appears only on page 1 | `setPrintTitleRows("$1:$1")` was not set. |
| Render fails with an unknown sheet name | `sheetNames` is case-sensitive and rejects unknown names. Read names from the workbook. |
| PDF/A output rejects the password options | PDF/A forbids encryption. Pick one. |
| Blank or clipped pages | A print area narrower than the data, or a stale one saved in the file. Check `sheet.printArea()`. |
| Charts render but a map chart is an empty frame | Map charts are read and written but currently render as a placeholder. |

# Next steps

- [Rendering]({{ site.axyra_devref }}/Rendering) — the full options reference, page-layout rules, font resolution
- [How to Create Excel Reports Automatically in Java]({{ site.axyra_guides }}/generate-excel-reports-java) — generate the workbook you are converting
- [Charts]({{ site.axyra_devref }}/Charts) — what renders and how
- [Supported Formats]({{ site.axyra_devref }}/Supported_Formats) — every output format
