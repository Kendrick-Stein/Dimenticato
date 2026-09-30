#!/usr/bin/env node
/**
 * Validates every data/vocab/<lang>.js against schema v1 (docs/vocab-schema.md).
 * One validator for all languages: a new language only needs a GOLD row.
 *
 *   node scripts/validate_vocab.js          # all languages
 *   node scripts/validate_vocab.js fr de    # a subset
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const VOCAB_DIR = path.join(ROOT, 'data', 'vocab');

const FIELDS = ['word', 'display', 'pos', 'posAll', 'gender', 'level', 'levelSource',
  'rank', 'freq', 'zh', 'zhAlt', 'en', 'forms', 'tags', 'src', 'legacyId'];
const POS = new Set(['noun', 'properNoun', 'verb', 'adjective', 'adverb', 'pronoun',
  'determiner', 'article', 'preposition', 'conjunction', 'numeral', 'interjection',
  'particle', 'prefix', 'suffix', 'phrase', 'abbreviation']);
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_SOURCES = new Set(['official', 'textbook', 'course', 'freq-band']);
const FORM_KEYS = new Set(['plural', 'feminine', 'principalParts', 'construction',
  'government', 'pluraleTantum', 'pronominal', 'variants']);
const GENDER_RE = /^[mfn](\/[mfn]){0,2}$/;
const BANDS = [[600, 'A1'], [1500, 'A2'], [3000, 'B1'], [6000, 'B2'], [12000, 'C1']];

// Per-language floor on POS coverage and a few hand-checked entries.
const LANGS = {
  it: { minPos: 0.995, gold: [['casa', 'noun', 'f'], ['essere', 'verb'], ['bello', 'adjective']] },
  de: { minPos: 0.999, gold: [['Haus', 'noun', 'n'], ['gehen', 'verb'], ['schön', 'adjective']] },
  en: { minPos: 0.95, gold: [['house', 'noun'], ['go', 'verb'], ['beautiful', 'adjective']] },
  fr: { minPos: 0.99, gold: [['maison', 'noun', 'f'], ['aller', 'verb'], ['beau', 'adjective']] }
};

function load(lang) {
  const file = path.join(VOCAB_DIR, `${lang}.js`);
  const ctx = {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  return ctx.DIM_VOCAB && ctx.DIM_VOCAB[lang];
}

function bandFor(position) {
  for (const [limit, level] of BANDS) if (position <= limit) return level;
  return 'C2';
}

function validate(lang) {
  const errors = [];
  const err = (msg) => { if (errors.length < 40) errors.push(msg); };
  const data = load(lang);
  if (!data || !data.meta || !Array.isArray(data.entries)) {
    return { errors: [`${lang}: DIM_VOCAB.${lang} missing or malformed`], stats: {} };
  }
  const { meta, entries } = data;
  if (meta.schema !== 1) err(`meta.schema ${meta.schema} !== 1`);
  if (meta.lang !== lang) err(`meta.lang ${meta.lang} !== ${lang}`);
  if (meta.count !== entries.length) err(`meta.count ${meta.count} !== ${entries.length}`);
  if (!Array.isArray(meta.sources)) err('meta.sources must be an array');
  if (!Array.isArray(meta.licences) || !meta.licences.length) err('meta.licences missing');

  const seen = new Set();
  const stats = { entries: entries.length, pos: 0, gender: 0, nouns: 0, en: 0, freq: 0, levels: {} };
  let lastBandIdx = 0;
  entries.forEach((e, i) => {
    const where = `${lang}[${i}] ${JSON.stringify(e.word)}`;
    Object.keys(e).forEach((k) => { if (!FIELDS.includes(k)) err(`${where}: unknown field ${k}`); });
    if (typeof e.word !== 'string' || !e.word.trim() || e.word !== e.word.trim()) err(`${where}: bad word`);
    if (seen.has(e.word)) err(`${where}: duplicate word`);
    seen.add(e.word);
    if ('display' in e && (typeof e.display !== 'string' || !e.display || e.display === e.word)) err(`${where}: bad display`);
    if (typeof e.zh !== 'string' || !e.zh.trim()) err(`${where}: missing zh`);
    if ('zhAlt' in e && !(Array.isArray(e.zhAlt) && e.zhAlt.every((s) => typeof s === 'string' && s && s !== e.zh))) err(`${where}: bad zhAlt`);
    if ('en' in e && (typeof e.en !== 'string' || !e.en)) err(`${where}: bad en`);
    if ('pos' in e) {
      if (!POS.has(e.pos)) err(`${where}: bad pos ${e.pos}`);
      stats.pos += 1;
    }
    if ('posAll' in e) {
      if (!Array.isArray(e.posAll) || e.posAll.length < 2 || e.posAll[0] !== e.pos
        || !e.posAll.every((p) => POS.has(p)) || new Set(e.posAll).size !== e.posAll.length) err(`${where}: bad posAll`);
    }
    if (e.pos === 'noun') stats.nouns += 1;
    if ('gender' in e) {
      if (!GENDER_RE.test(e.gender)) err(`${where}: bad gender ${e.gender}`);
      if (e.pos !== 'noun' && e.pos !== 'properNoun') err(`${where}: gender on ${e.pos}`);
      if (e.pos === 'noun') stats.gender += 1;
    }
    if (!LEVELS.includes(e.level)) err(`${where}: bad level ${e.level}`);
    if (!LEVEL_SOURCES.has(e.levelSource)) err(`${where}: bad levelSource ${e.levelSource}`);
    stats.levels[e.level] = (stats.levels[e.level] || 0) + 1;
    if (e.rank !== i + 1) err(`${where}: rank ${e.rank} !== ${i + 1}`);
    if (e.freq !== null && !(typeof e.freq === 'number' && e.freq > 0)) err(`${where}: bad freq`);
    if (e.freq) stats.freq += 1;
    if (e.en) stats.en += 1;
    if (e.levelSource === 'freq-band') {
      const idx = LEVELS.indexOf(e.level);
      if (idx < lastBandIdx) err(`${where}: freq-band level ${e.level} after ${LEVELS[lastBandIdx]}`);
      lastBandIdx = Math.max(lastBandIdx, idx);
      if (e.freq && e.level !== bandFor(e.rank)) err(`${where}: level ${e.level} !== band ${bandFor(e.rank)}`);
    } else if (LEVELS.indexOf(e.level) > LEVELS.indexOf(e.freq ? bandFor(e.rank) : 'C2')) {
      err(`${where}: ${e.levelSource} level ${e.level} is harder than its frequency band`);
    }
    if ('forms' in e) {
      if (!e.forms || typeof e.forms !== 'object' || !Object.keys(e.forms).length) err(`${where}: empty forms`);
      else Object.entries(e.forms).forEach(([k, v]) => {
        if (!FORM_KEYS.has(k)) err(`${where}: unknown form ${k}`);
        else if (k === 'variants' ? !(Array.isArray(v) && v.length && v.every((s) => typeof s === 'string' && s))
          : (k === 'pluraleTantum' || k === 'pronominal') ? v !== true : !(typeof v === 'string' && v)) err(`${where}: bad forms.${k}`);
      });
    }
    if ('tags' in e && !(Array.isArray(e.tags) && e.tags.length && e.tags.every((t) => typeof t === 'string' && t))) err(`${where}: bad tags`);
    if ('src' in e && !(Number.isInteger(e.src) && e.src >= 0 && e.src < meta.sources.length)) err(`${where}: bad src`);
    if ('legacyId' in e && !(typeof e.legacyId === 'string' && e.legacyId)) err(`${where}: bad legacyId`);
  });

  const cfg = LANGS[lang] || { minPos: 0.95, gold: [] };
  const posRate = stats.pos / entries.length;
  if (posRate < cfg.minPos) err(`POS coverage ${(posRate * 100).toFixed(2)}% < ${cfg.minPos * 100}%`);
  const byWord = new Map(entries.map((e) => [e.word, e]));
  cfg.gold.forEach(([word, pos, gender]) => {
    const e = byWord.get(word);
    if (!e) return err(`gold: ${word} missing`);
    if (e.pos !== pos) err(`gold: ${word} pos ${e.pos} !== ${pos}`);
    if (gender && e.gender !== gender) err(`gold: ${word} gender ${e.gender} !== ${gender}`);
  });
  return { errors, stats };
}

function main() {
  const wanted = process.argv.slice(2);
  const langs = wanted.length ? wanted
    : fs.readdirSync(VOCAB_DIR).filter((f) => /^[a-z]{2}\.js$/.test(f)).map((f) => f.slice(0, 2)).sort();
  let failed = 0;
  langs.forEach((lang) => {
    const { errors, stats } = validate(lang);
    const pct = (n) => `${((n / stats.entries) * 100).toFixed(1)}%`;
    console.log(`${lang}: ${stats.entries} entries · pos ${pct(stats.pos)} · en ${pct(stats.en)} · freq ${pct(stats.freq)}`
      + ` · noun gender ${stats.nouns ? ((stats.gender / stats.nouns) * 100).toFixed(1) : '-'}%`
      + ` · levels ${LEVELS.map((l) => `${l}:${stats.levels[l] || 0}`).join(' ')}`);
    if (errors.length) {
      failed += 1;
      errors.forEach((e) => console.log(`  ✗ ${e}`));
    }
  });
  if (failed) {
    console.log(`validate_vocab: ${failed} language(s) failed`);
    process.exit(1);
  }
  console.log('validate_vocab: ok');
}

main();
