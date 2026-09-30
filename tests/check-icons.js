#!/usr/bin/env node
/**
 * 图标字体子集检查。
 *
 * index.html 只从 Google Fonts 取用到的 Material Symbols（&icon_names=...），
 * 代码里新增了图标却没加进子集时，页面上会直接显示成英文字（ligature 没有字形）。
 * 这里扫出所有 .msr 图标名，断言都在子集里、且子集按字母序（API 的要求）。
 *
 * 动态图标（card(action, icon)、renderStatus(icon)、{ icon: '...' }、textContent 切换）
 * 按调用形态匹配；新增一种传图标的写法时，把它的形态加进 DYNAMIC。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const m = /icon_names=([a-z0-9_,]+)/.exec(html);
if (!m) {
  console.error('icons FAILED: index.html 没有 icon_names 子集');
  process.exit(1);
}
const subset = m[1].split(',');
const allowed = new Set(subset);

const files = execFileSync('git', ['ls-files', '*.js', '*.html'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(f => f && !/^(dimenticato|data|tests|scripts|content)\//.test(f));

const DYNAMIC = [
  /\bcard\('[a-z-]+', '([a-z_0-9]+)'/g,          // app.js moduleCards
  /\bmodeCard\('[a-z]+', '([a-z_0-9]+)'/g,       // app.js 词汇模式卡片
  /renderStatus\(\s*'([a-z_0-9]+)'/g,            // community-wordbooks.js
  /\bicon: '([a-z_0-9]+)'/g,                     // emptyStateHtml({ icon })
  /icon \|\| '([a-z_0-9]+)'/g,                   // 默认图标
  /\.msr'\)\.textContent = [^;]*/g               // 主题 / 已掌握按钮切换
];

const used = new Map(); // name -> first file
const add = (name, file) => { if (!used.has(name)) used.set(name, file); };

for (const file of files) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const s of src.matchAll(/class="(?:[^"]*\s)?msr(?:\s[^"]*)?"[^>]*>\s*([a-z_0-9]+)\s*</g)) add(s[1], file);
  for (const re of DYNAMIC) {
    for (const s of src.matchAll(re)) {
      if (s[1]) add(s[1], file);
      // 三元表达式两个分支：`? 'a' : 'b'`（条件里的 'dark' 之类不是图标）
      else for (const q of s[0].matchAll(/[?:] '([a-z_0-9]+)'/g)) add(q[1], file);
    }
  }
}

let passed = 0, failed = 0;
const sorted = [...subset].sort();
if (sorted.join() === subset.join()) passed++;
else { failed++; console.log('FAIL icon_names 未按字母序排列'); }

for (const [name, file] of used) {
  if (allowed.has(name)) passed++;
  else { failed++; console.log(`FAIL ${file}: 图标 "${name}" 不在 index.html 的 icon_names 子集里`); }
}

const summary = `${passed} passed, ${failed} failed (${used.size} icons used, ${subset.length} in subset)`;
if (failed) {
  console.error('Icons FAILED: ' + summary);
  process.exit(1);
}
console.log('Icons OK: ' + summary);
