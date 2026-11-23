---
title: 'How to Export Excel Files in C# (XLSX, CSV, PDF, and More)'
excerpt: 'Export Excel files in C# and .NET with Axyra Sheets: save a workbook as XLSX, XLS, CSV, or ODS, write it to a Stream or byte array, strip formulas or comments for outside recipients, encrypt it, and render it as PDF or HTML.'
permalink: /axyra/sheets/dotnet/guides/export-excel-files-csharp
redirect_from:
  - /axyra/dotnet/guides/export-excel-files-csharp
keyword: 'export Excel files in C#'
sidebar:
  nav: "axyra-dotnet-guides"
---

# How to Export Excel Files in C#

Once an application has built or updated a workbook, it still has to deliver it in a form the recipient can use. To export Excel files in C#, you usually need more than a single `Save` call: an internal user may want a live XLSX with formulas, a partner may need values only, a legacy system may only accept CSV or XLS, and a manager may simply want a PDF. This guide shows how to cover each of those cases with Axyra Sheets for .NET, using one workbook and a small set of export calls.

## TL;DR

- `wb.Save("out.xlsx")` picks the format from the file extension. The same call writes `.xlsm`, `.xlsb`, `.xls`, `.ods`, `.csv`, `.json`, `.html`, and `.pdf`.
- Use `wb.SaveAsync(stream, WorkbookFormat.Xlsx)` or `wb.ToByteArray(WorkbookFormat.Xlsx)` when the file goes to an HTTP response, a message, or object storage.
- Use `SaveOptions` with `FormulaPolicy.ValuesOnly` to send results without the formulas behind them, and `SkipComments` or `SkipHyperlinks` to remove internal notes.
- Set `SaveOptions.Password` for password protection, and use `SavePdf` or `SaveHtml` when the recipient only needs to read the data.
- Call `Recalculate()` before exporting if formulas may be stale, because saving does not recalculate.

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
| Excel Binary Workbook | `.xlsb` | Large files where size and load speed matter | Less common in tools other than Excel; a workbook with threaded comments cannot be saved as `.xlsb` |
| Excel 97-2003 | `.xls` | A legacy system accepts only the old format | 65,536 rows, 256 columns, no newer Excel features |
| OpenDocument Spreadsheet | `.ods` | The recipient uses LibreOffice or requires an open standard | Formulas are written as OpenFormula; a formula with no OpenFormula equivalent, such as `XLOOKUP`, is written as its value |
| CSV | `.csv` | Another program imports the data | One sheet of plain text, no formulas or formatting |
| JSON | `.json` | Another program consumes the rows as JSON objects | The first sheet only, as an array of row objects keyed by the first row; not readable by Excel |
| PDF | `.pdf` | The recipient only needs to read or print | Not editable |
| HTML | `.html` | The data is shown in a browser or an email | A styled table, not a full spreadsheet |

The [Supported Formats reference]({{ site.axyra_dotnet_devref }}/Supported_Formats) lists the complete feature matrix for each format.

## How do you save a workbook as an Excel file?

The `Save` method chooses the format from the file extension, so exporting to a different format is a matter of changing the file name.

```csharp
using Axyra.Sheets;

using Workbook wb = Workbook.Open("budget.xlsx");
// ... update values

wb.Recalculate();                       // Save writes cached results; refresh them first
wb.Save("budget-2027.xlsx");
wb.Save("budget-2027.xlsb");
wb.Save("budget-2027.ods");
```

You can save the same open workbook in several formats one after another, as the example does. `SaveAsync(path)` does the same without blocking the calling thread.

{: .notice--info}
**When does a workbook need `Recalculate()`?** Every cell write already updates the formulas that depend on it, so a workbook you built or edited through the API saves current results. Results can still be stale for volatile functions such as `NOW()` and `RAND()`, for untouched formulas in a file you opened from another tool, and in `CalcMode.Manual`. Calling `Recalculate()` once before saving covers all three cases.

## How do you export to a stream or a byte array?

Many exports never touch the local disk. A web application writes the file to an HTTP response, a background job uploads it to object storage, and a service attaches it to an email. For those cases, write to a `Stream` or get the bytes directly. Because there is no file name, the format is given as a `WorkbookFormat` value.

```csharp
// To any writable Stream, for example an HTTP response body. The stream is left open.
await wb.SaveAsync(response.Body, WorkbookFormat.Xlsx);

// To a byte array, for example for an email attachment or a blob upload
byte[] bytes = wb.ToByteArray(WorkbookFormat.Xlsx);
```

`SaveAsync` serializes on the thread pool and then writes to the stream asynchronously, which Kestrel requires of `HttpResponse.Body`. In ASP.NET Core it is often simplest to return the bytes as a file result, which also sets the content type and the download name:

```csharp
app.MapGet("/budget.xlsx", () =>
{
    using Workbook wb = Workbook.Open("budget.xlsx");
    return Results.File(wb.ToByteArray(WorkbookFormat.Xlsx),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "budget-2027.xlsx");
});
```

## How do you export values without formulas?

Sometimes the recipient should see results but not the model that produced them. A price quote should not expose the margin formula, and a partner's system may not support every Excel function. The `FormulaPolicy` setting in `SaveOptions` controls what happens to formulas on export.

| `FormulaPolicy` | Written to the file | Typical use |
|---|---|---|
| not set (default) | Each format keeps the formulas it can carry | Internal files that users will keep working with |
| `Keep` | The formula and its cached result; a save that cannot keep every formula (`.csv`, or `.ods` with an Excel-only function) throws `ArgumentException` | Files whose formulas must survive |
| `ValuesOnly` | Only the cached result | Files for customers, partners, or systems with unknown formula support |
| `Blank` | Nothing; the cell is empty | Templates where calculated cells must be filled in by the recipient |

```csharp
using Axyra.Sheets.IO;

wb.Recalculate();   // ValuesOnly writes the cached result, so make sure it is current

wb.Save("quote-for-customer.xlsx", new SaveOptions
{
    FormulaPolicy = FormulaPolicy.ValuesOnly,
    SkipComments = true,
    SkipHyperlinks = true,
});
```

The `SkipComments` and `SkipHyperlinks` options remove two kinds of content that often carry internal information, such as review notes and intranet links; they apply to XLSX output. The same `SaveOptions` goes to every overload of `Save`, `SaveAsync`, and `ToByteArray`.

## How do you export a password-protected Excel file?

Setting `SaveOptions.Password` writes the file with ECMA-376 agile encryption, which is the same encryption Excel applies when you set a password to open the file. The whole package is encrypted, so the contents cannot be read without the password. (A `.xls` name is encrypted as BIFF8 with RC4 CryptoAPI instead.)

```csharp
wb.Save("salaries.xlsx", new SaveOptions { Password = password });
```

The recipient, or your own code, opens it with the same password:

```csharp
using Workbook salaries = Workbook.Open("salaries.xlsx", new OpenOptions { Password = password });
```

A password cannot yet be combined with the export options above (`FormulaPolicy`, `SkipComments`, `SkipHyperlinks`); that combination throws `NotSupportedException`. An empty password throws `ArgumentException`.

This is different from sheet protection, which only sets a flag asking the spreadsheet application not to allow edits. Sheet protection does not keep anyone from reading the data, so use encryption when confidentiality is the goal. Deliver the password through a separate channel from the file.

## How do you export to CSV safely?

CSV is the most widely accepted import format, but it holds a single sheet of plain text without formulas, styles, or multiple sheets. `Save("orders.csv")` writes the *active* sheet. To choose the sheet, the delimiter, or raw values instead of display text, use `SaveCsv`:

```csharp
wb.SaveCsv("orders.csv", new CsvOptions
{
    SheetName = "Orders",          // or SheetIndex; by default the active sheet
    Delimiter = ';',               // one ASCII character
    Values = CsvValues.Raw,        // stored numbers instead of display text
    Utf8Bom = true,                // Excel's "CSV UTF-8"
});
```

`CsvValues.Formatted` (the default) writes what each cell shows, `13%` for `0.125` formatted `0%`; `CsvValues.Raw` writes `0.125`, which suits a data feed. Dates are written as `yyyy-mm-dd` either way.

When a CSV file is opened in a spreadsheet application, a cell that starts with `=`, `+`, `-`, or `@` can be interpreted as a formula. Attackers use this to run commands or leak data through a crafted value, an attack known as [CSV injection](https://owasp.org/www-community/attacks/CSV_Injection). Axyra Sheets writes text cells to CSV verbatim, as Excel does, so a customer name such as `=HYPERLINK(...)` reaches the file unchanged. (When Axyra itself *reads* a CSV, such a field stays text.) If the text comes from untrusted users and the file will be opened in Excel, neutralize it when you write the cells, for example by prefixing an apostrophe:

```csharp
static string? NeutralizeCsvText(string? text) =>
    text is { Length: > 0 } && text[0] is '=' or '+' or '-' or '@' ? "'" + text : text;

sheet[row, 1].Value = NeutralizeCsvText(customerName);
```

## How do you export a read-only PDF or HTML version?

When the recipient only needs to read or print the data, a PDF is easier to handle than a workbook. PDF rendering uses the sheet's own page setup, including the print area, orientation, and repeated header rows.

```csharp
wb.Sheets["Summary"].PageSetup.Orientation = PageOrientation.Landscape;

wb.SavePdf("summary.pdf", new PdfOptions
{
    SheetNames = new[] { "Summary" },
    FitTo = PdfFit.Width,
});

byte[] pdf = wb.ToPdf(new PdfOptions { SheetNames = new[] { "Summary" } });   // in memory

wb.SaveHtml("summary.html", new HtmlOptions { SingleFile = true });           // styled table

byte[] png = wb.Sheets["Summary"].RenderImage(ImageFormat.Png);                // preview image
```

`SaveHtml` with `SingleFile = true` writes one self-contained document with every sheet and inlined images; a plain `Save("summary.html")` writes Excel's *Save as Web Page* shape, a page plus a `summary_files/` folder.

Rendering depends on the fonts available on the server. A missing font is replaced with a substitute, which can change line breaks, so install the fonts your workbooks use on the machines that render them. See [How to Convert Excel to PDF in C#]({{ site.axyra_dotnet }}/guides/convert-excel-to-pdf-csharp) for page setup, fonts, and watermarks.

## How do you convert an XLS file to XLSX?

Conversion is an open followed by a save with a different extension. The same pattern converts between any pair of supported formats.

```csharp
using Workbook legacy = Workbook.Open("legacy-report.xls");
legacy.Save("legacy-report.xlsx");
```

The reverse direction needs more care. Saving to `.xls` loses anything that does not fit the old format, such as rows beyond 65,536 or features introduced after Excel 2003. Prefer `.xlsx` or `.xlsb` unless the recipient cannot read them.

{: .notice--warning}
**Exports made without a license carry evaluation marks.** In Evaluation Mode, Axyra Sheets inserts an "Axyra Evaluation Copy" sheet at the front of every saved workbook, appends a notice row below each sheet's data, adds a notice line to CSV and JSON output, and adds a banner to PDF and image output. Install a license key at startup before you compare exported files with a reference or ship them to users. See [Licensing and Evaluation]({{ site.axyra_dotnet_devref }}/License).

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| Totals in the exported file are stale | `Save` writes cached results without recalculating | Call `wb.Recalculate()` before saving |
| `ValuesOnly` export contains old numbers | The cached values were not refreshed | Recalculate first, then save |
| Some formulas are values in the `.ods` file | The formula has no OpenFormula equivalent | Export `.xlsx` when every formula must stay live |
| `ArgumentException` saving with `FormulaPolicy.Keep` | The format cannot carry every formula (CSV, or ODS with an Excel-only function) | Leave the policy unset, or pick a format that keeps formulas |
| `NotSupportedException` saving with a password | A password was combined with `FormulaPolicy` or `Skip…` options | Encrypt without the export options, or export first and encrypt separately |
| A CSV export contains the wrong sheet | `Save("x.csv")` writes the active sheet | Use `SaveCsv` with `SheetName` |
| Rows are missing from the `.xls` file | XLS is limited to 65,536 rows | Export `.xlsx` or `.xlsb` |
| The exported file has an extra first sheet | The application runs in Evaluation Mode | Install a license key at startup |
| The PDF looks different from Excel | Fonts used by the workbook are missing on the server | Install the fonts or set `PdfOptions.FontDirectories` |
| The HTTP download is corrupted | Something else was written to the response, or the content type is wrong | Return `Results.File(bytes, contentType, fileName)` and nothing else |

## FAQ

### How do I export Excel files in C#?

Create or open a workbook with Axyra Sheets, then call `wb.Save("output.xlsx")`. The format comes from the file extension, so the same call writes XLSX, XLSB, XLS, ODS, CSV, or JSON. Use `await wb.SaveAsync(stream, WorkbookFormat.Xlsx)` or `wb.ToByteArray(WorkbookFormat.Xlsx)` when the file does not go to disk.

### How do I export an Excel file without formulas in C#?

Save with `new SaveOptions { FormulaPolicy = FormulaPolicy.ValuesOnly }`. The exported file contains the cached results of every formula but not the formulas themselves. Call `Recalculate()` first so that those cached results are current.

### How do I export an Excel file with a password in C#?

Call `wb.Save("file.xlsx", new SaveOptions { Password = password })`. This applies the same ECMA-376 agile encryption that Excel uses for a password to open, so the file cannot be read without the password.

### Can I export Excel to PDF in C# without Microsoft Office?

Yes, you can, because Axyra Sheets renders the workbook to PDF with its own layout engine, so it does not need Excel, Office interop, LibreOffice, or any other office software on the server. Call `wb.SavePdf(path, options)` after setting up the page layout on the sheet.

### How do I export a single sheet from a multi-sheet workbook?

For PDF, pass the sheet name with `new PdfOptions { SheetNames = new[] { "Summary" } }`. For CSV, which can only hold one sheet, use `wb.SaveCsv(path, new CsvOptions { SheetName = "Summary" })`. For a single-sheet XLSX, `wb.SplitToFiles(directory, "{name}.xlsx")` writes one workbook per sheet.

## Next steps

- [Import and Export]({{ site.axyra_dotnet_devref }}/Import_and_Export) is the reference for every open and save option.
- [How to Create an Excel File in C#]({{ site.axyra_dotnet }}/guides/create-excel-file-csharp) shows how to build the workbook you are exporting.
- [How to Write Data to Excel in C#]({{ site.axyra_dotnet }}/guides/write-data-to-excel-csharp) covers exports that start from a list, a database query, or JSON.
- **Explore Axyra Sheets** — See [live demos]({{ site.axyra_site_link }}/demo/), [pricing]({{ site.axyra_sheets }}/contact-sales), and [product details]({{ site.axyra_site_link }}).
