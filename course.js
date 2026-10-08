/**
 * Course — 课程路线（course/1，docs/data-schema.md），任何在 lib/languages.js 里
 * 配了 files.course 的语言都能用，本文件没有按语言的分支。
 *
 * 数据：LangLoader.data(code, 'course')，二级懒加载，open() 负责补拉。
 *   unit.words   —— 词库里的 `word`，直接按 word 查 Vocab.entries(code)
 *   unit.grammar —— [{label, slug}]，slug 是语法书 grammar/1 slug（旧 slug 经
 *                   GrammarBook.resolveSlug 走 meta.aliases 也能解析）
 * 入口卡片由 App 渲染，路由 #/<code>/course 调 Course.open(code)。
 * 屏幕 DOM 是 index.html 里静态的 <section id="courseScreen">。
 */
(function () {
  'use strict';

  const LEVEL_PREFIX = 'dimenticato_course_level_';
  // 改成按语言代码存之前，德语课程级别存在这个 key 里
  const LEGACY_LEVEL_KEYS = { de: 'dimenticato_german_course_level' };

  const esc = (s) => window.escapeHtml(s == null ? '' : String(s));
  const escAttr = (s) => window.escapeAttribute(s == null ? '' : String(s));
  const $ = (id) => document.getElementById(id);

  function codeOf(lang) {
    return window.Languages.code(lang) || window.Languages.DEFAULT;
  }

  function levelKey(code) { return LEVEL_PREFIX + code; }

  function readLevel(code) {
    try {
      const key = levelKey(code);
      let value = localStorage.getItem(key);
      const legacy = LEGACY_LEVEL_KEYS[code];
      if (value == null && legacy) {
        value = localStorage.getItem(legacy);
        if (value != null) {
          localStorage.setItem(key, value);
          localStorage.removeItem(legacy);
        }
      }
      return value;
    } catch (e) {
      return null;
    }
  }

  const Course = {
    code: null,
    activeLevelId: null,
    wordIndex: null,
    wordIndexCode: null,
    bound: false,

    data(module) {
      const loader = window.LangLoader;
      return loader && this.code ? loader.data(this.code, module) : null;
    },

    init() {
      if (this.bound || !$('courseScreen')) return;
      this.bound = true;
      this.bindEvents();
      this.watchScreen();
    },

    open(lang) {
      this.init();
      const code = codeOf(lang || (window.App && window.App.lang && window.App.lang()));
      if (code !== this.code) {
        this.code = code;
        this.activeLevelId = null;
        this.wordIndex = null;
      }
      const loader = window.LangLoader;
      const missing = (module) => !this.data(module) && loader
        && typeof loader.ensureModule === 'function' && !loader.isModuleLoaded(code, module);
      // 课程数据没到时先不渲染（否则会闪一下「未能载入」）
      if (!missing('course') && this.ensureReady()) this.render();
      if (typeof window.showScreen === 'function') window.showScreen('courseScreen');
      // 语法书没到之前语法标签是纯文本，到了再重渲染成可点 chip
      const pending = ['course', 'grammar'].filter(missing).map((module) => loader.ensureModule(code, module));
      if (pending.length) {
        Promise.all(pending).then(() => {
          if (this.code === code && this.ensureReady()) this.render();
        }, (err) => {
          console.error('[course] 模块数据加载失败', err);
          this.ensureReady();
        });
      }
    },

    // 就绪检查放在每次渲染前；没就绪就把原因说清楚，不渲染一堆「0 个核心词」的空壳。
    ensureReady() {
      const course = this.data('course');
      if (!course || !Array.isArray(course.levels) || !course.levels.length) {
        this.showUnavailable('课程数据未能载入，课程路线暂不可用。');
        return false;
      }
      if (!window.Vocab || !window.Vocab.ready(this.code)) {
        this.showUnavailable('词库尚未加载，课程核心词练习暂不可用。请刷新页面重试。');
        return false;
      }
      if (!this.activeLevelId) {
        const saved = readLevel(this.code);
        this.activeLevelId = course.levels.some((l) => l.id === saved) ? saved : course.levels[0].id;
      }
      return true;
    },

    showUnavailable(message) {
      const summary = $('courseLevelSummary');
      if (summary) {
        summary.innerHTML = `
          <div class="settings-card-title">课程暂不可用</div>
          <div class="about-body">${esc(message)}</div>
        `;
      }
      const cards = $('courseUnitCards');
      if (cards) cards.innerHTML = '';
    },

    bindEvents() {
      $('courseBackBtn')?.addEventListener('click', () => {
        if (typeof window.goBack === 'function') window.goBack({ fallbackTarget: 'homeScreen' });
      });
      $('courseLevelChips')?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-course-level]');
        if (button) this.selectLevel(button.dataset.courseLevel);
      });
      const unitCards = $('courseUnitCards');
      unitCards?.addEventListener('click', (event) => {
        // 语法标签在单元卡片内部，必须先于卡片本身处理。
        const grammarChip = event.target.closest('[data-grammar-slug]');
        if (grammarChip) {
          this.openGrammarTopic(grammarChip.dataset.grammarSlug);
          return;
        }
        const card = event.target.closest('[data-course-unit]');
        if (card) this.openUnit(card.dataset.courseUnit);
      });
      // 卡片里还有语法标签按钮（button 不能嵌套 button），所以键盘/读屏的入口是
      // 卡片标题这个真正的 <button>；鼠标点卡片任意空白处也照样打开（上面的 click）。
      $('courseLevelSummary')?.addEventListener('click', (event) => {
        if (event.target.closest('#coursePracticeLevelBtn')) this.openLevelPractice();
      });
    },

    // 从练习返回课程屏走的是全局 goBack，不经过 open()；监听屏幕的 active 状态，
    // 每次显示都重算已掌握数。
    watchScreen() {
      const screen = $('courseScreen');
      if (!screen || typeof MutationObserver === 'undefined') return;
      const observer = new MutationObserver(() => {
        if (screen.classList.contains('active') && this.code && this.ensureReady()) this.render();
      });
      observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
    },

    // 课程里的 slug → 语法书里真实存在的专题 slug（含旧 slug 经 aliases 解析）。
    // 语法书还没懒加载到、或解析不到时返回 ''，标签按纯文本展示。
    resolveGrammarSlug(slug) {
      const data = this.data('grammar');
      if (!slug || !data || !data.content) return '';
      if (window.GrammarBook && typeof window.GrammarBook.resolveSlug === 'function') {
        return window.GrammarBook.resolveSlug(slug, data) || '';
      }
      return Object.prototype.hasOwnProperty.call(data.content, slug) ? slug : '';
    },

    openGrammarTopic(slug) {
      if (!slug || !window.App || typeof window.App.openGrammarBook !== 'function') return;
      window.App.openGrammarBook(this.code, slug);
    },

    selectLevel(levelId) {
      const course = this.data('course');
      if (!course || !course.levels.some((level) => level.id === levelId)) return;
      this.activeLevelId = levelId;
      try { localStorage.setItem(levelKey(this.code), levelId); } catch (e) { /* 存不了就只在本次会话生效 */ }
      this.render();
    },

    getActiveLevel() {
      const levels = this.data('course').levels;
      return levels.find((level) => level.id === this.activeLevelId) || levels[0];
    },

    buildWordIndex() {
      if (this.wordIndex && this.wordIndexCode === this.code) return this.wordIndex;
      const index = new Map();
      (window.Vocab ? window.Vocab.entries(this.code) : []).forEach((entry) => {
        if (entry && entry.word && !index.has(entry.word)) index.set(entry.word, entry);
      });
      this.wordIndex = index;
      this.wordIndexCode = this.code;
      return index;
    },

    getUnitWords(unit) {
      const index = this.buildWordIndex();
      const seen = new Set();
      return (unit.words || []).map((w) => index.get(w)).filter((entry) => {
        if (!entry || seen.has(entry.word)) return false;
        seen.add(entry.word);
        return true;
      });
    },

    getLevelWords(level) {
      const seen = new Set();
      return level.units.flatMap((unit) => this.getUnitWords(unit)).filter((entry) => {
        if (seen.has(entry.word)) return false;
        seen.add(entry.word);
        return true;
      });
    },

    // 课程进度读系统词库的掌握集合（entry.word），与个人词本无关。
    getMastered() {
      if (!window.App || typeof window.App.masteredWords !== 'function') return new Set();
      return window.App.masteredWords(window.Languages.key(this.code)) || new Set();
    },

    countMastered(words, mastered) {
      return words.filter((entry) => mastered.has(entry.word)).length;
    },

    unitLabel(unit) {
      const label = this.data('course').meta && this.data('course').meta.unitLabel;
      return label ? `${label} ${unit.number}` : `第 ${unit.number} 课`;
    },

    renderGrammarTags(unit) {
      const linked = [];
      const plain = [];
      (unit.grammar || []).forEach((item) => {
        const label = item && item.label;
        if (!label) return;
        const slug = this.resolveGrammarSlug(item.slug);
        if (slug) linked.push({ label, slug });
        else plain.push(label);
      });

      let html = '';
      if (linked.length) {
        html += `<span class="chips wrap">${linked.map((item) => `
          <button class="chip" type="button" title="在语法书中查看" data-grammar-slug="${escAttr(item.slug)}">${esc(item.label)}</button>
        `).join('')}</span>`;
      }
      if (plain.length) {
        html += `<span class="card-desc">语法：${esc(plain.join(' · '))}</span>`;
      }
      return html;
    },

    renderHeader(meta) {
      const langName = window.Languages.label(this.code);
      const set = (id, text) => { const el = $(id); if (el) el.textContent = text; };
      set('courseEyebrow', langName ? `${langName} · 课程路线` : '课程路线');
      set('courseTitle', meta.title || '课程路线');
      set('courseDesc', meta.description || '按教材单元选择课程，查看对应语法重点，并用现有词库练习核心词汇。');
      const panel = $('courseNotePanel');
      if (panel) {
        panel.hidden = !meta.note;
        set('courseNote', meta.note || '');
      }
    },

    render() {
      const course = this.data('course');
      const level = this.getActiveLevel();
      if (!level) return;
      this.renderHeader(course.meta || {});

      const chips = $('courseLevelChips');
      if (chips) {
        chips.innerHTML = course.levels.map((item) => `
          <button class="chip${item.id === level.id ? ' active' : ''}" type="button" data-course-level="${escAttr(item.id)}" aria-pressed="${item.id === level.id}">${esc(item.id)}</button>
        `).join('');
      }

      const mastered = this.getMastered();
      const levelWords = this.getLevelWords(level);
      const levelMastered = this.countMastered(levelWords, mastered);
      const summary = $('courseLevelSummary');
      if (summary) {
        const titles = [level.title, level.zh].filter(Boolean).map(esc).join(' / ');
        // .settings-card 自身没有内边距，正文必须整块放进 .about-body
        summary.innerHTML = `
          <div class="settings-card-title">${esc(level.id)}${titles ? ' · ' + titles : ''}</div>
          <div class="about-body">
            ${esc(level.description || '')}
            <div class="about-note" style="margin-top:12px">${level.units.length} 个单元 · ${levelWords.length} 个去重核心词 · 已掌握 ${levelMastered}</div>
            <button class="primary-btn" id="coursePracticeLevelBtn" type="button">练习 ${esc(level.id)} 全级别核心词</button>
          </div>
        `;
      }

      const unitsTitle = $('courseUnitsTitle');
      const unitsHint = $('courseUnitsHint');
      if (unitsTitle) unitsTitle.textContent = `${level.id} 课程单元`;
      if (unitsHint) unitsHint.textContent = '点击任一单元开始其核心词汇练习，或点击语法标签跳到语法书对应章节。';

      const container = $('courseUnitCards');
      if (!container) return;
      container.innerHTML = level.units.map((unit) => {
        const words = this.getUnitWords(unit);
        const masteredCount = this.countMastered(words, mastered);
        return `
          <div class="card course-unit-card" data-course-unit="${escAttr(unit.id)}">
            <span class="card-chip"><span class="msr" aria-hidden="true">school</span></span>
            <button type="button" class="card-title course-unit-open">${esc(this.unitLabel(unit))} · ${esc(unit.title)}</button>
            <span class="card-desc">${esc(unit.summary || '')}</span>
            ${this.renderGrammarTags(unit)}
            <span class="card-desc">${words.length} 个核心词 · 已掌握 ${masteredCount}</span>
          </div>
        `;
      }).join('');
    },

    openUnit(unitId) {
      const level = this.getActiveLevel();
      const unit = level && level.units.find((item) => item.id === unitId);
      if (!unit || !window.App || typeof window.App.practiceEntries !== 'function') return;
      window.App.practiceEntries(`${level.id} · ${this.unitLabel(unit)} · ${unit.title}`, this.getUnitWords(unit));
    },

    openLevelPractice() {
      const level = this.getActiveLevel();
      if (!level || !window.App || typeof window.App.practiceEntries !== 'function') return;
      window.App.practiceEntries([level.id, level.title].filter(Boolean).join(' · '), this.getLevelWords(level));
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Course.init());
  } else {
    Course.init();
  }

  window.Course = Course;
})();
