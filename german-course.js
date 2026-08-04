/**
 * GermanCourse — A1-C1 guided course route backed by the existing German
 * vocabulary and practice engines.
 */
(function () {
  'use strict';

  const LEVEL_KEY = 'dimenticato_german_course_level';

  function installGermanCourseScreens() {
    const homeGrid = document.querySelector('#germanWelcomeScreen .card-grid');
    const vocabularyCard = document.getElementById('goGermanVocabularyBtn');
    if (homeGrid && vocabularyCard && !document.getElementById('goGermanCourseBtn')) {
      vocabularyCard.insertAdjacentHTML('afterend', `
        <button class="card" id="goGermanCourseBtn">
          <span class="card-chip"><span class="msr">route</span></span>
          <span class="card-title">Kursplan A1-C1</span>
          <span class="card-desc">54 个教材主题、语法重点与核心词汇练习</span>
        </button>
      `);
    }

    if (document.getElementById('germanCourseScreen')) return;
    const anchor = document.getElementById('germanVocabularyScreen');
    if (!anchor) return;
    anchor.insertAdjacentHTML('beforebegin', `
      <section id="germanCourseScreen" class="screen">
        <div class="container">
          <button class="back-link" id="germanCourseBackBtn"><span class="msr">arrow_back</span>返回 German Home</button>
          <div class="eyebrow">German / Kursplan</div>
          <h1 class="page">A1-C1 德语课程路线</h1>
          <p class="desc">按教材主题选择课程，查看对应语法重点，并用现有词库练习核心词汇。</p>

          <div class="chips" id="germanCourseLevelChips" aria-label="选择德语课程级别"></div>
          <div class="settings-card" id="germanCourseLevelSummary"></div>

          <div class="section-head-row">
            <div>
              <div class="sub-label" id="germanCourseUnitsTitle">课程单元</div>
              <span class="card-desc" id="germanCourseUnitsHint"></span>
            </div>
          </div>
          <div class="card-grid cols-2" id="germanCourseUnitCards"></div>

          <div class="panel" style="margin-top:16px">
            <div class="panel-title">课程范围说明</div>
            <div class="about-note">课程顺序参考本地《走遍德国》A1-B1、《Mittelpunkt》B2-C1 与中高级词汇练习资料的目录范围。主题说明、语法标签和核心词选择均为本应用重新整理；网页不包含教材扫描页。</div>
          </div>
        </div>
      </section>
    `);
  }

  installGermanCourseScreens();

  const GermanCourse = {
    activeLevelId: 'A1',
    wordIndex: null,

    init() {
      if (typeof GERMAN_COURSE_DATA === 'undefined' || !window.GermanApp) return;
      const savedLevel = localStorage.getItem(LEVEL_KEY);
      if (GERMAN_COURSE_DATA.levels.some((level) => level.id === savedLevel)) {
        this.activeLevelId = savedLevel;
      }
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      document.getElementById('goGermanCourseBtn')?.addEventListener('click', () => this.open());
      document.getElementById('germanCourseBackBtn')?.addEventListener('click', () => {
        window.GermanApp.goBack('germanWelcomeScreen');
      });
      document.getElementById('germanCourseLevelChips')?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-german-course-level]');
        if (button) this.selectLevel(button.dataset.germanCourseLevel);
      });
      document.getElementById('germanCourseUnitCards')?.addEventListener('click', (event) => {
        const card = event.target.closest('[data-german-course-unit]');
        if (card) this.openUnit(card.dataset.germanCourseUnit);
      });
      document.getElementById('germanCourseLevelSummary')?.addEventListener('click', (event) => {
        if (event.target.closest('#germanCoursePracticeLevelBtn')) this.openLevelPractice();
      });
    },

    open() {
      this.wordIndex = null;
      this.render();
      window.GermanApp.showScreen('germanCourseScreen');
    },

    selectLevel(levelId) {
      if (!GERMAN_COURSE_DATA.levels.some((level) => level.id === levelId)) return;
      this.activeLevelId = levelId;
      localStorage.setItem(LEVEL_KEY, levelId);
      this.render();
    },

    getActiveLevel() {
      return GERMAN_COURSE_DATA.levels.find((level) => level.id === this.activeLevelId)
        || GERMAN_COURSE_DATA.levels[0];
    },

    getSystemWords() {
      if (Array.isArray(window.GermanApp.systemWords) && window.GermanApp.systemWords.length) {
        return window.GermanApp.systemWords;
      }
      return typeof GERMAN_VOCABULARY_DATA !== 'undefined' ? GERMAN_VOCABULARY_DATA : [];
    },

    normalize(value) {
      return String(value || '')
        .normalize('NFKC')
        .toLocaleLowerCase('de-DE')
        .replace(/\//g, '')
        .trim();
    },

    buildWordIndex() {
      if (this.wordIndex) return this.wordIndex;
      const index = new Map();
      this.getSystemWords().forEach((word) => {
        [word.german, word.display].filter(Boolean).forEach((value) => {
          const key = this.normalize(value);
          if (key && !index.has(key)) index.set(key, word);
        });
      });
      this.wordIndex = index;
      return index;
    },

    resolveHeadwords(headwords) {
      const index = this.buildWordIndex();
      const seen = new Set();
      return headwords.map((headword) => index.get(this.normalize(headword))).filter((word) => {
        if (!word || seen.has(word.german)) return false;
        seen.add(word.german);
        return true;
      });
    },

    getUnitWords(unit) {
      return this.resolveHeadwords(unit.headwords);
    },

    getLevelWords(level) {
      const seen = new Set();
      return level.units.flatMap((unit) => this.getUnitWords(unit)).filter((word) => {
        if (seen.has(word.german)) return false;
        seen.add(word.german);
        return true;
      });
    },

    getSystemMastered() {
      try {
        return new Set(JSON.parse(localStorage.getItem('dimenticato_german_mastered') || '[]'));
      } catch (error) {
        return new Set();
      }
    },

    render() {
      const level = this.getActiveLevel();
      if (!level) return;
      const chips = document.getElementById('germanCourseLevelChips');
      if (chips) {
        chips.innerHTML = GERMAN_COURSE_DATA.levels.map((item) => `
          <button class="chip${item.id === level.id ? ' active' : ''}" type="button" data-german-course-level="${item.id}">${item.id}</button>
        `).join('');
      }

      const mastered = this.getSystemMastered();
      const levelWords = this.getLevelWords(level);
      const levelMastered = levelWords.filter((word) => mastered.has(word.german)).length;
      const summary = document.getElementById('germanCourseLevelSummary');
      if (summary) {
        summary.innerHTML = `
          <div class="settings-card-title">${escapeHtml(level.id)} · ${escapeHtml(level.title)} / ${escapeHtml(level.chineseTitle)}</div>
          <div class="about-body">${escapeHtml(level.description)}</div>
          <div class="about-note" style="margin-top:12px">${level.units.length} 个单元 · ${levelWords.length} 个去重核心词 · 已掌握 ${levelMastered}</div>
          <button class="primary-btn" id="germanCoursePracticeLevelBtn" type="button" style="margin-top:16px">练习 ${escapeHtml(level.id)} 全级别核心词</button>
        `;
      }

      const unitsTitle = document.getElementById('germanCourseUnitsTitle');
      const unitsHint = document.getElementById('germanCourseUnitsHint');
      if (unitsTitle) unitsTitle.textContent = `${level.id} 课程单元`;
      if (unitsHint) unitsHint.textContent = '点击任一单元开始其核心词汇练习。';

      const container = document.getElementById('germanCourseUnitCards');
      if (!container) return;
      container.innerHTML = level.units.map((unit) => {
        const words = this.getUnitWords(unit);
        const masteredCount = words.filter((word) => mastered.has(word.german)).length;
        const grammar = unit.grammar.join(' · ');
        return `
          <button class="card" type="button" data-german-course-unit="${escapeAttribute(unit.id)}">
            <span class="card-chip"><span class="msr">school</span></span>
            <span class="card-title">Lektion ${unit.number} · ${escapeHtml(unit.title)}</span>
            <span class="card-desc">${escapeHtml(unit.summary)}</span>
            <span class="card-desc">语法：${escapeHtml(grammar)}</span>
            <span class="card-desc">${words.length} 个核心词 · 已掌握 ${masteredCount}</span>
          </button>
        `;
      }).join('');
    },

    openUnit(unitId) {
      const level = this.getActiveLevel();
      const unit = level?.units.find((item) => item.id === unitId);
      if (!unit) return;
      const words = this.getUnitWords(unit);
      window.GermanApp.selectCourseVocabulary({
        label: `${level.id} · Lektion ${unit.number} · ${unit.title}`,
        words
      });
    },

    openLevelPractice() {
      const level = this.getActiveLevel();
      if (!level) return;
      window.GermanApp.selectCourseVocabulary({
        label: `${level.id} · ${level.title}`,
        words: this.getLevelWords(level)
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GermanCourse.init());
  } else {
    GermanCourse.init();
  }

  window.GermanCourse = GermanCourse;
})();
