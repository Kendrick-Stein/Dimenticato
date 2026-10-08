#!/usr/bin/env node
/*
 * Validator for data/de-grammar.js (GERMAN_GRAMMAR_DATA).
 *
 * Hard assertions (exit 1 on any failure):
 *   1. schema      - { tree: { parts: [ { title, slug, chapters: [ { title,
 *                    slug, topics: [ { title, slug, level } ] } ] } ] },
 *                    content: { slug: markdown } }
 *   2. images      - every ![](...) reference resolves to a file that exists on
 *                    disk (relative to the repo root or to
 *                    data/grammar_content/de-img/); the dataset currently ships
 *                    zero image references, so the count must stay at 0
 *                    unresolvable
 *   3. coverage    - every tree slug has a content entry
 *   4. orphans     - every content key appears in the tree
 *   5. duplicates  - no slug appears twice in the tree
 *   6. length      - no topic body shorter than LENGTH_FLOOR characters
 *   7. tables      - every markdown pipe table has a separator row and a
 *                    constant column count, and every markdown block has a
 *                    balanced number of `**` bold markers
 *   8. examples    - every topic with an "## 例句" section lists at least
 *                    MIN_EXAMPLES numbered example sentences
 *   9. levels      - every topic carries a CEFR level from A1..C2
 *
 * Usage: node scripts/validate_german_grammar.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'de-grammar.js');
const IMG_DIR = path.join(ROOT, 'data', 'grammar_content', 'de-img');
const GLOBAL_NAME = 'GERMAN_GRAMMAR_DATA';

const LENGTH_FLOOR = 600;
const MIN_EXAMPLES = 6;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const errors = [];
function check(condition, message) {
  if (!condition) errors.push(message);
}

// --- load -----------------------------------------------------------------
const src = fs.readFileSync(DATA_FILE, 'utf8');
const ctx = vm.createContext({ module: { exports: {} } });
const data = vm.runInContext(src + ';' + GLOBAL_NAME, ctx);

check(data && typeof data === 'object', 'global ' + GLOBAL_NAME + ' is not an object');
check(data && data.tree && Array.isArray(data.tree.parts), 'tree.parts missing');
check(data && data.content && typeof data.content === 'object', 'content missing');
if (errors.length) {
  errors.forEach((e) => console.error('FAIL  ' + e));
  process.exit(1);
}

// --- 1. schema + 5. duplicates + 9. levels ---------------------------------
const treeSlugs = [];
const seen = new Set();
let chapterCount = 0;

data.tree.parts.forEach((part, pi) => {
  check(typeof part.title === 'string' && part.title.length > 0, 'part[' + pi + '] has no title');
  check(typeof part.slug === 'string' && part.slug.length > 0, 'part[' + pi + '] has no slug');
  check(Array.isArray(part.chapters), 'part[' + pi + '] has no chapters array');
  (part.chapters || []).forEach((chapter, ci) => {
    chapterCount += 1;
    const where = 'part[' + pi + '].chapter[' + ci + ']';
    check(typeof chapter.title === 'string' && chapter.title.length > 0, where + ' has no title');
    check(typeof chapter.slug === 'string' && chapter.slug.length > 0, where + ' has no slug');
    check(Array.isArray(chapter.topics), where + ' has no topics array');
    (chapter.topics || []).forEach((topic, ti) => {
      const at = where + '.topic[' + ti + ']';
      check(typeof topic.slug === 'string' && topic.slug.length > 0, at + ' has no slug');
      check(typeof topic.title === 'string' && topic.title.length > 0,
        at + ' (' + topic.slug + ') has no title');
      check(LEVELS.indexOf(topic.level) !== -1,
        at + ' (' + topic.slug + ') has invalid CEFR level: ' + JSON.stringify(topic.level));
      check(!seen.has(topic.slug), 'duplicate slug in tree: ' + topic.slug);
      seen.add(topic.slug);
      treeSlugs.push(topic.slug);
    });
  });
});

// --- 3. coverage / 4. orphans ---------------------------------------------
const contentKeys = Object.keys(data.content);
treeSlugs.forEach((slug) => {
  check(Object.prototype.hasOwnProperty.call(data.content, slug),
    'tree slug has no content: ' + slug);
});
contentKeys.forEach((slug) => {
  check(seen.has(slug), 'orphan content key (not in tree): ' + slug);
});

// --- 2. images -------------------------------------------------------------
const IMG_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
let imgRefs = 0;
let imgUnresolvable = 0;
contentKeys.forEach((slug) => {
  const body = data.content[slug];
  let m;
  IMG_RE.lastIndex = 0;
  while ((m = IMG_RE.exec(body)) !== null) {
    imgRefs += 1;
    const ref = m[1];
    if (/^(https?:)?\/\//i.test(ref) || ref.indexOf('data:') === 0) {
      imgUnresolvable += 1;
      errors.push('remote/inline image reference in ' + slug + ': ' + ref);
      continue;
    }
    const normalized = ref.replace(/\\/g, '/').replace(/^\.\//, '');
    const candidates = [
      path.join(ROOT, normalized),
      path.join(IMG_DIR, path.basename(normalized)),
    ];
    if (!candidates.some((p) => fs.existsSync(p))) {
      imgUnresolvable += 1;
      errors.push('unresolvable image reference in ' + slug + ': ' + ref);
    }
  }
});

// --- 6. length floor -------------------------------------------------------
const lengths = contentKeys.map((slug) => data.content[slug].length).sort((a, b) => a - b);
contentKeys.forEach((slug) => {
  const body = data.content[slug];
  check(typeof body === 'string', 'content[' + slug + '] is not a string');
  check(body.length >= LENGTH_FLOOR,
    'content below length floor (' + body.length + ' < ' + LENGTH_FLOOR + '): ' + slug);
  check(/^#\s+\S/.test(body.trimStart()), 'content does not start with an h1: ' + slug);
});

// --- 7. markdown table balance --------------------------------------------
const SEP_RE = /^\s*\|?[\s:|-]*-{3,}[\s:|-]*\|?\s*$/;
function cellCount(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').length;
}
let tableCount = 0;
contentKeys.forEach((slug) => {
  const lines = data.content[slug].split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim().indexOf('|') === -1) continue;
    if (!/^\s*\|/.test(lines[i])) continue;
    const sep = lines[i + 1] || '';
    if (!(SEP_RE.test(sep) && sep.indexOf('|') !== -1)) continue;
    tableCount += 1;
    const cols = cellCount(lines[i]);
    if (cellCount(sep) !== cols) {
      errors.push('table separator column mismatch in ' + slug + ' (line ' + (i + 2) +
        '): header ' + cols + ' vs separator ' + cellCount(sep));
    }
    let j = i + 2;
    for (; j < lines.length; j += 1) {
      if (!/^\s*\|/.test(lines[j])) break;
      if (cellCount(lines[j]) !== cols) {
        errors.push('unbalanced table row in ' + slug + ' (line ' + (j + 1) + '): ' +
          cellCount(lines[j]) + ' cells, header has ' + cols);
      }
    }
    i = j - 1;
  }
});

// --- 7b. bold-marker balance ----------------------------------------------
// An odd number of `**` inside one markdown block means a bold span that never
// closes, which marked renders as literal asterisks.
contentKeys.forEach((slug) => {
  data.content[slug].split(/\n\s*\n/).forEach((block, i) => {
    const n = (block.match(/\*\*/g) || []).length;
    check(n % 2 === 0, 'unbalanced ** markers in ' + slug + ' (block ' + i + '): ' +
      JSON.stringify(block.slice(0, 60)));
  });
});

// --- 8. example sentences --------------------------------------------------
let withExamples = 0;
contentKeys.forEach((slug) => {
  const body = data.content[slug];
  const idx = body.indexOf('## 例句');
  if (idx === -1) return;
  withExamples += 1;
  const rest = body.slice(idx);
  const end = rest.indexOf('\n## ', 3);
  const block = end === -1 ? rest : rest.slice(0, end);
  const n = (block.match(/^\s*\d+\.\s+\S/gm) || []).length;
  check(n >= MIN_EXAMPLES,
    'only ' + n + ' example sentences (need ' + MIN_EXAMPLES + '): ' + slug);
});

// --- report ----------------------------------------------------------------
const totalChars = contentKeys.reduce((a, k) => a + data.content[k].length, 0);
const median = lengths[Math.floor(lengths.length / 2)];

console.log('file            : ' + path.relative(ROOT, DATA_FILE));
console.log('global          : ' + GLOBAL_NAME);
console.log('parts           : ' + data.tree.parts.length);
console.log('chapters        : ' + chapterCount);
console.log('topics (tree)   : ' + treeSlugs.length);
console.log('content keys    : ' + contentKeys.length);
console.log('characters      : ' + totalChars +
  '  (mean ' + Math.round(totalChars / contentKeys.length) +
  ', median ' + median + ', min ' + lengths[0] + ', max ' + lengths[lengths.length - 1] + ')');
console.log('image refs      : ' + imgRefs + '  (unresolvable ' + imgUnresolvable + ')');
console.log('markdown tables : ' + tableCount);
console.log('topics with 例句: ' + withExamples + '  (>= ' + MIN_EXAMPLES + ' sentences each)');
console.log('length floor    : ' + LENGTH_FLOOR + ' chars');

if (errors.length) {
  console.error('');
  errors.forEach((e) => console.error('FAIL  ' + e));
  console.error('');
  console.error(errors.length + ' failure(s)');
  process.exit(1);
}
console.log('');
console.log('OK  all checks passed (0 failures)');
