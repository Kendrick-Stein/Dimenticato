#!/usr/bin/env python3
"""
Rebuild data/vocab/de.js  (DIM_VOCAB.de, schema v1 — see docs/vocab-schema.md).

The pipeline assembles an internal list of rows (shape below) and hands it to
vocab_legacy.emit("de", vocab_legacy.from_de(rows)), which maps it onto v1:
german -> word, chinese -> zh, english -> en, partOfSpeech -> pos, gender(s)
-> gender, plural / principalParts / pluraleTantum -> forms, the Goethe level
-> level + levelSource "official", and `rank` -> the v1 order.  The pgh.csv
parser (formerly scripts/process_german_vocab.py) lives in section 5a.

Addresses audit findings:
  de-handedict-half-unusable       inflected-form headwords + genderless nouns
  de-handedict-no-gender-pos       gender/POS on every entry, as real fields
  de-duplicate-headwords-share-mastered-key
                                   `german` is now unique across the dataset
  de-no-english-gloss              every entry carries a distinct English gloss
  no-english-gloss-de-fr-en        `english` != `chinese`
  de-vocab-no-tiering              `level` (A1..C1) + real corpus `frequency`

--------------------------------------------------------------------------
INTERNAL ROW SHAPE  (input to vocab_legacy.from_de; not written to disk)
--------------------------------------------------------------------------
  german        str   bare lemma (v1 `word`), the mastered-set key.
                      GUARANTEED UNIQUE (homograph senses are merged).
  display       str   what the learner sees / TTS speaks: "der Tag" for nouns
                      with a known gender, "ab/bauen" for separable verbs.
  meaning       str   Chinese gloss (the quiz answer; == chinese, as before)
  chinese       str   Chinese gloss
  notes         str   short grammar hint (POS + gender + plural / principal parts)
  source        str   provenance tokens, one per derived field:
                        zh:pgh.csv | zh:HanDeDict | zh:ECDICT-pivot | zh:curated
                        en:Wiktextract | en:Wiktextract-obs | en:curated
                        g:wikt | g:goethe  (where the gender came from)
                        f:OpenSubtitles-2018+Tatoeba | f:OpenSubtitles-2018-surface
                        lvl:goethe-A1|A2|B1 | lvl:freq-band
  rank          int   1-based dense rank over `frequency` (1 = most frequent)
  -- new --
  id            str   stable unique id, "de-00001"
  english       str   English gloss (Wiktionary, sense-joined)
  partOfSpeech  str   noun|verb|adjective|adverb|pronoun|preposition|
                      conjunction|numeral|interjection|determiner|article|
                      particle|phrase
  gender        str   'm'|'f'|'n' for nouns (absent for non-nouns)
  genders       list  present only when a noun has more than one gender
  level         str   'A1'|'A2'|'B1'|'B2'|'C1'
  frequency     int   raw corpus token count (OpenSubtitles de, lemma-aggregated)
  plural        str   plural form, nouns only, when Wiktionary has one
  principalParts str  verbs only: "geht, ging, ist gegangen"

--------------------------------------------------------------------------
SOURCES  (all fetched at build time into $DE_VOCAB_WORK, default /tmp/de-vocab-build)
--------------------------------------------------------------------------
  deutsch-data/vocab/pgh.csv
      in-repo German->Chinese glossary, ~9.3k words. CC-BY-SA 4.0.
  kaikki.org German (Wiktextract of the English Wiktionary)
      https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl
      English glosses, part of speech, noun gender + plural, verb principal
      parts, and the inflected-form -> lemma map.  CC-BY-SA 4.0 / GFDL.
  HanDeDict  https://github.com/gugray/HanDeDict  (handedict.u8)
      German->Chinese (inverted from the Chinese->German dictionary). CC-BY-SA 3.0.
  ECDICT  https://github.com/skywind3000/ECDICT  (stardict.db, release 1.0.28)
      English->Chinese, used only to pivot a Wiktionary English gloss to Chinese
      when neither pgh.csv nor HanDeDict covers the word. MIT.
  OpenSubtitles 2018 German frequency list
      https://github.com/hermitdave/FrequencyWords  content/2018/de/de_full.txt
      raw corpus token counts -> `frequency` and `rank`. CC-BY-SA 4.0.
  Goethe-Institut Wortlisten (A1 / A2 / B1), published free of charge at
      goethe.de. Only the CEFR level of each lemma is taken (a factual level
      tag); no example sentences or definitions are copied.

Run:  python3 scripts/build_german_vocabulary.py
      python3 scripts/build_german_vocabulary.py fill
          in-place post-pass on data/vocab/de.js (no dump download): fills
          `en` for entries that have none (the course headwords recovered in
          a1a7baf, which this pipeline does not regenerate) from kaikki.org
          per-word pages, falling back to the masculine base of an -in noun;
          re-emitting also canonicalises gender order (vocab_schema).
      DE_VOCAB_WORK=/tmp/de-vocab-build  (cache dir, downloads ~1.4 GB once)
      DE_VOCAB_STAGES=lexicon,freq,goethe,handedict,assemble  (default: all)
"""
from __future__ import annotations

import itertools
import json
import os
import re
import sqlite3
import subprocess
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

WORK = Path(os.environ.get("DE_VOCAB_WORK", "/tmp/de-vocab-build"))
WORK.mkdir(parents=True, exist_ok=True)
PGH_SOURCE = ROOT / "deutsch-data" / "vocab" / "pgh.csv"
BUILDER = "scripts/build_german_vocabulary.py"

KAIKKI_URL = "https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl"
FREQ_URL = ("https://cdn.jsdelivr.net/gh/hermitdave/FrequencyWords@master"
            "/content/2018/de/de_full.txt")
HANDEDICT_URL = "https://codeload.github.com/gugray/HanDeDict/zip/refs/heads/master"
TATOEBA_URL = ("https://downloads.tatoeba.org/exports/per_language/deu/"
               "deu_sentences.tsv.bz2")
ECDICT_URL = ("https://github.com/skywind3000/ECDICT/releases/download/1.0.28/"
              "ecdict-sqlite-28.zip")
GOETHE_URLS = {
    "A1": "https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf",
    "A2": "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A2_Wortliste.pdf",
    "B1": "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Wortliste.pdf",
}

# Which x-ranges on a Goethe wordlist page hold headwords (vs. example sentences).
GOETHE_HEADWORD_BANDS = {
    "A1": [(136, 232)],
    "A2": [(28, 100), (296, 372)],
    "B1": [(28, 128), (306, 408)],
}

# Compact per-entry provenance tokens. The legend lives in the generated file's
# header comment; every token names both the source and its licence.
SRC_TOKEN = {
    "pgh": "zh:pgh.csv(CC-BY-SA-4.0)",
    "handedict": "zh:HanDeDict(CC-BY-SA-3.0)",
    "ecdict-pivot": "zh:ECDICT-pivot(MIT)",
    "curated": "zh:curated(this repo)",
}
SRC_EN = "en:Wiktextract(CC-BY-SA-4.0)"
SRC_EN_OBS = "en:Wiktextract-obs(CC-BY-SA-4.0)"
SRC_EN_CURATED = "en:curated(this repo)"
SRC_FREQ = "f:OpenSubtitles-2018+Tatoeba(CC-BY-SA-4.0/CC-BY-2.0)"
SRC_FREQ_SURFACE = "f:OpenSubtitles-2018-surface(CC-BY-SA-4.0)"

# Headwords are single Latin-script words (hyphens, apostrophes and the one
# space in "Schwarzes Brett" allowed).  The class has to reach past the German
# alphabet: loanwords the Goethe lists and the course teach keep their accents
# ("Café", "Büro" is fine but "Café" is not spellable with A-Za-zÄÖÜäöüß).
LATIN = "A-Za-zÀ-ÖØ-öø-ÿ"
SHAPE_RE = re.compile(f"^[{LATIN}][{LATIN}\\-' ]*$")


# ---------------------------------------------------------------------------
# 0. source fetching
# ---------------------------------------------------------------------------

def _sh(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def fetch(url: str, dest: Path, min_size: int = 1024) -> Path:
    if dest.exists() and dest.stat().st_size >= min_size:
        return dest
    print(f"  downloading {url} -> {dest}")
    _sh(["curl", "-sL", "--retry", "5", "-C", "-", "-o", str(dest), url])
    return dest


def fetch_sources() -> dict[str, Path]:
    print("[0/6] fetching sources ...")
    paths = {
        "kaikki": fetch(KAIKKI_URL, WORK / "kaikki-de.jsonl", 900_000_000),
        "freq": fetch(FREQ_URL, WORK / "de_full.txt", 10_000_000),
    }
    hz = fetch(HANDEDICT_URL, WORK / "handedict.zip", 10_000_000)
    hdd = WORK / "HanDeDict-master" / "handedict.u8"
    if not hdd.exists():
        _sh(["unzip", "-o", "-q", str(hz), "-d", str(WORK)])
    paths["handedict"] = hdd

    ez = fetch(ECDICT_URL, WORK / "ecdict-sqlite.zip", 100_000_000)
    ecd = WORK / "stardict.db"
    if not ecd.exists():
        _sh(["unzip", "-o", "-q", str(ez), "-d", str(WORK)])
    paths["ecdict"] = ecd

    tz = fetch(TATOEBA_URL, WORK / "deu_sentences.tsv.bz2", 5_000_000)
    tat = WORK / "deu_sentences.tsv"
    if not tat.exists():
        _sh(["bunzip2", "-kf", str(tz)])
    paths["tatoeba"] = tat

    for lvl, url in GOETHE_URLS.items():
        paths[f"goethe_{lvl}"] = fetch(url, WORK / f"goethe_{lvl}.pdf", 100_000)
    return paths


# ---------------------------------------------------------------------------
# 1. Wiktextract lexicon
# ---------------------------------------------------------------------------

POS_MAP = {
    "noun": "noun", "verb": "verb", "adj": "adjective", "adv": "adverb",
    "pron": "pronoun", "prep": "preposition", "conj": "conjunction",
    "num": "numeral", "intj": "interjection", "det": "determiner",
    "article": "article", "particle": "particle", "phrase": "phrase",
    "prep_phrase": "phrase", "proverb": "phrase", "postp": "preposition",
    # proper nouns are kept but only ever emitted for words a teaching source
    # already lists, otherwise every first name on Wiktionary would qualify
    "name": "noun",
}
# Notes abbreviation shown in the quiz hint, kept close to the pgh.csv style.
POS_ABBR = {
    "noun": "S", "verb": "V", "adjective": "Adj", "adverb": "Adv",
    "pronoun": "Pron", "preposition": "Präp", "conjunction": "Konj",
    "numeral": "Num", "interjection": "Interj", "determiner": "Det",
    "article": "Art", "particle": "Part", "phrase": "Wendung",
}
GENDER_TAG = {"masculine": "m", "feminine": "f", "neuter": "n"}
GENDER_ARTICLE = {"m": "der", "f": "die", "n": "das"}

DEAD_SENSE_RE = re.compile(
    r"^\s*(alternative|obsolete|archaic|superseded|dated|nonstandard|eye"
    r"|pronunciation|common\s+misspelling|misspelling|abbreviation|initialism"
    r"|acronym|clipping|ellipsis|short\s+for|contraction|synonym\s+of"
    r"|apocopic|rare\s+form|informal\s+form|colloquial\s+form|romanization"
    r"|feminine\s+(singular\s+)?of|masculine\s+of|diminutive\s+of"
    r"|inflection\s+of|indefinite\s+of|definite\s+of)\b", re.I)
INFLECTION_GLOSS_RE = re.compile(
    r"\b(?:inflection|genitive|dative|accusative|nominative|plural|singular"
    r"|first-person|second-person|third-person|past\s+participle|imperative"
    r"|subjunctive|preterite|comparative\s+degree|superlative\s+degree"
    r"|comparative|superlative|present\s+participle)\b[^.]{0,60}\bof\b\s+\S", re.I)
DEAD_TAGS = {"obsolete", "archaic", "form-of", "alt-of", "inflection-of",
             "misspelling", "romanization", "no-gloss", "abbreviation"}
# Strip the "(chiefly Austria, colloquial)" style register prefix Wiktextract
# already splits out into raw_glosses; we only clean leftovers in `glosses`.
PAREN_TAIL_RE = re.compile(r"\s*\([^()]{0,80}\)\s*$")


DERIVED_TAIL_RE = re.compile(r"^[^;:]{0,60}\bof\b[^;:]{0,60}[;:]\s*(.+)$")
DERIVED_REJECT_RE = re.compile(
    r"^(strong|weak|mixed|definite|indefinite|nominative|genitive|dative"
    r"|accusative|singular|plural|first|second|third|imperative|subjunctive"
    r"|preterite|superlative|comparative)\b", re.I)


def derived_gloss(text: str) -> str | None:
    """Rescue the real meaning out of a derivational "X of Y" sense.

    Wiktextract files "Gewinner" as *agent noun of gewinnen; winner* and
    "Verkehr" as *verbal noun of verkehren; correspondence, traffic (...)*.
    Both are form-of senses, but both are also ordinary German lemmas that a
    learner needs — unlike "nominative/accusative plural of Leut", which has
    no such tail and stays filtered out.
    """
    m = DERIVED_TAIL_RE.match(text)
    if not m:
        return None
    tail = m.group(1).strip()
    if len(tail) < 3 or DERIVED_REJECT_RE.match(tail):
        return None
    return tail


def balance_parens(g: str) -> str:
    """Drop a parenthetical that lost its other bracket to truncation.

    Splitting "two (numerical value represented by the Arabic numeral 2; ...)"
    at the semicolon leaves an open bracket dangling, so the gloss the learner
    sees ends mid-sentence.  Cutting back to the bracket gives plain "two".
    """
    depth = 0
    open_at = -1
    for i, ch in enumerate(g):
        if ch == "(":
            if depth == 0:
                open_at = i
            depth += 1
        elif ch == ")":
            if depth == 0:
                return g[:i]
            depth -= 1
    return g[:open_at] if depth > 0 and open_at >= 0 else g


def clean_gloss(g: str) -> str:
    g = re.sub(r"\[[^\]]*\]", " ", g)          # "[with an (+ dative)]"
    g = re.sub(r"[•·∙‣]{2,}", " ", g)          # "or this many dots: •••••••••"
    g = re.sub(r"(.)\1{3,}", r"\1", g)         # any char run of 4+ -> degeneration
    g = re.sub(r"\s+", " ", g).strip(" ;:,.")
    # "to go, to walk" -> keep; "to be going; to be all right" -> first clause
    if len(g) > 90:
        head = re.split(r"\s*[;:]\s*", g)[0]
        if 3 <= len(head) <= 90:
            g = head
    # a long trailing gloss-of-a-gloss parenthetical adds noise, not meaning
    if len(g) > 60:
        g = re.sub(r"\s*\([^()]{25,}\)\s*$", "", g)
    if len(g) > 120:
        g = g[:120].rsplit(" ", 1)[0]
    return balance_parens(g).strip(" ;:,.“”\"'")


DERIV_KIND_RE = re.compile(
    r"^(agent noun|gerund|verbal noun|action noun|nominali[sz]ation"
    r"|substantive|deverbal noun|infinitive)\s+of\s+"
    r"([A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß-]*)", re.I)

# Wiktionary files thousands of family names and place names under a gloss that
# says nothing a learner can use.  These are not glosses; strip them.
PROPER_JUNK_RE = re.compile(
    r"^(?:an?\s+)?(?:topographic|patronymic|habitational|occupational|German"
    r"|Jewish|Ashkenazi|Low\s+German|rare|common)?[\s-]*"
    r"(?:sur\s?name|family\s+name|given\s+name|nickname|male\s+given|female\s+given"
    r"|any\s+of\s+a\s+great\s+number\s+of\s+(?:locations|places))\b", re.I)


def resolve_derived_glosses(lex: dict[str, list[dict]]) -> int:
    """Make "agent noun of senden" readable.

    Wiktionary glosses a whole class of ordinary nouns only by naming the verb
    they derive from.  Where the sense carries the meaning in a tail
    ("agent noun of zuschauen; audience") take the tail; otherwise splice in
    what the base word means, so "der Sender" reads
    "agent noun of senden (to send)" instead of a bare cross-reference.
    """
    plain: dict[str, str] = {}
    for w, recs in lex.items():
        for r in recs:
            for g in r.get("g") or []:
                if not DERIV_KIND_RE.match(g):
                    plain.setdefault(w, g)
                    break
    n = 0
    for recs in lex.values():
        for r in recs:
            gl = r.get("g") or []
            for i, g in enumerate(gl):
                m = DERIV_KIND_RE.match(g)
                if not m:
                    continue
                tail = derived_gloss(g)
                if tail:
                    gl[i] = clean_gloss(tail)
                    n += 1
                    continue
                base = plain.get(m.group(2))
                if base:
                    gl[i] = clean_gloss(
                        f"{m.group(1).lower()} of {m.group(2)} ({base})")
                    n += 1
    return n


def extract_lexicon(kaikki: Path, out: Path, formmap_out: Path) -> None:
    """Stream the 1 GB Wiktextract dump into a compact per-(word,pos) record."""
    if out.exists() and formmap_out.exists():
        print(f"[1/6] lexicon cache hit ({out})")
        return
    print("[1/6] extracting Wiktextract lexicon (this reads ~1 GB) ...")
    n_in = n_out = 0
    formmap: dict[str, set] = defaultdict(set)
    with kaikki.open(encoding="utf-8") as f, out.open("w", encoding="utf-8") as w:
        for line in f:
            n_in += 1
            if '"lang_code": "de"' not in line:
                continue
            try:
                d = json.loads(line)
            except Exception:
                continue
            if d.get("lang_code") != "de":
                continue
            word = (d.get("word") or "").strip()
            raw_pos = d.get("pos") or ""
            pos = POS_MAP.get(raw_pos)
            if not word or not pos:
                continue

            glosses: list[str] = []
            weak: list[str] = []
            genders: set[str] = set()
            is_form = False
            pltantum = False
            for s in d.get("senses") or []:
                tags = set(s.get("tags") or [])
                for t in tags & set(GENDER_TAG):
                    genders.add(GENDER_TAG[t])
                if "plural-only" in tags:
                    pltantum = True
                gl = s.get("glosses") or []
                text = gl[0] if gl else ""
                # An ordinary sense whose only disqualifier is an obsolete/
                # archaic tag is parked, not thrown away: Wiktextract folds the
                # two head templates of "Bach" together, so its one live sense
                # ("brook, stream") inherits the obsolete tag of the feminine
                # variant.  Such glosses are used only if nothing else survives.
                if (tags & {"obsolete", "archaic"} and text
                        and not (s.get("form_of") or s.get("alt_of"))
                        and not (tags & (DEAD_TAGS - {"obsolete", "archaic"}))
                        and not DEAD_SENSE_RE.match(text)
                        and not INFLECTION_GLOSS_RE.search(text)):
                    wg = clean_gloss(text)
                    if wg and wg not in weak:
                        weak.append(wg)
                    continue
                if s.get("form_of") or s.get("alt_of") or (tags & DEAD_TAGS):
                    tail = (None if (tags & {"inflection-of"}
                                     or INFLECTION_GLOSS_RE.search(text))
                            else derived_gloss(text))
                    if tail:
                        g = clean_gloss(tail)
                        if g and g not in glosses:
                            glosses.append(g)
                        continue
                    if s.get("form_of"):
                        for fo in s["form_of"]:
                            tgt = (fo or {}).get("word")
                            if tgt:
                                formmap[word].add(tgt)
                    is_form = True
                    continue
                if not text or DEAD_SENSE_RE.match(text):
                    is_form = True
                    m = re.search(r"\bof\s+([A-Za-zÄÖÜäöüß][\wÄÖÜäöüß-]*)", text or "")
                    if m:
                        formmap[word].add(m.group(1))
                    continue
                if INFLECTION_GLOSS_RE.search(text):
                    is_form = True
                    m = re.search(r"\bof\s+([A-Za-zÄÖÜäöüß][\wÄÖÜäöüß-]*)", text)
                    if m:
                        formmap[word].add(m.group(1))
                    continue
                g = clean_gloss(text)
                if g and g not in glosses:
                    glosses.append(g)

            rec = {"w": word, "p": pos}
            plural = None
            vparts: dict[str, str] = {}
            for fm in d.get("forms") or []:
                ftags = set(fm.get("tags") or [])
                form = (fm.get("form") or "").strip()
                if not form or form in ("-", "no-table-tags") or "inflection-template" in ftags:
                    continue
                if fm.get("source") in ("declension", "conjugation"):
                    continue
                if pos == "noun" and "plural" in ftags and not (ftags & {"diminutive", "genitive"}):
                    if plural is None:
                        plural = form
                if pos == "verb":
                    if {"third-person", "singular", "present"} <= ftags:
                        vparts.setdefault("p3", form)
                    elif "past" in ftags and "participle" in ftags:
                        vparts.setdefault("pp", form)
                    elif "past" in ftags and "participle" not in ftags:
                        vparts.setdefault("pt", form)
                    elif "auxiliary" in ftags:
                        vparts.setdefault("aux", form)
            # gender also lives in the de-noun head template expansion, and the
            # templates are printed in the order a dictionary would list them,
            # so they also decide which gender leads for a two-gender noun
            # ("Bach m or f" -> der Bach).
            head_genders: list[str] = []
            if pos == "noun":
                for ht in d.get("head_templates") or []:
                    exp = ht.get("expansion") or ""
                    m = re.match(r"^\S+\s+(m|f|n)\b", exp)
                    if m and m.group(1) not in head_genders:
                        head_genders.append(m.group(1))
                    a1 = (ht.get("args") or {}).get("1") or ""
                    for tok in re.split(r"[,;:]", a1):
                        if tok.strip() in ("m", "f", "n") and tok.strip() not in head_genders:
                            head_genders.append(tok.strip())
            ordered_genders = ([g for g in head_genders if g in genders or not genders]
                               + [g for g in sorted(genders) if g not in head_genders])

            if not glosses and weak:
                glosses = weak
                rec["obs"] = True
            if glosses:
                rec["g"] = glosses[:4]
            if ordered_genders:
                rec["gen"] = ordered_genders
            if plural:
                rec["pl"] = plural
            if vparts:
                rec["v"] = vparts
            if pltantum:
                rec["pltantum"] = True
            if raw_pos == "name":
                rec["prop"] = True
            rec["lemma"] = bool(glosses)
            rec["form"] = is_form
            w.write(json.dumps(rec, ensure_ascii=False) + "\n")
            n_out += 1
    formmap_out.write_text(
        json.dumps({k: sorted(v) for k, v in formmap.items()}, ensure_ascii=False),
        encoding="utf-8")
    print(f"       read {n_in} lines, kept {n_out} German (word,pos) records, "
          f"{len(formmap)} inflected surface forms mapped to a lemma")


def load_lexicon(path: Path) -> dict[str, list[dict]]:
    lex: dict[str, list[dict]] = defaultdict(list)
    with path.open(encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            lex[r["w"]].append(r)
    return lex


# ---------------------------------------------------------------------------
# 2. corpus frequency (lemma-aggregated)
# ---------------------------------------------------------------------------

CLOSED_CLASS = {"pronoun", "preposition", "conjunction", "particle", "article",
                "determiner", "interjection", "adverb", "numeral"}
TOKEN_RE = re.compile(r"[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß'’-]*")
SENT_START_RE = re.compile(r"[.!?…:;„“\"»«()\[\]–—-]\s*$")


def build_case_model(tatoeba: Path, out: Path) -> dict[str, dict[str, int]]:
    """lower-case token -> {actual cased spelling: count} from real German text.

    The OpenSubtitles frequency list is lower-cased, which erases the single
    most useful signal German has: nouns are capitalised.  Tatoeba's German
    sentences (CC-BY 2.0 FR) are properly cased, so they can tell us that
    "sage" is ~97% the verb form and only ~3% "die Sage".  Sentence-initial
    tokens are skipped, otherwise every sentence starting with "Ich" would be
    counted as evidence for the noun *das Ich*.
    """
    if out.exists():
        print(f"[2a/6] case model cache hit ({out})")
        return json.loads(out.read_text(encoding="utf-8"))
    print("[2a/6] learning a capitalisation model from cased Tatoeba text ...")
    case: dict[str, Counter] = defaultdict(Counter)
    n_sent = n_tok = 0
    with tatoeba.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            cols = line.rstrip("\n").split("\t")
            if len(cols) < 3:
                continue
            text = cols[2]
            n_sent += 1
            for m in TOKEN_RE.finditer(text):
                # skip the first word of every sentence / clause after . ! ? "
                if SENT_START_RE.search(text[:m.start()]) or m.start() == 0:
                    continue
                w = m.group(0)
                case[w.lower()][w] += 1
                n_tok += 1
    result = {k: dict(v) for k, v in case.items()}
    out.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    print(f"       {n_sent} sentences, {n_tok} non-initial tokens, "
          f"{len(result)} distinct lower-cased types")
    return result


def build_frequency(freq_file: Path, formmap: dict[str, list[str]],
                    known_lemmas: set[str], pos_of: dict[str, str],
                    case_model: dict[str, dict[str, int]],
                    out: Path) -> dict[str, int]:
    """Turn a lower-cased corpus list into per-lemma counts, in two steps.

    step 1  un-lower-case.  Each corpus token's count is split over the cased
            spellings that actually occur in German text (Tatoeba), restricted
            to spellings the lexicon knows.  "ich" 5.9M stays with the pronoun
            instead of handing half of it to the noun *das Ich*.
    step 2  attach each cased surface form to a lemma.  A surface can still be
            ambiguous ("weiß" = the adjective, or a form of *wissen*), so:
              pass 1  surfaces with exactly one candidate lemma are unambiguous
                      evidence -> U(lemma)
              pass 2  an ambiguous surface is split in proportion to U(lemma),
                      except that an indeclinable closed-class word spelled
                      exactly like the surface gets half the mass up front.
                      Without that floor "mal" (particle, no other forms, so
                      U = 0) would lose its 145k occurrences to *malen*.
    """
    if out.exists():
        print(f"[2b/6] frequency cache hit ({out})")
        return json.loads(out.read_text(encoding="utf-8"))
    print("[2b/6] aggregating OpenSubtitles frequencies onto lemmas ...")

    # cased surface -> [(lemma, is_identity)]
    cands: dict[str, list[tuple[str, bool]]] = defaultdict(list)
    for lemma in known_lemmas:
        cands[lemma].append((lemma, True))
    for surface, lemmas in formmap.items():
        for l in lemmas:
            if l in known_lemmas and not any(x[0] == l for x in cands[surface]):
                cands[surface].append((l, False))
    by_lower: dict[str, list[str]] = defaultdict(list)
    for surface in cands:
        by_lower[surface.lower()].append(surface)

    # ---- step 1: distribute each lower-cased corpus count over cased spellings
    smass: Counter = Counter()
    n_tok = 0
    with freq_file.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            parts = line.split()
            if len(parts) != 2 or not parts[1].isdigit():
                continue
            tok, n = parts[0], int(parts[1])
            forms = by_lower.get(tok)
            if not forms:
                continue
            n_tok += 1
            if len(forms) == 1:
                smass[forms[0]] += n
                continue
            obs = case_model.get(tok) or {}
            weights = [obs.get(s, 0) for s in forms]
            if sum(weights) < 3:
                weights = [1] * len(forms)      # no evidence: split evenly
            total = sum(weights)
            for s, w in zip(forms, weights):
                if w:
                    smass[s] += n * w / total

    # ---- step 2: attach cased surfaces to lemmas
    unambiguous: Counter = Counter()
    for surface, mass in smass.items():
        c = cands.get(surface) or []
        if len(c) == 1:
            unambiguous[c[0][0]] += mass

    freq: Counter = Counter()
    for surface, mass in smass.items():
        c = cands.get(surface) or []
        if not c:
            continue
        if len(c) == 1:
            freq[c[0][0]] += mass
            continue
        weights = []
        for lemma, identity in c:
            w = unambiguous.get(lemma, 0.0) + 1.0
            if identity and pos_of.get(lemma) in CLOSED_CLASS:
                w += 0.5 * mass
            weights.append(w)
        total = sum(weights)
        for (lemma, _), w in zip(c, weights):
            freq[lemma] += mass * w / total

    result = {k: int(round(v)) for k, v in freq.items() if v >= 1}
    out.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    print(f"       {len(result)} lemmas received a real corpus count "
          f"({n_tok} corpus token types consumed)")
    return result


def load_raw_counts(freq_file: Path, words: set[str]) -> dict[str, int]:
    """Plain corpus count of a word's own spelling, ignoring lemmatisation.

    Used only as a fallback: "früher" is a lemma of its own (*formerly*) but
    also the comparative of "früh", so lemma attribution hands its entire
    count to "früh" and leaves it with nothing.  Its own 30k occurrences in
    the corpus are still a real, citable corpus frequency.
    """
    want = {w.lower() for w in words}
    got: dict[str, int] = {}
    with freq_file.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            parts = line.split()
            if len(parts) == 2 and parts[1].isdigit() and parts[0] in want:
                got[parts[0]] = int(parts[1])
    return got


# ---------------------------------------------------------------------------
# 3. Goethe CEFR word lists
# ---------------------------------------------------------------------------

GOETHE_NOISE_RE = re.compile(r"[.!?…„“\"»«]|^\d|^[A-Z]{3,}$")
GOETHE_LEMMA_RE = re.compile(r"^[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß\-]*$")


def _goethe_cells(pdf_path: Path, bands: list[tuple[int, int]]) -> list[str]:
    import pdfplumber
    cells: list[str] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            words = page.extract_words()
            words.sort(key=lambda w: (round(w["top"]), w["x0"]))
            page_cells: list[str] = []
            for _, grp in itertools.groupby(words, key=lambda w: round(w["top"])):
                grp = list(grp)
                run = [grp[0]]
                runs = []
                for a, b in zip(grp, grp[1:]):
                    if b["x0"] - a["x1"] > 12:
                        runs.append(run)
                        run = [b]
                    else:
                        run.append(b)
                runs.append(run)
                for r in runs:
                    x0 = r[0]["x0"]
                    if any(lo <= x0 < hi for lo, hi in bands):
                        page_cells.append(" ".join(w["text"] for w in r))
            cells.extend(page_cells)
    return cells


def parse_goethe(paths: dict[str, Path], out: Path) -> dict[str, dict]:
    """-> {lemma: {'level': 'A1', 'gender': 'm'|None, 'plural': str|None}}"""
    if out.exists():
        print(f"[3/6] Goethe cache hit ({out})")
        return json.loads(out.read_text(encoding="utf-8"))
    print("[3/6] parsing the Goethe-Institut A1/A2/B1 Wortlisten ...")
    result: dict[str, dict] = {}
    for level in ("B1", "A2", "A1"):        # weaker level wins on collision
        cells = _goethe_cells(paths[f"goethe_{level}"], GOETHE_HEADWORD_BANDS[level])
        got = 0
        for cell in cells:
            for lemma, gender, plural in _goethe_entry(cell):
                rec = result.setdefault(lemma, {})
                rec["level"] = level
                if gender and not rec.get("gender"):
                    rec["gender"] = gender
                if plural and not rec.get("plural"):
                    rec["plural"] = plural
                got += 1
        print(f"       {level}: {len(cells)} headword cells -> {got} lemma hits")
    out.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    print(f"       {len(result)} distinct Goethe lemmas")
    return result


def _goethe_entry(cell: str):
    """Yield (lemma, gender, plural) from one headword cell."""
    cell = cell.strip()
    if not cell or GOETHE_NOISE_RE.search(cell) or len(cell.split()) > 5:
        return
    cell = re.sub(r"\s*\(.*?\)\s*", " ", cell).strip()
    cell = cell.replace("¨-", "-").replace("⸚", "-")
    m = re.match(r"^(der|die|das)\s+([A-ZÄÖÜ][A-Za-zÄÖÜäöüß\-]*)\s*,?\s*(\S*)", cell)
    if m:
        gender = {"der": "m", "die": "f", "das": "n"}[m.group(1)]
        lemma = m.group(2)
        plural = m.group(3) if m.group(3).startswith("-") else ""
        if GOETHE_LEMMA_RE.match(lemma):
            yield lemma, gender, plural or None
        return
    head = re.split(r"\s*,\s*", cell)[0]
    head = re.sub(r"^sich\s+", "", head).strip()
    head = head.rstrip("-")
    if GOETHE_LEMMA_RE.match(head) and len(head) >= 2:
        yield head, None, None


# ---------------------------------------------------------------------------
# 4. HanDeDict (German -> Chinese, inverted)
# ---------------------------------------------------------------------------

HDD_LINE_RE = re.compile(r"^\S+\s+(\S+)\s+\[[^\]]*\]\s+/(.+)/\s*$")
HDD_PROPER = {"Eig", "Geo", "Pers", "Vorn", "Fam", "Org", "Pol", "Hist",
              "Film", "Marke", "Mythol", "Rel", "Lit", "Mus"}
PURE_CJK_RE = re.compile(r"[㐀-鿿]+$")
GERMAN_PHRASE_RE = re.compile(r"^(?:sich\s+)?[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß\-]*$")


def parse_handedict(path: Path, out: Path) -> dict[str, list[str]]:
    if out.exists():
        print(f"[4/6] HanDeDict cache hit ({out})")
        return json.loads(out.read_text(encoding="utf-8"))
    print("[4/6] inverting HanDeDict into a German->Chinese map ...")
    de2zh: dict[str, list[str]] = defaultdict(list)
    with path.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            if line.startswith("#"):
                continue
            m = HDD_LINE_RE.match(line.rstrip("\n"))
            if not m:
                continue
            simp = m.group(1)
            if not PURE_CJK_RE.fullmatch(simp) or len(simp) > 8:
                continue
            for sense in m.group(2).split("/"):
                sense = sense.split("Bsp.:")[0]
                tags = set()
                for tm in re.findall(r"\(([^()]{1,40})\)", sense):
                    for t in re.split(r"[,，]", tm):
                        tags.add(t.strip())
                if tags & HDD_PROPER:
                    continue
                sense = re.sub(r"\([^()]*\)", " ", sense)
                for alt in re.split(r"[;；]", sense):
                    alt = alt.strip().strip(",. ")
                    alt = re.sub(r"^(?:der|die|das|ein|eine|einen|einem)\s+", "", alt)
                    if not GERMAN_PHRASE_RE.match(alt) or len(alt) < 2:
                        continue
                    lst = de2zh[alt]
                    if simp not in lst and len(lst) < 6:
                        lst.append(simp)
    out.write_text(json.dumps(de2zh, ensure_ascii=False), encoding="utf-8")
    print(f"       {len(de2zh)} German headwords carry a Chinese gloss")
    return de2zh


# ---------------------------------------------------------------------------
# 5. ECDICT English -> Chinese pivot
# ---------------------------------------------------------------------------

ZH_RE = re.compile(r"[㐀-鿿]")
EC_INFLECTION_RE = re.compile(
    r"的(?:过去式|过去分词|现在分词|第三人称|复数|比较级|最高级|变体|缩写|异体)")
EC_POS_PREFIX = {
    "noun": ("n.", "n ", "[医]", "[计]"),
    "verb": ("vt.", "vi.", "v.", "vt", "vi"),
    "adjective": ("a.", "adj.", "a "),
    "adverb": ("ad.", "adv."),
}


class EcdictPivot:
    def __init__(self, db: Path):
        self.conn = sqlite3.connect(str(db))
        self.cache: dict[str, str] = {}

    def _raw(self, word: str) -> str | None:
        if word in self.cache:
            return self.cache[word] or None
        row = self.conn.execute(
            "SELECT translation FROM stardict WHERE word = ? COLLATE NOCASE",
            (word,)).fetchone()
        val = (row[0] if row and row[0] else "") or ""
        self.cache[word] = val
        return val or None

    def lookup(self, gloss: str, pos: str) -> str | None:
        """Pivot one English gloss to Chinese. Precision over recall.

        Only whole-gloss lookups are attempted (plus the obvious "to X" / "a X"
        strippings and the comma-separated synonyms Wiktionary writes in one
        gloss).  Pivoting on a *part* of a phrase would happily turn "postal
        checking account" into 账户, which is exactly the kind of plausible-
        looking junk this dataset is supposed not to contain.
        """
        g = gloss.strip().strip(".")
        g = re.sub(r"\s*\([^()]*\)", "", g).strip()
        if not g:
            return None
        cands: list[str] = []
        for alt in re.split(r"\s*,\s*|\s+or\s+", g):
            alt = alt.strip()
            if not alt or alt in cands:
                continue
            cands.append(alt)
            if pos == "verb" and alt.lower().startswith("to "):
                cands.append(alt[3:].strip())
            elif pos == "noun":
                m = re.match(r"^(?:a|an|the)\s+(.+)$", alt, re.I)
                if m:
                    cands.append(m.group(1))
        for c in cands:
            if not c or len(c.split()) > 5:
                continue
            raw = self._raw(c)
            if not raw:
                continue
            zh = self._pick(raw, pos)
            if zh:
                return zh
        return None

    @staticmethod
    def _pick(raw: str, pos: str) -> str | None:
        lines = [l.strip() for l in raw.split("\n") if l.strip()]
        # An ECDICT line that only explains an English inflection
        # ("produce的过去式和过去分词") carries no German meaning.
        lines = [l for l in lines if not EC_INFLECTION_RE.search(l)]
        wanted = EC_POS_PREFIX.get(pos)
        chosen = None
        for line in lines:
            if line.startswith("[") and chosen:
                continue
            if wanted and line.lower().startswith(tuple(w.lower() for w in wanted)):
                chosen = line
                break
        if chosen is None:
            chosen = next((l for l in lines if not l.startswith("[")), None)
        if not chosen:
            return None
        body = re.sub(r"^(?:[a-z]{1,4}\.|&|and)\s*", "", chosen)
        body = re.sub(r"^(?:[a-z]{1,4}\.|&|and)\s*", "", body)
        body = re.sub(r"^\[[^\]]*\]\s*", "", body)
        body = re.sub(r"\s+", " ", body).strip(" ,;.")
        if not ZH_RE.search(body):
            return None
        parts = [p.strip() for p in re.split(r"[,，、]", body) if p.strip()]
        parts = [p for p in parts if ZH_RE.search(p)]
        if not parts:
            return None
        return ", ".join(parts[:4])


# ---------------------------------------------------------------------------
# 6. assembly
# ---------------------------------------------------------------------------

MOJIBAKE_RE = re.compile(r"[�]|Ã[\x80-\xbf]|â€|Ã¤|Ã¶|Ã¼|ÃŸ")
PLACEHOLDER_RE = re.compile(r"^(\?+|todo|n/?a|none|null|-+|\(n\)|xxx+)$", re.I)
# Inflected function words that must never occupy the headword position.
STOP_HEADWORDS = {
    "den", "dem", "des", "die", "das", "der", "ein", "eine", "einen", "einem",
    "eines", "einer", "kein", "keine", "keinen", "keinem", "keines", "keiner",
    "diese", "dieser", "dieses", "diesen", "diesem", "jene", "jener", "jenes",
    "jenen", "jenem", "welche", "welcher", "welches", "welchen", "welchem",
    "meine", "meiner", "meines", "meinen", "meinem", "deine", "deiner",
    "deines", "deinen", "deinem", "seine", "seiner", "seines", "seinen",
    "seinem", "ihre", "ihrer", "ihres", "ihren", "ihrem", "unsere", "unserer",
    "unseres", "unseren", "unserem", "eure", "eurer", "eures", "euren",
    "eurem", "mich", "dich", "uns", "euch", "ihm", "ihn", "ihnen", "mir",
    "dir", "wem", "wen", "wessen",
    "bin", "bist", "ist", "sind", "seid", "war", "warst", "waren", "wart",
    "gewesen", "habe", "hast", "hat", "habt", "haben", "hatte", "hattest",
    "hatten", "hattet", "gehabt", "werde", "wirst", "wird", "werdet",
    "wurde", "wurden", "wurdest", "geworden", "kann", "kannst", "könnt",
    "konnte", "konnten", "muss", "musst", "müsst", "musste", "mussten",
    "will", "willst", "wollt", "wollte", "wollten", "soll", "sollst",
    "sollt", "sollte", "sollten", "darf", "darfst", "dürft", "durfte",
    "durften", "mag", "magst", "mögt", "mochte", "mochten",
}
# ... minus the ones that really are lemmas in their own right.
STOP_HEADWORDS -= {"haben", "uns", "euch"}

# Homograph resolution.  German capitalises nouns, so a *capitalised* headword
# is almost always the noun; a *lower-case* headword almost never is.  Within
# the remaining ambiguity, the closed classes win, because "zu"/"in"/"mit" are
# taught as prepositions, not as the marginal adjective senses Wiktionary also
# lists ("zu" = shut, "in" = fashionable).
POS_ORDER = ["preposition", "conjunction", "pronoun", "verb", "noun", "article",
             "determiner", "numeral", "adjective", "adverb", "particle",
             "interjection", "phrase"]

# Words where the generic ordering above picks a defensible but unhelpful
# reading: "sein" is taught as the verb *to be*, not as a possessive; "nur",
# "noch", "so", "da", "wo" are adverbs first and subordinating conjunctions
# only in specific constructions.  Applied only when the lexicon actually has
# a record with that part of speech.
POS_OVERRIDE = {
    "sein": "verb", "wie": "adverb", "noch": "adverb", "nur": "adverb",
    "da": "adverb", "so": "adverb", "wo": "adverb", "also": "adverb",
    "doch": "adverb", "denn": "conjunction", "während": "preposition",
    "wann": "adverb", "wohin": "adverb", "woher": "adverb", "dort": "adverb",
    "los": "adjective", "viel": "determiner", "wenig": "determiner",
}

# The 30 highest-frequency German function words are exactly the ones an
# automatic English->Chinese pivot handles worst (HanDeDict glosses "sich" as
# 亲身 "in person", ECDICT turns "denn" into a conjunction table).  These are
# hand-checked against Duden/Langenscheidt sense 1 and marked `zh:curated` /
# `en:curated` in `source` so they are distinguishable from derived data.
CURATED: dict[str, tuple[str, str]] = {
    # word:            (english,                          chinese)
    "sich":            ("himself, herself, itself, themselves; oneself", "自己, 他自己, 她自己"),
    "zu":              ("to, towards; too (excessively); closed", "到, 向; 太, 过于; 关着的"),
    "in":              ("in, into, inside; at", "在…里, 到…里; 在"),
    "an":              ("at, on, to (vertical surface); onto", "在…旁, 靠近; 到…上"),
    "auf":             ("on, upon, onto; open", "在…上面, 到…上; 打开的"),
    "um":              ("around; at (clock time); in order to", "围绕; 在(几点); 为了"),
    "über":            ("over, above; about, concerning; across", "在…上方; 关于; 越过"),
    "mit":             ("with; by (means of); along too", "和…一起, 用; 随同"),
    "nach":            ("to, towards (a place); after (in time); according to", "往, 向; 在…之后; 按照"),
    "von":             ("from; of; by (agent)", "从, 来自; …的; 被"),
    "aus":             ("out of, from; made of; off", "从…出来; 用…制成; 关闭"),
    "bei":             ("at, near; at the home of; while, during", "在…附近; 在…处; 在…时"),
    "vor":             ("in front of, before; ago", "在…前面; 在…之前; …以前"),
    "unter":           ("under, below; among", "在…下面; 在…之中"),
    "durch":           ("through; by means of", "穿过, 通过; 借助"),
    "gegen":           ("against; towards; around (approximate time)", "反对; 朝向; 大约"),
    "ohne":            ("without", "没有, 不带"),
    "für":             ("for; in favour of", "为了, 对于; 赞成"),
    "seit":            ("since, for (a period up to now)", "自从, …以来"),
    "während":         ("during; while, whereas", "在…期间; 当…的时候"),
    "wegen":           ("because of, due to", "因为, 由于"),
    "zwischen":        ("between, among", "在…之间"),
    "hinter":          ("behind", "在…后面"),
    "neben":           ("next to, beside; besides", "在…旁边; 除…之外"),
    "man":             ("one, you, they, people (impersonal pronoun)", "人们, 有人 (泛指)"),
    "was":             ("what; which; something", "什么; 哪个; 一些东西"),
    "wer":             ("who", "谁"),
    "wo":              ("where", "在哪里, 何处"),
    "wie":             ("how; like, as", "怎样, 如何; 像…一样"),
    "wann":            ("when (at what time)", "什么时候"),
    "warum":           ("why", "为什么"),
    "denn":            ("because, for; then (in questions)", "因为; 究竟, 到底"),
    "doch":            ("but, however; yes it is (contradicting a negative); do (emphatic)", "可是, 然而; (对否定提问的肯定回答) 不, 是的"),
    "mal":             ("times (multiplication); once, just (softening particle)", "乘, 倍; 一下, 一次 (语气词)"),
    "schon":           ("already; yet; surely", "已经; 早就; 想必"),
    "noch":            ("still, yet; another, more", "还, 仍然; 再, 另外"),
    "nur":             ("only, just, merely", "只, 仅仅"),
    "auch":            ("also, too, as well; even", "也, 同样; 甚至"),
    "so":              ("so, thus, like this; such", "这样, 如此; 那么"),
    "sehr":            ("very, very much", "很, 非常"),
    "immer":           ("always, ever; increasingly (with a comparative)", "总是, 始终; 越来越"),
    "nie":             ("never", "从不, 决不"),
    "etwas":           ("something; somewhat, a little", "某物, 某事; 有点, 稍微"),
    "nichts":          ("nothing", "什么也没有, 无"),
    "alles":           ("everything, all", "一切, 全部"),
    "jemand":          ("someone, somebody", "某人, 有人"),
    "niemand":         ("nobody, no one", "没有人"),
    "sein":            ("to be; his, its (possessive)", "是, 存在; 他的"),
    "haben":           ("to have, to own; (auxiliary of the perfect tense)", "有, 拥有; (构成完成时的助动词)"),
    "werden":          ("to become, to get; (auxiliary of the future and the passive)", "变成, 成为; (构成将来时和被动态的助动词)"),
    "ja":              ("yes; indeed, after all (particle)", "是的, 对; (语气词) 的确"),
    "nein":            ("no", "不, 不是"),
    "nicht":           ("not", "不, 没有"),
    "und":             ("and", "和, 与"),
    "oder":            ("or", "或者, 还是"),
    "aber":            ("but, however", "但是, 可是"),
    "wenn":            ("if; when, whenever", "如果; 当…的时候"),
    "als":             ("when (past, once); than; as, in the capacity of", "当…时 (过去); 比; 作为"),
    "dass":            ("that (introducing a subordinate clause)", "(引导从句) 这件事…"),
    "weil":            ("because", "因为"),
    "damit":           ("so that, in order that; with it", "以便, 为了; 用它"),
    "obwohl":          ("although, even though", "虽然, 尽管"),
    "dann":            ("then, after that; in that case", "然后, 接着; 那么"),
    "also":            ("so, therefore, thus; well then", "因此, 所以; 那么"),
    "hier":            ("here", "这里, 在这儿"),
    "dort":            ("there, over there", "那里, 在那儿"),
    "da":              ("there; then; since, because", "那儿; 那时; 因为"),
    "jetzt":           ("now, right now", "现在, 此刻"),
    "heute":           ("today", "今天"),
    "morgen":          ("tomorrow; in the morning", "明天; 早上"),
    "gestern":         ("yesterday", "昨天"),
    "wieder":          ("again, once more", "又, 再一次"),
    "vielleicht":      ("perhaps, maybe", "也许, 可能"),
    "gut":             ("good; well", "好的; 好地"),
    "viel":            ("much, a lot of, many", "很多, 大量"),
    "wenig":           ("little, few, not much", "少, 不多"),
    "mehr":            ("more", "更多"),
    "ganz":            ("whole, entire; quite, completely", "整个的; 完全, 相当"),
    "sehen":           ("to see, to look", "看, 看见"),
    "gehen":           ("to go, to walk", "走, 去"),
    "kommen":          ("to come, to arrive", "来, 到达"),
    "machen":          ("to do, to make", "做, 制造"),
    "sagen":           ("to say, to tell", "说, 讲"),
    "wissen":          ("to know (a fact)", "知道, 了解"),
    "können":          ("can, to be able to; to know how to", "能, 会; 可以"),
    "müssen":          ("must, to have to", "必须, 不得不"),
    "wollen":          ("to want, to intend to", "想要, 打算"),
    "sollen":          ("shall, ought to, to be supposed to", "应该, 应当"),
    "dürfen":          ("may, to be allowed to", "可以, 被允许"),
    "mögen":           ("to like; may (possibility)", "喜欢; 可能"),
    "lassen":          ("to let, to allow; to leave (something somewhere)", "让, 允许; 留下"),
}

# Nouns the course teaches that the open lexicon cannot serve on its own.
# Deliberately tiny and hand-checked; every one is a documented Wiktextract gap:
#   Lebensstandard    the only sense is mis-parsed as alt-of "living", so the
#                     entry carries no lemma sense at all
#   Lebensgeschichte  no German entry in the dump
#   Medien            only the grammatical sense ("the mediae consonants b/d/g")
#                     is a lemma; the everyday plurale-tantum sense is filed as
#                     "plural of Medium"
# Chinese still comes from HanDeDict via the ordinary source chain.
CURATED_NOUNS: dict[str, dict] = {
    "Lebensstandard":   {"english": "standard of living",
                         "gender": "m", "plural": "Lebensstandards"},
    "Lebensgeschichte": {"english": "life story; biography",
                         "gender": "f", "plural": "Lebensgeschichten"},
    "Medien":           {"english": "the media; mass media", "pltantum": True},
}

# Wiktionary lists a noun sense for almost every function word ("das Ich",
# "das Aber", "das Haben").  They are real German, but as vocabulary items at
# rank 3 they are noise, and the corpus can never separate them cleanly from
# the function word they nominalise, so they are dropped unless a real teaching
# source (pgh.csv or a Goethe word list) actually lists them.
NOMINALISED_BASE_POS = CLOSED_CLASS | {"verb"}

SEPARABLE_PREFIXES = (
    "ab", "an", "auf", "aus", "bei", "durch", "ein", "empor", "entgegen",
    "entlang", "fest", "fort", "gegenüber", "her", "herab", "heran", "herauf",
    "heraus", "herein", "herum", "herunter", "hervor", "hin", "hinab", "hinauf",
    "hinaus", "hinein", "hinter", "hinunter", "hinzu", "los", "mit", "nach",
    "nieder", "vor", "voran", "vorbei", "vorüber", "weg", "weiter", "wieder",
    "zu", "zurecht", "zurück", "zusammen",
)


# ---------------------------------------------------------------------------
# 5a. pgh.csv parsing (in-repo German->Chinese glossary)
#
# pgh.csv lines are "headword \"POS gloss\"", but ~51 lines lack the quote
# delimiter and several glosses carry split-mangled brackets, "N)" sense
# markers or dead "见 X" cross-references; the helpers below repair those.
# ---------------------------------------------------------------------------

# POS / register tokens that may prefix a body (or, for quote-less lines, may be
# glued to the gloss right after the headword). Multi-char, capitalised tokens
# only — single letters like n/m/f are NOT used for body-start detection because
# they occur inside German words (e.g. the final n of "übernachten").
POS_TOKENS = [
    "Vt/Vi", "Vt", "Vi", "Vr", "Vimp",
    "Adj", "Adv", "Präp", "Konj", "Pron", "Art", "Num", "Interj", "Pl",
]
# Single-letter gender/POS markers, only recognised as a standalone token.
SHORT_POS = ["n", "m", "f"]
# Tokens (with their optional trailing ",.") that we will fold off the head into
# the body when they got glued onto the head's last token.
ALL_POS = POS_TOKENS + SHORT_POS
# Detect where the gloss begins on a quote-less line: a POS token that starts at
# a token boundary (preceded by whitespace/start), or the first Chinese char.
_POS_ALT = "|".join(re.escape(t) for t in POS_TOKENS)
BODY_START_RE = re.compile(
    r"(?:(?<=\s)|^)(?:" + _POS_ALT + r")|[一-鿿]"
)


def normalize_headword(text: str) -> str:
    text = text.replace("/", "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_meaning(text: str) -> str:
    text = text.replace("，", ", ")
    text = re.sub(r"\s+", " ", text).strip(" \t\"'")
    return text


# Bracket pairs used when repairing split-mangled glosses. Includes ASCII and
# full-width parens/brackets.
_OPENERS = "([（【［"
_CLOSERS = ")]）】］"
_CLOSE_TO_OPEN = {")": "(", "]": "[", "）": "（", "】": "【", "］": "［"}


def balance_brackets(text: str) -> str:
    """Drop unmatched brackets left by a bad notes/meaning split.

    Two passes: drop unmatched CLOSERS (left to right), then drop the opener
    characters that are still unmatched at the end. We drop only the stray
    bracket char itself, never the surrounding gloss text — so a source typo
    like a missing "(" before "作完成时助动词" keeps the real Chinese sense.
    """
    out: list[str] = []
    stack: list[tuple[str, int]] = []  # (opener char, index in `out`)
    for ch in text:
        if ch in _OPENERS:
            stack.append((ch, len(out)))
            out.append(ch)
        elif ch in _CLOSERS:
            if stack and stack[-1][0] == _CLOSE_TO_OPEN[ch]:
                stack.pop()
                out.append(ch)
            # else: unmatched closer — drop it
        else:
            out.append(ch)
    drop = {pos for _, pos in stack}  # unmatched openers
    return "".join(c for i, c in enumerate(out) if i not in drop)


# A cross-reference gloss that only says "see <other-headword>". When that
# target headword is not itself in the dataset (true for "der"), the bare
# reference is a dead end for the learner; we substitute a real gloss.
_CROSSREF_RE = re.compile(r"^[(（]?\s*见\s*([A-Za-zÄÖÜäöüß]+)\s*[)）]?\s*$")
_ARTICLE_GLOSS = {
    "die": "定冠词 (阴性/复数); 见 der",
    "das": "定冠词 (中性); 见 der",
    "der": "定冠词 (阳性); 指示/关系代词",
}


def cleanup_meaning(german: str, meaning: str) -> str:
    """Repair residual source-CSV blemishes in a Chinese gloss.

    - balance stray brackets left by the notes/meaning split
    - rescue dead "see <headword>" cross-references (e.g. die/das -> der)
    - strip dangling leading/trailing sense markers and stray punctuation
    """
    # Normalize "N)" sense markers (a Chinese-dict convention, e.g.
    # "1)圆盘 2)薄片") to "N." BEFORE balancing, so the marker is not mangled
    # into an orphan digit when its unmatched ")" is dropped.
    s = re.sub(r"(?<![\d(（])(\d)[)）](?=\s*[一-鿿])", r"\1.", meaning)
    s = balance_brackets(s)
    # Drop a trailing dangling sense number left after an unmatched opener was
    # removed (e.g. "...; 3." or trailing " 2.").
    s = re.sub(r"[;；]\s*\d+\.\s*$", "", s)
    s = re.sub(r"\s+\d+\.\s*$", "", s)
    # A leading orphan sense number left after a dropped "(" (e.g. "2粪，屎").
    s = re.sub(r"^\s*\d+\s*(?=[一-鿿])", "", s)
    s = re.sub(r"\s+", " ", s).strip(" ,，;；、/")
    # Rescue a pure "见 X" cross-reference to a missing headword.
    m = _CROSSREF_RE.match(s)
    if m and m.group(1).lower() not in _PRESENT_HEADWORDS:
        return _ARTICLE_GLOSS.get(german.lower(), f"见 {m.group(1)}")
    # Substitute the canonical article gloss for the definite articles, whose
    # source line is only a mangled cross-reference.
    if german.lower() in _ARTICLE_GLOSS and (not s or "见 der" in s or s.startswith("见")):
        return _ARTICLE_GLOSS[german.lower()]
    return s


# Populated in parse_pgh() once all headwords are known, so cross-reference
# rescue can tell whether a "见 X" target actually exists in the dataset.
_PRESENT_HEADWORDS: set[str] = set()


def split_body(body: str) -> tuple[str, str]:
    """Split a body into (notes, chinese_meaning).

    `notes` is the leading POS / grammatical info (Latin-script) and `chinese`
    is the Chinese gloss starting at the first CJK character. If an opening
    bracket immediately precedes that first CJK char (a Chinese explanatory
    parenthetical like "(目标)向"), the opener is moved into the meaning so the
    parenthesis is not split across the notes/meaning boundary.
    """
    body = body.strip().strip('"').strip()
    match = re.search(r"[一-鿿]", body)
    if not match:
        return "", normalize_meaning(body)

    idx = match.start()
    notes = body[:idx]
    meaning = body[idx:]
    # Pull trailing opener(s) on the notes side into the meaning so the
    # parenthetical that wraps the first Chinese char stays intact.
    om = re.search(r"([(\[（【［]+)\s*$", notes)
    if om:
        meaning = om.group(1) + meaning
        notes = notes[: om.start()]
    notes = notes.strip(" ,;，；")
    return notes, normalize_meaning(meaning)


def split_line(line: str) -> tuple[str, str]:
    """Return (head, body) for a source line.

    Quoted lines: head is everything before the first quote, body is inside the
    quotes. Quote-less lines (e.g. "Argentinien 阿根廷", "analog Adj模拟的")
    are split at the first whitespace that precedes the gloss start (a POS token
    or a Chinese character), so the headword never absorbs the gloss.
    """
    if line.startswith('"'):
        # The headword itself is a quoted phrase, e.g. "mehr oder weniger" 或多或少
        # or "zu viel" "Adv 太多". Head = first quoted span; body = the rest.
        m = re.match(r'"([^"]*)"\s*(.*)$', line)
        if m:
            head = m.group(1).strip()
            rest = m.group(2).strip()
            # The remainder may itself be quoted ("Adv 太多") — unwrap it.
            if rest.startswith('"') and rest.endswith('"'):
                rest = rest[1:-1].strip()
            return head, rest
    if '"' in line:
        head, quoted = line.split('"', 1)
        body = quoted.rsplit('"', 1)[0]
        return head.strip(), body

    # No quote: the gloss begins at a POS token or the first Chinese char.
    m = BODY_START_RE.search(line)
    if not m:
        return line.strip(), ""
    cut = m.start()
    head = line[:cut].strip()
    body = line[cut:].strip()

    # If the gloss started mid-token at the first Chinese char, the POS marker
    # (Adj/Vi/Vt/n...) may be glued to the head's last token, e.g.
    # "übernachten Vi过夜" -> head "übernachten Vi". Strip a trailing POS token
    # off the head and fold it into the body so split_body() can capture it as
    # `notes`. A genuine word like reflexive "sich" (in "bemühen sich") is not a
    # POS token and stays in the head.
    head_tokens = head.split()
    if head_tokens and head_tokens[-1].rstrip(",.") in ALL_POS:
        pos = head_tokens.pop()
        head = " ".join(head_tokens)
        body = (pos + " " + body).strip()
    # Move any trailing opening-bracket that belongs to the gloss back into the
    # body, e.g. head "vor/strecken (" + body "向前)伸出".
    m2 = re.search(r"\s*([(（\[]+)$", head)
    if m2:
        head = head[: m2.start()]
        body = (m2.group(1) + body).strip()
    return head.strip(), body


def parse_pgh() -> list[dict]:
    """Parse pgh.csv into {german, display, meaning, chinese, notes, source} rows."""
    # Phase 1: parse raw head/notes/gloss for every line.
    raw_entries = []
    with PGH_SOURCE.open("r", encoding="utf-8-sig") as f:
        for source_order, raw_line in enumerate(f, start=1):
            line = raw_line.strip()
            if not line:
                continue

            head, body = split_line(line)
            original = head.strip()
            if not original:
                continue
            german = normalize_headword(original)
            notes, chinese = split_body(body)
            raw_entries.append((source_order, original, german, notes, chinese))

    # Record all headwords so cross-reference rescue can tell whether a
    # "见 X" target actually exists in the dataset.
    _PRESENT_HEADWORDS.clear()
    _PRESENT_HEADWORDS.update(g.lower() for _, _, g, _, _ in raw_entries)

    # Phase 2: clean glosses (balance brackets, rescue dead cross-refs).
    entries = []
    for source_order, original, german, notes, chinese in raw_entries:
        chinese = cleanup_meaning(german, chinese)
        if not chinese:
            # Last resort: never emit an empty answer. Fall back to the notes
            # text (rare) or the headword itself so the entry stays usable.
            chinese = notes or german
        entry = {
            "german": german,
            "display": original,
            "meaning": chinese,
            "chinese": chinese,
            "notes": notes,
            # rank assigned later (by frequency); keep original order as
            # the stable tie-breaker / fallback for unranked words.
            "_order": source_order,
            "source": "deutsch-data/vocab/pgh.csv",
        }
        entries.append(entry)

    return entries


def has_mojibake(s: str) -> bool:
    if "�" in s:
        return True
    return bool(re.search(r"Ã[-¿¤¶¼]|â€|Å¸", s))


def degenerate(s: str) -> bool:
    """Machine-translation degeneration: the same chunk repeated 3+ times."""
    for n in (1, 2, 3):
        for i in range(len(s) - n * 3):
            chunk = s[i:i + n]
            if chunk.strip() and s[i:i + n * 4] == chunk * 4:
                return True
    parts = [p.strip() for p in re.split(r"[,;，；]", s) if p.strip()]
    if len(parts) >= 4 and len(set(parts)) == 1:
        return True
    return False


# A legacy pgh.csv note that only repeats gender/plural info we now emit as
# real fields ("m, ⸚er", "f, -en", "n, o. Pl", "S", "V").
LEGACY_NOISE_RE = re.compile(r"^(?:[mfn]\s*(?:,.*)?|S|V|Pl\.?|o\.\s*Pl\.?)$")
WORD_RE = re.compile(r"[A-Za-zÄÖÜäöüß]+")


def build_notes(pos: str, genders: list[str], plural: str | None,
                vparts: dict | None, legacy: str, *, pltantum: bool = False,
                proper: bool = False) -> str:
    bits: list[str] = []
    if pos == "noun":
        if pltantum:
            bits.append("nur Pl.")
        elif proper:
            bits.append("Eigenname")
        else:
            bits.append("/".join(genders) if genders else "S")
            if plural:
                bits.append(f"Pl. {plural}")
    elif pos == "verb":
        bits.append("V")
        pp = principal_parts(vparts or {})
        if pp:
            bits.append(pp)
    else:
        bits.append(POS_ABBR.get(pos, pos))
    extra = (legacy or "").strip()
    if not extra or len(extra) > 24 or LEGACY_NOISE_RE.match(extra) or extra in bits:
        return " · ".join(bits)
    # pgh.csv often repeats what we just generated, e.g. "(war, ist gewesen)"
    # next to the principal parts "ist, war, ist gewesen".
    have = set(WORD_RE.findall(" ".join(bits).lower()))
    words = set(WORD_RE.findall(extra.lower()))
    if words and words <= have:
        return " · ".join(bits)
    bits.append(extra)
    return " · ".join(bits)


def principal_parts(vparts: dict) -> str:
    pp, aux = vparts.get("pp"), vparts.get("aux")
    seq = [vparts.get("p3"), vparts.get("pt")]
    if pp:
        seq.append(f"{'ist' if aux == 'sein' else 'hat'} {pp}")
    return ", ".join(s for s in seq if s)


def merge_round_robin(lists: list[list[str]], limit: int) -> list[str]:
    """Interleave per-record gloss lists so every homograph contributes.

    Bank has two Wiktionary records (bench / financial institution); taking the
    first three glosses of the first record would drop the bank sense entirely.
    """
    out: list[str] = []
    for i in range(max((len(l) for l in lists), default=0)):
        for l in lists:
            if i < len(l) and l[i] not in out:
                out.append(l[i])
                if len(out) >= limit:
                    return out
    return out


def load_course_headwords() -> set[str]:
    """The words data/de-course.js (course/1) teaches.

    Every unit.words item must be a system-vocabulary `word`
    (scripts/validate_modules.js checks it), so the course list is a teaching
    source on the same footing as pgh.csv and the Goethe Wortlisten: an entry
    it names is never dropped for being a proper noun, a nominalisation or a
    participle.  Read-only — this build never writes de-course.js.
    """
    script = (
        "const d=require(process.argv[1]);"
        "process.stdout.write(JSON.stringify(d.levels.flatMap(l=>l.units.flatMap(u=>u.words||[]))))"
    )
    out = subprocess.run(
        ["node", "-e", script, str(ROOT / "data" / "de-course.js")],
        check=True, stdout=subprocess.PIPE)
    return {w for w in json.loads(out.stdout.decode("utf-8")) if w}


def main() -> None:
    paths = fetch_sources()

    lex_file = WORK / "lexicon.jsonl"
    formmap_file = WORK / "formmap.json"
    extract_lexicon(paths["kaikki"], lex_file, formmap_file)
    lex = load_lexicon(lex_file)
    formmap = json.loads(formmap_file.read_text(encoding="utf-8"))
    print(f"       {resolve_derived_glosses(lex)} derivational glosses resolved")

    lemma_words = {w for w, recs in lex.items() if any(r.get("lemma") for r in recs)}
    pos_rank = {p: i for i, p in enumerate(POS_ORDER)}
    pos_of: dict[str, str] = {}
    for w in lemma_words:
        ps = [r["p"] for r in lex[w] if r.get("lemma")]
        if w[:1].isupper() and "noun" in ps:
            pos_of[w] = "noun"
        else:
            ps = [p for p in ps if p != "noun"] or ps
            pos_of[w] = min(ps, key=lambda p: pos_rank.get(p, 99))

    case_model = build_case_model(paths["tatoeba"], WORK / "casemodel.json")
    freq = build_frequency(paths["freq"], formmap, lemma_words, pos_of,
                           case_model, WORK / "freq.json")
    goethe = parse_goethe(paths, WORK / "goethe.json")
    hdd = parse_handedict(paths["handedict"], WORK / "handedict-de.json")
    pivot = EcdictPivot(paths["ecdict"])

    print("[5/6] parsing the in-repo pgh.csv Chinese glossary ...")
    pgh_entries = parse_pgh()
    pgh: dict[str, dict] = {}
    for e in pgh_entries:
        cur = pgh.get(e["german"])
        if cur is None:
            pgh[e["german"]] = dict(e)
            continue
        # pgh.csv lists homographs on separate rows ("Bank" bench / bank);
        # both Chinese glosses belong to the one headword we will emit.
        for extra in re.split(r"[;；]", e.get("chinese") or ""):
            extra = extra.strip()
            if extra and extra not in cur["chinese"]:
                cur["chinese"] = f"{cur['chinese']}; {extra}"
        if not cur.get("notes") and e.get("notes"):
            cur["notes"] = e["notes"]
    print(f"       {len(pgh)} pgh.csv headwords")

    course = load_course_headwords()
    print(f"       {len(course)} course headwords (data/de-course.js)")
    # pgh.csv, the Goethe lists and the course syllabus are the three teaching
    # sources; a word any of them names is protected from the heuristic drops.
    taught = set(pgh) | set(goethe) | course | set(CURATED_NOUNS)

    # ---------------- candidate headwords ----------------
    print("[6/6] assembling ...")
    candidates: set[str] = set()
    candidates |= {w for w in pgh if w in lex}
    candidates |= {w for w in goethe if w in lex}
    candidates |= {w for w in course if w in lex}
    candidates |= {w for w in lemma_words if freq.get(w, 0) >= 40}
    candidates |= set(CURATED_NOUNS)
    print(f"       {len(candidates)} raw candidates")

    # Two cases where lemma attribution cannot give a word its due:
    #  * a teaching-source word that lost all of its mass to a base lemma
    #    ("früher" -> "früh", "Ferien" -> ...);
    #  * a plurale tantum, whose surface *is* the lemma but which Wiktionary
    #    also files as "plural of <singular>", so build_frequency hands its
    #    count to that singular ("Medien" -> "Medium", 3 counts left).
    # A word's own surface count is a real, citable corpus frequency, so use it.
    pltantum_words = {w for w, rs in lex.items()
                      if rs and all(r.get("pltantum") for r in rs
                                    if r.get("lemma") and r["p"] == "noun")
                      and any(r.get("pltantum") for r in rs)}
    raw_counts = load_raw_counts(
        paths["freq"],
        {w for w in taught if not freq.get(w)} | (pltantum_words & candidates))

    stats = Counter()
    entries: list[dict] = []
    trace = {w for w in os.environ.get("DE_VOCAB_TRACE", "").split(",") if w}
    current = [""]

    def bail(reason: str) -> None:
        """Record (and, with DE_VOCAB_TRACE=Wort,Wort, explain) a rejection."""
        stats[reason] += 1
        if current[0] in trace:
            print(f"       TRACE {current[0]}: {reason}")

    for word in candidates:
        current[0] = word
        cnoun = CURATED_NOUNS.get(word)
        recs = [r for r in lex.get(word, []) if r.get("lemma")]
        if cnoun:
            # hand-authored: use the dump only for the plural/frequency hints
            recs = [{"w": word, "p": "noun", "lemma": True,
                     "g": [cnoun["english"]],
                     "gen": [cnoun["gender"]] if cnoun.get("gender") else [],
                     "pl": cnoun.get("plural"),
                     "pltantum": cnoun.get("pltantum", False)}]
        if not recs:
            bail("drop_no_lemma_sense")
            continue
        if word.lower() in STOP_HEADWORDS:
            bail("drop_stoplist_inflection")
            continue
        # A surface form that Wiktionary only knows as an inflection of
        # something else must not sit in the headword position.
        if word in formmap and not recs:
            bail("drop_inflected_form")
            continue
        if len(word) < 2 or not SHAPE_RE.match(word):
            bail("drop_shape")
            continue
        if word != word[0] + word[1:] or unicodedata.normalize("NFC", word) != word:
            bail("drop_shape")
            continue

        # ---- part of speech
        if word[0].isupper() and any(r["p"] == "noun" for r in recs):
            # a capitalised headword is a noun in German; drop stray senses
            recs = [r for r in recs if r["p"] == "noun"]
        elif word[0].islower() and any(r["p"] != "noun" for r in recs):
            # ... and a lower-case one is not ("das mal" does not exist)
            recs = [r for r in recs if r["p"] != "noun"]
        want = POS_OVERRIDE.get(word)
        recs.sort(key=lambda r: (r["p"] != want, pos_rank.get(r["p"], 99)))
        primary = recs[0]
        pos = primary["p"]
        all_pos = []
        for r in recs:
            if r["p"] not in all_pos:
                all_pos.append(r["p"])

        is_taught = word in taught
        # ---- nominalised function words / infinitives ("das Ich", "das Haben")
        if (pos == "noun" and word[0].isupper()
                and pos_of.get(word.lower()) in NOMINALISED_BASE_POS
                and not is_taught):
            bail("drop_nominalisation")
            continue
        # ---- participial adjectives that Wiktionary lists as their own lemma
        # ("gelaunt", "beschäftigt"): keep them only if a teaching source does.
        if (set(all_pos) <= {"adjective", "adverb"}
                and any(pos_of.get(t) == "verb" for t in formmap.get(word, []))
                and not is_taught):
            bail("drop_participial_adjective")
            continue
        # ---- proper nouns: Wiktionary has tens of thousands of them and they
        # are not vocabulary. Keep only the ones a teaching source names
        # ("Deutschland", "Europa", "Rhein").
        noun_recs = [r for r in recs if r["p"] == "noun"]
        proper = bool(noun_recs) and all(r.get("prop") for r in noun_recs)
        if proper and not is_taught:
            bail("drop_proper_noun")
            continue
        # ---- gender
        genders: list[str] = []
        for r in recs:
            for g in r.get("gen") or []:
                if g not in genders:
                    genders.append(g)
        gsrc = "wikt"
        # ---- plurale tantum ("die Eltern", "die Leute"): a real headword with
        # a plural article and no singular gender. Wiktionary also tags single
        # *senses* plural-only ("Umstände" = fuss), so a word that has a gender
        # is a normal countable noun whatever its senses say.
        pltantum = (pos == "noun" and not genders and bool(noun_recs)
                    and all(r.get("pltantum") for r in noun_recs))
        if pos == "noun" and not genders:
            gg = (goethe.get(word) or {}).get("gender")
            if gg:
                genders = [gg]
                gsrc = "goethe"
        if pltantum or proper:
            genders = []            # "die Eltern", "Deutschland": no der/die/das
            gsrc = "n/a"
        if pos == "noun" and not genders and not (pltantum or proper):
            bail("drop_noun_without_gender")
            continue

        # ---- English gloss: round-robin so each homograph record contributes
        per_rec = []
        cognate = []
        for r in recs:
            gl = [g for g in (r.get("g") or [])
                  if g and not PLACEHOLDER_RE.match(g) and not has_mojibake(g)
                  and not PROPER_JUNK_RE.match(g)]
            distinct = [g for g in gl if g.lower() != word.lower()]
            if distinct:
                per_rec.append(distinct)
            elif gl:
                # "Hotel -> hotel", "Museum -> museum": for a loanword the
                # English gloss legitimately *is* the headword. Only used when
                # no more informative gloss exists anywhere on the entry.
                cognate.append(gl[:1])
        eng = merge_round_robin(per_rec, 3) or merge_round_robin(cognate, 1)
        cur = CURATED.get(word)
        if cnoun:
            en_src = SRC_EN_CURATED
        elif recs and all(r.get("obs") for r in recs if r.get("g")):
            en_src = SRC_EN_OBS   # gloss rescued from an obsolete-tagged sense
        else:
            en_src = SRC_EN
        if cur:
            eng = [cur[0]]
            en_src = SRC_EN_CURATED
        if not eng:
            bail("drop_no_english")
            continue
        english = "; ".join(eng)

        # ---- Chinese gloss.  Each source is a *candidate*: a gloss that fails
        # the quality checks (pgh.csv has a handful of rows corrupted with
        # "......") falls through to the next source instead of killing the
        # entry.
        zh_candidates: list[tuple[str, str]] = []
        p = pgh.get(word)
        if cur:
            zh_candidates.append((cur[1], "curated"))
        if p and p.get("chinese"):
            zh_candidates.append((p["chinese"], "pgh"))
        zh = hdd.get(word) or hdd.get(word.lower())
        if zh:
            zh_candidates.append((", ".join(zh[:4]), "handedict"))
        got = []
        for g in eng:
            z = pivot.lookup(g, pos)
            if z and z not in got:
                got.append(z)
        if got:
            zh_candidates.append(("; ".join(got)[:70], "ecdict-pivot"))

        chinese = ""
        zh_src = ""
        rejected = False
        for cand, src in zh_candidates:
            cand = cand.strip()
            if not cand or not ZH_RE.search(cand):
                continue
            if has_mojibake(cand) or PLACEHOLDER_RE.match(cand) or degenerate(cand):
                rejected = True
                continue
            chinese, zh_src = cand, src
            break
        if not chinese:
            bail("drop_bad_chinese" if rejected else "drop_no_chinese")
            continue

        # ---- frequency / rank
        f = freq.get(word, 0)
        fsrc = SRC_FREQ
        surface = raw_counts.get(word.lower(), 0)
        if surface > f and (pltantum or (f <= 0 and is_taught)):
            f = surface
            fsrc = SRC_FREQ_SURFACE
        if f <= 0:
            bail("drop_no_corpus_frequency")
            continue

        # ---- level
        glevel = (goethe.get(word) or {}).get("level")
        level = glevel or None
        level_src = f"lvl:goethe-{glevel}" if glevel else "lvl:freq-band"

        plural = primary.get("pl") or (goethe.get(word) or {}).get("plural")
        if plural and plural.startswith("-"):
            plural = None       # Goethe writes "-e"; only keep a full form
        vparts = primary.get("v") if pos == "verb" else None

        display = word
        if p and p.get("display") and "/" in p["display"]:
            display = p["display"]
        elif pos == "verb":
            for pre in SEPARABLE_PREFIXES:
                if (word.startswith(pre) and len(word) > len(pre) + 3
                        and vparts and vparts.get("p3", "").endswith(" " + pre)):
                    display = f"{pre}/{word[len(pre):]}"
                    break
        if pos == "noun" and genders:
            display = f"{GENDER_ARTICLE[genders[0]]} {display}"
        elif pltantum:
            display = f"die {display}"

        notes = build_notes(pos, genders, plural, vparts, (p or {}).get("notes", ""),
                            pltantum=pltantum, proper=proper)

        src_bits = [SRC_TOKEN[zh_src], en_src]
        if pos == "noun" and genders:
            src_bits.append(f"g:{gsrc}")
        src_bits.append(fsrc)
        src_bits.append(level_src)

        entry = {
            "german": word,
            "display": display,
            "meaning": chinese,
            "chinese": chinese,
            "english": english,
            "notes": notes,
            "partOfSpeech": pos,
            "level": level,           # filled in after ranking when inferred
            "frequency": f,
            "source": "; ".join(src_bits),
            "_allpos": all_pos,
        }
        if pos == "noun":
            if genders:
                entry["gender"] = genders[0]
            if len(genders) > 1:
                entry["genders"] = genders
            if plural and not pltantum:
                entry["plural"] = plural
            if pltantum:
                entry["pluraleTantum"] = True
            if proper:
                entry["properNoun"] = True
        if pos == "verb" and vparts:
            pp = principal_parts(vparts)
            if pp:
                entry["principalParts"] = pp
        entries.append(entry)

    # ---- rank by real corpus frequency
    entries.sort(key=lambda e: (-e["frequency"], e["german"].lower()))
    order = ["A1", "A2", "B1", "B2", "C1"]
    for i, e in enumerate(entries, start=1):
        e["rank"] = i
        # Goethe only publishes A1/A2/B1, and even there it misses very common
        # function words ("du", "ihr", "mal"); everything else is banded by real
        # corpus rank.  Where both exist, the easier of the two wins: a word in
        # the 600 most frequent German words is A1 material whatever list it is
        # printed on.
        band = ("A1" if i <= 600 else "A2" if i <= 1500
                else "B1" if i <= 3000 else "B2" if i <= 6000 else "C1")
        goethe_level = e["level"]
        if goethe_level and order.index(goethe_level) <= order.index(band):
            e["level"] = goethe_level
        else:
            e["level"] = band
            e["source"] = re.sub(r"lvl:goethe-\w+", "lvl:freq-band", e["source"])

    # ---- final field order + unique id
    ordered: list[dict] = []
    seen: set[str] = set()
    for i, e in enumerate(entries, start=1):
        assert e["german"] not in seen, e["german"]
        seen.add(e["german"])
        allpos = e.pop("_allpos")
        rec = {
            "id": f"de-{i:05d}",
            "german": e["german"],
            "display": e["display"],
            "meaning": e["meaning"],
            "chinese": e["chinese"],
            "english": e["english"],
            "notes": e["notes"],
            "partOfSpeech": e["partOfSpeech"],
            "level": e["level"],
            "frequency": e["frequency"],
            "rank": e["rank"],
            "source": e["source"],
        }
        if len(allpos) > 1:
            rec["partsOfSpeech"] = allpos
        for k in ("gender", "genders", "plural", "pluraleTantum", "properNoun",
                  "principalParts"):
            if k in e:
                rec[k] = e[k]
        ordered.append(rec)

    lv = Counter(e["level"] for e in ordered)
    ps = Counter(e["partOfSpeech"] for e in ordered)
    print("       drops:", dict(sorted(stats.items(), key=lambda kv: -kv[1])))
    print("       levels:", dict(sorted(lv.items())))
    print("       pos:", dict(sorted(ps.items(), key=lambda kv: -kv[1])))

    # Schema v1 (docs/vocab-schema.md). `source` keeps the per-field
    # provenance tokens documented in the module docstring; vocab_legacy maps
    # them onto levelSource / forms.government and interns them in
    # meta.sources.
    import vocab_legacy
    out = vocab_legacy.emit("de", vocab_legacy.from_de(ordered), builder=BUILDER)
    print(f"Generated {out} with {len(ordered)} entries "
          f"({out.stat().st_size / 1e6:.1f} MB)")
    # Audited corrections (genders, zh/en cleanup): scripts/de_vocab_fixes/
    import de_vocab_fixes
    de_vocab_fixes.apply_file()


def fill_missing_english() -> None:
    """Post-pass: give every entry without `en` a Wiktionary gloss."""
    import vocab_schema as vs

    filled = Counter()

    def update(entries: list, meta: dict) -> None:
        by_word = {e["word"]: e for e in entries}
        for e in entries:
            if e.get("en"):
                continue
            english = vs.kaikki_english("German", e["word"])
            token = SRC_EN
            if not english and e.get("pos") == "noun" and e["word"].endswith("in"):
                base = (by_word.get(e["word"][:-2])            # Lehrerin -> Lehrer
                        or by_word.get(e["word"][:-2] + "e"))  # Kollegin -> Kollege
                if base and base.get("en"):
                    english = "(female) " + base["en"].split(";")[0].strip()
                    token = "en:feminine-of(" + base["word"] + ")"
            if not english or english.lower() == e["word"].lower():
                filled["none"] += 1
                continue
            e["en"] = english
            source = vs.source_of({"meta": meta}, e)
            e["src"] = vs.source_index(meta, source.replace("; f:", f"; {token}; f:", 1)
                                       if "; f:" in source else f"{source}; {token}")
            filled[token.split("(")[0]] += 1

    out = vs.rewrite_vocab("de", update)
    print(f"{out}: en filled {dict(filled)}")
    import de_vocab_fixes
    de_vocab_fixes.apply_file()


if __name__ == "__main__":
    if sys.argv[1:] == ["fill"]:
        fill_missing_english()
    else:
        main()
