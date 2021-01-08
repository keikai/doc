---
title: 'Embed Keikai'
---

If you have a non-Java EE web application (e.g. a Node.js application) and intend to include Keikai into your application, there are 2 ways:

# Using iframe
Just point to a zul with keikai in an HTML like:

```html
<iframe src="https://myserver/keikai.zul">
```

Because an iframe belongs to a different browsing content(window) from its parent page, you need to communicate with spreadsheet by [Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).


# Embed a zul with ZK javascript `zEmbedded`
Call ZK javascript `zEmbedded.load()` for embedding to render the specified zul in an HTML. This approach can render Keikai spreadsheet seamlessly into any HTML page without an iframe. It makes you easier to communicate between the parent HTML page and the embedded Keikai. 

Please see [a stock search use case example](https://github.com/keikai/dev-ref/blob/master/src/main/webapp/useCase/stock-search.html) and [Embed a Spreadsheet into Your Web Application](https://keikai.io/blog/p/embed-a-spreadsheet-into-your-web-app.html).

For usage of `zEmbedded`, please check [ZK Developer's Reference/Integration/Miscellaneous/Embedded ZK Application](https://www.zkoss.org/wiki/ZK_Developer%27s_Reference/Integration/Miscellaneous/Embedded_ZK_Application) for details and example project. Notice that this feature requires ZK EE (zkmax.jar).

