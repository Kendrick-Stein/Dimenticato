# 发音入门教程

2026-10-10 新增/修订；教学文字为原创中文概述，外部资料仅核对语言事实，未复制音频或大段原文。IPA 使用宽式标音，地区变体在正文中注明；课程不是发音识别器，也未新增或修改 TTS。

## 入口与维护

语法书欢迎页显示「先学发音：字母、拼读与重音」，由教材中含“发音入门”的专题标题产生，不按语言硬编码路由。意大利语和德语在末尾追加入门分组，避免位置式 slug 重排；法语沿用第一章四个既有专题。

- IT：新增3篇（`#/it/grammar/book/p4/ch01/t01` 起）。`data/it-grammar.js` 为现有 source of truth；按仓库约定用 `python3 scripts/canonicalize_grammar.py it` 规范化。
- DE：新增3篇（`#/de/grammar/book/p5/ch01/t01` 起）；原 `p4/ch01/t02` 仍可访问，仅修订绝对化表述并链接系统课程。`python3 scripts/canonicalize_grammar.py de`。
- FR：修改 `scripts/build_french_grammar.py` 第一章，再生成 `data/fr-grammar.js`，旧4篇slug不变。
- EN：未改动132篇原教材。本次范围为用户同时学习的 IT/FR/DE，不代表英语已有系统发音课程。

## 来源与核查范围

### 意大利语

- [Treccani：拼写中的区分符号](https://www.treccani.it/enciclopedia/segni-diacritici_%28La-grammatica-italiana%29/)：i/h 与 c/g/sc 的拼写读音关系。
- [Treccani：二合字母](https://www.treccani.it/enciclopedia/digramma_%28Enciclopedia-dell%27Italiano%29/)：gn/gli 等组合。
- [Treccani：双辅音](https://www.treccani.it/enciclopedia/lettere-doppie_%28Enciclopedia-dell%27Italiano%29/)：长辅音、区别词义。
- [Treccani：音系](https://www.treccani.it/enciclopedia/fonologia_%28Enciclopedia-dell%27Italiano%29/)：重音、元音系统；普通拼写不完全标示 e/o 开闭。

### 法语

- [UT Austin 语音课](https://www.laits.utexas.edu/fi/html/pho/02.html)、[节奏](https://www.laits.utexas.edu/fi/html/pho/13.html)：音位、节奏组。
- [OQLF 联诵分类](https://vitrinelinguistique.oqlf.gouv.qc.ca/la-prononciation/liaisons)：必需/禁止/可选，非遇元音即联诵。
- [Québec 教育部课程](https://www.education.gouv.qc.ca/fileadmin/site_web/documents/dpse/formation_jeunes/progrApprSec_ILSS_fr.pdf)：liaison 与 enchaînement 区别。
- [OQLF mille/ville/tranquille](https://vitrinelinguistique.oqlf.gouv.qc.ca/25082/la-prononciation/prononciation-de-mots-particuliers/prononciation-de-mille-de-ville-et-de-tranquille)：词尾 -ille 的限制及例外。
- [大学 IPFC 研究材料](https://cblle.tufs.ac.jp/ipfc/assets/files/IPFC2011-Paris/2_IPFC2011_DURAND%20et%20EYCHENNE_Phono_Voyelles_Nasales.pdf)：brun/brin 鼻元音区别与地区合流。

### 德语

- [IDS 拼写规则](https://grammis.ids-mannheim.de/rechtschreibung/6174)：长短元音拼写线索的边界。
- [Goethe-Institut 发音练习](https://www.goethe.de/resources/files/pdf288/deutsche-aussprache-uben-mit-musik_arbeitsblaetter-zu-den-tutorials.pdf)：ich/ach 音、组合拼读。
- [FAU 元音长度](https://daf.sz.fau.de/phonetik/phonetik_content/index.php?phonetik_location=vokale_laenge)、[清化](https://daf.sz.fau.de/phonetik/phonetik_content/index.php?phonetik_location=silben_auslauthart)、[词重音](https://daf.sz.fau.de/phonetik/phonetik_content/index.php?phonetik_location=woerter_wortakzent)。FAU 直接页面偶有服务器错误，部分内容由其搜索索引核对。
- [Atlas zur deutschen Alltagssprache：-ig](https://www.atlas-alltagssprache.de/runde-1/f14a-c/)：地域读音分布，不用作全国统一规范证明。

## 回归检查

`node tests/test-pronunciation-lessons.js` 检查三语入口、有效专题、保存/继续阅读、切换英语后不残留入口、旧alias解析。新增内容不替换任何既有专题slug；法语生成器可重复构建，意/德规范化幂等。

自动测试验证结构和基本呈现，不等于真人发音评测或完整浏览器视觉验收。
