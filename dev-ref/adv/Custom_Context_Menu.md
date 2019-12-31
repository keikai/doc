---
title: 'Custom Context Menu'
---

# Overview

This section describes how to pop up a new customized context menu in a
Spreadsheet like the image below:

![center](/assets/images/dev-ref/Zss-essentials-customContextMenu.png)

The steps are simple:

1.  Disable built-in context menu
2.  Create your own context menu
3.  Show custom context menu
4.  Add application logic for context menu

# Disable Built-in Context Menu

We should hide built-in context menu in order to show our customized one
only.

**Extracted from customContext.zul**

{% highlight java linenos %}
    <window apply="io.keikai.essential.advanced.customization.CustomContextMenuComposer"
        width="100%" height="100%">
        <spreadsheet id="ss" width="100%" height="100%" showFormulabar="true"
            showContextMenu="false" showToolbar="true" showSheetbar="true" maxVisibleRows="100"
            maxVisibleColumns="20" src="/WEB-INF/books/blank.xlsx" />
    <!-- other components -->
    </window>
{% endhighlight %}

  - Line 4: Specify `showContextMenu="false"` to hide built-in context
    menu.

# Create Your Own Context Menu

Menupopup is the most suitable component to build a context menu.

**Extracted from customContext.zul**

{% highlight java linenos %}
            <menupopup id="myContext">
                <menuitem id="display" label="Display Information" />
                <menuitem id="open" label="Open Dialog" />
            </menupopup>
{% endhighlight %}

# Show Custom Context Menu

We can listen
`io.keikai.ui.event.CellMouseEvent` to open our Menupopup.

{% highlight java linenos %}
package io.keikai.essential.advanced.customization;

import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.select.SelectorComposer;
import org.zkoss.zk.ui.select.annotation.*;
import io.keikai.ui.event.CellMouseEvent;
import org.zkoss.zul.Menupopup;

public class CustomContextMenuComposer extends SelectorComposer<Component> {

    @Wire
    private Menupopup myContext;

    @Listen("onCellRightClick = #ss")
    public void doContext(CellMouseEvent event) {
        myContext.open(event.getClientx(), event.getClienty());
        myContext.setAttribute("event", event);
    }
}
{% endhighlight %}

  - Line 17: We could set `CellMouseEvent` as a Menupopup's attribute,
    and it could be used as a context information when implementing
    application logic for custom context menu.

# Add Application Logic for Context Menu

You can implement the context menu's application logic in a separate
composer which makes a system in good modularity and clear separation of
responsibility.

{% highlight java linenos %}
        <div apply="io.keikai.essential.advanced.customization.MyContextMenuComposer">
            <menupopup id="myContext">
                <menuitem id="display" label="Display Information" />
                <menuitem id="open" label="Open Dialog" />
            </menupopup>
            <window id="dialog" title="My Dialog" mode="overlapped" closable="true"
                visible="false">
                Selection:
                <label id="content"></label>
            </window>
        </div>
{% endhighlight %}

The event listener displays the cell address of the cell a user right
clicks on.

{% highlight java linenos %}
package io.keikai.essential.advanced.customization;

import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.event.*;
import org.zkoss.zk.ui.select.SelectorComposer;
import org.zkoss.zk.ui.select.annotation.*;
import org.zkoss.zk.ui.util.Clients;
import io.keikai.ui.Spreadsheet;
import io.keikai.ui.event.CellMouseEvent;
import org.zkoss.zul.*;

/**
 * @author Hawk
 *
 */
@SuppressWarnings("serial")
public class MyContextMenuComposer extends SelectorComposer<Component> {

    @Wire
    private Menupopup myContext;
    @Wire
    private Window dialog;
    @Wire("#dialog #content")
    private Label content;

    @Listen("onClick = #display")
    public void display(MouseEvent event) {
        CellMouseEvent cellMouseEvent = (CellMouseEvent)myContext.getAttribute("event");
        String message = "Selection: " + ((Spreadsheet)cellMouseEvent.getTarget()).getSelection().asString();
        Clients.showNotification(message);
    }
{% endhighlight %}

  - Line 28: Get spreadsheet event from a component's attribute
    mentioned in previous section.

## Invoke Built-in Menu Items

Although we hide the built-in context menu, you might want to reuse some
items on it. The example code below demonstrates how to reuse "Clear"
menu ite by passing an `io.keikai.ui.event.AuxActionEvent`.

{% highlight java linenos %}
    @Listen("onClick = #clear")
    public void clear() throws Exception{
        CellMouseEvent cellMouseEvent = (CellMouseEvent)myContext.getAttribute("event");
        Spreadsheet ss = (Spreadsheet)cellMouseEvent.getTarget();
        AuxActionEvent event = new AuxActionEvent(Events.ON_AUX_ACTION, ss, ss.getSelectedSheet(), 
                AuxAction.CLEAR_ALL.toString(), ss.getSelection(), new HashMap());
        ((EventListener)ss.getUserActionManager()).onEvent(event);
    }
{% endhighlight %}

  - Line 5: Each menu item has a corresponding constant in
    <javadoc directory='zss'>io.keikai.ui.AuxAction</javadoc>. Pass
    the one you want to invoke.
