#!/usr/bin/env node
/**
 * Validator for the Italian cognate dataset (data/cognates.js).
 *
 *   node scripts/validate_italian_extras.js
 *
 * The French side has had scripts/validate_french_extras.js since day one, so a
 * broken gloss there fails a script. The Italian side did not, which is exactly
 * why two hand-editing rounds could leave 60+ machine-translation leftovers and
 * silently break the difficulty contract without anything going red.
 *
 * What this re-checks, reading only the shipped .js file:
 *
 *   - the file loads in a bare Node vm and declares COGNATE_DATA,
 *   - every entry carries the required fields with the right types,
 *   - difficulty is exactly curve(similarityScore), and that curve still matches
 *     the thresholds the browse filter in cognate-app.js prints to the user,
 *   - the Chinese side is Han characters plus full-width punctuation only: no
 *     latin, no ASCII space, no private-use/mojibake code points, no repeated
 *     token, no placeholder,
 *   - the English side is latin only: no CJK, no doubled word, no stray
 *     punctuation left over from scraping,
 *   - faux-ami entries carry the whole field set (the app renders `warning`
 *     first and ignores `italianFor` without it, so half-populated rows are
 *     invisible bugs),
 *   - headwords are unique and patternType is a recognised label.
 *
 * Exits 0 when clean, 1 on the first non-empty error list.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const IT_COGNATE = path.join(ROOT, 'data', 'cognates.js');
const COGNATE_APP = path.join(ROOT, 'cognate-app.js');

const errors = [];
const notes = [];
let checks = 0;

function check(cond, msg) {
  checks += 1;
  if (!cond) errors.push(msg);
  return !!cond;
}

/** Load the dataset the way index.html does: plain script, no module system. */
function loadGlobal(file, globalName) {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  const src = fs.readFileSync(file, 'utf8');
  const probe = `\n;(typeof ${globalName} !== 'undefined' ? ${globalName} : undefined);`;
  return vm.runInContext(src + probe, sandbox, { filename: file });
}

// 中文侧允许的字符：汉字（含扩展 A）＋这几个全角标点。刻意不放行 ASCII 半角空格、
// 拉丁字母、半角括号和阿拉伯数字 —— 那些全是抓取/机翻残渣的指纹。
const ZH_ALLOWED = /^[一-鿿㐀-䶿（），、；：。？！“”‘’…—·]+$/;
const CJK = /[一-鿿㐀-䶿]/;
const LATIN = /[A-Za-z]/;
const PLACEHOLDER = /^(\?+|n\/?a|todo|tbd|-+|\(n\)|null|none|undefined|xxx+)$/i;
// U+E000-U+F8FF 私用区 + 常见 UTF-8 误解码序列
const MOJIBAKE = /[�-]|Ã[\x80-\xBF]|â€|Â[\xA0-\xBF]/;
// patternType：`-意语后缀/-英语后缀` 的对应，或假朋友标签
const PATTERN_OK = /^(假朋友 faux-ami|-[^/\s]+\/-?[^/\s]+)$/;

function badText(value) {
  if (typeof value !== 'string') return 'not a string';
  const t = value.trim();
  if (!t) return 'empty';
  if (t !== value) return 'has leading/trailing whitespace';
  if (PLACEHOLDER.test(t)) return 'placeholder';
  if (MOJIBAKE.test(t)) return 'mojibake';
  return null;
}

/**
 * 「僵尸僵尸」这类机翻叠词：2-6 字的片段紧挨着重复一次。
 * 下限刻意是 2 而不是 1 —— 单字叠词在中文里是正常构词（宝宝、谢谢、星星、大猩猩），
 * 一律报错只会逼着后来人把校验器关掉。
 */
function repeatedToken(zh) {
  const m = zh.match(/(.{2,6})\1/);
  return m ? m[1] : null;
}

// ===========================================================================
// 1. the file loads and declares the global the page relies on
// ===========================================================================
check(fs.existsSync(IT_COGNATE), `missing dataset ${IT_COGNATE}`);
const DATA = loadGlobal(IT_COGNATE, 'COGNATE_DATA');
check(DATA !== undefined, 'cognates.js: does not declare a top-level COGNATE_DATA');
check(Array.isArray(DATA) && DATA.length > 0, 'cognates.js: COGNATE_DATA must be a non-empty array');

// ===========================================================================
// 2. the difficulty curve must be the one the UI advertises
// ===========================================================================
// 浏览模式的下拉框把档位明文印给用户；数据里的 difficulty 是筛选依据，展示的
// 百分比是 similarityScore。两者一旦脱钩，用户按 Easy 筛出来的就是 66% 的词。
const EASY_MIN = 80;
const MEDIUM_MIN = 50;
const appSrc = fs.readFileSync(COGNATE_APP, 'utf8');
check(appSrc.includes(`Easy（≥${EASY_MIN}%）`),
  `cognate-app.js: browse filter no longer says "Easy（≥${EASY_MIN}%）" — the curve below is stale`);
check(appSrc.includes(`Medium（${MEDIUM_MIN}-${EASY_MIN - 1}%）`),
  `cognate-app.js: browse filter no longer says "Medium（${MEDIUM_MIN}-${EASY_MIN - 1}%）"`);
check(appSrc.includes(`Hard（&lt;${MEDIUM_MIN}%）`),
  `cognate-app.js: browse filter no longer says "Hard（<${MEDIUM_MIN}%）"`);

/** similarityScore === null 意味着「重算后不足 50 / 没有可信的形似对象」，归 hard。 */
function curve(score) {
  if (score === null) return 'hard';
  if (score >= EASY_MIN) return 'easy';
  if (score >= MEDIUM_MIN) return 'medium';
  return 'hard';
}

// ===========================================================================
// 3. per-entry rules
// ===========================================================================
const REQUIRED = ['italian', 'english', 'chinese', 'patternType', 'similarityScore', 'difficulty', 'rank'];
const FAUX_FIELDS = ['falseFriendOf', 'falseFriendChinese', 'italianFor', 'warning'];

const seenItalian = new Map();
const seenShape = new Map();
let classified = 0;
let nullScore = 0;
let sharedGloss = 0;
let identityRank = 0;
let maxRank = 0;
const byDifficulty = { easy: 0, medium: 0, hard: 0 };

DATA.forEach((row, i) => {
  const where = `cognates#${i} "${row && row.italian}"`;
  if (!check(row && typeof row === 'object' && !Array.isArray(row), `${where}: not an object`)) return;

  for (const k of REQUIRED) check(k in row, `${where}: missing required field "${k}"`);

  // --- headword ---------------------------------------------------------
  const bi = badText(row.italian);
  check(!bi, `${where}: italian is ${bi}`);
  check(!CJK.test(row.italian || ''), `${where}: italian contains Chinese`);
  check(LATIN.test(row.italian || ''), `${where}: italian has no letters`);
  const key = (row.italian || '').toLowerCase();
  check(!seenItalian.has(key), `${where}: duplicate headword (also at #${seenItalian.get(key)})`);
  seenItalian.set(key, i);

  // --- english side -----------------------------------------------------
  const be = badText(row.english);
  check(!be, `${where}: english is ${be}`);
  check(!CJK.test(row.english || ''), `${where}: english contains Chinese`);
  check(LATIN.test(row.english || ''), `${where}: english has no letters`);
  check(!/[，。；：、？！（）“”‘’]/.test(row.english || ''),
    `${where}: english carries full-width punctuation -> ${JSON.stringify(row.english)}`);
  check(!/^[^A-Za-z]|[.;,]\s*$|\s{2,}/.test(row.english || ''),
    `${where}: english carries scraping punctuation -> ${JSON.stringify(row.english)}`);
  {
    // "9月 (中文(简体) )." 那一批留下的整词重复："zombie zombie"
    const toks = (row.english || '').toLowerCase().split(/[^a-z']+/).filter(Boolean);
    let dup = null;
    for (let j = 1; j < toks.length; j += 1) if (toks[j] === toks[j - 1]) dup = toks[j];
    check(!dup, `${where}: english repeats the word "${dup}" -> ${JSON.stringify(row.english)}`);
  }

  // --- chinese side -----------------------------------------------------
  const bc = badText(row.chinese);
  check(!bc, `${where}: chinese is ${bc}`);
  check(CJK.test(row.chinese || ''), `${where}: chinese has no CJK`);
  check(!LATIN.test(row.chinese || ''),
    `${where}: chinese carries latin/POS artefacts -> ${JSON.stringify(row.chinese)}`);
  check(!/ /.test(row.chinese || ''),
    `${where}: chinese contains an ASCII space -> ${JSON.stringify(row.chinese)}`);
  check(ZH_ALLOWED.test(row.chinese || ''),
    `${where}: chinese has characters outside 汉字+全角标点 -> ${JSON.stringify(row.chinese)}`);
  check(!/[<>[\]《》]/.test(row.chinese || ''),
    `${where}: chinese carries dictionary markup -> ${JSON.stringify(row.chinese)}`);
  check((row.chinese || '').trim() !== (row.italian || '').trim(), `${where}: chinese is the headword`);
  {
    const dup = repeatedToken(row.chinese || '');
    check(!dup, `${where}: chinese repeats the token "${dup}" -> ${JSON.stringify(row.chinese)}`);
    const segs = (row.chinese || '').split(/[，；、]/).map((s) => s.trim()).filter(Boolean);
    check(new Set(segs).size === segs.length,
      `${where}: chinese lists the same sense twice -> ${JSON.stringify(row.chinese)}`);
  }

  // --- similarity + difficulty -----------------------------------------
  const score = row.similarityScore;
  check(score === null || (Number.isInteger(score) && score >= 0 && score <= 100),
    `${where}: similarityScore ${JSON.stringify(score)} must be null or an integer 0-100`);
  if (score === null) nullScore += 1;
  check(['easy', 'medium', 'hard'].includes(row.difficulty), `${where}: unknown difficulty "${row.difficulty}"`);
  check(row.difficulty === curve(score),
    `${where}: difficulty "${row.difficulty}" !== "${curve(score)}" for score ${JSON.stringify(score)}`);
  if (byDifficulty[row.difficulty] !== undefined) byDifficulty[row.difficulty] += 1;

  // --- patternType ------------------------------------------------------
  if (row.patternType === null) {
    // 意语数据里大多数条目没有后缀规律，null 是正常值（法语侧要 patternNote，这边不要）
  } else {
    classified += 1;
    check(typeof row.patternType === 'string' && PATTERN_OK.test(row.patternType),
      `${where}: patternType "${row.patternType}" is not a recognised correspondence label`);
  }

  // --- rank -------------------------------------------------------------
  check(Number.isInteger(row.rank) && row.rank > 0, `${where}: rank ${row.rank} is not a positive integer`);
  if (row.rank === i + 1) identityRank += 1;
  maxRank = Math.max(maxRank, row.rank);

  // --- faux amis --------------------------------------------------------
  if ('falseFriend' in row) {
    check(row.falseFriend === true, `${where}: falseFriend must be true when present`);
    check(row.patternType === '假朋友 faux-ami', `${where}: faux ami without the faux-ami patternType`);
    for (const k of FAUX_FIELDS) {
      const bf = badText(row[k]);
      check(!bf, `${where}: faux ami field "${k}" is ${bf || 'missing'}`);
    }
    check(CJK.test(row.falseFriendChinese || ''), `${where}: falseFriendChinese has no CJK`);
    check(!CJK.test(row.falseFriendOf || ''), `${where}: falseFriendOf must be the English word`);
    check(!CJK.test(row.italianFor || ''), `${where}: italianFor must be the Italian expression`);
    check(CJK.test(row.warning || ''), `${where}: faux ami without a Chinese warning`);
    // cognate-app.js falseFriendNote() 只读 warning（它的兜底分支认的是德语的
    // germanFor，意语的 italianFor 拿不到），所以 warning 必须自带全部信息
    check((row.warning || '').includes(row.falseFriendOf || ' '),
      `${where}: warning does not name the trap word "${row.falseFriendOf}"`);
    check((row.warning || '').includes(row.italianFor || ' '),
      `${where}: warning does not name the Italian equivalent "${row.italianFor}"`);
    check((row.falseFriendOf || '') !== (row.english || ''),
      `${where}: falseFriendOf equals the real gloss — that is not a false friend`);
  } else {
    for (const k of FAUX_FIELDS.concat(['falseFriend'])) {
      check(!(k in row), `${where}: carries "${k}" without falseFriend: true`);
    }
    check(row.patternType !== '假朋友 faux-ami', `${where}: faux-ami patternType without falseFriend: true`);
  }

  // 同一个 english+chinese 挂在两个词头上：意语里 usare/uso、magia/magico 这种
  // 同根派生共用一条释义是常态，不当错误报，只统计出来放在末尾当健康度指标。
  const shape = `${row.english}|${row.chinese}`;
  if (seenShape.has(shape)) sharedGloss += 1;
  else seenShape.set(shape, row.italian);
});

// ===========================================================================
// 4. dataset-level sanity
// ===========================================================================
check(identityRank < DATA.length * 0.05,
  `cognates: ${identityRank}/${DATA.length} ranks equal their array index — ranks look synthesised`);
check(maxRank > DATA.length,
  `cognates: max rank ${maxRank} <= entry count ${DATA.length} — ranks are not corpus ranks`);
check(nullScore < DATA.length * 0.05,
  `cognates: ${nullScore}/${DATA.length} entries have no similarity score — the dataset is losing its point`);

// 第一轮点名改成假朋友的词，别被后续的批量脚本改回去
for (const w of ['ape', 'libreria', 'agenda', 'educato', 'collegio', 'babbo', 'tale', 'peste', 'bob']) {
  const row = DATA.find((r) => r.italian === w);
  if (check(!!row, `cognates: required faux ami "${w}" is missing`)) {
    check(row.falseFriend === true, `cognates: "${w}" is not flagged as a faux ami`);
  }
}

const fauxCount = DATA.filter((r) => r.falseFriend).length;
notes.push(`cognates: ${DATA.length} entries, ${classified} with a classified patternType, ${fauxCount} faux amis`);
notes.push(`difficulty buckets: easy ${byDifficulty.easy}, medium ${byDifficulty.medium}, hard ${byDifficulty.hard} ` +
  `(${nullScore} of them scoreless)`);
notes.push(`rank scale: max ${maxRank} (corpus lemma rank), identity-rank rows ${identityRank}`);
notes.push(`gloss reuse: ${sharedGloss} entries share an english+chinese pair with an earlier entry ` +
  `(same-root derivations; not an error, watch the trend)`);

// ===========================================================================
console.log(`ran ${checks} assertions`);
for (const n of notes) console.log(`  ${n}`);
if (errors.length) {
  console.error(`\nFAIL: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 40)) console.error(`  - ${e}`);
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log('OK: italian cognate dataset passes every rule');
