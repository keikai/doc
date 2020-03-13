If you want to run Keikai spreadsheet JSF demo in your local site, just
[check out the example project]({{site.devref}}/Download_Example_Source_Code) and follow its readme to run it in your environment.


# Prerequisites
To understand this article, we assume you have know JSF and Java EE basic and have installed all required softwares to run an Java web application.


# Start with a Maven Project
The following sections tell you how to setup a Maven project for working with Keikai in JSF.

## pom.xml
Please create a Maven project by referencing [the sample pom.xml](https://github.com/keikai/dev-ref/blob/master/pom.xml) which can save you lots of effort.


``` xml
<!-- keikai -->
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>keikai-jsf</artifactId>
    <version>${keikai.version}</version>
</dependency> 

<!-- JSF -->
<dependency>
    <groupId>com.sun.faces</groupId>
    <artifactId>jsf-api</artifactId>
    <version>${jsf-api.version}</version>
</dependency> 
<dependency>
    <groupId>com.sun.faces</groupId>
    <artifactId>jsf-impl</artifactId>
    <version>${jsf-api.version}</version>
</dependency>

```
* You can visit Maven repository with a browser to know available Keikai version.

##  Setup web.xml (optional)
1\. Please refer to [Sample of
web.xml](ZK_Installation_Guide/ZK_Background/Sample_of_web.xml "wikilink").
2\. Add servlet mapping for JSF:


According to [javadoc](https://docs.oracle.com/javaee/7/api/javax/faces/webapp/FacesServlet.html):

>This servlet must automatically be mapped if it is not explicitly mapped in web.xml or web-fragment.xml and one or more of the following conditions are true.
>...
>* A faces-config.xml file is found in the META-INF directory of a jar in the application's classpath.

Because `keikai-jsf.jar` contains a `faces-config.xml`, you don't have to configure `web.xml` like below in most cases.

``` xml
<servlet>
    <servlet-name>Faces Servlet</servlet-name>
    <servlet-class>javax.faces.webapp.FacesServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>Faces Servlet</servlet-name>
    <url-pattern>*.xhtml</url-pattern>
</servlet-mapping>
```

<!--
### Steps to Create a Non-Maven Project

1.  Create a dynamic web project
2.  Install JSF
    1.  <http://javaserverfaces.java.net/download.html>, and file name
        might be `javax.faces-2.1.24.jar`.
    2.  Put the JAR file to **`/WEB-INF/lib`** in your web project.
3.  Install Spreadsheet library
    1.  Download Keikai spreadsheet component (binary). Choose
        <http://www.zkoss.org/download/zkspreadsheet> or licensed EE
        from <http://www.zkoss.org/download/premium>.
          - 
    2.  Extract the zip and copy those JAR files under **`/dist/lib`**
        and **`/dist/lib/ext`** to **`/WEB-INF/lib`** of your web
        project's folder.
          -   
            Make sure **zssjsf.jar** existed in `/WEB-INF/lib`.
4.  Set up web.xml (in **`/WEB-INF`**)
    1.  Please refer to [Sample of
        web.xml](ZK_Installation_Guide/ZK_Background/Sample_of_web.xml "wikilink").
    2.  Add servlet mapping for JSF:



``` xml
    <servlet>
        <servlet-name>Faces Servlet</servlet-name>
        <servlet-class>javax.faces.webapp.FacesServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>
 

    <servlet-mapping>
        <servlet-name>Faces Servlet</servlet-name>
        <url-pattern>/faces/*</url-pattern>
    </servlet-mapping>
    <servlet-mapping>
        <servlet-name>Faces Servlet</servlet-name>
        <url-pattern>*.jsf</url-pattern>
    </servlet-mapping>
    <servlet-mapping>
        <servlet-name>Faces Servlet</servlet-name>
        <url-pattern>*.faces</url-pattern>
    </servlet-mapping>
    <servlet-mapping>
        <servlet-name>Faces Servlet</servlet-name>
        <url-pattern>*.xhtml</url-pattern>
    </servlet-mapping>
```
-->

# Trouble Shooting

If you have problem switching from the evaluation repository to the
premium one, please check
[Trouble_Shooting](http://books.zkoss.org/wiki/ZK_Installation_Guide/Setting_up_IDE/Maven/Resolving_ZK_Framework_Artifacts_via_Maven#Trouble_Shooting).


# Verify Your Project

After completing the above steps, preparation for working with
Keikai and JSF is done. You can copy [this simple page](https://github.com/keikai/dev-ref/blob/master/src/main/webapp/jsf/index.xhtml) to your project. Then, deploy the project to your application server and visit the page to see if you can see Keikai in your browser.
