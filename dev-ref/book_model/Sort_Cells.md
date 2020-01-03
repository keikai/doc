---
title: 'Sort Cells'
toc: false
---


Sorting a range of cell data is a commonly-used feature. To sort cells
with `Range` is quite easy like:

{% highlight java linenos %}
//true for descending order, false for ascending
range.sort(true);

//use CellOperationUtil, it checks sheet protection before sorting
CellOperationUtil.sort(range, true);
{% endhighlight %}

When sorting a range of texts and numbers In ascending order, numbers
will be arranged before text.

A range of cells before sorting:

![]({{site.devref_image_folder}}/Zss-essentials-sortBefore.png)

A range of cells after sorting in ascending order:

![]({{site.devref_image_folder}}/Zss-essentials-sortAfter.png)
