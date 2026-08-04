/**
 * Dimenticato - Hash 路由 + 外壳扩展 (router & shell extras)
 *
 * 加载顺序：lib/navigation.js 之后、app.js 之前。
 *
 * 两块内容：
 *  1) DimRouter —— `#/<lang>/<section>[/<sub>]` 形式的 hash 路由。
 *     · showScreen() 每次切屏都会回调 DimRouter.sync()，把当前屏幕写进地址栏；
 *     · 浏览器 back / forward（popstate、hashchange）把地址栏回放成屏幕切换；
 *     · 启动时解析 location.hash 做深链接恢复（语言 + 屏幕），没有 hash 时
 *       回落到上次使用的语言首页。
 *     · 练习中的临时屏幕（选择题/拼写/浏览/变位练习）没有可恢复的会话，
 *       深链接时回落到它们的父屏幕，避免打开一个空练习页。
 *     · 切屏之后还要「补水」：语法书 / 动词变位 / 动词搭配 / 社区词本的内容
 *       都是各自的模块在入口按钮被点击时才渲染的，只切屏会得到一块空壳，
 *       共享屏还会残留上一次的语言。见下面的 PREPARE / HYDRATE。
 *
 *  2) ShellExtras —— 本次改版新增的外壳交互接线。新增的 DOM 在 index.html 里，
 *     但事件绑定放在这里，避免和其它模块抢同一个元素 id。所有对其它模块的
 *     调用一律 `typeof` 保护，缺席时退回到原有行为。
 *
 * 依赖：window.ScreenTree（lib/navigation.js）、window.showScreen。
 * 所有跨文件符号都在调用时通过 window.* 解析，parse 期不触碰任何其它脚本。
 */
(function () {
  'use strict';

  const LANGUAGE_KEY = 'dimenticato_language';

  function tree() {
    return window.ScreenTree || null;
  }

  function show(screenId, options) {
    if (typeof window.showScreen === 'function') window.showScreen(screenId, options || {});
  }

  /**
   * 数据集与部分模块是用顶层 `const` 声明的，顶层 const 不会挂到 window 上，
   * 所以 window.VOCABULARY_DATA / window.GrammarBook 永远是 undefined。
   * 这里在**调用时**读裸标识符，那时所有脚本都已执行完毕，没有 TDZ 问题；
   * 读不到就 catch 掉返回 null。绝不能在 parse 期做 typeof / window.X 判断。
   */
  function lateGlobal(name) {
    if (window[name] !== undefined) return window[name];
    try {
      switch (name) {
        case 'VOCABULARY_DATA': return VOCABULARY_DATA;
        case 'COGNATE_DATA': return COGNATE_DATA;
        case 'GERMAN_COGNATE_DATA': return GERMAN_COGNATE_DATA;
        case 'FRENCH_COGNATE_DATA': return FRENCH_COGNATE_DATA;
        case 'GERMAN_VOCABULARY_DATA': return GERMAN_VOCABULARY_DATA;
        case 'ENGLISH_VOCABULARY_DATA': return ENGLISH_VOCABULARY_DATA;
        case 'GrammarBook': return GrammarBook;
        case 'GRAMMAR_DATA': return GRAMMAR_DATA;
        case 'GERMAN_GRAMMAR_DATA': return GERMAN_GRAMMAR_DATA;
        case 'ENGLISH_GRAMMAR_DATA': return ENGLISH_GRAMMAR_DATA;
        case 'FRENCH_GRAMMAR_DATA': return FRENCH_GRAMMAR_DATA;
        default: return null;
      }
    } catch (err) {
      return null;
    }
  }

  // ==================== 路由索引 ====================

  let langIndex = null;   // 'de/vocab' -> 'germanVocabularyScreen'
  let sharedIndex = null; // 'grammar/book' -> 'grammarBookScreen'

  function buildIndex() {
    const t = tree();
    if (!t) return false;
    langIndex = {};
    sharedIndex = {};
    Object.keys(t.all).forEach((screenId) => {
      const meta = t.all[screenId];
      if (!meta || typeof meta.slug !== 'string') return;
      if (meta.lang) {
        langIndex[`${t.LANG_CODE[meta.lang]}/${meta.slug}`] = screenId;
      } else {
        sharedIndex[meta.slug] = screenId;
      }
    });
    return true;
  }

  function ensureIndex() {
    if (!langIndex || !sharedIndex) buildIndex();
    return !!langIndex;
  }

  // ==================== 深链接补水（prepare / hydrate） ====================
  //
  // 光切屏是不够的：语法书 / 动词变位 / 动词搭配 / 社区词本这几块屏的内容
  // 全部由各自的模块在「入口按钮被点击时」渲染，所以直接打开一条深链接只会
  // 得到一块空壳（语法书永远停在“加载中...”），而且它们还是跨语言共享屏，
  // 不喂语言的话 #/de/grammar/conjugation 会在德语面包屑下显示意大利语时态。
  //
  // 这里按 screenId 声明两类钩子：
  //   PREPARE  切屏之前：把运行时注入的屏幕（globalHomeScreen）先落到 DOM 上
  //   HYDRATE  切屏之后：让模块用 route.lang 渲染这块屏
  // 所有模块都在后加载的脚本里（GrammarBook 甚至是顶层 const，不在 window 上），
  // 因此一律在【调用时】解析 + typeof 保护，parse 期不触碰任何外部符号。

  function grammarDataFor(lang) {
    switch (lang) {
      case 'german': return lateGlobal('GERMAN_GRAMMAR_DATA');
      case 'english': return lateGlobal('ENGLISH_GRAMMAR_DATA');
      case 'french': return lateGlobal('FRENCH_GRAMMAR_DATA');
      default: return lateGlobal('GRAMMAR_DATA');
    }
  }

  // 容器里已经有真实内容（而不是 index.html 里那段“加载中...”占位）
  function rendered(containerId) {
    const el = document.getElementById(containerId);
    return !!(el && el.children.length > 0 && !el.querySelector('.grammar-nav-loading'));
  }

  const PREPARE = {
    // globalHomeScreen 由 app-enhanced.js 在 GlobalHome.show() 里才注入，
    // 深链接时必须先 install()，否则 showScreen 找不到元素会回落到语言首页。
    globalHomeScreen() {
      const home = window.GlobalHome;
      if (home && typeof home.install === 'function') home.install();
      return !!document.getElementById('globalHomeScreen');
    }
  };

  function prepare(screenId) {
    const fn = PREPARE[screenId];
    if (typeof fn !== 'function') return false;
    try {
      return !!fn();
    } catch (err) {
      console.warn('[router] 屏幕注入失败', screenId, err);
      return false;
    }
  }

  const HYDRATE = {
    globalHomeScreen() {
      const home = window.GlobalHome;
      if (home && typeof home.render === 'function') home.render();
    },

    grammarBookScreen(route) {
      const book = lateGlobal('GrammarBook');
      const data = grammarDataFor(route.lang);
      // 没有该语言的语法数据时宁可不动：init() 缺省会回落到意大利语数据，
      // 那正是“德语面包屑 + 意大利语正文”的来源。
      if (!book || typeof book.init !== 'function' || !data) return;
      book.init(data, { lang: route.lang });
    },

    conjugationSetupScreen(route) {
      const conj = window.ConjugationPractice;
      if (conj && typeof conj.openFor === 'function') conj.openFor(route.lang);
    },

    verbCollocationsScreen(route) {
      const vc = window.VerbCollocations;
      if (vc && typeof vc.open === 'function') vc.open(route.lang);
    },

    // 树里是 transient（深链接会回落到浏览页），保留是为了 back/forward 也能补水
    verbCollocationPracticeScreen(route) {
      const vcp = window.VerbCollocationPractice;
      if (vcp && typeof vcp.open === 'function') vcp.open(route.lang);
    },

    communityBrowseScreen(route) {
      const community = window.CommunityWordbooks;
      if (!community || typeof community.showBrowseScreen !== 'function') return;
      const pending = community.showBrowseScreen({ language: route.lang });
      // 异步入口：拉取失败时它自己会渲染状态，这里只吞掉 unhandled rejection
      if (pending && typeof pending.catch === 'function') pending.catch(() => {});
    },

    // 同源词是三门语言共用的一块屏，直接切屏只会得到一块空壳，
    // 还会残留上一门语言的词表。skipNavigate 是因为 apply() 已经切过屏了。
    cognatePracticeScreen(route) {
      const app = window.CognateApp;
      if (app && typeof app.open === 'function') app.open(route.lang, { skipNavigate: true });
    }
  };

  // 已经是目标语言、内容也渲染过了就不重建：浏览器 back/forward 同样走 apply()，
  // 无条件重建会把用户正在读的那一章重置回欢迎页。
  const HYDRATED = {
    grammarBookScreen(lang) {
      const book = lateGlobal('GrammarBook');
      return !!(book && typeof book.getLanguage === 'function'
        && book.getLanguage() === lang && rendered('grammarNavTree'));
    },
    verbCollocationsScreen(lang) {
      const vc = window.VerbCollocations;
      return !!(vc && typeof vc.getLanguage === 'function'
        && vc.getLanguage() === lang && rendered('vcNavTree'));
    },
    communityBrowseScreen(lang) {
      const community = window.CommunityWordbooks;
      return !!(community && community.activeLanguage === lang
        && rendered('communityWordbookList'));
    },
    cognatePracticeScreen(lang) {
      const app = window.CognateApp;
      return !!(app && typeof app.getLanguage === 'function'
        && app.getLanguage() === lang && rendered('cognatePracticeContainer'));
    }
  };

  function hydrate(route) {
    const fn = HYDRATE[route.screenId];
    if (typeof fn !== 'function') return;
    const done = HYDRATED[route.screenId];
    if (typeof done === 'function' && done(route.lang)) return;
    try {
      fn(route);
    } catch (err) {
      console.warn('[router] 屏幕初始化失败', route.screenId, err);
    }
  }

  // ==================== 路由 <-> 屏幕 ====================

  function routeFor(screenId) {
    const t = tree();
    if (!t) return null;
    const meta = t.get(screenId);
    if (!meta || typeof meta.slug !== 'string') return null;

    if (!meta.lang) {
      // 全局/共享屏幕：带上当前语言，深链接才能恢复正确的语境
      const lang = t.activeLanguage();
      if (meta.global) return meta.slug ? `#/${meta.slug}` : '#/';
      return `#/${t.LANG_CODE[lang]}/${meta.slug}`;
    }
    return `#/${t.LANG_CODE[meta.lang]}/${meta.slug}`;
  }

  // hash -> { screenId, lang }；无法解析时返回 null
  function resolve(hash) {
    const t = tree();
    if (!t || !ensureIndex()) return null;

    const hashStr = String(hash || '');
    const raw = hashStr.replace(/^#/, '').replace(/^\/+/, '').replace(/\/+$/, '');
    if (!raw) {
      // “#/” 是全局总览自己的路由（routeFor(globalHomeScreen) 写的就是它），
      // 必须能恢复；但“地址栏里根本没有 hash”仍旧走 start() 的
      // “回落到上次使用的语言首页”，两者不能混为一谈。
      if (hashStr.charAt(0) !== '#') return null;
      const overview = sharedIndex[''] || null;
      if (!overview) return null;
      if (!t.exists(overview) && !prepare(overview)) return null;
      return { screenId: overview, lang: t.activeLanguage() };
    }

    const parts = raw.split('/').filter(Boolean);
    let lang = null;
    let slug = '';

    if (parts.length && t.CODE_LANG[parts[0]]) {
      lang = t.CODE_LANG[parts[0]];
      slug = parts.slice(1).join('/') || 'home';
    } else {
      slug = parts.join('/');
    }

    let screenId = null;
    if (lang) screenId = langIndex[`${t.LANG_CODE[lang]}/${slug}`] || null;
    if (!screenId) screenId = sharedIndex[slug] || null;
    if (!screenId) return null;

    if (!lang) lang = t.languageOf(screenId);

    // 练习中的屏幕没有会话可恢复，回落到父级
    const meta = t.get(screenId);
    if (meta && meta.transient) {
      const parent = typeof meta.parent === 'function' ? meta.parent(lang) : meta.parent;
      if (parent && t.exists(parent)) screenId = parent;
    }

    if (!t.exists(screenId) && !prepare(screenId)) return null;
    return { screenId, lang };
  }

  // ==================== Router ====================

  const DimRouter = {
    booted: false,
    suspended: false,
    lastAppliedHash: null,

    routeFor,
    resolve,
    hydrate,

    /** showScreen() 调用：把当前屏幕写进地址栏（不触发 popstate） */
    sync(screenId, options) {
      if (this.suspended) return;
      const route = routeFor(screenId);
      if (!route) return;
      if (window.location.hash === route) {
        this.lastAppliedHash = route;
        return;
      }
      try {
        const replace = !this.booted || (options && options.replaceRoute);
        window.history[replace ? 'replaceState' : 'pushState']({ screenId }, '', route);
      } catch (err) {
        // file:// 等场景下 pushState 会抛，退回到直接改 hash
        window.location.hash = route.slice(1);
      }
      this.lastAppliedHash = window.location.hash;
    },

    /** 暂停 URL 同步（切语言时内部会连续切两次屏幕，只保留最后一次） */
    withSuspendedSync(fn) {
      const prev = this.suspended;
      this.suspended = true;
      try {
        fn();
      } finally {
        this.suspended = prev;
      }
    },

    /** 把一条路由应用到界面上 */
    apply(route, options) {
      const t = tree();
      if (!t || !route) return;
      const opts = options || {};

      this.withSuspendedSync(() => {
        prepare(route.screenId);
        if (route.lang && route.lang !== t.activeLanguage()) {
          setLanguageSilently(route.lang);
        }
        show(route.screenId, { skipHistory: true, skipRoute: true });
        // 切屏只是把空壳显示出来，内容要各自的模块按 route.lang 渲染
        hydrate(route);
        // 有些模块（GrammarBook / GermanApp）会在渲染完之后按自己的格式重写面包屑，
        // 把层级树的“德语 / 语法 / 语法书”盖成“German / Grammar / 语法书”。
        // 深链接以层级树为准，最后再归位一次。
        if (typeof t.renderBreadcrumb === 'function') t.renderBreadcrumb(route.screenId);
      });

      this.lastAppliedHash = window.location.hash;
      if (opts.rewrite) this.sync(route.screenId, { replaceRoute: true });
    },

    /** 浏览器 back / forward / 手动改地址栏 */
    onHistoryChange() {
      const hash = window.location.hash;
      if (hash === this.lastAppliedHash) return;
      const route = resolve(hash);
      if (!route) {
        this.lastAppliedHash = hash;
        return;
      }
      this.apply(route);
    },

    /** 启动：深链接优先，其次上次使用的语言首页 */
    start() {
      const t = tree();
      if (!t) return;
      ensureIndex();

      const route = resolve(window.location.hash);
      if (route) {
        this.apply(route, { rewrite: true });
      } else {
        let saved = 'italian';
        try {
          saved = localStorage.getItem(LANGUAGE_KEY) || 'italian';
        } catch (err) { /* 隐私模式下 localStorage 不可用 */ }
        if (t.LANGS.indexOf(saved) < 0) saved = 'italian';
        const home = t.homeOf(saved);
        this.apply({ screenId: t.exists(home) ? home : 'welcomeScreen', lang: saved }, { rewrite: true });
      }

      this.booted = true;
      window.addEventListener('popstate', () => this.onHistoryChange());
      window.addEventListener('hashchange', () => this.onHistoryChange());
    }
  };

  // 只换语言语境、不做跳转（跳转由调用方决定）
  function setLanguageSilently(lang) {
    const t = tree();
    if (!t || t.LANGS.indexOf(lang) < 0) return;

    if (lang === 'italian') document.body.removeAttribute('data-language');
    else document.body.setAttribute('data-language', lang);

    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch (err) { /* ignore */ }

    if (typeof window.syncLangPills === 'function') window.syncLangPills(lang);
    document.querySelectorAll('.language-switcher-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.language === lang);
    });
    if (lang === 'french' && window.FrenchApp && typeof window.FrenchApp.updateHeaderStats === 'function') {
      window.FrenchApp.updateHeaderStats();
    }
  }

  window.DimRouter = DimRouter;

  // ==================== ShellExtras：新增外壳交互 ====================

  const ShellExtras = {
    /** 品牌按钮 / 侧栏“总览”→ 全局首页（s1 提供 window.GlobalHome） */
    bindGlobalHome() {
      // app.js 也在 #brandHomeBtn 上绑了“回当前语言首页”。这里用捕获阶段拦截，
      // 只有在 GlobalHome 真的存在时才接管，否则原有行为原样保留。
      document.addEventListener('click', (event) => {
        const brand = event.target && event.target.closest && event.target.closest('#brandHomeBtn');
        if (!brand) return;
        if (!this.openGlobalHome({ silent: true })) return;
        event.preventDefault();
        event.stopPropagation();
        document.body.classList.remove('drawer-open');
      }, true);

      document.getElementById('globalOverviewBtn')?.addEventListener('click', () => {
        if (!this.openGlobalHome()) {
          const t = tree();
          if (t) show(t.homeOf(t.activeLanguage()));
        }
        document.body.classList.remove('drawer-open');
      });
    },

    openGlobalHome() {
      if (window.GlobalHome && typeof window.GlobalHome.show === 'function') {
        try {
          window.GlobalHome.show();
          return true;
        } catch (err) {
          console.warn('[shell] GlobalHome.show 失败', err);
        }
      }
      return false;
    },

    /** 侧栏底部的全局“设置与数据” / “课程”入口 */
    bindGlobalDestinations() {
      document.getElementById('globalSettingsBtn')?.addEventListener('click', () => {
        show('settingsScreen');
        document.body.classList.remove('drawer-open');
      });

      document.getElementById('navCourseBtn')?.addEventListener('click', () => {
        const courseBtn = document.getElementById('goGermanCourseBtn');
        if (courseBtn) courseBtn.click();
        document.body.classList.remove('drawer-open');
      });
    },

    /** 只有真的存在的入口才出现在侧栏，避免点了没反应的死项 */
    syncCapabilityNav() {
      const t = tree();
      if (!t) return;

      // 课程目前只有德语有
      const course = document.getElementById('navCourseBtn');
      if (course) {
        const available = t.activeLanguage() === 'german' && !!document.getElementById('goGermanCourseBtn');
        course.classList.toggle('hidden', !available);
      }

      // 「总览」= 全站首页，只有 window.GlobalHome 就位时才显示，
      // 否则它和下面的「语言首页」是同一个目的地，摆两个只会让人困惑。
      const overview = document.getElementById('globalOverviewBtn');
      if (overview) {
        const hasGlobalHome = !!(window.GlobalHome && typeof window.GlobalHome.show === 'function');
        overview.classList.toggle('hidden', !hasGlobalHome);
      }
    },

    /**
     * “我的词本”卡片原本只是重新渲染同页下方的列表，点了看起来毫无反应。
     * 现在改成滚动并高亮那一段，空列表时给出明确的空状态。
     */
    bindWordbookCards() {
      const pairs = [
        ['germanWordbooksBtn', 'germanWordbookCards'],
        ['englishWordbooksBtn', 'englishWordbookCards'],
        ['frenchWordbooksBtn', 'frenchWordbookCards'],
        ['italianWordbooksBtn', 'wordbookCards']
      ];
      pairs.forEach(([btnId, listId]) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', () => {
          const list = document.getElementById(listId);
          if (!list) return;
          const section = list.previousElementSibling || list;
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.syncWordbookEmptyStates();
        });
      });
    },

    syncWordbookEmptyStates() {
      [
        ['germanWordbookCards', 'germanWordbookEmpty'],
        ['englishWordbookCards', 'englishWordbookEmpty'],
        ['frenchWordbookCards', 'frenchWordbookEmpty'],
        ['wordbookCards', 'italianWordbookEmpty']
      ].forEach(([listId, emptyId]) => {
        const list = document.getElementById(listId);
        const empty = document.getElementById(emptyId);
        if (!list || !empty) return;
        empty.classList.toggle('hidden', list.children.length > 0);
      });
    },

    /** 动词搭配：浏览页里直接开始练习，不用退回上一层 */
    bindCollocationPracticeShortcut() {
      document.getElementById('vcStartPracticeBtn')?.addEventListener('click', () => {
        const entry = document.getElementById('goVerbCollocationPracticeBtn');
        if (entry) entry.click();
        else show('verbCollocationPracticeScreen');
      });
    },

    /** 词库规模一律从数据本身渲染，杜绝写死的过期数字 */
    syncDatasetCounts() {
      const fmt = (n) => Number(n).toLocaleString('en-US');
      const setAll = (selector, value) => {
        document.querySelectorAll(selector).forEach((el) => { el.textContent = value; });
      };
      const put = (key, list) => {
        if (Array.isArray(list) && list.length) setAll('[data-count="' + key + '"]', fmt(list.length));
      };

      put('italian-vocab', lateGlobal('VOCABULARY_DATA'));
      put('italian-cognates', lateGlobal('COGNATE_DATA'));
      // 德/法同源词的入口标数同样从实时数据长度取，不写死：这两份数据是懒加载的，
      // 首屏进意大利语时它们还不在，put() 会跳过，等 LangLoader.ensure() 之后
      // syncCounts() 再刷一次。
      put('german-cognates', lateGlobal('GERMAN_COGNATE_DATA'));
      put('french-cognates', lateGlobal('FRENCH_COGNATE_DATA'));
      put('german-vocab', lateGlobal('GERMAN_VOCABULARY_DATA'));
      put('english-vocab', lateGlobal('ENGLISH_VOCABULARY_DATA'));
      // 法语系统词库 = 课程词表 + 词汇表去重后的结果，直接读 FrenchApp 合并好的数组
      put('french-vocab', window.FrenchApp && window.FrenchApp.systemWords);
    },

    init() {
      this.bindGlobalHome();
      this.bindGlobalDestinations();
      this.bindWordbookCards();
      this.bindCollocationPracticeShortcut();
      this.syncDatasetCounts();
      this.syncCapabilityNav();
      this.syncWordbookEmptyStates();

      document.addEventListener('dimenticato:screenchange', () => {
        this.syncCapabilityNav();
        this.syncWordbookEmptyStates();
      });
    }
  };

  window.ShellExtras = ShellExtras;

  // ==================== 启动 ====================
  //
  // 用 setTimeout(0) 排在所有模块的 DOMContentLoaded 之后：french-app.js 的
  // 屏幕、german-course.js 的课程屏都要先注入完，路由才能解析到它们。

  function boot() {
    try {
      ShellExtras.init();
    } catch (err) {
      console.warn('[shell] ShellExtras 初始化失败', err);
    }
    try {
      DimRouter.start();
    } catch (err) {
      console.warn('[router] 启动失败', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  } else {
    setTimeout(boot, 0);
  }
})();
