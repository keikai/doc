# Overview

Here we list all available [ library
properties](ZK_Configuration_Reference/zk.xml/The_library-property_Element "wikilink")
of Spreadsheet.

## Chart's Font

For default font might not display your language properly, Spreadsheet
allows you to specify fonts used in charts. There are 3 parts of a chart
you can specify its font: **title, legend**, and **x axis tick**. Each
part has a corresponding library property that you can specify its
**name, style**, and **size** in `zk.xml`. Once you put the
configuration, it affects to all charts of the whole application.

**Example configuration in zk.xml**

``` xml
<library-property>
    <name>io.keikai.chart.title.font</name>
    <value>sansserif, italic, 30</value>
</library-property>
```

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

``` text
[NAME], [STYLE], [SIZE]
```

  - \[NAME\] : Those font names your system supports.
  - \[STYLE\] : **plain**, **bold**, **italic**
  - If you specify a incorrect format in the property value, the
    property will be ignored.

## Color Picker

Users can set a library property, `io.keikai.useColorPickerEx`, in
`zk.xml` to specify which color picker used in the whole application.
This property only works under Spreadsheet EE. The default value is
**`true`**, and Spreadsheet uses ColorPicker of EE. If it's `false`,
Spreadsheet uses OSE's ColorPicker.

ColorPicker of EE:<br/> <center>![
center](/assets/images/dev-ref/Keikai-essentials-configuration-colorPickerEE.JPG " center")</center>

ColorPicker of OSE (fewer color choices):<br/> <center>![
center](/assets/images/dev-ref/Keikai-essentials-configuration-colorPickerCE.JPG " center")</center>

**Example in zk.xml**

``` xml
<library-property>
    <name>io.keikai.colorPickerExUsed</name>
    <value>false</value>
</library-property>
```

  - The configuration above will make Spreadsheet use Color Picker of
    CE.

## Preferred Theme

`since 3.5.0`

Currently, Keikai provides the following different themes: **Default**
(built-in theme) and **Classic** from
<https://github.com/zkoss/zssthemes/releases>

![ left | thumb | 300px | Default](/assets/images/dev-ref/skyline-look-and-feel.png
" left | thumb | 300px | Default") ![ left | thumb | 300px |
Classic](/assets/images/dev-ref/classic-look-and-feel.png " left | thumb | 300px | Classic")

<div style="clear: both">

</div>

Library property could be used to assign a preferred theme which is
registered.

**Example in zk.xml**

``` xml
<library-property>
    <name>io.keikai.theme.preferred</name>
    <value>classic</value>
</library-property>
```

## Importing Formula Cache

` since 3.7`

Default value: **false**

Set the property to `true` and Keikai will import formula cache of an Excel
file and it can reduce the file loading time because Keikai doesn't need to
re-evaluate formulas at loading.

``` xml
<library-property>
    <name>io.keikai.import.cache</name>
    <value>true</value> <!-- turn the import cache on; default is false if not specified -->
</library-property>
```

Few points need to be noticed:

1.  If some functions not yet supported by Keikai spreadsheet are used in a
    formula, re-evaluation breaks the cached value even if precedent
    cells do not change.
2.  If some customized function **only** supported in Keikai spreadsheet are
    used in a formula, a cache is always `#NAME!` error. Users must
    enforce re-evaluation by calling `Range.refresh(true, true, true)`.

## Keep Cell Selection

` since 3.8.1`

Default value: **true**

Set the property to `false` and Keikai will set default value of
*keepCellSelection* attribute to false. Before version 3.8.1, when ZK
Spreadsheet component loses its focus, it will hide the cell selection
mark automatically. However, sometimes an end user would need to know
which range is selected when he/she is operating on another control
component (e.g. a dialog window). We have set the default value of
`keepCellSelection` to true to avoid the confusion. However, if you
would like Keikai to behavior as before version 3.8.1, you can set this
property to `false`.

``` xml
<library-property>
    <name>io.keikai.ui.keepCellSelection</name>
    <value>false</value> <!-- turn the keep-cell-selection off; default is true if not specified -->
</library-property>
```
