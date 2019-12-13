---
title: 'Cell Data'
---

# Access Cell Data

There are 2 parts of information stored in cells, one is "data" and
another is "style" which will be described in next section. In this
section, we are going to introduce the "data" part. It stores the text
you actually enter in a cell and the value being evaluated. To get
"data" information, you must get`io.keikai.api.Range` first. Then,
get `io.keikai.api.model.CellData` to obtain various data of a cell including its text, type, and value.

{% highlight java linenos %}
Range range = Ranges.range(spreadsheet.getSelectedSheet(),row,col);
CellData cellData = range.getCellData();

//the actual text you enter in a cell, e.g. =SUM(1,2)
String text = cellData.getEditText();
cellData.setEditText("=SUM(1,2)");

//the formatted text, e.g. edit text "100" might be formatted to "100.0"
String formatText = cellData.getFormatText();

//return one of 6 types such as NUMERIC, STRING, FORMULA, BLANK, BOOLEAN, ERROR
CellType type1 = cellData.getType();

//type of a cell's evaluation result,
//formula-typed cell will be evaluated to one of NUMERIC, STRING, BLANK, BOOLEAN, or ERROR
CellType type2 =  cellData.getResultType();

//get row or column index (0-based)
int row = cellData.getRow();
int column = cellData.getColumn();

//return an object of evaluated result, may be Double, String, null, Boolean, or Byte
Object value = cellData.getValue();

//methods that convert the value for you
Date dateValue = cellData.getDateValue();
Double doubleValue = cellData.getDoubleValue();
Boolean booleanValue = cellData.getBooleanValue();
String stringValue = cellData.getStringValue();
{% endhighlight %}

  - Line 6: You may catch
    `io.keikai.api.IllegalFormulaException` (unchecked exception) to handle 
    the case that users enter a formula with illegal format.

## Example

The screenshot below is an example which can display a focused cell's
data and the editor at right bottom corner allows you to change the
focused cell's editing text. ![ center](/assets/images/dev-ref/zss-essentials-cellData.png
" center")

You can see the cell data of "D5". Its editing text is "=SUM(D1:D3)" and
formatted text is 123655.99. Besides, its cell type is "FORMULA" but
result type is "NUMERIC" because the formula's evaluation result is a
number.

**Example application's ZUL page**

{% highlight java linenos %}
    <window hflex="1" vflex="1"
        apply="io.keikai.essential.CellDataComposer">
        <hlayout hflex="1" vflex="1">
            <spreadsheet id="ss" hflex="1" vflex="1"
                showFormulabar="true" showContextMenu="true" showToolbar="true"
                showSheetbar="true" maxVisibleRows="100" maxVisibleColumns="40"
                src="/WEB-INF/books/sample.xlsx" selectedSheet="CellValue"/>
            <vlayout width="300px" vflex="1">
                <groupbox hflex="1" vflex="1">
                    <caption label="Cell Information" />
                    ...
                </groupbox>
                <groupbox hflex="1" vflex="1">
                    <caption label="Editor" />
                    ...
                </groupbox>
            </vlayout>
        </hlayout>
    </window>
{% endhighlight %}

  - Line 4: We set Spreadsheet's id to "ss" that can be used in `@Wire`
    in our controller.

**Controller**

{% highlight java linenos %}
public class CellDataComposer extends SelectorComposer {

    @Wire
    private Label cellType;
    @Wire
    private Label cellFormatText;
    @Wire
    private Label cellEditText;
    @Wire
    private Label cellValue;
    @Wire
    private Label cellResultType;
    @Wire
    private Label cellRef;
    @Wire
    private Textbox cellEditTextBox;
    @Wire
    private Spreadsheet ss;

    @Listen("onCellFocus = #ss")
    public void onCellFocus(){
        CellRef pos = ss.getCellFocus();
        
        refreshCellInfo(pos.getRow(),pos.getColumn());      
    }
    
    private void refreshCellInfo(int row, int col){
        Range range = Ranges.range(ss.getSelectedSheet(),row,col);
        
        cellRef.setValue(Ranges.getCellRefString(row, col));

        //show a cell's data
        CellData data = range.getCellData();
        cellFormatText.setValue(data.getFormatText());
        cellEditText.setValue(data.getEditText());
        cellType.setValue(data.getType().toString());
        
        Object value = data.getValue();
        cellValue.setValue(value==null?"null":(value.getClass().getSimpleName()+" : "+value));
        cellResultType.setValue(data.getResultType().toString());
        
        cellEditTextBox.setValue(data.getEditText());
        
    }
    
    @Listen("onChange = #cellEditTextBox")
    public void onEditboxChange(){
        CellRef pos = ss.getCellFocus();
        Range range = Ranges.range(ss.getSelectedSheet(),pos.getRow(),pos.getColumn());
        CellData data = range.getCellData();
        try{
            data.setEditText(cellEditTextBox.getValue());
        }catch (IllegalFormulaException e){
            //handle illegal formula input
        }
        refreshCellInfo(pos.getRow(),pos.getColumn());
        
    }
}
{% endhighlight %}

  - Line 34,35,36,38,40: These codes use API described in previous
    section to display the focused cell's data in a Groupbox.
  - Line 52: Set edit box's value back to the focused cell's data when
    we change the editor box's text.
  - Line 53: You can catch `IllegalFormulaException` to handle the case
    if users enter an illegal formula.
