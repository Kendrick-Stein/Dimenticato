#!/usr/bin/env node
/**
 * Validates every data/vocab/<lang>.js against schema v1 (docs/vocab-schema.md).
 * One validator for all languages: a new language only needs a GOLD row.
 * Language-specific rules live in per-language hooks (LANGS[lang].check) —
 * they replace the old validate_{italian,german,french}_vocabulary.js:
 *   it  MT-repetition scan of en/zh, tagger gold rows, ranked-noun gender ≥ 90%
 *   de  article in display for gendered nouns, no inflected headwords,
 *       budgeted holes (missing en, en echoing the headword)
 *   fr  headword shape, unique headword and unique glossKey(zh) across fr.js
 * Shared floors (LANGS): pos coverage, en coverage (non-English), gender on
 * nouns (gendered languages); see docs/vocab-schema.md "Coverage floors".
 *

 *   node scripts/validate_vocab.js          # all languages
 *   node scripts/validate_vocab.js fr de    # a subset
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const VOCAB_DIR = path.join(ROOT, 'data', 'vocab');

const FIELDS = ['word', 'display', 'pos', 'posAll', 'gender', 'level', 'levelSource',
  'rank', 'freq', 'zh', 'zhAlt', 'en', 'forms', 'tags', 'src', 'legacyId', 'legacyWord'];
const POS = new Set(['noun', 'properNoun', 'verb', 'adjective', 'adverb', 'pronoun',
  'determiner', 'article', 'preposition', 'conjunction', 'numeral', 'interjection',
  'particle', 'prefix', 'suffix', 'phrase', 'abbreviation']);
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_SOURCES = new Set(['official', 'textbook', 'course', 'freq-band']);
const FORM_KEYS = new Set(['plural', 'feminine', 'principalParts', 'construction',
  'government', 'pluraleTantum', 'pronominal', 'variants']);
const GENDER_RE = /^[mfn](\/[mfn]){0,2}$/;
/** One spelling per combination: letters in the order m, f, n ("m/f", "f/n",
 *  "m/f/n"); vocab_schema.join_genders writes it, display keeps the primary. */
const canonicalGender = (g) => ['m', 'f', 'n'].filter((x) => g.split('/').includes(x)).join('/');
const BANDS = [[600, 'A1'], [1500, 'A2'], [3000, 'B1'], [6000, 'B2'], [12000, 'C1']];

// ---- shared gloss-quality helpers (used by the per-language hooks below) ----
const CJK = /[㐀-䶿一-鿿豈-﫿]/;
const PURE_CJK = /^[一-鿿]+$/;
const PLACEHOLDER = /^(\?+|-+|_+|n\/?a|todo|tbd|xxx+|null|none|undefined|\(n\)|\(v\)|\(adj\)|\.+|,+)$/i;
const MOJIBAKE = /�|[ÃÂ][\u0080-¿]|â€|Å¸|ï¿½/;
const NUMBERED_PLACEHOLDER = /^\s*[(（[]\d{1,3}[)）\]]\s*$/;

/** "赢赢赢赢" -> "赢"; anything else unchanged. */
function foldCjkRepeat(token) {
  if (!PURE_CJK.test(token)) return token;
  const n = token.length;
  for (let unit = 1; unit <= n / 2; unit += 1) {
    if (!(n % unit) && token.slice(0, unit).repeat(n / unit) === token) return token.slice(0, unit);
  }
  return token;
}

/** Machine-translation junk the Italian pipeline used to leave behind and
 *  scripts/clean_italian_glosses.py removes: adjacent duplicate tokens,
 *  "high school high school" halves, "胜利胜利胜利", and bare "(2)" senses. */
function glossHasRepetition(gloss) {
  return String(gloss || '').split(';').some((raw) => {
    const sense = raw.trim();
    if (!sense) return false;
    if (NUMBERED_PLACEHOLDER.test(sense)) return true;
    const body = sense.replace(/\s*[(（[]\d{1,3}[)）\]]\s*$/, '').trim();
    if (!body) return false;
    const raw_ = body.split(/\s+/);
    const tokens = raw_.map(foldCjkRepeat);
    const folded = tokens.map((t) => t.toLowerCase());
    for (let i = 1; i < folded.length; i += 1) if (folded[i] === folded[i - 1]) return true;
    if (tokens.length >= 2 && tokens.length % 2 === 0) {
      const half = tokens.length / 2;
      if (folded.slice(0, half).join(' ') === folded.slice(half).join(' ')) return true;
    }
    // Reduplication is ordinary Chinese ("妈妈", "谢谢"); three or more copies
    // of a unit ("赢赢赢赢", "胜利胜利胜利") is the MT stutter.
    return raw_.some((t, i) => t !== tokens[i] && t.length / tokens[i].length >= 3);
  });
}

/** Four-fold repetition of a 1-3 char chunk, or 4+ identical comma senses. */
function degenerate(s) {
  const parts = s.split(/[,;，；]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 4 && new Set(parts).size === 1) return true;
  for (let n = 1; n <= 3; n += 1) {
    for (let i = 0; i + n * 4 <= s.length; i += 1) {
      const chunk = s.slice(i, i + n);
      if (chunk.trim() && s.slice(i, i + n * 4) === chunk.repeat(4)) return true;
    }
  }
  return false;
}

/** zh must be a real Chinese gloss; strings must not be mojibake.  Returns
 *  true when zh carries no CJK at all (budgeted per language, see LANGS). */
function checkGlossBasics(e, where, err) {
  let noCjk = false;
  if (PLACEHOLDER.test(e.zh.trim())) err(`${where}: placeholder zh`);
  else if (!CJK.test(e.zh)) noCjk = true;
  if (e.en && e.en === e.zh && !noCjk) err(`${where}: en identical to zh`);
  // 机翻编号残留「(二)」「(三) 国家」：见 scripts/clean_italian_glosses.py NUMBERED_RESIDUE
  if (e.zh.split(/[;；]\s*/).some((s) => /^\s*[(（][一二三四五六七八九十]{1,2}[)）](?:\s|$)/.test(s))) {
    err(`${where}: numbered-sense residue in zh ${JSON.stringify(e.zh.slice(0, 40))}`);
  }
  [e.word, e.display, e.zh, e.en, ...(e.zhAlt || [])].forEach((v) => {
    if (typeof v === 'string' && MOJIBAKE.test(v)) err(`${where}: mojibake ${JSON.stringify(v.slice(0, 40))}`);
  });
  return noCjk;
}

// ---- Italian (folded in from validate_italian_vocabulary.js) -----------------
// POS gold rows pin the tagger (scripts/build_italian_vocabulary_tags.py)
// against the old dictionary-field mistags.
const IT_GOLD = [
  ['casa', 'noun', 'f'], ['essere', 'verb'], ['bello', 'adjective'],
  ['e', 'conjunction'], ['di', 'preposition'], ['la', 'article'], ['una', 'article'],
  ['io', 'pronoun'], ['mi', 'pronoun'], ['sei', 'numeral'], ['era', 'verb'],
  ['fare', 'verb'], ['credo', 'verb'], ['dire', 'verb'],
  ['sempre', 'adverb'], ['vero', 'adjective'], ['felice', 'adjective'],
  ['problema', 'noun', 'm'], ['mano', 'noun', 'f'],
  ['tempo', 'noun', 'm'], ['vita', 'noun', 'f'], ['cantante', 'noun', 'm/f']
];

function checkItalian(entries, meta, err) {
  let rankedNouns = 0;
  let rankedNounsWithGender = 0;
  entries.forEach((e, i) => {
    const where = `it[${i}] ${JSON.stringify(e.word)}`;
    ['en', 'zh'].forEach((f) => {
      if (e[f] && glossHasRepetition(e[f])) err(`${where}: ${f} has MT repetition ${JSON.stringify(e[f])}`);
    });
    if (e.gender && !['m', 'f', 'm/f'].includes(e.gender)) err(`${where}: Italian gender ${e.gender}`);
    if (e.levelSource !== 'freq-band') err(`${where}: Italian levels are frequency bands, got ${e.levelSource}`);
    if (e.pos === 'noun' && e.freq) {
      rankedNouns += 1;
      if (e.gender) rankedNounsWithGender += 1;
    }
  });
  if (rankedNouns && rankedNounsWithGender / rankedNouns < 0.9) {
    err(`ranked-noun gender coverage ${((100 * rankedNounsWithGender) / rankedNouns).toFixed(1)}% < 90%`);
  }
}

// ---- German (folded in from validate_german_vocabulary.js) -------------------
const DE_ARTICLE = { m: 'der', f: 'die', n: 'das' };
const DE_HEADWORD = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\-' ]*$/;
/** Inflected function words that must never be a headword (progress is keyed
 *  on `word`, so "den" next to "der" would be a second card). */
const DE_INFLECTED = new Set(`
den dem des die das der ein eine einen einem eines einer
kein keine keinen keinem keines keiner
diese dieser dieses diesen diesem jene jener jenes jenen jenem
welche welcher welches welchen welchem
meine meiner meines meinen meinem deine deiner deines deinen deinem
seine seiner seines seinen seinem ihre ihrer ihres ihren ihrem
unsere unserer unseres unseren unserem eure eurer eures euren eurem
mich dich ihm ihn ihnen mir dir wem wen wessen
bin bist ist sind seid war warst waren wart gewesen
habe hast hat habt hatte hattest hatten hattet gehabt
werde wirst wird werdet wurde wurden wurdest geworden
kann kannst könnt konnte konnten muss musst müsst musste mussten
will willst wollt wollte wollten soll sollst sollt sollte sollten
darf darfst dürft durfte durften mag magst mögt mochte mochten
gehe gehst geht ging gingen gegangen machte machten gemacht
`.trim().split(/\s+/));
/** welcher — GERMAN_COURSE_DATA unit C1-01 lists it verbatim, so it stays
 *  until the course lists "welch" instead. Nothing else is forgiven. */
const DE_INFLECTED_ALLOWED = new Set(['welcher']);
/** Known, budgeted holes: no in-repo source can supply these, and growing one
 *  is a deliberate act (come here and say why). */
const DE_BUDGET = { noEnglish: 55, enEchoShare: 0.05 };

function checkGerman(entries, meta, err) {
  let noEnglish = 0;
  let enEcho = 0;
  entries.forEach((e, i) => {
    const where = `de[${i}] ${JSON.stringify(e.word)}`;
    const forms = e.forms || {};
    if (!DE_HEADWORD.test(e.word)) err(`${where}: malformed headword`);
    if (DE_INFLECTED.has(e.word.toLowerCase()) && !DE_INFLECTED_ALLOWED.has(e.word)) {
      err(`${where}: inflected form as headword`);
    }
    if (e.pos === 'noun') {
      if (forms.pluraleTantum) {
        if (e.gender) err(`${where}: plurale tantum with a singular gender`);
        if (!(e.display || '').startsWith('die ')) err(`${where}: plurale tantum display missing "die"`);
      } else if (!e.gender) {
        err(`${where}: noun missing gender`);
      } else {
        // Multi-gender nouns ("m/f", stored in canonical order): the display
        // leads with the primary article, which may be any of them.
        const arts = e.gender.split('/').map((g) => DE_ARTICLE[g]);
        if (!arts.some((art) => (e.display || '').startsWith(`${art} `))) {
          err(`${where}: display ${JSON.stringify(e.display)} missing article ${arts.join('/')}`);
        }
      }
    } else if (e.pos === 'properNoun' && 'display' in e) {
      err(`${where}: proper noun display carries an article`);
    }
    if (!e.en) noEnglish += 1;
    else if (PLACEHOLDER.test(e.en.trim())) err(`${where}: placeholder en`);
    else if (e.en.toLowerCase() === e.word.toLowerCase()) enEcho += 1;
    else if (!/[A-Za-z]/.test(e.en)) err(`${where}: en has no latin letters`);
    if (degenerate(e.zh)) err(`${where}: degenerate zh`);
    if (e.en && degenerate(e.en)) err(`${where}: degenerate en`);
  });
  if (noEnglish > DE_BUDGET.noEnglish) err(`${noEnglish} entries without en > budget ${DE_BUDGET.noEnglish}`);
  if (enEcho > entries.length * DE_BUDGET.enEchoShare) err(`${enEcho} en glosses just echo the headword`);
}

// ---- French (folded in from validate_french_vocabulary.js) -------------------
// A headword must be a spellable French form: no parentheses, no slashes, no
// trailing part-of-speech crumbs.  A trailing apostrophe is legal ("de l'").
const FR_HEADWORD = /^[a-zà-öø-ÿœæçA-ZÀ-ÖØ-ÞŒÆÇ0-9]+(?:[-' ’][a-zà-öø-ÿœæçA-ZÀ-ÖØ-ÞŒÆÇ0-9]+)*['’]?$/;
const nfc = (s) => String(s == null ? '' : s).normalize('NFC');
/** Must stay in sync with gloss_key() in scripts/build_french_vocabulary.py. */
function glossKey(gloss) {
  return nfc(gloss).replace(/[\s;；,，、.。…·-]+/g, '');
}
const frKey = (w) => nfc(w).toLowerCase().replace(/’/g, "'").trim();

function checkFrench(entries, meta, err) {
  const byGloss = new Map();
  const byKey = new Map();
  entries.forEach((e, i) => {
    const where = `fr[${i}] ${JSON.stringify(e.word)}`;
    if (!FR_HEADWORD.test(nfc(e.word))) err(`${where}: malformed headword`);
    const key = frKey(e.word);
    if (byKey.has(key)) err(`${where}: duplicate headword (also ${JSON.stringify(byKey.get(key))})`);
    else byKey.set(key, e.word);
    // Every Chinese gloss is unique, so a multiple-choice quiz never offers two
    // right answers (build_french_vocabulary.py dedupes on gloss_key()).
    const gk = glossKey(e.zh);
    if (gk && byGloss.has(gk)) err(`${where}: zh collides with ${JSON.stringify(byGloss.get(gk))}: ${e.zh}`);
    else byGloss.set(gk, e.word);
    if (frKey(e.zh) === key) err(`${where}: zh equals the headword`);
    const t = nfc(e.zh).replace(/\s+/g, '');
    if (t.length >= 4 && (/(.)\1{3,}/.test(t) || /^(.{2,6}?)\1{2,}$/.test(t))) err(`${where}: degenerate zh`);
    if (e.pos === 'noun' && !e.gender) err(`${where}: noun missing gender`);
  });
}

// Per-language floors, hand-checked gold rows and extra rule hooks.
// Floors (same for every language, see docs/vocab-schema.md): minPos = share
// of entries with pos; minEn = share with an English gloss (not for en);
// minNounGender = share of pos:noun entries with gender (gendered languages).
// maxNoCjk: known Italian hole — 150 machine-translated zh that stayed
// latin/pinyin ("babbo", "tao"); budgeted so it can only shrink.
const FLOORS = { minPos: 0.99, minEn: 0.99, minNounGender: 0.95 };
const LANGS = {
  it: { ...FLOORS, minPos: 0.995, maxNoCjk: 150, gold: IT_GOLD, check: checkItalian },
  de: { ...FLOORS, minPos: 0.999, gold: [['Haus', 'noun', 'n'], ['gehen', 'verb'], ['schön', 'adjective']], check: checkGerman },
  en: {
    minPos: FLOORS.minPos,
    gold: [['house', 'noun'], ['go', 'verb'], ['beautiful', 'adjective'], ['is', 'verb'],
      ['the', 'article'], ['every', 'determiner'], ['good', 'adjective'], ['York', 'properNoun'],
      ['Estonian', 'adjective'], ['china', 'noun'],
      // common words a recasing pass must leave lowercase (not OR / ME / US / Ate)
      ['or', 'conjunction'], ['me', 'pronoun'], ['us', 'pronoun'], ['ate', 'verb'],
      ['Luke', 'properNoun'], ['Jerry', 'properNoun']]
  },
  fr: { ...FLOORS, gold: [['maison', 'noun', 'f'], ['aller', 'verb'], ['beau', 'adjective']], check: checkFrench }
};

function load(lang) {
  const file = path.join(VOCAB_DIR, `${lang}.js`);
  const ctx = {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  return ctx.DIM_VOCAB && ctx.DIM_VOCAB[lang];
}

function bandFor(position) {
  for (const [limit, level] of BANDS) if (position <= limit) return level;
  return 'C2';
}

function validate(lang) {
  const errors = [];
  const err = (msg) => { if (errors.length < 40) errors.push(msg); };
  const data = load(lang);
  if (!data || !data.meta || !Array.isArray(data.entries)) {
    return { errors: [`${lang}: DIM_VOCAB.${lang} missing or malformed`], stats: {} };
  }
  const { meta, entries } = data;
  if (meta.schema !== 1) err(`meta.schema ${meta.schema} !== 1`);
  if (meta.lang !== lang) err(`meta.lang ${meta.lang} !== ${lang}`);
  if (meta.count !== entries.length) err(`meta.count ${meta.count} !== ${entries.length}`);
  if (!Array.isArray(meta.sources)) err('meta.sources must be an array');
  if (!Array.isArray(meta.licences) || !meta.licences.length) err('meta.licences missing');

  const seen = new Set();
  const stats = { entries: entries.length, pos: 0, gender: 0, nouns: 0, en: 0, freq: 0, forms: 0, levels: {}, levelSources: {}, noCjk: 0, noCjkSample: [] };
  const allWords = new Set(entries.map((e) => e.word));
  let lastBandIdx = 0;
  entries.forEach((e, i) => {
    const where = `${lang}[${i}] ${JSON.stringify(e.word)}`;
    Object.keys(e).forEach((k) => { if (!FIELDS.includes(k)) err(`${where}: unknown field ${k}`); });
    if (typeof e.word !== 'string' || !e.word.trim() || e.word !== e.word.trim()) err(`${where}: bad word`);
    if (seen.has(e.word)) err(`${where}: duplicate word`);
    seen.add(e.word);
    if ('display' in e && (typeof e.display !== 'string' || !e.display || e.display === e.word)) err(`${where}: bad display`);
    if (typeof e.zh !== 'string' || !e.zh.trim()) err(`${where}: missing zh`);
    else if (checkGlossBasics(e, where, err)) {
      stats.noCjk += 1;
      if (stats.noCjkSample.length < 5) stats.noCjkSample.push(e.word);
    }
    if ('zhAlt' in e && !(Array.isArray(e.zhAlt) && e.zhAlt.every((s) => typeof s === 'string' && s && s !== e.zh))) err(`${where}: bad zhAlt`);
    if ('en' in e && (typeof e.en !== 'string' || !e.en)) err(`${where}: bad en`);
    if ('pos' in e) {
      if (!POS.has(e.pos)) err(`${where}: bad pos ${e.pos}`);
      stats.pos += 1;
    }
    if ('posAll' in e) {
      if (!Array.isArray(e.posAll) || e.posAll.length < 2 || e.posAll[0] !== e.pos
        || !e.posAll.every((p) => POS.has(p)) || new Set(e.posAll).size !== e.posAll.length) err(`${where}: bad posAll`);
    }
    if (e.pos === 'noun') stats.nouns += 1;
    if ('gender' in e) {
      if (!GENDER_RE.test(e.gender)) err(`${where}: bad gender ${e.gender}`);
      else if (e.gender !== canonicalGender(e.gender)) err(`${where}: gender ${e.gender} not in m/f/n order (${canonicalGender(e.gender)})`);
      if (e.pos !== 'noun' && e.pos !== 'properNoun') err(`${where}: gender on ${e.pos}`);
      if (e.pos === 'noun') stats.gender += 1;
    }
    if (!LEVELS.includes(e.level)) err(`${where}: bad level ${e.level}`);
    if (!LEVEL_SOURCES.has(e.levelSource)) err(`${where}: bad levelSource ${e.levelSource}`);
    stats.levels[e.level] = (stats.levels[e.level] || 0) + 1;
    stats.levelSources[e.levelSource] = (stats.levelSources[e.levelSource] || 0) + 1;
    if (e.rank !== i + 1) err(`${where}: rank ${e.rank} !== ${i + 1}`);
    if (e.freq !== null && !(typeof e.freq === 'number' && e.freq > 0)) err(`${where}: bad freq`);
    if (e.freq) stats.freq += 1;
    if (e.en) stats.en += 1;
    if (e.levelSource === 'freq-band') {
      const idx = LEVELS.indexOf(e.level);
      if (idx < lastBandIdx) err(`${where}: freq-band level ${e.level} after ${LEVELS[lastBandIdx]}`);
      lastBandIdx = Math.max(lastBandIdx, idx);
      if (e.freq && e.level !== bandFor(e.rank)) err(`${where}: level ${e.level} !== band ${bandFor(e.rank)}`);
    } else if (LEVELS.indexOf(e.level) > LEVELS.indexOf(e.freq ? bandFor(e.rank) : 'C2')) {
      err(`${where}: ${e.levelSource} level ${e.level} is harder than its frequency band`);
    }
    if ('forms' in e) {
      stats.forms += 1;
      if (!e.forms || typeof e.forms !== 'object' || !Object.keys(e.forms).length) err(`${where}: empty forms`);
      else Object.entries(e.forms).forEach(([k, v]) => {
        if (!FORM_KEYS.has(k)) err(`${where}: unknown form ${k}`);
        else if (k === 'variants' ? !(Array.isArray(v) && v.length && v.every((s) => typeof s === 'string' && s))
          : (k === 'pluraleTantum' || k === 'pronominal') ? v !== true : !(typeof v === 'string' && v)) err(`${where}: bad forms.${k}`);
      });
    }
    if ('tags' in e && !(Array.isArray(e.tags) && e.tags.length && e.tags.every((t) => typeof t === 'string' && t))) err(`${where}: bad tags`);
    if ('src' in e && !(Number.isInteger(e.src) && e.src >= 0 && e.src < meta.sources.length)) err(`${where}: bad src`);
    if ('legacyId' in e && !(typeof e.legacyId === 'string' && e.legacyId)) err(`${where}: bad legacyId`);
    // legacyWord: the headword this entry had before a rename (progress keyed
    // on the old word migrates through it) — must differ from word and must
    // not be another entry's current word.
    if ('legacyWord' in e) {
      const olds = Array.isArray(e.legacyWord) ? e.legacyWord : [e.legacyWord];
      if (Array.isArray(e.legacyWord) && e.legacyWord.length < 2) err(`${where}: legacyWord list with < 2 items (use a string)`);
      olds.forEach(old => {
        if (!(typeof old === 'string' && old.trim())) err(`${where}: bad legacyWord`);
        else if (old === e.word) err(`${where}: legacyWord equals word`);
        else if (allWords.has(old)) err(`${where}: legacyWord ${JSON.stringify(old)} is another entry's word`);
      });
    }
  });

  const cfg = LANGS[lang] || { minPos: 0.95, gold: [] };
  if (cfg.check) cfg.check(entries, meta, err);
  if (stats.noCjk > (cfg.maxNoCjk || 0)) {
    err(`${stats.noCjk} zh glosses without CJK characters > budget ${cfg.maxNoCjk || 0} (e.g. ${stats.noCjkSample.join(', ')})`);
  }
  const posRate = stats.pos / entries.length;
  if (posRate < cfg.minPos) err(`POS coverage ${(posRate * 100).toFixed(2)}% < ${cfg.minPos * 100}%`);
  const enRate = stats.en / entries.length;
  if (cfg.minEn && enRate < cfg.minEn) err(`en coverage ${(enRate * 100).toFixed(2)}% < ${cfg.minEn * 100}%`);
  const genderRate = stats.nouns ? stats.gender / stats.nouns : 1;
  if (cfg.minNounGender && genderRate < cfg.minNounGender) {
    err(`noun gender coverage ${(genderRate * 100).toFixed(2)}% < ${cfg.minNounGender * 100}%`);
  }
  const byWord = new Map(entries.map((e) => [e.word, e]));
  cfg.gold.forEach(([word, pos, gender]) => {
    const e = byWord.get(word);
    if (!e) return err(`gold: ${word} missing`);
    if (e.pos !== pos) err(`gold: ${word} pos ${e.pos} !== ${pos}`);
    if (gender && e.gender !== gender) err(`gold: ${word} gender ${e.gender} !== ${gender}`);
  });
  return { errors, stats };
}

function main() {
  const wanted = process.argv.slice(2);
  const langs = wanted.length ? wanted
    : fs.readdirSync(VOCAB_DIR).filter((f) => /^[a-z]{2}\.js$/.test(f)).map((f) => f.slice(0, 2)).sort();
  let failed = 0;
  langs.forEach((lang) => {
    const { errors, stats } = validate(lang);
    const pct = (n) => `${((n / stats.entries) * 100).toFixed(1)}%`;
    console.log(`${lang}: ${stats.entries} entries · pos ${pct(stats.pos)} · en ${pct(stats.en)} · freq ${pct(stats.freq)}`
      + ` · noun gender ${stats.nouns ? ((stats.gender / stats.nouns) * 100).toFixed(1) : '-'}%`
      + ` · forms ${pct(stats.forms)}`
      + ` · levels ${LEVELS.map((l) => `${l}:${stats.levels[l] || 0}`).join(' ')}`
      + ` · levelSource ${Object.entries(stats.levelSources || {}).map(([k, v]) => `${k}:${v}`).join(' ')}`);
    if (errors.length) {
      failed += 1;
      errors.forEach((e) => console.log(`  ✗ ${e}`));
    }
  });
  if (failed) {
    console.log(`validate_vocab: ${failed} language(s) failed`);
    process.exit(1);
  }
  console.log('validate_vocab: ok');
}

main();
