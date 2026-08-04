/**
 * Dimenticato - 导航核心 (navigation core)
 *
 * 本文件从 app.js 中抽取出的纯导航逻辑：screen 切换、历史返回栈、
 * 移动端悬浮返回按钮、各语言站点的 fallback 返回目标映射。
 *
 * 加载顺序：本文件在 lib/quiz-engine.js 之后、app.js 之前加载。
 *
 * 与 app.js 的依赖关系（关键，避免 load-order hazard）：
 *   - 本文件用 IIFE 封装，所有对外符号通过 `window.*` 暴露，保持与抽取前
 *     完全一致的全局名字（showScreen / goBack / setPracticeContext /
 *     getFallbackBackTarget / updateMobileBackButton / shouldShowMobileBackButton /
 *     getPreviousScreenFromHistory），其它脚本（app.js / german-app.js /
 *     app-enhanced.js / conjugation-app.js / verb-collocations*.js /
 *     community-wordbooks.js）继续以裸名字（resolve 到 window.*）调用。
 *   - 本文件引用的 `AppState`（const，定义于 app.js）以及
 *     `ScreenMeta` / `updateHeaderNavigation` / `updateVocabularySummary` /
 *     `updateProgressScreenStats`（定义于 app.js，且在 app.js 加载之后才存在）
 *     全部是在“函数被调用时”才解析的——而这些导航函数最早也要等到
 *     DOMContentLoaded 才会运行，那时 app.js 早已执行完毕、上述符号均已就绪。
 *     因此本文件在 parse / IIFE 执行阶段【不会】触碰任何 app.js 的符号，
 *     不存在 load-order hazard。
 *   - AppState 仍保留在 app.js（最安全：不移动核心可变状态对象），本文件
 *     在调用时通过共享的全局词法作用域延迟解析它。
 */
(function () {
  'use strict';

  // ==================== 学习上下文 ====================

  function setPracticeContext(context = 'vocab') {
    AppState.practiceContext = context;
    const moduleSection = document.getElementById('conjModuleSection');

    if (moduleSection) {
      moduleSection.classList.toggle('conj-context-active', context === 'conjugation');
    }
  }

  // ==================== fallback 返回目标映射 ====================

  // Per-language fallback back targets for the German/English/French mirror sites.
  // These screens navigate with { skipHistory: true } (see GermanApp.showScreen),
  // so AppState.navigationStack is not reliable for them — the fallback map below
  // is the authoritative back path used by the global goBack()/mobile back button.
  function makeLanguageFallbackMap(lang) {
    const cap = (name) => name.charAt(0).toUpperCase() + name.slice(1);
    const home = `${lang}WelcomeScreen`;
    const vocabulary = `${lang}VocabularyScreen`;
    const modes = `${lang}VocabularyModesScreen`;
    return {
      [vocabulary]: home,
      [`${lang}CourseScreen`]: home,
      [modes]: vocabulary,
      [`${lang}MultipleChoiceScreen`]: modes,
      [`${lang}SpellingScreen`]: modes,
      [`${lang}BrowseScreen`]: modes,
      [`${lang}GrammarScreen`]: home,
      [`${lang}ProgressScreen`]: home,
      [`${lang}SettingsScreen`]: home,
      // alias so cap-first lookups never miss
      [`${lang}${cap('welcomeScreen')}`]: home
    };
  }

  const FALLBACK_BACK_MAP = Object.assign(
    {
      // Italian main site
      vocabularyScreen: 'welcomeScreen',
      vocabularyModesScreen: 'vocabularyScreen',
      multipleChoiceScreen: 'vocabularyModesScreen',
      spellingScreen: 'vocabularyModesScreen',
      browseScreen: 'vocabularyModesScreen',
      communityBrowseScreen: 'vocabularyScreen',
      grammarScreen: 'welcomeScreen',
      conjugationSetupScreen: 'grammarScreen',
      conjugationScreen: 'conjugationSetupScreen',
      grammarBookScreen: 'grammarScreen',
      verbCollocationsScreen: 'grammarScreen',
      verbCollocationPracticeScreen: 'grammarScreen',
      progressScreen: 'welcomeScreen',
      settingsScreen: 'welcomeScreen'
    },
    makeLanguageFallbackMap('german'),
    makeLanguageFallbackMap('english'),
    makeLanguageFallbackMap('french')
  );

  // A few screens are SHARED across languages (grammarBookScreen is opened by
  // Italian/German/English/French; communityBrowseScreen is a shared community pool;
  // the conjugation setup/practice screens are reused by German/English/French via
  // ConjugationPractice.openFor()). Their correct back target depends on the
  // active language, so resolve it from body[data-language] rather than a fixed
  // map entry. When German/English have real history this is only the no-history
  // fallback; the fixed FALLBACK_BACK_MAP entries (→ grammarScreen) cover Italian.
  function getSharedScreenBackTarget(screenId, lang) {
    if (lang !== 'german' && lang !== 'english' && lang !== 'french') return null;
    if (screenId === 'grammarBookScreen') return `${lang}GrammarScreen`;
    if (screenId === 'communityBrowseScreen') return `${lang}VocabularyScreen`;
    if (screenId === 'conjugationSetupScreen') return `${lang}GrammarScreen`;
    if (screenId === 'conjugationScreen') return 'conjugationSetupScreen';
    return null;
  }

  function getFallbackBackTarget(screenId = AppState.currentScreen) {
    const lang = document.body ? document.body.getAttribute('data-language') : null;
    return (
      getSharedScreenBackTarget(screenId, lang) ||
      FALLBACK_BACK_MAP[screenId] ||
      'welcomeScreen'
    );
  }

  // NOTE: As of Stage 2 of the nav refactor, German/English now push the shared
  // AppState.navigationStack just like the Italian site (see GermanApp.showScreen),
  // so goBack() can rely on real history for every language. The previous
  // `isHistoryUnreliableScreen` guard (which forced German/English + shared screens
  // onto the fallback map because they navigated with { skipHistory: true }) has
  // been removed. The fallback map (getFallbackBackTarget, still language-aware for
  // shared screens) remains as the no-history fallback when the stack is empty.

  // ==================== 历史返回栈 ====================

  function getPreviousScreenFromHistory() {
    const stack = Array.isArray(AppState.navigationStack) ? AppState.navigationStack : [];
    for (let i = stack.length - 2; i >= 0; i--) {
      const candidate = stack[i];
      if (candidate && candidate !== AppState.currentScreen) {
        return candidate;
      }
    }
    return null;
  }

  // ==================== 移动端悬浮返回按钮 ====================

  function shouldShowMobileBackButton(screenId = AppState.currentScreen) {
    const hiddenScreens = new Set([
      // Italian top-level / hub screens
      'welcomeScreen',
      'vocabularyScreen',
      'grammarScreen',
      'progressScreen',
      'settingsScreen',
      // German hub + top-level screens (mirror the Italian set)
      'germanWelcomeScreen',
      'germanVocabularyScreen',
      'germanGrammarScreen',
      'germanProgressScreen',
      'germanSettingsScreen',
      // English hub + top-level screens (mirror the Italian set)
      'englishWelcomeScreen',
      'englishVocabularyScreen',
      'englishGrammarScreen',
      'englishProgressScreen',
      'englishSettingsScreen',
      // French hub + top-level screens
      'frenchWelcomeScreen',
      'frenchVocabularyScreen',
      'frenchGrammarScreen',
      'frenchProgressScreen',
      'frenchSettingsScreen'
    ]);

    return !hiddenScreens.has(screenId);
  }

  function updateMobileBackButton(screenId = AppState.currentScreen) {
    const btn = document.getElementById('mobileFloatingBackBtn');
    if (!btn) return;

    const shouldShow = shouldShowMobileBackButton(screenId);
    btn.classList.toggle('hidden', !shouldShow);
  }

  // ==================== 全局返回 ====================

  function goBack(options = {}) {
    const fallbackTarget = options.fallbackTarget || getFallbackBackTarget(AppState.currentScreen);

    const previousScreen = getPreviousScreenFromHistory();
    const targetScreen = previousScreen || fallbackTarget;

    if (!targetScreen || targetScreen === AppState.currentScreen) return;

    if (previousScreen) {
      if (Array.isArray(AppState.navigationStack) && AppState.navigationStack.length > 1) {
        AppState.navigationStack.pop();
        AppState.navigationStack.pop();
      }
      showScreen(targetScreen);
      return;
    }

    showScreen(targetScreen, { skipHistory: true });
  }

  // ==================== screen 切换 ====================

  function showScreen(screenId, options = {}) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    AppState.previousScreen = AppState.currentScreen;
    AppState.currentScreen = screenId;

    if (!options.skipHistory) {
      AppState.navigationStack.push(screenId);
    }

    updateHeaderNavigation(screenId);
    updateMobileBackButton(screenId);

    if (screenId === 'vocabularyModesScreen') {
      updateVocabularySummary();
    }

    if (screenId === 'progressScreen') {
      updateProgressScreenStats();
    }
  }

  // ==================== 全局暴露 ====================
  // 保持与抽取前完全一致的全局名字，其它脚本继续以裸名字调用（resolve 到 window.*）。
  window.setPracticeContext = setPracticeContext;
  window.getFallbackBackTarget = getFallbackBackTarget;
  window.getPreviousScreenFromHistory = getPreviousScreenFromHistory;
  window.shouldShowMobileBackButton = shouldShowMobileBackButton;
  window.updateMobileBackButton = updateMobileBackButton;
  window.goBack = goBack;
  window.showScreen = showScreen;
})();
