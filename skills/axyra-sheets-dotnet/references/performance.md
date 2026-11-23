# Performance decisions

Use only for performance work or large data. The numbers below are one sample on
`1.0.0-fl.20261116` (macOS arm64, Debug build); remeasure the required workload on its
resolved build, not every ordinary task. State the data shape, scales and
memory/time constraints.

- Every normal write already updates its dependent formulas. Whole-workbook
  `wb.Recalculate()` inside a row loop repeats that work (2,000 writes with a
  `Recalculate()` each took ~2.7 s against a 100k-cell sheet). Move it to the point
  where results are needed or before saving manual/stale workbooks. Multiple
  calculation phases can be necessary when later writes consume earlier formula results.
- Bulk `CellRange` transfers cross into the engine once per rectangle:
  `SetNumbers(double[,])` (or a row-major `ReadOnlySpan<double>`), `SetValues(object?[,])`
  / `SetValues(CellValue[,])`, `GetNumbers()`, `GetValues()`, `SetFormulas(string[,])`.
  A sample of 100k cells: per-cell writes ~49 ms vs `SetNumbers` ~5 ms; per-cell reads
  ~76 ms vs `GetNumbers`+`GetValues` ~30 ms. Not universal guarantees.
- Find the data extent once with `UsedRange` (null-check it) or bounded column reads
  instead of repeated cell probes. Preserve blank-row stopping rules and existing
  formatting.
- Prefer bounded primitive/batch buffers over collecting all intermediate records.
  `new Workbook(WorkbookStorage.Columnar)` can suit numeric columns, but still retains
  the workbook in memory. It is not constant-memory streaming.
- `StreamWorkbook` bounds memory for new sequential output only. It cannot open or
  modify an existing workbook, recalculate, render, or add charts/pivots. Its strict
  row order, commit/finish and registered-style rules are in
  [enterprise.md](enterprise.md). Explain the trade-off of the chosen design.
- `OpenAsync`/`SaveAsync`/`SavePdfAsync` move the call to the thread pool; they do not
  make the engine faster or the workbook thread-safe.
- For comparison, use a small sample that shows the trend (for example 1k/5k rows)
  and the requested target sizes. Do not run a known slow baseline at full scale
  unless required. Measure in Release, and separate generation, build, application
  time and RSS; native workbook memory is outside the GC heap
  (`GC.GetTotalMemory` does not see it).

Verify requested values, formulas and effective formats before accepting a speedup.
Do not add a benchmark project to a task that did not ask for performance work.
