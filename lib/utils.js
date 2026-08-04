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
  const NUMBERED_PREFIX = /^\s*[(（]\s*(?:\d+|[一二三四五六七八九十百]+)\s*[)）]\s*/;
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
    }
  };

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
     * 展示用清洗：删掉 "(2)" / "（三）" 这类占位义项，保留原始大小写与括号说明。
     * 不改变数据本身 —— 判分仍使用原始字符串。
     */
    cleanGloss(value) {
      const raw = toStr(value);
      if (!raw) return '';
      const kept = [];
      // 手动切分以保留原始分隔符前后的文本
      raw.split(/([;；,，、/／|｜])/).forEach(function (chunk, index) {
        if (index % 2 === 1) return; // 分隔符
        if (DimText.isPlaceholderSegment(chunk)) return;
        // 去掉义项前的编号标记："(三) 国家" -> "国家"
        const trimmed = chunk.replace(NUMBERED_PREFIX, '').trim();
        if (trimmed) kept.push(trimmed);
      });
      if (!kept.length) return raw.trim();  // 全是占位符时退回原文，避免空选项
      return kept.join('; ');
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

  // 暴露到全局，保持向后兼容
  window.DimenticatoUtils = DimenticatoUtils;
  window.DimText = DimText;
  window.escapeHtml = DimenticatoUtils.escapeHtml.bind(DimenticatoUtils);
  window.escapeAttribute = DimenticatoUtils.escapeAttribute.bind(DimenticatoUtils);
  window.renderIcon = DimenticatoUtils.renderIcon.bind(DimenticatoUtils);
})();
