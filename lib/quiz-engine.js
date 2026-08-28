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

  function isDifficulty(value) {
    return value === 'easy' || value === 'hard';
  }

  function isDirection(value) {
    return value === 'forward' || value === 'reverse';
  }

  /**
   * 只读「这门语言自己的」出题方向设置；没设置过就返回 null（**不**回落到全局）。
   */
  function readScopedDirection(lang) {
    if (!lang) return null;
    var ls = storage();
    if (!ls) return null;
    try {
      var v = ls.getItem(QuizEngine.directionKeyFor(lang));
      return isDirection(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 只读「这门语言自己的」难度设置；没设置过就返回 null（**不**回落到全局）。
   * 分语言开关是否被用过，只能靠这个函数区分。
   */
  function readScopedDifficulty(lang) {
    if (!lang) return null;
    var ls = storage();
    if (!ls) return null;
    try {
      var v = ls.getItem(QuizEngine.difficultyKeyFor(lang));
      return isDifficulty(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * config.difficulty 只有在它是配置对象上的**自有字面量**时才算数。
   * 四个 App 传的都是 `get difficulty() { return QuizEngine.getDifficulty(); }`，
   * 那个 getter 永远返回 'easy'|'hard'，若让它参与优先级，分语言开关就永远不生效。
   */
  function ownDifficultyLiteral(config) {
    if (!config || typeof config !== 'object') return null;
    var desc = Object.getOwnPropertyDescriptor(config, 'difficulty');
    if (!desc || !('value' in desc)) return null;   // 访问器属性（getter）不算显式配置
    return isDifficulty(desc.value) ? desc.value : null;
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

  /** 当前生效的出题方向（分语言设置 > 全局设置） */
  QuizEngine.prototype.getDirection = function () {
    return QuizEngine.getDirection(this.language());
  };

  /** 反向 = 看释义选外语单词（召回式）；正向 = 看外语单词选释义（默认）。 */
  QuizEngine.prototype.isReverse = function () {
    return this.getDirection() === 'reverse';
  };

  /** 选择题的正确答案：正向取释义字段，反向取外语词形字段。 */
  QuizEngine.prototype.correctAnswerFor = function (word) {
    if (!word) return '';
    var fm = this.config.fieldMap;
    var value = this.isReverse() ? word[fm.source] : word[fm.target];
    return value == null ? '' : value;
  };

  /** 选择题的题面文本：正向显示外语词，反向显示清洗后的释义。 */
  QuizEngine.prototype.questionTextFor = function (word) {
    if (!word) return '';
    var fm = this.config.fieldMap;
    if (this.isReverse()) return this.displayGloss(word[fm.target]);
    var src = word[fm.source];
    return src == null ? '' : String(src);
  };

  /** 反向模式的题面就是释义，朗读外语词形等于提前报答案。 */
  QuizEngine.prototype.shouldSpeakQuestion = function () {
    return !this.isReverse();
  };

  /**
   * 按出题方向更新选择题屏的题面/选项标签。
   * @param {Object} ids      { question, options } 两个元素的 DOM id
   * @param {Object} forward  { question, options } 正向文案
   * @param {Object} reverse  { question, options } 反向文案
   */
  QuizEngine.prototype.applyDirectionLabels = function (ids, forward, reverse) {
    var pick = this.isReverse() ? reverse : forward;
    ['question', 'options'].forEach(function (kind) {
      var el = ids && document.getElementById(ids[kind]);
      if (el) el.textContent = pick[kind];
    });
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

  /**
   * 当前生效的难度：**分语言设置 > 显式字面量配置 > 全局设置**。
   * 用户在德/英/法设置页点过开关，那就是最明确的意图，必须压过 App 传进来的
   * `get difficulty()` getter —— 否则开关点了亮了却不生效。
   */
  QuizEngine.prototype.getDifficulty = function () {
    var lang = this.language();
    var scoped = readScopedDifficulty(lang);
    if (scoped) return scoped;
    var explicit = ownDifficultyLiteral(this.config);
    if (explicit) return explicit;
    return QuizEngine.getDifficulty(lang);
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
   * direction === 'reverse' 时选项是外语词形（题面是释义），干扰项按外语
   * 拼写相近挑选，并额外排除"释义与题面同义"的词条 —— 两个词释义相同，
   * 反向题里两个选项都对，选哪个都是运气。
   * 两种模式都会剔除"与正确答案同义"和"占位释义"的候选。
   */
  QuizEngine.prototype.generateOptions = function (correctAnswer, wordPool) {
    var options = [correctAnswer];
    var fm = this.config.fieldMap;
    var reverse = this.isReverse();
    var optionField = reverse ? fm.source : fm.target;
    var currentWord = this.config.state.currentWord;
    var difficulty = this.getDifficulty();
    var t = text();

    // 反向模式专用：候选词的释义与题面释义同义 → 排除
    var sameMeaningAsPrompt = (reverse && currentWord)
      ? function (w) {
          var a = w && w[fm.target];
          var b = currentWord[fm.target];
          if (a == null || b == null) return false;
          if (a === b) return true;
          return t ? t.glossesOverlap(a, b) : false;
        }
      : function () { return false; };

    if (difficulty === 'hard' && window.WordSimilarity && currentWord) {
      var distractors = window.WordSimilarity.pickConfusableDistractors(currentWord, wordPool, {
        // 反向先多挑几个：同义排除后可能凑不满 3 个干扰项
        count: reverse ? 6 : 3,
        sourceField: fm.source,
        targetField: optionField,
        correctTarget: correctAnswer
      });
      for (var d = 0; d < distractors.length && options.length < 4; d++) {
        if (sameMeaningAsPrompt(distractors[d])) continue;
        options.push(distractors[d][optionField]);
      }
      if (options.length >= 4) return this.shuffleArray(options);
      // 相似干扰项不足（小词池/同义排除太多）时，落回随机补齐
    }

    // easy / 回退：随机，但同样不允许同义或占位释义的干扰项
    var chosen = [];
    var otherWords = wordPool.filter(function (w) {
      if (!w || w === currentWord) return false;
      var candidate = w[optionField];
      if (candidate == null || candidate === '') return false;
      if (candidate === correctAnswer) return false;
      if (w[fm.source] === currentWord[fm.source]) return false;
      if (sameMeaningAsPrompt(w)) return false;
      if (t && t.isPlaceholderGloss(candidate)) return false;
      if (!reverse && t && t.glossesOverlap(candidate, correctAnswer)) return false;
      return true;
    });

    var shuffled = this.shuffleArray(otherWords);
    for (var i = 0; i < shuffled.length && chosen.length < 3; i++) {
      var value = shuffled[i][optionField];
      var clash = false;
      for (var c = 0; c < chosen.length && !clash; c++) {
        clash = chosen[c] === value || (t && !reverse && t.glossesOverlap(chosen[c], value));
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
    var mastered = this.config.mastered;
    var alreadyMastered = !!(mastered && typeof mastered.has === 'function' && mastered.has(key));
    var outcome = MasteryPolicy.record(lang, key, isCorrect, {
      word: word,
      mastered: alreadyMastered,   // 已掌握的词再答对一次不该"退回未掌握"
      timeSpent: opts && opts.timeSpent
    });
    result.streak = outcome.streak;
    result.mastered = outcome.mastered;

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
  // localStorage 不可用（隐私模式 / 配额爆了 / file:// 沙箱）时的会话内兜底，
  // 保证 record() 的连对计数在同一次会话里仍然成立，而不是永远停在 streak = 1。
  var streakMemory = Object.create(null);

  function normalizeStreak(value) {
    var n = typeof value === 'number' ? value : parseInt(value, 10);
    if (!isFinite(n) || n <= 0) return 0;
    return Math.floor(n);
  }

  // 存储里可能是被别的代码写坏的字符串 / 数组 / null —— 一律回退成空表，
  // 严格模式下往原始值上赋值会抛 TypeError。
  function asPlainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return Object.create(null);
    return value;
  }

  var MasteryPolicy = {
    STREAK_REQUIRED: 2,
    KEY_PREFIX: 'dimenticato_mastery_streak_',

    storageKey: function (lang) {
      return MasteryPolicy.KEY_PREFIX + (lang || 'italian');
    },

    _load: function (lang) {
      var name = MasteryPolicy.storageKey(lang);
      var ls = storage();
      if (!ls) return asPlainObject(streakMemory[name]);
      try {
        return asPlainObject(JSON.parse(ls.getItem(name) || '{}'));
      } catch (e) {
        return Object.create(null);
      }
    },

    _save: function (lang, data) {
      var name = MasteryPolicy.storageKey(lang);
      var ls = storage();
      if (!ls) { streakMemory[name] = data; return; }
      try {
        ls.setItem(name, JSON.stringify(data));
      } catch (e) {
        streakMemory[name] = data;   // 配额满时至少本次会话还是对的
      }
    },

    getStreak: function (lang, key) {
      if (key == null || key === '') return 0;
      return normalizeStreak(MasteryPolicy._load(lang)[String(key)]);
    },

    /** SM-2 已经把这个词排到长间隔时，直接算掌握 */
    _srMastered: function (word) {
      if (!word || !word.srData) return false;
      var sr = (typeof window !== 'undefined') ? window.SpacedRepetition : null;
      if (!sr) return false;
      return (word.srData.repetitions || 0) >= 2 && (word.srData.interval || 0) >= 6;
    },

    /**
     * 记录一次作答。**签名固定**：四个语言的 App 都按这个契约调用。
     * @param {string} lang     语言标识（分语言存储）
     * @param {string} key      词条 key（一般是原文词形）
     * @param {boolean} isCorrect
     * @param {Object} [opts]
     * @param {Object} [opts.word]      词条对象，用来看 SM-2 的 srData
     * @param {boolean} [opts.mastered] 调用方已知这个词早就掌握了（幂等用）
     * @returns {{streak:number, mastered:boolean}}
     */
    record: function (lang, key, isCorrect, opts) {
      opts = opts || {};
      if (key == null || key === '') return { streak: 0, mastered: false };
      key = String(key);

      var data = MasteryPolicy._load(lang);
      var previous = normalizeStreak(data[key]);

      // 答错：连对计数归零，词条从存储里移除
      if (!isCorrect) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          delete data[key];
          MasteryPolicy._save(lang, data);
        }
        return { streak: 0, mastered: false };
      }

      var streak = previous + 1;
      var required = normalizeStreak(MasteryPolicy.STREAK_REQUIRED) || 2;
      var mastered = streak >= required ||
        opts.mastered === true ||               // 已经掌握过的词再答对一次，仍然是掌握
        MasteryPolicy._srMastered(opts.word);

      if (mastered) {
        // 掌握后不必再占存储；同时保证重复调用得到同样的结果（幂等）
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          delete data[key];
          MasteryPolicy._save(lang, data);
        }
      } else {
        data[key] = streak;
        MasteryPolicy._save(lang, data);
      }
      return { streak: streak, mastered: mastered };
    },

    clear: function (lang) {
      var name = MasteryPolicy.storageKey(lang);
      delete streakMemory[name];
      var ls = storage();
      if (!ls) return;
      try { ls.removeItem(name); } catch (e) {}
    }
  };

  // ===== 难度偏好（localStorage 持久化，默认困难） =====
  QuizEngine.DIFFICULTY_KEY = 'dimenticato_quiz_difficulty';
  QuizEngine.LANGUAGES = ['italian', 'german', 'english', 'french'];

  QuizEngine.difficultyKeyFor = function (lang) {
    return lang ? QuizEngine.DIFFICULTY_KEY + '_' + lang : QuizEngine.DIFFICULTY_KEY;
  };

  /**
   * 有界干扰项采样：从全量词池中抽一个不超过 size 的小池交给 generateOptions。
   *
   * 为什么必须采样：generateOptions 的 easy/回退路径要对池做整表
   * filter（每词一次同义判断）+ 整表洗牌，hard 路径的
   * WordSimilarity 索引也按「池数组的身份」缓存——意/法曾把 24k~27k
   * 全池（法语甚至是每题新建的数组，索引缓存永远失效）直接喂进来，
   * 每题几十毫秒。采样后池恒定 ≤800，且数组引用跨题稳定，索引缓存生效。
   *
   * 采样策略（与德语站 battle-tested 的实现一致）：
   *   1) 词频邻域优先：rank 相近的词难度接近，更适合做干扰项；
   *   2) 等距抽样兜底/补足：覆盖各个词频段。
   */
  QuizEngine.DISTRACTOR_POOL_SIZE = 800;

  QuizEngine.sampleDistractorPool = function (source, currentWord, size) {
    var want = size || QuizEngine.DISTRACTOR_POOL_SIZE;
    var pool = Array.isArray(source) ? source : [];
    if (pool.length <= want) return pool.slice();

    var picked = [];
    // 1) 词频邻域：两个词库都按 rank 升序时可直接按 rank 定位
    var rank = currentWord && Number(currentWord.rank);
    if (Number.isFinite(rank) && pool[rank - 1] && pool[rank - 1].rank === rank) {
      var half = Math.floor(want / 2);
      var start = Math.max(0, rank - 1 - half);
      picked.push.apply(picked, pool.slice(start, start + want));
    }
    // 2) 等距抽样兜底 / 补足：覆盖各个词频段
    var stride = pool.length / (want / 2);
    for (var i = 0; picked.length < want && i < pool.length; i += 1) {
      var index = Math.floor(i * stride) % pool.length;
      picked.push(pool[index]);
    }
    return picked;
  };

  /**
   * 读取难度。传语言时优先用该语言的设置，没有则回落到全局设置。
   * 不传语言时读全局设置（旧调用方保持原行为）。
   */
  QuizEngine.getDifficulty = function (lang) {
    var scoped = readScopedDifficulty(lang);
    if (scoped) return scoped;
    var ls = storage();
    if (!ls) return 'hard';
    try {
      return ls.getItem(QuizEngine.DIFFICULTY_KEY) === 'easy' ? 'easy' : 'hard';
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
      // 出题方向与难度同属「学习偏好」，共用一张卡片、一次挂载
      card.innerHTML = '<div class="settings-card-title">学习偏好</div>' +
        QuizEngine.renderDifficultyToggle(entry.lang) +
        QuizEngine.renderDirectionToggle(entry.lang);
      host.appendChild(card);
      mounted++;
    });
    if (mounted) {
      QuizEngine.syncDifficultyToggles(scope);
      QuizEngine.syncDirectionToggles(scope);
    }
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

  // ===== 出题方向偏好（正向=看外语选释义，反向=看释义选外语；默认正向） =====
  QuizEngine.DIRECTION_KEY = 'dimenticato_quiz_direction';

  QuizEngine.directionKeyFor = function (lang) {
    return lang ? QuizEngine.DIRECTION_KEY + '_' + lang : QuizEngine.DIRECTION_KEY;
  };

  /** 读取方向。传语言时优先用该语言的设置，没有则回落到全局设置。 */
  QuizEngine.getDirection = function (lang) {
    var scoped = readScopedDirection(lang);
    if (scoped) return scoped;
    var ls = storage();
    if (!ls) return 'forward';
    try {
      return ls.getItem(QuizEngine.DIRECTION_KEY) === 'reverse' ? 'reverse' : 'forward';
    } catch (e) {
      return 'forward';
    }
  };

  /** 写入方向。传语言时只改该语言，否则改全局（并清掉分语言覆盖）。 */
  QuizEngine.setDirection = function (value, lang) {
    var v = value === 'reverse' ? 'reverse' : 'forward';
    var ls = storage();
    if (!ls) return v;
    try {
      if (lang) {
        ls.setItem(QuizEngine.directionKeyFor(lang), v);
      } else {
        ls.setItem(QuizEngine.DIRECTION_KEY, v);
        QuizEngine.LANGUAGES.forEach(function (l) {
          ls.removeItem(QuizEngine.directionKeyFor(l));
        });
      }
    } catch (e) {}
    return v;
  };

  /** 生成「出题方向」分段控件标记。只影响选择题；拼写模式本身就是释义→词形。 */
  QuizEngine.renderDirectionToggle = function (lang, label) {
    var current = QuizEngine.getDirection(lang);
    var scope = lang ? ' data-direction-lang="' + escAttr(lang) + '"' : '';
    var title = label || '出题方向';
    return '<div class="pref-row">' +
      '<span class="pref-label">' + esc(title) + '</span>' +
      '<div class="segmented direction-toggle"' + scope + ' role="group" aria-label="' + escAttr(title) + '">' +
      '<button type="button" class="seg direction-option' + (current === 'forward' ? ' active' : '') +
        '" data-direction="forward" title="看外语单词，选释义">正向</button>' +
      '<button type="button" class="seg direction-option' + (current === 'reverse' ? ' active' : '') +
        '" data-direction="reverse" title="看释义，选外语单词（召回式练习）">反向</button>' +
      '</div></div>';
  };

  /** 同步页面上所有方向控件的选中态（含运行时注入的）。 */
  QuizEngine.syncDirectionToggles = function (root) {
    if (typeof document === 'undefined') return;
    var scope = root || document;
    if (!scope.querySelectorAll) return;
    var buttons = scope.querySelectorAll('[data-direction]');
    Array.prototype.forEach.call(buttons, function (btn) {
      var group = btn.closest ? btn.closest('[data-direction-lang]') : null;
      var lang = group && group.dataset ? group.dataset.directionLang : '';
      var active = btn.dataset.direction === QuizEngine.getDirection(lang);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  /** 事件委托绑定所有方向控件，与难度控件同一模式，重复调用幂等。 */
  QuizEngine.bindDirectionToggles = function () {
    if (typeof document === 'undefined' || QuizEngine._directionBound) return;
    QuizEngine._directionBound = true;
    document.addEventListener('click', function (event) {
      var target = event.target;
      var btn = (target && target.closest) ? target.closest('[data-direction]') : null;
      if (!btn) return;
      var group = btn.closest('[data-direction-lang]');
      var lang = group && group.dataset ? group.dataset.directionLang : '';
      QuizEngine.setDirection(btn.dataset.direction, lang || null);
      QuizEngine.syncDirectionToggles();
    });
  };

  if (typeof document !== 'undefined' && document.addEventListener) {
    var initDifficultyUI = function () {
      QuizEngine.bindDifficultyToggles();
      QuizEngine.syncDifficultyToggles();
      QuizEngine.bindDirectionToggles();
      QuizEngine.syncDirectionToggles();
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
