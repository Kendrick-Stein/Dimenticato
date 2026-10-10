/** Curated reading. No remote translation service; untrusted content is text only. */
(function (global) {
  'use strict';
  var entering = false, active = null, request = 0, level = '', indexCache = null;
  var LEVELS = ['A1','A2','B1','B2','C1','C2'];
  function el(tag, text, cls) { var n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; }
  function button(text, fn) { var n = el('button', text, 'btn btn-ghost'); n.type = 'button'; n.addEventListener('click', fn); return n; }
  function code(l) { return global.Languages.code(l); }
  function safeURL(value) { try { var u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; } catch (_) { return null; } }
  function norm(s) { return String(s || '').normalize('NFC').trim().replace(/^[.,!?;:“”"()\[\]]+|[.,!?;:“”"()\[\]]+$/g, '').toLocaleLowerCase(); }
  function lookup(article, sentenceId, text) {
    var s = article.sentences.find(function (s) { return s.id === sentenceId; });
    var word = norm(text), hit = s && (s.glosses || []).find(function (g) { return norm(g.surface) === word; });
    if (hit) return { lemma: hit.lemma, zh: hit.zh, note: hit.note || '', kind: '本句释义' };
    if (/\s/.test(word)) return { zh: '暂不提供任意短语翻译，请查看本句中文对照。', kind: '未收录' };
    var v = global.Vocab && (global.Vocab.find(article.lang, String(text).trim()) || global.Vocab.find(article.lang, word));
    return v ? { lemma: v.word, zh: v.zh, kind: '词库释义，未按本句消歧' } : { zh: '此词形暂未收录；可查看句子译文。', kind: '未收录' };
  }
  function progress(l) { try { return global.DimStorage.safeParse(localStorage.getItem(global.DimStorage.key(l, 'reading_progress')), {}); } catch (_) { return {}; } }
  function save(l, id, done) { var p = progress(l); if (done) p[id] = { completedAt: new Date().toISOString() }; else delete p[id]; return global.DimStorage.safeSetItem(global.DimStorage.key(l, 'reading_progress'), JSON.stringify(p)); }
  function fetchJSON(path) { return fetch(path).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }
  function loadIndex() { return indexCache ? Promise.resolve(indexCache) : fetchJSON('data/reading/index.json').then(function (x) { if (x.schema !== 1 || !Array.isArray(x.articles)) throw new Error('index'); indexCache = x; return x; }); }
  function link(text, url) { var n = el('a', text); var safe = safeURL(url); if (safe) { n.href = safe; n.target = '_blank'; n.rel = 'noopener noreferrer'; } return n; }
  function focusHeading(host) { var a = document.activeElement; if (!a || a === document.body || (a.closest && a.closest('.screen') && !host.contains(a))) { var h = host.querySelector('h1'); if (h && h.focus) { h.setAttribute('tabindex', '-1'); h.focus({preventScroll:true}); } } }
  function status(host, text) { host.replaceChildren(el('p', text, 'empty')); }
  function showLookup(article, sentence, text) {
    var box = document.getElementById('readingLookup'), result = lookup(article, sentence, text);
    box.replaceChildren(el('strong', text), el('p', result.kind + (result.lemma ? ' · 原形 ' + result.lemma : '')), el('p', result.zh));
    if (result.note) box.appendChild(el('p', result.note));
    box.appendChild(button('听读', function () { global.App.speak(text, article.lang); }));
    box.appendChild(button('关闭释义', function () { box.hidden = true; })); box.hidden = false;
  }
  function tokens(host, sentence, article) {
    var spans = (sentence.glosses || []).map(function (g) {
      var start = Number.isInteger(g.start) && sentence.text.slice(g.start, g.end) === g.surface ? g.start : sentence.text.indexOf(g.surface);
      return { start: start, end: start + g.surface.length, gloss: g };
    }).filter(function (s) { return s.start >= 0; }).sort(function (a,b) { return a.start - b.start || b.end - a.end; });
    var cursor = 0;
    spans.forEach(function (span) {
      if (span.start < cursor) return;
      host.appendChild(document.createTextNode(sentence.text.slice(cursor, span.start)));
      var b = button(span.gloss.surface, function () { showLookup(article, sentence.id, span.gloss.surface); });
      b.className = 'reading-word'; b.setAttribute('aria-label', span.gloss.surface + '，查看本句释义'); host.appendChild(b); cursor = span.end;
    });
    host.appendChild(document.createTextNode(sentence.text.slice(cursor)));
  }
  function contentLabel(a) {
    if (a.contentType === 'native-adaptation') return '原语机构来源 · 同语言改写';
    var sourceLang = a.sourceLang || (a.source && a.source.lang);
    return sourceLang && sourceLang !== a.lang ? '跨语教学改写' : '教学改写';
  }
  function renderLearningSummary(article) {
    var section = el('section', undefined, 'reading-summary');
    var heading = el('h2', '读后学习总结'); heading.id = 'readingSummaryTitle';
    section.setAttribute('aria-labelledby', heading.id); section.appendChild(heading);
    var summary = article.learningSummary;
    if (!summary) {
      section.appendChild(el('p', '本篇尚未补充学习总结。可先使用正文中的语境词注。', 'reading-hint'));
      return section;
    }
    section.appendChild(el('p', '回看本篇的重点表达，把读过的内容留下来。', 'reading-hint'));
    var grid = el('div', undefined, 'reading-summary-grid');
    [['words', '必备单词'], ['phrases', '常用词组']].forEach(function (group) {
      var part = el('section', undefined, 'reading-summary-group'); part.appendChild(el('h3', group[1]));
      var list = el('dl', undefined, 'reading-summary-terms');
      (summary[group[0]] || []).forEach(function (item) {
        var term = el('dt', item.text); term.lang = article.lang; list.appendChild(term);
        var meaning = el('dd'); meaning.appendChild(el('p', item.zh));
        if (item.lemma && item.lemma !== item.text) { var lemma = el('span', item.lemma); lemma.lang = article.lang; var label = el('p', '原形：', 'reading-summary-note'); label.appendChild(lemma); meaning.appendChild(label); }
        if (item.note) meaning.appendChild(el('p', item.note, 'reading-summary-note'));
        list.appendChild(meaning);
      });
      part.appendChild(list); grid.appendChild(part);
    });
    section.appendChild(grid);
    var quotes = el('section', undefined, 'reading-summary-sentences'); quotes.appendChild(el('h3', '好句积累'));
    (summary.sentences || []).forEach(function (item) {
      var index = article.sentences.findIndex(function (s) { return s.id === item.sentenceId; });
      if (index < 0) return;
      var sentence = article.sentences[index], card = el('div', undefined, 'reading-summary-quote');
      var quote = el('blockquote', sentence.text); quote.lang = article.lang; card.appendChild(quote);
      card.appendChild(el('p', sentence.zh, 'reading-summary-meaning'));
      card.appendChild(el('p', '第 ' + (index + 1) + ' 句 · ' + item.note, 'reading-summary-note')); quotes.appendChild(card);
    });
    section.appendChild(quotes); return section;
  }
  function renderArticle(host, a, l) {
    active = a; host.replaceChildren();
    var back = el('a', '← 返回阅读目录', 'back-link'); back.href = global.DimRouter.href(l, 'readingScreen'); host.appendChild(back);
    host.appendChild(el('p', a.level + ' · 编辑估计，非认证等级 · 整理 ' + a.date, 'kicker'));
    host.appendChild(el('p', contentLabel(a), 'reading-content-label'));
    var h = el('h1', a.title); h.lang = a.lang; host.appendChild(h); host.appendChild(el('p', a.titleZh, 'reading-deck'));
    host.appendChild(el('p', a.summaryZh));
    var controls = el('div', undefined, 'reading-controls'), shown = true, listening = false;
    var toggle = button('正文译文', function () {
      shown = !shown;
      body.querySelectorAll('.reading-translation').forEach(function (p) { p.hidden = !shown; });
      toggle.setAttribute('aria-pressed', String(shown));
    });
    toggle.setAttribute('aria-pressed', 'true'); toggle.setAttribute('aria-controls', 'readingBody'); controls.appendChild(toggle);
    var listen = button('逐句朗读', function () {
      listening = !listening;
      body.querySelectorAll('.reading-sentence-audio').forEach(function (b) { b.hidden = !listening; });
      listen.setAttribute('aria-pressed', String(listening));
    });
    listen.setAttribute('aria-pressed', 'false'); listen.setAttribute('aria-controls', 'readingBody'); controls.appendChild(listen);
    var completed = !!progress(l)[a.id];
    var done = button(completed ? '已读完 · 撤销' : '标记读完', function () { if (save(l, a.id, !completed) !== false) { completed = !completed; done.textContent = completed ? '已读完 · 撤销' : '标记读完'; } else global.App.toast('保存失败，请检查浏览器存储空间'); }); controls.appendChild(done); host.appendChild(controls);
    host.appendChild(el('p', '点下划线词语或选中正文单词查看释义。打开「逐句朗读」可听单句；语音由浏览器或设备提供，可能缺少语音或出现误读。', 'reading-hint'));
    var body = el('div', undefined, 'reading-body'); body.id = 'readingBody';
    a.sentences.forEach(function (s, i) {
      var row = el('section', undefined, 'reading-sentence'); row.dataset.sentence = s.id;
      var foreign = el('p', undefined, 'reading-foreign'); foreign.lang = a.lang; tokens(foreign, s, a); row.appendChild(foreign);
      var zh = el('p', s.zh, 'reading-translation'); zh.id = 'reading-translation-' + i; row.appendChild(zh);
      var audio = button('听读', function () { global.App.speak(s.text, a.lang); });
      audio.className = 'reading-sentence-audio'; audio.hidden = true;
      audio.setAttribute('aria-label', '听读第 ' + (i + 1) + ' 句'); row.appendChild(audio); body.appendChild(row);
    });
    function selected() { var selection = global.getSelection && global.getSelection(); if (!selection || selection.isCollapsed) return; var node = selection.anchorNode; node = node && (node.nodeType === 1 ? node : node.parentElement); var row = node && node.closest('.reading-sentence'); var end = selection.focusNode; end = end && (end.nodeType === 1 ? end : end.parentElement); if (!row || !body.contains(row) || !end || !row.contains(end) || !node.closest('.reading-foreign') || !end.closest('.reading-foreign')) return; var text = selection.toString().trim(); if (text && text.length < 100) showLookup(a, row.dataset.sentence, text); }
    body.addEventListener('mouseup', selected); body.addEventListener('keyup', selected); body.addEventListener('touchend', function () { setTimeout(selected, 0); }); host.appendChild(body);
    var box = el('aside', undefined, 'reading-lookup'); box.id = 'readingLookup'; box.hidden = true; box.setAttribute('aria-live', 'polite'); host.appendChild(box);
    host.appendChild(renderLearningSummary(a));
    var source = el('section', undefined, 'reading-source'); source.appendChild(el('h2','来源与改编说明')); source.appendChild(link(a.source.name + '：' + a.source.title, a.source.url));
    source.appendChild(el('p','原文发布日期：' + a.source.publishedAt + ' · 本站整理：' + a.date)); source.appendChild(el('p',a.attribution)); source.appendChild(link(a.license.name, a.license.url)); source.appendChild(el('p',a.adaptation)); source.appendChild(el('p','等级依据：' + a.levelReason)); host.appendChild(source); focusHeading(host);
  }
  function open(l, id, alreadyShown, restoreFilter) {
    var mine = ++request, screen = id ? 'readingArticleScreen' : 'readingScreen';
    if (!alreadyShown) { entering = true; global.showScreen(screen); entering = false; } var host = document.getElementById(id ? 'readingArticleView' : 'readingView'); status(host, '正在加载阅读内容…');
    function current() { return mine === request && global.Shell.current() === screen && code(global.getActiveLanguage()) === code(l); }
    return loadIndex().then(function (index) {
      if (!current()) return;
      if (id) {
        var entry = index.articles.find(function (a) { return a.id === id && a.lang === code(l); });
        if (!entry || !/^[a-z0-9-]+$/.test(id)) { status(host, '没有找到这篇文章，请返回阅读目录。'); var a = el('a','返回阅读目录'); a.href = global.DimRouter.href(l,'readingScreen'); host.appendChild(a); return; }
        return fetchJSON('data/reading/articles/' + id + '.json').then(function (a) { if (current()) { if (a.id !== id || a.lang !== code(l)) throw new Error('article mismatch'); renderArticle(host, a, l); } });
      }
      active = null; host.replaceChildren(el('p','READING JOURNAL','kicker'), el('h1','外文精品阅读'), el('p','从各语言机构独立选材，同语言分级改写，配中文译文和学习总结。保留原文日期；历史跨语改写单独标注，没有合规内容时不补造。','reading-deck'));
      var label = el('label','阅读等级（编辑估计） '), select = el('select'); [['','全部等级']].concat(LEVELS.map(function (v) { return [v,v]; })).forEach(function (p) { var o = el('option',p[1]); o.value = p[0]; select.appendChild(o); }); select.value = level; select.addEventListener('change', function () { level = select.value; open(l, null, true, true); }); label.appendChild(select); host.appendChild(label);
      var entries = index.articles.filter(function (a) { return a.lang === code(l) && (!level || a.level === level); }).sort(function (a,b) { return b.date.localeCompare(a.date) || Number(b.contentType === 'native-adaptation') - Number(a.contentType === 'native-adaptation') || a.id.localeCompare(b.id); });
      if (!entries.length) host.appendChild(el('p','这个等级暂没有已发布阅读。可以切换等级，稍后再来。','empty'));
      var list = el('div',undefined,'reading-list'), p = progress(l);
      entries.forEach(function (a) { var item = el('article',undefined,'reading-card'); item.appendChild(el('p',(a.sourcePublishedAt ? '原文 ' + a.sourcePublishedAt + ' · ' : '') + '整理 ' + a.date + ' · ' + a.level + (p[a.id] ? ' · 已读完' : ''),'kicker')); var title = el('a',a.title); title.lang = a.lang; title.href = global.DimRouter.href(l,'readingArticleScreen') + '/' + a.id; item.appendChild(title); item.appendChild(el('p',contentLabel(a),'reading-content-label')); item.appendChild(el('p',a.titleZh)); item.appendChild(el('p',a.summaryZh)); list.appendChild(item); }); host.appendChild(list); if (restoreFilter && select.focus) select.focus({preventScroll:true}); else focusHeading(host);
    }).catch(function () { if (current()) { status(host,'阅读内容暂时加载失败，请检查网络后重试。'); host.appendChild(button('重试',function () { indexCache = null; open(l,id); })); } });
  }
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { var box = document.getElementById('readingLookup'); if (box) box.hidden = true; } });
  document.addEventListener('dimenticato:screenchange', function (event) { if (event.detail && event.detail.screenId !== 'readingArticleScreen') { var box = document.getElementById('readingLookup'); if (box) box.hidden = true; } });
  global.ReadingApp = { enter: function (l) { if (!entering) open(l, null, true); }, open: open, lookup: lookup, safeURL: safeURL, save: save, progress: progress };
})(window);
