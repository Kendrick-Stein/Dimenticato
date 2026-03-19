#!/usr/bin/env python3
"""
Build German grammar data file from deutsch-data/grammar/docs/ directory.
Generates data/german-grammar-data.js with GERMAN_GRAMMAR_DATA constant.
Structure mirrors data/grammar-data.js (GRAMMAR_DATA).
"""

import os
import json
import re

DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'deutsch-data', 'grammar', 'docs')
OUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'german-grammar-data.js')

# Categories to skip (learning resources, not grammar)
SKIP_CATEGORIES = {'学习资源'}

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def strip_frontmatter(text):
    """Remove YAML frontmatter from markdown."""
    if text.startswith('---'):
        end = text.find('---', 3)
        if end != -1:
            return text[end+3:].lstrip('\n')
    return text

def get_frontmatter_position(text):
    """Extract sidebar_position from frontmatter."""
    match = re.search(r'^sidebar_position:\s*(\d+)', text, re.MULTILINE)
    if match:
        return int(match.group(1))
    return 999

def read_category_json(category_dir):
    """Read _category_.json and return (label, position)."""
    cat_file = os.path.join(category_dir, '_category_.json')
    if os.path.exists(cat_file):
        with open(cat_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        label = data.get('label', os.path.basename(category_dir))
        # Strip leading number+dot from label like "6. 动词"
        label = re.sub(r'^\d+\.\s*', '', label)
        position = data.get('position', 999)
        return label, position
    return os.path.basename(category_dir), 999

def slugify(text):
    """Create a URL-friendly slug."""
    # Replace spaces and special chars with hyphens
    slug = re.sub(r'[^\w\u4e00-\u9fff\u3400-\u4dbf]', '-', text)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug.lower()

def build_tree_and_content():
    tree_parts = []
    content = {}

    # Get top-level categories (subdirectories)
    entries = []
    for name in os.listdir(DOCS_DIR):
        path = os.path.join(DOCS_DIR, name)
        if name.startswith('.') or name.startswith('_'):
            continue
        if name in SKIP_CATEGORIES:
            continue
        if os.path.isdir(path):
            label, position = read_category_json(path)
            entries.append((position, name, label, path, 'dir'))
        elif name.endswith('.md'):
            # Top-level markdown (e.g. 前言.md)
            raw = read_file(path)
            pos = get_frontmatter_position(raw)
            content_text = strip_frontmatter(raw)
            # Extract title from first heading
            title_match = re.search(r'^#\s+(.+)', content_text, re.MULTILINE)
            title = title_match.group(1).strip() if title_match else name.replace('.md', '')
            entries.append((pos, name, title, path, 'file'))

    entries.sort(key=lambda x: x[0])

    part_index = 0
    for pos, name, label, path, etype in entries:
        part_slug = slugify(label) if etype == 'dir' else slugify(label)

        if etype == 'file':
            # Top-level file → single-topic "part" with one chapter
            raw = read_file(path)
            content_text = strip_frontmatter(raw)
            slug_key = f'intro/{slugify(label)}'
            content[slug_key] = content_text
            tree_parts.append({
                'title': label,
                'slug': part_slug,
                'chapters': [{
                    'title': label,
                    'slug': slugify(label),
                    'topics': [{
                        'title': label,
                        'slug': slug_key
                    }]
                }]
            })
            continue

        # It's a directory (category)
        chapter_slug = part_slug  # single chapter per category
        topics = []

        # Get all .md files in this category directory (not subdirs)
        md_files = []
        for fname in os.listdir(path):
            if fname.endswith('.md') and not fname.startswith('_'):
                fpath = os.path.join(path, fname)
                raw = read_file(fpath)
                fpos = get_frontmatter_position(raw)
                content_text = strip_frontmatter(raw)
                title_match = re.search(r'^#\s+(.+)', content_text, re.MULTILINE)
                title = title_match.group(1).strip() if title_match else fname.replace('.md', '')
                md_files.append((fpos, fname, title, content_text))

        md_files.sort(key=lambda x: x[0])

        for fpos, fname, title, content_text in md_files:
            topic_slug = f'{part_slug}/{slugify(title)}'
            content[topic_slug] = content_text
            topics.append({
                'title': title,
                'slug': topic_slug
            })

        if topics:
            tree_parts.append({
                'title': label,
                'slug': part_slug,
                'chapters': [{
                    'title': label,
                    'slug': chapter_slug,
                    'topics': topics
                }]
            })

    return tree_parts, content

def main():
    print("Building German grammar data...")
    tree_parts, content = build_tree_and_content()

    grammar_data = {
        'tree': {'parts': tree_parts},
        'content': content
    }

    # Serialize to JS
    json_str = json.dumps(grammar_data, ensure_ascii=False, indent=2)
    js_output = f'const GERMAN_GRAMMAR_DATA = {json_str};\n'

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_output)

    total_topics = sum(
        len(t['topics'])
        for p in tree_parts
        for c in p['chapters']
        for t in [c]
    )
    print(f"Done! {len(tree_parts)} parts, {len(content)} topics written to {OUT_FILE}")

if __name__ == '__main__':
    main()
