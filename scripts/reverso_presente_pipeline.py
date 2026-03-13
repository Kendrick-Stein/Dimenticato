#!/usr/bin/env python3
"""
抓取 Reverso 高频意大利语动词，并构建多时态变位词库。

核心输出：
1) data/reverso_high_frequency_verbs.json
2) data/conjugations-all-tenses.json
3) data/conjugations-all-tenses.js
4) data/conjugations-all-tenses-failures.json

兼容输出（仅 Presente）：
5) data/conjugations-presente.json
6) data/conjugations-presente.js
7) data/conjugations-presente-failures.json
"""

from __future__ import annotations

import argparse
import json
import random
import re
import time
import unicodedata
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup


BASE = "https://conjugator.reverso.net"
INDEX_PAGES = [
    "index-italian-1-250.html",
    "index-italian-251-500.html",
    "index-italian-501-750.html",
    "index-italian-751-1000.html",
    "index-italian-1001-1250.html",
    "index-italian-1251-1500.html",
    "index-italian-1501-1750.html",
    "index-italian-1751-2000.html",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

PRONOUN_MAP = {
    "io": "io",
    "tu": "tu",
    "lei/lui": "lui_lei",
    "lui/lei": "lui_lei",
    "lui": "lui_lei",
    "lei": "lui_lei",
    "noi": "noi",
    "voi": "voi",
    "loro": "loro",
}


def fetch_html(
    url: str,
    timeout: int = 20,
    retries: int = 6,
    backoff_base: float = 1.5,
) -> str:
    last_error = None
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=timeout)
            if resp.status_code in (429, 503):
                wait = backoff_base * (2 ** attempt) + random.uniform(0.2, 1.0)
                print(f"[retry] {resp.status_code} for {url} -> sleep {wait:.1f}s")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            last_error = e
            if attempt < retries - 1:
                wait = backoff_base * (2 ** attempt) + random.uniform(0.2, 1.0)
                print(f"[retry] error for {url} -> {e} -> sleep {wait:.1f}s")
                time.sleep(wait)
                continue
            raise
    raise RuntimeError(f"Failed to fetch {url}: {last_error}")


def extract_verbs_from_index(html: str) -> List[str]:
    # href 类似：conjugation-italian-verb-essere.html
    matches = re.findall(
        r"conjugation-italian-verb-([^\"\'?&#/]+)\.html",
        html,
        flags=re.IGNORECASE,
    )
    verbs: List[str] = []
    seen = set()
    for raw in matches:
        verb = raw.strip().lower()
        if not verb or verb in seen:
            continue
        seen.add(verb)
        verbs.append(verb)
    return verbs


def parse_presente_from_verb_page(html: str) -> Optional[Dict[str, str]]:
    soup = BeautifulSoup(html, "html.parser")

    # 先锁定 Indicativo 区块
    for row in soup.select(".result-block-api .word-wrap-row"):
        title = row.select_one(".word-wrap-title h4")
        if not title:
            continue
        if "indicativo" not in title.get_text(" ", strip=True).lower():
            continue

        # 在 Indicativo 下找 Presente
        for box in row.select(".blue-box-wrap"):
            tense_tag = box.find("p")
            if not tense_tag:
                continue
            tense = tense_tag.get_text(" ", strip=True).lower()
            if tense != "presente":
                continue

            forms: Dict[str, str] = {}
            for li in box.select("li"):
                p = li.select_one(".graytxt")
                v = li.select_one(".verbtxt")
                if not p or not v:
                    continue
                pronoun = p.get_text(" ", strip=True).lower()
                pronoun = re.sub(r"\s+", " ", pronoun)
                mapped = PRONOUN_MAP.get(pronoun)
                if not mapped:
                    continue
                forms[mapped] = v.get_text(" ", strip=True)

            required = ["io", "tu", "lui_lei", "noi", "voi", "loro"]
            if all(k in forms and forms[k] for k in required):
                return {k: forms[k] for k in required}

    return None


def normalize_key(raw: str) -> str:
    text = (raw or "").strip().lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-z0-9]+", "_", text)
    text = re.sub(r"_+", "_", text).strip("_")
    return text


def parse_all_tenses_from_verb_page(html: str) -> Dict[str, dict]:
    soup = BeautifulSoup(html, "html.parser")
    result: Dict[str, dict] = {}

    for row in soup.select(".result-block-api .word-wrap-row"):
        title = row.select_one(".word-wrap-title h4")
        if not title:
            continue

        section_label = title.get_text(" ", strip=True)
        section_key = normalize_key(section_label)
        if not section_key:
            continue

        for box in row.select(".blue-box-wrap"):
            tense_tag = box.find("p")
            if not tense_tag:
                continue

            tense_label = tense_tag.get_text(" ", strip=True)
            tense_key = normalize_key(tense_label)
            if not tense_key:
                continue

            full_key = f"{section_key}_{tense_key}"
            person_forms: Dict[str, str] = {}
            single_forms: List[str] = []

            for li in box.select("li"):
                p = li.select_one(".graytxt")
                v = li.select_one(".verbtxt")

                value = ""
                if v:
                    value = v.get_text(" ", strip=True)
                elif li.get_text(" ", strip=True):
                    value = li.get_text(" ", strip=True)
                value = re.sub(r"\s+", " ", value).strip()

                if not value:
                    continue

                pronoun = ""
                if p:
                    pronoun = re.sub(r"\s+", " ", p.get_text(" ", strip=True).lower()).strip()
                mapped = PRONOUN_MAP.get(pronoun) if pronoun else None

                if mapped:
                    person_forms[mapped] = value
                else:
                    single_forms.append(value)

            if person_forms:
                result[full_key] = {
                    "type": "person",
                    "group_label": section_label,
                    "tense_label": tense_label,
                    "forms": person_forms,
                }
                continue

            unique_single = []
            seen = set()
            for form in single_forms:
                key = normalize_key(form)
                if not key or key in seen:
                    continue
                seen.add(key)
                unique_single.append(form)

            if unique_single:
                result[full_key] = {
                    "type": "single",
                    "group_label": section_label,
                    "tense_label": tense_label,
                    "forms": unique_single,
                }

    return result


def collect_high_frequency_verbs() -> List[str]:
    all_verbs: List[str] = []
    seen = set()

    for page in INDEX_PAGES:
        url = f"{BASE}/{page}"
        html = fetch_html(url)
        verbs = extract_verbs_from_index(html)
        for v in verbs:
            if v not in seen:
                seen.add(v)
                all_verbs.append(v)
        print(f"[index] {page}: +{len(verbs)} verbs, total={len(all_verbs)}")

    return all_verbs


def build_all_tenses_lexicon(
    verbs: List[str],
    sleep: float = 0.35,
    resume_records: Optional[List[dict]] = None,
    resume_failures: Optional[List[dict]] = None,
    max_verbs: Optional[int] = None,
    checkpoint_interval: int = 50,
) -> Tuple[List[dict], List[dict]]:
    records: List[dict] = list(resume_records or [])
    failures: List[dict] = list(resume_failures or [])

    existing_ok = {r.get("infinitive") for r in records}
    existing_failed = {f.get("infinitive") for f in failures}

    total = len(verbs)
    processed = 0
    for i, verb in enumerate(verbs, start=1):
        if verb in existing_ok:
            continue
        if max_verbs is not None and processed >= max_verbs:
            break

        # 失败项允许重试：先移除旧失败记录
        if verb in existing_failed:
            failures = [f for f in failures if f.get("infinitive") != verb]

        url = f"{BASE}/conjugation-italian-verb-{verb}.html"
        try:
            html = fetch_html(url)
            tenses = parse_all_tenses_from_verb_page(html)
            if not tenses:
                failures.append({"rank": i, "infinitive": verb, "reason": "tenses_not_found"})
            else:
                records.append(
                    {
                        "rank": i,
                        "infinitive": verb,
                        "tenses": tenses,
                    }
                )
        except Exception as e:
            failures.append({"rank": i, "infinitive": verb, "reason": str(e)})

        processed += 1

        if i % 50 == 0 or i == total:
            print(
                f"[conjugation] rank={i}/{total}, "
                f"processed_now={processed}, ok={len(records)}, failed={len(failures)}"
            )

        # 定期落盘，避免长任务被中断后进度丢失
        if checkpoint_interval > 0 and processed > 0 and processed % checkpoint_interval == 0:
            print(f"[checkpoint] processed_now={processed}, saving outputs...")
            write_outputs(verbs, records, failures)

        if sleep > 0:
            time.sleep(sleep + random.uniform(0.0, 0.2))

    return records, failures


def write_outputs(verbs: List[str], records: List[dict], failures: List[dict]) -> None:
    data_dir = Path(__file__).resolve().parents[1] / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    verbs_path = data_dir / "reverso_high_frequency_verbs.json"
    conj_all_json_path = data_dir / "conjugations-all-tenses.json"
    conj_all_js_path = data_dir / "conjugations-all-tenses.js"
    failures_all_path = data_dir / "conjugations-all-tenses-failures.json"

    conj_presente_json_path = data_dir / "conjugations-presente.json"
    conj_presente_js_path = data_dir / "conjugations-presente.js"
    failures_presente_path = data_dir / "conjugations-presente-failures.json"

    verbs_payload = [
        {"rank": idx + 1, "infinitive": v}
        for idx, v in enumerate(verbs)
    ]

    with verbs_path.open("w", encoding="utf-8") as f:
        json.dump(verbs_payload, f, ensure_ascii=False, indent=2)

    with conj_all_json_path.open("w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    js_content = "// Auto-generated by scripts/reverso_presente_pipeline.py\n"
    js_content += "const CONJUGATION_ALL_TENSES_DATA = "
    js_content += json.dumps(records, ensure_ascii=False)
    js_content += ";\n"
    with conj_all_js_path.open("w", encoding="utf-8") as f:
        f.write(js_content)

    with failures_all_path.open("w", encoding="utf-8") as f:
        json.dump(failures, f, ensure_ascii=False, indent=2)

    # 兼容旧版 Presente-only 数据
    presente_records: List[dict] = []
    for row in records:
        tenses = row.get("tenses") or {}
        pres = tenses.get("indicativo_presente")
        if not isinstance(pres, dict):
            continue
        if pres.get("type") != "person":
            continue
        forms = pres.get("forms") or {}
        required = ["io", "tu", "lui_lei", "noi", "voi", "loro"]
        if not all(forms.get(k) for k in required):
            continue
        presente_records.append(
            {
                "rank": row.get("rank"),
                "infinitive": row.get("infinitive"),
                "presente": {k: forms.get(k, "") for k in required},
            }
        )

    with conj_presente_json_path.open("w", encoding="utf-8") as f:
        json.dump(presente_records, f, ensure_ascii=False, indent=2)

    js_presente = "// Auto-generated by scripts/reverso_presente_pipeline.py\n"
    js_presente += "const CONJUGATION_PRESENTE_DATA = "
    js_presente += json.dumps(presente_records, ensure_ascii=False)
    js_presente += ";\n"
    with conj_presente_js_path.open("w", encoding="utf-8") as f:
        f.write(js_presente)

    with failures_presente_path.open("w", encoding="utf-8") as f:
        json.dump(failures, f, ensure_ascii=False, indent=2)

    print(f"[write] {verbs_path}")
    print(f"[write] {conj_all_json_path}")
    print(f"[write] {conj_all_js_path}")
    print(f"[write] {failures_all_path}")
    print(f"[write] {conj_presente_json_path}")
    print(f"[write] {conj_presente_js_path}")
    print(f"[write] {failures_presente_path}")


def load_json_if_exists(path: Path, default):
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return default


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Italian all-tenses conjugation lexicon from Reverso")
    parser.add_argument("--sleep", type=float, default=0.35, help="sleep between verb page requests")
    parser.add_argument("--max", type=int, default=None, help="only process at most N verbs in this run")
    parser.add_argument("--resume", action="store_true", help="resume from existing output files")
    parser.add_argument(
        "--checkpoint-interval",
        type=int,
        default=50,
        help="save outputs every N processed verbs",
    )
    args = parser.parse_args()

    data_dir = Path(__file__).resolve().parents[1] / "data"
    conj_json_path = data_dir / "conjugations-all-tenses.json"
    failures_path = data_dir / "conjugations-all-tenses-failures.json"

    resume_records = []
    resume_failures = []
    if args.resume:
        resume_records = load_json_if_exists(conj_json_path, [])
        resume_failures = load_json_if_exists(failures_path, [])
        print(f"[resume] loaded ok={len(resume_records)}, failed={len(resume_failures)}")

    print("Step 1/3: collect high-frequency verbs from Reverso index pages...")
    verbs = collect_high_frequency_verbs()
    print(f"Collected {len(verbs)} unique verbs")

    print("Step 2/3: fetch each verb page and parse all available tenses...")
    records, failures = build_all_tenses_lexicon(
        verbs,
        sleep=args.sleep,
        resume_records=resume_records,
        resume_failures=resume_failures,
        max_verbs=args.max,
        checkpoint_interval=args.checkpoint_interval,
    )
    print(f"Parsed tenses: ok={len(records)}, failed={len(failures)}")

    print("Step 3/3: write outputs...")
    write_outputs(verbs, records, failures)
    print("Done.")


if __name__ == "__main__":
    main()
