#!/usr/bin/env node
/**
 * Dimenticato — 无浏览器测试入口
 *
 *   node tests/run-headless.js            跑全部
 *   node tests/run-headless.js quiz       只跑名字里含 "quiz" 的
 *
 * *.html 测试页在 Node 的 vm + tests/dom-shim.js 里执行（顺序等同浏览器：
 * 先按 <script src> 依次加载，再跑内联脚本），*.js 测试直接子进程运行。
 * 任何 FAIL / 抛错 / 缺少汇总行都会让退出码非 0。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const { createWindow } = require('./dom-shim.js');

const TESTS_DIR = __dirname;
const ROOT = path.resolve(TESTS_DIR, '..');

const HTML_HARNESSES = ['test-quiz-engine.html', 'test-spaced-repetition.html'];
const NODE_HARNESSES = ['check-icons.js', 'check-contrast.js', 'check-data-modules.js', 'test-french-data.js', 'test-german-course-data.js', 'test-storage.js', 'test-typing-game.js', 'test-typing-game-app.js', 'test-conjugation-app.js', 'test-shell-router.js', 'test-wordbooks.js', 'test-community-wordbooks.js', 'test-paths.js'];

// 数据集校验器。上面的 harness 一个都不 require data/<code>-*.js / data/vocab/*.js，
// 生成数据和它的输入分头改动时（语法树重命名、词库重建）不会有任何测试变红——
// 已经这样漏过三次。校验器覆盖的正是这块，接进来当阻断项。
// 四种语言的词表（data/vocab/<lang>.js）统一由 validate_vocab.js 校验，
// 各语言的专属规则是它里面的 per-language hook。
const VALIDATORS = [
  'scripts/validate_vocab.js',
  // 模块数据（cognates/1 等）的统一校验：CHECKS 表，每个模块一个 validator + per-language hook
  'scripts/validate_modules.js',
  'scripts/validate_french_extras.js',
  // 法语释义质量回归：英语跳板同形词、（英：…）残留、同源词缺失、vocab_fixes 未落盘
  'scripts/validate_fr_quality.js',
  'scripts/validate_french_conjugations.js',
  'scripts/validate_english_conjugations.js',
  'scripts/validate_german_conjugations.js',
  'scripts/validate_french_grammar.js',
  'scripts/validate_german_extras.js',
  'scripts/validate_german_grammar.js',
  'scripts/validate_english_grammar.js',
  'scripts/validate_english_collocations.js',
];

function extractScripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const srcMatch = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(m[1] || '');
    if (srcMatch) out.push({ type: 'src', value: srcMatch[1] });
    else if (m[2].trim()) out.push({ type: 'inline', value: m[2] });
  }
  return out;
}

function extractBody(html) {
  const m = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
  return (m ? m[1] : html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
}

function runHtmlHarness(file) {
  const abs = path.join(TESTS_DIR, file);
  const html = fs.readFileSync(abs, 'utf8');
  const win = createWindow();
  const context = vm.createContext(win);
  const errors = [];

  // 先把静态 body（#results 容器等）建出来，再按顺序执行脚本
  win.document.body.innerHTML = extractBody(html);

  for (const script of extractScripts(html)) {
    try {
      if (script.type === 'src') {
        if (/^https?:/i.test(script.value)) continue;  // CDN：无浏览器时跳过
        const target = path.resolve(TESTS_DIR, script.value);
        vm.runInContext(fs.readFileSync(target, 'utf8'), context, { filename: target });
      } else {
        vm.runInContext(script.value, context, { filename: abs });
      }
    } catch (e) {
      errors.push((script.type === 'src' ? script.value : 'inline script') + ': ' + (e && e.message));
    }
  }

  const results = win.document.getElementById('results');
  const rows = results ? results.children : [];
  let passed = 0, failed = 0, known = 0, summary = '';
  const failures = [];
  rows.forEach(row => {
    const cls = row.className || '';
    const txt = row.textContent || '';
    if (cls.indexOf('summary') !== -1) { summary = txt; return; }
    if (cls.indexOf('known') !== -1) { known++; return; }
    if (cls.indexOf('fail') !== -1) { failed++; failures.push(txt); return; }
    if (cls.indexOf('pass') !== -1) { passed++; }
  });

  if (!summary) errors.push('缺少汇总行 —— 测试中途抛错退出了');
  return { file, passed, failed, known, summary, failures, errors };
}

// node harness 的最后一行形如 "Storage OK: 25 passed, 0 failed, 7 known issues"
function parseCounts(line) {
  const m = /(\d+) passed, (\d+) failed(?:, (\d+) known)?/.exec(line || '');
  if (!m) return null;
  return { passed: Number(m[1]), failed: Number(m[2]), known: Number(m[3] || 0) };
}

function runNodeHarness(file, baseDir) {
  const abs = path.join(baseDir || TESTS_DIR, file);
  if (!fs.existsSync(abs)) return null;
  try {
    const stdout = execFileSync(process.execPath, [abs], { cwd: ROOT, encoding: 'utf8' });
    const summary = stdout.trim().split('\n').pop().trim();
    const counts = parseCounts(summary) || { passed: 1, failed: 0, known: 0 };
    return { file, summary, failures: [], errors: [], ...counts };
  } catch (e) {
    const detail = ((e.stdout || '') + (e.stderr || '')).trim().split('\n').slice(-6).join('\n');
    return { file, passed: 0, failed: 1, known: 0, summary: '', failures: [detail], errors: [] };
  }
}

function main() {
  const filter = process.argv[2];
  const pick = (name) => !filter || name.indexOf(filter) !== -1;
  const reports = [];

  HTML_HARNESSES.filter(pick).forEach(f => reports.push(runHtmlHarness(f)));
  NODE_HARNESSES.filter(pick).forEach(f => {
    const r = runNodeHarness(f);
    if (r) reports.push(r);
  });
  VALIDATORS.filter(pick).forEach(f => {
    const r = runNodeHarness(f, ROOT);
    if (r) reports.push(r);
  });

  let bad = 0;
  reports.forEach(r => {
    const status = (r.failed || r.errors.length) ? 'FAIL' : 'OK  ';
    let counts = r.summary || `${r.passed} passed, ${r.failed} failed`;
    if (r.known && counts.indexOf('known') === -1) counts += ` (${r.known} known issues)`;
    console.log(`${status} ${r.file.padEnd(36)} ${counts}`);
    r.failures.forEach(f => console.log('       ' + f));
    r.errors.forEach(e => console.log('       ERROR ' + e));
    if (r.failed || r.errors.length) bad++;
  });

  const total = reports.reduce((acc, r) => ({
    passed: acc.passed + r.passed, failed: acc.failed + r.failed, known: acc.known + r.known
  }), { passed: 0, failed: 0, known: 0 });
  console.log(`\n${reports.length} harnesses — ${total.passed} passed, ${total.failed} failed, ${total.known} known issues`);
  process.exit(bad ? 1 : 0);
}

main();
