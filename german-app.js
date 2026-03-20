(() => {
  const STORAGE_KEYS = {
    MASTERED: 'dimenticato_german_mastered',
    STATS: 'dimenticato_german_stats',
    FILTER: 'dimenticato_german_filter',
    // 与 app.js Storage.KEYS.LANGUAGE 保持一致，统一读写同一个 key
    LANGUAGE: 'dimenticato_language',
    EN_MASTERED: 'dimenticato_english_mastered',
    EN_STATS: 'dimenticato_english_stats',
    EN_FILTER: 'dimenticato_english_filter'
  };

  const GermanApp = {
    words: [],
    sessionWords: [],
    mastered: new Set(),
    stats: {
      mcAttempts: 0,
      mcCorrect: 0,
      spAttempts: 0,
      spCorrect: 0
    },
    currentWord: null,
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    browseFilter: 'all',
    activeLanguage: 'italian',
    communityReturnScreen: 'vocabularyScreen',

    init() {
      if (typeof GERMAN_VOCABULARY_DATA === 'undefined') {
        console.warn('GERMAN_VOCABULARY_DATA 未加载，跳过 GermanApp 初始化');
        return;
      }

      this.words = Array.isArray(GERMAN_VOCABULARY_DATA) ? GERMAN_VOCABULARY_DATA.slice() : [];
      this.loadState();
      this.bindLanguageSwitcher();
      this.bindGermanNavigation();
      this.bindGermanPractice();
      this.bindGrammarBookTriggers();
      this.bindLanguageSettingsAndProgress();
      this.bindPlaceholderTriggers();
      this.applyInitialLanguage();

      // Init English app after German app
      EnglishApp.init(this);
    },

    loadState() {
      try {
        const mastered = localStorage.getItem(STORAGE_KEYS.MASTERED);
        if (mastered) {
          this.mastered = new Set(JSON.parse(mastered));
        }

        const stats = localStorage.getItem(STORAGE_KEYS.STATS);
        if (stats) {
          this.stats = {
            ...this.stats,
            ...JSON.parse(stats)
          };
        }

        const filter = localStorage.getItem(STORAGE_KEYS.FILTER);
        if (filter) {
          this.browseFilter = filter;
        }

        const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
        if (language) {
          this.activeLanguage = language;
        }
      } catch (error) {
        console.error('GermanApp 状态加载失败:', error);
      }
    },

    saveState() {
      try {
        localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify([...this.mastered]));
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
        localStorage.setItem(STORAGE_KEYS.FILTER, this.browseFilter);
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, this.activeLanguage);
      } catch (error) {
        console.error('GermanApp 状态保存失败:', error);
      }
    },

    bindLanguageSwitcher() {
      const toggleBtn = document.getElementById('languageSwitchBtn');
      const popover = document.getElementById('languageSwitcherPopover');
      if (!toggleBtn || !popover) return;

      toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        popover.classList.toggle('hidden');
      });

      document.addEventListener('click', (event) => {
        if (!popover.contains(event.target) && event.target !== toggleBtn && !toggleBtn.contains(event.target)) {
          popover.classList.add('hidden');
        }
      });

      document.querySelectorAll('.language-switcher-option').forEach((option) => {
        option.addEventListener('click', () => {
          const language = option.dataset.language || 'italian';
          this.switchLanguage(language);
          popover.classList.add('hidden');
        });
      });
    },

    applyInitialLanguage() {
      this.updateLanguageSwitcherUI(this.activeLanguage);
      if (this.activeLanguage === 'german') {
        this.showScreen('germanWelcomeScreen');
      } else if (this.activeLanguage === 'english') {
        this.showScreen('englishWelcomeScreen');
      }
    },

    switchLanguage(language) {
      this.activeLanguage = language;
      this.saveState();

      // 委托给 LanguagePortal 处理 body[data-language] 颜色主题、
      // localStorage 持久化、active 样式更新以及屏幕导航。
      if (typeof window.LanguagePortal !== 'undefined') {
        window.LanguagePortal.selectLanguage(language);
      } else {
        // 回退：LanguagePortal 未加载时的降级处理
        this.updateLanguageSwitcherUI(language);
        if (language === 'german') {
          this.showScreen('germanWelcomeScreen');
        } else if (language === 'english') {
          this.showScreen('englishWelcomeScreen');
        } else {
          this.showScreen('welcomeScreen');
        }
      }
    },

    updateLanguageSwitcherUI(language) {
      document.querySelectorAll('.language-switcher-option').forEach((option) => {
        option.classList.toggle('active', option.dataset.language === language);
      });
    },

    bindGermanNavigation() {
      this.bindClick('goGermanVocabularyBtn', () => this.showScreen('germanVocabularyScreen'));
      this.bindClick('goGermanGrammarBtn', () => this.showScreen('germanGrammarScreen'));
      this.bindClick('goGermanProgressBtn', () => this.showScreen('germanProgressScreen'));
      this.bindClick('goGermanSettingsBtn', () => this.showScreen('germanSettingsScreen'));

      this.bindClick('germanVocabularyBackBtn', () => this.showScreen('germanWelcomeScreen'));
      this.bindClick('germanSystemVocabularyBtn', () => this.showScreen('germanVocabularyModesScreen'));
      this.bindClick('germanWordbooksBtn', () => this.renderLanguageWordbooks('german'));
      this.bindClick('germanCommunityBtn', () => this.openSharedCommunity('germanVocabularyScreen'));

      this.bindClick('germanModesBackBtn', () => this.showScreen('germanVocabularyScreen'));
      this.bindClick('germanGrammarBackBtn', () => this.showScreen('germanWelcomeScreen'));
      this.bindClick('germanProgressBackBtn', () => this.showScreen('germanWelcomeScreen'));
      this.bindClick('germanSettingsBackBtn', () => this.showScreen('germanWelcomeScreen'));

      this.bindClick('englishVocabularyBackBtn', () => this.showScreen('englishWelcomeScreen'));
      this.bindClick('englishGrammarBackBtn', () => this.showScreen('englishWelcomeScreen'));
      this.bindClick('englishProgressBackBtn', () => this.showScreen('englishWelcomeScreen'));
      this.bindClick('englishSettingsBackBtn', () => this.showScreen('englishWelcomeScreen'));
      this.bindClick('goEnglishVocabularyBtn', () => this.showScreen('englishVocabularyScreen'));
      this.bindClick('goEnglishGrammarBtn', () => this.showScreen('englishGrammarScreen'));
      this.bindClick('goEnglishProgressBtn', () => this.showScreen('englishProgressScreen'));
      this.bindClick('goEnglishSettingsBtn', () => this.showScreen('englishSettingsScreen'));
      this.bindClick('englishSystemVocabularyBtn', () => this.showScreen('englishVocabularyModesScreen'));
      this.bindClick('englishWordbooksBtn', () => this.renderLanguageWordbooks('english'));
      this.bindClick('englishCommunityBtn', () => this.openSharedCommunity('englishVocabularyScreen'));
      this.bindClick('englishModesBackBtn', () => this.showScreen('englishVocabularyScreen'));

      this.bindClick('germanImportWordbookBtn', () => document.getElementById('germanWordbookFileInput')?.click());
      this.bindClick('englishImportWordbookBtn', () => document.getElementById('englishWordbookFileInput')?.click());
      this.bindClick('germanCreateWordbookBtn', () => this.createLanguageWordbook('german'));
      this.bindClick('englishCreateWordbookBtn', () => this.createLanguageWordbook('english'));

      document.getElementById('germanWordbookFileInput')?.addEventListener('change', (e) => this.handleLanguageWordbookImport(e, 'german'));
      document.getElementById('englishWordbookFileInput')?.addEventListener('change', (e) => this.handleLanguageWordbookImport(e, 'english'));
    },

    createLanguageWordbook(language) {
      if (typeof WordbookEditor === 'undefined') {
        alert('单词本编辑功能未加载。');
        return;
      }
      const wordbook = WordbookEditor.createNewWordbook(language);
      if (wordbook) {
        this.renderLanguageWordbooks(language);
      }
    },

    async handleLanguageWordbookImport(event, language) {
      const file = event?.target?.files?.[0];
      if (!file || typeof WordbookManager === 'undefined') return;
      try {
        const result = await WordbookManager.importFromFileWithLanguage(file, language);
        alert(`已导入词本：${result.wordbook.name}`);
        this.renderLanguageWordbooks(language);
      } catch (error) {
        alert(`导入失败：${error}`);
      }
      event.target.value = '';
    },

    renderLanguageWordbooks(language) {
      const containerId = language === 'german' ? 'germanWordbookCards' : 'englishWordbookCards';
      const screenId = language === 'german' ? 'germanVocabularyScreen' : 'englishVocabularyScreen';
      const container = document.getElementById(containerId);
      if (!container || typeof WordbookManager === 'undefined') {
        this.showScreen(screenId);
        return;
      }

      const wordbooks = WordbookManager.getWordbooksByLanguage(language);
      if (!wordbooks.length) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 1rem;">还没有词本</p>';
      } else {
        container.innerHTML = wordbooks.map(wb => `
          <div class="wordbook-card" data-language-wordbook-id="${wb.id}">
            <button class="wordbook-card-manage-btn" data-manage-id="${wb.id}" title="管理单词本">${renderIcon('icon-settings')}</button>
            <button class="wordbook-delete-btn" data-delete-id="${wb.id}" title="删除">×</button>
            <span class="wordbook-card-icon">${renderIcon('icon-book-open')}</span>
            <span class="wordbook-card-name">${this.escapeHtml(wb.name)}</span>
            <span class="wordbook-card-count">${wb.wordCount} 词</span>
            <span class="wordbook-card-date">${new Date(wb.createdAt).toLocaleDateString()}</span>
          </div>
        `).join('');

        container.querySelectorAll('[data-language-wordbook-id]').forEach(card => {
          card.addEventListener('click', () => this.selectLanguageWordbook(parseInt(card.dataset.languageWordbookId, 10), language));
        });
        container.querySelectorAll('[data-manage-id]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            WordbookEditor?.openEditor(parseInt(btn.dataset.manageId, 10));
          });
        });
        container.querySelectorAll('[data-delete-id]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            WordbookManager?.deleteWordbook(parseInt(btn.dataset.deleteId, 10));
            this.renderLanguageWordbooks(language);
          });
        });
      }

      this.showScreen(screenId);
    },

    selectLanguageWordbook(id, language) {
      const wordbook = (typeof WordbookManager !== 'undefined' ? WordbookManager.getWordbooksByLanguage(language) : []).find(wb => wb.id === id);
      if (!wordbook || typeof WordbookManager === 'undefined') return;

      this.showScreen(language === 'german' ? 'germanVocabularyModesScreen' : 'englishVocabularyModesScreen');

      if (language === 'german') {
        this.currentWordbook = wordbook;
        this.sessionWords = [];
        this.currentWord = null;
        this.quizIndex = 0;
        this.quizCorrect = 0;
        this.quizTotal = 0;
        this.words = WordbookManager.mapWordbookWordsForLanguage(wordbook.words, 'german');
        this.loadWordbookProgress(id, 'german');
      } else {
        EnglishApp.currentWordbook = wordbook;
        EnglishApp.words = WordbookManager.mapWordbookWordsForLanguage(wordbook.words, 'english');
        EnglishApp.loadWordbookProgress?.(id, 'english');
      }
    },

    loadWordbookProgress(id, language = 'german') {
      try {
        const raw = localStorage.getItem(`dimenticato_progress_wb_${language}_${id}`) || '[]';
        this.mastered = new Set(JSON.parse(raw));
      } catch (error) {
        this.mastered = new Set();
      }
    },

    bindLanguageSettingsAndProgress() {
      this.bindClick('germanSettingsCommunityBtn', () => this.openSharedCommunity('germanSettingsScreen'));
      this.bindClick('englishSettingsCommunityBtn', () => this.openSharedCommunity('englishSettingsScreen'));
      this.bindClick('germanSettingsGlobalDataBtn', () => this.showScreen('settingsScreen'));
      this.bindClick('englishSettingsGlobalDataBtn', () => this.showScreen('settingsScreen'));

      this.bindClick('goGermanProgressBtn', () => {
        this.updateGermanProgressStats();
        this.showScreen('germanProgressScreen');
      });
      this.bindClick('goEnglishProgressBtn', () => {
        this.updateEnglishProgressStats();
        this.showScreen('englishProgressScreen');
      });
    },

    openSharedCommunity(returnScreen) {
      this.communityReturnScreen = returnScreen || 'vocabularyScreen';
      if (typeof CommunityWordbooks !== 'undefined' && typeof CommunityWordbooks.showBrowseScreen === 'function') {
        CommunityWordbooks.showBrowseScreen();
      }
    },

    updateGermanProgressStats() {
      const totalWords = this.words.length;
      const masteredCount = [...this.mastered].filter(word => this.words.some(w => w.german === word)).length;
      const progress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
      const totalAttempts = (this.stats.mcAttempts || 0) + (this.stats.spAttempts || 0);
      const totalCorrect = (this.stats.mcCorrect || 0) + (this.stats.spCorrect || 0);
      const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

      this.setText('germanProgressTotalWords', totalWords.toLocaleString());
      this.setText('germanProgressMasteredWords', masteredCount.toLocaleString());
      this.setText('germanProgressPercent', `${progress}%`);
      this.setText('germanProgressMcStats', `${this.stats.mcCorrect || 0} / ${this.stats.mcAttempts || 0}`);
      this.setText('germanProgressSpStats', `${this.stats.spCorrect || 0} / ${this.stats.spAttempts || 0}`);
      this.setText('germanProgressAccuracy', `${accuracy}%`);
    },

    updateEnglishProgressStats() {
      if (typeof EnglishApp !== 'undefined' && typeof EnglishApp.updateProgressStats === 'function') {
        EnglishApp.updateProgressStats();
      }
    },

    bindGrammarBookTriggers() {
      // German Grammar Book — real data
      const germanGrammarBookBtn = document.querySelector(
        '#germanGrammarScreen .german-placeholder-trigger[data-module="grammar-book"]'
      );
      if (germanGrammarBookBtn) {
        // Remove placeholder class so the generic placeholder handler won't fire
        germanGrammarBookBtn.classList.remove('german-placeholder-trigger');
        germanGrammarBookBtn.addEventListener('click', () => {
          this._openGrammarBook(
            typeof GERMAN_GRAMMAR_DATA !== 'undefined' ? GERMAN_GRAMMAR_DATA : null,
            'German / Grammar Book',
            () => this.showScreen('germanGrammarScreen')
          );
        });
      }

      // English Grammar Book — real data (handled by EnglishApp, but wired here too for safety)
      const englishGrammarBookBtn = document.querySelector(
        '#englishGrammarScreen .english-placeholder-trigger[data-module="grammar-book"]'
      );
      if (englishGrammarBookBtn) {
        englishGrammarBookBtn.classList.remove('english-placeholder-trigger');
        englishGrammarBookBtn.addEventListener('click', () => {
          this._openGrammarBook(
            typeof ENGLISH_GRAMMAR_DATA !== 'undefined' ? ENGLISH_GRAMMAR_DATA : null,
            'English / Grammar Book',
            () => this.showScreen('englishGrammarScreen')
          );
        });
      }

      // Grammar book back button — returns to whichever screen opened it
      this._grammarBookBackTarget = null;
      this.bindClick('grammarBookBackBtn', () => {
        if (typeof this._grammarBookBackTarget === 'function') {
          this._grammarBookBackTarget();
        } else {
          this.showScreen('grammarScreen');
        }
      });
    },

    _openGrammarBook(data, breadcrumbTitle, backFn) {
      this._grammarBookBackTarget = backFn;

      // Update grammar book header title if desired
      const backBtn = document.getElementById('grammarBookBackBtn');
      if (backBtn) backBtn.textContent = '← 返回';

      // Update welcome text inside grammar book
      const welcomeEl = document.querySelector('#grammarBookScreen .grammar-welcome h2');
      if (welcomeEl && breadcrumbTitle) welcomeEl.textContent = breadcrumbTitle;

      // Init GrammarBook with provided data (or fall back to Italian)
      if (typeof GrammarBook !== 'undefined') {
        GrammarBook.init(data || undefined);
      }

      this.showScreen('grammarBookScreen');
    },

    bindGermanPractice() {
      this.bindClick('germanMultipleChoiceBtn', () => this.startMultipleChoice());
      this.bindClick('germanSpellingBtn', () => this.startSpelling());
      this.bindClick('germanBrowseBtn', () => this.openBrowse());

      this.bindClick('germanMcBackBtn', () => this.showScreen('germanVocabularyModesScreen'));
      this.bindClick('germanMcShowHintBtn', () => {
        document.getElementById('germanMcHint')?.classList.remove('hidden');
        document.getElementById('germanMcShowHintBtn')?.classList.add('hidden');
      });
      this.bindClick('germanMcNextBtn', () => this.nextMultipleChoiceQuestion());

      this.bindClick('germanSpBackBtn', () => this.showScreen('germanVocabularyModesScreen'));
      this.bindClick('germanSpCheckBtn', () => this.checkSpellingAnswer());
      this.bindClick('germanSpNextBtn', () => this.nextSpellingQuestion());
      this.bindClick('germanPronunciationBtn', () => {
        if (this.currentWord) {
          this.speakGerman(this.currentWord.display || this.currentWord.german || '');
        }
      });
      const input = document.getElementById('germanSpInput');
      input?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          this.checkSpellingAnswer();
        }
      });

      this.bindClick('germanBrowseBackBtn', () => this.showScreen('germanVocabularyModesScreen'));
      this.bindClick('germanFilterBtn', () => this.toggleBrowseFilter());
      document.getElementById('germanSearchInput')?.addEventListener('input', (event) => {
        this.renderBrowse(event.target.value || '');
      });
    },

    bindPlaceholderTriggers() {
      document.querySelectorAll('.german-placeholder-trigger').forEach((button) => {
        button.addEventListener('click', () => {
          const module = button.dataset.module || 'module';
          this.showGermanPlaceholder(module, `查看德语 ${module} 模块内容。`);
        });
      });

      document.querySelectorAll('.english-placeholder-trigger').forEach((button) => {
        button.addEventListener('click', () => {
          const module = button.dataset.module || 'module';
          this.showEnglishPlaceholder(module, `Open the English ${module} module.`);
        });
      });

      this.bindClick('languageSkeletonPlaceholderBackBtn', () => {
        if (this.activeLanguage === 'german') {
          this.showScreen('germanWelcomeScreen');
        } else if (this.activeLanguage === 'english') {
          this.showScreen('englishWelcomeScreen');
        } else {
          this.showScreen('welcomeScreen');
        }
      });
    },

    showGermanPlaceholder(moduleTitle, description) {
      this.activeLanguage = 'german';
      this.updateLanguageSwitcherUI('german');
      this.fillPlaceholder({
        eyebrow: 'German / Module',
        title: moduleTitle,
        language: 'German',
        module: moduleTitle,
        description,
        dataHint: '德语词汇、练习内容与页面说明。'
      });
      this.showScreen('languageSkeletonPlaceholderScreen');
    },

    showEnglishPlaceholder(moduleTitle, description) {
      this.activeLanguage = 'english';
      this.updateLanguageSwitcherUI('english');
      this.fillPlaceholder({
        eyebrow: 'English / Module',
        title: moduleTitle,
        language: 'English',
        module: moduleTitle,
        description,
        dataHint: 'English vocabulary, exercises, and module information.'
      });
      this.showScreen('languageSkeletonPlaceholderScreen');
    },

    fillPlaceholder({ eyebrow, title, language, module, description, dataHint }) {
      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };

      setText('languageSkeletonPlaceholderEyebrow', eyebrow);
      setText('languageSkeletonPlaceholderLanguage', language);
      setText('languageSkeletonPlaceholderModule', module);
      setText('languageSkeletonPlaceholderDescription', description);
      setText('languageSkeletonPlaceholderDataHint', dataHint);

      const titleEl = document.getElementById('languageSkeletonPlaceholderTitle');
      if (titleEl) {
        titleEl.innerHTML = `<svg class="icon"><use href="#icon-puzzle"></use></svg>${this.escapeHtml(title)}`;
      }
    },

    startMultipleChoice() {
      this.sessionWords = this.shuffle(this.words.slice());
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this.showScreen('germanMultipleChoiceScreen');
      this.loadMultipleChoiceQuestion();
    },

    loadMultipleChoiceQuestion() {
      if (this.quizIndex >= this.sessionWords.length) {
        this.finishPractice('multiple-choice');
        return;
      }

      this.currentWord = this.sessionWords[this.quizIndex];
      const currentDisplay = this.currentWord.display || this.currentWord.german || '-';
      this.setText('germanMcCurrentWord', String(this.quizIndex + 1));
      this.setText('germanMcTotalWords', String(this.sessionWords.length));
      this.setText('germanMcAccuracy', `${this.getAccuracy()}%`);
      this.setText('germanMcWord', currentDisplay);

      const hint = document.getElementById('germanMcHint');
      const hintBtn = document.getElementById('germanMcShowHintBtn');
      if (hint) {
        hint.textContent = this.currentWord.notes || '';
        hint.classList.toggle('hidden', !this.currentWord.notes);
        if (this.currentWord.notes) hint.classList.add('hidden');
      }
      if (hintBtn) {
        hintBtn.classList.toggle('hidden', !this.currentWord.notes);
      }

      this.renderMcOptions();
      this.resetFeedback('germanMcFeedback');
      this.speakGerman(currentDisplay);
    },

    renderMcOptions() {
      const container = document.getElementById('germanMcOptions');
      if (!container || !this.currentWord) return;

      const correctMeaning = this.currentWord.meaning || this.currentWord.chinese || '';
      const distractors = this.shuffle(
        this.words.filter((word) => word.german !== this.currentWord.german && (word.meaning || word.chinese) !== correctMeaning)
      ).slice(0, 3);

      const options = this.shuffle([
        correctMeaning,
        ...distractors.map((word) => word.meaning || word.chinese || '')
      ]);

      container.innerHTML = options.map((option) => `
        <button class="option-btn" data-answer="${this.escapeAttribute(option)}">${this.escapeHtml(option || '—')}</button>
      `).join('');

      container.querySelectorAll('.option-btn').forEach((button) => {
        button.addEventListener('click', () => this.checkMultipleChoiceAnswer(button));
      });
    },

    checkMultipleChoiceAnswer(button) {
      if (!this.currentWord) return;

      const correctAnswer = this.currentWord.meaning || this.currentWord.chinese || '';
      const selectedAnswer = button.dataset.answer || '';
      const isCorrect = selectedAnswer === correctAnswer;

      this.quizTotal += 1;
      this.stats.mcAttempts += 1;

      if (isCorrect) {
        this.quizCorrect += 1;
        this.stats.mcCorrect += 1;
        this.mastered.add(this.currentWord.german);
      }

      document.querySelectorAll('#germanMcOptions .option-btn').forEach((optionButton) => {
        optionButton.disabled = true;
        if ((optionButton.dataset.answer || '') === correctAnswer) {
          optionButton.classList.add('correct');
        } else if (optionButton === button && !isCorrect) {
          optionButton.classList.add('incorrect');
        }
      });

      this.showFeedback(
        'germanMcFeedback',
        isCorrect ? '回答正确' : `回答有误，正确释义：${correctAnswer}`,
        isCorrect
      );

      this.setText('germanMcAccuracy', `${this.getAccuracy()}%`);
      this.saveState();

      if (isCorrect) {
        setTimeout(() => this.nextMultipleChoiceQuestion(), 900);
      }
    },

    nextMultipleChoiceQuestion() {
      this.quizIndex += 1;
      this.loadMultipleChoiceQuestion();
    },

    startSpelling() {
      this.sessionWords = this.shuffle(this.words.slice());
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this.showScreen('germanSpellingScreen');
      this.loadSpellingQuestion();
    },

    loadSpellingQuestion() {
      if (this.quizIndex >= this.sessionWords.length) {
        this.finishPractice('spelling');
        return;
      }

      this.currentWord = this.sessionWords[this.quizIndex];
      this.setText('germanSpCurrentWord', String(this.quizIndex + 1));
      this.setText('germanSpTotalWords', String(this.sessionWords.length));
      this.setText('germanSpAccuracy', `${this.getAccuracy()}%`);
      this.setText('germanSpMeaning', this.currentWord.meaning || this.currentWord.chinese || '-');
      this.setText('germanSpHint', this.currentWord.notes || '');
      document.getElementById('germanSpHint')?.classList.toggle('hidden', !this.currentWord.notes);

      const input = document.getElementById('germanSpInput');
      const checkBtn = document.getElementById('germanSpCheckBtn');
      if (input) {
        input.value = '';
        input.disabled = false;
        input.focus();
      }
      if (checkBtn) checkBtn.disabled = false;

      this.resetFeedback('germanSpFeedback');
    },

    checkSpellingAnswer() {
      if (!this.currentWord) return;
      const input = document.getElementById('germanSpInput');
      const checkBtn = document.getElementById('germanSpCheckBtn');
      const userAnswer = input ? input.value.trim() : '';

      const validAnswers = [
        this.currentWord.german,
        this.currentWord.display
      ].filter(Boolean).map((value) => this.toGermanComparable(value));

      const normalizedAnswer = this.toGermanComparable(userAnswer);
      const isCorrect = validAnswers.includes(normalizedAnswer);

      this.quizTotal += 1;
      this.stats.spAttempts += 1;
      if (isCorrect) {
        this.quizCorrect += 1;
        this.stats.spCorrect += 1;
        this.mastered.add(this.currentWord.german);
      }

      if (input) input.disabled = true;
      if (checkBtn) checkBtn.disabled = true;

      const correctDisplay = this.currentWord.display || this.currentWord.german || '';
      this.showFeedback(
        'germanSpFeedback',
        isCorrect ? '回答正确' : `回答有误，正确拼写：${correctDisplay}`,
        isCorrect
      );

      this.setText('germanSpAccuracy', `${this.getAccuracy()}%`);
      this.saveState();

      if (isCorrect) {
        setTimeout(() => this.nextSpellingQuestion(), 900);
      }
    },

    nextSpellingQuestion() {
      this.quizIndex += 1;
      this.loadSpellingQuestion();
    },

    openBrowse() {
      this.showScreen('germanBrowseScreen');
      const searchInput = document.getElementById('germanSearchInput');
      if (searchInput) searchInput.value = '';
      this.updateBrowseFilterText();
      this.renderBrowse('');
    },

    toggleBrowseFilter() {
      const filters = ['all', 'mastered', 'unmastered'];
      const currentIndex = filters.indexOf(this.browseFilter);
      this.browseFilter = filters[(currentIndex + 1) % filters.length];
      this.saveState();
      this.updateBrowseFilterText();
      this.renderBrowse(document.getElementById('germanSearchInput')?.value || '');
    },

    updateBrowseFilterText() {
      const labels = {
        all: '全部',
        mastered: '已掌握',
        unmastered: '未掌握'
      };
      this.setText('germanFilterText', labels[this.browseFilter] || '全部');
    },

    renderBrowse(searchTerm = '') {
      const container = document.getElementById('germanWordList');
      if (!container) return;

      const keyword = String(searchTerm || '').trim().toLowerCase();
      let words = this.words.slice();

      if (this.browseFilter === 'mastered') {
        words = words.filter((word) => this.mastered.has(word.german));
      } else if (this.browseFilter === 'unmastered') {
        words = words.filter((word) => !this.mastered.has(word.german));
      }

      if (keyword) {
        words = words.filter((word) => {
          const haystack = [word.german, word.display, word.meaning, word.chinese, word.notes]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(keyword);
        });
      }

      if (!words.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">没有找到匹配的德语词汇</p>';
        return;
      }

      container.innerHTML = words.map((word) => {
        const mastered = this.mastered.has(word.german);
        return `
          <div class="word-item ${mastered ? 'mastered' : ''}" data-word="${this.escapeAttribute(word.display || word.german || '')}">
            <div class="word-item-left">
              <div class="word-italian"><svg class="icon"><use href="#icon-volume"></use></svg> ${this.escapeHtml(word.display || word.german || '')}</div>
              <div class="word-english">${this.escapeHtml(word.meaning || word.chinese || '—')}</div>
              ${word.notes ? `<div class="word-notes">${this.escapeHtml(word.notes)}</div>` : ''}
            </div>
            <div class="word-item-right">
              <span class="word-rank">#${word.rank || '-'}</span>
              ${mastered ? '<span class="mastered-badge">已掌握</span>' : ''}
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.word-item').forEach((item) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => this.speakGerman(item.dataset.word || ''));
      });
    },

    finishPractice(mode) {
      const accuracy = this.getAccuracy();
      const modeName = mode === 'spelling' ? '拼写' : '选择题';
      alert(`德语${modeName}练习完成\n\n正确: ${this.quizCorrect}/${this.quizTotal}\n正确率: ${accuracy}%`);
      this.showScreen('germanVocabularyModesScreen');
    },

    getAccuracy() {
      return this.quizTotal > 0 ? Math.round((this.quizCorrect / this.quizTotal) * 100) : 0;
    },

    showFeedback(id, text, isCorrect) {
      const feedback = document.getElementById(id);
      if (!feedback) return;
      const textEl = feedback.querySelector('.feedback-text');
      if (textEl) textEl.textContent = text;
      feedback.classList.remove('hidden', 'correct', 'incorrect');
      feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    },

    resetFeedback(id) {
      const feedback = document.getElementById(id);
      if (!feedback) return;
      feedback.classList.add('hidden');
      feedback.classList.remove('correct', 'incorrect');
      const textEl = feedback.querySelector('.feedback-text');
      if (textEl) textEl.textContent = '';
    },

    speakGerman(text) {
      if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((item) => /^de/i.test(item.lang));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },

    showScreen(screenId) {
      if (typeof showScreen === 'function') {
        showScreen(screenId, { skipHistory: true });
        return;
      }

      document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
      document.getElementById(screenId)?.classList.add('active');
    },

    bindClick(id, handler) {
      document.getElementById(id)?.addEventListener('click', handler);
    },

    setText(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    },

    toGermanComparable(value) {
      return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/\//g, '')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .normalize('NFC');
    },

    shuffle(array) {
      const copy = array.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },

    escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    escapeAttribute(value) {
      return this.escapeHtml(value).replace(/`/g, '&#96;');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EnglishApp — English vocabulary practice (MC / Spelling / Browse)
  // ─────────────────────────────────────────────────────────────────────────
  const EnglishApp = {
    words: [],
    sessionWords: [],
    mastered: new Set(),
    stats: { mcAttempts: 0, mcCorrect: 0, spAttempts: 0, spCorrect: 0 },
    currentWord: null,
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    browseFilter: 'all',
    _germanApp: null,

    init(germanApp) {
      this._germanApp = germanApp;
      if (typeof ENGLISH_VOCABULARY_DATA === 'undefined') {
        console.warn('ENGLISH_VOCABULARY_DATA 未加载，跳过 EnglishApp 初始化');
        return;
      }
      this.words = Array.isArray(ENGLISH_VOCABULARY_DATA) ? ENGLISH_VOCABULARY_DATA.slice() : [];
      this._loadState();
      this._bindPractice();
    },

    _loadState() {
      try {
        const m = localStorage.getItem(STORAGE_KEYS.EN_MASTERED);
        if (m) this.mastered = new Set(JSON.parse(m));
        const s = localStorage.getItem(STORAGE_KEYS.EN_STATS);
        if (s) this.stats = { ...this.stats, ...JSON.parse(s) };
        const f = localStorage.getItem(STORAGE_KEYS.EN_FILTER);
        if (f) this.browseFilter = f;
      } catch (e) {
        console.error('EnglishApp 状态加载失败:', e);
      }
    },

    _saveState() {
      try {
        localStorage.setItem(STORAGE_KEYS.EN_MASTERED, JSON.stringify([...this.mastered]));
        localStorage.setItem(STORAGE_KEYS.EN_STATS, JSON.stringify(this.stats));
        localStorage.setItem(STORAGE_KEYS.EN_FILTER, this.browseFilter);
      } catch (e) {
        console.error('EnglishApp 状态保存失败:', e);
      }
    },

    _bindPractice() {
      const g = this._germanApp;

      // Mode buttons
      g.bindClick('englishMultipleChoiceBtn', () => this.startMultipleChoice());
      g.bindClick('englishSpellingBtn', () => this.startSpelling());
      g.bindClick('englishBrowseBtn', () => this.openBrowse());

      // MC screen
      g.bindClick('englishMcBackBtn', () => g.showScreen('englishVocabularyModesScreen'));
      g.bindClick('englishMcShowHintBtn', () => {
        document.getElementById('englishMcHint')?.classList.remove('hidden');
        document.getElementById('englishMcShowHintBtn')?.classList.add('hidden');
      });
      g.bindClick('englishMcNextBtn', () => this.nextMcQuestion());

      // Spelling screen
      g.bindClick('englishSpBackBtn', () => g.showScreen('englishVocabularyModesScreen'));
      g.bindClick('englishSpCheckBtn', () => this.checkSpelling());
      g.bindClick('englishSpNextBtn', () => this.nextSpelling());
      g.bindClick('englishPronunciationBtn', () => {
        if (this.currentWord) this._speak(this.currentWord.english || '');
      });
      document.getElementById('englishSpInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.checkSpelling();
      });

      // Browse screen
      g.bindClick('englishBrowseBackBtn', () => g.showScreen('englishVocabularyModesScreen'));
      g.bindClick('englishFilterBtn', () => this._toggleFilter());
      document.getElementById('englishSearchInput')?.addEventListener('input', (e) => {
        this._renderBrowse(e.target.value || '');
      });
    },

    loadWordbookProgress(id, language = 'english') {
      try {
        const raw = localStorage.getItem(`dimenticato_progress_wb_${language}_${id}`) || '[]';
        this.mastered = new Set(JSON.parse(raw));
      } catch (error) {
        this.mastered = new Set();
      }
    },

    startMultipleChoice() {
      if (!this.words.length) {
        alert('英语词汇数据尚未加载。');
        return;
      }
      this.sessionWords = this._shuffle(this.words.slice());
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this._germanApp.showScreen('englishMultipleChoiceScreen');
      this._loadMcQuestion();
    },

    _loadMcQuestion() {
      if (this.quizIndex >= this.sessionWords.length) {
        this._finishPractice('multiple-choice');
        return;
      }
      const g = this._germanApp;
      this.currentWord = this.sessionWords[this.quizIndex];
      const word = this.currentWord.english || '-';
      g.setText('englishMcCurrentWord', String(this.quizIndex + 1));
      g.setText('englishMcTotalWords', String(this.sessionWords.length));
      g.setText('englishMcAccuracy', `${this._accuracy()}%`);
      g.setText('englishMcWord', word);

      const hint = document.getElementById('englishMcHint');
      const hintBtn = document.getElementById('englishMcShowHintBtn');
      const hasHint = !!(this.currentWord.notes);
      if (hint) { hint.textContent = this.currentWord.notes || ''; hint.classList.add('hidden'); }
      if (hintBtn) hintBtn.classList.toggle('hidden', !hasHint);

      this._renderMcOptions();
      g.resetFeedback('englishMcFeedback');
      this._speak(word);
    },

    _renderMcOptions() {
      const container = document.getElementById('englishMcOptions');
      if (!container || !this.currentWord) return;
      const correct = this.currentWord.meaning || this.currentWord.chinese || '';
      const distractors = this._shuffle(
        this.words.filter(w => w.english !== this.currentWord.english && (w.meaning || w.chinese) !== correct)
      ).slice(0, 3);
      const options = this._shuffle([correct, ...distractors.map(w => w.meaning || w.chinese || '')]);
      const g = this._germanApp;
      container.innerHTML = options.map(o =>
        `<button class="option-btn" data-answer="${g.escapeAttribute(o)}">${g.escapeHtml(o || '—')}</button>`
      ).join('');
      container.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => this._checkMcAnswer(btn));
      });
    },

    _checkMcAnswer(button) {
      if (!this.currentWord) return;
      const g = this._germanApp;
      const correct = this.currentWord.meaning || this.currentWord.chinese || '';
      const selected = button.dataset.answer || '';
      const isCorrect = selected === correct;

      this.quizTotal++;
      this.stats.mcAttempts++;
      if (isCorrect) { this.quizCorrect++; this.stats.mcCorrect++; this.mastered.add(this.currentWord.english); }

      document.querySelectorAll('#englishMcOptions .option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.answer === correct) btn.classList.add('correct');
        else if (btn === button && !isCorrect) btn.classList.add('incorrect');
      });

      g.showFeedback('englishMcFeedback',
        isCorrect ? '回答正确' : `回答有误，正确释义：${correct}`, isCorrect);
      g.setText('englishMcAccuracy', `${this._accuracy()}%`);
      this._saveState();
      if (isCorrect) setTimeout(() => this.nextMcQuestion(), 900);
    },

    nextMcQuestion() {
      this.quizIndex++;
      this._loadMcQuestion();
    },

    startSpelling() {
      if (!this.words.length) {
        alert('英语词汇数据尚未加载。');
        return;
      }
      this.sessionWords = this._shuffle(this.words.slice());
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this._germanApp.showScreen('englishSpellingScreen');
      this._loadSpellingQuestion();
    },

    _loadSpellingQuestion() {
      if (this.quizIndex >= this.sessionWords.length) {
        this._finishPractice('spelling');
        return;
      }
      const g = this._germanApp;
      this.currentWord = this.sessionWords[this.quizIndex];
      g.setText('englishSpCurrentWord', String(this.quizIndex + 1));
      g.setText('englishSpTotalWords', String(this.sessionWords.length));
      g.setText('englishSpAccuracy', `${this._accuracy()}%`);
      g.setText('englishSpMeaning', this.currentWord.meaning || this.currentWord.chinese || '-');
      g.setText('englishSpHint', this.currentWord.notes || '');
      document.getElementById('englishSpHint')?.classList.toggle('hidden', !this.currentWord.notes);

      const input = document.getElementById('englishSpInput');
      const checkBtn = document.getElementById('englishSpCheckBtn');
      if (input) { input.value = ''; input.disabled = false; input.focus(); }
      if (checkBtn) checkBtn.disabled = false;
      g.resetFeedback('englishSpFeedback');
    },

    checkSpelling() {
      if (!this.currentWord) return;
      const g = this._germanApp;
      const input = document.getElementById('englishSpInput');
      const checkBtn = document.getElementById('englishSpCheckBtn');
      const userAnswer = input ? input.value.trim().toLowerCase().replace(/\s+/g, ' ') : '';
      const correct = (this.currentWord.english || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const isCorrect = userAnswer === correct;

      this.quizTotal++;
      this.stats.spAttempts++;
      if (isCorrect) { this.quizCorrect++; this.stats.spCorrect++; this.mastered.add(this.currentWord.english); }
      if (input) input.disabled = true;
      if (checkBtn) checkBtn.disabled = true;

      g.showFeedback('englishSpFeedback',
        isCorrect ? '回答正确' : `回答有误，正确拼写：${this.currentWord.english}`, isCorrect);
      g.setText('englishSpAccuracy', `${this._accuracy()}%`);
      this._saveState();
      if (isCorrect) setTimeout(() => this.nextSpelling(), 900);
    },

    nextSpelling() {
      this.quizIndex++;
      this._loadSpellingQuestion();
    },

    openBrowse() {
      const g = this._germanApp;
      g.showScreen('englishBrowseScreen');
      const searchInput = document.getElementById('englishSearchInput');
      if (searchInput) searchInput.value = '';
      this._updateFilterText();
      this._renderBrowse('');
    },

    _toggleFilter() {
      const filters = ['all', 'mastered', 'unmastered'];
      const idx = filters.indexOf(this.browseFilter);
      this.browseFilter = filters[(idx + 1) % filters.length];
      this._saveState();
      this._updateFilterText();
      this._renderBrowse(document.getElementById('englishSearchInput')?.value || '');
    },

    _updateFilterText() {
      const labels = { all: '全部', mastered: '已掌握', unmastered: '未掌握' };
      this._germanApp.setText('englishFilterText', labels[this.browseFilter] || '全部');
    },

    _renderBrowse(searchTerm = '') {
      const container = document.getElementById('englishWordList');
      if (!container) return;
      const g = this._germanApp;
      const keyword = String(searchTerm || '').trim().toLowerCase();
      let words = this.words.slice();

      if (this.browseFilter === 'mastered') words = words.filter(w => this.mastered.has(w.english));
      else if (this.browseFilter === 'unmastered') words = words.filter(w => !this.mastered.has(w.english));

      if (keyword) {
        words = words.filter(w => {
          const hay = [w.english, w.meaning, w.chinese, w.notes].filter(Boolean).join(' ').toLowerCase();
          return hay.includes(keyword);
        });
      }

      if (!words.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">没有找到匹配的英语词汇</p>';
        return;
      }

      container.innerHTML = words.map(word => {
        const isMastered = this.mastered.has(word.english);
        return `
          <div class="word-item ${isMastered ? 'mastered' : ''}" data-word="${g.escapeAttribute(word.english || '')}">
            <div class="word-item-left">
              <div class="word-italian"><svg class="icon"><use href="#icon-volume"></use></svg> ${g.escapeHtml(word.english || '')}</div>
              <div class="word-english">${g.escapeHtml(word.meaning || word.chinese || '—')}</div>
              ${word.notes ? `<div class="word-notes">${g.escapeHtml(word.notes)}</div>` : ''}
            </div>
            <div class="word-item-right">
              <span class="word-rank">#${word.rank || '-'}</span>
              ${isMastered ? '<span class="mastered-badge">已掌握</span>' : ''}
            </div>
          </div>`;
      }).join('');

      container.querySelectorAll('.word-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => this._speak(item.dataset.word || ''));
      });
    },

    updateProgressStats() {
      const totalWords = this.words.length;
      const masteredCount = [...this.mastered].filter(word => this.words.some(w => w.english === word)).length;
      const progress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
      const totalAttempts = (this.stats.mcAttempts || 0) + (this.stats.spAttempts || 0);
      const totalCorrect = (this.stats.mcCorrect || 0) + (this.stats.spCorrect || 0);
      const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

      this._germanApp.setText('englishProgressTotalWords', totalWords.toLocaleString());
      this._germanApp.setText('englishProgressMasteredWords', masteredCount.toLocaleString());
      this._germanApp.setText('englishProgressPercent', `${progress}%`);
      this._germanApp.setText('englishProgressMcStats', `${this.stats.mcCorrect || 0} / ${this.stats.mcAttempts || 0}`);
      this._germanApp.setText('englishProgressSpStats', `${this.stats.spCorrect || 0} / ${this.stats.spAttempts || 0}`);
      this._germanApp.setText('englishProgressAccuracy', `${accuracy}%`);
    },

    _finishPractice(mode) {
      const acc = this._accuracy();
      const name = mode === 'spelling' ? 'Spelling' : 'Multiple Choice';
      alert(`English ${name} practice complete\n\nCorrect: ${this.quizCorrect}/${this.quizTotal}\nAccuracy: ${acc}%`);
      this._germanApp.showScreen('englishVocabularyModesScreen');
    },

    _accuracy() {
      return this.quizTotal > 0 ? Math.round((this.quizCorrect / this.quizTotal) * 100) : 0;
    },

    _speak(text) {
      if (!text || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => /^en/i.test(v.lang));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },

    _shuffle(array) {
      const copy = array.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GermanApp.init());
  } else {
    GermanApp.init();
  }

  window.GermanApp = GermanApp;
  window.EnglishApp = EnglishApp;
})();
