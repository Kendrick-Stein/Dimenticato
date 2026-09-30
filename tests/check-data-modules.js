#!/usr/bin/env node
/**
 * 数据模块注册检查。
 *
 * 功能模块（变位 / 语法 / 搭配 / 同源词 / 课程）的数据一律经 LangLoader.data(lang, module)
 * 取，前提是每个 data 文件都把自己注册成 DIM_DATA.<module>.<code>（scripts/data_module.py）。
 * 这里逐语言、逐模块把 lib/languages.js 的 files 清单装进 vm，断言：
 *   - 注册的正好是清单声明的那一格，且非空；
 *   - data/ 下每个 .js 都被某个 profile 引用（没有孤儿文件、也没有漏登记的文件）。
 * 生成脚本改输出格式时忘了写注册尾巴，这里会先变红，而不是等页面上模块打不开。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console });
ctx.window = ctx;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib/languages.js'), 'utf8'), ctx);
const Languages = ctx.Languages;

let passed = 0, failed = 0;
const fail = (msg) => { failed++; console.log('FAIL ' + msg); };
const listed = new Set();

for (const p of Languages.list) {
  for (const [module, files] of Object.entries(p.files)) {
    files.forEach((f) => listed.add(f));
    if (module === 'vocab') continue;
    // 每门语言每个模块单独一个上下文：检查的是这几个文件自己注册了什么
    const c = vm.createContext({ console });
    c.window = c;
    for (const f of files) {
      vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), c, { filename: f });
    }
    const reg = c.DIM_DATA || {};
    const data = reg[module] && reg[module][p.code];
    const size = Array.isArray(data) ? data.length : data && typeof data === 'object' ? Object.keys(data).length : 0;
    if (size) passed++;
    else fail(`${p.code}/${module}: ${files.join(', ')} 没有注册非空的 DIM_DATA.${module}.${p.code}`);
    for (const [m, byCode] of Object.entries(reg)) {
      for (const code of Object.keys(byCode)) {
        if (m === module && code === p.code) continue;
        fail(`${p.code}/${module}: 多注册了 DIM_DATA.${m}.${code}`);
      }
    }
    if (!Languages.hasModule(p.code, module)) fail(`Languages.hasModule('${p.code}', '${module}') 应为 true`);
  }
}

const dataFiles = fs.readdirSync(path.join(ROOT, 'data')).filter((f) => f.endsWith('.js')).map((f) => 'data/' + f)
  .concat(fs.readdirSync(path.join(ROOT, 'data/vocab')).filter((f) => f.endsWith('.js')).map((f) => 'data/vocab/' + f));
for (const f of dataFiles) {
  if (listed.has(f)) passed++;
  else fail(`${f} 不在任何 lib/languages.js profile 的 files 里（孤儿文件）`);
}
for (const f of listed) {
  if (!fs.existsSync(path.join(ROOT, f))) fail(`lib/languages.js 引用的 ${f} 不存在`);
}

const summary = `${passed} passed, ${failed} failed`;
if (failed) {
  console.error('Data modules FAILED: ' + summary);
  process.exit(1);
}
console.log('Data modules OK: ' + summary);
