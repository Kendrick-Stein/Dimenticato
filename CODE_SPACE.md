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

**Dimenticato** 是一个以意大利语学习为核心的纯静态网页应用，主要服务于以下学习场景：

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

---

## 2. 运行模型总览

### 2.1 启动流程

浏览器打开 `index.html` 后：

1. 加载页面 DOM
2. 顺序加载脚本：
   - `vocabulary.js`
   - `data/conjugations-all-tenses.js`
   - `data/conjugations-presente.js`
   - `supabase-config.js`
   - `community-wordbooks.js`
   - `app.js`
   - `app-enhanced.js`
   - `conjugation-app.js`
   - `stats-charts.js`
   - `data/grammar-data.js`
   - `grammar-book.js`
   - `data/verb-collocations-data.js`
   - `verb-collocations.js`
   - `verb-collocations-practice.js`
3. `app.js` 在 `DOMContentLoaded` 时执行：
   - `bindEvents()`
   - `loadVocabulary()`
   - 初始化导航与学习上下文
   - 渲染自定义词本卡片
4. 其他子模块也在 `DOMContentLoaded` 或按钮点击时初始化

### 2.2 架构分层

可以把项目理解为 4 层：

1. **页面层**：`index.html`
2. **主状态与主导航层**：`app.js`
3. **功能模块层**：
   - `app-enhanced.js`
   - `community-wordbooks.js`
   - `conjugation-app.js`
   - `grammar-book.js`
   - `verb-collocations.js`
   - `stats-charts.js`
4. **数据层**：
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

- 整个应用的 DOM 结构
- 所有 screen / modal / dialog 的定义
- 所有脚本加载顺序
- 顶部导航、侧边栏、帮助、统计、社区上传等 UI 骨架

当你要改：

- 页面布局
- 增加新 screen
- 按钮/输入框/模态框
- DOM ID
- 外部 CDN 依赖

先读它。

#### `styles.css`
负责所有 UI 样式。

当你要改：

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
- `AppState` 全局状态
- `Storage` 本地存储
- 系统词汇加载 `loadVocabulary()`
- screen 切换 `showScreen()`
- 顶部统计 / breadcrumb / nav 更新
- 选择题模式 `MultipleChoice`
- 拼写模式 `Spelling`
- 浏览模式 `Browse`
- 自定义词本基础管理 `WordbookManager`
- 数据导入导出 / 重置 / 主题切换
- 全局事件绑定 `bindEvents()`

#### 修改建议

如果你要改以下内容，优先看 `app.js`：

- 顶部导航和 screen 切换
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

### 6.2 `app-enhanced.js` — 增强层 / Patch 层

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

### 6.3 `community-wordbooks.js` — 社区词本

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

### 6.4 `conjugation-app.js` — 动词变位练习模块

这是一个相对独立的子系统。

负责：

- 变位数据准备
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

- 变位题型
- 时态分组方式
- lesson 切课规则
- 课次完成进度
- 答案校验

主要看 `conjugation-app.js`。

---

### 6.5 `grammar-book.js` — 语法书阅读器

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

### 6.6 `verb-collocations.js` — 动词搭配阅读器

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

### 6.6.1 `verb-collocations-practice.js` — 动词搭配练习模块

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

### 6.7 `stats-charts.js` — 图表统计模块

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

### 6.8 `supabase-config.js` — Supabase 配置

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

## 9. 修改任务到文件的映射

这一节是以后让 AI 快速定位文件的核心。

### 9.1 改首页、导航、screen 切换

先看：

- `index.html`
- `app.js`

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

### 10.2 动态 key

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

---

## 16. 快速索引（超简版）

如果只是想快速定位文件，可直接看这里：

- **改页面结构** → `index.html`
- **改主学习流程** → `app.js`
- **改词本编辑 / SM-2 / 增强浏览** → `app-enhanced.js`
- **改社区词本** → `community-wordbooks.js` + `supabase-config.js`
- **改动词变位** → `conjugation-app.js`
- **改语法书** → `grammar-book.js` + `data/grammar-data.js`
- **改动词搭配** → `verb-collocations.js` + `data/verb-collocations-data.js`
- **改动词搭配练习** → `verb-collocations-practice.js` + `data/verb-collocations-data.js`
- **改统计图表** → `stats-charts.js`
- **改语法书构建** → `scripts/parse_grammar.py` + `scripts/build_grammar_data.py`
- **改搭配数据构建** → `scripts/parse_verb_collocations.py`
- **改变位数据构建** → `scripts/reverso_presente_pipeline.py`
