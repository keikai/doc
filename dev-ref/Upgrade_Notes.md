---
title: Upgrade Notes
---

# Upgrade to 6
Keikai 6 has several incompatible changes. Here, we list those noticeable changes that you need to do when upgrading from the previous versions:

## Depends on ZK 10
You have to upgrade the underlying ZK to 10, e.g. 10.0.0-Beta.

## Rely on Apache POI 5
Replace the package `org.zkoss.poi.*` with `org.apache.poi.*`
  (See [KEIKAI-684](https://tracker.zkoss.org/browse/KEIKAI-684), [KEIKAI-670](https://tracker.zkoss.org/browse/KEIKAI-670))

## Other API Changes
* replace `io.keikaiex.ui.dialog.Formulas.getFormulaInfos()` with `io.keikaiex.ui.dialog.Formulas.getFormulaInfosByCategory()`