/**
 * Dimenticato - 通用测验引擎
 * 为选择题、拼写、浏览三种模式提供共享逻辑
 * 通过配置对象适配不同语言的字段名
 */
(function () {
  'use strict';

  // 全部依赖都在**调用时**通过 window 解析：lib/ 先于 app.js 加载，
  // 在解析期测 `typeof SomeConst` 会永远拿到 undefined。
  function text() {
    return (typeof window !== 'undefined' && window.DimText) ? window.DimText : null;
  }
  function storage() {
    try {
      return (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : null;
    } catch (e) {
      return null;
    }
  }
  function esc(value) {
    return (typeof window !== 'undefined' && window.escapeHtml)
      ? window.escapeHtml(value) : String(value == null ? '' : value);
  }
  function escAttr(value) {
    return (typeof window !== 'undefined' && window.escapeAttribute)
      ? window.escapeAttribute(value) : esc(value);
  }

  /**
   * @param {Object} config
   * @param {Object} config.state - 包含 words, quizIndex, quizCorrect, quizTotal, currentWord getters/setters
   * @param {Object} config.stats - 包含 mcAttempts, mcCorrect, spAttempts, spCorrect 等统计
   * @param {Set}   config.mastered - 已掌握单词集合
   * @param {Object} config.fieldMap - { source: 'italian'|'german'|'english'|'french', target: 'english'|'meaning' }
   * @param {string} [config.language] - 语言标识（缺省时取 fieldMap.source），用于难度与掌握度的分语言存储
   * @param {Function} config.saveFn - 保存回调
   * @param {Function} config.onUpdateStats - 更新 UI 统计回调
   * @param {Object} config.dom - DOM 元素引用
   */
  function QuizEngine(config) {
    this.config = config;
  }

  QuizEngine.prototype.language = function () {
    var c = this.config || {};
    return c.language || (c.fieldMap && c.fieldMap.source) || 'italian';
  };

  QuizEngine.prototype.shuffleArray = function (array) {
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  };

  /** 当前生效的难度：显式配置 > 分语言设置 > 全局设置 */
  QuizEngine.prototype.getDifficulty = function () {
    var explicit = this.config ? this.config.difficulty : null;
    if (explicit === 'easy' || explicit === 'hard') return explicit;
    return QuizEngine.getDifficulty(this.language());
  };

  /**
   * 词条是否可以出题/当选项：释义不能是 "(2)" 这样的占位残留
   * （见 audit: it-placeholder-glosses-shown-to-user）
   */
  QuizEngine.prototype.isUsableWord = function (word) {
    if (!word) return false;
    var target = word[this.config.fieldMap.target];
    if (target == null || target === '') return false;
    var t = text();
    return t ? !t.isPlaceholderGloss(target) : true;
  };

  /** 过滤掉释义不可用的词，供各语言构建练习会话时使用 */
  QuizEngine.prototype.filterUsableWords = function (words) {
    var self = this;
    if (!Array.isArray(words)) return [];
    var usable = words.filter(function (w) { return self.isUsableWord(w); });
    return usable.length ? usable : words;
  };

  /** 展示用释义（去掉占位义项）。判分仍使用原始字符串。 */
  QuizEngine.prototype.displayGloss = function (value) {
    var t = text();
    return t ? t.cleanGloss(value) : (value == null ? '' : String(value));
  };

  /**
   * 选项是否与正确答案表达同一个意思。
   * 数据里 tu / voi 的释义都是 "you"，严格字符串比较会把选对的用户判错。
   */
  QuizEngine.prototype.isAnswerCorrect = function (selected, correctAnswer) {
    if (selected === correctAnswer) return true;
    if (selected == null || correctAnswer == null) return false;
    var t = text();
    return t ? t.sameMeaning(selected, correctAnswer) : false;
  };

  /**
   * 为选择题生成 4 个选项（1 个正确 + 3 个干扰项）
   * difficulty === 'hard' 时使用拼写相近的干扰项，否则随机。
   * 两种模式都会剔除"与正确答案同义"和"占位释义"的候选。
   */
  QuizEngine.prototype.generateOptions = function (correctAnswer, wordPool) {
    var options = [correctAnswer];
    var targetField = this.config.fieldMap.target;
    var sourceField = this.config.fieldMap.source;
    var currentWord = this.config.state.currentWord;
    var difficulty = this.getDifficulty();
    var t = text();

    if (difficulty === 'hard' && window.WordSimilarity && currentWord) {
      var distractors = window.WordSimilarity.pickConfusableDistractors(currentWord, wordPool, {
        count: 3,
        sourceField: sourceField,
        targetField: targetField,
        correctTarget: correctAnswer
      });
      for (var d = 0; d < distractors.length; d++) {
        options.push(distractors[d][targetField]);
      }
      return this.shuffleArray(options);
    }

    // easy / 回退：随机，但同样不允许同义或占位释义的干扰项
    var chosen = [];
    var otherWords = wordPool.filter(function (w) {
      if (!w || w === currentWord) return false;
      var candidate = w[targetField];
      if (candidate == null || candidate === '') return false;
      if (candidate === correctAnswer) return false;
      if (w[sourceField] === currentWord[sourceField]) return false;
      if (t && t.isPlaceholderGloss(candidate)) return false;
      if (t && t.glossesOverlap(candidate, correctAnswer)) return false;
      return true;
    });

    var shuffled = this.shuffleArray(otherWords);
    for (var i = 0; i < shuffled.length && chosen.length < 3; i++) {
      var value = shuffled[i][targetField];
      var clash = false;
      for (var c = 0; c < chosen.length && !clash; c++) {
        clash = chosen[c] === value || (t && t.glossesOverlap(chosen[c], value));
      }
      if (!clash) {
        chosen.push(value);
        options.push(value);
      }
    }

    return this.shuffleArray(options);
  };

  /**
   * 渲染选择题选项按钮
   * data-answer 保留原始释义（判分用），按钮文字用清洗过的释义（展示用）
   */
  QuizEngine.prototype.renderOptions = function (options, onSelect) {
    var self = this;
    var container = this.config.dom.optionsContainer;
    container.innerHTML = options.map(function (option) {
      var label = self.displayGloss(option);
      return '<button class="option" data-answer="' + escAttr(option) + '">' + esc(label || '—') + '</button>';
    }).join('');

    container.querySelectorAll('.option').forEach(function (btn) {
      btn.addEventListener('click', function () { onSelect(btn); });
    });
  };

  /**
   * 显示答题反馈（正确/错误）
   */
  QuizEngine.prototype.showFeedback = function (isCorrect, correctAnswer) {
    var feedback = this.config.dom.feedbackEl;
    var feedbackText = this.config.dom.feedbackTextEl;

    if (isCorrect) {
      feedbackText.innerHTML = '<span class="msr">check_circle</span>回答正确';
      feedbackText.classList.remove('no');
      feedbackText.classList.add('ok');
      feedback.classList.remove('incorrect');
      feedback.classList.add('correct');
    } else {
      feedbackText.innerHTML = '<span class="msr">cancel</span>回答有误，正确答案是：' + esc(this.displayGloss(correctAnswer));
      feedbackText.classList.remove('ok');
      feedbackText.classList.add('no');
      feedback.classList.remove('correct');
      feedback.classList.add('incorrect');
    }
    feedback.classList.remove('hidden');
  };

  /**
   * 高亮正确/错误选项
   */
  QuizEngine.prototype.highlightOptions = function (correctAnswer) {
    var self = this;
    var container = this.config.dom.optionsContainer;
    container.querySelectorAll('.option').forEach(function (btn) {
      btn.disabled = true;
      if (self.isAnswerCorrect(btn.dataset.answer, correctAnswer)) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('faded');
      }
    });
  };

  /**
   * 更新测验进度 UI
   */
  QuizEngine.prototype.updateProgress = function () {
    var s = this.config.state;
    var d = this.config.dom;
    d.progressCurrent.textContent = s.quizIndex + 1;
    d.progressTotal.textContent = s.words.length;
    var accuracy = s.quizTotal > 0 ? Math.round((s.quizCorrect / s.quizTotal) * 100) : 0;
    d.accuracyEl.textContent = accuracy + '%';
  };

  /**
   * 标准化文本（去重音、小写）用于拼写模式答案比较
   */
  QuizEngine.prototype.normalizeString = function (str) {
    var t = text();
    if (t) return t.looseKey(str);
    return (str || '').toString().trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  /**
   * 记录一次作答，并按"连续答对 N 次"的门槛维护已掌握集合。
   * 见 audit: it-mastered-after-one-lucky-guess —— 四选一时首次蒙对就标记掌握，
   * 会让进度条凭运气上涨且永不回落。
   * @param {Object} word 当前单词对象
   * @param {boolean} isCorrect
   * @param {Object} [opts] { timeSpent }
   * @returns {{key:string, streak:number, mastered:boolean, demoted:boolean}}
   */
  QuizEngine.prototype.recordAnswer = function (word, isCorrect, opts) {
    var sourceField = this.config.fieldMap.source;
    var key = word ? word[sourceField] : null;
    var result = { key: key, streak: 0, mastered: false, demoted: false };
    if (!key) return result;

    var lang = this.language();
    var outcome = MasteryPolicy.record(lang, key, isCorrect, {
      word: word,
      timeSpent: opts && opts.timeSpent
    });
    result.streak = outcome.streak;
    result.mastered = outcome.mastered;

    var mastered = this.config.mastered;
    if (mastered && typeof mastered.add === 'function') {
      if (outcome.mastered) {
        mastered.add(key);
      } else if (!isCorrect && typeof mastered.delete === 'function' && mastered.has(key)) {
        mastered.delete(key);
        result.demoted = true;
      }
    }
    return result;
  };

  // ===== 掌握度策略（连续答对门槛 / SM-2 感知） =====
  var MasteryPolicy = {
    STREAK_REQUIRED: 2,
    KEY_PREFIX: 'dimenticato_mastery_streak_',

    storageKey: function (lang) {
      return MasteryPolicy.KEY_PREFIX + (lang || 'italian');
    },

    _load: function (lang) {
      var ls = storage();
      if (!ls) return {};
      try {
        return JSON.parse(ls.getItem(MasteryPolicy.storageKey(lang)) || '{}') || {};
      } catch (e) {
        return {};
      }
    },

    _save: function (lang, data) {
      var ls = storage();
      if (!ls) return;
      try {
        ls.setItem(MasteryPolicy.storageKey(lang), JSON.stringify(data));
      } catch (e) {}
    },

    getStreak: function (lang, key) {
      var data = MasteryPolicy._load(lang);
      return data[key] || 0;
    },

    /** SM-2 已经把这个词排到长间隔时，直接算掌握 */
    _srMastered: function (word) {
      if (!word || !word.srData) return false;
      var sr = (typeof window !== 'undefined') ? window.SpacedRepetition : null;
      if (!sr) return false;
      return (word.srData.repetitions || 0) >= 2 && (word.srData.interval || 0) >= 6;
    },

    record: function (lang, key, isCorrect, opts) {
      opts = opts || {};
      var data = MasteryPolicy._load(lang);
      var streak = isCorrect ? (data[key] || 0) + 1 : 0;
      var mastered = isCorrect &&
        (streak >= MasteryPolicy.STREAK_REQUIRED || MasteryPolicy._srMastered(opts.word));

      if (streak > 0 && !mastered) {
        data[key] = streak;
      } else {
        delete data[key];  // 已掌握或已归零的词不必再占存储
      }
      MasteryPolicy._save(lang, data);
      return { streak: streak, mastered: mastered };
    },

    clear: function (lang) {
      var ls = storage();
      if (!ls) return;
      try { ls.removeItem(MasteryPolicy.storageKey(lang)); } catch (e) {}
    }
  };

  // ===== 难度偏好（localStorage 持久化，默认困难） =====
  QuizEngine.DIFFICULTY_KEY = 'dimenticato_quiz_difficulty';
  QuizEngine.LANGUAGES = ['italian', 'german', 'english', 'french'];

  QuizEngine.difficultyKeyFor = function (lang) {
    return lang ? QuizEngine.DIFFICULTY_KEY + '_' + lang : QuizEngine.DIFFICULTY_KEY;
  };

  /**
   * 读取难度。传语言时优先用该语言的设置，没有则回落到全局设置。
   * 不传语言时读全局设置（旧调用方保持原行为）。
   */
  QuizEngine.getDifficulty = function (lang) {
    var ls = storage();
    if (!ls) return 'hard';
    try {
      if (lang) {
        var scoped = ls.getItem(QuizEngine.difficultyKeyFor(lang));
        if (scoped === 'easy' || scoped === 'hard') return scoped;
      }
      var v = ls.getItem(QuizEngine.DIFFICULTY_KEY);
      return v === 'easy' ? 'easy' : 'hard';
    } catch (e) {
      return 'hard';
    }
  };

  /** 写入难度。传语言时只改该语言，否则改全局（并清掉分语言覆盖）。 */
  QuizEngine.setDifficulty = function (value, lang) {
    var v = value === 'easy' ? 'easy' : 'hard';
    var ls = storage();
    if (!ls) return v;
    try {
      if (lang) {
        ls.setItem(QuizEngine.difficultyKeyFor(lang), v);
      } else {
        ls.setItem(QuizEngine.DIFFICULTY_KEY, v);
        QuizEngine.LANGUAGES.forEach(function (l) {
          ls.removeItem(QuizEngine.difficultyKeyFor(l));
        });
      }
    } catch (e) {}
    return v;
  };

  /**
   * 生成"选择题难度"分段控件的标记，供各语言设置页直接注入。
   * 传 lang 时该控件只影响这门语言；不传则是全站设置。
   */
  QuizEngine.renderDifficultyToggle = function (lang, label) {
    var current = QuizEngine.getDifficulty(lang);
    var scope = lang ? ' data-difficulty-lang="' + escAttr(lang) + '"' : '';
    var title = label || '选择题难度';
    return '<div class="pref-row">' +
      '<span class="pref-label">' + esc(title) + '</span>' +
      '<div class="segmented difficulty-toggle"' + scope + ' role="group" aria-label="' + escAttr(title) + '">' +
      '<button type="button" class="seg difficulty-option' + (current === 'easy' ? ' active' : '') +
        '" data-difficulty="easy" title="随机干扰项">简单</button>' +
      '<button type="button" class="seg difficulty-option' + (current === 'hard' ? ' active' : '') +
        '" data-difficulty="hard" title="相似干扰项">困难</button>' +
      '</div></div>';
  };

  /**
   * 难度控件的挂载点：优先各语言的设置页，没有设置页就挂到"选择练习方式"页。
   * 意大利语的控件已经写在 index.html 里（全站默认），这里不重复注入。
   * 见 audit: difficulty-toggle-ui-italian-only
   */
  QuizEngine.DIFFICULTY_MOUNTS = [
    { lang: 'german', selectors: ['#germanSettingsScreen .container', '#germanVocabularyModesScreen .container'] },
    { lang: 'english', selectors: ['#englishSettingsScreen .container', '#englishVocabularyModesScreen .container'] },
    { lang: 'french', selectors: ['#frenchSettingsScreen .container', '#frenchVocabularyModesScreen .container'] }
  ];

  /**
   * 把难度控件注入到各语言页面（幂等；找不到挂载点就什么都不做）。
   * 法语页面是 french-app.js 运行时插入的，所以挂载会重试几次。
   * @returns {number} 本次新挂载的控件数量
   */
  QuizEngine.mountDifficultyToggles = function (root) {
    if (typeof document === 'undefined' || !document.querySelector) return 0;
    var scope = root || document;
    var mounted = 0;
    QuizEngine.DIFFICULTY_MOUNTS.forEach(function (entry) {
      if (scope.querySelector('[data-difficulty-lang="' + entry.lang + '"]')) return;  // 已经有了
      var host = null;
      for (var i = 0; i < entry.selectors.length && !host; i++) {
        host = scope.querySelector(entry.selectors[i]);
      }
      if (!host) return;
      var card = document.createElement('div');
      card.className = 'settings-card';
      card.setAttribute('data-difficulty-card', entry.lang);
      card.innerHTML = '<div class="settings-card-title">学习偏好</div>' +
        QuizEngine.renderDifficultyToggle(entry.lang);
      host.appendChild(card);
      mounted++;
    });
    if (mounted) QuizEngine.syncDifficultyToggles(scope);
    return mounted;
  };

  /** 页面还在渐进渲染时重试挂载，直到所有语言都挂上为止 */
  QuizEngine._scheduleDifficultyMount = function () {
    var delays = [0, 300, 1200, 3000];
    delays.forEach(function (ms) {
      setTimeout(function () {
        QuizEngine.mountDifficultyToggles();
      }, ms);
    });
  };

  /** 同步页面上所有难度控件的选中态（含运行时注入的） */
  QuizEngine.syncDifficultyToggles = function (root) {
    if (typeof document === 'undefined') return;
    var scope = root || document;
    if (!scope.querySelectorAll) return;
    var buttons = scope.querySelectorAll('[data-difficulty]');
    Array.prototype.forEach.call(buttons, function (btn) {
      var group = btn.closest ? btn.closest('[data-difficulty-lang]') : null;
      var lang = group && group.dataset ? group.dataset.difficultyLang : '';
      var active = btn.dataset.difficulty === QuizEngine.getDifficulty(lang);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  /**
   * 用事件委托绑定所有难度控件 —— 运行时注入的（德语/法语/英语设置页）
   * 无需再单独绑定。重复调用是幂等的。
   */
  QuizEngine.bindDifficultyToggles = function () {
    if (typeof document === 'undefined' || QuizEngine._difficultyBound) return;
    QuizEngine._difficultyBound = true;
    document.addEventListener('click', function (event) {
      var target = event.target;
      var btn = (target && target.closest) ? target.closest('[data-difficulty]') : null;
      if (!btn) return;
      var group = btn.closest('[data-difficulty-lang]');
      var lang = group && group.dataset ? group.dataset.difficultyLang : '';
      QuizEngine.setDifficulty(btn.dataset.difficulty, lang || null);
      QuizEngine.syncDifficultyToggles();
    });
  };

  if (typeof document !== 'undefined' && document.addEventListener) {
    var initDifficultyUI = function () {
      QuizEngine.bindDifficultyToggles();
      QuizEngine.syncDifficultyToggles();
      QuizEngine._scheduleDifficultyMount();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDifficultyUI);
    } else {
      initDifficultyUI();
    }
  }

  window.MasteryPolicy = MasteryPolicy;
  window.QuizEngine = QuizEngine;
})();
