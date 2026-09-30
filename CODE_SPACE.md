# Dimenticato Code Space

> 这份文档是本项目的长期上下文总览（overall context / code space）。
>
> 目标：以后无论是 AI 还是其他开发者，在修改功能前优先阅读本文件，而不是每次重新扫描整个项目。
>
> 使用原则：
> 1. **先看本文件，再决定读哪些源码文件**。
> 2. **只进入和当前需求相关的模块文件**。
> 3. **每次修改完成后，必须同步更新本文件**，尤其是“文件职责”“任务映射”“数据结构”“LocalStorage”“变更记录”几部分。
>
> **2026-09-30 统一运行时**：本文件已按统一运行时重写。旧架构（`AppState`、`app-enhanced.js` 补丁层、`german-app.js` / `french-app.js` 各语言控制器、`lib/navigation.js`、`lib/router.js`、按语言分屏的 `<lang>WelcomeScreen` 等）已全部删除；如在旧 PR / 旧笔记里看到这些名字，以本文件与代码为准。

---

## 1. 项目定位

**Dimenticato** 是一个多语言（意大利语 / 德语 / 英语 / 法语）背单词 + 语法学习站，面向中文母语者。四门语言共用**同一套屏幕与同一份逻辑**，差异只来自语言档案和数据。主要学习场景：

- 系统词库练习（选择题 / 拼写 / 浏览 / 打字游戏），按 CEFR 等级 A1–C2 分组
- 个人单词本（新建 / 导入 TXT·JSON / 编辑 / 导出）与社区词书（Supabase）
- SM-2 间隔重复与每日学习统计
- 动词变位（查询 + 练习）、语法书、动词搭配（浏览 + 练习）、同源词
- 德语独有：A1–C1 课程路线

### 1.1 技术形态

- **前端**：HTML + CSS + 原生 JavaScript，无构建步骤，无运行时 npm 依赖
- **部署**：GitHub Pages 静态托管；本地用任意静态服务器（如 `python3 -m http.server`）打开 `index.html`
- **本地存储**：`localStorage`（唯一出入口 `lib/storage.js > DimStorage`）
- **远程能力**：Supabase（仅社区词书需要）
- **CDN**：Chart.js 4.4.0、marked 9.1.6、Supabase JS 2.39.0（均带 SRI；`CdnFallback` 负责挂掉时的降级）；Google Fonts（Fraunces / IBM Plex / Noto SC / Material Symbols Rounded）
- **语音**：Web Speech API（`App.speak`，语言档案里的 `tts` / `voice`）

### 1.2 设计取向

- 页面骨架集中在 `index.html`；统一屏幕由 `app.js` 渲染进 `[data-view]` 容器，功能模块屏的 DOM 仍是 `index.html` 里的静态标记
- 语言是 `body[data-language]` 上的**语境**（`italian` / `german` / `english` / `french`），不是一套独立的屏幕
- 数据预编译成 `.js` 常量（顶层 `const` / `var`），通过动态 `<script>` 注入，规避 GitHub Pages 上的 fetch / 中文路径问题
- 数据分两级懒加载：首屏只拉「当前语言词库 + 全部共享代码」，变位 / 语法 / 搭配 / 同源词在打开对应模块时才拉

### 1.3 项目结构

```text
├── index.html                  ← 页面骨架：topbar / crumbs / 所有 screen / modal / 引导脚本
├── styles.css                  ← paper/ink 设计系统（tokens 在 :root 与 [data-theme="dark"]）
├── app.js                      ← 统一运行时（window.App）：首页/词汇/浏览/语法/进度/设置、练习会话、语言切换
├── lib/
│   ├── lang-loader.js          ← 按语言 / 按模块懒加载数据，注入共享代码（静态 defer）
│   ├── boot.js                 ← 加载遮罩 + 首屏引导（静态 defer）
│   ├── utils.js                ← escapeHtml / debounce / deferredPersist / DimText …
│   ├── languages.js            ← 语言档案（window.Languages）
│   ├── vocab.js                ← 词库 API（window.Vocab），读 data/vocab/<code>.js
│   ├── storage.js              ← DimStorage（导出/导入/重置）、Prefs、LegacyMigration
│   ├── srs.js                  ← SpacedRepetition（SM-2）+ StatsManager（每日统计）
│   ├── word-similarity.js      ← 相似干扰项（纯函数）
│   ├── quiz-engine.js          ← QuizEngine + MasteryPolicy（选项生成、难度/方向偏好）
│   ├── practice-flow.js        ← PracticeFlow（选择题判分流程、遥测、提示、键盘快捷键）
│   ├── typing-game.js          ← 打字游戏纯引擎（canvas 渲染）
│   ├── shell.js                ← 屏幕树 + 导航 + hash 路由（Shell / ScreenTree / DimRouter）
│   └── wordbooks.js            ← 个人单词本（Wordbooks / WordbookEditor）
├── supabase-config.js          ← Supabase 连接配置
├── community-wordbooks.js      ← 社区词书（CommunityWordbooks）
├── cognate-app.js              ← 同源词（CognateApp）
├── typing-game-app.js          ← 打字游戏 App 层（TypingGameApp）
├── german-course.js            ← 德语课程路线（GermanCourse，运行时追加 germanCourseScreen）
├── conjugation-app.js          ← 动词变位（ConjugationPractice，四语言 config 驱动）
├── stats-charts.js             ← 完整统计面板（Chart.js）
├── grammar-book.js             ← 语法书阅读器（GrammarBook）
├── verb-collocations.js        ← 动词搭配浏览（VerbCollocations）
├── verb-collocations-practice.js ← 动词搭配练习（VerbCollocationPractice）
├── data/
│   ├── vocab/<it|de|en|fr>.js  ← 四语言系统词库，schema v1（src/ 为法语教材层构建输入）
│   ├── conjugations-*.js / <lang>-conjugations.js
│   ├── grammar-data.js / <lang>-grammar-data.js
│   ├── verb-collocations-data.js / <lang>-collocations-data.js
│   ├── cognates.js / <lang>-cognates.js
│   └── german-course-data.js
├── docs/vocab-schema.md        ← 词库 schema v1 说明
├── scripts/                    ← 数据构建（Python）与校验（Node）脚本，见 §8
└── tests/                      ← 无头测试（node tests/run-headless.js），见 §6.15
```

根目录还有若干**不被应用加载**的历史文件（`process_data.js`、`enhance_translations*.py`、`update_vocabulary_js.py`、`it_50k.txt`、`ita-eng/`、`newselfdata/` 等，多数已不被 git 跟踪），改功能时可忽略。小写 `dimenticato/` 子目录（如本地存在）是无关的 PinMe 模板。

---

## 2. 运行模型总览

### 2.1 启动流程

1. `index.html` `<head>` 内联脚本读 `dimenticato_theme`，首帧前设 `html[data-theme="dark"]`（防闪白）
2. `<body>` 末尾两段内联脚本：
   - `__ReadyGate`：把 `document.readyState` 伪装成 `'loading'`，直到语言包注入完毕
   - `CdnFallback`：Chart.js / marked / Supabase 任一 CDN 失败时的降级
3. 三个 CDN `<script defer>`，然后仅有的三个本地静态脚本 `lib/languages.js` → `lib/lang-loader.js` → `lib/boot.js`（lang-loader 的文件清单读自语言档案，所以 languages.js 必须先到）
4. `boot.js` 把 `LangLoader` 事件接到 `#loading` 遮罩，然后调 `LangLoader.boot()`：
   - `detectLanguage()`：URL hash `#/<code>` 优先（code 须在 `Languages` 里），其次 `localStorage.dimenticato_language`，默认 `Languages.DEFAULT_KEY`（`italian`）
   - 一次性注入 `DATA[lang]`（词库）+ `CODE`（共享代码），`script.async = false` → 并行下载、按序执行
   - 全部执行完后 `__ReadyGate.release()` + 派发合成 `DOMContentLoaded`，各模块按注入顺序初始化（`App.init` 等）
   - 然后 `LangLoader.runInit(lang)` → `App.onLanguageData(lang)`：跑 `LegacyMigration.run(lang)`、清进度缓存；首次调用时 `DimRouter.start()` 解析 hash 并进入对应屏幕
   - 最后发 `done`，`boot.js` 撤遮罩
5. `CODE` 注入顺序（承重，定义在 `lib/lang-loader.js`）：

```text
lib/utils → lib/vocab → lib/storage → lib/srs → lib/word-similarity
→ lib/quiz-engine → lib/practice-flow → lib/typing-game → lib/shell → lib/wordbooks
→ supabase-config → community-wordbooks → cognate-app → typing-game-app → german-course
→ conjugation-app → stats-charts → grammar-book → verb-collocations
→ verb-collocations-practice → app
```

`app.js` 最后装配：它在 `init` 里给 Shell 注册 opener，依赖所有功能模块已挂到 `window`。

### 2.2 两级懒加载

- 两级清单都由 `lib/languages.js` 各档案的 `files` 生成（`files.vocab` → `DATA`，其余键 → `MODULES`）
- **一级（词库，`LangLoader.DATA`）**：意 `data/vocab/it.js`；德 `data/vocab/de.js` + `data/german-course-data.js`；英 `data/vocab/en.js`；法 `data/vocab/fr.js`。切语言时 `LangLoader.ensure(lang)` 补拉，就绪后同样走 `App.onLanguageData`
- **二级（模块，`LangLoader.MODULES`）**：`conjugations` / `grammar` / `collocations` / `cognates` × 语言（英语无 cognates）。`LangLoader.ensureModule(lang, module)` 幂等；发 `module:start` / `module:done`，`boot.js` 显示 / 撤遮罩，并调 `App.refreshCounts()`
- **守卫位置**：各模块 opener 内部检测数据缺席 → `ensureModule` → 重试一次；仍缺席走各自「数据未加载」降级 UI。见 `ConjugationPractice.openFor`、`GrammarBook.init`、`VerbCollocations` 的 `init`、`VerbCollocationPractice.open`、`CognateApp.open`、`TypingGameApp`（变位模式）、`App.openGrammarBook`、`GermanCourse`
- 数据文件是顶层 `const`，动态注入的 classic script 同样进全局词法环境，消费方一律调用时 `typeof X !== 'undefined'` 取数——**不能改成 `type="module"`**
- `LangLoader.prefetch(lang)` 可在空闲时预取

### 2.3 架构分层

1. **引导层**：`index.html` 内联脚本 + `lib/languages.js` + `lib/lang-loader.js` + `lib/boot.js`
2. **外壳层**：`lib/shell.js`（屏幕树、面包屑、顶部导航高亮、hash 路由）
3. **核心库层**：`lib/languages.js`、`lib/vocab.js`、`lib/storage.js`、`lib/srs.js`、`lib/quiz-engine.js`、`lib/practice-flow.js`、`lib/wordbooks.js`、`lib/utils.js`、`lib/word-similarity.js`
4. **统一运行时**：`app.js`（统一屏幕渲染、练习会话、语言切换、模块入口）
5. **功能模块层**：根目录 `*-app.js` / `grammar-book.js` / `verb-collocations*.js` / `german-course.js` / `community-wordbooks.js` / `stats-charts.js`
6. **数据层**：`data/vocab/*.js` + `data/*.js`（全部为构建产物，见 §7 / §8）

---

## 3. 页面与导航结构

### 3.1 页面骨架（`index.html`）

- `#loading`：全屏加载遮罩（`#loadingDetail` 文案由 `boot.js` 更新）
- `#app > header.topbar`：品牌、`nav#topnav`（首页 / 词汇 / 语法 / 进度 / 设置，`data-nav` + `data-nav-screen`）、`.lang-switch`（IT / DE / EN / FR，`data-lang`）、`#themeToggle`、`#navToggle`（移动端菜单）
- `nav#crumbs`：面包屑，由 Shell 渲染，首页隐藏
- `main#main`：所有 `section.screen`
- `footer.footer`
- 页面外的 modal、`#toast`、隐藏文件输入 `#importDataFileInput` / `#wordbookFileInput`

### 3.2 屏幕树（`lib/shell.js > SCREENS`）

所有屏幕只有一份，地址为 `#/<code>/<slug>`（例如 `#/de/vocab/browse`）。

| screen id | slug | 父级 | 渲染者 |
|---|---|---|---|
| `homeScreen` | `''` | — | `app.js renderHome` |
| `vocabScreen` | `vocab` | home | `app.js renderVocab` |
| `quizScreen` | `vocab/choice`（transient） | vocab | `app.js` 练习会话 |
| `spellScreen` | `vocab/spelling`（transient） | vocab | `app.js` 练习会话 |
| `browseScreen` | `vocab/browse` | vocab | `app.js renderBrowse` |
| `typingGameScreen` | `vocab/typing` | vocab | `typing-game-app.js` |
| `cognatePracticeScreen` | `vocab/cognates` | vocab | `cognate-app.js` |
| `communityBrowseScreen` | `vocab/community` | vocab | `community-wordbooks.js` |
| `grammarScreen` | `grammar` | home | `app.js renderGrammar` |
| `grammarBookScreen` | `grammar/book` | grammar | `grammar-book.js` |
| `conjugationSetupScreen` | `grammar/conjugation` | grammar | `conjugation-app.js` |
| `conjugationScreen` | 无（transient） | conjugationSetup | `conjugation-app.js` |
| `verbCollocationsScreen` | `grammar/collocations` | grammar | `verb-collocations.js` |
| `verbCollocationPracticeScreen` | 无（transient） | verbCollocations | `verb-collocations-practice.js` |
| `germanCourseScreen` | `course`（`module: 'course'`） | home | `german-course.js`（运行时追加到 `#main`） |
| `progressScreen` | `progress` | home | `app.js renderProgress` |
| `settingsScreen` | `settings` | home | `app.js renderSettings` |

- `section` 字段决定顶部导航哪一项高亮；`crumb` 决定面包屑文案
- **transient** 屏（会话屏）没有自己的地址：URL 保留父级地址，刷新 / 深链接落回父级
- `module: 'course'`：当前语言档案 `modules.course` 为假时进入会回首页（目前只有德语有）
- 统一屏幕（home / vocab / browse / grammar / progress / settings）的 HTML 只是一个 `[data-view]` 空容器（`#homeView`、`#vocabView`、`#grammarView`、`#progressView`、`#settingsPrefs` 等），每次进入时由 `app.js` 重新渲染；quiz / spell / browse 以及各功能模块屏的内部 DOM 是静态标记

### 3.3 modal

`#wordbookEditorModal`、`#wordEditDialog`、`#wordbookSelectDialog`（`lib/wordbooks.js`）、`#enhancedStatsModal`（`stats-charts.js`）、`#communityUploadModal`、`#communityPreviewModal`（`community-wordbooks.js`）、`#helpModal`（`app.js` `data-action="help"`）。

通用关闭：`[data-close-modal]` 按钮、点击 `.modal` 遮罩本身、Esc（`app.js bind()` 统一处理）。

### 3.4 导航原语（均挂在 `window`）

- `showScreen(id, opts)`：`resolve(id)` → 切 `.screen.active` → 渲染面包屑 / 导航 → 跑 `Shell.onEnter` 钩子（`app.js` 在这里渲染统一屏）→ `DimRouter.sync` 推 / 替换 history → 派发 `dimenticato:screenchange`。`opts`：`skipRoute`、`replaceRoute`、`keepScroll`
- `goBack({fallbackTarget})`：**按屏幕树回父级**（不是历史栈）；无父级时用 `fallbackTarget`，再兜底首页
- `setPracticeContext(ctx)` / `getActiveLanguage()`
- `Shell.registerOpener(screenId, fn(lang))`：深链接或切语言后重新进入模块屏时，用模块自己的 open 装数据再切屏（`App.init` 注册了 grammarBook / conjugationSetup / verbCollocations / typingGame / cognatePractice / communityBrowse / germanCourse）
- `ScreenTree.register(id, info)`：模块登记自己的新屏；`ScreenTree.resolve` 会把旧的按语言分屏 id（`germanGrammarScreen`、`vocabularyModesScreen`、`multipleChoiceScreen`…）折叠到统一 id，模块里残留的旧 id 不会让页面空白
- `DimRouter.apply(route)`：路由语言与当前不同时先 `App.setLanguage(lang)`（懒加载词库）再进入

### 3.5 事件委托约定（`app.js bind()`）

document 级单一 click 委托，按优先级识别：`[data-lang]` 切语言 → `[data-nav-screen]` 导航 → `[data-go]` 切屏 → `[data-speak]` 朗读 → `[data-back]` 返回 → `[data-theme-set]` → `[data-close-modal]` → `[data-action]`（`onAction`：`start` / `again` / `review` / `level` / `go-vocab` / `go-progress` / `stats-modal` / `help` / `community-upload`，其余视为模块名走 `openModule`）→ 词汇页 `[data-source]` / `[data-level]` / `[data-filter]` / `[data-wb]` → 浏览页 `[data-row]`。

新增按钮优先用这些 data 属性，不要再写 `getElementById(...).addEventListener`。

---

## 4. 核心状态与数据流

已**没有**全局 `AppState`。状态分散在以下位置：

| 状态 | 所在 |
|---|---|
| 当前语言 | `body[data-language]`（读：`getActiveLanguage()` / `App.lang()`；写：`App.setLanguage`） |
| 当前屏幕 | `Shell.state.current` / `previous` / `context` |
| 练习来源 / 等级 / 筛选 / 题量 | `Prefs`（`dimenticato_prefs`，按语言） |
| 已掌握集合、选择题/拼写计数 | `app.js` 内部 `Progress`（Set 缓存 + `deferredPersist` 落盘） |
| 当前练习会话 | `app.js` 内部 `session`（mode / lang / words / quizIndex / engine / hintStage …） |
| 浏览页筛选 | `app.js` 内部 `browse`（q / level / status / limit） |
| SM-2 计划、每日统计 | `SpacedRepetition` / `StatsManager`（`lib/srs.js`） |
| 连续答对计数 | `MasteryPolicy`（`lib/quiz-engine.js`） |
| 单词本 | `Wordbooks`（`lib/wordbooks.js`） |

### 4.1 练习来源（`app.js currentSource()`）

`Prefs.source` 取值：

- `'system'`：系统词库，按 `Prefs.level`（`A1`–`C2` 或 `all`）取 `Vocab.atLevel` / `Vocab.entries`；进度 key = `DimStorage.masteredKey(lang)`
- `'wb:<id>'`：个人单词本，词条经 `Vocab.fromWordbookWord` 适配成 v1 形状；进度 key = `dimenticato_progress_wb_<lang>_<id>`
- `'course'`：德语课程路线选中的单元（`App.practiceEntries(label, entries)` 写入内存 `courseSelection`），进度记在系统 key

`Prefs` 默认值：`{ level: 'A2', session: '20', filter: 'all', source: 'system' }`。

### 4.2 选择题 / 拼写会话

1. 词汇页 `data-action="start" data-mode="quiz|spell"` → `startSession(mode)`
2. `buildSession`：到期复习（`SpacedRepetition.getDueWords`）优先 → 未掌握（词频序）→ 已掌握；按 `Prefs.filter`（`all` / `new` / `due`）与 `Prefs.session`（`20` / `50` / `100` / `all`）截取后打乱
3. 每个会话 `new QuizEngine({ language, fieldMap: { source: 'word', target: 'zh' }, … })`；干扰项来源：来源词条 ≥60 时用来源本身，否则用整门语言词库；每题经 `QuizEngine.sampleDistractorPool`（≤800）采样
4. 选择题答题 → `PracticeFlow.mcAnswer(env)`：计数、`engine.recordAnswer`（`MasteryPolicy`：连续答对 2 次才标掌握）、高亮 / 反馈、遥测（`StatsManager.recordActivity` + `SpacedRepetition.review`）、自动下一题（1100ms）
5. 拼写答题 → `Vocab.gradeSpelling(lang, answer, entry)`（按语言档案 `spell` 风格：`plain` / `german` 大小写宽容并提示 / `french` 重音错单独判 `accent`、同释义 twin 也算对）→ 计数 + `recordAnswer` + `PracticeFlow.recordTelemetry`
6. `Progress.touch` 只标脏，`deferredPersist` 合并写盘；`finishSession` 先 `Progress.flush()` 再出结算
7. 进度页「到期复习」（`data-action="review"`）用 `startSession('quiz', { entries: due, … })`

### 4.3 语言切换

`App.setLanguage(l)`：`Progress.flush()`、丢弃会话、写 `body[data-language]` 与 `dimenticato_language` → `LangLoader.ensure(key)` → 留在当前屏（若是分区根屏），否则回到所在分区根（grammar 区 → `grammarScreen`，vocab 区 → `vocabScreen`，其余 → 首页）。

### 4.4 模块入口

首页、语法页的模块卡片由 `app.js moduleCards(l, where)` 统一生成，**按语言档案 `modules` 显示 / 隐藏**；词汇页练习方式卡片由 `modeCard` 生成（同源词卡片同样受 `modules.cognates` 控制）。点击后走 `openModule(name)` → `MODULE_OPENERS`：

| 模块名 | 调用 |
|---|---|
| `grammar-book` | `App.openGrammarBook(l, slug?)` → `GrammarBook.init(data, { lang })` |
| `conjugation` | `ConjugationPractice.openFor(l)` |
| `collocations` | `VerbCollocations.open(l)` |
| `collocation-practice` | `VerbCollocationPractice.open(l)` |
| `cognates` | `CognateApp.open(l)` |
| `typing` | `TypingGameApp.open(l)` |
| `course` | `GermanCourse.open()` |
| `community` | `CommunityWordbooks.showBrowseScreen()` |

---

## 5. 文件职责地图

### 5.1 `index.html`

负责：页面骨架（topbar / crumbs / screens / modals / footer）、首帧主题脚本、`__ReadyGate`、`CdnFallback`、CDN 引用、两个静态引导脚本、SVG 图标 `<symbol>` 表、Help 弹窗里的数据来源与致谢。

改这些先读它：新增 screen / modal、静态模块屏的 DOM（quiz / spell / browse / typing / cognate / community / conjugation / collocations / grammarBook）、顶部导航与语言按钮、CDN 依赖。

**不在这里**：首页 / 词汇页 / 语法页 / 进度页 / 设置页的内容（`app.js` 渲染）、`germanCourseScreen`（`german-course.js` 运行时追加）、脚本清单（`lib/lang-loader.js`）。

### 5.2 `styles.css`（约 2900 行）

paper/ink 编辑风设计系统，一套配色覆盖全部语言（不再有按语言换色）。文件头列出 10 个分节：1 tokens · 2 base · 3 shell · 4 primitives · 5 home · 6 practice · 7 browse / progress / settings · 8 modules · 9 modals · 10 responsive。

- tokens：`:root`（`--paper*`、`--card`、`--ink*`、`--muted`、`--line*`、`--red*`、`--gold*`、`--verde*`、`--on-ink`、`--serif` / `--sans` / `--mono`、`--radius`、`--wrap` / `--narrow`、`--control`、`--ease` …）；`[data-theme="dark"]` 只覆盖颜色 token
- 原语：`.card`（可点击入口）、`.panel`（静态容器）、`.chip`、segmented control、`.primary-btn` / `.btn` / `.pill-btn` / `.icon-btn`、`.feedback`
- 第 8 节保留了功能模块的旧标记样式（变位矩阵、搭配侧栏、同源词、打字游戏、markdown 阅读区等）
- 图标用 Material Symbols 连字（`<span class="msr">name</span>`）

### 5.3 运行时 JS 一览

| 文件 | 暴露的全局 | 职责 |
|---|---|---|
| `app.js` | `App`、`ReviewSession`、`shuffleArray` | 统一运行时，见 §6.1 |
| `lib/lang-loader.js` | `LangLoader` | 数据与代码注入、懒加载，见 §2 |
| `lib/boot.js` | — | 加载遮罩、词库自检、`LangLoader.boot()` |
| `lib/shell.js` | `Shell`、`ScreenTree`、`DimRouter`、`showScreen`、`goBack`、`setPracticeContext`、`getActiveLanguage` | 屏幕树 / 导航 / 路由 |
| `lib/languages.js` | `Languages` | 语言档案 |
| `lib/vocab.js` | `Vocab` | 词库 API |
| `lib/storage.js` | `DimStorage`、`Prefs`、`LegacyMigration`、`getWordbookProgressKey`、`getWordbookLanguage` | 存储网关 |
| `lib/srs.js` | `SpacedRepetition`、`StatsManager` | SM-2 与每日统计 |
| `lib/quiz-engine.js` | `QuizEngine`、`MasteryPolicy` | 选项生成与偏好 |
| `lib/practice-flow.js` | `PracticeFlow` | 判分流程、遥测、提示、键盘 |
| `lib/word-similarity.js` | `WordSimilarity` | 相似干扰项 |
| `lib/typing-game.js` | `TypingGame` | 打字游戏引擎 |
| `lib/wordbooks.js` | `Wordbooks`、`WordbookEditor`、`WordbookManager`（兼容别名） | 单词本 |
| `lib/utils.js` | `DimenticatoUtils`、`DimText`、`escapeHtml`、`escapeAttribute`、`renderIcon`、`debounce`、`deferredPersist` | 工具 |
| `supabase-config.js` | `initSupabase`、`getSupabaseClient`、`isSupabaseAvailable` | Supabase 配置 |
| `community-wordbooks.js` | `CommunityWordbooks` | 社区词书 |
| `cognate-app.js` | `CognateApp`、`CognateState` | 同源词 |
| `typing-game-app.js` | `TypingGameApp` | 打字游戏 App 层 |
| `german-course.js` | `GermanCourse` | 德语课程路线 |
| `conjugation-app.js` | `ConjugationPractice` | 动词变位 |
| `stats-charts.js` | `showEnhancedStatsModal`、`hideEnhancedStatsModal`、`switchStatsTab` | 完整统计面板 |
| `grammar-book.js` | `GrammarBook` | 语法书 |
| `verb-collocations.js` | `VerbCollocations` | 搭配浏览 + 共享的语言 / 数据解析层 |
| `verb-collocations-practice.js` | `VerbCollocationPractice` | 搭配练习 |

---

## 6. 核心 JS 模块详解

### 6.1 `app.js` — 统一运行时

单个 IIFE，挂 `window.App`。文件头注释写明：语言差异只来自 `lib/languages.js`、`data/vocab/<code>.js`、各模块自己的数据。

内部结构（按文件顺序）：

- 常量：`LEVELS`、`LEVEL_NAMES`、`BROWSE_PAGE = 200`、`SESSION_SIZES`（拼写屏特殊字母键取自档案的 `accents`）
- `grammarData(l)`：按语言取 `GRAMMAR_DATA` / `GERMAN_GRAMMAR_DATA` / `ENGLISH_GRAMMAR_DATA` / `FRENCH_GRAMMAR_DATA`（裸名字，`typeof` 守卫）
- `Speaker`：Web Speech 朗读（rate 0.9，按档案 `voice` 正则选音色）
- `Progress`：已掌握 Set 缓存（按 key）、统计计数器（按语言）、`touch` / `flush` / `forget`
- 练习来源：`currentSource` / `buildSession`（§4.1、§4.2）
- 练习会话：`makeEngine`、`startSession`、`renderQuiz` / `onQuizAnswer`、`renderSpell` / `checkSpelling`、`nextQuestion`、`finishSession`；提示分阶段（`PracticeFlow.hintReset/hintAdvance`）
- 渲染：`renderHome`（每日一词、连续天数、等级分布、模块卡片）、`renderVocab`（来源 / 等级 / 筛选 chip、单词本列表、练习方式卡片）、`renderBrowse` / `renderBrowseList`（搜索用 `Vocab.looseKey`，200 行分页）、`renderGrammar`、`renderProgress`、`renderSettings`（难度 / 方向开关由 `QuizEngine.renderDifficultyToggle` / `renderDirectionToggle` 生成）
- 主题：`applyTheme` / `setTheme`（写 `html[data-theme]` 与 `dimenticato_theme`）
- 备份：`exportAllData` / `importAllData`（导入后对已加载语言重跑 `LegacyMigration`）/ `resetProgress`，全部先 `flushAll()`
- `toast(message)`、`openGrammarBook`、`MODULE_OPENERS` / `openModule`、`setLanguage`、`RENDERERS` / `renderScreen`（词库未就绪时显示错误提示）、`bind`

`window.App` 公共 API：

- `lang()`、`toast(msg)`、`speak(text, l)`、`setLanguage(l, opts)`、`openGrammarBook(l, slug)`、`openModule(name)`
- `masteredWords(l)`：系统词库已掌握 Set
- `startSession(mode, opts)`：`opts.entries` / `key` / `label` 可指定自定义词条
- `practiceEntries(label, entries)`：德语课程路线用
- `onLanguageData(l)`：LangLoader 回调，幂等
- `refreshCounts()`：模块数据到位后刷新首页数字
- `init()`：幂等；主题、语言按钮、旧词本进度迁移、`Speaker.init`、`bind`、`Shell.onEnter`、注册 opener

另外：`window.ReviewSession = { wordsFor(l), onAnswered() }`（兼容层，`stats-charts.js` 等用它取当前语言词表；`onAnswered` 为空操作）、`window.shuffleArray`。

### 6.2 `lib/shell.js` — 屏幕树 / 导航 / 路由

见 §3.2、§3.4。要点：

- `SCREENS` 是唯一屏幕注册表；新增统一屏要在这里加一行（slug / section / parent / crumb / transient / only）
- `ALIASES` + `resolve()` 负责旧 id 折叠
- `renderChrome` 渲染面包屑（首项为语言中文名）并把 `[data-nav-screen]` 的 `href` 改成当前语言的路由
- `DimRouter.start()` 只跑一次（由 `App.onLanguageData` 首次调用触发），监听 `popstate` / `hashchange`
- `file://` 下 `pushState` 可能失败，已 try/catch

### 6.3 `lib/languages.js` — 语言档案

「唯一知道有哪些语言」的地方。每条档案：`code`（it/de/en/fr，URL 与 `DIM_VOCAB` 用）、`key`（italian…，存储与模块名，沿用旧版以保证旧进度 / 备份有效）、`name`、`cn`、`en`、`tts`、`voice`、`spell`、`accents`（拼写屏特殊字母键）、`motto`、`modules`、`grammarGlobal`（语法数据文件定义的顶层 const 名）、`files`（lang-loader 注入的数据文件，`vocab` 随语言加载，其余按模块懒加载）。

当前 `modules`：

| | cognates | conjugation | grammar | collocations | course |
|---|---|---|---|---|---|
| it | ✓ | ✓ | ✓ | ✓ | |
| de | ✓ | ✓ | ✓ | ✓ | ✓ |
| en | | ✓ | ✓ | ✓ | |
| fr | ✓ | ✓ | ✓ | ✓ | |

API：`Languages.list` / `codes` / `keys` / `DEFAULT` / `DEFAULT_KEY` / `get(codeOrKey)` / `code()` / `key()` / `has()` / `label()` / `byKeyMap(fn)`。`get` 同时接受 `'de'` 与 `'german'`。

shell / lang-loader / storage / srs / quiz-engine / boot / app 的语言列表、code↔key 映射、中文名、数据文件清单都从这里派生，不再各自写死。

### 6.4 `lib/vocab.js` — 词库 API

读 `globalThis.DIM_VOCAB[<code>]`（`data/vocab/<code>.js`，schema v1）。词条统一形状：`{ word, display?, pos?, gender?, level, rank, zh, zhAlt?, en?, forms?, tags?, notes?, legacyId? }`，`word` 是唯一键。运行时**不读任何语言专属字段**。

- 查询：`ready(lang)`、`meta`、`entries`、`find(lang, word)`、`upToLevel(lang, maxLevel)`、`atLevel`、`levelCounts`、`withTag`
- 展示：`headword(e)`（`display || word`）、`grammarLine(e)`（「名词 · 阴性 · 复数 Häuser」）、`usageLine(e)`（搭配 / 支配 / 另义 / notes）、`POS_LABEL`、`GENDER_LABEL`
- 拼写：`acceptedForms(e)`、`glossTwins(lang, e)`、`gradeSpelling(lang, answer, e)` → `{ status: 'correct'|'accent'|'wrong', note?, twin? }`
- 单词本：`fromWordbookWord(row, lang)`：旧行形状 → v1 词条，并从系统词库补 `display/pos/gender/level/forms`
- 迁移：`resolveLegacyKey(lang, key)`：旧版进度键（德语 `de-03000` id、法语带括号教材词头、丢了重音的键、`Bank·长凳`）→ 当前 `entry.word`，未知返回 `''`
- 文本键：`foldText`、`looseKey`（去重音，用于搜索）

所有索引按数据对象身份懒建一次（`cache[code]`）。`lang` 参数 code / key 都接受。

### 6.5 `lib/storage.js` — 存储网关

三条规则（写在文件里）：永不 `localStorage.clear()`；导出覆盖全部四语言 + 词本 + 词本进度 + 主题；覆盖导入只写要恢复的 key。

- `DimStorage`：`LANGS`、`LANGUAGE_LABELS`、`PRESERVED_KEYS`、`PROGRESS_KEYS`（按语言）、`masteredKey(lang)` / `statsKey(lang)`（意大利语无前缀，其余 `dimenticato_<lang>_*`）、`allKeys()`、`safeParse`、`safeSetItem`、`migrateLegacyWordbookProgress()`、`snapshot()`、`exportAll()`（版本 `2.0`：`keys` 为权威数据 + `data` 1.0 兼容层）、`describePayload`、`normalizePayload`、合并纯函数（`mergeArrayUnion` / `mergeCounters` / `mergeDailyStats` / `mergeWordbooks` / `mergeSrsStore` / `mergeValueForKey`）、`importAll(payload, { mode: 'merge'|'overwrite' })`、`keysForScope` / `reset({ scope })`
- `Prefs`：`dimenticato_prefs`，按语言 `{ level, session, filter, source }`；属于偏好，重置保留
- `LegacyMigration.run(lang)`：幂等，需要词库已加载。① 已掌握列表（系统 + 各词本）改键到 `entry.word`；② 旧 SM-2 key（`dimenticato_german_sr` / `dimenticato_english_sr` / `dimenticato_french_srs`）并入 `dimenticato_srs_<lang>` 并改键，成功后删旧 key；③ `dimenticato_mastery_streak_<lang>` 改键；④ 法语旧 `dimenticato_french_daily` → StatsManager 格式。解析不出的旧键原样保留

### 6.6 `lib/srs.js` — SM-2 与每日统计

- `SpacedRepetition`：按语言存 `dimenticato_srs_<lang>`，键为 `entry.word`。`MAX_INTERVAL = 365` 天、`MAX_EASINESS = 2.8`（修复了旧版连续答对 ~20 次后 interval 溢出、`Date` 抛 RangeError 的 bug）。API：`peek`、`review(lang, word, quality)`、`getDueWords(lang, words)`、`countDueWords`、`getWordStatus(word, lang)`、`convertCorrectToQuality(isCorrect, timeSpent)`
- `StatsManager`：`dimenticato_daily_stats`（意）/ `dimenticato_daily_stats_<lang>`。API：`recordActivity(lang, payload)`、`getTodayStats`、`getRecentStats(days, lang)`、`getTotalStats`、`getStreak(lang)`、`updateDuration`
- 两者在 `app.js` 之前加载，调用方一律在调用时经 `window.*` 解析

### 6.7 `lib/quiz-engine.js` — 通用测验引擎

- `QuizEngine` 实例（每个会话一个）：`fieldMap`（统一运行时固定为 `{ source: 'word', target: 'zh' }`）、`generateOptions`（按难度：`hard` 用 `WordSimilarity.pickConfusableDistractors`，`easy` 随机；按方向：反向时选项为外语词形并排除释义 twin）、`renderOptions`、`showFeedback`、`highlightOptions`、`updateProgress`、`filterUsableWords`、`displayGloss`、`isReverse` / `correctAnswerFor` / `questionTextFor` / `shouldSpeakQuestion`、`recordAnswer`（交给 `MasteryPolicy`）
- 静态：`sampleDistractorPool(source, word, size=800)`（词频邻域 + 等距抽样）、`getDifficulty/setDifficulty(value, lang)`（`dimenticato_quiz_difficulty[_<lang>]`，默认 `hard`）、`getDirection/setDirection`（`dimenticato_quiz_direction[_<lang>]`）、`renderDifficultyToggle` / `renderDirectionToggle` + `sync*` / `bind*`（委托绑定）
- `MasteryPolicy`：`STREAK_REQUIRED = 2`，存 `dimenticato_mastery_streak_<lang>`

### 6.8 `lib/practice-flow.js` — 判分流程

- `PracticeFlow.mcAnswer(env)`：选择题判分 + 反馈 + 遥测 + 保存 + 自动下一题；语言差异由 env 注入（`recordMastery`、`save`、`next`、`nextDelay`…）
- `PracticeFlow.recordTelemetry(lang, { correct, word, startedAt })`：`StatsManager.recordActivity` + `SpacedRepetition.review` + `ReviewSession.onAnswered`，返回下一题开始时刻；拼写也走这里
- 提示：`initialHint`、`hintReset`、`hintAdvance`
- 键盘：document 级 1–4 选项 / Enter 下一题 / R 重听，只作用于含 `id$="McOptions"` 容器的活动屏（即 `#quizMcOptions`）；输入框内按键不拦截
- 文件头注释仍提到已删除的 `german-app.js` / `app-enhanced.js`，为历史背景

### 6.9 `lib/wordbooks.js` — 个人单词本

- 行形状统一为 `{ word, zh, en?, notes? }`；旧形状（`{italian, english, chinese}`、`{german, display, meaning}`…）与社区文件在加载 / 导入时由 `normalizeRow` / `normalizeBook` 归一
- `Wordbooks`：`all` / `reload` / `list(lang)` / `get(id)` / `add` / `create` / `remove`（连带删进度 key）/ `touch` / `progressKey(wb)` / `entries(wb)`（→ v1 词条）/ `parseTxt(text, lang)` / `importFile(file, lang)` / `exportJson` / `exportTxt`
- `WordbookEditor`：编辑器 modal、单词编辑、批量删除 / 批量导入、导出对话框、浏览页「加入单词本」（`addEntryToWordbook` + `#wordbookSelectDialog`）
- `WordbookManager`：只剩 `parseTxtWordbook` 兼容别名
- TXT 格式：空行分块，块内 `word / meaning / 中文? / notes?`；单行块从系统词库查释义（详见 `TXT_FORMAT_GUIDE.md`、`custom_wordbook_template.*`）

### 6.10 其余 `lib/`

- `lib/utils.js`：`escapeHtml` / `escapeAttribute` / `renderIcon` / `debounce` / `deferredPersist(fn, wait)`（脏标记合并写，`pagehide` / `visibilitychange→hidden` 自动冲刷，`DimenticatoUtils.flushAllPersisters()`）/ `DimText`（通用文本归一化、词头键）
- `lib/word-similarity.js`：`editDistance`、`pickConfusableDistractors`（纯函数，按池数组身份缓存索引）
- `lib/typing-game.js`：打字游戏纯引擎与 canvas 渲染（速度封顶 `maxSpeed`、特效按帧老化 `_advanceFx`）

### 6.11 `conjugation-app.js` — 动词变位

按语言 config 驱动（`ITALIAN_CONFIG` / `GERMAN_CONFIG` / `ENGLISH_CONFIG` / 法语 config：`getData()`、人称顺序与标签、mood 矩阵、`timeOf`、`storageKey`、`localeSort`）。`ConjugationPractice.openFor(lang)` 切 config、缺数据时 `ensureModule(lang, 'conjugations')` 后重试，复用同一对 `conjugationSetupScreen` / `conjugationScreen`。功能：变位查询（原形或任一变位形式反查）、时态矩阵（窄屏为 picker）、课次切分、三种题型 `mcq` / `typing` / `full`、课次进度（`dimenticato_conjugation_lessons[_de|_en|_fr]`）。导出：`init`、`start`、`searchVerbLookup`、`openFor`。

### 6.12 `grammar-book.js` — 语法书

`GrammarBook.init(customData, { lang })`：传 `null` 时按语言取全局数据；数据缺席先 `ensureModule(lang, 'grammar')` 再重试。每次 init 都重建目录树与阅读区（四语言切换安全）。`loadTopic(slug, title, partTitle, chapterTitle)` 可直接跳章节（`App.openGrammarBook(l, slug)`、德语课程路线用）。依赖 `marked`（CDN）。返回按钮 `grammarBookBackBtn` 由 `app.js` 绑定到 `goBack()`。

### 6.13 动词搭配

- `verb-collocations.js`：`VerbCollocations.open(lang)`；按介词 / 按动词浏览、搜索；同时导出语言 / 数据解析层（`LANGUAGES`、`resolveDataset`、`hasDataset`、`profileFor`、`normalizePrepEntry`、`prepLabel`、`splitExample`、`getLanguage`）供练习模块复用。查阅器内 `#vcStartPracticeBtn` 以当前浏览语言打开练习
- `verb-collocations-practice.js`：`VerbCollocationPractice.open(lang)`；题型：动词选介词、同动词不同介词辨义、例句翻译填空
- 数据：意 `VERB_COLLOCATIONS_DATA`、德 `GERMAN_COLLOCATIONS_DATA`（介词带格，另有 `.nounVerb` 功能动词结构）、英 `ENGLISH_VERB_COLLOCATIONS_DATA`、法 `FRENCH_COLLOCATIONS_DATA`，形状同构 `{ meta, verbs, prepositions }`

### 6.14 其他功能模块

- `cognate-app.js`：`CognateApp.open(lang)`（it / de / fr）；模式：英语提示拼写、对照、构词规律分组、浏览；进度 `dimenticato_cognate_progress_<lang>`（旧的无后缀 key 迁移到 italian 后删除）
- `typing-game-app.js`：`TypingGameApp.open(lang)`；背单词模式（词源 `Vocab.entries(lang)`）与动词变位模式（需 conjugations 模块）；最高分 `dimenticato_typing_best_<lang>_<mode>`
- `german-course.js`：`GermanCourse.open()`；首次打开时把 `germanCourseScreen` 追加到 `#main`；54 单元 A1–C1，数据 `GERMAN_COURSE_DATA`；语法标签 → 语法书 slug（权威表 `GERMAN_COURSE_GRAMMAR_SLUGS`，本文件有兜底覆盖表）；练习调用 `App.practiceEntries`；等级存 `dimenticato_german_course_level`
- `community-wordbooks.js`：`CommunityWordbooks.showBrowseScreen()` / `showUploadDialog()`；上传到 Supabase Storage + `community_wordbooks` 表（含 `language` 字段，老库无此列时降级为客户端过滤）；浏览支持按语言 / 难度筛选、搜索、排序；下载后 `Wordbooks.add`；解析复用 `Wordbooks.parseTxt` / `normalizeBook`
- `stats-charts.js`：`showEnhancedStatsModal()`（进度页 `data-action="stats-modal"`）；Chart.js 画 7 天趋势、每日单词量、掌握度分布；数据来自 `StatsManager`、`ReviewSession.wordsFor(lang)` + `SpacedRepetition.getWordStatus`
- `supabase-config.js`：URL / anon key、`STORAGE_CONFIG`、标签与难度映射；SQL 见 `supabase-setup.sql`、`supabase-storage-fix.sql`、`SUPABASE_TROUBLESHOOTING.md`

### 6.15 `tests/` — 无头测试

入口 `node tests/run-headless.js [filter]`（`npm test` 同义；CI `.github/workflows/ci.yml` 在 push / PR 到 main 时跑）。共 17 个 harness：

- HTML（在 Node `vm` + `tests/dom-shim.js` 里按 `<script src>` 顺序执行）：`test-quiz-engine.html`、`test-spaced-repetition.html`
- Node：`test-french-data.js`、`test-german-course-data.js`、`test-storage.js`、`test-typing-game.js`、`test-typing-game-app.js`
- 数据校验器（阻断项）：`scripts/validate_vocab.js`、`validate_italian_extras.js`、`validate_french_extras.js`、`validate_french_conjugations.js`、`validate_english_conjugations.js`、`validate_french_grammar.js`、`validate_german_extras.js`、`validate_german_grammar.js`、`validate_english_grammar.js`、`validate_english_collocations.js`

`scripts/validate_german_conjugations.js` 存在但未接入 harness。任何 FAIL / 抛错 / 缺汇总行都让退出码非 0。

测试**不覆盖** `app.js` / `lib/shell.js` 的 DOM 行为；UI 改动需要在浏览器里实测（静态服务器 + headless Chrome 截图亦可）。

---

## 7. 数据资产清单

### 7.1 前端直接消费的数据

所有文件都是构建产物，不要手改（手改会在下次重建时丢失）。

#### 词库：`data/vocab/<it|de|en|fr>.js`（一级懒加载）

- 导出：`(globalThis.DIM_VOCAB ||= {}).<code> = { meta, entries }`，schema v1，字段见 `docs/vocab-schema.md`
- 取代了旧的 `vocabulary.js` / `data/german-vocabulary.js` / `data/english-vocabulary.js` / `data/french-vocabulary*.js`（均已删除）
- 构建：it = `build_italian_vocabulary_tags.py` + `clean_italian_glosses.py`；de = `build_german_vocabulary.py`（含 HanDeDict 合并）；en = `build_english_vocab.py`（wordfreq 排序 + EnWords / ECDICT 回退）；fr = `build_french_vocabulary.py`（`assemble` 合并 `data/vocab/src/fr-curriculum.js`、`fr-glossary.js` 与词频核心层）
- 校验：`node scripts/validate_vocab.js`；Python 读写 `scripts/vocab_schema.py`，各管线原生形状 → v1 的适配在 `scripts/vocab_legacy.py`；Node 读取 `scripts/vocab_node.js`
- ⚠️ 许可：德语含 HanDeDict（CC-BY-SA 3.0），英语含 ECDICT；README「数据来源与致谢」与 Help 弹窗已署名，见 `ATTRIBUTION.md`

#### 动词变位（模块 `conjugations`）

| 语言 | 文件 | 全局 |
|---|---|---|
| it | `data/conjugations-all-tenses.js`（主）+ `data/conjugations-presente.js`（fallback） | `CONJUGATION_ALL_TENSES_DATA` / `CONJUGATION_PRESENTE_DATA` |
| de | `data/german-conjugations.js` | `GERMAN_CONJUGATION_DATA` |
| en | `data/english-conjugations.js` | `ENGLISH_CONJUGATION_DATA` |
| fr | `data/french-conjugations.js` | `FRENCH_CONJUGATION_DATA` |

形状统一：`[{ rank, infinitive, frequency, english, chinese, tenses: { <key>: { type, group_label, tense_label, forms } } }]`。

#### 语法书（模块 `grammar`）

| 语言 | 文件 | 全局 |
|---|---|---|
| it | `data/grammar-data.js` | `GRAMMAR_DATA` |
| de | `data/german-grammar-data.js` | `GERMAN_GRAMMAR_DATA` |
| en | `data/english-grammar-data.js` | `ENGLISH_GRAMMAR_DATA`（另有 `_CONTENT` / `_TREE`） |
| fr | `data/french-grammar-data.js` | `FRENCH_GRAMMAR_DATA`（另有 `_CONTENT` / `_TREE`） |

形状：`{ meta?, tree: { parts: [{ title, slug, chapters: [{ title, slug, topics: [{ title, slug, level? }] }] }] }, content: { <slug>: markdown } }`。

#### 动词搭配（模块 `collocations`）

`data/verb-collocations-data.js`（`VERB_COLLOCATIONS_DATA`）、`data/german-collocations-data.js`（`GERMAN_COLLOCATIONS_DATA`）、`data/english-collocations-data.js`（`ENGLISH_VERB_COLLOCATIONS_DATA`）、`data/french-collocations-data.js`（`FRENCH_COLLOCATIONS_DATA`）。形状 `{ meta, verbs, prepositions }`。

#### 同源词（模块 `cognates`）

`data/cognates.js`（`COGNATE_DATA`）、`data/german-cognates.js`（`GERMAN_COGNATE_DATA`，另有 `falseFriend` / `pos` / `englishGloss`）、`data/french-cognates.js`（`FRENCH_COGNATE_DATA`）。英语无同源词数据。

#### 德语课程（随德语词库一级加载）

`data/german-course-data.js`：`GERMAN_COURSE_DATA`（54 单元）、`GERMAN_COURSE_GRAMMAR_SLUGS`、`GERMAN_COURSE_UNIT_EXTRAS`。

### 7.2 原始 / 中间数据

- **意大利语语法书、动词搭配、变位**：原始书籍 Markdown、`data/grammar_content/**`、`grammar_tree.json`、`conjugations-*.json` 已于 2026-09-30 因版权 / 清理原因删除，相应的解析 / 抓取脚本更早已删除。`data/grammar-data.js`、`data/verb-collocations-data.js`、`data/conjugations-*.js` 目前是**冻结产物**，只能就地修（变位用 `scripts/fix_italian_conjugations.py`）
- **德语语法**：旧 Docusaurus 语料 `deutsch-data/grammar/docs/` 无许可证，已从仓库删除；`build_german_grammar.py` 重建需要本地副本（其余为脚本内原创专题）
- **德语词库**：`deutsch-data/vocab/`（pgh.csv + `handedict-de-slice.csv`）
- **英语**：` english-data/english word/`（⚠️ 目录名前有空格；EnWords.csv + `ecdict-slice.csv`）；`scripts/english_grammar_src/*.md`（原创语法源）、`scripts/english_collocations_source/*.txt`
- **法语 / 德语搭配源**：`scripts/sources/french-collocations/`、`scripts/sources/german-rektion/`
- **法语词库教材层**：`data/vocab/src/fr-curriculum.js`、`fr-glossary.js`
- `data/it50k-verb-lemmas.json`、`data/Kendrick-vocab.txt` 等为辅助输入；`data/vocabulary*.json*`、`data/stats.json` 为不跟踪的历史产物
- 单词本模板：`custom_wordbook_template.json`、`custom_wordbook_template.txt`、`TXT_FORMAT_GUIDE.md`

---

## 8. 构建脚本与数据生成流程

所有 Python 构建脚本直接写出 `data/**/*.js`；改完跑对应校验器，再跑 `npm test`。

### 8.1 词库（schema v1）

| 脚本 | 输出 | 说明 |
|---|---|---|
| `build_italian_vocabulary_tags.py` | 就地更新 `data/vocab/it.js` | 标注词性 / 性别 / CEFR |
| `clean_italian_glosses.py` | 就地更新 `data/vocab/it.js` | 清洗机翻重复释义 |
| `build_german_vocabulary.py` | `data/vocab/de.js` | 已并入旧 `process_german_vocab.py`；合并 HanDeDict（`HANDEDICT_FULL=...` 可全量重建） |
| `build_english_vocab.py` | `data/vocab/en.js` | wordfreq 排序；EnWords 缺词时 ECDICT 回退（`ECDICT_FULL=...`） |
| `build_french_vocabulary_glossary.py` | `data/vocab/src/fr-glossary.js` | 法语教材词汇表层（A1–B2 权威层） |
| `build_french_vocabulary.py` | `data/vocab/fr.js` | `assemble` 合并三层 |
| `vocab_schema.py` / `vocab_legacy.py` / `vocab_node.js` | — | 共享读写 / 适配 / Node 加载 |
| `validate_vocab.js` | — | 四语言统一校验，语言专属规则为 per-language hook |

### 8.2 变位

| 脚本 | 输出 | 校验 |
|---|---|---|
| `fix_italian_conjugations.py` | 就地修 `data/conjugations-all-tenses.js` / `conjugations-presente.js` | — |
| `build_german_conjugations.py` | `data/german-conjugations.js` | `validate_german_conjugations.js`（未接入 harness） |
| `build_english_conjugations.py` | `data/english-conjugations.js` | `validate_english_conjugations.js` |
| `build_french_conjugations.py` | `data/french-conjugations.js` | `validate_french_conjugations.js` |

### 8.3 语法书

| 脚本 | 输入 | 输出 | 校验 |
|---|---|---|---|
| `build_german_grammar.py` | 本地 `deutsch-data/grammar/docs/`（已不在仓库）+ 脚本内原创专题 | `data/german-grammar-data.js` | `validate_german_grammar.js` |
| `build_english_grammar.py` | `scripts/english_grammar_src/p<P>-ch<NN>-<name>.md` | `data/english-grammar-data.js` | `validate_english_grammar.js` |
| `build_french_grammar.py` | 脚本内原创内容 | `data/french-grammar-data.js` | `validate_french_grammar.js` |

英语语法源格式：文件头 `<!-- part: ... / chapter: ... -->`，每个专题以 `=== tNN-slug | LEVEL` 开头、紧跟 `# N．标题`；文件名顺序即阅读顺序。`validate_english_grammar.js` 支持 `--only p1-ch01 --out /tmp/x.js` + `--file /tmp/x.js --partial` 只校验部分章节。**源文本必须原创**，不得摘抄受版权保护的语法书。

意大利语语法书无构建脚本（见 §7.2）。

### 8.4 搭配 / 同源词 / 课程（extras）

| 脚本 | 输出 | 校验 |
|---|---|---|
| `build_german_extras.py` | `data/german-collocations-data.js`、`data/german-cognates.js`、`data/german-course-data.js` | `validate_german_extras.js` |
| `build_french_extras.py` | `data/french-collocations-data.js`、`data/french-cognates.js` | `validate_french_extras.js` |
| `build_english_collocations.py` | `data/english-collocations-data.js` | `validate_english_collocations.js` |
| `cognate_extractor.js` | 从 `data/vocab/it.js` 提取意大利语同源词 | `validate_italian_extras.js`（校验 `data/cognates.js`） |

---

## 9. 修改任务到文件的映射

### 9.1 顶部导航 / 屏幕 / 路由 / 面包屑

- `lib/shell.js`（`SCREENS`、`ALIASES`、`DimRouter`）
- `index.html`（topbar、`section.screen`）
- `app.js`（`bind()` 委托、`RENDERERS`、`registerOpener`）

### 9.2 首页 / 词汇页 / 语法页 / 进度页 / 设置页内容

- `app.js` 对应 `render*` 函数；模块卡片在 `moduleCards` / `modeCard`
- 样式在 `styles.css` 第 5、7 节

### 9.3 选择题 / 拼写流程

- `app.js`（`startSession`、`buildSession`、`renderQuiz`、`onQuizAnswer`、`renderSpell`、`checkSpelling`、`finishSession`）
- `lib/practice-flow.js`（判分、遥测、提示、键盘）
- `lib/quiz-engine.js`（选项、难度、方向、`MasteryPolicy`）
- 拼写判分规则：`lib/vocab.js gradeSpelling` + `lib/languages.js spell`
- 干扰项：`lib/word-similarity.js`

### 9.4 词库字段 / 词条展示

- `lib/vocab.js`（`grammarLine`、`usageLine`、`headword`）
- 数据：`data/vocab/<code>.js` + 对应构建脚本（§8.1）+ `docs/vocab-schema.md`

### 9.5 新增一门语言

1. 产出 `data/vocab/<code>.js`（`docs/vocab-schema.md`「Adding a language」）
2. `lib/languages.js` 加一条档案：`code` / `key` / `cn` / `tts` / `spell` / `accents` / `modules` / `grammarGlobal` / `files`。路由、加载清单、存储 key（`progressKeysFor`）、重置菜单、加载文案全部自动派生
3. `.lang-switch` 按钮由 `app.js renderLangSwitch()` 生成（`index.html` 里的静态按钮只是首帧占位，可顺手补上）
4. 开了哪些 `modules`，就给对应功能模块（conjugation-app / grammar-book / verb-collocations / cognate-app）补该语言的 config

### 9.6 个人单词本 / 社区词书

- `lib/wordbooks.js`、`app.js`（词汇页 `[data-wb]` 处理）、`index.html`（三个 wordbook modal）
- 社区：`community-wordbooks.js`、`supabase-config.js`、`supabase-*.sql`、`SUPABASE_TROUBLESHOOTING.md`

### 9.7 动词变位

`conjugation-app.js`（语言 config）+ `index.html`（`conjugationSetupScreen` / `conjugationScreen`）+ 数据与脚本（§7.1、§8.2）。

### 9.8 语法书

`grammar-book.js` + `app.js openGrammarBook` + 语法数据与脚本（§8.3）。

### 9.9 动词搭配

`verb-collocations.js` + `verb-collocations-practice.js` + `index.html` + 数据与脚本（§8.4）。

### 9.10 同源词 / 打字游戏 / 德语课程

- `cognate-app.js`
- `typing-game-app.js` + `lib/typing-game.js`
- `german-course.js` + `data/german-course-data.js` + `build_german_extras.py`

### 9.11 统计 / 图表 / SRS

`lib/srs.js`、`stats-charts.js`、`app.js renderProgress`、`lib/practice-flow.js recordTelemetry`。

### 9.12 LocalStorage 结构 / 导入导出 / 重置 / 旧数据迁移

`lib/storage.js`（`DimStorage` / `Prefs` / `LegacyMigration`）+ `app.js`（`exportAllData` / `importAllData` / `resetProgress`）+ `tests/test-storage.js`；迁移改键依赖 `lib/vocab.js resolveLegacyKey`。

### 9.13 样式 / 主题

`styles.css`（tokens 第 1 节）；主题切换在 `app.js applyTheme` 与 `index.html` 首帧脚本。

### 9.14 加载 / 懒加载 / 启动

`lib/lang-loader.js`、`lib/boot.js`、`index.html`（`__ReadyGate`、`CdnFallback`）。

---

## 10. LocalStorage 约定

所有 key 以 `dimenticato_` 开头；`DimStorage.allKeys()` 以此前缀枚举，导出（`snapshot`）包含全部这类 key。

### 10.1 偏好（重置时保留，`DimStorage.PRESERVED_KEYS`）

- `dimenticato_theme`（`light` / `dark`）
- `dimenticato_language`（`italian` / `german` / `english` / `french`）
- `dimenticato_prefs`（按语言 `{ level, session, filter, source }`）
- `dimenticato_quiz_difficulty[_<lang>]`、`dimenticato_quiz_direction[_<lang>]`（后者不在 PRESERVED 列表，但也不在任何 PROGRESS 列表，所以重置不会删）
- `dimenticato_custom_wordbooks`（单词本内容）

### 10.2 学习进度（`DimStorage.PROGRESS_KEYS`，按语言重置）

| 用途 | italian | german / english / french |
|---|---|---|
| 系统词库已掌握 | `dimenticato_mastered` | `dimenticato_<lang>_mastered` |
| 选择题 / 拼写计数 | `dimenticato_stats` | `dimenticato_<lang>_stats` |
| 每日统计 | `dimenticato_daily_stats` | `dimenticato_daily_stats_<lang>` |
| SM-2 | `dimenticato_srs_italian` | `dimenticato_srs_<lang>` |
| 连续答对 | `dimenticato_mastery_streak_italian` | `dimenticato_mastery_streak_<lang>` |
| 变位课次 | `dimenticato_conjugation_lessons` | `dimenticato_conjugation_lessons_de/_en/_fr` |
| 德语课程等级 | — | `dimenticato_german_course_level` |

### 10.3 动态 key

- 单词本进度：`dimenticato_progress_wb_<lang>_<id>`（旧版无语言段的 `dimenticato_progress_wb_<id>` 由 `migrateLegacyWordbookProgress` 复制过来）
- 同源词进度：`dimenticato_cognate_progress_<lang>`
- 打字游戏最高分：`dimenticato_typing_best_<lang>_<mode>`

### 10.4 旧 key（只读，由 `LegacyMigration` 并入后删除）

`dimenticato_german_sr`、`dimenticato_english_sr`、`dimenticato_french_srs`、`dimenticato_french_daily`；`dimenticato_level` 只出现在导出的 1.0 兼容层。

### 10.5 修改注意

- 改任何 key 都要检查：旧数据兼容、`exportAll` / `importAll` / `mergeValueForKey`、`PROGRESS_KEYS` / `PRESERVED_KEYS`、`tests/test-storage.js`
- 进度键一律是 `entry.word`；如果词库重建改了 `word`，需要保证 `resolveLegacyKey` 能映射（`legacyId` 字段或词形匹配）
- 延迟写盘的一致性契约：切来源 / 切语言 / 导出 / 导入 / 重置前必须先 flush（`Progress.flush()` / `DimenticatoUtils.flushAllPersisters()`），否则挂起写会落错 key 或覆盖刚导入的数据

---

## 11. 隐性依赖与容易踩坑的地方

### 11.1 `CODE` 注入顺序是承重的

`lib/storage.js` 早于 `lib/srs.js` / `lib/wordbooks.js`；`lib/shell.js` 早于所有功能模块（它们在 init 时调 `showScreen` / `ScreenTree.register`）；`app.js` 必须最后（`init` 引用所有模块、注册 opener）。改顺序只在 `lib/lang-loader.js CODE` 里改，`index.html` 里不要再加 `<script>`。

### 11.2 初始化时机

模块既有「`document.readyState === 'loading'` 就等 `DOMContentLoaded`」的写法，也有裸 `DOMContentLoaded` 监听；两者都依赖 `__ReadyGate` + 合成 `DOMContentLoaded`。**不要**在 `LangLoader.boot()` 之外再派发 `DOMContentLoaded`，也不要让模块在解析期访问词库或 DOM。

### 11.3 数据是顶层 `const`，不一定在 `window` 上

`GRAMMAR_DATA`、`CONJUGATION_ALL_TENSES_DATA` 等是顶层 `const`，只能用裸名字 + `typeof` 守卫读取（`app.js grammarData`、`typing-game-app.js lateGlobal`）；少数文件（法语 / 德语 extras）额外挂了 `window.*`。`DIM_VOCAB` 挂在 `globalThis` 上。

### 11.4 DOM ID 强绑定

静态模块屏（quiz / spell / browse / typing / cognate / community / conjugation / collocations / grammarBook）里的 id 都被 JS 直接 `getElementById`。统一屏幕的内容则是 `app.js` 每次重新渲染，改它们的结构只改 `app.js`。

### 11.5 语言清单只在 `lib/languages.js`

见 §9.5。所有核心库都从 `Languages` 派生语言列表；它以静态 `<script defer>` 在 lang-loader 之前执行，必须保持零依赖。测试 harness（`tests/test-*.html`、`test-storage.js`）要先加载它。意大利语的存储 key 无后缀是历史格式，由 `Languages.DEFAULT_KEY` 标记，不要改。

### 11.6 返回逻辑按屏幕树，不按历史

`goBack()` 回 `SCREENS[current].parent`。新增二级屏要么在 `SCREENS` 里登记 parent，要么模块自己调 `goBack({ fallbackTarget })`；`ScreenTree.register` 登记的新屏父级固定为 `homeScreen`。浏览器后退键走 `popstate` → `DimRouter.onHistoryChange`。

### 11.7 transient 屏刷新落回父级

`quizScreen` / `spellScreen` / `conjugationScreen` / `verbCollocationPracticeScreen` 没有独立地址，深链接或刷新会回父级（会话不可恢复）。

### 11.8 重置进度要覆盖模块自己的 key

同源词进度 `dimenticato_cognate_progress_<lang>` 和打字游戏纪录 `dimenticato_typing_best_<lang>_<mode>` 不在 `PROGRESS_KEYS` 里，由 `DimStorage.keysForScope` 单独补上。新模块若自带进度 key，也要在那里登记，否则按语言重置会残留。

### 11.9 旧注释

`lib/practice-flow.js`、`grammar-book.js`、部分测试的注释里仍出现 `german-app.js` / `french-app.js` / `app-enhanced.js`，是历史说明，不代表文件还存在。

### 11.10 社区功能依赖远程服务

Supabase key 失效、bucket 或表结构不匹配时，社区上传 / 浏览 / 下载失败，本地学习不受影响。

### 11.11 预编译数据模式

前端从不 fetch Markdown / CSV；改内容后必须重跑对应构建脚本与校验器。多个 worktree 并行改动时，生成数据与其输入可能各自合并而不冲突却互相失配（语法 slug、课程映射），校验器是唯一防线。

---

## 12. 推荐修改工作流

1. **先读本文件**，按 §9 确定涉及的模块
2. **只读相关文件**（例：改动词搭配 → `verb-collocations.js`、`index.html` 对应屏、必要时数据文件）
3. **改完跑 `npm test`**；UI 改动在浏览器（或 headless Chrome）里实测，至少覆盖一门非意大利语语言与深链接
4. **回写本文件**：模块职责、文件映射、数据结构、脚本流程、LocalStorage、风险点有变化时同步更新，并在 §15 追加一条变更记录

---

## 13. 给 AI 的 instruction template

```md
先阅读 `CODE_SPACE.md`，把它当作本项目的整体上下文。

规则：
1. 不要重新扫描整个项目，先根据 `CODE_SPACE.md` 判断本次需求涉及哪个模块。
2. 只读取与本次需求直接相关的文件。
3. 如果修改影响了模块职责、文件结构、数据结构、脚本流程或依赖关系，完成后必须更新 `CODE_SPACE.md`。
4. 如果新增功能，请在 `CODE_SPACE.md` 中补充：功能简介、涉及文件、数据流变化、维护说明。
5. 如果删除或重构功能，也要同步更新 `CODE_SPACE.md` 中对应章节。
```

---

## 14. 文档维护规则

必须更新本文件的场景：新增 / 删除 screen 或 modal；新增主模块文件；修改语言档案或模块开关；修改主数据流；修改 localStorage 结构；修改 Supabase 结构；修改数据生成脚本；修改模块职责边界。

可选：小型样式微调、文案修正、不影响结构的纯 bugfix。

---

## 15. 变更记录

### 2026-09-30 — 统一运行时（feat/unified-runtime）

- **删除**：`app-enhanced.js`（补丁层）、`german-app.js`（GermanApp + EnglishApp）、`french-app.js`、`lib/navigation.js`、`lib/router.js`、`scripts/validate_index_counts.js`；`AppState`、按语言分屏的 `<lang>WelcomeScreen` / `<lang>VocabularyScreen` 等全部消失
- **新增**：`lib/languages.js`（语言档案）、`lib/vocab.js`（schema v1 词库 API）、`lib/storage.js`（DimStorage / Prefs / LegacyMigration，从旧 app.js 抽出）、`lib/srs.js`（SpacedRepetition / StatsManager，从 app-enhanced 抽出并修 interval 溢出）、`lib/wordbooks.js`（单词本 + 编辑器）、`lib/shell.js`（屏幕树 + hash 路由 `#/<code>/<slug>`）
- **重写**：`app.js` 为单个 IIFE（`window.App`），四语言共用首页 / 词汇 / 浏览 / 语法 / 进度 / 设置与选择题 / 拼写会话；模块入口按语言档案 `modules` 显示
- **重写**：`index.html`（topbar 导航 + 语言切换 + 主题、面包屑、统一屏幕）与 `styles.css`（paper/ink 设计系统）
- 功能模块改为开放 API：`ConjugationPractice.openFor`、`VerbCollocations.open`、`VerbCollocationPractice.open`、`CognateApp.open`、`TypingGameApp.open`、`GermanCourse.open`、`GrammarBook.init(null, { lang })`
- 存储 key 与旧版逐字相同，旧备份可直接导入；德 / 英 / 法旧 SRS 与法语旧每日记录由 `LegacyMigration` 并入统一 key，进度键统一为 `entry.word`
- 测试：`tests/run-headless.js` 17 个 harness

### 2026-09-30 — 词表统一 schema v1 + 版权清理

- 四语言系统词表改为 `data/vocab/<code>.js`；旧词表文件、`process_german_vocab.py`、`clean_italian_dictionary.py`、`validate_{italian,german,french}_vocabulary.js` 删除或合并（见 §7.1、§8.1）
- 删除版权存疑的书籍原文与构建遗留（意大利语语法 / 搭配书 Markdown、`grammar_content`、`grammar_tree.json`、`deutsch-data/grammar/`、`conjugations-*.json` 等）；运行时数据保留

### 历史摘要（统一运行时之前）

以下改动的具体实现大多已被统一运行时替换，仅保留结论：

- **2026-03**：项目从意大利语单站扩展到多语言；新增动词搭配练习、变位查询、德 / 英基础站
- **2026-04-27 Codebase Hardening**：XSS 修复（全部用户数据走 `escapeHtml`）、CDN 加 SRI 并锁版本、抽出 `lib/utils.js` 与 `lib/quiz-engine.js`、首批浏览器单元测试
- **2026-06-26**：选择题相似干扰项（`lib/word-similarity.js`，默认 `hard`）；德 / 英词表按 wordfreq 重建并合并 HanDeDict / ECDICT（加署名）；导航抽离（后被 `lib/shell.js` 取代）
- **2026-06-30**：德 / 英动词变位数据 + `conjugation-app.js` 改为语言 config 驱动
- **2026-08-21**：反向出题（`dimenticato_quiz_direction`）；打字游戏六项 bug 修复（特效老化、字体测量、速度封顶等）；统计双重计数修复
- **2026-08-28**：CI + `package.json`；仓库瘦身（取消跟踪大体积版权文件，git 历史仍在）；浏览页分页、`deferredPersist` 延迟落盘、干扰项有界采样；数据二级按模块懒加载；`lib/practice-flow.js` 收敛四份选择题判分

---

## 16. 快速索引（超简版）

- **改页面骨架 / 静态模块屏 DOM** → `index.html`
- **改统一屏幕内容（首页 / 词汇 / 浏览 / 语法 / 进度 / 设置）** → `app.js render*`
- **改导航 / 路由 / 面包屑 / 返回** → `lib/shell.js`
- **改选择题 / 拼写** → `app.js` + `lib/practice-flow.js` + `lib/quiz-engine.js`
- **改拼写判分 / 词条展示** → `lib/vocab.js`
- **改语言档案 / 模块开关** → `lib/languages.js`
- **改加载 / 懒加载** → `lib/lang-loader.js` + `lib/boot.js`
- **改存储 / 导入导出 / 重置 / 迁移** → `lib/storage.js`
- **改 SM-2 / 每日统计** → `lib/srs.js`；图表 → `stats-charts.js`
- **改单词本** → `lib/wordbooks.js`；社区 → `community-wordbooks.js` + `supabase-config.js`
- **改动词变位** → `conjugation-app.js`
- **改语法书** → `grammar-book.js`
- **改动词搭配** → `verb-collocations.js` + `verb-collocations-practice.js`
- **改同源词 / 打字游戏 / 德语课程** → `cognate-app.js` / `typing-game-app.js` + `lib/typing-game.js` / `german-course.js`
- **改样式 / 主题** → `styles.css`
- **改词库数据** → `data/vocab/<code>.js` 的构建脚本（§8.1）+ `node scripts/validate_vocab.js`
- **跑测试** → `npm test`（`node tests/run-headless.js [filter]`）
