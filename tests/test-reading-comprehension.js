#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
require('../lib/reading-comprehension');
const C = globalThis.ReadingComprehension, root = path.resolve(__dirname, '..');
let passed = 0;
function check(fn) { fn(); passed++; }
const copy = x => JSON.parse(JSON.stringify(x));
const article = {id:'test-article',lang:'en',sentences:[{id:'s1',text:'Ada arrived by train.'},{id:'s2',text:'Rain delayed the bus.'}]};
const data = {schema:1,articleId:article.id,lang:'en',questions:[{id:'q1',kind:'detail',prompt:'How did Ada arrive?',options:['By train.','By bus.','By boat.','On foot.'],answerIndex:0,evidence:['s1'],explanationZh:'第一句明确说明乘火车。'}]};
check(() => assert(C.validate(data, article)));
for (const mutate of [d=>d.schema=2,d=>d.articleId='../test-article',d=>d.lang='fr',d=>d.questions=[],d=>d.questions=null,d=>d.questions=[null],d=>d.questions.push(copy(d.questions[0])),d=>d.questions[0].kind='opinion',d=>d.questions[0].id='__proto__',d=>d.questions[0].prompt=' ',d=>d.questions[0].promptZh='',d=>d.questions[0].options[1]=' By train. ',d=>d.questions[0].options[1]=null,d=>d.questions[0].options.pop(),d=>d.questions[0].answerIndex='0',d=>d.questions[0].answerIndex=4,d=>d.questions[0].answerIndex=-1,d=>d.questions[0].answerIndex=0.5,d=>d.questions[0].evidence=[],d=>d.questions[0].evidence=['s3'],d=>d.questions[0].evidence=['s1','s1'],d=>d.questions[0].explanationZh='',d=>d.questions[0].extra='unsupported',d=>d.extra=true]) {
 const bad = copy(data); mutate(bad); check(() => assert(!C.validate(bad,article)));
}
check(() => assert(!C.validate(Object.assign({}, data, {lang:'xx'}), Object.assign({}, article, {lang:'xx'}))));
check(() => assert(!C.validate(null,article))); check(() => assert(!C.validate(data,null)));
for (const file of fs.readdirSync(path.join(root,'data/reading/comprehension')).filter(x=>x.endsWith('.json'))) {
 const d = JSON.parse(fs.readFileSync(path.join(root,'data/reading/comprehension',file))), a=JSON.parse(fs.readFileSync(path.join(root,'data/reading/articles',file)));
 check(()=>assert(C.validate(d,a)));
 const state=C.create(d);
 for (const q of d.questions) {
  for (const invalid of [null,undefined,'0',-1,4,0.1,NaN]) check(()=>assert.equal(state.submit(q.id,invalid),null));
  check(()=>assert.equal(state.submit('unknown',0),null));
  const first=state.submit(q.id,(q.answerIndex+1)%4);
  check(()=>assert.equal(first.correct,false));check(()=>assert.strictEqual(state.submit(q.id,q.answerIndex),first));
 }
 state.reset(); check(()=>assert.equal(Object.keys(state.answers).length,0));
 for(const q of d.questions)check(()=>assert.equal(state.submit(q.id,q.answerIndex).correct,true));
}
const snapshot=copy(data), state=C.create(snapshot); snapshot.questions[0].answerIndex=1;
check(()=>assert.equal(state.submit('q1',0).correct,true));
check(()=>assert(Object.isFrozen(state.answers.q1)));
// DOM integration with isolated in-memory state and no browser/user storage.
const vm = require('vm'), {createWindow} = require('./dom-shim');
const w=createWindow(); w.Map=Map; w.Set=Set;
const original=w.document.createElement.bind(w.document);
w.document.createElement=function(tag){const el=original(tag); el.replaceChildren=function(...children){this.textContent='';children.forEach(x=>this.appendChild(x));};el.focus=function(){w.document.activeElement=this;};el.scrollIntoView=function(){this.scrolled=true;};return el;};
const context=vm.createContext(w);
for(const file of ['lib/reading-comprehension.js','reading-comprehension-app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const host=w.document.createElement('section'),body=w.document.createElement('div');w.document.body.appendChild(body);w.document.body.appendChild(host);
for(const sentence of article.sentences){const row=w.document.createElement('section');row.className='reading-sentence';row.dataset.sentence=sentence.id;row.textContent=sentence.text;body.appendChild(row);}
const aided=copy(data);aided.questions[0].promptZh='艾达如何到达？';
check(()=>assert(w.ReadingComprehensionApp.mount(host,article,aided,body)));
check(()=>assert.equal(host.querySelectorAll('.reading-comprehension-feedback').length,0));
check(()=>assert.equal(host.querySelectorAll('.reading-comprehension-evidence').length,0));
check(()=>assert(host.querySelector('.reading-comprehension-aid').hidden));
host.querySelector('.reading-comprehension-aid-toggle').click();check(()=>assert(!host.querySelector('.reading-comprehension-aid').hidden));
const staleOption=host.querySelectorAll('.reading-comprehension-option')[0];host.querySelectorAll('.reading-comprehension-option')[1].click();
check(()=>assert(host.querySelector('.reading-comprehension-score').textContent.includes('已作答 1/1 · 首答正确 0/1')));
staleOption.click();check(()=>assert(host.querySelector('.reading-comprehension-score').textContent.includes('首答正确 0/1')));
check(()=>assert.equal(host.querySelectorAll('.reading-comprehension-feedback').length,1));
check(()=>assert.equal(host.querySelector('blockquote').textContent,article.sentences[0].text));
check(()=>assert(host.querySelectorAll('.reading-comprehension-option').every(b=>b.disabled)));
host.querySelector('.reading-comprehension-evidence-button').click();
check(()=>assert.equal(w.document.activeElement,body.children[0]));check(()=>assert(body.children[0].classList.contains('reading-comprehension-highlight')));
body.querySelector('.reading-comprehension-return').click();check(()=>assert.equal(body.querySelectorAll('.reading-comprehension-highlight').length,0));
check(()=>assert.equal(w.document.activeElement,host.querySelector('.reading-comprehension-feedback')));
w.ReadingComprehensionApp.mount(host,article,aided,body);check(()=>assert(host.querySelector('.reading-comprehension-score').textContent.includes('首答正确 0/1')));
host.querySelector('.reading-comprehension-redo').click();check(()=>assert(host.querySelector('.reading-comprehension-score').textContent.includes('已作答 0/1')));
check(()=>assert.equal(host.querySelectorAll('.reading-comprehension-feedback').length,0));
host.querySelectorAll('.reading-comprehension-option')[0].click();check(()=>assert(host.querySelector('.reading-comprehension-score').textContent.includes('首答正确 1/1')));
const other=copy(article);other.id='second-article';const otherData=copy(aided);otherData.articleId=other.id;
w.ReadingComprehensionApp.mount(host,other,otherData,body);check(()=>assert(host.querySelector('.reading-comprehension-score').textContent.includes('已作答 0/1')));
w.ReadingComprehensionApp.mount(host,article,aided,body);check(()=>assert(host.querySelector('.reading-comprehension-score').textContent.includes('首答正确 1/1')));
const blank=w.document.createElement('section');check(()=>assert.equal(w.ReadingComprehensionApp.mount(blank,article,null,body),false));check(()=>assert.equal(blank.textContent,''));
const unsafe=copy(otherData);unsafe.questions[0].prompt='<img src=x onerror=alert(1)>';w.ReadingComprehensionApp.mount(blank,other,unsafe,body);check(()=>assert.equal(blank.querySelectorAll('img').length,0));check(()=>assert(blank.textContent.includes('<img src=x onerror=alert(1)>')));
console.log('Reading comprehension: '+passed+' passed, 0 failed');
