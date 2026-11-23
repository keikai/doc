# Pitfalls: TemplateMarkers reports

Measured on `1.0.0-fl.20261116`; recheck against the resolved build. The marker
grammar is the same in every Axyra SDK, so the public docs
`https://doc.keikai.io/axyra/sheets/java/dev-ref/Template_Markers` apply (their code is Java).

## Entry point

`TemplateMarkers.Process(Sheet, IDictionary<string, object?>)` or
`TemplateMarkers.Process(Sheet, object)` (public properties become the top-level keys,
which suits an anonymous object). Namespace `Axyra.Sheets.Template`.

Start from an actual or synthetic XLSX template. `Process` changes the sheet in
place: open a fresh copy of the template (bytes read once) for each report.

## Marker grammar

- `${a.b}` resolves through dictionary keys, public properties (`name` also finds
  `Name`; `active` also finds `IsActive`) or public fields.
- `${list.field}` on a row repeats that row once per record. The list must be an
  `IList` that is **not an array** (`List<T>`): an array resolves as an unknown
  marker and renders blank.
- `${list.field:sum|avg|count|min|max}` aggregates a list.
- `${list.field:group}` groups records. A row directly below it holding
  `:subtotal-sum` (or another aggregate) and `:groupname` markers becomes the
  group's subtotal row.
- `${image:path}` inserts a `byte[]` image.

## Expansion pitfalls

| Behavior | Consequence | Workaround |
|---|---|---|
| A cell that is exactly one marker keeps a number, boolean or date type (`DateOnly`/`DateTime` become date serials); an enum or mixed text becomes a string | Mixed marker text loses the original type | Use a marker-only cell when its numeric or date type matters, and give it a date format in the template |
| Every output row takes the cell formats of its template row. With `:group`, detail rows after the first can take the subtotal row's style (bold) | Inconsistent formatting down the report | Re-apply the data-row styles to every data row after `Process`, and check them |
| Formulas outside the repeated row keep their ranges: a `SUM(C3:C3)` below the block is not widened | Totals cover only the template row | Use an aggregate marker for totals |
| Formulas on the template row shift like Excel's fill-down, except `$`-anchored references | Expected; anchors stay fixed | Check one expanded formula |
| Unknown markers render blank; an empty list blanks the marker cells and inserts no rows (static text on that row stays) | Missing data looks like an empty report | Validate the data dictionary before `Process` |

```csharp
using Axyra.Sheets.Template;

var data = new Dictionary<string, object?>
{
    ["company"] = new { Name = "Acme" },
    ["lines"] = new List<object> { new { Region = "North", Amount = 12.5 } },   // List, not array
};
TemplateMarkers.Process(sheet, data);
```

## Test

Test zero, one and multiple records, group boundaries, subtotals and totals, and
the formatting of every data row, not only the first. Read the saved file back.

Axyra performs workbook processing only. Scheduling, email delivery, storage,
retries and tenant isolation belong to the application; describe those integration
points without claiming built-in services.
