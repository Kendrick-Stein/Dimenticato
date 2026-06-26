#!/usr/bin/env python3
"""
Build a learner-useful English vocabulary data file.

Output: data/english-vocabulary.js   (const ENGLISH_VOCABULARY_DATA)
Item shape (field contract consumed by german-app.js / lib/quiz-engine.js):
    { english, meaning, chinese, notes, rank, source }
  - english : the headword (lowercase)
  - meaning : clean, usable Chinese gloss WITH part-of-speech markers
              (this is the quiz answer field: fieldMap target = 'meaning')
  - chinese : Chinese-only portion (POS markers stripped) when it can be
              separated cleanly; otherwise == meaning
  - notes   : short part-of-speech hint (e.g. "n. v.") shown as a hint button
  - rank    : 1-based REAL English frequency rank (1 = most common)
  - source  : provenance string ("wordfreq+EnWords" or "wordfreq+ECDICT")

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
import json
import re

from wordfreq import top_n_list

HERE = os.path.dirname(__file__)
# Note: the source directory name has a real leading space — preserve it.
ENWORDS_FILE = os.path.join(HERE, '..', ' english-data', 'english word', 'EnWords.csv')
# Trimmed ECDICT slice (committed). Built/refreshed from ECDICT_FULL when set.
ECDICT_SLICE = os.path.join(HERE, '..', ' english-data', 'english word', 'ecdict-slice.csv')
ECDICT_FULL = os.environ.get('ECDICT_FULL')  # optional full upstream ecdict.csv
OUT_FILE = os.path.join(HERE, '..', 'data', 'english-vocabulary.js')

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

    payload = json.dumps(words, ensure_ascii=False, indent=2)
    out = (
        "// English vocabulary data — frequency-ranked (wordfreq) + EnWords.csv / ECDICT glosses\n"
        f"// Total entries: {len(words)}\n"
        "// Structure: {english, meaning, chinese, notes, rank, source}\n\n"
        f"const ENGLISH_VOCABULARY_DATA = {payload};\n\n"
        "if (typeof module !== 'undefined' && module.exports) {\n"
        "  module.exports = ENGLISH_VOCABULARY_DATA;\n"
        "}\n"
    )
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(out)
    print(f"Done! Written to {OUT_FILE}")


if __name__ == '__main__':
    main()
