---
title: 'Customize Dialogs'
---
Sometimes you might want to limit the features presented in a built-in dialog, e.g. hide some format categories or remove some validation types. Here we explain how to customize built-in dialogs, e.g. Format Cells, Data Validation...etc. 


# Overview

Each dialog has 2 parts: View and Controller. You can find their source in the following path:

* Controller: `io.keikaiex.ui.dialog.*`
* View: `keikai-ex.jar/web/zssex/dlg/*.zul`


## Invoking Process

Keikai --> `UserActionHandler` ----call----> Dialog Controller --load--> dialog zul


For example:

`DataValidationHandler` calls `DataValidationCtrl`:
```java
    @Override
	protected void showValidationDialog(final UserActionContext ctx,
			final Sheet sheet, final AreaRef selection,
			final List<Validation> validations) {
		
		...
		DataValidationCtrl.show(...);
```

`DataValidationCtrl` loads a dialog zul:
```java
    public static void show(EventListener<DialogCallbackEvent> callback, Validation validation, Spreadsheet ss) {
        ...
        Window comp = (Window)Executions.createComponents(URI, (Component)null, arg);
        comp.doModal();
    }
```

# How to Customize

Base on the architecture, the overall steps to show a custom dialog are:

1. create a custom `UserActionHandler` and replace the existing one by `UserActionManager.setHandler()`.
2. In your custom `UserActionHandler`, call your custom dialog Controller to load your custom zul.

You can create these custom classes by extending the existing ones since all their methods and member fields are all protected.
