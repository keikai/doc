---
title: 'Collaboration Edit'
---

# Overview

Spreadsheet can support *Collaboration Edit* automatically as long as
two or more Spreadsheet components share a common book model with proper
scope. To enable this feature on a book object, we should call
`Book.setShareScope()` before setting the book object to a Spreadsheet.
Then, we should give the same book object to every Spreadsheet that
joins the collaboration edit. After this, one user's edit will
automatically reflect to other users' Spreadsheet and each user can also
see others' current selection box which are painted with different
colors.

# Example

Here we demonstrate an example application that loads a book and shares
it in "application" scope. A user can click a book name in the list to
open it in the Spreadsheet. If two users open the same book and they are
both actually editing on the same book model instance. One user's edit
will immediately reflect on another user's Spreadsheet.

The screenshot below is what the user, Paul, sees and he can also see
another user's (John) current selection (purple box). 

![center](/assets/images/dev-ref/Essentials-feature-coedit-user1.png)

Another user, John, can also see Paul's current selection (blue box) in
his spreadsheet. 

![center](/assets/images/dev-ref/Essentials-feature-coedit-user2.png)

The controller's code of above example:

{% highlight java linenos %}
public class CoeditComposer extends SelectorComposer<Component> {

    private static final long serialVersionUID = 1L;
    
    @Wire
    private Spreadsheet ss;
    @Wire
    private Listbox availableBookList;
    
    static private final Map<String,Book> sharedBook = 
        new HashMap<String,Book>();

    //omit initialization codes...

    @Listen("onSelect = #availableBookList")
    public void onBookSelect(){
        String bookName = availableBookList.getSelectedItem().getValue();
        Book book = loadBookFromAvailable(bookName);
        ss.setBook(book);
    }
    
    private Book loadBookFromAvailable(String bookname){
        Book book;
        synchronized (sharedBook){
            book = sharedBook.get(bookname);
            if(book==null){
                book = importBook(bookname);
                book.setShareScope("application");
                sharedBook.put(bookname, book);
            }
        }
        return book;
    }
    
    @Listen("onClick=#setUserName")
    public void setUserName(){
        ss.setUserName(userName.getValue());
    }
    
    
    private Book importBook(String bookname){
        if(!availableBookModel.contains(bookname)){
            return null;
        }
        Importer imp = Importers.getImporter();
        try {
            Book book = imp.imports(
                    WebApps.getCurrent().getResource("/WEB-INF/books/" + bookname),
                    bookname);
            return book;
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage(),e);
        }
    }
}
{% endhighlight %}

  - Line 10: For simplicity, we use a static map to simulate a shared
    book model repository.
  - Line 24: When a user selects a book, we always return a shared
    `Book` object first if it exists.
  - Line 27: You should call `setShareScope()` before setting the book
    object to a Spreadsheet.
  - Line 36: You can give Spreadsheet user a more identifiable name by
    `setUserName()`. The name will appear on the selection box showing
    in other users' Spreadsheet.
