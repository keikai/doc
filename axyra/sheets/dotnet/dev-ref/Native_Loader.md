---
title: 'Native Library Loading (.NET)'
permalink: /axyra/sheets/dotnet/dev-ref/Native_Loader
redirect_from:
  - /axyra/dotnet/dev-ref/Native_Loader
---

Axyra Sheets is a native engine behind a .NET API, so there is one operational
concern that a purely managed library does not have: getting the right binary
loaded. This page covers how that works, how it interacts with publishing, and
what goes wrong.

# How resolution works

The engine library is `libaxyra.dylib` on macOS, `libaxyra.so` on Linux, and
`axyra.dll` on Windows. On first use of any entry type — `Workbook`, `License`,
`StreamWorkbook`, `BuiltInFunctions`, or `Formats` — its static constructor loads
the library once per process:

1. If the `AXYRA_NATIVE_PATH` environment variable is set, that exact file is
   loaded and nothing else is searched.
2. Otherwise .NET's standard native-library probing applies. For an application
   run from its build output, the runtime reads the application's `.deps.json`
   and loads `runtimes/<rid>/native/<library>` for the running platform — the
   NuGet layout the package ships. A platform-specific publish places the one
   library next to the application instead, where the same probing finds it.
3. The loaded library is checked: it must expose exactly the native surface the
   managed assembly was built for. A library from another build is refused.

There is no extraction step and no temporary directory: the library is loaded
in place from the build or publish output.

The package carries `osx-arm64`, `osx-x64`, `linux-x64`, `linux-arm64`, and
`win-x64`. Every other runtime identifier — Windows on ARM, `linux-musl-x64`
(Alpine), 32-bit platforms — has no library, and the first use fails with
`DllNotFoundException`.

# The development override

```shell
AXYRA_NATIVE_PATH=/abs/path/to/libaxyra.dylib dotnet run
```

This bypasses the packaged libraries and loads that file, and is how you run
against a library you just built yourself. The engine's own test suite uses it,
and it is the fastest edit-build-run loop when you are working on the native
side.

Set it in the environment before the process starts (in your shell, a
`launchSettings.json` profile, or the container's environment). The library
loads once per process, so setting the variable from code after the first use
of the API has no effect.

Do not use it in production: it hard-codes an absolute path and bypasses the
per-platform lookup, so an architecture mismatch surfaces only as a load error.

# Failure modes

The library is loaded in a static constructor, so .NET reports a failure as a
`TypeInitializationException` whose `InnerException` is the real cause. A failed
type initializer is not retried: every later use of `Workbook` in the same process
throws the same way. Always inspect `InnerException`.

| `InnerException` | Cause |
|---|---|
| `DllNotFoundException: Unable to load shared library 'axyra' or one of its dependencies` | No library for this platform in the output — an unsupported runtime identifier, a publish for another RID, or a deployment step that dropped the `runtimes/` folder. The message lists every path that was tried. |
| `DllNotFoundException: AXYRA_NATIVE_PATH names …, which does not exist` | The override points at a missing file. |
| `EntryPointNotFoundException` | The override (or a stray library named `axyra`) points at a file that is not the Axyra engine. |
| `AxyraException: native library mismatch …` | The library is a different build from the managed assembly — usually a stale `AXYRA_NATIVE_PATH`, or files from two package versions mixed in one folder. |
| `DllNotFoundException: Unable to load shared library '<full path>'` | A library was found but the OS refused to load it — the wrong architecture ("incompatible architecture" in the message), a library for another operating system, or a missing system dependency such as an old glibc. |

Typical situations:

| Symptom | Cause |
|---|---|
| Works locally, fails in the container | The classic one. The container's platform differs from your machine's — for example an Alpine (musl) base image, which is not supported. |
| Works with `dotnet run`, fails after `dotnet publish -r <rid>` on another machine | The publish was for a different runtime identifier than the machine it runs on. |
| Works in the build output, fails after copying files by hand | The `runtimes/` folder, or the application's `.deps.json`, was not copied. Deploy the whole publish folder. |

## Publishing

- **Framework-dependent, portable** (`dotnet publish` with no RID): the publish
  folder keeps `runtimes/<rid>/native/` for every platform, and the application
  runs anywhere .NET does among the supported platforms.
- **RID-specific** (`dotnet publish -r linux-x64`, self-contained or not): only
  that platform's library is copied, flat next to the application. Publish once
  per target platform.
- **Single-file** (`PublishSingleFile`): a single-file bundle embeds managed
  assemblies only; the engine stays a separate file next to the executable unless
  you also set `IncludeNativeLibrariesForSelfExtract`:

  ```xml
  <PropertyGroup>
    <PublishSingleFile>true</PublishSingleFile>
    <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
  </PropertyGroup>
  ```

  The runtime then extracts the library to disk before the application starts,
  under `DOTNET_BUNDLE_EXTRACT_BASE_DIR` (by default `$HOME/.net` on Linux and
  macOS, `%TEMP%\.net` on Windows). In a hardened container with a read-only
  filesystem, point that variable at a writable volume, or leave the library as a
  separate file.
- **Native AOT and trimming** are not covered by this release; publish the
  application as a regular framework-dependent or self-contained app.

## Containers

Build the image for the architecture it will run on. An `arm64` image built on an
Apple silicon laptop and deployed to `amd64` hosts will fail on load — or, worse,
run under emulation at a fraction of the speed. Set the platform explicitly in
your build (`docker build --platform linux/amd64`), and publish for the matching
RID.

The Linux builds need glibc 2.28 or newer. The official Debian- and Ubuntu-based
.NET images qualify; Alpine and other musl distributions are not supported.

# Verifying at startup

Fail fast rather than at the first user request:

```csharp
try
{
    using Workbook probe = new Workbook();
    Console.WriteLine($"Axyra Sheets engine loaded; license {License.Status.State}");
}
catch (TypeInitializationException e)
{
    Console.Error.WriteLine($"Axyra Sheets failed to initialise: {e.InnerException}");
    throw;
}
```

In an ASP.NET Core application, run the same probe before `app.Run()` and log
through your `ILogger`.

# Threading and memory

- **One `Workbook` belongs to one thread at a time.** Using the same workbook
  (or its `Sheet`, `CellRange`, and `Cell` views) from two threads concurrently
  throws `AxyraException: workbook is already in use` rather than blocking or
  corrupting it. Separate workbooks run in parallel, so give each thread or task
  its own workbook — for example, read a template into bytes once and open it per
  task with `Workbook.Open(bytes, WorkbookFormat.Xlsx)`. Do not touch a workbook
  while one of its `…Async` calls is still running.
- **A `Workbook` owns native memory** that the garbage collector cannot see.
  Always dispose it, with `using`. The handle is a `SafeHandle`, so a workbook you
  forget is still released when the garbage collector finalizes it — but that is
  a safety net, not a plan: the GC does not know how large the native model is,
  so an abandoned workbook can hold its memory far longer than you expect.
- **`Sheet`, `CellRange`, and `Cell` are views**, valid only while their workbook
  is open. Using one afterwards throws `ObjectDisposedException`.
- **The native heap is outside the managed heap.** Settings such as
  `GCHeapHardLimit` do not bound it, and a container memory limit must leave room
  for it above the managed heap.

{: .notice--info}
**Runnable example:** [`DevRef/LicenseAndNativeLoaderExample.cs`]({{ site.axyra_dotnet_examples }}/src/Axyra.Sheets.Examples/DevRef/LicenseAndNativeLoaderExample.cs)
in the .NET examples project. Run it with
`dotnet run --project src/Axyra.Sheets.Examples -- dev-ref/license-and-native-loader`.
