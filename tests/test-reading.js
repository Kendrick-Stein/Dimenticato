#!/usr/bin/env node
'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const {createWindow}=require('./dom-shim'); const w=createWindow(); w.URL=URL; w.Date=Date;
const c=vm.createContext(w),root=path.resolve(__dirname,'..');
['lib/languages.js','lib/storage.js','reading-app.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c));
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
  w.DimRouter={href:(l,s)=>'#/it/reading'+(s==='readingArticleScreen'?'/article':'')};w.App={speak:()=>{},toast:()=>{}};
  const full=Object.assign({},a,{id:'test-article',schema:1,lang:'it',title:'<img src=x onerror=alert(1)>',titleZh:'中文标题',date:'2026-10-10',level:'A2',summaryZh:'摘要',source:{name:'Example',title:'Source',url:'https://example.org',publishedAt:'2026-09-26'},license:{name:'CC BY',url:'https://example.org/license'},adaptation:'改写',attribution:'署名',levelReason:'编辑估计'});
  w.fetch=async url=>({ok:true,json:async()=>url.endsWith('index.json')?{schema:1,articles:[full]}:full});
  let showCount=0; w.showScreen=s=>{screen=s;showCount++;};screen='readingScreen';w.ReadingApp.enter('italian');test(()=>assert.equal(showCount,0,'render-only enter must not invalidate router navigation'));
  await w.ReadingApp.open('italian');test(()=>assert(w.document.getElementById('readingView').textContent.includes('中文标题')));
  await w.ReadingApp.open('italian','test-article');const host=w.document.getElementById('readingArticleView');
  test(()=>assert(host.textContent.includes(full.title)));test(()=>assert.equal(host.querySelectorAll('img').length,0));
  const toggle=host.querySelectorAll('button').find(b=>b.textContent==='隐藏全部中文');toggle.click();test(()=>assert(host.querySelector('.reading-translation').hidden));toggle.click();test(()=>assert(!host.querySelector('.reading-translation').hidden));
  host.querySelector('.reading-word').click();test(()=>assert(host.textContent.includes('本句释义')));
  const done=host.querySelectorAll('button').find(b=>b.textContent==='标记读完');done.click();test(()=>assert(w.ReadingApp.progress('it')['test-article']));done.click();test(()=>assert(!w.ReadingApp.progress('it')['test-article']));
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
