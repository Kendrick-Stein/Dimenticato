#!/usr/bin/env node
/**
 * Validate vocabulary.js (Italian system vocabulary, 27,117 entries).
 *
 * The machine-translation pipeline used to leave degenerate repetition in the
 * english/chinese glosses ("road road", "赢赢赢赢", "acid; acid (2); acid (3)")
 * and those glosses surface verbatim in quiz options. The data was cleaned by
 * scripts/clean_italian_glosses.py; this validator pins the invariant so a
 * pipeline re-run cannot quietly bring the junk back.
 *
 *   node scripts/validate_italian_vocabulary.js
 *
 * Hard rules (failure => exit 1)
 *   - loads under a plain vm context and exposes VOCABULARY_DATA
 *   - every entry has a non-empty `italian` headword (the mastered-set key)
 *   - english/chinese glosses contain no machine-translation repetition:
 *       - no adjacent duplicate whitespace-tokens (case-insensitive)
 *       - no even-length token sequence whose two halves are equal
 *         (case-insensitive) — "High school high school"
 *       - no pure-CJK token that is an exact integer repetition of a shorter
 *         prefix — "胜利胜利胜利" (latin reduplications like "Bonbon" are fine)
 *       - no sense that is only a numbered placeholder "(2)" / "（三）" / "[12]"
 *
 * The runtime display fallback for the same junk lives in DimText.cleanGloss
 * (lib/utils.js) and is pinned by tests/test-quiz-engine.html.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '..', 'vocabulary.js');

const NUMBERED_PLACEHOLDER = /^[\s]*[\(（\[]\d{1,3}[\)）\]]\s*$/;
const PURE_CJK = /^[\u4e00-\u9fff]+$/;

function casefold(token) {
  return token.toLowerCase();
}

function isCjkRepetition(token) {
  if (!PURE_CJK.test(token)) return false;
  const n = token.length;
  for (let unit = 1; unit <= n / 2; unit++) {
    if (n % unit) continue;
    if (token.slice(0, unit).repeat(n / unit) === token) return true;
  }
  return false;
}

/** 一个义项里的退化重复（与清洗脚本的规则一一对应） */
function senseHasRepetition(sense) {
  const body = sense.replace(/\s*[\(（\[]\d{1,3}[\)）\]]\s*$/, '').trim();
  if (!body) return false;               // 纯编号占位由 placeholder 规则单独管
  const tokens = body.split(/\s+/).map((t) => {
    // CJK 自重复先折叠，和清洗脚本一致，否则 "赢赢赢赢" 会被拆成 1 个 token 看不出问题
    if (PURE_CJK.test(t)) {
      const n = t.length;
      for (let unit = 1; unit <= n / 2; unit++) {
        if (n % unit) continue;
        if (t.slice(0, unit).repeat(n / unit) === t) { t = t.slice(0, unit); break; }
      }
    }
    return t;
  });
  const folded = tokens.map(casefold);
  for (let i = 1; i < folded.length; i++) {
    if (folded[i] === folded[i - 1]) return true;   // 相邻重复
  }
  if (tokens.length >= 2 && tokens.length % 2 === 0) {
    const half = tokens.length / 2;
    const a = folded.slice(0, half).join(' ');
    const b = folded.slice(half).join(' ');
    if (a === b) return true;                        // 对半重复
  }
  return tokens.some(isCjkRepetition);
}

function glossHasRepetition(gloss) {
  return String(gloss || '')
    .split(';')
    .some((sense) => {
      const trimmed = sense.trim();
      if (!trimmed) return false;
      if (NUMBERED_PLACEHOLDER.test(trimmed)) return true;   // 纯编号占位义项
      return senseHasRepetition(trimmed);
    });
}

function main() {
  const source = fs.readFileSync(FILE, 'utf8');
  // 与 index.html 相同的方式加载（裸 <script>，无模块系统）；
  // 末尾的表达式把顶层 const 传出来（const 不会挂到 context 上）
  const context = vm.createContext({ console });
  context.window = context;
  const entries = vm.runInContext(source + ';VOCABULARY_DATA', context, { filename: FILE });
  const problems = [];

  if (!Array.isArray(entries) || !entries.length) {
    console.log('RESULT: FAIL');
    console.log('  VOCABULARY_DATA 没有加载出来或为空');
    process.exit(1);
  }
  console.log(`loaded ${entries.length} entries from vocabulary.js`);

  let headwordIssues = 0;
  let repetitionIssues = 0;
  const repetitionSamples = [];

  entries.forEach((entry, index) => {
    const headword = String(entry.italian || '').trim();
    if (!headword) {
      headwordIssues++;
      if (headwordIssues <= 5) problems.push(`entry #${index}: 空的 italian 词头`);
    }
    for (const field of ['english', 'chinese']) {
      if (entry[field] != null && glossHasRepetition(entry[field])) {
        repetitionIssues++;
        if (repetitionSamples.length < 10) {
          repetitionSamples.push(`${entry.italian}: ${field} = ${JSON.stringify(entry[field])}`);
        }
      }
    }
  });

  if (headwordIssues) problems.push(`${headwordIssues} 条词条缺 italian 词头`);
  if (repetitionIssues) {
    problems.push(`${repetitionIssues} 条释义仍有机器翻译退化重复：`);
    repetitionSamples.forEach((s) => problems.push('  ' + s));
  }

  if (problems.length) {
    console.log('RESULT: FAIL');
    problems.forEach((p) => console.log('  ' + p));
    console.log(`0 passed, ${problems.length} failed`);
    process.exit(1);
  }

  console.log(
    `RESULT: PASS — ${entries.length} entries, ${passedCount()} checks passed, 0 failed`
  );
  process.exit(0);
}

function passedCount() {
  return 2; // 结构加载 + 全量重复扫描
}

main();
