'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'data/listening/catalog.json')));
let passed=0;function ok(v){assert.ok(v);passed++;}
ok(data.schema===1);let ids=new Set();for(const a of data.entries){ok(/^[a-z0-9-]+$/.test(a.id)&&!ids.has(a.id));ids.add(a.id);ok(['it','fr','de','en'].includes(a.lang));ok(typeof a.guideZh==='string'&&!!a.verificationZh);ok(['provider','editorial'].includes(a.levelBasis));ok(['lesson','news','directory'].includes(a.kind));let u=new URL(a.url);ok(u.protocol==='https:'&&!u.username&&!u.password);for(const q of a.questions){ok(q.options.length===4&&new Set(q.options).size===4);ok(Number.isInteger(q.answerIndex)&&q.answerIndex>=0&&q.answerIndex<4);ok(!!q.explanationZh&&!!q.prompt);}}
for(const lang of ['it','fr','de','en'])ok(data.entries.some(a=>a.lang===lang));
const {createWindow}=require('./dom-shim');let w=createWindow();w.URL=URL;w.document.body.innerHTML='<section id="homeScreen"></section><section id="listeningScreen"><div id="listeningView"></div></section><section id="listeningLessonScreen"><div id="listeningLessonView"></div></section>';w.document.body.setAttribute('data-language','italian');w.document.activeElement=w.document.body;
const orig=w.document.createElement;function augment(n){n.remove=function(){this.parentElement.removeChild(this);};n.replaceChildren=function(...nodes){this.textContent='';nodes.forEach(x=>this.appendChild(x));};n.focus=()=>{};return n;}w.document.createElement=t=>augment(orig(t));['listeningView','listeningLessonView'].forEach(id=>augment(w.document.getElementById(id)));
w.fetch=async()=>({ok:true,json:async()=>data});w.scrollTo=()=>{};w.CustomEvent=function(t,o){this.type=t;this.detail=o&&o.detail;};let ctx=vm.createContext(w);['lib/utils.js','lib/languages.js','lib/shell.js','listening-app.js'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx));
for(const lang of ['it','fr','de','en']){let r=w.DimRouter.parse('#/'+lang+'/listening');ok(r.screenId==='listeningScreen');r=w.DimRouter.parse('#/'+lang+'/listening/lesson/test');ok(r.screenId==='listeningLessonScreen');}
ok(w.ListeningApp.safeURL('javascript:alert(1)')===null);ok(w.ListeningApp.safeURL('https://user:pass@example.org')===null);ok(w.ListeningApp.safeURL('https://example.org')==='https://example.org/');
(async()=>{await w.ListeningApp.open('italian');ok(w.document.getElementById('listeningView').textContent.includes('外文听力'));await w.ListeningApp.open('italian','missing');ok(w.document.getElementById('listeningLessonView').textContent.includes('未找到'));for(const a of data.entries){w.document.body.setAttribute('data-language',w.Languages.key(a.lang));await w.ListeningApp.open(w.Languages.key(a.lang),a.id);let host=w.document.getElementById('listeningLessonView');ok(host.textContent.includes(a.titleZh));ok(host.querySelectorAll('iframe').length===0);if(a.questions.length)ok(host.querySelectorAll('fieldset').length===a.questions.length);}

const a=data.entries.find(a=>a.questions.length);
w.document.body.setAttribute('data-language',w.Languages.key(a.lang));
await w.ListeningApp.open(w.Languages.key(a.lang),a.id);
const host=w.document.getElementById('listeningLessonView'),form=host.querySelector('form'),fields=host.querySelectorAll('fieldset');
const submit=()=>form.dispatchEvent({type:'submit',preventDefault(){}});
submit();ok(host.textContent.includes('请先回答'));ok(!host.querySelector('.listening-answer'));
fields.forEach((f,i)=>{f.querySelectorAll('input')[a.questions[i].answerIndex].checked=true;});
submit();ok(host.textContent.includes('本次答对 '+a.questions.length+' / '+a.questions.length));ok(host.querySelectorAll('.listening-answer').length===a.questions.length);
submit();ok(host.querySelectorAll('.listening-answer').length===a.questions.length);
form.querySelectorAll('button')[1].click();ok(!host.querySelector('.listening-answer'));ok(fields.every(f=>f.querySelectorAll('input').every(n=>!n.checked&&!n.disabled)));
fields.forEach(f=>{f.querySelectorAll('input')[0].checked=true;});submit();ok(host.querySelectorAll('.listening-answer').length===a.questions.length);
vm.runInContext(fs.readFileSync(path.join(root,'listening-app.js'),'utf8'),ctx);
let resolveFetch;w.fetch=()=>new Promise(resolve=>{resolveFetch=resolve;});
w.document.body.setAttribute('data-language','italian');const old=w.ListeningApp.open('italian');
w.document.body.setAttribute('data-language','french');const newer=w.ListeningApp.open('french');
resolveFetch({ok:true,json:async()=>data});await Promise.all([old,newer]);
const catalogHost=w.document.getElementById('listeningView');
ok(catalogHost.textContent.includes(data.entries.find(a=>a.lang==='fr').titleZh));ok(!catalogHost.textContent.includes(data.entries.find(a=>a.lang==='it').titleZh));
vm.runInContext(fs.readFileSync(path.join(root,'listening-app.js'),'utf8'),ctx);
w.fetch=async()=>({ok:false,status:500});await w.ListeningApp.open('french');ok(catalogHost.textContent.includes('加载失败'));
w.fetch=async()=>({ok:true,json:async()=>data});catalogHost.querySelector('button').click();await new Promise(resolve=>setImmediate(resolve));ok(catalogHost.textContent.includes('外文听力'));
const src=fs.readFileSync(path.join(root,'listening-app.js'),'utf8');ok(!/localStorage\.(setItem|removeItem)|innerHTML\s*=/.test(src));console.log(passed+' passed, 0 failed');})().catch(e=>{console.error(e);process.exitCode=1;});
