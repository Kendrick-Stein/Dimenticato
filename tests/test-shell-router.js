#!/usr/bin/env node
/**
 * Dimenticato — 外壳路由测试（lib/shell.js）
 *
 * 在 tests/dom-shim.js 里加载真实的 lib/utils.js + lib/languages.js + lib/shell.js，
 * 用桩出来的 history / App.setLanguage 驱动 DimRouter：深链接解析、未知语言 / slug
 * 的落点与地址改写、切语言期间的导航令牌（迟到的旧导航不能覆盖新导航）。
 *
 *   node tests/test-shell-router.js
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
  assert(actual === expected, message + ' (expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual) + ')');
}

async function group(name, fn) {
  try {
    await fn();
  } catch (e) {
    failed++;
    console.error('FAIL: ' + name + ' 抛错 — ' + (e && e.stack ? e.stack : e));
  }
}

const tick = () => new Promise(r => setTimeout(r, 0));

// ===== 环境 =====
const win = createWindow();
const context = vm.createContext(win);

win.CustomEvent = function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; };
win.scrollTo = function () {};
win.location.hash = '';
const historyLog = [];
win.history = {
  pushState(_s, _t, url) { historyLog.push(['push', url]); win.location.hash = url; },
  replaceState(_s, _t, url) { historyLog.push(['replace', url]); win.location.hash = url; }
};

const SCREEN_IDS = [
  'homeScreen', 'vocabScreen', 'quizScreen', 'spellScreen', 'browseScreen', 'typingGameScreen',
  'cognatePracticeScreen', 'communityBrowseScreen', 'grammarScreen', 'grammarBookScreen',
  'conjugationSetupScreen', 'conjugationScreen', 'verbCollocationsScreen',
  'verbCollocationPracticeScreen', 'courseScreen', 'progressScreen', 'settingsScreen'
];
win.document.body.innerHTML = '<nav id="crumbs"></nav><main id="main">' +
  SCREEN_IDS.map(id => '<section class="screen" id="' + id + '"></section>').join('') + '</main>';
win.document.body.setAttribute('data-language', 'italian');

['lib/utils.js', 'lib/languages.js', 'lib/shell.js'].forEach(function (file) {
  const abs = path.join(ROOT, file);
  vm.runInContext(fs.readFileSync(abs, 'utf8'), context, { filename: abs });
});

const { DimRouter, Shell, ScreenTree } = win;
if (!DimRouter || !Shell || !ScreenTree) {
  console.error('FAIL: lib/shell.js 没有暴露 DimRouter / Shell / ScreenTree');
  process.exit(1);
}

// App.setLanguage 桩：立刻改 data-language（与真实实现一致），加载完成由测试手动放行
const pendingLoads = [];
win.App = {
  setLanguage(lang) {
    win.document.body.setAttribute('data-language', lang);
    return new Promise(resolve => pendingLoads.push({ lang, resolve }));
  }
};

const opened = [];
Shell.registerOpener('grammarBookScreen', function (lang, param) {
  opened.push({ lang, param });
  win.showScreen('grammarBookScreen');
});

function navigate(hash) {
  win.location.hash = hash;
  win.dispatchEvent({ type: 'hashchange' });
}

(async function main() {
  await group('parse：深链接与未知输入', async function () {
    let r = DimRouter.parse('#/de/grammar/book/p1/ch01/t01');
    assert(r && r.lang === 'german', '语言代码 de → german');
    assertEqual(r.screenId, 'grammarBookScreen', '带参数的语法书深链接');
    assertEqual(r.param, 'p1/ch01/t01', '参数原样交给 opener');
    assert(!r.unknown, '深链接不是未知 slug');

    r = DimRouter.parse('#/fr/vocab/browse/');
    assertEqual(r.screenId, 'browseScreen', '尾部斜杠被忽略');
    assertEqual(r.param, null, '无参数屏不带 param');

    r = DimRouter.parse('#/it');
    assertEqual(r.screenId, 'homeScreen', '只有语言代码 → 首页');
    assert(!r.unknown, '空 slug 不算未知');

    r = DimRouter.parse('#/de/nope/xyz');
    assertEqual(r.screenId, 'homeScreen', '未知 slug 落到首页');
    assert(r.unknown, '未知 slug 被标记出来');

    r = DimRouter.parse('#/de/vocab/browsex');
    assert(r.unknown && r.screenId === 'homeScreen', '前缀相似的 slug 也是未知');

    r = DimRouter.parse('#/de/vocab/browse/extra');
    assert(r.unknown, '不带参数的屏后面多一段 → 未知');

    assertEqual(DimRouter.parse('#/xx/vocab'), null, '未知语言代码 → null');
    assertEqual(DimRouter.parse('#/'), null, '#/ → null');
    assertEqual(DimRouter.parse(''), null, '空 hash → null');
    assertEqual(DimRouter.parse('#main'), null, '页内锚点不是路由');
  });

  await group('href：语言 key / code 都接受', async function () {
    assertEqual(DimRouter.href('german', 'browseScreen'), '#/de/vocab/browse', '旧 key');
    assertEqual(DimRouter.href('fr', 'homeScreen'), '#/fr', '首页没有 slug');
    assertEqual(DimRouter.href('it', 'conjugationScreen'), '#/it', 'slug 为 null 的会话屏只有语言段');
    assert(typeof ScreenTree.screenOf === 'undefined' && typeof ScreenTree.homeOf === 'undefined', '死接口已删除');
  });

  await group('start：首屏深链接', async function () {
    win.location.hash = '#/it/vocab/browse';
    DimRouter.start();
    await tick();
    assertEqual(Shell.current(), 'browseScreen', '首屏进入深链接屏');
    assertEqual(win.location.hash, '#/it/vocab/browse', '地址保持不变');
  });

  await group('hashchange：未知 slug 回首页并改写成规范地址', async function () {
    navigate('#/it/does/not/exist');
    await tick();
    assertEqual(Shell.current(), 'homeScreen', '未知 slug → 首页');
    assertEqual(win.location.hash, '#/it', '地址被 replaceState 成规范地址');
    assertEqual(historyLog[historyLog.length - 1][0], 'replace', '用 replaceState，不新增历史条目');

    // 已经在首页时再来一个坏 slug：不切屏，但地址仍要改写
    navigate('#/it/again-bad');
    await tick();
    assertEqual(Shell.current(), 'homeScreen', '仍在首页');
    assertEqual(win.location.hash, '#/it', '已在首页时坏地址也被改写');
  });

  await group('hashchange：会话屏地址改写到父级', async function () {
    navigate('#/it/vocab/choice');
    await tick();
    assertEqual(Shell.current(), 'vocabScreen', '选择题会话屏刷新后落回词汇页');
    assertEqual(win.location.hash, '#/it/vocab', '地址改写为父级');
  });

  await group('hashchange：未知语言代码', async function () {
    navigate('#/xx/vocab');
    await tick();
    assertEqual(Shell.current(), 'homeScreen', '未知语言 → 当前语言首页');
    assertEqual(win.location.hash, '#/it', '地址改写为当前语言首页');
    assertEqual(win.document.body.getAttribute('data-language'), 'italian', '语言不变');
  });

  await group('深链接带参数：交给 opener', async function () {
    navigate('#/it/grammar/book/p1/ch01/t01');
    await tick();
    const last = opened[opened.length - 1];
    assert(last && last.lang === 'italian' && last.param === 'p1/ch01/t01', 'opener 收到语言与参数');
    assertEqual(Shell.current(), 'grammarBookScreen', '进入语法书');
    assertEqual(win.location.hash, '#/it/grammar/book/p1/ch01/t01', '带参数的地址不被抹掉');
  });

  await group('导航令牌：#/de/x 后立刻 #/fr/y，迟到的 de 不能覆盖 fr', async function () {
    navigate('#/de/progress');
    navigate('#/fr/settings');
    assertEqual(pendingLoads.length, 2, '两次切语言都在等语言包');
    // fr 先到，de 后到（最坏顺序）
    pendingLoads[1].resolve();
    await tick();
    assertEqual(Shell.current(), 'settingsScreen', 'fr 的目标屏打开');
    pendingLoads[0].resolve();
    await tick();
    assertEqual(Shell.current(), 'settingsScreen', '迟到的 de 导航被丢弃');
    assertEqual(win.document.body.getAttribute('data-language'), 'french', '语言仍是 fr');
    assertEqual(win.location.hash, '#/fr/settings', '地址仍是 fr 的');
    pendingLoads.length = 0;
  });

  await group('导航令牌：de 先到也不能开在 fr 语境下', async function () {
    navigate('#/de/progress');
    navigate('#/en/vocab');
    pendingLoads[0].resolve();   // de 先到：令牌已过期
    await tick();
    assertEqual(Shell.current(), 'settingsScreen', '过期的 de 导航不切屏');
    pendingLoads[1].resolve();
    await tick();
    assertEqual(Shell.current(), 'vocabScreen', 'en 的目标屏打开');
    assertEqual(win.document.body.getAttribute('data-language'), 'english', '语言是 en');
    pendingLoads.length = 0;
  });

  await group('导航令牌：等语言包期间用户点了别的屏', async function () {
    navigate('#/de/progress');
    win.showScreen('settingsScreen');      // 用户在加载期间点了设置
    pendingLoads[0].resolve();
    await tick();
    assertEqual(Shell.current(), 'settingsScreen', '用户的显式切屏不被迟到的路由覆盖');
    pendingLoads.length = 0;
  });

  await group('导航令牌：等语言包期间语言被别处切走', async function () {
    navigate('#/it/progress');
    win.document.body.setAttribute('data-language', 'german');   // 例如点了语言按钮
    pendingLoads[0].resolve();
    await tick();
    assert(Shell.current() !== 'progressScreen', '语言已不是路由的语言，不切屏');
    pendingLoads.length = 0;
  });

  console.log(`Shell router OK: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
