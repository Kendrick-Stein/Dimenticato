#!/usr/bin/env node
'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const {createWindow}=require('./dom-shim'); const w=createWindow(); w.URL=URL; w.Date=Date;
const c=vm.createContext(w),root=path.resolve(__dirname,'..');
['lib/languages.js','lib/storage.js','lib/reading-catalog.js','reading-app.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c));
w.Vocab={find:(_l,word)=>word==='book'?{word:'book',zh:'书'}:null};
let passed=0; function test(fn){fn();passed++;}
const a={lang:'en',sentences:[{id:'s1',text:'She reads a book.',zh:'她读一本书。',glosses:[{surface:'reads',lemma:'read',zh:'阅读'}]}]};
test(()=>assert.equal(w.ReadingApp.lookup(a,'s1','reads').lemma,'read'));
test(()=>assert.equal(w.ReadingApp.lookup(a,'s1','book').kind,'词库释义，未按本句消歧'));
test(()=>assert.equal(w.ReadingApp.lookup(a,'s1','invented').kind,'未收录'));
test(()=>assert(w.ReadingApp.lookup(a,'s1','a book').zh.includes('暂不提供')));
['javascript:alert(1)','http://bad.test','https://user:pass@example.org'].forEach(u=>test(()=>assert.equal(w.ReadingApp.safeURL(u),null)));
test(()=>assert.equal(w.ReadingApp.safeURL('https://example.org'),'https://example.org/'));
test(()=>{w.ReadingApp.save('it','article1',true);assert(w.ReadingApp.progress('it').article1);assert(!w.ReadingApp.progress('fr').article1);});
test(()=>{const data=w.DimStorage.exportAll();assert(JSON.stringify(data).includes('reading_progress'));});
test(()=>{w.DimStorage.reset({scope:'italian'});assert(!w.ReadingApp.progress('it').article1);});
const {validate}=require('../scripts/validate_reading');
test(()=>assert(validate({schema:1,sentences:[]}).length>0));
test(()=>assert(!fs.readFileSync(path.join(root,'reading-app.js'),'utf8').includes('innerHTML')));


// Actual module DOM flow, using the repository's lightweight DOM shim.
(async function () {
  const make=w.document.createElement;
  w.document.createElement=function(tag){const n=make(tag);n.replaceChildren=function(...nodes){n.textContent='';nodes.forEach(x=>n.appendChild(x));};return n;};
  w.document.body.innerHTML='<div id="readingView"></div><div id="readingArticleView"></div>';
  ['readingView','readingArticleView'].forEach(id=>{const n=w.document.getElementById(id);n.replaceChildren=function(...nodes){n.textContent='';nodes.forEach(x=>n.appendChild(x));};});
  let screen='',language='italian';w.showScreen=s=>{screen=s;};w.Shell={current:()=>screen};w.getActiveLanguage=()=>language;
  w.DimRouter={href:(l,s)=>'#/it/reading'+(s==='readingArticleScreen'?'/article':'')};const spoken=[]; w.App={speak:(text,lang)=>spoken.push({text,lang}),toast:()=>{}};
  const full=Object.assign({},a,{id:'test-article',schema:1,lang:'it',title:'<img src=x onerror=alert(1)>',titleZh:'中文标题',date:'2026-10-10',level:'A2',summaryZh:'摘要',category:'technology',topics:['卫星通信','生活应用'],storyId:'test-story',source:{name:'Example',title:'Source',url:'https://example.org',publishedAt:'2026-09-26',lang:'it'},license:{name:'CC BY',url:'https://example.org/license'},adaptation:'改写',attribution:'署名',levelReason:'编辑估计'});
  full.sentences=full.sentences.concat([{id:'s2',text:'Books open new doors.',zh:'书籍打开新的大门。',glosses:[]}]);
  full.contentType='native-adaptation';
  full.speaking={questions:[{text:'How do books help us?',zh:'书籍如何帮助我们？'}],expressions:[{text:'open new doors',zh:'带来新机会',sentenceId:'s2',note:'可用来谈阅读的影响。'}]};
  full.learningSummary={words:[{text:'reads',lemma:'read',zh:'阅读',sentenceId:'s1',note:'第三人称单数'}],phrases:[{text:'open new doors',zh:'带来新的机会',sentenceId:'s2'}],sentences:[{sentenceId:'s2',note:'用具体的动作表达抽象的机会。<img src=x onerror=alert(1)>'}]};
  const legacy=JSON.parse(JSON.stringify(full)); legacy.id='a-legacy'; legacy.title='Legacy article'; delete legacy.speaking; delete legacy.learningSummary; delete legacy.contentType; legacy.source.lang='de';
  full.sourcePublishedAt=full.source.publishedAt; legacy.sourcePublishedAt=legacy.source.publishedAt;
  const articles=[legacy,full].concat(['de','en','fr'].map(lang=>Object.assign({},full,{id:'test-'+lang,lang,source:Object.assign({},full.source,{lang})})));
  function normalFetch(url){return Promise.resolve({ok:true,json:async()=>url.endsWith('index.json')?{schema:1,articles}:articles.find(article=>url.endsWith(article.id+'.json'))});}
  w.fetch=normalFetch;
  test(()=>assert.deepEqual(validate(full),[]));
  test(()=>assert.deepEqual(validate(legacy),[],'legacy content remains valid without a summary'));
  function invalidSummary(change,expected){const copy=JSON.parse(JSON.stringify(full));change(copy);test(()=>assert(validate(copy).some(error=>error.includes(expected)),validate(copy).join('; ')));}
  invalidSummary(x=>delete x.learningSummary,'requires learningSummary');
  invalidSummary(x=>x.learningSummary=null,'learningSummary must be an object');
  invalidSummary(x=>x.learningSummary=[],'learningSummary must be an object');
  ['words','phrases','sentences'].forEach(group=>invalidSummary(x=>x.learningSummary[group]=[],'requires entries'));
  invalidSummary(x=>x.learningSummary.words=[null],'summary entry must be an object');
  invalidSummary(x=>x.learningSummary.words[0].sentenceId='missing','existing sentenceId');
  invalidSummary(x=>x.learningSummary.words[0].text='fabricated','occur verbatim');
  invalidSummary(x=>x.learningSummary.phrases[0].zh=' ','text and zh required');
  invalidSummary(x=>x.learningSummary.sentences[0].sentenceId='missing','existing sentenceId');
  invalidSummary(x=>x.learningSummary.sentences[0].note='','learning note');
  invalidSummary(x=>x.learningSummary.sentences.push(x.learningSummary.sentences[0]),'duplicate summary entry');
  invalidSummary(x=>x.source.lang='de','source language must match');
  invalidSummary(x=>x.contentType='unknown','supported contentType');
  invalidSummary(x=>x.category='unknown','category');
  invalidSummary(x=>x.topics=[],'topics');
  invalidSummary(x=>x.topics=['one','one'],'topics');
  invalidSummary(x=>x.date='2026-02-30','edition date');
  invalidSummary(x=>x.source.publishedAt='2026-13-01','original publication date');
  invalidSummary(x=>x.source.publishedAt='2026-10-11','cannot follow');
  invalidSummary(x=>x.speaking=null,'speaking must');
  invalidSummary(x=>x.speaking.questions=[],'requires 1–3');
  invalidSummary(x=>x.speaking.questions=[null],'paired text');
  invalidSummary(x=>x.speaking.expressions[0].sentenceId='missing','reference the expression');
  invalidSummary(x=>x.speaking.expressions[0].text='invented','reference the expression');
  let showCount=0; w.showScreen=s=>{screen=s;showCount++;};screen='readingScreen';w.ReadingApp.enter('italian');test(()=>assert.equal(showCount,0,'render-only enter must not invalidate router navigation'));
  await w.ReadingApp.open('italian');const index=w.document.getElementById('readingView');test(()=>assert(index.textContent.includes('中文标题')));
  test(()=>assert(index.querySelectorAll('.reading-card')[0].textContent.includes(full.title),'native editions sort before same-day legacy editions'));
  test(()=>assert(index.querySelectorAll('.reading-card')[1].textContent.includes('跨语教学改写')));
  test(()=>assert(index.querySelectorAll('.reading-card')[0].textContent.includes('原文 2026-09-26 · 整理 2026-10-10')));
  test(()=>assert(index.querySelectorAll('.reading-card')[0].textContent.includes('原语机构来源 · 同语言改写')));
  await w.ReadingApp.open('italian','test-article');const host=w.document.getElementById('readingArticleView');
  test(()=>assert(host.textContent.includes(full.title)));test(()=>assert.equal(host.querySelectorAll('img').length,0));
  test(()=>assert.equal(host.querySelector('.reading-category').textContent,'科技'));
  test(()=>assert(host.querySelector('.reading-speaking').textContent.includes('书籍如何帮助我们？')));
  test(()=>assert.equal(host.querySelector('.reading-speaking-questions').querySelector('p').lang,'it'));
  const toggle=host.querySelectorAll('button').find(b=>b.textContent==='正文译文');
  test(()=>assert.equal(toggle.getAttribute('aria-pressed'),'true'));
  test(()=>assert.equal(toggle.getAttribute('aria-controls'),'readingBody'));
  test(()=>assert.equal(host.querySelectorAll('[data-translation-toggle]').length,0,'no per-sentence translation buttons'));
  test(()=>assert.equal(host.querySelectorAll('.reading-sentence-controls').length,0,'no repeated sentence toolbars'));
  toggle.click();test(()=>assert(host.querySelectorAll('.reading-translation').every(p=>p.hidden)));
  test(()=>assert.equal(toggle.getAttribute('aria-pressed'),'false'));
  test(()=>assert.equal(toggle.textContent,'正文译文','toggle label stays stable for assistive technology'));
  toggle.click();test(()=>assert(host.querySelectorAll('.reading-translation').every(p=>!p.hidden)));
  const listen=host.querySelectorAll('button').find(b=>b.textContent==='逐句朗读');
  test(()=>assert.equal(listen.getAttribute('aria-pressed'),'false'));
  test(()=>assert(host.querySelectorAll('.reading-sentence-audio').every(b=>b.hidden),'audio controls hidden by default'));
  listen.click();test(()=>assert(host.querySelectorAll('.reading-sentence-audio').every(b=>!b.hidden)));
  test(()=>assert.equal(listen.getAttribute('aria-pressed'),'true'));
  const audio=host.querySelectorAll('.reading-sentence-audio');
  test(()=>assert.equal(audio[1].getAttribute('aria-label'),'听读第 2 句'));
  audio[1].click();test(()=>assert.deepEqual(spoken.pop(),{text:full.sentences[1].text,lang:'it'}));
  listen.click();test(()=>assert(audio.every(b=>b.hidden)));
  test(()=>assert.equal(listen.getAttribute('aria-pressed'),'false'));
  const summary=host.querySelector('.reading-summary');
  ['必备单词','常用词组','好句积累','原形：read','带来新的机会',full.sentences[1].zh,full.learningSummary.sentences[0].note].forEach(text=>test(()=>assert(summary.textContent.includes(text))));
  test(()=>assert.equal(summary.querySelector('blockquote').textContent,full.sentences[1].text));
  test(()=>assert.equal(summary.querySelector('blockquote').lang,'it'));
  test(()=>assert.equal(host.querySelectorAll('img').length,0,'summary notes render text only'));
  test(()=>assert(host.children.indexOf(summary)>host.children.indexOf(host.querySelector('.reading-body'))));
  test(()=>assert(host.children.indexOf(summary)<host.children.indexOf(host.querySelector('.reading-source'))));
  toggle.click();test(()=>assert(summary.textContent.includes(full.sentences[1].zh),'body toggle leaves review definitions available')); toggle.click();
  host.querySelector('.reading-word').click();test(()=>assert(host.textContent.includes('本句释义')));
  const done=host.querySelectorAll('button').find(b=>b.textContent==='标记读完');done.click();test(()=>assert(w.ReadingApp.progress('it')['test-article']));done.click();test(()=>assert(!w.ReadingApp.progress('it')['test-article']));
  await w.ReadingApp.open('italian','a-legacy');
  test(()=>assert(host.querySelector('.reading-summary').textContent.includes('尚未补充学习总结')));
  test(()=>assert.equal(host.querySelector('.reading-speaking'),null,'legacy articles do not invent generic speaking material'));
  test(()=>assert.equal(host.querySelectorAll('.reading-summary-terms').length,0));
  test(()=>assert(host.querySelector('.reading-content-label').textContent.includes('跨语教学改写')));
  for(const lang of ['de','en','fr']) {
    language=lang;await w.ReadingApp.open(lang,'test-'+lang);
    test(()=>assert.equal(host.querySelector('.reading-summary-quote').querySelector('blockquote').lang,lang));
    host.querySelectorAll('button').find(b=>b.textContent==='逐句朗读').click();host.querySelector('.reading-sentence-audio').click();
    test(()=>assert.equal(spoken.pop().lang,lang));
  }
  language='italian';await w.ReadingApp.open('italian','test-article');
  test(()=>assert(host.querySelectorAll('.reading-sentence-audio').every(b=>b.hidden),'audio mode resets on navigation'));
  test(()=>assert(host.querySelectorAll('.reading-translation').every(p=>!p.hidden),'translations reset on navigation'));
  await w.ReadingApp.open('italian','../../bad');test(()=>assert(host.textContent.includes('没有找到')));
  let finish;w.fetch=()=>new Promise(r=>{finish=r;});const delayed=w.ReadingApp.open('italian','test-article');await Promise.resolve();screen='homeScreen';finish({ok:true,json:async()=>full});await delayed;test(()=>assert(!host.textContent.includes('中文标题')));
  console.log('Reading DOM OK: '+passed+' passed, 0 failed');
})().catch(e=>{console.error(e);process.exitCode=1;});

// Route shape is shared across all four languages; original router is exercised.
{
 const r=createWindow();r.CustomEvent=function(t,o){this.type=t;this.detail=o&&o.detail;};r.scrollTo=()=>{};
 const cx=vm.createContext(r);['lib/utils.js','lib/languages.js','lib/shell.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),cx));
 for(const lang of ['it','de','en','fr']) {
  test(()=>assert.equal(r.DimRouter.parse('#/'+lang+'/reading').screenId,'readingScreen'));
  test(()=>assert.equal(r.DimRouter.parse('#/'+lang+'/reading/article/my-id').param,'my-id'));
 }
}
