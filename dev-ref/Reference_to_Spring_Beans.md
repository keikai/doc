---
title: 'Reference to Spring Beans'
---

# Overview

Similar to reference to Java Bean, Spreadsheet also allows you to use EL
(Expression Language) in cells and it resolves the name expressions to
Spring beans.

The process of resolving a variable to a Spring bean is the same the one
of resolving to a Java Bean. The difference is when Spreadsheet asks a
variable resolver defined in the zul page to retrieve the bean, we give
it a Spring bean resolver that resolves variables as Spring beans.
Hence, to use the feature is quite simple, just declare a Spring bean
resolver in a ZUL page and use same EL expression as we use in Java
Bean, e.g. enter `=myBean.myProperty`.

# Example

We continue to use the same example in [Reference to Java
Beans](https://www.zkoss.org/wiki/Working_with_Spreadsheet/Advanced/Reference_to_Java_Beans#Example).
Assume the application below has a sheet in protection, a user cannot
modify any cells directly in the sheet. They can only update value via
panel on the right side. 

![center](/assets/images/dev-ref/Essentials-bean.png) 

You can see from the formula bar, the content of B3 is an EL expression,
`=assetsBean.liquidAssets`.

To use Spring bean resolver, there must be some Spring bean defined in
your application. In our example, it's `AssetsBean`:

{% highlight java linenos %}
@Component
@Scope(value="session", proxyMode=ScopedProxyMode.TARGET_CLASS)
public class AssetsBean {
    private double liquidAssets;
    private double fundInvestment;
    private double fixedAssets;
    private double intangibleAsset; 
    private double otherAssets;
...
}
{% endhighlight %}

Declare ZK's `org.zkoss.zkplus.spring.DelegatingVariableResolver` in a
ZUL page. (You can refer to [ZK Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/Integration/Middleware_Layer/Spring#Access_a_Spring_Bean_in_a_ZUL)

{% highlight java linenos %}
<?variable-resolver class="org.zkoss.zkplus.spring.DelegatingVariableResolver"?>
<zk>
    <window hflex="1" vflex="1" 
        apply="io.keikai.essential.advanced.RefSpringBeanComposer">
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

# Example

We continue to use the same example in [Reference to Java
Beans](Reference_to_Java_Beans).
Assume the application below has a sheet in protection, a user cannot
modify any cells directly in the sheet. They can only update value via
panel on the right side. 

![center](/assets/images/dev-ref/Essentials-bean.png) 

You can see from the formula bar, the content of B3 is an EL expression,
`=assetsBean.liquidAssets`.

To use Spring bean resolver, there must be some Spring bean defined in
your application. In our example, it's `AssetsBean`:

{% highlight java linenos %}
@Component
@Scope(value="session", proxyMode=ScopedProxyMode.TARGET_CLASS)
public class AssetsBean {
    private double liquidAssets;
    private double fundInvestment;
    private double fixedAssets;
    private double intangibleAsset; 
    private double otherAssets;
...
}
{% endhighlight %}

Declare ZK's `org.zkoss.zkplus.spring.DelegatingVariableResolver` in a
ZUL page. (You can refer to [ZK Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/Integration/Middleware_Layer/Spring#Access_a_Spring_Bean_in_a_ZUL)
for detail.)

{% highlight java linenos %}
<?variable-resolver class="org.zkoss.zkplus.spring.DelegatingVariableResolver"?>
<zk>
    <window hflex="1" vflex="1" 
            apply="io.keikai.essential.advanced.RefSpringBeanComposer">
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

## When Spring Bean Changes

In our example, the sheet is protected. Users can only change value from
the panel on the right hand side. But Spreadsheet won't know the change
of a bean unless you notify it. When you notify the Spreadsheet of
changed beans, it will collect which cells are affected (i.e. those
dependent cells with the specified bean names), and update them
accordingly.

{% highlight java linenos %}
@VariableResolver(org.zkoss.zkplus.spring.DelegatingVariableResolver.class)
public class RefSpringBeanComposer extends SelectorComposer<Component> {
    
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
    
    @WireVariable
    private AssetsBean assetsBean;
    
    @Override
    public void doAfterCompose(Component comp) throws Exception {
        super.doAfterCompose(comp);
        Ranges.range(ss.getBook().getSheetAt(0)).protectSheet("");
    }

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
        assetsBean.setLiquidAssets(liquidBox.getValue());
        assetsBean.setFundInvestment(fundBox.getValue());
        assetsBean.setFixedAssets(fixedBox.getValue());
        assetsBean.setIntangibleAsset(intangibleBox.getValue());
        assetsBean.setOtherAssets(otherBox.getValue());
        
    }
}
{% endhighlight %}

  - Line 1: [Add a variable resolver](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/Integration/Middleware_Layer/Spring#Adding_Variable_Resolver_to_a_Composer_.28or_ViewModel.29)
    let us get Spring beans with `@WireVariable`.
  - LIne 17: We can easily get a reference to a Spring with
    `@WireVariable`. Please refer to [ZK Developer Reference](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/Integration/Middleware_Layer/Spring#Wire_a_Spring_Bean)
    for detail.
  - Line 30: Notify whole book of one or more beans' change, all cells
    of whole book associated with changed bean will be updated.

