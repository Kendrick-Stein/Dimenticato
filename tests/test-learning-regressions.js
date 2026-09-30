#!/usr/bin/env node
'use strict';
// Real modules + isolated localStorage. Presentation/timers only are stubbed;
// answer handlers, wrappers, SRS, storage and wordbook mappings are production code.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createWindow } = require('./dom-shim.js');
const ROOT = path.resolve(__dirname, '..');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS: ' + name); }
function load(context, file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
}
function boot(snapshot = {}, enhanced = true) {
  const w = createWindow();
  w.setTimeout = w.setInterval = () => 0;
  w.document.readyState = 'loading';
  w.document.body.innerHTML = '<section id="frenchWelcomeScreen"></section>' +
    '<section id="germanCourseScreen"></section><button id="goGermanCourseBtn"></button>' +
    '<span id="totalWords"></span><span id="masteredWords"></span><span id="progressPercent"></span>' +
    ['german', 'english', 'french'].map(lang =>
      `<input id="${lang}SpInput"><button id="${lang}SpCheckBtn"></button>`).join('');
  for (const [key, value] of Object.entries(snapshot)) w.localStorage.setItem(key, value);
  const c = vm.createContext(w);
  ['lib/utils.js', 'lib/word-similarity.js', 'lib/quiz-engine.js', 'lib/practice-flow.js', 'app.js',
    ...(enhanced ? ['app-enhanced.js'] : []), 'german-app.js', 'french-app.js'].forEach(file => load(c, file));
  if (enhanced) w.QuizIntegration.installAll();
  w.EnglishApp._germanApp = w.GermanApp;
  return { w, c };
}
const specs = {
  german: { app: 'GermanApp', mc: 'checkMultipleChoiceAnswer', sp: 'checkSpellingAnswer',
    load: 'loadState', word: { id: 'de-house', german: 'Haus', meaning: 'house' } },
  english: { app: 'EnglishApp', mc: '_checkMcAnswer', sp: 'checkSpelling',
    load: '_loadState', word: { english: 'house', meaning: '房子' } },
  french: { app: 'FrenchApp', mc: 'checkMultipleChoice', sp: 'checkSpelling',
    load: 'loadState', word: { french: 'maison', meaning: 'house' } }
};
function answer(w, lang, mode = 'mc', correct = true) {
  const spec = specs[lang], app = w[spec.app], word = { ...spec.word };
  app.currentWord = word;
  app.words = [word];
  app._questionStartedAt = Date.now() - 2500;
  let repeat;
  if (mode === 'mc') {
    const button = w.document.createElement('button');
    button.dataset.answer = correct ? word.meaning : 'WRONG';
    const presentation = { correctAnswerFor(w) { return w.meaning; }, highlightOptions() { button.disabled = true; }, showFeedback() {} };
    app._getMcEngine = app.getMcEngine = () => presentation;
    repeat = () => app[spec.mc](button);
  } else {
    const input = w.document.getElementById(`${lang}SpInput`);
    input.disabled = false;
    w.document.getElementById(`${lang}SpCheckBtn`).disabled = false;
    input.value = correct ? word[lang] : 'WRONG';
    repeat = () => app[spec.sp]();
  }
  repeat();
  w.DimenticatoUtils.flushAllPersisters();
  return { app, repeat };
}
for (const lang of ['german', 'english']) {
  for (const mode of ['mc', 'sp']) {
    for (const correct of [true, false]) {
      test(`${lang} ${mode} ${correct}: one answer, one day record; duplicate submit ignored`, () => {
        const { w } = boot();
        const { app, repeat } = answer(w, lang, mode, correct);
        const day = w.StatsManager.getTodayStats(lang);
        assert.equal(app.stats[`${mode}Attempts`], 1);
        assert.equal(day.totalCount, 1);
        assert.equal(day.correctCount, correct ? 1 : 0);
        assert.equal(day.duration, 3);
        assert.ok(day.wordsLearned.has(specs[lang].word[lang]));
        repeat();
        assert.equal(app.stats[`${mode}Attempts`], 1);
        assert.equal(w.StatsManager.getTodayStats(lang).totalCount, 1);
        // Reinstalling integration is idempotent; a new question of the same word counts.
        w.QuizIntegration.installAll();
        answer(w, lang, mode, correct);
        assert.equal(app.stats[`${mode}Attempts`], 2);
        assert.equal(w.StatsManager.getTodayStats(lang).totalCount, 2);
      });
    }
  }
  test(`${lang} controller still reports statistics without wrapper`, () => {
    const { w } = boot({}, false);
    const records = [];
    w.StatsManager = { recordActivity(...args) { records.push(args); } };
    answer(w, lang);
    assert.equal(records.length, 1);
    assert.equal(records[0][0], lang);
    assert.equal(records[0][1].words[0][lang], specs[lang].word[lang]);
  });
}
test('French shared and module daily totals each count one answer', () => {
  const { w } = boot();
  answer(w, 'french');
  assert.equal(w.StatsManager.getTodayStats('french').totalCount, 1);
  assert.equal(w.FrenchApp.loadDaily()[new Date().toISOString().slice(0, 10)].totalCount, 1);
});
test('independent modern records in the same millisecond are not conflated', () => {
  const { w } = boot();
  w.Date = class extends Date { static now() { return 5000; } };
  for (let i = 0; i < 2; i++) w.StatsManager.recordActivity('italian', { correct: 1, total: 1, words: ['casa'] });
  assert.equal(w.StatsManager.getTodayStats('italian').totalCount, 2);
});
for (const scope of ['italian', 'german', 'english', 'french', 'all']) {
  test(`reset scope ${scope} clears all owned formats, preserves other languages and content`, () => {
    const { w } = boot();
    const storage = w.DimStorage, snapshot = {};
    for (const lang of storage.LANGS) {
      for (const key of storage.PROGRESS_KEYS[lang]) snapshot[key] = '{}';
      snapshot[`dimenticato_progress_wb_${lang}_123`] = '["word"]';
      snapshot[`dimenticato_${lang}_filter`] = 'all';
    }
    for (const key of storage.PRESERVED_KEYS) snapshot[key] = 'preserve';
    snapshot.unrelated_app_data = 'preserve';
    for (const [key, value] of Object.entries(snapshot)) w.localStorage.setItem(key, value);
    storage.reset({ scope });
    const removed = new Set(storage.keysForScope(scope, Object.keys(snapshot)));
    for (const [key, value] of Object.entries(snapshot)) {
      assert.equal(w.localStorage.getItem(key), removed.has(key) ? null : value, key);
    }
  });
}
test('actual Settings reset, reload, then one answer cannot resurrect prior mastery', () => {
  const { w, c } = boot();
  for (const lang of Object.keys(specs)) { answer(w, lang); answer(w, lang); }
  w._promptAnswer = '5';
  w._confirmAnswer = true;
  vm.runInContext('Storage.reset()', c);
  for (const key of ['dimenticato_german_sr', 'dimenticato_english_sr', 'dimenticato_french_srs', 'dimenticato_french_daily']) {
    assert.equal(w.localStorage.getItem(key), null, key);
  }
  const fresh = boot(w.DimStorage.snapshot()).w;
  for (const lang of Object.keys(specs)) {
    fresh[specs[lang].app][specs[lang].load]();
    const { app } = answer(fresh, lang);
    assert.equal(app.mastered.size, 0, lang);
    assert.equal(fresh.StatsManager.getTodayStats(lang).totalCount, 1, lang);
    const ownSrs = lang === 'french' ? app.srs : app.srData;
    assert.equal(Object.values(ownSrs)[0].repetitions, 1, lang);
  }
});
for (const key of ['dimenticato_german_sr', 'dimenticato_english_sr', 'dimenticato_french_srs', 'dimenticato_srs_german']) {
  test(`backup merge preserves word union and latest dated review in ${key}`, () => {
    const { w } = boot();
    const mine = { onlyLocal: { repetitions: 2 }, common: { repetitions: 2, lastReviewDate: '2026-09-20' } };
    const theirs = { onlyIncoming: { repetitions: 1 }, common: { repetitions: 0, lastReviewDate: '2026-09-21' } };
    w.localStorage.setItem(key, JSON.stringify(mine));
    w.DimStorage.importAll({ keys: { [key]: JSON.stringify(theirs) } }, { mode: 'merge' });
    const merged = JSON.parse(w.localStorage.getItem(key));
    assert.deepEqual(Object.keys(merged).sort(), ['common', 'onlyIncoming', 'onlyLocal']);
    assert.equal(merged.common.repetitions, 0, 'a later incorrect answer must beat older mastery');
    w.DimStorage.importAll({ keys: { [key]: JSON.stringify(mine) } }, { mode: 'merge' });
    assert.equal(JSON.parse(w.localStorage.getItem(key)).common.repetitions, 0);
    assert.equal(w.DimStorage.exportAll().keys[key], w.localStorage.getItem(key));
  });
}
test('French daily backup merge retains new dates and leaves local overlapping dates unchanged', () => {
  const { w } = boot();
  const key = 'dimenticato_french_daily';
  w.localStorage.setItem(key, '{"2026-09-20":{"totalCount":3}}');
  w.DimStorage.importAll({ keys: { [key]: '{"2026-09-20":{"totalCount":99},"2026-09-21":{"totalCount":2}}' } });
  assert.deepEqual(JSON.parse(w.localStorage.getItem(key)), { '2026-09-20': { totalCount: 3 }, '2026-09-21': { totalCount: 2 } });
  w.DimStorage.importAll({ keys: { [key]: '{"2026-09-22":{"totalCount":1}}' } }, { mode: 'overwrite' });
  assert.deepEqual(JSON.parse(w.localStorage.getItem(key)), { '2026-09-22': { totalCount: 1 } });
});
test('German course recovers from missing data without refresh or duplicate event bindings', () => {
  const { w, c } = boot();
  load(c, 'german-course.js');
  const course = w.GermanCourse, entry = w.document.getElementById('goGermanCourseBtn');
  course.init();
  assert.equal(entry.disabled, true);
  load(c, 'data/german-course-data.js');
  course.init();
  assert.equal(entry.disabled, true, 'word list is still unavailable');
  w.GermanApp.ready = true;
  let rendered = 0, opened = 0;
  course.render = () => rendered++;
  course.open = () => opened++;
  course.init(); course.init();
  assert.equal(entry.disabled, false);
  assert.equal(entry.getAttribute('title'), null);
  entry.click();
  assert.equal(opened, 1);
  assert.equal(rendered, 2);
});
const french = boot();
for (const file of ['data/french-vocabulary.js', 'data/french-vocabulary-glossary.js', 'data/french-vocabulary-core.js']) load(french.c, file);
const app = french.w.FrenchApp;
app.systemWords = app.buildSystemVocabulary();
app.words = app.systemWords;
app.buildGlossIndex();
const glossary = vm.runInContext('FRENCH_GLOSSARY_VOCABULARY_DATA', french.c);
for (const original of glossary.filter(word => word.feminine)) {
  test(`source feminine survives: ${original.french} / ${original.feminine}`, () => {
    const merged = app.lookupSystemWord(original.french);
    assert.ok(merged.accepted.includes(original.feminine));
    assert.equal(app.gradeSpelling(original.feminine, merged).status, 'correct');
  });
}
test('French source display, frequency rank and provenance survive without changing identity', () => {
  const acteur = app.lookupSystemWord('acteur');
  assert.equal(acteur.french, 'acteur');
  assert.equal(acteur.key, 'acteur');
  assert.equal(acteur.feminine, 'actrice');
  assert.equal(acteur.display, 'acteur (actrice)');
  assert.equal(acteur.freqRank, 1253);
  assert.equal(acteur.printed, 'acteur(trice)');
  assert.equal(acteur.partOfSpeech, 'n.m');
  assert.ok(acteur.source.includes('你好！法语'));
  assert.equal(app.systemWords.length, 24536);
});
test('French translated spelling does not accept unrelated gender, wrong accents or conjugated verbs', () => {
  assert.equal(app.gradeSpelling('actrices', app.lookupSystemWord('acteur')).status, 'wrong');
  assert.equal(app.gradeSpelling('suis', app.lookupSystemWord('être')).status, 'wrong');
  assert.equal(app.gradeSpelling('ou', app.lookupSystemWord('où')).status, 'accent');
  assert.notEqual(app.lookupSystemWord('ou'), app.lookupSystemWord('où'));
  assert.equal(app.lookupSystemWord('soeur'), app.lookupSystemWord('sœur'));
});
test('French TXT lookup covers merged data and imported practice retains its source metadata', () => {
  const manager = french.w.WordbookManager;
  const parsed = manager.parseTxtWordbook('acteur\n\nmontgolfière\n\nnot-a-french-word', 'french');
  assert.equal(parsed.autoMatchedCount, 2);
  assert.equal(parsed.needManualCount, 1);
  assert.equal(parsed.words[0].meaning, '演员');
  const mapped = manager.mapWordbookWordsForLanguage(parsed.words, 'french');
  assert.equal(app.gradeSpelling('actrice', mapped[0]).status, 'correct');
  assert.equal(mapped[0].freqRank, 1253);
  assert.equal(mapped[0].source, app.lookupSystemWord('acteur').source);
  assert.equal(mapped[0].feminine, 'actrice');
  parsed.words[0].accepted.push('mutation');
  assert.ok(!app.lookupSystemWord('acteur').accepted.includes('mutation'));
  french.w.AppState.customWordbooks = [{ id: 42, language: 'french', name: 'Imported', words: parsed.words }];
  app.showScreen = () => {}; // navigation rendering is outside this storage/grading test
  app.selectWordbook(42);
  app.currentWord = app.words[0];
  const input = french.w.document.getElementById('frenchSpInput');
  input.disabled = false;
  input.value = 'actrice';
  app.checkSpelling();
  french.w.DimenticatoUtils.flushAllPersisters();
  assert.equal(app.stats.spAttempts, 1);
  assert.equal(app.stats.spCorrect, 1);
  assert.ok(french.w.localStorage.getItem('dimenticato_progress_wb_french_42'));
  const courseKeys = new Set(vm.runInContext('FRENCH_VOCABULARY_DATA.map(w => w.french)', french.c));
  const glossaryKeys = new Set(glossary.map(w => w.french));
  const coreOnly = app.systemWords.find(w => !courseKeys.has(w.french) && !glossaryKeys.has(w.french));
  assert.equal(manager.parseTxtWordbook(coreOnly.french, 'french').autoMatchedCount, 1);
  const manual = manager.parseTxtWordbook('acteur\n自定义释义', 'french');
  assert.equal(manual.words[0].meaning, '自定义释义');
  assert.equal(manual.autoMatchedCount, 0);
});
console.log(`Learning regressions OK: ${passed} passed, 0 failed`);
