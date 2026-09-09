---
title: 'Import and Export'
permalink: /axyra/dev-ref/Import_and_Export
---

{% include axyra_example.html path="devref/ImportExportExample.java" %}

# Opening

```java
Workbook.open(Path.of("book.xlsx"));
Workbook.open(Path.of("book.xlsx"), "pa55w0rd");
Workbook.openBytes(bytes, "xlsx");
Workbook.openBytes(bytes, "xlsx", "pa55w0rd");
Workbook.open(inputStream, "xlsx");
```

From a `Path`, the format comes from the file. From bytes or a stream there is no
name to inspect, so the format is an explicit lowercase extension: `"xlsx"`,
`"xlsm"`, `"xlsb"`, `"xls"`, `"ods"`, `"csv"`, `"json"`.

## Import options

```java
import io.keikai.axyra.sheets.ImportOptions;
```

`ImportOptions` also drives `Sheet.importData` for writing Java objects into a
sheet — see [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range).

# Saving

```java
wb.save(Path.of("out.xlsx"));                      // format from the extension
wb.save(Path.of("out.xlsx"), saveOptions);
wb.save(outputStream, "xlsx");
byte[] data = wb.saveBytes("xlsb");
wb.saveEncrypted(Path.of("out.xlsx"), "pa55w0rd");
wb.saveHtml(Path.of("out.html"), htmlOptions);
```

## Save options

```java
import io.keikai.axyra.sheets.io.SaveOptions;
import io.keikai.axyra.sheets.io.FormulaPolicy;

SaveOptions options = SaveOptions.create()
        .formulaPolicy(FormulaPolicy.VALUES_ONLY)
        .skipComments(true)
        .skipHyperlinks(true);
```

`FormulaPolicy` decides what happens to formulas on the way out:

| Value | Effect |
|---|---|
| `KEEP` | Formula and its cached value (the default) |
| `VALUES_ONLY` | Cached value only — the formula is dropped |
| `BLANK` | Neither — the cell is written blank |

`VALUES_ONLY` is how you hand a workbook to a recipient who should see results
but not the model behind them, and it is the safest choice when the consumer's
formula support is unknown. Note that it writes the **cached** value, so
recalculate before saving.

`skipComments` and `skipHyperlinks` are the two content classes most often
unwanted in an outbound file; both frequently carry internal notes or intranet
URLs.

# Encryption

Reading and writing are symmetric:

```java
Workbook wb = Workbook.open(Path.of("secret.xlsx"), "pa55w0rd");
wb.saveEncrypted(Path.of("secret-2.xlsx"), "new-pa55w0rd");
```

This is real ECMA-376 agile encryption — the whole package is encrypted, unlike
sheet or workbook protection, which only sets a flag a consumer may honour. ODS
encryption is supported as well.

# Digital signatures

OPC package signatures (XML-DSig), as Excel's "Add a Digital Signature" produces:

```java
byte[] signed = wb.sign(privateKey, certificate);
wb.sign(Path.of("signed.xlsx"), privateKey, certificate);

for (SignatureInfo info : wb.signatures()) {
    System.out.println(info);
}
```

Signing covers the package as saved. Editing a signed workbook and saving it
again invalidates the signature, which is the point — sign last.

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

```java
Workbook wb = Workbook.open(Path.of("data.csv"));
wb.save(Path.of("data-out.csv"));
```

On export, cells beginning with `=`, `+`, `-`, or `@` are neutralised so that
opening the file in a spreadsheet application does not execute them as formulas.
This is CSV injection defence and it is on by default — worth knowing if you
were expecting a formula to survive an export to CSV.

# JSON

A structural JSON representation of the workbook, useful for diffing, for
storing a workbook in a document database, or for handing sheet data to a
front end:

```java
byte[] json = wb.saveBytes("json");
Workbook restored = Workbook.openBytes(json, "json");
```

# Next

- [Supported Formats]({{ site.axyra_devref }}/Supported_Formats) — the support
  matrix and per-format limits
- [Rendering]({{ site.axyra_devref }}/Rendering)
- [Streaming Large Files]({{ site.axyra_devref }}/Streaming)
