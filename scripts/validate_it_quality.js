#!/usr/bin/env node
/**
 * Italian content-quality validator (the schema checks live in
 * validate_vocab.js / validate_modules.js; this file guards the Italian
 * content fixes made in 2026-10 so a rebuild cannot silently undo them).
 *
 *   node scripts/validate_it_quality.js
 *
 * Reads only the shipped data files plus the reviewed fix lists in
 * scripts/it_fixes/ (replayed by scripts/italian_fixes.py):
 *   vocab        - no OCR / machine-translation artefacts in zh ("(1) 国家",
 *                  "页:1", "{\fn", "待修复", Latin words, "…Name", repeated
 *                  senses); capitalised headwords are proper nouns or
 *                  abbreviations (allowlist below); every fix in
 *                  it_fixes/vocab.json is in effect.
 *   collocations - no inline "(= a me)" notes, no Latin in zh, every example
 *                  contains its verb (stem or a form from it-conjugations,
 *                  allowlist below), every verb zh is Chinese.
 *   grammar      - topic N in "N．title" equals its position in the chapter
 *                  (title and leading header), 400 <= topic size <= 35000.
 *   cognates     - the classic false friends are present and flagged.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
let checks = 0;
function check(ok, msg) { checks++; if (!ok) errors.push(msg); }

function load(rel, expr) {
  const ctx = { globalThis: {} };
  ctx.window = ctx.globalThis;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8') + (expr ? `\n;globalThis.__x = ${expr};` : ''), ctx);
  return ctx.globalThis;
}

const V = load('data/vocab/it.js').DIM_VOCAB.it;
const COLL = load('data/it-collocations.js').DIM_DATA.collocations.it;
const COG = load('data/it-cognates.js').DIM_DATA.cognates.it;
const CONJ = load('data/it-conjugations.js', 'CONJUGATIONS_IT').__x;
const GR = load('data/it-grammar.js', 'GRAMMAR_DATA').__x;
const VOCAB_FIXES = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/it_fixes/vocab.json'), 'utf8'));

const CJK = /[㐀-鿿]/;
const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ---------------------------------------------------------------- vocab
const ARTEFACTS = [
  [/[（(]\s*\d+\s*[)）]/, 'numbered-sense marker "(1)"'],
  [/页\s*[:：]\s*\d/, 'page marker'],
  [/\\fn|\{\\/, 'subtitle markup'],
  [/待修复|TODO|FIXME/, 'placeholder'],
  [/Name\s*$|^\s*Name/, '"Name" tag'],
  [/[A-Za-z]{4,}/, 'Latin word in zh'],
  [/\?\?|�/, 'mojibake'],
];
// Latin inside zh is fine when it is the Italian/English word being described
// (e.g. "（essere 的第二人称单数）") or a common acronym.
const LATIN_OK = /^(?:[（(][^）)]*[)）]|[A-Z]{2,6}|[^A-Za-z]*)$/;
function latinOk(zh) {
  // strip parenthesised grammar notes and acronyms, then look again
  const rest = zh.replace(/[（(][^）)]*[)）]/g, '').replace(/\b[A-Z]{2,6}s?\b/g, '');
  return !/[A-Za-z]{4,}/.test(rest);
}

const CAP_POS = new Set(['properNoun', 'abbreviation', 'symbol']);
// Lowercase-in-text words the frequency list keeps capitalised on purpose.
const CAP_OK = new Set(['Lei', 'Loro', 'Le', 'La', 'Ella', 'Sua', 'Suo', 'Signore', 'Signora',
  'Dio', 'DOC', 'DOCG', 'IGT', 'Pasqua', 'Natale', 'Ferragosto', 'Capodanno',
  // eras, feasts, set phrases and loanwords that are capitalised in Italian
  'Medioevo', 'Rinascimento', 'Occidente', 'Oriente', 'Altissimo', 'Romani', 'Bermuda', 'IVA',
  'Paleolitico', 'Archeozoico', 'Pliocene', 'Miocene', 'Pleistocene', 'Eocene', 'Olocene',
  'Padre nostro', 'Messa di Natale', 'Assunzione di Maria', "Corona dell'Avvento", 'Kyrie',
  'Paperone', 'DNA ricombinante', 'Konzern',
  'Ottocento', 'Novecento', 'Settecento', 'Seicento', 'Cinquecento', 'Quattrocento', 'Trecento', 'Duecento']);

const words = new Map();
V.entries.forEach(e => words.set(e.word, e));
let artefacts = 0;
V.entries.forEach(e => {
  const zh = e.zh || '';
  ARTEFACTS.forEach(([re, what]) => {
    if (!re.test(zh)) return;
    if (what === 'Latin word in zh' && latinOk(zh)) return;
    artefacts++;
    check(false, `vocab ${e.word}: ${what} in zh "${zh}"`);
  });
  const senses = zh.split(/[；;]/).map(s => s.trim()).filter(Boolean);
  check(new Set(senses).size === senses.length, `vocab ${e.word}: repeated sense in zh "${zh}"`);
  if (/^[A-ZÀ-Ý]/.test(e.word) && !CAP_POS.has(e.pos)) {
    check(CAP_OK.has(e.word), `vocab ${e.word}: capitalised headword with pos ${e.pos} (lowercase it or add to CAP_OK)`);
  }
});

// every reviewed fix is in effect (records whose word was later renamed or
// dropped are skipped; italian_fixes.py reports those as STALE)
let fixesChecked = 0;
VOCAB_FIXES.forEach(f => {
  if (!f.to || typeof f.to !== 'object' || !f.word) return;
  const e = words.get(f.word);
  if (!e) return;
  fixesChecked++;
  Object.entries(f.to).forEach(([k, v]) => {
    check(e[k] === v || (v === '' && e[k] === undefined), `vocab ${f.word}.${k} = ${JSON.stringify(e[k])}, fix list says ${JSON.stringify(v)} (${f.why || ''})`);
  });
});
check(fixesChecked > 3000, `only ${fixesChecked} vocab fixes found in effect`);

// ---------------------------------------------------------- collocations
// Examples that legitimately lack the headword's stem (suppletive forms,
// the verb elided in a set phrase, ...).  Key: "verb|text".
const STEM_OK = new Set([
  'cingere|Gli cinsero il capo di una corona di alloro.',
  'cingere|Gli cinsero il capo con una corona di alloro.',
  'astenersi|Astieniti dai tuoi commenti ironici, per favore!',
  'fuoriuscire|La lava fuoriesce dal cratere.',
  'profondersi|Si è profuso in scuse.',
  'prorompere|Il fiume proruppe dagli argini.',
  'prorompere|La donna proruppe in un grido disperato.',
  "scindere|Abbiamo scisso l'associazione in due gruppi.",
  'scindersi|Il nostro gruppo si è scisso dal movimento degli studenti.',
  'scindersi|Il partito si è scisso in due correnti.',
]);

const formsOf = new Map();
Object.values(CONJ.verbs).forEach(v => {
  const set = new Set();
  [].concat(...Object.values(v.tenses || {}).map(x => [].concat(x || []))).forEach(f => {
    String(f).split(/[\/\s]+/).forEach(t => { if (t.length >= 2) set.add(fold(t)); });
  });
  formsOf.set(v.word, set);
});
// accoppiarsi -> accoppiare, comporsi -> comporre, infischiarsene -> infischiare
function baseOf(w) {
  return w.replace(/(?:si|sene|cisi|sela)$/, '').replace(/([ou])r$/, '$1rre').replace(/([aei])r$/, '$1re');
}
function stemOf(w) {
  const s = fold(baseOf(w).replace(/(are|ere|ire|rre)$/, ''));
  return s.slice(0, Math.max(4, s.length - 2));   // tolerate stem changes (appren-d- / appre-s-o)
}
function hasVerb(word, text) {
  const t = fold(text);
  if (t.includes(stemOf(word))) return true;
  const forms = formsOf.get(baseOf(word)) || formsOf.get(word);
  if (!forms) return false;
  // imperative + enclitic: astieniti, tieniti, dimmelo
  return t.split(/[^a-z]+/).some(tok => forms.has(tok) ||
    forms.has(tok.replace(/(?:mi|ti|si|ci|vi|lo|la|li|le|ne|gli|melo|telo|glielo)$/, '')));
}

let exCount = 0, stemLacks = 0, noVerbZh = 0;
Object.values(COLL.verbs).forEach(v => {
  if (v.zh) check(CJK.test(v.zh) && !/[A-Za-z]{3,}/.test(v.zh), `collocations ${v.word}: verb zh "${v.zh}"`);
  else noVerbZh++;
  Object.entries(v.keys).forEach(([k, list]) => list.forEach(ex => {
    exCount++;
    check(!/\(\s*=/.test(ex.text), `collocations ${v.word}/${k}: inline note in "${ex.text}"`);
    check(!/\s{2,}/.test(ex.text) && ex.text === ex.text.trim(), `collocations ${v.word}/${k}: stray whitespace in "${ex.text}"`);
    check(CJK.test(ex.zh) && !/[A-Za-z]{4,}/.test(ex.zh.replace(/[（(][^）)]*[)）]/g, '')),
      `collocations ${v.word}/${k}: zh "${ex.zh}" (glued Italian?)`);
    if (!hasVerb(v.word, ex.text) && !STEM_OK.has(`${v.word}|${ex.text}`)) {
      stemLacks++;
      check(false, `collocations ${v.word}/${k}: example lacks the verb: "${ex.text}" (misfiled? else add to STEM_OK)`);
    }
  }));
});
check(exCount >= 3000, `collocations: only ${exCount} examples`);

// --------------------------------------------------------------- grammar
let topics = 0;
GR.tree.parts.forEach(p => p.chapters.forEach(c => c.topics.forEach((t, i) => {
  topics++;
  const body = GR.content[t.slug];
  check(typeof body === 'string', `grammar ${t.slug}: no content`);
  if (typeof body !== 'string') return;
  const m = t.title.match(/^(\d+)．/);
  check(m && +m[1] === i + 1, `grammar ${t.slug}: title "${t.title}" not numbered ${i + 1}`);
  const h = body.match(/^#+\s*(\d+)．/);
  check(h && +h[1] === i + 1, `grammar ${t.slug}: leading header not numbered ${i + 1}`);
  check(body.length >= 400, `grammar ${t.slug}: only ${body.length} chars`);
  check(body.length <= 35000, `grammar ${t.slug}: ${body.length} chars (two topics merged?)`);
})));
check(topics >= 120, `grammar: only ${topics} topics`);

// -------------------------------------------------------------- cognates
const FALSE_FRIENDS = ['camera', 'fattoria', 'fabbrica', 'morbido', 'eventualmente', 'attualmente',
  'magazzino', 'preservativo', 'argomento', 'annoiato', 'firma', 'pretendere', 'caldo', 'rumore',
  'stampa', 'delusione', 'simpatico', 'largo', 'romanzo', 'patente', 'estate', 'noioso', 'cantina',
  'conveniente', 'editore', 'disgrazia', 'lettura', 'cognato', 'sensibile', 'succedere'];
const cog = new Map(COG.entries.map(e => [e.word, e]));
FALSE_FRIENDS.forEach(w => {
  const e = cog.get(w);
  check(e && !!e.falseFriend, `cognates ${w}: missing or not flagged as a false friend`);
});

// ---------------------------------------------------------------- result
if (errors.length) {
  errors.slice(0, +(process.env.MAXERR || 80)).forEach(e => console.log('FAIL ' + e));
  if (errors.length > 80) console.log(`... ${errors.length - 80} more`);
  console.log(`RESULT: FAIL — ${checks - errors.length} passed, ${errors.length} failed`);
  process.exit(1);
}
console.log(`Italian quality OK: ${V.entries.length} words (${fixesChecked} reviewed fixes in effect), ` +
  `${exCount} collocation examples (${noVerbZh} verbs without zh), ${topics} grammar topics — ` +
  `${checks} passed, 0 failed`);
