#!/usr/bin/env node
'use strict';
const assert = require('assert'), fs = require('fs'), vm = require('vm'), path = require('path');
const { createWindow } = require('./dom-shim');
const catalog = require('../lib/reading-catalog');
const root = path.resolve(__dirname, '..');
let passed = 0;
function test(fn) { fn(); passed++; }
function row(id, lang, category, level, sourcePublishedAt, date, contentType = 'native-adaptation') {
  return { id, lang, category, level, sourcePublishedAt, date, contentType, topics: ['细分话题'], title: id, titleZh: '中文标题', summaryZh: '摘要', sourceLang: lang };
}
const rows = [
  row('older-source', 'it', 'technology', 'B1', '2026-08-18', '2026-10-10'),
  row('recent-source', 'it', 'environment', 'A2', '2026-10-02', '2026-10-09'),
  row('recent-tech', 'it', 'technology', 'A2', '2026-09-26', '2026-10-10'),
  row('legacy', 'it', 'culture', 'A2', '2026-10-08', '2026-10-10', undefined),
  row('german-tech', 'de', 'technology', 'A2', '2026-10-04', '2026-10-10')
];
delete rows[3].contentType;
test(() => assert.deepEqual(rows.slice(0, 4).sort(catalog.compare).map(r => r.id), ['recent-source', 'recent-tech', 'older-source', 'legacy']));
['2026-13-02', '2026-02-29', '2026-01-32', '2026-2-01', '', null].forEach(date => test(() => assert.equal(catalog.validDate(date, true), false)));
['2024-02-29', '2026-10-10', '2020-02'].forEach(date => test(() => assert.equal(catalog.validDate(date, true), true)));
test(() => assert.equal(catalog.validDate('2020-02'), false));

test(() => assert.equal(catalog.select(rows.concat(rows[0]), 'it', '', '', '').length, 4, 'duplicate IDs never create duplicate cards'));
test(() => assert.deepEqual(catalog.select(rows, 'it', 'technology', 'A2', 'RECENT 中文').map(a => a.id), ['recent-tech'], 'case-insensitive multi-token search combines filters'));
test(() => assert.equal(catalog.select(rows, 'it', '', '', '细分话题').length, 4, 'topics are searchable'));
test(() => assert.equal(catalog.select(rows, 'it', '', '', '环境').length, 1, 'translated category is searchable'));
test(() => assert.equal(catalog.select(rows, 'it', '', '', '  ').length, 4, 'whitespace search is empty'));
test(() => assert.equal(catalog.today(rows, '2026-10-10').length, 2, 'only actual date and actual tiers appear'));
test(() => assert.equal(catalog.today(rows, '2026-10-11').length, 0, 'no stale today recommendation'));
test(() => assert.equal(catalog.today([rows[3]], '2026-10-10').length, 0, 'legacy translations not presented as new native selection'));
test(() => assert.equal(catalog.localDate(new Date(2026, 0, 2)), '2026-01-02', 'local calendar date, padded'));
const schema = JSON.parse(fs.readFileSync(path.join(root, 'docs/reading-article.schema.json')));
test(() => assert.deepEqual(schema.properties.category.enum, catalog.categories.map(c => c[0]), 'schema and UI taxonomy stay aligned'));
const index = JSON.parse(fs.readFileSync(path.join(root, 'data/reading/index.json')));
for (const suffix of ['it-plastica-radar', 'en-satellites-everyday-life', 'de-meeresschutz', 'fr-fleurs-abeilles']) {
  test(() => assert(index.articles.some(article => article.id === '2026-10-10-' + suffix), 'independent original-language edition retained'));
}
for (const language of ['it', 'de', 'en', 'fr']) {
  test(() => assert(!index.articles.some(a => a.id === '2026-10-10-' + language + '-languages'), 'withdrawn editions must not be indexed'));
  test(() => assert(!fs.existsSync(path.join(root, 'data/reading/articles/2026-10-10-' + language + '-languages.json')), 'withdrawn editions must not remain publicly fetchable'));
}

(async function () {
  const w = createWindow(); w.URL = URL; w.Date = Date;
  const originalCreate = w.document.createElement;
  function augment(n) {
    n.contains = node => { for (let p = node; p; p = p.parentElement) if (p === n) return true; return false; };
    n.focus = () => { w.document.activeElement = n; };
    n.replaceChildren = (...nodes) => { n.textContent = ''; nodes.forEach(x => n.appendChild(x)); };
    return n;
  }
  w.document.createElement = tag => augment(originalCreate(tag));
  w.document.body.innerHTML = '<div id="readingView"></div><div id="readingArticleView"></div>';
  ['readingView', 'readingArticleView'].forEach(id => augment(w.document.getElementById(id)));
  let language = 'italian', screen = '', fetches = [];
  w.showScreen = id => { screen = id; }; w.Shell = { current: () => screen }; w.getActiveLanguage = () => language;
  w.DimRouter = { href: (lang, id) => '#/' + lang + '/' + id };
  w.fetch = async url => { fetches.push(url); return { ok: true, json: async () => ({ schema: 1, articles: rows }) }; };
  const context = vm.createContext(w);
  ['lib/languages.js', 'lib/storage.js', 'reading-app.js'].forEach(file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context));
  const host = w.document.getElementById('readingView');
  const ids = () => host.querySelectorAll('.reading-card').map(card => card.querySelector('a').textContent);
  async function choose(id, value) {
    const select = w.document.getElementById(id); select.value = value; select.dispatchEvent({ type: 'change' });
    await new Promise(resolve => setImmediate(resolve));
  }
  await w.ReadingApp.open(language);
  test(() => assert(host.textContent.includes('暂时加载失败'), 'missing catalog dependency fails recoverably'));
  vm.runInContext(fs.readFileSync(path.join(root, 'lib/reading-catalog.js'), 'utf8'), context);
  host.querySelector('button').click();
  await new Promise(resolve => setImmediate(resolve));
  test(() => assert.deepEqual(ids(), ['recent-source', 'recent-tech', 'older-source', 'legacy']));
  test(() => assert.equal(w.document.getElementById('readingCategoryFilter').querySelectorAll('option').length, 8));
  test(() => assert(host.textContent.includes('原文 2026-10-02 · 整理 2026-10-09')));
  await choose('readingCategoryFilter', 'technology');
  test(() => assert.deepEqual(ids(), ['recent-tech', 'older-source']));
  test(() => assert.equal(w.document.activeElement.id, 'readingCategoryFilter', 'category selector focus is restored'));
  await choose('readingLevelFilter', 'A2');
  test(() => assert.deepEqual(ids(), ['recent-tech']));
  test(() => assert.equal(w.document.activeElement.id, 'readingLevelFilter', 'level selector focus is restored'));
  language = 'german'; await w.ReadingApp.open(language);
  test(() => assert.deepEqual(ids(), ['german-tech'], 'language, category and level combine'));
  await choose('readingCategoryFilter', 'health');
  test(() => assert.equal(ids().length, 0));
  test(() => assert(host.querySelector('.empty').textContent.includes('暂无已发布阅读')));
  host.querySelectorAll('button').find(button => button.textContent === '清除筛选').click();
  await new Promise(resolve => setImmediate(resolve));
  test(() => assert.deepEqual(ids(), ['german-tech']));
  test(() => assert.equal(w.document.getElementById('readingCategoryFilter').value, ''));
  test(() => assert.equal(w.document.getElementById('readingLevelFilter').value, ''));

  for (let n = 0; n < 30; n++) rows.push(row('archive-' + String(n).padStart(2, '0'), 'de', 'culture', 'B1', '2026-09-01', '2026-10-01'));
  await w.ReadingApp.open(language);
  test(() => assert.equal(ids().length, 12, 'initial archive is bounded'));
  host.querySelectorAll('button').find(b => b.textContent.startsWith('再看')).click();
  test(() => assert.equal(ids().length, 24, 'one click reveals one batch'));
  await w.ReadingApp.open(language);
  test(() => assert.equal(ids().length, 24, 'return preserves expanded library'));
  const savedLink = host.querySelectorAll('.reading-card')[20].querySelector('a');
  savedLink.click();
  await w.ReadingApp.open(language);
  test(() => assert.equal(w.document.activeElement.textContent, savedLink.textContent, 'return restores the previously opened card focus'));
  const search = w.document.getElementById('readingSearch');
  search.value = 'archive-29'; search.dispatchEvent({type: 'input'});
  test(() => assert.deepEqual(ids(), ['archive-29'], 'typing searches immediately'));
  test(() => assert.equal(w.document.getElementById('readingSearch'), search, 'input not replaced while typing'));
  await w.ReadingApp.open(language);
  test(() => assert.equal(w.document.getElementById('readingSearch').value, 'archive-29', 'return preserves query'));
  test(() => assert.deepEqual(ids(), ['archive-29']));
  await choose('readingLevelFilter', 'A2');
  test(() => assert.equal(ids().length, 0, 'query and level combine'));
  host.querySelectorAll('button').find(b => b.textContent === '清除筛选').click();
  test(() => assert.equal(ids().length, 12, 'clear resets expansion'));
  test(() => assert.equal(w.document.getElementById('readingSearch').value, '', 'clear resets query'));
  test(() => assert.equal(w.document.activeElement.id, 'readingSearch', 'clear restores keyboard focus'));
  const composing = w.document.getElementById('readingSearch');
  composing.value = 'archive-29'; composing.dispatchEvent({type:'input', isComposing:true});
  test(() => assert.equal(ids().length, 12, 'IME composition does not filter half-typed input'));
  composing.dispatchEvent({type:'compositionend'});
  test(() => assert.deepEqual(ids(), ['archive-29'], 'IME committed text filters'));
  await w.ReadingApp.open(language, '2026-10-10-de-languages');
  test(() => assert(w.document.getElementById('readingArticleView').textContent.includes('没有找到这篇文章')));
  test(() => assert(!fetches.some(url => url.includes('languages.json')), 'withdrawn and arbitrary IDs are never fetched'));
  test(() => assert(fetches.every(url => url === 'data/reading/index.json'), 'public reader never fetches editorial candidates'));
  console.log('Reading catalog OK: ' + passed + ' passed, 0 failed');
})().catch(error => { console.error(error); process.exitCode = 1; });
