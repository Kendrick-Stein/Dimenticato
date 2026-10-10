#!/usr/bin/env node
'use strict';
// Deterministic catalog assembly; does not fetch, generate, or publish content.
const fs=require('fs'),path=require('path'); const {validate}=require('./validate_reading');
const catalog=require('../lib/reading-catalog');
const root=path.resolve(__dirname,'../data/reading');const rows=[];
for(const file of fs.readdirSync(path.join(root,'articles')).filter(f=>f.endsWith('.json')).sort()){
 const a=JSON.parse(fs.readFileSync(path.join(root,'articles',file),'utf8'));const errors=validate(a);if(errors.length)throw Error(file+': '+errors.join('; '));if(file!==a.id+'.json')throw Error('filename/id mismatch');
 const row=Object.fromEntries(['id','lang','date','title','titleZh','summaryZh','level','category','topics'].map(k=>[k,a[k]]));
 row.sourceLang=a.source.lang; row.sourcePublishedAt=a.source.publishedAt; if(a.contentType)row.contentType=a.contentType; rows.push(row);
}
rows.sort(catalog.compare);
fs.writeFileSync(path.join(root,'index.json'),JSON.stringify({schema:1,articles:rows},null,2)+'\n');console.log('Catalog assembled: '+rows.length+' articles');
