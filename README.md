# 🌍 Dimenticato - 背单词

一个纯静态的多语言词汇学习网页应用，支持本地离线使用。

当前语言入口：

- 🇮🇹 Italian
- 🇩🇪 German
- 🇬🇧 English
- 🇫🇷 French

其中：

- **Italian** 仍然是功能最完整的主站
- **German / English / French** 已接入系统词汇练习、语法书、基础 Progress、Settings & Data
- **German** 另有基于本地教材范围整理的 A1-C1 课程路线
- **French** 另有 35 个高频动词的 7 组时态 / 语式变位练习
- **社区词库** 当前由四种语言共享同一个资源池

---

## ✨ 功能概览

### 1. 多语言入口

- 左侧 sidebar 可切换 Italian / German / English / French
- 不同语言会切换对应首页、主题色和模块入口
- German / English / French 使用独立的学习进度存储 key

### 2. 系统词汇练习

#### 全语言
- **打字游戏 · 激流勇进**：单词顺流而下，看释义、打字击落，3 条命
  - 两种玩法：**背单词**（看中文释义打外语单词）/ **动词变位**（看动词+时态+人称打变位形式）
  - 三档难度（简单/普通/困难），连击倍率、等级递增、本地最佳纪录
  - 输入可省略重音符号（é 可打 e），击落时可选朗读发音

#### Italian
- 28,787 个意大利语单词及英语翻译
- 按使用频率排序
- 支持分层学习：1,000 / 3,000 / 5,000 / 全部

#### German
- 15,507 个系统词条与 300 个高频动词变位
- A1-C1 五级课程路线，共 54 个教材主题单元
- 每个单元可直接练习对应核心词，并显示相关语法重点
- 支持：选择题 / 拼写 / 浏览

#### English
- 已接入英语系统词汇数据
- 支持：选择题 / 拼写 / 浏览

#### French
- 2,183 个 A1-B2 词条：372 个核心课程词条 + 四本《你好！法语》书末总词汇表
- 支持：选择题 / 拼写 / 浏览
- 法语朗读使用浏览器的 `fr-FR` 语音

### 3. 自定义词本

- 支持 JSON / TXT 两种格式导入
- 每个词本独立保存学习进度
- 支持个人笔记
- 支持本地管理、编辑、导出

### 4. 社区词库

- 浏览社区词本
- 预览词本内容
- 导入到本地“我的词本”中学习
- 当前 Italian / German / English / French 共用同一个社区词库池

### 5. 语法模块

#### Italian
- 动词变位练习
- 语法书
- 动词搭配
- 动词搭配练习

#### German
- **Grammar Book**
- 高频动词变位练习

#### English
- **Grammar Book**
- 高频动词变位练习

#### French
- 23 个 A1-B1 中文语法专题与法语例句
- 35 个高频动词
- 直陈式、条件式、虚拟式和命令式共 7 组时态 / 语式

### 6. Progress / Settings & Data

- Italian：完整统计与图表体验
- German / English / French：已提供基础 progress 数据页
- 全站共享：导出数据、导入数据、主题切换、帮助、重置学习数据

---

## 📄 TXT 词本格式

TXT 是最简单的自定义词本方式。

### 基本规则

1. 每个单词用**空行**分隔
2. 每个单词包含 **3-4 行**：
   - 第 1 行：源词
   - 第 2 行：翻译 1
   - 第 3 行：翻译 2 / 中文
   - 第 4 行（可选）：笔记

> 当前模板和说明主要仍按意大利语词本格式组织，但导入机制与多语言词本管理是共享的。

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

详细说明请查看 [TXT_FORMAT_GUIDE.md](TXT_FORMAT_GUIDE.md)

---

## 🎯 学习模式

### 选择题模式
- 显示单词
- 从多个选项中选择正确释义
- 即时反馈

### 拼写模式
- 显示释义
- 输入正确单词
- 自动校验答案

### 浏览模式
- 浏览完整词表
- 搜索
- 已掌握 / 未掌握过滤

### German 课程路线
- 按 A1 / A2 / B1 / B2 / C1 选择学习阶段
- 查看 54 个课程单元的主题与语法重点
- 可练习单课核心词，或合并练习整个级别

### Italian 专属扩展
- 动词变位练习（多时态）
- 动词搭配阅读
- 动词搭配练习

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

## 🧭 推荐使用流程

### 使用系统词汇

1. 在左侧切换语言
2. 进入 Vocabulary
3. 选择词汇来源
4. 选择练习模式
5. 开始学习

### 使用社区词库

1. 进入当前语言的 Vocabulary
2. 点击 Community Wordbooks
3. 浏览并预览社区词本
4. 导入到本地词本
5. 回到词汇模块开始学习

### 使用自定义词本

1. 准备 TXT / JSON 文件
2. 导入词本
3. 点击词本卡片
4. 选择练习模式

---

## 📁 项目结构

```text
Dimenticato/
├── index.html
├── styles.css
├── app.js
├── app-enhanced.js
├── german-app.js
├── german-course.js
├── french-app.js
├── conjugation-app.js
├── grammar-book.js
├── verb-collocations.js
├── verb-collocations-practice.js
├── community-wordbooks.js
├── cognate-app.js
├── typing-game-app.js   ← 打字游戏（数据接入 + 游戏屏渲染）
├── vocabulary.js
├── lib/
│   ├── boot.js
│   ├── lang-loader.js
│   ├── typing-game.js   ← 打字游戏引擎（逻辑/渲染分离）
│   └── …
├── data/
│   ├── german-course-data.js
│   ├── french-vocabulary.js
│   ├── french-vocabulary-glossary.js
│   ├── french-grammar-data.js
│   └── french-conjugations.js
├── scripts/
├── deutsch-data/vocab/  ← 德语词表构建输入（pgh.csv）
├──  english-data/        ← 英语词表构建输入（EnWords.csv、ECDICT 切片）
├── TXT_FORMAT_GUIDE.md
├── CODE_SPACE.md
└── README.md
```

---

## 🛠️ 技术栈

- HTML5 + CSS3 + 原生 JavaScript
- LocalStorage
- Chart.js
- marked.js
- Supabase（仅社区词本功能需要）

---

## 🔧 数据与脚本

### Italian 动词变位数据

```bash
python3 scripts/reverso_presente_pipeline.py
```

### German 语法数据构建

```bash
python3 scripts/build_german_grammar.py
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
python3 scripts/build_french_vocabulary_glossary.py REVIEWED_OCR.json data/french-vocabulary-glossary.js
```

---

## 📝 说明

- German / English / French 的 Grammar 现已包含 Grammar Book 与 **动词变位练习**（综合时态）
- 社区词库目前未按语言隔离，而是共享同一个词库池
- French 词汇覆盖用户本地《你好！法语》1-4 书末三语总词汇表（A1-B2）；语法讲解和变位按 A1-B1 课程独立整理；项目不包含或分发教材扫描页

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
| 英→中中转释义 | [ECDICT](https://github.com/skywind3000/ECDICT) | 代码仓库标 MIT，数据分发包无 LICENSE，待核实 |
| English 动词变位 | `scripts/build_english_conjugations.py` 规则生成 | 自建 |
| French 语法讲解 / German 语法讲解 / 搭配表 | 为本项目原创撰写 | 自建 |
| French 教材词表 | 《你好！法语》1-4 总词汇表（A1-B2） | 仅供学习，不分发教材原文 |
| 图表 / Markdown | [Chart.js](https://www.chartjs.org/) · [marked.js](https://marked.js.org/) | MIT |

逐文件的完整对照见 **[ATTRIBUTION.md](ATTRIBUTION.md)**；每条词汇的 `source` 字段还记录了逐字段的出处。

---

## 📄 许可证

本项目仅供个人学习使用。

> ⚠️ 注意：本项目的法/德/英数据大量来自 CC BY-SA 系列语料（Wiktionary/Wiktextract、Lexique 3.83、HanDeDict、Tatoeba）。如**公开分发/部署**本项目，需遵守 CC-BY-SA 的署名（attribution）与相同方式共享（share-alike）要求 —— [ATTRIBUTION.md](ATTRIBUTION.md) 即为署名，相应衍生数据亦沿用该协议。项目自身尚未声明开源协议，选定时必须与 CC BY-SA 相容。

---

**祝学习愉快！Buono studio ! Bon apprentissage !**
