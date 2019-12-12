---
title: 'Handling Events'
---
When a user interacts with Spreadsheet like clicking or editing it, these
actions trigger events and the events are send to the server. We can implement our
business logic in an event listener, a method in a controller, to listen to
events we are interested in. When the event we listen is triggered, the corresponding business logic is performed. This mechanism enables you to customize Spreadsheet to fulfill your business needs.

Keikai spreadsheet supports numerous events such as mouse events, key
events, selection events, editing events and hyperlink events. You can
listen to these events to apply customized functionality based on your business
requirement. For example by listening to editing events such as
onStartEditing and onStopEditing, you can control which cell an user can
edit, and what is entered/edited and possibly apply some styling or value
transformation once the editing is done. Similarly, you can also
listen to mouse events such as onCellClick or onCellRightClick to
update other ZK components or popup a menu.

In the following sections, we will demonstrate examples of listening events. These examples use `org.zkoss.zk.ui.select.SelectorComposer` which provides a quite simple way to listen to a event: just apply
`@Listen` on a method and specify the event names and target
components. (For complete explanation, please refer to [ZK Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Wire_Event_Listeners)).
In an event listener, you can access book model with Spreadsheet provided
API or use your service classes to implement business logic.

A typical sample of defining an event listener is like:

{% highlight java linenos %}
public class EventsComposer extends SelectorComposer<Component>{
    //other codes...

    @Listen("onCellFocus= #ss")
    public void myEventListener(CellEvent event){
        //access book model or perform your business logic
    }
}
{% endhighlight %}

  - Line 4: In `@Listen`, "onCellFocus" is the event name we want to
    listen (All event name can be found in `io.keikai.ui.event.Events`)
    and "\#ss" is the component selector. (`SelectorComposer` supports
    various selector syntax that let you select components easily.
    Please refer to [ZK Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Wire_Components)).
  - Line 5: The argument passed into an event listener depends on the
    event it listens to. You can get event-related data like row or column
    for further processing.

All Keikai events you can listen to are listed in `io.keikai.ui.event.Events`
