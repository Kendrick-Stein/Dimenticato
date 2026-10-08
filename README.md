# 🌍 Dimenticato - 背单词

一个纯静态的多语言词汇学习网页应用（GitHub Pages，无构建步骤），学习记录只保存在本地浏览器。

意大利语 🇮🇹 · 德语 🇩🇪 · 英语 🇬🇧 · 法语 🇫🇷 —— **四门语言共用同一个入口、同一套页面和练习方式**，词库和模块数据也各是同一种格式（schema v1，见 [docs/vocab-schema.md](docs/vocab-schema.md) 与 [docs/data-schema.md](docs/data-schema.md)）。新增一门语言只需要一份 `data/vocab/<code>.js` 加一条语言档案（`lib/languages.js`）；要带哪个模块，就再按 schema 提供对应的 `data/<code>-<module>.js`。

| 语言 | 系统词库 | 分级 |
|---|---|---|
| 意大利语 | 27,117 词 | CEFR A1–C2 |
| 德语 | 24,314 词 | CEFR A1–C2 |
| 英语 | 24,000 词 | CEFR A1–C2 |
| 法语 | 24,536 词 | CEFR A1–C2 |

---

## ✨ 功能概览

顶栏五个入口：**首页 / 词汇 / 语法 / 进度 / 设置**，右侧切换语言（IT / DE / EN / FR）和深浅色。每个页面都有可分享的地址，例如 `#/de/vocab/browse`。

### 首页
今日一词（单词卡）、词汇量 / 已掌握 / 待复习 / 连续学习天数，按 CEFR 等级进入练习，当前语言可用的模块入口，以及三步使用说明。

### 词汇
- **练习范围**：系统词库的某个等级、或自己的单词本；可筛选「未掌握 / 到期复习」，每组 20 / 50 / 100 / 全部
- **练习方式**：选择题（可切换难度与方向）、拼写（重音宽容判分、特殊字母键盘）、浏览（搜索、等级 / 掌握度筛选、标记已掌握、加入单词本）、打字游戏、同源词（意 / 德 / 法）
- **复习**：答过的词按 SM-2 安排复习，到期的词排在每组最前
- **单词本**：新建、导入 TXT / JSON、编辑、导出；社区词书可浏览、预览、下载和上传

### 语法
语法书（按章节查阅，每个专题都有可分享地址，如 `#/de/grammar/book/p1/ch01/t01`）、动词变位（查询 + 按课练习）、动词搭配（浏览 + 练习）、课程路线（目前只有德语：A1–C1 共 54 单元）。模块数据在打开时才下载。

### 进度 / 设置
按语言统计的概览、各等级掌握度、到期复习入口，以及直接嵌在页面里的趋势图表与最近 7 天学习记录；设置页有练习偏好、外观、全部数据的导出 / 导入（合并或覆盖）/ 按语言重置。

---

## 📄 TXT 词本格式

TXT 是最简单的自定义词本方式。

### 基本规则

1. 每个单词一段，段与段之间空一行
2. 每段按行数解析：
   - **1 行**：只写单词，自动在系统词库里查释义
   - **2 行**：单词 / 释义（中文或英文都行）
   - **3–4 行**：单词 / 英文释义 / 中文释义 /（可选）笔记
3. 在哪门语言下导入，就是哪门语言的单词本（德语名词可带冠词，如 `der Hund`）

### 示例

```txt
ciao
hello, hi, bye
你好，再见
非正式场合使用，既可以表示问候也可以表示告别

grazie
thank you
谢谢
grazie mille = 非常感谢
```

详细说明请查看 [docs/TXT_FORMAT_GUIDE.md](docs/TXT_FORMAT_GUIDE.md)

---

## 🚀 使用方法

### 直接打开

1. 下载或克隆本项目
2. 双击打开 `index.html`
3. 开始学习

无需安装依赖，无需运行后端。

### 本地服务器（可选）

```bash
python3 -m http.server 8080
```

然后打开：

```text
http://localhost:8080
```

---

## 📁 项目结构

```text
Dimenticato/
├── index.html                 ← 唯一入口：顶栏、各 screen、弹窗
├── styles.css                 ← 全站样式（设计 token 在 :root / [data-theme="dark"]）
├── app.js                     ← 统一运行时：首页 / 词汇 / 练习 / 浏览 / 进度 / 设置
├── lib/
│   ├── boot.js · lang-loader.js   ← 启动与按需加载（词库、模块数据）
│   ├── languages.js               ← 语言档案（名称、TTS、可用模块）
│   ├── vocab.js                   ← schema v1 词库 API
│   ├── shell.js                   ← screen 注册、面包屑、hash 路由
│   ├── storage.js · srs.js        ← 本地存储 / 导入导出 / SM-2
│   ├── wordbooks.js               ← 单词本（TXT / JSON 解析与进度）
│   ├── quiz-engine.js · practice-flow.js · word-similarity.js
│   ├── typing-game.js · utils.js
│   └── editorial.js               ← 滚动显现、数字递增等页面动效
├── conjugation-app.js · grammar-book.js · verb-collocations*.js
├── cognate-app.js · typing-game-app.js · course.js
├── community-wordbooks.js · stats-charts.js
├── data/
│   ├── vocab/<it|de|en|fr>.js  ← 四语言统一词表 schema v1
│   └── <code>-<module>.js      ← 变位 / 语法 / 搭配 / 同源词 / 课程（模块 schema v1）
├── docs/                       ← vocab-schema.md · data-schema.md
├── scripts/                    ← 数据构建与校验
├── tests/                      ← node tests/run-headless.js
├── CODE_SPACE.md               ← 开发者代码地图
└── README.md
```

---

## 🛠️ 技术栈

- HTML5 + CSS3 + 原生 JavaScript
- LocalStorage
- Chart.js（进度页图表）、marked.js（语法书）、Supabase（仅社区词本功能需要）：都在用到时才从 CDN 加载（带 SRI 校验）

---

## 🔧 数据与脚本

所有 `data/**/*.js` 都是构建产物，改完跑对应校验器，再跑 `npm test`。完整的脚本与数据对照见 [CODE_SPACE.md](CODE_SPACE.md) §7–§8。

### 意大利语 / 德语语法、意大利语变位与搭配

这几份数据已没有上游源文件，是就地维护的冻结产物，改完用规范化脚本整理：

```bash
python3 scripts/canonicalize_grammar.py it de      # 语法书 → grammar/1
python3 scripts/canonical_conjugations.py it       # 变位 → conjugations/1
python3 scripts/canonical_collocations.py it       # 搭配 → collocations/1
```

### German 变位 / 搭配 / 同源词 / 课程数据构建

```bash
python3 scripts/build_german_conjugations.py
python3 scripts/build_german_extras.py    # data/de-collocations.js · de-cognates.js · de-course.js
```

### English 词汇数据构建

```bash
python3 scripts/build_english_vocab.py
```

### English 语法数据构建

```bash
python3 scripts/build_english_grammar.py
```

### French 教材总词汇表数据构建

```bash
python3 scripts/build_french_vocabulary_glossary.py REVIEWED_OCR.json data/vocab/src/fr-glossary.js
python3 scripts/build_french_vocabulary.py assemble   # 合并三层 -> data/vocab/fr.js
```

### 校验与测试

```bash
node scripts/validate_vocab.js     # 四语言词表 schema v1 + 各语言专属规则
node scripts/validate_modules.js   # 全部模块数据对照 docs/data-schema.md
node scripts/validate_it_quality.js # 内容质量回归（另有 validate_fr_quality / validate_de_en_quality）
npm test                           # 无头测试 + 全部校验器（CI 同此）
```

审校过的修正不直接改产物，而是记在 `scripts/conjugation_fixes/`、`scripts/it_fixes/`、`scripts/vocab_fixes/` 等清单里，由各构建器最后一步重放，重建不会丢（详见 CODE_SPACE.md §8.1a）。

---

## 📝 说明

- 社区词书按语言标注，四门语言共用同一个 Supabase 词库池
- French 词汇覆盖用户本地《你好！法语》1-4 书末三语总词汇表（A1-B2）；语法讲解按 A1-B1 课程原创整理，动词变位来自 Wiktionary 与 Lexique（见下表）；项目不包含或分发教材扫描页

---

## 📚 数据来源与致谢

| 数据 | 来源 | 许可 |
|---|---|---|
| 法/德/英 释义、词性、词形 | [English Wiktionary](https://en.wiktionary.org/) via [Wiktextract](https://github.com/tatuylonen/wiktextract) / [kaikki.org](https://kaikki.org/) | **CC BY-SA 4.0**（+ GFDL） |
| French 词频、排名、动词变位词形 | [Lexique 3.83](http://www.lexique.org/) | **CC BY-SA 4.0** |
| French / German 例句 | [Tatoeba](https://tatoeba.org/) | **CC BY 2.0 FR** |
| German 词汇中文释义（部分） | [HanDeDict](https://github.com/gugray/HanDeDict) | **CC BY-SA 3.0** |
| German 变位交叉校验 | [german-pos-dict / Morphy](https://github.com/languagetool-org/german-pos-dict) | **CC BY-SA 4.0** |
| English / German 词频排序 | [wordfreq](https://github.com/rspeer/wordfreq) | MIT（代码） |
| English 动词变位词形 | 手写不规则表 + [lemminflect](https://github.com/bjascob/LemmInflect) | MIT |
| 英→中中转释义 | [ECDICT](https://github.com/skywind3000/ECDICT) | 代码仓库标 MIT，数据分发包无 LICENSE，待核实 |
| English / French 语法讲解，德 / 英 / 法搭配表 | 为本项目原创撰写 | 自建 |
| German 语法讲解 | 原创专题 + 旧 Docusaurus 语料转换稿 | 旧语料未声明许可证 |
| Italian 语法书、动词搭配、动词变位 | 早期项目数据（语法书为书稿转换稿、搭配为扫描 OCR 手册） | 出处 / 许可未核实 |
| French 教材词表 | 《你好！法语》1-4 总词汇表（A1-B2） | 仅供学习，不分发教材原文 |
| 图表 / Markdown | [Chart.js](https://www.chartjs.org/) · [marked.js](https://marked.js.org/) | MIT |

逐文件的完整对照见 **[ATTRIBUTION.md](ATTRIBUTION.md)**；每条词汇的 `source` 字段还记录了逐字段的出处。

---

## 📄 许可证

本项目仅供个人学习使用。

> ⚠️ 注意：本项目的法/德/英数据大量来自 CC BY-SA 系列语料（Wiktionary/Wiktextract、Lexique 3.83、HanDeDict、Tatoeba）。如**公开分发/部署**本项目，需遵守 CC-BY-SA 的署名（attribution）与相同方式共享（share-alike）要求 —— [ATTRIBUTION.md](ATTRIBUTION.md) 即为署名，相应衍生数据亦沿用该协议。项目自身尚未声明开源协议，选定时必须与 CC BY-SA 相容。

---

**祝学习愉快！Buono studio ! Bon apprentissage !**
