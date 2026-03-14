/**
 * 动词变位练习模块（多时态）
 */

(function () {
  const PERSON_ORDER = ['io', 'tu', 'lui_lei', 'noi', 'voi', 'loro'];
  const PERSON_LABEL = {
    io: 'io',
    tu: 'tu',
    lui_lei: 'lui / lei',
    noi: 'noi',
    voi: 'voi',
    loro: 'loro'
  };

  const state = {
    verbs: [],
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

  const STORAGE_KEY = 'dimenticato_conjugation_lessons';

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
      .filter(Boolean);
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
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { completed: {}, lastViewed: {} };
    } catch {
      return { completed: {}, lastViewed: {} };
    }
  }

  function saveLessonStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    const raw =
      typeof CONJUGATION_ALL_TENSES_DATA !== 'undefined' && Array.isArray(CONJUGATION_ALL_TENSES_DATA)
        ? CONJUGATION_ALL_TENSES_DATA
        : buildFallbackFromPresente();

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
    const firstTenseKey = Object.keys(meta)[0] || 'indicativo_presente';
    state.selectedTense = firstTenseKey;
  }

  function getSortedTenseMeta() {
    return Object.values(state.tenseMeta).sort((a, b) => a.label.localeCompare(b.label, 'it'));
  }

  function getMoodBucket(meta) {
    const g = (meta.group || '').toLowerCase();
    if (g.includes('indicativo')) return 'indicativo';
    if (g.includes('condizionale')) return 'condizionale';
    if (g.includes('congiuntivo')) return 'congiuntivo';
    return 'other';
  }

  function getTimeBucket(meta) {
    const t = (meta.tense || '').toLowerCase();
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

  const MOOD_LABELS = {
    indicativo: '直陈式',
    condizionale: '条件式',
    congiuntivo: '虚拟式'
  };

  const TIME_LABELS = {
    present: '现在',
    past: '过去',
    future: '将来'
  };

  function isMobileLayout() {
    return window.innerWidth <= 640;
  }

  function buildMatrixBuckets(tenseList) {
    const buckets = {
      indicativo: { present: [], past: [], future: [] },
      condizionale: { present: [], past: [], future: [] },
      congiuntivo: { present: [], past: [], future: [] }
    };
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

    wrap.innerHTML = `
      <div class="conj-tense-matrix">
        <div class="conj-matrix-head">语气\\时间</div>
        <div class="conj-matrix-head">现在</div>
        <div class="conj-matrix-head">过去</div>
        <div class="conj-matrix-head">将来</div>

        <div class="conj-matrix-row-label">直陈式</div>
        <div class="conj-matrix-cell">${buildCell(buckets.indicativo.present)}</div>
        <div class="conj-matrix-cell">${buildCell(buckets.indicativo.past)}</div>
        <div class="conj-matrix-cell">${buildCell(buckets.indicativo.future)}</div>

        <div class="conj-matrix-row-label">条件式</div>
        <div class="conj-matrix-cell">${buildCell(buckets.condizionale.present)}</div>
        <div class="conj-matrix-cell">${buildCell(buckets.condizionale.past)}</div>
        <div class="conj-matrix-cell">${buildCell(buckets.condizionale.future)}</div>

        <div class="conj-matrix-row-label">虚拟式</div>
        <div class="conj-matrix-cell">${buildCell(buckets.congiuntivo.present)}</div>
        <div class="conj-matrix-cell">${buildCell(buckets.congiuntivo.past)}</div>
        <div class="conj-matrix-cell">${buildCell(buckets.congiuntivo.future)}</div>
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
    const moods = ['indicativo', 'condizionale', 'congiuntivo'];
    const times = ['present', 'past', 'future'];

    const moodSections = moods.map(mood => {
      const timeSections = times.map(time => {
        const arr = buckets[mood][time];
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
          <div class="conj-mobile-mood-label">${MOOD_LABELS[mood]}</div>
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
        const items = PERSON_ORDER.map(p => {
          const form = tenseData.forms ? tenseData.forms[p] : null;
          const answers = splitAlternatives(form);
          if (!answers.length) return null;
          return {
            key: p,
            promptLabel: PERSON_LABEL[p] || p,
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
        PERSON_ORDER.forEach(p => {
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
            promptValue: PERSON_LABEL[p] || p,
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
    document.getElementById('conjBackBtn')?.addEventListener('click', () => {
      if (typeof showScreen === 'function') showScreen('conjugationSetupScreen');
      if (typeof window.setPracticeContext === 'function') window.setPracticeContext('conjugation');
    });
  }

  function init() {
    prepareData();
    const storage = loadLessonStorage();
    const savedLesson = storage.lastViewed[`${state.selectedTense}__${state.lessonSize}`];
    state.lessonIndex = Number.isInteger(savedLesson) ? savedLesson : 0;
    renderTenseButtons();
    updateLessonUI();
    bindEvents();
  }

  window.ConjugationPractice = {
    init,
    start
  };

  document.addEventListener('DOMContentLoaded', init);
})();
