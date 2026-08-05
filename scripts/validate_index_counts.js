#!/usr/bin/env node
/**
 * index.html 里写死的数据集条数 vs 真实数据长度。
 *
 * 这些 <span data-count="..."> 的文字是首屏在 JS 填充前直接显示给用户的值，
 * lib/router.js 的 syncDatasetCounts() 只在数据加载完之后才覆盖它。数据集重建
 * 时没人会想起改 index.html，于是它们一路陈旧下去：german-vocab 曾停在 15,507
 * （真实 24,314），french-vocab 停在 2,183（真实 24,536，差一个数量级）。
 *
 * 顺带锁住法语 CEFR 等级 chip：核心词库里 C1/C2 占 70%，chip 只列到 B2 时
 * 这些词没有任何等级筛选够得着。
 *
 *   node scripts/validate_index_counts.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const failures = [];
const fail = (msg) => failures.push(msg);

// 浏览器 const 数据文件没有 module.exports，require 会拿到 {}，走 vm 取值
function constArrayLength(rel, name) {
  const ctx = vm.createContext({ window: {}, console });
  vm.runInContext(read(rel) + ';globalThis.__X=' + name, ctx, { filename: rel });
  return ctx.__X.length;
}

// ---------- 真实条数 ----------

const actual = {
  'italian-vocab': constArrayLength('vocabulary.js', 'VOCABULARY_DATA'),
  'italian-cognates': constArrayLength('data/cognates.js', 'COGNATE_DATA'),
  'german-vocab': constArrayLength('data/german-vocabulary.js', 'GERMAN_VOCABULARY_DATA'),
  'german-cognates': constArrayLength('data/german-cognates.js', 'GERMAN_COGNATE_DATA'),
  'english-vocab': constArrayLength('data/english-vocabulary.js', 'ENGLISH_VOCABULARY_DATA'),
  'french-cognates': constArrayLength('data/french-cognates.js', 'FRENCH_COGNATE_DATA'),
};

// 法语系统词库是三份来源按 headwordKey 去重后的结果，等同 FrenchApp.buildSystemVocabulary()
// （parseHeadword 的括注剥离不改变 key 集合，已与浏览器实测对齐）
const frenchSources = (() => {
  global.window = global;
  require(path.join(ROOT, 'lib/utils.js'));
  const { headwordKey } = global.DimText;
  const parts = [
    require(path.join(ROOT, 'data/french-vocabulary.js')),
    require(path.join(ROOT, 'data/french-vocabulary-glossary.js')),
    require(path.join(ROOT, 'data/french-vocabulary-core.js')),
  ];
  const seen = new Set();
  parts.flat().forEach((entry) => {
    const key = entry && headwordKey(entry.french);
    if (key) seen.add(key);
  });
  return { merged: seen.size, all: parts.flat() };
})();
actual['french-vocab'] = frenchSources.merged;

// ---------- index.html 占位数字 ----------

const indexHtml = read('index.html');
const placeholders = [];
const re = /data-count="([a-z-]+)"[^>]*>([^<]*)</g;
let m;
while ((m = re.exec(indexHtml)) !== null) {
  placeholders.push({ key: m[1], text: m[2].trim() });
}

if (!placeholders.length) fail('index.html 里一个 data-count 占位都没找到 —— 正则或结构变了');

const fmt = (n) => Number(n).toLocaleString('en-US');

placeholders.forEach(({ key, text }) => {
  if (!(key in actual)) {
    fail(`index.html 有 data-count="${key}"，但本校验器不知道它对应哪份数据 —— 请在 actual 里补上`);
    return;
  }
  const want = fmt(actual[key]);
  if (text !== want) fail(`data-count="${key}" 写死的是 ${text}，真实条数是 ${want}`);
});

// syncDatasetCounts() 漏掉某个 key 时，写死的数字就是用户看到的最终值
const routerJs = read('lib/router.js');
[...new Set(placeholders.map((p) => p.key))].forEach((key) => {
  if (!routerJs.includes(`put('${key}'`)) {
    fail(`lib/router.js syncDatasetCounts() 没有 put('${key}', ...)，该占位永远不会被实时数据刷新`);
  }
});

// ---------- 法语 CEFR 等级 chip 覆盖 ----------

const levelsInData = new Set();
frenchSources.all.forEach((entry) => {
  const hit = /\b(A1|A2|B1|B2|C1|C2)\b/.exec((entry && entry.notes) || '');
  if (hit) levelsInData.add(hit[1]);
});

const frenchAppJs = read('french-app.js');
const levelsConst = /const LEVELS = \[([^\]]*)\]/.exec(frenchAppJs);
if (!levelsConst) {
  fail('french-app.js 里找不到 const LEVELS —— 等级筛选的定义变了');
} else {
  const declared = new Set(levelsConst[1].match(/[A-C][12]/g) || []);
  [...levelsInData].sort().forEach((level) => {
    if (!declared.has(level)) {
      const n = frenchSources.all.filter((e) => new RegExp(`\\b${level}\\b`).test((e && e.notes) || '')).length;
      fail(`法语数据里有 ${n} 条 ${level} 词，但 french-app.js 的 LEVELS 没列 ${level}，这些词没有任何等级筛选够得着`);
    }
    const chips = (frenchAppJs.match(new RegExp(`data-level="${level}"`, 'g')) || []).length;
    if (declared.has(level) && chips < 2) {
      fail(`LEVELS 里有 ${level}，但 data-level="${level}" 的 chip 只出现 ${chips} 次（练习范围 + 浏览筛选各需一个）`);
    }
  });
}

// ---------- 结果 ----------

if (failures.length) {
  failures.forEach((f) => console.log('FAIL ' + f));
  console.log(`RESULT: FAIL — ${failures.length} 处不一致`);
  process.exit(1);
}
console.log(
  `OK: index.html ${placeholders.length} 个 data-count 占位与真实数据一致；` +
  `法语等级 chip 覆盖 ${[...levelsInData].sort().join('/')}`
);
