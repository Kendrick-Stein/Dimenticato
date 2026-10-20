/** Curated outbound listening. No copied audio, transcripts, tracking or external iframe. */
(function (global) {
  'use strict';
  var entering = false, request = 0, cache = null;
  function el(tag, text, cls) { var n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; }
  function button(text, fn) { var n = el('button', text, 'btn btn-ghost'); n.type = 'button'; n.addEventListener('click', fn); return n; }
  function safeURL(value) { try { var u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; } catch (_) { return null; } }
  function sourceLink(text, url) { var n = el('a', text, 'btn btn-primary'); var safe = safeURL(url); if (safe) { n.href = safe; n.target = '_blank'; n.rel = 'noopener noreferrer'; } return n; }
  function href(l, id) { return global.DimRouter.href(l, id ? 'listeningLessonScreen' : 'listeningScreen') + (id ? '/' + id : ''); }
  function load() { if (!cache) cache = fetch('data/listening/catalog.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (d) { if (d.schema !== 1 || !Array.isArray(d.entries)) throw new Error('catalog'); return d; }).catch(function (e) { cache = null; throw e; }); return cache; }
  function level(a) { return a.level + (a.levelBasis === 'editorial' && /^[ABC][12]/.test(a.level) ? '（参考）' : ''); }
  function focus(host) { var h = host.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus({preventScroll:true}); } }
  function metadata(a) { return a.provider + ' · ' + level(a) + (a.duration ? ' · ' + a.duration : '') + ' · ' + (a.kind === 'news' ? '新闻节目' : a.kind === 'directory' ? '栏目入口' : '课程'); }
  function quiz(host, a) {
    if (!a.questions || !a.questions.length) { return; }
    var section = el('section', undefined, 'listening-quiz'); section.appendChild(el('h2', '听完再答'));
    section.appendChild(el('p', '听完后作答，提交查看解析。'));
    var form = el('form'), groups = [], submitted = false;
    a.questions.forEach(function (q, qi) {
      var field = el('fieldset'), legend = el('legend', (qi + 1) + '. ' + q.prompt); legend.lang = a.lang; field.appendChild(legend); var inputs = [];
      q.options.forEach(function (option, oi) { var label = el('label',undefined,'listening-option'), input = el('input'); input.type = 'radio'; input.name = a.id + '-q' + qi; input.value = String(oi); input.required = true; inputs.push(input); label.appendChild(input); var span = el('span',option); span.lang = a.lang; label.appendChild(span); field.appendChild(label); });
      form.appendChild(field); groups.push({q:q, field:field, inputs:inputs});
    });
    var feedback = el('div'); feedback.setAttribute('role','status'); feedback.setAttribute('aria-live','polite');
    var submit = el('button','提交答案','btn btn-primary'); submit.type = 'submit';
    form.addEventListener('submit',function (e) { e.preventDefault(); if (submitted) return; var picks = groups.map(function(g) { return g.inputs.findIndex(function (i) { return i.checked; }); }); if (picks.some(function (v) { return v < 0; })) { feedback.textContent = '请先回答每一道题。'; return; } submitted = true; var score = 0;
      groups.forEach(function(g,i) { var correct = picks[i] === g.q.answerIndex; if (correct) score++; g.inputs.forEach(function (n) { n.disabled = true; }); g.field.appendChild(el('p',(correct ? '答对了。' : '再听听这一处。') + ' 正确答案：' + g.q.options[g.q.answerIndex] + '。' + g.q.explanationZh,'listening-answer')); });
      submit.disabled = true; feedback.textContent = '本次答对 ' + score + ' / ' + groups.length + ' 题。';
    });
    form.appendChild(submit); form.appendChild(button('重新练习',function () { submitted = false; submit.disabled = false; groups.forEach(function(g) { g.inputs.forEach(function(n) { n.disabled = false; n.checked = false; }); var answer = g.field.querySelector('.listening-answer'); if (answer) answer.remove(); }); feedback.textContent = ''; groups[0].inputs[0].focus(); })); form.appendChild(feedback); section.appendChild(form); host.appendChild(section);
  }
  function detail(host,a,l) {
    host.replaceChildren(el('p','LISTENING ROOM','kicker'),el('h1',a.titleZh),el('p',a.title,'reading-deck'),el('p',metadata(a),'listening-meta'));
    var back = el('a','← 返回听力精选'); back.href = href(l); host.appendChild(back);
    host.appendChild(el('p',a.guideZh,'listening-guide')); host.appendChild(sourceLink('去 ' + a.provider + ' 原站听 ↗',a.url));
    host.appendChild(el('p',a.questions.length ? '在新标签页播放，听完回来练习。' : '在新标签页打开原站。','listening-note'));
    var steps = el('details', undefined, 'listening-help'); steps.appendChild(el('summary','怎么练习')); var ol=el('ol'); ['先听主旨：抓住话题、人物和场景。','再听细节：留意原因、顺序和具体信息。','如有字幕或文字，可对照复听没听清的地方。'].forEach(function(s){ol.appendChild(el('li',s));}); steps.appendChild(ol);host.appendChild(steps);
    quiz(host,a);
    if (a.vocabulary && a.vocabulary.length) { var summary=el('details',undefined,'listening-vocabulary'); summary.appendChild(el('summary','重点表达'));var dl=el('dl');a.vocabulary.forEach(function(v){var dt=el('dt',v.text);dt.lang=a.lang;dl.appendChild(dt);dl.appendChild(el('dd',v.zh));});summary.appendChild(dl);host.appendChild(summary); }
    var source = el('details', undefined, 'listening-source'); source.appendChild(el('summary','来源信息'));
    source.appendChild(el('p',a.provider + (a.sourcePublishedAt ? ' · 发布于 ' + a.sourcePublishedAt : ''),'listening-meta'));
    source.appendChild(el('p','收录于 ' + a.addedAt + ' · ' + (a.levelBasis === 'provider' ? '等级由来源提供。' : '难度仅供参考。'),'listening-note'));
    source.appendChild(el('p','音视频与字幕归原权利人所有，本站提供导听与学习练习。原站播放可能受地区或网络限制。','listening-note')); host.appendChild(source);focus(host);
  }
  function catalog(host,data,l) {
    host.replaceChildren(el('p','LISTENING ROOM','kicker'),el('h1','外文听力'),el('p','听真实的声音，把听懂的一点点连起来。','reading-deck'));
    var filter=el('label','等级 ', 'listening-filter'), select=el('select');[['','全部等级'],['A1','A1'],['A2','A2'],['B1','B1'],['B2','B2']].forEach(function(p){var o=el('option',p[1]);o.value=p[0];select.appendChild(o);});filter.appendChild(select);host.appendChild(filter);var list=el('div',undefined,'listening-grid');host.appendChild(list);
    function draw(){list.replaceChildren();var entries=data.entries.filter(function(a){return a.lang===global.Languages.code(l)&&(!select.value||a.level.indexOf(select.value)>=0);});if(!entries.length)list.appendChild(el('p','这个等级暂时没有精选材料，请换个等级。','empty'));entries.forEach(function(a){var card=el('article',undefined,'listening-card');card.appendChild(el('p',metadata(a),'listening-meta'));var h=el('h2'),link=el('a',a.titleZh);link.href=href(l,a.id);h.appendChild(link);card.appendChild(h);var title=el('p',a.title);title.lang=a.lang;card.appendChild(title);card.appendChild(el('p',a.guideZh));card.appendChild(el('p',(a.questions.length ? a.questions.length+'道练习' : '自由听'),'listening-note'));list.appendChild(card);});}
    select.addEventListener('change',draw);draw();focus(host);
  }
  function open(l,id,alreadyShown){var mine=++request,screen=id?'listeningLessonScreen':'listeningScreen';if(!alreadyShown){entering=true;global.showScreen(screen);entering=false;}var host=document.getElementById(id?'listeningLessonView':'listeningView');host.replaceChildren(el('p','正在加载听力精选…'));function current(){return mine===request&&global.Shell.current()===screen&&global.Languages.code(global.getActiveLanguage())===global.Languages.code(l);}return load().then(function(data){if(!current())return;if(id){var a=data.entries.find(function(a){return a.id===id&&a.lang===global.Languages.code(l);});if(!a){host.replaceChildren(el('h1','未找到这条听力'));var back=el('a','返回听力精选');back.href=href(l);host.appendChild(back);return;}detail(host,a,l);}else catalog(host,data,l);}).catch(function(){if(current()){host.replaceChildren(el('p','听力精选暂时加载失败，请检查网络后重试。'));host.appendChild(button('重试',function(){cache=null;open(l,id);}));}});}
  global.ListeningApp={open:open,enter:function(l){if(!entering)open(l,null,true);},safeURL:safeURL};
})(window);
