#!/usr/bin/env python3
"""Shared vocabulary schema (v1) for every language: constants, normalisers,
reader and writer.

Every language ships exactly one file, ``data/vocab/<code>.js``, in the same
shape; docs/vocab-schema.md is the field reference and
scripts/validate_vocab.js enforces it.  Builders keep whatever internal shape
suits their pipeline and hand the final list to ``write_vocab`` here.

Adding a language = pick a code, produce entries with the fields below, call
``finalize`` + ``write_vocab``.  Nothing else in the data layer is
per-language.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOCAB_DIR = ROOT / 'data' / 'vocab'
SCHEMA_VERSION = 1

LANGS = {
    'it': {'name': 'Italiano', 'wordfreq': 'it'},
    'de': {'name': 'Deutsch', 'wordfreq': 'de'},
    'en': {'name': 'English', 'wordfreq': 'en'},
    'fr': {'name': 'Français', 'wordfreq': 'fr'},
}

POS = (
    'noun', 'properNoun', 'verb', 'adjective', 'adverb', 'pronoun',
    'determiner', 'article', 'preposition', 'conjunction', 'numeral',
    'interjection', 'particle', 'prefix', 'suffix', 'phrase', 'abbreviation',
)
GENDERS = ('m', 'f', 'n')
LEVELS = ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
# Where a level comes from.  Everything except freq-band is an external,
# human-curated list and is kept as is.
LEVEL_SOURCES = ('official', 'textbook', 'course', 'freq-band')

# Same bands for every language: position among the frequency-ranked entries.
LEVEL_BANDS = ((600, 'A1'), (1500, 'A2'), (3000, 'B1'), (6000, 'B2'), (12000, 'C1'))

FORM_KEYS = (
    'plural', 'feminine', 'principalParts', 'construction', 'government',
    'pluraleTantum', 'pronominal', 'variants',
)
# Field order in the emitted JSON (readability of diffs only).
FIELD_ORDER = (
    'word', 'display', 'pos', 'posAll', 'gender', 'level', 'levelSource',
    'rank', 'freq', 'zh', 'zhAlt', 'en', 'forms', 'tags', 'src', 'legacyId',
    'legacyWord',
)


def band_level(position: int) -> str:
    for limit, level in LEVEL_BANDS:
        if position <= limit:
            return level
    return 'C2'


_wordfreq_cache: dict = {}


def wordfreq_per_million(word: str, lang: str):
    """wordfreq frequency per million tokens (3 significant figures), or None."""
    try:
        from wordfreq import word_frequency
    except ImportError as exc:  # pragma: no cover - build-time dependency
        raise SystemExit('pip install wordfreq') from exc
    key = (lang, word)
    if key not in _wordfreq_cache:
        value = word_frequency(word, LANGS[lang]['wordfreq']) * 1e6
        _wordfreq_cache[key] = float(f'{value:.3g}') if value > 0 else None
    return _wordfreq_cache[key]


def join_genders(genders) -> str:
    """Join gender letters in the canonical order m, f, n (``m/f``, ``f/n``).

    The order carries no meaning (``display`` keeps the primary article), so
    one spelling per combination keeps filters and the validator simple.
    """
    present = set(genders or ())
    return '/'.join(g for g in GENDERS if g in present)


def canonical_gender(value: str) -> str:
    """'n/m/f' -> 'm/f/n'; unknown letters are dropped."""
    return join_genders((value or '').split('/'))


def clean_entry(entry: dict) -> dict:
    """Drop empty optional fields and emit keys in FIELD_ORDER."""
    out = {}
    for key in FIELD_ORDER:
        if key not in entry:
            continue
        value = entry[key]
        if key == 'freq':
            out[key] = value if value else None
            continue
        if key == 'src':
            if isinstance(value, int):
                out[key] = value
            continue
        if key == 'forms':
            value = {k: value[k] for k in FORM_KEYS
                     if k in value and value[k] not in (None, '', [], False)}
        if value in (None, '', [], {}, False):
            continue
        if key == 'display' and value == entry.get('word'):
            continue
        if key == 'gender':
            value = canonical_gender(value)
        if key == 'legacyWord' and value == entry.get('word'):
            continue
        out[key] = value
    return out


def finalize(entries: list, lang: str, *, order_key=None) -> list:
    """Assign rank / freq / freq-band levels uniformly.

    ``entries`` must already be unique by ``word``.  Entries flagged with
    ``_ranked`` (truthy) keep their relative order at the head of the list;
    the rest are appended by descending wordfreq.  ``order_key`` optionally
    re-sorts the ranked head (e.g. by a corpus frequency).  Entries that
    carry an external ``levelSource`` (official / textbook / course) keep
    that level unless the frequency band is easier: a word in the top 600 is
    A1 material whatever list first introduced it.
    """
    for e in entries:
        if 'freq' not in e:
            e['freq'] = wordfreq_per_million(e['word'], lang)
        if e.get('gender'):
            e['gender'] = canonical_gender(e['gender'])
    ranked = [e for e in entries if e.get('_ranked')]
    unranked = [e for e in entries if not e.get('_ranked')]
    if order_key:
        ranked.sort(key=order_key)
    unranked.sort(key=lambda e: (-(e['freq'] or 0), e['word']))
    ordered = ranked + unranked
    for position, e in enumerate(ordered, 1):
        e['rank'] = position
        band = band_level(position) if e.get('_ranked') or e['freq'] else 'C2'
        external = e.get('levelSource') not in (None, '', 'freq-band') and e.get('level')
        if not external or LEVELS.index(band) < LEVELS.index(e['level']):
            e['level'] = band
            e['levelSource'] = 'freq-band'
    return [clean_entry(e) for e in ordered]


def intern_sources(entries: list) -> list:
    """Replace per-entry ``source`` strings with ``src`` indices; return the table."""
    table: list = []
    index: dict = {}
    for e in entries:
        source = e.pop('source', '') or ''
        if not source:
            continue
        if source not in index:
            index[source] = len(table)
            table.append(source)
        e['src'] = index[source]
    return table


def vocab_path(lang: str) -> Path:
    return VOCAB_DIR / f'{lang}.js'


def write_vocab(lang: str, entries: list, *, sources: list, licences: list,
                builder: str, notes: str = '') -> Path:
    if lang not in LANGS:
        raise ValueError(f'unknown language {lang!r}')
    words = [e['word'] for e in entries]
    if len(words) != len(set(words)):
        raise ValueError(f'{lang}: duplicate words')
    meta = {
        'schema': SCHEMA_VERSION,
        'lang': lang,
        'name': LANGS[lang]['name'],
        'count': len(entries),
        'builder': builder,
        'licences': licences,
        'sources': sources,
    }
    if notes:
        meta['notes'] = notes
    lines = [
        f'// {LANGS[lang]["name"]} vocabulary — schema v{SCHEMA_VERSION}, see docs/vocab-schema.md.',
        f'// Generated by {builder}. Do not edit by hand; validate with',
        '// `node scripts/validate_vocab.js`.',
        f'(globalThis.DIM_VOCAB = globalThis.DIM_VOCAB || {{}}).{lang} = {{',
        f'"meta":{json.dumps(meta, ensure_ascii=False, separators=(",", ":"))},',
        '"entries":[',
    ]
    body = ',\n'.join(json.dumps(e, ensure_ascii=False, separators=(',', ':')) for e in entries)
    path = vocab_path(lang)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(lines) + '\n' + body + '\n]};\n', encoding='utf-8')
    return path


_PAYLOAD_RE = re.compile(r'DIM_VOCAB\s*\|\|\s*\{\}\)\.(\w+)\s*=\s*', re.S)


def read_vocab(lang: str) -> dict:
    """Return {'meta': ..., 'entries': [...]} for a shipped vocab file."""
    text = vocab_path(lang).read_text(encoding='utf-8')
    match = _PAYLOAD_RE.search(text)
    if not match or match.group(1) != lang:
        raise ValueError(f'{vocab_path(lang)} is not a v1 vocab file')
    payload = text[match.end():].rstrip()
    if payload.endswith(';'):
        payload = payload[:-1]
    return json.loads(payload)


def rewrite_vocab(lang: str, update, *, builder: str = '') -> Path:
    """Apply ``update(entries, meta)`` to a shipped file in place and re-emit it.

    For post-passes that enrich fields without re-running a whole pipeline
    (the entry order, and hence ``rank``, must stay as it is).  Every entry
    goes back through ``clean_entry``, so gender order and empty-field rules
    are re-applied.  ``update`` may append to ``meta['sources']``.
    """
    data = read_vocab(lang)
    meta = data['meta']
    entries = data['entries']
    update(entries, meta)
    out = [clean_entry(e) for e in entries]
    for position, e in enumerate(out, 1):
        if e['rank'] != position:
            raise ValueError(f'{lang}: rewrite_vocab must not reorder entries')
    return write_vocab(lang, out, sources=meta['sources'], licences=meta['licences'],
                       builder=builder or meta['builder'], notes=meta.get('notes', ''))


def source_index(meta: dict, source: str) -> int:
    """Index of ``source`` in meta.sources, appending it when new."""
    if source not in meta['sources']:
        meta['sources'].append(source)
    return meta['sources'].index(source)


# ---- Wiktionary (kaikki.org per-word pages) --------------------------------
# The German and French pipelines read the full kaikki dumps (~1 GB each,
# slow to download).  For a handful of gap-filling lookups the per-word pages
# hold the same Wiktextract records; they are cached on disk.
KAIKKI_CACHE = Path('/tmp/kaikki-words')


def kaikki_records(language: str, word: str) -> list:
    """Wiktextract records for ``word`` from kaikki.org (``language`` is e.g.
    'German').  Returns [] when the page does not exist."""
    import urllib.parse
    import urllib.request
    cache = KAIKKI_CACHE / language / (urllib.parse.quote(word, safe='') + '.jsonl')
    if not cache.exists():
        first, prefix = word[:1], word[:2]
        url = 'https://kaikki.org/dictionary/{}/meaning/{}/{}/{}.jsonl'.format(
            language, *(urllib.parse.quote(x) for x in (first, prefix, word)))
        try:
            with urllib.request.urlopen(url, timeout=60) as resp:
                body = resp.read().decode('utf-8')
        except Exception:  # 404 = no entry; network trouble = no data either
            body = ''
        cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_text(body, encoding='utf-8')
    out = []
    for line in cache.read_text(encoding='utf-8').splitlines():
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if rec.get('word') == word:
            out.append(rec)
    return out


def kaikki_english(language: str, word: str, *, limit: int = 3) -> str:
    """'climate protection; ...' from the non-form-of senses of ``word``."""
    glosses = []
    for rec in kaikki_records(language, word):
        for sense in rec.get('senses') or []:
            tags = sense.get('tags') or []
            if sense.get('form_of') or 'form-of' in tags or 'alt-of' in tags:
                continue
            for raw in (sense.get('glosses') or [])[:1]:
                for gloss in re.split(r'[;]', re.sub(r'\s*\([^()]*\)', '', raw)):
                    gloss = gloss.strip(' .;:')
                    if gloss and len(gloss) <= 60 and gloss.lower() not in (g.lower() for g in glosses):
                        glosses.append(gloss)
    return '; '.join(glosses[:limit])


def source_of(data: dict, entry: dict) -> str:
    src = entry.get('src')
    return data['meta']['sources'][src] if isinstance(src, int) else ''
