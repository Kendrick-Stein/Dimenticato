#!/usr/bin/env node
/**
 * Module data validator (docs/data-schema.md).
 *
 *   node scripts/validate_modules.js              every module, every language
 *   node scripts/validate_modules.js collocations only that module
 *
 * For every language profile in lib/languages.js and every optional module it
 * lists under `files`, the files are loaded into a bare vm and the registered
 * DIM_DATA.<module>.<code> payload is handed to CHECKS[module](lang, data).
 * Each check returns a list of problems (strings).  Language-specific content
 * rules stay in the per-language validators; this file checks only the shared
 * contract every language must meet.
 *
 * The last stdout line is "N passed, M failed" (tests/run-headless.js parses it).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const CJK = /[㐀-鿿]/;
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

/** Shared meta contract: schema, lang, name, count, builder, sources, licences. */
function checkMeta(module, lang, meta, problems) {
  if (!isObj(meta)) { problems.push('meta missing'); return false; }
  if (meta.schema !== module + '/1') problems.push(`meta.schema ${JSON.stringify(meta.schema)} !== "${module}/1"`);
  if (meta.lang !== lang) problems.push(`meta.lang ${JSON.stringify(meta.lang)} !== "${lang}"`);
  if (!isStr(meta.name)) problems.push('meta.name missing');
  if (!Number.isInteger(meta.count)) problems.push('meta.count must be an integer');
  if (!isStr(meta.builder)) problems.push('meta.builder missing');
  else if (!fs.existsSync(path.join(ROOT, meta.builder))) problems.push(`meta.builder ${meta.builder} does not exist`);
  if (!Array.isArray(meta.sources) || !meta.sources.length || !meta.sources.every(isStr)) {
    problems.push('meta.sources must be a non-empty list of strings');
  }
  if (!Array.isArray(meta.licences) || !meta.licences.length || !meta.licences.every(isStr)) {
    problems.push('meta.licences must be a non-empty list of strings');
  }
  return true;
}

// ---------------------------------------------------------------------------
// collocations/1
// ---------------------------------------------------------------------------

const KEY_KINDS = new Set(['preposition', 'particle', 'case', 'object']);

/**
 * The verbs/keys/index body of a collocations/1 block.  Also used for nested
 * blocks with the same shape (German x.nounVerb), which inherit meta.sources.
 */
function checkCollocationBody(label, data, sourceCount, problems, needCase) {
  const p = (msg) => problems.push(label + msg);
  if (!Array.isArray(data.keys) || !data.keys.length) { p('keys[] must be a non-empty array'); return; }
  if (!isObj(data.verbs)) { p('verbs must be an object'); return; }
  if (!isObj(data.index)) { p('index must be an object'); return; }

  const keyRec = new Map();
  data.keys.forEach((rec, i) => {
    if (!isObj(rec) || !isStr(rec.key)) { p(`keys[${i}] has no key`); return; }
    if (keyRec.has(rec.key)) p(`keys[${i}] duplicate key "${rec.key}"`);
    keyRec.set(rec.key, rec);
    if (!isStr(rec.label)) p(`key "${rec.key}" has no label`);
    if (!KEY_KINDS.has(rec.kind)) p(`key "${rec.key}" kind ${JSON.stringify(rec.kind)} not in ${[...KEY_KINDS].join('|')}`);
    if (rec.zh !== undefined && !CJK.test(rec.zh)) p(`key "${rec.key}" zh has no Chinese`);
    if (needCase && !isStr(rec.case)) p(`key "${rec.key}" has no case`);
  });

  const used = new Map();     // key -> [word …] in verb order
  let examples = 0;
  for (const [word, verb] of Object.entries(data.verbs)) {
    const w = `verb "${word}"`;
    if (!isObj(verb)) { p(`${w} is not an object`); continue; }
    if (verb.word !== word) p(`${w}: word ${JSON.stringify(verb.word)} !== headword`);
    if (verb.level !== undefined && !LEVELS.has(verb.level)) p(`${w}: bad level ${JSON.stringify(verb.level)}`);
    if (verb.x !== undefined && !isObj(verb.x)) p(`${w}: x must be an object`);
    const order = verb.order;
    const keys = verb.keys;
    if (!Array.isArray(order) || !order.length) { p(`${w}: order must be a non-empty array`); continue; }
    if (!isObj(keys)) { p(`${w}: keys must be an object`); continue; }
    if (new Set(order).size !== order.length) p(`${w}: order has duplicates`);
    if (JSON.stringify([...order].sort()) !== JSON.stringify(Object.keys(keys).sort())) {
      p(`${w}: order ${JSON.stringify(order)} !== keys of "keys"`);
    }
    for (const key of order) {
      if (!keyRec.has(key)) p(`${w}: key "${key}" missing from keys[]`);
      const list = keys[key];
      if (!Array.isArray(list) || !list.length) { p(`${w}: keys["${key}"] must be a non-empty array`); continue; }
      (used.get(key) || used.set(key, []).get(key)).push(word);
      list.forEach((ex, i) => {
        examples += 1;
        const e = `${w} [${key}]#${i}`;
        if (!isObj(ex)) { p(`${e}: example must be {text, zh}`); return; }
        if (!isStr(ex.text)) p(`${e}: empty text`);
        else if (CJK.test(ex.text)) p(`${e}: text contains Chinese ${JSON.stringify(ex.text)}`);
        if (!isStr(ex.zh) || !CJK.test(ex.zh)) p(`${e}: zh has no Chinese ${JSON.stringify(ex.zh)}`);
        if (ex.src !== undefined && !(Number.isInteger(ex.src) && ex.src >= 0 && ex.src < sourceCount)) {
          p(`${e}: src ${JSON.stringify(ex.src)} does not index meta.sources`);
        }
        const extra = Object.keys(ex).filter((k) => !['text', 'zh', 'src'].includes(k));
        if (extra.length) p(`${e}: unexpected fields ${extra.join(', ')} (put them under x)`);
      });
    }
  }

  // index is exactly the inverse of verbs[].order, in verb order
  for (const [key, words] of used) {
    if (JSON.stringify(data.index[key]) !== JSON.stringify(words)) p(`index["${key}"] is not the inverse of verbs`);
  }
  for (const key of Object.keys(data.index)) if (!used.has(key)) p(`index["${key}"] names a key no verb uses`);
  for (const key of keyRec.keys()) if (!used.has(key)) p(`key "${key}" in keys[] is used by no verb`);

  const count = Object.keys(data.verbs).length;
  if (data.meta && data.meta.count !== count) p(`meta.count ${data.meta.count} !== ${count} verbs`);
  if (data.meta && data.meta.examples !== undefined && data.meta.examples !== examples) {
    p(`meta.examples ${data.meta.examples} !== ${examples}`);
  }
  return { count, examples };
}

function validateCollocations(lang, data) {
  const problems = [];
  if (!isObj(data)) return ['payload is not an object'];
  checkMeta('collocations', lang, data.meta, problems);
  const extra = Object.keys(data).filter((k) => !['meta', 'keys', 'verbs', 'index', 'x'].includes(k));
  if (extra.length) problems.push(`unexpected top-level fields ${extra.join(', ')} (put them under x)`);
  const sourceCount = Array.isArray(data.meta && data.meta.sources) ? data.meta.sources.length : 0;
  // a key-level case field is how German marks Rektion; once one key has it, all must
  const needCase = Array.isArray(data.keys) && data.keys.some((k) => k && k.case !== undefined);
  checkCollocationBody('', data, sourceCount, problems, needCase);
  // nested blocks of the same shape (e.g. German Funktionsverbgefüge)
  if (isObj(data.x)) {
    for (const [name, block] of Object.entries(data.x)) {
      if (isObj(block) && block.verbs && block.keys) {
        checkCollocationBody(`x.${name}: `, block, sourceCount, problems, false);
      }
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------

const CHECKS = {
  collocations: validateCollocations,
};

function loadLanguages() {
  const ctx = vm.createContext({ console });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib/languages.js'), 'utf8'), ctx);
  return ctx.Languages;
}

function loadModule(files, module, code) {
  const ctx = vm.createContext({ console });
  ctx.window = ctx;
  for (const f of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  return ctx.DIM_DATA && ctx.DIM_DATA[module] && ctx.DIM_DATA[module][code];
}

function main() {
  const only = process.argv[2];
  const Languages = loadLanguages();
  let passed = 0;
  let failed = 0;
  for (const profile of Languages.list) {
    for (const [module, files] of Object.entries(profile.files || {})) {
      const check = CHECKS[module];
      if (!check || (only && module !== only)) continue;
      let problems;
      try {
        problems = check(profile.code, loadModule(files, module, profile.code));
      } catch (e) {
        problems = ['threw: ' + (e && e.stack || e)];
      }
      if (problems.length) {
        failed += 1;
        console.log(`FAIL ${profile.code}/${module}: ${problems.length} problem(s)`);
        problems.slice(0, 20).forEach((m) => console.log('     ' + m));
        if (problems.length > 20) console.log(`     … ${problems.length - 20} more`);
      } else {
        passed += 1;
        console.log(`ok   ${profile.code}/${module}`);
      }
    }
  }
  console.log(`Module data: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

if (require.main === module) main();

module.exports = { CHECKS, validateCollocations, checkMeta };
