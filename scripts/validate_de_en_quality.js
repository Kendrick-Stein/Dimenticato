#!/usr/bin/env node
/**
 * Content-quality guard for the German and English learning data: the
 * regressions scripts/de_vocab_fixes.py, scripts/en_vocab_fixes.py and
 * scripts/de_course_fixes.py repaired, so a rebuild that loses them fails.
 *
 *   German vocab (data/vocab/de.js)
 *     - a noun with more than one gender ("m/n") must be an audited genuine
 *       double listed in scripts/de_vocab_fixes/gender-decisions.json
 *     - zh carries no dictionary sense numbering ("想 2. + an A 想到") and no
 *       glued-in grammar tags ("Vt", "Vi", "Vr")
 *     - en stays within 100 characters (condensed Wiktionary glosses)
 *   English vocab (data/vocab/en.js)
 *     - scripts/en_quality_checks.js: no inflected headwords, zh within
 *       budget, no "??" garbage, no bare inflection notes, proper-noun allowlist
 *   German course (data/de-course.js)
 *     - every unit word exists in the vocab; A1 units hold no C1/C2 words
 *     - every grammar slug resolves in data/de-grammar.js
 *     - no grammar topic sits above its unit's level, except the audited
 *       one-level exceptions in scripts/de_course_fixes.json
 *
 * Run: node scripts/validate_de_en_quality.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { checkEnglish } = require('./en_quality_checks.js');

const ROOT = path.resolve(__dirname, '..');
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const EN_MAX = 100;
const CJK = '㐀-鿿豈-﫿';
const SENSE_NUMBER = new RegExp('(?:^|[\\s;；,，' + CJK + ')）])\\s*[2-9]\\s*\\.\\s*\\S');
const GRAMMAR_TAG = new RegExp('(?:^|[\\s;；,，.' + CJK + '])(?:Vt|Vi|Vr)(?![A-Za-zÄÖÜäöüß])');

let passed = 0;
const failures = [];
function check(ok, msg) {
  if (ok) passed++;
  else failures.push(msg);
}
function sample(list, n = 5) {
  return list.slice(0, n).join(', ') + (list.length > n ? ', …' : '');
}

function load(file, expr) {
  const ctx = { console };
  ctx.globalThis = ctx;
  ctx.window = ctx;
  vm.createContext(ctx);
  return vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8') + '\n;' + expr, ctx,
    { filename: file });
}
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

// --- German vocab -----------------------------------------------------------
const de = load('data/vocab/de.js', 'DIM_VOCAB.de');
const decisions = readJson('scripts/de_vocab_fixes/gender-decisions.json');
const byWord = new Map(de.entries.map(e => [e.word, e]));
const multi = [], numbered = [], tagged = [], longEn = [];
for (const e of de.entries) {
  if ((e.gender || '').includes('/')) {
    const d = decisions[e.word];
    if (!d || d.gender !== e.gender) multi.push(`${e.word} ${e.gender}`);
  }
  if (SENSE_NUMBER.test(e.zh || '')) numbered.push(`${e.word} "${e.zh}"`);
  if (GRAMMAR_TAG.test(e.zh || '')) tagged.push(`${e.word} "${e.zh}"`);
  if ((e.en || '').length > EN_MAX) longEn.push(e.word);
}
check(!multi.length, `de: ${multi.length} multi-gender nouns not in gender-decisions.json (${sample(multi)})`);
check(!numbered.length, `de: ${numbered.length} zh with sense numbering (${sample(numbered)})`);
check(!tagged.length, `de: ${tagged.length} zh with Vt/Vi/Vr tags (${sample(tagged)})`);
check(!longEn.length, `de: ${longEn.length} en glosses over ${EN_MAX} chars (${sample(longEn)})`);
const inner = byWord.get('inner');
check(!inner || inner.pos !== 'preposition', 'de: "inner" is tagged as a preposition');

// --- English vocab ----------------------------------------------------------
const en = load('data/vocab/en.js', 'DIM_VOCAB.en');
const enResult = checkEnglish(en.entries);
check(!enResult.errors.length, 'en: ' + enResult.errors.join('; '));

// --- German course ----------------------------------------------------------
const grammar = load('data/de-grammar.js', 'GERMAN_GRAMMAR_DATA');
const course = load('data/de-course.js', 'GERMAN_COURSE_DATA');
const topicLevel = {};
for (const p of grammar.tree.parts)
  for (const c of p.chapters)
    for (const t of c.topics) topicLevel[t.slug] = t.level;
const aliases = (grammar.meta && grammar.meta.aliases) || {};
const exceptions = new Map(readJson('scripts/de_course_fixes.json').levelExceptions
  .map(x => [x.unit + ' ' + x.slug, x]));
const usedExceptions = new Set();
const missingWords = [], hardWords = [], unresolved = [], overLevel = [];
for (const level of course.levels) {
  const unitRank = LEVELS.indexOf(level.id);
  for (const unit of level.units) {
    for (const w of unit.words || []) {
      const e = byWord.get(w);
      if (!e) missingWords.push(`${unit.id}:${w}`);
      else if (level.id === 'A1' && LEVELS.indexOf(e.level) >= LEVELS.indexOf('C1'))
        hardWords.push(`${unit.id}:${w}(${e.level})`);
    }
    for (const g of unit.grammar || []) {
      const slug = aliases[g.slug] || g.slug;
      if (!(slug in topicLevel)) { unresolved.push(`${unit.id}:${g.slug}`); continue; }
      const gap = LEVELS.indexOf(topicLevel[slug]) - unitRank;
      if (gap <= 0) continue;
      const key = unit.id + ' ' + slug;
      if (gap === 1 && exceptions.has(key)) usedExceptions.add(key);
      else overLevel.push(`${unit.id} ${g.label}→${slug}(${topicLevel[slug]})`);
    }
  }
}
check(!missingWords.length, `course: ${missingWords.length} unit words missing from the vocab (${sample(missingWords)})`);
check(!hardWords.length, `course: ${hardWords.length} C1/C2 words in A1 units (${sample(hardWords)})`);
check(!unresolved.length, `course: ${unresolved.length} grammar slugs that resolve nowhere (${sample(unresolved)})`);
check(!overLevel.length, `course: ${overLevel.length} grammar links above the unit level (${sample(overLevel)})`);
const unusedEx = [...exceptions.keys()].filter(k => !usedExceptions.has(k));
check(!unusedEx.length, `course: ${unusedEx.length} levelExceptions no longer needed (${sample(unusedEx)})`);
const referenced = new Set(course.levels.flatMap(l => l.units.flatMap(u =>
  (u.grammar || []).map(g => aliases[g.slug] || g.slug))));
const unreferenced = Object.keys(topicLevel).filter(s => !referenced.has(s)).length;

if (failures.length) {
  failures.forEach(f => console.error('FAIL ' + f));
  console.log(`validate_de_en_quality: ${passed} passed, ${failures.length} failed`);
  process.exit(1);
}
console.log(`de: ${de.entries.length} entries, ${Object.keys(decisions).length} audited gender decisions; ` +
  `en: ${en.entries.length} entries; course: ${usedExceptions.size} level exceptions, ` +
  `${unreferenced}/${Object.keys(topicLevel).length} grammar topics unreferenced`);
console.log(`validate_de_en_quality: ${passed} passed, 0 failed`);
