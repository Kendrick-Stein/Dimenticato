/**
 * FrenchApp — French vocabulary, grammar, conjugation and progress portal.
 * Screens are installed as one self-contained module so the legacy index.html
 * remains readable while the French experience mirrors German and English.
 */
(function () {
  'use strict';

  const STORAGE_KEYS = {
    MASTERED: 'dimenticato_french_mastered',
    STATS: 'dimenticato_french_stats',
    FILTER: 'dimenticato_french_filter',
    LEVEL: 'dimenticato_french_level',
    SESSION: 'dimenticato_french_session',
    DAILY: 'dimenticato_french_daily',
    SRS: 'dimenticato_french_srs'
  };

  // 核心词库（Lexique 3.83）里 C1 有 6,829 条、C2 有 10,456 条，占系统词库的 70%。
  // 这里原本只列到 B2，那些词只能在「全部」下出现，没有任何等级筛选够得着。
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const SESSION_SIZES = [20, 50, 100, 0];
  const DAILY_HISTORY_DAYS = 60;
  const SHARED_SCREENS = new Set([
    'grammarBookScreen',
    'conjugationSetupScreen',
    'conjugationScreen',
    'communityBrowseScreen',
    'verbCollocationsScreen',
    'verbCollocationPracticeScreen'
  ]);

  // ==================== 文本归一化 ====================
  // 法语的重音是区别性的（ou / où、la / là、sur / sûr），因此词条去重与
  // 拼写判分都保留重音；只统一排版差异（撇号、连字符、œ 连写、空白）。

  const stripAccents = value => String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  function foldText(value) {
    return String(value == null ? '' : value)
      .normalize('NFC')
      .replace(/[\u2018\u2019\u02bc\u00b4`]/g, "'")
      .replace(/[\u2010-\u2015]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 词条去重键：保留重音，折叠 œ/æ 与大小写（sœur = soeur、Internet = internet）
  function headwordKey(value) {
    return foldText(value)
      .toLowerCase()
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae');
  }

  // 去重音的宽松键，只用于“差一点”提示与词形推导校验，不用于判分
  function looseKey(value) {
    return stripAccents(headwordKey(value)).replace(/[^a-z0-9' -]/g, '');
  }

  // 拼写判分键：保留重音，容忍撇号写法、连字符与空格的差异
  function spellKey(value) {
    return headwordKey(value)
      .replace(/\s*'\s*/g, "'")
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ==================== 词条解析 ====================
  // 教材词汇表把阴性/变体写进词头（acteur(trice)、ami(e)、cher(ère)），
  // 也把动词的介词搭配写进括号（répondre(à)）。这里拆成
  // { french 基本形（作答案）, variant 变体形, construction 搭配, display 展示 }。

  const COMPLEMENT_MARKERS = new Set([
    'à', 'de', "d'", 'que', "qu'", 'qn', 'qch',
    'à qn', 'à qch', 'de qn', 'de qch', 'avec qn', 'avec qch'
  ]);
  const ARTICLE_MARKERS = new Set(['la', 'les', "l'"]);
  const TRAILING_NOISE = /^(n|m|f|pl|adi|adj|adv)$/i;

  // 常见阴性构词规则；命中后仍需通过“结尾必须等于括号内容”的校验
  const FEMININE_RULES = [
    { end: /teur$/, make: base => base.replace(/teur$/i, 'trice') },
    { end: /eur$/, make: base => base.replace(/eur$/i, 'euse') },
    { end: /er$/, make: base => base.replace(/er$/i, 'ère') },
    { end: /if$/, make: base => base.replace(/if$/i, 'ive') },
    { end: /f$/, make: base => base.replace(/f$/i, 've') },
    { end: /x$/, make: base => base.replace(/x$/i, 'se') },
    { end: /(ien|een|en|on|an)$/, make: base => base + 'ne' },
    { end: /(el|ul|eil)$/, make: base => base + 'le' },
    { end: /et$/, make: base => base.replace(/et$/i, 'ète') },
    { end: /et$/, make: base => base + 'te' },
    { end: /(at|ot|ut)$/, make: base => base + 'te' },
    { end: /(as|os)$/, make: base => base + 'se' },
    { end: /c$/, make: base => base.replace(/c$/i, 'que') },
    { end: /g$/, make: base => base + 'ue' },
    { end: /./, make: base => base + 'e' }
  ];

  function deriveVariant(base, suffix) {
    const wanted = looseKey(suffix);
    if (!wanted) return '';
    const baseLoose = looseKey(base);
    // 最常见的写法 xxx(e)：直接加 e
    if (wanted === 'e') return /e$/i.test(base) ? '' : base + suffix;
    // 括号内是完整的另一个词（copain(copine)）
    if (wanted.length >= 4 && baseLoose.slice(0, 3) === wanted.slice(0, 3)) return suffix;

    const candidates = [];
    const endTest = stripAccents(base).toLowerCase();
    FEMININE_RULES.forEach(rule => {
      if (rule.end.test(endTest)) candidates.push(rule.make(base));
    });
    candidates.push(base + suffix);
    for (let cut = 1; cut <= 4 && cut < base.length; cut++) {
      candidates.push(base.slice(0, base.length - cut) + suffix);
    }
    for (const candidate of candidates) {
      const loose = looseKey(candidate);
      if (!loose || loose === baseLoose) continue;
      if (candidate.length - base.length > suffix.length) continue;
      if (loose.endsWith(wanted)) return candidate;
    }
    return base + suffix;
  }

  function parseHeadword(raw) {
    const text = foldText(raw);
    const result = { french: text, display: text, variant: '', construction: '', accepted: [text] };
    if (!text) return result;

    if (!text.includes('(')) {
      const slash = /^([^/]+?)\s*\/\s*([^/]+)$/.exec(text);
      if (slash) {
        result.french = slash[1].trim();
        result.variant = slash[2].trim();
        result.display = `${result.french} / ${result.variant}`;
        result.accepted = [result.french, result.variant];
      }
      return result;
    }

    const match = /^(.*?)\s*\(([^)]*)\)\s*(.*)$/.exec(text);
    if (!match) return result;

    const head = match[1].trim();
    const inner = match[2].trim();
    let tail = match[3].trim();
    if (TRAILING_NOISE.test(tail)) tail = ''; // OCR 残留：Italien(ne)n、tolérant(e)adi
    if (!head) return result;

    // petit(-)déjeuner：连字符可有可无
    if (!inner || inner === '-') {
      const spaced = tail ? `${head} ${tail}` : head;
      const joined = tail ? `${head}-${tail}` : head;
      result.french = spaced;
      result.display = spaced;
      result.variant = joined === spaced ? '' : joined;
      result.accepted = [spaced, joined, text];
      return result;
    }

    if (tail) {
      const withTail = `${head} ${tail}`;
      result.french = withTail;
      result.display = `${head}(${inner}) ${tail}`;
      result.accepted = [withTail, `${head}${inner} ${tail}`, text];
      return result;
    }

    const lowerInner = inner.toLowerCase();
    if (COMPLEMENT_MARKERS.has(lowerInner) || /\b(qn|qch)\b/.test(lowerInner)) {
      result.french = head;
      result.construction = inner;
      result.display = `${head} (${inner})`;
      result.accepted = [head, `${head} ${inner}`];
      return result;
    }
    if (ARTICLE_MARKERS.has(lowerInner)) {
      result.french = head;
      result.construction = inner;
      result.display = `${inner} ${head}`;
      result.accepted = [head, `${inner} ${head}`];
      return result;
    }

    const variant = deriveVariant(head, inner);
    result.french = head;
    result.variant = variant;
    result.display = variant ? `${head} (${variant})` : head;
    result.accepted = [head, variant, text].filter(Boolean);
    return result;
  }

  // ==================== 备注解析 ====================

  const LEVEL_PATTERN = /^(A1|A2|B1|B2|C1|C2)$/;
  const GENERIC_TOPICS = new Set(['教材总词汇表']);
  const GENDER_LABELS = { 'n.m': '阳性', 'n.f': '阴性', 'n.m.pl': '阳性复数', 'n.f.pl': '阴性复数' };

  function splitNotes(notes) {
    const parts = String(notes == null ? '' : notes).split('·').map(part => part.trim()).filter(Boolean);
    let level = '';
    const topics = [];
    parts.forEach(part => {
      if (!level && LEVEL_PATTERN.test(part)) level = part;
      else topics.push(part);
    });
    return { level, topics };
  }

  function buildNotes(item) {
    const pos = item.partOfSpeech || '';
    // 有阴阳性变体的词条（acteur(trice)）在教材表里只标了阴性词性；
    // 跨来源存在多个义项时（aller 既是动词又是名词）词性也只对其中一个义项成立。
    // 这两种情况直接写“阴性/阳性”会误导，因此只显示词性本身。
    const ambiguous = item.variant || (Array.isArray(item.senses) && item.senses.length > 0);
    const gender = !ambiguous && GENDER_LABELS[pos] ? `${pos}（${GENDER_LABELS[pos]}）` : pos;
    const topics = item.topics.filter(topic => topic !== pos && !GENERIC_TOPICS.has(topic));
    return [item.level, gender, ...topics].filter(Boolean).join(' · ');
  }

  // ==================== 页面安装 ====================

  function frenchScreensMarkup() {
    return `
      <section id="frenchWelcomeScreen" class="screen">
        <div class="container">
          <div class="hero">
            <div class="hero-main">
              <div class="eyebrow">French</div>
              <h1 class="page hero-title">Portail d'apprentissage du français</h1>
              <p class="desc">词汇覆盖 A1 到 C1，并配套 A1-B2 语法、动词变位与独立学习进度。</p>
            </div>
            <div class="hero-stats" data-hero-stats="french">
              <div class="hero-stat"><span class="hs-value" data-hs="total">·</span><span class="hs-label">词汇量</span></div>
              <div class="hero-stat accent"><span class="hs-value" data-hs="mastered">·</span><span class="hs-label">已掌握</span></div>
              <div class="hero-stat"><span class="hs-value" data-hs="due">·</span><span class="hs-label">今日复习</span></div>
            </div>
          </div>
          <div class="card-grid cols-2">
            <button class="card" id="goFrenchVocabularyBtn" style="--ci:0">
              <span class="card-chip"><span class="msr">translate</span></span>
              <span class="card-title">词汇</span>
              <span class="card-desc">主题词汇、我的词本与三种练习模式</span>
            </button>
            <button class="card" id="goFrenchGrammarBtn" style="--ci:1">
              <span class="card-chip"><span class="msr">menu_book</span></span>
              <span class="card-title">语法</span>
              <span class="card-desc">A1-B2 语法书（109 个专题）与 1,888 个动词变位</span>
            </button>
            <button class="card" id="goFrenchProgressBtn" style="--ci:2">
              <span class="card-chip"><span class="msr">monitoring</span></span>
              <span class="card-title">学习进度</span>
              <span class="card-desc">查看法语词汇掌握量与练习统计</span>
            </button>
            <button class="card" id="goFrenchSettingsBtn" style="--ci:3">
              <span class="card-chip"><span class="msr">tune</span></span>
              <span class="card-title">设置与数据</span>
              <span class="card-desc">课程说明、社区词本与全站数据工具</span>
            </button>
          </div>
        </div>
      </section>

      <section id="frenchVocabularyScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchVocabularyBackBtn"><span class="msr">arrow_back</span>返回法语首页</button>
          <h1 class="page">词汇</h1>
          <p class="desc">选一个来源开始练习。</p>
          <div class="card-grid cols-2">
            <button class="card" id="frenchSystemVocabularyBtn">
              <span class="card-chip"><span class="msr">dataset</span></span>
              <span class="card-title">系统词汇库</span>
              <span class="card-desc"><span id="frenchSystemVocabularyCount">0</span> 个 A1-C1 词条</span>
            </button>
            <button class="card" id="frenchCommunityBtn">
              <span class="card-chip"><span class="msr">groups</span></span>
              <span class="card-title">社区词本</span>
              <span class="card-desc">浏览、导入或发布词本。</span>
            </button>
          </div>
          <div class="section-head-row">
            <div class="sub-label">我的词本</div>
            <div class="chips wrap">
              <input type="file" id="frenchWordbookFileInput" accept=".json,.txt" style="display:none">
              <button class="pill-btn" id="frenchImportWordbookBtn"><span class="msr">upload_file</span>导入</button>
              <button class="pill-btn" id="frenchCreateWordbookBtn"><span class="msr">add</span>新建</button>
              <button class="pill-btn" id="frenchWordbooksBtn"><span class="msr">bookmark</span>我的词本</button>
            </div>
          </div>
          <div class="card-grid cols-3" id="frenchWordbookCards"></div>
        </div>
      </section>

      <section id="frenchVocabularyModesScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchModesBackBtn"><span class="msr">arrow_back</span>返回词汇</button>
          <div class="eyebrow">French / Vocabulary</div>
          <h1 class="page">Choisir un mode</h1>
          <p class="desc">选择一种方式练习当前法语词汇。</p>
          <div class="panel" style="margin-top:24px">
            <div class="panel-title">练习范围</div>
            <div class="field-label" style="margin-top:0">CEFR 等级</div>
            <div class="chips" id="frenchLevelChips" style="flex-wrap:wrap">
              <button class="chip active" data-level="all">全部</button>
              <button class="chip" data-level="A1">A1</button>
              <button class="chip" data-level="A2">A2</button>
              <button class="chip" data-level="B1">B1</button>
              <button class="chip" data-level="B2">B2</button>
              <button class="chip" data-level="C1">C1</button>
              <button class="chip" data-level="C2">C2</button>
            </div>
            <div class="field-label">每组题量</div>
            <div class="chips" id="frenchSessionChips" style="flex-wrap:wrap">
              <button class="chip active" data-size="20">20 题</button>
              <button class="chip" data-size="50">50 题</button>
              <button class="chip" data-size="100">100 题</button>
              <button class="chip" data-size="0">全部</button>
            </div>
            <div class="acc-total"><span id="frenchScopeSummary">当前范围</span><b id="frenchScopeCount">0</b></div>
          </div>
          <div class="card-grid cols-3">
            <button class="card" id="frenchMultipleChoiceBtn">
              <span class="card-chip"><span class="msr">quiz</span></span>
              <span class="card-title">选择题</span>
              <span class="card-desc">看法语，选择正确中文释义</span>
            </button>
            <button class="card" id="frenchSpellingBtn">
              <span class="card-chip"><span class="msr">keyboard</span></span>
              <span class="card-title">拼写</span>
              <span class="card-desc">看中文，输入法语单词或短语</span>
            </button>
            <button class="card" id="frenchBrowseBtn">
              <span class="card-chip"><span class="msr">list</span></span>
              <span class="card-title">浏览</span>
              <span class="card-desc">浏览、搜索并筛选法语词汇</span>
            </button>
          </div>

          <button class="card typing-feature-card" data-typing-game-lang="french">
            <span class="card-chip"><span class="msr">surfing</span></span>
            <span class="typing-feature-text">
              <span class="card-title">打字游戏 · 激流勇进</span>
              <span class="card-desc">单词顺流而下，看释义、打字击落！支持背单词与动词变位两种玩法。</span>
            </span>
            <span class="msr typing-feature-arrow">arrow_forward</span>
          </button>
        </div>
      </section>

      <section id="frenchMultipleChoiceScreen" class="screen">
        <div class="container narrow">
          <button class="back-link" id="frenchMcBackBtn"><span class="msr">arrow_back</span>返回</button>
          <div class="practice-head">
            <span class="idx"><span id="frenchMcCurrentWord">1</span> / <span id="frenchMcTotalWords">0</span></span>
            <span class="acc">正确率 <b id="frenchMcAccuracy">0%</b></span>
          </div>
          <div class="session-bar"><div class="session-fill" id="frenchMcSessionFill" style="width:0%"></div></div>
          <div class="practice-card">
            <div class="question-section">
              <div class="eyebrow" style="text-align:center" id="frenchMcQuestionLabel">Mot français</div>
              <div class="word-row">
                <h2 class="word" id="frenchMcWord">-</h2>
                <button class="speaker" id="frenchMcSpeakBtn" title="朗读法语"><span class="msr">volume_up</span></button>
              </div>
              <button class="hint-btn hidden" id="frenchMcShowHintBtn">显示笔记</button>
              <p class="chinese-hint hidden" id="frenchMcHint"></p>
            </div>
            <div class="field-label" id="frenchMcOptionsLabel">选择正确的中文释义</div>
            <div class="options" id="frenchMcOptions"></div>
            <div class="hidden" id="frenchMcFeedback">
              <p class="feedback feedback-text"></p>
              <button class="primary-btn" id="frenchMcNextBtn">下一个 <span class="msr">arrow_forward</span></button>
            </div>
          </div>
        </div>
      </section>

      <section id="frenchSpellingScreen" class="screen">
        <div class="container narrow">
          <button class="back-link" id="frenchSpBackBtn"><span class="msr">arrow_back</span>返回</button>
          <div class="practice-head">
            <span class="idx"><span id="frenchSpCurrentWord">1</span> / <span id="frenchSpTotalWords">0</span></span>
            <span class="acc">正确率 <b id="frenchSpAccuracy">0%</b></span>
          </div>
          <div class="session-bar"><div class="session-fill" id="frenchSpSessionFill" style="width:0%"></div></div>
          <div class="practice-card">
            <div class="question-section">
              <div class="eyebrow" style="text-align:center">中文释义</div>
              <h2 class="word" style="font-size:32px" id="frenchSpMeaning">-</h2>
              <p class="chinese-hint hidden" id="frenchSpHint"></p>
              <div style="text-align:center;margin-top:16px">
                <button class="pill-btn" id="frenchPronunciationBtn"><span class="msr">volume_up</span>听发音</button>
              </div>
            </div>
            <div class="field-label">请输入法语单词或短语</div>
            <input type="text" class="spell-input" id="frenchSpInput" placeholder="Écrivez en français..." autocomplete="off" autocapitalize="none">
            <button class="primary-btn" id="frenchSpCheckBtn">检查答案</button>
            <div class="hidden" id="frenchSpFeedback">
              <p class="feedback feedback-text"></p>
              <button class="primary-btn" id="frenchSpNextBtn">下一个 <span class="msr">arrow_forward</span></button>
            </div>
          </div>
        </div>
      </section>

      <section id="frenchBrowseScreen" class="screen">
        <div class="browse-container">
          <button class="back-btn" id="frenchBrowseBackBtn">← 返回</button>
          <div class="browse-controls">
            <div class="search-wrap">
              <span class="msr">search</span>
              <input type="text" class="search-input" id="frenchSearchInput" placeholder="搜索法语单词、释义或主题…">
            </div>
            <div class="chips" id="frenchFilterChips">
              <button class="chip active" data-filter="all">全部</button>
              <button class="chip" data-filter="mastered">已掌握</button>
              <button class="chip" data-filter="unmastered">学习中</button>
            </div>
            <div class="chips" id="frenchBrowseLevelChips" style="flex-wrap:wrap">
              <button class="chip active" data-level="all">全部等级</button>
              <button class="chip" data-level="A1">A1</button>
              <button class="chip" data-level="A2">A2</button>
              <button class="chip" data-level="B1">B1</button>
              <button class="chip" data-level="B2">B2</button>
              <button class="chip" data-level="C1">C1</button>
              <button class="chip" data-level="C2">C2</button>
            </div>
          </div>
          <div class="word-list" id="frenchWordList"></div>
        </div>
      </section>

      <section id="frenchGrammarScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchGrammarBackBtn"><span class="msr">arrow_back</span>返回法语首页</button>
          <div class="eyebrow">French / Grammar</div>
          <h1 class="page">Grammaire et conjugaison</h1>
          <p class="desc">按 A1-B2 进阶阅读语法，并通过练习掌握高频动词变位。</p>
          <div class="card-grid cols-2">
            <button class="card" id="frenchConjugationBtn">
              <span class="card-chip"><span class="msr">sync_alt</span></span>
              <span class="card-title">动词变位</span>
              <span class="card-desc">35 个高频动词、7 组时态与三种题型</span>
            </button>
            <button class="card" id="frenchGrammarBookBtn">
              <span class="card-chip"><span class="msr">auto_stories</span></span>
              <span class="card-title">语法书</span>
              <span class="card-desc">109 个 A1-B2 中文语法主题与法语例句</span>
            </button>
          </div>
        </div>
      </section>

      <section id="frenchProgressScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchProgressBackBtn"><span class="msr">arrow_back</span>返回法语首页</button>
          <div class="eyebrow">French / Progress</div>
          <h1 class="page">Progression en français</h1>
          <p class="desc">基于本机保存的法语词汇练习记录统计。</p>
          <div class="big-stats">
            <div class="big-stat"><div class="bs-label">French vocabulary</div><div class="bs-value" id="frenchProgressTotalWords">0</div></div>
            <div class="big-stat accent"><div class="bs-label">Mastered</div><div class="bs-value" id="frenchProgressMasteredWords">0</div></div>
            <div class="big-stat"><div class="bs-label">Progress</div><div class="bs-value" id="frenchProgressPercent">0%</div></div>
            <div class="big-stat"><div class="bs-label">MC stats</div><div class="bs-value" id="frenchProgressMcStats">0 / 0</div></div>
            <div class="big-stat"><div class="bs-label">Spelling stats</div><div class="bs-value" id="frenchProgressSpStats">0 / 0</div></div>
            <div class="big-stat accent"><div class="bs-label">Accuracy</div><div class="bs-value" id="frenchProgressAccuracy">0%</div></div>
          </div>

          <div class="progress-2col">
            <div class="panel">
              <div class="panel-title">最近 7 天练习量</div>
              <div class="bar-chart" id="frenchProgressWeekBars"></div>
            </div>
            <div class="panel">
              <div class="panel-title">正确率</div>
              <div id="frenchProgressAccuracyRows"></div>
              <div class="acc-total"><span>总练习次数</span><b id="frenchProgressTotalAttempts">0</b></div>
              <div class="acc-total"><span>连续学习天数</span><b id="frenchProgressStreak">0</b></div>
            </div>
          </div>

          <div style="margin-top:28px">
            <div class="panel-title">最近 7 天记录</div>
            <div class="stats-table-container">
              <table class="stats-table">
                <thead>
                  <tr><th>日期</th><th>练习词数</th><th>时长</th><th>作答</th><th>正确率</th></tr>
                </thead>
                <tbody id="frenchProgressHistoryBody"></tbody>
              </table>
            </div>
          </div>

          <div class="settings-card hidden" id="frenchProgressStatsPanelCard">
            <button class="data-row" id="frenchOpenProgressStatsBtn">
              <span class="row-chip"><span class="msr">monitoring</span></span>
              <span class="row-body">
                <span class="row-title">打开完整统计面板</span>
                <span class="row-sub">概览、图表与历史记录</span>
              </span>
              <span class="msr chev">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      <section id="frenchSettingsScreen" class="screen">
        <div class="container">
          <button class="back-link" id="frenchSettingsBackBtn"><span class="msr">arrow_back</span>返回法语首页</button>
          <div class="eyebrow">French / Settings &amp; Data</div>
          <h1 class="page">Paramètres du module français</h1>
          <p class="desc">查看课程范围，并进入共享数据工具。</p>
          <div class="settings-card">
            <div class="settings-card-title">课程说明</div>
            <div class="about-body">词汇由三部分合并而成：《你好！法语》1-4 课程词表、书末三语总词汇表（A1-B2），以及按 Lexique 3.83 词频排序的 A1-C1 核心词库；同一词条只出现一次，人工整理的释义优先于机器释义。语法 109 个 A1-B2 专题，变位覆盖 1,888 个动词。网页只保存词条数据，不包含教材扫描页。</div>
          </div>
          <div class="settings-card">
            <div class="settings-card-title">数据与社区</div>
            <button class="data-row" id="frenchSettingsCommunityBtn">
              <span class="row-chip"><span class="msr">groups</span></span>
              <span class="row-body"><span class="row-title">Open Community Wordbooks</span><span class="row-sub">浏览并导入共享词本</span></span>
              <span class="msr chev">chevron_right</span>
            </button>
            <button class="data-row" id="frenchSettingsGlobalDataBtn">
              <span class="row-chip"><span class="msr">tune</span></span>
              <span class="row-body"><span class="row-title">Open Global Settings &amp; Data</span><span class="row-sub">导出、导入、主题、帮助与重置</span></span>
              <span class="msr chev">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    `;
  }

  // French 是唯一在运行时注入页面的语言，锚点一旦消失整个模块都会失踪。
  // 因此这里显式报错，并按顺序尝试多个挂载点，最后兜底到 document.body。
  function installFrenchScreens() {
    if (document.getElementById('frenchWelcomeScreen')) return true;
    const markup = frenchScreensMarkup();
    const mounts = [];
    const anchor = document.getElementById('languageSkeletonPlaceholderScreen');
    if (anchor) {
      mounts.push(() => anchor.insertAdjacentHTML('beforebegin', markup));
    } else {
      console.error('FrenchApp: 未找到锚点 #languageSkeletonPlaceholderScreen，改用回退挂载点安装法语页面。');
    }
    const sibling = document.querySelector('section.screen');
    if (sibling && sibling.parentNode) {
      mounts.push(() => sibling.parentNode.insertAdjacentHTML('beforeend', markup));
    }
    if (document.body) {
      mounts.push(() => document.body.insertAdjacentHTML('beforeend', markup));
    }

    for (const mount of mounts) {
      try {
        mount();
      } catch (error) {
        console.error('FrenchApp: 安装法语页面时出错:', error);
        continue;
      }
      if (document.getElementById('frenchWelcomeScreen')) return true;
    }

    console.error('FrenchApp: 法语页面安装失败，French 模块不可用。');
    try {
      if (document.body) {
        document.body.insertAdjacentHTML('beforeend',
          '<section id="frenchWelcomeScreen" class="screen"><div class="container">' +
          '<div class="eyebrow">French</div><h1 class="page">French 模块加载失败</h1>' +
          '<p class="desc">页面结构缺少法语模块的挂载点，请刷新页面；若仍失败请重新部署站点。</p>' +
          '</div></section>');
      }
    } catch (error) {
      console.error('FrenchApp: 兜底提示也无法插入:', error);
    }
    return false;
  }

  const screensInstalled = installFrenchScreens();

  const FrenchApp = {
    words: [],
    systemWords: [],
    sessionWords: [],
    mastered: new Set(),
    stats: { mcAttempts: 0, mcCorrect: 0, spAttempts: 0, spCorrect: 0 },
    currentWord: null,
    currentWordbookId: null,
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    browseFilter: 'all',
    browseLevel: 'all',
    levelFilter: 'all',
    sessionSize: 20,
    glossIndex: new Map(),
    srs: {},
    _mcEngine: null,
    _questionStartedAt: 0,
    _browse: { words: [], rendered: 0, pageSize: 200 },
    _keysCache: null,
    _keysCacheSource: null,

    init() {
      if (!screensInstalled) return;
      if (typeof FRENCH_VOCABULARY_DATA === 'undefined') {
        console.warn('FRENCH_VOCABULARY_DATA 未加载，跳过 FrenchApp 初始化');
        return;
      }
      this.systemWords = this.buildSystemVocabulary();
      this.words = this.systemWords.slice();
      this.buildGlossIndex();
      this.loadState();
      this.bindNavigation();
      this.bindPractice();
      this.bindGrammar();
      this.bindWordbooks();
      this.renderWordbooks();
      this.installBreadcrumbScope();
      this.setText('frenchSystemVocabularyCount', this.systemWords.length.toLocaleString());
      this.syncScopeChips();
      if (typeof window.showEnhancedStatsModal === 'function') {
        document.getElementById('frenchProgressStatsPanelCard')?.classList.remove('hidden');
      }
      this.watchShellLanguage();
      if (document.body.getAttribute('data-language') === 'french') {
        this.updateHeaderStats();
      }
    },

    // 教材总词汇表与手写课程表按“字段级并集”合并：同一词条只出现一次，
    // 但 level / partOfSpeech / textbookPage / 主题 / 释义 会从所有来源补齐，
    // 而不是让先出现的来源整条胜出（旧实现丢掉了 CEFR 等级与词性）。
    // 去重键保留重音（ou ≠ où、la ≠ là、a ≠ à），只折叠 œ 与大小写（sœur = soeur）。
    buildSystemVocabulary() {
      const glossary = typeof FRENCH_GLOSSARY_VOCABULARY_DATA !== 'undefined'
        ? FRENCH_GLOSSARY_VOCABULARY_DATA
        : [];
      // 词频核心库（Lexique 3.83 排序的 22,380 条）放在最后：合并规则是「先到的
      // 来源定主释义」，核心库的中文是经英文转写来的机器释义，绝不能顶掉
      // 课程表和教材表里人工整理的义项。它自身按词频有序，追加后相对顺序不变。
      const core = typeof FRENCH_CORE_VOCABULARY_DATA !== 'undefined'
        ? FRENCH_CORE_VOCABULARY_DATA
        : [];
      const byKey = new Map();
      const order = [];

      [...FRENCH_VOCABULARY_DATA, ...glossary, ...core].forEach(entry => {
        if (!entry) return;
        const parsed = parseHeadword(entry.french);
        const key = headwordKey(parsed.french);
        if (!key) return;
        if (!byKey.has(key)) {
          byKey.set(key, { accepted: [], topics: [], senses: [] });
          order.push(key);
        }
        const target = byKey.get(key);
        const { level, topics } = splitNotes(entry.notes);

        target.french = target.french || parsed.french;
        // 展示形式只在后来的来源补上了性数变体时才替换，
        // 否则保留先出现的正字法（sœur 不应被教材表的 soeur 覆盖）。
        const variant = foldText(entry.feminine || entry.variant || parsed.variant);
        if (!target.display || (variant && !target.variant)) target.display = entry.display || parsed.display;
        target.variant = target.variant || variant;
        target.feminine = target.feminine || entry.feminine || '';
        // 仅把来源已明确给出的词形加入释义拼写答案，不从 display/printed 猜造。
        if (variant && !target.accepted.includes(variant)) target.accepted.push(variant);
        target.construction = target.construction || parsed.construction;
        parsed.accepted.forEach(form => {
          if (form && !target.accepted.includes(form)) target.accepted.push(form);
        });
        // 主释义保留课程表里人工整理的义项，教材表的其它义项作为补充义保留，
        // 这样既不丢信息，也不会把 aller 的“去程（名词）”顶成主释义。
        const meaning = String(entry.meaning || '').trim();
        if (meaning && !target.senses.includes(meaning)) target.senses.push(meaning);
        target.meaning = target.meaning || meaning;
        target.level = target.level || entry.level || level || '';
        target.partOfSpeech = target.partOfSpeech || entry.partOfSpeech || '';
        target.textbookPage = target.textbookPage || entry.textbookPage || '';
        target.source = target.source || entry.source || '';
        ['printed', 'printedPartOfSpeech', 'english', 'gender', 'frequency', 'freqRank', 'freqSource'].forEach(field => {
          if ((target[field] === undefined || target[field] === '') && entry[field] !== undefined) {
            target[field] = entry[field];
          }
        });
        topics.forEach(topic => {
          if (!target.topics.includes(topic)) target.topics.push(topic);
        });
      });

      return order.map((key, index) => {
        const item = byKey.get(key);
        item.key = key;
        item.chinese = item.meaning;
        item.senses = item.senses.filter(sense => sense !== item.meaning);
        item.notes = buildNotes(item);
        item.rank = index + 1;
        delete item.topics;
        return item;
      });
    },

    lookupSystemWord(value) {
      if (!this.systemWords.length) {
        if (typeof FRENCH_VOCABULARY_DATA === 'undefined') return null;
        this.systemWords = this.buildSystemVocabulary();
      }
      if (this._lookupSource !== this.systemWords) {
        this._lookupSource = this.systemWords;
        this._lookupIndex = new Map();
        this.systemWords.forEach(word => this._lookupIndex.set(headwordKey(word.french), word));
      }
      return this._lookupIndex.get(headwordKey(value)) || null;
    },

    // 同一条中文释义可能对应多个法语词（因为 → parce que / car），
    // 拼写模式据此接受任意同义词条，选择题据此排除重复选项。
    buildGlossIndex() {
      this.glossIndex = new Map();
      this.words.forEach(word => {
        const gloss = String(word.meaning || '').trim();
        if (!gloss) return;
        if (!this.glossIndex.has(gloss)) this.glossIndex.set(gloss, []);
        this.glossIndex.get(gloss).push(word);
      });
    },

    loadState() {
      try {
        this.mastered = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERED) || '[]'));
      } catch (error) {
        console.error('FrenchApp 掌握记录加载失败:', error);
        this.mastered = new Set();
      }
      this.migrateMasteredKeys();
      try {
        this.stats = { ...this.stats, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS) || '{}') };
      } catch (error) {
        console.error('FrenchApp 统计加载失败:', error);
      }
      try {
        this.srs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SRS) || '{}') || {};
      } catch (error) {
        console.error('FrenchApp 复习计划加载失败:', error);
        this.srs = {};
      }
      try {
        this.browseFilter = localStorage.getItem(STORAGE_KEYS.FILTER) || 'all';
        const level = localStorage.getItem(STORAGE_KEYS.LEVEL);
        if (level && (level === 'all' || LEVELS.includes(level))) this.levelFilter = level;
        // 注意 Number(null) === 0，而 0 是合法的“全部”档位，
        // 因此必须先判断确实存过值，否则首次访问会默认成一次练全部 2157 词。
        const rawSize = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (rawSize !== null && rawSize !== '' && SESSION_SIZES.includes(Number(rawSize))) {
          this.sessionSize = Number(rawSize);
        }
      } catch (error) {
        console.error('FrenchApp 偏好加载失败:', error);
      }
      this.browseLevel = this.levelFilter;
    },

    // ==================== 已掌握记录的键迁移 ====================
    // 词头改写（acteur(trice) → acteur、petit(-)déjeuner → petit déjeuner）让旧版
    // 写下的一部分掌握记录再也匹配不上任何 word.french：用户的"已掌握"数会凭空
    // 掉下去，浏览页里那些词也会退回"学习中"。这里在读档时做一次幂等迁移——
    // 能解析回新词头的就改写，解析不到的丢弃；顺带修好历史上去了重音的旧键。

    masteredKeyIndex() {
      if (this._masteredKeyIndex && this._masteredKeyIndexSource === this.systemWords) {
        return this._masteredKeyIndex;
      }
      const exact = new Map();
      const loose = new Map();
      // 第一轮只登记规范词头，保证 word.french 永远优先于别的词条的变体形式
      this.systemWords.forEach(word => {
        const canonical = word.french;
        if (!canonical) return;
        const strict = headwordKey(canonical);
        if (strict && !exact.has(strict)) exact.set(strict, canonical);
        const relaxed = looseKey(canonical);
        if (relaxed && !loose.has(relaxed)) loose.set(relaxed, canonical);
      });
      // 第二轮补上展示形/变体形/可接受写法，只填空缺
      this.systemWords.forEach(word => {
        const canonical = word.french;
        if (!canonical) return;
        const forms = [word.display, word.variant, word.key]
          .concat(Array.isArray(word.accepted) ? word.accepted : []);
        forms.forEach(form => {
          if (!form) return;
          const strict = headwordKey(form);
          if (strict && !exact.has(strict)) exact.set(strict, canonical);
          const relaxed = looseKey(form);
          if (relaxed && !loose.has(relaxed)) loose.set(relaxed, canonical);
        });
      });
      this._masteredKeyIndex = { exact, loose };
      this._masteredKeyIndexSource = this.systemWords;
      return this._masteredKeyIndex;
    },

    // 返回该旧键对应的现行 word.french；解析不出来时返回空串（调用方丢弃）
    resolveMasteredKey(key) {
      const raw = String(key == null ? '' : key).trim();
      if (!raw) return '';
      const index = this.masteredKeyIndex();
      const candidates = [raw];
      // 旧键本身就是改写前的词头，用同一个解析器还原成新词头即可
      const parsed = parseHeadword(raw);
      if (parsed.french) candidates.push(parsed.french);
      if (Array.isArray(parsed.accepted)) {
        parsed.accepted.forEach(form => { if (form) candidates.push(form); });
      }
      for (const form of candidates) {
        const hit = index.exact.get(headwordKey(form));
        if (hit) return hit;
      }
      for (const form of candidates) {
        const hit = index.loose.get(looseKey(form));
        if (hit) return hit;
      }
      return '';
    },

    migrateMasteredKeys() {
      // 词表没加载出来时绝不动用户的记录，否则会把整份进度清空
      if (!this.systemWords.length) return false;
      if (!(this.mastered instanceof Set) || !this.mastered.size) return false;
      const migrated = new Set();
      let changed = false;
      this.mastered.forEach(key => {
        const resolved = this.resolveMasteredKey(key);
        if (!resolved) { changed = true; return; }
        if (resolved !== key) changed = true;
        migrated.add(resolved);
      });
      if (!changed) return false;
      this.mastered = migrated;
      // 迁移只针对系统词库的记录：词本进度存在各自的 key 下，不受词头改写影响
      if (!this.currentWordbookId) {
        try {
          localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify([...migrated]));
        } catch (error) {
          console.warn('FrenchApp: 掌握记录迁移写入失败:', error);
        }
      }
      return true;
    },

    // 延迟落盘：每答一题最多 8 次 setItem（mastered / stats / SRS / 每日记录
    // 各自全量写）在两万词库后是可感知的卡顿。脏标记 + 500ms 合并写，
    // 关闭页面 / 切后台统一冲刷（见 lib/utils.js deferredPersist）。
    _persist: null,
    _persistSrs: null,
    _persistDaily: null,
    _dailyCache: null,

    /** 立即冲刷挂起的写。切换词库来源前必须调用：
     *  _writeState 落盘那一刻才读 currentWordbookId，不冲刷的话旧来源
     *  最后的答题进度会写进新来源的 key。 */
    flushState() {
      if (this._persist) this._persist.flush();
      if (this._persistSrs) this._persistSrs.flush();
      if (this._persistDaily) this._persistDaily.flush();
    },

    saveState() {
      if (!this._persist) this._persist = window.deferredPersist(() => this._writeState(), 500);
      this._persist();
      this.updateHeaderStats();
    },

    _writeState() {
      try {
        const masteredKey = this.currentWordbookId
          ? `dimenticato_progress_wb_french_${this.currentWordbookId}`
          : STORAGE_KEYS.MASTERED;
        localStorage.setItem(masteredKey, JSON.stringify([...this.mastered]));
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
        localStorage.setItem(STORAGE_KEYS.FILTER, this.browseFilter);
        localStorage.setItem(STORAGE_KEYS.LEVEL, this.levelFilter);
        localStorage.setItem(STORAGE_KEYS.SESSION, String(this.sessionSize));
      } catch (error) {
        console.error('FrenchApp 状态保存失败:', error);
      }
    },

    bindNavigation() {
      this.bindClick('goFrenchVocabularyBtn', () => this.showScreen('frenchVocabularyScreen'));
      this.bindClick('goFrenchGrammarBtn', () => this.showScreen('frenchGrammarScreen'));
      this.bindClick('goFrenchProgressBtn', () => {
        this.renderProgress();
        this.showScreen('frenchProgressScreen');
      });
      this.bindClick('goFrenchSettingsBtn', () => this.showScreen('frenchSettingsScreen'));

      this.bindClick('frenchVocabularyBackBtn', () => this.goBack('frenchWelcomeScreen'));
      this.bindClick('frenchModesBackBtn', () => this.goBack('frenchVocabularyScreen'));
      this.bindClick('frenchGrammarBackBtn', () => this.goBack('frenchWelcomeScreen'));
      this.bindClick('frenchProgressBackBtn', () => this.goBack('frenchWelcomeScreen'));
      this.bindClick('frenchSettingsBackBtn', () => this.goBack('frenchWelcomeScreen'));
      this.bindClick('frenchMcBackBtn', () => this.goBack('frenchVocabularyModesScreen'));
      this.bindClick('frenchSpBackBtn', () => this.goBack('frenchVocabularyModesScreen'));
      this.bindClick('frenchBrowseBackBtn', () => this.goBack('frenchVocabularyModesScreen'));

      this.bindClick('frenchSystemVocabularyBtn', () => this.selectSystemVocabulary());
      this.bindClick('frenchWordbooksBtn', () => this.renderWordbooks());
      this.bindClick('frenchCommunityBtn', () => this.openCommunity('frenchVocabularyScreen'));
      this.bindClick('frenchSettingsCommunityBtn', () => this.openCommunity('frenchSettingsScreen'));
      this.bindClick('frenchSettingsGlobalDataBtn', () => this.showScreen('settingsScreen'));
      this.bindClick('frenchOpenProgressStatsBtn', () => {
        if (typeof window.showEnhancedStatsModal === 'function') window.showEnhancedStatsModal();
      });
    },

    bindPractice() {
      this.bindClick('frenchMultipleChoiceBtn', () => this.startMultipleChoice());
      this.bindClick('frenchSpellingBtn', () => this.startSpelling());
      this.bindClick('frenchBrowseBtn', () => this.openBrowse());
      this.bindClick('frenchMcNextBtn', () => this.nextMultipleChoice());
      this.bindClick('frenchSpNextBtn', () => this.nextSpelling());
      this.bindClick('frenchSpCheckBtn', () => this.checkSpelling());
      this.bindClick('frenchMcSpeakBtn', () => this.speak(this.currentWord?.french || ''));
      this.bindClick('frenchPronunciationBtn', () => this.speak(this.currentWord?.french || ''));
      this.bindClick('frenchMcShowHintBtn', () => {
        document.getElementById('frenchMcHint')?.classList.remove('hidden');
        document.getElementById('frenchMcShowHintBtn')?.classList.add('hidden');
      });
      document.getElementById('frenchSpInput')?.addEventListener('keypress', event => {
        if (event.key === 'Enter') this.checkSpelling();
      });
      // 两万多词的列表不能每键整表重建（德语站踩过的坑）：搜索去抖 + 分页 + 事件委托
      const debouncedBrowseSearch = window.debounce
        ? window.debounce(value => this.renderBrowse(value), 200)
        : value => this.renderBrowse(value);
      document.getElementById('frenchSearchInput')?.addEventListener('input', event => {
        debouncedBrowseSearch(event.target.value || '');
      });
      document.getElementById('frenchWordList')?.addEventListener('click', event => {
        if (event.target.closest('[data-french-browse-more]')) {
          this.renderBrowsePage();
          return;
        }
        const row = event.target.closest('.word-line');
        if (row) this.speak(row.dataset.french || '');
      });
      document.querySelectorAll('#frenchFilterChips .chip').forEach(chip => {
        chip.addEventListener('click', () => this.setBrowseFilter(chip.dataset.filter));
      });
      document.querySelectorAll('#frenchBrowseLevelChips .chip').forEach(chip => {
        chip.addEventListener('click', () => this.setBrowseLevel(chip.dataset.level));
      });
      document.querySelectorAll('#frenchLevelChips .chip').forEach(chip => {
        chip.addEventListener('click', () => this.setLevelFilter(chip.dataset.level));
      });
      document.querySelectorAll('#frenchSessionChips .chip').forEach(chip => {
        chip.addEventListener('click', () => this.setSessionSize(Number(chip.dataset.size)));
      });
    },

    bindGrammar() {
      this.bindClick('frenchGrammarBookBtn', () => {
        if (typeof GrammarBook === 'undefined') return;
        // 语法数据按模块懒加载：缺席时补拉后重试点击（GrammarBook.init 里
        // 也有同款守卫兜底）；拉不到就不进屏，避免空壳
        if (typeof FRENCH_GRAMMAR_DATA === 'undefined') {
          if (window.LangLoader && typeof window.LangLoader.ensureModule === 'function'
            && !window.LangLoader.isModuleLoaded('french', 'grammar')) {
            window.LangLoader.ensureModule('french', 'grammar').then(() => {
              document.getElementById('frenchGrammarBookBtn')?.click();
            });
          }
          return;
        }
        GrammarBook.init(FRENCH_GRAMMAR_DATA);
        this.showScreen('grammarBookScreen');
      });
      this.bindClick('frenchConjugationBtn', () => {
        if (window.ConjugationPractice) {
          window.ConjugationPractice.openFor('french');
        }
      });
    },

    bindWordbooks() {
      this.bindClick('frenchImportWordbookBtn', () => document.getElementById('frenchWordbookFileInput')?.click());
      this.bindClick('frenchCreateWordbookBtn', () => {
        if (typeof WordbookEditor !== 'undefined') {
          WordbookEditor.createNewWordbook('french');
          this.renderWordbooks();
        }
      });
      document.getElementById('frenchWordbookFileInput')?.addEventListener('change', async event => {
        const file = event.target.files?.[0];
        if (!file || typeof WordbookManager === 'undefined') return;
        try {
          const result = await WordbookManager.importFromFileWithLanguage(file, 'french');
          this.renderWordbooks();
          alert(`已导入法语词本“${result.wordbook.name}”，共 ${result.wordbook.wordCount} 词。`);
        } catch (error) {
          if (error !== '用户取消导入') alert(String(error));
        } finally {
          event.target.value = '';
        }
      });
    },

    // ==================== 共享页面的面包屑语言归属 ====================
    // grammarBookScreen / conjugation* / community 由四种语言共用，
    // 面包屑由 app.js 的 ScreenMeta 统一渲染。若 s1 提供了语言感知的
    // ScreenMeta API 就直接调用它；否则只在 French 上下文里补一个前缀。
    installBreadcrumbScope() {
      if (this._breadcrumbHooked) return;
      const original = window.showScreen;
      if (typeof original !== 'function') return;
      const app = this;
      window.showScreen = function (screenId, options) {
        const result = original.apply(this, arguments);
        try {
          app.scopeSharedBreadcrumb(screenId);
          app.syncShellHeaderStats();
        } catch (error) {
          console.warn('FrenchApp: 面包屑语言归属处理失败:', error);
        }
        return result;
      };
      this._breadcrumbHooked = true;
    },

    scopeSharedBreadcrumb(screenId) {
      if (!SHARED_SCREENS.has(screenId)) return;
      if (document.body.getAttribute('data-language') !== 'french') return;
      const meta = window.ScreenMeta;
      const setter = meta && (meta.setLanguage || meta.setLanguageContext || meta.applyLanguage);
      if (typeof setter === 'function') {
        setter.call(meta, 'french', screenId);
        return;
      }
      const breadcrumb = document.getElementById('breadcrumb');
      if (!breadcrumb) return;
      const first = breadcrumb.querySelector('.breadcrumb-item');
      if (!first || first.textContent.trim() === 'French') return;
      breadcrumb.insertAdjacentHTML('afterbegin',
        '<span class="breadcrumb-item">French</span><span class="breadcrumb-separator">/</span>');
    },

    selectSystemVocabulary() {
      this.flushState();
      this.currentWordbookId = null;
      this.words = this.systemWords.slice();
      try {
        this.mastered = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERED) || '[]'));
      } catch (_) {
        this.mastered = new Set();
      }
      this.migrateMasteredKeys();
      this.buildGlossIndex();
      this.syncScopeChips();
      this.updateHeaderStats();
      this.showScreen('frenchVocabularyModesScreen');
    },

    renderWordbooks() {
      const container = document.getElementById('frenchWordbookCards');
      if (!container || typeof WordbookManager === 'undefined') return;
      const wordbooks = WordbookManager.getWordbooksByLanguage('french');
      if (!wordbooks.length) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:1rem">还没有法语词本</p>';
        return;
      }
      container.innerHTML = wordbooks.map(wordbook => `
        <div class="card wordbook-card" data-french-wordbook-id="${escapeAttribute(wordbook.id)}">
          <button class="wordbook-card-manage-btn" data-manage-id="${escapeAttribute(wordbook.id)}" title="管理"><span class="msr">settings</span></button>
          <button class="wordbook-delete-btn" data-delete-id="${escapeAttribute(wordbook.id)}" title="删除">×</button>
          <span class="card-chip"><span class="msr">bookmark</span></span>
          <span class="card-title">${escapeHtml(wordbook.name)}</span>
          <span class="card-desc">${escapeHtml(String(wordbook.wordCount))} 词</span>
        </div>
      `).join('');
      container.querySelectorAll('[data-french-wordbook-id]').forEach(card => {
        card.addEventListener('click', () => this.selectWordbook(Number(card.dataset.frenchWordbookId)));
      });
      container.querySelectorAll('[data-manage-id]').forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation();
          WordbookEditor?.openEditor(Number(button.dataset.manageId));
        });
      });
      container.querySelectorAll('[data-delete-id]').forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation();
          WordbookManager.deleteWordbook(Number(button.dataset.deleteId));
          this.renderWordbooks();
        });
      });
    },

    selectWordbook(id) {
      const wordbook = WordbookManager.getWordbooksByLanguage('french').find(item => item.id === id);
      if (!wordbook) return;
      this.flushState();
      this.currentWordbookId = id;
      this.words = WordbookManager.mapWordbookWordsForLanguage(wordbook.words, 'french');
      try {
        this.mastered = new Set(JSON.parse(localStorage.getItem(`dimenticato_progress_wb_french_${id}`) || '[]'));
      } catch (_) {
        this.mastered = new Set();
      }
      // 自定义词本没有 CEFR 等级，等级筛选在词本模式下自动回到全部
      this.levelFilter = 'all';
      this.browseLevel = 'all';
      this.buildGlossIndex();
      this.syncScopeChips();
      this.updateHeaderStats();
      this.showScreen('frenchVocabularyModesScreen');
    },

    // ==================== 练习范围 ====================

    setLevelFilter(level) {
      if (level !== 'all' && !LEVELS.includes(level)) return;
      this.levelFilter = level;
      this.browseLevel = level;
      this.syncScopeChips();
      this.saveState();
    },

    setSessionSize(size) {
      if (!SESSION_SIZES.includes(size)) return;
      this.sessionSize = size;
      this.syncScopeChips();
      this.saveState();
    },

    syncScopeChips() {
      document.querySelectorAll('#frenchLevelChips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.level === this.levelFilter);
      });
      document.querySelectorAll('#frenchSessionChips .chip').forEach(chip => {
        chip.classList.toggle('active', Number(chip.dataset.size) === this.sessionSize);
      });
      document.querySelectorAll('#frenchBrowseLevelChips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.level === this.browseLevel);
      });
      const scoped = this.getScopedWords();
      const size = this.sessionSize > 0 ? Math.min(this.sessionSize, scoped.length) : scoped.length;
      this.setText('frenchScopeSummary',
        `${this.levelFilter === 'all' ? '全部等级' : this.levelFilter} · 每组 ${this.sessionSize > 0 ? `${this.sessionSize} 题` : '全部'}`);
      this.setText('frenchScopeCount', `${size.toLocaleString()} / ${scoped.length.toLocaleString()}`);
    },

    getScopedWords() {
      if (this.levelFilter === 'all') return this.words.slice();
      return this.words.filter(word => word.level === this.levelFilter);
    },

    buildSession() {
      const pool = this.getScopedWords();
      if (!pool.length) return [];
      const due = this.getDueWords(pool);
      let ordered = this.shuffle(pool);
      if (due.length && due.length < pool.length) {
        const dueKeys = new Set(due.map(word => this.wordKey(word)));
        ordered = [
          ...ordered.filter(word => dueKeys.has(this.wordKey(word))),
          ...ordered.filter(word => !dueKeys.has(this.wordKey(word)))
        ];
      }
      return this.sessionSize > 0 ? ordered.slice(0, this.sessionSize) : ordered;
    },

    // ==================== 间隔重复（共享层可用时接入） ====================

    wordKey(word) {
      return word && word.key ? word.key : headwordKey(word && word.french);
    },

    getDueWords(pool) {
      const shared = window.SpacedRepetition;
      // 旧版是 getDueWords(words)，传语言名会直接抛错，而且它会往词条对象上
      // 写 srData；只有语言感知的新版（两个参数）才交给共享层。
      if (shared && typeof shared.getDueWords === 'function' && shared.getDueWords.length >= 2) {
        try {
          const result = shared.getDueWords('french', pool);
          if (Array.isArray(result)) return result;
        } catch (error) {
          console.warn('FrenchApp: 共享复习队列不可用，改用本地记录。', error);
        }
      }
      const today = new Date().toISOString().split('T')[0];
      return pool.filter(word => {
        const entry = this.srs[this.wordKey(word)];
        return entry && entry.nextReviewDate && entry.nextReviewDate <= today;
      });
    },

    recordSrs(word, isCorrect, durationMs) {
      const shared = window.SpacedRepetition;
      if (!shared || typeof shared.calculateNextReview !== 'function') return;
      const key = this.wordKey(word);
      if (!key) return;
      try {
        const quality = typeof shared.convertCorrectToQuality === 'function'
          ? shared.convertCorrectToQuality(isCorrect, durationMs)
          : (isCorrect ? 4 : 2);
        // 同时兼容 calculateNextReview(word, quality)（旧：状态在 word.srData 上，
        // 且要求 reviewHistory 已存在）与 calculateNextReview(srData, quality)
        // （新：状态就在第一个参数上）。把已有进度同时放在顶层和 srData 里，
        // 两种实现都能读到上次的间隔；nextReviewDate 故意不预填，
        // 这样才能靠“谁写了 nextReviewDate”判断哪个对象是结果。
        const previous = this.srs[key] || {};
        const seed = {
          easiness: Number(previous.easiness) || 2.5,
          interval: Number(previous.interval) || 0,
          repetitions: Number(previous.repetitions) || 0,
          reviewHistory: []
        };
        const holder = Object.assign({}, seed, { srData: Object.assign({}, seed) });
        const returned = shared.calculateNextReview(holder, quality);
        const next = [returned, holder, holder.srData]
          .find(candidate => candidate && candidate.nextReviewDate);
        if (!next) return;
        const parsed = new Date(`${next.nextReviewDate}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) return;
        // SM-2 的间隔没有上限，累计几十次正确后会让 Date 溢出；这里统一夹到 10 年内。
        const interval = Math.max(0, Math.min(Number(next.interval) || 0, 3650));
        this.srs[key] = {
          easiness: Number(next.easiness) || 2.5,
          interval,
          repetitions: Math.max(0, Number(next.repetitions) || 0),
          nextReviewDate: next.nextReviewDate,
          lastReviewDate: next.lastReviewDate || new Date().toISOString().split('T')[0]
        };
        // 写的是 this.srs 本身（flush 时读最新值），可以安全延迟
        if (!this._persistSrs) this._persistSrs = window.deferredPersist(() => {
          try { localStorage.setItem(STORAGE_KEYS.SRS, JSON.stringify(this.srs)); }
          catch (error) { console.warn('FrenchApp: 复习计划写入失败:', error); }
        }, 500);
        this._persistSrs();
      } catch (error) {
        console.warn('FrenchApp: 复习计划写入失败:', error);
      }
    },

    // ==================== 每日练习记录 ====================

    // 每日记录以内存缓存为唯一真相：写是延迟的，若每次都从 localStorage
    // 重读，同一窗口内的连续答题会互相看不到对方的增量（后写覆盖前写）。
    loadDaily() {
      if (this._dailyCache) return this._dailyCache;
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY) || '{}');
        this._dailyCache = raw && typeof raw === 'object' ? raw : {};
      } catch (error) {
        console.error('FrenchApp 每日记录加载失败:', error);
        this._dailyCache = {};
      }
      return this._dailyCache;
    },

    recordDaily(word, isCorrect, durationMs) {
      try {
        const daily = this.loadDaily();
        const today = new Date().toISOString().split('T')[0];
        const entry = daily[today] || { date: today, totalCount: 0, correctCount: 0, durationMs: 0, words: [] };
        entry.totalCount += 1;
        if (isCorrect) entry.correctCount += 1;
        entry.durationMs += Math.max(0, Math.min(durationMs || 0, 5 * 60 * 1000));
        const key = this.wordKey(word);
        if (key && !entry.words.includes(key)) entry.words.push(key);
        daily[today] = entry;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - DAILY_HISTORY_DAYS);
        const cutoffKey = cutoff.toISOString().split('T')[0];
        Object.keys(daily).forEach(date => {
          if (date < cutoffKey) delete daily[date];
        });
        if (!this._persistDaily) this._persistDaily = window.deferredPersist(() => {
          try { localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(this._dailyCache)); }
          catch (error) { console.error('FrenchApp 每日记录保存失败:', error); }
        }, 500);
        this._persistDaily();
      } catch (error) {
        console.error('FrenchApp 每日记录保存失败:', error);
      }
    },

    getRecentDaily(days = 7) {
      const daily = this.loadDaily();
      const result = [];
      for (let offset = days - 1; offset >= 0; offset--) {
        const date = new Date();
        date.setDate(date.getDate() - offset);
        const key = date.toISOString().split('T')[0];
        const entry = daily[key];
        result.push({
          date: key,
          totalCount: entry?.totalCount || 0,
          correctCount: entry?.correctCount || 0,
          durationMs: entry?.durationMs || 0,
          words: entry?.words?.length || 0
        });
      }
      return result;
    },

    getStreak() {
      const daily = this.loadDaily();
      let streak = 0;
      for (let offset = 0; offset < DAILY_HISTORY_DAYS; offset++) {
        const date = new Date();
        date.setDate(date.getDate() - offset);
        const key = date.toISOString().split('T')[0];
        const entry = daily[key];
        if (entry && entry.totalCount > 0) streak++;
        else if (offset > 0) break;
      }
      return streak;
    },

    recordAnswer(word, isCorrect) {
      const now = Date.now();
      const durationMs = this._questionStartedAt ? now - this._questionStartedAt : 0;
      this._questionStartedAt = now;
      this.recordDaily(word, isCorrect, durationMs);
      this.recordSrs(word, isCorrect, durationMs);
      if (this.hasLanguageAwareStats()) {
        try {
          window.StatsManager.recordActivity('french', {
            correct: isCorrect ? 1 : 0,
            total: 1,
            durationMs: Math.max(0, Math.min(durationMs, 5 * 60 * 1000))
          });
        } catch (error) {
          console.warn('FrenchApp: 共享统计写入失败:', error);
        }
      }
    },

    // 四选一蒙对一次就标记"已掌握"会让进度条凭运气上涨且永不回落，
    // 因此改由共享的 MasteryPolicy 判定：连续答对够次数才算掌握，答错清零。
    // MasteryPolicy 定义在 lib/quiz-engine.js，一律在【调用时】通过 window 解析。
    // 掌握集合与 countMastered/renderBrowse 一样以 word.french 为键，
    // 迁移后的旧记录（见 migrateMasteredKeys）用的正是同一套键，两者不冲突。
    recordMastery(word, isCorrect) {
      const key = word && word.french;
      if (!key) return { streak: 0, mastered: false };
      const policy = window.MasteryPolicy;
      if (!policy || typeof policy.record !== 'function') {
        // 没有共享策略时退回旧行为，至少不丢进度
        if (isCorrect) this.mastered.add(key);
        return { streak: isCorrect ? 1 : 0, mastered: !!isCorrect };
      }
      let outcome;
      try {
        outcome = policy.record('french', key, isCorrect, { word });
      } catch (error) {
        console.warn('FrenchApp: 掌握度策略写入失败:', error);
        return { streak: 0, mastered: false };
      }
      if (outcome && outcome.mastered) this.mastered.add(key);
      return outcome || { streak: 0, mastered: false };
    },

    // 旧版签名是 recordActivity(word, isCorrect, isReview)，它会把
    // 'french' 当成单词写进意大利语的每日统计里；因此只有确认共享核心
    // 已经升级成语言感知版本（与 DimStorage 同批交付）时才调用。
    hasLanguageAwareStats() {
      const stats = window.StatsManager;
      if (!stats || typeof stats.recordActivity !== 'function') return false;
      if (stats.recordActivity.length >= 3) return false;
      const storage = window.DimStorage;
      return !!(storage && typeof storage.prefixFor === 'function');
    },

    // ==================== 选择题 ====================

    getMcEngine() {
      if (!this._mcEngine) {
        this._mcEngine = new QuizEngine({
          state: {
            get words() { return FrenchApp.sessionWords; },
            get quizIndex() { return FrenchApp.quizIndex; },
            set quizIndex(value) { FrenchApp.quizIndex = value; },
            get quizCorrect() { return FrenchApp.quizCorrect; },
            set quizCorrect(value) { FrenchApp.quizCorrect = value; },
            get quizTotal() { return FrenchApp.quizTotal; },
            set quizTotal(value) { FrenchApp.quizTotal = value; },
            get currentWord() { return FrenchApp.currentWord; },
            set currentWord(value) { FrenchApp.currentWord = value; }
          },
          stats: this.stats,
          mastered: this.mastered,
          fieldMap: { source: 'french', target: 'meaning' },
          get difficulty() { return QuizEngine.getDifficulty(); },
          onUpdateStats: () => {},
          dom: {
            optionsContainer: document.getElementById('frenchMcOptions'),
            feedbackEl: document.getElementById('frenchMcFeedback'),
            feedbackTextEl: document.querySelector('#frenchMcFeedback .feedback-text'),
            progressCurrent: document.getElementById('frenchMcCurrentWord'),
            progressTotal: document.getElementById('frenchMcTotalWords'),
            accuracyEl: document.getElementById('frenchMcAccuracy')
          }
        });
      }
      this._mcEngine.config.stats = this.stats;
      this._mcEngine.config.mastered = this.mastered;
      return this._mcEngine;
    },

    startMultipleChoice() {
      const session = this.buildSession();
      if (!session.length) return alert(this.emptyScopeMessage());
      this.resetQuiz();
      this.sessionWords = session;
      this.showScreen('frenchMultipleChoiceScreen');
      this.loadMultipleChoice();
    },

    loadMultipleChoice() {
      if (this.quizIndex >= this.sessionWords.length) return this.finishPractice('选择题');
      this.currentWord = this.sessionWords[this.quizIndex];
      this._questionStartedAt = Date.now();
      const engine = this.getMcEngine();
      const reverse = engine.isReverse();
      this.setText('frenchMcCurrentWord', String(this.quizIndex + 1));
      this.setText('frenchMcTotalWords', String(this.sessionWords.length));
      this.setText('frenchMcAccuracy', `${this.accuracy()}%`);
      // 题面跟着出题方向走：反向显示释义，而不是法语词形
      this.setText('frenchMcWord', reverse
        ? engine.questionTextFor(this.currentWord)
        : (this.currentWord.display || this.currentWord.french || '-'));
      engine.applyDirectionLabels(
        { question: 'frenchMcQuestionLabel', options: 'frenchMcOptionsLabel' },
        { question: 'Mot français', options: '选择正确的中文释义' },
        { question: '中文释义', options: '选择正确的法语单词' }
      );
      this.updateFill('frenchMcSessionFill');
      const hint = document.getElementById('frenchMcHint');
      const hintButton = document.getElementById('frenchMcShowHintBtn');
      const noteText = this.hintFor(this.currentWord);
      if (hint) { hint.textContent = noteText; hint.classList.add('hidden'); }
      if (hintButton) hintButton.classList.toggle('hidden', !noteText);
      const correct = engine.correctAnswerFor(this.currentWord);
      engine.renderOptions(engine.generateOptions(correct, this.distractorPool(correct)),
        button => this.checkMultipleChoice(button));
      this.resetFeedback('frenchMcFeedback');
      // 反向模式的答案就是法语词形，朗读等于报答案
      if (!reverse) this.speak(this.currentWord.french);
    },

    // 同义词条（释义字符串相同）绝不能进入干扰项，否则会出现两个"正确"选项
    // （反向模式下由 QuizEngine.generateOptions 的同义排除兜底）
    distractorPool(correct) {
      // 每题对 24k 词表 filter 出新数组有两重代价：O(n) 遍历本身，以及
      // WordSimilarity 的索引按「池数组身份」缓存、每题新数组让它永远重建。
      // 改成稳定的有界采样（同义/同形排除由引擎自己做，那里才是正确归属）。
      const target = String(correct || '').trim();
      return QuizEngine.sampleDistractorPool(this.words, this.currentWord)
        .filter(word => String(word.meaning || '').trim() !== target);
    },

    checkMultipleChoice(button) {
      this._questionStartedAt = window.PracticeFlow.mcAnswer({
        lang: 'french',
        engine: () => this.getMcEngine(),
        button,
        word: this.currentWord,
        state: this,
        stats: this.stats,
        recordMastery: (word, ok) => {
          this.recordMastery(word, ok);
          this.recordAnswer(word, ok);
        },
        setText: (id, text) => this.setText(id, text),
        accuracyId: 'frenchMcAccuracy',
        accuracyText: () => `${this.accuracy()}%`,
        save: () => this.saveState(),
        next: () => this.nextMultipleChoice(),
        nextDelay: 900,
        startedAt: this._questionStartedAt || 0
      });
    },

    nextMultipleChoice() {
      this.quizIndex++;
      this.loadMultipleChoice();
    },

    // ==================== 拼写 ====================

    startSpelling() {
      const session = this.buildSession();
      if (!session.length) return alert(this.emptyScopeMessage());
      this.resetQuiz();
      this.sessionWords = session;
      this.showScreen('frenchSpellingScreen');
      this.loadSpelling();
    },

    loadSpelling() {
      if (this.quizIndex >= this.sessionWords.length) return this.finishPractice('拼写');
      this.currentWord = this.sessionWords[this.quizIndex];
      this._questionStartedAt = Date.now();
      this.setText('frenchSpCurrentWord', String(this.quizIndex + 1));
      this.setText('frenchSpTotalWords', String(this.sessionWords.length));
      this.setText('frenchSpAccuracy', `${this.accuracy()}%`);
      this.setText('frenchSpMeaning', this.currentWord.meaning || this.currentWord.chinese || '-');
      this.updateFill('frenchSpSessionFill');
      const hint = document.getElementById('frenchSpHint');
      if (hint) {
        const noteText = this.hintFor(this.currentWord, true);
        hint.textContent = noteText;
        hint.classList.toggle('hidden', !noteText);
      }
      const input = document.getElementById('frenchSpInput');
      if (input) { input.value = ''; input.disabled = false; input.focus(); }
      document.getElementById('frenchSpCheckBtn')?.classList.remove('hidden');
      this.resetFeedback('frenchSpFeedback');
    },

    // 词性/性数与搭配信息是同义释义的唯一区分线索，拼写模式必须显示
    hintFor(word, includeCollision = false) {
      const parts = [];
      if (word.notes) parts.push(word.notes);
      if (word.construction) parts.push(`搭配：${word.construction}`);
      if (Array.isArray(word.senses) && word.senses.length) parts.push(`另义：${word.senses.join('；')}`);
      if (includeCollision) {
        const twins = this.glossTwins(word);
        if (twins.length) parts.push(`该释义有 ${twins.length + 1} 种说法，任一正确写法均可`);
      }
      return parts.join(' · ');
    },

    glossTwins(word) {
      const group = this.glossIndex.get(String(word.meaning || '').trim()) || [];
      return group.filter(item => item !== word && this.wordKey(item) !== this.wordKey(word));
    },

    acceptedForms(word) {
      if (Array.isArray(word.accepted) && word.accepted.length) return word.accepted;
      return [word.french].filter(Boolean);
    },

    // 这里只供“看释义写法语”模式使用；听写/指定性数/变位不得复用变体与同义词放宽。
    // 法语重音是正字法的一部分：重音写错记为“差一点”，不判对也不计入掌握。
    gradeSpelling(answer, word) {
      const given = spellKey(answer);
      if (!given) return { status: 'wrong' };
      if (this.acceptedForms(word).some(form => spellKey(form) === given)) {
        return { status: 'correct' };
      }
      const twin = this.glossTwins(word)
        .find(item => this.acceptedForms(item).some(form => spellKey(form) === given));
      if (twin) return { status: 'correct', twin };
      const loose = looseKey(answer);
      if (this.acceptedForms(word).some(form => looseKey(form) === loose)) {
        return { status: 'accent' };
      }
      return { status: 'wrong' };
    },

    checkSpelling() {
      const input = document.getElementById('frenchSpInput');
      if (!input || input.disabled || !this.currentWord) return;
      const answer = input.value.trim();
      if (!answer) return;
      const word = this.currentWord;
      const verdict = this.gradeSpelling(answer, word);
      const isCorrect = verdict.status === 'correct';
      this.quizTotal++;
      this.stats.spAttempts++;
      if (isCorrect) {
        this.quizCorrect++;
        this.stats.spCorrect++;
      }
      this.recordMastery(word, isCorrect);
      input.disabled = true;
      document.getElementById('frenchSpCheckBtn')?.classList.add('hidden');
      this.showSpellingFeedback(verdict, word);
      this.setText('frenchSpAccuracy', `${this.accuracy()}%`);
      this.recordAnswer(word, isCorrect);
      this.saveState();
      if (isCorrect) setTimeout(() => this.nextSpelling(), 900);
    },

    showSpellingFeedback(verdict, word) {
      const wrapper = document.getElementById('frenchSpFeedback');
      const text = wrapper?.querySelector('.feedback-text');
      if (!wrapper || !text) return;
      const target = word.display || word.french;
      if (verdict.status === 'correct') {
        text.innerHTML = verdict.twin
          ? `<span class="msr">check_circle</span>回答正确（同义写法，参考答案：${escapeHtml(target)}）`
          : '<span class="msr">check_circle</span>回答正确';
      } else if (verdict.status === 'accent') {
        text.innerHTML = `<span class="msr">error</span>差一点：重音符号有误，正确写法是：${escapeHtml(target)}`;
      } else {
        text.innerHTML = `<span class="msr">cancel</span>回答有误，正确答案是：${escapeHtml(target)}`;
      }
      text.classList.toggle('ok', verdict.status === 'correct');
      text.classList.toggle('no', verdict.status !== 'correct');
      wrapper.classList.remove('hidden');
    },

    nextSpelling() {
      this.quizIndex++;
      this.loadSpelling();
    },

    // ==================== 浏览 ====================

    openBrowse() {
      this.showScreen('frenchBrowseScreen');
      const input = document.getElementById('frenchSearchInput');
      if (input) input.value = '';
      this.syncFilterChips();
      this.renderBrowse();
    },

    setBrowseFilter(filter) {
      if (!['all', 'mastered', 'unmastered'].includes(filter)) return;
      this.browseFilter = filter;
      this.saveState();
      this.syncFilterChips();
      this.renderBrowse(document.getElementById('frenchSearchInput')?.value || '');
    },

    setBrowseLevel(level) {
      if (level !== 'all' && !LEVELS.includes(level)) return;
      this.browseLevel = level;
      this.syncFilterChips();
      this.renderBrowse(document.getElementById('frenchSearchInput')?.value || '');
    },

    syncFilterChips() {
      document.querySelectorAll('#frenchFilterChips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === this.browseFilter);
      });
      document.querySelectorAll('#frenchBrowseLevelChips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.level === this.browseLevel);
      });
    },

    // 分页渲染：先把筛选/搜索结果存进 _browse.words，首屏只画 200 行，
    // 其余通过「加载更多」追加（点击由 bindPractice 里的事件委托处理）。
    renderBrowse(searchTerm = '') {
      const container = document.getElementById('frenchWordList');
      if (!container) return;
      const term = searchTerm.toLowerCase().trim();
      let words = this.words;
      if (this.browseLevel !== 'all') words = words.filter(word => word.level === this.browseLevel);
      if (this.browseFilter === 'mastered') words = words.filter(word => this.mastered.has(word.french));
      if (this.browseFilter === 'unmastered') words = words.filter(word => !this.mastered.has(word.french));
      if (term) {
        words = words.filter(word => [word.french, word.display, word.variant, word.meaning, word.chinese, word.notes,
          Array.isArray(word.senses) ? word.senses.join(' ') : '']
          .some(value => String(value || '').toLowerCase().includes(term)));
      }
      this._browse.words = words;
      this._browse.rendered = 0;
      if (!words.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem">没有找到匹配的法语词汇</p>';
        return;
      }
      container.innerHTML = '<div id="frenchWordRows"></div><div id="frenchBrowseFooter"></div>';
      this.renderBrowsePage();
    },

    renderBrowsePage() {
      const rows = document.getElementById('frenchWordRows');
      const footer = document.getElementById('frenchBrowseFooter');
      if (!rows) return;
      const all = this._browse.words;
      const start = this._browse.rendered;
      const end = Math.min(all.length, start + this._browse.pageSize);
      rows.insertAdjacentHTML('beforeend', all.slice(start, end).map(word => this.browseRowHtml(word)).join(''));
      this._browse.rendered = end;
      if (footer) {
        footer.innerHTML = end < all.length
          ? `<button class="pill-btn" type="button" data-french-browse-more style="margin-top:14px"><span class="msr">expand_more</span>加载更多（已显示 ${end} / ${all.length}）</button>`
          : `<div class="about-note" style="margin-top:14px">共 ${all.length} 个词条</div>`;
      }
    },

    browseRowHtml(word) {
      const mastered = this.mastered.has(word.french);
      return `
        <div class="word-line" data-french="${escapeAttribute(word.french)}">
          <span class="wl-word">${escapeHtml(word.display || word.french)}</span>
          <span class="wl-gloss">${escapeHtml(word.meaning || '')}<span class="wl-note">${escapeHtml(word.notes || '')}</span></span>
          <span class="wl-status"><span class="dot${mastered ? ' good' : ''}"></span>${mastered ? '已掌握' : '学习中'}</span>
          <button class="wl-speaker" title="朗读"><span class="msr">volume_up</span></button>
        </div>`;
    },

    // ==================== 进度 ====================

    countMastered() {
      // 词表身份缓存：key set 只在切词源（this.words 换引用）时重建，
      // 此前每答一题都全表建一次 24k 的 Set
      if (this._keysCacheSource !== this.words) {
        this._keysCacheSource = this.words;
        this._keysCache = new Set(this.words.map(word => word.french));
      }
      const keys = this._keysCache;
      let count = 0;
      this.mastered.forEach(value => { if (keys.has(value)) count++; });
      return count;
    },

    // 10 / 2157 会四舍五入成 0%，让人以为进度没保存；不足 1% 时保留一位小数
    formatPercent(part, total) {
      if (!total || !part) return '0%';
      const pct = part / total * 100;
      if (pct > 0 && pct < 1) return `${pct.toFixed(1)}%`;
      return `${Math.round(pct)}%`;
    },

    renderProgress() {
      const masteredCount = this.countMastered();
      const total = this.words.length;
      const attempts = (this.stats.mcAttempts || 0) + (this.stats.spAttempts || 0);
      const correct = (this.stats.mcCorrect || 0) + (this.stats.spCorrect || 0);
      this.setText('frenchProgressTotalWords', total.toLocaleString());
      this.setText('frenchProgressMasteredWords', masteredCount.toLocaleString());
      this.setText('frenchProgressPercent', this.formatPercent(masteredCount, total));
      this.setText('frenchProgressMcStats', `${this.stats.mcCorrect || 0} / ${this.stats.mcAttempts || 0}`);
      this.setText('frenchProgressSpStats', `${this.stats.spCorrect || 0} / ${this.stats.spAttempts || 0}`);
      this.setText('frenchProgressAccuracy', this.formatPercent(correct, attempts));
      this.renderProgressPanels();
      this.updateHeaderStats();
    },

    renderProgressPanels() {
      const recent = this.getRecentDaily(7);
      const bars = document.getElementById('frenchProgressWeekBars');
      if (bars) {
        const max = Math.max(1, ...recent.map(day => day.totalCount));
        const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
        bars.innerHTML = recent.map((day, index) => {
          const pct = Math.round(day.totalCount / max * 100);
          const label = dayNames[new Date(`${day.date}T00:00:00`).getDay()];
          const latest = index === recent.length - 1 ? ' latest' : '';
          return `<div class="bar-col"><div class="bar${latest}" style="height:${pct}%" title="${day.totalCount} 次练习"></div><div class="bar-day">${label}</div></div>`;
        }).join('');
      }

      const rows = document.getElementById('frenchProgressAccuracyRows');
      if (rows) {
        const pct = (part, whole) => (whole > 0 ? Math.round(part / whole * 100) : 0);
        const mc = pct(this.stats.mcCorrect || 0, this.stats.mcAttempts || 0);
        const sp = pct(this.stats.spCorrect || 0, this.stats.spAttempts || 0);
        const attempts = (this.stats.mcAttempts || 0) + (this.stats.spAttempts || 0);
        const overall = pct((this.stats.mcCorrect || 0) + (this.stats.spCorrect || 0), attempts);
        const row = (label, value) =>
          `<div class="acc-row"><div class="acc-top"><span>${label}</span><b>${value}%</b></div>` +
          `<div class="acc-track"><div class="acc-fill" style="width:${value}%"></div></div></div>`;
        rows.innerHTML = row('选择题', mc) + row('拼写', sp) + row('综合', overall);
        this.setText('frenchProgressTotalAttempts', attempts.toLocaleString());
        this.setText('frenchProgressStreak', `${this.getStreak()} 天`);
      }

      const body = document.getElementById('frenchProgressHistoryBody');
      if (body) {
        body.innerHTML = recent.slice().reverse().map(day => {
          const accuracy = day.totalCount > 0 ? (day.correctCount / day.totalCount * 100).toFixed(1) : '0.0';
          const date = new Date(`${day.date}T00:00:00`);
          const label = `${date.getMonth() + 1}月${date.getDate()}日`;
          return `<tr><td>${label}</td><td>${day.words}</td><td>${this.formatDuration(day.durationMs)}</td><td>${day.totalCount}</td><td>${accuracy}%</td></tr>`;
        }).join('');
      }
    },

    formatDuration(durationMs) {
      const minutes = Math.round((durationMs || 0) / 60000);
      if (minutes < 60) return `${minutes} 分钟`;
      return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
    },

    // 顶部统计条是四种语言共用的：优先交给共享层，否则只在 French 生效，
    // 避免把法语数字留在意大利语/德语/英语页面上。
    updateHeaderStats() {
      const total = this.words.length;
      const masteredCount = this.countMastered();
      const isFrenchShell = this.isFrenchShell();
      if (window.HeaderStats && typeof window.HeaderStats.set === 'function') {
        try {
          window.HeaderStats.set('french', { total, mastered: masteredCount });
          if (!isFrenchShell) this.restoreShellHeaderStats();
          return;
        } catch (error) {
          console.warn('FrenchApp: 共享统计条写入失败:', error);
        }
      }
      if (!isFrenchShell) return this.restoreShellHeaderStats();
      this.setText('totalWords', total.toLocaleString());
      this.setText('masteredWords', masteredCount.toLocaleString());
      this.setText('progressPercent', this.formatPercent(masteredCount, total));
    },

    isFrenchShell() {
      return !document.body || document.body.getAttribute('data-language') === 'french';
    },

    // 顶栏那三个数字只有一份 DOM：法语不是当前语言时必须把它交还给当前语言，
    // 只是"不写"还不够 —— 上一次法语会话留下的 2,157 / 0 会一直挂在意大利语首页上。
    restoreShellHeaderStats() {
      if (this._restoringHeaderStats) return;
      this._restoringHeaderStats = true;
      try {
        const shared = window.HeaderStats;
        if (shared && typeof shared.refresh === 'function') shared.refresh();
        else if (typeof window.updateHeaderStats === 'function') window.updateHeaderStats();
      } catch (error) {
        console.warn('FrenchApp: 顶栏统计交还失败:', error);
      } finally {
        this._restoringHeaderStats = false;
      }
    },

    // 语言切换的入口有好几个（LanguagePortal.selectLanguage、DimRouter 的
    // setLanguageSilently、深链接恢复），它们唯一的共同点是改写 body[data-language]。
    // 因此直接盯住这个属性：一旦从 french 切走就把顶栏交还给新语言。
    watchShellLanguage() {
      const body = document.body;
      this._shellLanguage = (body && body.getAttribute('data-language')) || 'italian';
      if (!body || this._shellLanguageWatched) return;
      this._shellLanguageWatched = true;
      // 只包住 body 这一个元素上的两个方法：属性一改完就同步交还顶栏，
      // 调用方不必等下一个微任务（MutationObserver 是异步的）。
      const app = this;
      ['setAttribute', 'removeAttribute'].forEach(method => {
        const original = body[method];
        if (typeof original !== 'function') return;
        body[method] = function (name) {
          const result = original.apply(this, arguments);
          // 这里绝不能抛：整站的语言切换都要经过 setAttribute
          try {
            if (name === 'data-language') app.syncShellHeaderStats();
          } catch (error) {
            console.warn('FrenchApp: 顶栏语言同步失败:', error);
          }
          return result;
        };
      });
      // 兜底：绕过上面两个方法改属性（或直接换掉 body）时仍能收到通知
      if (typeof MutationObserver === 'function') {
        this._shellLanguageObserver = new MutationObserver(() => this.syncShellHeaderStats());
        this._shellLanguageObserver.observe(body, { attributes: true, attributeFilter: ['data-language'] });
      }
    },

    // 屏幕切换是所有语言切换路径的必经之地，在这里同步跑一次，
    // 调用方读顶栏时不必先等 MutationObserver 的微任务。
    syncShellHeaderStats() {
      const next = (document.body && document.body.getAttribute('data-language')) || 'italian';
      const previous = this._shellLanguage;
      if (next === previous) return;
      this._shellLanguage = next;
      if (previous === 'french' && next !== 'french') this.restoreShellHeaderStats();
    },

    openCommunity(returnScreen) {
      if (window.GermanApp?.openSharedCommunity) {
        window.GermanApp.openSharedCommunity(returnScreen);
      }
    },

    resetQuiz() {
      this.quizIndex = 0;
      this.quizCorrect = 0;
      this.quizTotal = 0;
      this.currentWord = null;
    },

    emptyScopeMessage() {
      if (!this.words.length) return '法语词汇数据尚未加载。';
      return `当前等级（${this.levelFilter}）下没有词条，请选择其它等级。`;
    },

    finishPractice(mode) {
      alert(`French ${mode}练习完成\n\n正确：${this.quizCorrect}/${this.quizTotal}\n正确率：${this.accuracy()}%`);
      this.showScreen('frenchVocabularyModesScreen');
      this.syncScopeChips();
    },

    resetFeedback(id) {
      const wrapper = document.getElementById(id);
      if (wrapper) wrapper.className = 'hidden';
    },

    updateFill(id) {
      const fill = document.getElementById(id);
      if (fill) fill.style.width = `${this.sessionWords.length ? this.quizIndex / this.sessionWords.length * 100 : 0}%`;
    },

    accuracy() {
      return this.quizTotal ? Math.round(this.quizCorrect / this.quizTotal * 100) : 0;
    },

    speak(text) {
      if (!text || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.86;
      const voice = window.speechSynthesis.getVoices().find(item => /^fr/i.test(item.lang));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },

    shuffle(array) {
      const copy = array.slice();
      for (let index = copy.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
      }
      return copy;
    },

    showScreen(screenId, options = {}) {
      if (typeof showScreen === 'function') showScreen(screenId, options);
    },

    goBack(fallbackTarget) {
      if (typeof goBack === 'function') goBack({ fallbackTarget });
      else this.showScreen(fallbackTarget, { skipHistory: true });
    },

    bindClick(id, handler) {
      document.getElementById(id)?.addEventListener('click', handler);
    },

    setText(id, value) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    }
  };

  window.FrenchApp = FrenchApp;
  FrenchApp._internals = { parseHeadword, headwordKey, spellKey, looseKey, deriveVariant, buildNotes, splitNotes };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FrenchApp.init());
  } else {
    FrenchApp.init();
  }
})();
