/**
 * Language profiles — the only place that knows which languages exist.
 *
 * Everything else (screens, practice, storage, progress) is written once and
 * parameterised by a profile.  Adding a language = ship data/vocab/<code>.js
 * (schema v1, docs/vocab-schema.md) and add one entry here.
 *
 *   code   ISO code used in URLs and DIM_VOCAB (it / de / en / fr)
 *   key    storage / module name kept from earlier versions (italian …),
 *          so existing localStorage progress and backups stay valid
 *   spell  spelling-grader flavour, see lib/vocab.js Vocab.gradeSpelling
 *   accents  on-screen keys offered by the spelling screen
 *   files    data files lib/lang-loader.js injects: `vocab` at language switch,
 *            the rest lazily when that module is first opened.  The other keys
 *            ARE the optional feature modules (conjugations / grammar /
 *            collocations / cognates / course): a language has a module iff it
 *            lists files for it.  Each module file registers its payload as
 *            DIM_DATA.<module>.<code> (see scripts/data_module.py); consumers
 *            read it with LangLoader.data(lang, module).
 *
 * Loaded as a plain <script defer> before lib/lang-loader.js (which reads `files`),
 * so it must stay dependency-free.
 */
(function (global) {
  'use strict';

  var LANGUAGES = [
    {
      code: 'it', key: 'italian', name: 'Italiano', cn: '意大利语', en: 'Italian',
      tts: 'it-IT', voice: /^it/i, spell: 'plain',
      motto: 'Per non dimenticare.',
      accents: ['à', 'è', 'é', 'ì', 'ò', 'ù'],
      files: {
        vocab: ['data/vocab/it.js'],
        conjugations: ['data/conjugations-all-tenses.js'],
        grammar: ['data/grammar-data.js'],
        collocations: ['data/verb-collocations-data.js'],
        cognates: ['data/cognates.js']
      }
    },
    {
      code: 'de', key: 'german', name: 'Deutsch', cn: '德语', en: 'German',
      tts: 'de-DE', voice: /^de/i, spell: 'german',
      motto: 'Damit nichts vergessen wird.',
      accents: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
      files: {
        vocab: ['data/vocab/de.js'],
        course: ['data/de-course.js'],
        conjugations: ['data/german-conjugations.js'],
        grammar: ['data/german-grammar-data.js'],
        collocations: ['data/german-collocations-data.js'],
        cognates: ['data/german-cognates.js']
      }
    },
    {
      code: 'en', key: 'english', name: 'English', cn: '英语', en: 'English',
      tts: 'en-US', voice: /^en/i, spell: 'plain',
      motto: 'Lest we forget.',
      accents: [],
      files: {
        vocab: ['data/vocab/en.js'],
        conjugations: ['data/english-conjugations.js'],
        grammar: ['data/english-grammar-data.js'],
        collocations: ['data/english-collocations-data.js']
      }
    },
    {
      code: 'fr', key: 'french', name: 'Français', cn: '法语', en: 'French',
      tts: 'fr-FR', voice: /^fr/i, spell: 'french',
      motto: 'Pour ne pas oublier.',
      accents: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'û', 'ù', 'œ'],
      files: {
        vocab: ['data/vocab/fr.js'],
        conjugations: ['data/french-conjugations.js'],
        grammar: ['data/french-grammar-data.js'],
        collocations: ['data/french-collocations-data.js'],
        cognates: ['data/french-cognates.js']
      }
    }
  ];

  var byCode = {};
  var byKey = {};
  LANGUAGES.forEach(function (p) { byCode[p.code] = p; byKey[p.key] = p; });

  var Languages = {
    list: LANGUAGES,
    codes: LANGUAGES.map(function (p) { return p.code; }),
    keys: LANGUAGES.map(function (p) { return p.key; }),
    DEFAULT: 'it',
    /** Italian predates the multi-language split: its storage keys carry no prefix. */
    DEFAULT_KEY: 'italian',

    /** Accepts a code ('de') or a legacy key ('german'); null when unknown. */
    get: function (codeOrKey) {
      if (!codeOrKey) return null;
      return byCode[codeOrKey] || byKey[codeOrKey] || null;
    },
    code: function (codeOrKey) { var p = this.get(codeOrKey); return p ? p.code : null; },
    key: function (codeOrKey) { var p = this.get(codeOrKey); return p ? p.key : null; },
    has: function (codeOrKey) { return !!this.get(codeOrKey); },
    /** Whether the language ships an optional module, e.g. hasModule('en', 'cognates') → false. */
    hasModule: function (codeOrKey, module) {
      var p = this.get(codeOrKey);
      return !!(p && module !== 'vocab' && p.files && p.files[module]);
    },
    /** Chinese display name, e.g. label('german') → '德语'. */
    label: function (codeOrKey) { var p = this.get(codeOrKey); return p ? p.cn : ''; },
    /** Map every language key to fn(profile), e.g. byKeyMap(p => p.cn). */
    byKeyMap: function (fn) {
      var out = {};
      LANGUAGES.forEach(function (p) { out[p.key] = fn(p); });
      return out;
    }
  };

  global.Languages = Languages;
})(typeof window !== 'undefined' ? window : globalThis);
