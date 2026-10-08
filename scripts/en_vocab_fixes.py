#!/usr/bin/env python3
"""Audited fixes for data/vocab/en.js: an idempotent post-pass.

scripts/build_english_vocab.py calls ``main()`` after it writes the file, so a
rebuild keeps every fix.  It can also be run on its own:

    python3 scripts/en_vocab_fixes.py            # apply (idempotent)
    python3 scripts/en_vocab_fixes.py --regen    # recompute the decision lists

The decisions live in scripts/en_vocab_fixes/ (committed):

  merged-forms.json   "merge":  inflected headword -> lemma headword.  The form
                                 is removed; its freq is added to the lemma.
                      "rename": inflected headword -> lemma that is not a
                                 headword.  The most frequent form is renamed to
                                 the lemma (legacyWord keeps the old spelling),
                                 the other forms merge into it.
                      "keep":   inflection-shaped headwords kept on purpose
                                 (lexicalised: "found", "left", "glasses",
                                 "interested"), with the reason.
  proper-nouns.json   "keep":   the only properNoun / abbreviation entries that
                                 survive (countries, continents, learner
                                 abbreviations); "retag": abbreviations that are
                                 ordinary words now ("app" -> noun).  Every other
                                 entry whose primary pos is properNoun or
                                 abbreviation is dropped by rule.
  zh-overrides.json   word -> hand-checked zh, applied after the automatic
                      cleanup (``clean_zh``).

``--regen`` needs lemminflect, babel and data/vocab/src/en-lexicon.tsv (UD
counts + Open English WordNet lemmas).  It only adds decisions for headwords
the lists do not mention yet, so earlier (hand-checked) decisions are stable
and a regen on an already fixed file changes nothing.

Progress: entries are keyed by ``word``.  A lemma that absorbs forms gets
``legacyWord`` = every merged form (a list when more than one), so progress
saved under that form resolves to the lemma.  The full form -> lemma map is in
merged-forms.json for a resolver that can take more than one legacy spelling.
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import vocab_schema as vs  # noqa: E402

FIX_DIR = HERE / 'en_vocab_fixes'
MERGED = FIX_DIR / 'merged-forms.json'
PROPER = FIX_DIR / 'proper-nouns.json'
ZH_OVERRIDES = FIX_DIR / 'zh-overrides.json'
LEXICON = vs.ROOT / 'data' / 'vocab' / 'src' / 'en-lexicon.tsv'

ZH_MAX = 40          # learner gloss budget (characters)

# --------------------------------------------------------------------------
# zh cleanup
# --------------------------------------------------------------------------

CJK = re.compile(r'[一-鿿]')
# "( begin的第三人称单数 )", "（discover的过去形式）", "(be)的过去分词", "have 的过去式"
INFL_CORE = (r'(?:的|之)\s*(?:名词|动词|形容词)?\s*'
             r'(?:复数|过去|现在分词|第三人称|三单|单三|比较级|最高级|ing形式|进行时|分词|单数)')
INFL_PAREN = re.compile(r'[(（][^()（）]*' + INFL_CORE + r'[^()（）]*[)）]')
INFL_NOTE = re.compile(r'^[(（]?\s*[A-Za-z][A-Za-z\s\-\'()]*?\s*[)）]?\s*' + INFL_CORE + r'.*$')
INFL_ANY = re.compile(INFL_CORE)
ENGLISH_INFL = re.compile(r'past tense|past participle|plural of', re.I)
# Acronym expansions glued onto a common word: "WHO(the World Health ...)",
# "（Central America Research ...）", "PM(prime minister)".
ACRONYM_PAREN = re.compile(r'[(（]\s*(?:the\s+)?[A-Za-z][A-Za-z\'.&-]*(?:[ ,/-]+[A-Za-z][A-Za-z\'.&-]*){1,}\s*[)）]')
UPPER_RUN = re.compile(r'(?<![A-Za-z])[A-Z]{2,}(?![a-z])')
LATIN_WORDS = re.compile(r'[A-Za-z]{2,}(?:\s+[A-Za-z]{2,}){1,}')
# Senses that are names of things, not the word: organisations, software,
# brands, books of the Bible, TV series, bands.
NAME_SENSE = re.compile(
    r'组织|公司|协会|联盟|联合会|委员会|研究所|研究站|中心（|软件|系统（|程序（|乐队|乐团|'
    r'剧集|电视剧|球队|品牌|集团|网站|游戏机|圣经|旧约|新约|福音|[男女]子名|人名|姓氏|地名|'
    r'美国州名|首府|商标|牌名|标准（|服务（|协议（|规则（|接口|数据库|模块|终端|存储器|处理器')
# Domain tags whose sense is specialist jargon for a learner.
SPECIALIST_TAG = re.compile(
    r'^\s*(?:\[(?:圣经|宗|计|医|解|化|生化|律|法|数学|逻|希神|罗神|史|天|物|植|动|鸟|鱼|昆|矿|冶|'
    r'建|机|电|纺|印|摄|航|海|军|经|商|乐|音|语法|语|生物|地|地质|气|农|船|数)\]|'
    r'<(?:古|律|苏格兰|拉|法|废|罕|诗|方)>)')
STRIP_TAG = re.compile(r'\[(?:复|总称|常，|，|常作[^\]]*|谓语用单数|作单数用|用作单数|姓氏|国名)\]|'
                       r'<(?:美|英|口|俚|美俚|美口|英俚|主美|主英|俗|正|非正|贬|生|主|英口|美俗|谑|旧|书)>')
GARBAGE = re.compile(r'\?\?|\?\s*[一-鿿]|[一-鿿]\?[一-鿿]|�')
GROUP_SPLIT = re.compile(r'\s*[;；]\s*')
SENSE_SPLIT = re.compile(r'\s*[,，、]\s*')


def _split(zh: str) -> list:
    """'a,b；c' -> [['a','b'],['c']] (top-level only: separators inside
    brackets stay inside the sense)."""
    groups, cur, sense, depth = [], [], '', 0
    for ch in zh:
        if ch in '([（【<《':
            depth += 1
        elif ch in ')]）】>》' and depth:
            depth -= 1
        if depth == 0 and ch in ';；':
            cur.append(sense)
            groups.append(cur)
            cur, sense = [], ''
        elif depth == 0 and ch in ',，、':
            cur.append(sense)
            sense = ''
        else:
            sense += ch
    cur.append(sense)
    groups.append(cur)
    return [[s.strip() for s in g if s.strip()] for g in groups if any(s.strip() for s in g)]


def _join(groups: list) -> str:
    return '；'.join(','.join(g) for g in groups if g)


def _clean_sense(s: str, *, keep_names: bool) -> str:
    """One sense -> cleaned sense, or '' when the whole sense is noise."""
    if GARBAGE.search(s):
        s = re.sub(r'\?+', '', s)
        if not CJK.search(s) or len(CJK.findall(s)) < 2:
            return ''
        return ''           # "??人事的": mangled characters, drop the sense
    if INFL_NOTE.match(s) or ENGLISH_INFL.search(s):
        return ''           # "be的过去式", "(past tense, past participle of may ..."
    s = INFL_PAREN.sub('', s)
    if SPECIALIST_TAG.match(s):
        return ''
    if not keep_names and NAME_SENSE.search(s):
        return ''
    if not keep_names and (UPPER_RUN.search(s) and LATIN_WORDS.search(s)):
        return ''           # "世界卫生组织 WHO(the World Health Organization)"
    s = ACRONYM_PAREN.sub('', s)
    s = STRIP_TAG.sub('', s)
    s = re.sub(r'\s+', ' ', s).strip(' ,，;；、')
    if not CJK.search(s):
        return ''
    s = re.sub(r'^\(\s*[,，]?\s*\)', '', s).strip()
    s = re.sub(r'[(（]\s*[)）]', '', s).strip()
    return s


def clean_zh(zh: str, *, keep_names: bool = False, limit: int = ZH_MAX) -> str:
    """Main learner senses of a raw ECDICT / EnWords gloss.

    Drops inflection notes, '??' garbage, specialist-domain senses and (for
    common words) organisation / software / book-of-the-Bible senses, then keeps
    whole senses up to ``limit`` characters.  Idempotent.  Returns '' when no
    sense survives (the caller keeps the original or uses an override).
    """
    groups = []
    seen = set()
    for g in _split(zh):
        out = []
        for s in g:
            c = _clean_sense(s, keep_names=keep_names)
            if c and c not in seen:
                seen.add(c)
                out.append(c)
        if out:
            groups.append(out)
    if not groups:
        return ''
    # Budget: whole senses up to ``limit`` characters.  The first three
    # senses of every part-of-speech group come first (so "even" keeps its
    # adverb after a long adjective group), then the rest in order.  The first
    # sense is always kept (cut at a sub-sense boundary if it alone is too long).
    order = [(gi, si) for gi, g in enumerate(groups) for si in range(min(3, len(g)))]
    order += [(gi, si) for gi, g in enumerate(groups) for si in range(3, len(g))]
    chosen, length = set(), -1
    for gi, si in order:
        add = len(groups[gi][si]) + 1
        if chosen and length + add > limit:
            continue
        chosen.add((gi, si))
        length += add
    kept = [[s for si, s in enumerate(g) if (gi, si) in chosen] for gi, g in enumerate(groups)]
    kept = [g for g in kept if g]
    text = _join(kept)
    if len(text) > limit:
        first = kept[0][0]
        cut = first[:limit]
        for sep in ('，', ',', '、', ' '):
            i = cut.rfind(sep)
            if i >= 8:
                cut = cut[:i]
                break
        text = cut.strip(' ,，;；')
        # unbalanced bracket after the cut
        for o, c in ('()', '（）', '[]', '<>'):
            if text.count(o) > text.count(c):
                text = text[:text.rfind(o)].strip(' ,，;；')
        if not CJK.search(text):        # the cut left only the English part
            text = first
    return text


# --------------------------------------------------------------------------
# apply
# --------------------------------------------------------------------------

def _load(path: Path, default):
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default


def _sig3(x):
    if not x:
        return x
    from math import floor, log10
    digits = 3 - int(floor(log10(abs(x)))) - 1
    return float(round(x, digits))


def _target(form: str, merge: dict) -> str:
    seen = set()
    while form in merge and form not in seen:
        seen.add(form)
        form = merge[form]
    return form


def apply(entries: list) -> tuple[list, dict]:
    merged = _load(MERGED, {'merge': {}, 'rename': {}, 'keep': {}})
    proper = _load(PROPER, {'keep': {}, 'retag': {}})
    overrides = _load(ZH_OVERRIDES, {})
    stats = defaultdict(int)
    by = {e['word']: e for e in entries}
    absorbed = defaultdict(list)          # lemma -> [(freq, form)]
    gone = set()

    # 1. lemma missing: promote the most frequent form to the lemma.
    groups = defaultdict(list)
    for form, lemma in merged.get('rename', {}).items():
        if form in by:
            groups[lemma].append(by[form])
    for lemma, forms in sorted(groups.items()):
        if lemma in by:
            for f in forms:                # the lemma exists now: plain merge
                merged['merge'].setdefault(f['word'], lemma)
            continue
        forms.sort(key=lambda e: (-(e['freq'] or 0), e['rank']))
        head = forms[0]
        old = head['word']
        del by[old]
        head['word'] = lemma
        if not head.get('legacyWord'):
            head['legacyWord'] = old
        by[lemma] = head
        stats['renamed'] += 1
        for f in forms[1:]:
            merged['merge'].setdefault(f['word'], lemma)

    # 2. merge forms into their lemma.
    merge = merged.get('merge', {})
    for form in list(merge):
        e = by.get(form)
        if not e or form in gone:
            continue
        lemma = _target(form, merge)
        if lemma == form or lemma not in by or lemma in gone:
            continue
        absorbed[lemma].append((e['freq'] or 0, form))
        gone.add(form)
        stats['merged'] += 1
    for lemma, forms in absorbed.items():
        e = by[lemma]
        e['freq'] = _sig3((e['freq'] or 0) + sum(f for f, _ in forms)) or None
        # every absorbed form, so progress keyed by any of them still resolves
        old = e.get('legacyWord') or []
        old = [old] if isinstance(old, str) else list(old)
        new = [f for _, f in sorted(forms, key=lambda t: (-t[0], t[1]))]
        words = list(dict.fromkeys(old + new))
        e['legacyWord'] = words[0] if len(words) == 1 else words

    # 3. proper nouns and abbreviations: allowlist only.
    keep, retag = proper.get('keep', {}), proper.get('retag', {})
    for e in entries:
        w = e['word']
        if w in gone or by.get(w) is not e:
            continue
        if w in retag and e.get('pos') in ('properNoun', 'abbreviation'):
            e['pos'] = retag[w]
            e['posAll'] = [p for p in (e.get('posAll') or []) if p not in ('properNoun', 'abbreviation')]
            if e['posAll'] and e['posAll'][0] != e['pos']:
                e['posAll'] = [e['pos']] + [p for p in e['posAll'] if p != e['pos']]
            if len(e['posAll']) < 2:
                e.pop('posAll', None)
            stats['retagged'] += 1
        elif e.get('pos') in ('properNoun', 'abbreviation') and w not in keep:
            gone.add(w)
            stats['dropped-proper'] += 1

    survivors = [e for e in entries if e['word'] not in gone and by.get(e['word']) is e]

    # 4. zh cleanup.
    for e in survivors:
        if e['word'] in overrides:
            z = overrides[e['word']]
        else:
            names = e.get('pos') in ('properNoun', 'abbreviation')
            z = e['zh']
            for _ in range(5):          # to a fixed point, so a rerun is a no-op
                nz = clean_zh(z, keep_names=names) or clean_zh(z, keep_names=True) or z
                if nz == z:
                    break
                z = nz
        if z != e['zh']:
            e['zh'] = z
            stats['zh-cleaned'] += 1

    # 5. re-rank by frequency; English levels are all frequency bands.
    survivors.sort(key=lambda e: (-(e['freq'] or 0), e['rank']))
    for i, e in enumerate(survivors, 1):
        if e['rank'] != i:
            stats['reranked'] += 1
        e['rank'] = i
        if e.get('levelSource', 'freq-band') == 'freq-band':
            e['level'] = vs.band_level(i) if e['freq'] else 'C2'
            e['levelSource'] = 'freq-band'
    return [vs.clean_entry(e) for e in survivors], dict(stats)


def main() -> dict:
    data = vs.read_vocab('en')
    meta = data['meta']
    before = json.dumps(data['entries'], ensure_ascii=False)
    out, stats = apply(data['entries'])
    if json.dumps(out, ensure_ascii=False) != before:
        vs.write_vocab('en', out, sources=meta['sources'], licences=meta['licences'],
                       builder=meta['builder'], notes=meta.get('notes', ''))
        print(f'en_vocab_fixes: {len(out)} entries; {stats}')
    else:
        print('en_vocab_fixes: already applied (no change)')
    return stats


# --------------------------------------------------------------------------
# --regen: decision lists from lemminflect + UD + Open English WordNet
# --------------------------------------------------------------------------

# Headwords the rules below would merge but that a learner meets as words of
# their own (modal pasts, prepositions, pluralia tantum and plurals with their
# own sense).  Hand-checked; small on purpose.
LEXICAL_KEEP = {
    'should': 'modal', 'would': 'modal', 'could': 'modal', 'might': 'modal (and noun "might")',
    'including': 'preposition', 'according': 'according to', 'lying': 'adjective / noun (lies)',
    'used': 'adjective; "used to"', 'later': 'adverb', 'earlier': 'adverb',
    'data': 'uncountable noun', 'media': 'noun (the media)', 'lots': 'lots of',
    'goods': 'noun (merchandise)', 'means': 'noun (a means)', 'minutes': 'noun (of a meeting)',
    'terms': 'noun (conditions)', 'arms': 'noun (weapons)', 'remains': 'noun',
    'glasses': 'noun (spectacles)', 'spectacles': 'noun', 'customs': 'noun', 'manners': 'noun',
    'contents': 'noun', 'talks': 'noun (negotiations)', 'works': 'noun (factory; oeuvre)',
    'statistics': 'noun (field)', 'tactics': 'noun', 'stairs': 'noun', 'damages': 'noun (law)',
    'shorts': 'noun (garment)', 'mechanics': 'noun (field)', 'graphics': 'noun',
    'credits': 'noun (film)', 'wages': 'noun', 'spirits': 'noun (mood; liquor)',
    'proceedings': 'noun', 'innings': 'noun', 'greens': 'noun (vegetables)', 'pains': 'noun (effort)',
    'fries': 'noun', 'dice': 'noun', 'maths': 'noun', 'compliments': 'noun', 'optics': 'noun',
    'liabilities': 'noun', 'braces': 'noun', 'drawers': 'noun (underwear)', 'darts': 'noun (game)',
    'leftovers': 'noun', 'straits': 'noun', 'wits': 'noun', 'briefs': 'noun (underwear)',
    'marbles': 'noun (game)', 'physics': 'noun (field)', 'pants': 'noun', 'trousers': 'noun',
    'premises': 'noun', 'credentials': 'noun', 'amenities': 'noun', 'tropics': 'noun',
    'quarters': 'noun (lodging)', 'authorities': 'noun (the authorities)', 'arts': 'noun (the arts)',
    'bacteria': 'noun', 'algae': 'noun', 'graffiti': 'noun', 'crossroads': 'noun',
    'hostilities': 'noun', 'insignia': 'noun', 'auspices': 'noun', 'guts': 'noun (courage)',
    'woods': 'noun (forest)', 'opera': 'noun', 'doubles': 'noun (tennis)', 'checkers': 'noun (game)',
    'savings': 'noun', 'belongings': 'noun', 'surroundings': 'noun', 'shades': 'noun (sunglasses)',
    'falls': 'noun (waterfall)', 'heavens': 'noun', 'irons': 'noun (fetters)', 'regrets': 'noun',
    'born': 'be born', 'supposed': 'be supposed to', 'following': 'adjective / preposition',
    'stamina': 'noun', 'cola': 'noun', 'stove': 'noun (not a form of stave)',
    'scissors': 'noun', 'barracks': 'noun', 'goggles': 'noun', 'leggings': 'noun',
    'panties': 'noun', 'handcuffs': 'noun', 'condolences': 'noun', 'shenanigans': 'noun',
    'shambles': 'noun', 'confines': 'noun', 'italics': 'noun', 'antics': 'noun',
    'fireworks': 'noun', 'outgoing': 'adjective', 'impending': 'adjective',
    'tories': 'noun (the Tories)', 'bates': 'name', 'sears': 'name', 'grimes': 'name',
    'cummins': 'name', 'abode': 'noun', 'dive': 'verb / noun (not a form of diva)',
    'dove': 'noun (bird)', 'broke': 'adjective (no money)',
}
# Validator gold rows (scripts/validate_vocab.js, LANGS.en.gold) that this pass
# would otherwise remove.  Kept until the gold rows are updated.
PINNED = {'is': 'validate_vocab.js gold row', 'York': 'validate_vocab.js gold row',
          'Luke': 'validate_vocab.js gold row', 'Jerry': 'validate_vocab.js gold row',
          'ate': 'validate_vocab.js gold row'}

TAGS = {'VERB': {'VERB', 'AUX'}, 'AUX': {'VERB', 'AUX'}, 'NOUN': {'NOUN'},
        'ADJ': {'ADJ', 'ADV'}, 'ADV': {'ADJ', 'ADV'}}
WNPOS = {'VERB': 'v', 'AUX': 'v', 'NOUN': 'n', 'ADJ': 'as', 'ADV': 'r'}
IGNORE_UD = {'PROPN', 'X', 'PUNCT', 'SYM'}


def _lexicon() -> dict:
    lex = {}
    if not LEXICON.exists():
        return lex
    for line in LEXICON.read_text(encoding='utf-8').splitlines():
        if line.startswith('#'):
            continue
        w, ud, _case, wn = (line.split('\t') + ['', '', ''])[:4]
        udc = {k: int(v) for k, v in (x.split('=') for x in ud.split(',') if x)}
        wnl = [(f, p, int(n)) for f, p, n, _i in (x.split('|') for x in wn.split(';') if x)]
        lex[w] = (udc, wnl)
    return lex


def classify_inflections(entries: list) -> dict:
    """{'merge':{}, 'rename':{}, 'keep':{}} for the inflection-shaped headwords.

    A lowercase headword is an inflected form when lemminflect lists it among
    the inflections of another lemma.  It is kept as its own word when
      * it is an irregular comparative / superlative ("better", "worst"),
        or OEWN lists it with a non-adjective sense ("number", "lower");
      * UD tags it with a part of speech that is not the inflection's in at
        least 15% of >= 5 tokens ("building" NOUN, "interested" ADJ);
      * it is a verb form that OEWN also lists as a verb lemma and its gloss is
        not an inflection note ("found", "felt", "saw", "lay");
      * with < 5 UD tokens, OEWN lists it as an adjective with >= 2 senses and
        its gloss is adjectival ("frightening");
      * it is in LEXICAL_KEEP / PINNED (hand-checked).
    Otherwise it merges into the lemma (the most frequent lemma headword);
    when the lemma is not a headword, a noun / verb form is renamed to it.
    """
    from lemminflect import getAllInflections, getAllLemmas
    lex = _lexicon()
    by = {e['word']: e for e in entries}
    out = {'merge': {}, 'rename': {}, 'keep': {}}
    for e in entries:
        w = e['word']
        if not (w.isalpha() and w.islower()):
            continue
        cands = defaultdict(set)
        for up, lemmas in getAllLemmas(w).items():
            for lemma in lemmas:
                if lemma != w and any(w in v for v in getAllInflections(lemma).values()):
                    cands[lemma].add(up)
        if not cands:
            continue
        present = [x for x in cands if x in by]
        lemma = (max(present, key=lambda x: (by[x]['freq'] or 0, x)) if present
                 else max(sorted(cands), key=lambda x: len(cands[x])))
        ups = cands[lemma]
        infl_tags = set().union(*(TAGS.get(u, {u}) for u in ups))
        udc, wnl = lex.get(w, ({}, []))
        tot = sum(v for k, v in udc.items() if k not in IGNORE_UD)
        other = sum(v for k, v in udc.items() if k not in infl_tags | IGNORE_UD)
        share = other / tot if tot else 0.0
        wn_self = [(p, n) for f, p, n in wnl if f == w]
        infl_wn = set(''.join(WNPOS.get(u, '') for u in ups))
        wn_other = sum(n for p, n in wn_self if p not in infl_wn)
        wn_same = sum(n for p, n in wn_self if p in infl_wn)
        first = re.split(r'[,，;；]', e['zh'])[0]
        zh_infl = bool(INFL_ANY.search(first) or ENGLISH_INFL.search(first)
                       or re.match(r'\s*' + re.escape(lemma) + r'\b', e['zh']))
        noun = 'NOUN' in ups
        reason = ''
        if w in PINNED:
            reason = PINNED[w]
        elif w in LEXICAL_KEEP:
            reason = 'lexicalised: ' + LEXICAL_KEEP[w]
        elif infl_tags == {'ADJ', 'ADV'}:
            if not w.startswith(lemma[:max(2, len(lemma) - 2)]):
                reason = 'irregular comparison'
            elif any(p not in 'asr' for p, _ in wn_self):
                reason = 'OEWN non-adjective sense'
        elif tot >= 5 and share >= 0.15:
            reason = f'UD other-POS share {share:.2f}'
        elif not noun and wn_same >= 1 and not zh_infl:
            reason = 'OEWN verb lemma of its own'
        elif not noun and tot < 5 and wn_other >= 2 and not zh_infl and first.endswith('的'):
            reason = 'OEWN adjective'
        if reason:
            out['keep'][w] = reason
        elif lemma in by:
            out['merge'][w] = lemma
        elif (noun and e.get('pos') == 'noun' and not w.endswith('ing')) or (
                e.get('pos') == 'verb' and zh_infl):
            out['rename'][w] = lemma
        elif w.endswith('ing') and e.get('pos') == 'noun':
            out['keep'][w] = 'gerund noun, lemma not a headword'
        else:
            out['keep'][w] = 'adjective use, lemma not a headword'
    return out


# Abbreviations a learner meets in everyday English (checked against the
# glosses in the file); everything else tagged abbreviation is dropped.
ABBR_KEEP = ('Mr', 'Mrs', 'Ms', 'Dr', 'CEO', 'DNA', 'DVD', 'GPS', 'PhD', 'HIV', 'NASA', 'NATO',
             'pc', 'bc', 'pm', 'mp', 'usb', 'wifi', 'gb', 'mb', 'oz', 'lol', 'btw', 'aka', 'atm',
             'iq', 'diy', 'ps', 'sms', 'FAQ', 'ie', 'eg', 'UK', 'USA', 'GDP', 'UN', 'EU')
# Ordinary words the gloss parser tagged as abbreviations.
RETAG = {'app': 'noun', 'bio': 'noun', 'bro': 'noun'}
# Country-level names that are not territory names in CLDR ("England") or are
# spelled differently there ("South Korea").
GEO_EXTRA = ('America', 'Britain', 'England', 'Scotland', 'Wales', 'Korea', 'Holland',
             'Arabia', 'Palestine')


def classify_proper(entries: list) -> dict:
    """properNoun / abbreviation keep list.

    Kept: CLDR (babel) English territory names (countries, continents,
    regions); CLDR language names whose gloss says language / people
    (语 / 人 / 族); GEO_EXTRA; ABBR_KEEP; PINNED.  Dropped: people, cities,
    states, companies, brands, organisations and the remaining acronyms.
    """
    from babel import Locale
    loc = Locale('en')
    territories = set(loc.territories.values())
    languages = set(loc.languages.values())
    keep = {}
    for e in entries:
        w, pos = e['word'], e.get('pos')
        if pos not in ('properNoun', 'abbreviation'):
            continue
        if w in PINNED:
            keep[w] = PINNED[w]
        elif w in territories or w in GEO_EXTRA:
            keep[w] = 'country / continent'
        elif w in languages and '语' in e['zh'] and '人名' not in e['zh']:
            keep[w] = 'language / people'
        elif w in ABBR_KEEP:
            keep[w] = 'learner abbreviation'
    return {'keep': keep, 'retag': {w: p for w, p in RETAG.items()
                                    if any(e['word'] == w for e in entries)}}


def regen() -> None:
    entries = vs.read_vocab('en')['entries']
    FIX_DIR.mkdir(exist_ok=True)
    old = _load(MERGED, {'merge': {}, 'rename': {}, 'keep': {}})
    new = classify_inflections(entries)
    decided = set(old['merge']) | set(old['rename']) | set(old['keep'])
    for k in ('merge', 'rename', 'keep'):
        for w, v in new[k].items():
            if w not in decided:
                old[k][w] = v
    for w in list(old['merge']) + list(old['rename']):     # hand keeps win
        if w in LEXICAL_KEEP or w in PINNED:
            old['merge'].pop(w, None)
            old['rename'].pop(w, None)
            old['keep'][w] = PINNED.get(w) or 'lexicalised: ' + LEXICAL_KEEP[w]
    MERGED.write_text(json.dumps({k: dict(sorted(old[k].items())) for k in ('merge', 'rename', 'keep')},
                                 ensure_ascii=False, indent=0) + '\n', encoding='utf-8')
    oldp = _load(PROPER, {'keep': {}, 'retag': {}})
    newp = classify_proper(entries)
    for k in ('keep', 'retag'):
        for w, v in newp[k].items():
            oldp[k].setdefault(w, v)
    PROPER.write_text(json.dumps({k: dict(sorted(oldp[k].items())) for k in ('keep', 'retag')},
                                 ensure_ascii=False, indent=0) + '\n', encoding='utf-8')
    if not ZH_OVERRIDES.exists():
        ZH_OVERRIDES.write_text('{}\n', encoding='utf-8')
    print(f"regen: merge {len(old['merge'])}, rename {len(old['rename'])}, keep {len(old['keep'])}; "
          f"proper keep {len(oldp['keep'])}, retag {len(oldp['retag'])}")


if __name__ == '__main__':
    if '--regen' in sys.argv[1:]:
        regen()
    else:
        main()
