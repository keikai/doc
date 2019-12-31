---
title: 'Reference to Java Beans'
---

# Overview

When showing data in Spreadsheet from backend, use `Range` API to set
value cell by cell could be a tedious task. Hence, Spreadsheet allows
you use EL (Expression Language) in cells and it resolves the name
expressions to the back end Java beans automatically.

## How Spreadsheet resolve a name in a cell

If a variable in cells equals Excel *Defined Name* found in Excel
file, Keikai spreadsheet will treat them as what it defines. If not, Keikai
Spreadsheet follows ZK's EL expression variable resolving mechanism. It
first tries to find any matching zscript variables defined in the ZUL
page. Then check ID of ZK fellow components. Then search in ZK
components' attribute map. Finally ask variable resolvers defined in the
zul page to retrieve the bean with named variable. If still none is
found, it will return `#NAME?` as Excel's original behavior. Once
variables are resolved, the associated getter are called and value
returned in the cell.

# Usage

Steps to use this feature.

1.  Implement a variable resolver class.
2.  Declare the variable resolver in ZUL pages or in system scope.

Then you can access JavaBeans like a formula, e.g. enter
`=myBean.myProperty` in a cell.

# Example

Assume the application below has a sheet in protection, a user cannot
modify any cells directly in the sheet. They can only update value via
panel on the right side. 

![center](/assets/images/dev-ref/Essentials-bean.png) 

You can see from the formula bar, the content of B3 is an EL expresstion,
`=assetsBean.liquidAssets`.

First, we implement a variable resolver class. You can refer to [ZK
Developer%27s Reference/UI Composing/ZUML/EL Expressions\#Variable
Resolver](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/UI_Composing/ZUML/EL_Expressions#Variable_Resolver)
for complete explanation. Our resolver use `MyBeanService` to get a bean
which is a singleton and can be accessed in anywhere.

{% highlight java linenos %}
public class MyBeanResolver implements VariableResolver {

    @Override
    public Object resolveVariable(String name) throws XelException {
        return MyBeanService.getMyBeanService().get(name);
    }
}
{% endhighlight %}

Declare our `MyBeanResolver` in a ZUL page. (or you could make it a [
system level variable
resolver](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/UI_Composing/ZUML/EL_Expressions#System-level_Variable_Resolver)
which can be available in all pages.)

{% highlight java linenos %}
<?variable-resolver class="io.keikai.essential.advanced.MyBeanResolver"?>
<zk>
    <window hflex="1" vflex="1" 
        apply="io.keikai.essential.advanced.RefBeanComposer">
        <hlayout hflex="1" vflex="1">
            <spreadsheet id="ss" src="/WEB-INF/books/bean.xlsx" 
                maxrows="200" maxcolumns="40"
                showFormulabar="true" showContextMenu="true" 
                showToolbar="true" showSheetbar="true" 
                hflex="1" vflex="1" width="100%" >
            </spreadsheet>
            ...
        </hlayout>
    </window>
</zk>
{% endhighlight %}

## When JavaBean Changes

In our example, the sheet is protected. Users can only change value from
the panel on the right hand side. But Spreadsheet won't know the change
of a bean unless you notify it. When you notify the Spreadsheet of
changed beans, it will collect which cells are affected (i.e. those
dependent cells with the specified bean names), and update them
accordingly.

{% highlight java linenos %}
public class RefBeanComposer extends SelectorComposer<Component> {
    
    @Wire
    private Spreadsheet ss;
    @Wire
    private Doublebox liquidBox;
    @Wire
    private Doublebox fundBox;
    @Wire
    private Doublebox fixedBox;
    @Wire
    private Doublebox intangibleBox;
    @Wire
    private Doublebox otherBox;
    
    //initialize doublebox

    @Listen("onChange = doublebox")
    public void update() {
        updateAssetsBean();
        //notify spreadsheet about the bean's change
        Ranges.range(ss.getSelectedSheet()).notifyChange(new String[] {"assetsBean"} );
    }

    /**
     * load user input to the bean.
     */
    private void updateAssetsBean() {
        AssetsBean assetsBean = (AssetsBean)MyBeanService.getMyBeanService().get("assetsBean");
        assetsBean.setLiquidAssets(liquidBox.getValue());
        assetsBean.setFundInvestment(fundBox.getValue());
        assetsBean.setFixedAssets(fixedBox.getValue());
        assetsBean.setIntangibleAsset(intangibleBox.getValue());
        assetsBean.setOtherAssets(otherBox.getValue());
        
    }   
}
{% endhighlight %}

  - Line 22: Notify whole book of one or more beans' change, all cells
    of whole book associated with changed bean will be updated.
  - Line 29: Get the bean via `MyBeanService` as we do in
    `MyBeanResolver`.

# References

1.  *Defined Names* is a name that represents a cell, range of cells,
    formula, or constant value.
