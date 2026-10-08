const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

global.window = global;

// lib/utils.js 是浏览器 IIFE：给它一个 window 就能在 Node 里跑，拿到共享的 DimText
require('../lib/utils.js');
const { headwordKey, foldAccents } = global.DimText;

const { loadVocab, sourceOf } = require('../scripts/vocab_node.js');
const grammar = require('../data/fr-grammar.js');
const conjugationData = require('../data/fr-conjugations.js');
const conjugations = conjugationData.verbs;

// data/vocab/fr.js 合并了三层：课程整理词表、教材总词汇表、Lexique 词频核心。
// 前两层的原始输入在 data/vocab/src/（build_french_vocabulary.py assemble 的输入），
// 在 fr.js 里靠 src（-> meta.sources）区分。
const fr = loadVocab('fr');
const curriculumSource = require('../data/vocab/src/fr-curriculum.js');
const glossarySource = require('../data/vocab/src/fr-glossary.js');
const layerOf = entry => {
  const source = sourceOf(fr, entry);
  if (source.startsWith('课程整理')) return 'curriculum';
  if (source.includes('总词汇表')) return 'glossary';
  return 'core';
};

// 法语里重音区分词义（ou/où、la/là、diner/dîner），去重必须**保留重音**。
// 抹重音的 key 会把 A1 词直接删掉 —— 见 audit: fr-accent-blind-dedupe-drops-a1-words。
const normalizeHeadword = value => headwordKey(value);
const accentBlindKey = value => foldAccents(value).toLowerCase().replace(/['’]/g, "'").trim();

// 教材两层（课程 + 总词汇表）在 fr.js 里的样子，即统一词库 Vocab 为法语合并出来的词表。
// Array.from：fr.js 在 vm 里加载，数组来自另一个 realm，deepEqual 会因原型不同而失败。
const vocabulary = Array.from(fr.entries.filter(entry => layerOf(entry) !== 'core'));
const mergeBy = keyFn => {
  const seen = new Set();
  return vocabulary.filter(item => {
    const key = keyFn(item.word);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// 源文件层：课程整理 372 条；
// 教材总词汇表 2008 -> 1996：重建时把 acteur(trice) 这类带阴性括注的条目
// 规范成了词元 + feminine/display/printed 三个字段（123 条带阴性形），
// 原来分列的阴阳性条目因此并成一条。少的 12 条是并条，不是丢词。
assert.equal(curriculumSource.length, 372, 'French curriculum size changed unexpectedly');
assert.equal(glossarySource.length, 1996, 'French textbook glossary size changed unexpectedly');
assert.ok(glossarySource.every(item => item.printed), 'French glossary lost the printed textbook form');
assert.ok(
  glossarySource.some(item => item.french === 'acteur' && item.feminine === 'actrice' && item.printed === 'acteur(trice)'),
  'French glossary lost the normalized gendered headword'
);
assert.deepEqual(
  Object.fromEntries(['A1', 'A2', 'B1', 'B2'].map(level => [
    level,
    glossarySource.filter(item => item.level === level).length
  ])),
  { A1: 540, A2: 410, B1: 544, B2: 502 },
  'French textbook glossary level counts changed unexpectedly'
);
assert.ok(glossarySource.every(item => item.textbookPage && item.level && item.partOfSpeech), 'French glossary entries lost textbook provenance');

// fr.js 层：课程词表整层保留（与总词汇表重叠时课程优先），合并后仍是 2156 个教材词
assert.equal(fr.meta.count, fr.entries.length, 'fr.js meta.count out of sync');
assert.equal(vocabulary.filter(e => layerOf(e) === 'curriculum').length, 372, 'fr.js lost curriculum entries');
assert.equal(vocabulary.length, 2156, 'Merged French textbook vocabulary size changed unexpectedly');
assert.equal(new Set(fr.entries.map(item => normalizeHeadword(item.word))).size, fr.entries.length, 'fr.js contains duplicate headwords');
assert.ok(vocabulary.every(item => item.word && item.zh && item.rank && item.level), 'French vocabulary has incomplete entries');
assert.ok(fr.entries.some(item => item.word === 'montgolfière' && item.level === 'B2' && layerOf(item) === 'glossary'), 'Reviewed B2 accent correction is missing');
assert.ok(
  fr.entries.some(item => item.word === 'acteur' && item.forms && item.forms.feminine === 'actrice'),
  'fr.js lost the feminine form of acteur'
);

// ===== 重音回归：ou/où、la/là 必须同时存在 =====
// 见 audit: fr-accent-blind-dedupe-drops-a1-words
//
// diner/dîner 从这组里拿掉了：它俩是同一个词的两种拼法（1990 年改革后
// 两种都合法），词汇表重建后统一收 dîner，教材印的 diner 保留在源文件的
// printed 字段里。ou/où、la/là 则是真正的不同词，仍然必须各占一条 —— 下面单独
// 断言 dîner 的教材拼法没丢。
const headwords = new Set(fr.entries.map(item => item.word));
for (const pair of [['ou', 'où'], ['la', 'là']]) {
  assert.ok(
    headwords.has(pair[0]) && headwords.has(pair[1]),
    `Accent-preserving dedupe must keep both "${pair[0]}" and "${pair[1]}"`
  );
}
assert.ok(
  glossarySource.some(item => item.french === 'dîner' && item.printed === 'diner') && headwords.has('dîner') && !headwords.has('diner'),
  'Textbook spelling "diner" must survive as the printed form of dîner'
);

// 大小写仍然合并（Internet / internet 是同一个词）
assert.equal(
  fr.entries.filter(item => normalizeHeadword(item.word) === 'internet').length,
  1,
  'Case-only duplicates should still collapse'
);

// 量化旧的抹重音 key 会丢多少词，避免有人"顺手"改回去
const accentBlind = mergeBy(accentBlindKey);
const droppedByAccentBlindness = vocabulary
  .filter(item => !new Set(accentBlind.map(w => w.word)).has(item.word))
  .map(item => item.word);
assert.deepEqual(
  droppedByAccentBlindness.sort(),
  // 原来是 ['diner', 'là', 'ou']；词汇表重建把 diner 并进 dîner 之后，
  // 抹重音会丢的只剩这两个真·最小对立对。
  ['là', 'ou'].sort(),
  'Accent-blind dedupe drops exactly these A1 words — do not switch back to it'
);

// 运行时（lib/vocab.js）直接使用 fr.js 的词条，不再自行去重，所以上面的数据断言就是用户看到的词表。

const topics = grammar.tree.parts.flatMap(part =>
  part.chapters.flatMap(chapter => chapter.topics)
);
// 23 -> 109：content/fr-grammar 把语法书从 A1-B1 的 23 个主题扩到 A1-B2 的 109 个。
assert.equal(topics.length, 109, 'French grammar topic count changed unexpectedly');
assert.deepEqual(
  [...new Set(topics.map(topic => topic.level))].sort(),
  ['A1', 'A2', 'B1', 'B2'],
  'French grammar must span A1-B2'
);
assert.ok(
  topics.every(topic => topic.slug && topic.title && grammar.content[topic.slug]),
  'French grammar has incomplete topics'
);

// 35 -> 1888 -> 1934：变位表最初按语料词频重建（1888 个动词），
// 之后换掉 GPL 的 Verbiste 数据源、改从 Wiktionary/kaikki + Lexique 生成，
// 词形一个没少，还多出 46 个新动词（词频前 1800 名 + 每个变位型补一个代表）。
assert.equal(conjugationData.meta.schema, 'conjugations/1');
assert.equal(conjugationData.meta.count, conjugations.length);
assert.equal(conjugations.length, 1934, 'French verb count changed unexpectedly');
assert.equal(new Set(conjugations.map(verb => verb.word)).size, conjugations.length, 'French conjugation list contains duplicate verbs');

// 原来 35 个动词都恰好 7 组时态；重建后主流动词是 20 组（1856/1934），
// 缺陷动词（如 falloir）天然少几组，所以只断言下限和每组的完整性。
for (const verb of conjugations) {
  const tenseEntries = Object.entries(verb.tenses);
  assert.ok(tenseEntries.length >= 3, `${verb.word} should expose at least three tense/mood groups`);
  for (const [tenseId, tense] of tenseEntries) {
    const meta = conjugationData.tenses.find(t => t.key === tenseId);
    assert.ok(meta && meta.label, `${verb.word}: unknown tense ${tenseId}`);
    assert.ok(meta.type === 'single' ? typeof tense === 'string' && tense : Array.isArray(tense) && tense.length === 6,
      `${verb.word} has an incomplete tense ${tenseId}`);
  }
}
assert.ok(
  conjugations.filter(verb => Object.keys(verb.tenses).length >= 20).length >= 1700,
  'The vast majority of French verbs should carry the full twenty tense/mood groups'
);

const etre = conjugations.find(verb => verb.word === 'être');
const etrePresent = etre.tenses.indicatif_present; // [p1..p6]
assert.equal(etrePresent[0], 'suis');
assert.equal(etrePresent[3], 'sommes');

const aller = conjugations.find(verb => verb.word === 'aller');
const allerPasseCompose = aller.tenses.indicatif_passe_compose;
assert.match(allerPasseCompose[0], /^suis allé/);

console.log(`French data OK: ${fr.entries.length} fr.js words (${vocabulary.length} textbook, ${glossarySource.length} glossary source rows), ${topics.length} grammar topics, ${conjugations.length} verbs.`);
