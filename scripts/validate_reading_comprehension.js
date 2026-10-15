#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path');
require('../lib/reading-comprehension');
const root = path.resolve(__dirname, '..');
let count = 0, questions = 0;
for (const file of fs.readdirSync(path.join(root, 'data/reading/comprehension'))) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/reading/comprehension', file)));
  if (!/^[a-z0-9-]+$/.test(data.articleId) || file !== data.articleId + '.json') throw new Error('Invalid comprehension ID: ' + file);
  const article = JSON.parse(fs.readFileSync(path.join(root, 'data/reading/articles', file)));
  if (!globalThis.ReadingComprehension.validate(data, article)) throw new Error('Invalid comprehension companion: ' + file);
  count++; questions += data.questions.length;
}
console.log('Reading comprehension: ' + count + ' companions / ' + questions + ' questions validated; meaning and unique answers require independent editorial review.');
