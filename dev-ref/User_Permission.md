---
title: 'User Permission'
---

# Overview

One of the most concerned issues is access control for Keikai. We think
most enterprises have their own authorization rule. Therefore, Keikai
doesn't have its own authorization and authentication features because
one feature can't fulfill all kinds of requirements. Instead, it
provides 3 categories of API to help you build your own user permission
mechanism:

  - show/hide UI
  - enable/disable functions
  - sheet protection

We will demonstrate the usage of API with
<https://github.com/zkoss/keikaiessentials/blob/master/src/main/webapp/advanced/permission/login.zul>.
In this application, you can log in with 3 different roles: OWNER,
EDITOR, VIEWER. Their permissions are described in the image below:

![ center](/assets/images/dev-ref/zss-essentials-login.png " center")

If you log in as an owner, you will have full control of the file. But
if you log in as an editor, you will find all sheet related operations
are disabled.

![ center](/assets/images/dev-ref/zss-essentials-editor.png " center")

When you log in as a viewer, the only thing you can do is viewing.
Because there is no UI for edit, and all sheets are protected from
editing.

![ center](/assets/images/dev-ref/zss-essentials-viewer.png " center")

This application relies on those API we mentioned in previous chapters
to control the access for each role. Let's recap them here:

# Hide User Interface

<http://books.zkoss.org/wiki/Keikai%20Spreadsheet%20Essentials/Working%20with%20Spreadsheet/Control%20Components>

Example:

{% highlight java linenos %}
spreadsheet.setShowToolbar(false);
{% endhighlight %}

# Disable Functions

<http://books.zkoss.org/wiki/Keikai%20Spreadsheet%20Essentials/Working%20with%20Spreadsheet/Advanced/Disable%20Functions>

Example:

{% highlight java linenos %}
spreadsheet.disableUserAction(AuxAction.COPY_SHEET, true);
{% endhighlight %}

# Protect a Sheet

<http://books.zkoss.org/wiki/Keikai_Spreadsheet_Essentials/Working_with_Spreadsheet/Handling_Data_Model/Protection>

Example:

{% highlight java linenos %}
Ranges.range(spreadsheet.getSelectedSheet()).protectSheet("password",
                true, true, false, false, false, false, false,
                false, false, false, false, false, false, false, false);
{% endhighlight %}

You can download the example source code to know the complete
implementation.
