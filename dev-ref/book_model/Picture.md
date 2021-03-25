---
title: 'Picture'
toc: false
---


# Overview

We can add, move, and delete a picture of a Spreadsheet with
`io.keikai.Range`API:

{% highlight java linenos %}
public Picture addPicture(SheetAnchor anchor,byte[] image,Format format);

public void movePicture(SheetAnchor anchor,Picture picture);

public void deletePicture(Picture picture);
{% endhighlight %}

A picture is a simple object that you can only get its ID and position.
Current supported picture formats are listed in
`io.keikai.model.Picture.Format`
which include `EMF, WMF, PICT, JPEG, PNG`, and `DIB`.

The [`SheetAnchor`](https://keikai.io/javadoc/latest/io/keikai/api/SheetAnchor.html) represents a picture's position on a sheet. 
When adding or moving a picture, you must provide one `SheetAnchor` to assign 
a picture's position. You can create a `SheetAnchor` by passing 4 index numbers, 
left top corner's and right bottom's row and column of an image. 
After you add a picture, you will get the newly-created [`io.keikai.model.Picture`](https://keikai.io/javadoc/latest/io/keikai/api/model/Picture.html) object. 
You had better store it somewhere you can retrieve it back later
if you plan to delete or move it. Otherwise, you can only get them from
a `Sheet` method:

```java
    public List<Picture> getPictures();
```

Then, use its ID or position to identify a picture.

If you think passing byte array of an image is troublesome for you, you
can use `io.keikai.image.AImage`. It has several
convenient constructors to create a object for an image like:

```java
AImage image = new AImage(WebApps.getCurrent().getResource("/zklogo.png"));
```

Then, you can pass `AImage` to
`io.keikai.SheetOperationUtil`
to add a picture:

```java
    public static void addPicture(Range range, AImage image);
```

This method will create a `SheetAnchor` internally based on the image's
size. .

# Example

The screenshot below is a application that can add, move and delete a
picture. ![center]({{site.devref_image_folder}}/Zss-essentials-picture.png)

If we click "Add", it will add a ZK logo picture and update picture
items in the Listbox on the top right corner. Select a picture item in
the listbox, enter destination row and column index in 2 Intboxes, then
click "Move". The selected picture will be moved to specified position.
The "Delete" button will delete the selected picture.

Notice that there are 5 columns in the Listbox on the top right corner
which display information about pictures we add. The ID is a picture's
ID generated automatically by Spreadsheet. The row and column represents
a picture's position of the left top corner in 0-based index and the
last row and last column represents symmetric position of a picture
(right bottom corner). For example, in the screenshot, the leftmost
picture whose ID is "rid1\_1", its left top corner is at "B7"
represented in column index "1" and row index "6". Its right bottom
corner is at "C12" represented in column index "11" and row index "2".
These position information is stored in `SheetAnchor`. When adding or
moving a picture, you must provide one `SheetAnchor` to assign a
picture's position. The `SheetOperationUtil` provides methods to
simplify this.

Let's see this application's controller codes:

{% highlight java linenos %}
public class PictureComposer extends SelectorComposer<Component> {

    @Wire
    private Intbox toRowBox;
    @Wire
    private Intbox toColumnBox;
    @Wire
    private Spreadsheet ss;
    @Wire
    private Listbox pictureListbox;
    
    private ListModelList<Picture> pictureList = new ListModelList<Picture>();

    @Listen("onClick = #addButton")
    public void addByUtil() {
        Range selection = Ranges.range(ss.getSelectedSheet(), ss.getSelection());
        try{
            SheetOperationUtil.addPicture(selection,
                new AImage(WebApps.getCurrent().getResource("/zklogo.png")));
            refreshPictureList();
        }catch(IOException e){
            System.out.println("cannot add a picture for "+ e);
        }
    }
    
    @Listen("onClick = #deleteButton")
    public void deleteByUtil() {
        if (pictureListbox.getSelectedItem() != null){
            SheetOperationUtil.deletePicture(Ranges.range(ss.getSelectedSheet()),
                    (Picture)pictureListbox.getSelectedItem().getValue());
            refreshPictureList();
        }
    }
    
    @Listen("onClick = #moveButton")
    public void moveByUtil(){
        if (pictureListbox.getSelectedItem() != null){
            SheetOperationUtil.movePicture(Ranges.range(ss.getSelectedSheet()),
                    (Picture)pictureListbox.getSelectedItem().getValue(),
                    toRowBox.getValue(), toColumnBox.getValue());
            refreshPictureList();
        }
    }
    
    private void refreshPictureList(){
        pictureList.clear();
        pictureList.addAll(ss.getSelectedSheet().getPictures());
        pictureListbox.setModel(pictureList);
    }
}
{% endhighlight %}
