#!/usr/bin/env python3
"""Build the downloadable skill from skills/; use --check to detect a stale ZIP."""

import argparse
import io
from pathlib import Path
import zipfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    source = root / "skills" / "axyra-sheets"
    destination = root / "assets" / "downloads" / "axyra-sheets-skill.zip"
    # Everything under skills/axyra-sheets/ ships. Anything customers must not
    # receive belongs outside that directory (see skills/internal/), never behind
    # an exclusion here -- a file added to the source must not be able to go
    # missing from the archive silently.
    files = sorted(
        path
        for path in source.rglob("*")
        if path.is_file() and not any(part.startswith(".") for part in path.relative_to(source).parts)
    )
    if not files:
        parser.error(f"No skill files found under {source}")
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            info = zipfile.ZipInfo("axyra-sheets/" + path.relative_to(source).as_posix(),
                                   date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
    contents = buffer.getvalue()
    if args.check:
        if not destination.exists() or destination.read_bytes() != contents:
            parser.exit(1, "Skill ZIP is missing or stale; run scripts/package-axyra-skill.py\n")
        print("Skill ZIP matches source")
    else:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(contents)
        print(f"Packaged {len(files)} files: {destination}")


if __name__ == "__main__":
    main()
