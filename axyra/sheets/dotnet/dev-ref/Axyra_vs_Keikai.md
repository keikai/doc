---
title: 'Axyra Sheets vs. Keikai Spreadsheet (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Axyra_vs_Keikai
redirect_from:
  - /axyra/dotnet/dev-ref/Axyra_vs_Keikai
---

| Requirement | Product |
|---|---|
| Read or write workbook files from a C# backend | Axyra Sheets for .NET |
| Calculate formulas or produce PDF/images without Excel installed | Axyra Sheets |
| Embed an interactive spreadsheet editor in a browser application | Keikai Spreadsheet |

Axyra Sheets is a processing library. Its .NET API exposes workbooks, sheets,
cells, formulas and rendering, with a native engine shipped inside the NuGet
package. It does not provide an interactive browser grid.

Keikai Spreadsheet is the browser spreadsheet component in the Java/ZK ecosystem.
Choosing the Axyra .NET library does not install that UI or convert its Java
integration into a .NET control. Decide separately how your application presents
or edits data.

Start with [Installation]({{ site.axyra_dotnet_devref }}/Installation) for backend
processing, or visit [Keikai Spreadsheet](https://keikai.io) for the interactive UI.
