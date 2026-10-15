/** Reviewed text comprehension: deterministic choices, never an AI/subjective grader. */
(function (g) {
  'use strict';
  var kinds = ['main-idea', 'detail', 'cause', 'inference'];
  function text(x) { return typeof x === 'string' && x.trim().length > 0; }
  function fields(x, allowed) { return x && typeof x === 'object' && !Array.isArray(x) && Object.keys(x).every(function (k) { return allowed.indexOf(k) >= 0; }); }
  function validate(data, article) {
    if (!fields(data, ['schema','articleId','lang','questions']) || !article || data.schema !== 1 || data.articleId !== article.id || data.lang !== article.lang || ['it','fr','de','en'].indexOf(data.lang) < 0 || !/^[a-z0-9-]+$/.test(data.articleId) || !Array.isArray(article.sentences) || !Array.isArray(data.questions) || data.questions.length < 1 || data.questions.length > 5) return false;
    var ids = new Set(), sentences = new Set(article.sentences.map(function (s) { return s.id; }));
    return data.questions.every(function (q) {
      if (!fields(q, ['id','kind','prompt','promptZh','options','answerIndex','evidence','explanationZh']) || !text(q.id) || !/^[a-z0-9-]+$/.test(q.id) || ids.has(q.id) || kinds.indexOf(q.kind) < 0 || !text(q.prompt) || ('promptZh' in q && !text(q.promptZh)) || !text(q.explanationZh) || !Array.isArray(q.options) || q.options.length !== 4 || !q.options.every(text) || new Set(q.options.map(function (x) { return x.normalize('NFC').trim().replace(/\s+/g, ' '); })).size !== 4 || !Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3 || !Array.isArray(q.evidence) || !q.evidence.length || new Set(q.evidence).size !== q.evidence.length || !q.evidence.every(function (id) { return sentences.has(id); })) return false;
      ids.add(q.id); return true;
    });
  }
  function create(data) {
    // Snapshot answers: later caller mutations cannot silently change the scoring key.
    var keys = new Map(data.questions.map(function (q) { return [q.id, q.answerIndex]; }));
    var state = { answers: Object.create(null) };
    state.submit = function (id, index) {
      if (!keys.has(id) || !Number.isInteger(index) || index < 0 || index > 3) return null;
      if (state.answers[id]) return state.answers[id];
      return (state.answers[id] = Object.freeze({ optionIndex: index, correct: index === keys.get(id) }));
    };
    state.reset = function () { state.answers = Object.create(null); };
    return state;
  }
  g.ReadingComprehension = { validate: validate, create: create };
})(typeof window !== 'undefined' ? window : globalThis);
