#!/usr/bin/env node
/**
 * Validates the optional per-language module files (docs/data-schema.md) — one
 * validator for every module and every language, driven by lib/languages.js:
 * a language has a module iff its profile lists files for it, and every module
 * file registers DIM_DATA.<module>.<code>.
 *
 *   node scripts/validate_modules.js                 # every module, every language
 *   node scripts/validate_modules.js cognates        # one module
 *   node scripts/validate_modules.js cognates de fr  # one module, some languages
 *
 * CHECKS maps a module name to check(lang, data, ctx):
 *   lang   language code ('it' / 'de' / 'en' / 'fr')
 *   data   the registered payload, DIM_DATA.<module>.<lang>
 *   ctx    { check(cond, msg) -> bool, note(msg), root, profile, load(lang, module) }
 * A check reports through ctx.check; it must not throw on bad data.
 *
 * The last stdout line is "<n> passed, <m> failed" (tests/run-headless.js reads it);
 * the exit code is 1 when anything failed.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// loading — the data files are classic browser scripts
// ---------------------------------------------------------------------------

function sandbox() {
  const ctx = { console };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  return ctx;
}

function run(ctx, rel) {
  const file = path.join(ROOT, rel);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file, timeout: 120000 });
}

const LANGUAGES = (function () {
  const ctx = sandbox();
  run(ctx, 'lib/languages.js');
  return ctx.Languages;
})();

const cache = new Map();
/** DIM_DATA.<module>.<lang> as the page would see it (undefined when not shipped). */
function load(lang, module) {
  const key = lang + '/' + module;
  if (!cache.has(key)) {
    const profile = LANGUAGES.get(lang);
    const files = profile && profile.files && profile.files[module];
    let value;
    if (files) {
      const ctx = sandbox();
      files.forEach((f) => run(ctx, f));
      value = ctx.DIM_DATA && ctx.DIM_DATA[module] && ctx.DIM_DATA[module][profile.code];
    }
    cache.set(key, value);
  }
  return cache.get(key);
}

// ===========================================================================
// cognates/1
// ===========================================================================

const COGNATE_FIELDS = new Set(['word', 'display', 'pos', 'gender', 'level', 'rank', 'en', 'zh',
  'pattern', 'similarity', 'difficulty', 'falseFriend', 'src', 'x']);
const FALSE_FRIEND_FIELDS = new Set(['lookalike', 'zh', 'word', 'note']);
// docs/vocab-schema.md POS enum
const POS = new Set(['noun', 'properNoun', 'verb', 'adjective', 'adverb', 'pronoun',
  'determiner', 'article', 'preposition', 'conjunction', 'numeral', 'interjection',
  'particle', 'prefix', 'suffix', 'phrase', 'abbreviation']);
const GENDER_RE = /^[mfn](\/[mfn]){0,2}$/;
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const CJK = /[一-鿿㐀-䶿]/;
const PLACEHOLDER = /^(\?+|-+|_+|n\/?a|todo|tbd|xxx+|null|none|undefined|\(n\))$/i;
const MOJIBAKE = /�|Ã[\u0080-¿]|â€|Â[ -¿]/;
const FALSE_FRIEND = 'false-friend';
const IDENTICAL = 'identical';

// The browse filter prints the difficulty bands; ordinary entries must sit in the
// band of their own similarity or "Easy (≥80%)" lists a 66% word.
const EASY_MIN = 0.8;
const MEDIUM_MIN = 0.5;
function curve(similarity) {
  if (typeof similarity !== 'number') return 3;
  if (similarity >= EASY_MIN) return 1;
  if (similarity >= MEDIUM_MIN) return 2;
  return 3;
}

function badText(value) {
  if (typeof value !== 'string') return 'not a string';
  const t = value.trim();
  if (!t) return 'empty';
  if (t !== value) return 'padded with whitespace';
  if (PLACEHOLDER.test(t)) return 'placeholder';
  if (MOJIBAKE.test(t)) return 'mojibake';
  return null;
}

const COGNATE_HOOKS = require('./validate_cognates_hooks.js');

/** Generic cognates/1 rules; language-specific ones live in validate_cognates_hooks.js. */
function validateCognates(lang, data, ctx) {
  const { check, note } = ctx;
  const where0 = `cognates/${lang}`;
  if (!check(data && typeof data === 'object' && !Array.isArray(data),
    `${where0}: payload must be a {meta, entries} object`)) return;
  const meta = data.meta || {};
  const entries = data.entries;
  if (!check(Array.isArray(entries) && entries.length > 0, `${where0}: entries must be a non-empty array`)) return;

  // -- meta ------------------------------------------------------------------
  check(meta.schema === 'cognates/1', `${where0}: meta.schema ${JSON.stringify(meta.schema)} !== "cognates/1"`);
  check(meta.lang === lang, `${where0}: meta.lang ${JSON.stringify(meta.lang)} !== "${lang}"`);
  check(meta.count === entries.length, `${where0}: meta.count ${meta.count} !== ${entries.length} entries`);
  check(!badText(meta.name), `${where0}: meta.name is ${badText(meta.name)}`);
  check(!badText(meta.builder), `${where0}: meta.builder is ${badText(meta.builder)}`);
  check(Array.isArray(meta.sources), `${where0}: meta.sources must be an array`);
  check(Array.isArray(meta.licences) && meta.licences.length > 0 && meta.licences.every((l) => !badText(l)),
    `${where0}: meta.licences must list the licences`);
  const patterns = meta.patterns || {};
  check(meta.patterns && typeof meta.patterns === 'object', `${where0}: meta.patterns missing`);
  for (const [key, p] of Object.entries(patterns)) {
    check(p && !badText(p.label), `${where0}: pattern "${key}" has no label`);
    check(p && !badText(p.zh) && CJK.test(p.zh), `${where0}: pattern "${key}" has no Chinese explanation`);
  }
  for (const [old, key] of Object.entries(meta.aliases || {})) {
    check(key in patterns, `${where0}: alias "${old}" points at unknown pattern "${key}"`);
  }
  const sources = Array.isArray(meta.sources) ? meta.sources : [];

  // -- entries ---------------------------------------------------------------
  const seen = new Map();
  const used = new Map();
  let identityRank = 0;
  let maxRank = 0;
  let noSimilarity = 0;
  let falseFriends = 0;
  const bands = { 1: 0, 2: 0, 3: 0 };

  entries.forEach((e, i) => {
    const where = `${where0}#${i} "${e && e.word}"`;
    if (!check(e && typeof e === 'object' && !Array.isArray(e), `${where}: not an object`)) return;
    const extra = Object.keys(e).filter((k) => !COGNATE_FIELDS.has(k));
    check(!extra.length, `${where}: unknown field(s) ${extra.join(', ')} (language-specific data goes under x)`);
    for (const [k, v] of Object.entries(e)) {
      check(v !== null && v !== '' && !(typeof v === 'object' && !Object.keys(v).length),
        `${where}: "${k}" is empty — optional fields are omitted, not blank`);
    }

    // word / display
    const bw = badText(e.word);
    check(!bw, `${where}: word is ${bw}`);
    check(!CJK.test(e.word || ''), `${where}: word contains Chinese`);
    check(!seen.has(e.word), `${where}: duplicate word (also at #${seen.get(e.word)})`);
    seen.set(e.word, i);
    if ('display' in e) {
      check(e.display !== e.word && String(e.display).endsWith(e.word),
        `${where}: display ${JSON.stringify(e.display)} must be a prefixed form of word`);
    }

    // pos / gender / level
    if ('pos' in e) check(POS.has(e.pos), `${where}: pos ${JSON.stringify(e.pos)} not in the vocab POS enum`);
    if ('gender' in e) {
      check(GENDER_RE.test(e.gender), `${where}: gender ${JSON.stringify(e.gender)}`);
      check(e.pos === 'noun' || e.pos === 'properNoun', `${where}: gender on a ${e.pos || 'pos-less'} entry`);
    }
    if ('level' in e) check(LEVELS.has(e.level), `${where}: level ${JSON.stringify(e.level)}`);

    // rank
    check(Number.isInteger(e.rank) && e.rank > 0, `${where}: rank ${e.rank} is not a positive integer`);
    if (e.rank === i + 1) identityRank += 1;
    maxRank = Math.max(maxRank, e.rank || 0);

    // glosses
    const be = badText(e.en);
    check(!be, `${where}: en is ${be}`);
    check(!CJK.test(e.en || ''), `${where}: en contains Chinese`);
    const bz = badText(e.zh);
    check(!bz, `${where}: zh is ${bz}`);
    check(CJK.test(e.zh || ''), `${where}: zh has no CJK`);
    check((e.zh || '').trim() !== (e.word || '').trim(), `${where}: zh is the headword`);

    // pattern
    if ('pattern' in e) {
      check(e.pattern in patterns, `${where}: pattern "${e.pattern}" missing from meta.patterns`);
      used.set(e.pattern, (used.get(e.pattern) || 0) + 1);
    }

    // similarity / difficulty
    if ('similarity' in e) {
      check(typeof e.similarity === 'number' && e.similarity >= 0 && e.similarity <= 1 &&
        Math.round(e.similarity * 100) / 100 === e.similarity,
        `${where}: similarity ${JSON.stringify(e.similarity)} must be 0…1 with two decimals`);
    } else {
      noSimilarity += 1;
    }
    check([1, 2, 3].includes(e.difficulty), `${where}: difficulty ${JSON.stringify(e.difficulty)} must be 1/2/3`);
    if (bands[e.difficulty] !== undefined) bands[e.difficulty] += 1;

    // false friends
    const ff = e.falseFriend;
    if (ff !== undefined) {
      falseFriends += 1;
      if (check(ff && typeof ff === 'object' && !Array.isArray(ff), `${where}: falseFriend must be an object`)) {
        const extraFf = Object.keys(ff).filter((k) => !FALSE_FRIEND_FIELDS.has(k));
        check(!extraFf.length, `${where}: unknown falseFriend field(s) ${extraFf.join(', ')}`);
        const bl = badText(ff.lookalike);
        check(!bl, `${where}: falseFriend.lookalike is ${bl}`);
        check(!CJK.test(ff.lookalike || ''), `${where}: falseFriend.lookalike must be the English word`);
        // case-sensitive on purpose: mars = "March" vs the trap "march" (行军)
        check((ff.lookalike || '') !== (e.en || ''),
          `${where}: en equals the trap word — the entry would teach the error`);
        if ('zh' in ff) check(!badText(ff.zh) && CJK.test(ff.zh), `${where}: falseFriend.zh has no CJK`);
        if ('word' in ff) check(!badText(ff.word) && !CJK.test(ff.word), `${where}: falseFriend.word is not a word`);
        if ('note' in ff) check(!badText(ff.note), `${where}: falseFriend.note is ${badText(ff.note)}`);
      }
      check(e.pattern === FALSE_FRIEND, `${where}: false friend without pattern "${FALSE_FRIEND}"`);
    } else {
      check(e.pattern !== FALSE_FRIEND, `${where}: pattern "${FALSE_FRIEND}" without a falseFriend object`);
      check(e.difficulty === curve(e.similarity),
        `${where}: difficulty ${e.difficulty} !== ${curve(e.similarity)} for similarity ${JSON.stringify(e.similarity)}`);
    }

    // provenance
    if ('src' in e) {
      check(Number.isInteger(e.src) && e.src >= 0 && e.src < sources.length,
        `${where}: src ${e.src} is not an index into meta.sources`);
    }
    if ('x' in e) check(e.x && typeof e.x === 'object' && !Array.isArray(e.x), `${where}: x must be an object`);
  });

  for (const key of Object.keys(patterns)) {
    check(used.has(key), `${where0}: meta.patterns lists "${key}" but no entry uses it`);
  }
  check(identityRank < entries.length * 0.05,
    `${where0}: ${identityRank}/${entries.length} ranks equal their array index — ranks look synthesised`);
  check(maxRank > entries.length,
    `${where0}: max rank ${maxRank} <= entry count ${entries.length} — ranks are not corpus ranks`);
  check(noSimilarity < entries.length * 0.05,
    `${where0}: ${noSimilarity}/${entries.length} entries have no similarity`);

  const hook = COGNATE_HOOKS[lang];
  if (hook) hook(data, Object.assign({ badText, CJK, curve }, ctx));

  note(`${where0}: ${entries.length} entries, ${used.size} patterns, ${falseFriends} false friends, ` +
    `difficulty 1/2/3 = ${bands[1]}/${bands[2]}/${bands[3]}` + (hook ? '' : ' (no language hook)'));
}

/** Cross-cutting: the UI prints the bands curve() enforces. */
function validateCognateApp(ctx) {
  const src = fs.readFileSync(path.join(ROOT, 'cognate-app.js'), 'utf8');
  const e = Math.round(EASY_MIN * 100);
  const m = Math.round(MEDIUM_MIN * 100);
  ctx.check(src.includes(`Easy（≥${e}%）`), `cognate-app.js: browse filter no longer says "Easy（≥${e}%）"`);
  ctx.check(src.includes(`Medium（${m}-${e - 1}%）`), `cognate-app.js: browse filter no longer says "Medium（${m}-${e - 1}%）"`);
  ctx.check(src.includes(`Hard（&lt;${m}%）`), `cognate-app.js: browse filter no longer says "Hard（<${m}%）"`);
}

// ===========================================================================
// collocations/1
// ===========================================================================

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

/** Shared meta contract: schema, lang, name, count, builder, sources, licences. */
function checkMeta(module, lang, meta, problems) {
  if (!isObj(meta)) { problems.push('meta missing'); return false; }
  if (meta.schema !== module + '/1') problems.push(`meta.schema ${JSON.stringify(meta.schema)} !== "${module}/1"`);
  if (meta.lang !== lang) problems.push(`meta.lang ${JSON.stringify(meta.lang)} !== "${lang}"`);
  if (!isStr(meta.name)) problems.push('meta.name missing');
  if (!Number.isInteger(meta.count)) problems.push('meta.count must be an integer');
  if (!isStr(meta.builder)) problems.push('meta.builder missing');
  else if (!fs.existsSync(path.join(ROOT, meta.builder))) problems.push(`meta.builder ${meta.builder} does not exist`);
  if (!Array.isArray(meta.sources) || !meta.sources.length || !meta.sources.every(isStr)) {
    problems.push('meta.sources must be a non-empty list of strings');
  }
  if (!Array.isArray(meta.licences) || !meta.licences.length || !meta.licences.every(isStr)) {
    problems.push('meta.licences must be a non-empty list of strings');
  }
  return true;
}

// ---------------------------------------------------------------------------
// collocations/1
// ---------------------------------------------------------------------------

const KEY_KINDS = new Set(['preposition', 'particle', 'case', 'object']);

/**
 * The verbs/keys/index body of a collocations/1 block.  Also used for nested
 * blocks with the same shape (German x.nounVerb), which inherit meta.sources.
 */
function checkCollocationBody(label, data, sourceCount, problems, needCase) {
  const p = (msg) => problems.push(label + msg);
  if (!Array.isArray(data.keys) || !data.keys.length) { p('keys[] must be a non-empty array'); return; }
  if (!isObj(data.verbs)) { p('verbs must be an object'); return; }
  if (!isObj(data.index)) { p('index must be an object'); return; }

  const keyRec = new Map();
  data.keys.forEach((rec, i) => {
    if (!isObj(rec) || !isStr(rec.key)) { p(`keys[${i}] has no key`); return; }
    if (keyRec.has(rec.key)) p(`keys[${i}] duplicate key "${rec.key}"`);
    keyRec.set(rec.key, rec);
    if (!isStr(rec.label)) p(`key "${rec.key}" has no label`);
    if (!KEY_KINDS.has(rec.kind)) p(`key "${rec.key}" kind ${JSON.stringify(rec.kind)} not in ${[...KEY_KINDS].join('|')}`);
    if (rec.zh !== undefined && !CJK.test(rec.zh)) p(`key "${rec.key}" zh has no Chinese`);
    if (needCase && !isStr(rec.case)) p(`key "${rec.key}" has no case`);
  });

  const used = new Map();     // key -> [word …] in verb order
  let examples = 0;
  for (const [word, verb] of Object.entries(data.verbs)) {
    const w = `verb "${word}"`;
    if (!isObj(verb)) { p(`${w} is not an object`); continue; }
    if (verb.word !== word) p(`${w}: word ${JSON.stringify(verb.word)} !== headword`);
    if (verb.level !== undefined && !LEVELS.has(verb.level)) p(`${w}: bad level ${JSON.stringify(verb.level)}`);
    if (verb.x !== undefined && !isObj(verb.x)) p(`${w}: x must be an object`);
    const order = verb.order;
    const keys = verb.keys;
    if (!Array.isArray(order) || !order.length) { p(`${w}: order must be a non-empty array`); continue; }
    if (!isObj(keys)) { p(`${w}: keys must be an object`); continue; }
    if (new Set(order).size !== order.length) p(`${w}: order has duplicates`);
    if (JSON.stringify([...order].sort()) !== JSON.stringify(Object.keys(keys).sort())) {
      p(`${w}: order ${JSON.stringify(order)} !== keys of "keys"`);
    }
    for (const key of order) {
      if (!keyRec.has(key)) p(`${w}: key "${key}" missing from keys[]`);
      const list = keys[key];
      if (!Array.isArray(list) || !list.length) { p(`${w}: keys["${key}"] must be a non-empty array`); continue; }
      (used.get(key) || used.set(key, []).get(key)).push(word);
      list.forEach((ex, i) => {
        examples += 1;
        const e = `${w} [${key}]#${i}`;
        if (!isObj(ex)) { p(`${e}: example must be {text, zh}`); return; }
        if (!isStr(ex.text)) p(`${e}: empty text`);
        else if (CJK.test(ex.text)) p(`${e}: text contains Chinese ${JSON.stringify(ex.text)}`);
        if (!isStr(ex.zh) || !CJK.test(ex.zh)) p(`${e}: zh has no Chinese ${JSON.stringify(ex.zh)}`);
        if (ex.src !== undefined && !(Number.isInteger(ex.src) && ex.src >= 0 && ex.src < sourceCount)) {
          p(`${e}: src ${JSON.stringify(ex.src)} does not index meta.sources`);
        }
        const extra = Object.keys(ex).filter((k) => !['text', 'zh', 'src'].includes(k));
        if (extra.length) p(`${e}: unexpected fields ${extra.join(', ')} (put them under x)`);
      });
    }
  }

  // index is exactly the inverse of verbs[].order, in verb order
  for (const [key, words] of used) {
    if (JSON.stringify(data.index[key]) !== JSON.stringify(words)) p(`index["${key}"] is not the inverse of verbs`);
  }
  for (const key of Object.keys(data.index)) if (!used.has(key)) p(`index["${key}"] names a key no verb uses`);
  for (const key of keyRec.keys()) if (!used.has(key)) p(`key "${key}" in keys[] is used by no verb`);

  const count = Object.keys(data.verbs).length;
  if (data.meta && data.meta.count !== count) p(`meta.count ${data.meta.count} !== ${count} verbs`);
  if (data.meta && data.meta.examples !== undefined && data.meta.examples !== examples) {
    p(`meta.examples ${data.meta.examples} !== ${examples}`);
  }
  return { count, examples };
}

function validateCollocations(lang, data) {
  const problems = [];
  if (!isObj(data)) return ['payload is not an object'];
  checkMeta('collocations', lang, data.meta, problems);
  const extra = Object.keys(data).filter((k) => !['meta', 'keys', 'verbs', 'index', 'x'].includes(k));
  if (extra.length) problems.push(`unexpected top-level fields ${extra.join(', ')} (put them under x)`);
  const sourceCount = Array.isArray(data.meta && data.meta.sources) ? data.meta.sources.length : 0;
  // a key-level case field is how German marks Rektion; once one key has it, all must
  const needCase = Array.isArray(data.keys) && data.keys.some((k) => k && k.case !== undefined);
  checkCollocationBody('', data, sourceCount, problems, needCase);
  // nested blocks of the same shape (e.g. German Funktionsverbgefüge)
  if (isObj(data.x)) {
    for (const [name, block] of Object.entries(data.x)) {
      if (isObj(block) && block.verbs && block.keys) {
        checkCollocationBody(`x.${name}: `, block, sourceCount, problems, false);
      }
    }
  }
  return problems;
}


/** Adapts a check(lang, data) -> [problem strings] validator to the ctx.check registry. */
function fromProblems(module, fn) {
  return function (lang, data, ctx) {
    const problems = fn(lang, data, ctx) || [];
    ctx.check(problems.length === 0, `${module}/${lang}: ${problems.length} problem(s)`);
    problems.forEach((p) => ctx.check(false, `${module}/${lang}: ${p}`));
    if (!problems.length) ctx.note(`${module}/${lang}: ok`);
  };
}

// ===========================================================================
// registry
// ===========================================================================

const CHECKS = {
  collocations: fromProblems('collocations', validateCollocations),
  cognates: validateCognates,
};
// module -> check(ctx) run once per invocation (not per language)
const GLOBAL_CHECKS = {
  cognates: validateCognateApp,
};

function main(argv) {
  const modules = argv.filter((a) => a in CHECKS);
  const langs = argv.filter((a) => LANGUAGES.get(a)).map((a) => LANGUAGES.code(a));
  const unknown = argv.filter((a) => !(a in CHECKS) && !LANGUAGES.get(a));
  if (unknown.length) {
    console.error('unknown module/language: ' + unknown.join(', ') +
      ' (modules: ' + Object.keys(CHECKS).join(', ') + ')');
    return 2;
  }

  let passed = 0;
  const errors = [];
  const notes = [];
  const base = {
    root: ROOT,
    load,
    check(cond, msg) {
      if (cond) passed += 1;
      else errors.push(msg);
      return !!cond;
    },
    note(msg) { notes.push(msg); },
  };

  for (const module of modules.length ? modules : Object.keys(CHECKS)) {
    if (GLOBAL_CHECKS[module]) GLOBAL_CHECKS[module](base);
    for (const profile of LANGUAGES.list) {
      if (langs.length && langs.indexOf(profile.code) === -1) continue;
      if (!LANGUAGES.hasModule(profile.code, module)) continue;
      let data;
      try {
        data = load(profile.code, module);
      } catch (err) {
        base.check(false, `${module}/${profile.code}: data file does not load: ${err.message}`);
        continue;
      }
      if (!base.check(data !== undefined, `${module}/${profile.code}: nothing registered at DIM_DATA.${module}.${profile.code}`)) continue;
      CHECKS[module](profile.code, data, Object.assign({ profile }, base));
    }
  }

  for (const n of notes) console.log('  ' + n);
  if (errors.length) {
    console.error(`\nFAIL: ${errors.length} problem(s)`);
    for (const e of errors.slice(0, 40)) console.error('  - ' + e);
    if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  }
  console.log(`validate_modules: ${passed} passed, ${errors.length} failed`);
  return errors.length ? 1 : 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));

module.exports = { CHECKS, load, curve, badText };
