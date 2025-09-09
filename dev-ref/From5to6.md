---
title: 'From 5 to 6'
---

This document provides information on upgrading from version 5 to version 6.

# Upgrade JAR

```xml
		<dependency>
			<groupId>io.keikai</groupId>
			<artifactId>keikai-ex</artifactId>
			<version>6.0.0</version>
		</dependency>
```

# Incompatible Changes
## Based on ZK 10
When including Keikai 6.0.0, you need to use ZK 10.0.0 or later. To upgrade to ZK 10, please see ["Important Upgrade Note"](https://www.zkoss.org/wiki/Small_Talks/2024/February/New_Features_of_ZK_10.0.0#Important_Upgrade_Notes).

## Adopt Apache POI
From 6.0.0, Keikai POI now bases on [Apache POI 5](https://poi.apache.org/).

### Change package from `org.zkoss.poi` to `org.apache.poi`
or most methods, simply updating the import statements to the new package should suffice. However, for certain methods, adjustments to their usage are necessary

### org.apache.poi.ss.formula.SheetRangeEvaluator
Before:
`SheetRangeEvaluator.getEvalForCell(int rowIndex, int columnIndex)`

After:
`SheetRangeEvaluator.getEvalForCell(int sheetIndex, int rowIndex, int columnIndex)`

**Example Usage**

Before:
```java
public class MyCell implements FreeRefFunction {
    @Override
    public ValueEval evaluate(ValueEval[] valueEvals, OperationEvaluationContext context) {
        ValueEval evalCell = context.getRefEvaluatorForCurrentSheet()
                .getEvalForCell(context.getRowIndex(), context.getColumnIndex());
```

After:
```java
public class MyCell implements FreeRefFunction {
    @Override
    public ValueEval evaluate(ValueEval[] valueEvals, OperationEvaluationContext context) {
        ValueEval evalCell = context.getRefEvaluatorForCurrentSheet()
                .getEvalForCell(context.getSheetIndex(), context.getRowIndex(), context.getColumnIndex());
```

### org.apache.poi.ss.formula.eval.RefEval

Before:
`RefEval.getInnerValueEval()`

After:
`RefEval.getInnerValueEval(int sheetIndex)`

# JDK 11
The binary-compatible level is Java 11. Please make sure to use Java 11/Jakarta 11 or a higher version.

For details, see [release note](https://keikai.io/releasenotes).

# Current Known Issues:
[See them in our tracker](https://tracker.zkoss.org/issues/?jql=project%20%3D%20KEIKAI%20AND%20issuetype%20%3D%20Bug%20AND%20status%20%3D%20Open%20AND%20affectedVersion%20%3D%206.0.0%20ORDER%20BY%20priority%20DESC%2C%20updated%20DESC)

You can find a workaround (if available) in the attached file of each bug page .

