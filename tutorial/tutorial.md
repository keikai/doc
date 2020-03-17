---
title: 'Keikai Tutorial'
permalink: /tutorial
---

# Overview
 [Keikai](https://keikai.io/) is an embeddable Java Web spreadsheet component that delivers Excel-like functionalities to your Web application. It has an UI similar to Excel including a main sheet canvas, a toolbar, a formula bar, and sheet tabs and provides commonly used features such as editing text and styles, merging and sorting cells; and inserting, deleting, and freezing rows and columns. In addition Keikai provides built-in Excel formulas and allows you to plugin your own functions.

You can import your xlsx file into Keikai and edit the file within your browser. You can also populate data from your database or data source to Keikai and save it back to DB after editing. You can call versatile Java APIs to control and configure Keikai and seamlessly integrate it with your backend system. Besides, you can listen to events triggered by user actions like clicking a cell or selecting a sheet, and then implement your application logic in an event listener.

Keikai is the easiest way to bring in spreadsheet power to your Web applications!

# Quick Start
If you are new to Keikai, follow this section to get started. 

Just clone the [tutorial project](https://github.com/keikai/keikai-tutorial) and follow the instructions in readme.md to start up the project with Jetty. Depending on your OS and whether you have Maven installed or not, the command varies. After it is successfully started, you can start to experience Keikai in your browser.
We take the tutorial project to introduce 2 most common use cases: 
* [Online Editor](https://doc.keikai.io/tutorial/editor)
* [Work with Database](https://doc.keikai.io/tutorial/database).

# Setup for Maven
If you wish to create your own Maven project instead of using the tutorial project, follow this section. Depending on the Keikai edition (EE or OSE) you wish to run, there are 2 different settings:


## Enterprise Edition (EE-Eval and EE)
Add the repositories below:
```xml
<repository>
    <id>Keikai EVAL</id>
    <name>Keikai Evaluation Repository</name>
    <url>https://mavensync.zkoss.org/eval</url>
</repository>
<repository>
    <id>Keikai EE</id>
    <name>Keikai EE Repository</name>
    <url>https://maven.zkoss.org/repo/keikai/ee/</url> // paid customers only, credentials required
</repository>
```

Include the artifact below:
```xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>keikai-ex</artifactId>
    <version>${keikai.version}</version>
</dependency>
```
Please browse the repository to see the latest available version and specify it. 

For evaluation version, the version string is appended with `-Eval` e.g. `5.1.1-Eval`.

For official (paid) EE version, the version string contains version number only e.g. `5.1.1`.


## Open Source Edition (OSE)
Add the repository below:
```xml
<repository>
    <id>OSE</id>
    <name>Keikai OSE</name>
    <url>http://mavensync.zkoss.org/maven2</url>
</repository>
```

Include the artifact below:

```xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>keikai-oss</artifactId>
    <version>5.0.0</version>
</dependency>
```
