#!/usr/bin/env python3
"""Build English verb conjugation data for the static app.

The generated JS mirrors data/conjugations-all-tenses.js:
top-level const assignment with JSON entries, person tenses using object
forms, and non-finite / imperative forms using single array slots.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
VOCAB_PATH = ROOT / "data" / "english-vocabulary.js"
OUT_PATH = ROOT / "data" / "english-conjugations.js"
TARGET_COUNT = 500

PEOPLE = ["i", "you", "he_she_it", "we", "you_pl", "they"]

try:
    from wordfreq import zipf_frequency
except Exception:  # pragma: no cover - fallback for offline environments.
    zipf_frequency = None


IRREGULARS: dict[str, tuple[str, str]] = {
    "be": ("was", "been"),
    "bear": ("bore", "borne"),
    "beat": ("beat", "beaten"),
    "become": ("became", "become"),
    "begin": ("began", "begun"),
    "bend": ("bent", "bent"),
    "bet": ("bet", "bet"),
    "bind": ("bound", "bound"),
    "bite": ("bit", "bitten"),
    "bleed": ("bled", "bled"),
    "blow": ("blew", "blown"),
    "break": ("broke", "broken"),
    "breed": ("bred", "bred"),
    "bring": ("brought", "brought"),
    "broadcast": ("broadcast", "broadcast"),
    "build": ("built", "built"),
    "burn": ("burned", "burned"),
    "burst": ("burst", "burst"),
    "buy": ("bought", "bought"),
    "catch": ("caught", "caught"),
    "choose": ("chose", "chosen"),
    "come": ("came", "come"),
    "cost": ("cost", "cost"),
    "cut": ("cut", "cut"),
    "deal": ("dealt", "dealt"),
    "dig": ("dug", "dug"),
    "do": ("did", "done"),
    "draw": ("drew", "drawn"),
    "drink": ("drank", "drunk"),
    "drive": ("drove", "driven"),
    "eat": ("ate", "eaten"),
    "fall": ("fell", "fallen"),
    "feed": ("fed", "fed"),
    "feel": ("felt", "felt"),
    "fight": ("fought", "fought"),
    "find": ("found", "found"),
    "fit": ("fit", "fit"),
    "fly": ("flew", "flown"),
    "forget": ("forgot", "forgotten"),
    "forgive": ("forgave", "forgiven"),
    "freeze": ("froze", "frozen"),
    "get": ("got", "gotten"),
    "give": ("gave", "given"),
    "go": ("went", "gone"),
    "grow": ("grew", "grown"),
    "hang": ("hung", "hung"),
    "have": ("had", "had"),
    "hear": ("heard", "heard"),
    "hide": ("hid", "hidden"),
    "hit": ("hit", "hit"),
    "hold": ("held", "held"),
    "hurt": ("hurt", "hurt"),
    "keep": ("kept", "kept"),
    "know": ("knew", "known"),
    "lay": ("laid", "laid"),
    "lead": ("led", "led"),
    "leave": ("left", "left"),
    "lend": ("lent", "lent"),
    "let": ("let", "let"),
    "lie": ("lay", "lain"),
    "light": ("lit", "lit"),
    "lose": ("lost", "lost"),
    "make": ("made", "made"),
    "mean": ("meant", "meant"),
    "meet": ("met", "met"),
    "pay": ("paid", "paid"),
    "put": ("put", "put"),
    "quit": ("quit", "quit"),
    "read": ("read", "read"),
    "ride": ("rode", "ridden"),
    "ring": ("rang", "rung"),
    "rise": ("rose", "risen"),
    "run": ("ran", "run"),
    "say": ("said", "said"),
    "see": ("saw", "seen"),
    "seek": ("sought", "sought"),
    "sell": ("sold", "sold"),
    "send": ("sent", "sent"),
    "set": ("set", "set"),
    "shake": ("shook", "shaken"),
    "shoot": ("shot", "shot"),
    "show": ("showed", "shown"),
    "shut": ("shut", "shut"),
    "sing": ("sang", "sung"),
    "sit": ("sat", "sat"),
    "sleep": ("slept", "slept"),
    "speak": ("spoke", "spoken"),
    "spend": ("spent", "spent"),
    "spread": ("spread", "spread"),
    "stand": ("stood", "stood"),
    "steal": ("stole", "stolen"),
    "stick": ("stuck", "stuck"),
    "strike": ("struck", "struck"),
    "swim": ("swam", "swum"),
    "take": ("took", "taken"),
    "teach": ("taught", "taught"),
    "tear": ("tore", "torn"),
    "tell": ("told", "told"),
    "think": ("thought", "thought"),
    "throw": ("threw", "thrown"),
    "understand": ("understood", "understood"),
    "wake": ("woke", "woken"),
    "wear": ("wore", "worn"),
    "win": ("won", "won"),
    "write": ("wrote", "written"),
}

MODAL_OR_DEFECTIVE = {
    "can",
    "could",
    "may",
    "might",
    "must",
    "shall",
    "should",
    "will",
    "would",
    "ought",
}


def load_js_array(path: Path, const_name: str) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    match = re.search(rf"const\s+{re.escape(const_name)}\s*=\s*\[", text)
    if not match:
        raise ValueError(f"Could not find {const_name} in {path}")
    start = match.end() - 1
    depth = 0
    in_string = False
    escape = False
    for pos in range(start, len(text)):
        ch = text[pos]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return json.loads(text[start : pos + 1])
    raise ValueError(f"Could not parse array for {const_name} in {path}")


def clean_gloss(text: str) -> str:
    text = re.sub(r"\b(?:v|vt|vi|vbl|aux|n|adj|adv|prep|conj|pron|art|int)\.?", "", text, flags=re.I)
    text = re.sub(r"\([^)]*\)", "", text)
    text = re.sub(r"\s+", " ", text).strip(" ;,")
    return text.split(";")[0].split("；")[0][:80]


def english_frequency(word: str, rank: int) -> float:
    if zipf_frequency:
        return round(float(zipf_frequency(word, "en")), 4)
    return round(max(0.0, 7.0 - rank / 5000), 4)


def is_candidate(entry: dict[str, Any]) -> bool:
    word = str(entry.get("english", "")).lower()
    notes = str(entry.get("notes", "")).lower()
    meaning = str(entry.get("meaning", "")).lower()
    if word in MODAL_OR_DEFECTIVE:
        return False
    if not re.fullmatch(r"[a-z]+(?:-[a-z]+)?", word):
        return False
    if "vbl" in notes:
        return False
    if "过去式" in meaning or "过去分词" in meaning or "第三人称" in meaning:
        return False
    return bool(re.search(r"\b(v|vt|vi)\.?\b", notes))


def third_person_singular(base: str) -> str:
    if base == "be":
        return "is"
    if base == "have":
        return "has"
    if base == "do":
        return "does"
    if re.search(r"(s|sh|ch|x|z|o)$", base):
        return base + "es"
    if re.search(r"[^aeiou]y$", base):
        return base[:-1] + "ies"
    return base + "s"


def present_participle(base: str) -> str:
    if base == "be":
        return "being"
    if base.endswith("ie"):
        return base[:-2] + "ying"
    if base.endswith("e") and not base.endswith(("ee", "ye", "oe")):
        return base[:-1] + "ing"
    if re.search(r"[^aeiou][aeiou][^aeiouwxy]$", base) and len(base) > 3:
        return base + base[-1] + "ing"
    return base + "ing"


def regular_past(base: str) -> str:
    if base.endswith("e"):
        return base + "d"
    if re.search(r"[^aeiou]y$", base):
        return base[:-1] + "ied"
    if re.search(r"[^aeiou][aeiou][^aeiouwxy]$", base) and len(base) > 3:
        return base + base[-1] + "ed"
    return base + "ed"


def principal_parts(base: str) -> tuple[str, str, str]:
    past, participle = IRREGULARS.get(base, (regular_past(base), regular_past(base)))
    return past, participle, present_participle(base)


def person_forms(values: list[str]) -> dict[str, str]:
    return dict(zip(PEOPLE, values, strict=True))


def tense(group: str, label: str, forms: dict[str, str]) -> dict[str, Any]:
    return {"type": "person", "group_label": group, "tense_label": label, "forms": forms}


def single(group: str, label: str, forms: list[str]) -> dict[str, Any]:
    return {"type": "single", "group_label": group, "tense_label": label, "forms": forms}


def build_tenses(base: str) -> dict[str, Any]:
    past, past_participle, ing = principal_parts(base)

    if base == "be":
        present = ["am", "are", "is", "are", "are", "are"]
        past_simple = ["was", "were", "was", "were", "were", "were"]
    else:
        present = [base, base, third_person_singular(base), base, base, base]
        past_simple = [past] * 6

    present_be = ["am", "are", "is", "are", "are", "are"]
    past_be = ["was", "were", "was", "were", "were", "were"]
    present_have = ["have", "have", "has", "have", "have", "have"]

    return {
        "indicative_present_simple": tense("Indicative", "Present simple", person_forms(present)),
        "indicative_present_continuous": tense(
            "Indicative", "Present continuous", person_forms([f"{aux} {ing}" for aux in present_be])
        ),
        "indicative_present_perfect": tense(
            "Indicative", "Present perfect", person_forms([f"{aux} {past_participle}" for aux in present_have])
        ),
        "indicative_present_perfect_continuous": tense(
            "Indicative",
            "Present perfect continuous",
            person_forms([f"{aux} been {ing}" for aux in present_have]),
        ),
        "indicative_past_simple": tense("Indicative", "Past simple", person_forms(past_simple)),
        "indicative_past_continuous": tense(
            "Indicative", "Past continuous", person_forms([f"{aux} {ing}" for aux in past_be])
        ),
        "indicative_past_perfect": tense(
            "Indicative", "Past perfect", person_forms([f"had {past_participle}"] * 6)
        ),
        "indicative_past_perfect_continuous": tense(
            "Indicative", "Past perfect continuous", person_forms([f"had been {ing}"] * 6)
        ),
        "indicative_future_will_simple": tense(
            "Indicative", "Future will simple", person_forms([f"will {base}"] * 6)
        ),
        "indicative_future_will_continuous": tense(
            "Indicative", "Future will continuous", person_forms([f"will be {ing}"] * 6)
        ),
        "indicative_future_will_perfect": tense(
            "Indicative", "Future will perfect", person_forms([f"will have {past_participle}"] * 6)
        ),
        "indicative_future_will_perfect_continuous": tense(
            "Indicative", "Future will perfect continuous", person_forms([f"will have been {ing}"] * 6)
        ),
        "conditional_present": tense("Conditional", "Present", person_forms([f"would {base}"] * 6)),
        "conditional_continuous": tense("Conditional", "Continuous", person_forms([f"would be {ing}"] * 6)),
        "conditional_perfect": tense(
            "Conditional", "Perfect", person_forms([f"would have {past_participle}"] * 6)
        ),
        "conditional_perfect_continuous": tense(
            "Conditional", "Perfect continuous", person_forms([f"would have been {ing}"] * 6)
        ),
        "imperative": single("Imperative", "Imperative", [base]),
        "nonfinite_base": single("Non-finite", "Base / infinitive", [base]),
        "nonfinite_past": single("Non-finite", "Past", [past]),
        "nonfinite_past_participle": single("Non-finite", "Past participle", [past_participle]),
        "nonfinite_present_participle": single("Non-finite", "Present participle / gerund", [ing]),
    }


def select_verbs(vocab: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_word: dict[str, dict[str, Any]] = {}
    for entry in vocab:
        word = str(entry.get("english", "")).lower()
        if word not in by_word and (word in {"be", "have", "do"} or is_candidate(entry)):
            by_word[word] = entry

    def sort_key(item: tuple[str, dict[str, Any]]) -> tuple[float, int, str]:
        word, entry = item
        return (-english_frequency(word, int(entry.get("rank") or 999999)), int(entry.get("rank") or 999999), word)

    return [entry for _, entry in sorted(by_word.items(), key=sort_key)[:TARGET_COUNT]]


def build() -> list[dict[str, Any]]:
    vocab = load_js_array(VOCAB_PATH, "ENGLISH_VOCABULARY_DATA")
    selected = select_verbs(vocab)
    entries: list[dict[str, Any]] = []
    for rank, entry in enumerate(selected, start=1):
        base = str(entry["english"]).lower()
        entries.append(
            {
                "rank": rank,
                "infinitive": base,
                "frequency": english_frequency(base, int(entry.get("rank") or 999999)),
                "english": f"to {base}",
                "chinese": clean_gloss(str(entry.get("chinese") or entry.get("meaning") or "")),
                "tenses": build_tenses(base),
            }
        )
    return entries


def main() -> None:
    data = build()
    header = (
        "// Auto-generated by scripts/build_english_conjugations.py\n"
        f"// Source: data/english-vocabulary.js + wordfreq Zipf frequency; total entries: {len(data)}; "
        "schema mirrors data/conjugations-all-tenses.js\n"
    )
    OUT_PATH.write_text(
        header
        + "const ENGLISH_CONJUGATION_DATA = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(data)} entries to {OUT_PATH}")


if __name__ == "__main__":
    main()
