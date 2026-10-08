#!/usr/bin/env node
/**
 * French gloss-quality regression checks (beyond the schema rules of
 * validate_vocab.js / validate_modules.js).
 *
 * The Lexique core layer of data/vocab/fr.js got its Chinese through an
 * English pivot (Wiktionary EN gloss -> ECDICT), which copies the wrong sense
 * of English homographs (marche "march" -> 三月) and resolves phrases on their
 * first word.  The corrections live in scripts/vocab_fixes/fr.json and are
 * applied by `build_french_vocabulary.py assemble`; this validator makes sure a
 * rebuild cannot silently bring the errors back:
 *
 *   1. suspects   - curated words whose known pivot-junk sense must not
 *                   reappear (and whose real sense must be present), in both
 *                   the vocab and the cognate table;
 *   2. markers    - no "（英：…）" fallback marker left in any French gloss;
 *   3. cognates   - every word of data/fr-cognates.js exists in the vocab
 *                   (case-insensitive), so the cognate drill never teaches a
 *                   word the vocab does not know;
 *   4. fix list   - every record of scripts/vocab_fixes/fr.json is reflected in
 *                   fr.js (no pending or stale fixes: re-run assemble).
 *
 *   node scripts/validate_fr_quality.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

// word -> {forbid: substrings that must not appear, need: at least one must appear}
// Each forbid entry is the wrong sense the EN pivot produced (English homograph
// in parentheses).
const SUSPECTS = {
  marche: { forbid: ['三月', '行军'], need: ['步行', '台阶', '行进', '市场'] }, // march
  mars: { forbid: ['行军', '进军'], need: ['三月'] }, // march
  foie: { forbid: ['生活者', '居住者'], need: ['肝'] }, // liver
  ruban: { forbid: ['乐队', '乐团'], need: ['带'] }, // band
  pipi: { forbid: ['一点点', '极小'], need: ['尿'] }, // wee
  médicament: { forbid: ['麻药', '毒品'], need: ['药'] }, // drug
  compte: { forbid: ['报告', '叙述'], need: ['账'] }, // account
  vol: { forbid: ['逃走', '逃跑'], need: ['飞行', '盗窃'] }, // flight
  zèbre: { forbid: ['支索'], need: ['斑马'] }, // guy (rope)
  miroir: { forbid: ['写真', '典范'], need: ['镜'] }, // mirror
  cuit: { forbid: ['喝醉'], need: ['熟'] }, // cooked / smashed
  établir: { forbid: ['书写', '拼凑'], need: ['建立', '确立'] }, // make out
  mets: { forbid: ['盘子', '碟'], need: ['菜'] }, // dish
  cape: { forbid: ['海角', '岬'], need: ['斗篷'] }, // cape
  jarre: { forbid: ['震动', '刺耳'], need: ['缸', '坛'] }, // jar
  bluff: { forbid: ['断崖', '悬崖'], need: ['虚张声势'] }, // bluff
  sauge: { forbid: ['圣人', '贤人'], need: ['鼠尾草'] }, // sage
  contredanse: { forbid: ['晴天'], need: ['罚'] }, // fine
  miroitement: { forbid: ['写真', '镜子'], need: ['闪'] }, // mirror
  névralgique: { forbid: ['钥匙'], need: ['神经痛'] }, // key
  adjudant: { forbid: ['副官'], need: ['军士长', '准尉'] }, // adjutant
  leasing: { forbid: ['说谎'], need: ['租赁'] }, // leasing (lie)
};
const MARKER = '（英：';

function loadInto(file, ctx) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

const ctx = {};
ctx.globalThis = ctx;
ctx.window = ctx;
vm.createContext(ctx);
loadInto('data/vocab/fr.js', ctx);
loadInto('data/fr-cognates.js', ctx);
const VOCAB = ctx.DIM_VOCAB.fr;
const COGNATES = ctx.DIM_DATA.cognates.fr;
const FIXES = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/vocab_fixes/fr.json'), 'utf8'));

let passed = 0;
let failed = 0;
const failures = [];
function check(ok, msg) {
  if (ok) passed++;
  else {
    failed++;
    failures.push(msg);
  }
}

const byWord = new Map(VOCAB.entries.map((e) => [e.word, e]));
const lower = new Set(VOCAB.entries.map((e) => e.word.toLowerCase()));
const cognateBy = new Map(COGNATES.entries.map((e) => [e.word, e]));

// 1. curated suspects
for (const [word, rule] of Object.entries(SUSPECTS)) {
  const targets = [['vocab', byWord.get(word)], ['cognates', cognateBy.get(word)]];
  check(!!targets[0][1], `suspects: "${word}" missing from data/vocab/fr.js`);
  for (const [where, entry] of targets) {
    if (!entry) continue;
    const zh = entry.zh || '';
    for (const bad of rule.forbid) {
      check(!zh.includes(bad), `suspects: ${where} "${word}" zh "${zh}" has the pivot sense "${bad}"`);
    }
    check(rule.need.some((s) => zh.includes(s)),
      `suspects: ${where} "${word}" zh "${zh}" lacks the real sense (${rule.need.join(' / ')})`);
  }
}

// 2. leftover fallback markers
const marked = VOCAB.entries.filter((e) => (e.zh || '').includes(MARKER));
check(marked.length === 0, `markers: ${marked.length} glosses still carry "${MARKER}…）": ` +
  marked.slice(0, 8).map((e) => `${e.word} (rank ${e.rank})`).join(', '));
const markedCog = COGNATES.entries.filter((e) => (e.zh || '').includes(MARKER));
check(markedCog.length === 0, `markers: ${markedCog.length} cognate glosses carry "${MARKER}…）"`);

// 3. cognates present in the vocab
const missing = COGNATES.entries.filter((e) => !lower.has(e.word.toLowerCase()));
check(missing.length === 0, `cognates: ${missing.length} cognate words absent from the vocab: ` +
  missing.slice(0, 12).map((e) => e.word).join(', '));

// 4. fix list reflected in fr.js
let pending = 0;
const pendingWords = [];
for (const fix of FIXES) {
  let ok;
  if (fix.add) ok = lower.has(fix.add.word.toLowerCase());
  else {
    const entry = byWord.get(fix.word);
    const cur = entry ? (entry[fix.field] === undefined ? (fix.field === 'zhAlt' ? [] : '') : entry[fix.field]) : undefined;
    ok = entry !== undefined && JSON.stringify(cur) === JSON.stringify(fix.to);
  }
  if (!ok) {
    pending++;
    if (pendingWords.length < 10) pendingWords.push(fix.add ? `+${fix.add.word}` : `${fix.word}.${fix.field}`);
  }
}
check(pending === 0, `fix list: ${pending} of ${FIXES.length} records in scripts/vocab_fixes/fr.json ` +
  `not reflected in fr.js (run build_french_vocabulary.py assemble): ${pendingWords.join(', ')}`);

for (const f of failures.slice(0, 30)) console.error(`  ✗ ${f}`);
console.log(`fr quality: ${Object.keys(SUSPECTS).length} suspects, ${FIXES.length} fixes, ` +
  `${COGNATES.entries.length} cognates — ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
