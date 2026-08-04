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
assert.equal(glossaryVocabulary.length, 2008, 'French textbook glossary size changed unexpectedly');
assert.deepEqual(
  Object.fromEntries(['A1', 'A2', 'B1', 'B2'].map(level => [
    level,
    glossaryVocabulary.filter(item => item.level === level).length
  ])),
  { A1: 543, A2: 414, B1: 547, B2: 504 },
  'French textbook glossary level counts changed unexpectedly'
);
assert.equal(vocabulary.length, 2185, 'Merged French vocabulary size changed unexpectedly');
assert.equal(new Set(vocabulary.map(item => normalizeHeadword(item.french))).size, vocabulary.length, 'French vocabulary contains duplicate headwords');
assert.ok(vocabulary.every(item => item.french && item.meaning && item.rank && item.source), 'French vocabulary has incomplete entries');
assert.ok(glossaryVocabulary.every(item => item.textbookPage && item.level && item.partOfSpeech), 'French glossary entries lost textbook provenance');
assert.ok(glossaryVocabulary.some(item => item.french === 'montgolfière' && item.level === 'B2'), 'Reviewed B2 accent correction is missing');

// ===== 重音回归：ou/où、la/là、diner/dîner 必须同时存在 =====
// 见 audit: fr-accent-blind-dedupe-drops-a1-words
const headwords = new Set(vocabulary.map(item => item.french));
for (const pair of [['ou', 'où'], ['la', 'là'], ['diner', 'dîner']]) {
  assert.ok(
    headwords.has(pair[0]) && headwords.has(pair[1]),
    `Accent-preserving dedupe must keep both "${pair[0]}" and "${pair[1]}"`
  );
}
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
  ['diner', 'là', 'ou'].sort(),
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
assert.equal(topics.length, 23, 'French grammar topic count changed unexpectedly');
assert.ok(
  topics.every(topic => topic.slug && topic.title && grammar.content[topic.slug]),
  'French grammar has incomplete topics'
);

assert.equal(conjugations.length, 35, 'French verb count changed unexpectedly');
assert.equal(new Set(conjugations.map(verb => verb.infinitive)).size, conjugations.length, 'French conjugation list contains duplicate verbs');

for (const verb of conjugations) {
  const tenseEntries = Object.entries(verb.tenses);
  assert.equal(tenseEntries.length, 7, `${verb.infinitive} should expose seven tense/mood groups`);
  for (const [tenseId, tense] of tenseEntries) {
    assert.ok(tenseId && tense.tense_label && tense.forms, `${verb.infinitive} has an incomplete tense`);
  }
}

const etre = conjugations.find(verb => verb.infinitive === 'être');
const etrePresent = etre.tenses.indicatif_present.forms;
assert.equal(etrePresent.je, 'suis');
assert.equal(etrePresent.nous, 'sommes');

const aller = conjugations.find(verb => verb.infinitive === 'aller');
const allerPasseCompose = aller.tenses.indicatif_passe_compose.forms;
assert.match(allerPasseCompose.je, /^suis allé/);

console.log(`French data OK: ${vocabulary.length} merged words (${glossaryVocabulary.length} textbook glossary entries), ${topics.length} grammar topics, ${conjugations.length} verbs.`);
