---
title: 'Architecture'
permalink: /axyra/dev-ref/Architecture
---

Useful background when you are reasoning about performance, about what is
modelled versus preserved, or about why an API is shaped the way it is.

# Layers

```
┌─────────────────────────────────────────────────────────────┐
│  SDK       Java                                             │
├─────────────────────────────────────────────────────────────┤
│  FFI       JNI bridge (libaxyra_jni)                        │
├─────────────────────────────────────────────────────────────┤
│  I/O       ooxml · xls · csv · json · html · render         │
├─────────────────────────────────────────────────────────────┤
│  Eval      formula — parser, evaluator, ~490 functions      │
├─────────────────────────────────────────────────────────────┤
│  Format    format — number and date format codes            │
├─────────────────────────────────────────────────────────────┤
│  Model     model — Book · Sheet · Cell · Range · Style ·    │
│                    Chart · PivotTable                       │
└─────────────────────────────────────────────────────────────┘
```

Each layer depends only on layers below it, with no cycles. The consequence you
can rely on: the model does not know about file formats, and the formula engine
does not know about rendering. A bug in XLSX writing cannot change how a formula
evaluates.

# The engine

Rust, organised as a Cargo workspace:

| Crate | Responsibility |
|---|---|
| `axyra-sheets-model` | The workbook model — sheets, cells, ranges, styles, charts, pivot tables. Includes both the row-oriented and columnar storage backends. |
| `axyra-sheets-formula` | Formula parsing and evaluation, the function library, dependency tracking, spill |
| `axyra-sheets-format` | Number and date format codes, parsing user input |
| `axyra-sheets-ooxml` | XLSX / XLSM / XLSB reading and writing; ODS; encryption |
| `axyra-sheets-xls` | Legacy BIFF8 `.xls` |
| `axyra-sheets-csv` | CSV import with type sniffing, export with injection defence |
| `axyra-sheets-json` | JSON representation |
| `axyra-sheets-html` | HTML export |
| `axyra-sheets-render` | Page layout, PDF, images, SVG, fonts, chart drawing |
| `axyra-sheets-signature` | OPC package digital signatures |
| `axyra-sheets-license` | Signed license tokens and enforcement |
| `axyra-sheets-ffi-jni` | The JNI bridge the Java SDK binds to |

`Book` is the model's hub — the type nearly everything else reaches through, and
the reason `Workbook` is the root of the Java API too.

# The JNI boundary

This is the part with practical consequences.

The Java SDK is a thin, typed layer. A `Workbook` holds a native handle;
`Sheet`, `Range`, and `Cell` are lightweight views that carry coordinates, not
data. Nothing is mirrored on the Java side.

That means:

- **Every call crosses the boundary.** A crossing is cheap but not free, so a
  loop over 100,000 cells makes 100,000 crossings. `Range.numbers()` makes one.
  This is why the bulk accessors exist and why they are usually worth an order
  of magnitude — see
  [Cells and Ranges]({{ site.axyra_devref }}/Cell_and_Range).
- **Structured values cross as JSON.** Styles, charts, pivot definitions, and
  filters are serialised rather than mapped field by field, which is why the SDK
  depends on Jackson. It also means these objects are cheap to cache on the Java
  side and comparatively expensive to set in a tight loop.
- **Views are only valid while the workbook is open.** Closing a workbook frees
  the native model; using a derived `Sheet`, `Range`, or `Cell` afterwards throws
  `IllegalStateException`.
- **Native memory sits outside the JVM heap**, so `-Xmx` does not bound it and
  the garbage collector does not reclaim it. Closing workbooks is not optional.

# Modelled versus preserved

The engine distinguishes two kinds of content, and the distinction shows up
throughout the documentation:

**Modelled** content is parsed into the model, computed where applicable,
adjusted by structural edits, written back, and rendered. Formulas, styles,
charts, pivot tables, conditional formats, and drawings are modelled.

**Preserved** content is carried through a round trip byte-for-byte without being
interpreted. VBA projects, ActiveX controls, custom XML parts, OLE embeddings,
and unknown extension lists are preserved.

Preservation is what lets a `.xlsm` keep its macros, and what lets a workbook
using an Excel feature newer than your build survive a round trip. It is not the
same as support: a preserved part will not be recalculated, rendered, or adjusted
when you insert a row. If a feature matters to your application logic, confirm
that it is modelled.

# Correctness methodology

Behaviour is derived from measurement rather than from specification reading. The
engine's test suite compares its output against Microsoft Excel's actual
behaviour on generated cases, and the derived rules are what the implementation
targets. This is why the documentation prefers `Functions.list()` over a printed
function list, and why the honest answer to "does it handle X exactly like
Excel?" is a test against your files.

# Relationship to Keikai Spreadsheet

Keikai Spreadsheet, the browser UI component, uses Axyra Sheets as its engine
since Keikai 7.0.0-Beta. Its own API (`io.keikai.api.*`) is unchanged and
remains supported. See
[Axyra Sheets vs. Keikai Spreadsheet]({{ site.axyra_devref }}/Axyra_vs_Keikai).
