/**
 * VerbCollocations — 动词搭配查阅器（语言无关）
 *
 * 数据源按语言解析：
 *   italian → VERB_COLLOCATIONS_DATA        (data/verb-collocations-data.js)
 *   german  → GERMAN_VERB_COLLOCATIONS_DATA
 *   english → ENGLISH_VERB_COLLOCATIONS_DATA
 *   french  → FRENCH_VERB_COLLOCATIONS_DATA
 *
 * 数据形状（德语额外支持 case 标记）：
 *   { meta: { prepositionOrder: [...] },
 *     verbs: { slug: { display, prepositionOrder, prepositions: {
 *                prep: ['例句 中文释义', ...]                 // 简单形式
 *                prep: { case: 'A', examples: [...] }        // 带格标记形式
 *              } } },
 *     prepositions: { prep: [verbSlug, ...] } }              // 可选，缺省时自动倒排
 *
 * 目前只有意大利语有数据；其余语言进入本屏时显示明确的空状态，而不是让功能
 * 悄无声息地不存在。数据一旦落盘（后续 workflow），无需改动本文件即可生效。
 */
const VerbCollocations = (() => {
  const LANGUAGES = ['italian', 'german', 'english', 'french'];

  const LANG_PROFILES = {
    italian: {
      label: '意大利语',
      title: '意大利语动词搭配',
      fallbackPreps: ['a', 'di', 'da', 'con', 'per', 'in'],
      hubSelector: '#grammarScreen .card-grid'
    },
    german: {
      label: '德语',
      title: '德语动词搭配',
      fallbackPreps: ['an', 'auf', 'für', 'mit', 'nach', 'über', 'um', 'von', 'zu'],
      hubSelector: '#germanGrammarScreen .card-grid'
    },
    english: {
      label: '英语',
      title: '英语动词搭配',
      fallbackPreps: ['about', 'at', 'for', 'from', 'in', 'of', 'on', 'to', 'with'],
      hubSelector: '#englishGrammarScreen .card-grid'
    },
    french: {
      label: '法语',
      title: '法语动词搭配',
      fallbackPreps: ['à', 'de', 'en', 'par', 'pour', 'sur', 'dans', 'avec'],
      hubSelector: '#frenchGrammarScreen .card-grid'
    }
  };

  // 德语支配格标签（数据里出现 case 时才用得上）
  const CASE_LABELS = { A: '第四格', D: '第三格', G: '第二格', N: '第一格' };

  let boundLang = null; // 已经绑定事件与导航的语言
  const state = {
    lang: 'italian',
    activePrep: null,
    searchQuery: '',
    selectedVerbSlug: null,
  };

  const dom = {};

  // ==================== 数据解析（全部在调用时做） ====================

  /**
   * 数据集都是 `const` 全局，不会挂到 window 上，因此必须在调用时用裸名字
   * + typeof 解析；绝不能在 parse 阶段读 window.X。
   */
  function resolveDataset(lang) {
    switch (lang) {
      case 'german':
        return typeof GERMAN_VERB_COLLOCATIONS_DATA !== 'undefined' ? GERMAN_VERB_COLLOCATIONS_DATA : null;
      case 'english':
        return typeof ENGLISH_VERB_COLLOCATIONS_DATA !== 'undefined' ? ENGLISH_VERB_COLLOCATIONS_DATA : null;
      case 'french':
        return typeof FRENCH_VERB_COLLOCATIONS_DATA !== 'undefined' ? FRENCH_VERB_COLLOCATIONS_DATA : null;
      case 'italian':
        return typeof VERB_COLLOCATIONS_DATA !== 'undefined' ? VERB_COLLOCATIONS_DATA : null;
      default:
        return null;
    }
  }

  function hasDataset(lang) {
    const data = resolveDataset(lang);
    return !!(data && data.verbs && Object.keys(data.verbs).length);
  }

  function profileFor(lang) {
    return LANG_PROFILES[lang] || LANG_PROFILES.italian;
  }

  function activeDataset() {
    return resolveDataset(state.lang);
  }

  function detectLang() {
    const bodyLang = document.body ? document.body.getAttribute('data-language') : null;
    return LANG_PROFILES[bodyLang] ? bodyLang : 'italian';
  }

  /** prep 条目可以是 ['例句'] 也可以是 { case, examples }。统一成后者。 */
  function normalizePrepEntry(entry) {
    if (Array.isArray(entry)) return { case: null, examples: entry };
    if (entry && Array.isArray(entry.examples)) {
      return { case: entry.case || null, examples: entry.examples };
    }
    return { case: null, examples: [] };
  }

  function getExamples(verb, prep) {
    return normalizePrepEntry(verb && verb.prepositions ? verb.prepositions[prep] : null).examples;
  }

  function getPrepCase(verb, prep) {
    return normalizePrepEntry(verb && verb.prepositions ? verb.prepositions[prep] : null).case;
  }

  function prepLabel(prep, prepCase) {
    if (!prepCase) return String(prep);
    return String(prep) + ' + ' + (CASE_LABELS[prepCase] || prepCase);
  }

  /**
   * 例句在数据里是「外语句 + 中文释义」拼在一起的单个字符串，很多条中间没有
   * 任何分隔符（'Abbandonò la testa sul cuscino.他把头靠在枕头上。'）。
   * 从第一个 CJK 码点切开，渲染时分两行显示。
   */
  function splitExample(raw) {
    const text = String(raw == null ? '' : raw).trim();
    if (!text) return { target: '', gloss: '' };

    const sentenceMatch = text.match(/^(.+?[.!?！？。])\s*([\u3000-\u303f\u4e00-\u9fff].*)$/);
    if (sentenceMatch) {
      return { target: sentenceMatch[1].trim(), gloss: sentenceMatch[2].trim() };
    }

    const splitIndex = text.search(/[\u4e00-\u9fff]/);
    if (splitIndex > 0) {
      return { target: text.slice(0, splitIndex).trim(), gloss: text.slice(splitIndex).trim() };
    }
    return { target: text, gloss: '' };
  }

  function getPrepositionOrder() {
    const data = activeDataset();
    if (!data) return [];
    return data.meta?.prepositionOrder || Object.keys(getPrepositionIndex());
  }

  function getVerbMap() {
    return activeDataset()?.verbs || {};
  }

  /** 数据里没有倒排表时按 verbs 现算一份，德语/法语数据可以不带 prepositions。 */
  const derivedPrepIndex = new WeakMap();

  function getPrepositionIndex() {
    const data = activeDataset();
    if (!data) return {};
    if (data.prepositions) return data.prepositions;

    if (!derivedPrepIndex.has(data)) {
      const index = {};
      Object.entries(data.verbs || {}).forEach(([slug, verb]) => {
        const preps = verb.prepositionOrder || Object.keys(verb.prepositions || {});
        preps.forEach(prep => {
          (index[prep] = index[prep] || []).push(slug);
        });
      });
      derivedPrepIndex.set(data, index);
    }
    return derivedPrepIndex.get(data);
  }

  function verbsForPrep(prep) {
    return getPrepositionIndex()[prep] || [];
  }

  // ==================== 生命周期 ====================

  function init(lang) {
    const target = LANG_PROFILES[lang] ? lang : detectLang();
    state.lang = target;

    cacheDom();
    if (boundLang === null) bindEvents();

    if (boundLang !== target) {
      state.activePrep = null;
      state.searchQuery = '';
      state.selectedVerbSlug = null;
      if (dom.searchInput) dom.searchInput.value = '';
      boundLang = target;
    }

    applyChrome();

    if (!hasDataset(target)) {
      renderMissingDataset();
      return;
    }

    buildPrepositionNav();
    renderDefaultView();
  }

  function open(lang) {
    showScreen('verbCollocationsScreen');
    init(lang);
    if (hasDataset(state.lang)) renderCurrentView();
  }

  function cacheDom() {
    dom.navTree = document.getElementById('vcNavTree');
    dom.backBtn = document.getElementById('vcBackBtn');
    dom.sidebarToggle = document.getElementById('vcSidebarToggle');
    dom.breadcrumb = document.getElementById('vcBreadcrumb');
    dom.body = document.getElementById('vcContentBody');
    dom.searchInput = document.getElementById('vcSearchInput');
    dom.searchMatches = document.getElementById('vcSearchMatches');
    dom.searchHelp = document.getElementById('vcSearchHelp');
    dom.navTitle = document.querySelector('#verbCollocationsScreen .grammar-nav-title');
  }

  function bindEvents() {
    dom.backBtn?.addEventListener('click', () => {
      const fallback = state.lang === 'italian' ? 'grammarScreen' : `${state.lang}GrammarScreen`;
      if (typeof goBack === 'function') goBack({ fallbackTarget: fallback });
      else showScreen(fallback);
    });

    dom.sidebarToggle?.addEventListener('click', toggleSidebar);

    dom.searchInput?.addEventListener('input', () => {
      const query = dom.searchInput.value.trim();
      updateSearch(query);
    });

    dom.searchInput?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;

      const matches = findVerbMatches(dom.searchInput.value.trim());
      if (matches.length === 1) {
        event.preventDefault();
        selectVerb(matches[0].slug, matches[0].display);
      }
    });
  }

  /** 共享屏：标题与返回按钮必须自报语言。 */
  function applyChrome() {
    const profile = profileFor(state.lang);
    if (dom.navTitle) {
      dom.navTitle.innerHTML = '<span class="msr">link</span>' + escapeHtml(profile.title);
    }
    if (dom.backBtn) {
      dom.backBtn.innerHTML = '<span class="msr">arrow_back</span>返回 ' +
        escapeHtml(state.lang === 'italian' ? 'Grammar' : profile.label + '语法');
    }
    if (dom.searchInput) {
      dom.searchInput.disabled = false;
      dom.searchInput.setAttribute('placeholder', `搜索${profile.label}动词...`);
    }
  }

  function normalizeText(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function closeMobileSidebar() {
    if (window.innerWidth < 768) {
      document.querySelector('#verbCollocationsScreen .grammar-book-layout')
        ?.classList.remove('sidebar-open');
    }
  }

  function buildPrepositionNav() {
    const container = dom.navTree;
    if (!container) return;
    container.innerHTML = '';

    getPrepositionOrder().forEach(prep => {
      const slugs = verbsForPrep(prep);
      if (!slugs.length) return;

      const btn = document.createElement('button');
      btn.className = 'vc-prep-link';
      btn.dataset.prep = prep;
      btn.innerHTML =
        '<span class="vc-prep-name">' + escapeHtml(prep) + '</span>' +
        '<span class="vc-prep-count">' + slugs.length + ' 个动词</span>';
      btn.addEventListener('click', () => selectPreposition(prep));

      container.appendChild(btn);
    });
  }

  function renderDefaultView() {
    const firstPrep = getPrepositionOrder().find(prep => verbsForPrep(prep).length > 0);
    if (firstPrep) {
      selectPreposition(firstPrep, { preserveInput: true });
    } else {
      renderMissingDataset();
    }
  }

  function renderCurrentView() {
    if (state.selectedVerbSlug) {
      renderVerbCards(state.selectedVerbSlug);
      renderSearchMatches(findVerbMatches(state.searchQuery));
      return;
    }

    if (state.searchQuery) {
      updateSearch(state.searchQuery);
      return;
    }

    if (state.activePrep) {
      renderPrepositionCards(state.activePrep);
      updatePrepositionActiveState();
      return;
    }

    renderDefaultView();
  }

  function updatePrepositionActiveState() {
    document.querySelectorAll('#vcNavTree .vc-prep-link').forEach(el => {
      el.classList.toggle('active', el.dataset.prep === state.activePrep && !state.searchQuery && !state.selectedVerbSlug);
    });
  }

  function selectPreposition(prep, options = {}) {
    state.activePrep = prep;
    state.searchQuery = '';
    state.selectedVerbSlug = null;

    if (!options.preserveInput && dom.searchInput) {
      dom.searchInput.value = '';
    }

    renderSearchMatches([]);
    setSearchHelp(defaultSearchHelp());

    updatePrepositionActiveState();
    renderPrepositionCards(prep);
    closeMobileSidebar();
  }

  function selectVerb(slug, displayName) {
    state.selectedVerbSlug = slug;
    state.searchQuery = displayName || getVerbMap()[slug]?.display || '';
    state.activePrep = null;

    if (dom.searchInput && displayName) {
      dom.searchInput.value = displayName;
    }

    renderSearchMatches(findVerbMatches(state.searchQuery));
    renderVerbCards(slug);
    updatePrepositionActiveState();
    closeMobileSidebar();
  }

  function defaultSearchHelp() {
    return `输入${profileFor(state.lang).label}动词后，右侧会按介词把该动词的搭配做成卡片显示。`;
  }

  function setSearchHelp(text) {
    if (dom.searchHelp) dom.searchHelp.textContent = text;
  }

  function updateSearch(rawQuery) {
    if (!hasDataset(state.lang)) return;

    const query = rawQuery.trim();
    state.searchQuery = query;
    state.selectedVerbSlug = null;

    const matches = findVerbMatches(query);
    renderSearchMatches(matches);

    if (!query) {
      setSearchHelp(defaultSearchHelp());
      if (state.activePrep) {
        renderPrepositionCards(state.activePrep);
      } else {
        renderDefaultView();
      }
      updatePrepositionActiveState();
      return;
    }

    const exactMatch = matches.find(match => normalizeText(match.display) === normalizeText(query));

    if (exactMatch) {
      state.selectedVerbSlug = exactMatch.slug;
      renderVerbCards(exactMatch.slug);
      return;
    }

    if (matches.length === 1) {
      state.selectedVerbSlug = matches[0].slug;
      renderVerbCards(matches[0].slug);
      return;
    }

    renderSearchChooser(query, matches);
  }

  function findVerbMatches(query) {
    const normalized = normalizeText(query);
    if (!normalized) return [];

    return Object.entries(getVerbMap())
      .map(([slug, data]) => ({
        slug,
        display: data.display || slug,
        prepositionCount: (data.prepositionOrder || Object.keys(data.prepositions || {})).length,
      }))
      .filter(item => normalizeText(item.display).includes(normalized))
      .sort((a, b) => a.display.localeCompare(b.display));
  }

  function renderSearchMatches(matches) {
    if (!dom.searchMatches) return;

    if (!state.searchQuery || !matches.length) {
      dom.searchMatches.innerHTML = '';
      return;
    }

    const topMatches = matches.slice(0, 12);
    dom.searchMatches.innerHTML = topMatches.map(match => (
      '<button class="vc-search-match-btn' + (state.selectedVerbSlug === match.slug ? ' active' : '') + '" data-slug="' + escapeAttribute(match.slug) + '">' +
        '<span class="vc-search-match-name">' + escapeHtml(match.display) + '</span>' +
        '<span class="vc-search-match-meta">' + match.prepositionCount + ' 组</span>' +
      '</button>'
    )).join('');

    dom.searchMatches.querySelectorAll('.vc-search-match-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.slug;
        const displayName = getVerbMap()[slug]?.display || btn.querySelector('.vc-search-match-name')?.textContent || '';
        selectVerb(slug, displayName);
      });
    });

    setSearchHelp(matches.length === 1
      ? '已找到 1 个匹配动词。'
      : `已找到 ${matches.length} 个匹配动词，可直接点选。`);
  }

  function renderPrepositionCards(prep) {
    if (!dom.body) return;

    const slugs = verbsForPrep(prep);
    const verbs = getVerbMap();
    const totalExamples = slugs.reduce((sum, slug) => sum + getExamples(verbs[slug], prep).length, 0);

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `${profileFor(state.lang).label} · ${prep} · ${slugs.length} 个动词`;
    }

    if (!slugs.length) {
      dom.body.innerHTML = emptyStateHtml({ message: '这个介词下暂时没有可显示的动词。' });
      return;
    }

    const cardsHtml = slugs.map(slug => {
      const verb = verbs[slug];
      if (!verb) return '';
      const prepCase = getPrepCase(verb, prep);
      return buildCardHtml({
        title: verb.display || slug,
        badge: '+ ' + prepLabel(prep, prepCase),
        subtitle: `${getExamples(verb, prep).length} 条例句 / 搭配`,
        examples: getExamples(verb, prep),
      });
    }).join('');

    dom.body.innerHTML =
      '<div class="vc-panel-intro">' +
        '<span class="vc-kicker">介词浏览</span>' +
        '<h2>介词 ' + escapeHtml(prep) + '</h2>' +
        '<p>共收录 ' + slugs.length + ' 个动词，' + totalExamples + ' 条搭配与例句。</p>' +
      '</div>' +
      '<div class="vc-card-grid">' + cardsHtml + '</div>';

    dom.body.scrollTop = 0;
  }

  function renderVerbCards(slug) {
    if (!dom.body) return;

    const verb = getVerbMap()[slug];

    if (!verb) {
      dom.body.innerHTML = emptyStateHtml({ message: '未找到该动词。' });
      return;
    }

    const preps = verb.prepositionOrder || Object.keys(verb.prepositions || {});
    const totalExamples = preps.reduce((sum, prep) => sum + getExamples(verb, prep).length, 0);
    const display = verb.display || slug;

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `${profileFor(state.lang).label} · ${display} · ${preps.length} 组介词搭配`;
    }

    const cardsHtml = preps.map(prep => {
      const prepCase = getPrepCase(verb, prep);
      return buildCardHtml({
        title: '介词 ' + prepLabel(prep, prepCase),
        badge: `${display} + ${prep}`,
        subtitle: `${getExamples(verb, prep).length} 条搭配与例句`,
        examples: getExamples(verb, prep),
      });
    }).join('');

    dom.body.innerHTML =
      '<div class="vc-panel-intro">' +
        '<span class="vc-kicker">动词搜索</span>' +
        '<h2>' + escapeHtml(display) + '</h2>' +
        '<p>共找到 ' + preps.length + ' 组介词搭配，' + totalExamples + ' 条搭配与例句。</p>' +
      '</div>' +
      '<div class="vc-card-grid vc-card-grid-search">' + cardsHtml + '</div>';

    dom.body.scrollTop = 0;
  }

  function renderSearchChooser(query, matches) {
    if (!dom.body) return;

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `${profileFor(state.lang).label} · 搜索：${query}`;
    }

    if (!matches.length) {
      dom.body.innerHTML = emptyStateHtml({
        title: '没有匹配的动词',
        message: `没有找到包含 “${query}” 的${profileFor(state.lang).label}动词。`,
      });
      return;
    }

    dom.body.innerHTML =
      '<div class="vc-panel-intro">' +
        '<span class="vc-kicker">搜索结果</span>' +
        '<h2>“' + escapeHtml(query) + '”</h2>' +
        '<p>找到 ' + matches.length + ' 个匹配动词。点选一个后，右侧会按介词显示该动词的全部卡片。</p>' +
      '</div>' +
      '<div class="vc-search-choice-grid">' +
        matches.slice(0, 60).map(match => (
          '<button class="vc-search-choice-btn" data-slug="' + escapeAttribute(match.slug) + '">' +
            '<span class="vc-search-choice-name">' + escapeHtml(match.display) + '</span>' +
            '<span class="vc-search-choice-meta">' + match.prepositionCount + ' 组介词搭配</span>' +
          '</button>'
        )).join('') +
      '</div>';

    dom.body.querySelectorAll('.vc-search-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.slug;
        selectVerb(slug, getVerbMap()[slug]?.display || '');
      });
    });

    dom.body.scrollTop = 0;
  }

  function buildCardHtml({ title, badge, subtitle, examples }) {
    return (
      '<article class="vc-card">' +
        '<div class="vc-card-header">' +
          '<div>' +
            '<h3 class="vc-card-title">' + escapeHtml(title) + '</h3>' +
            '<p class="vc-card-subtitle">' + escapeHtml(subtitle) + '</p>' +
          '</div>' +
          '<span class="vc-card-badge">' + escapeHtml(badge) + '</span>' +
        '</div>' +
        '<ul class="vc-example-list">' +
          (examples || []).map(buildExampleHtml).join('') +
        '</ul>' +
      '</article>'
    );
  }

  /** 外语句与中文释义必须分行，否则 1000+ 条例句会糊成一串。 */
  function buildExampleHtml(example) {
    const parts = splitExample(example);
    if (!parts.gloss) {
      return '<li class="vc-example-item">' + escapeHtml(parts.target) + '</li>';
    }
    return '<li class="vc-example-item">' +
      '<span class="vc-example-target" style="display:block;">' + escapeHtml(parts.target) + '</span>' +
      '<span class="vc-example-gloss" style="display:block;color:var(--muted);font-size:0.88em;">' +
        escapeHtml(parts.gloss) +
      '</span>' +
    '</li>';
  }

  function emptyStateHtml({ title, message, icon } = {}) {
    return (
      '<div class="vc-empty-state">' +
        '<span class="msr vc-empty-state-icon">' + escapeHtml(icon || 'search') + '</span>' +
        '<h2>' + escapeHtml(title || '没有可显示的内容') + '</h2>' +
        '<p>' + escapeHtml(message || '') + '</p>' +
      '</div>'
    );
  }

  /** 该语言还没有动词搭配数据时的明确空状态（而不是入口静默消失）。 */
  function renderMissingDataset() {
    const profile = profileFor(state.lang);

    if (dom.navTree) {
      dom.navTree.innerHTML = '<p class="grammar-nav-error">该语言暂无动词搭配数据</p>';
    }
    if (dom.searchMatches) dom.searchMatches.innerHTML = '';
    if (dom.searchInput) {
      dom.searchInput.value = '';
      dom.searchInput.disabled = true;
    }
    setSearchHelp(`${profile.label}动词搭配数据尚未接入。`);
    if (dom.breadcrumb) dom.breadcrumb.textContent = `${profile.label} · 暂无数据`;

    if (dom.body) {
      dom.body.innerHTML = emptyStateHtml({
        icon: 'hourglass_empty',
        title: '该语言暂无动词搭配数据',
        message: `${profile.title}词库还在建设中。阅读器与练习模块已经支持${profile.label}，数据落盘后无需改动即可直接使用；` +
          '目前可以先使用意大利语动词搭配，或前往语法书阅读相关章节。',
      });
    }

    const availableLangs = LANGUAGES.filter(lang => lang !== state.lang && hasDataset(lang));
    if (!availableLangs.length || !dom.body) return;

    const actions = document.createElement('div');
    actions.className = 'vc-search-choice-grid';
    availableLangs.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'vc-search-choice-btn';
      btn.innerHTML =
        '<span class="vc-search-choice-name">' + escapeHtml(profileFor(lang).title) + '</span>' +
        '<span class="vc-search-choice-meta">改为浏览已接入的搭配数据</span>';
      btn.addEventListener('click', () => open(lang));
      actions.appendChild(btn);
    });
    dom.body.querySelector('.vc-empty-state')?.appendChild(actions);
  }

  function toggleSidebar() {
    const layout = document.querySelector('#verbCollocationsScreen .grammar-book-layout');
    if (!layout) return;
    if (window.innerWidth < 768) {
      layout.classList.toggle('sidebar-open');
    } else {
      layout.classList.toggle('sidebar-collapsed');
    }
  }

  return {
    init,
    open,
    LANGUAGES,
    resolveDataset,
    hasDataset,
    profileFor,
    normalizePrepEntry,
    prepLabel,
    splitExample,
    getLanguage: () => state.lang,
  };
})();

// 供 verb-collocations-practice.js 复用的语言/数据解析层
window.VerbCollocations = VerbCollocations;

(function wireEntryPoints() {
  /**
   * 德语/英语/法语的语法中心原本没有任何动词搭配入口，功能等于不存在。
   * 这里在运行时补上入口卡片（不改 index.html），数据缺失时卡片文案明确说明
   * 「暂无数据」，点进去看到的是空状态而不是坏页。数据落盘后自动升级为可用入口。
   */
  function installLanguageHubCards() {
    ['german', 'english', 'french'].forEach(lang => {
      const profile = VerbCollocations.profileFor(lang);
      const grid = document.querySelector(profile.hubSelector);
      if (!grid || grid.querySelector(`[data-vc-lang="${lang}"]`)) return;

      const ready = VerbCollocations.hasDataset(lang);

      const browseBtn = document.createElement('button');
      browseBtn.className = 'card';
      browseBtn.dataset.vcLang = lang;
      browseBtn.innerHTML =
        '<span class="card-chip"><span class="msr">link</span></span>' +
        '<span class="card-title">动词搭配</span>' +
        '<span class="card-desc">' +
          (ready ? '按介词浏览动词搭配与例句' : '该语言暂无动词搭配数据（建设中）') +
        '</span>';
      browseBtn.addEventListener('click', () => VerbCollocations.open(lang));
      grid.appendChild(browseBtn);

      if (!ready) return;

      const practiceBtn = document.createElement('button');
      practiceBtn.className = 'card';
      practiceBtn.dataset.vcLang = lang;
      practiceBtn.dataset.vcMode = 'practice';
      practiceBtn.innerHTML =
        '<span class="card-chip"><span class="msr">extension</span></span>' +
        '<span class="card-title">动词搭配练习</span>' +
        '<span class="card-desc">单介词选择、多介词辨义、例句翻译</span>';
      practiceBtn.addEventListener('click', () => {
        if (window.VerbCollocationPractice) window.VerbCollocationPractice.open(lang);
      });
      grid.appendChild(practiceBtn);
    });
  }

  // Wire up the card buttons — runs after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('goVerbCollocationsBtn')
      ?.addEventListener('click', () => VerbCollocations.open('italian'));

    installLanguageHubCards();
  });
})();
