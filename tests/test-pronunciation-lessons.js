#!/usr/bin/env node
'use strict';
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const { createWindow } = require('./dom-shim');
const win = createWindow();
win.CSS = { escape: value => String(value) };
win.document.body.innerHTML = '<div id="grammarBookScreen"><div class="grammar-book-layout"><button id="grammarSidebarToggle"></button><div id="grammarNavTree"></div><div id="grammarContentBreadcrumb"></div><div id="grammarContentBody"></div></div></div>';
const context = vm.createContext(win);
for (const file of ['lib/utils.js', 'lib/languages.js', 'grammar-book.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
let passed = 0;
for (const lang of ['it', 'de', 'fr', 'en']) {
  const data = require(`../data/${lang}-grammar.js`);
  win.GrammarBook.init(data, {lang});
  const entry = win.document.querySelector('[data-grammar-pronunciation]');
  if (lang === 'en') { assert(!entry, 'do not invent English coverage'); passed++; continue; }
  assert(entry, `${lang} entry visible`); passed++;
  const slug = entry.getAttribute('data-grammar-pronunciation');
  assert(data.content[slug].includes('字母')); passed++;
  assert(win.GrammarBook.openTopic(slug)); passed++;
  assert.equal(win.GrammarBook.getCurrentSlug(), slug); passed++;
  assert(win.document.getElementById('grammarContentBody').innerHTML.includes('发音入门')); passed++;
  assert.equal(win.localStorage.getItem('dimenticato_grammar_topic_' + lang), slug); passed++;
  win.GrammarBook.init(data, {lang});
  assert(win.document.querySelector('[data-grammar-resume]'), `${lang} resume retained`); passed++;
  assert(!win.GrammarBook.openTopic('p999/ch01/t01')); passed++;
  for (const [alias, target] of Object.entries(data.meta.aliases)) assert.equal(win.GrammarBook.resolveSlug(alias, data), target);
  passed++;
}
console.log(`${passed} passed, 0 failed`);
