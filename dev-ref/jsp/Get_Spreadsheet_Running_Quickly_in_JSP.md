---
title: 'Quick Start in JSP'
---

# Quick Start - Keikai JSP Demo Project
To get started easily, we suggest you to run [the example project](https://github.com/keikai/dev-ref) locally. Then visit http://localhost:8080/dev-ref/jsp/index.jsp


# Create a Keikai JSP Project from Scratch

We suggest you to start your project based on our example project. That will save you the setup effort.

The following sections tell you how to start a project from the scratch
to work with Spreadsheet in JSP.

## Prerequisites

Before developing a web application with Spreadsheet, you should install
the following softwares:

  - Java 1.8 or later
  - a Java application server like [Tomcat](http://tomcat.apache.org)
  - a development tool


## With Maven
   
### Setup a repository.
According to the edition (OSS, Evaluation, EE) you want to include, you need to setup different repositories, please refer to [setup zk maven
    repository](https://www.zkoss.org/wiki/ZK_Installation_Guide/Setting_up_IDE/Maven/Resolving_ZK_Framework_Artifacts_via_Maven#Add_to_your_Maven_projects).
### add the dependency

``` xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>keikai-jsp</artifactId>
    <version>${keikai.version}</version>
</dependency> 
```
 You can browser our maven repository to know available `keikai.version`.
### Setup web.xml.
Please refer to [Sample of web.xml](https://www.zkoss.org/wiki/ZK%20Installation%20Guide/ZK%20Background).


## With Your IDE
If your projec doesn't use any dependency management tool, you have to download Keikai jar manually and put jar into your project classpath.
If you have to create a project by your own, you can follow the steps
below:

1.  [Download Keikai binary release](https://keikai.io/download)
2. Put all keikai related jar including **keikai-jsp.jar** into your project's classpath
3. Setup web.xml.
Please refer to [Sample of web.xml](https://www.zkoss.org/wiki/ZK%20Installation%20Guide/ZK%20Background).

## Trouble Shooting

If you have problem in switching from the evaluation repository to the
licensed one, please check
[Trouble_Shooting](http://books.zkoss.org/wiki/ZK_Installation_Guide/Setting_up_IDE/Maven/Resolving_ZK_Framework_Artifacts_via_Maven#Trouble_Shooting).

## Verify Your Project

After completing above steps, preparation for working with Spreadsheet
and JSP is done. You can use a simple page to verify your preparation.
Steps are as follows:

1.  Create a simple Excel file or use the sample file in our example
    project. Put the file under your web application's root folder.
2.  Create `index.jsp` with content below:


{% highlight java linenos %}
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib prefix="kkjsp" uri="http://www.keikai.io/jsp/kk"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <title>Application for Leave</title>
        <kkjsp:head/>
    </head>
<body>
    <div>
        <kkjsp:spreadsheet id="myzss" src="/WEB-INF/books/application_for_leave.xlsx" 
        width="1024px" height="768px" 
        maxVisibleRows="100" maxVisibleColumns="20"
        showToolbar="true" showFormulabar="true" showContextMenu="true" showSheetbar="true" showSheetTabContextMenu="true"/>
    </div>
</body>
</html>
{% endhighlight %}

  - Line 2: Declare a taglib before using Spreadsheet JSP tag is
    necessary.
  - Line 8: The head tag generates required JS and CSS.
  - Line 12: Use spreadsheet JSP tag with prefix you specified in
    taglib.

Now, deploy the project to your application server and visit `index.jsp` to see if you can see the Spreadsheet.
