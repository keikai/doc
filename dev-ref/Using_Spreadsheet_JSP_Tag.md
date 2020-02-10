---
title: 'Use Spreadsheet JSP Tag'
---

# Overview

In this section, we will demonstrate how you can make an HTML element, like a
button, to interact with Keikai spreadsheet in a JSP using AJAX. Since ZK
framework already integrated <http://jquery.com>, we don't have to
include jQuery's JavaScript library again. The following section requires basic JS & jQuery knowledge.

The example is a simple Request For Leave application. A user
fills in the required field in cells and click "OK" button to submit his
request for leave. Or he can clicks "Reset" button to reset what he
inputs to default value. The screenshot below shows a request of a user
"John":

![center]({{site.devref_image_folder}}/Essentials-jsp-app.png)

The application form is created using Keikai Spreadsheet and the two buttons Reset and OK are
just ordinary HTML buttons in a JSP page.

## Interaction between JSP and Spreadsheet

The sequence diagram displays the overall handling process of an AJAX
request when a user clicks a button in app4l.jsp.

![center]({{site.devref_image_folder}}/Essentials-jsp-interaction.png)

The `app4l.jsp` is the main page with the form for leave. The
`ForLeaveServlet` is a servlet we implement for the example to handle
AJAX requests from `app4l.jsp`. `io.keikai.jsp.JsonUpdateBridge`is
a utility class that provides access to ZK desktop and starts an
execution in a foreign AJAX channel. We should access components like
spreadsheet in its `process()` method and it will generate a
corresponding ZK AJAX response for us.

Firstly, `app4l.jsp` sends an AJAX request with required parameter such
as desktop ID, spreadsheet UUID, and application related data to
`ForLeaveServlet`. The servlet extracts necessary parameters to create
`JsonUpdateBridge` object and calls its `process()` to handle the AJAX
request. Then it responds with the JSON object which contains ZK AJAX
response to the client. We can then use a Javascript utility object `zssjsp`
provided by Spreadsheet to process ZK AJAX response and process other
data of the JSON response according to our business logic.

# Using Spreadsheet Tag

Using Spreadsheet JSP tag is like using any other JSP custom tag
library. You have to declare a tag library with `<%@taglib %>` first and
write Spreadsheet JSP tag with a specified prefix.

**app4l.jsp**
{% highlight java linenos %}
<%@page language="java" contentType="text/html; charset=UTF-8" 
    pageEncoding="UTF-8"%>
<%@taglib prefix="zssjsp" uri="http://www.zkoss.org/jsp/zss"%> http://www.zkoss.org/jsp/zss"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" 
    "http://www.w3.org/TR/html4/loose.dtd"> http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <title>Application for Leave</title>
        <zssjsp:head/>
    </head>
<body>
    <div>
        <zssjsp:spreadsheet id="myzss" 
            bookProvider="io.keikai.jspdemo.DemoBookProvider"
            width="800px" height="500px" 
            maxrows="100" maxcolumns="20"
            showToolbar="true" showFormulabar="true" showContextMenu="true"/>
    </div>
    <button id="resetBtn">Reset</button>
    <button id="checkBtn">OK</button>
    ...
</body>
{% endhighlight %}

  - Line 3, 10: Basic steps to use spreadsheet JSP tag.
  - Line 14: A special attribute of spreadsheet JSP tag which should be
    specified as a book provider class name, and we will explain it
    later.

## Book Provider

Line 15 in the previous code sample, app4l.jsp, has a special
attribute which contains a book provider class named
`io.keikai.jspdemo.DemoBookProvider`. The class implements an
interface `io.keikai.jsp.BookProvider` which
is used to load a book model programmatically in JSP or in a servlet.
This provider is called when creating a Spreadsheet in ZK context. The
returned book model will be set to a Spreadsheet.

``` java
public class DemoBookProvider implements BookProvider{

    public Book loadBook(ServletContext servletContext, HttpServletRequest request, HttpServletResponse res) {
        
        Book book;
        try {
            URL bookUrl = servletContext.getResource("/WEB-INF/books/application_for_leave.xlsx");
            book = Importers.getImporter().imports(bookUrl, "app4leave");
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        //initialize the book model
        ...
        return book;
    }
}
```

# Send AJAX Request

The scenario in the example is that the user clicks a button to send an AJAX request, so we have to
bind event listeners on buttons. To send an AJAX request with JQuery in
JSP doesn't require any ZK knowledge, but the servlet needs desktop ID
and spreadsheet's UUID to retrieve a ZK desktop and spreadsheet
component. We can use a Javascript object `zssjsp` provided by
Spreadsheet to get it.

**Javascript in app4l.jsp**

{% highlight java linenos %}
//jq is jquery name in zk
//version 1.12.4 is used in ZK 9
jq(document).ready(function(){
    //register client event on button by jquery api 
    jq("#checkBtn").click(function(){
        postAjax("check");
    });
    jq("#resetBtn").click(function(){
        postAjax("reset");
    });
});

function postAjax(action){
    //get the necessary zk ids form zssjsp[component_id] 
    //'myzss' is the sparedhseet id that you gaved in
    // sparedsheet tag 
    var desktopId = zssjsp['myzss'].desktopId; 
    var zssUuid = zssjsp['myzss'].uuid;
    
    
    /*use jquery api to post ajax to your servlet (in this 
    demo, it is AjaxBookServlet), provide desktop id 
    and spreadsheet uuid to access zk component 
    data in your servlet */
    jq.ajax({url:"app4l",//the servlet url
        data:{desktopId:desktopId,zssUuid:zssUuid,action:action},
        type:'POST',dataType:'json'}).done(handleAjaxResult);
} 
{% endhighlight %}

  - Line 5: The `jq` is a variable that equals to `$` of jQuery
    integrated within ZK.
  - Line 17,18 : Use Javascript object `zssjsp` provided by Spreadsheet
    to get desktop ID and spreadsheet's UUID with spreadsheet's
    component ID, "myzss".
  - Line 25: You can refer to [jQueryAPI](http://api.jquery.com/category/ajax/) for
    details.

# Handle AJAX Request and Response

The `ForLeaveServlet` is a servlet we implement to handle AJAX requests
from app4l.jsp. It extracts necessary parameters from AJAX request to
create `JsonUpdateBridge` object and call its `process()` to handle the
AJAX request. Then responds with a JSON object which contains ZK AJAX
response to the client.

We should override the `JsonUpdateBridge`'s `process()` to implement our
business logic and access spreadsheet component in it. Then
`JsonUpdateBridge` will generate corresponding ZK AJAX response for us.

{% highlight java linenos %}
public class ForLeaveServlet extends HttpServlet{

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        ...
        
        //parameter from ajax request, you have to pass it in AJAX request
        //necessary parameter to get ZK server side desktop
        final String desktopId = req.getParameter("desktopId");
        //necessary parameter to get ZK server side spreadsheet
        final String zssUuid = req.getParameter("zssUuid");
        
        final String action = req.getParameter("action");
        
        // prepare a json result object, it can contain your ajax result and
        // also the necessary zk component update result
        final JSONObject result = new JSONObject();
        // set back for client to check action result, it depends on your logic.
        result.put("action", action);
        
        // use utility class to wrap zk in servlet request and
        // get access and response result
        JsonUpdateBridge bridge = new JsonUpdateBridge(getServletContext(), req, resp,
                desktopId) {
            @Override
            protected void process(Desktop desktop) {
                Spreadsheet ss = (Spreadsheet)desktop.getComponentByUuidIfAny(zssUuid);
                Book book = ss.getBook();
                Sheet sheet = book.getSheetAt(0);
                
                if("reset".equals(action)){
                    handleReset(sheet,result);
                }else if("check".equals(action)){
                    handleCheck(sheet,result);
                }
            }
        };
        
        /*
         * Generate ZK update result in given JSON object. An AJAX response
         * handler at client side, zssjsp, will 'eval' this result to update ZK
         * components.
         */
        bridge.process(result);

        Writer w = resp.getWriter();
        w.append(result.toJSONString());    
    }
...
}
{% endhighlight %}

  - Line 10,12: Get desktop ID and spreadsheet UUID for they will be
    used in `JsonUpdateBridge`
  - Line 27: Override `process()` to implement business logic and access
    components.
  - Line 45: Invoke `JsonUpdateBridge` to handle AJAX request
  - Line 48: Convert result to JSON string and response to client.

## Manipulate Book Model

Inside `JsonUpdateBridge.process()`, you can use those APIs we mentioned
in [Manipulating Book Model](book_model/Manipulating_Book_Model)
to implement your business logic. In our example, we use `io.keikai.api.Range` to set cell
edit text and get a value from the cells.

## Reset Cells

The method `handleReset()` implements the business logic to clear user
input back to default value.

``` java
public class ForLeaveServlet extends HttpServlet{
...
    //reset cells to default value
    private void handleReset(Sheet sheet, JSONObject result) {
        final String dateFormat =  "yyyy/MM/dd";
        //you can use a cell reference to get a range
        Range from = Ranges.range(sheet,"E5");//Ranges.range(sheet,"From");
        //or you can use a name to get a range (the named range has to be set in Excel);
        from.setCellEditText(DateUtil.tomorrow(0,dateFormat));
        
        //set other cells...
    }
```

## Check Cells

The method `handleReset()` implements the business logic to validate
user input and return a data for form element to submit in the browser.

{% highlight java linenos %}
public class ForLeaveServlet extends HttpServlet{
...
    //validate cell data of user input and return a JSONObject
    private void handleCheck(Sheet sheet, JSONObject result) {
        Date from = Ranges.rangeByName(sheet,"From").getCellData().getDateValue();
        Date to = Ranges.rangeByName(sheet,"To").getCellData().getDateValue();
        String reason = Ranges.rangeByName(sheet,"Reason").getCellData().getStringValue();
        Double total = Ranges.rangeByName(sheet,"Total").getCellData().getDoubleValue();
        String applicant = Ranges.rangeByName(sheet,"Applicant").getCellData().getStringValue();
        Date requestDate = Ranges.rangeByName(sheet,"RequestDate").getCellData().getDateValue();
        
        if(from == null){
            result.put("message", "FROM is empty");
        }else if(to == null){
            result.put("message", "TO is empty");
        }else if(total==null || total.intValue()<0){
            result.put("message", "TOTAL small than 1");
        }else if(reason == null){
            result.put("message", "REASON is empty");
        }else if(applicant == null){
            result.put("message", "APPLICANT is empty");
        }else if(requestDate == null){
            result.put("message", "REQUEST DATE is empty");
        }else{
            //Option 1:
            //You can handle your business logic here and return a final result for user directly
            
            
            
            //Or option 2: return necessary form data, 
            //so client can process it by submitting that can be handled by Spring MVC or Struts
            result.put("valid", true);
            JSONObject form = new JSONObject();
            result.put("form", form);

            form.put("from", from.getTime());//can't pass as data, use long for time
            form.put("to", to.getTime());//can't pass as data, use long for time
            form.put("reason", reason);
            form.put("total", total.intValue());//we just need int
            form.put("applicant", applicant);
            form.put("requestDate", requestDate.getTime());
            
            ...
        }
    }
...
}
{% endhighlight %}

- Line 13: The `result` is a JSONObject that will be sent back to the
    client. You can put any data you like according to your business
    requirement because you can get it in `app4l.jsp` and handle it by
    yourself. In our case, we put a validation message in order and show
    it with Javascript.
  - Line 25: You can handle your business logic here and return a final
    result for users directly.
  - Line 30: Here we return data for form element, and we submit a form
    at a browser in JavaScript.

# Process AJAX Response

After the servlet sending the response, there is a segment of Javascript
code which is responsible for handling response. This segment of code
will perform some business logic according to the data in JSON object
like showing validation message or submitting a form.

**Javascript in app4l.jsp**

{% highlight java linenos %}
    function postAjax(action){
        ...
        jq.ajax({url:"app4l",//the servlet url to handle ajax request 
            data:{desktopId:desktopId,zssUuid:zssUuid,action:action},
            type:'POST',dataType:'json'}).done(handleAjaxResult);
    }

    //the method to handle ajax result from your servlet 
    function handleAjaxResult(result){
        //process the json result that contains zk client update information 
        zssjsp.processJson(result);
        
        //use your way to hanlde you ajax message or error 
        if(result.message){
            alert(result.message);
        };
        
        //use your way handle your ajax action result 
        if(result.action == "check" && result.valid){
            if(result.form){
                //create a form dynamically to submit the form data 
                var field,form = jq("<form action='submitted.jsp'
                    method='post'/>").appendTo('body');
                for(var nm in result.form){
                    field = jq("<input type='hidden' 
                        name='"+nm+"' />").appendTo(form);
                    field.val(result.form[nm]);
                }
                form.submit();
            }
        };
    }
{% endhighlight %}

  - Line 5: Specify AJAX response handling method with
    `handleAjaxResult` when we send AJAX request.
  - Line 11: Use `zssjsp` to process ZK AJAX response in responsed JSON
    object, e.g. reset data in cells.
  - Line 14: Display a validation message if it exists.
  - Line 29: Submit a form whose data comes from JSON object. This
    technique can be used to trigger another controller like Spring MVC's
    or Struts'.

# Source Code of Example

Source code of above example application will be available soon.
