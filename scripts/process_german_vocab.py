#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "deutsch-data" / "vocab" / "pgh.csv"
OUTPUT = ROOT / "data" / "german-vocabulary.js"


try:
    from demorphy import Analyzer  # type: ignore
except Exception:
    Analyzer = None


def normalize_headword(text: str) -> str:
    text = text.replace("/", "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_meaning(text: str) -> str:
    text = text.replace("，", ", ")
    text = re.sub(r"\s+", " ", text).strip(" \t\"'")
    return text


def split_body(body: str) -> tuple[str, str]:
    body = body.strip().strip('"').strip()
    match = re.search(r"[\u4e00-\u9fff]", body)
    if not match:
        return "", normalize_meaning(body)

    idx = match.start()
    notes = body[:idx].strip(" ,;，；")
    meaning = body[idx:].strip()
    return notes, normalize_meaning(meaning)


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
        for rank, raw_line in enumerate(f, start=1):
            line = raw_line.strip()
            if not line:
                continue

            if '"' in line:
                head, quoted = line.split('"', 1)
                body = quoted.rsplit('"', 1)[0]
            else:
                head, body = line, ""

            original = head.strip()
            german = normalize_headword(original)
            notes, chinese = split_body(body)
            morph = analyze_with_demorphy(analyzer, german)

            entry = {
                "german": german,
                "display": original,
                "meaning": chinese,
                "chinese": chinese,
                "notes": notes,
                "rank": rank,
                "source": "deutsch-data/vocab/pgh.csv",
            }
            if morph:
                entry["morphology"] = morph
            entries.append(entry)

    return entries


def main() -> None:
    entries = parse_entries()
    payload = json.dumps(entries, ensure_ascii=False, indent=2)
    OUTPUT.write_text(
        "// German vocabulary data generated from deutsch-data/vocab/pgh.csv\n"
        f"// Total entries: {len(entries)}\n"
        "// Structure: {german, display, meaning, chinese, notes, rank, source, morphology?}\n\n"
        f"const GERMAN_VOCABULARY_DATA = {payload};\n\n"
        "if (typeof module !== 'undefined' && module.exports) {\n"
        "  module.exports = GERMAN_VOCABULARY_DATA;\n"
        "}\n",
        encoding="utf-8",
    )
    print(f"Generated {OUTPUT} with {len(entries)} entries")


if __name__ == "__main__":
    main()