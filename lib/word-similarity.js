/**
 * Dimenticato — 词形相似度模块
 * 纯函数，无 DOM、无 localStorage。在 lib/quiz-engine.js 之前加载。
 * 为"困难"难度的选择题挑选与提示词拼写相近的干扰项。
 */
(function () {
  'use strict';

  // 与 QuizEngine.normalizeString 保持一致：去重音、小写、trim
  function normalize(str) {
    return (str == null ? '' : String(str)).trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Levenshtein 编辑距离（基于归一化后的字符串）
  function editDistance(a, b) {
    a = normalize(a);
    b = normalize(b);
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var cur = [i];
      for (var k = 1; k <= b.length; k++) {
        var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
      }
      prev = cur;
    }
    return prev[b.length];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /**
   * 挑选与 currentWord 拼写相近的干扰项（返回单词对象数组）。
   * @param {Object} currentWord 当前提示词
   * @param {Array}  pool        候选词池
   * @param {Object} opts        { count, sourceField, targetField, correctTarget, windowSize }
   * @returns {Array} 最多 count 个干扰项单词对象，目标文本互不相同且不等于 correctTarget
   */
  function pickConfusableDistractors(currentWord, pool, opts) {
    opts = opts || {};
    var count = opts.count || 3;
    var sourceField = opts.sourceField;
    var targetField = opts.targetField;
    var correctTarget = opts.correctTarget;
    var windowSize = opts.windowSize || 8;
    var windowCount = Math.max(windowSize, count);

    if (!Array.isArray(pool) || !currentWord) return [];

    var promptSource = currentWord[sourceField];
    var promptNorm = normalize(promptSource);

    // 1. 候选池：排除当前词本身、目标文本为空或等于正确答案的词
    var candidates = pool.filter(function (w) {
      if (!w || w === currentWord) return false;
      var t = w[targetField];
      if (t == null || t === '') return false;
      if (t === correctTarget) return false;
      return true;
    });

    // 2. 打分：1–2 字符提示词用频率(rank)邻近度，否则用编辑距离
    var useFrequency = promptNorm.length <= 2 &&
      typeof currentWord.rank === 'number';
    var promptRank = currentWord.rank;

    var ranked = candidates.map(function (w) {
      var score;
      if (useFrequency && typeof w.rank === 'number') {
        score = Math.abs(w.rank - promptRank);
      } else {
        score = editDistance(w[sourceField], promptSource);
      }
      return { word: w, score: score };
    }).sort(function (x, y) { return x.score - y.score; });

    // 3. 取最近的一窗，打乱后取 count 个，按目标文本去重
    var picked = [];
    var usedTargets = {};
    if (correctTarget != null) usedTargets[correctTarget] = true;

    function tryAdd(w) {
      var t = w[targetField];
      if (t == null || t === '' || usedTargets[t]) return;
      usedTargets[t] = true;
      picked.push(w);
    }

    var windowItems = shuffle(ranked.slice(0, windowCount));
    for (var i = 0; i < windowItems.length && picked.length < count; i++) {
      tryAdd(windowItems[i].word);
    }

    // 4. 候选不足时，先用窗口外的剩余 ranked 补齐，再用整池随机补齐
    for (var k = windowCount; k < ranked.length && picked.length < count; k++) {
      tryAdd(ranked[k].word);
    }
    if (picked.length < count) {
      var rest = shuffle(pool);
      for (var m = 0; m < rest.length && picked.length < count; m++) {
        if (rest[m] && rest[m] !== currentWord) tryAdd(rest[m]);
      }
    }

    return picked;
  }

  window.WordSimilarity = {
    editDistance: editDistance,
    pickConfusableDistractors: pickConfusableDistractors,
    _normalize: normalize
  };
})();
