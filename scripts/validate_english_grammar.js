#!/usr/bin/env node
// scripts/validate_english_grammar.js
//
// Structural + editorial validator for data/english-grammar-data.js
// (the ENGLISH_GRAMMAR_DATA grammar book consumed by grammar-book.js),
// modelled on scripts/validate_french_grammar.js.
//
// Run:  node scripts/validate_english_grammar.js
//       node scripts/validate_english_grammar.js --quiet   (summary only)
//       node scripts/validate_english_grammar.js --file /tmp/x.js --partial
//         (check a partial build: skips the whole-book size floors)
//
// Asserts:
//   1. the file declares the global `FRENCH_GRAMMAR_DATA` and exports it
//   2. schema: { meta, tree: { parts: [{ title, slug, chapters: [{ title, slug,
//      topics: [{ title, slug, level }] }] }] }, content: { slug: markdown } }
//   3. every tree slug has content, and no content key is an orphan
//   4. no topic body is shorter than MIN_CHARS
//   5. no image references at all (![...], <img>, url(...))
//   6. every markdown table is balanced (header/separator/body column counts)
//   7. editorial conventions: H1 first line, an `## 例句` block with >= MIN_EXAMPLES
//      bullets that each mix English + Chinese, a `## 常见错误` block with >= 3
//      误/正 bullets, a valid CEFR level, unique slugs and titles
//   8. no placeholder text, replacement chars, mojibake or stray Cyrillic
//   9. whole-book floors: >= MIN_TOPICS topics and >= MIN_TOTAL_CHARS chars
//      (parity with the French book), unless --partial
//
// Prints per-topic character counts and the totals; exits non-zero on failure.

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const argFile = process.argv.indexOf('--file');
const DATA_FILE = argFile !== -1 ? path.resolve(process.argv[argFile + 1])
  : path.join(ROOT, 'data', 'english-grammar-data.js');
const GLOBAL_NAME = 'ENGLISH_GRAMMAR_DATA';
const PARTIAL = process.argv.includes('--partial');

const MIN_CHARS = 900;          // hard floor for a topic body
const WARN_CHARS = 1200;        // soft floor: reported but not fatal
const MIN_EXAMPLES = 6;         // >= 6 example sentences per topic
const MIN_MISTAKES = 3;         // 常见错误 bullets
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const MIN_TOPICS = 100;
const MIN_TOTAL_CHARS = 200000;

const QUIET = process.argv.includes('--quiet');

const errors = [];
const warnings = [];
let imageRefs = 0;
const fail = msg => errors.push(msg);
const warn = msg => warnings.push(msg);

// ---------------------------------------------------------------------------
// 1. load
// ---------------------------------------------------------------------------

const src = fs.readFileSync(DATA_FILE, 'utf8');

if (!src.includes(`const ${GLOBAL_NAME} =`)) {
  fail(`${GLOBAL_NAME} is not declared as a top-level const`);
}
if (!/if \(typeof module !== 'undefined' && module\.exports\) \{\s*module\.exports = ENGLISH_GRAMMAR_DATA;/.test(src)) {
  fail('missing the module.exports tail required by the dataset contract');
}

// browser path: plain script, global const, no module wrapper
const sandbox = { console };
vm.createContext(sandbox);
let browserData;
try {
  browserData = vm.runInContext(`${src};${GLOBAL_NAME}`, sandbox, { filename: DATA_FILE });
} catch (err) {
  fail(`file does not evaluate as a plain browser script: ${err.message}`);
}

// node path: require()
let data;
try {
  data = require(DATA_FILE);
} catch (err) {
  fail(`require() failed: ${err.message}`);
}

if (errors.length) {
  report([], 0);
}

if (browserData && data && browserData.meta && data.meta &&
    browserData.meta.topicCount !== data.meta.topicCount) {
  fail('the browser global and the CommonJS export disagree');
}

// ---------------------------------------------------------------------------
// 2. schema
// ---------------------------------------------------------------------------

if (!data || typeof data !== 'object') fail('export is not an object');
if (!data.tree || !Array.isArray(data.tree.parts)) fail('missing tree.parts array');
if (!data.content || typeof data.content !== 'object') fail('missing content map');
if (!data.meta || typeof data.meta.title !== 'string') fail('missing meta.title');

const parts = (data.tree && data.tree.parts) || [];
const content = data.content || {};

const topics = [];
parts.forEach((part, pi) => {
  if (!part.title) fail(`part[${pi}] has no title`);
  if (!part.slug) fail(`part[${pi}] has no slug`);
  if (!Array.isArray(part.chapters) || !part.chapters.length) {
    fail(`part "${part.title}" has no chapters`);
    return;
  }
  part.chapters.forEach((ch, ci) => {
    if (!ch.title) fail(`part "${part.title}" chapter[${ci}] has no title`);
    if (!ch.slug) fail(`part "${part.title}" chapter[${ci}] has no slug`);
    if (!Array.isArray(ch.topics) || !ch.topics.length) {
      fail(`chapter "${ch.title}" has no topics`);
      return;
    }
    ch.topics.forEach((t, ti) => {
      if (!t.title) fail(`chapter "${ch.title}" topic[${ti}] has no title`);
      if (!t.slug) fail(`chapter "${ch.title}" topic[${ti}] has no slug`);
      topics.push({ part: part.title, chapter: ch.title, ...t });
    });
  });
});

// the audit called out the old 8 parts x 1 identically-named chapter tree
parts.forEach(part => {
  const names = new Set((part.chapters || []).map(c => c.title));
  if ((part.chapters || []).length > 1 && names.size === 1) {
    fail(`part "${part.title}" repeats one chapter title for every chapter`);
  }
  if ((part.chapters || []).length === 1 && (part.chapters[0].title === part.title)) {
    fail(`part "${part.title}" has a single chapter with the same name (degenerate tree)`);
  }
});

// ---------------------------------------------------------------------------
// 3. slug / content cross-checks
// ---------------------------------------------------------------------------

const seenSlugs = new Set();
const seenTitles = new Set();
for (const t of topics) {
  if (seenSlugs.has(t.slug)) fail(`duplicate topic slug: ${t.slug}`);
  seenSlugs.add(t.slug);
  const titleKey = `${t.chapter}::${t.title}`;
  if (seenTitles.has(titleKey)) fail(`duplicate topic title in one chapter: ${titleKey}`);
  seenTitles.add(titleKey);
  if (!/^p\d+\/ch\d{2}\/t\d{2}$/.test(t.slug)) {
    fail(`slug does not match grammar/1 p<N>/ch<NN>/t<NN>: ${t.slug}`);
  }
  if (!LEVELS.includes(t.level)) {
    fail(`topic ${t.slug} has an invalid CEFR level: ${JSON.stringify(t.level)}`);
  }
  if (!Object.prototype.hasOwnProperty.call(content, t.slug)) {
    fail(`tree slug has no content entry: ${t.slug}`);
  }
}

for (const key of Object.keys(content)) {
  if (!seenSlugs.has(key)) fail(`orphan content key (not in the tree): ${key}`);
}

// ---------------------------------------------------------------------------
// 4. per-topic body checks
// ---------------------------------------------------------------------------

const CJK = /[一-鿿]/;
const LATIN = /[A-Za-zÀ-ÿ]/;
const CYRILLIC = /[Ѐ-ӿ]/;
const PLACEHOLDER = /(TODO|FIXME|XXX|Lorem ipsum|待补充|TBD)/i;

const rows = [];

for (const t of topics) {
  const md = content[t.slug];
  const where = `${t.slug}`;
  if (typeof md !== 'string' || !md.trim()) {
    fail(`${where}: empty content`);
    continue;
  }
  const chars = md.length;
  rows.push({ slug: t.slug, level: t.level, chars, title: t.title });

  if (chars < MIN_CHARS) fail(`${where}: body is ${chars} chars, below the ${MIN_CHARS} floor`);
  else if (chars < WARN_CHARS) warn(`${where}: body is only ${chars} chars`);

  // no images, ever
  if (/!\[/.test(md)) { imageRefs += 1; fail(`${where}: markdown image reference`); }
  if (/<img/i.test(md)) { imageRefs += 1; fail(`${where}: <img> tag`); }
  if (/url\(/i.test(md)) { imageRefs += 1; fail(`${where}: css url() reference`); }
  if (/\.(png|jpe?g|gif|svg|webp)\b/i.test(md)) { imageRefs += 1; fail(`${where}: image file reference`); }

  // encoding / placeholder hygiene
  if (md.includes('�')) fail(`${where}: U+FFFD replacement character`);
  if (/Ã[©¨¢«»]|â€™|Ã /.test(md)) fail(`${where}: mojibake`);
  if (CYRILLIC.test(md)) fail(`${where}: stray Cyrillic characters`);
  if (PLACEHOLDER.test(md)) fail(`${where}: placeholder text`);
  if (md !== md.normalize('NFC')) fail(`${where}: not NFC-normalised`);

  const lines = md.split('\n');

  // structure: H1 first, and the H1 must match the tree title
  if (!lines[0].startsWith('# ')) fail(`${where}: does not start with an H1 heading`);
  else if (lines[0].slice(2).trim() !== t.title.trim()) {
    fail(`${where}: H1 "${lines[0].slice(2).trim()}" != tree title "${t.title}"`);
  }

  // markdown tables must be balanced
  let inTable = false;
  let tableCols = 0;
  let tableStart = 0;
  let sawSeparator = false;
  const closeTable = idx => {
    if (inTable && !sawSeparator) {
      fail(`${where}: table starting at line ${tableStart} has no header separator row`);
    }
    inTable = false;
    sawSeparator = false;
  };
  lines.forEach((line, idx) => {
    const isRow = /^\s*\|.*\|\s*$/.test(line.trim()) || (line.trim().startsWith('|') && line.trim().endsWith('|'));
    if (isRow) {
      const cells = line.trim().slice(1, -1).split('|').length;
      if (!inTable) {
        inTable = true;
        tableCols = cells;
        tableStart = idx + 1;
        sawSeparator = false;
      } else if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) {
        sawSeparator = true;
        if (cells !== tableCols) {
          fail(`${where}: table at line ${tableStart} separator has ${cells} cells, header has ${tableCols}`);
        }
      } else if (cells !== tableCols) {
        fail(`${where}: table at line ${tableStart} row ${idx + 1} has ${cells} cells, header has ${tableCols}`);
      }
    } else if (line.trim() === '' || !line.includes('|')) {
      closeTable(idx);
    } else if (inTable && line.includes('|')) {
      fail(`${where}: line ${idx + 1} looks like an unterminated table row`);
      closeTable(idx);
    }
  });
  closeTable(lines.length);

  // editorial conventions: 例句 block
  const exIdx = lines.findIndex(l => /^##\s*例句/.test(l));
  if (exIdx === -1) {
    fail(`${where}: no "## 例句" section`);
  } else {
    const block = [];
    for (let i = exIdx + 1; i < lines.length; i += 1) {
      if (/^##\s/.test(lines[i])) break;
      if (/^-\s+/.test(lines[i])) block.push(lines[i]);
    }
    if (block.length < MIN_EXAMPLES) {
      fail(`${where}: only ${block.length} example sentences, need >= ${MIN_EXAMPLES}`);
    }
    block.forEach((b, i) => {
      if (!LATIN.test(b)) fail(`${where}: example ${i + 1} has no English text`);
      if (!CJK.test(b)) fail(`${where}: example ${i + 1} has no Chinese translation`);
    });
  }

  // editorial conventions: 常见错误 block
  const errIdx = lines.findIndex(l => /^##\s*常见错误/.test(l));
  if (errIdx === -1) {
    fail(`${where}: no "## 常见错误" section`);
  } else {
    const block = [];
    for (let i = errIdx + 1; i < lines.length; i += 1) {
      if (/^##\s/.test(lines[i])) break;
      if (/^-\s+/.test(lines[i])) block.push(lines[i]);
    }
    if (block.length < MIN_MISTAKES) {
      fail(`${where}: only ${block.length} common-mistake bullets, need >= ${MIN_MISTAKES}`);
    }
    block.forEach((b, i) => {
      if (!(b.includes('误') && b.includes('正'))) {
        fail(`${where}: common-mistake bullet ${i + 1} is not a 误/正 pair`);
      }
    });
  }

  // leftovers from the French template / other books must not leak in
  if (/[àâçèêëîïôùûœ]/i.test(md.replace(/café|fiancée?|naïve|résumé|cliché|déjà vu|façade|rôle|entrée|protégé|touché|Zoë|Chloë|Renée|José|Beyoncé|Pokémon|Côte|São|Zürich|München|Québec|Montréal/gi, ''))) {
    warn(`${where}: contains French/German accented letters — check for template leftovers`);
  }
  // 例句 bullets: **English sentence** + Chinese translation
  if (exIdx !== -1) {
    for (let i = exIdx + 1; i < lines.length; i += 1) {
      if (/^##\s/.test(lines[i])) break;
      if (/^-\s+/.test(lines[i]) && !/^-\s+\*\*[^*]*[A-Za-z][^*]*\*\*/.test(lines[i])) {
        fail(`${where}: example "${lines[i].slice(0, 40)}" does not start with a **bold English sentence**`);
      }
    }
  }
}

// meta consistency
if (data.meta && data.meta.topicCount !== topics.length) {
  fail(`meta.topicCount ${data.meta.topicCount} != actual ${topics.length}`);
}
if (!PARTIAL) {
  const totalChars = topics.reduce((n, t) => n + ((content[t.slug] || '').length), 0);
  if (topics.length < MIN_TOPICS) fail(`only ${topics.length} topics, need >= ${MIN_TOPICS}`);
  if (totalChars < MIN_TOTAL_CHARS) fail(`only ${totalChars} chars of content, need >= ${MIN_TOTAL_CHARS}`);
}
if (data.meta && Array.isArray(data.meta.levels)) {
  const used = new Set(topics.map(t => t.level));
  for (const lvl of used) {
    if (!data.meta.levels.includes(lvl)) fail(`level ${lvl} used but not declared in meta.levels`);
  }
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

report(rows, topics.length);

function report(rowList, topicCount) {
  const total = rowList.reduce((n, r) => n + r.chars, 0);
  const sorted = rowList.map(r => r.chars).sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;

  if (!QUIET && rowList.length) {
    console.log('per-topic character counts');
    console.log('--------------------------------------------------------------------');
    let currentChapter = null;
    for (const t of topics) {
      const row = rowList.find(r => r.slug === t.slug);
      if (!row) continue;
      if (t.chapter !== currentChapter) {
        currentChapter = t.chapter;
        console.log(`\n[${t.part}] ${t.chapter}`);
      }
      console.log(`  ${String(row.chars).padStart(6)}  ${row.level}  ${row.slug}`);
    }
    console.log('');
  }

  if (rowList.length) {
    const byLevel = {};
    for (const r of rowList) byLevel[r.level] = (byLevel[r.level] || 0) + 1;
    console.log('--------------------------------------------------------------------');
    console.log(`parts:      ${parts.length}`);
    console.log(`chapters:   ${parts.reduce((n, p) => n + (p.chapters || []).length, 0)}`);
    console.log(`topics:     ${topicCount}`);
    console.log(`levels:     ${LEVELS.map(l => `${l}=${byLevel[l] || 0}`).join('  ')}`);
    console.log(`total:      ${total} chars`);
    console.log(`mean:       ${Math.round(total / rowList.length)} chars`);
    console.log(`median:     ${median} chars`);
    console.log(`min / max:  ${sorted[0]} / ${sorted[sorted.length - 1]} chars`);
    console.log(`image refs: ${imageRefs} (must be 0)`);
    console.log('--------------------------------------------------------------------');
  }

  for (const w of warnings) console.log(`WARN  ${w}`);
  for (const e of errors) console.error(`FAIL  ${e}`);

  if (errors.length) {
    console.error(`\n${errors.length} error(s). english-grammar-data.js is NOT valid.`);
    process.exit(1);
  }
  console.log(`\nOK — ${topicCount} topics, ${warnings.length} warning(s), 0 errors.`);
  process.exit(0);
}
