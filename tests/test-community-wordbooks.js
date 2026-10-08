#!/usr/bin/env node
/**
 * Dimenticato — 社区词书逻辑测试（community-wordbooks.js）
 *
 * 在 tests/dom-shim.js 里加载真实的 supabase-config.js + community-wordbooks.js，
 * 用一个假的 Supabase 客户端（记录查询链）验证：上传对象 key、扩展名大小写、
 * ilike 转义、搜索防抖、语言筛空时的「查看全部语言」、导入防连点。不联网。
 *
 *   node tests/test-community-wordbooks.js
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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const win = createWindow();
const context = vm.createContext(win);
win.CustomEvent = function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; };
win.document.body.innerHTML = '<section id="communityBrowseScreen" class="screen active"><div class="browse-controls"></div>' +
  '<div id="communityWordbookList"></div></section>';
win.document.body.setAttribute('data-language', 'italian');

['lib/utils.js', 'lib/languages.js', 'lib/storage.js', 'supabase-config.js', 'community-wordbooks.js'].forEach(function (file) {
  const abs = path.join(ROOT, file);
  vm.runInContext(fs.readFileSync(abs, 'utf8'), context, { filename: abs });
});

const CW = win.CommunityWordbooks;
if (!CW) {
  console.error('FAIL: community-wordbooks.js 没有暴露 CommunityWordbooks');
  process.exit(1);
}

/**
 * 假 Supabase 客户端：每次 from() 记一条查询，链上的调用都记下来；
 * 结果由 respond(query) 决定（query.calls 是 [方法名, 参数…] 列表）。
 */
function fakeClient(respond) {
  const queries = [];
  const client = {
    queries,
    from(table) {
      const q = { table, calls: [] };
      queries.push(q);
      const chain = new Proxy({}, {
        get(_t, prop) {
          if (prop === 'then') {
            return (ok, bad) => Promise.resolve().then(() => respond(q)).then(ok, bad);
          }
          return (...args) => { q.calls.push([prop, ...args]); return chain; };
        }
      });
      return chain;
    }
  };
  return client;
}

function callOf(q, name) { return q.calls.find(c => c[0] === name); }

(async function main() {
  await group('上传：Storage 对象 key 不含原文件名，扩展名大小写不敏感', async function () {
    assertEqual(CW.fileExtension('旅行词汇.JSON'), '.json', '大写扩展名');
    assertEqual(CW.fileExtension('a.b.Txt'), '.txt', '多段文件名取最后一段');
    assertEqual(CW.fileExtension('noext'), '', '没有扩展名');
    const key = CW.storageObjectKey('.json');
    assert(/^\d+-[a-z0-9]+\.json$/.test(key), 'JSON 对象 key 形如 <时间戳>-<随机>.json：' + key);
    assert(/^\d+-[a-z0-9]+\.txt$/.test(CW.storageObjectKey('.txt')), 'TXT 保留 .txt（下载时按扩展名解析）');
    assert(/^[\x20-\x7e]+$/.test(key), '只有 ASCII');
  });

  await group('ilike 转义', async function () {
    assertEqual(CW.escapeIlike('100%_a\\b'), '100\\%\\_a\\\\b', '% _ \\ 都被转义');
    assertEqual(CW.escapeIlike('旅游'), '旅游', '普通文本不变');
  });

  // 语言筛空时：服务端已按语言过滤，要另外数一次「去掉语言条件」的行数
  await group('语言筛空时给「查看全部语言」按钮', async function () {
    let otherCount = 3;
    const client = fakeClient(q => {
      const select = callOf(q, 'select');
      if (select && select[2] && select[2].head) return { count: otherCount, error: null };
      return { data: [], error: null };
    });
    CW.getClient = async () => client;
    CW.currentFilters = { difficulty: 'all', language: 'german', tags: [], searchTerm: '' };
    CW.serverLanguageFilter = true;
    await CW.fetchAndDisplayWordbooks();
    const html = win.document.getElementById('communityWordbookList').innerHTML;
    assert(/show-all-languages/.test(html), '别的语言有词本：显示「查看全部语言」');
    assert(/还没有德语词本/.test(html), '提示当前语言没有词本');
    const head = client.queries.find(q => { const s = callOf(q, 'select'); return s && s[2] && s[2].head; });
    assert(head && !callOf(head, 'or'), '计数请求不带语言条件');

    otherCount = 0;
    await CW.fetchAndDisplayWordbooks();
    const empty = win.document.getElementById('communityWordbookList').innerHTML;
    assert(!/show-all-languages/.test(empty), '全库都没有：不给按钮');
    assert(/还没有社区词本/.test(empty), '全库为空的提示');
  });

  await group('老库（无 language 列）：客户端过滤后同样能判断', async function () {
    const client = fakeClient(q => {
      if (callOf(q, 'or')) return { data: null, error: { message: 'column "language" does not exist' } };
      return { data: [{ id: 1, name: 'x', language: 'French', author_name: 'a' }], error: null };
    });
    CW.getClient = async () => client;
    CW.currentFilters = { difficulty: 'all', language: 'german', tags: [], searchTerm: '' };
    CW.serverLanguageFilter = true;
    await CW.fetchAndDisplayWordbooks();
    assertEqual(CW.serverLanguageFilter, false, '降级为客户端过滤');
    assert(/show-all-languages/.test(win.document.getElementById('communityWordbookList').innerHTML), '有法语词本 → 给按钮');
    CW.serverLanguageFilter = true;
  });

  await group('搜索：防抖 + 转义后的 ilike', async function () {
    const client = fakeClient(() => ({ data: [], error: null }));
    CW.getClient = async () => client;
    CW.currentFilters = { difficulty: 'all', language: 'all', tags: [], searchTerm: '' };
    CW.searchWordbooks('5');
    CW.searchWordbooks('50');
    CW.searchWordbooks(' 50%_ ');
    await sleep(50);
    assertEqual(client.queries.length, 0, '250ms 内不发请求');
    await sleep(300);
    const lists = client.queries.filter(q => callOf(q, 'ilike'));
    assertEqual(lists.length, 1, '连打三次只查一次');
    assertEqual(callOf(lists[0], 'ilike'), ['ilike', 'name', '%50\\%\\_%'], '搜索词去空白并转义');
  });

  await group('导入：连点只导入一次', async function () {
    let release;
    const gate = new Promise(r => { release = r; });
    let metaFetches = 0;
    const client = fakeClient(async q => {
      if (callOf(q, 'single')) { metaFetches++; await gate; return { data: { id: 9, name: 'n', language: 'Italian', author_name: 'a', file_url: 'https://evil.example/x.json' }, error: null }; }
      return { data: [], error: null };
    });
    CW.getClient = async () => client;
    const first = CW.downloadWordbook(9);
    const second = CW.downloadWordbook(9);
    await second;
    release();
    await first;
    assertEqual(metaFetches, 1, '第二次点击被忽略');
    assert(!CW.downloading.has('9'), '完成后解除占用');
    assert(win.alerts.some(a => /受信任/.test(a)), '不受信任的文件地址被拦下');
  });

  await group('死代码已清理', async function () {
    assert(typeof CW.updateSortBy === 'undefined', 'updateSortBy 已删除');
    assert(typeof CW.resolveReturnScreen === 'undefined', 'resolveReturnScreen 已删除');
    assert(typeof win.PRESET_TAGS === 'undefined', 'PRESET_TAGS 不再导出');
    assert(typeof win.initSupabase === 'undefined' && typeof win.isSupabaseAvailable === 'undefined', 'Supabase 内部函数不再挂到 window');
    assert(typeof win.getSupabaseClient === 'function' && typeof win.communityLanguage === 'function', '对外接口还在');
  });

  console.log(`Community OK: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
