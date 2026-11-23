---
title: 'Streaming Large Files (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Streaming
redirect_from:
  - /axyra/dotnet/dev-ref/Streaming
---

`StreamWorkbook` writes a new XLSX sequentially without keeping a full editable
workbook model. Use it for exports that do not need calculation, rendering or
modification of an existing workbook.

```csharp
using Axyra.Sheets.IO;

using (StreamWorkbook writer = new("orders.xlsx"))
{
    int header = writer.AddStyle(new StreamStyle { Bold = true });
    writer.StartSheet("Orders");
    writer.StartRow(0).AddText("Order ID", header).AddText("Amount", header).Commit();
    writer.StartRow(1).AddText("00042").AddNumber(1250).Commit();
    writer.Finish();
}
```

Rows and columns are zero-based. Commit rows in strictly ascending order;
repeating or going backwards throws. An uncommitted row is discarded. Finish or
dispose the writer before opening its output. The constructor takes a file path.

Register styles before using their indices. Dates need an explicit date number
format. The XLSX limit is 1,048,576 rows by 16,384 columns; the writer does not
start a new sheet automatically when the limit is reached.

Use `new Workbook(WorkbookStorage.Columnar)` when you need a full workbook API
with column-oriented storage. It still keeps an in-memory workbook and is not the
forward-only writer. Measure your actual workload before choosing a storage mode.

Runnable counterpart: `dev-ref/streaming` in the .NET examples project.
