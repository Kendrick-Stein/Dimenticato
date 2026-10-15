#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),{createWindow}=require('./dom-shim');
const root=path.resolve(__dirname,'..');let passed=0;const check=fn=>{fn();passed++;};
const w=createWindow();w.URL=URL;w.Map=Map;w.Set=Set;
const make=w.document.createElement.bind(w.document);w.document.createElement=function(tag){const n=make(tag);n.replaceChildren=function(...nodes){this.textContent='';nodes.forEach(x=>this.appendChild(x));};n.contains=function(node){for(let p=node;p;p=p.parentElement)if(p===this)return true;return false;};return n;};
for(const id of ['readingView','readingArticleView']){const n=w.document.createElement('div');n.id=id;w.document.body.appendChild(n);}
let screen='',lang='english';w.showScreen=s=>screen=s;w.Shell={current:()=>screen};w.getActiveLanguage=()=>lang;w.DimRouter={href:()=> '#/en/reading'};w.App={speak:()=>{},toast:()=>{}};
const context=vm.createContext(w);for(const f of ['lib/languages.js','lib/storage.js','lib/reading-catalog.js','lib/reading-comprehension.js','reading-comprehension-app.js','reading-app.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context);
const names=fs.readdirSync(path.join(root,'data/reading/comprehension')).filter(f=>f.includes('-en-'));const data=names.map(f=>JSON.parse(fs.readFileSync(path.join(root,'data/reading/comprehension',f))));const articles=names.map(f=>JSON.parse(fs.readFileSync(path.join(root,'data/reading/articles',f))));
let response,resolveDelayed;const host=w.document.getElementById('readingArticleView');const flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
w.fetch=async url=>{if(url.includes('/comprehension/'))return response(url);return {ok:true,json:async()=>url.endsWith('index.json')?{schema:1,articles}:articles.find(a=>url.endsWith(a.id+'.json'))};};
(async()=>{
 response=async()=>({ok:false,status:404});await w.ReadingApp.open(lang,articles[0].id);await flush();check(()=>assert(host.querySelector('.reading-comprehension').hidden));check(()=>assert(host.querySelector('.reading-body')));
 response=async()=>({ok:false,status:503});await w.ReadingApp.open(lang,articles[0].id);await flush();check(()=>assert(host.textContent.includes('阅读理解暂时加载失败')));
 response=async()=>({ok:true,status:200,json:async()=>data[0]});host.querySelectorAll('button').find(b=>b.textContent==='重试阅读理解').click();await flush();check(()=>assert.equal(host.querySelectorAll('.reading-comprehension-card').length,data[0].questions.length));
 response=async()=>({ok:true,status:200,json:async()=>({schema:2})});await w.ReadingApp.open(lang,articles[0].id);await flush();check(()=>assert(host.querySelector('.reading-comprehension').hidden));
 response=async()=>({ok:true,status:200,json:async()=>{throw new SyntaxError('invalid json');}});await w.ReadingApp.open(lang,articles[0].id);await flush();check(()=>assert(host.querySelector('.reading-comprehension').hidden));
 response=()=>new Promise(resolve=>resolveDelayed=resolve);await w.ReadingApp.open(lang,articles[0].id);await flush();const old=resolveDelayed;
 response=async()=>({ok:true,status:200,json:async()=>data[1]});await w.ReadingApp.open(lang,articles[1].id);await flush();old({ok:true,status:200,json:async()=>data[0]});await flush();check(()=>assert.equal(host.querySelector('.reading-comprehension-prompt').textContent,data[1].questions[0].prompt));
 response=()=>new Promise(resolve=>resolveDelayed=resolve);await w.ReadingApp.open(lang,articles[0].id);await flush();lang='french';resolveDelayed({ok:true,status:200,json:async()=>data[0]});await flush();check(()=>assert.equal(host.querySelectorAll('.reading-comprehension-card').length,0));
 lang='english';response=()=>new Promise(resolve=>resolveDelayed=resolve);await w.ReadingApp.open(lang,articles[0].id);await flush();screen='homeScreen';resolveDelayed({ok:true,status:200,json:async()=>data[0]});await flush();check(()=>assert.equal(host.querySelectorAll('.reading-comprehension-card').length,0));
 console.log('Comprehension loading: '+passed+' passed, 0 failed');
})().catch(e=>{console.error(e);process.exitCode=1;});
