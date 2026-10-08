#!/usr/bin/env python3
"""Hand-checked corrections to data/fr-collocations.js, applied after every build.

The corpus layer of the French collocations is mined from Tatoeba by looking
for a preposition right after a verb form (build_french_extras.py
``mine_sentence``).  That also catches constructions where the preposition is
not governed by the verb at all: « trop fatigué pour … » (degree + pour),
« pour l'instant », the gérondif « en lisant », « dans trois jours » …  The
Tatoeba dump is not committed, so the corrections live in
``scripts/collocation_fixes/fr.json`` and are applied to the canonical file:

  rules: [{key, match, unless?, why}]
      drop every *corpus* example (src >= 2, i.e. Tatoeba) under ``key`` whose
      text matches the regex ``match`` (and not ``unless``).  Curated and
      authored examples are never touched.
  drop:  [{verb, key, text?, why}]
      drop one example (``text``) or a whole verb + key pair.
  zh:    [{verb, key, text, from, to, why}]
      replace an example's Chinese; idempotent like the conjugation fixes (a
      value already equal to ``to`` is skipped, one matching neither is stale).

Keys and verbs left empty are pruned by canonical_collocations, which also
rebuilds the index.  ``build_french_extras.py --only collocations`` calls
``apply_file`` right after writing, so a rebuild keeps the corrections.

    python3 scripts/fr_collocation_fixes.py        # apply to data/fr-collocations.js in place
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import canonical_collocations  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
FIXES_PATH = ROOT / 'scripts' / 'collocation_fixes' / 'fr.json'
DATA_PATH = ROOT / 'data' / 'fr-collocations.js'
CORPUS_SRC = 2  # meta.sources index of the first Tatoeba source


def header_of(path: Path) -> str:
    lines = path.read_text(encoding='utf-8').split('\n')
    out = []
    for line in lines:
        if not line.startswith('//'):
            break
        out.append(line)
    # canonical_collocations adds its own schema lines after the builder header
    keep = []
    for line in out:
        if line.startswith('// 法语动词搭配 — schema'):
            break
        keep.append(line)
    return '\n'.join(keep) + '\n' if keep else ''


def _drop_examples(verb: dict, key: str, keep) -> int:
    exs = verb['keys'].get(key) or []
    ids = ((verb.get('x') or {}).get('tatoeba') or {}).get(key)
    kept, kept_ids, dropped = [], [], 0
    for i, ex in enumerate(exs):
        if keep(ex):
            kept.append(ex)
            if ids is not None:
                kept_ids.append(ids[i] if i < len(ids) else None)
        else:
            dropped += 1
    verb['keys'][key] = kept
    if ids is not None:
        verb['x']['tatoeba'][key] = kept_ids
    return dropped


def apply_fixes(data: dict, fixes: dict | None = None) -> tuple[int, list[str]]:
    """Apply the fix file to a canonical collocations/1 payload in place."""
    if fixes is None:
        fixes = json.loads(FIXES_PATH.read_text(encoding='utf-8')) if FIXES_PATH.exists() else {}
    verbs = data['verbs']
    changed, stale = 0, []
    for rule in fixes.get('rules', []):
        match = re.compile(rule['match'], re.I)
        unless = re.compile(rule['unless'], re.I) if rule.get('unless') else None
        for verb in verbs.values():
            if rule['key'] not in verb['keys']:
                continue

            def keep(ex, match=match, unless=unless):
                if (ex.get('src') or 0) < CORPUS_SRC:
                    return True
                text = ex['text']
                return not (match.search(text) and not (unless and unless.search(text)))
            changed += _drop_examples(verb, rule['key'], keep)
    for fix in fixes.get('drop', []):
        verb = verbs.get(fix['verb'])
        if verb is None or fix['key'] not in verb['keys']:
            continue  # already gone
        if fix.get('text'):
            changed += _drop_examples(verb, fix['key'], lambda ex, t=fix['text']: ex['text'] != t)
        else:
            changed += _drop_examples(verb, fix['key'], lambda ex: False)
    for fix in fixes.get('zh', []):
        verb = verbs.get(fix['verb'])
        ex = next((e for e in ((verb or {}).get('keys') or {}).get(fix['key'], [])
                   if e['text'] == fix['text']), None)
        if ex is None:
            stale.append(f"{fix['verb']} +{fix['key']}: example not found: {fix['text']}")
            continue
        if ex['zh'] == fix['to']:
            continue
        if ex['zh'] != fix['from']:
            stale.append(f"{fix['verb']} +{fix['key']}: {ex['zh']!r} ≠ from {fix['from']!r}")
            continue
        ex['zh'] = fix['to']
        changed += 1
    return changed, stale


def apply_file(path: Path = DATA_PATH) -> tuple[int, list[str]]:
    data = canonical_collocations.read_collocations('fr', path)
    changed, stale = apply_fixes(data)
    for message in stale:
        print(f'fr_collocation_fixes: stale: {message}', file=sys.stderr)
    if changed:
        canonical_collocations.write_collocations('fr', data, header_of(path), path)
    print(f'fr_collocation_fixes: {changed} changes', file=sys.stderr)
    return changed, stale


if __name__ == '__main__':
    apply_file()
