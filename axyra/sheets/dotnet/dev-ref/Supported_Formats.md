---
title: 'Supported Formats (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Supported_Formats
redirect_from:
  - /axyra/dotnet/dev-ref/Supported_Formats
---

The evaluated package is **1.0.0-fl.20261116**. File support does not imply that
every feature of every format can be calculated, rendered or round-tripped.

| Format | Open | Save | Main considerations |
|---|---|---|---|
| XLSX | Yes | Yes | Default choice for modern workbooks |
| XLSM | Yes | Yes | VBA is preserved; macros are never executed |
| XLSB | Yes | Yes | Binary workbook; test representative content |
| XLS | Yes | Yes | Legacy format with its own row/column and feature limits |
| ODS | Yes | Yes | Encrypted ODS output is refused by this evaluated build |
| CSV | Yes | Yes | One sheet; values only; no workbook styles or formulas |
| JSON | Yes | Yes | Array of row objects; first sheet on export; values only |
| PDF | No | Render | Page layout, fonts and export options determine appearance |
| PNG, SVG, JPEG, GIF, BMP, TIFF | No workbook import | Render | Sheet images; not editable spreadsheet files |
| HTML | No workbook import | Export | HTML representation of workbook content |

Use `WorkbookFormat` for byte/stream I/O and filenames with recognized extensions
for file I/O. Image bytes can also be inserted as workbook pictures; that is a
separate operation from opening an image as a workbook.

CSV defaults to the active sheet; `SaveCsv` can select a named sheet. JSON exports
the first sheet, even when another sheet is active. CSV and JSON evaluation
exports carry an extra notice row. They cannot store a whole workbook faithfully.

A successful save is insufficient evidence of feature preservation. Reopen a
representative output and check the cells, formulas and content your workflow
needs. For encryption/signatures and format policies see
[Import and Export]({{ site.axyra_dotnet_devref }}/Import_and_Export).
