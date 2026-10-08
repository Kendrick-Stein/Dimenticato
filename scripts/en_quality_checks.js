#!/usr/bin/env node
/**
 * English vocab quality rules (data/vocab/en.js), kept in step with the
 * audited post-pass scripts/en_vocab_fixes.py and its decision lists in
 * scripts/en_vocab_fixes/.
 *
 *   checkEnglish(entries) -> { errors: [string], stats: {...} }
 *
 *   - no headword is an inflected form the fix lists merge away
 *     (merged-forms.json "merge" / "rename" keys: "was", "children", "taken")
 *   - zh glosses stay within ZH_MAX characters (small budget for exceptions)
 *   - no "??" garbage in zh
 *   - zh is not an inflection note pointing at another headword
 *     ("stick的过去式和过去分词"): such a form should merge or get a real gloss
 *   - properNoun / abbreviation only for the allowlist (proper-nouns.json "keep")
 *
 * Run alone: node scripts/en_quality_checks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const FIX_DIR = path.join(__dirname, 'en_vocab_fixes');
const ZH_MAX = 40;
const LONG_ZH_BUDGET = 5;
const INFL_NOTE = /([A-Za-z]+)\s*的\s*(?:名词|动词)?\s*(?:复数|过去|现在分词|第三人称|三单|单三|比较级|最高级)/;

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(FIX_DIR, name), 'utf8'));
}

function checkEnglish(entries) {
  const merged = readJson('merged-forms.json');
  const proper = readJson('proper-nouns.json');
  const inflected = new Set([...Object.keys(merged.merge || {}), ...Object.keys(merged.rename || {})]);
  const allow = new Set(Object.keys(proper.keep || {}));
  const words = new Set(entries.map(e => e.word));
  const errors = [];
  const bad = { inflected: [], longZh: [], garbage: [], inflNote: [], proper: [] };

  for (const e of entries) {
    const zh = String(e.zh || '');
    if (inflected.has(e.word)) bad.inflected.push(e.word);
    if (zh.length > ZH_MAX) bad.longZh.push(e.word);
    if (zh.includes('??')) bad.garbage.push(e.word);
    const m = zh.match(INFL_NOTE);
    if (m && m[1] !== e.word && words.has(m[1])) bad.inflNote.push(`${e.word} (${zh})`);
    if ((e.pos === 'properNoun' || e.pos === 'abbreviation') && !allow.has(e.word)) bad.proper.push(e.word);
  }

  const sample = a => a.slice(0, 8).join(', ');
  if (bad.inflected.length) errors.push(`${bad.inflected.length} inflected-form headwords (e.g. ${sample(bad.inflected)})`);
  if (bad.longZh.length > LONG_ZH_BUDGET) {
    errors.push(`${bad.longZh.length} zh glosses over ${ZH_MAX} chars > budget ${LONG_ZH_BUDGET} (e.g. ${sample(bad.longZh)})`);
  }
  if (bad.garbage.length) errors.push(`${bad.garbage.length} zh with "??" (e.g. ${sample(bad.garbage)})`);
  if (bad.inflNote.length) errors.push(`${bad.inflNote.length} zh that only point at another headword (e.g. ${sample(bad.inflNote)})`);
  if (bad.proper.length) errors.push(`${bad.proper.length} properNoun/abbreviation outside the allowlist (e.g. ${sample(bad.proper)})`);

  const stats = {
    entries: entries.length,
    inflectedListed: inflected.size,
    properAllowlist: allow.size,
    longZh: bad.longZh.length,
    maxZh: entries.reduce((n, e) => Math.max(n, String(e.zh || '').length), 0),
  };
  return { errors, stats };
}

module.exports = { checkEnglish, ZH_MAX };

if (require.main === module) {
  const vm = require('vm');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'vocab', 'en.js'), 'utf8'), ctx);
  const { errors, stats } = checkEnglish(ctx.DIM_VOCAB.en.entries);
  console.log('en quality:', JSON.stringify(stats));
  errors.forEach(e => console.log('  ✗ ' + e));
  console.log(errors.length ? `en_quality_checks: ${errors.length} failed` : 'en_quality_checks: ok');
  process.exitCode = errors.length ? 1 : 0;
}
