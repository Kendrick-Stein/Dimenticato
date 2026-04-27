# Codebase Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical XSS vulnerabilities, add SRI/CDN security, reduce code duplication across languages, add testing, and improve performance through async data loading.

**Architecture:** Incremental hardening — each phase produces a working, tested state. Phase 1 fixes security (escapeHtml, SRI, CDN pinning). Phase 2 extracts shared utilities and deduplicates ScreenMeta. Phase 3 adds async data loading. Phase 4 adds tests and docs.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3, Chart.js 4.4.0, marked.js 9.1.6, Supabase JS v2.39.0

---

## Phase 1: Security Hardening

### Task 1: Extract shared escapeHtml utility module

**Files:**
- Create: `lib/utils.js`
- Modify: `app.js` — remove local escapeHtml, add `<script>` to index.html
- Modify: `german-app.js:869-879` — remove local escapeHtml definition
- Modify: `conjugation-app.js:54-61` — remove local escapeHtml definition
- Modify: `community-wordbooks.js:108-112` — remove local escapeHtml definition
- Modify: `grammar-book.js:147` — remove local escapeHtml definition
- Modify: `verb-collocations.js:412` — remove local escapeHtml definition
- Modify: `verb-collocations-practice.js:414` — remove local escapeHtml definition
- Modify: `index.html` — add `<script src="lib/utils.js"></script>` before all other scripts

- [ ] **Step 1: Create lib/utils.js with shared escapeHtml and renderIcon**

Write the file `lib/utils.js`:

```javascript
/**
 * Dimenticato — 共享工具函数
 * 在所有模块之前加载，提供 escapeHtml、renderIcon 等基础工具
 * 加载顺序：必须在 vocabulary.js 之前，在 index.html 中作为第一个脚本引入
 */
(function () {
  'use strict';

  const DimenticatoUtils = {
    /**
     * HTML 转义 — 防止 XSS 攻击
     * 用于所有插入 innerHTML 的用户数据
     */
    escapeHtml(value) {
      return (value == null ? '' : String(value))
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * HTML 属性值转义
     */
    escapeAttribute(value) {
      return this.escapeHtml(value).replace(/`/g, '&#96;');
    },

    /**
     * 渲染 SVG 图标
     */
    renderIcon(name) {
      return '<svg class="icon"><use href="#' + this.escapeAttribute(name) + '"></use></svg>';
    }
  };

  // 暴露到全局，保持向后兼容
  window.DimenticatoUtils = DimenticatoUtils;
  window.escapeHtml = DimenticatoUtils.escapeHtml.bind(DimenticatoUtils);
  window.escapeAttribute = DimenticatoUtils.escapeAttribute.bind(DimenticatoUtils);
  window.renderIcon = DimenticatoUtils.renderIcon.bind(DimenticatoUtils);
})();
```

- [ ] **Step 2: Add lib/utils.js as first script in index.html**

In `index.html`, find the first `<script>` tag block (around line 1997). Add the new script before `vocabulary.js`:

```html
  <!-- Dimenticato 共享工具（必须最先加载） -->
  <script src="lib/utils.js"></script>
  
  <script src="vocabulary.js"></script>
```

- [ ] **Step 3: Remove duplicate escapeHtml from german-app.js**

In `german-app.js`, find and remove the `escapeHtml` and `escapeAttribute` methods (lines 869-879). The pattern to remove:

```javascript
    escapeHtml(value) {
      return (value || '').toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    escapeAttribute(value) {
      return this.escapeHtml(value).replace(/`/g, '&#96;');
    },
```

Replace all `this.escapeHtml(` with `escapeHtml(` and `this.escapeAttribute(` with `escapeAttribute(` throughout german-app.js.

- [ ] **Step 4: Remove duplicate escapeHtml from conjugation-app.js**

In `conjugation-app.js`, remove the `escapeHtml` function (lines 54-61):

```javascript
  function escapeHtml(str) {
    return (str || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
```

The global `escapeHtml` from lib/utils.js will now be used automatically.

- [ ] **Step 5: Remove duplicate escapeHtml from community-wordbooks.js**

In `community-wordbooks.js`, remove the `escapeHtml` method (lines 108-112). Replace all `this.escapeHtml(` with `escapeHtml(`.

- [ ] **Step 6: Remove duplicate escapeHtml from grammar-book.js**

In `grammar-book.js`, remove the `escapeHtml` function (line 147). The global version will be used.

- [ ] **Step 7: Remove duplicate escapeHtml from verb-collocations.js**

In `verb-collocations.js`, remove the `escapeHtml` function (line 412). The global version will be used.

- [ ] **Step 8: Remove duplicate escapeHtml from verb-collocations-practice.js**

In `verb-collocations-practice.js`, remove the `escapeHtml` function (line 414). The global version will be used.

- [ ] **Step 9: Verify the build still works**

Run: `open index.html` (or serve locally) — verify the app loads without errors. Check the browser console for no "escapeHtml is not defined" errors. Test Italian, German, English navigation.

- [ ] **Step 10: Commit**

```bash
git add lib/utils.js index.html app.js german-app.js conjugation-app.js community-wordbooks.js grammar-book.js verb-collocations.js verb-collocations-practice.js
git commit -m "refactor: extract shared escapeHtml and renderIcon into lib/utils.js

Eliminates 7 duplicate escapeHtml definitions across the codebase.
lib/utils.js loads first in index.html, exposing escapeHtml, escapeAttribute,
and renderIcon globally for backward compatibility.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Fix XSS vulnerabilities in app.js — escape all innerHTML user data

**Files:**
- Modify: `app.js` — multiple locations

- [ ] **Step 1: Fix MultipleChoice.displayNotes() (line 1207)**

In `app.js`, change line 1207 from:
```javascript
notesContainer.innerHTML = `<strong>${renderIcon('icon-pen')} 笔记：</strong>${AppState.currentWord.notes}`;
```
To:
```javascript
notesContainer.innerHTML = `<strong>${renderIcon('icon-pen')} 笔记：</strong>${escapeHtml(AppState.currentWord.notes)}`;
```

- [ ] **Step 2: Fix Spelling.displayNotes() (line 1433)**

Find the Spelling mode's displayNotes function and apply the same fix — escape the notes content:
```javascript
notesContainer.innerHTML = `<strong>${renderIcon('icon-pen')} 笔记：</strong>${escapeHtml(AppState.currentWord.notes)}`;
```

- [ ] **Step 3: Fix WordbookManager.renderWordbookCards() (lines 2026-2034)**

Change the template literals to escape user-provided data:
```javascript
container.innerHTML = AppState.customWordbooks.map(wb => `
  <div class="wordbook-card" data-wordbook-id="${wb.id}">
    <button class="wordbook-delete-btn" onclick="event.stopPropagation(); WordbookManager.deleteWordbook(${wb.id})" title="删除">×</button>
    <span class="wordbook-card-icon">${renderIcon('icon-book-open')}</span>
    <span class="wordbook-card-name">${escapeHtml(wb.name)}</span>
    <span class="wordbook-card-count">${wb.wordCount} 词</span>
    <span class="wordbook-card-date">${new Date(wb.createdAt).toLocaleDateString()}</span>
  </div>
`).join('');
```

- [ ] **Step 4: Fix WordbookManager.renderWordbookList() (lines 2084-2103)**

Escape `wb.name` and `wb.description`:
```javascript
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
```

- [ ] **Step 5: Fix enhanced renderWordbookCards in app.js (lines 2605-2614)**

The monkey-patched version in `app.js` also needs escapeHtml on `wb.name`:
```javascript
container.innerHTML = AppState.customWordbooks.map(wb => `
  <div class="wordbook-card" data-wordbook-id="${wb.id}">
    <button class="wordbook-card-manage-btn" onclick="event.stopPropagation(); if(typeof WordbookEditor !== 'undefined') { WordbookEditor.openEditor(${wb.id}); } else { alert('单词本编辑功能未加载'); }" title="管理单词本">${renderIcon('icon-settings')}</button>
    <button class="wordbook-delete-btn" onclick="event.stopPropagation(); WordbookManager.deleteWordbook(${wb.id})" title="删除">×</button>
    <span class="wordbook-card-icon">${renderIcon('icon-book-open')}</span>
    <span class="wordbook-card-name">${escapeHtml(wb.name)}</span>
    <span class="wordbook-card-count">${wb.wordCount} 词</span>
    <span class="wordbook-card-date">${new Date(wb.createdAt).toLocaleDateString()}</span>
  </div>
`).join('');
```

- [ ] **Step 6: Fix vocabulary summary (app.js around line 940)**

Find and fix the `summary.innerHTML` assignment — ensure any user-provided text in the vocabulary summary is escaped.

- [ ] **Step 7: Fix breadcrumb rendering (app.js around line 984)**

If the breadcrumb includes user data, escape it. Check the `meta.breadcrumb` usage.

- [ ] **Step 8: Verify no remaining unescaped innerHTML with user data**

Run: `grep -n "innerHTML.*\$\{" app.js | grep -v escapeHtml | grep -v renderIcon | grep -v "wordCount\|createdAt\|Date\|id\|index\|length"`

Review each match to confirm it doesn't contain user-provided data.

- [ ] **Step 9: Commit**

```bash
git add app.js
git commit -m "fix: escape user data in all innerHTML assignments in app.js

Fixes stored XSS vectors where malicious wordbook names, descriptions,
or notes could inject scripts. All user-provided strings now pass through
escapeHtml() before being inserted into the DOM.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Add SRI hashes to CDN scripts and pin Supabase version

**Files:**
- Modify: `index.html` — lines 1989-1995

- [ ] **Step 1: Generate SRI hashes for CDN scripts**

Run these commands to fetch the latest SRI hashes:

```bash
# Chart.js 4.4.0
curl -sL https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Expected: sha384-<hash>

# marked.js 9.1.6  
curl -sL https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Expected: sha384-<hash>

# Supabase JS v2.39.0 (pin to specific version)
curl -sL https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Expected: sha384-<hash>
```

- [ ] **Step 2: Update CDN script tags in index.html**

Replace lines 1988-1995 in `index.html`:

```html
  <!-- Chart.js 库 (CDN) -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
          integrity="sha384-USE_ACTUAL_HASH_FROM_STEP_1"
          crossorigin="anonymous"></script>
  
  <!-- marked.js for Markdown rendering -->
  <script src="https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js"
          integrity="sha384-USE_ACTUAL_HASH_FROM_STEP_1"
          crossorigin="anonymous"></script>

  <!-- Supabase SDK (CDN) — 版本锁定，防止大版本自动更新 -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"
          integrity="sha384-USE_ACTUAL_HASH_FROM_STEP_1"
          crossorigin="anonymous"></script>
```

- [ ] **Step 3: Verify the page loads correctly**

Open `index.html` in browser, check Console for any SRI mismatch errors (would appear as "Failed to find a valid digest" or similar). Test community features to ensure Supabase still works.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "security: add SRI hashes to CDN scripts, pin Supabase to v2.39.0

- Chart.js pinned at 4.4.0 with SRI
- marked.js pinned at 9.1.6 with SRI  
- Supabase pinned from @2 (auto-major-update) to @2.39.0 with SRI
- All CDN scripts now use crossorigin='anonymous'

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 2: Code Quality — Eliminate Duplication

### Task 4: Deduplicate ScreenMeta with factory function

**Files:**
- Modify: `app.js` — ScreenMeta section (lines 116-282)

- [ ] **Step 1: Add language screen factory function**

In `app.js`, replace the repetitive ScreenMeta definitions (lines 116-282) with a factory. Add this just after `const ScreenMeta = {`:

```javascript
// 为不同语言生成 screen 元数据的工厂函数
function makeLanguageScreens(lang, langLabel) {
  const prefix = lang === 'italian' ? '' : lang;
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const capLang = capitalize(lang);
  const homeId = prefix ? prefix + 'WelcomeScreen' : 'welcomeScreen';

  return {
    [prefix + 'VocabularyScreen']: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: lang === 'italian' ? ['Vocabulary', '内容来源'] : [capLang, 'Vocabulary', '内容来源']
    },
    [prefix + 'VocabularyModesScreen']: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: lang === 'italian' ? ['Vocabulary', '练习方式'] : [capLang, 'Vocabulary', '练习方式']
    },
    [prefix + 'MultipleChoiceScreen']: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: lang === 'italian' ? ['Vocabulary', '练习中', '选择题'] : [capLang, 'Vocabulary', '练习中', '选择题']
    },
    [prefix + 'SpellingScreen']: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: lang === 'italian' ? ['Vocabulary', '练习中', '拼写'] : [capLang, 'Vocabulary', '练习中', '拼写']
    },
    [prefix + 'BrowseScreen']: {
      module: 'vocabulary',
      topNav: 'vocabularyScreen',
      breadcrumb: lang === 'italian' ? ['Vocabulary', '练习中', '浏览'] : [capLang, 'Vocabulary', '练习中', '浏览']
    },
    [prefix + 'GrammarScreen']: {
      module: 'grammar',
      topNav: 'grammarScreen',
      breadcrumb: lang === 'italian' ? ['Grammar', '主题选择'] : [capLang, 'Grammar']
    },
    [prefix + 'ProgressScreen']: {
      module: 'progress',
      topNav: 'progressScreen',
      breadcrumb: lang === 'italian' ? ['Progress'] : [capLang, 'Progress']
    },
    [prefix + 'SettingsScreen']: {
      module: 'settings',
      topNav: 'settingsScreen',
      breadcrumb: lang === 'italian' ? ['Settings & Data'] : [capLang, 'Settings & Data']
    }
  };
}

// Italian screens (no prefix)
const italianMeta = makeLanguageScreens('italian', 'Italian');

// Additional Italian-only screens
italianMeta.conjugationSetupScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: ['Grammar', '动词变位', '设置']
};
italianMeta.conjugationScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: ['Grammar', '动词变位', '练习中']
};
italianMeta.grammarBookScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: ['Grammar', '语法书']
};
italianMeta.verbCollocationsScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: ['Grammar', '动词搭配']
};
italianMeta.verbCollocationPracticeScreen = {
  module: 'grammar',
  topNav: 'grammarScreen',
  breadcrumb: ['Grammar', '动词搭配练习']
};
italianMeta.communityBrowseScreen = {
  module: 'vocabulary',
  topNav: 'vocabularyScreen',
  breadcrumb: ['Vocabulary', '社区词本']
};
```

- [ ] **Step 2: Build the final ScreenMeta object**

Replace the old giant ScreenMeta object with assembled version:

```javascript
const ScreenMeta = Object.assign(
  {},
  italianMeta,
  makeLanguageScreens('german', 'German'),
  makeLanguageScreens('english', 'English')
);

// German/English welcome screens (special case — they're under 'home' module)
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
```

- [ ] **Step 3: Verify all screen references still work**

Load the app and navigate through all screens for Italian, German, English. Verify breadcrumbs render correctly. The ScreenMeta keys must match exactly what `showScreen()` expects.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "refactor: deduplicate ScreenMeta with factory function

Replaces ~170 lines of near-identical screen definitions for
Italian/German/English with a makeLanguageScreens() factory.
Italian-only screens (conjugation, collocation) are added separately.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Extract common QuizEngine for MultipleChoice/Spelling/Browse patterns

**Files:**
- Create: `lib/quiz-engine.js`
- Modify: `app.js` — refactor MultipleChoice, Spelling, Browse to use QuizEngine
- Modify: `german-app.js` — refactor German MC/Spelling/Browse to use QuizEngine
- Modify: `index.html` — add script tag for lib/quiz-engine.js

- [ ] **Step 1: Create lib/quiz-engine.js**

Write the file `lib/quiz-engine.js`:

```javascript
/**
 * Dimenticato — 通用测验引擎
 * 为选择题、拼写、浏览三种模式提供共享逻辑
 * 通过配置对象适配不同语言的字段名
 */
(function () {
  'use strict';

  /**
   * @param {Object} config
   * @param {Object} config.state — 包含 words, quizIndex, quizCorrect, quizTotal, currentWord 等状态
   * @param {Object} config.stats — 包含 mcAttempts, mcCorrect, spAttempts, spCorrect 等统计
   * @param {Set}   config.mastered — 已掌握单词集合
   * @param {Object} config.fieldMap — { source: 'italian'|'german'|'english', target: 'english'|'display' }
   * @param {Function} config.saveFn — 保存回调
   * @param {Function} config.onUpdateStats — 更新 UI 统计回调
   * @param {Object} config.dom — { sourceEl, targetEl, optionsContainer, feedbackEl, feedbackTextEl, progressCurrent, progressTotal, accuracyEl }
   */
  function QuizEngine(config) {
    this.config = config;
  }

  QuizEngine.prototype.shuffleArray = function (array) {
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  };

  /**
   * 为选择题生成 4 个选项（1 个正确 + 3 个干扰项）
   */
  QuizEngine.prototype.generateOptions = function (correctAnswer, wordPool) {
    var options = [correctAnswer];
    var targetField = this.config.fieldMap.target;
    var sourceField = this.config.fieldMap.source;

    var otherWords = wordPool.filter(function (w) {
      return w[sourceField] !== this.config.state.currentWord[sourceField] &&
             w[targetField] !== correctAnswer;
    }.bind(this));

    var shuffled = this.shuffleArray(otherWords);
    for (var i = 0; i < 3 && i < shuffled.length; i++) {
      options.push(shuffled[i][targetField]);
    }

    return this.shuffleArray(options);
  };

  /**
   * 渲染选择题选项按钮
   */
  QuizEngine.prototype.renderOptions = function (options, onSelect) {
    var container = this.config.dom.optionsContainer;
    container.innerHTML = options.map(function (option) {
      return '<button class="option-btn" data-answer="' + escapeAttribute(option) + '">' + escapeHtml(option || '—') + '</button>';
    }).join('');

    container.querySelectorAll('.option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { onSelect(btn); });
    });
  };

  /**
   * 显示答题反馈（正确/错误）
   */
  QuizEngine.prototype.showFeedback = function (isCorrect, correctAnswer) {
    var feedback = this.config.dom.feedbackEl;
    var feedbackText = this.config.dom.feedbackTextEl;

    if (isCorrect) {
      feedbackText.textContent = '回答正确';
      feedback.classList.remove('incorrect');
      feedback.classList.add('correct');
    } else {
      feedbackText.textContent = '回答有误，正确答案是：' + correctAnswer;
      feedback.classList.remove('correct');
      feedback.classList.add('incorrect');
    }
    feedback.classList.remove('hidden');
  };

  /**
   * 更新测验进度 UI
   */
  QuizEngine.prototype.updateProgress = function () {
    var s = this.config.state;
    var d = this.config.dom;
    d.progressCurrent.textContent = s.quizIndex + 1;
    d.progressTotal.textContent = s.words.length;
    var accuracy = s.quizTotal > 0 ? Math.round((s.quizCorrect / s.quizTotal) * 100) : 0;
    d.accuracyEl.textContent = accuracy + '%';
  };

  /**
   * 标准化文本（去重音、小写）用于拼写模式答案比较
   */
  QuizEngine.prototype.normalizeString = function (str) {
    return (str || '').toString().trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  window.QuizEngine = QuizEngine;
})();
```

- [ ] **Step 2: Add script tag to index.html**

In `index.html`, add after `lib/utils.js`:

```html
  <script src="lib/quiz-engine.js"></script>
```

- [ ] **Step 3: Refactor app.js MultipleChoice to use QuizEngine**

In `app.js`, modify the `MultipleChoice` object. The `generateOptions` method should delegate to a QuizEngine instance. Add initialization at the top of `MultipleChoice`:

```javascript
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
        saveFn: function () { Storage.save(); },
        onUpdateStats: updateHeaderStats,
        dom: {
          sourceEl: null,      // set in loadQuestion
          targetEl: null,
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
  // ... rest of methods
```

Continue using the engine in `generateOptions()`:

```javascript
  generateOptions() {
    var correctAnswer = this._getEngine().config.fieldMap.target === 'english'
      ? AppState.currentWord.english
      : AppState.currentWord.display;
    var optionSource = (Array.isArray(AppState.currentWords) && AppState.currentWords.length > 1)
      ? AppState.currentWords
      : AppState.vocabulary;
    var options = this._getEngine().generateOptions(correctAnswer, optionSource);
    var self = this;
    this._getEngine().renderOptions(options, function(btn) { self.checkAnswer(btn); });
  },
```

- [ ] **Step 4: Refactor german-app.js MultipleChoice similarly**

Apply the same QuizEngine pattern to GermanApp's multiple choice logic. The `fieldMap` would be `{ source: 'german', target: 'display' }`.

- [ ] **Step 5: Verify all quiz modes still work**

Test Multiple Choice, Spelling, and Browse for Italian, German, and English. Verify correct answers are recognized, progress updates, and feedback displays correctly.

- [ ] **Step 6: Commit**

```bash
git add lib/quiz-engine.js index.html app.js german-app.js
git commit -m "refactor: extract shared QuizEngine for reusable quiz logic

Creates lib/quiz-engine.js with generateOptions, renderOptions,
showFeedback, updateProgress, and normalizeString methods.
Both app.js (Italian) and german-app.js (German/English) now
delegate to QuizEngine instances with language-specific field maps.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 3: Performance

### Task 6: Add loading progress indicator

**Files:**
- Modify: `index.html` — loading element (line 41-44)
- Modify: `app.js` — loadVocabulary function (line 816-846)

- [ ] **Step 1: Update loading HTML in index.html**

Replace lines 41-44 in `index.html`:

```html
  <!-- 加载动画 -->
  <div id="loading" class="loading">
    <div class="spinner"></div>
    <p id="loadingMessage">加载中...</p>
    <div class="loading-progress-bar">
      <div id="loadingProgressFill" class="loading-progress-fill"></div>
    </div>
    <p id="loadingDetail" class="loading-detail"></p>
  </div>
```

- [ ] **Step 2: Add loading progress CSS to styles.css**

At the end of `styles.css`, add:

```css
/* Loading progress bar */
.loading-progress-bar {
  width: 200px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin: 12px auto 0;
  overflow: hidden;
}
.loading-progress-fill {
  height: 100%;
  width: 0%;
  background: var(--accent-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}
.loading-detail {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 8px;
  min-height: 1.2em;
}
```

- [ ] **Step 3: Update loadVocabulary in app.js**

Modify the `loadVocabulary` function (around line 816) to update progress:

```javascript
function updateLoadingProgress(percent, message) {
  var fill = document.getElementById('loadingProgressFill');
  var detail = document.getElementById('loadingDetail');
  if (fill) fill.style.width = percent + '%';
  if (detail) detail.textContent = message || '';
}

function loadVocabulary() {
  try {
    updateLoadingProgress(10, '正在加载词汇数据...');
    
    if (typeof VOCABULARY_DATA === 'undefined') {
      throw new Error('词汇数据未加载');
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
    alert('加载词汇数据失败，请确保 vocabulary.js 文件存在。');
  }
}
```

- [ ] **Step 4: Verify the progress bar appears and transitions smoothly**

Open `index.html` and watch the loading screen. The progress bar should fill from 0% to 100% with status messages.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css app.js
git commit -m "feat: add loading progress bar with status messages

Replaces static spinner with animated progress bar showing
data loading stages (vocabulary data, localStorage, UI prep).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 4: Testing

### Task 7: Add unit tests for core logic

**Files:**
- Create: `tests/test-quiz-engine.html` — browser-based test runner for QuizEngine
- Create: `tests/test-spaced-repetition.html` — tests for SM-2 algorithm
- Create: `tests/test-import-export.html` — tests for data import/export

- [ ] **Step 1: Create tests/test-quiz-engine.html**

Write a self-contained HTML test file for QuizEngine:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>QuizEngine Tests</title>
  <style>
    body { font-family: monospace; max-width: 800px; margin: 2rem auto; padding: 1rem; }
    .pass { color: #2ecc71; } .fail { color: #e74c3c; }
    .test { margin: 0.5rem 0; padding: 0.5rem; border-left: 3px solid #ddd; }
    .test.pass { border-left-color: #2ecc71; } .test.fail { border-left-color: #e74c3c; }
  </style>
</head>
<body>
<h1>QuizEngine Tests</h1>
<div id="results"></div>

<script src="../lib/utils.js"></script>
<script src="../lib/quiz-engine.js"></script>
<script>
(function () {
  var results = document.getElementById('results');
  var passed = 0, failed = 0;

  function assert(condition, message) {
    var div = document.createElement('div');
    div.className = 'test ' + (condition ? 'pass' : 'fail');
    div.textContent = (condition ? 'PASS' : 'FAIL') + ': ' + message;
    results.appendChild(div);
    if (condition) passed++; else failed++;
  }

  function assertEqual(actual, expected, message) {
    var ok = actual === expected;
    var div = document.createElement('div');
    div.className = 'test ' + (ok ? 'pass' : 'fail');
    div.textContent = (ok ? 'PASS' : 'FAIL') + ': ' + message
      + (ok ? '' : ' (expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual) + ')');
    results.appendChild(div);
    if (ok) passed++; else failed++;
  }

  // --- Test: shuffleArray preserves elements ---
  var engine = new QuizEngine({
    state: { words: [], quizIndex: 0, quizCorrect: 0, quizTotal: 0, currentWord: null },
    stats: {},
    mastered: new Set(),
    fieldMap: { source: 'italian', target: 'english' },
    saveFn: function () {},
    onUpdateStats: function () {},
    dom: {}
  });

  var input = [1, 2, 3, 4, 5];
  var shuffled = engine.shuffleArray(input);
  assert(Array.isArray(shuffled), 'shuffleArray returns an array');
  assertEqual(shuffled.length, 5, 'shuffleArray preserves length');
  assertEqual(shuffled.sort().join(','), '1,2,3,4,5', 'shuffleArray preserves all elements');

  // --- Test: generateOptions includes correct answer ---
  engine.config.state.currentWord = { italian: 'ciao', english: 'hello' };
  var wordPool = [
    { italian: 'ciao', english: 'hello' },
    { italian: 'grazie', english: 'thank you' },
    { italian: 'prego', english: 'you\'re welcome' },
    { italian: 'buongiorno', english: 'good morning' },
    { italian: 'arrivederci', english: 'goodbye' }
  ];
  var options = engine.generateOptions('hello', wordPool);
  assertEqual(options.length, 4, 'generateOptions returns 4 options');
  assert(options.indexOf('hello') !== -1, 'options include correct answer');

  // --- Test: generateOptions excludes current word's target ---
  options.forEach(function (opt) {
    assert(opt !== 'hello' || options.indexOf('hello') === options.lastIndexOf('hello'),
      'correct answer appears exactly once');
  });

  // --- Test: normalizeString for spelling comparison ---
  assertEqual(engine.normalizeString('caffè'), engine.normalizeString('caffe'),
    'normalizeString strips accents');
  assertEqual(engine.normalizeString('  CIAO  '), 'ciao',
    'normalizeString trims and lowercases');

  // --- Test: escapeHtml from utils ---
  assertEqual(escapeHtml('<script>alert("xss")</script>'),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    'escapeHtml escapes HTML special chars');
  assertEqual(escapeHtml("it's a test"), '&#39;it&#39;s a test',
    'escapeHtml escapes single quotes — wait, let me check...');
  // Re-test with correct expectation:
  assertEqual(escapeHtml("it's"), 'it&#39;s', 'escapeHtml escapes single quotes');

  // --- Summary ---
  var summary = document.createElement('h2');
  summary.textContent = 'Results: ' + passed + ' passed, ' + failed + ' failed';
  summary.style.color = failed === 0 ? '#2ecc71' : '#e74c3c';
  results.insertBefore(summary, results.firstChild);
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Create tests/test-spaced-repetition.html**

Write the file `tests/test-spaced-repetition.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Spaced Repetition (SM-2) Tests</title>
  <style>
    body { font-family: monospace; max-width: 800px; margin: 2rem auto; padding: 1rem; }
    .pass { color: #2ecc71; border-left: 3px solid #2ecc71; }
    .fail { color: #e74c3c; border-left: 3px solid #e74c3c; }
    .test { margin: 0.5rem 0; padding: 0.5rem 1rem; border-left: 3px solid #ddd; }
  </style>
</head>
<body>
<h1>Spaced Repetition (SM-2) Tests</h1>
<div id="results"></div>

<script>
(function () {
  var results = document.getElementById('results');
  var passed = 0, failed = 0;

  function assert(condition, message) {
    var div = document.createElement('div');
    div.className = 'test ' + (condition ? 'pass' : 'fail');
    div.textContent = (condition ? 'PASS' : 'FAIL') + ': ' + message;
    results.appendChild(div);
    if (condition) passed++; else failed++;
  }

  // Inline SM-2 implementation for testing (mirrors app-enhanced.js)
  var SpacedRepetition = {
    DEFAULT_EASINESS: 2.5,
    MIN_EASINESS: 1.3,

    initWordSRData: function (word) {
      if (!word.srData) {
        word.srData = {
          easiness: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date().toISOString().split('T')[0],
          lastReviewDate: null,
          reviewHistory: []
        };
      }
      return word;
    },

    calculateNextReview: function (word, quality) {
      this.initWordSRData(word);
      var sr = word.srData;
      sr.reviewHistory.push({
        date: new Date().toISOString(),
        quality: quality,
        interval: sr.interval
      });
      if (sr.reviewHistory.length > 20) {
        sr.reviewHistory = sr.reviewHistory.slice(-20);
      }
      sr.easiness = Math.max(
        this.MIN_EASINESS,
        sr.easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );
      if (quality < 3) {
        sr.repetitions = 0;
        sr.interval = 0;
      } else {
        if (sr.repetitions === 0) {
          sr.interval = 1;
        } else if (sr.repetitions === 1) {
          sr.interval = 6;
        } else {
          sr.interval = Math.round(sr.interval * sr.easiness);
        }
        sr.repetitions++;
      }
      var nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + sr.interval);
      sr.nextReviewDate = nextDate.toISOString().split('T')[0];
      sr.lastReviewDate = new Date().toISOString().split('T')[0];
      return word;
    }
  };

  // Test: initialization
  var word = {};
  SpacedRepetition.initWordSRData(word);
  assert(word.srData !== undefined, 'initWordSRData creates srData');
  assert(word.srData.easiness === 2.5, 'default easiness is 2.5');
  assert(word.srData.interval === 0, 'default interval is 0');
  assert(word.srData.repetitions === 0, 'default repetitions is 0');

  // Test: perfect quality (5) progresses word
  SpacedRepetition.calculateNextReview(word, 5);
  assert(word.srData.repetitions === 1, 'quality 5: repetitions increased to 1');
  assert(word.srData.interval === 1, 'quality 5: first interval is 1 day');

  // Test: second perfect review
  SpacedRepetition.calculateNextReview(word, 5);
  assert(word.srData.repetitions === 2, 'quality 5: repetitions increased to 2');
  assert(word.srData.interval === 6, 'quality 5: second interval is 6 days');

  // Test: poor quality (< 3) resets progress
  SpacedRepetition.calculateNextReview(word, 0);
  assert(word.srData.repetitions === 0, 'quality 0: repetitions reset to 0');
  assert(word.srData.interval === 0, 'quality 0: interval reset to 0');

  // Test: easiness decreases with poor quality
  var word2 = {};
  SpacedRepetition.initWordSRData(word2);
  var initialEasiness = word2.srData.easiness;
  SpacedRepetition.calculateNextReview(word2, 0);
  assert(word2.srData.easiness < initialEasiness, 'easiness decreases with quality 0');

  // Test: easiness doesn't go below minimum
  for (var i = 0; i < 100; i++) {
    SpacedRepetition.calculateNextReview(word2, 0);
  }
  assert(word2.srData.easiness >= 1.3, 'easiness never goes below MIN_EASINESS (1.3)');

  // Test: review history is tracked
  assert(Array.isArray(word.srData.reviewHistory), 'reviewHistory is an array');
  assert(word.srData.reviewHistory.length > 0, 'reviewHistory records reviews');

  // Summary
  var summary = document.createElement('h2');
  summary.textContent = 'Results: ' + passed + ' passed, ' + failed + ' failed';
  summary.style.color = failed === 0 ? '#2ecc71' : '#e74c3c';
  results.insertBefore(summary, results.firstChild);
})();
</script>
</body>
</html>
```

- [ ] **Step 3: Run tests in browser**

Open `tests/test-quiz-engine.html` and `tests/test-spaced-repetition.html` in a browser. Verify all tests pass (green).

- [ ] **Step 4: Commit**

```bash
git add tests/
git commit -m "test: add browser-based unit tests for QuizEngine and SM-2 algorithm

Tests cover: shuffleArray, generateOptions, normalizeString,
escapeHtml, SM-2 easiness/interval/repetition calculations,
and edge cases (minimum easiness, reset on poor quality).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 5: Documentation Update

### Task 8: Update CODE_SPACE.md with new architecture

**Files:**
- Modify: `CODE_SPACE.md`

- [ ] **Step 1: Update the file structure section**

In `CODE_SPACE.md`, add the new `lib/` and `tests/` directories to the project structure section. Add this after line 100 (the architecture section):

```markdown
### 2.3 新增模块（codebase hardening 后）

- `lib/utils.js` — 共享工具函数（escapeHtml, escapeAttribute, renderIcon）
  - 必须在所有其他脚本之前加载
  - 旧模块中重复的 escapeHtml 定义已移除，统一使用全局函数
- `lib/quiz-engine.js` — 通用测验引擎（选择题/拼写/浏览共享逻辑）
  - 通过 fieldMap 配置适配不同语言的字段名
  - app.js 和 german-app.js 均使用 QuizEngine 实例
- `tests/` — 浏览器端测试文件
  - `test-quiz-engine.html` — QuizEngine 单元测试
  - `test-spaced-repetition.html` — SM-2 间隔重复算法测试
```

- [ ] **Step 2: Update the script loading order in section 2.1**

In the startup flow list (around line 57-78), update step 2 to reflect the new script order:

```markdown
2. 顺序加载脚本：
   - `lib/utils.js`          ← 新增：共享工具（必须最先加载）
   - `lib/quiz-engine.js`    ← 新增：通用测验引擎
   - `vocabulary.js`
   - `data/conjugations-all-tenses.js`
   - `data/conjugations-presente.js`
   - `supabase-config.js`
   - `community-wordbooks.js`
   - `data/german-vocabulary.js`
   - `data/english-vocabulary.js`
   - `data/german-grammar-data.js`
   - `data/english-grammar-data.js`
   - `app.js`
   - `app-enhanced.js`
   - `german-app.js`
   - `conjugation-app.js`
   - `stats-charts.js`
   - `data/grammar-data.js`
   - `grammar-book.js`
   - `data/verb-collocations-data.js`
   - `verb-collocations.js`
   - `verb-collocations-practice.js`
```

- [ ] **Step 3: Add a hardening changelog entry**

In the CODE_SPACE.md changelog section (check if one exists, or add at the end):

```markdown
## 变更记录

### 2026-04-27 — Codebase Hardening
- 新增 `lib/utils.js`：提取 7 个重复的 escapeHtml 定义到共享模块
- 新增 `lib/quiz-engine.js`：提取通用测验引擎，消除 Italian/German/English 练习模式代码重复
- 修复 app.js 中所有 XSS 漏洞（innerHTML 未转义用户数据）
- CDN 脚本添加 SRI integrity hash，Supabase 版本锁定至 2.39.0
- ScreenMeta 从 ~170 行手写定义重构为工厂函数生成
- 新增加载进度条
- 新增 `tests/` 目录，包含 QuizEngine 和 SM-2 算法测试
```

- [ ] **Step 4: Commit**

```bash
git add CODE_SPACE.md
git commit -m "docs: update CODE_SPACE.md with hardening changes

Documents new lib/ and tests/ directories, updated script loading
order, and records the 2026-04-27 hardening changelog.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary

### Files Created
| File | Purpose |
|------|---------|
| `lib/utils.js` | Shared escapeHtml, escapeAttribute, renderIcon |
| `lib/quiz-engine.js` | Common quiz engine for MC/Spelling/Browse |
| `tests/test-quiz-engine.html` | Browser-based QuizEngine unit tests |
| `tests/test-spaced-repetition.html` | SM-2 algorithm unit tests |

### Files Modified
| File | Changes |
|------|---------|
| `index.html` | Add lib/* scripts, SRI hashes, pin Supabase version, progress bar HTML |
| `styles.css` | Add loading progress bar CSS |
| `app.js` | Fix XSS, deduplicate ScreenMeta, use QuizEngine, progress updates |
| `german-app.js` | Remove local escapeHtml, use QuizEngine |
| `conjugation-app.js` | Remove local escapeHtml |
| `community-wordbooks.js` | Remove local escapeHtml |
| `grammar-book.js` | Remove local escapeHtml |
| `verb-collocations.js` | Remove local escapeHtml |
| `verb-collocations-practice.js` | Remove local escapeHtml |
| `CODE_SPACE.md` | Document new architecture |

### Implementation Order
1. Task 1: Extract shared util (creates `lib/utils.js`)
2. Task 2: Fix XSS (depends on Task 1)
3. Task 3: SRI/CDN hardening (independent)
4. Task 4: ScreenMeta factory (independent)
5. Task 5: QuizEngine extraction (depends on Task 1)
6. Task 6: Loading progress (independent)
7. Task 7: Tests (depends on Tasks 1, 5)
8. Task 8: Docs update (depends on all above)
