#!/usr/bin/env python3
"""
Parse the Italian grammar Markdown book and split into topic files.
Generates: data/grammar_content/**/*.md and data/grammar_tree.json
"""

import os
import re
import json
import shutil

SRC = os.path.join(os.path.dirname(__file__), '..', 'data', '1_662531774-意大利语法.md')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'grammar_content')
TREE_OUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'grammar_tree.json')

# Lines beyond this are the duplicate index — skip them
MAX_LINE = 22700

CN_NUM = {
    '一': '01', '二': '02', '三': '03', '四': '04', '五': '05',
    '六': '06', '七': '07', '八': '08', '九': '09', '十': '10',
    '十一': '11', '十二': '12', '十三': '13', '十四': '14',
    '十五': '15', '十六': '16', '十七': '17', '十八': '18',
}

PART_SLUG = {
    '第一部分': 'part1_morfologia',
    '第二部分': 'part2_sintassi',
}

def ch_slug(cn_num_str, index):
    """Return a short chapter slug like ch01, ch02 ..."""
    n = CN_NUM.get(cn_num_str, str(index).zfill(2))
    return f'ch{n}'

def topic_slug(num_str, title):
    """Return a short topic slug like t01_infinito"""
    # Extract leading number
    m = re.match(r'^(\d+)', num_str.strip())
    if m:
        n = m.group(1).zfill(2)
    else:
        n = '00'
    # Take first Italian keyword from title if present
    it = re.search(r'\(([a-zA-Z ]+)\)', title)
    if it:
        kw = it.group(1).strip().split()[0].lower()[:20]
    else:
        # Use first 2 Chinese chars
        kw = re.sub(r'[^\u4e00-\u9fff]', '', title)[:4]
    return f't{n}_{kw}'

def main():
    # Clean output dir
    if os.path.exists(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR)

    with open(SRC, encoding='utf-8') as f:
        lines = f.readlines()

    lines = lines[:MAX_LINE]

    PART_RE = re.compile(r'^#{1,2}\s+第([一二三四五六七八九十]+)部分')
    CHAPTER_RE = re.compile(r'^#\s+第([一二三四五六七八九十百]+)章\s*(.+)')
    APPENDIX_RE = re.compile(r'^#\s+附\s*录')
    # Topics: ## or ### lines starting with digit + ．or . (fullwidth or halfwidth)
    TOPIC_RE = re.compile(r'^#{2,3}\s+(\d+)[．.]')

    parts = []
    current_part = None
    current_chapter = None
    current_topic = None
    topic_lines = []
    ch_index = 0

    def flush_topic():
        nonlocal topic_lines
        if current_topic is not None:
            current_topic['_lines'] = list(topic_lines)
        topic_lines = []

    skip = True  # skip preamble before first part

    for line in lines:
        s = line.rstrip('\n')

        # Part boundary
        m = PART_RE.match(s)
        if m:
            flush_topic()
            cn = m.group(1)
            part_key = f'第{cn}部分'
            slug = PART_SLUG.get(part_key, f'part_{cn}')
            current_part = {'title': s.lstrip('#').strip(), 'slug': slug, 'chapters': []}
            parts.append(current_part)
            current_chapter = None
            current_topic = None
            ch_index = 0
            skip = False
            continue

        # Appendix
        if APPENDIX_RE.match(s):
            flush_topic()
            ch_index += 1
            current_chapter = {
                'title': s.lstrip('#').strip(),
                'slug': 'appendix',
                'topics': []
            }
            if current_part:
                current_part['chapters'].append(current_chapter)
            current_topic = None
            continue

        # Chapter
        m = CHAPTER_RE.match(s)
        if m:
            flush_topic()
            cn_num = m.group(1)
            ch_index += 1
            slug = ch_slug(cn_num, ch_index)
            current_chapter = {
                'title': s.lstrip('#').strip(),
                'slug': slug,
                'topics': []
            }
            if current_part:
                current_part['chapters'].append(current_chapter)
            current_topic = None
            continue

        if skip or current_chapter is None:
            continue

        # Topic
        m = TOPIC_RE.match(s)
        if m:
            flush_topic()
            num = m.group(1)
            title = s.lstrip('#').strip()
            t_slug = topic_slug(num, title)
            # Ensure unique slug within chapter
            existing = [t['slug'] for t in current_chapter['topics']]
            base = t_slug
            counter = 2
            while t_slug in existing:
                t_slug = f'{base}_{counter}'
                counter += 1
            current_topic = {'title': title, 'slug': t_slug, '_lines': []}
            current_chapter['topics'].append(current_topic)
            topic_lines = [line]
            continue

        if current_topic is not None:
            topic_lines.append(line)

    flush_topic()

    # Write files and build tree
    tree = {'parts': []}

    for part in parts:
        part_node = {'title': part['title'], 'slug': part['slug'], 'chapters': []}
        tree['parts'].append(part_node)

        for chapter in part['chapters']:
            ch_dir = os.path.join(OUT_DIR, part['slug'], chapter['slug'])
            os.makedirs(ch_dir, exist_ok=True)

            ch_node = {
                'title': chapter['title'],
                'slug': chapter['slug'],
                'topics': []
            }
            part_node['chapters'].append(ch_node)

            for topic in chapter['topics']:
                fname = topic['slug'] + '.md'
                fpath = os.path.join(ch_dir, fname)
                content = topic.get('_lines', [])
                with open(fpath, 'w', encoding='utf-8') as f:
                    if content:
                        f.writelines(content)
                    else:
                        f.write(f"## {topic['title']}\n\n(内容待补充)\n")

                ch_node['topics'].append({
                    'title': topic['title'],
                    'slug': f"{part['slug']}/{chapter['slug']}/{topic['slug']}"
                })

            # Chapter with no topics → single overview file
            if not chapter['topics']:
                fpath = os.path.join(ch_dir, 'overview.md')
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(f"# {chapter['title']}\n\n(内容待补充)\n")
                ch_node['topics'].append({
                    'title': chapter['title'],
                    'slug': f"{part['slug']}/{chapter['slug']}/overview"
                })

    with open(TREE_OUT, 'w', encoding='utf-8') as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)

    total = sum(len(ch['topics']) for p in tree['parts'] for ch in p['chapters'])
    print(f"Parts: {len(tree['parts'])}, Chapters: {sum(len(p['chapters']) for p in tree['parts'])}, Topics: {total}")
    print(f"Tree → {TREE_OUT}")
    print(f"Content → {OUT_DIR}")

if __name__ == '__main__':
    main()
