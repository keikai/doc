---
title: 'Reference to Java Beans'
---

# Overview

When showing data in Spreadsheet from the backend, sometimes using `Range` API to set
values cell by cell could be a tedious task. Hence, Spreadsheet allows
you to use **EL** (Expression Language) in a formula to reference a Java beans.

## How Spreadsheet Resolve a Name

If a string in a formula equals **Defined Name** found in Excel file, Keikai spreadsheet will treat them as what it defines. If not, Keikai Spreadsheet follows ZK's EL expression variable resolving mechanism. It first tries to find any matching zscript variables defined in the ZUL page. Then check ID of ZK fellow components. Then search in ZK components' attribute map. Finally ask variable resolvers defined in the zul page to retrieve the bean with named variable. If none is
still found, it will return `#NAME?` as Excel's original behavior. Once a variable is resolved, Keikai will set the cell value by calling its getter to get a value.

# Usage

Steps to use this feature.

1.  Implement a variable resolver class.
2.  Declare the variable resolver in ZUL pages or in system scope.

Then you can access JavaBeans in a formula, e.g. enter
`=myBean.myProperty` in a cell.

# Example

Assume the application below has a sheet in protection, a user cannot
modify any cells directly in the sheet. They can only update value via
the panel on the right. 

![]({{site.devref_image_folder}}/Essentials-bean.png) 

You can see from the formula bar, the content of B3 is like EL expression without brackets and the dollar sign,
`=assetsBean.liquidAssets`.

First, we implement a variable resolver class. You can refer to [ZK
Developer's Reference/UI Composing/ZUML/EL Expressions\#Variable
Resolver](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/UI_Composing/ZUML/EL_Expressions#Variable_Resolver)
for complete explanation. Our resolver use `MyBeanService` to get a bean
which is a singleton and can be accessed in anywhere.

```java
public class MyBeanResolver implements VariableResolver {

    @Override
    public Object resolveVariable(String name) throws XelException {
        return MyBeanService.getMyBeanService().get(name);
    }
}
```

Declare our `MyBeanResolver` in a ZUL page. (or you could make it a as [system level variable resolver](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/UI_Composing/ZUML/EL_Expressions#System-level_Variable_Resolver)
which can be available in all pages.)

```xml
<?variable-resolver class="io.keikai.essential.advanced.MyBeanResolver"?>
<zk>
    ...
</zk>
```

## When JavaBean Changes

In our example, the sheet is protected. Users can only change value from the panel on the right-hand side. But Spreadsheet won't know the change of a bean unless you notify it. When you notify the Spreadsheet of
changed beans, it will collect which cells are affected (i.e. those dependent cells with the specified bean names), and update them accordingly in a browser.

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


# Limitation
There is no way to reference a Collection bean e.g. a List or an array and populate into multiple cells.

# References

1. **Defined Names** is a name that represents a cell, range of cells,
    formula, or constant value.
