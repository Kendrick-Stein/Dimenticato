/**
 * FrenchApp — French vocabulary, grammar, conjugation and progress portal.
 * Screens are installed as one self-contained module so the legacy index.html
 * remains readable while the French experience mirrors German and English.
 */
(function () {
  'use strict';

  const STORAGE_KEYS = {
    MASTERED: 'dimenticato_french_mastered',
    STATS: 'dimenticato_french_stats',
    FILTER: 'dimenticato_french_filter'
  };

  function installFrenchScreens() {
    if (document.getElementById('frenchWelcomeScreen')) return;
    const anchor = document.getElementById('languageSkeletonPlaceholderScreen');
    if (!anchor) return;

    anchor.insertAdjacentHTML('beforebegin', `
      <section id="frenchWelcomeScreen" class="screen">
        <div class="container">
          <div class="eyebrow">French</div>
          <h1 class="page">Portail d'apprentissage du français</h1>
          <p class="desc">词汇覆盖 A1 到 B2，并配套 A1-B1 语法、动词变位与独立学习进度。</p>
          <div class="card-grid cols-2">
            <button class="card" id="goFrenchVocabularyBtn">
              <span class="card-chip"><span class="msr">translate</span></span>
              <span class="card-title">Vocabulary</span>
              <span class="card-desc">主题词汇、我的词本与三种练习模式</span>
            </button>
            <button class="card" id="goFrenchGrammarBtn">
              <span class="card-chip"><span class="msr">menu_book</span></span>
              <span class="card-title">Grammar</span>
              <span class="card-desc">A1-B1 语法书与高频动词变位</span>
            </button>
            <button class="card" id="goFrenchProgressBtn">
              <span class="card-chip"><span class="msr">monitoring</span></span>
              <span class="card-title">Progress</span>
              <span class="card-desc">查看法语词汇掌握量与练习统计</span>
            </button>
            <button class="card" id="goFrenchSettingsBtn">
              <span class="card-chip"><span class="msr">tune</span></span>
              <span class="card-title">Settings &amp; Data</span>
              <span class="card-desc">课程说明、社区词本与全站数据工具</span>
            </button>
          </div>
        </div>
      </section>

      <section id="frenchVocabularyScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchVocabularyBackBtn"><span class="msr">arrow_back</span>返回 French Home</button>
          <div class="eyebrow">French / Vocabulary</div>
          <h1 class="page">Choisir le vocabulaire</h1>
          <p class="desc">选择系统法语课程、个人词本或共享社区词库。</p>
          <div class="card-grid cols-3">
            <button class="card" id="frenchSystemVocabularyBtn">
              <span class="card-chip"><span class="msr">dataset</span></span>
              <span class="card-title">System Vocabulary</span>
              <span class="card-desc">2,183 个 A1-B2 教材词条与主题表达</span>
            </button>
            <button class="card" id="frenchWordbooksBtn">
              <span class="card-chip"><span class="msr">bookmark</span></span>
              <span class="card-title">My Wordbooks</span>
              <span class="card-desc">导入、创建并管理个人法语词本</span>
            </button>
            <button class="card" id="frenchCommunityBtn">
              <span class="card-chip"><span class="msr">groups</span></span>
              <span class="card-title">Community Wordbooks</span>
              <span class="card-desc">浏览并导入共享社区资源</span>
            </button>
          </div>
          <div class="section-head-row">
            <div>
              <div class="sub-label">My French Wordbooks</div>
              <span class="card-desc">这里只显示 French 词本</span>
            </div>
            <div class="inline-actions">
              <input type="file" id="frenchWordbookFileInput" accept=".json,.txt" style="display:none">
              <button class="pill-btn" id="frenchImportWordbookBtn"><span class="msr">upload_file</span>Import</button>
              <button class="pill-btn" id="frenchCreateWordbookBtn"><span class="msr">add</span>Create</button>
            </div>
          </div>
          <div class="card-grid cols-3" id="frenchWordbookCards"></div>
        </div>
      </section>

      <section id="frenchVocabularyModesScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchModesBackBtn"><span class="msr">arrow_back</span>返回 Vocabulary</button>
          <div class="eyebrow">French / Vocabulary</div>
          <h1 class="page">Choisir un mode</h1>
          <p class="desc">选择一种方式练习当前法语词汇。</p>
          <div class="card-grid cols-3">
            <button class="card" id="frenchMultipleChoiceBtn">
              <span class="card-chip"><span class="msr">quiz</span></span>
              <span class="card-title">Multiple Choice</span>
              <span class="card-desc">看法语，选择正确中文释义</span>
            </button>
            <button class="card" id="frenchSpellingBtn">
              <span class="card-chip"><span class="msr">keyboard</span></span>
              <span class="card-title">Spelling</span>
              <span class="card-desc">看中文，输入法语单词或短语</span>
            </button>
            <button class="card" id="frenchBrowseBtn">
              <span class="card-chip"><span class="msr">list</span></span>
              <span class="card-title">Browse</span>
              <span class="card-desc">浏览、搜索并筛选法语词汇</span>
            </button>
          </div>
        </div>
      </section>

      <section id="frenchMultipleChoiceScreen" class="screen">
        <div class="container narrow">
          <button class="back-link" id="frenchMcBackBtn"><span class="msr">arrow_back</span>返回</button>
          <div class="practice-head">
            <span class="idx"><span id="frenchMcCurrentWord">1</span> / <span id="frenchMcTotalWords">0</span></span>
            <span class="acc">正确率 <b id="frenchMcAccuracy">0%</b></span>
          </div>
          <div class="session-bar"><div class="session-fill" id="frenchMcSessionFill" style="width:0%"></div></div>
          <div class="practice-card">
            <div class="question-section">
              <div class="eyebrow" style="text-align:center">Mot français</div>
              <div class="word-row">
                <h2 class="word" id="frenchMcWord">-</h2>
                <button class="speaker" id="frenchMcSpeakBtn" title="朗读法语"><span class="msr">volume_up</span></button>
              </div>
              <button class="hint-btn hidden" id="frenchMcShowHintBtn">显示笔记</button>
              <p class="chinese-hint hidden" id="frenchMcHint"></p>
            </div>
            <div class="field-label">选择正确的中文释义</div>
            <div class="options" id="frenchMcOptions"></div>
            <div class="hidden" id="frenchMcFeedback">
              <p class="feedback feedback-text"></p>
              <button class="primary-btn" id="frenchMcNextBtn">下一个 <span class="msr">arrow_forward</span></button>
            </div>
          </div>
        </div>
      </section>

      <section id="frenchSpellingScreen" class="screen">
        <div class="container narrow">
          <button class="back-link" id="frenchSpBackBtn"><span class="msr">arrow_back</span>返回</button>
          <div class="practice-head">
            <span class="idx"><span id="frenchSpCurrentWord">1</span> / <span id="frenchSpTotalWords">0</span></span>
            <span class="acc">正确率 <b id="frenchSpAccuracy">0%</b></span>
          </div>
          <div class="session-bar"><div class="session-fill" id="frenchSpSessionFill" style="width:0%"></div></div>
          <div class="practice-card">
            <div class="question-section">
              <div class="eyebrow" style="text-align:center">中文释义</div>
              <h2 class="word" style="font-size:32px" id="frenchSpMeaning">-</h2>
              <p class="chinese-hint hidden" id="frenchSpHint"></p>
              <div style="text-align:center;margin-top:16px">
                <button class="pill-btn" id="frenchPronunciationBtn"><span class="msr">volume_up</span>听发音</button>
              </div>
            </div>
            <div class="field-label">请输入法语单词或短语</div>
            <input type="text" class="spell-input" id="frenchSpInput" placeholder="Écrivez en français..." autocomplete="off" autocapitalize="none">
            <button class="primary-btn" id="frenchSpCheckBtn">检查答案</button>
            <div class="hidden" id="frenchSpFeedback">
              <p class="feedback feedback-text"></p>
              <button class="primary-btn" id="frenchSpNextBtn">下一个 <span class="msr">arrow_forward</span></button>
            </div>
          </div>
        </div>
      </section>

      <section id="frenchBrowseScreen" class="screen">
        <div class="browse-container">
          <button class="back-btn" id="frenchBrowseBackBtn">← 返回</button>
          <div class="browse-controls">
            <div class="search-wrap">
              <span class="msr">search</span>
              <input type="text" class="search-input" id="frenchSearchInput" placeholder="搜索法语单词、释义或主题…">
            </div>
            <div class="chips" id="frenchFilterChips">
              <button class="chip active" data-filter="all">全部</button>
              <button class="chip" data-filter="mastered">已掌握</button>
              <button class="chip" data-filter="unmastered">学习中</button>
            </div>
          </div>
          <div class="word-list" id="frenchWordList"></div>
        </div>
      </section>

      <section id="frenchGrammarScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchGrammarBackBtn"><span class="msr">arrow_back</span>返回 French Home</button>
          <div class="eyebrow">French / Grammar</div>
          <h1 class="page">Grammaire et conjugaison</h1>
          <p class="desc">按 A1-B1 进阶阅读语法，并通过练习掌握高频动词变位。</p>
          <div class="card-grid cols-2">
            <button class="card" id="frenchConjugationBtn">
              <span class="card-chip"><span class="msr">sync_alt</span></span>
              <span class="card-title">动词变位</span>
              <span class="card-desc">35 个高频动词、7 组时态与三种题型</span>
            </button>
            <button class="card" id="frenchGrammarBookBtn">
              <span class="card-chip"><span class="msr">auto_stories</span></span>
              <span class="card-title">Grammar Book</span>
              <span class="card-desc">23 个 A1-B1 中文语法主题与法语例句</span>
            </button>
          </div>
        </div>
      </section>

      <section id="frenchProgressScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchProgressBackBtn"><span class="msr">arrow_back</span>返回 French Home</button>
          <div class="eyebrow">French / Progress</div>
          <h1 class="page">Progression en français</h1>
          <p class="desc">基于本机保存的法语词汇练习记录统计。</p>
          <div class="big-stats">
            <div class="big-stat"><div class="bs-label">French vocabulary</div><div class="bs-value" id="frenchProgressTotalWords">0</div></div>
            <div class="big-stat accent"><div class="bs-label">Mastered</div><div class="bs-value" id="frenchProgressMasteredWords">0</div></div>
            <div class="big-stat"><div class="bs-label">Progress</div><div class="bs-value" id="frenchProgressPercent">0%</div></div>
            <div class="big-stat"><div class="bs-label">MC stats</div><div class="bs-value" id="frenchProgressMcStats">0 / 0</div></div>
            <div class="big-stat"><div class="bs-label">Spelling stats</div><div class="bs-value" id="frenchProgressSpStats">0 / 0</div></div>
            <div class="big-stat accent"><div class="bs-label">Accuracy</div><div class="bs-value" id="frenchProgressAccuracy">0%</div></div>
          </div>
        </div>
      </section>

      <section id="frenchSettingsScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchSettingsBackBtn"><span class="msr">arrow_back</span>返回 French Home</button>
          <div class="eyebrow">French / Settings &amp; Data</div>
          <h1 class="page">Paramètres du module français</h1>
          <p class="desc">查看课程范围，并进入共享数据工具。</p>
          <div class="settings-card">
            <div class="settings-card-title">French curriculum</div>
            <div class="about-body">词汇覆盖《你好！法语》1-4 书末三语总词汇表（A1-B2），语法与变位按 A1-B1 课程重新组织。网页只保存词条数据，不包含教材扫描页。</div>
          </div>
          <div class="settings-card">
            <div class="settings-card-title">Data &amp; community</div>
            <button class="data-row" id="frenchSettingsCommunityBtn">
              <span class="row-chip"><span class="msr">groups</span></span>
              <span class="row-body"><span class="row-title">Open Community Wordbooks</span><span class="row-sub">浏览并导入共享词本</span></span>
              <span class="msr chev">chevron_right</span>
            </button>
            <button class="data-row" id="frenchSettingsGlobalDataBtn">
              <span class="row-chip"><span class="msr">tune</span></span>
              <span class="row-body"><span class="row-title">Open Global Settings &amp; Data</span><span class="row-sub">导出、导入、主题、帮助与重置</span></span>
              <span class="msr chev">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    `);
  }

  installFrenchScreens();

  const FrenchApp = {
    words: [],
    systemWords: [],
    sessionWords: [],
    mastered: new Set(),
    stats: { mcAttempts: 0, mcCorrect: 0, spAttempts: 0, spCorrect: 0 },
    currentWord: null,
    currentWordbookId: null,
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    browseFilter: 'all',
    _mcEngine: null,

    init() {
      if (typeof FRENCH_VOCABULARY_DATA === 'undefined') {
        console.warn('FRENCH_VOCABULARY_DATA 未加载，跳过 FrenchApp 初始化');
        return;
      }
      this.systemWords = this.buildSystemVocabulary();
      this.words = this.systemWords.slice();
      this.loadState();
      this.bindNavigation();
      this.bindPractice();
      this.bindGrammar();
      this.bindWordbooks();
      this.renderWordbooks();
      if (document.body.getAttribute('data-language') === 'french') {
        this.updateHeaderStats();
      }
    },

    buildSystemVocabulary() {
      const glossary = typeof FRENCH_GLOSSARY_VOCABULARY_DATA !== 'undefined'
        ? FRENCH_GLOSSARY_VOCABULARY_DATA
        : [];
      const seen = new Set();
      const normalize = value => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[’']/g, "'")
        .trim();

      return [...FRENCH_VOCABULARY_DATA, ...glossary]
        .filter(item => {
          const key = normalize(item.french);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((item, index) => ({ ...item, rank: index + 1 }));
    },

    loadState() {
      try {
        this.mastered = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERED) || '[]'));
        this.stats = { ...this.stats, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS) || '{}') };
        this.browseFilter = localStorage.getItem(STORAGE_KEYS.FILTER) || 'all';
      } catch (error) {
        console.error('FrenchApp 状态加载失败:', error);
      }
    },

    saveState() {
      try {
        const masteredKey = this.currentWordbookId
          ? `dimenticato_progress_wb_french_${this.currentWordbookId}`
          : STORAGE_KEYS.MASTERED;
        localStorage.setItem(masteredKey, JSON.stringify([...this.mastered]));
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
        localStorage.setItem(STORAGE_KEYS.FILTER, this.browseFilter);
        this.updateHeaderStats();
      } catch (error) {
        console.error('FrenchApp 状态保存失败:', error);
      }
    },

    bindNavigation() {
      this.bindClick('goFrenchVocabularyBtn', () => this.showScreen('frenchVocabularyScreen'));
      this.bindClick('goFrenchGrammarBtn', () => this.showScreen('frenchGrammarScreen'));
      this.bindClick('goFrenchProgressBtn', () => {
        this.renderProgress();
        this.showScreen('frenchProgressScreen');
      });
      this.bindClick('goFrenchSettingsBtn', () => this.showScreen('frenchSettingsScreen'));

      this.bindClick('frenchVocabularyBackBtn', () => this.goBack('frenchWelcomeScreen'));
      this.bindClick('frenchModesBackBtn', () => this.goBack('frenchVocabularyScreen'));
      this.bindClick('frenchGrammarBackBtn', () => this.goBack('frenchWelcomeScreen'));
      this.bindClick('frenchProgressBackBtn', () => this.goBack('frenchWelcomeScreen'));
      this.bindClick('frenchSettingsBackBtn', () => this.goBack('frenchWelcomeScreen'));
      this.bindClick('frenchMcBackBtn', () => this.goBack('frenchVocabularyModesScreen'));
      this.bindClick('frenchSpBackBtn', () => this.goBack('frenchVocabularyModesScreen'));
      this.bindClick('frenchBrowseBackBtn', () => this.goBack('frenchVocabularyModesScreen'));

      this.bindClick('frenchSystemVocabularyBtn', () => this.selectSystemVocabulary());
      this.bindClick('frenchWordbooksBtn', () => this.renderWordbooks());
      this.bindClick('frenchCommunityBtn', () => this.openCommunity('frenchVocabularyScreen'));
      this.bindClick('frenchSettingsCommunityBtn', () => this.openCommunity('frenchSettingsScreen'));
      this.bindClick('frenchSettingsGlobalDataBtn', () => this.showScreen('settingsScreen'));
    },

    bindPractice() {
      this.bindClick('frenchMultipleChoiceBtn', () => this.startMultipleChoice());
      this.bindClick('frenchSpellingBtn', () => this.startSpelling());
      this.bindClick('frenchBrowseBtn', () => this.openBrowse());
      this.bindClick('frenchMcNextBtn', () => this.nextMultipleChoice());
      this.bindClick('frenchSpNextBtn', () => this.nextSpelling());
      this.bindClick('frenchSpCheckBtn', () => this.checkSpelling());
      this.bindClick('frenchMcSpeakBtn', () => this.speak(this.currentWord?.french || ''));
      this.bindClick('frenchPronunciationBtn', () => this.speak(this.currentWord?.french || ''));
      this.bindClick('frenchMcShowHintBtn', () => {
        document.getElementById('frenchMcHint')?.classList.remove('hidden');
        document.getElementById('frenchMcShowHintBtn')?.classList.add('hidden');
      });
      document.getElementById('frenchSpInput')?.addEventListener('keypress', event => {
        if (event.key === 'Enter') this.checkSpelling();
      });
      document.getElementById('frenchSearchInput')?.addEventListener('input', event => {
        this.renderBrowse(event.target.value || '');
      });
      document.querySelectorAll('#frenchFilterChips .chip').forEach(chip => {
        chip.addEventListener('click', () => this.setBrowseFilter(chip.dataset.filter));
      });
    },

    bindGrammar() {
      this.bindClick('frenchGrammarBookBtn', () => {
        if (typeof GrammarBook !== 'undefined' && typeof FRENCH_GRAMMAR_DATA !== 'undefined') {
          GrammarBook.init(FRENCH_GRAMMAR_DATA);
          this.showScreen('grammarBookScreen');
        }
      });
      this.bindClick('frenchConjugationBtn', () => {
        if (window.ConjugationPractice) {
          window.ConjugationPractice.openFor('french');
        }
      });
    },

    bindWordbooks() {
      this.bindClick('frenchImportWordbookBtn', () => document.getElementById('frenchWordbookFileInput')?.click());
      this.bindClick('frenchCreateWordbookBtn', () => {
        if (typeof WordbookEditor !== 'undefined') {
          WordbookEditor.createNewWordbook('french');
          this.renderWordbooks();
        }
      });
      document.getElementById('frenchWordbookFileInput')?.addEventListener('change', async event => {
        const file = event.target.files?.[0];
        if (!file || typeof WordbookManager === 'undefined') return;
        try {
          const result = await WordbookManager.importFromFileWithLanguage(file, 'french');
          this.renderWordbooks();
          alert(`已导入法语词本“${result.wordbook.name}”，共 ${result.wordbook.wordCount} 词。`);
        } catch (error) {
          if (error !== '用户取消导入') alert(String(error));
        } finally {
          event.target.value = '';
        }
      });
    },

    selectSystemVocabulary() {
      this.currentWordbookId = null;
      this.words = this.systemWords.slice();
      try {
        this.mastered = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERED) || '[]'));
      } catch (_) {
        this.mastered = new Set();
      }
      this.updateHeaderStats();
      this.showScreen('frenchVocabularyModesScreen');
    },

    renderWordbooks() {
      const container = document.getElementById('frenchWordbookCards');
      if (!container || typeof WordbookManager === 'undefined') return;
      const wordbooks = WordbookManager.getWordbooksByLanguage('french');
      if (!wordbooks.length) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:1rem">还没有法语词本</p>';
        return;
      }
      container.innerHTML = wordbooks.map(wordbook => `
        <div class="card wordbook-card" data-french-wordbook-id="${wordbook.id}">
          <button class="wordbook-card-manage-btn" data-manage-id="${wordbook.id}" title="管理"><span class="msr">settings</span></button>
          <button class="wordbook-delete-btn" data-delete-id="${wordbook.id}" title="删除">×</button>
          <span class="card-chip"><span class="msr">bookmark</span></span>
          <span class="card-title">${escapeHtml(wordbook.name)}</span>
          <span class="card-desc">${wordbook.wordCount} 词</span>
        </div>
      `).join('');
      container.querySelectorAll('[data-french-wordbook-id]').forEach(card => {
        card.addEventListener('click', () => this.selectWordbook(Number(card.dataset.frenchWordbookId)));
      });
      container.querySelectorAll('[data-manage-id]').forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation();
          WordbookEditor?.openEditor(Number(button.dataset.manageId));
        });
      });
      container.querySelectorAll('[data-delete-id]').forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation();
          WordbookManager.deleteWordbook(Number(button.dataset.deleteId));
          this.renderWordbooks();
        });
      });
    },

    selectWordbook(id) {
      const wordbook = WordbookManager.getWordbooksByLanguage('french').find(item => item.id === id);
      if (!wordbook) return;
      this.currentWordbookId = id;
      this.words = WordbookManager.mapWordbookWordsForLanguage(wordbook.words, 'french');
      try {
        this.mastered = new Set(JSON.parse(localStorage.getItem(`dimenticato_progress_wb_french_${id}`) || '[]'));
      } catch (_) {
        this.mastered = new Set();
      }
      this.updateHeaderStats();
      this.showScreen('frenchVocabularyModesScreen');
    },

    getMcEngine() {
      if (!this._mcEngine) {
        this._mcEngine = new QuizEngine({
          state: {
            get words() { return FrenchApp.sessionWords; },
            get quizIndex() { return FrenchApp.quizIndex; },
            set quizIndex(value) { FrenchApp.quizIndex = value; },
            get quizCorrect() { return FrenchApp.quizCorrect; },
            set quizCorrect(value) { FrenchApp.quizCorrect = value; },
            get quizTotal() { return FrenchApp.quizTotal; },
            set quizTotal(value) { FrenchApp.quizTotal = value; },
            get currentWord() { return FrenchApp.currentWord; },
            set currentWord(value) { FrenchApp.currentWord = value; }
          },
          stats: this.stats,
          mastered: this.mastered,
          fieldMap: { source: 'french', target: 'meaning' },
          get difficulty() { return QuizEngine.getDifficulty(); },
          saveFn: () => this.saveState(),
          onUpdateStats: () => {},
          dom: {
            optionsContainer: document.getElementById('frenchMcOptions'),
            feedbackEl: document.getElementById('frenchMcFeedback'),
            feedbackTextEl: document.querySelector('#frenchMcFeedback .feedback-text'),
            progressCurrent: document.getElementById('frenchMcCurrentWord'),
            progressTotal: document.getElementById('frenchMcTotalWords'),
            accuracyEl: document.getElementById('frenchMcAccuracy')
          }
        });
      }
      this._mcEngine.config.stats = this.stats;
      this._mcEngine.config.mastered = this.mastered;
      return this._mcEngine;
    },

    startMultipleChoice() {
      if (!this.words.length) return alert('法语词汇数据尚未加载。');
      this.resetQuiz();
      this.sessionWords = this.shuffle(this.words);
      this.showScreen('frenchMultipleChoiceScreen');
      this.loadMultipleChoice();
    },

    loadMultipleChoice() {
      if (this.quizIndex >= this.sessionWords.length) return this.finishPractice('选择题');
      this.currentWord = this.sessionWords[this.quizIndex];
      this.setText('frenchMcCurrentWord', String(this.quizIndex + 1));
      this.setText('frenchMcTotalWords', String(this.sessionWords.length));
      this.setText('frenchMcAccuracy', `${this.accuracy()}%`);
      this.setText('frenchMcWord', this.currentWord.french || '-');
      this.updateFill('frenchMcSessionFill');
      const hint = document.getElementById('frenchMcHint');
      const hintButton = document.getElementById('frenchMcShowHintBtn');
      if (hint) { hint.textContent = this.currentWord.notes || ''; hint.classList.add('hidden'); }
      if (hintButton) hintButton.classList.toggle('hidden', !this.currentWord.notes);
      const correct = this.currentWord.meaning || this.currentWord.chinese || '';
      const engine = this.getMcEngine();
      engine.renderOptions(engine.generateOptions(correct, this.words), button => this.checkMultipleChoice(button));
      this.resetFeedback('frenchMcFeedback');
      this.speak(this.currentWord.french);
    },

    checkMultipleChoice(button) {
      const correct = this.currentWord.meaning || this.currentWord.chinese || '';
      const isCorrect = (button.dataset.answer || '') === correct;
      this.quizTotal++;
      this.stats.mcAttempts++;
      if (isCorrect) {
        this.quizCorrect++;
        this.stats.mcCorrect++;
        this.mastered.add(this.currentWord.french);
      }
      const engine = this.getMcEngine();
      engine.highlightOptions(correct);
      if (!isCorrect) { button.classList.remove('faded'); button.classList.add('wrong'); }
      engine.showFeedback(isCorrect, correct);
      this.setText('frenchMcAccuracy', `${this.accuracy()}%`);
      this.saveState();
      if (isCorrect) setTimeout(() => this.nextMultipleChoice(), 900);
    },

    nextMultipleChoice() {
      this.quizIndex++;
      this.loadMultipleChoice();
    },

    startSpelling() {
      if (!this.words.length) return alert('法语词汇数据尚未加载。');
      this.resetQuiz();
      this.sessionWords = this.shuffle(this.words);
      this.showScreen('frenchSpellingScreen');
      this.loadSpelling();
    },

    loadSpelling() {
      if (this.quizIndex >= this.sessionWords.length) return this.finishPractice('拼写');
      this.currentWord = this.sessionWords[this.quizIndex];
      this.setText('frenchSpCurrentWord', String(this.quizIndex + 1));
      this.setText('frenchSpTotalWords', String(this.sessionWords.length));
      this.setText('frenchSpAccuracy', `${this.accuracy()}%`);
      this.setText('frenchSpMeaning', this.currentWord.meaning || this.currentWord.chinese || '-');
      this.updateFill('frenchSpSessionFill');
      const hint = document.getElementById('frenchSpHint');
      if (hint) {
        hint.textContent = this.currentWord.notes || '';
        hint.classList.toggle('hidden', !this.currentWord.notes);
      }
      const input = document.getElementById('frenchSpInput');
      if (input) { input.value = ''; input.disabled = false; input.focus(); }
      document.getElementById('frenchSpCheckBtn')?.classList.remove('hidden');
      this.resetFeedback('frenchSpFeedback');
    },

    checkSpelling() {
      const input = document.getElementById('frenchSpInput');
      if (!input || input.disabled || !this.currentWord) return;
      const answer = input.value.trim();
      if (!answer) return;
      const normalize = value => String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const isCorrect = normalize(answer) === normalize(this.currentWord.french);
      this.quizTotal++;
      this.stats.spAttempts++;
      if (isCorrect) {
        this.quizCorrect++;
        this.stats.spCorrect++;
        this.mastered.add(this.currentWord.french);
      }
      input.disabled = true;
      document.getElementById('frenchSpCheckBtn')?.classList.add('hidden');
      this.showSimpleFeedback('frenchSpFeedback', isCorrect, this.currentWord.french);
      this.setText('frenchSpAccuracy', `${this.accuracy()}%`);
      this.saveState();
      if (isCorrect) setTimeout(() => this.nextSpelling(), 900);
    },

    nextSpelling() {
      this.quizIndex++;
      this.loadSpelling();
    },

    openBrowse() {
      this.showScreen('frenchBrowseScreen');
      const input = document.getElementById('frenchSearchInput');
      if (input) input.value = '';
      this.syncFilterChips();
      this.renderBrowse();
    },

    setBrowseFilter(filter) {
      if (!['all', 'mastered', 'unmastered'].includes(filter)) return;
      this.browseFilter = filter;
      this.saveState();
      this.syncFilterChips();
      this.renderBrowse(document.getElementById('frenchSearchInput')?.value || '');
    },

    syncFilterChips() {
      document.querySelectorAll('#frenchFilterChips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === this.browseFilter);
      });
    },

    renderBrowse(searchTerm = '') {
      const container = document.getElementById('frenchWordList');
      if (!container) return;
      const term = searchTerm.toLowerCase().trim();
      let words = this.words.slice();
      if (this.browseFilter === 'mastered') words = words.filter(word => this.mastered.has(word.french));
      if (this.browseFilter === 'unmastered') words = words.filter(word => !this.mastered.has(word.french));
      if (term) {
        words = words.filter(word => [word.french, word.meaning, word.chinese, word.notes]
          .some(value => String(value || '').toLowerCase().includes(term)));
      }
      if (!words.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem">没有找到匹配的法语词汇</p>';
        return;
      }
      container.innerHTML = words.map(word => {
        const mastered = this.mastered.has(word.french);
        return `
          <div class="word-line" data-french="${escapeAttribute(word.french)}">
            <span class="wl-word">${escapeHtml(word.french)}</span>
            <span class="wl-gloss">${escapeHtml(word.meaning || '')}<span class="wl-note">${escapeHtml(word.notes || '')}</span></span>
            <span class="wl-status"><span class="dot${mastered ? ' good' : ''}"></span>${mastered ? '已掌握' : '学习中'}</span>
            <button class="wl-speaker" title="朗读"><span class="msr">volume_up</span></button>
          </div>`;
      }).join('');
      container.querySelectorAll('[data-french]').forEach(row => {
        row.addEventListener('click', () => this.speak(row.dataset.french));
      });
    },

    renderProgress() {
      const masteredCount = [...this.mastered].filter(value => this.words.some(word => word.french === value)).length;
      const total = this.words.length;
      const progress = total ? Math.round(masteredCount / total * 100) : 0;
      const attempts = (this.stats.mcAttempts || 0) + (this.stats.spAttempts || 0);
      const correct = (this.stats.mcCorrect || 0) + (this.stats.spCorrect || 0);
      const accuracy = attempts ? Math.round(correct / attempts * 100) : 0;
      this.setText('frenchProgressTotalWords', total.toLocaleString());
      this.setText('frenchProgressMasteredWords', masteredCount.toLocaleString());
      this.setText('frenchProgressPercent', `${progress}%`);
      this.setText('frenchProgressMcStats', `${this.stats.mcCorrect || 0} / ${this.stats.mcAttempts || 0}`);
      this.setText('frenchProgressSpStats', `${this.stats.spCorrect || 0} / ${this.stats.spAttempts || 0}`);
      this.setText('frenchProgressAccuracy', `${accuracy}%`);
      this.updateHeaderStats();
    },

    updateHeaderStats() {
      const total = this.words.length;
      const masteredCount = [...this.mastered].filter(value =>
        this.words.some(word => word.french === value)
      ).length;
      const progress = total ? Math.round(masteredCount / total * 100) : 0;
      this.setText('totalWords', total.toLocaleString());
      this.setText('masteredWords', masteredCount.toLocaleString());
      this.setText('progressPercent', `${progress}%`);
    },

    openCommunity(returnScreen) {
      if (window.GermanApp?.openSharedCommunity) {
        window.GermanApp.openSharedCommunity(returnScreen);
      }
    },

    resetQuiz() {
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this.currentWord = null;
    },

    finishPractice(mode) {
      alert(`French ${mode}练习完成\n\n正确：${this.quizCorrect}/${this.quizTotal}\n正确率：${this.accuracy()}%`);
      this.showScreen('frenchVocabularyModesScreen');
    },

    showSimpleFeedback(id, isCorrect, correctAnswer) {
      const wrapper = document.getElementById(id);
      const text = wrapper?.querySelector('.feedback-text');
      if (!wrapper || !text) return;
      text.innerHTML = isCorrect
        ? '<span class="msr">check_circle</span>回答正确'
        : `<span class="msr">cancel</span>回答有误，正确答案是：${escapeHtml(correctAnswer)}`;
      text.classList.toggle('ok', isCorrect);
      text.classList.toggle('no', !isCorrect);
      wrapper.classList.remove('hidden');
    },

    resetFeedback(id) {
      const wrapper = document.getElementById(id);
      if (wrapper) wrapper.className = 'hidden';
    },

    updateFill(id) {
      const fill = document.getElementById(id);
      if (fill) fill.style.width = `${this.sessionWords.length ? this.quizIndex / this.sessionWords.length * 100 : 0}%`;
    },

    accuracy() {
      return this.quizTotal ? Math.round(this.quizCorrect / this.quizTotal * 100) : 0;
    },

    speak(text) {
      if (!text || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.86;
      const voice = window.speechSynthesis.getVoices().find(item => /^fr/i.test(item.lang));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },

    shuffle(array) {
      const copy = array.slice();
      for (let index = copy.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
      }
      return copy;
    },

    showScreen(screenId, options = {}) {
      if (typeof showScreen === 'function') showScreen(screenId, options);
    },

    goBack(fallbackTarget) {
      if (typeof goBack === 'function') goBack({ fallbackTarget });
      else this.showScreen(fallbackTarget, { skipHistory: true });
    },

    bindClick(id, handler) {
      document.getElementById(id)?.addEventListener('click', handler);
    },

    setText(id, value) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    }
  };

  window.FrenchApp = FrenchApp;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FrenchApp.init());
  } else {
    FrenchApp.init();
  }
})();
