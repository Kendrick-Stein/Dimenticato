/** Reading exercises use existing reviewed sentences and TypingGame, never remote AI. */
(function (g) {
  'use strict';
  var sessions = new Map(), playing = null;
  function node(tag, text, cls) { var n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; }
  function btn(text, fn) { var b = node('button', text, 'btn btn-ghost'); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function stop() { if (playing) { playing.game.stop(); if (playing.renderer) playing.renderer.detach(); playing = null; } }
  function mount(host, article, data) {
    stop();
    if (!g.ReadingPractice.validate(data, article)) return;
    var state = sessions.get(article.id); if (!state) { state = g.ReadingPractice.create(data); sessions.set(article.id, state); }
    function render() {
      stop(); host.replaceChildren();
      host.appendChild(node('h2', '读后 5 题'));
      host.appendChild(node('p', '根据中文和上下文，还原本篇原句中的词。使用原文词形，不是开放式翻译；大小写、重音与性数均需准确。', 'reading-hint'));
      var modes = node('div', undefined, 'reading-controls');
      [['choice','选词热身'],['spelling','拼写挑战']].forEach(function (m) { var b = btn(m[1], function () { state.mode = m[0]; render(); }); b.setAttribute('aria-pressed', String(state.mode === m[0])); modes.appendChild(b); });
      modes.appendChild(btn('重做本篇', function () { stop(); state.reset(); render(); })); host.appendChild(modes);
      var answered = data.questions.filter(function (q) { return state.answers[state.mode + ':' + q.id]; });
      host.appendChild(node('p', '已完成 ' + answered.length + '/5 · 首答正确 ' + answered.filter(function (q) { return state.answers[state.mode + ':' + q.id].result === 'correct'; }).length + ' 题', 'reading-practice-score'));
      data.questions.forEach(function (q, i) {
        var sentence = article.sentences.find(function (s) { return s.id === q.sentenceId; });
        var key = state.mode + ':' + q.id, saved = state.answers[key];
        var card = node('section', undefined, 'reading-practice-card'); card.appendChild(node('h3', '第 ' + (i + 1) + ' 题')); card.appendChild(node('p', sentence.zh));
        var foreign = node('p', sentence.text.slice(0,q.start) + ' ____ ' + sentence.text.slice(q.start + q.answer.length), 'reading-foreign'); foreign.lang = article.lang; card.appendChild(foreign);
        function submit(input) { if (state.submit(q,input)) render(); }
        if (state.mode === 'choice') {
          var choices = node('div', undefined, 'reading-practice-choices');
          q.options.forEach(function (option) { var b = btn(option, function () { submit(option); }); b.disabled = !!saved; b.lang = article.lang; choices.appendChild(b); }); card.appendChild(choices);
        } else {
          var form = node('form'), input = node('input'); input.type = 'text'; input.lang = article.lang; input.autocomplete = 'off'; input.setAttribute('autocapitalize','none'); input.setAttribute('spellcheck','false'); input.setAttribute('aria-label','第 ' + (i+1) + ' 题填写原文单词'); input.value = saved ? saved.input : (state.inputs[key] || ''); input.disabled = !!saved;
          input.addEventListener('input', function () { state.inputs[key] = input.value; });
          var check = node('button','检查'); check.type = 'submit'; check.disabled = !!saved;
          form.addEventListener('submit', function (e) { e.preventDefault(); submit(input.value); }); form.appendChild(input); form.appendChild(check); card.appendChild(form);
          if (!saved && g.Languages.mountAccentKeys) { var keys = node('div', undefined, 'accent-keys'); g.Languages.mountAccentKeys(keys, input, article.lang); card.appendChild(keys); }
        }
        if (saved) { var feedback = node('div', undefined, 'reading-practice-feedback'); feedback.setAttribute('role','status'); feedback.appendChild(node('strong', saved.result === 'correct' ? '正确' : saved.result === 'accent' ? '重音需要调整，本题尚未答对' : saved.result === 'case' ? '大小写需要调整，本题尚未答对' : '再留意原文词义与词形')); feedback.appendChild(node('p','你的答案：' + saved.input + ' · 原文答案：' + q.answer)); var original = node('p',sentence.text); original.lang = article.lang; feedback.appendChild(original); feedback.appendChild(node('p',q.explanation)); card.appendChild(feedback); }
        host.appendChild(card);
      });
      host.appendChild(node('p','练习仅保留本次打开页面的状态；离开再返回可继续，刷新后重新开始，不改变已掌握或复习计划。','reading-hint'));
      host.appendChild(node('h3','本篇词汇挑战'));
      host.appendChild(node('p','复用“激流勇进”：看中文，打出本篇词形。词汇仅来自上面的必备单词；部分词需要复数或重音，请先回看总结。','reading-hint'));
      var area = node('div', undefined, 'reading-word-game'); host.appendChild(btn('开始本篇词汇挑战', function () { play(area, article); })); host.appendChild(area);
    }
    render();
  }
  function play(host, article) {
    stop(); host.replaceChildren();
    var canvas = node('canvas'); canvas.setAttribute('aria-label','本篇词汇漂流游戏'); canvas.style.width='100%'; canvas.style.height='320px'; host.appendChild(canvas);
    var input = node('input'); input.setAttribute('aria-label','填写漂流词语'); input.setAttribute('autocomplete','off'); input.setAttribute('autocapitalize','none'); input.setAttribute('spellcheck','false'); host.appendChild(input);
    var feedback = node('p'); feedback.setAttribute('role','status'); host.appendChild(feedback);
    var keys = node('div', undefined, 'accent-keys'); host.appendChild(keys); if (g.Languages.mountAccentKeys) g.Languages.mountAccentKeys(keys, input, article.lang);
    host.appendChild(btn('结束挑战', function () { stop(); feedback.textContent='本轮已结束，可以重新开始。'; input.disabled=true; }));
    var game = g.TypingGame.create({lang:article.lang, grade:g.ReadingPractice.grade, pool:article.learningSummary.words.map(function (w) { return {answer:w.text,prompt:w.zh,sub:w.note || '本篇原文词形'}; }), baseSpeed:45, baseInterval:3000, maxConcurrent:3, onEvent:function (type,p) { if (type==='clear') { input.value=''; feedback.textContent='答对：'+p.item.answer; } if (type==='miss') { input.value=''; feedback.textContent='漏过：'+p.item.answer; } if (type==='wrong') feedback.textContent=p.accent?'留意重音，尚未答对。':'尚未匹配本篇词形。'; if (type==='gameover') { feedback.textContent='本轮结束 · 击落 '+p.cleared+' 个 · 得分 '+p.score; input.disabled=true; } }});
    game.resize(Math.max(300,host.clientWidth || 700),320);
    var renderer = g.TypingGame.Renderer.attach(game,canvas); playing={game:game,renderer:renderer}; game.start();
    input.addEventListener('input',function(){game.setInput(input.value);}); input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();game.submit();}}); input.focus();
  }
  document.addEventListener('dimenticato:screenchange',stop);
  g.ReadingPracticeApp={mount:mount,stop:stop};
})(window);
