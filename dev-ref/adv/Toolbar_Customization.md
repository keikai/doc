---
title: 'Toolbar Customization'
---

# Overview

There are 2 toolbar buttons in out-of-box Spreadsheet are disabled by default for there is no default handler for them:
* "Save Book"
* "Export to PDF"

That's because the implementation of these functions quite depends on your requirement, so we don't set a handler for them. Here we will tell you how to hook your own logic for these buttons.

Before implementing them, you should know the ideas behind toolbar buttons. When you click a toolbar button, Spreadsheet will invoke its corresponding "action handler" one by one (might be one or more) to
perform the task. Hence, what you have to do is to write your custom **action handler** and register it.

toolbar button ![]({{site.devref_image_folder}}/toolbarbutton.png) --------- invoke ---------> `UserActionHandler`


## Steps to implement a Toolbarbutton Handler

### 1. Create a handler class to implement [`io.keikai.ui.UserActionHandler`](https://keikai.io/javadoc/latest/io/keikai/ui/UserActionHandler.html)
There are some methods you have to implement - `isEnabled()` and `process()`. 

The `isEnabled()` which returns the enabled state of the handler is invoked by `UserActionManager` when
Spreadsheet needs to refresh toolbar button's enabled state
(e.g. selecting a sheet). When users click a toolbar button,
only those enabled handler will be invoked. If one toolbar
button's all handlers are disabled, the toolbar button becomes
disabled. 
        
The `process()` is the method you should write your own logic to handle the user action.

### 2.  Register our custom handlers via `io.keikai.ui.UserActionManager`
After creating a `UserActionHandler`, you must hook it before it can be executed. Please read [Append or Override with Your Handler](#append-or-override-with-your-handler).

# Create User Action Handlers

## Save Book

"Save Book" button will save a book model as an Excel file with its book
name as the file name.

{% highlight java linenos %}
public class SaveBookHandler implements UserActionHandler {
    
    @Override
    public boolean isEnabled(Book book, Sheet sheet) {
        return book!=null;
    }

    @Override
    public boolean process(UserActionContext ctx){
        try{
            Book book = ctx.getBook();
            save(book);
            Clients.showNotification("saved "+book.getBookName(),"info",null,null,2000,true);
            
        }catch(Exception e){
            e.printStackTrace();
        }
        return true;
    }
    //omitted code for brevity...
}
{% endhighlight %}

  - Line 5: Only when Spreadsheet has loaded a book, this handler is
    enabled.
  - Line 11: We can get
    `io.keikai.ui.Spreadsheet`,
   `io.keikai.api.model.Book`,
    `org.zkoss.zk.ui.event.Event`, selection
    (`io.keikai.api.AreaRef`), and
    action from
    `io.keikai.ui.UserActionContext`.
  - Line 12: We just save back to original Excel file in our example for
    simplicity. Regarding how to implement the saving, you can refer to
    [Export to
    Excel](https://www.zkoss.org/wiki/ZK_Spreadsheet_Essentials/Working_with_Spreadsheet/Handling_Data_Model/Export_to_Excel).

# Register User Action Handlers

After creating our own handlers, we have to register them to correspond
buttons of a Spreadsheet. In such a manner that when a user clicks a
button, Spreadsheet can find our custom handlers through the
registration.

The source code below demonstrates how to register custom user action
handler in a controller:

**[Controller of customHandler.zul](https://github.com/keikai/dev-ref/blob/master/src/main/java/io/keikai/devref/advanced/customization/CustomHandlerComposer.java)**

{% highlight java linenos %}
public class CustomHandlerComposer extends SelectorComposer<Component> {
    
    @Wire
    private Spreadsheet ss;

    
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        
        //initialize custom handlers
        UserActionManager actionManager = ss.getUserActionManager();
        actionManager.registerHandler(
                DefaultUserActionManagerCtrl.Category.AUXACTION.getName(),
                AuxAction.NEW_BOOK.getAction(), new NewBookHandler());
        actionManager.setHandler(
            DefaultUserActionManagerCtrl.Category.AUXACTION.getName(),
            AuxAction.DATA_VALIDATION.getAction(), new MyValidationHandler());
    }
}
{% endhighlight %}

  - Line 12: Get `UserActionManager` via Spreadsheet.
  - Line 13: Use `UserActionManager` to register our user action
    handlers.
  - Line 14: The first parameter is **category name**. Toolbar button
    belongs to [DefaultUserActionManagerCtrl.Category.AUXACTION](https://keikai.io/javadoc/latest/io/keikai/ui/impl/DefaultUserActionManagerCtrl.Category.html#AUXACTION)
  - Line 15: The second parameter is **action name**. Each toolbar
    button corresponds to one action which is defined in
    [AuxAction](https://keikai.io/javadoc/latest/io/keikai/ui/AuxAction.html).

After completing above steps, run `customHandler.zul` and you can see those buttons we registered handlers for are now enabled.


# Append or Override with Your Handler

There are 2 ways to hook up your user action handlers:

- `io.keikai.ui.impl.DefaultUserActionManagerCtrl.registerHandler()`
  - This method **appends** your handler after existing handlers, and
        those handlers are invoked in order. It's used to add customized
        post-processing for a toolbar button.

- `io.keikai.ui.impl.DefaultUserActionManagerCtrl.setHandler()`
  - This method **replaces** existing handlers with yours, and only your
        handler is left and invoked. It can be used to override existing
        toolbar button's function.


# Remove a Toolbar Button

To Remove a toolbar button, just call the API:


```java
spreadsheet.removeToolbarButton(AuxAction.EXPORT_PDF);
```

# Add a Toolbar Button
To add a toolbarbutton, you need to add a button via `spreadsheet.addToolbarButton()` and register the corresponding handler described in [Create User Action Handlers](#create-user-action-handlers). 

Check [the example](https://github.com/keikai/dev-ref/blob/master/src/main/java/io/keikai/devref/advanced/customization/CustomToolbarComposer.java).

