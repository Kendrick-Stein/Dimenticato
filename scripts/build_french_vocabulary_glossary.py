#!/usr/bin/env python3
"""Build the static French glossary dataset from reviewed OCR JSON.

The OCR input is produced from the "Lexique trilingue" pages in the four
user-owned 你好！法语 student books. This builder keeps the final website data
deterministic while documenting the small set of OCR corrections applied after
French spell-check review.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path


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
}

TRAILING_OCR_POS = re.compile(
    r"(?i)(?:\s+v|ack|acv?|ach|acj|adj|adv|conj|interj|nf|nm|vt|vi|prep|loc)$"
)
SIMPLE_HEADWORD = re.compile(r"^[A-Za-zÀ-ÿŒœÇç-]+$")


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


def build_entries(source_entries: list[dict[str, object]]) -> list[dict[str, object]]:
    output: list[dict[str, object]] = []
    seen: set[str] = set()

    for raw in source_entries:
        headword = choose_headword(raw)
        if not headword or headword in DROP_HEADWORDS or not balanced(headword):
            continue
        if any(char in headword for char in ('|', '\n', '\r', '#', '[', ']')):
            continue

        meaning = str(raw.get('meaning') or '').replace('|', '；').strip('； ')
        meaning = MEANING_CORRECTIONS.get(headword, meaning)
        if not meaning:
            continue

        key = normalize_key(headword)
        if not key or key in seen:
            continue
        seen.add(key)

        level = str(raw.get('level') or '')
        part_of_speech = str(raw.get('partOfSpeech') or '').rstrip('.')
        page = str(raw.get('page') or '')
        source = str(raw.get('source') or '教材总词汇表')
        output.append({
            'french': headword,
            'display': headword,
            'meaning': meaning,
            'chinese': meaning,
            'notes': f'{level} · 教材总词汇表 · {part_of_speech}',
            'rank': len(output) + 1,
            'source': f'{source} · PDF p.{page}',
            'level': level,
            'partOfSpeech': part_of_speech,
            'textbookPage': page,
        })

    return output


def write_javascript(entries: list[dict[str, object]], output_path: Path) -> None:
    lines = [
        '// Generated French vocabulary extracted from the four 你好！法语',
        '// "Lexique trilingue" sections. Rebuild with:',
        '// python3 scripts/build_french_vocabulary_glossary.py INPUT_JSON OUTPUT_JS',
        '// The website redistributes vocabulary records only, never scanned pages.',
        '',
        'const FRENCH_GLOSSARY_VOCABULARY_DATA = [',
    ]
    for entry in entries:
        lines.append('  ' + json.dumps(entry, ensure_ascii=False, separators=(',', ':')) + ',')
    lines.extend([
        '];',
        '',
        "if (typeof module !== 'undefined' && module.exports) {",
        '  module.exports = FRENCH_GLOSSARY_VOCABULARY_DATA;',
        '}',
        '',
    ])
    output_path.write_text('\n'.join(lines), encoding='utf-8')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('input_json', type=Path)
    parser.add_argument('output_js', type=Path)
    args = parser.parse_args()

    source_entries = json.loads(args.input_json.read_text(encoding='utf-8'))
    entries = build_entries(source_entries)
    write_javascript(entries, args.output_js)

    counts = {
        level: sum(item['level'] == level for item in entries)
        for level in ('A1', 'A2', 'B1', 'B2')
    }
    print(json.dumps({'total': len(entries), 'byLevel': counts}, ensure_ascii=False))


if __name__ == '__main__':
    main()
