/**
 * 动词变位练习模块（多时态，意/德/英/法共用）
 *
 * 不再按语言写配置：一切语言差异都来自数据本身（conjugations/1，见
 * docs/data-schema.md），由 LangLoader.data(code, 'conjugations') 取得：
 *   - persons[]            人称顺序、标签、中文、主语代词（判分接受「主语 + 变位」）
 *   - tenses[]             展示顺序、语气 group、标签、矩阵列 time、
 *                          omit（该时态不存在的人称）、labels（人称标签覆盖，如 Lei/Loro）、
 *                          subject（变位表连主语一起写，法语惯例）
 *   - meta.groups          矩阵的行（语气）及其中文名
 *   - meta.placeholders    查词 / 填空输入框的示例文案
 *   - meta.elision         人称代词在元音前的缩合（法语 je + ai → j'ai）与嘘音 h 例外
 * 语言名来自 Languages.get(code)。
 */

(function () {
  const STORAGE_PREFIX = 'dimenticato_conjugation_lessons';
  const TIME_ORDER = ['present', 'past', 'future'];
  const TIME_LABELS = { present: '现在', past: '过去', future: '将来' };

  // 宽松比较 key：抹重音、统一撇号/œ、小写、压空白（lib/utils.js DimText）
  function norm(value) {
    return window.DimText.normalizeText(value, { fold: true });
  }

  // ==================== 进度存储 ====================

  // 每门语言一份：dimenticato_conjugation_lessons_<code>
  function storageKeyFor(code) {
    return `${STORAGE_PREFIX}_${code}`;
  }

  // 旧 key 一次性迁移：默认语言（意大利语）曾用无后缀的 key；德 / 英 / 法本来就是 _<code>。
  function legacyStorageKeys(code) {
    const profile = window.Languages.get(code);
    return profile && profile.key === window.Languages.DEFAULT_KEY ? [STORAGE_PREFIX] : [];
  }

  function migrateLessonStorage(code) {
    try {
      const target = storageKeyFor(code);
      legacyStorageKeys(code).forEach(key => {
        const raw = localStorage.getItem(key);
        if (raw == null) return;
        if (localStorage.getItem(target) == null) localStorage.setItem(target, raw);
        localStorage.removeItem(key);
      });
    } catch (e) {
      // 存储不可用（隐私模式等）时迁移失败不影响练习
    }
  }

  // ==================== 当前语言的数据视图 ====================

  // ctx 由 prepareData() 从 conjugations/1 数据建立；没有数据时为空壳。
  let ctx = emptyContext(null);

  function emptyContext(code) {
    return {
      code,
      data: null,
      persons: [],
      tenses: [],
      tenseByKey: {},
      groups: [],
      placeholders: {},
      elision: null,
      vowel: null,
      aspirateForms: new Set()
    };
  }

  const state = {
    verbs: [],
    lookupIndex: null,
    selectedTense: null,
    lessonSize: 10,
    lessonIndex: 0,
    mode: 'typing', // mcq | typing | full
    queue: [],
    index: 0,
    correct: 0,
    total: 0,
    current: null,
    questionStartedAt: 0,
    started: false
  };

  function tenseMeta(tenseKey) {
    return ctx.tenseByKey[tenseKey] || null;
  }

  function personIndex(personKey) {
    return ctx.persons.findIndex(p => p.key === personKey);
  }

  // tenseKey 可选：命令式等时态会覆盖人称标签（lui / lei → Lei）。
  function personLabelOf(personKey, tenseKey) {
    const meta = tenseMeta(tenseKey);
    if (meta && meta.labels && meta.labels[personKey]) return meta.labels[personKey];
    const person = ctx.persons[personIndex(personKey)];
    return person ? person.label : personKey;
  }

  // 该时态实际存在的人称（命令式没有第一人称单数等）。
  function personsForTense(tenseKey) {
    const meta = tenseMeta(tenseKey);
    const omit = (meta && meta.omit) || [];
    return ctx.persons.map(p => p.key).filter(key => !omit.includes(key));
  }

  function tenseTitle(meta) {
    if (!meta) return '';
    return meta.groupLabel && meta.groupLabel !== meta.label ? `${meta.groupLabel} · ${meta.label}` : meta.label;
  }

  function isGroupedFullQuestion(question) {
    return !!question && question.promptType === 'group';
  }

  function splitAlternatives(form) {
    return String(form == null ? '' : form)
      .split('/')
      .map(v => v.trim())
      .filter(v => v && norm(v) !== 'none');
  }

  // 某动词某人称的形式（person 型时态存 6 元组，按 persons 顺序）
  function personForm(value, personKey) {
    if (!Array.isArray(value)) return '';
    return value[personIndex(personKey)] || '';
  }

  // ---- 省音（elision）与主语前缀 ----
  // 数据集只存动词形式本身（法语 "ai été"），显示与判分都由 meta.elision 推导（"j'ai été"）。

  // 嘘音 h 以数据集列出的 aspirateVerbs 为准，而不是词形白名单：白名单漏一个词
  // 就会渲染出 j'hèle 这种错形。只收以 h 开头的形式：复合时态的 "ai haï" 由助动词
  // 开头，那里省音是对的（j'ai haï）。
  function collectAspirateForms(verbs, aspirateVerbs) {
    const wanted = new Set(aspirateVerbs || []);
    const set = new Set();
    if (!wanted.size) return set;
    verbs.forEach(verb => {
      if (!wanted.has(verb.word)) return;
      Object.values(verb.tenses || {}).forEach(value => {
        const values = Array.isArray(value) ? value : [value];
        values.forEach(one => {
          String(one || '').split(/\s*[,/]\s*/).forEach(form => {
            const key = norm(form);
            if (key && key.charAt(0) === 'h') set.add(key);
          });
        });
      });
    });
    return set;
  }

  // 该人称的代词写在 form 前面时的缩合形；不缩合则返回 ''。
  function contractionFor(personKey, form) {
    const rule = ctx.elision;
    if (!rule || !rule.contract || !ctx.vowel) return '';
    const contracted = rule.contract[personKey];
    if (!contracted) return '';
    const head = String(form || '').trim();
    if (!head || !ctx.vowel.test(head)) return '';
    // 嘘音 h（h aspiré）不省音：je hais，而不是 j'hais。
    const key = norm(head);
    if (ctx.aspirateForms.has(key)) return '';
    if ((rule.aspirate || []).some(word => key.startsWith(norm(word)))) return '';
    return contracted;
  }

  function pronounsOf(personKey) {
    const person = ctx.persons[personIndex(personKey)];
    return (person && person.pronouns) || [];
  }

  // 该人称 + 变位形式的自然写法（j'ai été / tu as été / io parlo）。
  function withSubject(personKey, form) {
    const pronouns = pronounsOf(personKey);
    if (!pronouns.length || !form) return form || '';
    const contracted = contractionFor(personKey, form);
    return contracted ? `${contracted}${form}` : `${pronouns[0]} ${form}`;
  }

  // 变位表里展示的形式：tense.subject 为真时连主语一起写（法语惯例）。
  function displayForm(personKey, form, tenseKey) {
    const meta = tenseMeta(tenseKey);
    return personKey && meta && meta.subject ? withSubject(personKey, form) : form;
  }

  // 判分时除了裸形式，也接受带主语的写法（je suis / j'ai su / j' ai su / io parlo）。
  function expandAcceptedAnswers(answers, personKey) {
    const out = [];
    const seen = new Set();
    const push = (value) => {
      const key = norm(value);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(value);
    };
    (answers || []).forEach(ans => {
      push(ans);
      if (!personKey) return;
      pronounsOf(personKey).forEach(pronoun => push(`${pronoun} ${ans}`));
      const contracted = contractionFor(personKey, ans);
      if (contracted) {
        push(`${contracted}${ans}`);
        push(`${contracted} ${ans}`);
      }
    });
    return out;
  }

  // 判分走共用的 Vocab.gradeTyped（lib/vocab.js）：'correct' | 'accent' | 'wrong'。
  // 重音写错（parlo ≠ parlò）不算对，单独提示「字母对了，重音不对」；
  // 德语 ä/ae、ö/oe、ü/ue、ß/ss 视为同一写法。
  function gradeAnswer(answers, personKey, value) {
    if (!norm(value)) return 'wrong';
    return window.Vocab.gradeTyped(ctx.code, value, expandAcceptedAnswers(answers, personKey));
  }

  // 反馈里展示的“正确答案”：带主语的时态补上主语。
  function answerDisplayText(answers, personKey, tenseKey) {
    return (answers || []).map(ans => displayForm(personKey, ans, tenseKey)).join(' / ');
  }

  // 某个时态值里的全部形式（含 / 分隔的异体）
  function tenseForms(value) {
    const values = Array.isArray(value) ? value : [value];
    return values.flatMap(one => splitAlternatives(one));
  }

  // ==================== 查词 ====================

  function buildLookupIndex() {
    const byWord = new Map();
    const byForm = new Map();

    state.verbs.forEach(verb => {
      const wordKey = norm(verb.word);
      if (wordKey) byWord.set(wordKey, verb);

      Object.values(verb.tenses || {}).forEach(value => {
        tenseForms(value).forEach(form => {
          const key = norm(form);
          if (!key) return;
          if (!byForm.has(key)) byForm.set(key, []);
          const list = byForm.get(key);
          if (!list.includes(verb)) list.push(verb);
        });
      });
    });

    state.lookupIndex = { byWord, byForm };
  }

  function searchVerbLookup(query) {
    const key = norm(query);
    if (!key || !state.lookupIndex) return [];

    const exactWord = state.lookupIndex.byWord.get(key);
    if (exactWord) return [exactWord];

    const exactForms = state.lookupIndex.byForm.get(key) || [];
    if (exactForms.length) return exactForms.slice();

    return state.verbs.filter(verb => {
      if (norm(verb.word).includes(key)) return true;
      return Object.values(verb.tenses || {}).some(value =>
        tenseForms(value).some(form => norm(form).includes(key))
      );
    });
  }

  function renderLookupTenseRows(value, meta) {
    if (value == null || !meta) return '';

    if (meta.type === 'person') {
      return `
        <div class="conj-card conj-card-mini">
          ${personsForTense(meta.key).map(person => {
            const forms = splitAlternatives(personForm(value, person))
              .map(form => displayForm(person, form, meta.key))
              .join(' / ') || '-';
            return `
              <div class="conj-line">
                <span class="conj-person">${escapeHtml(personLabelOf(person, meta.key))}</span>
                <span class="conj-form">${escapeHtml(forms)}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    return `
      <div class="conj-card conj-card-mini">
        <div class="conj-line">
          <span class="conj-person">${escapeHtml(meta.label)}</span>
          <span class="conj-form">${escapeHtml(splitAlternatives(value).join(' / ') || '-')}</span>
        </div>
      </div>
    `;
  }

  function renderLookupResults(verbs, query) {
    const resultsEl = document.getElementById('conjLookupResults');
    const emptyEl = document.getElementById('conjLookupEmptyState');
    if (!resultsEl || !emptyEl) return;

    if (!query || !norm(query)) {
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
      const tenseCards = ctx.tenses
        .filter(meta => verb.tenses && verb.tenses[meta.key] != null)
        .map(meta => `
          <article class="conj-lookup-tense-card" data-tense="${escapeAttribute(meta.key)}">
            <div class="conj-lookup-tense-title" title="${escapeAttribute(meta.zh || '')}">${escapeHtml(tenseTitle(meta))}</div>
            ${renderLookupTenseRows(verb.tenses[meta.key], meta)}
          </article>
        `).join('');

      return `
        <section class="conj-lookup-result-card">
          <div class="conj-lookup-result-header">
            <div>
              <p class="eyebrow">Verb Lookup</p>
              <h4>${escapeHtml(verb.word)}</h4>
            </div>
            <div class="conj-lookup-meta">
              ${verb.zh ? `<span>${escapeHtml(verb.zh)}</span>` : ''}
              ${verb.en ? `<span>${escapeHtml(verb.en)}</span>` : ''}
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
    renderLookupResults(searchVerbLookup(query), query);
  }

  function clearLookupSearch() {
    const input = document.getElementById('conjLookupInput');
    if (input) input.value = '';
    renderLookupResults([], '');
  }

  // ==================== 分课（按词频切块，每课 lessonSize 个动词） ====================

  function getLessonStateKey() {
    return `${state.selectedTense}__${state.lessonSize}`;
  }

  function loadLessonStorage() {
    try {
      const raw = ctx.code ? localStorage.getItem(storageKeyFor(ctx.code)) : null;
      const data = raw ? JSON.parse(raw) : null;
      return {
        completed: (data && data.completed) || {},
        lastViewed: (data && data.lastViewed) || {}
      };
    } catch {
      return { completed: {}, lastViewed: {} };
    }
  }

  function saveLessonStorage(data) {
    if (!ctx.code) return;
    try {
      localStorage.setItem(storageKeyFor(ctx.code), JSON.stringify(data));
    } catch (e) {
      // 配额满等情况下不影响练习
    }
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
    const completed = loadLessonStorage().completed[getLessonStateKey()] || [];
    return completed.includes(state.lessonIndex);
  }

  function restoreLessonIndex() {
    const saved = loadLessonStorage().lastViewed[getLessonStateKey()];
    state.lessonIndex = Number.isInteger(saved) ? saved : 0;
  }

  function getLessonSubset() {
    const subset = state.verbs.filter(v => v.tenses && v.tenses[state.selectedTense] != null);
    const start = state.lessonIndex * state.lessonSize;
    return {
      totalLessons: Math.max(1, Math.ceil(subset.length / state.lessonSize)),
      words: subset.slice(start, start + state.lessonSize),
      totalWords: subset.length
    };
  }

  // ==================== 数据 ====================

  // 变位数据由 data/*.js 注册到 DIM_DATA.conjugations.<code>，统一经 LangLoader.data 取
  function dataFor(code) {
    const data = window.LangLoader && window.LangLoader.data(code, 'conjugations');
    return data && Array.isArray(data.verbs) ? data : null;
  }

  function prepareData(code) {
    const data = dataFor(code);
    ctx = emptyContext(code);
    if (data) {
      const meta = data.meta || {};
      ctx.data = data;
      ctx.persons = data.persons || [];
      ctx.tenses = data.tenses || [];
      ctx.tenses.forEach(t => { ctx.tenseByKey[t.key] = t; });
      ctx.groups = meta.groups || [];
      ctx.placeholders = meta.placeholders || {};
      ctx.elision = meta.elision || null;
      try {
        ctx.vowel = ctx.elision && ctx.elision.vowel ? new RegExp(ctx.elision.vowel, 'i') : null;
      } catch (e) {
        ctx.vowel = null;
      }
    }

    state.verbs = data ? [...data.verbs].sort((a, b) => (a.rank || 999999) - (b.rank || 999999)) : [];
    ctx.aspirateForms = collectAspirateForms(state.verbs, ctx.elision && ctx.elision.aspirateVerbs);
    buildLookupIndex();
    // 第一个时态（没有数据时为 null，由 renderTenseButtons / updateLessonUI 兜底）
    state.selectedTense = ctx.tenses.length ? ctx.tenses[0].key : null;
  }

  // ==================== 时态矩阵（行 = 语气 group，列 = tense.time） ====================

  // 有 time 的时态进矩阵；没有 time 的（不定式、分词等）进「其他时态」。
  function matrixRows() {
    return ctx.groups.filter(group => ctx.tenses.some(t => t.group === group.key && t.time));
  }

  function buildTenseButton(meta) {
    return `
      <button class="chip conj-tense-btn ${meta.key === state.selectedTense ? 'active' : ''}" data-tense="${escapeAttribute(meta.key)}" title="${escapeAttribute(`${tenseTitle(meta)}${meta.zh ? ` · ${meta.zh}` : ''}`)}">
        <span class="ct-name">${escapeHtml(meta.label)}</span>
        <span class="ct-group">${escapeHtml(meta.groupLabel || '时态')}</span>
      </button>
    `;
  }

  function markSelectedTenseButton() {
    const buttons = document.querySelectorAll('#conjTenseButtons .conj-tense-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tense === state.selectedTense);
    });
  }

  function activateConjugationContext() {
    if (typeof window.setPracticeContext === 'function') {
      window.setPracticeContext('conjugation');
    }
    document.getElementById('conjugationSetupScreen')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setSelectedTense(tenseKey) {
    if (!tenseKey || !tenseMeta(tenseKey)) return;
    state.selectedTense = tenseKey;
    restoreLessonIndex();
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

  function isMobileLayout() {
    return window.innerWidth <= 640;
  }

  function buildMatrixBuckets() {
    const buckets = {};
    matrixRows().forEach(group => {
      buckets[group.key] = { present: [], past: [], future: [] };
    });
    const extras = [];
    ctx.tenses.forEach(meta => {
      const row = buckets[meta.group];
      if (row && row[meta.time]) row[meta.time].push(meta);
      else extras.push(meta);
    });
    return { buckets, extras };
  }

  function rowLabel(group) {
    return escapeHtml(group.zh || group.label);
  }

  function renderMatrixDesktop(wrap, buckets, extras) {
    const buildCell = (arr) => {
      if (!arr.length) return '<div class="conj-matrix-empty">·</div>';
      return arr.map(buildTenseButton).join('');
    };

    const moodRows = matrixRows().map(group => {
      const b = buckets[group.key];
      return `
        <div class="conj-matrix-row-label">${rowLabel(group)}</div>
        <div class="conj-matrix-cell">${buildCell(b.present)}</div>
        <div class="conj-matrix-cell">${buildCell(b.past)}</div>
        <div class="conj-matrix-cell">${buildCell(b.future)}</div>`;
    }).join('\n');

    wrap.innerHTML = `
      <div class="conj-tense-matrix">
        <div class="conj-matrix-head">语气\\时间</div>
        ${TIME_ORDER.map(time => `<div class="conj-matrix-head">${TIME_LABELS[time]}</div>`).join('')}
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
    const moodSections = matrixRows().map(group => {
      const groupBuckets = buckets[group.key];
      const timeSections = TIME_ORDER.map(time => {
        const arr = groupBuckets[time];
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
          <div class="conj-mobile-mood-label">${rowLabel(group)}</div>
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

    // 数据缺席时给出提示而不是空矩阵，绝不抛错。
    if (!ctx.tenses.length) {
      wrap.innerHTML = `
        <div class="conj-matrix-empty" style="padding:2rem;text-align:center;">
          数据未加载，请稍后再试。
        </div>
      `;
      return;
    }

    const { buckets, extras } = buildMatrixBuckets();
    if (isMobileLayout()) renderMatrixMobile(wrap, buckets, extras);
    else renderMatrixDesktop(wrap, buckets, extras);

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

  // ==================== 出题 ====================

  function buildQueue() {
    const subset = getLessonSubset().words;
    const meta = tenseMeta(state.selectedTense);
    const queue = [];
    if (!meta) {
      state.queue = queue;
      return;
    }

    subset.forEach(verb => {
      const value = verb.tenses[meta.key];
      if (value == null) return;
      const base = {
        word: verb.word,
        english: verb.en || '',
        zh: verb.zh || '',
        rank: verb.rank,
        tenseKey: meta.key,
        tenseLabel: meta.label,
        groupLabel: meta.groupLabel
      };

      if (meta.type === 'person') {
        const items = personsForTense(meta.key).map(person => {
          const answers = splitAlternatives(personForm(value, person));
          if (!answers.length) return null;
          return { key: person, person, promptLabel: personLabelOf(person, meta.key), answers };
        }).filter(Boolean);

        if (state.mode === 'full') {
          if (items.length) {
            queue.push({ ...base, promptType: 'group', promptLabel: '完整变位', promptValue: '全部人称', items });
          }
          return;
        }
        items.forEach(item => {
          queue.push({
            ...base,
            promptType: 'person',
            person: item.person,
            promptLabel: '人称',
            promptValue: item.promptLabel,
            answers: item.answers
          });
        });
        return;
      }

      // 单形时态（不定式、分词等）：一个形式，/ 分隔的异体都算对
      const answers = splitAlternatives(value);
      if (!answers.length) return;
      if (state.mode === 'full') {
        queue.push({
          ...base,
          promptType: 'group',
          promptLabel: '完整形式',
          promptValue: '共 1 项',
          items: [{ key: meta.key, promptLabel: meta.label, answers }]
        });
        return;
      }
      queue.push({ ...base, promptType: 'single', promptLabel: '形式', promptValue: meta.label, answers });
    });

    state.queue = window.shuffleArray(queue);
    state.index = 0;
    state.correct = 0;
    state.total = 0;
    state.current = null;
    state.started = true;
  }

  // 答题遥测：只记学习活动（变位不进 SRS）。失败绝不影响练习。
  function recordAnswer(correct, total) {
    try {
      if (!window.StatsManager || !ctx.code) return;
      const durationMs = state.questionStartedAt ? Date.now() - state.questionStartedAt : 0;
      // StatsManager 的语言参数是 Languages 的 key（italian / german …）
      window.StatsManager.recordActivity(window.Languages.key(ctx.code), { correct, total, durationMs });
    } catch (e) {
      console.error('变位练习记录失败:', e);
    }
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

    const tenseTitleEl = document.getElementById('conjTenseTitle');
    const infinitive = document.getElementById('conjInfinitive');
    const englishLine = document.getElementById('conjEnglishLine');
    const english = document.getElementById('conjEnglish');
    const promptLabel = document.getElementById('conjPromptLabel');
    const pronoun = document.getElementById('conjPronoun');

    if (tenseTitleEl) tenseTitleEl.textContent = tenseTitle(tenseMeta(q.tenseKey)) || `${q.groupLabel} · ${q.tenseLabel}`;
    if (infinitive) infinitive.textContent = q.word;
    if (englishLine) englishLine.classList.toggle('hidden', !q.english);
    if (english) english.textContent = q.english || '-';
    if (promptLabel) promptLabel.textContent = `${q.promptLabel}：`;
    if (pronoun) pronoun.textContent = q.promptValue;
  }

  function renderFullGroup() {
    const wrap = document.getElementById('conjFullGrid');
    if (!wrap || !isGroupedFullQuestion(state.current)) return;

    wrap.innerHTML = state.current.items.map((item, index) => `
      <label class="conj-full-item" data-key="${escapeAttribute(item.key)}">
        <span class="conj-full-label">${escapeHtml(item.promptLabel)}</span>
        <input
          type="text"
          class="spell-input conj-full-input"
          data-index="${index}"
          placeholder="请输入"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"${ctx.code ? ` lang="${escapeAttribute(ctx.code)}"` : ''}
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
      .flatMap(item => item.answers || [])
      .filter(v => norm(v) !== norm(correct));

    const distractors = window.shuffleArray([...new Set(pool)]).slice(0, 3);
    const options = window.shuffleArray([correct, ...distractors]);

    optionsWrap.innerHTML = options
      .map(opt => `<button class="option" data-answer="${escapeAttribute(opt)}">${escapeHtml(opt)}</button>`)
      .join('');

    optionsWrap.querySelectorAll('.option').forEach(btn => {
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
      alert(`动词变位练习完成！\n\n正确: ${state.correct}/${state.total}\n正确率: ${acc}%`);
      if (typeof showScreen === 'function') showScreen('conjugationSetupScreen');
      if (typeof window.setPracticeContext === 'function') window.setPracticeContext('conjugation');
      return;
    }

    state.current = state.queue[state.index];
    state.questionStartedAt = Date.now();
    document.getElementById('conjAdvanceLessonBtn')?.classList.add('hidden');
    updateProgress();
    updateQuestionUI();
    clearFeedback();

    const typingSection = document.getElementById('conjTypingSection');
    const mcqSection = document.getElementById('conjMcqSection');
    const fullSection = document.getElementById('conjFullSection');
    const input = document.getElementById('conjInput');

    const keys = document.getElementById('conjKeys');
    if (keys) keys.classList.toggle('hidden', state.mode === 'mcq');

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
    if (!state.current || isGroupedFullQuestion(state.current)) return;
    const input = document.getElementById('conjInput');
    const checkBtn = document.getElementById('conjCheckBtn');
    if (!input || input.disabled) return;

    const grade = gradeAnswer(state.current.answers, state.current.person, input.value);
    const isCorrect = grade === 'correct';

    state.total += 1;
    if (isCorrect) state.correct += 1;
    updateProgress();
    recordAnswer(isCorrect ? 1 : 0, 1);

    input.disabled = true;
    if (checkBtn) checkBtn.disabled = true;

    const answerText = answerDisplayText(state.current.answers, state.current.person, state.current.tenseKey);
    showFeedback(
      isCorrect,
      isCorrect ? '正确！' : grade === 'accent' ? `字母对了，重音不对：${answerText}` : `错误，正确答案：${answerText}`,
      state.mode === 'full' && isCorrect ? 700 : 0
    );
  }

  function checkFullGroupAnswer() {
    if (!isGroupedFullQuestion(state.current)) return;

    const wrap = document.getElementById('conjFullGrid');
    const checkBtn = document.getElementById('conjFullCheckBtn');
    if (!wrap || (checkBtn && checkBtn.disabled)) return;

    let allCorrect = true;
    let localTotal = 0;
    let localCorrect = 0;

    // 行与 items 一一对应（renderFullGroup 按同一顺序渲染）
    const rows = wrap.querySelectorAll('.conj-full-item');
    state.current.items.forEach((item, index) => {
      const row = rows[index];
      const input = row?.querySelector('.conj-full-input');
      const answerEl = row?.querySelector('.conj-full-answer');
      if (!input || !row || !answerEl) return;

      const grade = gradeAnswer(item.answers, item.person, input.value);
      const correct = grade === 'correct';

      localTotal += 1;
      if (correct) localCorrect += 1;
      else allCorrect = false;

      input.disabled = true;
      row.classList.remove('correct', 'incorrect');
      row.classList.add(correct ? 'correct' : 'incorrect');
      const answerText = answerDisplayText(item.answers, item.person, state.current.tenseKey);
      answerEl.textContent = correct
        ? '正确'
        : grade === 'accent' ? `字母对了，重音不对：${answerText}` : `正确答案：${answerText}`;
      answerEl.classList.remove('hidden');
    });

    if (checkBtn) checkBtn.disabled = true;

    state.total += localTotal;
    state.correct += localCorrect;
    updateProgress();
    if (localTotal) recordAnswer(localCorrect, localTotal);

    showFeedback(
      allCorrect,
      allCorrect ? '本组全部正确！' : `本组答对 ${localCorrect}/${localTotal}`,
      allCorrect ? 900 : 0
    );
  }

  function checkMcqAnswer(button) {
    if (!state.current || !button || button.disabled) return;
    const chosen = button.dataset.answer || '';
    const isCorrect = state.current.answers.some(ans => norm(ans) === norm(chosen));

    state.total += 1;
    if (isCorrect) state.correct += 1;
    updateProgress();
    recordAnswer(isCorrect ? 1 : 0, 1);

    const buttons = document.querySelectorAll('#conjOptions .option');
    const correctNorm = norm(state.current.answers[0]);

    buttons.forEach(btn => {
      btn.disabled = true;
      const value = norm(btn.dataset.answer || '');
      if (value === correctNorm) btn.classList.add('correct');
      else if (btn === button && !isCorrect) btn.classList.add('wrong');
      else btn.classList.add('faded');
    });

    showFeedback(isCorrect, isCorrect ? '正确！' : `错误，正确答案：${state.current.answers.join(' / ')}`);
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
    document.getElementById('conjugationScreen')?.addEventListener('focusin', (e) => {
      const t = e.target;
      if (t && (t.id === 'conjInput' || (t.classList && t.classList.contains('conj-full-input')))) lastConjInput = t;
    });
    const lessonSizeSelect = document.getElementById('conjLessonSizeSelect');

    lessonSizeSelect?.addEventListener('change', () => {
      state.lessonSize = parseInt(lessonSizeSelect.value, 10) || 10;
      restoreLessonIndex();
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

    // 设置页的「返回语法」：父屏是统一的 grammarScreen。
    document.getElementById('conjugationSetupBackBtn')?.addEventListener('click', () => {
      if (typeof goBack === 'function') goBack({ fallbackTarget: 'grammarScreen' });
    });
  }

  let lookupCode = null; // 查词结果属于哪门语言

  // 为当前语言重建数据与界面（init / openFor 共用）
  function reloadFor(code) {
    if (code) migrateLessonStorage(code);
    prepareData(code);
    restoreLessonIndex();
    state.started = false;

    const profile = code ? window.Languages.get(code) : null;
    const eyebrow = document.querySelector('#conjugationSetupScreen .eyebrow');
    if (eyebrow) eyebrow.textContent = profile ? `${profile.cn} / Verb Conjugation` : 'Grammar / Verb Conjugation';

    const lookupInput = document.getElementById('conjLookupInput');
    if (lookupInput) lookupInput.placeholder = ctx.placeholders.lookup || '输入动词原形或变位形式';
    // 换了语言就清掉上一门语言的查词输入和结果
    if (lookupCode !== code) {
      if (lookupCode) clearLookupSearch();
      lookupCode = code;
    }
    const typingInput = document.getElementById('conjInput');
    if (typingInput) typingInput.placeholder = ctx.placeholders.typing || '请输入正确变位';
    // 动词、人称、变位和输入框是目标语言：给读屏/输入法/断字正确的 lang。
    // 只标这些目标语言区块——屏幕外壳是中文界面，整屏标 lang 会让读屏用错发音。
    ['conjInfinitive', 'conjPronoun', 'conjInput', 'conjFullGrid', 'conjOptions', 'conjLookupInput'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (code) el.setAttribute('lang', code);
      else el.removeAttribute('lang');
    });
    mountConjKeys();
    renderTenseButtons();
    updateLessonUI();
  }

  // 特殊字母键盘（profile.accents）：插到最近一次获得焦点的作答框里
  let lastConjInput = null;
  function currentConjInput() {
    if (state.mode === 'full' && isGroupedFullQuestion(state.current)) {
      if (lastConjInput && lastConjInput.classList && lastConjInput.classList.contains('conj-full-input')
        && lastConjInput.isConnected !== false && !lastConjInput.disabled) return lastConjInput;
      return document.querySelector('#conjFullGrid .conj-full-input:not([disabled])');
    }
    return document.getElementById('conjInput');
  }
  function mountConjKeys() {
    const host = document.getElementById('conjKeys');
    if (!host || !window.Languages || typeof window.Languages.mountAccentKeys !== 'function') return;
    window.Languages.mountAccentKeys(host, currentConjInput, ctx.code);
  }

  function init() {
    // 首屏不预选语言：数据按模块懒加载，进入模块时由 openFor(code) 装载
    const initial = window.Languages && window.Languages.DEFAULT;
    reloadFor(dataFor(initial) ? initial : null);
    bindEvents();
  }

  // 打开（四语共用的）变位设置页。lang 可以是 code（'de'）或旧 key（'german'）。
  // 进度按语言分开存（storageKeyFor），返回由 showScreen 的历史栈处理。
  function openFor(lang, retried) {
    const code = window.Languages && window.Languages.code(lang);
    if (!code) return;

    // 变位数据按模块懒加载（每门语言几 MB，只有进本模块才用得上）。
    // 缺席时补拉后重试一次；拉不到再走「数据未加载」提示。
    // LangLoader 的 ensureModule / isModuleLoaded 接受 code 或 key（内部 keyOf 归一）。
    if (!dataFor(code) && !retried && window.LangLoader
      && typeof window.LangLoader.ensureModule === 'function'
      && !window.LangLoader.isModuleLoaded(code, 'conjugations')) {
      window.LangLoader.ensureModule(code, 'conjugations').then(() => {
        // 下载期间用户可能已经换了语言：别把旧语言的变位页弹出来
        const active = typeof window.getActiveLanguage === 'function' ? window.getActiveLanguage() : null;
        if (active && window.Languages.code(active) !== code) return;
        openFor(code, true);
      });
      return;
    }

    reloadFor(code);

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
    openFor,
    storageKeyFor
  };

  document.addEventListener('DOMContentLoaded', init);
})();
