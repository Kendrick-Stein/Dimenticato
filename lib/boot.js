/**
 * 首屏引导 + 语言包加载指示。
 *
 * 只做两件事：把 LangLoader 的加载事件接到既有的 #loading 遮罩上，然后启动引导。
 * 真正的清单、注入顺序和补初始化逻辑都在 lib/lang-loader.js 里。
 */
(function (global) {
  'use strict';

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
    // 遮罩是 fixed 全屏的，不必隐藏 #app：切模块时保留页面和滚动位置
    var loading = el('loading');
    if (loading) loading.classList.remove('hidden');
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
      showOverlay('正在加载' + global.Languages.label(detail.lang) + moduleName + '…');
      return;
    }
    if (type === 'module:done') {
      hideOverlay();
      return;
    }

    var name = global.Languages.label(detail.lang) || detail.lang;
    if (type === 'start') {
      // 首屏时遮罩本来就在，只改文案；中途切语言才需要重新拉起遮罩
      if (detail.boot) setDetail('正在加载' + name + '词库…');
      else showOverlay('正在加载' + name + '词库…');
      return;
    }
    // 首屏时 'done' 在 App.onLanguageData 渲染完之后才发，此时撤遮罩不会露出半成品
    if (type === 'done') hideOverlay();
  });

  // 词库自检 + CDN 兜底。原来是 index.html 末尾的一段内联脚本，但内联脚本在解析期
  // 立即执行，那时带 defer 的 lang-loader.js 还没跑，window.LangLoader 是 undefined，
  // 每次启动都抛 TypeError，自检和兜底从来没生效过。挪到这里：LangLoader 已就位，
  // 且在 boot() 之前注册，不会错过首个 done。
  global.LangLoader.on(function (type, detail) {
    if (type !== 'done') return;
    if (global.Vocab && !global.Vocab.ready(detail.lang)) {
      console.error('[boot] ' + detail.lang + ' 词库未能载入');
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
