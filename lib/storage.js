/**
 * Storage core: the single localStorage gateway (DimStorage), per-language
 * key names and the one-time migration of progress written by the old
 * per-language apps.  Loaded before every module that persists anything.
 */

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

// 意大利语是最早的语言，沿用无后缀的历史 key；其余语言按 key/code 拼出来。
// 这些名字是既有存档的格式，改了会让老用户的进度“消失”。
function progressKeysFor(profile) {
  const lang = profile.key;
  const legacy = lang === window.Languages.DEFAULT_KEY;
  const keys = [
    legacy ? 'dimenticato_mastered' : `dimenticato_${lang}_mastered`,
    legacy ? 'dimenticato_stats' : `dimenticato_${lang}_stats`,
    legacy ? 'dimenticato_daily_stats' : `dimenticato_daily_stats_${lang}`,
    legacy ? 'dimenticato_conjugation_lessons' : `dimenticato_conjugation_lessons_${profile.code}`,
    `dimenticato_srs_${lang}`,
    `dimenticato_mastery_streak_${lang}`
  ];
  if (legacy) keys.push('dimenticato_cognate_progress');
  if (profile.modules && profile.modules.course) keys.push(`dimenticato_${lang}_course_level`);
  return keys;
}

const DimStorage = {
  PREFIX: 'dimenticato_',
  EXPORT_VERSION: '2.0',
  // 语言清单只在 lib/languages.js 里维护
  LANGS: window.Languages.keys.slice(),

  LANGUAGE_LABELS: window.Languages.byKeyMap(p => p.cn),

  // 偏好设置 / 用户内容 —— 任何“重置进度”都必须保留
  PRESERVED_KEYS: [
    'dimenticato_theme',
    'dimenticato_language',
    'dimenticato_quiz_difficulty',
    'dimenticato_custom_wordbooks',
    'dimenticato_prefs'
  ],

  // 每种语言“属于学习进度”的固定 key（动态的 progress_wb_* 另行枚举），由 progressKeysFor 按语言生成。
  // dimenticato_mastery_streak_* 是“连续答对”计数，重置进度时必须一起清掉，
  // 否则重置后残留的 streak 会让下一次答对立刻把词标成已掌握。
  PROGRESS_KEYS: window.Languages.byKeyMap(progressKeysFor),

  // 已掌握 / 计数器的 key：意大利语沿用无前缀的历史 key
  masteredKey(lang) {
    return lang && lang !== 'italian' ? `dimenticato_${lang}_mastered` : 'dimenticato_mastered';
  },

  statsKey(lang) {
    return lang && lang !== 'italian' ? `dimenticato_${lang}_stats` : 'dimenticato_stats';
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
    const cutoff = localDay(new Date(Date.now() - 30 * 864e5));
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
        // 取较大值而不是相加：同一份备份重复合并导入不能让计数翻倍（幂等）。
        // 各字段独立取 max 仍满足「答对 ≤ 答题」。
        merged[field] = Math.max(av, bv);
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
      targets.add(`dimenticato_cognate_progress_${lang}`);
      allKeys.forEach(key => {
        if (key.indexOf(wbPrefix) === 0) targets.add(key);
        if (key.indexOf(`dimenticato_typing_best_${lang}_`) === 0) targets.add(key);
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

// ==================== 界面偏好（按语言） ====================
//
// 等级 / 每轮题量 / 浏览筛选 / 当前词汇来源。统一放在一个 key 里，
// 属于偏好而非进度，重置进度时保留。

const Prefs = {
  KEY: 'dimenticato_prefs',
  DEFAULTS: { level: 'A2', session: '20', filter: 'all', source: 'system' },

  _all() {
    const all = DimStorage.safeParse(localStorage.getItem(this.KEY), {});
    return all && typeof all === 'object' ? all : {};
  },

  get(lang) {
    return Object.assign({}, this.DEFAULTS, this._all()[lang] || {});
  },

  set(lang, patch) {
    const all = this._all();
    all[lang] = Object.assign({}, all[lang] || {}, patch);
    DimStorage.safeSetItem(this.KEY, JSON.stringify(all));
    return all[lang];
  }
};

window.Prefs = Prefs;

// ==================== 旧版进度迁移 ====================
//
// 统一运行时之前，德 / 英 / 法各有一套自己的存储：
//   · 德语已掌握记录用的是词条 id（de-03000），法语用改写前的教材词头；
//   · 德 / 英的 SM-2 计划在 dimenticato_<lang>_sr，法语在 dimenticato_french_srs，
//     法语的每日记录在 dimenticato_french_daily。
// 现在四种语言都以 entry.word 为唯一键，SM-2 统一在 dimenticato_srs_<lang>，
// 每日记录统一在 StatsManager 的 key。这里把旧数据并进新 key。
//
// 规则：幂等（每次加载语言都可以跑，导入旧备份后再跑一次即可）；解析不出的
// 旧键原样保留，绝不因为词库变化丢用户记录；旧 key 只在并入成功后才删除。

const LegacyMigration = {
  LEGACY_SRS: {
    german: ['dimenticato_german_sr'],
    english: ['dimenticato_english_sr'],
    french: ['dimenticato_french_srs']
  },
  LEGACY_DAILY: { french: 'dimenticato_french_daily' },

  _resolve(lang, key) {
    const resolved = window.Vocab ? window.Vocab.resolveLegacyKey(lang, key) : '';
    return resolved || String(key);
  },

  _read(key, fallback) {
    return DimStorage.safeParse(localStorage.getItem(key), fallback);
  },

  _rekeyList(lang, list) {
    if (!Array.isArray(list)) return null;
    const out = [...new Set(list.map(key => this._resolve(lang, key)))];
    const changed = out.length !== list.length || out.some((key, i) => key !== list[i]);
    return changed ? out : null;
  },

  _rekeyObject(lang, obj, pick) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    let changed = false;
    const out = {};
    Object.keys(obj).forEach(key => {
      const target = this._resolve(lang, key);
      if (target !== key) changed = true;
      out[target] = key in out ? pick(out[target], obj[key]) : obj[key];
    });
    return changed ? out : null;
  },

  _laterReview(a, b) {
    return ((b && b.lastReviewDate) || '') > ((a && a.lastReviewDate) || '') ? b : a;
  },

  /** Rewrites every progress key of one language to entry.word.  Needs Vocab loaded. */
  run(lang) {
    if (!lang || !window.Vocab || !window.Vocab.ready(lang)) return { lang, changed: 0 };
    let changed = 0;
    const write = (key, value) => {
      const ok = DimStorage.safeSetItem(key, JSON.stringify(value)) !== false;
      if (ok) changed++;
      return ok;
    };

    // 1. 已掌握：系统词库 + 各词本（词本词条也按词形存）
    const listKeys = [DimStorage.masteredKey(lang)].concat(
      DimStorage.allKeys().filter(key => key.indexOf(`dimenticato_progress_wb_${lang}_`) === 0));
    listKeys.forEach(key => {
      const rekeyed = this._rekeyList(lang, this._read(key, null));
      if (rekeyed) write(key, rekeyed);
    });

    // 2. SM-2：先把旧 key 并进 dimenticato_srs_<lang>，再统一改键
    const srsKey = `dimenticato_srs_${lang}`;
    let srs = this._read(srsKey, {}) || {};
    let srsDirty = false;
    const legacySrs = (this.LEGACY_SRS[lang] || []).filter(key => localStorage.getItem(key) !== null);
    legacySrs.forEach(key => {
      const old = this._read(key, {}) || {};
      Object.keys(old).forEach(word => {
        srs[word] = srs[word] ? this._laterReview(srs[word], old[word]) : old[word];
      });
      srsDirty = true;
    });
    const rekeyedSrs = this._rekeyObject(lang, srs, (a, b) => this._laterReview(a, b));
    if (rekeyedSrs) { srs = rekeyedSrs; srsDirty = true; }
    if (srsDirty && write(srsKey, srs)) {
      legacySrs.forEach(key => localStorage.removeItem(key));
    }

    // 3. 连续答对计数
    const streakKey = `dimenticato_mastery_streak_${lang}`;
    const streaks = this._rekeyObject(lang, this._read(streakKey, null), (a, b) => Math.max(Number(a) || 0, Number(b) || 0));
    if (streaks) write(streakKey, streaks);

    // 4. 法语旧的每日记录 → StatsManager 格式，按日期补齐（已有的日期不覆盖）
    const legacyDaily = this.LEGACY_DAILY[lang];
    if (legacyDaily && localStorage.getItem(legacyDaily) !== null) {
      const dailyKey = lang === 'italian' ? 'dimenticato_daily_stats' : `dimenticato_daily_stats_${lang}`;
      const daily = this._read(dailyKey, {}) || {};
      const old = this._read(legacyDaily, {}) || {};
      Object.keys(old).forEach(date => {
        if (daily[date]) return;
        const day = old[date] || {};
        daily[date] = {
          date,
          duration: Math.round((Number(day.durationMs) || 0) / 1000),
          wordsLearned: (Array.isArray(day.words) ? day.words : []).map(key => this._resolve(lang, key)),
          correctCount: Number(day.correctCount) || 0,
          totalCount: Number(day.totalCount) || 0,
          reviewCount: 0
        };
      });
      if (write(dailyKey, daily)) localStorage.removeItem(legacyDaily);
    }

    return { lang, changed };
  }
};

window.LegacyMigration = LegacyMigration;
