# Pitfalls: TemplateMarkers reports

Measured on `0.1.0.FL.20260922-Eval`, re-verified on `0.1.0.FL.20260930-Eval`; recheck against the resolved build. Docs:
`https://doc.keikai.io/axyra/dev-ref/Template_Markers` and
`guides/generate-excel-reports-java`. Examples: `devref/TemplateMarkersExample.java`,
`guides/GenerateReportExample.java` in the examples repository.

## Entry point

`TemplateMarkers.process(Sheet, Map<String,Object>)`. Builds before
`0.1.0.FL.20260915-Eval` name it `SmartMarkers`, with no alias; the marker syntax
and `process` signature did not change. Check the resolved artifact before writing
imports.

Start from an actual or synthetic XLSX template.

## Marker grammar

- `${a.b}` resolves through map keys, record components, getters or public fields.
- `${list.field}` on a row repeats that row once per record.
- `${list.field:sum|avg|count|min|max}` aggregates a list.
- `${list.field:group}` groups records. A row directly below it holding
  `:subtotal-sum` (or another aggregate) and `:groupname` markers becomes the
  group's subtotal row.
- `${image:path}` inserts a `byte[]` image.

## Expansion pitfalls

| Behavior | Consequence | Workaround |
|---|---|---|
| A cell that is exactly one marker keeps a number or boolean type, but a `LocalDate`, enum or mixed text becomes a string | Dates arrive as text, not date serials | Pass dates as serial numbers, or set them with `Cell.setDate` after `process`, then format the column |
| With `:group`, only the first inserted row of a group reliably keeps a date column's number format; later rows can revert to General. Some runs also gave detail rows the subtotal row's bold style | Inconsistent formatting down the report | Re-apply the data-row styles (at least the date format) to every data row after `process` |
| Inserted rows copy the template row's styles in current builds; `0.1.0.FL.20260916-Eval` and earlier did not | Unformatted rows on older builds | Apply styles after processing on those builds |
| Formulas outside the repeated row keep their ranges: a `SUM(B3:B3)` below the block is not widened | Totals cover only the template row | Use an aggregate marker for totals |
| Formulas on the template row shift like Excel's fill-down, except `$`-anchored references | Expected; anchors stay fixed | Check one expanded formula |
| Unknown markers render blank; an empty list blanks the marker cells and inserts no rows | Missing data looks like an empty report | Validate the data map before `process` |

## Test

Test zero, one and multiple records, group boundaries, subtotals and totals, and
the formatting of every data row, not only the first. Read the saved file back.

Axyra performs workbook processing only. Scheduling, email delivery, storage,
retries and tenant isolation belong to the application; describe those integration
points without claiming built-in services.
