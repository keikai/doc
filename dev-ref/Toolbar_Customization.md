---
title: 'Toolbar Customization'
---

# Overview

Three toolbar buttons in out-of-box Spreadsheet are disabled by default:
"New Book", "Save Book", and "Export to PDF" for they are not
implemented yet. That's because the implementation of these functions
quite depends on your requirement so we leave them unimplemented. Here
we will tell you how to hook your own logic for these buttons.

Before implementing them, we should get the ideas behind toolbar
buttons. When you click a toolbar button, Spreadsheet will invoke its
corresponding "action handler" one by one (might be one or more) to
perform the task. Hence, what you have to do is to write your custom
action handlers and register them in Spreadsheet.

**Steps to implement logic for a toolbar button**

1.  Create a class to implement
    <javadoc directory="keikai">io.keikai.ui.UserActionHandler</javadoc>.
      -   
        There are some methods you have to implement - `isEnabled()` and
        `process()`. The `isEnabled()` which returns the enabled state
        of the handler is invoked by `UserActionManager` when
        Spreadsheet needs to refresh toolbar button's enabled state
        (e.g. selecting a sheet). When users click a toolbar button,
        only those enabled handler will be invoked. If one toolbar
        button's all handlers are disabled, the toolbar button becomes
        disabled. The `process()` is the method you should write your
        own logic to handle the user action.
2.  Register our custom handlers via
    <javadoc directory="keikai">io.keikai.ui.UserActionManager</javadoc>.
      -   
        After creating a `UserActionHandler`, you must hook it before it
        can be executed. We provide 2 ways to register a handler.
        `UserActionManager.registerHandler()` will append the passed
        handler while `UserActionManager.setHandler()` will remove other
        existing handlers and add the passed one.

# Create User Action Handlers

## New Book

"New Book" button will make Spreadsheet load a blank Excel file. We
create `NewBookHandler` to implement this function, the source code are
as follows:

{% highlight java linenos %}
public class NewBookHandler implements UserActionHandler {

    @Override
    public boolean isEnabled(Book book, Sheet sheet) {
        return true;
    }

    @Override
    public boolean process(UserActionContext context) {
        Importer importer = Importers.getImporter();
        
        try {
            Book loadedBook = importer.imports(new File(WebApps.getCurrent()
                            .getRealPath("/WEB-INF/books/blank.xlsx")), "blank.xlsx");
            context.getSpreadsheet().setBook(loadedBook);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return true;
    }
}
{% endhighlight %}

  - Line 1: A custom handler should implement `UserActionHandler`
    interface.
  - Line 4: Return enabled state of this handlers.
  - Line 13: Import a blank Excel file with importer, please refer to [
    Load A Book
    Model](ZK_Spreadsheet_Essentials/Working_with_Spreadsheet/Spreadsheet_Data_Model#Load_A_Book_Model "wikilink").
  - Line 15: Change Spreadsheet's book model with newly-loaded book. We
    can get
    <javadoc directory="keikai">io.keikai.ui.Spreadsheet</javadoc>,
    <javadoc directory="keikai">io.keikai.api.model.Book</javadoc>,
    <javadoc >org.zkoss.zk.ui.event.Event</javadoc>, selection
    (<javadoc directory="keikai">io.keikai.api.AreaRef</javadoc>), and
    action from
    <javadoc directory="keikai">io.keikai.ui.UserActionContext</javadoc>.
  - Line 19: In most cases, you should return `true` if you have handled
    the action.

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
    <javadoc directory="keikai">io.keikai.ui.Spreadsheet</javadoc>,
    <javadoc directory="keikai">io.keikai.api.model.Book</javadoc>,
    <javadoc >org.zkoss.zk.ui.event.Event</javadoc>, selection
    (<javadoc directory="keikai">io.keikai.api.AreaRef</javadoc>), and
    action from
    <javadoc directory="keikai">io.keikai.ui.UserActionContext</javadoc>.
  - Line 12: We just save back to original Excel file in our example for
    simplicity. Regarding how to implement the saving, you can refer to
    [ Export to
    Excel](ZK_Spreadsheet_Essentials/Working_with_Spreadsheet/Handling_Data_Model/Export_to_Excel "wikilink").

# Register User Action Handlers

After creating our own handlers, we have to register them to correspond
buttons of a Spreadsheet. In such a manner that when a user clicks a
button, Spreadsheet can find our custom handlers through the
registration.

The source code below demonstrates how to register custom user action
handler in a controller:

**Controller of customHandler.zul**

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
        actionManager.registerHandler(
                DefaultUserActionManagerCtrl.Category.AUXACTION.getName(),
                AuxAction.SAVE_BOOK.getAction(), new SaveBookHandler());
    }
}
{% endhighlight %}

  - Line 12: Get `UserActionManager` via Spreadsheet.
  - Line 13: Use `UserActionManager` to register our user action
    handlers.
  - Line 14: The first parameter is **category name**. Toolbar button
    belongs to <javadoc directory="keikai" method="AUXACTION" >
    io.keikai.ui.impl.DefaultUserActionManagerCtrl.Category</javadoc>.
  - Line 15: The second parameter is **action name**. Each toolbar
    button corresponds to one action which is defined in
    <javadoc directory="keikai">io.keikai.ui.AuxAction</javadoc>.

After completing above step, run `customHandler.zul` and you can see
those buttons we registered handlers for are now enabled.

![ center](/assets/images/dev-ref/zss-essentials-customHandler.png " center")

# Append or Override with Your Handler

There are 2 ways to hook up your user action handlers:

  - <javadoc directory="keikai" method="registerHandler(java.lang.String, java.lang.String, io.keikai.ui.UserActionHandler)">io.keikai.ui.impl.DefaultUserActionManagerCtrl</javadoc>
      -   
        This method appends your handler after existing handlers, and
        those handlers are invoked in order. It's used to add customized
        post-processing for a toolbar button.

<!-- end list -->

  - <javadoc  directory="keikai" method="setHandler(java.lang.String, java.lang.String, io.keikai.ui.UserActionHandler)">io.keikai.ui.impl.DefaultUserActionManagerCtrl</javadoc>
      -   
        This method replaces existing handlers with yours, and only your
        handler is left and invoked. It can be used to override existing
        toolbar button's function.

# Hide Toolbar Button

To hide some toolbar buttons by JavaScript, please reference `customToolbar.zul` Keikai Essentials:


{% highlight java linenos %}
    <script defer="true"><![CDATA[
var hiddenButtons = ['.zstbtn-newBook', '.zstbtn-saveBook', '.zstbtn-exportPDF', '.zstbtn-sortAndFilter'
    , '.zschktbtn-protectSheet', '.zstbtn-insertPicture', '.zstbtn-insertChart'];

jq.each(hiddenButtons, function(index, selector){
    jq(selector).hide();
});
    ]]></script>
{% endhighlight %}
