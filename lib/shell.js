/**
 * 统一外壳：一棵屏幕树 + 一个 hash 路由，四门语言共用同一组屏幕。
 *
 * 以前每门语言各有一套 <lang>WelcomeScreen / <lang>VocabularyScreen …，导航层要
 * 维护四棵几乎一样的树。现在屏幕只有一份，语言只是 body[data-language] 上的语境；
 * 地址栏是 #/<code>/<slug>（例如 #/de/vocab/browse）。
 *
 * 对功能模块保持的全局契约（它们仍以裸名字调用）：
 *   showScreen(id, opts) · goBack({fallbackTarget}) · setPracticeContext(ctx)
 *   getActiveLanguage() · ScreenTree.{register, homeOf, screenOf, activeLanguage, …}
 *   DimRouter.{sync, start, href}
 * 屏幕 id 只有 SCREENS 里这一套（旧的按语言分屏 id 已全部清除，不再做别名折叠）。
 */
(function (global) {
  'use strict';

  // 语言清单只在 lib/languages.js 里维护
  var Languages = global.Languages;
  var LANGS = Languages.keys.slice();
  var LANG_CODE = Languages.byKeyMap(function (p) { return p.code; });
  var CODE_LANG = {};
  Languages.list.forEach(function (p) { CODE_LANG[p.code] = p.key; });
  var LANG_CN = Languages.byKeyMap(function (p) { return p.cn; });

  // transient：会话屏，刷新/深链接时没有会话可恢复，落回父级
  // param：地址可以在 slug 后再带一段参数（#/de/grammar/book/p1/ch01/t01），交给 opener
  var SCREENS = {
    homeScreen:                    { slug: '',                    section: 'home',     crumb: [] },
    vocabScreen:                   { slug: 'vocab',               section: 'vocab',    parent: 'homeScreen', crumb: ['词汇'] },
    quizScreen:                    { slug: 'vocab/choice',        section: 'vocab',    parent: 'vocabScreen', crumb: ['词汇', '选择题'], transient: true },
    spellScreen:                   { slug: 'vocab/spelling',      section: 'vocab',    parent: 'vocabScreen', crumb: ['词汇', '拼写'], transient: true },
    browseScreen:                  { slug: 'vocab/browse',        section: 'vocab',    parent: 'vocabScreen', crumb: ['词汇', '浏览'] },
    typingGameScreen:              { slug: 'vocab/typing',        section: 'vocab',    parent: 'vocabScreen', crumb: ['词汇', '打字游戏'] },
    cognatePracticeScreen:         { slug: 'vocab/cognates',      section: 'vocab',    parent: 'vocabScreen', crumb: ['词汇', '同源词'] },
    communityBrowseScreen:         { slug: 'vocab/community',     section: 'vocab',    parent: 'vocabScreen', crumb: ['词汇', '社区词书'] },
    grammarScreen:                 { slug: 'grammar',             section: 'grammar',  parent: 'homeScreen', crumb: ['语法'] },
    grammarBookScreen:             { slug: 'grammar/book',        section: 'grammar',  parent: 'grammarScreen', crumb: ['语法', '语法书'], param: true },
    conjugationSetupScreen:        { slug: 'grammar/conjugation', section: 'grammar',  parent: 'grammarScreen', crumb: ['语法', '动词变位'] },
    conjugationScreen:             { slug: null,                  section: 'grammar',  parent: 'conjugationSetupScreen', crumb: ['语法', '动词变位', '练习'], transient: true },
    verbCollocationsScreen:        { slug: 'grammar/collocations', section: 'grammar', parent: 'grammarScreen', crumb: ['语法', '动词搭配'] },
    verbCollocationPracticeScreen: { slug: null,                  section: 'grammar',  parent: 'verbCollocationsScreen', crumb: ['语法', '动词搭配', '练习'], transient: true },
    courseScreen:                  { slug: 'course',              section: 'grammar',  parent: 'homeScreen', crumb: ['课程路线'], module: 'course' },
    progressScreen:                { slug: 'progress',            section: 'progress', parent: 'homeScreen', crumb: ['进度'] },
    settingsScreen:                { slug: 'settings',            section: 'settings', parent: 'homeScreen', crumb: ['设置'] }
  };

  var state = { current: null, previous: null, context: null };
  var openers = {};      // screenId -> fn(lang)：深链接进入模块屏时由模块/App 负责渲染
  var enterHooks = [];   // fn(screenId, lang)：每次切屏后调用（App 用来渲染统一屏）
  var syncMuted = 0;

  function activeLanguage() {
    var lang = document.body && document.body.getAttribute('data-language');
    return LANGS.indexOf(lang) >= 0 ? lang : Languages.DEFAULT_KEY;
  }

  function resolve(id) {
    if (!id) return 'homeScreen';
    if (SCREENS[id]) return id;
    return id;
  }

  // 屏幕依赖的可选模块（profile.files 里没有对应条目）在当前语言不存在时，不能进
  function hasModule(lang, name) { return Languages.hasModule(lang, name); }

  function meta(id) { return SCREENS[resolve(id)] || null; }
  function parentOf(id) { var m = meta(id); return (m && m.parent) || null; }

  var esc = global.escapeHtml;  // lib/utils.js

  function renderChrome(id) {
    var m = meta(id) || {};
    var lang = activeLanguage();

    var crumbs = document.getElementById('crumbs');
    if (crumbs) {
      var parts = [{ label: LANG_CN[lang], target: 'homeScreen' }];
      var chain = [];
      for (var p = m.parent; p; p = SCREENS[p] && SCREENS[p].parent) chain.unshift(p);
      chain.forEach(function (pid) {
        var pm = SCREENS[pid];
        if (pid !== 'homeScreen' && pm) parts.push({ label: pm.crumb[pm.crumb.length - 1], target: pid });
      });
      if (id !== 'homeScreen' && m.crumb && m.crumb.length) parts.push({ label: m.crumb[m.crumb.length - 1] });
      crumbs.innerHTML = parts.map(function (part, i) {
        var last = i === parts.length - 1;
        return last
          ? '<span aria-current="page">' + esc(part.label) + '</span>'
          : '<a href="' + DimRouter.href(lang, part.target) + '">' + esc(part.label) + '</a>';
      }).join('<span class="sep">/</span>');
      crumbs.hidden = id === 'homeScreen';
    }

    var section = m.section || 'home';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === section) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
      var target = a.getAttribute('data-nav-screen');
      if (target) a.setAttribute('href', DimRouter.href(lang, target));
    });
  }

  /**
   * 切屏后把焦点交给新屏的标题，读屏软件才知道页面换了，键盘用户也不会留在已隐藏的旧屏里。
   * 只在焦点还停在旧屏 / body 上时才动：练习页进屏后自己聚焦输入框，不能被抢走。
   * 进屏钩子是同步渲染的，这里已经能拿到标题。
   */
  function focusScreenHeading(target) {
    var active = document.activeElement;
    if (active && active !== document.body && target.contains(active)) return;
    var heading = target.querySelector('h1, h2');
    if (!heading || heading.offsetParent === null) return;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function showScreen(id, options) {
    options = options || {};
    var screenId = resolve(id);
    var m = SCREENS[screenId];
    var target = document.getElementById(screenId);

    // 解析失败或该语言没有这个屏（课程路线只在有 files.course 的语言里）：回首页，绝不整页空白
    if (!target || (m && m.module && !hasModule(activeLanguage(), m.module))) {
      if (screenId !== 'homeScreen') {
        console.warn('[shell] 无法进入屏幕 ' + id + '，回到首页');
        showScreen('homeScreen', { replaceRoute: true });
      }
      return;
    }

    document.querySelectorAll('.screen.active').forEach(function (el) {
      if (el !== target) el.classList.remove('active');
    });
    target.classList.add('active');

    var changed = state.current !== screenId;
    var wasFirst = !state.current;
    if (changed) {
      state.previous = state.current;
      state.current = screenId;
      if (!options.keepScroll) global.scrollTo(0, 0);
    }

    renderChrome(screenId);
    enterHooks.forEach(function (fn) {
      try { fn(screenId, activeLanguage()); } catch (err) { console.error('[shell] enter hook', err); }
    });
    if (!options.skipRoute) DimRouter.sync(screenId, options);
    if (changed && !wasFirst) focusScreenHeading(target);
    document.dispatchEvent(new CustomEvent('dimenticato:screenchange', { detail: { screenId: screenId } }));
  }

  function goBack(options) {
    options = options || {};
    var target = parentOf(state.current) || (options.fallbackTarget && resolve(options.fallbackTarget)) || 'homeScreen';
    if (target === state.current) return;
    showScreen(target, { replaceRoute: false });
  }

  function setPracticeContext(ctx) { state.context = ctx || null; }

  // ==================== 路由 ====================

  var DimRouter = {
    booted: false,

    href: function (lang, screenId) {
      var m = SCREENS[resolve(screenId)];
      var slug = m && m.slug != null ? m.slug : '';
      // lang 可以是旧 key（'german'）或 code（'de'）
      var code = LANG_CODE[lang] || (Languages.has(lang) ? Languages.code(lang) : Languages.DEFAULT);
      return '#/' + code + (slug ? '/' + slug : '');
    },

    parse: function (hash) {
      var match = /^#\/([a-z]{2})(?:\/(.*))?$/.exec(String(hash || ''));
      if (!match || !CODE_LANG[match[1]]) return null;
      var slug = (match[2] || '').replace(/\/+$/, '');
      var screenId = 'homeScreen';
      var param = null;
      Object.keys(SCREENS).forEach(function (id) {
        if (SCREENS[id].slug === slug) screenId = id;
      });
      if (screenId === 'homeScreen' && slug) {
        Object.keys(SCREENS).forEach(function (id) {
          var s = SCREENS[id].slug;
          if (SCREENS[id].param && s && slug.indexOf(s + '/') === 0) { screenId = id; param = slug.slice(s.length + 1); }
        });
      }
      return { lang: CODE_LANG[match[1]], screenId: screenId, slug: slug, param: param };
    },

    sync: function (screenId, options) {
      if (syncMuted || !this.booted) return;
      var m = SCREENS[screenId];
      if (!m) return;
      // 会话屏没有自己的地址：保留父级地址，刷新后回到父级
      var url = this.href(activeLanguage(), m.slug == null ? m.parent : screenId);
      if (global.location.hash === url) return;
      // 带参数的屏（语法书专题）：地址里已经是本屏 + 参数时不覆盖
      if (m.param && global.location.hash.indexOf(url + '/') === 0) return;
      try {
        if (options && options.replaceRoute) global.history.replaceState(null, '', url);
        else global.history.pushState(null, '', url);
      } catch (err) { /* file:// 下 pushState 可能不可用 */ }
    },

    /** 进入某条路由：必要时先切语言（懒加载词库），再交给 opener 或直接切屏。 */
    apply: function (route, options) {
      options = options || {};
      var lang = route.lang;
      var screenId = route.screenId;
      var m = SCREENS[screenId];
      if (m && m.transient) screenId = m.parent;

      var go = function () {
        syncMuted++;
        try {
          if (openers[screenId]) openers[screenId](lang, route.param || null);
          else showScreen(screenId, { skipRoute: true });
        } finally {
          syncMuted--;
        }
        // 带参数进来的屏由 opener 自己维护地址（参数可能被规范化），不要把参数抹掉
        var ownsUrl = route.param && state.current === screenId;
        if (!ownsUrl && (options.rewrite || m && m.transient)) {
          try { global.history.replaceState(null, '', DimRouter.href(lang, state.current || screenId)); } catch (err) { /* ignore */ }
        }
      };

      if (lang !== activeLanguage() && global.App && typeof global.App.setLanguage === 'function') {
        return global.App.setLanguage(lang, { screen: screenId, skipRoute: true }).then(go);
      }
      go();
      return Promise.resolve();
    },

    onHistoryChange: function () {
      var route = this.parse(global.location.hash);
      if (!route) return;
      if (route.lang === activeLanguage() && route.screenId === state.current && !route.param) return;
      this.apply(route);
    },

    start: function () {
      if (this.booted) return;
      this.booted = true;
      var route = this.parse(global.location.hash) || { lang: activeLanguage(), screenId: 'homeScreen' };
      this.apply(route, { rewrite: true });
      global.addEventListener('popstate', function () { DimRouter.onHistoryChange(); });
      global.addEventListener('hashchange', function () { DimRouter.onHistoryChange(); });
    }
  };

  // ==================== 对外 ====================

  var ScreenTree = {
    LANGS: LANGS,
    LANG_CODE: LANG_CODE,
    CODE_LANG: CODE_LANG,
    LANG_CN: LANG_CN,
    all: SCREENS,
    get: meta,
    resolve: resolve,
    parentOf: parentOf,
    exists: function (id) { return !!document.getElementById(resolve(id)); },
    homeOf: function () { return 'homeScreen'; },
    // 旧接口：screenOf('german', 'grammar') → 'grammarScreen'
    screenOf: function (lang, name) {
      var id = String(name || '');
      if (!/Screen$/.test(id)) id += 'Screen';
      return resolve(id.charAt(0).toLowerCase() + id.slice(1));
    },
    languageOf: function () { return activeLanguage(); },
    activeLanguage: activeLanguage,
    // 模块登记自己的屏幕；统一树里已有的屏幕以统一树为准，只补新屏
    register: function (id, info) {
      if (SCREENS[id]) return;
      SCREENS[id] = {
        slug: info && info.slug != null ? info.slug : null,
        section: (info && info.section) || 'home',
        parent: 'homeScreen',
        crumb: (info && info.crumb) || []
      };
    }
  };

  var Shell = {
    state: state,
    SCREENS: SCREENS,
    resolve: resolve,
    showScreen: showScreen,
    goBack: goBack,
    current: function () { return state.current; },
    /** 深链接 / 语言切换后重新进入某屏时，用 fn(lang) 代替裸 showScreen。 */
    registerOpener: function (screenId, fn) { openers[screenId] = fn; },
    onEnter: function (fn) { enterHooks.push(fn); },
    renderChrome: function () { if (state.current) renderChrome(state.current); }
  };

  global.Shell = Shell;
  global.ScreenTree = ScreenTree;
  global.DimRouter = DimRouter;
  global.showScreen = showScreen;
  global.goBack = goBack;
  global.setPracticeContext = setPracticeContext;
  global.getActiveLanguage = activeLanguage;
})(window);
