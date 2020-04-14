---
title: 'Using Official Version'
---
To use official version, you need to
1. Download JARs from the premium repository
2. Apply a license key

# Configure and Download from The Premium Repository
Specify the repositories for *Keikai EE* and *ZK EE* like this [pom.xml](https://github.com/keikai/dev-ref/blob/master/pom.xml)

## Login Information
The premium repository requires authentication. Licensed customers will be given a set of user name and password upon your request. According to [the official Maven doc](https://maven.apache.org/settings.html), you can specify login information in one of the following locations: (if not existed, you can create it manually)
* The Maven install: `$M2_HOME/conf/settings.xml`
* A user's install: `${user.home}/.m2/settings.xml`

For example:
```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
        http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <servers>
        <server>
            <id>Keikai EE</id><!-- Same as your repository ID -->
            <username>your-username</username> 
            <password>your-password</password> 
        </server>    
        <server>
            <id>ZK EE</id>
            <username>your-username</username> 
            <password>your-password</password> 
        </server>
    </servers>
</settings>
```


# Applying a License Key
If you are a paying Keikai EE customer, you will obtain a license key after completing the purchase. Follow this section to apply the given license key to activate your Keikai EE component. There are 3 ways to apply a license key: Use Default License Loading Path; Specify an Absolute Path with a Library Property; and Specify the Path in a System Property. 

The first approach below **Use Default License Loading Path** is the easiest approach. However if your setup does not allow the first approach, use the 2nd or 3rd approach.

## Use Default License Loading Path

Keikai loads a license file from the default path:

**`WEB-INF/classes/metainfo/keikai/license/`**

Create the path above if it does not exist, and put the license key into
the path. This is the simplest way if you just have one keikai-based web
application.

## Specify an Absolute Path with a Library Property

Some application servers like Weblogic could fail to locate the license
file in the default path. Then you can specify the absolute path of the
license with the following library property in `zk.xml` and copy your
Keikai license file there.

{% highlight xml linenos %}
<library-property>
    <name>io.keikaiex.rt.Runtime.directory</name>
    <value>c:/systemAbsolutePath/my-licenses/</value>
</library-property>
{% endhighlight %}

It's also a way that multiple Keikai-based applications can load the same license file.

## Specify the Path in a System Property

Because `Library.getProperty()` will look for a system property if no
corresponding property defined in `zk.xml`, you can also pass the
license file path to Keikai via a system property.

For example in a Tomcat, you can add a `setenv.sh` (or `setenv.bat`) that contains

```
export CATALINA_OPTS="$CATALINA_OPTS -Dio.keikaiex.rt.Runtime.directory=/absolutePathToYourLicenseFilePath/"
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

```
INFO: 
*** Potix Corporation License Information ***

     Licensed Company: test1
     Certificate Number: KKEE12345       
     Licensed Product: Keikai Spreadsheet EE
     Maximum Licensed Number: 1 Developer
     Expiry Date: January 02, 2020


     To renew, obtain more licenses, or if you require help, please contact info@keikai.io.
```


# Evaluation
If you are running an evaluation release of keikai, you will see the warning message below in a log or console when a server starts up:

```
SEVERE: This is an evaluation copy of Keikai Spreadsheet EE and will terminate after maximum 12 hours UPTIME or sixty days from the first date of installation. Should you require a commercial license for Keikai Spreadsheet EE please contact us at info@keikai.io for more information. Alternatively you can download Keikai Spreadsheet(OSE) which is licensed under the GPL.
Dec 31, 2019 10:16:11 AM org.zkoss.zkex.init.WebAppInit init
SEVERE: This is an evaluation copy of ZK PE and will terminate after sixty days from the first date of installation. Should you require an open source license or commercial license for ZK PE please contact us at info@zkoss.org for more information. Alternatively you can download ZK CE which is licensed under the LGPL.
Dec 31, 2019 10:16:11 AM org.zkoss.chart.init.WebAppInit init
SEVERE: This is an evaluation copy of ZK Charts and will terminate after maximum 12 hours UPTIME or sixty days from the first date of installation. Should you require a commercial license for ZK Charts, please contact us at info@zkoss.org for more information.
```

When keikai application runs over the time limit, a browser will show a warning dialog when you visit a page with keikai.

## Extend Evaluation Period
If you have special need to extend the evaluation time, please contact us via info@keikai.io.
