/**
 * VerbCollocationPractice — 动词搭配练习模块（语言无关）
 *
 * 数据源、语言标签与例句拆分全部复用 verb-collocations.js 暴露的解析层
 * （window.VerbCollocations），所以只要某种语言的搭配数据落盘，本模块无需
 * 改动即可直接出题；没有数据时显示明确的空状态而不是弹一个 alert。
 */
const VerbCollocationPractice = (() => {
  let initialized = false;
  const state = {
    lang: 'italian',
    queue: [],
    index: 0,
    correct: 0,
    total: 0,
    startedAt: 0,
    currentQuestion: null,
  };

  const dom = {};

  // ==================== 语言 / 数据解析层（调用时解析） ====================

  const FALLBACK_PROFILE = { label: '意大利语', title: '意大利语动词搭配', fallbackPreps: ['a', 'di', 'da', 'con', 'per', 'in'] };

  function collocations() {
    return window.VerbCollocations || null;
  }

  function profileFor(lang) {
    const api = collocations();
    if (api && typeof api.profileFor === 'function') return api.profileFor(lang);
    return FALLBACK_PROFILE;
  }

  function datasetFor(lang) {
    const api = collocations();
    if (api && typeof api.resolveDataset === 'function') return api.resolveDataset(lang);
    return typeof VERB_COLLOCATIONS_DATA !== 'undefined' ? VERB_COLLOCATIONS_DATA : null;
  }

  function activeDataset() {
    return datasetFor(state.lang);
  }

  function hasDataset(lang) {
    const data = datasetFor(lang);
    return !!(data && data.verbs && Object.keys(data.verbs).length);
  }

  function detectLang() {
    const bodyLang = document.body ? document.body.getAttribute('data-language') : null;
    const api = collocations();
    const known = (api && api.LANGUAGES) || ['italian', 'german', 'english', 'french'];
    return known.indexOf(bodyLang) >= 0 ? bodyLang : 'italian';
  }

  /** prep 条目可以是 ['例句'] 也可以是 { case, examples }。 */
  function normalizePrepEntry(entry) {
    const api = collocations();
    if (api && typeof api.normalizePrepEntry === 'function') return api.normalizePrepEntry(entry);
    if (Array.isArray(entry)) return { case: null, examples: entry };
    if (entry && Array.isArray(entry.examples)) return { case: entry.case || null, examples: entry.examples };
    return { case: null, examples: [] };
  }

  function getExamples(data, prep) {
    return normalizePrepEntry(data && data.prepositions ? data.prepositions[prep] : null).examples;
  }

  function prepsOf(data) {
    return (data && (data.prepositionOrder || Object.keys(data.prepositions || {}))) || [];
  }

  function prepLabel(prep, data) {
    const api = collocations();
    const prepCase = normalizePrepEntry(data && data.prepositions ? data.prepositions[prep] : null).case;
    if (api && typeof api.prepLabel === 'function') return api.prepLabel(prep, prepCase);
    return prepCase ? `${prep} (${prepCase})` : String(prep);
  }

  /** 「外语句 + 中文释义」拼在一起的例句，切成 { target, gloss }。 */
  function splitExample(raw) {
    const api = collocations();
    if (api && typeof api.splitExample === 'function') return api.splitExample(raw);

    const text = String(raw == null ? '' : raw).trim();
    const sentenceMatch = text.match(/^(.+?[.!?！？。])\s*([\u3000-\u303f\u4e00-\u9fff].*)$/);
    if (sentenceMatch) return { target: sentenceMatch[1].trim(), gloss: sentenceMatch[2].trim() };
    const splitIndex = text.search(/[\u4e00-\u9fff]/);
    if (splitIndex > 0) return { target: text.slice(0, splitIndex).trim(), gloss: text.slice(splitIndex).trim() };
    return { target: text, gloss: '' };
  }

  // ==================== 生命周期 ====================

  function init(lang) {
    const target = lang || (initialized ? state.lang : detectLang());
    state.lang = target;

    if (!initialized) {
      initialized = true;
      cacheDom();
      bindEvents();
    }

    applyChrome();
    renderSummary();
  }

  function open(lang) {
    showScreen('verbCollocationPracticeScreen');
    init(lang);
    resetPracticeUI();
    renderSummary();
  }

  function cacheDom() {
    dom.backBtn = document.getElementById('vcPracticeBackBtn');
    dom.title = document.querySelector('#vcPracticeSetupCard .vcp-title');
    dom.eyebrow = document.querySelector('#vcPracticeSetupCard .eyebrow');
    dom.typeSelect = document.getElementById('vcPracticeTypeSelect');
    dom.countSelect = document.getElementById('vcPracticeQuestionCount');
    dom.summary = document.getElementById('vcPracticeSummary');
    dom.startBtn = document.getElementById('vcPracticeStartBtn');
    dom.setupCard = document.getElementById('vcPracticeSetupCard');
    dom.quizCard = document.getElementById('vcPracticeQuizCard');
    dom.current = document.getElementById('vcPracticeCurrent');
    dom.total = document.getElementById('vcPracticeTotal');
    dom.accuracy = document.getElementById('vcPracticeAccuracy');
    dom.typeLabel = document.getElementById('vcPracticeQuestionTypeLabel');
    dom.prompt = document.getElementById('vcPracticePrompt');
    dom.subprompt = document.getElementById('vcPracticeSubprompt');
    dom.hint = document.getElementById('vcPracticeHint');
    dom.optionsSection = document.getElementById('vcPracticeOptionsSection');
    dom.options = document.getElementById('vcPracticeOptions');
    dom.inputSection = document.getElementById('vcPracticeInputSection');
    dom.translationGrid = document.getElementById('vcTranslationGrid');
    dom.checkBtn = document.getElementById('vcPracticeCheckBtn');
    dom.hintBtn = document.getElementById('vcPracticeHintBtn');
    dom.feedback = document.getElementById('vcPracticeFeedback');
    dom.nextBtn = document.getElementById('vcPracticeNextBtn');
  }

  function bindEvents() {
    dom.backBtn?.addEventListener('click', () => {
      const fallback = state.lang === 'italian' ? 'grammarScreen' : `${state.lang}GrammarScreen`;
      if (typeof goBack === 'function') goBack({ fallbackTarget: fallback });
      else showScreen(fallback);
    });
    dom.startBtn?.addEventListener('click', start);
    dom.checkBtn?.addEventListener('click', checkInputAnswer);
    dom.hintBtn?.addEventListener('click', revealHint);
    dom.nextBtn?.addEventListener('click', nextQuestion);
    [dom.typeSelect, dom.countSelect].forEach(el => {
      el?.addEventListener('change', renderSummary);
    });
  }

  /** 共享屏：标题与返回按钮必须自报语言。 */
  function applyChrome() {
    const profile = profileFor(state.lang);
    if (dom.title) dom.title.textContent = `${profile.label}动词搭配练习`;
    if (dom.eyebrow) dom.eyebrow.textContent = `${profile.label} / Verb Collocations Practice`;
    if (dom.backBtn) {
      dom.backBtn.innerHTML = '<span class="msr">arrow_back</span>返回 ' +
        escapeHtml(state.lang === 'italian' ? 'Grammar' : profile.label + '语法');
    }
  }

  function getVerbEntries() {
    return Object.entries(activeDataset()?.verbs || {});
  }

  function normalizeText(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function getSinglePrepEntries() {
    return getVerbEntries().filter(([, data]) => prepsOf(data).length === 1);
  }

  function getMultiPrepEntries() {
    return getVerbEntries().filter(([, data]) => prepsOf(data).length > 1);
  }

  function getTranslationEntries() {
    return getVerbEntries().filter(([, data]) => prepsOf(data).some(prep =>
      getExamples(data, prep).some(example => {
        const parsed = splitExample(example);
        return parsed.target && parsed.gloss && parsed.target.includes(' ');
      })));
  }

  function renderSummary() {
    if (!dom.summary) return;

    if (!hasDataset(state.lang)) {
      renderMissingDataset();
      return;
    }

    setStartEnabled(true);
    if (dom.summary) dom.summary.style.display = '';

    const type = dom.typeSelect?.value || 'mixed';
    const count = Number(dom.countSelect?.value || 15);
    const singlePrepCount = getSinglePrepEntries().length;
    const multiPrepCount = getMultiPrepEntries().length;
    const translationCount = getTranslationEntries().length;

    const typeLabelMap = {
      mixed: '混合练习',
      prep: '介词选择（单介词动词）',
      contrast: '同动词辨义（多介词动词）',
      translation: '例句翻译',
    };

    dom.summary.innerHTML = `
      <div class="selection-summary-item">
        <span class="selection-summary-label">题型</span>
        <strong>${escapeHtml(typeLabelMap[type] || typeLabelMap.mixed)}</strong>
      </div>
      <div class="selection-summary-item">
        <span class="selection-summary-label">题库分流</span>
        <span>单介词 ${singlePrepCount} / 多介词 ${multiPrepCount} / 可翻译例句 ${translationCount}</span>
      </div>
      <div class="selection-summary-item">
        <span class="selection-summary-label">数据概况</span>
        <span>${escapeHtml(profileFor(state.lang).label)} · 本次练习 ${count} 题</span>
      </div>
    `;
  }

  /** `.primary-btn` 没有 :disabled 样式，禁用态需要显式给出视觉反馈。 */
  function setStartEnabled(enabled) {
    if (dom.startBtn) {
      dom.startBtn.disabled = !enabled;
      dom.startBtn.style.opacity = enabled ? '' : '0.45';
      dom.startBtn.style.cursor = enabled ? '' : 'default';
    }
    [dom.typeSelect, dom.countSelect].forEach(el => { if (el) el.disabled = !enabled; });
  }

  /** 该语言还没有搭配数据时的明确空状态（不再是点了开始才弹 alert）。 */
  function renderMissingDataset() {
    const profile = profileFor(state.lang);
    setStartEnabled(false);
    dom.quizCard?.classList.add('hidden');
    dom.setupCard?.classList.remove('hidden');

    if (dom.summary) {
      // 摘要卡是三列 grid，空状态需要占满整行才不会被压成窄条
      dom.summary.style.display = 'block';
      dom.summary.innerHTML =
        '<div class="vc-empty-state">' +
          '<span class="msr vc-empty-state-icon">hourglass_empty</span>' +
          '<h2>该语言暂无动词搭配数据</h2>' +
          '<p>' + escapeHtml(profile.title) + '词库还在建设中，练习题目暂时无法生成。' +
            '数据落盘后本页会自动出题，无需更新应用。</p>' +
        '</div>';
    }
  }

  function resetPracticeUI() {
    state.queue = [];
    state.index = 0;
    state.correct = 0;
    state.total = 0;
    state.startedAt = 0;
    state.currentQuestion = null;
    dom.setupCard?.classList.remove('hidden');
    dom.quizCard?.classList.add('hidden');
    dom.feedback?.classList.add('hidden');
    updateProgress();
  }

  function start() {
    if (!hasDataset(state.lang)) {
      renderMissingDataset();
      return;
    }
    const queue = buildQuestionQueue();
    if (!queue.length) {
      alert('当前题型下没有可用题目，请切换题型后重试。');
      return;
    }
    state.queue = queue;
    state.index = 0;
    state.correct = 0;
    state.total = 0;
    state.startedAt = Date.now();
    dom.setupCard?.classList.add('hidden');
    dom.quizCard?.classList.remove('hidden');
    loadQuestion();
  }

  function buildQuestionQueue() {
    const type = dom.typeSelect?.value || 'mixed';
    const desiredCount = Number(dom.countSelect?.value || 15);
    const questions = [];

    const types = type === 'mixed' ? ['prep', 'contrast', 'translation'] : [type];
    types.forEach(t => {
      const entries = t === 'prep' ? getSinglePrepEntries()
        : t === 'contrast' ? getMultiPrepEntries()
        : getTranslationEntries();
      entries.forEach(([slug, data]) => {
        if (t === 'prep') questions.push(...buildPrepQuestions(slug, data));
        if (t === 'contrast') questions.push(...buildContrastQuestions(slug, data));
        if (t === 'translation') questions.push(...buildTranslationQuestions(slug, data));
      });
    });

    return shuffleArray(questions).slice(0, desiredCount);
  }

  function buildPrepQuestions(slug, data) {
    const prep = prepsOf(data)[0];
    if (!prep) return [];
    const display = data.display || slug;
    return [{
      kind: 'prep',
      slug,
      verb: display,
      prep,
      prompt: `${display} ___`,
      hint: `请选择和动词 ${display} 搭配的介词。`,
      options: buildPrepOptions(prep),
      answer: prep,
      answerLabel: prepLabel(prep, data),
    }];
  }

  function buildContrastQuestions(slug, data) {
    const preps = prepsOf(data);
    if (preps.length < 2) return [];
    const display = data.display || slug;
    return preps.map(prep => {
      const parsed = splitExample(getExamples(data, prep)[0] || '');
      return {
        kind: 'contrast',
        slug,
        verb: display,
        prep,
        prompt: `${display} ___`,
        subprompt: parsed.gloss || '根据释义选择正确介词。',
        options: shuffleArray([...preps]),
        answer: prep,
        answerLabel: prepLabel(prep, data),
      };
    });
  }

  function tokenizeSentence(sentence) {
    return sentence.split(/\s+/).filter(Boolean).map(token => {
      const match = token.match(/^([A-Za-zÀ-ÿ']+)([^A-Za-zÀ-ÿ']*)$/);
      const word = match ? match[1] : token;
      const punctuation = match ? match[2] : '';
      return { word, punctuation, revealed: false };
    });
  }

  function buildTranslationQuestions(slug, data) {
    const questions = [];
    const display = data.display || slug;
    prepsOf(data).forEach(prep => {
      getExamples(data, prep).slice(0, 2).forEach(example => {
        const parsed = splitExample(example);
        if (!parsed.target || !parsed.gloss || !parsed.target.includes(' ')) return;
        questions.push({
          kind: 'translation',
          slug,
          verb: display,
          prep,
          prompt: `${display} + ${prep}`,
          subprompt: parsed.gloss,
          answer: parsed.target,
          answerLabel: parsed.target,
          tokens: tokenizeSentence(parsed.target),
        });
      });
    });
    return questions;
  }

  function buildPrepOptions(correctPrep) {
    const all = activeDataset()?.meta?.prepositionOrder
      || profileFor(state.lang).fallbackPreps
      || FALLBACK_PROFILE.fallbackPreps;
    const pool = shuffleArray(all.filter(item => item !== correctPrep)).slice(0, 3);
    return shuffleArray([correctPrep, ...pool]);
  }

  function loadQuestion() {
    state.currentQuestion = state.queue[state.index];
    if (!state.currentQuestion) {
      finish();
      return;
    }

    const question = state.currentQuestion;
    updateProgress();
    dom.feedback?.classList.add('hidden');
    dom.typeLabel.textContent = getQuestionTypeLabel(question.kind);
    dom.prompt.textContent = question.prompt;
    dom.subprompt.textContent = question.subprompt || question.hint || '';

    if (question.kind === 'translation') {
      dom.optionsSection.classList.add('hidden');
      dom.inputSection.classList.remove('hidden');
      renderTranslationInputs(question);
      dom.checkBtn.disabled = false;
      dom.hintBtn.classList.remove('hidden');
    } else {
      dom.optionsSection.classList.remove('hidden');
      dom.inputSection.classList.add('hidden');
      dom.hintBtn.classList.add('hidden');
      renderOptions(question.options, question.answer);
    }
  }

  function renderTranslationInputs(question) {
    dom.translationGrid.innerHTML = question.tokens.map((token, index) => {
      const placeholder = '_'.repeat(token.word.length);
      const value = token.revealed ? token.word : '';
      const disabled = token.revealed ? 'disabled' : '';
      return `
        <label class="vc-translation-token ${token.revealed ? 'revealed' : ''}" data-index="${index}">
          <input type="text" class="vc-translation-input" data-index="${index}" value="${escapeAttribute(value)}" ${disabled} autocomplete="off">
          <span class="vc-translation-placeholder">${placeholder}${escapeHtml(token.punctuation)}</span>
        </label>
      `;
    }).join('');

    const firstInput = dom.translationGrid.querySelector('.vc-translation-input:not([disabled])');
    firstInput?.focus();
    dom.translationGrid.querySelectorAll('.vc-translation-input').forEach(input => {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          checkInputAnswer();
        }
      });
    });
  }

  function renderOptions(options, answer) {
    dom.options.innerHTML = options.map(option => (
      `<button class="option" data-answer="${escapeAttribute(option)}">${escapeHtml(option)}</button>`
    )).join('');
    dom.options.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => checkChoiceAnswer(btn, answer));
    });
  }

  function checkChoiceAnswer(button, answer) {
    const selected = button.dataset.answer;
    const isCorrect = selected === answer;
    state.total += 1;
    if (isCorrect) state.correct += 1;

    dom.options.querySelectorAll('.option').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answer === answer) btn.classList.add('correct');
      else if (btn === button && !isCorrect) btn.classList.add('wrong');
      else btn.classList.add('faded');
    });

    showFeedback(isCorrect);
  }

  function checkInputAnswer() {
    const question = state.currentQuestion;
    if (!question) return;
    if (question.kind !== 'translation') return;

    const inputs = [...dom.translationGrid.querySelectorAll('.vc-translation-input')];
    let allCorrect = true;
    inputs.forEach(input => {
      const index = Number(input.dataset.index);
      const expected = question.tokens[index].word;
      const isCorrect = normalizeText(input.value) === normalizeText(expected);
      input.disabled = true;
      input.parentElement.classList.toggle('correct', isCorrect);
      input.parentElement.classList.toggle('incorrect', !isCorrect);
      if (!isCorrect) allCorrect = false;
    });

    state.total += 1;
    if (allCorrect) state.correct += 1;
    dom.checkBtn.disabled = true;
    showFeedback(allCorrect);
  }

  function revealHint() {
    const question = state.currentQuestion;
    if (!question || question.kind !== 'translation') return;
    const targetIndex = question.tokens.findIndex(token => !token.revealed);
    if (targetIndex === -1) return;
    question.tokens[targetIndex].revealed = true;
    renderTranslationInputs(question);
  }

  function showFeedback(isCorrect) {
    const answerLabel = state.currentQuestion
      ? (state.currentQuestion.answerLabel || state.currentQuestion.answer)
      : '';
    const feedbackText = dom.feedback.querySelector('.feedback-text');
    feedbackText.textContent = isCorrect ? '回答正确' : `回答有误，正确答案是：${answerLabel}`;
    dom.feedback.classList.remove('hidden', 'correct', 'incorrect');
    dom.feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    updateProgress();
    if (isCorrect) {
      setTimeout(nextQuestion, 900);
    }
  }

  function nextQuestion() {
    state.index += 1;
    loadQuestion();
  }

  function finish() {
    const accuracy = state.total ? Math.round((state.correct / state.total) * 100) : 0;
    recordActivity();
    alert(`练习完成\n\n正确: ${state.correct}/${state.total}\n正确率: ${accuracy}%`);
    resetPracticeUI();
  }

  /** 每日统计由 StatsManager 汇总；它可能尚未加载，必须在调用时守卫。 */
  function recordActivity() {
    if (!state.total) return;
    try {
      if (typeof window.StatsManager !== 'undefined' && window.StatsManager.recordActivity) {
        window.StatsManager.recordActivity(state.lang, {
          correct: state.correct,
          total: state.total,
          durationMs: state.startedAt ? Date.now() - state.startedAt : 0,
        });
      }
    } catch (error) {
      console.error('记录动词搭配练习统计失败', error);
    }
  }

  function updateProgress() {
    if (dom.current) dom.current.textContent = Math.min(state.index + 1, Math.max(state.queue.length, 1));
    if (dom.total) dom.total.textContent = state.queue.length || 0;
    if (dom.accuracy) {
      const accuracy = state.total ? Math.round((state.correct / state.total) * 100) : 0;
      dom.accuracy.textContent = `${accuracy}%`;
    }
  }

  function getQuestionTypeLabel(kind) {
    return {
      prep: '介词选择',
      contrast: '同动词辨义',
      translation: '例句翻译',
    }[kind] || '练习';
  }

  return { init, open, getLanguage: () => state.lang };
})();

window.VerbCollocationPractice = VerbCollocationPractice;

document.addEventListener('DOMContentLoaded', () => {
  VerbCollocationPractice.init();
});
