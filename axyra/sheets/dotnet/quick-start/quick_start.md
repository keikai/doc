---
title: 'Manual Quick Start (.NET)'
permalink: /axyra/sheets/dotnet/quick-start/quick_start
redirect_from:
  - /axyra/dotnet/quick-start/quick_start
---
Prefer to write the first program yourself? This path takes you from an empty
.NET project to a saved `.xlsx` file in about ten minutes. To generate the project
with a coding assistant instead, use
[AI-Assisted Development]({{ site.axyra_dotnet_devref }}/AI_Assisted_Development).

# 1. Add the package

Create a console project, then register the Axyra evaluation feed in a
`nuget.config` file next to the project (or solution) file:

{% capture nuget_config %}<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="axyra-eval" value="{{ site.axyra_dotnet_feed_url }}" />
  </packageSources>
</configuration>
{% endcapture %}
{% include copy_code.html code=nuget_config language="xml" event="copy_nuget_config" %}

Then add the package. The evaluation feed carries prerelease versions only, so pass
`--prerelease`:

{% capture nuget_add %}dotnet new console -o HelloAxyra
cd HelloAxyra
dotnet add package Axyra.Sheets --prerelease
{% endcapture %}
{% include copy_code.html code=nuget_add language="shell" event="copy_nuget_code" %}

Axyra Sheets is not on nuget.org, so the feed is required. It is added to your
other package sources; nuget.org stays available.

The package includes the native engine for every supported platform, and .NET
loads the matching one at runtime. Nothing needs configuring. See
[Native Library Loading]({{ site.axyra_dotnet_devref }}/Native_Loader) for
details, including publishing for one platform and running against a local build.

## Evaluation Mode

You do not need a license key to follow this Quick Start. Without a key, Axyra Sheets runs in Evaluation Mode, which is intended for evaluation purposes only.

In Evaluation Mode, every saved workbook gets an extra first sheet named
**Axyra Evaluation Copy**, a notice row below each sheet's data, and a notice in
the page header. PDF and image output carries a one-line banner. A process can
perform at most 100 opens, saves, renders, and streaming workbook creations
combined; the next attempt throws `AxyraException`, so restart the process to
continue. The program also prints a one-line evaluation notice to standard error
the first time it opens, saves, or renders. For the full Evaluation Mode behavior,
a 30-day full-featured evaluation key, and production licensing, see
[Licensing and Evaluation]({{ site.axyra_dotnet_devref }}/License).
Stuck at any step?
[Request evaluation help]({{ '/axyra/sheets/evaluation-help' | relative_url }}?src=dotnet_quickstart_eval_mode).

# 2. Create a workbook

`Workbook` implements `IDisposable`. It owns the native engine's memory, so always
dispose it — a `using` declaration is the simplest way. Replace the contents of
`Program.cs` with:

```csharp
using Axyra.Sheets;

using Workbook wb = new Workbook();
Sheet sheet = wb.Sheets.Add("Sheet1");

sheet[0, 0].Value = "Item";
sheet[0, 1].Value = "Qty";
sheet[0, 2].Value = "Price";

sheet[1, 0].Value = "Widget";
sheet[1, 1].Value = 12;
sheet[1, 2].Value = 4.25;

sheet[1, 3].Formula = "B2*C2";   // calculated right away

wb.Save("hello.xlsx");
```

Run it with `dotnet run`. A few things worth noting:

- **Rows and columns are 0-based.** `sheet[0, 0]` is `A1`. Formulas, however, use
  ordinary A1 notation, so the formula on row index 1 refers to `B2` and `C2`.
- **Values convert implicitly.** Assigning a `string`, `bool`, `int`, `long`, or
  `double` to `Value` stores the matching `CellValue`. A value read back is one of
  the `CellValue` records — `Number`, `Text`, `Bool`, `Error`, `Blank`, or
  `Array` — ready for pattern matching. Dates go through `DateValue` and
  `DateTimeValue`, because their serial number depends on the workbook.
- **Formulas are calculated as you write.** Setting a value or a formula
  recalculates the cells that depend on it, so `D2` already holds `51` and the
  saved file carries that result. Saving itself never recalculates. Call
  `wb.Recalculate()` once before saving only when results can be stale: in
  `CalcMode.Manual`, or for formulas in an opened file that your edits did not
  touch.
- **Formulas have no leading `=`.** Write `"B2*C2"`, as the formula bar shows it
  without the equals sign; a typed `=` is tolerated and dropped.

# 3. Read a value back

```csharp
CellValue total = sheet[1, 3].Value;
if (total is CellValue.Number number)
{
    Console.WriteLine(number.Value);              // 51
}
Console.WriteLine(sheet[1, 3].FormattedText);     // 51
```

Match the `CellValue` variant to read the raw value, or let
`GetValue<T>()` convert it for you: `sheet[1, 3].GetValue<double>()` returns
`51`. `FormattedText` applies the cell's number format, which is what a
spreadsheet application would show.

# 4. A1 notation

If you would rather not count indices, the sheet's string indexer accepts an
ordinary A1 reference, and so do formulas, named ranges, and every reference
argument in the API:

```csharp
CellRange header = sheet["A1:D1"];   // same as sheet.GetRange(0, 0, 0, 3)
```

The range type is called `CellRange` rather than `Range`, so it never collides
with `System.Range` in projects with implicit usings.

{: .notice--info}
**Runnable example:** [`Tutorial/QuickStartExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/Tutorial/QuickStartExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- tutorial/quick-start`.

{% include axyra_cta.html touchpoint="dotnet_manual_quickstart_end" ab=true topic="migration" %}

# Next

- [Read and Write Files]({{ site.axyra_dotnet_tutorial }}/read_write) — open an
  existing workbook and edit it.
- [Workbook and Sheet]({{ site.axyra_dotnet_devref }}/Workbook_and_Sheet) — the full
  model reference.
