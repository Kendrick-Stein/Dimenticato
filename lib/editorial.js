/**
 * Dimenticato — 版面动效（纯渐进增强，没有它页面照常可用）
 *
 *   html.js            让 CSS 知道 JS 在跑（.reveal 只在 html.js 下才先隐藏）
 *   .topbar.scrolled   滚动超过 24px 收紧顶栏
 *   .reveal → .in      进入视口淡入（IntersectionObserver）
 *   [data-count]       数字从 0 数到目标值（首页 hero 统计）
 *   #heroStack         首页卡片堆的轻微视差（只在 pointer: fine 下跟随指针）
 *
 * 各屏由 app.js 用 innerHTML 反复重绘，所以这里不在加载时扫一次就完，而是
 * 盯着 #main 的 DOM 变化。只有「刚切屏」（dimenticato:screenchange 之后
 * 很短的窗口）里插入的元素才播动画；同一屏内的重绘（点筛选 chip、答题后刷新）
 * 直接给终态，不会每点一下都重新淡入。prefers-reduced-motion 下一律给终态。
 * 可重复加载：第二次执行直接返回。
 */
(function (global) {
  'use strict';

  var doc = global.document;
  if (!doc || global.Editorial) return;

  var root = doc.documentElement;
  root.classList.add('js');

  var mq = function (q) { return global.matchMedia ? global.matchMedia(q) : { matches: false }; };
  var reducedMotion = mq('(prefers-reduced-motion: reduce)').matches;
  var finePointer = mq('(pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in global;
  var raf = global.requestAnimationFrame ? global.requestAnimationFrame.bind(global) : function (fn) { return setTimeout(fn, 16); };
  var now = function () { return Date.now(); };

  // 切屏后多久内插入的元素算「新进场」
  var ARM_MS = 900;
  var armedUntil = now() + 2500; // 首次启动：数据加载完才渲染首页，给宽一点

  // ---------- reveal ----------

  var revealObserver = (!reducedMotion && hasIO) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }) : null;

  // ---------- count-up ----------

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var finalText = el.__edFinal != null ? el.__edFinal : el.textContent;
    if (!isFinite(target) || target <= 0) { el.textContent = finalText; return; }
    var start = null;
    var duration = 850;
    var fmt = global.Intl && global.Intl.NumberFormat ? new global.Intl.NumberFormat('zh-CN') : null;
    var step = function (ts) {
      if (!el.isConnected) return;
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      if (t < 1) {
        var v = Math.round(target * eased);
        el.textContent = fmt ? fmt.format(v) : String(v);
        raf(step);
      } else {
        el.textContent = finalText; // 终态用渲染时的原文（含千分位）
      }
    };
    raf(step);
  }

  var countObserver = (!reducedMotion && hasIO) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 }) : null;

  // ---------- 扫描 ----------

  function scan(scope) {
    scope = scope || doc;
    var animate = !reducedMotion && hasIO && now() <= armedUntil;
    var reveals = scope.querySelectorAll('.reveal:not(.in)');
    for (var i = 0; i < reveals.length; i++) {
      var el = reveals[i];
      if (el.__edSeen) continue;
      el.__edSeen = true;
      if (animate) revealObserver.observe(el);
      else el.classList.add('in');
    }
    if (animate) {
      var counters = scope.querySelectorAll('[data-count]');
      for (var j = 0; j < counters.length; j++) {
        var c = counters[j];
        if (c.__edSeen) continue;
        c.__edSeen = true;
        if (!(parseInt(c.getAttribute('data-count'), 10) > 0)) continue;
        c.__edFinal = c.textContent;
        c.textContent = '0'; // 进视口后从 0 数上来，避免先闪一下终值
        countObserver.observe(c);
      }
    }
    bindStack();
  }

  // ---------- 顶栏 ----------

  var scrollTick = false;
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    raf(function () {
      scrollTick = false;
      var topbar = doc.querySelector('.topbar');
      if (topbar) topbar.classList.toggle('scrolled', (global.scrollY || 0) > 24);
      var stack = doc.getElementById('heroStack');
      if (stack && !reducedMotion) {
        var sy = Math.max(-14, Math.min(0, -(global.scrollY || 0) * 0.03));
        stack.style.setProperty('--sy', sy.toFixed(1) + 'px');
      }
    });
  }

  // ---------- 卡片堆视差 ----------

  function bindStack() {
    if (reducedMotion || !finePointer) return;
    var stack = doc.getElementById('heroStack');
    if (!stack || stack.__edBound) return;
    var hero = stack.closest('.hero') || stack;
    stack.__edBound = true;
    var tick = false;
    var setVars = function (mx, my) {
      stack.style.setProperty('--mx', mx.toFixed(1) + 'px');
      stack.style.setProperty('--my', my.toFixed(1) + 'px');
    };
    hero.addEventListener('pointermove', function (event) {
      if (tick) return;
      tick = true;
      raf(function () {
        tick = false;
        var rect = hero.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        setVars(((event.clientX - rect.left) / rect.width - 0.5) * 10,
                ((event.clientY - rect.top) / rect.height - 0.5) * 8);
      });
    });
    hero.addEventListener('pointerleave', function () { setVars(0, 0); });
  }

  // ---------- 接线 ----------

  function start() {
    global.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    doc.addEventListener('dimenticato:screenchange', function () {
      armedUntil = now() + ARM_MS;
      scan(doc);
    });
    var main = doc.getElementById('main');
    if (main && 'MutationObserver' in global) {
      new MutationObserver(function () { scan(main); }).observe(main, { childList: true, subtree: true });
    }
    scan(doc);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();

  global.Editorial = { scan: scan };
})(typeof window !== 'undefined' ? window : this);
