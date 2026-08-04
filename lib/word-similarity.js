/**
 * Dimenticato — 词形相似度模块
 * 纯函数，无 DOM、无 localStorage。在 lib/quiz-engine.js 之前加载。
 * 为"困难"难度的选择题挑选与提示词拼写相近、但**意思不同**的干扰项。
 *
 * 两条硬规则（见 audit: it-mc-distractors-synonymous-with-answer /
 * it-placeholder-glosses-shown-to-user）：
 *   1. 干扰项的释义不能和正确答案共享义项 —— 否则用户选对了也会被判错。
 *   2. 干扰项的释义不能是 "(2)" 这类占位残留 —— 那不是可选的答案。
 * 性能：候选池按首字母+词长预建索引并缓存，避免每题对 24000 词做全量编辑距离。
 */
(function () {
  'use strict';

  // 每题最多计算多少次编辑距离（超出部分随机抽样）
  var MAX_SCORED = 400;
  // 兜底随机补齐时最多扫描多少个词
  var MAX_FALLBACK_SCAN = 2000;

  // 在调用时解析 DimText（lib/utils.js 先加载；缺失时退回内置实现）
  function text() {
    return (typeof window !== 'undefined' && window.DimText) ? window.DimText : null;
  }

  // 与 QuizEngine.normalizeString 保持一致：去重音、小写、trim
  function normalize(str) {
    var t = text();
    if (t) return t.looseKey(str);
    return (str == null ? '' : String(str)).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Levenshtein 编辑距离（基于归一化后的字符串）
  function editDistance(a, b) {
    return boundedEditDistance(normalize(a), normalize(b), Infinity);
  }

  // 带上限的编辑距离：一旦整行都超过 max 就提前退出，返回 max + 1
  function boundedEditDistance(a, b, max) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var cur = [i];
      var rowMin = i;
      for (var k = 1; k <= b.length; k++) {
        var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
        if (cur[k] < rowMin) rowMin = cur[k];
      }
      if (rowMin > max) return max + 1;
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

  // ===== 候选池索引（按词池对象缓存，词池变化时重建） =====
  var indexCache = (typeof WeakMap === 'function') ? new WeakMap() : null;

  function firstLetter(value) {
    var s = (value == null ? '' : String(value));
    if (!s) return '';
    return s.charAt(0).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function buildIndex(pool, sourceField) {
    var buckets = Object.create(null);
    var ranked = [];
    for (var i = 0; i < pool.length; i++) {
      var w = pool[i];
      if (!w) continue;
      var src = w[sourceField];
      if (src == null || src === '') continue;
      var key = firstLetter(src);
      (buckets[key] || (buckets[key] = [])).push(w);
      if (typeof w.rank === 'number') ranked.push(w);
    }
    ranked.sort(function (x, y) { return x.rank - y.rank; });
    return { buckets: buckets, ranked: ranked, size: pool.length, field: sourceField };
  }

  function getIndex(pool, sourceField) {
    if (!indexCache) return buildIndex(pool, sourceField);
    var cached = indexCache.get(pool);
    if (cached && cached.size === pool.length && cached.field === sourceField) return cached;
    var built = buildIndex(pool, sourceField);
    indexCache.set(pool, built);
    return built;
  }

  // 从数组里随机抽最多 n 个（不改动原数组）
  function sampleFrom(list, n) {
    if (list.length <= n) return list.slice();
    var out = [];
    var seen = Object.create(null);
    var guard = n * 6;
    while (out.length < n && guard-- > 0) {
      var idx = Math.floor(Math.random() * list.length);
      if (seen[idx]) continue;
      seen[idx] = true;
      out.push(list[idx]);
    }
    return out;
  }

  // 按 rank 邻近取候选（短词用词频而非编辑距离）
  function nearestByRank(ranked, rank, want) {
    var lo = 0, hi = ranked.length;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (ranked[mid].rank < rank) lo = mid + 1; else hi = mid;
    }
    var left = lo - 1, right = lo, out = [];
    while (out.length < want && (left >= 0 || right < ranked.length)) {
      if (left < 0) { out.push(ranked[right++]); continue; }
      if (right >= ranked.length) { out.push(ranked[left--]); continue; }
      var dl = Math.abs(ranked[left].rank - rank);
      var dr = Math.abs(ranked[right].rank - rank);
      out.push(dl <= dr ? ranked[left--] : ranked[right++]);
    }
    return out;
  }

  /**
   * 挑选与 currentWord 拼写相近的干扰项（返回单词对象数组）。
   * @param {Object} currentWord 当前提示词
   * @param {Array}  pool        候选词池
   * @param {Object} opts        { count, sourceField, targetField, correctTarget, windowSize,
   *                               allowSynonyms(默认 false), allowPlaceholders(默认 false) }
   * @returns {Array} 最多 count 个干扰项单词对象；释义互不相同，也不与正确答案同义
   */
  function pickConfusableDistractors(currentWord, pool, opts) {
    opts = opts || {};
    var count = opts.count || 3;
    var sourceField = opts.sourceField;
    var targetField = opts.targetField;
    var correctTarget = opts.correctTarget;
    var windowSize = opts.windowSize || 8;
    var windowCount = Math.max(windowSize, count);
    var allowSynonyms = opts.allowSynonyms === true;
    var allowPlaceholders = opts.allowPlaceholders === true;

    if (!Array.isArray(pool) || !currentWord) return [];

    var t = text();
    var promptSource = currentWord[sourceField];
    var promptNorm = normalize(promptSource);
    // 同词判定保留重音：意大利语 e / è 是两个词，可以互为干扰项；
    // 只有大小写或排版不同的重复词条（internet / Internet）才排除。
    var promptKey = t ? t.headwordKey(promptSource) : promptNorm;
    var index = getIndex(pool, sourceField);

    var picked = [];
    var pickedTargets = [];
    var usedKeys = Object.create(null);
    if (correctTarget != null && correctTarget !== '') usedKeys[normalize(correctTarget)] = true;

    // 干扰项准入：非空、非占位符、与正确答案及其它干扰项都不同义
    function acceptable(target) {
      if (target == null || target === '') return false;
      if (usedKeys[normalize(target)]) return false;
      if (t) {
        if (!allowPlaceholders && t.isPlaceholderGloss(target)) return false;
        if (!allowSynonyms) {
          if (correctTarget != null && t.glossesOverlap(target, correctTarget)) return false;
          for (var i = 0; i < pickedTargets.length; i++) {
            if (t.glossesOverlap(target, pickedTargets[i])) return false;
          }
        }
      }
      return true;
    }

    function tryAdd(w) {
      if (!w || w === currentWord) return false;
      var candKey = t ? t.headwordKey(w[sourceField]) : normalize(w[sourceField]);
      if (candKey && candKey === promptKey) return false;
      var target = w[targetField];
      if (!acceptable(target)) return false;
      usedKeys[normalize(target)] = true;
      pickedTargets.push(target);
      picked.push(w);
      return true;
    }

    // 1. 收集候选：短提示词按词频邻近，其余按首字母 + 词长的桶
    var useFrequency = promptNorm.length <= 2 && typeof currentWord.rank === 'number';
    var candidates;
    if (useFrequency && index.ranked.length) {
      candidates = nearestByRank(index.ranked, currentWord.rank, Math.min(MAX_SCORED, windowCount * 6 + count));
    } else {
      var bucket = index.buckets[firstLetter(promptSource)] || [];
      var srcLen = promptNorm.length;
      var close = [];
      for (var b = 0; b < bucket.length; b++) {
        var cand = bucket[b];
        var len = String(cand[sourceField]).length;
        if (Math.abs(len - srcLen) <= 2) close.push(cand);
      }
      if (close.length < windowCount * 2) close = bucket;
      candidates = sampleFrom(close, MAX_SCORED);
    }

    // 2. 打分并取最近的一窗（候选数已受控，排序成本恒定）
    var ranked;
    if (useFrequency) {
      ranked = candidates;  // 已按 rank 邻近排序
    } else {
      ranked = candidates.map(function (w) {
        return { word: w, score: boundedEditDistance(normalize(w[sourceField]), promptNorm, 12) };
      }).sort(function (x, y) { return x.score - y.score; })
        .map(function (entry) { return entry.word; });
    }

    // 3. 窗口内打乱后挑选，再用窗口外的候选补齐
    var windowItems = shuffle(ranked.slice(0, windowCount));
    for (var i = 0; i < windowItems.length && picked.length < count; i++) tryAdd(windowItems[i]);
    for (var k = windowCount; k < ranked.length && picked.length < count; k++) tryAdd(ranked[k]);

    // 4. 仍然不够时，从整池随机补齐（扫描量有上限）
    if (picked.length < count) {
      var scans = Math.min(pool.length, MAX_FALLBACK_SCAN);
      var rest = sampleFrom(pool, scans);
      for (var m = 0; m < rest.length && picked.length < count; m++) tryAdd(rest[m]);
    }

    return picked;
  }

  window.WordSimilarity = {
    editDistance: editDistance,
    boundedEditDistance: boundedEditDistance,
    pickConfusableDistractors: pickConfusableDistractors,
    _normalize: normalize,
    _resetIndexCache: function () {
      if (typeof WeakMap === 'function') indexCache = new WeakMap();
    }
  };
})();
