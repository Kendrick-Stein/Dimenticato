#!/usr/bin/env node
/*
 * Quality gate for the German extras datasets:
 *
 *   data/de-collocations.js            DIM_DATA.collocations.de  (collocations/1)
 *   data/german-course-data.js         GERMAN_COURSE_DATA
 *
 * Every rule the build script claims to enforce is re-checked here from the
 * emitted files only.  Run:  node scripts/validate_german_extras.js
 * Exits non-zero on the first failing category (all failures are printed).
 *
 * Checks, in order:
 *   1. collocations: collocations/1 shape (generic contract also checked by
 *      scripts/validate_modules.js); cognates: shape parity with Italian
 *   2. no empty / placeholder / mojibake German or Chinese text anywhere
 *   3. a grammatical case marked on every governed preposition
 *   4. (cognates moved to scripts/validate_modules.js, schema cognates/1)
 *   5. course: grammar slugs resolve against the German grammar tree,
 *      headwords resolve against data/vocab/de.js, examples are real
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadVocab } = require('./vocab_node');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

let failures = 0;
const seenCategories = new Set();

function fail(category, message) {
  failures += 1;
  seenCategories.add(category);
  if (failures <= 60) console.error('FAIL [' + category + '] ' + message);
  else if (failures === 61) console.error('... further failures suppressed');
}

function check(condition, category, message) {
  if (!condition) fail(category, message);
  return !!condition;
}

// ---------------------------------------------------------------------------
// loading: these files are browser scripts, not modules
// ---------------------------------------------------------------------------

function load(file, globalName) {
  const src = fs.readFileSync(path.join(DATA, file), 'utf8');
  const sandbox = { console: console };
  sandbox.window = sandbox;
  sandbox.module = undefined;
  // the trailing expression yields the binding even when it is a const
  return vm.runInNewContext(src + '\n;' + globalName + ';', sandbox,
    { filename: file, timeout: 120000 });
}

// DIM_DATA-registered module files (schema collocations/1)
function loadModule(file, module, code) {
  const src = fs.readFileSync(path.join(DATA, file), 'utf8');
  const sandbox = { console: console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.runInNewContext(src, sandbox, { filename: file, timeout: 120000 });
  return sandbox.DIM_DATA && sandbox.DIM_DATA[module] && sandbox.DIM_DATA[module][code];
}

const collocations = loadModule('de-collocations.js', 'collocations', 'de');
const course = load('german-course-data.js', 'GERMAN_COURSE_DATA');
const grammar = load('german-grammar-data.js', 'GERMAN_GRAMMAR_DATA');
// data/vocab/de.js (schema v1), mapped onto the field names used below
const vocabulary = loadVocab('de').entries.map(function (e) {
  const forms = e.forms || {};
  return {
    german: e.word,
    display: e.display || e.word,
    plural: forms.plural || '',
    principalParts: forms.principalParts || '',
    chinese: e.zh,
  };
});

// ---------------------------------------------------------------------------
// shared text hygiene
// ---------------------------------------------------------------------------

const PLACEHOLDER = /^(\?+|-+|_+|n\/?a|na|tbd|todo|xxx|null|undefined|\(n\)|none)$/i;
const CJK = /[一-鿿㐀-䶿]/;
const MOJIBAKE = /[�]|Ã[-¿]|â€|Ð|Ñ‚/;
const GERMAN_TEXT = /^[^一-鿿]+$/;

// preposition + article contractions, so "beim Chef" still counts as "bei"
const CONTRACTIONS = {
  an: ['am', 'ans'],
  auf: ['aufs'],
  bei: ['beim'],
  durch: ['durchs'],
  für: ['fürs'],
  hinter: ['hinterm', 'hinters'],
  in: ['im', 'ins'],
  über: ['übers', 'überm'],
  um: ['ums'],
  unter: ['unters', 'unterm'],
  von: ['vom'],
  vor: ['vorm', 'vors'],
  zu: ['zum', 'zur'],
};

function badText(value) {
  if (typeof value !== 'string') return 'not a string';
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  if (PLACEHOLDER.test(trimmed)) return 'placeholder';
  if (MOJIBAKE.test(trimmed)) return 'mojibake';
  // a run of the same letter is broken data; a run of dots is the source
  // dictionary's own ellipsis ("um + A ...... 钟点") and is fine
  if (/([A-Za-zÄÖÜäöüß一-鿿])\1{4,}/.test(trimmed)) return 'degenerate repetition';
  const words = trimmed.split(/\s+/);
  if (words.length >= 4) {
    const unique = new Set(words.map(function (w) { return w.toLowerCase(); }));
    if (unique.size === 1) return 'degenerate repetition';
  }
  return null;
}

// ---------------------------------------------------------------------------
// 1 + 2 + 3.  collocations
// ---------------------------------------------------------------------------

function validateCollocationBlock(label, data, requireCase) {
  const CAT = 'collocations';
  if (!check(data && typeof data === 'object', CAT, label + ': not an object')) return;

  // -- collocations/1 shape ----------------------------------------------------
  ['meta', 'keys', 'verbs', 'index'].forEach(function (key) {
    check(Object.prototype.hasOwnProperty.call(data, key), CAT,
      label + ': missing top-level key "' + key + '"');
  });
  if (!check(Array.isArray(data.keys) && data.keys.length > 0, CAT, label + ': keys[] must be a non-empty array')) return;
  check(typeof data.meta.count === 'number' && typeof data.meta.examples === 'number',
    CAT, label + ': meta.count / meta.examples must be numbers');

  const keyRec = {};
  data.keys.forEach(function (rec) {
    check(rec && typeof rec.key === 'string' && rec.key && !keyRec[rec.key], CAT,
      label + ': bad or duplicate key record ' + JSON.stringify(rec));
    check(!badText(rec.label), CAT, label + ': key "' + rec.key + '" has a bad label');
    keyRec[rec.key] = rec;
    // -- 3. every governed preposition carries its case ----------------------
    if (requireCase) {
      check(/^[a-zäöüß]+(?:\/[a-zäöüß]+)?\+[ADG]$/.test(rec.key), CAT,
        label + ': preposition key "' + rec.key + '" has no case marker');
      check(rec.case === rec.key.slice(-1), CAT,
        label + ': case of "' + rec.key + '" disagrees with keys[].case ' + JSON.stringify(rec.case));
      check(rec.kind === 'preposition', CAT, label + ': key "' + rec.key + '" kind must be preposition');
    }
  });

  const verbNames = Object.keys(data.verbs);
  check(verbNames.length === data.meta.count, CAT,
    label + ': meta.count ' + data.meta.count + ' != ' + verbNames.length);
  check(verbNames.length > 0, CAT, label + ': no verbs');

  let exampleCount = 0;
  const keyUse = {};

  verbNames.forEach(function (name) {
    const verb = data.verbs[name];
    check(verb.word === name, CAT, label + '/' + name + ': word ' + JSON.stringify(verb.word) + ' != headword');
    check(!badText(verb.word), CAT, label + '/' + name + ': bad word');
    if (!check(Array.isArray(verb.order) && verb.order.length > 0, CAT,
      label + '/' + name + ': empty order')) return;

    verb.order.forEach(function (key) {
      check(!!keyRec[key], CAT, label + '/' + name + ': key "' + key + '" missing from keys[]');
      const examples = verb.keys && verb.keys[key];
      if (!check(Array.isArray(examples) && examples.length > 0, CAT,
        label + '/' + name + ': keys["' + key + '"] is empty')) return;
      (keyUse[key] = keyUse[key] || []).push(name);

      examples.forEach(function (ex) {
        exampleCount += 1;
        const german = ex && typeof ex.text === 'string' ? ex.text.trim() : '';
        const chinese = ex && typeof ex.zh === 'string' ? ex.zh.trim() : '';
        const problem = badText(german);
        if (!check(!problem, CAT, label + '/' + name + '/' + key + ': ' + problem +
          ' example ' + JSON.stringify(ex))) return;
        check(GERMAN_TEXT.test(german), CAT,
          label + '/' + name + ': German text contains CJK: ' + JSON.stringify(german));
        check(chinese.length > 0 && CJK.test(chinese), CAT,
          label + '/' + name + ': translation is empty or has no CJK: ' + JSON.stringify(ex));
        check(!badText(chinese), CAT,
          label + '/' + name + ': bad translation ' + JSON.stringify(chinese));
        check(Number.isInteger(ex.src) && ex.src >= 0 && ex.src < (data.meta.sources || []).length,
          CAT, label + '/' + name + ': example src does not index meta.sources ' + JSON.stringify(ex));
        if (requireCase) {
          const stem = key.replace(/\+[ADG]$/, '').split('/')[0];
          const forms = [stem].concat(CONTRACTIONS[stem] || []);
          const rx = new RegExp('(^|[^A-Za-zÄÖÜäöüß])(' + forms.join('|') +
            ')($|[^A-Za-zÄÖÜäöüß])', 'i');
          const pronominal = new RegExp('(da|wo)r?' + stem, 'i');
          check(rx.test(german) || pronominal.test(german), CAT,
            label + '/' + name + ': example for "' + key + '" does not contain the preposition: ' +
            JSON.stringify(german));
        }
      });
    });

    Object.keys(verb.keys || {}).forEach(function (key) {
      check(verb.order.indexOf(key) !== -1, CAT,
        label + '/' + name + ': "' + key + '" missing from order');
    });
  });

  check(exampleCount === data.meta.examples, CAT,
    label + ': meta.examples ' + data.meta.examples + ' != ' + exampleCount);

  // index is exactly the inverse of verbs[].order
  Object.keys(keyUse).forEach(function (key) {
    check(JSON.stringify(data.index[key] || []) === JSON.stringify(keyUse[key]), CAT,
      label + ': index["' + key + '"] is not the inverse of verbs[].order');
  });
  Object.keys(data.index).forEach(function (key) {
    check(!!keyUse[key], CAT, label + ': index["' + key + '"] names a key no verb uses');
  });

  return { verbs: verbNames.length, examples: exampleCount };
}

const collocStats = validateCollocationBlock('collocations.de', collocations, true);
// coverage floor: the authored layer (scripts/sources/german-rektion) brought the
// dataset to Italian-style breadth; a build that silently drops the source dir
// would fall back to ~350 verbs, so lock the floor in
if (collocStats) {
  check(collocStats.verbs >= 800, 'collocations',
    'only ' + collocStats.verbs + ' Rektion headwords (floor 800) - scripts/sources/german-rektion not picked up?');
  check(collocStats.examples >= 2500, 'collocations',
    'only ' + collocStats.examples + ' Rektion examples (floor 2500)');
}
// structured senses (x.senses) index into the key's example list
Object.keys(collocations.verbs).forEach(function (name) {
  const verb = collocations.verbs[name];
  const senses = (verb.x && verb.x.senses) || {};
  Object.keys(senses).forEach(function (key) {
    const n = ((verb.keys || {})[key] || []).length;
    (senses[key] || []).forEach(function (sense) {
      check(sense && CJK.test(sense.zh || ''), 'collocations', name + '/' + key + ': sense without a Chinese gloss');
      (sense && sense.examples || []).forEach(function (i) {
        check(Number.isInteger(i) && i >= 0 && i < n, 'collocations',
          name + '/' + key + ': sense example index ' + i + ' out of range');
      });
    });
  });
});
// the Funktionsverbgefuege block (x.nounVerb) keys by light verb, not by
// preposition, so the case rule does not apply to it
const nounVerb = collocations.x && collocations.x.nounVerb;
const nounVerbStats = nounVerb
  ? validateCollocationBlock('collocations.de.x.nounVerb',
    Object.assign({}, nounVerb, { meta: Object.assign({ sources: collocations.meta.sources }, nounVerb.meta) }), false)
  : null;
check(!!nounVerb, 'collocations', 'x.nounVerb (Funktionsverbgefüge) block is missing');
check(collocations.meta.schema === 'collocations/1', 'collocations', 'meta.schema should be "collocations/1"');
check(collocations.meta.lang === 'de', 'collocations', 'meta.lang should be "de"');
check(Array.isArray(collocations.meta.licences) && collocations.meta.licences.length > 0,
  'collocations', 'meta.licences must list the corpus licences');

// ---------------------------------------------------------------------------
// 5.  course
// ---------------------------------------------------------------------------

(function validateCourse() {
  const CAT = 'course';
  const slugs = new Set(Object.keys(grammar.content || {}));
  check(slugs.size > 0, CAT, 'no grammar slugs found in GERMAN_GRAMMAR_DATA.content');

  const normalize = function (value) {
    return String(value || '').normalize('NFKC').toLocaleLowerCase('de-DE').replace(/\//g, '').trim();
  };
  // The index has to mirror GermanCourse.buildWordIndex() in german-course.js,
  // otherwise this gate fails headwords the app resolves perfectly well.  The
  // renderer indexes the lemma (german / display) *and* the inflected forms the
  // dictionary already carries (plural, principal parts), so "Frauen" finds
  // "Frau" and "gegessen" finds "essen".  Two passes, lemmas first: an inflected
  // form must never displace a word whose own lemma is spelled the same way.
  const inflectedForms = function (word) {
    const forms = [];
    if (word.plural) forms.push(word.plural);
    if (word.principalParts) {
      String(word.principalParts).split(',').forEach(function (part) {
        part.trim().split(/\s+/).forEach(function (token) {
          // "isst, aß, hat gegessen" — the auxiliary is not a word form
          if (token && !/^(hat|ist|haben|sein|hast|bin)$/.test(token)) forms.push(token);
        });
      });
    }
    return forms;
  };
  const vocabIndex = new Map();
  vocabulary.forEach(function (word) {
    [word.german, word.display].forEach(function (value) {
      const key = normalize(value);
      if (key && !vocabIndex.has(key)) vocabIndex.set(key, word);
    });
  });
  vocabulary.forEach(function (word) {
    inflectedForms(word).forEach(function (value) {
      const key = normalize(value);
      if (key && !vocabIndex.has(key)) vocabIndex.set(key, word);
    });
  });

  let units = 0;
  let headwords = 0;
  let examples = 0;
  let taggedUnits = 0;

  (course.levels || []).forEach(function (level) {
    (level.units || []).forEach(function (unit) {
      units += 1;
      const where = 'unit ' + unit.id;
      check(!badText(unit.title), CAT, where + ': bad title');
      check(!badText(unit.summary), CAT, where + ': bad summary');

      // -- grammar tags must be links, and the links must resolve ---------
      check(Array.isArray(unit.grammar) && unit.grammar.length > 0, CAT,
        where + ': no grammar labels');
      check(Array.isArray(unit.grammarLinks) &&
        unit.grammarLinks.length === (unit.grammar || []).length, CAT,
        where + ': grammarLinks does not mirror grammar');
      let resolved = 0;
      (unit.grammarLinks || []).forEach(function (link) {
        check(!badText(link.label), CAT, where + ': grammar link without a label');
        check(unit.grammar.indexOf(link.label) !== -1, CAT,
          where + ': grammarLinks label "' + link.label + '" is not in grammar');
        if (link.slug === null) return;
        if (check(slugs.has(link.slug), CAT,
          where + ': grammar slug "' + link.slug + '" does not resolve against the grammar tree')) {
          resolved += 1;
        }
      });
      check(resolved > 0, CAT, where + ': not one grammar tag resolves to a topic');
      if (resolved === (unit.grammar || []).length) taggedUnits += 1;

      // -- enough words for a practice session, all of them resolvable ----
      check(Array.isArray(unit.headwords) && unit.headwords.length >= 20, CAT,
        where + ': only ' + (unit.headwords || []).length + ' headwords (need >= 20)');
      const localSeen = new Set();
      (unit.headwords || []).forEach(function (headword) {
        check(!badText(headword), CAT, where + ': bad headword ' + JSON.stringify(headword));
        const word = vocabIndex.get(normalize(headword));
        if (!check(!!word, CAT, where + ': headword "' + headword +
          '" does not resolve against data/vocab/de.js')) return;
        localSeen.add(word.german);
        check(!badText(word.meaning || word.chinese), CAT,
          where + ': headword "' + headword + '" has no usable gloss');
      });
      // Two headwords may legitimately land on the same entry now that the
      // index knows inflections ("Frau" + "Frauen"); the renderer drops the
      // duplicate silently.  What actually matters is the size of the practice
      // pool the learner ends up with, so assert that instead.
      check(localSeen.size >= 20, CAT, where + ': only ' + localSeen.size +
        ' distinct words after deduplication (need >= 20)');
      headwords += (unit.headwords || []).length;

      // -- real example sentences with real translations ------------------
      check(Array.isArray(unit.examples) && unit.examples.length >= 1, CAT,
        where + ': no example sentences');
      (unit.examples || []).forEach(function (example) {
        const problem = badText(example && example.de);
        if (!check(!problem, CAT, where + ': example ' + problem)) return;
        check(GERMAN_TEXT.test(example.de), CAT, where + ': German example contains CJK');
        check(!badText(example.zh) && CJK.test(example.zh || ''), CAT,
          where + ': example translation is empty or has no CJK: ' + JSON.stringify(example.de));
        check(!badText(example.source), CAT, where + ': example without a source');
      });
      examples += (unit.examples || []).length;
    });
  });

  check(units === 54, CAT, 'expected 54 units, found ' + units);
  check(taggedUnits === units, CAT,
    (units - taggedUnits) + ' units still have a grammar tag that resolves nowhere');
  check(headwords >= 1500, CAT, 'only ' + headwords + ' headword slots across the course');
  check(examples >= 100, CAT, 'only ' + examples + ' example sentences across the course');
})();

// ---------------------------------------------------------------------------

const summary = [
  'collocations: ' + collocStats.verbs + ' verbs / ' + collocStats.examples + ' examples',
  'Funktionsverbgefüge: ' + (nounVerbStats ? nounVerbStats.verbs + ' nouns / ' +
    nounVerbStats.examples + ' examples' : 'missing'),
  'course: ' + (course.levels || []).reduce(function (n, l) { return n + l.units.length; }, 0) +
    ' units',
].join('\n  ');

if (failures) {
  console.error('\n' + failures + ' failure(s) in: ' + Array.from(seenCategories).join(', '));
  process.exit(1);
}
console.log('German extras OK\n  ' + summary);
