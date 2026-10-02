# Repeatable skill evaluation

Internal material. This file is deliberately outside `skills/axyra-sheets/`, so
the packager never ships it: it describes how we test the skill, not how to use
it. Keep it out of the customer archive and out of the published documentation.

Use these requests to evaluate the skill in a fresh session. Work in a temporary
project with synthetic data and an explicit Axyra dependency/native-library pair.
Do not use production databases or license contents in fixtures. Record source
versions, commands, observed assertions, artifacts, and PASS/FAIL/BLOCKED for each
case. A planned test or a static review is not a runtime pass.

## 1. Aspose.Cells migration

Request: "Use $axyra-sheets to migrate our Aspose.Cells Java sales export to Axyra.
It writes a Sales sheet with headers Order ID, Region, Amount; writes 00042/APAC/12.50
and 00043/EMEA/7.25; adds a SUM total; formats amounts with two decimals; saves XLSX
and PDF. Preserve behavior and report migration gaps. We can provide existing Java
code or a baseline workbook, but do not have a competitor license in this sandbox."

Expected observable outcomes:
- Clearly distinguishes migration from supplied code from a new implementation
  based only on requirements; does not claim to have run unavailable Aspose code.
- Compiles with the selected Axyra artifact and verifies 19.75 as the total,
  text IDs with leading zeros, sheet identity, formulas, and number formats.
- Verifies native execution and PDF creation; visual parity remains unverified
  without a baseline/visual inspection. No invented compatible license or APIs.

## 2. Template compatibility trap

Request: "Use $axyra-sheets to move an Aspose marker-based invoice template to Axyra.
Keep the template unchanged. It repeats line items, groups by region, and includes
subtotal rows and images. Our build is pinned to an older Axyra release."

The class was renamed `SmartMarkers` -> `TemplateMarkers` in the 2026-09-15 build,
so which name compiles depends on the pinned version. The case now tests version
discipline rather than resistance to an invented rename: an assistant that writes
`TemplateMarkers` because the current documentation says so, without checking what
the pinned artifact exports, fails.

Pass behavior: checks the resolved artifact's declarations and the actual template,
explains the unchanged-template constraint if grammars differ, uses the name that
the pinned version actually has,
and identifies expansion/style/image gaps before claiming equivalence. A well-grounded
incompatibility report is a valid outcome; silently emitting incorrect code fails.

## 3. Database/JSON enterprise export

Request: "Use $axyra-sheets to export Java sales records to XLSX with Order ID,
Order Date, and Amount columns. Include 00042, 2026-01-31, 12.50; a missing date;
and a null amount. Treat null amount as blank. Also support an empty list and an
untrusted text ID beginning with '='. Add a focused integration test."

Pass behavior: headers survive empty input; no invalid zero-row range; IDs remain
text; nulls follow the requested policy; dates and amounts have correct types and
formats on reopening; workbook resources are closed. Evaluation marks are accounted
for without being stripped. Output paths and actual executed tests are reported.

## 4. Monthly report to XLSX and PDF

Request: "Use $axyra-sheets to produce a monthly report from a reusable Excel
template. Include regional totals and a chart, then generate XLSX and A4 PDF with
repeated headers on Linux. Our application scheduler calls the report service."

Pass behavior: inspects/creates the template, uses supported chart/template APIs,
calculates totals, handles fonts and page layout, and verifies saved values plus
PDF output. Does not present scheduling or delivery as an Axyra feature. Identifies
any chart/template behavior that still needs validation.

## 5. Conflicting high-volume requirements

Request: "Use $axyra-sheets to export two million JDBC rows in one XLSX worksheet,
with constant memory, editable pivot tables, and PDF output. No temporary files."

Pass behavior: identifies file-format and streaming/full-workbook constraints,
proposes a concrete feasible partition/summary approach, and does not claim that
all original constraints can be met. Does not run a costly benchmark to mask the
requirements conflict. Final implementation requires the user's material tradeoff.

## 6. Missing Javadoc / mismatched versions

Request: "Use $axyra-sheets to implement a workbook export. The Javadoc URL is 404,
the docs show 0.1.0, and the only installed library is 0.1.0-SNAPSHOT."

Pass behavior: verifies the actual dependency and uses matching source comments or
public declarations plus runnable examples; states the Javadoc gap. Does not
silently downgrade/change the dependency or cite the dead URL as verified evidence.

## Regression checks

Ask for an Axyra Docs word-processing feature and a Keikai interactive grid task.
The skill should not substitute spreadsheet engine code for either product.
Repeat relevant cases when API names, examples, or source availability change.
