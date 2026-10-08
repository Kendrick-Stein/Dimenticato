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
 *   - the shapes match the Italian reference datasets exactly (same top-level
 *     keys, same required per-entry fields, same types),
 *   - no empty / placeholder / mojibake glosses, no self-glosses, no dupes,
 *   - every collocation example round-trips through the app's own extractItZh()
 *     parser into a non-empty French half and a non-empty Chinese half,
 *   - (cognates moved to scripts/validate_modules.js, schema cognates/1).
 *
 * Exits 0 when clean, 1 on the first non-empty error list.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FR_COLLOC = path.join(ROOT, 'data', 'french-collocations-data.js');
const IT_COLLOC = path.join(ROOT, 'data', 'verb-collocations-data.js');

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

/** Exact copy of extractItZh() from verb-collocations-practice.js (the consumer). */
function extractItZh(raw) {
  const text = String(raw || '').trim();
  const match = text.match(/^(.+?[\.!?！？。])\s*(.+)$/);
  if (match) return { it: match[1].trim(), zh: match[2].trim() };
  const splitIndex = text.search(/[一-鿿]/);
  if (splitIndex > 0) return { it: text.slice(0, splitIndex).trim(), zh: text.slice(splitIndex).trim() };
  return { it: text, zh: '' };
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
for (const [file, name] of [[FR_COLLOC, 'FRENCH_COLLOCATIONS_DATA']]) {
  check(fs.existsSync(file), `missing dataset ${file}`);
  const src = fs.readFileSync(file, 'utf8');
  check(new RegExp(`if \\(typeof module !== 'undefined' && module\\.exports\\) \\{ module\\.exports = ${name}; \\}`).test(src),
    `${path.basename(file)}: missing the required module.exports tail for ${name}`);
  const { viaGlobal, viaWindow } = loadGlobal(file, name);
  check(viaGlobal !== undefined, `${path.basename(file)}: does not declare a top-level ${name}`);
  check(viaWindow !== undefined, `${path.basename(file)}: does not assign window.${name}`);
  check(viaGlobal === viaWindow, `${path.basename(file)}: window.${name} is not the declared ${name}`);
  check(require(file) !== undefined, `${path.basename(file)}: module.exports is undefined`);
}

const COLLOC = require(FR_COLLOC);
const IT_COLLOC_DATA = loadGlobal(IT_COLLOC, 'VERB_COLLOCATIONS_DATA').viaGlobal;

// ===========================================================================
// 2. collocations: shape parity with the Italian reference
// ===========================================================================
const itTop = Object.keys(IT_COLLOC_DATA).sort();
const frTop = Object.keys(COLLOC).sort();
check(JSON.stringify(itTop) === JSON.stringify(frTop),
  `collocations: top-level keys ${JSON.stringify(frTop)} !== Italian ${JSON.stringify(itTop)}`);

const itMetaKeys = Object.keys(IT_COLLOC_DATA.meta);
for (const k of itMetaKeys) {
  check(k in COLLOC.meta, `collocations: meta.${k} missing (present in the Italian reference)`);
  if (k in COLLOC.meta) {
    check(typeof COLLOC.meta[k] === typeof IT_COLLOC_DATA.meta[k],
      `collocations: meta.${k} type ${typeof COLLOC.meta[k]} !== Italian ${typeof IT_COLLOC_DATA.meta[k]}`);
  }
}

const itVerbSample = IT_COLLOC_DATA.verbs[Object.keys(IT_COLLOC_DATA.verbs)[0]];
const itVerbKeys = Object.keys(itVerbSample);

check(Array.isArray(COLLOC.meta.prepositionOrder) && COLLOC.meta.prepositionOrder.length > 0,
  'collocations: meta.prepositionOrder must be a non-empty array');
const PREP_SET = new Set(COLLOC.meta.prepositionOrder);

// every source id used by a verb must be declared (with a licence) in meta.sources
check(Array.isArray(COLLOC.meta.sources) && COLLOC.meta.sources.length > 0,
  'collocations: meta.sources must list the corpora and their licences');
const KNOWN_SOURCE_IDS = new Set((COLLOC.meta.sources || []).map((s) => s.id));
(COLLOC.meta.sources || []).forEach((s, i) => {
  check(!badText(s && s.id), `collocations: meta.sources#${i} has no id`);
  check(!badText(s && s.license), `collocations: meta.sources#${i} ("${s && s.id}") has no licence`);
});

let verbCount = 0;
let exampleCount = 0;
let curatedFirst = 0;
const seenGlobalExamples = new Map();

for (const [slug, verb] of Object.entries(COLLOC.verbs)) {
  verbCount += 1;
  const where = `collocations verb "${slug}"`;
  for (const k of itVerbKeys) {
    if (!check(k in verb, `${where}: missing field "${k}" required by the Italian shape`)) continue;
    check(typeof verb[k] === typeof itVerbSample[k],
      `${where}: field "${k}" type ${typeof verb[k]} !== Italian ${typeof itVerbSample[k]}`);
  }
  check(!badText(verb.display), `${where}: bad display (${badText(verb.display)})`);
  check(!CJK.test(verb.display), `${where}: display must not contain Chinese`);
  check(strip(slug).length > 0, `${where}: empty slug`);

  const preps = Object.keys(verb.prepositions || {});
  check(preps.length > 0, `${where}: no prepositions`);
  check(Array.isArray(verb.prepositionOrder), `${where}: prepositionOrder must be an array`);
  check(JSON.stringify([...preps].sort()) === JSON.stringify([...(verb.prepositionOrder || [])].sort()),
    `${where}: prepositionOrder ${JSON.stringify(verb.prepositionOrder)} !== keys ${JSON.stringify(preps)}`);

  const seen = new Set();
  const seenZh = new Set();
  for (const [prep, examples] of Object.entries(verb.prepositions)) {
    const w2 = `${where} [${prep}]`;
    check(PREP_SET.has(prep), `${w2}: preposition not in meta.prepositionOrder`);
    check(Array.isArray(examples) && examples.length > 0, `${w2}: empty example list`);
    check((COLLOC.prepositions[prep] || []).includes(slug),
      `${w2}: verb missing from the prepositions index`);
    examples.forEach((ex, i) => {
      exampleCount += 1;
      const w3 = `${w2}#${i}`;
      const bad = badText(ex);
      if (!check(!bad, `${w3}: bad example (${bad})`)) return;
      const parsed = extractItZh(ex);
      check(parsed.it.length > 0, `${w3}: French half is empty after extractItZh()`);
      check(parsed.zh.length > 0, `${w3}: Chinese half is empty after extractItZh() -> ${JSON.stringify(ex)}`);
      check(CJK.test(parsed.zh), `${w3}: Chinese half has no CJK -> ${JSON.stringify(ex)}`);
      check(!CJK.test(parsed.it), `${w3}: French half leaked Chinese -> ${JSON.stringify(ex)}`);
      check(LATIN.test(parsed.it), `${w3}: French half has no letters -> ${JSON.stringify(ex)}`);
      check(parsed.it.includes(' '), `${w3}: French half is a single token -> ${JSON.stringify(ex)}`);
      check(`${parsed.it} ${parsed.zh}`.replace(/\s+/g, ' ') === String(ex).trim().replace(/\s+/g, ' '),
        `${w3}: does not round-trip losslessly -> ${JSON.stringify(ex)}`);
      // a sentence may legitimately illustrate two different verbs, but never
      // twice inside the same verb entry
      const key = strip(parsed.it).replace(/[^a-z ]/g, '').trim();
      check(!seen.has(key), `${w3}: duplicate example inside verb "${slug}"`);
      seen.add(key);
      const zhKey = parsed.zh.replace(/\s+/g, '');
      check(!seenZh.has(zhKey), `${w3}: duplicate Chinese gloss inside verb "${slug}"`);
      seenZh.add(zhKey);
      seenGlobalExamples.set(key, (seenGlobalExamples.get(key) || 0) + 1);
    });
  }

  // additive fields
  if ('nounCollocations' in verb) {
    check(Array.isArray(verb.nounCollocations), `${where}: nounCollocations must be an array`);
    (verb.nounCollocations || []).forEach((nc, i) => {
      const w4 = `${where}: nounCollocations#${i}`;
      check(!badText(nc && nc.collocation), `${w4} bad collocation`);
      check(!badText(nc && nc.chinese), `${w4} bad chinese`);
      check(!badText(nc && nc.text), `${w4} bad display text`);
      check(CJK.test((nc && nc.chinese) || ''), `${w4} chinese has no CJK`);
      check(!CJK.test((nc && nc.collocation) || ''), `${w4} collocation leaked Chinese`);
      // the `text` field is what a renderer feeds to extractItZh()
      const p = extractItZh((nc && nc.text) || '');
      check(p.it === (nc && nc.collocation) && p.zh === (nc && nc.chinese),
        `${w4} text does not split back into collocation + chinese -> ${JSON.stringify(nc && nc.text)}`);
      check(!badText(nc && nc.source), `${w4} missing source`);
    });
  }
  // per-example provenance must line up 1:1 with the examples it describes
  if (check('sources' in verb, `${where}: missing per-example sources`)) {
    check(verb.sources && typeof verb.sources === 'object' && !Array.isArray(verb.sources),
      `${where}: sources must be an object keyed by preposition`);
    for (const prep of preps) {
      const src = (verb.sources || {})[prep];
      if (!check(Array.isArray(src), `${where} [${prep}]: missing source list`)) continue;
      check(src.length === verb.prepositions[prep].length,
        `${where} [${prep}]: ${src.length} source records for ${verb.prepositions[prep].length} examples`);
      src.forEach((s, i) => {
        check(s && KNOWN_SOURCE_IDS.has(s.kind),
          `${where} [${prep}]#${i}: unknown source kind ${JSON.stringify(s && s.kind)}`);
        if (s && (s.kind === 'direct' || s.kind === 'indirect')) {
          check(!!s.fr && !!s.zh, `${where} [${prep}]#${i}: corpus example without Tatoeba sentence ids`);
        }
      });
    }
  }
}

check(COLLOC.meta.totalVerbs === verbCount,
  `collocations: meta.totalVerbs ${COLLOC.meta.totalVerbs} !== actual ${verbCount}`);
check(COLLOC.meta.totalExamples === exampleCount,
  `collocations: meta.totalExamples ${COLLOC.meta.totalExamples} !== actual ${exampleCount}`);

// prepositions index must be exactly the inverse of verbs
for (const [prep, slugs] of Object.entries(COLLOC.prepositions)) {
  check(PREP_SET.has(prep), `collocations: prepositions index has unknown preposition "${prep}"`);
  check(Array.isArray(slugs), `collocations: prepositions.${prep} must be an array`);
  check(new Set(slugs).size === slugs.length, `collocations: prepositions.${prep} contains duplicates`);
  for (const slug of slugs) {
    check(!!COLLOC.verbs[slug], `collocations: prepositions.${prep} references unknown verb "${slug}"`);
    check(!!(COLLOC.verbs[slug] && COLLOC.verbs[slug].prepositions[prep]),
      `collocations: prepositions.${prep} lists "${slug}" which has no ${prep} examples`);
  }
}

// the practice screen uses prepositions[prep][0] of the FIRST verb as its hint,
// so every preposition bucket must be non-empty
for (const prep of COLLOC.meta.prepositionOrder) {
  check((COLLOC.prepositions[prep] || []).length > 0,
    `collocations: preposition "${prep}" is in prepositionOrder but has no verbs`);
}

// government coverage the brief calls out by name
for (const [slug, wanted] of [['penser', ['à', 'de']], ['jouer', ['à', 'de']],
                              ['manquer', ['à', 'de']], ['servir', ['à', 'de']]]) {
  const v = COLLOC.verbs[slug];
  if (check(!!v, `collocations: missing required verb "${slug}"`)) {
    for (const p of wanted) {
      check(!!v.prepositions[p], `collocations: "${slug}" is missing the "${p}" government`);
    }
  }
}

// coverage floor: the authored layer (scripts/sources/french-collocations) brought
// the dataset toward Italian breadth; a build that drops it would fall back to ~780
check(verbCount >= 1300, `collocations: only ${verbCount} verbs (floor 1300) - authored sources not picked up?`);
check(exampleCount >= 4500, `collocations: only ${exampleCount} examples (floor 4500)`);

notes.push(`collocations: ${verbCount} verbs, ${exampleCount} examples, ` +
  `${Object.keys(COLLOC.prepositions).length} prepositions`);

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
