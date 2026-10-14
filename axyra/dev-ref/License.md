---
title: 'Licensing and Evaluation'
permalink: /axyra/dev-ref/License
---

Axyra Sheets is commercially licensed. You can start without a license key in
Evaluation Mode, request a 30-day full-featured evaluation key, and install a
production key when you are ready to deploy.

A license key is a signed token verified locally by the engine. Activation does
not contact a license server, so Axyra Sheets can run in private networks.

# Evaluation Mode

Axyra Sheets runs in **Evaluation Mode by default when no license key is
installed**. You can open real workbooks, edit cells, calculate formulas, render
them, and exercise the API to test out the product before purchasing a license.

When you save a workbook in Evaluation Mode, Axyra adds evaluation marks so the output cannot be mistaken for production output:

- An **Axyra Evaluation Copy** notice tab is inserted as the first sheet and
  made active, so sheet indices in the saved file shift by one.
- A watermark cell is placed below the used range of every sheet.
- The same evaluation mark is appended to each sheet's page header.

CSV, TXT, and JSON output carries the notice text without the extra tab. PDF and
image output carries a one-line evaluation banner at the top of every page.

Evaluation Mode never caps rows or drops data. The saved file is complete apart
from the marks, and the in-memory workbook is not modified. Reading and
recalculation are unrestricted, and rendering fidelity is unchanged apart from
the banner.

Evaluation Mode does limit how long and how much one process may work:

- A process may perform at most **100 opens, saves, renders, and streaming
  workbook creations combined**.
  The operation that exceeds the limit throws `AxyraException: evaluation limit
  reached …`. A batch job that fails partway through is the typical symptom.
- A process also has a maximum running time in Evaluation Mode.

Restart the process to continue evaluating, or install a license key.

An invalid or expired key does not throw by default: `setLicense` returns a
`LicenseInfo` whose state is `INVALID` or `EXPIRED`, so check `info.isLicensed()` as shown
below, or pass `LicenseMode.REQUIRED` to make it throw (see
[Production License](#production-license)).

# 30-Day Evaluation License

A 30-day evaluation license enables all features and produces clean,
unwatermarked output during the evaluation period, making it suitable for
realistic performance and deployment testing.

[Contact us](https://keikai.io/contact) to request a 30-day Axyra Sheets
evaluation license. Include your organisation, intended use case, deployment
platforms, and contact details. You will receive a signed license-key file.

Install the key once during application startup, before creating or opening a
workbook:

```java
import io.keikai.axyra.sheets.LicenseInfo;
import io.keikai.axyra.sheets.Workbook;

import java.io.InputStream;

try (InputStream key = MyApplication.class
		.getResourceAsStream("/licenses/axyra-evaluation.lic")) {
	if (key == null) {
		System.getLogger("app").log(System.Logger.Level.WARNING,
				"Axyra Sheets license key not found; using Evaluation Mode");
	} else {
		LicenseInfo info = Workbook.setLicense(key);
		if (!info.isLicensed()) {
			System.getLogger("app").log(System.Logger.Level.WARNING,
					"Axyra Sheets evaluation license is not active: " + info.state());
		}
	}
}
```

`Workbook.setLicense(...)` is static and process-wide. Call it once rather than
once per workbook. The API also accepts the token as a `String` or `byte[]`.

During the evaluation period, `licenseStatus()` reports `LICENSED`. A short grace
period may follow the 30 days; during it, the state is `GRACE` and output remains
clean. After the grace period, Axyra Sheets returns to Evaluation Mode.

# Production License

[Contact us](https://keikai.io/contact) to purchase an Axyra Sheets production
license. Our sales team will confirm the appropriate edition, deployment scope,
and license term for your application. After purchase, you receive a signed
production license-key file.

Install a production key through the same process-wide API used for a 30-day
evaluation key. In production, load it from a secret manager, environment
variable, or mounted file rather than committing it to source control:

```java
String token = System.getenv("AXYRA_LICENSE");
if (token == null || token.isBlank()) {
	System.getLogger("app").log(System.Logger.Level.WARNING,
			"AXYRA_LICENSE is not configured; using Evaluation Mode");
} else {
	LicenseInfo info = Workbook.setLicense(token);
	if (!info.isLicensed()) {
		System.getLogger("app").log(System.Logger.Level.WARNING,
				"Axyra Sheets production license is not active: " + info.state());
	}
}
```

Check the returned status during startup instead of waiting to discover a
watermark in generated output. By default, invalid, malformed, or expired keys
fall back to Evaluation Mode rather than preventing Axyra Sheets from starting.

For production code that must never write a marked file, install the key with
`LicenseMode.REQUIRED` (new in 1.0.0-Beta). A key that does not put a license in
force then throws `AxyraException`, whose message names the cause:

```java
import io.keikai.axyra.sheets.LicenseMode;

Workbook.setLicense(token, LicenseMode.REQUIRED);   // throws if not licensed
```

`LicenseMode.FALLBACK_TO_EVALUATION` is the default behaviour. The two-argument
form accepts the token as a `String` or `byte[]`.

The possible states are:

| State | Meaning |
|---|---|
| `UNLICENSED` | No key is installed; Evaluation Mode applies. |
| `INVALID` | A key was rejected; Evaluation Mode applies. `reason()` says why. |
| `EXPIRED` | A time-limited key has expired; Evaluation Mode applies. |
| `LICENSED` | A valid license is active. |
| `GRACE` | A time-limited license has expired but remains active during its grace period. |

Monitor `GRACE` in production so the key can be renewed before the application
returns to Evaluation Mode. `LicenseInfo.features()` and
`LicenseInfo.hasFeature(...)` report the capabilities granted by the installed
key. For example, the canonical feature names include `pdf_render`, `pivot`, and
`signatures`; `*` grants every feature.

Keep every production or evaluation key out of public repositories and
client-distributed artifacts. The key identifies your organisation and grants
the right to use the software.
