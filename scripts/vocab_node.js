'use strict';
/**
 * Node loader for the schema-v1 vocabulary files (docs/vocab-schema.md).
 *
 *   const { loadVocab } = require('./vocab_node');
 *   const { meta, entries } = loadVocab('fr');
 *
 * data/vocab/<lang>.js is a classic browser script that assigns
 * globalThis.DIM_VOCAB.<lang>; it is evaluated in a throwaway vm context.
 * Every offline consumer (validators, extractors, Node tests) goes through here.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const VOCAB_DIR = path.join(ROOT, 'data', 'vocab');
const cache = new Map();

function vocabPath(lang) {
  return path.join(VOCAB_DIR, `${lang}.js`);
}

function loadVocab(lang) {
  if (cache.has(lang)) return cache.get(lang);
  const file = vocabPath(lang);
  const ctx = {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  const data = ctx.DIM_VOCAB && ctx.DIM_VOCAB[lang];
  if (!data || !data.meta || !Array.isArray(data.entries)) {
    throw new Error(`${file}: DIM_VOCAB.${lang} missing or malformed`);
  }
  cache.set(lang, data);
  return data;
}

/** Provenance string of an entry (`src` indexes meta.sources). */
function sourceOf(data, entry) {
  return Number.isInteger(entry.src) ? data.meta.sources[entry.src] : '';
}

module.exports = { loadVocab, sourceOf, vocabPath, VOCAB_DIR };
