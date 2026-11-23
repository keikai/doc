# Feature recipes: content, protection and data tools

Measured on `1.0.0-fl.20261116`. Use these recipes when adjacent parameters have the
same type; the argument order is part of the example. Save and reopen the result for
verification. Namespaces: `Axyra.Sheets.Pivots`, `.Drawing`, `.Charts`, `.Tables`,
`.Content`, `.Style`, `.IO`.

## Pivot tables, slicers and timelines

`sheet.PivotTables.Add` is `(name, location, source)`, not source before location:

```csharp
Sheet pivotSheet = wb.Sheets.Add("Pivot");
PivotTable pivot = pivotSheet.PivotTables.Add("SalesPivot", "A1", "Data!$A$1:$C$100");
pivot.RowFields.Add("Region");
pivot.ColumnFields.Add("Product");
pivot.DataFields.Add("Amount", AggregateFunction.Sum);
pivot.Refresh(); // required before reading the output cells in memory
```

Slicers and timelines are workbook collections. The compact overloads are
`wb.Slicers.Add(name, source)` and `wb.Timelines.Add(name, pivotName, dateField)`; the
visible, anchored overloads take the pivot object and a `DrawingAnchor`:

```csharp
wb.Slicers.Add("RegionSlicer", pivot, "Region", new DrawingAnchor(1, 12, 6, 15));
wb.Timelines.Add("OrderTimeline", pivot, "OrderDate", new DrawingAnchor(8, 12, 14, 20));
```

## Pictures, shapes and sparklines

Anchors are `DrawingAnchor` records: `new DrawingAnchor(fromRow, fromColumn, toRow,
toColumn)` is zero-based with an exclusive end cell (`(1, 1, 6, 5)` covers `B2:E6`);
`DrawingAnchor.Cover("B2:F7")` is inclusive; `new DrawingAnchor(new AnchorPoint(row,
column, rowOffset, columnOffset), ...)` adds EMU offsets.

```csharp
sheet.Pictures.Add(pngBytes, PictureFormat.Png, new DrawingAnchor(1, 1, 6, 5));
sheet.Shapes.AddTextBox(new DrawingAnchor(0, 7, 3, 11), "Quarterly sales");   // anchor, text
sheet.Shapes.Add("rect", new DrawingAnchor(4, 7, 7, 11), "Review");          // geometry, anchor, text

sheet.Sparklines.Add(SparklineType.Line, "Data!B2:M6", "N2:N6");   // five sparklines, one group
```

`Sparklines.Add` makes one sparkline per destination cell: a single data row (or
column) for one cell, or a block whose row count matches a destination column, as
Excel's Insert > Sparklines does. Any other shape throws `AxyraException`.

## Tables and conditional formats

`sheet.Tables.Add(name, range, columnNames)` creates a table over that exact range;
style and totals are properties of the returned `Table`.

```csharp
Table table = sheet.Tables.Add("SalesTable", "A1:C100", "Region", "Product", "Amount");
table.Style = new TableStyle("TableStyleMedium2");
table.ShowTotalsRow = true;                                   // extends the range by one row
table.Columns[2].TotalsFunction = TotalsRowFunction.Sum;      // SUBTOTAL(109,SalesTable[Amount])

sheet.ConditionalFormats.Add("C2:C100",
    new CellValueRule(ComparisonOperator.GreaterThan, "1000")
    {
        Style = new ConditionalStyle
        {
            FillColor = Color.FromRgb(255, 235, 156),
            FontColor = Color.FromRgb(156, 101, 0),
        },
    });
```

## Validation and protection

Use `Validation.List` for an inline list. It already shows the arrow; do not set
`ShowDropdown = false`, because that hides it. Use a range-backed formula for values
that contain commas.

```csharp
sheet.Validations.Add("D2:D100", Validation.List("Open", "Closed"));
sheet.Validations.Add("E2:E100", new Validation(ValidationType.List) { Formula1 = "Lists!$A$1:$A$20" });

sheet["A2:C100"].Style = new CellStyle { Locked = false };   // replaces the range's whole style
sheet.Protect(password, new SheetProtection
{
    SelectLockedCells = true,
    SelectUnlockedCells = true,
    AutoFilter = true,
});
```

Protection is not encryption. Use `new SaveOptions { Password = ... }` (encrypted
save) or `wb.SetWriteProtection(...)` when the requirement is opening or modifying the
file with a password.

## Signatures

The order is always private key first, certificate second. The key is PKCS#8 DER
or PEM (RSA PKCS#1 is also accepted); the certificate is X.509 DER or PEM
(`RSA.ExportPkcs8PrivateKey()` and `X509Certificate2.Export(X509ContentType.Cert)`
produce them). Signing serializes an XLSX and does not mutate the live workbook, so
it must be the last output step. It needs a license with the `signatures` feature;
in evaluation mode it throws.

```csharp
byte[] signedXlsx = wb.Sign(privateKey, certificate);
File.WriteAllBytes(output, signedXlsx);
// Or: wb.Sign(output, privateKey, certificate);
```

Any later normal `Save` is unsigned. Reopen the signed file and inspect
`wb.Signatures` to verify package integrity; certificate trust is outside this API.

## Subtotals, consolidation, CSV and split files

`CellRange.Subtotal(groupBy, function, totalColumns, hasHeaders)` counts columns
**from the range's first column** (unlike the Java SDK's absolute sheet columns). Use
`hasHeaders: true` when the range includes a header row; the block must be sorted by
the group column.

```csharp
int inserted = sheet["B1:D100"].Subtotal(0, SubtotalFunction.Sum, new[] { 2 }, hasHeaders: true);
summary.Consolidate(1, 1, ConsolidateFunction.Sum, jan["B2:D20"], feb["B2:D20"]);
```

Consolidation combines equally shaped sources by cell position unless
`ConsolidateOptions { TopRow = true, LeftColumn = true }` asks for label matching.

```csharp
wb.SaveCsv("sales.csv", new CsvOptions { SheetName = "Data", Values = CsvValues.Formatted, Utf8Bom = true });
IReadOnlyList<string> files = wb.SplitToFiles("out", "{name}-{index}.xlsx");
```

The split pattern must contain `{name}` or `{index}` (otherwise `ArgumentException`);
`{index}` is the zero-based sheet index.

## Formula conversion, themes and colours

The anchor arguments of `FormulaToR1C1` and `FormulaToA1` are one-based, unlike cell
and range indices.

```csharp
string r1c1 = wb.FormulaToR1C1("A1+$B$2", 3, 3);   // "R[-2]C[-2]+R2C2"
Theme? theme = wb.Theme;                           // null on new Workbook()
Color? color = sheet[0, 0].Style.Font.Color;
string? rgb = color != null && color.IsRgb ? color.ToHex() : null;
```

Do not force automatic, indexed or theme colours through `ToHex()`; preserve their
kind or resolve them deliberately against a non-null workbook theme.
