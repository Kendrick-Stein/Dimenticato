#!/usr/bin/env python3
"""Parse 意大利语动词搭配大全 and generate verb-collocations-data.js."""

import json
import os
import re
import unicodedata

INPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data',
                          '1_意大利语动词搭配大全_(裴兰湘著)_(Z-Library).md')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data',
                           'verb-collocations-data.js')

PREPOSITIONS = [
    'a', 'di', 'da', 'con', 'per', 'in', 'su', 'tra', 'fra',
    'verso', 'contro', 'presso', 'tra/fra', 'attraverso'
]

PREPOSITION_ALIASES = {
    'dii': 'di',
    'd': 'da',
    'co': 'con',
    'pe': 'per',
    'i': 'in',
    's': 'su',
    'tr': 'tra',
    'fr': 'fra',
    'vers': 'verso',
    'attraverso': 'attraverso',
}

def normalize_verb(verb):
    """Clean up verb name."""
    verb = re.sub(r'[*_#`$]+', '', verb)
    verb = re.sub(r'\s+', ' ', verb)
    return verb.strip().lower()


def normalize_prep(prep):
    """Canonicalize prepositions and common OCR variants."""
    prep = re.sub(r'[*_#`$]+', '', prep).strip().lower()
    prep = PREPOSITION_ALIASES.get(prep, prep)
    return prep if prep in PREPOSITIONS else None


def slugify_base(text):
    """Make a mostly-ASCII stable slug base from a verb."""
    normalized = unicodedata.normalize('NFKD', text)
    ascii_text = ''.join(ch for ch in normalized if not unicodedata.combining(ch))
    slug = re.sub(r'[^a-z0-9]+', '_', ascii_text.lower()).strip('_')
    return slug or 'verb'


def safe_slug(verb, existing_verbs, slug_lookup):
    """Generate a unique slug for a verb display form."""
    if verb in slug_lookup:
        return slug_lookup[verb]

    base = slugify_base(verb)
    slug = base
    counter = 2
    while slug in existing_verbs and existing_verbs[slug]['display'] != verb:
        slug = f'{base}_{counter}'
        counter += 1

    slug_lookup[verb] = slug
    return slug


def dedupe_keep_order(items):
    """Remove duplicates while preserving order."""
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def prep_sort_key(prep):
    """Sort known prepositions in a friendly fixed order, then unknown ones."""
    try:
        return (0, PREPOSITIONS.index(prep))
    except ValueError:
        return (1, prep)

def parse_entry_header(line):
    """
    Try to extract (verb, preposition) from a line like:
      $$pensare+a$$
      pensare + a
      abbandonare+a
    Returns (verb, prep) or None.
    """
    # Pattern: $$verb+prep$$ or verb+prep (with optional spaces)
    line = line.strip()
    # Remove $$ wrappers
    line = line.replace('$$', '').strip()
    line = re.sub(r'^[#*\-\s]+', '', line)
    line = re.sub(r'[*_`]+', '', line)
    
    # Match "verb + prep" or "verb+prep"
    m = re.match(r'^([a-zA-Zàèéìòùáíóú/\s]+?)\s*\+\s*([a-zA-Z/]+)\s*$', line)
    if m:
        verb = normalize_verb(m.group(1))
        prep = normalize_prep(m.group(2))
        if verb and prep and len(verb) > 1:
            return (verb, prep)
    return None

def is_section_header(line):
    """Detect major section headers to skip."""
    patterns = [
        r'^#+ ',
        r'^第[一二三四五六七八九十]+部分',
        r'^\(Verbo\+',
        r'^附录',
        r'^动词搭配结构总表',
        r'^动词释义总表',
    ]
    for p in patterns:
        if re.search(p, line):
            return True
    return False

def is_example_line(line):
    """A line that looks like an example sentence or phrase."""
    line = line.strip()
    if not line:
        return False
    # Skip HTML comments, image tags, page numbers
    if line.startswith('<!--') or line.startswith('![') or line.startswith('<'):
        return False
    # Skip pure Chinese section headers
    if re.match(r'^[一二三四五六七八九十\d]+[、．.。]', line):
        return False
    return True

def parse_md(filepath):
    """Parse the Markdown source and return verb data grouped by verb + prep."""
    verbs = {}
    slug_lookup = {}

    current_verb = None
    current_prep = None
    current_examples = []

    def flush():
        nonlocal current_verb, current_prep, current_examples
        if current_verb and current_prep and current_examples:
            slug = safe_slug(current_verb, verbs, slug_lookup)
            if slug not in verbs:
                verbs[slug] = {"display": current_verb, "entries": []}

            current_examples_clean = dedupe_keep_order(current_examples)
            existing = next((e for e in verbs[slug]["entries"] if e["prep"] == current_prep), None)
            if existing:
                existing["examples"] = dedupe_keep_order(existing["examples"] + current_examples_clean)
            else:
                verbs[slug]["entries"].append({
                    "prep": current_prep,
                    "examples": current_examples_clean,
                })
        current_examples = []

    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        stripped = line.strip()
        
        if not stripped:
            continue
        if stripped.startswith('<!--') or stripped.startswith('!['):
            continue
        if is_section_header(stripped):
            continue

        parsed = parse_entry_header(stripped)
        if parsed:
            flush()
            current_verb, current_prep = parsed
            current_examples = []
            continue

        if current_verb and current_prep:
            if is_example_line(stripped):
                clean = stripped.lstrip('- *').strip()
                if clean and len(clean) > 3:
                    current_examples.append(clean)

    flush()
    return verbs

def build_output(verbs):
    """Build the dual index needed by the frontend.

    Output shape:
    {
      meta: {...},
      verbs: {
        slug: {
          display: "parlare",
          prepositions: { a: [...], con: [...] },
          prepositionOrder: ["a", "con"]
        }
      },
      prepositions: {
        a: ["andare", "parlare", ...]
      }
    }
    """
    verbs_output = {}
    prepositions_output = {}
    total_examples = 0

    for slug, data in sorted(verbs.items(), key=lambda item: item[1]['display']):
        sorted_entries = sorted(data['entries'], key=lambda entry: prep_sort_key(entry['prep']))
        preposition_map = {}
        preposition_order = []

        for entry in sorted_entries:
            prep = entry['prep']
            examples = dedupe_keep_order(entry['examples'])
            if not examples:
                continue

            total_examples += len(examples)
            preposition_map[prep] = examples
            preposition_order.append(prep)
            prepositions_output.setdefault(prep, []).append(slug)

        if preposition_map:
            verbs_output[slug] = {
                'display': data['display'],
                'prepositions': preposition_map,
                'prepositionOrder': preposition_order,
            }

    for prep, slugs in prepositions_output.items():
        prepositions_output[prep] = sorted(
            dedupe_keep_order(slugs),
            key=lambda slug: verbs_output[slug]['display']
        )

    ordered_prepositions = sorted(prepositions_output.keys(), key=prep_sort_key)

    return {
        'meta': {
            'totalVerbs': len(verbs_output),
            'totalExamples': total_examples,
            'prepositionOrder': ordered_prepositions,
        },
        'verbs': verbs_output,
        'prepositions': prepositions_output,
    }

def main():
    print(f"Parsing {INPUT_FILE}...")
    verbs = parse_md(INPUT_FILE)
    print(f"Found {len(verbs)} verb entries.")

    output = build_output(verbs)
    print(f"Tracked prepositions: {output['meta']['prepositionOrder']}")

    js_content = "const VERB_COLLOCATIONS_DATA = " + json.dumps(output, ensure_ascii=False, indent=2) + ";\n"

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"Written to {OUTPUT_FILE}")
    print(f"Total verbs: {output['meta']['totalVerbs']}")
    print(f"Total examples: {output['meta']['totalExamples']}")

if __name__ == '__main__':
    main()
