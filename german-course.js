/**
 * GermanCourse — A1-C1 guided course route backed by the existing German
 * vocabulary and practice engines.
 */
(function () {
  'use strict';

  const LEVEL_KEY = 'dimenticato_german_course_level';

  // ── 课程语法标签 → 语法书章节 ──────────────────────────────────────────────
  // 课程数据里有 144 个语法标签，德语语法书只有 27 个条目 slug。下面把标签映射
  // 到最贴近的章节：先查精确覆盖表，再按关键词规则（自上而下，先匹配先生效）。
  // 映射不到的标签仍然作为纯文本展示，不会渲染成可点击的 chip。
  const GRAMMAR_SLUG_OVERRIDES = {
    '同义转述': '句法/句法',
    '句中时间/原因/情态/地点成分': '句法/句法',
    '对立/选择/情态从句': '句法/句法',
    '名词/动词/形容词介词搭配': '介词/介词',
    '语气小品词': '句法/句法',
    '属格文学表达': '冠词/冠词'
  };

  const GRAMMAR_SLUG_RULES = [
    [/Konjunktiv|虚拟语气|间接引语|转述|要求句|Imperativ/, '动词/叙述方式'],
    [/Partizip|分词/, '动词/分词'],
    [/Infinitiv|不定式|um \.\.\. zu|ohne zu|brauchen \+ zu/, '动词/不定式'],
    [/被动|[Pp]assiv/, '动词/行动方式'],
    [/可分|前缀/, '动词/动词前缀'],
    [/Präsens|Präteritum|Perfekt|Plusquamperfekt|Futur|时态|变位/, '动词/变位'],
    [/情态|dürfen|können|müssen|wollen|mögen|sollen|sollte|brauchen|wissen|werden|haben|sein\b/, '动词/动词'],
    [/n-Deklination|弱变化/, '名词/阳性弱变化'],
    [/词尾/, '形容词/形容词变格'],
    [/名词化|名词|单复数|复数|同位语/, '名词/名词'],
    [/形容词|Adjektive|比较级|最高级/, '形容词/形容词'],
    [/代副词/, '副词/副词'],
    [/冠词|kein|welch-/, '冠词/冠词'],
    [/代词|einander|man\b|es 的功能/, '代词/代词'],
    [/副词|Adverbien/, '副词/副词'],
    [/介词 auf 与 in|介词辨析/, '介词/介词辨析'],
    [/Dativ 介词|Genitiv 介词|双向介词|mit \+ Dativ|für\/ohne|trotz|während\/wegen|支配格/, '介词/介词支配格'],
    [/介词/, '介词/介词'],
    [/Akkusativ|Dativ|Genitiv|属格/, '冠词/冠词'],
    [/连词|连接词|连接副词|二项连接|成对连词|并列连词|连续|让步/, '连词/连词'],
    [/dass|weil|obwohl|nachdem|damit|bevor|seit|während|als\/wenn|wenn|je \.\.\. desto|ohne dass|条件|finale/, '连词/连词'],
    [/从句|句|语序|语体|文本|衔接|结构|论证|定义|表达|搭配|功能|成分|Modalsätze/, '句法/句法'],
    [/动词/, '动词/动词'],
    [/数词/, '数词/数词'],
    [/发音/, '其他/发音']
  ];

  function grammarSlugFor(tag) {
    const key = String(tag || '').trim();
    if (!key) return '';
    if (GRAMMAR_SLUG_OVERRIDES[key]) return GRAMMAR_SLUG_OVERRIDES[key];
    const rule = GRAMMAR_SLUG_RULES.find((entry) => entry[0].test(key));
    return rule ? rule[1] : '';
  }

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
    grammarSlugs: null,

    init() {
      if (typeof GERMAN_COURSE_DATA === 'undefined') {
        this.showUnavailable('data/german-course-data.js 未能载入，课程路线暂不可用。');
        return;
      }
      // 词库没就绪时，课程屏只会渲染出一堆“0 个核心词”的空壳。与其静默降级，
      // 不如把原因说清楚，并且不再绑定会失败的交互。
      if (!window.GermanApp || !window.GermanApp.ready) {
        this.showUnavailable('德语词库尚未加载，课程核心词练习暂不可用。请刷新页面重试。');
        return;
      }
      const savedLevel = localStorage.getItem(LEVEL_KEY);
      if (GERMAN_COURSE_DATA.levels.some((level) => level.id === savedLevel)) {
        this.activeLevelId = savedLevel;
      }
      this.bindEvents();
      this.watchScreen();
      this.render();
    },

    showUnavailable(message) {
      const summary = document.getElementById('germanCourseLevelSummary');
      if (summary) {
        summary.innerHTML = `
          <div class="settings-card-title">课程暂不可用</div>
          <div class="about-body">${escapeHtml(message)}</div>
        `;
      }
      const entry = document.getElementById('goGermanCourseBtn');
      if (entry) {
        entry.disabled = true;
        entry.title = message;
      }
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
      const unitCards = document.getElementById('germanCourseUnitCards');
      unitCards?.addEventListener('click', (event) => {
        // 语法标签在单元卡片内部，必须先于卡片本身处理。
        const grammarChip = event.target.closest('[data-german-grammar-slug]');
        if (grammarChip) {
          this.openGrammarTopic(grammarChip.dataset.germanGrammarSlug);
          return;
        }
        const card = event.target.closest('[data-german-course-unit]');
        if (card) this.openUnit(card.dataset.germanCourseUnit);
      });
      // 单元卡片现在是 div[role=button]（里面嵌了真正的 <button> 语法标签，
      // button 不能嵌套 button），键盘可达性要自己补上。
      unitCards?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target.closest('[data-german-grammar-slug]')) return;
        const card = event.target.closest('[data-german-course-unit]');
        if (!card) return;
        event.preventDefault();
        this.openUnit(card.dataset.germanCourseUnit);
      });
      document.getElementById('germanCourseLevelSummary')?.addEventListener('click', (event) => {
        if (event.target.closest('#germanCoursePracticeLevelBtn')) this.openLevelPractice();
      });
    },

    // 已掌握数只在 init / open / selectLevel 时算过一次，从练习返回课程屏
    // （走的是全局 goBack，不经过 open()）时显示的还是旧数字。监听屏幕的
    // active 状态，每次显示都重算。
    watchScreen() {
      const screen = document.getElementById('germanCourseScreen');
      if (!screen || typeof MutationObserver === 'undefined') return;
      const observer = new MutationObserver(() => {
        if (screen.classList.contains('active')) this.render();
      });
      observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
    },

    // 语法书里真实存在的 slug 集合：映射不到的标签不渲染成可点击 chip。
    availableGrammarSlugs() {
      if (this.grammarSlugs) return this.grammarSlugs;
      const slugs = new Set();
      const data = typeof GERMAN_GRAMMAR_DATA !== 'undefined' ? GERMAN_GRAMMAR_DATA : null;
      const parts = data && data.tree && Array.isArray(data.tree.parts) ? data.tree.parts : [];
      parts.forEach((part) => {
        (part.chapters || []).forEach((chapter) => {
          (chapter.topics || []).forEach((topic) => {
            if (topic && topic.slug) slugs.add(topic.slug);
          });
        });
      });
      this.grammarSlugs = slugs;
      return slugs;
    },

    resolveGrammarTag(tag) {
      const slug = grammarSlugFor(tag);
      return slug && this.availableGrammarSlugs().has(slug) ? slug : '';
    },

    openGrammarTopic(slug) {
      if (!slug || typeof window.GermanApp?.openGermanGrammarBook !== 'function') return;
      window.GermanApp.openGermanGrammarBook(slug);
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

    // 课程进度必须读系统词库的掌握集合：GermanApp.mastered 在选了个人词本
    // 之后会被整个换掉，直接用它会把词本的进度当成课程进度。
    getSystemMastered() {
      try {
        return new Set(JSON.parse(localStorage.getItem('dimenticato_german_mastered') || '[]'));
      } catch (error) {
        return new Set();
      }
    },

    masteredKey(word) {
      if (typeof window.GermanApp?.masteredKey === 'function') {
        return window.GermanApp.masteredKey(word);
      }
      return word ? word.german : '';
    },

    countMastered(words, mastered) {
      return words.filter((word) => mastered.has(this.masteredKey(word))).length;
    },

    renderGrammarTags(unit) {
      const linked = [];
      const plain = [];
      (unit.grammar || []).forEach((tag) => {
        const slug = this.resolveGrammarTag(tag);
        if (slug) linked.push({ tag, slug });
        else plain.push(tag);
      });

      let html = '';
      if (linked.length) {
        html += `<span class="chips wrap">${linked.map((item) => `
          <button class="chip" type="button" title="在语法书中查看" data-german-grammar-slug="${escapeAttribute(item.slug)}">${escapeHtml(item.tag)}</button>
        `).join('')}</span>`;
      }
      if (plain.length) {
        html += `<span class="card-desc">语法：${escapeHtml(plain.join(' · '))}</span>`;
      }
      return html;
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
      const levelMastered = this.countMastered(levelWords, mastered);
      const summary = document.getElementById('germanCourseLevelSummary');
      if (summary) {
        // .settings-card 自身没有内边距，正文必须整块放进 .about-body，
        // 否则说明文字和按钮会直接贴在卡片边缘上。
        summary.innerHTML = `
          <div class="settings-card-title">${escapeHtml(level.id)} · ${escapeHtml(level.title)} / ${escapeHtml(level.chineseTitle)}</div>
          <div class="about-body">
            ${escapeHtml(level.description)}
            <div class="about-note" style="margin-top:12px">${level.units.length} 个单元 · ${levelWords.length} 个去重核心词 · 已掌握 ${levelMastered}</div>
            <button class="primary-btn" id="germanCoursePracticeLevelBtn" type="button">练习 ${escapeHtml(level.id)} 全级别核心词</button>
          </div>
        `;
      }

      const unitsTitle = document.getElementById('germanCourseUnitsTitle');
      const unitsHint = document.getElementById('germanCourseUnitsHint');
      if (unitsTitle) unitsTitle.textContent = `${level.id} 课程单元`;
      if (unitsHint) unitsHint.textContent = '点击任一单元开始其核心词汇练习，或点击语法标签跳到语法书对应章节。';

      const container = document.getElementById('germanCourseUnitCards');
      if (!container) return;
      container.innerHTML = level.units.map((unit) => {
        const words = this.getUnitWords(unit);
        const masteredCount = this.countMastered(words, mastered);
        // 卡片用 div[role=button]：语法标签本身是 <button>，而 HTML 不允许
        // button 嵌套 button（解析器会把外层 button 提前闭合，卡片直接裂开）。
        return `
          <div class="card" role="button" tabindex="0" style="cursor:pointer" data-german-course-unit="${escapeAttribute(unit.id)}">
            <span class="card-chip"><span class="msr">school</span></span>
            <span class="card-title">Lektion ${unit.number} · ${escapeHtml(unit.title)}</span>
            <span class="card-desc">${escapeHtml(unit.summary)}</span>
            ${this.renderGrammarTags(unit)}
            <span class="card-desc">${words.length} 个核心词 · 已掌握 ${masteredCount}</span>
          </div>
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
