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

  // 本文件带 defer，执行到这里 DOM 已经解析完毕
  //（document.readyState 只是被 __ReadyGate 伪装成 'loading'，不能拿来判断）。
  global.LangLoader.boot();
})(window);
