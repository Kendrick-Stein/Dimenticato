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
 *   - headwords are unique and patternType is a recognised label,
 *   - no gloss carries a machine-translation tail (「家庭情况」「同事们」「鼻头」), a
 *     software/UN-only rendering (「端口」「特派团」「职等」), or a phonetic
 *     transliteration of the headword itself (「克鲁瓦塔」「奥卡」「马高」),
 *   - nothing the quiz would hand back as *the* correct answer is a word the app has no
 *     business teaching: banned headwords, slurs on the english side, and glosses that
 *     need an "offensive/slur" marker are all hard failures. This is the negro lesson —
 *     the quiz shows `english` and grades the headword, so fixing only the Chinese gloss
 *     left the app teaching a slur as the way to say "black".
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

// ---------------------------------------------------------------------------
// 第三轮加进来的三类残渣指纹。每一类都是「整份数据里扫出来、有几十条同类」的模式，
// 不是单条特例，所以写成断言而不是修一条算一条。
// ---------------------------------------------------------------------------

// (1) 机械残渣后缀：机翻把上下文里的搭配词粘在词条上（famiglia→「家庭情况」、
//     popolo→「人员」、collega→「同事们」）。判据是「义项以这些字收尾、且不止这些字」——
//     situazione→「情况」、attività→「活动」本身是对的，被粘在别的词后面才是错的。
const RESIDUE_TAILS = ['情况', '问题', '人员', '活动', '说明', '们'];

// (2) 软件 / 联合国本地化义：这些译法在各自的语料里没错，但作为学习者词典义永远是错的，
//     而且整份数据里没有任何一条正当用法（porto→「端口」、missione→「特派团」、
//     presidente→「庭长」、livello→「职等」）。带域的词只挑这种「词典里绝不会这么写」的，
//     像「系统」「状态」「安装」那种两边都成立的不进表，靠下面的回归表钉住。
const LOCALIZATION_ONLY = ['端口', '条目', '图标', '特派团', '职等', '庭长', '司长', '养恤金', '支助'];

// (3) 纯音译释义：english 侧存的是意大利语原词本身（抓取残渣），中文是照着那个原词音译的
//     （cravatta→「克鲁瓦塔」、oca→「奥卡」、mago→「马高」）。指纹是「english === italian
//     且中文整串都由音译常用字组成」。真正的外来词/人名当然也长这样，逐条列在下面。
const TRANSLITERATION_CHARS = new Set(
  ('阿埃艾奥澳巴拜邦保鲍贝本比彼波伯勃博布采查察昌达大戴丹当道德登迪蒂狄丁东杜多厄恩尔法凡菲费芬佛弗福伏噶盖甘冈戈哥格各根古瓜圭贵哈海罕汉豪合河赫黑亨侯呼胡华怀霍基吉几加贾杰捷金卡凯坎康考柯科克肯孔库夸奎昆拉莱兰朗劳勒雷黎里理利丽力莉连列林琳灵留龙隆卢鲁路伦罗洛马迈曼芒茅梅美门蒙孟弥米密缪莫墨姆穆拿纳内奈尼涅宁纽努诺欧帕潘庞培佩彭皮平珀普齐奇契恰乔切钦琼丘让日荣茹瑞若萨塞赛桑瑟森莎沙山珊尚舍圣施诗石史士舒斯司丝苏所索塔台泰坦汤唐特腾提蒂天铁廷托妥瓦万王威韦维魏温文沃乌吾西希锡夏仙香肖谢辛欣休胥叙宣薛雅亚扬耶叶伊依宜以易因音英尤于约越云泽扎詹哲珍震芝之志治中仲朱兹佐').split('')
);
// english === italian 且释义确实是音译 —— 这几条是真的外来词/人名，不是残渣。
const LOANWORD_TRANSLITERATIONS = new Set(
  ['alice', 'oscar', 'maya', 'vodka', 'ella', 'melissa', 'montgomery', 'celia', 'gene']
);

// (4) 「答案本身不该被教」：出题模式拿 english 当题面、拿词条当唯一正确答案，
//     所以释义里加一句警告救不了 —— 一个词只要在 english 侧占着一个常用词，
//     就等于被 App 推荐使用。negro 就是这么变成「教中文学习者用它表达『黑色』」的。
//     这类词只能删，中文侧一旦需要「蔑称/冒犯语/贬称」这种标注，就是删除信号。
const OFFENSIVE_MARKER = /蔑称|冒犯语|贬称|种族歧视/;
const SLUR_EN = /\b(negro|negroes|nigg\w*|coloured|colored\s+people|retard|retarded|midget|cripple|faggot|spastic|mongoloid)\b/i;
// 直接禁掉词头本身：删过的词别被下一个批量脚本从原始抓取里捡回来。
const BANNED_HEADWORDS = new Set(['negro']);

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

  // --- 第三轮的三类残渣指纹 ---------------------------------------------
  check(!BANNED_HEADWORDS.has(key),
    `${where}: headword is on the ban list — it was removed because the quiz modes would hand it ` +
    `to the learner as the one correct answer, and a warning in the gloss cannot undo that`);
  check(!OFFENSIVE_MARKER.test(row.chinese || ''),
    `${where}: chinese needs an "offensive/slur" marker -> ${JSON.stringify(row.chinese)}. ` +
    `A word that needs that marker must not be in a set the quiz asks the learner to produce; delete it`);
  check(!SLUR_EN.test(row.english || '') && !SLUR_EN.test(row.falseFriendOf || ''),
    `${where}: english side carries a slur -> ${JSON.stringify(row.english)}`);

  for (const seg of (row.chinese || '').split(/[，；、]/).map((s) => s.trim()).filter(Boolean)) {
    const tail = RESIDUE_TAILS.find((t) => seg.endsWith(t) && seg.length > t.length);
    check(!tail,
      `${where}: chinese sense "${seg}" ends in the machine-translation tail "${tail}" ` +
      `-> ${JSON.stringify(row.chinese)}`);
    check(!LOCALIZATION_ONLY.includes(seg),
      `${where}: chinese sense "${seg}" is a software/UN localisation rendering, not a dictionary gloss ` +
      `-> ${JSON.stringify(row.chinese)}`);
  }

  // 大写词头是专有名词（Chicago、Roberto、Alaska），音译就是它们正确的释义，跳过。
  const isProperNoun = /^[A-Z]/.test(row.italian || '');
  if (!isProperNoun && (row.english || '').toLowerCase() === key && !LOANWORD_TRANSLITERATIONS.has(key)) {
    const zh = (row.chinese || '').replace(/[（），、；：。？！“”‘’…—·]/g, '');
    const translit = zh.length >= 2 && zh.split('').every((c) => TRANSLITERATION_CHARS.has(c));
    check(!translit,
      `${where}: english is just the Italian headword and the gloss ${JSON.stringify(row.chinese)} ` +
      `is a phonetic transliteration of it — that is scraping residue, not a translation`);
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

// 第一 / 三轮点名改成假朋友的词，别被后续的批量脚本改回去
for (const w of ['ape', 'libreria', 'agenda', 'educato', 'collegio', 'babbo', 'tale', 'peste', 'bob',
  'deficiente', 'confidenza']) {
  const row = DATA.find((r) => r.italian === w);
  if (check(!!row, `cognates: required faux ami "${w}" is missing`)) {
    check(row.falseFriend === true, `cognates: "${w}" is not flagged as a faux ami`);
  }
}

// 上面三条通用规则抓不住的那些「就是译错了」的高频词：钉成回归表。
// 值是被改掉的旧释义，重新出现即为回归（重新抓一遍原始数据最容易把它们带回来）。
const REGRESSED_GLOSSES = {
  successo: '成绩', film: '胶片', segreto: '隐藏', appuntamento: '任命', occasione: '时间',
  segno: '签名', trappola: '设置', entrata: '条目', angelo: '安吉尔', sistemare: '系统',
  anatra: '动画', cesso: '必需', astronave: '天文学家', convivere: '聚集点', stalla: '稳定',
  presentimento: '当前', statale: '状态', modella: '模式', droga: '药物', giardino: '园艺',
  banda: '带', genio: '天赋', succedere: '成功', polizia: '警务', preside: '庭长',
};
for (const [w, stale] of Object.entries(REGRESSED_GLOSSES)) {
  const row = DATA.find((r) => r.italian === w);
  if (check(!!row, `cognates: "${w}" is missing`)) {
    check(row.chinese !== stale,
      `cognates: "${w}" is back to the mistranslation ${JSON.stringify(stale)}`);
  }
}

// polo/「极」那一类：english 侧压根不表示中文里写的那个义项，出题模式就会拿一个英语词
// 去问它并不表示的意思。整份数据没法机器判定，这里只钉住已经查过的这几对。
for (const [w, en] of Object.entries({ polo: 'pole', pero: 'pear tree', preside: 'principal' })) {
  const row = DATA.find((r) => r.italian === w);
  if (check(!!row, `cognates: "${w}" is missing`)) {
    check(row.english === en,
      `cognates: "${w}" english is ${JSON.stringify(row.english)}, expected ${JSON.stringify(en)} — ` +
      `the two sides were realigned by hand, see the header of data/cognates.js`);
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
