/**
 * 动词变位练习模块（多时态）
 */

(function () {
  // ==================== 语言配置（language config） ====================
  // 该模块原本硬编码意大利语；现在通过 `config` 描述当前语言，使同一套
  // 屏幕/逻辑可服务意/德/英三语。意大利语为默认配置，行为与重构前完全一致。
  //
  // config 形态：
  //   { lang, getData(), personOrder, personLabel,
  //     moods: [{ key, label, match(meta) }], timeOf(meta),
  //     storageKey, backTarget }
  //   - moods 是矩阵的行（语气/式），按顺序渲染为最多三行；
  //   - match(meta) 把某时态分到某个 mood；timeOf(meta) 返回
  //     'present' | 'past' | 'future' | 'other' 作为矩阵的列。

  function lc(s) {
    return (s || '').toString().toLowerCase();
  }

  // ---- 意大利语（默认，行为与重构前一致） ----
  const ITALIAN_CONFIG = {
    lang: 'italian',
    getData() {
      if (typeof CONJUGATION_ALL_TENSES_DATA !== 'undefined' && Array.isArray(CONJUGATION_ALL_TENSES_DATA)) {
        return CONJUGATION_ALL_TENSES_DATA;
      }
      return buildFallbackFromPresente();
    },
    personOrder: ['io', 'tu', 'lui_lei', 'noi', 'voi', 'loro'],
    personLabel: {
      io: 'io',
      tu: 'tu',
      lui_lei: 'lui / lei',
      noi: 'noi',
      voi: 'voi',
      loro: 'loro'
    },
    moods: [
      { key: 'indicativo', label: '直陈式', match: (meta) => lc(meta.group).includes('indicativo') },
      { key: 'condizionale', label: '条件式', match: (meta) => lc(meta.group).includes('condizionale') },
      { key: 'congiuntivo', label: '虚拟式', match: (meta) => lc(meta.group).includes('congiuntivo') }
    ],
    timeOf(meta) {
      const t = lc(meta.tense);
      if (t.includes('presente')) return 'present';
      if (t.includes('futuro')) return 'future';
      if (
        t.includes('passato') ||
        t.includes('imperfetto') ||
        t.includes('trapassato') ||
        t.includes('anteriore')
      ) {
        return 'past';
      }
      return 'other';
    },
    storageKey: 'dimenticato_conjugation_lessons',
    backTarget: 'grammarScreen',
    localeSort: 'it'
  };

  // ---- 德语 ----
  const GERMAN_CONFIG = {
    lang: 'german',
    getData() {
      return (typeof GERMAN_CONJUGATION_DATA !== 'undefined' && Array.isArray(GERMAN_CONJUGATION_DATA))
        ? GERMAN_CONJUGATION_DATA
        : [];
    },
    personOrder: ['ich', 'du', 'er_sie_es', 'wir', 'ihr', 'sie'],
    personLabel: {
      ich: 'ich',
      du: 'du',
      er_sie_es: 'er / sie / es',
      wir: 'wir',
      ihr: 'ihr',
      sie: 'sie'
    },
    moods: [
      { key: 'indikativ', label: '直陈式', match: (meta) => lc(meta.group).includes('indikativ') },
      { key: 'konjunktiv', label: '虚拟式', match: (meta) => lc(meta.group).includes('konjunktiv') },
      { key: 'imperativ', label: '命令式', match: (meta) => lc(meta.group).includes('imperativ') }
    ],
    timeOf(meta) {
      const t = lc(meta.tense);
      if (t.includes('präsens') || t.includes('prasens') || t.includes('present')) return 'present';
      if (t.includes('futur')) return 'future';
      if (
        t.includes('präteritum') || t.includes('prateritum') ||
        t.includes('perfekt') ||           // Perfekt + Plusquamperfekt + Konjunktiv * Perfekt
        t.includes('past')
      ) {
        return 'past';
      }
      // Bare Konjunktiv I / Konjunktiv II (würde-Form) and the Imperativ carry no
      // present/past/future keyword; anchor them in the "present" column of their
      // own mood row so the matrix shows them in place rather than in 其他时态.
      if (t.includes('konjunktiv') || t.includes('imperativ')) return 'present';
      return 'other';
    },
    storageKey: 'dimenticato_conjugation_lessons_de',
    backTarget: 'germanGrammarScreen',
    localeSort: 'de'
  };

  // ---- 英语 ----
  const ENGLISH_CONFIG = {
    lang: 'english',
    getData() {
      return (typeof ENGLISH_CONJUGATION_DATA !== 'undefined' && Array.isArray(ENGLISH_CONJUGATION_DATA))
        ? ENGLISH_CONJUGATION_DATA
        : [];
    },
    personOrder: ['i', 'you', 'he_she_it', 'we', 'you_pl', 'they'],
    personLabel: {
      i: 'I',
      you: 'you',
      he_she_it: 'he / she / it',
      we: 'we',
      you_pl: 'you (pl.)',
      they: 'they'
    },
    moods: [
      { key: 'indicative', label: '陈述式', match: (meta) => lc(meta.group).includes('indicative') },
      { key: 'conditional', label: '条件式', match: (meta) => lc(meta.group).includes('conditional') },
      { key: 'imperative', label: '命令式', match: (meta) => lc(meta.group).includes('imperative') }
    ],
    timeOf(meta) {
      const t = lc(meta.tense);
      const g = lc(meta.group);
      // Conditional aspect labels (Present/Continuous/Perfect/Perfect continuous)
      // and the Imperative lack a tense prefix; map them onto their own mood row:
      // perfect aspects → 过去 column, the rest → 现在 column.
      if (g.includes('conditional')) return t.includes('perfect') ? 'past' : 'present';
      if (g.includes('imperative')) return 'present';
      if (t.includes('present')) return 'present';
      if (t.includes('future')) return 'future';
      if (t.includes('past')) return 'past';
      return 'other';
    },
    storageKey: 'dimenticato_conjugation_lessons_en',
    backTarget: 'englishGrammarScreen',
    localeSort: 'en'
  };

  const LANG_CONFIGS = {
    italian: ITALIAN_CONFIG,
    german: GERMAN_CONFIG,
    english: ENGLISH_CONFIG
  };

  // 当前激活的语言配置。默认意大利语 → 保证自动初始化行为不变。
  let config = ITALIAN_CONFIG;

  // 便捷读取（替换原先硬编码的 PERSON_ORDER / PERSON_LABEL / STORAGE_KEY）。
  function PERSON_ORDER() { return config.personOrder; }
  function personLabelOf(person) {
    return (config.personLabel && config.personLabel[person]) || person;
  }
  function storageKey() { return config.storageKey; }

  const state = {
    verbs: [],
    lookupIndex: null,
    tenseMeta: {},
    selectedTense: null,
    lessonSize: 10,
    lessonIndex: 0,
    mode: 'typing', // mcq | typing | full
    queue: [],
    index: 0,
    correct: 0,
    total: 0,
    current: null,
    started: false
  };

  function isGroupedFullQuestion(question) {
    return !!question && question.promptType === 'group';
  }

  function normalizeText(str) {
    return (str || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function splitAlternatives(form) {
    return (form || '')
      .split('/')
      .map(v => v.trim())
      .filter(v => v && normalizeText(v) !== 'none');
  }

  function getTenseForms(tenseData) {
    if (!tenseData) return [];
    if (tenseData.type === 'person' && tenseData.forms && typeof tenseData.forms === 'object') {
      return PERSON_ORDER().flatMap(person => splitAlternatives(tenseData.forms[person]));
    }
    if (Array.isArray(tenseData.forms)) {
      return tenseData.forms.flatMap(form => splitAlternatives(form));
    }
    return [];
  }

  function createVerbLookupSummary(verb) {
    return {
      infinitive: verb.infinitive,
      english: verb.english || '',
      rank: verb.rank || null
    };
  }

  function buildLookupIndex() {
    const byInfinitive = new Map();
    const byForm = new Map();

    state.verbs.forEach(verb => {
      const summary = createVerbLookupSummary(verb);
      const infinitiveKey = normalizeText(verb.infinitive);
      if (infinitiveKey) byInfinitive.set(infinitiveKey, summary);

      Object.values(verb.tenses || {}).forEach(tenseData => {
        getTenseForms(tenseData).forEach(form => {
          const key = normalizeText(form);
          if (!key) return;
          if (!byForm.has(key)) byForm.set(key, []);
          const list = byForm.get(key);
          if (!list.some(item => item.infinitive === verb.infinitive)) {
            list.push(summary);
          }
        });
      });
    });

    state.lookupIndex = { byInfinitive, byForm };
  }

  function getVerbByInfinitive(infinitive) {
    const key = normalizeText(infinitive);
    return state.verbs.find(verb => normalizeText(verb.infinitive) === key) || null;
  }

  function searchVerbLookup(query) {
    const key = normalizeText(query);
    if (!key || !state.lookupIndex) return [];

    const exactInfinitive = state.lookupIndex.byInfinitive.get(key);
    if (exactInfinitive) {
      return [getVerbByInfinitive(exactInfinitive.infinitive)].filter(Boolean);
    }

    const exactForms = state.lookupIndex.byForm.get(key) || [];
    if (exactForms.length) {
      return exactForms
        .map(item => getVerbByInfinitive(item.infinitive))
        .filter(Boolean);
    }

    const partialMatches = state.verbs.filter(verb => {
      if (normalizeText(verb.infinitive).includes(key)) return true;
      return Object.values(verb.tenses || {}).some(tenseData =>
        getTenseForms(tenseData).some(form => normalizeText(form).includes(key))
      );
    });

    return partialMatches;
  }

  function renderLookupTenseRows(tenseData) {
    if (!tenseData) return '';

    if (tenseData.type === 'person' && tenseData.forms && typeof tenseData.forms === 'object') {
      return `
        <div class="conj-lookup-rows">
          ${PERSON_ORDER().map(person => {
            const value = splitAlternatives(tenseData.forms[person]).join(' / ') || '—';
            return `
              <div class="conj-lookup-row">
                <span class="conj-lookup-row-label">${escapeHtml(personLabelOf(person))}</span>
                <span class="conj-lookup-row-value">${escapeHtml(value)}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    const forms = Array.isArray(tenseData.forms) ? tenseData.forms : [];
    return `
      <div class="conj-lookup-rows">
        ${forms.map((form, index) => {
          const value = splitAlternatives(form).join(' / ') || '—';
          return `
            <div class="conj-lookup-row">
              <span class="conj-lookup-row-label">形式 ${index + 1}</span>
              <span class="conj-lookup-row-value">${escapeHtml(value)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderLookupResults(verbs, query) {
    const resultsEl = document.getElementById('conjLookupResults');
    const emptyEl = document.getElementById('conjLookupEmptyState');
    if (!resultsEl || !emptyEl) return;

    if (!query || !normalizeText(query)) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('hidden');
      emptyEl.className = 'hidden';
      emptyEl.textContent = '';
      return;
    }

    if (!verbs.length) {
      resultsEl.innerHTML = '';
      resultsEl.classList.add('hidden');
      emptyEl.className = 'conjugation-lookup-empty';
      emptyEl.textContent = `未找到“${query}”对应的动词变位。`;
      return;
    }

    emptyEl.className = 'hidden';
    emptyEl.textContent = '';
    resultsEl.classList.remove('hidden');
    resultsEl.innerHTML = verbs.map(verb => {
      const tenseCards = Object.entries(verb.tenses || {}).map(([key, tenseData]) => `
        <article class="conj-lookup-tense-card" data-tense="${escapeHtml(key)}">
          <div class="conj-lookup-tense-title">${escapeHtml(`${tenseData.group_label || ''} · ${tenseData.tense_label || key}`)}</div>
          ${renderLookupTenseRows(tenseData)}
        </article>
      `).join('');

      return `
        <section class="conj-lookup-result-card">
          <div class="conj-lookup-result-header">
            <div>
              <p class="eyebrow">Verb Lookup</p>
              <h4>${escapeHtml(verb.infinitive)}</h4>
            </div>
            <div class="conj-lookup-meta">
              ${verb.english ? `<span>${escapeHtml(verb.english)}</span>` : ''}
              ${verb.rank ? `<span>Rank #${escapeHtml(String(verb.rank))}</span>` : ''}
            </div>
          </div>
          <div class="conj-lookup-tense-grid">${tenseCards}</div>
        </section>
      `;
    }).join('');
  }

  function runLookupSearch() {
    const input = document.getElementById('conjLookupInput');
    if (!input) return;
    const query = input.value.trim();
    const matches = searchVerbLookup(query);
    renderLookupResults(matches, query);
  }

  function clearLookupSearch() {
    const input = document.getElementById('conjLookupInput');
    if (input) input.value = '';
    renderLookupResults([], '');
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getLessonStateKey() {
    return `${state.selectedTense}__${state.lessonSize}`;
  }

  function loadLessonStorage() {
    try {
      const raw = localStorage.getItem(storageKey());
      return raw ? JSON.parse(raw) : { completed: {}, lastViewed: {} };
    } catch {
      return { completed: {}, lastViewed: {} };
    }
  }

  function saveLessonStorage(data) {
    localStorage.setItem(storageKey(), JSON.stringify(data));
  }

  function persistLessonView() {
    const data = loadLessonStorage();
    data.lastViewed[getLessonStateKey()] = state.lessonIndex;
    saveLessonStorage(data);
  }

  function markLessonCompleted() {
    const data = loadLessonStorage();
    const key = getLessonStateKey();
    if (!Array.isArray(data.completed[key])) data.completed[key] = [];
    if (!data.completed[key].includes(state.lessonIndex)) data.completed[key].push(state.lessonIndex);
    data.lastViewed[key] = state.lessonIndex;
    saveLessonStorage(data);
  }

  function isCurrentLessonCompleted() {
    const data = loadLessonStorage();
    const completed = data.completed[getLessonStateKey()] || [];
    return completed.includes(state.lessonIndex);
  }

  function getLessonSubset() {
    const subset = state.verbs.filter(v => (v.tenses || {})[state.selectedTense]);
    const start = state.lessonIndex * state.lessonSize;
    const end = start + state.lessonSize;
    return {
      totalLessons: Math.max(1, Math.ceil(subset.length / state.lessonSize)),
      words: subset.slice(start, end),
      totalWords: subset.length
    };
  }

  function buildFallbackFromPresente() {
    if (typeof CONJUGATION_PRESENTE_DATA === 'undefined') return [];
    return CONJUGATION_PRESENTE_DATA.map(v => ({
      rank: v.rank,
      infinitive: v.infinitive,
      english: v.english || '',
      tenses: {
        indicativo_presente: {
          type: 'person',
          group_label: 'Indicativo',
          tense_label: 'Presente',
          forms: v.presente || {}
        }
      }
    }));
  }

  function prepareData() {
    const data = config.getData();
    const raw = Array.isArray(data) ? data : [];

    state.verbs = [...raw].sort((a, b) => (a.rank || 999999) - (b.rank || 999999));

    const meta = {};
    state.verbs.forEach(verb => {
      const tenses = verb.tenses || {};
      Object.entries(tenses).forEach(([key, value]) => {
        if (!meta[key]) {
          meta[key] = {
            key,
            label: `${value.group_label || ''} · ${value.tense_label || key}`,
            group: value.group_label || '',
            tense: value.tense_label || key
          };
        }
      });
    });

    state.tenseMeta = meta;
    buildLookupIndex();
    // First available tense (or null when data is absent — handled gracefully by
    // setSelectedTense / updateLessonUI rather than pointing at a bogus key).
    state.selectedTense = Object.keys(meta)[0] || null;
  }

  function getSortedTenseMeta() {
    const locale = config.localeSort || 'en';
    return Object.values(state.tenseMeta).sort((a, b) => a.label.localeCompare(b.label, locale));
  }

  // Mood bucket = config-defined matrix row key (or 'other' for non-finite extras).
  function getMoodBucket(meta) {
    const mood = (config.moods || []).find(m => m.match(meta));
    return mood ? mood.key : 'other';
  }

  // Time bucket = matrix column ('present' | 'past' | 'future' | 'other').
  function getTimeBucket(meta) {
    return config.timeOf(meta) || 'other';
  }

  function buildTenseButton(meta) {
    return `
      <button class="level-btn conj-tense-btn ${meta.key === state.selectedTense ? 'selected' : ''}" data-tense="${meta.key}" title="${meta.label}">
        <span class="level-name">${meta.tense}</span>
        <span class="level-count">${meta.group || '时态'}</span>
      </button>
    `;
  }

  function markSelectedTenseButton() {
    const buttons = document.querySelectorAll('#conjTenseButtons .conj-tense-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.tense === state.selectedTense);
    });
  }

  function activateConjugationContext() {
    if (typeof window.setPracticeContext === 'function') {
      window.setPracticeContext('conjugation');
    }
    document.getElementById('conjugationSetupScreen')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setSelectedTense(tenseKey) {
    if (!tenseKey || !state.tenseMeta[tenseKey]) return;
    state.selectedTense = tenseKey;
    const storage = loadLessonStorage();
    const savedLesson = storage.lastViewed[`${state.selectedTense}__${state.lessonSize}`];
    state.lessonIndex = Number.isInteger(savedLesson) ? savedLesson : 0;
    markSelectedTenseButton();
    activateConjugationContext();
    updateLessonUI();
  }

  function updateLessonUI() {
    const { totalLessons, words, totalWords } = getLessonSubset();
    const lessonLabel = document.getElementById('conjLessonLabel');
    const lessonBadge = document.getElementById('conjLessonCompletedBadge');
    const activeInfo = document.getElementById('conjActiveLessonInfo');
    const hint = document.getElementById('conjModuleHint');
    const prevBtn = document.getElementById('conjPrevLessonBtn');
    const nextBtn = document.getElementById('conjNextLessonBtn');

    if (lessonLabel) lessonLabel.textContent = `第 ${state.lessonIndex + 1} 课 / 共 ${totalLessons} 课`;
    if (lessonBadge) lessonBadge.classList.toggle('hidden', !isCurrentLessonCompleted());
    if (activeInfo) activeInfo.textContent = `当前为第 ${state.lessonIndex + 1} 课（${words.length} 词）`;
    if (hint) hint.textContent = `按频率分课学习：共 ${totalWords} 个动词，当前每课 ${state.lessonSize} 词`;
    if (prevBtn) prevBtn.disabled = state.lessonIndex <= 0;
    if (nextBtn) nextBtn.disabled = state.lessonIndex >= totalLessons - 1;
  }

  function goToLesson(index) {
    const { totalLessons } = getLessonSubset();
    state.lessonIndex = Math.max(0, Math.min(index, totalLessons - 1));
    persistLessonView();
    updateLessonUI();
  }

  const TIME_LABELS = {
    present: '现在',
    past: '过去',
    future: '将来'
  };
  const TIME_ORDER = ['present', 'past', 'future'];

  function isMobileLayout() {
    return window.innerWidth <= 640;
  }

  function buildMatrixBuckets(tenseList) {
    // One row per config mood, each with present/past/future columns.
    const buckets = {};
    config.moods.forEach(mood => {
      buckets[mood.key] = { present: [], past: [], future: [] };
    });
    const extras = [];
    tenseList.forEach(meta => {
      const mood = getMoodBucket(meta);
      const time = getTimeBucket(meta);
      if (buckets[mood] && buckets[mood][time]) {
        buckets[mood][time].push(meta);
      } else {
        extras.push(meta);
      }
    });
    return { buckets, extras };
  }

  function renderMatrixDesktop(wrap, buckets, extras) {
    const buildCell = (arr) => {
      if (!arr.length) return '<div class="conj-matrix-empty">—</div>';
      return arr.map(buildTenseButton).join('');
    };

    const moodRows = config.moods.map(mood => {
      const b = buckets[mood.key];
      return `
        <div class="conj-matrix-row-label">${mood.label}</div>
        <div class="conj-matrix-cell">${buildCell(b.present)}</div>
        <div class="conj-matrix-cell">${buildCell(b.past)}</div>
        <div class="conj-matrix-cell">${buildCell(b.future)}</div>`;
    }).join('\n');

    wrap.innerHTML = `
      <div class="conj-tense-matrix">
        <div class="conj-matrix-head">语气\\时间</div>
        <div class="conj-matrix-head">现在</div>
        <div class="conj-matrix-head">过去</div>
        <div class="conj-matrix-head">将来</div>
${moodRows}
      </div>
      ${extras.length ? `
        <div class="conj-extra-tenses">
          <div class="conj-extra-title">其他时态</div>
          <div class="conj-extra-grid">
            ${extras.map(buildTenseButton).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  function renderMatrixMobile(wrap, buckets, extras) {
    const times = TIME_ORDER;

    const moodSections = config.moods.map(mood => {
      const moodBuckets = buckets[mood.key];
      const timeSections = times.map(time => {
        const arr = moodBuckets[time];
        if (!arr.length) return '';
        return `
          <div class="conj-mobile-time-group">
            <span class="conj-mobile-time-label">${TIME_LABELS[time]}</span>
            <div class="conj-mobile-time-btns">
              ${arr.map(buildTenseButton).join('')}
            </div>
          </div>
        `;
      }).join('');

      if (!timeSections.trim()) return '';

      return `
        <div class="conj-mobile-mood-section">
          <div class="conj-mobile-mood-label">${mood.label}</div>
          <div class="conj-mobile-mood-body">${timeSections}</div>
        </div>
      `;
    }).join('');

    const extrasHtml = extras.length ? `
      <div class="conj-mobile-mood-section">
        <div class="conj-mobile-mood-label">其他时态</div>
        <div class="conj-mobile-mood-body">
          <div class="conj-mobile-time-group">
            <div class="conj-mobile-time-btns">
              ${extras.map(buildTenseButton).join('')}
            </div>
          </div>
        </div>
      </div>
    ` : '';

    wrap.innerHTML = `<div class="conj-mobile-layout">${moodSections}${extrasHtml}</div>`;
  }

  function renderTenseButtons() {
    const wrap = document.getElementById('conjTenseButtons');
    if (!wrap) return;

    const tenseList = getSortedTenseMeta();

    // Graceful degradation: no data loaded for this language (e.g. the German /
    // English conjugation data scripts are absent) → show a friendly notice
    // instead of an empty matrix. Never crash.
    if (!tenseList.length) {
      wrap.innerHTML = `
        <div class="conj-matrix-empty" style="padding:2rem;text-align:center;">
          数据未加载，请稍后再试。
        </div>
      `;
      return;
    }

    const { buckets, extras } = buildMatrixBuckets(tenseList);

    if (isMobileLayout()) {
      renderMatrixMobile(wrap, buckets, extras);
    } else {
      renderMatrixDesktop(wrap, buckets, extras);
    }

    wrap.querySelectorAll('.conj-tense-btn').forEach(btn => {
      btn.addEventListener('click', () => setSelectedTense(btn.dataset.tense));
    });
  }

  // Re-render tense buttons on resize (debounced)
  let _resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      const wrap = document.getElementById('conjTenseButtons');
      if (wrap && wrap.children.length) renderTenseButtons();
    }, 180);
  });

  function buildQueue() {
    const subset = getLessonSubset().words;
    const queue = [];

    subset.forEach(verb => {
      const tenseData = (verb.tenses || {})[state.selectedTense];
      if (!tenseData) return;

      if (state.mode === 'full' && tenseData.type === 'person') {
        const items = PERSON_ORDER().map(p => {
          const form = tenseData.forms ? tenseData.forms[p] : null;
          const answers = splitAlternatives(form);
          if (!answers.length) return null;
          return {
            key: p,
            promptLabel: personLabelOf(p),
            answers
          };
        }).filter(Boolean);

        if (items.length) {
          queue.push({
            infinitive: verb.infinitive,
            english: verb.english || '',
            rank: verb.rank,
            tenseKey: state.selectedTense,
            tenseLabel: tenseData.tense_label,
            groupLabel: tenseData.group_label,
            promptType: 'group',
            promptLabel: '完整变位',
            promptValue: '全部人称',
            items
          });
        }
      } else if (state.mode === 'full' && tenseData.type !== 'person') {
        const forms = Array.isArray(tenseData.forms) ? tenseData.forms : [];
        const items = forms.map((f, idx) => {
          const answers = splitAlternatives(f);
          if (!answers.length) return null;
          return {
            key: `form_${idx + 1}`,
            promptLabel: `形式 ${idx + 1}`,
            answers
          };
        }).filter(Boolean);

        if (items.length) {
          queue.push({
            infinitive: verb.infinitive,
            english: verb.english || '',
            rank: verb.rank,
            tenseKey: state.selectedTense,
            tenseLabel: tenseData.tense_label,
            groupLabel: tenseData.group_label,
            promptType: 'group',
            promptLabel: '完整形式',
            promptValue: `共 ${items.length} 项`,
            items
          });
        }
      } else if (tenseData.type === 'person') {
        PERSON_ORDER().forEach(p => {
          const form = tenseData.forms ? tenseData.forms[p] : null;
          if (!form) return;
          const answers = splitAlternatives(form);
          if (!answers.length) return;
          queue.push({
            infinitive: verb.infinitive,
            english: verb.english || '',
            rank: verb.rank,
            tenseKey: state.selectedTense,
            tenseLabel: tenseData.tense_label,
            groupLabel: tenseData.group_label,
            promptType: 'person',
            promptLabel: '人称',
            promptValue: personLabelOf(p),
            answers
          });
        });
      } else {
        const forms = Array.isArray(tenseData.forms) ? tenseData.forms : [];
        forms.forEach((f, idx) => {
          const answers = splitAlternatives(f);
          if (!answers.length) return;
          queue.push({
            infinitive: verb.infinitive,
            english: verb.english || '',
            rank: verb.rank,
            tenseKey: state.selectedTense,
            tenseLabel: tenseData.tense_label,
            groupLabel: tenseData.group_label,
            promptType: 'single',
            promptLabel: '形式',
            promptValue: `${idx + 1}`,
            answers
          });
        });
      }
    });

    state.queue = shuffle(queue);
    state.index = 0;
    state.correct = 0;
    state.total = 0;
    state.current = null;
    state.started = true;
  }

  function updateProgress() {
    const currentEl = document.getElementById('conjCurrent');
    const totalEl = document.getElementById('conjTotal');
    const accuracyEl = document.getElementById('conjAccuracy');

    if (currentEl) currentEl.textContent = Math.min(state.index + 1, Math.max(state.queue.length, 1));
    if (totalEl) totalEl.textContent = state.queue.length;

    const accuracy = state.total > 0 ? Math.round((state.correct / state.total) * 100) : 0;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
  }

  function updateQuestionUI() {
    const q = state.current;
    if (!q) return;

    const tenseTitle = document.getElementById('conjTenseTitle');
    const infinitive = document.getElementById('conjInfinitive');
    const englishLine = document.getElementById('conjEnglishLine');
    const english = document.getElementById('conjEnglish');
    const promptLabel = document.getElementById('conjPromptLabel');
    const pronoun = document.getElementById('conjPronoun');

    if (tenseTitle) tenseTitle.textContent = `${q.groupLabel} · ${q.tenseLabel}`;
    if (infinitive) infinitive.textContent = q.infinitive;
    if (englishLine) englishLine.classList.toggle('hidden', !q.english);
    if (english) english.textContent = q.english || '-';
    if (promptLabel) promptLabel.textContent = `${q.promptLabel}：`;
    if (pronoun) pronoun.textContent = q.promptValue;
  }

  function renderFullGroup() {
    const wrap = document.getElementById('conjFullGrid');
    if (!wrap || !isGroupedFullQuestion(state.current)) return;

    wrap.innerHTML = state.current.items.map((item, index) => `
      <label class="conj-full-item" data-key="${item.key}">
        <span class="conj-full-label">${item.promptLabel}</span>
        <input
          type="text"
          class="spelling-input conj-full-input"
          data-index="${index}"
          placeholder="请输入"
          autocomplete="off"
        >
        <span class="conj-full-answer hidden"></span>
      </label>
    `).join('');

    const firstInput = wrap.querySelector('.conj-full-input');
    const checkBtn = document.getElementById('conjFullCheckBtn');
    if (checkBtn) checkBtn.disabled = false;
    if (firstInput) firstInput.focus();
  }

  function renderMcqOptions() {
    const optionsWrap = document.getElementById('conjOptions');
    if (!optionsWrap || !state.current) return;

    const correct = state.current.answers[0];
    const pool = state.queue
      .filter(item => item !== state.current)
      .flatMap(item => item.answers)
      .filter(v => normalizeText(v) !== normalizeText(correct));

    const distractors = shuffle([...new Set(pool)]).slice(0, 3);
    const options = shuffle([correct, ...distractors]);

    optionsWrap.innerHTML = options
      .map(opt => `<button class="option-btn" data-answer="${opt.replace(/"/g, '&quot;')}">${opt}</button>`)
      .join('');

    optionsWrap.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => checkMcqAnswer(btn));
    });
  }

  function showFeedback(isCorrect, message, autoNextMs = 0) {
    const feedback = document.getElementById('conjFeedback');
    const text = feedback?.querySelector('.feedback-text');
    const nextBtn = document.getElementById('conjNextBtn');

    if (!feedback || !text || !nextBtn) return;

    text.textContent = message;
    feedback.classList.remove('hidden', 'correct', 'incorrect');
    feedback.classList.add(isCorrect ? 'correct' : 'incorrect');

    if (autoNextMs > 0) {
      nextBtn.classList.add('hidden');
      setTimeout(() => nextQuestion(), autoNextMs);
    } else {
      nextBtn.classList.remove('hidden');
    }
  }

  function clearFeedback() {
    const feedback = document.getElementById('conjFeedback');
    const nextBtn = document.getElementById('conjNextBtn');
    if (feedback) feedback.classList.add('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');
  }

  function resetFullGroupState() {
    const wrap = document.getElementById('conjFullGrid');
    if (!wrap) return;
    wrap.querySelectorAll('.conj-full-item').forEach(item => {
      item.classList.remove('correct', 'incorrect');
    });
    wrap.querySelectorAll('.conj-full-answer').forEach(answer => {
      answer.textContent = '';
      answer.classList.add('hidden');
    });
  }

  function renderCurrentQuestion() {
    if (!state.queue.length || state.index >= state.queue.length) {
      const acc = state.total > 0 ? Math.round((state.correct / state.total) * 100) : 0;
      markLessonCompleted();
      updateLessonUI();
      document.getElementById('conjAdvanceLessonBtn')?.classList.remove('hidden');
      alert(`🎉 动词变位练习完成！\n\n正确: ${state.correct}/${state.total}\n正确率: ${acc}%`);
      if (typeof showScreen === 'function') showScreen('conjugationSetupScreen');
      if (typeof window.setPracticeContext === 'function') window.setPracticeContext('conjugation');
      return;
    }

    state.current = state.queue[state.index];
    document.getElementById('conjAdvanceLessonBtn')?.classList.add('hidden');
    updateProgress();
    updateQuestionUI();
    clearFeedback();

    const typingSection = document.getElementById('conjTypingSection');
    const mcqSection = document.getElementById('conjMcqSection');
    const fullSection = document.getElementById('conjFullSection');
    const input = document.getElementById('conjInput');

    if (state.mode === 'mcq') {
      typingSection?.classList.add('hidden');
      fullSection?.classList.add('hidden');
      mcqSection?.classList.remove('hidden');
      renderMcqOptions();
    } else if (state.mode === 'full' && isGroupedFullQuestion(state.current)) {
      mcqSection?.classList.add('hidden');
      typingSection?.classList.add('hidden');
      fullSection?.classList.remove('hidden');
      renderFullGroup();
      resetFullGroupState();
    } else {
      mcqSection?.classList.add('hidden');
      fullSection?.classList.add('hidden');
      typingSection?.classList.remove('hidden');
      if (input) {
        input.value = '';
        input.disabled = false;
        input.focus();
      }
      const checkBtn = document.getElementById('conjCheckBtn');
      if (checkBtn) checkBtn.disabled = false;
    }
  }

  function checkTypedAnswer() {
    if (!state.current) return;
    const input = document.getElementById('conjInput');
    const checkBtn = document.getElementById('conjCheckBtn');
    if (!input) return;

    const user = normalizeText(input.value);
    const isCorrect = state.current.answers.some(ans => normalizeText(ans) === user);

    state.total += 1;
    if (isCorrect) state.correct += 1;
    updateProgress();

    input.disabled = true;
    if (checkBtn) checkBtn.disabled = true;

    const answerText = state.current.answers.join(' / ');
    if (state.mode === 'full') {
      showFeedback(
        isCorrect,
        isCorrect ? '✅ 正确！' : `❌ 错误，正确答案：${answerText}`,
        isCorrect ? 700 : 0
      );
    } else {
      showFeedback(isCorrect, isCorrect ? '✅ 正确！' : `❌ 错误，正确答案：${answerText}`);
    }
  }

  function checkFullGroupAnswer() {
    if (!isGroupedFullQuestion(state.current)) return;

    const wrap = document.getElementById('conjFullGrid');
    const checkBtn = document.getElementById('conjFullCheckBtn');
    if (!wrap) return;

    let allCorrect = true;
    let localTotal = 0;
    let localCorrect = 0;

    state.current.items.forEach((item, index) => {
      const row = wrap.querySelector(`.conj-full-item[data-key="${item.key}"]`);
      const input = wrap.querySelector(`.conj-full-input[data-index="${index}"]`);
      const answerEl = row?.querySelector('.conj-full-answer');
      if (!input || !row || !answerEl) return;

      const user = normalizeText(input.value);
      const correct = item.answers.some(ans => normalizeText(ans) === user);

      localTotal += 1;
      if (correct) localCorrect += 1;
      else allCorrect = false;

      input.disabled = true;
      row.classList.remove('correct', 'incorrect');
      row.classList.add(correct ? 'correct' : 'incorrect');
      answerEl.textContent = correct ? '✅ 正确' : `正确答案：${item.answers.join(' / ')}`;
      answerEl.classList.remove('hidden');
    });

    if (checkBtn) checkBtn.disabled = true;

    state.total += localTotal;
    state.correct += localCorrect;
    updateProgress();

    showFeedback(
      allCorrect,
      allCorrect
        ? '✅ 本组全部正确！'
        : `❌ 本组答对 ${localCorrect}/${localTotal}`,
      allCorrect ? 900 : 0
    );
  }

  function checkMcqAnswer(button) {
    if (!state.current || !button) return;
    const chosen = button.dataset.answer || '';
    const isCorrect = state.current.answers.some(ans => normalizeText(ans) === normalizeText(chosen));

    state.total += 1;
    if (isCorrect) state.correct += 1;
    updateProgress();

    const buttons = document.querySelectorAll('#conjOptions .option-btn');
    const correctNorm = normalizeText(state.current.answers[0]);

    buttons.forEach(btn => {
      btn.disabled = true;
      const norm = normalizeText(btn.dataset.answer || '');
      if (norm === correctNorm) btn.classList.add('correct');
      else if (btn === button && !isCorrect) btn.classList.add('incorrect');
    });

    showFeedback(isCorrect, isCorrect ? '✅ 正确！' : `❌ 错误，正确答案：${state.current.answers.join(' / ')}`);
  }

  function nextQuestion() {
    state.index += 1;
    renderCurrentQuestion();
  }

  function start(mode) {
    if (!state.selectedTense) {
      alert('请先在欢迎页选择一个时态。');
      return;
    }

    state.mode = mode;
    persistLessonView();
    buildQueue();

    if (!state.queue.length) {
      alert('当前时态在该词量范围内暂无可练习题目，请切换时态或范围。');
      return;
    }

    if (typeof showScreen === 'function') showScreen('conjugationScreen');
    renderCurrentQuestion();
    markModeButton(mode);
  }

  function markModeButton(mode) {
    document.getElementById('conjModeMcqBtn')?.classList.remove('selected');
    document.getElementById('conjModeTypingBtn')?.classList.remove('selected');
    document.getElementById('conjModeFullBtn')?.classList.remove('selected');

    if (mode === 'mcq') document.getElementById('conjModeMcqBtn')?.classList.add('selected');
    if (mode === 'typing') document.getElementById('conjModeTypingBtn')?.classList.add('selected');
    if (mode === 'full') document.getElementById('conjModeFullBtn')?.classList.add('selected');
  }

  function bindEvents() {
    const lessonSizeSelect = document.getElementById('conjLessonSizeSelect');

    lessonSizeSelect?.addEventListener('change', () => {
      state.lessonSize = parseInt(lessonSizeSelect.value, 10) || 10;
      const storage = loadLessonStorage();
      const savedLesson = storage.lastViewed[`${state.selectedTense}__${state.lessonSize}`];
      state.lessonIndex = Number.isInteger(savedLesson) ? savedLesson : 0;
      updateLessonUI();
    });

    document.getElementById('conjPrevLessonBtn')?.addEventListener('click', () => goToLesson(state.lessonIndex - 1));
    document.getElementById('conjNextLessonBtn')?.addEventListener('click', () => goToLesson(state.lessonIndex + 1));
    document.getElementById('conjAdvanceLessonBtn')?.addEventListener('click', () => {
      goToLesson(state.lessonIndex + 1);
      start(state.mode || 'typing');
    });

    document.getElementById('conjModeMcqBtn')?.addEventListener('click', () => start('mcq'));
    document.getElementById('conjModeTypingBtn')?.addEventListener('click', () => start('typing'));
    document.getElementById('conjModeFullBtn')?.addEventListener('click', () => start('full'));

    document.getElementById('conjCheckBtn')?.addEventListener('click', checkTypedAnswer);
    document.getElementById('conjFullCheckBtn')?.addEventListener('click', checkFullGroupAnswer);
    document.getElementById('conjInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkTypedAnswer();
    });
    document.getElementById('conjFullGrid')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkFullGroupAnswer();
    });

    document.getElementById('conjNextBtn')?.addEventListener('click', nextQuestion);
    document.getElementById('conjRestartBtn')?.addEventListener('click', () => start(state.mode || 'typing'));
    document.getElementById('conjLookupSearchBtn')?.addEventListener('click', runLookupSearch);
    document.getElementById('conjLookupClearBtn')?.addEventListener('click', clearLookupSearch);
    document.getElementById('conjLookupInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') runLookupSearch();
    });
    document.getElementById('conjBackBtn')?.addEventListener('click', () => {
      if (typeof goBack === 'function') goBack({ fallbackTarget: 'conjugationSetupScreen' });
      else if (typeof showScreen === 'function') showScreen('conjugationSetupScreen');
      if (typeof window.setPracticeContext === 'function') window.setPracticeContext('conjugation');
    });

    // The Italian Grammar hub's 动词变位 card (#goConjugationSetupBtn, handler in
    // app.js) only calls showScreen('conjugationSetupScreen') — it does NOT reset
    // `config`. If German/English previously opened this SHARED screen, `config`
    // would still be non-Italian and the Italian card would render the wrong
    // language. Re-bind here to reset back to the Italian config first. Both
    // handlers call showScreen on the same screen, which is idempotent.
    document.getElementById('goConjugationSetupBtn')?.addEventListener('click', () => {
      if (config !== ITALIAN_CONFIG) {
        config = ITALIAN_CONFIG;
        reloadForActiveConfig();
      }
    });
  }

  // Reload data + UI for the current `config` (shared by init / openFor).
  function reloadForActiveConfig() {
    prepareData();
    const storage = loadLessonStorage();
    const savedLesson = storage.lastViewed[`${state.selectedTense}__${state.lessonSize}`];
    state.lessonIndex = Number.isInteger(savedLesson) ? savedLesson : 0;
    state.started = false;
    renderTenseButtons();
    updateLessonUI();
  }

  function init() {
    reloadForActiveConfig();
    bindEvents();
  }

  // Open the (SHARED) conjugation setup screen for a given language. Italian
  // keeps using the DOMContentLoaded auto-init; German/English call this when
  // their Grammar-hub 动词变位 card is clicked. Swaps `config`, reloads data with
  // a per-language storageKey (so lesson progress never collides across
  // languages), then shows the shared setup screen. The screen is pushed onto
  // the global history stack via showScreen(), so goBack() pops back to the
  // right grammar hub. config.backTarget is the no-history fallback target.
  function openFor(lang) {
    const next = LANG_CONFIGS[lang];
    if (!next) return;

    config = next;
    reloadForActiveConfig();

    if (typeof window.setPracticeContext === 'function') {
      window.setPracticeContext('conjugation');
    }
    if (typeof showScreen === 'function') {
      showScreen('conjugationSetupScreen');
    }
  }

  window.ConjugationPractice = {
    init,
    start,
    searchVerbLookup,
    openFor
  };

  document.addEventListener('DOMContentLoaded', init);
})();
