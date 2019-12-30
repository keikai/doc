
# Start with Keikai JSF Example Project

If you want to run Keikai spreadsheet JSF demo in your local site, just
<https://github.com/zkoss/zssjsfdemo> and run it in your environment.

## How to Run

<https://maven.apache.org/download.cgi>, then start the project in a
jetty server with the command:

` mvn jetty:run`

Then, visit <http://localhost:8080/zssjsfdemo>
<http://localhost:8080/zssjsfdemo> with a browser

# Create and Run a JSF Project

The following sections tell you how to prepare an environment for
working with Spreadsheet in JSF.

## Prerequisites

Before developing a web application with Spreadsheet, you should prepare
the following softwares:

  - Install
    <http://www.oracle.com/technetwork/java/javase/downloads/index.html>
    1.5 or above
  - Install an application server
      - You can install any Java web server you like. If you don't have
        one, <http://tomcat.apache.org> is a good choice.
  - Install a development tool.
      - In this book, we will use <http://www.eclipse.org/downloads> as
        the default IDE to explain related setup.

## Prepare a Project

To develop a web application in Eclipse, you can use a **dynamic web
project** or a **maven project**. We will describe steps to create these
two kind of project respectively.

### Steps to Prepare an Eclipse Dynamic Web Project

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

<!-- end list -->

``` xml
<!-- JSF mapping -->
    <servlet>
        <servlet-name>Faces Servlet</servlet-name>
        <servlet-class>javax.faces.webapp.FacesServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>
 
    <!-- Map these files with JSF -->
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

### Steps to Prepare a Maven Project

  -   
    1\. Create a Maven project.
      -   
        You should set packaging to **war**.

<!-- end list -->

  -   
    2\. Setup Maven dependency.
      -   
        First, you should [ setup zk maven
        repository](ZK_Installation_Guide/Setting_up_IDE/Maven/Use_ZK_Maven_Artifacts/Resolving_ZK_Framework_Artifacts_via_Maven#Add_to_your_Maven_projects "wikilink")
        to use "EE Evaluation" or "EE". Notice that different editions
        are available at different repositories, and EE [ requires
        authentication](ZK_Installation_Guide/Setting_up_IDE/Maven/Use_ZK_Maven_Artifacts/Resolving_ZK_Framework_Artifacts_via_Maven#Login_authentication "wikilink").

<!-- end list -->

  - 
    
      -   
        Because this feature is only available in EE, you should add
        following dependencies:

<!-- end list -->

``` xml
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

        <!-- ZK -->
        <dependency>
            <groupId>io.keikai</groupId>
            <artifactId>zssex</artifactId>
            <version>${zss.version}</version>
        </dependency>
        <dependency>
            <groupId>io.keikai</groupId>
            <artifactId>zssjsf</artifactId>
            <version>${zss.version}</version>
        </dependency> 
```

  - You can browser ZK maven repository to know available Keikai version.

<!-- end list -->

  - 
    
      -   
        You can reference the pom.xml in our example project to verify
        your own pom.xml.

<!-- end list -->

  -   
    3\. Set up web.xml
      -   
        1\. Please refer to [Sample of
        web.xml](ZK_Installation_Guide/ZK_Background/Sample_of_web.xml "wikilink").
        2\. Add servlet mapping for JSF:

<!-- end list -->

``` xml
<!-- JSF mapping -->
    <servlet>
        <servlet-name>Faces Servlet</servlet-name>
        <servlet-class>javax.faces.webapp.FacesServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>
 
    <!-- Map these files with JSF -->
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

### Trouble Shooting

If you have problem switching from the evaluation repository to the
licensed one, please check
<http://books.zkoss.org/wiki/ZK_Installation_Guide/Setting_up_IDE/Maven/Resolving_ZK_Framework_Artifacts_via_Maven#Trouble_Shooting>.

## Verify Your Project

After completing the above steps, preparation for working with
Spreadsheet and JSP is done. You can use a simple page to verify your
preparation. Steps are as follows:

1.  Create a simple Excel file or use the sample file in our example
    project. Put the file under your web application's root folder.
2.  Create `index.xhtml` with content below:

<!-- end list -->

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" http://www.w3.org/1999/xhtml"
    xmlns:zssjsf="http://www.zkoss.org/jsf/zss" http://www.zkoss.org/jsf/zss"
    xmlns:f="http://java.sun.com/jsf/core" http://java.sun.com/jsf/core"
    xmlns:h="http://java.sun.com/jsf/html"> http://java.sun.com/jsf/html">
<h:head>
    <title>Application for Leave</title>
    <zssjsf:head/>
</h:head>
<h:body>
    <h:form>
        <div>
        <zssjsf:spreadsheet id="myzss" 
            src="/hellozss.xlsx"
            width="1024px" height="768px"  
            maxVisibleRows="50" maxVisibleColumns="20"
            showToolbar="true" showFormulabar="true" showContextMenu="true" showSheetbar="true"/>
        </div>
    </h:form>

</h:body>
</html>
```

  - Line 5: Declare a tag name space for Spreadsheet JSF component.
  - Line 10: The head tag generates ZK required JS and CSS.
  - Line 15: Use Spreadsheet JSF tag with prefix you specified
    previously.

Now, deploy the project to your application server and visit
`index.xhtml` to see if you can see the Spreadsheet.
