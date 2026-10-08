/**
 * Dimenticato 统一运行时。
 *
 * 四门语言共用同一套屏幕与同一份逻辑；语言差异只来自三处数据：
 *   lib/languages.js  语言档案（TTS、拼写判分风格、有哪些可选模块）
 *   data/vocab/<code>.js  统一格式的词库（schema v1，见 lib/vocab.js）
 *   各功能模块自己的数据（变位 / 语法书 / 搭配 / 同源词，按需懒加载）
 *
 * 本文件负责：首页、词汇练习（选择题 / 拼写 / 浏览）、单词本入口、进度、设置、
 * 语言切换，以及把各功能模块挂到统一的入口卡片上。导航与地址栏在 lib/shell.js。
 *
 * 存储 key 与旧版逐字相同（见 lib/storage.js），旧备份可以直接导入。
 */
(function (global) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var esc = global.escapeHtml;           // lib/utils.js
  var escAttr = global.escapeAttribute;  // lib/utils.js
  var fmt = function (n) { return Number(n || 0).toLocaleString('en-US'); };

  var LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  var LEVEL_NAMES = { A1: '入门', A2: '基础', B1: '进阶', B2: '中高级', C1: '高级', C2: '精通' };
  var LEVEL_DESC = {
    A1: '最常用的日常词：问候、数字、家人、吃喝。',
    A2: '描述日常生活与简单经历所需的词。',
    B1: '能谈工作、旅行和个人看法的核心词汇。',
    B2: '读报、讨论抽象话题时的常用词。',
    C1: '学术与专业场合的书面词汇。',
    C2: '文学、习语与细微语义差别。'
  };
  var LANGUAGE_KEY = 'dimenticato_language';
  var THEME_KEY = 'dimenticato_theme';
  var BROWSE_PAGE = 200;
  var SESSION_SIZES = ['20', '50', '100', 'all'];

  var shuffleArray = global.shuffleArray; // lib/utils.js

  function lang() { return global.getActiveLanguage(); }
  // 外语单词标上 lang：读屏按对应语言发音，浏览器按对应语言断字
  function langAttr(l) { return ' lang="' + global.Languages.code(l || lang()) + '"'; }
  function profile(l) { return global.Languages.get(l || lang()); }
  function hasModule(name, l) { return global.Languages.hasModule(l || lang(), name); }
  function readJson(key, fallback) {
    try { return global.DimStorage.safeParse(localStorage.getItem(key), fallback); } catch (e) { return fallback; }
  }
  function grammarData(l) { return global.LangLoader ? global.LangLoader.data(l || lang(), 'grammar') : null; }
  function grammarBook() {
    return global.GrammarBook || (typeof GrammarBook !== 'undefined' ? GrammarBook : null);
  }

  // 朗读：全局 Speaker（lib/utils.js）

  // ==================== 进度（已掌握集合 + 计数器） ====================
  //
  // 已掌握集合按「来源」分 key：系统词库用 DimStorage.masteredKey(lang)，
  // 单词本用各自的 progress key。统计计数器按语言存。改动只标脏，
  // deferredPersist 合并写盘，关页前自动冲刷。

  var Progress = {
    sets: {},
    stats: {},
    dirty: {},

    mastered: function (key) {
      if (!this.sets[key]) {
        var list = readJson(key, []);
        this.sets[key] = new Set(Array.isArray(list) ? list : []);
      }
      return this.sets[key];
    },
    systemKey: function (l) { return global.DimStorage.masteredKey(l || lang()); },
    systemMastered: function (l) { return this.mastered(this.systemKey(l)); },

    statsFor: function (l) {
      var key = global.DimStorage.statsKey(l);
      if (!this.stats[key]) {
        var s = readJson(key, {});
        this.stats[key] = Object.assign({ mcAttempts: 0, mcCorrect: 0, spAttempts: 0, spCorrect: 0 },
          s && typeof s === 'object' ? s : {});
      }
      return this.stats[key];
    },

    touch: function (key) { this.dirty[key] = true; this.persist(); },
    touchStats: function (l) { this.dirty[global.DimStorage.statsKey(l)] = true; this.persist(); },

    flush: function () {
      var self = this;
      Object.keys(this.dirty).forEach(function (key) {
        var value = self.sets[key] ? Array.from(self.sets[key]) : self.stats[key];
        if (value !== undefined) global.DimStorage.safeSetItem(key, JSON.stringify(value));
      });
      this.dirty = {};
    },

    /** 迁移 / 导入改写了存储之后，丢掉这门语言的缓存，下次按新数据读。 */
    forget: function (l) {
      this.flush();
      var sysKey = this.systemKey(l);
      var wbPrefix = global.DimStorage.key(l, 'wb_');
      var self = this;
      Object.keys(this.sets).forEach(function (key) {
        if (key === sysKey || key.indexOf(wbPrefix) === 0) delete self.sets[key];
      });
      delete this.stats[global.DimStorage.statsKey(l)];
    }
  };
  Progress.persist = global.deferredPersist(function () { Progress.flush(); }, 400);

  // ==================== 练习来源 ====================
  //
  // Prefs（dimenticato_<code>_prefs，DimStorage.key(lang, 'prefs')）：source 'system' | 'wb:<id>' | 'course'，
  // level 'A1'..'C2' | 'all'，filter 'all' | 'new' | 'due'，session '20'|'50'|'100'|'all'

  var courseSelection = null; // { lang, label, entries } —— 课程路线（course.js）选中的单元词表

  function prefs(l) { return global.Prefs.get(l || lang()); }
  function setPrefs(patch, l) { return global.Prefs.set(l || lang(), patch); }

  function currentSource(l) {
    l = l || lang();
    var p = prefs(l);
    if (p.source && p.source.indexOf('wb:') === 0) {
      var wb = global.Wordbooks.get(p.source.slice(3));
      if (wb && wb.language === l) {
        return {
          kind: 'wordbook', id: wb.id, label: wb.name,
          entries: global.Wordbooks.entries(wb),
          key: global.Wordbooks.progressKey(wb)
        };
      }
    }
    if (p.source === 'course' && courseSelection && courseSelection.lang === l) {
      return { kind: 'course', label: courseSelection.label, entries: courseSelection.entries, key: Progress.systemKey(l) };
    }
    var level = LEVELS.indexOf(p.level) >= 0 ? p.level : 'all';
    return {
      kind: 'system',
      label: level === 'all' ? '全部等级' : level + ' · ' + LEVEL_NAMES[level],
      level: level,
      entries: level === 'all' ? global.Vocab.entries(l) : global.Vocab.atLevel(l, level),
      key: Progress.systemKey(l)
    };
  }

  /** 到期复习优先，其次未掌握（按词频顺序），最后是已掌握；取够一组后打乱。 */
  function buildSession(l, src, filter, size) {
    var mastered = Progress.mastered(src.key);
    var dueList = global.SpacedRepetition ? global.SpacedRepetition.getDueWords(l, src.entries) : [];
    var due = new Set(dueList);
    var fresh = [];
    var known = [];
    src.entries.forEach(function (e) {
      if (due.has(e)) return;
      (mastered.has(e.word) ? known : fresh).push(e);
    });
    var ordered = filter === 'due' ? dueList
      : filter === 'new' ? dueList.filter(function (e) { return !mastered.has(e.word); }).concat(fresh)
        : dueList.concat(fresh, known);
    var n = size === 'all' ? ordered.length : parseInt(size, 10) || 20;
    return shuffleArray(ordered.slice(0, n));
  }

  function countDue(l, entries) {
    return global.SpacedRepetition ? global.SpacedRepetition.countDueWords(l, entries) : 0;
  }

  // ==================== 练习会话（选择题 / 拼写） ====================

  var session = null;

  function makeEngine(s) {
    return new global.QuizEngine({
      language: s.lang,
      fieldMap: { source: 'word', target: 'zh' },
      state: s,
      mastered: s.mastered,
      dom: {
        optionsContainer: $('quizMcOptions'),
        feedbackEl: $('quizFeedback'),
        feedbackTextEl: $('quizFeedbackText'),
        progressCurrent: $('quizProgressCurrent'),
        progressTotal: $('quizProgressTotal'),
        accuracyEl: $('quizAccuracy')
      }
    });
  }

  function startSession(mode, opts) {
    opts = opts || {};
    var l = lang();
    var src = opts.entries
      ? { entries: opts.entries, key: opts.key || Progress.systemKey(l), label: opts.label || '复习' }
      : currentSource(l);
    var p = prefs(l);
    var words = opts.entries ? shuffleArray(opts.entries).slice(0, 200) : buildSession(l, src, p.filter, p.session);

    var s = {
      mode: mode, lang: l, label: src.label, key: src.key,
      mastered: Progress.mastered(src.key),
      words: [], quizIndex: 0, quizTotal: 0, quizCorrect: 0, currentWord: null,
      startedAt: Date.now(), answered: false, hintStage: 0, masteredAtStart: 0,
      // 干扰项从整门语言取，小单词本也能凑满四个选项
      distractorSource: src.entries.length >= 60 ? src.entries : global.Vocab.entries(l)
    };
    s.engine = makeEngine(s);
    s.words = s.engine.filterUsableWords(words);
    if (!s.words.length) {
      toast(p.filter === 'due' ? '目前没有到期要复习的词' : '这个范围里没有可练的词');
      return;
    }
    s.masteredAtStart = s.words.filter(function (w) { return s.mastered.has(w.word); }).length;
    session = s;
    global.setPracticeContext(mode);

    var screen = mode === 'quiz' ? 'quizScreen' : 'spellScreen';
    $(mode === 'quiz' ? 'quizDone' : 'spellDone').classList.add('hidden');
    $(mode === 'quiz' ? 'quizBody' : 'spellBody').classList.remove('hidden');
    $(mode === 'quiz' ? 'quizLabel' : 'spellLabel').textContent = s.label;
    global.showScreen(screen);
    if (mode === 'quiz') renderQuiz(); else renderSpell();
  }

  function sessionBar(prefix) {
    var s = session;
    $(prefix + 'ProgressCurrent').textContent = Math.min(s.quizIndex + 1, s.words.length);
    $(prefix + 'ProgressTotal').textContent = s.words.length;
    $(prefix + 'Accuracy').textContent = (s.quizTotal ? Math.round(s.quizCorrect / s.quizTotal * 100) : 0) + '%';
    $(prefix + 'Bar').style.width = (s.quizIndex / s.words.length * 100) + '%';
  }

  function usageHtml(w) {
    var parts = [];
    var gram = global.Vocab.grammarLine(w);
    if (gram) parts.push('<span class="num">' + esc(gram) + '</span>');
    if (w.en) parts.push('EN ' + esc(w.en));
    var usage = global.Vocab.usageLine(w);
    if (usage) parts.push(esc(usage));
    return '<strong' + langAttr() + '>' + esc(global.Vocab.headword(w)) + '</strong> — ' + esc(w.zh) +
      (parts.length ? '<br><span class="muted">' + parts.join(' · ') + '</span>' : '');
  }

  // ---------- 选择题 ----------

  function renderQuiz() {
    var s = session;
    if (!s || s.mode !== 'quiz') return;
    if (s.quizIndex >= s.words.length) { finishSession(); return; }
    var w = s.currentWord = s.words[s.quizIndex];
    var eng = s.engine;
    var reverse = eng.isReverse();
    s.answered = false;

    $('quizPromptLabel').textContent = reverse ? '哪个词是这个意思？' : '这个词是什么意思？';
    var word = $('quizWord');
    word.textContent = reverse ? eng.questionTextFor(w) : global.Vocab.headword(w);
    word.classList.toggle('is-gloss', reverse);
    if (reverse) word.removeAttribute('lang'); else word.setAttribute('lang', global.Languages.code(s.lang));
    $('quizMeta').textContent = reverse ? (global.Vocab.POS_LABEL[w.pos] || '') : global.Vocab.grammarLine(w);
    $('quizSpeak').classList.toggle('hidden', !eng.shouldSpeakQuestion());

    var correct = eng.correctAnswerFor(w);
    var pool = global.QuizEngine.sampleDistractorPool(s.distractorSource, w, 800);
    eng.renderOptions(eng.generateOptions(correct, pool), onQuizAnswer);

    $('quizFeedback').classList.add('hidden');
    $('quizUsage').innerHTML = '';
    $('quizNextBtn').classList.add('hidden');
    s.hintStage = global.PracticeFlow.hintReset($('quizHint'), $('quizHintBtn'), '显示提示');
    sessionBar('quiz');
  }

  function onQuizAnswer(btn) {
    var s = session;
    if (!s || s.answered) return;
    s.answered = true;
    var index = s.quizIndex;
    var stats = Progress.statsFor(s.lang);
    s.startedAt = global.PracticeFlow.mcAnswer({
      lang: s.lang,
      engine: s.engine,
      button: btn,
      word: s.currentWord,
      state: s,
      stats: stats,
      recordMastery: function (w, ok) { s.engine.recordAnswer(w, ok); Progress.touch(s.key); },
      save: function () { Progress.touchStats(s.lang); },
      next: function () { if (session === s && s.quizIndex === index) nextQuestion(); },
      nextDelay: 1100,
      startedAt: s.startedAt
    });
    $('quizUsage').innerHTML = usageHtml(s.currentWord);
    $('quizNextBtn').classList.remove('hidden');
    $('quizHintBtn').classList.add('hidden');
    sessionBar('quiz');
  }

  function quizHintStages(s) {
    var w = s.currentWord;
    var reverse = s.engine.isReverse();
    return [
      { text: global.PracticeFlow.initialHint(reverse ? w.word : s.engine.displayGloss(w.zh)), label: '显示提示' },
      { text: w.en ? 'English: ' + w.en : '', label: '英文释义' },
      { text: reverse ? global.Vocab.grammarLine(w) : '', label: '词性' }
    ];
  }

  // ---------- 拼写 ----------

  function renderSpell() {
    var s = session;
    if (!s || s.mode !== 'spell') return;
    if (s.quizIndex >= s.words.length) { finishSession(); return; }
    var w = s.currentWord = s.words[s.quizIndex];
    s.answered = false;
    $('spellGloss').textContent = s.engine.displayGloss(w.zh);
    var meta = [global.Vocab.POS_LABEL[w.pos], w.gender && global.Vocab.GENDER_LABEL[w.gender], w.level].filter(Boolean);
    $('spellMeta').textContent = meta.join(' · ');
    var input = $('spellInput');
    input.value = '';
    input.disabled = false;
    input.classList.remove('ok', 'no');
    $('spellFeedback').classList.add('hidden');
    $('spellNextBtn').classList.add('hidden');
    $('spellSubmit').classList.remove('hidden');
    $('spellRevealBtn').classList.remove('hidden');
    s.hintStage = global.PracticeFlow.hintReset($('spellHint'), $('spellHintBtn'), '显示提示');
    sessionBar('spell');
    setTimeout(function () { input.focus(); }, 30);
  }

  function checkSpelling(reveal) {
    var s = session;
    if (!s || s.answered) return;
    var w = s.currentWord;
    var answer = $('spellInput').value;
    if (!reveal && !answer.trim()) return;
    var grade = reveal ? { status: 'wrong' } : global.Vocab.gradeSpelling(s.lang, answer, w);
    var ok = grade.status === 'correct';

    s.answered = true;
    s.quizTotal += 1;
    var stats = Progress.statsFor(s.lang);
    stats.spAttempts += 1;
    if (ok) { s.quizCorrect += 1; stats.spCorrect += 1; }
    s.engine.recordAnswer(w, ok);
    Progress.touch(s.key);
    Progress.touchStats(s.lang);
    s.startedAt = global.PracticeFlow.recordTelemetry(s.lang, { correct: ok, word: w, startedAt: s.startedAt });

    var head = global.Vocab.headword(w);
    var text;
    if (ok) text = '<span class="msr" aria-hidden="true">check_circle</span>正确' + (grade.note ? '<span class="muted"> · ' + esc(grade.note) + '</span>' : '');
    else if (grade.status === 'accent') text = '<span class="msr" aria-hidden="true">error</span>字母对了，重音不对：<strong' + langAttr(s.lang) + '>' + esc(head) + '</strong>';
    else text = '<span class="msr" aria-hidden="true">cancel</span>' + (reveal ? '答案是' : '正确拼写是') + '：<strong' + langAttr(s.lang) + '>' + esc(head) + '</strong>';

    var input = $('spellInput');
    input.disabled = true;
    input.classList.add(ok ? 'ok' : 'no');
    var fb = $('spellFeedback');
    fb.classList.remove('hidden', 'correct', 'incorrect');
    fb.classList.add(ok ? 'correct' : 'incorrect');
    $('spellFeedbackText').innerHTML = text;
    $('spellUsage').innerHTML = usageHtml(w);
    $('spellSubmit').classList.add('hidden');
    $('spellRevealBtn').classList.add('hidden');
    $('spellHintBtn').classList.add('hidden');
    $('spellNextBtn').classList.remove('hidden');
    $('spellNextBtn').focus();
    sessionBar('spell');
    Speaker.speak(head, s.lang);
  }

  function spellHintStages(s) {
    var w = s.currentWord;
    return [
      { text: global.PracticeFlow.initialHint(w.word), label: '显示提示' },
      { text: w.en ? 'English: ' + w.en : '', label: '英文释义' },
      { text: global.Vocab.grammarLine(w), label: '语法信息' }
    ];
  }

  // ---------- 通用 ----------

  function nextQuestion() {
    var s = session;
    if (!s) return;
    s.quizIndex += 1;
    if (s.mode === 'quiz') renderQuiz(); else renderSpell();
  }

  function finishSession() {
    var s = session;
    var prefix = s.mode === 'quiz' ? 'quiz' : 'spell';
    Progress.flush();
    var nowMastered = s.words.filter(function (w) { return s.mastered.has(w.word); }).length;
    var gained = Math.max(0, nowMastered - s.masteredAtStart);
    var acc = s.quizTotal ? Math.round(s.quizCorrect / s.quizTotal * 100) : 0;
    $(prefix + 'Bar').style.width = '100%';
    $(prefix + 'Body').classList.add('hidden');
    var done = $(prefix + 'Done');
    done.innerHTML =
      '<span class="kicker">本组完成</span>' +
      '<h2>' + (acc >= 90 ? 'Ottimo — 干得漂亮' : acc >= 60 ? '稳步前进' : '再来一组会更好') + '</h2>' +
      '<dl class="stat-strip compact">' +
        stat('答对', s.quizCorrect + ' / ' + s.quizTotal) +
        stat('正确率', acc + '%') +
        stat('新掌握', gained) +
      '</dl>' +
      '<div class="actions">' +
        '<button class="primary-btn" data-action="again" data-mode="' + s.mode + '">再来一组</button>' +
        '<button class="btn" data-go="vocabScreen">返回词汇</button>' +
      '</div>';
    done.classList.remove('hidden');
  }

  function stat(label, value, note) {
    return '<div class="stat"><dt>' + esc(label) + '</dt><dd class="num">' + esc(value) + '</dd>' +
      (note ? '<span class="stat-note">' + esc(note) + '</span>' : '') + '</div>';
  }

  // ==================== 首页 ====================

  function wordOfTheDay(l, offset) {
    var pool = global.Vocab.upToLevel(l, 'B1');
    if (!pool.length) pool = global.Vocab.entries(l);
    if (!pool.length) return null;
    var day = global.localDay() + l;
    var h = 0;
    for (var i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) >>> 0;
    return pool[(h + (offset || 0)) % pool.length];
  }

  /** hero 统计：mono 大数字 + data-count（lib/editorial.js 进场时从 0 数上来）。 */
  function heroStat(label, n) {
    return '<div><dt class="stat-label">' + esc(label) + '</dt>' +
      '<dd class="stat-num num" data-count="' + n + '">' + fmt(n) + '</dd></div>';
  }

  function renderHome() {
    var l = lang();
    var p = profile(l);
    var entries = global.Vocab.entries(l);
    var mastered = Progress.systemMastered(l);
    var due = countDue(l, entries);
    var streak = global.StatsManager ? global.StatsManager.getStreak(l) : 0;
    var counts = global.Vocab.levelCounts(l);
    var wotd = wordOfTheDay(l);
    var masteredPct = entries.length ? (mastered.size / entries.length * 100).toFixed(1) + '%' : '';

    var levelMastered = {};
    LEVELS.forEach(function (lv) { levelMastered[lv] = 0; });
    entries.forEach(function (e) { if (mastered.has(e.word)) levelMastered[e.level] = (levelMastered[e.level] || 0) + 1; });

    var html = '' +
      '<header class="hero">' +
        '<div class="hero-inner">' +
          '<div class="hero-copy">' +
            '<p class="kicker">' + esc(p.name) + ' · A1–C2</p>' +
            '<h1 class="hero-title"' + langAttr(l) + '>' + esc(p.motto) + '</h1>' +
            '<p class="hero-sub">' + esc(p.cn) + '词库 <span class="num">' + fmt(entries.length) + '</span> 条，按 CEFR A1–C2 分级。' +
              '选择题、拼写、浏览与打字游戏共用同一份进度；学习记录只保存在这台设备的浏览器里。</p>' +
            '<div class="hero-actions">' +
              '<button class="btn btn-primary" data-action="start" data-mode="quiz"><span class="msr" aria-hidden="true">play_arrow</span>开始一组练习</button>' +
              (due ? '<button class="btn btn-ghost" data-action="review"><span class="msr" aria-hidden="true">history</span>复习到期 <span class="num">' + fmt(due) + '</span></button>' : '') +
              '<button class="btn btn-ghost" data-go="vocabScreen">练习设置</button>' +
            '</div>' +
            '<dl class="hero-stats">' +
              heroStat('词条', entries.length) +
              heroStat('已掌握' + (masteredPct ? ' · ' + masteredPct : ''), mastered.size) +
              heroStat('待复习', due) +
              heroStat('连续学习 · 天', streak) +
            '</dl>' +
          '</div>' +
          (wotd ? renderHeroStack(wotd, l, p) : '') +
        '</div>' +
      '</header>' +
      '<section class="section" aria-labelledby="homeLevelsTitle"><div class="section-inner">' +
        '<div class="section-head reveal"><p class="kicker">CEFR · ' + esc(p.name) + '</p><h2 id="homeLevelsTitle">按等级学习</h2>' +
          '<p class="section-sub">每一级都是一份完整词表。点开即以该等级为练习范围。</p></div>' +
        '<div class="level-grid reveal-group">' + LEVELS.map(function (lv) {
          var total = counts[lv] || 0;
          var done = levelMastered[lv] || 0;
          var pct = total ? done / total * 100 : 0;
          return '<button class="card level-card reveal" data-action="level" data-level="' + lv + '"' + (total ? '' : ' disabled') + '>' +
            '<span class="level-code">' + lv + '</span>' +
            '<span class="card-label">' + LEVEL_NAMES[lv] + '</span>' +
            '<span class="card-desc">' + LEVEL_DESC[lv] + '</span>' +
            '<span class="card-meta"><span><span class="num">' + fmt(done) + '</span> / <span class="num">' + fmt(total) + '</span> 已掌握</span>' +
              '<span class="num">' + pct.toFixed(0) + '%</span></span>' +
            '<span class="progress-track"><span class="progress-fill" style="width:' + pct.toFixed(1) + '%"></span></span>' +
            '<span class="card-cta">' + (total ? '开始练习' : '暂无词条') + '</span>' +
          '</button>';
        }).join('') + '</div>' +
      '</div></section>' +
      '<section class="section section-alt" aria-labelledby="homeModulesTitle"><div class="section-inner">' +
        '<div class="section-head reveal"><p class="kicker">Moduli</p><h2 id="homeModulesTitle">学习模块</h2>' +
          '<p class="section-sub">词汇之外的模块按需下载，第一次打开时才加载数据。</p></div>' +
        '<div class="card-grid module-grid reveal-group">' + moduleCards(l, 'home') + '</div>' +
      '</div></section>' +
      '<section class="section" aria-labelledby="homeMethodTitle"><div class="section-inner">' +
        '<div class="section-head reveal"><p class="kicker">Metodo</p><h2 id="homeMethodTitle">怎么用</h2></div>' +
        '<ol class="method-steps reveal-group">' +
          '<li class="reveal"><span class="method-num num">01</span><h3>圈定范围</h3><p>按 CEFR 等级、系统词库或自己的单词本选出要练的词。</p></li>' +
          '<li class="reveal"><span class="method-num num">02</span><h3>做一组练习</h3><p>选择题、拼写、浏览、打字游戏任选，答题结果写进同一份进度。</p></li>' +
          '<li class="reveal"><span class="method-num num">03</span><h3>按时复习</h3><p>间隔重复算法给每个词排期；到期的词会出现在首页的「复习到期」里。</p></li>' +
        '</ol>' +
      '</div></section>';
    $('homeView').innerHTML = html;
  }

  /** hero 右侧：纯 CSS 的单词卡堆。后两张是装饰（aria-hidden），最前面一张是今日一词。 */
  function renderHeroStack(wotd, l, p) {
    var back = wordOfTheDay(l, 7);
    var mid = wordOfTheDay(l, 13);
    var sheet = function (cls, e, tagCls) {
      return '<div class="sheet ' + cls + '" aria-hidden="true">' +
        '<span class="sheet-tag' + (tagCls ? ' ' + tagCls : '') + '">' + esc(e && e.level ? e.level : p.code) + '</span>' +
        (e ? '<span class="sheet-word"' + langAttr(l) + '>' + esc(global.Vocab.headword(e)) + '</span>' +
             '<span class="sheet-gloss">' + esc(e.zh || '') + '</span>' : '') +
        '<span class="' + (cls === 'sheet-back' ? 'sheet-lines' : 'sheet-grid') + '"></span>' +
      '</div>';
    };
    return '<div class="hero-visual">' +
      '<div class="card-stack" id="heroStack">' +
        sheet('sheet-back', back !== wotd ? back : null) +
        sheet('sheet-mid', mid !== wotd ? mid : null, 'sheet-tag-red') +
        renderWotd(wotd, l) +
        '<span class="stamp" aria-hidden="true">' + esc(p.name) + '<br>CEFR<br>A1 · C2</span>' +
      '</div>' +
    '</div>';
  }

  function renderWotd(e, l) {
    return '<aside class="sheet sheet-front wotd" aria-label="今日一词">' +
      '<span class="sheet-tag sheet-tag-red">今日一词 · <span class="num">' + esc(e.level || '') + '</span></span>' +
      '<span class="cover-rule" aria-hidden="true"></span>' +
      '<div class="wotd-word"><span' + langAttr(l) + '>' + esc(global.Vocab.headword(e)) + '</span>' +
        '<button class="icon-btn speaker" data-speak="' + escAttr(global.Vocab.headword(e)) + '" aria-label="朗读"><span class="msr" aria-hidden="true">volume_up</span></button></div>' +
      '<p class="wotd-gram num">' + esc(global.Vocab.grammarLine(e)) + '</p>' +
      '<p class="wotd-gloss">' + esc(e.zh) + '</p>' +
      (e.en ? '<p class="wotd-en">' + esc(e.en) + '</p>' : '') +
    '</aside>';
  }

  /** 模块入口卡片：首页、语法页共用一份定义，按语言档案显示/隐藏。
   *  版式同等级卡：顶部粗线 · 衬线标题 · 金色 mono 标签 · 说明 · mono 计数行 · 小号幽灵按钮。 */
  function moduleCards(l, where) {
    var cards = [];
    var card = function (action, icon, title, label, desc, meta) {
      cards.push('<button class="card module-card reveal" data-action="' + action + '">' +
        '<span class="card-title">' + title + '</span>' +
        '<span class="card-label"><span class="msr" aria-hidden="true">' + icon + '</span>' + label + '</span>' +
        '<span class="card-desc">' + desc + '</span>' +
        (meta ? '<span class="card-meta">' + meta + '</span>' : '') +
        '<span class="card-cta">进入<span class="msr" aria-hidden="true">arrow_forward</span></span>' +
      '</button>');
    };
    if (where === 'home') {
      var total = global.Vocab.entries(l).length;
      var mastered = Progress.systemMastered(l).size;
      card('go-vocab', 'style', '词汇练习', 'Lessico', '选择题、拼写、浏览、打字游戏，外加个人单词本。',
        '<span class="num">' + fmt(total) + '</span> 词条');
      if (hasModule('grammar', l)) card('grammar-book', 'auto_stories', '语法书', 'Grammatica', '按章节查阅的' + profile(l).cn + '语法全书。', '目录 · 正文 · 例句');
      if (hasModule('conjugations', l)) card('conjugation', 'sync_alt', '动词变位', 'Coniugazione', '查任意动词的完整变位，或按时态分课练习。', '查询 · 选择题 · 填空');
      if (hasModule('collocations', l)) card('collocations', 'link', '动词搭配', 'Collocazioni', '动词与介词、宾语的固定搭配和例句。', '浏览 · 练习');
      if (hasModule('cognates', l)) card('cognates', 'join_inner', '同源词', 'Affini', '和英语长得像的词，借已有词汇量抄近路。', '按词形规律分组');
      if (hasModule('course', l)) card('course', 'route', '课程路线', 'Percorso', '按教材单元推进：每课的语法重点与核心词汇一一对应。', '按单元 · 按等级');
      card('go-progress', 'insights', '学习进度', 'Progressi', '每周走势、各等级掌握度与复习计划。',
        '已掌握 <span class="num">' + (total ? (mastered / total * 100).toFixed(1) : '0') + '%</span>');
    } else if (where === 'grammar') {
      if (hasModule('grammar', l)) card('grammar-book', 'auto_stories', '语法书', 'Grammatica', '按章节查阅，左侧目录，右侧正文。', '目录 · 正文 · 例句');
      if (hasModule('conjugations', l)) card('conjugation', 'sync_alt', '动词变位', 'Coniugazione', '变位查询；按课次选时态练习选择题与填空。', '查询 · 选择题 · 填空');
      if (hasModule('collocations', l)) {
        card('collocations', 'travel_explore', '动词搭配 · 浏览', 'Collocazioni', '按动词查搭配与例句。', '按介词 · 按动词');
        card('collocation-practice', 'extension', '动词搭配 · 练习', 'Esercizi', '看例句选出正确的介词或搭配。', '选择题 · 填空');
      }
      if (hasModule('course', l)) card('course', 'route', '课程路线', 'Percorso', '按教材单元查看语法重点并练习核心词汇。', '按单元 · 按等级');
    }
    return cards.join('');
  }

  // ==================== 词汇页 ====================

  function chip(label, attrs, active, count) {
    return '<button type="button" class="chip' + (active ? ' active' : '') + '" aria-pressed="' + (active ? 'true' : 'false') + '" ' + attrs + '>' +
      esc(label) + (count != null ? ' <span class="chip-count num">' + fmt(count) + '</span>' : '') + '</button>';
  }

  /** 中心页（词汇 / 语法 / 进度）的页头带：kicker · 衬线 h1 · 副标题，右侧可放按钮。 */
  function pageHero(kicker, title, sub, aside) {
    return '<header class="page-hero"><div class="section-inner page-hero-inner">' +
      '<div class="section-head"><p class="kicker">' + kicker + '</p>' +
        '<h1 class="page-title">' + title + '</h1>' +
        (sub ? '<p class="section-sub">' + sub + '</p>' : '') + '</div>' +
      (aside || '') +
    '</div></header>';
  }

  function renderVocab() {
    var l = lang();
    var p = profile(l);
    var pr = prefs(l);
    var books = global.Wordbooks.list(l);
    var src = currentSource(l);
    var mastered = Progress.mastered(src.key);
    var counts = global.Vocab.levelCounts(l);
    var due = countDue(l, src.entries);
    var masteredIn = 0;
    src.entries.forEach(function (e) { if (mastered.has(e.word)) masteredIn++; });
    var sessionN = pr.session === 'all' ? src.entries.length : Math.min(parseInt(pr.session, 10) || 20, src.entries.length);

    var sourceChips = chip('系统词库', 'data-source="system"', src.kind === 'system') +
      (books.length ? books.map(function (b) {
        return chip(b.name, 'data-source="wb:' + escAttr(b.id) + '"', src.kind === 'wordbook' && src.id === b.id, b.words.length);
      }).join('') : '') +
      (courseSelection && courseSelection.lang === l ? chip('课程：' + courseSelection.label, 'data-source="course"', src.kind === 'course', courseSelection.entries.length) : '');

    var levelRow = src.kind !== 'system' ? '' :
      '<div class="pref-row"><span class="pref-label">等级</span><div class="chips">' +
        chip('全部', 'data-level="all"', src.level === 'all', global.Vocab.entries(l).length) +
        LEVELS.filter(function (lv) { return counts[lv]; }).map(function (lv) {
          return chip(lv, 'data-level="' + lv + '" title="' + LEVEL_NAMES[lv] + '"', src.level === lv, counts[lv]);
        }).join('') +
      '</div></div>';

    var html = '' +
      pageHero(esc(p.name) + ' · Vocabolario', '词汇练习', '先选范围，再选练习方式。到期复习的词总是排在最前面。',
        '<dl class="hero-stats page-hero-stats">' +
          heroStat('本范围', src.entries.length) +
          heroStat('已掌握', masteredIn) +
          heroStat('待复习', due) +
        '</dl>') +
      '<section class="section" aria-labelledby="vocabScopeTitle"><div class="section-inner">' +
      '<div class="section-head"><p class="kicker">Ambito</p><h2 id="vocabScopeTitle">练习范围</h2></div>' +
      '<div class="vocab-layout">' +
        '<div class="panel setup-panel">' +
          '<div class="pref-row"><span class="pref-label">词源</span><div class="chips">' + sourceChips + '</div></div>' +
          levelRow +
          '<div class="pref-row"><span class="pref-label">筛选</span><div class="chips">' +
            chip('全部', 'data-filter="all"', pr.filter === 'all') +
            chip('未掌握', 'data-filter="new"', pr.filter === 'new') +
            chip('到期复习', 'data-filter="due"', pr.filter === 'due', due) +
          '</div></div>' +
          '<div class="pref-row"><span class="pref-label">每组</span><div class="segmented">' +
            SESSION_SIZES.map(function (n) {
              return '<button type="button" class="seg' + (pr.session === n ? ' active' : '') + '" aria-pressed="' + (pr.session === n) + '" data-session="' + n + '">' + (n === 'all' ? '全部' : n) + '</button>';
            }).join('') +
          '</div></div>' +
          '<p class="setup-summary num">' + esc(src.label) + ' · 共 ' + fmt(src.entries.length) + ' 词 · 已掌握 ' + fmt(masteredIn) +
            ' · 待复习 ' + fmt(due) + ' · 本组 ' + fmt(sessionN) + '</p>' +
        '</div>' +
        '<div class="panel wordbook-panel">' +
          '<div class="panel-title">我的单词本</div>' +
          (books.length ? '<ul class="wordbook-list">' + books.map(function (b) {
            return '<li class="wordbook-item' + (src.kind === 'wordbook' && src.id === b.id ? ' current' : '') + '">' +
              '<button class="wordbook-name" data-source="wb:' + escAttr(b.id) + '">' + esc(b.name) +
                ' <span class="num muted">' + fmt(b.words.length) + '</span></button>' +
              '<span class="wordbook-actions">' +
                '<button class="icon-btn" data-wb="edit" data-id="' + escAttr(b.id) + '" title="编辑"><span class="msr" aria-hidden="true">edit</span></button>' +
                '<button class="icon-btn" data-wb="export" data-id="' + escAttr(b.id) + '" title="导出"><span class="msr" aria-hidden="true">download</span></button>' +
                '<button class="icon-btn" data-wb="delete" data-id="' + escAttr(b.id) + '" title="删除"><span class="msr" aria-hidden="true">delete</span></button>' +
              '</span></li>';
          }).join('') + '</ul>' : '<p class="muted small">还没有' + esc(p.cn) + '单词本。可以新建、导入 TXT / JSON，或从社区下载。</p>') +
          '<div class="btn-row">' +
            '<button class="pill-btn" data-wb="new"><span class="msr" aria-hidden="true">add</span>新建</button>' +
            '<button class="pill-btn" data-wb="import"><span class="msr" aria-hidden="true">upload_file</span>导入</button>' +
            '<button class="pill-btn" data-action="community"><span class="msr" aria-hidden="true">groups</span>社区词书</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '</div></section>' +
      '<section class="section section-alt" aria-labelledby="vocabModesTitle"><div class="section-inner">' +
        '<div class="section-head reveal"><p class="kicker">Esercizi</p><h2 id="vocabModesTitle">练习方式</h2>' +
          '<p class="section-sub">都从上面圈定的范围里出题，结果写进同一份进度。</p></div>' +
        '<div class="card-grid mode-grid reveal-group">' +
          modeCard('quiz', 'quiz', '选择题', '看' + p.cn + '选释义，或反过来。1–4 选择，Enter 下一题。') +
          modeCard('spell', 'keyboard', '拼写', '看释义写出单词，' + ({ german: '名词大小写有提示。', french: '重音写错会单独指出。' }[profile(l).spell] || '支持特殊字母按键。')) +
          modeCard('browse', 'menu_book', '浏览', '搜索、按等级筛选、标记已掌握、加入单词本。') +
          modeCard('typing', 'sports_esports', '打字游戏', '单词顺流而下，看释义打字击落。') +
          (hasModule('cognates', l) ? modeCard('cognates', 'join_inner', '同源词', '和英语同源的词，按构词规律成组学习。') : '') +
        '</div></div></section>';
    $('vocabView').innerHTML = html;
  }

  var MODE_LABELS = { quiz: 'Scelta', spell: 'Dettato', browse: 'Lessico', typing: 'Gioco', cognates: 'Affini' };

  function modeCard(mode, icon, title, desc) {
    return '<button class="card module-card reveal" data-action="start" data-mode="' + mode + '">' +
      '<span class="card-title">' + title + '</span>' +
      '<span class="card-label"><span class="msr" aria-hidden="true">' + icon + '</span>' + (MODE_LABELS[mode] || '') + '</span>' +
      '<span class="card-desc">' + desc + '</span>' +
      '<span class="card-cta">开始<span class="msr" aria-hidden="true">arrow_forward</span></span></button>';
  }

  // ==================== 浏览 ====================

  var browse = { q: '', level: 'all', status: 'all', limit: BROWSE_PAGE, list: [] };
  // 搜索词和筛选是按语言的：切语言时清空，否则德语页会拿意大利语的搜索词过滤
  function resetBrowse() {
    browse.q = ''; browse.level = 'all'; browse.status = 'all'; browse.limit = BROWSE_PAGE; browse.list = [];
    var q = document.getElementById('browseSearch');
    if (q) q.value = '';
  }

  function renderBrowse() {
    var l = lang();
    var src = currentSource(l);
    var counts = global.Vocab.levelCounts(l);
    $('browseTitle').textContent = src.kind === 'system' ? profile(l).cn + '词库' : src.label;
    $('browseLevels').innerHTML = src.kind !== 'system' ? '' :
      chip('全部', 'data-browse-level="all"', browse.level === 'all') +
      LEVELS.filter(function (lv) { return counts[lv]; }).map(function (lv) {
        return chip(lv, 'data-browse-level="' + lv + '"', browse.level === lv);
      }).join('');
    $('browseStatus').innerHTML =
      chip('全部', 'data-browse-status="all"', browse.status === 'all') +
      chip('未掌握', 'data-browse-status="new"', browse.status === 'new') +
      chip('已掌握', 'data-browse-status="known"', browse.status === 'known');
    $('browseSearch').value = browse.q;
    browse.limit = BROWSE_PAGE;
    renderBrowseList();
  }

  function renderBrowseList() {
    var l = lang();
    var src = currentSource(l);
    var mastered = Progress.mastered(src.key);
    var q = browse.q.trim();
    var qKey = q ? global.Vocab.looseKey(q) : '';
    // 系统词库浏览全部等级（等级由上面的筛选控制），不受练习范围里选的等级限制
    var base = src.kind === 'system' ? global.Vocab.entries(l) : src.entries;
    var list = base.filter(function (e) {
      if (src.kind === 'system' && browse.level !== 'all' && e.level !== browse.level) return false;
      if (browse.status === 'new' && mastered.has(e.word)) return false;
      if (browse.status === 'known' && !mastered.has(e.word)) return false;
      if (!q) return true;
      return global.Vocab.looseKey(e.word).indexOf(qKey) >= 0 ||
        (e.display && global.Vocab.looseKey(e.display).indexOf(qKey) >= 0) ||
        String(e.zh || '').indexOf(q) >= 0 ||
        (e.en && e.en.toLowerCase().indexOf(q.toLowerCase()) >= 0);
    });
    // 搜索时把词头精确/前缀命中排在前面
    if (q) {
      var rank = function (e) {
        var k = global.Vocab.looseKey(e.word);
        return k === qKey ? 0 : k.indexOf(qKey) === 0 ? 1 : 2;
      };
      list = list.map(function (e, i) { return { e: e, r: rank(e), i: i }; })
        .sort(function (a, b) { return a.r - b.r || a.i - b.i; })
        .map(function (x) { return x.e; });
    }
    browse.list = list;
    $('browseCount').textContent = fmt(list.length) + ' 条';
    var shown = list.slice(0, browse.limit);
    $('browseList').innerHTML = shown.length ? shown.map(function (e, i) {
      var known = mastered.has(e.word);
      return '<li class="word-row' + (known ? ' known' : '') + '" data-i="' + i + '">' +
        '<div class="word-main">' +
          '<span class="word-head"' + langAttr() + '>' + esc(global.Vocab.headword(e)) + '</span>' +
          (e.level ? '<span class="tag">' + esc(e.level) + '</span>' : '') +
          '<span class="word-gram num">' + esc(global.Vocab.grammarLine(e)) + '</span>' +
        '</div>' +
        '<div class="word-gloss">' + esc(e.zh) + (e.en ? '<span class="muted"> · ' + esc(e.en) + '</span>' : '') + '</div>' +
        '<div class="word-actions">' +
          '<button class="icon-btn speaker" data-row="speak" aria-label="朗读"><span class="msr" aria-hidden="true">volume_up</span></button>' +
          '<button class="icon-btn" data-row="known" aria-pressed="' + known + '" title="' + (known ? '取消已掌握' : '标记已掌握') + '"><span class="msr" aria-hidden="true">' + (known ? 'task_alt' : 'radio_button_unchecked') + '</span></button>' +
          '<button class="icon-btn" data-row="add" title="加入单词本"><span class="msr" aria-hidden="true">bookmark_add</span></button>' +
        '</div></li>';
    }).join('') : '<li class="empty">没有匹配的词</li>';
    $('browseMore').classList.toggle('hidden', list.length <= browse.limit);
  }

  // ==================== 语法页 ====================

  function renderGrammar() {
    var l = lang();
    var p = profile(l);
    $('grammarView').innerHTML =
      pageHero(esc(p.name) + ' · Grammatica', '语法', '语法书用来查，变位与搭配用来练。数据在打开时才下载。') +
      '<section class="section" aria-labelledby="grammarModulesTitle"><div class="section-inner">' +
        '<div class="section-head reveal"><p class="kicker">Moduli</p><h2 id="grammarModulesTitle">' + esc(p.cn) + '语法模块</h2></div>' +
        '<div class="card-grid module-grid cols-2 reveal-group">' + moduleCards(l, 'grammar') + '</div>' +
      '</div></section>';
  }

  // ==================== 进度页 ====================

  function renderProgress() {
    var l = lang();
    var p = profile(l);
    var entries = global.Vocab.entries(l);
    var mastered = Progress.systemMastered(l);
    var stats = Progress.statsFor(l);
    var SM = global.StatsManager;
    var week = SM ? SM.getRecentStats(7, l) : [];
    var total = SM ? SM.getTotalStats(l) : { totalAttempts: 0, averageAccuracy: 0, totalDuration: 0 };
    var today = week.length ? week[week.length - 1] : { totalCount: 0, correctCount: 0 };
    var due = countDue(l, entries);
    var counts = global.Vocab.levelCounts(l);
    var byLevel = {};
    entries.forEach(function (e) { if (mastered.has(e.word)) byLevel[e.level] = (byLevel[e.level] || 0) + 1; });
    var maxDay = Math.max.apply(null, [1].concat(week.map(function (d) { return d.totalCount; })));
    var pct = function (a, b) { return b ? Math.round(a / b * 100) + '%' : '—'; };

    $('progressView').innerHTML =
      pageHero(esc(p.name) + ' · Progressi', '学习进度', '只统计' + esc(p.cn) + '。换语言请用顶栏的语言切换。',
        due ? '<div class="btn-row"><button class="btn btn-primary" data-action="review"><span class="msr" aria-hidden="true">history</span>复习到期 <span class="num">' + fmt(due) + '</span></button></div>' : '') +
      '<section class="section" aria-label="概览"><div class="section-inner">' +
      '<dl class="stat-strip">' +
        stat('已掌握', fmt(mastered.size), entries.length ? (mastered.size / entries.length * 100).toFixed(1) + '% 词库' : '') +
        stat('今日答题', fmt(today.totalCount), '正确率 ' + pct(today.correctCount, today.totalCount)) +
        stat('累计答题', fmt(total.totalAttempts), '正确率 ' + total.averageAccuracy + '%') +
        stat('连续学习', (SM ? SM.getStreak(l) : 0) + ' 天') +
      '</dl>' +
      '<div class="progress-grid">' +
        '<div class="panel"><div class="panel-title">最近 7 天</div>' +
          '<div class="week-bars">' + week.map(function (d) {
            var h = d.totalCount / maxDay * 100;
            var ok = d.totalCount ? d.correctCount / d.totalCount * 100 : 0;
            var date = global.parseLocalDay(d.date);
            return '<div class="week-bar' + (d.totalCount ? '' : ' is-empty') + '" title="' + escAttr(d.date + '：' + d.totalCount + ' 题，答对 ' + d.correctCount) + '">' +
              '<span class="week-value num">' + (d.totalCount || '') + '</span>' +
              '<span class="week-track"><span class="week-fill" style="height:' + h.toFixed(1) + '%"><span class="week-ok" style="height:' + ok.toFixed(1) + '%"></span></span></span>' +
              '<span class="week-label num">' + (date.getMonth() + 1) + '/' + date.getDate() + '</span></div>';
          }).join('') + '</div>' +
          '<p class="muted small">柱高 = 答题数，深色部分 = 答对。</p></div>' +
        '<div class="panel"><div class="panel-title">各等级掌握度</div>' +
          '<ul class="level-bars">' + LEVELS.filter(function (lv) { return counts[lv]; }).map(function (lv) {
            var done = byLevel[lv] || 0;
            var w = done / counts[lv] * 100;
            return '<li><span class="tag">' + lv + '</span>' +
              '<span class="progress-track"><span class="progress-fill" style="width:' + w.toFixed(1) + '%"></span></span>' +
              '<span class="num">' + fmt(done) + ' / ' + fmt(counts[lv]) + '</span></li>';
          }).join('') + '</ul></div>' +
        '<div class="panel"><div class="panel-title">练习方式</div>' +
          '<dl class="kv">' +
            '<dt>选择题</dt><dd class="num">' + fmt(stats.mcCorrect) + ' / ' + fmt(stats.mcAttempts) + ' · ' + pct(stats.mcCorrect, stats.mcAttempts) + '</dd>' +
            '<dt>拼写</dt><dd class="num">' + fmt(stats.spCorrect) + ' / ' + fmt(stats.spAttempts) + ' · ' + pct(stats.spCorrect, stats.spAttempts) + '</dd>' +
            '<dt>待复习</dt><dd class="num">' + fmt(due) + '</dd>' +
          '</dl>' +
          '<p class="muted small">连续答对两次记为已掌握；答错会退回未掌握，并按 SM-2 安排复习。</p></div>' +
      '</div>' +
      '</div></section>' +
      (global.StatsCharts ? '<section class="section section-alt progress-charts-band"><div class="section-inner">' +
        global.StatsCharts.sectionsHtml(l) + '</div></section>' : '');
    // 图表：Chart.js 在这里才懒加载（stats-charts.js）
    if (global.StatsCharts) global.StatsCharts.mount(l);
  }

  // ==================== 设置页 ====================

  function renderSettings() {
    var l = lang();
    var p = profile(l);
    var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    $('settingsPrefs').innerHTML =
      '<p class="muted small">以下两项只对' + esc(p.cn) + '生效。</p>' +
      global.QuizEngine.renderDifficultyToggle(l, '选择题难度') +
      global.QuizEngine.renderDirectionToggle(l, '出题方向') +
      '<div class="pref-row"><span class="pref-label">外观</span><div class="segmented" role="group" aria-label="外观">' +
        '<button type="button" class="seg' + (theme === 'light' ? ' active' : '') + '" data-theme-set="light">纸张</button>' +
        '<button type="button" class="seg' + (theme === 'dark' ? ' active' : '') + '" data-theme-set="dark">墨色</button>' +
      '</div></div>';
  }

  // ==================== 主题 ====================

  function applyTheme(theme) {
    var t = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#14201a' : '#f6f2e8');
    var btn = $('themeToggle');
    if (btn) {
      btn.setAttribute('aria-label', t === 'dark' ? '切换到浅色' : '切换到深色');
      btn.querySelector('.msr').textContent = t === 'dark' ? 'light_mode' : 'dark_mode';
    }
  }

  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
    if (Shell().current() === 'settingsScreen') renderSettings();
  }

  // ==================== 弹窗焦点 ====================

  var FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function visibleModals() {
    return Array.prototype.filter.call(document.querySelectorAll('.modal'), function (m) {
      return !m.classList.contains('hidden');
    });
  }

  /**
   * 所有 .modal 都是切 hidden class 显隐的，打开入口散在各模块里。这里统一接管焦点：
   * 打开时记下触发元素、焦点移进弹窗；Tab 在弹窗内循环；关闭时焦点还给触发元素。
   */
  function trapModalFocus() {
    var opener = new Map();
    var observer = new MutationObserver(function (records) {
      records.forEach(function (r) {
        var modal = r.target;
        var open = !modal.classList.contains('hidden');
        if (open && !opener.has(modal)) {
          opener.set(modal, document.activeElement);
          // 等打开方把内容渲染完（很多弹窗是先显示再同步填内容）
          global.setTimeout(function () {
            if (modal.classList.contains('hidden') || modal.contains(document.activeElement)) return;
            var first = modal.querySelector('.modal-body ' + FOCUSABLE.split(', ').join(', .modal-body ')) ||
              modal.querySelector(FOCUSABLE);
            if (first) first.focus();
          }, 0);
        } else if (!open && opener.has(modal)) {
          var back = opener.get(modal);
          opener.delete(modal);
          if (back && document.contains(back) && typeof back.focus === 'function' &&
            (!document.activeElement || document.activeElement === document.body || modal.contains(document.activeElement))) {
            back.focus();
          }
        }
      });
    });
    document.querySelectorAll('.modal').forEach(function (m) {
      observer.observe(m, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var open = visibleModals();
      if (!open.length) return;
      var modal = open[open.length - 1];
      var items = Array.prototype.filter.call(modal.querySelectorAll(FOCUSABLE), function (el) {
        return el.offsetParent !== null;
      });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (!modal.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  // ==================== 备份 / 重置 ====================

  function flushAll() {
    Progress.flush();
    if (global.DimenticatoUtils && global.DimenticatoUtils.flushAllPersisters) global.DimenticatoUtils.flushAllPersisters();
  }

  function exportAllData() {
    try {
      flushAll();
      var data = global.DimStorage.exportAll();
      if (!Object.keys(data.keys).length) {
        alert('目前还没有任何学习数据可以导出。\n\n先做几组练习，或导入一个自定义词本再试。');
        return;
      }
      var now = new Date();
      var pad = function (n) { return String(n).padStart(2, '0'); };
      var name = 'Dimenticato_学习数据_' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
        '_' + pad(now.getHours()) + pad(now.getMinutes()) + '.json';
      global.downloadFile(name, JSON.stringify(data, null, 2), 'application/json');
      var d = global.DimStorage.describePayload(data);
      alert('学习数据已导出：' + name + '\n\n' +
        (d.languages.length ? d.languages.join('，') : '暂无已掌握单词') + '\n单词本 ' + d.wordbooks + ' 个 · 共 ' + d.keys + ' 项数据');
    } catch (err) {
      console.error(err);
      alert('导出失败：' + err.message);
    }
  }

  function importAllData(file) {
    var reader = new FileReader();
    reader.onload = function (event) {
      var payload;
      try { payload = JSON.parse(event.target.result); } catch (err) {
        alert('文件不是有效的 JSON，无法导入。');
        return;
      }
      if (!payload || typeof payload !== 'object' || (!payload.keys && !payload.data)) {
        alert('这不是 Dimenticato 的备份文件。');
        return;
      }
      var mode = prompt('导入方式：\n\n1 - 覆盖（用备份替换本机同名数据）\n2 - 合并（保留两边的进度，取并集 / 较大值）\n\n请输入 1 或 2：', '2');
      if (mode !== '1' && mode !== '2') return;
      try {
        flushAll();
        var result = global.DimStorage.importAll(payload, { mode: mode === '1' ? 'overwrite' : 'merge' });
        global.DimStorage.LANGS.forEach(function (l) {
          if (global.Vocab.ready(l)) global.LegacyMigration.run(l);
        });
        var theme = localStorage.getItem(THEME_KEY);
        if (theme) applyTheme(theme);
        alert('导入完成' + (result && result.written != null ? '（写入 ' + result.written + ' 项）' : '') + '。\n\n页面将刷新以应用变更。');
        setTimeout(function () { location.reload(); }, 400);
      } catch (err) {
        console.error(err);
        alert('导入失败：' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // 语言切换按钮按 lib/languages.js 生成；index.html 里的静态按钮只是首帧占位
  function renderLangSwitch() {
    var box = document.querySelector('.lang-switch');
    if (!box) return;
    box.innerHTML = global.Languages.list.map(function (p) {
      return '<button type="button" data-lang="' + escAttr(p.key) + '" aria-pressed="false" title="' + escAttr(p.cn) + '">' +
        esc(p.code.toUpperCase()) + '</button>';
    }).join('');
  }

  function resetProgress() {
    var labels = global.DimStorage.LANGUAGE_LABELS;
    var scopes = global.DimStorage.LANGS.concat('all');
    var menu = scopes.map(function (s, i) { return (i + 1) + ' - ' + (s === 'all' ? '全部语言' : labels[s]); }).join('\n');
    var choice = prompt('要重置哪一部分的学习进度？\n\n' + menu +
      '\n\n单词本内容、主题和偏好设置不会被删除。请输入 1-' + scopes.length + '：');
    var scope = scopes[parseInt(String(choice || '').trim(), 10) - 1];
    if (!scope) return;
    var label = scope === 'all' ? '全部语言' : labels[scope];
    if (!confirm('确定要重置【' + label + '】的学习进度吗？此操作不可撤销。\n\n建议先导出一份备份。')) return;
    flushAll();
    var result = global.DimStorage.reset({ scope: scope });
    alert('【' + label + '】进度已重置（清除 ' + result.removed.length + ' 项）。\n\n页面将刷新以应用变更。');
    setTimeout(function () { location.reload(); }, 400);
  }

  // ==================== 提示条 ====================

  var toastTimer = null;
  function toast(message) {
    var el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  // ==================== 模块入口 ====================

  function Shell() { return global.Shell; }

  function openGrammarBook(l, slug) {
    l = global.Languages.key(l || lang());
    var go = function () {
      var gb = grammarBook();
      if (!gb) { toast('语法书模块未能加载'); return; }
      gb.init(grammarData(l), { lang: l });
      global.showScreen('grammarBookScreen');
      // 新旧 slug 都行：GrammarBook 经 meta.aliases 解析（深链接、课程里的引用）
      if (slug) gb.openTopic(slug);
    };
    if (grammarData(l)) go();
    else global.LangLoader.ensureModule(l, 'grammar').then(function () {
      if (lang() === l) go(); // 加载期间切走了语言就不再打开（否则会用旧语言渲染）
    });
  }

  var MODULE_OPENERS = {
    'grammar-book': function (l) { openGrammarBook(l); },
    conjugation: function (l) {
      if (global.ConjugationPractice) global.ConjugationPractice.openFor(l);
      else global.showScreen('conjugationSetupScreen');
    },
    collocations: function (l) { if (global.VerbCollocations) global.VerbCollocations.open(l); },
    'collocation-practice': function (l) { if (global.VerbCollocationPractice) global.VerbCollocationPractice.open(l); },
    cognates: function (l) { if (global.CognateApp) global.CognateApp.open(l); },
    typing: function (l) { if (global.TypingGameApp) global.TypingGameApp.open(l); },
    course: function (l) { if (global.Course) global.Course.open(l); },
    community: function () { if (global.CommunityWordbooks) global.CommunityWordbooks.showBrowseScreen(); }
  };

  function openModule(name) {
    var fn = MODULE_OPENERS[name];
    if (!fn) return;
    try { fn(lang()); } catch (err) {
      console.error('[app] 打开模块失败：' + name, err);
      toast('模块打开失败，请刷新后重试');
    }
  }

  // ==================== 语言切换 ====================

  var SECTION_ROOTS = { homeScreen: 1, vocabScreen: 1, browseScreen: 1, grammarScreen: 1, progressScreen: 1, settingsScreen: 1 };

  function syncLangSwitch() {
    var l = lang();
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === l ? 'true' : 'false');
    });
    var p = profile(l);
    document.documentElement.setAttribute('lang', 'zh-CN');
    document.title = 'Dimenticato · ' + p.cn + '词汇与语法';
  }

  function setLanguage(l, opts) {
    opts = opts || {};
    var key = global.Languages.key(l);
    if (!key) return Promise.resolve();
    var changed = key !== lang();
    if (changed) {
      Progress.flush();
      session = null;
      resetBrowse();
      document.body.setAttribute('data-language', key);
      try { localStorage.setItem(LANGUAGE_KEY, key); } catch (e) { /* ignore */ }
      syncLangSwitch();
    }
    return global.LangLoader.ensure(key).then(function () {
      // 加载期间用户又切到了别的语言：那次 setLanguage 会自己负责渲染
      if (lang() !== key) return;
      if (opts.skipRoute) return;
      var current = Shell().current() || 'homeScreen';
      var meta = Shell().SCREENS[current] || {};
      var target = opts.screen || (SECTION_ROOTS[current] ? current
        : meta.section === 'grammar' ? 'grammarScreen'
          : meta.section === 'vocab' ? 'vocabScreen' : 'homeScreen');
      global.showScreen(target, { keepScroll: target === current });
    });
  }

  // ==================== 渲染调度 ====================

  var RENDERERS = {
    homeScreen: renderHome,
    vocabScreen: renderVocab,
    browseScreen: renderBrowse,
    grammarScreen: renderGrammar,
    progressScreen: renderProgress,
    settingsScreen: renderSettings
  };

  function renderScreen(id) {
    var fn = RENDERERS[id];
    if (!fn) return;
    if (!global.Vocab.ready(lang())) {
      var host = document.querySelector('#' + id + ' [data-view]');
      if (host) host.innerHTML = '<p class="empty">' + esc(profile().cn) + '词库没有加载成功。请检查网络后刷新页面。</p>';
      return;
    }
    try { fn(); } catch (err) { console.error('[app] 渲染失败：' + id, err); }
  }

  // ==================== 事件 ====================

  function bind() {
    document.addEventListener('click', function (event) {
      var t = event.target;
      if (!t.closest) return;

      var langBtn = t.closest('[data-lang]');
      if (langBtn) { setLanguage(langBtn.getAttribute('data-lang')); closeNav(); return; }

      var navLink = t.closest('[data-nav-screen]');
      if (navLink) {
        event.preventDefault();
        global.showScreen(navLink.getAttribute('data-nav-screen'));
        closeNav();
        return;
      }

      var go = t.closest('[data-go]');
      if (go) { global.showScreen(go.getAttribute('data-go')); return; }

      var speak = t.closest('[data-speak]');
      if (speak) { Speaker.speak(speak.getAttribute('data-speak')); return; }

      if (t.closest('[data-back]')) { global.goBack(); return; }

      var themeSet = t.closest('[data-theme-set]');
      if (themeSet) { setTheme(themeSet.getAttribute('data-theme-set')); return; }

      var closeModal = t.closest('[data-close-modal]');
      if (closeModal) { closeModal.closest('.modal').classList.add('hidden'); return; }
      if (t.classList.contains('modal')) { t.classList.add('hidden'); return; }

      var action = t.closest('[data-action]');
      if (action) { onAction(action.getAttribute('data-action'), action); return; }

      if (onVocabClick(t)) return;
      onBrowseClick(t);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var open = Array.prototype.filter.call(document.querySelectorAll('.modal'), function (m) {
        return !m.classList.contains('hidden');
      });
      if (open.length) { open[open.length - 1].classList.add('hidden'); return; }
      // 手机菜单展开时 Esc 收起，焦点回到菜单按钮
      if (document.body.classList.contains('nav-open')) {
        closeNav();
        var t = $('navToggle');
        if (t) t.focus();
      }
    });

    trapModalFocus();

    $('themeToggle').addEventListener('click', function () {
      setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    $('navToggle').addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      $('navToggle').setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // 选择题
    $('quizNextBtn').addEventListener('click', nextQuestion);
    $('quizSpeak').addEventListener('click', function () {
      if (session && session.currentWord) Speaker.speak(global.Vocab.headword(session.currentWord), session.lang);
    });
    $('quizHintBtn').addEventListener('click', function () {
      if (!session) return;
      session.hintStage = global.PracticeFlow.hintAdvance(session.hintStage, {
        stages: quizHintStages(session), hintEl: $('quizHint'), btn: $('quizHintBtn')
      });
    });

    // 拼写
    $('spellForm').addEventListener('submit', function (event) {
      event.preventDefault();
      if (session && session.answered) nextQuestion();
      else checkSpelling(false);
    });
    $('spellNextBtn').addEventListener('click', nextQuestion);
    $('spellRevealBtn').addEventListener('click', function () { checkSpelling(true); });
    $('spellSpeakBtn').addEventListener('click', function () {
      if (session && session.currentWord && session.answered) Speaker.speak(global.Vocab.headword(session.currentWord), session.lang);
      else toast('答完之后才能听发音');
    });
    $('spellHintBtn').addEventListener('click', function () {
      if (!session) return;
      session.hintStage = global.PracticeFlow.hintAdvance(session.hintStage, {
        stages: spellHintStages(session), hintEl: $('spellHint'), btn: $('spellHintBtn')
      });
    });

    // 浏览
    var onSearch = global.debounce(function () {
      browse.q = $('browseSearch').value;
      browse.limit = BROWSE_PAGE;
      renderBrowseList();
    }, 160);
    $('browseSearch').addEventListener('input', onSearch);
    $('browseMore').addEventListener('click', function () { browse.limit += BROWSE_PAGE; renderBrowseList(); });

    // 设置
    $('settingsExportBtn').addEventListener('click', exportAllData);
    $('settingsImportBtn').addEventListener('click', function () { $('importDataFileInput').click(); });
    $('importDataFileInput').addEventListener('change', function (event) {
      var file = event.target.files[0];
      if (file) importAllData(file);
      event.target.value = '';
    });
    $('settingsResetBtn').addEventListener('click', resetProgress);

    // 单词本导入
    $('wordbookFileInput').addEventListener('change', function (event) {
      var file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      global.Wordbooks.importFile(file, lang()).then(function (res) {
        if (!res) return;
        setPrefs({ source: 'wb:' + res.wordbook.id });
        toast((res.isMerge ? '已合并到「' : '已导入「') + res.wordbook.name + '」');
        renderVocab();
      }).catch(function (err) { alert('导入失败：' + err.message); });
    });

    // 单词本编辑器工具栏
    $('wordbookEditorModal').addEventListener('click', function (event) {
      var btn = event.target.closest('[data-editor]');
      if (!btn) return;
      var E = global.WordbookEditor;
      var what = btn.getAttribute('data-editor');
      if (what === 'add') E.addNewWord();
      else if (what === 'batch-import') E.batchImportWords();
      else if (what === 'export' && E.current) E.showExportDialog(E.current.id);
      else if (what === 'batch-delete') E.batchDelete();
      else if (what === 'close') E.hideEditorModal();
    });
    $('wordEditDialog').addEventListener('click', function (event) {
      if (event.target.closest('[data-editor="cancel-word"]')) global.WordbookEditor.hideWordEditDialog();
    });

    // 语法书的返回键（grammar-book.js 只管内容；变位页的返回键由 conjugation-app.js 自己绑定）
    var gbBack = $('grammarBookBackBtn');
    if (gbBack) gbBack.addEventListener('click', function () { global.goBack(); });

    document.addEventListener('dimenticato:wordbooks', function () {
      var current = Shell().current();
      if (current === 'vocabScreen' || current === 'browseScreen') renderScreen(current);
    });
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    var t = $('navToggle');
    if (t) t.setAttribute('aria-expanded', 'false');
  }

  function onAction(action, el) {
    var l = lang();
    switch (action) {
      case 'start': {
        var mode = el.getAttribute('data-mode');
        if (mode === 'quiz' || mode === 'spell') startSession(mode);
        else if (mode === 'browse') global.showScreen('browseScreen');
        else openModule(mode);
        return;
      }
      case 'again':
        startSession(el.getAttribute('data-mode'));
        return;
      case 'review': {
        var due = global.SpacedRepetition.getDueWords(l, global.Vocab.entries(l));
        if (!due.length) { toast('目前没有到期要复习的词'); return; }
        startSession('quiz', { entries: due, key: Progress.systemKey(l), label: '到期复习' });
        return;
      }
      case 'level':
        setPrefs({ level: el.getAttribute('data-level'), source: 'system' });
        global.showScreen('vocabScreen');
        return;
      case 'go-vocab': global.showScreen('vocabScreen'); return;
      case 'go-progress': global.showScreen('progressScreen'); return;
      case 'help':
        $('helpModal').classList.remove('hidden');
        return;
      case 'community-upload':
        if (global.CommunityWordbooks) global.CommunityWordbooks.showUploadDialog();
        return;
      case 'community-upload-close': global.CommunityWordbooks.hideUploadDialog(); return;
      case 'community-preview-close': global.CommunityWordbooks.hidePreviewModal(); return;
      case 'community-back': global.CommunityWordbooks.backToWelcome(); return;
      case 'community-file-pick': $('uploadFileInput').click(); return;
      default:
        openModule(action);
    }
  }

  function onVocabClick(t) {
    if (!t.closest('#vocabScreen')) return false;
    var source = t.closest('[data-source]');
    if (source) { setPrefs({ source: source.getAttribute('data-source') }); renderVocab(); return true; }
    var level = t.closest('[data-level]');
    if (level) { setPrefs({ level: level.getAttribute('data-level') }); renderVocab(); return true; }
    var filter = t.closest('[data-filter]');
    if (filter) { setPrefs({ filter: filter.getAttribute('data-filter') }); renderVocab(); return true; }
    var size = t.closest('[data-session]');
    if (size) { setPrefs({ session: size.getAttribute('data-session') }); renderVocab(); return true; }
    var wb = t.closest('[data-wb]');
    if (!wb) return false;
    var l = lang();
    var id = wb.getAttribute('data-id');
    switch (wb.getAttribute('data-wb')) {
      case 'new': {
        var created = global.WordbookEditor.createNewWordbook(l);
        if (created) { setPrefs({ source: 'wb:' + created.id }); global.WordbookEditor.openEditor(created.id); renderVocab(); }
        break;
      }
      case 'import': $('wordbookFileInput').click(); break;
      case 'edit': global.WordbookEditor.openEditor(id); break;
      case 'export': global.WordbookEditor.showExportDialog(id); break;
      case 'delete': {
        var book = global.Wordbooks.get(id);
        if (book && confirm('删除单词本「' + book.name + '」及其学习进度？此操作不可撤销。')) {
          global.Wordbooks.remove(id);
          if (prefs(l).source === 'wb:' + id) setPrefs({ source: 'system' });
          renderVocab();
        }
        break;
      }
    }
    return true;
  }

  function onBrowseClick(t) {
    if (!t.closest('#browseScreen')) return;
    var lv = t.closest('[data-browse-level]');
    if (lv) { browse.level = lv.getAttribute('data-browse-level'); renderBrowse(); return; }
    var st = t.closest('[data-browse-status]');
    if (st) { browse.status = st.getAttribute('data-browse-status'); renderBrowse(); return; }
    var btn = t.closest('[data-row]');
    if (!btn) return;
    var row = btn.closest('.word-row');
    var e = browse.list[Number(row.getAttribute('data-i'))];
    if (!e) return;
    var what = btn.getAttribute('data-row');
    if (what === 'speak') Speaker.speak(global.Vocab.headword(e));
    else if (what === 'add') global.WordbookEditor.addEntryToWordbook(e, lang());
    else if (what === 'known') {
      var src = currentSource();
      var set = Progress.mastered(src.key);
      var known = !set.has(e.word);
      if (known) set.add(e.word); else set.delete(e.word);
      Progress.touch(src.key);
      row.classList.toggle('known', known);
      btn.setAttribute('aria-pressed', String(known));
      btn.querySelector('.msr').textContent = known ? 'task_alt' : 'radio_button_unchecked';
    }
  }

  // ==================== 对外 ====================

  var routerStarted = false;

  var App = {
    lang: lang,
    toast: toast,
    speak: function (text, l) { Speaker.speak(text, l); },
    setLanguage: setLanguage,
    openGrammarBook: openGrammarBook,
    openModule: openModule,
    masteredWords: function (l) { return Progress.systemMastered(l || lang()); },
    startSession: startSession,

    /** 课程路线：把一个单元的核心词作为练习来源，进入词汇页。 */
    practiceEntries: function (label, entries) {
      var l = lang();
      courseSelection = { lang: l, label: label, entries: (entries || []).filter(Boolean) };
      setPrefs({ source: 'course' });
      global.showScreen('vocabScreen');
    },

    /** LangLoader：某门语言的词库到位（首屏或中途切换）。幂等。 */
    onLanguageData: function (l) {
      try { global.LegacyMigration.run(l); } catch (err) { console.error('[app] 旧进度迁移失败', err); }
      Progress.forget(l);
      if (!routerStarted) {
        routerStarted = true;
        global.DimRouter.start();
        return;
      }
      if (l === lang()) renderScreen(Shell().current());
    },

    /** 模块数据到位后刷新首页上的数字。 */
    refreshCounts: function () {
      var current = Shell() && Shell().current();
      if (current === 'homeScreen') renderScreen(current);
    },

    init: function () {
      if (App._inited) return;
      App._inited = true;
      var theme = null;
      try { theme = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
      applyTheme(theme || 'light');
      document.body.setAttribute('data-language', global.LangLoader.detectLanguage());
      renderLangSwitch();
      syncLangSwitch();
      $('spellKeys').innerHTML = '';
      Speaker.init();
      bind();
      Shell().onEnter(function (id) {
        renderScreen(id);
        if (id === 'spellScreen') {
          // 特殊字母键盘：按键不抢焦点（手机上失焦会收起软键盘），见 Languages.mountAccentKeys
          global.Languages.mountAccentKeys($('spellKeys'), $('spellInput'), lang());
          $('spellInput').setAttribute('lang', global.Languages.code(lang()));
        }
      });

      // 深链接直达功能模块屏时，由各模块自己的 open 负责装数据再切屏
      var R = Shell().registerOpener;
      R('grammarBookScreen', function (l, slug) { openGrammarBook(l, slug); });
      R('conjugationSetupScreen', function (l) { MODULE_OPENERS.conjugation(l); });
      R('verbCollocationsScreen', function (l) { MODULE_OPENERS.collocations(l); });
      R('typingGameScreen', function (l) { MODULE_OPENERS.typing(l); });
      R('cognatePracticeScreen', function (l) {
        if (hasModule('cognates', l)) MODULE_OPENERS.cognates(l); else global.showScreen('vocabScreen', { replaceRoute: true });
      });
      R('communityBrowseScreen', function () { MODULE_OPENERS.community(); });
      R('courseScreen', function (l) {
        if (hasModule('course', l)) MODULE_OPENERS.course(l); else global.showScreen('homeScreen', { replaceRoute: true });
      });
    }
  };

  // ReviewSession：stats-charts 等旧调用方用它取「当前语言的词表」
  global.ReviewSession = {
    wordsFor: function (l) { return global.Vocab.entries(l || lang()); },
    onAnswered: function () { /* 复习计数在 SpacedRepetition 里，界面在切屏时刷新 */ }
  };

  global.App = App;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.init);
  else App.init();
})(window);
