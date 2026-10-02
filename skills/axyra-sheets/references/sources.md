# Documentation, Javadoc, and examples

## Resolve sources

Axyra Sheets is consumed as a published dependency. The engine's own source is
not distributed, so every instruction here must work from the public docs, the
artifact the project already resolves, and the public examples.

| Source | Public entry | Local checkout, if the user happens to have one |
|---|---|---|
| Product docs | https://doc.keikai.io/axyra | a `doc` checkout, under its `axyra/` directory |
| Runnable examples | https://github.com/keikai/axyra-sheets-examples | an `axyra-sheets-examples` checkout |
| Javadoc | the `-javadoc` JAR next to the resolved artifact (see below); https://keikai.io/javadoc/axyra/latest/ only as a last resort | none; the JAR is the version-matched copy |

Use a local checkout only after confirming it exists in the user's workspace and
matches the selected version; otherwise use the public entry. Never require, clone,
or ask for access to the engine's implementation repository, and never cite it as
evidence — a customer session will not have it. Record the version or commit of
whichever sources were used when diagnosing mismatches.

## Javadoc and API truth

The generated Javadoc covers every public class in `io.keikai.axyra.sheets`, with
the `internal` package excluded. Page paths follow the package layout, so
`io/keikai/axyra/sheets/Workbook.html` is the entry point for the workbook API.

Look for API information in this order, stop at the first source that answers, and
name the one you used:

1. **The `-javadoc` JAR for the resolved version, already on disk.** Look in the
   local Maven cache (`~/.m2/repository/io/keikai/axyra-sheets/<version>/`) or the
   Gradle cache. It matches the build exactly, so it is the default source.
2. **The same JAR from the repository.** Evaluation builds from
   `0.1.0.FL.20260916-Eval` on carry `axyra-sheets-<version>-javadoc.jar` next to
   the binary at `https://mavensync.zkoss.org/eval/io/keikai/axyra-sheets/<version>/`.
   Download it into a temporary directory and unzip it. It is documentation, not
   the runtime dependency. Earlier builds have none, and no `-sources` JAR is
   published.
3. **`javap` on the resolved binary JAR**, for exact signatures when no Javadoc JAR
   exists: `javap -cp <artifact.jar> io.keikai.axyra.sheets.Workbook` (and the other
   public classes). The examples repository also compiles against a real version
   and so demonstrates signatures that exist. Do not describe `javap` output as
   Javadoc.
4. **The public website, `https://keikai.io/javadoc/axyra/latest/`**, only when the
   JARs are unavailable. It documents the **latest** release, so it can describe a
   class that a pinned or older version lacks, or name it differently. It may also
   be offline: it has returned 404, and some hosts redirect it to the keikai.io home
   page. Treat a 404 or a page without API content as unavailable, and do not retry.

The Javadoc is the complete public surface; the documentation site is a curated
subset that teaches the common paths. Read-back getters, and whole families such as
the sheet's page-setup and print settings, are reachable only through the Javadoc.
Absence from the documentation is not evidence that a capability is missing: check
the Javadoc before telling a user that Axyra cannot do something, and say which
source you checked.

Signatures do not establish behavior, and Javadoc prose can disagree with the
build. For example, it says `CalcMode.MANUAL` recalculates only on request, yet
writes still recalculate their dependents. When behavior matters, a focused test
against the selected artifact outranks the prose. Report the disagreement and check
the topic pitfalls file (`pitfalls-*.md`). Do not report a signature as verified
when it was only inferred from prose or read from a Javadoc page whose version does
not match the dependency.

## Topic routing

Website paths below are relative to `https://doc.keikai.io/axyra/`.
Example paths are relative to
`src/main/java/io/keikai/axyra/examples/` in the examples repository.

| Need | Documentation | Java API to inspect | Example |
|---|---|---|---|
| First workbook | `quick-start/quick_start` | `Workbook`, `Sheet`, `CellValue` | `tutorial/QuickStartExample.java` |
| Read/edit files | `guides/read-excel-file-java`, `dev-ref/Import_and_Export` | `Workbook.open/save`, `Sheet.usedRange`, `Range.values` | `guides/ReadExcelFileExample.java`, `tutorial/ReadWriteExample.java`, `devref/ImportExportExample.java` |
| Database/JSON export | `guides/write-data-to-excel-java` | `ImportOptions`, `Sheet.importData`, `Range.setValues` | `guides/WriteDataToExcelExample.java` |
| Formulas | `dev-ref/Formulas` | `Workbook.recalculate`, `Range.setFormulas`, `Range.copyTo` (shifts references; `autoFill` does not) | `devref/FormulasExample.java` |
| Formatting | `dev-ref/Styles` | `style/CellStyle`, `style/Color` | `devref/StylesExample.java` |
| Templates | `dev-ref/Template_Markers`, `guides/generate-excel-reports-java` | `template/TemplateMarkers` | `guides/GenerateReportExample.java`, `devref/TemplateMarkersExample.java` |
| Charts/pivots | `dev-ref/Charts`, `dev-ref/Pivot_Table` | `ChartView`, `PivotTableView`, `PivotField`, `PivotLayout` | `devref/ChartsExample.java`, `devref/PivotTableExample.java` |
| PDF/images | `dev-ref/Rendering`, `guides/convert-excel-to-pdf-java` | `io/PdfOptions`, `io/ImageOptions`, `io/Renderer` | `guides/ExcelToPdfExample.java`, `devref/RenderingReferenceExample.java` |
| Large exports | `dev-ref/Streaming` | `io/StreamWorkbook`, `io/StreamRow` (its `commit()`), `io/StreamStyle` | `devref/StreamingExample.java` |
| Page setup and print | `guides/convert-excel-to-pdf-java` | `Sheet` page-setup members: paper size, landscape, `setPageMargins`, `setPrintArea`, `setPrintTitleRows` | `guides/ExcelToPdfExample.java` |
| Deployment/license | `dev-ref/Native_Loader`, `dev-ref/License` | Native loader; `Workbook.setLicense/licenseStatus` | `devref/LicenseAndNativeLoaderExample.java` |

Each documentation page links to its own example source in the examples repository;
follow that link if an example has been renamed, rather than guessing a file name.
The template entry point was renamed from `SmartMarkers` to `TemplateMarkers` in
`0.1.0.FL.20260915-Eval`, with no deprecated alias; the marker syntax and
`process(Sheet, Map)` signature did not change. Check the resolved artifact before
writing or changing imports, and treat a name in prose as a claim to verify.

## Example execution

Read the examples POM and README before using its commands. As reviewed, the
examples target Java 17 and pin one `io.keikai:axyra-sheets` version in an
`axyra.version` property; both are observations about that checkout, not
requirements for the user's project. The version the user already depends on
governs, and the documentation site may show a different one.

From the examples checkout, its documented runner accepts:

```sh
./mvnw exec:java -Dexec.args="tutorial/quick-start"
./mvnw exec:java -Dexec.args="guides/create-excel-file output"
```

Select only the needed examples and use a dedicated output directory. The examples
do not install a license, so their output carries evaluation marks. Published JARs
bundle the native library for macOS, Linux glibc, and Windows x86_64. Any other
platform, or a stripped JAR, needs an absolute `-Daxyra.native.path` to a matching
library; read the loader documentation before assuming a binary name or location. Obtain the dependency from the repository the project already uses; do
not build it from the engine's source to work around a resolution failure.
