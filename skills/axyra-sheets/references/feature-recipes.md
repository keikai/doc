# Feature recipes: content, protection and data tools

Measured on `1.0.0-Beta.FL.20261019-Eval`. Use these recipes when adjacent
parameters have the same Java type; the parameter order is part of the example.
Save and reopen the result for verification.

## Pivot tables, slicers and timelines

`addPivotTable` is `(name, location, sourceRef)`, not source before location:

```java
Sheet pivotSheet = wb.createSheet("Pivot");
int index = pivotSheet.addPivotTable("SalesPivot", "A1", "Data!$A$1:$C$100");
PivotTableView pivot = pivotSheet.pivotTable(index);
pivot.addRowField("Region");
pivot.addColumnField("Product");
pivot.addDataField("Amount", AggregateFunction.SUM);
pivot.refresh(); // required before reading the output cells in memory
```

The compact slicer overload is `(name, source)`. For a visible pivot slicer use
`(name, sourceField, pivotTable, sheetIndex, row, column, endRow, endColumn)`.
A timeline is `(name, pivotTable, dateField)`; its anchored overload appends the
same five anchor arguments.

```java
wb.addSlicer("RegionSlicer", "Region", "SalesPivot", 1, 1, 6, 12, 9);
wb.addTimeline("OrderTimeline", "SalesPivot", "OrderDate", 1, 14, 6, 21, 12);
```

## Pictures, shapes and sparklines

Picture anchors are zero-based. The short overload is `(imageData, format,
fromRow, fromColumn, toRow, toColumn)`. The full overload puts the start offsets
before the end cell: `(imageData, format, fromRow, fromColumn, fromRowOffset,
fromColumnOffset, toRow, toColumn, toRowOffset, toColumnOffset)`; offsets are EMUs.

```java
sheet.addPicture(pngBytes, "png", 1, 1, 6, 5);
sheet.addTextBox("Quarterly sales", 0, 7, 3, 11);
sheet.addShape("rect", "Review", 4, 7, 7, 11);

sheet.addSparkline("line", "Data!B2:M6", "N2:N6");   // five sparklines, one group
```

`addSparkline` makes one sparkline per destination cell: a single data row (or
column) for one cell, or a block whose row count matches a destination column, as
Excel's Insert > Sparklines does. An unqualified data reference is qualified with
the sheet's name. Any other shape throws `AxyraException`.

## Tables and conditional formats

`Range.createTable(name, columns...)` creates a table over that exact range. Set
table style and totals through the owning sheet.

```java
Range data = sheet.range("A1:C100");
data.createTable("SalesTable", "Region", "Product", "Amount");
sheet.setTableStyle("SalesTable", TableStyleInfo.of("TableStyleMedium2"));
sheet.setTableTotalsRow("SalesTable", true);
sheet.setTableColumnTotals("SalesTable", "Amount", TotalsRowFunction.SUM);

sheet.range("C2:C100").addConditionalFormat(
        ConditionalFormat.builder()
                .cellIs("greaterThan", "1000")
                .fillColor(Color.rgb(255, 235, 156))
                .fontColor(Color.rgb(156, 101, 0))
                .build());
```

## Validation and protection

Use `Validation.list` for an inline list. It already shows the arrow; do not set
`showDropdown(false)`, because that hides it in the current API. Use a range-backed
formula for values that contain commas.

```java
sheet.range("D2:D100").setValidation(Validation.list("Open", "Closed"));
sheet.range("E2:E100").setValidation(
        Validation.builder().type("list").formula1("Lists!$A$1:$A$20").build());

sheet.range("A2:C100").setStyle(
        CellStyle.builder().locked(false).build()); // replaces the range's whole style
SheetProtection allowed = SheetProtection.builder()
        .selectLockedCells(true)
        .selectUnlockedCells(true)
        .autoFilter(true)
        .build();
sheet.protect(password, allowed);
```

Protection is not encryption. Use workbook encryption/write protection APIs when
the requirement is opening or modifying the file with a password.

## Signatures

The order is always private key first, certificate second. The key is PKCS#8 DER
or PEM (RSA PKCS#1 is also accepted); the certificate is X.509 DER or PEM.
Signing serializes an XLSX and does not mutate the live workbook, so it must be the
last output step.

```java
byte[] signedXlsx = wb.sign(privateKeyBytes, certificateBytes);
Files.write(output, signedXlsx);
// Or: wb.sign(output, privateKeyBytes, certificateBytes);
```

Any later normal `save` is unsigned. Reopen the signed file and inspect
`signatures()` to verify package integrity; certificate trust is outside this API.

## Subtotals, consolidation, CSV and split files

`subtotal(firstDataRow, lastRow, groupByColumn, function, totalColumns...)` uses
absolute zero-based sheet columns. Use the overload with `hasHeaders = true` when
the range includes a header row.

```java
sheet.subtotal(0, 99, 0, true, SubtotalFunction.SUM, 2);
summary.consolidate(1, 1, ConsolidateFunction.SUM,
        jan.range("B2:D20"), feb.range("B2:D20"));
```

Consolidation combines equally shaped sources by cell position, not by matching
row or column labels.

```java
wb.saveCsv(Path.of("sales.csv"),
        CsvOptions.create().sheet("Data").values(CsvOptions.Values.FORMATTED).utf8Bom(true));
List<Path> files = wb.splitToFiles(Path.of("out"), "{name}-{index}.xlsx");
```

The split pattern must contain `{name}` or `{index}`. `{name}` is filesystem-safe;
`{index}` is the zero-based sheet index.

## Formula conversion, themes and colours

The anchor arguments of `formulaToR1C1` and `formulaToA1` are 1-based, unlike cell
and range index APIs.

```java
String r1c1 = wb.formulaToR1C1("A1+$B$2", 3, 3);
Theme theme = wb.theme();              // null on Workbook.create()
Color color = sheet.cell(0, 0).style().fontColor();
String rgb = color != null && color.isRgb() ? color.toHex() : null;
```

Do not force automatic, indexed or theme colours through `toHex()`; preserve their
kind or resolve them deliberately against a non-null workbook theme.

## Older builds

Builds before `1.0.0-Beta.FL.20261019-Eval` have these defects; on such a build,
work around them or upgrade:
- `Workbook.evaluate("SUM(DefinedName)")` returns `#VALUE!` for a multi-cell name.
- `addRowPageBreak`/`addColumnPageBreak` are not saved and do not paginate.
- `goalSeek` returns `NaN` in `CalcMode.MANUAL`; switch to `AUTOMATIC` around it.
- Array formulas read back as `{=...}` and with `_xlfn.` prefixes after reopen.
- A multi-row `addSparkline` call is saved as one invalid sparkline.
