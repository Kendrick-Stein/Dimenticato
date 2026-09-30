/**
 * Source-checked runtime corrections. Keep the generated base vocabulary intact.
 * Loaded after vocabulary.js and before application initialization by LangLoader.
 * Offline consumers: require this file and call apply(entries) after reading the base.
 * Evidence/before-after review: docs/audits/italian-vocabulary-review.json.
 */
(function (global) {
  'use strict';
  const corrections = [
    { italian: 'nel', rank: 84, fields: {
      english: { before: 'in', after: 'in the' },
      chinese: { before: '输入', after: '在……里（in + il）' }
    } },
    { italian: 'cento', rank: 1919, fields: {
      english: { before: '%', after: 'hundred' },
      chinese: { before: '百分比(%)', after: '一百' }
    } },
    { italian: 'signorina', rank: 533, fields: {
      chinese: { before: ' ̅', after: '小姐；未婚女子' }
    } }
  ];

  function apply(entries) {
    if (!Array.isArray(entries)) return entries;
    const byHeadword = new Map(corrections.map(item => [item.italian, item]));
    entries.forEach(word => {
      const correction = word && byHeadword.get(word.italian);
      if (!correction || word.rank !== correction.rank) return;
      Object.keys(correction.fields).forEach(field => {
        const change = correction.fields[field];
        // Idempotent and conservative: a future upstream edit wins over this registry.
        if (word[field] === change.before) word[field] = change.after;
      });
    });
    return entries;
  }

  const api = { corrections, apply };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.ItalianVocabularyCorrections = api;
  if (typeof VOCABULARY_DATA !== 'undefined') apply(VOCABULARY_DATA);
})(typeof window !== 'undefined' ? window : globalThis);
