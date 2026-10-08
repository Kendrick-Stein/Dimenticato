#!/usr/bin/env node
/*
 * Validator for data/french-conjugations.js.
 *
 * Run:  node scripts/validate_french_conjugations.js [path]
 * Exits non-zero as soon as any assertion fails, printing every failure.
 *
 * It checks three separate things:
 *   1. the file loads as a browser <script> would and registers
 *      DIM_DATA.conjugations.fr (conjugations/1, read back into the per-verb
 *      legacy view by conjugations_node.js);
 *   2. the schema is complete and free of placeholder / artefact strings;
 *   3. a hand-verified gold set of 62 verbs (every named irregular plus one
 *      representative of every stem-alternation class) conjugates correctly,
 *      including the -ger/-cer imperfect+subjunctive regression.
 */
'use strict';

const path = require('path');
const { loadConjugations, toLegacy } = require('./conjugations_node');

const DATA_PATH = process.argv[2] ||
  path.join(__dirname, '..', 'data', 'french-conjugations.js');

const PERSONS = ['je', 'tu', 'il_elle_on', 'nous', 'vous', 'ils_elles'];
const IMPERATIVE_PERSONS = ['tu', 'nous', 'vous'];
const CANONICAL_TENSES = [
  'indicatif_present', 'indicatif_imparfait', 'indicatif_passe_simple',
  'indicatif_futur_simple', 'indicatif_passe_compose',
  'indicatif_plus_que_parfait', 'indicatif_passe_anterieur',
  'indicatif_futur_anterieur', 'conditionnel_present', 'conditionnel_passe',
  'subjonctif_present', 'subjonctif_imparfait', 'subjonctif_passe',
  'subjonctif_plus_que_parfait', 'imperatif_present', 'imperatif_passe',
  'participe_present', 'participe_passe', 'infinitif_present',
  'infinitif_passe',
];
const COMPOUND_TENSES = [
  'indicatif_passe_compose', 'indicatif_plus_que_parfait',
  'indicatif_passe_anterieur', 'indicatif_futur_anterieur',
  'conditionnel_passe', 'subjonctif_passe', 'subjonctif_plus_que_parfait',
  'imperatif_passe',
];
const SIMPLE_PERSON_TENSES = [
  'indicatif_present', 'indicatif_imparfait', 'indicatif_passe_simple',
  'indicatif_futur_simple', 'conditionnel_present', 'subjonctif_present',
  'subjonctif_imparfait',
];

const MIN_VERBS = 1800;
const MIN_FORMS = 150000;

const PLACEHOLDER = /^(\?+|todo|n\/?a|null|none|nan|undefined|-+|\(n\)|tbd|xxx)$/i;
const MOJIBAKE = /[�]|Ã[\x80-\xBF]|â€|Â[\x80-\xBF]/;
const CJK = /[一-鿿]/;
const LATIN_LETTER = /[a-zà-ÿœæ]/i;
// A stem accidentally glued to itself ("fairefaire", "assisassis").  Four
// characters is the shortest window with no false positives in real French
// verb forms ("chercher" repeats "cher", "murmurer" repeats "mur").
const DOUBLED_STEM = /(.{5,})\1/;
// A derivational prefix emitted twice ("rerefaire") - the classic failure mode
// of building "refaire" from the "faire" paradigm.
const PREFIXES = ['re', 'ré', 'dé', 'des', 'pré', 'sur', 'sous', 'entre',
  'contre', 'en', 'em', 'in', 'im', 'mal', 'mé', 'par', 'pour', 'trans'];
const DOUBLED_PREFIX = new RegExp('^(' + PREFIXES.join('|') + ')\\1', 'i');
const REFLEXIVE_LEAD = /^(?:m'|t'|s'|me |te |se |nous |vous )/;

const errors = [];
let checks = 0;

function fail(msg) { errors.push(msg); }
function check(cond, msg) { checks++; if (!cond) fail(msg); }

/* ---------------------------------------------------------------- load --- */

// conjugations/1 omits empty fields; the legacy view restores the four
// participle agreement slots as '' so the agreement checks below stay strict.
const data = toLegacy(loadConjugations('fr', DATA_PATH), PERSONS, { omitted: 'empty' })
  .map((verb) => ({ ...verb, participle: { ms: '', fs: '', mp: '', fp: '', ...(verb.participle || {}) } }));
check(data.length >= MIN_VERBS,
  `only ${data.length} verbs, expected at least ${MIN_VERBS}`);

/* -------------------------------------------------------------- schema --- */

function badString(value) {
  if (typeof value !== 'string') return 'not a string';
  const v = value.trim();
  if (!v) return 'empty';
  if (PLACEHOLDER.test(v)) return `placeholder "${v}"`;
  if (MOJIBAKE.test(v)) return `mojibake "${v}"`;
  if (/(.{3,}?)\1{2,}/.test(v)) return `degenerate repetition "${v}"`;
  return null;
}

const seenInfinitives = new Map();
let totalForms = 0;
let rankDiffersFromCorpusRank = 0;
const auxForms = new Set();
const auxFormsBy = { avoir: new Set(), 'être': new Set() };

// Collect every inflected form of avoir/être so compound tenses can be
// verified against the dataset's own auxiliary paradigms.
for (const verb of data) {
  if (verb.infinitive !== 'avoir' && verb.infinitive !== 'être') continue;
  for (const key of SIMPLE_PERSON_TENSES.concat(['imperatif_present'])) {
    const tense = verb.tenses[key];
    if (!tense) continue;
    for (const raw of Object.values(tense.forms)) {
      for (const alt of String(raw).split('/')) {
        if (alt) {
          auxForms.add(alt.trim());
          auxFormsBy[verb.infinitive].add(alt.trim());
        }
      }
    }
  }
}
check(auxForms.size > 60,
  `expected the avoir/être paradigms to yield many forms, got ${auxForms.size}`);
check(auxFormsBy.avoir.size > 30 && auxFormsBy['être'].size > 30,
  'expected both auxiliary paradigms to be populated');

for (const verb of data) {
  const id = verb && verb.infinitive ? verb.infinitive : JSON.stringify(verb);

  for (const field of ['rank', 'infinitive', 'freq', 'corpusRank',
    'english', 'chinese', 'model', 'auxiliary', 'participle', 'tenses']) {
    check(Object.prototype.hasOwnProperty.call(verb, field),
      `${id}: missing required field "${field}"`);
  }

  check(!seenInfinitives.has(verb.infinitive),
    `${id}: duplicate infinitive (also at rank ${seenInfinitives.get(verb.infinitive)})`);
  seenInfinitives.set(verb.infinitive, verb.rank);

  check(!badString(verb.infinitive), `${id}: bad infinitive`);
  check(LATIN_LETTER.test(verb.infinitive), `${id}: infinitive has no letters`);

  const enBad = badString(verb.english);
  check(!enBad, `${id}: english gloss ${enBad}`);
  check(verb.english.trim().toLowerCase() !== verb.infinitive.toLowerCase(),
    `${id}: english gloss is the headword itself`);
  check(!CJK.test(verb.english), `${id}: english gloss contains Chinese`);
  check(verb.english.length <= 90, `${id}: english gloss too long`);

  const zhBad = badString(verb.chinese);
  check(!zhBad, `${id}: chinese gloss ${zhBad}`);
  check(CJK.test(verb.chinese), `${id}: chinese gloss has no CJK characters`);

  check(verb.reflexive === undefined || verb.reflexive === true,
    `${id}: reflexive must be true or absent`);
  check(verb.auxiliary === 'avoir' || verb.auxiliary === 'être',
    `${id}: unexpected auxiliary "${verb.auxiliary}"`);
  check(!verb.reflexive || verb.auxiliary === 'être',
    `${id}: pronominal verb must take être`);

  check(verb.freq === null || (typeof verb.freq === 'number' && verb.freq > 0),
    `${id}: freq must be null or a positive number, got ${verb.freq}`);
  check(Number.isInteger(verb.corpusRank) && verb.corpusRank >= 1,
    `${id}: corpusRank must be a positive integer, got ${verb.corpusRank}`);
  if (verb.corpusRank !== verb.rank) rankDiffersFromCorpusRank++;

  check(!badString(verb.model), `${id}: missing model paradigm`);

  check(verb.participle && typeof verb.participle === 'object',
    `${id}: participle must be an object`);
  for (const slot of ['ms', 'fs', 'mp', 'fp']) {
    check(typeof verb.participle[slot] === 'string',
      `${id}: participle.${slot} must be a string`);
  }

  /* ------------------------------------------------------------ tenses -- */

  check(verb.tenses && typeof verb.tenses === 'object',
    `${id}: tenses must be an object`);
  const declared = Object.keys(verb.tenses);
  check(declared.length >= 3, `${id}: only ${declared.length} tense groups`);

  const missing = CANONICAL_TENSES.filter((k) => !(k in verb.tenses));
  const defective = verb.defective || [];
  check(JSON.stringify(missing) === JSON.stringify(defective),
    `${id}: missing tenses ${JSON.stringify(missing)} but "defective" says ` +
    `${JSON.stringify(defective)}`);
  for (const key of declared) {
    check(CANONICAL_TENSES.indexOf(key) !== -1,
      `${id}: unknown tense key "${key}"`);
  }

  const gaps = verb.gaps || {};
  let finiteTenses = 0;

  for (const [key, tense] of Object.entries(verb.tenses)) {
    check(tense.type === 'person' || tense.type === 'single',
      `${id}/${key}: bad type "${tense.type}"`);
    check(!badString(tense.group_label), `${id}/${key}: bad group_label`);
    check(!badString(tense.tense_label), `${id}/${key}: bad tense_label`);

    let values;
    if (tense.type === 'person') {
      finiteTenses++;
      check(!Array.isArray(tense.forms) && tense.forms && typeof tense.forms === 'object',
        `${id}/${key}: person tense needs a forms object`);
      check(JSON.stringify(Object.keys(tense.forms)) === JSON.stringify(PERSONS),
        `${id}/${key}: person keys are ${JSON.stringify(Object.keys(tense.forms))}`);
      const filled = PERSONS.filter((p) => tense.forms[p]);
      check(filled.length > 0, `${id}/${key}: every person slot is empty`);

      const structural = key.startsWith('imperatif') ? IMPERATIVE_PERSONS : PERSONS;
      const declaredGaps = gaps[key] || [];
      const allowed = structural.filter((p) => declaredGaps.indexOf(p) === -1);
      check(allowed.length > 0, `${id}/${key}: every allowed person is declared a gap`);
      for (const p of filled) {
        check(allowed.indexOf(p) !== -1,
          `${id}/${key}: person "${p}" is filled but declared a gap / not allowed`);
      }
      for (const p of allowed) {
        check(!!tense.forms[p],
          `${id}/${key}: person "${p}" is empty but is not declared in "gaps"`);
      }
      for (const p of declaredGaps) {
        check(structural.indexOf(p) !== -1,
          `${id}/${key}: gap lists "${p}", which has no slot in this mood`);
      }
      values = filled.map((p) => tense.forms[p]);
    } else {
      check(Array.isArray(tense.forms) && tense.forms.length > 0,
        `${id}/${key}: single tense needs a non-empty forms array`);
      values = Array.isArray(tense.forms) ? tense.forms : [];
    }

    for (const value of values) {
      const bad = badString(value);
      check(!bad, `${id}/${key}: form ${bad}`);
      if (typeof value !== 'string') continue;
      totalForms += value.split('/').length;
      for (const alt of value.split('/')) {
        const form = alt.trim();
        check(!!form, `${id}/${key}: empty alternative inside "${value}"`);
        check(!PLACEHOLDER.test(form), `${id}/${key}: placeholder alternative "${form}"`);
        check(!DOUBLED_STEM.test(form),
          `${id}/${key}: doubled-stem artefact in "${form}"`);
        check(DOUBLED_PREFIX.test(form) === DOUBLED_PREFIX.test(verb.infinitive),
          `${id}/${key}: doubled-prefix artefact in "${form}"`);
        const words = form.replace(REFLEXIVE_LEAD, '').split(/\s+/);
        check(!words.some((w, i) => i > 0 && w === words[i - 1]),
          `${id}/${key}: repeated word in "${form}"`);
        check(!/^j'/i.test(form),
          `${id}/${key}: subject-pronoun elision baked into the data ("${form}")`);
        check(!/^(je|tu|il|elle|on|ils|elles|que)\s/i.test(form),
          `${id}/${key}: subject pronoun baked into the data ("${form}")`);
      }
    }

    // Simple tenses are one word (a pronominal verb carries its own pronoun).
    if (SIMPLE_PERSON_TENSES.indexOf(key) !== -1) {
      for (const value of values) {
        for (const alt of value.split('/')) {
          const bare = verb.reflexive ? alt.trim().replace(REFLEXIVE_LEAD, '') : alt.trim();
          check(bare.indexOf(' ') === -1,
            `${id}/${key}: simple tense form "${alt}" is not a single word`);
        }
      }
    }

    // Compound tenses must ship the auxiliary, not a bare participle.
    const allowedAux = [verb.auxiliary].concat(verb.auxiliaryAlt ? [verb.auxiliaryAlt] : []);
    if (COMPOUND_TENSES.indexOf(key) !== -1 && tense.type === 'person') {
      for (const value of values) {
        for (const alt of value.split('/')) {
          const bare = alt.trim().replace(REFLEXIVE_LEAD, '');
          const words = bare.split(/\s+/);
          check(words.length >= 2,
            `${id}/${key}: compound form "${alt}" has no auxiliary`);
          check(auxForms.has(words[0]),
            `${id}/${key}: "${alt}" does not start with a form of avoir/être`);
          // ... and it must be a form of the auxiliary this verb declares
          check(allowedAux.some((a) => auxFormsBy[a].has(words[0])),
            `${id}/${key}: "${alt}" uses an auxiliary other than the declared ` +
            `"${allowedAux.join('/')}"`);
          check(words[words.length - 1] === verb.participle.ms ||
            [verb.participle.fs, verb.participle.mp, verb.participle.fp]
              .indexOf(words[words.length - 1]) !== -1,
            `${id}/${key}: "${alt}" does not end with a past participle of the verb`);
        }
      }
    }

    if (key === 'infinitif_present') {
      check(tense.forms[0] === verb.infinitive,
        `${id}: infinitif_present "${tense.forms[0]}" != infinitive`);
    }
  }

  check(finiteTenses >= 1, `${id}: no finite (person) tense at all`);

  if (!verb.defective || verb.defective.indexOf('participe_passe') === -1) {
    check(!!verb.participle.ms, `${id}: no masculine-singular past participle`);
  }
}

/* ------------------------------------------------------- global checks --- */

check(totalForms >= MIN_FORMS,
  `only ${totalForms} conjugated forms, expected at least ${MIN_FORMS}`);
check(rankDiffersFromCorpusRank > 100,
  'rank and corpusRank are identical everywhere - rank is not a real corpus rank');

for (let i = 0; i < data.length; i++) {
  check(data[i].rank === i + 1,
    `rank ${data[i].rank} at index ${i}: ranks must be contiguous from 1`);
}

// The -ger / -cer bug: the old generator produced "mangeions", "commençions".
const NEVER = [/geions/, /geiez/, /çions/, /çiez/, /çies\b/, /\bNone\b/, /\bnull\b/,
  /\bundefined\b/];
const flat = JSON.stringify(data.map(({ freq, ...rest }) => rest)); // freq: null is legitimate
for (const re of NEVER) {
  check(!re.test(flat), `dataset contains a forbidden pattern ${re}`);
}

/* ----------------------------------------------------------- gold set --- */

// Hand-verified against Bescherelle / Le Robert conjugation tables.
// "person tense": expected form must be one of the "/"-separated alternatives.
// "single tense": expected form must be one of the listed forms.
const GOLD = {
  'être': {
    indicatif_present: { je: 'suis', tu: 'es', il_elle_on: 'est', nous: 'sommes', vous: 'êtes', ils_elles: 'sont' },
    indicatif_imparfait: { je: 'étais', nous: 'étions' },
    indicatif_passe_simple: { je: 'fus', il_elle_on: 'fut', ils_elles: 'furent' },
    indicatif_futur_simple: { je: 'serai', ils_elles: 'seront' },
    conditionnel_present: { je: 'serais', nous: 'serions' },
    subjonctif_present: { je: 'sois', nous: 'soyons', ils_elles: 'soient' },
    subjonctif_imparfait: { je: 'fusse', il_elle_on: 'fût' },
    indicatif_passe_compose: { je: 'ai été', ils_elles: 'ont été' },
    imperatif_present: { tu: 'sois', nous: 'soyons', vous: 'soyez' },
    participe_present: ['étant'], participe_passe: ['été'],
    infinitif_passe: ['avoir été'],
  },
  'avoir': {
    indicatif_present: { je: 'ai', tu: 'as', il_elle_on: 'a', nous: 'avons', vous: 'avez', ils_elles: 'ont' },
    indicatif_imparfait: { je: 'avais', nous: 'avions' },
    indicatif_passe_simple: { je: 'eus', il_elle_on: 'eut', nous: 'eûmes' },
    indicatif_futur_simple: { je: 'aurai', ils_elles: 'auront' },
    subjonctif_present: { je: 'aie', il_elle_on: 'ait', nous: 'ayons', ils_elles: 'aient' },
    subjonctif_imparfait: { je: 'eusse', il_elle_on: 'eût' },
    imperatif_present: { tu: 'aie', nous: 'ayons', vous: 'ayez' },
    participe_present: ['ayant'], participe_passe: ['eu'],
  },
  'aller': {
    indicatif_present: { je: 'vais', tu: 'vas', il_elle_on: 'va', nous: 'allons', vous: 'allez', ils_elles: 'vont' },
    indicatif_passe_simple: { je: 'allai', ils_elles: 'allèrent' },
    indicatif_futur_simple: { je: 'irai', nous: 'irons' },
    subjonctif_present: { je: 'aille', nous: 'allions', ils_elles: 'aillent' },
    indicatif_passe_compose: { je: 'suis allé', nous: 'sommes allés' },
    imperatif_present: { tu: 'va', nous: 'allons' },
    participe_passe: ['allé', 'allée', 'allés', 'allées'],
    infinitif_passe: ['être allé'],
  },
  'faire': {
    indicatif_present: { je: 'fais', il_elle_on: 'fait', nous: 'faisons', vous: 'faites', ils_elles: 'font' },
    indicatif_imparfait: { je: 'faisais', nous: 'faisions' },
    indicatif_passe_simple: { je: 'fis', nous: 'fîmes', ils_elles: 'firent' },
    indicatif_futur_simple: { je: 'ferai' },
    subjonctif_present: { je: 'fasse', nous: 'fassions' },
    participe_passe: ['fait'],
  },
  'pouvoir': {
    indicatif_present: { je: 'peux', il_elle_on: 'peut', nous: 'pouvons', ils_elles: 'peuvent' },
    indicatif_passe_simple: { je: 'pus', il_elle_on: 'put' },
    indicatif_futur_simple: { je: 'pourrai' },
    subjonctif_present: { je: 'puisse', nous: 'puissions' },
    participe_passe: ['pu'],
  },
  'vouloir': {
    indicatif_present: { je: 'veux', il_elle_on: 'veut', nous: 'voulons', ils_elles: 'veulent' },
    indicatif_passe_simple: { je: 'voulus', il_elle_on: 'voulut' },
    indicatif_futur_simple: { je: 'voudrai' },
    subjonctif_present: { je: 'veuille', nous: 'voulions' },
    imperatif_present: { tu: 'veuille', vous: 'veuillez' },
    participe_passe: ['voulu'],
  },
  'devoir': {
    indicatif_present: { je: 'dois', nous: 'devons', ils_elles: 'doivent' },
    indicatif_passe_simple: { je: 'dus', il_elle_on: 'dut' },
    indicatif_futur_simple: { je: 'devrai' },
    subjonctif_present: { je: 'doive', nous: 'devions' },
    participe_passe: ['dû', 'due'],
  },
  'savoir': {
    indicatif_present: { je: 'sais', nous: 'savons', ils_elles: 'savent' },
    indicatif_passe_simple: { je: 'sus', il_elle_on: 'sut' },
    indicatif_futur_simple: { je: 'saurai' },
    subjonctif_present: { je: 'sache', nous: 'sachions' },
    imperatif_present: { tu: 'sache', vous: 'sachez' },
    participe_present: ['sachant'], participe_passe: ['su'],
  },
  'venir': {
    indicatif_present: { je: 'viens', il_elle_on: 'vient', nous: 'venons', ils_elles: 'viennent' },
    indicatif_passe_simple: { je: 'vins', il_elle_on: 'vint', ils_elles: 'vinrent' },
    indicatif_futur_simple: { je: 'viendrai' },
    subjonctif_present: { je: 'vienne', nous: 'venions' },
    indicatif_passe_compose: { je: 'suis venu', ils_elles: 'sont venus' },
    participe_passe: ['venu'],
  },
  'tenir': {
    indicatif_present: { je: 'tiens', nous: 'tenons', ils_elles: 'tiennent' },
    indicatif_passe_simple: { je: 'tins', il_elle_on: 'tint' },
    indicatif_futur_simple: { je: 'tiendrai' },
    indicatif_passe_compose: { je: 'ai tenu' },
    participe_passe: ['tenu'],
  },
  'prendre': {
    indicatif_present: { je: 'prends', il_elle_on: 'prend', nous: 'prenons', ils_elles: 'prennent' },
    indicatif_passe_simple: { je: 'pris', il_elle_on: 'prit' },
    subjonctif_present: { je: 'prenne', nous: 'prenions' },
    participe_passe: ['pris', 'prise'],
  },
  'mettre': {
    indicatif_present: { je: 'mets', il_elle_on: 'met', nous: 'mettons' },
    indicatif_passe_simple: { je: 'mis', il_elle_on: 'mit' },
    participe_passe: ['mis', 'mise'],
  },
  'voir': {
    indicatif_present: { je: 'vois', nous: 'voyons', ils_elles: 'voient' },
    indicatif_imparfait: { nous: 'voyions' },
    indicatif_passe_simple: { je: 'vis', il_elle_on: 'vit' },
    indicatif_futur_simple: { je: 'verrai' },
    subjonctif_present: { je: 'voie', nous: 'voyions' },
    participe_passe: ['vu'],
  },
  'dire': {
    indicatif_present: { je: 'dis', il_elle_on: 'dit', nous: 'disons', vous: 'dites', ils_elles: 'disent' },
    indicatif_passe_simple: { je: 'dis', ils_elles: 'dirent' },
    imperatif_present: { vous: 'dites' },
    participe_passe: ['dit'],
  },
  'écrire': {
    indicatif_present: { je: 'écris', nous: 'écrivons' },
    indicatif_passe_simple: { je: 'écrivis' },
    participe_passe: ['écrit'],
  },
  'boire': {
    indicatif_present: { je: 'bois', nous: 'buvons', ils_elles: 'boivent' },
    indicatif_passe_simple: { je: 'bus', il_elle_on: 'but' },
    subjonctif_present: { je: 'boive', nous: 'buvions' },
    participe_passe: ['bu'],
  },
  'croire': {
    indicatif_present: { je: 'crois', nous: 'croyons', ils_elles: 'croient' },
    indicatif_passe_simple: { je: 'crus', il_elle_on: 'crut' },
    subjonctif_present: { je: 'croie', nous: 'croyions' },
    participe_passe: ['cru'],
  },
  'vivre': {
    indicatif_present: { je: 'vis', nous: 'vivons' },
    indicatif_passe_simple: { je: 'vécus', il_elle_on: 'vécut' },
    participe_passe: ['vécu'],
  },
  'suivre': {
    indicatif_present: { je: 'suis', il_elle_on: 'suit', nous: 'suivons' },
    indicatif_passe_simple: { je: 'suivis' },
    participe_passe: ['suivi'],
  },
  'naître': {
    indicatif_present: { je: 'nais', il_elle_on: 'naît', nous: 'naissons' },
    indicatif_passe_simple: { je: 'naquis', il_elle_on: 'naquit' },
    indicatif_passe_compose: { je: 'suis né' },
    participe_passe: ['né'],
  },
  'mourir': {
    indicatif_present: { je: 'meurs', il_elle_on: 'meurt', nous: 'mourons', ils_elles: 'meurent' },
    indicatif_passe_simple: { je: 'mourus' },
    indicatif_futur_simple: { je: 'mourrai' },
    indicatif_passe_compose: { je: 'suis mort' },
    participe_passe: ['mort'],
  },
  'valoir': {
    indicatif_present: { je: 'vaux', il_elle_on: 'vaut', nous: 'valons' },
    indicatif_futur_simple: { je: 'vaudrai' },
    subjonctif_present: { je: 'vaille', nous: 'valions' },
    participe_passe: ['valu'],
  },
  'falloir': {
    indicatif_present: { il_elle_on: 'faut' },
    indicatif_imparfait: { il_elle_on: 'fallait' },
    indicatif_passe_simple: { il_elle_on: 'fallut' },
    indicatif_futur_simple: { il_elle_on: 'faudra' },
    subjonctif_present: { il_elle_on: 'faille' },
    indicatif_passe_compose: { il_elle_on: 'a fallu' },
    participe_passe: ['fallu'],
  },
  'pleuvoir': {
    indicatif_present: { il_elle_on: 'pleut' },
    indicatif_imparfait: { il_elle_on: 'pleuvait' },
    indicatif_futur_simple: { il_elle_on: 'pleuvra' },
    subjonctif_present: { il_elle_on: 'pleuve' },
    participe_present: ['pleuvant'], participe_passe: ['plu'],
  },
  'neiger': {
    indicatif_present: { il_elle_on: 'neige' },
    indicatif_imparfait: { il_elle_on: 'neigeait' },
    indicatif_passe_compose: { il_elle_on: 'a neigé' },
    participe_passe: ['neigé'],
  },
  'acquérir': {
    indicatif_present: { je: 'acquiers', il_elle_on: 'acquiert', nous: 'acquérons', ils_elles: 'acquièrent' },
    indicatif_passe_simple: { je: 'acquis' },
    indicatif_futur_simple: { je: 'acquerrai' },
    subjonctif_present: { je: 'acquière', nous: 'acquérions' },
    participe_passe: ['acquis'],
  },
  'coudre': {
    indicatif_present: { je: 'couds', il_elle_on: 'coud', nous: 'cousons' },
    indicatif_passe_simple: { je: 'cousis' },
    participe_present: ['cousant'], participe_passe: ['cousu'],
  },
  'moudre': {
    indicatif_present: { je: 'mouds', il_elle_on: 'moud', nous: 'moulons' },
    indicatif_passe_simple: { je: 'moulus' },
    participe_present: ['moulant'], participe_passe: ['moulu'],
  },
  'résoudre': {
    indicatif_present: { je: 'résous', il_elle_on: 'résout', nous: 'résolvons' },
    indicatif_passe_simple: { je: 'résolus' },
    participe_present: ['résolvant'], participe_passe: ['résolu'],
  },
  'vaincre': {
    indicatif_present: { je: 'vaincs', il_elle_on: 'vainc', nous: 'vainquons' },
    indicatif_passe_simple: { je: 'vainquis' },
    participe_present: ['vainquant'], participe_passe: ['vaincu'],
  },
  'asseoir': {
    indicatif_present: { je: 'assieds', nous: 'asseyons' },
    indicatif_futur_simple: { je: 'assiérai' },
    participe_present: ['asseyant'], participe_passe: ['assis'],
  },
  'manger': {
    indicatif_present: { nous: 'mangeons', je: 'mange' },
    indicatif_imparfait: { je: 'mangeais', nous: 'mangions', vous: 'mangiez', ils_elles: 'mangeaient' },
    indicatif_passe_simple: { je: 'mangeai', ils_elles: 'mangèrent' },
    subjonctif_present: { nous: 'mangions', vous: 'mangiez' },
    participe_present: ['mangeant'], participe_passe: ['mangé'],
  },
  'commencer': {
    indicatif_present: { nous: 'commençons' },
    indicatif_imparfait: { je: 'commençais', nous: 'commencions', vous: 'commenciez' },
    indicatif_passe_simple: { je: 'commençai' },
    subjonctif_present: { nous: 'commencions', vous: 'commenciez' },
    participe_present: ['commençant'],
  },
  'appeler': {
    indicatif_present: { je: 'appelle', nous: 'appelons', ils_elles: 'appellent' },
    indicatif_futur_simple: { je: 'appellerai' },
  },
  'jeter': {
    indicatif_present: { je: 'jette', nous: 'jetons' },
    indicatif_futur_simple: { je: 'jetterai' },
  },
  'acheter': {
    indicatif_present: { je: 'achète', nous: 'achetons' },
    indicatif_futur_simple: { je: 'achèterai' },
  },
  'préférer': {
    indicatif_present: { je: 'préfère', nous: 'préférons', ils_elles: 'préfèrent' },
    indicatif_futur_simple: { je: 'préférerai' },
  },
  'payer': {
    indicatif_present: { je: 'paie', nous: 'payons' },
    indicatif_futur_simple: { je: 'paierai' },
  },
  'essayer': {
    indicatif_present: { je: 'essaie', nous: 'essayons' },
    indicatif_futur_simple: { je: 'essaierai' },
  },
  'envoyer': {
    indicatif_present: { je: 'envoie', nous: 'envoyons' },
    indicatif_futur_simple: { je: 'enverrai' },
  },
  'nettoyer': {
    indicatif_present: { je: 'nettoie', nous: 'nettoyons' },
    indicatif_futur_simple: { je: 'nettoierai' },
  },
  'finir': {
    indicatif_present: { je: 'finis', nous: 'finissons' },
    indicatif_passe_simple: { je: 'finis', ils_elles: 'finirent' },
    subjonctif_present: { je: 'finisse' },
    participe_present: ['finissant'], participe_passe: ['fini'],
  },
  'partir': {
    indicatif_present: { je: 'pars', il_elle_on: 'part', nous: 'partons' },
    indicatif_passe_compose: { je: 'suis parti', nous: 'sommes partis' },
    participe_passe: ['parti'],
  },
  'dormir': {
    indicatif_present: { je: 'dors', il_elle_on: 'dort', nous: 'dormons' },
    indicatif_passe_compose: { je: 'ai dormi' },
    participe_passe: ['dormi'],
  },
  'ouvrir': {
    indicatif_present: { je: 'ouvre', nous: 'ouvrons' },
    indicatif_passe_simple: { je: 'ouvris' },
    participe_passe: ['ouvert'],
  },
  'courir': {
    indicatif_present: { je: 'cours', il_elle_on: 'court' },
    indicatif_futur_simple: { je: 'courrai' },
    indicatif_passe_simple: { je: 'courus' },
    participe_passe: ['couru'],
  },
  'haïr': {
    indicatif_present: { je: 'hais', nous: 'haïssons' },
    indicatif_passe_simple: { je: 'haïs' },
    participe_passe: ['haï'],
  },
  'attendre': {
    indicatif_present: { je: 'attends', il_elle_on: 'attend', nous: 'attendons' },
    indicatif_passe_simple: { je: 'attendis' },
    participe_passe: ['attendu'],
  },
  'recevoir': {
    indicatif_present: { je: 'reçois', nous: 'recevons', ils_elles: 'reçoivent' },
    indicatif_passe_simple: { je: 'reçus' },
    indicatif_futur_simple: { je: 'recevrai' },
    participe_passe: ['reçu'],
  },
  'connaître': {
    indicatif_present: { je: 'connais', il_elle_on: 'connaît', nous: 'connaissons' },
    indicatif_passe_simple: { je: 'connus' },
    participe_passe: ['connu'],
  },
  'craindre': {
    indicatif_present: { je: 'crains', il_elle_on: 'craint', nous: 'craignons' },
    indicatif_passe_simple: { je: 'craignis' },
    participe_passe: ['craint'],
  },
  'battre': {
    indicatif_present: { je: 'bats', il_elle_on: 'bat', nous: 'battons' },
    participe_passe: ['battu'],
  },
  'vêtir': {
    indicatif_present: { je: 'vêts', il_elle_on: 'vêt', nous: 'vêtons' },
    participe_passe: ['vêtu'],
  },
  'nuire': {
    indicatif_present: { je: 'nuis', il_elle_on: 'nuit', nous: 'nuisons' },
    participe_passe: ['nui'],
  },
  'plaire': {
    indicatif_present: { je: 'plais', il_elle_on: 'plaît', nous: 'plaisons' },
    indicatif_passe_simple: { je: 'plus' },
    participe_passe: ['plu'],
  },
  'conduire': {
    indicatif_present: { je: 'conduis', nous: 'conduisons' },
    indicatif_passe_simple: { je: 'conduisis' },
    participe_passe: ['conduit'],
  },
  'cueillir': {
    indicatif_present: { je: 'cueille', nous: 'cueillons' },
    indicatif_futur_simple: { je: 'cueillerai' },
    participe_passe: ['cueilli'],
  },
  'fuir': {
    indicatif_present: { je: 'fuis', nous: 'fuyons', ils_elles: 'fuient' },
    participe_passe: ['fui'],
  },
  'croître': {
    // the circumflex is obligatory in every form homographic with croire,
    // including the imperative
    indicatif_present: { je: 'croîs', il_elle_on: 'croît', nous: 'croissons' },
    indicatif_passe_simple: { je: 'crûs' },
    imperatif_present: { tu: 'croîs' },
    participe_passe: ['crû'],
  },
  'accroître': {
    // ... but accroître carries it only before -t
    indicatif_present: { je: 'accrois', tu: 'accrois', il_elle_on: 'accroît' },
    imperatif_present: { tu: 'accrois' },
    participe_passe: ['accru'],
  },
  'rire': {
    indicatif_present: { je: 'ris', nous: 'rions' },
    subjonctif_present: { nous: 'riions' },
    participe_passe: ['ri'],
  },
  // "il éclot" and "il éclôt" are both standard (fr.wiktionary prints
  // "il/elle/on éclot ou éclôt"); the circumflex form is the one the
  // conjugation table we build from spells out, so that is what must ship.
  'éclore': {
    indicatif_present: { il_elle_on: 'éclôt' },
    participe_passe: ['éclos'],
  },
  "s'asseoir": {
    indicatif_present: { je: "m'assieds", nous: 'nous asseyons', il_elle_on: "s'assied" },
    indicatif_passe_compose: { je: 'me suis assis', ils_elles: 'se sont assis' },
    imperatif_present: { tu: 'assieds-toi', vous: 'asseyez-vous' },
  },
  'se souvenir': {
    indicatif_present: { je: 'me souviens', nous: 'nous souvenons' },
    indicatif_passe_compose: { je: 'me suis souvenu' },
    imperatif_present: { tu: 'souviens-toi', vous: 'souvenez-vous' },
  },
  "s'efforcer": {
    indicatif_present: { je: "m'efforce", nous: 'nous efforçons' },
    indicatif_passe_compose: { je: "me suis efforcé", ils_elles: 'se sont efforcés' },
    imperatif_present: { tu: 'efforce-toi', vous: 'efforcez-vous' },
  },
  "s'abstenir": {
    indicatif_present: { je: "m'abstiens", il_elle_on: "s'abstient", ils_elles: "s'abstiennent" },
    indicatif_passe_compose: { je: 'me suis abstenu' },
    subjonctif_present: { je: "m'abstienne", nous: 'nous abstenions' },
  },
  "s'enquérir": {
    indicatif_present: { je: "m'enquiers", il_elle_on: "s'enquiert", ils_elles: "s'enquièrent" },
    indicatif_passe_compose: { je: 'me suis enquis' },
  },
  "s'appeler": {
    indicatif_present: { je: "m'appelle", tu: "t'appelles", nous: 'nous appelons' },
    indicatif_futur_simple: { je: "m'appellerai" },
    indicatif_passe_compose: { je: 'me suis appelé' },
  },
  'se lever': {
    indicatif_present: { je: 'me lève', nous: 'nous levons' },
    indicatif_futur_simple: { je: 'me lèverai' },
    indicatif_passe_compose: { je: 'me suis levé' },
  },
};

// Forms that must NOT appear (the bug this dataset was rebuilt to fix).
const GOLD_NEGATIVE = {
  'manger': { indicatif_imparfait: { nous: 'mangeions', vous: 'mangeiez' },
    subjonctif_present: { nous: 'mangeions', vous: 'mangeiez' } },
  'commencer': { indicatif_imparfait: { nous: 'commençions', vous: 'commençiez' },
    subjonctif_present: { nous: 'commençions', vous: 'commençiez' } },
  'aller': { indicatif_passe_compose: { je: 'allé' } },
  // impersonal: a blind -ger paradigm would emit these, Wiktionary dashes them
  'neiger': { indicatif_present: { je: 'neige', nous: 'neigeons' },
    indicatif_imparfait: { je: 'neigeais' } },
};

const byInfinitive = new Map(data.map((v) => [v.infinitive, v]));
let goldForms = 0;

for (const [infinitive, tenses] of Object.entries(GOLD)) {
  const verb = byInfinitive.get(infinitive);
  check(!!verb, `gold set: "${infinitive}" is missing from the dataset`);
  if (!verb) continue;
  for (const [key, expected] of Object.entries(tenses)) {
    const tense = verb.tenses[key];
    check(!!tense, `gold set: ${infinitive} has no "${key}"`);
    if (!tense) continue;
    if (Array.isArray(expected)) {
      for (const want of expected) {
        goldForms++;
        check(tense.forms.indexOf(want) !== -1,
          `gold set: ${infinitive}/${key} should contain "${want}", got ` +
          `${JSON.stringify(tense.forms)}`);
      }
    } else {
      for (const [person, want] of Object.entries(expected)) {
        goldForms++;
        const got = String(tense.forms[person] || '');
        check(got.split('/').indexOf(want) !== -1,
          `gold set: ${infinitive}/${key}/${person} should be "${want}", got "${got}"`);
      }
    }
  }
}

for (const [infinitive, tenses] of Object.entries(GOLD_NEGATIVE)) {
  const verb = byInfinitive.get(infinitive);
  if (!verb) continue;
  for (const [key, persons] of Object.entries(tenses)) {
    const tense = verb.tenses[key];
    if (!tense) continue;
    for (const [person, forbidden] of Object.entries(persons)) {
      goldForms++;
      const got = String(tense.forms[person] || '');
      check(got.split('/').indexOf(forbidden) === -1,
        `gold set: ${infinitive}/${key}/${person} still contains the wrong form ` +
        `"${forbidden}"`);
    }
  }
}

/* Essentially-pronominal verbs must ship as "s'X" only.  A bare "j'efforce"
 * card teaches French that nobody writes, and the pronominal entry already
 * carries the same corpus rank. */
const PRONOMINAL_ONLY = [
  'efforcer', 'envoler', 'emparer', 'écrier', 'évanouir', 'évader', 'acharner',
  'obstiner', 'épanouir', 'abstenir', 'absenter', 'enquérir', 'esclaffer',
  'extasier', 'enfuir', 'méfier', 'souvenir',
];
for (const bare of PRONOMINAL_ONLY) {
  const surface = /^[aeiouéèêîôûhy]/.test(bare) ? `s'${bare}` : `se ${bare}`;
  check(!byInfinitive.has(bare),
    `"${bare}" is essentially pronominal and must not ship as a bare infinitive`);
  check(byInfinitive.has(surface),
    `essentially-pronominal verb "${surface}" is missing from the dataset`);
}

/* ------------------------------------------------------------- report --- */

const models = new Set();
for (const verb of data) {
  for (const m of String(verb.model).split(' + ')) models.add(m);
}

console.log(`file          : ${DATA_PATH}`);
console.log('global        : DIM_DATA.conjugations.fr');
console.log(`verbs         : ${data.length}`);
console.log(`conjugated forms (counting "/" alternatives): ${totalForms}`);
console.log(`tense groups  : ${CANONICAL_TENSES.length} canonical, ` +
  `${data.filter((v) => !v.defective).length} verbs carry all of them, ` +
  `${data.filter((v) => v.defective).length} are defective and declare what they lack`);
console.log(`auxiliaries   : avoir ${data.filter((v) => v.auxiliary === 'avoir').length}, ` +
  `être ${data.filter((v) => v.auxiliary === 'être').length}`);
console.log(`pronominals   : ${data.filter((v) => v.reflexive).length}`);
console.log(`model paradigms represented: ${models.size}`);
console.log(`gold-set assertions: ${goldForms} forms over ` +
  `${Object.keys(GOLD).length} hand-verified verbs`);
console.log(`assertions run: ${checks}`);

if (errors.length) {
  console.error(`\nFAILED: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 60)) console.error('  - ' + e);
  if (errors.length > 60) console.error(`  ... and ${errors.length - 60} more`);
  process.exit(1);
}
console.log('\nOK: all assertions passed');
