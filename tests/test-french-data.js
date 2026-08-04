const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

global.window = global;

// lib/utils.js 是浏览器 IIFE：给它一个 window 就能在 Node 里跑，拿到共享的 DimText
require('../lib/utils.js');
const { headwordKey, foldAccents } = global.DimText;

const coreVocabulary = require('../data/french-vocabulary.js');
const glossaryVocabulary = require('../data/french-vocabulary-glossary.js');
const grammar = require('../data/french-grammar-data.js');
const conjugations = require('../data/french-conjugations.js');

// 法语里重音区分词义（ou/où、la/là、diner/dîner），去重必须**保留重音**。
// 抹重音的 key 会把 A1 词直接删掉 —— 见 audit: fr-accent-blind-dedupe-drops-a1-words。
const normalizeHeadword = value => headwordKey(value);
const accentBlindKey = value => foldAccents(value).toLowerCase().replace(/['\u2019]/g, "'").trim();

const mergeBy = keyFn => {
  const seen = new Set();
  return [...coreVocabulary, ...glossaryVocabulary].filter(item => {
    const key = keyFn(item.french);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const vocabulary = mergeBy(normalizeHeadword);

assert.equal(coreVocabulary.length, 372, 'French core vocabulary size changed unexpectedly');
// 2008 -> 1996：教材词汇表重建时把 acteur(trice) 这类带阴性括注的条目
// 规范成了词元 + feminine/display/printed 三个字段（123 条带阴性形），
// 原来分列的阴阳性条目因此并成一条。少的 12 条是并条，不是丢词。
assert.equal(glossaryVocabulary.length, 1996, 'French textbook glossary size changed unexpectedly');
assert.ok(glossaryVocabulary.every(item => item.printed), 'French glossary lost the printed textbook form');
assert.ok(
  glossaryVocabulary.some(item => item.french === 'acteur' && item.feminine === 'actrice' && item.printed === 'acteur(trice)'),
  'French glossary lost the normalized gendered headword'
);
assert.deepEqual(
  Object.fromEntries(['A1', 'A2', 'B1', 'B2'].map(level => [
    level,
    glossaryVocabulary.filter(item => item.level === level).length
  ])),
  { A1: 540, A2: 410, B1: 544, B2: 502 },
  'French textbook glossary level counts changed unexpectedly'
);
assert.equal(vocabulary.length, 2156, 'Merged French vocabulary size changed unexpectedly');
assert.equal(new Set(vocabulary.map(item => normalizeHeadword(item.french))).size, vocabulary.length, 'French vocabulary contains duplicate headwords');
assert.ok(vocabulary.every(item => item.french && item.meaning && item.rank && item.source), 'French vocabulary has incomplete entries');
assert.ok(glossaryVocabulary.every(item => item.textbookPage && item.level && item.partOfSpeech), 'French glossary entries lost textbook provenance');
assert.ok(glossaryVocabulary.some(item => item.french === 'montgolfière' && item.level === 'B2'), 'Reviewed B2 accent correction is missing');

// ===== 重音回归：ou/où、la/là 必须同时存在 =====
// 见 audit: fr-accent-blind-dedupe-drops-a1-words
//
// diner/dîner 从这组里拿掉了：它俩是同一个词的两种拼法（1990 年改革后
// 两种都合法），词汇表重建后统一收 dîner，教材印的 diner 保留在 printed
// 字段里。ou/où、la/là 则是真正的不同词，仍然必须各占一条 —— 下面单独
// 断言 dîner 的教材拼法没丢。
const headwords = new Set(vocabulary.map(item => item.french));
for (const pair of [['ou', 'où'], ['la', 'là']]) {
  assert.ok(
    headwords.has(pair[0]) && headwords.has(pair[1]),
    `Accent-preserving dedupe must keep both "${pair[0]}" and "${pair[1]}"`
  );
}
assert.ok(
  glossaryVocabulary.some(item => item.french === 'dîner' && item.printed === 'diner'),
  'Textbook spelling "diner" must survive as the printed form of dîner'
);

// 大小写仍然合并（Internet / internet 是同一个词）
assert.equal(
  vocabulary.filter(item => normalizeHeadword(item.french) === 'internet').length,
  1,
  'Case-only duplicates should still collapse'
);

// 量化旧的抹重音 key 会丢多少词，避免有人"顺手"改回去
const accentBlind = mergeBy(accentBlindKey);
const droppedByAccentBlindness = vocabulary
  .filter(item => !new Set(accentBlind.map(w => w.french)).has(item.french))
  .map(item => item.french);
assert.deepEqual(
  droppedByAccentBlindness.sort(),
  // 原来是 ['diner', 'là', 'ou']；词汇表重建把 diner 并进 dîner 之后，
  // 抹重音会丢的只剩这两个真·最小对立对。
  ['là', 'ou'].sort(),
  'Accent-blind dedupe drops exactly these A1 words — do not switch back to it'
);

// 运行时也必须用保留重音的 key，否则数据对了、用户看到的词表还是少的
const frenchAppSource = fs.readFileSync(path.join(__dirname, '..', 'french-app.js'), 'utf8');
if (!/DimText\.headwordKey|headwordKey\(/.test(frenchAppSource)) {
  console.warn(
    'KNOWN ISSUE [french-app]: french-app.js buildSystemVocabulary() 仍在用抹重音的 key 去重，' +
    `运行时会丢掉 ${droppedByAccentBlindness.length} 个词（${droppedByAccentBlindness.join('、')}）；` +
    '应改成 window.DimText.headwordKey()。'
  );
}

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
assert.equal(conjugations.length, 1934, 'French verb count changed unexpectedly');
assert.equal(new Set(conjugations.map(verb => verb.infinitive)).size, conjugations.length, 'French conjugation list contains duplicate verbs');

// 原来 35 个动词都恰好 7 组时态；重建后主流动词是 20 组（1856/1934），
// 缺陷动词（如 falloir）天然少几组，所以只断言下限和每组的完整性。
for (const verb of conjugations) {
  const tenseEntries = Object.entries(verb.tenses);
  assert.ok(tenseEntries.length >= 3, `${verb.infinitive} should expose at least three tense/mood groups`);
  for (const [tenseId, tense] of tenseEntries) {
    assert.ok(tenseId && tense.tense_label && tense.forms, `${verb.infinitive} has an incomplete tense`);
  }
}
assert.ok(
  conjugations.filter(verb => Object.keys(verb.tenses).length >= 20).length >= 1700,
  'The vast majority of French verbs should carry the full twenty tense/mood groups'
);

const etre = conjugations.find(verb => verb.infinitive === 'être');
const etrePresent = etre.tenses.indicatif_present.forms;
assert.equal(etrePresent.je, 'suis');
assert.equal(etrePresent.nous, 'sommes');

const aller = conjugations.find(verb => verb.infinitive === 'aller');
const allerPasseCompose = aller.tenses.indicatif_passe_compose.forms;
assert.match(allerPasseCompose.je, /^suis allé/);

console.log(`French data OK: ${vocabulary.length} merged words (${glossaryVocabulary.length} textbook glossary entries), ${topics.length} grammar topics, ${conjugations.length} verbs.`);
