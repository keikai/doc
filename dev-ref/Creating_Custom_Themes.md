**deprecated since keikai 1.0**

`since 3.5.0`

Keikai spreadsheet is an embeddable component that allow web developers to
use as a building block for easy web page UI construction whilst
delivering the rich functionality of Excel within browsers using pure
Java. Theme is a collection of stylesheets and associated images for the
Keikai spreadsheet component. Stylesheets are the files with extensions of
".css.dsp". Think of them as normal CSS files that could utilize JSP
taglib functionality. Associated images all have file extensions either
of ".gif" or ".png". Please refer to the subsections for the process of
creating custom themes and packaging them inside jar files

# Create a theme project skeleton

The general idea is described in the introductory paragraph. Since
classic \[1\] <https://github.com/zkoss/zssthemes/releases>\]</ref> is
the official example theme, web developers could simply clone the
classic\[2\] project, and use it as a starting point.

# Modify the theme resources

Now it is just a matter of modifying the relevant stylesheets and
importing associated image files.

Instead of creating a theme project from scratch, it is easier to use
one of the existing standard themes as a template.

Setting up the environment:

1.  Clone classic theme \[3\] from github, if haven't done so.
2.  Import Classic as an Existing Maven Project into Eclipse.
3.  Rename all the file names and folder names that contains the word
    *classic* to the theme name of your choice
4.  Unpack the generated archive to replace the content originally
    inside the folder **src/archive/web/classic/js/zss**

Next, the new theme will need to be registered first before it could be
used by the Keikai spreadsheet application. For archive-based themes, this
is done by providing an implementation of the
<javadoc type="interface">org.zkoss.zk.ui.util.WebAppInit</javadoc>
interface.

**`Note:`**` the registered name should match the folder name.`

For example, assume the custom theme is named **darkstar**,

``` java numberLines
package foo;
import io.keikai.theme.SpreadsheetThemes;

public class DarkstarThemeWebAppInit implements WebAppInit {
    @Override
    public void init(WebApp webapp) throws Exception {
        SpreadsheetThemes.register("darkstar");
    }
}
```

Also, make sure that **metainfo/zk/config.xml** contains the following
configuration.

``` xml
<config>
...
    <listener>
        <listener-class>foo.DarkstarThemeWebInit</listner-class>
    </listener>
...
</config>
```

Now, the Keikai spreadsheet style modifications shall begin. You can change
the style in **src/archive/web/classic/js/zss/css/ss.css.dsp**, for
example, change selection's border color:

``` css numberLines
.zsselect {
    ...
    border: 3px solid #123456;
}
```

# Use a Theme

Using a archive-based theme in a Keikai spreadsheet Application is simple.
Simply put the theme jar file inside the **WEB-INF/lib** folder of your
Keikai spreadsheet application. During the startup of your application, the
new custom theme would be automatically registered, and available to
use.

The process can be summarized as follows:

1.  Put the theme jar file inside **WEB-INF/lib** folder
2.  Ready to use

# Switching Themes

Standard theme resolution checks the theme settings in the following
order.

1.  Cookies
2.  Library property
3.  Theme priority

## Dynamically switching themes using Cookies

``` java
SpreadsheetThemes.setTheme(Executions.getCurrent(), "custom");
Executions.sendRedirect(null);
```

**Note**: IE8 does not support this approach.

## Dynamically switching themes using Library Property

Library property could be used to assign a preferred theme when the
current theme setting could not be obtained from Cookies.

**Programmatically:**

``` java
Library.setProperty("io.keikai.theme.preferred", "custom");
Executions.sendRedirect(null);
```

**Declaratively:** in (**WEB-INF/zk.xml**)

``` xml
<library-property>
    <name>io.keikai.theme.preferred</name>
    <value>custom</value>
</library-property>
```

# References


1.  Classic Theme[1](https://github.com/zkoss/zssthemes/releases)

