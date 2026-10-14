#!/usr/bin/env node
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'), assert=require('assert');
const {createWindow}=require('./dom-shim');
const root=path.resolve(__dirname,'..'); require('../lib/reading-practice');
const P=globalThis.ReadingPractice;
let passed=0; function check(fn){fn();passed++;}
for(const name of fs.readdirSync(path.join(root,'data/reading/practice'))){
 const d=JSON.parse(fs.readFileSync(path.join(root,'data/reading/practice',name))); const a=JSON.parse(fs.readFileSync(path.join(root,'data/reading/articles',name)));
 check(()=>assert(P.validate(d,a))); const s=P.create(d);
 for(const q of d.questions){check(()=>assert.equal(P.grade(q.answer,q.answer),'correct')); for(const x of q.options.filter(x=>x!==q.answer))check(()=>assert.notEqual(P.grade(x,q.answer),'correct')); check(()=>assert.equal(s.submit(q,''),null)); const first=s.submit(q,q.answer);check(()=>assert.equal(s.submit(q,'wrong'),first));}
 s.reset(); check(()=>assert.equal(Object.keys(s.answers).length,0));
 const bad=JSON.parse(JSON.stringify(d));bad.questions[0].answer+='x';check(()=>assert(!P.validate(bad,a)));
 const dup=JSON.parse(JSON.stringify(d));const wrongOption=dup.questions[0].options.findIndex(option=>option!==dup.questions[0].answer);dup.questions[0].options[wrongOption]=dup.questions[0].answer;check(()=>assert(!P.validate(dup,a)));
}
for(const [input,answer,result] of [['equipe','équipe','accent'],['nähe','Nähe','case'],['mappe','mappa','wrong'],['erreicht','erreichen','wrong'],['harvest','harvests','wrong'],[' lége\u0301r ','légér','correct']])check(()=>assert.equal(P.grade(input,answer),result));
const w=createWindow();w.Map=Map;w.Set=Set;
const original=w.document.createElement.bind(w.document);w.document.createElement=function(tag){const el=original(tag);el.replaceChildren=function(...children){this.textContent='';children.forEach(x=>this.appendChild(x));};el.focus=()=>{};return el;};
let stopped=0,detached=0,started=0,pool,options;
w.Languages={mountAccentKeys:()=>{}};w.TypingGame={create:o=>{options=o;pool=o.pool;return{resize:()=>{},start:()=>started++,stop:()=>stopped++,setInput:()=>{},submit:()=>{}};},Renderer:{attach:()=>({detach:()=>detached++})}};
const c=vm.createContext(w);['lib/reading-practice.js','reading-practice-app.js'].forEach(p=>vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),c));
const file=fs.readdirSync(path.join(root,'data/reading/practice'))[0];const d=JSON.parse(fs.readFileSync(path.join(root,'data/reading/practice',file)));const a=JSON.parse(fs.readFileSync(path.join(root,'data/reading/articles',file)));
const host=w.document.createElement('div');w.document.body.appendChild(host);w.ReadingPracticeApp.mount(host,a,d);
const button=t=>host.querySelectorAll('button').find(b=>b.textContent===t);
check(()=>assert.equal(host.querySelectorAll('.reading-practice-card').length,5));
button(d.questions[0].answer).click();check(()=>assert(host.textContent.includes('已完成 1/5')));
w.ReadingPracticeApp.mount(host,a,d);check(()=>assert(host.textContent.includes('已完成 1/5')));
button('拼写挑战').click();check(()=>assert(host.textContent.includes('已完成 0/5')));
button('选词热身').click();check(()=>assert(host.textContent.includes('已完成 1/5')));
button('开始本篇词汇挑战').click();check(()=>assert.equal(pool.length,a.learningSummary.words.length));check(()=>assert.equal(started,1));check(()=>assert.equal(options.grade('parteien','Parteien'),'case'));const gameInput=host.querySelectorAll('input')[0];gameInput.value='partial';options.onEvent('miss',{item:{answer:'test'}});check(()=>assert.equal(gameInput.value,''));
button('开始本篇词汇挑战').click();check(()=>assert.equal(stopped,1));check(()=>assert.equal(detached,1));
button('重做本篇').click();check(()=>assert(host.textContent.includes('已完成 0/5')));check(()=>assert.equal(stopped,2));
button('开始本篇词汇挑战').click();button('拼写挑战').click();check(()=>assert.equal(stopped,3));button('开始本篇词汇挑战').click();button('选词热身').click();check(()=>assert.equal(stopped,4));
const empty=w.document.createElement('div');w.ReadingPracticeApp.mount(empty,a,null);check(()=>assert.equal(empty.textContent,''));
console.log('Reading practice: '+passed+' passed, 0 failed');
