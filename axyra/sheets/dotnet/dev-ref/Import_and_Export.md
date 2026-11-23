---
title: 'Import and Export (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Import_and_Export
redirect_from:
  - /axyra/dotnet/dev-ref/Import_and_Export
---

# Opening

```csharp
using Axyra.Sheets.IO;

using Workbook a = Workbook.Open("book.xlsx");
using Workbook b = Workbook.Open("secret.xlsx", new OpenOptions { Password = "pa55w0rd" });
using Workbook c = Workbook.Open(bytes, WorkbookFormat.Xlsx);
using Workbook d = Workbook.Open(bytes, WorkbookFormat.Xlsx, new OpenOptions { Password = "pa55w0rd" });
using Workbook e = Workbook.Open(stream, WorkbookFormat.Xlsx);
using Workbook f = await Workbook.OpenAsync("book.xlsx", cancellationToken: ct);
```

From a path, the format comes from the file extension; when the extension and
the container disagree (a ZIP package named `.xls`), the container wins. An
unrecognised extension is refused with an `AxyraIoException` that lists the
readable ones, and a file that does not exist throws `FileNotFoundException`. From
bytes or a stream there is no name to inspect, so the format is an explicit
`WorkbookFormat`: `Xlsx`, `Xlsm`, `Xlsb`, `Xls`, `Ods`, `Csv`, `Json`, and the
others listed in [Supported Formats]({{ site.axyra_dotnet_devref }}/Supported_Formats).
`Open(Stream, …)` reads the rest of the stream into memory and leaves it open.

`OpenAsync` (for a path or a stream) parses on the thread pool so a request or UI
thread is not blocked; its `CancellationToken` is observed before the parse starts
and after it ends.

## Errors

```csharp
try
{
    using Workbook wb = Workbook.Open("upload.xlsx");
}
catch (FileNotFoundException ex)
{
    Console.Error.WriteLine($"no such file: {ex.FileName}");
}
catch (AxyraIoException ex)
{
    Console.Error.WriteLine($"cannot read it as a workbook: {ex.Message}");
}
```

`AxyraIoException` covers every file and format failure — an unsupported format, a
malformed workbook, a wrong or missing password. It derives from
`AxyraException`, the base of every engine failure.

## Import options

`ImportOptions` (in `Axyra.Sheets`) drives `Sheet.ImportData`, which writes .NET
objects into a sheet — see [Cells and Ranges]({{ site.axyra_dotnet_devref }}/Cell_and_Range#importing-net-objects).
`OpenOptions` carries the password for opening.

# Saving

```csharp
wb.Save("out.xlsx");                                    // format from the extension
wb.Save("out.xlsx", saveOptions);
wb.Save(outputStream, WorkbookFormat.Xlsx);             // leaves the stream open
byte[] data = wb.ToByteArray(WorkbookFormat.Xlsb);
wb.Save("secret-out.xlsx", new SaveOptions { Password = "pa55w0rd" });
wb.SaveHtml("out.html", new HtmlOptions { SingleFile = true });
await wb.SaveAsync("out.xlsx", cancellationToken: ct);
```

Every overload of `Save`, `SaveAsync`, and `ToByteArray` takes the same optional
`SaveOptions`. A `.pdf` or image extension goes to the renderer — see
[Rendering]({{ site.axyra_dotnet_devref }}/Rendering).

## Save options

```csharp
var saveOptions = new SaveOptions
{
    FormulaPolicy = FormulaPolicy.ValuesOnly,
    SkipComments = true,
    SkipHyperlinks = true,
};
```

`FormulaPolicy` decides what happens to formulas on the way out:

| Value | Effect |
|---|---|
| not set (`null`) | The default: each format keeps the formulas it can carry |
| `Keep` | Formula and its cached value — and a promise: a save that cannot keep every formula (to CSV, say) throws `ArgumentException` and writes nothing |
| `ValuesOnly` | Cached value only — the formula is dropped |
| `Blank` | Neither — the cell is written blank |

`ValuesOnly` is how you hand a workbook to a recipient who should see results
but not the model behind them, and it is the safest choice when the consumer's
formula support is unknown. Note that it writes the **cached** value, so
recalculate first when results can be stale.

`SkipComments` and `SkipHyperlinks` apply to XLSX, and are the two content classes
most often unwanted in an outbound file; both frequently carry internal notes or
intranet URLs.

# Encryption

Reading and writing are symmetric:

```csharp
using Workbook secret = Workbook.Open("secret.xlsx", new OpenOptions { Password = "pa55w0rd" });
secret.Save("secret-2.xlsx", new SaveOptions { Password = "new-pa55w0rd" });
```

This is real ECMA-376 agile encryption — the whole package is encrypted, unlike
sheet or workbook protection, which only sets a flag a consumer may honour. A
`.xls` is written with RC4 CryptoAPI encryption. The evaluated package
`1.0.0-fl.20261116` refuses encrypted ODS output with `AxyraException`;
verify support again when upgrading. A wrong password throws `AxyraIoException` (its message starts with
`wrong password`). In this release a password cannot be combined with
`FormulaPolicy`, `SkipComments`, or `SkipHyperlinks`: that save throws
`NotSupportedException`.

# Digital signatures

OPC package signatures (XML-DSig), as Excel's "Add a Digital Signature" produces:

```csharp
byte[] privateKey = File.ReadAllBytes("signer.key");    // PKCS#8 DER or PEM
byte[] certificate = File.ReadAllBytes("signer.crt");   // X.509 DER or PEM

byte[] signed = wb.Sign(privateKey, certificate);
wb.Sign("signed.xlsx", privateKey, certificate);

using (Workbook check = Workbook.Open("signed.xlsx"))
{
    foreach (SignatureInfo info in check.Signatures)
    {
        Console.WriteLine($"{info.Status} by {info.SignerName} ({info.Algorithm})");
    }
}
```

Signing requires a license that includes the `signatures` feature; in
Evaluation Mode `Sign` throws `AxyraException` naming the missing feature.
Validating signatures (`Signatures`) works in every mode.

The key may also be an RSA PKCS#1 key, or an EC P-256 key. `Signatures` reports
on the file as it was opened, so it is empty for a workbook created in code;
reopen the signed file to verify it. Each `SignatureInfo.Status` is `Valid`,
`Invalid`, or `Unsupported`; certificate trust (chain, expiry, revocation) is left
to your own policy.

Signing covers the package as saved and does not change the workbook object.
Saving it again writes an **unsigned** file — the writer drops the signature
parts rather than emit one that no longer verifies — so sign last, and re-sign
after every save that must stay signed.

# Verbatim preservation

Axyra Sheets deliberately carries through parts of a file it does not model, so
that a round trip does not silently drop features:

- VBA project and macro modules
- Custom XML parts and XML maps
- Unknown extension lists (`extLst`) — including newer Excel features
- OLE embeddings and ActiveX controls
- Custom document properties
- Drawing parts the model does not interpret

This is why `.xlsm` survives a round trip with its macros, and why a workbook
using an Excel feature newer than your Axyra Sheets build does not lose it.

Two honest caveats:

1. **A round trip is not byte-identical.** The parts the engine understands are
   rewritten. Do not build a workflow that depends on checksums matching.
2. **Preserved is not the same as modelled.** A preserved part is carried, not
   understood — the engine will not recalculate, render, or adjust it when you
   insert rows. If a feature matters to your application logic, verify it is
   modelled and not merely preserved.

# CSV

CSV is a single sheet of text, so the engine sniffs the delimiter, quoting,
encoding, and per-column types (numbers, dates, currencies, accounting
parentheses) on the way in.

```csharp
using Workbook csv = Workbook.Open("data.csv");
csv.Save("data-out.csv");
```

On export, the active sheet is written, and a formula cell is written as its
value; no formula survives. Cell text is written as is: the export does **not**
neutralise text that begins with `=`, `+`, `-`, or `@`. If a CSV file built from
untrusted input will be opened in a spreadsheet application, escape such text
yourself (CSV injection).

`SaveCsv` with `CsvOptions` picks the sheet, the delimiter, raw or formatted
numbers, and a UTF-8 byte-order mark:

```csharp
wb.SaveCsv("payments.csv", new CsvOptions
{
    SheetName = "Payments",
    Delimiter = ';',
    Values = CsvValues.Raw,     // stored numbers and ISO dates instead of display text
    Utf8Bom = true,             // Excel's "CSV UTF-8"
});
```

# JSON

JSON output is an array of row objects from one sheet, keyed by the header row —
the shape a front end or a REST client expects:

```csharp
byte[] json = wb.ToByteArray(WorkbookFormat.Json);   // [{"Region":"APAC","Amount":5.0}, …]
```

It is written from the **first** sheet and carries values only: no formulas,
styles, or other sheets, so it is not a way to store or diff a whole workbook. A
column without a header text is keyed `Column1`, `Column2`, … by position. Opening
JSON (`Workbook.Open(json, WorkbookFormat.Json)`) reads such an array back into a
single sheet. In Evaluation Mode, CSV and JSON output end with one extra row that
carries the evaluation notice.

{: .notice--info}
**Runnable example:** [`DevRef/ImportExportExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/ImportExportExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/import-export`.

# Next

- [Supported Formats]({{ site.axyra_dotnet_devref }}/Supported_Formats) — the support
  matrix and per-format limits
- [Rendering]({{ site.axyra_dotnet_devref }}/Rendering)
- [Streaming Large Files]({{ site.axyra_dotnet_devref }}/Streaming)
