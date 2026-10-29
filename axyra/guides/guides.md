---
title: 'Axyra Sheets Guides'
permalink: /axyra/guides/
toc: false
---

Task-oriented walkthroughs. Each one starts from an empty project and ends with
a complete, runnable program, and each links into the
[Developer Reference]({{ site.axyra_devref }}) for the full API rather than
restating it.

If you are new to Axyra Sheets, start with the
[Quick Start]({{ site.axyra_tutorial }}/quick_start) instead — it is shorter and
covers the object model these guides assume.

# Guides

| Guide | What it covers |
|---|---|
| [How to Create an Excel File in Java]({{ site.axyra_guides }}/create-excel-file-java) | An `.xlsx` from scratch: values, formulas, formatting, column widths |
| [How to Read an Excel File in Java]({{ site.axyra_guides }}/read-excel-file-java) | Opening a workbook, reading typed values in bulk, handling formula errors |
| [How to Convert Excel to PDF in Java]({{ site.axyra_guides }}/convert-excel-to-pdf-java) | Server-side PDF rendering, page setup, fonts, watermarks |
| [How to Write Data to Excel in Java]({{ site.axyra_guides }}/write-data-to-excel-java) | Populating a sheet from a `ResultSet` or JSON, including very large exports |
| [Export Database Data to Excel with Java and JDBC]({{ site.axyra_guides }}/export-database-to-excel-java) | Mapping JDBC results to typed cells and streaming large database exports |
| [Import Excel Data into a Database with Java]({{ site.axyra_guides }}/import-excel-to-database-java) | Validating uploaded rows, inserting batches, and returning an annotated error workbook |
| [Spring Boot Excel Import and Export]({{ site.axyra_guides }}/spring-boot-excel-import-export) | XLSX and PDF download endpoints, workbook uploads, and production deployment settings |
| [How to Export Excel Files in Java]({{ site.axyra_guides }}/export-excel-files-java) | XLSX, XLS, CSV, ODS, JSON, PDF, HTML, encryption, and values-only output |
| [Automate Excel Reports in Java with Templates]({{ site.axyra_guides }}/generate-excel-reports-java) | Filling a designed template with template markers, totals, PDF output, and scheduling |
| [Populate a Profit and Loss Excel Template from Java]({{ site.axyra_guides }}/populate-excel-template-database-java) | Querying database totals, filling a fixed P&L template, and verifying formulas |

# Where to go next

- [Quick Start]({{ site.axyra_tutorial }}/) — the guided path, in order
- [Developer Reference]({{ site.axyra_devref }}) — the API, by topic
- [Supported Formats]({{ site.axyra_devref }}/Supported_Formats) — what is
  modeled, what is preserved, and the known limits
