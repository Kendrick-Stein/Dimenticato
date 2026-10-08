#!/usr/bin/env python3
"""Build the French vocabulary shipped by Dimenticato: data/vocab/fr.js (schema v1).

fr.js is assembled from three layers, merged by ``vocab_legacy.from_fr`` in
priority order (first layer to supply a field owns it):

  1. data/vocab/src/fr-curriculum.js  hand-written A1-B1 topic list   (levelSource textbook)
  2. data/vocab/src/fr-glossary.js    OCR'd 你好！法语 textbook glossary (levelSource textbook)
  3. the Lexique core layer            frequency-derived               (levelSource freq-band)

Layers 1 and 2 are hand-curated / OCR'd, cannot be regenerated from public
data, and are committed as *build inputs*; the site never loads them.  Layer 3
is fully regenerable from the downloads below, so it is **not** committed: the
``core`` step writes it to an intermediate JSON file (default
/tmp/frv/fr-core.json).  ``assemble`` merges the three layers into fr.js.  When
the core file is absent, ``assemble`` rebuilds layer 3 from the core entries
already in data/vocab/fr.js (``levelSource == 'freq-band'`` with the core
provenance) and keeps their existing frequency order, so fr.js can be rebuilt
from the repository alone after editing the curriculum or the glossary.

Every source used here is open-licensed and is recorded in each entry's
``source`` field (``src`` in fr.js):

  * **Lexique 3.83** (`lexique.org`, CC-BY-SA 4.0) - 142,694 French word forms
    with lemma frequencies from film subtitles (``freqlemfilms2``) and books
    (``freqlemlivres``), plus grammatical category and noun gender.  This is
    where the real corpus ``frequency`` / ``freqRank`` values come from; the
    array index is never used as a rank.
  * **kaikki.org French extract of the English Wiktionary** (Wiktextract,
    CC-BY-SA 4.0 / GFDL) - French headwords with English sense glosses,
    part of speech and gender.
  * **ECDICT** (github.com/skywind3000/ECDICT, MIT) - English -> Chinese
    dictionary used only as a *pivot*: a French headword's English gloss is
    looked up here to obtain the Chinese gloss.  Both glosses are kept so the
    pivot stays auditable.

Pipeline (each step is a sub-command; run them in this order):

    # 1. one-off preparation of the three open corpora (downloads live in /tmp)
    python3 scripts/build_french_vocabulary.py prepare-freq  /tmp/frv/Lexique383.tsv        /tmp/frv/fr_freq.json
    python3 scripts/build_french_vocabulary.py prepare-fren  /tmp/frv/kaikki-fr.jsonl       /tmp/frv/fr_en.json
    python3 scripts/build_french_vocabulary.py prepare-enzh  /tmp/frv/stardict-ecdict-2.4.2 /tmp/frv/en_zh.json

    # 2. the three layers, in dependency order (each step re-assembles fr.js)
    python3 scripts/build_french_vocabulary.py curriculum ...   -> data/vocab/src/fr-curriculum.js
    python3 scripts/build_french_vocabulary_glossary.py ...     -> data/vocab/src/fr-glossary.js
    python3 scripts/build_french_vocabulary.py core ...         -> /tmp/frv/fr-core.json (not committed)

    # 3. merge the layers (offline; falls back to fr.js's own core entries
    #    when /tmp/frv/fr-core.json is absent)
    python3 scripts/build_french_vocabulary.py assemble [--core /tmp/frv/fr-core.json]
                                                                -> data/vocab/fr.js

    # 3b. optional: fill the glossary's missing English glosses from kaikki.org
    #     per-word pages (no dump download), then assemble again
    python3 scripts/build_french_vocabulary.py fill-english

    #    assemble applies scripts/vocab_fixes/fr.json (hand-checked gloss
    #    corrections, see scripts/fr_vocab_fixes.py) right before writing

    # 4. verification
    node scripts/validate_vocab.js fr

Downloads (kept out of the repo on purpose):
    curl -o /tmp/frv/Lexique383.tsv  http://www.lexique.org/databases/Lexique383/Lexique383.tsv
    curl -o /tmp/frv/kaikki-fr.jsonl https://kaikki.org/dictionary/French/kaikki.org-dictionary-French.jsonl
    curl -L -o /tmp/frv/ecdict-stardict-28.zip \
        https://github.com/skywind3000/ECDICT/releases/download/1.0.28/ecdict-stardict-28.zip
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import struct
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import fr_vocab_fixes  # noqa: E402
import vocab_legacy  # noqa: E402
import vocab_schema  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / 'data' / 'vocab' / 'src'
CURRICULUM_PATH = SRC_DIR / 'fr-curriculum.js'
GLOSSARY_PATH = SRC_DIR / 'fr-glossary.js'
CORE_PATH = Path('/tmp/frv/fr-core.json')
BUILDER = 'scripts/build_french_vocabulary.py'

# --------------------------------------------------------------------------
# provenance strings
# --------------------------------------------------------------------------

LEXIQUE_SOURCE = 'Lexique 3.83（CC-BY-SA）'
WIKT_SOURCE = 'Wiktionary/kaikki（CC-BY-SA）'
ECDICT_SOURCE = 'ECDICT（MIT）'
CORE_SOURCE = (
    f'词频 {LEXIQUE_SOURCE} · 英文释义 {WIKT_SOURCE} · 中文经英文转写 {ECDICT_SOURCE} · 等级由词频推断'
)
CURRICULUM_SOURCE = '课程整理：你好！法语 A1-B1 主题范围'

# --------------------------------------------------------------------------
# text helpers
# --------------------------------------------------------------------------

CJK_RE = re.compile(r'[㐀-鿿豈-﫿]')
LATIN_RE = re.compile(r'[A-Za-z]')
MOJIBAKE_RE = re.compile(
    r'�|[ÃÂ][-¿]|â[-]|Ã©|Ã¨|Ã |Ã§|å|æ'
)
PLACEHOLDER_RE = re.compile(
    r'^(?:\?+|todo|tbd|n/?a|none|null|undefined|-{1,}|\(n\)|\(v\)|xxx+)$', re.I
)
TRAD_TO_SIMP = {
    '黃': '黄', '衆': '众', '喫': '吃', '牀': '床', '裏': '里',
}
# single-character or bare register markers that leaked out of the textbook's
# usage column during OCR (verified by hand against the printed glossary)
GLOSS_JUNK_SEGMENTS = {'英', '口', '民', '的缩写', '全称', '英文', '缩写'}

APOS_RE = re.compile(r'[’ʼ`´]')


def nfc(value: str) -> str:
    return unicodedata.normalize('NFC', str(value or '')).strip()


def norm_apostrophe(value: str) -> str:
    return APOS_RE.sub("'", nfc(value))


def exact_key(value: str) -> str:
    """Accent-AWARE dedupe key: `ou` and `ou` stay distinct, `soeur`/`sœur` do not."""
    value = norm_apostrophe(value).lower()
    value = value.replace('œ', 'oe').replace('æ', 'ae')
    value = re.sub(r'\s+', ' ', value)
    return value.strip()


def app_key(value: str) -> str:
    """Replica of french-app.js buildSystemVocabulary()'s (accent-blind) key."""
    value = unicodedata.normalize('NFD', str(value or ''))
    value = ''.join(ch for ch in value if not unicodedata.combining(ch))
    return APOS_RE.sub("'", value).lower().strip()


def deaccent(value: str) -> str:
    value = unicodedata.normalize('NFD', value)
    return ''.join(ch for ch in value if not unicodedata.combining(ch))


def simplify_chinese(value: str) -> str:
    return ''.join(TRAD_TO_SIMP.get(ch, ch) for ch in value)


def clean_chinese(value: str) -> str:
    """Normalise a Chinese gloss and strip OCR column leakage."""
    value = simplify_chinese(nfc(value)).replace('|', '；').replace(';', '；')
    value = re.sub(r'[，,]\s*', '；', value)
    parts = [p.strip(' 。.；;') for p in value.split('；')]
    parts = [p for p in parts if p and p not in GLOSS_JUNK_SEGMENTS]
    seen, out = set(), []
    for p in parts:
        if p in seen:
            continue
        seen.add(p)
        out.append(p)
    return '；'.join(out)


def gloss_is_bad(value: str) -> str:
    """Return '' when the gloss is acceptable, otherwise the failure reason."""
    v = nfc(value)
    if not v:
        return 'empty'
    if PLACEHOLDER_RE.match(v):
        return 'placeholder'
    if MOJIBAKE_RE.search(v):
        return 'mojibake'
    if not CJK_RE.search(v):
        return 'no-chinese'
    if re.search(r'(.{2,})\1{2,}', v):
        return 'degenerate-repetition'
    return ''


# --------------------------------------------------------------------------
# step 1a: Lexique 3.83 -> lemma frequency table
# --------------------------------------------------------------------------

CGRAM_MAP = {
    'NOM': 'n', 'VER': 'v', 'AUX': 'v', 'ADJ': 'adj', 'ADV': 'adv',
    'PRE': 'prep', 'CON': 'conj', 'ONO': 'interj',
    'ADJ:num': 'num', 'ADJ:ind': 'det', 'ADJ:pos': 'det', 'ADJ:dem': 'det',
    'ADJ:int': 'det', 'ART:def': 'art', 'ART:ind': 'art',
    'PRO:per': 'pron', 'PRO:ind': 'pron', 'PRO:pos': 'pron',
    'PRO:int': 'pron', 'PRO:rel': 'pron', 'PRO:dem': 'pron',
}
LEMMA_RE = re.compile(r"^[a-zà-öø-ÿœæç]+(?:[-' ][a-zà-öø-ÿœæç]+)*$", re.I)


def prepare_freq(lexique_tsv: Path, out_json: Path) -> None:
    per_pos: dict[tuple[str, str], dict] = {}
    forms: set[str] = set()
    form_index: dict[str, dict] = {}
    with lexique_tsv.open(newline='', encoding='utf-8') as handle:
        for row in csv.DictReader(handle, delimiter='\t'):
            ortho = nfc(row['ortho'])
            if ortho:
                forms.add(ortho.lower())
                pos = CGRAM_MAP.get(row['cgram'])
                lemma = nfc(row['lemme'])
                try:
                    lemma_freq = ((float(row['freqlemfilms2'] or 0)
                                   + float(row['freqlemlivres'] or 0)) / 2)
                except ValueError:
                    lemma_freq = 0.0
                if pos and lemma:
                    key = ortho.lower()
                    prev = form_index.get(key)
                    if prev is None or lemma_freq > prev['freq']:
                        form_index[key] = {
                            'lemma': lemma, 'pos': pos,
                            'gender': (row['genre'] or '').strip(),
                            'number': (row['nombre'] or '').strip(),
                            'freq': round(lemma_freq, 4),
                        }
            if row['islem'] != '1':
                continue
            word = nfc(row['lemme'])
            pos = CGRAM_MAP.get(row['cgram'])
            if not word or not pos or not LEMMA_RE.match(word):
                continue
            try:
                films = float(row['freqlemfilms2'] or 0)
                livres = float(row['freqlemlivres'] or 0)
            except ValueError:
                continue
            combined = (films + livres) / 2
            key = (word, pos)
            prev = per_pos.get(key)
            if prev is None or combined > prev['freq']:
                per_pos[key] = {
                    'freq': round(combined, 4),
                    'films': round(films, 4),
                    'livres': round(livres, 4),
                    'gender': (row['genre'] or '').strip(),
                }

    words: dict[str, dict] = {}
    for (word, pos), info in per_pos.items():
        rec = words.setdefault(word, {'pos': pos, 'alt': {}, **info})
        rec['alt'][pos] = {'freq': info['freq'], 'gender': info['gender']}
        if info['freq'] > rec['freq'] or (info['freq'] == rec['freq'] and pos == 'n'):
            rec.update({'pos': pos, 'freq': info['freq'], 'films': info['films'],
                        'livres': info['livres'], 'gender': info['gender']})

    ordered = sorted(words.items(), key=lambda kv: (-kv[1]['freq'], kv[0]))
    for index, (word, rec) in enumerate(ordered, start=1):
        rec['rank'] = index

    payload = {'words': words, 'forms': sorted(forms), 'formIndex': form_index}
    out_json.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({'lemmas': len(words), 'forms': len(forms),
                      'formIndex': len(form_index)}, ensure_ascii=False))


# --------------------------------------------------------------------------
# step 1b: kaikki.org French -> English gloss index
# --------------------------------------------------------------------------

SKIP_SENSE_TAGS = {
    'form-of', 'alt-of', 'obsolete', 'archaic', 'misspelling', 'inflection-of',
}
BAD_GLOSS_RE = re.compile(
    r'^(?:plural|singular|feminine|masculine|inflection|past participle|'
    r'present participle|first-person|second-person|third-person|'
    r'alternative (?:form|spelling)|obsolete (?:form|spelling)|misspelling|'
    r'eye dialect|abbreviation of|initialism of|synonym of|clipping of|'
    r'contraction of)\b', re.I)
KAIKKI_POS = {
    'noun': 'n', 'verb': 'v', 'adj': 'adj', 'adv': 'adv', 'prep': 'prep',
    'conj': 'conj', 'pron': 'pron', 'det': 'det', 'intj': 'interj',
    'num': 'num', 'article': 'art', 'phrase': 'loc', 'prep_phrase': 'loc',
}


def prepare_fren(kaikki_jsonl: Path, out_json: Path) -> None:
    out: dict[str, dict] = {}
    lines = 0
    with kaikki_jsonl.open(encoding='utf-8') as handle:
        for line in handle:
            lines += 1
            try:
                data = json.loads(line)
            except ValueError:
                continue
            if data.get('lang_code') != 'fr':
                continue
            word = nfc(data.get('word') or '')
            pos = KAIKKI_POS.get(data.get('pos') or '')
            if not word or not pos:
                continue
            gender = ''
            for head in data.get('head_templates') or []:
                match = re.match(re.escape(word) + r'\s+(m|f)\b', head.get('expansion') or '')
                if match:
                    gender = match.group(1)
            senses = data.get('senses') or []
            if not gender and senses:
                tags = set(senses[0].get('tags') or [])
                gender = 'f' if 'feminine' in tags else ('m' if 'masculine' in tags else '')
            glosses: list[str] = []
            for sense in senses:
                if set(sense.get('tags') or []) & SKIP_SENSE_TAGS:
                    continue
                if sense.get('form_of') or sense.get('alt_of'):
                    continue
                for gloss in sense.get('glosses') or []:
                    gloss = nfc(gloss)
                    if not gloss or len(gloss) > 90 or BAD_GLOSS_RE.match(gloss):
                        continue
                    if gloss not in glosses:
                        glosses.append(gloss)
                if len(glosses) >= 4:
                    break
            if not glosses:
                continue
            bucket = out.setdefault(word, {})
            rec = bucket.get(pos)
            if rec is None:
                bucket[pos] = {'g': glosses[:4], 'gender': gender}
            else:
                for gloss in glosses:
                    if gloss not in rec['g'] and len(rec['g']) < 4:
                        rec['g'].append(gloss)
                rec['gender'] = rec['gender'] or gender
    out_json.write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({'lines': lines, 'headwords': len(out)}, ensure_ascii=False))


# --------------------------------------------------------------------------
# step 1c: ECDICT StarDict -> English -> Chinese map
# --------------------------------------------------------------------------

ECDICT_DROP_LINE = re.compile(r'^[\[\(]|时态|原型|复数形式|网络|比较级|最高级')
ECDICT_POS_LINE = re.compile(
    r'^\s*(n|v|vt|vi|adj|adv|prep|conj|pron|art|int|num|abbr|aux|a|ad)\s*\.\s*', re.I)


def prepare_enzh(stardict_base: Path, out_json: Path) -> None:
    idx = Path(str(stardict_base) + '.idx').read_bytes()
    dic = Path(str(stardict_base) + '.dict').read_bytes()
    out: dict[str, list] = {}
    pos = 0
    total = 0
    length = len(idx)
    while pos < length:
        end = idx.index(b'\0', pos)
        word = idx[pos:end].decode('utf-8', 'replace')
        offset, size = struct.unpack('>II', idx[end + 1:end + 9])
        pos = end + 9
        total += 1
        body = dic[offset:offset + size].decode('utf-8', 'replace')
        senses = []
        for raw in body.split('\n'):
            raw = raw.strip()
            if not raw or not CJK_RE.search(raw) or ECDICT_DROP_LINE.search(raw):
                continue
            match = ECDICT_POS_LINE.match(raw)
            tag = ''
            if match:
                tag = match.group(1).lower()
                raw = raw[match.end():].strip()
            raw = raw.strip(' ;,')
            if raw and CJK_RE.search(raw):
                senses.append([tag, raw])
        if not senses:
            continue
        key = word.strip().lower()
        if key and key not in out:
            out[key] = senses[:6]
    out_json.write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({'idx': total, 'with_chinese': len(out)}, ensure_ascii=False))


# --------------------------------------------------------------------------
# enrichment: shared by all three dataset builders
# --------------------------------------------------------------------------

POS_ALIAS = {
    'n': {'n'}, 'v': {'v', 'vt', 'vi', 'aux'}, 'adj': {'adj', 'a'},
    'adv': {'adv', 'ad'}, 'prep': {'prep'}, 'conj': {'conj'}, 'pron': {'pron'},
    'det': {'det', 'a', 'adj'}, 'art': {'art'}, 'interj': {'int'},
    'num': {'num'}, 'loc': set(),
}
POS_LABEL_ZH = {
    'n': '名词', 'n.m': '阳性名词', 'n.f': '阴性名词', 'n.pl': '复数名词',
    'v': '动词', 'v.t': '及物动词', 'v.i': '不及物动词', 'v.pr': '代词式动词',
    'adj': '形容词', 'adv': '副词', 'prép': '介词', 'conj': '连词',
    'pron': '代词', 'art': '冠词', 'interj': '感叹词', 'num': '数词',
    'loc': '短语', 'det': '限定词',
}
SPLIT_RE = re.compile(r'[,;，；、/]')
PAREN_RE = re.compile(r'\([^)]*\)')
REFLEXIVE_RE = re.compile(r"^(?:se |s')", re.I)
PREP_INNER = {
    'à', 'a', 'de', "d'", 'en', 'sur', 'pour', 'avec', 'dans', 'par', 'se',
    "s'", 'que', 'qch', 'qn', 'y', '-', 'à qch', 'à qn', 'de qch',
}


class Resources:
    """Lazy holder for the three prepared corpora."""

    def __init__(self, freq_json: Path, fren_json: Path, enzh_json: Path):
        payload = json.loads(freq_json.read_text(encoding='utf-8'))
        self.freq = payload['words']
        self.forms = set(payload['forms'])
        self.form_index = payload.get('formIndex', {})
        self.fren = json.loads(fren_json.read_text(encoding='utf-8'))
        self.enzh = json.loads(enzh_json.read_text(encoding='utf-8'))
        self.freq_ci = {word.lower(): word for word in self.freq}
        self.fren_ci = {word.lower(): word for word in self.fren}

    # -- lookup variants ---------------------------------------------------
    @staticmethod
    def variants(word: str) -> list[str]:
        word = norm_apostrophe(word)
        base = PAREN_RE.sub('', word).replace('(-)', '-')
        base = re.sub(r'\s+', ' ', base).strip(" -")
        out = []
        for candidate in (word, base, base.lower(),
                          base.replace('œ', 'oe'), base.replace('oe', 'œ'),
                          REFLEXIVE_RE.sub('', base), REFLEXIVE_RE.sub('', base).lower()):
            candidate = candidate.strip()
            if candidate and candidate not in out:
                out.append(candidate)
        # plural-only textbook headwords (parents, vacances, cheveux, pates)
        for candidate in list(out):
            if len(candidate) > 3 and candidate.endswith('s'):
                out.append(candidate[:-1])
            if len(candidate) > 3 and candidate.endswith('x'):
                out.append(candidate[:-1] + 'l')
                out.append(candidate[:-1])
        return out

    def frequency(self, word: str) -> dict | None:
        """Lemma record for a headword.

        Inflected textbook headwords (`amie`, `étudiante`, `parents`,
        `vacances`) are resolved through Lexique's form table: they inherit
        their LEMMA's corpus frequency and rank - which is exactly what
        ``freqlemfilms2`` measures - while keeping the form's own gender.
        """
        for candidate in self.variants(word):
            rec = self.freq.get(candidate)
            if rec:
                return rec
            mapped = self.freq_ci.get(candidate.lower())
            if mapped:
                return self.freq[mapped]
        for candidate in self.variants(word):
            form = self.form_index.get(candidate.lower())
            if not form:
                continue
            lemma = self.freq.get(form['lemma'])
            if not lemma:
                continue
            merged = dict(lemma)
            merged['pos'] = form['pos']
            merged['gender'] = form['gender'] or lemma.get('gender', '')
            merged['inflectedFrom'] = form['lemma']
            merged['number'] = form.get('number', '')
            return merged
        return None

    def wiktionary(self, word: str) -> dict | None:
        for candidate in self.variants(word):
            rec = self.fren.get(candidate)
            if rec:
                return rec
            mapped = self.fren_ci.get(candidate.lower())
            if mapped:
                return self.fren[mapped]
        return None

    # -- English + Chinese -------------------------------------------------
    def english(self, word: str, pos: str) -> tuple[str, str]:
        """Return (english gloss string, gender letter) for a headword."""
        bucket = self.wiktionary(word)
        if not bucket:
            return '', ''
        family = pos_family(pos)
        rec = bucket.get(family)
        if rec is None:
            order = ['n', 'v', 'adj', 'adv', 'loc', 'prep', 'conj', 'pron',
                     'interj', 'det', 'art', 'num']
            for key in order:
                if key in bucket:
                    rec = bucket[key]
                    family = key
                    break
        if rec is None:
            return '', ''
        glosses = [g for g in rec['g'] if g][:2]
        return '; '.join(glosses), rec.get('gender', '')

    def english_glosses(self, word: str, pos: str) -> list[str]:
        bucket = self.wiktionary(word)
        if not bucket:
            return []
        family = pos_family(pos)
        rec = bucket.get(family)
        if rec is None:
            for key in ('n', 'v', 'adj', 'adv', 'loc', 'prep', 'conj', 'pron',
                        'interj', 'det', 'art', 'num'):
                if key in bucket:
                    rec = bucket[key]
                    break
        return list(rec['g']) if rec else []

    def _zh_terms(self, english: str, family: str) -> list[str]:
        rec = self.enzh.get(english)
        if not rec:
            return []
        want = POS_ALIAS.get(family, set())
        primary: list[str] = []
        other: list[str] = []
        for tag, text in rec:
            terms = [t.strip(' 。.') for t in SPLIT_RE.split(text) if t.strip()]
            terms = [t for t in terms
                     if CJK_RE.search(t) and len(t) <= 12 and not LATIN_RE.search(t)]
            if not terms:
                continue
            if tag and want and tag in want:
                primary.extend(terms)
            elif not tag:
                other.extend(terms)
            else:
                other.extend(terms[:2])
        return primary or other

    @staticmethod
    def _en_variants(gloss: str, family: str) -> list[str]:
        text = PAREN_RE.sub(' ', gloss)
        text = re.sub(r'\s+', ' ', text).strip(' .')
        out = [text.lower()] if text and len(text) < 40 else []
        for part in [p.strip() for p in SPLIT_RE.split(text) if p.strip()][:3]:
            if family == 'v' and part.lower().startswith('to '):
                part = part[3:]
            elif family == 'n':
                part = re.sub(r'^(?:a|an|the) ', '', part, flags=re.I)
            part = part.strip().lower()
            if part and len(part) < 40 and part not in out:
                out.append(part)
        return out

    def chinese(self, word: str, pos: str, max_terms: int = 3) -> str:
        family = pos_family(pos)
        glosses = self.english_glosses(word, pos)
        if not glosses:
            return ''
        score: dict[str, float] = {}
        order: dict[str, int] = {}
        for gi, gloss in enumerate(glosses[:2]):
            for vi, variant in enumerate(self._en_variants(gloss, family)):
                terms = self._zh_terms(variant, family)
                if not terms:
                    continue
                weight = 1.0 if gi == 0 else 0.4
                if vi == 0:
                    weight += 0.2  # whole-gloss match is the most specific
                for ti, term in enumerate(terms[:6]):
                    score[term] = score.get(term, 0) + weight
                    key = gi * 100 + vi * 10 + ti
                    order[term] = min(order.get(term, key), key)
        if not score:
            return ''
        ranked = sorted(score, key=lambda t: (-score[t], order[t]))
        return clean_chinese('；'.join(ranked[:max_terms]))


def pos_family(pos: str) -> str:
    pos = (pos or '').lower()
    if pos.startswith('n'):
        return 'n'
    if pos.startswith('v'):
        return 'v'
    if pos.startswith('adj'):
        return 'adj'
    if pos.startswith('adv'):
        return 'adv'
    if pos.startswith('prép') or pos.startswith('prep'):
        return 'prep'
    if pos.startswith('conj'):
        return 'conj'
    if pos.startswith('pron'):
        return 'pron'
    if pos.startswith('art'):
        return 'art'
    if pos.startswith('int'):
        return 'interj'
    if pos.startswith('num') or pos.startswith('adj:num'):
        return 'num'
    if pos.startswith('loc'):
        return 'loc'
    if pos.startswith('det'):
        return 'det'
    return pos


LEVEL_BANDS = ((800, 'A1'), (1800, 'A2'), (3500, 'B1'), (7000, 'B2'), (15000, 'C1'))


def infer_level(freq_rank: int | None) -> str:
    if not freq_rank:
        return 'C2'
    for limit, level in LEVEL_BANDS:
        if freq_rank <= limit:
            return level
    return 'C2'


def pos_label(family: str, gender: str, headword: str) -> str:
    if family == 'n':
        if gender == 'm':
            return 'n.m'
        if gender == 'f':
            return 'n.f'
        return 'n'
    if family == 'v':
        return 'v.pr' if REFLEXIVE_RE.match(headword) else 'v'
    return {'prep': 'prép', 'interj': 'interj', 'loc': 'loc'}.get(family, family)


# --------------------------------------------------------------------------
# parenthetical headwords -> base form + feminine/variant field
# --------------------------------------------------------------------------

def split_variant(headword: str, forms: set[str]) -> tuple[str, str, str, str]:
    """``acteur(trice)`` -> ('acteur', 'actrice', 'acteur (actrice)', '').

    Returns (base, feminine, display, construction).
    """
    word = norm_apostrophe(headword)
    if ' / ' in word:
        left, right = [p.strip() for p in word.split(' / ', 1)]
        return left, right, f'{left} / {right}', ''
    if '(-)' in word:
        base = word.replace('(-)', '-')
        return base, '', base, ''
    match = re.match(r'^(.+?)\s*\(([^()]+)\)\s*$', word)
    if not match:
        return word, '', word, ''
    base, inner = match.group(1).strip(), match.group(2).strip()
    if inner.lower() in PREP_INNER or ' ' in inner:
        return base, '', word, f'{base} {inner}'.strip()
    feminine = ''
    for cut in range(len(base), 0, -1):
        candidate = base[:cut] + inner
        if candidate.lower() in forms:
            feminine = candidate
            break
    if not feminine:
        candidate = base + inner
        feminine = candidate if candidate.lower() in forms else ''
    display = f'{base} ({feminine or inner})'
    return base, feminine, display, ''


# --------------------------------------------------------------------------
# gloss-collision disambiguation
# --------------------------------------------------------------------------

GLOSS_KEY_STRIP = re.compile(r'[\s;；,，、.。…·\-]+')


def gloss_key(gloss: str) -> str:
    """Collision key for a Chinese gloss.

    Two glosses that differ only in separators/ellipsis ("烟；雾" vs "烟雾",
    "开除...教籍" vs "开除教籍") are indistinguishable to a learner, so they
    have to collide here and get disambiguated.  Must stay in sync with
    ``glossKey()`` in scripts/validate_vocab.js (the French hook).
    """
    return GLOSS_KEY_STRIP.sub('', nfc(gloss))


class GlossRegistry:
    """Keeps every shipped Chinese gloss unique across the three datasets."""

    def __init__(self, taken: dict[str, str] | None = None):
        self.taken: dict[str, str] = {}
        for gloss, owner in (taken or {}).items():
            self.taken.setdefault(gloss_key(gloss), owner)

    def register(self, entry: dict) -> None:
        """Mutate ``entry['chinese']`` until it is globally unique."""
        gloss = entry['chinese']
        owner = entry['french']
        key = gloss_key(gloss)
        if self.taken.get(key) in (None, owner):
            self.taken[key] = owner
            return
        label = POS_LABEL_ZH.get(entry.get('partOfSpeech') or '', '')
        if label:
            candidate = f'{gloss}（{label}）'
            ckey = gloss_key(candidate)
            if self.taken.get(ckey) in (None, owner):
                entry['chinese'] = entry['meaning'] = candidate
                self.taken[ckey] = owner
                return
        english = (entry.get('english') or '').split(';')[0].strip()
        if english:
            candidate = f'{gloss}（英：{english}）'
            ckey = gloss_key(candidate)
            if self.taken.get(ckey) in (None, owner):
                entry['chinese'] = entry['meaning'] = candidate
                self.taken[ckey] = owner
                return
        entry['ambiguousGloss'] = True
        entry['glossGroup'] = gloss

    def snapshot(self) -> dict[str, str]:
        return dict(self.taken)


# --------------------------------------------------------------------------
# JS emission helpers
# --------------------------------------------------------------------------

def write_js_array(path: Path, global_name: str, header: list[str], entries: list[dict]) -> None:
    """Write a build-input layer (not loaded by the site, so no window export)."""
    lines = list(header)
    lines.append(f'const {global_name} = [')
    for entry in entries:
        lines.append('  ' + json.dumps(entry, ensure_ascii=False, separators=(',', ':')) + ',')
    lines.extend([
        '];',
        '',
        "if (typeof module !== 'undefined' && module.exports) {",
        f'  module.exports = {global_name};',
        '}',
        '',
    ])
    path.write_text('\n'.join(lines), encoding='utf-8')


# --------------------------------------------------------------------------
# layer 1: the hand-written A1-B1 curriculum (data/vocab/src/fr-curriculum.js)
# --------------------------------------------------------------------------

CURRICULUM_HEADER = [
    '// French vocabulary curriculum: a build input for data/vocab/fr.js, merged by',
    '// `python3 scripts/build_french_vocabulary.py assemble`. The site never loads',
    '// this file.',
    '//',
    '// The topic progression follows the A1-B1 scope visible in the user\'s',
    '// "你好！法语 / Le nouveau Taxi!" course books. Definitions and notes are',
    '// independently written for this application; scanned textbook pages are not',
    '// redistributed.',
    '//',
    '// Frequency (per million, film subtitles + books averaged) and the corpus rank',
    f'// come from {LEXIQUE_SOURCE}; English glosses come from {WIKT_SOURCE}.',
    '// Rebuild with: python3 scripts/build_french_vocabulary.py curriculum ...',
    '//',
    '// Row format:',
    '//   french|display|feminine|meaning|english|notes|partOfSpeech|gender|level|frequency|freqRank',
]

# Grammar words / locutions Lexique and Wiktionary cannot classify on their own.
CURRICULUM_POS_OVERRIDES = {
    'au revoir': ('interj', ''), 'à bientôt': ('interj', ''),
    "s'il vous plaît": ('loc', ''), "s'il te plaît": ('loc', ''),
    'excusez-moi': ('interj', ''), "d'accord": ('loc', ''), 'bien sûr': ('loc', ''),
    'de la': ('art', ''), "de l'": ('art', ''), 'du': ('art', ''), 'des': ('art', ''),
    'le': ('art', 'm'), 'la': ('art', 'f'), 'les': ('art', ''),
    'un': ('art', 'm'), 'une': ('art', 'f'),
    'ce': ('det', 'm'), 'cette': ('det', 'f'), 'ces': ('det', ''),
    'mon': ('det', 'm'), 'ma': ('det', 'f'), 'mes': ('det', ''),
    'ton': ('det', 'm'), 'ta': ('det', 'f'),
    'son': ('det', 'm'), 'sa': ('det', 'f'),
    'notre': ('det', ''), 'votre': ('det', ''), 'leur': ('det', ''),
    'quel': ('det', 'm'), 'quelle': ('det', 'f'),
    'je': ('pron', ''), 'tu': ('pron', ''), 'il': ('pron', ''), 'elle': ('pron', ''),
    'on': ('pron', ''), 'nous': ('pron', ''), 'vous': ('pron', ''),
    'ils': ('pron', ''), 'elles': ('pron', ''),
    'qui': ('pron', ''), 'que': ('pron', ''), 'quoi': ('pron', ''),
    'où': ('adv', ''), 'quand': ('adv', ''), 'comment': ('adv', ''),
    'pourquoi': ('adv', ''), 'combien': ('adv', ''),
    'et': ('conj', ''), 'ou': ('conj', ''), 'mais': ('conj', ''),
    'parce que': ('conj', ''), 'donc': ('conj', ''), 'si': ('conj', ''),
    'alors que': ('conj', ''), 'tandis que': ('conj', ''),
    'salle de bains': ('n.f', 'f'), 'petit déjeuner': ('n.m', 'm'),
    'réseau social': ('n.m', 'm'), 'vacances': ('n.f', 'f'),
    'parents': ('n.m', 'm'), 'cheveux': ('n.m', 'm'),
    'près de': ('loc', ''), 'loin de': ('loc', ''), 'à gauche': ('loc', ''),
    'à droite': ('loc', ''), 'tout droit': ('loc', ''), 'en revanche': ('loc', ''),
    'par exemple': ('loc', ''), 'en général': ('loc', ''), 'à mon avis': ('loc', ''),
    'grâce à': ('loc', ''), 'à cause de': ('loc', ''), 'afin de': ('loc', ''),
    "d'abord": ('adv', ''), 'ensuite': ('adv', ''), 'enfin': ('adv', ''),
    'selon': ('prép', ''), 'malgré': ('prép', ''), 'chez': ('prép', ''),
    'se lever': ('v.pr', ''), 'se coucher': ('v.pr', ''),
    'France': ('n.f', 'f'), 'Chine': ('n.f', 'f'),
    'amie': ('n.f', 'f'), 'française': ('adj', 'f'), 'étudiante': ('n.f', 'f'),
    'après-midi': ('n.m', 'm'), 'œil': ('n.m', 'm'), 'sœur': ('n.f', 'f'),
    'peut-être': ('adv', ''), 'merci': ('interj', ''), 'pardon': ('interj', ''),
    'bonjour': ('interj', ''), 'bonsoir': ('interj', ''), 'salut': ('interj', ''),
    'oui': ('adv', ''), 'non': ('adv', ''),
}
# Chinese glosses hand-extended so the curriculum entry keeps the richer sense
# that the textbook glossary also documents (fr-merge-drops-cefr-and-gender).
CURRICULUM_GLOSS_OVERRIDES = {
    'enfin': '最后；终于；总之',
    'appartement': '公寓；公寓套房',
    'adresse': '地址；住址',
    'âge': '年龄；年纪',
    'argent': '钱；银；白银',
}

# Grammatical forms and proper nouns that the English Wiktionary only documents
# as "form of" entries (which the extractor drops on purpose), plus two nouns
# missing from the dump. Authored by hand for this app.
CURRICULUM_ENGLISH_OVERRIDES = {
    'les': 'the (plural definite article)',
    'des': 'some; of the (plural indefinite/partitive article)',
    'cette': 'this, that (feminine singular)',
    'ces': 'these, those',
    'ma': 'my (feminine singular)',
    'France': 'France',
    'Chine': 'China',
    'étudiante': 'student (female)',
    'loin de': 'far from',
    'liberté': 'freedom, liberty',
}


def parse_curriculum(path: Path) -> list[dict]:
    text = path.read_text(encoding='utf-8')
    match = re.search(r'`\n(.*?)\n`\.trim\(\)', text, re.S)
    if not match:
        raise SystemExit(f'cannot find the pipe table inside {path}')
    rows = []
    for line in match.group(1).split('\n'):
        line = line.strip()
        if not line:
            continue
        cells = line.split('|')
        if len(cells) >= 11:
            rows.append({
                'french': cells[0], 'display': cells[1], 'feminine': cells[2],
                'meaning': cells[3], 'english': cells[4], 'notes': cells[5],
                'partOfSpeech': cells[6], 'gender': cells[7], 'level': cells[8],
            })
        elif len(cells) >= 3:
            rows.append({
                'french': cells[0], 'display': cells[0], 'feminine': '',
                'meaning': cells[1], 'english': '', 'notes': cells[2],
                'partOfSpeech': '', 'gender': '', 'level': '',
            })
        else:
            raise SystemExit(f'malformed curriculum row: {line!r}')
    return rows


def build_curriculum(args) -> None:
    res = Resources(args.freq, args.fren, args.enzh)
    rows = parse_curriculum(args.src)
    entries: list[dict] = []
    fallback_rank = 900000
    for index, row in enumerate(rows):
        headword = norm_apostrophe(row['french'])
        notes = row['notes'] or ''
        level = row['level'] or (notes.split(' · ')[0].strip() if notes else '')
        if level not in {'A1', 'A2', 'B1', 'B2', 'C1', 'C2'}:
            level = 'A1'
        topic = notes.split(' · ')[-1].strip() if '·' in notes else ''

        freq = res.frequency(headword)
        override = CURRICULUM_POS_OVERRIDES.get(headword)
        gender = ''
        if override:
            pos_raw, gender = override
        elif freq:
            pos_raw = pos_label(freq['pos'], freq.get('gender', ''), headword)
            gender = freq.get('gender', '')
        else:
            pos_raw = 'loc' if ' ' in headword else ''
        family = pos_family(pos_raw)
        english, wgender = res.english(headword, pos_raw or 'n')
        if family == 'n' and not gender:
            gender = wgender
            pos_raw = pos_label('n', gender, headword)
        if pos_raw.startswith('n') and gender:
            pos_raw = 'n.m' if gender == 'm' else 'n.f'
        if not pos_raw:
            pos_raw = 'n' if freq is None else pos_label(family, gender, headword)

        meaning = clean_chinese(CURRICULUM_GLOSS_OVERRIDES.get(headword, row['meaning']))
        entries.append({
            'french': headword,
            'display': row['display'] or headword,
            'feminine': row['feminine'] or '',
            'meaning': meaning,
            'english': (english or CURRICULUM_ENGLISH_OVERRIDES.get(headword, '')
                        or row['english'] or ''),
            'notes': f'{level} · {topic}' if topic else level,
            'partOfSpeech': pos_raw,
            'gender': gender,
            'level': level,
            'frequency': freq['freq'] if freq else None,
            'freqRank': freq['rank'] if freq else None,
            'rank': freq['rank'] if freq else fallback_rank + index,
        })

    registry = GlossRegistry()
    for entry in entries:
        entry['chinese'] = entry['meaning']
        registry.register(entry)
        entry['meaning'] = entry['chinese']

    rows_out = []
    for entry in entries:
        rows_out.append('|'.join([
            entry['french'], entry['display'], entry['feminine'], entry['meaning'],
            entry['english'].replace('|', '/'), entry['notes'], entry['partOfSpeech'],
            entry['gender'], entry['level'],
            '' if entry['frequency'] is None else f"{entry['frequency']:.4f}",
            '' if entry['freqRank'] is None else str(entry['freqRank']),
        ]))

    body = '\n'.join(CURRICULUM_HEADER) + '\n\nconst FRENCH_VOCABULARY_DATA = `\n'
    body += '\n'.join(rows_out)
    body += "\n`.trim().split('\\n').map((line, index) => {\n"
    body += (
        "  const [french, display, feminine, meaning, english, notes,\n"
        "         partOfSpeech, gender, level, frequency, freqRank] = line.split('|');\n"
        "  const rank = freqRank ? Number(freqRank) : 900000 + index;\n"
        "  return {\n"
        "    french,\n"
        "    display: display || french,\n"
        "    feminine: feminine || '',\n"
        "    meaning,\n"
        "    chinese: meaning,\n"
        "    english: english || '',\n"
        "    notes,\n"
        "    rank,\n"
        f"    source: '{CURRICULUM_SOURCE}',\n"
        "    level,\n"
        "    partOfSpeech,\n"
        "    gender: gender || '',\n"
        "    textbookPage: '',\n"
        "    frequency: frequency ? Number(frequency) : null,\n"
        "    freqRank: freqRank ? Number(freqRank) : null,\n"
        f"    freqSource: frequency ? '{LEXIQUE_SOURCE}' : ''\n"
        "  };\n"
        "});\n\n"
        "if (typeof module !== 'undefined' && module.exports) {\n"
        "  module.exports = FRENCH_VOCABULARY_DATA;\n"
        "}\n"
    )
    args.out.write_text(body, encoding='utf-8')

    stats = {
        'total': len(entries),
        'withFrequency': sum(1 for e in entries if e['freqRank']),
        'withEnglish': sum(1 for e in entries if e['english']),
        'withPos': sum(1 for e in entries if e['partOfSpeech']),
        'nounsMissingGender': sum(
            1 for e in entries
            if pos_family(e['partOfSpeech']) == 'n' and not e['gender']),
        'ambiguousGloss': sum(1 for e in entries if e.get('ambiguousGloss')),
    }
    print(json.dumps(stats, ensure_ascii=False))
    registry_path = args.registry
    if registry_path:
        registry_path.write_text(json.dumps(registry.snapshot(), ensure_ascii=False),
                                 encoding='utf-8')
    print(assemble(args.core))


# --------------------------------------------------------------------------
# layer 3: the frequency-derived core corpus (intermediate JSON, not committed)
#
# Ranks + frequencies come from Lexique 3.83 (freqlemfilms2 / freqlemlivres, per
# million), English glosses from Wiktionary/kaikki, Chinese glosses are pivoted
# English -> Chinese through ECDICT.  CEFR levels on this layer are inferred
# from frequency; the textbook layers win on conflict.
# --------------------------------------------------------------------------

SKIP_HEADWORD_RE = re.compile(r'^[a-z]$|^\d')
BANNED_POS = {'art', 'det'}


def load_js_array(path: Path) -> list[dict]:
    """Load a generated dataset without a JS engine (one JSON object per line)."""
    entries = []
    for line in path.read_text(encoding='utf-8').split('\n'):
        line = line.strip()
        if line.startswith('{') and line.endswith('},'):
            entries.append(json.loads(line[:-1]))
    return entries


def build_core(args) -> None:
    res = Resources(args.freq, args.fren, args.enzh)
    curriculum = parse_curriculum(args.curriculum)
    glossary = load_js_array(args.glossary)

    reserved: set[str] = set()
    for entry in curriculum:
        reserved.add(exact_key(entry['french']))
    for entry in glossary:
        reserved.add(exact_key(entry['french']))
        if entry.get('feminine'):
            reserved.add(exact_key(entry['feminine']))

    taken: dict[str, str] = {}
    for entry in curriculum:
        taken.setdefault(entry['meaning'], entry['french'])
    for entry in glossary:
        taken.setdefault(entry['chinese'], entry['french'])
    registry = GlossRegistry(taken)

    ordered = sorted(res.freq.items(), key=lambda kv: (-kv[1]['freq'], kv[0]))
    entries: list[dict] = []
    rejected = {
        'already-covered': 0, 'no-english': 0, 'no-chinese': 0, 'bad-gloss': 0,
        'noun-without-gender': 0, 'skip-pos': 0, 'headword-shape': 0,
        'gloss-equals-headword': 0,
    }
    for word, rec in ordered:
        rank = rec['rank']
        if rank > args.max_rank:
            break
        key = exact_key(word)
        if key in reserved:
            rejected['already-covered'] += 1
            continue
        if SKIP_HEADWORD_RE.match(word) or len(word) < 2:
            rejected['headword-shape'] += 1
            continue
        family = rec['pos']
        if family in BANNED_POS:
            rejected['skip-pos'] += 1
            continue
        bucket = res.wiktionary(word)
        if not bucket:
            rejected['no-english'] += 1
            continue
        if family not in bucket:
            # Lexique's dominant POS is not documented on Wiktionary; fall back
            # to the richest POS Wiktionary does document for this headword.
            for candidate in ('n', 'v', 'adj', 'adv', 'loc', 'prep', 'conj',
                              'pron', 'interj', 'num'):
                if candidate in bucket:
                    family = candidate
                    break
        gender = ''
        if family == 'n':
            gender = rec.get('gender', '') or bucket.get('n', {}).get('gender', '')
            if not gender:
                rejected['noun-without-gender'] += 1
                continue
        pos = pos_label(family, gender, word)
        english, _ = res.english(word, pos)
        if not english:
            rejected['no-english'] += 1
            continue
        chinese = res.chinese(word, pos)
        if not chinese:
            rejected['no-chinese'] += 1
            continue
        reason = gloss_is_bad(chinese)
        if reason:
            rejected['bad-gloss'] += 1
            continue
        if deaccent(chinese).lower() == deaccent(word).lower():
            rejected['gloss-equals-headword'] += 1
            continue
        level = infer_level(rank)
        entry = {
            'french': word,
            'display': word,
            'feminine': '',
            'meaning': chinese,
            'chinese': chinese,
            'english': english,
            'notes': f'{level} · 词频语料库 · {pos}',
            'rank': rank,
            'source': CORE_SOURCE,
            'level': level,
            'levelSource': 'inferred-from-frequency',
            'partOfSpeech': pos,
            'gender': gender,
            'textbookPage': '',
            'frequency': rec['freq'],
            'freqRank': rank,
            'freqSource': LEXIQUE_SOURCE,
            'glossSource': f'{WIKT_SOURCE} → {ECDICT_SOURCE}',
        }
        registry.register(entry)
        entries.append(entry)

    # drop the residual same-gloss twins inside the derived layer only
    kept: list[dict] = []
    dropped_ambiguous = 0
    for entry in entries:
        if entry.get('ambiguousGloss'):
            dropped_ambiguous += 1
            continue
        kept.append(entry)
    entries = kept

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(entries, ensure_ascii=False), encoding='utf-8')
    by_level: dict[str, int] = {}
    for entry in entries:
        by_level[entry['level']] = by_level.get(entry['level'], 0) + 1
    print(json.dumps({
        'total': len(entries),
        'byLevel': by_level,
        'rejected': rejected,
        'droppedAmbiguousGloss': dropped_ambiguous,
        'maxRank': args.max_rank,
    }, ensure_ascii=False))
    print(assemble(args.out))


# --------------------------------------------------------------------------
# assemble: curriculum + glossary + core -> data/vocab/fr.js
# --------------------------------------------------------------------------

# v1 part of speech -> the layers' raw label (inverse of vocab_legacy.FR_POS).
V1_TO_RAW_POS = {
    'noun': 'n', 'verb': 'v', 'adjective': 'adj', 'adverb': 'adv',
    'preposition': 'prép', 'determiner': 'det', 'article': 'art',
    'pronoun': 'pron', 'interjection': 'interj', 'conjunction': 'conj',
    'numeral': 'num', 'properNoun': 'n.pr', 'phrase': 'loc',
}


def layer_key(french: str) -> str:
    """The merge key vocab_legacy.from_fr uses for a layer row."""
    return vocab_legacy.headword_key(vocab_legacy.parse_headword(french)['french'])


def raw_pos(entry: dict) -> str:
    """'noun' + gender f -> 'n.f'; the inverse of vocab_legacy.fr_pos()."""
    forms = entry.get('forms') or {}
    labels = []
    for pos in entry.get('posAll') or [entry.get('pos', '')]:
        if pos == 'noun' and entry.get('gender') in ('m', 'f'):
            label = 'n.' + entry['gender'] + ('.pl' if forms.get('pluraleTantum') else '')
        elif pos == 'verb' and forms.get('pronominal'):
            label = 'v.pr'
        else:
            label = V1_TO_RAW_POS.get(pos, '')
        if label:
            labels.append(label)
    return ' / '.join(labels)


def core_rows_from_vocab(layer_keys: set[str]):
    """Rebuild the core layer from the core entries already in data/vocab/fr.js.

    Returns (rows, order): the legacy-shaped rows ``from_fr`` expects and the
    words in their current fr.js rank order.  Lexique frequencies are not part
    of schema v1, so the rows carry no usable ``frequency``; ``pin_core_order``
    restores their position instead.
    """
    data = vocab_schema.read_vocab('fr')
    rows = []
    for e in data['entries']:
        if e['levelSource'] != 'freq-band' or vocab_schema.source_of(data, e) != CORE_SOURCE:
            continue
        if layer_key(e['word']) in layer_keys:
            continue  # now covered by the curriculum / glossary
        pos = raw_pos(e)
        rows.append({
            'french': e['word'],
            'display': e.get('display') or e['word'],
            'feminine': (e.get('forms') or {}).get('feminine', ''),
            'meaning': e['zh'],
            'chinese': e['zh'],
            'english': e.get('en', ''),
            'notes': ' · '.join(['词频语料库', pos] + list(e.get('tags') or [])),
            'source': CORE_SOURCE,
            'partOfSpeech': pos,
            'gender': e.get('gender', ''),
            'frequency': 1,  # placeholder, replaced by pin_core_order()
        })
    return rows, [e['word'] for e in data['entries']]


def pin_core_order(entries: list[dict], core_words: set[str], previous_order: list[str]) -> None:
    """Give fallback core entries a sort value that keeps their fr.js position.

    ``emit`` orders French entries by descending Lexique frequency (wordfreq
    where Lexique has none).  The curriculum / glossary entries still carry
    theirs; each run of core entries gets the midpoint between its two
    neighbours in the previous fr.js order.
    """
    by_word = {e['word']: e for e in entries}
    value = {}
    for e in entries:
        if e['word'] not in core_words:
            e.setdefault('freq', vocab_schema.wordfreq_per_million(e['word'], 'fr'))
            value[e['word']] = e['_lexique'] or e['freq'] or 0
    pending: list[dict] = []
    previous = None
    for word in previous_order:
        entry = by_word.get(word)
        if entry is None:
            continue
        if word in core_words:
            pending.append(entry)
            continue
        current = value[word]
        if not current:
            continue  # unranked: sorted to the tail, not an anchor
        for p in pending:
            p['_lexique'] = (previous + current) / 2 if previous is not None else current * 2
        pending = []
        previous = current
    for p in pending:
        p['_lexique'] = previous / 2 if previous else 1.0


def assemble(core_path: Path | None = CORE_PATH) -> Path:
    curriculum = vocab_legacy.read_legacy_array(CURRICULUM_PATH)
    glossary = vocab_legacy.read_legacy_array(GLOSSARY_PATH)
    if core_path and Path(core_path).exists():
        core = json.loads(Path(core_path).read_text(encoding='utf-8'))
        core_words, previous_order = None, None
        print(f'assemble: core layer from {core_path} ({len(core)} rows)', file=sys.stderr)
    else:
        layer_keys = {layer_key(r.get('french')) for r in curriculum + glossary}
        core, previous_order = core_rows_from_vocab(layer_keys)
        core_words = {r['french'] for r in core}
        print(f'assemble: {core_path} not found; reusing the {len(core)} core entries '
              'of data/vocab/fr.js', file=sys.stderr)
    entries = vocab_legacy.from_fr([(curriculum, 'textbook'), (glossary, 'textbook'),
                                    (core, 'freq-band')])
    # hand-checked corrections (scripts/vocab_fixes/fr.json): applied last, so
    # a rebuild from fresh corpora cannot bring an audited pivot error back
    applied, stale = fr_vocab_fixes.apply_fixes(entries, key=vocab_legacy.headword_key)
    print(f'assemble: {applied} vocab fixes applied', file=sys.stderr)
    for message in stale:
        print(f'assemble: stale vocab fix: {message}', file=sys.stderr)
    for message in fr_vocab_fixes.gloss_collisions(entries):
        print(f'assemble: zh collision after fixes: {message}', file=sys.stderr)
    if core_words is not None:
        pin_core_order(entries, core_words, previous_order)
    return vocab_legacy.emit('fr', entries, builder=BUILDER)


def fill_glossary_english(path: Path = GLOSSARY_PATH) -> int:
    """Give glossary rows without `english` a Wiktionary gloss, in place.

    The glossary was enriched from the kaikki French dump, which misses some
    textbook headwords (country names, compounds); kaikki's per-word pages
    cover many of them.  One JSON object per line, so the edit is a line edit.
    """
    lines = path.read_text(encoding='utf-8').split('\n')
    filled = 0
    for i, line in enumerate(lines):
        body = line.strip()
        if not body.startswith('{'):
            continue
        comma = body.endswith(',')
        row = json.loads(body.rstrip(','))
        if row.get('english'):
            continue
        english = ''
        for word in dict.fromkeys([row.get('french') or '', (row.get('french') or '').lower()]):
            if word:
                # a place / feast name: its first sense only ("Belgique" also
                # glosses the historical Low Countries)
                english = vocab_schema.kaikki_english('French', word,
                                                      limit=1 if word[:1].isupper() else 3)
            if english:
                break
        if not english:
            continue
        row['english'] = english
        indent = line[:len(line) - len(line.lstrip())]
        lines[i] = indent + json.dumps(row, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')
        filled += 1
    path.write_text('\n'.join(lines), encoding='utf-8')
    print(f'fill-english: {filled} glossary rows given an English gloss', file=sys.stderr)
    return filled


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)

    p = sub.add_parser('prepare-freq')
    p.add_argument('lexique_tsv', type=Path)
    p.add_argument('out_json', type=Path)

    p = sub.add_parser('prepare-fren')
    p.add_argument('kaikki_jsonl', type=Path)
    p.add_argument('out_json', type=Path)

    p = sub.add_parser('prepare-enzh')
    p.add_argument('stardict_base', type=Path)
    p.add_argument('out_json', type=Path)

    p = sub.add_parser('curriculum', help=f'rebuild {CURRICULUM_PATH.relative_to(ROOT)}, then assemble')
    p.add_argument('--freq', type=Path, required=True)
    p.add_argument('--fren', type=Path, required=True)
    p.add_argument('--enzh', type=Path, required=True)
    p.add_argument('--src', type=Path, default=CURRICULUM_PATH)
    p.add_argument('--out', type=Path, default=CURRICULUM_PATH)
    p.add_argument('--registry', type=Path)
    p.add_argument('--core', type=Path, default=CORE_PATH,
                   help='core layer JSON for the assemble step (default %(default)s)')

    p = sub.add_parser('core', help='write the core layer JSON, then assemble')
    p.add_argument('--freq', type=Path, required=True)
    p.add_argument('--fren', type=Path, required=True)
    p.add_argument('--enzh', type=Path, required=True)
    p.add_argument('--curriculum', type=Path, default=CURRICULUM_PATH)
    p.add_argument('--glossary', type=Path, default=GLOSSARY_PATH)
    p.add_argument('--out', type=Path, default=CORE_PATH,
                   help='intermediate core layer JSON (default %(default)s)')
    p.add_argument('--max-rank', type=int, default=25000)

    p = sub.add_parser('assemble', help='merge curriculum + glossary + core into data/vocab/fr.js')
    p.add_argument('--core', type=Path, default=CORE_PATH,
                   help='core layer JSON (default %(default)s); when absent, the core '
                        'entries already in data/vocab/fr.js are reused')

    sub.add_parser('fill-english', help='fill missing glossary English from kaikki.org, then assemble')

    args = parser.parse_args()
    if args.command == 'fill-english':
        fill_glossary_english()
        print(assemble(CORE_PATH))
    elif args.command == 'prepare-freq':
        prepare_freq(args.lexique_tsv, args.out_json)
    elif args.command == 'prepare-fren':
        prepare_fren(args.kaikki_jsonl, args.out_json)
    elif args.command == 'prepare-enzh':
        prepare_enzh(args.stardict_base, args.out_json)
    elif args.command == 'curriculum':
        build_curriculum(args)
    elif args.command == 'core':
        build_core(args)
    elif args.command == 'assemble':
        print(assemble(args.core))


if __name__ == '__main__':
    main()
