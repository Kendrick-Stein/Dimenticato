/**
 * 首屏引导 + 语言包加载指示。
 *
 * 只做两件事：把 LangLoader 的加载事件接到既有的 #loading 遮罩上，然后启动引导。
 * 真正的清单、注入顺序和补初始化逻辑都在 lib/lang-loader.js 里。
 */
(function (global) {
  'use strict';

  var NAMES = { italian: '意大利语', german: '德语', english: '英语', french: '法语' };
  var MODULE_NAMES = {
    conjugations: '动词变位数据',
    grammar: '语法书',
    collocations: '动词搭配数据',
    cognates: '同源词数据'
  };

  function el(id) { return document.getElementById(id); }

  function setDetail(text) {
    var d = el('loadingDetail');
    if (d) d.textContent = text;
  }

  function showOverlay(text) {
    var loading = el('loading');
    var app = el('app');
    if (loading) loading.classList.remove('hidden');
    if (app) app.classList.add('hidden');
    setDetail(text);
  }

  function hideOverlay() {
    var loading = el('loading');
    var app = el('app');
    if (loading) loading.classList.add('hidden');
    if (app) app.classList.remove('hidden');
  }

  global.LangLoader.on(function (type, detail) {
    // 二级模块加载（变位/语法/搭配/同源词）：同样给遮罩，加载完即撤
    if (type === 'module:start') {
      var moduleName = MODULE_NAMES[detail.module] || detail.module;
      showOverlay('正在加载' + (NAMES[detail.lang] || '') + moduleName + '…');
      return;
    }
    if (type === 'module:done') {
      hideOverlay();
      return;
    }

    var name = NAMES[detail.lang] || detail.lang;
    if (type === 'start') {
      // 首屏时遮罩本来就在，只改文案；中途切语言才需要重新拉起遮罩
      if (detail.boot) setDetail('正在加载' + name + '词库…');
      else showOverlay('正在加载' + name + '词库…');
      return;
    }
    // 首屏的收尾交给 app.js 的 loadVocabulary()——它后面还要恢复进度、准备词表，
    // 在这里提前撤遮罩会让用户看到半初始化的界面。
    if (type === 'done' && !detail.boot) hideOverlay();
  });

  // 词库自检 + CDN 兜底。原来是 index.html 末尾的一段内联脚本，但内联脚本在解析期
  // 立即执行，那时带 defer 的 lang-loader.js 还没跑，window.LangLoader 是 undefined，
  // 每次启动都抛 TypeError，自检和兜底从来没生效过。挪到这里：LangLoader 已就位，
  // 且在 boot() 之前注册，不会错过首个 done。
  global.LangLoader.on(function (type, detail) {
    if (type !== 'done') return;
    // 只在意大利语包就位时校验意大利语词库；其它语言各自有自己的错误卡。
    if (detail.lang === 'italian') {
      if (typeof VOCABULARY_DATA !== 'undefined') {
        console.log('vocabulary.js 加载成功，包含 ' + VOCABULARY_DATA.length + ' 个单词');
      } else {
        console.error('vocabulary.js 加载失败或 VOCABULARY_DATA 未定义');
      }
    }
    if (!detail.boot || !global.CdnFallback) return;
    // onerror 不触发但脚本仍未生效时（例如被拦截器静默替换）也能降级
    global.CdnFallback.chart();
    global.CdnFallback.marked();
  });

  // 本文件带 defer，执行到这里 DOM 已经解析完毕
  //（document.readyState 只是被 __ReadyGate 伪装成 'loading'，不能拿来判断）。
  global.LangLoader.boot();
})(window);
