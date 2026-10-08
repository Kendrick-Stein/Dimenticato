#!/usr/bin/env python3
"""Audited corrections for data/de-course.js (course/1), applied idempotently.

scripts/build_german_extras.py reads the course back in and rewrites it, so
the corrections live in scripts/de_course_fixes.json and are re-applied after
every emit_course():

    {"grammar":    [{"unit", "label", "from", "to", "labelTo"?, "why"}],
     "addGrammar": [{"unit", "label", "slug", "why"}],
     "words":      [{"unit", "from", "to", "why"}],
     "levelExceptions": [{"unit", "slug", "why"}]}

* grammar: retarget a unit's grammar link (matched by label).  Most links had
  been collapsed onto chapter overviews (p2/ch01/t01 for every modal verb) or
  onto unrelated topics (p2/ch07/t02 Aktionsart for every passive), several of
  them above the unit's level.
* addGrammar: link a grammar topic a unit clearly covers but never referenced.
* words: swap a word for one at the unit's level (A1 units had C1/C2 words:
  Koalition, Redaktion, Jahrgang, argumentieren).
* levelExceptions: a topic tagged one level above the unit that the textbook
  nevertheless teaches there.  Read by scripts/validate_de_en_quality.js; any
  other link above the unit's level fails that validator.

A record whose `to` is already in place is skipped; one whose `from` is in
place is applied; anything else is reported as stale.  Course progress is
stored per level only (dimenticato_course_level_<code>), and word progress is
keyed by the vocab word, so swapping unit words orphans nothing.

    python3 scripts/de_course_fixes.py            # apply
    python3 scripts/de_course_fixes.py --check    # exit 1 if anything would change
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import course_schema  # noqa: E402

FIX_FILE = ROOT / 'scripts' / 'de_course_fixes.json'
COURSE = ROOT / 'data' / 'de-course.js'


def read_course(path=COURSE):
    script = ("const fs=require('fs'),vm=require('vm');"
              "const c=vm.createContext({});c.globalThis=c;c.window=c;"
              "const d=vm.runInContext(fs.readFileSync(%s,'utf8')+';GERMAN_COURSE_DATA',c);"
              "process.stdout.write(JSON.stringify(d));") % json.dumps(str(path))
    out = subprocess.run(['node', '-e', script], check=True, stdout=subprocess.PIPE)
    return json.loads(out.stdout.decode('utf-8'))


def read_header(path=COURSE):
    lines = []
    for line in path.read_text(encoding='utf-8').split('\n'):
        if line.startswith('const '):
            break
        lines.append(line)
    return lines


def apply(course, fixes=None):
    """Mutates and returns (course, stats)."""
    fixes = fixes or json.loads(FIX_FILE.read_text(encoding='utf-8'))
    units = {u['id']: u for lv in course['levels'] for u in lv['units']}
    stats = {'grammar': 0, 'addGrammar': 0, 'words': 0, 'stale': []}

    for r in fixes.get('grammar', []):
        u = units.get(r['unit'])
        label_to = r.get('labelTo') or r['label']
        links = (u or {}).get('grammar') or []
        link = next((g for g in links if g.get('label') == r['label']), None) \
            or next((g for g in links if g.get('label') == label_to), None)
        if link is None:
            stats['stale'].append('grammar %s %s: label missing' % (r['unit'], r['label']))
            continue
        if link.get('slug') == r['to'] and link['label'] == label_to:
            continue
        if link.get('slug') not in (r['from'], r['to']):
            stats['stale'].append('grammar %s %s: %s' % (r['unit'], r['label'], link.get('slug')))
            continue
        link['slug'] = r['to']
        link['label'] = label_to
        stats['grammar'] += 1

    for r in fixes.get('addGrammar', []):
        u = units.get(r['unit'])
        if u is None:
            stats['stale'].append('addGrammar %s: unit missing' % r['unit'])
            continue
        links = u.setdefault('grammar', [])
        if any(g.get('slug') == r['slug'] and g.get('label') == r['label'] for g in links):
            continue
        links.append({'label': r['label'], 'slug': r['slug']})
        stats['addGrammar'] += 1

    for r in fixes.get('words', []):
        u = units.get(r['unit'])
        words = (u or {}).get('words') or []
        if r['from'] in words:
            i = words.index(r['from'])
            if r['to'] in words:
                del words[i]
            else:
                words[i] = r['to']
            stats['words'] += 1
        elif r['to'] not in words:
            stats['stale'].append('words %s %s->%s' % (r['unit'], r['from'], r['to']))
    return course, stats


def apply_file(path=COURSE, check=False, verbose=True):
    course = read_course(path)
    course, stats = apply(course)
    changed = stats['grammar'] + stats['addGrammar'] + stats['words']
    if verbose:
        print('de_course_fixes: %d grammar retargets, %d grammar links added, %d words swapped, %d stale'
              % (stats['grammar'], stats['addGrammar'], stats['words'], len(stats['stale'])))
        for s in stats['stale']:
            print('  stale: ' + s)
    if check:
        return changed == 0
    if changed:
        course_schema.write('de', course, read_header(path), path=str(path))
    return True


if __name__ == '__main__':
    ok = apply_file(check='--check' in sys.argv[1:])
    sys.exit(0 if ok else 1)
