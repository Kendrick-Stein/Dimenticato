/**
 * 按语言懒加载数据文件。
 *
 * 背景：index.html 原来用 36 个静态 <script defer> 一次性拉全部数据，首屏 29.5 MB
 * 全部阻塞；德/法内容分支合入后会到 70 MB。但只学意大利语的人根本用不到德/法/英词库。
 *
 * 拆分口径（按实测体积）：
 *   共享代码 0.25 MB · 意大利语 14.8 MB · 德语 20.2 MB · 法语 25.4 MB · 英语 8.9 MB
 * 首屏只付「共享代码 + 当前语言」，切语言时再补。
 *
 * 三个让这件事成立的既有事实（逐条核实过，不是假设）：
 *   1. index.html 里有一段 readyState 伪装 shim，把「守卫式 init」和「裸 DOMContentLoaded
 *      监听」两类模块统一成了在 DOMContentLoaded 时初始化。所以只要把那道闸门从
 *      「真事件」挪到「语言包就绪」，全部模块的初始化时机和顺序就逐字不变。
 *   2. 绝大多数数据引用是**惰性**的（函数体内 `typeof X !== 'undefined' ? X : 兜底`），
 *      后到的数据自动生效，不需要任何通知机制。
 *   3. 词库到位后由 App.onLanguageData(lang) 统一接手（迁移旧进度、刷新界面），
 *      它是幂等的，所以首屏与中途切语言走同一条路。
 *
 * 注入时统一设 `script.async = false`：动态插入的脚本默认是 async（乱序执行），
 * 显式关掉才能拿到「并行下载 + 按插入顺序执行」，而 load-order 在本项目是承重的。
 * 数据文件是顶层 `const`，动态注入的 classic script 同样进全局词法环境，裸标识符照样
 * 读得到 —— 这也是为什么这里绝不能改成 type="module"。
 */
(function (global) {
  'use strict';

  // 数据文件清单来自 lib/languages.js 的 profile.files（它以 <script defer> 先于本文件执行）：
  //   files.vocab —— 词库，每门语言恰好一个 data/vocab/<code>.js（schema v1），外加该语言独有的附加数据；
  //   其余键 —— 二级懒加载：变位 / 语法书 / 动词搭配 / 同源词只在对应模块被打开时才拉。
  // 这些模块文件合计比词库本身还大（意语变位 8.9MB、德语变位 10.4MB、法语变位 9.3MB），
  // 但只属于「进那个模块才用得上」的数据；boot 只付词库的钱。
  // 消费方（conjugation-app / grammar-book / verb-collocations / cognate-app /
  // typing-game-app）全都以 `typeof X !== 'undefined'` 惰性取数，openFor/init
  // 里检测到数据缺席时调 ensureModule 补拉后重试即可。
  var Languages = global.Languages;
  var DATA = {};
  var MODULES = {};
  Languages.list.forEach(function (p) {
    Object.keys(p.files || {}).forEach(function (name) {
      if (name === 'vocab') { DATA[p.key] = p.files.vocab; return; }
      (MODULES[name] = MODULES[name] || {})[p.key] = p.files[name];
    });
  });

  // 共享代码，按依赖顺序执行（数据已在代码之前注入）。
  // lib/* 是与语言无关的核心；根目录的 *-app.js 等是可选功能模块；
  // app.js 是统一运行时，最后装配。
  var CODE = [
    'lib/utils.js',
    'lib/vocab.js',
    'lib/storage.js',
    'lib/srs.js',
    'lib/word-similarity.js',
    'lib/quiz-engine.js',
    'lib/practice-flow.js',
    'lib/typing-game.js',
    'lib/shell.js',
    'lib/wordbooks.js',
    'supabase-config.js',
    'community-wordbooks.js',
    'cognate-app.js',
    'typing-game-app.js',
    'german-course.js',
    'conjugation-app.js',
    'stats-charts.js',
    'grammar-book.js',
    'verb-collocations.js',
    'verb-collocations-practice.js',
    'app.js'
  ];

  // 某语言的词库到位后交给统一运行时（迁移旧进度、刷新界面）。幂等。
  function runInitHook(lang) {
    if (global.App && typeof global.App.onLanguageData === 'function') {
      global.App.onLanguageData(lang);
    }
  }

  var LANGS = Object.keys(DATA);
  var pending = {};    // lang -> Promise，同一门语言只加载一次
  var loaded = {};     // lang -> true
  var modulePending = {}; // 'lang/module' -> Promise
  var moduleLoaded = {};  // 'lang/module' -> true（含加载失败后短暂的「已尝试」，见 ensureModule）
  var fileOk = {};     // src -> true：已成功执行过的文件，重试时跳过（顶层 const 不能执行两次）
  var failed = [];     // 加载失败的文件，供诊断

  // 失败后「已尝试」标记保留多久。消费方的守卫是「没加载过就补拉，拉完立刻重试一次」，
  // 紧接着的这次重试必须看到「已尝试」才会走降级 UI 而不是再拉；之后清掉，
  // 用户下次打开该模块（或切回该语言）时会重新拉取失败的文件。
  var RETRY_AFTER_MS = 1500;

  function inject(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false; // 动态脚本默认 async=true（乱序），必须显式关掉
      s.onload = function () { fileOk[src] = true; resolve(true); };
      s.onerror = function () {
        // 数据缺失不致命：消费方都有 typeof 守卫，会走降级分支。
        // 吞掉是为了让单个文件缺席不连累整门语言、更不连累别的语言。
        failed.push(src);
        console.warn('[lang-loader] 加载失败：' + src);
        resolve(false);
      };
      document.head.appendChild(s);
    });
  }

  function injectAll(list) {
    // 一次性全部 append：async=false 保证按 append 顺序执行，同时并行下载。
    // 已成功执行过的文件不再注入（重试时只补失败的那几个）。
    return Promise.all(list.map(function (src) {
      return fileOk[src] ? Promise.resolve(true) : inject(src);
    }));
  }

  function allOk(results) { return results.indexOf(false) === -1; }

  var LangLoader = {
    DATA: DATA,
    CODE: CODE,

    isLoaded: function (lang) { return !!loaded[lang]; },
    getFailed: function () { return failed.slice(); },

    /** 确保 lang 的数据已就位，并在首次就位后补跑该语言的初始化。 */
    ensure: function (lang) {
      if (!lang || LANGS.indexOf(lang) === -1) return Promise.resolve(false);
      if (loaded[lang]) {
        // 切回已加载的语言也发 done：别的语言还在加载时拉起的遮罩要撤掉
        this._emit('done', { lang: lang, ok: true, cached: true });
        return Promise.resolve(true);
      }
      if (pending[lang]) return pending[lang];

      this._emit('start', { lang: lang });
      pending[lang] = injectAll(DATA[lang]).then(function (results) {
        var ok = allOk(results);
        // 失败时不标记已加载：下次切到这门语言会重拉失败的文件
        if (ok) loaded[lang] = true;
        delete pending[lang];
        if (ok) {
          LangLoader.runInit(lang);
          LangLoader.syncCounts();
        }
        LangLoader._emit('done', { lang: lang, ok: ok });
        return ok;
      });
      return pending[lang];
    },

    /** 模块数据（同源词等）到位后刷新页面上的规模数字。 */
    syncCounts: function () {
      if (global.App && typeof global.App.refreshCounts === 'function') {
        try { global.App.refreshCounts(); } catch (err) { /* 文案刷新失败不影响功能 */ }
      }
    },

    /** 补跑某语言的初始化。hook 自带幂等判据，重复调用是安全的。 */
    runInit: function (lang) {
      try { runInitHook(lang); } catch (err) {
        console.error('[lang-loader] ' + lang + ' 初始化失败', err);
      }
    },

    /**
     * 首屏引导：加载「当前语言的数据 + 全部共享代码」，然后放行 readyState 闸门
     * 并派发合成 DOMContentLoaded，让所有模块按原顺序初始化。
     */
    boot: function () {
      var lang = this.detectLanguage();
      loaded[lang] = true; // boot 语言的数据随本次注入一起到位
      this._emit('start', { lang: lang, boot: true });

      // 数据在前、代码在后，一次性 append —— 并行下载、顺序执行。
      var all = DATA[lang].concat(CODE);
      return injectAll(all).then(function (results) {
        // 词库文件失败时撤掉「已加载」，之后切回这门语言会重拉
        if (!allOk(results.slice(0, DATA[lang].length))) delete loaded[lang];
        if (global.__ReadyGate) global.__ReadyGate.release();
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: false }));
        LangLoader.runInit(lang);
        LangLoader._emit('done', { lang: lang, boot: true });
        return lang;
      });
    },

    /** 确保 lang 的某个功能模块（变位/语法/搭配/同源词）数据已就位。幂等。 */
    ensureModule: function (lang, module) {
      var key = lang + '/' + module;
      var files = MODULES[module] && MODULES[module][lang];
      if (!files) return Promise.resolve(false);
      if (moduleLoaded[key]) return Promise.resolve(true);
      if (modulePending[key]) return modulePending[key];

      this._emit('module:start', { lang: lang, module: module });
      modulePending[key] = injectAll(files).then(function (results) {
        var ok = allOk(results);
        delete modulePending[key];
        // 无论成败都先标记已尝试：消费方的守卫会重试一次 openFor/init，
        // 数据仍缺席则走各自的「数据未加载」降级 UI，不会死循环。
        // 失败时稍后撤销标记，下次打开该模块会重拉。
        moduleLoaded[key] = true;
        if (!ok) global.setTimeout(function () { delete moduleLoaded[key]; }, RETRY_AFTER_MS);
        LangLoader.syncCounts(); // 首页数据集计数随数据到位刷新
        LangLoader._emit('module:done', { lang: lang, module: module, ok: ok });
        return ok;
      });
      return modulePending[key];
    },

    isModuleLoaded: function (lang, module) {
      return !!moduleLoaded[lang + '/' + module];
    },

    MODULES: MODULES,

    /** 空闲时预取，失败无所谓。 */
    prefetch: function (lang) {
      if (loaded[lang] || pending[lang]) return;
      var run = function () { LangLoader.ensure(lang); };
      if (global.requestIdleCallback) global.requestIdleCallback(run, { timeout: 5000 });
      else global.setTimeout(run, 3000);
    },

    /** 首屏该加载哪门语言：URL hash 优先于上次选择。 */
    detectLanguage: function () {
      var m = String(global.location.hash || '').match(/^#\/([a-z]{2})\b/);
      if (m && Languages.has(m[1])) return Languages.key(m[1]);
      try {
        var saved = global.localStorage.getItem('dimenticato_language');
        if (saved && LANGS.indexOf(saved) !== -1) return saved;
      } catch (err) { /* 隐私模式下 localStorage 会抛 */ }
      return Languages.DEFAULT_KEY;
    },

    _handlers: [],
    on: function (fn) { this._handlers.push(fn); },
    _emit: function (type, detail) {
      for (var i = 0; i < this._handlers.length; i++) {
        try { this._handlers[i](type, detail); } catch (err) { /* 监听器不许影响加载 */ }
      }
    }
  };

  global.LangLoader = LangLoader;
})(window);
