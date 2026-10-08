#!/usr/bin/env node
/**
 * Dimenticato — 引用路径存在性测试
 *
 * index.html 的本地 src/href、lib/languages.js 各语言的 files、lib/lang-loader.js 的 CODE 列表，
 * 引用的每个本地文件都必须真实存在。改名或删文件时漏改引用，浏览器只会静默 404。
 *
 *   node tests/test-paths.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function checkPath(rel, from) {
  const clean = rel.split(/[?#]/)[0];
  if (fs.existsSync(path.join(ROOT, clean)) && fs.statSync(path.join(ROOT, clean)).isFile()) { passed++; return; }
  failed++;
  console.error('FAIL: ' + from + ' 引用的 ' + rel + ' 不存在');
}

function isLocal(ref) {
  return ref && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref);
}

// 1. index.html 的本地 src / href
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const htmlRefs = new Set();
html.replace(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g, (m, ref) => { if (isLocal(ref)) htmlRefs.add(ref); return m; });
if (htmlRefs.size < 3) { failed++; console.error('FAIL: index.html 里找到的本地引用太少（' + htmlRefs.size + '），正则可能失效'); }
htmlRefs.forEach(ref => checkPath(ref, 'index.html'));

// 2. lib/languages.js 的 files
const sandbox = { window: {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib/languages.js'), 'utf8'), sandbox, { filename: 'lib/languages.js' });
const Languages = sandbox.Languages || sandbox.window.Languages;
if (!Languages || !Array.isArray(Languages.list) || !Languages.list.length) {
  failed++; console.error('FAIL: lib/languages.js 没有导出 Languages.list');
} else {
  Languages.list.forEach(p => {
    Object.keys(p.files || {}).forEach(mod => {
      (p.files[mod] || []).forEach(f => checkPath(f, 'lib/languages.js ' + p.code + '.' + mod));
    });
  });
}

// 3. lib/lang-loader.js 的 CODE 列表
const loader = fs.readFileSync(path.join(ROOT, 'lib/lang-loader.js'), 'utf8');
const codeMatch = loader.match(/var\s+CODE\s*=\s*\[([\s\S]*?)\]/);
if (!codeMatch) {
  failed++; console.error('FAIL: lib/lang-loader.js 里找不到 CODE 列表');
} else {
  const files = [];
  codeMatch[1].replace(/['"]([^'"]+)['"]/g, (m, f) => { files.push(f); return m; });
  if (!files.length) { failed++; console.error('FAIL: CODE 列表为空'); }
  files.forEach(f => checkPath(f, 'lib/lang-loader.js CODE'));
}

console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
