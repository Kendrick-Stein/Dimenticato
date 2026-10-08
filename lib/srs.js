/**
 * 间隔重复（SM-2）与每日学习统计 —— 四门语言共用一份实现。
 *
 * 词条键一律是 entry.word（schema v1 的唯一键）；旧版本按语言各用一个字段
 * （italian / german …）写下的键由 LegacyMigration 在词库到位时改写过来。
 * 存储 key 由 DimStorage.key 生成：dimenticato_<code>_srs、dimenticato_<code>_daily_stats
 * （旧布局由 LegacyMigration 在 lib/storage.js 加载时迁移过来）。
 * lang 参数接受 code（'de'）或旧的语言 key（'german'），内部一律归一成 code。
 */
// ==================== 间隔重复算法 (SM-2) ====================
//
// 重要背景：这套 SRS 以前是【完全没有运行过】的死代码。
// app.js 里用 `if (typeof StatsManager !== 'undefined' && typeof
// SpacedRepetition !== 'undefined')` 来决定是否安装包装器，而这两个符号是本文件
// 的顶层 const —— 本文件在 app.js 之后加载，所以那两个 typeof 永远是 'undefined'。
// 修复方式：包装器改到本文件底部安装（那时两个模块都已存在），并且所有跨文件符号
// 一律通过 window.* 在【调用时】解析。
//
// 另外两处实质性修复：
//   1. sr.interval = Math.round(sr.interval * sr.easiness) 从来没有上限，连续
//      答对约 20 次后 interval 会溢出成 Infinity/超大值，
//      new Date().setDate(day + interval) 抛 RangeError，练习直接崩。现在
//      interval 硬性封顶 MAX_INTERVAL 天，日期也再做一次 clamp。
//   2. srData 以前只挂在内存中的 word 对象上，刷新即丢。现在按语言持久化到
//      dimenticato_<code>_srs。

const SpacedRepetition = {
  // SM-2 算法默认参数
  DEFAULT_EASINESS: 2.5,
  MIN_EASINESS: 1.3,
  // 上限：SM-2 原始论文只限制下界，但不限制上界会让 interval 指数爆炸
  MAX_EASINESS: 2.8,
  // 间隔上限（天）。一年已经远超任何实际复习需求，同时保证
  // Date 永远不会溢出（旧代码在第 16~21 次连续答对时必崩）。
  MAX_INTERVAL: 365,
  MAX_REPETITIONS: 1000,

  LANGS: window.Languages.keys.slice(),  // 清单只在 lib/languages.js 里维护

  _store: {},          // code -> { wordKey: srData }
  _storeLoaded: {},    // code -> bool

  // ---------- 持久化 ----------

  /** 'german' / 'de' / 未传（当前语言）→ 'de' */
  langCode(lang) {
    return window.DimStorage.code(lang);
  },

  storeKey(lang) {
    return window.DimStorage.srsKey(lang);
  },

  wordKey(lang, word) {
    if (!word) return '';
    if (typeof word === 'string') return word;
    return String(word.word || '');
  },

  loadStore(lang) {
    const language = this.langCode(lang);
    if (this._storeLoaded[language]) return this._store[language];
    let parsed = null;
    try {
      const raw = localStorage.getItem(this.storeKey(language));
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('加载 SRS 数据失败:', e);
    }
    this._store[language] = (parsed && typeof parsed === 'object') ? parsed : {};
    this._storeLoaded[language] = true;
    return this._store[language];
  },

  saveStore(lang) {
    const language = this.langCode(lang);
    window.DimStorage.safeSetItem(this.storeKey(language), JSON.stringify(this._store[language] || {}));
  },

  // ---------- SR 数据 ----------

  newSRData() {
    return {
      easiness: this.DEFAULT_EASINESS,
      interval: 0,
      repetitions: 0,
      nextReviewDate: localDay(),
      lastReviewDate: null,
      reviewHistory: []
    };
  },

  // 兼容旧调用：把 srData 挂回 word 对象上
  initWordSRData(word) {
    if (!word || typeof word !== 'object') return word;
    if (!word.srData) word.srData = this.newSRData();
    return word;
  },

  // 只读查询：绝不写入（getWordStatus 会被 27k 个词逐个调用）
  peek(lang, word) {
    const store = this.loadStore(lang);
    return store[this.wordKey(lang, word)] || null;
  },

  /**
   * SM-2 核心：根据本次作答质量更新一条 srData。
   * 纯函数式（只改传入的 srData 并返回它），因此可以直接单测。
   * 为了兼容旧签名，也接受一个 word 对象（自动取/建 word.srData）。
   * quality: 0-5 (0=完全忘记, 5=完美记忆)
   */
  calculateNextReview(srData, quality) {
    // 兼容 calculateNextReview(word, quality)
    let sr = srData;
    if (sr && typeof sr === 'object' && !('easiness' in sr)) {
      this.initWordSRData(sr);
      sr = sr.srData;
    }
    if (!sr || typeof sr !== 'object') sr = this.newSRData();

    // 兜底：从损坏的存储读回来的字段可能不是数字
    if (!Number.isFinite(sr.easiness)) sr.easiness = this.DEFAULT_EASINESS;
    if (!Number.isFinite(sr.interval)) sr.interval = 0;
    if (!Number.isFinite(sr.repetitions)) sr.repetitions = 0;
    if (!Array.isArray(sr.reviewHistory)) sr.reviewHistory = [];

    const q = Math.min(5, Math.max(0, Number(quality) || 0));

    // 记录复习历史（只保留最近 20 次）
    sr.reviewHistory.push({
      date: new Date().toISOString(),
      quality: q,
      interval: sr.interval
    });
    if (sr.reviewHistory.length > 20) {
      sr.reviewHistory = sr.reviewHistory.slice(-20);
    }

    // 更新 easiness factor —— 上下界都要夹
    sr.easiness = Math.min(
      this.MAX_EASINESS,
      Math.max(
        this.MIN_EASINESS,
        sr.easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      )
    );

    // 如果回答质量 < 3，重置进度
    if (q < 3) {
      sr.repetitions = 0;
      sr.interval = 0;
    } else {
      // 计算新的间隔
      if (sr.repetitions === 0) {
        sr.interval = 1;
      } else if (sr.repetitions === 1) {
        sr.interval = 6;
      } else {
        sr.interval = Math.round(sr.interval * sr.easiness);
      }
      // ★ 这行是 Date 溢出崩溃的修复点
      sr.interval = Math.min(this.MAX_INTERVAL, Math.max(0, sr.interval));
      sr.repetitions = Math.min(this.MAX_REPETITIONS, sr.repetitions + 1);
    }

    // 计算下次复习日期（interval 已封顶，这里再兜一次底）
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + sr.interval);
    sr.nextReviewDate = Number.isNaN(nextDate.getTime())
      ? localDay()
      : localDay(nextDate);
    sr.lastReviewDate = localDay();

    return sr;
  },

  // 记一次复习并落盘（练习模式调用的就是这个）
  review(lang, word, quality) {
    const language = this.langCode(lang);
    const key = this.wordKey(language, word);
    if (!key) return null;
    const store = this.loadStore(language);
    const sr = this.calculateNextReview(store[key] || this.newSRData(), quality);
    store[key] = sr;
    if (word && typeof word === 'object') word.srData = sr;
    this.saveStore(language);
    return sr;
  },

  /**
   * 今天（或更早）到期、且【至少复习过一次】的单词。
   * 从没练过的新词不算“待复习”，否则第一次打开应用就会显示 27,117 个待复习。
   */
  getDueWords(lang, words) {
    // 兼容旧签名 getDueWords(words)
    if (Array.isArray(lang)) {
      words = lang;
      lang = null;
    }
    const language = this.langCode(lang);
    const list = Array.isArray(words) ? words : [];
    const store = this.loadStore(language);
    const today = localDay();
    return list.filter(word => {
      const sr = store[this.wordKey(language, word)];
      return !!sr && !!sr.lastReviewDate && sr.nextReviewDate <= today;
    });
  },

  countDueWords(lang, words) {
    return this.getDueWords(lang, words).length;
  },

  // 获取单词的复习状态（只读，不会写存储）。
  // 颜色只给设计 token 名（colorVar）和类名，由样式表决定具体色值，深色主题自动跟随。
  getWordStatus(word, lang) {
    const sr = this.peek(lang, word) || (word && word.srData) || null;
    const repetitions = sr && Number.isFinite(sr.repetitions) ? sr.repetitions : 0;

    if (repetitions === 0) {
      return { status: 'new', label: '新词', colorVar: '--ink-soft', className: 'srs-status-new' };
    } else if (repetitions < 3) {
      return { status: 'learning', label: '学习中', colorVar: '--gold', className: 'srs-status-learning' };
    }
    return { status: 'mastered', label: '熟练', colorVar: '--verde', className: 'srs-status-mastered' };
  },

  // 将答对/答错转换为质量分数
  convertCorrectToQuality(isCorrect, timeSpent = null) {
    if (isCorrect) {
      // 如果有时间数据，可以根据速度调整质量
      if (timeSpent && timeSpent < 3000) { // 3秒内
        return 5; // 完美
      }
      return 4; // 正确
    }
    return 2; // 困难但记得
  }
};

window.SpacedRepetition = SpacedRepetition;

// ==================== 每日统计管理 ====================
//
// 每日统计【按语言分开】存在 dimenticato_<code>_daily_stats，
// 这样各语言的练习不会互相算进对方的学习曲线里。

const StatsManager = {
  LANGS: window.Languages.keys.slice(),  // 清单只在 lib/languages.js 里维护

  keyFor(lang) {
    return window.DimStorage.dailyStatsKey(lang);
  },

  activeLang() {
    return window.DimStorage.code();
  },

  // 获取今天的日期字符串
  getTodayString() {
    return localDay();
  },

  // 加载每日统计数据
  loadDailyStats(lang) {
    try {
      const data = localStorage.getItem(this.keyFor(lang || this.activeLang()));
      const parsed = data ? JSON.parse(data) : {};
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
      console.error('加载每日统计失败:', e);
      return {};
    }
  },

  // 保存每日统计数据
  saveDailyStats(stats, lang) {
    window.DimStorage.safeSetItem(this.keyFor(lang || this.activeLang()), JSON.stringify(stats));
  },

  _blankDay(date) {
    return {
      date,
      duration: 0, // 学习时长（秒）
      wordsLearned: new Set(),
      correctCount: 0,
      totalCount: 0,
      reviewCount: 0,
      sessionStart: new Date().toISOString()
    };
  },

  // 获取今天的统计数据
  getTodayStats(lang) {
    const language = lang || this.activeLang();
    const allStats = this.loadDailyStats(language);
    const today = this.getTodayString();

    if (!allStats[today]) {
      allStats[today] = this._blankDay(today);
    }

    // 转换 Set 为数组（因为 localStorage 不能直接存储 Set）
    if (Array.isArray(allStats[today].wordsLearned)) {
      allStats[today].wordsLearned = new Set(allStats[today].wordsLearned);
    } else if (!(allStats[today].wordsLearned instanceof Set)) {
      allStats[today].wordsLearned = new Set();
    }

    return allStats[today];
  },

  _persistToday(language, todayStats) {
    const allStats = this.loadDailyStats(language);
    allStats[this.getTodayString()] = {
      ...todayStats,
      wordsLearned: Array.from(todayStats.wordsLearned)
    };
    this.saveDailyStats(allStats, language);
  },

  // 同一次作答被两处代码同时上报时去重（各语言模块可能自己也接了埋点）
  _lastRecord: null,

  /**
   * 记录一次学习活动。
   *   新签名：recordActivity(lang, { correct, total, durationMs, words, review })
   *   旧签名：recordActivity(word, isCorrect, isReview)  —— 仍然可用
   */
  recordActivity(lang, payload, legacyIsReview) {
    let language;
    let correct;
    let total;
    let durationMs = 0;
    let words = [];
    let reviewCount = 0;

    const isNewSignature = typeof lang === 'string'
      && window.Languages.has(lang)
      && payload
      && typeof payload === 'object';

    if (isNewSignature) {
      language = window.DimStorage.code(lang);
      total = Number(payload.total);
      if (!Number.isFinite(total)) total = 1;
      correct = Number(payload.correct);
      if (!Number.isFinite(correct)) correct = payload.correct ? 1 : 0;
      durationMs = Number(payload.durationMs) || 0;
      if (Array.isArray(payload.words)) words = payload.words;
      else if (payload.word) words = [payload.word];
      reviewCount = payload.review ? (Number(payload.review) || 1) : 0;
    } else {
      // 旧签名 recordActivity(word, isCorrect, isReview)
      language = this.activeLang();
      const word = lang;
      total = 1;
      correct = payload ? 1 : 0;
      const key = window.SpacedRepetition.wordKey(language, word);
      if (key) words = [key];
      reviewCount = legacyIsReview ? 1 : 0;
    }

    // 去重：同一语言、同一批次、同样的词，100ms 内只记一次
    const signature = `${language}|${correct}|${total}|${words.join(',')}`;
    const now = Date.now();
    if (this._lastRecord
      && this._lastRecord.signature === signature
      && now - this._lastRecord.at < 100) {
      return this._lastRecord.stats;
    }

    const todayStats = this.getTodayStats(language);
    words.forEach(word => {
      const key = typeof word === 'string'
        ? word
        : (window.SpacedRepetition ? window.SpacedRepetition.wordKey(language, word) : '');
      if (key) todayStats.wordsLearned.add(key);
    });
    todayStats.totalCount += total;
    todayStats.correctCount += correct;
    todayStats.reviewCount += reviewCount;
    if (durationMs > 0) todayStats.duration += Math.round(durationMs / 1000);

    this._persistToday(language, todayStats);
    this._lastRecord = { signature, at: now, stats: todayStats };
    return todayStats;
  },

  // 更新学习时长
  updateDuration(seconds, lang) {
    const language = lang || this.activeLang();
    const todayStats = this.getTodayStats(language);
    todayStats.duration += Number(seconds) || 0;
    this._persistToday(language, todayStats);
    return todayStats;
  },

  // 获取最近 N 天的统计（默认当前语言；lang='all' 时四种语言相加）
  getRecentStats(days = 7, lang) {
    const language = lang || this.activeLang();
    const sources = language === 'all'
      ? this.LANGS.map(l => this.loadDailyStats(l))
      : [this.loadDailyStats(language)];
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = localDay(date);

      const day = {
        date: dateStr,
        duration: 0,
        wordsLearned: 0,
        correctCount: 0,
        totalCount: 0,
        reviewCount: 0
      };
      sources.forEach(allStats => {
        const entry = allStats[dateStr];
        if (!entry) return;
        day.duration += entry.duration || 0;
        day.correctCount += entry.correctCount || 0;
        day.totalCount += entry.totalCount || 0;
        day.reviewCount += entry.reviewCount || 0;
        day.wordsLearned += Array.isArray(entry.wordsLearned) ? entry.wordsLearned.length : 0;
      });
      result.push(day);
    }

    return result;
  },

  // 获取总计统计（默认当前语言；lang='all' 时四种语言合并）
  getTotalStats(lang) {
    const language = lang || this.activeLang();
    const sources = language === 'all'
      ? this.LANGS.map(l => this.loadDailyStats(l))
      : [this.loadDailyStats(language)];

    const allWords = new Set();
    let totalDuration = 0;
    let totalCorrect = 0;
    let totalAttempts = 0;
    let totalReviews = 0;

    sources.forEach(allStats => {
      Object.values(allStats).forEach(dayStat => {
        const words = Array.isArray(dayStat.wordsLearned) ? dayStat.wordsLearned : [];
        words.forEach(w => allWords.add(w));
        totalDuration += dayStat.duration || 0;
        totalCorrect += dayStat.correctCount || 0;
        totalAttempts += dayStat.totalCount || 0;
        totalReviews += dayStat.reviewCount || 0;
      });
    });

    return {
      totalWords: allWords.size,
      totalDuration,
      totalCorrect,
      totalAttempts,
      totalReviews,
      averageAccuracy: totalAttempts > 0 ? (totalCorrect / totalAttempts * 100).toFixed(1) : 0
    };
  },

  // 连续学习天数（今天没学也不算断，从昨天开始往回数）
  getStreak(lang) {
    const language = lang || this.activeLang();
    const sources = language === 'all'
      ? this.LANGS.map(l => this.loadDailyStats(l))
      : [this.loadDailyStats(language)];
    const active = (dateStr) => sources.some(s => s[dateStr] && (s[dateStr].totalCount || 0) > 0);

    let streak = 0;
    const cursor = new Date();
    if (!active(localDay(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    for (let i = 0; i < 400; i++) {
      if (!active(localDay(cursor))) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }
};

window.StatsManager = StatsManager;
