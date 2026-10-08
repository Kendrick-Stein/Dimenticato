#!/usr/bin/env python3
"""Hand-checked corrections to data/vocab/fr.js, applied on every assemble.

Most Chinese glosses in the Lexique core layer of fr.js came through an
English pivot (Wiktionary EN gloss -> ECDICT), which picks wrong senses of
English homographs (marche -> "march" -> 三月) and resolves phrases on their
first word.  The raw corpora that build that layer live in /tmp and are not
committed, so a correction made only in fr.js would be lost on a rebuild from
fresh corpora.  Corrections therefore live in ``scripts/vocab_fixes/fr.json``
and ``build_french_vocabulary.py assemble`` applies them right before it writes
fr.js — the same contract as scripts/conjugation_fixes/ + ``apply_fixes`` in
canonical_conjugations.py:

  {"word": w, "field": "zh"|"en"|"zhAlt", "from": old, "to": new, "why": …}
      A field already equal to ``to`` is skipped (idempotent).  A field matching
      neither ``from`` nor ``to`` is reported as stale and left alone: the
      upstream data changed, re-check that entry by hand.
  {"add": {word, pos, gender?, zh, en, …}, "why": …}
      Adds an entry (for example a cognate the corpus layers lack) unless a
      layer already supplies that headword.  Added entries carry
      ``ADDED_SOURCE`` and get their rank from wordfreq like textbook rows.

Usage (the fixes are normally applied by the builder's assemble step):
    python3 scripts/build_french_vocabulary.py assemble     # rebuild fr.js with the fixes
    python3 scripts/fr_vocab_fixes.py check                 # report stale / pending fixes
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXES_PATH = ROOT / 'scripts' / 'vocab_fixes' / 'fr.json'
ADDED_SOURCE = '人工校对补充（scripts/vocab_fixes/fr.json）'
FIELDS = ('zh', 'en', 'zhAlt')
GLOSS_KEY_STRIP = re.compile(r'[\s;；,，、.。…·\-]+')


def load_fixes(path: Path = FIXES_PATH) -> list[dict]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding='utf-8'))


def _norm_entry(add: dict) -> dict:
    """An 'add' record in the shape vocab_legacy.from_fr returns."""
    pos = add.get('pos', '')
    return {
        'word': add['word'], 'display': add.get('display') or add['word'],
        'pos': pos, 'posAll': [], 'gender': add.get('gender', '') if pos == 'noun' else '',
        'level': '', 'levelSource': 'freq-band',
        'zh': add['zh'], 'zhAlt': list(add.get('zhAlt') or []), 'en': add.get('en', ''),
        'forms': {'feminine': add.get('feminine', ''), 'construction': '', 'pluraleTantum': False,
                  'pronominal': False, 'variants': []},
        'tags': list(add.get('tags') or []), 'source': ADDED_SOURCE,
        '_ranked': False, '_lexique': 0,
    }


def apply_fixes(entries: list[dict], fixes: list[dict] | None = None,
                key=lambda w: w) -> tuple[int, list[str]]:
    """Apply the fix list to from_fr()-shaped entries in place.

    ``key`` maps a headword to the merge key used for "already present"
    checks on additions.  Returns (applied count, stale messages)."""
    fixes = load_fixes() if fixes is None else fixes
    by_word = {e['word']: e for e in entries}
    keys = {key(e['word']) for e in entries}
    applied, stale = 0, []
    for fix in fixes:
        if 'add' in fix:
            row = fix['add']
            if row['word'] in by_word or key(row['word']) in keys:
                continue
            entry = _norm_entry(row)
            entries.append(entry)
            by_word[entry['word']] = entry
            keys.add(key(entry['word']))
            applied += 1
            continue
        word, field = fix['word'], fix['field']
        if field not in FIELDS:
            stale.append(f'{word}: unknown field {field!r}')
            continue
        entry = by_word.get(word)
        if entry is None:
            stale.append(f'{word}: headword not found')
            continue
        current = entry.get(field, [] if field == 'zhAlt' else '')
        if current == fix['to']:
            continue
        if current != fix['from']:
            stale.append(f'{word}.{field}: {current!r} ≠ from {fix["from"]!r}')
            continue
        entry[field] = fix['to']
        applied += 1
    return applied, stale


def gloss_collisions(entries: list[dict]) -> list[str]:
    """Same rule as glossKey() in scripts/validate_vocab.js."""
    seen, out = {}, []
    for e in entries:
        k = GLOSS_KEY_STRIP.sub('', e.get('zh') or '')
        if k and k in seen:
            out.append(f'{e["word"]} / {seen[k]}: {e["zh"]}')
        else:
            seen.setdefault(k, e['word'])
    return out


def main() -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import vocab_schema as vs  # noqa: E402
    if sys.argv[1:] != ['check']:
        sys.exit(__doc__)
    data = vs.read_vocab('fr')
    entries = [dict(e, zhAlt=list(e.get('zhAlt') or [])) for e in data['entries']]
    fixes = load_fixes()
    applied, stale = apply_fixes(entries, fixes)
    print(f'{len(fixes)} fixes; {applied} not yet in fr.js; {len(stale)} stale')
    for s in stale:
        print('  stale:', s)
    sys.exit(1 if applied or stale else 0)


if __name__ == '__main__':
    main()
