/**
 * Cognate Practice Module —— 同源词练习（任何带 cognates 模块的语言共用）
 *
 * 四种练习模式：
 *   1. EnglishPromptMode  英语提示，拼写目标语言的词
 *   2. ContrastMode       对比显示，高亮拼写差异
 *   3. PatternGroupMode   按对应规律（后缀 / 音变）分组练习
 *   4. BrowseMode         浏览同源词表
 *
 * 本文件必须守住的约定：
 *
 * A. 数据集一律在【调用时】经 LangLoader.data(code, 'cognates') 取
 *    （data 文件注册在 DIM_DATA.cognates.<code>，形状是 cognates/1：
 *    {meta, entries}，见 docs/data-schema.md）。lib/lang-loader.js 按模块懒加载：
 *    首屏进德语时意大利语数据根本还没注入，模块顶层快照必然拿到空数组，
 *    之后数据补到了也读不回来 —— 所以解析必须推迟到每次调用。
 *
 * B. 本文件不认识任何一门具体语言：名字 / 中文名来自 Languages.get(code)，
 *    规律的标签与说明来自数据的 meta.patterns，哪门语言有同源词由
 *    Languages.hasModule(code, 'cognates') 决定（英语没有，深链接会被送回词汇页）。
 *
 * C. 进度按语言分 key 存（dimenticato_cognate_progress_<code>）。三门语言的
 *    「已掌握规律」是三套东西，共用一个 key 会互相覆盖。旧版的 key 用的是
 *    语言 key（_italian / _german / _french），更早的意大利语版本是不带后缀的
 *    裸 key，启动时一次性迁移过来。
 */

(function () {
  'use strict';

  var MODULE = 'cognates';
  var COGNATE_SCREEN_ID = 'cognatePracticeScreen';
  var PAGE_SIZE = 100;
  // 没有任何一门对得上的规律时，PatternGroupMode 把剩下的词收进这一组。
  // 'Other' 也是旧版存档里的写法，沿用它进度就不用迁移。
  var OTHER_GROUP = 'Other';
  var OTHER_EXPLANATION = '这一组没有归纳出统一的词形规律，按和英语的相似度收在一起。';
  // 数据里的 difficulty 是 1/2/3，界面上的三档标签与浏览筛选器一一对应。
  var DIFFICULTY_NAMES = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

  function profileOf(code) {
    return (window.Languages && window.Languages.get(code)) || null;
  }

  function supportsCognates(code) {
    return !!(window.Languages && window.Languages.hasModule(code, MODULE));
  }

  /** 第一门带同源词数据的语言（默认语言优先）—— 入口没带语言时的落点。 */
  function defaultCode() {
    var L = window.Languages;
    if (!L) return null;
    if (supportsCognates(L.DEFAULT)) return L.DEFAULT;
    for (var i = 0; i < L.codes.length; i++) if (supportsCognates(L.codes[i])) return L.codes[i];
    return null;
  }

  function docFor(code) {
    var data = (code && window.LangLoader) ? window.LangLoader.data(code, MODULE) : null;
    return data && Array.isArray(data.entries) ? data : null;
  }

  // === Cognate State ===
  const CognateState = {
    lang: null,          // 当前语言 code（'it' / 'de' / 'fr' …）
    words: [],           // 当前练习的 cognate 词表
    currentIndex: 0,     // 当前题目索引
    correctCount: 0,     // 正确计数
    totalCount: 0,       // 总答题数
    questionStartedAt: 0, // 当前题目出现的时刻（遥测用）
    currentMode: null,   // 当前练习模式
    currentPattern: null, // 当前练习的规律 key（PatternGroupMode）
    masteredPatterns: new Set(), // 已完成的规律组（存规律 key）
    browseLimit: PAGE_SIZE,      // BrowseMode 已展开的条数
    browseDifficulty: '',        // BrowseMode 难度筛选（'' 或 '1' / '2' / '3'）
    browseFalseFriendsOnly: false
  };

  function profile() {
    return profileOf(CognateState.lang) || { code: CognateState.lang, name: '', cn: '' };
  }

  function currentDoc() {
    return docFor(CognateState.lang);
  }

  function currentData() {
    var doc = currentDoc();
    return doc ? doc.entries : [];
  }

  function currentMeta() {
    var doc = currentDoc();
    return (doc && doc.meta) || {};
  }

  // === Storage ===
  const COGNATE_STORAGE_PREFIX = 'dimenticato_cognate_progress';

  function storageKey(code) {
    return COGNATE_STORAGE_PREFIX + '_' + code;
  }

  /** 把 from 的内容搬到 to（to 已有内容就只删 from）；写失败就原样留着，下次启动重试。 */
  function moveKey(from, to) {
    var legacy = localStorage.getItem(from);
    if (legacy === null || from === to) return;
    if (localStorage.getItem(to) === null) {
      localStorage.setItem(to, legacy);
      if (localStorage.getItem(to) === null) return;
    }
    localStorage.removeItem(from);
  }

  function migrateLegacyProgress() {
    var L = window.Languages;
    if (!L) return;
    try {
      // 最早只有意大利语在写，用的是不带后缀的裸 key
      moveKey(COGNATE_STORAGE_PREFIX, storageKey(L.code(L.DEFAULT_KEY)));
      L.list.forEach(function (p) {
        if (supportsCognates(p.code)) moveKey(storageKey(p.key), storageKey(p.code));
      });
    } catch (e) {
      console.warn('迁移 cognate 进度失败:', e);
    }
  }

  function saveCognateProgress() {
    if (!CognateState.lang) return;
    try {
      localStorage.setItem(storageKey(CognateState.lang), JSON.stringify({
        mastered: [...CognateState.masteredPatterns]
      }));
    } catch (e) {
      console.error('保存 cognate 进度失败:', e);
    }
  }

  /**
   * 旧存档里的规律是旧版 patternType 原文（'假朋友 faux-ami' 这种），
   * cognates/1 换成了 key，meta.aliases 记着旧写法 → key。数据到了才能映射，
   * 所以 PatternGroupMode.start() 会再调一次。
   */
  function loadCognateProgress(code) {
    var target = supportsCognates(code) ? code : CognateState.lang;
    if (!target) return;
    try {
      const data = localStorage.getItem(storageKey(target));
      const parsed = data ? JSON.parse(data) : null;
      var aliases = (target === CognateState.lang && currentMeta().aliases) || {};
      CognateState.masteredPatterns = new Set(((parsed && parsed.mastered) || []).map(function (p) {
        return Object.prototype.hasOwnProperty.call(aliases, p) ? aliases[p] : p;
      }));
    } catch (e) {
      console.error('加载 cognate 进度失败:', e);
      CognateState.masteredPatterns = new Set();
    }
  }

  // === DOM Helper ===

  function getContainer() {
    var container = document.getElementById('cognatePracticeContainer');
    if (!container) {
      console.error('cognatePracticeContainer not found');
      return null;
    }
    return container;
  }

  function revealContainer() {
    var container = getContainer();
    if (container) container.classList.remove('hidden');
    return container;
  }

  /**
   * 顶栏底下那颗常驻返回丸的偏移量。.topbar 是 sticky 且不透明，压在它下面的东西
   * 等于点不到；而顶栏高度随断点变（窄屏比宽屏高一档），CSS 又没有「引用另一个元素
   * 的高度」这种能力，所以这里量一次写进自定义属性，样式表只管 position:sticky。
   */
  function syncStickyTop() {
    var bar = document.querySelector('.topbar');
    if (!bar) return;
    var h = bar.getBoundingClientRect().height;
    if (h > 0) document.documentElement.style.setProperty('--cognate-sticky-top', Math.round(h) + 'px');
  }

  /**
   * 「沉浸式」视图标记 —— 只在对比卡片 / 拼写题这两种「页面最底下就是主操作按钮」
   * 的视图上打开。窄屏逐条实测：这两种视图里 .mobile-floating-back 会和主按钮矩形
   * 相叠（几乎全是多一条假朋友提示条、卡片更高的词条；拼写题的「下一题 →」是通栏
   * 按钮，右半截几乎每题都被压住），其中一部分连按钮中心都被悬浮按钮吃掉，
   * 点下去触发 goBack() 直接退出练习。
   *
   * 打开时由 CSS 做两件事：把悬浮返回按钮隐掉，同时把屏内的 #cognateBackBtn 钉在
   * 顶栏正下方常驻。两件事必须一起做 —— 只隐悬浮按钮的话，卡片高过一屏的词条滚到
   * 够得着底部主按钮时，屏内返回链接已经滚进顶栏底下，整屏没有任何可达的返回控件。
   * 列表类视图（浏览 / 规律列表 / 模式选择）底部没有主操作按钮，不加这个类，
   * 悬浮按钮照常保留。
   *
   * 标记打在容器自身而不是 body 上：CSS 侧还要求同源词屏处于 active，
   * 所以哪怕跳转时这个类没被清掉，也不会漏到别的屏幕上。
   */
  function setImmersive(on) {
    var container = getContainer();
    if (container) container.classList.toggle('cognate-immersive', !!on);
    if (on) syncStickyTop();
  }

  // === 词条字段读取（cognates/1） ===

  /**
   * display 可能带冠词（德语 "die Macht"）。答案比对与差异高亮都用裸词形，
   * 冠词只作为前缀展示，所以这里把 display 拆成「前缀 + 词形」。
   */
  function displayPartsOf(word) {
    var head = (word && word.word) || '';
    var display = (word && word.display) || head;
    if (display !== head && head && display.slice(-head.length) === head) {
      return { prefix: display.slice(0, display.length - head.length), head: head };
    }
    return { prefix: '', head: head };
  }

  /** 假朋友提示：优先用数据里成句的 note，否则拼成「≠ lookalike（zh）= word」。 */
  function falseFriendNote(word) {
    var ff = word && word.falseFriend;
    if (!ff) return null;
    if (ff.note) return ff.note;
    if (ff.lookalike) {
      return '≠ ' + ff.lookalike + (ff.zh ? '（' + ff.zh + '）' : '') + (ff.word ? ' = ' + ff.word : '');
    }
    return '长得像英语词，意思并不一样';
  }

  function falseFriendStrip(word) {
    var note = falseFriendNote(word);
    if (!note) return '';
    return '<div class="tip-strip cognate-false-friend">' +
        '<span class="msr" aria-hidden="true">warning</span>' +
        '<span><b>假朋友</b> · ' + escapeHtml(note) + '</span>' +
      '</div>';
  }

  function similarityPercent(word) {
    return word && typeof word.similarity === 'number' ? Math.round(word.similarity * 100) : null;
  }

  function similarityLabel(word) {
    var score = similarityPercent(word);
    if (score === null) return '';
    // 假朋友的 similarity 比的是「本语言的词 vs 那个陷阱英语词」，不是它真正的
    // 英文释义 —— 照抄成「% 与英语相似」会是谎话：德语 also 的释义是
    // "so, therefore"，却挂着 100%，因为那 100% 说的是它和英语 also 长得一样。
    var basis = word.falseFriend && word.falseFriend.lookalike;
    if (basis) return score + '% 形似 “' + basis + '”';
    return score + '% 与英语相似';
  }

  function difficultyName(word) {
    return (word && DIFFICULTY_NAMES[word.difficulty]) || '';
  }

  /** 规律的展示名与说明都来自 meta.patterns；没有规律的词收进 Other 组。 */
  function patternLabel(key) {
    if (key === OTHER_GROUP) return OTHER_GROUP;
    var p = (currentMeta().patterns || {})[key];
    return (p && p.label) || key;
  }

  function patternExplanation(key) {
    if (key === OTHER_GROUP) return OTHER_EXPLANATION;
    var p = (currentMeta().patterns || {})[key];
    return (p && p.zh) || '这一组词共享同一条与英语的对应规律。';
  }

  function countFalseFriends(words) {
    var n = 0;
    for (var i = 0; i < words.length; i++) if (words[i] && words[i].falseFriend) n++;
    return n;
  }

  // === Utility Functions ===

  /**
   * 高亮差异部分
   * 返回两个单词的 HTML，差异部分用 <span class="cognate-diff"> 标记
   */
  function highlightDiff(source, english) {
    source = source || '';
    english = english || '';
    const src = source.toLowerCase();
    const en = english.toLowerCase();

    // 找到公共前缀和后缀
    let prefixLen = 0;
    while (prefixLen < src.length && prefixLen < en.length && src[prefixLen] === en[prefixLen]) {
      prefixLen++;
    }

    let suffixLen = 0;
    while (suffixLen < src.length - prefixLen && suffixLen < en.length - prefixLen) {
      if (src[src.length - 1 - suffixLen] === en[en.length - 1 - suffixLen]) {
        suffixLen++;
      } else {
        break;
      }
    }

    const commonPrefix = source.slice(0, prefixLen);
    const srcDiff = source.slice(prefixLen, source.length - suffixLen);
    const enDiff = english.slice(prefixLen, english.length - suffixLen);
    const commonSuffix = source.slice(source.length - suffixLen);

    return {
      sourceHtml: escapeHtml(commonPrefix) +
                   (srcDiff ? '<span class="cognate-diff">' + escapeHtml(srcDiff) + '</span>' : '') +
                   escapeHtml(commonSuffix),
      englishHtml: escapeHtml(commonPrefix) +
                   (enDiff ? '<span class="cognate-diff">' + escapeHtml(enDiff) + '</span>' : '') +
                   escapeHtml(english.slice(english.length - suffixLen))
    };
  }

  /** 词条 -> {sourceHtml, englishHtml}，source 侧带上 display 前缀（冠词） */
  function diffOf(word) {
    var parts = displayPartsOf(word);
    var diff = highlightDiff(parts.head, word ? word.en : '');
    if (parts.prefix) {
      diff.sourceHtml = escapeHtml(parts.prefix) + diff.sourceHtml;
    }
    return diff;
  }

  /**
   * 答案比对用的宽松 key：DimText 的去重音 / 小写 / 压空白，再把 ß 写成 ss。
   *
   * ß↔ss 在德语正字法里本来就是同一个字的两种书写变体（瑞士德语一律写 ss），
   * 而学习者用美式键盘根本打不出 ß —— 不折叠的话 "die Strasse" 会被判错。
   * 这一步对所有语言都做：别的语言里没有 ß，折叠是恒等变换，用不着按语言分支。
   */
  function normalizeAnswer(str) {
    return window.DimText.normalizeText(str, { fold: true }).replace(/ß/g, 'ss');
  }

  /**
   * 答案比对：带冠词的完整写法与裸词形两种都算对。
   *
   * 德语数据里大半条目的 display 带定冠词（"die Session"），而答错 / 跳过时反馈区
   * 照 display 印「正确答案」。只比裸词形的话，把 app 自己印出来的答案原样抄回去
   * 照样判错；反过来带冠词的名词只写裸词也不该判错 —— 数据里并没有
   * 「必须写冠词」这条要求，判错等于系统性训练用户不写冠词。
   *
   * 「带冠词那一串」取的是 displayPartsOf() 拼回来的 prefix + head，不是 word.display
   * 本身：反馈区印的就是这两段拼出来的东西（见 diffOf()），拿渲染用的同一个函数做
   * 比对，「界面印什么就接受什么」才是结构性成立的。
   *
   * 只放行这两种写法本身：两边都是全等比对，不做前缀 / 包含式的宽松匹配，
   * 「答案里多打了别的东西」照旧算错。没有 display 的条目这里是恒等变换。
   */
  function isAnswerCorrect(word, userAnswer) {
    var typed = normalizeAnswer(userAnswer);
    if (!typed) return false;
    var parts = displayPartsOf(word);
    var head = normalizeAnswer(parts.head);
    if (head && typed === head) return true;
    var printed = normalizeAnswer(parts.prefix + parts.head);
    return !!printed && typed === printed;
  }

  /** 拼写题答完一题记一次活动；StatsManager 认哪种语言标识就给哪种。 */
  function recordAnswer(isCorrect) {
    var SM = window.StatsManager;
    if (!SM || typeof SM.recordActivity !== 'function') return;
    try {
      var code = CognateState.lang;
      var langs = SM.LANGS || [];
      var id = langs.indexOf(code) !== -1 ? code : window.Languages.key(code);
      var started = CognateState.questionStartedAt;
      SM.recordActivity(id, {
        correct: isCorrect ? 1 : 0,
        total: 1,
        durationMs: started ? Date.now() - started : 0
      });
    } catch (e) {
      // 埋点绝不能影响练习本身
      console.error('记录同源词练习失败:', e);
    }
  }

  // lib/utils.js 没有数字格式化；app.js / typing-game-app.js 各有一份同样的一行。
  function fmt(n) {
    return Number(n || 0).toLocaleString('en-US');
  }

  /** 每块界面统一的抬头：语言 + 数据规模，切语言后一眼能看出没串数据。 */
  function datasetHeader(subtitle) {
    var data = currentData();
    var ff = countFalseFriends(data);
    return '<div class="panel cognate-dataset-head">' +
        '<div class="panel-title">同源词 · ' + escapeHtml(profile().name) + '</div>' +
        '<div class="card-desc">共 <b data-cognate-total>' + fmt(data.length) + '</b> 条' +
          (ff ? ' · 其中 <b>' + fmt(ff) + '</b> 条假朋友' : '') +
          (subtitle ? ' · ' + escapeHtml(subtitle) : '') +
        '</div>' +
      '</div>';
  }

  // === Mode 1: English Prompt Mode ===

  const EnglishPromptMode = {
    start(words) {
      CognateState.words = window.shuffleArray(words);
      CognateState.currentIndex = 0;
      CognateState.correctCount = 0;
      CognateState.totalCount = 0;
      CognateState.currentMode = 'englishPrompt';

      this.showQuestion();
    },

    showQuestion() {
      var word = CognateState.words[CognateState.currentIndex];
      var container = getContainer();
      if (!container) return;
      setImmersive(true);
      CognateState.questionStartedAt = Date.now();

      container.innerHTML =
        '<div class="quiz-card">' +
          '<div class="quiz-header practice-head">' +
            '<span class="quiz-progress idx">' + (CognateState.currentIndex + 1) + ' / ' + CognateState.words.length + '</span>' +
            '<span class="quiz-accuracy acc">正确率 <b>' + this.getAccuracy() + '%</b></span>' +
          '</div>' +
          '<div class="quiz-content">' +
            '<div class="quiz-prompt">' +
              '<div class="prompt-english">English: <strong>' + escapeHtml(word.en) + '</strong></div>' +
              '<div class="prompt-chinese">' + escapeHtml(word.zh) + '</div>' +
            '</div>' +
            '<input type="text" class="spelling-input" id="cognateInput" placeholder="' +
              escapeAttribute('拼写' + profile().cn + '单词…') + '" autocomplete="off" lang="' +
              escapeAttribute(CognateState.lang) + '">' +
          '</div>' +
          '<div class="quiz-actions browse-controls">' +
            '<button class="pill-btn" id="cognateCheckBtn">Check</button>' +
            '<button class="pill-btn" id="cognateSkipBtn">Skip</button>' +
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

    answerBlock(word, lead) {
      var diff = diffOf(word);
      return '<span class="feedback-text">' + lead + '</span>' +
        '<div class="answer-comparison">' +
          '<div><strong>' + escapeHtml(profile().name) + ':</strong> ' + diff.sourceHtml + '</div>' +
          '<div><strong>English:</strong> ' + diff.englishHtml + '</div>' +
        '</div>' +
        falseFriendStrip(word) +
        '<button class="primary-btn next-btn" id="cognateNextBtn">下一题 →</button>';
    },

    lockInputs() {
      var input = document.getElementById('cognateInput');
      if (input) input.disabled = true;
      var check = document.getElementById('cognateCheckBtn');
      if (check) check.disabled = true;
      var skip = document.getElementById('cognateSkipBtn');
      if (skip) skip.disabled = true;
      document.getElementById('cognateNextBtn').addEventListener('click', function() { EnglishPromptMode.nextQuestion(); });
    },

    checkAnswer(word) {
      var input = document.getElementById('cognateInput');
      var feedback = document.getElementById('cognateFeedback');
      var accuracyEl = document.querySelector('.quiz-accuracy');
      // 已经判过（答错后输入框锁住，或答对后等自动跳题时又按了回车）就不再计一次
      if (!input || input.disabled || input.dataset.answered) return;
      input.dataset.answered = '1';
      var userAnswer = input.value.trim();

      CognateState.totalCount++;

      var isCorrect = isAnswerCorrect(word, userAnswer);
      if (isCorrect) CognateState.correctCount++;
      recordAnswer(isCorrect);

      if (isCorrect) {
        feedback.innerHTML = '<span class="feedback-text">✓ 正确！</span>' + falseFriendStrip(word);
        feedback.classList.remove('incorrect');
        feedback.classList.add('correct');
        feedback.classList.remove('hidden');
        if (accuracyEl) accuracyEl.innerHTML = '正确率 <b>' + this.getAccuracy() + '%</b>';
        setTimeout(function() { EnglishPromptMode.nextQuestion(); }, 1200);
      } else {
        feedback.innerHTML = this.answerBlock(word, '✗ 错误，正确答案：');
        feedback.classList.remove('correct');
        feedback.classList.add('incorrect');
        feedback.classList.remove('hidden');
        if (accuracyEl) accuracyEl.innerHTML = '正确率 <b>' + this.getAccuracy() + '%</b>';
        this.lockInputs();
      }
    },

    skip(word) {
      var feedback = document.getElementById('cognateFeedback');
      feedback.innerHTML = this.answerBlock(word, '跳过，正确答案：');
      feedback.classList.remove('hidden');
      this.lockInputs();
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
      setImmersive(false);
      var accuracy = this.getAccuracy();
      // 走完一整组规律 == 掌握了这条规律。
      var pattern = CognateState.currentPattern;
      if (pattern) PatternGroupMode.markPatternComplete(pattern);

      container.innerHTML =
        datasetHeader(pattern ? '规律：' + patternLabel(pattern) : '') +
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
          '<div class="quiz-actions browse-controls">' +
            '<button class="pill-btn" id="cognateRetryBtn">再练一次</button>' +
            '<button class="pill-btn" id="cognateBackToModesBtn">返回模式选择</button>' +
          '</div>' +
        '</div>';

      var words = CognateState.words.slice();
      document.getElementById('cognateRetryBtn').addEventListener('click', function () {
        EnglishPromptMode.start(words);
      });
      document.getElementById('cognateBackToModesBtn').addEventListener('click', function () {
        CognateState.currentPattern = null;
        CognateApp.showModeSelection();
      });
    }
  };

  // === Mode 2: Contrast Mode ===

  const ContrastMode = {
    start(words, filter) {
      var filteredWords = words;
      if (filter) {
        if (filter.difficulty) {
          filteredWords = words.filter(function(w) { return String(w.difficulty) === String(filter.difficulty); });
        } else if (filter.pattern) {
          filteredWords = words.filter(function(w) { return w.pattern === filter.pattern; });
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
      if (!word) return this.showComplete();
      setImmersive(true);
      var diff = diffOf(word);
      var total = CognateState.words.length;
      var pct = total ? Math.round(((CognateState.currentIndex + 1) / total) * 100) : 0;
      var sim = similarityLabel(word);
      var level = difficultyName(word);

      container.innerHTML =
        datasetHeader('对比模式') +
        '<div class="practice-head">' +
          '<span class="idx">' + (CognateState.currentIndex + 1) + ' / ' + total + '</span>' +
          '<span class="acc">' + escapeHtml(profile().name) + ' ↔ English</span>' +
        '</div>' +
        '<div class="session-bar"><div class="session-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="contrast-card practice-card">' +
          '<div class="contrast-row word">' + diff.sourceHtml + '</div>' +
          '<div class="contrast-row chinese-hint"><span class="lang-label">English</span> · ' + diff.englishHtml + '</div>' +
          '<div class="contrast-chinese chinese-hint">' + escapeHtml(word.zh) + '</div>' +
          '<div class="contrast-meta chips wrap">' +
            (word.pattern ? '<span class="chip pattern-tag">' + escapeHtml(patternLabel(word.pattern)) + '</span>' : '') +
            (sim ? '<span class="chip similarity-tag">' + escapeHtml(sim) + '</span>' : '') +
            (level ? '<span class="chip">' + escapeHtml(level) + '</span>' : '') +
          '</div>' +
          falseFriendStrip(word) +
        '</div>' +
        '<div class="contrast-nav practice-head" style="margin-top:18px">' +
          '<button class="pill-btn" id="cognateContrastPrev" ' + (CognateState.currentIndex === 0 ? 'disabled' : '') + '>← 上一个</button>' +
          '<span class="nav-position card-desc">' + (CognateState.currentIndex + 1) + ' / ' + total + '</span>' +
          '<button class="pill-btn" id="cognateContrastNext">下一个 →</button>' +
        '</div>';

      document.getElementById('cognateContrastPrev').addEventListener('click', function() { ContrastMode.prevWord(); });
      document.getElementById('cognateContrastNext').addEventListener('click', function() { ContrastMode.nextWord(); });
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
      setImmersive(false);
      container.innerHTML =
        datasetHeader('对比模式') +
        '<div class="cognate-complete practice-card">' +
          '<h2>浏览完成！</h2>' +
          '<p class="card-desc">已经看完全部 ' + fmt(CognateState.words.length) + ' 条同源词。</p>' +
          '<div class="browse-controls">' +
            '<button class="pill-btn" id="cognateContrastRestartBtn">再看一遍</button>' +
            '<button class="pill-btn" id="cognateContrastModesBtn">返回模式选择</button>' +
          '</div>' +
        '</div>';
      document.getElementById('cognateContrastRestartBtn').addEventListener('click', function () { CognateApp.startContrastMode(); });
      document.getElementById('cognateContrastModesBtn').addEventListener('click', function () { CognateApp.showModeSelection(); });
    }
  };

  // === Mode 3: Pattern Group Mode ===

  const PatternGroupMode = {
    /** 规律 key -> 词条；没有规律的词收进 Other。 */
    getPatternGroups(words) {
      var groups = {};
      words.forEach(function(w) {
        if (w.pattern) {
          groups[w.pattern] = groups[w.pattern] || [];
          groups[w.pattern].push(w);
        }
      });
      var otherWords = words.filter(function(w) { return !w.pattern; });
      if (otherWords.length > 0) {
        groups[OTHER_GROUP] = otherWords;
      }
      return groups;
    },

    start(words) {
      CognateState.words = words;
      CognateState.currentMode = 'patternGroup';
      CognateState.currentPattern = null;
      loadCognateProgress(CognateState.lang);

      this.showPatternSelection();
    },

    showPatternSelection() {
      var groups = this.getPatternGroups(CognateState.words);
      var container = getContainer();
      if (!container) return;
      setImmersive(false);

      var entries = Object.entries(groups).sort(function(a, b) { return b[1].length - a[1].length; });
      var groupCards = entries
        .map(function(entry) {
          var pattern = entry[0];
          var words = entry[1];
          var mastered = CognateState.masteredPatterns.has(pattern);
          var ff = countFalseFriends(words);
          return '<button class="card pattern-card ' + (mastered ? 'mastered' : '') + '" data-pattern="' + escapeAttribute(pattern) + '">' +
              '<span class="card-title pattern-name">' + escapeHtml(patternLabel(pattern)) + '</span>' +
              '<span class="card-desc pattern-count">' + fmt(words.length) + ' 词' +
                (ff ? ' · ' + fmt(ff) + ' 条假朋友' : '') + '</span>' +
              (mastered ? '<span class="chip active mastered-badge">已完成</span>' : '') +
            '</button>';
        }).join('');

      container.innerHTML =
        datasetHeader('共 ' + fmt(entries.length) + ' 组对应规律') +
        '<div class="pattern-selection">' +
          '<h2>按规律学</h2>' +
          '<p class="subtitle">' + escapeHtml(profile().name) + ' 与英语之间的词形对应规律，一组一组吃透。</p>' +
          '<div class="pattern-grid card-grid cols-3">' + groupCards + '</div>' +
        '</div>';

      container.querySelectorAll('.pattern-card').forEach(function(card) {
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

      setImmersive(false);
      var label = patternLabel(pattern);
      var examples = words.slice(0, 5);
      var exampleHtml = examples.map(function(w) {
        var diff = diffOf(w);
        var pct = similarityPercent(w);
        return '<div class="example-row word-line">' +
            '<span class="wl-word">' + diff.sourceHtml + '</span>' +
            '<span class="wl-gloss">' + diff.englishHtml + '</span>' +
            '<span class="wl-cn">' + escapeHtml(w.zh) + '</span>' +
            '<span class="wl-status">' + escapeHtml(w.falseFriend ? '假朋友' : '') + '</span>' +
            '<span class="wl-status">' + (pct === null ? '' : pct + '%') + '</span>' +
          '</div>';
      }).join('');

      container.innerHTML =
        datasetHeader('规律：' + label) +
        '<div class="pattern-intro">' +
          '<h2>Pattern: ' + escapeHtml(label) + '</h2>' +
          '<div class="pattern-explanation panel">' +
            '<div class="panel-title">对应关系</div>' +
            '<p class="card-desc">' + escapeHtml(patternExplanation(pattern)) + '</p>' +
          '</div>' +
          '<div class="pattern-examples word-card" style="margin-top:18px">' + exampleHtml + '</div>' +
          '<div class="browse-controls">' +
            '<button class="pill-btn" id="cognateStartPattern">开始练习（' + fmt(words.length) + ' 词）</button>' +
            '<button class="pill-btn" id="cognateBackToPatterns">返回规律列表</button>' +
          '</div>' +
        '</div>';

      document.getElementById('cognateStartPattern').addEventListener('click', function() {
        EnglishPromptMode.start(words);
      });
      document.getElementById('cognateBackToPatterns').addEventListener('click', function() {
        CognateState.currentPattern = null;
        CognateApp.startPatternGroupMode();
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
      // slice() 之后再排序：直接 sort(words) 会就地重排数据集本身，
      // 把 data/*.js 里的顺序永久打乱。
      CognateState.words = words.slice().sort(function(a, b) { return (a.rank || 0) - (b.rank || 0); });
      CognateState.currentMode = 'browse';
      CognateState.browseLimit = PAGE_SIZE;
      CognateState.browseDifficulty = '';
      CognateState.browseFalseFriendsOnly = false;
      this.showList();
    },

    visibleWords() {
      return CognateState.words.filter(function (w) {
        if (CognateState.browseDifficulty && String(w.difficulty) !== CognateState.browseDifficulty) return false;
        if (CognateState.browseFalseFriendsOnly && !w.falseFriend) return false;
        return true;
      });
    },

    showList() {
      var container = getContainer();
      if (!container) return;

      setImmersive(false);
      var matched = this.visibleWords();
      var shown = matched.slice(0, CognateState.browseLimit);
      var hasFalseFriends = countFalseFriends(CognateState.words) > 0;

      // difficulty 是 similarity 的分档（docs/data-schema.md 的 cognates/1），
      // 三档的阈值就是这里明文写出来的百分比。
      var filterOptions =
        '<div class="browse-filter browse-controls">' +
          '<select class="filter-select" id="cognateDifficultyFilter">' +
            '<option value="">全部难度</option>' +
            '<option value="1">Easy（≥80%）</option>' +
            '<option value="2">Medium（50-79%）</option>' +
            '<option value="3">Hard（&lt;50%）</option>' +
          '</select>' +
          (hasFalseFriends
            ? '<button type="button" class="chip' + (CognateState.browseFalseFriendsOnly ? ' active' : '') + '" id="cognateFalseFriendFilter" aria-pressed="' + (CognateState.browseFalseFriendsOnly ? 'true' : 'false') + '">只看假朋友</button>'
            : '') +
          '<span class="card-desc">' + fmt(matched.length) + ' 条匹配，已显示 ' + fmt(shown.length) + ' 条</span>' +
        '</div>';

      var wordList = shown.map(function(w) {
        var diff = diffOf(w);
        var pct = similarityPercent(w);
        return '<div class="browse-item word-line" data-difficulty="' + escapeAttribute(w.difficulty) + '">' +
            '<span class="browse-source wl-word">' + diff.sourceHtml + '</span>' +
            '<span class="browse-english wl-gloss">' + diff.englishHtml + '</span>' +
            '<span class="browse-chinese wl-cn">' + escapeHtml(w.zh) + '</span>' +
            '<span class="wl-status">' + (w.falseFriend ? '<span class="chip">假朋友</span>' : '') + '</span>' +
            '<span class="browse-score wl-status">' + (pct === null ? '' : pct + '%') + '</span>' +
          '</div>';
      }).join('');

      container.innerHTML =
        datasetHeader('浏览模式') +
        '<div class="cognate-browse">' +
          '<h2>同源词表</h2>' +
          filterOptions +
          '<div class="browse-list word-card">' + wordList + '</div>' +
          (shown.length < matched.length
            ? '<div class="browse-more browse-controls">' +
                '<button class="pill-btn" id="cognateLoadMore">再加载 ' + fmt(Math.min(PAGE_SIZE, matched.length - shown.length)) + ' 条</button>' +
              '</div>'
            : '') +
        '</div>';

      var select = document.getElementById('cognateDifficultyFilter');
      select.value = CognateState.browseDifficulty;
      select.addEventListener('change', function(e) {
        BrowseMode.filterByDifficulty(e.target.value);
      });

      var ffBtn = document.getElementById('cognateFalseFriendFilter');
      if (ffBtn) {
        ffBtn.addEventListener('click', function () {
          CognateState.browseFalseFriendsOnly = !CognateState.browseFalseFriendsOnly;
          CognateState.browseLimit = PAGE_SIZE;
          BrowseMode.showList();
        });
      }

      var more = document.getElementById('cognateLoadMore');
      if (more) {
        more.addEventListener('click', function () {
          CognateState.browseLimit += PAGE_SIZE;
          BrowseMode.showList();
        });
      }
    },

    filterByDifficulty(difficulty) {
      // 按数据重新渲染（只把 DOM 节点 display:none 的话，筛选只在已渲染的前 100 条里生效）
      CognateState.browseDifficulty = difficulty ? String(difficulty) : '';
      CognateState.browseLimit = PAGE_SIZE;
      this.showList();
    }
  };

  // === Cognate App Controller ===

  function checkDataAndRender(container) {
    if (currentData().length === 0) {
      setImmersive(false);
      container.innerHTML = '<div class="error-message">' + escapeHtml(profile().cn) +
        '同源词数据尚未加载完成，请稍候或刷新页面。</div>';
      return false;
    }
    return true;
  }

  const CognateApp = {
    init() {
      if (!CognateState.lang) CognateState.lang = defaultCode();
      migrateLegacyProgress();
      loadCognateProgress(CognateState.lang);
      bindEntryButtons();
      bindBackButton();
      // 转屏 / 改窗宽会换断点，顶栏高度跟着变，常驻返回丸的偏移量要重算
      window.addEventListener('resize', syncStickyTop);
    },

    /** 当前语言 code（'it' / 'de' / 'fr' …） */
    getLanguage() {
      return CognateState.lang;
    },

    /** 供 App 入口卡片与深链接（Shell 路由）调用；lang 收 code 或旧语言 key。 */
    open(lang, options) {
      var opts = options || {};
      var code = window.Languages ? window.Languages.code(lang) : null;

      // 这门语言没有同源词数据（英语：没有「和英语同源」这回事）。
      // cognatePracticeScreen 是跨语言共享屏，#/en/vocab/cognates 照样能解析出来，
      // 不拦的话会在「英语 / 词汇 / 同源词」的面包屑底下渲染别的语言的词表。
      // 送回该语言的词汇页，别拿别人的数据糊弄。
      if (code && !supportsCognates(code)) {
        redirectUnsupported('vocabScreen');
        return;
      }

      var target = code || CognateState.lang || defaultCode();
      if (!target) return;

      if (target !== CognateState.lang) {
        // 换语言 = 换数据集 + 换进度，两样一起换，绝不留上一门语言的残留
        CognateState.lang = target;
        CognateState.words = [];
        CognateState.currentIndex = 0;
        CognateState.currentPattern = null;
        CognateState.currentMode = null;
      }
      loadCognateProgress(target);
      revealContainer();
      syncScreenChrome();

      if (!opts.skipNavigate) {
        if (typeof window.showScreen === 'function') {
          window.showScreen(COGNATE_SCREEN_ID, { replaceRoute: !!opts.replaceRoute });
        }
      }

      // 懒加载下这门语言的数据可能还没到（例如从别的语言深链接过来）。
      // 同源词数据属于二级模块，不随语言包下发。
      if (currentData().length === 0 && window.LangLoader && typeof window.LangLoader.ensureModule === 'function') {
        var container = getContainer();
        if (container) {
          setImmersive(false);
          container.innerHTML = '<div class="panel"><div class="panel-title">同源词 · ' +
            escapeHtml(profile().name) + '</div><div class="card-desc">正在加载' +
            escapeHtml(profile().cn) + '词库…</div></div>';
        }
        window.LangLoader.ensureModule(target, MODULE).then(function () {
          if (CognateState.lang !== target) return; // 加载期间又切走了
          CognateApp.showModeSelection(target);
        });
        return;
      }

      this.showModeSelection(target);
    },

    showModeSelection(lang) {
      var code = lang && window.Languages ? window.Languages.code(lang) : null;
      if (code && supportsCognates(code)) CognateState.lang = code;
      var container = getContainer();
      if (!container) return;
      revealContainer();
      syncScreenChrome();
      setImmersive(false);

      var data = currentData();
      var ff = countFalseFriends(data);
      var p = profile();

      // 本模块生成的 element id 一律带 cognate 前缀（browseBtn 这类通用名会和
      // index.html 里别的卡片撞 id，getElementById 只拿得到靠前的那个）。
      container.innerHTML =
        datasetHeader('') +
        '<div class="mode-selection">' +
          '<h2>同源词练习</h2>' +
          '<p class="subtitle">借力英语词汇量学' + escapeHtml(p.cn) + '：' +
            fmt(data.length) + ' 条与英语相似的词' +
            (ff ? '，其中 ' + fmt(ff) + ' 条是「假朋友」，长得像、意思不一样，界面上会单独标出来。' : '。') +
          '</p>' +
          '<div class="mode-buttons">' +
            '<button class="mode-btn" id="cognateEnglishPromptBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-keyboard"></use></svg></span>' +
              '<span class="mode-name">English Prompt</span>' +
              '<span class="mode-desc">看英语，拼' + escapeHtml(p.cn) + '</span>' +
            '</button>' +
            '<button class="mode-btn" id="cognateContrastBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-eye"></use></svg></span>' +
              '<span class="mode-name">Contrast View</span>' +
              '<span class="mode-desc">' + escapeHtml(p.name) + ' / English 对照高亮</span>' +
            '</button>' +
            '<button class="mode-btn" id="cognatePatternGroupBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-puzzle"></use></svg></span>' +
              '<span class="mode-name">Pattern Groups</span>' +
              '<span class="mode-desc">按词形对应规律分组</span>' +
            '</button>' +
            '<button class="mode-btn" id="cognateBrowseModeBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-book-open"></use></svg></span>' +
              '<span class="mode-name">Browse</span>' +
              '<span class="mode-desc">浏览整张同源词表</span>' +
            '</button>' +
          '</div>' +
        '</div>';

      document.getElementById('cognateEnglishPromptBtn').addEventListener('click', function() { CognateApp.startEnglishPromptMode(); });
      document.getElementById('cognateContrastBtn').addEventListener('click', function() { CognateApp.startContrastMode(); });
      document.getElementById('cognatePatternGroupBtn').addEventListener('click', function() { CognateApp.startPatternGroupMode(); });
      document.getElementById('cognateBrowseModeBtn').addEventListener('click', function() { CognateApp.startBrowseMode(); });
    },

    /** difficulty: 1 / 2 / 3（cognates/1 的分档），省略 = 全部 */
    startEnglishPromptMode(difficulty) {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      CognateState.currentPattern = null;
      var words = currentData();
      if (difficulty) {
        words = words.filter(function(w) { return String(w.difficulty) === String(difficulty); });
      }
      EnglishPromptMode.start(words);
    },

    /** filter: {difficulty} 或 {pattern}（规律 key） */
    startContrastMode(filter) {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      ContrastMode.start(currentData(), filter);
    },

    startPatternGroupMode() {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      PatternGroupMode.start(currentData());
    },

    startBrowseMode() {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      BrowseMode.start(currentData());
    }
  };

  // === 屏幕 / 入口接线 ===

  /**
   * 深链接落到一门没有同源词数据的语言时的兜底。
   * 不能直接同步 showScreen：DimRouter.apply() 调 opener 期间 sync 被静音，
   * 屏幕换了地址栏还会留在 #/en/vocab/cognates。推到下一个 tick 再切，
   * 地址栏才会被 replaceState 改掉。
   */
  function redirectUnsupported(screenId) {
    window.setTimeout(function () {
      if (typeof window.showScreen === 'function') {
        window.showScreen(screenId, { replaceRoute: true });
      }
    }, 0);
  }

  function syncScreenChrome() {
    var p = profile();
    var eyebrow = document.getElementById('cognateEyebrow');
    if (eyebrow) eyebrow.textContent = p.name + ' / Cognates';
    var desc = document.getElementById('cognateScreenDesc');
    if (desc) {
      desc.textContent = '和英语长得像的' + p.cn + '单词，用已有的英语词汇量抄近路。';
    }
  }

  /** 入口按钮统一用 [data-cognate-lang] 标记（值是语言 code 或 key），事件用委托。 */
  function bindEntryButtons() {
    document.addEventListener('click', function (event) {
      var el = event.target && event.target.closest && event.target.closest('[data-cognate-lang]');
      if (!el) return;
      CognateApp.open(el.getAttribute('data-cognate-lang'));
    });
  }

  function bindBackButton() {
    var btn = document.getElementById('cognateBackBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (typeof window.goBack === 'function') window.goBack();
    });
  }

  // Expose to global
  window.CognateApp = CognateApp;
  window.CognateState = CognateState;

  // index.html 里的 readyState 伪装 shim + lib/lang-loader.js 会在语言包就绪后
  // 派发一次合成 DOMContentLoaded，所有模块都在那一刻初始化，这里保持一致。
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { CognateApp.init(); });
  } else {
    CognateApp.init();
  }

})();
