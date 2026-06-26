#!/usr/bin/env python3
"""
Build the German vocabulary data file from deutsch-data/vocab/pgh.csv.

Output: data/german-vocabulary.js   (const GERMAN_VOCABULARY_DATA)
Item shape (field contract consumed by german-app.js / lib/quiz-engine.js):
    { german, display, meaning, chinese, notes, rank, source, morphology? }
  - german  : normalized headword (slashes removed) — used as the unique key
              and the quiz source field (fieldMap source = 'german')
  - display : original headword incl. separable-verb slash (e.g. "ab/bauen"),
              shown to the learner and spoken by TTS — PRESERVED verbatim
  - meaning : clean Chinese gloss (the quiz answer, fieldMap target = 'meaning')
  - chinese : Chinese gloss. The source is a German->Chinese dictionary, so
              there is no separate non-Chinese portion to split out; meaning and
              chinese carry the same clean gloss (the apps read `meaning ||
              chinese`, so both must be present). They are NOT a raw duplicate of
              the messy source line — `notes` (POS / case info) is split off.
  - notes   : POS / grammatical hint (e.g. "Vt", "Präp/Adv") — PRESERVED, used
              as the hint button in the quiz UI
  - rank    : 1-based REAL German frequency rank (1 = most common) via wordfreq.
              Words with no frequency hit are appended after the ranked head
              (in their original source order) rather than dropped.
  - source  : provenance string

Changes vs. the old alphabetical build:
  * Re-ranked by real German frequency (wordfreq word_frequency(.,'de')).
  * Fixed head/body splitting for the ~51 source lines that lack the quote
    delimiter (e.g. "Argentinien 阿根廷", "analog Adj模拟的"), which previously
    produced garbage headwords like "analog Adj模拟的".
  * meaning/chinese now hold the cleaned gloss with the POS note split into
    `notes`, instead of duplicating the raw mixed string into both fields.

Run:  python3 scripts/process_german_vocab.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from wordfreq import word_frequency


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "deutsch-data" / "vocab" / "pgh.csv"
OUTPUT = ROOT / "data" / "german-vocabulary.js"


try:
    from demorphy import Analyzer  # type: ignore
except Exception:
    Analyzer = None


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


def split_body(body: str) -> tuple[str, str]:
    """Split a body into (notes, chinese_meaning).

    `notes` is the leading POS / grammatical info (Latin-script) and `chinese`
    is the Chinese gloss beginning at the first CJK character.
    """
    body = body.strip().strip('"').strip()
    match = re.search(r"[一-鿿]", body)
    if not match:
        return "", normalize_meaning(body)

    idx = match.start()
    notes = body[:idx].strip(" ,;，；")
    meaning = body[idx:].strip()
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


def analyze_with_demorphy(analyzer, token: str):
    if not analyzer or not token:
        return None
    try:
        analyses = analyzer.analyze(token)
    except Exception:
        return None
    if not analyses:
        return None

    first = analyses[0]
    result = {}
    for attr in ("lemma", "pos", "morph"):
        value = getattr(first, attr, None)
        if value:
            result[attr] = str(value)
    return result or None


def parse_entries() -> list[dict]:
    analyzer = Analyzer() if Analyzer else None
    entries = []

    with SOURCE.open("r", encoding="utf-8-sig") as f:
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
            morph = analyze_with_demorphy(analyzer, german)

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
            if morph:
                entry["morphology"] = morph
            entries.append(entry)

    return entries


def rank_by_frequency(entries: list[dict]) -> list[dict]:
    """Sort by real German frequency (desc); append no-hit words after the
    ranked head in their original source order. Re-number `rank` 1..N."""
    for e in entries:
        e["_freq"] = word_frequency(e["german"].lower(), "de")

    ranked = [e for e in entries if e["_freq"] > 0]
    unranked = [e for e in entries if e["_freq"] <= 0]

    ranked.sort(key=lambda e: (-e["_freq"], e["_order"]))
    unranked.sort(key=lambda e: e["_order"])

    ordered = ranked + unranked
    for i, e in enumerate(ordered, start=1):
        e["rank"] = i
        del e["_freq"]
        del e["_order"]
    return ordered, len(ranked), len(unranked)


def main() -> None:
    entries = parse_entries()
    entries, n_ranked, n_unranked = rank_by_frequency(entries)

    payload = json.dumps(entries, ensure_ascii=False, indent=2)
    OUTPUT.write_text(
        "// German vocabulary data generated from deutsch-data/vocab/pgh.csv\n"
        f"// Total entries: {len(entries)} "
        f"({n_ranked} frequency-ranked, {n_unranked} appended without a freq hit)\n"
        "// Ranked by real German frequency (wordfreq). Structure:\n"
        "// {german, display, meaning, chinese, notes, rank, source, morphology?}\n\n"
        f"const GERMAN_VOCABULARY_DATA = {payload};\n\n"
        "if (typeof module !== 'undefined' && module.exports) {\n"
        "  module.exports = GERMAN_VOCABULARY_DATA;\n"
        "}\n",
        encoding="utf-8",
    )
    print(f"Generated {OUTPUT} with {len(entries)} entries "
          f"({n_ranked} ranked, {n_unranked} unranked-appended)")


if __name__ == "__main__":
    main()
