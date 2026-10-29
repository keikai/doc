---
title: 'Excel Template Java Example: Profit and Loss from Database Data'
excerpt: 'Use an Excel template in Java to turn database totals into a Profit and Loss report. Query with JDBC, fill Axyra markers, and verify the XLSX output.'
permalink: /axyra/guides/populate-excel-template-database-java
keyword: 'excel template java'
---

# Populate a Profit and Loss Excel Template from Java

An Excel template Java workflow is useful when finance owns the report layout but an application owns the numbers. This guide uses a Profit and Loss (P&L) workbook as an example. Java queries monthly revenue and expenses with JDBC, Axyra Sheets fills marked cells in the existing XLSX template, and Excel formulas calculate gross and operating profit. The same pattern works for a budget, balance sheet, or recurring management report.

## TL;DR

- Create `profit-and-loss-template.xlsx` with marker cells for the reporting period, revenue, cost of goods sold, and operating expenses. Keep profit formulas in the template.
- Run a parameterized JDBC query for one closed monthly period and validate the returned categories before filling the report.
- Open a fresh copy of the template with `Workbook.open`, call `TemplateMarkers.process`, recalculate once, and save the result as XLSX.
- Reopen the output and check its values, formulas, and number formats before distributing it.

## Table of contents

- [What does an Excel template Java report contain?](#what-does-an-excel-template-java-report-contain)
- [How do you design the Profit and Loss template?](#how-do-you-design-the-profit-and-loss-template)
- [How do you query monthly totals from the database?](#how-do-you-query-monthly-totals-from-the-database)
- [How do you populate the Excel template in Java?](#how-do-you-populate-the-excel-template-in-java)
- [How do you verify the generated report?](#how-do-you-verify-the-generated-report)
- [When should you use repeating rows instead?](#when-should-you-use-repeating-rows-instead)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## What does an Excel template Java report contain?

A template is an ordinary XLSX workbook that already contains the report's labels, formulas, and formatting. A *template marker* is a text cell such as `${revenue}` that Axyra Sheets replaces with a value supplied by Java. The template remains the source of the layout, so a report owner can change fonts, borders, or print settings in Excel without rewriting the database query.

For this example, the database table `ledger_entry` has `posted_at`, `category`, and `amount` columns. The three supported categories are `REVENUE`, `COGS`, and `OPEX`; amounts are stored as positive values, and the template subtracts expenses. If your ledger stores expenses as negative numbers, normalize them in the query or adjust the formulas rather than subtracting them twice. The [Template Markers reference](https://doc.keikai.io/axyra/dev-ref/Template_Markers) describes the syntax used below.

## How do you design the Profit and Loss template?

Create a workbook named `profit-and-loss-template.xlsx` with a sheet named `Profit and Loss`. Enter these values and formulas, then format cells B4:B8 as currency or as a two-decimal accounting number format. This is a compact P&L template you can build directly in Excel; no binary template file is assumed by the example.

| Row | Column A | Column B |
|---|---|---|
| 1 | Profit and Loss | |
| 2 | Period | `${period}` |
| 3 |  |  |
| 4 | Revenue | `${revenue}` |
| 5 | Cost of goods sold | `${cogs}` |
| 6 | Gross profit | `=B4-B5` |
| 7 | Operating expenses | `${opex}` |
| 8 | Operating profit | `=B6-B7` |

Put each numeric marker alone in its cell. A marker embedded in text becomes text, so a value like `USD ${revenue}` cannot participate in the profit formulas. The [Axyra report guide](https://doc.keikai.io/axyra/guides/generate-excel-reports-java) covers templates with repeating detail rows and grouped subtotals; this P&L uses fixed rows because the accounting categories are known in advance.

## How do you query monthly totals from the database?

Use a half-open date range: include `monthStart` and exclude the first day of the next month. This works for both `DATE` and timestamp columns without guessing the last instant of the month. A `PreparedStatement` binds the dates as values; see the [Java SE PreparedStatement API](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html) for the JDBC contract.

```java
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

static Map<String, BigDecimal> monthlyTotals(Connection conn, LocalDate monthStart)
        throws SQLException {
    String sql = """
            SELECT category, SUM(amount) AS total
            FROM ledger_entry
            WHERE posted_at >= ? AND posted_at < ?
            GROUP BY category
            """;
    Set<String> allowed = Set.of("REVENUE", "COGS", "OPEX");
    Map<String, BigDecimal> totals = new HashMap<>();
    for (String category : allowed) {
        totals.put(category, BigDecimal.ZERO);
    }

    try (PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setObject(1, monthStart);
        ps.setObject(2, monthStart.plusMonths(1));
        try (ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                String category = rs.getString("category");
                if (!allowed.contains(category)) {
                    throw new SQLException("Unexpected ledger category: " + category);
                }
                BigDecimal total = rs.getBigDecimal("total");
                totals.put(category, total == null ? BigDecimal.ZERO : total);
            }
        }
    }
    return totals;
}
```

The query groups database records before they reach the workbook. A report with hundreds of thousands of transactions therefore fills only three marker cells. If each transaction must appear on its own row, use a repeating list marker or a separate detail sheet instead of placing every transaction in this summary map.

## How do you populate the Excel template in Java?

This method combines the query with the template. It assumes Java 17 or later and the Axyra dependency and repository from the [installation guide](https://doc.keikai.io/axyra/dev-ref/Installation). The template and output paths are arguments so that a scheduler or web endpoint can call the same method.

```java
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.template.TemplateMarkers;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.sql.Connection;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

static void writeProfitAndLoss(Connection conn, LocalDate monthStart,
                               Path template, Path output) throws Exception {
    Map<String, BigDecimal> totals = monthlyTotals(conn, monthStart);
    Map<String, Object> data = new HashMap<>();
    data.put("period", monthStart.format(DateTimeFormatter.ofPattern("yyyy-MM")));
    data.put("revenue", totals.get("REVENUE").doubleValue());
    data.put("cogs", totals.get("COGS").doubleValue());
    data.put("opex", totals.get("OPEX").doubleValue());

    try (Workbook wb = Workbook.open(template)) {
        TemplateMarkers.process(wb.sheet("Profit and Loss"), data);
        wb.recalculate();
        wb.save(output);
    }
}
```

This Java code creates an Excel file from a template while preserving the workbook's existing layout. `TemplateMarkers.process` replaces the markers, and `recalculate()` updates the two profit formulas before the file is saved. Axyra and Excel use numeric spreadsheet cells for the totals, so conversion from `BigDecimal` to `double` should be checked against your finance system's rounding policy. Keep monetary aggregation in the database and reconcile the exported cents against the source query.

## How do you verify the generated report?

Test with a small month whose totals are known. If revenue is 120,000, cost of goods sold is 45,000, and operating expenses are 30,000, the workbook should show gross profit of 75,000 and operating profit of 45,000. Reopen the saved XLSX and check the sheet by name, the three input cells, the two formula cells, and the displayed number formats. A successful `save` call alone does not prove the report is correct.

Also test a month with no ledger rows, a month containing an unexpected category, and a month whose period crosses a year boundary. For production, compare the workbook's monetary totals with the same JDBC aggregation used by your accounting reconciliation. This is especially useful if the workbook will be converted to PDF or emailed automatically.

## When should you use repeating rows instead?

The fixed P&L layout is appropriate when category names and formulas stay stable. Some reports need a variable number of departments, products, or cost centers. In that case, pass a `List` to a template row such as `${lines.department}` and `${lines.amount}`. Axyra repeats that row for each item, while an aggregate marker such as `${lines.amount:sum}` supplies a total. For millions of raw rows, use a separate [streaming export](https://doc.keikai.io/axyra/dev-ref/Streaming) and keep the P&L workbook as a summary.

| Report need | Template approach |
|---|---|
| Fixed P&L categories and formulas | Scalar markers and Excel formulas, as above |
| Variable detail rows | List markers on a repeating template row |
| Very large raw transaction export | Streaming XLSX writer in a separate detail file |

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| Profit cells show old numbers | Formulas were not recalculated after markers were replaced | Call `wb.recalculate()` before saving |
| A total is text and formulas ignore it | The numeric marker shares a cell with surrounding text | Put the marker alone in its cell |
| Expenses increase profit | The source stores negative expenses but the template subtracts them | Document the sign convention and adjust the query or formula |
| A category silently disappears | The query returns a category the template does not cover | Validate categories before filling the workbook |
| Formatting changes between runs | The processed workbook was reused as the next template | Open the original template for every report |

## FAQ

### Can Java create an Excel file from a template?

Java can create an Excel file from a template. Put `${...}` markers in data cells, open the XLSX layout with Axyra Sheets, and call `TemplateMarkers.process` with a map of Java values. Recalculate formulas and save the result under a new file name.

### How do I export database data into an Excel template?

Query the data with JDBC, convert the result into values that match the template's marker names, and pass them to `TemplateMarkers.process`. For a fixed P&L, aggregate rows in SQL first; for variable detail rows, pass a list of records to a repeating template row.

### Can the Profit and Loss template keep its formulas and formatting?

The template's formulas remain in the workbook while markers in other cells are replaced with values. Call `recalculate()` before saving, and reopen a sample output to confirm the formulas and number formats still match the intended report.

### Is Axyra Sheets a Java Excel template report generator?

Axyra Sheets fills and calculates XLSX templates from Java data. It does not run the SQL query, choose a reporting period, schedule the job, or distribute the file; those parts belong to the application.

## Next steps

- [Template Markers](https://doc.keikai.io/axyra/dev-ref/Template_Markers) explains scalar, list, aggregate, and grouping markers.
- [How to Create Excel Reports Automatically in Java]({{ site.axyra_guides }}/generate-excel-reports-java) adds repeating rows and PDF output.
- [How to Export Database Data to Excel in Java]({{ site.axyra_guides }}/export-database-to-excel-java) covers a generic JDBC result export without a template.
