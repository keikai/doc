---
title: 'Axyra Sheets vs. Keikai Spreadsheet'
permalink: /axyra/dev-ref/Axyra_vs_Keikai
---

Axyra Sheets and Keikai Spreadsheet are separate products with separate brands.
This page exists so you can tell in thirty seconds which one you are looking at
and which one you need.

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

# How the technology relates

Since Keikai 7.0.0-Beta, Keikai Spreadsheet uses Axyra Sheets internally as its
engine. This is an implementation change, not an API change:

- `io.keikai.api.*` is **unchanged and still supported**. Existing Keikai
  applications need no modification.
- You do not need to learn Axyra Sheets to keep using Keikai Spreadsheet.
- You do not need Keikai Spreadsheet to use Axyra Sheets.

New, headless projects should target `io.keikai.axyra.sheets.*` directly rather
than going through the UI component's API.
