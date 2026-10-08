#!/usr/bin/env python3
"""Reviewed, idempotent fixes for the Italian data modules.

Each fix list lives in scripts/it_fixes/ and is applied by the builder / canonical
step of its module, so a rebuild keeps it:

    vocab.json         data/vocab/it.js        scripts/clean_italian_glosses.py main()
    collocations.json  data/it-collocations.js scripts/canonical_collocations.py canonicalize('it')
    cognates.json      data/it-cognates.js     scripts/canonical_cognates.py canonicalize('it')
    grammar.json       data/it-grammar.js      scripts/canonicalize_grammar.py run('it')
    grammar/*.md       authored topic text / supplements referenced from grammar.json

Every record carries the old value next to the new one (``from`` / ``to``, or the
reviewed old gloss).  A record whose target already holds the new value is a no-op;
a record whose target holds neither the old nor the new value is reported as STALE
(printed to stderr) and skipped, the same contract as scripts/conjugation_fixes/.

    python3 scripts/italian_fixes.py --check    # report pending / stale records, write nothing
"""

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
FIXES = HERE / 'it_fixes'


def _load(name):
    path = FIXES / name
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else None


def _stale(module, msg):
    print('italian_fixes[%s]: STALE %s' % (module, msg), file=sys.stderr)


# ---------------------------------------------------------------------------
# vocab
# ---------------------------------------------------------------------------

VOCAB_SOURCE = 'Hand-reviewed gloss fixes (scripts/it_fixes/vocab.json)'
VOCAB_FIELDS = ('pos', 'gender', 'zh', 'en')


def apply_vocab(entries, meta, fixes=None):
    """Apply it_fixes/vocab.json to a v1 entry list in place.

    Records: {word, rename?, drop?, from:{field: old}, to:{field: new}, why}.
    * rename: headword case fix ("Felice" -> "felice"); the old headword goes to
      legacyWord so lib/vocab.js resolveLegacyKey re-keys saved progress.
    * drop: entry removed; ranks are re-densified and freq-band levels follow.
    * from/to: a field equal to `to` is done, equal to `from` is replaced, anything
      else is STALE (reported, left alone).
    Changed entries get src = VOCAB_SOURCE.  Returns the number of edits made.
    """
    fixes = fixes if fixes is not None else _load('vocab.json')
    if not fixes:
        return 0
    import vocab_schema as vs
    index = {e['word']: e for e in entries}
    src = None
    edits = 0
    dropped = set()
    for rec in fixes:
        word = rec['word']
        if rec.get('drop'):
            e = index.get(word)
            if e is None:
                continue
            if any((e.get(k) or '') != v for k, v in (rec.get('from') or {}).items()):
                _stale('vocab', 'drop %s: entry changed since review' % word)
                continue
            dropped.add(word)
            del index[word]
            edits += 1
            continue
        target = rec.get('rename') or word
        e = index.get(target)
        if rec.get('rename') and word in index:
            if target in index:
                _stale('vocab', 'rename %s -> %s: target exists' % (word, target))
                continue
            e = index.pop(word)
            e['word'] = target
            if e.get('display') == word:
                del e['display']
            if not e.get('legacyWord'):
                e['legacyWord'] = word
            index[target] = e
            edits += 1
        if e is None:
            _stale('vocab', '%s: no such entry' % word)
            continue
        changed = False
        in_effect = True
        for k, new in (rec.get('to') or {}).items():
            cur = e.get(k) or ''
            old = (rec.get('from') or {}).get(k, '')
            if k == 'en':
                # clean_italian_glosses lower-cases sense-initial words; compare
                # (and write) the record's values in that normalised form
                from clean_italian_glosses import normalise_en_case
                new = normalise_en_case(new, e.get('pos'))
                old = normalise_en_case(old, e.get('pos'))
            if cur == new:
                continue
            if cur != old:
                _stale('vocab', '%s.%s = %r (expected %r)' % (target, k, cur, rec['from'].get(k)))
                in_effect = False
                continue
            if new == '':
                e.pop(k, None)
            else:
                e[k] = new
            changed = True
        if changed or rec.get('rename'):
            if src is None:
                src = vs.source_index(meta, VOCAB_SOURCE)
            e['src'] = src
            edits += changed
        elif rec.get('to') and in_effect:
            # already applied: keep the provenance mark stable
            if src is None:
                src = vs.source_index(meta, VOCAB_SOURCE)
            e['src'] = src
    if dropped:
        kept = [e for e in entries if e['word'] not in dropped]
        for position, e in enumerate(kept, 1):
            if e.get('levelSource') == 'freq-band' and e.get('level') == vs.band_level(e['rank']):
                e['level'] = vs.band_level(position)
            e['rank'] = position
        entries[:] = kept
    return edits


# ---------------------------------------------------------------------------
# grammar
# ---------------------------------------------------------------------------

SUPPLEMENT_MARK = '#### 补充说明（本节为补写内容'
_NUM_PREFIX = re.compile(r'^\s*\d{1,2}\s*[．.]\s*')
_HEAD_RE = re.compile(r'^(#{2,4})\s*\d{1,2}\s*[．.]\s*')
_BOLD_SECTION = re.compile(r'^\*\*\d{1,2} *[．.]', re.M)


def _chapter(data, cslug):
    for part in data['tree']['parts']:
        for ch in part.get('chapters') or []:
            if ch['slug'] == cslug:
                return ch
    raise KeyError(cslug)


def _append_topic(data, slug, title, level, content):
    cslug, tname = slug.rsplit('/', 1)
    ch = _chapter(data, cslug)
    expected = 't%02d' % (len(ch['topics']) + 1)
    if tname != expected:
        raise SystemExit('italian_fixes[grammar]: %s would land at position %s; new topics are append-only'
                         % (slug, expected))
    ch['topics'].append({'title': title, 'slug': slug, 'level': level})
    data['content'][slug] = content


def _cut_section(text, start):
    i = text.find(start)
    if i < 0:
        return None, text
    m = _BOLD_SECTION.search(text, i + len(start))
    j = m.start() if m else len(text)
    return text[i:j], (text[:i].rstrip() + '\n\n' + text[j:].lstrip()).rstrip() + '\n'


def _split_section(section, title):
    """'**N．title**\\n\\nbody' -> '### N．title\\n\\nbody' (number fixed later)."""
    first, _, rest = section.partition('\n')
    return '### 0．%s\n%s' % (title, rest.rstrip() + '\n')


def _appendix_chunks(text, cfg):
    """Split the conjugation appendix into topics of at most cfg['maxChars']."""
    out = []
    heads = cfg['sections']
    order = sorted(((text.find(h), h) for h in heads if text.find(h) >= 0))
    for n, (pos, head) in enumerate(order):
        end = order[n + 1][0] if n + 1 < len(order) else len(text)
        body = text[pos:end]
        # split at verb records "**Cantare**:"
        cuts = [m.start() for m in re.finditer(r'^\*\*[A-Za-zÀ-ÿ]+\*\*\s*[:：]', body, re.M)]
        if not cuts:
            out.append((heads[head], body))
            continue
        pieces, cur_start = [], 0
        for c in cuts[1:] + [len(body)]:
            if c - cur_start > cfg['maxChars'] and c != cuts[0]:
                prev = max(x for x in cuts + [len(body)] if x < c and x > cur_start) if any(
                    cur_start < x < c for x in cuts) else c
                pieces.append(body[cur_start:prev])
                cur_start = prev
        pieces.append(body[cur_start:])
        for piece in pieces:
            verbs = re.findall(r'^\*\*([A-Za-zÀ-ÿ]+)\*\*\s*[:：]', piece, re.M)
            label = heads[head]
            if len(pieces) > 1 and verbs:
                label += '：%s – %s' % (verbs[0].lower(), verbs[-1].lower())
            out.append((label, piece))
    return out


def apply_grammar(data, fixes=None):
    fixes = fixes if fixes is not None else _load('grammar.json')
    if not fixes:
        return data
    data = json.loads(json.dumps(data))
    content = data['content']
    known = {t['slug'] for p in data['tree']['parts'] for c in p['chapters'] for t in c['topics']}

    new_topics = []  # (slug, title, level, content)
    for rec in fixes.get('split') or []:
        if rec['slug'] in known:
            continue
        section, rest = _cut_section(content[rec['from']], rec['start'])
        if section is None:
            _stale('grammar', 'split %s: %r not found in %s' % (rec['slug'], rec['start'], rec['from']))
            continue
        content[rec['from']] = rest
        new_topics.append((rec['slug'], rec['title'], rec['level'], _split_section(section, rec['title'])))
    for rec in fixes.get('authored') or []:
        text = (FIXES / rec['file']).read_text(encoding='utf-8')
        if rec['slug'] in known:
            content[rec['slug']] = text
            continue
        new_topics.append((rec['slug'], rec['title'], rec['level'], text))
    for slug, title, level, text in sorted(new_topics, key=lambda t: t[0]):
        _append_topic(data, slug, title, level, text)
        known.add(slug)

    app = fixes.get('appendix')
    if app:
        src = content.get(app['from'], '')
        i = src.find(app['start'])
        if i >= 0:
            body = src[i:]
            content[app['from']] = src[:i].rstrip() + '\n'
            chunks = _appendix_chunks(body, app)
            pslug = 'p%d' % (len(data['tree']['parts']) + 1)
            cslug = pslug + '/ch01'
            topics = []
            for n, (title, text) in enumerate(chunks, 1):
                tslug = '%s/t%02d' % (cslug, n)
                topics.append({'title': '%d．%s' % (n, title), 'slug': tslug, 'level': app['level']})
                text = re.sub(r'^(#### 附\s+### 录\s+)?', '', text)
                content[tslug] = '### %d．%s\n\n%s' % (n, title, text.strip() + '\n')
            data['tree']['parts'].append({'title': app['part'], 'slug': pslug, 'chapters': [
                {'title': app['chapter'], 'slug': cslug, 'topics': topics}]})

    for rec in fixes.get('appends') or []:
        add = (FIXES / rec['file']).read_text(encoding='utf-8').strip() + '\n'
        text = content[rec['slug']]
        k = text.find(SUPPLEMENT_MARK)
        base = (text[:k] if k >= 0 else text).rstrip()
        content[rec['slug']] = base + '\n\n' + add

    by_slug = {t['slug']: t for p in data['tree']['parts'] for c in p['chapters'] for t in c['topics']}
    for rec in fixes.get('titles') or []:
        t = by_slug[rec['slug']]
        if rec['from'] in t['title']:
            t['title'] = t['title'].replace(rec['from'], rec['to'])
            first, nl, rest = content[rec['slug']].partition('\n')
            content[rec['slug']] = first.replace(rec['from'], rec['to']) + nl + rest
        elif rec['to'] not in t['title']:
            _stale('grammar', 'title %s: %r' % (rec['slug'], rec['from']))
    for rec in fixes.get('text') or []:
        text = content[rec['slug']]
        if rec['from'] in text:
            content[rec['slug']] = text.replace(rec['from'], rec['to'])
        elif rec['to'] not in text:
            _stale('grammar', 'text %s: %r' % (rec['slug'], rec['from']))

    # honest numbering: title "N．" and the content's leading "### N．" follow the position
    for part in data['tree']['parts']:
        for ch in part['chapters']:
            for n, t in enumerate(ch['topics'], 1):
                t['title'] = '%d．%s' % (n, _NUM_PREFIX.sub('', t['title']))
                first, nl, rest = content[t['slug']].partition('\n')
                if _HEAD_RE.match(first):
                    first = _HEAD_RE.sub(lambda m: '%s %d．' % (m.group(1), n), first)
                    content[t['slug']] = first + nl + rest
    total = len(by_slug) if not app else sum(len(c['topics']) for p in data['tree']['parts'] for c in p['chapters'])
    meta = data.get('meta') or {}
    if meta.get('description'):
        meta['description'] = re.sub(r'共 \d+ 个主题', '共 %d 个主题' % total, meta['description'])
    return data


# ---------------------------------------------------------------------------
# cognates
# ---------------------------------------------------------------------------

def apply_cognates(entries, fixes=None):
    """Apply it_fixes/cognates.json to cognates/1 entries; returns the new list.

    Records: {word, drop:true} | {word, from:{}, to:{}} | {word, add:{entry}}.
    Afterwards rank / pos / gender follow data/vocab/it.js (the vocab is re-ranked
    when it is rebuilt, so stored ranks drift) and entries are ordered by rank.
    """
    fixes = fixes if fixes is not None else _load('cognates.json')
    import vocab_schema as vs
    by_word = {e['word']: e for e in entries}
    for rec in fixes or []:
        word = rec['word']
        if rec.get('drop'):
            by_word.pop(word, None)
        elif rec.get('add'):
            if word not in by_word:
                by_word[word] = dict(rec['add'])
        else:
            e = by_word.get(word)
            if e is None:
                continue  # dropped by a later fix or by the extractor
            for k, new in rec['to'].items():
                cur = e.get(k, '')
                if cur == new:
                    continue
                if cur != rec['from'].get(k, ''):
                    _stale('cognates', '%s.%s = %r' % (word, k, cur))
                    continue
                e[k] = new
    vocab = {v['word']: v for v in vs.read_vocab('it')['entries']}
    for e in by_word.values():
        v = vocab.get(e['word'])
        if not v:
            continue
        e['rank'] = v['rank']
        if v.get('pos'):
            e['pos'] = v['pos']
            if v['pos'] == 'noun' and v.get('gender'):
                e['gender'] = v['gender']
            elif v['pos'] != 'noun':
                e.pop('gender', None)
    return sorted(by_word.values(), key=lambda e: (e['rank'], e['word']))


# ---------------------------------------------------------------------------
# collocations
# ---------------------------------------------------------------------------

# the book's inline glosses: "Ti (=a te) ho comprato", "Dammi(a me)una mano", "ci(=noi)destina"
_COLL_NOTE = re.compile(r'\s*\(\s*=?\s*(?:a\s+)?(?:me|te|lui|lei|noi|voi|loro|t)\s*\)\s*\)?\s*')
_LETTER = 'A-Za-zÀ-ÖØ-öø-ÿ'


def _coll_text(text, tokens):
    def note(m):
        before, after = m.string[:m.start()], m.string[m.end():]
        if not before or before.endswith((' ', '(')):
            return ''
        if after[:1] in ('', '.', ',', '!', '?', ';', ':', "'"):
            return ''
        return ' '
    text = _COLL_NOTE.sub(note, text)
    text = re.sub(r'^(\w+),\s+', r'\1 ', text) if re.match(r'^(Le|Gli|Mi|Ti|Ci|Vi), ', text) else text
    for bad, good in tokens:
        pat = re.compile(r'(?<![%s])%s(?![%s])' % (_LETTER, re.escape(bad), _LETTER))
        text = pat.sub(lambda m: good, text)
    return re.sub(r'\s+', ' ', text).strip()


def _find_example(verbs, verb, key, text):
    v = verbs.get(verb)
    for i, ex in enumerate(((v or {}).get('keys') or {}).get(key) or []):
        if ex.get('text') == text:
            return i
    return None


def _add_example(verbs, verb, key, ex, after=None):
    if verb not in verbs:
        items = list(verbs.items())
        pos = next((n + 1 for n, (w, _) in enumerate(items) if w == after), len(items))
        items.insert(pos, (verb, {'word': verb, 'order': [], 'keys': {}}))
        verbs.clear()
        verbs.update(items)
    v = verbs[verb]
    v.setdefault('order', [])
    v.setdefault('keys', {})
    if key not in v['order']:
        v['order'].append(key)
    dest = v['keys'].setdefault(key, [])
    if all(e.get('text') != ex.get('text') for e in dest):
        dest.append(ex)


def apply_collocations(data, fixes=None):
    """Apply it_fixes/collocations.json to a collocations/1 payload (before normalisation).

    Order: headword renames (merging into the real verb), example text fixes, zh fixes
    and glued-example splits, moves of misfiled examples, drops, verb-level zh.
    """
    fixes = fixes if fixes is not None else _load('collocations.json')
    if not fixes:
        return data
    verbs = data['verbs']
    for rec in fixes.get('renames') or []:
        if rec['from'] not in verbs:
            continue
        names = list(verbs)
        n = names.index(rec['from'])
        prev = names[n - 1] if n else None
        old = verbs.pop(rec['from'])
        for k in old.get('order') or list(old.get('keys') or {}):
            for ex in (old.get('keys') or {}).get(k) or []:
                _add_example(verbs, rec['to'], (rec.get('keys') or {}).get(k, k), ex, after=prev)
    tokens = fixes.get('tokens') or []
    for v in verbs.values():
        for exs in (v.get('keys') or {}).values():
            for ex in exs:
                ex['text'] = _coll_text(ex['text'], tokens)
    for rec in fixes.get('zh') or []:
        i = _find_example(verbs, rec['verb'], rec['key'], rec['text'])
        if i is None:
            _stale('collocations', 'zh %s/%s: %r not found' % (rec['verb'], rec['key'], rec['text']))
            continue
        ex = verbs[rec['verb']]['keys'][rec['key']][i]
        if ex.get('zh') == rec['from']:
            ex['zh'] = rec['to']
        elif ex.get('zh') != rec['to']:
            _stale('collocations', 'zh %s: %r' % (rec['verb'], ex.get('zh')))
            continue
        if rec.get('split'):
            _add_example(verbs, rec['verb'], rec['key'], dict(rec['split']))
    for rec in fixes.get('moves') or []:
        i = _find_example(verbs, rec['verb'], rec['key'], rec['text'])
        to = rec['to']
        if i is None:
            if _find_example(verbs, to['verb'], to['key'], rec['text']) is None:
                _stale('collocations', 'move %s/%s: %r not found' % (rec['verb'], rec['key'], rec['text']))
            continue
        ex = verbs[rec['verb']]['keys'][rec['key']].pop(i)
        _add_example(verbs, to['verb'], to['key'], ex, after=rec['verb'])
    for rec in fixes.get('drops') or []:
        i = _find_example(verbs, rec['verb'], rec['key'], rec['text'])
        if i is not None:
            verbs[rec['verb']]['keys'][rec['key']].pop(i)
    for word, zh in (fixes.get('verbZh') or {}).items():
        if word in verbs:
            verbs[word]['zh'] = zh
    return data


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main(argv):
    sys.path.insert(0, str(HERE))
    if '--check' in argv:
        import grammar_schema
        out = apply_grammar(grammar_schema.read('it'))
        print('grammar: %d topics after fixes' % len(out['content']))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
