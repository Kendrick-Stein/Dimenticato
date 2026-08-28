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
 *   3. 少数会把数据**快照**进实例的 init（GermanApp / EnglishApp / GermanCourse /
 *      FrenchApp）在数据缺席时都是「打日志 + 显示错误卡 + return」，**在绑定任何事件之前**
 *      就退出了。所以数据补到之后补跑一次 init，是它们的第一次绑定，不会重复绑。
 *
 * 注入时统一设 `script.async = false`：动态插入的脚本默认是 async（乱序执行），
 * 显式关掉才能拿到「并行下载 + 按插入顺序执行」，而 load-order 在本项目是承重的。
 * 数据文件是顶层 `const`，动态注入的 classic script 同样进全局词法环境，裸标识符照样
 * 读得到 —— 这也是为什么这里绝不能改成 type="module"。
 */
(function (global) {
  'use strict';

  var DATA = {
    italian: [
      'vocabulary.js'
    ],
    german: [
      'data/german-vocabulary.js',
      'data/german-course-data.js'
    ],
    english: [
      'data/english-vocabulary.js'
    ],
    french: [
      'data/french-vocabulary.js',
      'data/french-vocabulary-core.js',
      'data/french-vocabulary-glossary.js'
    ]
  };

  // 二级懒加载：变位 / 语法书 / 动词搭配 / 同源词只在对应模块被打开时才拉。
  // 这些文件合计比词库本身还大（意语变位 8.9MB、德语变位 10.4MB、法语变位 9.3MB），
  // 但只属于「进那个模块才用得上」的数据；boot 只付词库的钱。
  // 消费方（conjugation-app / grammar-book / verb-collocations / cognate-app /
  // typing-game-app）全都以 `typeof X !== 'undefined'` 惰性取数，openFor/init
  // 里检测到数据缺席时调 ensureModule 补拉后重试即可。
  var MODULES = {
    conjugations: {
      italian: ['data/conjugations-all-tenses.js', 'data/conjugations-presente.js'],
      german: ['data/german-conjugations.js'],
      english: ['data/english-conjugations.js'],
      french: ['data/french-conjugations.js']
    },
    grammar: {
      italian: ['data/grammar-data.js'],
      german: ['data/german-grammar-data.js'],
      english: ['data/english-grammar-data.js'],
      french: ['data/french-grammar-data.js']
    },
    collocations: {
      italian: ['data/verb-collocations-data.js'],
      german: ['data/german-collocations-data.js'],
      french: ['data/french-collocations-data.js']
    },
    cognates: {
      italian: ['data/cognates.js'],
      german: ['data/german-cognates.js'],
      french: ['data/french-cognates.js']
    }
  };

  // 与原 index.html 中的相对顺序完全一致。数据已在代码之前注入，
  // 比原来「数据与代码交错」的顺序约束更强，所以是安全的。
  var CODE = [
    'lib/utils.js',
    'lib/word-similarity.js',
    'lib/quiz-engine.js',
    'lib/practice-flow.js',
    'lib/typing-game.js',
    'lib/navigation.js',
    'lib/router.js',
    'supabase-config.js',
    'community-wordbooks.js',
    'cognate-app.js',
    'typing-game-app.js',
    'app.js',
    'app-enhanced.js',
    'german-app.js',
    'german-course.js',
    'french-app.js',
    'conjugation-app.js',
    'stats-charts.js',
    'grammar-book.js',
    'verb-collocations.js',
    'verb-collocations-practice.js'
  ];

  // 数据补到之后要补跑的初始化。只有这四处会把数据快照进实例，
  // 其余模块都是调用时才读数据，不需要任何处理。
  //
  // 判据统一用「实例里有没有词」而不是自定义标志位：这几个 init **只会**因为缺数据
  // 而失败，且成功时必然把数据快照进实例，所以「有词 == 初始化成功过」是可靠的。
  // 因此下面每个 hook 都可以安全地重复调用，不会重复绑定事件。
  // （注意不能写 `!app.systemWords`：它的初值是 [] ，`![]` 为 false，守卫会永远不成立。）
  function hasWords(app) {
    return !!(app && app.systemWords && app.systemWords.length);
  }

  function dropErrorCard(id) {
    var node = document.getElementById(id);
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  var INIT_HOOKS = {
    german: function () {
      var app = global.GermanApp;
      if (!app || app.ready) return;
      app.init();
      if (!app.ready) return;
      dropErrorCard('germanVocabularyLoadError');
      // GermanCourse.init() 要求 GermanApp.ready，所以只在德语词库刚就位这一次补跑；
      // 它自己没有幂等标志，重复调用会把课程交互再绑一遍。
      if (global.GermanCourse) global.GermanCourse.init();
    },
    english: function () {
      // EnglishApp 住在 german-app.js 里，正常由 GermanApp.init() 级联启动。
      // 没有德语词库时 GermanApp 会提前退出，级联断掉，所以这里直接点火。
      // 传进去的 GermanApp 只被当作 showScreen / setText 等 DOM 工具用，
      // 不依赖它自身 init 是否成功。
      var app = global.EnglishApp;
      if (!app || hasWords(app)) return;
      app.init(global.GermanApp);
      if (hasWords(app)) dropErrorCard('englishVocabularyLoadError');
    },
    french: function () {
      var app = global.FrenchApp;
      if (app && !hasWords(app)) app.init();
    },
    italian: function () {
      var state = global.AppState;
      var ready = state && state.vocabulary && state.vocabulary.length;
      if (!ready && typeof global.loadVocabulary === 'function') global.loadVocabulary();
    }
  };

  var LANGS = Object.keys(DATA);
  var pending = {};    // lang -> Promise，同一门语言只加载一次
  var loaded = {};     // lang -> true
  var modulePending = {}; // 'lang/module' -> Promise
  var moduleLoaded = {};  // 'lang/module' -> true（含加载失败后的「已尝试」）
  var failed = [];     // 加载失败的文件，供诊断

  function inject(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false; // 动态脚本默认 async=true（乱序），必须显式关掉
      s.onload = function () { resolve(true); };
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
    return Promise.all(list.map(inject));
  }

  var LangLoader = {
    DATA: DATA,
    CODE: CODE,

    isLoaded: function (lang) { return !!loaded[lang]; },
    getFailed: function () { return failed.slice(); },

    /** 确保 lang 的数据已就位，并在首次就位后补跑该语言的初始化。 */
    ensure: function (lang) {
      if (!lang || LANGS.indexOf(lang) === -1) return Promise.resolve(false);
      if (loaded[lang]) return Promise.resolve(true);
      if (pending[lang]) return pending[lang];

      this._emit('start', { lang: lang });
      pending[lang] = injectAll(DATA[lang]).then(function () {
        loaded[lang] = true;
        delete pending[lang];
        LangLoader.runInit(lang);
        LangLoader.syncCounts();
        LangLoader._emit('done', { lang: lang });
        return true;
      });
      return pending[lang];
    },

    /**
     * 各处「词库规模」文案由 ShellExtras.syncDatasetCounts() 从数据实时渲染，
     * 但它只在首屏跑一次；懒加载下别的语言是后到的，不重刷就会一直停在
     * index.html 里写死的旧数字。
     */
    syncCounts: function () {
      var shell = global.ShellExtras;
      if (shell && typeof shell.syncDatasetCounts === 'function') {
        try { shell.syncDatasetCounts(); } catch (err) { /* 文案刷新失败不影响功能 */ }
      }
    },

    /** 补跑某语言的初始化。hook 自带幂等判据，重复调用是安全的。 */
    runInit: function (lang) {
      var hook = INIT_HOOKS[lang];
      if (!hook) return;
      try { hook(); } catch (err) {
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
      return injectAll(all).then(function () {
        if (global.__ReadyGate) global.__ReadyGate.release();
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: false }));
        // 合成事件已经让各模块自行初始化，这里再补一次是为了英语：EnglishApp 只由
        // GermanApp.init() 级联启动，而首屏进英语时德语词库不在，级联会断掉。
        // hook 幂等，其它语言到这里都会自己判定「已初始化」直接返回。
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
        delete modulePending[key];
        // 无论成败都标记已尝试：消费方的守卫会重试一次 openFor/init，
        // 数据仍缺席则走各自的「数据未加载」降级 UI，不会死循环
        moduleLoaded[key] = true;
        LangLoader.syncCounts(); // 首页数据集计数随数据到位刷新
        LangLoader._emit('module:done', { lang: lang, module: module, ok: results.indexOf(false) === -1 });
        return true;
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
      var m = String(global.location.hash || '').match(/^#\/(it|de|en|fr)\b/);
      if (m) return { it: 'italian', de: 'german', en: 'english', fr: 'french' }[m[1]];
      try {
        var saved = global.localStorage.getItem('dimenticato_language');
        if (saved && LANGS.indexOf(saved) !== -1) return saved;
      } catch (err) { /* 隐私模式下 localStorage 会抛 */ }
      return 'italian';
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
