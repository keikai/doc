# Pitfalls: license, evaluation mode and runtime

Measured on `0.1.0.FL.20260922-Eval`, re-verified on `0.1.0.FL.20260930-Eval`; recheck against the resolved build. Docs:
`https://doc.keikai.io/axyra/dev-ref/License` and `dev-ref/Native_Loader`.

## Installing a license

Axyra is commercially licensed. Install a legitimate token once at startup with
`Workbook.setLicense`, which returns a `LicenseInfo`. Check `info.isLicensed()` or
`Workbook.licenseStatus().state()`, which is one of `LicenseStatus.LICENSED`,
`GRACE`, `EVALUATION` or `UNLICENSED`. There is no `status()` method.

| Behavior | Consequence | Workaround |
|---|---|---|
| An invalid or expired token does **not** throw. It leaves the process in evaluation mode | The program keeps running and produces marked output, then fails later | Fail fast: check `isLicensed()` right after `setLicense` and stop with a clear message |
| The license state is process-wide | One bad install affects every workbook in the process | Install once at startup |

Never copy license values into generated code, logs or reports, never remove
evaluation marks, and never reuse a competitor's license. Read the token from the
application's configuration or an environment variable.

## Evaluation mode

It applies when no valid license is installed, and released builds enforce it:

- Saved workbooks gain a first tab named **"Axyra Evaluation Copy"** plus a notice
  row below each sheet's data and in page headers. CSV/TXT/JSON get the notice
  without the tab.
- PDF and image pages get a banner line.
- Opens, saves, renders and stream creations are limited to **100 per process**,
  and refused 72 hours after the first. The operation that exceeds a limit throws
  `AxyraException`. A batch job that crashes partway through is a typical symptom.
- Reopening an evaluation file shifts sheet indices and used ranges.

Verify `Workbook.licenseStatus()` in the target environment. Do not infer
production behavior from a development run, and never strip the marks to make a
comparison pass.

## Native loading

- The JAR bundles native libraries for macOS (arm64, x86_64), Linux glibc (arm64,
  x86_64) and Windows x86_64, extracted to `java.io.tmpdir`, which must be writable.
- musl/Alpine and Windows on ARM are not covered. An override is an absolute
  `-Daxyra.native.path`.
- A load failure surfaces first as `UnsatisfiedLinkError` when `Workbook`
  initializes, then as `NoClassDefFoundError` on later use. Read the first error.
- Native memory is outside the Java heap.

## Threads

One `Workbook` belongs to one thread at a time. Using one workbook from two threads
concurrently throws `AxyraException: workbook is already in use` rather than
blocking. Separate workbooks run in parallel, so load or open a template once per
thread (or per task). The Javadoc and docs describe threading inconsistently;
trust this rule and a test.
