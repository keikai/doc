---
title: 'Native Library Loading'
permalink: /axyra/dev-ref/Native_Loader
---

{% include axyra_example.html path="devref/LicenseAndNativeLoaderExample.java" %}

Axyra Sheets is a native engine behind a Java API, so there is one operational
concern that a pure-Java library does not have: getting the right binary loaded.
This page covers how that works and what goes wrong.

# How resolution works

On first use of any API that touches the engine, the native loader:

1. Checks the `axyra.native.path` system property. If set, it loads that file
   directly and stops.
2. Otherwise reads `os.name` and `os.arch` and derives a platform key —
   `osx`, `linux`, or `windows`, plus `aarch64` or `x86_64`.
3. Looks up `/native/<platform-key>/<library>` on the classpath, where the
   library is `libaxyra_jni.dylib`, `libaxyra_jni.so`, or `axyra_jni.dll`.
4. Extracts it to a process-private temporary directory and loads it. The
   extraction is cached for the life of the process.

`arm64` and `aarch64` are both mapped to `aarch64`, so a JVM reporting either
resolves correctly.

# The development override

```
java -Daxyra.native.path=/abs/path/to/libaxyra_jni.dylib -jar app.jar
```

This bypasses the classpath lookup and the extraction entirely, and is how you
run against a library you just built yourself. The engine's own test suite uses
it, and it is the fastest edit-build-run loop when you are working on the Rust
side.

Do not use it in production: it hard-codes an absolute path and skips the
platform check that would otherwise catch an architecture mismatch.

# Failure modes

| Symptom | Cause |
|---|---|
| `UnsatisfiedLinkError: axyra native lib: native lib not found on classpath: /native/osx-aarch64/libaxyra_jni.dylib` | The Axyra Sheets JAR does not contain a native library for this platform, or a repackaging step dropped it. |
| `UnsatisfiedLinkError` *without* the `native lib not found` text | A library was found but the OS refused to load it — usually the wrong architecture, or a missing system dependency such as an old glibc. |
| Works locally, fails in the container | The classic one. Your machine's platform is bundled; the container's is not. |
| Works in tests, fails in the shaded jar | The shading step dropped one or more `native/**` resources. |

## Shading and fat jars

`native/**` are resources, and resource filtering is the usual culprit. When
building a shaded or shadowed jar:

- Do not exclude `native/**`.
- Do not filter binary resources through a text-substitution step — it corrupts
  them silently, and the failure surfaces as `UnsatisfiedLinkError` rather than
  as anything mentioning filtering.
- Preserve the library for every platform you need. Check the shaded jar rather
  than assuming all `native/**` resources survived the merge.

## Containers

Build the image for the architecture it will run on. An `arm64` image built on an
Apple Silicon laptop and deployed to `amd64` hosts will fail on load — or, worse,
run under emulation at a fraction of the speed. Set the platform explicitly in
your build.

A slim base image may also lack a suitable glibc. The Linux builds target glibc;
Alpine and other musl distributions are not supported.

# Temp directory

The library is extracted to a process-private temp directory, so the process
needs a writable temp location. In a hardened container with a read-only
filesystem and no writable `/tmp`, set `java.io.tmpdir` to a writable volume, or
use `axyra.native.path` to point at a library already on disk.

Each process extracts its own copy. Many short-lived processes therefore pay the
extraction cost repeatedly — if that matters, `axyra.native.path` avoids it.

# Verifying at startup

Fail fast rather than at the first user request:

```java
public static void main(String[] args) {
    try (Workbook probe = Workbook.create()) {
        log.info("Axyra Sheets engine loaded; license {}", Workbook.licenseStatus());
    } catch (Throwable t) {
        log.error("Axyra Sheets failed to initialise", t);
        throw t;
    }
    ...
}
```

# Threading and memory

- **Native calls are serialized process-wide.** Calling an API method from
  different threads does not corrupt engine state, but calls do not execute in
  parallel, even across separate workbooks. Compound read-modify-write sequences
  are not atomic; synchronize them in your application when they must act as one
  operation.
- **A `Workbook` owns native memory** that the JVM's garbage collector cannot
  reclaim. Always close it. In a request-scoped service, a workbook that escapes
  its try-with-resources is a leak no heap tuning will fix.
- **`Sheet`, `Range`, and `Cell` are views**, valid only while their workbook is
  open. Using one afterwards throws `IllegalStateException`.
- **The native heap is outside `-Xmx`.** A container memory limit must leave room
  for it above the JVM heap.
