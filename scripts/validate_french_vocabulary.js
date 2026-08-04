#!/usr/bin/env node
/*
 * Quality gate for the three French vocabulary datasets.
 *
 *   node scripts/validate_french_vocabulary.js
 *
 * Loads each dataset the way the browser does (a bare <script> that declares a
 * top-level const and assigns window.<GLOBAL>), then reports, per dataset:
 *
 *   total entries, entries with a real corpus frequency rank, missing gloss,
 *   missing POS, nouns missing gender, duplicate headwords (accent-aware AND
 *   accent-blind), gloss collisions, parenthetical headwords remaining,
 *   mojibake.
 *
 * Exits non-zero when any hard rule is violated.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const DATASETS = [
  {
    file: 'data/french-vocabulary.js',
    global: 'FRENCH_VOCABULARY_DATA',
    label: 'curriculum',
    required: ['french', 'meaning', 'partOfSpeech', 'level', 'rank', 'source'],
    // 25 multiword locutions + France/après-midi are absent from Lexique.
    minFreqCoverage: 0.9
  },
  {
    file: 'data/french-vocabulary-glossary.js',
    global: 'FRENCH_GLOSSARY_VOCABULARY_DATA',
    label: 'textbook glossary',
    required: ['french', 'meaning', 'partOfSpeech', 'level', 'rank', 'source'],
    minFreqCoverage: 0.9
  },
  {
    file: 'data/french-vocabulary-core.js',
    global: 'FRENCH_CORE_VOCABULARY_DATA',
    label: 'frequency core',
    required: [
      'french', 'meaning', 'english', 'partOfSpeech', 'level', 'levelSource',
      'rank', 'freqRank', 'frequency', 'source', 'glossSource'
    ],
    minFreqCoverage: 1
  }
];

/* ------------------------------------------------------------------ helpers */

const CJK = /[㐀-䶿一-鿿豈-﫿]/;
const LATIN_ACCENT = /[À-ɏ̀-ͯŒœ]/;

// Placeholder / junk glosses.
const PLACEHOLDER = /^(\?+|-+|_+|n\/?a|na|todo|tbd|xxx+|null|none|undefined|\(n\)|\(v\)|\(adj\)|\.+|,+)$/i;

// Mojibake: UTF-8 read as Latin-1 / cp1252, or a replacement char.
const MOJIBAKE = /�|[ÃÂ][-¿]|â€[]|Å[]|ï¿½/;

// A headword must be a spellable French form: no parentheses, no slashes, no
// trailing part-of-speech crumbs.
const PAREN_HEADWORD = /[()\[\]]/;
// Trailing apostrophe is legal: elided forms such as "de l'" are printed that way.
const HEADWORD_SHAPE = /^[a-zà-öø-ÿœæçA-ZÀ-ÖØ-ÞŒÆÇ0-9]+(?:[-' ’][a-zà-öø-ÿœæçA-ZÀ-ÖØ-ÞŒÆÇ0-9]+)*['’]?$/;

function nfc(s) {
  return String(s == null ? '' : s).normalize('NFC');
}

// Accent-aware identity key.
function exactKey(word) {
  return nfc(word).toLowerCase().replace(/’/g, "'").trim();
}

// Accent-blind key: replicates the normaliser french-app.js uses when it merges
// the vocabulary sources, so we can see which pairs it would collapse.
function appKey(word) {
  return nfc(word)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/’/g, "'")
    .trim();
}

// Must stay in sync with gloss_key() in scripts/build_french_vocabulary.py.
function glossKey(gloss) {
  return nfc(gloss).replace(/[\s;；,，、.。…·-]+/g, '');
}

function posFamily(pos) {
  const p = nfc(pos).toLowerCase();
  if (/^n\.?pr/.test(p)) return 'npr';
  if (/^num/.test(p)) return 'num';
  if (/^n/.test(p)) return 'n';
  if (/^(v|aux)/.test(p)) return 'v';
  if (/^adj/.test(p)) return 'adj';
  return p.split(/[^a-z]/)[0] || 'other';
}

function degenerate(s) {
  const t = nfc(s).replace(/\s+/g, '');
  if (t.length < 4) return false;
  // "词词词词" or "abab abab abab"
  if (/(.)\1{3,}/.test(t)) return true;
  const m = t.match(/^(.{2,6}?)\1{2,}$/);
  return Boolean(m);
}

function loadDataset(spec) {
  const abs = path.join(ROOT, spec.file);
  const code = fs.readFileSync(abs, 'utf8');
  const sandbox = { window: {}, module: { exports: {} }, console, __out__: null };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(
    code + `\n;__out__ = typeof ${spec.global} !== 'undefined' ? ${spec.global} : null;`,
    sandbox,
    { filename: spec.file, timeout: 120000 }
  );

  return {
    fromWindow: sandbox.window[spec.global],
    fromExports: sandbox.module.exports,
    fromConst: sandbox.__out__
  };
}

/* -------------------------------------------------------------------- check */

const problems = [];
const report = [];

function fail(msg) {
  problems.push(msg);
}

function checkDataset(spec) {
  const loaded = loadDataset(spec);
  const rows = loaded.fromConst;

  if (!Array.isArray(rows)) {
    fail(`${spec.file}: top-level const ${spec.global} is not an array`);
    return null;
  }
  if (loaded.fromWindow !== rows && !(Array.isArray(loaded.fromWindow) && loaded.fromWindow.length === rows.length)) {
    fail(`${spec.file}: window.${spec.global} does not expose the same array`);
  }
  if (!Array.isArray(loaded.fromExports) || loaded.fromExports.length !== rows.length) {
    fail(`${spec.file}: module.exports does not expose ${spec.global}`);
  }

  const stats = {
    total: rows.length,
    withFreqRank: 0,
    withFrequency: 0,
    withEnglish: 0,
    missingGloss: 0,
    missingPos: 0,
    missingLevel: 0,
    nounsMissingGender: 0,
    dupHeadwordsExact: 0,
    dupHeadwordsAccentBlind: 0,
    glossCollisions: 0,
    parenHeadwords: 0,
    badHeadwordShape: 0,
    mojibake: 0,
    degenerateGloss: 0,
    glossEqualsHeadword: 0,
    missingFields: 0,
    rankEqualsIndex: 0,
    inferredLevel: 0
  };

  const byExact = new Map();
  const byApp = new Map();
  const byGloss = new Map();
  const samples = {};

  function sample(bucket, text) {
    if (!samples[bucket]) samples[bucket] = [];
    if (samples[bucket].length < 6) samples[bucket].push(text);
  }

  rows.forEach((e, i) => {
    if (!e || typeof e !== 'object') {
      fail(`${spec.file}[${i}] is not an object`);
      return;
    }
    for (const f of spec.required) {
      if (!(f in e)) {
        stats.missingFields += 1;
        sample('missingFields', `${e.french || i}: no "${f}"`);
      }
    }

    const word = nfc(e.french);
    const gloss = nfc(e.meaning || e.chinese || '');
    const english = nfc(e.english || '');
    const pos = nfc(e.partOfSpeech || '');

    // --- gloss
    if (!gloss.trim() || PLACEHOLDER.test(gloss.trim())) {
      stats.missingGloss += 1;
      sample('missingGloss', `${word} -> ${JSON.stringify(gloss)}`);
    } else if (!CJK.test(gloss)) {
      stats.missingGloss += 1;
      sample('missingGloss', `${word} -> no CJK: ${JSON.stringify(gloss)}`);
    }
    if (degenerate(gloss)) {
      stats.degenerateGloss += 1;
      sample('degenerateGloss', `${word} -> ${gloss}`);
    }
    if (gloss && exactKey(gloss) === exactKey(word)) {
      stats.glossEqualsHeadword += 1;
      sample('glossEqualsHeadword', word);
    }
    if (e.chinese != null && nfc(e.chinese) !== gloss) {
      fail(`${spec.file}: ${word} has meaning !== chinese`);
    }

    // --- pos / level / gender
    if (!pos.trim()) {
      stats.missingPos += 1;
      sample('missingPos', word);
    }
    if (!nfc(e.level).trim()) {
      stats.missingLevel += 1;
      sample('missingLevel', word);
    }
    if (nfc(e.levelSource) === 'inferred-from-frequency' ||
        /等级由词频推断/.test(nfc(e.source))) {
      stats.inferredLevel += 1;
    }
    const fam = posFamily(pos);
    if (fam === 'n' && !nfc(e.gender).trim()) {
      stats.nounsMissingGender += 1;
      sample('nounsMissingGender', `${word} (${pos})`);
    }
    if (fam !== 'n' && nfc(e.gender).trim() && fam !== 'npr') {
      sample('genderOnNonNoun', `${word} (${pos}) gender=${e.gender}`);
    }

    // --- english
    if (english.trim()) stats.withEnglish += 1;

    // --- frequency
    const fr = e.freqRank;
    if (typeof fr === 'number' && Number.isFinite(fr) && fr > 0) stats.withFreqRank += 1;
    if (typeof e.frequency === 'number' && e.frequency > 0) stats.withFrequency += 1;
    if (typeof fr === 'number' && fr === i + 1) stats.rankEqualsIndex += 1;

    // --- headword shape
    if (PAREN_HEADWORD.test(word)) {
      stats.parenHeadwords += 1;
      sample('parenHeadwords', word);
    }
    if (word && !HEADWORD_SHAPE.test(word)) {
      stats.badHeadwordShape += 1;
      sample('badHeadwordShape', JSON.stringify(word));
    }

    // --- mojibake, anywhere in the record
    for (const [k, v] of Object.entries(e)) {
      if (typeof v === 'string' && MOJIBAKE.test(v)) {
        stats.mojibake += 1;
        sample('mojibake', `${word}.${k} = ${JSON.stringify(v.slice(0, 60))}`);
        break;
      }
    }

    // --- duplicates
    const ek = exactKey(word);
    const ak = appKey(word);
    if (byExact.has(ek)) {
      stats.dupHeadwordsExact += 1;
      sample('dupHeadwordsExact', `${word} (also #${byExact.get(ek)})`);
    } else {
      byExact.set(ek, i);
    }
    if (byApp.has(ak) && byApp.get(ak).key !== ek) {
      stats.dupHeadwordsAccentBlind += 1;
      sample('dupHeadwordsAccentBlind', `${word} ~ ${byApp.get(ak).word}`);
    } else if (!byApp.has(ak)) {
      byApp.set(ak, { key: ek, word });
    }

    const gk = glossKey(gloss);
    if (gk) {
      if (byGloss.has(gk)) {
        stats.glossCollisions += 1;
        sample('glossCollisions', `${word} == ${byGloss.get(gk)} -> ${gloss}`);
      } else {
        byGloss.set(gk, word);
      }
    }
  });

  // ---- hard rules
  const hard = [
    ['missingGloss', 0],
    ['missingPos', 0],
    ['missingLevel', 0],
    ['nounsMissingGender', 0],
    ['dupHeadwordsExact', 0],
    ['glossCollisions', 0],
    ['parenHeadwords', 0],
    ['badHeadwordShape', 0],
    ['mojibake', 0],
    ['degenerateGloss', 0],
    ['glossEqualsHeadword', 0],
    ['missingFields', 0]
  ];
  for (const [k, max] of hard) {
    if (stats[k] > max) {
      fail(`${spec.file}: ${k} = ${stats[k]} (max ${max}) e.g. ${(samples[k] || []).join(' | ')}`);
    }
  }
  const cov = stats.total ? stats.withFreqRank / stats.total : 0;
  if (cov < spec.minFreqCoverage) {
    fail(`${spec.file}: only ${(cov * 100).toFixed(1)}% of entries carry a corpus frequency rank ` +
         `(need ${(spec.minFreqCoverage * 100).toFixed(0)}%)`);
  }
  if (stats.total && stats.rankEqualsIndex === stats.total) {
    fail(`${spec.file}: every freqRank equals its array index + 1 — that is not a corpus rank`);
  }

  report.push({ spec, stats, samples, rows });
  return { spec, stats, samples, rows };
}

/* ---------------------------------------------------------------- run */

const results = DATASETS.map(checkDataset).filter(Boolean);

/*
 * Cross-dataset checks. The app concatenates all three sources and de-duplicates
 * by headword, textbook layer winning. The curriculum and the textbook glossary
 * are expected to overlap (that overlap is the app's existing behaviour and is
 * reported, not failed). The frequency core, however, is a strictly additive
 * layer: it must introduce no headword and no Chinese gloss already used by
 * either textbook layer.
 */
const crossExact = new Map();
const crossApp = new Map();
const crossGloss = new Map();
const cross = {
  totalMerged: 0,
  uniqueHeadwords: 0,
  textbookOverlap: 0,
  coreDupHeadwords: 0,
  coreGlossCollisions: 0,
  dupHeadwordsAccentBlind: 0,
  samples: {}
};
function xsample(bucket, text) {
  if (!cross.samples[bucket]) cross.samples[bucket] = [];
  if (cross.samples[bucket].length < 8) cross.samples[bucket].push(text);
}

for (const r of results) {
  const isCore = r.spec.label === 'frequency core';
  for (const e of r.rows) {
    cross.totalMerged += 1;
    const word = nfc(e.french);
    const ek = exactKey(word);
    const ak = appKey(word);
    const gk = glossKey(nfc(e.meaning || ''));

    if (crossExact.has(ek)) {
      if (isCore) {
        cross.coreDupHeadwords += 1;
        xsample('coreDupHeadwords', `${word} (core vs ${crossExact.get(ek)})`);
      } else {
        cross.textbookOverlap += 1;
        xsample('textbookOverlap', word);
      }
    } else {
      crossExact.set(ek, r.spec.label);
    }

    if (crossApp.has(ak) && crossApp.get(ak).key !== ek) {
      cross.dupHeadwordsAccentBlind += 1;
      xsample('dupHeadwordsAccentBlind', `${word} ~ ${crossApp.get(ak).word}`);
    } else if (!crossApp.has(ak)) {
      crossApp.set(ak, { key: ek, word });
    }

    if (gk) {
      if (crossGloss.has(gk)) {
        if (isCore) {
          cross.coreGlossCollisions += 1;
          xsample('coreGlossCollisions', `${word} == ${crossGloss.get(gk)} -> ${e.meaning}`);
        }
      } else {
        crossGloss.set(gk, word);
      }
    }
  }
}
cross.uniqueHeadwords = crossExact.size;

if (cross.coreDupHeadwords > 0) {
  fail(`merged view: the frequency core repeats ${cross.coreDupHeadwords} textbook headwords ` +
       `e.g. ${(cross.samples.coreDupHeadwords || []).join(' | ')}`);
}
if (cross.coreGlossCollisions > 0) {
  fail(`merged view: the frequency core reuses ${cross.coreGlossCollisions} Chinese glosses ` +
       `already taken by a textbook layer e.g. ${(cross.samples.coreGlossCollisions || []).join(' | ')}`);
}

/* ------------------------------------------------------------------ output */

function pad(s, n) {
  s = String(s);
  return s + ' '.repeat(Math.max(0, n - s.length));
}

console.log('French vocabulary validation');
console.log('='.repeat(78));
for (const { spec, stats, samples } of report) {
  console.log('');
  console.log(`${spec.file}  (${spec.global})  — ${spec.label}`);
  console.log('-'.repeat(78));
  const order = [
    ['total entries', 'total'],
    ['with real corpus frequency rank', 'withFreqRank'],
    ['with corpus frequency value', 'withFrequency'],
    ['with English gloss', 'withEnglish'],
    ['CEFR level inferred from frequency', 'inferredLevel'],
    ['missing / placeholder gloss', 'missingGloss'],
    ['missing part of speech', 'missingPos'],
    ['missing level', 'missingLevel'],
    ['nouns missing gender', 'nounsMissingGender'],
    ['duplicate headwords (accent-aware)', 'dupHeadwordsExact'],
    ['duplicate headwords (accent-blind)', 'dupHeadwordsAccentBlind'],
    ['gloss collisions', 'glossCollisions'],
    ['parenthetical headwords remaining', 'parenHeadwords'],
    ['malformed headwords', 'badHeadwordShape'],
    ['mojibake', 'mojibake'],
    ['degenerate repeated gloss', 'degenerateGloss'],
    ['gloss identical to headword', 'glossEqualsHeadword'],
    ['records missing a required field', 'missingFields']
  ];
  for (const [label, key] of order) {
    console.log(`  ${pad(label, 40)} ${String(stats[key]).padStart(7)}`);
  }
  for (const [k, v] of Object.entries(samples)) {
    if (k === 'genderOnNonNoun' || k === 'dupHeadwordsAccentBlind') {
      console.log(`  note ${k}: ${v.join(' | ')}`);
    }
  }
}

console.log('');
console.log('merged view (what french-app.js concatenates)');
console.log('-'.repeat(78));
console.log(`  ${pad('total records', 40)} ${String(cross.totalMerged).padStart(7)}`);
console.log(`  ${pad('unique headwords after de-dup', 40)} ${String(cross.uniqueHeadwords).padStart(7)}`);
console.log(`  ${pad('curriculum/glossary overlap (expected)', 40)} ${String(cross.textbookOverlap).padStart(7)}`);
console.log(`  ${pad('core repeats a textbook headword', 40)} ${String(cross.coreDupHeadwords).padStart(7)}`);
console.log(`  ${pad('core reuses a textbook gloss', 40)} ${String(cross.coreGlossCollisions).padStart(7)}`);
console.log(`  ${pad('duplicate headwords (accent-blind)', 40)} ${String(cross.dupHeadwordsAccentBlind).padStart(7)}`);
if (cross.samples.dupHeadwordsAccentBlind) {
  console.log(`  note accent-blind pairs: ${cross.samples.dupHeadwordsAccentBlind.join(' | ')}`);
  console.log('       french-app.js currently strips accents when de-duplicating, so it');
  console.log('       would collapse these distinct words. Fix belongs in the consumer.');
}

console.log('');
if (problems.length) {
  console.log(`FAIL — ${problems.length} problem(s):`);
  for (const p of problems) console.log(`  * ${p}`);
  process.exit(1);
}
console.log('PASS — all hard rules satisfied.');
