# Confusable Distractors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make multiple-choice quiz distractors orthographically confusable with the prompt word (e.g. *casa* → *cassa, caso, cosa*) behind an easy/hard difficulty setting, for Italian, German, and English.

**Architecture:** Add a pure, unit-tested `lib/word-similarity.js` module (Levenshtein + distractor selection on word objects). `lib/quiz-engine.js`'s single shared `generateOptions()` branches on a new `config.difficulty`: `'hard'` calls the similarity module, `'easy'` keeps today's random path. The difficulty preference lives in `localStorage` behind two static helpers on `QuizEngine` (`getDifficulty`/`setDifficulty`, default `'hard'`); each app's engine config exposes it via a `get difficulty()` getter so changes take effect on the next question with no reload. A new "学习偏好 / Learning preferences" group in the Settings screen toggles it.

**Tech Stack:** Vanilla ES5-style browser JavaScript (matches existing `lib/` IIFE modules), LocalStorage, browser HTML test harness (`tests/test-quiz-engine.html`). Node is used only as a fast dev-loop checker for the pure module via a `window` shim.

**Reference (read before starting):** `docs/superpowers/specs/2026-06-25-confusable-distractors-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/word-similarity.js` | **New.** Pure module: `editDistance(a,b)` + `pickConfusableDistractors(currentWord, pool, opts)`. No DOM, no localStorage. Exposed as `window.WordSimilarity`. |
| `lib/quiz-engine.js` | `generateOptions()` honors `config.difficulty`; add static `DIFFICULTY_KEY` / `getDifficulty()` / `setDifficulty()` preference accessors. |
| `app.js` | Italian MC engine config gets `get difficulty()`; wire the Settings difficulty toggle. |
| `german-app.js` | German + English MC engine configs each get `get difficulty()`. |
| `index.html` | Load `lib/word-similarity.js` before `lib/quiz-engine.js`; add Learning-preferences settings group markup. |
| `styles.css` | Styles for the new settings section + difficulty toggle. |
| `tests/test-quiz-engine.html` | Load `word-similarity.js`; add similarity + difficulty unit tests. |
| `CODE_SPACE.md` | Update lib module map + change log. |

---

## Task 1: Pure similarity module `lib/word-similarity.js`

**Files:**
- Create: `lib/word-similarity.js`
- Test (durable): `tests/test-quiz-engine.html` (added in Task 2's harness wiring; Task 1 verifies via Node shim)

- [ ] **Step 1: Write the failing check (Node shim)**

Run this — it MUST fail because the file does not exist yet:

```bash
node -e "global.window={}; require('./lib/word-similarity.js'); const W=window.WordSimilarity; console.assert(W.editDistance('casa','cosa')===1,'casa/cosa should be 1'); console.assert(W.editDistance('casa','casa')===0,'identical=0'); console.assert(W.editDistance('','abc')===3,'empty/abc=3'); console.assert(W.editDistance('kitten','sitting')===3,'kitten/sitting=3'); console.assert(W.editDistance('caffè','caffe')===0,'accent-insensitive'); console.log('editDistance OK');"
```

Expected: FAIL — `Cannot find module './lib/word-similarity.js'`.

- [ ] **Step 2: Create the module**

Create `lib/word-similarity.js` with exactly this content:

```javascript
/**
 * Dimenticato — 词形相似度模块
 * 纯函数，无 DOM、无 localStorage。在 lib/quiz-engine.js 之前加载。
 * 为"困难"难度的选择题挑选与提示词拼写相近的干扰项。
 */
(function () {
  'use strict';

  // 与 QuizEngine.normalizeString 保持一致：去重音、小写、trim
  function normalize(str) {
    return (str == null ? '' : String(str)).trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Levenshtein 编辑距离（基于归一化后的字符串）
  function editDistance(a, b) {
    a = normalize(a);
    b = normalize(b);
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var cur = [i];
      for (var k = 1; k <= b.length; k++) {
        var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
      }
      prev = cur;
    }
    return prev[b.length];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /**
   * 挑选与 currentWord 拼写相近的干扰项（返回单词对象数组）。
   * @param {Object} currentWord 当前提示词
   * @param {Array}  pool        候选词池
   * @param {Object} opts        { count, sourceField, targetField, correctTarget, windowSize }
   * @returns {Array} 最多 count 个干扰项单词对象，目标文本互不相同且不等于 correctTarget
   */
  function pickConfusableDistractors(currentWord, pool, opts) {
    opts = opts || {};
    var count = opts.count || 3;
    var sourceField = opts.sourceField;
    var targetField = opts.targetField;
    var correctTarget = opts.correctTarget;
    var windowSize = opts.windowSize || 8;
    var windowCount = Math.max(windowSize, count);

    if (!Array.isArray(pool) || !currentWord) return [];

    var promptSource = currentWord[sourceField];
    var promptNorm = normalize(promptSource);

    // 1. 候选池：排除当前词本身、目标文本为空或等于正确答案的词
    var candidates = pool.filter(function (w) {
      if (!w || w === currentWord) return false;
      var t = w[targetField];
      if (t == null || t === '') return false;
      if (t === correctTarget) return false;
      return true;
    });

    // 2. 打分：1–2 字符提示词用频率(rank)邻近度，否则用编辑距离
    var useFrequency = promptNorm.length <= 2 &&
      typeof currentWord.rank === 'number';
    var promptRank = currentWord.rank;

    var ranked = candidates.map(function (w) {
      var score;
      if (useFrequency && typeof w.rank === 'number') {
        score = Math.abs(w.rank - promptRank);
      } else {
        score = editDistance(w[sourceField], promptSource);
      }
      return { word: w, score: score };
    }).sort(function (x, y) { return x.score - y.score; });

    // 3. 取最近的一窗，打乱后取 count 个，按目标文本去重
    var picked = [];
    var usedTargets = {};
    if (correctTarget != null) usedTargets[correctTarget] = true;

    function tryAdd(w) {
      var t = w[targetField];
      if (t == null || t === '' || usedTargets[t]) return;
      usedTargets[t] = true;
      picked.push(w);
    }

    var windowItems = shuffle(ranked.slice(0, windowCount));
    for (var i = 0; i < windowItems.length && picked.length < count; i++) {
      tryAdd(windowItems[i].word);
    }

    // 4. 候选不足时，先用窗口外的剩余 ranked 补齐，再用整池随机补齐
    for (var k = windowCount; k < ranked.length && picked.length < count; k++) {
      tryAdd(ranked[k].word);
    }
    if (picked.length < count) {
      var rest = shuffle(pool);
      for (var m = 0; m < rest.length && picked.length < count; m++) {
        if (rest[m] && rest[m] !== currentWord) tryAdd(rest[m]);
      }
    }

    return picked;
  }

  window.WordSimilarity = {
    editDistance: editDistance,
    pickConfusableDistractors: pickConfusableDistractors,
    _normalize: normalize
  };
})();
```

- [ ] **Step 3: Run the editDistance check — verify it passes**

```bash
node -e "global.window={}; require('./lib/word-similarity.js'); const W=window.WordSimilarity; console.assert(W.editDistance('casa','cosa')===1,'casa/cosa should be 1'); console.assert(W.editDistance('casa','casa')===0,'identical=0'); console.assert(W.editDistance('','abc')===3,'empty/abc=3'); console.assert(W.editDistance('kitten','sitting')===3,'kitten/sitting=3'); console.assert(W.editDistance('caffè','caffe')===0,'accent-insensitive'); console.log('editDistance OK');"
```

Expected: PASS — prints `editDistance OK` with no assertion errors.

- [ ] **Step 4: Run the distractor-selection check — verify it passes**

```bash
node -e "
global.window={};
require('./lib/word-similarity.js');
const W=window.WordSimilarity;
const prompt={italian:'casa',english:'house',rank:50};
const pool=[
  prompt,
  {italian:'cosa',english:'thing',rank:60},
  {italian:'caso',english:'case',rank:70},
  {italian:'cassa',english:'crate',rank:80},
  {italian:'aeroplano',english:'airplane',rank:90},
  {italian:'montagna',english:'mountain',rank:95}
];
// windowSize=count=3 makes the window the 3 closest, so far words are excluded
const picked=W.pickConfusableDistractors(prompt,pool,{count:3,windowSize:3,sourceField:'italian',targetField:'english',correctTarget:'house'});
console.assert(picked.length===3,'should pick 3, got '+picked.length);
const srcs=picked.map(w=>w.italian);
console.assert(!srcs.includes('aeroplano') && !srcs.includes('montagna'),'far words must be excluded: '+srcs);
console.assert(!srcs.includes('casa'),'must exclude the prompt word');
console.log('confusable selection OK');
"
```

Expected: PASS — prints `confusable selection OK`.

- [ ] **Step 5: Run the short-word + dedupe checks — verify they pass**

```bash
node -e "
global.window={};
require('./lib/word-similarity.js');
const W=window.WordSimilarity;
// Short prompt 'e' (rank 1) must rank by frequency proximity, NOT edit distance.
// 'è' normalizes to 'e' (edit distance 0) but has a far rank -> must be excluded.
const prompt={italian:'e',english:'and',rank:1};
const pool=[
  prompt,
  {italian:'di',english:'of',rank:2},
  {italian:'ed',english:'and(2)',rank:3},
  {italian:'la',english:'the',rank:4},
  {italian:'è',english:'is',rank:200}
];
const picked=W.pickConfusableDistractors(prompt,pool,{count:3,windowSize:3,sourceField:'italian',targetField:'english',correctTarget:'and'});
const srcs=picked.map(w=>w.italian);
console.assert(picked.length===3,'short-word should pick 3');
console.assert(!srcs.includes('è'),'frequency mode must exclude far-rank è (edit-close decoy): '+srcs);

// Target-text dedupe: two words share meaning 'X'; only one may appear, none == correct.
const p2={italian:'mela',english:'apple',rank:10};
const pool2=[
  p2,
  {italian:'mona',english:'X',rank:11},
  {italian:'mola',english:'X',rank:12},
  {italian:'mara',english:'Y',rank:13},
  {italian:'meta',english:'apple',rank:14}
];
const picked2=W.pickConfusableDistractors(p2,pool2,{count:3,sourceField:'italian',targetField:'english',correctTarget:'apple'});
const tgts=picked2.map(w=>w.english);
console.assert(new Set(tgts).size===tgts.length,'no duplicate target texts: '+tgts);
console.assert(!tgts.includes('apple'),'must not include the correct answer text');

// Insufficient candidates: only 2 valid distractors available -> returns 2, never crashes.
const p3={italian:'sole',english:'sun',rank:1};
const pool3=[p3,{italian:'sale',english:'salt',rank:2},{italian:'sete',english:'thirst',rank:3}];
const picked3=W.pickConfusableDistractors(p3,pool3,{count:3,sourceField:'italian',targetField:'english',correctTarget:'sun'});
console.assert(picked3.length===2,'should return the 2 available, got '+picked3.length);
console.log('short-word + dedupe + sparse OK');
"
```

Expected: PASS — prints `short-word + dedupe + sparse OK`.

- [ ] **Step 6: Commit**

```bash
git add lib/word-similarity.js
git commit -m "feat: add word-similarity module for confusable distractors

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Wire difficulty into `lib/quiz-engine.js`

**Files:**
- Modify: `lib/quiz-engine.js` (`generateOptions` at lines 37-54; add static helpers before `window.QuizEngine = QuizEngine;` at line 122)
- Test: `tests/test-quiz-engine.html` (add `<script>` at line 21 region; add assertions before the summary at line 112)

- [ ] **Step 1: Add the failing harness tests**

In `tests/test-quiz-engine.html`, first load the new module. Find this block (lines 20-21):

```html
<script src="../lib/utils.js"></script>
<script src="../lib/quiz-engine.js"></script>
```

Replace it with:

```html
<script src="../lib/utils.js"></script>
<script src="../lib/word-similarity.js"></script>
<script src="../lib/quiz-engine.js"></script>
```

Then find the `// --- Summary ---` block (line 112) and insert the following assertions immediately **before** it:

```javascript
  // ===== word-similarity: editDistance =====
  assertEqual(WordSimilarity.editDistance('casa', 'cosa'), 1, 'editDistance casa/cosa = 1');
  assertEqual(WordSimilarity.editDistance('casa', 'casa'), 0, 'editDistance identical = 0');
  assertEqual(WordSimilarity.editDistance('kitten', 'sitting'), 3, 'editDistance kitten/sitting = 3');
  assertEqual(WordSimilarity.editDistance('caffè', 'caffe'), 0, 'editDistance is accent-insensitive');

  // ===== word-similarity: closer words rank ahead =====
  var simPrompt = { italian: 'casa', english: 'house', rank: 50 };
  var simPool = [
    simPrompt,
    { italian: 'cosa', english: 'thing', rank: 60 },
    { italian: 'caso', english: 'case', rank: 70 },
    { italian: 'cassa', english: 'crate', rank: 80 },
    { italian: 'aeroplano', english: 'airplane', rank: 90 },
    { italian: 'montagna', english: 'mountain', rank: 95 }
  ];
  var simPicked = WordSimilarity.pickConfusableDistractors(simPrompt, simPool,
    { count: 3, windowSize: 3, sourceField: 'italian', targetField: 'english', correctTarget: 'house' });
  var simSrcs = simPicked.map(function (w) { return w.italian; });
  assertEqual(simPicked.length, 3, 'pickConfusableDistractors returns 3');
  assert(simSrcs.indexOf('aeroplano') === -1 && simSrcs.indexOf('montagna') === -1, 'distant words are excluded from the closest window');
  assert(simSrcs.indexOf('casa') === -1, 'prompt word itself is excluded');

  // ===== word-similarity: short words use frequency proximity =====
  var shortPrompt = { italian: 'e', english: 'and', rank: 1 };
  var shortPool = [
    shortPrompt,
    { italian: 'di', english: 'of', rank: 2 },
    { italian: 'ed', english: 'and(2)', rank: 3 },
    { italian: 'la', english: 'the', rank: 4 },
    { italian: 'è', english: 'is', rank: 200 }
  ];
  var shortPicked = WordSimilarity.pickConfusableDistractors(shortPrompt, shortPool,
    { count: 3, windowSize: 3, sourceField: 'italian', targetField: 'english', correctTarget: 'and' });
  var shortSrcs = shortPicked.map(function (w) { return w.italian; });
  assertEqual(shortPicked.length, 3, 'short prompt still yields 3 distractors');
  assert(shortSrcs.indexOf('è') === -1, 'short prompt ranks by frequency, excluding far-rank edit-close decoy');

  // ===== word-similarity: target-text dedupe =====
  var dupPrompt = { italian: 'mela', english: 'apple', rank: 10 };
  var dupPool = [
    dupPrompt,
    { italian: 'mona', english: 'X', rank: 11 },
    { italian: 'mola', english: 'X', rank: 12 },
    { italian: 'mara', english: 'Y', rank: 13 },
    { italian: 'meta', english: 'apple', rank: 14 }
  ];
  var dupPicked = WordSimilarity.pickConfusableDistractors(dupPrompt, dupPool,
    { count: 3, sourceField: 'italian', targetField: 'english', correctTarget: 'apple' });
  var dupTgts = dupPicked.map(function (w) { return w.english; });
  var dupUnique = [];
  dupTgts.forEach(function (t) { if (dupUnique.indexOf(t) === -1) dupUnique.push(t); });
  assertEqual(dupUnique.length, dupTgts.length, 'distractor target texts are unique');
  assert(dupTgts.indexOf('apple') === -1, 'distractors never equal the correct answer text');

  // ===== quiz-engine: hard mode yields 4 distinct options via similarity =====
  var hardEngine = new QuizEngine({
    state: { words: [], quizIndex: 0, quizCorrect: 0, quizTotal: 0, currentWord: { italian: 'casa', english: 'house', rank: 50 } },
    stats: {}, mastered: new Set(),
    fieldMap: { source: 'italian', target: 'english' },
    difficulty: 'hard',
    saveFn: function () {}, onUpdateStats: function () {}, dom: {}
  });
  var hardOptions = hardEngine.generateOptions('house', simPool);
  assertEqual(hardOptions.length, 4, 'hard-mode generateOptions returns 4 options');
  assert(hardOptions.indexOf('house') !== -1, 'hard-mode options include the correct answer');
  var hardUnique = [];
  hardOptions.forEach(function (o) { if (hardUnique.indexOf(o) === -1) hardUnique.push(o); });
  assertEqual(hardUnique.length, hardOptions.length, 'hard-mode options have no duplicates');

  // ===== quiz-engine: easy mode preserves random behavior (still 4 options) =====
  var easyEngine = new QuizEngine({
    state: { words: [], quizIndex: 0, quizCorrect: 0, quizTotal: 0, currentWord: { italian: 'casa', english: 'house' } },
    stats: {}, mastered: new Set(),
    fieldMap: { source: 'italian', target: 'english' },
    difficulty: 'easy',
    saveFn: function () {}, onUpdateStats: function () {}, dom: {}
  });
  var easyOptions = easyEngine.generateOptions('house', simPool);
  assertEqual(easyOptions.length, 4, 'easy-mode generateOptions returns 4 options');
  assert(easyOptions.indexOf('house') !== -1, 'easy-mode options include the correct answer');

  // ===== quiz-engine: difficulty static accessor defaults to hard =====
  assertEqual(typeof QuizEngine.getDifficulty, 'function', 'QuizEngine.getDifficulty exists');
  assertEqual(QuizEngine.getDifficulty(), 'hard', 'difficulty defaults to hard when unset');
```

- [ ] **Step 2: Verify the new harness tests fail (Node smoke)**

Run a Node smoke that mirrors the harness's hard-mode path against the *current* engine (which ignores difficulty and has no static helpers):

```bash
node -e "
global.window={};
global.escapeHtml=function(s){return s;}; global.escapeAttribute=function(s){return s;};
require('./lib/utils.js'); require('./lib/word-similarity.js'); require('./lib/quiz-engine.js');
const Q=window.QuizEngine;
console.assert(typeof Q.getDifficulty==='function','getDifficulty should exist');
console.log('smoke OK');
"
```

Expected: FAIL — assertion error `getDifficulty should exist` (the helper isn't implemented yet).

> Note: `lib/utils.js` assigns `window.escapeHtml` etc.; the pre-set globals above are harmless fallbacks so `require` never throws under Node.

- [ ] **Step 3: Modify `generateOptions` to honor difficulty**

In `lib/quiz-engine.js`, replace the entire `generateOptions` method (lines 34-54) with:

```javascript
  /**
   * 为选择题生成 4 个选项（1 个正确 + 3 个干扰项）
   * config.difficulty === 'hard' 时使用拼写相近的干扰项，否则随机
   */
  QuizEngine.prototype.generateOptions = function (correctAnswer, wordPool) {
    var options = [correctAnswer];
    var targetField = this.config.fieldMap.target;
    var sourceField = this.config.fieldMap.source;
    var currentWord = this.config.state.currentWord;
    var difficulty = this.config.difficulty || 'easy';

    if (difficulty === 'hard' && window.WordSimilarity && currentWord) {
      var distractors = window.WordSimilarity.pickConfusableDistractors(currentWord, wordPool, {
        count: 3,
        sourceField: sourceField,
        targetField: targetField,
        correctTarget: correctAnswer
      });
      for (var d = 0; d < distractors.length; d++) {
        options.push(distractors[d][targetField]);
      }
      return this.shuffleArray(options);
    }

    // easy / 回退：随机
    var otherWords = wordPool.filter(function (w) {
      return w[sourceField] !== currentWord[sourceField] &&
             w[targetField] !== correctAnswer;
    });
    var shuffled = this.shuffleArray(otherWords);
    for (var i = 0; i < 3 && i < shuffled.length; i++) {
      options.push(shuffled[i][targetField]);
    }
    return this.shuffleArray(options);
  };
```

- [ ] **Step 4: Add the difficulty static accessors**

In `lib/quiz-engine.js`, find the closing line `  window.QuizEngine = QuizEngine;` (line 122) and insert this block immediately **before** it:

```javascript
  // ===== 难度偏好（localStorage 持久化，默认困难） =====
  QuizEngine.DIFFICULTY_KEY = 'dimenticato_quiz_difficulty';

  QuizEngine.getDifficulty = function () {
    try {
      var v = (typeof window !== 'undefined' && window.localStorage)
        ? localStorage.getItem(QuizEngine.DIFFICULTY_KEY) : null;
      return v === 'easy' ? 'easy' : 'hard';
    } catch (e) {
      return 'hard';
    }
  };

  QuizEngine.setDifficulty = function (value) {
    var v = value === 'easy' ? 'easy' : 'hard';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(QuizEngine.DIFFICULTY_KEY, v);
      }
    } catch (e) {}
    return v;
  };

```

- [ ] **Step 5: Verify the Node smoke now passes**

```bash
node -e "
global.window={};
global.escapeHtml=function(s){return s;}; global.escapeAttribute=function(s){return s;};
require('./lib/utils.js'); require('./lib/word-similarity.js'); require('./lib/quiz-engine.js');
const Q=window.QuizEngine;
console.assert(typeof Q.getDifficulty==='function','getDifficulty should exist');
console.assert(Q.getDifficulty()==='hard','default should be hard');
const prompt={italian:'casa',english:'house',rank:50};
const pool=[prompt,{italian:'cosa',english:'thing',rank:60},{italian:'caso',english:'case',rank:70},{italian:'cassa',english:'crate',rank:80},{italian:'montagna',english:'mountain',rank:95}];
const eng=new Q({state:{currentWord:prompt},fieldMap:{source:'italian',target:'english'},difficulty:'hard',dom:{}});
const opts=eng.generateOptions('house',pool);
console.assert(opts.length===4,'hard mode returns 4 options, got '+opts.length);
console.assert(opts.includes('house'),'options include correct answer');
console.assert(new Set(opts).size===4,'options are distinct');
console.log('quiz-engine difficulty smoke OK');
"
```

Expected: PASS — prints `quiz-engine difficulty smoke OK`.

- [ ] **Step 6: Verify the full browser harness is green**

Open `tests/test-quiz-engine.html` in a browser (or `python3 -m http.server 8080` then visit `http://localhost:8080/tests/test-quiz-engine.html`). 

Expected: the summary line reads `N passed, 0 failed` (all original 19 cases plus the new similarity/difficulty cases).

- [ ] **Step 7: Commit**

```bash
git add lib/quiz-engine.js tests/test-quiz-engine.html
git commit -m "feat: quiz-engine honors difficulty for confusable distractors

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Pass difficulty through each app's engine config

**Files:**
- Modify: `app.js` (Italian MC engine config, line 941)
- Modify: `german-app.js` (German MC engine config line 48; English MC engine config line 896)

- [ ] **Step 1: Add `difficulty` getter to the Italian engine config**

In `app.js`, find this line inside `MultipleChoice._getEngine()` (line 941):

```javascript
        fieldMap: { source: 'italian', target: 'english' },
```

Replace it with:

```javascript
        fieldMap: { source: 'italian', target: 'english' },
        get difficulty() { return QuizEngine.getDifficulty(); },
```

- [ ] **Step 2: Add `difficulty` getter to the German engine config**

In `german-app.js`, find this line inside `GermanApp._getMcEngine()` (line 48):

```javascript
          fieldMap: { source: 'german', target: 'meaning' },
```

Replace it with:

```javascript
          fieldMap: { source: 'german', target: 'meaning' },
          get difficulty() { return QuizEngine.getDifficulty(); },
```

- [ ] **Step 3: Add `difficulty` getter to the English engine config**

In `german-app.js`, find this line inside `EnglishApp._getMcEngine()` (line 896):

```javascript
          fieldMap: { source: 'english', target: 'meaning' },
```

Replace it with:

```javascript
          fieldMap: { source: 'english', target: 'meaning' },
          get difficulty() { return QuizEngine.getDifficulty(); },
```

- [ ] **Step 4: Verify no syntax errors**

```bash
node --check app.js && node --check german-app.js && echo "syntax OK"
```

Expected: PASS — prints `syntax OK`.

- [ ] **Step 5: Commit**

```bash
git add app.js german-app.js
git commit -m "feat: wire quiz difficulty into all language engine configs

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Settings UI markup + styles

**Files:**
- Modify: `index.html` (script load at line 2023; settings markup after line 1083)
- Modify: `styles.css` (append after the `.settings-grid` rule at line 370)

- [ ] **Step 1: Load the similarity module in the app**

In `index.html`, find (line 2023-2024):

```html
  <script src="lib/utils.js"></script>
  <script src="lib/quiz-engine.js"></script>
```

Replace with:

```html
  <script src="lib/utils.js"></script>
  <script src="lib/word-similarity.js"></script>
  <script src="lib/quiz-engine.js"></script>
```

- [ ] **Step 2: Add the Learning-preferences settings group**

In `index.html`, find the end of the settings grid (lines 1082-1084):

```html
          </div>
        </div>
      </section>
```

(This is the `</div>` closing `.module-grid.settings-grid`, then `</div>` closing `.module-view-card`, then `</section>` closing `#settingsScreen`.)

Replace it with:

```html
          </div>

          <div class="settings-section" id="learningPrefsSection">
            <h3 class="settings-section-title">
              <svg class="icon"><use href="#icon-settings"></use></svg>
              学习偏好 / Learning preferences
            </h3>
            <div class="difficulty-setting">
              <p class="difficulty-label">选择题难度</p>
              <div class="difficulty-toggle" id="difficultyToggle" role="group" aria-label="选择题难度">
                <button type="button" class="difficulty-option" data-difficulty="easy">
                  <span class="difficulty-name">简单</span>
                  <span class="difficulty-hint">随机干扰项</span>
                </button>
                <button type="button" class="difficulty-option" data-difficulty="hard">
                  <span class="difficulty-name">困难</span>
                  <span class="difficulty-hint">相似干扰项</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
```

- [ ] **Step 3: Add the styles**

In `styles.css`, find the `.settings-grid` rule (lines 368-370):

```css
.settings-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
```

Insert immediately **after** it:

```css
.settings-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.settings-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.difficulty-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
}

.difficulty-toggle {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.difficulty-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s;
  min-width: 140px;
}

.difficulty-option:hover {
  border-color: var(--accent-primary);
}

.difficulty-option.active {
  border-color: var(--accent-primary);
  background-color: var(--accent-primary);
  color: #fff;
}

.difficulty-name {
  font-size: 1rem;
  font-weight: 600;
}

.difficulty-hint {
  font-size: 0.8rem;
  opacity: 0.8;
}
```

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add Learning-preferences difficulty toggle to Settings UI

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Wire the difficulty toggle behavior in `app.js`

**Files:**
- Modify: `app.js` (settings button bindings region, around lines 2022-2027)

- [ ] **Step 1: Add the toggle init function and call it**

In `app.js`, find the settings button bindings block (lines 2022-2027):

```javascript
  document.getElementById('settingsExportBtn')?.addEventListener('click', () => Storage.exportAllData());
  document.getElementById('settingsImportBtn')?.addEventListener('click', () => document.getElementById('importDataFileInput').click());
  document.getElementById('settingsThemeBtn')?.addEventListener('click', () => Storage.toggleTheme());
  document.getElementById('settingsHelpBtn')?.addEventListener('click', () => document.getElementById('helpModal').classList.remove('hidden'));
```

Insert immediately **after** the `settingsHelpBtn` line (and before the `settingsResetBtn` binding on line 2027):

```javascript
  initDifficultyToggle();
```

- [ ] **Step 2: Define `initDifficultyToggle`**

In `app.js`, still inside the same DOM-ready function and near the other settings bindings, add this function definition. Place it immediately above the `document.getElementById('settingsExportBtn')` line (line 2022):

```javascript
  function initDifficultyToggle() {
    const toggle = document.getElementById('difficultyToggle');
    if (!toggle) return;
    const buttons = toggle.querySelectorAll('.difficulty-option');
    const apply = (value) => {
      buttons.forEach((b) => b.classList.toggle('active', b.dataset.difficulty === value));
    };
    apply(QuizEngine.getDifficulty());
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        apply(QuizEngine.setDifficulty(btn.dataset.difficulty));
      });
    });
  }

```

- [ ] **Step 3: Verify no syntax errors**

```bash
node --check app.js && echo "syntax OK"
```

Expected: PASS — prints `syntax OK`.

- [ ] **Step 4: Manual verification in the browser**

Run `python3 -m http.server 8080`, open `http://localhost:8080`, then:
1. Open **Settings & Data** → confirm the "学习偏好 / Learning preferences" section shows two buttons with **困难** highlighted (default).
2. Click **简单** → it becomes highlighted; reload the page → **简单** stays highlighted (persisted).
3. Switch back to **困难**, start an Italian multiple-choice quiz → confirm the 3 wrong options visibly resemble the prompt word (similar spelling) rather than being random.
4. Switch to **简单**, start a new quiz → options are random again.
5. Repeat the quiz check for German and English vocabulary.

Expected: all five behaviors hold; no console errors.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: difficulty toggle reads/writes preference and updates UI

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Documentation + final verification

**Files:**
- Modify: `CODE_SPACE.md` (lib module map + change log — match the existing format in that file)

- [ ] **Step 1: Update `CODE_SPACE.md`**

Open `CODE_SPACE.md`, locate the section that lists the `lib/` modules (the module map describing `lib/utils.js` and `lib/quiz-engine.js`). Add an entry for the new module, matching the surrounding row/bullet style, e.g.:

> `lib/word-similarity.js` — 纯函数词形相似度模块（Levenshtein 编辑距离 + 困难模式干扰项挑选）。在 `lib/quiz-engine.js` 之前加载，无 DOM / 无 localStorage。

Then locate the change-log / 变更记录 section and add a dated bullet matching the existing style, e.g.:

> 2026-06-26 — 新增"选择题难度"设置（简单=随机干扰项 / 困难=拼写相近干扰项，默认困难），新增 `lib/word-similarity.js`，`QuizEngine.generateOptions` 按 `config.difficulty` 分支。Italian/German/English 共用同一逻辑。

If `CODE_SPACE.md` has no such sections, add a short "Confusable distractors" subsection describing the same, placed near the other `lib/` documentation.

- [ ] **Step 2: Final full-suite verification**

Run the Node smokes one more time end-to-end:

```bash
node --check app.js && node --check german-app.js && \
node -e "global.window={}; require('./lib/word-similarity.js'); const W=window.window?window.window.WordSimilarity:window.WordSimilarity; const S=window.WordSimilarity; console.assert(S.editDistance('casa','cosa')===1); console.log('similarity OK');" && \
echo "all checks passed"
```

Then re-open `tests/test-quiz-engine.html` in the browser and confirm `0 failed`.

Expected: `all checks passed` and a green test summary.

- [ ] **Step 3: Commit**

```bash
git add CODE_SPACE.md
git commit -m "docs: document confusable-distractors difficulty setting

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** confusable distractors for MC across 3 languages (Tasks 1-3); difficulty setting persisted in localStorage, default 困难 (Task 2 helpers); isolated unit-tested similarity module (Task 1 + Task 2 harness); Settings "学习偏好" group (Tasks 4-5); 简单 reproduces random (Task 2 easy path + test); always 4 distinct options incl. tiny wordbooks & 1-2 char prompts (module fill + frequency-proximity branch + tests); no per-language duplication (single `generateOptions`); spelling/browse untouched (only `generateOptions` changed). All spec §6 edge cases are exercised by Task 1/2 tests.
- **Out of scope (per approved spec + user):** POS-aware distractors, precomputed confusion sets, reverse-direction quiz, and Phase 2 Chinese-answer toggle for Italian — none included.
- **Type/name consistency:** `config.difficulty` ('easy'|'hard'), `QuizEngine.getDifficulty`/`setDifficulty`/`DIFFICULTY_KEY`, `window.WordSimilarity.{editDistance,pickConfusableDistractors}`, opts `{count, sourceField, targetField, correctTarget, windowSize}`, and `data-difficulty`/`#difficultyToggle`/`.difficulty-option.active` are used identically across all tasks.
```
