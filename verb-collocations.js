/**
 * VerbCollocations — 动词搭配查阅器
 * Uses VERB_COLLOCATIONS_DATA from data/verb-collocations-data.js
 */
const VerbCollocations = (() => {
  let initialized = false;
  const state = {
    activePrep: null,
    searchQuery: '',
    selectedVerbSlug: null,
  };

  const dom = {};

  function init() {
    if (initialized) return;
    initialized = true;

    cacheDom();

    if (typeof VERB_COLLOCATIONS_DATA === 'undefined') {
      dom.navTree.innerHTML =
        '<p class="grammar-nav-error">数据加载失败</p>';
      return;
    }

    bindEvents();
    buildPrepositionNav();
    renderDefaultView();
  }

  function open() {
    showScreen('verbCollocationsScreen');
    init();
    renderCurrentView();
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
  }

  function bindEvents() {
    dom.backBtn?.addEventListener('click', () => showScreen('grammarScreen'));

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

  function getPrepositionOrder() {
    return VERB_COLLOCATIONS_DATA?.meta?.prepositionOrder
      || Object.keys(VERB_COLLOCATIONS_DATA?.prepositions || {});
  }

  function getVerbMap() {
    return VERB_COLLOCATIONS_DATA?.verbs || {};
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

    const prepOrder = getPrepositionOrder();
    const prepMap = VERB_COLLOCATIONS_DATA.prepositions || {};

    prepOrder.forEach(prep => {
      const slugs = prepMap[prep] || [];
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
    const firstPrep = getPrepositionOrder().find(prep => (VERB_COLLOCATIONS_DATA.prepositions?.[prep] || []).length > 0);
    if (firstPrep) {
      selectPreposition(firstPrep, { preserveInput: true });
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
    if (dom.searchHelp) {
      dom.searchHelp.textContent = '输入动词后，右侧会按介词把该动词的搭配做成卡片显示。';
    }

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

  function updateSearch(rawQuery) {
    const query = rawQuery.trim();
    state.searchQuery = query;
    state.selectedVerbSlug = null;

    const matches = findVerbMatches(query);
    renderSearchMatches(matches);

    if (!query) {
      if (dom.searchHelp) {
        dom.searchHelp.textContent = '输入动词后，右侧会按介词把该动词的搭配做成卡片显示。';
      }
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
        display: data.display,
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
      '<button class="vc-search-match-btn' + (state.selectedVerbSlug === match.slug ? ' active' : '') + '" data-slug="' + escapeHtml(match.slug) + '">' +
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

    if (dom.searchHelp) {
      dom.searchHelp.textContent = matches.length === 1
        ? '已找到 1 个匹配动词。'
        : `已找到 ${matches.length} 个匹配动词，可直接点选。`;
    }
  }

  function renderPrepositionCards(prep) {
    const slugs = VERB_COLLOCATIONS_DATA.prepositions?.[prep] || [];
    const verbs = getVerbMap();
    const totalExamples = slugs.reduce((sum, slug) => sum + ((verbs[slug]?.prepositions?.[prep] || []).length), 0);

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `${prep} · ${slugs.length} 个动词`;
    }

    if (!slugs.length) {
      dom.body.innerHTML = emptyStateHtml('这个介词下暂时没有可显示的动词。');
      return;
    }

    const cardsHtml = slugs.map(slug => {
      const verb = verbs[slug];
      const examples = verb?.prepositions?.[prep] || [];
      return buildCardHtml({
        title: verb.display,
        badge: `+ ${prep}`,
        subtitle: `${examples.length} 条例句 / 搭配`,
        examples,
      });
    }).join('');

    dom.body.innerHTML =
      '<div class="vc-panel-intro">' +
        '<span class="vc-kicker">介词浏览</span>' +
        '<h2>介词 ' + escapeHtml(prep) + '</h2>' +
        '<p>共收录 ' + slugs.length + ' 个动词，' + totalExamples + ' 条搭配与例句。以下卡片默认展开。</p>' +
      '</div>' +
      '<div class="vc-card-grid">' + cardsHtml + '</div>';

    dom.body.scrollTop = 0;
  }

  function renderVerbCards(slug) {
    const verb = getVerbMap()[slug];

    if (!verb) {
      dom.body.innerHTML = emptyStateHtml('未找到该动词。');
      return;
    }

    const preps = verb.prepositionOrder || Object.keys(verb.prepositions || {});
    const totalExamples = preps.reduce((sum, prep) => sum + ((verb.prepositions?.[prep] || []).length), 0);

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `${verb.display} · ${preps.length} 组介词搭配`;
    }

    const cardsHtml = preps.map(prep => buildCardHtml({
      title: `介词 ${prep}`,
      badge: `${verb.display} + ${prep}`,
      subtitle: `${(verb.prepositions?.[prep] || []).length} 条搭配与例句`,
      examples: verb.prepositions?.[prep] || [],
    })).join('');

    dom.body.innerHTML =
      '<div class="vc-panel-intro">' +
        '<span class="vc-kicker">动词搜索</span>' +
        '<h2>' + escapeHtml(verb.display) + '</h2>' +
        '<p>共找到 ' + preps.length + ' 组介词搭配，' + totalExamples + ' 条搭配与例句。以下卡片默认展开。</p>' +
      '</div>' +
      '<div class="vc-card-grid vc-card-grid-search">' + cardsHtml + '</div>';

    dom.body.scrollTop = 0;
  }

  function renderSearchChooser(query, matches) {
    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `搜索：${query}`;
    }

    if (!matches.length) {
      dom.body.innerHTML = emptyStateHtml(`没有找到包含 “${escapeHtml(query)}” 的动词。`);
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
          '<button class="vc-search-choice-btn" data-slug="' + escapeHtml(match.slug) + '">' +
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
          examples.map(example => '<li class="vc-example-item">' + escapeHtml(example) + '</li>').join('') +
        '</ul>' +
      '</article>'
    );
  }

  function emptyStateHtml(message) {
    return (
      '<div class="vc-empty-state">' +
        '<svg class="icon vc-empty-state-icon"><use href="#icon-search"></use></svg>' +
        '<h2>没有可显示的内容</h2>' +
        '<p>' + message + '</p>' +
      '</div>'
    );
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

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return { init, open };
})();

// Wire up the card button — runs after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('goVerbCollocationsBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      VerbCollocations.open();
    });
  }
});
