---
title: 'Axyra Sheets Tutorial'
permalink: /axyra/tutorial
---

{: .notice--warning}
This is the tutorial for **Axyra Sheets**, the headless spreadsheet engine. For
the browser-based Keikai Spreadsheet UI component, see the
[Keikai tutorial]({{ site.baseurl }}/tutorial).

# Overview

Axyra Sheets is a spreadsheet engine you embed in your own application. There is
no UI and no server to run: you add a dependency, open or create a `Workbook`,
and work with it through plain Java calls.

The engine itself is written in Rust and loaded as a native library. The Java SDK
is a thin, typed layer over it, so file parsing, formula evaluation, and
rendering all happen in native code — Java holds only handles.

```
┌──────────────────────────────────────────────┐
│  Your application (Java)                     │
├──────────────────────────────────────────────┤
│  io.keikai.axyra.sheets   — the Java SDK     │
├──────────────────────────────────────────────┤
│  JNI bridge (libaxyra_jni)                   │
├──────────────────────────────────────────────┤
│  Rust engine                                 │
│  model · formula · format · ooxml · xls ·    │
│  csv · json · html · render · signature      │
└──────────────────────────────────────────────┘
```

# What you will build

Three short exercises, each standing on its own:

1. **[Quick Start]({{ site.axyra_tutorial }}/quick_start)** — add the dependency
   and write your first workbook to disk.
2. **[Read and Write Files]({{ site.axyra_tutorial }}/read_write)** — open an
   existing XLSX, edit it, recalculate, and save it back.
3. **[Render to PDF and Images]({{ site.axyra_tutorial }}/render)** — turn a
   workbook into a paginated PDF or a PNG.

# Requirements

- **Java 17** or later.
- One of the supported platforms: macOS (x86-64, aarch64), Linux (x86-64,
  aarch64), Windows (x86-64). The published SDK bundles a native library for
  each supported platform.
- A license token for production use. See
  [Licensing]({{ site.axyra_devref }}/License) — the engine runs unlicensed for
  evaluation, with limits.

# Where to go next

Once the tutorial makes sense, the
[Developer Reference]({{ site.axyra_devref }}) covers each area in depth, and
the [Javadoc]({{ site.axyra_javadoc }}) documents every public class.
