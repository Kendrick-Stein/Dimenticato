/**
 * Cognate Practice Module
 * 三种 cognate 练习模式：
 * 1. EnglishPromptMode - 英语提示，拼写意大利语
 * 2. ContrastMode - 对比显示，高亮差异
 * 3. PatternGroupMode - 按后缀规律分组练习
 * 4. BrowseMode - 浏览 cognate 词表
 */

(function () {
  'use strict';

  // === DOM Helper ===

  function getContainer() {
    var container = document.getElementById('cognatePracticeContainer');
    if (!container) {
      console.error('cognatePracticeContainer not found');
      return null;
    }
    return container;
  }

  // === Cognate State ===
  const CognateState = {
    words: [],           // 当前练习的 cognate 词表
    currentIndex: 0,     // 当前题目索引
    correctCount: 0,     // 正确计数
    totalCount: 0,       // 总答题数
    currentMode: null,   // 当前练习模式
    currentPattern: null, // 当前练习的后缀规律（PatternGroupMode）
    masteredPatterns: new Set() // 已完成的后缀规律组
  };

  // === Storage ===
  const COGNATE_STORAGE_KEY = 'dimenticato_cognate_progress';

  function saveCognateProgress() {
    try {
      localStorage.setItem(COGNATE_STORAGE_KEY, JSON.stringify({
        mastered: [...CognateState.masteredPatterns]
      }));
    } catch (e) {
      console.error('保存 cognate 进度失败:', e);
    }
  }

  function loadCognateProgress() {
    try {
      const data = localStorage.getItem(COGNATE_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        CognateState.masteredPatterns = new Set(parsed.mastered || []);
      }
    } catch (e) {
      console.error('加载 cognate 进度失败:', e);
    }
  }

  // === Utility Functions ===

  /**
   * 高亮差异部分
   * 返回两个单词的 HTML，差异部分用 <span class="cognate-diff"> 标记
   */
  function highlightDiff(italian, english) {
    const it = italian.toLowerCase();
    const en = english.toLowerCase();

    // 找到公共前缀和后缀
    let prefixLen = 0;
    while (prefixLen < it.length && prefixLen < en.length && it[prefixLen] === en[prefixLen]) {
      prefixLen++;
    }

    let suffixLen = 0;
    while (suffixLen < it.length - prefixLen && suffixLen < en.length - prefixLen) {
      if (it[it.length - 1 - suffixLen] === en[en.length - 1 - suffixLen]) {
        suffixLen++;
      } else {
        break;
      }
    }

    const commonPrefix = italian.slice(0, prefixLen);
    const itDiff = italian.slice(prefixLen, italian.length - suffixLen);
    const enDiff = english.slice(prefixLen, english.length - suffixLen);
    const commonSuffix = italian.slice(italian.length - suffixLen);

    return {
      italianHtml: escapeHtml(commonPrefix) +
                   (itDiff ? '<span class="cognate-diff">' + escapeHtml(itDiff) + '</span>' : '') +
                   escapeHtml(commonSuffix),
      englishHtml: escapeHtml(commonPrefix) +
                   (enDiff ? '<span class="cognate-diff">' + escapeHtml(enDiff) + '</span>' : '') +
                   escapeHtml(english.slice(english.length - suffixLen))
    };
  }

  /**
   * 标准化文本用于答案比对（忽略重音）
   */
  function normalizeForCompare(str) {
    return (str || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * HTML 转义
   */
  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 属性转义
   */
  function escapeAttribute(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // === Mode 1: English Prompt Mode ===

  const EnglishPromptMode = {
    start(words) {
      CognateState.words = this.shuffleArray(words);
      CognateState.currentIndex = 0;
      CognateState.correctCount = 0;
      CognateState.totalCount = 0;
      CognateState.currentMode = 'englishPrompt';

      this.showQuestion();
    },

    shuffleArray(array) {
      const arr = array.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },

    showQuestion() {
      var word = CognateState.words[CognateState.currentIndex];
      var container = getContainer();
      if (!container) return;

      container.innerHTML =
        '<div class="quiz-card">' +
          '<div class="quiz-header">' +
            '<span class="quiz-progress">' + (CognateState.currentIndex + 1) + ' / ' + CognateState.words.length + '</span>' +
            '<span class="quiz-accuracy">Accuracy: ' + this.getAccuracy() + '%</span>' +
          '</div>' +
          '<div class="quiz-content">' +
            '<div class="quiz-prompt">' +
              '<div class="prompt-english">English: <strong>' + escapeHtml(word.english) + '</strong></div>' +
              '<div class="prompt-chinese">' + escapeHtml(word.chinese) + '</div>' +
            '</div>' +
            '<input type="text" class="spelling-input" id="cognateInput" placeholder="Type the Italian word..." autocomplete="off">' +
          '</div>' +
          '<div class="quiz-actions">' +
            '<button class="btn primary" id="cognateCheckBtn">Check</button>' +
            '<button class="btn" id="cognateSkipBtn">Skip</button>' +
          '</div>' +
          '<div class="quiz-feedback hidden" id="cognateFeedback"></div>' +
        '</div>';

      document.getElementById('cognateInput').focus();
      document.getElementById('cognateCheckBtn').addEventListener('click', function() { EnglishPromptMode.checkAnswer(word); });
      document.getElementById('cognateSkipBtn').addEventListener('click', function() { EnglishPromptMode.skip(word); });
      document.getElementById('cognateInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') EnglishPromptMode.checkAnswer(word);
      });
    },

    checkAnswer(word) {
      var input = document.getElementById('cognateInput');
      var feedback = document.getElementById('cognateFeedback');
      var accuracyEl = document.querySelector('.quiz-accuracy');
      var userAnswer = input.value.trim();

      CognateState.totalCount++;

      var isCorrect = normalizeForCompare(userAnswer) === normalizeForCompare(word.italian);

      if (isCorrect) {
        CognateState.correctCount++;
        feedback.innerHTML = '<span class="feedback-text">✓ 正确！</span>';
        feedback.classList.remove('incorrect');
        feedback.classList.add('correct');
        feedback.classList.remove('hidden');
        if (accuracyEl) accuracyEl.textContent = 'Accuracy: ' + this.getAccuracy() + '%';
        setTimeout(function() { EnglishPromptMode.nextQuestion(); }, 1200);
      } else {
        var diff = highlightDiff(word.italian, word.english);
        feedback.innerHTML =
          '<span class="feedback-text">✗ 错误，正确答案：</span>' +
          '<div class="answer-comparison">' +
            '<div><strong>Italian:</strong> ' + diff.italianHtml + '</div>' +
            '<div><strong>English:</strong> ' + diff.englishHtml + '</div>' +
          '</div>' +
          '<button class="btn primary next-btn" id="cognateNextBtn">下一题 →</button>';
        feedback.classList.remove('correct');
        feedback.classList.add('incorrect');
        feedback.classList.remove('hidden');
        if (accuracyEl) accuracyEl.textContent = 'Accuracy: ' + this.getAccuracy() + '%';
        input.disabled = true;
        document.getElementById('cognateCheckBtn').disabled = true;
        document.getElementById('cognateSkipBtn').disabled = true;
        document.getElementById('cognateNextBtn').addEventListener('click', function() { EnglishPromptMode.nextQuestion(); });
      }
    },

    skip(word) {
      var feedback = document.getElementById('cognateFeedback');
      var diff = highlightDiff(word.italian, word.english);
      feedback.innerHTML =
        '<span class="feedback-text">跳过，正确答案：</span>' +
        '<div class="answer-comparison">' +
          '<div><strong>Italian:</strong> ' + diff.italianHtml + '</div>' +
          '<div><strong>English:</strong> ' + diff.englishHtml + '</div>' +
        '</div>' +
        '<button class="btn primary next-btn" id="cognateNextBtn">下一题 →</button>';
      feedback.classList.remove('hidden');
      document.getElementById('cognateInput').disabled = true;
      document.getElementById('cognateCheckBtn').disabled = true;
      document.getElementById('cognateSkipBtn').disabled = true;
      document.getElementById('cognateNextBtn').addEventListener('click', function() { EnglishPromptMode.nextQuestion(); });
    },

    nextQuestion() {
      CognateState.currentIndex++;
      if (CognateState.currentIndex < CognateState.words.length) {
        this.showQuestion();
      } else {
        this.showComplete();
      }
    },

    getAccuracy() {
      if (CognateState.totalCount === 0) return 0;
      return Math.round((CognateState.correctCount / CognateState.totalCount) * 100);
    },

    showComplete() {
      var container = getContainer();
      if (!container) return;
      var accuracy = this.getAccuracy();
      container.innerHTML =
        '<div class="quiz-card">' +
          '<div class="quiz-header">' +
            '<h2>练习完成！</h2>' +
          '</div>' +
          '<div class="quiz-content">' +
            '<div class="complete-stats">' +
              '<div class="stat-item">正确: <strong>' + CognateState.correctCount + ' / ' + CognateState.totalCount + '</strong></div>' +
              '<div class="stat-item">准确率: <strong>' + accuracy + '%</strong></div>' +
            '</div>' +
          '</div>' +
          '<div class="quiz-actions">' +
            '<button class="btn primary" onclick="CognateApp.startEnglishPromptMode()">再练一次</button>' +
            '<button class="btn" onclick="CognateApp.showModeSelection()">返回模式选择</button>' +
          '</div>' +
        '</div>';
    }
  };

  // === Mode 2: Contrast Mode ===

  const ContrastMode = {
    start(words, filter) {
      var filteredWords = words;
      if (filter) {
        if (filter.difficulty) {
          filteredWords = words.filter(function(w) { return w.difficulty === filter.difficulty; });
        } else if (filter.patternType) {
          filteredWords = words.filter(function(w) { return w.patternType === filter.patternType; });
        }
      }

      CognateState.words = filteredWords;
      CognateState.currentIndex = 0;
      CognateState.currentMode = 'contrast';

      this.showWord();
    },

    showWord() {
      var word = CognateState.words[CognateState.currentIndex];
      var container = getContainer();
      if (!container) return;
      var diff = highlightDiff(word.italian, word.english);

      container.innerHTML =
        '<div class="contrast-card">' +
          '<div class="contrast-row">' +
            '<span class="lang-label">Italian:</span>' +
            '<span class="contrast-word">' + diff.italianHtml + '</span>' +
          '</div>' +
          '<div class="contrast-row">' +
            '<span class="lang-label">English:</span>' +
            '<span class="contrast-word">' + diff.englishHtml + '</span>' +
          '</div>' +
          '<div class="contrast-chinese">' + escapeHtml(word.chinese) + '</div>' +
          '<div class="contrast-meta">' +
            (word.patternType ? '<span class="pattern-tag">' + escapeHtml(word.patternType) + '</span>' : '') +
            '<span class="similarity-tag">' + word.similarityScore + '% similar</span>' +
          '</div>' +
          '<div class="contrast-nav">' +
            '<button class="btn" id="contrastPrev" ' + (CognateState.currentIndex === 0 ? 'disabled' : '') + '>← Prev</button>' +
            '<span class="nav-position">' + (CognateState.currentIndex + 1) + ' / ' + CognateState.words.length + '</span>' +
            '<button class="btn primary" id="contrastNext">Next →</button>' +
          '</div>' +
        '</div>';

      document.getElementById('contrastPrev').addEventListener('click', function() { ContrastMode.prevWord(); });
      document.getElementById('contrastNext').addEventListener('click', function() { ContrastMode.nextWord(); });
    },

    prevWord() {
      if (CognateState.currentIndex > 0) {
        CognateState.currentIndex--;
        this.showWord();
      }
    },

    nextWord() {
      if (CognateState.currentIndex < CognateState.words.length - 1) {
        CognateState.currentIndex++;
        this.showWord();
      } else {
        this.showComplete();
      }
    },

    showComplete() {
      var container = getContainer();
      if (!container) return;
      container.innerHTML =
        '<div class="cognate-complete">' +
          '<h2>Review Complete!</h2>' +
          '<p>You\'ve reviewed all ' + CognateState.words.length + ' cognates.</p>' +
          '<button class="btn primary" onclick="CognateApp.startContrastMode()">Review Again</button>' +
          '<button class="btn" onclick="CognateApp.showModeSelection()">Back to Modes</button>' +
        '</div>';
    }
  };

  // === Mode 3: Pattern Group Mode ===

  const PatternGroupMode = {
    getPatternGroups(words) {
      var groups = {};
      words.forEach(function(w) {
        if (w.patternType) {
          groups[w.patternType] = groups[w.patternType] || [];
          groups[w.patternType].push(w);
        }
      });
      var otherWords = words.filter(function(w) { return !w.patternType; });
      if (otherWords.length > 0) {
        groups['Other'] = otherWords;
      }
      return groups;
    },

    start(words) {
      CognateState.words = words;
      CognateState.currentMode = 'patternGroup';
      loadCognateProgress();

      this.showPatternSelection();
    },

    showPatternSelection() {
      var groups = this.getPatternGroups(CognateState.words);
      var container = getContainer();
      if (!container) return;

      var groupCards = Object.entries(groups)
        .sort(function(a, b) { return b[1].length - a[1].length; })
        .map(function(entry) {
          var pattern = entry[0];
          var words = entry[1];
          var mastered = CognateState.masteredPatterns.has(pattern);
          return '<div class="pattern-card ' + (mastered ? 'mastered' : '') + '" data-pattern="' + escapeAttribute(pattern) + '">' +
              '<div class="pattern-name">' + escapeHtml(pattern) + '</div>' +
              '<div class="pattern-count">' + words.length + ' words</div>' +
              (mastered ? '<span class="mastered-badge">✓ Completed</span>' : '') +
            '</div>';
        }).join('');

      container.innerHTML =
        '<div class="pattern-selection">' +
          '<h2>Learn by Pattern</h2>' +
          '<p class="subtitle">Master cognate transformation patterns</p>' +
          '<div class="pattern-grid">' + groupCards + '</div>' +
        '</div>';

      container.querySelectorAll('.pattern-card:not(.mastered)').forEach(function(card) {
        card.addEventListener('click', function() {
          var pattern = card.dataset.pattern;
          PatternGroupMode.startPatternPractice(pattern, groups[pattern]);
        });
      });
    },

    startPatternPractice(pattern, words) {
      CognateState.currentPattern = pattern;
      CognateState.words = words;
      CognateState.currentIndex = 0;
      CognateState.correctCount = 0;
      CognateState.totalCount = 0;

      this.showPatternIntro(pattern, words);
    },

    showPatternIntro(pattern, words) {
      var container = getContainer();
      if (!container) return;

      var examples = words.slice(0, 5);
      var exampleHtml = examples.map(function(w) {
        var diff = highlightDiff(w.italian, w.english);
        return '<div class="example-row">' + diff.italianHtml + ' ↔ ' + diff.englishHtml + '</div>';
      }).join('');

      container.innerHTML =
        '<div class="pattern-intro">' +
          '<h2>Pattern: ' + escapeHtml(pattern) + '</h2>' +
          '<div class="pattern-explanation">' +
            '<p>Learn how "' + escapeHtml(pattern.replace('-', ' → ').split('/')[0]) + '" transforms to ' +
               '"' + escapeHtml(pattern.split('/')[1] || 'English') + '".</p>' +
          '</div>' +
          '<div class="pattern-examples">' +
            '<h3>Examples:</h3>' +
            exampleHtml +
          '</div>' +
          '<button class="btn primary" id="startPatternPractice">Start Practice (' + words.length + ' words)</button>' +
        '</div>';

      document.getElementById('startPatternPractice').addEventListener('click', function() {
        EnglishPromptMode.start(words);
      });
    },

    markPatternComplete(pattern) {
      CognateState.masteredPatterns.add(pattern);
      saveCognateProgress();
    }
  };

  // === Mode 4: Browse Mode ===

  const BrowseMode = {
    start(words) {
      CognateState.words = words.sort(function(a, b) { return a.rank - b.rank; });
      CognateState.currentMode = 'browse';
      this.showList();
    },

    showList() {
      var container = getContainer();
      if (!container) return;

      var filterOptions =
        '<div class="browse-filter">' +
          '<select id="difficultyFilter">' +
            '<option value="">All Difficulty</option>' +
            '<option value="easy">Easy (≥80%)</option>' +
            '<option value="medium">Medium (50-79%)</option>' +
            '<option value="hard">Hard (<50%)</option>' +
          '</select>' +
        '</div>';

      var wordList = CognateState.words.slice(0, 100).map(function(w) {
        var diff = highlightDiff(w.italian, w.english);
        return '<div class="browse-item" data-difficulty="' + escapeAttribute(w.difficulty) + '">' +
            '<div class="browse-italian">' + diff.italianHtml + '</div>' +
            '<div class="browse-english">' + diff.englishHtml + '</div>' +
            '<div class="browse-chinese">' + escapeHtml(w.chinese) + '</div>' +
            '<div class="browse-score">' + w.similarityScore + '%</div>' +
          '</div>';
      }).join('');

      container.innerHTML =
        '<div class="cognate-browse">' +
          '<h2>Cognate Word List</h2>' +
          filterOptions +
          '<div class="browse-list">' + wordList + '</div>' +
          '<div class="browse-more">' +
            '<button class="btn" id="loadMoreBrowse">Load More</button>' +
          '</div>' +
        '</div>';

      document.getElementById('difficultyFilter').addEventListener('change', function(e) {
        BrowseMode.filterByDifficulty(e.target.value);
      });
    },

    filterByDifficulty(difficulty) {
      var items = document.querySelectorAll('.browse-item');
      items.forEach(function(item) {
        if (!difficulty || item.dataset.difficulty === difficulty) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
  };

  // === Cognate App Controller ===

  var COGNATE_DATA = window.COGNATE_DATA || [];
  if (COGNATE_DATA.length === 0) {
    console.warn('COGNATE_DATA is empty or undefined');
  }

  function checkDataAndRender(container) {
    if (!COGNATE_DATA || COGNATE_DATA.length === 0) {
      container.innerHTML = '<div class="error-message">Cognate data not loaded. Please refresh.</div>';
      return false;
    }
    return true;
  }

  const CognateApp = {
    init() {
      loadCognateProgress();
    },

    showModeSelection() {
      var container = getContainer();
      if (!container) return;
      container.innerHTML =
        '<div class="mode-selection">' +
          '<h2>Cognate Practice</h2>' +
          '<p class="subtitle">Learn Italian words similar to English</p>' +
          '<div class="mode-buttons">' +
            '<button class="mode-btn" id="englishPromptBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-keyboard"></use></svg></span>' +
              '<span class="mode-name">English Prompt</span>' +
              '<span class="mode-desc">Type Italian from English hint</span>' +
            '</button>' +
            '<button class="mode-btn" id="contrastBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-eye"></use></svg></span>' +
              '<span class="mode-name">Contrast View</span>' +
              '<span class="mode-desc">Compare IT/EN with highlights</span>' +
            '</button>' +
            '<button class="mode-btn" id="patternGroupBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-puzzle"></use></svg></span>' +
              '<span class="mode-name">Pattern Groups</span>' +
              '<span class="mode-desc">Learn by suffix patterns</span>' +
            '</button>' +
            '<button class="mode-btn" id="browseBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-book-open"></use></svg></span>' +
              '<span class="mode-name">Browse</span>' +
              '<span class="mode-desc">Scroll through cognates</span>' +
            '</button>' +
          '</div>' +
        '</div>';

      document.getElementById('englishPromptBtn').addEventListener('click', function() { CognateApp.startEnglishPromptMode(); });
      document.getElementById('contrastBtn').addEventListener('click', function() { CognateApp.startContrastMode(); });
      document.getElementById('patternGroupBtn').addEventListener('click', function() { CognateApp.startPatternGroupMode(); });
      document.getElementById('browseBtn').addEventListener('click', function() { CognateApp.startBrowseMode(); });
    },

    startEnglishPromptMode(difficulty) {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      var words = COGNATE_DATA;
      if (difficulty) {
        words = words.filter(function(w) { return w.difficulty === difficulty; });
      }
      EnglishPromptMode.start(words);
    },

    startContrastMode(filter) {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      ContrastMode.start(COGNATE_DATA, filter);
    },

    startPatternGroupMode() {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      PatternGroupMode.start(COGNATE_DATA);
    },

    startBrowseMode() {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      BrowseMode.start(COGNATE_DATA);
    }
  };

  // Expose to global
  window.CognateApp = CognateApp;
  window.CognateState = CognateState;

})();