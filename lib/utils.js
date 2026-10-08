/**
 * Dimenticato — 共享工具函数
 * 在所有模块之前加载，提供 escapeHtml、renderIcon、文本/释义归一化等基础工具
 * 加载顺序：必须在 vocabulary.js 之前，在 index.html 中作为第一个脚本引入
 */
(function () {
  'use strict';

  // ===== 文本归一化的正则常量 =====
  const COMBINING_MARKS = /[\u0300-\u036f]/g;
  const APOSTROPHES = /[’‘ʼ´`]/g;
  const HYPHENS = /[‐‑‒–—−]/g;
  const WHITESPACE = /\s+/g;
  // 释义分隔符：英文 ; , / |  与中文 ； ， 、 ／ ｜
  const GLOSS_SEPARATORS = /[;；,，、/／|｜]+/;
  // 括号内的补充说明：(阴性)、（二）、[pl.]、【名】
  const PARENTHETICALS = /[(（\[【][^)）\]】]*[)）\]】]/g;
  // 词性前缀：n. v. vt. adj. pron. …（ECDICT / HanDeDict 风格）
  const POS_PREFIX = /^(?:n|v|vt|vi|vb|adj|adv|pron|prep|conj|art|num|int|interj|aux|abbr|pl|sg)\.\s*/;
  // 占位符残留：(2) / （三） / 2 / 三 —— 抓取源数据里未解析的编号义项
  const PLACEHOLDER_SEGMENT = /^(?:\d+|[一二三四五六七八九十百]+)$/;
  // 释义比较时忽略的英文虚词前缀
  const LEADING_TO = /^to\s+/;
  // 只脱最外层括号 / 任意括号 / 义项前的编号标记
  const OUTER_BRACKETS = /^[(（\[【]+|[)）\]】]+$/g;
  const ANY_BRACKET = /[()（）\[\]【】]/g;
  const NUMBERED_PREFIX = /^[(（]\s*(?:\d+|[一二三四五六七八九十百]+)\s*[)）]\s*/;
  // cleanGloss 用：只有在括号/方括号之外的分隔符才真的分义项
  // （"star (TV/music)"、"[数、物]" 里的 / 和 、 是释义的一部分，不是分隔符）
  const GLOSS_SEPARATOR_CHARS = ';；,，、/／|｜';
  const BRACKET_OPENERS = '(（[【';
  const BRACKET_CLOSERS = ')）]】';
  const LEADING_SPACE = /^\s*/;
  // 中日韩字符（判断义项包含关系时不看单词边界）
  const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
  const WORD_CHAR = /[a-z0-9]/;
  // 义项首尾的标点
  const TRIM_PUNCTUATION = /^[\s.\u2026\u00b7\u30fb\uff0e\-"\u2018\u2019\u201c\u201d]+|[\s.\u2026\u00b7\u30fb\uff0e\-"\u2018\u2019\u201c\u201d]+$/g;

  const segmentCache = new Map();

  function toStr(value) {
    return value == null ? '' : String(value);
  }

  // 一个义项是否整词包含另一个：中日韩按子串，拉丁字母按单词边界
  // （"search" ⊂ "search for" 算同义，"book" ⊄ "cookbook"）
  function containsSense(longer, shorter) {
    if (!shorter || !longer) return false;
    if (CJK.test(shorter)) return shorter.length >= 2 && longer.indexOf(shorter) !== -1;
    if (shorter.length < 3) return false;
    const idx = longer.indexOf(shorter);
    if (idx === -1) return false;
    const before = idx === 0 ? '' : longer.charAt(idx - 1);
    const after = longer.charAt(idx + shorter.length);
    return !WORD_CHAR.test(before) && !WORD_CHAR.test(after);
  }

  /**
   * cleanGloss 专用切分：把释义切成 { parts, seps }。
   * parts[i] 是原文片段（**保留原始空白**），seps[i] 是 parts[i] 与 parts[i+1]
   * 之间的原始分隔符，两者交错拼回去 === 原字符串，所以重建可以做到逐字节还原。
   * 括号 / 方括号 / 中文括号内部的分隔符不算分隔符。
   */
  function splitGlossPreservingSeparators(raw) {
    const parts = [];
    const seps = [];
    let depth = 0;
    let current = '';
    for (let i = 0; i < raw.length; i++) {
      const ch = raw.charAt(i);
      if (BRACKET_OPENERS.indexOf(ch) !== -1) { depth++; current += ch; continue; }
      if (BRACKET_CLOSERS.indexOf(ch) !== -1) { if (depth > 0) depth--; current += ch; continue; }
      if (depth === 0 && GLOSS_SEPARATOR_CHARS.indexOf(ch) !== -1) {
        parts.push(current);
        seps.push(ch);
        current = '';
        continue;
      }
      current += ch;
    }
    parts.push(current);
    return { parts, seps };
  }

  /**
   * cleanGloss 只删「编号占位义项」：带括号的 "(2)" / "（三）" / "[2]" / "【二】"。
   *
   * 裸数字片段（"二十"、"十"、"一"、"15"）在真实数据里全是**真释义** ——
   * score = "…,二十,…"、ein = "一, 一个, 某人, 某物"、quindici = "15" ——
   * 删掉它们就是在改写词义；空片段（"n.技能,,技巧" 里的那个）删掉也会改写原文。
   * 意大利语里真正的占位残留（506 处）无一例外都是 "(2)" / "(3)" 这种带括号的编号。
   */
  function isNumberedPlaceholder(segment) {
    const trimmed = toStr(segment).trim();
    if (!trimmed) return false;                  // 空片段保留原样
    if (!ANY_BRACKET.test(trimmed)) { ANY_BRACKET.lastIndex = 0; return false; }
    ANY_BRACKET.lastIndex = 0;                   // /g 正则有状态，必须复位
    return DimText.isPlaceholderSegment(trimmed);
  }

  /** 纯 CJK 词（"赢赢赢赢" 的折叠只对中文成立，"Bonbon" 这类拉丁词形不碰） */
  const PURE_CJK = /^[\u4e00-\u9fff]+$/;

  /**
   * 纯 CJK 词自身重复 → 最小重复单元："赢赢赢赢" → "赢"、"奶油奶油" → "奶油"。
   * 单字恰好重复两次（AA 型：妈妈、谢谢、常常、猩猩）一律保留 —— 这类
   * 叠词在中文里极常见，运行时没有词表可以区分真词与机翻垃圾（"臂臂"），
   * 垃圾 AA 由数据层（scripts/clean_italian_glosses.py 的 LEGIT_AA）处理。
   */
  function collapseCjkRepeat(word) {
    if (!PURE_CJK.test(word)) return word;
    const n = word.length;
    for (let unit = 1; unit <= n / 2; unit++) {
      if (n % unit) continue;
      if (word.slice(0, unit).repeat(n / unit) === word) {
        return (unit === 1 && n === 2) ? word : word.slice(0, unit);
      }
    }
    return word;
  }

  /**
   * 展示兜底：折叠相邻重复 token（"road road" → "road"）。
   * 只在确实存在重复时才返回新串，否则逐字节返回原文。
   * 注意这是「相邻重复」级别的保守兜底 —— 对半重复（"High school high
   * school"）在这里看起来是 "school"/"high" 相邻，不匹配，由数据层清洗负责。
   */
  function collapseRepeatedTokens(text) {
    const pieces = text.split(/(\s+)/);
    const out = [];
    let lastWord = '';
    let changed = false;
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (!piece) continue;
      if (/^\s+$/.test(piece)) { out.push(piece); continue; }
      const word = collapseCjkRepeat(piece);
      if (word !== piece) changed = true;
      if (lastWord && word.toLowerCase() === lastWord.toLowerCase()) {
        // 丢掉重复词（连同它前面的那段空白），保留首次出现的写法
        while (out.length && /^\s+$/.test(out[out.length - 1])) out.pop();
        lastWord = word;
        changed = true;
        continue;
      }
      out.push(word);
      lastWord = word;
    }
    return changed ? out.join('') : text;
  }

  const DimenticatoUtils = {
    /**
     * HTML 转义 — 防止 XSS 攻击
     * 用于所有插入 innerHTML 的用户数据
     */
    escapeHtml(value) {
      return (value == null ? '' : String(value))
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * HTML 属性值转义
     */
    escapeAttribute(value) {
      return this.escapeHtml(value).replace(/`/g, '&#96;');
    },

    /**
     * 渲染 SVG 图标
     */
    renderIcon(name) {
      return '<svg class="icon"><use href="#' + this.escapeAttribute(name) + '"></use></svg>';
    },

    /** Fisher–Yates 洗牌，返回新数组（不改原数组）。 */
    shuffleArray(list) {
      const a = Array.prototype.slice.call(list || []);
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },

    /**
     * 防抖：wait 毫秒内的连续调用只执行最后一次。
     * 用于搜索框 input 这类高频事件（大词表整表重渲染不能每键一次）。
     */
    debounce(fn, wait) {
      let timer = null;
      return function () {
        const args = arguments;
        const self = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          timer = null;
          fn.apply(self, args);
        }, wait);
      };
    }
  };

  /**
   * ===== deferredPersist：可冲刷的延迟持久化 =====
   *
   * 每答一题就把整个 mastered 数组 + stats JSON.stringify 一遍写进 localStorage，
   * 在词库上万后会卡顿（German 一题 7 次 setItem、French 最多 8 次）。
   * 这里把「状态已改」和「真正序列化落盘」解耦：改动只标记脏，wait 毫秒内
   * 合并成一次写；页面关闭（pagehide / 切后台）前统一 flush，进度不丢。
   *
   * 返回的包装函数带 .flush()，可在导出 / 重置等「必须立即一致」的路径上手动冲刷；
   * flushAllPersisters() 冲刷全部实例（关闭页时自动调用）。
   */
  const persisters = [];
  let flushHookInstalled = false;

  function installFlushHook() {
    if (flushHookInstalled) return;
    flushHookInstalled = true;
    var flushAll = function () {
      for (var i = 0; i < persisters.length; i++) {
        try { persisters[i].flush(); } catch (err) { /* 单个失败不连累其余 */ }
      }
    };
    // pagehide 覆盖常规关闭/跳转；visibilitychange→hidden 兜底移动端切后台
    // （部分移动浏览器不派发 pagehide，反之 iOS 的 pagehide 比 unload 可靠）
    window.addEventListener('pagehide', flushAll);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flushAll();
    });
  }

  function deferredPersist(fn, wait) {
    var timer = null;
    var dirty = false;
    function run() {
      if (!dirty) return;
      dirty = false;
      fn();
    }
    var wrapped = function () {
      dirty = true;
      if (timer) return;
      timer = setTimeout(function () {
        timer = null;
        run();
      }, wait || 500);
    };
    wrapped.flush = function () {
      if (timer) { clearTimeout(timer); timer = null; }
      run();
    };
    persisters.push(wrapped);
    installFlushHook();
    return wrapped;
  }

  /**
   * ===== DimText：全站共享的文本归一化 =====
   *
   * 重音处理必须显式选择，不能默认抹掉：
   *   foldAccents()  —— 抹掉重音（ou == où），只用于"宽松比较"（拼写判分、搜索）
   *   headwordKey()  —— 保留重音（ou != où），用于词条去重 / 建索引
   * 法语里重音区分词义（ou/où、la/là、a/à），用抹重音的 key 去重会直接删掉 A1 词。
   */
  const DimText = {
    /** 抹掉重音符号（NFD 分解后移除组合记号） */
    foldAccents(value) {
      return toStr(value).normalize('NFD').replace(COMBINING_MARKS, '');
    },

    /**
     * 通用归一化。
     * @param {string} value
     * @param {Object} [options]
     * @param {boolean} [options.fold=false]      抹掉重音（默认保留）
     * @param {boolean} [options.lower=true]      转小写
     * @param {boolean} [options.collapse=true]   合并空白并 trim
     * @param {boolean} [options.punctuation=true] 统一排版符号（弯引号、长破折号、连字）
     */
    normalizeText(value, options) {
      const opts = options || {};
      let text = toStr(value);
      text = opts.fold ? DimText.foldAccents(text) : text.normalize('NFC');
      if (opts.punctuation !== false) {
        text = text.replace(APOSTROPHES, "'").replace(HYPHENS, '-')
          .replace(/œ/g, 'oe').replace(/Œ/g, 'OE')
          .replace(/æ/g, 'ae').replace(/Æ/g, 'AE');
      }
      if (opts.lower !== false) text = text.toLowerCase();
      if (opts.collapse !== false) text = text.replace(WHITESPACE, ' ').trim();
      return text;
    },

    /**
     * 词条去重 key —— **保留重音**。
     * 只统一大小写、排版符号与空白，所以 ou / où、la / là 仍是两个词条。
     */
    headwordKey(value) {
      return DimText.normalizeText(value, { fold: false });
    },

    /**
     * 宽松比较 key —— **抹掉重音**。
     * 用于拼写模式判分与搜索框（用户可以不打重音）。
     */
    looseKey(value) {
      return DimText.normalizeText(value, { fold: true });
    },

    /** 两个词条是否是同一个词（保留重音的严格比较） */
    sameHeadword(a, b) {
      const ka = DimText.headwordKey(a);
      return !!ka && ka === DimText.headwordKey(b);
    },

    /** 释义片段是否是占位残留（"(2)"、"（三）"、空串） */
    isPlaceholderSegment(segment) {
      const raw = toStr(segment).trim();
      if (!raw) return true;
      // 只脱掉最外层括号，"（阴性定冠词）" 是真释义，"（二）" 才是占位符
      const bare = raw.replace(OUTER_BRACKETS, '').replace(WHITESPACE, ' ').trim();
      if (!bare) return true;
      return PLACEHOLDER_SEGMENT.test(bare);
    },

    /**
     * 把一条释义拆成归一化后的义项集合（去重音、小写、去括号说明、去词性前缀）。
     * 用于判断两个释义是不是同一个意思。
     */
    glossSegments(value) {
      const raw = toStr(value);
      if (!raw) return [];
      const cached = segmentCache.get(raw);
      if (cached) return cached;

      const out = [];
      const seen = Object.create(null);
      raw.split(GLOSS_SEPARATORS).forEach(function (part) {
        if (DimText.isPlaceholderSegment(part)) return;
        let seg = part.replace(PARENTHETICALS, ' ');
        // 整段都是括号说明时（"（阴性定冠词）"），用括号内的文字作为义项
        if (!seg.trim()) seg = part.replace(ANY_BRACKET, ' ');
        seg = DimText.normalizeText(seg, { fold: true });
        seg = seg.replace(POS_PREFIX, '').replace(LEADING_TO, '');
        seg = seg.replace(TRIM_PUNCTUATION, '').trim();
        if (!seg || PLACEHOLDER_SEGMENT.test(seg)) return;
        if (seen[seg]) return;
        seen[seg] = true;
        out.push(seg);
      });

      if (segmentCache.size > 20000) segmentCache.clear();
      segmentCache.set(raw, out);
      return out;
    },

    /** 整条释义是否只剩占位符（没有任何可用义项） */
    isPlaceholderGloss(value) {
      return DimText.glossSegments(value).length === 0;
    },

    /**
     * 展示用清洗：删掉 "(2)" / "（三）" 这类编号占位义项 + 折叠相邻重复 token。
     *
     * 非破坏性是硬要求 —— 这条函数在四种语言的每个选项文字和
     * "回答有误，正确答案是：" 横幅上都会跑一遍：
     *   - 括号 / 方括号 / 中文括号内部绝不切分（"star (TV/music)"、"[数、物]"）
     *   - 保留的义项之间用**原来的**分隔符重新拼回去，不统一成 "; "
     *   - 裸数字义项（score 的 "二十"、ein 的 "一"）和空片段一律保留
     *   - 没有编号占位义项时逐字节返回原文
     * 不改变数据本身 —— 判分仍使用原始字符串。
     *
     * 重复折叠是数据管线（scripts/clean_italian_glosses.py）的运行时兜底：
     * 机翻残留 "road road" / "赢赢赢赢" 这类重复不该出现在选项里。
     * 自定义词本也可能带进同样的垃圾。对半重复（"High school high school"）
     * 只在数据层处理，这里只折叠相邻重复与整词重复的纯 CJK 词，
     * 保证 "n.[数、物]常数" 这类真实释义一个字不动。
     */
    cleanGloss(value) {
      const raw = toStr(value);
      if (!raw.trim()) return '';
      const split = splitGlossPreservingSeparators(raw);
      const parts = split.parts;
      const seps = split.seps;

      const keep = [];
      let dropped = 0;
      for (let i = 0; i < parts.length; i++) {
        if (isNumberedPlaceholder(parts[i])) dropped++;
        else keep.push(i);
      }
      if (!keep.length) return raw.trim();   // 全是占位符时退回原文，避免空选项
      // 没有任何占位义项 —— 编号层面一个字都不动。"(一)双"、"star (TV/music)" 原样。
      if (!dropped) return collapseRepeatedTokens(raw);

      let out = '';
      for (let n = 0; n < keep.length; n++) {
        const i = keep[n];
        // 这条释义确实带占位编号，同一套编号的 "(三) 国家" 也一并去掉标记
        const lead = LEADING_SPACE.exec(parts[i])[0];
        const body = parts[i].slice(lead.length).replace(NUMBERED_PREFIX, '');
        if (n > 0) out += seps[i - 1];   // 用紧挨着本义项的那个原始分隔符
        out += lead + body;
      }
      return collapseRepeatedTokens(out.trim());
    },

    /** 两条释义是否共享义项（用于剔除"和正确答案同义"的干扰项） */
    glossesOverlap(a, b) {
      const segsA = DimText.glossSegments(a);
      const segsB = DimText.glossSegments(b);
      if (!segsA.length || !segsB.length) return false;
      for (let i = 0; i < segsA.length; i++) {
        for (let j = 0; j < segsB.length; j++) {
          if (segsA[i] === segsB[j]) return true;
          // 近似重复：一个义项被另一个整词包含（"search" ⊂ "search for"）
          const longer = segsA[i].length >= segsB[j].length ? segsA[i] : segsB[j];
          const shorter = segsA[i].length >= segsB[j].length ? segsB[j] : segsA[i];
          if (containsSense(longer, shorter)) return true;
        }
      }
      return false;
    },

    /**
     * 两条释义是否表达同一个意思（义项集合相等或互为子集）。
     * 判分时用：tu / voi 都是 "you"，选任何一个都不该判错。
     */
    sameMeaning(a, b) {
      const segsA = DimText.glossSegments(a);
      const segsB = DimText.glossSegments(b);
      if (!segsA.length || !segsB.length) return DimText.looseKey(a) === DimText.looseKey(b);
      const setB = Object.create(null);
      segsB.forEach(function (s) { setB[s] = true; });
      const setA = Object.create(null);
      segsA.forEach(function (s) { setA[s] = true; });
      const aInB = segsA.every(function (s) { return setB[s]; });
      const bInA = segsB.every(function (s) { return setA[s]; });
      return aInB || bInA;
    },

    /** 供测试使用：清空义项缓存 */
    _clearCache() { segmentCache.clear(); }
  };

  DimenticatoUtils.text = DimText;

  // 「哪一天」一律按本地时区算。toISOString() 是 UTC：在东八区早上 8 点前做的练习
  // 会记到前一天，连续天数和复习到期日都会错一天。
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  /** Date（默认现在）→ 本地日期 'YYYY-MM-DD' */
  DimenticatoUtils.localDay = function (date) {
    var d = date || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  };
  /** 'YYYY-MM-DD' → 本地零点的 Date（new Date('YYYY-MM-DD') 会按 UTC 解析，西半球差一天） */
  DimenticatoUtils.parseLocalDay = function (str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(str || ''));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(NaN);
  };

  /** 把一段文本存成本地文件（导出备份 / 词本）。 */
  DimenticatoUtils.download = function (name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // 立刻 revoke 在部分浏览器里会让下载拿到空文件
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  /**
   * 朗读（Web Speech API）。全站唯一实现：
   *   Speaker.speak(text, lang)  lang 接受 code 或旧语言 key；不传取当前语言。
   * 声音列表在 voiceschanged 之后才完整，首次 speak 时自动 init。
   */
  var Speaker = {
    voices: [],
    _ready: false,
    init: function () {
      var synth = window.speechSynthesis;
      if (!synth || this._ready) return;
      this._ready = true;
      var self = this;
      var load = function () { self.voices = synth.getVoices() || []; };
      load();
      if (synth.addEventListener) synth.addEventListener('voiceschanged', load);
    },
    speak: function (text, lang) {
      var synth = window.speechSynthesis;
      if (!synth || !text || typeof SpeechSynthesisUtterance === 'undefined') return;
      var L = window.Languages;
      var active = typeof window.getActiveLanguage === 'function' ? window.getActiveLanguage() : null;
      var p = L && (L.get(lang) || L.get(active) || L.get(L.DEFAULT));
      if (!p) return;
      this.init();
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = p.tts;
      u.rate = 0.9; // 稍慢，便于跟读
      var voice = this.voices.find(function (v) { return p.voice.test(v.lang); });
      if (voice) u.voice = voice;
      synth.speak(u);
    }
  };
  DimenticatoUtils.Speaker = Speaker;

  // 暴露到全局，保持向后兼容
  window.DimenticatoUtils = DimenticatoUtils;
  window.Speaker = Speaker;
  window.downloadFile = DimenticatoUtils.download;
  window.DimText = DimText;
  window.escapeHtml = DimenticatoUtils.escapeHtml.bind(DimenticatoUtils);
  window.escapeAttribute = DimenticatoUtils.escapeAttribute.bind(DimenticatoUtils);
  window.renderIcon = DimenticatoUtils.renderIcon.bind(DimenticatoUtils);
  window.debounce = DimenticatoUtils.debounce;
  window.shuffleArray = DimenticatoUtils.shuffleArray;
  window.localDay = DimenticatoUtils.localDay;
  window.parseLocalDay = DimenticatoUtils.parseLocalDay;
  window.deferredPersist = deferredPersist;
  DimenticatoUtils.deferredPersist = deferredPersist;
  DimenticatoUtils.flushAllPersisters = function () {
    for (var i = 0; i < persisters.length; i++) persisters[i].flush();
  };
})();
