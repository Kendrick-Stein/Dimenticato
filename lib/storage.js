/**
 * Storage core: the single localStorage gateway (DimStorage), per-language
 * key names and the migration of every older key layout.  Loaded before every
 * module that persists anything.
 */

// ==================== 跨语言存储核心 (DimStorage) ====================
//
// 全站唯一的 localStorage 出入口。三条不可违反的规则：
//   1. 永远不调用 localStorage.clear()（会连主题、自定义词本一起抹掉）
//   2. 导出必须覆盖全部四种语言 + 自定义词本 + 每个词本的进度 + 主题
//   3. 覆盖导入只写它真正要恢复的 key，绝不裸删它不打算恢复的 key
//
// Key 方案（storage v3）：凡是属于某一种语言的数据，一律
//
//     dimenticato_<code>_<name>          code = it / de / en / fr
//
// 由 DimStorage.key(lang, name) 生成（lang 传 code 或旧的 key 'italian' 都行）。
// 核心名字：mastered / stats / daily_stats / srs / mastery_streak / wb_<id> /
// prefs / quiz_difficulty / quiz_direction。各功能模块自己的 key（变位课程、
// 同源词、课程等级、打字纪录）由模块自己用 DimStorage.key 生成并迁移
// （DimStorage.moveKey 负责“并入新 key、写成功才删旧 key”）。
// 与语言无关的全局 key 保持原名：theme / language / custom_wordbooks /
// quiz_difficulty / quiz_direction / storage_version。
//
// 旧布局（意大利语无前缀、其余语言 dimenticato_<german>_…、
// dimenticato_daily_stats_<german>、dimenticato_progress_wb_<german>_<id> …）
// 由 LegacyMigration.migrateStorage 在本文件加载时一次性并入新 key，
// 导入旧备份时走同一个 migrateKeys。合并/重置用到的纯函数都挂在对象上，
// 便于用 node 单独测试（见 tests/test-storage.js）。

const DimStorage = {
  PREFIX: 'dimenticato_',
  EXPORT_VERSION: '2.0',
  /** localStorage 布局版本；LegacyMigration.migrateStorage 跑完后写入。 */
  STORAGE_VERSION: '3',
  VERSION_KEY: 'dimenticato_storage_version',
  // 语言清单只在 lib/languages.js 里维护（LANGS 是旧的语言 key，界面用它做选项）
  LANGS: window.Languages.keys.slice(),
  CODES: window.Languages.codes.slice(),

  LANGUAGE_LABELS: window.Languages.byKeyMap(p => p.cn),

  // 全局偏好 / 用户内容 —— 任何“重置进度”都必须保留
  PRESERVED_KEYS: [
    'dimenticato_theme',
    'dimenticato_language',
    'dimenticato_quiz_difficulty',
    'dimenticato_quiz_direction',
    'dimenticato_custom_wordbooks',
    'dimenticato_storage_version'
  ],
  // 每种语言下属于“偏好”而非进度的名字，重置时同样保留
  PRESERVED_NAMES: ['prefs', 'quiz_difficulty', 'quiz_direction'],

  // 每种语言“属于学习进度”的核心 key（wb_* 与模块 key 由 keysForScope 按前缀枚举）。
  // mastery_streak 是“连续答对”计数，重置进度时必须一起清掉，
  // 否则残留的 streak 会让下一次答对立刻把词标成已掌握。
  PROGRESS_NAMES: ['mastered', 'stats', 'daily_stats', 'srs', 'mastery_streak'],

  // ---------- key 方案 ----------

  /** 'italian' / 'it' → 'it'。不传时取当前语言；不认识的值原样返回。 */
  code(lang) {
    const L = window.Languages;
    if (!lang) {
      const active = typeof window.getActiveLanguage === 'function' ? window.getActiveLanguage() : null;
      return L.code(active) || L.DEFAULT;
    }
    return L.code(lang) || String(lang);
  },

  /** 语言数据的唯一 key 生成器：key('german', 'srs') → 'dimenticato_de_srs'。 */
  key(lang, name) {
    return `${this.PREFIX}${this.code(lang)}_${name}`;
  },

  /** 'dimenticato_de_wb_12' → { code: 'de', name: 'wb_12' }；不是语言 key 时返回 null。 */
  parseKey(key) {
    const m = /^dimenticato_([a-z]{2})_(.+)$/.exec(String(key || ''));
    if (!m || this.CODES.indexOf(m[1]) === -1) return null;
    return { code: m[1], name: m[2] };
  },

  masteredKey(lang) { return this.key(lang, 'mastered'); },
  statsKey(lang) { return this.key(lang, 'stats'); },
  dailyStatsKey(lang) { return this.key(lang, 'daily_stats'); },
  srsKey(lang) { return this.key(lang, 'srs'); },
  wordbookKey(lang, id) { return this.key(lang, `wb_${id}`); },

  /** 某语言全部 key 的公共前缀：'dimenticato_de_' */
  prefixFor(lang) {
    return `${this.PREFIX}${this.code(lang)}_`;
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

  /**
   * 给各模块迁移自己的旧 key 用：把 oldKey 的值并进 newKey，写成功后才删 oldKey。
   * merge(existing, incoming) 缺省按 key 形状合并（mergeValueForKey），对不认识的
   * 形状保留 newKey 已有的值。返回是否删掉了 oldKey。
   */
  moveKey(oldKey, newKey, merge) {
    if (oldKey === newKey) return false;
    const incoming = localStorage.getItem(oldKey);
    if (incoming === null) return false;
    const existing = localStorage.getItem(newKey);
    const value = existing === null
      ? incoming
      : (merge ? merge(existing, incoming) : this.mergeValueForKey(newKey, existing, incoming));
    if (value !== existing && !this.safeSetItem(newKey, value)) return false;
    localStorage.removeItem(oldKey);
    return true;
  },

  _nameOf(key) {
    const parsed = this.parseKey(key);
    return parsed ? parsed.name : null;
  },

  // 丢掉 30 天以前的每日统计，为进度数据腾出空间
  _pruneDailyStats() {
    let pruned = false;
    const cutoff = localDay(new Date(Date.now() - 30 * 864e5));
    this.allKeys()
      .filter(key => this._nameOf(key) === 'daily_stats')
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

  // ---------- 快照 / 导出 ----------

  snapshot() {
    const keys = {};
    this.allKeys().forEach(key => {
      const value = localStorage.getItem(key);
      if (typeof value === 'string') keys[key] = value;
    });
    return keys;
  },

  // 全语言、带版本号的导出载荷。`keys` 是权威数据（含各模块的 dimenticato_<code>_*）；
  // `data` 是 1.0 兼容层，让旧版本的 Dimenticato 仍然能读出意大利语部分。
  exportAll() {
    const keys = this.snapshot();
    delete keys[this.VERSION_KEY];
    const wordbooks = this.safeParse(keys['dimenticato_custom_wordbooks'], []) || [];
    const wordbookProgress = {};
    if (Array.isArray(wordbooks)) {
      wordbooks.forEach(wb => {
        if (!wb || wb.id === undefined) return;
        const value = keys[this.wordbookKey(wb.language || window.Languages.DEFAULT, wb.id)];
        if (value) wordbookProgress[wb.id] = value;
      });
    }

    return {
      version: this.EXPORT_VERSION,
      storageVersion: this.STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      exportedFrom: 'Dimenticato',
      languages: this.LANGS.slice(),
      keys,
      // ---- 1.0 兼容层（意大利语） ----
      data: {
        masteredWords: keys[this.masteredKey('it')] || '[]',
        stats: keys[this.statsKey('it')] || '{}',
        level: keys['dimenticato_level'] || '1000',
        theme: keys['dimenticato_theme'] || 'light',
        customWordbooks: keys['dimenticato_custom_wordbooks'] || '[]',
        dailyStats: keys[this.dailyStatsKey('it')] || '{}',
        wordbookProgress
      }
    };
  },

  // 导出摘要（给导入前的确认框用）
  describePayload(payload) {
    const keys = this.normalizePayload(payload);
    const counts = { languages: [], wordbooks: 0, keys: Object.keys(keys).length };
    this.LANGS.forEach(lang => {
      const mastered = this.safeParse(keys[this.masteredKey(lang)], []) || [];
      if (Array.isArray(mastered) && mastered.length) {
        counts.languages.push(`${this.LANGUAGE_LABELS[lang]} ${mastered.length} 词`);
      }
    });
    const wordbooks = this.safeParse(keys['dimenticato_custom_wordbooks'], []) || [];
    counts.wordbooks = Array.isArray(wordbooks) ? wordbooks.length : 0;
    return counts;
  },

  // ---------- 导入 ----------

  /**
   * 把 1.0 / 2.0 两种载荷统一成 { key: rawString } 的纯对象，并把旧布局的 key
   * 迁移到 v3（纯函数，可单测）。
   */
  normalizePayload(payload) {
    const keys = {};
    if (!payload || typeof payload !== 'object') return keys;

    if (payload.keys && typeof payload.keys === 'object') {
      Object.keys(payload.keys).forEach(key => {
        const value = payload.keys[key];
        if (key.indexOf(this.PREFIX) === 0 && key !== this.VERSION_KEY && typeof value === 'string') keys[key] = value;
      });
      return LegacyMigration.migrateKeys(keys).keys;
    }

    const data = payload.data;
    if (!data || typeof data !== 'object') return keys;

    // 1.0 只有意大利语，字段名对应旧的无前缀 key，交给 migrateKeys 改名
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

    // 1.0 的 wordbookProgress 用的是无语言段的旧 key，migrateKeys 按词本语言补回
    if (data.wordbookProgress && typeof data.wordbookProgress === 'object') {
      Object.keys(data.wordbookProgress).forEach(id => {
        const value = data.wordbookProgress[id];
        if (typeof value === 'string') keys[`dimenticato_progress_wb_${id}`] = value;
      });
    }

    return LegacyMigration.migrateKeys(keys).keys;
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

  // 按日期合并；同一天两边都有时数值字段取 max、wordsLearned 取并集（幂等）
  mergeDailyStats(existing, incoming) {
    const a = this.safeParse(existing, {}) || {};
    const b = this.safeParse(incoming, {}) || {};
    const merged = Object.assign({}, a);
    Object.keys(b).forEach(date => {
      const mine = merged[date];
      const theirs = b[date];
      if (!mine || typeof mine !== 'object') { merged[date] = theirs; return; }
      if (!theirs || typeof theirs !== 'object') return;
      const day = Object.assign({}, theirs, mine);
      Object.keys(theirs).forEach(field => {
        if (typeof mine[field] === 'number' && typeof theirs[field] === 'number') {
          day[field] = Math.max(mine[field], theirs[field]);
        }
      });
      if (Array.isArray(mine.wordsLearned) || Array.isArray(theirs.wordsLearned)) {
        day.wordsLearned = [...new Set([].concat(mine.wordsLearned || [], theirs.wordsLearned || []))];
      }
      merged[date] = day;
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

  // { word: n } 逐词取较大值
  mergeMaxMap(existing, incoming) {
    const a = this.safeParse(existing, {}) || {};
    const b = this.safeParse(incoming, {}) || {};
    if (typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) || Array.isArray(b)) return existing;
    const merged = Object.assign({}, a);
    Object.keys(b).forEach(word => {
      merged[word] = Math.max(Number(merged[word]) || 0, Number(b[word]) || 0);
    });
    return JSON.stringify(merged);
  },

  // 对象逐字段补齐：已有字段保留，缺的从 incoming 补
  mergeFill(existing, incoming) {
    const a = this.safeParse(existing, {}) || {};
    const b = this.safeParse(incoming, {}) || {};
    if (typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) || Array.isArray(b)) return existing;
    return JSON.stringify(Object.assign({}, b, a));
  },

  // 按 key 的形状选择合并策略（纯函数）。旧布局的 key 按它迁移后的名字处理。
  mergeValueForKey(key, existing, incoming) {
    if (existing === null || existing === undefined) return incoming;
    if (incoming === null || incoming === undefined) return existing;
    if (key === 'dimenticato_custom_wordbooks') return this.mergeWordbooks(existing, incoming);
    let name = this._nameOf(key);
    if (!name) {
      const legacy = LegacyMigration.targetFor(key, {});
      name = legacy ? this._nameOf(legacy.target) : null;
    }
    if (!name) return existing;
    if (name === 'mastered' || name.indexOf('wb_') === 0) return this.mergeArrayUnion(existing, incoming);
    if (name === 'stats') return this.mergeCounters(existing, incoming);
    if (name === 'daily_stats') return this.mergeDailyStats(existing, incoming);
    if (name === 'srs') return this.mergeSrsStore(existing, incoming);
    if (name === 'mastery_streak') return this.mergeMaxMap(existing, incoming);
    if (name === 'prefs') return this.mergeFill(existing, incoming);
    // 其它 key（难度、模块进度…）保留现有值
    return existing;
  },

  /**
   * 导入。
   * mode 'overwrite'：逐 key 覆盖写入 —— 只写载荷里真正存在的 key，
   *                   绝不裸删（也就不会像旧实现那样连带清空另外三种语言）。
   * mode 'merge'    ：按 key 形状合并（已掌握取并集、计数取较大值、每日统计按日期合并）。
   * 旧版备份里的旧布局 key 先经 LegacyMigration.migrateKeys 改名再写。
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

  // scope: 'all' 或任一语言（code / 旧 key 均可）（纯函数，可单测）
  keysForScope(scope, allKeys) {
    const codes = scope === 'all' ? this.CODES : [this.code(scope)];
    const targets = new Set();
    const wordbookLang = LegacyMigration._wordbookLanguages(
      this.safeParse(localStorage.getItem('dimenticato_custom_wordbooks'), []));
    const keep = name => this.PRESERVED_NAMES.indexOf(name) !== -1;
    codes.forEach(code => {
      this.PROGRESS_NAMES.forEach(name => targets.add(this.key(code, name)));
      allKeys.forEach(key => {
        // v3：该语言下除偏好外的一切（含各模块用 DimStorage.key 写的进度）
        const parsed = this.parseKey(key);
        if (parsed) {
          if (parsed.code === code && !keep(parsed.name)) targets.add(key);
          return;
        }
        // 尚未迁移的旧布局核心 key
        const legacy = LegacyMigration.targetFor(key, { wordbookLang });
        if (legacy) {
          const t = this.parseKey(legacy.target);
          if (t && t.code === code && !keep(t.name)) targets.add(key);
          return;
        }
        // 各模块尚未迁移的旧 key
        if (LegacyMigration.moduleKeyLanguage(key) === code) targets.add(key);
      });
    });
    // 偏好设置与自定义词本内容永不删除
    this.PRESERVED_KEYS.forEach(key => targets.delete(key));
    return [...targets];
  },

  reset(options = {}) {
    const scope = options.scope && (options.scope === 'all' || window.Languages.has(options.scope))
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
// 等级 / 每轮题量 / 浏览筛选 / 当前词汇来源，存在 dimenticato_<code>_prefs。
// 属于偏好而非进度，重置进度时保留。

const Prefs = {
  NAME: 'prefs',
  DEFAULTS: { level: 'A2', session: '20', filter: 'all', source: 'system' },

  _read(lang) {
    const saved = DimStorage.safeParse(localStorage.getItem(DimStorage.key(lang, this.NAME)), {});
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  },

  get(lang) {
    return Object.assign({}, this.DEFAULTS, this._read(lang));
  },

  set(lang, patch) {
    const next = Object.assign({}, this._read(lang), patch);
    DimStorage.safeSetItem(DimStorage.key(lang, this.NAME), JSON.stringify(next));
    return next;
  }
};

window.Prefs = Prefs;

// ==================== 旧版存储迁移 ====================
//
// 两层：
//   · migrateKeys / migrateStorage —— 只改 key 名（不需要词库）。把 storage v1/v2
//     的各种布局并进 dimenticato_<code>_<name>：
//       dimenticato_mastered / _stats / _daily_stats（意大利语无前缀）
//       dimenticato_<german>_mastered / _<german>_stats
//       dimenticato_daily_stats_<german> / srs_<german> / mastery_streak_<german>
//       dimenticato_progress_wb_<german>_<id> 与更早的 dimenticato_progress_wb_<id>
//       dimenticato_german_sr / english_sr / french_srs（旧 SM-2）
//       dimenticato_french_daily（旧法语每日记录，转成 StatsManager 格式）
//       dimenticato_prefs（一个 key 装四种语言 → 拆成每语言一个）
//       dimenticato_quiz_{difficulty,direction}_<german>
//     同一个新 key 有多个来源时按 mergeValueForKey 合并，绝不覆盖；旧 key 只在
//     新 key 写入成功后删除。跑完写 dimenticato_storage_version = 3。
//   · run(lang) —— 需要词库：把 entry 的旧标识改写成 entry.word：
//       德语 de-03000（entry.legacyId）、改了拼写的词头（entry.legacyWord，
//       如英语 york → York）、法语旧词头、丢了重音的键……
//     作用于已掌握 / SM-2 / 连续答对 / 词本进度；新旧两条都在时合并（SM-2 取最近
//     复习的一条，连对取大，列表去重）。它依赖词库内容而不是存储布局，所以不挂
//     版本标记：每次加载语言都跑，幂等（已是 entry.word 的键原样不动），
//     导入旧备份后也会再跑一次。
//     词本自己的词形优先：词本里写的就是 'york'，它的进度就留在 'york'。
//
// 规则：幂等；解析不出的旧键原样保留，绝不因为词库变化丢用户记录。

const LegacyMigration = {
  _langPattern(withCodes) {
    const L = window.Languages;
    return (withCodes ? L.keys.concat(L.codes) : L.keys).join('|');
  },

  _wordbookLanguages(wordbooks) {
    const out = {};
    if (Array.isArray(wordbooks)) {
      wordbooks.forEach(wb => {
        if (wb && wb.id !== undefined) out[String(wb.id)] = wb.language || window.Languages.DEFAULT;
      });
    }
    return out;
  },

  /**
   * 旧布局 key → { target, convert? }；不是旧布局时返回 null（纯函数）。
   * ctx.wordbookLang：{ id: lang }，给无语言段的 progress_wb_<id> 定语言。
   */
  targetFor(key, ctx) {
    if (typeof key !== 'string' || key.indexOf(DimStorage.PREFIX) !== 0) return null;
    if (DimStorage.parseKey(key)) return null;   // 已经是 v3
    const K = this._langPattern(false);
    const KC = this._langPattern(true);
    const to = (lang, name, convert) => ({ target: DimStorage.key(lang, name), convert });
    let m;

    switch (key) {
      case 'dimenticato_mastered': return to('it', 'mastered');
      case 'dimenticato_stats': return to('it', 'stats');
      case 'dimenticato_daily_stats': return to('it', 'daily_stats');
      case 'dimenticato_french_daily': return to('fr', 'daily_stats', raw => this._convertFrenchDaily(raw));
      default: break;
    }
    if ((m = new RegExp(`^dimenticato_(${K})_(mastered|stats)$`).exec(key))) return to(m[1], m[2]);
    if ((m = new RegExp(`^dimenticato_(${K})_srs?$`).exec(key))) return to(m[1], 'srs');
    if ((m = new RegExp(`^dimenticato_daily_stats_(${KC})$`).exec(key))) return to(m[1], 'daily_stats');
    if ((m = new RegExp(`^dimenticato_srs_(${KC})$`).exec(key))) return to(m[1], 'srs');
    if ((m = new RegExp(`^dimenticato_mastery_streak_(${KC})$`).exec(key))) return to(m[1], 'mastery_streak');
    if ((m = new RegExp(`^dimenticato_quiz_(difficulty|direction)_(${KC})$`).exec(key))) return to(m[2], `quiz_${m[1]}`);
    if ((m = new RegExp(`^dimenticato_progress_wb_(${KC})_(.+)$`).exec(key))) return to(m[1], `wb_${m[2]}`);
    if ((m = /^dimenticato_progress_wb_(.+)$/.exec(key))) {
      const lang = (ctx && ctx.wordbookLang && ctx.wordbookLang[m[1]]) || window.Languages.DEFAULT;
      return to(lang, `wb_${m[1]}`);
    }
    return null;
  },

  /**
   * 功能模块（变位 / 同源词 / 课程 / 打字）key 所属的语言 code；不是则 null。
   * 新旧写法都认（dimenticato_<模块>_<code>、旧的 _<key> 后缀、dimenticato_<key>_ 前缀），
   * 这些 key 由各模块自己迁移，这里只用于 reset 时别把它们漏掉。
   */
  moduleKeyLanguage(key) {
    const L = window.Languages;
    const KC = this._langPattern(true);
    if (key === 'dimenticato_conjugation_lessons' || key === 'dimenticato_cognate_progress') return 'it';
    let m = new RegExp(`^dimenticato_(?:conjugation_lessons|cognate_progress)_(${KC})$`).exec(key);
    if (m) return L.code(m[1]);
    m = new RegExp(`^dimenticato_typing_best_(${KC})_`).exec(key);
    if (m) return L.code(m[1]);
    m = new RegExp(`^dimenticato_(${KC})_course_level$`).exec(key);
    if (m) return L.code(m[1]);
    // 通用规则：模块 key 以语言结尾（dimenticato_cognate_progress_de、
    // dimenticato_conjugation_lessons_fr、dimenticato_course_level_de …）
    // 或以旧语言 key 开头（dimenticato_german_…）都算该语言
    m = new RegExp(`^dimenticato_.+_(${KC})$`).exec(key);
    if (m) return L.code(m[1]);
    m = new RegExp(`^dimenticato_(${this._langPattern(false)})_.+`).exec(key);
    if (m) return L.code(m[1]);
    return null;
  },

  // dimenticato_french_daily 的 { date: { durationMs, words, correctCount, totalCount } }
  // → StatsManager 的 { date: { date, duration(秒), wordsLearned, … } }
  _convertFrenchDaily(raw) {
    const old = DimStorage.safeParse(raw, {}) || {};
    const out = {};
    Object.keys(old).forEach(date => {
      const day = old[date] || {};
      out[date] = {
        date,
        duration: Math.round((Number(day.durationMs) || 0) / 1000),
        wordsLearned: Array.isArray(day.words) ? day.words.map(String) : [],
        correctCount: Number(day.correctCount) || 0,
        totalCount: Number(day.totalCount) || 0,
        reviewCount: 0
      };
    });
    return JSON.stringify(out);
  },

  // dimenticato_prefs = { italian: {...}, german: {...} } → 每语言一份
  _splitPrefs(raw) {
    const all = DimStorage.safeParse(raw, {}) || {};
    const out = {};
    if (typeof all !== 'object' || Array.isArray(all)) return out;
    Object.keys(all).forEach(lang => {
      if (!window.Languages.has(lang) || !all[lang] || typeof all[lang] !== 'object') return;
      out[DimStorage.key(lang, 'prefs')] = JSON.stringify(all[lang]);
    });
    return out;
  },

  /**
   * 纯函数：{ key: raw } → { keys: 迁移后的 map, moved: { 旧 key: [新 key…] } }。
   * map 里已经存在的 v3 key 优先，旧来源依次并入（mergeValueForKey）。
   * opts.wordbooks：查词本语言时的备用清单（map 里没有 custom_wordbooks 时）。
   */
  migrateKeys(map, opts = {}) {
    const keys = Object.assign({}, map);
    const moved = {};
    const wordbooks = DimStorage.safeParse(keys['dimenticato_custom_wordbooks'], null) || opts.wordbooks || [];
    const ctx = { wordbookLang: this._wordbookLanguages(wordbooks) };
    const put = (target, value) => {
      keys[target] = DimStorage.mergeValueForKey(target, keys[target], value);
    };

    Object.keys(map).sort().forEach(key => {
      const raw = map[key];
      if (typeof raw !== 'string') return;
      if (key === 'dimenticato_prefs') {
        const split = this._splitPrefs(raw);
        Object.keys(split).forEach(target => put(target, split[target]));
        moved[key] = Object.keys(split);
        delete keys[key];
        return;
      }
      const hit = this.targetFor(key, ctx);
      if (!hit) return;
      put(hit.target, hit.convert ? hit.convert(raw) : raw);
      moved[key] = [hit.target];
      delete keys[key];
    });
    return { keys, moved };
  },

  /**
   * 把 localStorage 里的旧布局迁到 v3。由版本标记保护，只在第一次（或 force）时跑。
   * 先写新 key，写成功后才删除对应的旧 key；任何一步失败都不写版本标记，
   * 下次加载重试。返回 { ran, moved, failed }。
   */
  migrateStorage(options = {}) {
    if (!options.force && localStorage.getItem(DimStorage.VERSION_KEY) === DimStorage.STORAGE_VERSION) {
      return { ran: false, moved: 0, failed: 0 };
    }
    const before = DimStorage.snapshot();
    const result = this.migrateKeys(before);
    let failed = 0;
    const ok = {};
    Object.keys(result.keys).forEach(key => {
      const value = result.keys[key];
      if (value === before[key]) { ok[key] = true; return; }
      if (DimStorage.safeSetItem(key, value)) ok[key] = true;
      else failed++;
    });
    let moved = 0;
    Object.keys(result.moved).forEach(oldKey => {
      if (result.moved[oldKey].every(target => ok[target])) {
        localStorage.removeItem(oldKey);
        moved++;
      }
    });
    if (!failed && localStorage.getItem(DimStorage.VERSION_KEY) !== DimStorage.STORAGE_VERSION) {
      DimStorage.safeSetItem(DimStorage.VERSION_KEY, DimStorage.STORAGE_VERSION);
    }
    return { ran: true, moved, failed };
  },

  // ---------- 词条标识改写（需要词库） ----------

  _resolve(lang, key) {
    const resolved = window.Vocab ? window.Vocab.resolveLegacyKey(lang, key) : '';
    return resolved || String(key);
  },

  _read(key, fallback) {
    return DimStorage.safeParse(localStorage.getItem(key), fallback);
  },

  /** 这门语言所有个人词本里出现的词形（这些键属于词本，不改写成系统词头）。 */
  _wordbookWords(lang, wbId) {
    // 直接读存储（不用 Wordbooks 的内存缓存：导入备份后缓存可能还是旧的）
    const W = window.Wordbooks;
    const words = new Set();
    const raw = this._read('dimenticato_custom_wordbooks', []);
    if (!Array.isArray(raw)) return words;
    const code = DimStorage.code(lang);
    raw.map(wb => (W && W.normalizeBook ? W.normalizeBook(wb) : wb)).forEach(wb => {
      if (!wb || DimStorage.code(wb.language || window.Languages.DEFAULT) !== code) return;
      if (wbId != null && String(wb.id) !== String(wbId)) return;
      (wb.words || []).forEach(row => { if (row && row.word) words.add(String(row.word)); });
    });
    return words;
  },

  /** keep 里的键原样保留；其余键解析到 entry.word，再优先落回 keep 里同一词条的词形。 */
  _resolver(lang, keep) {
    if (!keep || !keep.size) return key => this._resolve(lang, key);
    const canon = new Map();
    keep.forEach(word => {
      const c = this._resolve(lang, word);
      if (!canon.has(c)) canon.set(c, word);
    });
    return key => {
      if (keep.has(key)) return key;
      const c = this._resolve(lang, key);
      return canon.get(c) || c;
    };
  },

  _rekeyList(lang, list, resolve) {
    if (!Array.isArray(list)) return null;
    resolve = resolve || (key => this._resolve(lang, key));
    const out = [...new Set(list.map(key => resolve(key)))];
    const changed = out.length !== list.length || out.some((key, i) => key !== list[i]);
    return changed ? out : null;
  },

  _rekeyObject(lang, obj, pick, resolve) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    resolve = resolve || (key => this._resolve(lang, key));
    let changed = false;
    const out = {};
    Object.keys(obj).forEach(key => {
      const target = resolve(key);
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
    // 旧布局的 key（刚导入的旧备份、或别的标签页里的旧版本写的）先改名
    this.migrateStorage({ force: true });
    let changed = 0;
    const write = (key, value) => {
      const ok = DimStorage.safeSetItem(key, JSON.stringify(value)) !== false;
      if (ok) changed++;
      return ok;
    };

    // 1. 已掌握：系统词库 + 各词本（词本进度按该词本自己的词形存）
    const sysKey = DimStorage.masteredKey(lang);
    const sys = this._rekeyList(lang, this._read(sysKey, null));
    if (sys) write(sysKey, sys);
    const wbPrefix = DimStorage.key(lang, 'wb_');
    DimStorage.allKeys().filter(key => key.indexOf(wbPrefix) === 0).forEach(key => {
      const resolve = this._resolver(lang, this._wordbookWords(lang, key.slice(wbPrefix.length)));
      const rekeyed = this._rekeyList(lang, this._read(key, null), resolve);
      if (rekeyed) write(key, rekeyed);
    });

    // 2. SM-2 与 3. 连续答对：一门语言一份，系统词条和词本词条共用；
    //    词本里出现的词形原样保留（旧的 _sr / _srs 已在 migrateStorage 并入）
    const shared = this._resolver(lang, this._wordbookWords(lang));
    const srsKey = DimStorage.srsKey(lang);
    const srs = this._rekeyObject(lang, this._read(srsKey, null), (a, b) => this._laterReview(a, b), shared);
    if (srs) write(srsKey, srs);

    const streakKey = DimStorage.key(lang, 'mastery_streak');
    const streaks = this._rekeyObject(lang, this._read(streakKey, null),
      (a, b) => Math.max(Number(a) || 0, Number(b) || 0), shared);
    if (streaks) write(streakKey, streaks);

    // 4. 法语旧每日记录里的词是旧词头，改写成 entry.word
    if (DimStorage.code(lang) === 'fr') {
      const dailyKey = DimStorage.dailyStatsKey(lang);
      const daily = this._read(dailyKey, null);
      if (daily && typeof daily === 'object') {
        let dirty = false;
        Object.keys(daily).forEach(date => {
          const rekeyed = this._rekeyList(lang, daily[date] && daily[date].wordsLearned);
          if (rekeyed) { daily[date].wordsLearned = rekeyed; dirty = true; }
        });
        if (dirty) write(dailyKey, daily);
      }
    }

    return { lang, changed };
  }
};

window.LegacyMigration = LegacyMigration;

// 加载即迁移：后面的 srs / app / 各模块读到的一定是 v3 布局
try {
  LegacyMigration.migrateStorage();
} catch (e) {
  console.error('存储迁移失败（旧数据原样保留，下次加载重试）:', e);
}
