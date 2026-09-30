#!/usr/bin/env python3
"""
Tidy the messy `dictionary` field of the Italian vocabulary file IN PLACE.

Target: vocabulary.js   (const VOCABULARY_DATA, ~27,117 entries)
Item shape (field contract — ALL preserved unchanged):
    { italian, dictionary, english, chinese, frequency, rank }

This script ONLY rewrites `dictionary`. It strips the leading IPA / phonetic
transcription noise that was scraped in front of many definitions, e.g.
    "/ ˈnon / adverb not"                  -> "adverb not"
    "/ u.na /, / ˈu.na / noun (...)"        -> "noun (...)"
    "/ [ /aˈliʧe / noun anchovy"            -> "noun anchovy"
    "/ /preˈzumere/, /preˈsumere / verb..." -> "verb ..."

Why this is safe
----------------
* It only touches entries whose `dictionary` STARTS with '/'. Mid-text slashes
  inside real definitions (e.g. "lui/lei", "e/o", "al/ad") are never affected.
* The phonetic block is bounded by anchoring on the FIRST part-of-speech keyword
  (noun/verb/adjective/...): we drop everything up to and including the last '/'
  that precedes that POS keyword — that last '/' is the closing slash of the IPA
  transcription. The real definition always begins at the POS keyword.
* If an entry has NO recognised POS keyword (a small set of acronyms /
  interjections such as "/ ˈsuv / SUV"), it is left untouched rather than risk
  removing real content.
* english / chinese / frequency / rank / italian are never read or modified;
  the file's header comments, const name and formatting are reproduced exactly.

Run:  python3 scripts/clean_italian_dictionary.py
      python3 scripts/clean_italian_dictionary.py --dry-run   (report only)
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "vocabulary.js"

CONST_NAME = "VOCABULARY_DATA"

# Definition part-of-speech keywords that mark the start of the real gloss.
POS_KEYWORDS = [
    "noun", "verb", "adjective", "adverb", "article", "conjunction",
    "preposition", "pronoun", "possessivePronoun", "possessiveAdjective",
    "demonstrativePronoun", "indefiniteAdjective", "relativePronoun",
    "interrogativePronoun", "personalPronoun", "interjection", "numeral",
    "exclamation", "phrase", "abbreviation", "prefix", "suffix", "determiner",
]
POS_RE = re.compile(r"\b(?:" + "|".join(POS_KEYWORDS) + r")\b")


def strip_leading_ipa(text: str) -> str:
    """Remove a leading IPA/phonetic transcription block from a dictionary gloss."""
    s = text.strip()
    if not s.startswith("/"):
        return text
    pm = POS_RE.search(s)
    if not pm:
        return text  # no POS anchor — leave acronyms/interjections untouched
    last_slash = s.rfind("/", 0, pm.start())
    if last_slash <= 0:
        return text
    rest = s[last_slash + 1:].strip()
    return rest if rest else text


def load_array(js_text: str):
    """Extract the JSON array literal that follows `const VOCABULARY_DATA =`."""
    marker = f"const {CONST_NAME}"
    idx = js_text.index(marker)
    start = js_text.index("[", idx)
    # The array ends at the matching closing bracket before the trailing ';'.
    end = js_text.rindex("]")
    arr = json.loads(js_text[start:end + 1])
    return arr, js_text[:start], js_text[end + 1:]


def main() -> None:
    dry_run = "--dry-run" in sys.argv

    js_text = TARGET.read_text(encoding="utf-8")
    arr, prefix, suffix = load_array(js_text)

    changed = 0
    for entry in arr:
        d = entry.get("dictionary", "")
        cleaned = strip_leading_ipa(d)
        if cleaned != d:
            entry["dictionary"] = cleaned
            changed += 1

    print(f"{len(arr)} entries; {changed} dictionary fields cleaned.")
    # Safety assertions on the contract fields.
    required = {"italian", "dictionary", "english", "chinese", "frequency", "rank"}
    assert all(required <= set(e.keys()) for e in arr), "field contract violated!"
    assert all(not str(e["dictionary"]).startswith("/ ") or not POS_RE.search(e["dictionary"])
               for e in arr), "leading IPA still present before a POS keyword!"

    if dry_run:
        print("--dry-run: no file written.")
        return

    # Reproduce the original file layout: header/const prefix, the array
    # serialized with 2-space indent (matching the source), and the original
    # trailing text (the ';' and any newline).
    # one entry per line, same layout as scripts/build_italian_vocabulary_tags.py
    payload = '[\n' + ',\n'.join(json.dumps(e, ensure_ascii=False, separators=(',', ':'))
                                  for e in arr) + '\n]'
    TARGET.write_text(prefix + payload + suffix, encoding="utf-8")
    print(f"Wrote {TARGET}")


if __name__ == "__main__":
    main()
