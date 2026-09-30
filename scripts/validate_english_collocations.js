#!/usr/bin/env node
/**
 * Validator for data/english-collocations-data.js (ENGLISH_VERB_COLLOCATIONS_DATA).
 *
 *   node scripts/validate_english_collocations.js
 *
 * Reads only the shipped data file (independent of the build script) and checks:
 *   - it loads in a bare vm and declares the global the renderer resolves,
 *   - shape parity with the Italian reference (same top-level keys, same meta
 *     fields, per-verb display / prepositions / prepositionOrder),
 *   - meta.totalVerbs / totalExamples match the data, meta.prepositionOrder
 *     covers every key, the prepositions index is exactly the inverse of verbs,
 *   - every example splits through the renderer's own splitExample() into a
 *     plain English sentence and a Chinese translation,
 *   - every English half contains the verb (any inflection) and the key words
 *     (in order), no example is duplicated,
 *   - size floors: >= 700 verbs, >= 2500 examples, 1-4 examples per sense.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const EN_FILE = path.join(ROOT, 'data', 'english-collocations-data.js');
const IT_FILE = path.join(ROOT, 'data', 'verb-collocations-data.js');

const MIN_VERBS = 700;
const MIN_EXAMPLES = 2500;

const errors = [];
let checks = 0;
function check(cond, msg) {
  checks += 1;
  if (!cond && errors.length < 200) errors.push(msg);
  return !!cond;
}

function loadGlobal(file, name) {
  const ctx = vm.createContext({ window: {}, console });
  const src = fs.readFileSync(file, 'utf8');
  return vm.runInContext(`${src}\n;(typeof ${name} !== 'undefined' ? ${name} : undefined);`, ctx, { filename: file });
}

/** Exact copy of splitExample() in verb-collocations.js (the renderer). */
function splitExample(raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { target: '', gloss: '' };
  const sentenceMatch = text.match(/^(.+?[.!?！？。])\s*([　-〿一-鿿].*)$/);
  if (sentenceMatch) return { target: sentenceMatch[1].trim(), gloss: sentenceMatch[2].trim() };
  const splitIndex = text.search(/[一-鿿]/);
  if (splitIndex > 0) return { target: text.slice(0, splitIndex).trim(), gloss: text.slice(splitIndex).trim() };
  return { target: text, gloss: '' };
}

// ---------- inflection (independent re-implementation) ----------
const IRREGULAR = {
  arise: 'arose arisen', awake: 'awoke awoken', be: 'am is are was were been being',
  bear: 'bore borne born', beat: 'beaten', become: 'became', begin: 'began begun',
  bend: 'bent', bind: 'bound', bite: 'bit bitten', bleed: 'bled', blow: 'blew blown',
  break: 'broke broken', breed: 'bred', bring: 'brought', build: 'built', burn: 'burnt',
  buy: 'bought', catch: 'caught', choose: 'chose chosen', cling: 'clung', come: 'came',
  creep: 'crept', deal: 'dealt', dig: 'dug', dive: 'dove', do: 'does did done',
  draw: 'drew drawn', dream: 'dreamt', drink: 'drank drunk', drive: 'drove driven',
  dwell: 'dwelt', eat: 'ate eaten', fall: 'fell fallen', feed: 'fed', feel: 'felt',
  fight: 'fought', find: 'found', flee: 'fled', fling: 'flung', fly: 'flew flown',
  forbid: 'forbade forbidden', forget: 'forgot forgotten', forgive: 'forgave forgiven',
  foresee: 'foresaw foreseen', freeze: 'froze frozen', get: 'got gotten', give: 'gave given',
  go: 'goes went gone', grind: 'ground', grow: 'grew grown', hang: 'hung', have: 'has had',
  hear: 'heard', hide: 'hid hidden', hold: 'held', keep: 'kept', kneel: 'knelt',
  know: 'knew known', lay: 'laid', lead: 'led', lean: 'leant', leap: 'leapt', learn: 'learnt',
  leave: 'left', lend: 'lent', lie: 'lay lain lying', light: 'lit', lose: 'lost', make: 'made',
  mean: 'meant', meet: 'met', mislead: 'misled', mistake: 'mistook mistaken',
  misunderstand: 'misunderstood', outgrow: 'outgrew outgrown', overcome: 'overcame',
  overhear: 'overheard', override: 'overrode overridden', oversee: 'oversaw overseen',
  overtake: 'overtook overtaken', overthrow: 'overthrew overthrown', pay: 'paid',
  prove: 'proven', ride: 'rode ridden', ring: 'rang rung', rise: 'rose risen', run: 'ran',
  say: 'said', see: 'saw seen', seek: 'sought', sell: 'sold', send: 'sent', shake: 'shook shaken',
  shine: 'shone', shoot: 'shot', show: 'shown', shrink: 'shrank shrunk', sing: 'sang sung',
  sink: 'sank sunk', sit: 'sat', sleep: 'slept', slide: 'slid', sling: 'slung', speak: 'spoke spoken',
  speed: 'sped', spend: 'spent', spill: 'spilt', spin: 'spun', spit: 'spat', spring: 'sprang sprung',
  stand: 'stood', steal: 'stole stolen', stick: 'stuck', sting: 'stung', stink: 'stank stunk',
  strike: 'struck stricken', strive: 'strove striven', string: 'strung', swear: 'swore sworn',
  sweep: 'swept', swell: 'swollen', swim: 'swam swum', swing: 'swung', take: 'took taken',
  teach: 'taught', tear: 'tore torn', tell: 'told', think: 'thought', throw: 'threw thrown',
  tread: 'trod trodden', undergo: 'underwent undergone', understand: 'understood',
  undertake: 'undertook undertaken', uphold: 'upheld', wake: 'woke woken', wear: 'wore worn',
  weave: 'wove woven', weep: 'wept', win: 'won', wind: 'wound', withdraw: 'withdrew withdrawn',
  withhold: 'withheld', withstand: 'withstood', wring: 'wrung', write: 'wrote written',
  can: 'could', will: 'would', shall: 'should', may: 'might', backslide: 'backslid',
};

function inflections(verb) {
  const v = verb.toLowerCase();
  const forms = new Set([v, v + 's', v + 'es', v + 'ed', v + 'd', v + 'ing']);
  (IRREGULAR[v] || '').split(' ').filter(Boolean).forEach(f => forms.add(f));
  if (/[^aeiou]y$/.test(v)) { forms.add(v.slice(0, -1) + 'ies'); forms.add(v.slice(0, -1) + 'ied'); }
  if (/e$/.test(v)) forms.add(v.slice(0, -1) + 'ing');
  if (/ie$/.test(v)) forms.add(v.slice(0, -2) + 'ying');
  if (/[aeiou][b-df-hj-np-tvz]$/.test(v)) {   // consonant doubling: stop -> stopped, equip -> equipped
    forms.add(v + v.slice(-1) + 'ed'); forms.add(v + v.slice(-1) + 'ing');
  }
  if (/[aeiou]l$/.test(v)) { forms.add(v + 'led'); forms.add(v + 'ling'); }   // travel -> travelled
  if (/c$/.test(v)) { forms.add(v + 'ked'); forms.add(v + 'king'); }         // panic -> panicked
  return forms;
}

const words = s => (s.toLowerCase().match(/[a-z]+/g) || []);

function containsVerb(sentence, verb) {
  const forms = inflections(verb);
  return words(sentence).some(w => forms.has(w));
}

function containsKey(sentence, key) {
  const parts = key.split(' ');
  let i = 0;
  for (const w of words(sentence)) if (i < parts.length && w === parts[i]) i += 1;
  return i === parts.length;
}

// ---------- load ----------
const EN = loadGlobal(EN_FILE, 'ENGLISH_VERB_COLLOCATIONS_DATA');
const IT = loadGlobal(IT_FILE, 'VERB_COLLOCATIONS_DATA');

if (!check(EN && typeof EN === 'object', 'ENGLISH_VERB_COLLOCATIONS_DATA is not declared by data/english-collocations-data.js')) {
  errors.forEach(e => console.log('FAIL ' + e));
  console.log('RESULT: FAIL');
  process.exit(1);
}

// ---------- shape parity ----------
check(JSON.stringify(Object.keys(EN).sort()) === JSON.stringify(Object.keys(IT).sort()),
  `top-level keys ${JSON.stringify(Object.keys(EN))} differ from Italian ${JSON.stringify(Object.keys(IT))}`);
Object.keys(IT.meta).forEach(k => {
  check(k in EN.meta, `meta.${k} missing (present in Italian reference)`);
  check(typeof EN.meta[k] === typeof IT.meta[k], `meta.${k} type differs from Italian`);
});
check(EN.meta.language === 'english', 'meta.language must be "english"');
check(Array.isArray(EN.meta.prepositionOrder) && EN.meta.prepositionOrder.length > 0, 'meta.prepositionOrder must be a non-empty array');
check(new Set(EN.meta.prepositionOrder).size === EN.meta.prepositionOrder.length, 'meta.prepositionOrder has duplicates');
check(Array.isArray(EN.meta.particles), 'meta.particles must list the adverb-particle keys');
(EN.meta.particles || []).forEach(p => check(EN.meta.prepositionOrder.includes(p), `meta.particles "${p}" not in prepositionOrder`));

const ORDER = new Set(EN.meta.prepositionOrder);
const CJK = /[一-鿿]/;
const seenExamples = new Map();
const derivedIndex = {};
let exampleCount = 0;

Object.entries(EN.verbs).forEach(([slug, verb]) => {
  const where = `verb "${slug}"`;
  check(/^[a-z]+$/.test(slug), `${where}: slug must be a lowercase base verb`);
  check(verb.display === slug, `${where}: display "${verb.display}" !== slug`);
  check(verb.prepositions && typeof verb.prepositions === 'object' && !Array.isArray(verb.prepositions), `${where}: prepositions must be an object`);
  const keys = Object.keys(verb.prepositions || {});
  check(keys.length > 0, `${where}: no prepositions`);
  check(JSON.stringify(verb.prepositionOrder) === JSON.stringify(keys), `${where}: prepositionOrder does not match prepositions keys`);

  keys.forEach(key => {
    const w = `${where} + "${key}"`;
    check(ORDER.has(key), `${w}: key missing from meta.prepositionOrder`);
    (derivedIndex[key] = derivedIndex[key] || []).push(slug);
    const list = verb.prepositions[key];
    if (!check(Array.isArray(list) && list.length > 0, `${w}: examples must be a non-empty array`)) return;

    // senses (additive) must partition the example list, 1-4 examples each
    const senses = verb.senses && verb.senses[key];
    if (check(Array.isArray(senses) && senses.length > 0, `${w}: senses missing`)) {
      const covered = [];
      senses.forEach((s, i) => {
        check(s && CJK.test(s.zh || ''), `${w}: sense #${i} has no Chinese gloss`);
        check(s && (s.kind === 'preposition' || s.kind === 'particle'), `${w}: sense #${i} bad kind`);
        check(s && Array.isArray(s.examples) && s.examples.length >= 1 && s.examples.length <= 4,
          `${w}: sense #${i} must have 1-4 examples`);
        (s && s.examples || []).forEach(n => covered.push(n));
      });
      check(JSON.stringify(covered) === JSON.stringify(list.map((_, i) => i)), `${w}: senses do not cover the examples exactly once`);
    }

    list.forEach((raw, i) => {
      exampleCount += 1;
      const e = `${w} #${i}`;
      if (!check(typeof raw === 'string' && raw.trim(), `${e}: empty example`)) return;
      const { target, gloss } = splitExample(raw);
      check(`${target} ${gloss}` === raw, `${e}: does not round-trip through splitExample(): ${JSON.stringify(raw)}`);
      check(/^[A-Za-z][A-Za-z0-9 ,.'?!;:]*[.!?]$/.test(target), `${e}: English half is not a plain sentence: ${JSON.stringify(target)}`);
      check(!CJK.test(target), `${e}: English half leaked Chinese`);
      check(CJK.test(gloss) && /^[　-〿一-鿿]/.test(gloss), `${e}: missing / malformed Chinese half: ${JSON.stringify(gloss)}`);
      check(containsVerb(target, slug), `${e}: no form of "${slug}" in ${JSON.stringify(target)}`);
      check(containsKey(target, key), `${e}: "${key}" not in ${JSON.stringify(target)}`);
      const norm = target.toLowerCase();
      check(!seenExamples.has(norm), `${e}: duplicate English sentence (also ${seenExamples.get(norm)})`);
      seenExamples.set(norm, e);
    });
  });
});

// ---------- counts + inverse index ----------
const verbCount = Object.keys(EN.verbs).length;
check(EN.meta.totalVerbs === verbCount, `meta.totalVerbs ${EN.meta.totalVerbs} !== actual ${verbCount}`);
check(EN.meta.totalExamples === exampleCount, `meta.totalExamples ${EN.meta.totalExamples} !== actual ${exampleCount}`);
check(verbCount >= MIN_VERBS, `only ${verbCount} verbs (floor ${MIN_VERBS})`);
check(exampleCount >= MIN_EXAMPLES, `only ${exampleCount} examples (floor ${MIN_EXAMPLES})`);

check(JSON.stringify(Object.keys(EN.prepositions)) === JSON.stringify(EN.meta.prepositionOrder),
  'prepositions index keys must equal meta.prepositionOrder (same order)');
Object.entries(derivedIndex).forEach(([key, slugs]) => {
  check(JSON.stringify(EN.prepositions[key]) === JSON.stringify(slugs), `prepositions.${key} is not the inverse of verbs`);
});

// ---------- result ----------
if (errors.length) {
  errors.forEach(e => console.log('FAIL ' + e));
  console.log(`RESULT: FAIL — ${errors.length} problems (${checks} checks)`);
  process.exit(1);
}
console.log(`English collocations OK: ${verbCount} verbs, ${exampleCount} examples, ` +
  `${EN.meta.prepositionOrder.length} keys (${(EN.meta.particles || []).length} particles) — ${checks} passed, 0 failed`);
