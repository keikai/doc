---
title: 'Editing Event'
---

The following are events related to editing cells:

# onStartEditing

This event is fired only once at the time when a user presses the
first key to start editing. When the corresponding event listener is
invoked, a [`io.keikai.ui.event.StartEditingEvent`](https://keikai.io/javadoc/latest/io/keikai/ui/event/StartEditingEvent.html) object is passed as an argument. This event allows you to cancel the
edit action or change edit value.

# onEditboxEditing

This event is fired when a user is editing a cell and it is similar to
ZK Textbox component's onChanging event. When the corresponding event
listener is invoked, a `io.keikai.ui.event.EditboxEditingEvent` object is passed as an argument.

# onStopEditing

This event is fired when a user has finished editing a cell. It is
identified by the user hitting the enter key or clicking outside of the
editing cell. When the corresponding event listener is invoked, a [`io.keikai.ui.event.StopEditingEvent`](https://keikai.io/javadoc/latest/io/keikai/ui/event/StopEditingEvent.html) object is passed as an argument. This event allows you to cancel the edit action or change edit value.


# onClipboardPaste
This event is fired when a user paste cells by pressing `ctrl+v` or paste toolbar button. Keikai will invoke the event listener with [`io.keikai.ui.event.ClipboardPasteEvent`](https://keikai.io/javadoc/latest/io/keikai/ui/event/ClipboardPasteEvent.html) as an argument.

```java
@Listen(Events.ON_CLIPBOARD_PASTE + " = #ss")
public void onClipboardPaste(ClipboardPasteEvent event) {
    if(isShowEventInfo(event.getName())){
      StringBuilder info = new StringBuilder();
      info.append("pasted from " + ss.getHighlight());
      info.append(" to " + event.getArea());
      addInfo(info.toString());
    }
}
```


# onAfterCellChange [(Events.ON_AFTER_CELL_CHANGE)](https://keikai.io/javadoc/latest/io/keikai/ui/event/Events.html#ON_AFTER_CELL_CHANGE)

This event is fired when you change the content or styles of one or more cells directly or indirectly. Therefore, it is triggered by user editing or calling `Range` API. If you edit a cell, this event is fired after `onStopEditing` event. When the corresponding event listener is invoked, a `io.keikai.ui.event.CellAreaEvent` object is passed as an argument. This event only tells you which range of cells are changed but it won't tell you whether it was the value or the style that has been changed.

## Never-ending pitfall
Since calling `Range` API will fire this event so don't call `Range` setter API in this event listener. Or it will produce a never-ending event handling loop.

## Delete key
Pressing "delete" key only fires [KeyEvent](Key_Event) and [onAfterCellChange](#onaftercellchange-eventson_after_cell_change).



# onAfterUndoableManagerAction [(Events.ON_AFTER_UNDOABLE_MANAGER_ACTION)](https://keikai.io/javadoc/latest/io/keikai/ui/event/Events.html#ON_AFTER_UNDOABLE_MANAGER_ACTION)
It's fired when a user does an action that can be undone including all editing action like editing a cell, or inserting a row. Keikai will pass a[UndoableActionManagerEvent](https://keikai.io/javadoc/latest/io/keikai/ui/event/UndoableActionManagerEvent.html) to an event listener. Please see the subclasses of [AbstractUndoableAction](https://keikai.io/javadoc/latest/io/keikai/ui/impl/undo/AbstractUndoableAction.html) for the complete list.

You can listen to this event to produce audit trail.


# Event Monitor Example

We still use the previous "Event Monitor" application to demonstrate event
listening.

![]({{site.devref_image_folder}}/Zss-essentials-events-filter.png)

When we type the word "test" in A1 cell, the information of corresponding events sent to the server are displayed in the panel:

1.  Start editing A1...
      -   
        When we press "t", the onStartEditing event is sent. However,
        the typing value is still not saved in Spreadsheet's data model,
        so the editing value is empty. The client value is "t" which is
        the same as what we just typed.
2.  Editing A1...
      -   
        There are 4 lines started with "Editing A1". Each time we press
        a key to edit, `onEditboxEditing` event is sent and the first
        `onEditboxEditing` is sent just right after onStartEditing.
3.  Stop editing A1...
      -   
        The `onStopEditing` event is sent when we press the enter key, and
        you can see editing value is now the same as A1's text.

Next, we show you how to listen to these events and print out messages with
related data in a controller.

{% highlight java linenos %}
public class EventsComposer extends SelectorComposer<Component>{
    //omitted codes...

    @Listen("onStartEditing = #ss")
    public void onStartEditing(StartEditingEvent event){
        StringBuilder info = new StringBuilder();
        String ref = Ranges.getCellRefString(event.getRow(),event.getColumn());
        info.append("Start editing ").append(ref)
        .append(", editing-value is ").append("\""+event.getEditingValue()+"\"")
        .append(" client-value is ").append("\""+event.getClientValue()+"\"");
        
        //...
    }

    @Listen("onEditboxEditing = #ss")
    public void onEditboxEditing(EditboxEditingEvent event){
        StringBuilder info = new StringBuilder();
        String ref = Ranges.getCellRefString(event.getRow(),event.getColumn());
        info.append("Editing ").append(ref)
        .append(", value is ").append("\""+event.getEditingValue()+"\"");
        
        //...
    }   
    
    @Listen("onStopEditing = #ss")
    public void onStopEditing(StopEditingEvent event){
        StringBuilder info = new StringBuilder();
        String ref = Ranges.getCellRefString(event.getRow(),event.getColumn());
        info.append("Stop editing ").append(ref)
        .append(", editing-value is ").append("\""+event.getEditingValue()+"\"");
        
        //...
    }
{% endhighlight %}

- Line 4,15,25: Apply `@Listen` to listen an event with the syntax
    `[EVENT NAME] = [COMPONENT SELECTOR]`. All event names can be found
    in `io.keikai.ui.event.Events`. The "\#ss" is the component selector which means the component with
    id "ss" on the ZUL page. (SelectorComposer supports various selector
    syntax that let you select components easily. Please refer to [ZK
    Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Wire_Components)).
- Line 7: The `getRow()` returns 0-based row index of the cell which
    is under editing and `getColumn()` returns its column index. The cell A1's
    row and column index are both 0. We have not introduced
    `io.keikai.api.Ranges` formally yet, but you can just treat it as a utility class that helps you to
    convert row and column index into a cell reference, e.g. A1.
- Line 9: The `getEditingValue()` returns the value stored in the server-side's data model.
- Line 10: The `getClientValue()` returns the value we typed in the
    browser which might be different from the editing value.

## Override Editing Value

In addition to displaying editing value, we can even override it. The
screenshot below demonstrates this case. In this case we set several special cells
that contain "Edit Me". After we enter a word "test" in D3, it turns to
be "test-Woo". You can see the value changed from the right hand side
panel.

![]({{site.devref_image_folder}}/Zss-essentials-events-override-value.png)

How was this done? Just listen to onStopEditing event and change the
editing value.

{% highlight java linenos %}

    @Listen("onStopEditing = #ss")
    public void onStopEditing(StopEditingEvent event){
        StringBuilder info = new StringBuilder();
        String ref = Ranges.getCellRefString(event.getRow(),event.getColumn());
        info.append("Stop editing ").append(ref)
        .append(", editing-value is ").append("\""+event.getEditingValue()+"\"");
        
        //...
        
        if(ref.equals("D3")){
            String newValue = event.getEditingValue()+"-Woo";
            //we change the editing value
            event.setEditingValue(newValue);
            addInfo("Editing value is changed to \""+newValue+"\"");
        }else if(ref.equals("E3")){
            //forbid editing
            event.cancel();
            addInfo("Editing E3 is canceled");
        }
    }
{% endhighlight %}

- Line 13: Override editing value with a new value.
- Line 17: The `cancel()` can cancel this editing, and nothing will be
    saved to the cell.

## onAfterCellChange Example

Let's get back to our event monitor example to see when the onAfterCellChange is sent. 

![]({{site.devref_image_folder}}/Zss-essentials-events-cellChange.png)

According to the screenshot above, when we enter "abc" in A11 or change the background color in A12:C13, cell changes event are sent. Let us see the source code about listening this event:

{% highlight java linenos %}
public class EventsComposer extends SelectorComposer<Component>{
    //omitted codes...
 
    @Listen("onAfterCellChange= #ss")
    public void onAfterCellChange(CellAreaEvent event){
        StringBuilder info = new StringBuilder();
        
        info.append("Cell changes on ")
        .append(Ranges.getAreaRefString(event.getSheet(), event.getArea()));
        info.append(", first value is \""
        +Ranges.range(event.getSheet(),event.getArea()).getCellFormatText()+"\"");
        
        //...
    }
{% endhighlight %}

- Line 4, 5: Specify onAfterCellChange in `@Listen` and apply it to a
  method. A `io.keikai.ui.event.CellAreaEvent` object is passed in when the method is invoked.
- Line 9: `getArea()` returns a `io.keikai.ui.Rect` object to
    indicate the area where the change event happens. We need to
    convert the object to a readable area reference like B2:B2 with a
    utility method of Ranges.
