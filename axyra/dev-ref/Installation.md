---
title: 'Installation'
permalink: /axyra/dev-ref/Installation
---

{% include axyra_example.html path="devref/LicenseAndNativeLoaderExample.java" %}

# Maven

```xml
<dependency>
    <groupId>io.keikai</groupId>
    <artifactId>axyra-sheets</artifactId>
    <version>{{ site.axyra_version }}</version>
</dependency>
```

# Gradle

```groovy
implementation "io.keikai:axyra-sheets:{{ site.axyra_version }}"
```

# The native library

The engine is a native library. The Java library locates it on the **classpath**, at
`/native/<os>-<arch>/`, and extracts it on first use:

| Classpath path | Platform |
|---|---|
| `/native/osx-aarch64/libaxyra_jni.dylib` | macOS on Apple Silicon |
| `/native/osx-x86_64/libaxyra_jni.dylib` | macOS on Intel |
| `/native/linux-x86_64/libaxyra_jni.so` | Linux, glibc, x86-64 |
| `/native/linux-aarch64/libaxyra_jni.so` | Linux, glibc, aarch64 |
| `/native/windows-x86_64/axyra_jni.dll` | Windows, x86-64 |

The published JAR bundles these libraries, so the Maven or Gradle dependency
above is sufficient. A thin JAR built directly from source does not contain
them; for that case, place the required library at the matching classpath path or
use the development override below.

**Verify every platform you run on.** Developers on Apple Silicon with CI on
Linux x86-64 is the common pair, and a missing platform fails only at runtime,
not at build time.

For local development against a `cargo build` output, skip the classpath
entirely:

```
-Daxyra.native.path=/path/to/libaxyra_jni.dylib
```

See [Native Library Loading]({{ site.axyra_devref }}/Native_Loader) for the
resolution order and the failure modes.

# Dependencies

The Java library pulls in `jackson-databind` — the Java and native sides exchange
structured values (styles, charts, pivot definitions, filters) as JSON across the
JNI boundary. If your application pins a different Jackson version, the library works
with any 2.x that is API-compatible.

# Java version

Java 17 or later. The API uses sealed interfaces (`CellValue`) and records
(`ImportOptions`), so earlier versions will not compile against it.

# Verifying the install

```java
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.formula.Functions;

public class Verify {
    public static void main(String[] args) {
        try (Workbook wb = Workbook.create()) {
            System.out.println("engine up, " + Functions.count() + " formula functions");
            System.out.println("license: " + Workbook.licenseStatus());
        }
    }
}
```

If this prints a function count, the native library loaded correctly.
