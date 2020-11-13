---
title: 'Embed Keikai'
---

For those application developers who have a non-Java EE web application (e.g. Nodejs) want to integrate Keikai into your application. There are 2 ways to embed keikai in a non-Java web application:

# 1. iframe
Just point to a zul with keikai in an HTML like:

```xml
<iframe src="https://myserver/keikai.zul">
```

# 2. [ZK embed javascript API](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/Integration/Miscellenous/Embedded_ZK_Application)

Call a javascript function to render the specified zul at the client-side, please check the link for details and example project.
