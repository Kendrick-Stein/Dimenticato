/**
 * Dimenticato — 最小 DOM / window 垫片
 *
 * tests/*.html 是浏览器测试页；这个模块让它们也能在 Node 里跑：
 * 用 vm 建一个上下文，把 <script src> 与内联 <script> 依次执行进去。
 * 只实现测试用得到的 DOM 子集（元素树、innerHTML、querySelector、classList、
 * dataset、事件监听、localStorage），不追求规范完整。
 *
 * 用法：
 *   const { createWindow } = require('./dom-shim.js');
 *   const win = createWindow();
 */
'use strict';

const VOID_TAGS = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'use']);

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#96;': '`', '&nbsp;': ' '
};

function decodeEntities(value) {
  return String(value).replace(/&(?:amp|lt|gt|quot|nbsp|#39|#96);/g, m => ENTITIES[m] || m);
}

function camel(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function matchesSelector(el, selector) {
  const sel = selector.trim();
  if (!sel) return false;
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('.')) return el.classList.contains(sel.slice(1));
  if (sel.startsWith('[')) {
    const m = /^\[([^\]=]+)(?:=["']?([^\]"']*)["']?)?\]$/.exec(sel);
    if (!m) return false;
    const value = el.getAttribute(m[1]);
    if (value == null) return false;
    return m[2] === undefined || value === m[2];
  }
  // 复合选择器：tag.class / tag[attr]
  const tagMatch = /^([a-zA-Z][\w-]*)(.*)$/.exec(sel);
  if (!tagMatch) return false;
  if (el.tagName !== tagMatch[1].toUpperCase()) return false;
  return !tagMatch[2] || matchesSelector(el, tagMatch[2]);
}

function createDocument(win) {
  let nodeSeq = 0;

  function createElement(tagName) {
    const el = {
      nodeType: 1,
      tagName: String(tagName).toUpperCase(),
      _id: ++nodeSeq,
      children: [],
      parentElement: null,
      attributes: Object.create(null),
      dataset: Object.create(null),
      style: Object.create(null),
      _text: '',
      _listeners: Object.create(null),
      disabled: false
    };

    Object.defineProperty(el, 'id', {
      get() { return el.attributes.id || ''; },
      set(v) { el.attributes.id = String(v); }
    });

    Object.defineProperty(el, 'className', {
      get() { return el.attributes.class || ''; },
      set(v) { el.attributes.class = String(v == null ? '' : v); }
    });

    el.classList = {
      contains: (c) => el.className.split(/\s+/).filter(Boolean).indexOf(c) !== -1,
      add(...cs) {
        const list = el.className.split(/\s+/).filter(Boolean);
        cs.forEach(c => { if (list.indexOf(c) === -1) list.push(c); });
        el.className = list.join(' ');
      },
      remove(...cs) {
        el.className = el.className.split(/\s+/).filter(Boolean)
          .filter(c => cs.indexOf(c) === -1).join(' ');
      },
      toggle(c, force) {
        const has = el.classList.contains(c);
        const want = force === undefined ? !has : !!force;
        if (want) el.classList.add(c); else el.classList.remove(c);
        return want;
      }
    };

    el.setAttribute = (name, value) => {
      el.attributes[name] = String(value);
      if (name.startsWith('data-')) el.dataset[camel(name.slice(5))] = String(value);
    };
    el.getAttribute = (name) => (name in el.attributes ? el.attributes[name] : null);
    el.removeAttribute = (name) => { delete el.attributes[name]; };
    el.hasAttribute = (name) => name in el.attributes;

    el.appendChild = (child) => {
      child.parentElement = el;
      el.children.push(child);
      return child;
    };
    el.insertBefore = (child, ref) => {
      child.parentElement = el;
      const idx = ref ? el.children.indexOf(ref) : -1;
      if (idx === -1) el.children.push(child); else el.children.splice(idx, 0, child);
      return child;
    };
    el.removeChild = (child) => {
      const idx = el.children.indexOf(child);
      if (idx !== -1) el.children.splice(idx, 1);
      child.parentElement = null;
      return child;
    };
    el.remove = () => { if (el.parentElement) el.parentElement.removeChild(el); };

    Object.defineProperty(el, 'firstChild', { get: () => el.children[0] || null });
    Object.defineProperty(el, 'lastChild', { get: () => el.children[el.children.length - 1] || null });

    Object.defineProperty(el, 'textContent', {
      get() {
        if (!el.children.length) return el._text;
        return el._text + el.children.map(c => c.textContent).join('');
      },
      set(v) { el._text = String(v == null ? '' : v); el.children.length = 0; }
    });

    Object.defineProperty(el, 'innerHTML', {
      get() { return el._html || ''; },
      set(v) {
        el._html = String(v == null ? '' : v);
        el.children.length = 0;
        el._text = '';
        parseInto(el, el._html);
      }
    });

    el.addEventListener = (type, fn) => {
      (el._listeners[type] || (el._listeners[type] = [])).push(fn);
    };
    el.removeEventListener = (type, fn) => {
      const list = el._listeners[type] || [];
      const idx = list.indexOf(fn);
      if (idx !== -1) list.splice(idx, 1);
    };
    el.dispatchEvent = (event) => {
      const type = event && event.type;
      let node = el;
      const ev = Object.assign({ target: el, type }, event);
      while (node) {
        (node._listeners[type] || []).slice().forEach(fn => fn.call(node, ev));
        node = node.parentElement;
      }
      // 冒泡到 document —— 事件委托（如难度切换）就挂在这一层
      if (doc && doc._listeners[type]) doc._listeners[type].slice().forEach(fn => fn.call(doc, ev));
      return true;
    };
    el.click = () => el.dispatchEvent({ type: 'click' });

    // 支持逗号分组与后代选择器（"#germanSettingsScreen .container"）
    const descendantsMatching = (roots, compound) => {
      const found = [];
      roots.forEach(root => {
        (function walk(node) {
          node.children.forEach(child => {
            if (matchesSelector(child, compound)) found.push(child);
            walk(child);
          });
        })(root);
      });
      return found;
    };

    el.querySelectorAll = (selector) => {
      const out = [];
      String(selector).split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
        let current = [el];
        part.split(/\s+/).forEach(compound => { current = descendantsMatching(current, compound); });
        current.forEach(node => { if (out.indexOf(node) === -1) out.push(node); });
      });
      out.forEach = Array.prototype.forEach.bind(out);
      return out;
    };
    el.querySelector = (selector) => el.querySelectorAll(selector)[0] || null;
    el.closest = (selector) => {
      let node = el;
      while (node) {
        if (matchesSelector(node, selector)) return node;
        node = node.parentElement;
      }
      return null;
    };
    el.getElementsByTagName = (tag) => el.querySelectorAll(tag);

    return el;
  }

  // 极简 HTML 解析：够解析测试里生成的按钮/图标标记
  function parseInto(root, html) {
    const stack = [root];
    const re = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s">]+))?)*)\s*(\/?)>|([^<]+)/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      const [, closing, tag, attrs, selfClose, textNode] = m;
      const parent = stack[stack.length - 1];
      if (textNode != null) {
        parent._text += decodeEntities(textNode);
        continue;
      }
      if (closing) {
        if (stack.length > 1) stack.pop();
        continue;
      }
      const el = createElement(tag);
      if (attrs) {
        const attrRe = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s">]+)))?/g;
        let a;
        while ((a = attrRe.exec(attrs)) !== null) {
          if (!a[1]) continue;
          const value = a[2] !== undefined ? a[2] : (a[3] !== undefined ? a[3] : (a[4] !== undefined ? a[4] : ''));
          el.setAttribute(a[1], decodeEntities(value));
        }
      }
      parent.appendChild(el);
      if (!selfClose && !VOID_TAGS.has(tag.toLowerCase())) stack.push(el);
    }
  }

  const documentElement = createElement('html');
  const body = createElement('body');
  const head = createElement('head');
  documentElement.appendChild(head);
  documentElement.appendChild(body);

  const doc = {
    nodeType: 9,
    readyState: 'complete',
    documentElement,
    body,
    head,
    _listeners: Object.create(null),
    createElement,
    createTextNode(value) {
      const el = createElement('span');
      el.textContent = value;
      return el;
    },
    getElementById(id) {
      return documentElement.querySelectorAll('#' + id)[0] || null;
    },
    querySelector(sel) { return documentElement.querySelector(sel); },
    querySelectorAll(sel) { return documentElement.querySelectorAll(sel); },
    addEventListener(type, fn) {
      (doc._listeners[type] || (doc._listeners[type] = [])).push(fn);
    },
    removeEventListener(type, fn) {
      const list = doc._listeners[type] || [];
      const idx = list.indexOf(fn);
      if (idx !== -1) list.splice(idx, 1);
    },
    dispatchEvent(event) {
      (doc._listeners[event.type] || []).slice().forEach(fn => fn.call(doc, event));
      return true;
    }
  };
  doc.defaultView = win;
  return doc;
}

/**
 * localStorage 垫片。
 * 键直接挂在对象上（方法设为不可枚举），这样 `Object.keys(localStorage)`
 * 的行为和浏览器一致 —— app.js 的 clearAllData() 正是这么遍历的。
 */
function createLocalStorage() {
  const store = {};
  const define = (name, value) =>
    Object.defineProperty(store, name, { value, enumerable: false, writable: true, configurable: true });

  define('getItem', (k) => (Object.prototype.hasOwnProperty.call(store, String(k)) ? store[String(k)] : null));
  define('setItem', (k, v) => { store[String(k)] = String(v); });
  define('removeItem', (k) => { delete store[String(k)]; });
  define('clear', () => { Object.keys(store).forEach(k => { delete store[k]; }); });
  define('key', (i) => Object.keys(store)[i] ?? null);
  define('_keys', () => Object.keys(store));
  Object.defineProperty(store, 'length', {
    get: () => Object.keys(store).length, enumerable: false, configurable: true
  });
  return store;
}

function createWindow() {
  const win = {
    console,
    setTimeout, clearTimeout, setInterval, clearInterval,
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    Set, Map, WeakMap, WeakSet, Promise, Symbol, Intl,
    URL, TextEncoder, TextDecoder,
    isNaN, isFinite, parseInt, parseFloat, encodeURIComponent, decodeURIComponent,
    alerts: [], confirms: [], prompts: []
  };
  win.window = win;
  win.self = win;
  win.globalThis = win;
  win.localStorage = createLocalStorage();
  win.sessionStorage = createLocalStorage();
  win.document = createDocument(win);
  win.navigator = { userAgent: 'node-dom-shim', language: 'zh-CN' };
  win.location = { href: 'http://localhost/tests/', reload() {} };
  win._events = Object.create(null);
  win.addEventListener = (type, fn) => { (win._events[type] || (win._events[type] = [])).push(fn); };
  win.removeEventListener = (type, fn) => {
    const list = win._events[type] || [];
    const idx = list.indexOf(fn);
    if (idx !== -1) list.splice(idx, 1);
  };
  win.dispatchEvent = (event) => {
    (win._events[event.type] || []).slice().forEach(fn => fn.call(win, event));
    return true;
  };
  win.alert = (msg) => { win.alerts.push(String(msg)); };
  win.confirm = (msg) => { win.confirms.push(String(msg)); return win._confirmAnswer !== false; };
  win.prompt = (msg) => { win.prompts.push(String(msg)); return win._promptAnswer ?? null; };
  win.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 0);
  win.cancelAnimationFrame = (id) => clearTimeout(id);
  win.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {} });
  win.Blob = typeof Blob !== 'undefined' ? Blob : function Blob(parts) { this.parts = parts; };
  win.getComputedStyle = () => ({ getPropertyValue: () => '' });

  // 语音合成：app.js 顶层就 new LanguageSpeaker() 并读 getVoices()
  win.speechSynthesis = {
    getVoices: () => [],
    speak() {}, cancel() {}, pause() {}, resume() {},
    addEventListener() {}, removeEventListener() {},
    speaking: false, pending: false, paused: false
  };
  win.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) { this.text = text; };

  // 导出功能要用 URL.createObjectURL
  class ShimURL extends URL {}
  ShimURL.createObjectURL = () => 'blob:shim';
  ShimURL.revokeObjectURL = () => {};
  win.URL = ShimURL;

  return win;
}

module.exports = { createWindow, createLocalStorage };
