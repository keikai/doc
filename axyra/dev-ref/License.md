---
title: 'Licensing'
permalink: /axyra/dev-ref/License
---

Axyra Sheets is commercially licensed. A license is a **signed token** you
install at startup; the engine verifies its signature locally, with no network
call and no license server.

# Installing a license

```java
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.LicenseInfo;

LicenseInfo info = Workbook.setLicense(tokenString);
LicenseInfo same = Workbook.setLicense(tokenBytes);

try (InputStream in = MyApp.class.getResourceAsStream("/axyra-license.txt")) {
    Workbook.setLicense(in);
}
```

`setLicense` is static and process-wide — call it once during application
startup, before creating or opening any workbook. It returns the parsed
`LicenseInfo`.

{: .notice--warning}
**`setLicense` fails open — it does not throw on a bad token.** A malformed,
tampered, or expired token leaves the engine in `EVALUATION` rather than raising
an exception, so a `try`/`catch` around the call tells you nothing. The only way
to know a license took effect is to inspect what it returns:

```java
LicenseInfo info = Workbook.setLicense(tokenString);
if (!info.isLicensed()) {
    throw new IllegalStateException("Axyra Sheets license not in force: " + info.state());
}
```

Do this at startup. Without it, a deployment with a bad token runs with degraded
output and no signal that anything is wrong.

# Checking status

```java
LicenseInfo info = Workbook.licenseStatus();

info.state();        // UNLICENSED | EVALUATION | LICENSED | GRACE
info.edition();
info.licensee();
info.features();     // the feature names the token grants
info.expiresAt();    // epoch seconds, or null for a perpetual license
info.isLicensed();
info.hasFeature("render.pdf");
```

`License` offers the same two questions as a shorthand:

```java
import io.keikai.axyra.sheets.License;

License.status();
License.isFeatureEnabled("render.pdf");
```

## The four states

| State | Meaning |
|---|---|
| `UNLICENSED` | No token installed. Evaluation limits apply. |
| `EVALUATION` | A token is installed but is not currently in force: invalid, not yet valid, or expired past its grace period. |
| `LICENSED` | A valid production token. |
| `GRACE` | The token has expired but the engine is still operating, within a grace period. |

`GRACE` is the state to watch for in production monitoring. It means the license
has expired and you have a limited window to replace it — surface it as an alert,
not as a log line nobody reads.

```java
if (Workbook.licenseStatus().state() == LicenseStatus.GRACE) {
    alerting.warn("Axyra Sheets license expired — in grace period");
}
```

# Feature gating

A token grants a set of named features, and features are checked at the point of
use. Guard optional capability rather than discovering the limit mid-request:

```java
if (License.isFeatureEnabled("render.pdf")) {
    wb.renderPdf(path);
} else {
    wb.save(path);
}
```

`info.features()` lists exactly what your token grants — the authoritative
answer for your license, in preference to any list in documentation.

# Running unlicensed

The engine runs without a token so you can evaluate it, with limits. Those
limits are enforced by the engine and are not documented here as a fixed set,
because they vary by build — check `licenseStatus()` and the errors you get.
Unlicensed operation is for evaluation and development; it is not a supported
production configuration.

# Where to keep the token

A license token is a **secret** — it identifies your organisation and it is what
authorises the software.

- Keep it out of version control.
- Load it from a secret manager, an environment variable, or a mounted file — the
  `InputStream` overload exists for this.
- Do not ship it inside a client-distributed artifact if the token is for
  server-side use.

Bundling it as a classpath resource is convenient and common for server
deployments; just make sure that artifact is not published anywhere public.

# Obtaining a license

Contact [Potix](https://keikai.io) for pricing and terms.
