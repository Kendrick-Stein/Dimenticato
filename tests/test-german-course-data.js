'use strict';

const assert = require('node:assert/strict');
const vocabulary = require('../data/german-vocabulary.js');
const course = require('../data/german-course-data.js');

const normalize = value => String(value || '')
  .normalize('NFKC')
  .toLocaleLowerCase('de-DE')
  .replace(/\//g, '')
  .trim();

const wordIndex = new Map();
for (const word of vocabulary) {
  for (const value of [word.german, word.display]) {
    const key = normalize(value);
    if (key && !wordIndex.has(key)) wordIndex.set(key, word);
  }
}

assert.deepEqual(course.levels.map(level => level.id), ['A1', 'A2', 'B1', 'B2', 'C1']);
assert.deepEqual(course.levels.map(level => level.units.length), [10, 10, 10, 12, 12]);

const units = course.levels.flatMap(level => level.units);
assert.equal(units.length, 54, 'German course unit count changed unexpectedly');
assert.equal(new Set(units.map(unit => unit.id)).size, units.length, 'Course unit IDs must be unique');

for (const unit of units) {
  assert.ok(unit.title && unit.summary, `${unit.id} is missing visible course copy`);
  assert.ok(unit.grammar.length >= 1, `${unit.id} is missing grammar guidance`);
  assert.ok(unit.headwords.length >= 10, `${unit.id} needs at least ten practice headwords`);

  const words = unit.headwords.map(headword => wordIndex.get(normalize(headword)));
  assert.ok(words.every(Boolean), `${unit.id} contains a headword absent from the system vocabulary`);
  assert.equal(
    new Set(words.map(word => word.german)).size,
    words.length,
    `${unit.id} resolves duplicate practice words`
  );
}

console.log(`German course data OK: ${course.levels.length} levels, ${units.length} units, ${units.reduce((sum, unit) => sum + unit.headwords.length, 0)} mapped headwords.`);
