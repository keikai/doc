# Documentation, API reference, and examples

## Resolve sources

Axyra Sheets for .NET is consumed as the NuGet package `Axyra.Sheets` (targets
`net8.0` and `net10.0`). The engine's own source is not distributed, so every
instruction here must work from the package the project already resolves, the public
docs, and this skill.

Evaluation builds are prerelease versions (`1.0.0-fl.<date>`) on the feed
`https://mavensync.zkoss.org/eval/nuget/index.json`; licensed customers receive a
release `.nupkg` and install it from a local folder source. Prefer the version already
selected by the user's project; never replace a licensed package with an evaluation
build merely to avoid configuring a package source.

```xml
<!-- nuget.config beside the solution; nuget.org stays available -->
<configuration>
  <packageSources>
    <add key="axyra-eval" value="https://mavensync.zkoss.org/eval/nuget/index.json" />
  </packageSources>
</configuration>
```

`dotnet add package Axyra.Sheets --prerelease` (or `--version <exact>`) adds the
reference; without either, prerelease versions are ignored.

| Source | Where | Notes |
|---|---|---|
| API index (signatures, with types) | `references/api-index.md` in this skill | Matches the version named in `SKILL.md` only |
| XML doc comments | `~/.nuget/packages/axyra.sheets/<version>/lib/net8.0/Axyra.Sheets.xml` (or `$NUGET_PACKAGES`) | Version-matched member names, parameters and prose; no return or property types |
| Package README | `~/.nuget/packages/axyra.sheets/<version>/README.md` | Quick start and licensing |
| Product docs | https://doc.keikai.io/axyra/sheets/dotnet/ | .NET tutorial, developer reference and C# task guides |
| Runnable examples | https://github.com/keikai/axyra-sheets-examples/tree/main/dotnet | C# examples; Java counterparts live under `java/` |

Never require, clone, or ask for access to the engine's implementation repository,
and never cite it as evidence — a customer session will not have it. Record the
package version of whichever sources were used when diagnosing mismatches.

## API truth

Look for API information in this order, stop at the first source that answers, and
name the one you used:

1. **This skill's API index**, when its version equals the resolved package version.
2. **The package's `Axyra.Sheets.xml`** for the resolved version, already on disk after
   `dotnet restore`. It matches the build exactly. Search it for `M:Axyra.Sheets.Sheet.`
   (methods), `P:` (properties), `T:` (types); it lacks return and property types.
3. **The compiler.** Write the call and build; IntelliSense/compiler errors are
   version-matched. For exact signatures of another version, a few lines of reflection
   over `lib/net8.0/Axyra.Sheets.dll` (`Assembly.LoadFrom(...).GetExportedTypes()`)
   answer without initializing the engine. Do not describe reflection output as
   documentation.
4. **The public website**, for concepts. Its Java names are not .NET names; confirm
   every .NET member against 1–3.

The package's public types are the complete surface; the documentation site is a
curated, Java-oriented subset. Absence from the docs is not evidence that a capability
is missing: check the index or XML docs before telling a user that Axyra cannot do
something, and say which source you checked.

Signatures do not establish behavior, and doc prose can disagree with the build.
When behavior matters, a focused test against the selected package outranks the
prose. Report the disagreement and check the topic pitfalls file (`pitfalls-*.md`).

## Reading Java docs and examples as .NET

The engine behaves the same in every SDK; the shapes differ. Common mappings:

| Java | .NET |
|---|---|
| `Workbook.create()`, `Workbook.open(path)` | `new Workbook()`, `Workbook.Open(path)` |
| try-with-resources, `close()` | `using`, `Dispose()` |
| `wb.createSheet("A")`, `wb.sheet(i)`, `wb.sheetCount()` | `wb.Sheets.Add("A")`, `wb.Sheets[i]`, `wb.Sheets.Count` |
| `sheet.cell(r, c)`, `sheet.range("A1:C3")`, `Range` | `sheet[r, c]`, `sheet["A1:C3"]`, `CellRange` |
| `cell.setValue(x)`, `cell.value()`, `setDate(d)` | `cell.Value = x`, `cell.Value`, `cell.DateValue = d` |
| `range.setValues(CellValue[][])`, `values()` | `range.SetValues(CellValue[,])`, `GetValues()` |
| `CellStyle.builder()...build()`, `style().toBuilder()` | `new CellStyle { ... }`, `cell.Style with { ... }` |
| `wb.findName(n).asRange()` | `wb.Names.TryGet(n, out var named)` → `named.AsRange()` |
| `sheet.setPaperSize(9)`, `setLandscape(true)` | `sheet.PageSetup.PaperSize = 9`, `.Orientation = PageOrientation.Landscape` |
| `wb.renderPdf(path, PdfOptions.builder()...)` | `wb.SavePdf(path, new PdfOptions { ... })` |
| `sheet.addPivotTable(...)`, `addPicture(...)`, `addSparkline(...)` | `sheet.PivotTables.Add(...)`, `sheet.Pictures.Add(...)`, `sheet.Sparklines.Add(...)` |
| `Workbook.setLicense(t, LicenseMode.REQUIRED)` | `License.Apply(t, LicenseMode.Required)` |
| `-Daxyra.native.path=...` | `AXYRA_NATIVE_PATH` environment variable |
| `IllegalStateException` after close | `ObjectDisposedException` |
| `sheet.subtotal(...)` (sheet columns) | `range.Subtotal(...)` (range-relative columns) |

## Topic routing

Website paths are relative to `https://doc.keikai.io/axyra/sheets/java/`.

| Need | Documentation (Java-oriented) | .NET API to inspect |
|---|---|---|
| First workbook | `quick-start/quick_start` | `Workbook`, `Sheet`, `CellValue` |
| Read/edit files | `guides/read-excel-file-java`, `dev-ref/Import_and_Export` | `Workbook.Open/Save`, `Sheet.UsedRange`, `CellRange.GetValues` |
| Database/JSON export | `guides/write-data-to-excel-java` | `ImportOptions`, `Sheet.ImportData`, `CellRange.SetValues` |
| Formulas | `dev-ref/Formulas` | `Workbook.Recalculate`, `CellRange.SetFormula(s)`, `CopyTo`, `AutoFill` |
| Formatting | `dev-ref/Styles` | `CellStyle`, `Font`, `Fill`, `Borders`, `Color` (`Axyra.Sheets.Style`) |
| Templates | `dev-ref/Template_Markers`, `guides/generate-excel-reports-java` | `TemplateMarkers` (`Axyra.Sheets.Template`) |
| Charts/pivots | `dev-ref/Charts`, `dev-ref/Pivot_Table` | `ChartCollection`, `Chart`, `PivotTableCollection`, `PivotTable` |
| PDF/images | `dev-ref/Rendering`, `guides/convert-excel-to-pdf-java` | `PdfOptions`, `ImageOptions` (`Axyra.Sheets.IO`), `Sheet.RenderImage` |
| Large exports | `dev-ref/Streaming` | `StreamWorkbook`, `StreamRow`, `StreamStyle` (`Axyra.Sheets.IO`) |
| Page setup and print | `guides/convert-excel-to-pdf-java` | `PageSetup`, `PageMargins` |
| Deployment/license | `dev-ref/Native_Loader`, `dev-ref/License` | `License`, `LicenseInfo`, `LicenseMode`; runtime notes in `pitfalls-license.md` |

## Running samples

Write a throwaway console project for experiments:

```sh
dotnet new console -o axyra-try && cd axyra-try   # .NET 10 SDK templates offer only net10.0:
                                                  # edit <TargetFramework> for net8.0
dotnet add package Axyra.Sheets --version 1.0.0-fl.20261116   # needs the feed in nuget.config
dotnet run
```

Without a license the output carries evaluation marks, and each process gets 100
counted operations. Obtain the package from the source the project already uses; do
not build the engine from source to work around a resolution failure.
