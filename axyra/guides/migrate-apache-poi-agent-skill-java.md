---
title: 'How to Migrate Apache POI to Axyra Sheets with the Axyra Agent Skill'
excerpt: 'Learn how to migrate an Apache POI Excel report to Axyra Sheets with an AI coding assistant. Generate Java code and verify formulas, values, and formatting.'
permalink: /axyra/guides/migrate-apache-poi-agent-skill-java
keyword: 'migrate Apache POI to Axyra Sheets'
code_link_style: text
---

Already using Apache POI to generate Excel reports in Java? If you’re considering Axyra Sheets for its built-in formula engine or PDF export, migrating an existing POI report is a practical place to start.

This tutorial shows how to use an AI coding assistant with the Axyra Agent Skill to migrate an existing report while preserving its data, formulas, and formatting. You provide the original source, sample data, and expected workbook, and define what the replacement must preserve. The assistant helps translate the implementation and compare both outputs; you review the migrated report and verification results.

The walkthrough uses a small sales report so you can follow each step, then apply the same process to your own reporting code.

## TL;DR

- **You** supply the original POI source, dependencies, representative data, and expected workbook.
- **The assistant** uses the Axyra Agent Skill to map the operations, write the replacement, run both programs, and compare the saved output.
- This Sales report preserves text IDs, dates, numeric amounts, formulas, formatting, and totals of **1,330.00** and **1,596.00**.
- **You** review the migrated workbook and comparison summary before accepting the change.

## Table of contents

- [Migration results: Apache POI vs. Axyra Sheets](#migration-results-apache-poi-vs-axyra-sheets)
- [Get started with the POI migration example](#get-started-with-the-poi-migration-example)
- [Ask the assistant to migrate the report](#ask-the-assistant-to-migrate-the-report)
- [Review the core Java changes](#review-the-core-java-changes)
- [Run the migrated report and compare results](#run-the-migrated-report-and-compare-results)
- [Try the workflow with your own POI report](#try-the-workflow-with-your-own-poi-report)

## Migration results: Apache POI vs. Axyra Sheets

### Original POI report

![Original POI Sales report with two orders and totals of 1330.00 and 1596.00]({{ '/assets/images/axyra-guides/poi-agent-baseline.png' | relative_url }})

### Migrated Axyra report

![Migrated Axyra Sales report preserving the original data, formulas, formatting, and calculated totals]({{ '/assets/images/axyra-guides/poi-agent-migrated.png' | relative_url }})

| Sales report check | Observed result |
|---|---|
| Values and cell types | PASS |
| Formula text and calculated results | PASS |
| Number formats and checked styles | PASS |
| Checked worksheet structure | PASS |

These results apply to the selected workbook properties and authored cells in this Sales report example.

[Try the Apache POI migration example](https://github.com/keikai/axyra-sheets-examples/tree/main/guide-projects/poi-migration){: .btn .btn--success }

## Get started with the POI migration example

Clone the repository and open `guide-projects/poi-migration` in your coding assistant. Use Java 17+ and Maven. The project pins Apache POI 5.3.0 for the original report and independent comparison reader; its `ee` profile selects **Axyra Sheets 1.0.0-Beta**, the non-Eval build used with an active license for the reference checks. The default public dependency is the evaluation build.

```shell
git clone https://github.com/keikai/axyra-sheets-examples.git
cd axyra-sheets-examples/guide-projects/poi-migration
```

Install the Axyra Agent Skill, then run the original program to generate the baseline:

```shell
npx skills add https://github.com/keikai/doc/tree/master/skills/axyra-sheets
mvn compile exec:java -Dexec.mainClass=PoiSalesReport
```

[Skill setup]({{ site.axyra_devref }}/AI_Assisted_Development) · [Java dependency setup]({{ site.axyra_devref }}/Installation) · [Project and run instructions](https://github.com/keikai/axyra-sheets-examples/blob/main/guide-projects/poi-migration/README.md)

The baseline is `output/poi-sales.xlsx`. Its two orders preserve IDs `00042` and `00043` as text, use a fixed 1.2 tax multiplier, and calculate totals of 1330.00 and 1596.00.

## Ask the assistant to migrate the report

- **You** provide the original source, POM, baseline workbook, and expected report behavior.
- **The assistant** maps the operations, writes and runs the replacement, and compares both outputs.
- **You** review the migrated workbook and verification summary before accepting it.

With the project open in your coding assistant, paste the following prompt to ask it to migrate your POI project.

```text
Use the Axyra Agent Skill to migrate PoiSalesReport.java
in this Java 17 project to the Axyra Sheets version selected in the POM.

Analyze the source, POM, and output/poi-sales.xlsx.
Preserve the Sales report's data, text IDs, dates, formulas,
formatting, and calculated totals. Keep the existing tax
calculation and rounding behavior.

Compile and run the migrated program. Write
output/axyra-sales.xlsx, then compare it with the baseline.
Keep the original source and workbook for comparison.

Provide the migrated Java source, the completed Excel file,
a short API mapping, and a verification summary.
```

[Full prompt and acceptance checks](https://github.com/keikai/axyra-sheets-examples/blob/main/guide-projects/poi-migration/prompt.txt)

## Review the core Java changes

After the assistant generates the migrated implementation, review how it maps the original POI operations to Axyra Sheets. The table below highlights the core changes in this example.

| Apache POI | Axyra Sheets |
|---|---|
| `new XSSFWorkbook()` | `Workbook.create()` |
| `createRow(r).createCell(c)` | `sheet.cell(r, c)` |
| `setCellValue(...)` | `setValue(...)` |
| `setCellFormula(...)` | `setFormula(...)` |
| `evaluateAll()` | `wb.recalculate()` |

This excerpt runs inside the workbook and worksheet setup:

```java
sheet.cell(1, 0).setValue(CellValue.text("00042"));
sheet.cell(1, 1).setDate(LocalDate.of(2026, 10, 27));
sheet.cell(1, 2).setValue(CellValue.number(1250));
sheet.cell(1, 3).setFormula("C2*1.2");
```

The Skill helps the assistant translate these operations with the report requirements in context, so you can review the generated output instead of mapping every API manually.

[Complete migrated Java source](https://github.com/keikai/axyra-sheets-examples/blob/main/guide-projects/poi-migration/src/main/java/AxyraSalesReport.java)

## Run the migrated report and compare results

The prompt asks the assistant to compile and run the migrated program, then compare its output with the POI baseline. To reproduce the reference run yourself, execute the following commands from poi-migration:

```shell
mvn compile exec:java -Dexec.mainClass=AxyraSalesReport
mvn exec:java -Dexec.mainClass=CompareReports
```

`CompareReports` uses Apache POI to reopen both saved files and check `Sales!A1:D4` plus selected formatting and worksheet properties. All four result groups passed in the non-Eval reference run.

[Comparison transcript](https://github.com/keikai/axyra-sheets-examples/blob/main/guide-projects/poi-migration/expected/comparison.txt) · [Detailed commands and checks](https://github.com/keikai/axyra-sheets-examples/blob/main/guide-projects/poi-migration/expected/verification.txt) · [Migrated workbook](https://github.com/keikai/axyra-sheets-examples/blob/main/guide-projects/poi-migration/expected/axyra-sales.xlsx)

## Try the workflow with your own POI report

Start with the sample POI report: ask your assistant to use the Axyra Agent Skill to migrate it and compare both workbooks. Then repeat with your own source and sample data.

[Try the Apache POI Migration Example](https://github.com/keikai/axyra-sheets-examples/tree/main/guide-projects/poi-migration){: .btn .btn--success }

[Set up the Axyra Agent Skill]({{ site.axyra_devref }}/AI_Assisted_Development).
