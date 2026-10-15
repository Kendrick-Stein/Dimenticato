/** Read for meaning first. Optional reviewed questions; session-only, first-answer scoring. */
(function (global) {
  'use strict';
  var sessions = new Map(), mountSequence = 0;
  var KINDS = { 'main-idea': '主旨', detail: '细节', cause: '原因', inference: '推断' };
  function el(tag, text, cls) { var n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; }
  function button(text, fn, cls) { var n = el('button', text, 'btn btn-ghost' + (cls ? ' ' + cls : '')); n.type = 'button'; n.addEventListener('click', fn); return n; }
  function focusAndScroll(target) {
    if (target.focus) target.focus({ preventScroll: true });
    // Deliberately no URL/hash changes, and no forced motion for evidence navigation.
    if (target.scrollIntoView) target.scrollIntoView({ behavior: 'auto', block: 'center' });
  }
  function clearEvidence(body) {
    if (!body) return;
    body.querySelectorAll('.reading-comprehension-highlight').forEach(function (row) { row.classList.remove('reading-comprehension-highlight'); });
    body.querySelectorAll('.reading-comprehension-return').forEach(function (control) { control.remove(); });
  }
  function mount(host, article, data, body) {
    if (!global.ReadingComprehension || !global.ReadingComprehension.validate(data, article)) return false;
    var key = article.lang + '/' + article.id, fingerprint = JSON.stringify(data), session = sessions.get(key);
    if (!session || session.fingerprint !== fingerprint) {
      session = { fingerprint: fingerprint, state: global.ReadingComprehension.create(data), showAid: false };
      sessions.set(key, session);
    }
    var state = session.state, prefix = 'reading-comprehension-' + (++mountSequence);
    body = body || document.getElementById('readingBody');
    clearEvidence(body);
    host.classList.add('reading-comprehension');
    host.hidden = false;
    function showEvidence(sentenceId, feedback, questionNumber) {
      if (!body) return;
      // Compare data values rather than constructing a selector from content.
      var row = Array.from(body.querySelectorAll('.reading-sentence')).find(function (item) { return item.dataset.sentence === sentenceId; });
      if (!row) return;
      clearEvidence(body);
      row.classList.add('reading-comprehension-highlight');
      row.setAttribute('tabindex', '-1');
      row.appendChild(button('返回第 ' + questionNumber + ' 题解析', function () {
        clearEvidence(body); focusAndScroll(feedback);
      }, 'reading-comprehension-return'));
      focusAndScroll(row);
    }
    function render(afterReset) {
      host.replaceChildren();
      var title = el('h2', '阅读理解'); title.id = prefix + '-title'; title.setAttribute('tabindex', '-1');
      host.setAttribute('aria-labelledby', title.id); host.appendChild(title);
      host.appendChild(el('p', '读完正文，先检查自己是否理解内容，再看下面的学习总结。每题点击一个选项即提交；提交后显示原文依据和解析。', 'reading-hint'));
      var controls = el('div', undefined, 'reading-controls');
      var hasAid = data.questions.some(function (q) { return !!q.promptZh; });
      if (hasAid) {
        var aid = button('题目中文辅助', function () {
          session.showAid = !session.showAid;
          host.querySelectorAll('.reading-comprehension-aid').forEach(function (p) { p.hidden = !session.showAid; });
          aid.setAttribute('aria-pressed', String(session.showAid));
        }, 'reading-comprehension-aid-toggle');
        aid.setAttribute('aria-pressed', String(session.showAid));
        aid.setAttribute('aria-controls', data.questions.map(function (q, i) { return q.promptZh ? prefix + '-aid-' + i : ''; }).filter(Boolean).join(' '));
        controls.appendChild(aid);
      }
      controls.appendChild(button('重做阅读理解', function () { state.reset(); clearEvidence(body); render(true); }, 'reading-comprehension-redo'));
      host.appendChild(controls);
      var score = el('p', undefined, 'reading-comprehension-score'); score.setAttribute('role', 'status'); score.setAttribute('aria-atomic', 'true'); host.appendChild(score);
      function updateScore() {
        var answered = data.questions.filter(function (q) { return state.answers[q.id]; });
        var correct = answered.filter(function (q) { return state.answers[q.id].correct; }).length;
        score.textContent = '已作答 ' + answered.length + '/' + data.questions.length + ' · 首答正确 ' + correct + '/' + data.questions.length;
      }
      updateScore();
      data.questions.forEach(function (q, i) {
        var card = el('section', undefined, 'reading-comprehension-card'); card.setAttribute('data-question-id', q.id); host.appendChild(card);
        function renderQuestion(focusFeedback) {
          card.replaceChildren();
          var saved = state.answers[q.id];
          card.appendChild(el('p', '第 ' + (i + 1) + ' 题 · ' + KINDS[q.kind], 'reading-comprehension-kind'));
          var prompt = el('h3', q.prompt, 'reading-comprehension-prompt'); prompt.lang = article.lang; prompt.id = prefix + '-question-' + i; card.appendChild(prompt);
          card.setAttribute('aria-labelledby', prompt.id);
          if (q.promptZh) {
            var translation = el('p', q.promptZh, 'reading-comprehension-aid'); translation.lang = 'zh-CN'; translation.id = prefix + '-aid-' + i; translation.hidden = !session.showAid; card.appendChild(translation);
          }
          var choices = el('div', undefined, 'reading-comprehension-choices'); choices.setAttribute('role', 'group'); choices.setAttribute('aria-labelledby', prompt.id);
          q.options.forEach(function (option, optionIndex) {
            var choice = button(undefined, function () {
              // An old DOM event cannot replace a first answer, even after a re-render.
              if (state.answers[q.id]) return;
              if (state.submit(q.id, optionIndex)) { renderQuestion(true); updateScore(); }
            }, 'reading-comprehension-option');
            choice.setAttribute('data-option-index', String(optionIndex));
            choice.lang = article.lang;
            choice.appendChild(el('span', String.fromCharCode(65 + optionIndex) + '. ' + option));
            choice.disabled = !!saved;
            choice.setAttribute('aria-pressed', String(!!saved && saved.optionIndex === optionIndex));
            if (saved) {
              var label = '';
              if (optionIndex === q.answerIndex) { choice.classList.add('is-correct'); label = '正确答案'; }
              if (optionIndex === saved.optionIndex) {
                choice.classList.add('is-selected');
                if (!saved.correct) choice.classList.add('is-incorrect');
                label += (label ? ' · ' : '') + '你的答案';
              }
              if (label) { var badge = el('span', label, 'reading-comprehension-option-label'); badge.lang = 'zh-CN'; choice.appendChild(badge); }
            }
            choices.appendChild(choice);
          });
          card.appendChild(choices);
          // No evidence or explanation nodes are created before submission.
          if (!saved) return;
          var feedback = el('div', undefined, 'reading-comprehension-feedback' + (saved.correct ? ' is-correct' : ' is-incorrect'));
          feedback.setAttribute('tabindex', '-1'); feedback.setAttribute('role', 'region');
          var result = el('h4', saved.correct ? '答对了' : '本题未答对'); result.id = prefix + '-result-' + i;
          feedback.setAttribute('aria-labelledby', result.id); feedback.appendChild(result);
          var correctAnswer = el('p', '正确答案：');
          var answer = el('span', String.fromCharCode(65 + q.answerIndex) + '. ' + q.options[q.answerIndex]); answer.lang = article.lang; correctAnswer.appendChild(answer); feedback.appendChild(correctAnswer);
          var explanation = el('p', q.explanationZh, 'reading-comprehension-explanation'); explanation.lang = 'zh-CN'; feedback.appendChild(explanation);
          q.evidence.forEach(function (sentenceId) {
            var sentenceIndex = article.sentences.findIndex(function (s) { return s.id === sentenceId; }), sentence = article.sentences[sentenceIndex];
            var evidence = el('div', undefined, 'reading-comprehension-evidence');
            evidence.appendChild(el('p', '原文依据 · 第 ' + (sentenceIndex + 1) + ' 句', 'reading-comprehension-evidence-label'));
            var quote = el('blockquote', sentence.text); quote.lang = article.lang; evidence.appendChild(quote);
            var meaning = el('p', sentence.zh, 'reading-comprehension-evidence-meaning'); meaning.lang = 'zh-CN'; evidence.appendChild(meaning);
            if (body) evidence.appendChild(button('回看第 ' + (sentenceIndex + 1) + ' 句', function () { showEvidence(sentenceId, feedback, i + 1); }, 'reading-comprehension-evidence-button'));
            feedback.appendChild(evidence);
          });
          card.appendChild(feedback);
          if (focusFeedback && feedback.focus) feedback.focus({ preventScroll: true });
        }
        renderQuestion(false);
      });
      host.appendChild(el('p', '仅保留本次打开页面的作答；离开再返回可继续，刷新后重新开始。重做只清空阅读理解，不改变填词、拼写、词汇挑战、已掌握或复习计划。', 'reading-hint'));
      if (afterReset && title.focus) title.focus({ preventScroll: true });
    }
    render(false);
    return true;
  }
  global.ReadingComprehensionApp = { mount: mount };
})(window);
