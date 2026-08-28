# Dimenticato Code Space

> 这份文档是本项目的长期上下文总览（overall context / code space）。
> 
> 目标：以后无论是 Cline 还是其他 AI / 开发者，在修改功能前优先阅读本文件，而不是每次重新扫描整个项目。
> 
> 使用原则：
> 1. **先看本文件，再决定读哪些源码文件**。
> 2. **只进入和当前需求相关的模块文件**。
> 3. **每次修改完成后，必须同步更新本文件**，尤其是“模块职责”“文件映射”“数据结构”“变更记录”“维护说明”几部分。

---

## 1. 项目定位

**Dimenticato** 当前已从“意大利语单语言学习站”演进为“多语言学习站集合”。目前 Italian 仍是功能最完整的主站，German / English 已接入基础可用版本。当前主要服务于以下学习场景：

- 系统词汇学习
- 自定义词本学习与管理
- 社区词本上传 / 浏览 / 导入
- 动词变位练习
- 语法书阅读
- 动词搭配查询
- 动词搭配练习
- 学习统计与历史趋势可视化

### 1.1 技术形态

- **前端架构**：HTML + CSS + 原生 JavaScript
- **运行方式**：直接打开 `index.html` 即可，适合 GitHub Pages
- **本地存储**：`localStorage`
- **远程能力**：Supabase（仅社区词本功能需要）
- **可视化依赖**：Chart.js（CDN）
- **Markdown 渲染**：marked.js（CDN）
- **语音能力**：Web Speech API

### 1.2 项目设计取向

这是一个**静态站点 + 数据内嵌 + 功能模块化 JS 文件**的项目。

特点：

- 页面结构集中在 `index.html`
- 功能逻辑按模块拆在多个 `.js` 文件中
- 一部分模块是“主流程”，一部分模块是“挂载式增强”
- 数据文件多数预编译成 `.js` 常量，以规避 GitHub Pages 上中文路径 / fetch 问题

### 1.3 项目结构

```text
├── index.html
├── styles.css
├── lib/
│   ├── utils.js           ← 共享工具函数（escapeHtml, escapeAttribute, renderIcon）
│   ├── word-similarity.js ← 词形相似度（困难模式相似干扰项，纯函数）
│   ├── quiz-engine.js     ← 通用测验引擎（选择题/拼写/浏览共享逻辑）
│   └── navigation.js      ← 导航核心（showScreen/goBack/fallback/移动端返回；从 app.js 抽出）
├── tests/
│   ├── test-quiz-engine.html       ← QuizEngine + WordSimilarity 单元测试（36 个用例）
│   └── test-spaced-repetition.html ← SM-2 算法测试（17 个用例）
├── app.js                 ← Italian 主站控制器
├── app-enhanced.js        ← 增强层（SM-2, StatsManager, WordbookEditor）
├── community-wordbooks.js ← 社区词本模块
├── conjugation-app.js     ← 动词变位练习
├── grammar-book.js        ← 语法书阅读器
├── verb-collocations.js   ← 动词搭配阅读器
├── verb-collocations-practice.js ← 动词搭配练习
├── stats-charts.js        ← 图表统计
├── german-app.js          ← German/English 站控制器
├── supabase-config.js     ← Supabase 配置
├── vocabulary.js          ← Italian 系统词汇数据
├── data/
│   ├── conjugations-all-tenses.js
│   ├── conjugations-presente.js
│   ├── grammar-data.js
│   ├── verb-collocations-data.js
│   ├── german-vocabulary.js
│   ├── german-grammar-data.js
│   ├── english-vocabulary.js
│   └── english-grammar-data.js
└── scripts/
    ├── parse_grammar.py
    ├── build_grammar_data.py
    ├── parse_verb_collocations.py
    ├── reverso_presente_pipeline.py
    ├── build_german_grammar.py
    ├── build_english_vocab.py
    └── build_english_grammar.py
```

---

## 2. 运行模型总览

### 2.1 启动流程

浏览器打开 `index.html` 后（**2026-08 起为按语言 + 按模块两级懒加载**，旧的全静态清单已废弃）：

1. 加载页面 DOM；`index.html` 内联脚本伪装 `readyState='loading'`（`__ReadyGate`），直到语言包就绪才放行
2. `lib/lang-loader.js` + `lib/boot.js`（仅有的两个静态 `<script defer>`，另有 Chart.js / marked / Supabase 三个 CDN）启动引导：
   - **首屏**：`LangLoader.boot()` 按 URL hash / 上次选择判定当前语言，只注入「该语言的词库数据 + 全部共享代码」
     - 词库清单（`DATA`）：意 `vocabulary.js`；德 `german-vocabulary + german-course-data`；英 `english-vocabulary`；法 `french-vocabulary(-core/-glossary)`
     - 共享代码（`CODE`，顺序承重）：`utils → word-similarity → quiz-engine → typing-game → navigation → router → supabase-config → community-wordbooks → cognate-app → typing-game-app → app → app-enhanced → german-app → german-course → french-app → conjugation-app → stats-charts → grammar-book → verb-collocations → verb-collocations-practice`
   - 注入用 `script.async = false`：并行下载、按序执行
   - 就绪后 `__ReadyGate.release()` + 派发合成 `DOMContentLoaded`，各模块按原顺序初始化
3. **二级模块懒加载**（`MODULES` + `LangLoader.ensureModule(lang, module)`）：变位 / 语法书 / 动词搭配 / 同源词四类数据只在对应模块被打开时才拉。守卫在各 opener 内部：
   - `ConjugationPractice.openFor` / `GrammarBook.init` / `VerbCollocations init` / `VerbCollocationPractice.renderMissingDataset` / `CognateApp.open` / `typing-game-app startGame`（变位模式）/ `app.js` 意语 cognate-btn / `french-app bindGrammar`
   - 首屏因此从「意 16.4MB / 法 28MB」降到「意 5.7MB / 法 15.3MB」
   - `boot.js` 对 `module:start` / `module:done` 事件显示 / 撤加载遮罩
4. `app.js` 在合成 `DOMContentLoaded` 时执行 `bindEvents()` / `loadVocabulary()` 等；其他子模块同样初始化

### 2.2 架构分层

可以把项目理解为 5 层：

1. **语言切换层**：`index.html` + `app.js` 中的 sidebar language switcher / skeleton 导航
2. **页面层**：`index.html`
3. **主状态与主导航层**：`app.js`
4. **功能模块层**：
   - `app-enhanced.js`
   - `community-wordbooks.js`
   - `conjugation-app.js`
   - `grammar-book.js`
   - `verb-collocations.js`
   - `stats-charts.js`
5. **数据层**：
   - `vocabulary.js`
   - `data/*.js`
   - `data/*.json`
   - `data/grammar_content/**/*.md`

---

## 3. 页面与导航结构

所有页面都定义在 **`index.html`** 中，采用多个 `<section class="screen">` 切换显示。

### 3.1 顶级 screen

- `welcomeScreen`：主页 / Hub
- `vocabularyScreen`：词汇来源选择
- `vocabularyModesScreen`：词汇练习模式选择
- `grammarScreen`：语法模块入口
- `conjugationSetupScreen`：动词变位设置页
- `progressScreen`：统计入口页
- `settingsScreen`：设置与数据页
- `multipleChoiceScreen`：选择题练习
- `spellingScreen`：拼写练习
- `browseScreen`：词汇浏览
- `conjugationScreen`：动词变位练习
- `verbCollocationsScreen`：动词搭配阅读器
- `verbCollocationPracticeScreen`：动词搭配练习器
- `grammarBookScreen`：语法书阅读器
- `communityBrowseScreen`：社区词本浏览页
- `germanWelcomeScreen` / `germanVocabularyScreen` / `germanVocabularyModesScreen` / `germanGrammarScreen` / `germanProgressScreen` / `germanSettingsScreen`：德语站基础可用页
- `englishWelcomeScreen` / `englishVocabularyScreen` / `englishVocabularyModesScreen` / `englishGrammarScreen` / `englishProgressScreen` / `englishSettingsScreen`：英语站基础可用页
- `languageSkeletonPlaceholderScreen`：德语 / 英语二阶段数据模块占位页

### 3.2 modal / dialog

同样集中定义在 `index.html`：

- `statsModal`
- `enhancedStatsModal`
- `helpModal`
- `wordbookEditorModal`
- `wordEditDialog`
- `wordbookSelectDialog`
- `communityUploadModal`
- `communityPreviewModal`

### 3.3 关键事实

这个项目**强依赖固定 DOM ID**。

所以只要你要改以下任一内容，必须先看 `index.html`：

- 新增页面
- 新增按钮
- 修改现有流程
- 修改 modal
- 改事件绑定失效问题
- 改 script 加载顺序

---

## 4. 核心全局状态与数据流

### 4.1 `AppState`（定义于 `app.js`）

这是项目最重要的运行时状态对象。

关键字段：

- `vocabulary`：完整系统词汇
- `currentWords`：当前正在学习 / 浏览的词列表
- `selectedLevel`：系统词汇等级（1000 / 3000 / 5000 / all）
- `masteredWords`：当前来源下已掌握单词集合
- `currentMode`：当前练习模式
- `customWordbooks`：本地自定义词本列表
- `currentWordbook`：当前选中的自定义词本
- `selectedSource`：当前词汇来源 id
- `selectedSourceType`：`system` / `custom`
- `portalLanguage`：当前选中的学习语言（`italian` / `german` / `english`）
- `languageSkeletonReturnScreen`：德语 / 英语占位页的返回目标
- `practiceContext`：`vocab` / `conjugation`
- `activeModule`：header 当前模块
- `currentScreen` / `previousScreen` / `navigationStack`
- 测验状态：`quizIndex` / `quizCorrect` / `quizTotal` / `currentWord`
- 基础统计：`stats`

### 4.2 词汇学习主数据流

#### 系统词库流程

1. 用户在 `vocabularyScreen` 选择系统词汇等级
2. `app.js` 设置：
   - `selectedSource = 'system'`
   - `selectedSourceType = 'system'`
   - `selectedLevel`
3. `updateCurrentWords()` 从 `VOCABULARY_DATA` 截取词表
4. `Storage` 从 `localStorage` 读取系统词库进度
5. 用户进入：
   - 选择题 `MultipleChoice`
   - 拼写 `Spelling`
   - 浏览 `Browse`
6. 作答后：
   - 更新 `AppState.masteredWords`
   - 更新 `AppState.stats`
   - `Storage.save()` 持久化

#### 自定义词本流程

1. 用户导入 / 创建词本
2. 词本存入 `AppState.customWordbooks`
3. 点击词本卡片后：
   - `selectedSource = wordbookId`
   - `selectedSourceType = 'custom'`
   - `currentWordbook = wordbook`
   - `currentWords = wordbook.words`
4. 学习进度使用单独的 key：
   - `dimenticato_progress_wb_<id>`
5. 练习逻辑仍复用 `MultipleChoice` / `Spelling` / `Browse`

### 4.3 子模块与主流程关系

- `app.js` 是主控制器
- `app.js` 现在同时承担“语言切换导航 + 意大利语主站导航 + 德语/英语基础站导航”三类职责
- `app-enhanced.js` 是增强层，会**覆盖 / patch** 部分已有逻辑
- `conjugation-app.js` 是独立练习模块，但复用 `showScreen()` 与部分主 UI
- `grammar-book.js` 与 `verb-collocations.js` 是独立阅读型模块
- `community-wordbooks.js` 负责远程数据交互，但会回写本地词本
- `stats-charts.js` 依赖 `StatsManager`（来自 `app-enhanced.js`）

---

## 5. 文件职责地图

这一节是以后修改时最重要的入口索引。

### 5.1 入口与基础文件

#### `index.html`
负责：

- sidebar 中的语言切换入口
- 整个应用的 DOM 结构
- 所有 screen / modal / dialog 的定义
- 所有脚本加载顺序
- 顶部导航、侧边栏、帮助、统计、社区上传、移动端悬浮返回按钮等 UI 骨架

当你要改：
- sidebar 语言切换器
- German / English skeleton 页面

- 页面布局
- 增加新 screen
- 按钮/输入框/模态框
- DOM ID
- 外部 CDN 依赖

先读它。

#### `styles.css`
负责所有 UI 样式。

当你要改：

- 语言门户布局
- German / English skeleton 样式
- 颜色、布局、响应式
- 卡片样式
- modal 样式
- grammar / collocation 阅读布局

读它。

---

## 6. 核心 JS 模块详解

### 6.1 `app.js` — 主应用控制器

这是项目最核心的文件。

负责：

- `ItalianSpeaker` 发音功能
- `LanguagePortal` 语言切换状态、popover 与入口跳转
- `AppState` 全局状态
- `Storage` 本地存储
- 系统词汇加载 `loadVocabulary()`
- screen 切换 `showScreen()`（**已移至 `lib/navigation.js`**，见 6.3.2；`app.js` 仍持有 `AppState`）
- 顶部统计 / breadcrumb / nav 更新
- 选择题模式 `MultipleChoice`
- 拼写模式 `Spelling`
- 浏览模式 `Browse`
- 自定义词本基础管理 `WordbookManager`
- 数据导入导出 / 重置 / 主题切换
- 全局事件绑定 `bindEvents()`

多语言阶段仍保持“非侵入式”原则：

- 默认仍进入原来的 `welcomeScreen`
- 通过 sidebar 中的语言按钮切换 `Italian / German / English`
- German / English 当前已接入词汇练习、语法书入口、基础 Progress / Settings & Data 页面
- 不改现有意大利语数据文件和练习逻辑

#### 修改建议

如果你要改以下内容，优先看 `app.js`：

- 顶部导航和 screen 切换
- 全局返回逻辑 / 历史回退
- 系统词库练习逻辑
- 词汇学习流程
- localStorage key
- 导入导出整体行为
- 头部统计
- 主题切换
- 系统词库 / 自定义词本共用逻辑

#### 特别注意

- 这个文件非常大，而且承担“主入口 + 主状态 + 多功能混合”角色
- 后面的 `app-enhanced.js` 会覆盖其中一部分行为
- 修改时必须注意：某个函数是否已被增强版重写

---

### 6.2 `lib/utils.js` — 共享工具函数

**新增于 2026-04-27 codebase hardening.**

提供全站共享的基础工具函数，必须在所有其他脚本之前加载。

负责：

- `escapeHtml(value)` — HTML 转义，防止 XSS 攻击
- `escapeAttribute(value)` — HTML 属性值转义
- `renderIcon(name)` — SVG 图标渲染

**设计决策：**

- 使用 IIFE 封装，通过 `window.escapeHtml` / `window.escapeAttribute` / `window.renderIcon` 暴露全局函数
- 同时暴露 `window.DimenticatoUtils` 命名空间对象
- 取代了此前在 7 个文件中各自定义的重复 `escapeHtml` 函数

---

### 6.3 `lib/quiz-engine.js` — 通用测验引擎

**新增于 2026-04-27 codebase hardening.**

为选择题、拼写、浏览三种学习模式提供共享逻辑。通过配置对象适配不同语言的字段名。

负责：

- `shuffleArray()` — Fisher-Yates 洗牌
- `generateOptions()` — 生成选择题 4 个选项；按 `config.difficulty` 分支：`'hard'` 调用 `WordSimilarity.pickConfusableDistractors()` 生成相似干扰项，`'easy'`（及回退）使用随机干扰项
- `QuizEngine.getDifficulty()` / `setDifficulty()` — 静态难度偏好读写（localStorage key `dimenticato_quiz_difficulty`，默认 `'hard'`）
- `renderOptions()` — 渲染选项按钮 DOM
- `showFeedback()` — 显示正确/错误反馈
- `highlightOptions()` — 高亮正确答案
- `updateProgress()` — 更新进度 UI
- `normalizeString()` — 文本标准化（拼写模式）

**设计决策：**

- `app.js` (Italian) 和 `german-app.js` (German/English) 各自创建 QuizEngine 实例
- 通过 `fieldMap` 配置适配不同语言（Italian: `{source:'italian', target:'english'}`, German: `{source:'german', target:'meaning'}`, English: `{source:'english', target:'meaning'}`）
  - ⚠️ 历史勘误：本文件曾把 German target 写成 `display`，实际消费方 `german-app.js` 用的是 `meaning`（`display` 仅用于展示可分动词形式如 `ab/bauen`）
- 使用懒初始化模式（`_getEngine()`）避免 DOM 就绪前创建引擎

---

### 6.3.1 `lib/word-similarity.js` — 词形相似度模块

**新增于 2026-06-26（confusable distractors 功能）。**

纯函数模块，无 DOM、无 localStorage，在 `lib/quiz-engine.js` 之前加载。为"困难"难度的选择题挑选与提示词拼写相近的干扰项，提升练习难度。三种语言共用同一逻辑。

负责：

- `editDistance(a, b)` — Levenshtein 编辑距离（归一化：去重音、小写、trim，与 `QuizEngine.normalizeString` 一致）
- `pickConfusableDistractors(currentWord, pool, opts)` — 返回最多 `count` 个干扰项单词对象
  - `opts = { count, sourceField, targetField, correctTarget, windowSize }`
  - 排除当前词、目标文本为空或等于正确答案的词
  - 1–2 字符提示词按频率（`rank`）邻近度排序，否则按编辑距离排序
  - 取最近窗口打乱后取 `count` 个，按目标文本去重；候选不足时回退到窗口外候选、再回退到整池随机，保证选项数量

**设计决策：**

- 保持纯函数、可单元测试，难度读取由各 app 的 engine config 通过 `get difficulty()` getter 注入，引擎本身不读 localStorage
- 无新增数据文件、无 payload 增长，契合纯静态部署

---

### 6.3.2 `lib/navigation.js` — 导航核心模块

**新增于 2026-06-26（nav god-object 拆分）。**

把导航原语从 `app.js` 抽出为独立模块（IIFE，在 `app.js` **之前**加载），所有符号通过 `window.*` 别名暴露以保持向后兼容。

负责（均挂在 `window` 上）：

- `showScreen(id, {skipHistory})` / `goBack(options)`
- `getFallbackBackTarget()` / `getSharedScreenBackTarget()` / `FALLBACK_BACK_MAP` / `makeLanguageFallbackMap()`
- `getPreviousScreenFromHistory()` / `shouldShowMobileBackButton()` / `updateMobileBackButton()`
- `setPracticeContext()`

**设计决策 / 隐性依赖：**

- 它在解析期不触碰 `AppState`（仍定义在 `app.js`，加载更晚）；只有在 DOMContentLoaded 之后被调用时才通过全局词法作用域读取 `AppState`，避免 load-order 崩溃。
- `app.js` / `german-app.js` / `app-enhanced.js` 里的裸调用 `showScreen(...)`/`goBack(...)` 解析到 `window.*`，因此拆分对调用方透明。
- `ScreenMeta` / `makeLanguageScreens()` 仍留在 `app.js`（仅被 app.js 消费）。
- German/English 现已走真实历史栈（2026-06-26 第二轮），原 `isHistoryUnreliableScreen`/`skipHistory` 兜底已移除。

---

### 6.4 `tests/` — 单元测试

**新增于 2026-04-27 codebase hardening；2026-06-26 扩充 WordSimilarity / 难度测试。**

浏览器端自包含测试文件，可直接在浏览器中打开运行。

- `tests/test-quiz-engine.html` — QuizEngine + WordSimilarity 单元测试（36 个测试用例）
  - 涵盖：shuffleArray, generateOptions（含难度分支）, normalizeString, escapeHtml, escapeAttribute, renderIcon
  - WordSimilarity：editDistance 正确性、相近词优先、短词频率邻近、目标去重、easy/hard 行为、候选不足回退
- `tests/test-spaced-repetition.html` — SM-2 间隔重复算法测试（17 个测试用例）
  - 涵盖：初始化、质量评分、间隔计算、easiness 边界、复习历史、getDueWords

**使用方式：** 在浏览器中直接打开 HTML 文件即可查看测试结果（绿色 PASS / 红色 FAIL）。

---

### 6.5 `app-enhanced.js` — 增强层 / Patch 层

这个文件不是独立应用，而是对 `app.js` 的增强扩展。

负责：

- `SpacedRepetition`：SM-2 间隔重复
- `StatsManager`：每日学习统计
- `WordbookEditor`：词本编辑器、单词编辑、批量导入、导出
- `BrowseEnhanced`：增强浏览模式（收藏到词本、编辑等）
- 对 `MultipleChoice.checkAnswer`、`Spelling.checkAnswer`、`Browse.render`、`WordbookManager.renderWordbookCards` 的扩展或覆盖

#### 修改建议

如果你要改以下内容，必须同时看 `app.js` 和 `app-enhanced.js`：

- 词本编辑
- 浏览模式增强
- 间隔重复逻辑
- 每日学习统计
- 当前行为为什么和 `app.js` 里看到的不一样

#### 特别注意

这是典型的“猴子补丁式扩展”文件。

也就是说：

- 原始函数可能在 `app.js`
- 实际运行逻辑可能已经被 `app-enhanced.js` 改写

遇到行为不一致时，优先检查这里有没有 override。

---

### 6.6 `community-wordbooks.js` — 社区词本

负责：

- 社区词本上传弹窗
- 文件选择与校验
- 上传至 Supabase Storage
- 元数据写入 `community_wordbooks` 表
- 浏览社区词本列表
- 搜索 / 难度筛选 / 排序
- 预览远程词本
- 下载远程词本并转成本地自定义词本

依赖：

- `supabase-config.js`
- `WordbookManager.parseTxtWordbook()`
- `WordbookManager.saveWordbooks()`
- `showScreen()`

#### 修改建议

要改这些就看它：

- 社区词本上传/浏览/导入
- Supabase 数据结构对接
- 社区页面筛选逻辑
- 预览 modal

#### 风险点

- `updateDifficultyFilter` 中使用了 `event.target` 风格逻辑，后续若 UI 调整需小心
- 远程文件解析时会复用本地 TXT/JSON 解析逻辑
- 如果 Supabase 不可用，这个模块相关功能会直接失败

---

### 6.7 `conjugation-app.js` — 动词变位练习模块（三语共用）

这是一个相对独立的子系统。**2026-06-30 起按语言 `config` 驱动**：`ITALIAN_CONFIG`（默认）/ `GERMAN_CONFIG` / `ENGLISH_CONFIG` 提供各自 `getData()`、人称、mood 矩阵、`timeOf`、`storageKey`、`backTarget`；`ConjugationPractice.openFor(lang)` 切换语言并复用同一套变位 screen（详见 2026-06-30 变更记录）。下文描述以意大利语为例，德/英同构。

负责：

- 变位数据准备
- 变位查询（支持输入原形或任一变位形式反查并展示完整变位）
- 时态矩阵渲染
- 课次切分
- 题目队列生成
- 三种练习模式：
  - `mcq`
  - `typing`
  - `full`
- 变位练习反馈与 lesson 完成状态保存

依赖数据：

- `CONJUGATION_ALL_TENSES_DATA`
- `CONJUGATION_PRESENTE_DATA`（fallback）

依赖主应用：

- `showScreen()`
- `window.setPracticeContext()`
- `index.html` 中 `conjugationSetupScreen` 和 `conjugationScreen` 的 DOM

#### 修改建议

如果你要改：

- 变位查询 / 原形反查 / 变位反查
- 变位题型
- 时态分组方式
- lesson 切课规则
- 课次完成进度
- 答案校验

主要看 `conjugation-app.js`。

---

### 6.8 `grammar-book.js` — 语法书阅读器

负责：

- 读取全局 `GRAMMAR_DATA`
- 渲染左侧章节树
- 点击 topic 后载入 Markdown 内容
- 更新 breadcrumb
- 展开/折叠 sidebar

依赖：

- `data/grammar-data.js`
- `marked` 库
- `index.html` 中 grammar book 相关 DOM

#### 修改建议

如果你要改：

- 语法书目录树
- 章节阅读 UI
- 语法内容展示方式
- sidebar 行为

看 `grammar-book.js` + `data/grammar-data.js`。

---

### 6.9 `verb-collocations.js` — 动词搭配阅读器

负责：

- 按介词浏览动词搭配
- 搜索动词
- 搜索结果选择器
- 渲染单动词多介词卡片
- 渲染单介词下多动词卡片
- 切换 sidebar

依赖：

- `VERB_COLLOCATIONS_DATA`
- `showScreen()`
- `index.html` 中动词搭配页面 DOM

#### 修改建议

如果你要改：

- 搭配卡片结构
- 搜索逻辑
- 介词导航
- 搭配数据显示字段

看 `verb-collocations.js` + `data/verb-collocations-data.js`。

### 6.9.1 `verb-collocations-practice.js` — 动词搭配练习模块

负责：

- 在 Grammar 模块下提供独立的“动词搭配练习”入口页
- 基于 `VERB_COLLOCATIONS_DATA` 生成题目队列
- 第一版题型包括：
  - 动词选介词（仅单介词动词）
  - 同一动词不同介词辨义（仅多介词动词）
  - 例句翻译（按空格切词、多空输入、下划线占位、可提示部分单词）

题库来源由题型本身决定，不再提供单独“范围”选项。

依赖：

- `VERB_COLLOCATIONS_DATA`
- `showScreen()`
- `index.html` 中 `verbCollocationPracticeScreen` 的 DOM
- 可选复用 `verb-collocations.js` 当前阅读页的搜索/介词上下文

#### 修改建议

如果你要改：

- 动词搭配练习题型
- 题目生成规则
- 练习范围筛选
- 判题与切题流程

先看 `verb-collocations-practice.js`，必要时再看 `data/verb-collocations-data.js`。

---

### 6.10 `stats-charts.js` — 图表统计模块

负责：

- 基于 `StatsManager` 获取统计数据
- 用 Chart.js 绘制：
  - 最近 7 天趋势图
  - 每日单词量柱状图
  - 掌握度分布图
- 增强统计 modal 切 tab

依赖：

- `app-enhanced.js` 中的 `StatsManager` / `SpacedRepetition`
- `Chart.js`
- `AppState.currentWords`

#### 修改建议

改这些看它：

- 图表内容
- 图表样式
- 统计 tab
- 历史记录展示

---

### 6.11 `german-app.js` — 德语站 + 英语站控制器

这是德语与英语学习模块的主控制文件，加载于所有德语/英语数据文件之后。

负责：

- `GermanApp`：德语词汇学习（MC / Spelling / Browse）+ 语法书入口 + 德语 Progress / Settings 基础页逻辑 + 社区词库共享入口返回控制
  - `STORAGE_KEYS`：德语专属 localStorage keys（`DE_MASTERED`, `DE_STATS`, `DE_FILTER`）
  - `init()`：加载 `GERMAN_VOCABULARY_DATA`，绑定所有事件
  - `bindGrammarBookTriggers()`：绑定德语/英语语法书入口按钮（移除 `placeholder-trigger` class，挂载真实 `_openGrammarBook`）
  - `bindLanguageSettingsAndProgress()`：绑定德语/英语的基础 Progress 与 Settings & Data 页面按钮
  - `updateGermanProgressStats()`：渲染德语词汇总量、掌握数、选择题/拼写统计与综合正确率
  - `openSharedCommunity(returnScreen)`：打开共享社区词库并记录返回页面
  - `_openGrammarBook(data, title, backFn)`：以指定语言数据初始化 `GrammarBook`，跳转到 `grammarBookScreen`
  - MC / Spelling / Browse 完整练习逻辑（与意大利语站同构但独立）
- `EnglishApp`：英语词汇学习（MC / Spelling / Browse）+ 英语 Progress 基础统计
  - `STORAGE_KEYS`：英语专属 localStorage keys（`EN_MASTERED`, `EN_STATS`, `EN_FILTER`）
  - `init(germanApp)`：加载 `ENGLISH_VOCABULARY_DATA`，绑定所有事件
  - MC / Spelling / Browse 完整练习逻辑
  - `updateProgressStats()`：渲染英语词汇总量、掌握数、选择题/拼写统计与综合正确率
  - 依赖 `_germanApp`（GermanApp 实例）提供 `showScreen`, `bindClick`, `setText`, `showFeedback`, `resetFeedback`, `escapeHtml`, `escapeAttribute` 等工具方法

依赖：

- `GERMAN_VOCABULARY_DATA`（来自 `data/german-vocabulary.js`）
- `ENGLISH_VOCABULARY_DATA`（来自 `data/english-vocabulary.js`）
- `GERMAN_GRAMMAR_DATA`（来自 `data/german-grammar-data.js`）
- `ENGLISH_GRAMMAR_DATA`（来自 `data/english-grammar-data.js`）
- `GrammarBook`（来自 `grammar-book.js`）
- `showScreen()`（来自 `app.js`）
- `index.html` 中所有德语/英语 screen DOM

#### 修改建议

如果你要改：

- 德语/英语词汇练习逻辑（MC/Spelling/Browse）
- 德语/英语语法书入口
- 德语/英语 Progress / Settings 基础页
- 共享社区词库从德语/英语入口进入后的返回逻辑
- 德语/英语 localStorage key

看 `german-app.js`。

---

### 6.12 `supabase-config.js` — Supabase 配置

负责：

- Supabase URL / anon key
- `initSupabase()`
- `getSupabaseClient()`
- 存储桶配置 `STORAGE_CONFIG`
- 标签列表、难度标签映射

#### 修改建议

如果你要改：

- Supabase 项目连接
- bucket 名称
- 上传限制
- 社区标签、难度映射

看这里。

---

## 7. 数据资产清单

### 7.1 前端直接消费的数据

#### `vocabulary.js`

- 导出：`VOCABULARY_DATA`
- 系统词汇主数据
- 前端启动时直接加载

#### `data/conjugations-all-tenses.js`

- 导出：`CONJUGATION_ALL_TENSES_DATA`
- 动词变位主数据
- 供 `conjugation-app.js` 优先使用

#### `data/conjugations-presente.js`

- 导出：`CONJUGATION_PRESENTE_DATA`
- 旧版兼容 / fallback 数据

#### `data/grammar-data.js`

- 导出：`GRAMMAR_DATA`
- 包含：
  - `tree`
  - `content`
- 避免前端 fetch 中文路径 Markdown 文件

#### `data/verb-collocations-data.js`

- 导出：`VERB_COLLOCATIONS_DATA`
- 包含：
  - `meta`
  - `verbs`
  - `prepositions`

#### `data/german-vocabulary.js`

- 导出：`GERMAN_VOCABULARY_DATA`
- 来源：`deutsch-data/vocab/pgh.csv`（经 `scripts/process_german_vocab.py` 处理）
- 字段：`{ german, display, meaning, chinese, notes, rank, source }`
- **2026-06-26 重建（两轮）**：① 改为按 `wordfreq('de')` 词频排序，修复 51 个引号缺失源行导致的错误 headword，保留 `notes` 与可分动词 `display`（9,361 条）；② 合并 [HanDeDict](https://github.com/gugray/HanDeDict)（**CC-BY-SA 3.0**，中→德反转去重后按词频并入）扩充至 **15,507** 条，并修复 287 处源 CSV 释义瑕疵（`die` → `定冠词 (阴性/复数); 见 der`，0 括号失衡）。合并切片 `deutsch-data/vocab/handedict-de-slice.csv`（452KB；`HANDEDICT_FULL=...` 可全量重建）。top10 由 `ab, ab/bauen…` 变为 `die, und, in, das…`
- ⚠️ 许可：含 HanDeDict（CC-BY-SA 3.0）数据，公开分发需署名 + share-alike（README「数据来源与致谢」与 Help 弹窗已署名）
- 供 `german-app.js > GermanApp` 使用

#### `data/german-grammar-data.js`

- 导出：`GERMAN_GRAMMAR_DATA`
- 来源：`deutsch-data/grammar/docs/`（Docusaurus markdown 目录）
- 结构：与 `GRAMMAR_DATA` 相同：`{ tree: { parts: [...] }, content: { slug: "markdown..." } }`
- 包含 12 个 parts，27 个 topics（德语语法，中文注释）
- 由 `scripts/build_german_grammar.py` 生成
- 供 `german-app.js > GermanApp._openGrammarBook()` 使用

#### `data/english-vocabulary.js`

- 导出：`ENGLISH_VOCABULARY_DATA`
- 来源：`english-data/english word/EnWords.csv`（注意目录名前有空格）+ `wordfreq` 词频
- 字段：`{ english, meaning, chinese, notes, rank, source }`，`source = "wordfreq+EnWords"`
- **2026-06-26 重建（两轮）**：① 改为按 `wordfreq` 真实词频排序（`rank` 1..N），剔除单字母 / 缩写 / 专有名词 / 无释义词，清洗释义（20,000 → 11,961）；② 引入 [ECDICT](https://github.com/skywind3000/ECDICT) 作为 EnWords 缺词时的回退释义源，扩充至 **24,000** 条（`source` 记 `wordfreq+EnWords` 或 `wordfreq+ECDICT`）。回退切片 ` english-data/english word/ecdict-slice.csv`（1.6MB，仅含用到的词头；`ECDICT_FULL=...` 可全量重建）。top10 由 `a, aaal, aachen…` 变为 `the, to, and, of…`
- 由 `scripts/build_english_vocab.py` 生成
- 供 `german-app.js > EnglishApp` 使用

#### `data/english-grammar-data.js`

- 导出：`ENGLISH_GRAMMAR_DATA`
- 来源：`english-data/logical-grammar-master/`（注意目录名前有空格）
- 结构：与 `GRAMMAR_DATA` 相同：`{ tree: { parts: [...] }, content: { slug: "markdown..." } }`
- 包含 5 个 parts（英语逻辑语法）
- 由 `scripts/build_english_grammar.py` 生成
- 供 `german-app.js > GermanApp._openGrammarBook()` 使用（英语语法书）

### 7.2 原始 / 中间数据

#### 语法书原始数据

- `data/1_662531774-意大利语法.md`
- `data/grammar_tree.json`
- `data/grammar_content/**/*.md`

#### 动词搭配原始数据

- `data/1_意大利语动词搭配大全_(裴兰湘著)_(Z-Library).md`

#### 动词变位原始 / 中间数据

- `data/reverso_high_frequency_verbs.json`
- `data/conjugations-all-tenses.json`
- `data/conjugations-all-tenses-failures.json`
- `data/conjugations-presente.json`
- `data/conjugations-presente-failures.json`

#### 其他

- `custom_wordbook_template.json`
- `custom_wordbook_template.txt`
- `TXT_FORMAT_GUIDE.md`

---

## 8. 构建脚本与数据生成流程

### 8.1 `scripts/parse_grammar.py`

用途：

- 把原始语法 Markdown 拆分为章节 topic 文件
- 生成 `data/grammar_content/**`
- 生成 `data/grammar_tree.json`

输入：

- `data/1_662531774-意大利语法.md`

输出：

- `data/grammar_content/**`
- `data/grammar_tree.json`

### 8.2 `scripts/build_grammar_data.py`

用途：

- 把 `grammar_tree.json` + 所有 topic Markdown 嵌入到一个 JS 文件

输出：

- `data/grammar-data.js`

#### 什么时候需要跑

- 修改了 `data/grammar_content/**/*.md`
- 修改了 `data/grammar_tree.json`
- 重新拆分了语法书原始文件

---

### 8.3 `scripts/parse_verb_collocations.py`

用途：

- 解析动词搭配原始 Markdown
- 归一化动词与介词
- 构建前端查询结构

输出：

- `data/verb-collocations-data.js`

#### 什么时候需要跑

- 修改了原始动词搭配 Markdown
- 想改变前端数据结构

---

### 8.4 `scripts/reverso_presente_pipeline.py`

用途：

- 从 Reverso 抓取高频动词及多时态变位
- 生成前端可直接消费的数据文件
- 支持断点续跑

核心输出：

- `data/reverso_high_frequency_verbs.json`
- `data/conjugations-all-tenses.json`
- `data/conjugations-all-tenses.js`
- `data/conjugations-all-tenses-failures.json`

兼容输出：

- `data/conjugations-presente.json`
- `data/conjugations-presente.js`
- `data/conjugations-presente-failures.json`

#### 什么时候需要跑

- 需要更新变位数据
- 需要增加词量
- 需要重建失败项

#### 风险

- 有网络依赖
- 可能遇到 429 / 503 限流
- 会受到 Reverso 页面结构变化影响

---

### 8.5 `scripts/build_german_grammar.py`

用途：

- 读取 `deutsch-data/grammar/docs/` Docusaurus markdown 目录结构
- 解析 `_category_.json` 提取 part/chapter 元数据
- 把所有 topic markdown 内容嵌入一个 JS 文件

输出：

- `data/german-grammar-data.js`（导出 `GERMAN_GRAMMAR_DATA`）

#### 什么时候需要跑

- `deutsch-data/grammar/docs/` 中的 markdown 文件有更新
- 需要重建德语语法数据文件

---

### 8.6 `scripts/build_english_vocab.py`

用途：

- 读取 ` english-data/english word/EnWords.csv`（⚠️ 目录名前有空格）
- 取前 20,000 条，转换字段格式
- 生成 JS 常量文件

输出：

- `data/english-vocabulary.js`（导出 `ENGLISH_VOCABULARY_DATA`）

#### 什么时候需要跑

- EnWords.csv 有更新
- 想调整截取条数或字段映射

#### 注意

- 源目录 ` english-data/` 前有一个空格，路径引用时必须保留

---

### 8.7 `scripts/build_english_grammar.py`

用途：

- 读取 ` english-data/logical-grammar-master/` 目录（⚠️ 目录名前有空格）
- 处理 markdown 文件，组装为语法树
- 生成 JS 常量文件

输出：

- `data/english-grammar-data.js`（导出 `ENGLISH_GRAMMAR_DATA`）

#### 什么时候需要跑

- `logical-grammar-master/` 中的 markdown 文件有更新
- 需要重建英语语法数据文件

#### 注意

- 源目录 ` english-data/` 前有一个空格，路径引用时必须保留

---

## 9. 修改任务到文件的映射

这一节是以后让 AI 快速定位文件的核心。

### 9.1 改首页、导航、screen 切换

先看：

- `index.html`
- `app.js`

如果是：

- 改 sidebar 语言切换器
- 改 German / English skeleton 导航
- 改语言切换到 Italian / German / English 主站的跳转

也看这两个文件。

### 9.2 改系统词汇学习流程

先看：

- `app.js`

涉及：

- `AppState`
- `MultipleChoice`
- `Spelling`
- `Browse`
- `Storage`

### 9.3 改自定义词本导入、编辑、浏览增强

先看：

- `app.js`
- `app-enhanced.js`

如果是格式模板相关，再看：

- `custom_wordbook_template.json`
- `custom_wordbook_template.txt`
- `TXT_FORMAT_GUIDE.md`

### 9.4 改社区词本

先看：

- `community-wordbooks.js`
- `supabase-config.js`
- `index.html`

如果涉及数据库 / bucket 规则，再看：

- `supabase-setup.sql`
- `supabase-storage-fix.sql`
- `SUPABASE_TROUBLESHOOTING.md`

### 9.5 改动词变位练习

先看：

- `conjugation-app.js`
- `index.html`

如果涉及数据结构，再看：

- `data/conjugations-all-tenses.js`
- `data/conjugations-presente.js`
- `scripts/reverso_presente_pipeline.py`

### 9.6 改语法书阅读器或语法内容

先看：

- `grammar-book.js`
- `index.html`

如果是内容或目录：

- `data/grammar-data.js`
- `data/grammar_tree.json`
- `data/grammar_content/**/*.md`

如果是再生成流程：

- `scripts/parse_grammar.py`
- `scripts/build_grammar_data.py`

### 9.7 改动词搭配功能

先看：

- `verb-collocations.js`
- `verb-collocations-practice.js`
- `index.html`

如果是数据：

- `data/verb-collocations-data.js`
- `scripts/parse_verb_collocations.py`

### 9.8 改统计 / 图表

先看：

- `stats-charts.js`
- `app-enhanced.js`

必要时再看：

- `app.js`
- `index.html`

### 9.9 改 LocalStorage 结构或导入导出

先看：

- `app.js`
- `app-enhanced.js`

---

## 10. LocalStorage 约定

### 10.1 主 key

定义主要在 `app.js > Storage.KEYS`：

- `dimenticato_mastered`
- `dimenticato_stats`
- `dimenticato_level`
- `dimenticato_theme`
- `dimenticato_custom_wordbooks`
- `dimenticato_daily_stats`

### 10.2 德语 / 英语站专属 key

定义在 `german-app.js > GermanApp.STORAGE_KEYS` 和 `EnglishApp.STORAGE_KEYS`：

- `dimenticato_german_mastered`
- `dimenticato_german_stats`
- `dimenticato_german_filter`
- `dimenticato_english_mastered`
- `dimenticato_english_stats`
- `dimenticato_english_filter`

说明：

- German / English 各自的 Progress 页面直接读取这些语言专属 key
- 全站导入 / 导出仍主要由 `app.js > Storage` 统一负责，因此如果后续要把德语/英语专属 key 一并纳入备份，需要同步扩展导入导出结构

### 10.3 动态 key

- 自定义词本学习进度：`dimenticato_progress_wb_<id>`
- 动词变位课次：`dimenticato_conjugation_lessons`

### 10.3 修改注意

如果改动任一 key：

- 需要检查旧数据兼容性
- 需要同步检查导出 / 导入逻辑
- 需要更新本文件

---

## 11. 隐性依赖与容易踩坑的地方

### 11.1 script 顺序不能随便改

例如：

- `app-enhanced.js` 依赖 `app.js` 中已有对象
- `grammar-book.js` 依赖 `data/grammar-data.js`
- `verb-collocations.js` 依赖 `data/verb-collocations-data.js`
- `community-wordbooks.js` 依赖 `supabase-config.js`

### 11.2 DOM ID 是强绑定的

大部分 JS 直接 `getElementById()`。

所以只要你：

- 改 ID
- 改按钮结构
- 抽组件

都要同步检查对应绑定。

### 11.2.1 移动端返回现在有“全局悬浮返回按钮”

`app.js` 现在提供统一的 `goBack()`：

- 优先使用 `navigationStack` 做历史回退
- 历史不可用时，再按当前 `screen` fallback

移动端会显示全局悬浮返回按钮 `mobileFloatingBackBtn`，桌面端保持隐藏。

因此后续如果新增新的二级 screen：

- 需要检查它是否应该显示悬浮返回按钮
- 需要检查 `getFallbackBackTarget()` 是否要补该 screen 的兜底返回目标
- 如果子模块内部自己绑定了返回事件，也应优先复用 `goBack()` 而不是直接写死 `showScreen()`

### 11.3 `app-enhanced.js` 会覆盖已有逻辑

最典型：

- `Browse.render`
- `WordbookManager.renderWordbookCards`
- 测验模式的答题处理

如果你只改 `app.js`，可能不会生效。

### 11.4 社区功能依赖远程服务

如果：

- Supabase key 失效
- bucket 配置不对
- 表结构不匹配

社区上传 / 浏览 / 下载会失败，但本地学习功能不一定受影响。

### 11.4.1 当前社区词库是“多语言共享池”

- Italian / German / English 当前都进入同一个 `communityBrowseScreen`
- `community-wordbooks.js > backToWelcome()` 不再固定返回 Italian 的 `vocabularyScreen`，而是优先读取 `window.GermanApp.communityReturnScreen`
- 当前上传表单中的 `language` 字段仍默认写入 `Italian`，说明社区语言筛选尚未真正完成；如果未来要做按语言隔离或筛选，需同时修改前端上传、浏览查询与 Supabase 数据结构

### 11.5 语法书和动词搭配都采用“预编译 JS 数据”模式

前端不是实时 fetch 原 Markdown，而是加载已经构建好的 JS 常量。

所以改内容后，通常还需要重新生成对应数据文件。

---

## 12. 推荐修改工作流（给 AI / Cline）

以后每次修改本项目，建议严格按下面流程操作：

### Step 1. 先阅读本文件

必须先读：

- `CODE_SPACE.md`

### Step 2. 明确本次修改属于哪个模块

从下面选一个或多个：

- 首页 / 导航
- 词汇学习
- 自定义词本
- 社区词本
- 动词变位
- 语法书
- 动词搭配
- 统计图表
- 样式 / 布局
- 数据脚本 / 构建

### Step 3. 只读取相关文件

例如：

- 改动词搭配 → 只读 `verb-collocations.js`、`index.html`、必要时读 `data/verb-collocations-data.js`
- 改语法书内容 → 只读 `grammar-book.js`、`data/grammar-data.js`、必要时读 `scripts/build_grammar_data.py`

### Step 4. 修改完成后，必须回写本文件

至少更新以下内容中的相关项：

- 模块职责是否变化
- 文件映射是否变化
- 新增了哪些文件
- 数据结构是否变化
- 是否新增脚本 / 构建步骤
- 是否新增风险点 / 依赖
- 更新文末变更记录

---

## 13. 给 AI 的 instruction template

下面这段可以在以后作为 prompt 模板复用：

```md
先阅读 `CODE_SPACE.md`，把它当作本项目的整体上下文。

规则：
1. 不要重新扫描整个项目，先根据 `CODE_SPACE.md` 判断本次需求涉及哪个模块。
2. 只读取与本次需求直接相关的文件。
3. 如果修改影响了模块职责、文件结构、数据结构、脚本流程或依赖关系，完成后必须更新 `CODE_SPACE.md`。
4. 如果新增功能，请在 `CODE_SPACE.md` 中补充：
   - 功能简介
   - 涉及文件
   - 数据流变化
   - 维护说明
5. 如果删除或重构功能，也要同步更新 `CODE_SPACE.md` 中对应章节。
```

---

## 14. 文档维护规则

### 14.1 必须更新本文件的场景

- 新增 screen / modal
- 新增主模块文件
- 修改主数据流
- 修改 localStorage 结构
- 修改 Supabase 结构
- 修改数据生成脚本
- 修改任何模块职责边界

### 14.2 可选更新场景

- 小型样式微调
- 文案修正
- 纯 bugfix 且不影响结构

但如果是频繁修改，仍建议补一条记录。

---

## 15. 变更记录

### 2026-03-16

- 新建 `CODE_SPACE.md` 作为项目级整体上下文文档。
- 梳理了以下内容：
  - 页面与 screen 结构
  - `app.js` 主状态与主流程
  - `app-enhanced.js` 的增强与 override 关系
  - 社区词本、动词变位、语法书、动词搭配、统计图表模块职责
  - 数据文件与构建脚本映射
  - 未来使用 Cline 时的 instruction template
- 后续要求：每次较大功能修改后都应同步更新本文件。

### 2026-03-16（动词搭配练习）

- 在 Grammar 外层入口新增“动词搭配练习”，与“动词变位 / 语法书 / 动词搭配”并列。
- 新增独立 screen：`verbCollocationPracticeScreen`。
- 新增模块文件：`verb-collocations-practice.js`。
- 第一版练习支持：
  - 动词选介词（仅单介词动词）
  - 同动词不同介词辨义（仅多介词动词）
  - 例句翻译（多空输入 + 下划线占位 + 提示机制）
- 动词搭配模块职责拆分为：
  - `verb-collocations.js`：查阅 / 浏览
  - `verb-collocations-practice.js`：做题 / 练习

### 2026-03-17（词本选择跳转修复）

- 修复 Vocabulary 模块中的来源选择不一致问题：
  - 选择“系统词汇库”后会进入 `vocabularyModesScreen`
  - 选择“我的词本”后现在也会进入 `vocabularyModesScreen`
- 修复位置：`app.js > WordbookManager.selectWordbook(id)`。
- 说明：自定义词本卡片点击仍先完成 `selectedSource / selectedSourceType / currentWordbook / currentWords` 与进度加载，再统一跳转到练习方式页。

### 2026-03-18（移动端返回体验优化）

- 为手机端新增全局悬浮返回按钮：`index.html > mobileFloatingBackBtn`。
- 在 `styles.css` 中新增移动端悬浮返回按钮样式，仅在小屏显示，并避开底部工具栏。
- 在 `app.js` 中新增统一返回逻辑：
  - `goBack()`
  - `getFallbackBackTarget()`
  - `updateMobileBackButton()`
- 返回逻辑现在优先基于 `AppState.navigationStack` 做历史回退，历史不可用时再按 screen fallback。
- 已接入的返回入口包括：
  - Vocabulary / Grammar / Progress / Settings / 模式选择页顶部返回
  - 选择题 / 拼写 / 浏览页返回
  - 动词变位、语法书、动词搭配、动词搭配练习页返回
- 设计目标：只增强手机端长页面返回体验，尽量不改变桌面端视觉布局。

### 2026-03-19（多语言入口第一阶段）

- 初版先尝试新增 `languagePortalScreen` 作为默认入口页，用于选择 Italian / German / English。
- 在 `index.html` 中新增 German / English 第一阶段 skeleton screens：
  - Home
  - Vocabulary
  - Vocabulary Modes
  - Grammar
  - Progress
  - Settings & Data
- 新增 `languageSkeletonPlaceholderScreen`，用于 German / English 二阶段模块占位与数据准备提示。
- 在 `app.js` 中新增：
  - `AppState.portalLanguage`
  - `AppState.languageSkeletonReturnScreen`
  - `LanguagePortal`
  - German / English skeleton screen 的导航绑定与回退逻辑
- 在 `styles.css` 中新增语言门户布局和 skeleton 页面样式。
- 当前阶段说明：
  - Italian 为真实可运行站点
  - German / English 仅完成信息架构与导航骨架
  - 二阶段再补词汇、语法、变位、搭配等数据

### 2026-03-19（语言切换改为 sidebar）

- 根据体验反馈，取消“大语言入口页”作为默认首页。
- 默认入口恢复为原意大利语主站 `welcomeScreen`。
- 在左侧 sidebar 新增语言切换按钮与 `languageSwitcherPopover`：
  - Italian
  - German
  - English
- `LanguagePortal` 现在主要负责：
  - 当前语言状态同步
  - 给 `body` 写入 `data-language`，驱动不同语言的视觉主题变量
  - sidebar popover 展开/收起
  - 切换后跳转到对应语言站点首页
- `languagePortalScreen` 已不再参与主流程；German / English skeleton screens 保留，继续作为第二阶段数据接入前的骨架页面。

### 2026-03-19（按语言切换色调）

- 保留现有整体设计风格与变量体系，只在语言切换时通过 `body[data-language]` 覆盖主题变量。
- 当前语言色调约定：
  - Italian：现有鼠尾草绿 / muted green
  - German：蓝灰 / slate blue
  - English：英伦酒红 / muted burgundy
- 实现位置：
  - `app.js > LanguagePortal.selectLanguage(language)`：同步写入 `body[data-language]`
  - `styles.css`：为 German / English 的明暗主题分别覆写 accent 变量与背景光晕

### 2026-03-19（德语/英语数据第二阶段完整接入）

本次将德语与英语数据完整接入多语言框架，German / English 从骨架页升级为可用站点。

**新增数据文件（预编译 JS）：**
- `data/german-grammar-data.js`（`GERMAN_GRAMMAR_DATA`）：德语语法书，12 parts，27 topics
- `data/english-vocabulary.js`（`ENGLISH_VOCABULARY_DATA`）：英语词汇，约 20,000 条
- `data/english-grammar-data.js`（`ENGLISH_GRAMMAR_DATA`）：英语逻辑语法书，5 parts

**新增构建脚本：**
- `scripts/build_german_grammar.py`：从 `deutsch-data/grammar/docs/` 生成德语语法 JS
- `scripts/build_english_vocab.py`：从 `english-data/english word/EnWords.csv` 生成英语词汇 JS
- `scripts/build_english_grammar.py`：从 `english-data/logical-grammar-master/` 生成英语语法 JS

**新增前端模块：**
- `german-app.js`：
  - `GermanApp`：德语词汇练习（MC/Spelling/Browse）+ 语法书入口（含 `bindGrammarBookTriggers`）
  - `EnglishApp`：英语词汇练习（MC/Spelling/Browse）
  - 新增 6 个 localStorage key（德语/英语各 3 个）

**修改文件：**
- `index.html`：
  - 新增英语练习 screens（`englishMultipleChoiceScreen`, `englishSpellingScreen`, `englishBrowseScreen`）
  - 新增 5 个 `<script>` 标签（4 个数据文件 + `german-app.js`）
- `grammar-book.js`：
  - 移除 `initialized` 永久标志 BUG，改为每次调用 `init()` 都重建导航树
  - 新增 `sidebarListenerAdded` 标志，仅防止 sidebar toggle 重复绑定
  - 修复意大利语 → 德语 → 意大利语切换时语法书不重新加载的问题

**数据格式约定（新增语言统一采用）：**
- 词汇：`{ english/german, meaning, chinese, notes, rank, source }`
- 语法：`{ tree: { parts: [{title, slug, chapters:[{title, slug, topics:[{title,slug}]}]}] }, content: { slug: "markdown..." } }`

### 2026-03-20（德语/英语入口完善 + 多语言文案更新）

- 将站点主标题从“意大利语背单词”统一改为“背单词”。
- 更新 `index.html` 顶部品牌标题、`<title>` 与帮助说明文案，使其从意大利语单语言描述升级为多语言描述。
- 更新 `README.md` 为多语言版本说明：
  - Italian 为完整主站
  - German / English 为基础可用版本
  - 社区词库当前三种语言共享同一个资源池

**德语模块调整：**
- `German / Grammar` 现在只保留 `Grammar Book`。
- 移除德语 Grammar 中原先的 Verb Conjugation / Verb Collocations / Verb Collocations Practice 占位入口。
- `German / Vocabulary` 中的 `Community Wordbooks` 现在直接进入共享社区词库页面。
- `German / Progress` 从占位页升级为基础统计页，展示：
  - 词汇总量
  - 已掌握数量
  - 当前进度
  - 选择题/拼写统计
  - 综合正确率
- `German / Settings & Data` 从占位页升级为基础说明页，增加：
  - 当前支持能力说明
  - 共享社区词库入口
  - 跳转全站 `Settings & Data` 的入口

**英语模块调整：**
- `English / Grammar` 现在只保留 `Grammar Book`。
- 移除英语 Grammar 中原先的 Verb Forms / Collocations / Collocations Practice 占位入口。
- `English / Vocabulary` 中的 `Community Wordbooks` 现在直接进入共享社区词库页面。
- `English / Progress` 从占位页升级为基础统计页，展示：
  - 词汇总量
  - 已掌握数量
  - 当前进度
  - 选择题/拼写统计
  - 综合正确率
- `English / Settings & Data` 从占位页升级为基础说明页，增加：
  - 当前支持能力说明
  - 共享社区词库入口
  - 跳转全站 `Settings & Data` 的入口

**相关代码变更：**
- `index.html`
  - 更新站点主标题与帮助说明
  - 精简德语/英语 Grammar 入口为仅保留 `Grammar Book`
  - 为德语/英语新增基础 Progress / Settings & Data 展示卡片与按钮
- `german-app.js`
  - 新增 `communityReturnScreen`
  - 新增 `bindLanguageSettingsAndProgress()`
  - 新增 `openSharedCommunity(returnScreen)`
  - 新增 `updateGermanProgressStats()`
  - 新增 `EnglishApp.updateProgressStats()`
  - 暴露 `window.GermanApp` / `window.EnglishApp`
- `community-wordbooks.js`
  - `backToWelcome()` 改为按 `communityReturnScreen` 返回对应语言来源页，而不再固定返回意大利语 Vocabulary

### 2026-03-22（动词变位查询）

- 在 `conjugationSetupScreen` 中新增“变位查询”区域，可直接输入：
  - 动词原形（如 `essere`）
  - 任意一个变位形式（如 `sono` / `fossi` / `stato`）
- `conjugation-app.js` 新增查询索引构建与结果渲染逻辑：
  - 启动时扫描 `CONJUGATION_ALL_TENSES_DATA`
  - 建立“原形 -> 动词”和“变位形式 -> 原形候选”的前端索引
  - 命中后展示该动词所有时态的完整变位
- `styles.css` 新增查询区、结果卡片、时态卡片样式，并适配移动端。
- 当前查询结果会忠实展示 `data/conjugations-all-tenses.js` 中已有数据；若源数据存在缺项或异常形式，查询结果也会原样反映。

### 2026-04-27 — Codebase Hardening

**安全修复：**
- 修复 app.js 中所有 XSS 漏洞：wordbook 名称、描述、笔记、选项等用户数据均通过 `escapeHtml()` 转义
- CDN 脚本添加 SRI integrity hash（Chart.js 4.4.0, marked.js 9.1.6, Supabase 2.39.0）
- Supabase SDK 版本从 `@2`（自动大版本更新）锁定至 `@2.39.0`

**代码质量：**
- 新增 `lib/utils.js`：提取 7 个文件中的重复 `escapeHtml` 定义到共享模块
- 新增 `lib/quiz-engine.js`：提取通用测验引擎，消除 Italian/German/English 练习模式代码重复
- ScreenMeta 从 ~170 行手写定义重构为 `makeLanguageScreens()` 工厂函数

**用户体验：**
- 加载界面从静态 spinner 改为带动画进度条的加载流程，显示数据加载各阶段状态

**测试：**
- 新增 `tests/` 目录，包含 36 个浏览器端单元测试（QuizEngine 19 个 + SM-2 算法 17 个）

**文档：**
- 更新 CODE_SPACE.md 反映新的 lib/ 和 tests/ 目录、脚本加载顺序

### 2026-06-26 — 选择题相似干扰项（Confusable Distractors）

**新功能：**
- 新增"选择题难度"设置（Settings → 学习偏好）：`简单`=随机干扰项（旧行为），`困难`=拼写相近干扰项，默认 `困难`
- 新增 `lib/word-similarity.js`（纯函数：Levenshtein 编辑距离 + 相似干扰项挑选）
- `lib/quiz-engine.js` `generateOptions()` 按 `config.difficulty` 分支；新增静态 `getDifficulty()`/`setDifficulty()`（localStorage key `dimenticato_quiz_difficulty`）
- Italian / German / English 三个 engine config 各增 `get difficulty()` getter，设置改动下一题即生效，无需刷新
- `index.html` 加载新脚本并新增 `#difficultyToggle` 设置 UI；`app.js` `initDifficultyToggle()` 负责读写与高亮；`styles.css` 新增 `.settings-section` / `.difficulty-*` 样式

**测试：**
- `tests/test-quiz-engine.html` 扩充至 36 个用例（新增 WordSimilarity 与难度分支测试）

**范围说明：**
- 仅影响选择题模式；拼写、浏览模式不变。词性感知干扰项、预计算混淆集、意大利语"显示汉语"答案切换（Phase 2）暂未实现

### 2026-06-26 — 三线并行改进（数据 / UI / 导航）

通过 3 个 git worktree + 并行 subagent 完成三条互不重叠的改进线，分别合并入 main。

**① 数据更正（`improve/data`）：**
- English：`data/english-vocabulary.js` 按 `wordfreq` 真实词频重排，剔除缩写/专名/无释义词并清洗释义，20,000 → 11,961 条；重写 `scripts/build_english_vocab.py`
- German：`data/german-vocabulary.js` 按 `wordfreq('de')` 词频重排，修复 51 个错误 headword，保留 `notes`/`display`；重写 `scripts/process_german_vocab.py`
- Italian：新增 `scripts/clean_italian_dictionary.py`，剥离 `dictionary` 字段中的 IPA/音标噪声（19,303/27,117 条），`english`/`chinese`/`frequency`/`rank` 字节级不变
- 勘误：实测 German/English 测验 `fieldMap.target` 为 `meaning`（本文件原误记为 `display`，已更正）
- ⚠️ 已知遗留：German rank-1 `die` 的释义 `见 der)` 等少量源 CSV 排版瑕疵未清理（计划后续修复）

**② UI 统一（`improve/ui`，仅 `styles.css`）：**
- 将原先并存的两套配色（旧 flat-UI `:root` + 散落的 `rgba(85,107,96,…)` 硬编码）合并为**单一语义 token 体系**（accent ramp + `--accent-*-rgb` 通道、surface/elevation、text、border、radii/shadow/space/motion 标度、`--focus-ring`）
- dark 主题与 german(slate)/english(burgundy) 语言主题改为**只覆盖 accent + surface token**，其余派生
- 修复 dark 模式下若干白底泄漏 bug；新增全局 `:focus-visible` 焦点环
- 注意：部分 `--space-*` / `--shadow-sm` / `--border-strong` 已定义但仅部分采用，留待增量推进

**③ 导航修复（`improve/nav`，仅 `app.js`）：**
- `getFallbackBackTarget()` 扩展德/英镜像站与共享屏（grammarBook/community 按 `body[data-language]` 解析返回目标）
- `goBack()` 新增 `isHistoryUnreliableScreen()` 守卫：德/英屏（`skipHistory` 导航）改用 fallback map，避免读到陈旧 Italian 历史
- `shouldShowMobileBackButton()` 对德/英 hub 与顶层屏隐藏悬浮返回按钮
- 修复共享 `grammarBookBackBtn` 双重绑定（Italian 处理器在德/英下让位给 `GermanApp`）
- `LanguagePortal.selectLanguage()` 切语言时重置 `navigationStack`
- **未执行的提案（已获批，列入下一轮）**：抽取 `lib/navigation.js`、把德/英统一到真实历史栈、`ScreenMeta` 驱动 back-map、跨语言 hub 对齐、清理死代码/重复绑定

### 2026-06-26 — 第二轮（数据扩充 / 导航重构 / 署名）

承接上一轮提案，继续用 2 个 worktree + 并行 subagent 完成：

**① 数据扩充（`improve/data-v2`）：**
- English：引入 ECDICT 回退释义源，11,961 → **24,000**（committed `ecdict-slice.csv` 1.6MB）
- German：合并 HanDeDict（CC-BY-SA 3.0），9,361 → **15,507**，并修复 287 处源释义瑕疵（committed `handedict-de-slice.csv` 452KB）
- 字段契约与全局常量名不变；两文件均 0 空答案、rank 连续

**② 导航重构（`improve/nav-refactor`，分 3 阶段）：**
- 新增 `lib/navigation.js`，把导航核心从 `app.js` god-object 抽出（`window.*` 别名，行为不变，app.js -214 行）
- German/English 改走真实历史栈，~20 个返回按钮统一走 `goBack()`；移除上一轮 `skipHistory` 兜底
- 清理死代码 `WordbookManager.showManagementScreen()`、去重 `goGerman/EnglishProgressBtn` 双重绑定
- 验证：50/50→57/57 行为对等 harness + headless Chrome 交互探针 + 渲染启动

**③ 署名（CC-BY-SA / ECDICT）：**
- `README.md` 新增「数据来源与致谢」表 + 许可证段 share-alike 提示
- `index.html` Help 弹窗新增「数据来源与致谢」段（ECDICT / HanDeDict / wordfreq / Chart.js / marked.js）

**仍未做（IA/内容决策，留待后续）：** 跨语言 hub 对齐（德/英 Grammar 缺意大利语独有模块，建议显式标注 Italian-only 或加 coming-soon stub）。

### 2026-06-30 — German / English 动词变位（Codex + Claude 协作）

为德语 / 英语补齐综合动词变位（表格 + 练习），把 German/English 的 Grammar 从「仅语法书」升级到「语法书 + 动词变位」。**Codex 负责数据，Claude 负责前端 + 集成验证。**

**新增数据（Codex，`scripts/build_*_conjugations.py` 生成）：**
- `data/german-conjugations.js`（`GERMAN_CONJUGATION_DATA`，300 动词，按 wordfreq 排序）：Indikativ/Konjunktiv/Imperativ 全时态 + Partizip/Infinitiv。**规则生成 + 人工不规则表（对照 Reverso/Wiktionary 校验）**。
- `data/english-conjugations.js`（`ENGLISH_CONJUGATION_DATA`，500 动词）：12 个 indicative aspect + conditional + imperative + non-finite。由 `verbecc`/`mlconjug3` 生成。
- 两者 schema 与 `data/conjugations-all-tenses.js` 完全一致（`{rank,infinitive,frequency,english,chinese,tenses:{<key>:{type,group_label,tense_label,forms}}}`）。
- 校验：58/58 人工抽查变位正确（含强变化动词 nehmen/essen/bitten… 的 Präteritum/Partizip II）、0 schema 缺陷。

**前端改造（`conjugation-app.js`）：**
- 从「硬编码意大利语」重构为 **按语言 `config` 驱动**（`{lang, getData(), personOrder, personLabel, moods:[{key,label,match}], timeOf(meta), storageKey, backTarget, localeSort}`）；`ITALIAN_CONFIG` 为默认，意大利语行为字节级不变。
- 新增 `ConjugationPractice.openFor(lang)`：切换 config + 重建数据/时态矩阵/课次，复用**同一套** `conjugationSetupScreen`/`conjugationScreen`（与 grammar book 相同的「共享屏」模式）。每语言独立 lesson 进度 key（`dimenticato_conjugation_lessons` / `…_de` / `…_en`）。
- `GERMAN_CONFIG.timeOf` 把 Konjunktiv I/II 与 Imperativ 归入「现在」列；`ENGLISH_CONFIG.timeOf` 处理 Conditional 体（perfect→过去，其余→现在）+ Imperative，避免落入「其他时态」。
- 数据缺失时显示「数据未加载」而非崩溃。

**其他文件：**
- `index.html`：德/英 Grammar hub 各加「动词变位」卡片（`data-module="conjugation"`）；加载两个新数据脚本（在意大利语变位数据之后、`app.js` 之前）。
- `german-app.js`：新增 `bindConjugationTriggers()` + `_openConjugation(lang)`（仿 `_openGrammarBook`）。
- `lib/navigation.js`：`getSharedScreenBackTarget` 让德/英语境下 `conjugationSetupScreen`→`${lang}GrammarScreen`。
- README / Help：补充 verbecc / mlconjug3 / 德语规则生成的署名。

**已落地：** 这一项部分实现了上一轮遗留的「跨语言 hub 对齐」——德/英 Grammar 现与意大利语一样含动词变位（动词搭配仍为意大利语专属）。

### 2026-08-21 — 反向出题 + P0 收尾 + 德/英进度对齐

**清理：**
- 删除内层 `dimenticato/`（PinMe 全栈模板脚手架，未被 git 跟踪、无引用）：不做账号/云同步，避免混淆
- 删除 `vocabulary_fixed.js`（6.3MB，仅被一次性修正脚本作为输出产物引用，应用不加载）

**P0 修复：**
- 德/英语法中心的「动词搭配·即将推出」静态禁用卡片删除（index.html）；入口统一由 `verb-collocations.js` 运行时注入
- `installLanguageHubCards()` 重写为幂等可升级：卡片文案随数据状态刷新、练习卡随就绪补插/移除；并订阅 `LangLoader.on('done')`，修复懒加载下（先启动别门语言）搭配卡片整个会话停留在「建设中」的 bug
- 英语语法书/动词变位卡片绑定从 `GermanApp.init` 级联挪到 `EnglishApp._bindGrammarHubCards()`（EnglishApp.init 调用）：修复英语直连 `#/en/…` 时德语词库缺席、级联断掉导致英语卡片失活；共享 `grammarBookBackBtn` 用闭包标志 `grammarBookBackBound` 防双绑
- `stats-charts.js` 掌握度环形图改用 `ReviewSession.wordsFor(lang)` + `getWordStatus(word, lang)`：从德/法进度页打开完整统计不再画意语数据
- `verb-collocations.js` 头部过时注释（「只有意大利语有数据」）更正

**反向出题模式（选择题出题方向）：**
- `lib/quiz-engine.js` 新增方向偏好：`getDirection/setDirection`（全局 key `dimenticato_quiz_direction`，分语言 `_lang` 后缀，语义与难度开关一致）；实例方法 `isReverse/correctAnswerFor/questionTextFor/shouldSpeakQuestion/applyDirectionLabels`
- `generateOptions()` 方向感知：反向时选项取外语词形、干扰项按外语拼写相近挑选（hard 档），并排除「释义与题面同义」的 twin 词条（两个词释义相同时反向题里两个选项都对）
- 四语言 MC 流程接线（题面/标签/判分字段/朗读防护——反向朗读词形等于报答案）：`app.js`（意）、`german-app.js`（德/英）、`french-app.js`（法）；四个 MC 屏的题面/选项标签加 id 并按方向切换文案
- 设置 UI：意语全站设置页静态开关（`#directionToggle` + `app.js initDirectionToggle()`）；德/英/法由 `QuizEngine.renderDirectionToggle` 注入，与难度开关共用「学习偏好」卡片（`mountDifficultyToggles` 一并挂载、`sync/bindDirectionToggles` 委托绑定）
- 注意：`app.js` 的 `MultipleChoice.loadQuestion` 有两个定义——对象字面量里的那份被文件末尾 SRS 增强版（~2979）覆盖，方向逻辑改在生效的那份上
- 测试：`tests/test-quiz-engine.html` 新增 30 个用例（方向 API、反向选项生成、twin 排除、hard+reverse、正向回归、控件标记），总计 363 用例全过

**德/英进度页对齐法语：**
- `index.html` 德/英 Progress 屏新增：7 天练习量柱状图、模式正确率+总次数+连续天数、最近 7 天记录表、「打开完整统计面板」入口卡（有 `showEnhancedStatsModal` 才显示）
- `german-app.js` 新增 `renderProgressPanels(lang, prefix, stats, setText)`（数据只读自共享 StatsManager，按语言分 key）；`updateGermanProgressStats` / `EnglishApp.updateProgressStats` 调用；英语侧统计卡入口由 `EnglishApp._bindProgressPanels` 自绑（同英语直连问题）
- 修复统计双重计数：德/英答题原本同时被 `QuizIntegration.wrap`（app-enhanced，记 total+words 但 durationMs=0）和 `recordDailyActivity`（german-app，记 duration）各写一次 `StatsManager.recordActivity`，同一题计 2 次。现在包装器带真实 `durationMs` 成为唯一记录点，`recordDailyActivity` 及其调用删除（浏览器实测：每答一题统计 +1）

### 2026-08-21 — 打字游戏六项 bug 修复

**修复（lib/typing-game.js）：**
- 击落特效（粒子 + "+N" 漂浮分数）的 `t` 从不增长：`_draw` 的过滤条件 `t<600/900` 永远为真，
  特效以满透明度**永久**停在击落点并无限堆积，长局会糊满河面。新增 `Renderer._advanceFx(dt)`
  在 `_loop` 里按真实帧时长老化（独立成方法便于无头测试）
- `_drawItem` 先测量后设字体：量宽时继承上一段的 11px 标签字体、绘制却用 16px，
  长中文题面系统性溢出气泡框。现在先设字体再 `measureText`
- `maxSpeed` 是没接线的死常量：下落速度按 `1.09^level` 无上限增长，高等级快到不可反应。
  现在 `spawn()` 里 `Math.min(o.maxSpeed, …)` 真正封顶

**修复（typing-game-app.js）：**
- 「再来一局」不经过 `renderSetup()`（唯一收起结算浮层的地方），深色模糊的 gameover
  浮层会一直盖住新开的这局。`startGame()` 现在直接隐藏 `#typingGameOverlay`
- 英语变位数据的人称键是 `i/you/he_she_it/we/you_pl/they`，而 `PERSON_CN.english` 按意语键
  （io/tu/…）查表全部落空，题面显示原始键名。已改为英语自己的键集
- `clean()` 把 sub 硬截 26 字符，英语/法语/德语的「时态标签 · 人称」超长，
  **人称被整个截掉**（多个形式无法区分）。人称移到最前 + 截断上限放宽到 34

**测试：** `tests/test-typing-game.js` 新增 speed cap / fx aging 两组，`tests/test-typing-game-app.js`
新增 restart-hides-overlay / english-person-labels 两组（合计 +11 用例，全套 374 通过）。
浏览器实测确认过：游戏运行、击落计分、结算浮层出现均正常；上述问题以代码证据 + DOM 状态
+ 无头回归用例三方定位。

### 2026-08-28 — CI + 仓库瘦身

**CI / 工程化：**
- 新增 `.github/workflows/ci.yml`：push / PR 到 main 时跑 `npm test`
- 新增 `package.json`（`scripts.test = node tests/run-headless.js`）：无依赖，
  把 16 个 harness（单元 + 10 个数据校验器）变成一条命令入口

**仓库瘦身（`git rm --cached`，本地文件均保留）：**
- 取消跟踪约 90MB 的版权词典原件：`deutsch-data/grammar/docs/学习资源/assets/*.zip`
  （Duden 10 卷 / Langenscheidt / 新德汉词典）。`.gitignore` 已加对应规则防回潮。
  ⚠️ 注意：这只是让**后续提交**不再包含它们，git 历史里仍在（`.git` 体积不变）；
  若要从历史彻底抹除需要 `git filter-repo` + force push，属于破坏性操作，未执行
- 取消跟踪"早已写进 .gitignore 但此前已被跟踪"的一次性产物：
  `ita-eng/`、`newselfdata/`、`it_50k.txt`、`data/vocabulary*.json*`、
  `data/stats.json`、`translation*_log.txt`、`enhance_translations*.py`、
  `test_translate.py`、`process_data.js`、`update_vocabulary_js.py`、
  `TRANSLATION_STATUS.md`、`.vscode/`
- 保留：` english-data/`（含 EnWords.csv + ecdict-slice.csv，是
  `scripts/build_english_vocab.py` 的重建输入）、`memory-bank/`（24K agent 上下文笔记）

### 2026-08-28 — 性能三连：浏览页分页 / localStorage 延迟落盘 / 干扰项有界采样

**浏览页（意/法此前每键全表重建）：**
- `lib/utils.js` 新增共享 `debounce`；意/法搜索框 200ms 防抖
- `BrowseEnhanced`（意）与 `FrenchApp.renderBrowse`（法）改为 200 行/页分页 +
  「加载更多」+ 容器级事件委托（德语站既有模式）
- ⚠️ `Browse.render = BrowseEnhanced.render` 赋值后接收者是 `Browse`，
  BrowseEnhanced 方法内部一律显式 `BrowseEnhanced.xxx`，不能写 `this`

**localStorage 延迟落盘：**
- `lib/utils.js` 新增 `deferredPersist(fn, wait)`：脏标记 + 500ms 合并写，
  `pagehide` / `visibilitychange→hidden` 统一冲刷；`flushAllPersisters()` 冲全部
- 四语言 save 全部延迟化；法语 SRS / 每日记录一并延迟（每日记录改内存缓存为真相）
- **一致性契约**：切词本 / 切系统词库 / 切课程 / 导出 / 导入 / 重置前必须先
  flush（`Storage.flush()` / `flushState()` / `flushAllPersisters()`），
  否则挂起写会落错 key 或覆盖刚导入的数据
- 重置后立即同步落盘（600ms 后刷新页面）

**干扰项有界采样：**
- `QuizEngine.sampleDistractorPool`（静态，源自德语站实现）：词频邻域 + 等距抽样，
  池恒 ≤800；意/法 MC 接线（此前 27k/24k 全池每题全表扫描）；德语本地实现改为别名
- 法语 `countMastered` 的 key Set 按词表身份缓存

### 2026-08-28 — 数据二级按模块懒加载

- `lib/lang-loader.js`：`DATA` 瘦身为纯词库清单；新增 `MODULES`
  （conjugations / grammar / collocations / cognates × 语言）与
  `ensureModule(lang, module)` / `isModuleLoaded`；模块就绪发
  `module:start|module:done` 事件并刷 `syncDatasetCounts`
- 首屏：意 16.4→5.7MB、德 23.6→11.0MB、英 9.4→5.5MB、法 28.1→15.3MB
- 守卫位置见 §2.1；法语 `frenchGrammarBookBtn` 原「数据不存在就不打开」
  改为补拉后重试（其它入口本就传 null 进 init 走守卫）
- 浏览器实测：意语语法书 / 变位 / 同源词随开随拉，法语 #/fr 直达语法书、
  变位均正常；MC 出题 + 延迟落盘（答题后 flush 前后对比）验证通过

---

## 16. 快速索引（超简版）



如果只是想快速定位文件，可直接看这里：

- **改页面结构** → `index.html`
- **改主学习流程** → `app.js`
- **改词本编辑 / SM-2 / 增强浏览** → `app-enhanced.js`
- **改社区词本** → `community-wordbooks.js` + `supabase-config.js`
- **改动词变位（三语共用引擎）** → `conjugation-app.js`（`ITALIAN/GERMAN/ENGLISH_CONFIG` + `openFor(lang)`，共享 `conjugationSetupScreen`/`conjugationScreen`）
- **改德/英变位数据** → `data/german-conjugations.js` / `data/english-conjugations.js` + `scripts/build_german_conjugations.py` / `scripts/build_english_conjugations.py`
- **改语法书** → `grammar-book.js` + `data/grammar-data.js`
- **改动词搭配** → `verb-collocations.js` + `data/verb-collocations-data.js`
- **改动词搭配练习** → `verb-collocations-practice.js` + `data/verb-collocations-data.js`
- **改统计图表** → `stats-charts.js`
- **改共享工具函数** → `lib/utils.js`
- **改通用测验引擎** → `lib/quiz-engine.js`
- **改导航 / screen 切换 / 返回逻辑** → `lib/navigation.js`（`AppState` 仍在 `app.js`）
- **改选择题难度 / 相似干扰项** → `lib/word-similarity.js` + `lib/quiz-engine.js`（难度设置 UI 在 `index.html` `#difficultyToggle` + `app.js` `initDifficultyToggle()`）
- **改出题方向（正向/反向）** → `lib/quiz-engine.js`（方向 API + 方向感知 `generateOptions`；意语开关在 `index.html` `#directionToggle` + `app.js` `initDirectionToggle()`，德/英/法由 `renderDirectionToggle` 运行时注入）
- **改单元测试** → `tests/test-quiz-engine.html` + `tests/test-spaced-repetition.html`
- **改语法书构建** → `scripts/parse_grammar.py` + `scripts/build_grammar_data.py`
- **改搭配数据构建** → `scripts/parse_verb_collocations.py`
- **改变位数据构建** → `scripts/reverso_presente_pipeline.py`
- **改德语词汇/练习** → `german-app.js` + `data/german-vocabulary.js`
- **改德语语法书** → `grammar-book.js` + `data/german-grammar-data.js` + `scripts/build_german_grammar.py`
- **改英语词汇/练习** → `german-app.js` (EnglishApp) + `data/english-vocabulary.js` + `scripts/build_english_vocab.py`
- **改英语语法书** → `grammar-book.js` + `data/english-grammar-data.js` + `scripts/build_english_grammar.py`
