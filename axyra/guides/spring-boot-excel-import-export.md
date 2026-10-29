---
title: 'Spring Boot Excel Import and Export: XLSX Downloads and Uploads'
excerpt: 'Export Excel from Java Spring Boot with Axyra Sheets. Build XLSX download endpoints, read uploaded files, validate rows, and handle deployment settings.'
permalink: /axyra/guides/spring-boot-excel-import-export
keyword: 'export excel java spring boot'
---

# Spring Boot Excel Import and Export: XLSX Downloads and Uploads

An export Excel Java Spring Boot workflow needs a controller that returns workbook bytes with the correct content type and download header. Many applications also need an endpoint that reads uploaded Excel files into a database. This guide shows both flows with Axyra Sheets: it validates and stores uploaded rows, produces XLSX and PDF downloads, and covers license startup checks, upload limits, and container configuration.

## TL;DR

- Install the Axyra license once at startup in an `ApplicationRunner`, and open a probe workbook so that a native-library problem fails the deployment instead of the first request.
- In the upload endpoint, open `MultipartFile.getInputStream()` with `Workbook.open(in, format)`, where the format comes from an allow-listed file extension.
- In the download endpoint, return `ResponseEntity<byte[]>` with the XLSX media type and a `Content-Disposition: attachment` header.
- Open one `Workbook` per request inside try-with-resources, and never store a workbook in a Spring bean field.
- Raise `spring.servlet.multipart.max-file-size`, and run on a glibc-based image with a writable temp directory.

## Table of contents

- [What does the finished application do?](#what-does-the-finished-application-do)
- [How does an export Excel Java Spring Boot endpoint work?](#how-does-an-export-excel-java-spring-boot-endpoint-work)
- [Which dependencies does the project need?](#which-dependencies-does-the-project-need)
- [How do you initialize Axyra Sheets when Spring Boot starts?](#how-do-you-initialize-axyra-sheets-when-spring-boot-starts)
- [How do you read an Excel file in Java with Spring Boot?](#how-do-you-read-an-excel-file-in-java-with-spring-boot)
- [How do you export Excel with Spring Boot for download?](#how-do-you-export-excel-with-spring-boot-for-download)
- [How do you export the same data as PDF?](#how-do-you-export-the-same-data-as-pdf)
- [How should you handle large files and concurrent requests?](#how-should-you-handle-large-files-and-concurrent-requests)
- [Which settings matter in production?](#which-settings-matter-in-production)
- [What are the common mistakes?](#what-are-the-common-mistakes)
- [FAQ](#faq)

## What does the finished application do?

The example manages a product price list. It exposes three endpoints, each backed by a service method that uses Axyra Sheets.

| Method and path | Purpose | Response |
|---|---|---|
| `POST /prices/import` | Upload an Excel or CSV file with SKU, name, price, and valid-from columns | JSON summary on success, or the uploaded file with invalid cells highlighted |
| `GET /prices/export.xlsx` | Download the current price list as a workbook | `.xlsx` file |
| `GET /prices/export.pdf` | Download a printable version of the same list | `.pdf` file |

The validation and database logic follows [How to Import Excel Data into a Database in Java]({{ site.axyra_guides }}/import-excel-to-database-java), so this guide focuses on the Spring Boot integration.

## How does an export Excel Java Spring Boot endpoint work?

Spring Boot Excel export has two parts: an Axyra service builds and saves the workbook, and an HTTP controller returns its bytes with XLSX headers. If you also need to read an Excel file in a Java Spring Boot endpoint, the upload path opens a `MultipartFile` stream and passes the workbook to an import service. The sections below show both endpoints and the shared deployment settings.

## Which dependencies does the project need?

Add the Spring web and JDBC starters and Axyra Sheets. The Axyra artifact is served from ZK's repository, so the repository entry is required as well. The [Axyra Sheets installation guide](https://doc.keikai.io/axyra/dev-ref/Installation) lists the Gradle equivalent.

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
        <groupId>io.keikai</groupId>
        <artifactId>axyra-sheets</artifactId>
        <version>{{ site.axyra_version }}</version>
    </dependency>
</dependencies>

<repositories>
    <repository>
        <id>{{ site.axyra_repo_id }}</id>
        <url>{{ site.axyra_repo_url }}</url>
    </repository>
</repositories>
```

Axyra Sheets requires Java 17 or later, which matches the baseline of Spring Boot 3.

## How do you initialize Axyra Sheets when Spring Boot starts?

The license is installed once per process, not once per workbook, so the natural place for it is application startup. An `ApplicationRunner` bean runs after the application context is ready and before the application is considered started.

```java
import io.keikai.axyra.sheets.LicenseInfo;
import io.keikai.axyra.sheets.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class AxyraConfig {

    private static final Logger log = LoggerFactory.getLogger(AxyraConfig.class);

    @Bean
    ApplicationRunner axyraStartup(@Value("${axyra.license-file:}") String licenseFile) {
        return args -> {
            if (!licenseFile.isBlank()) {
                LicenseInfo info = Workbook.setLicense(Files.readString(Path.of(licenseFile)).trim());
                if (!info.isLicensed()) {
                    log.warn("Axyra license is not active ({}); running in Evaluation Mode", info.state());
                }
            }
            // Load the native engine now, so a packaging or platform problem fails the startup.
            try (Workbook probe = Workbook.create()) {
                log.info("Axyra Sheets ready, license state {}", Workbook.licenseStatus().state());
            }
        };
    }
}
```

An invalid or expired license does not throw an exception. The engine silently falls back to Evaluation Mode, which adds an "Axyra Evaluation Copy" sheet and a banner to the output, so the code checks `isLicensed()` and logs a warning. Keep the license file outside the source repository and pass its location through configuration, for example with the `AXYRA_LICENSE_FILE` environment variable mapped to `axyra.license-file`. The [Licensing and Evaluation reference](https://doc.keikai.io/axyra/dev-ref/License) explains the license states.

## How do you read an Excel file in Java with Spring Boot?

A file upload arrives as a multipart request, which is an HTTP request whose body is split into separate parts, one of which carries the file's bytes and original name. Spring MVC exposes that part as a `MultipartFile`. The official Spring guide [Uploading Files](https://spring.io/guides/gs/uploading-files) covers the mechanics in general. For an Excel import, the important point is that `Workbook.open` needs to know the format, and the only hint in an upload is the original file name.

```java
import io.keikai.axyra.sheets.Workbook;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/prices")
public class PriceController {

    static final MediaType XLSX = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    private static final Set<String> ACCEPTED = Set.of("xlsx", "xlsm", "xlsb", "xls", "ods", "csv");

    private final PriceImportService importer;
    private final PriceExportService exporter;

    public PriceController(PriceImportService importer, PriceExportService exporter) {
        this.importer = importer;
        this.exporter = exporter;
    }

    @PostMapping(path = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importPrices(@RequestParam("file") MultipartFile file) throws Exception {
        String format = extension(file.getOriginalFilename());
        if (!ACCEPTED.contains(format)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Upload an Excel, ODS, or CSV file."));
        }

        ImportResult result;
        try (InputStream in = file.getInputStream();
             Workbook wb = Workbook.open(in, format)) {
            result = importer.importPrices(wb, format);
        }

        if (result.errorReport() == null) {
            return ResponseEntity.ok(Map.of("imported", result.importedRows()));
        }
        return ResponseEntity.unprocessableEntity()
                .contentType(XLSX)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("price-list-errors.xlsx").build().toString())
                .body(result.errorReport());
    }

    private static String extension(String name) {
        if (name == null || name.lastIndexOf('.') < 0) {
            return "";
        }
        return name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    // export endpoints follow below
}
```

The service receives the open workbook and returns plain values, which keeps every Axyra object inside the controller's try-with-resources block. A `Sheet` or `Range` used after the workbook is closed throws `IllegalStateException`, so nothing from the workbook should be stored in a field or returned from the service. This is the read Excel file Java Spring Boot path; the download path below creates a new workbook for each request.

```java
import io.keikai.axyra.sheets.CellValue;
import io.keikai.axyra.sheets.Range;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

record ImportResult(int importedRows, byte[] errorReport) {}

@Service
public class PriceImportService {

    private final JdbcTemplate jdbc;

    public PriceImportService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public ImportResult importPrices(Workbook wb, String format) {
        Sheet sheet = "csv".equals(format) ? wb.sheet(0) : wb.sheet("Prices");
        Range used = sheet.usedRange();
        if (used == null) {
            throw new ImportException("The data sheet is empty.");
        }
        CellValue[][] grid = used.values();

        Map<String, Integer> cols = PriceRows.mapHeaders(grid[0], "SKU", "Name", "Price", "Valid From");
        List<RowError> errors = new ArrayList<>();
        List<Price> prices = PriceRows.validate(grid, cols, errors, wb.date1904());

        if (!errors.isEmpty()) {                                  // all-or-nothing policy
            return new ImportResult(0, PriceRows.annotate(wb, sheet, used, errors));
        }

        jdbc.batchUpdate(
                "INSERT INTO price_list (sku, name, price, valid_from) VALUES (?, ?, ?, ?)",
                prices, 500,
                (ps, p) -> {
                    ps.setString(1, p.sku());
                    ps.setString(2, p.name());
                    ps.setBigDecimal(3, p.price());
                    ps.setObject(4, p.validFrom());
                });
        return new ImportResult(prices.size(), null);
    }
}
```

CSV files have no worksheet name, so the service reads sheet 0 for CSV and requires the `Prices` sheet for other formats. `PriceRows` holds the header mapping, validation, and annotation helpers from the import guide. `JdbcTemplate.batchUpdate` sends the rows in batches of 500, and `@Transactional` rolls the whole import back if the database rejects any of them. Map `ImportException` to a `400 Bad Request` with an `@ExceptionHandler` so that a missing column produces a readable message rather than a server error.

## How do you export Excel with Spring Boot for download?

A Spring Boot Excel export endpoint builds a workbook, writes it to a byte array, and returns it with two headers. The `Content-Type` tells the browser what kind of file it is, and `Content-Disposition: attachment` tells it to save the file under the given name instead of trying to display it. XLSX files use the media type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

```java
// in PriceController
@GetMapping("/export.xlsx")
public ResponseEntity<byte[]> exportXlsx() {
    return ResponseEntity.ok()
            .contentType(XLSX)
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                    .filename("price-list.xlsx").build().toString())
            .body(exporter.priceListXlsx());
}
```

```java
import io.keikai.axyra.sheets.ImportOptions;
import io.keikai.axyra.sheets.Sheet;
import io.keikai.axyra.sheets.Workbook;
import io.keikai.axyra.sheets.io.PdfOptions;
import io.keikai.axyra.sheets.style.CellStyle;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriceExportService {

    private final PriceRepository repository;

    public PriceExportService(PriceRepository repository) {
        this.repository = repository;
    }

    public byte[] priceListXlsx() {
        try (Workbook wb = buildWorkbook()) {
            return wb.saveBytes("xlsx");
        }
    }

    public byte[] priceListPdf() {
        try (Workbook wb = buildWorkbook()) {
            Sheet sheet = wb.sheet("Prices");
            sheet.setPrintTitleRows("$1:$1");   // repeat the header row on every page
            return wb.renderPdf(PdfOptions.builder()
                    .title("Price List")
                    .fitTo(PdfOptions.Fit.WIDTH)
                    .build());
        }
    }

    private Workbook buildWorkbook() {
        List<Price> prices = repository.findAll();
        Workbook wb = Workbook.create();
        Sheet sheet = wb.createSheet("Prices");

        sheet.importData(0, 0, prices, ImportOptions.builder()
                .columns("sku", "name", "price", "validFrom")
                .columnLabels("SKU", "Name", "Price", "Valid From")
                .headerStyle(CellStyle.builder().bold().build())
                .build());

        int last = prices.size();   // the header is row 0
        if (last > 0) {
            sheet.range(1, 2, last, 2).setStyle(CellStyle.builder().numberFormat("#,##0.00").build());
            sheet.range(1, 3, last, 3).setStyle(CellStyle.builder().numberFormat("yyyy-mm-dd").build());
        }
        sheet.setColumnWidth(0, 14);
        sheet.setColumnWidth(1, 32);
        sheet.setColumnWidth(2, 12);
        sheet.setColumnWidth(3, 12);
        sheet.freezePanes(1, 0);
        return wb;
    }
}
```

`importData` writes the records in one call and adds the header row. It converts `LocalDate` values to Excel date serials but does not format them, which is why the code applies a `yyyy-mm-dd` number format to the date column. The column list is pinned with `.columns(...)` so that adding a field to the `Price` record does not silently add a column to the export. [How to Write Data to Excel in Java](https://doc.keikai.io/axyra/guides/write-data-to-excel-java) explains these options in detail.

## How do you export the same data as PDF?

Because both exports share `buildWorkbook`, the PDF endpoint only differs in its media type and in calling `priceListPdf`.

```java
// in PriceController
@GetMapping("/export.pdf")
public ResponseEntity<byte[]> exportPdf() {
    return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                    .filename("price-list.pdf").build().toString())
            .body(exporter.priceListPdf());
}
```

PDF rendering uses the fonts installed on the server. A slim container image often has very few fonts, so install the fonts your workbooks use or point `PdfOptions.fontDirs` at a directory that contains them. [How to Convert Excel to PDF in Java](https://doc.keikai.io/axyra/guides/convert-excel-to-pdf-java) covers fonts and page setup.

## How should you handle large files and concurrent requests?

Returning a `byte[]` is simple and works well for files of a few megabytes. Two properties of the engine matter once files or traffic grow.

First, a `Workbook` holds the whole workbook in native memory outside the Java heap, and a `byte[]` response holds the file once more on the heap. For exports with hundreds of thousands of rows, write the file with `StreamWorkbook` to a temporary file, stream that file to the client, and delete it afterwards. The [Streaming Large Files reference](https://doc.keikai.io/axyra/dev-ref/Streaming) describes the writer and its limits.

```java
@GetMapping("/export-all.xlsx")
public ResponseEntity<Resource> exportAll() throws IOException {
    Path tmp = Files.createTempFile("prices-", ".xlsx");
    exporter.writeAllPricesStreaming(tmp);   // uses StreamWorkbook.create(tmp)
    Resource body = new FileSystemResource(tmp) {
        @Override
        public InputStream getInputStream() throws IOException {
            return Files.newInputStream(tmp, StandardOpenOption.DELETE_ON_CLOSE);
        }
    };
    return ResponseEntity.ok()
            .contentType(XLSX)
            .contentLength(Files.size(tmp))
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                    .filename("all-prices.xlsx").build().toString())
            .body(body);
}
```

Second, calls into the native engine are serialized across the whole process. Separate workbooks on separate request threads are safe, but their engine calls take turns rather than running in parallel, and a single workbook must never be shared between threads. For a few concurrent users this is not noticeable. If a large report can block other requests, move it to a background job, for example with Spring's `@Async` or a message queue, and let the client download the result when it is ready. The [Native Loader reference](https://doc.keikai.io/axyra/dev-ref/Native_Loader) describes the threading and memory model.

## Which settings matter in production?

| Setting | Where | Why |
|---|---|---|
| `spring.servlet.multipart.max-file-size` and `max-request-size` | `application.properties` | Spring Boot's default limit of 1 MB rejects many real workbooks |
| License file location | Environment variable or secret mount | Without it, every export carries evaluation marks |
| Container memory limit | Deployment manifest | Native workbook memory is outside `-Xmx`, so leave room above the heap |
| Base image | `Dockerfile` | The Linux native libraries need glibc; Alpine and other musl images are not supported |
| Image architecture | Build platform | An `arm64` image built on Apple Silicon fails to load on `amd64` hosts |
| `java.io.tmpdir` | JVM option | The native library is extracted to the temp directory, which must be writable |

```properties
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
axyra.license-file=${AXYRA_LICENSE_FILE:}
```

The Spring Boot executable jar nests the Axyra jar unchanged, so its `native/**` resources stay on the classpath. The startup probe shown earlier confirms that the engine loads in the packaged application. If you build a shaded jar instead, make sure the shading step does not exclude or filter those resources.

## What are the common mistakes?

| Symptom | Likely cause | Fix |
|---|---|---|
| `MaxUploadSizeExceededException` | The default 1 MB multipart limit | Raise `spring.servlet.multipart.max-file-size` |
| Every download has an extra "Evaluation Copy" sheet | No valid license was installed at startup | Check the startup log for the license state |
| `UnsatisfiedLinkError` on the first request in a container | Alpine base image or wrong architecture | Use a glibc image built for the target architecture |
| `IllegalStateException` in the service | A `Sheet` or `Range` was used after its workbook closed | Return plain values or bytes from the workbook scope |
| `AxyraException: workbook is already in use` | One workbook is shared between requests | Open a new workbook per request |
| The browser shows binary text instead of downloading | `Content-Type` or `Content-Disposition` is missing | Set the XLSX media type and an attachment header |
| A CSV upload fails to open | The format was hard-coded as `xlsx` | Derive the format from the file extension |
| Pod is killed during large exports | Native memory was not counted in the container limit | Raise the limit or use `StreamWorkbook` |

## FAQ

### How do I import and export Excel files in Spring Boot?

For import, accept a `MultipartFile` in a `@PostMapping` method and open it with `Workbook.open(file.getInputStream(), format)`. For export, build a workbook in a service, call `wb.saveBytes("xlsx")`, and return the bytes in a `ResponseEntity` with the XLSX media type and an attachment `Content-Disposition` header.

### What is the content type for an XLSX download in Spring Boot?

Use `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. Spring Boot does not define a constant for it, so create one with `MediaType.parseMediaType`. Use `application/vnd.ms-excel` only for the old `.xls` format.

### Where should I install the Axyra license in a Spring Boot application?

Install it once at startup, for example in an `ApplicationRunner` bean, by calling `Workbook.setLicense`. The license is process-wide, so it does not need to be installed per request. Check `isLicensed()` on the result, because an invalid key falls back to Evaluation Mode without throwing.

### Is Axyra Sheets thread-safe in a Spring Boot web application?

Use one workbook per request and do not share a workbook between threads. Separate workbooks on separate threads are safe, but calls into the native engine are serialized across the process, so very heavy reports are better moved to a background job.

### Can I use Axyra Sheets with Spring WebFlux?

Yes, but the Axyra calls are blocking. Run them on a bounded elastic scheduler, for example with `Mono.fromCallable(...).subscribeOn(Schedulers.boundedElastic())`, so that they do not block the event loop.

## Next steps

- [How to Export Excel Files in Java]({{ site.axyra_guides }}/export-excel-files-java) covers every output format and save option.
- [How to Read an Excel File in Java](https://doc.keikai.io/axyra/guides/read-excel-file-java) explains bulk reading and value types.
- [Native Loader](https://doc.keikai.io/axyra/dev-ref/Native_Loader) explains packaging, containers, and threading.
