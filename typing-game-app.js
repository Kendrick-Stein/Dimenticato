/**
 * Dimenticato - 激流勇进打字游戏 (typing game app)
 *
 * 四门语言共用一块「打字游戏」屏：单词/变位题顺流而下，打字击落。
 * 内容池按语言实时从懒加载数据构建：
 *   背单词     prompt=中文释义  sub=英语释义   answer=外语单词
 *   动词变位   prompt=动词原形  sub=时态·人称   answer=变位形式
 * 与 lib/typing-game.js（纯引擎）配合：本文件负责数据、DOM、路由与本地纪录。
 *
 * 接线：
 *   - App 的词汇模式卡片（及任何 [data-typing-game-lang] 按钮）→ TypingGameApp.open(lang)；
 *   - 深链接 #/<code>/vocab/typing 由 Shell 路由的 opener 调 open(lang)；
 *   - typingGameScreen 在统一屏幕树里，父级是 vocabScreen。
 * 背单词的词源是 Vocab.entries(lang)（schema v1），四门语言同一套字段。
 */
(function (global) {
  'use strict';

  const STORAGE_PREFIX = 'dimenticato_typing_';
  const SPEECH_LANG = { italian: 'it-IT', german: 'de-DE', english: 'en-US', french: 'fr-FR' };
  const LANG_CN = { italian: '意大利语', german: '德语', english: '英语', french: '法语' };

  // 变位数据都是顶层 const，parse 期碰不到，一律调用时解析
  function lateGlobal(name) {
    if (global[name] !== undefined) return global[name];
    try {
      switch (name) {
        case 'CONJUGATION_ALL_TENSES_DATA': return CONJUGATION_ALL_TENSES_DATA;
        case 'GERMAN_CONJUGATION_DATA': return GERMAN_CONJUGATION_DATA;
        case 'FRENCH_CONJUGATION_DATA': return FRENCH_CONJUGATION_DATA;
        case 'ENGLISH_CONJUGATION_DATA': return ENGLISH_CONJUGATION_DATA;
        default: return null;
      }
    } catch (err) {
      return null;
    }
  }

  function $id(id) { return document.getElementById(id); }

  // ==================== 内容池构建 ====================

  // 拉丁扩展区（含变音符、德语的 äöüß、法语的 éèêëçœæ 等），过滤掉纯符号/乱码答案
  const VALID_ANSWER = /[a-zA-Z\u00C0-\u024F]/;

  function clean(entries) {
    const seen = new Set();
    const out = [];
    for (const e of entries) {
      const answer = String(e.answer || '').trim();
      const prompt = String(e.prompt || '').trim();
      if (!answer || !prompt) continue;
      if (answer.length < 2 || answer.length > 30) continue;
      if (/\d/.test(answer)) continue;
      if (!VALID_ANSWER.test(answer)) continue;
      const key = answer.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        answer: answer,
        prompt: prompt.slice(0, 18),
        // 34 字符：变位模式的「人称 · 时态标签」需要这个宽度（26 会把时态
        // 切到只剩一半）；气泡宽度本身会按文字自适应，上限只防极端长释义。
        sub: String(e.sub || '').trim().slice(0, 34),
        // SM-2 store 按 entry.word 索引。德语的 answer 是带冠词的 display
        //（"der Mann"），词头是 "Mann"；按 answer 写 SRS 会生成孤儿条目。
        srsKey: String(e.srsKey || answer).trim()
      });
    }
    return out;
  }

  // 答案 = Vocab.headword(e)（德语是带冠词的 display，如 "der Mann"），
  // 释义 = e.zh，SRS / 统计键 = e.word（词头唯一键）。
  function vocabEntries(lang) {
    const V = global.Vocab;
    if (!V) return [];
    return clean(V.entries(lang).map((e) => ({
      answer: V.headword(e),
      srsKey: e.word,
      prompt: e.zh || e.en || '',
      sub: e.en || ''
    })));
  }

  const PERSON_CN = {
    italian: { io: '我', tu: '你', lui_lei: '他/她', noi: '我们', voi: '你们', loro: '他们' },
    german: { ich: '我', du: '你', er_sie_es: '他/她/它', wir: '我们', ihr: '你们', sie: '他们/您' },
    french: { je: '我', tu: '你', il_elle_on: '他/她/on', nous: '我们', vous: '您/你们', ils_elles: '他们/她们' },
    // 英语变位数据的人称键是 i/you/he_she_it/we/you_pl/they（与意语键不同），
    // 此前按意语键查表全部落空，题面会显示原始键名（"he_she_it"）。
    english: { i: '我', you: '你', he_she_it: '他/她/它', we: '我们', you_pl: '你们', they: '他们' }
  };

  function conjEntries(lang) {
    const data = {
      italian: lateGlobal('CONJUGATION_ALL_TENSES_DATA'),
      german: lateGlobal('GERMAN_CONJUGATION_DATA'),
      french: lateGlobal('FRENCH_CONJUGATION_DATA'),
      english: lateGlobal('ENGLISH_CONJUGATION_DATA')
    }[lang];
    if (!data || !data.length) return [];
    const persons = PERSON_CN[lang] || {};
    const out = [];
    const verbCap = lang === 'english' ? data.length : Math.min(300, data.length);
    for (let vi = 0; vi < verbCap; vi++) {
      const v = data[vi];
      if (!v || !v.tenses) continue;
      for (const tk of Object.keys(v.tenses)) {
        const t = v.tenses[tk];
        if (!t || !t.forms) continue;
        const label = (t.group_label || '') + (t.tense_label ? ' ' + t.tense_label : '');
        if (t.type === 'person') {
          for (const pk of Object.keys(t.forms)) {
            const f = String(t.forms[pk] || '').trim();
            if (!f || f.length > 40) continue;
            // 人称放最前：变位标签（"Indicative Present simple"）较长，
            // 放前面的话人称会被 clean() 的长度截断整个切掉，题面就无法区分人称。
            out.push({
              answer: f,
              prompt: String(v.infinitive).slice(0, 18),
              sub: (persons[pk] || pk) + ' · ' + label
            });
          }
        } else if (t.type === 'single') {
          const forms = Array.isArray(t.forms) ? t.forms : [];
          forms.forEach((f, idx) => {
            const s = String(f || '').trim();
            if (!s || s.length > 40) return;
            out.push({
              answer: s,
              prompt: String(v.infinitive).slice(0, 18),
              sub: label + (forms.length > 1 ? ' · ' + (idx + 1) : '')
            });
          });
        }
      }
    }
    return clean(out);
  }

  // ==================== 本地纪录 ====================

  function bestKey(lang, mode) { return STORAGE_PREFIX + 'best_' + lang + '_' + mode; }

  function getBest(lang, mode) {
    try { return Number(localStorage.getItem(bestKey(lang, mode))) || 0; }
    catch (err) { return 0; }
  }

  function saveBest(lang, mode, score) {
    try {
      if (score > getBest(lang, mode)) localStorage.setItem(bestKey(lang, mode), String(score));
    } catch (err) { /* 隐私模式忽略 */ }
  }

  // ==================== 游戏会话 ====================

  let session = null; // { lang, mode, difficulty, game, renderer, speak }

  function difficultyConfig(key) {
    switch (key) {
      case 'hard': return { label: '困难', baseSpeed: 125, baseInterval: 1150 };
      case 'normal': return { label: '普通', baseSpeed: 95, baseInterval: 1600 };
      default: return { label: '简单', baseSpeed: 72, baseInterval: 2100 };
    }
  }

  function speak(text) {
    try {
      if (session && session.speak && typeof global.speechSynthesis !== 'undefined') {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = SPEECH_LANG[session.lang] || 'it-IT';
        u.rate = 0.95;
        global.speechSynthesis.speak(u);
      }
    } catch (err) { /* 朗读失败不影响游戏 */ }
  }

  // ==================== 学习遥测 ====================

  // 击落 / 沉底都是真实的学习事件：接进 StatsManager（每日统计）和
  // SpacedRepetition（SM-2），打字游戏不再游离在学习闭环外 —— 此前打得
  // 再多也不计每日统计、不影响复习调度。
  // 变位模式只记统计：变位形式（'sto' / 'stehe auf'）不是词头，写进按
  // 词头索引的 SRS store 会污染调度。
  function recordOutcome(answer, correct) {
    if (!session || !answer) return;
    const key = (session.srsKeys && session.srsKeys.get(answer)) || answer;
    try {
      if (window.StatsManager) {
        window.StatsManager.recordActivity(session.lang, {
          correct: correct ? 1 : 0,
          total: 1,
          durationMs: 0,   // 单词耗时无意义；整局时长随 gameover 不重复计
          words: [key]
        });
      }
      if (session.mode === 'vocab' && window.SpacedRepetition) {
        // 击落 = 记得（q4）；沉底 = 想不起来（q2，SM-2 重置间隔尽快安排复习）
        window.SpacedRepetition.review(session.lang, key, correct ? 4 : 2);
      }
    } catch (err) { /* 遥测失败绝不影响游戏 */ }
  }

  // ==================== DOM 渲染 ====================

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }

  function renderSetup() {
    if (!session) return;
    const { lang } = session;
    const cn = LANG_CN[lang] || lang;
    const bestVocab = getBest(lang, 'vocab');
    const bestConj = getBest(lang, 'conjugation');
    const el = $id('typingGameSetup');
    if (!el) return;

    el.innerHTML =
      '<div class="typing-mode-chips" role="tablist">' +
        '<button type="button" class="chip active" data-typing-mode="vocab">📚 背单词</button>' +
        '<button type="button" class="chip" data-typing-mode="conjugation">🔄 动词变位</button>' +
      '</div>' +
      '<div class="typing-options">' +
        '<div class="typing-opt-label">难度</div>' +
        '<div class="chips">' +
          '<button type="button" class="chip active" data-typing-diff="easy">🌊 简单</button>' +
          '<button type="button" class="chip" data-typing-diff="normal">⛵ 普通</button>' +
          '<button type="button" class="chip" data-typing-diff="hard">🌪️ 困难</button>' +
        '</div>' +
        '<label class="typing-check">' +
          '<input type="checkbox" id="typingSpeakToggle" checked> 击落时朗读单词发音' +
        '</label>' +
      '</div>' +
      '<div class="typing-records">' +
        '<div class="typing-record"><span>背单词最佳</span><b>' + fmt(bestVocab) + '</b></div>' +
        '<div class="typing-record"><span>变位最佳</span><b>' + fmt(bestConj) + '</b></div>' +
      '</div>' +
      '<button class="primary-btn typing-start-btn" id="typingStartBtn">' +
        '<span class="msr" aria-hidden="true">sports_esports</span> 开始激流勇进' +
      '</button>' +
      '<p class="typing-tip">单词会从上方顺流而下，看释义、打单词把它击落！' +
      '输入时无需按回车，打完整就自动击落；输到一半按回车可提前提交。' +
      '重音符号可以省略（é 可输入 e）。沉底的单词会扣一条命，共 3 条命。</p>';

    // 每门语言一句玩法提示
    const tip = $id('typingGameDesc');
    if (tip) {
      tip.textContent = cn + '单词顺流而下，看释义、打字击落！共 3 条命，支持背单词与动词变位两种玩法。';
    }

    // 模式/难度切换
    el.querySelectorAll('[data-typing-mode]').forEach((b) => {
      b.addEventListener('click', () => {
        el.querySelectorAll('[data-typing-mode]').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
      });
    });
    el.querySelectorAll('[data-typing-diff]').forEach((b) => {
      b.addEventListener('click', () => {
        el.querySelectorAll('[data-typing-diff]').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
      });
    });

    $id('typingStartBtn').addEventListener('click', () => startGame());

    const play = $id('typingGamePlay');
    const overlay = $id('typingGameOverlay');
    if (play) play.classList.add('hidden');
    if (overlay) overlay.classList.add('hidden');
  }

  function hud() {
    const g = session && session.game;
    if (!g) return;
    const set = (id, v) => { const el = $id(id); if (el) el.textContent = v; };
    set('typingHudScore', fmt(g.score));
    set('typingHudCombo', g.streak >= 2 ? '×' + g.streak : '—');
    set('typingHudLevel', 'Lv.' + g.level);
    set('typingHudCleared', g.cleared);
    const hearts = $id('typingHudLives');
    if (hearts) {
      hearts.textContent = '';
      for (let i = 0; i < g.lives; i++) {
        const s = document.createElement('span');
        s.className = 'typing-heart';
        s.textContent = '❤';
        hearts.appendChild(s);
      }
      for (let i = 0; i < (session && session.maxLives ? session.maxLives - g.lives : 0); i++) {
        const s = document.createElement('span');
        s.className = 'typing-heart lost';
        s.textContent = '🖤';
        hearts.appendChild(s);
      }
    }
  }

  function showGameOver(stats) {
    const overlay = $id('typingGameOverlay');
    if (!overlay || !session) return;
    const { lang, mode } = session;
    const prevBest = getBest(lang, mode);
    saveBest(lang, mode, stats.score);
    const isRecord = stats.score > prevBest && stats.score > 0;
    const modeLabel = mode === 'conjugation' ? '动词变位' : '背单词';
    const diff = difficultyConfig(session.difficulty).label;

    overlay.innerHTML =
      '<div class="typing-overlay-card">' +
        '<h2>🌊 本轮结束</h2>' +
        '<div class="typing-final-score">' + fmt(stats.score) + '</div>' +
        '<div class="typing-overlay-stats">' +
          '<div><span>击落单词</span><b>' + stats.cleared + '</b></div>' +
          '<div><span>沉底漏掉</span><b>' + stats.missed + '</b></div>' +
          '<div><span>最长连击</span><b>' + stats.bestStreak + '</b></div>' +
          '<div><span>用时</span><b>' + stats.duration + 's</b></div>' +
        '</div>' +
        '<p class="typing-overlay-meta">' + LANG_CN[lang] + ' · ' + modeLabel + ' · ' + diff +
        (isRecord ? ' · <b class="typing-new-record">🏆 新纪录！</b>' : '') + '</p>' +
        '<p class="typing-overlay-best">历史最佳：' + fmt(Math.max(prevBest, stats.score)) + '</p>' +
        '<div class="typing-overlay-actions">' +
          '<button class="primary-btn" id="typingRestartBtn"><span class="msr" aria-hidden="true">replay</span> 再来一局</button>' +
          '<button class="pill-btn" id="typingBackSetupBtn"><span class="msr" aria-hidden="true">settings</span> 返回设置</button>' +
        '</div>' +
      '</div>';
    overlay.classList.remove('hidden');

    $id('typingRestartBtn').addEventListener('click', () => {
      stopGame();
      startGame();
    });
    $id('typingBackSetupBtn').addEventListener('click', () => {
      stopGame();
      renderSetup();
    });
  }

  // ==================== 游戏生命周期 ====================

  function startGame() {
    if (!session) return;
    // 用遍历 + classList 判断激活态，避免依赖 `[data-x].active` 复合选择器
    //（无头垫片只支持单段选择器；浏览器两种写法都行）
    let mode = 'vocab', diff = 'easy';
    const setupEl = $id('typingGameSetup');
    if (setupEl) {
      const modeBtn = Array.prototype.find.call(
        setupEl.querySelectorAll('[data-typing-mode]'),
        (b) => b.classList.contains('active')
      );
      const diffBtn = Array.prototype.find.call(
        setupEl.querySelectorAll('[data-typing-diff]'),
        (b) => b.classList.contains('active')
      );
      if (modeBtn) mode = modeBtn.dataset.typingMode;
      if (diffBtn) diff = diffBtn.dataset.typingDiff;
    }
    const speakToggle = $id('typingSpeakToggle');

    const entries = mode === 'conjugation' ? conjEntries(session.lang) : vocabEntries(session.lang);
    if (!entries.length) {
      // 变位数据是按模块懒加载的（随开随拉），拉到后自动重试开局
      if (mode === 'conjugation' && window.LangLoader
        && typeof window.LangLoader.ensureModule === 'function'
        && !window.LangLoader.isModuleLoaded(session.lang, 'conjugations')) {
        const lang = session.lang;
        window.LangLoader.ensureModule(lang, 'conjugations').then(() => {
          if (session && session.lang === lang) startGame();
        });
        return;
      }
      const tip = $id('typingGameDesc');
      if (tip) tip.textContent = '该语言的' + (mode === 'conjugation' ? '变位数据' : '词汇数据') + '还没加载好，稍等片刻再试，或先切换到另一门语言。';
      return;
    }

    stopGame();

    const cfg = difficultyConfig(diff);
    session.mode = mode;
    session.difficulty = diff;
    session.speak = !speakToggle || speakToggle.checked;
    session.maxLives = 3;
    session.srsKeys = new Map(entries.map((e) => [e.answer, e.srsKey || e.answer]));

    const canvas = $id('typingGameCanvas');
    const input = $id('typingGameInput');
    const play = $id('typingGamePlay');
    const setup = $id('typingGameSetup');

    const game = global.TypingGame.create({
      canvas: canvas || null,
      pool: entries,
      baseSpeed: cfg.baseSpeed,
      baseInterval: cfg.baseInterval,
      lives: session.maxLives,
      onEvent: function (type, payload) {
        handleEvent(type, payload);
      }
    });
    session.game = game;

    // 先显示游戏区再量尺寸：隐藏容器 clientWidth 为 0，首帧坐标会挤在左侧
    if (play) play.classList.remove('hidden');
    if (setup) setup.classList.add('hidden');
    // 「再来一局」直接走 startGame，不经过 renderSetup（那里才会收起浮层）；
    // 不在这里隐藏的话，深色模糊的结算浮层会一直盖住新开的这局。
    const overlay = $id('typingGameOverlay');
    if (overlay) overlay.classList.add('hidden');

    // 画布尺寸：先按 CSS 布局给一个初始值，之后由 Renderer 每帧按
    // clientWidth × DPR 自适应（含窗口缩放），这里只保证首帧前逻辑坐标可用。
    const wrap = $id('typingGameCanvasWrap');
    const cw = wrap && wrap.clientWidth ? wrap.clientWidth : 760;
    const ch = wrap && wrap.clientHeight ? Math.min(480, wrap.clientHeight) : 420;
    game.resize(Math.max(300, cw), Math.max(280, ch));

    if (canvas) {
      session.renderer = global.TypingGame.Renderer.attach(game, canvas);
    } else {
      // 无 canvas（极端环境）：退化为按固定步长驱动逻辑
      if (session._logicTimer) clearInterval(session._logicTimer);
      session._logicTimer = setInterval(() => game.tick(50), 50);
    }

    hud();
    game.start();
    if (input) {
      input.value = '';
      try { input.focus(); } catch (err) { /* ignore */ }
    }
  }

  function stopGame() {
    if (session && session.game) {
      if (session.renderer) session.renderer.detach();
      session.game.stop();
      session.game = null;
      session.renderer = null;
    }
    if (session && session._logicTimer) {
      clearInterval(session._logicTimer);
      session._logicTimer = null;
    }
    if (session) session.speak = false;
  }

  function handleEvent(type, payload) {
    if (!session) return;
    const input = $id('typingGameInput');
    switch (type) {
      case 'clear':
        hud();
        if (session.renderer && payload.item) {
          session.renderer.burst(payload.item.x, payload.item.y - 20, '#ffd54f', '+' + payload.points);
        }
        speak(payload.item.answer);
        recordOutcome(payload.item.answer, true);
        break;
      case 'miss':
        hud();
        if (input) {
          input.classList.remove('typing-shake');
          void input.offsetWidth;
          input.classList.add('typing-shake');
        }
        recordOutcome(payload.item && payload.item.answer, false);
        break;
      case 'wrong':
        if (input) {
          input.classList.remove('typing-shake');
          void input.offsetWidth;
          input.classList.add('typing-shake');
        }
        hud();
        break;
      case 'levelup':
        hud();
        break;
      case 'gameover':
        showGameOver(payload);
        break;
      default:
        break;
    }
  }

  // ==================== 对外 API ====================

  const TypingGameApp = {
    open: function (lang, opts) {
      opts = opts || {};
      lang = lang || (typeof global.getActiveLanguage === 'function' && global.getActiveLanguage()) || 'italian';
      if (session) stopGame();
      session = { lang: lang, mode: 'vocab', difficulty: 'easy', game: null, renderer: null, speak: true, maxLives: 3 };
      renderSetup();
      const eyebrow = $id('typingGameEyebrow');
      if (eyebrow) eyebrow.textContent = (LANG_CN[lang] || lang) + ' / Typing Game';
      if (!opts.skipNavigate && typeof global.showScreen === 'function') {
        global.showScreen('typingGameScreen', {});
      }
    },

    getActiveLanguage: function () {
      return session ? session.lang : null;
    },

    /** 当前会话（含 game 实例），供测试与调试 */
    getSession: function () {
      return session;
    },

    /** 路由/切屏离开时调用；也挂在 dimenticato:screenchange 上 */
    close: function () {
      if (session) {
        stopGame();
        session = null;
      }
    }
  };

  global.TypingGameApp = TypingGameApp;

  // ==================== 全局接线 ====================

  // 1) 任何带 data-typing-game-lang 的入口按钮（委托）
  document.addEventListener('click', function (event) {
    const btn = event.target && event.target.closest
      ? event.target.closest('[data-typing-game-lang]')
      : null;
    if (!btn) return;
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    TypingGameApp.open(btn.dataset.typingGameLang);
    document.body.classList.remove('drawer-open');
  }, true);

  // 2) 游戏屏内输入框：回车提交 / 实时同步
  document.addEventListener('DOMContentLoaded', function () {
    const input = $id('typingGameInput');
    if (!input) return;
    input.addEventListener('input', function () {
      if (session && session.game) session.game.setInput(input.value);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (session && session.game) session.game.submit();
      } else if (e.key === 'Escape') {
        input.value = '';
        if (session && session.game) session.game.setInput('');
      }
    });
    $id('typingGameBackBtn').addEventListener('click', function () {
      if (typeof global.goBack === 'function') global.goBack({ fallbackTarget: 'vocabScreen' });
    });

    // 离开本屏即停局（含浏览器后退）
    document.addEventListener('dimenticato:screenchange', function (e) {
      const detail = e && e.detail;
      if (!detail || detail.screenId !== 'typingGameScreen') {
        if (session && session.game) stopGame();
      }
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
