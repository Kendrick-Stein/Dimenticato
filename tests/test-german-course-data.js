'use strict';

const assert = require('node:assert/strict');
const vocabulary = require('../data/german-vocabulary.js');
const course = require('../data/german-course-data.js');

const normalize = value => String(value || '')
  .normalize('NFKC')
  .toLocaleLowerCase('de-DE')
  .replace(/\//g, '')
  .trim();

// 与 german-course.js buildWordIndex() 同构：先索引原形，再索引词库自带的
// 屈折形（复数 / 主要变化形），后者只填空位。课程 headword 里有 Frauen、
// gegessen 这类形式，词库改成按词元收录之后必须靠这张表才解析得到。
const inflectedForms = word => {
  const forms = [];
  if (word.plural) forms.push(word.plural);
  if (word.principalParts) {
    for (const part of String(word.principalParts).split(',')) {
      for (const token of part.trim().split(/\s+/)) {
        if (token && !/^(hat|ist|haben|sein|hast|bin)$/.test(token)) forms.push(token);
      }
    }
  }
  return forms;
};

const wordIndex = new Map();
for (const word of vocabulary) {
  for (const value of [word.german, word.display]) {
    const key = normalize(value);
    if (key && !wordIndex.has(key)) wordIndex.set(key, word);
  }
}
for (const word of vocabulary) {
  for (const value of inflectedForms(word)) {
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
  // 单元里同时列出 Frau 和 Frauen 是合理的教学安排，但它们解析到同一个词条。
  // german-course.js resolveHeadwords() 会去重，所以这里断言的是去重之后
  // 还够不够排一课，而不是 headword 数与词条数一一对应。
  assert.ok(
    new Set(words.map(word => word.german)).size >= 10,
    `${unit.id} resolves to fewer than ten distinct practice words`
  );
}

console.log(`German course data OK: ${course.levels.length} levels, ${units.length} units, ${units.reduce((sum, unit) => sum + unit.headwords.length, 0)} mapped headwords.`);
