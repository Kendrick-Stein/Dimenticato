#!/usr/bin/env node
/**
 * Validator for data/en-collocations.js (DIM_DATA.collocations.en, collocations/1).
 *
 *   node scripts/validate_english_collocations.js
 *
 * The language-independent schema checks live in scripts/validate_modules.js
 * (validateCollocations).  This file reads only the shipped data file
 * (independent of the build script) and checks the English content:
 *   - every key is a preposition or particle (keys[].kind), particles are marked,
 *   - every example is a plain English sentence + a Chinese translation,
 *   - every English sentence contains the verb (any inflection) and the key
 *     words (in order); no English sentence is duplicated,
 *   - verbs[w].x.senses partitions each key's examples, 1-4 examples per sense,
 *   - size floors: >= 700 verbs, >= 2500 examples.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const EN_FILE = path.join(ROOT, 'data', 'en-collocations.js');

const MIN_VERBS = 700;
const MIN_EXAMPLES = 2500;

const errors = [];
let checks = 0;
function check(cond, msg) {
  checks += 1;
  if (!cond && errors.length < 200) errors.push(msg);
  return !!cond;
}

function loadModule(file, module, code) {
  const ctx = { console };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  return ctx.DIM_DATA && ctx.DIM_DATA[module] && ctx.DIM_DATA[module][code];
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
const EN = loadModule(EN_FILE, 'collocations', 'en');

if (!check(EN && typeof EN === 'object' && EN.verbs, 'data/en-collocations.js does not register DIM_DATA.collocations.en')) {
  errors.forEach(e => console.log('FAIL ' + e));
  console.log('RESULT: FAIL');
  process.exit(1);
}

// ---------- keys ----------
check(EN.meta && EN.meta.schema === 'collocations/1' && EN.meta.lang === 'en', 'meta.schema / meta.lang');
const KEYS = new Map((EN.keys || []).map(k => [k.key, k]));
check(KEYS.size > 0 && KEYS.size === (EN.keys || []).length, 'keys[] must be non-empty with unique keys');
(EN.keys || []).forEach(k => {
  check(k.kind === 'preposition' || k.kind === 'particle', `key "${k.key}": kind must be preposition | particle`);
  check(k.label === k.key, `key "${k.key}": English labels are the key itself`);
});
const particleKeys = (EN.keys || []).filter(k => k.kind === 'particle' || (k.x && k.x.particle));
check(particleKeys.length > 0, 'no particle keys (phrasal verbs) marked');

const CJK = /[一-鿿]/;
const seenExamples = new Map();
let exampleCount = 0;

Object.entries(EN.verbs).forEach(([word, verb]) => {
  const where = `verb "${word}"`;
  check(/^[a-z]+$/.test(word), `${where}: headword must be a lowercase base verb`);
  check(verb.word === word, `${where}: word "${verb.word}" !== headword`);
  const keys = verb.order || [];
  check(keys.length > 0, `${where}: no keys`);

  keys.forEach(key => {
    const w = `${where} + "${key}"`;
    check(KEYS.has(key), `${w}: key missing from keys[]`);
    const list = verb.keys && verb.keys[key];
    if (!check(Array.isArray(list) && list.length > 0, `${w}: examples must be a non-empty array`)) return;

    // x.senses must partition the example list, 1-4 examples each
    const senses = verb.x && verb.x.senses && verb.x.senses[key];
    if (check(Array.isArray(senses) && senses.length > 0, `${w}: x.senses missing`)) {
      const covered = [];
      senses.forEach((s, i) => {
        check(s && CJK.test(s.zh || ''), `${w}: sense #${i} has no Chinese gloss`);
        check(s && (s.kind === 'preposition' || s.kind === 'particle'), `${w}: sense #${i} bad kind`);
        check(s && Array.isArray(s.examples) && s.examples.length >= 1 && s.examples.length <= 4,
          `${w}: sense #${i} must have 1-4 examples`);
        (s && s.examples || []).forEach(n => covered.push(n));
      });
      check(JSON.stringify(covered.slice().sort((a, b) => a - b)) === JSON.stringify(list.map((_, i) => i)),
        `${w}: senses do not cover the examples exactly once`);
    }

    list.forEach((ex, i) => {
      exampleCount += 1;
      const e = `${w} #${i}`;
      const target = ex && ex.text;
      const gloss = ex && ex.zh;
      if (!check(typeof target === 'string' && target.trim(), `${e}: empty example`)) return;
      check(/^[A-Za-z][A-Za-z0-9 ,.'?!;:]*[.!?]$/.test(target), `${e}: English half is not a plain sentence: ${JSON.stringify(target)}`);
      check(!CJK.test(target), `${e}: English half leaked Chinese`);
      check(typeof gloss === 'string' && CJK.test(gloss), `${e}: missing / malformed Chinese half: ${JSON.stringify(gloss)}`);
      check(containsVerb(target, word), `${e}: no form of "${word}" in ${JSON.stringify(target)}`);
      check(containsKey(target, key), `${e}: "${key}" not in ${JSON.stringify(target)}`);
      const norm = target.toLowerCase();
      check(!seenExamples.has(norm), `${e}: duplicate English sentence (also ${seenExamples.get(norm)})`);
      seenExamples.set(norm, e);
    });
  });
});

// ---------- counts ----------
const verbCount = Object.keys(EN.verbs).length;
check(EN.meta.count === verbCount, `meta.count ${EN.meta.count} !== actual ${verbCount}`);
check(verbCount >= MIN_VERBS, `only ${verbCount} verbs (floor ${MIN_VERBS})`);
check(exampleCount >= MIN_EXAMPLES, `only ${exampleCount} examples (floor ${MIN_EXAMPLES})`);

// ---------- result ----------
if (errors.length) {
  errors.forEach(e => console.log('FAIL ' + e));
  console.log(`RESULT: FAIL — ${errors.length} problems (${checks} checks)`);
  process.exit(1);
}
console.log(`English collocations OK: ${verbCount} verbs, ${exampleCount} examples, ` +
  `${KEYS.size} keys (${particleKeys.length} particles) — ${checks} passed, 0 failed`);
