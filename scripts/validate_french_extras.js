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
 *   - cognate similarity scores are in range and consistent with `difficulty`,
 *   - every patternType is a real classified value or explicitly null with a
 *     patternNote reason,
 *   - every noun carries a gender, every entry carries a part of speech,
 *   - ranks are real corpus ranks, not array indices.
 *
 * Exits 0 when clean, 1 on the first non-empty error list.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FR_COLLOC = path.join(ROOT, 'data', 'fr-collocations.js');
const FR_COGNATE = path.join(ROOT, 'data', 'french-cognates.js');
const IT_COGNATE = path.join(ROOT, 'data', 'cognates.js');

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
for (const [file, name] of [[FR_COGNATE, 'FRENCH_COGNATE_DATA']]) {
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
const COGNATES = require(FR_COGNATE);
const IT_COGNATE_DATA = loadGlobal(IT_COGNATE, 'COGNATE_DATA').viaGlobal;

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

// ===========================================================================
// 3. cognates: shape parity with the Italian reference
// ===========================================================================
check(Array.isArray(COGNATES), 'cognates: dataset must be an array');
const itCognateKeys = Object.keys(IT_COGNATE_DATA[0]);
check(itCognateKeys.includes('italian'), 'cognates: Italian reference lost its "italian" field?');
const REQUIRED = itCognateKeys.map((k) => (k === 'italian' ? 'french' : k));

const PATTERN_OK = /(^同形词 identical$)|(^假朋友 faux-ami$)|(\/)/;
const seenFrench = new Map();
const seenShape = new Map();
let classified = 0;
let identityRank = 0;
let maxRank = 0;

COGNATES.forEach((row, i) => {
  const where = `cognates#${i} "${row && row.french}"`;
  if (!check(row && typeof row === 'object', `${where}: not an object`)) return;
  for (const k of REQUIRED) {
    check(k in row, `${where}: missing required field "${k}"`);
  }
  const refRow = IT_COGNATE_DATA[0];
  for (const k of REQUIRED) {
    if (!(k in row)) continue;
    const want = k === 'french' ? typeof refRow.italian : typeof refRow[k];
    if (k === 'patternType') continue; // reference value may be null
    check(typeof row[k] === want, `${where}: field "${k}" type ${typeof row[k]} !== Italian ${want}`);
  }

  for (const k of ['french', 'english', 'chinese']) {
    const bad = badText(row[k]);
    check(!bad, `${where}: ${k} is ${bad}`);
  }
  check(!CJK.test(row.french || ''), `${where}: french contains Chinese`);
  check(!CJK.test(row.english || ''), `${where}: english contains Chinese`);
  check(CJK.test(row.chinese || ''), `${where}: chinese has no CJK`);
  check(!LATIN.test(row.chinese || ''), `${where}: chinese carries latin/POS artefacts -> ${JSON.stringify(row.chinese)}`);
  check(!/[<>[\]《》]/.test(row.chinese || ''),
    `${where}: chinese carries dictionary markup -> ${JSON.stringify(row.chinese)}`);
  check(bracketsBalanced(row.chinese || ''),
    `${where}: chinese is a bracket-truncated fragment -> ${JSON.stringify(row.chinese)}`);
  check(bracketsBalanced(row.warning || ''),
    `${where}: warning is a bracket-truncated fragment -> ${JSON.stringify(row.warning)}`);
  check(strip(row.chinese || '') !== strip(row.french || ''), `${where}: chinese is the headword`);

  // similarity + difficulty
  check(Number.isInteger(row.similarityScore) && row.similarityScore >= 0 && row.similarityScore <= 100,
    `${where}: similarityScore ${row.similarityScore} out of range`);
  const curve = row.similarityScore >= 80 ? 'easy' : (row.similarityScore >= 50 ? 'medium' : 'hard');
  check(row.difficulty === curve || row.falseFriend === true,
    `${where}: difficulty "${row.difficulty}" !== "${curve}" for score ${row.similarityScore}`);
  check(['easy', 'medium', 'hard'].includes(row.difficulty), `${where}: unknown difficulty "${row.difficulty}"`);

  // patternType: real classified value, or null WITH a stated reason
  if (row.patternType === null) {
    check(typeof row.patternNote === 'string' && row.patternNote.trim().length > 0,
      `${where}: patternType is null without a patternNote reason`);
  } else {
    classified += 1;
    check(typeof row.patternType === 'string' && PATTERN_OK.test(row.patternType),
      `${where}: patternType "${row.patternType}" is not a recognised correspondence label`);
  }
  if (strip(row.french || '') === strip(row.english || '')) {
    check(row.patternType === '同形词 identical' || row.falseFriend === true,
      `${where}: identical spelling but patternType "${row.patternType}"`);
  }

  // part of speech + gender
  const bp = badText(row.partOfSpeech);
  check(!bp, `${where}: partOfSpeech is ${bp}`);
  if ((row.partOfSpeech || '').startsWith('n.')) {
    check(row.gender === 'm' || row.gender === 'f', `${where}: noun without gender`);
    check(row.partOfSpeech === `n.${row.gender}`,
      `${where}: partOfSpeech "${row.partOfSpeech}" disagrees with gender "${row.gender}"`);
  }

  // rank must be a real corpus rank
  check(Number.isInteger(row.rank) && row.rank > 0, `${where}: rank ${row.rank} is not a positive integer`);
  if (row.rank === i + 1) identityRank += 1;
  maxRank = Math.max(maxRank, row.rank);

  check(['english', 'lookalike'].includes(row.similarityBasis),
    `${where}: similarityBasis "${row.similarityBasis}" must be english|lookalike`);
  check(typeof row.source === 'string' && row.source.length > 0, `${where}: missing source`);

  if (row.falseFriend === true) {
    check(row.patternType === '假朋友 faux-ami', `${where}: faux ami without the faux-ami patternType`);
    check(!badText(row.lookalike), `${where}: faux ami without a lookalike word`);
    check(!badText(row.warning) && CJK.test(row.warning || ''),
      `${where}: faux ami without a Chinese warning`);
  }
  if ('italian' in row) {
    check(!badText(row.italian), `${where}: empty italian bridge`);
    check(Number.isInteger(row.italianSimilarity), `${where}: italianSimilarity must be an integer`);
  }

  // "passe" and "passé" are different words; "suicide"/"suicidé" glossed the
  // same way are the same card twice.
  const key = (row.french || '').toLowerCase();
  check(!seenFrench.has(key), `${where}: duplicate headword (also at #${seenFrench.get(key)})`);
  seenFrench.set(key, i);
  const shape = `${strip(row.french || '')}|${row.english}|${row.chinese}`;
  check(!seenShape.has(shape) || row.falseFriend === true,
    `${where}: accent variant of "${seenShape.get(shape)}" with an identical gloss`);
  if (!seenShape.has(shape)) seenShape.set(shape, row.french);
});

check(identityRank < COGNATES.length * 0.05,
  `cognates: ${identityRank}/${COGNATES.length} ranks equal their array index — ranks look synthesised`);
check(maxRank > COGNATES.length,
  `cognates: max rank ${maxRank} <= entry count ${COGNATES.length} — ranks are not corpus ranks`);
check(classified > COGNATES.length * 0.3,
  `cognates: only ${classified}/${COGNATES.length} entries carry a real patternType`);

// faux amis the brief names explicitly
for (const w of ['actuellement', 'assister', 'librairie', 'sensible', 'journée']) {
  const row = COGNATES.find((r) => r.french === w);
  if (check(!!row, `cognates: required faux ami "${w}" is missing`)) {
    check(row.falseFriend === true, `cognates: "${w}" is not flagged as a faux ami`);
  }
}

// coverage floor: the authored layer (scripts/sources/french-collocations) brought
// the dataset toward Italian breadth; a build that drops it would fall back to ~780
check(verbCount >= 1300, `collocations: only ${verbCount} verbs (floor 1300) - authored sources not picked up?`);
check(exampleCount >= 4500, `collocations: only ${exampleCount} examples (floor 4500)`);

const fauxCount = COGNATES.filter((r) => r.falseFriend).length;
notes.push(`collocations: ${verbCount} verbs, ${exampleCount} examples, ` +
  `${Object.keys(COLLOC.index).length} prepositions`);
notes.push(`cognates: ${COGNATES.length} entries, ${classified} with a classified patternType, ` +
  `${fauxCount} faux amis, ${COGNATES.filter((r) => r.italian).length} with an Italian bridge`);
notes.push(`rank scale: max ${maxRank} (corpus lemma rank), identity-rank rows ${identityRank}`);

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
