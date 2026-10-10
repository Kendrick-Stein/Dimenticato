#!/usr/bin/env node
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const required = ['id','storyId','lang','date','title','titleZh','summaryZh','level','levelReason','attribution','adaptation'];
function validate(a) {
  const e=[]; const check=(ok,msg)=>{ if(!ok)e.push(msg); };
  check(a.schema === 1, 'schema must be 1'); required.forEach(k=>check(typeof a[k]==='string' && a[k].trim(),k+' required'));
  check(/^[a-z0-9-]+$/.test(a.id),'safe id'); check(['it','fr','de','en'].includes(a.lang),'supported language'); check(['A1','A2','B1','B2','C1','C2'].includes(a.level),'CEFR editorial band');
  check(/^\d{4}-\d{2}-\d{2}$/.test(a.date),'edition date');
  function https(v) { try { const u=new URL(v); return u.protocol==='https:' && !u.username && !u.password; } catch(_){return false;} }
  check(a.source && ['name','title','url','publishedAt','lang'].every(k=>typeof a.source[k]==='string' && a.source[k].trim()),'source provenance required');
  check(a.source && https(a.source.url),'source HTTPS'); check(a.license && a.license.name && https(a.license.url),'license required');
  check(Array.isArray(a.sentences) && a.sentences.length>0,'sentences required'); const ids=new Set();
  (a.sentences||[]).forEach(s=>{ check(typeof s.id==='string' && !ids.has(s.id),'unique sentence id'); ids.add(s.id); check(typeof s.text==='string' && !!s.text.trim() && typeof s.zh==='string' && !!s.zh.trim(),'paired sentence'); check(Array.isArray(s.glosses),'glosses array'); (s.glosses||[]).forEach(g=>{check(g.surface && g.lemma && g.zh,'gloss fields'); check(typeof s.text==='string' && s.text.includes(g.surface),'surface must occur verbatim'); if(g.start!==undefined || g.end!==undefined)check(Number.isInteger(g.start) && Number.isInteger(g.end) && g.start>=0 && g.end>g.start && s.text.slice(g.start,g.end)===g.surface,'UTF16 gloss span must match surface');}); });
  const text = value => typeof value === 'string' && !!value.trim();
  if (a.contentType !== undefined) {
    check(a.contentType === 'native-adaptation', 'supported contentType');
    check(a.source && a.source.lang === a.lang, 'native source language must match article language');
    check(!!a.learningSummary, 'native adaptation requires learningSummary');
  }
  if (a.learningSummary !== undefined) {
    const summary = a.learningSummary;
    check(summary && typeof summary === 'object' && !Array.isArray(summary), 'learningSummary must be an object');
    if (summary && typeof summary === 'object' && !Array.isArray(summary)) {
      ['words', 'phrases', 'sentences'].forEach(group => {
        const items = summary[group];
        check(Array.isArray(items) && items.length > 0, 'learningSummary.' + group + ' requires entries');
        const seen = new Set();
        if (!Array.isArray(items)) return;
        items.forEach(item => {
          if (!item || typeof item !== 'object' || Array.isArray(item)) { check(false, 'summary entry must be an object'); return; }
          const sentence = (Array.isArray(a.sentences) ? a.sentences : []).find(s => s.id === item.sentenceId);
          check(text(item.sentenceId) && !!sentence, 'summary must reference an existing sentenceId');
          if (group === 'sentences') {
            check(text(item.note), 'summary sentence needs a learning note');
          } else {
            check(text(item.text) && text(item.zh), 'summary term text and zh required');
            check(sentence && typeof sentence.text === 'string' && text(item.text) && sentence.text.includes(item.text), 'summary term must occur verbatim in referenced sentence');
            if (item.lemma !== undefined) check(text(item.lemma), 'summary lemma must be nonempty text');
            if (item.note !== undefined) check(text(item.note), 'summary note must be nonempty text');
          }
          const key = group === 'sentences' ? item.sentenceId : item.sentenceId + ':' + item.text;
          check(!seen.has(key), 'duplicate summary entry'); seen.add(key);
        });
      });
    }
  }
  return e;
}
function run() {
  const idx=JSON.parse(fs.readFileSync(path.join(ROOT,'data/reading/index.json'),'utf8')), errors=[], ids=new Set(), hashes=new Set();
  if(idx.schema!==1 || !Array.isArray(idx.articles)) throw Error('invalid reading index');
  idx.articles.forEach(row=>{ if(ids.has(row.id))errors.push('duplicate id '+row.id);ids.add(row.id); if(!/^[a-z0-9-]+$/.test(row.id))throw Error('unsafe id'); const a=JSON.parse(fs.readFileSync(path.join(ROOT,'data/reading/articles',row.id+'.json'),'utf8'));validate(a).forEach(e=>errors.push(row.id+': '+e)); ['id','lang','date','title','titleZh','summaryZh','level','contentType'].forEach(k=>{if(a[k]!==row[k])errors.push(row.id+': index mismatch '+k);}); if(row.sourceLang!==a.source.lang)errors.push(row.id+': index mismatch sourceLang'); if(row.sourcePublishedAt!==a.source.publishedAt)errors.push(row.id+': index mismatch sourcePublishedAt'); const hash=crypto.createHash('sha256').update(a.lang+'\n'+a.sentences.map(s=>s.text).join('\n')).digest('hex');if(hashes.has(hash))errors.push('duplicate article text');hashes.add(hash); });
  fs.readdirSync(path.join(ROOT,'data/reading/articles')).filter(x=>x.endsWith('.json')).forEach(f=>{ if(!ids.has(f.slice(0,-5)))errors.push('unindexed article '+f); });
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;} else console.log('Reading data OK: '+idx.articles.length+' articles; paired sentences, provenance, links and duplicate checks passed');
}
module.exports={validate}; if(require.main===module)run();
