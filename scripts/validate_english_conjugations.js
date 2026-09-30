#!/usr/bin/env node
/*
 * Validator for data/english-conjugations.js.
 *
 * Run:  node scripts/validate_english_conjugations.js [path]
 *
 * Checks:
 *   1. the file loads as a browser <script> would and exposes the global;
 *   2. every entry has all 21 tenses, six persons where applicable, a Chinese
 *      verb gloss, and no inflected form / non-verb / duplicate as headword;
 *   3. a hand-verified gold set of spelling-rule and irregular cases — the
 *      old rule-based builder shipped "rememberred" / "happenned" / "offered"
 *      as an infinitive, so each of those failure classes has a sentinel here.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_PATH = process.argv[2] ||
  path.join(__dirname, '..', 'data', 'english-conjugations.js');
const GLOBAL_NAME = 'ENGLISH_CONJUGATION_DATA';
const PERSONS = ['i', 'you', 'he_she_it', 'we', 'you_pl', 'they'];
const TENSES = [
  'indicative_present_simple', 'indicative_present_continuous',
  'indicative_present_perfect', 'indicative_present_perfect_continuous',
  'indicative_past_simple', 'indicative_past_continuous',
  'indicative_past_perfect', 'indicative_past_perfect_continuous',
  'indicative_future_will_simple', 'indicative_future_will_continuous',
  'indicative_future_will_perfect', 'indicative_future_will_perfect_continuous',
  'conditional_present', 'conditional_continuous', 'conditional_perfect',
  'conditional_perfect_continuous', 'imperative', 'nonfinite_base',
  'nonfinite_past', 'nonfinite_past_participle', 'nonfinite_present_participle',
];
const MIN_VERBS = 1800;

// [base, past, past participle, -ing, 3sg]
const GOLD = [
  // consonant doubling only on a stressed final syllable
  ['stop', 'stopped', 'stopped', 'stopping', 'stops'],
  ['plan', 'planned', 'planned', 'planning', 'plans'],
  ['admit', 'admitted', 'admitted', 'admitting', 'admits'],
  ['prefer', 'preferred', 'preferred', 'preferring', 'prefers'],
  ['occur', 'occurred', 'occurred', 'occurring', 'occurs'],
  ['commit', 'committed', 'committed', 'committing', 'commits'],
  ['refer', 'referred', 'referred', 'referring', 'refers'],
  ['control', 'controlled', 'controlled', 'controlling', 'controls'],
  ['visit', 'visited', 'visited', 'visiting', 'visits'],
  ['remember', 'remembered', 'remembered', 'remembering', 'remembers'],
  ['happen', 'happened', 'happened', 'happening', 'happens'],
  ['listen', 'listened', 'listened', 'listening', 'listens'],
  ['consider', 'considered', 'considered', 'considering', 'considers'],
  ['offer', 'offered', 'offered', 'offering', 'offers'],
  ['open', 'opened', 'opened', 'opening', 'opens'],
  ['develop', 'developed', 'developed', 'developing', 'develops'],
  ['edit', 'edited', 'edited', 'editing', 'edits'],
  ['limit', 'limited', 'limited', 'limiting', 'limits'],
  ['suffer', 'suffered', 'suffered', 'suffering', 'suffers'],
  ['deliver', 'delivered', 'delivered', 'delivering', 'delivers'],
  ['enter', 'entered', 'entered', 'entering', 'enters'],
  ['answer', 'answered', 'answered', 'answering', 'answers'],
  ['focus', 'focused', 'focused', 'focusing', 'focuses'],
  ['benefit', 'benefited', 'benefited', 'benefiting', 'benefits'],
  ['fix', 'fixed', 'fixed', 'fixing', 'fixes'],
  ['show', 'showed', 'shown', 'showing', 'shows'],
  // -y / -ie / -ee / -e
  ['try', 'tried', 'tried', 'trying', 'tries'],
  ['carry', 'carried', 'carried', 'carrying', 'carries'],
  ['play', 'played', 'played', 'playing', 'plays'],
  ['enjoy', 'enjoyed', 'enjoyed', 'enjoying', 'enjoys'],
  ['die', 'died', 'died', 'dying', 'dies'],
  ['tie', 'tied', 'tied', 'tying', 'ties'],
  ['agree', 'agreed', 'agreed', 'agreeing', 'agrees'],
  ['free', 'freed', 'freed', 'freeing', 'frees'],
  ['make', 'made', 'made', 'making', 'makes'],
  ['move', 'moved', 'moved', 'moving', 'moves'],
  ['create', 'created', 'created', 'creating', 'creates'],
  // -c -> -ck
  ['panic', 'panicked', 'panicked', 'panicking', 'panics'],
  // sibilants / -o
  ['watch', 'watched', 'watched', 'watching', 'watches'],
  ['push', 'pushed', 'pushed', 'pushing', 'pushes'],
  ['pass', 'passed', 'passed', 'passing', 'passes'],
  ['go', 'went', 'gone', 'going', 'goes'],
  ['do', 'did', 'done', 'doing', 'does'],
  ['have', 'had', 'had', 'having', 'has'],
  // irregular, including forms the old table lacked
  ['split', 'split', 'split', 'splitting', 'splits'],
  ['spin', 'spun', 'spun', 'spinning', 'spins'],
  ['upset', 'upset', 'upset', 'upsetting', 'upsets'],
  ['shed', 'shed', 'shed', 'shedding', 'sheds'],
  ['begin', 'began', 'begun', 'beginning', 'begins'],
  ['swim', 'swam', 'swum', 'swimming', 'swims'],
  ['run', 'ran', 'run', 'running', 'runs'],
  ['put', 'put', 'put', 'putting', 'puts'],
  ['cut', 'cut', 'cut', 'cutting', 'cuts'],
  ['let', 'let', 'let', 'letting', 'lets'],
  ['set', 'set', 'set', 'setting', 'sets'],
  ['get', 'got', 'gotten', 'getting', 'gets'],
  ['forget', 'forgot', 'forgotten', 'forgetting', 'forgets'],
  ['write', 'wrote', 'written', 'writing', 'writes'],
  ['ride', 'rode', 'ridden', 'riding', 'rides'],
  ['choose', 'chose', 'chosen', 'choosing', 'chooses'],
  ['lie', 'lay', 'lain', 'lying', 'lies'],
  ['lay', 'laid', 'laid', 'laying', 'lays'],
  ['pay', 'paid', 'paid', 'paying', 'pays'],
  ['say', 'said', 'said', 'saying', 'says'],
  ['become', 'became', 'become', 'becoming', 'becomes'],
  ['understand', 'understood', 'understood', 'understanding', 'understands'],
  ['undergo', 'underwent', 'undergone', 'undergoing', 'undergoes'],
  ['overcome', 'overcame', 'overcome', 'overcoming', 'overcomes'],
  ['withdraw', 'withdrew', 'withdrawn', 'withdrawing', 'withdraws'],
  ['mislead', 'misled', 'misled', 'misleading', 'misleads'],
  ['seek', 'sought', 'sought', 'seeking', 'seeks'],
  ['quit', 'quit', 'quit', 'quitting', 'quits'],
];

// Headwords that must NOT appear: inflected forms, nouns, modals, profanity.
const FORBIDDEN_HEADWORDS = [
  'offered', 'discovered', 'mixed', 'elected', 'invested', 'tweeted', 'comes',
  'does', 'law', 'super', 'inter', 'backup',
  'can', 'must', 'will', 'shit', 'fuck',
];

const failures = [];
const fail = (msg) => failures.push(msg);

function load() {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(DATA_PATH, 'utf8') +
    `\n;this.__data = typeof ${GLOBAL_NAME} !== 'undefined' ? ${GLOBAL_NAME} : undefined;`, ctx);
  return ctx.__data;
}

const data = load();
if (!Array.isArray(data)) {
  console.error(`FAIL: ${GLOBAL_NAME} is not an array`);
  process.exit(1);
}
if (data.length < MIN_VERBS) fail(`only ${data.length} verbs (< ${MIN_VERBS})`);

const byBase = new Map();
data.forEach((entry, i) => {
  const where = `#${i} ${entry && entry.infinitive}`;
  if (!entry || !/^[a-z]+$/.test(entry.infinitive || '')) return fail(`${where}: bad infinitive`);
  if (byBase.has(entry.infinitive)) fail(`${where}: duplicate headword`);
  byBase.set(entry.infinitive, entry);
  if (entry.rank !== i + 1) fail(`${where}: rank ${entry.rank} != ${i + 1}`);
  if (entry.english !== `to ${entry.infinitive}`) fail(`${where}: english field`);
  if (!/[一-鿿]/.test(entry.chinese || '')) fail(`${where}: missing Chinese gloss`);
  if (/过去式|过去分词|第三人称/.test(entry.chinese)) fail(`${where}: gloss is an inflection note`);
  const tenses = entry.tenses || {};
  TENSES.forEach((key) => {
    const t = tenses[key];
    if (!t) return fail(`${where}: missing tense ${key}`);
    if (t.type === 'person') {
      PERSONS.forEach((p) => {
        if (!/^[a-z]+( [a-z]+)*$/.test((t.forms || {})[p] || '')) fail(`${where}: ${key}.${p} = ${JSON.stringify((t.forms || {})[p])}`);
      });
    } else if (t.type === 'single') {
      if (!Array.isArray(t.forms) || !/^[a-z]+$/.test(t.forms[0] || '')) fail(`${where}: ${key} single form`);
    } else {
      fail(`${where}: ${key} has unknown type ${t.type}`);
    }
  });
  // A doubled final consonant before -ed on a multi-syllable stem ending in an
  // unstressed -er/-en/-on/-it is the old builder's signature bug.
  const past = tenses.nonfinite_past && tenses.nonfinite_past.forms[0];
  if (past && /(er|en|on)(r|n)\1?ed$/.test(past) && /(?:er|en|on)$/.test(entry.infinitive) &&
      entry.infinitive.length > 5 && !['prefer', 'refer', 'confer', 'defer', 'infer', 'transfer', 'deter'].some((w) => entry.infinitive.endsWith(w))) {
    fail(`${where}: suspicious doubling ${past}`);
  }
});

GOLD.forEach(([base, past, pp, ing, third]) => {
  const entry = byBase.get(base);
  if (!entry) return fail(`gold verb missing: ${base}`);
  const t = entry.tenses;
  const got = [
    t.nonfinite_past.forms[0],
    t.nonfinite_past_participle.forms[0],
    t.nonfinite_present_participle.forms[0],
    base === 'be' ? 'is' : t.indicative_present_simple.forms.he_she_it,
  ];
  const want = [past, pp, ing, third];
  if (got.join('|') !== want.join('|')) fail(`gold ${base}: got ${got.join('/')} want ${want.join('/')}`);
  if (t.indicative_present_perfect.forms.he_she_it !== `has ${pp}`) fail(`gold ${base}: present perfect`);
  if (t.indicative_past_continuous.forms.we !== `were ${ing}`) fail(`gold ${base}: past continuous`);
});

const be = byBase.get('be');
if (!be) fail('be missing');
else {
  const f = be.tenses.indicative_present_simple.forms;
  if ([f.i, f.you, f.he_she_it].join() !== 'am,are,is') fail('be present simple');
  if (be.tenses.indicative_past_simple.forms.they !== 'were') fail('be past simple');
}

FORBIDDEN_HEADWORDS.forEach((w) => { if (byBase.has(w)) fail(`forbidden headword present: ${w}`); });

if (failures.length) {
  failures.slice(0, 60).forEach((m) => console.error('FAIL: ' + m));
  if (failures.length > 60) console.error(`... and ${failures.length - 60} more`);
  process.exit(1);
}
console.log(`OK: ${data.length} English verbs, ${GOLD.length} gold verbs, all ${TENSES.length} tenses present`);
