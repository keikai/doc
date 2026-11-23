---
title: 'Installation (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Installation
redirect_from:
  - /axyra/dotnet/dev-ref/Installation
---

Axyra Sheets for .NET is the NuGet package **`Axyra.Sheets`**. It is not published
to nuget.org. Install the public evaluation build from the Axyra evaluation feed,
or the release you receive with your license from a local folder.

# Evaluation build

Use the evaluation feed to evaluate Axyra Sheets without credentials.

## Register the feed

Add a `nuget.config` file beside your solution (or project) file:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="axyra-eval" value="{{ site.axyra_dotnet_feed_url }}" />
  </packageSources>
</configuration>
```

The feed is added to your other package sources; nuget.org stays available.

## Add the package

The feed holds prerelease versions only (such as `1.0.0-fl.20261116`), so pass
`--prerelease` for the newest build, or name an exact version:

```shell
dotnet add package Axyra.Sheets --prerelease
```

The command writes the usual `PackageReference` into the project file, which you
can also add by hand:

```xml
<ItemGroup>
  <PackageReference Include="Axyra.Sheets" Version="{{ site.axyra_dotnet_version }}" />
</ItemGroup>
```

To list the versions the feed carries:

```shell
dotnet package search Axyra.Sheets --source {{ site.axyra_dotnet_feed_url }} --prerelease
```

An evaluation build runs in Evaluation Mode until a license key is installed:
saved, rendered, and exported output carries the evaluation marks, and one
process may perform at most 100 opens, saves, renders, and streaming workbook
creations combined. See
[Licensing and Evaluation]({{ site.axyra_dotnet_devref }}/License). The evaluation
package is used under the Axyra Trial License Agreement, which it carries as
`TRIAL_LICENSE.txt`.

# Licensed release

A licensed customer receives a release, such as `1.0.0`, as a package file
(`Axyra.Sheets.<version>.nupkg`) together with the license key. Releases are not
on the evaluation feed. Install the file from a folder:

1. Put `Axyra.Sheets.<version>.nupkg` in a folder next to your solution, for
   example `./packages`.
2. Register the folder as a package source in `nuget.config`. A relative `value`
   is resolved against the `nuget.config` file's own directory:

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <packageSources>
       <add key="axyra" value="./packages" />
     </packageSources>
   </configuration>
   ```

3. Add the package, naming its version:

   ```shell
   dotnet add package Axyra.Sheets --version 1.0.0
   ```

The same steps install an evaluation build on a machine that cannot reach the
feed: download the `.nupkg` once, put it in the folder, and name its prerelease
version (or pass `--prerelease`; without either, `dotnet add package` considers
stable versions only).

In CI, commit `nuget.config`, and either commit the `packages` folder or restore
the `.nupkg` into it from your artifact store before `dotnet restore`.

# The native library

The engine is a native library — `libaxyra.dylib` on macOS, `libaxyra.so` on
Linux, `axyra.dll` on Windows. The package carries one build per platform under
the standard NuGet layout `runtimes/<rid>/native/`:

| Runtime identifier | Platform |
|---|---|
| `osx-arm64` | macOS on Apple silicon |
| `osx-x64` | macOS on Intel |
| `linux-x64` | Linux, glibc 2.28 or newer, x64 |
| `linux-arm64` | Linux, glibc 2.28 or newer, arm64 |
| `win-x64` | Windows, x64 |

Nothing needs configuring: .NET's own native-asset handling copies the libraries
into the build output and loads the one for the running platform. A
platform-specific publish (`dotnet publish -r linux-x64`) copies only that
platform's library.

**Verify every platform you run on.** Developers on Apple silicon with CI on
Linux x64 is the common pair, and a missing platform fails only at runtime, not
at build time.

For local development against a native library you built yourself, set the
`AXYRA_NATIVE_PATH` environment variable to the library file:

```shell
AXYRA_NATIVE_PATH=/path/to/libaxyra.dylib dotnet run
```

See [Native Library Loading]({{ site.axyra_dotnet_devref }}/Native_Loader) for the
resolution order, publishing options, and the failure modes.

# Dependencies

None. The package has no NuGet dependencies of its own: the managed assembly and
the native engine for every supported platform travel in the one package.

# .NET version

.NET 8 or later. The package targets `net8.0` and `net10.0`; a project on a later
.NET picks the nearest. The API uses records, `init` properties, `DateOnly`, and
`ReadOnlySpan<T>`, and is annotated for nullable reference types.

# Verifying the install

```csharp
using Axyra.Sheets;
using Axyra.Sheets.Formula;

using (Workbook wb = new Workbook())
{
    Console.WriteLine($"engine up, {BuiltInFunctions.Count} formula functions");
    Console.WriteLine($"license: {License.Status.State}");
}
```

If this prints a function count, the native library loaded correctly. Without a
license key the second line reads `license: Unlicensed`.
