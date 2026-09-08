---
title: 'Axyra Sheets vs. Keikai Spreadsheet'
permalink: /axyra/dev-ref/Axyra_vs_Keikai
---

Two products, one brand. This page exists so you can tell in thirty seconds
which one you are looking at, and which one you need.

{: .notice--info}
**In one line:** Keikai Spreadsheet is an interactive spreadsheet **UI** for the
browser. Axyra Sheets is a headless spreadsheet **engine** for the server.

# Side by side

| | Keikai Spreadsheet | Axyra Sheets |
|---|---|---|
| **What it is** | A web spreadsheet component with a UI | A spreadsheet engine library |
| **Where it runs** | Server plus browser | Server only |
| **User interface** | Excel-like grid, toolbar, formula bar, sheet tabs | None |
| **Java package** | `io.keikai.api.*` | `io.keikai.axyra.sheets.*` |
| **Maven artifact** | `io.keikai:keikai` and friends | `io.keikai:axyra-sheets` |
| **Implementation** | Java | Rust engine with a Java SDK |
| **Native library** | No | Yes — a per-platform binary |
| **Integration** | ZK, JSP, JSF | Plain Java; no framework |
| **Documentation** | [doc.keikai.io/dev-ref]({{ site.baseurl }}/dev-ref) | [doc.keikai.io/axyra]({{ site.axyra_devref }}) |
| **Javadoc** | [keikai.io/javadoc/spreadsheet]({{ site.baseurl_javadoc_keikai }}) | [{{ site.axyra_javadoc }}]({{ site.axyra_javadoc }}) |

# Which one do I need?

| Goal | Product |
|---|---|
| Let users edit a spreadsheet in a web page | **Keikai Spreadsheet** |
| Show an Excel file in the browser, interactively | **Keikai Spreadsheet** |
| Populate a grid from a database and let users edit it | **Keikai Spreadsheet** |
| Generate an XLSX report on the server | **Axyra Sheets** |
| Convert uploaded spreadsheets to PDF | **Axyra Sheets** |
| Evaluate formulas in a batch job | **Axyra Sheets** |
| Read an uploaded workbook and validate its contents | **Axyra Sheets** |
| Render a sheet as a PNG thumbnail | **Axyra Sheets** |
| An interactive editor *and* server-side file processing | **Keikai Spreadsheet** for the UI — since 7.0.0-Beta, Axyra Sheets is already the engine underneath it |

The dividing question is simply whether a human interacts with a grid in a
browser. If yes, you need the UI component. If no, you need the engine.

# How they relate

Since Keikai 7.0.0-Beta, Keikai Spreadsheet uses Axyra Sheets internally as its
engine. This is an implementation change, not an API change:

- `io.keikai.api.*` is **unchanged and still supported**. Existing Keikai
  applications need no modification.
- You do not need to learn Axyra Sheets to keep using Keikai Spreadsheet.
- You do not need Keikai Spreadsheet to use Axyra Sheets.

New, headless projects should target `io.keikai.axyra.sheets.*` directly rather
than going through the UI component's API.

# Naming, so the packages are not surprising

Axyra is a **product family** within the Keikai brand — Axyra Sheets is the
spreadsheet member of it. That is why the names mix:

| | |
|---|---|
| Java packages | `io.keikai.axyra.sheets.*` |
| Maven groupId | `io.keikai` |
| Maven artifactId | `axyra-sheets` |
| Cargo crates | `axyra-sheets-*` |
| Documentation | `doc.keikai.io/axyra` |

The `io.keikai` prefix is the brand; `axyra.sheets` is the product. Seeing both
in one coordinate is expected, not a mistake.

# Do not mix them up

A few concrete traps:

- **Do not mix the two APIs in one code path.** They are different object models.
  A Keikai `Book` is not an Axyra `Workbook`, and there is no conversion between
  them in the public API.
- **`Range` and `Sheet` exist in both**, with different behaviour. Check your
  imports — an IDE will happily offer you the wrong one.
- **Documentation searches return both.** This site hosts both products. Check
  the URL: `/dev-ref` is Keikai Spreadsheet, `/axyra/dev-ref` is Axyra Sheets.
- **Version numbers are independent.** Keikai Spreadsheet 7.x and Axyra Sheets
  {{ site.axyra_version }} are unrelated numbers. Do not try to match them.
- **Licenses are separate products.** A Keikai Spreadsheet license does not cover
  Axyra Sheets, and the token formats differ. See
  [Licensing]({{ site.axyra_devref }}/License).

# Migrating from Keikai's API to Axyra Sheets

There is no automatic migration, and for most applications there should not be
one — if you are using Keikai Spreadsheet for its UI, keep using it.

Migration makes sense only for code that uses Keikai's API purely for headless
file work: reading an upload, generating a report, converting to PDF. For that
code, Axyra Sheets is the more direct route, and the mapping is conceptual
rather than mechanical:

| Keikai concept | Axyra Sheets equivalent |
|---|---|
| `Book` | `Workbook` |
| `Sheet` | `Sheet` |
| `Range` (`Ranges.range(...)`) | `Range` (`sheet.range(...)`) |
| `Importers` / `Exporters` | `Workbook.open` / `Workbook.save` |
| Exporter to PDF | `Workbook.renderPdf` / `Renderer` |

Start with [Quick Start]({{ site.axyra_tutorial }}/quick_start) rather than
translating call by call — the APIs differ enough that a direct transliteration
produces awkward code.
