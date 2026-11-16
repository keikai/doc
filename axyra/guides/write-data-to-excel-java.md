---
title: 'How to Write Data to Excel in Java (List, Database, or JSON)'
excerpt: 'Turn Java records into a formatted Excel report with importData, numeric amounts, and a formula total. Includes runnable code and a recorded AI-assisted export.'
permalink: /axyra/guides/write-data-to-excel-java
---

Turn Java records into a formatted Excel report without writing every data cell one by one. Axyra Sheets maps a list of objects to worksheet rows with `importData()`. Start with two records; add a header, number formats, and a formula total in the complete example below.

**Minimal export — records only.** This excerpt runs inside `main`; use [the complete Java class](#complete-example) for a runnable program and the formatted result below:

```java
record Sale(String orderId, String product, double amount) {}
List<Sale> sales = List.of(
        new Sale("00042", "Laptop", 1250),
        new Sale("00043", "Mouse", 80));
try (Workbook wb = Workbook.create()) {
    Sheet sheet = wb.createSheet("Sales");
    sheet.importData(0, 0, sales, ImportOptions.builder()
            .columns("orderId", "product", "amount")
            .headers(true).build());
    wb.save(Path.of("sales.xlsx"));
}
```

The minimal example exports the records. The complete example below adds the formatting and formula shown here: readable column labels, a bold header, `#,##0.00`, and `SUM(C2:C3)`.

| Order ID | Product | Amount |
| --- | --- | ---: |
| 00042 | Laptop | 1,250.00 |
| 00043 | Mouse | 80.00 |
| Total | | 1,330.00 |

![Two Java records, a bulk import, and the verified saved Excel workbook data]({{ '/assets/images/axyra-guides/write-excel-flow.svg' | relative_url }})

The figure and table show the complete example's output: IDs stay text, amounts stay numeric, and `C4` stores a formula. You can inspect the workbook and run the project before connecting a database.

[Download the project and generated XLSX]({{ '/assets/downloads/axyra-read-write-examples.zip' | relative_url }}) · [Run it](#setup) · [See the recorded AI export](#ai)

## Run the complete example
{: #setup}

Use Java 17+ and Maven; Microsoft Excel is not required. Unzip the project, open a terminal in `axyra-read-write`, and run:

```shell
mvn -q compile exec:java -Dexec.mainClass=WriteExcelFile
```

The project includes its POM and creates the output directory. Evaluation needs no key and adds notices; production use requires a commercial license. [Licensing details]({{ site.axyra_devref }}/License).

### Complete Java class
{: #complete-example}

Save this as `src/main/java/WriteExcelFile.java`:

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.ImportOptions;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.style.CellStyle;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public final class WriteExcelFile {
    public record Sale(String orderId, String product, double amount) {}

    public static void main(String[] args) throws Exception {
        Path output = Path.of("output/sales.xlsx");
        Files.createDirectories(output.getParent());
        List<Sale> sales = List.of(
                new Sale("00042", "Laptop", 1250),
                new Sale("00043", "Mouse", 80));
        try (Workbook wb = Workbook.create()) {
            Sheet sheet = wb.createSheet("Sales");
            sheet.importData(0, 0, sales, ImportOptions.builder()
                    .columns("orderId", "product", "amount")
                    .headers(true)
                    .columnLabels("Order ID", "Product", "Amount")
                    .headerStyle(CellStyle.builder().bold().build())
                    .build());
            sheet.cell(3, 0).setValue(CellValue.text("Total"));
            sheet.cell(3, 2).setFormula("SUM(C2:C3)");
            sheet.range("C2:C4").setStyle(CellStyle.builder()
                    .numberFormat("#,##0.00").build());
            for (int c = 0; c < 3; c++) sheet.setColumnWidth(c, 18);
            wb.save(output);
        }
        System.out.println("Saved " + output);
    }
}
```

The file is `output/sales.xlsx`. The column list fixes the schema; number formats control display while preserving numeric values. All formatting is applied before saving, inside the open workbook.

<details markdown="1">
<summary>Already have a Maven project? Add the repository and dependency</summary>

```xml
<repositories>
  <repository>
    <id>{{ site.axyra_repo_id }}</id>
    <url>{{ site.axyra_repo_url }}</url>
  </repository>
</repositories>
<dependencies>
  <dependency>
    <groupId>io.keikai</groupId>
    <artifactId>axyra-sheets</artifactId>
    <version>{{ site.axyra_version }}</version>
  </dependency>
</dependencies>
```

Target Java 17 or later. The download's POM includes compiler and execution plugins. [Gradle and supported platforms]({{ site.axyra_devref }}/Installation).

</details>

## Recorded AI export: describe, generate, verify
{: #ai}

This new Codex run used the Axyra Agent Skill and the existing project to turn a short report request into an export. The prompt supplied input records, not the expected total.

**Describe the report:**

```text
Use Axyra Sheets to export these orders to output/ai-sales-simple.xlsx:
(00042, Laptop, 1250), (00043, Mouse, 80). Keep IDs as text, format amounts
to two decimals, add bold headers and a SUM total. Build and run it,
then reopen and check the workbook.
```

**Generated Java:** `SimpleSkillWriter.java` derives the total row from the data. This is an excerpt:

```java
int totalRow = sales.size() + 1;
sheet.cell(totalRow, 0).setValue(CellValue.text("Total"));
if (sales.isEmpty()) sheet.cell(totalRow, 2).setValue(CellValue.number(0));
else sheet.cell(totalRow, 2).setFormula("SUM(C2:C" + totalRow + ")");
```

**Verified result:** `output/ai-sales-simple.xlsx` contains two order rows, text IDs, numeric amounts, bold headers, and a stored SUM formula. Reopening the workbook gave a displayed total of **1,330.00**.

<details markdown="1">
<summary>Reproduce this run: full context, source, and expected/actual results</summary>

The displayed prompt is the exact prompt for this new run. Codex had the installed skill, existing project and earlier examples in context; this was not a blind or timed trial. The project supplied Java 17 and Axyra Sheets `1.0.0-Beta-Eval`.

The ZIP includes `ai-session-simple/write-prompt.txt`, `CONTEXT.txt`, complete generated source, the saved workbook, raw stdout/stderr, and a manifest with commands, exit codes, and file hashes. Reproduce both examples and their checks with:

```shell
mvn -q compile exec:java -Dexec.mainClass=SimpleSkillReader
mvn -q exec:java -Dexec.mainClass=SimpleSkillWriter
mvn -q exec:java -Dexec.mainClass=VerifySimpleSkill
```

The verifier calculated its expected total from the input records, then compared it with the read and saved workbook values. Its recorded output was:

```text
Reader total: expected 1330.00; actual 1330.00
Saved total: expected 1330.00; actual 1330.00
Stored formula: SUM(C2:C3); displayed total: 1,330.00
PASS: text IDs, Java records, numeric amounts, bold headers, and formats
```

`ai-session-simple/expected-actual.json` retains the detailed comparisons. The earlier long-prompt run remains unchanged under `ai-session/`.

</details>

For your own report, [install the Axyra Sheets skill]({{ site.axyra_devref }}/AI_Assisted_Development) in a supported assistant. It guides development and is not a runtime dependency; compile and inspect each adaptation.

## Adjust row counts, formats, and formulas

**More or fewer records.** The first complete program is a fixed two-row fixture. For variable-length input, derive the total row from list size and extend its number-format range. The generated `SimpleSkillWriter.write(...)` implementation in the download does this and uses a numeric zero total for an empty list.

**Dates and financial amounts.** `importData` writes Java dates as Excel serials; apply a date format such as `yyyy-mm-dd` to display them as dates. Excel numeric cells use floating-point values, so define source precision and rounding rules for financial data.

**Calculated totals.** Store formula source with `setFormula("SUM(C2:C3)")`, without a leading `=`. Normal edits update dependent formulas; for manual calculation or untrusted input caches, recalculate before saving and verify the reopened result.

## Continue with a template, database, or JSON
{: #sources}

**Already have a designed report?** Keep its existing report layout, formulas, and formatting while Java fills the template's marked cells. Open a copy of the workbook instead of rebuilding the report in code. For a concrete example, [fill a Profit and Loss template from database totals]({{ site.axyra_guides }}/populate-excel-template-database-java): the template owns labels, formats, and profit formulas, while Java supplies the monthly values. For repeating detail rows, see [the template report guide]({{ site.axyra_guides }}/generate-excel-reports-java).

**Database or JSON input.** Map the source into records, then use the same bulk-writing path. The download includes `DatabaseSalesReport.java` and `WriteJsonSalesReport.java` for a four-column schema with dates. Their saved outputs were reopened to check date and amount formats. The JSON example registers Jackson's Java time module; the POM includes it. [Full database export walkthrough]({{ site.axyra_guides }}/export-database-to-excel-java).

**A large forward-only export.** Consider [StreamWorkbook]({{ site.axyra_devref }}/Streaming) when you should not hold all records in a list. It does not calculate formulas or edit an existing workbook. Maps, numeric matrices, and explicit typed blocks are covered in the download's advanced notes and the [cell and range reference]({{ site.axyra_devref }}/Cell_and_Range).

## Troubleshooting and FAQ

**Why do dates display as numbers?** Date imports need a date number format; apply it before saving. The dated examples in the download show the complete sequence.

**Why are columns missing or reordered?** Set `.columns(...)` explicitly. Property names are strings and are checked at runtime; adding a field should not silently change your export schema.

**Need to read or update the output?** [The paired reading guide]({{ site.axyra_guides }}/read-excel-file-java) opens the same sales workbook, changes an amount, and verifies the new total after saving.
