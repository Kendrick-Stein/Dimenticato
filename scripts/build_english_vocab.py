#!/usr/bin/env python3
"""
Build English vocabulary data file from english-data/english word/EnWords.csv.
Generates data/english-vocabulary.js with ENGLISH_VOCABULARY_DATA constant.
Format mirrors data/german-vocabulary.js (GERMAN_VOCABULARY_DATA).
"""

import os
import csv
import json
import re

# Note: directory has a leading space in name
CSV_FILE = os.path.join(os.path.dirname(__file__), '..', ' english-data', 'english word', 'EnWords.csv')
OUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'english-vocabulary.js')

# Limit to keep file size reasonable (top N by rank)
MAX_WORDS = 20000

def clean_meaning(raw):
    """Extract a clean primary meaning from the raw translation field."""
    if not raw:
        return ''
    # The translation field often looks like:
    #   "n.(A)As 或 A's  安(ampere)..." or "v.be的第三人称单数..."
    # We want to keep it reasonably clean but preserve Chinese content.

    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', raw.strip())

    # Truncate very long entries at a sentence boundary or comma
    if len(cleaned) > 200:
        # Try to cut at first semicolon or newline equivalent after 100 chars
        cut = cleaned[:200]
        for sep in ['；', ';', '。', '\n']:
            idx = cut.find(sep)
            if idx > 50:
                cut = cut[:idx]
                break
        cleaned = cut.strip()

    return cleaned

def main():
    print(f"Reading vocabulary from {CSV_FILE} ...")

    if not os.path.exists(CSV_FILE):
        print(f"ERROR: File not found: {CSV_FILE}")
        return

    words = []
    with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f)
        header = next(reader, None)
        print(f"Header: {header}")

        for rank, row in enumerate(reader, start=1):
            if rank > MAX_WORDS:
                break
            if len(row) < 2:
                continue

            word = row[0].strip()
            raw_translation = row[1].strip() if len(row) > 1 else ''

            if not word:
                continue

            meaning = clean_meaning(raw_translation)

            entry = {
                'english': word,
                'meaning': meaning,
                'chinese': meaning,   # same field, kept for UI consistency with German vocab
                'notes': '',
                'rank': rank,
                'source': 'EnWords'
            }
            words.append(entry)

    print(f"Loaded {len(words)} words.")

    js_output = 'const ENGLISH_VOCABULARY_DATA = ' + json.dumps(words, ensure_ascii=False, indent=2) + ';\n'

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_output)

    print(f"Done! Written to {OUT_FILE}")

if __name__ == '__main__':
    main()
