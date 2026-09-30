/**
 * Vocabulary access — one API over every data/vocab/<code>.js (schema v1).
 *
 * The runtime never reads language-specific fields: an entry is
 * { word, display?, pos?, gender?, level, rank, zh, zhAlt?, en?, forms?, tags? }
 * for every language (docs/vocab-schema.md).  Personal / community wordbook
 * words are adapted into the same shape by fromWordbookWord().
 */
(function (global) {
  'use strict';

  var LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  var POS_LABEL = {
    noun: '名词', properNoun: '专名', verb: '动词', adjective: '形容词', adverb: '副词',
    pronoun: '代词', determiner: '限定词', article: '冠词', preposition: '介词',
    conjunction: '连词', numeral: '数词', interjection: '感叹词', particle: '小品词',
    prefix: '前缀', suffix: '后缀', phrase: '短语', abbreviation: '缩写'
  };
  var GENDER_LABEL = { m: '阳性', f: '阴性', n: '中性' };

  function store() { return global.DIM_VOCAB || {}; }
  function codeOf(lang) {
    var L = global.Languages;
    return (L && L.code(lang)) || lang;
  }

  // ── text folding ────────────────────────────────────────────────────────
  function foldText(value) {
    return String(value == null ? '' : value)
      .normalize('NFC')
      .replace(/[‘’ʼ´`]/g, "'")
      .replace(/[‐-―]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function stripAccents(value) {
    return String(value == null ? '' : value).normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  /** Case-, œ/æ- and whitespace-folded key that keeps accents. */
  function headKey(value) {
    return foldText(value).toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae');
  }
  /** Accent-free key: search, near-miss detection, legacy key resolution. */
  function looseKey(value) {
    return stripAccents(headKey(value)).replace(/[^\p{L}\p{N}' -]/gu, '');
  }
  /** Spelling key: keeps accents, tolerates apostrophe / hyphen / space variants. */
  function spellKey(value) {
    return headKey(value).replace(/\s*'\s*/g, "'").replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  }
  /** German: ä→ae … ß→ss, separable-verb slash and spaces ignored. */
  function germanKey(value, keepCase) {
    var base = String(value || '').trim();
    return (keepCase ? base : base.toLowerCase())
      .replace(/\s+/g, '').replace(/\//g, '')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
      .replace(/ß/g, 'ss').normalize('NFC');
  }
  function plainKey(value) {
    return stripAccents(String(value == null ? '' : value).trim().toLowerCase());
  }

  // ── per-language indexes (built lazily, once per data object) ───────────
  var cache = {};
  function indexFor(code) {
    var data = store()[code];
    if (!data) return null;
    var c = cache[code];
    if (c && c.data === data) return c;
    var byWord = new Map();
    var byGloss = new Map();
    data.entries.forEach(function (e) {
      byWord.set(e.word, e);
      var g = String(e.zh || '').trim();
      if (!g) return;
      var group = byGloss.get(g);
      if (group) group.push(e); else byGloss.set(g, [e]);
    });
    c = cache[code] = { data: data, byWord: byWord, byGloss: byGloss, legacy: null };
    return c;
  }

  var Vocab = {
    LEVELS: LEVELS,
    POS_LABEL: POS_LABEL,
    GENDER_LABEL: GENDER_LABEL,
    foldText: foldText,
    looseKey: looseKey,

    ready: function (lang) { return !!store()[codeOf(lang)]; },
    meta: function (lang) { var d = store()[codeOf(lang)]; return d ? d.meta : null; },
    entries: function (lang) { var d = store()[codeOf(lang)]; return d ? d.entries : []; },
    find: function (lang, word) {
      var idx = indexFor(codeOf(lang));
      return idx ? idx.byWord.get(word) || null : null;
    },

    /** Entries up to and including maxLevel ('all' / falsy = everything). */
    upToLevel: function (lang, maxLevel) {
      var list = this.entries(lang);
      var cut = LEVELS.indexOf(maxLevel);
      if (cut < 0) return list;
      return list.filter(function (e) { return LEVELS.indexOf(e.level) <= cut; });
    },
    atLevel: function (lang, level) {
      return this.entries(lang).filter(function (e) { return e.level === level; });
    },
    levelCounts: function (lang) {
      var counts = {};
      LEVELS.forEach(function (l) { counts[l] = 0; });
      this.entries(lang).forEach(function (e) { counts[e.level] = (counts[e.level] || 0) + 1; });
      return counts;
    },
    withTag: function (lang, tag) {
      return this.entries(lang).filter(function (e) { return e.tags && e.tags.indexOf(tag) >= 0; });
    },

    // ── presentation ──────────────────────────────────────────────────────
    headword: function (e) { return (e && (e.display || e.word)) || ''; },
    /** Short grammatical line: "名词 · 阴性 · 复数 Häuser". */
    grammarLine: function (e) {
      if (!e) return '';
      var parts = [];
      if (e.pos && POS_LABEL[e.pos]) parts.push(POS_LABEL[e.pos]);
      if (e.gender) parts.push(e.gender.split('/').map(function (g) { return GENDER_LABEL[g] || g; }).join('/'));
      var f = e.forms || {};
      if (f.pluraleTantum) parts.push('仅复数');
      else if (f.plural) parts.push('复数 ' + f.plural);
      if (f.feminine) parts.push('阴性 ' + f.feminine);
      if (f.principalParts) parts.push(f.principalParts);
      if (f.pronominal) parts.push('代词式');
      return parts.join(' · ');
    },
    /** Extra usage hints: construction, government, other senses, notes. */
    usageLine: function (e) {
      if (!e) return '';
      var parts = [];
      var f = e.forms || {};
      if (f.construction) parts.push('搭配：' + f.construction);
      if (f.government) parts.push('支配：' + f.government);
      if (e.zhAlt && e.zhAlt.length) parts.push('另义：' + e.zhAlt.join('；'));
      if (e.notes) parts.push(e.notes);
      return parts.join(' · ');
    },

    // ── spelling ─────────────────────────────────────────────────────────
    acceptedForms: function (e) {
      if (!e) return [];
      var f = e.forms || {};
      var forms = [e.word];
      if (e.display && e.display !== e.word) forms.push(e.display);
      if (f.feminine) forms.push(f.feminine);
      if (f.variants) forms = forms.concat(f.variants);
      return forms.filter(Boolean);
    },
    /** Other entries sharing this exact Chinese gloss (spelling cannot tell them apart). */
    glossTwins: function (lang, e) {
      var idx = indexFor(codeOf(lang));
      if (!idx || !e) return [];
      var group = idx.byGloss.get(String(e.zh || '').trim()) || [];
      return group.filter(function (x) { return x !== e && x.word !== e.word; });
    },
    /**
     * Grades a typed answer.  Returns { status, twin?, note? } where status is
     *   'correct' – counts as correct (note may carry a case / twin remark)
     *   'accent'  – right letters, wrong accents (French only; not counted)
     *   'wrong'
     * Flavours come from the language profile (lib/languages.js `spell`).
     */
    gradeSpelling: function (lang, answer, e) {
      var profile = global.Languages ? global.Languages.get(lang) : null;
      var flavour = (profile && profile.spell) || 'plain';
      var given = String(answer || '').trim();
      if (!given || !e) return { status: 'wrong' };
      var forms = this.acceptedForms(e);
      var self = this;

      if (flavour === 'german') {
        var loose = germanKey(given);
        var hit = forms.some(function (f) { return germanKey(f) === loose; });
        if (!hit) return { status: 'wrong' };
        var exact = forms.some(function (f) { return germanKey(f, true) === germanKey(given, true); });
        return exact ? { status: 'correct' } : { status: 'correct', note: '注意大小写：' + this.headword(e) };
      }
      if (flavour === 'french') {
        var key = spellKey(given);
        if (forms.some(function (f) { return spellKey(f) === key; })) return { status: 'correct' };
        var twin = this.glossTwins(lang, e).find(function (x) {
          return self.acceptedForms(x).some(function (f) { return spellKey(f) === key; });
        });
        if (twin) return { status: 'correct', twin: twin, note: '也对：同一释义的另一种说法 ' + twin.word };
        var lk = looseKey(given);
        if (forms.some(function (f) { return looseKey(f) === lk; })) return { status: 'accent' };
        return { status: 'wrong' };
      }
      var pk = plainKey(given);
      return forms.some(function (f) { return plainKey(f) === pk; }) ? { status: 'correct' } : { status: 'wrong' };
    },

    // ── wordbooks ───────────────────────────────────────────────────────
    /**
     * Personal / community wordbook rows are { <langKey>|word, zh|chinese|meaning,
     * en|english?, notes? } (lib/wordbooks.js normalizes to zh/en; older saves
     * use chinese/english).  For English books `english` is the headword, not a gloss.
     * Returns a v1-shaped entry (rank/level absent).
     */
    fromWordbookWord: function (row, lang) {
      if (!row || typeof row !== 'object') return null;
      var key = global.Languages ? global.Languages.key(lang) : lang;
      var word = String(row.word || row[key] || row.italian || '').trim();
      if (!word) return null;
      var en = String(row.en || (key === 'english' ? '' : row.english) || '').trim();
      var zh = String(row.zh || row.chinese || row.meaning || en || '').trim();
      var entry = { word: word, zh: zh || '—', wordbook: true };
      if (en && en !== zh) entry.en = en;
      if (row.notes) entry.notes = String(row.notes);
      var system = this.find(lang, word);
      if (system) {
        ['display', 'pos', 'gender', 'level', 'forms'].forEach(function (f) {
          if (system[f] != null) entry[f] = system[f];
        });
        if (!zh) entry.zh = system.zh;
      }
      return entry;
    },

    // ── legacy progress keys ────────────────────────────────────────────
    /**
     * Maps a mastered / SRS key written by an earlier version (German ids
     * like "de-03000", French headwords with parenthesised variants, keys
     * that lost their accents) to the current entry.word.  '' when unknown.
     */
    resolveLegacyKey: function (lang, key) {
      var raw = String(key == null ? '' : key).trim();
      if (!raw) return '';
      var idx = indexFor(codeOf(lang));
      if (!idx) return '';
      if (idx.byWord.has(raw)) return raw;
      if (!idx.legacy) {
        var ids = new Map();
        var exact = new Map();
        var loose = new Map();
        var add = function (map, k, word) { if (k && !map.has(k)) map.set(k, word); };
        idx.data.entries.forEach(function (e) {
          if (e.legacyId) ids.set(e.legacyId, e.word);
          add(exact, headKey(e.word), e.word);
          add(loose, looseKey(e.word), e.word);
        });
        idx.data.entries.forEach(function (e) {
          Vocab.acceptedForms(e).forEach(function (f) {
            add(exact, headKey(f), e.word);
            add(loose, looseKey(f), e.word);
          });
        });
        idx.legacy = { ids: ids, exact: exact, loose: loose };
      }
      var L = idx.legacy;
      if (L.ids.has(raw)) return L.ids.get(raw);
      // "Bank·长凳" (German homographs) / "acteur(trice)" (French textbook headwords)
      var base = raw.split('·')[0].replace(/\s*\([^)]*\)\s*$/, '').trim();
      var candidates = [raw, base];
      for (var i = 0; i < candidates.length; i += 1) {
        var h = L.exact.get(headKey(candidates[i]));
        if (h) return h;
      }
      for (var j = 0; j < candidates.length; j += 1) {
        var l = L.loose.get(looseKey(candidates[j]));
        if (l) return l;
      }
      return '';
    }
  };

  global.Vocab = Vocab;
})(typeof window !== 'undefined' ? window : globalThis);
