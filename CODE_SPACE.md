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
> **2026-10 现状**：本文件描述统一运行时 + 模块数据 schema v1 + 存储 v3 + 编辑风改版之后的代码。旧架构（`AppState`、`app-enhanced.js` 补丁层、`german-app.js` / `french-app.js` 各语言控制器、`lib/navigation.js`、`lib/router.js`、按语言分屏的 `<lang>WelcomeScreen`、`german-course.js`、旧数据文件名与全局名等）已全部删除；如在旧 PR / 旧笔记里看到这些名字，以本文件与代码为准。

---

## 1. 项目定位

**Dimenticato** 是一个多语言（意大利语 / 德语 / 英语 / 法语）背单词 + 语法学习站，面向中文母语者。四门语言共用**同一套屏幕与同一份逻辑**，差异只来自语言档案和数据。主要学习场景：

- 系统词库练习（选择题 / 拼写 / 浏览 / 打字游戏），按 CEFR 等级 A1–C2 分组
- 个人单词本（新建 / 导入 TXT·JSON / 编辑 / 导出）与社区词书（Supabase）
- SM-2 间隔重复与每日学习统计
- 动词变位（查询 + 练习）、语法书、动词搭配（浏览 + 练习）、同源词
- 课程路线（语言档案列了 `files.course` 才有；目前只有德语：A1–C1 共 54 单元）

### 1.1 技术形态

- **前端**：HTML + CSS + 原生 JavaScript，无构建步骤，无运行时 npm 依赖
- **部署**：GitHub Pages 静态托管；本地用任意静态服务器（如 `python3 -m http.server`）打开 `index.html`
- **本地存储**：`localStorage`（唯一出入口 `lib/storage.js > DimStorage`）
- **远程能力**：Supabase（仅社区词书需要）
- **CDN**：Chart.js 4.4.0、marked 9.1.6、Supabase JS 2.39.0——页面里**没有**它们的 `<script>` 标签，由 `index.html` 内联的 `CdnFallback.load(name)` 按需注入（带 SRI，主 CDN 失败时换备用源）：进度页图表用 chart、语法书用 marked、社区词书用 supabase；Google Fonts（Fraunces / IBM Plex / Noto SC / Material Symbols Rounded）
- **语音**：Web Speech API（`App.speak`，语言档案里的 `tts` / `voice`）

### 1.2 设计取向

- 页面骨架集中在 `index.html`；统一屏幕由 `app.js` 渲染进 `[data-view]` 容器，功能模块屏的 DOM 仍是 `index.html` 里的静态标记
- 语言是 `body[data-language]` 上的**语境**（`italian` / `german` / `english` / `french`），不是一套独立的屏幕
- 数据预编译成 `.js` classic script（词库注册到 `DIM_VOCAB.<code>`，模块注册到 `DIM_DATA.<module>.<code>`），通过动态 `<script>` 注入，规避 GitHub Pages 上的 fetch / 中文路径问题
- 编辑风视觉（`lib/editorial.js` + `styles.css`）：页面按 section band 组织，滚动显现 / 数字递增 / 顶栏阴影等动效集中在 `Editorial` 里，尊重 `prefers-reduced-motion`
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
│   ├── wordbooks.js            ← 个人单词本（Wordbooks / WordbookEditor）
│   └── editorial.js            ← 编辑风动效（Editorial：顶栏阴影 / 滚动显现 / 数字递增 / 首页卡片视差）
├── supabase-config.js          ← Supabase 连接配置
├── community-wordbooks.js      ← 社区词书（CommunityWordbooks）
├── cognate-app.js              ← 同源词（CognateApp）
├── typing-game-app.js          ← 打字游戏 App 层（TypingGameApp）
├── course.js                   ← 课程路线（Course，数据驱动，任何带 course 模块的语言通用）
├── conjugation-app.js          ← 动词变位（ConjugationPractice，conjugations/1 数据驱动）
├── stats-charts.js             ← 进度页图表（StatsCharts / ChartsManager，Chart.js 按需加载）
├── grammar-book.js             ← 语法书阅读器（GrammarBook）
├── verb-collocations.js        ← 动词搭配浏览（VerbCollocations）
├── verb-collocations-practice.js ← 动词搭配练习（VerbCollocationPractice）
├── data/
│   ├── vocab/<it|de|en|fr>.js  ← 四语言系统词库，schema v1（src/ 为构建输入：法语教材层、英语词表）
│   └── <code>-<module>.js      ← 模块数据，module ∈ conjugations / grammar / collocations / cognates / course
├── docs/vocab-schema.md        ← 词库 schema v1 说明
├── docs/data-schema.md         ← 模块数据 schema v1 说明（conjugations/1、grammar/1 …）
├── scripts/                    ← 数据构建（Python）与校验（Node）脚本，见 §8
└── tests/                      ← 无头测试（node tests/run-headless.js），见 §6.15
```

根目录另有 `404.html`（把路径式地址转成 `#/` hash 路由再跳回首页）、`.nojekyll`、Supabase SQL / 排障文档与单词本模板（见 §6.14、§7.2）。本地可能存在不被 git 跟踪的历史文件或小写 `dimenticato/` 子目录（无关的 PinMe 模板），改功能时可忽略。

---

## 2. 运行模型总览

### 2.1 启动流程

1. `index.html` `<head>` 内联脚本读 `dimenticato_theme`，首帧前设 `html[data-theme="dark"]`（防闪白）
2. `<body>` 末尾两段内联脚本：
   - `__ReadyGate`：把 `document.readyState` 伪装成 `'loading'`，直到语言包注入完毕
   - `CdnFallback`：`load(name)` 按需注入 chart / marked / supabase（带 SRI，失败或全局缺席时换备用源），返回 Promise；首屏不加载任何 CDN 脚本
3. 仅有的三个本地静态脚本 `lib/languages.js` → `lib/lang-loader.js` → `lib/boot.js`（lang-loader 的文件清单读自语言档案，所以 languages.js 必须先到）
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
→ supabase-config → community-wordbooks → cognate-app → typing-game-app → course
→ conjugation-app → stats-charts → grammar-book → verb-collocations
→ verb-collocations-practice → app → lib/editorial
```

`app.js` 是最后一个功能文件：它在 `init` 里给 Shell 注册 opener，依赖所有功能模块已挂到 `window`。`lib/editorial.js` 排在它之后，只做视觉增强（监听 `#main` 与 `dimenticato:screenchange`），不被任何模块依赖。

### 2.2 两级懒加载

- 两级清单都由 `lib/languages.js` 各档案的 `files` 生成（`files.vocab` → `DATA`，其余键 → `MODULES`）
- **一级（词库，`LangLoader.DATA`）**：意 `data/vocab/it.js`；德 `data/vocab/de.js`；英 `data/vocab/en.js`；法 `data/vocab/fr.js`。切语言时 `LangLoader.ensure(lang)` 补拉，就绪后同样走 `App.onLanguageData`
- **二级（模块，`LangLoader.MODULES`）**：`conjugations` / `grammar` / `collocations` / `cognates` / `course` × 语言（英语无 cognates，只有德语有 course）。`LangLoader.ensureModule(lang, module)` 幂等（`lang` 接受 code 或 key；`grammar` 模块会顺带 `CdnFallback.load('marked')`）；发 `module:start` / `module:done`，`boot.js` 显示 / 撤遮罩，并调 `App.refreshCounts()`
- **守卫位置**：各模块 opener 内部检测数据缺席 → `ensureModule` → 重试一次；仍缺席走各自「数据未加载」降级 UI。见 `ConjugationPractice.openFor`、`GrammarBook.init`、`VerbCollocations` 的 `init`、`VerbCollocationPractice.open`、`CognateApp.open`、`TypingGameApp`（变位模式）、`App.openGrammarBook`、`Course.open`
- 功能模块的数据文件把载荷注册为 `DIM_DATA.<module>.<code>`，消费方一律调用时经 `LangLoader.data(lang, module)` 取数（未加载为 `null`）；数据文件是 classic script——**不能改成 `type="module"`**
- `LangLoader.isModuleLoaded(lang, module)` 查询状态；`LangLoader.retryModule(lang, module)` 重拉失败的模块。`done` / `module:done` 事件带 `{ ok, failed[] }`，`boot.js` 据此显示真实进度条，失败时列出文件名并给「重试」/「先继续使用」
- `lib/boot.js` 在安全上下文、页面 load 之后注册 `sw.js`（离线缓存：同源请求一律网络优先、离线才回落缓存；改策略时把 `VERSION` 加一）

### 2.3 架构分层

1. **引导层**：`index.html` 内联脚本 + `lib/languages.js` + `lib/lang-loader.js` + `lib/boot.js`
2. **外壳层**：`lib/shell.js`（屏幕树、面包屑、顶部导航高亮、hash 路由）+ `lib/editorial.js`（视觉动效）
3. **核心库层**：`lib/languages.js`、`lib/vocab.js`、`lib/storage.js`、`lib/srs.js`、`lib/quiz-engine.js`、`lib/practice-flow.js`、`lib/wordbooks.js`、`lib/utils.js`、`lib/word-similarity.js`
4. **统一运行时**：`app.js`（统一屏幕渲染、练习会话、语言切换、模块入口）
5. **功能模块层**：根目录 `*-app.js` / `grammar-book.js` / `verb-collocations*.js` / `course.js` / `community-wordbooks.js` / `stats-charts.js`
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
| `grammarBookScreen` | `grammar/book`（`param`：`#/<code>/grammar/book/<topic slug>`） | grammar | `grammar-book.js` |
| `conjugationSetupScreen` | `grammar/conjugation` | grammar | `conjugation-app.js` |
| `conjugationScreen` | 无（transient） | conjugationSetup | `conjugation-app.js` |
| `verbCollocationsScreen` | `grammar/collocations` | grammar | `verb-collocations.js` |
| `verbCollocationPracticeScreen` | 无（transient） | verbCollocations | `verb-collocations-practice.js` |
| `courseScreen` | `course`（`module: 'course'`，section grammar） | home | `course.js`（静态 `<section>`） |
| `progressScreen` | `progress` | home | `app.js renderProgress` |
| `settingsScreen` | `settings` | home | `app.js renderSettings` |

- `section` 字段决定顶部导航哪一项高亮；`crumb` 决定面包屑文案
- **transient** 屏（会话屏）没有自己的地址：URL 保留父级地址，刷新 / 深链接落回父级
- `module: 'course'`：当前语言档案 `files.course` 缺席时进入会回首页（目前只有德语有）
- `param: true`：slug 之后可再带一段参数，交给该屏 opener（语法书用它深链到具体专题）
- 统一屏幕（home / vocab / browse / grammar / progress / settings）的 HTML 只是一个 `[data-view]` 空容器（`#homeView`、`#vocabView`、`#grammarView`、`#progressView`、`#settingsPrefs` 等），每次进入时由 `app.js` 重新渲染；quiz / spell / browse 以及各功能模块屏的内部 DOM 是静态标记

### 3.3 modal

`#wordbookEditorModal`、`#wordEditDialog`、`#wordbookSelectDialog`（`lib/wordbooks.js`）、`#communityUploadModal`、`#communityPreviewModal`（`community-wordbooks.js`）、`#helpModal`（`app.js` `data-action="help"`）。

通用关闭：`[data-close-modal]` 按钮、点击 `.modal` 遮罩本身、Esc（`app.js bind()` 统一处理）。

### 3.4 导航原语（均挂在 `window`）

- `showScreen(id, opts)`：切 `.screen.active` → 渲染面包屑 / 导航 → 跑 `Shell.onEnter` 钩子（`app.js` 在这里渲染统一屏）→ `DimRouter.sync` 推 / 替换 history → 派发 `dimenticato:screenchange`。`opts`：`skipRoute`、`replaceRoute`、`keepScroll`
- `goBack({fallbackTarget})`：**按屏幕树回父级**（不是历史栈）；无父级时用 `fallbackTarget`，再兜底首页
- `setPracticeContext(ctx)` / `getActiveLanguage()`
- `Shell.registerOpener(screenId, fn(lang))`：深链接或切语言后重新进入模块屏时，用模块自己的 open 装数据再切屏；opener 收到 `(lang, param)`（`App.init` 注册了 grammarBook（param 为专题 slug）/ conjugationSetup / verbCollocations / typingGame / cognatePractice / communityBrowse / course）
- `ScreenTree.register(id, info)`：给运行时新增的屏补一条（父级固定为首页），统一树里已有的 id 忽略；目前没有模块调用它。只认 `SCREENS` 里的 id
- `DimRouter.href(lang, screenId)`：生成 `#/<code>/<slug>`，`lang` 接受 code 或 key
- `DimRouter.apply(route)`：路由语言与当前不同时先 `App.setLanguage(lang)`（懒加载词库）再进入。每次导航换一个令牌，等语言包期间又导航了（或语言已变）就放弃这次进入；未知 slug / 语言落到该语言首页并 `replaceState` 改写地址

### 3.5 事件委托约定（`app.js bind()`）

document 级单一 click 委托，按优先级识别：`[data-lang]` 切语言 → `[data-nav-screen]` 导航 → `[data-go]` 切屏 → `[data-speak]` 朗读 → `[data-back]` 返回 → `[data-theme-set]` → `[data-close-modal]` → `[data-action]`（`onAction`：`start` / `again` / `review` / `level` / `go-vocab` / `go-progress` / `help` / `community-upload` / `community-upload-close` / `community-preview-close` / `community-back` / `community-file-pick`，其余视为模块名走 `openModule`）→ 词汇页 `[data-source]` / `[data-level]` / `[data-filter]` / `[data-wb]` → 浏览页 `[data-row]`。

新增按钮优先用这些 data 属性，不要再写 `getElementById(...).addEventListener`。

---

## 4. 核心状态与数据流

已**没有**全局 `AppState`。状态分散在以下位置：

| 状态 | 所在 |
|---|---|
| 当前语言 | `body[data-language]`（读：`getActiveLanguage()` / `App.lang()`；写：`App.setLanguage`） |
| 当前屏幕 | `Shell.state.current` / `previous` / `context` |
| 练习来源 / 等级 / 筛选 / 题量 | `Prefs`（`dimenticato_<code>_prefs`，每语言一份） |
| 已掌握集合、选择题/拼写计数 | `app.js` 内部 `Progress`（Set 缓存 + `deferredPersist` 落盘） |
| 当前练习会话 | `app.js` 内部 `session`（mode / lang / words / quizIndex / engine / hintStage …） |
| 浏览页筛选 | `app.js` 内部 `browse`（q / level / status / limit） |
| SM-2 计划、每日统计 | `SpacedRepetition` / `StatsManager`（`lib/srs.js`） |
| 连续答对计数 | `MasteryPolicy`（`lib/quiz-engine.js`） |
| 单词本 | `Wordbooks`（`lib/wordbooks.js`） |

### 4.1 练习来源（`app.js currentSource()`）

`Prefs.source` 取值：

- `'system'`：系统词库，按 `Prefs.level`（`A1`–`C2` 或 `all`）取 `Vocab.atLevel` / `Vocab.entries`；进度 key = `DimStorage.masteredKey(lang)`
- `'wb:<id>'`：个人单词本，词条经 `Vocab.fromWordbookWord` 适配成 v1 形状；进度 key = `DimStorage.wordbookKey(lang, id)` = `dimenticato_<code>_wb_<id>`
- `'course'`：课程路线选中的单元（`App.practiceEntries(label, entries)` 写入内存 `courseSelection`），进度记在系统 key

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
| `course` | `Course.open(l)` |
| `community` | `CommunityWordbooks.showBrowseScreen()` |

---

## 5. 文件职责地图

### 5.1 `index.html`

负责：页面骨架（topbar / crumbs / screens / modals / footer）、首帧主题脚本、`__ReadyGate`、`CdnFallback`（CDN 地址与 SRI 都在这里）、三个静态引导脚本、SVG 图标 `<symbol>` 表、Help 弹窗里的数据来源与致谢。

改这些先读它：新增 screen / modal、静态模块屏的 DOM（quiz / spell / browse / typing / cognate / community / conjugation / collocations / grammarBook / course）、顶部导航与语言按钮、CDN 依赖。

**不在这里**：首页 / 词汇页 / 语法页 / 进度页 / 设置页的内容（`app.js` 渲染）、课程单元列表（`course.js` 渲染进 `#courseScreen`）、脚本清单（`lib/lang-loader.js`）。

### 5.2 `styles.css`（约 3100 行）

paper/ink 编辑风设计系统，一套配色覆盖全部语言（不再有按语言换色）。文件头列出分节：1 tokens · 2 base · 3 shell · 4 primitives · 5 home · 6 practice · 7 hubs / browse / progress / settings · 9 loading / toast · 10 responsive · 8 modules（放在文件末尾，8.0–8.12，自带 8.12 responsive；其中 8.7 课程路线、8.10 进度页图表、8.11 帮助弹窗）。

- tokens：`:root`（`--paper*`、`--card`、`--ink*`、`--muted`、`--line*`、`--red*`、`--gold*`、`--verde*`、`--on-ink`、`--serif` / `--sans` / `--mono`、`--radius`、`--wrap` / `--narrow`、`--control`、`--ease` …）；`[data-theme="dark"]` 只覆盖颜色 token
- 编辑风原语：`.section` / `.section-alt`（页面分段 band）、`.section-head` + `.kicker`（段落标题）、`.page-hero`（`app.js pageHero()`）、`.reveal`（`Editorial` 加 `.in` 显现）、`.topbar.scrolled`
- 原语：`.card`（可点击入口，内部 `card-title` / `card-label` / `card-desc` / `card-meta` / `card-cta`）、`.panel`（静态容器）、`.chip`、segmented control、`.primary-btn` / `.btn` / `.pill-btn` / `.icon-btn`、`.feedback`
- 第 8 节是功能模块屏的样式（变位矩阵、搭配侧栏、同源词、打字游戏、markdown 阅读区、课程路线、图表等）
- 图标用 Material Symbols 连字（`<span class="msr">name</span>`）

### 5.3 运行时 JS 一览

| 文件 | 暴露的全局 | 职责 |
|---|---|---|
| `app.js` | `App` | 统一运行时，见 §6.1 |
| `lib/lang-loader.js` | `LangLoader` | 数据与代码注入、懒加载，见 §2 |
| `lib/boot.js` | — | 加载遮罩、词库自检、`LangLoader.boot()` |
| `lib/shell.js` | `Shell`、`ScreenTree`、`DimRouter`、`showScreen`、`goBack`、`setPracticeContext`、`getActiveLanguage` | 屏幕树 / 导航 / 路由 |
| `lib/languages.js` | `Languages` | 语言档案 |
| `lib/vocab.js` | `Vocab` | 词库 API |
| `lib/storage.js` | `DimStorage`、`Prefs`、`LegacyMigration` | 存储网关 |
| `lib/srs.js` | `SpacedRepetition`、`StatsManager` | SM-2 与每日统计 |
| `lib/quiz-engine.js` | `QuizEngine`、`MasteryPolicy` | 选项生成与偏好 |
| `lib/practice-flow.js` | `PracticeFlow` | 判分流程、遥测、提示、键盘 |
| `lib/word-similarity.js` | `WordSimilarity` | 相似干扰项 |
| `lib/typing-game.js` | `TypingGame` | 打字游戏引擎 |
| `lib/wordbooks.js` | `Wordbooks`、`WordbookEditor` | 单词本 |
| `lib/utils.js` | `DimenticatoUtils`、`Speaker`、`DimText`、`escapeHtml`、`escapeAttribute`、`renderIcon`、`debounce`、`shuffleArray`、`localDay`、`parseLocalDay`、`downloadFile`、`deferredPersist` | 工具 |
| `lib/editorial.js` | `Editorial`（`scan`） | 编辑风动效 |
| `supabase-config.js` | `getSupabaseClient`、`communityLanguage` | Supabase 配置 |
| `community-wordbooks.js` | `CommunityWordbooks` | 社区词书 |
| `cognate-app.js` | `CognateApp`、`CognateState` | 同源词 |
| `typing-game-app.js` | `TypingGameApp` | 打字游戏 App 层 |
| `course.js` | `Course` | 课程路线 |
| `conjugation-app.js` | `ConjugationPractice` | 动词变位 |
| `stats-charts.js` | `StatsCharts`（`sectionsHtml`、`mount`）、`ChartsManager` | 进度页图表 |
| `grammar-book.js` | `GrammarBook` | 语法书 |
| `verb-collocations.js` | `VerbCollocations` | 搭配浏览 + 共享的语言 / 数据解析层 |
| `verb-collocations-practice.js` | `VerbCollocationPractice` | 搭配练习 |

---

## 6. 核心 JS 模块详解

### 6.1 `app.js` — 统一运行时

单个 IIFE，挂 `window.App`。文件头注释写明：语言差异只来自 `lib/languages.js`、`data/vocab/<code>.js`、各模块自己的数据。

内部结构（按文件顺序）：

- 常量：`LEVELS`、`LEVEL_NAMES`、`BROWSE_PAGE = 200`、`SESSION_SIZES`（拼写屏特殊字母键取自档案的 `accents`）
- `grammarData(l)`：`LangLoader.data(l, 'grammar')`
- 朗读用 `lib/utils.js` 的 `Speaker`（按档案 `voice` 正则选音色）
- `Progress`：已掌握 Set 缓存（按 key）、统计计数器（按语言）、`touch` / `flush` / `forget`
- 练习来源：`currentSource` / `buildSession`（§4.1、§4.2）
- 练习会话：`makeEngine`、`startSession`、`renderQuiz` / `onQuizAnswer`、`renderSpell` / `checkSpelling`、`nextQuestion`、`finishSession`；提示分阶段（`PracticeFlow.hintReset/hintAdvance`）
- 渲染（编辑风 section band：`.section` / `.section-alt` / `.section-head` + `.kicker`，子页头部用 `pageHero()`）：`renderHome`（hero：格言 + `heroStat` 数字（`data-count` 递增）+ `#heroStack` 单词卡堆，最前一张是每日一词 `renderHeroStack` / `renderWotd`；等级卡片、模块卡片、「怎么用」三步）、`renderVocab`（来源 / 等级 / 筛选 chip、单词本列表、练习方式卡片）、`renderBrowse` / `renderBrowseList`（搜索用 `Vocab.looseKey`，200 行分页）、`renderGrammar`、`renderProgress`（概览 + 到期复习 + 内嵌图表 `StatsCharts.sectionsHtml(l)` / `StatsCharts.mount(l)`）、`renderSettings`（难度 / 方向开关由 `QuizEngine.renderDifficultyToggle` / `renderDirectionToggle` 生成）
- 主题：`applyTheme` / `setTheme`（写 `html[data-theme]` 与 `dimenticato_theme`）
- 备份：`exportAllData` / `importAllData`（导入后对已加载语言重跑 `LegacyMigration`）/ `resetProgress`，全部先 `flushAll()`
- `toast(message)`、`openGrammarBook`、`MODULE_OPENERS` / `openModule`、`setLanguage`、`RENDERERS` / `renderScreen`（词库未就绪时显示错误提示）、`bind`

`window.App` 公共 API：

- `lang()`、`toast(msg)`、`speak(text, l)`、`setLanguage(l, opts)`、`openGrammarBook(l, slug)`、`openModule(name)`
- `masteredWords(l)`：系统词库已掌握 Set
- `startSession(mode, opts)`：`opts.entries` / `key` / `label` 可指定自定义词条
- `practiceEntries(label, entries)`：课程路线用（来源切到 `'course'` 并进词汇页）
- `onLanguageData(l)`：LangLoader 回调，幂等
- `refreshCounts()`：模块数据到位后刷新首页数字
- `init()`：幂等；主题、语言按钮（`renderLangSwitch`）、`Speaker.init`、`bind`、`Shell.onEnter`、注册 opener（旧进度迁移在 `onLanguageData` 里跑）

### 6.2 `lib/shell.js` — 屏幕树 / 导航 / 路由

见 §3.2、§3.4。要点：

- `SCREENS` 是唯一屏幕注册表；新增屏要在这里加一行（slug / section / parent / crumb / transient / module / param）
- `renderChrome` 渲染面包屑（首项为语言中文名）并把 `[data-nav-screen]` 的 `href` 改成当前语言的路由
- `DimRouter`：`parse` / `href` / `sync` / `apply` / `onHistoryChange` / `start`；`start()` 只跑一次（由 `App.onLanguageData` 首次调用触发），监听 `popstate` / `hashchange`
- `file://` 下 `pushState` 可能失败，已 try/catch

### 6.3 `lib/languages.js` — 语言档案

「唯一知道有哪些语言」的地方。每条档案：`code`（it/de/en/fr，URL、存储 key、`DIM_VOCAB` / `DIM_DATA` 都用它）、`key`（italian…，`body[data-language]`、`dimenticato_language` 与打字游戏纪录 key 仍用它；旧备份里的 key 布局由 `LegacyMigration` 识别）、`name`、`cn`、`en`、`tts`、`voice`、`spell`、`accents`（拼写屏特殊字母键）、`motto`、`files`（lang-loader 注入的数据文件，`vocab` 随语言加载，其余按模块懒加载）。`files` 里除 `vocab` 外的键就是这门语言有的可选模块——没有单独的开关表，`Languages.hasModule(lang, module)` 直接看 `files[module]`。

当前模块：

| | cognates | conjugations | grammar | collocations | course |
|---|---|---|---|---|---|
| it | ✓ | ✓ | ✓ | ✓ | |
| de | ✓ | ✓ | ✓ | ✓ | ✓ |
| en | | ✓ | ✓ | ✓ | |
| fr | ✓ | ✓ | ✓ | ✓ | |

API：`Languages.list` / `codes` / `keys` / `DEFAULT` / `DEFAULT_KEY` / `get(codeOrKey)` / `code()` / `key()` / `has()` / `hasModule(codeOrKey, module)` / `label()` / `byKeyMap(fn)`。`get` 同时接受 `'de'` 与 `'german'`。

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

存储布局 v3（`STORAGE_VERSION: '3'`，标记在 `dimenticato_storage_version`）：**语言数据一律是 `dimenticato_<code>_<name>`**，由 `DimStorage.key(lang, name)` 生成（`lang` 接受 code 或 key）。

- `DimStorage`：`PREFIX`、`CODES`、`LANGS` / `LANGUAGE_LABELS`（界面选项用旧 key）、`PRESERVED_KEYS`（全局偏好）、`PRESERVED_NAMES`（每语言偏好：`prefs` / `quiz_difficulty` / `quiz_direction`）、`PROGRESS_NAMES`（`mastered` / `stats` / `daily_stats` / `srs` / `mastery_streak`）；key 工具 `code`、`key`、`parseKey`、`masteredKey` / `statsKey` / `dailyStatsKey` / `srsKey` / `wordbookKey(lang, id)`、`prefixFor`；读写 `allKeys()`、`safeParse`、`safeSetItem`、`moveKey`、`snapshot()`；`exportAll()`（`EXPORT_VERSION` `2.0`：`keys` 为权威数据 + `data` 1.0 兼容层）、`describePayload`、`normalizePayload`、合并纯函数（`mergeArrayUnion` / `mergeCounters` / `mergeDailyStats` / `mergeWordbooks` / `mergeSrsStore` / `mergeMaxMap` / `mergeFill` / `mergeValueForKey`）、`importAll(payload, { mode: 'merge'|'overwrite' })`、`keysForScope` / `reset({ scope })`
- `Prefs`：`dimenticato_<code>_prefs`，`{ level, session, filter, source }`（默认 `A2` / `20` / `all` / `system`）；属于偏好，重置保留
- `LegacyMigration` 两层：
  - `targetFor` / `migrateKeys` / `migrateStorage`：只改 key 名、不需要词库。把 v1/v2 的各种布局（意大利语无前缀的 `dimenticato_mastered` 等、`dimenticato_<german>_*`、`daily_stats_<lang>`、`srs_<lang>`、`mastery_streak_<lang>`、`quiz_*_<lang>`、`progress_wb_*`、旧 SM-2 `german_sr` / `english_sr` / `french_srs`、`french_daily`、合一的 `dimenticato_prefs`）并进 v3；多来源按 `mergeValueForKey` 合并，新 key 写成功后才删旧 key。文件加载时跑一次，版本已是 3 则跳过
  - `run(lang)`：需要词库，幂等，每次加载语言都跑（`App.onLanguageData` 先冲刷内存进度，跑完再 `Progress.forget` + `SpacedRepetition.forget` 丢缓存）。每门语言第一次（或存储里又出现旧布局 key 时）先 `migrateStorage({ force: true })`，再把已掌握（系统 + 各词本）、SM-2、连续答对的旧标识改写成 `entry.word`（词本自己的词形优先保留），法语旧每日记录同理。解析不出的旧键原样保留
  - `moduleKeyLanguage(key)`：识别功能模块 key 属于哪门语言（供 `keysForScope`）

### 6.6 `lib/srs.js` — SM-2 与每日统计

- `SpacedRepetition`：按语言存 `dimenticato_<code>_srs`，键为 `entry.word`。`MAX_INTERVAL = 365` 天、`MAX_EASINESS = 2.8`（修复了旧版连续答对 ~20 次后 interval 溢出、`Date` 抛 RangeError 的 bug）。API：`peek`、`review(lang, word, quality)`、`getDueWords(lang, words)`、`countDueWords`、`getWordStatus(word, lang)`、`convertCorrectToQuality(isCorrect, timeSpent)`
- `StatsManager`：`dimenticato_<code>_daily_stats`。API：`recordActivity(lang, payload)`、`getTodayStats`、`getRecentStats(days, lang)`、`getTotalStats`、`getStreak(lang)`
- 两者在 `app.js` 之前加载，调用方一律在调用时经 `window.*` 解析

### 6.7 `lib/quiz-engine.js` — 通用测验引擎

- `QuizEngine` 实例（每个会话一个）：`fieldMap`（统一运行时固定为 `{ source: 'word', target: 'zh' }`）、`generateOptions`（按难度：`hard` 用 `WordSimilarity.pickConfusableDistractors`，`easy` 随机；按方向：反向时选项为外语词形并排除释义 twin）、`renderOptions`、`showFeedback`、`highlightOptions`、`updateProgress`、`filterUsableWords`、`displayGloss`、`isReverse` / `correctAnswerFor` / `questionTextFor` / `shouldSpeakQuestion`、`recordAnswer`（交给 `MasteryPolicy`）
- 静态：`sampleDistractorPool(source, word, size=800)`（词频邻域 + 等距抽样）、`getDifficulty/setDifficulty(value, lang)`（全局 `dimenticato_quiz_difficulty` + 每语言 `dimenticato_<code>_quiz_difficulty`，后者优先，默认 `hard`）、`getDirection/setDirection`（`dimenticato_quiz_direction` / `dimenticato_<code>_quiz_direction`）、`renderDifficultyToggle` / `renderDirectionToggle` + `sync*` / `bind*`（委托绑定）
- `MasteryPolicy`：`STREAK_REQUIRED = 2`，存 `dimenticato_<code>_mastery_streak`

### 6.8 `lib/practice-flow.js` — 判分流程

- `PracticeFlow.mcAnswer(env)`：选择题判分 + 反馈 + 遥测 + 保存 + 自动下一题；语言差异由 env 注入（`recordMastery`、`save`、`next`、`nextDelay`…）
- `PracticeFlow.recordTelemetry(lang, { correct, word, startedAt })`：`StatsManager.recordActivity` + `SpacedRepetition.review`，返回下一题开始时刻；拼写也走这里
- 提示：`initialHint`、`hintReset`、`hintAdvance`
- 键盘：document 级 1–4 选项 / Enter 下一题 / R 重听，只作用于含 `id$="McOptions"` 容器的活动屏（即 `#quizMcOptions`）；输入框内按键不拦截

### 6.9 `lib/wordbooks.js` — 个人单词本

- 行形状统一为 `{ word, zh, en?, notes? }`；旧形状（`{italian, english, chinese}`、`{german, display, meaning}`…）与社区文件在加载 / 导入时由 `normalizeRow` / `normalizeBook` 归一
- 存储：内容在全局 `dimenticato_custom_wordbooks`；每本的已掌握列表在 `DimStorage.wordbookKey(lang, id)` = `dimenticato_<code>_wb_<id>`
- `Wordbooks`：`all` / `reload` / `list(lang)` / `get(id)` / `add` / `create` / `remove`（连带删进度 key）/ `touch` / `progressKey(wb)` / `entries(wb)`（→ v1 词条）/ `parseTxt(text, lang)` / `importFile(file, lang)` / `exportJson` / `exportTxt`
- `WordbookEditor`：编辑器 modal、单词编辑、批量删除 / 批量导入、导出对话框、浏览页「加入单词本」（`addEntryToWordbook` + `#wordbookSelectDialog`）
- TXT 格式：空行分块，块内 `word / meaning / 中文? / notes?`；单行块从系统词库查释义（详见 `docs/TXT_FORMAT_GUIDE.md`、`custom_wordbook_template.*`）

### 6.10 其余 `lib/`

- `lib/utils.js`：`Speaker`（Web Speech 朗读，`speak(text, lang)` 接受 code 或 key）/ `escapeHtml` / `escapeAttribute` / `renderIcon` / `debounce` / `shuffleArray` / `localDay` / `parseLocalDay` / `downloadFile` / `deferredPersist(fn, wait)`（脏标记合并写，`pagehide` / `visibilitychange→hidden` 自动冲刷，`DimenticatoUtils.flushAllPersisters()`）/ `DimText`（通用文本归一化、词头键）
- `lib/word-similarity.js`：`editDistance`、`pickConfusableDistractors`（纯函数，按池数组身份缓存索引）
- `lib/typing-game.js`：打字游戏纯引擎与 canvas 渲染（速度封顶 `maxSpeed`、特效按帧老化 `_advanceFx`）
- `lib/editorial.js`：`Editorial.scan()`；给 `html` 加 `.js`、滚过 24px 时 `.topbar.scrolled`、`.reveal` 进视口加 `.in`（IntersectionObserver）、`[data-count]` 数字递增、`#heroStack` 指针视差（仅 `pointer: fine`）；观察 `#main` 变动，只在 `dimenticato:screenchange` 后约 900ms 内做入场动画；`prefers-reduced-motion` 时全部直接到终态

### 6.11 `conjugation-app.js` — 动词变位

完全由 conjugations/1 数据驱动，**没有按语言的 config 表**：人称顺序与标签取 `persons[]`，时态顺序 / 语气 / 矩阵列取 `tenses[]`（`group` / `time` / `omit` / `labels` / `subject`），矩阵行取 `meta.groups`，输入框示例取 `meta.placeholders`，法语缩合取 `meta.elision`（见 `docs/data-schema.md`）。`ConjugationPractice.openFor(lang)` 取数据、缺数据时 `ensureModule(lang, 'conjugations')` 后重试，复用同一对 `conjugationSetupScreen` / `conjugationScreen`。功能：变位查询（原形或任一变位形式反查）、时态矩阵（窄屏为 picker）、按词频切课次、三种题型 `mcq` / `typing` / `full`、课次进度 `dimenticato_conjugation_lessons_<code>`（意大利语旧的无后缀 key 首次打开时迁移）。导出：`init`、`start`、`searchVerbLookup`、`openFor`、`storageKeyFor`。

### 6.12 `grammar-book.js` — 语法书

`GrammarBook.init(customData, { lang })`：传 `null` 时经 `LangLoader.data(lang, 'grammar')` 取数据；数据缺席先 `ensureModule(lang, 'grammar')` 再重试。每次 init 都重建目录树与阅读区（四语言切换安全）。`openTopic` / `loadTopic(slug, …)` 可直接跳专题（`App.openGrammarBook(l, slug)`、课程路线用）；`resolveSlug(slug, data)` 经 `meta.aliases` 把旧 slug 解析到 grammar/1 的 `p<N>/ch<NN>/t<NN>`。阅读位置存 `dimenticato_grammar_topic_<code>`，地址栏同步为 `#/<code>/grammar/book/<slug>`。其余导出：`toggleSidebar`、`getLanguage`、`getCurrentSlug`。Markdown 渲染依赖 `marked`（`CdnFallback.load('marked')` 按需加载）。返回按钮 `grammarBookBackBtn` 由 `app.js` 绑定到 `goBack()`。

### 6.13 动词搭配

- `verb-collocations.js`：`VerbCollocations.open(lang)`；按搭配键（介词 / 小品词 / 格）或按动词浏览、搜索；同时导出数据解析层（`init`、`resolveLang`、`profile`、`dataset`、`hasDataset`、`ensureDataset`、`title`、`keysOf`、`examples`、`displayOf`、`keyLabel`、`keyOrder`、`looseKey`、`getLanguage`）供练习模块复用。查阅器内 `#vcStartPracticeBtn` 以当前浏览语言打开练习
- `verb-collocations-practice.js`：`VerbCollocationPractice.open(lang)`；题型：动词选介词、同动词不同介词辨义、例句翻译填空
- 数据：`LangLoader.data(lang, 'collocations')`，四语言同为 collocations/1 `{ meta, keys, verbs, index }`（德语格信息在 key 上，如 `an+A`）

### 6.14 其他功能模块

- `cognate-app.js`：`CognateApp.open(lang)`（it / de / fr，cognates/1 数据，规律分组取 `meta.patterns`）；模式：英语提示拼写、对照、构词规律分组、浏览；进度 `dimenticato_cognate_progress_<code>`（旧的无后缀 key 与 `_<key>` 后缀 key 首次加载时迁移）；另导出 `CognateState`
- `typing-game-app.js`：`TypingGameApp.open(lang)`；背单词模式（词源 `Vocab.entries(lang)`）与动词变位模式（读 `LangLoader.data(lang, 'conjugations')`，取前 `VERB_CAP = 300` 个动词，无语言分支）；最高分 `dimenticato_typing_best_<langkey>_<mode>`（这里是语言 key，如 `italian`）
- `course.js`：`Course.open(lang)`；course/1 数据（`LangLoader.data(code, 'course')`，open 时 `ensureModule` 补拉），渲染进静态 `#courseScreen`，无语言分支（目前只有德语配了 `files.course`：54 单元 A1–C1）；`unit.words` 直接按 `word` 查词库，`unit.grammar[].slug` 经 `GrammarBook.resolveSlug` 跳语法书；练习调用 `App.practiceEntries`；等级存 `dimenticato_course_level_<code>`（德语旧 key `dimenticato_german_course_level` 自动迁移）
- `community-wordbooks.js`：`CommunityWordbooks.showBrowseScreen()` / `showUploadDialog()`；上传到 Supabase Storage + `community_wordbooks` 表（含 `language` 字段，老库无此列时降级为客户端过滤）；浏览支持按语言 / 难度筛选、搜索、排序；下载后 `Wordbooks.add`；解析复用 `Wordbooks.parseTxt` / `normalizeBook`
- `stats-charts.js`：没有弹窗，图表直接嵌在进度页：`StatsCharts.sectionsHtml(lang)` 产出「趋势图表」「学习记录」两节，`StatsCharts.mount(lang)` 在写入后 `CdnFallback.load('chart')` 再绘图（`ChartsManager`）；7 天趋势、每日单词量、掌握度分布，颜色读设计 token；数据来自 `StatsManager`、`Vocab.entries(lang)` + `SpacedRepetition.getWordStatus`
- `supabase-config.js`：URL / anon key、`STORAGE_CONFIG`、标签与难度映射；SQL 见 `supabase-setup.sql`、`supabase-storage-fix.sql`、`docs/SUPABASE_TROUBLESHOOTING.md`

### 6.15 `tests/` — 无头测试

入口 `node tests/run-headless.js [filter]`（`npm test` 同义；CI `.github/workflows/ci.yml` 在 push / PR 到 main 时跑）。共 29 个 harness：

- HTML（在 Node `vm` + `tests/dom-shim.js` 里按 `<script src>` 顺序执行）：`test-quiz-engine.html`、`test-spaced-repetition.html`
- Node：`check-icons.js`、`check-data-modules.js`、`test-french-data.js`、`test-german-course-data.js`、`test-storage.js`、`test-typing-game.js`、`test-typing-game-app.js`、`test-conjugation-app.js`、`check-contrast.js`（配色对比度）、`test-shell-router.js`、`test-wordbooks.js`、`test-community-wordbooks.js`、`test-paths.js`（index.html / languages / lang-loader 引用的本地文件都存在）
- 数据校验器（阻断项）：`scripts/validate_vocab.js`、`validate_modules.js`（全部模块数据对 `docs/data-schema.md`）、`validate_french_extras.js`、`validate_french_conjugations.js`、`validate_english_conjugations.js`、`validate_german_conjugations.js`、`validate_french_grammar.js`、`validate_german_extras.js`、`validate_german_grammar.js`、`validate_english_grammar.js`、`validate_english_collocations.js`；内容质量回归：`validate_fr_quality.js`、`validate_de_en_quality.js`、`validate_it_quality.js`

任何 FAIL / 抛错 / 缺汇总行都让退出码非 0。

测试**不覆盖** `app.js` 的 DOM 行为（`lib/shell.js` 路由由 `test-shell-router.js` 覆盖）；UI 改动需要在浏览器里实测（静态服务器 + headless Chrome 截图亦可）。

---

## 7. 数据资产清单

### 7.1 前端直接消费的数据

所有文件都是构建产物：有构建脚本的不要手改（下次重建会丢失）；没有上游源的冻结产物（§7.2）就地修改，再跑对应的规范化脚本。

#### 词库：`data/vocab/<it|de|en|fr>.js`（一级懒加载）

- 导出：`(globalThis.DIM_VOCAB = globalThis.DIM_VOCAB || {}).<code> = { meta, entries }`，schema v1，字段见 `docs/vocab-schema.md`
- 构建：it = `build_italian_vocabulary_tags.py` + `clean_italian_glosses.py`；de = `build_german_vocabulary.py`（含 HanDeDict 合并）；en = `build_english_vocab.py`（wordfreq 排序 + EnWords / ECDICT 回退）；fr = `build_french_vocabulary.py`（`assemble` 合并 `data/vocab/src/fr-curriculum.js`、`fr-glossary.js` 与词频核心层）
- 校验：`node scripts/validate_vocab.js`；Python 读写 `scripts/vocab_schema.py`，各管线原生形状 → v1 的适配在 `scripts/vocab_legacy.py`；Node 读取 `scripts/vocab_node.js`
- ⚠️ 许可：德语含 HanDeDict（CC-BY-SA 3.0），英语含 ECDICT；README「数据来源与致谢」与 Help 弹窗已署名，见 `ATTRIBUTION.md`

#### 模块数据：`data/<code>-<module>.js`（二级懒加载）

16 个文件，形状由 `docs/data-schema.md`（schema v1）规定，`meta.schema` 为 `<module>/1`，`meta` 里另有 `lang` / `name` / `count` / `builder` / `sources` / `licences`。页面代码一律 `LangLoader.data(lang, module)`（每个文件末尾把载荷注册成 `DIM_DATA.<module>.<code>`，尾巴由 `scripts/data_module.py register_footer` 统一生成，`tests/check-data-modules.js` 检查）。

| 模块 | 文件 | 规模（`meta.count`） | 顶层名（仅给 Node 校验脚本用） |
|---|---|---|---|
| conjugations | `data/{it,de,en,fr}-conjugations.js` | it 1812 / de 1810 / en 1800 / fr 1934 动词 | `CONJUGATIONS_IT` / `_DE` / `_EN` / `_FR` |
| grammar | `data/{it,de,en,fr}-grammar.js` | it 99 / de 105 / en 132 / fr 109 专题 | `GRAMMAR_DATA` / `GERMAN_GRAMMAR_DATA` / `ENGLISH_GRAMMAR_DATA` / `FRENCH_GRAMMAR_DATA` |
| collocations | `data/{it,de,en,fr}-collocations.js` | it 1612 / de 890 / en 875 / fr 1411 动词 | 无 |
| cognates | `data/{it,de,fr}-cognates.js` | it 1586 / de 2349 / fr 4269 | 无 |
| course | `data/de-course.js` | 54 单元（A1–C1） | `GERMAN_COURSE_DATA` |

各模块形状（详见 `docs/data-schema.md`）：

- conjugations/1：`{ meta, persons: [6 人称], tenses: [{ key, group, label, zh, type, time?, … }], verbs: [{ word, rank, freq, zh, en, tenses: { <key>: [6 形式] | "单一形式" }, x? }] }`
- grammar/1：`{ meta: { levels, topicCount, aliases }, tree: { parts: [{ title, slug, chapters: [{ title, slug, topics: [{ title, slug, level }] }] }] }, content: { <slug>: markdown } }`，slug 统一为 `p<N>/ch<NN>/t<NN>`
- collocations/1：`{ meta, keys: [{ key, label, kind, case?, zh? }], verbs: { <word>: { word, display, order, keys: { <key>: [{ text, zh }] } } }, index }`
- cognates/1：`{ meta: { patterns }, entries: [{ word, en, zh, pattern, similarity, difficulty, rank, falseFriend?, … }] }`
- course/1：`{ meta, levels: [{ id, title, units: [{ id, number, title, words: [<vocab word>], grammar: [{ label, slug }] }] }] }`

### 7.2 原始 / 中间数据

- **冻结产物（无上游源，就地修改）**：意大利语语法书（`data/it-grammar.js`，原书 Markdown 已于 2026-09-30 删除，用 `canonicalize_grammar.py it` 规范化）、意大利语搭配（`data/it-collocations.js`，用 `canonical_collocations.py it`）、意大利语变位（`data/it-conjugations.js`，用 `canonical_conjugations.py it`）、德语语法书（`data/de-grammar.js`，旧 Docusaurus 语料 `deutsch-data/grammar/docs/` 无许可证、已删除，用 `canonicalize_grammar.py de` 规范化）
- **德语词库**：`deutsch-data/vocab/`（pgh.csv + `handedict-de-slice.csv`）
- **英语**：` english-data/english word/`（⚠️ 目录名前有空格；EnWords.csv + `ecdict-slice.csv`）；`data/vocab/src/en-lexicon.tsv`；`scripts/english_grammar_src/*.md`（原创语法源）、`scripts/english_collocations_source/*.txt`
- **法语 / 德语搭配源**：`scripts/sources/french-collocations/`、`scripts/sources/german-rektion/`
- **法语词库教材层**：`data/vocab/src/fr-curriculum.js`、`fr-glossary.js`
- 单词本模板：`custom_wordbook_template.json`、`custom_wordbook_template.txt`、`docs/TXT_FORMAT_GUIDE.md`

---

## 8. 构建脚本与数据生成流程

所有 Python 构建脚本直接写出 `data/**/*.js`；改完跑对应校验器，再跑 `npm test`。

### 8.1 词库（schema v1）

| 脚本 | 输出 | 说明 |
|---|---|---|
| `build_italian_vocabulary_tags.py` | 就地更新 `data/vocab/it.js` | 标注词性 / 性别 / CEFR |
| `clean_italian_glosses.py` | 就地更新 `data/vocab/it.js` | 清洗机翻重复释义 |
| `build_german_vocabulary.py` | `data/vocab/de.js` | 分阶段构建（`DE_VOCAB_STAGES=lexicon,freq,goethe,handedict,assemble`，默认全部）；合并 pgh.csv / HanDeDict / ECDICT 中转释义；读 `data/de-course.js` 保留课程词 |
| `build_english_vocab.py` | `data/vocab/en.js` | wordfreq 排序；EnWords 缺词时 ECDICT 回退（`ECDICT_FULL=...`） |
| `build_french_vocabulary_glossary.py` | `data/vocab/src/fr-glossary.js` | 法语教材词汇表层（A1–B2 权威层） |
| `build_french_vocabulary.py` | `data/vocab/fr.js` | `assemble` 合并三层 |
| `vocab_schema.py` / `vocab_legacy.py` / `vocab_node.js` | — | 共享读写 / 适配 / Node 加载 |
| `validate_vocab.js` | — | 四语言统一校验，语言专属规则为 per-language hook |

### 8.1a 校订层（重建不丢）

数据审校的结果不直接改产物，而是写成「修正清单 + 幂等应用」，构建器 / 规范化脚本最后一步自动重放，所以重建不会把审过的错误带回来。记录都带旧值（`from`）；当前值既不是 `from` 也不是 `to` 时报 stale，需对照新上游手查。

| 清单 | 应用脚本 | 挂在 |
|---|---|---|
| `scripts/conjugation_fixes/<code>.json` | `canonical_conjugations.apply_fixes`（单元格、`x.*`、动词 `zh` / `en`） | 四种语言的 `canonicalize()` |
| `scripts/it_fixes/{vocab,grammar,cognates,collocations}.json`、`it_fixes/grammar/*.md` | `italian_fixes.py`（`--check`） | `clean_italian_glosses.py`、`canonicalize_grammar.py`、`canonical_cognates.py`、`canonical_collocations.py` |
| `scripts/vocab_fixes/fr.json`（字段修正 / `add` / `drop` 屈折形式并入词元）、`collocation_fixes/fr.json` | `fr_vocab_fixes.py`（`check`）、`fr_collocation_fixes.py` | `build_french_vocabulary.py assemble`、`build_french_extras.py` |
| `scripts/de_vocab_fixes/*.json`、`de_cognate_fixes.json`、`de_course_fixes.json` | `de_vocab_fixes.py`、`de_cognate_fixes.py`、`de_course_fixes.py` | `build_german_vocabulary.py`、`build_german_extras.py` |
| `scripts/en_vocab_fixes/*.json`（含 `additions.json`：搭配模块要用、频率截断漏掉的动词） | `en_vocab_fixes.py`（`--regen` 用 lemminflect 重算清单） | `build_english_vocab.py` |

英语屈折词并入词元后，旧词形全部记在词元的 `legacyWord`（可为数组），旧进度经 `Vocab.resolveLegacyKey` 迁到词元。删掉的词条（专名、垃圾词）进度留在存储里但不计入「已掌握」（`Progress.systemMasteredCount` 只数词库里还在的词）。

意大利语 `en` 释义句首大写由 `clean_italian_glosses.normalise_en_case` 归一（英语词库里是小写词头才改；月份、民族词、China / Turkey 这类同形词保留），`italian_fixes` 比较 `en` 修正记录时用同一归一形式。

### 8.2 变位

各语言构建脚本写出旧的按动词 `forms` 形状后，末尾调用 `canonical_conjugations.canonicalize(<code>)` 转成 conjugations/1；`canonical_conjugations.py [codes]` 也可单独对已发布文件幂等地重跑。语言校验器经 `scripts/conjugations_node.js`（`loadConjugations` / `toLegacy`）读数据。

| 脚本 | 输出 | 校验 |
|---|---|---|
| `canonical_conjugations.py it` | 就地规范化 `data/it-conjugations.js`（冻结产物） | `validate_modules.js` |
| `build_german_conjugations.py` | `data/de-conjugations.js` | `validate_german_conjugations.js` |
| `build_english_conjugations.py` | `data/en-conjugations.js` | `validate_english_conjugations.js` |
| `build_french_conjugations.py` | `data/fr-conjugations.js` | `validate_french_conjugations.js` |

### 8.3 语法书

`grammar_schema.py` 是共享写出器（`canonicalize` + `write`：位置式 slug、旧 slug 进 `meta.aliases`、每个专题带 level）。

| 脚本 | 输入 | 输出 | 校验 |
|---|---|---|---|
| `canonicalize_grammar.py [codes]` | 已发布的数据文件 | 就地规范化；是 it / de 的「构建器」（意大利语 level 按标题启发式赋值，标 `meta.levelSource = "heuristic"`，已有 level 保留） | `validate_german_grammar.js`（de） |
| `build_english_grammar.py` | `scripts/english_grammar_src/p<P>-ch<NN>-<name>.md` | `data/en-grammar.js` | `validate_english_grammar.js` |
| `build_french_grammar.py` | 脚本内原创内容 | `data/fr-grammar.js` | `validate_french_grammar.js` |

英语语法源格式：文件头 `<!-- part: ... / chapter: ... -->`，每个专题以 `=== tNN-slug | LEVEL` 开头、紧跟 `# N．标题`；文件名顺序即阅读顺序。`validate_english_grammar.js` 支持 `--only p1-ch01 --out /tmp/x.js` + `--file /tmp/x.js --partial` 只校验部分章节。**源文本必须原创**，不得摘抄受版权保护的语法书。

### 8.4 搭配 / 同源词 / 课程（extras）

共享写出器：`canonical_collocations.py`（`write_collocations`；`--scan` 报告连写词）、`canonical_cognates.py`（`emit`；`--check` 检查是否已规范）、`course_schema.py`（course/1）。所有模块再由 `validate_modules.js` 按 schema 统一校验（`CHECKS` 注册表：grammar / course / conjugations / collocations / cognates，同源词另有 `validate_cognates_hooks.js`；CLI `node scripts/validate_modules.js [module] [langs]`）。

| 脚本 | 输出 | 校验 |
|---|---|---|
| `build_german_extras.py` | `data/de-collocations.js`、`data/de-cognates.js`、`data/de-course.js` | `validate_german_extras.js` |
| `build_french_extras.py` | `data/fr-collocations.js`、`data/fr-cognates.js` | `validate_french_extras.js` |
| `build_english_collocations.py` | `data/en-collocations.js` | `validate_english_collocations.js` |
| `cognate_extractor.js <输出路径>` | 从 `data/vocab/it.js` 提取意大利语同源词（只作对照；写回 `data/it-cognates.js` 需 `--force`，会覆盖人工校订） | `validate_modules.js` |
| `canonical_collocations.py it` | 就地规范化 `data/it-collocations.js`（冻结产物） | `validate_modules.js` |

注意：`build_german_vocabulary.py` 只读 `data/de-course.js`，课程单元词保证留在德语词库里；`validate_modules.js` 检查每个 `unit.words` 都是词库 `word`、每个语法 slug 都在语法树里。

---

## 9. 修改任务到文件的映射

### 9.1 顶部导航 / 屏幕 / 路由 / 面包屑

- `lib/shell.js`（`SCREENS`、`DimRouter`）
- `index.html`（topbar、`section.screen`）
- `app.js`（`bind()` 委托、`RENDERERS`、`registerOpener`）

### 9.2 首页 / 词汇页 / 语法页 / 进度页 / 设置页内容

- `app.js` 对应 `render*` 函数；模块卡片在 `moduleCards` / `modeCard`
- 样式在 `styles.css` 第 4（section band / card 原语）、5、7 节；动效在 `lib/editorial.js`

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
2. `lib/languages.js` 加一条档案：`code` / `key` / `cn` / `tts` / `spell` / `accents` / `files`。路由、加载清单、存储 key（`DimStorage.key`）、重置菜单、加载文案全部自动派生
3. `.lang-switch` 按钮由 `app.js renderLangSwitch()` 生成（`index.html` 里的静态按钮只是首帧占位，可顺手补上）
4. 要带哪个模块，就按 `docs/data-schema.md` 产出 `data/<code>-<module>.js`（文件末尾用 `register_footer` 注册）并在 `files` 里列出；功能模块没有按语言的 config，人称 / 时态 / 搭配键 / 同源词规律都从数据 `meta` 读，代码不用改。变位数据的语言布局写在 `scripts/canonical_conjugations.py` 的 `LANGS` 里

### 9.6 个人单词本 / 社区词书

- `lib/wordbooks.js`、`app.js`（词汇页 `[data-wb]` 处理）、`index.html`（三个 wordbook modal）
- 社区：`community-wordbooks.js`、`supabase-config.js`、`supabase-*.sql`、`docs/SUPABASE_TROUBLESHOOTING.md`

### 9.7 动词变位

`conjugation-app.js`（数据驱动）+ `scripts/canonical_conjugations.py`（每种语言的人称 / 时态布局）+ `index.html`（`conjugationSetupScreen` / `conjugationScreen`）+ 数据与脚本（§7.1、§8.2）。

### 9.8 语法书

`grammar-book.js` + `app.js openGrammarBook` + 语法数据与脚本（§8.3，`grammar_schema.py`）。

### 9.9 动词搭配

`verb-collocations.js` + `verb-collocations-practice.js` + `index.html` + 数据与脚本（§8.4）。

### 9.10 同源词 / 打字游戏 / 课程路线

- `cognate-app.js`
- `typing-game-app.js` + `lib/typing-game.js`
- `course.js` + `index.html`（`#courseScreen`）+ `data/de-course.js` + `build_german_extras.py`（`course_schema.py`）

### 9.11 统计 / 图表 / SRS

`lib/srs.js`、`stats-charts.js`（`StatsCharts.sectionsHtml` / `mount`）、`app.js renderProgress`、`lib/practice-flow.js recordTelemetry`。

### 9.12 LocalStorage 结构 / 导入导出 / 重置 / 旧数据迁移

`lib/storage.js`（`DimStorage` / `Prefs` / `LegacyMigration`）+ `app.js`（`exportAllData` / `importAllData` / `resetProgress`）+ `tests/test-storage.js`；迁移改键依赖 `lib/vocab.js resolveLegacyKey`。

### 9.13 样式 / 主题

`styles.css`（tokens 第 1 节）；主题切换在 `app.js applyTheme` 与 `index.html` 首帧脚本；滚动 / 入场动效在 `lib/editorial.js`。

### 9.14 加载 / 懒加载 / 启动

`lib/lang-loader.js`、`lib/boot.js`、`index.html`（`__ReadyGate`、`CdnFallback.load`）。

---

## 10. LocalStorage 约定

所有 key 以 `dimenticato_` 开头；`DimStorage.allKeys()` 以此前缀枚举，导出（`snapshot`）包含全部这类 key。布局版本 v3（`dimenticato_storage_version = '3'`）。

### 10.1 全局 key（重置时保留，`DimStorage.PRESERVED_KEYS`）

- `dimenticato_theme`（`light` / `dark`）
- `dimenticato_language`（`italian` / `german` / `english` / `french`）
- `dimenticato_quiz_difficulty`、`dimenticato_quiz_direction`（全局默认，每语言值优先）
- `dimenticato_custom_wordbooks`（单词本内容）
- `dimenticato_storage_version`

### 10.2 每语言 key：`dimenticato_<code>_<name>`（`DimStorage.key`）

| name | 用途 | 重置 |
|---|---|---|
| `prefs` | `Prefs` `{ level, session, filter, source }` | 保留（`PRESERVED_NAMES`） |
| `quiz_difficulty` / `quiz_direction` | 该语言的难度 / 方向 | 保留（`PRESERVED_NAMES`） |
| `mastered` | 系统词库已掌握 | 删除（`PROGRESS_NAMES`） |
| `stats` | 选择题 / 拼写计数 | 删除 |
| `daily_stats` | 每日统计 | 删除 |
| `srs` | SM-2 | 删除 |
| `mastery_streak` | 连续答对 | 删除 |
| `wb_<id>` | 单词本已掌握 | 删除 |

`keysForScope(scope)` 删除该语言下除 `PRESERVED_NAMES` 外的所有 `dimenticato_<code>_*`，外加尚未迁移的旧布局 key 与下面的模块 key。

### 10.3 功能模块 key（模块自己读写，按语言重置时由 `LegacyMigration.moduleKeyLanguage` 识别）

- 变位课次：`dimenticato_conjugation_lessons_<code>`
- 同源词进度：`dimenticato_cognate_progress_<code>`
- 课程等级：`dimenticato_course_level_<code>`
- 语法书阅读位置：`dimenticato_grammar_topic_<code>`
- 打字游戏最高分：`dimenticato_typing_best_<langkey>_<mode>`（语言 key，如 `italian`）

### 10.4 旧 key（由迁移并入后删除）

- 核心数据（`LegacyMigration.migrateStorage`）：意大利语无前缀的 `dimenticato_mastered` / `_stats` / `_daily_stats`；`dimenticato_<german>_mastered|stats`；`dimenticato_daily_stats_<lang>`、`dimenticato_srs_<lang>`、`dimenticato_mastery_streak_<lang>`、`dimenticato_quiz_{difficulty,direction}_<lang>`；`dimenticato_progress_wb_<lang>_<id>` 与更早的 `dimenticato_progress_wb_<id>`；`dimenticato_german_sr` / `english_sr` / `french_srs`；`dimenticato_french_daily`；合一的 `dimenticato_prefs`
- 模块 key（各模块首次加载时迁移）：意大利语无后缀的 `dimenticato_conjugation_lessons` / `dimenticato_cognate_progress`、`dimenticato_cognate_progress_<key>`、`dimenticato_german_course_level`
- `dimenticato_level` 只出现在导出的 1.0 兼容层

### 10.5 修改注意

- 改任何 key 都要检查：旧数据兼容（`LegacyMigration.targetFor` / 模块自己的迁移）、`exportAll` / `importAll` / `mergeValueForKey`、`PROGRESS_NAMES` / `PRESERVED_NAMES` / `PRESERVED_KEYS`、`tests/test-storage.js`
- 新的每语言数据优先用 `DimStorage.key(lang, name)`，重置与导出自动覆盖
- 进度键一律是 `entry.word`；如果词库重建改了 `word`，需要保证 `resolveLegacyKey` 能映射（`legacyId` 字段或词形匹配）
- 延迟写盘的一致性契约：切来源 / 切语言 / 导出 / 导入 / 重置前必须先 flush（`Progress.flush()` / `DimenticatoUtils.flushAllPersisters()`），否则挂起写会落错 key 或覆盖刚导入的数据

---

## 11. 隐性依赖与容易踩坑的地方

### 11.1 `CODE` 注入顺序是承重的

`lib/storage.js` 早于 `lib/srs.js` / `lib/wordbooks.js`；`lib/shell.js` 早于所有功能模块（它们在 init 时调 `showScreen` / `ScreenTree.register`）；`app.js` 必须在所有功能模块之后（`init` 引用所有模块、注册 opener），只有不被依赖的 `lib/editorial.js` 排在它后面。改顺序只在 `lib/lang-loader.js CODE` 里改，`index.html` 里不要再加 `<script>`。

### 11.2 初始化时机

模块既有「`document.readyState === 'loading'` 就等 `DOMContentLoaded`」的写法，也有裸 `DOMContentLoaded` 监听；两者都依赖 `__ReadyGate` + 合成 `DOMContentLoaded`。**不要**在 `LangLoader.boot()` 之外再派发 `DOMContentLoaded`，也不要让模块在解析期访问词库或 DOM。

### 11.3 模块数据只经 `LangLoader.data` 取

`GRAMMAR_DATA`、`CONJUGATIONS_IT` 等顶层 `const` 仍在部分文件里（Node 校验脚本按名字读），但页面代码不要再用裸名字：一律 `LangLoader.data(lang, module)`，它读 `DIM_DATA.<module>.<code>`，`lang` 接受 code 或旧 key。新增 / 重建数据文件忘了注册尾巴时 `tests/check-data-modules.js` 会失败。`DIM_VOCAB` 挂在 `globalThis` 上。

### 11.4 DOM ID 强绑定

静态模块屏（quiz / spell / browse / typing / cognate / community / conjugation / collocations / grammarBook）里的 id 都被 JS 直接 `getElementById`。统一屏幕的内容则是 `app.js` 每次重新渲染，改它们的结构只改 `app.js`。

### 11.5 语言清单只在 `lib/languages.js`

见 §9.5。所有核心库都从 `Languages` 派生语言列表；它以静态 `<script defer>` 在 lang-loader 之前执行，必须保持零依赖。测试 harness（`tests/test-*.html`、`test-storage.js`）要先加载它。存储 v3 起意大利语与其他语言一样用 `dimenticato_it_*`；`Languages.DEFAULT_KEY` 只在迁移旧的无后缀 key 时用来认出它们属于意大利语。

### 11.6 返回逻辑按屏幕树，不按历史

`goBack()` 回 `SCREENS[current].parent`。新增二级屏要么在 `SCREENS` 里登记 parent，要么模块自己调 `goBack({ fallbackTarget })`；`ScreenTree.register` 登记的新屏父级固定为 `homeScreen`（目前无人调用）。浏览器后退键走 `popstate` → `DimRouter.onHistoryChange`。

### 11.7 transient 屏刷新落回父级

`quizScreen` / `spellScreen` / `conjugationScreen` / `verbCollocationPracticeScreen` 没有独立地址，深链接或刷新会回父级（会话不可恢复）。

### 11.8 重置进度要覆盖模块自己的 key

§10.3 的模块 key 不是 `dimenticato_<code>_*` 形式，`DimStorage.keysForScope` 靠 `LegacyMigration.moduleKeyLanguage` 的命名规则（以 `_<code>` / `_<key>` 结尾，或打字游戏的 `typing_best_<lang>_`）认出它们。新模块若自带进度 key，最好直接用 `DimStorage.key(lang, name)`；否则要保证命名能被这条规则识别，不然按语言重置会残留。

### 11.9 旧注释

`lib/practice-flow.js`、`tests/test-french-data.js` 等的注释里仍出现 `german-app.js` / `french-app.js` 等旧文件名，`lib/lang-loader.js` 注释里的文件体积也是旧数字，`app.js` 注释里的 `dimenticato_prefs` 是 v3 前的名字；以代码为准。

### 11.10 社区功能依赖远程服务

Supabase key 失效、bucket 或表结构不匹配时，社区上传 / 浏览 / 下载失败，本地学习不受影响。

### 11.11 预编译数据模式

前端从不 fetch Markdown / CSV；改内容后必须重跑对应构建脚本与校验器。多个 worktree 并行改动时，生成数据与其输入可能各自合并而不冲突却互相失配（语法 slug、课程单元词），`validate_modules.js` 等校验器是唯一防线。

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

### 2026-10-08 — 变位审校 + 全项目修复（fix/conjugations）

- **变位**：四语言审校，修正清单 `scripts/conjugation_fixes/<code>.json`（it 661 格、de 约 800、fr 约 780、en 50），`canonical_conjugations.py` 每次重放
- **数据**：意大利语前 4000 词释义逐条复核（抽样错误率 27.5% → 0），语法书拆出被粘连的专题、动词变位附录移到 p3、补齐编号；法语英语跳板同形词释义 2454 条；德语多性名词 725 → 103（余下为真双性）、pgh 义项编号残留、课程级别；英语屈折词头并入词元、去专名、ECDICT 长释义裁剪（24000 → 14766 词）。各自的修正清单见 §8.1a，质量校验器 `validate_{it,fr,de_en}_quality.js`
- **代码**：路由导航令牌 / 未知 slug 改写；迁移前冲刷进度、迁移后丢 SRS 缓存；社区词书非 ASCII 文件名、大小写扩展名、搜索防抖与转义；删除 `ReviewSession`、`WordbookManager`、`ScreenTree.screenOf` 等死接口
- **体验**：`Vocab.gradeTyped` 统一判分（只差重音 = 「字母对了，重音不对」，德语变音 ae/oe/ue/ss 等价）；Google Fonts 不阻塞首屏；真实加载进度与失败重试；移动端输入属性与重音键盘；无障碍（aria-live、折叠面板 inert、aria-pressed / aria-expanded）；对比度；按语言的标签（`Languages.text`）；`sw.js` 离线缓存
- **清理**：删除 `data/it50k-verb-lemmas.json`、`scripts/build_german_grammar.py`、英语数据目录里的预览图；`vocab_legacy.py` 去掉 `migrate` 子命令
- 测试：29 个 harness
- 收尾：意大利语英文释义句首大写归一（2769 条）、1623 个搭配动词全部有中文释义（搭配页标题下显示）、102 个动词错误释义；英语补 59 个搭配动词、去掉校验器里为 is/ate/York/Luke/Jerry 开的特例；法语 `pars` 并入 `partir`；「已掌握」只数词库里还在的词；旧分支 `content/de-grammar-partial` 归档为 tag `archive/de-grammar-partial`（内容已被现行 105 专题语法书取代）

### 2026-10 — 统一模块数据 + 存储 v3 + 编辑风改版（refactor/unify）

- **模块数据 schema v1**（`docs/data-schema.md`）：16 个模块文件改名为 `data/<code>-<module>.js`，统一 conjugations/1、grammar/1、collocations/1、cognates/1、course/1；新增共享写出器 `canonical_conjugations.py`、`canonical_collocations.py`、`canonical_cognates.py`、`grammar_schema.py`、`canonicalize_grammar.py`、`course_schema.py` 与统一校验器 `validate_modules.js`（接入 `npm test`，`validate_german_conjugations.js` 也已接入）；功能模块去掉按语言的 config 表
- **删除**：`german-course.js`（由数据驱动的 `course.js` + 静态 `#courseScreen` 取代）、`data/german-course-data.js`、`data/*-collocations-data.js`、`data/verb-collocations-data.js`、`data/conjugations-*.js` 等旧文件名与旧全局名、`scripts/validate_italian_extras.js`、`scripts/fix_italian_conjugations.py`、`enhancedStatsModal`、`shell.js` 的旧屏幕 id 折叠
- **存储 v3**：每语言 key 统一为 `dimenticato_<code>_<name>`，`LegacyMigration.migrateStorage` 一次性改名；模块 key 改为 `_<code>` 后缀
- **路由**：语法书专题深链 `#/<code>/grammar/book/<slug>`（`param` 屏）
- **CDN 按需加载**：去掉三个 CDN `<script>`，改为 `CdnFallback.load(name)`
- **编辑风改版**：首页 hero + 单词卡堆、等级 / 模块卡片、section band；词汇 / 语法 / 进度三个 hub 改版，进度页内嵌图表；新增 `lib/editorial.js`；`Speaker` / `shuffleArray` 移到 `lib/utils.js`
- 测试：`tests/run-headless.js` 22 个 harness（新增 `test-conjugation-app.js`）

### 2026-09-30 — 统一运行时（feat/unified-runtime）

- **删除**：`app-enhanced.js`（补丁层）、`german-app.js`（GermanApp + EnglishApp）、`french-app.js`、`lib/navigation.js`、`lib/router.js`、`scripts/validate_index_counts.js`；`AppState`、按语言分屏的 `<lang>WelcomeScreen` / `<lang>VocabularyScreen` 等全部消失
- **新增**：`lib/languages.js`（语言档案）、`lib/vocab.js`（schema v1 词库 API）、`lib/storage.js`（DimStorage / Prefs / LegacyMigration，从旧 app.js 抽出）、`lib/srs.js`（SpacedRepetition / StatsManager，从 app-enhanced 抽出并修 interval 溢出）、`lib/wordbooks.js`（单词本 + 编辑器）、`lib/shell.js`（屏幕树 + hash 路由 `#/<code>/<slug>`）
- **重写**：`app.js` 为单个 IIFE（`window.App`），四语言共用首页 / 词汇 / 浏览 / 语法 / 进度 / 设置与选择题 / 拼写会话；模块入口按语言档案 `modules` 显示
- **重写**：`index.html`（topbar 导航 + 语言切换 + 主题、面包屑、统一屏幕）与 `styles.css`（paper/ink 设计系统）
- 功能模块改为开放 API：`ConjugationPractice.openFor`、`VerbCollocations.open`、`VerbCollocationPractice.open`、`CognateApp.open`、`TypingGameApp.open`、课程路线 `open`、`GrammarBook.init(null, { lang })`
- 德 / 英 / 法旧 SRS 与法语旧每日记录由 `LegacyMigration` 并入统一 key，进度键统一为 `entry.word`
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
- **改 SM-2 / 每日统计** → `lib/srs.js`；进度页图表 → `stats-charts.js`
- **改单词本** → `lib/wordbooks.js`；社区 → `community-wordbooks.js` + `supabase-config.js`
- **改动词变位** → `conjugation-app.js` + `scripts/canonical_conjugations.py`
- **改语法书** → `grammar-book.js`
- **改动词搭配** → `verb-collocations.js` + `verb-collocations-practice.js`
- **改同源词 / 打字游戏 / 课程路线** → `cognate-app.js` / `typing-game-app.js` + `lib/typing-game.js` / `course.js`
- **改样式 / 主题 / 动效** → `styles.css` + `lib/editorial.js`
- **改词库数据** → `data/vocab/<code>.js` 的构建脚本（§8.1）+ `node scripts/validate_vocab.js`
- **改模块数据** → `docs/data-schema.md` + §8 的构建 / 规范化脚本 + `node scripts/validate_modules.js`
- **跑测试** → `npm test`（`node tests/run-headless.js [filter]`）
