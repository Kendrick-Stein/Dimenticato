#!/usr/bin/env node
/*
 * Quality gate for the German extras datasets:
 *
 *   data/german-collocations-data.js   window.GERMAN_COLLOCATIONS_DATA
 *   data/german-course-data.js         GERMAN_COURSE_DATA
 *
 * Every rule the build script claims to enforce is re-checked here from the
 * emitted files only.  Run:  node scripts/validate_german_extras.js
 * Exits non-zero on the first failing category (all failures are printed).
 *
 * Checks, in order:
 *   1. shape parity with the Italian datasets the renderers were written for
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

const collocations = load('german-collocations-data.js', 'GERMAN_COLLOCATIONS_DATA');
const course = load('german-course-data.js', 'GERMAN_COURSE_DATA');
const italianCollocations = load('verb-collocations-data.js', 'VERB_COLLOCATIONS_DATA');
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

  // -- shape parity with the Italian dataset the renderer targets ------------
  ['meta', 'verbs', 'prepositions'].forEach(function (key) {
    check(Object.prototype.hasOwnProperty.call(data, key), CAT,
      label + ': missing top-level key "' + key + '" (Italian has it)');
  });
  check(Array.isArray(data.meta.prepositionOrder), CAT,
    label + ': meta.prepositionOrder must be an array');
  check(typeof data.meta.totalVerbs === 'number' && typeof data.meta.totalExamples === 'number',
    CAT, label + ': meta.totalVerbs / meta.totalExamples must be numbers');

  const italianVerb = italianCollocations.verbs[Object.keys(italianCollocations.verbs)[0]];
  const italianVerbKeys = Object.keys(italianVerb).sort();

  const verbNames = Object.keys(data.verbs);
  check(verbNames.length === data.meta.totalVerbs, CAT,
    label + ': meta.totalVerbs ' + data.meta.totalVerbs + ' != ' + verbNames.length);
  check(verbNames.length > 0, CAT, label + ': no verbs');

  let exampleCount = 0;
  const prepUse = {};

  verbNames.forEach(function (name) {
    const verb = data.verbs[name];
    italianVerbKeys.forEach(function (key) {
      check(Object.prototype.hasOwnProperty.call(verb, key), CAT,
        label + '/' + name + ': missing field "' + key + '" required by the renderer');
    });
    check(!badText(verb.display), CAT, label + '/' + name + ': bad display');
    check(Array.isArray(verb.prepositionOrder) && verb.prepositionOrder.length > 0, CAT,
      label + '/' + name + ': empty prepositionOrder');

    verb.prepositionOrder.forEach(function (prep) {
      const examples = verb.prepositions[prep];
      if (!check(Array.isArray(examples) && examples.length > 0, CAT,
        label + '/' + name + ': prepositions["' + prep + '"] is empty')) return;
      prepUse[prep] = true;

      // -- 3. every governed preposition carries its case ------------------
      if (requireCase) {
        check(/ \+[ADG]$/.test(prep), CAT,
          label + '/' + name + ': preposition key "' + prep + '" has no case marker');
        check(data.meta.prepositionCase && data.meta.prepositionCase[prep], CAT,
          label + ': meta.prepositionCase has no entry for "' + prep + '"');
        check(data.meta.prepositionBase && data.meta.prepositionBase[prep], CAT,
          label + ': meta.prepositionBase has no entry for "' + prep + '"');
        if (data.meta.prepositionCase && data.meta.prepositionCase[prep]) {
          check(prep.slice(-1) === data.meta.prepositionCase[prep], CAT,
            label + ': case of "' + prep + '" disagrees with meta.prepositionCase');
        }
      }

      examples.forEach(function (text) {
        exampleCount += 1;
        const problem = badText(text);
        if (!check(!problem, CAT, label + '/' + name + '/' + prep + ': ' + problem +
          ' example ' + JSON.stringify(text))) return;
        // the practice screen splits "German sentence. 中文" exactly like this
        const parts = String(text).match(/^(.+?[.!?！？。])\s*(.+)$/);
        if (!check(parts, CAT, label + '/' + name + '/' + prep +
          ': example is not splittable into German + Chinese: ' + JSON.stringify(text))) return;
        const german = parts[1].trim();
        const chinese = parts[2].trim();
        check(german.length > 0 && GERMAN_TEXT.test(german), CAT,
          label + '/' + name + ': German half is empty or contains CJK: ' + JSON.stringify(text));
        check(chinese.length > 0 && CJK.test(chinese), CAT,
          label + '/' + name + ': translation is empty or has no CJK: ' + JSON.stringify(text));
        check(!badText(chinese), CAT,
          label + '/' + name + ': bad translation ' + JSON.stringify(chinese));
        const base = data.meta.prepositionBase ? data.meta.prepositionBase[prep] : null;
        if (base && label === 'GERMAN_COLLOCATIONS_DATA') {
          const stem = base.split('/')[0];
          const forms = [stem].concat(CONTRACTIONS[stem] || []);
          const rx = new RegExp('(^|[^A-Za-zÄÖÜäöüß])(' + forms.join('|') +
            ')($|[^A-Za-zÄÖÜäöüß])', 'i');
          const pronominal = new RegExp('(da|wo)r?' + stem, 'i');
          check(rx.test(german) || pronominal.test(german), CAT,
            label + '/' + name + ': example for "' + prep + '" does not contain the preposition: ' +
            JSON.stringify(german));
        }
      });
    });

    Object.keys(verb.prepositions).forEach(function (prep) {
      check(verb.prepositionOrder.indexOf(prep) !== -1, CAT,
        label + '/' + name + ': "' + prep + '" missing from prepositionOrder');
    });
  });

  check(exampleCount === data.meta.totalExamples, CAT,
    label + ': meta.totalExamples ' + data.meta.totalExamples + ' != ' + exampleCount);

  data.meta.prepositionOrder.forEach(function (prep) {
    check(Array.isArray(data.prepositions[prep]) && data.prepositions[prep].length > 0, CAT,
      label + ': prepositions index missing "' + prep + '"');
    (data.prepositions[prep] || []).forEach(function (name) {
      check(!!data.verbs[name], CAT,
        label + ': prepositions["' + prep + '"] points at unknown verb "' + name + '"');
    });
  });
  Object.keys(prepUse).forEach(function (prep) {
    check(data.meta.prepositionOrder.indexOf(prep) !== -1, CAT,
      label + ': "' + prep + '" used by a verb but absent from meta.prepositionOrder');
  });

  return { verbs: verbNames.length, examples: exampleCount };
}

const collocStats = validateCollocationBlock('GERMAN_COLLOCATIONS_DATA', collocations, true);
// coverage floor: the authored layer (scripts/sources/german-rektion) brought the
// dataset to Italian-style breadth; a build that silently drops the source dir
// would fall back to ~350 verbs, so lock the floor in
if (collocStats) {
  check(collocStats.verbs >= 800, 'collocations',
    'only ' + collocStats.verbs + ' Rektion headwords (floor 800) - scripts/sources/german-rektion not picked up?');
  check(collocStats.examples >= 2500, 'collocations',
    'only ' + collocStats.examples + ' Rektion examples (floor 2500)');
}
// authored example sentences must be tagged as such in the structured entries
Object.keys(collocations.verbs).forEach(function (name) {
  (collocations.verbs[name].entries || []).forEach(function (e) {
    (e.examples || []).forEach(function (x) {
      check(x && (x.source === 'Dimenticato (authored)' || x.source === 'Tatoeba CC BY 2.0 FR'),
        'collocations', name + ': example without a known source ' + JSON.stringify(x));
    });
  });
});
// the Funktionsverbgefuege block keys "prepositions" by light verb, not by
// preposition, so the case rule does not apply to it
const nounVerbStats = collocations.nounVerb
  ? validateCollocationBlock('GERMAN_COLLOCATIONS_DATA.nounVerb', collocations.nounVerb, false)
  : null;
check(!!collocations.nounVerb, 'collocations',
  'nounVerb (Funktionsverbgefüge) block is missing');
check(collocations.meta.language === 'de', 'collocations',
  'meta.language should be "de"');
check(Array.isArray(collocations.meta.licenses) && collocations.meta.licenses.length > 0,
  'collocations', 'meta.licenses must list the corpus licences');

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
