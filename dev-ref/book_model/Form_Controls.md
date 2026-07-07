---
title: 'Form Controls'
toc: false
---

{% include version-badge.html version='7.0.0' %}

# Purpose

Maintain form controls in imported and exported excel documents, and provide a way for the developer to programatically inspect the form controls in an imported spreadsheet in java code.

# Overview

Form controls are interactive form objects which can be inserted in an excel spreadsheet: check boxes, option (radio) buttons, drop-downs,
list boxes, scroll bars, spin buttons, etc.

Keikai projects the form controls found in an **imported** `.xlsx` file into its book model, and export them as-is when the model is exported back to an `.xlsx` file. Form controls can be read, but cannot be created in Keikai model. Review [Current limitations](#current-limitations) for more information.

The controls may be linked to VBA macro behaviors in the original document. Keikai does not currently attempt to load this code. You can obtain the attributes of the form objects, such as their position, size, anchor cell, etc. but any behavior associated with them must be created in java-side if you want to match them in your embedded Keikai spreadsheet.

```
  XLSX file                 Keikai book model                Your code
+-----------+   import    +---------------------+   read   +-----------+
| <control> | ----------> | SSheet              | -------> | SFormCtrl |
|  parts    |             |  .getFormControls() |          |  getType  |
| (VML/DrawingML)         |   -> List<SFormControl>        |  getName  |
+-----------+             +---------------------+          |  linked.. |
                                                           +-----------+
```

This data is available in the **model** layer (`io.keikai.model`), not the public `io.keikai.api` layer. To reach it, you need to go through the `Sheet.getInternalSheet()` to access the internal data (or through an `SBook` you imported directly).

# The `SFormControl` model API

Every control is an [`io.keikai.model.SFormControl`](https://keikai.io/javadoc/latest/io/keikai/model/SFormControl.html).
The interface exposes the properties shared by all control types:

{% highlight java linenos %}
public interface SFormControl {

    enum ControlType {
        CHECK_BOX, RADIO_BUTTON, BUTTON, COMBO_BOX, LIST_BOX,
        SCROLL_BAR, SPIN_BUTTON, TEXT_BOX, LABEL, GROUP_BOX
    }

    ControlType getType();          // which kind of control this is
    String      getName();          // e.g. "Check Box 1"
    ViewAnchor  getAnchor();        // where it sits on the sheet

    String getLinkedCell();         // e.g. "$A$1" (value binding), or null
    void   setLinkedCell(String ref);

    String getListFillRange();      // e.g. "$B$1:$B$10" (combo/list source), or null
    void   setListFillRange(String ref);

    boolean isEnabled();            // interactable?
    boolean isVisible();            // shown?
}
{% endhighlight %}

- **`getLinkedCell()` / `setLinkedCell()`** — the cell reference bound to
  the control's value. In Excel these bindings drive the cell (a check box
  writes `TRUE`/`FALSE`, a combo or list box the 1-based index of the
  selection, a scroll bar or spin button its numeric value). Keikai only
  stores the reference string — it does not itself compute or write that
  value into the cell; keeping the linked cell in sync is your
  application's responsibility.
- **`getListFillRange()` / `setListFillRange()`** — the range that
  supplies the items for a combo box or list box. It is `null` for
  controls that have no item list (check box, button, etc.).
- **`getAnchor()`** returns a
  [`ViewAnchor`](https://keikai.io/javadoc/latest/io/keikai/model/ViewAnchor.html);
  use `getRowIndex()` / `getColumnIndex()` for the top-left cell and
  `getWidth()` / `getHeight()` for the pixel size.

The `isEnabled()` / `isVisible()` flags are read-only on the interface.
The current import projection does not populate them, so both always
return `true` regardless of the control's state in the source file.

## Control types and their type-specific state

`getType()` tells you the type of control. The properties on
`SFormControl` cover what is common; the *state* that is unique to a
control type lives on the concrete implementation class in
`io.keikai.model.impl`. Cast to the matching class to read it:

| `ControlType` | Implementation class    | Type-specific accessors |
|---------------|-------------------------|-------------------------|
| `CHECK_BOX`   | `CheckBoxControlImpl`   | `isChecked()` / `setChecked(boolean)` |
| `RADIO_BUTTON`| `RadioButtonControlImpl`| `isSelected()`, `getGroupName()` |
| `COMBO_BOX`   | `ComboBoxControlImpl`   | `getSelectedIndex()`, `getDropLines()` (default 8) |
| `LIST_BOX`    | `ListBoxControlImpl`    | `getSelectedIndices()`, `isMultiSelect()` |
| `SCROLL_BAR`  | `ScrollBarControlImpl`  | `getValue()`, `getMin()`/`getMax()` (default 0..30000), `getIncrement()`, `getPageIncrement()` |
| `SPIN_BUTTON` | `SpinButtonControlImpl` | `getValue()`, `getMin()`/`getMax()` (default 0..30000), `getIncrement()` |
| `BUTTON`      | `ButtonControlImpl`     | `getCaption()`, `getMacro()` &mdash; not populated on import<sup>1</sup> |
| `TEXT_BOX`    | `TextBoxControlImpl`    | `getText()` &mdash; not populated on import<sup>1</sup> |
| `LABEL`       | `LabelControlImpl`      | `getText()` &mdash; not populated on import<sup>1</sup> |
| `GROUP_BOX`   | `GroupBoxControlImpl`   | `getCaption()` &mdash; not populated on import<sup>1</sup> |

<sup>1</sup> These accessors exist on the implementation class, but the
import projection does not currently fill them, so they return their
defaults (empty / `null`). They are settable in-memory but, like all
control mutations, are not written back on export.

# Reading imported controls

Import a workbook (or take the `SBook` behind a live `Spreadsheet`), then
query the ssheet for its controls:

{% highlight java linenos %}
// The model returns an *unmodifiable* list; empty if the sheet has none.
public List<SFormControl> getFormControls();   // io.keikai.model.SSheet
{% endhighlight %}

{% highlight java linenos %}
SBook book = SImporters.getImporter("excel").imports(inputStream, "orders");
SSheet sheet = book.getSheet(0);

for (SFormControl fc : sheet.getFormControls()) {
    System.out.println(fc.getName() + " -> " + fc.getLinkedCell());

    switch (fc.getType()) {
        case CHECK_BOX:
            boolean on = ((CheckBoxControlImpl) fc).isChecked();
            break;
        case COMBO_BOX:
            // e.g. list items come from getListFillRange(), selection index here
            int idx = ((ComboBoxControlImpl) fc).getSelectedIndex();
            break;
        case LIST_BOX:
            ListBoxControlImpl lb = (ListBoxControlImpl) fc;
            int[] picks = lb.getSelectedIndices();
            boolean multi = lb.isMultiSelect();
            break;
        case SCROLL_BAR:
            int value = ((ScrollBarControlImpl) fc).getValue();
            break;
        default:
            // BUTTON, LABEL, GROUP_BOX, TEXT_BOX, RADIO_BUTTON, SPIN_BUTTON ...
    }
}
{% endhighlight %}

From inside a ZK page, obtain the model sheet through the API bridge:

{% highlight java linenos %}
Sheet apiSheet = spreadsheet.getSelectedSheet();          // io.keikai.api.model.Sheet
List<SFormControl> controls =
        apiSheet.getInternalSheet().getFormControls();    // io.keikai.model.SSheet
{% endhighlight %}

# Mutating linked cells and state

The imported control objects are mutable, but the controls collection is not. You can change state for the imported controls once queried from the sheet, but you cannot save these changes for exporting. See limitations below.

# Current limitations

Form-control support is **read-oriented**.

- **New controls cannot be created.** There is no API to add a new form control
  to a sheet. `getFormControls()` returns an *unmodifiable* list, so you
  cannot add or remove entries — you can only read the controls that came
  from the imported file and mutate the objects already in the list.
- **Mutations are not exported.** On export, Keikai preserves the
  *original* control parts from the imported file rather than
  re-emitting them from the model list. Changes made through
  `setLinkedCell`, `setChecked`, `setValue`, etc. are visible to your
  running Java code but are **not** written back to the produced `.xlsx`.
  Imported controls do survive an export → re-import round-trip unchanged.
- **Model layer only.** Controls are surfaced through `io.keikai.model`
  (`SSheet` / `SFormControl`); there is no `io.keikai.api` wrapper and no
  live client-side interaction rendering for them yet.
