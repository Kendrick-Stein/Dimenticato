(() => {
  const STORAGE_KEYS = {
    MASTERED: 'dimenticato_german_mastered',
    STATS: 'dimenticato_german_stats',
    FILTER: 'dimenticato_german_filter',
    LEVEL: 'dimenticato_german_level',
    SESSION: 'dimenticato_german_session',
    SR: 'dimenticato_german_sr',
    // 与 app.js Storage.KEYS.LANGUAGE 保持一致，统一读写同一个 key
    LANGUAGE: 'dimenticato_language',
    EN_MASTERED: 'dimenticato_english_mastered',
    EN_STATS: 'dimenticato_english_stats',
    EN_FILTER: 'dimenticato_english_filter',
    EN_LEVEL: 'dimenticato_english_level',
    EN_SESSION: 'dimenticato_english_session',
    EN_SR: 'dimenticato_english_sr'
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 共享小工具：词频/CEFR 分层、会话长度、SM-2 调度、跨模块（Stats/Header）桥接
  // 所有跨模块调用都在“调用时”通过 window.* 解析并做 typeof 保护，缺失时降级。
  // ─────────────────────────────────────────────────────────────────────────

  const TIER_OPTIONS = [
    { value: '1000', label: '初级 · 1,000 词' },
    { value: '3000', label: '中级 · 3,000 词' },
    { value: '5000', label: '高级 · 5,000 词' },
    { value: 'all', label: '全部' }
  ];

  const SESSION_OPTIONS = [
    { value: '20', label: '每组 20 题' },
    { value: '50', label: '每组 50 题' },
    { value: '100', label: '每组 100 题' },
    { value: 'all', label: '不限题量' }
  ];

  // 本模块托管的三门语言各自的首页。italian 不在表里：意大利语首页归 app.js 管。
  const LANGUAGE_HOME_SCREENS = {
    german: 'germanWelcomeScreen',
    english: 'englishWelcomeScreen',
    french: 'frenchWelcomeScreen'
  };

  /**
   * 地址栏是不是已经指向本语言里【首页以外】的某一块屏。
   * 用来区分「冷启动，该去首页」和「深链接把这门语言的包拉起来了，别抢屏」。
   * DimRouter 可能还没就绪（冷启动时 init() 跑在 DimRouter.start() 之前），
   * 那时返回 false，走原来的回首页逻辑，随后路由自己会把目标屏放上来。
   */
  function deepLinkedWithin(lang, homeScreenId) {
    const router = window.DimRouter;
    if (!router || typeof router.resolve !== 'function') return false;
    try {
      const route = router.resolve(window.location.hash);
      return !!(route && route.lang === lang && route.screenId !== homeScreenId);
    } catch (err) {
      return false;
    }
  }

  const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  // 数值分层 → 最高 CEFR 等级。数据集补上 level/cefr 后自动生效；没有该字段时
  // 回落到词频 rank（两个词库都是 rank 连续升序的频率表）。
  const TIER_MAX_CEFR = { '1000': 'A2', '3000': 'B1', '5000': 'B2' };

  function tierWords(words, tier) {
    if (!Array.isArray(words) || !words.length) return [];
    if (!tier || tier === 'all') return words.slice();
    const limit = Number(tier);
    if (!Number.isFinite(limit) || limit <= 0) return words.slice();

    const maxCefr = TIER_MAX_CEFR[String(limit)] || 'C2';
    const maxIndex = CEFR_ORDER.indexOf(maxCefr);
    const filtered = words.filter((word, index) => {
      const level = String(word.level || word.cefr || '').toUpperCase();
      const levelIndex = CEFR_ORDER.indexOf(level);
      if (levelIndex >= 0) return levelIndex <= maxIndex;
      const rank = Number(word.rank);
      return Number.isFinite(rank) ? rank <= limit : index < limit;
    });
    return filtered.length ? filtered : words.slice(0, limit);
  }

  function todayString() {
    return new Date().toISOString().split('T')[0];
  }

  function emptySrData() {
    return {
      easiness: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: todayString(),
      lastReviewDate: null
    };
  }

  // 本地 SM-2 兜底（共享 SpacedRepetition 缺失或签名不兼容时使用）。
  // 间隔上限 365 天，避免 app-enhanced.js 里已确认的 Date 溢出问题被继承。
  function fallbackSchedule(previous, quality) {
    const sr = Object.assign(emptySrData(), previous || {});
    sr.easiness = Math.max(1.3, (sr.easiness || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    if (quality < 3) {
      sr.repetitions = 0;
      sr.interval = 0;
    } else {
      if (sr.repetitions === 0) sr.interval = 1;
      else if (sr.repetitions === 1) sr.interval = 6;
      else sr.interval = Math.round(sr.interval * sr.easiness);
      sr.repetitions += 1;
    }
    sr.interval = Math.min(365, Math.max(0, sr.interval || 0));
    const next = new Date();
    next.setDate(next.getDate() + sr.interval);
    sr.nextReviewDate = next.toISOString().split('T')[0];
    sr.lastReviewDate = todayString();
    return sr;
  }

  // 一条 srData 是否真的被算过：只看 repetitions / interval / reviewHistory 的
  // 前后快照。
  // ⚠ 绝对不能用 nextReviewDate 判断 —— 它是从上一条记录拷过来的，永远是真值，
  // 于是“共享实现根本没碰这个对象”会被误判成“算好了”，函数把【原样未变】的旧
  // 记录返回出去，间隔从此再也不增长（每个词永远排到明天）。
  function srSnapshot(sr) {
    return {
      repetitions: sr.repetitions,
      interval: sr.interval,
      history: Array.isArray(sr.reviewHistory) ? sr.reviewHistory.length : 0
    };
  }

  function srWasScheduled(sr, before) {
    if (!sr || typeof sr !== 'object' || !sr.nextReviewDate) return false;
    if (sr.repetitions !== before.repetitions) return true;
    if (sr.interval !== before.interval) return true;
    // 答错时 repetitions/interval 可能本来就是 0 → 0，用共享实现必写的复习历史兜底
    return Array.isArray(sr.reviewHistory) && sr.reviewHistory.length > before.history;
  }

  function withoutHistory(sr) {
    const out = Object.assign({}, sr);
    // 15,507 个词各存 20 条复习历史会撑爆 localStorage，这里只落盘调度字段
    delete out.reviewHistory;
    return out;
  }

  // 调用共享 SpacedRepetition.calculateNextReview。
  // 契约签名是 calculateNextReview(srData, quality)：它就地改写【传进去的那个
  // srData】并把它返回，所以必须先按这个签名调用，并从被改写的对象上读结果。
  // 旧签名 calculateNextReview(word, quality)（读写 word.srData）只作为兜底，
  // 是否生效一律由 srWasScheduled() 的快照对比判断。两种都没算 → 本地实现。
  function scheduleReview(previous, quality) {
    const SR = typeof window !== 'undefined' ? window.SpacedRepetition : null;
    if (SR && typeof SR.calculateNextReview === 'function') {
      // ① 契约签名：srData 本身
      try {
        const srData = Object.assign({ reviewHistory: [] }, emptySrData(), previous || {});
        if (!Array.isArray(srData.reviewHistory)) srData.reviewHistory = [];
        const before = srSnapshot(srData);
        const returned = SR.calculateNextReview(srData, quality);
        // 实现可能返回同一个对象，也可能返回新对象；两者都要能识别
        const sr = (returned && typeof returned === 'object' && 'easiness' in returned) ? returned : srData;
        if (srWasScheduled(sr, before)) return withoutHistory(sr);
      } catch (error) { /* 降级到旧签名 */ }
      // ② 旧签名兜底：carrier.srData
      try {
        const carrier = { srData: Object.assign({ reviewHistory: [] }, emptySrData(), previous || {}) };
        const before = srSnapshot(carrier.srData);
        SR.calculateNextReview(carrier, quality);
        if (srWasScheduled(carrier.srData, before)) return withoutHistory(carrier.srData);
      } catch (error) { /* 降级到本地实现 */ }
    }
    return fallbackSchedule(previous, quality);
  }

  function correctnessToQuality(isCorrect, durationMs) {
    if (!isCorrect) return 2;
    return durationMs && durationMs < 3000 ? 5 : 4;
  }

  // 掌握门槛。四选一蒙对的概率是 25%，"答对一次 = 已掌握" 会让进度条凭运气上涨
  // 且永不回落。统一走共享的 window.MasteryPolicy（key: dimenticato_mastery_streak_<lang>）：
  // 连续答对 STREAK_REQUIRED 次（或 SM-2 已把它排到长间隔）才算掌握，答错清零。
  // 与 lib/quiz-engine.js 里意大利语/法语走的是同一份策略，这里只在调用时解析。
  const LOCAL_STREAKS = {};

  function recordMastery(lang, key, isCorrect, word) {
    const policy = typeof window !== 'undefined' ? window.MasteryPolicy : null;
    if (policy && typeof policy.record === 'function') {
      try {
        const outcome = policy.record(lang, key, isCorrect, { word: word }) || {};
        return { streak: Number(outcome.streak) || 0, mastered: !!outcome.mastered };
      } catch (error) { /* 回落到本地等价实现 */ }
    }
    // MasteryPolicy 缺失时的本地等价实现（只在内存里记连击，语义保持一致）
    const required = (policy && Number(policy.STREAK_REQUIRED)) || 2;
    const store = LOCAL_STREAKS[lang] || (LOCAL_STREAKS[lang] = {});
    const streak = isCorrect ? (store[key] || 0) + 1 : 0;
    store[key] = streak;
    return { streak: streak, mastered: isCorrect && streak >= required };
  }

  // 德/英进度页的统计面板（与法语 Progress 对齐）：7 天柱状图、模式正确率、
  // 连续天数与 7 天记录表。数据来自共享 StatsManager（按语言分 storage key），
  // 由 app-enhanced.js 的 QuizIntegration 包装器在答题时写入，这里只读。
  function renderProgressPanels(lang, prefix, stats, setText) {
    const manager = typeof window !== 'undefined' ? window.StatsManager : null;
    const recent = (manager && typeof manager.getRecentStats === 'function')
      ? manager.getRecentStats(7, lang)
      : [];

    const bars = document.getElementById(`${prefix}ProgressWeekBars`);
    if (bars && recent.length) {
      const max = Math.max(1, ...recent.map(day => day.totalCount));
      const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
      bars.innerHTML = recent.map((day, index) => {
        const pct = Math.round(day.totalCount / max * 100);
        const label = dayNames[new Date(`${day.date}T00:00:00`).getDay()];
        const latest = index === recent.length - 1 ? ' latest' : '';
        return `<div class="bar-col"><div class="bar${latest}" style="height:${pct}%" title="${day.totalCount} 次作答"></div><div class="bar-day">${label}</div></div>`;
      }).join('');
    }

    const rows = document.getElementById(`${prefix}ProgressAccuracyRows`);
    if (rows) {
      const pct = (part, whole) => (whole > 0 ? Math.round(part / whole * 100) : 0);
      const mc = pct(stats.mcCorrect || 0, stats.mcAttempts || 0);
      const sp = pct(stats.spCorrect || 0, stats.spAttempts || 0);
      const attempts = (stats.mcAttempts || 0) + (stats.spAttempts || 0);
      const overall = pct((stats.mcCorrect || 0) + (stats.spCorrect || 0), attempts);
      const row = (label, value) =>
        `<div class="acc-row"><div class="acc-top"><span>${label}</span><b>${value}%</b></div>` +
        `<div class="acc-track"><div class="acc-fill" style="width:${value}%"></div></div></div>`;
      rows.innerHTML = row('选择题', mc) + row('拼写', sp) + row('综合', overall);
      setText(`${prefix}ProgressTotalAttempts`, attempts.toLocaleString());
      const streak = (manager && typeof manager.getStreak === 'function') ? manager.getStreak(lang) : 0;
      setText(`${prefix}ProgressStreak`, `${streak} 天`);
    }

    const body = document.getElementById(`${prefix}ProgressHistoryBody`);
    if (body && recent.length) {
      body.innerHTML = recent.slice().reverse().map(day => {
        const accuracy = day.totalCount > 0 ? (day.correctCount / day.totalCount * 100).toFixed(1) : '0.0';
        const date = new Date(`${day.date}T00:00:00`);
        const label = `${date.getMonth() + 1}月${date.getDate()}日`;
        const minutes = Math.round((day.duration || 0) / 60);
        const durationLabel = minutes < 60
          ? `${minutes} 分钟`
          : `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
        return `<tr><td>${label}</td><td>${day.wordsLearned}</td><td>${durationLabel}</td><td>${day.totalCount}</td><td>${accuracy}%</td></tr>`;
      }).join('');
    }
  }

  // 顶栏 词汇量 / 已掌握 / 进度。优先用共享 HeaderStats，缺失时直接写 DOM。
  // HeaderStats.set 自己会判断"当前语言"再决定要不要落笔，所以上报一律不设条件：
  // 不是当前语言时它只更新缓存，等切回这门语言时顶栏就已经是新数字了
  // （以前在这里提前 return，连缓存都不写，切回来还是旧的总词数/已掌握数）。
  function setHeaderStats(lang, total, mastered) {
    if (typeof document === 'undefined' || !document.body) return;
    const safeTotal = Number(total) || 0;
    const safeMastered = Number(mastered) || 0;
    const header = typeof window !== 'undefined' ? window.HeaderStats : null;
    if (header && typeof header.set === 'function') {
      try {
        header.set(lang, { total: safeTotal, mastered: safeMastered });
        return;
      } catch (error) { /* 回落到直接写 DOM */ }
    }
    // 没有 HeaderStats 时才自己写 DOM —— 这时必须自己做"当前语言"判断，
    // 否则会把别的语言的数字画到顶栏上。
    const active = document.body.getAttribute('data-language') || 'italian';
    if (active !== lang) return;
    const percent = safeTotal > 0 ? Math.round((safeMastered / safeTotal) * 100) : 0;
    const write = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    write('totalWords', safeTotal.toLocaleString());
    write('masteredWords', safeMastered.toLocaleString());
    write('progressPercent', `${percent}%`);
  }

  // grammarBookScreen / conjugationSetupScreen / communityBrowseScreen 是四种语言
  // 共用的屏幕，ScreenMeta 里只有意大利语的面包屑。这里在跳转后补上语言前缀。
  function setLanguageBreadcrumb(lang, tail) {
    const container = document.getElementById('breadcrumb');
    if (!container) return;
    const label = lang.charAt(0).toUpperCase() + lang.slice(1);
    const items = [label, ...tail];
    container.innerHTML = items
      .map((item, index) => `<span class="breadcrumb-item ${index === items.length - 1 ? 'current' : ''}">${escapeHtml(item)}</span>`)
      .join('<span class="breadcrumb-separator">/</span>');
  }

  // GrammarBook.init() 只在 data.meta 存在时重置阅读区，而德语/英语语法数据都没有
  // meta，于是会残留上一门语言的正文。这里在 init 之后自己重置一次。
  function resetGrammarReadingPane(title) {
    const breadcrumb = document.getElementById('grammarContentBreadcrumb');
    if (breadcrumb) breadcrumb.textContent = '选择左侧章节开始阅读';
    const body = document.getElementById('grammarContentBody');
    if (body) {
      body.innerHTML = `
        <div class="grammar-welcome">
          <span class="msr grammar-welcome-icon">auto_stories</span>
          <h2>${escapeHtml(title || '语法书')}</h2>
          <p>请从左侧目录选择章节开始阅读</p>
        </div>`;
    }
  }

  // 选择题干扰项候选池上限。困难模式会对整池跑一次编辑距离 + 排序
  // （lib/word-similarity.js），在 24,000 条上是每题 ~145ms 的主线程停顿。
  const DISTRACTOR_POOL_SIZE = 800;

  function sampleDistractorPool(source, currentWord) {
    const pool = Array.isArray(source) ? source : [];
    if (pool.length <= DISTRACTOR_POOL_SIZE) return pool.slice();

    const picked = [];
    // 1) 词频邻域：难度接近的词更适合做干扰项（两个词库都按 rank 升序）
    const rank = currentWord && Number(currentWord.rank);
    if (Number.isFinite(rank) && pool[rank - 1] && pool[rank - 1].rank === rank) {
      const half = Math.floor(DISTRACTOR_POOL_SIZE / 2);
      const start = Math.max(0, rank - 1 - half);
      picked.push(...pool.slice(start, start + DISTRACTOR_POOL_SIZE));
    }
    // 2) 等距抽样兜底 / 补足：覆盖各个词频段
    const stride = pool.length / (DISTRACTOR_POOL_SIZE / 2);
    for (let i = 0; picked.length < DISTRACTOR_POOL_SIZE && i < pool.length; i += 1) {
      const index = Math.floor(i * stride) % pool.length;
      picked.push(pool[index]);
    }
    return picked;
  }

  function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function renderChips(container, options, activeValue, attribute) {
    if (!container) return;
    container.innerHTML = options.map((option) => `
      <button class="chip${option.value === activeValue ? ' active' : ''}" type="button" ${attribute}="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</button>
    `).join('');
  }

  // grammarBookScreen 的返回按钮是德/英共用的共享屏，双侧初始化顺序不确定
  // （英语直连 #/en/… 时 GermanApp 可能永远不 init），谁先到谁绑，只绑一次。
  let grammarBookBackBound = false;

  const GermanApp = {
    words: [],
    systemWords: [],
    sessionWords: [],
    mastered: new Set(),
    srData: {},
    stats: {
      mcAttempts: 0,
      mcCorrect: 0,
      spAttempts: 0,
      spCorrect: 0
    },
    currentWord: null,
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    browseFilter: 'all',
    activeLanguage: 'italian',
    communityReturnScreen: 'vocabularyScreen',
    // 'system' | 'course' | 'wordbook' —— 决定是否应用词频分层
    sourceType: 'system',
    tier: '1000',
    sessionSize: '20',
    ready: false,
    _mcEngine: null,
    _duplicateHeadwords: null,
    _questionStartedAt: 0,
    _browse: { words: [], rendered: 0, pageSize: 200 },

    _getMcEngine() {
      if (!this._mcEngine) {
        this._mcEngine = new QuizEngine({
          state: {
            get words() { return GermanApp.sessionWords; },
            get quizIndex() { return GermanApp.quizIndex; },
            set quizIndex(v) { GermanApp.quizIndex = v; },
            get quizCorrect() { return GermanApp.quizCorrect; },
            set quizCorrect(v) { GermanApp.quizCorrect = v; },
            get quizTotal() { return GermanApp.quizTotal; },
            set quizTotal(v) { GermanApp.quizTotal = v; },
            get currentWord() { return GermanApp.currentWord; },
            set currentWord(v) { GermanApp.currentWord = v; }
          },
          stats: GermanApp.stats,
          mastered: GermanApp.mastered,
          fieldMap: { source: 'german', target: 'meaning' },
          get difficulty() { return QuizEngine.getDifficulty(); },
          saveFn: function () { GermanApp.saveState(); },
          onUpdateStats: function () {},
          dom: {
            optionsContainer: document.getElementById('germanMcOptions'),
            feedbackEl: document.getElementById('germanMcFeedback'),
            feedbackTextEl: document.querySelector('#germanMcFeedback .feedback-text'),
            progressCurrent: document.getElementById('germanMcCurrentWord'),
            progressTotal: document.getElementById('germanMcTotalWords'),
            accuracyEl: document.getElementById('germanMcAccuracy')
          }
        });
      }
      this._mcEngine.config.stats = this.stats;
      this._mcEngine.config.mastered = this.mastered;
      return this._mcEngine;
    },

    init() {
      if (typeof GERMAN_VOCABULARY_DATA === 'undefined') {
        console.warn('GERMAN_VOCABULARY_DATA 未加载，跳过 GermanApp 初始化');
        this.showVocabularyLoadError();
        return;
      }

      this.systemWords = Array.isArray(GERMAN_VOCABULARY_DATA) ? GERMAN_VOCABULARY_DATA.slice() : [];
      this.loadState();
      this.words = tierWords(this.systemWords, this.tier);
      this.bindLanguageSwitcher();
      this.bindGermanNavigation();
      this.bindGermanPractice();
      this.bindGrammarBookTriggers();
      this.bindConjugationTriggers();
      this.bindLanguageSettingsAndProgress();
      this.bindPlaceholderTriggers();
      this.installScopeControls();
      this.applyInitialLanguage();
      this.watchLanguageChanges();
      // 词库就绪标记：GermanCourse.init() 依赖它，避免词库缺失时课程屏
      // 仍然渲染出一堆“0 个核心词”的空壳。
      this.ready = true;

      // Init English app after German app
      EnglishApp.init(this);
      this.refreshActiveHeaderStats();
    },

    // 语言可以从首页的 LanguagePortal 卡片或右上角切换器进入，而 app.js 只在
    // 切到法语时刷新顶栏。body[data-language] 是唯一可靠的信号，监听它即可覆盖
    // 所有入口。
    watchLanguageChanges() {
      if (typeof MutationObserver === 'undefined' || !document.body) return;
      const observer = new MutationObserver(() => this.refreshActiveHeaderStats());
      observer.observe(document.body, { attributes: true, attributeFilter: ['data-language'] });
    },

    // 顶栏统计一直只有意大利语在写，切到德语/英语时会残留意大利语数字。
    refreshActiveHeaderStats() {
      const active = document.body ? document.body.getAttribute('data-language') : null;
      if (active === 'german') this.updateHeaderStats();
      else if (active === 'english') EnglishApp.updateHeaderStats();
    },

    // 德语词库加载失败时给出可见的错误状态，而不是静默地不绑定任何按钮。
    showVocabularyLoadError() {
      const container = document.querySelector('#germanWelcomeScreen .container');
      if (!container || document.getElementById('germanVocabularyLoadError')) return;
      container.insertAdjacentHTML('beforeend', `
        <div class="settings-card" id="germanVocabularyLoadError">
          <div class="settings-card-title">德语词库加载失败</div>
          <div class="about-body">data/german-vocabulary.js 未能载入，德语词汇、课程与练习功能暂不可用。请检查网络后刷新页面重试。</div>
        </div>
      `);
    },

    loadState() {
      try {
        const mastered = localStorage.getItem(STORAGE_KEYS.MASTERED);
        if (mastered) {
          this.mastered = new Set(JSON.parse(mastered));
        }

        const stats = localStorage.getItem(STORAGE_KEYS.STATS);
        if (stats) {
          this.stats = {
            ...this.stats,
            ...JSON.parse(stats)
          };
        }

        const filter = localStorage.getItem(STORAGE_KEYS.FILTER);
        if (filter) {
          this.browseFilter = filter;
        }

        const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
        if (language) {
          this.activeLanguage = language;
        }

        const tier = localStorage.getItem(STORAGE_KEYS.LEVEL);
        if (tier && TIER_OPTIONS.some((option) => option.value === tier)) {
          this.tier = tier;
        }

        const sessionSize = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (sessionSize && SESSION_OPTIONS.some((option) => option.value === sessionSize)) {
          this.sessionSize = sessionSize;
        }

        const srData = localStorage.getItem(STORAGE_KEYS.SR);
        if (srData) {
          const parsed = JSON.parse(srData);
          if (parsed && typeof parsed === 'object') this.srData = parsed;
        }
      } catch (error) {
        console.error('GermanApp 状态加载失败:', error);
      }
    },

    // 延迟落盘：每答一题 7 次 setItem（含整份 mastered 数组）在上万词库后
    // 是可感知的卡顿。脏标记 + 500ms 合并写，关闭页面 / 切后台统一冲刷。
    _persist: null,

    /** 立即冲刷挂起的写：切换词库来源前必须调用（_writeState 落盘时才读
     *  currentWordbook，不冲刷会把旧来源的进度写进新来源的 key）。 */
    flushState() {
      if (this._persist) this._persist.flush();
    },

    saveState() {
      if (!this._persist) this._persist = window.deferredPersist(() => this._writeState(), 500);
      this._persist();
      this.updateHeaderStats();
    },

    _writeState() {
      try {
        const masteredKey = this.currentWordbook
          ? `dimenticato_progress_wb_german_${this.currentWordbook.id}`
          : STORAGE_KEYS.MASTERED;
        localStorage.setItem(masteredKey, JSON.stringify([...this.mastered]));
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
        localStorage.setItem(STORAGE_KEYS.FILTER, this.browseFilter);
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, this.activeLanguage);
        localStorage.setItem(STORAGE_KEYS.LEVEL, this.tier);
        localStorage.setItem(STORAGE_KEYS.SESSION, this.sessionSize);
        localStorage.setItem(STORAGE_KEYS.SR, JSON.stringify(this.srData));
      } catch (error) {
        console.error('GermanApp 状态保存失败:', error);
      }
    },

    updateHeaderStats() {
      setHeaderStats('german', this.words.length, this.countMastered(this.words));
    },

    // ── 掌握状态 ────────────────────────────────────────────────────────────
    // 15,507 条德语词里有 57 个完全同形的词条（Bank 长凳 / Bank 银行 …）。
    // 只用 word.german 作 key 会让掌握其中一个连带掌握另一个，因此同形词
    // 额外拼上词性/释义做区分；非同形词仍用原来的词形 key，历史进度不受影响。
    duplicateHeadwords() {
      if (this._duplicateHeadwords) return this._duplicateHeadwords;
      const seen = new Set();
      const duplicates = new Set();
      this.systemWords.forEach((word) => {
        const headword = word && word.german;
        if (!headword) return;
        if (seen.has(headword)) duplicates.add(headword);
        else seen.add(headword);
      });
      this._duplicateHeadwords = duplicates;
      return duplicates;
    },

    masteredKey(word) {
      if (!word) return '';
      if (word.id) return String(word.id);
      const headword = word.german || '';
      if (!this.duplicateHeadwords().has(headword)) return headword;
      return `${headword}·${word.notes || word.meaning || ''}`;
    },

    isMastered(word) {
      return this.mastered.has(this.masteredKey(word));
    },

    countMastered(words) {
      if (!Array.isArray(words) || !words.length) return 0;
      let count = 0;
      words.forEach((word) => {
        if (this.mastered.has(this.masteredKey(word))) count += 1;
      });
      return count;
    },

    bindLanguageSwitcher() {
      const toggleBtn = document.getElementById('languageSwitchBtn');
      const popover = document.getElementById('languageSwitcherPopover');
      if (!toggleBtn || !popover) return;

      toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        popover.classList.toggle('hidden');
      });

      document.addEventListener('click', (event) => {
        if (!popover.contains(event.target) && event.target !== toggleBtn && !toggleBtn.contains(event.target)) {
          popover.classList.add('hidden');
        }
      });

      document.querySelectorAll('.language-switcher-option').forEach((option) => {
        option.addEventListener('click', () => {
          const language = option.dataset.language || 'italian';
          this.switchLanguage(language);
          popover.classList.add('hidden');
        });
      });
    },

    applyInitialLanguage() {
      this.updateLanguageSwitcherUI(this.activeLanguage);
      const home = LANGUAGE_HOME_SCREENS[this.activeLanguage];
      if (!home) return;

      // 本模块是懒加载的：从别的语言深链接过去（#/de/vocab/cognates 会触发
      // LangLoader.ensure('german')）时，init() 是在路由已经把目标屏显示出来
      // 之后才跑的。那时无条件回首页会把用户刚打开的那一屏顶掉，地址栏也被
      // 一起改写成 #/de/home。地址栏已经指向本语言的另一块屏时就只重置导航栈，
      // 不抢屏幕。
      if (deepLinkedWithin(this.activeLanguage, home)) {
        if (typeof AppState !== 'undefined' && AppState) AppState.navigationStack = [home];
        return;
      }
      this.resetToScreen(home);
    },

    switchLanguage(language) {
      this.activeLanguage = language;
      this.saveState();

      // 委托给 LanguagePortal 处理 body[data-language] 颜色主题、
      // localStorage 持久化、active 样式更新以及屏幕导航。
      if (typeof window.LanguagePortal !== 'undefined') {
        window.LanguagePortal.selectLanguage(language);
      } else {
        // 回退：LanguagePortal 未加载时的降级处理
        this.updateLanguageSwitcherUI(language);
        this.resetToScreen(LANGUAGE_HOME_SCREENS[language] || 'welcomeScreen');
      }

      this.refreshActiveHeaderStats();
    },

    updateLanguageSwitcherUI(language) {
      document.querySelectorAll('.language-switcher-option').forEach((option) => {
        option.classList.toggle('active', option.dataset.language === language);
      });
    },

    bindGermanNavigation() {
      this.bindClick('goGermanVocabularyBtn', () => this.showScreen('germanVocabularyScreen'));
      this.bindClick('goGermanGrammarBtn', () => this.showScreen('germanGrammarScreen'));
      // goGermanProgressBtn is bound in bindLanguageSettingsAndProgress() (it also
      // refreshes the progress stats before showing the screen). Bound once there.
      this.bindClick('goGermanSettingsBtn', () => this.showScreen('germanSettingsScreen'));

      this.bindClick('germanVocabularyBackBtn', () => this.goBack('germanWelcomeScreen'));
      this.bindClick('germanSystemVocabularyBtn', () => this.selectSystemVocabulary());
      this.bindClick('germanWordbooksBtn', () => this.renderLanguageWordbooks('german'));
      this.bindClick('germanCommunityBtn', () => this.openSharedCommunity('germanVocabularyScreen'));

      this.bindClick('germanModesBackBtn', () => this.goBack('germanVocabularyScreen'));
      this.bindClick('germanGrammarBackBtn', () => this.goBack('germanWelcomeScreen'));
      this.bindClick('germanProgressBackBtn', () => this.goBack('germanWelcomeScreen'));
      this.bindClick('germanSettingsBackBtn', () => this.goBack('germanWelcomeScreen'));

      this.bindClick('englishVocabularyBackBtn', () => this.goBack('englishWelcomeScreen'));
      this.bindClick('englishGrammarBackBtn', () => this.goBack('englishWelcomeScreen'));
      this.bindClick('englishProgressBackBtn', () => this.goBack('englishWelcomeScreen'));
      this.bindClick('englishSettingsBackBtn', () => this.goBack('englishWelcomeScreen'));
      this.bindClick('goEnglishVocabularyBtn', () => this.showScreen('englishVocabularyScreen'));
      this.bindClick('goEnglishGrammarBtn', () => this.showScreen('englishGrammarScreen'));
      // goEnglishProgressBtn is bound in bindLanguageSettingsAndProgress() (it also
      // refreshes the progress stats before showing the screen). Bound once there.
      this.bindClick('goEnglishSettingsBtn', () => this.showScreen('englishSettingsScreen'));
      this.bindClick('englishSystemVocabularyBtn', () => EnglishApp.selectSystemVocabulary());
      this.bindClick('englishWordbooksBtn', () => this.renderLanguageWordbooks('english'));
      this.bindClick('englishCommunityBtn', () => this.openSharedCommunity('englishVocabularyScreen'));
      this.bindClick('englishModesBackBtn', () => this.goBack('englishVocabularyScreen'));

      this.bindClick('germanImportWordbookBtn', () => document.getElementById('germanWordbookFileInput')?.click());
      this.bindClick('englishImportWordbookBtn', () => document.getElementById('englishWordbookFileInput')?.click());
      this.bindClick('germanCreateWordbookBtn', () => this.createLanguageWordbook('german'));
      this.bindClick('englishCreateWordbookBtn', () => this.createLanguageWordbook('english'));

      document.getElementById('germanWordbookFileInput')?.addEventListener('change', (e) => this.handleLanguageWordbookImport(e, 'german'));
      document.getElementById('englishWordbookFileInput')?.addEventListener('change', (e) => this.handleLanguageWordbookImport(e, 'english'));
    },

    createLanguageWordbook(language) {
      if (typeof WordbookEditor === 'undefined') {
        alert('单词本编辑功能未加载。');
        return;
      }
      const wordbook = WordbookEditor.createNewWordbook(language);
      if (wordbook) {
        this.renderLanguageWordbooks(language);
      }
    },

    loadSystemMastery() {
      try {
        this.mastered = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERED) || '[]'));
      } catch (error) {
        this.mastered = new Set();
      }
    },

    updateGermanModesCopy(title, description) {
      const screen = document.getElementById('germanVocabularyModesScreen');
      if (!screen) return;
      const titleElement = screen.querySelector('h1.page');
      const descriptionElement = screen.querySelector('p.desc');
      if (titleElement) titleElement.textContent = title;
      if (descriptionElement) descriptionElement.textContent = description;
    },

    selectSystemVocabulary() {
      this.flushState();
      this.currentWordbook = null;
      this.sourceType = 'system';
      this.words = tierWords(this.systemWords, this.tier);
      this.loadSystemMastery();
      this.updateGermanModesCopy('选择练习方式', this.describeSystemScope());
      this.renderScopeControls();
      this.updateHeaderStats();
      this.showScreen('germanVocabularyModesScreen');
    },

    describeSystemScope() {
      const tierLabel = this.tier === 'all'
        ? '完整德语系统词库'
        : `德语高频前 ${Number(this.tier).toLocaleString()} 词`;
      const sessionLabel = this.sessionSize === 'all'
        ? '不限题量'
        : `每组 ${this.sessionSize} 题`;
      return `当前使用${tierLabel}，共 ${this.words.length.toLocaleString()} 词 · ${sessionLabel}。`;
    },

    selectCourseVocabulary({ label, words }) {
      const selectedWords = Array.isArray(words) ? words.filter(Boolean) : [];
      if (selectedWords.length < 4) {
        alert('这个课程单元暂时没有足够的可练习词汇。');
        return;
      }
      this.flushState();
      this.currentWordbook = null;
      this.sourceType = 'course';
      this.words = selectedWords;
      this.loadSystemMastery();
      this.updateGermanModesCopy(
        label,
        `课程核心词汇 ${selectedWords.length} 个；可使用选择题、拼写或浏览模式。`
      );
      this.renderScopeControls();
      this.updateHeaderStats();
      this.showScreen('germanVocabularyModesScreen');
    },

    // ── 练习范围（词频分层 + 每组题量）────────────────────────────────────
    // index.html 由其它工作流持有，这里在运行时把 chips 注入练习方式屏，
    // 与意大利语的 data-level chips 保持一致的交互。
    installScopeControls() {
      const screen = document.getElementById('germanVocabularyModesScreen');
      const container = screen ? screen.querySelector('.container') : null;
      const grid = container ? container.querySelector('.card-grid') : null;
      if (!grid || document.getElementById('germanScopeControls')) return;

      grid.insertAdjacentHTML('beforebegin', `
        <div id="germanScopeControls">
          <div class="sub-label" id="germanTierLabel">词频范围</div>
          <div class="chips wrap" id="germanTierChips" aria-label="选择德语词频范围"></div>
          <div class="sub-label" style="margin-top:14px">每组题量</div>
          <div class="chips wrap" id="germanSessionChips" aria-label="选择每组题量"></div>
        </div>
      `);

      document.getElementById('germanTierChips')?.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-german-tier]');
        if (chip) this.setTier(chip.dataset.germanTier);
      });
      document.getElementById('germanSessionChips')?.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-german-session]');
        if (chip) this.setSessionSize(chip.dataset.germanSession);
      });

      this.renderScopeControls();
    },

    renderScopeControls() {
      const wrapper = document.getElementById('germanScopeControls');
      if (!wrapper) return;
      const tierChips = document.getElementById('germanTierChips');
      const tierLabel = document.getElementById('germanTierLabel');
      const isSystem = this.sourceType === 'system';
      // 词频分层只对系统词库有意义；课程单元/个人词本保持原样。
      if (tierChips) tierChips.classList.toggle('hidden', !isSystem);
      if (tierLabel) tierLabel.classList.toggle('hidden', !isSystem);

      const options = TIER_OPTIONS.map((option) => (
        option.value === 'all'
          ? { value: 'all', label: `全部 · ${this.systemWords.length.toLocaleString()} 词` }
          : option
      ));
      renderChips(tierChips, options, this.tier, 'data-german-tier');
      renderChips(document.getElementById('germanSessionChips'), SESSION_OPTIONS, this.sessionSize, 'data-german-session');
    },

    // 词频分层换了 → this.words 换了 → 顶栏的"词汇量 / 已掌握 / 进度"必须跟着换。
    // 和 selectSystemVocabulary / selectCourseVocabulary 一样显式刷新一次，
    // 不依赖 saveState() 的副作用（localStorage 写失败或以后被重构掉都会静默漏刷）。
    setTier(tier) {
      if (!TIER_OPTIONS.some((option) => option.value === tier)) return;
      this.tier = tier;
      if (this.sourceType === 'system') {
        this.words = tierWords(this.systemWords, this.tier);
        this.updateGermanModesCopy('选择练习方式', this.describeSystemScope());
      }
      this.saveState();
      this.renderScopeControls();
      this.updateHeaderStats();
    },

    setSessionSize(size) {
      if (!SESSION_OPTIONS.some((option) => option.value === size)) return;
      this.sessionSize = size;
      if (this.sourceType === 'system') {
        this.updateGermanModesCopy('选择练习方式', this.describeSystemScope());
      }
      this.saveState();
      this.renderScopeControls();
      this.updateHeaderStats();
    },

    async handleLanguageWordbookImport(event, language) {
      const file = event?.target?.files?.[0];
      if (!file || typeof WordbookManager === 'undefined') return;
      try {
        const result = await WordbookManager.importFromFileWithLanguage(file, language);
        alert(`已导入词本：${result.wordbook.name}`);
        this.renderLanguageWordbooks(language);
      } catch (error) {
        alert(`导入失败：${error}`);
      }
      event.target.value = '';
    },

    renderLanguageWordbooks(language) {
      const containerId = language === 'german' ? 'germanWordbookCards' : 'englishWordbookCards';
      const screenId = language === 'german' ? 'germanVocabularyScreen' : 'englishVocabularyScreen';
      const container = document.getElementById(containerId);
      if (!container || typeof WordbookManager === 'undefined') {
        this.showScreen(screenId);
        return;
      }

      const wordbooks = WordbookManager.getWordbooksByLanguage(language);
      if (!wordbooks.length) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 1rem;">还没有词本</p>';
      } else {
        container.innerHTML = wordbooks.map(wb => `
          <div class="card wordbook-card" data-language-wordbook-id="${wb.id}">
            <button class="wordbook-card-manage-btn" data-manage-id="${wb.id}" title="管理单词本"><span class="msr">settings</span></button>
            <button class="wordbook-delete-btn" data-delete-id="${wb.id}" title="删除">×</button>
            <span class="card-chip"><span class="msr">bookmark</span></span>
            <span class="card-title">${escapeHtml(wb.name)}</span>
            <span class="card-desc">${wb.wordCount} 词 · ${new Date(wb.createdAt).toLocaleDateString()}</span>
          </div>
        `).join('');

        container.querySelectorAll('[data-language-wordbook-id]').forEach(card => {
          card.addEventListener('click', () => this.selectLanguageWordbook(parseInt(card.dataset.languageWordbookId, 10), language));
        });
        container.querySelectorAll('[data-manage-id]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            WordbookEditor?.openEditor(parseInt(btn.dataset.manageId, 10));
          });
        });
        container.querySelectorAll('[data-delete-id]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            WordbookManager?.deleteWordbook(parseInt(btn.dataset.deleteId, 10));
            this.renderLanguageWordbooks(language);
          });
        });
      }

      this.showScreen(screenId);
    },

    selectLanguageWordbook(id, language) {
      const wordbook = (typeof WordbookManager !== 'undefined' ? WordbookManager.getWordbooksByLanguage(language) : []).find(wb => wb.id === id);
      if (!wordbook || typeof WordbookManager === 'undefined') return;

      // 换来源前冲刷延迟写，避免旧来源进度落进新来源的 key（两侧各自再冲一次，
      // 保证从任何入口进来都安全）
      this.flushState();
      if (window.EnglishApp) EnglishApp._flushState();

      if (language === 'german') {
        this.currentWordbook = wordbook;
        this.sourceType = 'wordbook';
        this.sessionWords = [];
        this.currentWord = null;
        this.quizIndex = 0;
        this.quizCorrect = 0;
        this.quizTotal = 0;
        this.words = WordbookManager.mapWordbookWordsForLanguage(wordbook.words, 'german');
        this.loadWordbookProgress(id, 'german');
        this.updateGermanModesCopy(
          wordbook.name,
          `当前使用个人德语词本，共 ${this.words.length.toLocaleString()} 词。`
        );
        this.renderScopeControls();
        this.updateHeaderStats();
      } else {
        EnglishApp.selectWordbook(wordbook);
      }

      this.showScreen(language === 'german' ? 'germanVocabularyModesScreen' : 'englishVocabularyModesScreen');
    },

    loadWordbookProgress(id, language = 'german') {
      try {
        const raw = localStorage.getItem(`dimenticato_progress_wb_${language}_${id}`) || '[]';
        this.mastered = new Set(JSON.parse(raw));
      } catch (error) {
        this.mastered = new Set();
      }
    },

    bindLanguageSettingsAndProgress() {
      this.bindClick('germanSettingsCommunityBtn', () => this.openSharedCommunity('germanSettingsScreen'));
      this.bindClick('englishSettingsCommunityBtn', () => this.openSharedCommunity('englishSettingsScreen'));
      this.bindClick('germanSettingsGlobalDataBtn', () => this.showScreen('settingsScreen'));
      this.bindClick('englishSettingsGlobalDataBtn', () => this.showScreen('settingsScreen'));

      this.bindClick('goGermanProgressBtn', () => {
        this.updateGermanProgressStats();
        this.showScreen('germanProgressScreen');
      });
      this.bindClick('goEnglishProgressBtn', () => {
        this.updateEnglishProgressStats();
        this.showScreen('englishProgressScreen');
      });
      // 德语的完整统计面板入口（英语侧由 EnglishApp.init 自己绑，避免双绑）
      if (typeof window.showEnhancedStatsModal === 'function') {
        document.getElementById('germanProgressStatsPanelCard')?.classList.remove('hidden');
      }
      this.bindClick('germanOpenProgressStatsBtn', () => {
        if (typeof window.showEnhancedStatsModal === 'function') window.showEnhancedStatsModal();
      });
    },

    openSharedCommunity(returnScreen) {
      this.communityReturnScreen = returnScreen || 'vocabularyScreen';
      if (typeof CommunityWordbooks !== 'undefined' && typeof CommunityWordbooks.showBrowseScreen === 'function') {
        CommunityWordbooks.showBrowseScreen();
      }
      // communityBrowseScreen 是共享屏，ScreenMeta 只有意大利语面包屑。
      const lang = String(returnScreen || '').startsWith('english') ? 'english' : 'german';
      setLanguageBreadcrumb(lang, ['Vocabulary', '社区词本']);
    },

    updateGermanProgressStats() {
      const progressWords = this.systemWords.length ? this.systemWords : this.words;
      let systemMastered = new Set();
      try {
        systemMastered = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERED) || '[]'));
      } catch (error) {
        systemMastered = new Set();
      }
      const totalWords = progressWords.length;
      let masteredCount = 0;
      progressWords.forEach((word) => {
        if (systemMastered.has(this.masteredKey(word))) masteredCount += 1;
      });
      const progress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
      const totalAttempts = (this.stats.mcAttempts || 0) + (this.stats.spAttempts || 0);
      const totalCorrect = (this.stats.mcCorrect || 0) + (this.stats.spCorrect || 0);
      const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

      this.setText('germanProgressTotalWords', totalWords.toLocaleString());
      this.setText('germanProgressMasteredWords', masteredCount.toLocaleString());
      this.setText('germanProgressPercent', `${progress}%`);
      this.setText('germanProgressMcStats', `${this.stats.mcCorrect || 0} / ${this.stats.mcAttempts || 0}`);
      this.setText('germanProgressSpStats', `${this.stats.spCorrect || 0} / ${this.stats.spAttempts || 0}`);
      this.setText('germanProgressAccuracy', `${accuracy}%`);
      renderProgressPanels('german', 'german', this.stats, (id, value) => this.setText(id, value));
      this.updateHeaderStats();
    },

    updateEnglishProgressStats() {
      if (typeof EnglishApp !== 'undefined' && typeof EnglishApp.updateProgressStats === 'function') {
        EnglishApp.updateProgressStats();
      }
    },

    bindGrammarBookTriggers() {
      // German Grammar Book — real data
      const germanGrammarBookBtn = document.querySelector(
        '#germanGrammarScreen .german-placeholder-trigger[data-module="grammar-book"]'
      );
      if (germanGrammarBookBtn) {
        // Remove placeholder class so the generic placeholder handler won't fire
        germanGrammarBookBtn.classList.remove('german-placeholder-trigger');
        germanGrammarBookBtn.addEventListener('click', () => {
          this.openGermanGrammarBook();
        });
      }

      // 英语语法书入口由 EnglishApp._bindGrammarHubCards() 绑定：英语直连
      // （#/en/…）时德语词库不在、GermanApp.init 提前退出，绑在这里英语卡片
      // 会是死的。class 摘除本身即幂等标志，两侧谁先绑另一侧都查不到节点。

      // Grammar book back button — returns to whichever screen opened it
      this._grammarBookBackTarget = null;
      if (!grammarBookBackBound) {
        grammarBookBackBound = true;
        this.bindClick('grammarBookBackBtn', () => {
          if (typeof this._grammarBookBackTarget === 'function') {
            this._grammarBookBackTarget();
          } else {
            this.goBack('grammarScreen');
          }
        });
      }
    },

    // 德语语法书入口（课程单元的语法标签也会走这里并直接定位到某个章节）。
    openGermanGrammarBook(slug) {
      this._openGrammarBook(
        typeof GERMAN_GRAMMAR_DATA !== 'undefined' ? GERMAN_GRAMMAR_DATA : null,
        'German / Grammar Book',
        () => this.goBack('germanGrammarScreen'),
        { language: 'german', slug, data: typeof GERMAN_GRAMMAR_DATA !== 'undefined' ? GERMAN_GRAMMAR_DATA : null }
      );
    },

    _openGrammarBook(data, breadcrumbTitle, backFn, options = {}) {
      this._grammarBookBackTarget = backFn;

      // Update grammar book header title if desired
      const backBtn = document.getElementById('grammarBookBackBtn');
      if (backBtn) backBtn.textContent = '← 返回';

      // Init GrammarBook with provided data (or fall back to Italian)
      if (typeof GrammarBook !== 'undefined') {
        GrammarBook.init(data || undefined);
      }

      // GrammarBook.init() 只有在 data.meta 存在时才重置阅读区，而德语/英语
      // 语法数据都没有 meta —— 不重置的话正文会残留上一门语言的章节。
      resetGrammarReadingPane(breadcrumbTitle);

      this.showScreen('grammarBookScreen');

      const language = options.language || (String(breadcrumbTitle || '').startsWith('English') ? 'english' : 'german');
      setLanguageBreadcrumb(language, ['Grammar', '语法书']);

      if (options.slug) this._showGrammarTopic(options.data || data, options.slug);
    },

    // 直接跳到某个语法条目（课程单元的语法标签使用）。
    _showGrammarTopic(data, slug) {
      if (typeof GrammarBook === 'undefined' || typeof GrammarBook.loadTopic !== 'function') return;
      let partTitle = '';
      let chapterTitle = '';
      let title = slug;
      const parts = data && data.tree && Array.isArray(data.tree.parts) ? data.tree.parts : [];
      parts.forEach((part) => {
        (part.chapters || []).forEach((chapter) => {
          (chapter.topics || []).forEach((topic) => {
            if (topic.slug === slug) {
              partTitle = part.title;
              chapterTitle = chapter.title;
              title = topic.title;
            }
          });
        });
      });
      GrammarBook.loadTopic(slug, title, partTitle, chapterTitle);
    },

    // Conjugation practice (动词变位) — mirrors bindGrammarBookTriggers. The
    // German/English Grammar hubs each carry a 动词变位 card; clicking it opens
    // the SHARED conjugation setup screen via ConjugationPractice.openFor(lang),
    // which swaps to that language's config + per-language lesson storage.
    bindConjugationTriggers() {
      const germanConjBtn = document.querySelector(
        '#germanGrammarScreen .german-placeholder-trigger[data-module="conjugation"]'
      );
      if (germanConjBtn) {
        // Drop the placeholder class so the generic placeholder handler won't fire.
        germanConjBtn.classList.remove('german-placeholder-trigger');
        germanConjBtn.addEventListener('click', () => this._openConjugation('german'));
      }
      // 英语变位入口同样由 EnglishApp._bindGrammarHubCards() 绑定，理由同上。
    },

    // Open the shared conjugation flow for the given language. Degrades
    // gracefully when ConjugationPractice (or the language's data) is absent.
    _openConjugation(lang) {
      if (typeof ConjugationPractice !== 'undefined' && typeof ConjugationPractice.openFor === 'function') {
        ConjugationPractice.openFor(lang);
      } else {
        // Defensive fallback: just show the shared setup screen (it will render its
        // own "数据未加载" notice if no data is available).
        this.showScreen('conjugationSetupScreen');
      }
      // 共享屏，ScreenMeta 只带意大利语面包屑。
      setLanguageBreadcrumb(lang, ['Grammar', '动词变位', '设置']);
    },

    bindGermanPractice() {
      this.bindClick('germanMultipleChoiceBtn', () => this.startMultipleChoice());
      this.bindClick('germanSpellingBtn', () => this.startSpelling());
      this.bindClick('germanBrowseBtn', () => this.openBrowse());

      this.bindClick('germanMcBackBtn', () => this.goBack('germanVocabularyModesScreen'));
      this.bindClick('germanMcShowHintBtn', () => {
        document.getElementById('germanMcHint')?.classList.remove('hidden');
        document.getElementById('germanMcShowHintBtn')?.classList.add('hidden');
      });
      this.bindClick('germanMcNextBtn', () => this.nextMultipleChoiceQuestion());
      this.bindClick('germanMcSpeakBtn', () => {
        if (this.currentWord) {
          this.speakGerman(this.currentWord.display || this.currentWord.german || '');
        }
      });

      this.bindClick('germanSpBackBtn', () => this.goBack('germanVocabularyModesScreen'));
      this.bindClick('germanSpCheckBtn', () => this.checkSpellingAnswer());
      this.bindClick('germanSpNextBtn', () => this.nextSpellingQuestion());
      this.bindClick('germanPronunciationBtn', () => {
        if (this.currentWord) {
          this.speakGerman(this.currentWord.display || this.currentWord.german || '');
        }
      });
      const input = document.getElementById('germanSpInput');
      input?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          this.checkSpellingAnswer();
        }
      });

      this.bindClick('germanBrowseBackBtn', () => this.goBack('germanVocabularyModesScreen'));
      document.querySelectorAll('#germanFilterChips .chip').forEach((chip) => {
        chip.addEventListener('click', () => this.setBrowseFilter(chip.dataset.filter));
      });
      // 15,507 行的列表不能每次按键都整表重建：搜索去抖 + 分页渲染 + 事件委托。
      const debouncedSearch = debounce((value) => this.renderBrowse(value), 200);
      document.getElementById('germanSearchInput')?.addEventListener('input', (event) => {
        debouncedSearch(event.target.value || '');
      });
      document.getElementById('germanWordList')?.addEventListener('click', (event) => {
        if (event.target.closest('[data-german-browse-more]')) {
          this.renderBrowsePage();
          return;
        }
        const row = event.target.closest('.word-line');
        if (row) this.speakGerman(row.dataset.word || '');
      });
    },

    bindPlaceholderTriggers() {
      document.querySelectorAll('.german-placeholder-trigger').forEach((button) => {
        button.addEventListener('click', () => {
          const module = button.dataset.module || 'module';
          this.showGermanPlaceholder(module, `查看德语 ${module} 模块内容。`);
        });
      });

      document.querySelectorAll('.english-placeholder-trigger').forEach((button) => {
        button.addEventListener('click', () => {
          const module = button.dataset.module || 'module';
          this.showEnglishPlaceholder(module, `Open the English ${module} module.`);
        });
      });

      this.bindClick('languageSkeletonPlaceholderBackBtn', () => {
        if (this.activeLanguage === 'german') {
          this.goBack('germanWelcomeScreen');
        } else if (this.activeLanguage === 'english') {
          this.goBack('englishWelcomeScreen');
        } else {
          this.goBack('welcomeScreen');
        }
      });
    },

    showGermanPlaceholder(moduleTitle, description) {
      this.activeLanguage = 'german';
      this.updateLanguageSwitcherUI('german');
      this.fillPlaceholder({
        eyebrow: 'German / Module',
        title: moduleTitle,
        language: 'German',
        module: moduleTitle,
        description,
        dataHint: '德语词汇、练习内容与页面说明。'
      });
      this.showScreen('languageSkeletonPlaceholderScreen');
    },

    showEnglishPlaceholder(moduleTitle, description) {
      this.activeLanguage = 'english';
      this.updateLanguageSwitcherUI('english');
      this.fillPlaceholder({
        eyebrow: 'English / Module',
        title: moduleTitle,
        language: 'English',
        module: moduleTitle,
        description,
        dataHint: 'English vocabulary, exercises, and module information.'
      });
      this.showScreen('languageSkeletonPlaceholderScreen');
    },

    fillPlaceholder({ eyebrow, title, language, module, description, dataHint }) {
      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };

      setText('languageSkeletonPlaceholderEyebrow', eyebrow);
      setText('languageSkeletonPlaceholderLanguage', language);
      setText('languageSkeletonPlaceholderModule', module);
      setText('languageSkeletonPlaceholderDescription', description);
      setText('languageSkeletonPlaceholderDataHint', dataHint);

      const titleEl = document.getElementById('languageSkeletonPlaceholderTitle');
      if (titleEl) {
        titleEl.innerHTML = `<svg class="icon"><use href="#icon-puzzle"></use></svg>${escapeHtml(title)}`;
      }
    },

    // 一组练习不再是“把整个词库洗牌”：先按复习到期 → 未掌握 → 其余排序，
    // 再截取用户选择的每组题量，这样才有可达成的结束点与总结。
    buildSession() {
      const pool = Array.isArray(this.words) ? this.words.slice() : [];
      if (!pool.length) return [];
      const today = todayString();
      const due = [];
      const fresh = [];
      const rest = [];
      pool.forEach((word) => {
        const key = this.masteredKey(word);
        const sr = this.srData[key];
        if (sr && sr.nextReviewDate && sr.nextReviewDate <= today) due.push(word);
        else if (!this.mastered.has(key)) fresh.push(word);
        else rest.push(word);
      });
      const ordered = [
        ...this.shuffle(due),
        ...this.shuffle(fresh),
        ...this.shuffle(rest)
      ];
      if (this.sessionSize === 'all') return ordered;
      const size = Number(this.sessionSize) || 20;
      return ordered.slice(0, Math.max(1, size));
    },

    // 干扰项永远来自完整的系统词库（课程单元只有 10 个词，从中取干扰项
    // 几趟下来就能靠排除法猜出答案）；同时对候选池采样，避免困难模式在
    // 15,507 / 24,000 条上跑编辑距离导致每题卡顿。
    distractorPool() {
      const base = this.systemWords.length ? this.systemWords : this.words;
      return sampleDistractorPool(base, this.currentWord);
    },

    _elapsedMs() {
      if (!this._questionStartedAt) return 0;
      // 上限 10 分钟：中途切走浏览器标签页不该被算成一次超长学习。
      return Math.max(0, Math.min(600000, Date.now() - this._questionStartedAt));
    },

    // 一次作答的统一记录点：SM-2 复习计划、掌握集合、今日学习统计。
    // 掌握与否由共享的 MasteryPolicy 说了算（连续答对 STREAK_REQUIRED 次），
    // 四选一蒙对一次不再直接标记掌握；答错清零连击并降级。
    recordAnswer(word, isCorrect) {
      if (!word) return;
      const elapsedMs = this._elapsedMs();
      this._questionStartedAt = 0;
      const key = this.masteredKey(word);
      // 先算 SM-2：MasteryPolicy 会看 srData 判断"已经排到长间隔"的词。
      this.srData[key] = scheduleReview(this.srData[key], correctnessToQuality(isCorrect, elapsedMs));
      const outcome = recordMastery('german', key, isCorrect,
        Object.assign({}, word, { srData: this.srData[key] }));
      if (outcome.mastered) this.mastered.add(key);
      else if (!isCorrect) this.mastered.delete(key);
      // 每日统计（StatsManager）由 app-enhanced.js 的 QuizIntegration 包装器统一记录，
      // 这里不再重复上报 —— 否则同一道题会记成 2 次作答。
    },

    startMultipleChoice() {
      this.sessionWords = this.buildSession();
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this.showScreen('germanMultipleChoiceScreen');
      this.loadMultipleChoiceQuestion();
    },

    loadMultipleChoiceQuestion() {
      if (this.quizIndex >= this.sessionWords.length) {
        this.finishPractice('multiple-choice');
        return;
      }

      this.currentWord = this.sessionWords[this.quizIndex];
      const mcEngine = this._getMcEngine();
      const currentDisplay = this.currentWord.display || this.currentWord.german || '-';
      const reverse = mcEngine.isReverse();
      this.setText('germanMcCurrentWord', String(this.quizIndex + 1));
      this.setText('germanMcTotalWords', String(this.sessionWords.length));
      this.updateSessionFill('germanMcSessionFill', this.quizIndex, this.sessionWords.length);
      this.setText('germanMcAccuracy', `${this.getAccuracy()}%`);
      // 题面跟着出题方向走：反向显示释义，而不是德语词形
      this.setText('germanMcWord', reverse ? mcEngine.questionTextFor(this.currentWord) : currentDisplay);
      mcEngine.applyDirectionLabels(
        { question: 'germanMcQuestionLabel', options: 'germanMcOptionsLabel' },
        { question: '德语单词', options: '选择正确的中文释义' },
        { question: '中文释义', options: '选择正确的德语单词' }
      );

      const hint = document.getElementById('germanMcHint');
      const hintBtn = document.getElementById('germanMcShowHintBtn');
      if (hint) {
        hint.textContent = this.currentWord.notes || '';
        hint.classList.toggle('hidden', !this.currentWord.notes);
        if (this.currentWord.notes) hint.classList.add('hidden');
      }
      if (hintBtn) {
        hintBtn.classList.toggle('hidden', !this.currentWord.notes);
      }

      this.renderMcOptions();
      this.resetFeedback('germanMcFeedback');
      this._questionStartedAt = Date.now();
      // 反向模式的答案就是德语词形，朗读等于报答案
      if (!reverse) this.speakGerman(currentDisplay);
    },

    renderMcOptions() {
      const container = document.getElementById('germanMcOptions');
      if (!container || !this.currentWord) return;

      const engine = this._getMcEngine();
      const correctMeaning = engine.correctAnswerFor(this.currentWord);
      const options = engine.generateOptions(correctMeaning, this.distractorPool());

      engine.renderOptions(options, (btn) => this.checkMultipleChoiceAnswer(btn));
    },

    checkMultipleChoiceAnswer(button) {
      if (!this.currentWord) return;

      const correctAnswer = this._getMcEngine().correctAnswerFor(this.currentWord);
      const selectedAnswer = button.dataset.answer || '';
      const isCorrect = selectedAnswer === correctAnswer;

      this.quizTotal += 1;
      this.stats.mcAttempts += 1;
      if (isCorrect) {
        this.quizCorrect += 1;
        this.stats.mcCorrect += 1;
      }
      this.recordAnswer(this.currentWord, isCorrect);

      var engine = this._getMcEngine();
      engine.highlightOptions(correctAnswer);
      if (!isCorrect) {
        button.classList.remove('faded');
        button.classList.add('wrong');
      }

      engine.showFeedback(isCorrect, correctAnswer);

      this.setText('germanMcAccuracy', `${this.getAccuracy()}%`);
      this.saveState();

      if (isCorrect) {
        setTimeout(() => this.nextMultipleChoiceQuestion(), 900);
      }
    },

    nextMultipleChoiceQuestion() {
      this.quizIndex += 1;
      this.loadMultipleChoiceQuestion();
    },

    startSpelling() {
      this.sessionWords = this.buildSession();
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this.showScreen('germanSpellingScreen');
      this.loadSpellingQuestion();
    },

    loadSpellingQuestion() {
      if (this.quizIndex >= this.sessionWords.length) {
        this.finishPractice('spelling');
        return;
      }

      this.currentWord = this.sessionWords[this.quizIndex];
      this.setText('germanSpCurrentWord', String(this.quizIndex + 1));
      this.setText('germanSpTotalWords', String(this.sessionWords.length));
      this.updateSessionFill('germanSpSessionFill', this.quizIndex, this.sessionWords.length);
      this.setText('germanSpAccuracy', `${this.getAccuracy()}%`);
      this.setText('germanSpMeaning', this.currentWord.meaning || this.currentWord.chinese || '-');
      this.setText('germanSpHint', this.currentWord.notes || '');
      document.getElementById('germanSpHint')?.classList.toggle('hidden', !this.currentWord.notes);

      const input = document.getElementById('germanSpInput');
      const checkBtn = document.getElementById('germanSpCheckBtn');
      if (input) {
        input.value = '';
        input.disabled = false;
        input.classList.remove('good', 'bad');
        input.focus();
      }
      if (checkBtn) checkBtn.disabled = false;

      this.resetFeedback('germanSpFeedback');
      this._questionStartedAt = Date.now();
    },

    checkSpellingAnswer() {
      if (!this.currentWord) return;
      const input = document.getElementById('germanSpInput');
      const checkBtn = document.getElementById('germanSpCheckBtn');
      const userAnswer = input ? input.value.trim() : '';

      const forms = [this.currentWord.german, this.currentWord.display].filter(Boolean);
      // 大小写宽容：德语名词首字母必须大写，但把 "tag" 判成完全错误只会打断
      // 练习节奏。这里判对，另外在反馈里提示正确的大小写形式。
      const validAnswers = forms.map((value) => this.toGermanComparable(value));
      const strictAnswers = forms.map((value) => this.toGermanComparable(value, true));

      const normalizedAnswer = this.toGermanComparable(userAnswer);
      const strictUserAnswer = this.toGermanComparable(userAnswer, true);
      const isCorrect = validAnswers.includes(normalizedAnswer);
      const caseMismatch = isCorrect && !strictAnswers.includes(strictUserAnswer);

      this.quizTotal += 1;
      this.stats.spAttempts += 1;
      if (isCorrect) {
        this.quizCorrect += 1;
        this.stats.spCorrect += 1;
      }
      this.recordAnswer(this.currentWord, isCorrect);

      if (input) {
        input.disabled = true;
        input.classList.remove('good', 'bad');
        input.classList.add(isCorrect ? 'good' : 'bad');
      }
      if (checkBtn) checkBtn.disabled = true;

      const correctDisplay = this.currentWord.display || this.currentWord.german || '';
      let feedbackText;
      if (isCorrect && caseMismatch) {
        feedbackText = `回答正确（注意大小写：${correctDisplay}）`;
      } else if (isCorrect) {
        feedbackText = '回答正确';
      } else {
        feedbackText = `回答有误，正确拼写：${correctDisplay}`;
      }
      this.showFeedback('germanSpFeedback', feedbackText, isCorrect);

      this.setText('germanSpAccuracy', `${this.getAccuracy()}%`);
      this.saveState();

      if (isCorrect) {
        setTimeout(() => this.nextSpellingQuestion(), 900);
      }
    },

    nextSpellingQuestion() {
      this.quizIndex += 1;
      this.loadSpellingQuestion();
    },

    openBrowse() {
      this.showScreen('germanBrowseScreen');
      const searchInput = document.getElementById('germanSearchInput');
      if (searchInput) searchInput.value = '';
      this.updateBrowseFilterText();
      this.renderBrowse('');
    },

    setBrowseFilter(filter) {
      if (!['all', 'mastered', 'unmastered'].includes(filter)) return;
      this.browseFilter = filter;
      this.saveState();
      this.updateBrowseFilterText();
      this.renderBrowse(document.getElementById('germanSearchInput')?.value || '');
    },

    toggleBrowseFilter() {
      const filters = ['all', 'mastered', 'unmastered'];
      const currentIndex = filters.indexOf(this.browseFilter);
      this.setBrowseFilter(filters[(currentIndex + 1) % filters.length]);
    },

    updateBrowseFilterText() {
      document.querySelectorAll('#germanFilterChips .chip').forEach((chip) => {
        chip.classList.toggle('active', chip.dataset.filter === this.browseFilter);
      });
    },

    // 词表分页渲染：一次性把 15,507 行拼进 innerHTML（并给每行挂一个监听器）
    // 会让浏览页卡死几秒。这里只渲染首屏，其余通过“加载更多”按钮追加，
    // 点击事件统一由 bindGermanPractice() 里的事件委托处理。
    renderBrowse(searchTerm = '') {
      const container = document.getElementById('germanWordList');
      if (!container) return;

      const keyword = String(searchTerm || '').trim().toLowerCase();
      let words = this.words;

      if (this.browseFilter === 'mastered') {
        words = words.filter((word) => this.isMastered(word));
      } else if (this.browseFilter === 'unmastered') {
        words = words.filter((word) => !this.isMastered(word));
      }

      if (keyword) {
        words = words.filter((word) => {
          const haystack = [word.german, word.display, word.meaning, word.chinese, word.notes]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(keyword);
        });
      }

      this._browse.words = words;
      this._browse.rendered = 0;

      if (!words.length) {
        // 空状态要区分“筛选后为空”和“搜索无结果”，否则用户会以为词库坏了。
        let message = '没有找到匹配的德语词汇';
        if (!keyword && this.browseFilter === 'mastered') {
          message = '还没有已掌握的德语单词，先去做几组练习吧';
        } else if (!keyword && this.browseFilter === 'unmastered') {
          message = '当前范围内的德语单词都已掌握，可以切换到更大的词频范围';
        }
        container.innerHTML = `<p class="about-note" style="text-align:center;padding:2rem">${escapeHtml(message)}</p>`;
        return;
      }

      container.innerHTML = '<div class="word-card" id="germanWordRows"></div><div id="germanBrowseFooter"></div>';
      this.renderBrowsePage();
    },

    renderBrowsePage() {
      const rows = document.getElementById('germanWordRows');
      const footer = document.getElementById('germanBrowseFooter');
      if (!rows) return;

      const all = this._browse.words;
      const start = this._browse.rendered;
      const end = Math.min(all.length, start + this._browse.pageSize);
      const html = all.slice(start, end).map((word) => this.browseRowHtml(word)).join('');
      rows.insertAdjacentHTML('beforeend', html);
      this._browse.rendered = end;

      if (footer) {
        footer.innerHTML = end < all.length
          ? `<button class="pill-btn" type="button" data-german-browse-more style="margin-top:14px"><span class="msr">expand_more</span>加载更多（已显示 ${end} / ${all.length}）</button>`
          : `<div class="about-note" style="margin-top:14px">共 ${all.length} 个词条</div>`;
      }
    },

    browseRowHtml(word) {
      const mastered = this.isMastered(word);
      const headword = word.display || word.german || '';
      const gloss = word.meaning || word.chinese || '-';
      const cn = (word.meaning && word.chinese && word.chinese !== word.meaning) ? word.chinese : '';
      return `
        <div class="word-line" data-word="${escapeAttribute(headword)}" style="cursor:pointer">
          <span class="wl-word">${escapeHtml(headword)}</span>
          <span class="wl-gloss">${escapeHtml(gloss)}${word.notes ? `<span class="wl-note">${escapeHtml(word.notes)}</span>` : ''}</span>
          <span class="wl-cn">${escapeHtml(cn)}</span>
          <span class="wl-status"><span class="dot${mastered ? ' good' : ''}"></span>${mastered ? '已掌握' : '学习中'}</span>
          <button class="wl-speaker" title="朗读"><span class="msr">volume_up</span></button>
        </div>
      `;
    },

    finishPractice(mode) {
      const accuracy = this.getAccuracy();
      const modeName = mode === 'spelling' ? '拼写' : '选择题';
      const remaining = Math.max(0, this.words.length - this.countMastered(this.words));
      alert(`德语${modeName}练习完成\n\n正确: ${this.quizCorrect}/${this.quizTotal}\n正确率: ${accuracy}%\n当前范围还有 ${remaining} 个词未掌握`);
      this.showScreen('germanVocabularyModesScreen');
    },

    getAccuracy() {
      return this.quizTotal > 0 ? Math.round((this.quizCorrect / this.quizTotal) * 100) : 0;
    },

    showFeedback(id, text, isCorrect) {
      const feedback = document.getElementById(id);
      if (!feedback) return;
      const textEl = feedback.querySelector('.feedback-text');
      if (textEl) {
        const icon = isCorrect ? 'check_circle' : 'cancel';
        textEl.innerHTML = `<span class="msr">${icon}</span>${escapeHtml(text)}`;
        textEl.classList.remove('ok', 'no');
        textEl.classList.add(isCorrect ? 'ok' : 'no');
      }
      feedback.classList.remove('hidden', 'correct', 'incorrect');
      feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    },

    resetFeedback(id) {
      const feedback = document.getElementById(id);
      if (!feedback) return;
      feedback.classList.add('hidden');
      feedback.classList.remove('correct', 'incorrect');
      const textEl = feedback.querySelector('.feedback-text');
      if (textEl) {
        textEl.textContent = '';
        textEl.classList.remove('ok', 'no');
      }
    },

    // 更新练习界面顶部的进度条（redesign .session-bar/.session-fill）
    updateSessionFill(id, index, total) {
      const fill = document.getElementById(id);
      if (!fill) return;
      const pct = total > 0 ? Math.min(100, Math.round((index / total) * 100)) : 0;
      fill.style.width = `${pct}%`;
    },

    speakGerman(text) {
      if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((item) => /^de/i.test(item.lang));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },

    // German/English now share the global history stack (Stage 2 of the nav
    // refactor): forward navigations push history by default — exactly like the
    // Italian site — so the global goBack() can pop reliably. Pass
    // { skipHistory: true } only for top-level context resets (language switch /
    // initial language application), where pushing would pollute the stack.
    showScreen(screenId, options = {}) {
      if (typeof showScreen === 'function') {
        showScreen(screenId, options);
        return;
      }

      document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
      document.getElementById(screenId)?.classList.add('active');
    },

    // Route an in-page back button through the global goBack() so it pops real
    // history when available, falling back to the per-language fallback map
    // (FALLBACK_BACK_MAP in lib/navigation.js) when there is no usable history.
    goBack(fallbackTarget) {
      if (typeof goBack === 'function') {
        goBack(fallbackTarget ? { fallbackTarget } : {});
        return;
      }
      // Defensive fallback if navigation core is unavailable.
      if (fallbackTarget) this.showScreen(fallbackTarget, { skipHistory: true });
    },

    // Show a language home as a fresh top-level context: reset the shared history
    // stack to just that screen (mirrors LanguagePortal.selectLanguage) so a
    // later goBack() never reaches into a stale cross-language history.
    resetToScreen(screenId) {
      if (typeof AppState !== 'undefined' && AppState) {
        AppState.navigationStack = [screenId];
      }
      this.showScreen(screenId, { skipHistory: true });
    },

    bindClick(id, handler) {
      document.getElementById(id)?.addEventListener('click', handler);
    },

    setText(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    },

    // keepCase = true 时保留大小写，用于判断“拼对了但首字母大小写不对”。
    toGermanComparable(value, keepCase) {
      const base = String(value || '').trim();
      return (keepCase ? base : base.toLowerCase())
        .replace(/\s+/g, '')
        .replace(/\//g, '')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/Ä/g, 'Ae')
        .replace(/Ö/g, 'Oe')
        .replace(/Ü/g, 'Ue')
        .replace(/ß/g, 'ss')
        .normalize('NFC');
    },

    shuffle(array) {
      const copy = array.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EnglishApp — English vocabulary practice (MC / Spelling / Browse)
  // ─────────────────────────────────────────────────────────────────────────
  const EnglishApp = {
    words: [],
    systemWords: [],
    sessionWords: [],
    mastered: new Set(),
    srData: {},
    stats: { mcAttempts: 0, mcCorrect: 0, spAttempts: 0, spCorrect: 0 },
    currentWord: null,
    currentWordbook: null,
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    browseFilter: 'all',
    // 'system' | 'wordbook'
    sourceType: 'system',
    tier: '1000',
    sessionSize: '20',
    _germanApp: null,
    _mcEngine: null,
    _questionStartedAt: 0,
    _browse: { words: [], rendered: 0, pageSize: 200 },

    _getMcEngine() {
      if (!this._mcEngine) {
        this._mcEngine = new QuizEngine({
          state: {
            get words() { return EnglishApp.sessionWords; },
            get quizIndex() { return EnglishApp.quizIndex; },
            set quizIndex(v) { EnglishApp.quizIndex = v; },
            get quizCorrect() { return EnglishApp.quizCorrect; },
            set quizCorrect(v) { EnglishApp.quizCorrect = v; },
            get quizTotal() { return EnglishApp.quizTotal; },
            set quizTotal(v) { EnglishApp.quizTotal = v; },
            get currentWord() { return EnglishApp.currentWord; },
            set currentWord(v) { EnglishApp.currentWord = v; }
          },
          stats: EnglishApp.stats,
          mastered: EnglishApp.mastered,
          fieldMap: { source: 'english', target: 'meaning' },
          get difficulty() { return QuizEngine.getDifficulty(); },
          saveFn: function () { EnglishApp._saveState(); },
          onUpdateStats: function () {},
          dom: {
            optionsContainer: document.getElementById('englishMcOptions'),
            feedbackEl: document.getElementById('englishMcFeedback'),
            feedbackTextEl: document.querySelector('#englishMcFeedback .feedback-text'),
            progressCurrent: document.getElementById('englishMcCurrentWord'),
            progressTotal: document.getElementById('englishMcTotalWords'),
            accuracyEl: document.getElementById('englishMcAccuracy')
          }
        });
      }
      // 引擎实例是缓存的，而 mastered / stats 会在切换系统词库↔个人词本时被
      // 整个替换掉。不刷新引用的话，引擎会一直写进已经废弃的旧对象里。
      this._mcEngine.config.stats = this.stats;
      this._mcEngine.config.mastered = this.mastered;
      return this._mcEngine;
    },

    init(germanApp) {
      this._germanApp = germanApp;
      if (typeof ENGLISH_VOCABULARY_DATA === 'undefined') {
        console.warn('ENGLISH_VOCABULARY_DATA 未加载，跳过 EnglishApp 初始化');
        this._showVocabularyLoadError();
        return;
      }
      this.systemWords = Array.isArray(ENGLISH_VOCABULARY_DATA) ? ENGLISH_VOCABULARY_DATA.slice() : [];
      this._loadState();
      this.words = tierWords(this.systemWords, this.tier);
      this._bindPractice();
      this._bindGrammarHubCards();
      this._bindProgressPanels();
      this._installScopeControls();
    },

    // 英语进度页的完整统计面板入口。与语法书入口同理：英语直连时
    // GermanApp.init 不跑，不能把绑定只放在它那边（GermanApp 刻意不绑英语侧，
    // 避免德语启动级联到这里时双绑）。
    _bindProgressPanels() {
      const g = this._germanApp;
      if (typeof window.showEnhancedStatsModal === 'function') {
        document.getElementById('englishProgressStatsPanelCard')?.classList.remove('hidden');
      }
      g.bindClick('englishOpenProgressStatsBtn', () => {
        if (typeof window.showEnhancedStatsModal === 'function') window.showEnhancedStatsModal();
      });
    },

    // 英语站的语法书 / 动词变位入口原本绑在 GermanApp.init 的级联里，英语直连
    // （#/en/…）时德语词库不在、级联断掉，这两张卡会是死的。改由这里绑定；
    // GermanApp 那侧已让位（节点 class 摘除后查询不到，天然幂等）。
    // 传入的 germanApp 只当 DOM 工具用（_openGrammarBook / goBack / bindClick），
    // 不依赖 GermanApp 自身 init 是否成功 —— 与 lang-loader 的既有约定一致。
    _bindGrammarHubCards() {
      const g = this._germanApp || GermanApp;

      const grammarBtn = document.querySelector(
        '#englishGrammarScreen .english-placeholder-trigger[data-module="grammar-book"]'
      );
      if (grammarBtn) {
        grammarBtn.classList.remove('english-placeholder-trigger');
        grammarBtn.addEventListener('click', () => {
          g._openGrammarBook(
            typeof ENGLISH_GRAMMAR_DATA !== 'undefined' ? ENGLISH_GRAMMAR_DATA : null,
            'English / Grammar Book',
            () => g.goBack('englishGrammarScreen')
          );
        });
      }

      const conjBtn = document.querySelector(
        '#englishGrammarScreen .english-placeholder-trigger[data-module="conjugation"]'
      );
      if (conjBtn) {
        conjBtn.classList.remove('english-placeholder-trigger');
        conjBtn.addEventListener('click', () => g._openConjugation('english'));
      }

      // 共享语法书返回按钮：德/英谁先初始化谁绑，只绑一次。
      if (!grammarBookBackBound) {
        grammarBookBackBound = true;
        g.bindClick('grammarBookBackBtn', () => {
          if (typeof g._grammarBookBackTarget === 'function') {
            g._grammarBookBackTarget();
          } else {
            g.goBack('grammarScreen');
          }
        });
      }
    },

    _showVocabularyLoadError() {
      const container = document.querySelector('#englishWelcomeScreen .container');
      if (!container || document.getElementById('englishVocabularyLoadError')) return;
      container.insertAdjacentHTML('beforeend', `
        <div class="settings-card" id="englishVocabularyLoadError">
          <div class="settings-card-title">英语词库加载失败</div>
          <div class="about-body">data/english-vocabulary.js 未能载入，英语词汇与练习功能暂不可用。请检查网络后刷新页面重试。</div>
        </div>
      `);
    },

    masteredKey(word) {
      if (!word) return '';
      // 24,000 条英语词条的 english 字段没有重复，直接用词形做 key。
      return String(word.id || word.english || '');
    },

    isMastered(word) {
      return this.mastered.has(this.masteredKey(word));
    },

    countMastered(words) {
      if (!Array.isArray(words) || !words.length) return 0;
      let count = 0;
      words.forEach((word) => {
        if (this.mastered.has(this.masteredKey(word))) count += 1;
      });
      return count;
    },

    _loadState() {
      try {
        const m = localStorage.getItem(STORAGE_KEYS.EN_MASTERED);
        if (m) this.mastered = new Set(JSON.parse(m));
        const s = localStorage.getItem(STORAGE_KEYS.EN_STATS);
        if (s) this.stats = { ...this.stats, ...JSON.parse(s) };
        const f = localStorage.getItem(STORAGE_KEYS.EN_FILTER);
        if (f) this.browseFilter = f;
        const tier = localStorage.getItem(STORAGE_KEYS.EN_LEVEL);
        if (tier && TIER_OPTIONS.some((option) => option.value === tier)) this.tier = tier;
        const sessionSize = localStorage.getItem(STORAGE_KEYS.EN_SESSION);
        if (sessionSize && SESSION_OPTIONS.some((option) => option.value === sessionSize)) {
          this.sessionSize = sessionSize;
        }
        const sr = localStorage.getItem(STORAGE_KEYS.EN_SR);
        if (sr) {
          const parsed = JSON.parse(sr);
          if (parsed && typeof parsed === 'object') this.srData = parsed;
        }
      } catch (e) {
        console.error('EnglishApp 状态加载失败:', e);
      }
    },

    // 与 GermanApp 相同的延迟落盘模式（见上方 GermanApp._persist 注释）
    _persist: null,

    _flushState() {
      if (this._persist) this._persist.flush();
    },

    _saveState() {
      if (!this._persist) this._persist = window.deferredPersist(() => this._writeState(), 500);
      this._persist();
      this.updateHeaderStats();
    },

    _writeState() {
      try {
        // 关键：个人词本的进度必须写进词本自己的 key。之前无论当前用的是
        // 系统词库还是词本，都往 EN_MASTERED 里写，导致选一次词本就把系统
        // 词库的“已掌握”整份覆盖掉（德语侧一直是分开写的）。
        const masteredKey = this.currentWordbook
          ? `dimenticato_progress_wb_english_${this.currentWordbook.id}`
          : STORAGE_KEYS.EN_MASTERED;
        localStorage.setItem(masteredKey, JSON.stringify([...this.mastered]));
        localStorage.setItem(STORAGE_KEYS.EN_STATS, JSON.stringify(this.stats));
        localStorage.setItem(STORAGE_KEYS.EN_FILTER, this.browseFilter);
        localStorage.setItem(STORAGE_KEYS.EN_LEVEL, this.tier);
        localStorage.setItem(STORAGE_KEYS.EN_SESSION, this.sessionSize);
        localStorage.setItem(STORAGE_KEYS.EN_SR, JSON.stringify(this.srData));
      } catch (e) {
        console.error('EnglishApp 状态保存失败:', e);
      }
    },

    updateHeaderStats() {
      setHeaderStats('english', this.words.length, this.countMastered(this.words));
    },

    // ── 词库来源 ────────────────────────────────────────────────────────────
    _loadSystemMastery() {
      try {
        this.mastered = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.EN_MASTERED) || '[]'));
      } catch (error) {
        this.mastered = new Set();
      }
    },

    _updateModesCopy(title, description) {
      const screen = document.getElementById('englishVocabularyModesScreen');
      if (!screen) return;
      const titleElement = screen.querySelector('h1.page');
      const descriptionElement = screen.querySelector('p.desc');
      if (titleElement) titleElement.textContent = title;
      if (descriptionElement) descriptionElement.textContent = description;
    },

    _describeScope() {
      const tierLabel = this.tier === 'all'
        ? '完整英语系统词库'
        : `英语高频前 ${Number(this.tier).toLocaleString()} 词`;
      const sessionLabel = this.sessionSize === 'all' ? '不限题量' : `每组 ${this.sessionSize} 题`;
      return `当前使用${tierLabel}，共 ${this.words.length.toLocaleString()} 词 · ${sessionLabel}。`;
    },

    // 之前点“System Vocabulary”只是切屏，用过个人词本之后 words / mastered
    // 仍然停留在词本上，系统词库再也回不来。
    selectSystemVocabulary() {
      this._flushState();
      this.currentWordbook = null;
      this.sourceType = 'system';
      this.words = tierWords(this.systemWords, this.tier);
      this.sessionWords = [];
      this.currentWord = null;
      this._loadSystemMastery();
      this._updateModesCopy('Choose practice mode', this._describeScope());
      this._renderScopeControls();
      this.updateHeaderStats();
      this._germanApp.showScreen('englishVocabularyModesScreen');
    },

    selectWordbook(wordbook) {
      if (!wordbook || typeof WordbookManager === 'undefined') return;
      this._flushState();
      this.currentWordbook = wordbook;
      this.sourceType = 'wordbook';
      this.sessionWords = [];
      this.currentWord = null;
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this.words = WordbookManager.mapWordbookWordsForLanguage(wordbook.words, 'english');
      this.loadWordbookProgress(wordbook.id, 'english');
      this._updateModesCopy(
        wordbook.name,
        `当前使用个人英语词本，共 ${this.words.length.toLocaleString()} 词。`
      );
      this._renderScopeControls();
      this.updateHeaderStats();
    },

    // 与德语一致：index.html 归其它工作流所有，chips 在运行时注入。
    _installScopeControls() {
      const screen = document.getElementById('englishVocabularyModesScreen');
      const container = screen ? screen.querySelector('.container') : null;
      const grid = container ? container.querySelector('.card-grid') : null;
      if (!grid || document.getElementById('englishScopeControls')) return;

      grid.insertAdjacentHTML('beforebegin', `
        <div id="englishScopeControls">
          <div class="sub-label" id="englishTierLabel">词频范围</div>
          <div class="chips wrap" id="englishTierChips" aria-label="选择英语词频范围"></div>
          <div class="sub-label" style="margin-top:14px">每组题量</div>
          <div class="chips wrap" id="englishSessionChips" aria-label="选择每组题量"></div>
        </div>
      `);

      document.getElementById('englishTierChips')?.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-english-tier]');
        if (chip) this.setTier(chip.dataset.englishTier);
      });
      document.getElementById('englishSessionChips')?.addEventListener('click', (event) => {
        const chip = event.target.closest('[data-english-session]');
        if (chip) this.setSessionSize(chip.dataset.englishSession);
      });

      this._renderScopeControls();
    },

    _renderScopeControls() {
      const wrapper = document.getElementById('englishScopeControls');
      if (!wrapper) return;
      const tierChips = document.getElementById('englishTierChips');
      const tierLabel = document.getElementById('englishTierLabel');
      const isSystem = this.sourceType === 'system';
      if (tierChips) tierChips.classList.toggle('hidden', !isSystem);
      if (tierLabel) tierLabel.classList.toggle('hidden', !isSystem);

      const options = TIER_OPTIONS.map((option) => (
        option.value === 'all'
          ? { value: 'all', label: `全部 · ${this.systemWords.length.toLocaleString()} 词` }
          : option
      ));
      renderChips(tierChips, options, this.tier, 'data-english-tier');
      renderChips(document.getElementById('englishSessionChips'), SESSION_OPTIONS, this.sessionSize, 'data-english-session');
    },

    // 同德语侧：换了词频分层就显式刷新一次顶栏统计，不依赖 _saveState() 的副作用。
    setTier(tier) {
      if (!TIER_OPTIONS.some((option) => option.value === tier)) return;
      this.tier = tier;
      if (this.sourceType === 'system') {
        this.words = tierWords(this.systemWords, this.tier);
        this._updateModesCopy('Choose practice mode', this._describeScope());
      }
      this._saveState();
      this._renderScopeControls();
      this.updateHeaderStats();
    },

    setSessionSize(size) {
      if (!SESSION_OPTIONS.some((option) => option.value === size)) return;
      this.sessionSize = size;
      if (this.sourceType === 'system') {
        this._updateModesCopy('Choose practice mode', this._describeScope());
      }
      this._saveState();
      this._renderScopeControls();
      this.updateHeaderStats();
    },

    _bindPractice() {
      const g = this._germanApp;

      // Mode buttons
      g.bindClick('englishMultipleChoiceBtn', () => this.startMultipleChoice());
      g.bindClick('englishSpellingBtn', () => this.startSpelling());
      g.bindClick('englishBrowseBtn', () => this.openBrowse());

      // MC screen
      g.bindClick('englishMcBackBtn', () => g.goBack('englishVocabularyModesScreen'));
      g.bindClick('englishMcShowHintBtn', () => {
        document.getElementById('englishMcHint')?.classList.remove('hidden');
        document.getElementById('englishMcShowHintBtn')?.classList.add('hidden');
      });
      g.bindClick('englishMcNextBtn', () => this.nextMcQuestion());
      g.bindClick('englishMcSpeakBtn', () => {
        if (this.currentWord) this._speak(this.currentWord.english || '');
      });

      // Spelling screen
      g.bindClick('englishSpBackBtn', () => g.goBack('englishVocabularyModesScreen'));
      g.bindClick('englishSpCheckBtn', () => this.checkSpelling());
      g.bindClick('englishSpNextBtn', () => this.nextSpelling());
      g.bindClick('englishPronunciationBtn', () => {
        if (this.currentWord) this._speak(this.currentWord.english || '');
      });
      document.getElementById('englishSpInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.checkSpelling();
      });

      // Browse screen
      g.bindClick('englishBrowseBackBtn', () => g.goBack('englishVocabularyModesScreen'));
      document.querySelectorAll('#englishFilterChips .chip').forEach((chip) => {
        chip.addEventListener('click', () => this._setFilter(chip.dataset.filter));
      });
      // 24,000 行不能每次按键都整表重建：搜索去抖 + 分页渲染 + 事件委托。
      const debouncedSearch = debounce((value) => this._renderBrowse(value), 200);
      document.getElementById('englishSearchInput')?.addEventListener('input', (e) => {
        debouncedSearch(e.target.value || '');
      });
      document.getElementById('englishWordList')?.addEventListener('click', (event) => {
        if (event.target.closest('[data-english-browse-more]')) {
          this._renderBrowsePage();
          return;
        }
        const row = event.target.closest('.word-line');
        if (row) this._speak(row.dataset.word || '');
      });
    },

    loadWordbookProgress(id, language = 'english') {
      try {
        const raw = localStorage.getItem(`dimenticato_progress_wb_${language}_${id}`) || '[]';
        this.mastered = new Set(JSON.parse(raw));
      } catch (error) {
        this.mastered = new Set();
      }
    },

    _buildSession() {
      const pool = Array.isArray(this.words) ? this.words.slice() : [];
      if (!pool.length) return [];
      const today = todayString();
      const due = [];
      const fresh = [];
      const rest = [];
      pool.forEach((word) => {
        const key = this.masteredKey(word);
        const sr = this.srData[key];
        if (sr && sr.nextReviewDate && sr.nextReviewDate <= today) due.push(word);
        else if (!this.mastered.has(key)) fresh.push(word);
        else rest.push(word);
      });
      const ordered = [...this._shuffle(due), ...this._shuffle(fresh), ...this._shuffle(rest)];
      if (this.sessionSize === 'all') return ordered;
      const size = Number(this.sessionSize) || 20;
      return ordered.slice(0, Math.max(1, size));
    },

    _distractorPool() {
      const base = this.systemWords.length ? this.systemWords : this.words;
      return sampleDistractorPool(base, this.currentWord);
    },

    _elapsedMs() {
      if (!this._questionStartedAt) return 0;
      return Math.max(0, Math.min(600000, Date.now() - this._questionStartedAt));
    },

    // 同德语侧 recordAnswer：掌握与否交给共享的 MasteryPolicy，
    // 连续答对 STREAK_REQUIRED 次才算掌握，答错清零并降级。
    _recordAnswer(word, isCorrect) {
      if (!word) return;
      const elapsedMs = this._elapsedMs();
      this._questionStartedAt = 0;
      const key = this.masteredKey(word);
      this.srData[key] = scheduleReview(this.srData[key], correctnessToQuality(isCorrect, elapsedMs));
      const outcome = recordMastery('english', key, isCorrect,
        Object.assign({}, word, { srData: this.srData[key] }));
      if (outcome.mastered) this.mastered.add(key);
      else if (!isCorrect) this.mastered.delete(key);
      // 每日统计由 QuizIntegration 包装器统一记录（与德语侧同理由，避免双计）
    },

    // 词条释义里常常带着答案本身（"n. 露营, 营地；野营房（camp复数）" ← camps），
    // 拼写模式直接展示等于把答案送出去，这里遮住同词根的英文片段。
    _maskAnswer(text, answer) {
      const source = String(text || '');
      const target = String(answer || '').trim();
      if (target.length < 3) return source;
      const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return source.replace(new RegExp(`[A-Za-z]*${escaped}[A-Za-z]*`, 'gi'), '＿＿＿');
    },

    // "n." 这种词性标签作为提示毫无信息量；补上词频区间，拼写模式再给
    // 首字母和长度。
    _hintFor(word, mode) {
      if (!word) return '';
      const parts = [];
      if (word.notes) parts.push(`词性 ${word.notes}`);
      const rank = Number(word.rank);
      if (Number.isFinite(rank) && rank > 0) parts.push(`词频 #${rank.toLocaleString()}`);
      if (mode === 'spelling') {
        const answer = String(word.english || '');
        if (answer) parts.push(`${answer.charAt(0).toUpperCase()} 开头 · ${answer.length} 个字母`);
      }
      return parts.join(' · ');
    },

    startMultipleChoice() {
      if (!this.words.length) {
        alert('英语词汇数据尚未加载。');
        return;
      }
      this.sessionWords = this._buildSession();
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this._germanApp.showScreen('englishMultipleChoiceScreen');
      this._loadMcQuestion();
    },

    _loadMcQuestion() {
      if (this.quizIndex >= this.sessionWords.length) {
        this._finishPractice('multiple-choice');
        return;
      }
      const g = this._germanApp;
      const mcEngine = this._getMcEngine();
      const reverse = mcEngine.isReverse();
      this.currentWord = this.sessionWords[this.quizIndex];
      const word = this.currentWord.english || '-';
      g.setText('englishMcCurrentWord', String(this.quizIndex + 1));
      g.setText('englishMcTotalWords', String(this.sessionWords.length));
      g.updateSessionFill('englishMcSessionFill', this.quizIndex, this.sessionWords.length);
      g.setText('englishMcAccuracy', `${this._accuracy()}%`);
      // 题面跟着出题方向走：反向显示释义，而不是英语词形
      g.setText('englishMcWord', reverse ? mcEngine.questionTextFor(this.currentWord) : word);
      mcEngine.applyDirectionLabels(
        { question: 'englishMcQuestionLabel', options: 'englishMcOptionsLabel' },
        { question: '英语单词', options: '选择正确的中文释义' },
        { question: '中文释义', options: '选择正确的英语单词' }
      );

      const hintText = this._hintFor(this.currentWord, 'multiple-choice');
      const hint = document.getElementById('englishMcHint');
      const hintBtn = document.getElementById('englishMcShowHintBtn');
      if (hint) { hint.textContent = hintText; hint.classList.add('hidden'); }
      if (hintBtn) hintBtn.classList.toggle('hidden', !hintText);

      this._renderMcOptions();
      g.resetFeedback('englishMcFeedback');
      this._questionStartedAt = Date.now();
      // 反向模式的答案就是英语词形，朗读等于报答案
      if (!reverse) this._speak(word);
    },

    _renderMcOptions() {
      const container = document.getElementById('englishMcOptions');
      if (!container || !this.currentWord) return;
      const engine = this._getMcEngine();
      const correct = engine.correctAnswerFor(this.currentWord);
      const options = engine.generateOptions(correct, this._distractorPool());

      engine.renderOptions(options, (btn) => this._checkMcAnswer(btn));
    },

    _checkMcAnswer(button) {
      if (!this.currentWord) return;
      const g = this._germanApp;
      const correct = this._getMcEngine().correctAnswerFor(this.currentWord);
      const selected = button.dataset.answer || '';
      const isCorrect = selected === correct;

      this.quizTotal++;
      this.stats.mcAttempts++;
      if (isCorrect) { this.quizCorrect++; this.stats.mcCorrect++; }
      this._recordAnswer(this.currentWord, isCorrect);

      var engine = this._getMcEngine();
      engine.highlightOptions(correct);
      if (!isCorrect) {
        button.classList.remove('faded');
        button.classList.add('wrong');
      }

      engine.showFeedback(isCorrect, correct);

      g.setText('englishMcAccuracy', `${this._accuracy()}%`);
      this._saveState();
      if (isCorrect) setTimeout(() => this.nextMcQuestion(), 900);
    },

    nextMcQuestion() {
      this.quizIndex++;
      this._loadMcQuestion();
    },

    startSpelling() {
      if (!this.words.length) {
        alert('英语词汇数据尚未加载。');
        return;
      }
      this.sessionWords = this._buildSession();
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this._germanApp.showScreen('englishSpellingScreen');
      this._loadSpellingQuestion();
    },

    _loadSpellingQuestion() {
      if (this.quizIndex >= this.sessionWords.length) {
        this._finishPractice('spelling');
        return;
      }
      const g = this._germanApp;
      this.currentWord = this.sessionWords[this.quizIndex];
      g.setText('englishSpCurrentWord', String(this.quizIndex + 1));
      g.setText('englishSpTotalWords', String(this.sessionWords.length));
      g.updateSessionFill('englishSpSessionFill', this.quizIndex, this.sessionWords.length);
      g.setText('englishSpAccuracy', `${this._accuracy()}%`);
      // 用 chinese（不含词性前缀）作题面，词性已经在提示里给出了。
      const prompt = this.currentWord.chinese || this.currentWord.meaning || '-';
      g.setText('englishSpMeaning', this._maskAnswer(prompt, this.currentWord.english));
      const hintText = this._hintFor(this.currentWord, 'spelling');
      g.setText('englishSpHint', hintText);
      document.getElementById('englishSpHint')?.classList.toggle('hidden', !hintText);

      const input = document.getElementById('englishSpInput');
      const checkBtn = document.getElementById('englishSpCheckBtn');
      if (input) { input.value = ''; input.disabled = false; input.classList.remove('good', 'bad'); input.focus(); }
      if (checkBtn) checkBtn.disabled = false;
      g.resetFeedback('englishSpFeedback');
      this._questionStartedAt = Date.now();
    },

    checkSpelling() {
      if (!this.currentWord) return;
      const g = this._germanApp;
      const input = document.getElementById('englishSpInput');
      const checkBtn = document.getElementById('englishSpCheckBtn');
      const userAnswer = input ? input.value.trim().toLowerCase().replace(/\s+/g, ' ') : '';
      const correct = (this.currentWord.english || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const isCorrect = userAnswer === correct;

      this.quizTotal++;
      this.stats.spAttempts++;
      if (isCorrect) { this.quizCorrect++; this.stats.spCorrect++; }
      this._recordAnswer(this.currentWord, isCorrect);
      if (input) {
        input.disabled = true;
        input.classList.remove('good', 'bad');
        input.classList.add(isCorrect ? 'good' : 'bad');
      }
      if (checkBtn) checkBtn.disabled = true;

      g.showFeedback('englishSpFeedback',
        isCorrect ? '回答正确' : `回答有误，正确拼写：${this.currentWord.english}`, isCorrect);
      g.setText('englishSpAccuracy', `${this._accuracy()}%`);
      this._saveState();
      if (isCorrect) setTimeout(() => this.nextSpelling(), 900);
    },

    nextSpelling() {
      this.quizIndex++;
      this._loadSpellingQuestion();
    },

    openBrowse() {
      const g = this._germanApp;
      g.showScreen('englishBrowseScreen');
      const searchInput = document.getElementById('englishSearchInput');
      if (searchInput) searchInput.value = '';
      this._updateFilterText();
      this._renderBrowse('');
    },

    _setFilter(filter) {
      if (!['all', 'mastered', 'unmastered'].includes(filter)) return;
      this.browseFilter = filter;
      this._saveState();
      this._updateFilterText();
      this._renderBrowse(document.getElementById('englishSearchInput')?.value || '');
    },

    _toggleFilter() {
      const filters = ['all', 'mastered', 'unmastered'];
      const idx = filters.indexOf(this.browseFilter);
      this._setFilter(filters[(idx + 1) % filters.length]);
    },

    _updateFilterText() {
      document.querySelectorAll('#englishFilterChips .chip').forEach((chip) => {
        chip.classList.toggle('active', chip.dataset.filter === this.browseFilter);
      });
    },

    _renderBrowse(searchTerm = '') {
      const container = document.getElementById('englishWordList');
      if (!container) return;
      const keyword = String(searchTerm || '').trim().toLowerCase();
      let words = this.words;

      if (this.browseFilter === 'mastered') words = words.filter(w => this.isMastered(w));
      else if (this.browseFilter === 'unmastered') words = words.filter(w => !this.isMastered(w));

      if (keyword) {
        words = words.filter(w => {
          const hay = [w.english, w.meaning, w.chinese, w.notes].filter(Boolean).join(' ').toLowerCase();
          return hay.includes(keyword);
        });
      }

      this._browse.words = words;
      this._browse.rendered = 0;

      if (!words.length) {
        let message = '没有找到匹配的英语词汇';
        if (!keyword && this.browseFilter === 'mastered') {
          message = '还没有已掌握的英语单词，先去做几组练习吧';
        } else if (!keyword && this.browseFilter === 'unmastered') {
          message = '当前范围内的英语单词都已掌握，可以切换到更大的词频范围';
        }
        container.innerHTML = `<p class="about-note" style="text-align:center;padding:2rem">${escapeHtml(message)}</p>`;
        return;
      }

      container.innerHTML = '<div class="word-card" id="englishWordRows"></div><div id="englishBrowseFooter"></div>';
      this._renderBrowsePage();
    },

    _renderBrowsePage() {
      const rows = document.getElementById('englishWordRows');
      const footer = document.getElementById('englishBrowseFooter');
      if (!rows) return;

      const all = this._browse.words;
      const start = this._browse.rendered;
      const end = Math.min(all.length, start + this._browse.pageSize);
      rows.insertAdjacentHTML('beforeend', all.slice(start, end).map(word => this._browseRowHtml(word)).join(''));
      this._browse.rendered = end;

      if (footer) {
        footer.innerHTML = end < all.length
          ? `<button class="pill-btn" type="button" data-english-browse-more style="margin-top:14px"><span class="msr">expand_more</span>加载更多（已显示 ${end} / ${all.length}）</button>`
          : `<div class="about-note" style="margin-top:14px">共 ${all.length} 个词条</div>`;
      }
    },

    _browseRowHtml(word) {
      const isMastered = this.isMastered(word);
      // meaning 是 "词性 + 中文释义"，chinese 是同一条释义去掉词性，notes 又是
      // 同一个词性标签 —— 原来一行里把同一份内容显示了三遍。这里拆开：
      // 释义只留中文，词性放到小字注释，第三列改成词频。
      const gloss = word.chinese || word.meaning || '-';
      const pos = word.notes || '';
      const rank = Number(word.rank);
      const rankText = Number.isFinite(rank) && rank > 0 ? `词频 #${rank.toLocaleString()}` : '';
      return `
        <div class="word-line" data-word="${escapeAttribute(word.english || '')}" style="cursor:pointer">
          <span class="wl-word">${escapeHtml(word.english || '')}</span>
          <span class="wl-gloss">${escapeHtml(gloss)}${pos ? `<span class="wl-note">${escapeHtml(pos)}</span>` : ''}</span>
          <span class="wl-cn">${escapeHtml(rankText)}</span>
          <span class="wl-status"><span class="dot${isMastered ? ' good' : ''}"></span>${isMastered ? '已掌握' : '学习中'}</span>
          <button class="wl-speaker" title="朗读"><span class="msr">volume_up</span></button>
        </div>`;
    },

    // 进度屏应该始终反映系统词库的整体进度；之前用的是 this.words /
    // this.mastered，选过个人词本之后这里报的是词本的数字。
    updateProgressStats() {
      const progressWords = this.systemWords.length ? this.systemWords : this.words;
      let systemMastered;
      try {
        systemMastered = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.EN_MASTERED) || '[]'));
      } catch (error) {
        systemMastered = new Set();
      }
      const totalWords = progressWords.length;
      let masteredCount = 0;
      progressWords.forEach((word) => {
        if (systemMastered.has(this.masteredKey(word))) masteredCount += 1;
      });
      const progress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
      const totalAttempts = (this.stats.mcAttempts || 0) + (this.stats.spAttempts || 0);
      const totalCorrect = (this.stats.mcCorrect || 0) + (this.stats.spCorrect || 0);
      const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

      this._germanApp.setText('englishProgressTotalWords', totalWords.toLocaleString());
      this._germanApp.setText('englishProgressMasteredWords', masteredCount.toLocaleString());
      this._germanApp.setText('englishProgressPercent', `${progress}%`);
      this._germanApp.setText('englishProgressMcStats', `${this.stats.mcCorrect || 0} / ${this.stats.mcAttempts || 0}`);
      this._germanApp.setText('englishProgressSpStats', `${this.stats.spCorrect || 0} / ${this.stats.spAttempts || 0}`);
      this._germanApp.setText('englishProgressAccuracy', `${accuracy}%`);
      renderProgressPanels('english', 'english', this.stats,
        (id, value) => this._germanApp.setText(id, value));
      this.updateHeaderStats();
    },

    _finishPractice(mode) {
      const acc = this._accuracy();
      const name = mode === 'spelling' ? 'Spelling' : 'Multiple Choice';
      const remaining = Math.max(0, this.words.length - this.countMastered(this.words));
      alert(`English ${name} practice complete\n\nCorrect: ${this.quizCorrect}/${this.quizTotal}\nAccuracy: ${acc}%\nRemaining in scope: ${remaining}`);
      this._germanApp.showScreen('englishVocabularyModesScreen');
    },

    _accuracy() {
      return this.quizTotal > 0 ? Math.round((this.quizCorrect / this.quizTotal) * 100) : 0;
    },

    _speak(text) {
      if (!text || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => /^en/i.test(v.lang));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },

    _shuffle(array) {
      const copy = array.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GermanApp.init());
  } else {
    GermanApp.init();
  }

  window.GermanApp = GermanApp;
  window.EnglishApp = EnglishApp;
})();
