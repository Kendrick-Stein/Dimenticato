#!/usr/bin/env node
'use strict';
const assert = require('assert'), fs = require('fs'), vm = require('vm');
const { createWindow } = require('./dom-shim');
const catalog = require('../lib/reading-catalog');
let passed=0;
function check(fn) { fn(); passed++; }
function article(id, level, count, lang='en', source='2026-10-09') {
  return {id,lang,level,date:catalog.localDate(new Date()),sourcePublishedAt:source,category:'technology',topics:[],title:id,titleZh:id,summaryZh:'summary',contentType:'native-adaptation',sentences:[{id:'s1',text:Array(count).fill('word').join(' '),zh:'中文'}]};
}
check(()=>assert.equal(catalog.bodyWordCount({sentences:[{text:"l'école porte-monnaie 2026 — !\n café",zh:'不要计入 中文'}],summaryZh:'不要计入'}),4));
check(()=>assert.equal(catalog.bodyWordCount({sentences:[]}),null));
check(()=>assert.equal(catalog.bodyWordCount({sentences:[{text:'one\u0085two\uFEFFthree'}]}),3));
const index=JSON.parse(fs.readFileSync('data/reading/index.json'));
const counts={};
index.articles.forEach(a=>{counts[a.id]=catalog.bodyWordCount(JSON.parse(fs.readFileSync('data/reading/articles/'+a.id+'.json')));});
for(const lang of ['it','fr','de','en']) {
  const picks=catalog.today(catalog.select(index.articles,lang,'','',''),'2026-10-13',counts);
  check(()=>assert.equal(picks.length,3,lang+' has three actual length-matched tiers'));
  check(()=>assert(picks.every(p=>counts[p.article.id]>=150),lang+' excludes old short editions'));
}
for(const id of ['2026-10-13-en-robots-at-work','2026-10-13-fr-riviere','2026-10-13-de-tiktok']) {
  if(counts[id] !== undefined) check(()=>assert(counts[id]<150));
}
const rows=[article('short-old','B1',130),article('new-standard','B1',290,'en','2026-10-06'),article('new-a2','A2',170),article('new-b2','B2',510)];
const lengths=Object.fromEntries(rows.map(a=>[a.id,catalog.bodyWordCount(a)]));
check(()=>assert.deepEqual(catalog.today(rows,rows[0].date,lengths).map(p=>p.article.id),['new-a2','new-standard','new-b2']));
for(const [level,n,valid] of [['A2',149,false],['A2',150,true],['A2',220,true],['A2',221,false],['B1',279,false],['B1',280,true],['B1',400,true],['B1',401,false],['C1',499,false],['C1',500,true],['C1',700,true],['C1',701,false]]) {
  const a=article('boundary',level,n);
  check(()=>assert.equal(catalog.today([a],a.date,{boundary:n}).length,valid?1:0));
}
function setup(items, articleFetch) {
  const w=createWindow(); w.URL=URL; w.Date=Date;
  const make=w.document.createElement;
  function augment(n) {n.replaceChildren=(...nodes)=>{n.textContent='';nodes.forEach(x=>n.appendChild(x));};n.focus=()=>{w.document.activeElement=n;};n.contains=node=>{for(let p=node;p;p=p.parentElement)if(p===n)return true;return false;};return n;}
  w.document.createElement=tag=>augment(make(tag));
  w.document.body.innerHTML='<div id="readingView"></div><div id="readingArticleView"></div>';
  ['readingView','readingArticleView'].forEach(id=>augment(w.document.getElementById(id)));
  let lang='english',screen='';
  w.showScreen=id=>{screen=id;};w.Shell={current:()=>screen};w.getActiveLanguage=()=>lang;w.DimRouter={href:(l,s)=>'#/'+l+'/'+s};
  const calls=[];
  w.fetch=async url=>{calls.push(url);if(url.endsWith('index.json'))return {ok:true,json:async()=>({schema:1,articles:items})};return articleFetch(url);};
  const cx=vm.createContext(w);
  ['lib/languages.js','lib/storage.js','lib/reading-catalog.js','reading-app.js'].forEach(f=>vm.runInContext(fs.readFileSync(f,'utf8'),cx));
  return {w,calls,lang:l=>{lang=l;},screen:s=>{screen=s;},host:w.document.getElementById('readingView')};
}
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
  const historic=article('historic','B1',300);historic.date='2020-01-01';
  const s=setup(rows.concat(historic),async url=>({ok:true,json:async()=>rows.find(a=>url.endsWith(a.id+'.json'))}));
  await s.w.ReadingApp.open('english');
  check(()=>assert.equal(s.calls.filter(u=>u.includes('/articles/')).length,4,'only today current language fetched'));
  check(()=>assert(!s.calls.some(u=>u.includes('historic.json'))));
  check(()=>assert.equal(s.host.querySelectorAll('.reading-card').length,5,'archive retains old short and historical'));
  check(()=>assert(s.host.querySelector('.reading-today').textContent.includes('new-standard')));
  await s.w.ReadingApp.open('english');
  check(()=>assert.equal(s.calls.filter(u=>u.includes('/articles/')).length,4,'cache prevents repeat downloads'));
  const f=setup(rows,async()=>{throw Error('offline');});
  await f.w.ReadingApp.open('english');
  check(()=>assert.equal(f.host.querySelectorAll('.reading-card').length,4,'failed recommendations still leave archive'));
  check(()=>assert(!f.host.querySelector('.reading-today')));
  const pending=[];
  const race=setup(rows, url=>new Promise(resolve=>pending.push(()=>resolve({ok:true,json:async()=>rows.find(a=>url.endsWith(a.id+'.json'))}))));
  const slow=race.w.ReadingApp.open('english');await tick();
  check(()=>assert.equal(race.host.querySelectorAll('.reading-card').length,4,'archive visible while candidate bodies pending'));
  const search=race.w.document.getElementById('readingSearch');search.value='short-old';search.dispatchEvent({type:'input'});
  check(()=>assert.equal(race.host.querySelectorAll('.reading-card').length,1,'search works during candidate loading'));
  race.lang('german');await race.w.ReadingApp.open('german');pending.forEach(fn=>fn());await slow;
  check(()=>assert.equal(race.host.querySelectorAll('.reading-card').length,0,'late English response cannot overwrite German screen'));
  check(()=>assert(!race.host.textContent.includes('new-standard')));

  const later=[];
  const edited=setup(rows,url=>new Promise(resolve=>later.push(()=>resolve({ok:true,json:async()=>rows.find(a=>url.endsWith(a.id+'.json'))}))));
  const loading=edited.w.ReadingApp.open('english');await tick();
  const input=edited.w.document.getElementById('readingSearch');input.value='new-standard';input.dispatchEvent({type:'input'});input.focus();
  later.forEach(fn=>fn());await loading;
  check(()=>assert.equal(edited.host.querySelectorAll('.reading-card').length,1,'late counts preserve current search'));
  check(()=>assert.equal(edited.w.document.activeElement,input,'late counts keep search focus'));
  console.log('Reading tier selection OK: '+passed+' passed, 0 failed');
})().catch(e=>{console.error(e);process.exitCode=1;});
