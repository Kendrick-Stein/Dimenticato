#!/usr/bin/env node
'use strict';
/**
 * Validate every module data file against docs/data-schema.md, for every
 * language that lists it under files.<module> in lib/languages.js.
 *
 *   node scripts/validate_modules.js              all modules, all languages
 *   node scripts/validate_modules.js grammar      one module
 *   node scripts/validate_modules.js course de    one module, one language
 *
 * CHECKS maps a module name to fn(code, data, ctx) → list of error strings.
 * A module without an entry is only checked for the shared meta.
 * Run by `npm test` (tests/run-headless.js VALIDATORS); exit code 1 on failure.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadVocab } = require('./vocab_node');

const ROOT = path.resolve(__dirname, '..');
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

function loadLanguages() {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib/languages.js'), 'utf8'), ctx);
  return ctx.Languages;
}

const moduleCache = new Map();
/** Evaluate a language's files for one module and return DIM_DATA.<module>.<code>. */
function loadModule(profile, module) {
  const id = module + ':' + profile.code;
  if (moduleCache.has(id)) return moduleCache.get(id);
  const ctx = {};
  ctx.globalThis = ctx;
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const file of profile.files[module]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
  }
  const data = ctx.DIM_DATA && ctx.DIM_DATA[module] && ctx.DIM_DATA[module][profile.code];
  moduleCache.set(id, data || null);
  return data || null;
}

// ---------------------------------------------------------------------------
// shared meta (every module)
// ---------------------------------------------------------------------------

function validateMeta(module, code, data) {
  const errors = [];
  const meta = data && data.meta;
  if (!meta || typeof meta !== 'object') return ['meta missing'];
  if (meta.schema !== module + '/1') errors.push(`meta.schema is ${JSON.stringify(meta.schema)}, expected "${module}/1"`);
  if (meta.lang !== code) errors.push(`meta.lang is ${JSON.stringify(meta.lang)}, expected "${code}"`);
  for (const key of ['name', 'builder']) {
    if (typeof meta[key] !== 'string' || !meta[key]) errors.push(`meta.${key} missing`);
  }
  for (const key of ['sources', 'licences']) {
    if (!Array.isArray(meta[key]) || !meta[key].length) errors.push(`meta.${key} must be a non-empty array`);
  }
  if (!Number.isInteger(meta.count) || meta.count < 0) errors.push('meta.count must be a non-negative integer');
  return errors;
}

// ---------------------------------------------------------------------------
// grammar/1
// ---------------------------------------------------------------------------

const PART_RE = /^p\d+$/;
const CHAPTER_RE = /^p\d+\/ch\d{2}$/;
const TOPIC_RE = /^p\d+\/ch\d{2}\/t\d{2}$/;

function validateGrammar(code, data) {
  const errors = [];
  const meta = data.meta || {};
  const content = data.content || {};
  const parts = data.tree && Array.isArray(data.tree.parts) ? data.tree.parts : null;
  if (!parts || !parts.length) return ['tree.parts missing or empty'];

  const topics = new Set();
  const used = new Set();
  parts.forEach((part, pi) => {
    if (!PART_RE.test(part.slug || '')) errors.push(`part slug ${JSON.stringify(part.slug)} is not p<N>`);
    if (part.slug !== 'p' + (pi + 1)) errors.push(`part ${part.slug} is out of positional order`);
    if (!part.title) errors.push(`part ${part.slug} has no title`);
    (part.chapters || []).forEach((chapter) => {
      if (!CHAPTER_RE.test(chapter.slug || '') || chapter.slug.indexOf(part.slug + '/') !== 0) {
        errors.push(`chapter slug ${JSON.stringify(chapter.slug)} is not ${part.slug}/ch<NN>`);
      }
      if (!chapter.title) errors.push(`chapter ${chapter.slug} has no title`);
      (chapter.topics || []).forEach((topic) => {
        const slug = topic.slug || '';
        if (!TOPIC_RE.test(slug) || slug.indexOf(chapter.slug + '/') !== 0) {
          errors.push(`topic slug ${JSON.stringify(slug)} is not ${chapter.slug}/t<NN>`);
        }
        if (topics.has(slug)) errors.push(`duplicate topic slug ${slug}`);
        topics.add(slug);
        if (!topic.title) errors.push(`topic ${slug} has no title`);
        if (LEVELS.indexOf(topic.level) === -1) errors.push(`topic ${slug} has level ${JSON.stringify(topic.level)}`);
        else used.add(topic.level);
        if (typeof content[slug] !== 'string' || !content[slug].trim()) errors.push(`topic ${slug} has no content`);
      });
    });
  });

  Object.keys(content).forEach((slug) => {
    if (!topics.has(slug)) errors.push(`content.${slug} is not in the tree`);
  });
  if (meta.topicCount !== topics.size) errors.push(`meta.topicCount ${meta.topicCount} != ${topics.size} topics`);
  if (meta.count !== topics.size) errors.push(`meta.count ${meta.count} != ${topics.size} topics`);
  const levels = Array.isArray(meta.levels) ? meta.levels : [];
  const expected = LEVELS.filter((l) => used.has(l));
  if (levels.join() !== expected.join()) errors.push(`meta.levels ${JSON.stringify(levels)} != levels used ${JSON.stringify(expected)}`);

  const aliases = meta.aliases || {};
  if (typeof aliases !== 'object' || Array.isArray(aliases)) errors.push('meta.aliases must be an object');
  Object.keys(aliases).forEach((old) => {
    if (topics.has(old)) errors.push(`alias ${old} shadows a live topic slug`);
    if (!topics.has(aliases[old])) errors.push(`alias ${old} -> ${aliases[old]} does not resolve`);
  });
  return errors;
}

// ---------------------------------------------------------------------------
// course/1
// ---------------------------------------------------------------------------

function validateCourse(code, data, ctx) {
  const errors = [];
  const meta = data.meta || {};
  for (const key of ['title', 'zh']) {
    if (typeof meta[key] !== 'string' || !meta[key]) errors.push(`meta.${key} missing`);
  }
  if (!Array.isArray(data.levels) || !data.levels.length) return errors.concat('levels missing or empty');

  const vocab = new Set(loadVocab(code).entries.map((e) => e.word));
  let grammar = null;
  if (ctx.profile.files.grammar) grammar = loadModule(ctx.profile, 'grammar');
  const topics = new Set(grammar ? Object.keys(grammar.content || {}) : []);

  const unitIds = new Set();
  const levelIds = new Set();
  let units = 0;
  data.levels.forEach((level) => {
    if (!level.id || levelIds.has(level.id)) errors.push(`level id ${JSON.stringify(level.id)} missing or duplicated`);
    levelIds.add(level.id);
    if (!level.title) errors.push(`level ${level.id} has no title`);
    if (!Array.isArray(level.units) || !level.units.length) {
      errors.push(`level ${level.id} has no units`);
      return;
    }
    level.units.forEach((unit) => {
      units += 1;
      const where = `unit ${unit.id}`;
      if (!unit.id || unitIds.has(unit.id)) errors.push(`unit id ${JSON.stringify(unit.id)} missing or duplicated`);
      unitIds.add(unit.id);
      if (!Number.isInteger(unit.number)) errors.push(`${where}: number must be an integer`);
      if (!unit.title) errors.push(`${where}: no title`);
      if (!Array.isArray(unit.words) || !unit.words.length) errors.push(`${where}: no words`);
      const missing = (unit.words || []).filter((w) => !vocab.has(w));
      if (missing.length) errors.push(`${where}: ${missing.length} words not in data/vocab/${code}.js: ${missing.slice(0, 5).join(', ')}`);
      if (new Set(unit.words || []).size !== (unit.words || []).length) errors.push(`${where}: duplicate words`);
      if (!Array.isArray(unit.grammar)) errors.push(`${where}: grammar must be an array`);
      (unit.grammar || []).forEach((item) => {
        if (!item || !item.label) errors.push(`${where}: grammar item without a label`);
        if (!item || !item.slug) return;
        if (!grammar) errors.push(`${where}: grammar slug ${item.slug} but the language has no grammar module`);
        else if (!topics.has(item.slug)) errors.push(`${where}: grammar slug ${item.slug} is not in the grammar tree`);
      });
    });
  });
  if (meta.count !== units) errors.push(`meta.count ${meta.count} != ${units} units`);
  return errors;
}

const CHECKS = {
  grammar: validateGrammar,
  course: validateCourse,
};

// ---------------------------------------------------------------------------

function main() {
  const [onlyModule, onlyCode] = process.argv.slice(2);
  const Languages = loadLanguages();
  let passed = 0;
  let failed = 0;
  for (const profile of Languages.list) {
    if (onlyCode && profile.code !== onlyCode) continue;
    for (const module of Object.keys(profile.files || {})) {
      if (module === 'vocab' || !CHECKS[module]) continue;
      if (onlyModule && module !== onlyModule) continue;
      const label = `${module}/${profile.code}`;
      let errors;
      try {
        const data = loadModule(profile, module);
        errors = data
          ? validateMeta(module, profile.code, data).concat(CHECKS[module](profile.code, data, { profile, Languages }))
          : [`DIM_DATA.${module}.${profile.code} not registered by ${profile.files[module].join(', ')}`];
      } catch (err) {
        errors = ['threw: ' + (err && err.stack || err)];
      }
      if (errors.length) {
        failed += 1;
        console.error(`FAIL ${label} (${errors.length})`);
        errors.slice(0, 20).forEach((e) => console.error('  - ' + e));
        if (errors.length > 20) console.error(`  ... ${errors.length - 20} more`);
      } else {
        passed += 1;
        console.log(`ok   ${label}`);
      }
    }
  }
  console.log(`validate_modules: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

if (require.main === module) main();

module.exports = { CHECKS, validateMeta, loadModule, loadLanguages };
