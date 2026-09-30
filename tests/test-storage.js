#!/usr/bin/env node
/**
 * Dimenticato — 存储层测试
 *
 * 用 tests/dom-shim.js 在 Node 里加载真实的 lib/storage.js（DimStorage / Prefs /
 * LegacyMigration），直接调用发布出去的实现，而不是复制一份。
 *
 *   node tests/test-storage.js
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
  try {
    fn();
  } catch (e) {
    failed++;
    console.error('FAIL: ' + name + ' 抛错 — ' + (e && e.stack ? e.stack : e));
  }
}

// ===== 加载真实模块 =====
const win = createWindow();
const context = vm.createContext(win);

// 最小 schema v1 词库：德语名词 + 一个带旧 id 的词，用来测旧进度迁移
win.DIM_VOCAB = {
  de: {
    meta: { schema: 1, lang: 'de' },
    entries: [
      { word: 'Haus', display: 'das Haus', pos: 'noun', gender: 'n', zh: '房子', en: 'house', level: 'A1', rank: 1, legacyId: 'de-00001' },
      { word: 'Buch', display: 'das Buch', pos: 'noun', gender: 'n', zh: '书', en: 'book', level: 'A1', rank: 2, legacyId: 'de-00002' }
    ]
  }
};

['lib/utils.js', 'lib/languages.js', 'lib/vocab.js', 'lib/storage.js'].forEach(function (file) {
  const abs = path.join(ROOT, file);
  vm.runInContext(fs.readFileSync(abs, 'utf8'), context, { filename: abs });
});

const DimStorage = win.DimStorage;
const Prefs = win.Prefs;
const LegacyMigration = win.LegacyMigration;
const getWordbookProgressKey = vm.runInContext(
  'typeof getWordbookProgressKey === "function" ? getWordbookProgressKey : null', context);
const ls = win.localStorage;

if (!DimStorage || !Prefs || !LegacyMigration) {
  console.error('FAIL: lib/storage.js 没有暴露 DimStorage / Prefs / LegacyMigration');
  process.exit(1);
}

// ===== 分语言的 key =====
group('分语言的 key', function () {
  assertEqual(DimStorage.masteredKey('italian'), 'dimenticato_mastered', '意大利语沿用历史 key');
  assertEqual(DimStorage.masteredKey('german'), 'dimenticato_german_mastered', '德语已掌握 key');
  assertEqual(DimStorage.statsKey('french'), 'dimenticato_french_stats', '法语统计 key');

  assert(typeof getWordbookProgressKey === 'function', 'getWordbookProgressKey 存在');
  const it = getWordbookProgressKey('wb1', 'italian');
  const de = getWordbookProgressKey('wb1', 'german');
  assert(it !== de, '同一个单词本在不同语言下用不同的 key');
  assert(de.indexOf('german') !== -1, 'key 里带语言段');
  assertEqual(getWordbookProgressKey('wb1'), it, '不传语言时默认意大利语');
});

// ===== 导出 =====
group('导出包含全部语言与单词本进度', function () {
  ls.clear();
  ls.setItem('dimenticato_custom_wordbooks', JSON.stringify([{ id: 'wb1', name: '我的词本', language: 'german', words: [] }]));
  ls.setItem('dimenticato_mastered', JSON.stringify(['ciao']));
  ls.setItem('dimenticato_german_mastered', JSON.stringify(['Haus']));
  ls.setItem(getWordbookProgressKey('wb1', 'german'), JSON.stringify(['Haus', 'Buch']));
  ls.setItem('unrelated_app_token', 'x');

  const dump = DimStorage.exportAll();
  assertEqual(dump.version, '2.0', '导出带版本号');
  assert(dump.keys['dimenticato_german_mastered'] !== undefined, '导出包含德语进度');
  assert(dump.keys['unrelated_app_token'] === undefined, '导出不带同源其它应用的键');
  assertEqual(JSON.parse(dump.data.masteredWords).length, 1, '1.0 兼容层含意大利语进度');
  assert(!!dump.data.wordbookProgress.wb1, '1.0 兼容层含单词本进度');

  const desc = DimStorage.describePayload(dump);
  assertEqual(desc.wordbooks, 1, '摘要统计单词本数');
  assertEqual(desc.languages.length, 2, '摘要列出有进度的语言');
});

// ===== 导入 =====
group('覆盖导入（1.0 旧备份）', function () {
  ls.clear();
  const payload = {
    version: '1.0',
    data: {
      masteredWords: JSON.stringify(['ciao', 'grazie']),
      stats: JSON.stringify({ mcAttempts: 5, mcCorrect: 4, spAttempts: 2, spCorrect: 1 }),
      theme: 'dark',
      customWordbooks: JSON.stringify([{ id: 'wb1', name: '我的词本', language: 'german', words: [] }]),
      dailyStats: JSON.stringify({ '2026-01-01': { learned: 3 } }),
      wordbookProgress: { wb1: JSON.stringify(['Haus']) }
    }
  };
  const result = DimStorage.importAll(payload, { mode: 'overwrite' });
  assertEqual(result.mode, 'overwrite', '覆盖模式');
  assertEqual(JSON.parse(ls.getItem('dimenticato_mastered')).length, 2, '写入已掌握单词');
  assertEqual(JSON.parse(ls.getItem('dimenticato_stats')).mcCorrect, 4, '写入统计');
  assertEqual(ls.getItem('dimenticato_theme'), 'dark', '写入主题');
  assert(ls.getItem(getWordbookProgressKey('wb1', 'german')) !== null, '旧备份的单词本进度落到分语言 key');
});

group('合并导入保留本地进度', function () {
  ls.clear();
  ls.setItem('dimenticato_mastered', JSON.stringify(['ciao']));
  ls.setItem('dimenticato_stats', JSON.stringify({ mcAttempts: 2, mcCorrect: 1, spAttempts: 0, spCorrect: 0 }));
  ls.setItem('dimenticato_custom_wordbooks', JSON.stringify([{ id: 'local', name: '本地', language: 'italian', words: [] }]));

  DimStorage.importAll({
    version: '2.0',
    keys: {
      dimenticato_mastered: JSON.stringify(['grazie']),
      dimenticato_stats: JSON.stringify({ mcAttempts: 3, mcCorrect: 2, spAttempts: 1, spCorrect: 1 }),
      dimenticato_custom_wordbooks: JSON.stringify([{ id: 'wb1', name: '导入的', language: 'german', words: [] }]),
      not_ours: 'x'
    }
  }, { mode: 'merge' });

  const merged = JSON.parse(ls.getItem('dimenticato_mastered'));
  assertEqual(merged.length, 2, '已掌握单词取并集');
  assertEqual(JSON.parse(ls.getItem('dimenticato_stats')).mcAttempts, 5, '计数器累加');
  assertEqual(JSON.parse(ls.getItem('dimenticato_custom_wordbooks')).length, 2, '保留双方的单词本');
  assertEqual(ls.getItem('not_ours'), null, '只导入 dimenticato_ 前缀的键');
});

group('空载荷导入报错', function () {
  let threw = false;
  try { DimStorage.importAll({ version: '2.0', keys: {} }); } catch (e) { threw = true; }
  assert(threw, '没有可导入的内容时抛错，调用方给出提示');
});

// ===== 重置 =====
group('reset 按语言、只删进度', function () {
  ls.clear();
  ls.setItem('dimenticato_mastered', '["ciao"]');
  ls.setItem('dimenticato_german_mastered', '["Haus"]');
  ls.setItem('dimenticato_progress_wb_german_wb1', '["Haus"]');
  ls.setItem('dimenticato_custom_wordbooks', '[]');
  ls.setItem('dimenticato_theme', 'dark');
  ls.setItem('dimenticato_prefs', '{}');
  ls.setItem('unrelated_app_token', 'keep-me');
  ls.setItem('dimenticato_cognate_progress_german', '{}');
  ls.setItem('dimenticato_typing_best_german_vocab', '120');

  const res = DimStorage.reset({ scope: 'german' });
  assertEqual(res.scope, 'german', '范围是德语');
  assertEqual(ls.getItem('dimenticato_german_mastered'), null, '删掉德语已掌握');
  assertEqual(ls.getItem('dimenticato_progress_wb_german_wb1'), null, '删掉德语单词本进度');
  assertEqual(ls.getItem('dimenticato_mastered'), '["ciao"]', '不动意大利语');
  assertEqual(ls.getItem('dimenticato_cognate_progress_german'), null, '删掉德语同源词进度');
  assertEqual(ls.getItem('dimenticato_typing_best_german_vocab'), null, '删掉德语打字游戏纪录');

  DimStorage.reset({ scope: 'all' });
  assertEqual(ls.getItem('dimenticato_mastered'), null, '全部重置删掉意大利语');
  assertEqual(ls.getItem('dimenticato_custom_wordbooks'), '[]', '单词本内容保留');
  assertEqual(ls.getItem('dimenticato_theme'), 'dark', '主题保留');
  assertEqual(ls.getItem('dimenticato_prefs'), '{}', '练习偏好保留');
  assertEqual(ls.getItem('unrelated_app_token'), 'keep-me', '不碰同源里别的应用数据');
});

// ===== Prefs =====
group('Prefs 按语言保存、带默认值', function () {
  ls.clear();
  assertEqual(Prefs.get('german').level, 'A2', '默认等级 A2');
  Prefs.set('german', { level: 'B1', filter: 'due' });
  assertEqual(Prefs.get('german').level, 'B1', '写入后读回');
  assertEqual(Prefs.get('german').session, '20', '未写的字段仍是默认值');
  assertEqual(Prefs.get('french').level, 'A2', '不同语言互不影响');
});

// ===== 旧进度迁移 =====
group('LegacyMigration 把旧 id / 旧 SRS key 改写成 entry.word', function () {
  ls.clear();
  ls.setItem('dimenticato_german_mastered', JSON.stringify(['de-00001', 'Buch']));
  ls.setItem('dimenticato_german_sr', JSON.stringify({ 'de-00002': { interval: 3, lastReviewDate: '2026-01-02' } }));
  ls.setItem('dimenticato_mastery_streak_german', JSON.stringify({ 'de-00001': 1 }));

  const res = LegacyMigration.run('german');
  assert(res.changed > 0, '有改动');
  const mastered = JSON.parse(ls.getItem('dimenticato_german_mastered'));
  assert(mastered.indexOf('Haus') !== -1 && mastered.indexOf('Buch') !== -1, '旧 id 改成词形');
  assertEqual(mastered.length, 2, '不重复');
  const srs = JSON.parse(ls.getItem('dimenticato_srs_german'));
  assert(!!srs.Buch, '旧 SRS 并入 dimenticato_srs_german 并改键');
  assertEqual(ls.getItem('dimenticato_german_sr'), null, '旧 SRS key 并入后删除');
  assertEqual(JSON.parse(ls.getItem('dimenticato_mastery_streak_german')).Haus, 1, '连续答对计数改键');

  const again = LegacyMigration.run('german');
  assertEqual(again.changed, 0, '幂等：第二次运行没有改动');

  ls.setItem('dimenticato_german_mastered', JSON.stringify(['Unbekannt']));
  LegacyMigration.run('german');
  assertEqual(JSON.parse(ls.getItem('dimenticato_german_mastered'))[0], 'Unbekannt', '解析不出的旧键原样保留');
});

// ===== 汇总 =====
ls.clear();
const summary = passed + ' passed, ' + failed + ' failed';
if (failed) {
  console.error('Storage FAILED: ' + summary);
  process.exit(1);
}
console.log('Storage OK: ' + summary);
