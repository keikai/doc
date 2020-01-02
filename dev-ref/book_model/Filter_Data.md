---
title: 'Filter Data'
toc: false
---

Filter is a useful feature especially when you want to focus on a subset
of data. It can filter out of those data you don't want displaying
without removing them. Spreadsheet allows you to enable/disable filter
and apply/reset criteria via API. You can use both
`io.keikai.api.Range` or `io.keikai.api.SheetOperationUtil`
to achieve these functions, but `SheetOperationUtil` checks sheet
protection for you.

We'll use a simple application to demonstrate filter API. Its screenshot
is as below:

![](/assets/images/dev-ref/Zss-essentials-filter-example.png)

In this application, we can toggle, clear, and reapply filters and filter data 
by "Type" column through those buttons on the right hand side.

Here is the source code to implement it:

{% highlight java linenos %}
public class AutoFilterComposer extends SelectorComposer<Component> {

    @Wire
    private Spreadsheet ss;

    @Wire
    private Combobox typeBox;
    
    @Listen("onClick = button[label='Toogle Filter']")
    public void toggle() {
        Range selection = Ranges.range(ss.getSelectedSheet(), ss.getSelection());
        Range filteringRange = selection.findAutoFilterRange();
        if(!selection.isAutoFilterEnabled() &&  filteringRange == null) { 
            Messagebox.show("nothing to filter");
            return;
        }
        
        selection.enableAutoFilter(!selection.isAutoFilterEnabled());
        
//      SheetOperationUtil.toggleAutoFilter(selection);
    }
    
    @Listen("onClick = button[label='Clear Filter']")
    public void clear() {
        Range sheetRange = Ranges.range(ss.getSelectedSheet());
        sheetRange.resetAutoFilter();
        
//      SheetOperationUtil.resetAutoFilter(selection);
    }
    
    @Listen("onClick = button[label='Reapply Filter']")
    public void reapply() {
        Range sheetRange = Ranges.range(ss.getSelectedSheet());
        sheetRange.applyAutoFilter();
        
//      SheetOperationUtil.applyAutoFilter(selection);
    }
    
    @Listen("onClick = button[label='Apply']")
    public void apply() {
        Range sheetRange = Ranges.range(ss.getSelectedSheet());
        if (sheetRange.isAutoFilterEnabled()){
            String[] criteria = {typeBox.getValue()};
            sheetRange.enableAutoFilter(1, AutoFilterOperation.VALUES, criteria, null,
                    true);
        }
    }
}
{% endhighlight %}

  - Line 12: The method `findAutoFilterRange()` will return a non-blank
    area based on your selection if Spreadsheet can find it. We should
    use it to ensure not to enable filter if there is no data.
  - Line 13: Use `isAutoFilterEnabled()` to get enabled status of the
    auto filter.
  - Line 18: Enable auto filter with `enableAutoFilter(true)` or disable
    it with `enableAutoFilter(false)`.
  - LIne 20: You can also enable / disable auto filter with
    `SheetOperationUtil.toggleAutoFilter()`.
  - Line 26, 28: The method `resetAutoFilter()` clears applied criteria
    and all data will be shown and
    `SheetOperationUtil.resetAutoFilter()` has the same function.
  - Line 34, 36: The method `applyAutoFilter()` will re-apply current
    criteria to modified or newly added data.
  - Line 43: The argument for criteria is a String array, and you can
    have multiple values in it, e.g. `{"Beverages", "Meat", "Tools"}`
  - Line 44: Apply criteria on "Type" column which is the first column,
    so the first argument is `1`. The second argument is the filter
    operation the filter performs, and we currently only support
    filtering values. The fourth argument determines drop-down arrow's
    visibility which is usually `true`.
