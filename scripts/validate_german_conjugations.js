#!/usr/bin/env node
/**
 * Validator for data/german-conjugations.js.
 *
 *   node scripts/validate_german_conjugations.js
 *
 * Exits non-zero on the first category that fails.  Checks, in order:
 *
 *   1. shape        - schema of every entry and every tense block
 *   2. glosses      - non-empty, non-placeholder English + Chinese
 *   3. ranking      - contiguous ranks, no duplicates
 *   4. konjunktiv2  - real synthetic forms, no all-persons-identical block,
 *                     würde only where the synthetic form is homophonous with
 *                     the Präteritum, hätte/wäre (never würde) in the perfect
 *   5. imperative   - no unlicensed umlaut, no truncated sibilant stem,
 *                     no imperative for preterite-present verbs, known forms
 *   6. participles  - Partizip II shape per verb class
 *   7. separables   - Satzklammer split in main clauses, joined everywhere else
 *   8. auxiliary    - haben/sein consistent with the compound tenses
 */

'use strict';

// conjugations/1 is read back into the per-verb legacy view (old person keys,
// single forms as arrays, x fields spread onto the entry); see conjugations_node.js.
const { loadConjugations, toLegacy } = require('./conjugations_node');
const DATA = toLegacy(loadConjugations('de'), ['ich', 'du', 'er_sie_es', 'wir', 'ihr', 'sie'], { omitted: 'drop' })
  .map((entry) => ({ separable: false, ...entry }));

const PERSONS = ['ich', 'du', 'er_sie_es', 'wir', 'ihr', 'sie'];
const IMPERATIVE_PERSONS = ['du', 'wir', 'ihr', 'sie'];
const REQUIRED_TENSES = [
  'indikativ_praesens',
  'indikativ_praeteritum',
  'indikativ_perfekt',
  'indikativ_plusquamperfekt',
  'indikativ_futur_i',
  'indikativ_futur_ii',
  'konjunktiv_i',
  'konjunktiv_i_perfekt',
  'konjunktiv_ii',
  'konjunktiv_ii_perfekt',
  'partizip_i',
  'partizip_ii',
  'infinitiv',
  'zu_infinitiv',
];
const VERB_CLASSES = new Set(['weak', 'strong', 'mixed', 'irregular', 'preterite-present']);
const KII_TYPES = new Set(['synthetic', 'both', 'wuerde']);
const PLACEHOLDERS = new Set([
  '', '-', '--', '?', '??', '???', 'n/a', 'na', 'none', 'null', 'undefined', 'nan',
  'todo', 'tbd', 'fixme', 'xxx', 'placeholder', 'unknown',
]);
const BAD_TOKEN = /(?:^|[\s/])(?:none|null|undefined|nan|nil|todo)(?:$|[\s/])/i;
const CJK = /[一-鿿]/;
const UMLAUT = /[äöüÄÖÜ]/g;
const PRETERITE_PRESENT = new Set([
  'können', 'müssen', 'dürfen', 'mögen', 'wollen', 'sollen', 'wissen',
]);
const MODALS = new Set(['können', 'müssen', 'dürfen', 'mögen', 'wollen', 'sollen']);

/* Audit finding de-konjunktiv2-always-wuerde: these synthetic Konjunktiv II
 * forms are what a native speaker actually says; würde + Infinitiv is wrong or
 * markedly worse for all of them. */
const KONJUNKTIV_II_EXPECTED = {
  sein: 'wäre', haben: 'hätte', werden: 'würde', können: 'könnte', müssen: 'müsste',
  sollen: 'sollte', wollen: 'wollte', dürfen: 'dürfte', mögen: 'möchte', wissen: 'wüsste',
  gehen: 'ginge', kommen: 'käme', geben: 'gäbe', nehmen: 'nähme', bleiben: 'bliebe',
  bringen: 'brächte', denken: 'dächte', lassen: 'ließe', tun: 'täte', finden: 'fände',
  sehen: 'sähe', stehen: 'stünde', liegen: 'läge', halten: 'hielte', fahren: 'führe',
  lesen: 'läse', essen: 'äße', sprechen: 'spräche', schreiben: 'schriebe',
  heißen: 'hieße', ziehen: 'zöge', laufen: 'liefe', fallen: 'fiele', tragen: 'trüge',
  schlafen: 'schliefe', helfen: 'hülfe', treffen: 'träfe', rufen: 'riefe',
  sitzen: 'säße', trinken: 'tränke', schließen: 'schlösse', beginnen: 'begänne',
};

/* Audit finding de-imperative-derivation-bugs: every one of these was
 * mis-derived by the previous generator (spurious umlaut, truncated stem, or an
 * imperative invented for a preterite-present verb). */
const IMPERATIVE_EXPECTED = {
  sein: 'sei', haben: 'hab', werden: 'werde', wissen: 'wisse',
  fahren: 'fahr', laufen: 'lauf', tragen: 'trag', schlafen: 'schlaf',
  halten: 'halt', fallen: 'fall', waschen: 'wasch', schlagen: 'schlag',
  raten: 'rat', braten: 'brat', graben: 'grab', lassen: 'lass',
  essen: 'iss', vergessen: 'vergiss', messen: 'miss', fressen: 'friss',
  lesen: 'lies', vorlesen: 'lies vor', sehen: 'sieh', geschehen: 'geschieh',
  geben: 'gib', nehmen: 'nimm', treffen: 'triff', helfen: 'hilf',
  sprechen: 'sprich', brechen: 'brich', stehlen: 'stiehl', werfen: 'wirf',
  gelten: 'gilt', treten: 'tritt', gehen: 'geh', kommen: 'komm',
  stehen: 'steh', tun: 'tu', aufstehen: 'steh auf', anfangen: 'fang an',
  mitkommen: 'komm mit', teilnehmen: 'nimm teil', anrufen: 'ruf an',
  aufhören: 'hör auf', zuhören: 'hör zu', ausgeben: 'gib aus',
};

const failures = [];
let checks = 0;

function check(ok, category, message) {
  checks += 1;
  if (!ok) failures.push(`[${category}] ${message}`);
}

function firstAlternative(value) {
  return String(value).split(' / ')[0].trim();
}

function alternatives(value) {
  return String(value)
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** ß/ss spelling reform equivalence */
function ss(word) {
  return String(word).replace(/ß/g, 'ss');
}

function stripPrefix(entry, form) {
  if (!entry.separable) return form;
  const joined = entry.separablePrefix || '';
  return form.startsWith(joined) ? form.slice(joined.length) : form;
}

/** trailing run of sibilants, ignoring one imperative -e ("grüße" -> "ß") */
function sibilantTail(word) {
  let w = word;
  if (w.endsWith('e')) w = w.slice(0, -1);
  const m = w.match(/[sßz]+$/);
  return m ? m[0].replace(/ß/g, 'ss').length : 0;
}

// --------------------------------------------------------------------------
// 1. shape
// --------------------------------------------------------------------------
check(Array.isArray(DATA), 'shape', 'DIM_DATA.conjugations.de did not load');
check(DATA.length > 0, 'shape', 'dataset is empty');

for (const entry of DATA) {
  const id = entry && entry.infinitive ? entry.infinitive : JSON.stringify(entry);
  check(typeof entry.infinitive === 'string' && /^[a-zäöüß]+$/.test(entry.infinitive),
    'shape', `${id}: infinitive is not a lower-case German word`);
  check(Number.isInteger(entry.rank) && entry.rank > 0, 'shape', `${id}: bad rank`);
  check(entry.freq === null || (typeof entry.freq === 'number' && entry.freq > 0),
    'shape', `${id}: bad freq`);
  check(VERB_CLASSES.has(entry.verbClass), 'shape', `${id}: verbClass=${entry.verbClass}`);
  check(KII_TYPES.has(entry.konjunktivIiType),
    'shape', `${id}: konjunktivIiType=${entry.konjunktivIiType}`);
  check(typeof entry.separable === 'boolean', 'shape', `${id}: separable is not a boolean`);
  check(Array.isArray(entry.auxiliary) && entry.auxiliary.length > 0
    && entry.auxiliary.every((a) => a === 'haben' || a === 'sein'),
  'shape', `${id}: auxiliary=${JSON.stringify(entry.auxiliary)}`);
  check(entry.tenses && typeof entry.tenses === 'object', 'shape', `${id}: no tenses`);

  for (const key of REQUIRED_TENSES) {
    check(Boolean(entry.tenses[key]), 'shape', `${id}: missing tense ${key}`);
  }
  for (const [key, block] of Object.entries(entry.tenses || {})) {
    check(block && (block.type === 'person' || block.type === 'single'),
      'shape', `${id}.${key}: bad type`);
    check(typeof block.group_label === 'string' && block.group_label.length > 0,
      'shape', `${id}.${key}: missing group_label`);
    check(typeof block.tense_label === 'string' && block.tense_label.length > 0,
      'shape', `${id}.${key}: missing tense_label`);
    if (block.type === 'person') {
      const expected = key === 'imperativ' ? IMPERATIVE_PERSONS : PERSONS;
      check(JSON.stringify(Object.keys(block.forms)) === JSON.stringify(expected),
        'shape', `${id}.${key}: persons=${Object.keys(block.forms)}`);
      for (const [person, form] of Object.entries(block.forms)) {
        check(typeof form === 'string' && form.trim().length > 0,
          'shape', `${id}.${key}.${person}: empty form`);
        check(!BAD_TOKEN.test(` ${form} `), 'shape', `${id}.${key}.${person}: "${form}"`);
        check(!/\/\s*\/|^\s*\/|\/\s*$/.test(form),
          'shape', `${id}.${key}.${person}: empty alternative in "${form}"`);
        check(!/\s\s|^\s|\s$/.test(form),
          'shape', `${id}.${key}.${person}: stray whitespace in "${form}"`);
      }
    } else {
      check(Array.isArray(block.forms) && block.forms.length > 0,
        'shape', `${id}.${key}: forms is not a non-empty array`);
      for (const form of block.forms || []) {
        check(typeof form === 'string' && form.trim().length > 0,
          'shape', `${id}.${key}: empty form`);
        check(!BAD_TOKEN.test(` ${form} `), 'shape', `${id}.${key}: "${form}"`);
      }
    }
  }
}

// --------------------------------------------------------------------------
// 2. glosses
// --------------------------------------------------------------------------
for (const entry of DATA) {
  const id = entry.infinitive;
  const en = String(entry.english || '').trim();
  const zh = String(entry.chinese || '').trim();
  check(en.length > 0 && !PLACEHOLDERS.has(en.toLowerCase()),
    'glosses', `${id}: english="${en}"`);
  check(zh.length > 0 && !PLACEHOLDERS.has(zh.toLowerCase()),
    'glosses', `${id}: chinese="${zh}"`);
  check(CJK.test(zh), 'glosses', `${id}: chinese has no CJK: "${zh}"`);
  check(en.toLowerCase().replace(/^to\s+/, '') !== id, 'glosses', `${id}: gloss is the headword`);
  check(!/�/.test(`${en}${zh}`), 'glosses', `${id}: replacement character in gloss`);
  check(!/(\b\w+\b)(?:[\s,;]+\1){2,}/i.test(en), 'glosses', `${id}: degenerate english "${en}"`);
  check(!/^(?:n|vt|vi|v|adj|adv|prep|pron|conj)\./i.test(zh),
    'glosses', `${id}: dictionary POS marker leaked into chinese "${zh}"`);
  check(en.length <= 90, 'glosses', `${id}: english gloss too long (${en.length})`);
}

// --------------------------------------------------------------------------
// 3. ranking
// --------------------------------------------------------------------------
const seen = new Set();
DATA.forEach((entry, index) => {
  check(entry.rank === index + 1, 'ranking', `${entry.infinitive}: rank ${entry.rank} at index ${index}`);
  check(!seen.has(entry.infinitive), 'ranking', `${entry.infinitive}: duplicate entry`);
  seen.add(entry.infinitive);
});

// --------------------------------------------------------------------------
// 4. Konjunktiv II
// --------------------------------------------------------------------------
for (const entry of DATA) {
  const id = entry.infinitive;
  const kii = entry.tenses.konjunktiv_ii.forms;
  const pret = entry.tenses.indikativ_praeteritum.forms;

  const distinct = new Set(PERSONS.map((p) => kii[p]));
  check(distinct.size >= 3,
    'konjunktiv2', `${id}: Konjunktiv II has only ${distinct.size} distinct forms across persons`);

  const allWuerde = PERSONS.every((p) => /^würd/.test(firstAlternative(kii[p])));
  if (entry.konjunktivIiType === 'wuerde') {
    check(allWuerde, 'konjunktiv2', `${id}: typed "wuerde" but forms are not würde + Infinitiv`);
    // würde is only legitimate where the synthetic form is homophonous with the
    // Präteritum, i.e. where a native speaker really does say würde; the
    // synthetic paradigm has to be kept on the entry to prove it.
    const rare = entry.konjunktivIiSynthetischSelten;
    check(Boolean(rare), 'konjunktiv2', `${id}: würde verb without konjunktivIiSynthetischSelten`);
    if (rare) {
      check(PERSONS.every((p) => ss(firstAlternative(rare[p])) === ss(firstAlternative(pret[p]))),
        'konjunktiv2', `${id}: reduced to würde although the synthetic form "${rare.ich}" differs from the Präteritum "${pret.ich}"`);
    }
  } else if (id !== 'werden' && entry.separableBase !== 'werden') {
    // "würde" *is* the synthetic Konjunktiv II of werden (and of loswerden).
    check(!allWuerde,
      'konjunktiv2', `${id}: typed "${entry.konjunktivIiType}" but every person is würde + Infinitiv`);
    for (const person of PERSONS) {
      check(!/^würd/.test(firstAlternative(kii[person])),
        'konjunktiv2', `${id}.${person}: leading alternative is würde, not the synthetic form`);
    }
    // Strong verbs share wir/sie (and often du/ihr) with the Präteritum - that
    // is correct German - but the paradigm as a whole must not be identical to
    // it, or the "synthetic" form is really just the Präteritum.
    if (entry.konjunktivIiType === 'both') {
      check(PERSONS.some((p) => firstAlternative(kii[p]) !== firstAlternative(pret[p])),
        'konjunktiv2', `${id}: Konjunktiv II is identical to the Präteritum in every person`);
    }
  }

  const kiiPerfect = entry.tenses.konjunktiv_ii_perfekt.forms;
  for (const person of PERSONS) {
    check(/^(hätte|wäre|hätt|wär)/.test(firstAlternative(kiiPerfect[person])),
      'konjunktiv2', `${id}.${person}: Konjunktiv II Perfekt is "${kiiPerfect[person]}", expected hätte/wäre`);
  }
}

for (const [lemma, expected] of Object.entries(KONJUNKTIV_II_EXPECTED)) {
  const entry = DATA.find((v) => v.infinitive === lemma);
  if (!entry) {
    check(false, 'konjunktiv2', `${lemma}: missing from the dataset`);
    continue;
  }
  const got = alternatives(entry.tenses.konjunktiv_ii.forms.ich).map((s) => s.split(' ')[0]);
  check(got.includes(expected),
    'konjunktiv2', `${lemma}: Konjunktiv II ich = "${entry.tenses.konjunktiv_ii.forms.ich}", expected "${expected}"`);
}

// --------------------------------------------------------------------------
// 5. imperative
// --------------------------------------------------------------------------
for (const entry of DATA) {
  const id = entry.infinitive;
  const block = entry.tenses.imperativ && entry.tenses.imperativ.forms;

  if (MODALS.has(id)) {
    check(!block, 'imperative', `${id}: modal verbs have no imperative`);
    continue;
  }
  if (!block) {
    // wissen has one ("wisse"); the other preterite-presents do not.
    check(entry.verbClass === 'preterite-present',
      'imperative', `${id}: missing imperative`);
    continue;
  }

  const stem = (entry.separableBase || id).replace(/e?n$/, '');
  const stemUmlauts = (stem.match(UMLAUT) || []).length;

  for (const form of alternatives(block.du)) {
    const core = stripPrefix(entry, form.split(' ')[0]);
    // (a) no umlaut the infinitive does not license: "fähr", "läuf", "träg"
    check((core.match(UMLAUT) || []).length <= stemUmlauts,
      'imperative', `${id}: du-imperative "${form}" has an umlaut the stem does not license`);
    // (b) no truncated sibilant stem: "is" for "iss", "lie" for "lies"
    check(sibilantTail(core) >= sibilantTail(stem),
      'imperative', `${id}: du-imperative "${form}" truncates the sibilant stem of "${stem}"`);
    // (c) not shorter than the stem beyond the one vowel/-e alternation
    check(core.length >= stem.length - 1,
      'imperative', `${id}: du-imperative "${form}" is shorter than the stem "${stem}"`);
    check(!/\d/.test(form), 'imperative', `${id}: digit in imperative "${form}"`);
  }

  // ihr/wir/Sie must stay finite plural forms
  check(/[tdn]$/.test(block.ihr.split(' ')[0]),
    'imperative', `${id}: ihr-imperative "${block.ihr}" is not a finite plural form`);
  check(/\bwir\b/.test(block.wir), 'imperative', `${id}: wir-imperative "${block.wir}" lacks the pronoun`);
  check(/\bSie\b/.test(block.sie), 'imperative', `${id}: Sie-imperative "${block.sie}" lacks the pronoun`);
  if (entry.separable) {
    const display = entry.separablePrefixDisplay;
    check(firstAlternative(block.du).endsWith(` ${display}`),
      'imperative', `${id}: du-imperative "${block.du}" does not split off "${display}"`);
    check(block.ihr.endsWith(` ${display}`),
      'imperative', `${id}: ihr-imperative "${block.ihr}" does not split off "${display}"`);
    check(block.wir.endsWith(` ${display}`),
      'imperative', `${id}: wir-imperative "${block.wir}" does not split off "${display}"`);
    check(block.sie.endsWith(` ${display}`),
      'imperative', `${id}: Sie-imperative "${block.sie}" does not split off "${display}"`);
  }
}

for (const [lemma, expected] of Object.entries(IMPERATIVE_EXPECTED)) {
  const entry = DATA.find((v) => v.infinitive === lemma);
  if (!entry) {
    check(false, 'imperative', `${lemma}: missing from the dataset`);
    continue;
  }
  const actual = entry.tenses.imperativ.forms.du;
  check(alternatives(actual).includes(expected),
    'imperative', `${lemma}: du-imperative = "${actual}", expected "${expected}"`);
}

// --------------------------------------------------------------------------
// 6. participles
// --------------------------------------------------------------------------
for (const entry of DATA) {
  const id = entry.infinitive;
  const pii = entry.tenses.partizip_ii.forms[0];
  const pi = entry.tenses.partizip_i.forms[0];
  check(/^[a-zäöüß]+$/.test(pii), 'participles', `${id}: Partizip II "${pii}" is not a single word`);
  check(pi.endsWith('d'), 'participles', `${id}: Partizip I "${pi}" does not end in -d`);
  if (entry.verbClass === 'strong') {
    check(/en$/.test(pii), 'participles', `${id}: strong Partizip II "${pii}" does not end in -en`);
  } else if (entry.verbClass === 'weak' || entry.verbClass === 'mixed') {
    check(/t$/.test(pii), 'participles', `${id}: ${entry.verbClass} Partizip II "${pii}" does not end in -t`);
  }
  if (entry.separable) {
    check(pii.startsWith(entry.separablePrefix),
      'participles', `${id}: Partizip II "${pii}" does not start with "${entry.separablePrefix}"`);
    // A separable prefix takes the ge- infix unless the base itself carries an
    // unstressed inseparable prefix ("vorbereitet", "anerkannt") or is a
    // -ieren verb ("ausprobiert").
    const unstressed = /^(be|emp|ent|er|ge|miss|ver|zer)/.test(entry.separableBase)
      || /ieren$/.test(entry.separableBase);
    check(unstressed || pii.includes('ge'),
      'participles', `${id}: separable Partizip II "${pii}" has no ge- infix`);
  }
}

// --------------------------------------------------------------------------
// 7. separables
// --------------------------------------------------------------------------
for (const entry of DATA) {
  const id = entry.infinitive;
  const zu = entry.tenses.zu_infinitiv.forms[0];
  if (!entry.separable) {
    check(zu === `zu ${id}`, 'separables', `${id}: zu-infinitive "${zu}"`);
    check(!entry.tenses.indikativ_praesens_nebensatz,
      'separables', `${id}: non-separable verb has a Nebensatz table`);
    for (const person of PERSONS) {
      const forms = entry.tenses.indikativ_praesens.forms[person];
      check(alternatives(forms).every((f) => !/\s/.test(f)),
        'separables', `${id}.${person}: simplex present "${forms}" is split`);
    }
    continue;
  }

  const prefix = entry.separablePrefix;
  const display = entry.separablePrefixDisplay;
  const base = entry.separableBase;
  check(Boolean(prefix && display && base), 'separables', `${id}: incomplete separable metadata`);
  check(id === `${prefix}${base}`, 'separables', `${id}: prefix+base = "${prefix}${base}"`);
  check(zu === `${prefix}zu${base}`, 'separables', `${id}: zu-infinitive "${zu}" is not "${prefix}zu${base}"`);
  check(!/\s/.test(zu), 'separables', `${id}: zu-infinitive "${zu}" is split`);

  const nebensatz = entry.tenses.indikativ_praesens_nebensatz;
  check(Boolean(nebensatz), 'separables', `${id}: separable verb has no Nebensatz table`);
  for (const person of PERSONS) {
    // A few verbs have both a separable and an inseparable reading
    // ("erkenne an / anerkenne"); the separable one must lead.
    const main = firstAlternative(entry.tenses.indikativ_praesens.forms[person]);
    check(main.endsWith(` ${display}`),
      'separables', `${id}.${person}: main-clause present "${main}" does not end in "${display}"`);
    if (nebensatz) {
      const sub = firstAlternative(nebensatz.forms[person]);
      check(!/\s/.test(sub), 'separables', `${id}.${person}: Nebensatz form "${sub}" is split`);
      check(sub.startsWith(prefix),
        'separables', `${id}.${person}: Nebensatz form "${sub}" does not start with "${prefix}"`);
    }
    const pret = firstAlternative(entry.tenses.indikativ_praeteritum.forms[person]);
    check(pret.endsWith(` ${display}`),
      'separables', `${id}.${person}: main-clause Präteritum "${pret}" does not end in "${display}"`);
    // compound tenses put the whole verb at the end, joined
    check(!entry.tenses.indikativ_perfekt.forms[person].endsWith(` ${display}`),
      'separables', `${id}.${person}: Perfekt "${entry.tenses.indikativ_perfekt.forms[person]}" is split`);
  }
}

// --------------------------------------------------------------------------
// 8. auxiliary
// --------------------------------------------------------------------------
const HABEN_PRESENT = { ich: 'habe', du: 'hast', er_sie_es: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben' };
const SEIN_PRESENT = { ich: 'bin', du: 'bist', er_sie_es: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind' };
for (const entry of DATA) {
  const id = entry.infinitive;
  const piis = entry.tenses.partizip_ii.forms;
  const tables = entry.auxiliary.map((aux) => (aux === 'sein' ? SEIN_PRESENT : HABEN_PRESENT));
  // The Perfekt is the full cross product of auxiliary x Partizip II, in that
  // order; a verb never carries two auxiliaries AND two participles.
  const expected = [];
  for (const pii of piis) for (const table of tables) expected.push({ table, pii });
  check(!(piis.length > 1 && tables.length > 1),
    'auxiliary', `${id}: ${piis.length} participles x ${tables.length} auxiliaries would be unreadable`);
  for (const person of PERSONS) {
    const got = alternatives(entry.tenses.indikativ_perfekt.forms[person]);
    check(got.length === expected.length,
      'auxiliary', `${id}.${person}: ${got.length} Perfekt alternatives for ${entry.auxiliary.length} auxiliaries x ${piis.length} participles`);
    expected.forEach(({ table, pii }, i) => {
      check(got[i] === `${table[person]} ${pii}`,
        'auxiliary', `${id}.${person}: Perfekt "${got[i]}" != "${table[person]} ${pii}"`);
    });
  }
}

// --------------------------------------------------------------------------
const byCategory = {};
for (const failure of failures) {
  const category = failure.slice(1, failure.indexOf(']'));
  byCategory[category] = (byCategory[category] || 0) + 1;
}

console.log(`validate_german_conjugations: ${DATA.length} verbs, ${checks} assertions`);
console.log(`  separable: ${DATA.filter((v) => v.separable).length}`);
console.log(`  konjunktivIiType: ${JSON.stringify(
  DATA.reduce((acc, v) => ((acc[v.konjunktivIiType] = (acc[v.konjunktivIiType] || 0) + 1), acc), {}))}`);
console.log(`  verbClass: ${JSON.stringify(
  DATA.reduce((acc, v) => ((acc[v.verbClass] = (acc[v.verbClass] || 0) + 1), acc), {}))}`);

if (failures.length === 0) {
  console.log('OK: all assertions passed');
  process.exit(0);
}
const limit = process.env.VERBOSE ? failures.length : 60;
console.error(`FAILED: ${failures.length} assertion(s) ${JSON.stringify(byCategory)}`);
for (const failure of failures.slice(0, limit)) console.error(`  ${failure}`);
if (failures.length > limit) console.error(`  ... and ${failures.length - limit} more (set VERBOSE=1)`);
process.exit(1);
