---
title: 'AI-Assisted Development (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/AI_Assisted_Development
redirect_from:
  - /axyra/dotnet/dev-ref/AI_Assisted_Development
---

Use the **axyra-sheets-dotnet** skill when asking a coding assistant to build a
C# spreadsheet workflow. The Java skill documents a different API.

[Download the .NET skill]({{ "/assets/downloads/axyra-sheets-dotnet-skill.zip" | relative_url }}).

Install the distributed `axyra-sheets-dotnet-skill.zip` into your assistant's skill
folder. For Codex, extract it under `~/.codex/skills/`; the resulting entry point is
`~/.codex/skills/axyra-sheets-dotnet/SKILL.md`.

Give the assistant the package version, input files, output requirements and an
observable acceptance check. For example:

> Use $axyra-sheets-dotnet with Axyra.Sheets 1.0.0-fl.20261116. Create a C# console
> application that writes a sales workbook, calculates totals and saves XLSX.
> Reopen the saved file and check the numeric totals and formulas. Use evaluation
> mode and keep its marks. Store outputs in a separate directory.

Ask for a build and an output check when execution is allowed. Reading API
signatures proves neither successful native loading nor correct workbook output.
For a migration, compare representative saved values, formulas and formatting with
the original output and record differences. A PDF needs a visual layout check if
layout fidelity is part of the requirement.

The skill's API index targets a specific package version. Keep the application's
selected version and consult that package's XML documentation when versions differ.
See [Installation]({{ site.axyra_dotnet_devref }}/Installation) and
[Quick Start]({{ site.axyra_dotnet_tutorial }}/quick_start).
