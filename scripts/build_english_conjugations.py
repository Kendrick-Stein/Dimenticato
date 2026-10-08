#!/usr/bin/env python3
"""Build English verb conjugation data for the static app.

The generated JS mirrors data/it-conjugations.js:
top-level const assignment with JSON entries, person tenses using object
forms, and non-finite / imperative forms using single array slots.

Candidate headwords and fallback glosses come from data/vocab/en.js (schema v1,
read via scripts/vocab_schema.py); the primary glosses from the ECDICT slice.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import vocab_schema  # noqa: E402  (data/vocab/en.js reader)
OUT_PATH = ROOT / "data" / "en-conjugations.js"
TARGET_COUNT = 1800

PEOPLE = ["i", "you", "he_she_it", "we", "you_pl", "they"]

from lemminflect import getAllInflections  # build-time only: pip install lemminflect
from data_module import register_footer

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

# lemminflect 的首选形式不合适时在这里改（past, past participle）
OVERRIDES: dict[str, tuple[str, str]] = {
    "quit": ("quit", "quit"),
}

# ECDICT 动词义项缺失或误导时手工给的中文释义
GLOSS_OVERRIDES: dict[str, str] = {}

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


ECDICT_PATH = ROOT / " english-data" / "english word" / "ecdict-slice.csv"
VERB_POS = {"v", "vt", "vi"}
POS_MARK = re.compile(r"\b(vt|vi|v|n|adj|a|adv|prep|conj|pron|art|int|num|aux|abbr)\.\s*")
# 不适合出现在学习材料里的词（语料频率很高，但不该进变位练习）
EXCLUDED = {"shit", "fuck", "piss", "screw", "bitch", "damn", "suck", "fart", "pee", "poop"}


def load_ecdict() -> dict[str, str]:
    if not ECDICT_PATH.exists():
        return {}
    with ECDICT_PATH.open(encoding="utf-8") as fh:
        reader = csv.reader(fh)
        next(reader, None)
        return {row[0].lower(): row[1].replace("\\n", "\n") for row in reader if len(row) >= 2}


def pos_segments(text: str) -> list[tuple[str, str]]:
    """把 "n.书,书籍 v.登记,预订" / ECDICT 分行格式切成 [(词性, 释义)]。"""
    text = re.sub(r"\[[^\]]*\][^\n]*", "", text)  # 去掉 [计] [医] 等专业释义
    marks = list(POS_MARK.finditer(text))
    out = []
    for i, m in enumerate(marks):
        body = text[m.end() : marks[i + 1].start() if i + 1 < len(marks) else len(text)]
        out.append((m.group(1).lower(), body.strip()))
    return out


def verb_gloss(text: str) -> str:
    """只取动词义项；没有动词义项返回空串（调用方据此判定不是动词）。"""
    parts: list[str] = []
    for pos, body in pos_segments(text):
        if pos not in VERB_POS:
            continue
        body = body.split("\n")[0]
        body = re.sub(r"[（(][^)）]*(过去|分词|第三人称|现在分词)[^)）]*[)）]", "", body)
        body = re.sub(r"\S*的(过去式|过去分词|现在分词|第三人称单数)\S*", "", body)
        for item in re.split(r"[,，;；]", body):
            item = re.sub(r"\([^)]*\)|<[^>]*>", "", item).strip()
            if item and item not in parts:
                parts.append(item)
    out = []
    for item in parts:
        if len("，".join(out + [item])) > 24:
            break
        out.append(item)
    return "，".join(out)


def english_frequency(word: str, rank: int) -> float:
    if zipf_frequency:
        return round(float(zipf_frequency(word, "en")), 4)
    return round(max(0.0, 7.0 - rank / 5000), 4)


def pick(forms: tuple[str, ...] | None) -> str | None:
    if not forms:
        return None
    clean = [f for f in forms if re.fullmatch(r"[a-z]+", f)]
    return clean[0] if clean else None


def inflections(base: str) -> dict[str, str] | None:
    """base 的 VBD / VBN / VBG / VBZ。手工 IRREGULARS 优先，其余交给 lemminflect。
    lemminflect 不认识的词（不是动词）返回 None。"""
    table = getAllInflections(base, upos="VERB")
    if not table or pick(table.get("VB")) != base:
        return None
    past = pick(table.get("VBD"))
    ing = pick(table.get("VBG"))
    third = pick(table.get("VBZ"))
    participle = pick(table.get("VBN")) or past
    if base in IRREGULARS:
        past, participle = IRREGULARS[base]
    elif base in OVERRIDES:
        past, participle = OVERRIDES[base]
    if not (past and participle and ing and third):
        return None
    return {"past": past, "participle": participle, "ing": ing, "third": third}


def verb_score(base: str, forms: dict[str, str]) -> float:
    """动词用法频率：只看 -ed / -ing / 过去分词这些「必然是动词」的形式
    （原形和 -s 与名词同形，会把 man / law 这类名词顶上来）。"""
    if not zipf_frequency:
        return 0.0
    # 取均值而不是求和：united / bit / felt 这类与形容词、名词同形的过去式
    # 单独很高频，求和会把 unite / bite 顶到前 40。
    distinct = {forms["past"], forms["participle"], forms["ing"]} - {base}
    if not distinct:
        return 0.0
    return sum(zipf_frequency(f, "en") for f in distinct) / len(distinct)


def person_forms(values: list[str]) -> dict[str, str]:
    return dict(zip(PEOPLE, values, strict=True))


def tense(group: str, label: str, forms: dict[str, str]) -> dict[str, Any]:
    return {"type": "person", "group_label": group, "tense_label": label, "forms": forms}


def single(group: str, label: str, forms: list[str]) -> dict[str, Any]:
    return {"type": "single", "group_label": group, "tense_label": label, "forms": forms}


def build_tenses(base: str, forms: dict[str, str]) -> dict[str, Any]:
    past, past_participle, ing = forms["past"], forms["participle"], forms["ing"]

    if base == "be":
        present = ["am", "are", "is", "are", "are", "are"]
        past_simple = ["was", "were", "was", "were", "were", "were"]
    else:
        present = [base, base, forms["third"], base, base, base]
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


MIN_VERB_SCORE = 2.0


# v1 part-of-speech names -> the ECDICT markers verb_gloss() understands
V1_POS_MARK = {"verb": "v", "noun": "n", "adjective": "adj", "adverb": "adv",
               "preposition": "prep", "conjunction": "conj", "pronoun": "pron",
               "article": "art", "interjection": "int", "numeral": "num",
               "abbreviation": "abbr"}


def pos_marked_gloss(entry: dict[str, Any]) -> str:
    """Rebuild an ECDICT-style "n.书 v.登记" gloss from a v1 entry.

    data/vocab/en.js splits the POS prefixes out of the Chinese gloss into
    `pos` / `posAll`, joining the per-POS senses of `zh` with "；".  Re-attach
    the markers when the sense count matches the POS list (always true for a
    single-POS entry), so verb_gloss() can keep only the verb senses.
    """
    zh = str(entry.get("zh") or "")
    pos_all = entry.get("posAll") or ([entry["pos"]] if entry.get("pos") else [])
    senses = zh.split("；") if len(pos_all) > 1 else [zh]
    if not pos_all or len(senses) != len(pos_all):
        return zh
    return " ".join(f"{V1_POS_MARK.get(p, '')}.{g}" if p in V1_POS_MARK else g
                    for p, g in zip(pos_all, senses))


def build() -> tuple[list[dict[str, Any]], list[str]]:
    vocab = vocab_schema.read_vocab("en")["entries"]
    ecdict = load_ecdict()
    candidates: dict[str, tuple[float, dict[str, str], str]] = {}
    rejected: list[str] = []
    for entry in vocab:
        base = str(entry.get("word", "")).lower()
        if base in candidates or base in MODAL_OR_DEFECTIVE or base in EXCLUDED:
            continue
        if not re.fullmatch(r"[a-z]+", base):
            continue
        forms = inflections(base)
        if not forms:
            continue
        gloss = verb_gloss(ecdict.get(base, "")) or verb_gloss(pos_marked_gloss(entry))
        if base in GLOSS_OVERRIDES:
            gloss = GLOSS_OVERRIDES[base]
        if not gloss:
            rejected.append(base)
            continue
        score = verb_score(base, forms)
        if score < MIN_VERB_SCORE and base not in {"be", "have", "do"}:
            continue
        candidates[base] = (score, forms, gloss)

    ordered = sorted(candidates.items(), key=lambda kv: (kv[0] not in {"be", "have", "do"}, -kv[1][0], kv[0]))
    entries: list[dict[str, Any]] = []
    for rank, (base, (score, forms, gloss)) in enumerate(ordered[:TARGET_COUNT], start=1):
        entries.append(
            {
                "rank": rank,
                "infinitive": base,
                "frequency": round(score, 4),
                "english": f"to {base}",
                "chinese": gloss,
                "tenses": build_tenses(base, forms),
            }
        )
    return entries, rejected


def main() -> None:
    data, rejected = build()
    header = (
        "// Auto-generated by scripts/build_english_conjugations.py\n"
        f"// Source: data/vocab/en.js headwords; forms: hand table + lemminflect (MIT); glosses: ECDICT verb senses; ranked by wordfreq Zipf of unambiguous verb forms; total entries: {len(data)}; "
        "schema mirrors data/it-conjugations.js\n"
    )
    OUT_PATH.write_text(
        header
        + "const ENGLISH_CONJUGATION_DATA = "
        + "[\n"
        # 一行一个动词：比 indent=2 小约 3 倍（这个文件按需懒加载，但仍要下载）
        + ",\n".join(json.dumps(e, ensure_ascii=False, separators=(",", ":")) for e in data)
        + "\n];\n"
        + register_footer("conjugations", "en", "ENGLISH_CONJUGATION_DATA"),
        encoding="utf-8",
    )
    print(f"Wrote {len(data)} entries to {OUT_PATH}")
    # 落盘的是旧（逐动词 forms 对象）形状；统一转成 conjugations/1（docs/data-schema.md）
    import canonical_conjugations
    canonical_conjugations.canonicalize("en")


if __name__ == "__main__":
    main()
