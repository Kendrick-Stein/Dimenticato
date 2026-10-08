#!/usr/bin/env python3
"""cognates/1 — the one shape every cognate file ships in (docs/data-schema.md).

    python3 scripts/canonical_cognates.py            # rewrite it / de / fr in place
    python3 scripts/canonical_cognates.py de         # one language
    python3 scripts/canonical_cognates.py --check    # exit 1 if a file is not canonical
    ... | python3 scripts/canonical_cognates.py --emit it [--out PATH]   # JSON job on stdin

The builders keep their own internal row shape (`italian` / `german` / `french`,
`chinese`, `patternType`, `similarityScore` …) and hand their rows to `emit()`.
Running this script on its own converts the shipped files, and is idempotent: a file
that is already cognates/1 is re-normalised to the same bytes.

    entry = {word, display?, pos?, gender?, level?, rank, en, zh, pattern?,
             similarity?, difficulty, falseFriend?, src?, x?}

* `similarity` is 0…1 (two decimals). It compares `word` with `en`, except on a false
  friend, where it compares `word` with `falseFriend.lookalike` (the resemblance is
  the whole point of the entry).
* `difficulty` is 1 (easy) / 2 (medium) / 3 (hard).  For ordinary entries it is
  curve(similarity): ≥0.80 → 1, ≥0.50 → 2, else 3 — the bands the browse filter prints.
* `falseFriend` = {lookalike, zh?, word?, note?}: the deceptive English word, what it
  really means, how the target language says it, and an optional authored warning
  (when absent the app renders "≠ lookalike（zh）= word").
* `pattern` is a key of `meta.patterns` ({label, zh}); entries with no regular
  correspondence omit it.  `meta.aliases` maps the old patternType strings to keys
  (saved Pattern Groups progress is migrated through it).
* Everything language-specific lives under `x`.

`to_legacy()` is the inverse, for builders that re-read their own output
(build_french_extras.py --only cognate-glosses).
"""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

SCHEMA = 'cognates/1'

LANGS = {
    'it': {'file': 'data/it-cognates.js', 'head': 'italian', 'cn': '意大利语', 'name': 'Italiano'},
    'de': {'file': 'data/de-cognates.js', 'head': 'german', 'cn': '德语', 'name': 'Deutsch'},
    'fr': {'file': 'data/fr-cognates.js', 'head': 'french', 'cn': '法语', 'name': 'Français'},
}

# Builder POS spellings -> vocab POS enum (docs/vocab-schema.md).
POS_MAP = {
    # German builder
    'Substantiv': 'noun', 'Verb': 'verb', 'Adjektiv': 'adjective', 'Adverb': 'adverb',
    'Interjektion': 'interjection', 'Präposition': 'preposition', 'Konjunktion': 'conjunction',
    'Pronomen': 'pronoun', 'Numerale': 'numeral',
    # French builder
    'n.m': 'noun', 'n.f': 'noun', 'n.': 'noun', 'adj.': 'adjective', 'v.': 'verb', 'adv.': 'adverb',
}
POS_ENUM = (
    'noun', 'properNoun', 'verb', 'adjective', 'adverb', 'pronoun', 'determiner', 'article',
    'preposition', 'conjunction', 'numeral', 'interjection', 'particle', 'prefix', 'suffix',
    'phrase', 'abbreviation',
)
# inverse, per language (to_legacy)
LEGACY_POS = {
    'de': {'noun': 'Substantiv', 'verb': 'Verb', 'adjective': 'Adjektiv', 'adverb': 'Adverb',
           'interjection': 'Interjektion', 'preposition': 'Präposition',
           'conjunction': 'Konjunktion', 'pronoun': 'Pronomen', 'numeral': 'Numerale'},
    'fr': {'adjective': 'adj.', 'verb': 'v.', 'adverb': 'adv.'},
}
GENDER_ORDER = ('m', 'f', 'n', 'm/f', 'm/n', 'f/n', 'm/f/n')

DIFFICULTY = {'easy': 1, 'medium': 2, 'hard': 3}
DIFFICULTY_NAME = {v: k for k, v in DIFFICULTY.items()}
EASY_MIN, MEDIUM_MIN = 80, 50


def curve(score):
    """similarity percentage (or None) -> difficulty 1/2/3; same bands as the browse filter."""
    if score is None:
        return 3
    return 1 if score >= EASY_MIN else (2 if score >= MEDIUM_MIN else 3)


# --- patterns ---------------------------------------------------------------

FALSE_FRIEND = 'false-friend'
IDENTICAL = 'identical'
NAMED = {
    '假朋友 faux-ami': FALSE_FRIEND, 'falscher Freund': FALSE_FRIEND,
    'identisch': IDENTICAL, '同形词 identical': IDENTICAL,
}
NAMED_LABEL = {
    FALSE_FRIEND: {'it': 'falso amico', 'de': 'falscher Freund', 'fr': 'faux ami'},
    IDENTICAL: {'it': 'identico', 'de': 'identisch', 'fr': 'identique'},
}
# Moved here from the NAMED_PATTERNS table cognate-app.js used to carry.
NAMED_ZH = {
    FALSE_FRIEND: '长得像英语词，意思并不一样。每条都标了它真正对应的英语词。',
    IDENTICAL: '这一组词和英语拼写完全一样，只有发音和词性需要单独记。',
}
SUFFIX_RE = re.compile(r'^(-[^/]+)/(-[^（(]*)(?:[（(](.+)[)）])?$')
LETTER_RE = re.compile(r'^([^↔]+)↔([^↔]+)$')
EMPTY_SUFFIX_RE = re.compile(r'^-?[Ø∅]$')


def pattern_parts(lang, legacy):
    """old patternType string -> (key, {label, zh}); (None, None) for no pattern."""
    if not legacy:
        return None, None
    cn = LANGS[lang]['cn']
    if legacy in NAMED:
        key = NAMED[legacy]
        return key, {'label': NAMED_LABEL[key][lang], 'zh': NAMED_ZH[key]}
    m = SUFFIX_RE.match(legacy)
    if m:
        src, en, note = m.group(1).strip(), m.group(2).strip(), m.group(3)
        key = '%s/%s' % (src, en)
        tail = '（%s）' % note if note else ''
        if EMPTY_SUFFIX_RE.match(en):
            zh = '%s词尾 “%s” 在英语里没有对应后缀%s。' % (cn, src, tail)
        else:
            zh = '%s词尾 “%s” 对应英语的 “%s”%s。' % (cn, src, en, tail)
        return key, {'label': key, 'zh': zh}
    m = LETTER_RE.match(legacy)
    if m:
        a, b = m.group(1).strip(), m.group(2).strip()
        return legacy, {'label': legacy,
                        'zh': '这一组词在英语和%s之间存在 “%s ↔ %s” 的字母对应。' % (cn, a, b)}
    return legacy, {'label': legacy, 'zh': '这一组词共享同一条与英语的对应规律。'}


# --- entries ----------------------------------------------------------------

FIELD_ORDER = ('word', 'display', 'pos', 'gender', 'level', 'rank', 'en', 'zh', 'pattern',
               'similarity', 'difficulty', 'falseFriend', 'src', 'x')
FF_ORDER = ('lookalike', 'zh', 'word', 'note')
FR_DEFAULT_PATTERN_NOTE = '无规则后缀对应（仅词形接近）'

# legacy fields handled explicitly; anything else on a row is a hard error, so a
# builder that grows a field cannot have it silently dropped.
COMMON_LEGACY = {'english', 'chinese', 'patternType', 'similarityScore', 'difficulty', 'rank',
                 'falseFriend', 'falseFriendOf', 'falseFriendChinese', 'warning', 'lookalike',
                 'italianFor', 'germanFor', 'display', 'pos', 'partOfSpeech', 'gender', 'level',
                 'source', 'similarityBasis'}
X_LEGACY = {
    'it': (),
    'de': ('englishChinese', 'englishRank'),
    'fr': ('italian', 'italianSimilarity', 'italianPatternType', 'semanticGate', 'patternNote',
           'chineseSource'),
}


def ordered(d, order):
    out = {k: d[k] for k in order if k in d}
    out.update({k: v for k, v in d.items() if k not in out})
    return out


def compose_note(ff):
    return '≠ %s%s%s' % (ff.get('lookalike', ''),
                         '（%s）' % ff['zh'] if ff.get('zh') else '',
                         ' = %s' % ff['word'] if ff.get('word') else '')


class Ctx(object):
    """Per-file interning tables (meta.sources, meta.x.zhSources) and pattern registry."""

    def __init__(self, lang, meta=None):
        meta = meta or {}
        self.lang = lang
        self.sources = list(meta.get('sources') or [])
        self.zh_sources = list((meta.get('x') or {}).get('zhSources') or [])
        self.patterns = dict(meta.get('patterns') or {})
        self.aliases = dict(meta.get('aliases') or {})

    @staticmethod
    def intern(table, value):
        if value not in table:
            table.append(value)
        return table.index(value)


def from_legacy(lang, row, ctx):
    head = LANGS[lang]['head']
    allowed = COMMON_LEGACY | {head} | set(X_LEGACY[lang])
    unknown = set(row) - allowed
    if unknown:
        raise ValueError('%s %r: unknown legacy field(s) %s' % (lang, row.get(head), sorted(unknown)))
    word = row[head]
    e = {'word': word}
    if row.get('display') and row['display'] != word:
        e['display'] = row['display']
    raw_pos = row.get('pos') or row.get('partOfSpeech')
    if raw_pos:
        if raw_pos not in POS_MAP and raw_pos not in POS_ENUM:
            raise ValueError('%s %r: unmapped pos %r' % (lang, word, raw_pos))
        e['pos'] = POS_MAP.get(raw_pos, raw_pos)
    gender = row.get('gender')
    if not gender and raw_pos in ('n.m', 'n.f'):
        gender = raw_pos[-1]
    if gender:
        e['gender'] = gender
    if row.get('level'):
        e['level'] = row['level']
    e['rank'] = row['rank']
    e['en'] = row['english']
    e['zh'] = row['chinese']

    key, info = pattern_parts(lang, row.get('patternType'))
    if key:
        e['pattern'] = key
        ctx.patterns.setdefault(key, info)
        if row['patternType'] != key:
            ctx.aliases[row['patternType']] = key

    score = row.get('similarityScore')
    if score is not None:
        sim = round(score / 100.0, 2)
        e['similarity'] = int(sim) if sim == int(sim) else sim

    ff = None
    if row.get('falseFriend'):
        ff = {'lookalike': row.get('falseFriendOf') or row.get('lookalike')}
        if row.get('falseFriendChinese'):
            ff['zh'] = row['falseFriendChinese']
        target = row.get('italianFor') or row.get('germanFor')
        if target:
            ff['word'] = target
        if row.get('warning') and row['warning'] != compose_note(ff):
            ff['note'] = row['warning']
        if not ff['lookalike']:
            raise ValueError('%s %r: false friend without a lookalike' % (lang, word))
        e['falseFriend'] = ff
    basis = row.get('similarityBasis')
    if basis is not None and (basis == 'lookalike') != bool(ff):
        raise ValueError('%s %r: similarityBasis %r disagrees with falseFriend' % (lang, word, basis))

    diff = DIFFICULTY[row['difficulty']]
    if not ff:
        # One contract for every language: the browse filter prints the bands, so an
        # ordinary entry's difficulty is the band of its score (German used to cut at 70).
        diff = curve(score)
    e['difficulty'] = diff

    if row.get('source'):
        e['src'] = ctx.intern(ctx.sources, row['source'])

    x = {}
    for k in X_LEGACY[lang]:
        v = row.get(k)
        if v is None or v == '':
            continue
        if k == 'chineseSource':
            x['zhSrc'] = ctx.intern(ctx.zh_sources, v)
        elif k == 'patternNote' and v == FR_DEFAULT_PATTERN_NOTE:
            continue
        else:
            x[k] = v
    if x:
        e['x'] = x
    return e


def normalise(lang, e, ctx):
    """Canonical entry -> canonical entry (idempotency path)."""
    e = dict(e)
    if e.get('display') == e['word']:
        del e['display']
    if isinstance(e.get('similarity'), float) and e['similarity'] == int(e['similarity']):
        e['similarity'] = int(e['similarity'])
    for k in [k for k, v in e.items() if v is None or v == '' or v == {} or v == []]:
        del e[k]
    if e.get('falseFriend'):
        e['falseFriend'] = ordered(e['falseFriend'], FF_ORDER)
    if 'x' in e:
        e['x'] = dict(sorted(e['x'].items(), key=lambda kv: (X_LEGACY[lang] + ('zhSrc',)).index(kv[0])
                             if kv[0] in X_LEGACY[lang] + ('zhSrc',) else 99))
    return ordered(e, FIELD_ORDER)


def enrich_from_vocab(lang, entries):
    """Fill pos / gender from data/vocab/<lang>.js where the builder had none (Italian)."""
    if all(e.get('pos') for e in entries):
        return
    import vocab_schema
    by_word = {}
    for v in vocab_schema.read_vocab(lang)['entries']:
        by_word.setdefault(v['word'], v)
    for e in entries:
        v = by_word.get(e['word'])
        if not v or e.get('pos') or not v.get('pos'):
            continue
        e['pos'] = v['pos']
        if v['pos'] == 'noun' and v.get('gender') and not e.get('gender'):
            e['gender'] = v['gender']


def canonicalize(lang, payload, meta=None):
    """legacy row list or cognates/1 doc -> cognates/1 doc."""
    if isinstance(payload, dict):
        meta = dict(payload.get('meta') or {}, **(meta or {}))
        ctx = Ctx(lang, payload.get('meta'))
        entries = [normalise(lang, e, ctx) for e in payload['entries']]
    else:
        ctx = Ctx(lang, meta)
        entries = [normalise(lang, from_legacy(lang, r, ctx), ctx) for r in payload]
        meta = dict(meta or {})
    enrich_from_vocab(lang, entries)
    if lang == 'it':
        import italian_fixes  # reviewed fix list: scripts/it_fixes/cognates.json
        entries = italian_fixes.apply_cognates(entries)
    entries = [ordered(e, FIELD_ORDER) for e in entries]

    words = [e['word'] for e in entries]
    if len(words) != len(set(words)):
        raise ValueError('%s: duplicate words' % lang)
    used = {e['pattern'] for e in entries if e.get('pattern')}
    patterns = {k: ctx.patterns[k] for k in sorted(used, key=lambda k: (-sum(
        1 for e in entries if e.get('pattern') == k), k))}
    aliases = {old: new for old, new in sorted(ctx.aliases.items()) if new in used}

    out = {
        'schema': SCHEMA,
        'lang': lang,
        'name': meta.get('name') or '%s ↔ English cognates' % LANGS[lang]['name'],
        'count': len(entries),
        'builder': meta.get('builder') or 'scripts/canonical_cognates.py',
        'sources': ctx.sources or list(meta.get('sources') or []),
        'licences': list(meta.get('licences') or []),
        'patterns': patterns,
    }
    if aliases:
        out['aliases'] = aliases
    extra = dict(meta.get('x') or {})
    if ctx.zh_sources:
        extra['zhSources'] = ctx.zh_sources
    if extra:
        out['x'] = extra
    for k, v in meta.items():
        if k not in out and k not in ('patterns', 'aliases', 'x'):
            out[k] = v
    return {'meta': out, 'entries': entries}


def to_legacy(lang, doc):
    """cognates/1 doc -> the builder's legacy rows (inverse of from_legacy)."""
    meta = doc['meta']
    head = LANGS[lang]['head']
    inv_alias = {}
    for old, new in (meta.get('aliases') or {}).items():
        inv_alias.setdefault(new, old)
    zh_sources = (meta.get('x') or {}).get('zhSources') or []
    rows = []
    for e in doc['entries']:
        r = {head: e['word'], 'english': e['en'], 'chinese': e['zh']}
        p = e.get('pattern')
        r['patternType'] = inv_alias.get(p, p) if p else None
        sim = e.get('similarity')
        r['similarityScore'] = int(round(sim * 100)) if sim is not None else None
        r['difficulty'] = DIFFICULTY_NAME[e['difficulty']]
        r['rank'] = e['rank']
        if lang == 'de':
            r['display'] = e.get('display') or e['word']
            r['pos'] = LEGACY_POS['de'].get(e.get('pos'), e.get('pos'))
            r['gender'] = e.get('gender')
        if lang == 'fr':
            pos = e.get('pos')
            r['partOfSpeech'] = ('n.' + e['gender']) if pos == 'noun' else LEGACY_POS['fr'].get(pos, pos)
            r['similarityBasis'] = 'lookalike' if e.get('falseFriend') else 'english'
            if e.get('gender'):
                r['gender'] = e['gender']
        if e.get('level'):
            r['level'] = e['level']
        ff = e.get('falseFriend')
        if ff:
            r['falseFriend'] = True
            if lang == 'fr':
                r['lookalike'] = ff['lookalike']
            else:
                r['falseFriendOf'] = ff['lookalike']
                if ff.get('zh'):
                    r['falseFriendChinese'] = ff['zh']
                if ff.get('word'):
                    r['italianFor' if lang == 'it' else 'germanFor'] = ff['word']
            if lang != 'de':
                r['warning'] = ff.get('note') or compose_note(ff)
        elif lang != 'it':
            r['falseFriend'] = False
        if 'src' in e:
            r['source'] = meta['sources'][e['src']]
        x = e.get('x') or {}
        for k in X_LEGACY[lang]:
            if k == 'chineseSource' and 'zhSrc' in x:
                r[k] = zh_sources[x['zhSrc']]
            elif k in x:
                r[k] = x[k]
        if lang == 'fr' and r['patternType'] is None and 'patternNote' not in r:
            r['patternNote'] = FR_DEFAULT_PATTERN_NOTE
        if lang == 'de':
            r.setdefault('englishRank', None)
        rows.append(r)
    return rows


# --- file I/O -----------------------------------------------------------------

def path_for(lang):
    return ROOT / LANGS[lang]['file']


TRAILER = '// cognates/1 — see docs/data-schema.md; validate with `node scripts/validate_modules.js cognates`.'
_PAYLOAD_RE = re.compile(r'\(globalThis\.DIM_DATA\.cognates = globalThis\.DIM_DATA\.cognates \|\| \{\}\)\.(\w+) = (?=\{\n"meta")')

_NODE_LOADER = r'''
const vm = require('vm'), fs = require('fs');
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[1], 'utf8'), ctx, { filename: process.argv[1] });
process.stdout.write(JSON.stringify(ctx.DIM_DATA.cognates[process.argv[2]]));
'''


def read(lang, path=None):
    """Return the shipped payload: a cognates/1 doc, or a legacy row list."""
    path = Path(path or path_for(lang))
    text = path.read_text(encoding='utf-8')
    m = _PAYLOAD_RE.search(text)
    if m and m.group(1) == lang:
        body = text[m.end():].rstrip()
        return json.loads(body[:-1] if body.endswith(';') else body)
    out = subprocess.run(['node', '-e', _NODE_LOADER, str(path), lang],
                         check=True, capture_output=True, text=True).stdout
    return json.loads(out)


def read_header(path):
    """Leading // comment block of an existing file (minus our own trailer)."""
    if not Path(path).exists():
        return ''
    lines = []
    for line in Path(path).read_text(encoding='utf-8').split('\n'):
        if not line.startswith('//'):
            break
        if line != TRAILER:
            lines.append(line)
    return '\n'.join(lines).rstrip() + '\n' if lines else ''


def render(lang, doc, header):
    dump = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    head = (header.rstrip('\n') + '\n') if header else ''
    return (head + TRAILER + '\n'
            '(globalThis.DIM_DATA = globalThis.DIM_DATA || {});\n'
            '(globalThis.DIM_DATA.cognates = globalThis.DIM_DATA.cognates || {}).%s = {\n'
            '"meta":%s,\n"entries":[\n%s\n]};\n'
            % (lang, dump(doc['meta']), ',\n'.join(dump(e) for e in doc['entries'])))


def write(lang, doc, header=None, path=None):
    path = Path(path or path_for(lang))
    if header is None:
        header = read_header(path)
    text = render(lang, doc, header)
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)
    return len(text.encode('utf-8'))


def emit(lang, rows, *, builder, sources=None, licences=None, header=None, path=None, name=None):
    """Builder hook: legacy rows -> cognates/1 file. Keeps pattern labels / aliases
    already present in the shipped file so hand-tuned wording and old progress keys survive."""
    path = Path(path or path_for(lang))
    meta = {'builder': builder, 'licences': licences or [], 'sources': list(sources or [])}
    if name:
        meta['name'] = name
    if path.exists():
        try:
            old = read(lang, path)
            if isinstance(old, dict):
                meta['patterns'] = old['meta'].get('patterns') or {}
                meta['aliases'] = old['meta'].get('aliases') or {}
                if not licences:
                    meta['licences'] = old['meta'].get('licences') or []
        except Exception:  # an unreadable old file must not block a rebuild
            pass
    doc = canonicalize(lang, rows, meta)
    size = write(lang, doc, header, path)
    return doc, size


# Defaults used when converting a legacy file that carries no meta.
DEFAULT_META = {
    'it': {'builder': 'scripts/cognate_extractor.js (+ hand revisions, see header)',
           'sources': [],
           'licences': ['derived from data/vocab/it.js (see ATTRIBUTION.md)']},
    'de': {'builder': 'scripts/build_german_extras.py',
           'licences': ['derived from data/vocab/de.js (CC BY-SA) and data/vocab/en.js (ECDICT, MIT)',
                        'false-friend table authored for Dimenticato']},
    'fr': {'builder': 'scripts/build_french_extras.py',
           'licences': ['Lexique 3.83 (CC BY-SA 4.0)', 'Wiktionary/Wiktextract (CC BY-SA 3.0)',
                        'ECDICT via data/vocab/en.js (MIT)', 'faux-amis table authored for Dimenticato']},
}


def emit_stdin(argv):
    """`--emit LANG [--out PATH]`: stdin {rows, builder, header?, sources?, licences?} ->
    cognates/1 file.  Lets the Node extractor share the Python writer."""
    lang = argv[argv.index('--emit') + 1]
    out = argv[argv.index('--out') + 1] if '--out' in argv else None
    job = json.load(sys.stdin)
    doc, size = emit(lang, job['rows'], builder=job['builder'], sources=job.get('sources'),
                     licences=job.get('licences') or DEFAULT_META[lang]['licences'],
                     header=job.get('header'), path=out)
    print('%s: %d entries, %d bytes' % (out or path_for(lang), len(doc['entries']), size))
    return 0


def main(argv):
    if '--emit' in argv:
        return emit_stdin(argv)
    check = '--check' in argv
    langs = [a for a in argv if not a.startswith('-')] or list(LANGS)
    bad = 0
    for lang in langs:
        path = path_for(lang)
        payload = read(lang, path)
        meta = None if isinstance(payload, dict) else DEFAULT_META[lang]
        doc = canonicalize(lang, payload, meta)
        text = render(lang, doc, read_header(path))
        old = path.read_text(encoding='utf-8')
        if check:
            if text != old:
                bad += 1
                print('%s: not canonical (run python3 scripts/canonical_cognates.py %s)' % (path, lang))
            continue
        if text != old:
            write(lang, doc, read_header(path), path)
        print('%s: %d entries, %d patterns, %s -> %s bytes'
              % (path.relative_to(ROOT), len(doc['entries']), len(doc['meta']['patterns']),
                 len(old.encode('utf-8')), len(text.encode('utf-8'))))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
