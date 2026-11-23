#!/usr/bin/env python3
"""Bounded literal queries against the bundled, versioned .NET API index."""
import argparse
from pathlib import Path
import re
import sys

INDEX = Path(__file__).resolve().parent.parent / 'references/api-index.md'
TYPE_LINE = re.compile(r'^(\S+) :: .* in (\S+)')


def split_member(line, name):
    """Member name of an index line owned by type `name`, or None when not owned by it."""
    if line.startswith('new ' + name + '('):
        return 'new'
    if line.startswith(name + '['):
        return 'this'
    if line.startswith(name + ' values:'):
        return 'values'
    if line.startswith(name + '.'):
        rest = line[len(name) + 1:]
        member = re.split(r'[ (<\[]', rest, maxsplit=1)[0]
        if '.' in member or ' :: ' in line:
            return None  # A nested type owns its own members.
        return member
    return None


def member_name(line, owners):
    for name in sorted(owners, key=len, reverse=True):
        m = split_member(line, name)
        if m:
            return m
    return None


def query(index, version, types=(), members=()):
    text = index.read_text(encoding='utf-8')
    indexed = re.search(r'^# Axyra Sheets \.NET API index [—-] (\S+)', text, re.M)
    if not indexed or indexed.group(1) != version:
        actual = indexed.group(1) if indexed else 'unknown'
        raise ValueError(f'Index version {actual} differs from resolved {version}; inspect the relevant member in that package (its Axyra.Sheets.xml or the compiler).')
    lines = text.splitlines()
    declarations = {}
    for line in lines:
        match = TYPE_LINE.match(line)
        if match:
            name, namespace = match.groups()
            declarations[name] = (line, namespace + '.' + name)
    if not types and not members:
        raise ValueError('Specify a type or a member; an unfiltered index dump is not supported.')
    selected = []
    for requested in types:
        requested = requested.replace('+', '.')
        found = [name for name, (_, full) in declarations.items()
                 if requested in (name, full) or requested == re.sub(r'<.*', '', name)]
        if len(found) != 1:
            raise ValueError(f'Type {requested!r} not found uniquely in the index; use its exact public type name (nested types as Outer.Inner). Missing entries do not prove unsupported behavior.')
        if found[0] not in selected:
            selected.append(found[0])
    if not types:
        selected = list(declarations)
    matches = []
    owners = []
    for line in lines:
        if TYPE_LINE.match(line):
            continue
        # Prefer the longest owner so `CellValue.Number.Value` belongs to CellValue.Number.
        for name in sorted(selected, key=len, reverse=True):
            member = split_member(line, name)
            if member is None:
                continue
            if not members or member in members:
                matches.append(line)
                if name not in owners:
                    owners.append(name)
            break
    return [declarations[name][0] for name in (selected if types else owners)], matches, (selected if types else owners)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--version', required=True, help='Axyra.Sheets package version resolved by the project')
    parser.add_argument('--type', action='append', default=[], dest='types', help='Exact type; omit to discover the owner of a named member. Use Outer.Inner for nested types.')
    parser.add_argument('--member', action='append', default=[], help='Exact member name; repeat as needed. Use new for constructors, this for indexers, values for enum values')
    parser.add_argument('--offset', type=int, default=0)
    parser.add_argument('--limit', type=int, default=30, help='Maximum member lines per page (1–80)')
    args = parser.parse_args(argv)
    if args.offset < 0 or not 1 <= args.limit <= 80:
        parser.error('offset must be nonnegative and limit must be between 1 and 80')
    try:
        declarations, matches, owners = query(INDEX, args.version, args.types, args.member)
    except (OSError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 2
    print(f'Source: {INDEX.name}; version: {args.version}; matches: {len(matches)}')
    page = matches[args.offset:args.offset + args.limit]
    if not args.types:
        shown = {member_name(line, owners) and next(n for n in sorted(owners, key=len, reverse=True) if split_member(line, n)) for line in page}
        declarations = [d for d in declarations if d.split(' :: ', 1)[0] in shown]
    for line in declarations:
        print(line)
    if not matches:
        print('No matching member in this index. Check spelling (PascalCase), then inspect the relevant type in the resolved package; this is not evidence of unsupported behavior.', file=sys.stderr)
        return 1
    end = min(len(matches), args.offset + args.limit)
    for line in page:
        print(line)
    if args.offset < len(matches):
        print(f'Shown: {args.offset + 1}–{end} of {len(matches)}')
    else:
        print(f'Offset {args.offset} is beyond {len(matches)} matches.', file=sys.stderr)
        return 2
    if end < len(matches):
        print(f'More matches: narrow --member or use --offset {end}.')
    missing = sorted(set(args.member) - {member_name(line, owners) for line in matches})
    if missing:
        print('Members absent from this query: ' + ', '.join(missing) + '. Check spelling or scope; absence is not proof of unsupported behavior.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
