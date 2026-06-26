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
  - source  : provenance string

Pipeline
--------
1. Real frequency order comes from the `wordfreq` package (top_n_list('en', N)).
   This replaces the old alphabetical EnWords.csv ordering whose head was junk
   (single letters, acronyms like `aaal`/`aacs`, place names like `aachen`).
2. Glosses come from EnWords.csv (a raw English->Chinese dictionary dump), which
   is cleaned to drop the messiest fragments:
      - domain/country codes:  [域] American Samoa,东萨摩亚
      - military/chemistry:     [军] ...   symb [化]砷 ...   [化]/[电]/[计] ...
      - acronym expansions:     Italy,意大利 / Intelligent Network,智能网络
      - trailing alt-dict dumps after " / "
3. Only genuine, learner-relevant headwords are kept for the head of the list:
      - must be pure alphabetic (a-z), length >= 2  (drops single letters,
        numbers, contractions like "don't", symbols/emoji)
      - must have a gloss in EnWords.csv (drops proper-noun-only / junk tokens
        that wordfreq lists but a learner dictionary does not define)
      - the cleaned gloss must still contain Chinese characters
Words that pass are emitted in frequency order, re-ranked 1..N.

Run:  python3 scripts/build_english_vocab.py
"""

import os
import csv
import json
import re

from wordfreq import top_n_list

HERE = os.path.dirname(__file__)
# Note: the source directory name has a real leading space — preserve it.
CSV_FILE = os.path.join(HERE, '..', ' english-data', 'english word', 'EnWords.csv')
OUT_FILE = os.path.join(HERE, '..', 'data', 'english-vocabulary.js')

# How many wordfreq candidates to scan. We keep every candidate that has a
# usable gloss, so the final list is naturally smaller than this.
FREQ_SCAN = 20000
# Cap the final list for a sensible, high-quality set (quality over count).
MAX_WORDS = 12000

# Domain / register markers whose bracketed payload is dictionary noise for a
# general learner. We strip the marker and the short fragment that follows it.
NOISE_BRACKETS = ['域', '军', '化', '电', '计', '医', '物', '数', '法', '经',
                  '机', '建', '矿', '航', '海', '体', '心', '地', '天', '生',
                  '动', '植', '冶', '纺', '印', '摄', '无', '自']

# Part-of-speech tokens we treat as the start of a "real" definition segment.
POS_TOKENS = ['n.', 'v.', 'vt.', 'vi.', 'vbl.', 'adj.', 'adv.', 'prep.',
              'conj.', 'pron.', 'art.', 'num.', 'int.', 'aux.', 'pl.', 'abbr.']
POS_RE = re.compile(r'\b(?:' + '|'.join(re.escape(p) for p in POS_TOKENS) + r')')

# matches "symb [化]砷" style chemistry symbol notes
SYMB_RE = re.compile(r'\(?[A-Za-z]{1,3}\)?\s*symb\b.*$')


def strip_noise(raw: str) -> str:
    """Remove the messiest dictionary fragments from a raw gloss."""
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
    # e.g. "[域] American Samoa,东萨摩亚" / "[军] High Explosive,高爆炸药"
    for mk in NOISE_BRACKETS:
        # marker + following text up to ';' or another POS marker or end
        s = re.sub(r'\[' + mk + r'\][^;；]*', '', s)
    # Collapse leftover whitespace / stray separators
    s = re.sub(r'\s+', ' ', s).strip(' ;；,，/')
    return s


def drop_acronym_expansions(s: str) -> str:
    """Drop 'CapWord(s),中文' acronym-expansion segments lacking a POS marker.

    These look like ';Italy,意大利' or ';Intelligent Network,智能网络'
    embedded in an otherwise normal gloss. We only drop a ';'-delimited segment
    when it starts with a capital ASCII letter and has no POS token, which is
    the signature of an acronym/proper-noun expansion rather than a real sense.
    """
    parts = re.split(r'[;；]', s)
    kept = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        # Starts with a capitalized English run and has no POS marker -> noise.
        if re.match(r'^[A-Z][A-Za-z]', p) and not POS_RE.search(p):
            continue
        kept.append(p)
    return '; '.join(kept).strip()


def clean_meaning(raw: str) -> str:
    """Produce a clean, usable gloss that keeps POS markers + core Chinese."""
    if not raw:
        return ''
    s = strip_noise(raw)
    s = drop_acronym_expansions(s)
    s = re.sub(r'\s+', ' ', s).strip(' ;；,，/')
    # Keep it concise: cut overly long dumps at a sense boundary past 90 chars.
    if len(s) > 120:
        cut = s[:120]
        for sep in ['；', ';', '。']:
            idx = cut.rfind(sep)
            if idx > 60:
                cut = cut[:idx]
                break
        s = cut.strip(' ;；,，/')
    return s


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
    """Strip leading POS markers from each sense to get a Chinese-leaning gloss.

    Returns '' if the result would not differ meaningfully from `meaning`.
    """
    # Remove POS tokens but keep the Chinese (and any punctuation between senses)
    cn = POS_RE.sub('', meaning)
    cn = re.sub(r'\s+', ' ', cn).strip(' ;；,，/')
    # If after stripping there are no Chinese chars, give up.
    if not re.search(r'[一-鿿]', cn):
        return ''
    return cn


def has_chinese(s: str) -> bool:
    return bool(re.search(r'[一-鿿]', s))


# Signals that an entry is an obvious proper noun / place name rather than a
# learner-relevant common word. We only drop when these are the WHOLE story
# (no real POS-marked sense survives), so e.g. "n.伦敦" / "n.意大利" are kept but
# "韦克菲尔德[英国英格兰北部城市]" and "n.奥布里(m.)" are dropped.
PROPER_NOUN_RE = re.compile(
    r'\[[^\]]*?(城市|首府|地区|州|郡|国|河|山|岛|港|镇|村)[^\]]*?\]'   # place brackets
    r'|\((?:m\.|f\.|男子名|女子名|人名|姓氏)\)'                          # person markers
)


def is_proper_noun(meaning: str) -> bool:
    """True when the entry is essentially only a place name / person name.

    Heuristic: it carries a place-/person-name signal AND has no part-of-speech
    marker. Real common words that happen to be capitals/countries keep their
    POS in EnWords (e.g. "n.伦敦", "n.意大利(欧洲南部国家)") and so are KEPT,
    while raw transliterated city/person names ("达拉斯[美国...城市]",
    "n.奥布里(m.)" has a person marker) are dropped.
    """
    if not PROPER_NOUN_RE.search(meaning):
        return False
    # A bare place transliteration like "达拉斯[...城市]" has no POS token.
    if not POS_RE.search(meaning):
        return True
    # Person-name markers (m./f./男子名...) signal a given-name entry; drop even
    # if a stray "n." precedes the transliteration ("n.奥布里(m.)").
    if re.search(r'\((?:m\.|f\.|男子名|女子名|人名|姓氏)\)', meaning):
        return True
    return False


def load_glosses() -> dict:
    glosses = {}
    with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
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


WORD_RE = re.compile(r"^[a-z]+$")


def main() -> None:
    print(f"Reading glosses from {CSV_FILE} ...")
    if not os.path.exists(CSV_FILE):
        print(f"ERROR: File not found: {CSV_FILE}")
        return
    glosses = load_glosses()
    print(f"Loaded {len(glosses)} raw dictionary glosses.")

    print(f"Fetching top {FREQ_SCAN} English words by real frequency (wordfreq) ...")
    freq_list = top_n_list('en', FREQ_SCAN)

    words = []
    rank = 0
    skipped_no_gloss = 0
    skipped_form = 0
    skipped_proper = 0
    for cand in freq_list:
        # Keep only genuine, learner-relevant headwords for the head of the list.
        if not WORD_RE.match(cand) or len(cand) < 2:
            skipped_form += 1
            continue
        raw = glosses.get(cand)
        if not raw:
            skipped_no_gloss += 1
            continue
        meaning = clean_meaning(raw)
        if not has_chinese(meaning):
            skipped_no_gloss += 1
            continue
        if is_proper_noun(meaning):
            skipped_proper += 1
            continue
        rank += 1
        cn = chinese_only(meaning)
        entry = {
            'english': cand,
            'meaning': meaning,
            'chinese': cn if cn else meaning,
            'notes': extract_pos_notes(meaning),
            'rank': rank,
            'source': 'wordfreq+EnWords',
        }
        words.append(entry)
        if rank >= MAX_WORDS:
            break

    print(f"Kept {len(words)} words (skipped {skipped_form} non-words, "
          f"{skipped_no_gloss} without usable gloss, {skipped_proper} proper nouns).")

    payload = json.dumps(words, ensure_ascii=False, indent=2)
    out = (
        "// English vocabulary data — frequency-ranked (wordfreq) + EnWords.csv glosses\n"
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
