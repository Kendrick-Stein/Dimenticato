/** Optional, immutable-article companion exercises. Pure grading + in-session state. */
(function (g) {
  'use strict';
  function normalized(x) { return String(x || '').normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[’‘]/g, "'"); }
  function grade(input, answer) {
    var a = normalized(input), b = normalized(answer);
    if (a === b) return 'correct';
    if (a.toLocaleLowerCase() === b.toLocaleLowerCase()) return 'case';
    if (a.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === b.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) return 'accent';
    return 'wrong';
  }
  function validate(data, article) {
    if (!data || data.schema !== 1 || data.articleId !== article.id || data.lang !== article.lang || !Array.isArray(data.questions) || data.questions.length !== 5) return false;
    var ids = new Set();
    return data.questions.every(function (q) {
      var s = article.sentences.find(function (s) { return s.id === q.sentenceId; });
      var term = article.learningSummary && article.learningSummary.words.find(function (w) { return w.text === q.answer && w.sentenceId === q.sentenceId; });
      if (!s || !term || !q.id || ids.has(q.id) || typeof q.explanation !== 'string' || !q.explanation.trim() || !Number.isInteger(q.start) || s.text.slice(q.start, q.start + q.answer.length) !== q.answer || !Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options.map(normalized)).size !== 4 || q.options.filter(function (x) { return x === q.answer; }).length !== 1) return false;
      ids.add(q.id); return q.options.every(function (x) { return typeof x === 'string' && x.trim(); });
    });
  }
  function create(data) {
    var state = { mode: 'choice', answers: {}, inputs: {} };
    state.submit = function (q, input) {
      var key = state.mode + ':' + q.id;
      if (state.answers[key]) return state.answers[key];
      if (!normalized(input)) return null;
      return (state.answers[key] = { input: input, result: grade(input, q.answer) });
    };
    state.reset = function () { state.answers = {}; state.inputs = {}; };
    return state;
  }
  g.ReadingPractice = { grade: grade, validate: validate, create: create };
})(typeof window !== 'undefined' ? window : globalThis);
