/**
 * GermanCourse — A1-C1 guided course route backed by the unified German
 * vocabulary (Vocab.entries('german')) and the App's practice engines.
 * 入口卡片由 App 渲染，直接调用 GermanCourse.open()。
 */
(function () {
  'use strict';

  const LEVEL_KEY = 'dimenticato_german_course_level';

  // ── 课程语法标签 → 语法书章节 ──────────────────────────────────────────────
  // 权威映射表在 data/german-course-data.js 的 GERMAN_COURSE_GRAMMAR_SLUGS 里，
  // 它是跟着语法书一起维护的；这里先查它，两边就不可能再各说各话。
  // 下面的覆盖表 + 关键词规则只是它没有收录的标签的兜底（自上而下，先匹配先生效），
  // 目标章节必须是语法树里真实存在的 slug —— 语法书重建时这里也要跟着改。
  // 映射不到、或映射到的章节不存在的标签，仍然作为纯文本展示，不渲染成可点击的 chip。
  const GRAMMAR_SLUG_OVERRIDES = {
    '同义转述': '其他/其他',
    '句中时间/原因/情态/地点成分': '句法/句法',
    '对立/选择/情态从句': '连词/从属连词总表',
    '名词/动词/形容词介词搭配': '动词/用法模式',
    '语气小品词': '句法/句法',
    '属格文学表达': '名词/名词'
  };

  const GRAMMAR_SLUG_RULES = [
    [/Konjunktiv|虚拟语气|间接引语|转述|要求句|Imperativ/, '动词/叙述方式'],
    [/扩展分词/, '非限定形式/扩展分词定语'],
    [/Partizip|分词/, '非限定形式/分词'],
    // 「werden + Infinitiv」是将来时，不是不定式结构：这里只认「zu + Infinitiv」
    // 这种显式写法，光有 Infinitiv 一词的标签留给下面的时态规则。
    [/zu \+ Infinitiv|不定式|um \.\.\. zu|ohne zu|brauchen \+ zu/, '非限定形式/带zu的不定式'],
    [/被动|[Pp]assiv/, '动词/行动方式'],
    [/可分|前缀/, '动词/动词前缀'],
    [/Präsens|Präteritum|Perfekt|Plusquamperfekt|Futur|werden \+ Infinitiv|时态|变位/, '动词/变位'],
    // 「条件句 mit sollen」讲的是条件句，不是情态动词：要排在下面这条 sollen 规则前面
    [/条件/, '条件与比较/条件句'],
    [/情态|dürfen|können|müssen|wollen|mögen|sollen|sollte|brauchen|wissen|werden|haben|sein\b/, '动词/动词'],
    [/n-Deklination|弱变化/, '名词/阳性弱变化'],
    [/词尾/, '形容词/形容词变格'],
    [/名词化|名词|单复数|复数|同位语/, '名词/名词'],
    [/形容词|Adjektive|比较级|最高级/, '形容词/形容词'],
    [/代副词/, '副词/代副词da-wo'],
    [/冠词|kein|welch-/, '冠词/冠词'],
    [/代词|einander|man\b|es 的功能/, '代词/代词'],
    [/方位副词/, '副词/hin与her'],
    [/副词|Adverbien/, '副词/副词的种类与位置'],
    [/介词 auf 与 in|介词辨析/, '介词/介词辨析'],
    [/Dativ 介词|Genitiv 介词|双向介词|mit \+ Dativ|für\/ohne|trotz|während\/wegen|支配格/, '介词/介词支配格'],
    [/介词/, '介词/介词'],
    [/Akkusativ|Dativ|Genitiv|属格/, '冠词/冠词'],
    [/并列连词/, '连词/并列连词'],
    [/二项连接|成对连词|je \.\.\. desto/, '连词/双重连词'],
    [/nachdem|bevor|seit|während|als\/wenn|wenn 从句|时间从句/, '连词/时间从句连词'],
    [/damit|finale|因果|原因|结果|目的/, '连词/原因结果与目的'],
    [/obwohl|让步|对比/, '连词/让步与对比'],
    [/连词|连接词|连接副词|连续/, '连词/从属连词总表'],
    [/dass|weil|wenn|ohne dass/, '连词/从属连词总表'],
    [/从句|句|语序|语体|文本|衔接|结构|论证|定义|表达|搭配|功能|成分|Modalsätze/, '句法/句法'],
    [/动词/, '动词/动词'],
    [/数词/, '数词/数词'],
    [/发音/, '其他/发音']
  ];

  // 课程 / 语法书数据按模块懒加载，注册在 DIM_DATA.<module>.de，调用时取
  function moduleData(module) {
    return window.LangLoader ? window.LangLoader.data('german', module) : null;
  }

  function grammarSlugFor(tag) {
    const key = String(tag || '').trim();
    if (!key) return '';
    const course = moduleData('course');
    const shared = course && course.grammarSlugs;
    if (shared && shared[key]) return shared[key];
    if (GRAMMAR_SLUG_OVERRIDES[key]) return GRAMMAR_SLUG_OVERRIDES[key];
    const rule = GRAMMAR_SLUG_RULES.find((entry) => entry[0].test(key));
    return rule ? rule[1] : '';
  }

  // 课程屏的 DOM 由本模块自己建，挂到统一的 <main id="main"> 末尾。
  function installGermanCourseScreens() {
    if (document.getElementById('germanCourseScreen')) return;
    const main = document.getElementById('main');
    if (!main) return;
    main.insertAdjacentHTML('beforeend', `
      <section id="germanCourseScreen" class="screen">
        <div class="container">
          <button class="back-link" id="germanCourseBackBtn"><span class="msr" aria-hidden="true">arrow_back</span>返回首页</button>
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

    bound: false,
    levelRestored: false,

    init() {
      installGermanCourseScreens();
      if (this.bound || !document.getElementById('germanCourseScreen')) return;
      this.bound = true;
      this.bindEvents();
      this.watchScreen();
    },

    // 课程数据是德语的二级懒加载模块（lib/languages.js 德语 files.course），
    // open() 负责补拉；就绪检查放在每次渲染前，而不是 init。
    // 没就绪就把原因说清楚，不渲染一堆「0 个核心词」的空壳。
    ensureReady() {
      const course = moduleData('course');
      if (!course) {
        this.showUnavailable('data/german-course-data.js 未能载入，课程路线暂不可用。');
        return false;
      }
      if (!window.Vocab || !window.Vocab.ready('german')) {
        this.showUnavailable('德语词库尚未加载，课程核心词练习暂不可用。请刷新页面重试。');
        return false;
      }
      if (!this.levelRestored) {
        this.levelRestored = true;
        const savedLevel = localStorage.getItem(LEVEL_KEY);
        if (course.levels.some((level) => level.id === savedLevel)) {
          this.activeLevelId = savedLevel;
        }
      }
      return true;
    },

    showUnavailable(message) {
      const summary = document.getElementById('germanCourseLevelSummary');
      if (summary) {
        summary.innerHTML = `
          <div class="settings-card-title">课程暂不可用</div>
          <div class="about-body">${escapeHtml(message)}</div>
        `;
      }
    },

    bindEvents() {
      document.getElementById('germanCourseBackBtn')?.addEventListener('click', () => {
        if (typeof window.goBack === 'function') window.goBack({ fallbackTarget: 'homeScreen' });
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
        if (screen.classList.contains('active') && this.ensureReady()) this.render();
      });
      observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
    },

    // 语法书里真实存在的 slug 集合：映射不到的标签不渲染成可点击 chip。
    availableGrammarSlugs() {
      if (this.grammarSlugs) return this.grammarSlugs;
      const slugs = new Set();
      const data = moduleData('grammar');
      const parts = data && data.tree && Array.isArray(data.tree.parts) ? data.tree.parts : [];
      parts.forEach((part) => {
        (part.chapters || []).forEach((chapter) => {
          (chapter.topics || []).forEach((topic) => {
            if (topic && topic.slug) slugs.add(topic.slug);
          });
        });
      });
      if (data) this.grammarSlugs = slugs; // 语法书还没懒加载到时不缓存空集
      return slugs;
    },

    resolveGrammarTag(tag) {
      const slug = grammarSlugFor(tag);
      return slug && this.availableGrammarSlugs().has(slug) ? slug : '';
    },

    openGrammarTopic(slug) {
      if (!slug || !window.App || typeof window.App.openGrammarBook !== 'function') return;
      window.App.openGrammarBook('german', slug);
    },

    open() {
      this.init();
      this.wordIndex = null;
      const loader = window.LangLoader;
      const missing = (module) => !moduleData(module) && loader
        && typeof loader.ensureModule === 'function' && !loader.isModuleLoaded('german', module);
      // 课程数据没到时先不渲染（否则会闪一下「未能载入」）
      if (!missing('course') && this.ensureReady()) this.render();
      if (typeof window.showScreen === 'function') window.showScreen('germanCourseScreen');
      // 课程数据和语法书都是二级懒加载模块；语法书没到之前语法标签全是纯文本，
      // 到了再重渲染成可点 chip
      const pending = ['course', 'grammar'].filter(missing).map((module) => loader.ensureModule('german', module));
      if (pending.length) {
        Promise.all(pending).then(() => {
          this.grammarSlugs = null;
          if (this.ensureReady()) this.render();
        });
      }
    },

    selectLevel(levelId) {
      if (!moduleData('course').levels.some((level) => level.id === levelId)) return;
      this.activeLevelId = levelId;
      localStorage.setItem(LEVEL_KEY, levelId);
      this.render();
    },

    getActiveLevel() {
      const levels = moduleData('course').levels;
      return levels.find((level) => level.id === this.activeLevelId) || levels[0];
    },

    getSystemWords() {
      return window.Vocab ? window.Vocab.entries('german') : [];
    },

    normalize(value) {
      return String(value || '')
        .normalize('NFKC')
        .toLocaleLowerCase('de-DE')
        .replace(/\//g, '')
        .trim();
    },

    // 课程单元的 headword 里有大量屈折形（复数 Frauen、比较级 kleiner、
    // 第二分词 gegessen）。词条 forms 自带 plural / principalParts，用它们建一张
    // 屈折形 → 词条的索引，这些词才点得开卡片。
    //
    // 分两轮：先索引原形（word / display），再索引屈折形，且屈折形只在
    // 键位空着时才写入 —— 否则「schalen」这种「A 的屈折形恰好是 B 的原形」
    // 的碰撞会把原形词条顶掉。
    inflectedForms(word) {
      const forms = [];
      const f = word.forms || {};
      if (f.plural) forms.push(f.plural);
      if (f.principalParts) {
        String(f.principalParts).split(',').forEach((part) => {
          part.trim().split(/\s+/).forEach((token) => {
            // 主要变化形写作「isst, aß, hat gegessen」，助动词不是词形
            if (token && !/^(hat|ist|haben|sein|hast|bin)$/.test(token)) forms.push(token);
          });
        });
      }
      return forms;
    },

    buildWordIndex() {
      if (this.wordIndex) return this.wordIndex;
      const index = new Map();
      const words = this.getSystemWords();
      words.forEach((word) => {
        [word.word, word.display].filter(Boolean).forEach((value) => {
          const key = this.normalize(value);
          if (key && !index.has(key)) index.set(key, word);
        });
      });
      words.forEach((word) => {
        this.inflectedForms(word).forEach((value) => {
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
        if (!word || seen.has(word.word)) return false;
        seen.add(word.word);
        return true;
      });
    },

    getUnitWords(unit) {
      return this.resolveHeadwords(unit.headwords);
    },

    getLevelWords(level) {
      const seen = new Set();
      return level.units.flatMap((unit) => this.getUnitWords(unit)).filter((word) => {
        if (seen.has(word.word)) return false;
        seen.add(word.word);
        return true;
      });
    },

    // 课程进度读系统词库的掌握集合（entry.word 数组），与个人词本无关。
    getSystemMastered() {
      const key = window.DimStorage ? window.DimStorage.masteredKey('german') : 'dimenticato_german_mastered';
      try {
        return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
      } catch (error) {
        return new Set();
      }
    },

    masteredKey(word) {
      return word ? word.word : '';
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
        chips.innerHTML = moduleData('course').levels.map((item) => `
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
            <span class="card-chip"><span class="msr" aria-hidden="true">school</span></span>
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
      if (!window.App || typeof window.App.practiceEntries !== 'function') return;
      window.App.practiceEntries(`${level.id} · Lektion ${unit.number} · ${unit.title}`, this.getUnitWords(unit));
    },

    openLevelPractice() {
      const level = this.getActiveLevel();
      if (!level) return;
      if (!window.App || typeof window.App.practiceEntries !== 'function') return;
      window.App.practiceEntries(`${level.id} · ${level.title}`, this.getLevelWords(level));
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GermanCourse.init());
  } else {
    GermanCourse.init();
  }

  window.GermanCourse = GermanCourse;
})();
