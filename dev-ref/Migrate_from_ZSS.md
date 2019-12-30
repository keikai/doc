# Quick Trial (Evaluation Only)
This approach can quicky turn your old ZSS applications to Keikai applicaiton without modifying your source for evaluating purpose only. To officially migrate your existing ZSS application to Keikai, please read the next section.

The steps are:
1. download [keikai-zss-legacy-all-VERSION.zip]() to a folder 
2. extract the zip.
It produces 2 folders: `bin` and `lib`
3. put your zss application war to the same folder
4. go to the folder and run `/bin/repack.sh WAR_FILE_NAME`
If it succeeds, the repacked WAR with the same name will be put under the folder. Your original WAR will be renamed to `WAR_FILE_NAME.backup`


(**Notice**: This approach renames Keikai jar file in bytecode level at run-time by [jarjar](https://github.com/pantsbuild/jarjar) which is not recommended in the production environment.)

# How to Migrate from ZSS 
Migrate your existing ZSS (ZK Spreadsheet) project is very easy, just need to handle the following changes:

## JAR Change
replace all ZSS related JAR with Keikai related JAR.

## API Pakcage Change
Since only the package names change, and we keep all orginal method names. You just need to **replace the old import statements** with new ones. It's better to use your IDE keyboard shortcut to quickly replace import statments.

## License Path Change
Please refer to [Liscense Install](License_Install).

## Sheet Tab Context Menu is Hidden by Default
Keikai adds a new attribute `showSheetTabContextMenu`. If you want to show the context menu on a sheet tab you need to specify as follows:

```xml
<spreadsheet showSheetbar="true" showSheetTabContextMenu="true"/>
```

## JSP Tag URI Change
Please refer to [Get Spreadsheet Running Quickly in JSP](Get_Spreadsheet_Running_Quickly_in_JSP).

## Custom Function Prefix Change
The prefix now should be `keikai` like:

```xml
<?xel-method prefix="keikai" name="CHAIN" ...?> 
<?taglib uri="/WEB-INF/tld/function.tld" prefix="keikai" ?>
```


## Custom CSS and JavaScript
If you apply any custom CSS or JavaScript on previous ZSS, it probably break within Keikai since Keikai changes a lot in UI and client widget from ZSS.

