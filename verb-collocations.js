/**
 * VerbCollocations — 动词搭配查阅器（语言无关）
 *
 * 数据：DIM_DATA.collocations.<code>，schema collocations/1（docs/data-schema.md），
 * 按模块懒加载（lib/languages.js files.collocations → lib/lang-loader.js）：
 *   { meta: { lang, name, count, sources, … },
 *     keys:  [{ key, label, kind, case?, zh? }],            // 介词 / 小品词 / 带格介词，按展示顺序
 *     verbs: { <word>: { word, display?, order: [key…], keys: { <key>: [{ text, zh }] } } },
 *     index: { <key>: [<word>…] } }
 *
 * 语言差异全部在数据里：德语的格写在 keys[].case / label（"an + Akk."），英语的小品词
 * 写在 keys[].kind；本文件不按语言分支。语言标签取自 Languages（lib/languages.js），
 * 标题取 meta.name。某语言数据缺席时进入本屏显示明确的空状态。
 *
 * 下方暴露的解析层（dataset / keysOf / examples / keyLabel …）供
 * verb-collocations-practice.js 复用。
 */
const VerbCollocations = (() => {
  const MODULE = 'collocations';

  let boundLang = null;       // 已经绑定事件与导航的语言（code）
  let openedByEntry = false;  // 是否已经有入口显式打开过（入口一定会带上语言）
  const state = {
    lang: null,               // 语言 code（'it' / 'de' / …）
    activeKey: null,
    searchQuery: '',
    selectedVerb: null,
  };

  const dom = {};

  // ==================== 语言 / 数据解析层（调用时解析） ====================

  /** 入口给的是 code 或旧 key（app.js 传 key）；缺省时按外壳 body[data-language]。 */
  function resolveLang(lang) {
    const code = Languages.code(lang)
      || Languages.code(document.body ? document.body.getAttribute('data-language') : null);
    return code || Languages.DEFAULT;
  }

  function profile(lang) {
    return Languages.get(lang) || Languages.get(Languages.DEFAULT);
  }

  function dataset(lang) {
    return window.LangLoader ? window.LangLoader.data(lang, MODULE) : null;
  }

  function hasDataset(lang) {
    const data = dataset(lang);
    return !!(data && data.verbs && Object.keys(data.verbs).length);
  }

  /** 数据未加载时补拉；已经尝试过（或没有该模块）返回 null，调用方走缺数状态。 */
  function ensureDataset(lang) {
    // LangLoader 接受 code 或 key，不必再换算
    const loader = window.LangLoader;
    if (!loader || !lang || typeof loader.ensureModule !== 'function') return null;
    if (!Languages.hasModule(lang, MODULE) || loader.isModuleLoaded(lang, MODULE)) return null;
    return loader.ensureModule(lang, MODULE);
  }

  function title(lang) {
    const data = dataset(lang);
    return (data && data.meta && data.meta.name) || profile(lang).cn + '动词搭配';
  }

  function keysOf(verb) {
    return (verb && (verb.order || Object.keys(verb.keys || {}))) || [];
  }

  /** 例句恒为 { text, zh }。 */
  function examples(verb, key) {
    return (verb && verb.keys && verb.keys[key]) || [];
  }

  function displayOf(verb, word) {
    return (verb && (verb.display || verb.word)) || word;
  }

  function keyRecord(data, key) {
    const list = (data && data.keys) || [];
    for (let i = 0; i < list.length; i++) if (list[i].key === key) return list[i];
    return null;
  }

  /** 展示用标签：德语 "an + Akk."，其余语言即介词本身。 */
  function keyLabel(data, key) {
    const rec = keyRecord(data, key);
    return (rec && rec.label) || String(key);
  }

  /** 按展示顺序的全部键（导航 / 练习干扰项）。 */
  function keyOrder(data) {
    if (!data) return [];
    if (Array.isArray(data.keys) && data.keys.length) return data.keys.map(rec => rec.key);
    return Object.keys(data.index || {});
  }

  function verbsForKey(data, key) {
    return (data && data.index && data.index[key]) || [];
  }

  /** 搜索 / 判分统一的宽松比较（抹重音、小写、合并空白）。 */
  function looseKey(text) {
    return DimText.normalizeText(text, { fold: true });
  }

  function activeDataset() {
    return dataset(state.lang);
  }

  function getVerbMap() {
    return activeDataset()?.verbs || {};
  }

  // ==================== 生命周期 ====================

  function init(lang) {
    const target = resolveLang(lang);
    state.lang = target;

    cacheDom();
    if (boundLang === null) bindEvents();

    if (boundLang !== target) {
      state.activeKey = null;
      state.searchQuery = '';
      state.selectedVerb = null;
      if (dom.searchInput) dom.searchInput.value = '';
      boundLang = target;
    }

    applyChrome();

    if (!hasDataset(target)) {
      // 搭配数据按模块懒加载：缺席时补拉后重试 init；拉不到才显示缺数状态
      const pending = ensureDataset(target);
      if (pending) {
        pending.then(() => { if (state.lang === target) init(target); });
        return;
      }
      renderMissingDataset();
      return;
    }

    applyChrome(); // 数据到位后标题改用 meta.name
    buildKeyNav();
    renderDefaultView();
  }

  function open(lang) {
    openedByEntry = true; // 必须先置位：showScreen 会同步广播 screenchange
    showScreen('verbCollocationsScreen');
    init(lang);
    if (hasDataset(state.lang)) renderCurrentView();
  }

  /**
   * 这块屏幕也可能不经任何入口就被切出来：刷新一个
   * `#/de/grammar/collocations` 书签时，路由（lib/shell.js）直接 showScreen()，
   * 没人告诉阅读器该显示哪种语言，结果是一块从未渲染过的空壳。
   * 这里只在「本次会话还没有入口打开过阅读器」时补一次初始化，语言按外壳解析；
   * 已经打开过就保持现状，不覆盖用户正在浏览的语言（例如空状态里跨语言跳过来的）。
   */
  document.addEventListener('dimenticato:screenchange', (event) => {
    const screenId = event.detail && event.detail.screenId;
    if (screenId !== 'verbCollocationsScreen' || openedByEntry) return;
    openedByEntry = true;
    init();
  });

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
      if (typeof goBack === 'function') goBack({ fallbackTarget: 'grammarScreen' });
      else showScreen('grammarScreen');
    });

    dom.sidebarToggle?.addEventListener('click', toggleSidebar);

    dom.searchInput?.addEventListener('input', () => {
      updateSearch(dom.searchInput.value.trim());
    });

    dom.searchInput?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;

      const matches = findVerbMatches(dom.searchInput.value.trim());
      if (matches.length === 1) {
        event.preventDefault();
        selectVerb(matches[0].word, matches[0].display);
      }
    });
  }

  /** 共享屏：标题与返回按钮必须自报语言。 */
  function applyChrome() {
    if (dom.navTitle) {
      dom.navTitle.innerHTML = '<span class="msr" aria-hidden="true">link</span>' + escapeHtml(title(state.lang));
    }
    if (dom.backBtn) {
      dom.backBtn.innerHTML = '<span class="msr" aria-hidden="true">arrow_back</span>返回语法';
    }
    if (dom.searchInput) {
      dom.searchInput.disabled = false;
      dom.searchInput.setAttribute('placeholder', `搜索${profile(state.lang).cn}动词...`);
    }
  }

  function closeMobileSidebar() {
    if (window.innerWidth < 768) {
      document.querySelector('#verbCollocationsScreen .grammar-book-layout')
        ?.classList.remove('sidebar-open');
    }
  }

  function buildKeyNav() {
    const container = dom.navTree;
    if (!container) return;
    container.innerHTML = '';
    const data = activeDataset();

    keyOrder(data).forEach(key => {
      const words = verbsForKey(data, key);
      if (!words.length) return;

      const rec = keyRecord(data, key);
      const btn = document.createElement('button');
      btn.className = 'vc-prep-link';
      btn.dataset.prep = key;
      if (rec && rec.zh) btn.title = rec.zh;
      btn.innerHTML =
        '<span class="vc-prep-name">' + escapeHtml(keyLabel(data, key)) + '</span>' +
        '<span class="vc-prep-count">' + words.length + ' 个动词</span>';
      btn.addEventListener('click', () => selectKey(key));

      container.appendChild(btn);
    });
  }

  function renderDefaultView() {
    const data = activeDataset();
    const firstKey = keyOrder(data).find(key => verbsForKey(data, key).length > 0);
    if (firstKey) {
      selectKey(firstKey, { preserveInput: true });
    } else {
      renderMissingDataset();
    }
  }

  function renderCurrentView() {
    if (state.selectedVerb) {
      renderVerbCards(state.selectedVerb);
      renderSearchMatches(findVerbMatches(state.searchQuery));
      return;
    }

    if (state.searchQuery) {
      updateSearch(state.searchQuery);
      return;
    }

    if (state.activeKey) {
      renderKeyCards(state.activeKey);
      updateKeyActiveState();
      return;
    }

    renderDefaultView();
  }

  function updateKeyActiveState() {
    document.querySelectorAll('#vcNavTree .vc-prep-link').forEach(el => {
      el.classList.toggle('active', el.dataset.prep === state.activeKey && !state.searchQuery && !state.selectedVerb);
    });
  }

  function selectKey(key, options = {}) {
    state.activeKey = key;
    state.searchQuery = '';
    state.selectedVerb = null;

    if (!options.preserveInput && dom.searchInput) {
      dom.searchInput.value = '';
    }

    renderSearchMatches([]);
    setSearchHelp(defaultSearchHelp());

    updateKeyActiveState();
    renderKeyCards(key);
    closeMobileSidebar();
  }

  function selectVerb(word, displayName) {
    state.selectedVerb = word;
    state.searchQuery = displayName || displayOf(getVerbMap()[word], word);
    state.activeKey = null;

    if (dom.searchInput && displayName) {
      dom.searchInput.value = displayName;
    }

    renderSearchMatches(findVerbMatches(state.searchQuery));
    renderVerbCards(word);
    updateKeyActiveState();
    closeMobileSidebar();
  }

  function defaultSearchHelp() {
    return `输入${profile(state.lang).cn}动词后，右侧会按介词把该动词的搭配做成卡片显示。`;
  }

  function setSearchHelp(text) {
    if (dom.searchHelp) dom.searchHelp.textContent = text;
  }

  function updateSearch(rawQuery) {
    if (!hasDataset(state.lang)) return;

    const query = rawQuery.trim();
    state.searchQuery = query;
    state.selectedVerb = null;

    const matches = findVerbMatches(query);
    renderSearchMatches(matches);

    if (!query) {
      setSearchHelp(defaultSearchHelp());
      if (state.activeKey) {
        renderKeyCards(state.activeKey);
      } else {
        renderDefaultView();
      }
      updateKeyActiveState();
      return;
    }

    const exactMatch = matches.find(match => looseKey(match.display) === looseKey(query));

    if (exactMatch) {
      state.selectedVerb = exactMatch.word;
      renderVerbCards(exactMatch.word);
      return;
    }

    if (matches.length === 1) {
      state.selectedVerb = matches[0].word;
      renderVerbCards(matches[0].word);
      return;
    }

    renderSearchChooser(query, matches);
  }

  function findVerbMatches(query) {
    const normalized = looseKey(query);
    if (!normalized) return [];

    return Object.entries(getVerbMap())
      .map(([word, verb]) => ({
        word,
        display: displayOf(verb, word),
        keyCount: keysOf(verb).length,
      }))
      .filter(item => looseKey(item.display).includes(normalized))
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
      '<button class="vc-search-match-btn' + (state.selectedVerb === match.word ? ' active' : '') + '" data-slug="' + escapeAttribute(match.word) + '">' +
        '<span class="vc-search-match-name">' + escapeHtml(match.display) + '</span>' +
        '<span class="vc-search-match-meta">' + match.keyCount + ' 组</span>' +
      '</button>'
    )).join('');

    dom.searchMatches.querySelectorAll('.vc-search-match-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = btn.dataset.slug;
        selectVerb(word, displayOf(getVerbMap()[word], word));
      });
    });

    setSearchHelp(matches.length === 1
      ? '已找到 1 个匹配动词。'
      : `已找到 ${matches.length} 个匹配动词，可直接点选。`);
  }

  function renderKeyCards(key) {
    if (!dom.body) return;

    const data = activeDataset();
    const words = verbsForKey(data, key);
    const verbs = getVerbMap();
    const label = keyLabel(data, key);
    const totalExamples = words.reduce((sum, word) => sum + examples(verbs[word], key).length, 0);

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `${profile(state.lang).cn} · ${label} · ${words.length} 个动词`;
    }

    if (!words.length) {
      dom.body.innerHTML = emptyStateHtml({ message: '这个介词下暂时没有可显示的动词。' });
      return;
    }

    const cardsHtml = words.map(word => {
      const verb = verbs[word];
      if (!verb) return '';
      return buildCardHtml({
        title: displayOf(verb, word),
        badge: '+ ' + label,
        subtitle: `${examples(verb, key).length} 条例句 / 搭配`,
        examples: examples(verb, key),
      });
    }).join('');

    dom.body.innerHTML =
      '<div class="vc-panel-intro">' +
        '<span class="vc-kicker">介词浏览</span>' +
        '<h2>介词 ' + escapeHtml(label) + '</h2>' +
        '<p>共收录 ' + words.length + ' 个动词，' + totalExamples + ' 条搭配与例句。</p>' +
      '</div>' +
      '<div class="vc-card-grid">' + cardsHtml + '</div>';

    dom.body.scrollTop = 0;
  }

  function renderVerbCards(word) {
    if (!dom.body) return;

    const data = activeDataset();
    const verb = getVerbMap()[word];

    if (!verb) {
      dom.body.innerHTML = emptyStateHtml({ message: '未找到该动词。' });
      return;
    }

    const keys = keysOf(verb);
    const totalExamples = keys.reduce((sum, key) => sum + examples(verb, key).length, 0);
    const display = displayOf(verb, word);

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `${profile(state.lang).cn} · ${display} · ${keys.length} 组介词搭配`;
    }

    const cardsHtml = keys.map(key => buildCardHtml({
      title: '介词 ' + keyLabel(data, key),
      badge: `${display} + ${keyLabel(data, key)}`,
      subtitle: `${examples(verb, key).length} 条搭配与例句`,
      examples: examples(verb, key),
    })).join('');

    dom.body.innerHTML =
      '<div class="vc-panel-intro">' +
        '<span class="vc-kicker">动词搜索</span>' +
        '<h2>' + escapeHtml(display) + '</h2>' +
        '<p>共找到 ' + keys.length + ' 组介词搭配，' + totalExamples + ' 条搭配与例句。</p>' +
      '</div>' +
      '<div class="vc-card-grid vc-card-grid-search">' + cardsHtml + '</div>';

    dom.body.scrollTop = 0;
  }

  function renderSearchChooser(query, matches) {
    if (!dom.body) return;

    if (dom.breadcrumb) {
      dom.breadcrumb.textContent = `${profile(state.lang).cn} · 搜索：${query}`;
    }

    if (!matches.length) {
      dom.body.innerHTML = emptyStateHtml({
        title: '没有匹配的动词',
        message: `没有找到包含 “${query}” 的${profile(state.lang).cn}动词。`,
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
          '<button class="vc-search-choice-btn" data-slug="' + escapeAttribute(match.word) + '">' +
            '<span class="vc-search-choice-name">' + escapeHtml(match.display) + '</span>' +
            '<span class="vc-search-choice-meta">' + match.keyCount + ' 组介词搭配</span>' +
          '</button>'
        )).join('') +
      '</div>';

    dom.body.querySelectorAll('.vc-search-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = btn.dataset.slug;
        selectVerb(word, displayOf(getVerbMap()[word], word));
      });
    });

    dom.body.scrollTop = 0;
  }

  function buildCardHtml({ title: cardTitle, badge, subtitle, examples: list }) {
    return (
      '<article class="vc-card">' +
        '<div class="vc-card-header">' +
          '<div>' +
            '<h3 class="vc-card-title">' + escapeHtml(cardTitle) + '</h3>' +
            '<p class="vc-card-subtitle">' + escapeHtml(subtitle) + '</p>' +
          '</div>' +
          '<span class="vc-card-badge">' + escapeHtml(badge) + '</span>' +
        '</div>' +
        '<ul class="vc-example-list">' +
          (list || []).map(buildExampleHtml).join('') +
        '</ul>' +
      '</article>'
    );
  }

  /** 外语句与中文释义分行显示。 */
  function buildExampleHtml(example) {
    const text = (example && example.text) || '';
    const zh = (example && example.zh) || '';
    if (!zh) {
      return '<li class="vc-example-item">' + escapeHtml(text) + '</li>';
    }
    return '<li class="vc-example-item">' +
      '<span class="vc-example-target" style="display:block;">' + escapeHtml(text) + '</span>' +
      '<span class="vc-example-gloss" style="display:block;color:var(--muted);font-size:0.88em;">' +
        escapeHtml(zh) +
      '</span>' +
    '</li>';
  }

  function emptyStateHtml({ title: heading, message, icon } = {}) {
    return (
      '<div class="vc-empty-state">' +
        '<span class="msr vc-empty-state-icon" aria-hidden="true">' + escapeHtml(icon || 'search') + '</span>' +
        '<h2>' + escapeHtml(heading || '没有可显示的内容') + '</h2>' +
        '<p>' + escapeHtml(message || '') + '</p>' +
      '</div>'
    );
  }

  /** 已接入搭配数据的其他语言（空状态里给出跳转）。 */
  function otherLanguagesWithData(lang) {
    return Languages.list
      .filter(p => p.code !== lang && Languages.hasModule(p.code, MODULE) && hasDataset(p.code))
      .map(p => p.code);
  }

  /** 该语言还没有动词搭配数据时的明确空状态（而不是入口静默消失）。 */
  function renderMissingDataset() {
    const label = profile(state.lang).cn;

    if (dom.navTree) {
      dom.navTree.innerHTML = '<p class="grammar-nav-error">该语言暂无动词搭配数据</p>';
    }
    if (dom.searchMatches) dom.searchMatches.innerHTML = '';
    if (dom.searchInput) {
      dom.searchInput.value = '';
      dom.searchInput.disabled = true;
    }
    setSearchHelp(`${label}动词搭配数据尚未接入。`);
    if (dom.breadcrumb) dom.breadcrumb.textContent = `${label} · 暂无数据`;

    if (dom.body) {
      dom.body.innerHTML = emptyStateHtml({
        icon: 'hourglass_empty',
        title: '该语言暂无动词搭配数据',
        message: `${label}动词搭配数据未能加载。阅读器与练习模块已经支持${label}，数据落盘后无需改动即可直接使用；` +
          '目前可以先浏览其他语言的动词搭配，或前往语法书阅读相关章节。',
      });
    }

    const available = otherLanguagesWithData(state.lang);
    if (!available.length || !dom.body) return;

    const actions = document.createElement('div');
    actions.className = 'vc-search-choice-grid';
    available.forEach(code => {
      const btn = document.createElement('button');
      btn.className = 'vc-search-choice-btn';
      btn.innerHTML =
        '<span class="vc-search-choice-name">' + escapeHtml(title(code)) + '</span>' +
        '<span class="vc-search-choice-meta">改为浏览已接入的搭配数据</span>';
      btn.addEventListener('click', () => open(code));
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
    // 解析层（练习模块复用）
    resolveLang,
    profile,
    dataset,
    hasDataset,
    ensureDataset,
    title,
    keysOf,
    examples,
    displayOf,
    keyLabel,
    keyOrder,
    looseKey,
    getLanguage: () => state.lang,
  };
})();

window.VerbCollocations = VerbCollocations;

// 入口卡片由 App 统一渲染并直接调用 VerbCollocations.open(lang) /
// VerbCollocationPractice.open(lang)；这里只剩查阅器内「开始练习」按钮，
// 语言 = 查阅器当前正在浏览的语言。
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('vcStartPracticeBtn')?.addEventListener('click', () => {
    const practice = window.VerbCollocationPractice;
    if (practice && typeof practice.open === 'function') practice.open(VerbCollocations.getLanguage());
  });
});
