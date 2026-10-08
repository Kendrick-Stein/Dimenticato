#!/usr/bin/env node
/**
 * Dimenticato — 个人单词本解析测试（lib/wordbooks.js）
 *
 * 在 tests/dom-shim.js 里加载真实的 lib/utils / languages / vocab / storage / wordbooks，
 * 覆盖 TXT 解析（parseTxt）、JSON 导入（importFile）的边界情况，以及无 id 老词本的 id 固定。
 *
 *   node tests/test-wordbooks.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createWindow } = require('./dom-shim.js');

const ROOT = path.resolve(__dirname, '..');

let passed = 0, failed = 0;

function assert(condition, message) {
  if (condition) { passed++; return; }
  failed++;
  console.error('FAIL: ' + message);
}

function assertEqual(actual, expected, message) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  assert(a === e, message + ' (expected ' + e + ', got ' + a + ')');
}

async function group(name, fn) {
  try {
    await fn();
  } catch (e) {
    failed++;
    console.error('FAIL: ' + name + ' 抛错 — ' + (e && e.stack ? e.stack : e));
  }
}

const win = createWindow();
const context = vm.createContext(win);
win.CustomEvent = function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; };

win.DIM_VOCAB = {
  it: {
    meta: { schema: 1, lang: 'it' },
    entries: [
      { word: 'casa', pos: 'noun', zh: '房子', en: 'house', level: 'A1', rank: 1 },
      { word: 'città', pos: 'noun', zh: '城市', en: 'city', level: 'A1', rank: 2 }
    ]
  },
  de: {
    meta: { schema: 1, lang: 'de' },
    entries: [
      { word: 'Haus', display: 'das Haus', pos: 'noun', gender: 'n', zh: '房子', en: 'house', level: 'A1', rank: 1, legacyId: 'de-00001' }
    ]
  }
};

['lib/utils.js', 'lib/languages.js', 'lib/vocab.js', 'lib/storage.js', 'lib/wordbooks.js'].forEach(function (file) {
  const abs = path.join(ROOT, file);
  vm.runInContext(fs.readFileSync(abs, 'utf8'), context, { filename: abs });
});

const W = win.Wordbooks;
const ls = win.localStorage;
if (!W) {
  console.error('FAIL: lib/wordbooks.js 没有暴露 Wordbooks');
  process.exit(1);
}

function fakeFile(name, content) {
  return { name, text: () => Promise.resolve(content) };
}

function throwsMessage(fn) {
  try { fn(); } catch (e) { return e.message; }
  return null;
}

async function rejects(promise) {
  try { await promise; } catch (e) { return e.message; }
  return null;
}

function resetBooks(raw) {
  ls.clear();
  if (raw !== undefined) ls.setItem('dimenticato_custom_wordbooks', typeof raw === 'string' ? raw : JSON.stringify(raw));
  W._books = null;
}

(async function main() {
  await group('parseTxt：块格式', async function () {
    const res = W.parseTxt('ciao\n你好\n\nlibro\nbook\n书\n\ntreno\ntrain\n火车\n常用\n交通', 'italian');
    assertEqual(res.words.length, 3, '三个块三个词');
    assertEqual(res.words[0], { word: 'ciao', zh: '你好' }, '两行：第二行是中文 → zh');
    assertEqual(res.words[1], { word: 'libro', zh: '书', en: 'book' }, '三行：英文 + 中文');
    assertEqual(res.words[2].notes, '常用 交通', '四行以上：其余行并成 notes');
  });

  await group('parseTxt：两行且第二行不是中文 → 英文释义', async function () {
    const res = W.parseTxt('ciao\nhello', 'italian');
    assertEqual(res.words[0], { word: 'ciao', zh: 'hello' }, '只有英文时 zh 退用英文，en 不重复');
  });

  await group('parseTxt：单行块查系统词库', async function () {
    const res = W.parseTxt('casa\n\nnonesiste', 'it');
    assertEqual(res.words[0], { word: 'casa', zh: '房子', en: 'house' }, '查到系统词条补上释义');
    assertEqual(res.words[1], { word: 'nonesiste', zh: '' }, '查不到的保留空释义');
    assertEqual(res.autoMatchedCount, 1, '自动匹配计数');
    assertEqual(res.needManualCount, 1, '需手动补释义计数');
    const legacy = W.parseTxt('de-00001', 'german');
    assertEqual(legacy.words[0].zh, '房子', '旧 id 经 resolveLegacyKey 也能查到');
  });

  await group('parseTxt：换行 / 空白边界', async function () {
    const crlf = W.parseTxt('\r\n\r\n  ciao  \r\n 你好 \r\n\r\n\r\n\r\ncasa\r\n房子\r\n', 'it');
    assertEqual(crlf.words.map(w => w.word), ['ciao', 'casa'], 'CRLF、多余空行、首尾空白都被吃掉');
    assertEqual(crlf.words[0].zh, '你好', '行内首尾空白被去掉');
    const cr = W.parseTxt('ciao\r你好\r\rcasa\r房子', 'it');
    assertEqual(cr.words.length, 2, '老 Mac 的 \\r 换行');
    const ws = W.parseTxt('ciao\n你好\n   \t \ncasa\n房子', 'it');
    assertEqual(ws.words.length, 2, '只含空白的行也算块分隔');
    const bom = W.parseTxt('\uFEFFciao\n你好', 'it');
    assertEqual(bom.words[0].word, 'ciao', '开头的 BOM 不进词形');
  });

  await group('parseTxt：没有有效内容时报错', async function () {
    assert(/没有找到有效的单词/.test(throwsMessage(() => W.parseTxt('', 'it')) || ''), '空文本');
    assert(/没有找到有效的单词/.test(throwsMessage(() => W.parseTxt('\n \n\t\n', 'it')) || ''), '全是空白');
    assert(/没有找到有效的单词/.test(throwsMessage(() => W.parseTxt(null, 'it')) || ''), 'null');
  });

  await group('parseTxt ↔ exportTxt 往返', async function () {
    resetBooks([]);
    const book = W.add({ id: 1, name: 'rt', language: 'italian', words: [
      { word: 'ciao', zh: '你好' },
      { word: 'libro', zh: '书', en: 'book' },
      { word: 'treno', zh: '火车', en: 'train', notes: '交通' },
      { word: 'casa', zh: '房子', notes: '家' }
    ] });
    let text = null;
    win.downloadFile = (_name, content) => { text = content; };
    W.exportTxt(book.id);
    const back = W.parseTxt(text, 'italian').words;
    assertEqual(back, book.words, '导出的 TXT 再导入得到同样的行');
  });

  await group('normalizeRow：历史行形状', async function () {
    assertEqual(W.normalizeRow({ italian: 'casa', english: 'house', chinese: '房子' }, 'italian'),
      { word: 'casa', zh: '房子', en: 'house' }, '{italian, english, chinese}');
    assertEqual(W.normalizeRow({ german: 'Haus', display: 'das Haus', meaning: '房子' }, 'german'),
      { word: 'Haus', zh: '房子' }, '{german, display, meaning}');
    assertEqual(W.normalizeRow({ english: 'house', chinese: '房子' }, 'english'),
      { word: 'house', zh: '房子' }, '英语词本的 english 字段是词形，不当英文释义');
    assertEqual(W.normalizeRow({ word: '   ' }, 'it'), null, '空词形丢弃');
    assertEqual(W.normalizeRow('casa', 'it'), null, '不是对象的行丢弃');
    assertEqual(W.normalizeRow(null, 'it'), null, 'null 行丢弃');
  });

  await group('importFile JSON：对象、数组、各种错误', async function () {
    resetBooks([]);
    let r = await W.importFile(fakeFile('viaggio.json', JSON.stringify({
      name: '旅行', language: 'italian', description: 'd', words: [{ word: 'treno', zh: '火车' }, { word: '' }, 7]
    })), 'it');
    assertEqual(r.wordbook.name, '旅行', '用 JSON 里的 name');
    assertEqual(r.wordbook.words, [{ word: 'treno', zh: '火车' }], '无效行被过滤');
    assertEqual(r.wordbook.language, 'italian', '语言是导入时所在的语言');

    r = await W.importFile(fakeFile('Lista.JSON', JSON.stringify([{ italian: 'casa', chinese: '房子' }])), 'italian');
    assertEqual(r.wordbook.name, 'Lista', '纯数组：名字取文件名，扩展名大小写不敏感');
    assertEqual(r.wordbook.words[0], { word: 'casa', zh: '房子' }, '数组里的旧行形状被归一');

    assert(/JSON 解析失败/.test(await rejects(W.importFile(fakeFile('bad.json', '{oops'), 'it')) || ''), '坏 JSON');
    assert(/非空数组/.test(await rejects(W.importFile(fakeFile('e.json', '{"name":"x","words":[]}'), 'it')) || ''), '空 words');
    assert(/非空数组/.test(await rejects(W.importFile(fakeFile('n.json', 'null'), 'it')) || ''), 'null');
    assert(/非空数组/.test(await rejects(W.importFile(fakeFile('s.json', '{"words":"casa"}'), 'it')) || ''), 'words 不是数组');
    assert(/没有找到有效的单词/.test(await rejects(W.importFile(fakeFile('x.json', '{"words":[{"zh":"无词形"}]}'), 'it')) || ''), '全是无效行');
    assert(/德语/.test(await rejects(W.importFile(fakeFile('d.json', '{"language":"german","words":[{"word":"Haus"}]}'), 'it')) || ''),
      '别的语言的词本提示去对应语言导入');
    assertEqual(W.list('italian').length, 2, '失败的导入不留下词本');
  });

  await group('importFile TXT 与同名合并', async function () {
    resetBooks([]);
    let r = await W.importFile(fakeFile('mio.TXT', 'ciao\n你好\n\ncasa'), 'italian');
    assertEqual(r.wordbook.name, 'mio', 'TXT 名字去掉扩展名（大小写不敏感）');
    assertEqual(r.stats.autoMatchedCount, 1, 'TXT 统计带回来');
    win._promptAnswer = '1';
    r = await W.importFile(fakeFile('mio.txt', 'CIAO\n你好\n\nlibro\n书'), 'italian');
    assert(r.isMerge, '选 1 合并到同名词本');
    assertEqual(r.stats.duplicatesSkipped, 1, '大小写不同的重复词被跳过');
    assertEqual(r.wordbook.words.map(w => w.word), ['ciao', 'casa', 'libro'], '只追加新词');
    win._promptAnswer = '0';
    assert(/已取消/.test(await rejects(W.importFile(fakeFile('mio.txt', 'treno\n火车'), 'italian')) || ''), '选 0 取消');
    win._promptAnswer = null;
  });

  await group('无 id 的老词本：id 第一次读到时固定下来', async function () {
    resetBooks([
      { name: 'a', language: 'italian', words: [{ word: 'casa', zh: '房子' }] },
      { name: 'b', language: 'german', words: [] },
      { id: 5, name: 'c', language: 'italian', words: [] },
      'junk'
    ]);
    const first = W.all().map(b => b.id);
    assertEqual(first.length, 3, '非对象条目被丢掉');
    assertEqual(first[2], 5, '已有 id 不动');
    assert(first[0] != null && first[1] != null && first[0] !== first[1], '无 id 的几本拿到互不相同的 id');
    const stored = JSON.parse(ls.getItem('dimenticato_custom_wordbooks'));
    assertEqual(stored.map(b => b.id), first, '生成的 id 写回了存储');
    W._books = null;
    assertEqual(W.all().map(b => b.id), first, '重新读取 id 不漂移');
    assert(W.get(first[0]) && W.get(first[0]).name === 'a', '按生成的 id 能取到词本');
  });

  await group('WordbookManager 兼容壳已删除', async function () {
    assert(typeof win.WordbookManager === 'undefined', '没有调用方的 WordbookManager 不再导出');
  });

  console.log(`Wordbooks OK: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
