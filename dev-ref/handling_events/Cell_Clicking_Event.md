---
title: 'Cell Clicking Event'
---

# Overview

There are 3 events related to cell clicking:

## onCellClick

This event is fired when a user left-clicks on a cell. When a
corresponding event listener is invoked, a `io.keikai.ui.event.CellMouseEvent` object is passed as an argument.

## onCellDoubleClick

This event is fired when a user double-clicks on a cell. When a
corresponding event listener is invoked, a `io.keikai.ui.event.CellMouseEvent` object is passed as an argument.

## onCellRightClick

This event is fired when a user right-clicks on a cell. When a
corresponding event listener is invoked, a `io.keikai.ui.event.CellMouseEvent` object is passed as an argument.

# Event Monitor Example

{% highlight java linenos %}
public class EventsComposer extends SelectorComposer<Component>{
    //omitted codes...

    @Listen("onCellClick = #ss")
    public void onCellClick(CellMouseEvent event){
        StringBuilder info = new StringBuilder();
        info.append("Click on cell ")
        .append(Ranges.getCellRefString(event.getRow(),event.getColumn()));
        
        //show event information...
    }
    @Listen("onCellRightClick = #ss")
    public void onCellRightClick(CellMouseEvent event){
        //show event information...
    }
    @Listen("onCellDoubleClick = #ss")
    public void onCellDoubleClick(CellMouseEvent event){
        //show event information...
    }
    
}
    
{% endhighlight %}

  - Line 4,12,16: Apply `@Listen` to listen to an event with the syntax
    `[EVENT NAME] = [COMPONENT SELECTOR]`. All event name can be found
    in `io.keikai.ui.event.Events`.
    The "\#ss" is the component selector which refers to the component with
    id `ss` on the ZUL page. (SelectorComposer supports various selector
    syntax that let you select components easily. Please refer to [ZK
    Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Wire_Components)).
  - Line 8: The `getRow()` returns 0-based row index of the cell which
    is under editing and `getColumn()` returns its column index. The cell A1's
    row and column index are both 0. `Ranges.getCellRefString()` is a
    utility method which converts row and column index into a cell
    reference like A1.
