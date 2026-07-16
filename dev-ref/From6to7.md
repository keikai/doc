---
title: 'From 6 to 7'
---

Keikai 7.0 replaces the Apache POI-based spreadsheet engine with the
Keikai Rust core engine, loaded as a native library through JNI. Formula
parsing and evaluation, number/date/text formatting, OOXML import/export,
and PDF/HTML rendering all run in the new engine.

This guide covers everything an application built on Keikai 6.3 needs to
know to upgrade.

---

# TL;DR — upgrade checklist

Most applications need **no code changes**. Work through this list:

1. **Java 17 or later** is required (6.3 ran on Java 11).
2. Bump the Keikai version in your `pom.xml`. No new dependency is
   needed — the native engine (`io.keikai:keikai-native`) arrives
   transitively.
3. Confirm your servers run on a **supported platform**:
   Linux x86_64, Linux aarch64, macOS x86_64, macOS aarch64, or
   Windows x86_64.
4. If your project used **Apache POI classes** that previously came from
   Keikai's classpath, add your own POI dependency (see
   [POI is no longer on the classpath](#poi-is-no-longer-on-the-classpath)).
5. If you wrote **custom formula functions**, apply the mechanical
   import rename (see [Custom formula functions](#custom-formula-functions)).
6. If you called the **HTML export classes directly** (`ToHtml`,
   `HtmlExporter`), or **configured `PdfExporter` instances
   programmatically** (paper size, margins, sheet/region export),
   switch to the exporter factories and sheet-level print setup (see
   [Removed classes and properties](#removed-classes-and-properties)).
7. If your workbooks contain **CJK text or use fonts beyond the
   Microsoft core set**, install those fonts on your Linux servers
   (see [Fonts on Linux servers](#fonts-on-linux-servers)). The
   Microsoft core families themselves (Calibri, Cambria, Arial, …)
   need no installation — metric-compatible substitutes are built
   into the engine.
8. Review the [behavioural differences](#behavioural-differences) table.

If none of items 4–7 apply to you, the upgrade is a version bump.

---

# Requirements

| | Keikai 6.3 | Keikai 7.0 |
| --- | --- | --- |
| Java | 11+ | **17+** |
| ZK framework | 10.3.x | 10.3.x (unchanged) |
| OS / CPU | any JVM platform | Linux x86_64 / aarch64, macOS x86_64 / aarch64, Windows x86_64 |

The platform restriction comes from the bundled native engine. The
`keikai-native` jar contains a prebuilt library for each supported
platform under `native/<os>-<arch>/`; other platforms (e.g. Windows
aarch64, 32-bit systems) are not shipped in 7.0.

## How the native engine loads

On first use, Keikai extracts `libkeikai_ffi.{so,dylib}` /
`keikai_ffi.dll` from the jar into a temporary directory (under
`java.io.tmpdir`) and loads it from there. Operational implications:

- `java.io.tmpdir` must be **writable** and must not be mounted
  `noexec`. On hardened containers, either remount, point
  `java.io.tmpdir` elsewhere, or place the library on
  `java.library.path` — if extraction finds no bundled library, the
  loader falls back to `System.loadLibrary("keikai_ffi")`.
- A failed load raises `UnsatisfiedLinkError` at the first spreadsheet
  operation, with the detected platform and expected library name in
  the message. Check that first when a fresh deployment fails.

---

# Maven dependency changes

Your dependency declarations stay the same (`io.keikai:keikai` or
`io.keikai:keikai-ex`, plus the JSF/JSP/PDF/HTML modules you already
use). Two things change underneath:

- **`io.keikai:keikai-native` is new** and comes in transitively at
  runtime scope. If you manage versions with a BOM or dependency
  lock file, you will see it appear; keep its version identical to the
  other Keikai artifacts.
- **`io.keikai:poi` is gone.** See the next section.

## POI is no longer on the classpath

Keikai 6.3 shipped a fork of Apache POI (`io.keikai:poi`) as a compile
dependency, so `org.apache.poi.*` classes were available to your
application transitively. In 7.0 the POI dependency is removed entirely.

- If your application code imports `org.apache.poi.*` for its **own**
  purposes (reading unrelated Office files, etc.), add an explicit
  Apache POI dependency to your `pom.xml`. Any POI version works —
  there is no interaction with Keikai anymore.
- If it imports POI types to **plug into Keikai** (custom functions),
  a POI dependency will not help — those integration points now use
  Keikai-native types. Follow the migration below.
- A common in-between case is
  `org.apache.poi.ss.usermodel.DateUtil.getExcelDate(Date)` used to
  turn a `java.util.Date` into an Excel serial number before writing
  it into a cell. Cell values accept `java.util.Date` directly, so the
  conversion is usually unnecessary; where you really need the serial
  number, use
  `EngineFactory.getInstance().getCalendarUtil().dateToDoubleValue(date)`
  (`io.keikai.model.sys.EngineFactory`).

---

# API compatibility — what is unchanged

No migration is needed for:

- `io.keikai.api.*` — every class (`Book`, `Range`, `Sheet`,
  `Spreadsheet`, importers/exporters, …)
- `io.keikai.ui.*` — every class
- `io.keikai.model.*` — every public interface
- The Spreadsheet ZUL widget and tag library
- Excel import (auto-detects XLSX / XLS) and export (`xlsx`, `xls`),
  plus the PDF and HTML export entry points. XLS files are read and
  written by the new engine — both formats keep working
- Conditional formatting, data validation, chart, and pivot
  configuration
- Defined-name management
- TLD function registration via `<?taglib?>`

---

# Custom formula functions

This is the one area with required code changes. Keikai 6.x exposed its
custom-function plugin API through POI types; Keikai 7.0 provides the
same shapes under Keikai-owned packages.

## Type rename map

| Keikai 6.3 (POI types) | Keikai 7.0 |
|---|---|
| `org.apache.poi.ss.formula.functions.Function` | `io.keikai.range.formula.Function` |
| `org.apache.poi.ss.formula.functions.FreeRefFunction` | `io.keikai.range.formula.FreeRefFunction` |
| `org.apache.poi.ss.formula.functions.TextFunction` | `io.keikai.range.formula.TextFunction` |
| `org.apache.poi.ss.formula.functions.MultiOperandNumericFunction` | `io.keikai.range.formula.MultiOperandNumericFunction` |
| `org.apache.poi.ss.formula.eval.ValueEval` (and `StringEval`, `NumberEval`, `BoolEval`, `BlankEval`, `ErrorEval`, `RefEval`, `AreaEval`, `EvaluationException`) | same names under `io.keikai.range.formula.*` |
| `org.apache.poi.ss.formula.TwoDEval` | `io.keikai.range.formula.TwoDEval` |
| `org.apache.poi.ss.formula.LazyRefEval` | `io.keikai.range.formula.LazyRefEval` |
| `org.apache.poi.ss.usermodel.ZssContext` | `io.keikai.compat.ZssContext` |

The new layout is flat — there is no `...formula.eval.*` or
`...formula.functions.*` sub-package. Class names and static factories
are intentionally identical (`BoolEval.valueOf(boolean)`,
`ErrorEval.NAME_INVALID`, `BlankEval.INSTANCE`, …), so for most
projects the whole migration is this search-and-replace:

```
sed -i '' \
    -e 's|org\.apache\.poi\.ss\.formula\.functions\.|io.keikai.range.formula.|g' \
    -e 's|org\.apache\.poi\.ss\.formula\.eval\.|io.keikai.range.formula.|g' \
    -e 's|org\.apache\.poi\.ss\.formula\.LazyRefEval|io.keikai.range.formula.LazyRefEval|g' \
    -e 's|org\.apache\.poi\.ss\.formula\.TwoDEval|io.keikai.range.formula.TwoDEval|g' \
    -e 's|org\.apache\.poi\.ss\.usermodel\.ZssContext|io.keikai.compat.ZssContext|g' \
    src/**/*.java src/**/*.zul
```

## XEL signature strings in ZUL / JSP pages

`<?xel-method?>` processing instructions spell out fully-qualified type
names; update them alongside the Java imports (the `sed` recipe above
matches them too):

```xml
<!-- Keikai 6.3 -->
<?xel-method prefix="keikai" name="MYSUBTOTAL"
    class="com.example.MyCustomFunctions"
    signature="org.apache.poi.ss.formula.eval.ValueEval mySubtotal(org.apache.poi.ss.formula.eval.ValueEval[], int, int)"?>

<!-- Keikai 7.0 -->
<?xel-method prefix="keikai" name="MYSUBTOTAL"
    class="com.example.MyCustomFunctions"
    signature="io.keikai.range.formula.ValueEval mySubtotal(io.keikai.range.formula.ValueEval[], int, int)"?>
```

## UDF registration via `ZKUDFFinder`

`ZKUDFFinder.putFunction` keeps its name but now accepts the
Keikai-native `FreeRefFunction`:

```java
// Keikai 6.3 — POI imports (no longer compile):
import org.apache.poi.ss.formula.eval.NumberEval;
import org.apache.poi.ss.formula.eval.ValueEval;
import org.apache.poi.ss.formula.functions.FreeRefFunction;

ZKUDFFinder.putFunction("DOUBLE",
        (ValueEval[] args, OperationEvaluationContext ec) -> new NumberEval(42.0));

// Keikai 7.0 — Keikai-native imports:
import io.keikai.range.formula.NumberEval;
import io.keikai.range.formula.ValueEval;
import io.keikai.range.formula.FreeRefFunction;

ZKUDFFinder.putFunction("DOUBLE",
        (ValueEval[] args, Object ec) -> new NumberEval(42.0));
```

The second parameter changed from POI's `OperationEvaluationContext`
to `Object`, and it is currently always `null`. A UDF that read the
calling cell's row/column from the context needs a redesign (e.g. pass
the position as an explicit argument in the formula).

## Semantic changes in the plugin API

- **`BoolEval`** is a strict singleton — direct construction is
  forbidden. Use `BoolEval.TRUE`, `BoolEval.FALSE`, or
  `BoolEval.valueOf(boolean)`.
- **`ErrorEval.valueOf(int)`** throws `IllegalArgumentException` for
  unknown error codes; POI returned a sentinel value. The recognised
  codes are Excel's standard ones (`#NULL!` 0, `#DIV/0!` 7, `#VALUE!`
  15, `#REF!` 23, `#NAME?` 29, `#NUM!` 36, `#N/A` 42).
- **`TextFunction`** provides only the exception-tunneling skeleton.
  POI's argument-coercion helpers (`evaluateStringArg`, `parseNumber`,
  …) were not ported; replace calls with explicit `instanceof` checks
  against the `StringEval` / `NumberEval` / `BoolEval` value types. If
  you need one of the helpers back, open an issue with a reproducer —
  they are small and can be ported on demand.
- **`MultiOperandNumericFunction`** keeps the three-argument
  constructor (`countBoolean`, `countBlank`, `strict`) and the
  `evaluate(double[])` hook, with one difference: a text value reached
  through a **reference** is skipped rather than parsed as a number
  (matching Excel's `SUM` semantics; POI parsed numeric-looking
  strings). If you relied on that coercion, implement
  `Function.evaluate(args, row, col)` directly and parse arguments
  yourself.
- **`ZssContext`** is a pure package move to `io.keikai.compat`. All
  methods, thread-local behaviour, and the
  `io.keikai.formula.maxIterations` / `io.keikai.formula.maxChange`
  library properties are unchanged.

---

# Removed classes and properties

The Java rendering implementations were retired in favour of the
engine's renderers. Removed from the public jar:

| Removed in 7.0 | Replacement |
| --- | --- |
| `io.keikai.model.impl.html.ToHtml` | `HtmlExporterFactory.createExporter()` |
| `io.keikai.model.impl.html.HtmlExporter` | `HtmlExporterFactory.createExporter()` |
| `io.keikai.importer.*` (`XlsxImporter`, `XlsxExtractor`, …) | The Java XLSX import pipeline moved into the engine. `Importers.getImporter()` is unchanged; a fully custom importer can still implement `SImporter` and register via `SImporters.register(...)`, but subclassing `XlsxImporter` to tweak the parse (e.g. importing only selected sheets) has no equivalent |
| `io.keikai.model.impl.BookImpl` | The internal `SBook` implementation changed. Program against the `SBook` interface; casting `book.getInternalBook()` to `BookImpl` no longer compiles |

## PDF exporter API

PDF export goes through the engine renderer unconditionally — the
OpenPDF-based implementation is gone and there is no fallback switch.
`Exporters.getExporter("pdf")` and whole-book `export(...)` calls work
as before. For code that used `io.keikai.model.impl.pdf.PdfExporter`
directly:

- `new PdfExporter()` + `export(book, out)` still compiles and works
  (the class remains as a deprecated wrapper).
- The **sheet- and region-level overloads**
  (`export(SSheet, OutputStream)`, `export(SheetRegion, OutputStream)`)
  are removed — 7.0 exports whole books.
- The **per-exporter configuration setters** (`setPaperSize`,
  `setLandscape`, `setScale`, margins, headers/footers,
  `setPrintGridlines`, …) are removed. **Caution:**
  `PdfExporter.getPrintSetup()` still compiles but returns a detached
  stub that does not influence the output. The engine reads print
  settings from the workbook itself — configure
  `SSheet.getPrintSetup()` on the sheet before exporting; those
  settings are persisted in the book.
- The OpenPDF-typed helper classes (`CellRenderEvent`, `FontLoader`,
  `StyleConversionUtil`, …) are removed with the implementation, and
  `PdfExporter` can no longer be subclassed to customise rendering —
  the protected OpenPDF hooks (`_writer`, `initDocument(...)`,
  `exportSheet(...)`, …) are gone.

## Removed ZK library properties

These properties were read by 6.3 and are silently ignored in 7.0
(each was also honoured under the legacy `org.zkoss.zss.*` prefix —
both spellings are gone):

| Property | 6.3 effect | In 7.0 |
| --- | --- | --- |
| `io.keikai.model.FormulaEngine.class` | Plugged a custom Java formula engine into `EngineFactory` | No equivalent — formula evaluation always runs in the native engine. The usual reasons for a custom engine remain covered: register custom functions via `ZKUDFFinder.putFunction`, or plug a custom function resolver via `io.keikai.model.FunctionResolver.class` (still honoured) |
| `io.keikai.import.cache` | Opted in to reusing the file's cached formula results on import instead of recalculating everything | No longer needed — this is the default. Import reuses each cell's cached result; only volatile formulas and cells without a cached value are evaluated |
| `io.keikai.export.cache` | Opted in to writing cached formula results into the exported file | No longer needed — the default `ExportOptions.FormulaPolicy.KEEP` writes every formula together with its cached result. For finer control (e.g. freeze formulas to values), pass `ExportOptions` with `VALUES_ONLY` / `BLANK` or a per-cell `CellTransform` |
| `io.keikai.pdf.ignoreColumnBreak` / `io.keikai.pdf.ignoreRowBreak` | Made the PDF exporter ignore manual column / row page breaks | No equivalent switch — the renderer honours the workbook's page setup. To get the old effect, remove the manual breaks from the sheet before exporting |

---

# Fonts on Linux servers

PDF and HTML rendering now measure and rasterise text in the engine
using the fonts available on the **server**. For the Microsoft core
families, nothing needs to be installed: the native library ships with
OFL-licensed, metric-compatible substitutes compiled in — Carlito
(for Calibri), Caladea (Cambria), Liberation Sans (Arial), Liberation
Serif (Times New Roman), Liberation Mono (Courier New), and Liberation
Sans Narrow (Arial Narrow). When a workbook requests one of those
families and the real font is not installed, the engine substitutes the
bundled face automatically. Its glyph metrics match the original, so
column autofit widths, line wraps, and page breaks are identical to a
host that has the genuine font — including bare Linux containers and CI
images.

Install fonts on Linux hosts only when workbooks use families outside
that set:

- **CJK text** — the bundled faces carry no CJK glyphs. The engine
  falls back to a CJK-capable system font (PMingLiU, PingFang,
  Noto Sans CJK, …); a bare Linux image has none, so install one,
  e.g. on Debian/Ubuntu:

  ```
  apt-get install fonts-noto-cjk
  ```

- **Custom or corporate fonts** — install them on the server;
  otherwise the engine falls back to a metric-different face and text
  layout drifts.

---

# Behavioural differences

Differences you may observe after the engine switch, in rough order of
likelihood:

| Area | Keikai 6.3 (POI engine) | Keikai 7.0 (Rust engine) |
| --- | --- | --- |
| Dynamic arrays | Formulas returning a range collapsed to a single value | Excel-compatible **spill** behaviour: a formula whose result is a range (e.g. `=ISNUMBER(A1:A9)`, `FILTER`, `SORT`, `SEQUENCE`) spills into neighbouring cells |
| Built-in date formats 15/16/17 (`d-mmm-yy`, `d-mmm`, `mmm-yy`) | Pattern replaced wholesale by a locale long-date shape (e.g. `d MMMM y` under nl-NL) | Pattern shape stays `d-mmm-yy` under every locale; only the month/weekday **names** localise. All other locale-aware date handling (e.g. `m/d/yyyy` → `yyyy/m/d` for zh-TW, localised month/weekday names) is unchanged |
| Cross-book defined names | A formula could reference a defined name declared in another open book | Defined names are book-scoped: referencing another book's name yields `#NAME?`. Cross-book **cell** references (`[Book2]Sheet1!B5`) and their dependency tracking keep working |
| Chart axis cells containing formulas | Re-evaluated each cell on chart render | Reads each cell's last-computed value (no per-cell re-eval) |
| Data validation `getNumOfValue1()` | Counted elements of the evaluated result | Counts cells in the source area reference directly; indirect constructs (`=INDIRECT(...)`) report 1 |
| UDF evaluation context | Real `OperationEvaluationContext` with cell position | `null` (see UDF section above) |

Paper size is unaffected: both 6.3 and 7.0 default to A4 when a sheet
carries no `<pageSetup>`. To change the default, set the
`io.keikai.pageSetup.defaultPaperSize` library property to a
`PaperSize` name such as `LETTER`.

---

# New in 7.0

Not migration items, but worth knowing when planning the upgrade:

- **Dynamic array formulas** — spilling, spill-range references, and
  the modern function family that depends on them.
- **Macro-enabled workbooks (`.xlsm`)** — importing an `.xlsm` file
  preserves its VBA project, `Exporters.getExporter("xlsm")` writes a
  macro-enabled workbook, and `Book.getVbaProject()` /
  `setVbaProject(byte[])` expose the raw VBA blob. Macros are
  preserved and round-tripped, not executed.
- **Performance** — formula dependency tracking and recalculation on
  large workbooks are dramatically faster than the 6.x Java engine;
  large-file import and export are faster and use less memory.

See the 7.0 release note for the complete feature and fix list.
