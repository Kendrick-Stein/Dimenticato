#!/usr/bin/env node
'use strict';
// Run: node tests/test-reading-route.js
// After moving into tests/, the optional repository argument can be omitted.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..');
const { createWindow } = require(path.join(root, 'tests/dom-shim'));

function setup() {
  const w = createWindow();
  w.URL = URL;
  w.CustomEvent = function (type, options) { this.type = type; this.detail = options && options.detail; };
  w.scrollTo = () => {};
  w.document.body.innerHTML = '<section class="screen" id="homeScreen"></section>' +
    '<section class="screen" id="readingScreen"><div id="readingView"></div></section>' +
    '<section class="screen" id="readingArticleScreen"><div id="readingArticleView"></div></section>';
  w.document.body.setAttribute('data-language', 'italian');
  w.document.activeElement = w.document.body;
  // Add only DOM operations absent from the repository's minimal shim.
  const originalCreate = w.document.createElement;
  function contains(node) {
    for (let p = node; p; p = p.parentElement) if (p === this) return true;
    return false;
  }
  function augment(node) {
    node.contains = contains;
    node.focus = () => { w.document.activeElement = node; };
    (node.children || []).forEach(augment);
    return node;
  }
  augment(w.document.body);
  function replaceChildren(...nodes) {
    if (this.contains(w.document.activeElement)) w.document.activeElement = w.document.body;
    this.textContent = '';
    nodes.forEach(node => this.appendChild(node));
  }
  w.document.createElement = function (tag) {
    const node = augment(originalCreate(tag));
    node.replaceChildren = replaceChildren;
    node.focus = () => { w.document.activeElement = node; };
    return node;
  };
  ['readingView', 'readingArticleView'].forEach(id => {
    w.document.getElementById(id).replaceChildren = replaceChildren;
  });
  w.history = {
    pushState: (_state, _title, hash) => { w.location.hash = hash; },
    replaceState: (_state, _title, hash) => { w.location.hash = hash; }
  };
  const context = vm.createContext(w);
  ['lib/utils.js', 'lib/languages.js', 'lib/storage.js', 'lib/shell.js', 'lib/reading-catalog.js','reading-app.js'].forEach(file => {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  });
  w.fetch = async () => ({ ok: true, json: async () => ({ schema: 1, articles: [] }) });
  w.Shell.registerOpener('readingArticleScreen', (lang, id) => w.ReadingApp.open(lang, id));
  w.Shell.registerOpener('readingScreen', lang => w.ReadingApp.open(lang));
  w.Shell.onEnter(id => {
    if (id === 'readingScreen') w.ReadingApp.enter(w.getActiveLanguage());
  });
  let initCallbacks = 0;
  w.App = {
    setLanguage: async lang => {
      w.document.body.setAttribute('data-language', lang);
      // Model LangLoader.ensure's first-load completion, which invokes
      // App.onLanguageData -> renderScreen before setLanguage resolves.
      await Promise.resolve();
      initCallbacks++;
      if (w.Shell.current() === 'readingScreen') w.ReadingApp.enter(lang);
    }
  };
  w.DimRouter.booted = true;
  return { w, initCallbacks: () => initCallbacks };
}

(async function () {
  let passed = 0;
  for (const [hash, expectedScreen] of [
    ['#/de/reading/article/example', 'readingArticleScreen'],
    ['#/de', 'homeScreen']
  ]) {
    const test = setup();
    const w = test.w;
    await w.ReadingApp.open('italian');
    assert.strictEqual(w.Shell.current(), 'readingScreen'); passed++;
    // Browser hash navigation sets location before applying the route.
    w.location.hash = hash;
    await w.DimRouter.apply(w.DimRouter.parse(hash));
    assert.strictEqual(test.initCallbacks(), 1, 'The first-language-load callback must actually run'); passed++;
    assert.strictEqual(w.Shell.current(), expectedScreen, 'Reading refresh must not invalidate the pending route'); passed++;
    assert.strictEqual(w.location.hash, hash, 'Reading refresh must not overwrite the destination URL'); passed++;
    assert.strictEqual(w.getActiveLanguage(), 'german'); passed++;
  }
  console.log('Reading route integration OK: ' + passed + ' passed, 0 failed');
})().catch(error => { console.error(error); process.exitCode = 1; });
