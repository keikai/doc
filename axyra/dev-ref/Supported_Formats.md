---
title: 'Supported Formats'
permalink: /axyra/dev-ref/Supported_Formats
---

# Spreadsheet formats

| Format | Extension | Read | Write | Notes |
|---|---|:--:|:--:|---|
| Excel Workbook | `.xlsx` | ✔ | ✔ | The primary and best-supported format |
| Excel Macro-Enabled Workbook | `.xlsm` | ✔ | ✔ | VBA preserved, never executed |
| Excel Binary Workbook | `.xlsb` | ✔ | ✔ | Binary OOXML; faster and smaller than `.xlsx` |
| Excel 97–2003 | `.xls` | ✔ | ✔ | BIFF8. Subject to the format's own limits — 65,536 rows, 256 columns |
| OpenDocument Spreadsheet | `.ods` | ✔ | ✔ | Including encrypted ODS |
| Comma-Separated Values | `.csv` | ✔ | ✔ | One sheet; type sniffing on import, injection defence on export |
| JSON | `.json` | ✔ | ✔ | Structural representation of the workbook |

# Output formats

| Format | Write | Notes |
|---|:--:|---|
| PDF | ✔ | Paginated; encryption, permissions, watermarks, bookmarks, PDF/A |
| PNG | ✔ | Per sheet or per page |
| SVG | ✔ | Vector glyph outlines; text is not selectable or searchable |
| JPEG, GIF, BMP, TIFF | ✔ | Per sheet or per page |
| HTML | ✔ | Styled table, single-file or with attachments |

See [Rendering]({{ site.axyra_devref }}/Rendering).

# Feature support

Beyond values and formulas, these are **modelled** — read, computed where
applicable, written, and rendered:

| | |
|---|---|
| Formulas | ~490 functions, dynamic arrays and spill, structured references, iterative calculation, shared formulas, external references with cached values |
| Number formats | Full Excel format-code syntax, including conditional sections and locale-aware formatting |
| Styles | Fonts, fills (solid, patterned, gradient), borders, alignment, rotation, indent, themes, named styles, indexed and theme colours |
| Charts | 20+ types, series, axes, data labels, error bars, trendlines, 3-D views, chart sheets. Map charts are read and written but currently render as a placeholder frame. |
| Pivot tables | Field layout, aggregation, all four filter kinds, sorting, date and numeric grouping, show-values-as, calculated fields and items, slicers, timelines |
| Tables | Header and totals rows, banding, styles, auto-expansion, structured references |
| Conditional formats | All rule kinds, colour scales, data bars, icon sets |
| Validation | All types, input and error messages, dropdowns |
| Comments | Legacy notes and modern threaded comments |
| Drawings | Pictures, shapes, connectors, SmartArt, WordArt, 3-D effects, shadows |
| Sparklines | Line, column, and win/loss groups |
| Form controls | Ten control types with linked cells |
| Protection | Sheet, range, workbook structure, write protection |
| Security | ECMA-376 agile encryption, ODS encryption, OPC digital signatures |
| Page setup | Print areas, titles, margins, scaling, fit-to-page, headers and footers, page breaks, watermarks |
| Sheet types | Worksheets, chart sheets, dialog sheets, macro sheets |

These are **preserved verbatim** — carried through a round trip, but not
interpreted:

- VBA projects and macro modules
- ActiveX controls and OLE embeddings
- Custom XML parts
- Unknown extension lists (`extLst`), including features newer than the build
- Drawing parts the model does not interpret

# Known limits

Worth knowing before you design around them:

- **`.xls` is bounded by BIFF8.** 65,536 rows and 256 columns, and no feature
  introduced after Excel 2003. Saving a larger or more modern workbook to `.xls`
  loses what does not fit. Prefer `.xlsx` or `.xlsb`.
- **CSV is one sheet of text.** No formulas, styles, or objects survive it.
- **Macros are never executed.** A `.xlsm` round-trips with its VBA intact, but
  nothing in it runs.
- **A round trip is not byte-identical.** Modelled parts are rewritten. Do not
  compare checksums.
- **Rendering depends on fonts.** A missing font falls back to a
  metric-compatible substitute, which changes line breaks. Ship the fonts you
  need — see [Rendering]({{ site.axyra_devref }}/Rendering).
- **XPS output is not available.** Use PDF for paginated output.
- **Formula function coverage is per build.** `Functions.list()` is the
  authoritative answer for the version you have, not any list in documentation.
