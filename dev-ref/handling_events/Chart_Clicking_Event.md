---
title: 'Chart Clicking Event'
---

# Overview

There are 3 events related to chart clicking:

## onChartClick

This event is fired when a user left-clicks on a chart. When a corresponding event listener is invoked, a `io.keikai.ui.event.ChartMouseEvent` object is passed as an argument.

## onChartDoubleClick

This event is fired when a user double-clicks on a chart. When a corresponding event listener is invoked, a `io.keikai.ui.event.ChartMouseEvent` object is passed as an argument.

## onChartRightClick

This event is fired when a user right-clicks on a chart. When a corresponding event listener is invoked, a `io.keikai.ui.event.ChartMouseEvent` object is passed as an argument.

# Event Monitor Example

{% highlight java linenos %}
public class EventsComposer extends SelectorComposer<Component>{
    //omitted codes...

    @Listen("onChartClick = #ss")
    public void onChartClick(ChartMouseEvent event){
        StringBuilder info = new StringBuilder();
        info.append("clicked " + event.getChartName());
        
        //show event information...
    }

    @Listen("onChartRightClick = #ss")
    public void onChartRightClick(ChartMouseEvent event){
        StringBuilder info = new StringBuilder();
        info.append("right clicked " + event.getChartName());
        
        //show event information...
    }

    @Listen("onChartDoubleClick = #ss")
    public void onChartDoubleClick(ChartMouseEvent event){
        StringBuilder info = new StringBuilder();
        info.append("double clicked " + event.getChartName());
        
        //show event information...
    }
}
{% endhighlight %}

  - Line 4,10,16: Apply `@Listen` to listen to an event with the syntax
    `[EVENT NAME] = [COMPONENT SELECTOR]`. All event names can be found
    in `io.keikai.ui.event.Events`.
    The "\#ss" is the component selector which refers to the component with
    id `ss` on the ZUL page. (SelectorComposer supports various selector
    syntax that let you select components easily. Please refer to [ZK
    Developer's Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Wire_Components)).
  - Line 7,13,19: `getChartName()` returns the name of the chart that was clicked.