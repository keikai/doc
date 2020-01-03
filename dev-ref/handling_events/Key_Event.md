---
title: 'Key Event'
---
# Overview

There is one key event that Keikai spreadsheet supports:

## onCtrlKey

This event is fired when a user presses a key specified in `ctrlKeys`
attribute. By default, Spreadsheet handles keys including **ctrl+z,
ctrl+y, ctrl+x, ctrl+c, ctrl+v, ctrl+b, ctrl+i, ctrl+u, and delete key**
without specifying `ctrlKeys` on <spreadsheet>.

# Event Monitor Example

![center]({{site.devref_image_folder}}/Zss-essentials-events-key.png)

In [Event Monitor](Editing_Event#event-monitor-example) example, the messages show that ctrl+c is pressed before ctrl+v.
Let's see how it was done:

{% highlight java linenos %}
public class EventsComposer extends SelectorComposer<Component>{
    //omitted codes...

    @Listen("onCtrlKey = #ss")
    public void onCtrlKey(KeyEvent event){
        StringBuilder info = new StringBuilder();
        
        info.append("Keys : ").append(event.getKeyCode())
            .append(", Ctrl:").append(event.isCtrlKey())
            .append(", Alt:").append(event.isAltKey())
            .append(", Shift:").append(event.isShiftKey());
        
        //display info...
    }
}
{% endhighlight %}

  - Line 4: Apply `@Listen` to listen to an event with the syntax `[EVENT NAME] = [COMPONENT SELECTOR]`. All event name can be found in `io.keikai.ui.event.Events`.
    The "\#ss" is the component selector which refers to the component with
    id "ss" on the ZUL page. (SelectorComposer supports various selector
    syntax that let you select components easily. Please refer to [ZK
    Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/MVC/Controller/Wire_Components)).
  - Line 8\~12: Except knowing which key is pressed, we can also know
    that control, alt, or shift keys are pressed or not via `KeyEvent`.

# Add More Shortcut Keys

If you wish to add more shortcut keys to a Keikai component, remember to
append the default shortcut keys:

  -   
    `^Z^Y^X^C^V^B^I^U#del`.

For example, if you want to add a shortcut key like **ctrl+a,** you
should set `ctrlKeys` to **`^A`**`^Z^Y^X^C^V^B^I^U#del`. By doing this, you can
still benefit from built-in key handling functions. For syntax used with
the property `ctrlKeys`, please refer to [ZK Developer Reference](https://www.zkoss.org/ZK_Developer%27s_Reference/UI_Patterns/Keystroke_Handling).
When the corresponding event listener is invoked, a `io.keikai.ui.event.KeyEvent` object is passed as an argument.

# Overrideing Existing Shortcut Keys

Every shortcut key has a corresponding `io.keikai.ui.UserActionHandler` to perform its function like `io.keikai.ui.impl.ua.CopyHandler`. When implementing your key event listener, you cannot do it by overriding existing shortcut keys' function because
the listener is executed after UserActionHandler. To override it you need to hook up your own UserActionHandler like:

``` java
Spreadsheet ss;
//...
UserActionManager manager = ss.getUserActionManager();
manager.registerHandler(Category.KEYSTROKE.getName(), "^V", new MyCustomPasteHandler());
```

Or, alternatively:

``` java
Spreadsheet ss;
//...
UserActionManager actionManager = ss.getUserActionManager();
actionManager.setHandler(Category.KEYSTROKE.getName(), "^V", new MyCustomPasteHandler());
```

Please refer to [
Toolbar\_Customization](Toolbar_Customization) for how you can implement a UserActionHandler and to find out the difference between
`registerHandler()` and `setHandler()`

