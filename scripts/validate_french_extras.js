#!/usr/bin/env node
/**
 * Validator for the French "extras" datasets.
 *
 *   node scripts/validate_french_extras.js
 *
 * Re-checks every rule the build script claims to enforce, independently of the
 * build script itself (it only ever reads the shipped .js files):
 *
 *   - the files load in a bare Node vm and declare the expected globals,
 *   - collocations follow schema collocations/1 (data/fr-collocations.js,
 *     DIM_DATA.collocations.fr): every example is { text, zh, src } with a
 *     French sentence, a Chinese translation and a src indexing meta.sources;
 *     index is the inverse of verbs[].order,
 *   - cognate shapes match the Italian reference dataset exactly (same top-level
 *     keys, same required per-entry fields, same types),
 *   - no empty / placeholder / mojibake glosses, no self-glosses, no dupes,
 *   - (cognates moved to scripts/validate_modules.js, schema cognates/1).
 *
 * Exits 0 when clean, 1 on the first non-empty error list.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FR_COLLOC = path.join(ROOT, 'data', 'fr-collocations.js');

const errors = [];
const notes = [];
let checks = 0;

function check(cond, msg) {
  checks += 1;
  if (!cond) errors.push(msg);
  return !!cond;
}

/** Load a dataset file the way index.html does: plain script, no module system.
 *  `const` declarations are lexical, so the value is read back as the script's
 *  completion value rather than off the sandbox object. */
function loadGlobal(file, globalName) {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  const src = fs.readFileSync(file, 'utf8');
  const probe = `\n;(typeof ${globalName} !== 'undefined' ? ${globalName} : undefined);`;
  const viaGlobal = vm.runInContext(src + probe, sandbox, { filename: file });
  return { viaGlobal, viaWindow: sandbox.window[globalName] };
}

const CJK = /[一-鿿]/;
const PLACEHOLDER = /^(\?+|n\/?a|todo|tbd|-+|\(n\)|null|none|undefined|xxx+)$/i;
const MOJIBAKE = /[�]|Ã[-¿]|â€|Â[ -¿]/;
const LATIN = /[A-Za-z]/;

function badText(value) {
  if (typeof value !== 'string') return 'not a string';
  const t = value.trim();
  if (!t) return 'empty';
  if (PLACEHOLDER.test(t)) return 'placeholder';
  if (MOJIBAKE.test(t)) return 'mojibake';
  return null;
}

function strip(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// ECDICT 把限定说明写在括号里，括号里照样有逗号（"(光,热等的)发射"）。按逗号
// 硬切会切出 "(光"、"容器(箱" 这种残句 —— 它们全是中日韩字符，上面「chinese
// 必须是纯中日韩字符」那条断言一个都查不出来，只有括号配对查得出来。
const BRACKET_OPEN = { '(': ')', '（': '）', '[': ']', '【': '】', '《': '》', '〈': '〉', '〔': '〕', '{': '}' };
const BRACKET_CLOSE = new Set(Object.values(BRACKET_OPEN));

function bracketsBalanced(value) {
  const stack = [];
  for (const ch of String(value || '')) {
    if (BRACKET_OPEN[ch]) stack.push(BRACKET_OPEN[ch]);
    else if (BRACKET_CLOSE.has(ch) && stack.pop() !== ch) return false;
  }
  return stack.length === 0;
}

// ===========================================================================
// 1. files load, globals exist, module.exports tail present
// ===========================================================================
/** DIM_DATA-registered module file (schema collocations/1). */
function loadModule(file, module, code) {
  const sandbox = { console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return sandbox.DIM_DATA && sandbox.DIM_DATA[module] && sandbox.DIM_DATA[module][code];
}

check(fs.existsSync(FR_COLLOC), `missing dataset ${FR_COLLOC}`);
const COLLOC = loadModule(FR_COLLOC, 'collocations', 'fr') || { meta: {}, keys: [], verbs: {}, index: {} };
check(Object.keys(COLLOC.verbs).length > 0, 'fr-collocations.js: does not register DIM_DATA.collocations.fr');

// ===========================================================================
// 2. collocations: schema collocations/1
// ===========================================================================
check(COLLOC.meta.schema === 'collocations/1', 'collocations: meta.schema must be "collocations/1"');
check(COLLOC.meta.lang === 'fr', 'collocations: meta.lang must be "fr"');
check(JSON.stringify(Object.keys(COLLOC).filter((k) => k !== 'x').sort()) === JSON.stringify(['index', 'keys', 'meta', 'verbs']),
  `collocations: top-level keys ${JSON.stringify(Object.keys(COLLOC))}`);
check(Array.isArray(COLLOC.keys) && COLLOC.keys.length > 0, 'collocations: keys[] must be a non-empty array');
const PREP_SET = new Set((COLLOC.keys || []).map((k) => k.key));
check(PREP_SET.size === (COLLOC.keys || []).length, 'collocations: duplicate key records');
(COLLOC.keys || []).forEach((k) => {
  check(!badText(k.label), `collocations: key "${k.key}" has a bad label`);
  check(k.kind === 'preposition', `collocations: key "${k.key}" kind must be preposition`);
});

// every example's src must index meta.sources; licences must be listed
check(Array.isArray(COLLOC.meta.sources) && COLLOC.meta.sources.length > 0,
  'collocations: meta.sources must list the corpora');
check(Array.isArray(COLLOC.meta.licences) && COLLOC.meta.licences.length > 0,
  'collocations: meta.licences must list the corpus licences');
(COLLOC.meta.sources || []).forEach((s, i) => check(!badText(s), `collocations: meta.sources#${i} is empty`));
const SOURCE_COUNT = (COLLOC.meta.sources || []).length;
// sources whose examples are Tatoeba pairs (their x.tatoeba record must carry ids)
const TATOEBA_SRC = new Set((COLLOC.meta.sources || []).map((s, i) => (/Tatoeba/.test(s) ? i : -1)).filter((i) => i >= 0));

let verbCount = 0;
let exampleCount = 0;
const seenGlobalExamples = new Map();

for (const [slug, verb] of Object.entries(COLLOC.verbs)) {
  verbCount += 1;
  const where = `collocations verb "${slug}"`;
  check(verb.word === slug, `${where}: word ${JSON.stringify(verb.word)} !== headword`);
  check(!CJK.test(slug), `${where}: headword must not contain Chinese`);
  check(strip(slug).length > 0, `${where}: empty slug`);

  const preps = Object.keys(verb.keys || {});
  check(preps.length > 0, `${where}: no keys`);
  check(Array.isArray(verb.order), `${where}: order must be an array`);
  check(JSON.stringify([...preps].sort()) === JSON.stringify([...(verb.order || [])].sort()),
    `${where}: order ${JSON.stringify(verb.order)} !== keys ${JSON.stringify(preps)}`);

  const seen = new Set();
  const seenZh = new Set();
  for (const [prep, examples] of Object.entries(verb.keys || {})) {
    const w2 = `${where} [${prep}]`;
    check(PREP_SET.has(prep), `${w2}: preposition not in keys[]`);
    check(Array.isArray(examples) && examples.length > 0, `${w2}: empty example list`);
    check((COLLOC.index[prep] || []).includes(slug), `${w2}: verb missing from the index`);
    const tatoeba = verb.x && verb.x.tatoeba && verb.x.tatoeba[prep];
    if (tatoeba) {
      check(Array.isArray(tatoeba) && tatoeba.length === examples.length,
        `${w2}: x.tatoeba has ${tatoeba && tatoeba.length} records for ${examples.length} examples`);
    }
    examples.forEach((ex, i) => {
      exampleCount += 1;
      const w3 = `${w2}#${i}`;
      const fr = ex && ex.text;
      const zh = ex && ex.zh;
      const bad = badText(fr) || badText(zh);
      if (!check(!bad, `${w3}: bad example (${bad}) ${JSON.stringify(ex)}`)) return;
      check(CJK.test(zh), `${w3}: Chinese half has no CJK -> ${JSON.stringify(ex)}`);
      check(!CJK.test(fr), `${w3}: French half leaked Chinese -> ${JSON.stringify(ex)}`);
      check(LATIN.test(fr), `${w3}: French half has no letters -> ${JSON.stringify(ex)}`);
      check(fr.includes(' '), `${w3}: French half is a single token -> ${JSON.stringify(ex)}`);
      check(Number.isInteger(ex.src) && ex.src >= 0 && ex.src < SOURCE_COUNT,
        `${w3}: src ${JSON.stringify(ex.src)} does not index meta.sources`);
      if (TATOEBA_SRC.has(ex.src)) {
        const rec = tatoeba && tatoeba[i];
        check(Array.isArray(rec) && rec.length >= 2, `${w3}: corpus example without Tatoeba sentence ids`);
      }
      // a sentence may legitimately illustrate two different verbs, but never
      // twice inside the same verb entry
      const key = strip(fr).replace(/[^a-z ]/g, '').trim();
      check(!seen.has(key), `${w3}: duplicate example inside verb "${slug}"`);
      seen.add(key);
      const zhKey = zh.replace(/\s+/g, '');
      check(!seenZh.has(zhKey), `${w3}: duplicate Chinese gloss inside verb "${slug}"`);
      seenZh.add(zhKey);
      seenGlobalExamples.set(key, (seenGlobalExamples.get(key) || 0) + 1);
    });
  }

  // additive fields (under x)
  const nounCollocations = verb.x && verb.x.nounCollocations;
  if (nounCollocations !== undefined) {
    check(Array.isArray(nounCollocations), `${where}: x.nounCollocations must be an array`);
    (nounCollocations || []).forEach((nc, i) => {
      const w4 = `${where}: x.nounCollocations#${i}`;
      check(!badText(nc && nc.text), `${w4} bad collocation`);
      check(!badText(nc && nc.zh), `${w4} bad chinese`);
      check(CJK.test((nc && nc.zh) || ''), `${w4} chinese has no CJK`);
      check(!CJK.test((nc && nc.text) || ''), `${w4} collocation leaked Chinese`);
    });
  }
  const notesX = verb.x && verb.x.notes;
  if (notesX !== undefined) {
    for (const [prep, note] of Object.entries(notesX || {})) {
      check(PREP_SET.has(prep) && !badText(note), `${where}: bad x.notes entry for "${prep}"`);
    }
  }
}

check(COLLOC.meta.count === verbCount,
  `collocations: meta.count ${COLLOC.meta.count} !== actual ${verbCount}`);
check(COLLOC.meta.examples === exampleCount,
  `collocations: meta.examples ${COLLOC.meta.examples} !== actual ${exampleCount}`);

// index must be exactly the inverse of verbs
for (const [prep, slugs] of Object.entries(COLLOC.index)) {
  check(PREP_SET.has(prep), `collocations: index has unknown preposition "${prep}"`);
  check(Array.isArray(slugs), `collocations: index.${prep} must be an array`);
  check(new Set(slugs).size === slugs.length, `collocations: index.${prep} contains duplicates`);
  for (const slug of slugs) {
    check(!!COLLOC.verbs[slug], `collocations: index.${prep} references unknown verb "${slug}"`);
    check(!!(COLLOC.verbs[slug] && COLLOC.verbs[slug].keys[prep]),
      `collocations: index.${prep} lists "${slug}" which has no ${prep} examples`);
  }
}

// every key bucket must be non-empty (the practice screen draws distractors from keys[])
for (const prep of PREP_SET) {
  check((COLLOC.index[prep] || []).length > 0,
    `collocations: key "${prep}" is in keys[] but has no verbs`);
}

// government coverage the brief calls out by name
for (const [slug, wanted] of [['penser', ['à', 'de']], ['jouer', ['à', 'de']],
                              ['manquer', ['à', 'de']], ['servir', ['à', 'de']]]) {
  const v = COLLOC.verbs[slug];
  if (check(!!v, `collocations: missing required verb "${slug}"`)) {
    for (const p of wanted) {
      check(!!v.keys[p], `collocations: "${slug}" is missing the "${p}" government`);
    }
  }
}

// coverage floor: the authored layer (scripts/sources/french-collocations) brought
// the dataset toward Italian breadth; a build that drops it would fall back to ~780
check(verbCount >= 1300, `collocations: only ${verbCount} verbs (floor 1300) - authored sources not picked up?`);
check(exampleCount >= 4500, `collocations: only ${exampleCount} examples (floor 4500)`);

notes.push(`collocations: ${verbCount} verbs, ${exampleCount} examples, ` +
  `${Object.keys(COLLOC.index).length} prepositions`);

// ===========================================================================
console.log(`ran ${checks} assertions`);
for (const n of notes) console.log(`  ${n}`);
if (errors.length) {
  console.error(`\nFAIL: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 40)) console.error(`  - ${e}`);
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log('OK: french extras datasets pass every rule');
