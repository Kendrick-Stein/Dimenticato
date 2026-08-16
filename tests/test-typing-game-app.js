#!/usr/bin/env node
/**
 * Dimenticato — 打字游戏应用层冒烟测试
 *
 *   node tests/test-typing-game-app.js
 *
 * 引擎测试（test-typing-game.js）只覆盖纯逻辑；这里用 dom-shim 把
 * typing-game-app.js 整个加载起来，验证：入口卡片委托 → open() 渲染设置屏
 * → 点开始 → 会话建立 → 模拟打字自动击落 → 变位模式建池 → 本地纪录写入。
 * 数据文件用最小桩（window.VOCABULARY_DATA / CONJUGATION_ALL_TENSES_DATA），
 * 不加载 5MB 真实词库，跑得快。
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

function group(name, fn) {
  try {
    fn();
  } catch (e) {
    failed++;
    console.error('FAIL: ' + name + ' 抛错 — ' + (e && e.stack ? e.stack : e));
  }
}

// ===== 垫片环境 + 游戏屏 DOM + 数据桩 =====
const win = createWindow();
const context = vm.createContext(win);

win.document.body.innerHTML =
  '<section id="typingGameScreen" class="screen">' +
    '<div class="container">' +
      '<button class="back-link" id="typingGameBackBtn">返回</button>' +
      '<div class="eyebrow" id="typingGameEyebrow"></div>' +
      '<h1 class="page">激流勇进</h1>' +
      '<p class="desc" id="typingGameDesc"></p>' +
      '<div id="typingGameSetup"></div>' +
      '<div id="typingGamePlay" class="hidden">' +
        '<div class="typing-hud">' +
          '<b id="typingHudScore">0</b><b id="typingHudCombo">—</b>' +
          '<b id="typingHudLevel">Lv.1</b><b id="typingHudLives"></b><b id="typingHudCleared">0</b>' +
        '</div>' +
        '<div class="typing-canvas-wrap" id="typingGameCanvasWrap">' +
          '<canvas id="typingGameCanvas"></canvas>' +
          '<div id="typingGameOverlay" class="hidden"></div>' +
        '</div>' +
        '<input type="text" id="typingGameInput">' +
      '</div>' +
    '</div>' +
  '</section>' +
  '<button class="card typing-feature-card" data-typing-game-lang="german">德语入口</button>';

win.VOCABULARY_DATA = [
  { italian: 'gatto', english: 'cat', chinese: '猫' },
  { italian: 'cane', english: 'dog', chinese: '狗' },
  { italian: 'libro', english: 'book', chinese: '书' },
  { italian: 'acqua', english: 'water', chinese: '水' },
  { italian: 'sole', english: 'sun', chinese: '太阳' },
  { italian: 'luna', english: 'moon', chinese: '月亮' }
];
win.CONJUGATION_ALL_TENSES_DATA = [{
  rank: 1, infinitive: 'essere', english: 'to be',
  tenses: {
    indicativo_presente: {
      type: 'person', group_label: 'Indicativo', tense_label: 'Presente',
      forms: { io: 'sono', tu: 'sei', lui_lei: 'è', noi: 'siamo', voi: 'siete', loro: 'sono' }
    },
    participio: { type: 'single', group_label: 'Participio', tense_label: 'Passato', forms: ['stato', 'stata'] }
  }
}];

// ===== 加载模块 + 触发 DOMContentLoaded =====
['lib/typing-game.js', 'typing-game-app.js'].forEach((file) => {
  const abs = path.join(ROOT, file);
  vm.runInContext(fs.readFileSync(abs, 'utf8'), context, { filename: abs });
});
const TypingGameApp = win.TypingGameApp;
assert(TypingGameApp, 'TypingGameApp 应已暴露');
win.document.dispatchEvent({ type: 'DOMContentLoaded' });

// ===== 入口卡片委托 =====
group('entry delegation', () => {
  const card = win.document.querySelector('[data-typing-game-lang="german"]');
  assert(card, '入口卡片应存在');
  card.click();
  assertEqual(TypingGameApp.getActiveLanguage(), 'german', '点德语入口应打开德语会话');
  const eyebrow = win.document.getElementById('typingGameEyebrow');
  assertEqual(eyebrow.textContent, '德语 / Typing Game', 'eyebrow 应显示当前语言');
});

// ===== open() 渲染设置屏 =====
group('setup render', () => {
  TypingGameApp.open('italian');
  const setup = win.document.getElementById('typingGameSetup');
  assert(setup.innerHTML.indexOf('开始激流勇进') !== -1, '设置屏应渲染开始按钮');
  assert(setup.querySelectorAll('[data-typing-mode]').length === 2, '应有 背单词/变位 两个模式');
  assert(setup.querySelectorAll('[data-typing-diff]').length === 3, '应有 3 档难度');
  const play = win.document.getElementById('typingGamePlay');
  assert(play.classList.contains('hidden'), '未开始时游戏区应隐藏');
});

// ===== 开始游戏 + 模拟打字击落 =====
group('play flow', () => {
  TypingGameApp.open('italian');
  win.document.getElementById('typingStartBtn').click();
  const session = TypingGameApp.getSession();
  assert(session && session.game, '会话应建立且 game 存在');
  assertEqual(session.mode, 'vocab', '默认背单词模式');
  assertEqual(session.game.lives, 3, '3 条命');
  const play = win.document.getElementById('typingGamePlay');
  assert(!play.classList.contains('hidden'), '开始后游戏区应显示');

  // 模拟打字：取第一个在场漂流物的答案，塞进输入框并派发 input 事件
  const game = session.game;
  const item = game.items[0];
  const input = win.document.getElementById('typingGameInput');
  input.value = item.answer;
  input.dispatchEvent({ type: 'input' });
  assertEqual(game.cleared, 1, '打全答案应自动击落');
  assertEqual(game.score, 10, '得分 10');

  // 停局，避免渲染器 rAF 循环占用事件循环
  TypingGameApp.close();
  assertEqual(TypingGameApp.getSession(), null, 'close 后会话清空');
});

// ===== 变位模式建池 =====
group('conjugation mode', () => {
  TypingGameApp.open('italian');
  const setup = win.document.getElementById('typingGameSetup');
  const conjChip = setup.querySelector('[data-typing-mode="conjugation"]');
  assert(conjChip, '变位模式 chip 应存在');
  conjChip.click();
  win.document.getElementById('typingStartBtn').click();
  const session = TypingGameApp.getSession();
  assertEqual(session.mode, 'conjugation', '切到变位模式');
  // 池 + 在场漂流物一起看：start() 已从池里弹出 2 条
  const all = session.game._pool.map((p) => p.answer)
    .concat(session.game.items.map((i) => i.answer));
  const answers = new Set(all);
  assert(answers.has('sono'), '变位池应含 sono');
  assert(answers.has('stato'), '变位池应含 stato（分词）');
  assert(answers.size >= 6, '变位池应覆盖全部形式，实得 ' + answers.size);
  TypingGameApp.close();
});

// ===== 本地纪录 =====
group('best score', () => {
  TypingGameApp.open('italian');
  win.document.getElementById('typingStartBtn').click();
  const session = TypingGameApp.getSession();
  const game = session.game;
  // 依次打落 2 个在场且未死的漂流物
  const alive = game.items.filter((it) => !it.dead).slice(0, 2);
  assertEqual(alive.length, 2, '在场应有 2 个可击落目标');
  alive.forEach((item) => {
    game.setInput(item.answer);
    game.submit();
  });
  const score = game.score;
  assert(score >= 20, '2 词得分应 >= 20，实得 ' + score);
  // 手动触发 gameover 保存纪录（正常路径由沉底/命尽触发）
  game.end();
  const saved = Number(win.localStorage.getItem('dimenticato_typing_best_italian_vocab')) || 0;
  assertEqual(saved, score, '本地纪录应写入当前得分');
  TypingGameApp.close();
});

console.log(`Typing App OK: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
