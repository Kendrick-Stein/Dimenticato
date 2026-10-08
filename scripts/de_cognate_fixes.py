#!/usr/bin/env python3
"""Audited corrections for data/de-cognates.js, applied idempotently.

scripts/build_german_extras.py mines German<->English pairs by spelling, so it
also picks up English words that leaked into the German frequency list from
subtitles (County, butch, File, Department), brand and person names (Toyota,
Einstein) and look-alikes that are not related (Rand/rand, Kern/kern).
scripts/de_cognate_fixes.json lists them:

    {"drop": {"County": "why", …},
     "set":  [{"word": "Cape", "field": "zh", "from": "…", "to": "…", "why": "…"}]}

apply() also re-syncs `zh` of ordinary (non-false-friend) entries, and noun
`gender`/`display`, from data/vocab/de.js, so the cleaned vocabulary glosses (scripts/de_vocab_fixes)
reach the cognate cards.  `set` records win over the sync.  Re-running is a
no-op; a `set` record whose `from` no longer matches is reported as stale.

Progress note: cognate progress is stored per pattern group
(dimenticato_cognate_progress_<code>.mastered = pattern keys), not per word,
so dropping entries orphans nothing unless a whole pattern disappears.

    python3 scripts/de_cognate_fixes.py            # apply
    python3 scripts/de_cognate_fixes.py --check    # exit 1 if anything would change
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import canonical_cognates as cc  # noqa: E402
import vocab_schema as vs        # noqa: E402

FIX_FILE = ROOT / 'scripts' / 'de_cognate_fixes.json'


def apply(doc, fixes=None, vocab=None):
    """Mutates and returns (doc, stats)."""
    fixes = fixes or json.loads(FIX_FILE.read_text(encoding='utf-8'))
    vocab = vocab if vocab is not None else {e['word']: e for e in vs.read_vocab('de')['entries']}
    drop = fixes.get('drop', {})
    sets = {}
    for r in fixes.get('set', []):
        sets.setdefault(r['word'], []).append(r)
    stats = {'dropped': 0, 'zhSynced': 0, 'nounSynced': 0, 'set': 0, 'stale': []}
    kept = []
    for e in doc['entries']:
        if e['word'] in drop:
            stats['dropped'] += 1
            continue
        v = vocab.get(e['word'])
        if not e.get('falseFriend') and v and v.get('zh') and e.get('zh') != v['zh'] \
                and not any(r['field'] == 'zh' for r in sets.get(e['word'], [])):
            e['zh'] = v['zh']
            stats['zhSynced'] += 1
        if v and e.get('pos') == 'noun':
            for k in ('gender', 'display'):      # re-derived genders (de_vocab_fixes)
                if e.get(k) and v.get(k) and e[k] != v[k]:
                    e[k] = v[k]
                    stats['nounSynced'] += 1
        for r in sets.get(e['word'], []):
            cur = e.get(r['field'])
            if cur == r['to']:
                continue
            if cur != r.get('from'):
                stats['stale'].append(f"{e['word']} {r['field']}: {cur!r} != from {r.get('from')!r}")
                continue
            e[r['field']] = r['to']
            stats['set'] += 1
        kept.append(e)
    doc['entries'] = kept
    return doc, stats


def apply_file(check=False, verbose=True):
    path = cc.path_for('de')
    doc = cc.read('de')
    doc, stats = apply(doc)
    changed = stats['dropped'] or stats['zhSynced'] or stats['nounSynced'] or stats['set']
    if changed and not check:
        doc = cc.canonicalize('de', doc)          # recount, prune empty patterns/aliases
        cc.write('de', doc, path=path)
    if verbose:
        print(f"de_cognate_fixes: dropped {stats['dropped']}, zh synced {stats['zhSynced']}, "
              f"gender/display synced {stats['nounSynced']}, set {stats['set']}, stale {len(stats['stale'])}")
        for s in stats['stale']:
            print('  stale:', s)
    return stats


if __name__ == '__main__':
    check = '--check' in sys.argv[1:]
    st = apply_file(check=check)
    if check and (st['dropped'] or st['zhSynced'] or st['nounSynced'] or st['set'] or st['stale']):
        sys.exit(1)
