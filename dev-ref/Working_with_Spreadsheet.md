

Just like other ZK components, you can control Spreadsheet via its APIs
programmatically and register event listeners to act on specific events
in order to perform customized business logic. Besides that, its model
classes (`io.keikai.api.model.Book` and `io.keikai.api.model.Sheet`)
and utility classes (`io.keikai.api.Ranges` and `io.keikai.api.Range`) can be used
to change Spreadsheet's book model and the UI will be updated
automatically. With above API, you can customize Spreadsheet furthermore
upon your requirement. Besides, you can create your own customized
functions in Java and use them as other built-in functions.

In addition to run a standalone Spreadsheet, you can also integrate
Spreadsheet with your back-end server databases and resources easily.
Moreover, You can make cells reference to another Spreadsheet's data
model, the back-end JavaBeans, and Spring-managed beans. So, any changes
on the back-end data will automatically reflect on Spreadsheet.

In the following sections, we will show you the capability of
Spreadsheet API under ZK framework including how to control the
Spreadsheet component, how to register event listeners, and how to hande
Spreadsheet data model. Actually, those APIs about handling data model
can also be used in JSP and JSF.
