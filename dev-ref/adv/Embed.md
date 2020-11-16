---
title: 'Embed Keikai'
---

If you have a non-Java EE web application (e.g. a Nodejs application) and wish to include Keikai into your application, there are 2 ways:

# 1. Use iframe
Just point to a zul with keikai in an HTML like:

```xml
<iframe src="https://myserver/keikai.zul">
```

# 2. Use ZK embeded javascript API
Call the ZK embeded javascript function to render the specified zul at the client-side. This approach is useful if you wish to trigger an action from Keikai Spreadsheet to your external app, or vice versa. Please [check ZK docs](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/Integration/Miscellenous/Embedded_ZK_Application) for details and example project.
