/**
 * Per-language rules for cognates/1, run by scripts/validate_modules.js after the
 * generic schema checks.  They replace the cognate halves of the old
 * validate_italian_extras.js / validate_german_extras.js / validate_french_extras.js;
 * every rule below was carried over from there, re-expressed on the cognates/1 fields
 * (word / en / zh / pattern / similarity 0…1 / difficulty 1-3 / falseFriend {…} / x).
 *
 * Each hook is hook(data, ctx): ctx = { check, note, badText, CJK, curve, load, root }.
 */
'use strict';

const LATIN = /[A-Za-z]/;

function strip(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function byWord(entries) {
  const m = new Map();
  for (const e of entries) m.set(e.word, e);
  return m;
}

function requireFalseFriends(data, ctx, words) {
  const index = byWord(data.entries);
  for (const w of words) {
    const e = index.get(w);
    if (ctx.check(!!e, `cognates/${data.meta.lang}: required false friend "${w}" is missing`)) {
      ctx.check(!!e.falseFriend, `cognates/${data.meta.lang}: "${w}" is not flagged as a false friend`);
    }
  }
}

// ===========================================================================
// it — data/cognates.js was scraped and then hand-revised three times (see its
// header); these are the invariants those rounds established.
// ===========================================================================

// 中文侧允许的字符：汉字（含扩展 A）＋这几个全角标点。刻意不放行 ASCII 半角空格、
// 拉丁字母、半角括号和阿拉伯数字 —— 那些全是抓取/机翻残渣的指纹。
const ZH_ALLOWED = /^[一-鿿㐀-䶿（），、；：。？！“”‘’…—·]+$/;
// pattern key：`-意语后缀/-英语后缀` 的对应，或假朋友
const IT_PATTERN_OK = /^(false-friend|-[^/\s]+\/-?[^/\s]+)$/;

// (1) 机械残渣后缀：机翻把上下文里的搭配词粘在词条上（famiglia→「家庭情况」、
//     popolo→「人员」、collega→「同事们」）。判据是「义项以这些字收尾、且不止这些字」。
const RESIDUE_TAILS = ['情况', '问题', '人员', '活动', '说明', '们'];
// (2) 软件 / 联合国本地化义（porto→「端口」、missione→「特派团」、presidente→「庭长」）。
const LOCALIZATION_ONLY = ['端口', '条目', '图标', '特派团', '职等', '庭长', '司长', '养恤金', '支助'];
// (3) 纯音译释义：en 侧存的是意大利语原词本身，中文是照着那个原词音译的。
const TRANSLITERATION_CHARS = new Set(
  ('阿埃艾奥澳巴拜邦保鲍贝本比彼波伯勃博布采查察昌达大戴丹当道德登迪蒂狄丁东杜多厄恩尔法凡菲费芬佛弗福伏噶盖甘冈戈哥格各根古瓜圭贵哈海罕汉豪合河赫黑亨侯呼胡华怀霍基吉几加贾杰捷金卡凯坎康考柯科克肯孔库夸奎昆拉莱兰朗劳勒雷黎里理利丽力莉连列林琳灵留龙隆卢鲁路伦罗洛马迈曼芒茅梅美门蒙孟弥米密缪莫墨姆穆拿纳内奈尼涅宁纽努诺欧帕潘庞培佩彭皮平珀普齐奇契恰乔切钦琼丘让日荣茹瑞若萨塞赛桑瑟森莎沙山珊尚舍圣施诗石史士舒斯司丝苏所索塔台泰坦汤唐特腾提蒂天铁廷托妥瓦万王威韦维魏温文沃乌吾西希锡夏仙香肖谢辛欣休胥叙宣薛雅亚扬耶叶伊依宜以易因音英尤于约越云泽扎詹哲珍震芝之志治中仲朱兹佐').split('')
);
const LOANWORD_TRANSLITERATIONS = new Set(
  ['alice', 'oscar', 'maya', 'vodka', 'ella', 'melissa', 'montgomery', 'celia', 'gene']
);
// (4) 「答案本身不该被教」：出题模式拿 en 当题面、拿词条当唯一正确答案，释义里加一句
//     警告救不了。中文侧一旦需要「蔑称/冒犯语」这种标注，就是删除信号（negro 的教训）。
const OFFENSIVE_MARKER = /蔑称|冒犯语|贬称|种族歧视/;
const SLUR_EN = /\b(negro|negroes|nigg\w*|coloured|colored\s+people|retard|retarded|midget|cripple|faggot|spastic|mongoloid)\b/i;
const BANNED_HEADWORDS = new Set(['negro']);

// 被改掉的旧释义，重新出现即为回归（重新抓一遍原始数据最容易把它们带回来）。
const IT_REGRESSED_GLOSSES = {
  successo: '成绩', film: '胶片', segreto: '隐藏', appuntamento: '任命', occasione: '时间',
  segno: '签名', trappola: '设置', entrata: '条目', angelo: '安吉尔', sistemare: '系统',
  anatra: '动画', cesso: '必需', astronave: '天文学家', convivere: '聚集点', stalla: '稳定',
  presentimento: '当前', statale: '状态', modella: '模式', droga: '药物', giardino: '园艺',
  banda: '带', genio: '天赋', succedere: '成功', polizia: '警务', preside: '庭长',
};
// polo/「极」那一类：两侧已经人工对齐过，钉住。
const IT_EN_PINS = { polo: 'pole', pero: 'pear tree', preside: 'principal' };
const IT_REQUIRED_FALSE_FRIENDS = ['ape', 'libreria', 'agenda', 'educato', 'collegio', 'babbo', 'tale',
  'peste', 'bob', 'deficiente', 'confidenza'];

/** 「僵尸僵尸」这类机翻叠词：2-6 字的片段紧挨着重复一次（单字叠词是正常构词）。 */
function repeatedToken(zh) {
  const m = zh.match(/(.{2,6})\1/);
  return m ? m[1] : null;
}

function it(data, ctx) {
  const { check, badText, CJK } = ctx;
  const seen = new Map();
  let sharedGloss = 0;
  const shapes = new Set();
  data.entries.forEach((e, i) => {
    const where = `cognates/it#${i} "${e.word}"`;
    const key = (e.word || '').toLowerCase();
    check(LATIN.test(e.word || ''), `${where}: word has no letters`);
    check(!seen.has(key), `${where}: duplicate headword ignoring case (also at #${seen.get(key)})`);
    seen.set(key, i);

    // en
    check(LATIN.test(e.en || ''), `${where}: en has no letters`);
    check(!/[，。；：、？！（）“”‘’]/.test(e.en || ''), `${where}: en carries full-width punctuation -> ${JSON.stringify(e.en)}`);
    check(!/^[^A-Za-z]|[.;,]\s*$|\s{2,}/.test(e.en || ''), `${where}: en carries scraping punctuation -> ${JSON.stringify(e.en)}`);
    const toks = (e.en || '').toLowerCase().split(/[^a-z']+/).filter(Boolean);
    let dup = null;
    for (let j = 1; j < toks.length; j += 1) if (toks[j] === toks[j - 1]) dup = toks[j];
    check(!dup, `${where}: en repeats the word "${dup}" -> ${JSON.stringify(e.en)}`);

    // zh
    const zh = e.zh || '';
    check(!LATIN.test(zh), `${where}: zh carries latin/POS artefacts -> ${JSON.stringify(zh)}`);
    check(!/ /.test(zh), `${where}: zh contains an ASCII space -> ${JSON.stringify(zh)}`);
    check(ZH_ALLOWED.test(zh), `${where}: zh has characters outside 汉字+全角标点 -> ${JSON.stringify(zh)}`);
    const rep = repeatedToken(zh);
    check(!rep, `${where}: zh repeats the token "${rep}" -> ${JSON.stringify(zh)}`);
    const segs = zh.split(/[，；、]/).map((s) => s.trim()).filter(Boolean);
    check(new Set(segs).size === segs.length, `${where}: zh lists the same sense twice -> ${JSON.stringify(zh)}`);
    for (const seg of segs) {
      const tail = RESIDUE_TAILS.find((t) => seg.endsWith(t) && seg.length > t.length);
      check(!tail, `${where}: zh sense "${seg}" ends in the machine-translation tail "${tail}"`);
      check(!LOCALIZATION_ONLY.includes(seg), `${where}: zh sense "${seg}" is a software/UN localisation rendering`);
    }

    // 不该被教的答案
    check(!BANNED_HEADWORDS.has(key), `${where}: headword is on the ban list (the quiz would hand it out as the answer)`);
    check(!OFFENSIVE_MARKER.test(zh), `${where}: zh needs an "offensive/slur" marker — delete the entry instead`);
    check(!SLUR_EN.test(e.en || '') && !SLUR_EN.test((e.falseFriend || {}).lookalike || ''),
      `${where}: en side carries a slur -> ${JSON.stringify(e.en)}`);

    // 纯音译（大写词头是专有名词，音译就是正确释义）
    if (!/^[A-Z]/.test(e.word || '') && (e.en || '').toLowerCase() === key && !LOANWORD_TRANSLITERATIONS.has(key)) {
      const bare = zh.replace(/[（），、；：。？！“”‘’…—·]/g, '');
      const translit = bare.length >= 2 && bare.split('').every((c) => TRANSLITERATION_CHARS.has(c));
      check(!translit, `${where}: en is the Italian headword and zh ${JSON.stringify(zh)} transliterates it`);
    }

    if ('pattern' in e) check(IT_PATTERN_OK.test(e.pattern), `${where}: pattern "${e.pattern}" is not a suffix correspondence`);

    // 意语的假朋友三件套都要有：app 拼成「≠ lookalike（zh）= word」
    if (e.falseFriend) {
      check(!badText(e.falseFriend.zh) && CJK.test(e.falseFriend.zh || ''), `${where}: falseFriend.zh missing`);
      check(!badText(e.falseFriend.word), `${where}: falseFriend.word (the Italian for the trap word) missing`);
    }

    const shape = `${e.en}|${e.zh}`;
    if (shapes.has(shape)) sharedGloss += 1;
    else shapes.add(shape);
  });

  requireFalseFriends(data, ctx, IT_REQUIRED_FALSE_FRIENDS);
  const index = byWord(data.entries);
  for (const [w, stale] of Object.entries(IT_REGRESSED_GLOSSES)) {
    const e = index.get(w);
    if (check(!!e, `cognates/it: "${w}" is missing`)) {
      check(e.zh !== stale, `cognates/it: "${w}" is back to the mistranslation ${JSON.stringify(stale)}`);
    }
  }
  for (const [w, en] of Object.entries(IT_EN_PINS)) {
    const e = index.get(w);
    if (check(!!e, `cognates/it: "${w}" is missing`)) {
      check(e.en === en, `cognates/it: "${w}" en is ${JSON.stringify(e.en)}, expected ${JSON.stringify(en)}`);
    }
  }
  ctx.note(`cognates/it: ${sharedGloss} entries share an en+zh pair with an earlier entry (same-root derivations; watch the trend)`);
}

// ===========================================================================
// de — scripts/build_german_extras.py
// ===========================================================================

// 规律组不能太小：界面上每个规律单独出一张卡片，两三个词撑不起「存在某某对应」
// 这句话。数值跟 build_german_extras.py 的 MIN_PATTERN_GROUP 对齐。
const DE_MIN_PATTERN_GROUP = 5;
const DE_ARTICLE = { m: 'der', f: 'die', n: 'das' };

function degenerate(text) {
  const t = String(text || '').trim();
  if (/([A-Za-zÄÖÜäöüß一-鿿])\1{4,}/.test(t)) return true;
  const words = t.split(/\s+/);
  return words.length >= 4 && new Set(words.map((w) => w.toLowerCase())).size === 1;
}

function de(data, ctx) {
  const { check, badText, CJK } = ctx;
  const ranks = new Set();
  let typed = 0;
  let falseFriends = 0;
  const groups = new Map();
  data.entries.forEach((e, i) => {
    const where = `cognates/de#${i} "${e.word}"`;
    check(!degenerate(e.word) && !degenerate(e.en) && !degenerate(e.zh), `${where}: degenerate repetition`);
    check('pos' in e, `${where}: missing part of speech`);
    if (e.pos === 'noun') {
      check(['m', 'f', 'n'].includes(e.gender), `${where}: noun without gender`);
      check((e.display || '') === DE_ARTICLE[e.gender] + ' ' + e.word, `${where}: noun display lacks its article`);
    }
    check('src' in e, `${where}: missing source`);
    check(typeof e.similarity === 'number', `${where}: similarity missing`);
    check((e.en || '').toLowerCase() !== (e.word || '').toLowerCase() || e.pattern === 'identical' || !!e.falseFriend,
      `${where}: headword is its own gloss`);
    ranks.add(e.rank);
    if (e.pattern) typed += 1;
    if (e.pattern && e.pattern !== 'identical' && e.pattern !== 'false-friend') {
      groups.set(e.pattern, (groups.get(e.pattern) || 0) + 1);
    }
    if (e.falseFriend) {
      falseFriends += 1;
      check(!badText(e.falseFriend.zh) && CJK.test(e.falseFriend.zh || ''), `${where}: falseFriend.zh missing`);
      check(!badText(e.falseFriend.word), `${where}: falseFriend.word (the German for the trap word) missing`);
    }
  });
  const n = data.entries.length;
  check(ranks.size > n * 0.8, 'cognates/de: ranks are not distinct enough to be real');
  check(falseFriends >= 50, `cognates/de: expected at least 50 falsche Freunde, found ${falseFriends}`);
  check(typed / n >= 0.7, `cognates/de: pattern coverage ${(typed / n * 100).toFixed(1)}% is below the 70% bar`);
  const thin = [...groups].filter(([, c]) => c < DE_MIN_PATTERN_GROUP).map(([p, c]) => `${p}=${c}`);
  check(!thin.length, `cognates/de: pattern groups below MIN_PATTERN_GROUP=${DE_MIN_PATTERN_GROUP}: ${thin.sort().join(', ')}`);
  check(groups.size > 0, 'cognates/de: no rule-based pattern groups at all');
}

// ===========================================================================
// fr — scripts/build_french_extras.py
// ===========================================================================

// ECDICT 把限定说明写在括号里，括号里照样有逗号（"(光,热等的)发射"）。按逗号硬切
// 会切出 "(光"、"容器(箱" 这种残句 —— 全是中日韩字符，只有括号配对查得出来。
const BRACKET_OPEN = { '(': ')', '（': '）', '[': ']', '【': '】', '《': '》', '〈': '〉', '〔': '〕', '{': '}' };
const BRACKET_CLOSE = new Set(Object.values(BRACKET_OPEN));
function bracketsBalanced(value) {
  const stack = [];
  for (const ch of String(value || '')) {
    if (BRACKET_OPEN[ch]) stack.push(BRACKET_OPEN[ch]);
    else if (BRACKET_CLOSE.has(ch) && stack.pop() !== ch) return false;
  }
  return stack.length === 0;
}
const FR_REQUIRED_FALSE_FRIENDS = ['actuellement', 'assister', 'librairie', 'sensible', 'journée'];
const FR_PATTERN_OK = /^(identical|false-friend|.*\/.*)$/;
const SEMANTIC_GATE = new Set(['pass', 'fail', 'unknown']);

function fr(data, ctx) {
  const { check, badText, CJK } = ctx;
  const zhSources = (data.meta.x || {}).zhSources || [];
  const seen = new Map();
  const shapes = new Map();
  let classified = 0;
  data.entries.forEach((e, i) => {
    const where = `cognates/fr#${i} "${e.word}"`;
    const zh = e.zh || '';
    check(!LATIN.test(zh), `${where}: zh carries latin/POS artefacts -> ${JSON.stringify(zh)}`);
    check(!/[<>[\]《》]/.test(zh), `${where}: zh carries dictionary markup -> ${JSON.stringify(zh)}`);
    check(bracketsBalanced(zh), `${where}: zh is a bracket-truncated fragment -> ${JSON.stringify(zh)}`);
    check(strip(zh) !== strip(e.word), `${where}: zh is the headword`);

    check('pos' in e, `${where}: missing part of speech`);
    if (e.pos === 'noun') check(e.gender === 'm' || e.gender === 'f', `${where}: noun without gender`);
    check('src' in e, `${where}: missing source`);
    check(typeof e.similarity === 'number', `${where}: similarity missing`);

    if (e.pattern) {
      classified += 1;
      check(FR_PATTERN_OK.test(e.pattern), `${where}: pattern "${e.pattern}" is not a recognised correspondence`);
    }
    if (strip(e.word) === strip(e.en)) {
      check(e.pattern === 'identical' || !!e.falseFriend, `${where}: identical spelling but pattern "${e.pattern}"`);
    }

    if (e.falseFriend) {
      // 法语的假朋友提示是手写成句的 note（≠ trap（义）= 法语说法）
      const ffNote = e.falseFriend.note || '';
      check(!badText(ffNote) && CJK.test(ffNote), `${where}: false friend without a Chinese note`);
      check(bracketsBalanced(ffNote), `${where}: falseFriend.note is a bracket-truncated fragment`);
    }

    const x = e.x || {};
    if ('italian' in x) {
      check(!badText(x.italian), `${where}: empty italian bridge`);
      check(Number.isInteger(x.italianSimilarity), `${where}: x.italianSimilarity must be an integer`);
    }
    if ('semanticGate' in x) check(SEMANTIC_GATE.has(x.semanticGate), `${where}: x.semanticGate "${x.semanticGate}"`);
    if ('zhSrc' in x) {
      check(Number.isInteger(x.zhSrc) && x.zhSrc >= 0 && x.zhSrc < zhSources.length,
        `${where}: x.zhSrc is not an index into meta.x.zhSources`);
    }

    // "passe" 和 "passé" 是两个词；"suicide"/"suicidé" 同一释义就是同一张卡出现两次
    const key = (e.word || '').toLowerCase();
    check(!seen.has(key), `${where}: duplicate headword ignoring case (also at #${seen.get(key)})`);
    seen.set(key, i);
    const shape = `${strip(e.word)}|${e.en}|${e.zh}`;
    check(!shapes.has(shape) || !!e.falseFriend, `${where}: accent variant of "${shapes.get(shape)}" with an identical gloss`);
    if (!shapes.has(shape)) shapes.set(shape, e.word);
  });
  check(classified > data.entries.length * 0.3,
    `cognates/fr: only ${classified}/${data.entries.length} entries carry a pattern`);
  requireFalseFriends(data, ctx, FR_REQUIRED_FALSE_FRIENDS);
  ctx.note(`cognates/fr: ${data.entries.filter((e) => e.x && e.x.italian).length} entries with an Italian bridge`);
}

module.exports = { it, de, fr };
