#!/usr/bin/env python3
"""Regenerate skills/axyra-sheets/references/api-index.md from an axyra-sheets JAR.

Usage: python3 scripts/gen-axyra-api-index.py path/to/axyra-sheets-<version>.jar

Runs `javap -public` on every public type (the `internal` package excluded) and writes
one line per member, so agents can grep signatures instead of unzipping the Javadoc JAR.
"""
import re
import subprocess
import sys
import zipfile
from pathlib import Path

HEADER = """# Axyra Sheets API index — {version}

Generated with `javap -public` from `axyra-sheets-{version}.jar` (every public
type except `internal`). One member per line: `Type.method(params) → return`. The
`io.keikai.axyra.sheets.` and `java.*` package prefixes are dropped, nested types are
written `Outer.Inner`, and each type line (`Type :: kind in package`) gives the import.
Signatures only: behavior is in SKILL.md and the pitfalls files.

**Do not read this file whole — grep it**, for example:
`grep -E '^Sheet\\.(set|cell)' api-index.md`, `grep -i '^pdfoptions' api-index.md`,
`grep ' :: ' api-index.md` (all types with their packages). If the project resolves
another version, confirm with `javap` on that JAR.
"""


def short(s):
    s = re.sub(r"io\.keikai\.axyra\.sheets\.(?:[a-z]+\.)?", "", s)
    s = re.sub(r"java\.(?:lang|util|nio\.file|time|io|util\.function|util\.concurrent)\.", "", s)
    return s.replace("$", ".")


def javap(jar):
    with zipfile.ZipFile(jar) as z:
        classes = sorted(n[:-6].replace("/", ".") for n in z.namelist()
                         if n.startswith("io/keikai/axyra/sheets/") and n.endswith(".class")
                         and "/internal/" not in n)
    return subprocess.run(["javap", "-public", "-cp", str(jar), *classes],
                          check=True, capture_output=True, text=True).stdout


def main(jar, dst):
    version = re.sub(r"^axyra-sheets-|\.jar$", "", Path(jar).name)
    txt = javap(jar)
    # One block per type; `^}` (multiline) also matches an empty body, which javap prints as "{\n}".
    blocks = re.findall(r"^public [a-z ]*(class|interface|enum|record) io\.keikai\.axyra\.sheets\.([A-Za-z.$]+)([^{\n]*)\{\n(.*?)^\}", txt, re.S | re.M)
    declared = len(re.findall(r"^public [a-z ]*(?:class|interface|enum|record) io\.keikai\.axyra\.sheets\.", txt, re.M))
    if len(blocks) != declared:
        sys.exit(f"parsed {len(blocks)} types but javap declared {declared}; fix the block pattern")
    lines = []
    for kind, name, ext, body in sorted(blocks, key=lambda b: re.sub(r"^[a-z]+\.", "", b[1])):
        pkg = "io.keikai.axyra.sheets" + ("." + name.split(".")[0] if re.match(r"^[a-z]+\.", name) else "")
        cls = re.sub(r"^[a-z]+\.", "", name).replace("$", ".")
        e = short(ext).strip()
        lines.append(f"{cls} :: {kind} in {pkg}" + (f" ({e})" if e else ""))
        consts = []
        for l in body.split("\n"):
            l = l.strip().rstrip(";")
            if not l.startswith("public"):
                continue
            if re.search(r"\b(toString|hashCode)\(\)|\bequals\((java\.lang\.)?Object\)", l):
                continue
            if kind == "enum" and re.search(r"\bstatic .*\b(values\(\)|valueOf\((java\.lang\.)?String\))", l):
                continue
            l = short(l.replace("public ", "").replace("final ", "").replace("abstract ", ""))
            while re.search(r"<[^<>]*, [^<>]*>", l):  # keep generic types as one token
                l = re.sub(r"<([^<>]*), ([^<>]*)>", r"<\1,\2>", l)
            c = re.match(r"([\w.]+)\((.*?)\)(?: throws .*)?$", l)
            m = re.match(r"(static )?(?:<[^>]+> )?(\S+) (\w+)\((.*?)\)(?: throws .*)?$", l)
            if c:
                lines.append(f"new {cls}({c.group(2)})")
            elif m:
                st, ret, mn, args = m.groups()
                lines.append(f"{cls}.{mn}({args}) → {'static ' if st else ''}{ret}")
            elif re.match(r"(static )?\S+ \S+$", l) and kind == "enum":
                consts.append(l.split()[-1])
            elif re.match(r"(static )?\S+ \S+$", l):
                lines.append(f"{cls}.{l.split()[-1]} (field {l.split()[-2]})")
            else:
                m2 = re.match(r"\S+\((.*?)\)", l)
                if m2:
                    lines.append(f"new {cls}({m2.group(1)})")
        if consts:
            lines.append(f"{cls} constants: " + ", ".join(consts))
    open(dst, "w").write(HEADER.format(version=version) + "\n" + "\n".join(lines) + "\n")
    print(len(lines), "lines")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    root = Path(__file__).resolve().parents[1]
    main(sys.argv[1], root / "skills" / "axyra-sheets" / "references" / "api-index.md")
