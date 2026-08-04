/**
 * Dimenticato - 增强功能模块
 * 包含：创建单词本、单词编辑、间隔重复算法、统计增强
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
//      dimenticato_srs_<lang>。

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

  LANGS: ['italian', 'german', 'english', 'french'],
  // 每种语言用哪个字段作为单词的唯一键
  WORD_FIELD: {
    italian: 'italian',
    german: 'german',
    english: 'english',
    french: 'french'
  },

  _store: {},          // lang -> { wordKey: srData }
  _storeLoaded: {},    // lang -> bool

  // ---------- 持久化 ----------

  storeKey(lang) {
    return `dimenticato_srs_${lang || 'italian'}`;
  },

  wordKey(lang, word) {
    if (!word) return '';
    if (typeof word === 'string') return word;
    const field = this.WORD_FIELD[lang] || 'italian';
    return String(word[field] || word.italian || word.display || word.word || '');
  },

  loadStore(lang) {
    const language = lang || 'italian';
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
    const language = lang || 'italian';
    const store = this._store[language] || {};
    const payload = JSON.stringify(store);
    if (window.DimStorage) {
      window.DimStorage.safeSetItem(this.storeKey(language), payload);
      return;
    }
    try {
      localStorage.setItem(this.storeKey(language), payload);
    } catch (e) {
      console.error('保存 SRS 数据失败:', e);
    }
  },

  // ---------- SR 数据 ----------

  newSRData() {
    return {
      easiness: this.DEFAULT_EASINESS,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString().split('T')[0],
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
      ? new Date().toISOString().split('T')[0]
      : nextDate.toISOString().split('T')[0];
    sr.lastReviewDate = new Date().toISOString().split('T')[0];

    return sr;
  },

  // 记一次复习并落盘（练习模式调用的就是这个）
  review(lang, word, quality) {
    const language = lang || 'italian';
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
      lang = window.getActiveLanguage ? window.getActiveLanguage() : 'italian';
    }
    const language = lang || 'italian';
    const list = Array.isArray(words) ? words : [];
    const store = this.loadStore(language);
    const today = new Date().toISOString().split('T')[0];
    return list.filter(word => {
      const sr = store[this.wordKey(language, word)];
      return !!sr && !!sr.lastReviewDate && sr.nextReviewDate <= today;
    });
  },

  countDueWords(lang, words) {
    return this.getDueWords(lang, words).length;
  },

  // 获取单词的复习状态（只读，不会写存储）
  getWordStatus(word, lang) {
    const language = lang || (window.getActiveLanguage ? window.getActiveLanguage() : 'italian');
    const sr = this.peek(language, word) || (word && word.srData) || null;
    const repetitions = sr && Number.isFinite(sr.repetitions) ? sr.repetitions : 0;

    if (repetitions === 0) {
      return { status: 'new', label: '新词', color: '#3498db' };
    } else if (repetitions < 3) {
      return { status: 'learning', label: '学习中', color: '#f39c12' };
    }
    return { status: 'mastered', label: '熟练', color: '#2ecc71' };
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
// 每日统计现在【按语言分开】：意大利语沿用旧 key dimenticato_daily_stats，
// 其余三种语言写 dimenticato_daily_stats_<lang>，这样德/英/法的练习不会再被
// 算进意大利语的学习曲线里。

const StatsManager = {
  STORAGE_KEY: 'dimenticato_daily_stats',
  LANGS: ['italian', 'german', 'english', 'french'],

  keyFor(lang) {
    return (!lang || lang === 'italian')
      ? this.STORAGE_KEY
      : `dimenticato_daily_stats_${lang}`;
  },

  activeLang() {
    return window.getActiveLanguage ? window.getActiveLanguage() : 'italian';
  },

  // 获取今天的日期字符串
  getTodayString() {
    return new Date().toISOString().split('T')[0];
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
    const key = this.keyFor(lang || this.activeLang());
    const payload = JSON.stringify(stats);
    if (window.DimStorage) {
      window.DimStorage.safeSetItem(key, payload);
      return;
    }
    try {
      localStorage.setItem(key, payload);
    } catch (e) {
      console.error('保存每日统计失败:', e);
    }
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
      && this.LANGS.indexOf(lang) !== -1
      && payload
      && typeof payload === 'object';

    if (isNewSignature) {
      language = lang;
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
      const key = window.SpacedRepetition
        ? window.SpacedRepetition.wordKey(language, word)
        : (word && word.italian) || '';
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
      const dateStr = date.toISOString().split('T')[0];

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
    if (!active(cursor.toISOString().split('T')[0])) {
      cursor.setDate(cursor.getDate() - 1);
    }
    for (let i = 0; i < 400; i++) {
      if (!active(cursor.toISOString().split('T')[0])) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }
};

window.StatsManager = StatsManager;

// ==================== 单词本编辑器 ====================

const WordbookEditor = {
  currentEditingWordbook: null,
  currentEditingWord: null,
  selectedWords: new Set(),

  getLanguageConfig(language = 'italian') {
    if (language === 'german') {
      return {
        primaryKey: 'german',
        secondaryKey: 'meaning',
        primaryLabel: '德语',
        secondaryLabel: '释义'
      };
    }

    if (language === 'english') {
      return {
        primaryKey: 'english',
        secondaryKey: 'meaning',
        primaryLabel: '英语',
        secondaryLabel: '释义'
      };
    }

    if (language === 'french') {
      return {
        primaryKey: 'french',
        secondaryKey: 'meaning',
        primaryLabel: '法语',
        secondaryLabel: '释义'
      };
    }

    return {
      primaryKey: 'italian',
      secondaryKey: 'english',
      primaryLabel: '意大利语',
      secondaryLabel: '英语翻译'
    };
  },
  
  // 创建新单词本
  createNewWordbook(language = 'italian') {
    const name = prompt('请输入单词本名称：');
    if (!name || !name.trim()) {
      return null;
    }
    
    const description = prompt('请输入单词本描述（可选）：', '');
    
    const wordbook = {
      id: Date.now(),
      name: name.trim(),
      language,
      description: description ? description.trim() : '',
      words: [],
      wordCount: 0,
      createdAt: new Date().toISOString()
    };
    
    AppState.customWordbooks.push(wordbook);
    WordbookManager.saveWordbooks();
    WordbookManager.renderWordbookCards();
    
    return wordbook;
  },
  
  // 打开单词本编辑器
  openEditor(wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) {
      alert('单词本不存在');
      return;
    }
    
    this.currentEditingWordbook = wordbook;
    this.selectedWords.clear();
    
    // 显示编辑器模态框
    this.showEditorModal();
  },
  
  // 显示编辑器模态框
  showEditorModal() {
    const modal = document.getElementById('wordbookEditorModal');
    if (!modal) {
      console.error('编辑器模态框不存在');
      return;
    }
    
    // 更新标题
    document.getElementById('editorWordbookName').textContent = this.currentEditingWordbook.name;
    
    // 渲染单词列表
    this.renderEditorWordList();
    
    // 显示模态框
    modal.classList.remove('hidden');
  },
  
  // 隐藏编辑器模态框
  hideEditorModal() {
    const modal = document.getElementById('wordbookEditorModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.currentEditingWordbook = null;
    this.selectedWords.clear();
  },
  
  // 渲染编辑器中的单词列表
  renderEditorWordList() {
    const container = document.getElementById('editorWordList');
    if (!container || !this.currentEditingWordbook) return;
    
    const words = this.currentEditingWordbook.words;
    const config = this.getLanguageConfig(this.currentEditingWordbook.language);
    
    if (words.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">此单词本还没有单词</p>';
      return;
    }
    
    // 单词内容全部来自用户导入的文件 / 社区词本，进 innerHTML 前必须转义
    const esc = window.escapeHtml || (s => String(s == null ? '' : s));

    container.innerHTML = words.map((word, index) => `
      <div class="editor-word-item">
        <input type="checkbox" class="word-checkbox" data-index="${index}"
          ${this.selectedWords.has(index) ? 'checked' : ''}>
        <div class="editor-word-content">
          <div class="editor-word-main">
            <span class="editor-word-italian">${esc(word[config.primaryKey] || word.display || '')}</span>
            <span class="editor-word-english">${esc(word[config.secondaryKey] || '')}</span>
          </div>
          ${word.chinese ? `<div class="editor-word-chinese">${esc(word.chinese)}</div>` : ''}
          ${word.notes ? `<div class="editor-word-notes">${esc(word.notes)}</div>` : ''}
        </div>
        <div class="editor-word-actions">
          <button class="editor-action-btn edit" onclick="WordbookEditor.editWord(${index})" title="编辑">
            <span class="msr">edit</span>
          </button>
          <button class="editor-action-btn delete" onclick="WordbookEditor.deleteWord(${index})" title="删除">
            <span class="msr">delete</span>
          </button>
        </div>
      </div>
    `).join('');
    
    // 绑定复选框事件
    container.querySelectorAll('.word-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        if (e.target.checked) {
          this.selectedWords.add(index);
        } else {
          this.selectedWords.delete(index);
        }
        this.updateBatchActionsVisibility();
      });
    });
  },
  
  // 更新批量操作按钮的可见性
  updateBatchActionsVisibility() {
    const batchActions = document.querySelector('.editor-batch-actions');
    if (batchActions) {
      batchActions.style.display = this.selectedWords.size > 0 ? 'flex' : 'none';
    }
  },
  
  // 添加新单词
  addNewWord() {
    if (!this.currentEditingWordbook) return;
    
    this.showWordEditDialog(null);
  },
  
  // 编辑单词
  editWord(index) {
    if (!this.currentEditingWordbook) return;
    
    const word = this.currentEditingWordbook.words[index];
    this.currentEditingWord = { word, index };
    this.showWordEditDialog(word);
  },
  
  // 显示单词编辑对话框
  showWordEditDialog(word) {
    const dialog = document.getElementById('wordEditDialog');
    if (!dialog) return;
    const config = this.getLanguageConfig(this.currentEditingWordbook?.language || 'italian');

    const primaryLabel = document.getElementById('editWordPrimaryLabel');
    const secondaryLabel = document.getElementById('editWordSecondaryLabel');
    const chineseLabel = document.getElementById('editWordChineseLabel');
    if (primaryLabel) primaryLabel.textContent = `${config.primaryLabel} *`;
    if (secondaryLabel) secondaryLabel.textContent = `${config.secondaryLabel} *`;
    if (chineseLabel) chineseLabel.textContent = '中文翻译';
    
    // 填充表单
    if (word) {
      document.getElementById('editWordItalian').value = word[config.primaryKey] || word.display || '';
      document.getElementById('editWordEnglish').value = word[config.secondaryKey] || '';
      document.getElementById('editWordChinese').value = word.chinese || '';
      document.getElementById('editWordNotes').value = word.notes || '';
      document.getElementById('wordEditDialogTitle').textContent = '编辑单词';
    } else {
      document.getElementById('editWordItalian').value = '';
      document.getElementById('editWordEnglish').value = '';
      document.getElementById('editWordChinese').value = '';
      document.getElementById('editWordNotes').value = '';
      document.getElementById('wordEditDialogTitle').textContent = '添加新单词';
    }
    
    dialog.classList.remove('hidden');
  },
  
  // 隐藏单词编辑对话框
  hideWordEditDialog() {
    const dialog = document.getElementById('wordEditDialog');
    if (dialog) {
      dialog.classList.add('hidden');
    }
    this.currentEditingWord = null;
  },
  
  // 保存单词编辑
  saveWordEdit() {
    if (!this.currentEditingWordbook) return;
    const config = this.getLanguageConfig(this.currentEditingWordbook.language);
    
    const primaryValue = document.getElementById('editWordItalian').value.trim();
    const secondaryValue = document.getElementById('editWordEnglish').value.trim();
    const chinese = document.getElementById('editWordChinese').value.trim();
    const notes = document.getElementById('editWordNotes').value.trim();
    
    if (!primaryValue || !secondaryValue) {
      alert(`${config.primaryLabel}和${config.secondaryLabel}不能为空！`);
      return;
    }
    
    const wordData = { chinese, notes };
    wordData[config.primaryKey] = primaryValue;
    wordData[config.secondaryKey] = secondaryValue;
    if (config.primaryKey === 'german' || config.primaryKey === 'french') {
      wordData.display = primaryValue;
    }
    
    if (this.currentEditingWord) {
      // 编辑现有单词
      this.currentEditingWordbook.words[this.currentEditingWord.index] = wordData;
    } else {
      // 添加新单词
      this.currentEditingWordbook.words.push(wordData);
    }
    
    // 更新单词数量
    this.currentEditingWordbook.wordCount = this.currentEditingWordbook.words.length;
    
    // 保存到 localStorage
    WordbookManager.saveWordbooks();
    
    // 刷新显示
    this.renderEditorWordList();
    this.hideWordEditDialog();
    
    // 如果当前正在学习这个单词本，更新显示
    if (AppState.currentWordbook && AppState.currentWordbook.id === this.currentEditingWordbook.id) {
      AppState.currentWordbook = this.currentEditingWordbook;
      AppState.currentWords = WordbookManager.mapWordbookWordsForLanguage(
        this.currentEditingWordbook.words,
        this.currentEditingWordbook.language || 'italian'
      );
      updateHeaderStats();
    }
  },
  
  // 删除单词
  deleteWord(index) {
    if (!this.currentEditingWordbook) return;
    
    if (confirm('确定要删除这个单词吗？')) {
      this.currentEditingWordbook.words.splice(index, 1);
      this.currentEditingWordbook.wordCount = this.currentEditingWordbook.words.length;
      WordbookManager.saveWordbooks();
      this.renderEditorWordList();
      
      // 更新当前学习状态
      if (AppState.currentWordbook && AppState.currentWordbook.id === this.currentEditingWordbook.id) {
        AppState.currentWordbook = this.currentEditingWordbook;
        AppState.currentWords = WordbookManager.mapWordbookWordsForLanguage(
          this.currentEditingWordbook.words,
          this.currentEditingWordbook.language || 'italian'
        );
        updateHeaderStats();
      }
    }
  },
  
  // 批量删除
  batchDelete() {
    if (!this.currentEditingWordbook || this.selectedWords.size === 0) return;
    
    if (confirm(`确定要删除选中的 ${this.selectedWords.size} 个单词吗？`)) {
      // 从大到小排序索引，避免删除时索引错位
      const indices = Array.from(this.selectedWords).sort((a, b) => b - a);
      indices.forEach(index => {
        this.currentEditingWordbook.words.splice(index, 1);
      });
      
      this.currentEditingWordbook.wordCount = this.currentEditingWordbook.words.length;
      this.selectedWords.clear();
      WordbookManager.saveWordbooks();
      this.renderEditorWordList();
      this.updateBatchActionsVisibility();
    }
  },
  
  // 导出单词本为 JSON
  exportWordbookAsJSON(wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) {
      alert('单词本不存在');
      return;
    }
    
    // 创建导出数据
    const exportData = {
      name: wordbook.name,
      description: wordbook.description || '',
      words: wordbook.words,
      exportDate: new Date().toISOString(),
      exportedFrom: 'Dimenticato'
    };
    
    // 转换为 JSON 字符串
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // 创建 Blob 并下载
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wordbook.name}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`已导出"${wordbook.name}"为 JSON 格式。`);
  },
  
  // 导出单词本为 TXT
  exportWordbookAsTXT(wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) {
      alert('单词本不存在');
      return;
    }
    
    // 创建 TXT 内容（按词本语言使用对应字段）
    let txtContent = '';
    const config = this.getLanguageConfig(wordbook.language || 'italian');
    
    wordbook.words.forEach((word, index) => {
      txtContent += (word[config.primaryKey] || word.display || '') + '\n';
      txtContent += (word[config.secondaryKey] || '') + '\n';
      // 添加中文（如果有）
      txtContent += (word.chinese || '') + '\n';
      // 添加笔记（如果有）
      if (word.notes) {
        txtContent += word.notes + '\n';
      }
      
      // 单词之间用空行分隔（最后一个单词除外）
      if (index < wordbook.words.length - 1) {
        txtContent += '\n';
      }
    });
    
    // 创建 Blob 并下载
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wordbook.name}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`已导出"${wordbook.name}"为 TXT 格式。`);
  },
  
  // 显示导出选项对话框
  showExportDialog(wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) return;
    
    const format = prompt(
      `导出单词本"${wordbook.name}"\n\n` +
      `请选择导出格式：\n` +
      `1 - JSON 格式（可重新导入）\n` +
      `2 - TXT 格式（易于编辑）\n\n` +
      `请输入 1 或 2：`
    );
    
    if (format === '1') {
      this.exportWordbookAsJSON(wordbookId);
    } else if (format === '2') {
      this.exportWordbookAsTXT(wordbookId);
    }
  },
  
  // 批量导入新单词到当前编辑的单词本
  batchImportWords() {
    if (!this.currentEditingWordbook) {
      alert('请先打开一个单词本');
      return;
    }
    
    const fileInput = document.getElementById('editorBatchImportInput');
    if (!fileInput) {
      alert('文件输入元素不存在');
      return;
    }
    
    // 绑定文件选择事件
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleBatchImport(file);
      }
      // 清空 input，允许重复选择同一文件
      fileInput.value = '';
    };
    
    // 触发文件选择
    fileInput.click();
  },
  
  // 处理批量导入文件
  async handleBatchImport(file) {
    if (!this.currentEditingWordbook) return;
    
    // 只支持 TXT 格式
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('批量导入仅支持 TXT 格式文件！');
      return;
    }
    
    try {
      const text = await file.text();
      
      const language = this.currentEditingWordbook.language || 'italian';
      const config = this.getLanguageConfig(language);

      // 使用当前词本的语言解析 TXT
      const result = WordbookManager.parseTxtWordbook(text, language);
      
      if (!result || !result.words || result.words.length === 0) {
        alert('文件中没有找到有效的单词！');
        return;
      }
      
      // 过滤重复单词（不区分大小写）
      const existingWordsLower = new Set(
        this.currentEditingWordbook.words
          .map(w => (w[config.primaryKey] || w.display || '').toLowerCase())
          .filter(Boolean)
      );
      
      const newWords = [];
      const duplicates = [];
      
      result.words.forEach(word => {
        const primaryValue = (word[config.primaryKey] || word.display || '').toLowerCase();
        if (existingWordsLower.has(primaryValue)) {
          duplicates.push(word[config.primaryKey] || word.display || '');
        } else {
          newWords.push(word);
          existingWordsLower.add(primaryValue);
        }
      });
      
      // 如果没有新单词
      if (newWords.length === 0) {
        alert(`所有单词都已存在于"${this.currentEditingWordbook.name}"中！\n重复单词: ${duplicates.length} 个`);
        return;
      }
      
      // 添加新单词到单词本
      this.currentEditingWordbook.words.push(...newWords);
      this.currentEditingWordbook.wordCount = this.currentEditingWordbook.words.length;
      
      // 保存到 localStorage
      WordbookManager.saveWordbooks();
      
      // 刷新编辑器显示
      this.renderEditorWordList();
      
      // 如果当前正在学习这个单词本，更新显示
      if (AppState.currentWordbook && AppState.currentWordbook.id === this.currentEditingWordbook.id) {
        AppState.currentWordbook = this.currentEditingWordbook;
        AppState.currentWords = WordbookManager.mapWordbookWordsForLanguage(
          this.currentEditingWordbook.words,
          this.currentEditingWordbook.language || 'italian'
        );
        updateHeaderStats();
      }
      
      // 显示导入结果
      let message = `批量导入完成\n\n`;
      message += `成功添加: ${newWords.length} 个新单词\n`;
      
      if (duplicates.length > 0) {
        message += `跳过重复: ${duplicates.length} 个\n`;
      }
      
      if (result.autoMatchedCount > 0) {
        message += `\n自动匹配翻译: ${result.autoMatchedCount} 个\n`;
      }
      
      if (result.needManualCount > 0) {
        message += `未找到翻译: ${result.needManualCount} 个\n`;
      }
      
      message += `\n当前单词本总数: ${this.currentEditingWordbook.wordCount} 个`;
      
      alert(message);
      
    } catch (error) {
      console.error('批量导入失败:', error);
      alert('导入失败: ' + error.message);
    }
  },
  
  // 添加单词到单词本（从浏览模式）
  addWordToWordbook(word) {
    // 如果没有自定义单词本，提示创建
    if (AppState.customWordbooks.length === 0) {
      if (confirm('还没有自定义单词本。是否创建一个新的单词本？')) {
        const newWordbook = this.createNewWordbook();
        if (newWordbook) {
          this.addWordToSpecificWordbook(word, newWordbook.id);
        }
      }
      return;
    }
    
    // 显示单词本选择对话框
    this.showWordbookSelectDialog(word);
  },
  
  // 显示单词本选择对话框
  showWordbookSelectDialog(word) {
    const dialog = document.getElementById('wordbookSelectDialog');
    if (!dialog) return;
    
    // wb.name 来自用户导入/社区上传的文件，必须转义后才能进 innerHTML
    const esc = window.escapeHtml || (s => String(s == null ? '' : s));
    const list = document.getElementById('wordbookSelectList');
    list.innerHTML = AppState.customWordbooks.filter(wb => getWordbookLanguage(wb) === 'italian').map(wb => `
      <div class="wordbook-select-item" onclick="WordbookEditor.addWordToSpecificWordbook(WordbookEditor.currentWordToAdd, ${Number(wb.id)})">
        <span class="wordbook-select-icon"><span class="msr">auto_stories</span></span>
        <div class="wordbook-select-info">
          <div class="wordbook-select-name">${esc(wb.name)}</div>
          <div class="wordbook-select-count">${Number(wb.wordCount) || 0} 词</div>
        </div>
      </div>
    `).join('');
    
    // 保存当前单词
    this.currentWordToAdd = word;
    
    dialog.classList.remove('hidden');
  },
  
  // 隐藏单词本选择对话框
  hideWordbookSelectDialog() {
    const dialog = document.getElementById('wordbookSelectDialog');
    if (dialog) {
      dialog.classList.add('hidden');
    }
    this.currentWordToAdd = null;
  },
  
  // 添加单词到指定单词本
  addWordToSpecificWordbook(word, wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) return;
    const language = wordbook.language || 'italian';
    const config = this.getLanguageConfig(language);
    const primaryValue = language === 'german'
      ? (word.german || word.display || '')
      : language === 'english'
        ? (word.english || '')
        : language === 'french'
          ? (word.french || word.display || '')
          : (word.italian || '');
    
    // 检查是否已存在
    const exists = wordbook.words.some(w => (w[config.primaryKey] || w.display || '') === primaryValue);
    if (exists) {
      alert(`单词"${primaryValue}"已经在单词本"${wordbook.name}"中了！`);
      this.hideWordbookSelectDialog();
      return;
    }
    
    // 添加单词
    const wordData = {
      chinese: word.chinese || '',
      notes: word.notes || ''
    };
    wordData[config.primaryKey] = primaryValue;
    wordData[config.secondaryKey] = language === 'italian'
      ? (word.english || '')
      : (word.meaning || word.chinese || '');
    if (language === 'german' || language === 'french') wordData.display = primaryValue;
    wordbook.words.push(wordData);
    
    wordbook.wordCount = wordbook.words.length;
    WordbookManager.saveWordbooks();
    
    alert(`已添加到单词本"${wordbook.name}"。`);
    this.hideWordbookSelectDialog();
  }
};

// ==================== 扩展现有模块 ====================

// 扩展浏览模式，添加收藏按钮
const BrowseEnhanced = {
  render(searchTerm = '') {
    let words = [...AppState.currentWords];
    
    // 应用过滤器
    if (Browse.currentFilter === 'mastered') {
      words = words.filter(w => AppState.masteredWords.has(w.italian));
    } else if (Browse.currentFilter === 'unmastered') {
      words = words.filter(w => !AppState.masteredWords.has(w.italian));
    }
    
    // 应用搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      words = words.filter(w => 
        w.italian.toLowerCase().includes(term) || 
        w.english.toLowerCase().includes(term)
      );
    }
    
    // 渲染列表
    const container = document.getElementById('wordList');
    
    if (words.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">没有找到单词</p>';
      return;
    }
    
    // 这些字段可能来自用户导入的 CSV/JSON 或社区词本，必须转义。
    // （BrowseEnhanced.render 在下面会覆盖 Browse.render —— app.js 里的原版本
    //  是转义过的，覆盖之后转义就丢了，这正是存储型 XSS 的入口。）
    const esc = window.escapeHtml || (s => String(s == null ? '' : s));
    const escAttr = window.escapeAttribute || esc;

    container.innerHTML = '<div class="word-card">' + words.map((word, index) => {
      const isMastered = AppState.masteredWords.has(word.italian);
      const srStatus = SpacedRepetition.getWordStatus(word);
      const statusLabel = isMastered ? '已掌握' : srStatus.label;
      const dotGood = isMastered || srStatus.status === 'mastered';

      // 判断是否是自定义单词本
      const isCustomWordbook = AppState.selectedSourceType === 'custom';

      return `
        <div class="word-line" data-word-index="${index}" data-italian="${escAttr(word.italian)}">
          <span class="wl-word">${esc(word.italian)}</span>
          <span class="wl-gloss">${esc(word.english)}${word.notes ? `<span class="wl-note">${esc(word.notes)}</span>` : ''}</span>
          <span class="wl-cn">${word.chinese ? esc(word.chinese) : ''}</span>
          <span class="wl-status"><span class="dot${dotGood ? ' good' : ''}"></span>${esc(statusLabel)}</span>
          <span class="wl-actions">
            <button class="wl-speaker speak-btn" title="朗读"><span class="msr">volume_up</span></button>
            ${!isCustomWordbook ? `
              <button class="wl-speaker bookmark-btn" title="收藏到单词本"><span class="msr">bookmark_add</span></button>
            ` : `
              <button class="wl-speaker edit-btn" title="编辑"><span class="msr">edit</span></button>
            `}
          </span>
        </div>
      `;
    }).join('') + '</div>';

    // 绑定事件（使用事件委托）
    container.querySelectorAll('.word-line').forEach((item, index) => {
      const word = words[index];

      // 添加点击朗读功能
      item.style.cursor = 'pointer';
      item.addEventListener('click', (e) => {
        // 如果点击的是操作按钮区，不触发朗读
        if (e.target.closest('.wl-actions')) {
          return;
        }
        const italian = item.dataset.italian;
        if (italian) {
          italianSpeaker.speak(italian);
        }
      });

      // 朗读按钮
      const speakBtn = item.querySelector('.speak-btn');
      if (speakBtn) {
        speakBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const italian = item.dataset.italian;
          if (italian) {
            italianSpeaker.speak(italian);
          }
        });
      }
      
      // 收藏按钮
      const bookmarkBtn = item.querySelector('.bookmark-btn');
      if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          WordbookEditor.addWordToWordbook(word);
        });
      }
      
      // 编辑按钮
      const editBtn = item.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const wordIndex = AppState.currentWords.indexOf(word);
          if (wordIndex !== -1) {
            WordbookEditor.editWord(wordIndex);
          }
        });
      }
    });
  }
};

// 覆盖原始的 Browse.render
Browse.render = BrowseEnhanced.render;

// ==================== Progress 页面统计面板（redesign） ====================
// 填充 #progressWeekBars（最近 7 天练习量柱条，最新一天 .bar.latest 强调）
// 与 #progressAccuracyRows（选择题 / 拼写 / 综合正确率条）。
// lib/navigation.js 在 showScreen('progressScreen') 时调用全局
// updateProgressScreenStats()，此处包装 app.js 的原函数以追加渲染。

function renderProgressPanels() {
  // 最近 7 天练习量
  const bars = document.getElementById('progressWeekBars');
  if (bars && typeof StatsManager !== 'undefined') {
    const stats = StatsManager.getRecentStats(7);
    const max = Math.max(1, ...stats.map(s => s.totalCount || 0));
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    bars.innerHTML = stats.map((s, i) => {
      const count = s.totalCount || 0;
      const pct = Math.round((count / max) * 100);
      const day = dayNames[new Date(`${s.date}T00:00:00`).getDay()];
      const latest = i === stats.length - 1 ? ' latest' : '';
      return `<div class="bar-col"><div class="bar${latest}" style="height:${pct}%" title="${count} 次练习"></div><div class="bar-day">${day}</div></div>`;
    }).join('');
  }

  // 正确率
  const rows = document.getElementById('progressAccuracyRows');
  if (rows && typeof AppState !== 'undefined' && AppState.stats) {
    const st = AppState.stats;
    const pct = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) : 0);
    const mc = pct(st.mcCorrect || 0, st.mcAttempts || 0);
    const sp = pct(st.spCorrect || 0, st.spAttempts || 0);
    const totalAttempts = (st.mcAttempts || 0) + (st.spAttempts || 0);
    const overall = pct((st.mcCorrect || 0) + (st.spCorrect || 0), totalAttempts);
    const row = (label, value) =>
      `<div class="acc-row"><div class="acc-top"><span>${label}</span><b>${value}%</b></div>` +
      `<div class="acc-track"><div class="acc-fill" style="width:${value}%"></div></div></div>`;
    rows.innerHTML = row('选择题', mc) + row('拼写', sp) + row('综合', overall);

    const totalEl = document.getElementById('progressTotalAttempts');
    if (totalEl) totalEl.textContent = totalAttempts.toLocaleString();
  }
}

(function () {
  const originalUpdateProgressScreenStats = window.updateProgressScreenStats;
  window.updateProgressScreenStats = function () {
    if (typeof originalUpdateProgressScreenStats === 'function') {
      originalUpdateProgressScreenStats.apply(this, arguments);
    }
    renderProgressPanels();
  };
})();

// ==================== SM-2 / 每日统计 与练习模式的集成 ====================
//
// ★ 这里就是那个「整套 SRS 从未安装」的 blocker 的修复处。★
//
// 旧代码把这些包装器写在 app.js 里，用
//   if (typeof StatsManager !== 'undefined' && typeof SpacedRepetition !== 'undefined')
// 做保护。可是 StatsManager / SpacedRepetition 是【本文件】的顶层 const，而本
// 文件在 index.html 里排在 app.js 之后 —— app.js 执行时它们还不在全局词法环境
// 里，typeof 恒为 'undefined'，两个包装器一次也没装上去过。
//
// 现在的做法：
//   * 包装器统统在本文件安装（意大利语在解析期，德/英/法在 DOMContentLoaded，
//     因为它们的模块对象由后加载的 german-app.js / french-app.js 创建）；
//   * 包装器内部一律通过 window.* 在【调用时】解析外部符号；
//   * 用“计数器差值”判断对错，而不是复制各语言的比较逻辑 —— 这样即使别的流
//     以后改了判分规则，这里也不会漂移。

const QuizIntegration = {
  installed: {},

  // 各语言用于判分的计数器所在对象
  counterHolder(lang) {
    if (lang === 'italian') return window.AppState ? window.AppState.stats : null;
    const app = this.appFor(lang);
    return app ? app.stats : null;
  },

  appFor(lang) {
    if (lang === 'german') return window.GermanApp;
    if (lang === 'english') return window.EnglishApp;
    if (lang === 'french') return window.FrenchApp;
    return null;
  },

  currentWordFor(lang) {
    if (lang === 'italian') return window.AppState ? window.AppState.currentWord : null;
    const app = this.appFor(lang);
    return app ? app.currentWord : null;
  },

  /**
   * 包装一个作答方法：先记下计数器，调用原方法，再用差值判断对错。
   * mode: 'mc' | 'sp'（决定看 mcCorrect/mcAttempts 还是 spCorrect/spAttempts）
   */
  wrap(target, methodName, lang, mode) {
    if (!target || typeof target[methodName] !== 'function') return false;
    const flag = `__dimSrsWrapped_${methodName}`;
    if (target[flag]) return true;

    const original = target[methodName];
    const self = this;
    const correctField = mode === 'mc' ? 'mcCorrect' : 'spCorrect';
    const attemptField = mode === 'mc' ? 'mcAttempts' : 'spAttempts';

    target[methodName] = function () {
      const startedAt = this.questionStartTime || self._questionStartedAt || null;
      const word = self.currentWordFor(lang);
      const counters = self.counterHolder(lang) || {};
      const beforeCorrect = counters[correctField] || 0;
      const beforeAttempts = counters[attemptField] || 0;

      const result = original.apply(this, arguments);

      try {
        const after = self.counterHolder(lang) || {};
        const attempts = (after[attemptField] || 0) - beforeAttempts;
        if (attempts > 0) {
          const isCorrect = ((after[correctField] || 0) - beforeCorrect) > 0;
          const timeSpent = startedAt ? Date.now() - startedAt : null;

          if (window.StatsManager) {
            window.StatsManager.recordActivity(lang, {
              correct: isCorrect ? 1 : 0,
              total: 1,
              durationMs: 0,
              words: word ? [word] : []
            });
          }
          if (window.SpacedRepetition && word) {
            const quality = window.SpacedRepetition.convertCorrectToQuality(isCorrect, timeSpent);
            window.SpacedRepetition.review(lang, word, quality);
          }
          if (window.ReviewSession) window.ReviewSession.onAnswered(lang);
        }
      } catch (e) {
        // 埋点绝不能影响练习本身
        console.error('SRS 记录失败:', e);
      }

      self._questionStartedAt = Date.now();
      return result;
    };
    target[flag] = true;
    return true;
  },

  installItalian() {
    if (this.installed.italian) return false;
    const mc = window.MultipleChoice || (typeof MultipleChoice !== 'undefined' ? MultipleChoice : null);
    const sp = window.Spelling || (typeof Spelling !== 'undefined' ? Spelling : null);
    const okMc = this.wrap(mc, 'checkAnswer', 'italian', 'mc');
    const okSp = this.wrap(sp, 'checkAnswer', 'italian', 'sp');
    this.installed.italian = okMc && okSp;
    return this.installed.italian;
  },

  // 德/英/法的模块对象由后加载的脚本创建，必须等到 DOMContentLoaded 再包装
  METHODS: {
    german: [['checkMultipleChoiceAnswer', 'mc'], ['checkSpellingAnswer', 'sp']],
    english: [['_checkMcAnswer', 'mc'], ['checkSpelling', 'sp']],
    french: [['checkMultipleChoice', 'mc'], ['checkSpelling', 'sp']]
  },

  installLanguage(lang) {
    if (this.installed[lang]) return false;
    const app = this.appFor(lang);
    if (!app) return false;
    let ok = true;
    (this.METHODS[lang] || []).forEach(([method, mode]) => {
      ok = this.wrap(app, method, lang, mode) && ok;
    });
    this.installed[lang] = ok;
    return ok;
  },

  installAll() {
    this.installItalian();
    ['german', 'english', 'french'].forEach(lang => this.installLanguage(lang));
    return Object.assign({}, this.installed);
  }
};

window.QuizIntegration = QuizIntegration;

// 意大利语的 MultipleChoice / Spelling 在 app.js 里已经建好，这里立刻就能包
QuizIntegration.installItalian();

// ==================== 今日待复习（SRS 的用户入口） ====================
//
// getDueWords 以前没有任何调用点，SRS 对用户完全不可见。这里在每种语言的首页
// 加一张“今日待复习 N”卡片，点进去就用【现有的选择题模式】只练到期的词。

const ReviewSession = {
  LANGS: ['italian', 'german', 'english', 'french'],

  HOME_SCREEN: {
    italian: 'welcomeScreen',
    german: 'germanWelcomeScreen',
    english: 'englishWelcomeScreen',
    french: 'frenchWelcomeScreen'
  },

  PRACTICE_SCREENS: {
    italian: ['multipleChoiceScreen', 'spellingScreen'],
    german: ['germanMultipleChoiceScreen', 'germanSpellingScreen'],
    english: ['englishMultipleChoiceScreen', 'englishSpellingScreen'],
    french: ['frenchMultipleChoiceScreen', 'frenchSpellingScreen']
  },

  _active: null,

  wordsFor(lang) {
    if (lang === 'italian') {
      return (window.AppState && Array.isArray(window.AppState.currentWords))
        ? window.AppState.currentWords
        : [];
    }
    const app = QuizIntegration.appFor(lang);
    return (app && Array.isArray(app.words)) ? app.words : [];
  },

  dueWords(lang) {
    if (!window.SpacedRepetition) return [];
    return window.SpacedRepetition.getDueWords(lang, this.wordsFor(lang));
  },

  dueCount(lang) {
    return this.dueWords(lang).length;
  },

  // ---------- 首页卡片 ----------

  cardId(lang) { return `reviewDueCard_${lang}`; },

  injectCards() {
    this.LANGS.forEach(lang => {
      if (document.getElementById(this.cardId(lang))) return;
      const screen = document.getElementById(this.HOME_SCREEN[lang]);
      if (!screen) return;
      const grid = screen.querySelector('.card-grid');
      if (!grid) return;
      grid.insertAdjacentHTML('beforeend', `
        <button class="card" id="${this.cardId(lang)}" data-review-lang="${lang}">
          <span class="card-chip"><span class="msr">event_repeat</span></span>
          <span class="card-title">今日待复习</span>
          <span class="card-desc" id="${this.cardId(lang)}_desc">暂无到期单词</span>
        </button>
      `);
    });

    // 事件委托：卡片是运行时注入的，直接在 document 上代理最省事
    if (!this._delegated) {
      this._delegated = true;
      document.addEventListener('click', (event) => {
        const card = event.target && event.target.closest
          ? event.target.closest('[data-review-lang]')
          : null;
        if (!card) return;
        this.start(card.dataset.reviewLang);
      });
    }
  },

  refreshCards() {
    this.LANGS.forEach(lang => {
      const desc = document.getElementById(`${this.cardId(lang)}_desc`);
      if (!desc) return;
      const count = this.dueCount(lang);
      desc.textContent = count > 0
        ? `${count} 个单词今天到期，点此开始复习`
        : '暂无到期单词，继续学习新词吧';
      const card = document.getElementById(this.cardId(lang));
      if (card) card.setAttribute('data-due-count', String(count));
    });
  },

  onAnswered(lang) {
    // 复习会话中答完一题就刷新计数（下次进首页看到的是最新数字）
    if (this._active && this._active.lang === lang) this._pending = true;
  },

  // ---------- 复习会话 ----------

  start(lang) {
    const due = this.dueWords(lang);
    if (due.length === 0) {
      alert('今天没有到期需要复习的单词。\n\n先去练习新词，答对之后系统会按 SM-2 间隔安排复习。');
      return;
    }

    this.end(); // 若上一次会话没清干净，先还原

    if (lang === 'italian') {
      const state = window.AppState;
      const previous = state.currentWords;
      this._active = {
        lang,
        restore() { state.currentWords = previous; }
      };
      state.currentWords = due.slice();
      window.MultipleChoice.start();
    } else {
      const app = QuizIntegration.appFor(lang);
      if (!app || typeof app.startMultipleChoice !== 'function') return;
      const previous = app.words;
      this._active = {
        lang,
        restore() { app.words = previous; }
      };
      app.words = due.slice();
      app.startMultipleChoice();
    }
  },

  end() {
    if (!this._active) return;
    try {
      this._active.restore();
    } catch (e) {
      console.error('复习会话还原失败:', e);
    }
    this._active = null;
    this._pending = false;
  },

  // 屏幕切换钩子（由 app.js 的 updateHeaderNavigation 调用 —— 那是唯一一个
  // goBack / showScreen 都会经过的点）：离开本语言的练习屏幕就结束复习会话、
  // 还原词表；回到任一首页时刷新“今日待复习”的计数。
  onScreenChange(screenId) {
    if (this._active) {
      const screens = this.PRACTICE_SCREENS[this._active.lang] || [];
      if (screens.indexOf(screenId) === -1) this.end();
    }
    const isHome = this.LANGS.some(lang => this.HOME_SCREEN[lang] === screenId);
    if (isHome || this._pending) {
      this._pending = false;
      this.injectCards();
      this.refreshCards();
    }
  }
};

window.ReviewSession = ReviewSession;

// ==================== 跨语言总览首页 ====================
//
// 四种语言各自有独立的首页，此前没有任何“全局”视角。这里注入一块
// globalHomeScreen，用现有的设计 token / 组件类渲染四张语言卡片
// （真实词数 + 已掌握 + 今日待复习）。侧栏 / 品牌按钮由 s5 流负责接线，
// 这边只暴露 window.GlobalHome.show()。

const GlobalHome = {
  LANGS: [
    { id: 'italian', name: 'Italiano', label: '意大利语', icon: 'translate' },
    { id: 'german', name: 'Deutsch', label: '德语', icon: 'translate' },
    { id: 'english', name: 'English', label: '英语', icon: 'translate' },
    { id: 'french', name: 'Français', label: '法语', icon: 'translate' }
  ],

  install() {
    if (document.getElementById('globalHomeScreen')) return;
    const anchor = document.getElementById('welcomeScreen');
    if (!anchor) return;
    anchor.insertAdjacentHTML('beforebegin', `
      <section id="globalHomeScreen" class="screen">
        <div class="container">
          <div class="eyebrow">Overview</div>
          <h1 class="page">全部语言</h1>
          <p class="desc">四种语言的词汇量、掌握进度与今日待复习，集中在一个页面。点击卡片进入对应语言。</p>

          <div class="chips wrap" id="globalHomeChips"></div>
          <div class="big-stats" id="globalHomeTotals"></div>

          <div class="sub-label">语言</div>
          <div class="card-grid cols-2" id="globalHomeLangCards"></div>

          <div class="panel" style="margin-top:16px">
            <div class="panel-title">最近 7 天练习量（全部语言）</div>
            <div class="bar-chart" id="globalHomeWeekBars"></div>
          </div>
        </div>
      </section>
    `);

    document.getElementById('globalHomeLangCards')?.addEventListener('click', (event) => {
      const card = event.target.closest('[data-global-lang]');
      if (!card) return;
      window.LanguagePortal?.selectLanguage(card.dataset.globalLang);
    });
  },

  // 每种语言的词数 / 已掌握数（HeaderStats.compute 已经算好了这套逻辑）
  statsFor(lang) {
    const base = (window.HeaderStats && window.HeaderStats.compute(lang)) || { total: 0, mastered: 0 };
    const due = window.ReviewSession ? window.ReviewSession.dueCount(lang) : 0;
    return { total: base.total || 0, mastered: base.mastered || 0, due };
  },

  render() {
    const esc = window.escapeHtml || (s => String(s == null ? '' : s));

    const perLang = this.LANGS.map(meta => Object.assign({}, meta, this.statsFor(meta.id)));
    const totals = perLang.reduce((acc, l) => {
      acc.total += l.total;
      acc.mastered += l.mastered;
      acc.due += l.due;
      return acc;
    }, { total: 0, mastered: 0, due: 0 });

    // .big-stats 是三列网格，第四个数字会单独掉到下一行，所以连续天数放在 chip 里。
    const chipsEl = document.getElementById('globalHomeChips');
    if (chipsEl) {
      const streak = window.StatsManager ? window.StatsManager.getStreak('all') : 0;
      chipsEl.innerHTML =
        `<span class="chip">连续学习 ${streak} 天</span>` +
        `<span class="chip">${this.LANGS.length} 种语言</span>`;
    }

    const totalsEl = document.getElementById('globalHomeTotals');
    if (totalsEl) {
      totalsEl.innerHTML =
        `<div class="big-stat"><div class="bs-label">总词汇</div><div class="bs-value">${totals.total.toLocaleString()}</div></div>` +
        `<div class="big-stat accent"><div class="bs-label">已掌握</div><div class="bs-value">${totals.mastered.toLocaleString()}</div></div>` +
        `<div class="big-stat"><div class="bs-label">今日待复习</div><div class="bs-value">${totals.due.toLocaleString()}</div></div>`;
    }

    const cards = document.getElementById('globalHomeLangCards');
    if (cards) {
      cards.innerHTML = perLang.map(l => {
        const pct = l.total > 0 ? Math.round((l.mastered / l.total) * 100) : 0;
        return `
          <button class="card" data-global-lang="${esc(l.id)}">
            <span class="card-chip"><span class="msr">${esc(l.icon)}</span></span>
            <span class="card-title">${esc(l.name)} · ${esc(l.label)}</span>
            <span class="card-desc">${l.total.toLocaleString()} 词 · 已掌握 ${l.mastered.toLocaleString()} · 今日待复习 ${l.due.toLocaleString()}</span>
            <span class="progress-track"><span class="progress-fill" style="display:block;width:${pct}%"></span></span>
            <span class="lc-pct">${pct}%</span>
          </button>
        `;
      }).join('');
    }

    const bars = document.getElementById('globalHomeWeekBars');
    if (bars && window.StatsManager) {
      const stats = window.StatsManager.getRecentStats(7, 'all');
      const max = Math.max(1, ...stats.map(s => s.totalCount || 0));
      const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
      bars.innerHTML = stats.map((s, i) => {
        const count = s.totalCount || 0;
        const pct = Math.round((count / max) * 100);
        const day = dayNames[new Date(`${s.date}T00:00:00`).getDay()];
        const latest = i === stats.length - 1 ? ' latest' : '';
        return `<div class="bar-col"><div class="bar${latest}" style="height:${pct}%" title="${count} 次练习"></div><div class="bar-day">${day}</div></div>`;
      }).join('');
    }
  },

  show() {
    this.install();
    this.render();
    if (typeof window.showScreen === 'function') window.showScreen('globalHomeScreen');
  }
};

window.GlobalHome = GlobalHome;

// ==================== 运行期自检（回归哨兵） ====================
//
// 这个 blocker 之所以能潜伏这么久，就是因为“没装上”是完全静默的。
// DimSelfCheck() 会把关键契约的实际状态写到 <html data-dim-selfcheck="...">，
// headless dump 里 grep 一下就知道 SRS 到底装没装。

function DimSelfCheck() {
  const checks = {
    dimStorage: !!(window.DimStorage && typeof window.DimStorage.exportAll === 'function'),
    headerStats: !!(window.HeaderStats && typeof window.HeaderStats.set === 'function'),
    statsManager: !!(window.StatsManager && typeof window.StatsManager.recordActivity === 'function'),
    spacedRepetition: !!(window.SpacedRepetition && typeof window.SpacedRepetition.getDueWords === 'function'),
    srsCapped: !!(window.SpacedRepetition && window.SpacedRepetition.MAX_INTERVAL > 0),
    globalHome: !!(window.GlobalHome && typeof window.GlobalHome.show === 'function'),
    reviewSession: !!(window.ReviewSession && typeof window.ReviewSession.start === 'function'),
    srsItalian: !!QuizIntegration.installed.italian,
    srsGerman: !!QuizIntegration.installed.german,
    srsEnglish: !!QuizIntegration.installed.english,
    srsFrench: !!QuizIntegration.installed.french
  };

  const failed = Object.keys(checks).filter(name => !checks[name]);
  const summary = failed.length === 0 ? 'ok' : `FAIL:${failed.join(',')}`;
  document.documentElement.setAttribute('data-dim-selfcheck', summary);
  if (failed.length) console.error('[Dimenticato] 自检未通过:', failed.join(', '));
  return { ok: failed.length === 0, checks, failed };
}

window.DimSelfCheck = DimSelfCheck;

// ==================== 启动 ====================

document.addEventListener('DOMContentLoaded', () => {
  // 德/英/法的模块对象此时已经存在，补装它们的 SM-2 包装器
  QuizIntegration.installAll();

  // 复习会话的屏幕切换钩子挂在 app.js 的 updateHeaderNavigation 里（见那边的
  // 注释：包装 window.showScreen 拦不住 lib/navigation.js 的 goBack）。

  // 首页“今日待复习”卡片（法语首页由 french-app.js 注入，稍后再补一次）
  ReviewSession.injectCards();
  ReviewSession.refreshCards();
  setTimeout(() => {
    ReviewSession.injectCards();
    ReviewSession.refreshCards();
  }, 0);

  DimSelfCheck();
});
