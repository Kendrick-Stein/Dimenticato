#!/usr/bin/env python3
"""Tag part of speech / gender in the Italian vocabulary (data/vocab/it.js).

data/vocab/it.js (DIM_VOCAB.it, schema v1 — docs/vocab-schema.md) is enriched in
place through scripts/vocab_schema.py read_vocab / write_vocab: only `pos` and
`gender` are recomputed; every other field (word, zh, en, level, rank, freq,
src) and the entry order stay untouched, and re-running is idempotent.

Fields written
  pos      noun | verb | adjective | adverb | pronoun | determiner |
           article | preposition | conjunction | numeral | interjection |
           properNoun | prefix | suffix | phrase
  gender   'm' | 'f' | 'm/f'   nouns only, when a source attests it
           ('m/f' = both genders exist for the sense taught, e.g. "cantante")
  `level` is not set here: vocab_schema.finalize() assigns the shared
  frequency bands (levelSource 'freq-band') when the file is emitted.

How the part of speech is chosen
  A headword like "era" is a noun (era) *and* a verb form (was); the card
  teaches one of those via its `en` gloss, so the tag has to match the
  gloss.  Each Wiktionary entry for the word is scored by how well its glosses
  cover our English senses (earlier senses weigh more); "to …" glosses favour
  verbs, English inflected verb forms ("was", "said") favour Italian verb
  forms.  The entry's existing `pos` is only a weak prior (it replaced the POS
  word that led the pre-v1 `dictionary` field, which was wrong for many
  function words).  Without a Wiktionary entry, Morph-it! analyses decide, and
  the existing `pos` only as a last resort.

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

Gap filling (also run at the end of a full build; standalone it needs no
Wiktionary dump, Morph-it! is optional):

  python3 scripts/build_italian_vocabulary_tags.py --fill-missing \\
      [--morphit /tmp/itv/morph.utf8]

  only entries *without* a `pos` / noun `gender` are touched:
    pos     acronyms ("CEO", "bpm") -> abbreviation; else spaCy it_core_news_sm
    gender  multi-word nouns take their head noun's gender ("stato di
            famiglia" <- stato, "post-verità" <- verità), looked up in it.js
            itself, then Morph-it!; single words use Morph-it!, then a suffix
            model learned from it.js's own gendered nouns (only suffixes seen
            >= 20 times with >= 95% one gender: -zione f, -ismo m, -ing m ...)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import vocab_schema as vs  # noqa: E402

BUILDER = 'scripts/build_italian_vocabulary_tags.py'

KAIKKI_POS = {
    'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
    'pron': 'pronoun', 'det': 'determiner', 'article': 'article',
    'prep': 'preposition', 'contraction': 'preposition', 'conj': 'conjunction',
    'num': 'numeral', 'intj': 'interjection', 'name': 'properNoun',
    'prefix': 'prefix', 'suffix': 'suffix', 'phrase': 'phrase',
    'prep_phrase': 'phrase', 'adv_phrase': 'phrase', 'proverb': 'phrase',
    'particle': 'adverb',
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
    """-> (pos, gender, source used — reported in the build stats)"""
    w = entry['word']
    senses = split_senses(entry.get('en', ''))
    prior = entry.get('pos') or None
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
        return prior, '', 'prior'
    return ('phrase' if ' ' in w.strip() else None), '', 'prior'


ACRONYM_RE = re.compile(r'^(?:[A-ZÀ-Ý0-9]{2,}|[b-df-hj-np-tv-z]{2,5})$')
SPACY_POS = {'NOUN': 'noun', 'PROPN': 'properNoun', 'VERB': 'verb', 'AUX': 'verb',
             'ADJ': 'adjective', 'ADV': 'adverb', 'PRON': 'pronoun', 'DET': 'determiner',
             'ADP': 'preposition', 'CCONJ': 'conjunction', 'SCONJ': 'conjunction',
             'NUM': 'numeral', 'INTJ': 'interjection'}
_nlp = []


def fallback_pos(word: str) -> str:
    if ACRONYM_RE.match(word):
        return 'abbreviation'
    if ' ' in word.strip():
        return 'phrase'
    if not _nlp:
        import spacy  # build-time only: pip install spacy; python -m spacy download it_core_news_sm
        _nlp.append(spacy.load('it_core_news_sm'))
    tag = _nlp[0](word)[0].pos_
    return SPACY_POS.get(tag, '')


def suffix_model(entries: list, min_n: int = 20, purity: float = 0.95) -> dict:
    counts: dict[str, Counter] = defaultdict(Counter)
    for e in entries:
        w = e['word'].lower()
        if e.get('pos') == 'noun' and e.get('gender') in ('m', 'f') and w.isalpha():
            for k in range(2, 6):
                if len(w) > k:
                    counts[w[-k:]][e['gender']] += 1
    model = {}
    for suf, c in counts.items():
        g, n = c.most_common(1)[0]
        if sum(c.values()) >= min_n and n / sum(c.values()) >= purity:
            model[suf] = g
    return model


def guess_gender(word: str, genders: dict, morph, model: dict) -> tuple[str, str]:
    """-> (gender, how) for a noun the dictionaries left without one."""
    parts = [p for p in re.split(r"[ ']", word) if p]
    if len(parts) > 1:
        head = parts[0]                       # "stato di famiglia" -> stato
    elif '-' in word:
        head = word.split('-')[-1]            # "post-verità" -> verità
    else:
        head = word
    if head != word:
        g = genders.get(head) or genders.get(head.lower())
        if g:
            return g, 'head'
    analyses = (morph.get(head) or morph.get(head.lower()) or []) if morph else []
    g = morphit_gender(analyses)
    if g:
        return g, 'morph-it'
    w = head.lower()
    for k in range(5, 1, -1):
        if len(w) > k and w[-k:] in model:
            return model[w[-k:]], 'suffix'
    return '', ''


def fill_missing(entries: list, morph) -> Counter:
    stats = Counter()
    for e in entries:
        if not e.get('pos'):
            pos = fallback_pos(e['word'])
            if pos:
                e['pos'] = pos
                stats['pos-fill:' + pos] += 1
    genders = {e['word']: e['gender'] for e in entries
               if e.get('pos') == 'noun' and e.get('gender')}
    model = suffix_model(entries)
    for e in entries:
        if e.get('pos') == 'noun' and not e.get('gender'):
            g, how = guess_gender(e['word'], genders, morph, model)
            if g:
                e['gender'] = g
                stats['gender-fill:' + how] += 1
    return stats


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--kaikki', type=Path)
    ap.add_argument('--morphit', type=Path)
    ap.add_argument('--fill-missing', action='store_true',
                    help='only fill entries without pos / noun gender (no Wiktionary dump)')
    args = ap.parse_args()

    if args.fill_missing:
        morph = load_morphit(args.morphit) if args.morphit else None
        stats = Counter()

        def update(entries: list, meta: dict) -> None:
            stats.update(fill_missing(entries, morph))

        print(vs.rewrite_vocab('it', update, builder=BUILDER), file=sys.stderr)
        for k in sorted(stats):
            print('  %-24s %d' % (k, stats[k]), file=sys.stderr)
        return 0
    if not (args.kaikki and args.morphit):
        ap.error('--kaikki and --morphit are required for a full build')

    data = vs.read_vocab('it')
    entries = data['entries']

    wanted = set()
    for e in entries:
        wanted.add(e['word'])
        wanted.add(e['word'].lower())
    print('loading Wiktionary …', file=sys.stderr)
    kaikki = load_kaikki(args.kaikki, wanted)
    print('loading Morph-it! …', file=sys.stderr)
    morph = load_morphit(args.morphit)

    out = []
    stats = Counter()
    for e in entries:
        pos, gender, src = choose(e, kaikki, morph)
        base = {k: v for k, v in e.items() if k not in ('pos', 'gender')}
        if pos:
            base['pos'] = pos
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
        out.append(base)
    for k, v in fill_missing(out, morph).items():
        stats[k] += v
    out = [vs.clean_entry(e) for e in out]

    meta = data['meta']
    path = vs.write_vocab('it', out, sources=meta['sources'], licences=meta['licences'],
                          builder=BUILDER, notes=meta.get('notes', ''))
    print(path, file=sys.stderr)
    for k in sorted(stats):
        print('  %-24s %d' % (k, stats[k]), file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
