# 数据来源与授权 / Attribution

本文件逐个数据文件列出真实来源与授权。每条词条自身的 `source` 字段记录了更细的
逐字段出处（例如某个中文释义来自 HanDeDict 还是 ECDICT 中转），本文件是它的汇总。

**本项目自身尚未声明开源协议**——仓库里没有 LICENSE 文件。下面列出的第三方数据中，
CC BY-SA 系列带有"相同方式共享"义务，选定项目协议时必须与之相容。

---

## 第三方数据源

| 来源 | 授权 | 用途 |
|---|---|---|
| [English Wiktionary](https://en.wiktionary.org/) via [Wiktextract](https://github.com/tatuylonen/wiktextract) / [kaikki.org](https://kaikki.org/) | **CC BY-SA 4.0**（+ GFDL） | 法语变位词形、法/德/英释义、词性、性别、复数、动词主要变化形 |
| [Lexique 3.83](http://www.lexique.org/) (New Lexicon Project) | **CC BY-SA 4.0** | 法语词频与语料排名、过去分词性数配合形、拼写变体排序 |
| [Tatoeba](https://tatoeba.org/) | **CC BY 2.0 FR** | 法语/德语搭配例句、德语课程例句、德语大小写模型 |
| [HanDeDict](https://github.com/gugray/HanDeDict) | **CC BY-SA 3.0** | 德语词汇的中文释义（8,713 条） |
| pgh.csv（仓库内既有德汉词表） | **CC BY-SA 4.0** | 德语词汇的中文释义（6,606 条） |
| [german-pos-dict / Morphy](https://github.com/languagetool-org/german-pos-dict) | **CC BY-SA 4.0** | 德语变位交叉校验 |
| OpenSubtitles 2018 | 语料统计（词频计数） | 德语词频 |
| [wordfreq](https://github.com/rspeer/wordfreq) | MIT（代码） | 英语/德语词表的词频排序 |
| [ECDICT 1.0.28](https://github.com/skywind3000/ECDICT) | 见下方说明 | 英→中中转释义 |

### ECDICT 的授权状态

ECDICT 的代码仓库声明 MIT，但**其 sqlite 数据分发包内不含 LICENSE 文件，无法第一手核实
词典数据本身的授权**。它是本项目多处中文释义的英→中中转来源。这一点在公开发布前应当查清。

英→中中转本身也是已知的质量风险：同形异义词（如 hail = 招呼 / 下冰雹）会让两个不同的
法语动词拿到同一条错释义。这类释义已经过两轮人工修正（见 git 历史中的
"修正 881 条中文释义撞车与中转错译" 与 "人工重写 46 个新增动词的中文释义"）。

---

## 逐文件对照

### 法语

| 文件 | 来源 |
|---|---|
| `data/french-conjugations.js` | 简单时态词形、分词、助动词、嘘音 h 标记 = kaikki/Wiktextract（CC BY-SA 4.0 + GFDL）；词频与排名、过去分词配合形 = Lexique 3.83（CC BY-SA 4.0）；复合时态、代动词层、正则变位引擎、词形分类器 = `scripts/build_french_conjugations.py` 原创；中文释义 = 人工修订，新词经 ECDICT 中转 |
| `data/french-vocabulary-core.js` | 排名与词频 = Lexique 3.83；英语释义 = Wiktionary/kaikki；中文释义 = ECDICT 中转 |
| `data/french-vocabulary-glossary.js` | 词表本身摘自《你好！法语》1-4 册 Lexique trilingue（教材词表，仅供学习）；词频与排名 = Lexique 3.83；英语释义 = Wiktionary/kaikki |
| `data/french-vocabulary.js` | 同上（core 与 glossary 的合并视图） |
| `data/french-grammar-data.js` | 讲解与例句 = 为本项目原创撰写；变位表 = `scripts/build_french_grammar.py` 内置引擎生成，事实对照 French Wiktionary（CC BY-SA 3.0）与 `data/french-conjugations.js` |
| `data/french-cognates.js` | Lexique 3.83 + Wiktionary/Wiktextract + `data/english-vocabulary.js`；假朋友表为原创撰写 |
| `data/french-collocations-data.js` | 原创搭配表与原创例句（`scripts/sources/french-collocations/`）+ Tatoeba（CC BY 2.0 FR）例句 + Lexique 3.83 |

### 德语

| 文件 | 来源 |
|---|---|
| `data/german-vocabulary.js` | 中文释义 = HanDeDict（CC BY-SA 3.0）/ pgh.csv（CC BY-SA 4.0）/ ECDICT 中转；英语释义、词性、性别、复数 = Wiktextract（CC BY-SA 4.0）；词频 = OpenSubtitles-2018 + Tatoeba 大小写模型 |
| `data/german-conjugations.js` | 词形 = en.wiktionary via wiktextract/kaikki（CC BY-SA 4.0），对照 german-pos-dict / Morphy（CC BY-SA 4.0）校验；释义 = `data/german-vocabulary.js`；词频 = wordfreq |
| `data/german-course-data.js` | 课程结构参照《走遍德国 / Passwort Deutsch》A1-B1 与《Mittelpunkt》B2-C1 的主题编排（仅结构，不含教材原文）；例句 = Tatoeba（CC BY 2.0 FR） |
| `data/german-grammar-data.js` | 讲解与例句为本项目原创撰写 |
| `data/german-cognates.js` | 由 `data/german-vocabulary.js` 与 `data/english-vocabulary.js` 派生 |
| `data/german-collocations-data.js` | 原创搭配表与原创例句（`scripts/sources/german-rektion/`）+ Tatoeba（CC BY 2.0 FR）例句 |

### 英语

| 文件 | 来源 |
|---|---|
| `data/english-vocabulary.js` | 词频排序 = wordfreq；释义 = EnWords.csv / ECDICT |
| `data/english-conjugations.js` | 由 `scripts/build_english_conjugations.py` 的规则引擎从 `data/english-vocabulary.js` + wordfreq 生成 |
| `data/english-grammar-data.js` | 原创撰写 |

### 意大利语

| 文件 | 来源 |
|---|---|
| `vocabulary.js` | 意大利语语料词频表 + 英汉释义；逐条 `source` 字段未保留，早期数据 |
| `data/conjugations-all-tenses.js` | 由 `scripts/build_it50k_conjugations.py` 生成（该脚本已不在仓库内），基于 `data/it50k-verb-lemmas.json` 频率表 |
| `data/cognates.js` | 由意大利语词表与英语词表派生 |
| `data/grammar-data.js`、`data/verb-collocations-data.js` | 原创撰写 |

意大利语数据是本项目最早的一批，逐字段出处记录不如法德完整。若要做严格的合规发布，
这部分需要重新溯源。

---

## 前端开源库

| 库 | 授权 |
|---|---|
| [Chart.js](https://www.chartjs.org/) | MIT |
| [marked.js](https://marked.js.org/) | MIT |
| Material Symbols Rounded（图标字体） | Apache 2.0 |

---

## 已移除的依赖

`data/french-conjugations.js` 曾经由 **Verbiste 0.1.49**（GPL-2-or-later，Pierre Sarrazin）
的 148 个 Bescherelle 模板生成。Verbiste 的授权与本项目的发布方式不相容，该依赖已于
2026-08 移除，全部简单时态改由 Wiktionary 词形表提供（见 `scripts/build_french_conjugations.py`）。
仓库中不再有任何数据派生自 Verbiste。
