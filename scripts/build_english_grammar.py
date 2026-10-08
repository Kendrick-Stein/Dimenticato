#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build data/en-grammar.js  (ENGLISH_GRAMMAR_DATA).

Output shape: grammar/1 (docs/data-schema.md), written by scripts/grammar_schema.py:

    const ENGLISH_GRAMMAR_DATA = { meta: {schema, lang, ..., levels, topicCount, aliases},
                              tree: { parts: [...] }, content: { '<slug>': '<markdown>' } };

Every topic has a CEFR `level`.  Shipped slugs are positional
(p<N>/ch<NN>/t<NN>); the descriptive authoring slugs used here are kept in
meta.aliases (old -> new) so links and saved positions keep resolving.

SOURCE FORMAT
-------------
The book is authored as one Markdown file per chapter in
scripts/english_grammar_src/, named  p<P>-ch<NN>-<name>.md  (sorted by name =
reading order).  Each file starts with a front-matter comment and then holds
one or more topics, each introduced by a `=== t<NN>-<kebab> | <LEVEL>` line:

    <!--
    part: 第一部分 词法（Morphology）
    chapter: 第一章 名词（Nouns）
    -->

    === t01-noun-types | A1
    # 1．名词的分类：可数与不可数
    ...markdown...

The authoring slug is  p<P>/ch<NN>/t<NN>-<kebab>  (shipped as p<P>/ch<NN>/t<NN>,
with the authoring slug in meta.aliases) and the topic title is the H1.

CONTENT PROVENANCE / LICENCE
----------------------------
All Chinese explanations and all English example sentences under
scripts/english_grammar_src/ were newly written for Dimenticato.  Nothing is
copied from a copyrighted grammar (in particular nothing from the 薄冰英语语法
.docx sitting in " english-data/", which is used by nothing).

The previous build of this file imported " english-data/logical-grammar-master/"
(英语逻辑语法要略 and four .txt notes).  That upstream repo ships no licence at
all — its README only lists reference books — so its text cannot be
redistributed and it is no longer included.

Regenerate with:  python3 scripts/build_english_grammar.py
Validate with:    node scripts/validate_english_grammar.js
Options:          --out PATH   write somewhere else (used for partial checks)
                  --only p1-ch01,p1-ch02   build only files with these name prefixes
"""

import glob
import json
import os
import re
import sys
import unicodedata
import grammar_schema

HERE = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(HERE, 'english_grammar_src')
OUT_FILE = os.path.join(HERE, '..', 'data', 'en-grammar.js')

LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
FILE_RE = re.compile(r'^p(\d)-ch(\d{2})-[a-z0-9-]+\.md$')
FRONT_RE = re.compile(r'\A\s*<!--(.*?)-->', re.S)
TOPIC_RE = re.compile(r'^=== (t\d{2}-[a-z0-9-]+) \| (A1|A2|B1|B2|C1)\s*$', re.M)


def die(msg):
    raise SystemExit('build_english_grammar: ' + msg)


def parse_file(path):
    name = os.path.basename(path)
    m = FILE_RE.match(name)
    if not m:
        die('bad source file name %s (want p<P>-ch<NN>-<name>.md)' % name)
    pnum, cnum = m.group(1), m.group(2)
    with open(path, encoding='utf-8') as f:
        text = unicodedata.normalize('NFC', f.read().replace('\r\n', '\n'))
    fm = FRONT_RE.match(text)
    if not fm:
        die('%s: missing <!-- part/chapter --> front matter' % name)
    meta = {}
    for line in fm.group(1).strip().splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    if not meta.get('part') or not meta.get('chapter'):
        die('%s: front matter needs part: and chapter:' % name)
    body = text[fm.end():]
    heads = list(TOPIC_RE.finditer(body))
    if not heads:
        die('%s: no "=== tNN-slug | LEVEL" topic markers' % name)
    if body[:heads[0].start()].strip():
        die('%s: text between front matter and first topic marker' % name)
    topics = []
    for i, h in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(body)
        md = body[h.end():end].strip() + '\n'
        first = md.split('\n', 1)[0]
        if not first.startswith('# '):
            die('%s %s: topic must start with an H1' % (name, h.group(1)))
        topics.append({
            'part': meta['part'],
            'chapter': meta['chapter'],
            'pnum': int(pnum),
            'cnum': int(cnum),
            'slug': 'p%s/ch%s/%s' % (pnum, cnum, h.group(1)),
            'title': first[2:].strip(),
            'level': h.group(2),
            'md': md,
        })
    return topics


def load_topics(only=None):
    files = sorted(glob.glob(os.path.join(SRC_DIR, '*.md')))
    if only:
        files = [f for f in files if any(os.path.basename(f).startswith(o) for o in only)]
    if not files:
        die('no source files in %s' % SRC_DIR)
    topics = []
    for path in files:
        topics.extend(parse_file(path))
    return topics


def build_tree(topics):
    parts = []
    part_index = {}
    chap_index = {}
    for t in topics:
        pslug = 'p%d' % t['pnum']
        if pslug not in part_index:
            part_index[pslug] = {'title': t['part'], 'slug': pslug, 'chapters': []}
            parts.append(part_index[pslug])
        part = part_index[pslug]
        if part['title'] != t['part']:
            die('part %s has two titles: %r vs %r' % (pslug, part['title'], t['part']))
        cslug = 'p%d/ch%02d' % (t['pnum'], t['cnum'])
        if cslug not in chap_index:
            chap_index[cslug] = {'title': t['chapter'], 'slug': cslug, 'topics': []}
            part['chapters'].append(chap_index[cslug])
        elif chap_index[cslug]['title'] != t['chapter']:
            die('chapter %s has two titles' % cslug)
        chap_index[cslug]['topics'].append({
            'title': t['title'],
            'slug': t['slug'],
            'level': t['level'],
        })
    return {'parts': parts}


def js_string(s):
    return json.dumps(s, ensure_ascii=False)


def main(argv):
    out_file = OUT_FILE
    if '--out' in argv:
        out_file = argv[argv.index('--out') + 1]

    only = None
    if '--only' in argv:
        only = argv[argv.index('--only') + 1].split(',')
    topics = load_topics(only)
    slugs = [t['slug'] for t in topics]
    dupes = sorted({s for s in slugs if slugs.count(s) > 1})
    if dupes:
        die('duplicate slugs: %s' % dupes)
    for t in topics:
        if '![' in t['md'] or '<img' in t['md']:
            die('image reference in %s' % t['slug'])

    tree = build_tree(topics)
    n_parts = len(tree['parts'])
    n_chaps = sum(len(p['chapters']) for p in tree['parts'])
    n_topics = len(topics)
    total_chars = sum(len(t['md']) for t in topics)
    used_levels = [lv for lv in LEVELS if any(t['level'] == lv for t in topics)]
    span = '%s-%s' % (used_levels[0], used_levels[-1]) if used_levels else ''

    header = [
        '// data/en-grammar.js — 英语语法书（%s，grammar/1，docs/data-schema.md）' % span,
        '// GENERATED FILE — do not edit by hand.',
        '// Source:     scripts/english_grammar_src/*.md',
        '// Regenerate: python3 scripts/build_english_grammar.py',
        '// Validate:   node scripts/validate_english_grammar.js',
        '//',
        '// %d parts / %d chapters / %d topics / %d characters of content.'
        % (n_parts, n_chaps, n_topics, total_chars),
        '// Slugs are positional (p<N>/ch<NN>/t<NN>); the source file kebab slugs',
        '// (p1/ch01/t01-countable-uncountable) live on in meta.aliases.',
        '// All explanations and example sentences are original text written for',
        '// Dimenticato for Chinese-speaking learners of English.',
    ]
    data = {
        'meta': {
            'name': '英语语法',
            'title': '英语语法',
            'description': '从左侧目录选择 %s 专题开始阅读，共 %d 个主题。' % (span, n_topics),
        },
        'tree': tree,
        'content': {t['slug']: t['md'] for t in topics},
    }
    data = grammar_schema.canonicalize(data, 'en')
    grammar_schema.write('en', data, header=header, path=out_file)

    lens = sorted(len(t['md']) for t in topics)
    print('wrote %s' % os.path.normpath(out_file))
    print('%d parts / %d chapters / %d topics / %d chars (mean %d, median %d, min %d)'
          % (n_parts, n_chaps, n_topics, total_chars,
             total_chars // max(n_topics, 1), lens[n_topics // 2], lens[0]))


if __name__ == '__main__':
    main(sys.argv[1:])
