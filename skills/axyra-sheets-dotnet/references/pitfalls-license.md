# Pitfalls: license, evaluation mode and runtime

Measured on `1.0.0-fl.20261116`; recheck against the resolved build. The package
README (`~/.nuget/packages/axyra.sheets/<version>/README.md`) and
`https://doc.keikai.io/axyra/sheets/java/dev-ref/License` describe licensing.

## Installing a license

Axyra is commercially licensed. Install a legitimate token once at startup with
`License.Apply(token, LicenseMode.Required)` (static class `Axyra.Sheets.License`;
overloads take `string`, `byte[]` or `Stream`). It throws `AxyraException` ("the
license was not applied: <reason>") when the token is not in force. It returns a
`LicenseInfo` record: `info.State` / `License.Status.State` is a `LicenseStatus`
(`Licensed`, `Grace`, `Unlicensed`, `Expired`, `Invalid`), `info.IsLicensed` is true
for `Licensed` and `Grace`, and `info.Reason` says why a token was not applied.
`License.IsFeatureEnabled("...")` / `info.HasFeature("...")` query entitlements.

| Behavior | Consequence | Workaround |
|---|---|---|
| Without `LicenseMode.Required` (the default `FallbackToEvaluation`), an invalid, empty or expired token does **not** throw: it writes one line to stderr (`axyra: the license was not applied (...); running as an evaluation copy`) and returns `State = Invalid` | The program keeps running and produces marked output, then fails later | Use `LicenseMode.Required` |
| The license state is process-wide | One bad install affects every workbook in the process | Install once at startup |
| `wb.Sign(...)` requires the `signatures` feature: unlicensed it throws `AxyraException` ("the current license does not enable feature 'signatures'") | Signing cannot be tested in evaluation mode | Test signing with a license that includes it |

Never copy license values into generated code, logs or reports, never remove
evaluation marks, and never reuse a competitor's license. Read the token from the
application's configuration, an environment variable (`AXYRA_LICENSE_FILE` naming a
file in the startup snippet) or an embedded resource.

## Evaluation mode

It applies when no valid license is installed, and the released package enforces it:

- Saved workbooks gain a first tab named **"Axyra Evaluation Copy"** (made active) plus
  a notice row below each sheet's data (`Created with an evaluation copy of Axyra.
  Not for production use.`) and in page headers. CSV gets the notice row without the
  tab. The in-memory workbook is not changed.
- PDF and image pages get a banner line.
- Opens, saves, renders and stream creations share **one counter of 100 per
  process** (`Workbook.Open`, `Save`, `SaveCsv`, `SavePdf`, `ToByteArray`, `ToPdf`,
  `RenderImage`, `Chart.RenderPng`, `new StreamWorkbook` all count; `new Workbook()`
  and edits do not), and are refused 72 hours after the first. The 101st throws
  `AxyraException: evaluation limit reached` (its message says "open or save", but
  renders and streams count too). A batch job or test run that crashes partway
  through is a typical symptom: run test classes in separate processes.
- Reopening an evaluation file shifts sheet indices (`Data` becomes `Sheets[1]`) and
  used ranges (one more row). Look sheets up by name.

Verify `License.Status` in the target environment. Do not infer production behavior
from a development run, and never strip the marks to make a comparison pass.

## Native loading

- The package carries the native engine under `runtimes/<rid>/native/` for `win-x64`,
  `linux-x64` and `linux-arm64` (glibc 2.28+), `osx-arm64` and `osx-x64`; .NET copies
  and loads the right one. A RID-specific publish copies only that RID's library.
- musl/Alpine, Windows on ARM and 32-bit processes are not covered. A single-file
  publish needs `IncludeNativeLibrariesForSelfExtract=true` (or the library next to
  the executable). `AXYRA_NATIVE_PATH` (absolute path to the library file, read from
  the process environment at startup) overrides the packaged library.
- A load failure surfaces as `TypeInitializationException` on the first use of
  `Workbook` (or `License`, `StreamWorkbook`, ...) and again on every later use; read
  its `InnerException` (`DllNotFoundException`, or `AxyraException: native library
  mismatch`).
- Native memory is outside the GC heap; dispose workbooks promptly.

## Threads

One `Workbook` belongs to one thread at a time. Using one workbook from two threads
concurrently throws `AxyraException: workbook is already in use` rather than
blocking (either thread may get it). `async` methods do not change this. Separate
workbooks run in parallel, so open a template once per task from shared bytes
(`Workbook.Open(bytes, WorkbookFormat.Xlsx)`). Trust this rule and a test.
