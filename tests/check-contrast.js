#!/usr/bin/env node
/**
 * styles.css 颜色 token 的 WCAG 对比度检查（浅色 :root 与 [data-theme="dark"] 各一遍）。
 *   正文类文字（ink-soft / muted / red / gold / verde）对所有底色 ≥ 4.5:1
 *   表单控件边框（control-line）对常见底色 ≥ 3:1（WCAG 1.4.11 非文本对比）
 * 改 token 时跑一下：node tests/check-contrast.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');

function block(selector) {
  const start = css.indexOf(selector + ' {');
  if (start === -1) throw new Error('styles.css 里找不到 ' + selector);
  const body = css.slice(start, css.indexOf('}', start));
  const tokens = {};
  body.replace(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\b/g, (m, name, hex) => { tokens[name] = hex.toLowerCase(); });
  return tokens;
}

function luminance(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function ratio(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const light = block(':root');
const dark = Object.assign({}, light, block('[data-theme="dark"]'));

const TEXT = ['ink', 'ink-soft', 'muted', 'red', 'gold', 'verde'];
const SURFACES = ['paper', 'paper-soft', 'paper-deep', 'card'];
// 带 -soft 底的徽章/提示条：同色系文字压在上面
const PAIRS = [['red', 'red-soft'], ['gold', 'gold-soft'], ['verde', 'verde-soft']];
const CONTROL_SURFACES = ['paper', 'paper-soft', 'card'];

let passed = 0, failed = 0;
function expect(theme, fg, bg, min, t) {
  if (!t[fg] || !t[bg]) { failed++; console.log(`FAIL ${theme}: 缺少 --${fg} 或 --${bg}`); return; }
  const r = ratio(t[fg], t[bg]);
  if (r + 1e-9 >= min) passed++;
  else { failed++; console.log(`FAIL ${theme}: --${fg} ${t[fg]} on --${bg} ${t[bg]} = ${r.toFixed(2)}:1 (< ${min})`); }
}

for (const [theme, t] of [['light', light], ['dark', dark]]) {
  for (const fg of TEXT) for (const bg of SURFACES) expect(theme, fg, bg, 4.5, t);
  for (const [fg, bg] of PAIRS) expect(theme, fg, bg, 4.5, t);
  for (const bg of CONTROL_SURFACES) expect(theme, 'control-line', bg, 3, t);
}

const summary = `${passed} passed, ${failed} failed`;
if (failed) { console.error('Contrast FAILED: ' + summary); process.exit(1); }
console.log('Contrast OK: ' + summary);
