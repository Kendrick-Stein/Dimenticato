'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const {createWindow}=require('./dom-shim');const root=path.resolve(__dirname,'..');let passed=0;const ok=(v,m)=>{assert.ok(v,m);passed++;};
let w=createWindow(),c=vm.createContext(w),calls=[],cancelled=0,voices=[];
w.speechSynthesis={getVoices:()=>voices,addEventListener(){},cancel(){cancelled++;},speak(u){calls.push(u);}};
w.document.readyState='loading';w.document.body.innerHTML=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
w.document.body.setAttribute('data-language','italian');
for(const f of ['lib/utils.js','lib/languages.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
w.getActiveLanguage=()=>w.document.body.getAttribute('data-language');
for(const [code,tag] of [['it','it-IT'],['fr','fr-FR'],['de','de-DE'],['en','en-US']]){
 voices=[{lang:'zh-CN'},{lang:tag}];w.Speaker.speak('test',code);ok(calls.at(-1).lang===tag,'utterance language');ok(calls.at(-1).voice.lang===tag,'matching voice');
}
voices=[{lang:'en-GB'},{lang:'en-US'}];w.Speaker.speak('test','en');ok(calls.at(-1).voice.lang==='en-US','exact locale preferred');
voices=[];w.Speaker.speak('test','de');ok(calls.at(-1).lang==='de-DE'&&!calls.at(-1).voice,'empty voices keeps language hint');
voices=[{lang:'fr-FR'}];w.Speaker.speak('test','fr');ok(calls.at(-1).voice.lang==='fr-FR','late voice refresh');
let errors=0;w.Speaker.speak('one','it',()=>errors++);const stale=calls.at(-1);w.Speaker.cancel();stale.onerror({error:'not-allowed'});ok(errors===0,'stale failure ignored');w.Speaker.speak('two','it',()=>errors++);calls.at(-1).onerror({error:'not-allowed'});ok(errors===1,'blocked speech surfaced');calls.at(-1).onerror({error:'interrupted'});ok(errors===1,'cancellation silent');
let screen='quizScreen';w.Shell={current:()=>screen};w.Vocab={headword:x=>x.word,POS_LABEL:{},grammarLine:()=>'',usageLine:()=>''};w.PracticeFlow={hintReset:()=>0};
let src=fs.readFileSync(path.join(root,'app.js'),'utf8');src=src.replace('  global.App = App;','  global.App = App; global.AudioTest={renderQuiz,readQuizWord,nextQuestion,onQuizAnswer,leavePracticeScreen,setSession:s=>session=s,setAuto:v=>quizAutoAudio=v};');vm.runInContext(src,c);
function state(reverse=false){return{mode:'quiz',lang:'italian',quizIndex:0,quizTotal:0,quizCorrect:0,words:[{word:'casa',zh:'家'},{word:'libro',zh:'书'}],distractorSource:[],engine:{isReverse:()=>reverse,shouldSpeakQuestion:()=>!reverse,questionTextFor:x=>x.zh,correctAnswerFor:x=>x.zh,generateOptions:()=>[],renderOptions(){}}};}
w.QuizEngine={sampleDistractorPool:()=>[]};
let s=state();w.AudioTest.setSession(s);calls=[];w.AudioTest.renderQuiz();ok(calls.length===1&&calls[0].text==='casa','first question auto speaks');w.AudioTest.renderQuiz();ok(calls.length===1,'rerender does not repeat');s.answered=true;w.AudioTest.readQuizWord(s,false);ok(calls.length===1,'answer does not repeat');let before=cancelled;w.AudioTest.nextQuestion();ok(calls.length===2&&calls[1].text==='libro'&&cancelled>before,'next speaks new word and cancels old');w.AudioTest.readQuizWord(s,true);ok(calls.length===3,'manual replay');
s=state(true);w.AudioTest.setSession(s);calls=[];w.AudioTest.renderQuiz();ok(calls.length===0,'reverse does not leak answer');w.AudioTest.readQuizWord(s,true);ok(calls.length===0,'manual does not leak reverse answer');s.answered=true;w.AudioTest.readQuizWord(s,false);ok(calls.length===1,'reverse speaks after answer');
s=state();w.AudioTest.setSession(s);w.AudioTest.setAuto(false);calls=[];w.AudioTest.renderQuiz();ok(calls.length===0,'opt out silent');w.AudioTest.readQuizWord(s,true);ok(calls.length===1,'manual works with auto disabled');
let queuedNext;w.DimStorage={statsKey:l=>'stats:'+l};w.PracticeFlow.mcAnswer=o=>{o.state.quizTotal++;o.state.quizCorrect++;queuedNext=o.next;return 0;};
s=state(true);w.AudioTest.setSession(s);w.AudioTest.setAuto(true);calls=[];w.AudioTest.renderQuiz();ok(w.document.getElementById('quizSpeak').classList.contains('hidden'),'reverse speaker hidden before answer');w.AudioTest.onQuizAnswer({});ok(!w.document.getElementById('quizSpeak').classList.contains('hidden'),'reverse speaker revealed after answer');ok(s.quizTotal===1&&s.quizCorrect===1,'answer handler delegates scoring once');w.AudioTest.onQuizAnswer({});ok(s.quizTotal===1&&calls.length===1,'duplicate answer ignored');w.AudioTest.readQuizWord(s,true);ok(calls.length===2,'reverse manual replay after answer');before=cancelled;w.AudioTest.leavePracticeScreen('homeScreen');queuedNext();ok(s.quizIndex===0&&cancelled>before&&calls.length===2,'exit cancels speech and invalidates queued next');
let synth=w.speechSynthesis;delete w.speechSynthesis;errors=0;ok(w.Speaker.speak('test','it',()=>errors++)===false&&errors===1,'unavailable speech surfaced');w.speechSynthesis=synth;let speak=synth.speak;synth.speak=()=>{throw Error('blocked');};errors=0;ok(w.Speaker.speak('test','it',()=>errors++)===false&&errors===1,'synchronous speech failure surfaced');synth.speak=speak;
console.log(passed+' passed, 0 failed');
