#!/usr/bin/env python3
"""Audited corrections for data/vocab/de.js, applied idempotently.

The German vocabulary builder (scripts/build_german_vocabulary.py) needs a
1.4 GB download cache that is long gone, so its output is corrected after the
fact.  Every correction is a committed record in scripts/de_vocab_fixes/*.json:

    {"word": "Schiff", "field": "gender", "from": "m/f/n", "to": "n", "why": "…"}

`field` is a top-level entry field (zh, zhAlt, en, pos, posAll, gender,
display) or `forms.<key>`.  `to: null` deletes the field.  Like
scripts/conjugation_fixes/ + canonical_conjugations.apply_fixes:
  - a field already equal to `to` is skipped (re-applying is a no-op);
  - a field equal to `from` is rewritten;
  - anything else is reported as stale and left alone (the upstream data
    changed: re-check that record by hand).

The builder calls apply_file() after its final write, so a rebuild cannot
bring an audited error back.

    python3 scripts/de_vocab_fixes.py                 # apply (default)
    python3 scripts/de_vocab_fixes.py --check         # report only, exit 1 if anything would change
    python3 scripts/de_vocab_fixes.py propose-zh      # regenerate zh.json from the current file
    python3 scripts/de_vocab_fixes.py propose-en      # regenerate en.json (place senses, overlong glosses)
    python3 scripts/de_vocab_fixes.py propose-gender NOUNS_CSV
        # regenerate genders.json from german-nouns (dewiktionary, CC BY-SA 4.0:
        # `pip download german-nouns`, german_nouns/nouns.csv) + gender-decisions.json

The `propose-*` modes are the heuristics that produced the committed lists;
re-run them only on the *unfixed* builder output and review the diff.
"""
from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import vocab_schema as vs  # noqa: E402

FIX_DIR = ROOT / 'scripts' / 'de_vocab_fixes'
FIX_FILES = ['genders.json', 'zh.json', 'en.json', 'pos.json']
ARTICLE = {'m': 'der', 'f': 'die', 'n': 'das'}

MISSING = object()


def _get(entry, field):
    if field.startswith('forms.'):
        return (entry.get('forms') or {}).get(field[6:], MISSING)
    return entry.get(field, MISSING)


def _set(entry, field, value):
    if field.startswith('forms.'):
        forms = entry.setdefault('forms', {})
        if value is None:
            forms.pop(field[6:], None)
            if not forms:
                entry.pop('forms', None)
        else:
            forms[field[6:]] = value
    elif value is None:
        entry.pop(field, None)
    else:
        entry[field] = value


def load_fixes():
    fixes = []
    for name in FIX_FILES:
        path = FIX_DIR / name
        if path.exists():
            fixes.extend(json.loads(path.read_text(encoding='utf-8')))
    return fixes


def apply_fixes(entries, fixes=None):
    """Apply the fix records to v1 entries in place. Returns (applied, stale)."""
    fixes = load_fixes() if fixes is None else fixes
    by_word = {e['word']: e for e in entries}
    applied, stale = 0, []
    for fix in fixes:
        entry = by_word.get(fix['word'])
        if entry is None:
            stale.append(f"{fix['word']}: not in de.js")
            continue
        field, to = fix['field'], fix['to']
        cur = _get(entry, field)
        if (cur is MISSING and to is None) or cur == to:
            continue
        frm = fix.get('from')
        if not ((cur is MISSING and frm is None) or cur == frm):
            stale.append(f"{fix['word']} {field}: {cur if cur is not MISSING else None!r} ≠ from {frm!r}")
            continue
        _set(entry, field, to)
        applied += 1
    return applied, stale


def apply_file(verbose=True, check=False):
    """Re-emit data/vocab/de.js with every fix applied (rank order unchanged)."""
    result = {}

    def update(entries, meta):
        result['applied'], result['stale'] = apply_fixes(entries)

    if check:
        data = vs.read_vocab('de')
        applied, stale = apply_fixes(data['entries'])
        result = {'applied': applied, 'stale': stale}
    else:
        vs.rewrite_vocab('de', update)
    if verbose:
        print(f"de_vocab_fixes: {result['applied']} applied, {len(result['stale'])} stale")
        for s in result['stale'][:40]:
            print('  stale:', s)
    return result


# ---------------------------------------------------------------------------
# propose-zh: sense-numbering artefacts and glued-in examples (pgh.csv residue)
# ---------------------------------------------------------------------------

CJK = '㐀-鿿豈-﫿'
HAS_CJK = re.compile(f'[{CJK}]')
LAT = "A-Za-zÄÖÜäöüß"
# "2. Vt", "3.+ sich", "回合2. o. Pl" — a sense number after a space, a
# separator, a closing bracket or a Chinese character.
SENSE_SPLIT = re.compile(rf'(?:(?<=^)|(?<=[\s;；,，{CJK})）]))\s*[2-9]\s*\.\s*(?=\S)')
HAS_SENSE = re.compile(rf'(?:^|[\s;；,，{CJK})）])\s*[2-9]\s*\.\s*\S')
LEAD_MARK = re.compile(
    r'^(?:Vt|Vi|Vr|V|Adv|Adj|Koj|Konj|mst\s+Sg|o\.\s*Pl\.?|ohne\s+Pl\.?|nur\s+Pl\.?|P[lI]\.?(?:\s*-\w*)?'
    r'|Sg|[mfn](?:/[mfn])?)(?:\s*,\s*(?:-\w*|\(dekl\.[^)]*\)))*(?=[\s,;.(（]|$)[\s,;.]*')
PLURAL_MARK = re.compile(r'^(?:nur\s+)?P[lI]\b')
FORMS_PAREN = re.compile(rf'^\(([{LAT}]+,\s*)+[{LAT}\s]+\)\s*')
GOV = re.compile(rf'^[^{CJK}（]*?(?:\+|\bsich\b)[^{CJK}（]*')


def _gov_text(raw):
    t = re.sub(r'[()]', ' ', raw)
    t = re.sub(r'\b(Vt|Vi|Vr)\b', ' ', t)
    t = re.sub(r'\+\s*', '+ ', t)
    t = re.sub(r'\s+', ' ', t).strip(' ,;.')
    t = re.sub(r'^\+ sich\b', 'sich', t)
    return t


def clean_sense(s):
    s = s.strip(' ;；,，')
    plural = False
    while True:
        m = LEAD_MARK.match(s)
        if not m or not m.group(0).strip():
            break
        if PLURAL_MARK.match(m.group(0)):
            plural = True
        s = s[m.end():].lstrip(' ,;.')
    s = FORMS_PAREN.sub('', s)
    gov = ''
    m = GOV.match(s)
    if m and m.group(0).strip():
        gov = _gov_text(m.group(0))
        s = s[m.end():].strip()
    if gov:
        s = f'（{gov}）{s}'
    if plural:
        s = f'（复数）{s}'
    return s.strip()


def _tidy(zh):
    zh = re.sub(rf'(?<=[{CJK}])\s+(?=[{CJK}])', '', zh)          # "录 音" -> "录音"
    zh = re.sub(r'\s*,\s*(,\s*)+', ', ', zh)
    zh = re.sub(r'\s*([;；])\s*', '; ', zh)
    senses, seen = [], set()
    for part in zh.split('; '):
        part = part.strip(' ,，')
        if part and part not in seen:
            seen.add(part)
            senses.append(part)
    return '; '.join(senses)


def clean_numbered(zh):
    if not HAS_SENSE.search(zh):
        return zh
    parts = SENSE_SPLIT.split(zh)
    segs = [clean_sense(x) for x in parts]
    return '; '.join(x for x in segs if HAS_CJK.search(x))


INLINE_MARK = re.compile(r'(^|[\s;；,，.]|(?<=[' + CJK + r']))(Vt|Vi|Vr|P[lI]\.?|Adv|o\.\s?Pl\.?|nur Pl)(?![' + LAT + r'])')


def clean_inline(zh):
    if not INLINE_MARK.search(zh):
        return zh
    out = []
    for part in re.split(r'[;；]', zh):
        part = part.strip()
        q = re.sub(rf'(?<=[{CJK}])\s*(?:Vt|Vi|Vr)\s*(?=[{CJK}])', '; ', part)
        q = re.sub(rf'(?<![{LAT}])(?:Vt|Vi|Vr)(?![{LAT}])\s*,?\s*', '', q)
        q = re.sub(rf'(?<![{LAT}])\.?o\.\s*Pl\.?\s*', '', q)
        q = re.sub(rf'\s*(?<![{LAT}])(?:nur\s+)?P[lI]\.?(?![{LAT}])\s*', '; （复数）', q)
        q = re.sub(rf'(?<![{LAT}])Adv(?![{LAT}])\s*', '', q)
        out.append(q.strip(' ,，;'))
    return '; '.join(p for p in out if p)


# A German example phrase glued after the gloss: "…; im Dienst sein 在上班".
PHRASE = re.compile(
    rf"(?:^|(?<=[\s;；,，{CJK}]))((?:[{LAT}~][{LAT}.~/!'-]*\.?(?:\s*\([^)（{CJK}]*\))?\s+)+"
    rf"[{LAT}~][{LAT}.~/!'-]*!?\s*(?:\([^)（{CJK}]*\)\s*)?)(?=[({CJK}（])")


def split_examples(zh, word=''):
    """'X, Y； im Dienst sein 在上班' -> ('X, Y', ['im Dienst sein 在上班'])."""
    m = PHRASE.search(zh)
    if not m:
        return zh, []
    head = zh[:m.start()].rstrip(' ,，;；')
    if (not HAS_CJK.search(head) or head.count('(') > head.count(')')
            or head.count('（') > head.count('）')):
        return zh, []            # a gloss that *is* the phrase, or an ECDICT parenthesis
    tail = zh[m.start():]
    examples, rest = [], []
    # the tail may hold several phrase+gloss pairs separated by ; or , —
    # chunks that do not start with German go back to the gloss
    for chunk in re.split(r'\s*[;；]\s*|\s*,\s*(?=[' + LAT + r'~])', tail):
        chunk = _tidy(chunk.strip(' ,，'))
        if not chunk:
            continue
        if re.match(f'[{LAT}~]', chunk):
            examples.append(re.sub(r'~\s*', word + ' ', chunk).strip() if word else chunk)
        else:
            rest.append(chunk)
    if rest:
        head = '; '.join([head] + rest)
    return head, examples


def propose_zh():
    data = vs.read_vocab('de')
    overrides_path = FIX_DIR / 'zh-manual.json'
    manual = json.loads(overrides_path.read_text(encoding='utf-8')) if overrides_path.exists() else {}
    fixes = []
    stats = Counter()
    for e in data['entries']:
        z0 = e['zh']
        alt0 = e.get('zhAlt')
        if e['word'] in manual:
            m = manual[e['word']]
            z, alt = m['zh'], m.get('zhAlt')
            stats['manual'] += 1
        else:
            z = clean_numbered(z0)
            if z != z0:
                stats['numbered'] += 1
            z1 = clean_inline(z)
            if z1 != z:
                stats['inline-marker'] += 1
            z2, ex = split_examples(z1, e['word'])
            if ex:
                stats['examples'] += 1
            z = _tidy(z2) if (z2 != z0) else z0
            alt = (alt0 or []) + [x for x in ex if x not in (alt0 or [])] if ex else alt0
        if z != z0:
            fixes.append({'word': e['word'], 'field': 'zh', 'from': z0, 'to': z})
        if alt != alt0:
            fixes.append({'word': e['word'], 'field': 'zhAlt', 'from': alt0, 'to': alt})
    (FIX_DIR / 'zh.json').write_text(dump_list(fixes), encoding='utf-8')
    print(f'zh.json: {len(fixes)} records', dict(stats))


# ---------------------------------------------------------------------------
# propose-en: overlong Wiktionary English glosses
# ---------------------------------------------------------------------------

# Proper-noun senses carried over from the homograph's Wiktionary page
# ("Lage: …; a city in Lippe district, North Rhine-Westphalia, Germany").
PLACE_SENSE = re.compile(
    r'^(?:an? |the )?(?:[\w-]+ )?(?:city|town|village|municipality|market town|river|lake|mountain|canton|'
    r'district|region|state|island|surname|(?:male |female )?given name|habitational surname|'
    r'Ortsteil|borough|suburb|hamlet|quarter)\b.*\b(?:of|in|on|from)\b'
    r'|^[A-Z][\w-]+ \((?:a |the )?(?:canton|city|town|river|state|region)\b'
    r'|\b(?:Germany|Austria|Switzerland|Bavaria|Saxony|Hesse|Styria|Tyrol|Vorarlberg|Westphalia|Württemberg|Italy|France|Poland|Liechtenstein|Czech Republic|Luxembourg|Belgium|Netherlands|Denmark)\)?$')
EN_MAX = 100          # characters; longer glosses are condensed
SENSE_MAX = 60
SENSES_MAX = 4
EXPLAIN = re.compile(r'(?:usually|especially|often|chiefly|mostly|e\.g\.|i\.e\.|which|that|who|where|in |of |as |any |more |and |or |but )')


def _strip_parens(s):
    prev = None
    while prev != s:
        prev = s
        s = re.sub(r'\s*\([^()]*\)', '', s)
    return re.sub(r'\s+', ' ', s).strip(' ,;')


def condense_en(en):
    senses = [x.strip() for x in en.split('; ') if x.strip()]
    kept = [x for x in senses if not PLACE_SENSE.search(x)] or senses[:1]
    out = '; '.join(kept)
    if len(out) <= EN_MAX:
        return out
    short, seen = [], set()
    for x in kept:
        y = _strip_parens(x) or x
        if len(y) > SENSE_MAX and ', ' in y:
            # keep the leading synonym list ("hatter, capper, milliner"),
            # stop at the first explanatory clause
            acc = ''
            for part in y.split(', '):
                if acc and (len(part.split()) > 4 or EXPLAIN.match(part)
                            or len(acc) + len(part) + 2 > SENSE_MAX):
                    break
                acc = f'{acc}, {part}' if acc else part
            y = acc
        if len(y) > SENSE_MAX or len(y) < 2 or re.search(r'\b(?:the|a|an|of|in|to|and|or)$', y):
            continue                    # a usage note or a clipped clause, not a gloss
        if y.lower() not in seen:
            seen.add(y.lower())
            short.append(y)
        if len(short) == SENSES_MAX:
            break
    return '; '.join(short) if short else out


def propose_en():
    data = vs.read_vocab('de')
    manual_path = FIX_DIR / 'en-manual.json'
    manual = json.loads(manual_path.read_text(encoding='utf-8')) if manual_path.exists() else {}
    fixes, stats = [], Counter()
    for e in data['entries']:
        en0 = e.get('en')
        if not en0:
            continue
        en = manual.get(e['word']) or condense_en(en0)
        if en != en0:
            stats['place' if len(en0) <= EN_MAX or any(PLACE_SENSE.search(x) for x in en0.split('; ')) else 'long'] += 1
            fixes.append({'word': e['word'], 'field': 'en', 'from': en0, 'to': en})
    (FIX_DIR / 'en.json').write_text(dump_list(fixes), encoding='utf-8')
    print(f'en.json: {len(fixes)} records', dict(stats))


def dump_list(records):
    return '[' + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in records) + ']\n'


# ---------------------------------------------------------------------------
# propose-gender: noun gender + plural from german-nouns (dewiktionary)
# ---------------------------------------------------------------------------

def load_german_nouns(path):
    rows = defaultdict(list)
    with open(path, encoding='utf-8') as f:
        for x in csv.DictReader(f):
            if 'Substantiv' not in x['pos'].split(','):
                continue
            gs = [x['genus']] if x['genus'] else [x[f'genus {i}'] for i in range(1, 5) if x[f'genus {i}']]
            gs = [g for g in gs if g in 'mfn']
            if not gs:
                continue
            pl = [x[k] for k in ('nominativ plural', 'nominativ plural*', 'nominativ plural 1',
                                 'nominativ plural 2') if x[k] and x[k] != '—']
            rows[x['lemma']].append({'g': gs, 'pl': pl})
    return rows


def propose_gender(nouns_csv):
    """genders.json from dewiktionary + the hand decisions in gender-decisions.json.

    Rule: a noun's gender is the dewiktionary gender of its (only) noun
    record; the first genus of a record that lists variants ("Monat m, n
    regional") is the standard one.  Second genders survive only where
    gender-decisions.json says so: homographs whose shipped glosses carry
    both senses (der See / die See, die Steuer / das Steuer) and true
    free variants (der/das Teil, der/das Joghurt).  The plural follows the
    chosen record when the shipped plural is not one of its forms.
    """
    rows = load_german_nouns(nouns_csv)
    decisions = json.loads((FIX_DIR / 'gender-decisions.json').read_text(encoding='utf-8'))
    data = vs.read_vocab('de')
    fixes, stats = [], Counter()
    for e in data['entries']:
        if e.get('pos') != 'noun' or not e.get('gender'):
            continue
        word, g0 = e['word'], e['gender']
        recs = rows.get(word) or []
        dec = decisions.get(word)
        if dec:
            genders = dec['gender'].split('/')
            primary = dec.get('primary', genders[0])
            stats['decision'] += 1
        elif '/' not in g0:
            # a single gender is only rewritten when no dewiktionary record has it
            if not recs or any(g0 in r['g'] for r in recs):
                continue
            firsts = sorted({r['g'][0] for r in recs})
            if len(firsts) > 1:
                print('  undecided single:', word, g0, [r['g'] for r in recs])
                continue
            genders, primary = firsts, firsts[0]
            stats['single-wrong'] += 1
        elif not recs:
            stats['multi-no-source'] += 1
            continue
        else:
            firsts = []
            for r in recs:
                if r['g'][0] not in firsts:
                    firsts.append(r['g'][0])
            if len(firsts) > 1:
                stats['homograph-undecided'] += 1
                print('  undecided homograph:', word, g0, [r['g'] for r in recs])
                continue
            genders, primary = firsts, firsts[0]
            stats['single-source'] += 1
        gender = vs.join_genders(genders)
        if gender != g0:
            fixes.append({'word': word, 'field': 'gender', 'from': g0, 'to': gender,
                          'why': dec.get('why') if dec else 'dewiktionary'})
        # display: primary article + bare word (keep any "/" separable marks: none for nouns)
        disp0 = e.get('display')
        disp = f'{ARTICLE[primary]} {word}'
        if disp0 != disp:
            fixes.append({'word': word, 'field': 'display', 'from': disp0, 'to': disp})
        # plural from the record(s) of the chosen gender
        pl0 = (e.get('forms') or {}).get('plural')
        cands = []
        for r in recs:
            if r['g'][0] in genders or (dec and set(r['g']) & set(genders)):
                cands += [p for p in r['pl'] if p not in cands]
        if dec and 'plural' in dec:
            pl = dec['plural']
        elif cands and pl0 not in cands:
            pl = cands[0]
        else:
            pl = pl0
        if pl != pl0:
            fixes.append({'word': word, 'field': 'forms.plural', 'from': pl0, 'to': pl})
            stats['plural'] += 1
    (FIX_DIR / 'genders.json').write_text(dump_list(fixes), encoding='utf-8')
    print(f'genders.json: {len(fixes)} records', dict(stats))


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['propose-zh']:
        propose_zh()
    elif args[:1] == ['propose-en']:
        propose_en()
    elif args[:1] == ['propose-gender']:
        propose_gender(args[1])
    elif args[:1] == ['--check']:
        r = apply_file(check=True)
        sys.exit(1 if r['applied'] or r['stale'] else 0)
    else:
        apply_file()
