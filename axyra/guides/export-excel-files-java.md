---
title: 'How to Export Excel Files in Java (XLSX, CSV, PDF, and More)'
excerpt: 'Export Excel files in Java with Axyra Sheets: save a workbook as XLSX, XLS, CSV, or ODS, write it to a stream or byte array, strip formulas or comments for outside recipients, encrypt it, and render it as PDF or HTML.'
permalink: /axyra/guides/export-excel-files-java
keyword: 'export Excel files in Java'
---

# How to Export Excel Files in Java

Once an application has built or updated a workbook, it still has to deliver it in a form the recipient can use. To export Excel files in Java, you usually need more than a single `save` call: an internal user may want a live XLSX with formulas, a partner may need values only, a legacy system may only accept CSV or XLS, and a manager may simply want a PDF. This guide shows how to cover each of those cases with Axyra Sheets for Java, using one workbook and a small set of export calls.

## TL;DR

- `wb.save(Path.of("out.xlsx"))` picks the format from the file extension. The same call writes `.xlsm`, `.xlsb`, `.xls`, `.ods`, `.csv`, and `.json`.
- Use `wb.save(outputStream, "xlsx")` or `wb.saveBytes("xlsx")` when the file goes to an HTTP response, a message, or object storage.
- Use `SaveOptions` with `FormulaPolicy.VALUES_ONLY` to send results without the formulas behind them, and `skipComments` or `skipHyperlinks` to remove internal notes.
- Use `saveEncrypted` for password protection, and `renderPdf` or `saveHtml` when the recipient only needs to read the data.
- Call `recalculate()` before exporting if formulas may be stale, because saving does not recalculate.

## Table of contents

- [Which export format should you choose?](#which-export-format-should-you-choose)
- [How do you save a workbook as an Excel file?](#how-do-you-save-a-workbook-as-an-excel-file)
- [How do you export to a stream or a byte array?](#how-do-you-export-to-a-stream-or-a-byte-array)
- [How do you export values without formulas?](#how-do-you-export-values-without-formulas)
- [How do you export a password-protected Excel file?](#how-do-you-export-a-password-protected-excel-file)
- [How do you export to CSV safely?](#how-do-you-export-to-csv-safely)
- [How do you export a read-only PDF or HTML version?](#how-do-you-export-a-read-only-pdf-or-html-version)
- [How do you convert an XLS file to XLSX?](#how-do-you-convert-an-xls-file-to-xlsx)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## Which export format should you choose?

XLSX is the default Excel format since Excel 2007. It is an [Office Open XML](https://en.wikipedia.org/wiki/Office_Open_XML) package, which means a ZIP archive of XML files that describe the sheets, styles, and formulas. It is the best-supported format in Axyra Sheets and the right default unless the recipient needs something else. The following table summarizes the other options.

| Format | Extension | Choose it when | Limitations |
|---|---|---|---|
| Excel Workbook | `.xlsx` | The recipient will open or edit the file in Excel | None for most uses |
| Excel Macro-Enabled Workbook | `.xlsm` | The source workbook contains VBA that must be kept | Macros are preserved but never executed by Axyra |
| Excel Binary Workbook | `.xlsb` | Large files where size and load speed matter | Less common in tools other than Excel |
| Excel 97-2003 | `.xls` | A legacy system accepts only the old format | 65,536 rows, 256 columns, no newer Excel features |
| OpenDocument Spreadsheet | `.ods` | The recipient uses LibreOffice or requires an open standard | Cached values only, formulas are not written |
| CSV | `.csv` | Another program imports the data | One sheet of plain text, no formulas or formatting |
| JSON | `.json` | You store or diff the workbook structure in your own system | Readable by Axyra, not by Excel |
| PDF | `.pdf` | The recipient only needs to read or print | Not editable |
| HTML | `.html` | The data is shown in a browser or an email | A styled table, not a full spreadsheet |

The [Supported Formats reference](https://doc.keikai.io/axyra/dev-ref/Supported_Formats) lists the complete feature matrix for each format.

## How do you save a workbook as an Excel file?

The `save` method chooses the format from the file extension, so exporting to a different format is a matter of changing the file name.

```java
import io.keikai.axyra.sheets.Workbook;
import java.nio.file.Path;

try (Workbook wb = Workbook.open(Path.of("budget.xlsx"))) {
    // ... update values

    wb.recalculate();                       // save writes cached results; refresh them first
    wb.save(Path.of("budget-2027.xlsx"));
    wb.save(Path.of("budget-2027.xlsb"));
    wb.save(Path.of("budget-2027.ods"));
}
```

You can save the same open workbook in several formats one after another, as the example does.

{: .notice--info}
**When does a workbook need `recalculate()`?** Every cell write already updates the formulas that depend on it. Results can still be stale for volatile functions such as `NOW()` and `RAND()`, for formulas created with `autoFill`, and for untouched formulas in a file you opened from another tool. Calling `recalculate()` once before saving covers all three cases.

## How do you export to a stream or a byte array?

Many exports never touch the local disk. A web application writes the file to an HTTP response, a batch job uploads it to object storage, and a service attaches it to an email. For those cases, write to an `OutputStream` or get the bytes directly. Because there is no file name, the format is given as a lowercase extension.

```java
// To any OutputStream, for example an HTTP response body
try (OutputStream out = response.getOutputStream()) {
    wb.save(out, "xlsx");
}

// To a byte array, for example for an email attachment or an S3 upload
byte[] bytes = wb.saveBytes("xlsx");
```

Open the stream in a `try` block, as above, so it is closed after the workbook has been written. For a complete web example with upload and download endpoints, see Import and Export Excel Files in Spring Boot (PLACEHOLDER-URL) <!-- TODO: author to insert the real link once the Spring Boot guide is published -->.

## How do you export values without formulas?

Sometimes the recipient should see results but not the model that produced them. A price quote should not expose the margin formula, and a partner's system may not support every Excel function. The `FormulaPolicy` setting in `SaveOptions` controls what happens to formulas on export.

| `FormulaPolicy` | Written to the file | Typical use |
|---|---|---|
| `KEEP` (default) | The formula and its cached result | Internal files that users will keep working with |
| `VALUES_ONLY` | Only the cached result | Files for customers, partners, or systems with unknown formula support |
| `BLANK` | Nothing; the cell is empty | Templates where calculated cells must be filled in by the recipient |

```java
import io.keikai.axyra.sheets.io.FormulaPolicy;
import io.keikai.axyra.sheets.io.SaveOptions;

wb.recalculate();   // VALUES_ONLY writes the cached result, so make sure it is current

wb.save(Path.of("quote-for-customer.xlsx"), SaveOptions.create()
        .formulaPolicy(FormulaPolicy.VALUES_ONLY)
        .skipComments(true)
        .skipHyperlinks(true));
```

The `skipComments` and `skipHyperlinks` options remove two kinds of content that often carry internal information, such as review notes and intranet links. The `FormulaPolicy` setting applies to XLSX output. ODS output always contains cached values only.

## How do you export a password-protected Excel file?

`saveEncrypted` writes the file with ECMA-376 agile encryption, which is the same encryption Excel applies when you set a password to open the file. The whole package is encrypted, so the contents cannot be read without the password.

```java
wb.saveEncrypted(Path.of("salaries.xlsx"), password);
```

This is different from sheet protection, which only sets a flag asking the spreadsheet application not to allow edits. Sheet protection does not keep anyone from reading the data, so use encryption when confidentiality is the goal. Deliver the password through a separate channel from the file.

## How do you export to CSV safely?

CSV is the most widely accepted import format, but it holds a single sheet of plain text without formulas, styles, or multiple sheets. If the workbook has several sheets, create a workbook containing only the sheet you want to export before saving it as CSV.

```java
wb.save(Path.of("orders.csv"));
```

When a CSV file is opened in a spreadsheet application, a cell that starts with `=`, `+`, `-`, or `@` can be interpreted as a formula. Attackers use this to run commands or leak data through a crafted value, an attack known as [CSV injection](https://owasp.org/www-community/attacks/CSV_Injection). Axyra Sheets neutralizes such cells on CSV export by default, so a customer name such as `=HYPERLINK(...)` is written as harmless text. Keep this in mind if you expected a formula to survive a CSV export; it will not, by design.

## How do you export a read-only PDF or HTML version?

When the recipient only needs to read or print the data, a PDF is easier to handle than a workbook. PDF rendering uses the sheet's own page setup, including the print area, orientation, and repeated header rows.

```java
import io.keikai.axyra.sheets.io.HtmlOptions;
import io.keikai.axyra.sheets.io.ImageOptions;
import io.keikai.axyra.sheets.io.PdfOptions;

wb.sheet("Summary").setLandscape(true);

wb.renderPdf(Path.of("summary.pdf"), PdfOptions.builder()
        .sheetNames("Summary")
        .fitTo(PdfOptions.Fit.WIDTH)
        .build());

byte[] pdf = wb.renderPdf(PdfOptions.builder().sheetNames("Summary").build());   // in memory

wb.saveHtml(Path.of("summary.html"), HtmlOptions.create().singleFile(true));     // styled table

byte[] png = wb.renderSheetPng(0, ImageOptions.builder().build());               // preview image
```

Rendering depends on the fonts available on the server. A missing font is replaced with a metric-compatible substitute, which can change line breaks, so install the fonts your workbooks use on the machines that render them. See [How to Convert Excel to PDF in Java](https://doc.keikai.io/axyra/guides/convert-excel-to-pdf-java) for page setup, fonts, and watermarks.

## How do you convert an XLS file to XLSX?

Conversion is an open followed by a save with a different extension. The same pattern converts between any pair of supported formats.

```java
try (Workbook wb = Workbook.open(Path.of("legacy-report.xls"))) {
    wb.save(Path.of("legacy-report.xlsx"));
}
```

The reverse direction needs more care. Saving to `.xls` loses anything that does not fit the old format, such as rows beyond 65,536 or features introduced after Excel 2003. Prefer `.xlsx` or `.xlsb` unless the recipient cannot read them.

{: .notice--warning}
**Exports made without a license carry evaluation marks.** In Evaluation Mode, Axyra Sheets inserts an "Axyra Evaluation Copy" sheet at the front of every saved workbook and adds a banner to PDF and image output. Install a license key at startup before you compare exported files with a reference or ship them to users. See [Licensing and Evaluation](https://doc.keikai.io/axyra/dev-ref/License).

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| Totals in the exported file are stale | `save` writes cached results without recalculating | Call `wb.recalculate()` before saving |
| `VALUES_ONLY` export contains old numbers | The cached values were not refreshed | Recalculate first, then save |
| Formulas are missing in the `.ods` file | ODS output writes cached values only | Export `.xlsx` when formulas must stay live |
| A formula in a CSV export became text | CSV injection protection is on by default | This is intended; export XLSX if formulas are required |
| Rows are missing from the `.xls` file | XLS is limited to 65,536 rows | Export `.xlsx` or `.xlsb` |
| The exported file has an extra first sheet | The application runs in Evaluation Mode | Install a license key at startup |
| The PDF looks different from Excel | Fonts used by the workbook are missing on the server | Install the fonts or pass `fontDirs` |
| The HTTP download is corrupted | The response stream was written to after the file, or the content type is wrong | Write only the file to the stream and set the XLSX media type |

## FAQ

### How do I export Excel files in Java?

Create or open a workbook with Axyra Sheets, then call `wb.save(Path.of("output.xlsx"))`. The format comes from the file extension, so the same call writes XLSX, XLSB, XLS, ODS, CSV, or JSON. Use `wb.save(outputStream, "xlsx")` or `wb.saveBytes("xlsx")` when the file does not go to disk.

### How do I export an Excel file without formulas in Java?

Save with `SaveOptions.create().formulaPolicy(FormulaPolicy.VALUES_ONLY)`. The exported file contains the cached results of every formula but not the formulas themselves. Call `recalculate()` first so that those cached results are current.

### How do I export an Excel file with a password in Java?

Call `wb.saveEncrypted(Path.of("file.xlsx"), password)`. This applies the same ECMA-376 agile encryption that Excel uses for a password to open, so the file cannot be read without the password.

### Can I export Excel to PDF in Java without Microsoft Office?

Yes, you can, because Axyra Sheets renders the workbook to PDF with its own layout engine, so it does not need Excel, LibreOffice, or any other office software on the server. Call `wb.renderPdf(path, options)` after setting up the page layout on the sheet.

### How do I export a single sheet from a multi-sheet workbook?

For PDF, pass the sheet name with `PdfOptions.builder().sheetNames("Summary")`. For CSV, which can only hold one sheet, build a workbook that contains only that sheet before saving.

## Next steps

- [Import and Export](https://doc.keikai.io/axyra/dev-ref/Import_and_Export) is the reference for every open and save option.
- [How to Create an Excel File in Java](https://doc.keikai.io/axyra/guides/create-excel-file-java) shows how to build the workbook you are exporting.
- How to Export Database Data to Excel in Java (PLACEHOLDER-URL) <!-- TODO: author to insert the real link once the database export guide is published --> covers exports that start from SQL.
