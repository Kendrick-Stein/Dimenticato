# Cognate 词表与练习功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a cognate word list from Italian vocabulary and build special practice modes for efficient vocabulary transfer from English to Italian.

**Architecture:** Standalone cognate module with three practice modes (English prompt, contrast, pattern group), integrated into existing wordbook selection UI via new source type 'cognate'.

**Tech Stack:** Vanilla JS, Node.js for extraction script, localStorage for progress tracking, QuizEngine reuse.

---

## File Structure

| File | Purpose |
|------|---------|
| `scripts/cognate_extractor.js` (Create) | Node.js script to extract cognates from vocabulary.js |
| `data/cognates.js` (Create) | Generated cognate word list data |
| `cognate-app.js` (Create) | Cognate practice modes (EnglishPrompt, Contrast, PatternGroup, Browse) |
| `index.html` (Modify) | Add cognate source button and cognate-app.js script reference |
| `app.js` (Modify) | Add 'cognate' source type handling and practice mode switching |
| `styles.css` (Modify) | Add cognate-specific styles (contrast highlighting) |

---

### Task 1: Create Cognate Extractor Script

**Files:**
- Create: `scripts/cognate_extractor.js`

- [ ] **Step 1: Write the cognate extraction script**

```javascript
/**
 * Cognate Extractor Script
 * 从 vocabulary.js 提取与英语相似的 cognate 单词
 * 
 * 运行: node scripts/cognate_extractor.js
 * 输出: data/cognates.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const vocabPath = path.join(rootDir, 'vocabulary.js');

// 读取 vocabulary.js 并提取 VOCABULARY_DATA
const vocabContent = fs.readFileSync(vocabPath, 'utf8');
const match = vocabContent.match(/const VOCABULARY_DATA = (\[[\s\S]*\]);/);
if (!match) {
  console.error('无法解析 vocabulary.js');
  process.exit(1);
}
const vocabulary = JSON.parse(match[1]);

console.log(`总词条数: ${vocabulary.length}`);

// === 相似度计算 ===

/**
 * 计算 Levenshtein 编辑距离
 */
function levenshteinDistance(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i-1] === b[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1;
      }
    }
  }
  return dp[m][n];
}

/**
 * 根据编辑距离计算基础相似度分数
 */
function baseSimilarityScore(distance, maxLen) {
  if (distance <= 2) return 90 + (2 - distance) * 5; // 90-100
  if (distance <= 4) return 70 + (4 - distance) * 5; // 70-89
  if (distance <= 6) return 50 + (6 - distance) * 3; // 50-69
  return Math.max(0, 40 - distance);
}

// === 后缀模式定义 ===

const suffixPatterns = [
  { pattern: /zione$/i, suffix: '-zione/-tion', englishSuffix: 'tion' },
  { pattern: /ità$/i, suffix: '-ità/-ity', englishSuffix: 'ity' },
  { pattern: /ico$/i, suffix: '-ico/-ic', englishSuffix: 'ic' },
  { pattern: /ale$/i, suffix: '-ale/-al', englishSuffix: 'al' },
  { pattern: /mente$/i, suffix: '-mente/-ly', englishSuffix: 'ly' },
  { pattern: /ario$/i, suffix: '-ario/-ary', englishSuffix: 'ary' },
  { pattern: /oria$/i, suffix: '-oria/-ory', englishSuffix: 'ory' },
  { pattern: /ista$/i, suffix: '-ista/-ist', englishSuffix: 'ist' },
  { pattern: /ismo$/i, suffix: '-ismo/-ism', englishSuffix: 'ism' },
  { pattern: /ente$/i, suffix: '-ente/-ent', englishSuffix: 'ent' },
  { pattern: /ante$/i, suffix: '-ante/-ant', englishSuffix: 'ant' },
  { pattern: /ore$/i, suffix: '-ore/-or', englishSuffix: 'or' },
  { pattern: /ella$/i, suffix: '-ella/-el', englishSuffix: 'el' },
  { pattern: /ello$/i, suffix: '-ello/-el', englishSuffix: 'el' },
  { pattern: /etto$/i, suffix: '-etto/-et', englishSuffix: 'et' },
  { pattern: /atto$/i, suffix: '-atto/-at', englishSuffix: 'at' },
  { pattern: /utto$/i, suffix: '-utto/-ut', englishSuffix: 'ut' },
];

/**
 * 检查是否匹配后缀规律
 */
function matchSuffixPattern(italian, english) {
  for (const p of suffixPatterns) {
    if (p.pattern.test(italian)) {
      // 检查英语是否对应
      const englishBase = english.toLowerCase().replace(/e$/, ''); // 去掉末尾 e
      const italianBase = italian.toLowerCase().replace(p.pattern, '');
      if (englishBase.includes(italianBase) || italianBase.includes(englishBase)) {
        return p.suffix;
      }
    }
  }
  return null;
}

/**
 * 计算最终相似度分数
 */
function calculateSimilarity(italian, english) {
  const distance = levenshteinDistance(italian, english);
  const maxLen = Math.max(italian.length, english.length);
  let score = baseSimilarityScore(distance, maxLen);
  
  // 后缀匹配加分
  const pattern = matchSuffixPattern(italian, english);
  if (pattern) {
    score += 20;
  }
  
  // 长度相近加分
  const lenDiff = Math.abs(italian.length - english.length);
  if (lenDiff <= 2) score += 10;
  
  return { score: Math.min(100, score), pattern };
}

/**
 * 确定难度等级
 */
function getDifficulty(score) {
  if (score >= 80) return 'easy';
  if (score >= 50) return 'medium';
  return 'hard';
}

// === 执行筛选 ===

const cognates = [];
const stats = { easy: 0, medium: 0, hard: 0, byPattern: {} };

vocabulary.forEach(entry => {
  const { italian, english, chinese, rank } = entry;
  
  // 只处理有英文翻译的词条
  if (!english || english.length < 2) return;
  
  // 取英文翻译的第一个词（如果有多个）
  const firstEnglish = english.split(/[;,]/)[0].trim().toLowerCase();
  
  // 计算相似度
  const { score, pattern } = calculateSimilarity(italian, firstEnglish);
  
  // 筛选条件：相似度 >= 50 且 rank <= 10000
  if (score >= 50 && rank <= 10000) {
    const difficulty = getDifficulty(score);
    
    cognates.push({
      italian,
      english: firstEnglish,
      chinese: (chinese || '').split(/[;,]/)[0].trim(),
      patternType: pattern,
      similarityScore: score,
      difficulty,
      rank
    });
    
    stats[difficulty]++;
    if (pattern) {
      stats.byPattern[pattern] = (stats.byPattern[pattern] || 0) + 1;
    }
  }
});

// 按相似度排序
cognates.sort((a, b) => b.similarityScore - a.similarityScore);

console.log(`\n筛选结果:`);
console.log(`  Easy (≥80): ${stats.easy}`);
console.log(`  Medium (50-79): ${stats.medium}`);
console.log(`  Hard (<50): ${stats.hard}`);
console.log(`  总计: ${cognates.length}`);
console.log(`\n按后缀规律分布:`);
Object.entries(stats.byPattern)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count}`);
  });

// === 生成 cognates.js ===

const jsContent = `// Cognate Vocabulary Data
// Italian-English similar words for efficient vocabulary transfer
// Total entries: ${cognates.length}
// Generated on ${new Date().toISOString().split('T')[0]}
// Structure: {italian, english, chinese, patternType, similarityScore, difficulty, rank}

const COGNATE_DATA = ${JSON.stringify(cognates, null, 2)};
`;

const outputPath = path.join(rootDir, 'data', 'cognates.js');
fs.writeFileSync(outputPath, jsContent, 'utf8');
console.log(`\n✅ 已保存到: ${outputPath}`);
```

- [ ] **Step 2: Run the script to verify it works**

Run: `node scripts/cognate_extractor.js`
Expected: Output showing cognate counts and `data/cognates.js` created

- [ ] **Step 3: Commit the extractor script**

```bash
git add scripts/cognate_extractor.js
git commit -m "feat: add cognate extraction script"
```

---

### Task 2: Generate Cognate Data

**Files:**
- Create: `data/cognates.js` (generated)

- [ ] **Step 1: Run the extraction script**

Run: `node scripts/cognate_extractor.js`
Expected: Creates `data/cognates.js` with ~2000-4000 cognate entries

- [ ] **Step 2: Verify generated data structure**

Read first 10 lines of `data/cognates.js` to verify format:
```javascript
const COGNATE_DATA = [
  {
    "italian": "piano",
    "english": "piano",
    "chinese": "钢琴",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1234
  },
  // ...
];
```

- [ ] **Step 3: Commit the generated cognate data**

```bash
git add data/cognates.js
git commit -m "feat: generate cognate vocabulary data (N entries)"
```

---

### Task 3: Create Cognate Practice Module

**Files:**
- Create: `cognate-app.js`

- [ ] **Step 1: Write cognate-app.js core structure**

```javascript
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
  const COGNATE_PATTERNS_KEY = 'dimenticato_cognate_patterns';

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
   * 返回两个单词的 HTML，差异部分用 <span class="diff"> 标记
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
                   (itDiff ? `<span class="cognate-diff">${escapeHtml(itDiff)}</span>` : '') +
                   escapeHtml(commonSuffix),
      englishHtml: escapeHtml(commonPrefix) +
                   (enDiff ? `<span class="cognate-diff">${escapeHtml(enDiff)}</span>` : '') +
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
      const word = CognateState.words[CognateState.currentIndex];
      const container = document.getElementById('cognatePracticeContainer');
      
      container.innerHTML = `
        <div class="cognate-prompt-card">
          <div class="prompt-english">
            <span class="prompt-label">English:</span>
            <span class="prompt-word">${escapeHtml(word.english)}</span>
          </div>
          <div class="prompt-chinese">${escapeHtml(word.chinese)}</div>
          <input type="text" class="cognate-input" id="cognateInput" 
                 placeholder="Type Italian..." autocomplete="off">
          <div class="cognate-actions">
            <button class="btn primary" id="cognateCheckBtn">Check</button>
            <button class="btn" id="cognateSkipBtn">Skip</button>
          </div>
          <div class="cognate-feedback hidden" id="cognateFeedback"></div>
          <div class="cognate-progress">
            <span id="cognateProgressNum">${CognateState.currentIndex + 1}</span> / ${CognateState.words.length}
            <span class="accuracy">Accuracy: <span id="cognateAccuracy">${this.getAccuracy()}%</span></span>
          </div>
        </div>
      `;
      
      document.getElementById('cognateInput').focus();
      document.getElementById('cognateCheckBtn').addEventListener('click', () => this.checkAnswer(word));
      document.getElementById('cognateSkipBtn').addEventListener('click', () => this.skip(word));
      document.getElementById('cognateInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.checkAnswer(word);
      });
    },

    checkAnswer(word) {
      const input = document.getElementById('cognateInput');
      const feedback = document.getElementById('cognateFeedback');
      const userAnswer = input.value.trim();
      
      CognateState.totalCount++;
      
      const isCorrect = normalizeForCompare(userAnswer) === normalizeForCompare(word.italian);
      
      if (isCorrect) {
        CognateState.correctCount++;
        feedback.innerHTML = `<span class="correct-answer">✓ Correct! ${escapeHtml(word.italian)}</span>`;
        feedback.classList.remove('incorrect');
        feedback.classList.add('correct');
      } else {
        const { italianHtml, englishHtml } = highlightDiff(word.italian, word.english);
        feedback.innerHTML = `
          <span class="incorrect-answer">✗ Incorrect</span>
          <div class="contrast-display">
            <div>Italian: ${italianHtml}</div>
            <div>English: ${englishHtml}</div>
          </div>
        `;
        feedback.classList.remove('correct');
        feedback.classList.add('incorrect');
      }
      
      feedback.classList.remove('hidden');
      document.getElementById('cognateAccuracy').textContent = this.getAccuracy() + '%';
      
      setTimeout(() => this.nextQuestion(), isCorrect ? 1000 : 2500);
    },

    skip(word) {
      const feedback = document.getElementById('cognateFeedback');
      const { italianHtml, englishHtml } = highlightDiff(word.italian, word.english);
      feedback.innerHTML = `
        <span class="skipped">Skipped</span>
        <div class="contrast-display">
          <div>Italian: ${italianHtml}</div>
          <div>English: ${englishHtml}</div>
        </div>
      `;
      feedback.classList.remove('hidden');
      setTimeout(() => this.nextQuestion(), 2000);
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
      const container = document.getElementById('cognatePracticeContainer');
      const accuracy = this.getAccuracy();
      container.innerHTML = `
        <div class="cognate-complete">
          <h2>Practice Complete!</h2>
          <div class="stats-summary">
            <div>Correct: ${CognateState.correctCount} / ${CognateState.totalCount}</div>
            <div>Accuracy: ${accuracy}%</div>
          </div>
          <button class="btn primary" onclick="CognateApp.startEnglishPromptMode()">Practice Again</button>
          <button class="btn" onclick="CognateApp.showModeSelection()">Back to Modes</button>
        </div>
      `;
    }
  };

  // === Mode 2: Contrast Mode ===

  const ContrastMode = {
    start(words, filter = null) {
      // 可按 difficulty 或 patternType 筛选
      let filteredWords = words;
      if (filter) {
        if (filter.difficulty) {
          filteredWords = words.filter(w => w.difficulty === filter.difficulty);
        } else if (filter.patternType) {
          filteredWords = words.filter(w => w.patternType === filter.patternType);
        }
      }
      
      CognateState.words = filteredWords;
      CognateState.currentIndex = 0;
      CognateState.currentMode = 'contrast';
      
      this.showWord();
    },

    showWord() {
      const word = CognateState.words[CognateState.currentIndex];
      const container = document.getElementById('cognatePracticeContainer');
      const { italianHtml, englishHtml } = highlightDiff(word.italian, word.english);
      
      container.innerHTML = `
        <div class="contrast-card">
          <div class="contrast-row">
            <span class="lang-label">Italian:</span>
            <span class="contrast-word">${italianHtml}</span>
          </div>
          <div class="contrast-row">
            <span class="lang-label">English:</span>
            <span class="contrast-word">${englishHtml}</span>
          </div>
          <div class="contrast-chinese">${escapeHtml(word.chinese)}</div>
          <div class="contrast-meta">
            ${word.patternType ? `<span class="pattern-tag">${escapeHtml(word.patternType)}</span>` : ''}
            <span class="similarity-tag">${word.similarityScore}% similar</span>
          </div>
          <div class="contrast-nav">
            <button class="btn" id="contrastPrev" ${CognateState.currentIndex === 0 ? 'disabled' : ''}>← Prev</button>
            <span class="nav-position">${CognateState.currentIndex + 1} / ${CognateState.words.length}</span>
            <button class="btn primary" id="contrastNext">Next →</button>
          </div>
        </div>
      `;
      
      document.getElementById('contrastPrev').addEventListener('click', () => this.prevWord());
      document.getElementById('contrastNext').addEventListener('click', () => this.nextWord());
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
      const container = document.getElementById('cognatePracticeContainer');
      container.innerHTML = `
        <div class="cognate-complete">
          <h2>Review Complete!</h2>
          <p>You've reviewed all ${CognateState.words.length} cognates.</p>
          <button class="btn primary" onclick="CognateApp.startContrastMode()">Review Again</button>
          <button class="btn" onclick="CognateApp.showModeSelection()">Back to Modes</button>
        </div>
      `;
    }
  };

  // === Mode 3: Pattern Group Mode ===

  const PatternGroupMode = {
    getPatternGroups(words) {
      const groups = {};
      words.forEach(w => {
        if (w.patternType) {
          groups[w.patternType] = (groups[w.patternType] || []);
          groups[w.patternType].push(w);
        }
      });
      // 添加无规律的词汇到 "Other" 组
      const otherWords = words.filter(w => !w.patternType);
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
      const groups = this.getPatternGroups(CognateState.words);
      const container = document.getElementById('cognatePracticeContainer');
      
      const groupCards = Object.entries(groups)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([pattern, words]) => {
          const mastered = CognateState.masteredPatterns.has(pattern);
          return `
            <div class="pattern-card ${mastered ? 'mastered' : ''}" data-pattern="${escapeAttribute(pattern)}">
              <div class="pattern-name">${escapeHtml(pattern)}</div>
              <div class="pattern-count">${words.length} words</div>
              ${mastered ? '<span class="mastered-badge">✓ Completed</span>' : ''}
            </div>
          `;
        }).join('');
      
      container.innerHTML = `
        <div class="pattern-selection">
          <h2>Learn by Pattern</h2>
          <p class="subtitle">Master cognate transformation patterns</p>
          <div class="pattern-grid">${groupCards}</div>
        </div>
      `;
      
      container.querySelectorAll('.pattern-card:not(.mastered)').forEach(card => {
        card.addEventListener('click', () => {
          const pattern = card.dataset.pattern;
          this.startPatternPractice(pattern, groups[pattern]);
        });
      });
    },

    startPatternPractice(pattern, words) {
      CognateState.currentPattern = pattern;
      CognateState.words = words;
      CognateState.currentIndex = 0;
      CognateState.correctCount = 0;
      CognateState.totalCount = 0;
      
      // 先展示规律说明
      this.showPatternIntro(pattern, words);
    },

    showPatternIntro(pattern, words) {
      const container = document.getElementById('cognatePracticeContainer');
      
      // 生成示例
      const examples = words.slice(0, 5);
      const exampleHtml = examples.map(w => {
        const { italianHtml, englishHtml } = highlightDiff(w.italian, w.english);
        return `<div class="example-row">${italianHtml} ↔ ${englishHtml}</div>`;
      }).join('');
      
      container.innerHTML = `
        <div class="pattern-intro">
          <h2>Pattern: ${escapeHtml(pattern)}</h2>
          <div class="pattern-explanation">
            <p>Learn how "${escapeHtml(pattern.replace('-', ' → ').split('/')[0])}" transforms to 
               "${escapeHtml(pattern.split('/')[1] || 'English')}".</p>
          </div>
          <div class="pattern-examples">
            <h3>Examples:</h3>
            ${exampleHtml}
          </div>
          <button class="btn primary" id="startPatternPractice">Start Practice (${words.length} words)</button>
        </div>
      `;
      
      document.getElementById('startPatternPractice').addEventListener('click', () => {
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
      CognateState.words = words.sort((a, b) => a.rank - b.rank);
      CognateState.currentMode = 'browse';
      this.showList();
    },

    showList() {
      const container = document.getElementById('cognatePracticeContainer');
      
      const filterOptions = `
        <div class="browse-filter">
          <select id="difficultyFilter">
            <option value="">All Difficulty</option>
            <option value="easy">Easy (≥80%)</option>
            <option value="medium">Medium (50-79%)</option>
            <option value="hard">Hard (<50%)</option>
          </select>
        </div>
      `;
      
      const wordList = CognateState.words.slice(0, 100).map(w => {
        const { italianHtml, englishHtml } = highlightDiff(w.italian, w.english);
        return `
          <div class="browse-item" data-difficulty="${w.difficulty}">
            <div class="browse-italian">${italianHtml}</div>
            <div class="browse-english">${englishHtml}</div>
            <div class="browse-chinese">${escapeHtml(w.chinese)}</div>
            <div class="browse-score">${w.similarityScore}%</div>
          </div>
        `;
      }).join('');
      
      container.innerHTML = `
        <div class="cognate-browse">
          <h2>Cognate Word List</h2>
          ${filterOptions}
          <div class="browse-list">${wordList}</div>
          <div class="browse-more">
            <button class="btn" id="loadMoreBrowse">Load More</button>
          </div>
        </div>
      `;
      
      document.getElementById('difficultyFilter').addEventListener('change', (e) => {
        this.filterByDifficulty(e.target.value);
      });
    },

    filterByDifficulty(difficulty) {
      const items = document.querySelectorAll('.browse-item');
      items.forEach(item => {
        if (!difficulty || item.dataset.difficulty === difficulty) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
  };

  // === Cognate App Controller ===

  const CognateApp = {
    init() {
      loadCognateProgress();
    },

    showModeSelection() {
      const container = document.getElementById('cognatePracticeContainer');
      container.innerHTML = `
        <div class="cognate-mode-selection">
          <h2>Cognate Practice</h2>
          <p class="subtitle">Learn Italian words similar to English</p>
          <div class="mode-buttons">
            <button class="mode-btn" id="englishPromptBtn">
              <span class="mode-icon">📝</span>
              <span class="mode-name">English Prompt</span>
              <span class="mode-desc">Type Italian from English hint</span>
            </button>
            <button class="mode-btn" id="contrastBtn">
              <span class="mode-icon">👁️</span>
              <span class="mode-name">Contrast View</span>
              <span class="mode-desc">Compare IT/EN with highlights</span>
            </button>
            <button class="mode-btn" id="patternGroupBtn">
              <span class="mode-icon">📚</span>
              <span class="mode-name">Pattern Groups</span>
              <span class="mode-desc">Learn by suffix patterns</span>
            </button>
            <button class="mode-btn" id="browseBtn">
              <span class="mode-icon">📖</span>
              <span class="mode-name">Browse</span>
              <span class="mode-desc">Scroll through cognates</span>
            </button>
          </div>
        </div>
      `;
      
      document.getElementById('englishPromptBtn').addEventListener('click', () => this.startEnglishPromptMode());
      document.getElementById('contrastBtn').addEventListener('click', () => this.startContrastMode());
      document.getElementById('patternGroupBtn').addEventListener('click', () => this.startPatternGroupMode());
      document.getElementById('browseBtn').addEventListener('click', () => this.startBrowseMode());
    },

    startEnglishPromptMode(difficulty = null) {
      let words = COGNATE_DATA;
      if (difficulty) {
        words = words.filter(w => w.difficulty === difficulty);
      }
      EnglishPromptMode.start(words);
    },

    startContrastMode(filter = null) {
      ContrastMode.start(COGNATE_DATA, filter);
    },

    startPatternGroupMode() {
      PatternGroupMode.start(COGNATE_DATA);
    },

    startBrowseMode() {
      BrowseMode.start(COGNATE_DATA);
    }
  };

  // Expose to global
  window.CognateApp = CognateApp;
  window.CognateState = CognateState;

})();
```

- [ ] **Step 2: Commit the cognate practice module**

```bash
git add cognate-app.js
git commit -m "feat: add cognate practice modes (EnglishPrompt, Contrast, PatternGroup, Browse)"
```

---

### Task 4: Modify index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add cognate source button in vocab source screen**

Find the vocab source section around line 765 and add cognate button after system vocabulary section:

```html
          <!-- Add after the vocab-section div, before custom-wordbook-section -->
          <div class="vocab-section cognate-section">
            <h3 class="section-title">Cognates</h3>
            <p class="subtitle compact">Italian words similar to English. Leverage your English vocabulary.</p>
            <div class="level-buttons">
              <button class="level-btn vocab-source-btn cognate-btn" data-level="cognate" data-source="cognate">
                <span class="level-icon"><svg class="icon"><use href="#icon-link"></use></svg></span>
                <span class="level-name">Cognates</span>
                <span class="level-count">~2000 词</span>
              </button>
            </div>
          </div>
```

- [ ] **Step 2: Add cognate practice container div**

Find the practice screen section and add cognate practice container:

```html
<!-- Add inside the practice screen, after other practice containers -->
<div id="cognatePracticeContainer" class="practice-container hidden"></div>
```

- [ ] **Step 3: Add script reference for cognate-app.js**

Add after the data/english-vocabulary.js line (around line 2017):

```html
  <script src="data/cognates.js"></script>
  <script src="cognate-app.js"></script>
```

- [ ] **Step 4: Commit index.html changes**

```bash
git add index.html
git commit -m "feat: add cognate source button and practice container to UI"
```

---

### Task 5: Modify app.js

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add 'cognate' to selectedSourceType handling**

Find the AppState definition around line 76 and update the comment:

```javascript
  selectedSource: null,     // 'system', 'cognate' 或 wordbook id
  selectedSourceType: null, // 'system', 'cognate' 或 'custom'
```

- [ ] **Step 2: Add cognate button click handler**

Find the vocab-source-btn event listener around line 1974 and extend it:

```javascript
  // Add after the existing vocab-source-btn forEach block:
  
  // Cognate button handler
  document.querySelectorAll('.cognate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AppState.selectedLevel = 'cognate';
      AppState.selectedSource = 'cognate';
      AppState.selectedSourceType = 'cognate';
      AppState.currentWordbook = null;
      
      // 加载 cognate 词汇
      if (typeof COGNATE_DATA !== 'undefined') {
        AppState.currentWords = COGNATE_DATA.slice(0, 1000); // 默认取前 1000
      }
      
      // 重置进度
      AppState.masteredWords = new Set();
      
      // 更新 UI
      updateHeaderStats();
      updateSelectionHighlight();
      showScreen('practiceModeScreen');
      
      // 显示 cognate 模式选择
      showCognateModeSelection();
    });
  });
```

- [ ] **Step 3: Add showCognateModeSelection function**

Add this function after the existing mode selection logic:

```javascript
function showCognateModeSelection() {
  // 隐藏普通练习模式按钮
  const normalModes = document.getElementById('practiceModeScreen');
  
  // 显示 cognate 模式选择
  const cognateContainer = document.getElementById('cognatePracticeContainer');
  cognateContainer.classList.remove('hidden');
  
  if (typeof CognateApp !== 'undefined') {
    CognateApp.showModeSelection();
  }
}

function hideCognateModeSelection() {
  const cognateContainer = document.getElementById('cognatePracticeContainer');
  cognateContainer.classList.add('hidden');
}
```

- [ ] **Step 4: Update updateSelectionHighlight for cognate**

Find the updateSelectionHighlight function around line 638 and add cognate handling:

```javascript
function updateSelectionHighlight() {
  document.querySelectorAll('.vocab-source-btn, .wordbook-card').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // 根据选择类型高亮
  if (AppState.selectedSourceType === 'system') {
    document.querySelectorAll('.vocab-source-btn:not(.cognate-btn)').forEach(btn => {
      const level = btn.dataset.level;
      if ((level === 'all' && AppState.selectedLevel === 'all') ||
          (level !== 'all' && parseInt(level) === AppState.selectedLevel)) {
        btn.classList.add('selected');
      }
    });
  } else if (AppState.selectedSourceType === 'cognate') {
    document.querySelectorAll('.cognate-btn').forEach(btn => {
      btn.classList.add('selected');
    });
  } else if (AppState.selectedSourceType === 'custom' && AppState.selectedSource) {
    const card = document.querySelector(`.wordbook-card[data-wordbook-id="${AppState.selectedSource}"]`);
    if (card) {
      card.classList.add('selected');
    }
  }
  
  // 更新模式按钮状态
  updateModeButtons();
}
```

- [ ] **Step 5: Update updateModeButtons to handle cognate**

Find the updateModeButtons function around line 662:

```javascript
function updateModeButtons() {
  const modeButtons = [
    document.getElementById('multipleChoiceBtn'),
    document.getElementById('spellingBtn'),
    document.getElementById('browseBtn')
  ];
  
  // Cognate 模式时隐藏普通模式按钮
  const isCognate = AppState.selectedSourceType === 'cognate';
  modeButtons.forEach(btn => {
    if (btn) {
      btn.disabled = isCognate || AppState.selectedSourceType === null;
      btn.style.display = isCognate ? 'none' : '';
    }
  });
  
  // Cognate 模式时显示 cognate 容器
  if (isCognate && typeof CognateApp !== 'undefined') {
    showCognateModeSelection();
  }
}
```

- [ ] **Step 6: Commit app.js changes**

```bash
git add app.js
git commit -m "feat: integrate cognate source type and mode switching"
```

---

### Task 6: Modify styles.css

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add cognate-specific styles**

Add at the end of styles.css:

```css
/* === Cognate Practice Styles === */

.cognate-section {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.05), rgba(155, 89, 182, 0.05));
}

.cognate-btn {
  background: linear-gradient(135deg, #3498db, #9b59b6);
  border-color: #3498db;
}

.cognate-btn:hover {
  background: linear-gradient(135deg, #2980b9, #8e44ad);
}

.cognate-btn.selected {
  background: linear-gradient(135deg, #9b59b6, #3498db);
  border-color: #9b59b6;
}

/* Cognate diff highlighting */
.cognate-diff {
  color: #e67e22;
  font-weight: 600;
  background: rgba(230, 126, 34, 0.1);
  padding: 0 2px;
  border-radius: 2px;
}

/* Cognate practice container */
.cognate-prompt-card,
.contrast-card,
.pattern-intro,
.pattern-selection,
.cognate-browse {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.prompt-english {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.prompt-word {
  font-weight: 600;
  color: var(--accent-primary);
}

.prompt-chinese {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.cognate-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.cognate-input:focus {
  border-color: var(--accent-primary);
  outline: none;
}

.cognate-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cognate-feedback {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.cognate-feedback.correct {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
}

.cognate-feedback.incorrect {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.correct-answer {
  font-weight: 600;
}

.contrast-display {
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.cognate-progress {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--text-muted);
}

.accuracy {
  margin-left: 1rem;
}

/* Contrast mode */
.contrast-card {
  text-align: center;
}

.contrast-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.lang-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.contrast-word {
  font-size: 1.5rem;
}

.contrast-chinese {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.contrast-meta {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.pattern-tag,
.similarity-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.pattern-tag {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.similarity-tag {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.contrast-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-position {
  color: var(--text-muted);
}

/* Pattern group mode */
.pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.pattern-card {
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.pattern-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
}

.pattern-card.mastered {
  opacity: 0.6;
  cursor: default;
}

.pattern-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.pattern-count {
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.mastered-badge {
  color: #27ae60;
  margin-top: 0.5rem;
}

.pattern-intro h2 {
  text-align: center;
}

.pattern-explanation {
  background: rgba(155, 89, 182, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.pattern-examples {
  margin: 1rem 0;
}

.example-row {
  padding: 0.5rem;
  font-size: 1.1rem;
}

/* Browse mode */
.cognate-browse h2 {
  text-align: center;
}

.browse-filter {
  margin-bottom: 1rem;
}

.browse-filter select {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.browse-list {
  max-height: 400px;
  overflow-y: auto;
}

.browse-item {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 0.5fr;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.browse-italian,
.browse-english {
  font-size: 1rem;
}

.browse-chinese {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.browse-score {
  color: #3498db;
  font-size: 0.85rem;
}

/* Mode selection buttons */
.cognate-mode-selection {
  text-align: center;
}

.cognate-mode-selection h2 {
  margin-bottom: 0.5rem;
}

.mode-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.mode-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.mode-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.mode-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Complete screen */
.cognate-complete {
  text-align: center;
  padding: 2rem;
}

.cognate-complete h2 {
  color: #27ae60;
}

.stats-summary {
  margin: 1.5rem 0;
  font-size: 1.25rem;
}
```

- [ ] **Step 2: Commit styles.css changes**

```bash
git add styles.css
git commit -m "feat: add cognate practice styles (diff highlight, mode buttons)"
```

---

### Task 7: Integration Testing

**Files:**
- Test: Manual browser testing

- [ ] **Step 1: Verify script loading order**

Open `index.html` in browser, check console for errors. Verify scripts load in order:
1. lib/utils.js
2. lib/quiz-engine.js
3. data/cognates.js
4. cognate-app.js

- [ ] **Step 2: Test cognate source button**

Click the "Cognates" button in vocab source screen:
- Should highlight the button
- Should navigate to practice mode screen
- Should show cognate mode selection (4 mode buttons)

- [ ] **Step 3: Test English Prompt Mode**

Click "English Prompt" button:
- Should show English word and Chinese hint
- Should have input field for Italian
- Should check answer and show feedback with diff highlighting

- [ ] **Step 4: Test Contrast Mode**

Click "Contrast View" button:
- Should show Italian and English side by side
- Should highlight diff portions in orange
- Should have prev/next navigation

- [ ] **Step 5: Test Pattern Group Mode**

Click "Pattern Groups" button:
- Should show pattern cards with counts
- Clicking a pattern should show intro with examples
- Should start English Prompt practice for that pattern

- [ ] **Step 6: Test Browse Mode**

Click "Browse" button:
- Should show scrollable list of cognates
- Should have difficulty filter dropdown
- Should display similarity score for each word

- [ ] **Step 7: Fix any issues found**

If any mode doesn't work, debug and fix in respective files.

- [ ] **Step 8: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve cognate integration issues"
```

---

## Self-Review Checklist

- [x] Spec coverage: All requirements have corresponding tasks
- [x] Placeholder scan: No TBD/TODO placeholders
- [x] Type consistency: Function names consistent across files (CognateApp, showCognateModeSelection)
- [x] File paths: All paths are exact and correct
- [x] Code completeness: All steps have complete code blocks