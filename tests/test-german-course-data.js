'use strict';

// data/de-course.js（course/1，docs/data-schema.md）：unit.words 是词库里的
// `word`，course.js 直接按 word 查 Vocab.entries，不再做屈折形模糊匹配。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadVocab } = require('../scripts/vocab_node.js');
const course = require('../data/de-course.js');

const vocabulary = new Set(loadVocab('de').entries.map(entry => entry.word));

function loadModule(file, module, code) {
  const ctx = {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ctx);
  return ctx.DIM_DATA[module][code];
}
const grammar = loadModule('data/german-grammar-data.js', 'grammar', 'de');

assert.equal(course.meta.schema, 'course/1');
assert.equal(course.meta.lang, 'de');
assert.ok(course.meta.title && course.meta.zh, 'course meta needs title and zh');
assert.deepEqual(course.levels.map(level => level.id), ['A1', 'A2', 'B1', 'B2', 'C1']);
assert.deepEqual(course.levels.map(level => level.units.length), [10, 10, 10, 12, 12]);

const units = course.levels.flatMap(level => level.units);
assert.equal(units.length, 54, 'German course unit count changed unexpectedly');
assert.equal(course.meta.count, units.length, 'meta.count must equal the unit count');
assert.equal(new Set(units.map(unit => unit.id)).size, units.length, 'Course unit IDs must be unique');

let words = 0;
for (const unit of units) {
  assert.ok(unit.title && unit.summary, `${unit.id} is missing visible course copy`);
  assert.ok(unit.grammar.length >= 1, `${unit.id} is missing grammar guidance`);
  assert.ok(new Set(unit.words).size === unit.words.length, `${unit.id} lists a word twice`);
  assert.ok(unit.words.length >= 10, `${unit.id} needs at least ten practice words`);
  const missing = unit.words.filter(word => !vocabulary.has(word));
  assert.deepEqual(missing, [], `${unit.id} contains words absent from data/vocab/de.js`);
  for (const item of unit.grammar) {
    assert.ok(item.label, `${unit.id} has a grammar item without a label`);
    if (item.slug) {
      assert.ok(Object.prototype.hasOwnProperty.call(grammar.content, item.slug),
        `${unit.id} grammar slug ${item.slug} is not in the grammar book`);
    }
  }
  words += unit.words.length;
}

console.log(`German course data OK: ${course.levels.length} levels, ${units.length} units, ${words} vocab words.`);
