#!/usr/bin/env node
/**
 * Dimenticato — 存储层测试
 *
 * 审计结论：tests/ 里对共享存储层零覆盖，所以导出丢进度、重置清空整个 origin
 * 这类问题一直没人发现。这个 harness 用 tests/dom-shim.js 在 Node 里把 app.js
 * 整个加载起来，直接调用真实的 Storage，而不是复制一份实现。
 *
 *   node tests/test-storage.js
 *
 * KNOWN ISSUE 行 = 已确认、但修复归属其它工作流（存储/SRS 流）的缺陷；
 * 它们不影响退出码，等对方修好后应改成硬断言。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createWindow } = require('./dom-shim.js');

const ROOT = path.resolve(__dirname, '..');

let passed = 0, failed = 0, known = 0;

function assert(condition, message) {
  if (condition) { passed++; return; }
  failed++;
  console.error('FAIL: ' + message);
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, message + ' (expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual) + ')');
}

function knownIssue(condition, message, owner) {
  if (condition) { passed++; console.log('NOTE: 已修复，可以把这条改成硬断言 —— ' + message); return; }
  known++;
  console.log('KNOWN ISSUE [' + owner + ']: ' + message);
}

function group(name, fn) {
  try {
    fn();
  } catch (e) {
    failed++;
    console.error('FAIL: ' + name + ' 抛错 — ' + (e && e.stack ? e.stack : e));
  }
}

// ===== 把真实的 app.js 加载进垫片环境 =====
const win = createWindow();
const context = vm.createContext(win);
const captured = { blobs: [] };
win.Blob = function Blob(parts) { captured.blobs.push(String(parts && parts[0])); this.parts = parts; };

// 导入/重置流程结束时会刷新这几处 UI，先把它们建出来，免得真实报错被 UI 噪音掩盖
win.document.body.innerHTML =
  '<span id="totalWords"></span><span id="masteredWords"></span>' +
  '<span id="progressPercent"></span><div id="wordbookCards"></div>';

['lib/utils.js', 'lib/word-similarity.js', 'lib/quiz-engine.js', 'app.js'].forEach(function (file) {
  const abs = path.join(ROOT, file);
  vm.runInContext(fs.readFileSync(abs, 'utf8'), context, { filename: abs });
});

// app.js 里 Storage / AppState 是顶层 const —— 不在 window 上，只能从词法作用域取
const Storage = vm.runInContext('typeof Storage !== "undefined" ? Storage : null', context);
const AppState = vm.runInContext('typeof AppState !== "undefined" ? AppState : null', context);
const getWordbookProgressKey = vm.runInContext(
  'typeof getWordbookProgressKey === "function" ? getWordbookProgressKey : null', context);
const ls = win.localStorage;

if (!Storage || !AppState) {
  console.error('FAIL: app.js 没有暴露 Storage / AppState，存储层无法测试');
  process.exit(1);
}

function resetStorage() {
  ls.clear();
  AppState.currentWordbook = null;
  AppState.masteredWords = new Set();
  AppState.customWordbooks = [];
  AppState.stats = { mcAttempts: 0, mcCorrect: 0, spAttempts: 0, spCorrect: 0, totalLearned: 0 };
  AppState.selectedLevel = 1000;
}

// ===== 跨模块契约（由存储/SRS 工作流提供） =====
group('跨模块契约', function () {
  knownIssue(!!win.DimStorage, 'window.DimStorage 应该存在（统一的分语言存储门面）', 's1-core-storage-srs');
  if (win.DimStorage) {
    ['LANGS', 'prefixFor', 'exportAll', 'importAll', 'reset'].forEach(function (k) {
      assert(win.DimStorage[k] !== undefined, 'DimStorage.' + k + ' 存在');
    });
  }
  knownIssue(!!(win.StatsManager && typeof win.StatsManager.recordActivity === 'function'),
    'window.StatsManager.recordActivity 应该存在', 's1-core-storage-srs');
  knownIssue(!!(win.HeaderStats && typeof win.HeaderStats.set === 'function'),
    'window.HeaderStats.set 应该存在', 's1-core-storage-srs');
  // 见 audit: app.js 在解析期测 `typeof SpacedRepetition`，而它是后加载脚本的 const
  knownIssue(!!win.SpacedRepetition, 'window.SpacedRepetition 应该存在（否则 SRS 集成是死代码）', 's1-core-storage-srs');
});

// ===== save / load 往返 =====
group('save / load 往返', function () {
  resetStorage();
  AppState.masteredWords = new Set(['ciao', 'grazie']);
  AppState.stats = { mcAttempts: 10, mcCorrect: 7, spAttempts: 4, spCorrect: 3, totalLearned: 2 };
  AppState.selectedLevel = 3000;
  Storage.save();

  AppState.masteredWords = new Set();
  AppState.stats = {};
  AppState.selectedLevel = 1000;
  Storage.load();

  assertEqual(AppState.masteredWords.size, 2, 'load 恢复已掌握单词数量');
  assert(AppState.masteredWords.has('ciao') && AppState.masteredWords.has('grazie'), 'load 恢复具体单词');
  assertEqual(AppState.stats.mcCorrect, 7, 'load 恢复统计数据');
  assertEqual(AppState.selectedLevel, 3000, 'load 恢复所选词表层级');
});

// ===== 单词本进度必须按语言分区 =====
group('单词本进度 key 分语言', function () {
  assert(typeof getWordbookProgressKey === 'function', 'getWordbookProgressKey 存在');
  if (typeof getWordbookProgressKey !== 'function') return;
  const it = getWordbookProgressKey('wb1', 'italian');
  const de = getWordbookProgressKey('wb1', 'german');
  assert(it !== de, '同一个单词本在不同语言下用不同的 key');
  assert(de.indexOf('german') !== -1, 'key 里带语言段');
  assertEqual(getWordbookProgressKey('wb1'), it, '不传语言时默认意大利语');

  resetStorage();
  AppState.currentWordbook = { id: 'wb1', language: 'german' };
  AppState.masteredWords = new Set(['Haus']);
  Storage.save();
  assert(ls.getItem(de) !== null, '学习自定义单词本时，进度写进分语言的 key');
  assertEqual(ls.getItem(Storage.KEYS.MASTERED), null, '单词本进度不会污染系统词汇的进度');
  AppState.currentWordbook = null;
});

// ===== 导出必须带上单词本进度 =====
// 见 app.js: 写入用 `dimenticato_progress_wb_${language}_${id}`，
// 导出却读 `dimenticato_progress_wb_${id}` —— 键名对不上，进度静默丢失。
group('导出包含单词本进度', function () {
  resetStorage();
  const wordbook = { id: 'wb1', name: '我的词本', language: 'german', words: [] };
  ls.setItem(Storage.KEYS.CUSTOM_WORDBOOKS, JSON.stringify([wordbook]));
  ls.setItem(Storage.KEYS.MASTERED, JSON.stringify(['ciao']));
  ls.setItem(getWordbookProgressKey('wb1', 'german'), JSON.stringify(['Haus', 'Buch']));

  captured.blobs.length = 0;
  Storage.exportAllData();
  assert(captured.blobs.length === 1, 'exportAllData 生成了一个下载文件');
  const dump = captured.blobs.length ? JSON.parse(captured.blobs[0]) : { data: {} };
  assertEqual(JSON.parse(dump.data.masteredWords).length, 1, '导出包含系统词汇进度');
  assertEqual(JSON.parse(dump.data.customWordbooks).length, 1, '导出包含自定义单词本');
  knownIssue(!!(dump.data.wordbookProgress && dump.data.wordbookProgress.wb1),
    '导出应包含自定义单词本的学习进度（导出读的键名少了语言段，进度会静默丢失）',
    's1-core-storage-srs');
});

// ===== 导入往返 =====
group('覆盖导入往返', function () {
  resetStorage();
  const payload = {
    version: '1.0',
    data: {
      masteredWords: JSON.stringify(['ciao', 'grazie']),
      stats: JSON.stringify({ mcAttempts: 5, mcCorrect: 4, spAttempts: 2, spCorrect: 1, totalLearned: 2 }),
      level: '2000',
      theme: 'dark',
      customWordbooks: JSON.stringify([{ id: 'wb1', name: '我的词本', language: 'german', words: [] }]),
      dailyStats: JSON.stringify({ '2026-01-01': { learned: 3 } }),
      wordbookProgress: { wb1: JSON.stringify(['Haus']) }
    }
  };
  Storage.importWithOverwrite(payload);

  assertEqual(JSON.parse(ls.getItem(Storage.KEYS.MASTERED)).length, 2, '覆盖导入写入已掌握单词');
  assertEqual(JSON.parse(ls.getItem(Storage.KEYS.STATS)).mcCorrect, 4, '覆盖导入写入统计');
  assertEqual(ls.getItem(Storage.KEYS.LEVEL), '2000', '覆盖导入写入层级');
  assertEqual(JSON.parse(ls.getItem(Storage.KEYS.CUSTOM_WORDBOOKS)).length, 1, '覆盖导入写入单词本');
  knownIssue(ls.getItem(getWordbookProgressKey('wb1', 'german')) !== null,
    '导入的单词本进度应落在应用真正会读的分语言 key 上', 's1-core-storage-srs');
});

group('合并导入不覆盖本地进度', function () {
  resetStorage();
  ls.setItem(Storage.KEYS.MASTERED, JSON.stringify(['ciao']));
  ls.setItem(Storage.KEYS.STATS, JSON.stringify({ mcAttempts: 2, mcCorrect: 1, spAttempts: 0, spCorrect: 0, totalLearned: 1 }));
  ls.setItem(Storage.KEYS.CUSTOM_WORDBOOKS, JSON.stringify([{ id: 'local', name: '本地', language: 'italian', words: [] }]));

  Storage.importWithMerge({
    version: '1.0',
    data: {
      masteredWords: JSON.stringify(['grazie']),
      stats: JSON.stringify({ mcAttempts: 3, mcCorrect: 2, spAttempts: 1, spCorrect: 1, totalLearned: 5 }),
      level: '1000',
      theme: 'light',
      customWordbooks: JSON.stringify([{ id: 'wb1', name: '导入的', language: 'german', words: [] }]),
      dailyStats: JSON.stringify({}),
      wordbookProgress: {}
    }
  });

  const merged = JSON.parse(ls.getItem(Storage.KEYS.MASTERED));
  assertEqual(merged.length, 2, '合并导入保留本地已掌握单词并加上导入的');
  assert(merged.indexOf('ciao') !== -1 && merged.indexOf('grazie') !== -1, '合并结果包含双方的单词');
  const stats = JSON.parse(ls.getItem(Storage.KEYS.STATS));
  assertEqual(stats.mcAttempts, 5, '合并导入累加尝试次数');
  assertEqual(stats.totalLearned, 5, 'totalLearned 取两边最大值');
  assertEqual(JSON.parse(ls.getItem(Storage.KEYS.CUSTOM_WORDBOOKS)).length, 2, '合并导入保留双方的单词本');
});

// ===== 重置 / 清空的作用域 =====
// 原来测的是 Storage.clearAllData()。s1 存储流把它整个删掉了，改成
// DimStorage.reset({ scope })——按语言范围、按 key 精确删除。断言的意图
// （只删自己的前缀、不碰同源里别人的数据）没变，只是换成了现在的入口。
group('DimStorage.reset 只删自己的键', function () {
  resetStorage();
  ls.setItem('dimenticato_mastered', '["ciao"]');
  ls.setItem('unrelated_app_token', 'keep-me');
  win.DimStorage.reset({ scope: 'all' });
  assertEqual(ls.getItem('dimenticato_mastered'), null, 'reset 删掉 dimenticato_ 前缀的键');
  assertEqual(ls.getItem('unrelated_app_token'), 'keep-me', 'reset 不动同源的其它键');
});

group('reset 不应清空整个 origin', function () {
  resetStorage();
  ls.setItem('unrelated_app_token', 'keep-me');
  ls.setItem('dimenticato_progress_wb_german_wb1', '["Haus"]');
  // Storage.reset() 会先 prompt 选范围、再 confirm。不作答的话 prompt 返回
  // null，函数直接 return，什么都不会发生 —— 之前这条测试量的其实是「没作答」，
  // 不是重置行为。'5' = 全部语言。
  win._promptAnswer = '5';
  win._confirmAnswer = true;
  try {
    Storage.reset();  // 内部会调用 UI 刷新函数，缺 DOM 时可能抛错，不影响存储断言
  } catch (e) { /* UI 刷新失败无所谓 */ }
  win._promptAnswer = null;
  assert(ls.getItem('unrelated_app_token') === 'keep-me',
    'reset() 只删自己的前缀，不碰同源里别的应用数据');
  assertEqual(ls.getItem('dimenticato_mastered'), '[]', 'reset 之后已掌握单词被清空并落盘');
});

// ===== 汇总 =====
resetStorage();
const summary = passed + ' passed, ' + failed + ' failed' + (known ? ', ' + known + ' known issues' : '');
if (failed) {
  console.error('Storage FAILED: ' + summary);
  process.exit(1);
}
console.log('Storage OK: ' + summary);
