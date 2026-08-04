#!/usr/bin/env node
/**
 * validate_german_grammar.js
 *
 * Structural + integrity checks for data/german-grammar-data.js.
 * Run:  node scripts/validate_german_grammar.js
 * Exits non-zero on any hard failure.
 *
 * Checks
 *   1. schema      — global const name, { tree: { parts }, content } shape
 *   2. slugs       — every tree slug resolves to content; no duplicates
 *   3. orphans     — no content key missing from the tree
 *   4. levels      — every topic carries a valid CEFR level
 *   5. images      — every markdown image reference resolves on disk;
 *                    no legacy `.\img\` / backslash / absolute refs;
 *                    every shipped image file is actually referenced
 *   6. length      — no topic below the content floor
 *   7. tables      — every markdown table is balanced (header/separator/cells)
 *   8. examples    — every topic carries enough bold German example lines
 *   9. encoding    — no ASCII-transliterated umlauts left in German text
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'german-grammar-data.js');
const IMG_DIR = path.join(ROOT, 'data', 'grammar_content', 'de-img');

const LENGTH_FLOOR = 400;      // chars of markdown per topic
const EXAMPLE_FLOOR = 6;       // bold German example lines per authored topic
const CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---------------------------------------------------------------------------
// 1. load
// ---------------------------------------------------------------------------
const src = fs.readFileSync(DATA_FILE, 'utf8');
if (!/^const GERMAN_GRAMMAR_DATA = \{/m.test(src)) {
  fail('schema: file does not declare `const GERMAN_GRAMMAR_DATA = {`');
}
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src + '\nglobalThis.__DATA__ = GERMAN_GRAMMAR_DATA;', ctx, {
  filename: DATA_FILE,
});
const data = ctx.__DATA__;

if (!data || typeof data !== 'object') fail('schema: GERMAN_GRAMMAR_DATA is not an object');
if (!data.tree || !Array.isArray(data.tree.parts)) fail('schema: missing tree.parts array');
if (!data.content || typeof data.content !== 'object') fail('schema: missing content object');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

// module.exports tail so tests/ can require() it
if (!/module\.exports\s*=\s*GERMAN_GRAMMAR_DATA/.test(src)) {
  fail('schema: missing CommonJS `module.exports = GERMAN_GRAMMAR_DATA` tail');
}

// ---------------------------------------------------------------------------
// 2-4. tree walk
// ---------------------------------------------------------------------------
const seen = new Set();
let partCount = 0;
let chapterCount = 0;
let topicCount = 0;
const levelHist = {};

data.tree.parts.forEach((part, pi) => {
  partCount++;
  if (!part.title) fail(`tree: part[${pi}] missing title`);
  if (!part.slug) fail(`tree: part[${pi}] missing slug`);
  if (!Array.isArray(part.chapters)) {
    fail(`tree: part ${part.title} missing chapters array`);
    return;
  }
  part.chapters.forEach((ch, ci) => {
    chapterCount++;
    if (!ch.title) fail(`tree: chapter[${pi}.${ci}] missing title`);
    if (!ch.slug) fail(`tree: chapter[${pi}.${ci}] missing slug`);
    if (!Array.isArray(ch.topics)) {
      fail(`tree: chapter ${ch.title} missing topics array`);
      return;
    }
    ch.topics.forEach((t) => {
      topicCount++;
      if (!t.title) fail(`tree: topic ${t.slug} missing title`);
      if (!t.slug) fail(`tree: topic "${t.title}" missing slug`);
      if (!CEFR.has(t.level)) fail(`levels: topic ${t.slug} has invalid level ${JSON.stringify(t.level)}`);
      levelHist[t.level] = (levelHist[t.level] || 0) + 1;
      if (seen.has(t.slug)) fail(`slugs: duplicate tree slug ${t.slug}`);
      seen.add(t.slug);
      if (!Object.prototype.hasOwnProperty.call(data.content, t.slug)) {
        fail(`slugs: tree slug has no content: ${t.slug}`);
      }
    });
  });
});

Object.keys(data.content).forEach((k) => {
  if (!seen.has(k)) fail(`orphans: content key not reachable from tree: ${k}`);
});

// ---------------------------------------------------------------------------
// 5. images
// ---------------------------------------------------------------------------
const IMG_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMG_RE = /<img\b[^>]*>/gi;
let imgRefs = 0;
const referenced = new Set();

Object.entries(data.content).forEach(([slug, md]) => {
  let m;
  IMG_RE.lastIndex = 0;
  while ((m = IMG_RE.exec(md)) !== null) {
    imgRefs++;
    const ref = m[2];
    if (ref.includes('\\')) fail(`images: backslash in path (${slug}): ${ref}`);
    if (/^\//.test(ref)) fail(`images: site-absolute path breaks project pages (${slug}): ${ref}`);
    if (/^https?:/i.test(ref)) {
      warn(`images: remote reference (${slug}): ${ref}`);
      continue;
    }
    const abs = path.join(ROOT, decodeURIComponent(ref));
    if (!fs.existsSync(abs)) fail(`images: unresolvable reference (${slug}): ${ref}`);
    else referenced.add(path.basename(abs));
  }
  if (HTML_IMG_RE.test(md)) fail(`images: raw <img> tag in ${slug}`);
  HTML_IMG_RE.lastIndex = 0;
  if (/\.\\img\\|\.\/img\//.test(md)) fail(`images: legacy relative img path left in ${slug}`);
});

let onDisk = [];
if (fs.existsSync(IMG_DIR)) {
  onDisk = fs.readdirSync(IMG_DIR).filter((f) => f !== '.gitkeep');
  onDisk.forEach((f) => {
    if (!referenced.has(f)) warn(`images: shipped but never referenced: ${f}`);
  });
} else {
  fail(`images: ${IMG_DIR} does not exist`);
}

// ---------------------------------------------------------------------------
// 6. length floor
// ---------------------------------------------------------------------------
const lengths = Object.entries(data.content).map(([k, v]) => [k, v.length]);
lengths.forEach(([slug, len]) => {
  if (len < LENGTH_FLOOR) fail(`length: ${slug} is ${len} chars (floor ${LENGTH_FLOOR})`);
});

// ---------------------------------------------------------------------------
// 7. markdown tables
// ---------------------------------------------------------------------------
function cellCount(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').length;
}
const SEP_RE = /^\s*\|?[\s:|-]+\|[\s:|-]*$/;

let tableCount = 0;
Object.entries(data.content).forEach(([slug, md]) => {
  const lines = md.split('\n');
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim().startsWith('|')) {
      const block = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) block.push(lines[i++]);
      if (block.length === 1) {
        fail(`tables: single-row table fragment in ${slug}: ${block[0].trim().slice(0, 60)}`);
        continue;
      }
      tableCount++;
      if (!SEP_RE.test(block[1])) {
        fail(`tables: missing separator row in ${slug}: ${block[1].trim().slice(0, 60)}`);
        continue;
      }
      const want = cellCount(block[0]);
      block.forEach((row, ri) => {
        const got = cellCount(row);
        if (got !== want) {
          fail(`tables: ${slug} row ${ri + 1} has ${got} cells, header has ${want}: ${row.trim().slice(0, 70)}`);
        }
      });
    } else {
      i++;
    }
  }
});

// ---------------------------------------------------------------------------
// 8. example density
// ---------------------------------------------------------------------------
// Every topic uses `**German sentence**` on its own line followed by a Chinese
// gloss. Only the front-matter preface is exempt (it teaches no grammar).
const EXAMPLE_EXEMPT = new Set(['intro/前言']);
const EX_RE = /^\*\*[^*]+\*\*\s*$/gm;
Object.entries(data.content).forEach(([slug, md]) => {
  if (EXAMPLE_EXEMPT.has(slug)) return;
  const n = (md.match(EX_RE) || []).length;
  if (n < EXAMPLE_FLOOR) {
    fail(`examples: ${slug} has only ${n} standalone example lines (floor ${EXAMPLE_FLOOR})`);
  }
});

// ---------------------------------------------------------------------------
// 9. encoding
// ---------------------------------------------------------------------------
// Image filenames are deliberately ASCII (GitHub Pages + Chinese filenames),
// so image references are excluded before scanning prose.
const BAD_UMLAUT = /\b(?:Praesens|Praeteritum|moechte|koennen|muessen|duerfen|waere|haette|wuerde|fuer|ueber|Tuer|Pruefung|schoen|Gaeste|Buecher|Maedchen|natuerlich|zurueck|spaeter|naechste|Loesung|Uebung|Erklaerung)\b/;
Object.entries(data.content).forEach(([slug, md]) => {
  const prose = md.replace(IMG_RE, '');
  const m = prose.match(BAD_UMLAUT);
  if (m) fail(`encoding: ASCII-transliterated umlaut "${m[0]}" in ${slug}`);
});

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const sorted = lengths.map(([, l]) => l).sort((a, b) => a - b);
const total = sorted.reduce((a, b) => a + b, 0);
const pct = (p) => sorted[Math.floor((sorted.length - 1) * p)];

console.log('== german-grammar-data.js ==');
console.log(`file            ${path.relative(ROOT, DATA_FILE)} (${(fs.statSync(DATA_FILE).size / 1024).toFixed(1)} KB)`);
console.log(`global          GERMAN_GRAMMAR_DATA`);
console.log(`parts           ${partCount}`);
console.log(`chapters        ${chapterCount}`);
console.log(`topics          ${topicCount}`);
console.log(`content keys    ${Object.keys(data.content).length}`);
console.log(`total chars     ${total}`);
console.log(`chars mean      ${Math.round(total / topicCount)}`);
console.log(`chars min/p25/median/p75/max  ${sorted[0]}/${pct(0.25)}/${pct(0.5)}/${pct(0.75)}/${sorted[sorted.length - 1]}`);
console.log(`markdown tables ${tableCount}`);
console.log(`image refs      ${imgRefs}`);
console.log(`image files     ${onDisk.length} in data/grammar_content/de-img`);
console.log(`CEFR spread     ${Object.keys(levelHist).sort().map((k) => `${k}:${levelHist[k]}`).join('  ')}`);

if (warnings.length) {
  console.log(`\n-- warnings (${warnings.length}) --`);
  warnings.forEach((w) => console.log('  WARN ' + w));
}
if (errors.length) {
  console.log(`\n-- errors (${errors.length}) --`);
  errors.forEach((e) => console.log('  FAIL ' + e));
  console.log('\nVALIDATION FAILED');
  process.exit(1);
}
console.log('\nAll checks passed:');
console.log('  [ok] schema / global const / module.exports tail');
console.log('  [ok] every tree slug has content, no duplicates');
console.log('  [ok] no orphan content keys');
console.log('  [ok] every topic tagged with a CEFR level');
console.log(`  [ok] ${imgRefs} image references, 0 unresolvable`);
console.log(`  [ok] no topic below ${LENGTH_FLOOR} chars`);
console.log(`  [ok] ${tableCount} markdown tables, all balanced`);
console.log(`  [ok] every authored topic has >= ${EXAMPLE_FLOOR} example sentences`);
console.log('  [ok] no ASCII-transliterated umlauts');
