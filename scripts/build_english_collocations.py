#!/usr/bin/env python3
"""Build data/english-collocations-data.js (ENGLISH_VERB_COLLOCATIONS_DATA).

Authored source lives in scripts/english_collocations_source/*.txt (one file per
letter range).  All example sentences and Chinese translations there are
original, written for this project.  wordfreq (Zipf frequency) is used only to
rank verbs.

Source format
-------------
    # comment
    == depend
    on | 依靠；取决于
    - Whether we go depends on the weather. || 我们去不去取决于天气。
    ~up | 放弃
    - He gave up smoking last year. || 他去年戒烟了。

* ``== <verb>``           starts a verb block (base form, lowercase).
* ``<key> | <中文义项>``   starts a sense.  ``<key>`` is the preposition or
  adverb particle(s) that follow the verb, e.g. ``on``, ``up``, ``up with``,
  ``forward to``.  Prefix ``~`` marks an adverb particle (phrasal verb:
  give up, turn down); no prefix marks a dependent preposition (depend on).
  The same key may appear several times with different senses (take off =
  起飞 / 脱下); all its examples are merged under that key.
* ``- <English> || <中文>`` an example of the current sense (1-4 per sense).

Output shape (identical to data/verb-collocations-data.js):
    { meta: { totalVerbs, totalExamples, prepositionOrder, language, ... },
      verbs: { slug: { display, prepositions: { key: ["<en> <zh>", ...] },
                       prepositionOrder: [...], ...additive } },
      prepositions: { key: [slug, ...] } }

Additive fields (ignored by the renderer):
    meta.particles    keys used at least once as an adverb particle
    meta.keyKinds     key -> "preposition" | "particle" | "both"
    meta.sources / meta.generatedBy
    verbs[x].zipf     wordfreq Zipf frequency of the verb
    verbs[x].senses   key -> [{ zh, kind, examples: [indices into prepositions[key]] }]

Usage:
    python3 scripts/build_english_collocations.py          # build
    python3 scripts/build_english_collocations.py --check  # parse + lint only
    python3 scripts/build_english_collocations.py --check g3_def.txt
"""
import json
import re
import sys
from collections import OrderedDict, defaultdict
from pathlib import Path
from data_module import register_footer

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / 'scripts' / 'english_collocations_source'
OUT = ROOT / 'data' / 'english-collocations-data.js'

CJK = re.compile(r'[一-鿿]')
CJK_START = re.compile(r'^[一-鿿　-〿]')
EN_OK = re.compile(r"^[A-Za-z][A-Za-z0-9 ,.'?!;:]*[.!?]$")

# Fixed display order for single-word keys; multi-word keys follow, by usage.
BASE_ORDER = [
    'about', 'at', 'for', 'from', 'in', 'into', 'of', 'on', 'onto', 'to', 'with',
    'against', 'among', 'as', 'between', 'by', 'like', 'toward', 'towards', 'under', 'upon', 'without',
    'up', 'out', 'off', 'down', 'away', 'back', 'over', 'through', 'around', 'along',
    'across', 'aside', 'apart', 'ahead', 'behind', 'forward', 'together', 'past', 'round',
]

# ---- inflection (mirrors scripts/validate_english_collocations.js) ----
IRREGULAR = {
    'arise': 'arises arose arisen arising', 'awake': 'awoke awoken',
    'be': 'am is are was were been being', 'bear': 'bore borne born',
    'beat': 'beaten', 'become': 'became', 'begin': 'began begun beginning',
    'bend': 'bent', 'bet': 'betting', 'bind': 'bound', 'bite': 'bit bitten',
    'bleed': 'bled', 'blow': 'blew blown', 'break': 'broke broken',
    'breed': 'bred', 'bring': 'brought', 'build': 'built', 'burn': 'burnt',
    'burst': 'bursting', 'buy': 'bought', 'cast': 'casting', 'catch': 'caught',
    'choose': 'chose chosen', 'cling': 'clung', 'come': 'came', 'cost': 'costing',
    'creep': 'crept', 'cut': 'cutting', 'deal': 'dealt', 'dig': 'dug digging',
    'dive': 'dove', 'do': 'does did done doing', 'draw': 'drew drawn',
    'dream': 'dreamt', 'drink': 'drank drunk', 'drive': 'drove driven',
    'dwell': 'dwelt', 'eat': 'ate eaten', 'fall': 'fell fallen', 'feed': 'fed',
    'feel': 'felt', 'fight': 'fought', 'find': 'found', 'flee': 'fled',
    'fling': 'flung', 'fly': 'flew flown flies', 'forbid': 'forbade forbidden',
    'forget': 'forgot forgotten forgetting', 'forgive': 'forgave forgiven',
    'freeze': 'froze frozen', 'get': 'got gotten getting', 'give': 'gave given',
    'go': 'goes went gone', 'grind': 'ground', 'grow': 'grew grown',
    'hang': 'hung', 'have': 'has had having', 'hear': 'heard', 'hide': 'hid hidden',
    'hit': 'hitting', 'hold': 'held', 'hurt': 'hurting', 'keep': 'kept',
    'kneel': 'knelt', 'know': 'knew known', 'lay': 'laid', 'lead': 'led',
    'lean': 'leant', 'leap': 'leapt', 'learn': 'learnt', 'leave': 'left',
    'lend': 'lent', 'let': 'letting', 'lie': 'lay lain lying lied', 'light': 'lit',
    'lose': 'lost', 'make': 'made', 'mean': 'meant', 'meet': 'met', 'mistake': 'mistook mistaken',
    'overcome': 'overcame', 'pay': 'paid', 'prove': 'proven', 'put': 'putting',
    'quit': 'quitting', 'read': 'reading', 'rid': 'ridding', 'ride': 'rode ridden',
    'ring': 'rang rung', 'rise': 'rose risen', 'run': 'ran running', 'say': 'said',
    'see': 'saw seen', 'seek': 'sought', 'sell': 'sold', 'send': 'sent',
    'set': 'setting', 'shake': 'shook shaken', 'shed': 'shedding', 'shine': 'shone',
    'shoot': 'shot', 'show': 'shown', 'shrink': 'shrank shrunk', 'shut': 'shutting',
    'sing': 'sang sung', 'sink': 'sank sunk', 'sit': 'sat sitting', 'sleep': 'slept',
    'slide': 'slid', 'sling': 'slung', 'slip': 'slipped', 'speak': 'spoke spoken',
    'speed': 'sped', 'spend': 'spent', 'spill': 'spilt', 'spin': 'spun spinning',
    'spit': 'spat spitting', 'split': 'splitting', 'spread': 'spreading',
    'spring': 'sprang sprung', 'stand': 'stood', 'steal': 'stole stolen',
    'stick': 'stuck', 'sting': 'stung', 'stink': 'stank stunk', 'strike': 'struck stricken',
    'strive': 'strove striven', 'string': 'strung', 'swear': 'swore sworn',
    'sweep': 'swept', 'swell': 'swollen', 'swim': 'swam swum swimming',
    'swing': 'swung', 'take': 'took taken', 'teach': 'taught', 'tear': 'tore torn',
    'tell': 'told', 'think': 'thought', 'throw': 'threw thrown', 'thrust': 'thrusting',
    'tread': 'trod trodden', 'undergo': 'underwent undergone', 'understand': 'understood',
    'undertake': 'undertook undertaken', 'upset': 'upsetting', 'wake': 'woke woken',
    'wear': 'wore worn', 'weave': 'wove woven', 'weep': 'wept', 'win': 'won winning',
    'wind': 'wound', 'withdraw': 'withdrew withdrawn', 'withstand': 'withstood',
    'wring': 'wrung', 'write': 'wrote written', 'fit': 'fitting', 'bid': 'bidding',
    'forsee': 'foresaw foreseen', 'foresee': 'foresaw foreseen', 'outgrow': 'outgrew outgrown',
    'oversee': 'oversaw overseen', 'overtake': 'overtook overtaken', 'overhear': 'overheard',
    'override': 'overrode overridden', 'overthrow': 'overthrew overthrown',
    'misunderstand': 'misunderstood', 'mislead': 'misled', 'uphold': 'upheld',
    'withhold': 'withheld', 'backslide': 'backslid', 'broadcast': 'broadcasting',
    'can': 'could', 'will': 'would', 'shall': 'should', 'may': 'might',
}

CONS = 'bcdfghjklmnpqrstvwxz'


def inflections(verb):
    """Generous candidate set of inflected forms (over-generation is harmless:
    it only has to recognise real forms)."""
    v = verb.lower()
    forms = {v}
    forms.update(IRREGULAR.get(v, '').split())
    # suffixes
    if re.search(r'(s|x|z|ch|sh|o)$', v):
        forms.add(v + 'es')
    if re.search(r'[^aeiou]y$', v):
        forms.update({v[:-1] + 'ies', v[:-1] + 'ied'})
    forms.add(v + 's')
    if v.endswith('e'):
        forms.update({v + 'd', v[:-1] + 'ing'})
        if v.endswith('ie'):
            forms.add(v[:-2] + 'ying')
    else:
        forms.update({v + 'ed', v + 'ing'})
    if len(v) >= 3 and v[-1] in CONS and v[-1] not in 'wxy' and v[-2] in 'aeiou':
        forms.update({v + v[-1] + 'ed', v + v[-1] + 'ing'})
    if v.endswith('c'):
        forms.update({v + 'ked', v + 'king'})
    return forms


def sentence_has_verb(sentence, verb):
    words = re.findall(r"[a-z]+", sentence.lower())
    forms = inflections(verb)
    return any(w in forms for w in words)


def sentence_has_key(sentence, key):
    words = re.findall(r"[a-z]+", sentence.lower())
    parts = key.split()
    i = 0
    for w in words:
        if i < len(parts) and w == parts[i]:
            i += 1
    return i == len(parts)


# ---------------------------------------------------------------- parse

class ParseError(Exception):
    pass


def parse_file(path):
    verbs = OrderedDict()
    errors = []
    cur_verb = None
    cur_sense = None
    for lineno, raw in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        line = raw.strip()
        where = f'{path.name}:{lineno}'
        if not line or line.startswith('#'):
            continue
        if line.startswith('=='):
            name = line[2:].strip()
            if not re.fullmatch(r'[a-z]+', name):
                errors.append(f'{where}: bad verb name {name!r}')
                cur_verb = None
                continue
            if name in verbs:
                errors.append(f'{where}: verb {name!r} declared twice in this file')
            cur_verb = verbs.setdefault(name, {'senses': [], 'line': where})
            cur_sense = None
            continue
        if line.startswith('-'):
            if cur_sense is None:
                errors.append(f'{where}: example outside a sense')
                continue
            body = line[1:].strip()
            if '||' not in body:
                errors.append(f'{where}: example missing "||" separator')
                continue
            en, zh = [s.strip() for s in body.split('||', 1)]
            cur_sense['examples'].append((en, zh, where))
            continue
        if '|' in line:
            if cur_verb is None:
                errors.append(f'{where}: sense outside a verb block')
                continue
            key, zh = [s.strip() for s in line.split('|', 1)]
            kind = 'preposition'
            if key.startswith('~'):
                kind = 'particle'
                key = key[1:].strip()
            if not re.fullmatch(r'[a-z]+( [a-z]+)*', key):
                errors.append(f'{where}: bad key {key!r}')
                continue
            cur_sense = {'key': key, 'kind': kind, 'zh': zh, 'examples': [], 'line': where}
            cur_verb['senses'].append(cur_sense)
            continue
        errors.append(f'{where}: unrecognised line {line[:60]!r}')
    return verbs, errors


def lint(verbs):
    errors = []
    seen_en = {}
    for verb, data in verbs.items():
        if not data['senses']:
            errors.append(f'{data["line"]}: verb {verb!r} has no senses')
        for sense in data['senses']:
            n = len(sense['examples'])
            if not 1 <= n <= 4:
                errors.append(f'{sense["line"]}: {verb} {sense["key"]} has {n} examples (need 1-4)')
            if not sense['zh'] or not CJK.search(sense['zh']):
                errors.append(f'{sense["line"]}: sense gloss must be Chinese')
            for en, zh, where in sense['examples']:
                if CJK.search(en):
                    errors.append(f'{where}: English half contains CJK')
                if not EN_OK.match(en):
                    errors.append(f'{where}: English must be plain ASCII sentence ending in . ! or ?: {en!r}')
                if not zh or not CJK_START.match(zh):
                    errors.append(f'{where}: Chinese half must start with a Chinese character: {zh!r}')
                if not sentence_has_verb(en, verb):
                    errors.append(f'{where}: no form of {verb!r} in {en!r}')
                if not sentence_has_key(en, sense['key']):
                    errors.append(f'{where}: key {sense["key"]!r} missing in {en!r}')
                low = en.lower()
                if low in seen_en:
                    errors.append(f'{where}: duplicate English sentence (also {seen_en[low]})')
                seen_en[low] = where
    return errors


def load_all(only=None):
    files = sorted(SRC_DIR.glob('*.txt'))
    if only:
        files = [f for f in files if f.name in only]
    merged = OrderedDict()
    errors = []
    for f in files:
        verbs, errs = parse_file(f)
        errors += errs
        for verb, data in verbs.items():
            if verb in merged:
                errors.append(f'{data["line"]}: verb {verb!r} already defined at {merged[verb]["line"]}')
                continue
            merged[verb] = data
    errors += lint(merged)
    return merged, errors, files


# ---------------------------------------------------------------- build

def zipf(word):
    try:
        from wordfreq import zipf_frequency
    except ImportError:  # ranking is cosmetic; keep the build reproducible without it
        return 0.0
    return round(zipf_frequency(word, 'en'), 2)


def build(verbs):
    key_kinds = defaultdict(set)
    key_usage = defaultdict(int)
    out_verbs = OrderedDict()
    total_examples = 0
    for verb in sorted(verbs):
        data = verbs[verb]
        preps = OrderedDict()
        senses = OrderedDict()
        for sense in data['senses']:
            key = sense['key']
            lst = preps.setdefault(key, [])
            start = len(lst)
            lst.extend(f'{en} {zh}' for en, zh, _ in sense['examples'])
            senses.setdefault(key, []).append({
                'zh': sense['zh'],
                'kind': sense['kind'],
                'examples': list(range(start, len(lst))),
            })
            key_kinds[key].add(sense['kind'])
        for key in preps:
            key_usage[key] += 1
        total_examples += sum(len(v) for v in preps.values())
        out_verbs[verb] = {
            'display': verb,
            'prepositions': preps,
            'prepositionOrder': list(preps.keys()),
            'zipf': zipf(verb),
            'senses': senses,
        }

    used = set(key_usage)
    order = [k for k in BASE_ORDER if k in used]
    rest = sorted((k for k in used if k not in order), key=lambda k: (' ' in k, -key_usage[k], k))
    order += rest

    prep_index = OrderedDict((k, [v for v in out_verbs if k in out_verbs[v]['prepositions']]) for k in order)
    kinds = OrderedDict()
    for k in order:
        s = key_kinds[k]
        kinds[k] = 'both' if len(s) == 2 else next(iter(s))
    particles = [k for k in order if 'particle' in key_kinds[k]]

    return {
        'meta': {
            'totalVerbs': len(out_verbs),
            'totalExamples': total_examples,
            'prepositionOrder': order,
            'language': 'english',
            'particles': particles,
            'keyKinds': kinds,
            'keyNote': ('Keys are whatever follows the verb: a dependent preposition '
                        '(depend on), an adverb particle of a phrasal verb (give up), '
                        'or a particle + preposition sequence (put up with). '
                        'keyKinds tells them apart; "both" means the key is used both ways '
                        'by different verbs/senses.'),
            'sources': [{
                'id': 'authored',
                'label': '本项目自编英语动词搭配与例句（原创句子与中文翻译）',
                'license': 'project-authored',
            }, {
                'id': 'wordfreq',
                'label': 'wordfreq Zipf 频率（仅用于动词排序）',
                'license': 'wordfreq MIT / data CC BY-SA 4.0',
            }],
            'generatedBy': 'scripts/build_english_collocations.py',
        },
        'verbs': out_verbs,
        'prepositions': prep_index,
    }


def write(dataset):
    meta = dataset['meta']
    header = (
        '// English verb collocations: verb + dependent preposition (depend on) and\n'
        '// phrasal verbs (give up, put up with).  GENERATED - edit\n'
        '// scripts/english_collocations_source/*.txt and re-run\n'
        '//   python3 scripts/build_english_collocations.py\n'
        '// Mirrors the Italian data/verb-collocations-data.js shape exactly:\n'
        '//   { meta: { totalVerbs, totalExamples, prepositionOrder },\n'
        '//     verbs: { <slug>: { display, prepositions: { <key>: ["<en> <zh>"] }, prepositionOrder } },\n'
        '//     prepositions: { <key>: [<slug>] } }\n'
        '// Keys include adverb particles (up, out, off...) and multi-word sequences\n'
        '// (up with); meta.keyKinds / meta.particles tell prepositions and particles apart.\n'
        '// Additive fields (ignored by the renderer): meta.language, meta.particles,\n'
        '//   meta.keyKinds, meta.sources, verbs[x].zipf, verbs[x].senses.\n'
        '// Sources: sentences and translations authored for this project; wordfreq for ranking.\n'
        f'// Total verbs: {meta["totalVerbs"]} / Total examples: {meta["totalExamples"]}\n\n'
    )
    body = json.dumps(dataset, ensure_ascii=False, indent=2)
    OUT.write_text(header + 'const ENGLISH_VERB_COLLOCATIONS_DATA = ' + body + ';\n'
                   + register_footer('collocations', 'en', 'ENGLISH_VERB_COLLOCATIONS_DATA'), encoding='utf-8')


def main(argv):
    check_only = '--check' in argv
    only = [a for a in argv if not a.startswith('--')]
    verbs, errors, files = load_all(only or None)
    n_ex = sum(len(s['examples']) for v in verbs.values() for s in v['senses'])
    n_sense = sum(len(v['senses']) for v in verbs.values())
    print(f'{len(files)} source files, {len(verbs)} verbs, {n_sense} senses, {n_ex} examples')
    if errors:
        for e in errors:
            print('ERROR ' + e)
        print(f'{len(errors)} errors')
        return 1
    if check_only:
        print('OK (check only)')
        return 0
    dataset = build(verbs)
    write(dataset)
    print(f'wrote {OUT.relative_to(ROOT)}: {dataset["meta"]["totalVerbs"]} verbs, '
          f'{dataset["meta"]["totalExamples"]} examples, {len(dataset["prepositions"])} keys')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
