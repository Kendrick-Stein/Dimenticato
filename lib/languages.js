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
 *   modules which optional feature modules exist for this language
 */
(function (global) {
  'use strict';

  var LANGUAGES = [
    {
      code: 'it', key: 'italian', name: 'Italiano', cn: '意大利语', en: 'Italian',
      tts: 'it-IT', voice: /^it/i, spell: 'plain',
      motto: 'Per non dimenticare.',
      modules: { cognates: true, conjugation: true, grammar: true, collocations: true, course: false }
    },
    {
      code: 'de', key: 'german', name: 'Deutsch', cn: '德语', en: 'German',
      tts: 'de-DE', voice: /^de/i, spell: 'german',
      motto: 'Damit nichts vergessen wird.',
      modules: { cognates: true, conjugation: true, grammar: true, collocations: true, course: true }
    },
    {
      code: 'en', key: 'english', name: 'English', cn: '英语', en: 'English',
      tts: 'en-US', voice: /^en/i, spell: 'plain',
      motto: 'Lest we forget.',
      modules: { cognates: false, conjugation: true, grammar: true, collocations: true, course: false }
    },
    {
      code: 'fr', key: 'french', name: 'Français', cn: '法语', en: 'French',
      tts: 'fr-FR', voice: /^fr/i, spell: 'french',
      motto: 'Pour ne pas oublier.',
      modules: { cognates: true, conjugation: true, grammar: true, collocations: true, course: false }
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

    /** Accepts a code ('de') or a legacy key ('german'); null when unknown. */
    get: function (codeOrKey) {
      if (!codeOrKey) return null;
      return byCode[codeOrKey] || byKey[codeOrKey] || null;
    },
    code: function (codeOrKey) { var p = this.get(codeOrKey); return p ? p.code : null; },
    key: function (codeOrKey) { var p = this.get(codeOrKey); return p ? p.key : null; },
    has: function (codeOrKey) { return !!this.get(codeOrKey); }
  };

  global.Languages = Languages;
})(typeof window !== 'undefined' ? window : globalThis);
