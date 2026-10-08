#!/usr/bin/env python3
"""
Build a learner-useful English vocabulary data file.

Output: data/vocab/en.js   (schema v1, see docs/vocab-schema.md)

Internally each word is built in the pipeline's own shape
    { english, meaning, chinese, notes, rank, source }
  - english : the headword (lowercase)
  - meaning : clean, usable Chinese gloss WITH part-of-speech markers
  - chinese : Chinese-only portion (POS markers stripped) when it can be
              separated cleanly; otherwise == meaning
  - notes   : short part-of-speech hint (e.g. "n. v.")
  - rank    : 1-based REAL English frequency rank (1 = most common)
  - source  : provenance string ("wordfreq+EnWords" or "wordfreq+ECDICT")
and the final list is mapped onto v1 by vocab_legacy.from_en(): the POS
markers in `meaning` become `pos` / `posAll`, the rest becomes `zh`.

Pipeline
--------
1. Real frequency order comes from the `wordfreq` package (top_n_list('en', N)).
   This replaces the old alphabetical EnWords.csv ordering whose head was junk
   (single letters, acronyms like `aaal`/`aacs`, place names like `aachen`).
2. Glosses come from TWO open English->Chinese dictionary sources, tried in order:
      a. EnWords.csv  (the original raw English->Chinese dictionary dump).
      b. ECDICT       (skywind3000/ECDICT, MIT-licensed code + aggregated open
                       dictionary data, ~770k entries). Used as a FALLBACK only
                       for high-frequency words EnWords does not define, which
                       lifts gloss coverage from ~12k to ~24k useful words.
   The first pass that produced this file was capped at ~12k because EnWords
   alone ran out of glosses; ECDICT closes that gap (~99.5% of the top-25k
   wordfreq words now get a clean gloss).
3. Each raw gloss is cleaned to drop the messiest fragments:
      - EnWords: domain/country codes ([域]/[军]/[化] ...), acronym expansions,
        trailing alt-dict dumps after " / ".
      - ECDICT : literal "\\n"-separated POS lines collapsed to "; "; [网络]
        (web) lines and domain-only senses ([计]/[医]/[法] ...) dropped; inline
        domain markers stripped.
4. Only genuine, learner-relevant headwords are kept:
      - pure alphabetic (a-z), length >= 2 (drops single letters, numbers,
        contractions, symbols/emoji)
      - must have a cleaned gloss that still contains Chinese characters
      - obvious place-/person-name-only entries are dropped
Words that pass are emitted in frequency order, re-ranked 1..N.

Sources / licenses
-------------------
  - EnWords.csv : raw open English->Chinese dictionary dump (lineage of the open
    简明英汉词典), bundled under ` english-data/english word/`.
  - ECDICT      : https://github.com/skywind3000/ECDICT — code MIT-licensed,
    data aggregated from free/open dictionaries (简明英汉词典 base) with BNC/COCA
    frequency correction and WordNet-derived forms. A TRIMMED slice containing
    only the headwords this build actually uses is committed at
    ` english-data/english word/ecdict-slice.csv` so the build is reproducible
    without the full 66MB file. To refresh the slice from the upstream full
    ecdict.csv, set ECDICT_FULL=/path/to/ecdict.csv and run this script; it will
    (re)write the slice.

Run:  python3 scripts/build_english_vocab.py
"""

import os
import csv
import re
import sys

from wordfreq import top_n_list

HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.abspath(HERE))
import vocab_legacy  # noqa: E402
# Note: the source directory name has a real leading space — preserve it.
ENWORDS_FILE = os.path.join(HERE, '..', ' english-data', 'english word', 'EnWords.csv')
# Trimmed ECDICT slice (committed). Built/refreshed from ECDICT_FULL when set.
ECDICT_SLICE = os.path.join(HERE, '..', ' english-data', 'english word', 'ecdict-slice.csv')
ECDICT_FULL = os.environ.get('ECDICT_FULL')  # optional full upstream ecdict.csv

# How many wordfreq candidates to scan. We keep every candidate that has a
# usable gloss, so the final list is naturally smaller than this.
FREQ_SCAN = 26000
# Cap the final list. With EnWords+ECDICT this yields ~24k genuinely useful,
# frequency-ordered, cleanly-glossed words.
MAX_WORDS = 24000

# ---------------------------------------------------------------------------
# EnWords gloss cleaning (unchanged behaviour from the first pass)
# ---------------------------------------------------------------------------

# Domain / register markers whose bracketed payload is dictionary noise for a
# general learner. We strip the marker and the short fragment that follows it.
NOISE_BRACKETS = ['域', '军', '化', '电', '计', '医', '物', '数', '法', '经',
                  '机', '建', '矿', '航', '海', '体', '心', '地', '天', '生',
                  '动', '植', '冶', '纺', '印', '摄', '无', '自']

# Part-of-speech tokens we treat as the start of a "real" definition segment.
POS_TOKENS = ['n.', 'v.', 'vt.', 'vi.', 'vbl.', 'adj.', 'a.', 'adv.', 'ad.',
              'prep.', 'conj.', 'pron.', 'art.', 'num.', 'int.', 'interj.',
              'aux.', 'pl.', 'abbr.', 'na.']
POS_RE = re.compile(r'\b(?:' + '|'.join(re.escape(p) for p in POS_TOKENS) + r')')

# matches "symb [化]砷" style chemistry symbol notes
SYMB_RE = re.compile(r'\(?[A-Za-z]{1,3}\)?\s*symb\b.*$')


def strip_noise(raw: str) -> str:
    """Remove the messiest dictionary fragments from a raw EnWords gloss."""
    s = raw.strip()
    # Drop trailing alt-dictionary dumps that follow a space + "/" (these are a
    # second scraped dictionary glued on, e.g. "... 接着又 /conj.及(或)").
    s = re.split(r'\s/', s)[0].strip()
    # Drop malformed bracket garbage that contains an embedded slash, e.g.
    # "[)n/n.管理,经营,衅]网络管理" — these are scrape artifacts, not real senses.
    s = re.sub(r'\[[^\]]*/[^\]]*\]', '', s)
    # Drop chemistry-symbol tail: "... symb [化]砷 (arsenic)"
    s = SYMB_RE.sub('', s).strip()
    # Drop bracketed domain markers and the fragment up to the next major sep.
    for mk in NOISE_BRACKETS:
        s = re.sub(r'\[' + mk + r'\][^;；]*', '', s)
    # Collapse leftover whitespace / stray separators
    s = re.sub(r'\s+', ' ', s).strip(' ;；,，/')
    return s


def drop_acronym_expansions(s: str) -> str:
    """Drop 'CapWord(s),中文' acronym-expansion segments lacking a POS marker."""
    parts = re.split(r'[;；]', s)
    kept = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if re.match(r'^[A-Z][A-Za-z]', p) and not POS_RE.search(p):
            continue
        kept.append(p)
    return '; '.join(kept).strip()


def clean_enwords(raw: str) -> str:
    """Produce a clean, usable gloss from a raw EnWords line."""
    if not raw:
        return ''
    s = strip_noise(raw)
    s = drop_acronym_expansions(s)
    s = re.sub(r'\s+', ' ', s).strip(' ;；,，/')
    return s


# ---------------------------------------------------------------------------
# ECDICT gloss cleaning
# ---------------------------------------------------------------------------

# Domain markers in ECDICT translations. A line that is ONLY a domain sense is
# dropped (when a general sense already exists); inline markers are stripped.
ECDICT_DOMAIN_RE = re.compile(
    r'\[(?:计|医|法|化|经|机|电|建|物|动|植|军|体|语|症|口|俚|古|圣经|网络|'
    r'作用|法律|美俚|美国|美|语法学|机械学|复数|无线电|矿|冶|纺|航|海|心|地|'
    r'天|生|印|摄|自|数|无|商|农|船|教|宗|音|乐|史|哲|心理)\]'
)
# A line beginning with a domain marker (a domain-specific sense).
ECDICT_DOMAIN_LINE_RE = re.compile(r'^\[(?:[^\]]{1,5})\]')
HAS_CN_RE = re.compile(r'[一-鿿]')


def clean_ecdict(translation: str) -> str:
    """Clean an ECDICT `translation` field into a usable gloss.

    ECDICT stores POS senses separated by a literal "\\n". We collapse them to
    "; ", drop pure [网络] (web) lines and domain-only senses, and strip inline
    domain markers like [计]/[医]. Returns '' if nothing usable remains.
    """
    if not translation:
        return ''
    tr = translation.replace('\\n', '\n').replace('\r', '')
    lines = [ln.strip() for ln in tr.split('\n') if ln.strip()]
    kept = []
    for ln in lines:
        if ln.startswith('[网络]'):
            continue
        # Drop a domain-only sense line once we already have a general sense.
        if ECDICT_DOMAIN_LINE_RE.match(ln) and kept:
            continue
        ln = ECDICT_DOMAIN_RE.sub('', ln)
        ln = re.sub(r'\s+', ' ', ln).strip(' ,;，；')
        if ln and HAS_CN_RE.search(ln):
            kept.append(ln)
        if len(kept) >= 3:
            break
    meaning = '; '.join(kept).strip(' ;，；')
    return re.sub(r'\s+', ' ', meaning).strip()


# ---------------------------------------------------------------------------
# Shared derivations
# ---------------------------------------------------------------------------

def extract_pos_notes(meaning: str) -> str:
    """Collect the distinct POS markers present, as a short hint string."""
    seen = []
    for m in POS_RE.findall(meaning):
        if m not in seen:
            seen.append(m)
        if len(seen) >= 4:
            break
    return ' '.join(seen)


def chinese_only(meaning: str) -> str:
    """Strip POS markers to get a Chinese-leaning gloss; '' if not meaningful."""
    cn = POS_RE.sub('', meaning)
    cn = re.sub(r'\s+', ' ', cn).strip(' ;；,，/')
    if not HAS_CN_RE.search(cn):
        return ''
    return cn


def has_chinese(s: str) -> bool:
    return bool(HAS_CN_RE.search(s))


def truncate(s: str) -> str:
    """Keep glosses concise: cut overly long dumps at a sense boundary."""
    if len(s) <= 120:
        return s
    cut = s[:120]
    for sep in ['；', ';', '。']:
        idx = cut.rfind(sep)
        if idx > 60:
            cut = cut[:idx]
            break
    return cut.strip(' ;；,，/')


# Signals that an entry is an obvious proper noun / place name. We only drop when
# these are the WHOLE story (no real POS-marked sense survives).
PROPER_NOUN_RE = re.compile(
    r'\[[^\]]*?(城市|首府|地区|州|郡|国|河|山|岛|港|镇|村)[^\]]*?\]'   # place brackets
    r'|\((?:m\.|f\.|男子名|女子名|人名|姓氏)\)'                          # person markers
    r'|\[(?:人名|地名)\]'                                               # ECDICT name tags
)


def is_proper_noun(meaning: str) -> bool:
    """True when the entry is essentially only a place name / person name."""
    if not PROPER_NOUN_RE.search(meaning):
        return False
    if not POS_RE.search(meaning):
        return True
    if re.search(r'\((?:m\.|f\.|男子名|女子名|人名|姓氏)\)|\[(?:人名|地名)\]', meaning):
        return True
    return False


# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------

def load_enwords() -> dict:
    glosses = {}
    with open(ENWORDS_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f)
        next(reader, None)  # header
        for row in reader:
            if len(row) < 2:
                continue
            w = row[0].strip().lower()
            if not w or w in glosses:
                continue
            glosses[w] = row[1].strip()
    return glosses


def candidate_words() -> list:
    """Return frequency-ordered, form-valid candidate headwords."""
    word_re = re.compile(r'^[a-z]+$')
    return [w for w in top_n_list('en', FREQ_SCAN)
            if word_re.match(w) and len(w) >= 2]


def load_ecdict_slice(needed: set) -> dict:
    """Load ECDICT translations for `needed` headwords.

    Prefers the committed trimmed slice. If ECDICT_FULL is set, reads the full
    upstream csv instead and (re)writes the trimmed slice for reproducibility.
    """
    out = {}
    if ECDICT_FULL and os.path.exists(ECDICT_FULL):
        print(f"Reading full ECDICT from {ECDICT_FULL} (and refreshing slice) ...")
        rows = []
        with open(ECDICT_FULL, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                w = row['word'].strip().lower()
                if w in needed and w not in out:
                    tr = row.get('translation', '') or ''
                    out[w] = tr
                    rows.append((w, tr))
        rows.sort()
        with open(ECDICT_SLICE, 'w', encoding='utf-8', newline='') as f:
            wri = csv.writer(f)
            wri.writerow(['word', 'translation'])
            for w, tr in rows:
                wri.writerow([w, tr])
        print(f"Wrote {len(rows)} ECDICT slice rows to {ECDICT_SLICE}")
        return out
    if os.path.exists(ECDICT_SLICE):
        with open(ECDICT_SLICE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                w = row['word'].strip().lower()
                if w and w not in out:
                    out[w] = row.get('translation', '') or ''
        print(f"Loaded {len(out)} ECDICT slice glosses from {ECDICT_SLICE}")
        return out
    print("WARNING: no ECDICT source available (set ECDICT_FULL to build the "
          "slice). Falling back to EnWords-only coverage.")
    return out


# ---------------------------------------------------------------------------
# Part of speech + capitalisation (lexicon slice)
# ---------------------------------------------------------------------------
# The gloss markers (n. / v. / prep. ...) give *a* part of speech per sense in
# dictionary order, which mislabels function words ("is" = prep.) and puts
# rare senses first ("good" = n.).  Two open sources fix that and supply the
# capitalisation the lowercase wordfreq list lost:
#   * Universal Dependencies English EWT + GUM treebanks (CC BY-SA 4.0):
#     per-form UPOS counts and the spelling used mid-sentence.
#   * Open English WordNet 2024 (CC BY 4.0): lemma spellings ("Estonian",
#     "York", "USA"), POS and whether a sense is a named instance.
# A trimmed slice for this build's candidate words is committed at
# data/vocab/src/en-lexicon.tsv.  Refresh it from the full sources with
#   OEWN_XML=/path/english-wordnet-2024.xml \
#   UD_DIRS=/path/UD_English-EWT:/path/UD_English-GUM \
#   python3 scripts/build_english_vocab.py
# (github.com/globalwordnet/english-wordnet/releases,
#  github.com/UniversalDependencies/UD_English-EWT, .../UD_English-GUM).
# The last-resort tagger for words in neither source is spaCy en_core_web_sm.
LEXICON_SLICE = os.path.join(HERE, '..', 'data', 'vocab', 'src', 'en-lexicon.tsv')
OEWN_XML = os.environ.get('OEWN_XML')
UD_DIRS = [d for d in os.environ.get('UD_DIRS', '').split(':') if d]

UD_POS = {'NOUN': 'noun', 'PROPN': 'properNoun', 'VERB': 'verb', 'AUX': 'verb',
          'ADJ': 'adjective', 'ADV': 'adverb', 'PRON': 'pronoun', 'DET': 'determiner',
          'ADP': 'preposition', 'CCONJ': 'conjunction', 'SCONJ': 'conjunction',
          'NUM': 'numeral', 'INTJ': 'interjection'}
WN_POS = {'n': 'noun', 'v': 'verb', 'a': 'adjective', 's': 'adjective', 'r': 'adverb'}
CLOSED = {'pronoun', 'determiner', 'article', 'preposition', 'conjunction', 'numeral'}
# Chinese gloss that is only a name: "(男名)", "人名", "艾蒂安（比利时发明家）".
NAME_GLOSS_RE = re.compile(
    r'人名|地名|男名|女名|男子名|女子名|姓氏'
    r'|[（(][^）)]{0,12}(?:家|总统|国王|皇帝|演员|歌手|运动员|首相)[）)]')
ACRONYM_GLOSS_RE = re.compile(r'缩写|简写|简称|的缩|首字母')


def _counter_str(c) -> str:
    return ','.join(f'{k}={v}' for k, v in sorted(c.items(), key=lambda kv: (-kv[1], kv[0])))


def _parse_counter(s: str) -> dict:
    out = {}
    for part in filter(None, s.split(',')):
        k, _, v = part.rpartition('=')
        out[k] = int(v)
    return out


def build_lexicon_slice(words: set) -> None:
    """Write LEXICON_SLICE from the full OEWN XML and UD treebanks."""
    import glob
    import xml.etree.ElementTree as ET
    from collections import Counter, defaultdict
    upos, case = defaultdict(Counter), defaultdict(Counter)
    for d in UD_DIRS:
        for path in sorted(glob.glob(os.path.join(d, '*.conllu'))):
            first = True
            with open(path, encoding='utf-8') as f:
                for line in f:
                    if line.startswith('#'):
                        continue
                    if not line.strip():
                        first = True
                        continue
                    cols = line.rstrip('\n').split('\t')
                    if '-' in cols[0] or '.' in cols[0]:
                        continue
                    form, tag, key = cols[1], cols[3], cols[1].lower()
                    if key in words:
                        upos[key][tag] += 1
                        if not first and form.isalpha():
                            case[key][form] += 1
                    if tag != 'PUNCT':
                        first = False
    instances, lemmas = set(), defaultdict(list)
    for _, el in ET.iterparse(OEWN_XML, events=('end',)):
        if el.tag == 'LexicalEntry':
            lemma = el.find('Lemma')
            form = lemma.get('writtenForm')
            if form.lower() in words:
                lemmas[form.lower()].append(
                    (form, lemma.get('partOfSpeech'), [s.get('synset') for s in el.findall('Sense')]))
            el.clear()
        elif el.tag == 'Synset':
            if any(r.get('relType') == 'instance_hypernym' for r in el.findall('SynsetRelation')):
                instances.add(el.get('id'))
            el.clear()
    with open(LEXICON_SLICE, 'w', encoding='utf-8', newline='') as f:
        f.write('# word\tUD UPOS counts\tUD mid-sentence spellings\t'
                'OEWN lemmas (form|pos|senses|instance senses)\n')
        for w in sorted(words):
            wn = ';'.join(f'{form}|{p}|{len(s)}|{sum(x in instances for x in s)}'
                          for form, p, s in lemmas.get(w, []))
            if upos.get(w) or wn:
                f.write(f'{w}\t{_counter_str(upos.get(w, {}))}\t'
                        f'{_counter_str(case.get(w, {}))}\t{wn}\n')
    print(f'Wrote lexicon slice {LEXICON_SLICE}')


def load_lexicon() -> dict:
    lex = {}
    if not os.path.exists(LEXICON_SLICE):
        print('WARNING: no lexicon slice; POS refinement and capitalisation skipped.')
        return lex
    with open(LEXICON_SLICE, encoding='utf-8') as f:
        for line in f:
            if line.startswith('#'):
                continue
            w, ud, case, wn = (line.rstrip('\n').split('\t') + ['', '', ''])[:4]
            lemmas = []
            for item in filter(None, wn.split(';')):
                form, p, n, inst = item.split('|')
                lemmas.append((form, p, int(n), int(inst)))
            lex[w] = {'ud': _parse_counter(ud), 'case': _parse_counter(case), 'wn': lemmas}
    return lex


_spacy: list = []


def spacy_pos(word: str) -> str:
    if not _spacy:
        try:
            import spacy
            _spacy.append(spacy.load('en_core_web_sm'))
        except Exception:  # pragma: no cover - optional build-time dependency
            _spacy.append(None)
    if not _spacy[0]:
        return ''
    return UD_POS.get(_spacy[0](word)[0].pos_, '')


def capitalised_form(word: str, info: dict, zh: str) -> str:
    """'york' -> 'York', 'usa' -> 'USA'; '' when the word is a common word."""
    forms = [f for f, *_ in info.get('wn', [])]
    if word in forms or '复数' in zh or '的过去' in zh:
        return ''          # "march", "china", "god"; "masters" (plural of master)
    case = info.get('case', {})
    if forms:
        caps = [f for f in forms if f.lower() == word]
        if not caps:
            return ''
        seen = sorted((f for f in caps if case.get(f)), key=lambda f: -case[f])
        return seen[0] if seen else next((f for f in caps if f[1:].islower()), caps[0])
    # Not in WordNet: only names ("Comets", "Marks" are plurals that UD saw
    # as team / shop names).
    ud = info.get('ud', {})
    total = sum(case.values())
    if (total >= 3 and case.get(word, 0) <= 0.1 * total
            and ud.get('PROPN', 0) * 2 > sum(ud.values())):
        return max((f for f in case if f != word), key=lambda f: case[f])
    if NAME_GLOSS_RE.search(zh):
        return word[:1].upper() + word[1:]
    return ''


def refine_en(entries: list, lex: dict) -> dict:
    """Fix primary POS, fill missing POS, restore capitalisation (in place)."""
    from collections import Counter
    stats: Counter = Counter()
    for e in entries:
        word, zh = e['word'], e.get('zh', '')
        info = lex.get(word, {})
        raw_ud = info.get('ud', {})
        pos_all = list(e.get('posAll') or ([e['pos']] if e.get('pos') else []))
        before = list(pos_all)
        ud: Counter = Counter()
        for tag, n in raw_ud.items():
            if tag in UD_POS and tag != 'PROPN':
                ud[UD_POS[tag]] += n
        total = sum(ud.values())
        if 'article' in pos_all and ud.get('determiner'):
            ud['article'] = ud.pop('determiner')
        # 1. corpus majority decides the primary POS and adds a missing
        #    closed-class one ("is" AUX -> verb, "every" DET -> determiner).
        if total >= 10 and pos_all:
            top, n = ud.most_common(1)[0]
            if n / total >= 0.4 and not (top == 'verb' and pos_all[0] == 'adjective'):
                # (participles "broken", "hidden" stay adjectives for learners)
                if top in pos_all:
                    pos_all.remove(top)
                    pos_all.insert(0, top)
                elif top in CLOSED or raw_ud.get('AUX', 0) >= n / 2:
                    pos_all.insert(0, top)
            for p, k in ud.most_common():
                if p in CLOSED and k / total >= 0.1 and p not in pos_all:
                    pos_all.append(p)
            if total >= 50:      # a function-word label the corpus (almost) never uses
                pos_all = [p for i, p in enumerate(pos_all) if i == 0 or p not in
                           ('preposition', 'conjunction', 'article')
                           or ud.get(p, 0) >= 0.01 * total]
        # 2. no POS at all: gloss shape, corpus, WordNet, spaCy.
        if not pos_all:
            wn = info.get('wn', [])
            guess, how = '', ''
            if ACRONYM_GLOSS_RE.search(zh) or any(f.isupper() and len(f) > 1 for f, *_ in wn):
                guess, how = 'abbreviation', 'gloss/wordnet'
            elif NAME_GLOSS_RE.search(zh):
                guess, how = 'properNoun', 'gloss'
            elif wn and all(inst for *_, inst in wn):
                guess, how = 'properNoun', 'wordnet'
            elif sum(raw_ud.values()) >= 3:
                tags = Counter()
                for t, n in raw_ud.items():
                    if t in UD_POS:
                        tags[UD_POS[t]] += n
                if tags:
                    guess, how = tags.most_common(1)[0][0], 'ud'
            if not guess and wn:
                senses: Counter = Counter()
                for _, p, n, _inst in wn:
                    senses[WN_POS.get(p, 'noun')] += n
                guess, how = senses.most_common(1)[0][0], 'wordnet'
            if not guess and (len(word) <= 4 or not re.search('[aeiouy]', word)
                              or re.match(r'[\[(=]?[A-Za-z]+[ ,-][A-Za-z]', zh)):
                guess, how = 'abbreviation', 'shape'    # "sgt", "blm", "pvt": pressure, ...
            if not guess:
                guess, how = spacy_pos(word), 'spacy'
            if guess:
                pos_all = [guess]
                stats['pos-filled:' + how] += 1
        # 3. capitalisation of proper nouns and demonyms ("York", "Estonian").
        cap = capitalised_form(word, info, zh)
        if (not cap and pos_all[:1] == ['properNoun'] and len(word) > 4
                and word not in [f for f, *_ in info.get('wn', [])]):
            cap = word[:1].upper() + word[1:]               # "ferrari", "mitsubishi"
        wn = info.get('wn', [])
        named = (bool(wn) and all(inst for *_, inst in wn)) or (
            not wn and (raw_ud.get('PROPN', 0) > total or bool(NAME_GLOSS_RE.search(zh))))
        if cap and not named and pos_all[:1] not in (['abbreviation'], ['properNoun']) and (
                cap.isupper() or len(cap) <= 3):
            cap = ''            # "tv", "ph", "rb" (gloss is not the element): keep
        if cap:
            if named and (not pos_all or pos_all[0] in ('noun', 'abbreviation')):
                pos_all = ['properNoun'] + [p for p in pos_all[1:] if p != 'noun']
            e['legacyWord'] = word
            e['word'] = cap
            stats['recased'] += 1
        if pos_all != before:
            stats['pos-changed'] += 1
            if before and pos_all[:1] != before[:1]:
                stats['primary-changed'] += 1
        e['pos'] = pos_all[0] if pos_all else ''
        e['posAll'] = pos_all if len(pos_all) > 1 else []
    return dict(stats)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print(f"Reading EnWords glosses from {ENWORDS_FILE} ...")
    if not os.path.exists(ENWORDS_FILE):
        print(f"ERROR: File not found: {ENWORDS_FILE}")
        return
    enwords = load_enwords()
    print(f"Loaded {len(enwords)} raw EnWords glosses.")

    print(f"Fetching top {FREQ_SCAN} English words by real frequency (wordfreq) ...")
    cands = candidate_words()
    print(f"{len(cands)} form-valid frequency candidates.")

    ecdict = load_ecdict_slice(set(cands))

    words = []
    rank = 0
    n_enwords = 0
    n_ecdict = 0
    skipped_no_gloss = 0
    skipped_proper = 0
    for cand in cands:
        meaning = ''
        src = ''
        raw = enwords.get(cand)
        if raw:
            meaning = clean_enwords(raw)
            if has_chinese(meaning):
                src = 'wordfreq+EnWords'
            else:
                meaning = ''
        if not meaning:
            raw_ec = ecdict.get(cand)
            if raw_ec:
                meaning = clean_ecdict(raw_ec)
                if has_chinese(meaning):
                    src = 'wordfreq+ECDICT'
                else:
                    meaning = ''
        if not meaning:
            skipped_no_gloss += 1
            continue
        meaning = truncate(meaning)
        if is_proper_noun(meaning):
            skipped_proper += 1
            continue
        rank += 1
        cn = chinese_only(meaning)
        words.append({
            'english': cand,
            'meaning': meaning,
            'chinese': cn if cn else meaning,
            'notes': extract_pos_notes(meaning),
            'rank': rank,
            'source': src,
        })
        if src == 'wordfreq+EnWords':
            n_enwords += 1
        else:
            n_ecdict += 1
        if rank >= MAX_WORDS:
            break

    print(f"Kept {len(words)} words "
          f"({n_enwords} from EnWords, {n_ecdict} from ECDICT fallback); "
          f"skipped {skipped_no_gloss} without usable gloss, "
          f"{skipped_proper} proper nouns.")

    if OEWN_XML and UD_DIRS:
        build_lexicon_slice(set(cands))
    entries = vocab_legacy.from_en(words)
    print(f"POS / capitalisation: {refine_en(entries, load_lexicon())}")
    out = vocab_legacy.emit('en', entries, builder='scripts/build_english_vocab.py')
    print(f"Done! Written to {out}")


if __name__ == '__main__':
    main()
