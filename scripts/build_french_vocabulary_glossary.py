#!/usr/bin/env python3
"""Build the static French textbook glossary dataset.

The glossary is the *authoritative* A1-B2 layer of the French module: it is the
only source of CEFR levels, part of speech and textbook page numbers, and it
wins over the frequency-derived core corpus on conflict.

Two input modes:

  ``--ocr INPUT_JSON``
      the original path - reviewed OCR of the "Lexique trilingue" pages in the
      four user-owned 你好！法语 student books.

  ``--regenerate data/french-vocabulary-glossary.js``
      re-reads the *generated* dataset that is already committed.  The reviewed
      OCR JSON was never committed, so this mode is what makes the file
      reproducible from the repository alone.  It is idempotent.

Either way the builder now also:

  * splits textbook masculine(feminine) notation out of the headword
    (``acteur(trice)`` -> ``french: "acteur"``, ``feminine: "actrice"``,
    ``display: "acteur (actrice)"``) so the spelling drill is answerable;
  * repairs the OCR artifacts confirmed by the content audit;
  * attaches a real corpus frequency + rank from Lexique 3.83, an English
    gloss from Wiktionary, and an explicit ``gender`` field;
  * guarantees that no two French headwords ship the same Chinese gloss.

Usage:
    python3 scripts/build_french_vocabulary_glossary.py \
        --regenerate data/french-vocabulary-glossary.js \
        --freq /tmp/frv/fr_freq.json --fren /tmp/frv/fr_en2.json \
        --enzh /tmp/frv/en_zh2.json \
        --curriculum data/french-vocabulary.js \
        --out data/french-vocabulary-glossary.js
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_french_vocabulary import (  # noqa: E402
    GlossRegistry,
    LEXIQUE_SOURCE,
    Resources,
    WIKT_SOURCE,
    clean_chinese,
    exact_key,
    gloss_is_bad,
    load_js_array,
    nfc,
    norm_apostrophe,
    parse_curriculum,
    pos_family,
    pos_label,
    split_variant,
    write_js_array,
)

DROP_HEADWORDS = {
    'adj', 'conj', 'interj', 'prep', 'vI', 'vt', 'vtind',
}

CORRECTIONS = {
    'boite': 'boîte',
    'entrainement': 'entraînement',
    'entrainer(s)': "s'entraîner",
    'epanouir (s)': "s'épanouir",
    'Etat': 'État',
    'ile': 'île',
    'age': 'âge',
    'agendalazeda': 'agenda',
    'fenétre': 'fenêtre',
    'brüler': 'brûler',
    'decision': 'décision',
    'ise': 'risque',
    'attractifve': 'attractif / attractive',
    'considerer': 'considérer',
    'gemissement': 'gémissement',
    'jutice': 'justice',
    'residente': 'résident(e)',
    'superieure': 'supérieur(e)',
    'tabanisme': 'tabagisme',
    'intempestifive': 'intempestif / intempestive',
    'mecontente': 'mécontent(e)',
    'montgolfère': 'montgolfière',
    'àlaide de': "à l'aide de",
    'âme soeur': 'âme sœur',
    'avoir peur (de': 'avoir peur de',
    'fnile)': 'fini(e)',
    'sportiflive)': 'sportif(ive)',
    'inscrire(s': "s'inscrire",
    "mode'nf": 'mode',
    "mode'": 'mode',
    'significatif,ve': 'significatif(ve)',
    'communicant,e': 'communicant(e)',
    # --- audit fr-soeur-duplicate-and-extraction-artifacts / fr-paren-headwords
    'heurter w': 'heurter',            # stray OCR column letter
    'Italien(ne)n': 'Italien(ne)',     # stray OCR letter after the paren
    'faire attention a': 'faire attention à',
    'se développe': 'se développer',   # conjugated form stored as headword
    'complet(éte)': 'complet(ète)',    # OCR typo that survived review
    'soeur': 'sœur',                   # ligature duplicate of the core entry
    'diner': 'dîner',                  # accent lost in OCR
    # `ad` carries the gloss 最后；终于；总之 - i.e. the entry is a mangled
    # `enfin`, which the curriculum already ships. Restoring the spelling lets
    # the app's own de-duplication fold it away instead of teaching "ad".
    'ad': 'enfin',
}

# Nouns whose gender is documented in neither Lexique nor Wiktionary.
GENDER_OVERRIDES = {
    'passionné': 'm',
}

# Part-of-speech repairs for entries the OCR mis-tagged.
POS_CORRECTIONS = {
    'faire attention à': 'loc',
    "à l'aide de": 'loc',
    'de moins en moins (de)': 'loc',
    'en dehors de': 'loc',
    'ainsi que': 'loc',
    'avoir peur de': 'loc',
    'se développer': 'v.pr',
}

# Vision OCR keeps the glossary rows reliably, but some long Chinese definitions
# wrap onto a second printed line. These reviewed replacements restore those
# continuations and normalize dictionary usage labels.
MEANING_CORRECTIONS = {
    'adorer': '热爱；爱慕；宠爱；喜爱（口语）',
    'aller': '去程；去程的火车票或飞机票',
    'ça': '这个；那个（口语）',
    'copain(copine)': '朋友；伙伴；同伴（口语）',
    'fac': '大学（faculté 的口语缩写）',
    'face': '（物体的）面',
    "s'entraîner": '训练；练习',
    'île': '岛',
    'ouais': '哦；是的（口语）',
    'prof': '教师（professeur 的口语缩写）',
    'de moins en moins (de)': '越来越少（的）',
    'doubler': '超过；超车',
    'énervé(e)': '恼火的（口语）',
    'énerver': '使激动；使恼火（口语）',
    'matière': '物质；材料；题材；内容',
    'mécanicien(ne)': '机械师；技工',
    'mi-temps': '半日工作制；兼职工作',
    'nombreux(se)': '为数众多的；许多的',
    'prendre': '采取；采用；拿；取',
    'rendre': '还；归还；交还',
    'repère': '标记；标志；方位标；参照点',
    'réaction': '反应；反响',
    'truc': '小窍门；东西；玩意儿（口语）',
    'volant': '驾驶盘；方向盘；（转）驾车',
    'cap': '海角；（转）关口；难关',
    'cliché': '底片；快照；（转，贬）陈词滥调',
    'encadrer': '装以框子；（转）统率；指挥',
    'farniente': '闲逸；悠闲（口语）',
    'feeling': '感觉；感受（英语借词，口语）',
    'génération': '一代；一代人',
    'promo': '同届学生（promotion 的口语缩写）',
    'quinquagénaire': '五十几岁的；五十几岁的人',
    'rejoindre': '与……重聚；赶上',
    'se régaler': '享受丰盛饭菜；享受美味；（转）感到愉快',
    'sortie': '出口',
    'terrible': '了不起的（口语）',
    'accro': '入了迷的人；上瘾者（口语）',
    'ainsi que': '以及；和；如同；正如',
    'aveugle': '盲的；（转）盲目的',
    'background': '后台；背景',
    'cata': '大灾难；糟糕透顶（catastrophe 的口语缩写）',
    'cra-cra': '极脏的（口语）',
    'se dédouaner': '把自己摘干净（口语）',
    'échelle': '梯子；（转）范围；规模',
    'en dehors de': '在……之外；除……以外',
    'vague': '波浪；浪潮；（转）大批；系列',
    'virer (à)': '转变为',
    'viser (à)': '旨在；以……为目的',
    'zen': '禅的；平静放松的',
    # --- audit repairs -------------------------------------------------
    'beurrer': '涂以黄油',            # 黃 -> 黄 (traditional char in a simplified set)
    'heurter': '碰撞；撞击',
    'CD': '激光唱片；光盘',
    'UV': '紫外线',
    'CV': '履历；简历',
    'kit': '配套组装元件；成套用品',
    'éco': '生态学（écologie 的口语缩写）',
    'mec': '硬汉；男子汉（口语）',
    'thé': '茶；茶叶',
    'une': '报纸头版',
}

TRAILING_OCR_POS = re.compile(
    r"(?i)(?:\s+v|ack|acv?|ach|acj|adj|adv|conj|interj|nf|nm|vt|vi|prep|loc)$"
)
SIMPLE_HEADWORD = re.compile(r"^[A-Za-zÀ-ÿŒœÇç-]+$")
VERB_ENDING = re.compile(r"(?:er|ir|re|oir)$", re.I)

# Generic OCR damage: a part-of-speech letter glued to the end of the headword
# (`Italien(ne)n`, `agriculteur(trice)n`) or split off as a bare token
# (`heurter w`). Both are confirmed by the content audit.
STRAY_AFTER_PAREN = re.compile(r'\)\s*(?:adi|adj|adv|nf|nm|vt|vi|[nmfv])$')
STRAY_TOKEN = re.compile(r'^(?P<word>\S+(?: \S+)*?)\s+[a-z]$')


def repair_ocr_headword(word: str, forms: set[str]) -> str:
    match = STRAY_AFTER_PAREN.search(word)
    if match:
        word = word[:match.start() + 1].strip()
    match = STRAY_TOKEN.match(word)
    if match:
        candidate = match.group('word')
        if candidate.lower() in forms or ' ' in candidate:
            word = candidate
    return word


def normalize_key(value: str) -> str:
    value = unicodedata.normalize('NFKD', value.lower())
    value = ''.join(char for char in value if not unicodedata.combining(char))
    value = value.replace('’', "'").replace('œ', 'oe')
    return re.sub(r"[^a-z0-9' -]+", '', value).strip()


def balanced(value: str) -> bool:
    return value.count('(') == value.count(')')


def canonicalize_reflexive(headword: str, part_of_speech: str) -> str:
    if not part_of_speech.startswith('v.'):
        return headword
    match = re.match(r"^(.+?)\s*\((s'|s|se)\)(.*)$", headword, re.I)
    if not match:
        return headword
    infinitive, _, suffix = match.groups()
    infinitive = infinitive.strip()
    prefix = "s'" if infinitive[:1].lower() in 'aeiouyhàâäéèêëîïôöùûü' else 'se '
    return f'{prefix}{infinitive}{suffix}'.strip()


def choose_headword(entry: dict[str, object]) -> str:
    current = str(entry.get('french') or '').strip()
    french_ocr = str(entry.get('frenchOCR') or '').strip()
    suggestions = [str(item) for item in entry.get('suggestions') or []]

    if current in CORRECTIONS:
        current = CORRECTIONS[current]
    elif TRAILING_OCR_POS.search(current) and french_ocr:
        current = french_ocr
    elif not balanced(current) and french_ocr and balanced(french_ocr):
        current = french_ocr
    elif (
        entry.get('spellStatus') == 'miss'
        and french_ocr
        and SIMPLE_HEADWORD.fullmatch(french_ocr)
        and french_ocr in suggestions
    ):
        current = french_ocr

    current = CORRECTIONS.get(current, current)
    current = current.strip(" '\t")
    current = canonicalize_reflexive(current, str(entry.get('partOfSpeech') or ''))
    return re.sub(r'\s+', ' ', current).strip()


# --------------------------------------------------------------------------
# input adapters
# --------------------------------------------------------------------------

def rows_from_ocr(path: Path) -> list[dict]:
    raw_entries = json.loads(path.read_text(encoding='utf-8'))
    rows = []
    for raw in raw_entries:
        headword = choose_headword(raw)
        if not headword or headword in DROP_HEADWORDS or not balanced(headword):
            continue
        if any(char in headword for char in ('|', '\n', '\r', '#', '[', ']')):
            continue
        meaning = str(raw.get('meaning') or '').replace('|', '；').strip('； ')
        if not meaning:
            continue
        rows.append({
            'french': headword,
            'meaning': meaning,
            'level': str(raw.get('level') or ''),
            'partOfSpeech': str(raw.get('partOfSpeech') or '').rstrip('.'),
            'page': str(raw.get('page') or ''),
            'source': str(raw.get('source') or '教材总词汇表'),
        })
    return rows


def rows_from_generated(path: Path) -> list[dict]:
    rows = []
    for entry in load_js_array(path):
        # `display` preserves the printed textbook notation, so regenerating
        # from an already-split dataset stays idempotent.
        printed = entry.get('printed') or entry.get('display') or entry['french']
        source = entry.get('source', '')
        book = source.split(' · ')[0] if ' · ' in source else source
        rows.append({
            'french': printed,
            'meaning': entry.get('printedMeaning') or entry['chinese'],
            'level': entry.get('level', ''),
            'partOfSpeech': entry.get('printedPartOfSpeech') or entry.get('partOfSpeech', ''),
            'page': str(entry.get('textbookPage', '')),
            'source': book,
        })
    return rows


# --------------------------------------------------------------------------
# build
# --------------------------------------------------------------------------

HEADER = [
    '// French textbook glossary - the authoritative A1-B2 layer of the module.',
    '// Extracted from the four 你好！法语 "Lexique trilingue" sections; the site',
    '// redistributes vocabulary records only, never scanned pages.',
    '//',
    '// Enriched (2026) with:',
    f'//   * corpus frequency + rank from {LEXIQUE_SOURCE}',
    f'//   * English glosses from {WIKT_SOURCE}',
    '//   * an explicit `gender` field, and `feminine` split out of headwords',
    '//     that printed the masculine(feminine) notation, so `french` is always',
    '//     a spellable form. `printed` keeps the original textbook notation.',
    '//',
    '// Rebuild with:',
    '//   python3 scripts/build_french_vocabulary_glossary.py --regenerate <this file> ...',
]


def build(args) -> None:
    res = Resources(args.freq, args.fren, args.enzh)
    rows = rows_from_ocr(args.ocr) if args.ocr else rows_from_generated(args.regenerate)

    curriculum = parse_curriculum(args.curriculum) if args.curriculum else []
    taken: dict[str, str] = {}
    for entry in curriculum:
        taken.setdefault(entry['meaning'], entry['french'])
    registry = GlossRegistry(taken)

    entries: list[dict] = []
    seen: set[str] = set()
    stats = {'rows': len(rows), 'merged_homograph': 0, 'dropped_empty': 0,
             'repaired_headword': 0, 'feminine_split': 0, 'bad_gloss': 0}

    by_key: dict[str, dict] = {}
    for row in rows:
        printed = norm_apostrophe(row['french'])
        headword = CORRECTIONS.get(printed, printed)
        headword = repair_ocr_headword(headword, res.forms)
        headword = CORRECTIONS.get(headword, headword)
        if headword != printed:
            stats['repaired_headword'] += 1
        if not headword or headword in DROP_HEADWORDS or not balanced(headword):
            stats['dropped_empty'] += 1
            continue

        meaning = MEANING_CORRECTIONS.get(headword, MEANING_CORRECTIONS.get(printed, row['meaning']))
        meaning = clean_chinese(meaning)
        if not meaning:
            stats['dropped_empty'] += 1
            continue

        base, feminine, display, construction = split_variant(headword, res.forms)
        if feminine:
            stats['feminine_split'] += 1
        key = normalize_key(base)
        if not key:
            stats['dropped_empty'] += 1
            continue
        if key in seen:
            # Homograph collision created by splitting the printed
            # masculine(feminine) notation (`espagnol` n.m + `espagnol(e)` adj).
            # Merge the senses instead of throwing one of them away.
            stats['merged_homograph'] += 1
            target = by_key[key]
            merged = clean_chinese(target['chinese'] + '；' + meaning)
            target['chinese'] = target['meaning'] = merged
            extra = POS_CORRECTIONS.get(base, row['partOfSpeech'] or '').rstrip('.')
            if extra and extra not in target['partOfSpeech'].split(' / '):
                target['partOfSpeech'] = f"{target['partOfSpeech']} / {extra}"
                target['notes'] = f"{target['level']} · 教材总词汇表 · {target['partOfSpeech']}"
            if feminine and not target['feminine']:
                target['feminine'] = feminine
                target['display'] = display
            continue
        seen.add(key)

        level = row['level']
        printed_pos = (row['partOfSpeech'] or '').rstrip('.')
        pos = POS_CORRECTIONS.get(base, printed_pos)
        pos = pos.rstrip('.')
        freq = res.frequency(base)
        gender = ''
        match = re.match(r'^n\.(m|f)', pos)
        if match:
            gender = match.group(1)
        elif pos.startswith('n') and freq and freq.get('pos') == 'n':
            gender = freq.get('gender', '')
        if feminine and pos_family(pos) == 'n':
            # the printed row tagged the pair (`acteur(trice)` -> "n.f"); the
            # BASE headword is the masculine, the feminine now has its own field
            gender = (freq or {}).get('gender', '') or 'm'
            pos = 'n.m' if gender == 'm' else 'n.f'
        gender = GENDER_OVERRIDES.get(base, gender)
        if not pos:
            pos = pos_label(freq['pos'], gender, base) if freq else 'n'
        if pos_family(pos) == 'n' and not gender:
            bucket = res.wiktionary(base) or {}
            gender = (bucket.get('n') or {}).get('gender', '')
        if pos_family(pos) == 'n' and not gender:
            form = res.form_index.get(base.lower())
            if form and form['pos'] in ('n', 'adj'):
                gender = form.get('gender', '')
        if pos_family(pos) == 'n' and not gender and base[:1].isupper():
            pos = 'n.pr'  # proper noun (country / city): no grammatical gender
        if pos_family(pos) == 'n' and gender and pos in ('n', 'n.'):
            pos = 'n.m' if gender == 'm' else 'n.f'
        # a v.* headword must look like an infinitive (audit lint)
        if pos.startswith('v') and not VERB_ENDING.search(base.replace('(', '')):
            pos = 'loc' if ' ' in base else pos

        english, _ = res.english(base, pos)
        reason = gloss_is_bad(meaning)
        if reason:
            stats['bad_gloss'] += 1
            continue

        entry = {
            'french': base,
            'display': display,
            'printed': printed,
            'feminine': feminine,
            'meaning': meaning,
            'chinese': meaning,
            'english': english,
            'notes': f'{level} · 教材总词汇表 · {pos}',
            'rank': freq['rank'] if freq else None,
            'source': f"{row['source']} · PDF p.{row['page']}",
            'level': level,
            'partOfSpeech': pos,
            'gender': gender,
            'textbookPage': row['page'],
            'frequency': freq['freq'] if freq else None,
            'freqRank': freq['rank'] if freq else None,
            'freqSource': LEXIQUE_SOURCE if freq else '',
        }
        if construction:
            entry['construction'] = construction
        # provenance kept so --regenerate is exactly idempotent
        if meaning != row['meaning']:
            entry['printedMeaning'] = row['meaning']
        if printed_pos and printed_pos != pos:
            entry['printedPartOfSpeech'] = printed_pos
        entries.append(entry)
        by_key[key] = entry

    # ranks: keep the printed glossary order stable for entries with no corpus
    # frequency, but never invent one - `freqRank` stays null for those.
    fallback = 900000
    for index, entry in enumerate(entries):
        if not entry['rank']:
            entry['rank'] = fallback + index

    for entry in entries:
        registry.register(entry)
        entry['meaning'] = entry['chinese']

    write_js_array(args.out, 'FRENCH_GLOSSARY_VOCABULARY_DATA', HEADER, entries)

    by_level = {level: sum(1 for e in entries if e['level'] == level)
                for level in ('A1', 'A2', 'B1', 'B2')}
    print(json.dumps({
        'total': len(entries),
        'byLevel': by_level,
        'withFrequency': sum(1 for e in entries if e['freqRank']),
        'withEnglish': sum(1 for e in entries if e['english']),
        'nounsMissingGender': sum(1 for e in entries
                                  if pos_family(e['partOfSpeech']) == 'n' and not e['gender']),
        'ambiguousGloss': sum(1 for e in entries if e.get('ambiguousGloss')),
        **stats,
    }, ensure_ascii=False))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--ocr', type=Path, help='reviewed OCR JSON (original input)')
    group.add_argument('--regenerate', type=Path, help='an already generated dataset')
    parser.add_argument('--freq', type=Path, required=True)
    parser.add_argument('--fren', type=Path, required=True)
    parser.add_argument('--enzh', type=Path, required=True)
    parser.add_argument('--curriculum', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    build(parser.parse_args())


if __name__ == '__main__':
    main()
