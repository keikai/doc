---
title: 'Licensing and Evaluation (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/License
redirect_from:
  - /axyra/dotnet/dev-ref/License
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
  made active, so sheet indices in the saved file shift by one. Look sheets up by
  name (`wb.Sheets["Summary"]`) rather than by position.
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
  The operation that exceeds the limit throws `AxyraException` with a message
  starting `evaluation limit reached`. A batch job that fails partway through is
  the typical symptom. A test suite run in one process can reach it too; run large
  suites in several processes.
- A process also has a maximum running time in Evaluation Mode.

Restart the process to continue evaluating, or install a license key. The first
open, save, or render of a process also prints a one-line evaluation notice to
standard error.

An invalid or expired key does not throw by default: `License.Apply` returns a
`LicenseInfo` whose `State` is `Invalid` or `Expired`, so check `info.IsLicensed`
as shown below, or pass `LicenseMode.Required` to make it throw (see
[Production License](#production-license)).

{% include axyra_cta.html type="evaluation" touchpoint="dotnet_license_evaluation" %}

# 30-Day Evaluation License

A 30-day evaluation license enables all features and produces clean,
unwatermarked output during the evaluation period, making it suitable for
realistic performance and deployment testing.

[Contact us](https://keikai.io/contact) to request a 30-day Axyra Sheets
evaluation license. Include your organisation, intended use case, deployment
platforms, and contact details. You will receive a signed license-key file.

Install the key once during application startup, before creating or opening a
workbook. A convenient way to ship it is as an embedded resource with a fixed
logical name:

```xml
<ItemGroup>
  <EmbeddedResource Include="licenses/axyra-evaluation.lic" LogicalName="licenses/axyra-evaluation.lic" />
</ItemGroup>
```

Then apply it first thing in `Program.cs`:

```csharp
using System.Reflection;
using Axyra.Sheets;

using (Stream? key = Assembly.GetExecutingAssembly()
           .GetManifestResourceStream("licenses/axyra-evaluation.lic"))
{
    if (key == null)
    {
        Console.Error.WriteLine("Axyra Sheets license key not found; using Evaluation Mode");
    }
    else
    {
        LicenseInfo info = License.Apply(key);
        if (!info.IsLicensed)
        {
            Console.Error.WriteLine($"Axyra Sheets evaluation license is not active: {info.State} ({info.Reason})");
        }
    }
}
```

`License.Apply(...)` is static and process-wide. Call it once rather than
once per workbook. It also accepts the token as a `string` or a `byte[]`.

During the evaluation period, `License.Status.State` reports `Licensed`. A short
grace period may follow the 30 days; during it, the state is `Grace` and output
remains clean. After the grace period, Axyra Sheets returns to Evaluation Mode.

# Production License

[Contact us](https://keikai.io/contact) to purchase an Axyra Sheets production
license. Our sales team will confirm the appropriate edition, deployment scope,
and license term for your application. After purchase, you receive a signed
production license-key file.

Install a production key through the same process-wide API used for a 30-day
evaluation key. In production, load it from a secret manager, environment
variable, or mounted file rather than committing it to source control:

```csharp
string? token = Environment.GetEnvironmentVariable("AXYRA_LICENSE");
if (string.IsNullOrWhiteSpace(token))
{
    Console.Error.WriteLine("AXYRA_LICENSE is not configured; using Evaluation Mode");
}
else
{
    LicenseInfo info = License.Apply(token);
    if (!info.IsLicensed)
    {
        Console.Error.WriteLine($"Axyra Sheets production license is not active: {info.State} ({info.Reason})");
    }
}
```

In ASP.NET Core, the same code reads the key from configuration
(`builder.Configuration["Axyra:License"]`), which covers environment variables,
user secrets, and Azure Key Vault alike.

Check the returned status during startup instead of waiting to discover a
watermark in generated output. By default, invalid, malformed, or expired keys
fall back to Evaluation Mode rather than preventing Axyra Sheets from starting;
`Apply` then returns the reason in `info.Reason` and also writes one line to
standard error.

For production code that must never write a marked file, install the key with
`LicenseMode.Required`. A key that does not put a license in force then throws
`AxyraException`, whose message names the cause:

```csharp
License.Apply(token, LicenseMode.Required);   // throws if not licensed
```

`LicenseMode.FallbackToEvaluation` is the default behaviour. Every `Apply`
overload — `string`, `byte[]`, and `Stream` — takes the mode as an optional
second argument.

A key must be for Axyra Sheets and, when it is restricted to one SDK, for .NET:
a key issued for Java only is refused here with a `Reason` naming both
platforms. A key without a platform restriction works in every SDK.

The possible states (`LicenseStatus`) are:

| State | Meaning |
|---|---|
| `Unlicensed` | No key is installed; Evaluation Mode applies. |
| `Invalid` | A key was rejected; Evaluation Mode applies. `Reason` says why. |
| `Expired` | A time-limited key has expired; Evaluation Mode applies. |
| `Licensed` | A valid license is active. |
| `Grace` | A time-limited license has expired but remains active during its grace period. |

Read the current state at any time without applying a key again:

```csharp
LicenseInfo status = License.Status;
if (status.State == LicenseStatus.Grace)
{
    Console.WriteLine($"Axyra Sheets license expired at {status.ExpiresAt}; renew it");
}
```

Monitor `Grace` in production so the key can be renewed before the application
returns to Evaluation Mode. `LicenseInfo.Features` and
`LicenseInfo.HasFeature(...)` (or the static `License.IsFeatureEnabled(...)`)
report the capabilities granted by the installed key. For example, the canonical
feature names include `pdf_render`, `pivot`, and `signatures`; `*` grants every
feature. `LicenseInfo` also reports the `Licensee`, `Edition`, `ExpiresAt`, and
the key's `LicenseId`, which you should quote in support requests.

Keep every production or evaluation key out of public repositories and
client-distributed artifacts. The key identifies your organisation and grants
the right to use the software.

{: .notice--info}
**Runnable example:** [`DevRef/LicenseAndNativeLoaderExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/LicenseAndNativeLoaderExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/license-and-native-loader`.
