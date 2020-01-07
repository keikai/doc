---
title: Migrate from ZK Spreadsheet
---
This section is designed for users coming from ZK Spreadsheet (ZSS).

# Quick Try (Evaluation Only)
This approach can quicky turn your existing ZSS application to Keikai applicaiton without modifying your source. Note that this is for evaluating purpose only as it does not cover all Keikai features. To officially migrate your existing ZSS application to Keikai, please read the next section: How to migrate from ZSS.

The steps for quick try are:
1. download [keikai-zss-legacy-all-[VERSION].zip]() to a folder 
2. extract the zip.
It produces 2 sub folders: `bin` and `lib`
3. put your zss application war to the same root folder
4. go to the folder and run `/bin/repack.sh WAR_FILE_NAME`
If it succeeds, the repacked WAR with the same name will be put under the folder. Your original WAR will be renamed to `WAR_FILE_NAME.backup`. Just run the repacked WAR file -- it is a Keikai App already!

(**Note**: This approach renames Keikai jar file in bytecode level at run-time by [jarjar](https://github.com/pantsbuild/jarjar) which is not recommended in the production environment.)

# How to Migrate from ZSS 
It is very easy to migrate your existing ZSS project to Keikai, just need to handle the following changes:

## JAR Change
replace all ZSS related JAR with Keikai related JAR.

## API Package Change
Only the package names are changed, all method names are backward compatible. You just need to **replace the old import statements** with new ones. It's better to use your IDE keyboard shortcut to quickly replace import statments.

## License Path Change
Please refer to [Applying License Key](License_Install).

## Sheet Tab Context Menu is Hidden by Default
Keikai adds a new attribute `showSheetTabContextMenu`. If you want to show the context menu on a sheet tab you need to specify as follows:

```xml
<spreadsheet showSheetbar="true" showSheetTabContextMenu="true"/>
```


## Custom Function Prefix Change
The prefix now should be `keikai` like:

```xml
<?xel-method prefix="keikai" name="CHAIN" ...?> 
<?taglib uri="/WEB-INF/tld/function.tld" prefix="keikai" ?>
```

## Custom CSS and JavaScript
If you have previously applied any custom CSS or JavaScript to your existing ZSS application, it is possible that it will no longer work in Keikai since we have optimized Keikai's UI and client widgets for better performance and usability. You may need to redo the corresponding customization on Keikai.

# Backward Compatibility
The following configurations also change in Keikai, but you can keep your original one since Keikai still reads the old configuration.

* [JSP Tag URI](Get_Spreadsheet_Running_Quickly_in_JSP)
* [Library Property Name](Configuration)