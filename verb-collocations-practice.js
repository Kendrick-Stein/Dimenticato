/**
 * VerbCollocationPractice — 动词搭配练习模块
 * Uses VERB_COLLOCATIONS_DATA from data/verb-collocations-data.js
 */
const VerbCollocationPractice = (() => {
  let initialized = false;
  const state = {
    queue: [],
    index: 0,
    correct: 0,
    total: 0,
    currentQuestion: null,
  };

  const dom = {};

  function init() {
    if (initialized) return;
    initialized = true;
    cacheDom();
    bindEvents();
    renderSummary();
  }

  function open() {
    showScreen('verbCollocationPracticeScreen');
    init();
    renderSummary();
    resetPracticeUI();
  }

  function cacheDom() {
    dom.backBtn = document.getElementById('vcPracticeBackBtn');
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
      if (typeof goBack === 'function') goBack({ fallbackTarget: 'grammarScreen' });
      else showScreen('grammarScreen');
    });
    dom.startBtn?.addEventListener('click', start);
    dom.checkBtn?.addEventListener('click', checkInputAnswer);
    dom.hintBtn?.addEventListener('click', revealHint);
    dom.nextBtn?.addEventListener('click', nextQuestion);
    [dom.typeSelect, dom.countSelect].forEach(el => {
      el?.addEventListener('change', renderSummary);
    });
  }

  function getVerbEntries() {
    return Object.entries(VERB_COLLOCATIONS_DATA?.verbs || {});
  }

  function normalizeText(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function extractItZh(raw) {
    const text = String(raw || '').trim();
    const match = text.match(/^(.+?[\.!?！？。])\s*(.+)$/);
    if (match) {
      return { it: match[1].trim(), zh: match[2].trim() };
    }
    const splitIndex = text.search(/[\u4e00-\u9fff]/);
    if (splitIndex > 0) {
      return {
        it: text.slice(0, splitIndex).trim(),
        zh: text.slice(splitIndex).trim(),
      };
    }
    return { it: text, zh: '' };
  }

  function getSinglePrepEntries() {
    return getVerbEntries().filter(([, data]) => (data.prepositionOrder || []).length === 1);
  }

  function getMultiPrepEntries() {
    return getVerbEntries().filter(([, data]) => (data.prepositionOrder || []).length > 1);
  }

  function getTranslationEntries() {
    return getVerbEntries().filter(([, data]) => {
      const preps = data.prepositionOrder || [];
      return preps.some(prep => (data.prepositions?.[prep] || []).some(example => {
        const parsed = extractItZh(example);
        return parsed.it && parsed.zh && parsed.it.includes(' ');
      }));
    });
  }

  function renderSummary() {
    if (!dom.summary) return;
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
        <strong>${typeLabelMap[type]}</strong>
      </div>
      <div class="selection-summary-item">
        <span class="selection-summary-label">题库分流</span>
        <span>单介词 ${singlePrepCount} / 多介词 ${multiPrepCount} / 可翻译例句 ${translationCount}</span>
      </div>
      <div class="selection-summary-item">
        <span class="selection-summary-label">数据概况</span>
        <span>本次练习 ${count} 题</span>
      </div>
    `;
  }

  function resetPracticeUI() {
    state.queue = [];
    state.index = 0;
    state.correct = 0;
    state.total = 0;
    state.currentQuestion = null;
    dom.setupCard?.classList.remove('hidden');
    dom.quizCard?.classList.add('hidden');
    dom.feedback?.classList.add('hidden');
    updateProgress();
  }

  function start() {
    const queue = buildQuestionQueue();
    if (!queue.length) {
      alert('当前题型下没有可用题目，请切换题型后重试。');
      return;
    }
    state.queue = queue;
    state.index = 0;
    state.correct = 0;
    state.total = 0;
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
    const prep = (data.prepositionOrder || Object.keys(data.prepositions || {}))[0];
    if (!prep) return [];
    return [{
      kind: 'prep',
      slug,
      verb: data.display,
      prep,
      prompt: `${data.display} ___`,
      hint: `请选择和动词 ${data.display} 搭配的介词。`,
      options: buildPrepOptions(prep),
      answer: prep,
    }];
  }

  function buildContrastQuestions(slug, data) {
    const preps = data.prepositionOrder || Object.keys(data.prepositions || {});
    if (preps.length < 2) return [];
    return preps.map(prep => {
      const example = data.prepositions?.[prep]?.[0] || '';
      const parsed = extractItZh(example);
      return {
        kind: 'contrast',
        slug,
        verb: data.display,
        prep,
        prompt: `${data.display} ___`,
        subprompt: parsed.zh || '根据释义选择正确介词。',
        options: shuffleArray([...preps]),
        answer: prep,
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
    const preps = data.prepositionOrder || Object.keys(data.prepositions || {});
    const questions = [];
    preps.forEach(prep => {
      (data.prepositions?.[prep] || []).slice(0, 2).forEach(example => {
        const parsed = extractItZh(example);
        if (!parsed.it || !parsed.zh || !parsed.it.includes(' ')) return;
        questions.push({
          kind: 'translation',
          slug,
          verb: data.display,
          prep,
          prompt: `${data.display} + ${prep}`,
          subprompt: parsed.zh,
          answer: parsed.it,
          tokens: tokenizeSentence(parsed.it),
        });
      });
    });
    return questions;
  }

  function buildPrepOptions(correctPrep) {
    const all = VERB_COLLOCATIONS_DATA?.meta?.prepositionOrder || ['a', 'di', 'da', 'con', 'per', 'in'];
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
          <input type="text" class="vc-translation-input" data-index="${index}" value="${escapeHtml(value)}" ${disabled} autocomplete="off">
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
      `<button class="option-btn" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`
    )).join('');
    dom.options.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => checkChoiceAnswer(btn, answer));
    });
  }

  function checkChoiceAnswer(button, answer) {
    const selected = button.dataset.answer;
    const isCorrect = selected === answer;
    state.total += 1;
    if (isCorrect) state.correct += 1;

    dom.options.querySelectorAll('.option-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answer === answer) btn.classList.add('correct');
      if (btn === button && !isCorrect) btn.classList.add('incorrect');
    });

    showFeedback(isCorrect, answer);
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
    showFeedback(allCorrect, question.answer);
  }

  function revealHint() {
    const question = state.currentQuestion;
    if (!question || question.kind !== 'translation') return;
    const targetIndex = question.tokens.findIndex(token => !token.revealed);
    if (targetIndex === -1) return;
    question.tokens[targetIndex].revealed = true;
    renderTranslationInputs(question);
  }

  function showFeedback(isCorrect, answer) {
    const feedbackText = dom.feedback.querySelector('.feedback-text');
    feedbackText.textContent = isCorrect ? '回答正确' : `回答有误，正确答案是：${answer}`;
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
    alert(`练习完成\n\n正确: ${state.correct}/${state.total}\n正确率: ${accuracy}%`);
    resetPracticeUI();
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { init, open };
})();

document.addEventListener('DOMContentLoaded', () => {
  VerbCollocationPractice.init();
});