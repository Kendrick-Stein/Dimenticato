/**
 * GrammarBook — 语法书阅读器（四门语言共用一块屏，没有按语言分支）
 * 数据经 LangLoader.data(code, 'grammar') 取（data/<code>-grammar.js 懒加载注入），
 * 不用 fetch()，避免 GitHub Pages 上中文文件名的问题。数据格式见
 * docs/data-schema.md 的 grammar/1：专题 slug 统一为 p<N>/ch<NN>/t<NN>，
 * 旧 slug 记在 meta.aliases（旧 → 新），这里的 resolveSlug() 负责把旧深链接、
 * 旧阅读位置、课程里的旧引用都解析到新专题。
 *
 * 阅读位置按语言代码存在 dimenticato_grammar_topic_<code>；地址栏同步为
 * #/<code>/grammar/book/<slug>（lib/shell.js 的 param 路由），刷新后回到同一篇。
 */
const GrammarBook = (() => {
  let sidebarListenerAdded = false;
  let topicListSeq = 0;
  let currentSlug = null;
  let activeData = null; // currently loaded grammar data
  let activeLang = window.Languages.DEFAULT; // 语言代码（'it' / 'de' / …）

  const POSITION_PREFIX = 'dimenticato_grammar_topic_';

  // 小目录树默认全部展开，避免只剩一列折叠标题看起来像坏页。
  const AUTO_EXPAND_TOPIC_LIMIT = 48;

  function getLayout() {
    return document.querySelector('#grammarBookScreen .grammar-book-layout');
  }

  // 与 styles.css 的手机断点（max-width: 760px，抽屉式目录）保持一致
  const NARROW_QUERY = '(max-width: 760px)';
  const narrowMql = typeof window.matchMedia === 'function' ? window.matchMedia(NARROW_QUERY) : null;
  function isNarrow() {
    return narrowMql ? narrowMql.matches : window.innerWidth <= 760;
  }

  // 目录是否展开：手机上看 sidebar-open，桌面上看有没有 sidebar-collapsed
  function syncSidebarToggle() {
    const layout = getLayout();
    const btn = document.getElementById('grammarSidebarToggle');
    if (!layout || !btn) return;
    const expanded = isNarrow()
      ? layout.classList.contains('sidebar-open')
      : !layout.classList.contains('sidebar-collapsed');
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  // 语法数据按模块懒加载，注册在 DIM_DATA.grammar.<code>，调用时取
  function dataGlobalFor(lang) {
    return window.LangLoader ? window.LangLoader.data(lang, 'grammar') : null;
  }

  /** 从「调用方传进来的数据对象」反推语言代码，调用方无需改代码。 */
  function resolveLang(data, options) {
    const L = window.Languages;
    const explicit = options && (options.lang || options.language);
    if (explicit && L.has(explicit)) return L.code(explicit);

    if (data) {
      if (data.meta && L.has(data.meta.lang)) return L.code(data.meta.lang);
      const match = L.codes.find(code => dataGlobalFor(code) === data);
      if (match) return match;
    }

    const bodyLang = document.body ? document.body.getAttribute('data-language') : null;
    if (bodyLang && L.has(bodyLang)) return L.code(bodyLang);

    return L.DEFAULT;
  }

  function getProfile(lang) {
    const L = window.Languages;
    const p = L.get(lang || activeLang) || L.get(L.DEFAULT);
    return { label: p.cn, title: p.cn + '语法', description: '请从左侧目录选择章节开始阅读' };
  }

  function getTitle() {
    const meta = activeData && activeData.meta;
    return (meta && meta.title) || getProfile().title;
  }

  function getDescription() {
    const meta = activeData && activeData.meta;
    return (meta && meta.description) || getProfile().description;
  }

  function countTopics(tree) {
    return (tree.parts || []).reduce((sum, part) => sum +
      (part.chapters || []).reduce((n, ch) => n + (ch.topics || []).length, 0), 0);
  }

  // ==================== slug 解析 / 阅读位置 ====================

  /**
   * 任意形式的 slug → 当前数据里的专题 slug（找不到返回 null）。
   * 接受新 slug、meta.aliases 里的旧 slug，以及 URL 编码过的形式。
   */
  function resolveSlug(slug, data) {
    data = data || activeData;
    if (!data || slug == null) return null;
    const content = data.content || {};
    const aliases = (data.meta && data.meta.aliases) || {};
    const candidates = [String(slug)];
    try {
      const decoded = decodeURIComponent(String(slug));
      if (decoded !== candidates[0]) candidates.push(decoded);
    } catch (e) { /* 不是合法的 URI 编码，原样用 */ }
    for (const s of candidates) {
      if (Object.prototype.hasOwnProperty.call(content, s)) return s;
      if (Object.prototype.hasOwnProperty.call(aliases, s) &&
          Object.prototype.hasOwnProperty.call(content, aliases[s])) return aliases[s];
    }
    return null;
  }

  /** 专题在目录树里的位置：{ topic, part, chapter }。 */
  function findTopic(slug, data) {
    data = data || activeData;
    const parts = (data && data.tree && data.tree.parts) || [];
    for (const part of parts) {
      for (const chapter of part.chapters || []) {
        for (const topic of chapter.topics || []) {
          if (topic.slug === slug) return { topic, part, chapter };
        }
      }
    }
    return null;
  }

  function positionKey(lang) { return POSITION_PREFIX + window.Languages.code(lang || activeLang); }

  function savedSlug() {
    try { return resolveSlug(localStorage.getItem(positionKey())); } catch (e) { return null; }
  }

  function savePosition(slug) {
    try { localStorage.setItem(positionKey(), slug); } catch (e) { /* 隐私模式等：只是不记位置 */ }
  }

  /** 正在看语法书时把专题写进地址栏（replaceState，不新增历史条目）。 */
  function syncRoute(slug) {
    const router = window.DimRouter;
    // DimRouter.href 收的是语言 key（german），activeLang 是代码（de）
    const shell = window.Shell;
    if (!router || !router.booted || !shell || shell.current() !== 'grammarBookScreen') return;
    const url = router.href(window.Languages.key(activeLang), 'grammarBookScreen') + '/' + slug;
    if (window.location.hash === url) return;
    try { window.history.replaceState(null, '', url); } catch (e) { /* file:// */ }
  }

  /**
   * 按任意 slug（新 / 旧 / 编码过的）打开专题；找不到时停在欢迎页并返回 false。
   */
  function openTopic(slug) {
    const resolved = resolveSlug(slug);
    const where = resolved && findTopic(resolved);
    if (!where) return false;
    loadTopic(resolved, where.topic.title, where.part.title, where.chapter.title);
    return true;
  }

  /**
   * Initialize or reinitialize with optional custom data.
   * Always rebuilds the nav tree AND the reading pane so switching between
   * Italian/German/English/French grammar data works correctly every time.
   * @param {Object|null} customData - Grammar data object with .tree and .content.
   *   If null/undefined, falls back to LangLoader.data(lang, 'grammar').
   * @param {Object} [options] - { lang } 可显式指定语言，缺省时自动识别。
   */
  function init(customData, options) {
    // 语言解析前置：调用方可能传 options.lang / options.language（代码或旧 key），
    // 都不传时回落到 resolveLang 的推断。语法数据按模块懒加载
    // （lib/languages.js profile.files.grammar），缺席时先补拉。
    const targetLang = resolveLang(customData, options);

    const data = customData || dataGlobalFor(targetLang) || null;

    if ((!data || !data.tree) && window.LangLoader
      && typeof window.LangLoader.ensureModule === 'function'
      && !window.LangLoader.isModuleLoaded(window.Languages.key(targetLang), 'grammar')) {
      window.LangLoader.ensureModule(window.Languages.key(targetLang), 'grammar')  // 加载器按语言 key 记账
        .then(() => init(customData, options));
      return; // 拉到后重试；仍缺席则走下方的错误 UI
    }

    activeLang = targetLang;

    if (!data || !data.tree) {
      const container = document.getElementById('grammarNavTree');
      if (container) {
        container.innerHTML =
          '<p class="grammar-nav-error">数据加载失败：' + escapeHtml(getProfile().title) + '数据未定义</p>';
      }
      activeData = null;
      applyChrome();
      renderWelcome();
      return;
    }

    activeData = data;
    currentSlug = null;
    applyChrome();
    buildNavTree(data.tree); // always rebuild tree when switching languages
    renderWelcome();         // always reset the reading pane — otherwise the
                             // previous language's chapter stays on screen
    announceScreenLanguage();

    if (!sidebarListenerAdded) {
      document.getElementById('grammarSidebarToggle')
        ?.addEventListener('click', toggleSidebar);
      if (narrowMql) {
        const onChange = () => syncSidebarToggle();
        if (typeof narrowMql.addEventListener === 'function') narrowMql.addEventListener('change', onChange);
        else if (typeof narrowMql.addListener === 'function') narrowMql.addListener(onChange);
      }
      sidebarListenerAdded = true;
    }
    syncSidebarToggle();
  }

  /** 侧边栏标题 / 返回按钮：共享屏必须自报语言，否则用户不知道自己在读哪一本。 */
  function applyChrome() {
    const navTitle = document.querySelector('#grammarBookScreen .grammar-nav-title');
    if (navTitle) {
      navTitle.innerHTML = '<span class="msr" aria-hidden="true">auto_stories</span>' + escapeHtml(getTitle());
    }

    const backBtn = document.getElementById('grammarBookBackBtn');
    if (backBtn) {
      backBtn.innerHTML = '<span class="msr" aria-hidden="true">arrow_back</span>返回语法';
    }
  }

  function renderWelcome() {
    const breadcrumb = document.getElementById('grammarContentBreadcrumb');
    const body = document.getElementById('grammarContentBody');
    if (breadcrumb) breadcrumb.textContent = getProfile().label + ' · 选择左侧章节开始阅读';
    if (!body) return;

    const tree = activeData && activeData.tree;
    const partCount = tree ? (tree.parts || []).length : 0;
    const topicCount = tree ? countTopics(tree) : 0;
    const scale = topicCount
      ? '<p>' + partCount + ' 个分组 · ' + topicCount + ' 篇专题</p>'
      : '';

    // 上次读到哪一篇（按语言代码记），给一个「继续阅读」入口
    const resume = activeData ? savedSlug() : null;
    const resumeAt = resume && findTopic(resume);
    const resumeBtn = resumeAt
      ? '<p><button type="button" class="btn grammar-resume-btn" data-grammar-resume="' + escapeHtml(resume) + '">' +
        '<span class="msr" aria-hidden="true">history</span>继续阅读：' + escapeHtml(resumeAt.topic.title) + '</button></p>'
      : '';

    body.innerHTML = `
      <div class="grammar-welcome">
        <span class="msr grammar-welcome-icon" aria-hidden="true">auto_stories</span>
        <h2>${escapeHtml(getTitle())}</h2>
        <p>${escapeHtml(getDescription())}</p>
        ${scale}
        ${resumeBtn}
      </div>`;
    const btn = body.querySelector('[data-grammar-resume]');
    if (btn) btn.addEventListener('click', () => openTopic(btn.getAttribute('data-grammar-resume')));
    body.scrollTop = 0;
  }

  /** 共享屏的语言上下文由 Shell 统一渲染（面包屑 / 顶栏），这里只通知重绘。 */
  function announceScreenLanguage() {
    if (window.Shell) window.Shell.renderChrome();
  }

  function buildNavTree(tree) {
    const container = document.getElementById('grammarNavTree');
    if (!container) return;
    container.innerHTML = '';

    const parts = tree.parts || [];
    if (!parts.length) {
      container.innerHTML = '<p class="grammar-nav-error">目录为空</p>';
      return;
    }

    // 小书（法语 / 英语）默认展开，大书（意大利语 99 篇）保持折叠。
    const expandByDefault = countTopics(tree) <= AUTO_EXPAND_TOPIC_LIMIT;

    parts.forEach(part => {
      const partEl = document.createElement('div');
      partEl.className = 'grammar-part';

      const partHeading = document.createElement('div');
      partHeading.className = 'grammar-part-heading';
      partHeading.textContent = part.title;
      partEl.appendChild(partHeading);

      const chapters = part.chapters || [];
      // 德语/法语/英语的目录常常是「分组 → 同名单章 → 专题」三层，中间那层是
      // 纯噪音，直接把专题挂到分组下，小目录才不会看起来空荡荡。
      const flatten = chapters.length === 1 && isRedundantChapter(part.title, chapters[0].title);

      chapters.forEach(ch => {
        if (flatten) {
          const topicList = document.createElement('div');
          topicList.className = 'grammar-topic-list';
          appendTopics(topicList, ch.topics, part.title, ch.title);
          partEl.appendChild(topicList);
          return;
        }

        const chapterEl = document.createElement('div');
        chapterEl.className = 'grammar-chapter';

        const chapterBtn = document.createElement('button');
        chapterBtn.className = 'grammar-chapter-btn' + (expandByDefault ? ' open' : '');
        chapterBtn.type = 'button';
        chapterBtn.setAttribute('aria-expanded', expandByDefault ? 'true' : 'false');
        chapterBtn.innerHTML =
          '<span class="grammar-chapter-arrow msr" aria-hidden="true">chevron_right</span>' +
          '<span class="grammar-chapter-label">' + escapeHtml(ch.title) + '</span>';

        const topicList = document.createElement('div');
        topicList.className = 'grammar-topic-list' + (expandByDefault ? '' : ' collapsed');
        topicList.id = 'grammarTopics-' + (++topicListSeq);
        chapterBtn.setAttribute('aria-controls', topicList.id);

        chapterBtn.addEventListener('click', () => {
          const isOpen = !topicList.classList.contains('collapsed');
          topicList.classList.toggle('collapsed', isOpen);
          chapterBtn.classList.toggle('open', !isOpen);
          chapterBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });

        appendTopics(topicList, ch.topics, part.title, ch.title);

        chapterEl.appendChild(chapterBtn);
        chapterEl.appendChild(topicList);
        partEl.appendChild(chapterEl);
      });

      container.appendChild(partEl);
    });
  }

  function isRedundantChapter(partTitle, chapterTitle) {
    const part = String(partTitle || '').trim();
    const chapter = String(chapterTitle || '').trim();
    if (!chapter) return true;
    return part === chapter || part.endsWith(chapter);
  }

  function appendTopics(topicList, topics, partTitle, chapterTitle) {
    (topics || []).forEach(topic => {
      const link = document.createElement('button');
      link.className = 'grammar-topic-link';
      link.dataset.slug = topic.slug;
      link.textContent = topic.title;
      link.addEventListener('click', () => {
        loadTopic(topic.slug, topic.title, partTitle, chapterTitle);
      });
      topicList.appendChild(link);
    });
  }

  function loadTopic(slug, title, partTitle, chapterTitle) {
    // 旧 slug（meta.aliases）也认；标题缺省时从目录树补
    slug = resolveSlug(slug) || slug;
    if (title === undefined) {
      const where = findTopic(slug);
      if (where) {
        title = where.topic.title;
        partTitle = where.part.title;
        chapterTitle = where.chapter.title;
      }
    }
    currentSlug = slug;

    // Update breadcrumb — 共享屏，必须带上语言；同名的「分组 › 单章」只留一层
    const bc = document.getElementById('grammarContentBreadcrumb');
    if (bc) {
      const chapter = isRedundantChapter(partTitle, chapterTitle) ? '' : chapterTitle;
      bc.textContent = [getProfile().label, partTitle, chapter, title]
        .filter(Boolean)
        .filter((value, index, list) => index === 0 || value !== list[index - 1])
        .join(' › ');
    }

    // Highlight active link
    document.querySelectorAll('.grammar-topic-link').forEach(el => {
      el.classList.toggle('active', el.dataset.slug === slug);
    });

    // Auto-expand parent chapter if collapsed
    const activeLink = document.querySelector(`.grammar-topic-link[data-slug="${CSS.escape(slug)}"]`);
    if (activeLink) {
      const list = activeLink.closest('.grammar-topic-list');
      if (list && list.classList.contains('collapsed')) {
        list.classList.remove('collapsed');
        list.previousElementSibling?.classList.add('open');
        list.previousElementSibling?.setAttribute('aria-expanded', 'true');
      }
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    const body = document.getElementById('grammarContentBody');
    if (!body) return;

    const text = activeData && activeData.content ? activeData.content[slug] : undefined;
    if (text === undefined) {
      body.innerHTML = '<div class="grammar-error">内容未找到：' + escapeHtml(slug) + '</div>';
      return;
    }
    savePosition(slug);
    syncRoute(slug);

    // marked 按需加载（index.html CdnFallback.load）。通常语法数据加载时已一并拉好，
    // 这里兜底：还没到就先占位，到了再按同一个 slug 重渲染（期间切走了就不管）。
    if (typeof window.marked === 'undefined' && window.CdnFallback) {
      body.innerHTML = '<div class="loading-message">加载中...</div>';
      window.CdnFallback.load('marked').then(() => {
        if (currentSlug === slug) loadTopic(slug, title, partTitle, chapterTitle);
      });
      return;
    }

    body.innerHTML = '<div class="grammar-markdown">' + renderMarkdown(text) + '</div>';
    body.scrollTop = 0;

    // On mobile, close sidebar after selecting topic
    if (isNarrow()) {
      getLayout()?.classList.remove('sidebar-open');
      syncSidebarToggle();
    }
  }

  // ==================== Markdown 渲染 ====================

  /**
   * marked 走 CDN，可能被墙 / 加载失败。渲染前必须在「调用时」检查，
   * 失败时降级为纯文本，而不是让整个阅读面板炸掉。
   */
  function renderMarkdown(text) {
    const md = (typeof marked !== 'undefined' && marked) || window.marked;
    if (md && typeof md.parse === 'function') {
      try {
        return md.parse(text);
      } catch (error) {
        console.error('marked.parse 失败，降级为纯文本', error);
      }
    }
    return '<p class="grammar-error">Markdown 渲染库未能加载（CDN 不可用），以下为纯文本内容。</p>' +
      '<pre style="white-space:pre-wrap;word-break:break-word;">' + escapeHtml(text) + '</pre>';
  }

  function toggleSidebar() {
    const layout = getLayout();
    if (!layout) return;
    if (isNarrow()) {
      layout.classList.toggle('sidebar-open');
    } else {
      layout.classList.toggle('sidebar-collapsed');
    }
    syncSidebarToggle();
  }

  return {
    init,
    loadTopic,
    openTopic,
    resolveSlug: (slug, data) => resolveSlug(slug, data),
    toggleSidebar,
    getLanguage: () => activeLang,
    getCurrentSlug: () => currentSlug
  };
})();

window.GrammarBook = GrammarBook;
