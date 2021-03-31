---
title: 'Disable Functions'
toc: false
---

Spreadsheet provides API to disable its functions. The API can be very
useful when you implement your user permission features. In the example
application below, since we disable all sheet related functions except
one, you can see the corresponding menu items are disabled (in grey
color). 

![center]({{site.devref_image_folder}}/Zss-essentials-disableFunctions.png)

To achieve this, simply call `io.keikai.ui.Spreadsheet.disableUserAction()`

{% highlight java linenos %}
package io.keikai.essential.advanced.customization;

import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.event.CheckEvent;
import org.zkoss.zk.ui.select.SelectorComposer;
import org.zkoss.zk.ui.select.annotation.*;
import io.keikai.ui.*;

/**
 * This class demonstrates how to disable functions.
 * @author Hawk
 *
 */
@SuppressWarnings("serial")
public class DisableFunctionsComposer extends SelectorComposer<Component> {

    @Wire
    private Spreadsheet ss;
    
    @Listen("onCheck = #add")
    public void disableAdd(CheckEvent event) {
        ss.disableUserAction(AuxAction.ADD_SHEET, !event.isChecked());
    }
...
}
{% endhighlight %}

Except sheet operations, you can also disable functions on the toolbar
and the context menu. Check the constants in
[`io.keikai.ui.AuxAction`](https://keikai.io/javadoc/latest/io/keikai/ui/AuxAction.html) for a complete list of functions you can disable.
