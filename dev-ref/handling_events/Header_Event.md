---
title: 'Header Event'
---

# Overview

There are 4 events related to a header:

## onHeaderClick

This event is fired when a user left-clicks on Spreadsheet's header.
When a corresponding event listener is invoked, a `io.keikai.ui.event.HeaderMouseEvent` object is passed as an argument.

## onHeaderDoubleClick

This event is fired when a user double-clicks on Spreadsheet header.
When a corresponding event listener is invoked, a `io.keikai.ui.event.HeaderMouseEvent` object is passed as an argument.

## onHeaderRightClick

This event is fired when a user right-clicks on Spreadsheet header. When
a corresponding event listener is invoked, a `io.keikai.ui.event.HeaderMouseEvent` object is passed as an argument.

## onHeaderUpdate

This event is fired when a user resizes a row (or column) header. When a
corresponding event listener is invoked, a `io.keikai.ui.event.HeaderUpdateEvent` object is passed as an argument.

# Popup Menu Example

Look at the screenshots below, we can show different custom popup menus
when a users click a column or row header.

![]({{site.devref_image_folder}}/events-columnMenu.png)

![]({{site.devref_image_folder}}/events-rowMenu.png)

To popup our custom menu, we should disable built-in context menu (by `showContextMenu="false"` or un-specified) first and listen to
onHeaderRightClick event.

{% highlight java linenos %}
    <window title="Keikai Mouse Events" border="normal" width="100%"
        height="100%" apply="io.keikai.essential.events.MouseEventsComposer">
        <spreadsheet width="600px" height="300px" 
            maxVisibleRows="100" maxVisibleColumns="40" 
        showFormulabar="true" showToolbar="true" src="/WEB-INF/books/blank.xlsx" >
        </spreadsheet>

        <menupopup id="topHeaderMenu">
            <menuitem id="insertLeftMenu" label="Insert Left" />
            <menuitem id="insertRightMenu" label="Insert Right" />
            <menuitem id="deleteColumnMenu" label="Delete" />
        </menupopup>
        <menupopup id="leftHeaderMenu">
            <menuitem id="insertAboveMenu" label="Insert Above" />
            <menuitem id="insertBelowMenu" label="Insert Below" />
            <menuitem id="deleteRowMenu" label="Delete" />
        </menupopup>
    </window>
{% endhighlight %}

  - Line 3, 4: Do not specify `showContextMenu` to disable built-in
    context menu.
  - Line 8, 13: Create custom popup menus.



{% highlight java linenos %}
public class MouseEventsComposer extends SelectorComposer<Component> {

    @Wire
    private Menupopup topHeaderMenu;
    @Wire
    private Menupopup leftHeaderMenu;
    
    @Listen("onHeaderRightClick = #ss")
    public void onHeaderRightClick(HeaderMouseEvent event) {
        
        switch(event.getType()){
        case COLUMN:
            topHeaderMenu.open(event.getClientx(),  event.getClienty());
            break;
        case ROW:
            leftHeaderMenu.open(event.getClientx(),  event.getClienty());
            break;
        }
    }
}
{% endhighlight %}

  - Line 8: Annotate event listener to list onHeaderRightClick event.
  - Line 11: The `getType()` returns an enumeration `io.keikai.ui.event.HeaderType` that can tell you which header is clicked.
  - Line 13, 16: Show up custom menus at the position where a user right-clicks.
