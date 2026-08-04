const assert = require('node:assert/strict');

global.window = global;

const coreVocabulary = require('../data/french-vocabulary.js');
const glossaryVocabulary = require('../data/french-vocabulary-glossary.js');
const grammar = require('../data/french-grammar-data.js');
const conjugations = require('../data/french-conjugations.js');

const normalizeHeadword = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[’']/g, "'")
  .trim();
const seenHeadwords = new Set();
const vocabulary = [...coreVocabulary, ...glossaryVocabulary].filter(item => {
  const key = normalizeHeadword(item.french);
  if (!key || seenHeadwords.has(key)) return false;
  seenHeadwords.add(key);
  return true;
});

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
assert.equal(vocabulary.length, 2183, 'Merged French vocabulary size changed unexpectedly');
assert.equal(new Set(vocabulary.map(item => normalizeHeadword(item.french))).size, vocabulary.length, 'French vocabulary contains duplicate headwords');
assert.ok(vocabulary.every(item => item.french && item.meaning && item.rank && item.source), 'French vocabulary has incomplete entries');
assert.ok(glossaryVocabulary.every(item => item.textbookPage && item.level && item.partOfSpeech), 'French glossary entries lost textbook provenance');
assert.ok(glossaryVocabulary.some(item => item.french === 'montgolfière' && item.level === 'B2'), 'Reviewed B2 accent correction is missing');

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
