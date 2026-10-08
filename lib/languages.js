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
 *   labels   short target-language kicker words for the editorial chrome
 *            (module cards, section kickers, page heroes).  Render them with
 *            lang=<code>; read through Languages.text(lang, name).
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
      labels: {
        lexicon: 'Lessico', vocabulary: 'Vocabolario', grammar: 'Grammatica', conjugation: 'Coniugazione',
        collocations: 'Collocazioni', cognates: 'Affini', course: 'Percorso', progress: 'Progressi',
        exercises: 'Esercizi', modules: 'Moduli', method: 'Metodo', scope: 'Ambito', browse: 'Sfoglia',
        settings: 'Impostazioni', great: 'Ottimo', choice: 'Scelta', dictation: 'Dettato', game: 'Gioco',
        farewell: 'Buono studio.'
      },
      accents: ['à', 'è', 'é', 'ì', 'ò', 'ù'],
      files: {
        vocab: ['data/vocab/it.js'],
        conjugations: ['data/it-conjugations.js'],
        grammar: ['data/it-grammar.js'],
        collocations: ['data/it-collocations.js'],
        cognates: ['data/it-cognates.js']
      }
    },
    {
      code: 'de', key: 'german', name: 'Deutsch', cn: '德语', en: 'German',
      tts: 'de-DE', voice: /^de/i, spell: 'german',
      motto: 'Damit nichts vergessen wird.',
      labels: {
        lexicon: 'Wortschatz', vocabulary: 'Vokabeln', grammar: 'Grammatik', conjugation: 'Konjugation',
        collocations: 'Kollokationen', cognates: 'Verwandte Wörter', course: 'Lernpfad', progress: 'Fortschritt',
        exercises: 'Übungen', modules: 'Module', method: 'Methode', scope: 'Umfang', browse: 'Durchsuchen',
        settings: 'Einstellungen', great: 'Sehr gut', choice: 'Auswahl', dictation: 'Diktat', game: 'Spiel',
        farewell: 'Viel Erfolg beim Lernen.'
      },
      accents: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
      files: {
        vocab: ['data/vocab/de.js'],
        course: ['data/de-course.js'],
        conjugations: ['data/de-conjugations.js'],
        grammar: ['data/de-grammar.js'],
        collocations: ['data/de-collocations.js'],
        cognates: ['data/de-cognates.js']
      }
    },
    {
      code: 'en', key: 'english', name: 'English', cn: '英语', en: 'English',
      tts: 'en-US', voice: /^en/i, spell: 'plain',
      motto: 'Lest we forget.',
      labels: {
        lexicon: 'Lexicon', vocabulary: 'Vocabulary', grammar: 'Grammar', conjugation: 'Conjugation',
        collocations: 'Collocations', cognates: 'Cognates', course: 'Course', progress: 'Progress',
        exercises: 'Exercises', modules: 'Modules', method: 'Method', scope: 'Scope', browse: 'Browse',
        settings: 'Settings', great: 'Excellent', choice: 'Choice', dictation: 'Dictation', game: 'Game',
        farewell: 'Happy studying.'
      },
      accents: [],
      files: {
        vocab: ['data/vocab/en.js'],
        conjugations: ['data/en-conjugations.js'],
        grammar: ['data/en-grammar.js'],
        collocations: ['data/en-collocations.js']
      }
    },
    {
      code: 'fr', key: 'french', name: 'Français', cn: '法语', en: 'French',
      tts: 'fr-FR', voice: /^fr/i, spell: 'french',
      motto: 'Pour ne pas oublier.',
      labels: {
        lexicon: 'Lexique', vocabulary: 'Vocabulaire', grammar: 'Grammaire', conjugation: 'Conjugaison',
        collocations: 'Collocations', cognates: 'Mots apparentés', course: 'Parcours', progress: 'Progrès',
        exercises: 'Exercices', modules: 'Modules', method: 'Méthode', scope: 'Périmètre', browse: 'Parcourir',
        settings: 'Paramètres', great: 'Excellent', choice: 'Choix', dictation: 'Dictée', game: 'Jeu',
        farewell: 'Bonne étude.'
      },
      accents: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'û', 'ù', 'œ'],
      files: {
        vocab: ['data/vocab/fr.js'],
        conjugations: ['data/fr-conjugations.js'],
        grammar: ['data/fr-grammar.js'],
        collocations: ['data/fr-collocations.js'],
        cognates: ['data/fr-cognates.js']
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
    /** Target-language kicker word, e.g. text('de', 'grammar') → 'Grammatik'; '' when unknown. */
    text: function (codeOrKey, name) {
      var p = this.get(codeOrKey);
      return (p && p.labels && p.labels[name]) || '';
    },
    /** Chinese display name, e.g. label('german') → '德语'. */
    label: function (codeOrKey) { var p = this.get(codeOrKey); return p ? p.cn : ''; },
    /** Map every language key to fn(profile), e.g. byKeyMap(p => p.cn). */
    byKeyMap: function (fn) {
      var out = {};
      LANGUAGES.forEach(function (p) { out[p.key] = fn(p); });
      return out;
    },

    /**
     * On-screen accent keypad (profile.accents) for any answer input: spelling,
     * conjugation, collocation practice, typing game.  `input` is an element or a
     * function returning the field to type into (multi-field forms pass "the last
     * focused one").  Keys never take focus away from the field (pointerdown /
     * mousedown are cancelled — on phones a blur would drop the soft keyboard),
     * and the insertion fires an `input` event so live listeners see it.
     * Re-mounting the same host just swaps the keys and the target.
     */
    mountAccentKeys: function (host, input, codeOrKey) {
      if (!host) return;
      var p = this.get(codeOrKey);
      var chars = (p && p.accents) || [];
      host._accentTarget = input;
      host.innerHTML = chars.map(function (c) {
        return '<button type="button" class="key" data-char="' + c + '" aria-label="插入 ' + c + '">' + c + '</button>';
      }).join('');
      host.hidden = !chars.length;
      if (host._accentBound) return;
      host._accentBound = true;
      var keep = function (event) {
        if (event.target && event.target.closest && event.target.closest('.key')) event.preventDefault();
      };
      host.addEventListener('pointerdown', keep);
      host.addEventListener('mousedown', keep);
      host.addEventListener('click', function (event) {
        var key = event.target && event.target.closest ? event.target.closest('[data-char]') : null;
        if (!key) return;
        var t = host._accentTarget;
        var field = typeof t === 'function' ? t() : t;
        if (!field || field.disabled || field.readOnly) return;
        var text = key.getAttribute('data-char');
        var value = String(field.value || '');
        var start = field.selectionStart == null ? value.length : field.selectionStart;
        var end = field.selectionEnd == null ? value.length : field.selectionEnd;
        field.value = value.slice(0, start) + text + value.slice(end);
        try { field.selectionStart = field.selectionEnd = start + text.length; } catch (e) { /* some input types */ }
        if (typeof field.focus === 'function') field.focus();
        var ev;
        try { ev = new Event('input', { bubbles: true }); } catch (e) { ev = { type: 'input' }; }
        field.dispatchEvent(ev);
      });
    }
  };

  global.Languages = Languages;
})(typeof window !== 'undefined' ? window : globalThis);
