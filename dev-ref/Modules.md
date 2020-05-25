---
title: Modules
---

Keikai are separated into several modules, and each modules is packaged into one jar.

# keikai-ex.jar (required)
If you use Maven, adding this dependency will automatically includes the following keikai dependancies:

* keikai.jar
* keikai-model.jar
* keikai-poiex.jar
* keikai-poi.jar

You can check a project's dependencies by the goal: `dependency:tree`

# keikai-pdf.jar (optional)
If you need to export sheets into a PDF file, you need to include this dependency.

# keikai-jsp.jar (optional)
If you need to use Keikai in a JSP, you need to include this dependency.


# keikai-jsf.jar (optional)
If you need to use Keikai in a JSF page, you need to include this dependency.