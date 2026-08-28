/**
 * Dimenticato - 意大利语背单词应用
 * 主应用逻辑
 */

// ==================== Web Speech API 发音功能 ====================

class LanguageSpeaker {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.currentLang = 'it-IT';
    this.voiceMatcher = /^it/i;
    this.initVoice();
  }
  
  initVoice() {
    // 获取可用的语音
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.voice = voices.find(v => this.voiceMatcher.test(v.lang)) || voices[0];
    };
    
    // 有些浏览器需要异步加载语音列表
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  setLanguage(lang, matcher) {
    this.currentLang = lang;
    this.voiceMatcher = matcher || /^it/i;
    this.initVoice();
  }
  
  speak(text, autoplay = false) {
    if (!text) return;
    
    // 取消之前的朗读
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.currentLang;
    utterance.rate = 0.9; // 稍慢一点，便于学习
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    this.synth.speak(utterance);
  }
  
  stop() {
    this.synth.cancel();
  }
}

// 创建全局 speaker 实例
const italianSpeaker = new LanguageSpeaker();

// ==================== 全局状态 ====================

const AppState = {
  vocabulary: [],           // 完整词汇表
  currentWords: [],         // 当前难度级别的词汇
  selectedLevel: 1000,      // 选择的难度级别
  masteredWords: new Set(), // 已掌握的单词
  currentMode: null,        // 当前学习模式
  
  // 自定义单词本
  customWordbooks: [],      // 已导入的单词本列表
  currentWordbook: null,    // 当前正在学习的单词本
  
  // 选择状态
  selectedSource: null,     // 'system', 'cognate' 或 wordbook id
  selectedSourceType: null, // 'system', 'cognate' 或 'custom'
  practiceContext: 'vocab', // 'vocab' | 'conjugation'
  activeModule: 'home',
  currentScreen: 'welcomeScreen',
  previousScreen: 'welcomeScreen',
  selectedGrammarTopic: 'conjugation',
  navigationStack: ['welcomeScreen'],
  
  // 测验状态
  quizIndex: 0,
  quizCorrect: 0,
  quizTotal: 0,
  currentWord: null,
  
  // 统计数据
  stats: {
    mcAttempts: 0,
    mcCorrect: 0,
    spAttempts: 0,
    spCorrect: 0,
    totalLearned: 0
  }
};

function getWordbookLanguage(wordbook) {
  return wordbook?.language || 'italian';
}

function getWordbookProgressKey(id, language = 'italian') {
  const normalizedLanguage = language || 'italian';
  return `dimenticato_progress_wb_${normalizedLanguage}_${id}`;
}

// ==================== 跨语言存储核心 (DimStorage) ====================
//
// 全站唯一的 localStorage 出入口。三条不可违反的规则：
//   1. 永远不调用 localStorage.clear()（会连主题、自定义词本一起抹掉）
//   2. 导出必须覆盖全部四种语言 + 自定义词本 + 每个词本的进度 + 主题
//   3. 覆盖导入只写它真正要恢复的 key，绝不裸删它不打算恢复的 key
//
// 语言前缀：意大利语沿用无前缀的历史 key（dimenticato_mastered），其余语言
// 统一为 dimenticato_<lang>_*。合并/重置用到的纯函数都挂在对象上，便于用
// node 单独测试（见 DimStorage.mergeValueForKey / keysForScope）。

const DimStorage = {
  PREFIX: 'dimenticato_',
  EXPORT_VERSION: '2.0',
  LANGS: ['italian', 'german', 'english', 'french'],

  LANGUAGE_LABELS: {
    italian: '意大利语',
    german: '德语',
    english: '英语',
    french: '法语'
  },

  // 偏好设置 / 用户内容 —— 任何“重置进度”都必须保留
  PRESERVED_KEYS: [
    'dimenticato_theme',
    'dimenticato_language',
    'dimenticato_quiz_difficulty',
    'dimenticato_custom_wordbooks'
  ],

  // 每种语言“属于学习进度”的固定 key（动态的 progress_wb_* 另行枚举）
  // dimenticato_mastery_streak_* 是“连续答对”计数，重置进度时必须一起清掉，
  // 否则重置后残留的 streak 会让下一次答对立刻把词标成已掌握。
  PROGRESS_KEYS: {
    italian: [
      'dimenticato_mastered',
      'dimenticato_stats',
      'dimenticato_daily_stats',
      'dimenticato_conjugation_lessons',
      'dimenticato_cognate_progress',
      'dimenticato_srs_italian',
      'dimenticato_mastery_streak_italian'
    ],
    german: [
      'dimenticato_german_mastered',
      'dimenticato_german_stats',
      'dimenticato_german_course_level',
      'dimenticato_conjugation_lessons_de',
      'dimenticato_daily_stats_german',
      'dimenticato_srs_german',
      'dimenticato_mastery_streak_german'
    ],
    english: [
      'dimenticato_english_mastered',
      'dimenticato_english_stats',
      'dimenticato_conjugation_lessons_en',
      'dimenticato_daily_stats_english',
      'dimenticato_srs_english',
      'dimenticato_mastery_streak_english'
    ],
    french: [
      'dimenticato_french_mastered',
      'dimenticato_french_stats',
      'dimenticato_conjugation_lessons_fr',
      'dimenticato_daily_stats_french',
      'dimenticato_srs_french',
      'dimenticato_mastery_streak_french'
    ]
  },

  prefixFor(lang) {
    if (!lang || lang === 'italian') return '';
    return `dimenticato_${lang}_`;
  },

  // ---------- 低层读写 ----------

  allKeys() {
    try {
      return Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX));
    } catch (e) {
      console.error('读取 localStorage 键列表失败:', e);
      return [];
    }
  },

  safeParse(raw, fallback) {
    if (raw === null || raw === undefined) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (e) {
      console.error('解析本地数据失败:', e);
      return fallback;
    }
  },

  _quotaNotified: false,

  // 写入失败（多为 QuotaExceededError）时先裁剪最旧的每日统计再重试一次，
  // 仍失败则本次会话提示一次，绝不静默丢弃用户进度。
  safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('保存失败:', key, e);
      if (this._pruneDailyStats()) {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (e2) {
          console.error('裁剪后仍然保存失败:', key, e2);
        }
      }
      if (!this._quotaNotified) {
        this._quotaNotified = true;
        try {
          alert('存储空间已满，本次学习进度未能保存。\n\n请在 Settings & Data 中导出备份，并删除一些不再使用的自定义词本。');
        } catch (e3) {
          /* 无 UI 环境（测试）时忽略 */
        }
      }
      return false;
    }
  },

  // 丢掉 30 天以前的每日统计，为进度数据腾出空间
  _pruneDailyStats() {
    let pruned = false;
    const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().split('T')[0];
    this.allKeys()
      .filter(key => key.indexOf('dimenticato_daily_stats') === 0)
      .forEach(key => {
        const stats = this.safeParse(localStorage.getItem(key), null);
        if (!stats || typeof stats !== 'object') return;
        const kept = {};
        Object.keys(stats).forEach(date => {
          if (date >= cutoff) kept[date] = stats[date];
        });
        if (Object.keys(kept).length < Object.keys(stats).length) {
          try {
            localStorage.setItem(key, JSON.stringify(kept));
            pruned = true;
          } catch (e) {
            /* 裁剪本身失败就放弃 */
          }
        }
      });
    return pruned;
  },

  // ---------- 迁移 ----------

  // 语言重构之前，词本进度写在 dimenticato_progress_wb_<id>（无语言段）。
  // 把这些遗留 key 复制到带语言的新 key，老用户不丢数据。
  migrateLegacyWordbookProgress() {
    let migrated = 0;
    const wordbooks = this.safeParse(localStorage.getItem('dimenticato_custom_wordbooks'), []) || [];
    const languageById = {};
    if (Array.isArray(wordbooks)) {
      wordbooks.forEach(wb => {
        if (wb && wb.id !== undefined) languageById[String(wb.id)] = wb.language || 'italian';
      });
    }
    this.allKeys().forEach(key => {
      const match = /^dimenticato_progress_wb_([^_]+)$/.exec(key);
      if (!match) return;
      const id = match[1];
      const target = getWordbookProgressKey(id, languageById[id] || 'italian');
      if (target === key) return;
      if (localStorage.getItem(target) === null) {
        this.safeSetItem(target, localStorage.getItem(key));
        migrated++;
      }
    });
    return migrated;
  },

  // ---------- 快照 / 导出 ----------

  snapshot() {
    const keys = {};
    this.allKeys().forEach(key => {
      const value = localStorage.getItem(key);
      if (typeof value === 'string') keys[key] = value;
    });
    return keys;
  },

  // 全语言、带版本号的导出载荷。`keys` 是权威数据；`data` 是 1.0 兼容层，
  // 让旧版本的 Dimenticato 仍然能读出意大利语部分。
  exportAll() {
    const keys = this.snapshot();
    const wordbooks = this.safeParse(keys['dimenticato_custom_wordbooks'], []) || [];
    const wordbookProgress = {};
    if (Array.isArray(wordbooks)) {
      wordbooks.forEach(wb => {
        if (!wb || wb.id === undefined) return;
        const value = keys[getWordbookProgressKey(wb.id, getWordbookLanguage(wb))];
        if (value) wordbookProgress[wb.id] = value;
      });
    }

    return {
      version: this.EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      exportedFrom: 'Dimenticato',
      languages: this.LANGS.slice(),
      keys,
      // ---- 1.0 兼容层 ----
      data: {
        masteredWords: keys['dimenticato_mastered'] || '[]',
        stats: keys['dimenticato_stats'] || '{}',
        level: keys['dimenticato_level'] || '1000',
        theme: keys['dimenticato_theme'] || 'light',
        customWordbooks: keys['dimenticato_custom_wordbooks'] || '[]',
        dailyStats: keys['dimenticato_daily_stats'] || '{}',
        wordbookProgress
      }
    };
  },

  // 导出摘要（给导入前的确认框用）
  describePayload(payload) {
    const keys = this.normalizePayload(payload);
    const counts = { languages: [], wordbooks: 0, keys: Object.keys(keys).length };
    this.LANGS.forEach(lang => {
      const masteredKey = lang === 'italian'
        ? 'dimenticato_mastered'
        : `dimenticato_${lang}_mastered`;
      const mastered = this.safeParse(keys[masteredKey], []) || [];
      if (Array.isArray(mastered) && mastered.length) {
        counts.languages.push(`${this.LANGUAGE_LABELS[lang]} ${mastered.length} 词`);
      }
    });
    const wordbooks = this.safeParse(keys['dimenticato_custom_wordbooks'], []) || [];
    counts.wordbooks = Array.isArray(wordbooks) ? wordbooks.length : 0;
    return counts;
  },

  // ---------- 导入 ----------

  // 把 1.0 / 2.0 两种载荷统一成 { key: rawString } 的纯对象（纯函数，可单测）
  normalizePayload(payload) {
    const keys = {};
    if (!payload || typeof payload !== 'object') return keys;

    if (payload.keys && typeof payload.keys === 'object') {
      Object.keys(payload.keys).forEach(key => {
        const value = payload.keys[key];
        if (key.indexOf(this.PREFIX) === 0 && typeof value === 'string') keys[key] = value;
      });
      return keys;
    }

    const data = payload.data;
    if (!data || typeof data !== 'object') return keys;

    const legacyMap = {
      masteredWords: 'dimenticato_mastered',
      stats: 'dimenticato_stats',
      level: 'dimenticato_level',
      theme: 'dimenticato_theme',
      customWordbooks: 'dimenticato_custom_wordbooks',
      dailyStats: 'dimenticato_daily_stats'
    };
    Object.keys(legacyMap).forEach(field => {
      if (typeof data[field] === 'string') keys[legacyMap[field]] = data[field];
    });

    // 1.0 的 wordbookProgress 用的是无语言段的旧 key，这里补回语言
    if (data.wordbookProgress && typeof data.wordbookProgress === 'object') {
      const wordbooks = this.safeParse(data.customWordbooks, []) || [];
      const languageById = {};
      if (Array.isArray(wordbooks)) {
        wordbooks.forEach(wb => {
          if (wb && wb.id !== undefined) languageById[String(wb.id)] = wb.language || 'italian';
        });
      }
      Object.keys(data.wordbookProgress).forEach(id => {
        const value = data.wordbookProgress[id];
        if (typeof value !== 'string') return;
        keys[getWordbookProgressKey(id, languageById[String(id)] || 'italian')] = value;
      });
    }

    return keys;
  },

  // ---- 合并用纯函数（全部输入输出都是字符串，方便单测） ----

  mergeArrayUnion(existing, incoming) {
    const a = this.safeParse(existing, []) || [];
    const b = this.safeParse(incoming, []) || [];
    if (!Array.isArray(a) || !Array.isArray(b)) return incoming;
    return JSON.stringify([...new Set([...a, ...b])]);
  },

  mergeCounters(existing, incoming) {
    const a = this.safeParse(existing, {}) || {};
    const b = this.safeParse(incoming, {}) || {};
    const merged = Object.assign({}, a);
    Object.keys(b).forEach(field => {
      const av = a[field];
      const bv = b[field];
      if (typeof av === 'number' && typeof bv === 'number') {
        merged[field] = field === 'totalLearned' ? Math.max(av, bv) : av + bv;
      } else if (av === undefined) {
        merged[field] = bv;
      }
    });
    return JSON.stringify(merged);
  },

  mergeDailyStats(existing, incoming) {
    const a = this.safeParse(existing, {}) || {};
    const b = this.safeParse(incoming, {}) || {};
    const merged = Object.assign({}, a);
    Object.keys(b).forEach(date => {
      if (!merged[date]) merged[date] = b[date];
    });
    return JSON.stringify(merged);
  },

  mergeWordbooks(existing, incoming) {
    const a = this.safeParse(existing, []) || [];
    const b = this.safeParse(incoming, []) || [];
    if (!Array.isArray(a) || !Array.isArray(b)) return incoming;
    const seen = new Set(a.map(wb => wb && wb.id));
    const merged = a.slice();
    b.forEach(wb => {
      if (wb && !seen.has(wb.id)) {
        seen.add(wb.id);
        merged.push(wb);
      }
    });
    return JSON.stringify(merged);
  },

  mergeSrsStore(existing, incoming) {
    const a = this.safeParse(existing, {}) || {};
    const b = this.safeParse(incoming, {}) || {};
    const merged = Object.assign({}, a);
    Object.keys(b).forEach(word => {
      const mine = merged[word];
      const theirs = b[word];
      if (!mine) {
        merged[word] = theirs;
        return;
      }
      // 保留最近复习过的一份
      if ((theirs && theirs.lastReviewDate || '') > (mine && mine.lastReviewDate || '')) {
        merged[word] = theirs;
      }
    });
    return JSON.stringify(merged);
  },

  // 按 key 的形状选择合并策略（纯函数）
  mergeValueForKey(key, existing, incoming) {
    if (existing === null || existing === undefined) return incoming;
    if (/_mastered$/.test(key) || key.indexOf('dimenticato_progress_wb_') === 0) {
      return this.mergeArrayUnion(existing, incoming);
    }
    if (/_stats$/.test(key) && key.indexOf('daily') === -1) {
      return this.mergeCounters(existing, incoming);
    }
    if (key.indexOf('dimenticato_daily_stats') === 0) {
      return this.mergeDailyStats(existing, incoming);
    }
    if (key === 'dimenticato_custom_wordbooks') {
      return this.mergeWordbooks(existing, incoming);
    }
    if (key.indexOf('dimenticato_srs_') === 0) {
      return this.mergeSrsStore(existing, incoming);
    }
    // 其它 key（主题、语言、级别、变位课程…）保留现有值
    return existing;
  },

  /**
   * 导入。
   * mode 'overwrite'：逐 key 覆盖写入 —— 只写载荷里真正存在的 key，
   *                   绝不裸删（也就不会像旧实现那样连带清空另外三种语言）。
   * mode 'merge'    ：按 key 形状合并（已掌握取并集、计数相加、每日统计按日期补齐）。
   */
  importAll(payload, options = {}) {
    const mode = options.mode === 'overwrite' ? 'overwrite' : 'merge';
    const keys = this.normalizePayload(payload);
    const names = Object.keys(keys);
    if (names.length === 0) {
      throw new Error('数据文件中没有可导入的内容');
    }

    let written = 0;
    names.forEach(key => {
      const incoming = keys[key];
      const value = mode === 'overwrite'
        ? incoming
        : this.mergeValueForKey(key, localStorage.getItem(key), incoming);
      if (value === null || value === undefined) return;
      if (this.safeSetItem(key, value)) written++;
    });

    return { mode, keys: names.length, written };
  },

  // ---------- 重置 ----------

  // scope: 'all' | 'italian' | 'german' | 'english' | 'french'（纯函数，可单测）
  keysForScope(scope, allKeys) {
    const langs = scope === 'all' ? this.LANGS : [scope];
    const targets = new Set();
    langs.forEach(lang => {
      (this.PROGRESS_KEYS[lang] || []).forEach(key => targets.add(key));
      const wbPrefix = `dimenticato_progress_wb_${lang}_`;
      allKeys.forEach(key => {
        if (key.indexOf(wbPrefix) === 0) targets.add(key);
        // 未迁移的遗留词本进度 key 归意大利语
        if (lang === 'italian' && /^dimenticato_progress_wb_[^_]+$/.test(key)) targets.add(key);
      });
    });
    // 偏好设置与自定义词本内容永不删除
    this.PRESERVED_KEYS.forEach(key => targets.delete(key));
    return [...targets];
  },

  reset(options = {}) {
    const scope = options.scope && (options.scope === 'all' || this.LANGS.includes(options.scope))
      ? options.scope
      : 'all';
    const removed = [];
    this.keysForScope(scope, this.allKeys()).forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        removed.push(key);
      }
    });
    return { scope, removed };
  }
};

window.DimStorage = DimStorage;

// ==================== 顶栏统计胶囊（语言感知） ====================
//
// #totalWords / #masteredWords / #progressPercent 是全站共用的一组元素，
// 以前只有意大利语和法语写它，所以在德语/英语站点上显示的是别的语言的数字。
// 现在所有语言都通过 HeaderStats.set(lang, {total, mastered}) 写入，并且
// 只有“当前 body[data-language]”对应的数字才会被画到顶栏上。

const HeaderStats = {
  _cache: {},

  set(lang, stats) {
    const language = lang || getActiveLanguage();
    if (stats && typeof stats === 'object') {
      this._cache[language] = {
        total: Number(stats.total) || 0,
        mastered: Number(stats.mastered) || 0
      };
    }
    if (language !== getActiveLanguage()) return;
    this._paint(this._cache[language]);
  },

  refresh(lang) {
    const language = lang || getActiveLanguage();
    const stats = this.compute(language) || this._cache[language];
    if (stats) this._cache[language] = stats;
    this._paint(this._cache[language]);
  },

  // 当某个语言模块还没有主动上报时，直接从它自己的运行时状态推算
  compute(lang) {
    try {
      if (lang === 'italian') {
        return {
          total: AppState.currentWords.length,
          mastered: countMasteredInCurrentWords()
        };
      }
      const app = lang === 'german'
        ? window.GermanApp
        : lang === 'english'
          ? window.EnglishApp
          : lang === 'french'
            ? window.FrenchApp
            : null;
      if (!app || !Array.isArray(app.words)) return null;
      const key = lang === 'german' ? 'german' : lang === 'english' ? 'english' : 'french';
      const wordKeys = new Set(app.words.map(w => w[key] || w.display || ''));
      const mastered = app.mastered instanceof Set ? app.mastered : new Set();
      let count = 0;
      mastered.forEach(word => { if (wordKeys.has(word)) count++; });
      return { total: app.words.length, mastered: count };
    } catch (e) {
      return null;
    }
  },

  _paint(stats) {
    const totalEl = document.getElementById('totalWords');
    const masteredEl = document.getElementById('masteredWords');
    const percentEl = document.getElementById('progressPercent');
    if (!totalEl || !masteredEl || !percentEl) return;
    const total = stats ? stats.total : 0;
    const mastered = stats ? stats.mastered : 0;
    const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;
    totalEl.textContent = total.toLocaleString();
    masteredEl.textContent = mastered.toLocaleString();
    percentEl.textContent = progress + '%';
  }
};

window.HeaderStats = HeaderStats;

// 为不同语言生成 screen 元数据的工厂函数
function makeLanguageScreens(lang) {
  const capLang = lang.charAt(0).toUpperCase() + lang.slice(1);
  const prefix = lang === 'italian' ? '' : lang;
  const breadcrumbHome = lang === 'italian' ? [] : [capLang];

  // For Italian (no prefix), use lowercase screen names
  // For German/English/French, prefix + capitalized screen name
  const makeKey = (name) => prefix ? prefix + name : name.charAt(0).toLowerCase() + name.slice(1);

  return {
    [makeKey('VocabularyScreen')]: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: [...breadcrumbHome, 'Vocabulary', '内容来源']
    },
    [makeKey('VocabularyModesScreen')]: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: [...breadcrumbHome, 'Vocabulary', '练习方式']
    },
    [makeKey('MultipleChoiceScreen')]: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: [...breadcrumbHome, 'Vocabulary', '练习中', '选择题']
    },
    [makeKey('SpellingScreen')]: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: [...breadcrumbHome, 'Vocabulary', '练习中', '拼写']
    },
    [makeKey('BrowseScreen')]: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: [...breadcrumbHome, 'Vocabulary', '练习中', '浏览']
    },
    [makeKey('GrammarScreen')]: {
      module: 'grammar',
      topNav: 'grammarScreen',
      breadcrumb: lang === 'italian' ? ['Grammar', '主题选择'] : [...breadcrumbHome, 'Grammar']
    },
    [makeKey('ProgressScreen')]: {
      module: 'progress',
      topNav: 'progressScreen',
      breadcrumb: [...breadcrumbHome, 'Progress']
    },
    [makeKey('SettingsScreen')]: {
      module: 'settings',
      topNav: 'settingsScreen',
      breadcrumb: [...breadcrumbHome, 'Settings & Data']
    }
  };
}

// Build the complete ScreenMeta object
const ScreenMeta = Object.assign(
  {
    welcomeScreen: {
      module: 'home',
      topNav: 'welcomeScreen',
      breadcrumb: ['Home']
    }
  },
  makeLanguageScreens('italian'),
  makeLanguageScreens('german'),
  makeLanguageScreens('english'),
  makeLanguageScreens('french')
);

// SHARED screens — 四种语言都会进入同一个 DOM 屏幕（语法书、动词变位、社区词本、
// 动词搭配）。它们的 breadcrumb 写成“当前语言 → 面包屑”的函数，这样在深层页面上
// 用户仍然知道自己在哪种语言里（updateHeaderNavigation 在渲染时求值）。
const LANGUAGE_CRUMB = {
  italian: 'Italian',
  german: 'German',
  english: 'English',
  french: 'French'
};

function makeSharedBreadcrumb(tail) {
  return (lang) => [LANGUAGE_CRUMB[lang] || 'Italian', ...tail];
}

ScreenMeta.communityBrowseScreen = {
  module: 'vocabulary',
  topNav: 'vocabularyScreen',
  breadcrumb: makeSharedBreadcrumb(['Vocabulary', '社区词本'])
};
ScreenMeta.conjugationSetupScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: makeSharedBreadcrumb(['Grammar', '动词变位', '设置'])
};
ScreenMeta.conjugationScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: makeSharedBreadcrumb(['Grammar', '动词变位', '练习中'])
};
ScreenMeta.grammarBookScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: makeSharedBreadcrumb(['Grammar', '语法书'])
};
ScreenMeta.verbCollocationsScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: makeSharedBreadcrumb(['Grammar', '动词搭配'])
};
ScreenMeta.verbCollocationPracticeScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: makeSharedBreadcrumb(['Grammar', '动词搭配练习'])
};

// german-course.js 在运行时注入 germanCourseScreen，此前它没有任何 ScreenMeta，
// 于是回退到 welcomeScreen —— 面包屑显示 “Home”、侧栏高亮 Home。
ScreenMeta.germanCourseScreen = {
  module: 'vocabulary',
  topNav: 'vocabularyScreen',
  breadcrumb: ['German', 'Kursplan', 'A1-C1']
};
ScreenMeta.languageSkeletonPlaceholderScreen = {
  module: 'home',
  topNav: 'welcomeScreen',
  breadcrumb: (lang) => [LANGUAGE_CRUMB[lang] || 'Italian', '模块']
};
// 跨语言总览（app-enhanced.js 的 GlobalHome 在运行时注入这块屏幕）
ScreenMeta.globalHomeScreen = {
  module: 'home',
  topNav: 'globalHomeScreen',
  breadcrumb: ['Overview', '全部语言']
};

// Non-Italian welcome screens (special — under 'home' module, not the factory pattern)
ScreenMeta.germanWelcomeScreen = {
  module: 'home',
  topNav: 'welcomeScreen',
  breadcrumb: ['German', 'Home']
};
ScreenMeta.englishWelcomeScreen = {
  module: 'home',
  topNav: 'welcomeScreen',
  breadcrumb: ['English', 'Home']
};
ScreenMeta.frenchWelcomeScreen = {
  module: 'home',
  topNav: 'welcomeScreen',
  breadcrumb: ['French', 'Home']
};

// ==================== 本地存储 ====================

const Storage = {
  KEYS: {
    MASTERED: 'dimenticato_mastered',
    STATS: 'dimenticato_stats',
    LEVEL: 'dimenticato_level',
    THEME: 'dimenticato_theme',
    CUSTOM_WORDBOOKS: 'dimenticato_custom_wordbooks',
    DAILY_STATS: 'dimenticato_daily_stats',
    LANGUAGE: 'dimenticato_language'
  },
  
  // 延迟落盘句柄：每答一题就整份 stringify mastered + stats 在词库上万后
  // 是可感知的卡顿，改成脏标记 + 500ms 合并写（关闭页面 / 切后台统一冲刷，
  // 见 lib/utils.js deferredPersist）。
  _persist: null,

  /** 立即冲刷挂起的写。切换词本 / 导入导出 / 重置前必须先调用，
   *  否则挂起的写会按切换后的 currentWordbook 落进错误的 key，
   *  或在导入后用旧状态覆盖刚导入的数据。 */
  flush() {
    if (this._persist) this._persist.flush();
  },

  save() {
    if (!this._persist) this._persist = window.deferredPersist(() => Storage._write(), 500);
    this._persist();
  },

  _write() {
    // 逐条写入：任何一条失败都不应该连累后面的（旧实现是一个大 try，
    // 第一条抛异常就把统计和级别一起丢掉了）。
    if (AppState.currentWordbook) {
      // 如果当前在学习自定义单词本，保存到对应的 key
      const key = getWordbookProgressKey(
        AppState.currentWordbook.id,
        getWordbookLanguage(AppState.currentWordbook)
      );
      DimStorage.safeSetItem(key, JSON.stringify([...AppState.masteredWords]));
    } else {
      // 否则保存到系统词汇的 key
      DimStorage.safeSetItem(this.KEYS.MASTERED, JSON.stringify([...AppState.masteredWords]));
    }

    DimStorage.safeSetItem(this.KEYS.STATS, JSON.stringify(AppState.stats));
    DimStorage.safeSetItem(this.KEYS.LEVEL, AppState.selectedLevel.toString());
  },

  load() {
    // 每个 key 单独解析：一条损坏的记录不能让其余全部读不出来
    const mastered = DimStorage.safeParse(localStorage.getItem(this.KEYS.MASTERED), null);
    if (Array.isArray(mastered)) {
      AppState.masteredWords = new Set(mastered);
    }

    const stats = DimStorage.safeParse(localStorage.getItem(this.KEYS.STATS), null);
    if (stats && typeof stats === 'object') {
      AppState.stats = Object.assign({
        mcAttempts: 0,
        mcCorrect: 0,
        spAttempts: 0,
        spCorrect: 0,
        totalLearned: 0
      }, stats);
    }

    const level = localStorage.getItem(this.KEYS.LEVEL);
    if (level) {
      const parsed = level === 'all' ? 'all' : parseInt(level, 10);
      if (parsed === 'all' || Number.isFinite(parsed)) AppState.selectedLevel = parsed;
    }

    const theme = localStorage.getItem(this.KEYS.THEME);
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }

    const wordbooks = DimStorage.safeParse(localStorage.getItem(this.KEYS.CUSTOM_WORDBOOKS), null);
    if (Array.isArray(wordbooks)) {
      AppState.customWordbooks = wordbooks.map(wb => ({
        language: 'italian',
        ...wb
      }));
    }
  },

  // 重置学习进度。
  // 旧实现调用 localStorage.clear()，会连带删掉主题、自定义词本内容以及
  // 同一域名下其它应用的数据。现在按语言范围、按 key 精确删除。
  reset() {
    const promptMsg =
      '重置学习进度\n\n' +
      '请选择要重置的范围：\n' +
      '1 - 意大利语\n' +
      '2 - 德语\n' +
      '3 - 英语\n' +
      '4 - 法语\n' +
      '5 - 全部语言\n' +
      '0 - 取消\n\n' +
      '（主题设置与自定义词本内容会保留，只清除练习进度）\n' +
      '请输入 0-5：';
    const choice = prompt(promptMsg);
    const scopeByChoice = { '1': 'italian', '2': 'german', '3': 'english', '4': 'french', '5': 'all' };
    const scope = scopeByChoice[choice];
    if (!scope) return;

    const label = scope === 'all' ? '全部语言' : DimStorage.LANGUAGE_LABELS[scope];
    if (!confirm(`确定要重置【${label}】的学习进度吗？此操作不可恢复。`)) return;

    // 先冲刷全部延迟写：挂起的写如果在删除之后落地，会把刚清掉的进度复活
    if (window.DimenticatoUtils && window.DimenticatoUtils.flushAllPersisters) {
      window.DimenticatoUtils.flushAllPersisters();
    }

    const result = DimStorage.reset({ scope });

    if (scope === 'all' || scope === 'italian') {
      AppState.masteredWords.clear();
      AppState.stats = {
        mcAttempts: 0,
        mcCorrect: 0,
        spAttempts: 0,
        spCorrect: 0,
        totalLearned: 0
      };
      this.save();
      this.flush(); // 重置后 600ms 就刷新页面，不能等 500ms 的延迟写
      updateHeaderStats();
    }

    alert(`【${label}】进度已重置（清除 ${result.removed.length} 项）。\n\n页面将刷新以应用变更。`);
    setTimeout(() => location.reload(), 600);
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(this.KEYS.THEME, newTheme);
    if (typeof syncThemeToggleUI === 'function') syncThemeToggleUI(newTheme);
  },
  
  // 导出所有学习数据（四种语言 + 自定义词本 + 每本词本的进度 + 主题）
  exportAllData() {
    try {
      // 导出必须读到最后状态：四语言的 save 都是延迟写，先统一冲刷
      if (window.DimenticatoUtils && window.DimenticatoUtils.flushAllPersisters) {
        window.DimenticatoUtils.flushAllPersisters();
      }
      const exportData = DimStorage.exportAll();
      if (Object.keys(exportData.keys).length === 0) {
        alert('目前还没有任何学习数据可以导出。\n\n先做几组练习，或导入一个自定义词本再试。');
        return;
      }

      // 转换为 JSON 字符串
      const jsonString = JSON.stringify(exportData, null, 2);

      // 创建 Blob 并下载
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // 生成文件名（包含日期时间）
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      a.download = `Dimenticato_学习数据_${dateStr}_${timeStr}.json`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      const summary = DimStorage.describePayload(exportData);
      const detail = summary.languages.length ? summary.languages.join('、') : '暂无已掌握词汇';
      alert(`学习数据导出成功！\n\n${detail}\n自定义词本 ${summary.wordbooks} 个\n\n文件已保存，请妥善保管。`);

    } catch (e) {
      console.error('导出数据失败:', e);
      alert('导出失败: ' + e.message);
    }
  },
  
  // 导入学习数据（1.0 旧文件与 2.0 全语言文件都能读）
  importAllData(file) {
    return new Promise((resolve, reject) => {
      // 导入前先冲刷：挂起的延迟写会在导入后用旧状态覆盖刚导入的数据
      if (window.DimenticatoUtils && window.DimenticatoUtils.flushAllPersisters) {
        window.DimenticatoUtils.flushAllPersisters();
      }
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);

          // 验证数据格式：2.0 用 keys，1.0 用 data
          if (!importData || (!importData.keys && !importData.data)) {
            reject('无效的数据文件格式');
            return;
          }

          const summary = DimStorage.describePayload(importData);
          if (summary.keys === 0) {
            reject('数据文件中没有可导入的内容');
            return;
          }

          const exportedAt = importData.exportDate
            ? new Date(importData.exportDate).toLocaleString()
            : '未知';
          const langLine = summary.languages.length ? summary.languages.join('\n') : '（无已掌握词汇）';

          const confirmMsg =
            `即将导入学习数据\n\n` +
            `导出日期: ${exportedAt}\n` +
            `数据版本: ${importData.version || '1.0'}\n` +
            `${langLine}\n` +
            `自定义单词本: ${summary.wordbooks} 个\n\n` +
            `选择导入模式：\n` +
            `1 - 覆盖模式（文件中出现的项目按文件内容替换）\n` +
            `2 - 合并模式（保留现有数据，合并导入数据）\n` +
            `0 - 取消\n\n` +
            `请输入 0、1 或 2：`;

          const mode = prompt(confirmMsg);

          if (mode === '0' || mode === null) {
            reject('用户取消导入');
            return;
          }

          if (mode === '1') {
            this.applyImport(importData, 'overwrite');
            resolve('overwrite');
          } else if (mode === '2') {
            this.applyImport(importData, 'merge');
            resolve('merge');
          } else {
            reject('无效的选择');
          }

        } catch (error) {
          reject('JSON 解析失败: ' + error.message);
        }
      };

      reader.onerror = () => {
        reject('文件读取失败');
      };

      reader.readAsText(file);
    });
  },

  // 实际落盘 + 刷新 UI。
  // 覆盖模式只覆盖“文件里出现过的 key”——旧实现先 clearAllData() 把所有
  // dimenticato_* 全删了，于是从一个只含意大利语的备份恢复会连德/英/法进度
  // 和主题一起抹掉。现在不再有任何裸删。
  applyImport(importData, mode) {
    try {
      const result = DimStorage.importAll(importData, { mode });

      // 应用主题
      const theme = localStorage.getItem(this.KEYS.THEME);
      if (theme) document.documentElement.setAttribute('data-theme', theme);

      // 重新加载内存状态
      this.load();

      // 刷新UI
      updateHeaderStats();
      WordbookManager.renderWordbookCards();
      highlightSelectedLevel();

      const label = mode === 'overwrite' ? '覆盖模式' : '合并模式';
      alert(`数据导入成功（${label}）！\n\n共写入 ${result.written} 项。\n页面将刷新以应用新数据。`);
      setTimeout(() => location.reload(), 1000);

    } catch (e) {
      console.error('导入数据失败:', e);
      alert('导入失败: ' + e.message);
    }
  },

  // 兼容旧调用点
  importWithOverwrite(importData) {
    this.applyImport(importData, 'overwrite');
  },

  importWithMerge(importData) {
    this.applyImport(importData, 'merge');
  }
};

// ==================== 数据加载 ====================

function updateLoadingProgress(percent, message) {
  var fill = document.getElementById('loadingProgressFill');
  var detail = document.getElementById('loadingDetail');
  if (fill) fill.style.width = percent + '%';
  if (detail) detail.textContent = message || '';
}

function loadVocabulary() {
  try {
    updateLoadingProgress(10, '正在加载词汇数据...');

    // 直接使用内嵌的词汇数据（从 vocabulary.js 加载）
    if (typeof VOCABULARY_DATA === 'undefined') {
      // 意大利语词库现在是按需加载的。首屏进的是德/法/英时它本来就不该在，
      // 这不是错误：直接放行进应用，等真正切到意大利语时 LangLoader 会补跑本函数。
      const bootLang = window.LangLoader ? window.LangLoader.detectLanguage() : 'italian';
      if (bootLang !== 'italian') {
        document.getElementById('loading')?.classList.add('hidden');
        document.getElementById('app')?.classList.remove('hidden');
        return;
      }

      // 显示更详细的错误信息
      const errorMsg = '词汇数据未加载。可能原因：\n1. vocabulary.js 文件加载失败\n2. 网络连接问题\n3. 文件过大导致加载超时';
      console.error('❌ 加载失败:', errorMsg);
      updateLoadingProgress(0, '加载失败：词汇数据未找到');

      // 在小程序环境中显示友好的错误提示
      setTimeout(function() {
        document.getElementById('loading').innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <h2 style="color: var(--bad, #b0564b); margin-bottom: 20px;">加载失败</h2>
            <p style="margin-bottom: 10px;">词汇数据文件加载失败</p>
            <p style="color: var(--muted, #8f8a7d); font-size: 14px; margin-bottom: 20px;">
              这可能是由于网络问题或文件过大导致的
            </p>
            <button onclick="location.reload()" style="
              background: var(--accent, #4a7a5e);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
            ">重新加载</button>
          </div>
        `;
      }, 500);
      return;
    }

    AppState.vocabulary = VOCABULARY_DATA;
    updateLoadingProgress(40, '已加载 ' + AppState.vocabulary.length.toLocaleString() + ' 个单词');

    // 加载本地存储的数据
    updateLoadingProgress(60, '正在恢复学习进度...');
    Storage.load();

    // 初始化当前词汇列表
    updateLoadingProgress(80, '正在准备练习...');
    updateCurrentWords();

    // 隐藏加载动画，显示应用
    updateLoadingProgress(100, '准备就绪');
    setTimeout(function () {
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
    }, 300);

    // 更新头部统计
    updateHeaderStats();

    // 高亮选中的难度级别
    highlightSelectedLevel();

  } catch (error) {
    console.error('❌ 加载失败:', error);
    updateLoadingProgress(0, '加载失败：' + error.message);
    alert('加载词汇数据失败：' + error.message);
  }
}

// 更新当前难度级别的单词列表
function updateCurrentWords() {
  if (AppState.selectedLevel === 'all') {
    AppState.currentWords = [...AppState.vocabulary];
  } else {
    AppState.currentWords = AppState.vocabulary.slice(0, AppState.selectedLevel);
  }
}

// ==================== UI 更新 ====================

// 统计“当前词表里已掌握的词数”。
// 旧实现是 [...mastered].filter(w => currentWords.some(...))，即 O(n·m)：
// 全部 27,117 词 + 5,000 已掌握时单次要跑近 1 秒，而每答一题都会调用它。
// 这里改成先把 currentWords 的 italian 建成 Set 再求交集（O(n+m)），
// 并按 currentWords 数组身份缓存 Set，避免同一词表反复重建。
let _currentWordsKeySet = null;
let _currentWordsKeySetSource = null;

function getCurrentWordsKeySet() {
  const words = AppState.currentWords;
  if (_currentWordsKeySetSource !== words) {
    _currentWordsKeySetSource = words;
    _currentWordsKeySet = new Set((words || []).map(w => w.italian));
  }
  return _currentWordsKeySet;
}

function countMasteredInCurrentWords() {
  const keys = getCurrentWordsKeySet();
  const mastered = AppState.masteredWords;
  if (!mastered || !keys.size) return 0;
  // 遍历较小的一侧
  if (mastered.size <= keys.size) {
    let count = 0;
    mastered.forEach(word => { if (keys.has(word)) count++; });
    return count;
  }
  let count = 0;
  keys.forEach(word => { if (mastered.has(word)) count++; });
  return count;
}

function updateHeaderStats() {
  const totalWords = AppState.currentWords.length;
  const masteredCount = countMasteredInCurrentWords();
  // 顶栏三个数字统一由 HeaderStats 渲染：它只在“当前语言 === italian”时才落笔，
  // 因此德/英/法界面上不会再出现意大利语的数字。
  HeaderStats.set('italian', { total: totalWords, mastered: masteredCount });
}

function highlightSelectedLevel() {
  // 清除所有选中状态
  document.querySelectorAll('.vocab-source-btn, .wordbook-card').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // 根据选择类型高亮
  if (AppState.selectedSourceType === 'system') {
    document.querySelectorAll('.vocab-source-btn').forEach(btn => {
      const level = btn.dataset.level;
      if ((level === 'all' && AppState.selectedLevel === 'all') ||
          (level !== 'all' && parseInt(level) === AppState.selectedLevel)) {
        btn.classList.add('selected');
      }
    });
  } else if (AppState.selectedSourceType === 'custom' && AppState.selectedSource) {
    const card = document.querySelector(`.wordbook-card[data-wordbook-id="${AppState.selectedSource}"]`);
    if (card) {
      card.classList.add('selected');
    }
  } else if (AppState.selectedSourceType === 'cognate') {
    document.querySelectorAll('.cognate-btn').forEach(btn => {
      btn.classList.add('selected');
    });
  }
  
  // 更新模式按钮状态
  updateModeButtons();
}

function showCognateModeSelection() {
  const cognateContainer = document.getElementById('cognatePracticeContainer');
  if (cognateContainer) {
    cognateContainer.classList.remove('hidden');
  }

  if (typeof CognateApp !== 'undefined') {
    CognateApp.showModeSelection();
  }
}

function hideCognateModeSelection() {
  const cognateContainer = document.getElementById('cognatePracticeContainer');
  if (cognateContainer) {
    cognateContainer.classList.add('hidden');
  }
}

function updateModeButtons() {
  const modeButtons = [
    document.getElementById('multipleChoiceBtn'),
    document.getElementById('spellingBtn'),
    document.getElementById('browseBtn')
  ];

  const isCognate = AppState.selectedSourceType === 'cognate';
  modeButtons.forEach(btn => {
    if (btn) {
      btn.disabled = isCognate || AppState.selectedSourceType === null;
      btn.style.display = isCognate ? 'none' : '';
    }
  });

  if (isCognate && typeof CognateApp !== 'undefined') {
    showCognateModeSelection();
  }
}

function getVocabularySelectionLabel() {
  if (AppState.selectedSourceType === 'system') {
    const levelLabel = AppState.selectedLevel === 'all'
      ? '全部词汇'
      : `系统词汇 ${AppState.selectedLevel.toLocaleString()} 词`;
    return {
      title: '系统词汇库',
      detail: levelLabel
    };
  }

  if (AppState.selectedSourceType === 'custom' && AppState.currentWordbook) {
    return {
      title: '我的词本',
      detail: `${AppState.currentWordbook.name} · ${AppState.currentWordbook.wordCount} 词`
    };
  }

  return {
    title: '未选择来源',
    detail: '请先在上一层选择一个词汇来源'
  };
}

function updateVocabularySummary() {
  const summary = document.getElementById('vocabularySelectionSummary');
  const flowSummary = document.getElementById('vocabularyFlowSummary');
  if (!summary || !flowSummary) return;

  const selection = getVocabularySelectionLabel();
  summary.innerHTML = `
    <div class="selection-summary-item">
      <span class="selection-summary-label">当前来源</span>
      <strong>${selection.title}</strong>
    </div>
    <div class="selection-summary-item">
      <span class="selection-summary-label">当前选择</span>
      <span>${escapeHtml(selection.detail)}</span>
    </div>
    <div class="selection-summary-item">
      <span class="selection-summary-label">下一步</span>
      <span>选择题 / 拼写 / 浏览</span>
    </div>
  `;

  flowSummary.textContent = AppState.selectedSourceType ? `${selection.title} · ${selection.detail}` : '请选择词汇来源';
}

function updateProgressScreenStats() {
  const totalWords = AppState.currentWords.length;
  const masteredCount = countMasteredInCurrentWords();
  const progress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  const totalEl = document.getElementById('progressCurrentTotalWords');
  const masteredEl = document.getElementById('progressCurrentMasteredWords');
  const progressEl = document.getElementById('progressCurrentPercent');

  if (totalEl) totalEl.textContent = totalWords.toLocaleString();
  if (masteredEl) masteredEl.textContent = masteredCount.toLocaleString();
  if (progressEl) progressEl.textContent = progress + '%';
}

// 语法书是四种语言共用的一块屏幕。german-app.js 的 _openGrammarBook 会改写标题、
// 并且把返回按钮的 textContent 直接写成 '← 返回'（连带删掉里面的 Material 图标）。
// 意大利语/法语的入口没有把标题改回来，于是从德语转到意大利语会看到
// “German / Grammar Book”。这里在每次进入该屏幕时统一归位。
const GRAMMAR_BOOK_TITLES = {
  italian: '意大利语语法',
  french: '法语语法'
};

function normalizeGrammarBookChrome() {
  const lang = getActiveLanguage();
  const title = GRAMMAR_BOOK_TITLES[lang];
  if (title) {
    const welcomeEl = document.querySelector('#grammarBookScreen .grammar-welcome h2');
    if (welcomeEl) welcomeEl.textContent = title;
  }
  const backBtn = document.getElementById('grammarBookBackBtn');
  if (backBtn) backBtn.innerHTML = '<span class="msr">arrow_back</span>返回';
}

const SECTION_BY_TOPNAV = {
  welcomeScreen: 'home',
  vocabularyScreen: 'vocab',
  grammarScreen: 'grammar',
  progressScreen: 'progress',
  settingsScreen: 'settings',
  globalHomeScreen: 'overview'
};

function updateHeaderNavigation(screenId) {
  const meta = ScreenMeta[screenId] || ScreenMeta.welcomeScreen;
  AppState.activeModule = meta.module;

  const section = SECTION_BY_TOPNAV[meta.topNav] || 'home';
  document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });

  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb) {
    // breadcrumb 可以是数组，也可以是 (lang) => 数组 —— 共享屏幕（语法书 / 动词
    // 变位 / 社区词本 / 动词搭配）四种语言共用同一个 DOM，需要按当前语言求值。
    const rawCrumbs = typeof meta.breadcrumb === 'function'
      ? meta.breadcrumb(getActiveLanguage())
      : meta.breadcrumb;
    const crumbs = Array.isArray(rawCrumbs) ? rawCrumbs : [];
    const esc = window.escapeHtml || (s => String(s));
    breadcrumb.innerHTML = crumbs
      .map((item, index) => `<span class="breadcrumb-item ${index === crumbs.length - 1 ? 'current' : ''}">${esc(item)}</span>`)
      .join('<span class="breadcrumb-separator">/</span>');
  }

  if (screenId === 'grammarBookScreen') normalizeGrammarBookChrome();

  // 复习会话钩子。必须挂在这里而不是包装 window.showScreen：lib/navigation.js
  // 的 goBack() 调用的是它自己闭包里的 showScreen，包装 window.showScreen 对
  // goBack 无效；而 updateHeaderNavigation 是 app.js 的顶层函数声明（挂在 window
  // 上），navigation.js 以裸名字调用它，因此每一次屏幕切换都会走到这里。
  // 顺序很重要：先还原复习会话的词表，再刷新顶栏数字。
  if (window.ReviewSession && typeof window.ReviewSession.onScreenChange === 'function') {
    window.ReviewSession.onScreenChange(screenId);
  }

  // 顶栏统计跟随当前语言（HeaderStats 在 call time 通过 window 解析各语言模块）
  if (window.HeaderStats) {
    window.HeaderStats.refresh();
  }
}

// ==================== 导航核心已抽取到 lib/navigation.js ====================
//
// 以下导航原语已迁移至 lib/navigation.js（在本文件之前加载），并通过 window.*
// 以相同名字暴露，本文件及其它脚本继续以裸名字调用：
//   setPracticeContext, makeLanguageFallbackMap, FALLBACK_BACK_MAP,
//   getSharedScreenBackTarget, getFallbackBackTarget,
//   getPreviousScreenFromHistory, shouldShowMobileBackButton,
//   updateMobileBackButton, goBack, showScreen
// (Stage 2 removed isHistoryUnreliableScreen/SHARED_SCREENS — German/English
//  now push real history, so goBack relies on the shared navigationStack.)
//
// AppState / ScreenMeta / updateHeaderNavigation 仍保留在本文件；navigation.js
// 在调用时（DOMContentLoaded 之后）通过共享全局作用域延迟解析它们，无 load-order 风险。

// ==================== 掌握度（连续答对门槛） ====================
//
// 见 audit: it-mastered-after-one-lucky-guess —— 四选一里蒙对一次就把单词标成
// “已掌握”，进度条凭运气上涨。现在选择题和拼写都统一走 lib/quiz-engine.js 里的
// MasteryPolicy：连续答对 STREAK_REQUIRED 次（或 SM-2 已把它排到长间隔）才算
// 掌握，答错立即清零重来。德语/英语/法语用同一套策略，只是 lang 参数不同。
//
// MasteryPolicy 一律在【调用时】通过 window 解析：lib/quiz-engine.js 虽然先于
// app.js 加载，但解析期的 typeof 判断正是 SRS 整套功能从未安装的根因，这里不破例。
//
// 只做“晋级”，不做“降级”：dimenticato_mastered 里已有的词（老用户的存量进度）
// 保持已掌握，不需要重新赚一次。
function recordItalianMastery(word, isCorrect) {
  const key = word && word.italian;
  if (!key) return { streak: 0, mastered: false };

  const policy = window.MasteryPolicy;
  if (!policy || typeof policy.record !== 'function') {
    // 策略模块缺失时不晋级。这条分支实际不可达：lib/quiz-engine.js 没加载的话，
    // 选择题/拼写在 _getEngine() 里就已经因 QuizEngine 未定义而抛错了。
    // 宁可不涨进度，也不能退回“蒙对一次就算掌握”。
    return { streak: 0, mastered: false };
  }

  const outcome = policy.record('italian', key, isCorrect, { word }) || { streak: 0, mastered: false };
  // AppState.masteredWords 在切换词源/词本时会被整体替换，所以这里在调用时才取它
  if (outcome.mastered) AppState.masteredWords.add(key);
  return outcome;
}

// ==================== 选择题模式 ====================

const MultipleChoice = {
  _engine: null,

  _getEngine() {
    if (!this._engine) {
      this._engine = new QuizEngine({
        state: {
          get words() { return AppState.currentWords; },
          get quizIndex() { return AppState.quizIndex; },
          set quizIndex(v) { AppState.quizIndex = v; },
          get quizCorrect() { return AppState.quizCorrect; },
          set quizCorrect(v) { AppState.quizCorrect = v; },
          get quizTotal() { return AppState.quizTotal; },
          set quizTotal(v) { AppState.quizTotal = v; },
          get currentWord() { return AppState.currentWord; },
          set currentWord(v) { AppState.currentWord = v; }
        },
        stats: AppState.stats,
        mastered: AppState.masteredWords,
        fieldMap: { source: 'italian', target: 'english' },
        get difficulty() { return QuizEngine.getDifficulty(); },
        saveFn: function () { Storage.save(); },
        onUpdateStats: updateHeaderStats,
        dom: {
          optionsContainer: document.getElementById('mcOptions'),
          feedbackEl: document.getElementById('mcFeedback'),
          feedbackTextEl: document.querySelector('#mcFeedback .feedback-text'),
          progressCurrent: document.getElementById('mcCurrentWord'),
          progressTotal: document.getElementById('mcTotalWords'),
          accuracyEl: document.getElementById('mcAccuracy')
        }
      });
    }
    return this._engine;
  },

  start() {
    AppState.currentMode = 'mc';
    AppState.quizIndex = 0;
    AppState.quizCorrect = 0;
    AppState.quizTotal = 0;

    // 随机打乱单词顺序
    AppState.currentWords = shuffleArray([...AppState.currentWords]);

    showScreen('multipleChoiceScreen');
    this.loadQuestion();
  },

  loadQuestion() {
    if (AppState.quizIndex >= AppState.currentWords.length) {
      this.showCompletion();
      return;
    }

    AppState.currentWord = AppState.currentWords[AppState.quizIndex];

    // 更新进度
    document.getElementById('mcCurrentWord').textContent = AppState.quizIndex + 1;
    document.getElementById('mcTotalWords').textContent = AppState.currentWords.length;
    updateSessionFill('mcSessionFill', AppState.quizIndex, AppState.currentWords.length);

    // 更新正确率
    const accuracy = AppState.quizTotal > 0
      ? Math.round((AppState.quizCorrect / AppState.quizTotal) * 100)
      : 0;
    document.getElementById('mcAccuracy').textContent = accuracy + '%';

    // 显示意大利语单词（本方法被文件末尾的 SRS 增强版 loadQuestion 覆盖，见 ~2979）
    document.getElementById('mcItalianWord').textContent = AppState.currentWord.italian;

    // 自动朗读意大利语单词
    setTimeout(() => {
      italianSpeaker.speak(AppState.currentWord.italian, true);
    }, 300); // 稍微延迟一下，让界面先更新

    // 显示中文提示（如果存在）
    const chineseHint = document.getElementById('mcChineseHint');
    if (AppState.currentWord.chinese) {
      chineseHint.textContent = `中文: ${AppState.currentWord.chinese}`;
      chineseHint.classList.remove('hidden');
    } else {
      chineseHint.classList.add('hidden');
    }

    // 显示 notes（如果存在）
    this.displayNotes();

    // 生成选项
    this.generateOptions();

    // 隐藏反馈
    document.getElementById('mcFeedback').classList.add('hidden');
  },

  displayNotes() {
    // 查找或创建 notes 显示区域
    let notesContainer = document.querySelector('#multipleChoiceScreen .quiz-notes');
    if (!notesContainer) {
      const questionSection = document.querySelector('#multipleChoiceScreen .question-section');
      notesContainer = document.createElement('div');
      notesContainer.className = 'quiz-notes';
      questionSection.appendChild(notesContainer);
    }

    if (AppState.currentWord.notes) {
      notesContainer.innerHTML = `<strong>${renderIcon('icon-pen')} 笔记：</strong>${escapeHtml(AppState.currentWord.notes)}`;
      notesContainer.style.display = 'block';
    } else {
      notesContainer.style.display = 'none';
    }
  },

  generateOptions() {
    var correctAnswer = this._getEngine().correctAnswerFor(AppState.currentWord);
    var fullPool = (Array.isArray(AppState.currentWords) && AppState.currentWords.length > 1)
      ? AppState.currentWords
      : AppState.vocabulary;
    // 27k 全池直接喂给引擎 = 每题一次全表扫描 + 全表洗牌；先有界采样到 800
    var optionSource = QuizEngine.sampleDistractorPool(fullPool, AppState.currentWord);
    var options = this._getEngine().generateOptions(correctAnswer, optionSource);
    var self = this;
    this._getEngine().renderOptions(options, function (btn) { self.checkAnswer(btn); });
  },

  checkAnswer(button) {
    var selectedAnswer = button.dataset.answer;
    var correctAnswer = this._getEngine().correctAnswerFor(AppState.currentWord);
    var isCorrect = selectedAnswer === correctAnswer;

    AppState.quizTotal++;
    if (isCorrect) {
      AppState.quizCorrect++;
      AppState.stats.mcCorrect++;
    }
    AppState.stats.mcAttempts++;
    // 掌握与否交给 MasteryPolicy（连续答对才算数；答错清零）
    recordItalianMastery(AppState.currentWord, isCorrect);

    // Highlight all options
    var engine = this._getEngine();
    engine.highlightOptions(correctAnswer);
    if (!isCorrect) {
      button.classList.remove('faded');
      button.classList.add('wrong');
    }

    engine.showFeedback(isCorrect, correctAnswer);

    // 答对时，1秒后自动跳转下一题
    if (isCorrect) {
      setTimeout(() => this.nextQuestion(), 1000);
    }

    Storage.save();
    updateHeaderStats();
  },
  
  nextQuestion() {
    AppState.quizIndex++;
    this.loadQuestion();
  },
  
  showHint() {
    // 显示中文提示，隐藏按钮
    const chineseHint = document.getElementById('mcChineseHint');
    const showHintBtn = document.getElementById('mcShowHintBtn');
    
    chineseHint.classList.remove('hidden');
    showHintBtn.classList.add('hidden');
  },
  
  showCompletion() {
    const accuracy = Math.round((AppState.quizCorrect / AppState.quizTotal) * 100);
    alert(`练习完成\n\n正确: ${AppState.quizCorrect}/${AppState.quizTotal}\n正确率: ${accuracy}%`);
    showScreen('vocabularyModesScreen');
  }
};

// ==================== 拼写模式 ====================

const Spelling = {
  _engine: null,

  _getEngine() {
    if (!this._engine) {
      this._engine = new QuizEngine({
        state: {
          get words() { return AppState.currentWords; },
          get quizIndex() { return AppState.quizIndex; },
          set quizIndex(v) { AppState.quizIndex = v; },
          get quizCorrect() { return AppState.quizCorrect; },
          set quizCorrect(v) { AppState.quizCorrect = v; },
          get quizTotal() { return AppState.quizTotal; },
          set quizTotal(v) { AppState.quizTotal = v; },
          get currentWord() { return AppState.currentWord; },
          set currentWord(v) { AppState.currentWord = v; }
        },
        stats: AppState.stats,
        mastered: AppState.masteredWords,
        fieldMap: { source: 'english', target: 'italian' }, // reversed for spelling
        saveFn: function () { Storage.save(); },
        onUpdateStats: updateHeaderStats,
        dom: {
          optionsContainer: null, // not used in spelling
          feedbackEl: document.getElementById('spFeedback'),
          feedbackTextEl: document.querySelector('#spFeedback .feedback-text'),
          progressCurrent: document.getElementById('spCurrentWord'),
          progressTotal: document.getElementById('spTotalWords'),
          accuracyEl: document.getElementById('spAccuracy')
        }
      });
    }
    return this._engine;
  },

  start() {
    AppState.currentMode = 'sp';
    AppState.quizIndex = 0;
    AppState.quizCorrect = 0;
    AppState.quizTotal = 0;

    // 随机打乱单词顺序
    AppState.currentWords = shuffleArray([...AppState.currentWords]);

    showScreen('spellingScreen');
    this.loadQuestion();
  },

  loadQuestion() {
    if (AppState.quizIndex >= AppState.currentWords.length) {
      this.showCompletion();
      return;
    }

    AppState.currentWord = AppState.currentWords[AppState.quizIndex];

    // 更新进度
    document.getElementById('spCurrentWord').textContent = AppState.quizIndex + 1;
    document.getElementById('spTotalWords').textContent = AppState.currentWords.length;
    updateSessionFill('spSessionFill', AppState.quizIndex, AppState.currentWords.length);

    // 更新正确率
    const accuracy = AppState.quizTotal > 0
      ? Math.round((AppState.quizCorrect / AppState.quizTotal) * 100)
      : 0;
    document.getElementById('spAccuracy').textContent = accuracy + '%';

    // 显示英语翻译
    document.getElementById('spEnglishWord').textContent = AppState.currentWord.english;

    // 显示中文翻译（如果存在）
    const chineseHint = document.getElementById('spChineseHint');
    if (AppState.currentWord.chinese) {
      chineseHint.textContent = `中文: ${AppState.currentWord.chinese}`;
      chineseHint.classList.remove('hidden');
    } else {
      chineseHint.classList.add('hidden');
    }

    // 显示 notes（如果存在）
    this.displayNotes();

    // 清空输入框
    const input = document.getElementById('spInput');
    input.value = '';
    input.disabled = false;
    input.classList.remove('good', 'bad');
    input.focus();

    // 启用检查按钮
    document.getElementById('spCheckBtn').disabled = false;

    // 隐藏反馈
    document.getElementById('spFeedback').classList.add('hidden');
  },

  checkAnswer() {
    const input = document.getElementById('spInput');
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = AppState.currentWord.italian.toLowerCase();

    // 检查答案（忽略大小写和重音符号）- 使用 QuizEngine 的 normalizeString
    const engine = this._getEngine();
    const isCorrect = engine.normalizeString(userAnswer) === engine.normalizeString(correctAnswer);

    AppState.quizTotal++;
    if (isCorrect) {
      AppState.quizCorrect++;
      AppState.stats.spCorrect++;
    }
    AppState.stats.spAttempts++;
    // 拼写走同一套掌握度策略（key 仍是意大利语词条，与选择题共用连续答对计数）
    recordItalianMastery(AppState.currentWord, isCorrect);

    // 禁用输入
    input.disabled = true;
    document.getElementById('spCheckBtn').disabled = true;

    // 显示反馈
    const feedback = document.getElementById('spFeedback');
    const feedbackText = feedback.querySelector('.feedback-text');
    input.classList.remove('good', 'bad');
    input.classList.add(isCorrect ? 'good' : 'bad');

    if (isCorrect) {
      feedbackText.innerHTML = '<span class="msr">check_circle</span>回答正确';
      feedbackText.classList.remove('no');
      feedbackText.classList.add('ok');
      feedback.classList.remove('incorrect');
      feedback.classList.add('correct');
      // 答对时，1秒后自动跳转下一题
      setTimeout(() => this.nextQuestion(), 1000);
    } else {
      feedbackText.innerHTML = `<span class="msr">cancel</span>回答有误，正确答案是：${escapeHtml(AppState.currentWord.italian)}`;
      feedbackText.classList.remove('ok');
      feedbackText.classList.add('no');
      feedback.classList.remove('correct');
      feedback.classList.add('incorrect');
    }

    feedback.classList.remove('hidden');

    // 保存进度
    Storage.save();
    updateHeaderStats();
  },

  displayNotes() {
    // 查找或创建 notes 显示区域
    let notesContainer = document.querySelector('#spellingScreen .quiz-notes');
    if (!notesContainer) {
      const questionSection = document.querySelector('#spellingScreen .question-section');
      notesContainer = document.createElement('div');
      notesContainer.className = 'quiz-notes';
      questionSection.appendChild(notesContainer);
    }

    if (AppState.currentWord.notes) {
      notesContainer.innerHTML = `<strong>${renderIcon('icon-pen')} 笔记：</strong>${escapeHtml(AppState.currentWord.notes)}`;
      notesContainer.style.display = 'block';
    } else {
      notesContainer.style.display = 'none';
    }
  },

  nextQuestion() {
    AppState.quizIndex++;
    this.loadQuestion();
  },

  showCompletion() {
    const accuracy = Math.round((AppState.quizCorrect / AppState.quizTotal) * 100);
    alert(`练习完成\n\n正确: ${AppState.quizCorrect}/${AppState.quizTotal}\n正确率: ${accuracy}%`);
    showScreen('vocabularyModesScreen');
  }
};

// ==================== 浏览模式 ====================

const Browse = {
  currentFilter: 'all', // all, mastered, unmastered
  
  start() {
    AppState.currentMode = 'browse';
    showScreen('browseScreen');
    this.syncFilterChips();
    this.render();

    // 清空搜索框
    document.getElementById('searchInput').value = '';
  },
  
  render(searchTerm = '') {
    let words = [...AppState.currentWords];
    
    // 应用过滤器
    if (this.currentFilter === 'mastered') {
      words = words.filter(w => AppState.masteredWords.has(w.italian));
    } else if (this.currentFilter === 'unmastered') {
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
    
    container.innerHTML = '<div class="word-card">' + words.map(word => {
      const isMastered = AppState.masteredWords.has(word.italian);

      return `
        <div class="word-line" data-italian="${escapeHtml(word.italian)}">
          <span class="wl-word">${escapeHtml(word.italian)}</span>
          <span class="wl-gloss">${escapeHtml(word.english)}${word.notes ? `<span class="wl-note">${escapeHtml(word.notes)}</span>` : ''}</span>
          <span class="wl-cn">${word.chinese ? escapeHtml(word.chinese) : ''}</span>
          <span class="wl-status"><span class="dot${isMastered ? ' good' : ''}"></span>${isMastered ? '已掌握' : '学习中'}</span>
          <button class="wl-speaker" title="朗读"><span class="msr">volume_up</span></button>
        </div>
      `;
    }).join('') + '</div>';

    // 为每个单词项添加点击朗读功能
    container.querySelectorAll('.word-line').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const italian = item.dataset.italian;
        if (italian) {
          italianSpeaker.speak(italian);
        }
      });
    });
  },

  setFilter(filter) {
    if (!['all', 'mastered', 'unmastered'].includes(filter)) return;
    this.currentFilter = filter;
    this.syncFilterChips();
    const searchTerm = document.getElementById('searchInput').value;
    this.render(searchTerm);
  },

  syncFilterChips() {
    document.querySelectorAll('#browseFilterChips .chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === this.currentFilter);
    });
  },

  toggleFilter() {
    const filters = ['all', 'mastered', 'unmastered'];
    const currentIndex = filters.indexOf(this.currentFilter);
    this.setFilter(filters[(currentIndex + 1) % filters.length]);
  }
};

// ==================== 自定义单词本管理 ====================

const WordbookManager = {
  // 验证 JSON 格式
  validateWordbook(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '无效的 JSON 格式' };
    }
    
    if (!data.name || typeof data.name !== 'string') {
      return { valid: false, error: '缺少 name 字段或格式不正确' };
    }
    
    if (!Array.isArray(data.words) || data.words.length === 0) {
      return { valid: false, error: 'words 字段必须是非空数组' };
    }
    
    const language = data.language || 'italian';

    // 验证每个单词
    for (let i = 0; i < data.words.length; i++) {
      const word = data.words[i];
      if (language === 'german') {
        if (!word.german && !word.display) {
          return { valid: false, error: `第 ${i + 1} 个单词缺少 german/display 字段` };
        }
      } else if (language === 'english') {
        if (!word.english) {
          return { valid: false, error: `第 ${i + 1} 个单词缺少 english 字段` };
        }
      } else if (language === 'french') {
        if (!word.french && !word.display) {
          return { valid: false, error: `第 ${i + 1} 个单词缺少 french/display 字段` };
        }
      } else if (!word.italian || !word.english) {
        return { valid: false, error: `第 ${i + 1} 个单词缺少 italian 或 english 字段` };
      }
    }
    
    return { valid: true };
  },
  
  getPrimaryWordValue(word, language = 'italian') {
    if (language === 'german') return word.german || word.display || '';
    if (language === 'english') return word.english || '';
    if (language === 'french') return word.french || word.display || '';
    return word.italian || '';
  },

  // 在 VOCABULARY_DATA 中查找意大利语单词
  lookupWord(italian) {
    if (typeof VOCABULARY_DATA === 'undefined') {
      return null;
    }
    
    const normalizedItalian = italian.toLowerCase().trim();
    return VOCABULARY_DATA.find(w => w.italian.toLowerCase() === normalizedItalian);
  },
  
  // 解析 TXT 格式单词本（支持灵活格式 + 自动查找）
  parseTxtWordbook(text, language = 'italian') {
    // 移除文件开头的空行
    text = text.trim();
    
    // 按双换行符（空行）分割成单词块
    const blocks = text.split(/\n\s*\n+/);
    
    const words = [];
    let autoMatchedCount = 0;
    let needManualCount = 0;
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();
      if (!block) continue;
      
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) continue;
      
      let word = { chinese: '', notes: '' };
      
      // 检测格式：1行=仅意大利语，2-4行=完整格式
      if (language === 'german') {
        if (lines.length === 1) {
          word.german = lines[0];
          word.display = lines[0];
          const found = (typeof GERMAN_VOCABULARY_DATA !== 'undefined' ? GERMAN_VOCABULARY_DATA : []).find(
            item => (item.german || '').toLowerCase().trim() === word.german.toLowerCase().trim()
          );
          if (found) {
            word.meaning = found.meaning || found.chinese || '';
            word.chinese = found.chinese || '';
            autoMatchedCount++;
          } else {
            word.meaning = '';
            needManualCount++;
          }
        } else {
          word.german = lines[0];
          word.display = lines[0];
          word.meaning = lines[1] || '';
          if (lines.length >= 3) word.chinese = lines[2];
          if (lines.length >= 4) word.notes = lines[3];
        }
      } else if (language === 'english') {
        if (lines.length === 1) {
          word.english = lines[0];
          const found = (typeof ENGLISH_VOCABULARY_DATA !== 'undefined' ? ENGLISH_VOCABULARY_DATA : []).find(
            item => (item.english || '').toLowerCase().trim() === word.english.toLowerCase().trim()
          );
          if (found) {
            word.meaning = found.meaning || found.chinese || '';
            word.chinese = found.chinese || '';
            autoMatchedCount++;
          } else {
            word.meaning = '';
            needManualCount++;
          }
        } else {
          word.english = lines[0];
          word.meaning = lines[1] || '';
          if (lines.length >= 3) word.chinese = lines[2];
          if (lines.length >= 4) word.notes = lines[3];
        }
      } else if (language === 'french') {
        if (lines.length === 1) {
          word.french = lines[0];
          word.display = lines[0];
          const found = (typeof FRENCH_VOCABULARY_DATA !== 'undefined' ? FRENCH_VOCABULARY_DATA : []).find(
            item => (item.french || '').toLowerCase().trim() === word.french.toLowerCase().trim()
          );
          if (found) {
            word.meaning = found.meaning || found.chinese || '';
            word.chinese = found.chinese || '';
            autoMatchedCount++;
          } else {
            word.meaning = '';
            needManualCount++;
          }
        } else {
          word.french = lines[0];
          word.display = lines[0];
          word.meaning = lines[1] || '';
          if (lines.length >= 3) word.chinese = lines[2];
          if (lines.length >= 4) word.notes = lines[3];
        }
      } else if (lines.length === 1) {
        // 仅意大利语，需要自动查找
        word.italian = lines[0];
        
        // 在 VOCABULARY_DATA 中查找
        const found = this.lookupWord(word.italian);
        if (found) {
          word.english = found.english || '';
          word.chinese = found.chinese || '';
          autoMatchedCount++;
        } else {
          // 未找到，留空英语和中文
          word.english = '';
          word.chinese = '';
          needManualCount++;
        }
      } else if (lines.length >= 2) {
        // 完整格式：意大利语、英语、中文（可选）、notes（可选）
        word.italian = lines[0];
        word.english = lines[1];
        
        if (lines.length >= 3) {
          word.chinese = lines[2];
        }
        
        if (lines.length >= 4) {
          word.notes = lines[3];
        }
        
        // 如果英语为空，尝试自动查找
        if (!word.english) {
          const found = this.lookupWord(word.italian);
          if (found) {
            word.english = found.english || '';
            if (!word.chinese) {
              word.chinese = found.chinese || '';
            }
            autoMatchedCount++;
          } else {
            needManualCount++;
          }
        }
      }
      
      // 验证必填字段（意大利语必须存在）
      const primaryField = language === 'german'
        ? 'german'
        : language === 'english'
          ? 'english'
          : language === 'french'
            ? 'french'
            : 'italian';
      if (!word[primaryField]) {
        throw new Error(`第 ${i + 1} 个单词块缺少${primaryField}字段`);
      }
      
      words.push(word);
    }
    
    if (words.length === 0) {
      throw new Error('文件中没有找到有效的单词');
    }
    
    return { words, autoMatchedCount, needManualCount };
  },
  
  // 导入单词本（支持智能导入 + 重复检测）
  importFromFile(file) {
    return this.importFromFileWithLanguage(file, 'italian');
  },

  importFromFileWithLanguage(file, language = 'italian') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const isTxtFile = file.name.toLowerCase().endsWith('.txt');
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let data;
          let importStats = {
            autoMatchedCount: 0,
            needManualCount: 0,
            duplicatesSkipped: 0,
            totalImported: 0
          };
          
          if (isTxtFile) {
            // 解析 TXT 格式（新格式支持自动查找）
            const parseResult = this.parseTxtWordbook(content, language);
            const words = parseResult.words;
            importStats.autoMatchedCount = parseResult.autoMatchedCount;
            importStats.needManualCount = parseResult.needManualCount;
            
            // 从文件名生成单词本名称（去掉扩展名）
            const fileName = file.name.replace(/\.txt$/i, '');
            
            data = {
              name: fileName,
              description: `从 TXT 文件导入（${new Date().toLocaleDateString()}）`,
              language,
              words: words
            };
          } else {
            // 解析 JSON 格式
            data = JSON.parse(content);
            data.language = data.language || language;
            const validation = this.validateWordbook(data);
            
            if (!validation.valid) {
              reject(validation.error);
              return;
            }
          }
          
          // 检查是否存在同名单词本（用于重复检测）
          let existingWordbook = AppState.customWordbooks.find(wb => wb.name === data.name && getWordbookLanguage(wb) === data.language);
          let existingWords = new Set();
          const activeLanguage = data.language || language;
          
          if (existingWordbook) {
            // 如果存在同名单词本，提供三个选项
            const action = prompt(
              `已存在同名单词本"${data.name}"（${existingWordbook.wordCount} 词）。\n\n` +
              `请选择操作：\n` +
              `1 - 批量添加到现有单词本（跳过重复，保留原有单词）\n` +
              `2 - 创建新单词本（添加时间戳后缀）\n` +
              `0 - 取消导入\n\n` +
              `请输入 0、1 或 2：`
            );
            
            if (action === '0' || action === null) {
              reject('用户取消导入');
              return;
            } else if (action === '1') {
              // 批量添加模式：收集现有单词（大小写不敏感）
              existingWordbook.words.forEach(w => {
                existingWords.add(this.getPrimaryWordValue(w, activeLanguage).toLowerCase().trim());
              });
            } else if (action === '2') {
              // 创建新单词本模式：不收集现有单词，后面会创建新单词本并添加时间戳
              existingWordbook = null;
            } else {
              reject('无效的选择');
              return;
            }
          }
          
          // 去重处理
          const wordsToImport = [];
          const notFoundWords = []; // 需要手动编辑的单词（英语或中文为空）
          const foundWords = []; // 已找到翻译的单词
          
          data.words.forEach(word => {
            const normalizedPrimary = this.getPrimaryWordValue(word, activeLanguage).toLowerCase().trim();
            
            // 检查重复
            if (existingWords.has(normalizedPrimary)) {
              importStats.duplicatesSkipped++;
              return;
            }
            
            existingWords.add(normalizedPrimary);
            
            // 分类：需要手动编辑 vs 已完整
            const secondaryValue = activeLanguage === 'german'
              ? (word.meaning || '')
              : activeLanguage === 'english'
                ? (word.meaning || '')
                : activeLanguage === 'french'
                  ? (word.meaning || '')
                  : (word.english || '');

            if (!secondaryValue || !word.chinese) {
              notFoundWords.push(word);
            } else {
              foundWords.push(word);
            }
          });
          
          // 排序：需要手动编辑的单词放在最前面
          wordsToImport.push(...notFoundWords, ...foundWords);
          importStats.totalImported = wordsToImport.length;
          
          if (wordsToImport.length === 0) {
            reject('所有单词都已存在，没有新单词需要导入');
            return;
          }
          
          // 创建或更新单词本
          if (existingWordbook && existingWords.size > 0) {
            // 合并到现有单词本
            existingWordbook.words = [...existingWordbook.words, ...wordsToImport];
            existingWordbook.wordCount = existingWordbook.words.length;
            this.saveWordbooks();
            
            resolve({
              wordbook: existingWordbook,
              stats: importStats,
              isMerge: true
            });
          } else {
            // 创建新单词本
            const wordbook = {
              id: Date.now(),
              name: data.name,
              language: data.language || language,
              description: data.description || '',
              words: wordsToImport,
              wordCount: wordsToImport.length,
              createdAt: new Date().toISOString()
            };
            
            AppState.customWordbooks.push(wordbook);
            this.saveWordbooks();
            
            resolve({
              wordbook: wordbook,
              stats: importStats,
              isMerge: false
            });
          }
        } catch (error) {
          if (isTxtFile) {
            reject('TXT 解析失败: ' + error.message);
          } else {
            reject('JSON 解析失败: ' + error.message);
          }
        }
      };
      
      reader.onerror = () => {
        reject('文件读取失败');
      };
      
      reader.readAsText(file);
    });
  },

  getWordbooksByLanguage(language = 'italian') {
    return AppState.customWordbooks.filter(wb => getWordbookLanguage(wb) === language);
  },

  mapWordbookWordsForLanguage(words = [], language = 'italian') {
    return words.map((word) => {
      if (language === 'german') {
        return {
          german: word.german || word.display || '',
          display: word.display || word.german || '',
          meaning: word.meaning || word.chinese || '',
          chinese: word.chinese || '',
          notes: word.notes || '',
          rank: 999999,
          source: 'custom'
        };
      }

      if (language === 'english') {
        return {
          english: word.english || '',
          meaning: word.meaning || word.chinese || '',
          chinese: word.chinese || '',
          notes: word.notes || '',
          rank: 999999,
          source: 'custom'
        };
      }

      if (language === 'french') {
        return {
          french: word.french || word.display || '',
          display: word.display || word.french || '',
          meaning: word.meaning || word.chinese || '',
          chinese: word.chinese || '',
          notes: word.notes || '',
          rank: 999999,
          source: 'custom'
        };
      }

      return {
        ...word,
        rank: 999999
      };
    });
  },
  
  // 删除单词本
  deleteWordbook(id) {
    const index = AppState.customWordbooks.findIndex(wb => wb.id === id);
    if (index !== -1) {
      const wordbook = AppState.customWordbooks[index];
      if (confirm(`确定要删除单词本"${wordbook.name}"吗？`)) {
        AppState.customWordbooks.splice(index, 1);
        this.saveWordbooks();
        this.renderWordbookCards();
        
        // 同时删除该单词本的学习进度
        localStorage.removeItem(`dimenticato_progress_wb_${id}`);
        localStorage.removeItem(getWordbookProgressKey(id, getWordbookLanguage(wordbook)));
        
        // 如果删除的是当前选中的单词本，清除选择状态
        if (AppState.selectedSource === id) {
          AppState.selectedSource = null;
          AppState.selectedSourceType = null;
          AppState.currentWordbook = null;
          updateModeButtons();
        }
      }
    }
  },
  
  // 保存单词本列表到 LocalStorage
  saveWordbooks() {
    // safeSetItem 在配额不足时会先裁剪旧的每日统计再重试，并且只提示一次
    DimStorage.safeSetItem(Storage.KEYS.CUSTOM_WORDBOOKS, JSON.stringify(
      AppState.customWordbooks.map(wb => ({ language: 'italian', ...wb }))
    ));
  },
  
  // 开始学习指定单词本
  startLearning(id, mode) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === id);
    if (!wordbook) {
      alert('单词本不存在');
      return;
    }
    
    // 设置当前单词本和单词列表
    AppState.currentWordbook = wordbook;
    AppState.currentWords = this.mapWordbookWordsForLanguage(wordbook.words, getWordbookLanguage(wordbook));
    
    // 加载该单词本的学习进度
    this.loadWordbookProgress(id);
    
    // 更新头部统计
    updateHeaderStats();
    
    // 启动对应的学习模式
    if (mode === 'mc') {
      MultipleChoice.start();
    } else if (mode === 'spelling') {
      Spelling.start();
    } else if (mode === 'browse') {
      Browse.start();
    }
  },
  
  // 加载单词本的学习进度
  loadWordbookProgress(id) {
    try {
      const key = `dimenticato_progress_wb_${id}`;
      const languageKey = getWordbookProgressKey(id, getWordbookLanguage(AppState.currentWordbook || { language: 'italian' }));
      const progress = localStorage.getItem(languageKey) || localStorage.getItem(key);
      if (progress) {
        const mastered = JSON.parse(progress);
        AppState.masteredWords = new Set(mastered);
      } else {
        AppState.masteredWords = new Set();
      }
    } catch (e) {
      console.error('加载单词本进度失败:', e);
      AppState.masteredWords = new Set();
    }
  },
  
  // 渲染单词本卡片（在欢迎页面）
  renderWordbookCards() {
    const container = document.getElementById('wordbookCards');
    
    if (AppState.customWordbooks.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 1rem;">还没有导入任何单词本</p>';
      return;
    }
    
    container.innerHTML = AppState.customWordbooks.map(wb => `
      <div class="card wordbook-card" data-wordbook-id="${wb.id}">
        <button class="wordbook-delete-btn" onclick="event.stopPropagation(); WordbookManager.deleteWordbook(${wb.id})" title="删除">×</button>
        <span class="card-chip"><span class="msr">bookmark</span></span>
        <span class="card-title">${escapeHtml(wb.name)}</span>
        <span class="card-desc">${wb.wordCount} 词 · ${new Date(wb.createdAt).toLocaleDateString()}</span>
      </div>
    `).join('');
    
    // 绑定点击事件
    container.querySelectorAll('.wordbook-card').forEach(card => {
      card.addEventListener('click', () => {
        const wordbookId = parseInt(card.dataset.wordbookId);
        this.selectWordbook(wordbookId);
      });
    });
  },
  
  // 选择单词本
  selectWordbook(id) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === id);
    if (!wordbook) return;

    // 先冲刷挂起的延迟写：Storage._write 在落盘那一刻才读 currentWordbook，
    // 不冲刷的话上一个来源最后的答题进度会写进新选词本的 key
    Storage.flush();

    // 设置选择状态
    AppState.selectedSource = id;
    AppState.selectedSourceType = 'custom';
    AppState.currentWordbook = wordbook;
    
    // 设置当前单词列表
    AppState.currentWords = this.mapWordbookWordsForLanguage(wordbook.words, getWordbookLanguage(wordbook));
    
    // 加载该单词本的学习进度
    this.loadWordbookProgress(id);
    
    // 更新UI
    updateHeaderStats();
    highlightSelectedLevel();
    setPracticeContext('vocab');
    updateVocabularySummary();
    showScreen('vocabularyModesScreen');
  },
  
  // 渲染单词本列表（旧的，保留作为备份）
  renderWordbookList() {
    const container = document.getElementById('wordbookList');
    
    if (AppState.customWordbooks.length === 0) {
      container.innerHTML = `
        <div class="wordbook-empty">
          <div class="wordbook-empty-icon">${renderIcon('icon-library')}</div>
          <p>还没有导入任何单词本</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">点击上方按钮导入 JSON 文件</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = AppState.customWordbooks.map(wb => `
      <div class="wordbook-item">
        <div class="wordbook-info">
          <div class="wordbook-name">${escapeHtml(wb.name)}</div>
          ${wb.description ? `<div class="wordbook-description">${escapeHtml(wb.description)}</div>` : ''}
          <div class="wordbook-meta">
            <span>${renderIcon('icon-pen')} ${wb.wordCount} 个单词</span>
            <span>${renderIcon('icon-calendar')} ${new Date(wb.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="wordbook-actions">
          <button class="wordbook-action-btn learn" onclick="WordbookManager.showModeSelection(${wb.id})">
            开始学习
          </button>
          <button class="wordbook-action-btn delete" onclick="WordbookManager.deleteWordbook(${wb.id})">
            删除
          </button>
        </div>
      </div>
    `).join('');
  },
  
  // 显示模式选择对话框
  showModeSelection(id) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === id);
    if (!wordbook) return;
    
    const mode = prompt(
      `请选择学习模式：\n\n` +
      `1 - 选择题模式（看意大利语选英语翻译）\n` +
      `2 - 拼写模式（看英语拼写意大利语）\n` +
      `3 - 浏览模式（查看所有单词）\n\n` +
      `请输入 1、2 或 3：`
    );
    
    if (mode === '1') {
      this.startLearning(id, 'mc');
    } else if (mode === '2') {
      this.startLearning(id, 'spelling');
    } else if (mode === '3') {
      this.startLearning(id, 'browse');
    }
  }
  // NOTE: showManagementScreen() was removed in Stage 3 of the nav refactor —
  // it had zero call sites and navigated to a non-existent 'wordbookScreen'.
};

// ==================== 统计弹窗 ====================

function showStatsModal() {
  const totalAttempts = AppState.stats.mcAttempts + AppState.stats.spAttempts;
  const totalCorrect = AppState.stats.mcCorrect + AppState.stats.spCorrect;
  const overallAccuracy = totalAttempts > 0 
    ? Math.round((totalCorrect / totalAttempts) * 100) 
    : 0;
  
  const masteredCount = countMasteredInCurrentWords();

  const progress = AppState.currentWords.length > 0
    ? Math.round((masteredCount / AppState.currentWords.length) * 100) 
    : 0;
  
  document.getElementById('statTotalLearned').textContent = AppState.masteredWords.size;
  document.getElementById('statMastered').textContent = masteredCount;
  document.getElementById('statProgress').textContent = progress + '%';
  document.getElementById('statMCAttempts').textContent = AppState.stats.mcAttempts;
  document.getElementById('statSpAttempts').textContent = AppState.stats.spAttempts;
  document.getElementById('statAccuracy').textContent = overallAccuracy + '%';
  
  document.getElementById('statsModal').classList.remove('hidden');
}

function hideStatsModal() {
  document.getElementById('statsModal').classList.add('hidden');
}

// ==================== 工具函数 ====================

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 更新练习界面顶部的进度条（redesign .session-bar/.session-fill）
function updateSessionFill(id, index, total) {
  const fill = document.getElementById(id);
  if (!fill) return;
  const pct = total > 0 ? Math.min(100, Math.round((index / total) * 100)) : 0;
  fill.style.width = pct + '%';
}

// ==================== 事件绑定 ====================

function bindEvents() {
  document.querySelectorAll('.top-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.target);
    });
  });

  document.getElementById('goVocabularyBtn')?.addEventListener('click', () => showScreen('vocabularyScreen'));
  document.getElementById('goGrammarBtn')?.addEventListener('click', () => showScreen('grammarScreen'));
  document.getElementById('goProgressBtn')?.addEventListener('click', () => showScreen('progressScreen'));
  document.getElementById('goSettingsBtn')?.addEventListener('click', () => showScreen('settingsScreen'));
  document.getElementById('goConjugationSetupBtn')?.addEventListener('click', () => showScreen('conjugationSetupScreen'));
  document.getElementById('goGrammarBookBtn')?.addEventListener('click', () => {
    showScreen('grammarBookScreen');
    if (typeof GrammarBook !== 'undefined') GrammarBook.init();
  });
  // 这个按钮只存在于意大利语的 #grammarScreen 里，所以必须显式传 'italian'：
  // 不传参时 VerbCollocationPractice 会沿用上一次的 state.lang，用户先看过德语搭配
  // 再回意大利语点“开始练习”，练到的会是德语题目。
  document.getElementById('goVerbCollocationPracticeBtn')?.addEventListener('click', () => {
    showScreen('verbCollocationPracticeScreen');
    const practice = window.VerbCollocationPractice;
    if (practice && typeof practice.open === 'function') practice.open('italian');
  });
  // grammarBookScreen 是四种语言共用的一块屏幕，#grammarBookBackBtn 上原本挂了
  // 两个监听器（这里一个 + german-app.js:471 无条件绑的一个）。旧版只在德/英
  // 时提前 return，所以意大利语和法语点一次返回会连退两屏。
  //
  // 这里改为在 document 上用【捕获阶段】接管这个按钮：捕获监听器先于目标节点上的
  // 冒泡监听器执行，stopPropagation() 之后 german-app.js 的那个监听器不会再收到
  // 事件，于是无论哪种语言都只发生一次返回。
  document.addEventListener('click', (event) => {
    const btn = event.target && event.target.closest
      ? event.target.closest('#grammarBookBackBtn')
      : null;
    if (!btn) return;
    event.stopPropagation();

    const lang = getActiveLanguage();
    const germanApp = window.GermanApp;

    if ((lang === 'german' || lang === 'english') && germanApp) {
      // _openGrammarBook 记下了“是谁打开的语法书”
      if (typeof germanApp._grammarBookBackTarget === 'function') {
        germanApp._grammarBookBackTarget();
      } else {
        germanApp.goBack(`${lang}GrammarScreen`);
      }
      return;
    }

    if (lang === 'french') {
      goBack({ fallbackTarget: 'frenchGrammarScreen' });
      return;
    }

    goBack({ fallbackTarget: 'grammarScreen' });
  }, true);
  document.getElementById('browseCommunityBtn')?.addEventListener('click', () => CommunityWordbooks.showBrowseScreen());
  document.getElementById('openProgressStatsBtn')?.addEventListener('click', () => {
    if (typeof showEnhancedStatsModal !== 'undefined') showEnhancedStatsModal();
  });

  document.getElementById('mobileFloatingBackBtn')?.addEventListener('click', () => goBack());

  document.getElementById('vocabularyBackBtn')?.addEventListener('click', () => goBack({ fallbackTarget: 'welcomeScreen' }));
  document.getElementById('vocabularyModesBackBtn')?.addEventListener('click', () => goBack({ fallbackTarget: 'vocabularyScreen' }));
  document.getElementById('grammarBackBtn')?.addEventListener('click', () => goBack({ fallbackTarget: 'welcomeScreen' }));
  document.getElementById('conjugationSetupBackBtn')?.addEventListener('click', () => goBack({ fallbackTarget: 'grammarScreen' }));
  document.getElementById('progressBackBtn')?.addEventListener('click', () => goBack({ fallbackTarget: 'welcomeScreen' }));
  document.getElementById('settingsBackBtn')?.addEventListener('click', () => goBack({ fallbackTarget: 'welcomeScreen' }));

  document.getElementById('settingsExportBtn')?.addEventListener('click', () => Storage.exportAllData());
  document.getElementById('settingsImportBtn')?.addEventListener('click', () => document.getElementById('importDataFileInput').click());
  document.getElementById('settingsThemeBtn')?.addEventListener('click', () => Storage.toggleTheme());
  document.getElementById('settingsHelpBtn')?.addEventListener('click', () => document.getElementById('helpModal').classList.remove('hidden'));
  document.getElementById('settingsCommunityUploadBtn')?.addEventListener('click', () => CommunityWordbooks.showUploadDialog());
  document.getElementById('settingsResetBtn')?.addEventListener('click', () => Storage.reset());

  initDifficultyToggle();
  initDirectionToggle();

  function initDifficultyToggle() {
    const toggle = document.getElementById('difficultyToggle');
    if (!toggle) return;
    const buttons = toggle.querySelectorAll('.difficulty-option');
    const apply = (value) => {
      buttons.forEach((b) => b.classList.toggle('active', b.dataset.difficulty === value));
    };
    apply(QuizEngine.getDifficulty());
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        apply(QuizEngine.setDifficulty(btn.dataset.difficulty));
      });
    });
  }

  // 出题方向（全局设置；德/英/法的分语言开关由 QuizEngine 运行时注入）
  function initDirectionToggle() {
    const toggle = document.getElementById('directionToggle');
    if (!toggle) return;
    const buttons = toggle.querySelectorAll('.direction-option');
    const apply = (value) => {
      buttons.forEach((b) => b.classList.toggle('active', b.dataset.direction === value));
    };
    apply(QuizEngine.getDirection());
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        apply(QuizEngine.setDirection(btn.dataset.direction));
      });
    });
  }

  // 系统词汇级别选择
  document.querySelectorAll('.vocab-source-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // 同 selectWordbook：换来源前先冲刷，避免旧来源进度落错 key
      Storage.flush();
      const level = btn.dataset.level;
      AppState.selectedLevel = level === 'all' ? 'all' : parseInt(level);
      AppState.selectedSource = 'system';
      AppState.selectedSourceType = 'system';
      AppState.currentWordbook = null;
      
      // 更新当前词汇列表
      updateCurrentWords();
      
      // 重新加载系统词汇的进度（不覆盖 selectedLevel）
      const mastered = localStorage.getItem(Storage.KEYS.MASTERED);
      if (mastered) {
        AppState.masteredWords = new Set(JSON.parse(mastered));
      } else {
        AppState.masteredWords = new Set();
      }
      
      // 更新UI
      updateHeaderStats();
      highlightSelectedLevel();
      setPracticeContext('vocab');
      updateVocabularySummary();
      
      // 保存选择的级别
      localStorage.setItem(Storage.KEYS.LEVEL, AppState.selectedLevel.toString());

      showScreen('vocabularyModesScreen');
    });
  });

  // Cognate button handler
  document.querySelectorAll('.cognate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AppState.selectedLevel = 'cognate';
      AppState.selectedSource = 'cognate';
      AppState.selectedSourceType = 'cognate';
      AppState.currentWordbook = null;

      // 加载 cognate 词汇
      if (typeof COGNATE_DATA !== 'undefined') {
        AppState.currentWords = COGNATE_DATA.slice(0, 1000);
      }

      // 重置进度
      AppState.masteredWords = new Set();

      // 更新 UI
      updateHeaderStats();
      highlightSelectedLevel();
      showScreen('vocabularyModesScreen');

      // 显示 cognate 模式选择
      showCognateModeSelection();
    });
  });

  // 模式选择
  document.getElementById('multipleChoiceBtn').addEventListener('click', () => {
    MultipleChoice.start();
  });
  
  document.getElementById('spellingBtn').addEventListener('click', () => {
    Spelling.start();
  });
  
  document.getElementById('browseBtn').addEventListener('click', () => {
    Browse.start();
  });
  
  // 自定义单词本导入
  document.getElementById('importWordbookBtn').addEventListener('click', () => {
    document.getElementById('wordbookFileInput').click();
  });
  
  // 创建新单词本（仅当 WordbookEditor 可用时）
  document.getElementById('createWordbookBtn').addEventListener('click', () => {
    if (typeof WordbookEditor !== 'undefined') {
      const wordbook = WordbookEditor.createNewWordbook();
      if (wordbook) {
        alert(`已成功创建单词本"${wordbook.name}"。\n点击单词本卡片右上角的设置按钮可以添加单词。`);
      }
    } else {
      alert('单词本编辑功能未加载，请刷新页面重试。');
    }
  });
  
  document.getElementById('wordbookFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await WordbookManager.importFromFile(file);
      const { wordbook, stats, isMerge } = result;
      
      // 构建详细的导入报告
      let message = isMerge 
        ? `成功合并到单词本"${wordbook.name}"！\n\n`
        : `成功导入单词本"${wordbook.name}"！\n\n`;
      
      message += `导入统计：\n`;
      message += `• 总计导入：${stats.totalImported} 个单词\n`;
      
      if (stats.autoMatchedCount > 0) {
        message += `• 自动匹配：${stats.autoMatchedCount} 个\n`;
      }
      
      if (stats.needManualCount > 0) {
        message += `• 需手动编辑：${stats.needManualCount} 个（已放在最前面）\n`;
      }
      
      if (stats.duplicatesSkipped > 0) {
        message += `• 跳过重复：${stats.duplicatesSkipped} 个\n`;
      }
      
      message += `\n单词本总数：${wordbook.wordCount} 个单词`;
      
      if (stats.needManualCount > 0) {
        message += `\n\n提示：点击单词本卡片右上角的设置按钮可补充缺失翻译`;
      }
      
      alert(message);
      WordbookManager.renderWordbookCards();
    } catch (error) {
      alert(`导入失败：${error}`);
    }
    
    // 清空文件输入
    e.target.value = '';
  });
  
  // 选择题模式
  document.getElementById('mcBackBtn').addEventListener('click', () => {
    goBack({ fallbackTarget: 'vocabularyModesScreen' });
  });

  document.getElementById('mcNextBtn').addEventListener('click', () => {
    MultipleChoice.nextQuestion();
  });

  // 选择题发音按钮
  document.getElementById('mcSpeakerBtn')?.addEventListener('click', () => {
    if (AppState.currentWord && AppState.currentWord.italian) {
      italianSpeaker.speak(AppState.currentWord.italian);
    }
  });
  
  // 拼写模式
  document.getElementById('spBackBtn').addEventListener('click', () => {
    goBack({ fallbackTarget: 'vocabularyModesScreen' });
  });
  
  document.getElementById('spCheckBtn').addEventListener('click', () => {
    Spelling.checkAnswer();
  });
  
  document.getElementById('spInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      Spelling.checkAnswer();
    }
  });
  
  document.getElementById('spNextBtn').addEventListener('click', () => {
    Spelling.nextQuestion();
  });
  
  // 拼写模式发音按钮
  document.getElementById('spPronunciationBtn').addEventListener('click', () => {
    if (AppState.currentWord && AppState.currentWord.italian) {
      italianSpeaker.speak(AppState.currentWord.italian);
    }
  });
  
  // 浏览模式
  document.getElementById('brBackBtn').addEventListener('click', () => {
    goBack({ fallbackTarget: 'vocabularyModesScreen' });
  });
  
  // 27k 词的列表不能每键整表重建：搜索去抖（德语站既有模式）
  const debouncedBrowseSearch = window.debounce
    ? window.debounce((value) => Browse.render(value), 200)
    : (value) => Browse.render(value);
  document.getElementById('searchInput').addEventListener('input', (e) => {
    debouncedBrowseSearch(e.target.value);
  });
  
  document.querySelectorAll('#browseFilterChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      Browse.setFilter(chip.dataset.filter);
    });
  });
  
  // 底部工具栏
  document.getElementById('exportDataBtn').addEventListener('click', () => {
    Storage.exportAllData();
  });
  
  document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importDataFileInput').click();
  });
  
  document.getElementById('importDataFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await Storage.importAllData(file);
    } catch (error) {
      if (error !== '用户取消导入') {
        alert(`导入失败：${error}`);
      }
    }
    
    // 清空文件输入
    e.target.value = '';
  });
  
  document.getElementById('resetBtn').addEventListener('click', () => {
    Storage.reset();
  });
  
  document.getElementById('statsBtn').addEventListener('click', () => {
    showStatsModal();
  });
  
  document.getElementById('themeBtn').addEventListener('click', () => {
    Storage.toggleTheme();
  });
  
  document.getElementById('helpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').classList.remove('hidden');
  });

  // 关闭帮助弹窗
  document.getElementById('closeHelpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('hidden');
  });

  // 点击背景关闭帮助弹窗
  document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
      document.getElementById('helpModal').classList.add('hidden');
    }
  });
  
  // 统计弹窗 - 使用增强版本（如果可用）
  document.getElementById('statsBtn').removeEventListener('click', showStatsModal);
  document.getElementById('statsBtn').addEventListener('click', () => {
    if (typeof showEnhancedStatsModal !== 'undefined') {
      showEnhancedStatsModal();
    } else {
      showStatsModal();
    }
  });
  
  document.getElementById('closeStatsBtn').addEventListener('click', () => {
    hideStatsModal();
  });
  
  // 点击弹窗外部关闭
  document.getElementById('statsModal').addEventListener('click', (e) => {
    if (e.target.id === 'statsModal') {
      hideStatsModal();
    }
  });
  
  // 增强统计模态框关闭
  document.getElementById('enhancedStatsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'enhancedStatsModal') {
      hideEnhancedStatsModal();
    }
  });
}

// ==================== 学习时长跟踪 ====================

let sessionStartTime = null;
let durationUpdateInterval = null;

// StatsManager 定义在 app-enhanced.js（本文件之后加载），因此只能在【调用时】
// 通过 window 解析——绝不能在解析期用 typeof 判断。
function startSessionTracking() {
  sessionStartTime = Date.now();

  // 每分钟把学习时长记到“当前语言”的当日统计上
  durationUpdateInterval = setInterval(() => {
    if (sessionStartTime && window.StatsManager) {
      window.StatsManager.updateDuration(60, getActiveLanguage()); // 增加60秒
    }
  }, 60000); // 每分钟
}

function stopSessionTracking() {
  if (sessionStartTime && window.StatsManager) {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    // 只补记不足一分钟的尾巴，避免和上面的定时器重复累加
    const remainder = duration % 60;
    if (remainder > 0) window.StatsManager.updateDuration(remainder, getActiveLanguage());
    sessionStartTime = null;
  }

  if (durationUpdateInterval) {
    clearInterval(durationUpdateInterval);
    durationUpdateInterval = null;
  }
}

// ==================== 集成 SM-2 算法到测验模式 ====================
//
// 这里原本有两段 `if (typeof StatsManager !== 'undefined' && typeof
// SpacedRepetition !== 'undefined') { ... }` 包裹的 MultipleChoice / Spelling
// 包装器。StatsManager 和 SpacedRepetition 是 app-enhanced.js 里的顶层 const，
// 而 app-enhanced.js 在本文件【之后】加载 —— 于是这两个 typeof 在本文件执行时
// 永远是 'undefined'，两个包装器从来没有安装过：整个间隔重复系统（SRS）
// 从上线起就是死代码，dimenticato_daily_stats 里除了 duration 之外全是 0。
//
// 现在这些包装器统一由 app-enhanced.js 安装（那时两个模块都已存在，并且一律通过
// window.* 在调用时解析），四种语言都会接入。本文件不再做任何解析期 typeof 判断。

MultipleChoice.loadQuestion = function() {
  if (AppState.quizIndex >= AppState.currentWords.length) {
    this.showCompletion();
    return;
  }
  
  AppState.currentWord = AppState.currentWords[AppState.quizIndex];
  this.questionStartTime = Date.now(); // 记录开始时间
  
  // 更新进度
  document.getElementById('mcCurrentWord').textContent = AppState.quizIndex + 1;
  document.getElementById('mcTotalWords').textContent = AppState.currentWords.length;
  updateSessionFill('mcSessionFill', AppState.quizIndex, AppState.currentWords.length);

  // 更新正确率
  const accuracy = AppState.quizTotal > 0
    ? Math.round((AppState.quizCorrect / AppState.quizTotal) * 100)
    : 0;
  document.getElementById('mcAccuracy').textContent = accuracy + '%';
  
    // 题面跟着出题方向走：正向显示意大利语单词，反向显示释义
    const mcEngine = this._getEngine();
    document.getElementById('mcItalianWord').textContent =
      mcEngine.questionTextFor(AppState.currentWord);
    mcEngine.applyDirectionLabels(
      { question: 'mcQuestionLabel', options: 'mcOptionsLabel' },
      { question: '意大利语单词', options: '选择正确的英语翻译' },
      { question: '英语释义', options: '选择正确的意大利语单词' }
    );

    // 自动朗读意大利语单词（反向模式题面是释义，朗读词形等于报答案）
    if (mcEngine.shouldSpeakQuestion()) {
      setTimeout(() => {
        italianSpeaker.speak(AppState.currentWord.italian, true);
      }, 300); // 稍微延迟一下，让界面先更新
    }
  
  // 处理中文提示 - 默认隐藏，显示"显示提示"按钮
  const chineseHint = document.getElementById('mcChineseHint');
  const showHintBtn = document.getElementById('mcShowHintBtn');
  
  if (AppState.currentWord.chinese) {
    // 有中文翻译时，显示提示按钮，隐藏中文
    chineseHint.textContent = `中文: ${AppState.currentWord.chinese}`;
    chineseHint.classList.add('hidden');
    showHintBtn.classList.remove('hidden');
  } else {
    // 没有中文翻译时，隐藏按钮和中文
    chineseHint.classList.add('hidden');
    showHintBtn.classList.add('hidden');
  }
  
  // 显示 notes（如果存在）
  this.displayNotes();
  
  // 生成选项
  this.generateOptions();
  
  // 隐藏反馈
  document.getElementById('mcFeedback').classList.add('hidden');
};

// （Spelling 的 SM-2 包装器同样移到 app-enhanced.js，原因见上。）

// ==================== 单词本卡片添加管理按钮 ====================

const originalRenderWordbookCards = WordbookManager.renderWordbookCards;
WordbookManager.renderWordbookCards = function() {
  const container = document.getElementById('wordbookCards');
  
  if (AppState.customWordbooks.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 1rem;">还没有导入任何单词本</p>';
    return;
  }
  
  container.innerHTML = AppState.customWordbooks.map(wb => `
    <div class="card wordbook-card" data-wordbook-id="${wb.id}">
      <button class="wordbook-card-manage-btn" onclick="event.stopPropagation(); if(typeof WordbookEditor !== 'undefined') { WordbookEditor.openEditor(${wb.id}); } else { alert('单词本编辑功能未加载'); }" title="管理单词本"><span class="msr">settings</span></button>
      <button class="wordbook-delete-btn" onclick="event.stopPropagation(); WordbookManager.deleteWordbook(${wb.id})" title="删除">×</button>
      <span class="card-chip"><span class="msr">bookmark</span></span>
      <span class="card-title">${escapeHtml(wb.name)}</span>
      <span class="card-desc">${wb.wordCount} 词 · ${new Date(wb.createdAt).toLocaleDateString()}</span>
    </div>
  `).join('');
  
  // 绑定点击事件
  container.querySelectorAll('.wordbook-card').forEach(card => {
    card.addEventListener('click', () => {
      const wordbookId = parseInt(card.dataset.wordbookId);
      this.selectWordbook(wordbookId);
    });
  });
};

// ==================== 语言门户（多语言切换 + 颜色主题） ====================

const LanguagePortal = {
  // 每种语言对应的首屏
  HOME_SCREENS: {
    italian: 'welcomeScreen',
    german:  'germanWelcomeScreen',
    english: 'englishWelcomeScreen',
    french:  'frenchWelcomeScreen'
  },

  /**
   * 切换到指定语言：
   * 1. 设置 body[data-language] → 触发 CSS 颜色主题
   * 2. 持久化到 localStorage
   * 3. 更新侧边栏弹出层的 active 状态
   * 4. 导航到对应语言首屏
   */
  selectLanguage(lang) {
    const validLangs = ['italian', 'german', 'english', 'french'];
    if (!validLangs.includes(lang)) return;

    // 0. 该语言的词库是按需加载的，首次切过去时要先等数据到位再跳屏，
    //    否则会先闪一屏「0 个词」的空壳。已加载过则同步走完，无额外开销。
    const loader = window.LangLoader;
    if (loader && !loader.isLoaded(lang)) {
      loader.ensure(lang).then(() => this.selectLanguage(lang));
      return;
    }

    // 1. 设置 body 属性 → CSS per-language color theme 生效
    if (lang === 'italian') {
      // 意大利语是默认主题，移除 data-language 属性让 CSS 回落到默认值
      document.body.removeAttribute('data-language');
    } else {
      document.body.setAttribute('data-language', lang);
    }

    // 2. 持久化
    localStorage.setItem(Storage.KEYS.LANGUAGE, lang);

    // 3. 更新弹出层 active 样式 + 侧栏语言胶囊
    document.querySelectorAll('.language-switcher-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.language === lang);
    });
    if (typeof syncLangPills === 'function') syncLangPills(lang);

    // 4. 关闭弹出层
    const popover = document.getElementById('languageSwitcherPopover');
    if (popover) popover.classList.add('hidden');

    // 5. 跳转到对应语言首屏
    // 切换语言是顶层上下文切换（等同于回到 Home），重置导航历史，
    // 避免跨语言的历史污染（例如从德语切回意大利语后，返回栈仍残留德语屏幕）。
    const targetScreen = this.HOME_SCREENS[lang] || 'welcomeScreen';
    AppState.navigationStack = [targetScreen];
    showScreen(targetScreen, { skipHistory: true });
    // 顶栏统计胶囊改用统一的 HeaderStats（四种语言都刷新，不再只有法语）
    HeaderStats.refresh(lang);
  },

  /**
   * 初始化：仅从 localStorage 恢复颜色主题和 active 状态。
   * UI 事件绑定（弹出层开关、语言选项点击）由 german-app.js 的
   * bindLanguageSwitcher() 统一负责，避免重复绑定冲突。
   */
  init() {
    // 恢复上次选择的语言（仅恢复 CSS 颜色主题，不触发导航跳转）
    const savedLang = localStorage.getItem(Storage.KEYS.LANGUAGE) || 'italian';
    if (savedLang === 'italian') {
      document.body.removeAttribute('data-language');
    } else {
      document.body.setAttribute('data-language', savedLang);
    }
    // 同步弹出层 active 状态 + 侧栏语言胶囊
    document.querySelectorAll('.language-switcher-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.language === savedLang);
    });
    if (typeof syncLangPills === 'function') syncLangPills(savedLang);
  }
};

// 暴露到全局，方便外部脚本调用
window.LanguagePortal = LanguagePortal;

// 其它脚本（app-enhanced.js 及各语言模块）一律通过 window.* 在【调用时】解析这些
// 符号，绝不在解析期用裸 typeof 判断 —— 那正是 SRS 整套功能从未安装的根因。
window.AppState = AppState;
window.ScreenMeta = ScreenMeta;
window.Storage = Storage;
window.WordbookManager = WordbookManager;
window.MultipleChoice = MultipleChoice;
window.Spelling = Spelling;
window.updateHeaderStats = updateHeaderStats;
window.countMasteredInCurrentWords = countMasteredInCurrentWords;
window.getActiveLanguage = getActiveLanguage;
window.getWordbookProgressKey = getWordbookProgressKey;
window.navigateSection = navigateSection;

// ==================== 侧边栏 / 顶栏 控制 ====================

function getActiveLanguage() {
  return document.body.getAttribute('data-language') || 'italian';
}

// 更新侧栏语言胶囊的选中态
function syncLangPills(lang) {
  const active = lang || getActiveLanguage();
  document.querySelectorAll('.lang-pill[data-language]').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.language === active);
  });
}

// 更新侧栏底部“主题切换”按钮的图标 + 文案
function syncThemeToggleUI(theme) {
  const t = theme || document.documentElement.getAttribute('data-theme') || 'light';
  const dark = t === 'dark';
  const icon = document.getElementById('themeToggleIcon');
  const label = document.getElementById('themeToggleLabel');
  if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
  if (label) label.textContent = dark ? '浅色模式' : '深色模式';
}
window.syncThemeToggleUI = syncThemeToggleUI;
window.syncLangPills = syncLangPills;

// 侧栏菜单：section → 各语言首页；子模块复用各语言 welcome 卡片按钮的处理器
const NAV_HOME_SCREEN = {
  italian: 'welcomeScreen',
  german: 'germanWelcomeScreen',
  english: 'englishWelcomeScreen',
  french: 'frenchWelcomeScreen'
};
const NAV_MODULE_BTN = {
  vocab:    { italian: 'goVocabularyBtn', german: 'goGermanVocabularyBtn', english: 'goEnglishVocabularyBtn', french: 'goFrenchVocabularyBtn' },
  grammar:  { italian: 'goGrammarBtn',    german: 'goGermanGrammarBtn',    english: 'goEnglishGrammarBtn', french: 'goFrenchGrammarBtn' },
  progress: { italian: 'goProgressBtn',   german: 'goGermanProgressBtn',   english: 'goEnglishProgressBtn', french: 'goFrenchProgressBtn' },
  settings: { italian: 'goSettingsBtn',   german: 'goGermanSettingsBtn',   english: 'goEnglishSettingsBtn', french: 'goFrenchSettingsBtn' }
};

function navigateSection(section) {
  const lang = getActiveLanguage();
  // 跨语言总览（GlobalHome 由 app-enhanced.js 在运行时注入并暴露到 window）
  if (section === 'overview') {
    if (window.GlobalHome && typeof window.GlobalHome.show === 'function') {
      window.GlobalHome.show();
    } else {
      showScreen(NAV_HOME_SCREEN[lang] || 'welcomeScreen');
    }
    return;
  }
  if (section === 'home') {
    showScreen(NAV_HOME_SCREEN[lang] || 'welcomeScreen');
    return;
  }
  const btnId = NAV_MODULE_BTN[section] && NAV_MODULE_BTN[section][lang];
  const btn = btnId && document.getElementById(btnId);
  if (btn) {
    btn.click();               // reuse the exact per-language handler
  } else {
    // fallback: direct navigation to the Italian screen for this section
    const targets = { vocab: 'vocabularyScreen', grammar: 'grammarScreen', progress: 'progressScreen', settings: 'settingsScreen' };
    if (targets[section]) showScreen(targets[section]);
  }
}

function closeDrawer() { document.body.classList.remove('drawer-open'); }

// 在侧栏顶部补一个“Overview（全部语言）”入口。
// 用 :not 判断保证幂等——如果别的脚本已经放了同一个 section，就不再重复注入。
function ensureOverviewNavItem() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  if (nav.querySelector('.nav-item[data-section="overview"]')) return;
  const first = nav.querySelector('.nav-item[data-section]');
  const html =
    '<button class="nav-item" data-section="overview" id="navOverviewBtn">' +
    '<span class="msr">language</span>Overview</button>';
  if (first) {
    first.insertAdjacentHTML('beforebegin', html);
  } else {
    nav.insertAdjacentHTML('afterbegin', html);
  }
}

function bindShellControls() {
  ensureOverviewNavItem();

  // 品牌 → 当前语言首页
  document.getElementById('brandHomeBtn')?.addEventListener('click', () => {
    navigateSection('home');
    closeDrawer();
  });

  // 侧栏菜单项（语言感知）
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
      navigateSection(item.dataset.section);
      closeDrawer();
    });
  });

  // 语言胶囊 → 切换语言
  document.querySelectorAll('.lang-pill[data-language]').forEach(pill => {
    pill.addEventListener('click', () => {
      LanguagePortal.selectLanguage(pill.dataset.language);
      syncLangPills(pill.dataset.language);
      closeDrawer();
    });
  });

  // 窄屏抽屉开关
  document.getElementById('drawerToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('drawer-open');
  });
  document.getElementById('drawerScrim')?.addEventListener('click', closeDrawer);

  // 初始同步
  syncLangPills();
  syncThemeToggleUI();
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  // 把旧版无语言段的词本进度 key 迁到带语言的新 key（老用户不丢进度）
  DimStorage.migrateLegacyWordbookProgress();

  bindEvents();
  bindShellControls();
  loadVocabulary();
  setPracticeContext('vocab');
  updateHeaderNavigation('welcomeScreen');
  updateMobileBackButton('welcomeScreen');

  // 初始化语言门户（恢复颜色主题 + 绑定切换事件）
  LanguagePortal.init();
  syncThemeToggleUI();
  
  // 渲染自定义单词本卡片
  WordbookManager.renderWordbookCards();
  
  // 开始会话跟踪
  startSessionTracking();
  
  // 页面卸载时停止跟踪
  window.addEventListener('beforeunload', () => {
    stopSessionTracking();
  });
});
