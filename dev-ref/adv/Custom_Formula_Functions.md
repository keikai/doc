---
title: 'Custom Formula Functions'
---

# Overview

Spreadsheet allows developers to implement their own custom functions
and use these functions like built-in ones. You can just enter your
custom function like `=MYFFUNCTION(A1)` and it works like other
functions. To implement such a custom method is easy: just create a
static method and declare it in a ZUL page with EL method or tag
library.

Steps to add a custom function:

1.  Implement a custom function with a public static method.
2.  Declare a custom function in a ZUL page.
      -   
        You could declare it with xel-method or custom tag library. Of
        course, the ZUL page should contain a Spreadsheet component.

After completing above steps, you can use the custom function in
Spreadsheet.

# Only Work in Keikai spreadsheet

Notice that a custom function is implemented with Java in your project.
So the custom function will not be saved into an XLSX file. That means a
custom function is only evaluated and recognized when you load a file
into Keikai spreadsheet. If you open the exported file with a custom
function by MS Excel (or other compatible editors), Excel cannot
recognize the custom function and will show `#NAME?` (or might be other
error results) in a cell.

# Implement a Custom Function

Basically, to implement a function is just like implementing a static
Java method, but depending on your requirements there are several ways
to do it. We will introduce them from easy to complicated one.

## Basic - Simple Function

If your function accepts fixed number of arguments and each argument is
a single value (or a reference to a single cell), you can use this way
to implement your custom function.

Assume that we are going to create a money exchange function,
`EXCHANGE()`, that accepts 2 double arguments and return exchange
result. The first one is money, and the second one is exchange rate.

![center]({{site.devref_image_folder}}/Zss-essentials-customFormula-exchange.png)

The custom function can be implemented like:

{% highlight java linenos %}
public class MyCustomFunctions {

    public static double exchange(double money, double exchangeRate) {
        return money * exchangeRate;
    }   
}
{% endhighlight %}

After declaring it in a ZUL page, you can use this function like
`=EXCHANGE(10, 31.3)` or `=EXCHANGE(C3, D3)`. Spreadsheet will evaluate
each argument and pass them to `exchange()` method. If you pass a
reference to a range of cells in this function, e.g. `=EXCHANGE(C3:C4,
D3)`, only the first cell will be evaluated.

## Intermediate - Multiple Numeric Arguments Function

If your function needs to accept a range of cells with numeric value or
variable number of numeric arguments, you should follow the steps below:

1.  Create a class `MyNumericFunction` inherited from
    <javadoc directory="keikai">org.zkoss.poi.ss.formula.functions.MultiOperandNumericFunction</javadoc>
    and override its `evaluate(double[])`.
      -   
        `MultiOperandNumericFunction` can evaluate various arguments to
        double including a range of cells, string, and boolean etc. You
        can benefit from this behavior instead of handling various
        <javadoc directory="keikai">org.zkoss.poi.ss.formula.eval.ValueEval</javadoc>
        by yourself.
2.  Create a public static method with specific signature:
      - `public static ValueEval yourFunctionName(ValueEval[] , int ,
        int )`  
        You should not change this signature because Spreadsheet
        recognize your method by the signature.
3.  In your static method (`yourFunctionName()`), invoke
    `MyNumericFunction.evaluate(ValueEval[] , int , int)` to calculate.

Assume that we are going to create a custom function, MYSUBTOTAL(), that
accepts variable number of numeric arguments and sums them all. ![
center]({{site.devref_image_folder}}/zss-essentials-customFormula-mysubtotal.png " center")

First, we create a class to implement my subtotal function:

{% highlight java linenos %}
public class MySubtotal extends MultiOperandNumericFunction{

    protected MySubtotal() {
        // the first parameter determines whether to evaluate boolean value. If
        // it's true, evaluator will evaluate boolean value to number. TRUE to 1
        // and FALSE to 0.
        // If it's false, boolean value is just ignored.
        // The second parameter determines whether to evaluate blank value.
        super(false, false);
    }
    
    /**
     * inherited method, ValueEval evaluate(ValueEval[] args, int srcCellRow,
     * int srcCellCol), will call this overridden method This function depends
     * on MultiOperandNumericFunction that evaluates all arguments to double.
     * This function sums all double values in cells.
     */
    @Override
    protected double evaluate(double[] values) throws EvaluationException {
        double sum = 0;
        for (int i = 0 ; i < values.length ; i++){
            sum += values[i];
        }
        return sum;
    }
}
{% endhighlight %}

  - Line 19: The overloading `evaluate(ValueEval[], int, int)` it
    inherits from `MultiOperandNumericFunction` will process all
    arguments to a double array and pass it to your overridden method,
    `evaluate(double[])`. It can save your effort to deal with each
    argument. If you encounter a situation that you don't expect, please
    throw `org.zkoss.poi.ss.formula.eval.EvaluationException`.
    Because Spreadsheet can handle the exception gracefully.

Then, create a static method with previously-mentioned signature and
delegate method calling to `MySubtotal`.

{% highlight java linenos %}
public class MyCustomFunctions {

    private static Function MY_SUBTOTAL = new MySubtotal();
    
    /**
     * This method delegates calling to MySubtotal which implements the function.
     * @param args evaluation of all arguments
     * @param srcCellRow row index of the cell containing the function under evaluation
     * @param srcCellCol column index of the cell containing the function under evaluation
     * @return function result
     */
    public static ValueEval mySubtotal(ValueEval[] args, int srcCellRow, int srcCellCol){
        return MY_SUBTOTAL.evaluate(args, srcCellRow, srcCellCol); 
    }
}
{% endhighlight %}

  - Line 13: Delegate method calling to to `MySubtotal` which implements
    the function actually.

## Advanced - Manually-Handled Arguments Function

If your function needs to handle arguments by yourself instead of always
evaluating them as numbers, you should create a public static method
with the signature:

**`public static ValueEval yourFunctionName(ValueEval[] , int , int )`**

You should not change this signature because Spreadsheet recognizes your
method by the signature. Spreadsheet will pass all arguments as an array
of `ValueEval`, and you have to process each `ValueEval` to fulfill your
function's requirement.

Here, we demonstrate this approach with a function, `CHAIN()`, that
chains multiple text cells into one text. Below screenshot shows its use
cases: 

![ center]({{site.devref_image_folder}}/Zss-essentials-customFormula-chain.png)

You can see that this function can accept various arguments including
string, a range of cells, and multiple cell references. Different kind
of arguments will be evaluated to different subclass of `ValueEval`, and
you should handle them in your function method to make your custom
function support these use cases.

'''The function to chain text '''

{% highlight java linenos %}
public class MyCustomFunctions {

    /**
     * Advanced - Manually-Handled Arguments Function. 
     * This method demonstrates how to evaluate arguments manually. 
     * The method implements a function that concatenates all texts in cells 
     * and ignores other types of value.
     * 
     * @param args the evaluated function arguments
     * @param srcCellRow unused
     * @param srcCellCol unused
     * @return calculated result, a subclass of ValueEval
     */
    public static ValueEval chain(ValueEval[] args, int srcCellRow, int srcCellCol){

        List<StringEval> stringList = new LinkedList<StringEval>();
        for (int i = 0 ; i < args.length ; i++){
            //process an argument like A1:B2
            if (args[i] instanceof TwoDEval) {
                TwoDEval twoDEval = (TwoDEval) args[i];
                int width = twoDEval.getWidth();
                int height = twoDEval.getHeight();
                for (int rowIndex=0; rowIndex<height; rowIndex++) {
                for (int columnIndex=0; columnIndex<width; columnIndex++){
                    ValueEval ve = twoDEval.getValue(rowIndex, columnIndex);
                    if (ve instanceof StringEval){
                        stringList.add((StringEval)ve);
                        }
                    }
                }
                continue;
            }
            //process an argument like C18
            if (args[i] instanceof RefEval){
                ValueEval valueEval = ((RefEval)args[i]).getInnerValueEval();
                if (valueEval instanceof StringEval){
                    stringList.add((StringEval)valueEval);
                }
                continue;
            }
            if (args[i] instanceof StringEval){
                stringList.add((StringEval)args[i]);
                continue;
            }

        }
        //chain all string value
        StringBuffer result = new StringBuffer();
        for (StringEval s: stringList){
            result.append(s.getStringValue());
        }

        //throw EvaluationException if encounter error conditions
        return new StringEval(result.toString());
    }

}
{% endhighlight %}

  - Line 14: You should create a public static method with the same
    signature because Spreadsheet recognizes your function method by the
    signature.
  - Line 19:
    <javadoc directory="keikai">org.zkoss.poi.ss.formula.TwoDEval</javadoc>
    is a common interface that represents a range of cells. Process it
    to make your function accepts an argument like A1:B2. In our
    example, we just get each text cell of it and ignore others.
  - Line 34:
    <javadoc directory="keikai">org.zkoss.poi.ss.formula.eval.RefEval</javadoc>
    represents an evaluation of a cell reference like "C18".
  - Line 41:
    <javadoc directory="keikai">org.zkoss.poi.ss.formula.eval.StringEval</javadoc>
    is the evaluation result of a string like "abc".
  - Line 53: We recommend you to throw an `EvaluationException` when you
    encounter an error condition. Because Spreadsheet will catch and
    handle it gracefully for you.
  - Line 54: Return an object of `ValueEval`'s subtype according to your
    result.

# Declare a Custom Function in a ZUL Page

After implementing a method for a custom function, we can use one of the
following ways to bring it in a ZUL page before using it in Spreadsheet.

## Using EL Method

Use xel-method directive is quite straight out. Just write it on the ZUL
page with prefix **keikai** and that is done. Please refer to
[ZUML\_Reference/ZUML/Processing\_Instructions/xel-method](https://www.zkoss.org/wiki/ZUML_Reference/ZUML/Processing_Instructions/xel-method)
for complete explanation of each attribute.

For our custom function, we can write:

{% highlight java linenos %}

<?xel-method prefix="keikai" name="EXCHANGE"
    class="io.keikai.essential.advanced.MyCustomFunctions"  
    signature="double exchange(double,double)"?>
<?xel-method prefix="keikai" name="MYSUBTOTAL"
    class="io.keikai.essential.advanced.MyCustomFunctions"  
    signature="org.zkoss.poi.ss.formula.eval.ValueEval mySubtotal(org.zkoss.poi.ss.formula.eval.ValueEval[], int, int)"?>
<?xel-method prefix="keikai" name="CHAIN"
    class="io.keikai.essential.advanced.MyCustomFunctions"  
    signature="org.zkoss.poi.ss.formula.eval.ValueEval chain(org.zkoss.poi.ss.formula.eval.ValueEval[], int, int)"?>
<?taglib uri="/WEB-INF/tld/function.tld" prefix="keikai" ?>    
<zk>
    <window title="Keikai spreadsheet" border="normal" height="100%">
        <spreadsheet src="/WEB-INF/books/customFunction.xlsx" 
        maxVisibleRows="250" maxVisibleColumns="40" width="100%" height="100%" 
        showContextMenu="true" showSheetbar="true" showToolbar="true" />
    </window>
</zk>
{% endhighlight %}

  - Line 1: Notice that "prefix" attribute must be set to "keikai" for Keikai
    Spreadsheet to find custom functions.

After declaring them, you can use them in a cell like
`=EXCHANGE(10, 31.3)`.

## Using Tag Library

To use taglib directive, we should create a taglib file and specify its
file path in `uri` attribute of taglib directive and set "prefix" to
**keikai**. Please refer to
[ZUML\_Reference/ZUML/Processing\_Instructions/taglib/Custom\_Taglib](https://www.zkoss.org/wiki/ZUML_Reference/ZUML/Processing_Instructions/taglib/Custom_Taglib) for details. We list our sample configuration here:

**function.tld**

{% highlight java linenos %}

<?xml version="1.0" encoding="UTF-8" ?>
<taglib>
    <uri>http://www.zkoss.org/keikai/essentials/custom</uri> http://www.zkoss.org/keikai/essentials/custom</uri>
    <description>
        User defined functions.
    </description>
    <import>
        <import-name>MyCustomFunctions</import-name>
        <import-class>io.keikai.essential.advanced.MyCustomFunctions
        </import-class>
    </import>
 
    <function>
        <name>MYEXCHANGE</name>
        <function-class>
        io.keikai.essential.advanced.MyCustomFunctions
        </function-class>
        <function-signature>
        double exchange(double,double);
        </function-signature>
        <description>
        Exchange one money to another one according to specified exchange rate.
        </description>
    </function>
</taglib>
{% endhighlight %}

Declare it in a ZUL page.

{% highlight java linenos %}
<?taglib uri="/WEB-INF/tld/function.tld" prefix="keikai" ?>    
<zk>
    <window title="Keikai spreadsheet" border="normal" height="100%">
        <spreadsheet src="/WEB-INF/books/customFunction.xlsx" 
        maxVisibleRows="250" maxVisibleColumns="40" width="100%" height="100%" 
        showContextMenu="true" showSheetbar="true" showToolbar="true" />
    </window>
</zk>
{% endhighlight %}

  - Line 1: Notice that "prefix" attribute must be set to "keikai" for Keikai
    Spreadsheet to find custom functions.

After completing above steps, you can use this custom function in
Spreadsheet like `=MYEXCHANGE(5, 31.1)`.

# Override Built-in Function

If you give your customized function the same name as built-in
function's, it will override Spreadsheet built-in functions. Your
customized function will be invoked instead of built-in one.

**Override LEN()**

{% highlight java linenos %}
<?xel-method prefix="keikai" name="LEN"
    class="io.keikai.essential.advanced.MyCustomFunctions"  
    signature="org.zkoss.poi.ss.formula.eval.ValueEval myLen(org.zkoss.poi.ss.formula.eval.ValueEval[], int, int)"?>
<zk>
    <window title="Keikai spreadsheet" border="normal" height="100%">
        <spreadsheet src="/WEB-INF/books/overrideFunction.xlsx" 
        maxVisibleRows="250" maxVisibleColumns="40" width="100%" height="100%" 
        showContextMenu="true" showSheetbar="true" showToolbar="true" />
    </window>
</zk>
{% endhighlight %}

  - In above page, if we use `LEN()` in a formula, `myLen()` will be
    invoked.
