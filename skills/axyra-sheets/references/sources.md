# Documentation, Javadoc, and examples

## Resolve sources

Axyra Sheets is consumed as a published dependency. The engine's own source is
not distributed, so every instruction here must work from the public docs, the
artifact the project already resolves, and the public examples.

The released artifacts are `io.keikai:axyra-sheets:1.0.0-Beta-Eval` in the
public evaluation repository and `io.keikai:axyra-sheets:1.0.0-Beta` in the
authenticated EE repository. Prefer the version already selected by the user's
project; never replace an EE dependency with Eval merely to avoid configuring
repository credentials.

| Source | Public entry | Local checkout, if the user happens to have one |
|---|---|---|
| Product docs | https://doc.keikai.io/axyra | a `doc` checkout, under its `axyra/` directory |
| Runnable examples | https://github.com/keikai/axyra-sheets-examples | an `axyra-sheets-examples` checkout |
| Javadoc | the `-javadoc` JAR next to the resolved artifact (see below); https://keikai.io/javadoc/axyra-sheets/latest/index.html for the latest public API | none; the JAR is the version-matched copy |

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
2. **The same JAR from the repository.** Evaluation builds carry
   `axyra-sheets-<version>-javadoc.jar` next to
   the binary at `https://mavensync.zkoss.org/eval/io/keikai/axyra-sheets/<version>/`.
   Download it into a temporary directory and unzip it. It is documentation, not
   the runtime dependency. EE builds are served from the authenticated repository
   at `https://maven.zkoss.org/repo/keikai/ee`; use the user's configured credentials
   and do not ask them to expose secrets. No `-sources` JAR is published.
3. **`javap` on the resolved binary JAR**, for exact signatures when no Javadoc JAR
   exists: `javap -cp <artifact.jar> io.keikai.axyra.sheets.Workbook` (and the other
   public classes). The examples repository also compiles against a real version
   and so demonstrates signatures that exist. Do not describe `javap` output as
   Javadoc.
4. **The public website, `https://keikai.io/javadoc/axyra-sheets/latest/index.html`**,
   when the version-matched JARs are unavailable. It documents the **latest** release,
   so it can describe a class that a pinned or older version lacks, or name it
   differently. Confirm version-sensitive signatures against the resolved artifact.

The Javadoc is the complete public surface; the documentation site is a curated
subset that teaches the common paths. Read-back getters, and whole families such as
the sheet's page-setup and print settings, are reachable only through the Javadoc.
Absence from the documentation is not evidence that a capability is missing: check
the Javadoc before telling a user that Axyra cannot do something, and say which
source you checked.

Signatures do not establish behavior, and Javadoc prose can disagree with the
build. When behavior matters, a focused test
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
| Formulas | `dev-ref/Formulas` | `Workbook.recalculate`, `Range.setFormula(s)`, `Range.copyTo`, `Range.autoFill` | `devref/FormulasExample.java` |
| Formatting | `dev-ref/Styles` | `style/CellStyle`, `style/Color` | `devref/StylesExample.java` |
| Templates | `dev-ref/Template_Markers`, `guides/generate-excel-reports-java` | `template/TemplateMarkers` | `guides/GenerateReportExample.java`, `devref/TemplateMarkersExample.java` |
| Charts/pivots | `dev-ref/Charts`, `dev-ref/Pivot_Table` | `ChartView`, `PivotTableView`, `PivotField`, `PivotLayout` | `devref/ChartsExample.java`, `devref/PivotTableExample.java` |
| PDF/images | `dev-ref/Rendering`, `guides/convert-excel-to-pdf-java` | `io/PdfOptions`, `io/ImageOptions`, `io/Renderer` | `guides/ExcelToPdfExample.java`, `devref/RenderingReferenceExample.java` |
| Large exports | `dev-ref/Streaming` | `io/StreamWorkbook`, `io/StreamRow` (its `commit()`), `io/StreamStyle` | `devref/StreamingExample.java` |
| Page setup and print | `guides/convert-excel-to-pdf-java` | `Sheet` page-setup members: paper size, landscape, `setPageMargins`, `setPrintArea`, `setPrintTitleRows` | `guides/ExcelToPdfExample.java` |
| Deployment/license | `dev-ref/Native_Loader`, `dev-ref/License` | Native loader; `Workbook.setLicense/licenseStatus` | `devref/LicenseAndNativeLoaderExample.java` |

Documentation pages link to their matching example through the **Get code at
GitHub** button, using `_data/axyra_code_links.yml` in the documentation
repository. If a file named above is missing, check that mapping and list the
examples repository's `src/main/java/io/keikai/axyra/examples/` tree rather than
guessing a name.
The template entry point is `TemplateMarkers.process(Sheet, Map)`. Check the
resolved artifact before writing or changing imports, and treat a name in prose
as a claim to verify.

## Example execution

Read the examples POM and README before using its commands. As reviewed, the
examples target Java 17, set the `io.keikai:axyra-sheets` dependency version in
the `axyra.version` property (`1.0.0-Beta-Eval` in the release checkout), and
declare the evaluation repository at
`https://mavensync.zkoss.org/eval`; the checkout therefore resolves without an
extra repository override. The POM's top-level `0.1.0-SNAPSHOT` is the version of
the examples application itself, not the Axyra Sheets dependency. The version the
user already depends on governs, and the documentation site may show a different
one.

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
