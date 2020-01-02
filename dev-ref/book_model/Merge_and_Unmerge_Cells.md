---
title: 'Merge and Unmerge Cells'
toc: false
---


We can use `Range` API to merge (or unmerge) a range of cells and detect
merged cells existed in a given range:

{% highlight java linenos %}
//true for merging horizontally, false is to merge all together
range.merge(false);

range.unmerge();

//returns true if any merged cell is inside this range
boolean hasMergedCell = range.hasMergedCell();
//returns true if entire range is a merged cell.
boolean isMergedCell = range.isMergedCell();

CellRegion region = range.getMergedRegion();
{% endhighlight %}

We still can use
`io.keikai.api.CellOperationUtil`
to achieve this and it provides 3 APIs for 4 actions corresponding to
merge function of Spreadsheet's toolbar including "Merge & Center",
"Merge Across", "Merge Cells", and "Unmerge". Each method requires a
`io.keikai.api.Range` to represent the target cells you are going to merge. 
The usages are showed as follows:

**API usage about merging**

{% highlight java linenos %}

public class MergeComposer extends SelectorComposer<Component> {

    @Wire
    private Spreadsheet ss;

    @Listen("onClick = #mergeCenterButton")
    public void mergeCenter() {
        CellOperationUtil.toggleMergeCenter(getSelectedRange());
    }
    
    @Listen("onClick = #mergeAcrossButton")
    public void mergeAcross() {
        CellOperationUtil.merge(getSelectedRange(), true);
    }
    
    @Listen("onClick = #mergeButton")
    public void merge() {
        CellOperationUtil.merge(getSelectedRange(), false);
    }
    
    @Listen("onClick = #unmergeButton")
    public void unmerge() {
        CellOperationUtil.unmerge(getSelectedRange());
    }
    
    private Range getSelectedRange(){
        return Ranges.range(ss.getSelectedSheet(), ss.getSelection());
    }

    //omitted codes...
}
{% endhighlight %}
