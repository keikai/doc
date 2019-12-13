---
title: 'Hyperlink Event'
---
# Overview

Keikai spreadsheet supports one hyperlink event.

## onCellHyperlink

This event is fired when a user clicks a hyperlink in a cell. The browser
will open the specified hyperlink and send the event to a server. When a
corresponding event listener is invoked, a `io.keikai.ui.event.CellHyperlinkEvent`
object is passed as an argument.

# Event Monitor Example

Here's the screenshot of the [Event Monitor](Cell_Clicking_Event#event-monitor-example) application when we click the link <http://www.zkoss.org> in A7. 

![center](/assets/images/dev-ref/Zss-essentials-events-hyperlink.png)

{% highlight java linenos %}
public class EventsComposer extends SelectorComposer<Component>{
    //omitted codes...

    @Listen("onCellHyperlink = #ss")
    public void onCellHyperlink(CellHyperlinkEvent event){
        StringBuilder info = new StringBuilder();
        
        info.append("Hyperlink ").append(event.getType())
            .append(" on : ")
            .append(Ranges.getCellRefString(event.getRow(),event.getColumn()))
            .append(", address : ").append(event.getAddress());
        
        //show info...
    }       

}
{% endhighlight %}

  - Line 11: We can get the clicked hyperlink address.
