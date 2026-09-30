#!/usr/bin/env python3
"""Add partOfSpeech / gender / level to the Italian vocabulary (vocabulary.js).

vocabulary.js is the committed runtime artifact (its old generator and
data/vocabulary.json are gitignored and stale), so this script enriches it in
place: every existing field and the entry order stay untouched, and re-running
it is idempotent (the tag fields are recomputed from scratch each time).

Fields added
  partOfSpeech  noun | verb | adjective | adverb | pronoun | determiner |
                article | preposition | conjunction | numeral | interjection |
                properNoun | prefix | suffix | phrase
  gender        'm' | 'f' | 'm/f'   nouns only, when a source attests it
                ('m/f' = both genders exist for the sense taught, e.g. "cantante")
  level         A1..C2, INFERRED from the corpus rank, same bands as German:
                position among ranked entries <=600 A1, <=1500 A2, <=3000 B1,
                <=6000 B2, rest C1; entries with no corpus frequency are C2.
  levelSource   'freq-band' | 'unranked'

How the part of speech is chosen
  A headword like "era" is a noun (era) *and* a verb form (was); the card
  teaches one of those via its `english` gloss, so the tag has to match the
  gloss.  Each Wiktionary entry for the word is scored by how well its glosses
  cover our English senses (earlier senses weigh more); "to …" glosses favour
  verbs, English inflected verb forms ("was", "said") favour Italian verb
  forms.  The POS word leading the old `dictionary` field is only a weak prior:
  it is wrong for many function words ("io", "fare", "essere" are all labelled
  noun there).  Without a Wiktionary entry, Morph-it! analyses decide, and the
  `dictionary` prior only as a last resort.

Sources (downloads kept out of the repo, build-time only)
  Wiktionary via kaikki.org (CC BY-SA):
    curl -o /tmp/itv/kaikki-it.jsonl \\
      https://kaikki.org/dictionary/Italian/kaikki.org-dictionary-Italian.jsonl
  Morph-it! 0.48 (CC BY-SA 2.0 / LGPL), Zanchetta & Baroni:
    curl -L -o /tmp/itv/morph-it.tgz \\
      "https://docs.sslmit.unibo.it/lib/exe/fetch.php?media=resources:morph-it.tgz"
    tar xzf morph-it.tgz; iconv -f latin1 -t utf-8 \\
      current_version/morph-it_048.txt > /tmp/itv/morph.utf8

  python3 scripts/build_italian_vocabulary_tags.py \\
      --kaikki /tmp/itv/kaikki-it.jsonl --morphit /tmp/itv/morph.utf8
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOCAB = ROOT / 'vocabulary.js'
PREFIX = 'const VOCABULARY_DATA = '
TAG_FIELDS = ('partOfSpeech', 'gender', 'level', 'levelSource', 'tagSource')

KAIKKI_POS = {
    'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
    'pron': 'pronoun', 'det': 'determiner', 'article': 'article',
    'prep': 'preposition', 'contraction': 'preposition', 'conj': 'conjunction',
    'num': 'numeral', 'intj': 'interjection', 'name': 'properNoun',
    'prefix': 'prefix', 'suffix': 'suffix', 'phrase': 'phrase',
    'prep_phrase': 'phrase', 'adv_phrase': 'phrase', 'proverb': 'phrase',
    'particle': 'adverb',
}

# the leading word of the legacy `dictionary` field
DICT_POS = {
    'noun': 'noun', 'verb': 'verb', 'adjective': 'adjective', 'adverb': 'adverb',
    'pronoun': 'pronoun', 'numeral': 'numeral', 'conjunction': 'conjunction',
    'interjection': 'interjection', 'prefix': 'prefix', 'suffix': 'suffix',
    'preposition': 'preposition', 'article': 'article',
    'possessiveAdjective': 'determiner', 'possessivePronoun': 'pronoun',
    'demonstrativePronoun': 'pronoun',
}


def morphit_pos(tag: str) -> str | None:
    head = tag.split(':')[0]
    if head.startswith('NOUN'):
        return 'noun'
    if head in ('VER', 'AUX', 'CAU', 'MOD', 'ASP'):
        return 'verb'
    if head == 'ADJ':
        return 'adjective'
    if head in ('ADV', 'NE'):
        return 'adverb'
    if head == 'PRE' or head.startswith('ARTPRE'):
        return 'preposition'
    if head.startswith('ART'):
        return 'article'
    if head in ('CON', 'WH-CHE'):
        return 'conjunction'
    if head in ('DET-NUM-CARD', 'PRO-NUM'):
        return 'numeral'
    if head.startswith('DET'):
        return 'determiner'
    if head.startswith('PRO') or head == 'WH':
        return 'pronoun' if head != 'WH' else 'adverb'
    if head == 'INT':
        return 'interjection'
    if head == 'NPR':
        return 'properNoun'
    return None


STOP = {'a', 'an', 'the', 'to', 'of', 'one', "one's", 'oneself', 'something',
        'someone', 'somebody', 'sth', 'sb', 'be', 'or', 'and', 'in', 'for',
        'with', 'on', 'at', 'by', 'from', 'up', 'out', 'as'}
WORD_RE = re.compile(r"[a-z][a-z'\-]*")


def words(text: str) -> set[str]:
    return {w for w in WORD_RE.findall(text.lower()) if w not in STOP}


def split_senses(english: str) -> list[str]:
    out = []
    for part in re.split(r'[;；]', english or ''):
        part = re.sub(r'\([^)]*\)', ' ', part).strip(' .!?,').strip()
        if part:
            out.append(part)
    return out


# English inflected verb forms: "was", "said", "done" …  lemminflect if
# available, otherwise a small closed list is enough for the frequent forms.
IRREG_EN = {'was', 'were', 'is', 'are', 'am', 'been', 'had', 'has', 'did',
            'does', 'done', 'said', 'made', 'went', 'gone', 'got', 'gave',
            'given', 'saw', 'seen', 'came', 'took', 'taken', 'knew', 'known',
            'told', 'put', 'let', 'will', 'would', 'could', 'should', 'can'}
NOT_VERB_FORMS = {'his', 'this', 'its', 'us', 'yes', 'less', 'plus', 'hers',
                  'ours', 'yours', 'theirs', 'thus', 'always', 'news', 'series',
                  'nothing', 'something', 'everything', 'anything', 'morning',
                  'evening', 'during', 'king', 'thing', 'ring', 'sibling'}
try:
    from lemminflect import getLemma  # type: ignore
except Exception:  # pragma: no cover
    getLemma = None


# "I believe", "you are": an English subject pronoun + verb glosses a finite form
PERSON_RE = re.compile(r"^(i|you|he|she|it|we|they)\s+[a-z]")


def is_en_verb_form(token: str) -> bool:
    token = token.lower()
    if token in NOT_VERB_FORMS:
        return False
    if token in IRREG_EN:
        return True
    if getLemma and re.fullmatch(r'[a-z]+(ed|ing|s)', token):
        lemmas = getLemma(token, upos='VERB')
        return bool(lemmas) and lemmas[0] != token
    return False


def kaikki_gender(entry: dict) -> str:
    for tpl in entry.get('head_templates') or []:
        if tpl.get('name') in ('it-noun', 'it-proper noun'):
            # "f,m<l:archaic>", "m,f<l:outdated,or,literary>": a gender carrying a
            # <…> qualifier is archaic/literary/regional — only bare ones count
            spec = str((tpl.get('args') or {}).get('1', ''))
            gs = set()
            for part in spec.split(','):
                part = part.strip()
                if not part or '<' in part:
                    continue
                if part.startswith('mf') or part.startswith('m/f'):
                    gs |= {'m', 'f'}
                elif part[0] in 'mf':
                    gs.add(part[0])
            if gs:
                return 'm/f' if gs == {'m', 'f'} else gs.pop()
            continue
    tags = set()
    for s in entry.get('senses') or []:
        tags.update(s.get('tags') or [])
    if 'masculine' in tags and 'feminine' in tags:
        return 'm/f'
    if 'masculine' in tags:
        return 'm'
    if 'feminine' in tags:
        return 'f'
    return ''


def load_kaikki(path: Path, wanted: set[str]) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = defaultdict(list)
    with path.open(encoding='utf-8') as fh:
        for line in fh:
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            w = d.get('word')
            if w not in wanted:
                continue
            pos = KAIKKI_POS.get(d.get('pos') or '')
            if not pos:
                continue
            glosses, form_of = [], False
            for s in d.get('senses') or []:
                tags = s.get('tags') or []
                if 'form-of' in tags or 'alt-of' in tags or s.get('form_of'):
                    form_of = True
                for g in s.get('glosses') or []:
                    glosses.append(g)
            if not glosses:
                continue
            out[w].append({'pos': pos, 'glosses': glosses, 'form_of': form_of,
                           'gender': kaikki_gender(d) if pos == 'noun' else ''})
    return out


def load_morphit(path: Path) -> dict[str, list[tuple[str, str]]]:
    out: dict[str, list[tuple[str, str]]] = defaultdict(list)
    with path.open(encoding='utf-8') as fh:
        for line in fh:
            parts = line.rstrip('\n').split('\t')
            if len(parts) == 3:
                out[parts[0]].append((parts[1], parts[2]))
    return out


def morphit_gender(analyses) -> str:
    gs = set()
    for lemma, tag in analyses:
        if tag.startswith('NOUN-M'):
            gs.add('m')
        elif tag.startswith('NOUN-F'):
            gs.add('f')
    return 'm/f' if gs == {'m', 'f'} else (gs.pop() if gs else '')


def score_entry(ent: dict, senses: list[str], prior: str | None) -> float:
    score = 0.0
    items = []
    for g in ent['glosses']:
        items.extend(x.strip().lower() for x in re.split(r'[,;]', g))
    gloss_words = set()
    for g in ent['glosses']:
        gloss_words |= words(g)
    for i, sense in enumerate(senses[:4]):
        weight = 1.0 / (1 + i)
        s = sense.lower()
        bare = re.sub(r'^(to|a|an|the)\s+', '', s)
        sw = words(s)
        if s in items or bare in items:
            score += 3 * weight
        elif sw and sw <= gloss_words:
            score += 2 * weight
        elif sw:
            score += weight * len(sw & gloss_words) / len(sw)
    first = senses[0].lower() if senses else ''
    if ent['pos'] == 'verb':
        if first.startswith('to '):
            score += 2.5 if not ent['form_of'] else 1.0
        elif ent['form_of'] and (is_en_verb_form(first.split()[0])
                                 or PERSON_RE.match(first)):
            score += 2.0
    elif first.startswith('to ') and ent['pos'] in ('noun', 'adjective'):
        score -= 1.0
    if ent['form_of'] and ent['pos'] != 'verb':
        score -= 0.3                   # "feminine plural of fino" — weak evidence
    if first in ('a', 'an', 'the') and ent['pos'] == 'article':
        score += 3.0
    if prior and ent['pos'] == prior:
        score += 0.2
    return score


MORPH_ORDER = ['article', 'preposition', 'conjunction', 'pronoun', 'determiner',
               'numeral', 'adverb', 'verb', 'adjective', 'noun', 'interjection',
               'properNoun']


def choose(entry: dict, kaikki, morph) -> tuple[str | None, str, str]:
    """-> (partOfSpeech, gender, source used — reported in the build stats)"""
    w = entry['italian']
    senses = split_senses(entry.get('english', ''))
    dict_word = (entry.get('dictionary') or '').split(' ')[0]
    prior = DICT_POS.get(dict_word)
    analyses = morph.get(w) or morph.get(w.lower()) or []

    # a capitalised headword ("Felice" = happy) competes with its lowercase entries
    cands = list(kaikki.get(w) or [])
    if w.lower() != w:
        cands += kaikki.get(w.lower()) or []
    if cands:
        scored = [(score_entry(c, senses, prior), -i, c) for i, c in enumerate(cands)]
        top = max(scored, key=lambda t: (t[0], t[1]))
        best = top[2]
        if best['pos'] == 'noun':
            # "sei" = six: the numeral beats its nominalised "il sei" on a tie
            for sc, _, c in scored:
                if c['pos'] == 'numeral' and sc >= top[0] - 0.5:
                    best = c
                    break
        pos, gender = best['pos'], best['gender']
        if pos == 'noun' and not gender:
            # another noun entry for the same word, else Morph-it
            genders = {c['gender'] for c in cands if c['pos'] == 'noun' and c['gender']}
            gender = genders.pop() if len(genders) == 1 else morphit_gender(analyses)
        return pos, gender, 'wiktionary'

    mpos = {p for p in (morphit_pos(t) for _, t in analyses) if p}
    if mpos:
        first = senses[0].lower() if senses else ''
        if first.startswith('to ') and 'verb' in mpos:
            pos = 'verb'
        elif prior in mpos:
            pos = prior
        else:
            pos = next(p for p in MORPH_ORDER if p in mpos)
        return pos, (morphit_gender(analyses) if pos == 'noun' else ''), 'morph-it'

    if prior:
        return prior, '', 'dictionary'
    return ('phrase' if ' ' in w.strip() else None), '', 'dictionary'


def compact_array(entries: list[dict]) -> str:
    """One entry per line: ~40% smaller than indent=2, still diff-friendly, and
    the `\\n];` terminator the regex-based readers look for is kept."""
    return '[\n' + ',\n'.join(json.dumps(e, ensure_ascii=False, separators=(',', ':'))
                              for e in entries) + '\n]'


def band(position: int) -> str:
    if position <= 600:
        return 'A1'
    if position <= 1500:
        return 'A2'
    if position <= 3000:
        return 'B1'
    if position <= 6000:
        return 'B2'
    return 'C1'


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--kaikki', type=Path, required=True)
    ap.add_argument('--morphit', type=Path, required=True)
    args = ap.parse_args()

    text = VOCAB.read_text(encoding='utf-8')
    at = text.index(PREFIX)
    head, body = text[:at], text[at + len(PREFIX):]
    data = json.loads(body.rstrip().rstrip(';'))

    wanted = set()
    for e in data:
        wanted.add(e['italian'])
        wanted.add(e['italian'].lower())
    print('loading Wiktionary …', file=sys.stderr)
    kaikki = load_kaikki(args.kaikki, wanted)
    print('loading Morph-it! …', file=sys.stderr)
    morph = load_morphit(args.morphit)

    ranked = sorted((e for e in data if e.get('frequency')),
                    key=lambda e: (e['rank'], e['italian']))
    position = {id(e): i for i, e in enumerate(ranked, start=1)}

    out = []
    stats = Counter()
    for e in data:
        base = {k: v for k, v in e.items() if k not in TAG_FIELDS}
        pos, gender, src = choose(base, kaikki, morph)
        if pos:
            base['partOfSpeech'] = pos
            stats['pos:' + pos] += 1
            stats['src:' + src] += 1
        else:
            stats['pos:none'] += 1
        if pos == 'noun':
            if gender:
                base['gender'] = gender
                stats['gender:' + gender] += 1
            else:
                stats['gender:none'] += 1
        if id(e) in position:
            base['level'] = band(position[id(e)])
            base['levelSource'] = 'freq-band'
        else:
            base['level'] = 'C2'
            base['levelSource'] = 'unranked'
        stats['level:' + base['level']] += 1
        out.append(base)

    head = ('// Italian Vocabulary Data - Enhanced with translations\n'
            '// Total entries: %d\n'
            '// Structure: {italian, dictionary, english, chinese, frequency, rank,\n'
            '//   partOfSpeech, gender?, level, levelSource}\n'
            '// level is inferred from corpus rank; partOfSpeech/gender come from\n'
            '// Wiktionary (kaikki, CC BY-SA) and Morph-it! (CC BY-SA 2.0 / LGPL).\n'
            '// Rebuild the tags with scripts/build_italian_vocabulary_tags.py\n\n'
            % len(out))
    VOCAB.write_text(head + PREFIX + compact_array(out) + ';\n', encoding='utf-8')
    for k in sorted(stats):
        print('  %-24s %d' % (k, stats[k]), file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
