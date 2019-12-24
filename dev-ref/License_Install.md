---
title: 'Applying License Key'
---

If you are a paying Keikai EE customer, you will obtain a license key after completing the purchase. Follow this section to apply the given license key to activate your Keikai EE component. There are 3 ways to apply a license key: Use Default License Loading Path; Specify an Absolute Path with a Library Property; and Specify the Path in a System Property. 

The first approach below **Use Default License Loading Path** is the easiest approach. However if your setup does not allow the first approach, use the 2nd or 3rd approach.

# Use Default License Loading Path

Keikai loads a license file from the default path:

**`WEB-INF/classes/metainfo/keikai/license/`**

Create the path above if it does not exist, and put the license key into
the path. This is the simplest way if you just have one keikai-based web
application.

# Specify an Absolute Path with a Library Property

Some application servers like Weblogic could fail to locate the license
file in the default path. Then you can specify the absolute path of the
license with the following library property in `zk.xml` and copy your
Keikai license file there.

{% highlight java linenos %}
<library-property>
    <name>io.keikait.Runtime.directory</name>
    <value>c:/systemAbsolutePath/my-licenses/</value>
</library-property>
{% endhighlight %}

It's also a way that multiple Keikai-bases applications can load the same
license file.

# Specify the Path in a System Property

Because
`Library.getProperty()` will look for a system property if no
corresponding property defined in `zk.xml`, you can also pass the
license file path to Keikai via a system property.

For example in a Tomcat, you can add a `setenv.sh` (or `setenv.bat`)
that contains

```
export CATALINA_OPTS="$CATALINA_OPTS -Dio.keikait.Runtime.directory=/absolutePathToYourLicenseFilePath/"
```

Tomcat `catalina.sh` will invoke this script if exists.

Refer to your application server's documentation to set a system
property. In conclusion, you can pass the path in any way that can be
retrieved by Java's `System.getProperty()`, e.g. a system variable in
Windows.

# License Information

If the license key is loaded successfully, you should see the license
information like below printed in your application server's console when
the server starts like:

{% highlight java linenos %}
*** Potix Corporation License Information ***

     Licensed Company: my company
     Certificate Number: 123456       
     Licensed Product: Keikai spreadsheet EE
     ...

     To renew, obtain more licenses, or if you require help, please contact info@zkoss.org.
{% endhighlight %}
