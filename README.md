# 🌍 Dimenticato - 背单词

一个纯静态的多语言词汇学习网页应用，支持本地离线使用。

当前语言入口：

- 🇮🇹 Italian
- 🇩🇪 German
- 🇬🇧 English

其中：

- **Italian** 仍然是功能最完整的主站
- **German / English** 已接入系统词汇练习、语法书、基础 Progress、Settings & Data
- **社区词库** 当前由三种语言共享同一个资源池

---

## ✨ 功能概览

### 1. 多语言入口

- 左侧 sidebar 可切换 Italian / German / English
- 不同语言会切换对应首页、主题色和模块入口
- German / English 使用独立的学习进度存储 key

### 2. 系统词汇练习

#### Italian
- 28,787 个意大利语单词及英语翻译
- 按使用频率排序
- 支持分层学习：1,000 / 3,000 / 5,000 / 全部

#### German
- 已接入德语系统词汇数据
- 支持：选择题 / 拼写 / 浏览

#### English
- 已接入英语系统词汇数据
- 支持：选择题 / 拼写 / 浏览

### 3. 自定义词本

- 支持 JSON / TXT 两种格式导入
- 每个词本独立保存学习进度
- 支持个人笔记
- 支持本地管理、编辑、导出

### 4. 社区词库

- 浏览社区词本
- 预览词本内容
- 导入到本地“我的词本”中学习
- 当前 Italian / German / English 共用同一个社区词库池

### 5. 语法模块

#### Italian
- 动词变位练习
- 语法书
- 动词搭配
- 动词搭配练习

#### German
- 当前仅保留 **Grammar Book**

#### English
- 当前仅保留 **Grammar Book**

### 6. Progress / Settings & Data

- Italian：完整统计与图表体验
- German / English：已提供基础 progress 数据页
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
├── conjugation-app.js
├── grammar-book.js
├── verb-collocations.js
├── verb-collocations-practice.js
├── community-wordbooks.js
├── vocabulary.js
├── data/
├── scripts/
├── deutsch-data/
├──  english-data/
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

---

## 📝 说明

- German / English 的 Grammar 当前只保留 Grammar Book
- 德语动词变位、英语动词时态/词形练习如需补齐，建议后续单独建立数据抓取与生成 pipeline
- 社区词库目前未按语言隔离，而是共享同一个词库池

---

## 📄 许可证

本项目仅供个人学习使用。

---

**祝学习愉快！Buono studio!**
