#!/usr/bin/env python3
"""
基于 it_50k.txt 构建意大利语动词原形频率表，并使用 mlconjug3 生成多时态变位数据。

输出：
1) data/it50k-verb-lemmas.json
2) data/conjugations-all-tenses.json
3) data/conjugations-all-tenses.js
4) data/conjugations-all-tenses-failures.json
5) data/conjugations-presente.json
6) data/conjugations-presente.js
7) data/conjugations-presente-failures.json
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import OrderedDict
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import mlconjug3
import stanza


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
IT50K_PATH = ROOT / "it_50k.txt"
VOCAB_PATH = ROOT / "vocabulary.js"
VALID_INFINITIVE_SUFFIXES = ("are", "ere", "ire", "rre")
KNOWN_GOOD_LEMMAS = {
    "essere", "avere", "fare", "dire", "bere", "porre", "trarre", "urre",
}

PERSON_MAP = {
    "io": "io",
    "tu": "tu",
    "egli/ella": "lui_lei",
    "lui/lei": "lui_lei",
    "lei/lui": "lui_lei",
    "lui": "lui_lei",
    "lei": "lui_lei",
    "noi": "noi",
    "voi": "voi",
    "essi/esse": "loro",
    "essi": "loro",
    "esse": "loro",
    "loro": "loro",
}

TENSE_KEY_MAP = {
    ("indicativo", "indicativo presente"): "indicativo_presente",
    ("indicativo", "indicativo imperfetto"): "indicativo_imperfetto",
    ("indicativo", "indicativo passato remoto"): "indicativo_passato_remoto",
    ("indicativo", "indicativo futuro semplice"): "indicativo_futuro_semplice",
    ("indicativo", "indicativo passato prossimo"): "indicativo_passato_prossimo",
    ("indicativo", "indicativo trapassato prossimo"): "indicativo_trapassato_prossimo",
    ("indicativo", "indicativo trapassato remoto"): "indicativo_trapassato_remoto",
    ("indicativo", "indicativo futuro anteriore"): "indicativo_futuro_anteriore",
    ("congiuntivo", "congiuntivo presente"): "congiuntivo_presente",
    ("congiuntivo", "congiuntivo imperfetto"): "congiuntivo_imperfetto",
    ("congiuntivo", "congiuntivo passato"): "congiuntivo_passato",
    ("congiuntivo", "congiuntivo trapassato"): "congiuntivo_trapassato",
    ("condizionale", "condizionale presente"): "condizionale_presente",
    ("condizionale", "condizionale passato"): "condizionale_passato",
    ("imperativo", "imperativo presente"): "imperativo_presente",
    ("infinito", "infinito presente"): "infinito_presente",
    ("infinito", "infinito passato"): "infinito_passato",
    ("participio", "participio presente"): "participio_presente",
    ("participio", "participio passato"): "participio_passato",
}

GROUP_LABEL_MAP = {
    "indicativo": "Indicativo",
    "congiuntivo": "Congiuntivo",
    "condizionale": "Condizionale",
    "imperativo": "Imperativo",
    "infinito": "Infinito",
    "participio": "Participio",
}

TENSE_LABEL_MAP = {
    "presente": "Presente",
    "imperfetto": "Imperfetto",
    "passato remoto": "Passato remoto",
    "futuro semplice": "Futuro semplice",
    "passato prossimo": "Passato prossimo",
    "trapassato prossimo": "Trapassato prossimo",
    "trapassato remoto": "Trapassato remoto",
    "futuro anteriore": "Futuro anteriore",
    "passato": "Passato",
}


def normalize_text(value: str) -> str:
    text = (value or "").strip().lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", text)


def unique_list(items: Iterable[str]) -> List[str]:
    result: List[str] = []
    seen = set()
    for item in items:
        cleaned = re.sub(r"\s+", " ", str(item or "")).strip()
        if not cleaned:
            continue
        key = normalize_text(cleaned)
        if key in seen:
            continue
        seen.add(key)
        result.append(cleaned)
    return result


def is_likely_infinitive(lemma: str) -> bool:
    lemma = normalize_text(lemma)
    if not lemma or len(lemma) < 4:
        return False
    if not re.fullmatch(r"[a-z]+", lemma):
        return False
    if lemma in KNOWN_GOOD_LEMMAS:
        return True
    return lemma.endswith(VALID_INFINITIVE_SUFFIXES)


def load_vocabulary_lookup() -> Dict[str, dict]:
    text = VOCAB_PATH.read_text(encoding="utf-8")
    marker = "const VOCABULARY_DATA ="
    start = text.find(marker)
    if start == -1:
        raise RuntimeError("VOCABULARY_DATA not found in vocabulary.js")
    export_marker = "\n\n// Export for use in app.js"
    end = text.find(export_marker, start)
    if end == -1:
        raise RuntimeError("VOCABULARY_DATA export marker not found")

    payload = text[start + len(marker):end].strip()
    if payload.endswith(";"):
        payload = payload[:-1].strip()
    data = json.loads(payload)

    lookup: Dict[str, dict] = {}
    for row in data:
        italian = normalize_text(row.get("italian", ""))
        if not italian:
            continue
        if italian not in lookup:
            lookup[italian] = row
    return lookup


def vocab_entry_is_verb(entry: dict | None) -> bool:
    if not entry:
        return False
    dictionary = normalize_text(entry.get("dictionary", ""))
    english = normalize_text(entry.get("english", ""))
    if " verb " in f" {dictionary} ":
        return True
    if english.startswith("to "):
        return True
    return False


def iter_it50k_rows() -> Iterable[Tuple[str, int]]:
    with IT50K_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            raw = line.strip()
            if not raw:
                continue
            parts = raw.rsplit(" ", 1)
            if len(parts) != 2:
                continue
            token, freq_raw = parts
            try:
                freq = int(freq_raw)
            except ValueError:
                continue
            yield token.strip(), freq


def build_stanza_pipeline() -> stanza.Pipeline:
    return stanza.Pipeline(
        "it",
        processors="tokenize,pos,lemma",
        tokenize_no_ssplit=True,
        use_gpu=False,
        verbose=False,
    )


def extract_verb_lemmas(vocab_lookup: Dict[str, dict], batch_size: int = 400) -> List[dict]:
    nlp = build_stanza_pipeline()
    aggregate: Dict[str, dict] = {}

    # 这里不用批量拼接文本的方式，因为 it_50k 中存在大量带省音符/标点的 token
    # （如 l'、dell'、复合写法等），Stanza 可能把一个 token 切成多个词，导致无法和词频表稳定对齐。
    # 为了保证“词形 -> 原形”的映射正确性，这里逐 token 分析。
    for token, freq in iter_it50k_rows():
        doc = nlp(token)
        words = [w for s in doc.sentences for w in s.words]
        if not words:
            continue

        for word in words:
            if word.upos not in {"VERB", "AUX"}:
                continue
            lemma = normalize_text(word.lemma or word.text)
            if not lemma:
                continue
            row = aggregate.setdefault(
                lemma,
                {
                    "infinitive": lemma,
                    "frequency": 0,
                    "forms_count": 0,
                    "source_forms": [],
                },
            )
            row["frequency"] += freq
            row["forms_count"] += 1
            row["source_forms"].append(token)

    result = []
    for idx, row in enumerate(
        sorted(aggregate.values(), key=lambda x: (-x["frequency"], x["infinitive"])),
        start=1,
    ):
        lemma = row["infinitive"]
        vocab_entry = vocab_lookup.get(lemma)
        if not is_likely_infinitive(lemma):
            continue
        if vocab_entry and not vocab_entry_is_verb(vocab_entry) and row["forms_count"] < 8:
            continue
        if not vocab_entry and row["forms_count"] < 5:
            continue
        result.append(
            {
                "rank": len(result) + 1,
                "infinitive": lemma,
                "frequency": row["frequency"],
                "forms_count": row["forms_count"],
                "source_forms": unique_list(row["source_forms"])[:30],
            }
        )
    return result


def map_tense_labels(group_label: str, tense_label: str) -> Tuple[str, str, str]:
    group_norm = normalize_text(group_label)
    tense_norm = normalize_text(tense_label)
    key = TENSE_KEY_MAP.get((group_norm, tense_norm))
    if not key:
        group_key = re.sub(r"[^a-z0-9]+", "_", group_norm).strip("_")
        tense_key = re.sub(r"[^a-z0-9]+", "_", tense_norm.replace(group_norm, "")).strip("_")
        key = f"{group_key}_{tense_key}" if tense_key else group_key

    short_tense = tense_norm.replace(group_norm, "").strip() or tense_norm
    pretty_group = GROUP_LABEL_MAP.get(group_norm, group_label.title())
    pretty_tense = TENSE_LABEL_MAP.get(short_tense, tense_label.replace(group_label, "").strip().title() or tense_label.title())
    return key, pretty_group, pretty_tense


def convert_mlconjug_verb(conjugated) -> Dict[str, dict]:
    output: Dict[str, dict] = OrderedDict()
    for mood_label, tense_map in conjugated.full_forms.items():
        for tense_label, forms in tense_map.items():
            full_key, group_label, pretty_tense = map_tense_labels(mood_label, tense_label)
            person_forms: Dict[str, str] = OrderedDict()
            single_forms: List[str] = []

            for raw_subject, raw_form in forms.items():
                subject = normalize_text(str(raw_subject))
                mapped = PERSON_MAP.get(subject)
                if mapped:
                    person_forms[mapped] = re.sub(r"\s+", " ", str(raw_form)).strip()
                else:
                    single_forms.append(str(raw_form))

            if person_forms:
                output[full_key] = {
                    "type": "person",
                    "group_label": group_label,
                    "tense_label": pretty_tense,
                    "forms": person_forms,
                }
            else:
                cleaned_single = unique_list(single_forms)
                if cleaned_single:
                    output[full_key] = {
                        "type": "single",
                        "group_label": group_label,
                        "tense_label": pretty_tense,
                        "forms": cleaned_single,
                    }

    return output


def build_english(lemma: str, vocab_lookup: Dict[str, dict]) -> str:
    row = vocab_lookup.get(normalize_text(lemma))
    if not row:
        return ""
    if not vocab_entry_is_verb(row):
        return ""
    english = (row.get("english") or "").strip()
    dictionary = (row.get("dictionary") or "").strip()
    if english:
        lower = english.lower()
        if lower.startswith("to "):
            return english
        if dictionary and " verb " in f" {dictionary.lower()} ":
            cleaned = re.sub(r"[\.。,;:]+$", "", english).strip()
            return f"to {cleaned.lower()}"
        return english
    return ""


def build_conjugation_records(lemmas: List[dict], vocab_lookup: Dict[str, dict], max_verbs: int | None = None) -> Tuple[List[dict], List[dict]]:
    conjugator = mlconjug3.Conjugator(language="it")
    records: List[dict] = []
    failures: List[dict] = []

    source = lemmas[: max_verbs or len(lemmas)]
    for row in source:
        lemma = row["infinitive"]
        try:
            verb = conjugator.conjugate(lemma)
            tenses = convert_mlconjug_verb(verb)
            if not tenses:
                failures.append({"rank": row["rank"], "infinitive": lemma, "reason": "empty_tenses"})
                continue
            records.append(
                {
                    "rank": row["rank"],
                    "infinitive": lemma,
                    "frequency": row["frequency"],
                    "english": build_english(lemma, vocab_lookup),
                    "tenses": tenses,
                }
            )
        except Exception as exc:
            failures.append({"rank": row["rank"], "infinitive": lemma, "reason": str(exc)})

    return records, failures


def build_presente_records(records: List[dict]) -> List[dict]:
    required = ["io", "tu", "lui_lei", "noi", "voi", "loro"]
    out: List[dict] = []
    for row in records:
        tense = (row.get("tenses") or {}).get("indicativo_presente")
        if not isinstance(tense, dict) or tense.get("type") != "person":
            continue
        forms = tense.get("forms") or {}
        if not all(forms.get(k) for k in required):
            continue
        out.append(
            {
                "rank": row.get("rank"),
                "infinitive": row.get("infinitive"),
                "frequency": row.get("frequency", 0),
                "english": row.get("english", ""),
                "presente": {k: forms[k] for k in required},
            }
        )
    return out


def write_js_constant(path: Path, const_name: str, payload: List[dict]) -> None:
    content = f"// Auto-generated by scripts/build_it50k_conjugations.py\nconst {const_name} = "
    content += json.dumps(payload, ensure_ascii=False)
    content += ";\n"
    path.write_text(content, encoding="utf-8")


def write_outputs(lemmas: List[dict], records: List[dict], failures: List[dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    lemma_path = DATA_DIR / "it50k-verb-lemmas.json"
    all_json_path = DATA_DIR / "conjugations-all-tenses.json"
    all_js_path = DATA_DIR / "conjugations-all-tenses.js"
    all_fail_path = DATA_DIR / "conjugations-all-tenses-failures.json"

    pres_json_path = DATA_DIR / "conjugations-presente.json"
    pres_js_path = DATA_DIR / "conjugations-presente.js"
    pres_fail_path = DATA_DIR / "conjugations-presente-failures.json"

    presente = build_presente_records(records)

    lemma_path.write_text(json.dumps(lemmas, ensure_ascii=False, indent=2), encoding="utf-8")
    all_json_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    all_fail_path.write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8")
    pres_json_path.write_text(json.dumps(presente, ensure_ascii=False, indent=2), encoding="utf-8")
    pres_fail_path.write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8")

    write_js_constant(all_js_path, "CONJUGATION_ALL_TENSES_DATA", records)
    write_js_constant(pres_js_path, "CONJUGATION_PRESENTE_DATA", presente)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Italian conjugation data from it_50k.txt")
    parser.add_argument("--max-verbs", type=int, default=None, help="Only generate the first N verbs")
    parser.add_argument("--batch-size", type=int, default=400, help="Stanza batch size")
    args = parser.parse_args()

    vocab_lookup = load_vocabulary_lookup()
    lemmas = extract_verb_lemmas(vocab_lookup, batch_size=args.batch_size)
    records, failures = build_conjugation_records(lemmas, vocab_lookup, max_verbs=args.max_verbs)
    write_outputs(lemmas, records, failures)

    print(f"Verb lemmas: {len(lemmas)}")
    print(f"Conjugation records: {len(records)}")
    print(f"Failures: {len(failures)}")


if __name__ == "__main__":
    main()