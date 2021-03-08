---
title: 'Configuration'
---

The library properties below allow you to configure spreadsheet's behaviors. There are other properties for underlying ZK framework, please refer to [ZK Configuration Reference](https://www.zkoss.org/wiki/ZK%20Configuration%20Reference/zk.xml).

# Scope
You can configure a property to apply at various scopes, please read [ZK Configuration Reference](https://www.zkoss.org/wiki/ZK%20Configuration%20Reference/zk.xml/The%20Library%20Properties).


# Formula Cache

## Importing
Default: **false**
{% include property-scope.html page=false%}

Set the property to `true` and Keikai will import formula cache of an Excel
file and it can reduce the file loading time because Keikai doesn't need to
re-evaluate formulas at loading.

```xml
<library-property>
    <name>io.keikai.import.cache</name>
    <value>true</value>
</library-property>
```

Few points need to be noticed:

1.  If some functions not yet supported by Keikai spreadsheet are used in a
    formula, re-evaluation breaks the cached value even if precedent
    cells do not change.
2.  If you use a customized function **only** supported in Keikai spreadsheet in a formula, the cached result is always `#NAME!` error. Application developers must enforce re-evaluation by `Range.refresh(true, true, true)`.

## Exporting
Default value: **false**
{% include property-scope.html page=false%}

Set the property to `true` and Keikai will export the formula cache into an Excel file.
```xml
<library-property>
    <name>io.keikai.export.cache</name>
    <value>true</value> 
</library-property>
```

# Keep Cell Selection

Default value: **true**
{% include property-scope.html page=false%}

If it's `true`, when a dialog pops popup (Keikai loses its focus), Keikai still display cell selection box. Because sometimes an end user would like to know which range is selected when he/she is operating on a popup dialog.

If it's `false`, then Keikai will hide cell selection.

```xml
<library-property>
    <name>io.keikai.ui.keepCellSelection</name>
    <value>false</value>
</library-property>
```

# Add Extra Font Family 
{% include version-badge.html version='5.3.0' %}

Default: **none**
{% include property-scope.html page=false%}

You can add more fonts in font family drop-down of the toolbar by the property:
```xml
<library-property>
    <name>io.keikai.ui.Spreadsheet.customFontFamily</name>
    <value>Roboto, Helvetica Neue</value>
</library-property>
```

Keikai will appends the specified fonts in the drop-down list.


# Show a Blank Cell as a Gap or Zero
{% include version-badge.html version='5.3.0' %}

Default: **false**
{% include property-scope.html %}
When a chart's data source contains a blank cell, you can configure it to display it as a gap or zero.

```xml
<library-property>
    <name>io.keikai.chart.emptyAsGaps</name>
    <value>true</value>
</library-property>
```


<!--
deprecated for using highchart instead of jasper report
## Chart's Font

For default font might not display your language properly, Spreadsheet
allows you to specify fonts used in charts. There are 3 parts of a chart
you can specify its font: **title, legend**, and **x axis tick**. Each
part has a corresponding library property that you can specify its
**name, style**, and **size** in `zk.xml`. Once you put the
configuration, it affects to all charts of the whole application.

**Example configuration in zk.xml**

{% highlight java linenos %}
<library-property>
    <name>io.keikai.chart.title.font</name>
    <value>sansserif, italic, 30</value>
</library-property>
{% endhighlight %}

  - The above configuration sets title font to italic SansSerif with
    size 30.

Available property names:

<table>
<thead>
<tr class="header">
<th><p><strong>Name</strong></p></th>
<th><p><strong>Which font in chart</strong></p></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>io.keikai.chart.title.font</p></td>
<td><center>
<p>title font</p>
</center></td>
</tr>
<tr class="even">
<td><p>io.keikai.chart.legend.font</p></td>
<td><center>
<p>legend font</p>
</center></td>
</tr>
<tr class="odd">
<td><p>io.keikai.chart.xAxisTick.font</p></td>
<td><center>
<p>x axis tick font</p>
</center></td>
</tr>
</tbody>
</table>

Value's format:

{% highlight java linenos %}
[NAME], [STYLE], [SIZE]
{% endhighlight %}

  - \[NAME\] : Those font names your system supports.
  - \[STYLE\] : **plain**, **bold**, **italic**
  - If you specify a incorrect format in the property value, the
    property will be ignored.

# Color Picker

Users can set a library property, `io.keikai.useColorPickerEx`, in
`zk.xml` to specify which color picker used in the whole application.
This property only works under Spreadsheet EE. The default value is
**`true`**, and Spreadsheet uses ColorPicker of EE. If it's `false`,
Spreadsheet uses OSE's ColorPicker.

ColorPicker of EE:<br/> ![center]({{site.devref_image_folder}}/Keikai-essentials-configuration-colorPickerEE.JPG)

ColorPicker of OSE (fewer color choices):<br/> ![center]({{site.devref_image_folder}}/Keikai-essentials-configuration-colorPickerCE.JPG)

**Example in zk.xml**

{% highlight java linenos %}
<library-property>
    <name>io.keikai.colorPickerExUsed</name>
    <value>false</value>
</library-property>
{% endhighlight %}

  - The configuration above will make Spreadsheet use Color Picker of
    CE.
-->