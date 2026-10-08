#!/usr/bin/env node
/**
 * Dimenticato — 动词变位应用层冒烟测试
 *
 *   node tests/test-conjugation-app.js
 *
 * 用 dom-shim 加载 conjugation-app.js 和真实的 conjugations/1 数据（意 / 法），验证：
 *   - openFor 接受 code 和旧 key，时态矩阵的行 / 列来自数据头（meta.groups + tense.time）
 *   - 查词：原形、变位形式、去重音
 *   - 人称标签覆盖（意语命令式 Lei）、省略人称（命令式无 io）
 *   - 法语省音：变位表写 j'ai，判分接受 ai / j'ai / j' ai，嘘音 h 不省音（je hais）
 *   - 每次作答经 StatsManager.recordActivity 记录
 *   - 进度 key 统一为 dimenticato_conjugation_lessons_<code>，旧 key 一次性迁移
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createWindow } = require('./dom-shim.js');

const ROOT = path.resolve(__dirname, '..');

let passed = 0, failed = 0;
function assert(condition, message) {
  if (condition) { passed++; return; }
  failed++;
  console.error('FAIL: ' + message);
}
function assertEqual(actual, expected, message) {
  assert(actual === expected, message + ' (expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual) + ')');
}
function group(name, fn) {
  try { fn(); } catch (e) {
    failed++;
    console.error('FAIL: ' + name + ' 抛错 — ' + (e && e.stack ? e.stack : e));
  }
}

const win = createWindow();
// dom-shim 的元素没有 focus()；应用里聚焦输入框只是体验，这里补成空操作（不可枚举）
Object.defineProperty(Object.prototype, 'focus', { value() {}, writable: true, configurable: true, enumerable: false });
const context = vm.createContext(win);

const ids = [
  'conjLessonSizeSelect', 'conjPrevLessonBtn', 'conjNextLessonBtn', 'conjLessonLabel', 'conjLessonCompletedBadge',
  'conjActiveLessonInfo', 'conjModuleHint', 'conjTenseButtons', 'conjLookupInput', 'conjLookupSearchBtn',
  'conjLookupClearBtn', 'conjLookupResults', 'conjLookupEmptyState', 'conjModeMcqBtn', 'conjModeTypingBtn',
  'conjModeFullBtn', 'conjAdvanceLessonBtn', 'conjCurrent', 'conjTotal', 'conjAccuracy', 'conjTenseTitle',
  'conjInfinitive', 'conjEnglishLine', 'conjEnglish', 'conjPromptLabel', 'conjPronoun', 'conjTypingSection',
  'conjInput', 'conjCheckBtn', 'conjMcqSection', 'conjOptions', 'conjFullSection', 'conjFullGrid',
  'conjFullCheckBtn', 'conjNextBtn', 'conjRestartBtn', 'conjBackBtn'
];
win.document.body.innerHTML =
  '<section id="conjugationSetupScreen" class="screen"><div class="eyebrow">Grammar / Verb Conjugation</div>' +
  '<button id="conjugationSetupBackBtn"></button></section>' +
  '<section id="conjugationScreen" class="screen">' +
  ids.map((id) => (/Input$/.test(id) ? `<input id="${id}">` : `<div id="${id}"></div>`)).join('') +
  '<div id="conjFeedback"><span class="feedback-text"></span></div>' +
  '</section>';
win.document.getElementById('conjugationSetupScreen').scrollIntoView = () => {};
win.document.getElementById('conjLessonSizeSelect').value = '10';

// 旧进度：意大利语曾用无后缀 key；法语一直是 _fr
win.localStorage.setItem('dimenticato_conjugation_lessons', JSON.stringify({ completed: { x__10: [0] }, lastViewed: {} }));
win.localStorage.setItem('dimenticato_conjugation_lessons_fr', JSON.stringify({ completed: {}, lastViewed: { y__10: 2 } }));

const recorded = [];
win.StatsManager = { recordActivity: (lang, payload) => recorded.push({ lang, payload }) };
win.showScreen = () => {};
win.LangLoader = {
  data: (lang, module) => ((win.DIM_DATA || {})[module] || {})[win.Languages.code(lang)] || null,
  isModuleLoaded: () => true,
  ensureModule: () => Promise.resolve()
};

['lib/languages.js', 'lib/utils.js', 'data/it-conjugations.js', 'data/fr-conjugations.js', 'conjugation-app.js']
  .forEach((file) => {
    const abs = path.join(ROOT, file);
    vm.runInContext(fs.readFileSync(abs, 'utf8'), context, { filename: abs });
  });
win.document.dispatchEvent({ type: 'DOMContentLoaded' });
const CP = win.ConjugationPractice;
const $ = (id) => win.document.getElementById(id);

group('storage key + migration', () => {
  assertEqual(CP.storageKeyFor('it'), 'dimenticato_conjugation_lessons_it', 'key 统一按 code');
  CP.openFor('italian');
  assertEqual(win.localStorage.getItem('dimenticato_conjugation_lessons'), null, '意语旧 key 迁移后删除');
  assert(JSON.parse(win.localStorage.getItem('dimenticato_conjugation_lessons_it')).completed.x__10, '意语旧进度搬到 _it');
  CP.openFor('fr');
  assertEqual(JSON.parse(win.localStorage.getItem('dimenticato_conjugation_lessons_fr')).lastViewed.y__10, 2, '法语本来就是 _fr，原样保留');
});

group('italian matrix + lookup', () => {
  CP.openFor('it');
  const html = $('conjTenseButtons').innerHTML;
  assert(html.indexOf('直陈式') !== -1 && html.indexOf('命令式') !== -1, '矩阵行来自 meta.groups 的中文名');
  assert(html.indexOf('其他时态') !== -1 && html.indexOf('data-tense="gerundio"') !== -1, '无 time 的时态进「其他时态」');
  assert(/例如/.test($('conjLookupInput').placeholder), 'placeholder 来自 meta.placeholders');
  assertEqual(win.document.querySelector('#conjugationSetupScreen .eyebrow').textContent, '意大利语 / Verb Conjugation', '语言名来自 Languages');

  const byWord = CP.searchVerbLookup('essere');
  assertEqual(byWord.length && byWord[0].word, 'essere', '原形查词');
  assert(CP.searchVerbLookup('fossi').some((v) => v.word === 'essere'), '变位形式查词');
  assert(CP.searchVerbLookup('ando').some((v) => v.word === 'andare'), '去重音查词（andò）');

  $('conjLookupInput').value = 'essere';
  $('conjLookupSearchBtn').click();
  const res = $('conjLookupResults').innerHTML;
  assert(res.indexOf('Lei') !== -1, '命令式第三人称显示 Lei');
  assert(res.indexOf('stato / stata') !== -1, '过去分词的阴阳性异体按 / 展示');
});

group('italian typing practice records activity', () => {
  CP.openFor('it');
  win.document.querySelector('[data-tense="indicativo_presente"]').click();
  $('conjModeTypingBtn').click();
  const before = recorded.length;
  const answer = $('conjPronoun').textContent; // 人称标签
  assert(answer, '题面应显示人称');
  $('conjInput').value = 'zzz';
  $('conjCheckBtn').click();
  assertEqual(recorded.length, before + 1, '作答应记录一次');
  const last = recorded[recorded.length - 1];
  assertEqual(last.lang, 'italian', 'StatsManager 收到语言 key');
  assertEqual(last.payload.total, 1, 'total = 1');
  assertEqual(last.payload.correct, 0, '答错 correct = 0');
  assert(typeof last.payload.durationMs === 'number', '带 durationMs');
  $('conjCheckBtn').click();
  assertEqual(recorded.length, before + 1, '同一题重复提交不重复记录');
});

group('imperative omits io', () => {
  CP.openFor('it');
  win.document.querySelector('[data-tense="imperativo_affermativo"]').click();
  $('conjModeFullBtn').click();
  const grid = $('conjFullGrid').innerHTML;
  assert(grid.indexOf('data-key="p1"') === -1, '命令式不出 io');
  assert(grid.indexOf('Lei') !== -1, '命令式人称标签用 Lei');
});

group('french elision', () => {
  CP.openFor('french');
  $('conjLookupInput').value = 'avoir';
  $('conjLookupSearchBtn').click();
  const res = $('conjLookupResults').innerHTML;
  assert(res.indexOf('j&#39;ai') !== -1 || res.indexOf("j'ai") !== -1, "法语直陈式写作 j'ai");
  $('conjLookupInput').value = 'haïr';
  $('conjLookupSearchBtn').click();
  assert($('conjLookupResults').innerHTML.indexOf('je hais') !== -1, '嘘音 h 不省音：je hais');

  win.document.querySelector('[data-tense="indicatif_present"]').click();
  $('conjModeFullBtn').click();
  // 找到 avoir 那一组（第 1 课按词频，être / avoir 都在）
  let guard = 0;
  while ($('conjInfinitive').textContent !== 'avoir' && guard++ < 20) $('conjNextBtn').click();
  assertEqual($('conjInfinitive').textContent, 'avoir', '第 1 课含 avoir');
  const inputs = $('conjFullGrid').querySelectorAll('.conj-full-input');
  ["j' ai", 'tu as', 'a', 'nous avons', 'avez', 'ont'].forEach((v, i) => { inputs[i].value = v; });
  const before = recorded.length;
  $('conjFullCheckBtn').click();
  const last = recorded[recorded.length - 1];
  assertEqual(recorded.length, before + 1, '整组作答记录一次');
  assertEqual(last.lang, 'french', '法语 key');
  assertEqual(last.payload.correct, 6, "j' ai / tu as / 裸形式都算对");
  assertEqual(last.payload.total, 6, '六个人称');
});

console.log(`Conjugation App OK: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
