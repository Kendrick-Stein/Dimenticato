#!/usr/bin/env python3
"""Build the German verb conjugation dataset (data/german-conjugations.js).

Rewritten 2026-08 to fix three confirmed audit defects and to scale the dataset
towards Italian parity:

  * de-konjunktiv2-always-wuerde  — Konjunktiv II was ``würde + Infinitiv`` for
    300/300 verbs.  Real synthetic forms (wäre, hätte, könnte, müsste, wüsste,
    ginge, käme, gäbe, nähme, bliebe, brächte, dächte, ließe …) now come from a
    real lexicon, and the würde-periphrasis is only used where a native speaker
    would actually use it.  ``konjunktiv_ii_perfekt`` is now
    ``hätte/wäre + Partizip II`` instead of ``würde … sein``.
  * de-imperative-derivation-bugs — imperatives are no longer derived by
    stripping ``-st`` off a conjugated present form (which produced ``fähr``,
    ``is``, ``mus``, ``lie``, ``vergis``).  They are read from the lexicon, so
    a→ä verbs keep the plain stem (fahr/fahre) and e→i/ie verbs keep the vowel
    change (iss, lies, vergiss, hilf, nimm).  Modal verbs get no Imperativ.
  * de-conjugation-no-separables  — separable-prefix verbs are now first-class
    citizens.  Main-clause forms keep the Satzklammer (``stehe … auf``), a new
    ``indikativ_praesens_nebensatz`` slot carries the joined subordinate-clause
    forms (``aufstehe``), and ``zu_infinitiv``/``partizip_ii`` are the joined
    ``aufzustehen`` / ``aufgestanden``.

Sources (all open; recorded per entry in the ``source`` field):
  * en.wiktionary.org German verb conjugation tables, extracted by wiktextract
    and published as kaikki.org's ``German by-pos-verb`` JSONL — CC BY-SA 4.0.
    This is the authoritative source for every simple finite form, the
    imperative, the participles, the auxiliary and the verb class.
  * german-pos-dict (LanguageTool; Morphy + korrekturen.de) via the
    ``german-verbs-dict`` npm package — CC BY-SA 4.0.  Used only as an
    independent cross-check of Präteritum and Partizip II.
  * wordfreq (MIT, Exquisite Corpus: OpenSubtitles/Wikipedia/news/…) for the
    corpus frequency that produces ``rank``.
  * data/german-vocabulary.js for the Chinese glosses, with an English→Chinese
    pivot through data/english-vocabulary.js (ECDICT-derived) as a fallback.

Downloads are cached under /tmp and are never committed.
"""

from __future__ import annotations

import json
import math
import re
import sys
import tarfile
import urllib.request
from collections import OrderedDict
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "data" / "german-conjugations.js"
DE_VOCAB_PATH = ROOT / "data" / "german-vocabulary.js"
EN_VOCAB_PATH = ROOT / "data" / "english-vocabulary.js"

CACHE = Path("/tmp/dimenticato-de-conj")
KAIKKI_URL = (
    "https://kaikki.org/dictionary/German/pos-verb/"
    "kaikki.org-dictionary-German-by-pos-verb.jsonl"
)
KAIKKI_PATH = CACHE / "kaikki-de-verb.jsonl"
GVD_URL = "https://registry.npmjs.org/german-verbs-dict/-/german-verbs-dict-3.4.0.tgz"
GVD_TGZ = CACHE / "german-verbs-dict-3.4.0.tgz"
GVD_JSON = CACHE / "german-verbs-dict" / "package" / "dist" / "verbs.json"

TARGET_COUNT = 1800
SEPARABLE_TARGET = 300

SOURCE_NOTE = (
    "en.wiktionary/wiktextract (kaikki.org, CC BY-SA 4.0); "
    "cross-checked german-pos-dict (CC BY-SA 4.0); rank: wordfreq (MIT)"
)

PERSONS = ["ich", "du", "er_sie_es", "wir", "ihr", "sie"]

# German modal verbs have no imperative at all (audit: de-imperative-derivation-bugs).
MODALS = {"können", "müssen", "dürfen", "mögen", "wollen", "sollen"}

# Verbs whose synthetic Konjunktiv II is the ONLY idiomatic form — "würde sein",
# "würde können", "würde wissen" are not German.  sollen/wollen are included even
# though their Konjunktiv II is homophonous with the Präteritum, because
# "würde sollen"/"würde wollen" is not used either.
FORCE_SYNTHETIC_KII = {
    "sein",
    "haben",
    "werden",
    "wissen",
    "können",
    "müssen",
    "dürfen",
    "mögen",
    "wollen",
    "sollen",
}

# Verbs the audit explicitly requires to be present.
MANDATORY = [
    "sein", "haben", "werden", "können", "müssen", "dürfen", "wollen", "sollen",
    "mögen", "wissen", "gehen", "kommen", "bleiben", "denken", "schreiben",
    "arbeiten", "antworten", "schließen", "fahren", "laufen", "tragen",
    "schlafen", "fallen", "lassen", "essen", "lesen", "vergessen", "sprechen",
    "helfen", "geben", "nehmen", "sehen", "empfehlen", "bringen", "stehen",
    "tun", "finden", "halten", "heißen", "sitzen", "liegen", "treffen",
    "sterben", "werfen", "lernen", "spielen", "machen", "sagen", "brauchen",
    # separable core (A1–B1)
    "aufstehen", "anfangen", "einkaufen", "mitkommen", "ankommen", "aufhören",
    "abholen", "vorstellen", "teilnehmen", "zurückkommen", "anrufen",
    "aussehen", "einladen", "mitbringen", "fernsehen", "anziehen", "ausziehen",
    "umsteigen", "stattfinden", "aufmachen", "zumachen", "einsteigen",
    "aussteigen", "abfahren", "abgeben", "vorbereiten", "wegfahren",
    "zuhören", "anbieten", "aufpassen",
    # Carried over from the 300-verb dataset this file replaces: they sit just
    # below the frequency cut-off, and dropping a verb the app already taught
    # would be a regression.
    "rahmen", "grenzen", "langen", "heiligen", "schmerzen", "überprüfen",
    "tränen", "wetten", "wurzeln",
]

# Homographs whose verb reading is marginal but whose surface form is a very
# common non-verb ("einen" = accusative article, "sondern" = conjunction …).
# Frequency is computed from the inflected paradigm precisely so these do not
# get inflated ranks, but a few need an explicit veto.
BLOCKED_LEMMAS = {"einen", "sondern", "wegen", "gegen", "eigen", "neben"}

SEPARABLE_PREFIXES = (
    "ab", "an", "auf", "aus", "bei", "durch", "ein", "empor", "entgegen",
    "entlang", "fern", "fest", "fort", "gegenüber", "her", "herab", "heran",
    "herauf", "heraus", "herbei", "herein", "herüber", "herum", "herunter",
    "hervor", "hin", "hinab", "hinauf", "hinaus", "hinein", "hinter", "hinüber",
    "hinunter", "hinzu", "los", "mit", "nach", "nieder", "statt", "teil",
    "über", "um", "unter", "vor", "voran", "vorbei", "vorüber", "weg", "weiter",
    "wieder", "zu", "zurecht", "zurück", "zusammen",
)

PLACEHOLDER_GLOSSES = {"", "-", "—", "???", "todo", "n/a", "na", "none", "null"}


# --------------------------------------------------------------------------- #
# small helpers
# --------------------------------------------------------------------------- #
def log(msg: str) -> None:
    print(msg, file=sys.stderr)


def download(url: str, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    log(f"downloading {url} -> {dest}")
    with urllib.request.urlopen(url) as response, open(dest, "wb") as handle:
        while True:
            chunk = response.read(1 << 20)
            if not chunk:
                break
            handle.write(chunk)
    return dest


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


def ss_normalize(text: str) -> str:
    """Orthography-insensitive key: old ``ß`` vs reformed ``ss``."""
    return text.replace("ß", "ss").lower()


def dedupe(values: Iterable[str]) -> list[str]:
    out: list[str] = []
    for value in values:
        value = re.sub(r"\s+", " ", (value or "")).strip()
        if value and value not in out:
            out.append(value)
    return out


# --------------------------------------------------------------------------- #
# kaikki (wiktextract) extraction
# --------------------------------------------------------------------------- #
PERSON_BY_TAGS = (
    (("first-person", "singular"), "ich"),
    (("second-person", "singular"), "du"),
    (("third-person", "singular"), "er_sie_es"),
    (("first-person", "plural"), "wir"),
    (("second-person", "plural"), "ihr"),
    (("third-person", "plural"), "sie"),
)

SKIP_SENSE_RE = re.compile(
    r"(standard spelling of|alternative (spelling|form) of|obsolete (spelling|form)"
    r"|superseded spelling|misspelling of|archaic (spelling|form) of"
    r"|pre-1996 spelling|dated spelling|eye dialect)",
    re.I,
)

DIALECT_TAGS = {
    "Switzerland", "Liechtenstein", "Austria", "colloquial", "dialectal",
    "Northwest-German", "regional", "nonstandard", "obsolete", "archaic",
    "Low-German", "Swiss", "Austrian",
}


def person_of(tags: set[str]) -> str | None:
    for (p, n), key in PERSON_BY_TAGS:
        if p in tags and n in tags:
            return key
    return None


GRAMMAR_GLOSS_RE = re.compile(
    r"^(forms? the|used to form|used as|auxiliary|indicates|marks|expresses"
    r"|as an? \w+ verb|in combination|see |compare )",
    re.I,
)


def clean_english(glosses: list[str]) -> str:
    """Pick up to two readable English glosses, preferring real "to …" senses.

    Wiktionary senses are hierarchical (['As a copulative verb:', 'to be']), so
    the *last* element of a sense is the specific gloss; grammatical
    descriptions ("forms the future tense") are demoted below verb glosses.
    """
    primary: list[str] = []
    secondary: list[str] = []
    for gloss in glosses:
        gloss = re.sub(r"\([^)]*\)", " ", gloss)
        gloss = re.sub(r"\[[^\]]*\]", " ", gloss)
        gloss = re.sub(r"^(?:causative|reflexive|passive|intensive) of [^:]+:\s*", "", gloss, flags=re.I)
        gloss = re.sub(r"[()\[\]]", " ", gloss)
        gloss = re.sub(r"\s+([,;])", r"\1", gloss)
        gloss = re.sub(r"\s+", " ", gloss).strip(" .;,:")
        if not gloss or SKIP_SENSE_RE.search(gloss):
            continue
        # Wiktionary piles synonyms into one sense; two are enough for a label.
        pieces = [p.strip() for p in gloss.split(",") if p.strip()]
        if len(pieces) > 2:
            gloss = ", ".join(pieces[:2])
        if len(gloss) > 55:
            gloss = re.split(r"[,;]", gloss)[0].strip()
        if not gloss:
            continue
        bucket = secondary if GRAMMAR_GLOSS_RE.match(gloss) else primary
        if gloss.lower() not in {g.lower() for g in bucket}:
            bucket.append(gloss)
    ordered = primary + secondary
    parts: list[str] = []
    for gloss in ordered:
        for piece in re.split(r";", gloss):
            piece = piece.strip(" ;,")
            if piece and piece.lower() not in {p.lower() for p in parts}:
                parts.append(piece)
        if len(parts) >= 2:
            break
    text = "; ".join(parts[:2]).strip(" ;,")
    if len(text) > 80:
        # cut at the last clause/word boundary instead of mid-word
        cut = max(text.rfind("; ", 0, 80), text.rfind(", ", 0, 80), text.rfind(" ", 0, 80))
        text = text[: cut if cut > 20 else 80]
        # don't leave a dangling function word at the cut
        while True:
            stripped = re.sub(
                r"[\s,;]+(?:to|of|in|on|at|by|for|from|with|as|so|and|or|a|an|the|it|its|"
                r"into|onto|over|under|about|that|which|someone|something)$",
                "",
                text.strip(" ;,"),
            )
            if stripped == text.strip(" ;,"):
                break
            text = stripped
    return text.strip(" ;,")


def parse_kaikki(path: Path) -> dict[str, dict[str, Any]]:
    """lemma -> {'glosses', 'aux', 'class', 'slots': {slot: {person: [forms]}}}"""
    out: dict[str, dict[str, Any]] = {}
    skipped_alt = 0
    for line in path.open(encoding="utf-8", errors="ignore"):
        if '"forms"' not in line:
            continue
        try:
            entry = json.loads(line)
        except Exception:
            continue
        if entry.get("pos") != "verb" or entry.get("lang_code") != "de":
            continue
        word = entry.get("word") or ""
        if not re.fullmatch(r"[a-zäöüß]+", word):
            continue
        forms = entry.get("forms") or []
        if not any(f.get("source") == "conjugation" for f in forms):
            continue

        senses = entry.get("senses") or []
        glosses: list[str] = []
        alt_only = True
        for sense in senses:
            sense_tags = set(sense.get("tags") or [])
            sense_glosses = sense.get("glosses") or []
            if not sense_glosses:
                continue
            # Wiktionary nests senses; the last element is the specific gloss.
            gloss = sense_glosses[-1]
            if SKIP_SENSE_RE.search(gloss):
                continue
            if sense_tags & {"obsolete", "archaic"}:
                continue
            alt_only = False
            glosses.append(gloss)
        if alt_only:
            skipped_alt += 1
            continue

        record = out.setdefault(
            word,
            {
                "lemma": word,
                "glosses": [],
                "aux": [],
                "class": set(),
                "slots": {},
                "single": {},
            },
        )
        record["glosses"].extend(glosses)

        for form in forms:
            value = (form.get("form") or "").strip()
            if not value or value in ("-", "—"):
                continue
            tags = set(form.get("tags") or [])
            if "table-tags" in tags:
                record["class"].update(value.split())
                continue
            if "inflection-template" in tags or "class" in tags:
                continue
            if "auxiliary" in tags:
                if tags & DIALECT_TAGS:
                    continue
                for aux in re.split(r"\s+or\s+", value):
                    aux = aux.strip()
                    if aux in ("haben", "sein") and aux not in record["aux"]:
                        record["aux"].append(aux)
                continue
            if form.get("source") != "conjugation":
                continue
            if tags & DIALECT_TAGS:
                continue

            if "participle" in tags and "present" in tags:
                record["single"].setdefault("partizip_i", []).append(value)
                continue
            if "participle" in tags and "past" in tags:
                record["single"].setdefault("partizip_ii", []).append(value)
                continue
            if "infinitive-zu" in tags:
                record["single"].setdefault("zu_infinitiv", []).append(value)
                continue
            if "imperative" in tags:
                key = "imperativ_du" if "singular" in tags else "imperativ_ihr"
                record["single"].setdefault(key, []).append(value)
                continue
            if tags & {"perfect", "pluperfect", "future-i", "future-ii"}:
                # Compound tenses are generated from aux + Partizip II instead;
                # kaikki's multiword rows are only used for validation.
                continue

            person = person_of(tags)
            if not person:
                continue
            sub = "_nebensatz" if "subordinate-clause" in tags else ""
            if "indicative" in tags and "present" in tags:
                slot = "praesens" + sub
            elif "indicative" in tags and "preterite" in tags:
                slot = "praeteritum" + sub
            elif "subjunctive-i" in tags:
                slot = "konjunktiv_i" + sub
            elif "subjunctive-ii" in tags:
                slot = "konjunktiv_ii" + sub
            else:
                continue
            record["slots"].setdefault(slot, {}).setdefault(person, []).append(value)

    log(f"kaikki: {len(out)} verb lemmas with conjugation tables "
        f"({skipped_alt} alternative/obsolete-spelling entries skipped)")
    return out


# --------------------------------------------------------------------------- #
# german-verbs-dict (cross-check source)
# --------------------------------------------------------------------------- #
def load_gvd() -> dict[str, Any]:
    if not GVD_JSON.exists():
        download(GVD_URL, GVD_TGZ)
        target = CACHE / "german-verbs-dict"
        target.mkdir(parents=True, exist_ok=True)
        with tarfile.open(GVD_TGZ) as tar:
            tar.extractall(target)
    return json.loads(GVD_JSON.read_text(encoding="utf-8"))


def gvd_principal_parts(record: Any) -> tuple[str | None, list[str]]:
    """(Präteritum 3sg, [Partizip II variants]) with separable prefixes re-joined."""
    if not isinstance(record, dict):
        return None, []

    def finite(value: Any) -> str | None:
        # Finite forms of separable verbs are stored as ['stand', 'auf'].
        if isinstance(value, list):
            if len(value) == 2:
                return f"{value[1]}{value[0]}"
            return str(value[0]) if value else None
        if isinstance(value, str):
            return value
        return None

    singular = (record.get("PRT") or {}).get("S") or {}
    pret = finite(singular.get("3") or singular.get("1"))
    pa2 = record.get("PA2") or []
    if isinstance(pa2, str):
        pa2 = [pa2]
    parts = [str(p) for p in pa2 if isinstance(p, str)]
    return pret, parts


# --------------------------------------------------------------------------- #
# frequency
# --------------------------------------------------------------------------- #
try:
    from wordfreq import word_frequency
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        "wordfreq is required (pip install wordfreq); it supplies the corpus rank"
    ) from exc


# Case-folded tokens that data/german-vocabulary.js lists as a *non-verb*
# headword ("Ende" -> "ende", "recht", "Macht" -> "macht").  Populated in main();
# see lemma_frequency for why they are excluded from the frequency estimate.
NON_VERB_TOKENS: set[str] = set()
NOUN_TOKENS: set[str] = set()
VERB_NOTE_RE = re.compile(r"\bV[tirn]?\b")


def build_non_verb_tokens(de_vocab: dict[str, dict[str, Any]]) -> tuple[set[str], set[str]]:
    """(all non-verb headwords, the subset that are nouns), case-folded."""
    non_verb: set[str] = set()
    nouns: set[str] = set()
    for key, entry in de_vocab.items():
        notes = str(entry.get("notes") or "")
        if VERB_NOTE_RE.search(notes):
            continue
        if re.fullmatch(r"[a-zäöüß]+", key) and key.endswith(("en", "ern", "eln")):
            continue  # looks like a verb lemma; leave it alone
        non_verb.add(key)
        head = str(entry.get("german") or "")
        if head[:1].isupper():
            nouns.add(key)
    return non_verb, nouns


def lemma_frequency(record: dict[str, Any], separable: bool) -> float:
    """Corpus frequency of the lemma, summed over unambiguous paradigm forms.

    Zipf scale (log10 of occurrences per billion tokens), from wordfreq's German
    corpus.  Two deliberate choices keep the estimate honest:

    * For simplex verbs the bare infinitive is excluded, because it is
      homographic with the 1st/3rd person plural *and* with a nominalisation
      ("das Leben", "das Essen", "das Wissen") that wordfreq case-folds into the
      same token.  The finite forms and the participles are unambiguous.
    * For separable verbs the *split* finite forms are ignored, because their
      finite token belongs to the base verb ("stehst auf" would count every use
      of "stehst").  Only the joined forms — infinitive, zu-infinitive, both
      participles and the subordinate-clause forms — are counted.  This
      under-counts separables relative to simplex verbs; it is a floor, not an
      inflated guess.
    * Forms that our own curated vocabulary lists as a *non-verb* headword are
      dropped, because wordfreq case-folds them together: "ende" carries every
      occurrence of "das Ende", "recht" every occurrence of the adverb, "macht"
      every occurrence of "die Macht".  Without this, "rechen" (to rake) lands
      in the top 25 on the strength of "recht"/"gerecht".  Participles are
      exempt unless the homograph is a noun, because German lists many
      participles as adjectives in their own right ("gemacht", "gestellt").
    * A single form that outweighs the whole rest of the paradigm by more than
      3x is dropped as a homograph spike: the interjection "danke!" carries
      "danken" and "die Schule" carries "schulen" into the top 50 otherwise.
    """
    tokens: list[str] = []
    slots = record["slots"]
    if separable:
        tokens.append(record["lemma"])
        for person, values in slots.get("praesens_nebensatz", {}).items():
            tokens.extend(values)
        for person, values in slots.get("praeteritum_nebensatz", {}).items():
            tokens.extend(values)
    else:
        for slot in ("praesens", "praeteritum"):
            for person, values in slots.get(slot, {}).items():
                if person in ("wir", "sie"):
                    continue  # identical to the infinitive
                tokens.extend(values)
    participles = set(record["single"].get("partizip_ii", [])) | set(
        record["single"].get("partizip_i", [])
    )
    tokens.extend(record["single"].get("partizip_ii", []))
    tokens.extend(record["single"].get("partizip_i", []))
    tokens.extend(record["single"].get("zu_infinitiv", []))
    counted: list[float] = []
    for token in dedupe(tokens):
        if " " in token:
            continue
        if token != record["lemma"] and token.lower() in NON_VERB_TOKENS:
            if token not in participles or token.lower() in NOUN_TOKENS:
                continue
        counted.append(word_frequency(token, "de"))
    counted.sort(reverse=True)
    if len(counted) >= 4 and counted[0] > 3 * sum(counted[1:]) > 0:
        counted = counted[1:]
    total = sum(counted)
    if total <= 0:
        return 0.0
    return round(math.log10(total) + 9, 4)


# --------------------------------------------------------------------------- #
# glosses
# --------------------------------------------------------------------------- #
CJK_RE = re.compile(r"[一-鿿]")

# Part-of-speech markers used by data/german-vocabulary.js ("Vt", "Adv", …).
DE_POS_RE = re.compile(
    r"(?<![A-Za-zÄÖÜäöüß])(?:Vt|Vi|Vr|Adv|Präp|Konj|Pron|Art|V)\s*\.?(?![A-Za-zÄÖÜäöüß])"
)


def clean_chinese(text: str) -> str:
    """Strip the textbook apparatus out of data/german-vocabulary.js glosses.

    "搭乘, 行驶 2. Vt 驾驶 3. Vt 运输, 载送" -> "搭乘, 行驶"
    "知道, 了解, 记得2. + von 懂得"          -> "知道, 了解, 记得"
    """
    text = re.sub(r"\s+", " ", text or "").strip()
    text = re.sub(r"^\s*1\.\s*", "", text)
    text = re.split(r"\s*\d+\s*\.", text)[0]
    # \b does not fire between a Latin letter and a CJK ideograph (both are word
    # characters), so "Vt校音" needs explicit lookarounds.
    text = DE_POS_RE.sub(" ", text)
    text = re.sub(r"[+＋]\s*[A-Za-z()\s]*", " ", text)
    text = re.sub(r"\s+", " ", text).strip(" ;,、")
    parts = [p.strip() for p in re.split(r"[;；]", text) if p.strip()]
    # Drop textbook example phrases ("jdm. die Hand drücken 与...握手") as long as
    # a plain gloss survives.
    plain = [p for p in parts if not re.search(r"[A-Za-zÄÖÜäöüß]{3,}", p)]
    parts = plain or parts
    text = "; ".join(parts[:2])
    text = re.sub(r"(?<=[一-鿿])\s*(?:jdm|jdn|jds|jm|jn|js|etw|sich|A|D|G)\b\.?", "", text)
    text = text[:60].strip(" ;,")
    items = [p.strip() for p in re.split(r"[,，、]", text) if p.strip()]
    if len(items) > 3:
        text = ", ".join(items[:3])
    return text.strip(" ;,、")


# ECDICT-style part-of-speech markers used by data/english-vocabulary.js.
ECDICT_POS_RE = re.compile(
    r"(?<![A-Za-z])(n|vt|vi|v|adj|adv|prep|pron|conj|num|art|int|aux|abbr)\s*\.",
    re.IGNORECASE,
)
VERB_POS = {"vt", "vi", "v"}


def clean_chinese_pivot(text: str) -> str:
    """Reduce an ECDICT-style definition to the two leading verbal senses.

    "目录,名单,...,[总称]各种上市证券vt.列出,列于表上,记入名单内vi.列于表"
        -> "列出, 列于表上"
    """
    text = re.sub(r"\s+", " ", text or "").strip()
    text = re.sub(r"[\[［][^\]］]*[\]］]", "", text)
    chunks = ECDICT_POS_RE.split(text)
    # chunks == [before, marker, body, marker, body, ...]
    segments: list[tuple[str, str]] = [("", chunks[0])]
    for i in range(1, len(chunks) - 1, 2):
        segments.append((chunks[i].lower(), chunks[i + 1]))
    chosen = ""
    for marker, body in segments:
        if marker in VERB_POS and CJK_RE.search(body or ""):
            chosen = body
            break
    if not chosen:
        for _, body in segments:
            if CJK_RE.search(body or ""):
                chosen = body
                break
    items = [p.strip(" .;:") for p in re.split(r"[,，、;；/]", chosen) if p.strip(" .;:")]
    items = [p for p in items if CJK_RE.search(p) and not re.search(r"[A-Za-z]{2}", p)]
    out = ", ".join(items[:2])
    if len(out) > 24:
        out = items[0][:24] if items else ""
    return out.strip(" ,、;")


# Hand-written English glosses for the verbs whose Wiktionary entry leads with a
# grammatical description rather than a lexical sense.
ENGLISH_OVERRIDES = {
    "sein": "to be",
    "haben": "to have",
    "werden": "to become; to get",
    "können": "can; to be able to",
    "müssen": "must; to have to",
    "dürfen": "may; to be allowed to",
    "sollen": "should; to be supposed to",
    "wollen": "to want to",
    "mögen": "to like; may",
    "wissen": "to know (a fact)",
    "lassen": "to let; to have something done",
    "tun": "to do",
}


def build_glosses(
    lemma: str,
    record: dict[str, Any],
    de_vocab: dict[str, dict[str, Any]],
    en_vocab: dict[str, dict[str, Any]],
) -> tuple[str, str, str]:
    english = ENGLISH_OVERRIDES.get(lemma) or clean_english(record["glosses"])
    entry = de_vocab.get(lemma)
    chinese = ""
    gloss_source = ""
    if entry:
        chinese = clean_chinese(str(entry.get("chinese") or entry.get("meaning") or ""))
        if chinese:
            gloss_source = "german-vocabulary.js"
    if not chinese:
        for gloss in record["glosses"][:5]:
            gloss = re.sub(r"\([^)]*\)", " ", gloss)
            for part in re.split(r"[,;/]", gloss):
                key = re.sub(r"^to\s+", "", part.strip().lower())
                key = re.sub(r"[^a-z' ]", "", key).strip()
                if not key or key not in en_vocab:
                    continue
                candidate = clean_chinese_pivot(str(en_vocab[key].get("chinese") or ""))
                if candidate:
                    chinese = candidate
                    gloss_source = f"EN pivot via english-vocabulary.js ({key})"
                    break
            if chinese:
                break
    return english, chinese, gloss_source


# --------------------------------------------------------------------------- #
# morphology helpers
# --------------------------------------------------------------------------- #
FIRST_VOWEL_RE = re.compile(r"[aeiouäöü]")


def first_vowel(word: str) -> str:
    match = FIRST_VOWEL_RE.search(word or "")
    return match.group(0) if match else ""


def split_separable(lemma: str, record: dict[str, Any]) -> tuple[str, str, str] | tuple[None, None, None]:
    """Return (prefix_joined, prefix_display, base) when the paradigm splits.

    ``stehe auf`` -> ("auf", "auf", "stehen"); ``stelle wieder her`` ->
    ("wiederher", "wieder her", "stellen").
    """
    praesens = record["slots"].get("praesens", {})
    ich = (praesens.get("ich") or [""])[0]
    if " " not in ich:
        return None, None, None
    tokens = ich.split()
    prefix_tokens = tokens[1:]
    prefix_joined = "".join(prefix_tokens)
    if not lemma.startswith(prefix_joined) or len(lemma) <= len(prefix_joined):
        return None, None, None
    return prefix_joined, " ".join(prefix_tokens), lemma[len(prefix_joined):]


# Perfect with *sein*: verbs of directed motion and change of state.  Used only
# when neither data/german-vocabulary.js nor Wiktionary resolves the auxiliary
# unambiguously; the base verb is consulted for separable-prefix verbs.
SEIN_BASE_VERBS = {
    "begegnen", "bleiben", "einschlafen", "eilen", "entstehen", "erscheinen",
    "erwachen", "fahren", "fallen", "fliegen", "fliehen", "fließen", "folgen",
    "gedeihen", "gehen", "gelangen", "gelingen", "geraten", "geschehen",
    "gleiten", "glücken", "kentern", "klettern", "kommen", "kriechen",
    "landen", "laufen", "misslingen", "passieren", "platzen", "reisen",
    "reiten", "rennen", "rutschen", "scheitern", "schleichen", "schmelzen",
    "schreiten", "schwimmen", "segeln", "sein", "sinken", "springen",
    "starten", "steigen", "sterben", "stolpern", "stürzen", "tauchen",
    "treten", "verschwinden", "wachsen", "wandern", "weichen", "werden",
    "ziehen", "stehen", "sitzen", "liegen",
}
# stehen/sitzen/liegen take *haben* on their own but *sein* in their common
# separable compounds (aufstehen, aufsitzen, …); they are only consulted for
# separable verbs, never for the simplex, which is handled by POSITIONAL_DUAL.
SEIN_ONLY_VIA_PREFIX = {"stehen", "sitzen", "liegen"}
# Standard/northern German conjugates the positional verbs with haben ("ich
# habe gestanden"); sein is the southern and Austrian variant.  Both are
# correct, so both are listed - with the taught form first.
POSITIONAL_DUAL = {"stehen", "sitzen", "liegen"}


def aux_from_notes(notes: str) -> list[str]:
    notes = notes or ""
    has_ist = bool(re.search(r"\bist\b", notes))
    has_hat = bool(re.search(r"\bhat\b", notes))
    if has_ist and has_hat:
        return ["sein", "haben"]
    if has_ist:
        return ["sein"]
    if has_hat:
        return ["haben"]
    return []


# Wiktionary merges the separable and the inseparable reading of a headword
# into one page, and for these lemmas it reports only the auxiliary of the
# reading this dataset does *not* use.  The entry built here is the
# inseparable, transitive reading ("ich habe den Absatz übergangen").
AUX_OVERRIDES = {"übergehen": ["haben"]}


def resolve_aux(
    lemma: str,
    record: dict[str, Any],
    base: str | None,
    de_vocab: dict[str, dict[str, Any]],
) -> list[str]:
    """Auxiliary list, primary first; a second entry only when genuinely dual."""
    if lemma in AUX_OVERRIDES:
        return list(AUX_OVERRIDES[lemma])
    offered = [a for a in record["aux"] if a in ("haben", "sein")]
    offered = dedupe(offered) or ["haben"]

    from_notes = aux_from_notes(str((de_vocab.get(lemma) or {}).get("notes") or ""))
    if from_notes:
        # Trust the curated textbook data; keep only auxiliaries the lexicon knows.
        picked = [a for a in from_notes if a in offered] or from_notes
        return picked[:2]

    if not base and lemma in POSITIONAL_DUAL:
        return ["haben", "sein"]

    if len(offered) == 1:
        return offered

    # Wiktionary says "haben or sein" and the textbook data is silent: pick one.
    probe = base if base else lemma
    if base and base in SEIN_ONLY_VIA_PREFIX:
        return ["sein"]
    base_notes = aux_from_notes(str((de_vocab.get(probe) or {}).get("notes") or ""))
    if base_notes:
        return base_notes[:1]
    if probe in SEIN_BASE_VERBS:
        return ["sein"]
    return ["haben"]


def person_map(
    record: dict[str, Any], slot: str, limit: int = 2
) -> dict[str, str] | None:
    raw = record["slots"].get(slot)
    if not raw:
        return None
    out: dict[str, str] = {}
    for person in PERSONS:
        values = dedupe(raw.get(person) or [])[:limit]
        if not values:
            return None
        out[person] = " / ".join(values)
    return out


# --------------------------------------------------------------------------- #
# tense assembly
# --------------------------------------------------------------------------- #
HABEN = {
    "present": ["habe", "hast", "hat", "haben", "habt", "haben"],
    "preterite": ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"],
    "konjunktiv_i": ["habe", "habest", "habe", "haben", "habet", "haben"],
    "konjunktiv_ii": ["hätte", "hättest", "hätte", "hätten", "hättet", "hätten"],
}
SEIN = {
    "present": ["bin", "bist", "ist", "sind", "seid", "sind"],
    "preterite": ["war", "warst", "war", "waren", "wart", "waren"],
    "konjunktiv_i": ["sei", "seiest", "sei", "seien", "seiet", "seien"],
    "konjunktiv_ii": ["wäre", "wärest", "wäre", "wären", "wäret", "wären"],
}
WERDEN_PRESENT = ["werde", "wirst", "wird", "werden", "werdet", "werden"]
WERDEN_KI = ["werde", "werdest", "werde", "werden", "werdet", "werden"]
WUERDE = ["würde", "würdest", "würde", "würden", "würdet", "würden"]


def aux_table(aux_list: list[str], key: str) -> list[str]:
    table = {"haben": HABEN, "sein": SEIN}
    return [table[aux][key] for aux in aux_list]


def compound(aux_list: list[str], key: str, tails: list[str]) -> dict[str, str]:
    """"bin gefahren / habe gefahren" — one complete alternative per auxiliary.

    ``tails`` holds the accepted Partizip II forms (two for the verbs with a
    strong and a weak paradigm, "habe geschafft / habe geschaffen").
    """
    tables = aux_table(aux_list, key)
    out = {}
    for index, person in enumerate(PERSONS):
        out[person] = " / ".join(
            f"{table[index]} {tail}".strip() for tail in tails for table in tables
        )
    return out


def person_tense(group: str, label: str, forms: dict[str, str]) -> dict[str, Any]:
    return {"type": "person", "group_label": group, "tense_label": label, "forms": forms}


def single_tense(group: str, label: str, values: list[str]) -> dict[str, Any]:
    return {"type": "single", "group_label": group, "tense_label": label, "forms": values}


def require_imperative_e(
    lemma: str, record: dict[str, Any], forms: list[str]
) -> list[str]:
    """Drop the e-less du-imperative where the -e is obligatory.

    Duden: stems in -d/-t, in consonant + m/n, and the -ieren verbs keep the
    -e ("arbeite!", "rechne!", "studiere!"; not "arbeit!").  Verbs with the
    e->i(e) change are exempt ("gilt!", "tritt!") - they are detected by
    comparing the 2nd person singular stem with the infinitive stem, so no
    hand-maintained exception list is needed.
    """
    stem = re.sub(r"e?n$", "", lemma)
    cluster = bool(re.search(r"[^aeiouäöülmnr][mn]$", stem)) and not re.search(
        r"[aeiouäöü]h[mn]$", stem  # silent h: "wohn!", "lehn!" are fine
    )
    needs_e = bool(re.search(r"[dt]$", stem) or cluster or lemma.endswith("ieren"))
    if not needs_e:
        return forms
    du_present = (record["slots"].get("praesens") or {}).get("du") or []
    if du_present:
        present_stem = re.sub(r"(e?st|t)$", "", du_present[0].split(" ")[0])
        if present_stem and present_stem != stem and not stem.endswith(present_stem):
            return forms  # vowel change: "gilt!", "tritt!"
    kept = [f for f in forms if f.split(" ")[0].endswith("e")]
    return kept or forms


def imperative_forms(
    lemma: str,
    record: dict[str, Any],
    praesens: dict[str, str],
    konjunktiv_i: dict[str, str],
) -> dict[str, str] | None:
    """du/ihr from the lexicon; wir/Sie are the present-tense plural forms.

    The wir/Sie imperative is the present indicative plural plus the pronoun
    ("gehen wir", "gehen Sie"), which keeps the Satzklammer for separable verbs
    ("stehen wir auf").  ``sein`` is the one verb that uses the Konjunktiv I
    plural instead ("seien wir", "seien Sie") - deriving everything from
    Konjunktiv I would give "tuen wir" for ``tun``.
    """
    if lemma in MODALS:
        return None
    du = dedupe(record["single"].get("imperativ_du") or [])[:2]
    ihr = dedupe(record["single"].get("imperativ_ihr") or [])[:1]
    if not du or not ihr:
        return None
    du = require_imperative_e(lemma, record, du)

    def with_pronoun(form: str, pronoun: str) -> str:
        head, _, tail = form.split(" / ")[0].partition(" ")
        return f"{head} {pronoun} {tail}".strip() if tail else f"{head} {pronoun}"

    plural = konjunktiv_i if lemma == "sein" else praesens
    return {
        "du": " / ".join(du),
        "ihr": ihr[0],
        "wir": with_pronoun(plural["wir"], "wir"),
        "sie": with_pronoun(plural["sie"], "Sie"),
    }


def keep_reading(forms: dict[str, str], separable: bool) -> dict[str, str]:
    """Drop the alternatives that belong to the *other* reading of the verb."""
    out: dict[str, str] = {}
    for person, value in forms.items():
        parts = [p.strip() for p in value.split(" / ") if p.strip()]
        wanted = [p for p in parts if (" " in p) == separable]
        out[person] = " / ".join(wanted or parts)
    return out


# A second Partizip II below this share of the main form's corpus frequency is
# an archaic or dialectal leftover of a merged Wiktionary page ("gebollen" for
# bellen, "verloffen" for verlaufen) and is dropped.
PARTICIPLE_ALT_RATIO = 0.04

# Particles that are separable in one reading of a verb and inseparable in the
# other ("úmgehen" vs "umgéhen"), longest first.
AMBIGUOUS_PARTICLES = (
    "wieder", "hinter", "unter", "über", "durch", "wider", "voll", "miss", "um",
)


def keep_participles(
    values: list[str], lemma: str, prefix: str | None, aux_list: list[str]
) -> list[str]:
    """Pick the Partizip II forms that really belong to this verb reading.

    Wiktionary merges every etymology of a headword into one page, so the raw
    list can hold (a) the Ersatzinfinitiv used with a dependent infinitive
    ("habe kommen *können*"), (b) the passive participle "worden", (c) the
    participle of the *other* reading of a particle verb ("umgegangen" next to
    "umgangen"), and (d) genuinely co-existing strong and weak participles
    ("geschaffen" / "geschafft").  Only (d) is a real alternative.

    The first candidate is always kept: kaikki lists the paradigms in the order
    Wiktionary shows them, and every other cell of this entry (Präsens,
    Präteritum, Konjunktiv) was filtered on that same order, so taking the
    first keeps the entry internally consistent.
    """
    from wordfreq import word_frequency

    cands: list[str] = []
    seen: set[str] = set()
    for value in values:
        key = ss_normalize(value)
        if key not in seen:
            seen.add(key)
            cands.append(value)
    if len(cands) < 2:
        return cands

    # (a) + (b): both are the ge-less twin of a participle that is also listed.
    ge_forms = {c for c in cands if c.startswith("ge")}
    cands = [
        c for c in cands if not (("ge" + c) in ge_forms or (c == lemma and ge_forms))
    ] or cands
    if len(cands) < 2:
        return cands

    primary = cands[0]
    # (c) the runner-up must belong to the same reading as the primary: with a
    # particle verb the separable reading is the one that infixes "ge".
    particle = prefix or next(
        (p for p in AMBIGUOUS_PARTICLES if lemma.startswith(p) and len(lemma) > len(p) + 2),
        None,
    )

    def ge_infixed(form: str) -> bool:
        return bool(
            particle and form.startswith(particle) and form[len(particle):].startswith("ge")
        )

    rest = [c for c in cands[1:] if ge_infixed(c) == ge_infixed(primary)]
    # A verb with two auxiliaries already shows two alternatives per cell, and a
    # second participle usually belongs to a reading that takes the *other*
    # auxiliary ("ist erschrocken" vs "hat erschreckt"), so only the plain
    # haben-verbs get one.
    if not rest or aux_list != ["haben"]:
        return [primary]

    # (d) keep the best runner-up, but only when it is actually in use.
    top = word_frequency(primary, "de")
    scored = sorted(((word_frequency(c, "de"), c) for c in rest), reverse=True)
    if top > 0 and scored[0][0] / top >= PARTICIPLE_ALT_RATIO:
        return [primary, scored[0][1]]
    return [primary]


def build_entry(
    lemma: str,
    record: dict[str, Any],
    english: str,
    chinese: str,
    frequency: float,
    de_vocab: dict[str, dict[str, Any]],
) -> dict[str, Any] | None:
    prefix, prefix_display, base = split_separable(lemma, record)
    separable = bool(prefix and base)

    praesens = person_map(record, "praesens")
    praeteritum = person_map(record, "praeteritum")
    konjunktiv_i = person_map(record, "konjunktiv_i")
    konjunktiv_ii_synth = person_map(record, "konjunktiv_ii")
    if not (praesens and praeteritum and konjunktiv_i and konjunktiv_ii_synth):
        return None

    # Verbs with both a separable and an inseparable reading ("umfassen",
    # "wiederholen", "durchsetzen") arrive with both paradigms merged into the
    # alternatives of one cell.  Keep only the reading this entry is about, so
    # that a non-separable verb never shows a Satzklammer and a separable one
    # never shows the joined main-clause form (that is the Nebensatz table).
    praesens = keep_reading(praesens, separable)
    praeteritum = keep_reading(praeteritum, separable)
    konjunktiv_i = keep_reading(konjunktiv_i, separable)
    konjunktiv_ii_synth = keep_reading(konjunktiv_ii_synth, separable)

    aux_list = resolve_aux(lemma, record, base, de_vocab)
    partizip_ii = keep_participles(
        dedupe(record["single"].get("partizip_ii") or []), lemma, prefix, aux_list
    )
    partizip_i = dedupe(record["single"].get("partizip_i") or [])[:1]
    # The zu-infinitive is fully determined by the split, and the lexicon merges
    # the separable and inseparable readings ("wiederzuholen" for the
    # inseparable "wiederholen"), so it is derived rather than copied.
    zu_infinitiv = [f"{prefix}zu{base}" if separable else f"zu {lemma}"]
    if not partizip_ii:
        return None
    if not partizip_i:
        partizip_i = [f"{lemma}d"]

    parts = partizip_ii
    part = parts[0]

    # ---- Konjunktiv II policy ------------------------------------------- #
    wuerde_forms = {
        person: f"{WUERDE[i]} {lemma}" for i, person in enumerate(PERSONS)
    }
    homophonous = all(
        ss_normalize(konjunktiv_ii_synth[p].split(" / ")[0])
        == ss_normalize(praeteritum[p].split(" / ")[0])
        for p in PERSONS
    )
    if lemma in FORCE_SYNTHETIC_KII:
        kii_type = "synthetic"
        konjunktiv_ii = dict(konjunktiv_ii_synth)
    elif homophonous:
        kii_type = "wuerde"
        konjunktiv_ii = wuerde_forms
    else:
        kii_type = "both"
        konjunktiv_ii = {
            p: f"{konjunktiv_ii_synth[p]} / {wuerde_forms[p]}" for p in PERSONS
        }

    tenses: "OrderedDict[str, Any]" = OrderedDict()
    tenses["indikativ_praesens"] = person_tense("Indikativ", "Präsens", praesens)
    if separable:
        nebensatz = person_map(record, "praesens_nebensatz")
        if not nebensatz:
            nebensatz = {
                p: f"{prefix}{praesens[p].split(' / ')[0].split(' ')[0]}"
                for p in PERSONS
            }
        tenses["indikativ_praesens_nebensatz"] = person_tense(
            "Indikativ", "Präsens (Nebensatz)", nebensatz
        )
    tenses["indikativ_praeteritum"] = person_tense("Indikativ", "Präteritum", praeteritum)
    tenses["indikativ_perfekt"] = person_tense(
        "Indikativ", "Perfekt", compound(aux_list, "present", parts)
    )
    tenses["indikativ_plusquamperfekt"] = person_tense(
        "Indikativ", "Plusquamperfekt", compound(aux_list, "preterite", parts)
    )
    tenses["indikativ_futur_i"] = person_tense(
        "Indikativ",
        "Futur I",
        {p: f"{WERDEN_PRESENT[i]} {lemma}" for i, p in enumerate(PERSONS)},
    )
    tenses["indikativ_futur_ii"] = person_tense(
        "Indikativ",
        "Futur II",
        {
            p: " / ".join(
                f"{WERDEN_PRESENT[i]} {tail} {aux}"
                for tail in parts
                for aux in aux_list
            )
            for i, p in enumerate(PERSONS)
        },
    )
    tenses["konjunktiv_i"] = person_tense("Konjunktiv", "Konjunktiv I", konjunktiv_i)
    tenses["konjunktiv_i_perfekt"] = person_tense(
        "Konjunktiv", "Konjunktiv I Perfekt", compound(aux_list, "konjunktiv_i", parts)
    )
    tenses["konjunktiv_ii"] = person_tense("Konjunktiv", "Konjunktiv II", konjunktiv_ii)
    tenses["konjunktiv_ii_perfekt"] = person_tense(
        "Konjunktiv",
        "Konjunktiv II Perfekt",
        compound(aux_list, "konjunktiv_ii", parts),
    )

    imperativ = imperative_forms(lemma, record, praesens, konjunktiv_i)
    if imperativ:
        tenses["imperativ"] = person_tense("Imperativ", "Imperativ", imperativ)

    tenses["partizip_i"] = single_tense("Infinit", "Partizip I", partizip_i)
    tenses["partizip_ii"] = single_tense("Infinit", "Partizip II", partizip_ii)
    tenses["infinitiv"] = single_tense("Infinit", "Infinitiv", [lemma])
    tenses["zu_infinitiv"] = single_tense("Infinit", "zu + Infinitiv", zu_infinitiv)

    classes = record["class"]
    if lemma in MODALS or "present" in classes:
        verb_class = "preterite-present"
    elif "strong" in classes:
        verb_class = "strong"
    elif "irregular" in classes:
        verb_class = "irregular"
    elif "weak" in classes:
        verb_class = "weak"
    else:
        verb_class = "unknown"

    # Wiktionary tags a verb "strong" as soon as *a* strong paradigm exists for
    # the headword ("stecken", "saugen", "schrecken"), even when the table it
    # ships is the weak one.  Reconcile the label with the forms we actually
    # emit so that the shape assertions in the validator mean something.
    if verb_class != "preterite-present":
        pret_core = praeteritum["ich"].split(" / ")[0].split(" ")[0]
        if prefix and pret_core.startswith(prefix):
            pret_core = pret_core[len(prefix) :]
        vowel_shift = first_vowel(base if separable else lemma) != first_vowel(pret_core)
        if part.endswith("en"):
            if verb_class not in ("strong", "irregular"):
                verb_class = "strong"
        elif part.endswith("t"):
            if verb_class in ("strong", "weak", "unknown"):
                verb_class = "mixed" if vowel_shift else "weak"
        elif verb_class == "unknown":
            verb_class = "irregular"

    entry: dict[str, Any] = {
        "rank": 0,
        "infinitive": lemma,
        "frequency": frequency,
        "english": english,
        "chinese": chinese,
        "auxiliary": aux_list,
        "verbClass": verb_class,
        "separable": separable,
        "konjunktivIiType": kii_type,
        "source": SOURCE_NOTE,
        "tenses": dict(tenses),
    }
    if separable:
        entry["separablePrefix"] = prefix
        entry["separablePrefixDisplay"] = prefix_display
        entry["separableBase"] = base
    if kii_type == "wuerde":
        # The synthetic form exists but is homophonous with the Präteritum and is
        # only used in formal writing; keep it visible without drilling it.
        entry["konjunktivIiSynthetischSelten"] = dict(konjunktiv_ii_synth)
    if lemma in MODALS:
        entry["note"] = (
            "Modalverben haben keinen Imperativ. Perfekt mit Vollverb: "
            f"hat … {lemma} (Ersatzinfinitiv), z. B. „er hat kommen {lemma}“."
        )
    return entry


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    download(KAIKKI_URL, KAIKKI_PATH)
    kaikki = parse_kaikki(KAIKKI_PATH)
    gvd = load_gvd()

    de_vocab = {
        str(e.get("german", "")).lower(): e
        for e in load_js_array(DE_VOCAB_PATH, "GERMAN_VOCABULARY_DATA")
    }
    en_vocab: dict[str, dict[str, Any]] = {}
    for e in load_js_array(EN_VOCAB_PATH, "ENGLISH_VOCABULARY_DATA"):
        en_vocab.setdefault(str(e.get("english", "")).lower(), e)

    non_verb, nouns = build_non_verb_tokens(de_vocab)
    NON_VERB_TOKENS.update(non_verb)
    NOUN_TOKENS.update(nouns)

    missing_mandatory = [w for w in MANDATORY if w not in kaikki]
    if missing_mandatory:
        raise SystemExit(f"Mandatory verbs missing from source: {missing_mandatory}")

    rejected: dict[str, int] = {}
    candidates: list[dict[str, Any]] = []
    for lemma, record in kaikki.items():
        if lemma in BLOCKED_LEMMAS:
            rejected["blocked homograph"] = rejected.get("blocked homograph", 0) + 1
            continue
        prefix, _prefix_display, _base = split_separable(lemma, record)
        frequency = lemma_frequency(record, bool(prefix))
        english, chinese, gloss_source = build_glosses(lemma, record, de_vocab, en_vocab)
        if not english or english.lower() in PLACEHOLDER_GLOSSES:
            rejected["no english gloss"] = rejected.get("no english gloss", 0) + 1
            continue
        if not chinese or not CJK_RE.search(chinese):
            rejected["no chinese gloss"] = rejected.get("no chinese gloss", 0) + 1
            continue
        entry = build_entry(lemma, record, english, chinese, frequency, de_vocab)
        if entry is None:
            rejected["incomplete paradigm"] = rejected.get("incomplete paradigm", 0) + 1
            continue
        entry["_glossSource"] = gloss_source
        candidates.append(entry)

    mandatory_set = set(MANDATORY)
    candidates.sort(key=lambda e: (-e["frequency"], e["infinitive"]))

    selected: list[dict[str, Any]] = list(candidates[:TARGET_COUNT])
    have = {e["infinitive"] for e in selected}
    # Separable verbs are systematically under-counted by the frequency estimate
    # above (their finite forms are split and belong to the base verb), so the
    # most frequent separables are pulled in explicitly.
    separable_added = 0
    for entry in candidates:
        if separable_added >= SEPARABLE_TARGET:
            break
        if not entry["separable"]:
            continue
        if entry["infinitive"] in have:
            separable_added += 1
            continue
        selected.append(entry)
        have.add(entry["infinitive"])
        separable_added += 1
    for entry in candidates:
        if entry["infinitive"] in mandatory_set and entry["infinitive"] not in have:
            selected.append(entry)
            have.add(entry["infinitive"])
    selected.sort(key=lambda e: (-e["frequency"], e["infinitive"]))

    # Cross-check Präteritum / Partizip II against german-pos-dict (Morphy).
    checked = 0
    mismatches: list[str] = []
    for entry in selected:
        record = gvd.get(entry["infinitive"])
        pret, parts = gvd_principal_parts(record)
        if not pret or not parts:
            continue
        checked += 1
        ours_pret = entry["tenses"]["indikativ_praeteritum"]["forms"]["er_sie_es"].split(" / ")[0]
        if entry["separable"]:
            head, _, tail = ours_pret.partition(" ")
            ours_pret = f"{tail}{head}" if tail else head
        ours_part = entry["tenses"]["partizip_ii"]["forms"][0]
        pret_ok = ss_normalize(ours_pret) == ss_normalize(pret)
        part_ok = ss_normalize(ours_part) in {ss_normalize(p) for p in parts}
        if not (pret_ok and part_ok):
            mismatches.append(
                f"{entry['infinitive']}: wiktionary({ours_pret}/{ours_part}) "
                f"vs german-pos-dict({pret}/{'|'.join(parts)})"
            )
    log(f"cross-check against german-pos-dict: {checked} verbs compared, "
        f"{len(mismatches)} differ ({100 * (checked - len(mismatches)) / max(checked, 1):.1f}% agree)")
    for line in mismatches[:30]:
        log(f"  ~ {line}")

    missing_final = sorted(mandatory_set - {e["infinitive"] for e in selected})
    if missing_final:
        raise SystemExit(f"Mandatory verbs dropped during selection: {missing_final}")

    for index, entry in enumerate(selected, start=1):
        entry["rank"] = index
        entry.pop("_glossSource", None)

    separables = sum(1 for e in selected if e["separable"])
    kii = {}
    for entry in selected:
        kii[entry["konjunktivIiType"]] = kii.get(entry["konjunktivIiType"], 0) + 1
    log(f"selected {len(selected)} verbs ({separables} separable); "
        f"Konjunktiv II: {kii}; rejected: {rejected}")

    header = (
        "// Auto-generated by scripts/build_german_conjugations.py — do not edit by hand.\n"
        f"// {len(selected)} verbs ({separables} separable-prefix), ranked by wordfreq "
        "corpus frequency over the inflected paradigm.\n"
        "// Forms: en.wiktionary via wiktextract/kaikki.org (CC BY-SA 4.0), cross-checked against\n"
        "// german-pos-dict / Morphy (CC BY-SA 4.0). Glosses: data/german-vocabulary.js with an\n"
        "// EN->ZH pivot through data/english-vocabulary.js. Frequency: wordfreq (MIT).\n"
        "// Separable verbs keep the Satzklammer: main-clause forms are split ('stehe auf'),\n"
        "// indikativ_praesens_nebensatz holds the joined subordinate-clause forms ('aufstehe').\n"
    )
    OUT_PATH.write_text(
        header
        + "const GERMAN_CONJUGATION_DATA = "
        + json.dumps(selected, ensure_ascii=False, indent=2)
        + ";\n\n"
        + "if (typeof module !== 'undefined' && module.exports) { module.exports = GERMAN_CONJUGATION_DATA; }\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(selected)} entries to {OUT_PATH}")


if __name__ == "__main__":
    main()
