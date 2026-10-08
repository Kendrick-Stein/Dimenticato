'use strict';
/*
 * Node-side reader for conjugations/1 data files (docs/data-schema.md).
 *
 *   loadConjugations(code[, file]) -> {meta, persons, tenses, verbs}
 *   toLegacy(data, personKeys[, opts]) -> [{infinitive, chinese, english, rank,
 *       ...x, tenses: {key: {type, group_label, tense_label, forms}}}]
 *
 * toLegacy rebuilds the pre-v1 per-verb view (person forms keyed by the old
 * person names, single forms as arrays) so the language validators can keep
 * their linguistic gold checks without caring about the storage shape.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILES = {
  it: 'data/conjugations-all-tenses.js',
  de: 'data/german-conjugations.js',
  en: 'data/english-conjugations.js',
  fr: 'data/french-conjugations.js',
};

function loadConjugations(code, file) {
  const target = file || path.join(__dirname, '..', FILES[code]);
  const ctx = { console };
  ctx.globalThis = ctx;
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(target, 'utf8'), ctx, { filename: target });
  const data = ctx.DIM_DATA && ctx.DIM_DATA.conjugations && ctx.DIM_DATA.conjugations[code];
  if (!data) throw new Error(`${target}: DIM_DATA.conjugations.${code} not registered`);
  return data;
}

function splitAlternatives(value) {
  return String(value || '').split('/').map((s) => s.trim()).filter(Boolean);
}

// opts.omitted: 'empty' keeps omitted persons as '' (old French layout),
// 'drop' leaves them out (old German imperative layout).
function toLegacy(data, personKeys, opts) {
  const options = opts || {};
  const order = data.persons.map((p) => p.key);
  const tenseMeta = new Map(data.tenses.map((t) => [t.key, t]));
  return data.verbs.map((verb) => {
    const tenses = {};
    for (const [key, value] of Object.entries(verb.tenses)) {
      const meta = tenseMeta.get(key);
      const base = { type: meta.type, group_label: meta.groupLabel, tense_label: meta.label };
      if (meta.type === 'single') {
        tenses[key] = { ...base, forms: splitAlternatives(value) };
        continue;
      }
      const omit = new Set(meta.omit || []);
      const forms = {};
      order.forEach((pk, i) => {
        if (omit.has(pk) && options.omitted === 'drop') return;
        forms[personKeys[i]] = value[i] == null ? '' : value[i];
      });
      tenses[key] = { ...base, forms };
    }
    return {
      ...(verb.x || {}),
      rank: verb.rank,
      infinitive: verb.word,
      freq: verb.freq,
      english: verb.en || '',
      chinese: verb.zh || '',
      tenses,
    };
  });
}

module.exports = { FILES, loadConjugations, toLegacy, splitAlternatives };
