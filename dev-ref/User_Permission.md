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

We will demonstrate the usage of API with the Keikai Essentials project.
In this application, you can log in with 3 different roles: OWNER,
EDITOR, VIEWER. Their permissions are described in the image below:

![]({{site.devref_image_folder}}/Zss-essentials-login.png)

If you log in as an owner, you will have full control of the file. But
if you log in as an editor, you will find all sheet related operations
are disabled.

![]({{site.devref_image_folder}}/Zss-essentials-editor.png)

When you log in as a viewer, the only thing you can do is viewing.
Because there is no UI for edit, and all sheets are protected from
editing.

![]({{site.devref_image_folder}}/Zss-essentials-viewer.png)

This application relies on those API we mentioned in previous chapters
to control the access for each role. Let's recap them here:

## [Hide User Interface](Control_Components)
## [Disable Functions](/dev-ref/adv/Disable_Functions)
## [Protect a Sheet](/dev-ref/book_model/Protection)
