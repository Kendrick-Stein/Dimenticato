#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path');
require('../lib/reading-practice.js');
const root = path.resolve(__dirname, '..');
let count = 0;
for (const file of fs.readdirSync(path.join(root,'data/reading/practice'))) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(fs.readFileSync(path.join(root,'data/reading/practice',file)));
  if (!/^[a-z0-9-]+$/.test(data.articleId) || file !== data.articleId + '.json') throw new Error('Invalid companion ID '+file);
  const article = JSON.parse(fs.readFileSync(path.join(root,'data/reading/articles',file)));
  if (!globalThis.ReadingPractice.validate(data,article)) throw new Error('Invalid reading practice '+file);
  count++;
}
console.log('Reading practice: '+count+' companions validated; language accuracy requires editorial review.');
