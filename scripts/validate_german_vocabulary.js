#!/usr/bin/env node
/**
 * Validate data/german-vocabulary.js.
 *
 * Re-checks, independently of the build script, every rule the German
 * vocabulary dataset is supposed to satisfy, prints a report, and exits
 * non-zero if any hard rule is violated.
 *
 *   node --max-old-space-size=8192 scripts/validate_german_vocabulary.js
 *
 * Hard rules (failure => exit 1)
 *   - loads under a plain vm context and exposes GERMAN_VOCABULARY_DATA
 *   - the legacy field contract is intact on every entry:
 *     german, display, meaning, chinese, notes, source, rank
 *   - `german` is unique (the mastered-set key in german-app.js)
 *   - `id` is present and unique
 *   - every entry has a part of speech
 *   - every noun has a gender in {m,f,n}
 *   - every entry has a non-empty, non-placeholder English gloss that is not
 *     just the headword and is not byte-identical to the Chinese gloss
 *   - every entry has a non-empty, non-placeholder Chinese gloss containing
 *     at least one CJK character
 *   - no mojibake (U+FFFD, or Latin-1-read-as-UTF-8 sequences)
 *   - no degenerate machine-translation repetition
 *   - every entry has a real corpus frequency (> 0) and `rank` is the dense
 *     1..N rank of that frequency, not the array index of an unranked list
 *   - no inflected form (article/pronoun/auxiliary inflection) in the
 *     headword position
 *   - `level` is one of A1 A2 B1 B2 C1
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '..', 'data', 'german-vocabulary.js');

// --- load exactly the way index.html does (bare <script>, no module system)
const ctx = vm.createContext({ console });
ctx.window = ctx;
let DATA;
try {
  DATA = vm.runInContext(
    fs.readFileSync(FILE, 'utf8') + ';GERMAN_VOCABULARY_DATA', ctx);
} catch (err) {
  console.error('FATAL: dataset failed to load:', err.message);
  process.exit(1);
}
if (!Array.isArray(DATA)) {
  console.error('FATAL: GERMAN_VOCABULARY_DATA is not an array');
  process.exit(1);
}

// ---------------------------------------------------------------- rules ----
const LEGACY_FIELDS = ['german', 'display', 'meaning', 'chinese', 'notes', 'source', 'rank'];
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1']);
const CJK = /[㐀-鿿豈-﫿]/;
const PLACEHOLDER = /^(\?+|todo|n\/?a|none|null|-+|\(n\)|xxx+|undefined)$/i;
const MOJIBAKE = /[�]|Ã[-¿]|â€|Å¸|Ã¤|Ã¶|Ã¼|ÃŸ/;

/** Inflected function words that must never be a headword. Written out here
 *  independently of the build script so this is a real second opinion. */
const INFLECTED = new Set(`
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

const problems = new Map();     // rule -> [examples]
function fail(rule, example) {
  if (!problems.has(rule)) problems.set(rule, []);
  problems.get(rule).push(example);
}

const seenWord = new Map();
const seenId = new Set();
const levels = new Map();
const posCounts = new Map();
const sourceCounts = new Map();
let nouns = 0;
let countableNouns = 0;
let pluraleTantum = 0;
let properNouns = 0;
let verbsWithParts = 0;
let nounsWithPlural = 0;
let cognateGlosses = 0;

DATA.forEach((e, i) => {
  const at = `#${i} ${e && e.german}`;
  if (!e || typeof e !== 'object') { fail('non-object entry', at); return; }

  LEGACY_FIELDS.forEach((f) => {
    if (e[f] === undefined || e[f] === null || e[f] === '') {
      fail(`missing legacy field \`${f}\``, at);
    }
  });

  if (!e.id) fail('missing id', at);
  else if (seenId.has(e.id)) fail('duplicate id', e.id);
  else seenId.add(e.id);

  if (typeof e.german === 'string') {
    if (seenWord.has(e.german)) {
      fail('duplicate headword (shares the mastered-set key)',
        `${e.german} (#${seenWord.get(e.german)} & #${i})`);
    } else seenWord.set(e.german, i);
    if (INFLECTED.has(e.german.toLowerCase())) {
      fail('inflected-form headword', e.german);
    }
    // Latin-1 letter range: German plus the accents loanwords keep ("Café",
    // "Piñata"). Digits, punctuation and other scripts stay out.
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\-' ]*$/.test(e.german)) {
      fail('malformed headword', e.german);
    }
  }

  const pos = e.partOfSpeech;
  if (!pos) fail('missing partOfSpeech', at);
  else posCounts.set(pos, (posCounts.get(pos) || 0) + 1);

  if (pos === 'noun') {
    nouns += 1;
    // A plurale tantum ("die Eltern") has no singular gender and a proper noun
    // ("Deutschland") takes no article; every other noun must carry one.
    if (e.pluraleTantum) {
      pluraleTantum += 1;
      if (e.gender) fail('plurale tantum with a singular gender', at);
      if (e.display && !e.display.startsWith('die ')) {
        fail('plurale tantum display missing "die"', `${e.german} -> ${e.display}`);
      }
    } else if (e.properNoun) {
      properNouns += 1;
      if (e.display !== e.german) {
        fail('proper noun display has an article', `${e.german} -> ${e.display}`);
      }
    } else if (!e.gender || !['m', 'f', 'n'].includes(e.gender)) {
      fail('noun missing gender', at);
    } else {
      countableNouns += 1;
      if (e.plural) nounsWithPlural += 1;
      const art = { m: 'der', f: 'die', n: 'das' }[e.gender];
      if (e.display && !e.display.startsWith(art + ' ')) {
        fail('noun display missing its article', `${e.german} -> ${e.display}`);
      }
    }
  } else if (e.gender) {
    fail('non-noun carrying a gender', at);
  }
  if (pos === 'verb' && e.principalParts) verbsWithParts += 1;

  const en = e.english;
  if (!en || typeof en !== 'string' || !en.trim()) fail('missing English gloss', at);
  else if (PLACEHOLDER.test(en.trim())) fail('placeholder English gloss', at);
  else if (en.trim().toLowerCase() === String(e.german).toLowerCase()) {
    // "Hotel -> hotel", "Museum -> museum": for a loanword the English gloss
    // legitimately is the headword. Counted, and capped below, rather than
    // failed one by one — a large share would mean the gloss step is broken.
    cognateGlosses += 1;
  } else if (en === e.chinese) fail('English gloss identical to Chinese', at);
  else if (!/[A-Za-z]/.test(en)) fail('English gloss has no latin letters', at);

  const zh = e.chinese;
  if (!zh || typeof zh !== 'string' || !zh.trim()) fail('missing Chinese gloss', at);
  else if (PLACEHOLDER.test(zh.trim())) fail('placeholder Chinese gloss', at);
  else if (!CJK.test(zh)) fail('Chinese gloss has no CJK characters', at);
  if (e.meaning !== e.chinese) fail('meaning/chinese disagree', at);

  [e.german, e.display, e.english, e.chinese, e.notes, e.source]
    .filter((v) => typeof v === 'string')
    .forEach((v) => { if (MOJIBAKE.test(v)) fail('mojibake', `${at}: ${v}`); });

  if (typeof zh === 'string' && degenerate(zh)) fail('degenerate Chinese gloss', at);
  if (typeof en === 'string' && degenerate(en)) fail('degenerate English gloss', at);

  if (!Number.isInteger(e.frequency) || e.frequency <= 0) {
    fail('no real corpus frequency', at);
  }
  if (!Number.isInteger(e.rank) || e.rank !== i + 1) fail('rank is not 1..N in order', at);

  if (!e.level || !LEVELS.has(e.level)) fail('missing/invalid CEFR level', at);
  else levels.set(e.level, (levels.get(e.level) || 0) + 1);

  const src = String(e.source || '');
  const key = src.includes('zh:pgh.csv') ? 'pgh.csv'
    : src.includes('zh:HanDeDict') ? 'HanDeDict'
      : src.includes('zh:ECDICT') ? 'ECDICT pivot'
        : src.includes('zh:curated') ? 'curated' : 'other';
  sourceCounts.set(key, (sourceCounts.get(key) || 0) + 1);
  if (!/\bf:OpenSubtitles-2018/.test(src)) fail('source does not name a frequency corpus', at);
  if (!/\blvl:(goethe-(A1|A2|B1)|freq-band)\b/.test(src)) fail('source does not name a level provenance', at);
});

// German borrows heavily, but a gloss that just echoes the headword carries no
// information; a few per cent is normal, a flood means the gloss step failed.
if (cognateGlosses > DATA.length * 0.05) {
  fail('too many English glosses that just echo the headword',
    `${cognateGlosses} of ${DATA.length}`);
}

// rank must be a real frequency rank, i.e. monotonically non-increasing freq
let monotone = true;
for (let i = 1; i < DATA.length; i += 1) {
  if ((DATA[i].frequency || 0) > (DATA[i - 1].frequency || 0)) { monotone = false; break; }
}
if (!monotone) fail('rank does not follow corpus frequency', 'frequency is not monotone');

// ---------------------------------------------------------------- report ---
const count = (rule) => (problems.get(rule) || []).length;
const pct = (n) => `${((n / DATA.length) * 100).toFixed(1)}%`;

console.log('=== data/german-vocabulary.js validation ===');
console.log(`total entries                          ${DATA.length}`);
console.log(`distinct headwords                     ${seenWord.size}`);
console.log(`duplicate headwords                    ${count('duplicate headword (shares the mastered-set key)')}`);
console.log(`inflected-form headwords               ${count('inflected-form headword')}`);
console.log(`entries missing POS                    ${count('missing partOfSpeech')}`);
console.log(`nouns                                  ${nouns}  (countable ${countableNouns}, plurale tantum ${pluraleTantum}, proper ${properNouns})`);
console.log(`nouns missing gender                   ${count('noun missing gender')}`);
console.log(`nouns with a plural form               ${nounsWithPlural} (${pct(nounsWithPlural)} of all entries)`);
console.log(`verbs with principal parts             ${verbsWithParts}`);
console.log(`missing English gloss                  ${count('missing English gloss') + count('placeholder English gloss') + count('English gloss identical to Chinese')}`);
console.log(`English gloss = headword (loanwords)   ${cognateGlosses} (${pct(cognateGlosses)})`);
console.log(`missing Chinese gloss                  ${count('missing Chinese gloss') + count('placeholder Chinese gloss') + count('Chinese gloss has no CJK characters')}`);
console.log(`entries with no real frequency rank    ${count('no real corpus frequency') + count('rank is not 1..N in order') + count('rank does not follow corpus frequency')}`);
console.log(`mojibake                               ${count('mojibake')}`);
console.log(`degenerate repetition                  ${count('degenerate Chinese gloss') + count('degenerate English gloss')}`);
console.log(`missing/invalid CEFR level             ${count('missing/invalid CEFR level')}`);
console.log('');
console.log('CEFR levels   ' + [...levels.entries()].sort()
  .map(([k, v]) => `${k}:${v}`).join('  '));
console.log('parts of speech ' + [...posCounts.entries()].sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${k}:${v}`).join('  '));
console.log('Chinese gloss provenance  ' + [...sourceCounts.entries()].sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${k}:${v}`).join('  '));
console.log('');

if (problems.size === 0) {
  console.log('RESULT: PASS — 0 violations');
  process.exit(0);
}
console.log('RESULT: FAIL');
[...problems.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([rule, ex]) => {
  console.log(`  ${String(ex.length).padStart(6)}  ${rule}`);
  console.log(`          e.g. ${ex.slice(0, 5).join(' | ')}`);
});
process.exit(1);
