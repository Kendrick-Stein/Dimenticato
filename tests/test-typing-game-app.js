#!/usr/bin/env node
/**
 * Dimenticato — 打字游戏应用层冒烟测试
 *
 *   node tests/test-typing-game-app.js
 *
 * 引擎测试（test-typing-game.js）只覆盖纯逻辑；这里用 dom-shim 把
 * typing-game-app.js 整个加载起来，验证：入口卡片委托 → open() 渲染设置屏
 * → 点开始 → 会话建立 → 模拟打字自动击落 → 变位模式建池 → 本地纪录写入。
 * 数据文件用最小桩（DIM_VOCAB schema v1 + lib/vocab.js / DIM_DATA.conjugations），
 * 不加载真实词库，跑得快。
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

// schema v1 词库桩：lib/vocab.js 经 lib/languages.js 把 'italian' 映射到 'it'
win.DIM_VOCAB = {
  it: {
    meta: { schema: 1, lang: 'it' },
    entries: [
      { word: 'gatto', pos: 'noun', level: 'A1', rank: 1, zh: '猫', en: 'cat' },
      { word: 'cane', pos: 'noun', level: 'A1', rank: 2, zh: '狗', en: 'dog' },
      { word: 'libro', pos: 'noun', level: 'A1', rank: 3, zh: '书', en: 'book' },
      { word: 'acqua', pos: 'noun', level: 'A1', rank: 4, zh: '水', en: 'water' },
      { word: 'sole', pos: 'noun', level: 'A1', rank: 5, zh: '太阳', en: 'sun' },
      { word: 'luna', pos: 'noun', level: 'A1', rank: 6, zh: '月亮', en: 'moon' }
    ]
  }
};
// 模块数据桩：只要 LangLoader.data（真 loader 会往 document 里插 <script>）
win.LangLoader = {
  data: (lang, module) => ((win.DIM_DATA || {})[module] || {})[win.Languages.code(lang)] || null
};
win.DIM_DATA = { conjugations: {} };
// conjugations/1 桩（docs/data-schema.md）：人称 / 时态标签在数据头，动词只存 6 元组或字符串
const personStub = (labels, zh) => labels.map((label, i) => ({ key: 'p' + (i + 1), label, zh: zh[i] }));
win.DIM_DATA.conjugations.it = {
  meta: { schema: 'conjugations/1', lang: 'it', count: 1 },
  persons: personStub(['io', 'tu', 'lui / lei', 'noi', 'voi', 'loro'], ['我', '你', '他/她', '我们', '你们', '他们']),
  tenses: [
    { key: 'indicativo_presente', group: 'indicativo', groupLabel: 'Indicativo', label: 'Presente', zh: '直陈式现在时', type: 'person' },
    { key: 'participio_passato', group: 'participio', groupLabel: 'Participio', label: 'Passato', zh: '过去分词', type: 'single' }
  ],
  verbs: [{
    word: 'essere', rank: 1, freq: 2090, zh: '是', en: 'to be',
    tenses: {
      indicativo_presente: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
      participio_passato: 'stato/stata'
    }
  }]
};

// ===== 加载模块 + 触发 DOMContentLoaded =====
['lib/languages.js', 'lib/vocab.js', 'lib/typing-game.js', 'typing-game-app.js'].forEach((file) => {
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

// ===== 学习遥测：击落写入每日统计与 SM-2（此前打字游戏零遥测） =====
group('telemetry', () => {
  const statsCalls = [];
  const srsCalls = [];
  win.StatsManager = { recordActivity: (lang, payload) => statsCalls.push([lang, payload]) };
  win.SpacedRepetition = { review: (lang, word, q) => srsCalls.push([lang, word, q]) };

  // 背单词模式：击落 = 统计 +1、SM-2 q4
  TypingGameApp.open('italian');
  win.document.getElementById('typingStartBtn').click();
  const game = TypingGameApp.getSession().game;
  const item = game.items[0];
  const input = win.document.getElementById('typingGameInput');
  input.value = item.answer;
  input.dispatchEvent({ type: 'input' });
  assertEqual(statsCalls.length, 1, '击落应记一次每日统计');
  assertEqual(statsCalls[0][0], 'italian', '统计语言应为当前语言');
  assertEqual(statsCalls[0][1].correct, 1, '击落应为 correct');
  assert(Array.isArray(statsCalls[0][1].words)
    && statsCalls[0][1].words.indexOf(item.answer) !== -1, '统计应包含被击落的词');
  assertEqual(srsCalls.length, 1, '背单词模式击落应写 SM-2');
  assertEqual(srsCalls[0][0], 'italian', 'SM-2 语言应为当前语言');
  assertEqual(srsCalls[0][1], item.answer, 'SM-2应以被击落词为键');
  assertEqual(srsCalls[0][2], 4, '击落质量应为 q4');
  TypingGameApp.close();

  // 变位模式：记统计但不写 SRS —— 变位形式不是词头，写进按词头
  // 索引的 SRS store 会污染调度。
  statsCalls.length = 0;
  srsCalls.length = 0;
  TypingGameApp.open('italian');
  const setup = win.document.getElementById('typingGameSetup');
  setup.querySelector('[data-typing-mode="conjugation"]').click();
  win.document.getElementById('typingStartBtn').click();
  const conjGame = TypingGameApp.getSession().game;
  const conjItem = conjGame.items[0];
  const conjInput = win.document.getElementById('typingGameInput');
  conjInput.value = conjItem.answer;
  conjInput.dispatchEvent({ type: 'input' });
  assertEqual(statsCalls.length, 1, '变位击落也应记每日统计');
  assertEqual(srsCalls.length, 0, '变位模式不应写 SRS');
  TypingGameApp.close();

  // 德语：answer 是带冠词的 display，SRS 必须按词头（entry.word）写 ——
  // 否则 "der Mann" 成了选择题/复习永远读不到的孤儿条目。
  statsCalls.length = 0;
  srsCalls.length = 0;
  const deEntries = [
    { word: 'Mann', display: 'der Mann', pos: 'noun', gender: 'm', level: 'A1', rank: 1, zh: '男人' },
    { word: 'Frau', display: 'die Frau', pos: 'noun', gender: 'f', level: 'A1', rank: 2, zh: '女人' },
    { word: 'Tag', display: 'der Tag', pos: 'noun', gender: 'm', level: 'A1', rank: 3, zh: '白天' },
    { word: 'Haus', display: 'das Haus', pos: 'noun', gender: 'n', level: 'A1', rank: 4, zh: '房子' }
  ];
  win.DIM_VOCAB.de = { meta: { schema: 1, lang: 'de' }, entries: deEntries };
  TypingGameApp.open('german');
  win.document.getElementById('typingStartBtn').click();
  const deItem = TypingGameApp.getSession().game.items[0];
  const deInput = win.document.getElementById('typingGameInput');
  deInput.value = deItem.answer;
  deInput.dispatchEvent({ type: 'input' });
  const headword = deEntries.find((w) => w.display === deItem.answer).word;
  assertEqual(srsCalls.length, 1, '德语击落应写 SM-2');
  assertEqual(srsCalls[0][1], headword, 'SM-2 键应为德语词头而不是带冠词的 display');
  assertEqual(statsCalls[0][1].words[0], headword, '每日统计同样记词头');
  TypingGameApp.close();
  delete win.DIM_VOCAB.de;

  delete win.StatsManager;
  delete win.SpacedRepetition;
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
  assert(answers.has('stato') && answers.has('stata'), '变位池应含 stato / stata（单形时态按 / 拆开）');
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

// ===== 重开一局应收起结算浮层（回归：浮层曾一直盖住新开的局） =====
group('restart hides overlay', () => {
  TypingGameApp.open('italian');
  win.document.getElementById('typingStartBtn').click();
  const overlay = win.document.getElementById('typingGameOverlay');
  // 模拟 showGameOver 的效果：浮层显示
  overlay.classList.remove('hidden');
  // 「再来一局」的处理等价于再次 startGame
  win.document.getElementById('typingStartBtn').click();
  assert(overlay.classList.contains('hidden'), 'startGame 应收起结算浮层');
  const session = TypingGameApp.getSession();
  assert(session && session.game && session.game.running, '新局应处于运行状态');
  TypingGameApp.close();
});

// ===== 英语变位模式的人称标签（回归：键不匹配时显示原始键名 he_she_it） =====
group('english conjugation person labels', () => {
  win.DIM_DATA.conjugations.en = {
    meta: { schema: 'conjugations/1', lang: 'en', count: 1 },
    persons: personStub(['I', 'you', 'he / she / it', 'we', 'you (pl.)', 'they'], ['我', '你', '他/她/它', '我们', '你们', '他们']),
    tenses: [{ key: 'indicative_present_simple', group: 'indicative', groupLabel: 'Indicative', label: 'Present simple', zh: '一般现在时', type: 'person' }],
    verbs: [{ word: 'be', rank: 1, freq: 6170, zh: '是', en: 'to be', tenses: { indicative_present_simple: ['am', 'are', 'is', 'are', 'are', 'are'] } }]
  };
  TypingGameApp.open('english');
  const setup = win.document.getElementById('typingGameSetup');
  setup.querySelector('[data-typing-mode="conjugation"]').click();
  win.document.getElementById('typingStartBtn').click();
  const game = TypingGameApp.getSession().game;
  // 在场只有随机 2 条，人称不确定；池 + 在场合起来覆盖全部条目
  const subs = game._pool.map((p) => p.sub)
    .concat(game.items.map((i) => i.sub)).join(' | ');
  assert(subs.indexOf('他/她/它') !== -1, '英语人称应显示中文标签，实得：' + subs);
  assert(subs.indexOf('p3') === -1, '不应残留人称键 p3');
  assert(subs.indexOf('我') !== -1, '第一人称应显示「我」');
  TypingGameApp.close();
  delete win.DIM_DATA.conjugations.en;
});

console.log(`Typing App OK: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
