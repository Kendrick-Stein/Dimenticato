/**
 * Dimenticato - 导航核心 (navigation core)
 *
 * 本文件从 app.js 中抽取出的纯导航逻辑：screen 切换、屏幕层级树、
 * 移动端悬浮返回按钮、面包屑渲染，以及与 lib/router.js 的 URL 同步。
 *
 * 加载顺序：本文件在 lib/quiz-engine.js 之后、lib/router.js 与 app.js 之前加载。
 *
 * 导航模型（修复 “返回=浏览历史” 的 blocker）：
 *   - SCREEN_TREE 是唯一的层级真相：每个 screen 声明它的 parent、路由 slug、
 *     侧栏 section 与面包屑。跨语言共享的 screen（grammarBookScreen /
 *     communityBrowseScreen / conjugation* / settingsScreen）用函数声明 parent，
 *     在调用时根据 body[data-language] 解析。
 *   - 页内“返回”按钮 = 严格向上（parent），永远不再消费浏览历史。
 *   - 浏览器 back / forward = 时间顺序，由 lib/router.js 通过 hash + popstate 处理。
 *   - AppState.navigationStack 仍然维护（其它脚本可能读它），但已不参与 goBack。
 *
 * 与 app.js 的依赖关系（关键，避免 load-order hazard）：
 *   - 本文件用 IIFE 封装，所有对外符号通过 `window.*` 暴露，保持与抽取前
 *     完全一致的全局名字（showScreen / goBack / setPracticeContext /
 *     getFallbackBackTarget / updateMobileBackButton / shouldShowMobileBackButton /
 *     getPreviousScreenFromHistory），其它脚本（app.js / german-app.js /
 *     app-enhanced.js / conjugation-app.js / verb-collocations*.js /
 *     community-wordbooks.js）继续以裸名字（resolve 到 window.*）调用。
 *   - 所有跨文件引用（AppState / updateHeaderNavigation / …）都在“函数被调用时”
 *     才解析，并且一律走 `window.` 或 typeof 兜底，parse 期不触碰 app.js 的符号。
 */
(function () {
  'use strict';

  // ==================== 语言常量 ====================

  const LANGS = ['italian', 'german', 'english', 'french'];
  const LANG_CODE = { italian: 'it', german: 'de', english: 'en', french: 'fr' };
  const CODE_LANG = { it: 'italian', de: 'german', en: 'english', fr: 'french' };
  const LANG_CN = { italian: '意大利语', german: '德语', english: '英语', french: '法语' };

  function activeLanguage() {
    const attr = document.body ? document.body.getAttribute('data-language') : null;
    return LANGS.indexOf(attr) >= 0 ? attr : 'italian';
  }

  // AppState 是 app.js 里的顶层 `const`，不在 window 上，只能通过共享的全局
  // 词法作用域按名字解析。用 try/catch 兜底，保证本文件在 app.js 之前加载、
  // 或在未来 AppState 被移动/重命名时也不会抛出。（只在调用时求值，parse 期不触碰。）
  function state() {
    try {
      return AppState;
    } catch (err) {
      return (window.AppState || null);
    }
  }

  // ==================== 学习上下文 ====================

  function setPracticeContext(context = 'vocab') {
    const st = state();
    if (st) st.practiceContext = context;
    const moduleSection = document.getElementById('conjModuleSection');

    if (moduleSection) {
      moduleSection.classList.toggle('conj-context-active', context === 'conjugation');
    }
  }

  // ==================== 屏幕层级树 ====================
  //
  // 每个条目：
  //   lang       所属语言（共享屏幕留空，运行时按 body[data-language] 解析）
  //   parent     上一层 screen id，或 (lang) => screenId
  //   slug       hash 路由片段，最终 URL 为 #/<langCode>/<slug>
  //   section    侧栏高亮用的 section
  //   crumb      面包屑末段（前面自动补语言名）
  //   transient  练习中的临时屏幕：深链接时回落到 parent（没有会话可恢复）

  function homeOf(lang) {
    return lang === 'italian' ? 'welcomeScreen' : `${lang}WelcomeScreen`;
  }

  function screenOf(lang, name) {
    return lang === 'italian' ? name.charAt(0).toLowerCase() + name.slice(1) : lang + name;
  }

  function makeLanguageTree(lang) {
    const home = homeOf(lang);
    const vocab = screenOf(lang, 'VocabularyScreen');
    const modes = screenOf(lang, 'VocabularyModesScreen');
    const grammar = screenOf(lang, 'GrammarScreen');

    return {
      [home]: { lang, parent: 'globalHomeScreen', slug: 'home', section: 'home', crumb: ['首页'] },
      [vocab]: { lang, parent: home, slug: 'vocab', section: 'vocab', crumb: ['词汇', '内容来源'] },
      [modes]: { lang, parent: vocab, slug: 'vocab/modes', section: 'vocab', crumb: ['词汇', '练习方式'] },
      [screenOf(lang, 'MultipleChoiceScreen')]: { lang, parent: modes, slug: 'vocab/choice', section: 'vocab', crumb: ['词汇', '选择题'], transient: true },
      [screenOf(lang, 'SpellingScreen')]: { lang, parent: modes, slug: 'vocab/spelling', section: 'vocab', crumb: ['词汇', '拼写'], transient: true },
      [screenOf(lang, 'BrowseScreen')]: { lang, parent: modes, slug: 'vocab/browse', section: 'vocab', crumb: ['词汇', '浏览'], transient: true },
      [grammar]: { lang, parent: home, slug: 'grammar', section: 'grammar', crumb: ['语法'] },
      [screenOf(lang, 'ProgressScreen')]: { lang, parent: home, slug: 'progress', section: 'progress', crumb: ['进度'] },
      [screenOf(lang, 'SettingsScreen')]: { lang, parent: home, slug: 'about', section: 'home', crumb: ['模块说明'] }
    };
  }

  // 跨语言共享的屏幕：parent / 语言由 body[data-language] 决定
  const SHARED_TREE = {
    globalHomeScreen: { parent: null, slug: '', section: 'overview', crumb: ['总览'], global: true },

    communityBrowseScreen: {
      parent: (lang) => screenOf(lang, 'VocabularyScreen'),
      slug: 'vocab/community', section: 'vocab', crumb: ['词汇', '社区词本']
    },
    grammarBookScreen: {
      parent: (lang) => screenOf(lang, 'GrammarScreen'),
      slug: 'grammar/book', section: 'grammar', crumb: ['语法', '语法书']
    },
    conjugationSetupScreen: {
      parent: (lang) => screenOf(lang, 'GrammarScreen'),
      slug: 'grammar/conjugation', section: 'grammar', crumb: ['语法', '动词变位']
    },
    conjugationScreen: {
      parent: () => 'conjugationSetupScreen',
      slug: 'grammar/conjugation/practice', section: 'grammar', crumb: ['语法', '动词变位', '练习中'], transient: true
    },
    verbCollocationsScreen: {
      parent: (lang) => screenOf(lang, 'GrammarScreen'),
      slug: 'grammar/collocations', section: 'grammar', crumb: ['语法', '动词搭配']
    },
    verbCollocationPracticeScreen: {
      parent: () => 'verbCollocationsScreen',
      slug: 'grammar/collocations/practice', section: 'grammar', crumb: ['语法', '动词搭配', '练习'], transient: true
    },
    // 全站设置/数据是全局目的地，返回时回到当前语言首页
    settingsScreen: {
      parent: (lang) => homeOf(lang),
      slug: 'settings', section: 'settings', crumb: ['设置与数据'], global: true
    },
    // 仍被 french-app.js 当作插入锚点，保留但不参与路由
    languageSkeletonPlaceholderScreen: {
      parent: (lang) => homeOf(lang), slug: null, section: 'home', crumb: ['模块']
    }
  };

  const SCREEN_TREE = Object.assign(
    {},
    makeLanguageTree('italian'),
    makeLanguageTree('german'),
    makeLanguageTree('english'),
    makeLanguageTree('french'),
    SHARED_TREE
  );

  // 运行时注入的屏幕（german-course.js 等）在这里补登记，
  // 避免面包屑退化成 “Home”、返回键找不到父级。
  function registerScreen(screenId, meta) {
    if (!screenId || !meta) return;
    SCREEN_TREE[screenId] = Object.assign({}, SCREEN_TREE[screenId], meta);
  }

  registerScreen('germanCourseScreen', {
    lang: 'german', parent: 'germanWelcomeScreen', slug: 'course', section: 'course', crumb: ['课程', 'A1-C1 路线']
  });

  function getScreenMeta(screenId) {
    return SCREEN_TREE[screenId] || null;
  }

  function languageOfScreen(screenId) {
    const meta = getScreenMeta(screenId);
    if (meta && meta.lang) return meta.lang;
    return activeLanguage();
  }

  function screenExists(screenId) {
    return !!(screenId && document.getElementById(screenId));
  }

  // ==================== 层级返回目标 ====================

  // 解析 parent，并跳过“树里声明了但页面上不存在”的祖先
  // （globalHomeScreen 由 s1 在运行时注入；未注入时语言首页就是根）。
  function getParentScreen(screenId) {
    const seen = new Set();
    let current = screenId;

    while (current && !seen.has(current)) {
      seen.add(current);
      const meta = getScreenMeta(current);
      if (!meta) return null;

      const lang = meta.lang || activeLanguage();
      const parent = typeof meta.parent === 'function' ? meta.parent(lang) : meta.parent;
      if (!parent) return null;
      if (screenExists(parent)) return parent;
      current = parent;
    }
    return null;
  }

  function getFallbackBackTarget(screenId) {
    const st = state();
    const id = screenId || (st ? st.currentScreen : null);
    const parent = getParentScreen(id);
    if (parent) return parent;
    const home = homeOf(languageOfScreen(id));
    return screenExists(home) ? home : 'welcomeScreen';
  }

  // 兼容旧名字：共享屏幕的语言感知返回目标。
  function getSharedScreenBackTarget(screenId, lang) {
    const meta = getScreenMeta(screenId);
    if (!meta || typeof meta.parent !== 'function') return null;
    return meta.parent(LANGS.indexOf(lang) >= 0 ? lang : activeLanguage());
  }

  // ==================== 历史返回栈（仅兼容/诊断用途） ====================
  //
  // 注意：goBack() 已经不再消费这个栈——那正是 “返回 Home 却落到兄弟页”
  // 的根因。浏览器的 back/forward 由 lib/router.js 基于真实 history API 处理。

  function getPreviousScreenFromHistory() {
    const st = state();
    const stack = (st && Array.isArray(st.navigationStack)) ? st.navigationStack : [];
    const current = st ? st.currentScreen : null;
    for (let i = stack.length - 2; i >= 0; i--) {
      const candidate = stack[i];
      if (candidate && candidate !== current) return candidate;
    }
    return null;
  }

  // ==================== 移动端悬浮返回按钮 ====================

  function shouldShowMobileBackButton(screenId) {
    const st = state();
    const id = screenId || (st ? st.currentScreen : null);
    if (!id) return false;
    // 有上一层才显示：语言首页与全局总览没有上一层
    return !!getParentScreen(id);
  }

  function updateMobileBackButton(screenId) {
    const btn = document.getElementById('mobileFloatingBackBtn');
    if (!btn) return;
    btn.classList.toggle('hidden', !shouldShowMobileBackButton(screenId));
  }

  // ==================== 全局返回（严格层级向上） ====================

  function goBack(options = {}) {
    const st = state();
    const current = st ? st.currentScreen : null;
    // 层级树优先；只有树里查不到时才用调用方传入的 fallbackTarget。
    const target = getParentScreen(current) || options.fallbackTarget || getFallbackBackTarget(current);

    if (!target || target === current) return;
    showScreen(target, { skipHistory: true });
  }

  // ==================== 面包屑 / 侧栏高亮 ====================

  function renderBreadcrumb(screenId) {
    const el = document.getElementById('breadcrumb');
    const meta = getScreenMeta(screenId);
    if (!el || !meta) return false;

    const esc = (typeof window.escapeHtml === 'function') ? window.escapeHtml : (s) => String(s);
    const crumb = meta.crumb || [];
    const parts = meta.global ? crumb.slice() : [LANG_CN[meta.lang || activeLanguage()]].concat(crumb);

    el.innerHTML = parts
      .map((item, index) => `<span class="breadcrumb-item ${index === parts.length - 1 ? 'current' : ''}">${esc(item)}</span>`)
      .join('<span class="breadcrumb-separator">/</span>');
    return true;
  }

  function syncSidebar(screenId) {
    const meta = getScreenMeta(screenId);
    const section = (meta && meta.section) || 'home';
    document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });
  }

  // ==================== screen 切换 ====================

  function showScreen(screenId, options = {}) {
    // 先解析目标：解析失败时绝不能把所有 screen 都关掉（否则整页空白）。
    const target = document.getElementById(screenId);
    if (!target) {
      console.error('[navigation] showScreen: 未知屏幕 id =', screenId);
      const fallback = homeOf(activeLanguage());
      if (screenId !== fallback && document.getElementById(fallback)) {
        showScreen(fallback, { skipHistory: true });
      }
      return;
    }

    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    target.classList.add('active');

    const st = state();
    if (st) {
      st.previousScreen = st.currentScreen;
      st.currentScreen = screenId;
      if (!options.skipHistory && Array.isArray(st.navigationStack)) {
        st.navigationStack.push(screenId);
      }
    }

    // app.js 负责 activeModule；随后用层级树覆盖面包屑与侧栏高亮，保证四种语言
    // 深度一致，且运行时注入的屏幕（germanCourseScreen 等）也有正确的面包屑。
    if (typeof window.updateHeaderNavigation === 'function') {
      try {
        window.updateHeaderNavigation(screenId);
      } catch (err) {
        console.warn('[navigation] updateHeaderNavigation 失败', err);
      }
    }
    renderBreadcrumb(screenId);
    syncSidebar(screenId);
    updateMobileBackButton(screenId);

    if (screenId === 'vocabularyModesScreen' && typeof window.updateVocabularySummary === 'function') {
      window.updateVocabularySummary();
    }

    if (screenId === 'progressScreen' && typeof window.updateProgressScreenStats === 'function') {
      window.updateProgressScreenStats();
    }

    // URL 同步（lib/router.js 在本文件之后加载，按调用时解析）
    if (!options.skipRoute && window.DimRouter && typeof window.DimRouter.sync === 'function') {
      window.DimRouter.sync(screenId, options);
    }

    document.dispatchEvent(new CustomEvent('dimenticato:screenchange', { detail: { screenId } }));
  }

  // ==================== 全局暴露 ====================
  // 保持与抽取前完全一致的全局名字，其它脚本继续以裸名字调用（resolve 到 window.*）。
  window.setPracticeContext = setPracticeContext;
  window.getFallbackBackTarget = getFallbackBackTarget;
  window.getSharedScreenBackTarget = getSharedScreenBackTarget;
  window.getPreviousScreenFromHistory = getPreviousScreenFromHistory;
  window.shouldShowMobileBackButton = shouldShowMobileBackButton;
  window.updateMobileBackButton = updateMobileBackButton;
  window.goBack = goBack;
  window.showScreen = showScreen;

  // 层级树的对外接口（lib/router.js 与 shell 扩展消费）
  window.ScreenTree = {
    LANGS,
    LANG_CODE,
    CODE_LANG,
    LANG_CN,
    all: SCREEN_TREE,
    get: getScreenMeta,
    register: registerScreen,
    parentOf: getParentScreen,
    languageOf: languageOfScreen,
    homeOf,
    screenOf,
    activeLanguage,
    exists: screenExists,
    renderBreadcrumb
  };
})();
