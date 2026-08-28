#!/usr/bin/env node
/**
 * Dimenticato — 打字游戏引擎测试（逻辑层，无 canvas）
 *
 *   node tests/test-typing-game.js
 *
 * lib/typing-game.js 的 Renderer 只负责画布绘制，核心逻辑（生成/下落/匹配/
 * 计分/扣命）不依赖 canvas，这里直接在 Node vm 里驱动 tick() 断言。
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

/** 确保指定答案的漂流物在场（start 只预生成 2 个，池是乱序的） */
function ensureItem(game, answer) {
  let guard = 0;
  while (!game.items.some((it) => it.nAnswer === answer) && guard++ < 40) game.spawn();
  return game.items.find((it) => it.nAnswer === answer);
}

// ===== 加载引擎（顶层 const 不进 window，从词法作用域取） =====
const win = createWindow();
const context = vm.createContext(win);
const engineFile = path.join(ROOT, 'lib/typing-game.js');
vm.runInContext(fs.readFileSync(engineFile, 'utf8'), context, { filename: engineFile });
const TypingGame = vm.runInContext('typeof TypingGame !== "undefined" ? TypingGame : null', context);
assert(TypingGame, 'TypingGame 应已暴露');

// ===== 归一化 =====
group('normalize', () => {
  assertEqual(TypingGame.normalize('  École  '), 'ecole', '重音+大小写+首尾空白应被归一');
  assertEqual(TypingGame.normalize('Grüße'), 'grusse', 'umlaut 剥离 + ß->ss');
  assertEqual(TypingGame.normalize('À'), 'a', 'À -> a');
  assertEqual(TypingGame.normalize(''), '', '空串');
});

// ===== 基础流程：打字自动击落 =====
group('clear flow', () => {
  const events = [];
  const game = TypingGame.create({
    width: 800, height: 440, dangerY: 370,
    baseInterval: 999999, // 不自动生成，只测手动
    pool: [{ prompt: '猫', answer: 'gatto' }],
    onEvent: (t, p) => events.push([t, p])
  });
  game.start();
  assertEqual(game.items.length, 2, 'start 应预生成 2 个漂流物');
  assertEqual(game.lives, 3, '初始 3 条命');

  game.setInput('gat');
  const target = game.activeTarget();
  assert(target, '前缀 gat 应匹配到 gatto');
  assertEqual(target.answer, 'gatto', '匹配到的答案应为 gatto');
  assertEqual(game.cleared, 0, '部分输入不击落');

  game.typeChar('t');
  game.typeChar('o'); // 打全 -> 自动击落
  assertEqual(game.cleared, 1, '打全后自动击落');
  assertEqual(game.streak, 1, '连击 +1');
  assertEqual(game.score, 10, '基础分 10');
  assertEqual(game.input, '', '击落后输入应清空');
  const cleared = events.filter((e) => e[0] === 'clear');
  assertEqual(cleared.length, 1, '应发出 1 次 clear 事件');
  assertEqual(cleared[0][1].points, 10, 'clear 事件带分数');
});

// ===== 重音宽松匹配 =====
group('accent-insensitive', () => {
  const game = TypingGame.create({
    pool: [{ prompt: '是', answer: 'être' }],
    baseInterval: 999999
  });
  game.start();
  game.setInput('et');
  assert(!game.exactMatch(), '部分输入不命中');
  assertEqual(game.cleared, 0, '未击落');
  game.setInput('etre');
  assertEqual(game.cleared, 1, 'etre 应自动击落 être（重音可省略）');
});

// ===== 回车提交未命中：断连击不扣命 =====
group('wrong submit', () => {
  const events = [];
  const game = TypingGame.create({
    pool: [{ prompt: '你好', answer: 'ciao' }, { prompt: '谢谢', answer: 'grazie' }],
    baseInterval: 999999,
    onEvent: (t, p) => events.push([t, p])
  });
  game.start();
  game.setInput('ci');
  assertEqual(game.submit(), false, '未打全时提交应返回 false');
  assertEqual(game.lives, 3, '提交未命中不扣命');
  assertEqual(game.streak, 0, '连击被清零');
  const wrong = events.filter((e) => e[0] === 'wrong');
  assertEqual(wrong.length, 1, '应发出 wrong 事件');
});

// ===== 沉底扣命 + 游戏结束 =====
group('miss and game over', () => {
  const events = [];
  const game = TypingGame.create({
    width: 800, height: 440, dangerY: 100,
    baseSpeed: 500, baseInterval: 999999,
    lives: 2,
    pool: [{ prompt: 'x1', answer: 'alpha' }, { prompt: 'x2', answer: 'beta' }],
    onEvent: (t, p) => events.push([t, p])
  });
  game.start();
  // 只把第一个漂流物推到危险线下：沉底一次，还剩 1 命
  const first = game.items[0];
  first.y = game.options.dangerY + 10;
  game.tick(16);
  assertEqual(game.lives, 1, '沉底扣 1 条命');
  assertEqual(game.missed, 1, 'missed 计数 +1');
  const miss = events.filter((e) => e[0] === 'miss');
  assertEqual(miss.length, 1, '应发出 miss 事件');

  // 第二个再过线：命耗尽 -> 游戏结束
  const second = game.items.find((it) => !it.dead);
  second.y = game.options.dangerY + 10;
  game.tick(16);
  assertEqual(game.lives, 0, '命耗尽');
  assertEqual(game.over, true, '游戏结束');
  const over = events.filter((e) => e[0] === 'gameover');
  assertEqual(over.length, 1, '应发出 gameover 事件');
  assertEqual(over[0][1].missed, 2, 'gameover 带 miss 统计');
});

// ===== 连击倍率 =====
group('combo multiplier', () => {
  const game = TypingGame.create({
    pool: Array.from({ length: 30 }, (_, i) => ({ prompt: 'p' + i, answer: 'w' + i })),
    baseInterval: 999999
  });
  game.start();
  // 依次打全 5 个词：第 4、5 个开始吃倍率（mult = 1 + floor(streak/4)）
  for (let i = 0; i < 5; i++) {
    const w = 'w' + i;
    const it = ensureItem(game, w);
    assert(it, '漂流物 ' + w + ' 应存在');
    if (!it) continue;
    game.setInput(w);
    game.submit();
  }
  assertEqual(game.cleared, 5, '击落 5 个');
  // 10 + 10 + 10 + 20 + 20
  assertEqual(game.score, 70, '连击倍率计分 10+10+10+20+20=70');
});

// ===== 难度递增 =====
group('level ramp', () => {
  const game = TypingGame.create({
    pool: Array.from({ length: 40 }, (_, i) => ({ prompt: 'p' + i, answer: 'word' + i })),
    baseInterval: 999999,
    clearsPerLevel: 6
  });
  game.start();
  for (let i = 0; i < 6; i++) {
    const w = 'word' + i;
    const it = ensureItem(game, w);
    if (it) { game.setInput(w); game.submit(); }
  }
  assertEqual(game.level, 2, '击落 6 个后升到 Lv.2');
  assertEqual(game.cleared, 6, 'cleared 计数 6');
});

// ===== 池耗尽后重填 =====
group('pool refill', () => {
  const game = TypingGame.create({
    pool: [{ prompt: 'only', answer: 'unico' }],
    baseInterval: 999999
  });
  game.start();
  game.setInput('unico');
  game.submit();
  assertEqual(game.cleared, 1, '第一个击落');
  game.refill();
  assert(game._pool.length > 0, '池耗尽后 refill 应重新填充');
});

// ===== 下落速度上限（回归：maxSpeed 曾是没接线的死常量） =====
group('speed cap', () => {
  const game = TypingGame.create({
    pool: [{ prompt: 'x', answer: 'parola' }],
    baseInterval: 999999,
    baseSpeed: 125,        // 困难档
    speedPerLevel: 1.09,
    maxSpeed: 260
  });
  game.start();
  game.level = 50;         // 高等级下 125 * 1.09^49 ≈ 8800，远超上限
  const it = game.spawn();
  assert(it, '应能生成漂流物');
  assert(it.speed <= 260, '高等级下落速度应封顶在 maxSpeed=260（实测 ' + it.speed.toFixed(1) + '）');
});

// ===== 特效老化（回归：粒子/漂浮分数的 t 从不增长，永久堆积） =====
group('fx aging', () => {
  const R = TypingGame.Renderer;
  R._parts = [{ t: 0, x: 10, y: 10, vx: 0, vy: 0, r: 2, color: '#fff' }];
  R._floats = [{ t: 0, x: 10, y: 10, text: '+10', color: '#ffe082' }];
  R._advanceFx(300);
  assertEqual(R._parts[0].t, 300, '粒子 t 应随帧时长增长');
  assertEqual(R._floats[0].t, 300, '漂浮分数 t 应随帧时长增长');
  R._advanceFx(400);
  assertEqual(R._parts[0].t, 700, '连续帧应累加（700 > 600 过滤阈值后会被清掉）');
  assertEqual(R._floats[0].t, 700, '漂浮分数同理（>900 后消失）');
});

console.log(`Typing OK: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
