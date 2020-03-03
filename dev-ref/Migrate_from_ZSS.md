---
title: Migrate from ZK Spreadsheet
---
This section is designed for users coming from ZK Spreadsheet (ZSS).
**Please make sure to back-up your current project before upgrading.**

# Drop-in Upgrade (Evaluation Only)
This approach can quicky turn your existing ZSS application to Keikai (EE) applicaiton without modifying your source. Note that this is for evaluating purpose only as it does not cover all Keikai features. To officially migrate your existing ZSS application to Keikai, please read the next section: How to migrate from ZSS.

The steps for quick try are:
1. download the lastest [keikai-zss-legacy-all-[VERSION].zip](https://mavensync.zkoss.org/eval/io/keikai/binary/) 
2. extract the zip.
It produces 2 sub folders: `bin` and `lib`
3. put your zss application war under the same folder
4. go to the folder and run 

`/bin/repack.sh WAR_FILE_NAME.war`

If it succeeds, the repacked, new WAR with the same name will be put under the same folder. Your original WAR will be renamed to `WAR_FILE_NAME.backup`. Just run the repacked WAR file -- it is a Keikai App already!

(**Note**: This approach renames Keikai jar file in bytecode level at run-time by [jarjar](https://github.com/pantsbuild/jarjar) which is not recommended in the production environment.)

# How to Migrate from ZSS 
It is very easy to migrate your existing ZSS project to Keikai, just need to handle the following changes:

## JAR Change (zss\*.jar --> keikai\*.jar)
Replace all ZSS related JAR (OSE or EE) with Keikai related JAR (OSE or EE). 

### For Maven Users
Please reference the [pom.xml](https://github.com/keikai/dev-ref/blob/master/pom.xml).

### The Users Who Download the jar zip
Remove all zss\*.jar and copy `keikai-bin-[VERSION].zip/dist/*.jar` into your Keikai project. Please notice that don't mix different versions of a jar (e.g. `zk-8.0.2.jar` and `zk-9.0.0.jar`), or it might cause errors.


## API Packages Change (`org.zkoss.zss` --> `io.keikai`)
Only the package names are changed, and all method names are unchanged (backward compatible). For example, `org.zkoss.zss.api.Range.setValue()` turns to be `io.keikai.api.Range.setValue()`. You just need to **replace the old import package name (`org.zkoss.zss`)** with new ones (`io.keikai`). It's better to use your IDE keyboard shortcut to quickly replace import statments.


## License Path Change
This is for paying customer only. Please refer to [Applying License Key](License_Install).

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
