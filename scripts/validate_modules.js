#!/usr/bin/env node
/*
 * Module data validator: checks every module file against docs/data-schema.md.
 *
 *   node scripts/validate_modules.js            all modules, all languages
 *   node scripts/validate_modules.js conjugations
 *
 * Each check is `check(lang, data) -> {assertions, errors[]}` and is registered
 * in CHECKS under its module name, so other module validators can be added
 * alongside (cognates, collocations, grammar, course).  The per-language
 * linguistic validators (validate_<lang>_conjugations.js) stay separate; this
 * file only enforces the shared shape.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const PERSON_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const TIMES = new Set(['present', 'past', 'future']);
const CJK = /[㐀-鿿]/;

function makeReport() {
  const report = { assertions: 0, errors: [] };
  report.check = (cond, msg) => {
    report.assertions++;
    if (!cond) report.errors.push(msg);
    return !!cond;
  };
  return report;
}

const isText = (v) => typeof v === 'string' && v.trim().length > 0 && v === v.trim();

// ------------------------------------------------------------ conjugations/1

function validateConjugations(lang, data) {
  const r = makeReport();
  const { check } = r;
  if (!check(data && typeof data === 'object' && !Array.isArray(data), `${lang}: conjugations is not an object`)) return r;

  const meta = data.meta || {};
  check(meta.schema === 'conjugations/1', `${lang}: meta.schema = ${JSON.stringify(meta.schema)}`);
  check(meta.lang === lang, `${lang}: meta.lang = ${JSON.stringify(meta.lang)}`);
  check(isText(meta.name), `${lang}: meta.name missing`);
  check(isText(meta.builder), `${lang}: meta.builder missing`);
  check(Array.isArray(meta.sources) && meta.sources.length > 0 && meta.sources.every(isText), `${lang}: meta.sources`);
  check(Array.isArray(meta.licences) && meta.licences.length > 0 && meta.licences.every(isText), `${lang}: meta.licences`);

  // persons
  const persons = data.persons;
  if (check(Array.isArray(persons) && persons.length === 6, `${lang}: persons must have 6 items`)) {
    persons.forEach((p, i) => {
      check(p.key === PERSON_KEYS[i], `${lang}: persons[${i}].key = ${JSON.stringify(p.key)}`);
      check(isText(p.label), `${lang}: persons[${i}].label`);
      check(isText(p.zh), `${lang}: persons[${i}].zh`);
      if (p.pronouns !== undefined) {
        check(Array.isArray(p.pronouns) && p.pronouns.length > 0 && p.pronouns.every(isText), `${lang}: persons[${i}].pronouns`);
      }
    });
  }

  // groups (optional matrix rows)
  const groupKeys = new Set();
  if (meta.groups !== undefined) {
    check(Array.isArray(meta.groups) && meta.groups.length > 0, `${lang}: meta.groups must be a non-empty array`);
    (meta.groups || []).forEach((g, i) => {
      check(isText(g.key) && !groupKeys.has(g.key), `${lang}: meta.groups[${i}].key`);
      check(isText(g.label) && isText(g.zh), `${lang}: meta.groups[${i}] label/zh`);
      groupKeys.add(g.key);
    });
  }
  if (meta.placeholders !== undefined) {
    check(meta.placeholders && Object.values(meta.placeholders).every(isText), `${lang}: meta.placeholders`);
  }
  if (meta.elision !== undefined) {
    const e = meta.elision || {};
    check(e.contract && Object.keys(e.contract).every((k) => PERSON_KEYS.includes(k) && isText(e.contract[k])),
      `${lang}: meta.elision.contract keys must be person keys`);
    let ok = true;
    try { new RegExp(e.vowel); } catch (err) { ok = false; }
    check(ok && isText(e.vowel), `${lang}: meta.elision.vowel is not a regex`);
    check(Array.isArray(e.aspirate || []) && Array.isArray(e.aspirateVerbs || []), `${lang}: meta.elision lists`);
  }

  // tenses
  const tenses = Array.isArray(data.tenses) ? data.tenses : [];
  check(tenses.length > 0, `${lang}: tenses empty`);
  const tenseByKey = new Map();
  tenses.forEach((t, i) => {
    const where = `${lang}: tenses[${i}] ${t && t.key}`;
    check(isText(t.key) && !tenseByKey.has(t.key), `${where}: key missing or duplicate`);
    tenseByKey.set(t.key, t);
    ['group', 'groupLabel', 'label', 'zh'].forEach((f) => check(isText(t[f]), `${where}: ${f}`));
    check(t.type === 'person' || t.type === 'single', `${where}: type ${JSON.stringify(t.type)}`);
    if (groupKeys.size) check(groupKeys.has(t.group), `${where}: group ${t.group} not in meta.groups`);
    if (t.level !== undefined) check(LEVELS.has(t.level), `${where}: level ${t.level}`);
    if (t.time !== undefined) check(TIMES.has(t.time), `${where}: time ${t.time}`);
    if (t.omit !== undefined) {
      check(t.type === 'person' && Array.isArray(t.omit) && t.omit.length > 0 && t.omit.length < 6
        && t.omit.every((k) => PERSON_KEYS.includes(k)), `${where}: omit`);
    }
    if (t.labels !== undefined) {
      check(t.type === 'person' && Object.keys(t.labels).every((k) => PERSON_KEYS.includes(k) && isText(t.labels[k])),
        `${where}: labels`);
    }
    if (t.subject !== undefined) check(t.subject === true && t.type === 'person', `${where}: subject`);
  });

  // verbs
  const verbs = Array.isArray(data.verbs) ? data.verbs : [];
  check(verbs.length > 0, `${lang}: verbs empty`);
  check(meta.count === verbs.length, `${lang}: meta.count ${meta.count} != ${verbs.length}`);
  const seen = new Set();
  verbs.forEach((v, i) => {
    const where = `${lang}: ${v && v.word ? v.word : '#' + i}`;
    check(isText(v.word), `${where}: word`);
    check(!seen.has(v.word), `${where}: duplicate word`);
    seen.add(v.word);
    check(v.rank === i + 1, `${where}: rank ${v.rank} at index ${i}`);
    check(v.freq === null || (typeof v.freq === 'number' && v.freq > 0), `${where}: freq ${v.freq}`);
    check(isText(v.zh) && CJK.test(v.zh), `${where}: zh ${JSON.stringify(v.zh)}`);
    if (v.en !== undefined) check(isText(v.en), `${where}: en`);
    if (v.x !== undefined) check(v.x && typeof v.x === 'object' && !Array.isArray(v.x) && Object.keys(v.x).length > 0, `${where}: x`);
    check('infinitive' in v === false && 'chinese' in v === false, `${where}: legacy field`);
    const vt = v.tenses || {};
    check(Object.keys(vt).length > 0, `${where}: no tenses`);
    for (const [key, value] of Object.entries(vt)) {
      const t = tenseByKey.get(key);
      if (!check(t, `${where}: unknown tense ${key}`)) continue;
      if (t.type === 'single') {
        check(isText(value), `${where}.${key}: single form must be a non-empty string`);
        continue;
      }
      if (!check(Array.isArray(value) && value.length === 6, `${where}.${key}: person form must be a 6-array`)) continue;
      const omit = new Set(t.omit || []);
      let filled = 0;
      value.forEach((form, pi) => {
        if (form === null) return;
        filled++;
        check(isText(form), `${where}.${key}[${pi}]: ${JSON.stringify(form)}`);
        check(!omit.has(PERSON_KEYS[pi]), `${where}.${key}: omitted person ${PERSON_KEYS[pi]} has a form`);
      });
      check(filled > 0, `${where}.${key}: every person is null`);
    }
  });
  return r;
}

const CHECKS = {
  conjugations: validateConjugations,
};

// ------------------------------------------------------------------- loading

function loadLanguages() {
  const ctx = { console };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib', 'languages.js'), 'utf8'), ctx);
  return ctx.Languages;
}

function loadModule(module, code, file) {
  const ctx = { console };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
  return ctx.DIM_DATA && ctx.DIM_DATA[module] ? ctx.DIM_DATA[module][code] : undefined;
}

function main(argv) {
  const only = argv.length ? new Set(argv) : null;
  const Languages = loadLanguages();
  let passed = 0;
  let failed = 0;
  for (const [module, check] of Object.entries(CHECKS)) {
    if (only && !only.has(module)) continue;
    for (const profile of Languages.list) {
      const files = [].concat((profile.files || {})[module] || []);
      if (!files.length) continue;
      const data = loadModule(module, profile.code, files[files.length - 1]);
      const r = check(profile.code, data);
      passed += r.assertions - r.errors.length;
      failed += r.errors.length;
      const status = r.errors.length ? 'FAIL' : 'ok';
      console.log(`${status} ${module}/${profile.code}: ${r.assertions} assertions, ${r.errors.length} errors`);
      r.errors.slice(0, 20).forEach((e) => console.error('  - ' + e));
      if (r.errors.length > 20) console.error(`  ... and ${r.errors.length - 20} more`);
    }
  }
  console.log(`Modules: ${passed} passed, ${failed} failed`);
  return failed ? 1 : 0;
}

module.exports = { CHECKS, validateConjugations };

if (require.main === module) process.exit(main(process.argv.slice(2)));
