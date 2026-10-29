# Pitfalls: TemplateMarkers reports

Measured on `1.0.0-Beta-Eval`; recheck against the resolved build. Docs:
`https://doc.keikai.io/axyra/dev-ref/Template_Markers` and
`guides/generate-excel-reports-java`. Examples: `devref/TemplateMarkersExample.java`,
`guides/GenerateReportExample.java` in the examples repository.

## Entry point

`TemplateMarkers.process(Sheet, Map<String,Object>)`.

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
| A cell that is exactly one marker keeps a number, boolean or date type (`LocalDate` becomes a date serial); an enum or mixed text becomes a string | Mixed marker text loses the original Java type | Use a marker-only cell when its numeric or date type matters |
| Every output row takes the cell formats of its template row. With `:group`, detail rows can also take the subtotal row's style (bold) | Inconsistent formatting down the report | Re-apply the data-row styles to every data row after `process`, and check them |
| Formulas outside the repeated row keep their ranges: a `SUM(B3:B3)` below the block is not widened | Totals cover only the template row | Use an aggregate marker for totals |
| Formulas on the template row shift like Excel's fill-down, except `$`-anchored references | Expected; anchors stay fixed | Check one expanded formula |
| Unknown markers render blank; an empty list blanks the marker cells and inserts no rows | Missing data looks like an empty report | Validate the data map before `process` |

## Test

Test zero, one and multiple records, group boundaries, subtotals and totals, and
the formatting of every data row, not only the first. Read the saved file back.

Axyra performs workbook processing only. Scheduling, email delivery, storage,
retries and tenant isolation belong to the application; describe those integration
points without claiming built-in services.
