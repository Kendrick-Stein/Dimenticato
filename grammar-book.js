/**
 * GrammarBook — 语法书阅读器（意大利语 / 德语 / 英语 / 法语共用一块屏）
 * Uses embedded *_GRAMMAR_DATA globals (from data/*-grammar-data.js) instead of
 * fetch() to avoid GitHub Pages issues with Chinese-character filenames.
 *
 * 阅读器是共享屏，所以它必须自己知道当前是哪种语言：标题、面包屑、返回按钮
 * 与正文中的图片根目录全部由 LANG_PROFILES 决定，调用方不必再手动改 DOM。
 */
const GrammarBook = (() => {
  let sidebarListenerAdded = false;
  let currentSlug = null;
  let activeData = null; // currently loaded grammar data
  let activeLang = 'italian';

  // 小目录树（法语 23 篇 / 英语 5 篇）默认全部展开，避免只剩一列折叠标题看起来像坏页。
  const AUTO_EXPAND_TOPIC_LIMIT = 48;

  const LANG_PROFILES = {
    italian: {
      label: '意大利语',
      title: '意大利语语法',
      description: '请从左侧目录选择章节开始阅读',
      backLabel: 'Grammar'
    },
    german: {
      label: '德语',
      title: '德语语法',
      description: '请从左侧目录选择章节开始阅读',
      backLabel: '德语语法'
    },
    english: {
      label: '英语',
      title: '英语语法',
      description: '请从左侧目录选择 A1-C1 专题开始阅读',
      backLabel: 'English Grammar'
    },
    french: {
      label: '法语',
      title: '法语语法',
      description: '请从左侧目录选择 A1-B1 专题开始阅读',
      backLabel: 'French Grammar'
    }
  };

  function getLayout() {
    return document.querySelector('#grammarBookScreen .grammar-book-layout');
  }

  // 语法数据按模块懒加载，注册在 DIM_DATA.grammar.<code>，调用时取
  function dataGlobalFor(lang) {
    return window.LangLoader ? window.LangLoader.data(lang, 'grammar') : null;
  }

  /** 从「调用方传进来的数据对象」反推语言，调用方无需改代码。 */
  function resolveLang(data, options) {
    const explicit = options && options.lang;
    if (explicit && LANG_PROFILES[explicit]) return explicit;

    if (data) {
      const match = Object.keys(LANG_PROFILES).find(lang => dataGlobalFor(lang) === data);
      if (match) return match;
      if (data.meta && LANG_PROFILES[data.meta.lang]) return data.meta.lang;
    }

    const bodyLang = document.body ? document.body.getAttribute('data-language') : null;
    if (bodyLang && LANG_PROFILES[bodyLang]) return bodyLang;

    return 'italian';
  }

  function getProfile(lang) {
    return LANG_PROFILES[lang || activeLang] || LANG_PROFILES.italian;
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

  /**
   * Initialize or reinitialize with optional custom data.
   * Always rebuilds the nav tree AND the reading pane so switching between
   * Italian/German/English/French grammar data works correctly every time.
   * @param {Object|null} customData - Grammar data object with .tree and .content.
   *   If null/undefined, falls back to LangLoader.data(lang, 'grammar').
   * @param {Object} [options] - { lang } 可显式指定语言，缺省时自动识别。
   */
  function init(customData, options) {
    // 语言解析前置：调用方可能传 options.lang（router）或 options.language
    // （german-app），都不传时回落到 resolveLang 的推断。语法数据现在是
    // 按模块懒加载的（lib/languages.js profile.files.grammar），缺席时先补拉。
    const explicit = options && (options.lang || options.language);
    const targetLang = (explicit && LANG_PROFILES[explicit])
      ? explicit
      : resolveLang(customData, options);

    const data = customData || dataGlobalFor(targetLang) || null;

    if ((!data || !data.tree) && window.LangLoader
      && typeof window.LangLoader.ensureModule === 'function'
      && !window.LangLoader.isModuleLoaded(targetLang, 'grammar')) {
      window.LangLoader.ensureModule(targetLang, 'grammar')
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
      sidebarListenerAdded = true;
    }
  }

  /** 侧边栏标题 / 返回按钮：共享屏必须自报语言，否则用户不知道自己在读哪一本。 */
  function applyChrome() {
    const profile = getProfile();

    const navTitle = document.querySelector('#grammarBookScreen .grammar-nav-title');
    if (navTitle) {
      navTitle.innerHTML = '<span class="msr" aria-hidden="true">auto_stories</span>' + escapeHtml(getTitle());
    }

    const backBtn = document.getElementById('grammarBookBackBtn');
    if (backBtn) {
      backBtn.innerHTML = '<span class="msr" aria-hidden="true">arrow_back</span>返回 ' + escapeHtml(profile.backLabel);
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

    body.innerHTML = `
      <div class="grammar-welcome">
        <span class="msr grammar-welcome-icon" aria-hidden="true">auto_stories</span>
        <h2>${escapeHtml(getTitle())}</h2>
        <p>${escapeHtml(getDescription())}</p>
        ${scale}
      </div>`;
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
        chapterBtn.innerHTML =
          '<span class="grammar-chapter-arrow msr" aria-hidden="true">chevron_right</span>' +
          '<span class="grammar-chapter-label">' + escapeHtml(ch.title) + '</span>';

        const topicList = document.createElement('div');
        topicList.className = 'grammar-topic-list' + (expandByDefault ? '' : ' collapsed');

        chapterBtn.addEventListener('click', () => {
          const isOpen = !topicList.classList.contains('collapsed');
          topicList.classList.toggle('collapsed', isOpen);
          chapterBtn.classList.toggle('open', !isOpen);
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

    // marked 按需加载（index.html CdnFallback.load）。通常语法数据加载时已一并拉好，
    // 这里兜底：还没到就先占位，到了再按同一个 slug 重渲染（期间切走了就不管）。
    if (typeof window.marked === 'undefined' && window.CdnFallback) {
      body.innerHTML = '<div class="loading-message">加载中...</div>';
      window.CdnFallback.load('marked').then(() => {
        if (currentSlug === slug) loadTopic(slug, title, partTitle, chapterTitle);
      });
      return;
    }

    const roots = imageRootsFor(slug, partTitle);
    body.innerHTML = '<div class="grammar-markdown">' +
      renderMarkdown(rewriteMarkdownImages(text, roots)) + '</div>';
    enhanceImages(body, roots);
    body.scrollTop = 0;

    // On mobile, close sidebar after selecting topic
    if (window.innerWidth < 768) {
      getLayout()?.classList.remove('sidebar-open');
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

  // ==================== 正文图片路径修复 ====================

  const MD_IMAGE_RE = /(!\[[^\]]*\]\()\s*([^)\s]+)((?:\s+"[^"]*")?\s*\))/g;

  function imageRootsFor(slug, partTitle) {
    const profile = getProfile();
    if (typeof profile.imageRoots !== 'function') return [];
    const roots = profile.imageRoots(slug, partTitle) || [];
    return roots.filter((root, index) => root && roots.indexOf(root) === index);
  }

  function isExternalUrl(url) {
    return /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url);
  }

  /** `.\img\X.png` / `./img/X.png` → 仓库里真实存在的目录。 */
  function imageFileName(url) {
    const normalized = String(url || '').replace(/\\/g, '/').split(/[?#]/)[0];
    const base = normalized.slice(normalized.lastIndexOf('/') + 1);
    try {
      return decodeURIComponent(base);
    } catch (error) {
      return base;
    }
  }

  function imageCandidates(url, roots) {
    const file = imageFileName(url);
    if (!file || !roots.length) return [];
    return roots.map(root => root + encodeURI(file));
  }

  function rewriteMarkdownImages(text, roots) {
    if (!roots.length) return text;
    return String(text).replace(MD_IMAGE_RE, (full, head, url, tail) => {
      if (isExternalUrl(url)) return full;
      const candidates = imageCandidates(url, roots);
      return candidates.length ? head + candidates[0] + tail : full;
    });
  }

  /**
   * 渲染后处理：约束尺寸、按候选目录逐个重试，全部失败时给出带文件名的占位块，
   * 而不是浏览器默认的碎图标。
   */
  function enhanceImages(body, roots) {
    body.querySelectorAll('.grammar-markdown img').forEach(img => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '1em 0';
      img.setAttribute('loading', 'lazy');

      const file = imageFileName(img.getAttribute('src'));
      if (!img.getAttribute('alt')) img.setAttribute('alt', file);

      const candidates = roots.length ? imageCandidates(img.getAttribute('src'), roots) : [];
      let attempt = 0;
      img.addEventListener('error', () => {
        attempt += 1;
        if (attempt < candidates.length) {
          img.src = candidates[attempt];
          return;
        }
        replaceWithPlaceholder(img, file);
      });
    });
  }

  function replaceWithPlaceholder(img, file) {
    if (!img.parentNode) return;
    const placeholder = document.createElement('span');
    placeholder.className = 'grammar-error grammar-figure-missing';
    placeholder.style.display = 'block';
    placeholder.innerHTML = '<span class="msr" aria-hidden="true">broken_image</span> 图示缺失：' + escapeHtml(file || '未知文件');
    img.parentNode.replaceChild(placeholder, img);
  }

  function toggleSidebar() {
    const layout = getLayout();
    if (!layout) return;
    if (window.innerWidth < 768) {
      layout.classList.toggle('sidebar-open');
    } else {
      layout.classList.toggle('sidebar-collapsed');
    }
  }

  return {
    init,
    loadTopic,
    toggleSidebar,
    getLanguage: () => activeLang,
    getCurrentSlug: () => currentSlug
  };
})();

window.GrammarBook = GrammarBook;
