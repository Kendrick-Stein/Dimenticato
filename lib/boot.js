/**
 * 首屏引导 + 语言包加载指示。
 *
 * 把 LangLoader 的加载事件接到 #loading 遮罩上（真实的文件计数进度条、失败文件名
 * + 重试按钮），注册离线 Service Worker，然后启动引导。
 * 真正的清单、注入顺序和补初始化逻辑都在 lib/lang-loader.js 里。
 */
(function (global) {
  'use strict';

  var MODULE_NAMES = {
    conjugations: '动词变位数据',
    grammar: '语法书',
    collocations: '动词搭配数据',
    cognates: '同源词数据',
    course: '课程路线'
  };

  function el(id) { return document.getElementById(id); }

  function setDetail(text) {
    var d = el('loadingDetail');
    if (d) d.textContent = text;
  }

  function setProgress(done, total) {
    var fill = el('loadingProgressFill');
    var bar = el('loadingProgress');
    if (!fill) return;
    if (!total) {
      fill.classList.add('is-indeterminate');
      fill.style.width = '';
      if (bar) bar.removeAttribute('aria-valuenow');
      return;
    }
    var pct = Math.max(0, Math.min(100, Math.round(done / total * 100)));
    fill.classList.remove('is-indeterminate');
    fill.style.width = pct + '%';
    if (bar) bar.setAttribute('aria-valuenow', String(pct));
  }

  // 失败提示：文件名 + 重试。retry 为 null 时重试 = 刷新整页（首屏代码缺失只能这样补）。
  var retryAction = null;
  function showError(files, retry) {
    var box = el('loadingError');
    var list = el('loadingErrorFiles');
    var loading = el('loading');
    if (!box || !list) return false;
    list.innerHTML = '';
    (files || []).forEach(function (src) {
      var li = document.createElement('li');
      li.textContent = src;
      list.appendChild(li);
    });
    retryAction = retry || null;
    box.hidden = false;
    if (loading) loading.classList.remove('hidden');
    setDetail('网络不稳定或文件缺失。');
    var btn = el('loadingRetryBtn');
    if (btn && typeof btn.focus === 'function') btn.focus();
    return true;
  }

  function clearError() {
    var box = el('loadingError');
    if (box) box.hidden = true;
    retryAction = null;
  }

  function showOverlay(text) {
    // 遮罩是 fixed 全屏的，不必隐藏 #app：切模块时保留页面和滚动位置
    var loading = el('loading');
    if (loading) loading.classList.remove('hidden');
    clearError();
    setProgress(0, 0);
    setDetail(text);
  }

  // 当前（用户最后选的）语言是否已经可用。快速连切语言时，先发起的那门语言加载完
  // 不能撤遮罩 —— 用户此刻要看的是后一门，它可能还在路上。
  function currentLangReady(detail) {
    var cur = document.body && document.body.getAttribute('data-language');
    return !cur || cur === detail.lang || global.LangLoader.isLoaded(cur);
  }

  function hideOverlay() {
    clearError();
    var loading = el('loading');
    var app = el('app');
    if (loading) loading.classList.add('hidden');
    if (app) app.classList.remove('hidden');
  }

  (function bindErrorButtons() {
    var retry = el('loadingRetryBtn');
    var dismiss = el('loadingDismissBtn');
    if (retry) retry.addEventListener('click', function () {
      var action = retryAction;
      if (!action) { global.location.reload(); return; }
      action();
    });
    if (dismiss) dismiss.addEventListener('click', hideOverlay);
  })();

  global.LangLoader.on(function (type, detail) {
    if (type === 'progress') {
      setProgress(detail.done, detail.total);
      var label = global.Languages.label(detail.lang) || detail.lang;
      if (!el('loadingError') || el('loadingError').hidden) {
        setDetail('正在加载' + label + (detail.module ? (MODULE_NAMES[detail.module] || detail.module) : (detail.boot ? '词库与程序' : '词库'))
          + '… ' + detail.done + '/' + detail.total);
      }
      return;
    }
    // 二级模块加载（变位/语法/搭配/同源词）：同样给遮罩，加载完即撤
    if (type === 'module:start') {
      var moduleName = MODULE_NAMES[detail.module] || detail.module;
      showOverlay('正在加载' + global.Languages.label(detail.lang) + moduleName + '…');
      return;
    }
    if (type === 'module:done') {
      if (!currentLangReady(detail)) return;
      if (detail.ok === false && detail.failed && detail.failed.length) {
        showError(detail.failed, function () {
          showOverlay('正在重试…');
          global.LangLoader.retryModule(detail.lang, detail.module);
        });
        return;
      }
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
    if (type === 'done' && (detail.boot || currentLangReady(detail))) {
      if (detail.ok === false && detail.failed && detail.failed.length) {
        // 首屏：代码文件缺席时只能整页重来；中途切语言：只补这门语言失败的词库文件
        if (!detail.boot) {
          showError(detail.failed, function () {
            showOverlay('正在重试…');
            global.LangLoader.ensure(detail.lang);
          });
          return;
        }
        // 先把已就绪的界面露出来（遮罩盖在上面），用户也可以选择先继续用
        var app = el('app');
        if (app) app.classList.remove('hidden');
        showError(detail.failed, null);
        return;
      }
      hideOverlay();
    }
  });

  // 词库自检。在 boot() 之前注册，不会错过首个 done。
  //（CDN 库改为按需加载，降级由 CdnFallback.load 自己处理，这里不再管。）
  global.LangLoader.on(function (type, detail) {
    if (type !== 'done' || detail.cached) return;
    if (global.Vocab && !global.Vocab.ready(detail.lang)) {
      console.error('[boot] ' + detail.lang + ' 词库未能载入');
    }
  });

  // 离线缓存：首屏加载完（window load）后再注册，不和首屏抢带宽；只在 https / localhost 上。
  // 路径相对当前页面，GitHub Pages 子路径下 scope 自动是 /Dimenticato/。
  (function registerServiceWorker() {
    var nav = global.navigator;
    if (!nav || !nav.serviceWorker || !global.isSecureContext) return;
    var register = function () {
      nav.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('[boot] Service Worker 注册失败（不影响使用）', err);
      });
    };
    if (document.readyState === 'complete') register();
    else global.addEventListener('load', register);
  })();

  // 本文件带 defer，执行到这里 DOM 已经解析完毕
  //（document.readyState 只是被 __ReadyGate 伪装成 'loading'，不能拿来判断）。
  global.LangLoader.boot();
})(window);
