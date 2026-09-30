#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const { createWindow } = require('./dom-shim.js');
async function main() {
const raw = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(ROOT, 'vocabulary.js'), 'utf8') + ';this.words = VOCABULARY_DATA;', raw);
const before = JSON.parse(JSON.stringify(raw.words));
const w = createWindow();
w.setTimeout = w.setInterval = () => 0;
w.document.readyState = 'loading';
const c = vm.createContext(w);
const load = file => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), c, { filename: file });
for (const file of ['lib/utils.js', 'lib/word-similarity.js', 'lib/quiz-engine.js', 'lib/practice-flow.js', 'app.js', 'lib/lang-loader.js']) load(file);
const loaded = [];
w.document.head.appendChild = script => {
  assert.equal(script.async, false, 'classic data scripts must execute in loader order');
  loaded.push(script.src);
  load(script.src);
  script.onload();
  return script;
};
await w.LangLoader.ensure('italian');
assert.deepEqual(loaded, ['vocabulary.js', 'data/italian-vocabulary-corrections.js']);
const words = vm.runInContext('VOCABULARY_DATA', c);
assert.equal(w.AppState.vocabulary[0], words[0], 'application sees the corrected data objects');
const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/audits/italian-vocabulary-review.json'), 'utf8'));
assert.equal(words.length, 27117, 'precise corrections must not remove or merge headwords');
for (const reviewed of report.reviewed) {
  const matches = words.filter(w => w.italian === reviewed.italian && w.rank === reviewed.rank);
  assert.equal(matches.length, 1, 'stable headword/rank identity: ' + reviewed.italian);
  for (const [field, value] of Object.entries(reviewed.after)) assert.equal(matches[0][field], value);
  assert.ok(reviewed.source.startsWith('https://'));
}
assert.equal(report.reviewed.length, 3);
const expected = JSON.parse(JSON.stringify(before));
for (const reviewed of report.reviewed) {
  const entry = expected.find(w => w.italian === reviewed.italian && w.rank === reviewed.rank);
  for (const [field, value] of Object.entries(reviewed.before)) assert.equal(entry[field], value, 'base file remains unchanged');
  Object.assign(entry, reviewed.after);
  const imported = w.WordbookManager.parseTxtWordbook(reviewed.italian, 'italian').words[0];
  assert.equal(imported.english, entry.english);
  assert.equal(imported.chinese, entry.chinese);
  const practice = w.AppState.vocabulary.find(w => w.italian === reviewed.italian);
  assert.equal(practice.english, entry.english);
  assert.equal(practice.chinese, entry.chinese);
}
assert.deepEqual(JSON.parse(JSON.stringify(words)), expected, 'only the five reviewed fields change; upstream tags/order/IDs remain');
const registry = require('../data/italian-vocabulary-corrections.js');
registry.apply(expected);
assert.deepEqual(expected, JSON.parse(JSON.stringify(words)), 'offline consumers share idempotent corrections');
const future = [{ italian: 'nel', rank: 84, chinese: 'future reviewed translation', english: 'future gloss' }];
registry.apply(future);
assert.equal(future[0].chinese, 'future reviewed translation', 'future upstream values must not be overwritten');
assert.equal(future[0].english, 'future gloss');

const actual = Array.from(words).flatMap(word => {
  const reasons = [];
  if (/[\uE000-\uF8FF]/.test(word.chinese)) reasons.push('private_use_chinese');
  if (/\b(\w+)(?:\s+\1){3,}/i.test(word.english)) reasons.push('repeated_english_token');
  return reasons.length ? [{ italian: word.italian, rank: word.rank, status: 'pending_review', reasons,
    english: word.english, chinese: word.chinese }] : [];
});
assert.deepEqual(actual, report.pendingReview, 'pending flags must reflect active data without silently editing it');
assert.equal(report.pendingSummary.privateUseChinese, 19);
assert.equal(report.pendingSummary.repeatedEnglishToken, 0);
assert.equal(report.upstreamResolved.length, 55);
for (const item of report.upstreamResolved) {
  const word = words.find(w => w.italian === item.italian && w.rank === item.rank);
  assert.equal(word.english, item.currentEnglish);
  assert.ok(!/\b(\w+)(?:\s+\1){3,}/i.test(word.english));
  assert.equal(item.semanticReview, 'not_performed');
}
for (const [headword, pos] of [['nel', 'preposition'], ['cento', 'numeral'], ['signorina', 'noun']]) {
  const word = words.find(w => w.italian === headword);
  assert.equal(word.partOfSpeech, pos, 'retain upstream tags');
  assert.ok(word.level && word.levelSource);
}
// Parse only: this historical maintenance script rewrites/merges datasets when executed.
execFileSync(process.execPath, ['--check', path.join(ROOT, 'scripts/vocabulary_merge_corrections.js')]);
console.log('Vocabulary review OK: 3 verified corrections, 19 private-use flags; 55 upstream repetition fixes retained; maintenance script parses (not executed).');

}
main().catch(error => { console.error(error); process.exit(1); });
