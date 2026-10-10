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
  function renderArticle(host, a, l) {
    active = a; host.replaceChildren();
    var back = el('a', '← 返回阅读目录', 'back-link'); back.href = global.DimRouter.href(l, 'readingScreen'); host.appendChild(back);
    host.appendChild(el('p', a.level + ' · 编辑估计，非认证等级 · ' + a.date, 'kicker'));
    var h = el('h1', a.title); h.lang = a.lang; host.appendChild(h); host.appendChild(el('p', a.titleZh, 'reading-deck'));
    host.appendChild(el('p', a.summaryZh));
    var controls = el('div', undefined, 'reading-controls'), shown = true;
    var toggle = button('隐藏全部中文', function () { shown = !shown; host.querySelectorAll('.reading-translation').forEach(function (p) { p.hidden = !shown; }); host.querySelectorAll('[data-translation-toggle]').forEach(function (b) { b.setAttribute('aria-expanded', String(shown)); }); toggle.textContent = shown ? '隐藏全部中文' : '显示全部中文'; }); controls.appendChild(toggle);
    var completed = !!progress(l)[a.id];
    var done = button(completed ? '已读完 · 撤销' : '标记读完', function () { if (save(l, a.id, !completed) !== false) { completed = !completed; done.textContent = completed ? '已读完 · 撤销' : '标记读完'; } else global.App.toast('保存失败，请检查浏览器存储空间'); }); controls.appendChild(done); host.appendChild(controls);
    host.appendChild(el('p', '点下划线词语查看本句释义；也可选中正文单词。朗读由浏览器/设备语音提供，可能缺少语音或出现误读。', 'reading-hint'));
    var body = el('div', undefined, 'reading-body');
    a.sentences.forEach(function (s, i) {
      var row = el('section', undefined, 'reading-sentence'); row.dataset.sentence = s.id;
      var foreign = el('p', undefined, 'reading-foreign'); foreign.lang = a.lang; tokens(foreign, s, a); row.appendChild(foreign);
      var zh = el('p', s.zh, 'reading-translation'); zh.id = 'reading-translation-' + i; row.appendChild(zh);
      var c = el('div', undefined, 'reading-sentence-controls'); c.appendChild(button('听第 ' + (i + 1) + ' 句', function () { global.App.speak(s.text, a.lang); }));
      var t = button('中文对照', function () { zh.hidden = !zh.hidden; t.setAttribute('aria-expanded', String(!zh.hidden)); }); t.dataset.translationToggle = '1'; t.setAttribute('aria-expanded','true'); t.setAttribute('aria-controls',zh.id); c.appendChild(t); row.appendChild(c); body.appendChild(row);
    });
    function selected() { var selection = global.getSelection && global.getSelection(); if (!selection || selection.isCollapsed) return; var node = selection.anchorNode; node = node && (node.nodeType === 1 ? node : node.parentElement); var row = node && node.closest('.reading-sentence'); var end = selection.focusNode; end = end && (end.nodeType === 1 ? end : end.parentElement); if (!row || !body.contains(row) || !end || !row.contains(end) || !node.closest('.reading-foreign') || !end.closest('.reading-foreign')) return; var text = selection.toString().trim(); if (text && text.length < 100) showLookup(a, row.dataset.sentence, text); }
    body.addEventListener('mouseup', selected); body.addEventListener('keyup', selected); body.addEventListener('touchend', function () { setTimeout(selected, 0); }); host.appendChild(body);
    var box = el('aside', undefined, 'reading-lookup'); box.id = 'readingLookup'; box.hidden = true; box.setAttribute('aria-live', 'polite'); host.appendChild(box);
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
      active = null; host.replaceChildren(el('p','READING JOURNAL','kicker'), el('h1','外文精品阅读'), el('p','短篇新闻与知识阅读，逐句中文对照。只展示已核验内容；空缺日期不补造新闻。','reading-deck'));
      var label = el('label','阅读等级（编辑估计） '), select = el('select'); [['','全部等级']].concat(LEVELS.map(function (v) { return [v,v]; })).forEach(function (p) { var o = el('option',p[1]); o.value = p[0]; select.appendChild(o); }); select.value = level; select.addEventListener('change', function () { level = select.value; open(l, null, true, true); }); label.appendChild(select); host.appendChild(label);
      var entries = index.articles.filter(function (a) { return a.lang === code(l) && (!level || a.level === level); }).sort(function (a,b) { return b.date.localeCompare(a.date) || a.id.localeCompare(b.id); });
      if (!entries.length) host.appendChild(el('p','这个等级暂没有已发布阅读。可以切换等级，稍后再来。','empty'));
      var list = el('div',undefined,'reading-list'), p = progress(l);
      entries.forEach(function (a) { var item = el('article',undefined,'reading-card'); item.appendChild(el('p',a.date + ' · ' + a.level + (p[a.id] ? ' · 已读完' : ''),'kicker')); var title = el('a',a.title); title.lang = a.lang; title.href = global.DimRouter.href(l,'readingArticleScreen') + '/' + a.id; item.appendChild(title); item.appendChild(el('p',a.titleZh)); item.appendChild(el('p',a.summaryZh)); list.appendChild(item); }); host.appendChild(list); if (restoreFilter && select.focus) select.focus({preventScroll:true}); else focusHeading(host);
    }).catch(function () { if (current()) { status(host,'阅读内容暂时加载失败，请检查网络后重试。'); host.appendChild(button('重试',function () { indexCache = null; open(l,id); })); } });
  }
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { var box = document.getElementById('readingLookup'); if (box) box.hidden = true; } });
  document.addEventListener('dimenticato:screenchange', function (event) { if (event.detail && event.detail.screenId !== 'readingArticleScreen') { var box = document.getElementById('readingLookup'); if (box) box.hidden = true; } });
  global.ReadingApp = { enter: function (l) { if (!entering) open(l, null, true); }, open: open, lookup: lookup, safeURL: safeURL, save: save, progress: progress };
})(window);
