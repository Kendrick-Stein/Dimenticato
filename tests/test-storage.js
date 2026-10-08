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
  },
  // 改了拼写的词头：entry.legacyWord 是旧的 word
  en: {
    meta: { schema: 1, lang: 'en' },
    entries: [
      { word: 'York', pos: 'noun', zh: '约克', level: 'B1', rank: 1, legacyWord: 'york' },
      { word: 'USA', pos: 'noun', zh: '美国', level: 'A2', rank: 2, legacyWord: 'usa' },
      { word: 'house', pos: 'noun', zh: '房子', level: 'A1', rank: 3 }
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
const ls = win.localStorage;

if (!DimStorage || !Prefs || !LegacyMigration) {
  console.error('FAIL: lib/storage.js 没有暴露 DimStorage / Prefs / LegacyMigration');
  process.exit(1);
}

function read(key) { return JSON.parse(ls.getItem(key)); }

// ===== key 方案 =====
group('统一 key 方案 dimenticato_<code>_<name>', function () {
  assertEqual(DimStorage.key('italian', 'mastered'), 'dimenticato_it_mastered', '意大利语不再特殊');
  assertEqual(DimStorage.key('de', 'srs'), 'dimenticato_de_srs', '接受 code');
  assertEqual(DimStorage.key('german', 'srs'), 'dimenticato_de_srs', '接受旧语言 key');
  assertEqual(DimStorage.masteredKey('italian'), 'dimenticato_it_mastered', 'masteredKey 是 key() 的包装');
  assertEqual(DimStorage.statsKey('french'), 'dimenticato_fr_stats', 'statsKey 是 key() 的包装');
  assertEqual(DimStorage.wordbookKey('german', 'wb1'), 'dimenticato_de_wb_wb1', '词本进度 key');
  assertEqual(DimStorage.key(null, 'mastered'), 'dimenticato_it_mastered', '不传语言且无当前语言时落到默认语言');
  const parsed = DimStorage.parseKey('dimenticato_de_wb_12');
  assert(parsed && parsed.code === 'de' && parsed.name === 'wb_12', 'parseKey 拆出 code / name');
  assertEqual(DimStorage.parseKey('dimenticato_german_mastered'), null, '旧布局不是 v3 key');
  assertEqual(DimStorage.parseKey('dimenticato_theme'), null, '全局 key 不是语言 key');
});

// ===== 旧布局迁移：真实的旧 IT + DE 存档 =====
// v2 时代一位同时学意大利语和德语的用户的 localStorage（字段形状照搬旧代码）
function seedLegacySnapshot() {
  ls.clear();
  const old = {
    dimenticato_theme: 'dark',
    dimenticato_language: 'german',
    dimenticato_quiz_difficulty: 'hard',
    dimenticato_custom_wordbooks: JSON.stringify([
      { id: 1700000000000, name: '旅行', language: 'italian', words: [{ word: 'treno', zh: '火车' }] },
      { id: 1700000000001, name: 'Reise', language: 'german', words: [{ word: 'Zug', zh: '火车' }] }
    ]),
    // 意大利语：无前缀
    dimenticato_mastered: JSON.stringify(['ciao', 'grazie', 'casa']),
    dimenticato_stats: JSON.stringify({ mcAttempts: 40, mcCorrect: 31, spAttempts: 12, spCorrect: 9 }),
    dimenticato_daily_stats: JSON.stringify({
      '2026-09-30': { date: '2026-09-30', duration: 600, wordsLearned: ['ciao', 'casa'], correctCount: 8, totalCount: 10, reviewCount: 1 }
    }),
    dimenticato_srs_italian: JSON.stringify({
      ciao: { easiness: 2.5, interval: 6, repetitions: 2, nextReviewDate: '2026-10-06', lastReviewDate: '2026-09-30', reviewHistory: [] },
      casa: { easiness: 2.6, interval: 15, repetitions: 3, nextReviewDate: '2026-10-15', lastReviewDate: '2026-09-30', reviewHistory: [] }
    }),
    dimenticato_mastery_streak_italian: JSON.stringify({ grazie: 1 }),
    dimenticato_progress_wb_1700000000000: JSON.stringify(['treno']),          // 最早的无语言段词本进度
    dimenticato_progress_wb_italian_1700000000000: JSON.stringify(['biglietto']),
    dimenticato_quiz_direction_italian: 'reverse',
    // 德语：dimenticato_<german>_… 与 *_<german> 两种写法混用
    dimenticato_german_mastered: JSON.stringify(['de-00001', 'Buch']),
    dimenticato_german_stats: JSON.stringify({ mcAttempts: 20, mcCorrect: 15, spAttempts: 0, spCorrect: 0 }),
    dimenticato_daily_stats_german: JSON.stringify({
      '2026-10-01': { date: '2026-10-01', duration: 300, wordsLearned: ['Haus'], correctCount: 5, totalCount: 6, reviewCount: 0 }
    }),
    dimenticato_srs_german: JSON.stringify({
      Haus: { easiness: 2.5, interval: 1, repetitions: 1, nextReviewDate: '2026-10-02', lastReviewDate: '2026-10-01', reviewHistory: [] }
    }),
    dimenticato_german_sr: JSON.stringify({   // 统一运行时之前德语独立 app 的 SM-2
      'de-00002': { easiness: 2.5, interval: 6, repetitions: 3, nextReviewDate: '2026-09-20', lastReviewDate: '2026-09-14', reviewHistory: [] }
    }),
    dimenticato_mastery_streak_german: JSON.stringify({ 'de-00001': 1 }),
    dimenticato_progress_wb_german_1700000000001: JSON.stringify(['Zug']),
    dimenticato_quiz_difficulty_german: 'easy',
    dimenticato_prefs: JSON.stringify({ italian: { level: 'B1', source: 'wb:1700000000000' }, german: { level: 'A1' } }),
    // 模块自有 key：由各模块迁移，这里必须原样保留
    dimenticato_conjugation_lessons: JSON.stringify({ 1: true }),
    dimenticato_cognate_progress_german: JSON.stringify({ seen: 3 }),
    dimenticato_german_course_level: 'A2',
    dimenticato_typing_best_german_vocab: '120'
  };
  Object.keys(old).forEach(function (k) { ls.setItem(k, old[k]); });
  ls.setItem('unrelated_app_token', 'x');
  return old;
}

group('migrateStorage 把旧 IT + DE 存档并进 v3 key', function () {
  seedLegacySnapshot();
  const res = LegacyMigration.migrateStorage({ force: true });
  assert(res.ran && res.failed === 0, '迁移成功');
  assertEqual(ls.getItem('dimenticato_storage_version'), '3', '写入版本标记');

  // 意大利语
  assertEqual(read('dimenticato_it_mastered').length, 3, '意大利语已掌握');
  assertEqual(read('dimenticato_it_stats').mcAttempts, 40, '意大利语计数');
  assertEqual(read('dimenticato_it_daily_stats')['2026-09-30'].totalCount, 10, '意大利语每日统计');
  assertEqual(read('dimenticato_it_srs').casa.repetitions, 3, '意大利语 SRS');
  assertEqual(read('dimenticato_it_mastery_streak').grazie, 1, '意大利语连对计数');
  const itWb = read('dimenticato_it_wb_1700000000000');
  assert(itWb.indexOf('treno') !== -1 && itWb.indexOf('biglietto') !== -1, '两种旧词本进度 key 取并集');
  assertEqual(ls.getItem('dimenticato_it_quiz_direction'), 'reverse', '分语言出题方向');
  assertEqual(read('dimenticato_it_prefs').level, 'B1', 'prefs 拆成每语言一个 key');

  // 德语
  assertEqual(read('dimenticato_de_mastered').length, 2, '德语已掌握（改键前）');
  assertEqual(read('dimenticato_de_stats').mcCorrect, 15, '德语计数');
  assertEqual(read('dimenticato_de_daily_stats')['2026-10-01'].wordsLearned[0], 'Haus', '德语每日统计');
  const deSrs = read('dimenticato_de_srs');
  assert(!!deSrs.Haus && !!deSrs['de-00002'], '旧 dimenticato_german_sr 并入 dimenticato_de_srs');
  assertEqual(read('dimenticato_de_wb_1700000000001')[0], 'Zug', '德语词本进度');
  assertEqual(ls.getItem('dimenticato_de_quiz_difficulty'), 'easy', '分语言难度');
  assertEqual(read('dimenticato_de_prefs').level, 'A1', '德语 prefs');

  // 旧 key 全部删除；全局 key、模块 key、别的应用原样保留
  ['dimenticato_mastered', 'dimenticato_stats', 'dimenticato_daily_stats', 'dimenticato_srs_italian',
    'dimenticato_progress_wb_1700000000000', 'dimenticato_progress_wb_italian_1700000000000',
    'dimenticato_german_mastered', 'dimenticato_daily_stats_german', 'dimenticato_srs_german',
    'dimenticato_german_sr', 'dimenticato_mastery_streak_german', 'dimenticato_prefs',
    'dimenticato_quiz_difficulty_german'].forEach(function (k) {
    assertEqual(ls.getItem(k), null, '旧 key 已删除: ' + k);
  });
  assertEqual(ls.getItem('dimenticato_theme'), 'dark', '主题保留');
  assertEqual(ls.getItem('dimenticato_quiz_difficulty'), 'hard', '全局难度保留');
  assertEqual(ls.getItem('dimenticato_german_course_level'), 'A2', '模块 key 不动（由模块自己迁移）');
  assertEqual(ls.getItem('dimenticato_conjugation_lessons'), '{"1":true}', '变位课程 key 不动');
  assertEqual(ls.getItem('unrelated_app_token'), 'x', '不碰别的应用');

  // 幂等：再跑一次（含 force）没有任何变化
  const before = JSON.stringify(DimStorage.snapshot());
  assertEqual(LegacyMigration.migrateStorage().ran, false, '版本标记在位时不重跑');
  LegacyMigration.migrateStorage({ force: true });
  assertEqual(JSON.stringify(DimStorage.snapshot()), before, 'force 重跑也不改任何值');
});

group('迁移合并而不覆盖：新旧 key 同时存在', function () {
  ls.clear();
  ls.setItem('dimenticato_it_mastered', JSON.stringify(['nuovo']));
  ls.setItem('dimenticato_mastered', JSON.stringify(['vecchio']));
  ls.setItem('dimenticato_it_stats', JSON.stringify({ mcAttempts: 5, mcCorrect: 5 }));
  ls.setItem('dimenticato_stats', JSON.stringify({ mcAttempts: 9, mcCorrect: 2, spAttempts: 4 }));
  ls.setItem('dimenticato_de_daily_stats', JSON.stringify({ '2026-10-01': { totalCount: 3, wordsLearned: ['a'] } }));
  ls.setItem('dimenticato_daily_stats_german', JSON.stringify({
    '2026-10-01': { totalCount: 7, wordsLearned: ['b'] }, '2026-09-01': { totalCount: 1, wordsLearned: [] }
  }));
  ls.setItem('dimenticato_de_srs', JSON.stringify({ Haus: { repetitions: 4, lastReviewDate: '2026-10-05' } }));
  ls.setItem('dimenticato_srs_german', JSON.stringify({ Haus: { repetitions: 1, lastReviewDate: '2026-01-01' }, Buch: { repetitions: 1 } }));
  LegacyMigration.migrateStorage({ force: true });

  const m = read('dimenticato_it_mastered');
  assert(m.indexOf('nuovo') !== -1 && m.indexOf('vecchio') !== -1, '已掌握取并集');
  const st = read('dimenticato_it_stats');
  assert(st.mcAttempts === 9 && st.mcCorrect === 5 && st.spAttempts === 4, '计数逐字段取较大值并补齐');
  const day = read('dimenticato_de_daily_stats')['2026-10-01'];
  assert(day.totalCount === 7 && day.wordsLearned.length === 2, '同一天：数值取 max、词取并集');
  assert(!!read('dimenticato_de_daily_stats')['2026-09-01'], '缺的日期补齐');
  const srs = read('dimenticato_de_srs');
  assert(srs.Haus.repetitions === 4 && !!srs.Buch, 'SRS 按最近复习合并，不覆盖');
});

group('法语旧每日记录转成 StatsManager 格式', function () {
  ls.clear();
  ls.setItem('dimenticato_french_daily', JSON.stringify({
    '2026-08-01': { durationMs: 90000, words: ['maison'], correctCount: 4, totalCount: 5 }
  }));
  ls.setItem('dimenticato_french_srs', JSON.stringify({ maison: { repetitions: 2, lastReviewDate: '2026-08-01' } }));
  LegacyMigration.migrateStorage({ force: true });
  const d = read('dimenticato_fr_daily_stats')['2026-08-01'];
  assert(d && d.duration === 90 && d.wordsLearned[0] === 'maison' && d.totalCount === 5, '字段换算正确');
  assert(!!read('dimenticato_fr_srs').maison, 'dimenticato_french_srs 并入 dimenticato_fr_srs');
  assertEqual(ls.getItem('dimenticato_french_daily'), null, '旧 key 删除');
});

group('moveKey：给模块迁移自己的 key 用', function () {
  ls.clear();
  ls.setItem('dimenticato_conjugation_lessons_de', '{"3":true}');
  assert(DimStorage.moveKey('dimenticato_conjugation_lessons_de', DimStorage.key('de', 'conjugation_lessons')), '搬走');
  assertEqual(ls.getItem('dimenticato_de_conjugation_lessons'), '{"3":true}', '值原样搬到新 key');
  assertEqual(ls.getItem('dimenticato_conjugation_lessons_de'), null, '旧 key 删除');
  ls.setItem('dimenticato_typing_best_german_vocab', '90');
  ls.setItem('dimenticato_de_typing_best_vocab', '120');
  DimStorage.moveKey('dimenticato_typing_best_german_vocab', 'dimenticato_de_typing_best_vocab',
    function (a, b) { return String(Math.max(Number(a), Number(b))); });
  assertEqual(ls.getItem('dimenticato_de_typing_best_vocab'), '120', '自定义 merge 生效');
  assertEqual(DimStorage.moveKey('missing_key', 'dimenticato_de_x'), false, '旧 key 不存在时无动作');
});

// ===== 导出 =====
group('导出包含全部语言、单词本进度与模块 key', function () {
  ls.clear();
  ls.setItem('dimenticato_custom_wordbooks', JSON.stringify([{ id: 'wb1', name: '我的词本', language: 'german', words: [] }]));
  ls.setItem('dimenticato_it_mastered', JSON.stringify(['ciao']));
  ls.setItem('dimenticato_de_mastered', JSON.stringify(['Haus']));
  ls.setItem('dimenticato_de_wb_wb1', JSON.stringify(['Haus', 'Buch']));
  ls.setItem('dimenticato_fr_cognate_progress', '{}');
  ls.setItem('dimenticato_storage_version', '3');
  ls.setItem('unrelated_app_token', 'x');

  const dump = DimStorage.exportAll();
  assertEqual(dump.version, '2.0', '导出带版本号');
  assert(dump.keys['dimenticato_de_mastered'] !== undefined, '导出包含德语进度');
  assert(dump.keys['dimenticato_fr_cognate_progress'] !== undefined, '导出包含模块的 dimenticato_<code>_* key');
  assert(dump.keys['dimenticato_storage_version'] === undefined, '版本标记不进备份');
  assert(dump.keys['unrelated_app_token'] === undefined, '导出不带同源其它应用的键');
  assertEqual(JSON.parse(dump.data.masteredWords).length, 1, '1.0 兼容层含意大利语进度');
  assert(!!dump.data.wordbookProgress.wb1, '1.0 兼容层含单词本进度');

  const desc = DimStorage.describePayload(dump);
  assertEqual(desc.wordbooks, 1, '摘要统计单词本数');
  assertEqual(desc.languages.length, 2, '摘要列出有进度的语言');
});

// ===== 导入 =====
group('覆盖导入（1.0 旧备份）走迁移', function () {
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
  assertEqual(read('dimenticato_it_mastered').length, 2, '写入已掌握单词（新 key）');
  assertEqual(read('dimenticato_it_stats').mcCorrect, 4, '写入统计（新 key）');
  assertEqual(ls.getItem('dimenticato_theme'), 'dark', '写入主题');
  assertEqual(read('dimenticato_de_wb_wb1')[0], 'Haus', '旧备份的单词本进度按词本语言落到 de');
  assertEqual(ls.getItem('dimenticato_mastered'), null, '不再写旧 key');
});

group('合并导入 2.0 旧布局备份，保留本地进度', function () {
  ls.clear();
  ls.setItem('dimenticato_it_mastered', JSON.stringify(['ciao']));
  ls.setItem('dimenticato_it_stats', JSON.stringify({ mcAttempts: 2, mcCorrect: 1, spAttempts: 0, spCorrect: 0 }));
  ls.setItem('dimenticato_custom_wordbooks', JSON.stringify([{ id: 'local', name: '本地', language: 'italian', words: [] }]));

  DimStorage.importAll({
    version: '2.0',
    keys: {
      dimenticato_mastered: JSON.stringify(['grazie']),
      dimenticato_stats: JSON.stringify({ mcAttempts: 3, mcCorrect: 2, spAttempts: 1, spCorrect: 1 }),
      dimenticato_german_mastered: JSON.stringify(['Haus']),
      dimenticato_srs_german: JSON.stringify({ Haus: { repetitions: 2, lastReviewDate: '2026-10-01' } }),
      dimenticato_custom_wordbooks: JSON.stringify([{ id: 'wb1', name: '导入的', language: 'german', words: [] }]),
      not_ours: 'x'
    }
  }, { mode: 'merge' });

  assertEqual(read('dimenticato_it_mastered').length, 2, '已掌握取并集');
  assertEqual(read('dimenticato_it_stats').mcAttempts, 3, '计数器取较大值');
  assertEqual(read('dimenticato_de_mastered')[0], 'Haus', '旧德语 key 落到 dimenticato_de_mastered');
  assert(!!read('dimenticato_de_srs').Haus, '旧德语 SRS 落到 dimenticato_de_srs');
  assertEqual(ls.getItem('dimenticato_german_mastered'), null, '不写旧 key');

  // 同一份备份再合并一次：结果不变（幂等），计数不能翻倍
  const again = { version: '2.0', keys: { dimenticato_it_stats: ls.getItem('dimenticato_it_stats') } };
  DimStorage.importAll(again, { mode: 'merge' });
  DimStorage.importAll(again, { mode: 'merge' });
  const stats = read('dimenticato_it_stats');
  assertEqual(stats.mcAttempts, 3, '重复合并不翻倍');
  assertEqual(stats.mcCorrect, 2, '重复合并不翻倍（答对数）');
  assertEqual(read('dimenticato_custom_wordbooks').length, 2, '保留双方的单词本');
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
  ls.setItem('dimenticato_it_mastered', '["ciao"]');
  ls.setItem('dimenticato_de_mastered', '["Haus"]');
  ls.setItem('dimenticato_de_wb_wb1', '["Haus"]');
  ls.setItem('dimenticato_de_cognate_progress', '{}');
  ls.setItem('dimenticato_de_typing_best_vocab', '120');
  ls.setItem('dimenticato_de_prefs', '{"level":"B1"}');
  ls.setItem('dimenticato_de_quiz_difficulty', 'easy');
  ls.setItem('dimenticato_custom_wordbooks', '[]');
  ls.setItem('dimenticato_theme', 'dark');
  ls.setItem('dimenticato_storage_version', '3');
  ls.setItem('unrelated_app_token', 'keep-me');
  // 模块还没迁移的旧 key 也要按语言删掉
  ls.setItem('dimenticato_cognate_progress_german', '{}');
  ls.setItem('dimenticato_typing_best_german_vocab', '120');
  ls.setItem('dimenticato_german_course_level', 'A2');
  ls.setItem('dimenticato_conjugation_lessons_de', '{}');
  ls.setItem('dimenticato_conjugation_lessons', '{}');
  // 各工作流迁移后的模块 key：dimenticato_<模块>_<code>
  ls.setItem('dimenticato_cognate_progress_de', '{}');
  ls.setItem('dimenticato_course_level_de', 'B1');
  ls.setItem('dimenticato_cognate_progress_it', '{}');
  ls.setItem('dimenticato_conjugation_lessons_it', '{}');
  ls.setItem('dimenticato_german_some_future_module', '1');

  const res = DimStorage.reset({ scope: 'german' });
  assertEqual(res.scope, 'german', '范围是德语');
  ['dimenticato_de_mastered', 'dimenticato_de_wb_wb1', 'dimenticato_de_cognate_progress',
    'dimenticato_de_typing_best_vocab', 'dimenticato_cognate_progress_german',
    'dimenticato_typing_best_german_vocab', 'dimenticato_german_course_level',
    'dimenticato_conjugation_lessons_de', 'dimenticato_cognate_progress_de', 'dimenticato_course_level_de',
    'dimenticato_german_some_future_module'].forEach(function (k) {
    assertEqual(ls.getItem(k), null, '删掉德语进度: ' + k);
  });
  assertEqual(ls.getItem('dimenticato_de_prefs'), '{"level":"B1"}', '德语偏好保留');
  assertEqual(ls.getItem('dimenticato_de_quiz_difficulty'), 'easy', '德语难度偏好保留');
  assertEqual(ls.getItem('dimenticato_it_mastered'), '["ciao"]', '不动意大利语');
  assertEqual(ls.getItem('dimenticato_conjugation_lessons'), '{}', '不动意大利语的模块 key');
  assertEqual(ls.getItem('dimenticato_cognate_progress_it'), '{}', '不动意大利语的 _it 模块 key');
  assertEqual(ls.getItem('dimenticato_conjugation_lessons_it'), '{}', '不动意大利语的 _it 变位 key');
  const left = DimStorage.allKeys().filter(function (k) {
    return /_(de|german)$/.test(k) || /^dimenticato_(de|german)_/.test(k);
  }).filter(function (k) { return k !== 'dimenticato_de_prefs' && k !== 'dimenticato_de_quiz_difficulty'; });
  assertEqual(left.join(','), '', '德语重置后除偏好外没有残留');

  DimStorage.reset({ scope: 'de' });
  assertEqual(ls.getItem('dimenticato_it_mastered'), '["ciao"]', 'scope 也接受 code');

  DimStorage.reset({ scope: 'all' });
  assertEqual(ls.getItem('dimenticato_it_mastered'), null, '全部重置删掉意大利语');
  assertEqual(ls.getItem('dimenticato_conjugation_lessons'), null, '全部重置删掉意大利语模块 key');
  assertEqual(ls.getItem('dimenticato_cognate_progress_it'), null, '全部重置删掉 _it 模块 key');
  assertEqual(ls.getItem('dimenticato_custom_wordbooks'), '[]', '单词本内容保留');
  assertEqual(ls.getItem('dimenticato_theme'), 'dark', '主题保留');
  assertEqual(ls.getItem('dimenticato_storage_version'), '3', '版本标记保留');
  assertEqual(ls.getItem('unrelated_app_token'), 'keep-me', '不碰同源里别的应用数据');
});

// ===== Prefs =====
group('Prefs 按语言保存、带默认值', function () {
  ls.clear();
  assertEqual(Prefs.get('german').level, 'A2', '默认等级 A2');
  Prefs.set('german', { level: 'B1', filter: 'due' });
  assertEqual(Prefs.get('german').level, 'B1', '写入后读回');
  assertEqual(Prefs.get('de').level, 'B1', 'code 与旧 key 读同一份');
  assertEqual(Prefs.get('german').session, '20', '未写的字段仍是默认值');
  assertEqual(Prefs.get('french').level, 'A2', '不同语言互不影响');
  assertEqual(read('dimenticato_de_prefs').filter, 'due', '存在 dimenticato_de_prefs');
});

// ===== 旧词条标识改写（需要词库） =====
group('LegacyMigration.run 把旧 id / 旧 SRS key 改写成 entry.word', function () {
  seedLegacySnapshot();
  LegacyMigration.migrateStorage({ force: true });
  const res = LegacyMigration.run('german');
  assert(res.changed > 0, '有改动');
  const mastered = read('dimenticato_de_mastered');
  assert(mastered.indexOf('Haus') !== -1 && mastered.indexOf('Buch') !== -1, '旧 id 改成词形');
  assertEqual(mastered.length, 2, '不重复');
  const srs = read('dimenticato_de_srs');
  assert(!!srs.Buch && !srs['de-00002'], '旧 SRS 并入后改键');
  assert(!!srs.Haus, '原有 SRS 保留');
  assertEqual(read('dimenticato_de_mastery_streak').Haus, 1, '连续答对计数改键');

  const again = LegacyMigration.run('german');
  assertEqual(again.changed, 0, '幂等：第二次运行没有改动');

  ls.setItem('dimenticato_de_mastered', JSON.stringify(['Unbekannt']));
  LegacyMigration.run('german');
  assertEqual(read('dimenticato_de_mastered')[0], 'Unbekannt', '解析不出的旧键原样保留');

  // run() 也会顺手迁移刚冒出来的旧布局 key（比如导入了旧备份）
  ls.setItem('dimenticato_german_mastered', JSON.stringify(['de-00002']));
  LegacyMigration.run('de');
  assert(read('dimenticato_de_mastered').indexOf('Buch') !== -1, '旧布局 key 先改名再改键');
  assertEqual(ls.getItem('dimenticato_german_mastered'), null, '旧布局 key 删除');
});

group('LegacyMigration.run 按 entry.legacyWord 迁移改了拼写的词头（york → York）', function () {
  ls.clear();
  const srsOld = { easiness: 2.5, interval: 6, repetitions: 2, nextReviewDate: '2026-10-01', lastReviewDate: '2026-09-25', reviewHistory: [] };
  const srsNew = { easiness: 2.6, interval: 1, repetitions: 1, nextReviewDate: '2026-10-09', lastReviewDate: '2026-10-08', reviewHistory: [] };
  ls.setItem('dimenticato_custom_wordbooks', JSON.stringify([
    { id: 7, name: '地名', language: 'english', words: [{ word: 'usa', zh: '美国' }, { word: 'York', zh: '约克' }] }
  ]));
  ls.setItem('dimenticato_en_mastered', JSON.stringify(['york', 'York', 'usa', 'house', 'gone']));
  ls.setItem('dimenticato_en_srs', JSON.stringify({ york: srsOld, York: srsNew, house: srsOld }));
  ls.setItem('dimenticato_en_mastery_streak', JSON.stringify({ york: 1, York: 0 }));
  ls.setItem('dimenticato_en_wb_7', JSON.stringify(['usa', 'york']));
  ls.setItem('dimenticato_storage_version', '3');

  LegacyMigration.run('en');
  assertEqual(JSON.stringify(read('dimenticato_en_mastered')), JSON.stringify(['York', 'USA', 'house', 'gone']),
    '已掌握：york→York 与新键合并去重，usa→USA，未知键保留');
  const srs = read('dimenticato_en_srs');
  assert(!('york' in srs), 'SM-2 旧拼写键移走');
  assertEqual(srs.York.lastReviewDate, '2026-10-08', 'SM-2 新旧都在时取最近复习的一条');
  assertEqual(srs.house.interval, 6, '没改名的词不动');
  assertEqual(read('dimenticato_en_mastery_streak').York, 1, '连对计数合并取大');
  assertEqual(JSON.stringify(read('dimenticato_en_wb_7')), JSON.stringify(['usa', 'York']),
    '词本进度：词本自己写的 usa 保留，york 落到词本里的 York');
  const again = LegacyMigration.run('english');
  assertEqual(again.changed, 0, '幂等');
});

// ===== 汇总 =====
ls.clear();
const summary = passed + ' passed, ' + failed + ' failed';
if (failed) {
  console.error('Storage FAILED: ' + summary);
  process.exit(1);
}
console.log('Storage OK: ' + summary);
