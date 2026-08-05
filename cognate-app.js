/**
 * Cognate Practice Module —— 同源词练习（意大利语 / 德语 / 法语共用）
 *
 * 四种练习模式：
 *   1. EnglishPromptMode  英语提示，拼写目标语言的词
 *   2. ContrastMode       对比显示，高亮拼写差异
 *   3. PatternGroupMode   按对应规律（后缀 / 音变）分组练习
 *   4. BrowseMode         浏览同源词表
 *
 * 三条本文件必须守住的约定：
 *
 * A. 数据集一律在【调用时】用裸标识符 + typeof 守卫解析。
 *    data/cognates.js 是 `var COGNATE_DATA`，德/法两份是顶层 `const`（顶层 const
 *    不挂 window，只进全局词法环境）。而 lib/lang-loader.js 是按语言懒加载的：
 *    首屏进德语时意大利语数据根本还没注入。原来这里写的是模块顶层的
 *    `var COGNATE_DATA = window.COGNATE_DATA || []`，那一行在懒加载下必然快照到
 *    空数组，之后数据补到了也永远读不回来 —— 所以解析必须推迟到每次调用。
 *
 * B. 语言差异全部收敛到 LANG_CONFIG 一张表里（headwordField / dataGlobalName /
 *    label），渲染代码不出现任何一门具体语言的字段名。
 *
 * C. 进度按语言分 key 存。三门语言的「已掌握规律」是三套东西，共用一个 key 会互相
 *    覆盖；旧版只有意大利语在写，所以启动时把老 key 迁移到意大利语那一份。
 */

(function () {
  'use strict';

  // === 按语言的配置表 ===
  //
  // headwordField  该数据集里「目标语言词形」的字段名。注意法语数据里另有一个
  //                `italian` 字段（意语桥接词），所以字段名必须显式指定，
  //                绝不能靠猜或靠遍历。
  // dataGlobalName 数据集的全局名字，调用时才解析（见文件头 A 条）。
  // label          界面上给这门语言的标签。
  var LANG_CONFIG = {
    italian: {
      headwordField: 'italian',
      dataGlobalName: 'COGNATE_DATA',
      label: 'Italian',
      langCn: '意大利语',
      countKey: 'italian-cognates',
      inputHint: 'Type the Italian word...'
    },
    german: {
      headwordField: 'german',
      dataGlobalName: 'GERMAN_COGNATE_DATA',
      label: 'Deutsch',
      langCn: '德语',
      countKey: 'german-cognates',
      inputHint: 'Deutsches Wort eingeben...'
    },
    french: {
      headwordField: 'french',
      dataGlobalName: 'FRENCH_COGNATE_DATA',
      label: 'Français',
      langCn: '法语',
      countKey: 'french-cognates',
      inputHint: 'Tapez le mot français...'
    }
  };

  var DEFAULT_LANG = 'italian';
  var COGNATE_SCREEN_ID = 'cognatePracticeScreen';
  var PAGE_SIZE = 100;

  // 同源词对英语母语/英语跳板的学习者才成立，所以 LANG_CONFIG 里没有 english。
  // 这张表记的是「这门语言没有同源词模块时该把人送到哪」。
  var LANG_HOME_SCREEN = {
    english: 'englishVocabularyScreen'
  };

  function configFor(lang) {
    return LANG_CONFIG[lang] || LANG_CONFIG[DEFAULT_LANG];
  }

  /**
   * 调用时解析数据集：裸标识符 + typeof 守卫。
   * 绝不能在 parse 期做这件事，也不能写 window.X —— 顶层 const 不在 window 上。
   */
  function resolveDataset(name) {
    try {
      switch (name) {
        case 'COGNATE_DATA':
          return typeof COGNATE_DATA !== 'undefined' ? COGNATE_DATA : null;
        case 'GERMAN_COGNATE_DATA':
          return typeof GERMAN_COGNATE_DATA !== 'undefined' ? GERMAN_COGNATE_DATA : null;
        case 'FRENCH_COGNATE_DATA':
          return typeof FRENCH_COGNATE_DATA !== 'undefined' ? FRENCH_COGNATE_DATA : null;
        default:
          return null;
      }
    } catch (err) {
      return null;
    }
  }

  function datasetFor(lang) {
    var data = resolveDataset(configFor(lang).dataGlobalName);
    return Array.isArray(data) ? data : [];
  }

  // === Cognate State ===
  const CognateState = {
    lang: DEFAULT_LANG,  // 当前语言（意 / 德 / 法）
    words: [],           // 当前练习的 cognate 词表
    currentIndex: 0,     // 当前题目索引
    correctCount: 0,     // 正确计数
    totalCount: 0,       // 总答题数
    currentMode: null,   // 当前练习模式
    currentPattern: null, // 当前练习的后缀规律（PatternGroupMode）
    masteredPatterns: new Set(), // 已完成的后缀规律组
    browseLimit: PAGE_SIZE,      // BrowseMode 已展开的条数
    browseDifficulty: '',        // BrowseMode 难度筛选
    browseFalseFriendsOnly: false
  };

  function cfg() {
    return configFor(CognateState.lang);
  }

  function currentData() {
    return datasetFor(CognateState.lang);
  }

  // === Storage ===
  //
  // 旧版三门语言会共用 'dimenticato_cognate_progress'，谁后写谁覆盖。改成按语言
  // 分 key；老 key 里的进度只可能来自意大利语（旧版只有意大利语有入口），
  // 所以迁移到 italian 那一份，迁移成功后删掉老 key，避免出现两个真相。
  const COGNATE_STORAGE_PREFIX = 'dimenticato_cognate_progress';
  const COGNATE_LEGACY_KEY = COGNATE_STORAGE_PREFIX;

  function storageKey(lang) {
    return COGNATE_STORAGE_PREFIX + '_' + (LANG_CONFIG[lang] ? lang : DEFAULT_LANG);
  }

  function migrateLegacyProgress() {
    try {
      var legacy = localStorage.getItem(COGNATE_LEGACY_KEY);
      if (legacy === null) return;
      var target = storageKey(DEFAULT_LANG);
      if (localStorage.getItem(target) === null) {
        localStorage.setItem(target, legacy);
        // 写进去了再删老 key；写失败（配额满等）就原样留着，下次启动重试。
        if (localStorage.getItem(target) === null) return;
      }
      localStorage.removeItem(COGNATE_LEGACY_KEY);
    } catch (e) {
      console.warn('迁移 cognate 进度失败:', e);
    }
  }

  function saveCognateProgress() {
    try {
      localStorage.setItem(storageKey(CognateState.lang), JSON.stringify({
        mastered: [...CognateState.masteredPatterns]
      }));
    } catch (e) {
      console.error('保存 cognate 进度失败:', e);
    }
  }

  function loadCognateProgress(lang) {
    var target = LANG_CONFIG[lang] ? lang : CognateState.lang;
    try {
      const data = localStorage.getItem(storageKey(target));
      const parsed = data ? JSON.parse(data) : null;
      CognateState.masteredPatterns = new Set((parsed && parsed.mastered) || []);
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
   * 「沉浸式」视图标记 —— 只在对比卡片 / 拼写题这两种「页面最底下就是主操作按钮」
   * 的视图上打开。390×844 逐条实测：这两种视图里 .mobile-floating-back 会和主按钮
   * 矩形相叠（对比模式 DE 88/2347、FR 64/4272、IT 9/1587 条，几乎全是多一条假朋友
   * 提示条、卡片更高的词条；拼写题的「下一题 →」是通栏按钮，右半截几乎每题都被压住），
   * 其中一部分连按钮中心都被悬浮按钮吃掉，点下去触发 goBack() 直接退出练习。
   *
   * 打开时由 CSS 把悬浮返回按钮隐掉，改用屏内顶部的 #cognateBackBtn 返回（这两种
   * 视图内容都不长，顶部返回链接在首屏之内）。列表类视图（浏览 / 规律列表 / 模式
   * 选择）要滚很久，悬浮按钮照常保留。
   *
   * 标记打在容器自身而不是 body 上：CSS 侧还要求同源词屏处于 active，
   * 所以哪怕跳转时这个类没被清掉，也不会漏到别的屏幕上。
   */
  function setImmersive(on) {
    var container = getContainer();
    if (container) container.classList.toggle('cognate-immersive', !!on);
  }

  // === 词条字段读取（全部经 LANG_CONFIG，不出现具体语言字段名） ===

  function headwordOf(word) {
    return (word && word[cfg().headwordField]) || '';
  }

  /**
   * 德语数据里 display 带定冠词（"die Macht"）。答案比对与差异高亮都用裸词形，
   * 冠词只作为前缀展示，所以这里把 display 拆成「前缀 + 词形」。
   */
  function displayPartsOf(word) {
    var head = headwordOf(word);
    var display = (word && word.display) || head;
    if (display !== head && head && display.slice(-head.length) === head) {
      return { prefix: display.slice(0, display.length - head.length), head: head };
    }
    return { prefix: '', head: head };
  }

  /**
   * 假朋友提示文案。法语数据自带成句的 warning；德语数据是拆开的字段
   * （falseFriendOf / falseFriendChinese / germanFor），这里拼成同一种格式。
   */
  function falseFriendNote(word) {
    if (!word || !word.falseFriend) return null;
    if (word.warning) return word.warning;
    if (word.falseFriendOf) {
      var cn = word.falseFriendChinese ? '（' + word.falseFriendChinese + '）' : '';
      var right = word.germanFor ? ' = ' + word.germanFor : '';
      return '≠ ' + word.falseFriendOf + cn + right;
    }
    if (word.lookalike) return '≠ ' + word.lookalike;
    return '长得像英语词，意思并不一样';
  }

  function falseFriendStrip(word) {
    var note = falseFriendNote(word);
    if (!note) return '';
    return '<div class="tip-strip cognate-false-friend">' +
        '<span class="msr">warning</span>' +
        '<span><b>假朋友</b> · ' + escapeHtml(note) + '</span>' +
      '</div>';
  }

  function similarityLabel(word) {
    var score = word && typeof word.similarityScore === 'number' ? word.similarityScore : null;
    if (score === null) return '';
    // 假朋友的 similarityScore 比的是「本语言的词 vs 那个陷阱英语词」，不是它
    // 真正的英文释义 —— 照抄成「% 与英语相似」会是谎话：德语 also 的释义是
    // "so, therefore"，却挂着 100%，因为那 100% 说的是它和英语 also 长得一样。
    // 法语数据用 similarityBasis + lookalike 标这件事，德语数据用 falseFriendOf，
    // 两边都要认。
    var basis = (word.similarityBasis === 'lookalike' && word.lookalike)
      ? word.lookalike
      : (word.falseFriend ? (word.lookalike || word.falseFriendOf) : null);
    if (basis) return score + '% 形似 “' + basis + '”';
    return score + '% 与英语相似';
  }

  /**
   * 「规律」这一栏的文字说明。patternType 一共有四种写法，只有第一种是
   * `源语言/英语` 的后缀对应，照着 split('/') 一把梭会把另外三种渲染成胡话
   * （最大的那组 identisch 396 词会显示成「Deutsch 侧的 “identisch” 对应英语的
   * “English”」）：
   *   1. `-isch/-ic`      后缀对应，左源右英；英语侧可能是 Ø（-ieren/-Ø）
   *   2. `c↔k`            字母对应；标签方向不统一（h↔Ø 是德左英右，其余相反），
   *                       所以这里只陈述「存在这组对应」，不认定哪边是哪边
   *   3. identisch / 同形词 identical / falscher Freund / 假朋友 faux-ami
   *   4. Other            patternType 为空的兜底组
   */
  var SUFFIX_PATTERN_RE = /^(-[^/]+)\/(-[^（(]*)(?:[（(](.+)[)）])?$/;
  var LETTER_PATTERN_RE = /^([^↔]+)↔([^↔]+)$/;
  var NAMED_PATTERNS = {
    'Other': '这一组没有归纳出统一的词形规律，按和英语的相似度收在一起。',
    'identisch': '这一组词和英语拼写完全一样，只有发音和词性需要单独记。',
    '同形词 identical': '这一组词和英语拼写完全一样，只有发音和词性需要单独记。',
    'falscher Freund': '长得像英语词，意思并不一样。每条都标了它真正对应的英语词。',
    '假朋友 faux-ami': '长得像英语词，意思并不一样。每条都标了它真正对应的英语词。'
  };
  var EMPTY_SUFFIX_RE = /^-?[Ø∅]$/;

  function patternExplanation(pattern) {
    var label = cfg().label;
    if (NAMED_PATTERNS[pattern]) return NAMED_PATTERNS[pattern];

    var letters = LETTER_PATTERN_RE.exec(pattern);
    if (letters) {
      return '这一组词在英语和 ' + label + ' 之间存在 “' + letters[1].trim() +
        ' ↔ ' + letters[2].trim() + '” 的字母对应。';
    }

    var suffix = SUFFIX_PATTERN_RE.exec(pattern);
    if (suffix) {
      var src = suffix[1];
      var en = suffix[2];
      var note = suffix[3] ? '（' + suffix[3] + '）' : '';
      if (EMPTY_SUFFIX_RE.test(en)) {
        return label + ' 侧的词尾 “' + src + '” 在英语里没有对应后缀' + note + '。';
      }
      return label + ' 侧的词尾 “' + src + '” 对应英语的 “' + en + '”' + note + '。';
    }

    return '这一组词共享同一条与英语的对应规律。';
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
    const it = source.toLowerCase();
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

    const commonPrefix = source.slice(0, prefixLen);
    const itDiff = source.slice(prefixLen, source.length - suffixLen);
    const enDiff = english.slice(prefixLen, english.length - suffixLen);
    const commonSuffix = source.slice(source.length - suffixLen);

    return {
      sourceHtml: escapeHtml(commonPrefix) +
                   (itDiff ? '<span class="cognate-diff">' + escapeHtml(itDiff) + '</span>' : '') +
                   escapeHtml(commonSuffix),
      englishHtml: escapeHtml(commonPrefix) +
                   (enDiff ? '<span class="cognate-diff">' + escapeHtml(enDiff) + '</span>' : '') +
                   escapeHtml(english.slice(english.length - suffixLen))
    };
  }

  /** 词条 -> {sourceHtml, englishHtml}，source 侧带上 display 前缀（德语冠词） */
  function diffOf(word) {
    var parts = displayPartsOf(word);
    var diff = highlightDiff(parts.head, word ? word.english : '');
    if (parts.prefix) {
      diff.sourceHtml = escapeHtml(parts.prefix) + diff.sourceHtml;
    }
    return diff;
  }

  /**
   * 标准化文本用于答案比对（忽略重音）
   */
  function normalizeForCompare(str) {
    return (str || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /** 比对前再把词间空白压成一个空格（"die  Session" 也认） */
  function normalizeAnswer(str) {
    return normalizeForCompare(str).replace(/\s+/g, ' ');
  }

  /**
   * 答案比对：带冠词的 display 与裸词形两种写法都算对。
   *
   * 德语 2,347 条同源词里 1,724 条的 display 带定冠词（"die Session"），而答错 / 跳过时
   * 反馈区照 display 印「正确答案」。只比 headwordOf() 的裸词形的话，把 app 自己印出来
   * 的答案原样抄回去照样判错；反过来带冠词的名词只写裸词也不该判错 —— 数据里并没有
   * 「必须写冠词」这条要求，判错等于系统性训练用户不写冠词。
   *
   * 只放行这两种写法本身：两边都是全等比对，不做前缀 / 包含式的宽松匹配，
   * 「答案里多打了别的东西」照旧算错。
   * 意 / 法数据没有 display 字段（display 回落成裸词形），对它们这里是恒等变换。
   */
  function isAnswerCorrect(word, userAnswer) {
    var typed = normalizeAnswer(userAnswer);
    if (!typed) return false;
    var head = normalizeAnswer(headwordOf(word));
    if (head && typed === head) return true;
    var display = normalizeAnswer(word && word.display);
    return !!display && typed === display;
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

  function fmt(n) {
    return Number(n).toLocaleString('en-US');
  }

  /** 每块界面统一的抬头：语言 + 数据规模，切语言后一眼能看出没串数据。 */
  function datasetHeader(subtitle) {
    var data = currentData();
    var ff = countFalseFriends(data);
    return '<div class="panel cognate-dataset-head">' +
        '<div class="panel-title">同源词 · ' + escapeHtml(cfg().label) + '</div>' +
        '<div class="card-desc">共 <b data-cognate-total>' + fmt(data.length) + '</b> 条' +
          (ff ? ' · 其中 <b>' + fmt(ff) + '</b> 条假朋友' : '') +
          (subtitle ? ' · ' + escapeHtml(subtitle) : '') +
        '</div>' +
      '</div>';
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
      setImmersive(true);

      container.innerHTML =
        '<div class="quiz-card">' +
          '<div class="quiz-header practice-head">' +
            '<span class="quiz-progress idx">' + (CognateState.currentIndex + 1) + ' / ' + CognateState.words.length + '</span>' +
            '<span class="quiz-accuracy acc">正确率 <b>' + this.getAccuracy() + '%</b></span>' +
          '</div>' +
          '<div class="quiz-content">' +
            '<div class="quiz-prompt">' +
              '<div class="prompt-english">English: <strong>' + escapeHtml(word.english) + '</strong></div>' +
              '<div class="prompt-chinese">' + escapeHtml(word.chinese) + '</div>' +
            '</div>' +
            '<input type="text" class="spelling-input" id="cognateInput" placeholder="' +
              escapeAttribute(cfg().inputHint) + '" autocomplete="off">' +
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
          '<div><strong>' + escapeHtml(cfg().label) + ':</strong> ' + diff.sourceHtml + '</div>' +
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
      var userAnswer = input.value.trim();

      CognateState.totalCount++;

      var isCorrect = isAnswerCorrect(word, userAnswer);

      if (isCorrect) {
        CognateState.correctCount++;
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
      // 走完一整组规律 == 掌握了这条规律。旧版有 markPatternComplete() 但没有任何
      // 调用点，所以「已完成」标记永远不会亮，进度存储也就成了死代码。
      var pattern = CognateState.currentPattern;
      if (pattern) PatternGroupMode.markPatternComplete(pattern);

      container.innerHTML =
        datasetHeader(pattern ? '规律：' + pattern : '') +
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
      if (!word) return this.showComplete();
      setImmersive(true);
      var diff = diffOf(word);
      var total = CognateState.words.length;
      var pct = total ? Math.round(((CognateState.currentIndex + 1) / total) * 100) : 0;

      container.innerHTML =
        datasetHeader('对比模式') +
        '<div class="practice-head">' +
          '<span class="idx">' + (CognateState.currentIndex + 1) + ' / ' + total + '</span>' +
          '<span class="acc">' + escapeHtml(cfg().label) + ' ↔ English</span>' +
        '</div>' +
        '<div class="session-bar"><div class="session-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="contrast-card practice-card">' +
          '<div class="contrast-row word">' + diff.sourceHtml + '</div>' +
          '<div class="contrast-row chinese-hint"><span class="lang-label">English</span> · ' + diff.englishHtml + '</div>' +
          '<div class="contrast-chinese chinese-hint">' + escapeHtml(word.chinese) + '</div>' +
          '<div class="contrast-meta chips wrap">' +
            (word.patternType ? '<span class="chip pattern-tag">' + escapeHtml(word.patternType) + '</span>' : '') +
            (similarityLabel(word) ? '<span class="chip similarity-tag">' + escapeHtml(similarityLabel(word)) + '</span>' : '') +
            (word.difficulty ? '<span class="chip">' + escapeHtml(word.difficulty) + '</span>' : '') +
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
              '<span class="card-title pattern-name">' + escapeHtml(pattern) + '</span>' +
              '<span class="card-desc pattern-count">' + fmt(words.length) + ' 词' +
                (ff ? ' · ' + fmt(ff) + ' 条假朋友' : '') + '</span>' +
              (mastered ? '<span class="chip active mastered-badge">已完成</span>' : '') +
            '</button>';
        }).join('');

      container.innerHTML =
        datasetHeader('共 ' + fmt(entries.length) + ' 组对应规律') +
        '<div class="pattern-selection">' +
          '<h2>按规律学</h2>' +
          '<p class="subtitle">' + escapeHtml(cfg().label) + ' 与英语之间的词形对应规律，一组一组吃透。</p>' +
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
      var examples = words.slice(0, 5);
      var exampleHtml = examples.map(function(w) {
        var diff = diffOf(w);
        return '<div class="example-row word-line">' +
            '<span class="wl-word">' + diff.sourceHtml + '</span>' +
            '<span class="wl-gloss">' + diff.englishHtml + '</span>' +
            '<span class="wl-cn">' + escapeHtml(w.chinese) + '</span>' +
            '<span class="wl-status">' + escapeHtml(w.falseFriend ? '假朋友' : '') + '</span>' +
            '<span class="wl-status">' + (typeof w.similarityScore === 'number' ? w.similarityScore + '%' : '') + '</span>' +
          '</div>';
      }).join('');

      container.innerHTML =
        datasetHeader('规律：' + pattern) +
        '<div class="pattern-intro">' +
          '<h2>Pattern: ' + escapeHtml(pattern) + '</h2>' +
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
      // slice() 之后再排序：旧版直接 sort(words) 会就地重排数据集本身，
      // 把 data/*.js 里的词频顺序永久打乱（app.js 还会 COGNATE_DATA.slice(0,1000)）。
      CognateState.words = words.slice().sort(function(a, b) { return (a.rank || 0) - (b.rank || 0); });
      CognateState.currentMode = 'browse';
      CognateState.browseLimit = PAGE_SIZE;
      CognateState.browseDifficulty = '';
      CognateState.browseFalseFriendsOnly = false;
      this.showList();
    },

    visibleWords() {
      return CognateState.words.filter(function (w) {
        if (CognateState.browseDifficulty && w.difficulty !== CognateState.browseDifficulty) return false;
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

      var filterOptions =
        '<div class="browse-filter browse-controls">' +
          '<select class="filter-select" id="cognateDifficultyFilter">' +
            '<option value="">全部难度</option>' +
            '<option value="easy">Easy（≥80%）</option>' +
            '<option value="medium">Medium（50-79%）</option>' +
            '<option value="hard">Hard（&lt;50%）</option>' +
          '</select>' +
          (hasFalseFriends
            ? '<button class="chip' + (CognateState.browseFalseFriendsOnly ? ' active' : '') + '" id="cognateFalseFriendFilter">只看假朋友</button>'
            : '') +
          '<span class="card-desc">' + fmt(matched.length) + ' 条匹配，已显示 ' + fmt(shown.length) + ' 条</span>' +
        '</div>';

      var wordList = shown.map(function(w) {
        var diff = diffOf(w);
        return '<div class="browse-item word-line" data-difficulty="' + escapeAttribute(w.difficulty) + '">' +
            '<span class="browse-source wl-word">' + diff.sourceHtml + '</span>' +
            '<span class="browse-english wl-gloss">' + diff.englishHtml + '</span>' +
            '<span class="browse-chinese wl-cn">' + escapeHtml(w.chinese) + '</span>' +
            '<span class="wl-status">' + (w.falseFriend ? '<span class="chip">假朋友</span>' : '') + '</span>' +
            '<span class="browse-score wl-status">' + (typeof w.similarityScore === 'number' ? w.similarityScore + '%' : '') + '</span>' +
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
      // 旧版只是把 DOM 节点 display:none，于是「筛选」只在已渲染的前 100 条里生效，
      // 筛完还可能一条都不剩。改成按数据重新渲染。
      CognateState.browseDifficulty = difficulty || '';
      CognateState.browseLimit = PAGE_SIZE;
      this.showList();
    }
  };

  // === Cognate App Controller ===

  function checkDataAndRender(container) {
    if (currentData().length === 0) {
      setImmersive(false);
      container.innerHTML = '<div class="error-message">' + escapeHtml(cfg().langCn) +
        '同源词数据尚未加载完成，请稍候或刷新页面。</div>';
      return false;
    }
    return true;
  }

  const CognateApp = {
    init() {
      migrateLegacyProgress();
      loadCognateProgress(CognateState.lang);
      registerCognateScreen();
      installFrenchEntry();
      bindEntryButtons();
      bindBackButton();
    },

    getLanguage() {
      return CognateState.lang;
    },

    /** 供 lib/router.js 深链接补水与入口按钮调用 */
    open(lang, options) {
      var opts = options || {};

      // 英语没有「和英语同源」这回事，LANG_CONFIG 里也就没有 english。可是
      // cognatePracticeScreen 是跨语言共享屏，#/en/vocab/cognates 照样能解析出来，
      // 不拦的话会在「英语 / 词汇 / 同源词」的面包屑底下渲染意大利语词表。
      // 送回该语言的词汇页，别拿别人的数据糊弄。
      if (lang && !LANG_CONFIG[lang] && LANG_HOME_SCREEN[lang]) {
        redirectUnsupported(LANG_HOME_SCREEN[lang]);
        return;
      }

      var target = LANG_CONFIG[lang] ? lang : DEFAULT_LANG;

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
        // 意大利语那颗按钮上还挂着 app.js 里的老 handler，它会先跳到
        // vocabularyModesScreen 并压进一条历史；这里用 replaceState 覆盖掉那条，
        // 免得用户按一次「返回」停在一块空的练习方式页上。
        if (typeof window.showScreen === 'function') {
          window.showScreen(COGNATE_SCREEN_ID, { replaceRoute: !!opts.replaceRoute });
        }
      }

      // 懒加载下这门语言的数据可能还没到（例如从别的语言深链接过来）
      if (currentData().length === 0 && window.LangLoader && typeof window.LangLoader.ensure === 'function') {
        var container = getContainer();
        if (container) {
          setImmersive(false);
          container.innerHTML = '<div class="panel"><div class="panel-title">同源词 · ' +
            escapeHtml(cfg().label) + '</div><div class="card-desc">正在加载' +
            escapeHtml(cfg().langCn) + '词库…</div></div>';
        }
        window.LangLoader.ensure(target).then(function () {
          if (CognateState.lang !== target) return; // 加载期间又切走了
          CognateApp.showModeSelection(target);
        });
        return;
      }

      this.showModeSelection(target);
    },

    showModeSelection(lang) {
      if (lang && LANG_CONFIG[lang]) CognateState.lang = lang;
      var container = getContainer();
      if (!container) return;
      revealContainer();
      syncScreenChrome();
      setImmersive(false);

      var data = currentData();
      var ff = countFalseFriends(data);

      // 本模块生成的 element id 一律带 cognate 前缀。旧版这四颗按钮叫
      // englishPromptBtn / contrastBtn / patternGroupBtn / browseBtn，其中
      // browseBtn 和 index.html 里意大利语「浏览」卡片的 id 撞了：
      // getElementById 返回文档里靠前的那一个，于是浏览模式的按钮从来没被绑上，
      // 点了毫无反应。实测确认过（改名前探针 browse=0rows）。
      container.innerHTML =
        datasetHeader('') +
        '<div class="mode-selection">' +
          '<h2>同源词练习</h2>' +
          '<p class="subtitle">借力英语词汇量学' + escapeHtml(cfg().langCn) + '：' +
            fmt(data.length) + ' 条与英语相似的词' +
            (ff ? '，其中 ' + fmt(ff) + ' 条是「假朋友」——长得像、意思不一样，界面上会单独标出来。' : '。') +
          '</p>' +
          '<div class="mode-buttons">' +
            '<button class="mode-btn" id="cognateEnglishPromptBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-keyboard"></use></svg></span>' +
              '<span class="mode-name">English Prompt</span>' +
              '<span class="mode-desc">看英语，拼' + escapeHtml(cfg().langCn) + '</span>' +
            '</button>' +
            '<button class="mode-btn" id="cognateContrastBtn">' +
              '<span class="mode-icon"><svg class="icon"><use href="#icon-eye"></use></svg></span>' +
              '<span class="mode-name">Contrast View</span>' +
              '<span class="mode-desc">' + escapeHtml(cfg().label) + ' / English 对照高亮</span>' +
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

    startEnglishPromptMode(difficulty) {
      var container = getContainer();
      if (!container) return;
      if (!checkDataAndRender(container)) return;
      CognateState.currentPattern = null;
      var words = currentData();
      if (difficulty) {
        words = words.filter(function(w) { return w.difficulty === difficulty; });
      }
      EnglishPromptMode.start(words);
    },

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
   * cognatePracticeScreen 是三门语言共用的一块屏（和 grammarBookScreen 同一套路），
   * 父级按 body[data-language] 解析。不登记的话面包屑会退化、返回键找不到上一层。
   */
  function registerCognateScreen() {
    var t = window.ScreenTree;
    if (!t || typeof t.register !== 'function') return;
    t.register(COGNATE_SCREEN_ID, {
      parent: function (lang) {
        return lang === 'italian' ? 'vocabularyScreen' : lang + 'VocabularyScreen';
      },
      slug: 'vocab/cognates',
      section: 'vocab',
      crumb: ['词汇', '同源词']
    });
  }

  /**
   * 深链接落到一门没有同源词数据的语言时的兜底。
   * 不能直接同步 showScreen：router.apply() 是在 withSuspendedSync() 里调
   * hydrate() 的，那段时间 DimRouter.sync() 被静音，屏幕换了地址栏还会留在
   * #/en/vocab/cognates。推到下一个 tick 再切，地址栏才会被 replaceState 改掉。
   */
  function redirectUnsupported(screenId) {
    window.setTimeout(function () {
      if (typeof window.showScreen === 'function') {
        window.showScreen(screenId, { replaceRoute: true });
      }
    }, 0);
  }

  function syncScreenChrome() {
    var eyebrow = document.getElementById('cognateEyebrow');
    if (eyebrow) eyebrow.textContent = cfg().label + ' / Cognates';
    var desc = document.getElementById('cognateScreenDesc');
    if (desc) {
      desc.textContent = '和英语长得像的' + cfg().langCn + '单词，用已有的英语词汇量抄近路。';
    }
  }

  /**
   * 入口按钮统一用 [data-cognate-lang] 标记，事件用委托。
   *
   * 分两个阶段挂是为了和 app.js 里那颗老的 .cognate-btn 共处：
   *   捕获阶段 —— 先把语言定下来，这样 app.js 随后同步调用的
   *              CognateApp.showModeSelection()（无参）不会拿着上一门语言去渲染；
   *   冒泡阶段 —— 在 app.js 的 showScreen('vocabularyModesScreen') 之后再跳一次，
   *              最终停在同源词屏上。
   */
  function bindEntryButtons() {
    document.addEventListener('click', function (event) {
      var el = event.target && event.target.closest && event.target.closest('[data-cognate-lang]');
      if (!el) return;
      var lang = el.getAttribute('data-cognate-lang');
      if (LANG_CONFIG[lang]) CognateState.lang = lang;
    }, true);

    document.addEventListener('click', function (event) {
      var el = event.target && event.target.closest && event.target.closest('[data-cognate-lang]');
      if (!el) return;
      CognateApp.open(el.getAttribute('data-cognate-lang'), {
        replaceRoute: el.classList.contains('cognate-btn')
      });
    });
  }

  function bindBackButton() {
    var btn = document.getElementById('cognateBackBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (typeof window.goBack === 'function') window.goBack();
    });
  }

  /**
   * 法语的全部屏幕由 french-app.js 在运行时注入（index.html 里没有任何法语 DOM），
   * 所以法语这颗入口只能在这里补挂。french-app.js 在自己的 IIFE 顶层就调用了
   * installFrenchScreens()，而本函数跑在 DOMContentLoaded，那时屏幕已经在 DOM 上。
   * 幂等：已经挂过就直接返回。
   */
  function installFrenchEntry() {
    var screen = document.getElementById('frenchVocabularyScreen');
    if (!screen) return;
    if (screen.querySelector('[data-cognate-lang="french"]')) return;
    var grid = screen.querySelector('.card-grid');
    if (!grid) return;

    // 3 张卡变 4 张：cols-3 会剩一张孤零零地占三分之一，改成 2×2
    grid.classList.remove('cols-3');
    grid.classList.add('cols-2');

    var card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<span class="card-chip"><span class="msr">compare_arrows</span></span>' +
      '<span class="card-title">同源词 · 借力英语</span>' +
      '<span class="card-desc">和英语同源的法语词；faux amis（假朋友）单独标注。</span>' +
      '<div class="chips wrap">' +
        '<button class="chip" data-cognate-lang="french">同源词 · <span data-count="french-cognates">4,272</span> 词</button>' +
      '</div>';
    grid.appendChild(card);
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
