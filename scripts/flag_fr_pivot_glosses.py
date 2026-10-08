#!/usr/bin/env python3
"""Flag French vocabulary glosses that probably took the wrong sense in the EN pivot.

The Lexique core layer of data/vocab/fr.js (``src`` = the ``词频 Lexique …
中文经英文转写 ECDICT`` source) got its Chinese by looking the French word's
English Wiktionary gloss up in ECDICT.  That pivot fails in two known ways
(see scripts/vocab_fixes/README in the fix list header):

  1. homograph: the English word has several unrelated senses and the pivot
     copied the wrong ones (marche -> "march" -> 三月；行军);
  2. first word / light verb: a phrase gloss ("to make a sudden movement")
     resolved on one word of the phrase.

ECDICT itself is not in the repository, but data/vocab/en.js carries ECDICT's
Chinese for 24k English headwords, so it is used to recover, per Chinese
segment of the French gloss, which English word supplied it.  A row is flagged
when

  * homograph  - a segment came from an English word on HOMOGRAPHS (curated:
                 English words whose ECDICT senses are unrelated), or
  * spread     - every segment came from ONE English word with >= 5 ECDICT
                 senses, none of them confirmed by a second English sense of the
                 French word (the pivot "dumped" one polysemous entry), or
  * lightverb  - a segment came from a light verb (make, take, get, …) while the
                 English gloss is a longer phrase, or
  * unsupported- no segment can be traced to any English sense of the word
                 (the gloss came from a sense that is not the word's own), or
  * marker     - the gloss still carries the "（英：…）" fallback marker.

Usage:
    python3 scripts/flag_fr_pivot_glosses.py [--top N] [--all] [--tsv OUT]

Prints a summary and writes TSV rows ``rank word reasons zh en`` (default to
stdout when --tsv is omitted).  Rows already corrected by
scripts/vocab_fixes/fr.json are reported as ``fixed`` and not counted.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import vocab_schema as vs  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
FIXES = ROOT / 'scripts' / 'vocab_fixes' / 'fr.json'

CORE_PREFIX = '词频 Lexique'

# English words whose ECDICT entries mix unrelated senses.  Curated from the
# errors found in review (each one produced at least one wrong French gloss).
HOMOGRAPHS = {
    'march', 'band', 'start', 'wee', 'drug', 'account', 'flight', 'liver', 'cooked',
    'mirror', 'guy', 'bear', 'fire', 'lie', 'rest', 'mean', 'kind', 'light', 'fair',
    'bank', 'bat', 'bow', 'can', 'date', 'fine', 'fit', 'ground', 'iron', 'jam',
    'last', 'lead', 'left', 'match', 'mine', 'miss', 'mould', 'mold', 'nail', 'novel',
    'palm', 'park', 'pen', 'pitch', 'plant', 'pool', 'press', 'pupil', 'rank', 'right',
    'ring', 'rock', 'rose', 'row', 'ruler', 'scale', 'seal', 'second', 'sentence',
    'set', 'sink', 'spring', 'stick', 'stock', 'story', 'strike', 'suit', 'swallow',
    'tear', 'tie', 'tire', 'trip', 'watch', 'well', 'wind', 'yard', 'sheet', 'state',
    'will', 'may', 'present', 'object', 'subject', 'party', 'board', 'post', 'mark',
    'note', 'charge', 'check', 'cross', 'deal', 'draw', 'fall', 'figure', 'file',
    'firm', 'hand', 'head', 'line', 'lot', 'order', 'pass', 'point', 'pound', 'race',
    'record', 'release', 'report', 'run', 'saw', 'school', 'sound', 'spell', 'square',
    'staff', 'stand', 'step', 'stuff', 'term', 'trunk', 'type', 'wave', 'temple',
    'hide', 'bark', 'bass', 'bill', 'bluff', 'boot', 'bound', 'box', 'buck', 'cape',
    'case', 'cell', 'club', 'coach', 'count', 'crane', 'crash', 'current', 'diet',
    'dock', 'down', 'duck', 'even', 'express', 'fan', 'fast', 'fawn', 'flat', 'fleet',
    'fly', 'gum', 'hamper', 'hatch', 'host', 'jar', 'jet', 'key', 'kid', 'lap',
    'lean', 'leaves', 'lime', 'list', 'live', 'lock', 'log', 'long', 'mass', 'mint',
    'mole', 'net', 'pack', 'pad', 'pants', 'patient', 'peer', 'pick', 'pile', 'pine',
    'pit', 'plain', 'plot', 'pole', 'pop', 'port', 'punch', 'quarry', 'racket', 'rare',
    'refrain', 'reservation', 'rifle', 'rocket', 'rush', 'sage', 'sole', 'spirit',
    'spot', 'stable', 'stalk', 'steer', 'stern', 'stole', 'stoop', 'store', 'strand',
    'tap', 'tender', 'tip', 'toast', 'top', 'train', 'trace', 'utter', 'vault', 'yarn',
    'jumper', 'chest', 'figure', 'grave', 'hail', 'ill', 'leave', 'cleave', 'company',
    'content', 'desert', 'entrance', 'minute', 'refuse', 'wound', 'dove', 'produce',
    'pee', 'wee-wee', 'smashed', 'sozzled', 'chap', 'stripe', 'jump',
}
LIGHT_VERBS = {
    'make', 'take', 'get', 'do', 'have', 'go', 'put', 'set', 'give', 'come', 'keep',
    'let', 'be', 'become', 'turn', 'run', 'hold', 'bring', 'cause', 'render', 'carry',
}

SEG_SPLIT = re.compile(r'[，,；;、]')
MARKUP = re.compile(r'<[^>]*>|\([^)]*\)|（[^）]*）|\[[^\]]*\]')
EN_SPLIT = re.compile(r'[;,/]')
PAREN = re.compile(r'\([^)]*\)')


def segments(zh: str) -> list[str]:
    zh = MARKUP.sub('', zh or '')
    return [s.strip(' .。') for s in SEG_SPLIT.split(zh) if s.strip(' .。')]


def en_terms(gloss: str) -> list[tuple[str, int]]:
    """(english lookup term, word count of the phrase it came from)."""
    out: list[tuple[str, int]] = []
    text = PAREN.sub(' ', gloss or '')
    for part in EN_SPLIT.split(text):
        part = re.sub(r'\s+', ' ', part).strip(' .').lower()
        part = re.sub(r'^(?:to|a|an|the) ', '', part)
        if not part:
            continue
        words = part.split(' ')
        out.append((part, len(words)))
        if len(words) > 1:
            out.append((words[0], len(words)))  # what a first-word pivot would use
    return out


def load_ecdict() -> tuple[dict[str, list[str]], dict[str, dict[str, int]]]:
    """English word -> Chinese segments, and segment -> ECDICT sense group.

    ECDICT separates its part-of-speech groups with '；' ("行军,步伐；进军；(March)三月"),
    so the group index tells noun / verb / proper-noun senses apart."""
    data = vs.read_vocab('en')
    table: dict[str, list[str]] = {}
    groups: dict[str, dict[str, int]] = {}
    for e in data['entries']:
        key = e['word'].lower()
        if key in table:
            continue
        segs, where = [], {}
        for gi, group in enumerate(re.split(r'[；;]', e.get('zh', ''))):
            proper = bool(re.search(r'\([A-Z][^)]*\)', group))
            for seg in segments(group):
                segs.append(seg)
                where.setdefault(seg, 100 + gi if proper else gi)
        table[key], groups[key] = segs, where
    return table, groups


def load_fixed() -> set[str]:
    if not FIXES.exists():
        return set()
    return {f['word'] for f in json.loads(FIXES.read_text(encoding='utf-8'))
            if isinstance(f, dict) and f.get('word')}


def group_of(seg: str, where: dict[str, int]) -> int | None:
    if seg in where:
        return where[seg]
    for x, g in where.items():
        if len(seg) >= 2 and (seg in x or x in seg):
            return g
    return None


def flag(entry: dict, ecdict: dict[str, list[str]], groups: dict[str, dict[str, int]]) -> list[str]:
    zh = entry.get('zh', '')
    reasons: list[str] = []
    if '（英：' in zh:
        reasons.append('marker')
    segs = [s for s in segments(zh) if s]
    if not segs:
        return reasons
    terms = en_terms(entry.get('en', ''))
    origin: dict[str, list[tuple[str, int]]] = {s: [] for s in segs}
    for term, nwords in terms:
        senses = ecdict.get(term)
        if not senses:
            continue
        for s in segs:
            if any(s == x or (len(s) >= 2 and (s in x or x in s)) for x in senses):
                origin[s].append((term, nwords))
    traced = {s: o for s, o in origin.items() if o}
    if not traced:
        if terms:
            reasons.append('unsupported')
        return reasons
    for s, o in traced.items():
        words = {t for t, _ in o}
        if any(t in HOMOGRAPHS for t in words) and len(words) == 1:
            reasons.append('homograph:' + next(iter(words)))
            break
    for s, o in traced.items():
        if all(t in LIGHT_VERBS and n > 1 for t, n in o):
            reasons.append('lightverb:' + o[0][0])
            break
    # one polysemous English word supplied segments from different ECDICT
    # part-of-speech groups, or from its capitalised proper-noun sense
    by_word: dict[str, set[int]] = {}
    for s, o in traced.items():
        for t, _ in o:
            g = group_of(s, groups.get(t, {}))
            if g is not None:
                by_word.setdefault(t, set()).add(g)
    for t, gs in by_word.items():
        confirmed = sum(1 for o in traced.values() if any(u != t for u, _ in o))
        if confirmed:
            continue
        if any(g >= 100 for g in gs) and not entry['word'][:1].isupper() and entry.get('pos') != 'properNoun' \
                and entry.get('en', '')[:1].islower():
            reasons.append('propernoun:' + t)
            break
        if len(gs) >= 2:
            reasons.append('crosspos:' + t)
            break
    sources = {t for o in traced.values() for t, _ in o}
    if len(sources) == 1 and len(traced) >= 2:
        only = next(iter(sources))
        if len(ecdict.get(only, [])) >= 5:
            reasons.append('spread:' + only)
    return reasons


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--top', type=int, default=0, help='only the N most frequent entries')
    ap.add_argument('--all', action='store_true', help='also check textbook-layer rows')
    ap.add_argument('--tsv', type=Path)
    args = ap.parse_args()

    data = vs.read_vocab('fr')
    sources = data['meta']['sources']
    ecdict, groups = load_ecdict()
    fixed = load_fixed()
    rows, counts, nfixed = [], Counter(), 0
    entries = data['entries'][:args.top] if args.top else data['entries']
    for e in entries:
        pivot = sources[e.get('src', 0)].startswith(CORE_PREFIX)
        if not pivot and not args.all and '（英：' not in e['zh']:
            continue
        reasons = flag(e, ecdict, groups)
        if not reasons:
            continue
        if e['word'] in fixed:
            nfixed += 1
            continue
        for r in reasons:
            counts[r.split(':')[0]] += 1
        rows.append('\t'.join([str(e['rank']), e['word'], ','.join(reasons), e['zh'],
                               (e.get('en') or '')[:120]]))
    out = '\n'.join(rows) + ('\n' if rows else '')
    if args.tsv:
        args.tsv.write_text(out, encoding='utf-8')
    else:
        sys.stdout.write(out)
    print(f'flag_fr_pivot_glosses: {len(rows)} suspect rows '
          f'({", ".join(f"{k} {v}" for k, v in counts.most_common())}); '
          f'{nfixed} already in the fix list', file=sys.stderr)


if __name__ == '__main__':
    main()
