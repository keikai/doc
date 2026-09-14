---
title: 'Read and Write Files'
permalink: /axyra/quick-start/read_write
---

Opening an existing spreadsheet, changing it, and saving it back — without
losing anything the engine does not model.

# Open a file

```java
import io.keikai.axyra.sheets.Workbook;
import java.nio.file.Path;

try (Workbook wb = Workbook.open(Path.of("report.xlsx"))) {
    System.out.println(wb.sheetCount() + " sheets");
    for (int i = 0; i < wb.sheetCount(); i++) {
        System.out.println("  " + wb.sheet(i).name());
    }
}
```

The format is detected from the file. XLSX, XLSM, XLSB, XLS (BIFF8), ODS, CSV,
and JSON all open through the same call — see
[Supported Formats]({{ site.axyra_devref }}/Supported_Formats).

For an encrypted workbook, pass the password:

```java
Workbook wb = Workbook.open(Path.of("secret.xlsx"), "pa55w0rd");
```

# Open from memory or a stream

Useful when the file arrives over HTTP or out of a database. The format is
explicit here, because there is no filename to infer it from:

```java
byte[] bytes = ...;
try (Workbook wb = Workbook.openBytes(bytes, "xlsx")) { ... }

try (InputStream in = request.getInputStream();
     Workbook wb = Workbook.open(in, "xlsx")) { ... }
```

# Edit

```java
Sheet sheet = wb.sheet("Q3");

// A single cell
sheet.cell(4, 2).setValue(CellValue.number(1499.0));

// A whole block, in one native call
Range block = sheet.range("B2:D50");
block.setNumbers(new double[] { /* row-major, 3 × 49 values */ });

// Structure
sheet.insertRows(10, 3);
sheet.deleteColumns(7, 1);
sheet.setColumnWidth(0, 24.0);
sheet.freezePanes(1, 0);
```

Prefer the `Range` bulk setters (`setValues`, `setNumbers`, `setFormulas`) over
per-cell loops. Each `Cell` call crosses the JNI boundary; a `Range` call crosses
it once for the whole block.

# Recalculate

Editing marks dependents dirty but does not evaluate them.

```java
wb.recalculateDirty();   // only what changed — the usual choice
wb.recalculate();        // everything, unconditionally
```

You can also evaluate an expression without storing it anywhere:

```java
CellValue answer = wb.evaluate("SUM(Q3!B2:B50)");
```

# Save

```java
wb.save(Path.of("report-edited.xlsx"));
```

Saving to a different format is a matter of the extension, or of the sink:

```java
wb.save(Path.of("report.csv"));                        // by extension
byte[] xlsb = wb.saveBytes("xlsb");                    // to memory
wb.save(response.getOutputStream(), "xlsx");           // to a stream
wb.saveEncrypted(Path.of("report.xlsx"), "pa55w0rd");  // encrypted
```

`SaveOptions` controls what goes into an XLSX — most usefully, whether formulas
are written at all:

```java
import io.keikai.axyra.sheets.io.SaveOptions;
import io.keikai.axyra.sheets.io.FormulaPolicy;

wb.save(Path.of("report.xlsx"), SaveOptions.create()
        .formulaPolicy(FormulaPolicy.VALUES_ONLY)   // KEEP | BLANK | VALUES_ONLY
        .skipComments(true)
        .skipHyperlinks(true));
```

`VALUES_ONLY` writes each formula's last calculated result instead of the
formula, which is what you want when the recipient should not see how a number
was derived. Recalculate before saving, or you will write stale values. The
other formats ignore these options.

# What survives a round trip

Axyra Sheets preserves parts of a workbook it does not itself model — the
so-called *verbatim* parts — so that opening and saving a file does not silently
discard features. VBA modules, custom XML parts, unknown extension lists, and
OLE embeddings are carried through unchanged.

That said, a round trip is not byte-identical: the engine rewrites the parts it
does understand. If you need to prove that a specific feature survives for your
files, test it against your files.

# Next

- [Render to PDF and Images]({{ site.axyra_tutorial }}/render)
- [Import and Export]({{ site.axyra_devref }}/Import_and_Export) — per-format
  behaviour and options
- [Streaming Large Files]({{ site.axyra_devref }}/Streaming) — for sheets too
  large to hold in memory
