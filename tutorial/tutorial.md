---
title: 'Keikai Tutorial'
permalink: /tutorial
---

# Overview
 [Keikai](https://keikai.io/) is an embeddable Java Web spreadsheet component that delivers Excel-like functionalities to your Web application. It has an UI similar to Excel including a main sheet canvas, a toolbar, a formula bar, and sheet tabs and provides commonly used features such as editing text and styles, merging and sorting cells; and inserting, deleting, and freezing rows and columns. In addition Keikai provides built-in Excel formulas and allows you to plugin your own functions.

You can import your xlsx file into Keikai and edit the file within your browser. You can also populate data from your database or data source to Keikai and save it back to DB after editing. You can call versatile Java APIs to control and configure Keikai and seamlessly integrate it with your backend system. Besides, you can listen to events triggered by user actions like clicking a cell or selecting a sheet, and then implement your application logic in an event listener.

Keikai is the easiest way to bring in spreadsheet power to your Web applications!

# Architecture

**Overview** 

![]({{site.devref_image_folder}}/Essentials-app-architecture.png)

**More Details** 

![]({{site.devref_image_folder}}/Essentials-architecture.png)

Keikai spreadsheet component consists of three major parts -- the
client-side UI , the server-side component, and the book data model with
the formula evaluation engine. The UI is a grid like widget that you can
in-place edit the content of each cell. The component is a server-side
Java object which your controller usually works with. The book data model stores
the whole Spreadsheet's data. The formula evaluation engine is
responsible for formula parsing and calculations.


# Quick Start

Clone/Run [Tutorial project](https://github.com/keikai/keikai-tutorial){: .btn .btn--info .btn--large}

Follow the instructions in readme.md to start up the project with Jetty. Depending on your OS and whether you have Maven installed or not, the command varies. After it is successfully started, you can start to experience Keikai in your browser.
We take the tutorial project to introduce 2 most common use cases: 
* [Online Editor](https://doc.keikai.io/tutorial/editor)
* [Work with Database](https://doc.keikai.io/tutorial/database)


# Setup for Maven
If you wish to create your own Maven project instead of using the tutorial project, follow this section. Depending on the Keikai edition (EE or OSE) you wish to run, there are 2 different settings:


## Enterprise Edition (EE-Eval and EE)
Evaluation release has the same features as enterprise edition (EE), but it has a start-up time limit.
Add the repositories below:

### Evaluation
```xml
<repository>
    <id>Keikai EVAL</id>
    <name>Keikai Evaluation Repository</name>
    <url>https://mavensync.zkoss.org/eval</url>
</repository>
```

### Official
```xml
<repository>
    <!-- paid customers only, credentials required -->
    <id>Keikai EE</id>
    <name>Keikai EE Repository</name>
    <url>https://maven.zkoss.org/repo/keikai/ee/</url>
</repository>
<repository>
    <!-- paid customers only, credentials required -->
    <id>ZK EE</id>
    <url>https://maven.zkoss.org/repo/zk/ee</url>
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
Please browse the repository ([Eval](https://mavensync.zkoss.org/eval/io/keikai/keikai-ex/) or [EE](https://maven.zkoss.org/repo/keikai/ee/io/keikai/keikai-ex/)) to see the latest available version and specify it. 

For evaluation version, the version string is appended with `-Eval` e.g. `5.11.0-Eval`.

For official (paid) EE version, the version string contains version number only e.g. `5.11.0`.


## Open Source Edition (OSE)
This edition provides fewer features than enterprise edition.

Add the repository below:
```xml
<repository>
    <id>OSE</id>
    <name>Keikai OSE</name>
    <url>https://mavensync.zkoss.org/maven2</url>
</repository>
```

Include the artifact below with [the available versions in the repo](https://mavensync.zkoss.org/maven2/io/keikai/keikai-oss/):

```xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>keikai-oss</artifactId>
    <version>5.0.0</version>
</dependency>
```

### Work with ZK 8.5 or Later
Since ZK 8.5.0, the default theme is **iceblue** which is not supported by Keikai OSE. You have to manually switch to one of the classic themes (**breeze, sapphire, silvertail**) with the following steps:

1.Add a classic theme jar <br/>
In `pom.xml`:

```xml
<dependency>
    <groupId>org.zkoss.theme</groupId>
    <artifactId>breeze</artifactId>
    <version>${zk.version}</version>
</dependency>
```

2.Specify preferred theme<br/>
In `zk.xml`

```xml
<library-property>
    <name>org.zkoss.theme.preferred</name>
    <value>breeze</value>
</library-property>
```

# JDK Option
JDK 8 uses `JRE` as the default locale provider, whereas in JDK 9 onwards `CLDR` is the default locale provider. (see [JEP 252: Use CLDR Locale Data by Default](http://openjdk.java.net/jeps/252)) Because of the change of the default locale provider, the built-in date formats (e.g. `DateFormat.LONG`) stand for different formats after JDK 9. Since some keikai features (e.g. smart input, number format) rely on Java built-in date formats, this change will make those features work incorrectly. (known issues: [KEIKAI-379](https://tracker.zkoss.org/browse/KEIKAI-379), [KEIKAI-540](https://tracker.zkoss.org/browse/KEIKAI-540))

Hence, if you run keikai with **JDK 9 or above** and please add the following JVM options:

`-Djava.locale.providers=JRE,CLDR`