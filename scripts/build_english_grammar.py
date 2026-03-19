#!/usr/bin/env python3
"""
Build English grammar data file from english-data/logical-grammar-master/ directory.
Generates data/english-grammar-data.js with ENGLISH_GRAMMAR_DATA constant.
Structure mirrors data/grammar-data.js (GRAMMAR_DATA).
"""

import os
import json
import re

# Note: directory has a leading space in name
GRAMMAR_DIR = os.path.join(os.path.dirname(__file__), '..', ' english-data', 'logical-grammar-master')
OUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'english-grammar-data.js')

def read_file(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def slugify(text):
    """Create a slug from text."""
    slug = re.sub(r'[^\w\u4e00-\u9fff\u3400-\u4dbf\-]', '-', text)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug.lower()

def split_md_by_headings(content, heading_level=2):
    """
    Split markdown content by h2 headings (##).
    Returns list of (title, body) tuples.
    """
    pattern = re.compile(r'^#{%d}\s+(.+)$' % heading_level, re.MULTILINE)
    positions = [(m.start(), m.group(1).strip()) for m in pattern.finditer(content)]

    if not positions:
        return []

    sections = []
    for i, (start, title) in enumerate(positions):
        end = positions[i+1][0] if i+1 < len(positions) else len(content)
        body = content[start:end].strip()
        sections.append((title, body))

    return sections

def parse_main_md(filepath):
    """
    Parse 英语逻辑语法要略.md into parts/chapters/topics structure.
    The file has h1 (#) title, h2 (##) chapters, h3 (###) topics.
    We'll treat h2 sections as chapters and h3 subsections as topics.
    """
    content = read_file(filepath)

    # Extract h2 sections (chapters)
    h2_pattern = re.compile(r'^##\s+(.+)$', re.MULTILINE)
    h2_positions = [(m.start(), m.group(1).strip()) for m in h2_pattern.finditer(content)]

    if not h2_positions:
        # Treat entire file as one topic
        return [{
            'title': '英语逻辑语法要略',
            'slug': 'logic-grammar',
            'chapters': [{
                'title': '英语逻辑语法要略',
                'slug': 'logic-grammar/main',
                'topics': [{
                    'title': '全文',
                    'slug': 'logic-grammar/main/full'
                }]
            }]
        }], {'logic-grammar/main/full': content}

    chapters = []
    all_content = {}
    part_slug = 'logic-grammar'

    for i, (start, ch_title) in enumerate(h2_positions):
        end = h2_positions[i+1][0] if i+1 < len(h2_positions) else len(content)
        ch_body = content[start:end].strip()
        ch_slug_base = f'{part_slug}/{slugify(ch_title)}'

        # Look for h3 subsections within this chapter
        h3_pattern = re.compile(r'^###\s+(.+)$', re.MULTILINE)
        h3_positions = [(m.start(), m.group(1).strip()) for m in h3_pattern.finditer(ch_body)]

        topics = []
        if h3_positions:
            for j, (t_start, t_title) in enumerate(h3_positions):
                t_end = h3_positions[j+1][0] if j+1 < len(h3_positions) else len(ch_body)
                t_body = ch_body[t_start:t_end].strip()
                t_slug = f'{ch_slug_base}/{slugify(t_title)}'
                all_content[t_slug] = t_body
                topics.append({'title': t_title, 'slug': t_slug})
        else:
            # No h3, treat whole chapter as one topic
            t_slug = f'{ch_slug_base}/main'
            all_content[t_slug] = ch_body
            topics.append({'title': ch_title, 'slug': t_slug})

        chapters.append({
            'title': ch_title,
            'slug': ch_slug_base,
            'topics': topics
        })

    return [{
        'title': '英语逻辑语法',
        'slug': part_slug,
        'chapters': chapters
    }], all_content


def parse_txt_file(filepath, part_title, part_slug):
    """
    Parse a plain text grammar file as a single topic.
    """
    content = read_file(filepath)
    # Convert to simple markdown if it's plain text
    # Add a title heading if not present
    if not content.startswith('#'):
        content = f'# {part_title}\n\n' + content

    topic_slug = f'{part_slug}/main'
    return {
        'title': part_title,
        'slug': part_slug,
        'chapters': [{
            'title': part_title,
            'slug': part_slug,
            'topics': [{'title': part_title, 'slug': topic_slug}]
        }]
    }, {topic_slug: content}


def main():
    print("Building English grammar data...")

    if not os.path.exists(GRAMMAR_DIR):
        print(f"ERROR: Directory not found: {GRAMMAR_DIR}")
        return

    tree_parts = []
    all_content = {}

    # File processing order
    file_configs = [
        ('英语逻辑语法要略.md', 'md', None, None),
        ('副词类别.txt', 'txt', '副词类别', 'adverb-categories'),
        ('介词分类.txt', 'txt', '介词分类', 'preposition-categories'),
        ('评注性状语.txt', 'txt', '评注性状语', 'comment-adverbials'),
        ('英语逻辑关联词.txt', 'txt', '英语逻辑关联词', 'logical-connectors'),
    ]

    for fname, ftype, title, slug in file_configs:
        fpath = os.path.join(GRAMMAR_DIR, fname)
        if not os.path.exists(fpath):
            print(f"  Skipping (not found): {fname}")
            continue

        print(f"  Processing: {fname}")

        if ftype == 'md':
            parts, content = parse_main_md(fpath)
            tree_parts.extend(parts)
            all_content.update(content)
        elif ftype == 'txt':
            part, content = parse_txt_file(fpath, title, slug)
            tree_parts.append(part)
            all_content.update(content)

    grammar_data = {
        'tree': {'parts': tree_parts},
        'content': all_content
    }

    json_str = json.dumps(grammar_data, ensure_ascii=False, indent=2)
    js_output = f'const ENGLISH_GRAMMAR_DATA = {json_str};\n'

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_output)

    print(f"Done! {len(tree_parts)} parts, {len(all_content)} topics written to {OUT_FILE}")

if __name__ == '__main__':
    main()
