#!/usr/bin/env python3
"""
Build data/grammar-data.js by embedding grammar_tree.json and all .md files
into a single JS file to avoid fetch() issues on GitHub Pages.
"""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TREE_PATH = os.path.join(BASE, 'data', 'grammar_tree.json')
CONTENT_DIR = os.path.join(BASE, 'data', 'grammar_content')
OUT_PATH = os.path.join(BASE, 'data', 'grammar-data.js')

with open(TREE_PATH, encoding='utf-8') as f:
    tree = json.load(f)

content = {}
for part in tree.get('parts', []):
    for chapter in part.get('chapters', []):
        for topic in chapter.get('topics', []):
            slug = topic['slug']
            md_path = os.path.join(CONTENT_DIR, slug + '.md')
            if os.path.exists(md_path):
                with open(md_path, encoding='utf-8') as f:
                    content[slug] = f.read()
            else:
                print(f'WARNING: missing {md_path}')

data = {'tree': tree, 'content': content}
js = 'const GRAMMAR_DATA = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    f.write(js)

print(f'Done. Wrote {len(content)} topics to {OUT_PATH}')
