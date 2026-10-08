#!/usr/bin/env python3
"""Per-language adapters from each builder's native entry shape to schema v1.

The four vocabulary pipelines grew separately and each still produces its own
shape internally (``{italian, chinese, ...}``, ``{german, meaning, notes, ...}``,
``{english, meaning: "n.xxx", ...}``, three French layers).  Instead of
rewriting every pipeline, each builder hands its final list to the matching
``from_<lang>`` here, which maps it onto the shared schema in
scripts/vocab_schema.py.  All language-specific knowledge about the *old*
fields lives in this file and nowhere else.

The one-off migration of the pre-v1 files (``migrate`` subcommand) ran at
fd0ba62 and was removed: re-running it would overwrite data/vocab/<lang>.js and
drop every fix applied since.  Check out fd0ba62 if it is ever needed again.
"""
from __future__ import annotations

import json
import re
import subprocess
import unicodedata
from pathlib import Path

import vocab_schema as vs

HERE = Path(__file__).resolve().parent


def read_legacy_array(path: Path) -> list:
    """Evaluate a pre-v1 ``const X = ...`` data file in Node and return the array.

    Some of them are not plain JSON (the French curriculum is a pipe-delimited
    template literal mapped at load time), so they are executed, not parsed.
    """
    script = (
        "const vm=require('vm'),fs=require('fs');const ctx={};ctx.window=ctx;"
        "vm.createContext(ctx);const src=fs.readFileSync(process.argv[1],'utf8');"
        "const name=/const\\s+(\\w+)\\s*=/.exec(src)[1];"
        "vm.runInContext(src.replace(/\\bconst (\\w+)\\s*=/g,'var $1 ='),ctx);"
        "process.stdout.write(JSON.stringify(ctx[name]));"
    )
    out = subprocess.run(['node', '-e', script, str(path)], check=True,
                         capture_output=True, text=True).stdout
    return json.loads(out)


# ---------------------------------------------------------------- Italian

def from_it(rows: list) -> list:
    out = []
    for r in rows:
        ranked = r.get('rank') not in (None, 999999) and (r.get('frequency') or 0) > 0
        out.append({
            'word': r['italian'],
            'pos': r.get('partOfSpeech') or '',
            'gender': r.get('gender') or '',
            'zh': r.get('chinese') or '',
            'en': r.get('english') or '',
            'levelSource': 'freq-band',
            '_ranked': ranked,
            '_order': r.get('rank') or 0,
        })
    return out


# ---------------------------------------------------------------- German

DE_POS_CODES = re.compile(
    r'\b(?:Vt|Vi|Vr|V|Präp\.?|Adv|Adj|Konj|Pron|Num|Art|Part|Interj|S)\b|\b\d\.\s*|[()]')


def de_government(notes: str) -> str:
    """Case / preposition government from the pgh.csv residue, e.g. '+ auf A'."""
    parts = notes.split(' · ')[1:]
    found = []
    for part in parts:
        if '+' not in part:
            continue
        text = DE_POS_CODES.sub(' ', part)
        text = text[text.index('+'):]
        text = re.sub(r'\+\s*', '+ ', text)
        text = re.sub(r'\s*/\s*', '/', text)
        text = re.sub(r'\+ d\b', '+ D', text)
        text = re.sub(r'[\s,/]+$', '', re.sub(r'\s+', ' ', text)).strip()
        if text and text not in found:
            found.append(text)
    return '; '.join(found)


def de_level_source(source: str) -> str:
    match = re.search(r'lvl:([\w-]+)', source or '')
    tag = match.group(1) if match else ''
    if tag.startswith('goethe'):
        return 'official'
    if tag.startswith('course'):
        return 'course'
    return 'freq-band'


def from_de(rows: list) -> list:
    out = []
    for r in rows:
        genders = r.get('genders') or ([r['gender']] if r.get('gender') else [])
        pos = r.get('partOfSpeech') or ''
        if r.get('properNoun'):
            pos = 'properNoun'
        pos_all = [p for p in (r.get('partsOfSpeech') or []) if p]
        level_source = de_level_source(r.get('source', ''))
        out.append({
            'word': r['german'],
            'display': r.get('display') or '',
            'pos': pos,
            'posAll': pos_all if len(pos_all) > 1 else [],
            'gender': vs.join_genders(genders),
            'level': r.get('level') if level_source != 'freq-band' else '',
            'levelSource': level_source,
            'zh': r.get('chinese') or r.get('meaning') or '',
            'en': r.get('english') or '',
            'forms': {
                'plural': r.get('plural') if not r.get('properNoun') else '',
                'principalParts': r.get('principalParts') or '',
                'pluraleTantum': bool(r.get('pluraleTantum')),
                'government': de_government(r.get('notes') or ''),
            },
            'source': r.get('source') or '',
            'legacyId': r.get('id') or '',
            '_ranked': 'f:none' not in (r.get('source') or ''),
            '_order': r.get('rank') or 0,
        })
    return out


# ---------------------------------------------------------------- English

EN_POS = {
    'n': 'noun', 'pl': 'noun', 'adj': 'adjective', 'a': 'adjective',
    'v': 'verb', 'vt': 'verb', 'vi': 'verb', 'vbl': 'verb', 'aux': 'verb',
    'adv': 'adverb', 'abbr': 'abbreviation', 'pron': 'pronoun',
    'int': 'interjection', 'interj': 'interjection', 'prep': 'preposition',
    'num': 'numeral', 'conj': 'conjunction', 'art': 'article',
    'pref': 'prefix', 'suf': 'suffix',
}
EN_MARKER = re.compile(r'(?<![A-Za-z])(' + '|'.join(sorted(EN_POS, key=len, reverse=True)) + r')\.\s*')


def en_senses(meaning: str):
    """'prep.向,往adv.在上' -> [('preposition', '向,往'), ('adverb', '在上')]."""
    meaning = meaning or ''
    marks = list(EN_MARKER.finditer(meaning))
    if not marks:
        return [('', meaning.strip())]
    senses = []
    lead = meaning[:marks[0].start()].strip(' ;；,')
    if lead:
        senses.append(('', lead))
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(meaning)
        gloss = meaning[m.end():end].strip(' ;；,')
        pos = EN_POS[m.group(1)]
        if not gloss:
            continue
        if senses and senses[-1][0] == pos:
            senses[-1] = (pos, senses[-1][1] + '，' + gloss)
        else:
            senses.append((pos, gloss))
    return senses or [('', meaning.strip())]


UPOS = {'NOUN': 'noun', 'PROPN': 'properNoun', 'VERB': 'verb', 'AUX': 'verb',
        'ADJ': 'adjective', 'ADV': 'adverb'}


def en_guess_pos(word: str, zh: str) -> str:
    """Fallback when neither the gloss nor ECDICT's notes carry a POS."""
    if re.search(r'的复数', zh):
        return 'noun'
    if re.search(r'(过去式|过去分词|现在分词|第三人称单数)', zh):
        return 'verb'
    try:
        from lemminflect import getAllLemmas
    except ImportError:  # pragma: no cover - build-time dependency
        return ''
    for upos in getAllLemmas(word):
        if upos in UPOS:
            return UPOS[upos]
    if zh.rstrip('）)').endswith('的'):
        return 'adjective'
    return ''


def from_en(rows: list) -> list:
    out = []
    for r in rows:
        senses = en_senses(r.get('meaning') or r.get('chinese') or '')
        note_pos = []
        for token in (r.get('notes') or '').split():
            p = EN_POS.get(token.rstrip('.'))
            if p and p not in note_pos:
                note_pos.append(p)
        pos_all = []
        for p, _ in senses:
            if p and p not in pos_all:
                pos_all.append(p)
        for p in note_pos:
            if p not in pos_all:
                pos_all.append(p)
        zh = '；'.join(g for _, g in senses if g)
        if not pos_all:
            guess = en_guess_pos(r['english'], zh)
            pos_all = [guess] if guess else []
        out.append({
            'word': r['english'],
            'pos': pos_all[0] if pos_all else '',
            'posAll': pos_all if len(pos_all) > 1 else [],
            'zh': zh,
            'levelSource': 'freq-band',
            'source': r.get('source') or '',
            '_ranked': True,
            '_order': r.get('rank') or 0,
        })
    return out


# ---------------------------------------------------------------- French
# Build-time port of french-app.js buildSystemVocabulary(): the curriculum,
# the textbook glossary and the Lexique core are merged field-wise, the first
# source to supply a meaning owns it and later ones become zhAlt.

def fold_text(value) -> str:
    text = unicodedata.normalize('NFC', str(value or ''))
    text = re.sub('[‘’ʼ´`]', "'", text)
    text = re.sub('[‐-―]', '-', text)
    return re.sub(r'\s+', ' ', text).strip()


def strip_accents(value: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', value)
                   if unicodedata.category(c) != 'Mn')


def headword_key(value) -> str:
    return fold_text(value).lower().replace('œ', 'oe').replace('æ', 'ae')


def loose_key(value) -> str:
    return re.sub(r"[^a-z0-9' -]", '', strip_accents(headword_key(value)))


COMPLEMENT_MARKERS = {'à', 'de', "d'", 'que', "qu'", 'qn', 'qch',
                      'à qn', 'à qch', 'de qn', 'de qch', 'avec qn', 'avec qch'}
ARTICLE_MARKERS = {'la', 'les', "l'"}
TRAILING_NOISE = re.compile(r'^(n|m|f|pl|adi|adj|adv)$', re.I)
FEMININE_RULES = [
    (r'teur$', lambda b: re.sub(r'teur$', 'trice', b, flags=re.I)),
    (r'eur$', lambda b: re.sub(r'eur$', 'euse', b, flags=re.I)),
    (r'er$', lambda b: re.sub(r'er$', 'ère', b, flags=re.I)),
    (r'if$', lambda b: re.sub(r'if$', 'ive', b, flags=re.I)),
    (r'f$', lambda b: re.sub(r'f$', 've', b, flags=re.I)),
    (r'x$', lambda b: re.sub(r'x$', 'se', b, flags=re.I)),
    (r'(ien|een|en|on|an)$', lambda b: b + 'ne'),
    (r'(el|ul|eil)$', lambda b: b + 'le'),
    (r'et$', lambda b: re.sub(r'et$', 'ète', b, flags=re.I)),
    (r'et$', lambda b: b + 'te'),
    (r'(at|ot|ut)$', lambda b: b + 'te'),
    (r'(as|os)$', lambda b: b + 'se'),
    (r'c$', lambda b: re.sub(r'c$', 'que', b, flags=re.I)),
    (r'g$', lambda b: b + 'ue'),
    (r'.', lambda b: b + 'e'),
]


def derive_variant(base: str, suffix: str) -> str:
    wanted = loose_key(suffix)
    if not wanted:
        return ''
    base_loose = loose_key(base)
    if wanted == 'e':
        return '' if re.search(r'e$', base, re.I) else base + suffix
    if len(wanted) >= 4 and base_loose[:3] == wanted[:3]:
        return suffix
    candidates = []
    end_test = strip_accents(base).lower()
    for pattern, make in FEMININE_RULES:
        if re.search(pattern, end_test):
            candidates.append(make(base))
    candidates.append(base + suffix)
    for cut in range(1, 5):
        if cut < len(base):
            candidates.append(base[:len(base) - cut] + suffix)
    for candidate in candidates:
        loose = loose_key(candidate)
        if not loose or loose == base_loose:
            continue
        if len(candidate) - len(base) > len(suffix):
            continue
        if loose.endswith(wanted):
            return candidate
    return base + suffix


def parse_headword(raw) -> dict:
    text = fold_text(raw)
    result = {'french': text, 'display': text, 'variant': '', 'construction': '',
              'accepted': [text]}
    if not text:
        return result
    if '(' not in text:
        slash = re.match(r'^([^/]+?)\s*/\s*([^/]+)$', text)
        if slash:
            result['french'] = slash.group(1).strip()
            result['variant'] = slash.group(2).strip()
            result['display'] = f"{result['french']} / {result['variant']}"
            result['accepted'] = [result['french'], result['variant']]
        return result
    match = re.match(r'^(.*?)\s*\(([^)]*)\)\s*(.*)$', text)
    if not match:
        return result
    head, inner, tail = (g.strip() for g in match.groups())
    if TRAILING_NOISE.match(tail):
        tail = ''
    if not head:
        return result
    if not inner or inner == '-':
        spaced = f'{head} {tail}' if tail else head
        joined = f'{head}-{tail}' if tail else head
        result.update(french=spaced, display=spaced,
                      variant='' if joined == spaced else joined,
                      accepted=[spaced, joined, text])
        return result
    if tail:
        with_tail = f'{head} {tail}'
        result.update(french=with_tail, display=f'{head}({inner}) {tail}',
                      accepted=[with_tail, f'{head}{inner} {tail}', text])
        return result
    lower_inner = inner.lower()
    if lower_inner in COMPLEMENT_MARKERS or re.search(r'\b(qn|qch)\b', lower_inner):
        result.update(french=head, construction=inner, display=f'{head} ({inner})',
                      accepted=[head, f'{head} {inner}'])
        return result
    if lower_inner in ARTICLE_MARKERS:
        result.update(french=head, construction=inner, display=f'{inner} {head}',
                      accepted=[head, f'{inner} {head}'])
        return result
    variant = derive_variant(head, inner)
    result.update(french=head, variant=variant,
                  display=f'{head} ({variant})' if variant else head,
                  accepted=[x for x in (head, variant, text) if x])
    return result


LEVEL_RE = re.compile(r'^(A1|A2|B1|B2|C1|C2)$')
GENERIC_TOPICS = {'教材总词汇表', '词频语料库'}

FR_POS = {
    'n': 'noun', 'v': 'verb', 'v.t': 'verb', 'v.i': 'verb', 'v.pr': 'verb',
    'adj': 'adjective', 'adv': 'adverb', 'prép': 'preposition',
    'det': 'determiner', 'art': 'article', 'pron': 'pronoun',
    'interj': 'interjection', 'conj': 'conjunction', 'num': 'numeral',
    'n.pr': 'properNoun', 'loc': 'phrase', 'loc.adv': 'phrase',
    'loc.prép': 'phrase', 'loc.conj': 'phrase',
}


def fr_pos(raw: str):
    """'n.m.pl' -> ('noun', 'm', plural-only); 'adj / n.m' -> posAll."""
    pos_all, gender, plural_only, pronominal = [], '', False, False
    for part in (p.strip() for p in (raw or '').split('/')):
        if not part:
            continue
        m = re.match(r'^n\.(m|f)(\.pl|\.inv)?$', part)
        if m:
            pos = 'noun'
            gender = gender or m.group(1)
            plural_only = plural_only or m.group(2) == '.pl'
        else:
            pos = FR_POS.get(part, '')
            pronominal = pronominal or part == 'v.pr'
        if pos and pos not in pos_all:
            pos_all.append(pos)
    return pos_all, gender, plural_only, pronominal


def from_fr(layers) -> list:
    """layers: [(rows, levelSource)], in priority order (curriculum first)."""
    by_key, order = {}, []
    for rows, layer_level_source in layers:
        for entry in rows:
            parsed = parse_headword(entry.get('french'))
            key = headword_key(parsed['french'])
            if not key:
                continue
            if key not in by_key:
                by_key[key] = {'accepted': [], 'topics': [], 'senses': []}
                order.append(key)
            t = by_key[key]
            parts = [p.strip() for p in str(entry.get('notes') or '').split('·') if p.strip()]
            note_level = next((p for p in parts if LEVEL_RE.match(p)), '')
            topics = [p for p in parts if p != note_level]
            t.setdefault('french', parsed['french'])
            if not t.get('display') or (parsed['variant'] and not t.get('variant')):
                t['display'] = parsed['display']
            t['variant'] = t.get('variant') or parsed['variant']
            t['construction'] = t.get('construction') or parsed['construction'] \
                or entry.get('construction') or ''
            for form in parsed['accepted']:
                if form and form not in t['accepted']:
                    t['accepted'].append(form)
            meaning = str(entry.get('meaning') or '').strip()
            if meaning and meaning not in t['senses']:
                t['senses'].append(meaning)
            t['meaning'] = t.get('meaning') or meaning
            if not t.get('level') and (entry.get('level') or note_level):
                t['level'] = entry.get('level') or note_level
                t['levelSource'] = layer_level_source
            t['pos_raw'] = t.get('pos_raw') or entry.get('partOfSpeech') or ''
            t['gender_raw'] = t.get('gender_raw') or entry.get('gender') or ''
            t['feminine'] = t.get('feminine') or entry.get('feminine') or ''
            t['source'] = t.get('source') or entry.get('source') or ''
            t['english'] = t.get('english') or entry.get('english') or ''
            if t.get('lexique') is None and entry.get('frequency'):
                t['lexique'] = entry['frequency']
            for topic in topics:
                if topic not in t['topics']:
                    t['topics'].append(topic)

    out = []
    for key in order:
        t = by_key[key]
        pos_all, gender, plural_only, pronominal = fr_pos(t['pos_raw'])
        if pos_all and pos_all[0] == 'noun' and t['gender_raw'] in ('m', 'f'):
            gender = t['gender_raw']
        if t['variant'] and pos_all and pos_all[0] == 'noun':
            gender = 'm/f'  # acteur (actrice): the headword covers both
        variants = [f for f in t['accepted'] if f != t['french']]
        pos_label = t['pos_raw']
        tags = [x for x in t['topics'] if x not in GENERIC_TOPICS and x != pos_label
                and not fr_pos(x)[0]]
        out.append({
            'word': t['french'],
            'display': t['display'],
            'pos': pos_all[0] if pos_all else '',
            'posAll': pos_all if len(pos_all) > 1 else [],
            'gender': gender if pos_all and pos_all[0] == 'noun' else '',
            'level': t.get('level') if t.get('levelSource') == 'textbook' else '',
            'levelSource': t.get('levelSource') or 'freq-band',
            'zh': t['meaning'],
            'zhAlt': [s for s in t['senses'] if s != t['meaning']],
            'en': t['english'],
            'forms': {
                'feminine': t['feminine'] or (t['variant'] if pos_all[:1] in (['noun'], ['adjective']) else ''),
                'construction': t['construction'],
                'pluraleTantum': plural_only,
                'pronominal': pronominal,
                'variants': variants,
            },
            'tags': tags,
            'source': t['source'],
            '_ranked': bool(t.get('lexique')),
            '_lexique': t.get('lexique') or 0,
        })
    return out


# ---------------------------------------------------------------- driver

LICENCES = {
    'it': ['Wiktionary via kaikki.org (CC BY-SA 4.0)', 'Morph-it! (CC BY-SA 2.0 / LGPL)',
           'wordfreq (Apache-2.0; data CC BY-SA 4.0)'],
    'de': ['pgh.csv (CC BY-SA 4.0)', 'HanDeDict (CC BY-SA 3.0)', 'Wiktextract (CC BY-SA 4.0)',
           'OpenSubtitles 2018 / Tatoeba (CC BY-SA 4.0 / CC BY 2.0)', 'wordfreq (Apache-2.0; data CC BY-SA 4.0)'],
    'en': ['EnWords.csv', 'ECDICT (MIT)', 'wordfreq (Apache-2.0; data CC BY-SA 4.0)',
           'Universal Dependencies English EWT + GUM (CC BY-SA 4.0)',
           'Open English WordNet 2024 (CC BY 4.0)', 'spaCy en_core_web_sm (MIT)'],
    'fr': ['Lexique 3.83 (CC BY-SA 4.0)', 'Wiktionary via kaikki.org (CC BY-SA 4.0)', 'ECDICT (MIT)',
           '你好！法语 textbook glossary (user-owned, levels / page refs only)',
           'wordfreq (Apache-2.0; data CC BY-SA 4.0)'],
}
DEFAULT_SOURCE = {
    'it': 'Italian frequency list + Wiktionary/kaikki tags (scripts/build_italian_vocabulary_tags.py)',
}


def emit(lang: str, entries: list, builder: str) -> Path:
    for e in entries:
        if not e.get('source') and lang in DEFAULT_SOURCE:
            e['source'] = DEFAULT_SOURCE[lang]
    if lang == 'fr':
        # Lexique where it has the lemma, wordfreq otherwise (both per million),
        # so textbook phrases such as "petit déjeuner" are not pushed to the tail.
        for e in entries:
            e.setdefault('freq', vs.wordfreq_per_million(e['word'], lang))
            e['_ranked'] = bool(e['_lexique'] or e['freq'])
        order_key = lambda e: -(e['_lexique'] or e['freq'] or 0)  # noqa: E731
    else:
        order_key = lambda e: e['_order']  # noqa: E731
    sources = vs.intern_sources(entries)
    final = vs.finalize(entries, lang, order_key=order_key)
    return vs.write_vocab(lang, final, sources=sources, licences=LICENCES[lang], builder=builder)


if __name__ == '__main__':
    raise SystemExit('vocab_legacy.py is a library (from_<lang> adapters); the migrate command was removed, see the module docstring.')
