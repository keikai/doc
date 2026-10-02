# Axyra skill distribution

`axyra-sheets/` is the maintained source for the customer-facing skill. Personal
installations such as `~/.codex/skills/axyra-sheets/` are installed copies, not the
release source. Review and copy changes deliberately to avoid overwriting local edits.

After editing the source, regenerate the website download from the repository root:

```sh
python3 scripts/package-axyra-skill.py
python3 scripts/package-axyra-skill.py --check
bundle exec jekyll build
```

`axyra-sheets/references/api-index.md` is generated: agents grep it for signatures
instead of unzipping the Javadoc JAR. Regenerate it whenever the skill moves to a new
Axyra version, and update the version named in `SKILL.md` to match:

```sh
python3 scripts/gen-axyra-api-index.py ~/.m2/repository/io/keikai/axyra-sheets/<version>/axyra-sheets-<version>.jar
```

Commit source changes and `assets/downloads/axyra-sheets-skill.zip` together. The
packager uses fixed timestamps and file permissions for reproducible archives.
Jekyll excludes `skills/` because `SKILL.md` front matter is agent metadata, not
website front matter; customers get the intact files through the ZIP or GitHub.

The customer entry is `axyra/dev-ref/AI_Assisted_Development.md`, linked from
Quick Start. Keep installation instructions and download paths aligned with the
archive. Behavioral evaluation requests are in `internal/evaluation.md`, which stays
outside `axyra-sheets/` so the packager cannot ship it -- put anything else that
customers should not receive there too. Packaging and build checks do not
establish migration or runtime correctness.
