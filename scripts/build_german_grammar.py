#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build data/german-grammar-data.js (GERMAN_GRAMMAR_DATA).

Three sources are merged, in this order:

  1. IMPORTED  - the 27 legacy topics under deutsch-data/grammar/docs/, kept at
                 their original slugs so existing deep links / course links do
                 not break.  Their Windows-style image references
                 (``![](.\\img\\X.png)``) are rewritten to
                 ``data/grammar_content/de-img/<ascii>.webp`` and the image
                 files themselves are copied (and optimised) into that
                 directory by this script.  See IMG_MAP.
  2. PATCHES /
     EXPANSIONS - inline markdown tables that transcribe the table-shaped
                 screenshots, plus extra sections appended to the thin legacy
                 stubs (分词 137 chars, 连词 258, 行动方式 198, ...).
  3. AUTHORED  - new topics written for this dataset (Kasus, Passiv,
                 Nebensaetze, Relativsaetze, word order, Modalpartikeln, ...).

Output shape (unchanged, additive `level` field on tree topics):

    const GERMAN_GRAMMAR_DATA = {
      "tree": { "parts": [ { title, slug, chapters: [ { title, slug,
                 topics: [ { title, slug, level } ] } ] } ] },
      "content": { "<slug>": "<markdown>" }
    };
    if (typeof module !== 'undefined' && module.exports) { ... }

Image optimisation uses `cwebp` when available (Homebrew: `brew install webp`),
falling back to macOS `sips`, falling back to a plain byte copy.  The extension
actually written is what the markdown references, so the emitted data always
matches the files on disk.

Run:  python3 scripts/build_german_grammar.py
Then: node scripts/validate_german_grammar.js
"""

import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DOCS_DIR = os.path.join(ROOT, 'deutsch-data', 'grammar', 'docs')
OUT_FILE = os.path.join(ROOT, 'data', 'german-grammar-data.js')
IMG_OUT_DIR = os.path.join(ROOT, 'data', 'grammar_content', 'de-img')
IMG_WEB_DIR = 'data/grammar_content/de-img'  # relative to site root (index.html)

SKIP_CATEGORIES = {'学习资源'}
MAX_IMG_WIDTH = 1400
WEBP_QUALITY = 82

# ---------------------------------------------------------------------------
# 1. Image map:  original basename -> (ascii stem, alt text)
#    Every one of the 71 references in the legacy markdown appears here.
# ---------------------------------------------------------------------------
IMG_MAP = {
    # 名词
    '名词构词-1.png': ('noun-wortbildung-1', '名词构词法图表 1'),
    '名词构词-2.png': ('noun-wortbildung-2', '名词构词法图表 2'),
    '名词的性-1.png': ('noun-gender-01', '名词性别规则图表 1'),
    '名词的性-2.png': ('noun-gender-02', '名词性别规则图表 2'),
    '名词的性-3.png': ('noun-gender-03', '名词性别规则图表 3'),
    '名词的性-4.png': ('noun-gender-04', '名词性别规则图表 4'),
    '名词的性-5.png': ('noun-gender-05', '名词性别规则图表 5'),
    '名词的性-6.png': ('noun-gender-06', '名词性别规则图表 6'),
    '名词的性-7.png': ('noun-gender-07', '名词性别规则图表 7'),
    '名词的性-8.png': ('noun-gender-08', '名词性别规则图表 8'),
    '名词的性-9.png': ('noun-gender-09', '名词性别规则图表 9'),
    '名词的性-10.png': ('noun-gender-10', '名词性别规则图表 10'),
    '名词的性-11.png': ('noun-gender-11', '名词性别规则图表 11'),
    '名词复数.png': ('noun-plural', '名词复数构成图表'),
    '名词复合中缀-1.png': ('noun-fugenelement-1', '复合名词中缀图表 1'),
    '名词复合中缀-2.png': ('noun-fugenelement-2', '复合名词中缀图表 2'),
    '名词复合中缀-3.png': ('noun-fugenelement-3', '复合名词中缀图表 3'),
    '名词复合中缀-4.png': ('noun-fugenelement-4', '复合名词中缀图表 4'),
    '名词词尾-en.png': ('noun-suffix-en', '以 -en 结尾的名词词尾图表'),
    # 形容词
    '形容词比较级变音.png': ('adj-komparativ-umlaut', '形容词比较级变音图表'),
    '三个性四个格.png': ('adj-kasus-uebersicht', '三性四格定冠词概览图'),
    '形容词变格-01.png': ('adj-deklination-1', '形容词弱、强、混合变化总表'),
    '形容词变格-02.png': ('adj-deklination-2', '形容词变格辨析图 2'),
    '形容词变格-03.png': ('adj-deklination-3', '形容词变格辨析图 3'),
    # 代词
    '关系代词.png': ('pron-relativpronomen', '关系代词变格表'),
    'beide.png': ('pron-beide', 'beide 的用法图表'),
    # 动词
    '被动态.png': ('verb-passiv', '被动态构成图'),
    '虚拟式.png': ('verb-konjunktiv', '虚拟式一式与二式思维导图'),
    '命令式.png': ('verb-imperativ', '命令式构成图'),
    '动词前缀be-.png': ('verb-praefix-be', '动词前缀 be- 语义图'),
    '动词前缀er-.png': ('verb-praefix-er', '动词前缀 er- 语义图'),
    '动词前缀ver-.png': ('verb-praefix-ver', '动词前缀 ver- 语义图'),
    '动词前缀aus-.png': ('verb-praefix-aus', '动词前缀 aus- 语义图'),
    '动词前缀bei.png': ('verb-praefix-bei', '动词前缀 bei- 语义图'),
    '动词前缀nach-.png': ('verb-praefix-nach', '动词前缀 nach- 语义图'),
    '动词前缀zu-.png': ('verb-praefix-zu', '动词前缀 zu- 语义图'),
    '动词前缀ueber-.png': ('verb-praefix-ueber', '动词前缀 ueber- 语义图'),
    '动词前缀wider-.png': ('verb-praefix-wider', '动词前缀 wider- 语义图'),
    '动词前缀wieder-.png': ('verb-praefix-wieder', '动词前缀 wieder- 语义图'),
    'nehmen-1.png': ('verb-nehmen-1', 'nehmen 派生词图 1'),
    'nehmen-2.png': ('verb-nehmen-2', 'nehmen 派生词图 2'),
    'fordern-1.png': ('verb-fordern-1', 'fordern 派生词图 1'),
    'fordern-2.png': ('verb-fordern-2', 'fordern 派生词图 2'),
    '用法模式nach.jpg': ('verb-valenz-nach', '动词 + nach 的用法模式图'),
    # 介词
    '介词.png': ('prep-uebersicht', '介词支配格概览图'),
    '介词ab.png': ('prep-ab', '介词 ab 语义图'),
    '介词von.png': ('prep-von', '介词 von 语义图'),
    '介词aus.png': ('prep-aus', '介词 aus 语义图'),
    '介词ueber.png': ('prep-ueber', '介词 ueber 语义图'),
    '介词auf.png': ('prep-auf', '介词 auf 语义图'),
    '介词an.png': ('prep-an', '介词 an 语义图'),
    '介词zu.png': ('prep-zu', '介词 zu 语义图'),
    '介词um.png': ('prep-um', '介词 um 语义图'),
    '介词bei.png': ('prep-bei', '介词 bei 语义图'),
    '介词nach.png': ('prep-nach', '介词 nach 语义图'),
    '介词unter.png': ('prep-unter', '介词 unter 语义图'),
    '介词ueber位置.png': ('prep-ueber-position', '介词 ueber 表位置示意图'),
    '介词auf位置.png': ('prep-auf-position', '介词 auf 表位置示意图'),
    '介词an位置.png': ('prep-an-position', '介词 an 表位置示意图'),
    '介词zu位置.png': ('prep-zu-position', '介词 zu 表位置示意图'),
    '介词um位置.png': ('prep-um-position', '介词 um 表位置示意图'),
    # 句法
    '句子成分.png': ('syntax-satzglieder', '句子成分示意图'),
    '基本句型.png': ('syntax-satzmuster', '德语基本句型图'),
    '语序.png': ('syntax-wortstellung', '中场语序 TeKaMoLo 示意图'),
    'kein.png': ('syntax-kein', 'kein 与 nicht 的选用图'),
    'ja&nein&doch.jpg': ('syntax-ja-nein-doch', 'ja / nein / doch 回答图'),
    # 其他
    '德语的阶段.png': ('misc-sprachniveau', '德语水平阶段图'),
    'PasswortDeutsch.jpg': ('misc-passwort-deutsch', '教材 Passwort Deutsch 封面'),
    '口语时态.png': ('misc-tempus-muendlich', '口语中的时态使用图'),
    '时间表达.png': ('misc-zeitangaben', '时间表达方式图'),
}

# 关系代词.png exists in BOTH 代词/img and 句法/img; disambiguate by part.
IMG_MAP_BY_PART = {
    ('句法', '关系代词.png'): ('syntax-relativpronomen', '关系代词变格表'),
}


def convert_image(src, stem):
    """Copy+optimise `src` into IMG_OUT_DIR. Returns the written filename."""
    dst_webp = os.path.join(IMG_OUT_DIR, stem + '.webp')
    if shutil.which('cwebp'):
        r = subprocess.run(
            ['cwebp', '-quiet', '-resize', str(MAX_IMG_WIDTH), '0',
             '-q', str(WEBP_QUALITY), src, '-o', dst_webp],
            capture_output=True)
        if r.returncode == 0 and os.path.exists(dst_webp):
            return stem + '.webp'
    ext = os.path.splitext(src)[1].lower()
    dst_plain = os.path.join(IMG_OUT_DIR, stem + ext)
    if shutil.which('sips'):
        r = subprocess.run(['sips', '-Z', str(MAX_IMG_WIDTH), src,
                            '--out', dst_plain],
                           capture_output=True)
        if r.returncode == 0 and os.path.exists(dst_plain):
            return stem + ext
    shutil.copyfile(src, dst_plain)
    return stem + ext


IMG_REF_RE = re.compile(r'!\[([^\]]*)\]\(([^)]+)\)')


def rewrite_images(part, markdown, copied):
    """Rewrite every image reference in `markdown` to the de-img path."""
    def repl(m):
        raw = m.group(2).replace('\\', '/')
        base = raw.split('/')[-1]
        entry = IMG_MAP_BY_PART.get((part, base)) or IMG_MAP.get(base)
        if entry is None:
            raise SystemExit('ERROR: unmapped image %r in part %r' % (base, part))
        stem, alt = entry
        src = os.path.join(DOCS_DIR, part, 'img', base)
        if not os.path.exists(src):
            raise SystemExit('ERROR: missing source image %s' % src)
        if stem not in copied:
            copied[stem] = convert_image(src, stem)
        return '![%s](%s/%s)' % (alt, IMG_WEB_DIR, copied[stem])
    return IMG_REF_RE.sub(repl, markdown)


# ---------------------------------------------------------------------------
# 2. Legacy import
# ---------------------------------------------------------------------------
def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def strip_frontmatter(text):
    if text.startswith('---'):
        end = text.find('---', 3)
        if end != -1:
            return text[end + 3:].lstrip('\n')
    return text


def slugify(text):
    slug = re.sub(r'[^\w一-鿿㐀-䶿]', '-', text)
    return re.sub(r'-+', '-', slug).strip('-').lower()


def import_legacy():
    """Return ({slug: markdown}, {stem: filename}) for the legacy topics."""
    content = {}
    copied = {}
    for name in sorted(os.listdir(DOCS_DIR)):
        path = os.path.join(DOCS_DIR, name)
        if name.startswith('.') or name.startswith('_') or name in SKIP_CATEGORIES:
            continue
        if os.path.isfile(path) and name.endswith('.md'):
            body = strip_frontmatter(read_file(path))
            m = re.search(r'^#\s+(.+)', body, re.MULTILINE)
            title = m.group(1).strip() if m else name[:-3]
            content['intro/' + slugify(title)] = body
            continue
        if not os.path.isdir(path):
            continue
        part = name
        for fname in sorted(os.listdir(path)):
            if not fname.endswith('.md') or fname.startswith('_'):
                continue
            body = strip_frontmatter(read_file(os.path.join(path, fname)))
            m = re.search(r'^#\s+(.+)', body, re.MULTILINE)
            title = m.group(1).strip() if m else fname[:-3]
            body = rewrite_images(part, body, copied)
            content['%s/%s' % (slugify(part), slugify(title))] = body
    return content, copied


# ---------------------------------------------------------------------------
# 3. Patches (in-place edits of legacy topics), expansions (appended text)
#    and authored topics.
# ---------------------------------------------------------------------------
PATCHES = {}     # slug -> list of (find, replace)
EXPANSIONS = {}  # slug -> markdown appended to the legacy body
AUTHORED = {}    # slug -> full markdown for new topics

# === CONTENT BLOCKS BELOW (appended by successive edits) ===

EXPANSIONS['intro/前言'] = """
## 如何使用这本语法书

本书按 **词法（Morphologie）** 和 **句法（Syntax）** 两大部分组织，每个条目标注了
CEFR 等级，方便按水平取用：

| 等级 | 你应该已经掌握 | 本书对应重点 |
| :--- | :--- | :--- |
| A1 | 现在时、名词的性、第一格与第四格、定冠词 | 冠词、四个格总览、动词位置与句框 |
| A2 | 完成时、过去时、第三格、形容词变格、可分动词 | 形容词三张变格表、介词支配格、从句入门 |
| B1 | 关系从句、被动态、虚拟式二式、Konnektoren | 关系从句、过程被动、虚拟式二式用法 |
| B2 | 虚拟式一式、状态被动、名词化、语气小品词 | 间接引语、被动替代形式、Modalpartikeln |
| C1 | 扩展分词定语、功能动词结构、情态动词主观用法 | 扩展定语、Funktionsverbgefüge |

### 阅读约定

* 例句一律 **德语加粗在上、汉语翻译在下**，可以先遮住汉语自测。
* 表格中的 **N / A / D / G** 分别代表第一格（Nominativ）、第四格（Akkusativ）、
  第三格（Dativ）、第二格（Genitiv）。
* 「常见错误」表格里左栏是中国学习者最高频的错误形式，右栏是正确形式。
* 术语一律德汉并列，例如「从句（Nebensatz）」，方便你查德语原版语法书。

### 学德语的三个坎

1. **性、数、格** 三者联动：一个名词短语里冠词、形容词、名词必须同时正确。
   建议永远按「der Tisch / die Tische」这种带冠词加复数的方式背单词。
2. **动词位置**：主句第二位、从句末位、句框把可分前缀和第二分词甩到句尾。
   德语的语序不是「主谓宾」，而是「动词占位加中场自由排列」。
3. **介词与格的固定搭配**：warten auf 加第四格、helfen 加第三格，
   这些必须和动词一起整体记忆，不能靠翻译推导。
"""

EXPANSIONS['动词/变位'] = """
## 六个时态一览

德语只有六个时态，其中现在时和过去时是「简单时态」（一个词），
其余四个是「复合时态」（助动词加非限定形式）。

| 时态 | 构成 | 例（machen） | 主要用法 |
| :--- | :--- | :--- | :--- |
| 现在时 Präsens | 词干加人称词尾 | er macht | 现在、习惯、普遍真理、带时间状语的将来 |
| 过去时 Präteritum | 词干加过去标志加词尾 | er machte | 书面叙述、sein/haben/情态动词的口语过去 |
| 现在完成时 Perfekt | haben/sein 加第二分词 | er hat gemacht | 口语中的一切过去、与现在有关联的过去 |
| 过去完成时 Plusquamperfekt | hatte/war 加第二分词 | er hatte gemacht | 过去的过去，常与 nachdem 连用 |
| 第一将来时 Futur I | werden 加不定式 | er wird machen | 将来、推测（wohl）、强烈要求 |
| 第二将来时 Futur II | werden 加第二分词加 haben/sein | er wird gemacht haben | 将来完成、对过去的推测 |

## 现在时人称词尾

| 人称 | 规则动词 machen | 词干变音 fahren | 词干以 -t/-d 结尾 arbeiten | 特殊 sein |
| :--- | :--- | :--- | :--- | :--- |
| ich | mache | fahre | arbeite | bin |
| du | machst | fährst | arbeitest | bist |
| er/sie/es | macht | fährt | arbeitet | ist |
| wir | machen | fahren | arbeiten | sind |
| ihr | macht | fahrt | arbeitet | seid |
| sie/Sie | machen | fahren | arbeiten | sind |

## 例句

**Ich arbeite seit drei Jahren bei dieser Firma.**
我在这家公司工作三年了。（现在时加 seit，汉语要用「了」）

**Er fährt morgen nach München.**
他明天去慕尼黑。（现在时加时间状语表将来，比 Futur I 更常用）

**Als Kind spielte ich jeden Tag Klavier.**
小时候我每天弹钢琴。（书面叙述用过去时）

**Gestern habe ich meinen Pass verloren.**
昨天我把护照弄丢了。（口语叙述过去一律用完成时）

**Nachdem er gegessen hatte, ging er spazieren.**
他吃完饭以后去散步了。（过去的过去用过去完成时）

**Bis nächsten Freitag werde ich den Bericht geschrieben haben.**
到下周五我就把报告写完了。（Futur II 表将来完成）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich arbeite hier seit drei Jahren gearbeitet. | Ich arbeite hier seit drei Jahren. | seit 加现在时，不用完成时 |
| Er ist gestern nach Berlin gefahrt. | Er ist gestern nach Berlin gefahren. | fahren 是强变化，第二分词 gefahren |
| Ich habe gegangen. | Ich bin gegangen. | 位移动词用 sein |
| Ich werde morgen gehen werden. | Ich werde morgen gehen. | werden 只出现一次 |
"""

EXPANSIONS['动词/分词'] = """
## 一、第一分词（Partizip I）

**构成：不定式加 -d**，即 machen 变 machend，lesen 变 lesend。
唯一的例外是 sein 变 seiend 和 tun 变 tuend。

意义永远是 **主动、正在进行**，相当于汉语的「正在……的」。

| 用法 | 例子 | 说明 |
| :--- | :--- | :--- |
| 作定语 | das schlafende Kind 熟睡的孩子 | 必须变格，和形容词一样 |
| 作状语 | Er kam lachend herein. 他笑着进来 | 不变格 |
| 名词化 | der Reisende 旅客、die Studierenden 在学的人 | 按形容词变格 |
| 加 zu 作定语 | die zu lösende Aufgabe 待解决的题目 | 表被动加必要性 |

## 二、第二分词（Partizip II）

| 动词类型 | 规则 | 例 |
| :--- | :--- | :--- |
| 弱变化 | ge- 加词干加 -t | machen 变 gemacht |
| 强变化 | ge- 加（换音）词干加 -en | singen 变 gesungen |
| 混合变化 | ge- 加换音词干加 -t | bringen 变 gebracht |
| 不可分前缀（be-, ge-, er-, ver-, zer-, ent-, emp-, miss-） | 不加 ge- | besuchen 变 besucht |
| 以 -ieren 结尾 | 不加 ge- | studieren 变 studiert |
| 可分动词 | 前缀加 ge 加词干 | anrufen 变 angerufen |

意义：及物动词的第二分词表 **被动、已完成**；不及物位移动词的第二分词表
**已完成的状态**。

* das gekochte Ei 煮好的鸡蛋（被动加完成）
* der angekommene Zug 已到站的列车（主动加完成，因为 ankommen 不及物）

## 三、分词作定语等于一个关系从句

分词定语可以随时还原成关系从句，这是理解和写作时最实用的转换：

| 分词结构 | 等值的关系从句 |
| :--- | :--- |
| das weinende Kind | das Kind, das weint |
| der reparierte Wagen | der Wagen, der repariert worden ist |
| die ankommenden Gäste | die Gäste, die ankommen |
| das zu lesende Buch | das Buch, das gelesen werden muss |

## 四、例句

**Die auf dem Tisch liegenden Papiere gehören mir.**
放在桌子上的那些文件是我的。

**Der von allen bewunderte Professor hält heute einen Vortrag.**
那位受到所有人敬佩的教授今天做报告。

**Sie stand schweigend am Fenster.**
她沉默地站在窗边。

**Das ist ein kaum zu lösendes Problem.**
这是一个几乎无法解决的问题。

**Gut vorbereitet ging er in die Prüfung.**
他准备充分地走进考场。（第二分词作状语）

**Die Zahl der Studierenden ist stark gestiegen.**
在学人数大幅上升。（第一分词名词化）

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| das schlafend Kind | das schlafende Kind | 分词作定语必须变格 |
| Er kam lachende herein. | Er kam lachend herein. | 作状语不变格 |
| die geschriebene Frau（想说「写字的女人」） | die schreibende Frau | 第二分词表被动，用错方向 |
| das zu lesend Buch | das zu lesende Buch | zu 加第一分词仍要变格 |
"""

EXPANSIONS['动词/行动方式'] = """
## 过程被动与状态被动的区别

「状态被动态和过程被动态概念可以忽略」这句话只对入门阶段成立，B1 以后必须分清：

| | 过程被动 Vorgangspassiv | 状态被动 Zustandspassiv |
| :--- | :--- | :--- |
| 构成 | werden 加第二分词 | sein 加第二分词 |
| 表达 | 动作正在发生 | 动作完成后的状态 |
| 例 | Die Tür wird geschlossen. 门正被关上 | Die Tür ist geschlossen. 门（现在）是关着的 |
| 完成时 | ist geschlossen worden（worden，不是 geworden） | ist geschlossen gewesen（少用） |

## 过程被动的六个时态

以 Der Brief（信）为例：

| 时态 | 形式 |
| :--- | :--- |
| 现在时 | Der Brief wird geschrieben. |
| 过去时 | Der Brief wurde geschrieben. |
| 现在完成时 | Der Brief ist geschrieben worden. |
| 过去完成时 | Der Brief war geschrieben worden. |
| 第一将来时 | Der Brief wird geschrieben werden. |
| 情态动词加被动 | Der Brief muss geschrieben werden. |

## 主动变被动的三步

1. 主动句的第四格宾语变成被动句的第一格主语；
2. 动词变 werden 加第二分词；
3. 原主语可以用 **von 加第三格**（施动者是人或有意志者）或
   **durch 加第四格**（中介、手段、原因）引出，也可以整个省略。

**Der Sturm zerstörte das Dach.** 暴风雨毁了屋顶。
**Das Dach wurde durch den Sturm zerstört.** 屋顶被暴风雨毁了。

## 无人称被动

不及物动词也能构成被动，此时没有主语，用 es 占前场；es 一旦不在句首就消失：

**Es wird hier nicht geraucht.** / **Hier wird nicht geraucht.**
这里禁止吸烟。

## 例句

**Das Formular muss bis Freitag ausgefüllt werden.**
表格必须在周五前填好。

**Mir wurde eine Frage gestellt.**
有人向我提了一个问题。（主动句的第三格宾语在被动句里保持第三格）

**Der Vertrag ist bereits unterschrieben.**
合同已经签好了。（状态被动）

**Der Patient konnte nicht gerettet werden.**
病人没能被救活。

**Es wurde die ganze Nacht getanzt.**
（大家）跳了一整夜舞。

**Das Problem lässt sich leicht lösen.**
这个问题很容易解决。（被动替代形式）
"""

EXPANSIONS['动词/叙述方式'] = """
## 三种式的对照

| 式 | 表达 | 例 |
| :--- | :--- | :--- |
| 直陈式 Indikativ | 说话人认为是事实 | Er kommt heute. 他今天来。 |
| 命令式 Imperativ | 要求、请求 | Komm bitte heute! 请你今天来！ |
| 虚拟式一式 Konjunktiv I | 转述别人的话，不表态 | Er sagt, er komme heute. 他说他今天来。 |
| 虚拟式二式 Konjunktiv II | 非现实、假设、委婉 | Er käme heute, wenn er Zeit hätte. 他要是有空今天就来了。 |

## 虚拟式一式变位表（以 er/sie/es 为核心）

一式以 **不定式词干** 加虚拟式词尾 -e, -est, -e, -en, -et, -en 构成，
只有第三人称单数与直陈式明显不同，所以实际使用中主要用第三人称。

| 人称 | machen | fahren | haben | werden | können | sein（唯一不规则） |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ich | mache | fahre | habe | werde | könne | sei |
| du | machest | fahrest | habest | werdest | könnest | seiest |
| er/sie/es | mache | fahre | habe | werde | könne | sei |
| wir | machen | fahren | haben | werden | können | seien |
| ihr | machet | fahret | habet | werdet | könnet | seiet |
| sie/Sie | machen | fahren | haben | werden | können | seien |

当一式形式与直陈式重合（如 wir machen）时，**必须换用二式**（wir machten）。

## 虚拟式二式变位表

二式以 **过去时词干** 构成，强变化动词的词干元音 a/o/u 要变音，再加 -e, -est, -e, -en, -et, -en。

| 不定式 | 过去时 | 虚拟式二式 | 汉语 |
| :--- | :--- | :--- | :--- |
| sein | war | wäre | 是 |
| haben | hatte | hätte | 有 |
| werden | wurde | würde | 变成 |
| können | konnte | könnte | 能 |
| müssen | musste | müsste | 必须 |
| dürfen | durfte | dürfte | 可以 |
| sollen | sollte | sollte（不变音） | 应该 |
| wollen | wollte | wollte（不变音） | 想 |
| gehen | ging | ginge | 走 |
| kommen | kam | käme | 来 |
| geben | gab | gäbe | 给 |
| wissen | wusste | wüsste | 知道 |
| brauchen | brauchte | bräuchte（口语） | 需要 |

弱变化动词的二式与过去时同形（machte 等于 machte），因此实际口语中
一律用 **würde 加不定式** 替代：Ich würde das nicht machen.

## 命令式三种形式

| 对象 | 构成 | 例（kommen / geben / sein） |
| :--- | :--- | :--- |
| du | 现在时 du 形式去掉 -st 和人称 | Komm! Gib! Sei! |
| ihr | 与现在时 ihr 形式相同 | Kommt! Gebt! Seid! |
| Sie | 不定式加 Sie（动词在最前） | Kommen Sie! Geben Sie! Seien Sie! |

换元音 e 变 i 的强变化动词，du 命令式保留换元音且 **不变音**：
geben 变 Gib!、lesen 变 Lies!、nehmen 变 Nimm!；
但 fahren 变 Fahr!（a 变 ae 的动词命令式不变音）。

## 例句

**Der Minister sagte, er sei zu keinem Zeitpunkt informiert worden.**
部长说，他从未在任何时候被告知过。（间接引语，一式）

**An deiner Stelle würde ich sofort kündigen.**
换了我的话会立刻辞职。（二式，非现实）

**Könnten Sie mir bitte helfen?**
您能帮我一下吗？（二式，委婉请求）

**Wenn ich mehr Zeit hätte, lernte ich Chinesisch.**
如果我有更多时间，我就学中文。（二式，非现实条件）

**Sei bitte pünktlich!**
请你准时！（命令式）

**Man nehme drei Eier und etwas Mehl.**
取三个鸡蛋和一些面粉。（一式的说明书用法）
"""
EXPANSIONS['形容词/形容词变格'] = """
## 三张变格表（文字版）

上面的示意图现在有了完整的文字版本，可以直接背诵、复制。
口诀：**「谁先谁负责」** — 定冠词、der 类限定词已经把格标出来了，
形容词就偷懒（弱变化）；前面什么都没有时，形容词自己扛起标格任务（强变化）；
ein 类限定词在阳性第一格和中性第一、四格「露不出格」，
所以那三格由形容词补上（混合变化）。

### 1）弱变化：der / dieser / jeder / welcher / alle 之后

只有两种词尾：**-e** 和 **-en**。

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| :--- | :--- | :--- | :--- | :--- |
| N | der nette Mann | die nette Frau | das nette Kind | die netten Leute |
| A | den netten Mann | die nette Frau | das nette Kind | die netten Leute |
| D | dem netten Mann | der netten Frau | dem netten Kind | den netten Leuten |
| G | des netten Mannes | der netten Frau | des netten Kindes | der netten Leute |

记忆法：左上角一个 2 乘 3 的小方块（m.N / f.N / f.A / n.N / n.A）是 **-e**，
其余全部是 **-en**。

### 2）强变化：前面没有限定词时（零冠词、复数无冠词、viele/einige 之后）

词尾等于 **定冠词的词尾**，唯一例外是阳性和中性的第二格用 -en（因为名词已带 -s）。

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| :--- | :--- | :--- | :--- | :--- |
| N | netter Mann | nette Frau | nettes Kind | nette Leute |
| A | netten Mann | nette Frau | nettes Kind | nette Leute |
| D | nettem Mann | netter Frau | nettem Kind | netten Leuten |
| G | netten Mannes | netter Frau | netten Kindes | netter Leute |

### 3）混合变化：ein / kein / mein 等物主冠词之后

= 弱变化，但阳性第一格、中性第一格和第四格这三个位置改用强变化词尾。

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl.（kein） |
| :--- | :--- | :--- | :--- | :--- |
| N | ein netter Mann | eine nette Frau | ein nettes Kind | keine netten Leute |
| A | einen netten Mann | eine nette Frau | ein nettes Kind | keine netten Leute |
| D | einem netten Mann | einer netten Frau | einem netten Kind | keinen netten Leuten |
| G | eines netten Mannes | einer netten Frau | eines netten Kindes | keiner netten Leute |

## 例句

**Der neue Kollege kommt aus Österreich.**
新同事来自奥地利。（弱变化）

**Ich trinke gern schwarzen Kaffee.**
我爱喝黑咖啡。（强变化，阳性第四格）

**Sie hat ein interessantes Buch gekauft.**
她买了一本有趣的书。（混合变化，中性第四格）

**Mit freundlichen Grüßen**
此致敬礼。（书信结尾，强变化第三格复数）

**Bei schönem Wetter gehen wir schwimmen.**
天气好的时候我们去游泳。（强变化，中性第三格）

**Die Wohnung meiner älteren Schwester ist sehr groß.**
我姐姐的房子很大。（混合变化，阴性第二格）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| ein netter Kind | ein nettes Kind | 中性第一格用 -es |
| mit dem neuem Auto | mit dem neuen Auto | 定冠词后一律 -en |
| Ich trinke schwarze Kaffee. | Ich trinke schwarzen Kaffee. | 强变化阳性第四格 -en |
| viele gute Leute（第三格）→ mit viele gute Leuten | mit vielen guten Leuten | viel- 本身也要变格 |
| eine gute Freund | ein guter Freund | 性别判断错，连带词尾全错 |
"""

EXPANSIONS['形容词/形容词'] = """
## 比较级与最高级速查

| 原级 | 比较级 | 最高级（定语） | 最高级（状语） |
| :--- | :--- | :--- | :--- |
| schnell | schneller | der schnellste | am schnellsten |
| alt | älter | der älteste | am ältesten |
| groß | größer | der größte | am größten |
| gut | besser | der beste | am besten |
| viel | mehr | der meiste | am meisten |
| gern | lieber | der liebste | am liebsten |
| hoch | höher | der höchste | am höchsten |
| nah | näher | der nächste | am nächsten |

单音节形容词的词干元音 a / o / u 常常变音（alt 变 älter），
但 **不变音** 的常见词有：froh, klar, laut, rasch, sanft, schlank, stolz, voll, wahr。

## 比较句型

| 句型 | 例句 | 汉语 |
| :--- | :--- | :--- |
| so ... wie | Er ist so groß wie ich. | 他和我一样高。 |
| nicht so ... wie | Heute ist es nicht so kalt wie gestern. | 今天没有昨天冷。 |
| 比较级 + als | Berlin ist größer als München. | 柏林比慕尼黑大。 |
| immer + 比较级 | Es wird immer wärmer. | 天越来越暖和了。 |
| je ..., desto ... | Je mehr ich lerne, desto besser verstehe ich. | 我学得越多，理解得越好。 |

## 例句

**Dieses Restaurant ist besser als das andere.**
这家餐馆比那家好。

**Sie spricht am besten von allen Teilnehmern.**
她在所有参加者中说得最好。

**Das ist die schönste Stadt, die ich kenne.**
这是我知道的最美的城市。

**Mein Bruder ist zwei Jahre älter als ich.**
我哥哥比我大两岁。

**Je länger man wartet, desto teurer wird es.**
等得越久就越贵。

**Er arbeitet lieber allein als im Team.**
比起团队协作，他更愿意独自工作。

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| größer wie ich | größer als ich | 比较级后用 als，wie 只用于 so ... wie |
| mehr schnell | schneller | 德语没有 more 加形容词的构成法 |
| Er ist der beste von die Klasse. | Er ist der Beste in der Klasse. | 介词与格错误，且名词化要大写 |
| am schnellste | am schnellsten | am 加最高级固定为 -sten |
"""

EXPANSIONS['冠词/冠词'] = """
## 定冠词与不定冠词全表

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| :--- | :--- | :--- | :--- | :--- |
| N | der / ein | die / eine | das / ein | die / (keine) |
| A | den / einen | die / eine | das / ein | die / (keine) |
| D | dem / einem | der / einer | dem / einem | den ...-n / (keinen) |
| G | des ...-(e)s / eines | der / einer | des ...-(e)s / eines | der / (keiner) |

不定冠词没有复数；表示「一些」时用零冠词，否定时用 keine。

## 什么时候用哪一个

| 情况 | 用法 | 例 |
| :--- | :--- | :--- |
| 首次提到 | 不定冠词 | Ich habe **einen** Hund. |
| 再次提到、双方已知 | 定冠词 | **Der** Hund ist noch jung. |
| 世上独一无二 | 定冠词 | die Sonne, der Mond, die Erde |
| 序数词、最高级之前 | 定冠词 | der erste Tag, der beste Film |
| 表示整个种类 | 定冠词或零冠词复数 | Der Hund ist ein Haustier. / Hunde sind Haustiere. |
| 职业、国籍、宗教作表语 | 零冠词 | Er ist Arzt. Sie ist Deutsche. |
| 物质名词、抽象名词泛指 | 零冠词 | Ich trinke gern Kaffee. Zeit ist Geld. |
| 城市、多数国家名 | 零冠词 | Ich fahre nach Berlin. |
| 阴性、复数或特殊国名 | 定冠词 | die Schweiz, die Türkei, die USA, der Iran |
| 固定短语 | 零冠词 | zu Hause, nach Hause, zu Fuß, mit Absicht |

## 例句

**Auf dem Tisch liegt ein Buch. Das Buch gehört meinem Vater.**
桌上有一本书。这本书是我父亲的。

**Die Schweiz ist ein kleines, aber reiches Land.**
瑞士是一个小而富裕的国家。

**Mein Onkel ist Ingenieur von Beruf.**
我叔叔的职业是工程师。（职业作表语，不用冠词）

**Hast du Hunger? — Ja, ich habe großen Hunger.**
你饿吗？——是的，我很饿。

**Im Sommer fahren wir immer ans Meer.**
夏天我们总是去海边。（in dem 缩合为 im，an das 缩合为 ans）

**Sie spielt seit ihrer Kindheit Klavier.**
她从童年起就弹钢琴。（乐器名前不用冠词，是德语与英语的区别）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Er ist ein Arzt. | Er ist Arzt. | 职业作表语零冠词（除非带形容词：ein guter Arzt） |
| Ich fahre nach der Schweiz. | Ich fahre in die Schweiz. | 带冠词的国名用 in 加第四格 |
| Ich gehe zu Hause.（想说「回家」） | Ich gehe nach Hause. | zu Hause 是「在家」 |
| Ich habe ein Zeit. | Ich habe Zeit. | 抽象名词泛指零冠词 |
"""

EXPANSIONS['介词/介词'] = """
## 支配格速记表

| 支配格 | 介词 |
| :--- | :--- |
| 第四格 A | durch, für, gegen, ohne, um, bis, entlang（后置） |
| 第三格 D | aus, bei, mit, nach, seit, von, zu, gegenüber, ab, außer, entgegen |
| 第三或第四格（方位介词） | an, auf, hinter, in, neben, über, unter, vor, zwischen |
| 第二格 G | während, wegen, trotz, statt, innerhalb, außerhalb, aufgrund, dank（也可第三格） |

方位介词的判定：问 **wohin（往哪儿）用第四格**，问 **wo（在哪儿）用第三格**。

## 介词与冠词的融合形式

| 融合形式 | 还原 | 融合形式 | 还原 |
| :--- | :--- | :--- | :--- |
| am | an dem | im | in dem |
| ans | an das | ins | in das |
| beim | bei dem | vom | von dem |
| zum | zu dem | zur | zu der |
| aufs | auf das | fürs | für das |
| durchs | durch das | ums | um das |

需要强调「这一个」时不融合：**In dem Haus, das du meinst, wohnt niemand.**

## 例句

**Wir gehen durch den Park.**
我们穿过公园。（durch 加第四格）

**Nach dem Essen trinke ich immer einen Espresso.**
饭后我总是喝一杯浓缩咖啡。（nach 加第三格）

**Das Bild hängt an der Wand. — Ich hänge das Bild an die Wand.**
画挂在墙上。——我把画挂到墙上。（wo 用第三格，wohin 用第四格）

**Wegen des schlechten Wetters fällt das Spiel aus.**
由于天气不好，比赛取消。（wegen 加第二格）

**Ich wohne seit zwei Jahren in Hamburg.**
我在汉堡住了两年了。

**Sie fährt mit dem Fahrrad zur Arbeit.**
她骑自行车去上班。
"""

EXPANSIONS['副词/副词'] = """
## 副词的分类

| 类别 | 例词 | 例句 |
| :--- | :--- | :--- |
| 时间 temporal | heute, gestern, bald, sofort, damals, immer | **Ich komme sofort.** 我马上来。 |
| 地点 lokal | hier, dort, oben, links, überall, nirgendwo | **Überall lagen Bücher.** 到处都是书。 |
| 方式 modal | gern, gut, schnell, leider, hoffentlich | **Hoffentlich klappt es.** 但愿成功。 |
| 原因 kausal | deshalb, deswegen, daher, folglich, trotzdem | **Es regnete, deshalb blieben wir zu Hause.** |
| 程度 | sehr, ziemlich, ganz, kaum, besonders | **Das ist besonders wichtig.** 这尤其重要。 |
| 代副词 | dafür, damit, davon, worauf, wovon | **Ich freue mich darauf.** 我很期待。 |

## 副词与形容词的区别

德语的形容词不需要变形就能当状语用（Er läuft schnell.），
所以只有 **不能作定语** 的词才是纯副词：leider, hoffentlich, vielleicht,
sehr, oft, damals, dort, deshalb 等。

* Er ist ein **schneller** Läufer. — 形容词作定语，要变格。
* Er läuft **schnell**. — 同一个词作状语，不变格。
* **Leider** kommt er nicht. — 纯副词，不能说 der leidere Mann。

## 副词的比较级

大多数副词没有比较级；有比较级的多是形容词兼类。少数纯副词有特殊形式：

| 原级 | 比较级 | 最高级 |
| :--- | :--- | :--- |
| gern | lieber | am liebsten |
| bald | eher | am ehesten |
| oft | öfter / häufiger | am häufigsten |
| viel | mehr | am meisten |
| wenig | weniger / minder | am wenigsten |

## 例句

**Ich gehe lieber ins Kino als ins Theater.**
比起剧院我更愿意去电影院。

**Er kommt heute leider nicht.**
他今天很遗憾不能来。

**Wir treffen uns morgen früh dort drüben.**
我们明早在那边碰面。

**Das Konzert war ziemlich lang, aber sehr gut.**
音乐会相当长，但非常精彩。

**Sie hat nicht angerufen, deshalb sind wir hingefahren.**
她没打电话，所以我们就开车过去了。

**Womit kann ich Ihnen helfen? — Damit brauchen Sie sich nicht zu beschäftigen.**
我能帮您什么？——这件事您不必操心。
"""

EXPANSIONS['数词/数词'] = """
## 基数词的书写规则

| 数 | 德语 | 数 | 德语 |
| :--- | :--- | :--- | :--- |
| 0 | null | 20 | zwanzig |
| 1 | eins（作定语 ein） | 21 | einundzwanzig |
| 2 | zwei | 30 | dreißig（唯一写 ß） |
| 3 | drei | 40 | vierzig |
| 7 | sieben | 60 | sechzig（不是 sechszig） |
| 11 | elf | 70 | siebzig（不是 siebenzig） |
| 12 | zwölf | 100 | (ein)hundert |
| 16 | sechzehn（去 s） | 1000 | (ein)tausend |
| 17 | siebzehn（去 en） | 1 000 000 | eine Million（名词，要大写） |

两位数 **先读个位再读十位**：345 读作 dreihundertfünfundvierzig。
100 万以下一律连写成一个词。

## 序数词

| 规则 | 范围 | 例 |
| :--- | :--- | :--- |
| 基数加 -t | 1 至 19 | der zweite, der vierte, der neunzehnte |
| 基数加 -st | 20 以上 | der zwanzigste, der hundertste |
| 不规则 | — | der erste, der dritte, der siebte, der achte |

序数词按形容词变格：**am dritten Mai**、**die zweite Tür rechts**。
阿拉伯数字写序数时要加点：**der 3. Mai**。

## 日期与钟点

| 场合 | 说法 |
| :--- | :--- |
| 今天几号 | Heute ist der 5. März. / Heute haben wir den 5. März. |
| 某天发生 | am 5. März, am Montag, im Mai, im Jahr 2024（或直接 2024） |
| 官方钟点 | 14:30 = vierzehn Uhr dreißig |
| 口语钟点 | 14:30 = halb drei（注意：halb 指向下一个整点） |
| 15 分 | 7:15 = Viertel nach sieben |
| 45 分 | 7:45 = Viertel vor acht |
| 询问 | Wie spät ist es? / Um wie viel Uhr...? |

## 例句

**Ich bin am dritten Oktober neunzehnhundertneunzig geboren.**
我出生于一九九零年十月三日。

**Der Zug fährt um sieben Uhr fünfzehn ab.**
火车七点十五分开。

**Wir treffen uns um halb acht vor dem Kino.**
我们七点半在电影院门前见。

**Das Buch kostet neunzehn Euro neunzig.**
这本书十九欧九十。

**Etwa ein Drittel der Studenten hat die Prüfung bestanden.**
大约三分之一的学生通过了考试。

**Im Jahr 2020 lebten in Deutschland rund 83 Millionen Menschen.**
二零二零年德国约有八千三百万人口。

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich bin in 1990 geboren. | Ich bin 1990 geboren. / im Jahr 1990 | 年份前不加 in |
| halb drei 指 3:30 | halb drei 指 2:30 | halb 指向下一个整点 |
| der ein Mai | der erste Mai | 日期用序数词 |
| einundzwanzig Jahre alt 写成 21 Jahre 时读 zwanzig-eins | einundzwanzig | 个位在前 |
"""

EXPANSIONS['连词/连词'] = """
## 三类连接词，三种语序

德语的连接词按 **对语序的影响** 分三类，这是比按意义分类更实用的分法。

| 类别 | 代表词 | 后面的语序 |
| :--- | :--- | :--- |
| 并列连词 Konjunktion（占 0 位） | und, aber, denn, oder, sondern | 正常主句语序，动词仍在第二位 |
| 连接副词 Konjunktionaladverb（占第一位） | deshalb, trotzdem, dann, außerdem, sonst | 占据前场，动词紧跟其后，主语后移 |
| 从属连词 Subjunktion | weil, dass, wenn, obwohl, damit, nachdem | 引导从句，**变位动词在句末** |

对比同一个意思的三种说法：

* **Es regnete, und wir blieben zu Hause.**（und 不占位）
* **Es regnete, deshalb blieben wir zu Hause.**（deshalb 占第一位，动词第二位）
* **Wir blieben zu Hause, weil es regnete.**（weil 引导从句，动词末位）

## 常用从属连词分类表

| 意义 | 连词 | 例 |
| :--- | :--- | :--- |
| 原因 | weil, da | Ich komme nicht, weil ich krank bin. |
| 让步 | obwohl, obgleich, wenn auch | Obwohl es regnet, gehen wir. |
| 时间 | als, wenn, wann, nachdem, bevor, während, seitdem, bis, sobald | Als ich klein war, ... |
| 条件 | wenn, falls, sofern | Falls es regnet, bleiben wir. |
| 目的 | damit, dass | Ich spare, damit ich reisen kann. |
| 结果 | so dass, sodass | Er sprach leise, so dass niemand ihn hörte. |
| 方式 | indem, ohne dass, statt dass | Man lernt, indem man übt. |
| 比较 | als ob, wie wenn | Er tut, als ob er schliefe. |
| 内容 | dass, ob | Ich weiß, dass du recht hast. |

## sondern 与 aber

* **sondern** 只用于「不是 A 而是 B」，前一句必须含否定：
  **Das ist nicht mein Auto, sondern das Auto meines Bruders.**
  这不是我的车，而是我哥哥的车。
* **aber** 表转折，前句可肯定可否定：
  **Das Auto ist alt, aber es fährt noch gut.**
  这辆车旧了，但还很好开。

## 例句

**Ich lerne Deutsch, denn ich möchte in Deutschland studieren.**
我学德语，因为我想去德国上大学。（denn 不占位，动词仍第二位）

**Ich lerne Deutsch, weil ich in Deutschland studieren möchte.**
同上，但用 weil，动词到句末。

**Entweder du kommst mit, oder du bleibst hier.**
你要么跟着来，要么留在这儿。

**Er hat nicht nur den Text gelesen, sondern ihn auch übersetzt.**
他不仅读了课文，还把它翻译了。

**Sowohl meine Schwester als auch mein Bruder wohnen in Köln.**
我姐姐和我哥哥都住在科隆。

**Beeil dich, sonst verpassen wir den Zug.**
快点，不然我们赶不上火车。
"""

EXPANSIONS['动词/不定式'] = """
## 什么时候要 zu，什么时候不要

| 不带 zu | 带 zu |
| :--- | :--- |
| 情态动词：Ich muss gehen. | 大多数其他动词：Ich hoffe zu kommen. |
| werden（将来时）：Ich werde gehen. | 名词加 sein/haben：Ich habe Lust zu gehen. |
| 感官动词 sehen, hören, fühlen：Ich sehe ihn kommen. | 形容词加 sein：Es ist schwer zu verstehen. |
| lassen：Ich lasse ihn warten. | um / ohne / (an)statt zu |
| 位移动词 gehen, kommen, fahren：Ich gehe schwimmen. | scheinen, pflegen, drohen, versprechen |
| bleiben, helfen, lernen, lehren（可带可不带） | brauchen（否定时口语常省 zu） |

可分动词的 zu 夹在前缀与词干之间：**anzurufen**、**einzukaufen**、**mitzukommen**。

## 三个介词性不定式结构

| 结构 | 意义 | 例句 |
| :--- | :--- | :--- |
| um ... zu | 为了（目的） | **Ich lerne Deutsch, um in Berlin zu studieren.** 我学德语是为了在柏林上学。 |
| ohne ... zu | 没有（本该做而未做） | **Er ging weg, ohne sich zu verabschieden.** 他没道别就走了。 |
| (an)statt ... zu | 而不是 | **Statt zu arbeiten, spielt er den ganzen Tag.** 他整天玩而不工作。 |

三者都要求 **主句与不定式的主语相同**。主语不同时必须改用从句：
um ... zu 换成 damit，ohne ... zu 换成 ohne dass，statt ... zu 换成 statt dass。

* **Ich spare Geld, damit meine Tochter studieren kann.**
  我攒钱，好让我女儿能上大学。（两个主语不同）

## 不定式作主语与宾语

**Es ist nicht leicht, eine neue Sprache zu lernen.**
学一门新语言不容易。（es 是形式主语）

**Ich habe vergessen, das Fenster zu schließen.**
我忘了关窗户。

**Er hat keine Zeit, ins Kino zu gehen.**
他没时间去看电影。

## 例句

**Ich freue mich darauf, dich bald wiederzusehen.**
我很期待很快再见到你。（代副词加不定式）

**Sie scheint müde zu sein.**
她似乎累了。

**Du brauchst nicht zu kommen.**
你不必来。

**Der Zug droht, Verspätung zu haben.**
这趟车恐怕要晚点。

**Er ließ sich die Haare schneiden.**
他去理了发。（lassen 加不带 zu 的不定式）

**Ich höre die Kinder im Garten spielen.**
我听见孩子们在花园里玩。
"""

# ---------------------------------------------------------------------------
# AUTHORED — 名词（Substantiv）
# ---------------------------------------------------------------------------
AUTHORED['名词/名词的复数'] = """
# 名词的复数（Plural）

> CEFR A1 · 关键词：Plural, Pluralendung, Umlaut

德语名词没有像英语那样统一的复数 -s，而是有 **五大类词尾** 外加可能的变音。
复数一律用定冠词 **die**，第三格复数还要在名词后再加 -n。
背单词时必须把复数一起背：**der Tisch, -e** 这种标注方式表示 die Tische。

## 一、五类复数词尾

| 类型 | 词尾 | 典型范围 | 例 |
| :--- | :--- | :--- | :--- |
| 1 | -e（可变音） | 多数阳性、许多中性单音节 | der Tisch → die Tische；die Stadt → die Städte |
| 2 | -(e)n | 几乎所有阴性名词、阳性弱变化 | die Frau → die Frauen；die Blume → die Blumen |
| 3 | -er（尽量变音） | 许多中性、少数阳性 | das Kind → die Kinder；das Buch → die Bücher |
| 4 | 零词尾（可变音） | -er / -el / -en 结尾的阳性与中性 | der Lehrer → die Lehrer；der Vogel → die Vögel |
| 5 | -s | 外来词、缩写、以元音结尾的词 | das Auto → die Autos；der Chef → die Chefs |

## 二、可预测的规则

| 词尾 | 复数 | 例 |
| :--- | :--- | :--- |
| -ung, -heit, -keit, -schaft, -ion, -tät | -en | die Zeitung → die Zeitungen |
| -e（阴性） | -n | die Lampe → die Lampen |
| -in（阴性职业） | -nen（双写 n） | die Lehrerin → die Lehrerinnen |
| -er, -el, -en（阳/中） | 零词尾 | das Fenster → die Fenster |
| -chen, -lein（小词） | 零词尾 | das Mädchen → die Mädchen |
| -um（外来） | -en，去 -um | das Museum → die Museen |
| -a（外来） | -en，去 -a | die Firma → die Firmen |

## 三、第三格复数加 -n

除了本来就以 -n 或 -s 结尾的复数，第三格复数一律再加 -n：

* die Kinder → **mit den Kindern** 和孩子们一起
* die Bücher → **in den Büchern** 在书里
* die Autos → **mit den Autos**（-s 复数不加）
* die Frauen → **mit den Frauen**（已有 -n 不重复）

## 四、只有单数或只有复数的名词

| 只有单数 Singularetantum | 只有复数 Pluraletantum |
| :--- | :--- |
| das Obst 水果、das Gemüse 蔬菜 | die Eltern 父母、die Geschwister 兄弟姐妹 |
| das Geld 钱、die Milch 牛奶 | die Ferien 假期、die Leute 人们 |
| die Polizei 警察（机构） | die Möbel 家具、die Kosten 费用 |
| der Hunger 饥饿、die Liebe 爱 | die Lebensmittel 食品 |

## 五、例句

**Auf dem Tisch liegen drei Bücher.**
桌上放着三本书。

**Die Städte im Süden sind teurer geworden.**
南部的城市变贵了。

**Ich spiele oft mit den Kindern meiner Nachbarn.**
我常和邻居的孩子们玩。

**Alle Lehrerinnen und Lehrer nehmen an der Sitzung teil.**
所有女老师和男老师都参加会议。

**Die Möbel sind schon geliefert worden.**
家具已经送到了。

**Meine Eltern wohnen seit dreißig Jahren in diesem Haus.**
我父母在这栋房子里住了三十年了。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| die Kindern（第一格） | die Kinder | -n 只加在第三格复数 |
| mit den Kinder | mit den Kindern | 第三格复数必须加 -n |
| die Lehrerinen | die Lehrerinnen | -in 变复数双写 n |
| Meine Eltern ist da. | Meine Eltern sind da. | Eltern 只有复数，动词用复数 |
| zwei Informationen 用作「两条信息」时误写 zwei Information | zwei Informationen | 计数时必须用复数 |
"""

AUTHORED['名词/复合名词与构词法'] = """
# 复合名词与构词法（Wortbildung）

> CEFR A2 · 关键词：Kompositum, Grundwort, Bestimmungswort, Nominalisierung

德语可以把任意多的词粘成一个名词，这是德语词汇量看似庞大、实则可推导的原因。
掌握构词法之后，很多「生词」都能拆开读懂。

## 一、复合名词的黄金规则

**最后一个词决定性别和复数**，前面的词只起限定作用。

| 复合词 | 拆分 | 性别与复数 | 汉语 |
| :--- | :--- | :--- | :--- |
| die Haustür | das Haus + die Tür | 随 Tür，阴性，-en | 房门 |
| der Hausschlüssel | das Haus + der Schlüssel | 随 Schlüssel，阳性，零词尾 | 房门钥匙 |
| das Kinderzimmer | die Kinder + das Zimmer | 随 Zimmer，中性 | 儿童房 |
| die Krankenversicherungskarte | krank + Versicherung + Karte | 随 Karte，阴性 | 医保卡 |

读长词的方法：**从右往左读**。Donaudampfschifffahrtsgesellschaft
= Gesellschaft（公司）← Fahrt（航行）← Schiff（船）← Dampf（蒸汽）← Donau（多瑙河）。

## 二、构词的四种手段

| 手段 | 说明 | 例 |
| :--- | :--- | :--- |
| 复合 Komposition | 词加词 | Buch + Laden = der Buchladen |
| 派生 Derivation | 加前后缀 | Freund → die Freundschaft |
| 转化 Konversion | 换词类 | essen → das Essen；leben → das Leben |
| 缩略 Kurzwort | 截短 | die Universität → die Uni；das Automobil → das Auto |

## 三、名词后缀与性别（极高价值）

| 后缀 | 性别 | 意义 | 例 |
| :--- | :--- | :--- | :--- |
| -ung, -heit, -keit, -schaft, -ei, -ion, -tät, -ik, -ur | 阴性 | 抽象名词 | die Bildung, die Freiheit, die Nation |
| -er, -ling, -ismus, -ant, -ent, -or, -us | 阳性 | 行为者、主义 | der Lehrer, der Lehrling, der Kapitalismus |
| -chen, -lein, -tum, -ment, -um, -nis（多数） | 中性 | 小词、集合、外来 | das Mädchen, das Eigentum, das Dokument |
| -ge...-e | 中性 | 集合 | das Gebirge, das Gebäude |

## 四、动词与形容词的名词化

| 来源 | 规则 | 例 |
| :--- | :--- | :--- |
| 不定式 | 加 das，永远中性 | **das Rauchen** ist verboten. 禁止吸烟。 |
| 形容词 | 大写并按形容词变格 | **der Alte**, **eine Deutsche**, **das Beste** |
| 第一分词 | 大写并变格 | **die Studierenden** 在学者 |
| 动词词干 | 常构成阳性 | beginnen → der Beginn；kaufen → der Kauf |

名词化后原来的动词补足语变成 **von 加第三格** 或第二格定语：

* Man liest die Zeitung. → **das Lesen der Zeitung** 读报
* Die Preise steigen. → **das Steigen der Preise** 物价上涨

## 五、例句

**Der Bahnhofsvorplatz wird umgebaut.**
火车站前广场正在改建。

**Das Rauchen ist im ganzen Gebäude verboten.**
整栋楼内禁止吸烟。

**Die Arbeitslosigkeit ist im letzten Jahr gesunken.**
失业率去年下降了。

**Ein Bekannter meines Vaters arbeitet bei der Stadtverwaltung.**
我父亲的一位熟人在市政府工作。

**Nach dem Lesen des Vertrags hatte er noch viele Fragen.**
读完合同后他还有很多问题。

**Die Deutschen trinken viel Kaffee.**
德国人喝很多咖啡。（形容词名词化，按形容词变格）

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| die Hausschlüssel（单数） | der Hausschlüssel | 性别随最后一个词 |
| das Deutsche（指德国人） | der Deutsche / die Deutsche | 名词化形容词要按性别变格 |
| Ich mag das schwimmen. | Ich mag das Schwimmen. | 名词化必须大写 |
| ein Deutscher Mann | ein deutscher Mann | 作定语时是形容词，小写 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 格（Kasus）
# ---------------------------------------------------------------------------
AUTHORED['格/四个格总览'] = """
# 四个格总览（Die vier Kasus）

> CEFR A1 · 关键词：Nominativ, Akkusativ, Dativ, Genitiv

德语用 **格** 来标记名词在句中的角色，词序因此可以自由。
汉语靠语序和介词表达的关系，德语靠冠词和词尾表达。学德语的第一件事，
就是把下面这张表刻进脑子里。

## 一、定冠词与不定冠词总表

| 格 | 提问词 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 第一格 N | wer? was? | der / ein | die / eine | das / ein | die / keine |
| 第四格 A | wen? was? | den / einen | die / eine | das / ein | die / keine |
| 第三格 D | wem? | dem / einem | der / einer | dem / einem | den ...-n / keinen |
| 第二格 G | wessen? | des ...-(e)s | der / einer | des ...-(e)s | der / keiner |

只有 **阳性单数** 在四个格里长得都不一样，这就是为什么练习总是用 der Mann。
阴性和复数的第一格与第四格永远同形。

## 二、四个格各自的职责

| 格 | 核心职责 | 例 |
| :--- | :--- | :--- |
| 第一格 | 主语、系动词的表语 | **Der Lehrer** ist **mein Freund**. |
| 第四格 | 直接宾语、时间段、特定介词 | Ich sehe **den Lehrer**. |
| 第三格 | 间接宾语、许多动词的唯一宾语、特定介词 | Ich helfe **dem Lehrer**. |
| 第二格 | 所属关系、少数介词与动词 | das Buch **des Lehrers** |

## 三、判断格的三步法

1. 先找变位动词，问 **wer oder was?** 得到第一格主语。
2. 再看这个动词要求什么补足语：查词典标注 **jn.（第四格）/ jm.（第三格）**。
   德语词典用 jn. = jemanden（第四格）、jm. = jemandem（第三格）、
   js. = jemandes（第二格）、etw. = etwas。
3. 若名词前有介词，格由 **介词** 决定，动词管不着。

## 四、人称代词四格表

| N | ich | du | er | sie | es | wir | ihr | sie/Sie |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| A | mich | dich | ihn | sie | es | uns | euch | sie/Sie |
| D | mir | dir | ihm | ihr | ihm | uns | euch | ihnen/Ihnen |

## 五、例句

**Der Mann gibt dem Kind einen Apfel.**
那个男人给孩子一个苹果。（三个格同时出现：N 主语、D 间接宾语、A 直接宾语）

**Den Film kenne ich nicht.**
这部电影我不认识。（第四格提到句首，格标记保证意思不乱）

**Wem gehört diese Tasche?**
这个包是谁的？（gehören 支配第三格）

**Das ist das Auto meines Bruders.**
这是我哥哥的车。（第二格表所属）

**Ich danke Ihnen für Ihre Hilfe.**
谢谢您的帮助。（danken 加第三格，für 加第四格）

**Wegen des Regens bleiben wir zu Hause.**
因为下雨我们待在家里。（wegen 加第二格）

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich helfe dich. | Ich helfe dir. | helfen 支配第三格，不能按汉语「帮你」直译 |
| Ich sehe der Mann. | Ich sehe den Mann. | 第四格阳性用 den |
| Das ist für ich. | Das ist für mich. | für 加第四格，代词也要变 |
| Ich gebe das Buch der Frau ihr. | Ich gebe der Frau das Buch. | 不要既说名词又说代词 |
"""

AUTHORED['格/第一格'] = """
# 第一格 Nominativ

> CEFR A1 · 关键词：Nominativ, Subjekt, Prädikativ

第一格是词典里的原形，回答 **wer?（谁）** 或 **was?（什么）**。

## 一、三种用法

| 用法 | 说明 | 例 |
| :--- | :--- | :--- |
| 主语 | 每个完整句子必须有 | **Der Zug** kommt gleich. |
| 系动词表语 | sein, werden, bleiben, heißen 之后 | Er ist **ein guter Arzt**. |
| 同位语与称呼 | 与所指成分同格 | **Herr Müller**, kommen Sie bitte! |

sein / werden / bleiben / heißen / scheinen 是 **等号动词**，
等号两边都是第一格，这一点和英语一致，但和汉语的语感不同。

## 二、主语的三种形态

* 名词短语：**Meine kleine Schwester** spielt Klavier.
* 代词：**Sie** spielt Klavier.
* 从句或不定式（此时常用 es 占位）：
  **Dass du gekommen bist**, freut mich. 你来了，我很高兴。
  **Es** freut mich, **dass du gekommen bist**.

## 三、主谓一致

| 主语 | 动词 | 例 |
| :--- | :--- | :--- |
| 单数 | 单数 | Das Kind spielt. |
| 复数 | 复数 | Die Kinder spielen. |
| A und B | 复数 | Mein Vater und meine Mutter arbeiten. |
| 集合名词（die Polizei, die Familie） | 单数 | Die Polizei sucht den Täter. |
| 数量表达 eine Million Menschen | 常用单数 | Eine Million Menschen lebt hier. |

## 四、例句

**Der neue Kollege heißt Thomas Weber.**
新同事叫托马斯 · 韦伯。

**Meine Schwester wird Ärztin.**
我妹妹要当医生。（werden 后接第一格）

**Wer hat angerufen? — Ein Kollege von mir.**
谁打的电话？——我的一个同事。

**Das Wichtigste ist die Gesundheit.**
最重要的是健康。（名词化形容词作主语）

**Es waren nur wenige Leute da.**
只来了很少的人。（es 是形式主语，真正主语是 wenige Leute，动词随其变复数）

**Bleib bitte mein Freund!**
请你继续做我的朋友。（bleiben 后接第一格）

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Er ist einen guten Arzt. | Er ist ein guter Arzt. | sein 后用第一格 |
| Das ist mich. | Das bin ich. | 表语用第一格，且动词随代词变位 |
| Die Polizei suchen den Täter. | Die Polizei sucht den Täter. | 集合名词用单数 |
| Mein Vater und Mutter arbeitet. | Mein Vater und meine Mutter arbeiten. | 并列主语用复数 |
"""

AUTHORED['格/第四格'] = """
# 第四格 Akkusativ

> CEFR A1 · 关键词：Akkusativ, direktes Objekt, transitives Verb

第四格回答 **wen?（谁，宾语）** 或 **was?**，是德语中最常见的宾语格。
它的唯一形态变化在阳性：der 变 den、ein 变 einen。

## 一、四种触发第四格的情形

| 触发 | 例 |
| :--- | :--- |
| 及物动词的直接宾语 | Ich lese **einen Roman**. |
| 支配第四格的介词 durch, für, gegen, ohne, um, bis, entlang | Das Geschenk ist **für dich**. |
| 方位介词表方向（wohin?） | Ich lege das Buch **auf den Tisch**. |
| 时间段、重复、度量的状语 | Ich bleibe **einen Monat**. Es ist **einen Meter** lang. |

## 二、高频及物动词

| 动词 | 汉语 | 例 |
| :--- | :--- | :--- |
| haben | 有 | Ich habe einen Bruder. |
| sehen | 看见 | Siehst du den Turm? |
| brauchen | 需要 | Wir brauchen einen Termin. |
| kennen | 认识 | Kennst du diesen Mann? |
| lieben, mögen | 爱、喜欢 | Sie liebt ihren Beruf. |
| suchen, finden | 找、找到 | Er sucht seinen Schlüssel. |
| besuchen | 拜访 | Ich besuche meinen Onkel. |
| fragen | 问（人） | Frag den Lehrer! |
| anrufen | 打电话给 | Ich rufe dich an. |

注意最后三个：汉语里带「向、给」的意思，德语却是 **第四格**，
必须专门记：**jn. fragen、jn. anrufen、jn. besuchen**。

## 三、时间与度量的第四格

* **Ich habe den ganzen Tag gearbeitet.** 我工作了一整天。
* **Wir fahren jedes Jahr nach Italien.** 我们每年去意大利。
* **Der Schrank ist einen Meter breit.** 柜子一米宽。
* **Letzten Montag war ich in Bonn.** 上周一我在波恩。

## 四、例句

**Ich habe gestern einen interessanten Film gesehen.**
我昨天看了一部有意思的电影。

**Kannst du mich bitte morgen anrufen?**
你明天能给我打个电话吗？

**Er stellt die Flasche auf den Tisch.**
他把瓶子放到桌上。（方向，第四格）

**Ohne deinen Rat hätte ich das nicht geschafft.**
没有你的建议我做不成这件事。

**Wir warten schon eine Stunde auf den Bus.**
我们已经等公交车一个小时了。

**Diese Straße entlang findest du eine Apotheke.**
沿着这条街你能找到一家药店。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich frage dir. | Ich frage dich. | fragen 支配第四格 |
| Ich rufe dir an. | Ich rufe dich an. | anrufen 支配第四格 |
| Ich lege das Buch auf dem Tisch. | ... auf den Tisch. | 有方向，用第四格 |
| Ich bleibe für einen Monat. | Ich bleibe einen Monat. | 时间段不加介词 |
"""

AUTHORED['格/第三格'] = """
# 第三格 Dativ

> CEFR A1 · 关键词：Dativ, indirektes Objekt, Dativverb

第三格回答 **wem?（给谁、对谁）**，标记「受益者、感受者、接收者」。
它是中国学习者出错最多的格，因为汉语没有对应的标记。

## 一、五种触发第三格的情形

| 触发 | 例 |
| :--- | :--- |
| 双宾语动词的间接宾语（人） | Ich gebe **dem Kind** einen Apfel. |
| 只支配第三格的动词 | Ich helfe **dir**. |
| 支配第三格的介词 aus, bei, mit, nach, seit, von, zu, gegenüber | Ich fahre **mit dem Bus**. |
| 方位介词表位置（wo?） | Das Buch liegt **auf dem Tisch**. |
| 支配第三格的形容词 | Das ist **mir** zu teuer. |

## 二、必须背的第三格动词

| 动词 | 汉语 | 例句 |
| :--- | :--- | :--- |
| helfen | 帮助 | Kannst du mir helfen? |
| danken | 感谢 | Ich danke dir. |
| gehören | 属于 | Das Buch gehört meiner Schwester. |
| gefallen | 使喜欢 | Die Stadt gefällt mir. |
| schmecken | 好吃 | Der Kuchen schmeckt uns. |
| passen | 合适 | Der Termin passt mir nicht. |
| antworten | 回答（人） | Antworte mir bitte! |
| folgen | 跟随 | Der Hund folgt seinem Herrn. |
| glauben（人） | 相信某人 | Ich glaube dir. |
| begegnen | 遇到 | Ich bin ihm gestern begegnet. |
| gratulieren | 祝贺 | Wir gratulieren dir zum Geburtstag. |
| zuhören | 倾听 | Hör mir bitte zu! |
| widersprechen | 反驳 | Er widerspricht seinem Chef. |
| vertrauen | 信任 | Sie vertraut ihren Kollegen. |
| fehlen | 缺少、想念 | Du fehlst mir. 我想你。 |

## 三、第三格的特殊味道

德语常用第三格表达「对我来说」这种主观感受，汉语要靠上下文翻译：

* **Mir ist kalt.** 我觉得冷。（不是 Ich bin kalt，那是「我这个人冷酷」）
* **Wie geht es dir?** 你好吗？
* **Das ist mir egal.** 我无所谓。
* **Er hat sich den Arm gebrochen.** 他摔断了胳膊。（所属第三格）
* **Sie wäscht dem Kind die Hände.** 她给孩子洗手。（身体部位用定冠词加第三格）

## 四、例句

**Der Film hat mir sehr gut gefallen.**
这部电影我非常喜欢。

**Meinem Bruder gehört das rote Auto vor der Tür.**
门前那辆红车是我哥哥的。

**Nach dem Unterricht gehe ich zum Arzt.**
下课后我去看医生。（nach 与 zu 都加第三格）

**Kannst du deiner Schwester bei den Hausaufgaben helfen?**
你能帮你妹妹做作业吗？

**Mir tut der Kopf weh.**
我头疼。

**Dem Kind ist schlecht geworden.**
孩子感到不舒服了。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich helfe dich. | Ich helfe dir. | helfen 永远第三格 |
| Ich bin kalt. | Mir ist kalt. | 表体感用第三格 |
| Ich gratuliere dich. | Ich gratuliere dir. | gratulieren 加第三格 |
| mit den Kinder | mit den Kindern | 第三格复数加 -n |
| Ich glaube dich.（指相信你说的话） | Ich glaube dir. | 相信人用第三格 |
"""

AUTHORED['格/第二格'] = """
# 第二格 Genitiv

> CEFR A2 · 关键词：Genitiv, Possessiv, Genitivpräposition

第二格回答 **wessen?（谁的）**，主要表示所属关系，相当于英语的 of 或 -'s。
它在口语中正在退化（常被 von 加第三格替代），但在书面语、正式文体和
固定介词搭配中不可缺少。

## 一、形式

| 性 | 冠词 | 名词词尾 | 例 |
| :--- | :--- | :--- | :--- |
| 阳性 | des / eines | 加 -(e)s | des Mannes, des Lehrers |
| 中性 | des / eines | 加 -(e)s | des Kindes, des Autos |
| 阴性 | der / einer | 不变 | der Frau |
| 复数 | der | 不变 | der Kinder |

单音节名词多加 -es（des Mannes, des Kindes），多音节加 -s（des Lehrers）。
名词第二格 **放在被限定的名词之后**：das Auto **meines Vaters**。
人名的第二格则放前面并加 -s，不加撇号：**Annas Buch**、**Thomas' Buch**（以 s 结尾）。

## 二、支配第二格的介词

| 介词 | 汉语 | 例 |
| :--- | :--- | :--- |
| wegen | 因为 | wegen des schlechten Wetters |
| während | 在……期间 | während der Ferien |
| trotz | 尽管 | trotz des Regens |
| (an)statt | 代替 | statt eines Geschenks |
| innerhalb / außerhalb | 在……之内 / 之外 | innerhalb einer Woche |
| aufgrund / infolge | 由于 / 因……结果 | aufgrund der neuen Regel |
| angesichts | 鉴于 | angesichts der Lage |
| hinsichtlich / bezüglich | 关于 | bezüglich Ihrer Anfrage |

口语里这些介词常改用第三格（wegen dem Wetter），书面语请坚持第二格。

## 三、支配第二格的动词与形容词（数量很少，但很正式）

| 词 | 例句 |
| :--- | :--- |
| sich erinnern（书面） | Ich erinnere mich seiner Worte. |
| bedürfen 需要 | Das bedarf keiner Erklärung. |
| gedenken 纪念 | Wir gedenken der Opfer. |
| beschuldigen, verdächtigen 指控 | Man beschuldigt ihn des Diebstahls. |
| sicher, bewusst, würdig, fähig | Ich bin mir dessen bewusst. |

## 四、口语替代：von 加第三格

* 书面：**die Meinung des Autors** → 口语：**die Meinung von dem Autor**
* 无冠词的复数必须用 von：**der Preis von Büchern**（不能说 der Preis Bücher）
* 地名后也常用 von：**die Kirche von Notre-Dame**

## 五、例句

**Das ist das Haus meiner Großeltern.**
这是我祖父母的房子。

**Während des Studiums hat sie in einem Café gearbeitet.**
上大学期间她在一家咖啡馆打工。

**Trotz seiner Erkältung ist er zur Arbeit gegangen.**
尽管感冒了，他还是去上班了。

**Der Titel des Buches ist mir entfallen.**
这本书的标题我忘了。

**Innerhalb eines Monats müssen Sie antworten.**
您必须在一个月内答复。

**Die Zahl der Studierenden ist gestiegen.**
在学人数上升了。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| das Auto von mein Vater | das Auto meines Vaters / von meinem Vater | von 后必须第三格 |
| Anna's Buch | Annas Buch | 德语所有格不加撇号 |
| des Frau | der Frau | 阴性第二格是 der |
| wegen dem Regen（正式文体） | wegen des Regens | 书面语用第二格 |
| des Kind | des Kindes | 阳性中性第二格名词要加 -(e)s |
"""

AUTHORED['格/支配第三格的动词'] = """
# 支配第三格的动词与形容词

> CEFR A2 · 关键词：Dativverb, Dativergänzung

这一条目把「必须背」的第三格搭配集中起来。判断标准很简单：
如果一个动词 **只有一个宾语，而这个宾语是第三格**，它就是第三格动词。
汉语翻译完全帮不上忙，只能整体记忆。

## 一、按语义分组记忆

| 语义组 | 动词 | 例句 |
| :--- | :--- | :--- |
| 帮助与伤害 | helfen, nützen, schaden, dienen | **Rauchen schadet der Gesundheit.** 吸烟有害健康。 |
| 喜欢与合适 | gefallen, schmecken, passen, stehen（衣服合身） | **Das Kleid steht dir gut.** 这条裙子很配你。 |
| 归属 | gehören, entsprechen, ähneln, gleichen | **Der Plan entspricht unseren Erwartungen.** |
| 交际 | antworten, danken, gratulieren, zuhören, zustimmen, widersprechen, drohen, befehlen, raten, verzeihen | **Ich rate dir, früher zu kommen.** |
| 相遇与跟随 | begegnen, folgen, sich nähern, ausweichen | **Ich bin ihr im Supermarkt begegnet.** |
| 信任与相信 | vertrauen, glauben（人）, imponieren | **Er vertraut seinen Freunden.** |
| 缺失与出现 | fehlen, auffallen, einfallen, gelingen, passieren | **Mir fällt sein Name nicht ein.** 我想不起他的名字。 |

## 二、gelingen / passieren / fehlen 型：主语是事，人用第三格

这一组最容易出错，因为汉语的主语在德语里变成了第三格：

* **Der Kuchen ist mir gut gelungen.** 我这个蛋糕做得很成功。
* **Was ist dir passiert?** 你出什么事了？
* **Mir fehlt ein Wort.** 我少一个词。
* **Das ist mir gestern aufgefallen.** 这是我昨天注意到的。

## 三、支配第三格的形容词

| 形容词 | 例句 |
| :--- | :--- |
| ähnlich 相似 | **Er ist seinem Vater sehr ähnlich.** |
| dankbar 感激 | **Ich bin dir sehr dankbar.** |
| bekannt 熟知 | **Der Name ist mir bekannt.** |
| klar 清楚 | **Ist dir das klar?** |
| peinlich 尴尬 | **Das ist mir peinlich.** |
| wichtig, egal, möglich, leicht, schwer | **Diese Frage ist mir sehr wichtig.** |
| treu, überlegen, böse | **Sie ist ihm nicht böse.** |

## 四、既可第三格又可第四格的动词（意义不同）

| 动词 | 加第三格 | 加第四格 |
| :--- | :--- | :--- |
| glauben | jm. glauben 相信某人 | etw. glauben 相信某事 |
| folgen | jm. folgen 跟随某人 | 无（用 auf etw. folgen 表随后发生） |
| stehen | jm. stehen 适合某人 | 无 |
| kosten | jn. Zeit kosten 花费某人时间（第四格） | — |

## 五、例句

**Kannst du mir bitte bei dieser Aufgabe helfen?**
你能帮我做这道题吗？

**Der neue Chef imponiert allen Mitarbeitern.**
新老板让所有员工佩服。

**Diese Jacke passt mir nicht mehr.**
这件夹克我穿不下了。

**Ich danke Ihnen herzlich für die Einladung.**
衷心感谢您的邀请。

**Es ist mir gelungen, einen Termin zu bekommen.**
我成功约到了一个时间。

**Widersprich deinen Eltern nicht ständig!**
别老是顶撞你父母！

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich danke dich. | Ich danke dir. | danken 加第三格 |
| Das Kleid passt dich. | Das Kleid passt dir. | passen 加第三格 |
| Ich bin ähnlich meinen Vater. | Ich bin meinem Vater ähnlich. | ähnlich 加第三格，且形容词后置 |
| Ich habe den Test gelungen. | Der Test ist mir gelungen. | gelingen 的主语是事，且用 sein 构成完成时 |
"""

AUTHORED['格/双宾语顺序'] = """
# 双宾语的顺序（Dativ und Akkusativ）

> CEFR A2 · 关键词：Wortstellung, Dativobjekt, Akkusativobjekt, Pronomen

geben, schenken, zeigen, erklären, schicken, bringen, empfehlen, kaufen,
leihen, verkaufen, erzählen 这类动词同时带 **第三格（人）** 和 **第四格（物）**，
两个宾语谁在前，由「是不是代词」决定，不是由格决定。

## 一、三条铁律

| 情况 | 顺序 | 例 |
| :--- | :--- | :--- |
| 两个都是名词 | 第三格在前 | Ich gebe **dem Kind das Buch**. |
| 一个是代词 | **代词永远在前** | Ich gebe **es dem Kind**. / Ich gebe **ihm das Buch**. |
| 两个都是代词 | 第四格在前 | Ich gebe **es ihm**. |

一句话记忆：**代词优先，两个代词时第四格优先。**

## 二、完整推演

以 Ich schenke meiner Mutter einen Ring.（我送我妈一枚戒指）为例：

| 替换 | 句子 |
| :--- | :--- |
| 都是名词 | Ich schenke **meiner Mutter einen Ring**. |
| 物换成代词 | Ich schenke **ihn meiner Mutter**. |
| 人换成代词 | Ich schenke **ihr einen Ring**. |
| 都换成代词 | Ich schenke **ihn ihr**. |

## 三、代词与句首成分

代词宾语紧跟变位动词，甚至可以插到主语之前（当主语也是名词时）：

* **Gestern hat mir mein Bruder das Auto geliehen.**
  昨天我哥哥把车借给了我。（代词 mir 抢在名词主语前面）
* **Gestern hat es mir mein Bruder geliehen.**

## 四、只带第四格的相似动词

fragen, kosten, lehren, nennen 带两个 **第四格**：

* **Er fragt mich etwas.** 他问我一件事。
* **Das kostet mich viel Zeit.** 这花了我很多时间。
* **Wir nennen ihn einen Helden.** 我们称他为英雄。

## 五、例句

**Zeig mir bitte deinen Ausweis!**
请把证件给我看一下。

**Können Sie mir ein gutes Restaurant empfehlen?**
您能给我推荐一家好餐馆吗？

**Ich habe es ihr schon dreimal erklärt.**
我已经给她解释了三遍。

**Meine Großmutter hat mir diese Geschichte oft erzählt.**
我奶奶经常给我讲这个故事。

**Schick es mir bitte per E-Mail!**
请把它用邮件发给我。

**Der Verkäufer hat dem Kunden den Vertrag gezeigt.**
售货员把合同给顾客看了。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich gebe dem Kind es. | Ich gebe es dem Kind. | 代词优先 |
| Ich gebe ihm es. | Ich gebe es ihm. | 两个代词时第四格在前 |
| Ich zeige das Buch dem Lehrer.（中性语境） | Ich zeige dem Lehrer das Buch. | 两个名词时第三格在前 |
| Er fragt mir. | Er fragt mich. | fragen 加第四格 |
"""

AUTHORED['格/支配第二格的词'] = """
# 支配第二格的动词与形容词

> CEFR B2 · 关键词：Genitivverb, Genitivattribut, gehobener Stil

支配第二格的动词属于书面、正式、法律和文学语体。数量不多，
但在阅读报刊和考试写作中出现频率很高，值得单独整理。

## 一、支配第二格的动词

| 动词 | 汉语 | 例句 |
| :--- | :--- | :--- |
| bedürfen | 需要 | **Der Antrag bedarf der Zustimmung des Vorstands.** 申请需要董事会同意。 |
| gedenken | 纪念 | **Wir gedenken der Opfer des Krieges.** 我们纪念战争的受害者。 |
| sich erfreuen | 享有 | **Er erfreut sich bester Gesundheit.** 他身体极好。 |
| sich bedienen | 使用 | **Sie bediente sich eines Tricks.** 她使了个花招。 |
| sich rühmen | 自夸 | **Die Firma rühmt sich ihrer Tradition.** |
| sich annehmen | 关照 | **Er nahm sich des Problems an.** 他管起了这个问题。 |
| sich schämen | 羞愧 | **Ich schäme mich meines Fehlers.** |
| beschuldigen, anklagen, verdächtigen, überführen | 指控、定罪 | **Man klagte ihn des Betrugs an.** |
| entheben, berauben, würdigen | 解除、剥夺、认为值得 | **Er wurde seines Amtes enthoben.** |

法律语体里，被指控的罪名一律用第二格：**des Mordes angeklagt**、
**des Diebstahls verdächtig**。

## 二、支配第二格的形容词

| 形容词 | 例句 |
| :--- | :--- |
| sicher 确信 | **Ich bin mir meiner Sache sicher.** |
| bewusst 意识到 | **Er war sich der Gefahr nicht bewusst.** |
| würdig 配得上 | **Das ist einer Erwähnung würdig.** |
| fähig 有能力 | **Er ist keiner Lüge fähig.** |
| verdächtig 有嫌疑 | **Sie ist des Diebstahls verdächtig.** |
| müde 厌倦 | **Ich bin des Wartens müde.** |
| schuldig 有罪 | **Das Gericht sprach ihn des Betrugs schuldig.** |

## 三、第二格的其他句法功能

| 功能 | 例 |
| :--- | :--- |
| 定语（最常见） | die Farbe **des Autos** |
| 分量表达 | eine Tasse **starken Kaffees**（书面） |
| 时间状语 | **eines Tages** 有一天、**eines Morgens** 某天早上 |
| 固定副词 | **meines Erachtens** 依我看、**allen Ernstes** 一本正经地 |

## 四、例句

**Eines Tages wirst du mir dankbar sein.**
总有一天你会感谢我的。

**Der Angeklagte wurde des Betrugs für schuldig befunden.**
被告被判诈骗罪成立。

**Meines Erachtens ist der Vorschlag nicht realistisch.**
依我看这个建议不现实。

**Wir gedenken heute der Gründung unserer Universität.**
今天我们纪念本校建校。

**Er erfreut sich großer Beliebtheit unter den Studenten.**
他在学生中很受欢迎。

**Ich bin mir dessen durchaus bewusst.**
这一点我完全清楚。（dessen 是 das 的第二格）

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich bedarf Hilfe. | Ich bedarf der Hilfe. | bedürfen 加第二格 |
| Ich bin mir das bewusst. | Ich bin mir dessen bewusst. | 指示代词第二格是 dessen |
| Er wurde des Mord angeklagt. | Er wurde des Mordes angeklagt. | 阳性第二格加 -es |
| eines Tag | eines Tages | 固定时间状语的第二格形式 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 冠词与限定词
# ---------------------------------------------------------------------------
AUTHORED['冠词/定冠词用法'] = """
# 定冠词的用法（bestimmter Artikel）

> CEFR A1 · 关键词：der, die, das, Definitheit

定冠词 der / die / das 表示「说话双方都知道是哪一个」。
它比英语 the 出现得更频繁：德语在许多英语用零冠词的地方仍要用定冠词。

## 一、必须用定冠词的场合

| 场合 | 例 | 汉语 |
| :--- | :--- | :--- |
| 上文提过 | Ich sehe einen Hund. **Der Hund** ist groß. | 我看见一条狗。这条狗很大。 |
| 情景中唯一 | Mach bitte **die Tür** zu. | 请把门关上。 |
| 世上唯一 | **die Sonne**, **der Mond**, **die Welt** | 太阳、月亮、世界 |
| 序数与最高级 | **der erste Versuch**, **das beste Ergebnis** | 第一次尝试、最好的结果 |
| 泛指整个种类 | **Der Hund** ist ein treues Tier. | 狗是忠诚的动物。 |
| 抽象名词被限定 | **die Liebe zur Musik** | 对音乐的爱 |
| 日期、季节、月份、星期 | **im** Sommer, **am** Montag, **im** Mai | 夏天、周一、五月 |
| 河流、山脉、湖泊 | **der Rhein**, **die Alpen**, **der Bodensee** | 莱茵河、阿尔卑斯山 |
| 阴性、阳性、复数国名 | **die Schweiz**, **der Iran**, **die USA** | 瑞士、伊朗、美国 |
| 身体部位（代替物主冠词） | Er wäscht sich **die Hände**. | 他洗手。 |
| 街道、广场 | Ich wohne in **der Goethestraße**. | 我住在歌德街。 |

## 二、与介词的融合

**am**（an dem）、**im**（in dem）、**zum**（zu dem）、**zur**（zu der）、
**beim**（bei dem）、**vom**（von dem）、**ans**（an das）、**ins**（in das）。

融合形式是常态；只有强调「就是那一个」时才拆开：
**Ich gehe in das Haus, das du gebaut hast.**

## 三、例句

**Die Sonne scheint heute den ganzen Tag.**
今天太阳照了一整天。

**Der Zug nach Hamburg fährt von Gleis 7 ab.**
去汉堡的火车在七号站台发车。

**Im Winter fahren wir gern in die Alpen.**
冬天我们喜欢去阿尔卑斯山。

**Das Leben in der Stadt ist teuer, aber bequem.**
城市生活贵，但方便。

**Er hat sich beim Sport das Knie verletzt.**
他运动时伤了膝盖。

**Die Schweiz liegt zwischen Deutschland, Frankreich und Italien.**
瑞士位于德国、法国和意大利之间。

## 四、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich fahre nach Schweiz. | Ich fahre in die Schweiz. | 带冠词的国名用 in 加第四格 |
| in Sommer | im Sommer | 季节要与 in dem 融合 |
| Er wäscht seine Hände. | Er wäscht sich die Hände. | 身体部位用反身加定冠词 |
| Ich spiele die Fußball. | Ich spiele Fußball. | 球类运动零冠词 |
"""

AUTHORED['冠词/不定冠词与零冠词'] = """
# 不定冠词与零冠词（unbestimmter Artikel und Nullartikel）

> CEFR A1 · 关键词：ein, eine, Nullartikel, Stoffname

## 一、不定冠词 ein 的变格

| 格 | 阳性 | 阴性 | 中性 |
| :--- | :--- | :--- | :--- |
| N | ein | eine | ein |
| A | einen | eine | ein |
| D | einem | einer | einem |
| G | eines | einer | eines |

不定冠词 **没有复数**。「一些书」就说 **Bücher**，否定则用 **keine Bücher**。
mein, dein, sein, ihr, unser, euer, kein 与 ein 变格完全相同，合称 ein 类限定词。

## 二、什么时候用不定冠词

| 场合 | 例 |
| :--- | :--- |
| 第一次提到 | Ich habe **einen Termin** beim Arzt. |
| 归类（属于某一类） | Das ist **ein Werkzeug**. 这是一种工具。 |
| 带形容词的表语 | Er ist **ein guter Lehrer**. |
| 表示「任何一个」 | **Ein Kind** braucht Liebe. |

## 三、必须用零冠词的场合

| 场合 | 例 | 注意 |
| :--- | :--- | :--- |
| 职业、国籍、宗教、身份作表语 | Sie ist **Ärztin**. Er wird **Lehrer**. | 加形容词则要冠词：eine gute Ärztin |
| 物质名词泛指 | Ich trinke **Tee**. Wir brauchen **Geld**. | |
| 抽象名词泛指 | **Zeit** ist Geld. Er hat **Hunger**. | |
| 复数的不定指 | Auf dem Tisch liegen **Bücher**. | |
| 多数城市与国名 | Ich fliege nach **Berlin**, nach **Japan**. | |
| 度量与数量之后 | ein Glas **Wasser**, zwei Kilo **Reis** | |
| 固定短语 | zu **Hause**, mit **Absicht**, zu **Fuß**, in **Ordnung** | |
| 标题、告示、电报体 | **Zimmer** frei. **Vorsicht**, **Stufe**! | |

## 四、ein 与零冠词的对比

* **Er ist Student.** 他是大学生。（身份）
* **Er ist ein fleißiger Student.** 他是个勤奋的大学生。（带形容词）
* **Ich trinke Kaffee.** 我喝咖啡。（泛指物质）
* **Ich trinke einen Kaffee.** 我喝一杯咖啡。（一份，可数）

## 五、例句

**Ich suche eine Wohnung mit Balkon.**
我在找一套带阳台的房子。

**Meine Schwester ist Ingenieurin bei Siemens.**
我妹妹是西门子的工程师。

**Hast du Zeit für einen Kaffee?**
你有时间喝杯咖啡吗？

**Zum Frühstück esse ich Brot mit Butter.**
早餐我吃黄油面包。

**Er hat Angst vor Hunden.**
他怕狗。

**Als Kind wollte ich Pilot werden.**
小时候我想当飞行员。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Er ist ein Lehrer. | Er ist Lehrer. | 职业作表语零冠词 |
| Ich habe eine Zeit. | Ich habe Zeit. | 抽象名词泛指零冠词 |
| Ich kaufe eine Bücher. | Ich kaufe Bücher. | ein 没有复数 |
| Ich gehe zu die Schule. | Ich gehe zur Schule. | 固定搭配与融合形式 |
"""

AUTHORED['冠词/否定冠词kein'] = """
# 否定冠词 kein 与否定词 nicht

> CEFR A1 · 关键词：kein, nicht, Negation

德语的否定分工非常明确：**否定名词用 kein，否定其他一切用 nicht。**

## 一、kein 的变格（与 ein 相同，但有复数）

| 格 | 阳性 | 阴性 | 中性 | 复数 |
| :--- | :--- | :--- | :--- | :--- |
| N | kein | keine | kein | keine |
| A | keinen | keine | kein | keine |
| D | keinem | keiner | keinem | keinen |
| G | keines | keiner | keines | keiner |

## 二、用 kein 还是 nicht

| 被否定的成分 | 用 | 例 |
| :--- | :--- | :--- |
| 带不定冠词的名词 | kein | Ich habe **einen** Hund. → Ich habe **keinen** Hund. |
| 零冠词的名词 | kein | Ich trinke Bier. → Ich trinke **kein** Bier. |
| 带定冠词的名词 | nicht | Ich kenne **den** Mann **nicht**. |
| 带物主冠词的名词 | nicht | Das ist **nicht** mein Auto. |
| 动词、形容词、副词 | nicht | Er kommt **nicht**. Es ist **nicht** teuer. |
| 专有名词 | nicht | Das ist **nicht** Berlin. |

## 三、nicht 的位置

| 规则 | 例 |
| :--- | :--- |
| 全句否定：尽量靠后，但在句框成分之前 | Ich habe das Buch **nicht** gelesen. |
| 在表语形容词之前 | Der Film war **nicht** interessant. |
| 在方向补足语之前 | Ich fahre **nicht** nach Berlin. |
| 在可分前缀之前 | Ich rufe dich **nicht** an. |
| 部分否定：紧挨被否定的成分 | **Nicht** ich habe das gesagt, sondern er. |

## 四、其他否定手段

| 词 | 意义 | 例 |
| :--- | :--- | :--- |
| niemand | 没有人 | **Niemand** war zu Hause. |
| nichts | 什么也没有 | Ich habe **nichts** gehört. |
| nie / niemals | 从不 | Er kommt **nie** pünktlich. |
| nirgendwo / nirgends | 哪儿都不 | Ich finde ihn **nirgends**. |
| noch nicht / nicht mehr | 还没 / 不再 | Ich bin **noch nicht** fertig. Er raucht **nicht mehr**. |
| kein ... mehr | 不再有 | Ich habe **kein** Geld **mehr**. |

德语 **不用双重否定** 表示否定加强：Ich habe nichts gesehen.（不能加 nicht）。

## 五、例句

**Ich habe heute keine Zeit.**
我今天没时间。

**Das Fahrrad gehört mir nicht.**
这辆自行车不是我的。

**Er hat mir noch nicht geantwortet.**
他还没回复我。

**Es gibt hier keinen Supermarkt mehr.**
这里已经没有超市了。

**Nicht alle Studenten haben bestanden.**
不是所有学生都通过了。（部分否定）

**Niemand konnte mir helfen.**
没有人能帮我。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe nicht ein Auto. | Ich habe kein Auto. | 不定冠词的名词用 kein |
| Ich kenne kein den Mann. | Ich kenne den Mann nicht. | 定冠词名词用 nicht |
| Ich habe nichts nicht gesagt. | Ich habe nichts gesagt. | 不用双重否定 |
| Ich nicht komme. | Ich komme nicht. | nicht 不能放在变位动词前 |
"""

AUTHORED['冠词/der类限定词'] = """
# der 类限定词（dieser, jeder, welcher, alle ...）

> CEFR A2 · 关键词：Demonstrativartikel, Determinativ, dieser-Wörter

这一类词的词尾与 **定冠词完全相同**，因此叫 der 类限定词。
认出它们，形容词就一定用弱变化。

## 一、成员与词尾表

成员：dieser（这个）、jener（那个，书面）、jeder（每一个）、
jede / jedes、welcher（哪一个）、solcher（这样的）、mancher（有些）、
alle（所有）、beide（两个都）、sämtliche（全部）、derselbe（同一个）。

| 格 | 阳性 | 阴性 | 中性 | 复数 |
| :--- | :--- | :--- | :--- | :--- |
| N | dieser | diese | dieses | diese |
| A | diesen | diese | dieses | diese |
| D | diesem | dieser | diesem | diesen |
| G | dieses | dieser | dieses | dieser |

对照定冠词：der / die / das / die，词尾 -er, -e, -es, -e 一一对应。

## 二、用法要点

| 词 | 说明 | 例 |
| :--- | :--- | :--- |
| dieser | 近指，也用于「刚提到的」 | **Dieses Angebot** gilt nur heute. |
| jeder | 只有单数；复数用 alle | **Jeder Student** bekommt ein Buch. |
| alle | 只有复数（alles 是中性代词） | **Alle Studenten** bekommen ein Buch. |
| welcher | 疑问「哪一个」 | **Welchen Film** willst du sehen? |
| mancher | 有些，可单可复 | **Manche Leute** denken so. |
| solcher | 这样的；so ein 更口语 | **Solche Fehler** darf man nicht machen. |
| derselbe | 同一个，两部分都变格 | Wir fahren mit **demselben** Zug. |
| beide | 两者都 | **Beide Vorschläge** sind gut. |

## 三、后面的形容词一律弱变化

* **dieser neue Wagen**（不是 dieser neuer Wagen）
* **jedes kleine Kind**
* **alle guten Ideen**
* **mit solchem schlechten Wetter**

## 四、例句

**Dieser Kurs beginnt jeden Montag um neun Uhr.**
这门课每周一九点开始。

**Welche Farbe gefällt dir besser?**
你更喜欢哪个颜色？

**Alle Teilnehmer müssen sich vorher anmelden.**
所有参加者必须事先报名。

**Manche Kollegen arbeiten lieber im Homeoffice.**
有些同事更愿意在家办公。

**Wir wohnen seit Jahren in demselben Haus.**
我们多年来住在同一栋房子里。

**Solches Verhalten kann ich nicht akzeptieren.**
这种行为我无法接受。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| jede Studenten | jeder Student / alle Studenten | jeder 只有单数 |
| dieser neuer Wagen | dieser neue Wagen | der 类之后形容词弱变化 |
| alle Tag | jeden Tag / alle Tage | 单复数搭配 |
| Welche Buch? | Welches Buch? | 中性用 welches |
"""

AUTHORED['冠词/物主冠词'] = """
# 物主冠词（Possessivartikel）

> CEFR A1 · 关键词：mein, dein, sein, ihr, Possessivartikel

物主冠词表示所属。它的 **词干由所有者决定，词尾由被拥有的名词决定** —
这是中国学习者最常混淆的一点。

## 一、词干表

| 人称 | 物主冠词 | 例 |
| :--- | :--- | :--- |
| ich | mein | mein Buch 我的书 |
| du | dein | dein Buch |
| er / es | sein | sein Buch 他的书 |
| sie（她） | ihr | ihr Buch 她的书 |
| wir | unser | unser Buch |
| ihr | euer（加词尾时变 eur-） | euer Buch, eure Bücher |
| sie（他们） | ihr | ihr Buch |
| Sie（您） | Ihr（大写） | Ihr Buch 您的书 |

## 二、词尾与 ein 完全相同

| 格 | 阳性 | 阴性 | 中性 | 复数 |
| :--- | :--- | :--- | :--- | :--- |
| N | mein | meine | mein | meine |
| A | meinen | meine | mein | meine |
| D | meinem | meiner | meinem | meinen |
| G | meines | meiner | meines | meiner |

## 三、两层判断

以「我看见她的哥哥」为例：
1. 所有者是「她」 → 词干 **ihr-**；
2. 被拥有的是 Bruder（阳性）且作第四格宾语 → 词尾 **-en**；
3. 结果：**Ich sehe ihren Bruder.**

再如「我和他的姐姐说话」：所有者「他」→ sein-；Schwester 阴性第三格 → -er；
**Ich spreche mit seiner Schwester.**

## 四、身体部位与衣物常不用物主冠词

德语更喜欢 **定冠词加第三格**：

* **Er wäscht sich die Haare.** 他洗头。
* **Mir tut der Rücken weh.** 我背疼。
* **Sie hat ihm die Hand gegeben.** 她和他握了手。

## 五、例句

**Ist das dein Schlüssel? — Nein, das ist ihrer.**
这是你的钥匙吗？——不，这是她的。（物主代词独立使用时加强词尾）

**Unsere Wohnung liegt im dritten Stock.**
我们的房子在四楼。

**Hast du deiner Mutter schon geschrieben?**
你已经给你妈妈写信了吗？

**Ich fahre mit meinem Auto, nicht mit seinem.**
我开我的车，不开他的。

**Eure Idee gefällt mir sehr.**
你们的主意我很喜欢。

**Können Sie mir bitte Ihre Telefonnummer geben?**
您能把您的电话号码给我吗？

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich sehe seine Bruder.（想说「他的哥哥」作宾语） | Ich sehe seinen Bruder. | 词尾由被拥有名词的性和格决定 |
| ihre Vater（她的父亲，第一格） | ihr Vater | 阳性第一格无词尾 |
| euere Kinder | eure Kinder | euer 加词尾时去掉 e |
| Er wäscht seine Hände. | Er wäscht sich die Hände. | 身体部位用反身加定冠词 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 形容词
# ---------------------------------------------------------------------------
AUTHORED['形容词/弱变化'] = """
# 形容词弱变化（schwache Deklination）

> CEFR A2 · 关键词：schwache Adjektivdeklination, bestimmter Artikel

**触发条件：形容词前面是定冠词或 der 类限定词**
（der, die, das, dieser, jeder, jener, welcher, mancher, solcher, alle, beide, derselbe）。
此时格已经被限定词标记清楚，形容词只需要 **-e 或 -en** 两种词尾。

## 一、变格表

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| :--- | :--- | :--- | :--- | :--- |
| N | der alt**e** Mann | die alt**e** Frau | das alt**e** Haus | die alt**en** Häuser |
| A | den alt**en** Mann | die alt**e** Frau | das alt**e** Haus | die alt**en** Häuser |
| D | dem alt**en** Mann | der alt**en** Frau | dem alt**en** Haus | den alt**en** Häusern |
| G | des alt**en** Mannes | der alt**en** Frau | des alt**en** Hauses | der alt**en** Häuser |

## 二、记忆方法

把表格想成一个 5 格的「L 形小岛」：
**m.N、f.N、f.A、n.N、n.A** 这五个位置是 **-e**，其余 11 个位置全是 **-en**。
复数无论哪个格都是 **-en**。

## 三、连用多个形容词时，所有形容词同词尾

* **das kleine rote Auto** 那辆红色小汽车
* **mit dem neuen deutschen Wörterbuch** 用那本新的德语词典

## 四、例句

**Der junge Mann neben mir studiert Medizin.**
我旁边这个年轻人学医。

**Ich habe den neuen Film schon gesehen.**
这部新电影我已经看过了。

**In dem alten Haus wohnt niemand mehr.**
那栋老房子里没人住了。

**Die Farbe des roten Kleides gefällt mir.**
那条红裙子的颜色我喜欢。

**Alle interessanten Bücher sind schon ausgeliehen.**
所有有意思的书都被借走了。

**Mit den neuen Kollegen verstehe ich mich gut.**
我和新同事们相处得很好。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| der alter Mann | der alte Mann | 阳性第一格弱变化用 -e |
| den alte Mann | den alten Mann | 阳性第四格用 -en |
| mit dem neuem Auto | mit dem neuen Auto | 第三格一律 -en |
| die alte Häuser | die alten Häuser | 复数一律 -en |
"""

AUTHORED['形容词/强变化'] = """
# 形容词强变化（starke Deklination）

> CEFR B1 · 关键词：starke Adjektivdeklination, Nullartikel

**触发条件：形容词前面没有限定词**，或前面的词本身不带格标记。
此时形容词必须自己承担标记格的任务，词尾几乎等于定冠词的词尾。

## 一、变格表

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| :--- | :--- | :--- | :--- | :--- |
| N | gut**er** Wein | gut**e** Milch | gut**es** Brot | gut**e** Weine |
| A | gut**en** Wein | gut**e** Milch | gut**es** Brot | gut**e** Weine |
| D | gut**em** Wein | gut**er** Milch | gut**em** Brot | gut**en** Weinen |
| G | gut**en** Weines | gut**er** Milch | gut**en** Brotes | gut**er** Weine |

只有阳性和中性的 **第二格** 例外（用 -en 而不是 -es），因为名词本身已有 -es。

## 二、什么时候会出现零冠词

| 情况 | 例 |
| :--- | :--- |
| 物质名词、抽象名词 | Ich trinke gern **schwarzen Kaffee**. |
| 复数不定指 | Sie hat **nette Freunde**. |
| 数词之后 | **drei kleine Kinder** |
| 不变格的限定词之后（viel, wenig, etwas, mehr, ein paar, manch, solch, welch） | **viel frisches Obst**, **etwas warmes Wasser** |
| 书信问候、标语 | **Herzlichen Glückwunsch!** **Guten Tag!** |

注意：**viele, wenige, einige, mehrere, andere** 本身要变格，
后面的形容词与它们并列，同样用强变化词尾：**viele gute Ideen**、
**mit einigen netten Leuten**。

## 三、例句

**Bei schönem Wetter grillen wir im Garten.**
天气好的时候我们在花园烧烤。

**Er trinkt jeden Morgen frisch gepressten Orangensaft.**
他每天早上喝鲜榨橙汁。

**Ich wünsche dir guten Appetit!**
祝你好胃口！

**Mit freundlichen Grüßen, Anna Meier**
此致敬礼，安娜 · 迈尔。（书信结尾）

**Wir suchen erfahrene Mitarbeiter für unser Team.**
我们为团队招聘有经验的员工。

**Das ist ein Zeichen großer Zuneigung.**
这是深厚感情的表现。（阴性第二格）

## 四、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich trinke schwarze Kaffee. | Ich trinke schwarzen Kaffee. | 阳性第四格强变化 -en |
| mit gutem Freunden | mit guten Freunden | 复数第三格 -en |
| bei schönes Wetter | bei schönem Wetter | 中性第三格 -em |
| viele guten Ideen | viele gute Ideen | viele 后仍是强变化复数第一/四格 -e |
"""

AUTHORED['形容词/混合变化'] = """
# 形容词混合变化（gemischte Deklination）

> CEFR A2 · 关键词：gemischte Deklination, ein-Wörter

**触发条件：形容词前面是 ein 类限定词** —
ein, eine, kein 以及全部物主冠词 mein, dein, sein, ihr, unser, euer, Ihr。

原理：ein 类限定词在 **阳性第一格、中性第一格、中性第四格** 这三个位置
没有词尾，看不出性和格，于是形容词补上强变化词尾；其余位置照抄弱变化。

## 一、变格表

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数（kein/mein） |
| :--- | :--- | :--- | :--- | :--- |
| N | ein gut**er** Freund | eine gut**e** Idee | ein gut**es** Buch | meine gut**en** Freunde |
| A | einen gut**en** Freund | eine gut**e** Idee | ein gut**es** Buch | meine gut**en** Freunde |
| D | einem gut**en** Freund | einer gut**en** Idee | einem gut**en** Buch | meinen gut**en** Freunden |
| G | eines gut**en** Freundes | einer gut**en** Idee | eines gut**en** Buches | meiner gut**en** Freunde |

**三个红点**：ein gut**er**（m.N）、ein gut**es**（n.N）、ein gut**es**（n.A）。
把这三个记住，其余全是 -en 或阴性单数的 -e。

## 二、三张表的统一口诀

1. 前面有 der 类 → 弱变化（-e / -en）。
2. 前面什么都没有 → 强变化（词尾像定冠词）。
3. 前面有 ein 类 → 混合变化 = 弱变化 + 三个强变化位置。

## 三、例句

**Ein guter Freund hilft immer.**
好朋友总会帮忙。

**Sie hat mir ein interessantes Buch empfohlen.**
她给我推荐了一本有趣的书。

**Ich habe keinen freien Platz gefunden.**
我没找到空位。

**Wir wohnen in einer ruhigen Straße.**
我们住在一条安静的街上。

**Meine besten Freunde wohnen in Hamburg.**
我最好的朋友们住在汉堡。

**Das ist die Meinung eines erfahrenen Arztes.**
这是一位有经验的医生的意见。

## 四、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| ein gutes Freund | ein guter Freund | 阳性第一格 -er |
| ein interessanter Buch | ein interessantes Buch | 中性第一/四格 -es |
| in einer ruhige Straße | in einer ruhigen Straße | 第三格一律 -en |
| meine gute Freunde | meine guten Freunde | 复数一律 -en |
"""

AUTHORED['形容词/比较级与最高级'] = """
# 比较级与最高级（Komparativ und Superlativ）

> CEFR A2 · 关键词：Komparativ, Superlativ, als, wie

## 一、构成

| 级 | 规则 | 例 |
| :--- | :--- | :--- |
| 原级 Positiv | 词典形式 | schnell |
| 比较级 Komparativ | 加 -er | schneller |
| 最高级 Superlativ | 加 -st（作状语用 am ...-sten） | der schnellste / am schnellsten |

以 -d, -t, -s, -ß, -sch, -z 结尾的词，最高级加 **-est**：
am ältesten, am heißesten, am kürzesten, am interessantesten。

## 二、变音与不规则

单音节形容词的 a, o, u 常变音：alt-älter-ältest, groß-größer-größt,
jung-jünger-jüngst, kurz-kürzer-kürzest, lang-länger-längst,
warm-wärmer-wärmst, kalt-kälter-kältest, stark-stärker-stärkst。

| 不规则 | 比较级 | 最高级 |
| :--- | :--- | :--- |
| gut | besser | am besten |
| viel | mehr | am meisten |
| gern | lieber | am liebsten |
| hoch | höher | am höchsten |
| nah | näher | am nächsten |
| groß | größer | am größten |

## 三、比较级和最高级也要变格

作定语时，先加级词尾，再加变格词尾：

* der **schnellere** Zug（比较级加弱变化 -e）
* ein **schnelleres** Auto（比较级加混合变化 -es）
* die **schnellsten** Läufer（最高级加弱变化 -en）

## 四、句型

| 句型 | 例 |
| :--- | :--- |
| so + 原级 + wie | Er ist **so alt wie** ich. |
| 比较级 + als | Er ist **älter als** ich. |
| immer + 比较级 | Es wird **immer kälter**. |
| je + 比较级, desto + 比较级 | **Je mehr**, **desto besser**. |
| am + 最高级 + -sten | Sie läuft **am schnellsten**. |
| 定冠词 + 最高级 + 名词 | Das ist **der beste** Wein. |

## 五、例句

**Der Winter war dieses Jahr kälter als letztes Jahr.**
今年冬天比去年冷。

**Das ist das teuerste Hotel der Stadt.**
这是城里最贵的酒店。

**Je länger ich hier wohne, desto besser gefällt es mir.**
我住得越久就越喜欢这里。

**Mein älterer Bruder arbeitet bei einer Bank.**
我哥哥在一家银行工作。

**Am liebsten würde ich sofort losfahren.**
我最想马上出发。

**Sie spricht nicht so gut Englisch wie du.**
她英语说得不如你好。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| größer wie ich | größer als ich | 不等比较用 als |
| mehr interessant | interessanter | 德语不用 more 结构 |
| der beste Wein von die Welt | der beste Wein der Welt | 范围用第二格 |
| am schnellste | am schnellsten | am 加最高级固定 -sten |
"""

AUTHORED['形容词/支配关系'] = """
# 形容词的支配关系（Adjektive mit Ergänzung）

> CEFR B1 · 关键词：Adjektiv mit Präposition, Adjektiv mit Kasus

许多形容词像动词一样要求固定的补足语：某个格或某个介词。
这些搭配无法从汉语推导，必须整体背诵。

## 一、支配第三格的形容词

| 形容词 | 例句 |
| :--- | :--- |
| ähnlich 相似 | **Sie ist ihrer Mutter sehr ähnlich.** |
| dankbar 感激 | **Ich bin dir für alles dankbar.** |
| behilflich 有帮助 | **Können Sie mir behilflich sein?** |
| fremd 陌生 | **Diese Stadt ist mir noch fremd.** |
| überlegen 优于 | **Er ist mir im Schach überlegen.** |
| treu 忠诚 | **Er blieb seinen Prinzipien treu.** |
| peinlich, angenehm, wichtig, egal, klar | **Das ist mir sehr wichtig.** |

## 二、支配第四格的形容词（多为度量）

* **Der Turm ist 100 Meter hoch.** 塔高一百米。
* **Das Kind ist einen Monat alt.** 孩子一个月大。
* **Der Fluss ist zwei Kilometer breit.**

## 三、支配介词的形容词（最重要）

| 形容词 + 介词 | 格 | 例句 |
| :--- | :--- | :--- |
| stolz auf | A | **Ich bin stolz auf dich.** 我为你骄傲。 |
| interessiert an | D | **Er ist an Musik interessiert.** |
| zufrieden mit | D | **Sind Sie mit dem Ergebnis zufrieden?** |
| verantwortlich für | A | **Wer ist dafür verantwortlich?** |
| abhängig von | D | **Das ist vom Wetter abhängig.** |
| bereit zu | D | **Ich bin zu allem bereit.** |
| böse auf | A | **Sie ist böse auf ihn.** |
| eifersüchtig auf | A | **Er ist eifersüchtig auf seinen Bruder.** |
| gespannt auf | A | **Ich bin gespannt auf den Film.** |
| reich an / arm an | D | **Obst ist reich an Vitaminen.** |
| typisch für | A | **Das ist typisch für ihn.** |
| überzeugt von | D | **Ich bin davon überzeugt.** |
| verliebt in | A | **Sie ist in ihn verliebt.** |
| zuständig für | A | **Ich bin für den Einkauf zuständig.** |

## 四、支配第二格的形容词（正式）

sicher, bewusst, würdig, fähig, verdächtig, müde, schuldig：
**Er ist sich seiner Verantwortung bewusst.** 他清楚自己的责任。

## 五、例句

**Ich bin mit meiner neuen Wohnung sehr zufrieden.**
我对新房子很满意。

**Die Kinder sind gespannt auf die Ferien.**
孩子们期待着假期。

**Sein Erfolg ist von vielen Faktoren abhängig.**
他的成功取决于很多因素。

**Bist du böse auf mich?**
你生我的气吗？

**Diese Region ist arm an Rohstoffen.**
这个地区原材料匮乏。

**Sie war sich der Folgen nicht bewusst.**
她没有意识到后果。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| stolz von dir | stolz auf dich | 固定搭配加第四格 |
| zufrieden über das Ergebnis | zufrieden mit dem Ergebnis | mit 加第三格 |
| interessiert in Musik | an Musik interessiert | 受英语干扰 |
| Ich bin ähnlich meinem Vater.（语序） | Ich bin meinem Vater ähnlich. | 补足语在形容词之前 |
"""

AUTHORED['形容词/扩展定语'] = """
# 扩展的分词定语（erweitertes Partizipialattribut）

> CEFR C1 · 关键词：erweitertes Attribut, Partizipialattribut, Nominalstil

这是德语书面语（学术、法律、新闻）最典型的结构：
把一整个关系从句压缩成 **冠词与名词之间的一长串修饰语**。
读懂它的关键是 **先找冠词、再跳到名词、最后回头读中间**。

## 一、结构公式

冠词 + [状语 + 分词] + 名词

| 关系从句 | 扩展定语 |
| :--- | :--- |
| der Zug, **der um 8 Uhr in Berlin abfährt** | der **um 8 Uhr in Berlin abfahrende** Zug |
| das Gesetz, **das gestern verabschiedet wurde** | das **gestern verabschiedete** Gesetz |
| die Aufgabe, **die gelöst werden muss** | die **zu lösende** Aufgabe |

## 二、三种分词的意义

| 形式 | 意义 | 例 |
| :--- | :--- | :--- |
| 第一分词（-end） | 主动、正在进行 | die **steigenden** Preise 正在上涨的物价 |
| 第二分词 | 被动、已完成（及物动词） | die **gestiegenen** Preise 已上涨的物价（不及物则表完成） |
| zu + 第一分词 | 被动 + 必要或可能 | die **zu zahlende** Summe 应付的金额 |

## 三、拆解练习

**Die von der Regierung im letzten Jahr beschlossenen Maßnahmen zeigen Wirkung.**

1. 冠词 die → 找名词 **Maßnahmen**（措施）；
2. 中间 von der Regierung im letzten Jahr beschlossenen 是修饰语；
3. 还原：Die Maßnahmen, **die von der Regierung im letzten Jahr beschlossen wurden**, zeigen Wirkung.
4. 汉语：政府去年通过的那些措施正在见效。

## 四、例句

**Der seit Wochen andauernde Streik lähmt den Verkehr.**
持续数周的罢工使交通瘫痪。

**Die im Vertrag genannten Bedingungen müssen eingehalten werden.**
合同中提到的条件必须遵守。

**Das ist ein kaum zu überschätzendes Problem.**
这是一个几乎无法高估的问题。

**Alle an der Konferenz teilnehmenden Wissenschaftler erhalten ein Zertifikat.**
所有参加会议的科学家都将获得证书。

**Die von ihm geschriebene Arbeit wurde mit Bestnote bewertet.**
他写的论文得了最高分。

**Der im 19. Jahrhundert erbaute Bahnhof steht unter Denkmalschutz.**
这座建于十九世纪的火车站受文物保护。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| die von der Regierung beschlossen Maßnahmen | ... beschlossenen Maßnahmen | 分词作定语必须变格 |
| die zu lösen Aufgabe | die zu lösende Aufgabe | zu 加第一分词，且要变格 |
| der abfahrende um 8 Uhr Zug | der um 8 Uhr abfahrende Zug | 状语在分词之前 |
| die gestiegene Preise（想说「已上涨的物价」） | die gestiegenen Preise | 复数弱变化 -en |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 代词
# ---------------------------------------------------------------------------
AUTHORED['代词/人称代词'] = """
# 人称代词（Personalpronomen）

> CEFR A1 · 关键词：Personalpronomen, Kasus, Wortstellung

## 一、变格表

| 格 | 我 | 你 | 他 | 她 | 它 | 我们 | 你们 | 他们 | 您 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| N | ich | du | er | sie | es | wir | ihr | sie | Sie |
| A | mich | dich | ihn | sie | es | uns | euch | sie | Sie |
| D | mir | dir | ihm | ihr | ihm | uns | euch | ihnen | Ihnen |

第二格形式（meiner, deiner, seiner, ihrer, unser, euer, ihrer）
只出现在少数支配第二格的动词和固定短语里，日常几乎不用。

## 二、代词的性由名词决定，不由生物性别决定

德语的 er / sie / es 指代 **名词的语法性**：

* **Der Tisch** ist neu. → **Er** ist neu.（桌子用 er）
* **Die Lampe** ist kaputt. → **Sie** ist kaputt.
* **Das Mädchen** ist nett. → **Es** ist nett.（Mädchen 是中性，尽管指女孩）

## 三、语序：代词往前挤

| 规则 | 例 |
| :--- | :--- |
| 代词在名词之前 | Ich habe **es meinem Bruder** gegeben. |
| 两个代词：第四格在前 | Ich habe **es ihm** gegeben. |
| 代词可越过名词主语 | Gestern hat **mich mein Chef** angerufen. |
| 代词紧跟变位动词或从句连词 | ..., weil **es mir** nicht gefällt. |

## 四、du / ihr / Sie 的选择

| 形式 | 用于 | 注意 |
| :--- | :--- | :--- |
| du | 家人、朋友、同学、儿童、同事（视公司文化） | 动词第二人称单数 |
| ihr | 上述对象的复数 | 不是「您们」 |
| Sie | 陌生人、正式场合、客户、上级 | 动词用复数第三人称，Sie 大写 |

## 五、例句

**Kennst du ihn? — Ja, ich kenne ihn gut.**
你认识他吗？——认识，我很了解他。

**Kannst du mir bitte helfen?**
你能帮我一下吗？

**Der Brief ist für dich, nicht für mich.**
这封信是给你的，不是给我的。

**Ich habe es ihr gestern schon gesagt.**
我昨天已经跟她说过了。

**Wie geht es Ihnen, Herr Schmidt?**
施密特先生，您好吗？

**Wo ist mein Handy? — Es liegt auf dem Tisch.**
我手机在哪儿？——在桌上。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich helfe ihn. | Ich helfe ihm. | helfen 加第三格 |
| Das Buch, er ist gut. | Das Buch, es ist gut. | 代词随名词的性 |
| Ich gebe ihm es. | Ich gebe es ihm. | 两个代词时第四格在前 |
| Wie geht es dir, Herr Müller? | Wie geht es Ihnen, Herr Müller? | 正式场合用 Sie |
"""

AUTHORED['代词/反身代词'] = """
# 反身代词与相互代词（Reflexiv- und Reziprokpronomen）

> CEFR A2 · 关键词：Reflexivpronomen, sich, einander

## 一、反身代词表

| 人称 | 第四格 | 第三格 |
| :--- | :--- | :--- |
| ich | mich | mir |
| du | dich | dir |
| er / sie / es | sich | sich |
| wir | uns | uns |
| ihr | euch | euch |
| sie / Sie | sich | sich |

只有第一、二人称单数区分第四格与第三格，其余全是 sich / uns / euch。

## 二、什么时候用第三格反身代词

当句中 **已经有一个第四格宾语** 时，反身代词退到第三格：

* **Ich wasche mich.** 我洗澡。（第四格）
* **Ich wasche mir die Hände.** 我洗手。（die Hände 是第四格，所以 mir）
* **Ich kaufe mir ein Buch.** 我给自己买本书。
* **Merk dir das!** 你记住这个！

## 三、真反身与假反身

| 类型 | 说明 | 例 |
| :--- | :--- | :--- |
| 真反身（必须带 sich） | 没有 sich 就不成词 | sich beeilen, sich erholen, sich schämen, sich verspäten, sich befinden |
| 假反身（也可带别的宾语） | 动作可作用于他人 | Ich wasche **mich** / **das Kind**. |

## 四、高频反身动词（带介词）

| 动词 | 介词与格 | 例句 |
| :--- | :--- | :--- |
| sich freuen | auf + A（期待）/ über + A（对已发生的高兴） | **Ich freue mich auf das Wochenende.** |
| sich interessieren | für + A | **Er interessiert sich für Politik.** |
| sich erinnern | an + A | **Erinnerst du dich an ihn?** |
| sich kümmern | um + A | **Sie kümmert sich um die Kinder.** |
| sich ärgern | über + A | **Ich ärgere mich über den Lärm.** |
| sich beschäftigen | mit + D | **Er beschäftigt sich mit Geschichte.** |
| sich bewerben | um + A / bei + D | **Ich bewerbe mich um die Stelle.** |
| sich gewöhnen | an + A | **Man gewöhnt sich an alles.** |

## 五、相互代词

复数的 sich / uns / euch 可以表示「互相」，歧义时用 **einander**：

* **Wir sehen uns morgen.** 我们明天见（面）。
* **Sie helfen einander.** 他们互相帮助。
* 与介词连写：**miteinander, voneinander, füreinander**。

## 六、例句

**Beeil dich, wir kommen sonst zu spät!**
快点，不然我们要迟到了。

**Ich habe mich gestern sehr über die Nachricht gefreut.**
我昨天听到这个消息很高兴。

**Setzen Sie sich bitte!**
请坐。

**Kannst du dir das vorstellen?**
你能想象吗？

**Die beiden kennen sich seit der Schulzeit.**
他们两个从上学时就认识。

**Wir schreiben einander jede Woche.**
我们每周互相写信。

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich wasche mich die Hände. | Ich wasche mir die Hände. | 已有第四格宾语，反身用第三格 |
| Er freut sich für das Wochenende. | Er freut sich auf das Wochenende. | 固定介词 auf |
| Setzen Sie bitte! | Setzen Sie sich bitte! | sich setzen 是真反身 |
| Wir treffen morgen. | Wir treffen uns morgen. | sich treffen 需要反身代词 |
"""

AUTHORED['代词/指示代词'] = """
# 指示代词（Demonstrativpronomen）

> CEFR B1 · 关键词：der/die/das als Pronomen, dieser, derjenige, derselbe

## 一、der / die / das 作指示代词

口语中最常用的指示代词就是定冠词的重读形式，意思是「这个、那个」。
它的变格和关系代词完全相同：

| 格 | 阳性 | 阴性 | 中性 | 复数 |
| :--- | :--- | :--- | :--- | :--- |
| N | der | die | das | die |
| A | den | die | das | die |
| D | dem | der | dem | **denen** |
| G | **dessen** | **deren** | **dessen** | **deren** |

* **Kennst du den Mann dort? — Den kenne ich nicht.**
  你认识那边那个男人吗？——那个我不认识。
* **Wem gehört das? — Das weiß ich nicht.**

## 二、dessen / deren 避免歧义

第二格指示代词指代 **上文刚提到的人**，避免 sein / ihr 的歧义：

* **Ich traf Peter und dessen Bruder.** 我遇到彼得和他（彼得的）弟弟。
  （若说 seinen Bruder，可能指第三者的弟弟。）
* **Sie sprach mit Anna und deren Mann.**

## 三、其他指示词

| 词 | 意义 | 例 |
| :--- | :--- | :--- |
| dieser / jener | 这个 / 那个（jener 书面） | **Dieser** Wagen ist neu, **jener** ist alt. |
| derselbe | 同一个（两部分都变） | Wir haben **denselben** Lehrer. |
| der gleiche | 同样的（不是同一个） | Sie trägt **das gleiche** Kleid wie ich. |
| derjenige | 那个（后接关系从句） | **Diejenigen**, die fertig sind, dürfen gehen. |
| solcher / so ein | 这样的 | **So einen** Fehler mache ich nie wieder. |
| selbst / selber | 本身、亲自 | Das habe ich **selbst** gemacht. |

derselbe 与 der gleiche 的区别是考试常考点：
* **Wir fahren mit demselben Zug.**（同一列车）
* **Wir haben die gleichen Schuhe.**（同款不同双）

## 四、例句

**Der Film, den ich gestern gesehen habe, war spannend.**
我昨天看的那部电影很精彩。

**Das ist genau das, was ich gesucht habe.**
这正是我要找的。

**Diejenigen Studenten, die keinen Ausweis haben, müssen warten.**
没有证件的那些学生必须等候。

**Ich habe mit dem Chef gesprochen und mit dessen Sekretärin.**
我和老板以及他的秘书谈过了。

**Wir wohnen im selben Haus, aber nicht in derselben Wohnung.**
我们住同一栋楼，但不是同一套房。

**Solche Ausreden will ich nicht mehr hören.**
这种借口我不想再听了。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| mit den Leuten, die ich geholfen habe | mit den Leuten, **denen** ich geholfen habe | 第三格复数是 denen |
| Peter und seinen Bruder（歧义） | Peter und dessen Bruder | 需要明确指代时用 dessen |
| das selbe Auto | dasselbe Auto | derselbe 连写 |
| Wir haben denselben Schuhe.（同款） | Wir haben die gleichen Schuhe. | 区分「同一」与「同样」 |
"""

AUTHORED['代词/不定代词'] = """
# 不定代词（Indefinitpronomen）

> CEFR B1 · 关键词：man, jemand, etwas, alle, einige, kein

## 一、指人的不定代词

| 词 | 意义 | 变格 | 例 |
| :--- | :--- | :--- | :--- |
| man | 泛指「人们、有人」 | A: einen, D: einem | **Man darf hier nicht parken.** |
| jemand | 某人 | jemanden, jemandem | **Hat jemand angerufen?** |
| niemand | 没有人 | niemanden, niemandem | **Ich habe niemanden gesehen.** |
| jeder | 每个人 | jeden, jedem | **Jeder weiß das.** |
| alle | 所有人 | alle, allen | **Alle sind gekommen.** |
| einer / eine / eins | 其中一个 | einen, einem | **Einer von uns muss gehen.** |
| keiner | 一个也没有 | keinen, keinem | **Keiner hat geantwortet.** |

**man** 是德语最重要的不定代词，用来表达汉语的无主语句，
也是回避被动态的常用手段：**Man baut hier ein Hotel.** 这里在盖旅馆。

## 二、指物的不定代词

| 词 | 意义 | 例 |
| :--- | :--- | :--- |
| etwas | 某物、一些 | **Möchtest du etwas trinken?** |
| nichts | 什么也没有 | **Ich habe nichts verstanden.** |
| alles | 一切 | **Alles ist in Ordnung.** |
| viel / wenig | 很多 / 很少 | **Er weiß viel.** |
| einiges / manches | 一些事 | **Einiges ist noch unklar.** |

etwas / nichts / viel / wenig / alles 后面的形容词要 **名词化并大写**，
用中性强变化词尾：**etwas Neues**、**nichts Interessantes**、**viel Gutes**；
但 alles 后用弱变化：**alles Gute**。

## 三、限定词兼代词

| 词 | 作限定词 | 作代词 |
| :--- | :--- | :--- |
| einige | einige Leute | Einige sind schon da. |
| mehrere | mehrere Bücher | Mehrere fehlen. |
| beide | beide Kinder | Beide sind krank. |
| andere | andere Ideen | Die anderen kommen später. |
| welche（口语） | — | Hast du Milch? — Ja, ich habe welche. |

## 四、例句

**Man sagt, dass der Winter kalt wird.**
据说冬天会很冷。

**Hier kann man gut essen.**
这里可以吃得很好。

**Ich möchte etwas Warmes trinken.**
我想喝点热的。

**Niemand konnte mir eine Antwort geben.**
没人能给我答复。

**Alles Gute zum Geburtstag!**
生日快乐！

**Einer von euch muss den Bericht schreiben.**
你们中得有一个人写报告。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Man kann sehen ihn. | Man kann ihn sehen. | 语序问题，与 man 无关 |
| Wenn man müde ist, soll man sich ausruhen. 写成 ... soll er sich ... | 全句保持 man | man 一旦用了就贯穿到底 |
| etwas neues | etwas Neues | 名词化要大写并加 -es |
| alles Gutes | alles Gute | alles 后用弱变化 |
"""

AUTHORED['代词/关系代词'] = """
# 关系代词（Relativpronomen）

> CEFR B1 · 关键词：Relativpronomen, der/die/das, welcher, wer/was

关系代词的形态几乎等于定冠词，只有 **第三格复数和全部第二格** 不同。
这张表必须背到条件反射，因为关系从句是德语书面语的骨架。

## 一、变格表

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| :--- | :--- | :--- | :--- | :--- |
| N | der | die | das | die |
| A | den | die | das | die |
| D | dem | der | dem | **denen** |
| G | **dessen** | **deren** | **dessen** | **deren** |

## 二、两条决定规则

1. **性和数** 由先行词（主句里被修饰的名词）决定；
2. **格** 由关系代词在 **从句里** 担任的成分决定。

例：Das ist der Mann, **den** ich gestern getroffen habe.
Mann 是阳性单数 → der 系列；在从句里作 treffen 的宾语 → 第四格 → **den**。

## 三、四个格的示范（先行词都是 der Mann）

| 从句中的角色 | 关系代词 | 例 |
| :--- | :--- | :--- |
| 主语 | der | der Mann, **der** dort steht |
| 第四格宾语 | den | der Mann, **den** ich kenne |
| 第三格宾语 | dem | der Mann, **dem** ich geholfen habe |
| 第二格定语 | dessen | der Mann, **dessen** Auto kaputt ist |
| 介词加格 | 介词在前 | der Mann, **mit dem** ich gesprochen habe |

## 四、welcher 与 was

* **welcher / welche / welches** 是 der 系列的书面替代形式，
  用于避免重复：die Frau, **welche** die Tür öffnete。现代德语中较少用。
* **was** 用于先行词是 das, alles, nichts, etwas, viel, wenig,
  中性最高级，或整个主句时：
  **Das ist alles, was ich weiß.** 这就是我知道的一切。
  **Er kam zu spät, was mich sehr ärgerte.** 他迟到了，这让我很生气。

## 五、例句

**Die Frau, die neben mir sitzt, ist meine Chefin.**
坐我旁边的女士是我老板。

**Das Buch, das du mir empfohlen hast, war ausgezeichnet.**
你推荐给我的那本书非常好。

**Der Kollege, dem ich das Projekt übergeben habe, ist sehr zuverlässig.**
我把项目交给的那位同事非常可靠。

**Die Studenten, deren Arbeiten fertig sind, können gehen.**
论文写完的学生可以走了。

**Das ist der Grund, aus dem ich gekündigt habe.**
这就是我辞职的原因。

**Er hat alles bezahlt, was mich sehr überrascht hat.**
他把所有钱都付了，这让我很吃惊。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| die Leute, die ich geholfen habe | die Leute, **denen** ich geholfen habe | helfen 加第三格，复数第三格是 denen |
| der Mann, den mir geholfen hat | der Mann, **der** mir geholfen hat | 从句主语用第一格 |
| das Buch, welches ich es gelesen habe | das Buch, das ich gelesen habe | 关系代词已经是宾语，不再加 es |
| der Mann, dessen ich das Auto kenne | der Mann, dessen Auto ich kenne | dessen 直接修饰名词，不加冠词 |
"""

AUTHORED['代词/es的用法'] = """
# es 的用法（Das Wörtchen es）

> CEFR B1 · 关键词：es, Platzhalter, Korrelat, unpersönliches Verb

小小的 es 在德语里承担五种完全不同的任务，弄清楚它就理解了德语的句子框架。

## 一、真正的代词：指代中性名词

**Wo ist das Buch? — Es liegt auf dem Tisch.**
书在哪儿？——在桌上。

## 二、无人称动词的固定主语（不可省略）

| 类别 | 例 |
| :--- | :--- |
| 天气 | **Es regnet.** **Es schneit.** **Es ist kalt.** |
| 时间 | **Es ist acht Uhr.** **Es wird spät.** |
| 感受（可换第三格） | **Es geht mir gut.** **Es tut mir leid.** |
| 存在 | **Es gibt** hier ein gutes Restaurant. |
| 固定短语 | **Es klopft.** 有人敲门。**Es klappt.** 成了。 |

**es gibt** 后面永远接 **第四格**：Es gibt **einen** Fehler。

## 三、形式主语，真正主语在后（Korrelat）

**Es freut mich, dass du kommst.** = **Dass du kommst, freut mich.**
你要来我很高兴。

**Es ist wichtig, pünktlich zu sein.** 准时很重要。

这种 es 在真正主语提前时消失：**Pünktlich zu sein ist wichtig.**

## 四、占位符：只为了让动词留在第二位（Vorfeld-es）

**Es kamen viele Gäste.** = **Viele Gäste kamen.**
来了很多客人。

**Es wurde die ganze Nacht getanzt.**（无人称被动）

这种 es 只能站在句首，一旦前场被别的成分占据就必须删掉：
**Gestern kamen viele Gäste.**（不能说 Gestern es kamen ...）

## 五、固定宾语

**Ich habe es eilig.** 我赶时间。
**Ich meine es ernst.** 我是认真的。
**Er hat es gut.** 他日子过得不错。

## 六、例句

**Es regnet seit gestern Abend ununterbrochen.**
从昨晚起一直不停地下雨。

**Es gibt keinen Grund zur Sorge.**
没有理由担心。

**Es ist mir egal, was die Leute sagen.**
别人说什么我无所谓。

**Es waren einmal ein König und eine Königin.**
从前有一位国王和一位王后。（童话开头）

**Wie geht es Ihrer Familie?**
您家人还好吗？

**Ich finde es schade, dass du nicht mitkommst.**
你不一起来我觉得很可惜。

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Gestern es gab ein Problem. | Gestern gab es ein Problem. | 占位 es 在非句首时消失 |
| Es gibt ein Fehler. | Es gibt einen Fehler. | es gibt 加第四格 |
| Ist wichtig, pünktlich zu sein. | Es ist wichtig, ... | 形式主语不能省 |
| Regnet. | Es regnet. | 无人称动词必须带 es |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 动词：形式与时态
# ---------------------------------------------------------------------------
AUTHORED['动词/现在时'] = """
# 现在时（Präsens）

> CEFR A1 · 关键词：Präsens, Personalendung, Vokalwechsel

德语现在时的用途比汉语和英语都广：现在、习惯、真理、甚至将来都能用它表达。
德语没有进行时，「我正在读书」和「我读书」都是 **Ich lese**。

## 一、人称词尾

| 人称 | 词尾 | lernen | arbeiten（词干 -t/-d） | heißen（词干 -s/-ß/-z） |
| :--- | :--- | :--- | :--- | :--- |
| ich | -e | lerne | arbeite | heiße |
| du | -st | lernst | arbeit**e**st | heiß**t** |
| er/sie/es | -t | lernt | arbeit**e**t | heißt |
| wir | -en | lernen | arbeiten | heißen |
| ihr | -t | lernt | arbeit**e**t | heißt |
| sie/Sie | -en | lernen | arbeiten | heißen |

词干以 -t, -d, -chn, -ffn, -gn 结尾时，在 du / er / ihr 处插入 **-e-**
（du findest, er öffnet, ihr rechnet）。
词干以 -s, -ß, -z, -tz, -x 结尾时，du 的词尾只剩 **-t**（du tanzt, du sitzt）。

## 二、强变化动词的换元音

| 变化 | 出现在 du 和 er/sie/es | 例 |
| :--- | :--- | :--- |
| e → i | ich gebe, **du gibst**, **er gibt** | geben, nehmen（du nimmst）, essen, helfen, sprechen, treffen |
| e → ie | ich sehe, **du siehst**, **er sieht** | sehen, lesen（du liest）, empfehlen, stehlen |
| a → ä | ich fahre, **du fährst**, **er fährt** | fahren, schlafen, tragen, laufen（du läufst）, halten（du hältst） |
| o → ö | ich stoße, **du stößt** | stoßen |

## 三、四个必背的不规则动词

| 人称 | sein | haben | werden | wissen |
| :--- | :--- | :--- | :--- | :--- |
| ich | bin | habe | werde | weiß |
| du | bist | hast | wirst | weißt |
| er/sie/es | ist | hat | wird | weiß |
| wir | sind | haben | werden | wissen |
| ihr | seid | habt | werdet | wisst |
| sie/Sie | sind | haben | werden | wissen |

## 四、现在时的用法

| 用法 | 例 |
| :--- | :--- |
| 此刻 | **Ich schreibe gerade eine E-Mail.** |
| 习惯 | **Er geht jeden Tag joggen.** |
| 普遍真理 | **Wasser kocht bei 100 Grad.** |
| 带时间状语的将来 | **Morgen fliege ich nach Wien.** |
| 从过去持续到现在（seit） | **Ich wohne seit 2019 hier.** 我从 2019 年住到现在。 |
| 生动叙述（历史现在时） | **1989 fällt die Mauer.** |

## 五、例句

**Was machst du am Wochenende? — Ich besuche meine Eltern.**
你周末做什么？——我去看我父母。

**Er spricht sehr gut Chinesisch.**
他中文说得很好。

**Nimmst du Zucker in den Kaffee?**
你咖啡里加糖吗？

**Der Zug fährt in fünf Minuten ab.**
火车五分钟后开。

**Ich arbeite seit drei Jahren bei dieser Firma.**
我在这家公司工作三年了。

**Wisst ihr, wann der Film anfängt?**
你们知道电影什么时候开始吗？

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| du fahrst | du fährst | 强变化换元音 |
| er arbeitt | er arbeitet | 插入 -e- |
| du heißst | du heißt | -ß 后词尾只剩 -t |
| Ich bin lesen ein Buch. | Ich lese ein Buch. | 德语没有进行时 |
"""

AUTHORED['动词/过去时'] = """
# 过去时（Präteritum）

> CEFR A2 · 关键词：Präteritum, schwach, stark, Erzähltempus

过去时是 **书面叙述时态**：小说、新闻、报告、历史。
口语中除了 sein, haben, werden 和情态动词，德国南部几乎不用它。

## 一、弱变化：词干 + t + 人称词尾

| 人称 | machen | arbeiten |
| :--- | :--- | :--- |
| ich | machte | arbeitete |
| du | machtest | arbeitetest |
| er/sie/es | machte | arbeitete |
| wir | machten | arbeiteten |
| ihr | machtet | arbeitetet |
| sie/Sie | machten | arbeiteten |

注意 **ich 和 er/sie/es 形式相同**，这是德语所有过去时和虚拟式的共同特征。

## 二、强变化：换元音的词干 + 人称词尾（ich 和 er 无词尾）

| 人称 | gehen | kommen | sehen | fahren |
| :--- | :--- | :--- | :--- | :--- |
| ich | ging | kam | sah | fuhr |
| du | gingst | kamst | sahst | fuhrst |
| er/sie/es | ging | kam | sah | fuhr |
| wir | gingen | kamen | sahen | fuhren |
| ihr | gingt | kamt | saht | fuhrt |
| sie/Sie | gingen | kamen | sahen | fuhren |

## 三、必须掌握的高频过去时

| 不定式 | 过去时 | 不定式 | 过去时 |
| :--- | :--- | :--- | :--- |
| sein | war | können | konnte |
| haben | hatte | müssen | musste |
| werden | wurde | dürfen | durfte |
| gehen | ging | wollen | wollte |
| kommen | kam | sollen | sollte |
| geben | gab | wissen | wusste |
| bleiben | blieb | bringen | brachte |
| stehen | stand | denken | dachte |
| nehmen | nahm | kennen | kannte |

## 四、混合变化（弱词尾 + 换元音）

bringen–brachte, denken–dachte, kennen–kannte, nennen–nannte,
rennen–rannte, senden–sandte, wenden–wandte, wissen–wusste。

## 五、例句

**Als ich ein Kind war, wohnten wir in Dresden.**
我小时候我们住在德累斯顿。

**Gestern hatte ich leider keine Zeit.**
昨天我很遗憾没时间。

**Der Zweite Weltkrieg endete 1945.**
第二次世界大战于一九四五年结束。

**Sie stand auf, ging zum Fenster und öffnete es.**
她站起来，走到窗前，把窗子打开。（连续叙述用过去时）

**Ich konnte dich gestern nicht erreichen.**
我昨天联系不上你。

**Es war einmal ein armer Bauer.**
从前有一个穷农民。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich gingte. | Ich ging. | 强变化不加 -te |
| er machtete | er machte | 弱变化只加一个 -te |
| Ich habe gestern nach Berlin gefahren. | Ich bin gestern nach Berlin gefahren. | 位移动词完成时用 sein |
| 口语里全篇用过去时 | 口语用完成时 | 只有 sein/haben/情态动词例外 |
"""

AUTHORED['动词/现在完成时'] = """
# 现在完成时（Perfekt）

> CEFR A1 · 关键词：Perfekt, haben, sein, Partizip II

Perfekt 是 **口语中表达过去的默认时态**。
构成：**haben 或 sein（变位）+ 第二分词（句末）**。

## 一、选 haben 还是 sein

| 用 sein | 说明 | 例 |
| :--- | :--- | :--- |
| 位移动词 | gehen, kommen, fahren, fliegen, laufen, reisen, steigen | Ich **bin** nach Hause **gegangen**. |
| 状态改变 | aufstehen, einschlafen, aufwachen, sterben, wachsen, werden | Er **ist** eingeschlafen. |
| 三个特殊词 | sein, bleiben, werden | Ich **bin** in Berlin **gewesen**. |
| 少数其他 | passieren, geschehen, gelingen, begegnen, folgen | Was **ist** passiert? |

**其余一切用 haben**，包括所有带第四格宾语的动词和所有反身动词。

同一个动词也可能两用：**Ich bin nach Hause gefahren.**（位移）
对 **Ich habe das Auto in die Garage gefahren.**（带宾语）。

## 二、第二分词的构成

| 类型 | 规则 | 例 |
| :--- | :--- | :--- |
| 弱变化 | ge- + 词干 + -t | gemacht, gearbeitet, gelernt |
| 强变化 | ge- + （换音）词干 + -en | gegangen, gesprochen, geschrieben |
| 混合 | ge- + 换音词干 + -t | gebracht, gedacht, gewusst |
| 不可分前缀 be-, ge-, er-, ver-, zer-, ent-, emp-, miss- | 不加 ge- | besucht, verstanden, entschieden |
| -ieren 结尾 | 不加 ge- | studiert, telefoniert, funktioniert |
| 可分动词 | 前缀 + ge + 词干 | angerufen, eingekauft, mitgenommen |

## 三、句框（Satzklammer）

助动词占第二位，第二分词甩到 **句末**，中间的一切叫「中场」：

**Ich habe** gestern mit meinem Bruder in der Stadt Kaffee **getrunken**.
昨天我和我哥哥在城里喝了咖啡。

从句中助动词退到最后：..., weil ich Kaffee **getrunken habe**。

## 四、例句

**Hast du schon gegessen?**
你吃过了吗？

**Wir sind letztes Jahr nach Japan geflogen.**
我们去年飞去了日本。

**Ich habe den Film noch nicht gesehen.**
这部电影我还没看。

**Sie hat sich sehr über dein Geschenk gefreut.**
她对你的礼物非常高兴。（反身动词用 haben）

**Was ist denn hier passiert?**
这里出什么事了？

**Er ist um sechs Uhr aufgestanden und hat sofort geduscht.**
他六点起床，立刻就洗了澡。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe nach Hause gegangen. | Ich bin nach Hause gegangen. | 位移动词用 sein |
| Ich bin mich gewaschen. | Ich habe mich gewaschen. | 反身动词一律用 haben |
| Ich habe studiert Medizin.（语序） | Ich habe Medizin studiert. | 分词必须在句末 |
| Ich habe gestudiert. | Ich habe studiert. | -ieren 动词不加 ge- |
"""

AUTHORED['动词/过去完成时'] = """
# 过去完成时（Plusquamperfekt）

> CEFR B1 · 关键词：Plusquamperfekt, nachdem, Vorzeitigkeit

过去完成时表示 **「过去的过去」**：在某个过去事件之前已经完成的事。
构成：**hatte / war（过去时）+ 第二分词**。
助动词的选择规则与现在完成时完全相同。

## 一、形式

| 人称 | machen | fahren |
| :--- | :--- | :--- |
| ich | hatte gemacht | war gefahren |
| du | hattest gemacht | warst gefahren |
| er/sie/es | hatte gemacht | war gefahren |
| wir | hatten gemacht | waren gefahren |
| ihr | hattet gemacht | wart gefahren |
| sie/Sie | hatten gemacht | waren gefahren |

## 二、与 nachdem 的固定配合

德语要求主从句之间有明确的时间落差，**nachdem 从句用过去完成时，主句用过去时**
（或从句用现在完成时，主句用现在时）：

| 从句 | 主句 |
| :--- | :--- |
| Plusquamperfekt | Präteritum |
| Perfekt | Präsens |

**Nachdem er gefrühstückt hatte, fuhr er ins Büro.**
他吃完早饭以后开车去了办公室。

**Nachdem ich das Formular ausgefüllt habe, schicke ich es ab.**
我填完表就把它寄出去。

反过来，bevor 从句和主句 **时态相同**：
**Bevor ich ins Bett gehe, putze ich mir die Zähne.**

## 三、单独使用时表示补充说明

**Ich konnte nicht mitkommen. Ich hatte mein Portemonnaie verloren.**
我没能一起去，我把钱包丢了。（解释前一句的原因）

## 四、例句

**Als wir ankamen, war der Zug schon abgefahren.**
我们到的时候火车已经开走了。

**Sie erzählte mir, was sie in Italien erlebt hatte.**
她给我讲了她在意大利经历的事。

**Nachdem die Gäste gegangen waren, räumten wir auf.**
客人走后我们收拾了房间。

**Er hatte drei Jahre in China gelebt, bevor er nach Berlin zog.**
他搬到柏林之前在中国生活了三年。

**Ich war müde, weil ich die ganze Nacht gearbeitet hatte.**
我很累，因为我工作了一整夜。

**Kaum hatte ich mich hingesetzt, klingelte das Telefon.**
我刚坐下电话就响了。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Nachdem er kam, aßen wir. | Nachdem er gekommen war, aßen wir. | nachdem 从句必须前时 |
| Ich hatte gestern gearbeitet.（单说昨天的事） | Ich habe gestern gearbeitet. | 没有参照点时不用过去完成时 |
| Nachdem ich gegessen hatte, gehe ich. | Nachdem ich gegessen habe, gehe ich. | 时态配对要一致 |
| Bevor er gegangen war, aß er. | Bevor er ging, aß er. | bevor 不用过去完成时 |
"""

AUTHORED['动词/将来时'] = """
# 第一将来时与第二将来时（Futur I und II）

> CEFR B1 · 关键词：Futur I, Futur II, Vermutung, werden

## 一、Futur I：werden + 不定式

| 人称 | 形式 |
| :--- | :--- |
| ich | werde kommen |
| du | wirst kommen |
| er/sie/es | wird kommen |
| wir | werden kommen |
| ihr | werdet kommen |
| sie/Sie | werden kommen |

## 二、Futur I 的三种意义

| 意义 | 说明 | 例 |
| :--- | :--- | :--- |
| 将来 | 没有时间状语时才必须用 | **Ich werde dich nicht vergessen.** |
| 推测（加 wohl, sicher, wahrscheinlich） | 对现在的推测 | **Er wird wohl krank sein.** 他大概病了。 |
| 强烈要求或承诺 | 语气重 | **Du wirst jetzt sofort dein Zimmer aufräumen!** |

日常表达将来，德语更常用 **现在时加时间状语**：
**Morgen fahre ich nach Köln.** 比 Ich werde morgen nach Köln fahren. 自然得多。

## 三、Futur II：werden + 第二分词 + haben/sein

**Bis morgen werde ich den Bericht geschrieben haben.**
到明天我就把报告写完了。

**Er wird den Zug verpasst haben.**
他大概是没赶上火车。（对过去的推测，这是 Futur II 最常见的用法）

## 四、推测的强度阶梯

| 表达 | 确定度 |
| :--- | :--- |
| Er ist sicher zu Hause. | 很确定 |
| Er wird zu Hause sein. | 推测 |
| Er dürfte zu Hause sein. | 谨慎推测 |
| Er könnte zu Hause sein. | 可能 |
| Er muss zu Hause sein. | 根据证据推断，必然 |

## 五、例句

**In zehn Jahren werden wir ganz anders arbeiten.**
十年后我们的工作方式会完全不同。

**Das wirst du bereuen!**
你会后悔的！

**Sie wird schon wissen, was sie tut.**
她大概知道自己在做什么。

**Bis Ende des Jahres werden wir umgezogen sein.**
到年底我们就搬完家了。

**Er wird wohl im Stau gestanden haben.**
他大概是堵车了。

**Ich werde dir helfen, das verspreche ich.**
我会帮你的，我保证。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich werde morgen zu gehen. | Ich werde morgen gehen. | werden 后接不带 zu 的不定式 |
| Ich will morgen kommen.（想说「我将来」） | Ich komme morgen. | wollen 是「想要」，不是将来时 |
| Ich werde gegangen. | Ich werde gehen. / Ich bin gegangen. | 混淆将来时与被动、完成时 |
| Er wird zu Hause gewesen. | Er wird zu Hause gewesen sein. | Futur II 需要 sein/haben 结尾 |
"""

AUTHORED['动词/可分与不可分动词'] = """
# 可分动词与不可分动词（trennbare und untrennbare Verben）

> CEFR A2 · 关键词：trennbares Verb, Präfix, Satzklammer

德语用前缀大量派生新动词。前缀是否与词干分离，决定了整句的语序。

## 一、判定规则：重音在哪里

| 类型 | 重音 | 前缀 | 例 |
| :--- | :--- | :--- | :--- |
| 可分 | 在前缀 | ab-, an-, auf-, aus-, bei-, ein-, mit-, nach-, vor-, zu-, zurück-, weg-, hin-, her-, los-, statt-, teil- | **an**rufen, **auf**stehen, **ein**kaufen |
| 不可分 | 在词干 | be-, emp-, ent-, er-, ge-, miss-, ver-, zer- | be**su**chen, ver**ste**hen, er**klä**ren |
| 两可 | 视意义 | durch-, über-, um-, unter-, wieder-, wider- | **um**ziehen 搬家（可分）／um**ge**hen mit 对待（不可分） |

## 二、可分动词在句中的四种表现

| 句型 | 例 |
| :--- | :--- |
| 主句现在时 | Ich **rufe** dich morgen **an**. |
| 完成时 | Ich **habe** dich gestern **angerufen**.（ge 插在中间） |
| 带 zu 不定式 | Ich versuche, dich **anzurufen**.（zu 插在中间） |
| 从句 | ..., weil ich dich **anrufe**.（重新合体，动词整体在末位） |
| 情态动词 | Ich muss dich **anrufen**.（不分开，因为不是变位形式） |
| 命令式 | **Ruf** mich bitte **an**! |

## 三、不可分动词

不可分动词永远是一个词，第二分词 **不加 ge-**：

* **Ich besuche meine Oma. / Ich habe meine Oma besucht.**
* **Er versteht das nicht. / Er hat das nicht verstanden.**

## 四、同一前缀，两种意义

| 动词 | 可分（具体义） | 不可分（抽象义） |
| :--- | :--- | :--- |
| übersetzen | **über**setzen 摆渡：Der Fährmann setzte uns über. | über**setzen** 翻译：Er übersetzt den Text. |
| umfahren | **um**fahren 撞倒：Er fuhr den Pfosten um. | um**fahren** 绕行：Wir umfahren die Stadt. |
| durchschauen | **durch**schauen 看穿（透过） | durch**schauen** 识破某人 |

## 五、例句

**Der Zug fährt um 8 Uhr ab.**
火车八点开。

**Steh bitte endlich auf!**
你终于该起床了！

**Ich habe gestern im Supermarkt eingekauft.**
我昨天在超市买了东西。

**Vergiss nicht, das Licht auszumachen!**
别忘了关灯。

**Sie hat mich nicht zurückgerufen, obwohl sie es versprochen hatte.**
她没给我回电话，尽管她答应过。

**Wir müssen morgen früh aufstehen, weil der Flug um sechs abfliegt.**
我们明早得早起，因为航班六点起飞。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich anrufe dich. | Ich rufe dich an. | 主句必须分开 |
| Ich habe geanrufen. | Ich habe angerufen. | ge 插在前缀和词干之间 |
| Ich versuche anzurufen dich. | Ich versuche, dich anzurufen. | 不定式在句末 |
| ..., weil ich rufe dich an. | ..., weil ich dich anrufe. | 从句中动词合体并置末位 |
"""

AUTHORED['动词/命令式'] = """
# 命令式（Imperativ）

> CEFR A1 · 关键词：Imperativ, Aufforderung, Höflichkeit

命令式用于请求、命令、建议、指示。德语有三个真正的命令式形式，
外加 wir 形式的建议句。

## 一、构成

| 对象 | 规则 | kommen | geben | sein | haben | fahren |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| du | 现在时 du 形式去掉 -st 和主语 | Komm! | Gib! | Sei! | Hab! | Fahr! |
| ihr | 与现在时 ihr 形式相同 | Kommt! | Gebt! | Seid! | Habt! | Fahrt! |
| Sie | 不定式 + Sie | Kommen Sie! | Geben Sie! | Seien Sie! | Haben Sie! | Fahren Sie! |
| wir（建议） | 不定式 + wir | Kommen wir! | — | Seien wir! | — | Fahren wir! |

两条细则：
* **e → i(e)** 的换元音动词，du 命令式保留换元音：geben → **Gib!**，
  lesen → **Lies!**，nehmen → **Nimm!**，helfen → **Hilf!**，sprechen → **Sprich!**。
* **a → ä** 的动词命令式 **不变音**：fahren → **Fahr!**，schlafen → **Schlaf!**，
  laufen → **Lauf!**。

词干以 -t, -d, -ig, -er, -el 结尾时 du 命令式常加 -e：
**Arbeite!** **Entschuldige!** **Öffne!**

## 二、可分动词与反身动词

* **Ruf mich an!** / **Rufen Sie mich an!**（前缀到句末）
* **Setz dich!** / **Setzen Sie sich!**（反身代词随人称变）
* **Beeilt euch!** 你们快点！

## 三、让语气变客气的手段

| 手段 | 例 |
| :--- | :--- |
| bitte | **Komm bitte pünktlich!** |
| mal / doch / doch mal | **Ruf mich doch mal an!** |
| 疑问句 | **Könnten Sie mir bitte helfen?** |
| 虚拟式二式 | **Würden Sie bitte kurz warten?** |
| 陈述句表要求 | **Sie gehen jetzt bitte nach Hause.** |

## 四、其他表达要求的方式

* 不定式（公告、说明书）：**Bitte nicht rauchen!** **Vor Gebrauch schütteln.**
* 第二分词（口令）：**Aufgepasst!** 注意！
* sollen（转达命令）：**Du sollst sofort kommen.**（有人让你马上来）

## 五、例句

**Mach bitte das Fenster zu!**
请把窗户关上。

**Seid bitte leise, das Baby schläft.**
请你们小声点，宝宝在睡觉。

**Nehmen Sie bitte Platz.**
请您就座。

**Sprich bitte etwas langsamer!**
请你说慢一点。

**Gehen wir ins Kino!**
我们去看电影吧。

**Vergiss deinen Schlüssel nicht!**
别忘了你的钥匙。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Du komm! | Komm! | du 命令式不带主语 |
| Fähr! | Fahr! | a 变 ä 的动词命令式不变音 |
| Geb mir das Buch! | Gib mir das Buch! | e 变 i 的换元音必须保留 |
| Sein Sie ruhig! | Seien Sie ruhig! | sein 的 Sie 命令式不规则 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 动词：语态与式
# ---------------------------------------------------------------------------
AUTHORED['动词/过程被动'] = """
# 过程被动（Vorgangspassiv）

> CEFR B1 · 关键词：Passiv, werden, Partizip II, von, durch

德语的被动分两种。**过程被动** 强调「正在发生的动作」，
构成是 **werden + 第二分词**。它把注意力从「谁做」转移到「做了什么」，
是新闻、说明书、学术文章的基本句式。

## 一、六个时态的形式（以 der Brief 为例）

| 时态 | 形式 | 汉语 |
| :--- | :--- | :--- |
| 现在时 | Der Brief **wird** geschrieben. | 信正在被写 |
| 过去时 | Der Brief **wurde** geschrieben. | 信被写了 |
| 现在完成时 | Der Brief **ist** geschrieben **worden**. | 信已被写 |
| 过去完成时 | Der Brief **war** geschrieben **worden**. | 信当时已被写 |
| 第一将来时 | Der Brief **wird** geschrieben **werden**. | 信将被写 |
| 情态动词 | Der Brief **muss** geschrieben **werden**. | 信必须写 |

完成时用 **worden**（不是 geworden），这是被动的标志。

## 二、主动变被动的规则

| 主动 | 被动 |
| :--- | :--- |
| 主语（施动者） | **von + 第三格**（人）或 **durch + 第四格**（手段、原因），可省略 |
| 第四格宾语 | 第一格主语 |
| 第三格宾语 | **保持第三格** |
| 变位动词 | werden + 第二分词 |

**Der Lehrer erklärt den Schülern die Regel.**
→ **Die Regel wird den Schülern (vom Lehrer) erklärt.**
规则（由老师）向学生们讲解。

注意第三格 den Schülern 不变，德语不能说 Die Schüler werden erklärt。

## 三、无人称被动

不及物动词也能被动，用来表达「（有人）在做某事」这种泛指：

**Hier wird gearbeitet.** 这里在干活。
**Es wurde viel gelacht.** 大家笑了很多。
（es 只在句首出现，被别的成分占据前场时消失。）

## 四、不能构成被动的动词

haben, bekommen, kennen, wissen, besitzen, kosten, es gibt 以及所有
反身动词和不及物的 sein/bleiben 类动词，都没有被动式。

## 五、例句

**Das neue Museum wird nächstes Jahr eröffnet.**
新博物馆明年开放。

**Die Fenster müssen dringend geputzt werden.**
窗户急需擦洗。

**Mir wurde gesagt, dass die Sitzung verschoben wird.**
有人告诉我会议要推迟。

**Der Vertrag ist bereits von beiden Seiten unterschrieben worden.**
合同已由双方签署。

**Durch das Erdbeben wurden viele Häuser zerstört.**
许多房屋被地震摧毁。

**In Deutschland wird sonntags nicht gearbeitet.**
在德国星期天不上班。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Der Brief ist geschrieben geworden. | ... ist geschrieben worden. | 被动完成时用 worden |
| Die Schüler werden die Regel erklärt. | Den Schülern wird die Regel erklärt. | 第三格宾语不能变主语 |
| Das Haus wird von dem Sturm zerstört. | ... durch den Sturm zerstört. | 非人施动者用 durch |
| Das Buch wird gelesen werden müssen.（语序） | Das Buch wird gelesen werden müssen. | 情态动词的被动不定式排列固定，勿颠倒 |
"""

AUTHORED['动词/状态被动'] = """
# 状态被动与被动替代形式（Zustandspassiv und Passiversatz）

> CEFR B2 · 关键词：Zustandspassiv, sein + Partizip II, Passiversatz

## 一、状态被动：sein + 第二分词

强调动作 **完成后留下的状态**，不关心谁做的、什么时候做的。

| 过程被动 | 状态被动 |
| :--- | :--- |
| Das Geschäft **wird** um 8 Uhr **geöffnet**. 商店八点开门（动作） | Das Geschäft **ist** ab 8 Uhr **geöffnet**. 商店八点起是开着的（状态） |
| Der Tisch **wird** gedeckt. 正在摆桌子 | Der Tisch **ist** gedeckt. 桌子摆好了 |
| Die Tür **wurde** geschlossen. 门被关上了 | Die Tür **war** geschlossen. 门当时是关着的 |

状态被动只有两个常用时态：现在时（ist ...）和过去时（war ...）。

## 二、五种被动替代形式

| 形式 | 意义 | 例 | 等值 |
| :--- | :--- | :--- | :--- |
| man + 主动 | 最口语 | **Man repariert das Auto.** | Das Auto wird repariert. |
| sich lassen + 不定式 | 可以被 | **Das lässt sich leicht reparieren.** | Das kann leicht repariert werden. |
| sein + zu + 不定式 | 必须或可以被 | **Das Formular ist auszufüllen.** | Das Formular muss ausgefüllt werden. |
| 形容词 -bar / -lich | 可被 | **Das Wasser ist trinkbar.** | Das Wasser kann getrunken werden. |
| sich + 副词 | 主语本身的性质 | **Das Buch liest sich gut.** | Das Buch kann gut gelesen werden. |

## 三、bekommen 被动（Dativpassiv）

口语里可以把第三格宾语变成主语，用 bekommen / kriegen：

**Er bekommt ein Buch geschenkt.** 有人送他一本书。
（等于 Ihm wird ein Buch geschenkt.）

## 四、例句

**Die Rechnung ist schon bezahlt.**
账单已经付过了。（状态）

**Das Problem lässt sich nicht so einfach lösen.**
这个问题没那么容易解决。

**Diese Aufgabe ist bis Freitag zu erledigen.**
这项任务必须在周五前完成。

**Der Text ist kaum lesbar.**
这段文字几乎无法辨认。

**Man sollte hier vorsichtiger sein.**
这里应该更小心些。

**Sie hat den Führerschein geschenkt bekommen.**
她的驾照是别人出钱给她考的。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Das Geschäft ist um 8 Uhr geöffnet worden.（想说营业时间） | Das Geschäft ist ab 8 Uhr geöffnet. | 状态用 sein，不加 worden |
| Das lässt leicht reparieren. | Das lässt **sich** leicht reparieren. | 必须带反身代词 |
| Das ist zu ausfüllen. | Das ist auszufüllen. | 可分动词 zu 插在中间 |
| Die Tür ist geschlossen worden seit gestern. | Die Tür ist seit gestern geschlossen. | 持续状态用状态被动 |
"""

AUTHORED['动词/情态动词'] = """
# 情态动词（Modalverben）

> CEFR A1 · 关键词：Modalverb, können, müssen, dürfen, wollen, sollen, mögen

六个情态动词加上 möchten，构成德语表达意愿、能力、必要、许可的核心。
它们的共同点：**后接不带 zu 的不定式，不定式在句末**。

## 一、现在时变位（ich 和 er 同形且无词尾）

| 人称 | können | müssen | dürfen | wollen | sollen | mögen | möchten |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ich | kann | muss | darf | will | soll | mag | möchte |
| du | kannst | musst | darfst | willst | sollst | magst | möchtest |
| er/sie/es | kann | muss | darf | will | soll | mag | möchte |
| wir | können | müssen | dürfen | wollen | sollen | mögen | möchten |
| ihr | könnt | müsst | dürft | wollt | sollt | mögt | möchtet |
| sie/Sie | können | müssen | dürfen | wollen | sollen | mögen | möchten |

过去时一律弱变化且 **去掉变音**：konnte, musste, durfte, wollte, sollte, mochte。

## 二、意义

| 动词 | 核心意义 | 例 |
| :--- | :--- | :--- |
| können | 能力、可能、许可（口语） | **Ich kann schwimmen.** 我会游泳。 |
| müssen | 必要、义务 | **Ich muss arbeiten.** 我必须工作。 |
| dürfen | 许可（正式） | **Darf ich rauchen?** 我可以抽烟吗？ |
| wollen | 主观意愿、打算 | **Er will Arzt werden.** 他想当医生。 |
| sollen | 他人的要求、建议、道德 | **Du sollst nicht lügen.** 你不该撒谎。 |
| mögen | 喜欢（多用于名词宾语） | **Ich mag Kaffee.** |
| möchten | 想要（客气的 wollen） | **Ich möchte einen Kaffee.** |

## 三、否定的陷阱

| 表达 | 意义 |
| :--- | :--- |
| nicht müssen | **不必**（不是「不许」） |
| nicht dürfen | **不许、禁止** |
| nicht können | 不能、不会 |
| nicht brauchen zu | 不必（等于 nicht müssen） |

**Du musst nicht kommen.** 你不必来。
**Du darfst nicht kommen.** 你不许来。

## 四、完成时：双不定式

带不定式时，情态动词的完成时用 **不定式形式**（Ersatzinfinitiv）：

**Ich habe arbeiten müssen.**（不是 gemusst）
但没有不定式时用正常第二分词：**Ich habe es nicht gekonnt.**

口语中通常直接用过去时：**Ich musste arbeiten.**

## 五、例句

**Können Sie mir sagen, wie spät es ist?**
您能告诉我几点了吗？

**Hier darf man nicht parken.**
这里不许停车。

**Ich muss noch zur Post, bevor sie schließt.**
邮局关门前我还得去一趟。（情态动词可省略位移动词）

**Was soll ich jetzt machen?**
我现在该怎么办？

**Sie wollte gestern anrufen, hat es aber vergessen.**
她昨天想打电话，但忘了。

**Ich hätte das nicht sagen sollen.**
我不该说那话的。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich kann zu schwimmen. | Ich kann schwimmen. | 情态动词后不带 zu |
| Du musst nicht rauchen!（想说禁止） | Du darfst nicht rauchen! | nicht müssen 是「不必」 |
| Ich habe arbeiten gemusst. | Ich habe arbeiten müssen. | 双不定式 |
| Ich will einen Kaffee, bitte. | Ich möchte einen Kaffee, bitte. | wollen 在服务场景显得生硬 |
"""

AUTHORED['动词/情态动词主观用法'] = """
# 情态动词的主观用法（subjektiver Gebrauch）

> CEFR C1 · 关键词：subjektive Modalität, Vermutung, Hörensagen

同样六个情态动词，还有第二套意义：它们不再描述主语的能力或义务，
而是表达 **说话人对命题真实性的判断**，或者「据说」。
识别标志：句子常与推测副词或完成时不定式连用。

## 一、推测强度阶梯

| 情态动词 | 确定度 | 例 | 汉语 |
| :--- | :--- | :--- | :--- |
| müssen | 90 至 100 %，有证据 | **Er muss krank sein.** | 他一定病了 |
| dürfte | 约 75 %，谨慎 | **Er dürfte schon zu Hause sein.** | 他多半到家了 |
| können / könnte | 约 50 % | **Das könnte stimmen.** | 这可能是对的 |
| mögen | 让步性承认 | **Das mag sein, aber ...** | 也许吧，不过…… |
| kann nicht | 排除 | **Das kann nicht wahr sein.** | 这不可能是真的 |

## 二、转述：sollen 与 wollen

| 动词 | 意义 | 例 |
| :--- | :--- | :--- |
| sollen | **据说**（别人说的） | **Er soll sehr reich sein.** 据说他很有钱。 |
| wollen | **自称**（主语自己说的，说话人存疑） | **Er will alles gesehen haben.** 他声称他什么都看见了。 |

这一对区别是 C1 考试的常见考点：sollen 的信息来源是第三方，
wollen 的信息来源是主语本人。

## 三、指向过去：加完成时不定式

主观用法表示对 **过去** 的推测时，用 **情态动词 + 第二分词 + haben/sein**：

* **Er muss den Zug verpasst haben.** 他一定是没赶上火车。
* **Sie kann nicht gelogen haben.** 她不可能撒了谎。
* **Er soll im Ausland gewesen sein.** 据说他当时在国外。

## 四、与客观用法的对比

| 句子 | 客观 | 主观 |
| :--- | :--- | :--- |
| Er muss arbeiten. | 他必须工作 | — |
| Er muss krank sein. | — | 他一定病了 |
| Sie kann Klavier spielen. | 她会弹钢琴 | — |
| Sie kann im Büro sein. | — | 她可能在办公室 |

判断方法：如果不定式是 sein / haben / 状态动词，多半是主观用法。

## 五、例句

**Der Chef muss das gewusst haben.**
老板一定知道这件事。

**Das Restaurant soll ausgezeichnet sein.**
据说这家餐厅非常好。

**Er will von nichts gewusst haben.**
他声称自己什么都不知道。

**Sie dürfte inzwischen angekommen sein.**
她这会儿应该到了。

**Das kann doch nicht dein Ernst sein!**
你不会是认真的吧！

**Die Firma mag Probleme haben, aber sie zahlt pünktlich.**
这家公司也许有问题，但付款准时。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Er soll reich sein.（想说「他自称有钱」） | Er will reich sein. | sollen 是他人转述 |
| Er muss verpasst den Zug haben. | Er muss den Zug verpasst haben. | 语序：第二分词加 haben 在末尾 |
| Er kann nicht wahr sein. | Das kann nicht wahr sein. | 主语要与命题匹配 |
| Er dürfte zu Hause sein müssen. | Er dürfte zu Hause sein. | 两个主观情态动词不叠加 |
"""

AUTHORED['动词/反身动词'] = """
# 反身动词（reflexive Verben）

> CEFR A2 · 关键词：reflexives Verb, sich, Präpositionalobjekt

德语的反身动词数量远多于汉语，许多在汉语里根本没有「自己」这个意思，
必须整体记忆：**sich beeilen** 不是「赶自己」，就是「赶紧」。

## 一、三类反身动词

| 类别 | 特点 | 例 |
| :--- | :--- | :--- |
| 真反身 | 去掉 sich 就不成词 | sich beeilen 赶紧、sich erholen 休养、sich schämen 羞愧、sich verspäten 迟到、sich befinden 位于、sich weigern 拒绝 |
| 假反身 | 也可带其他宾语 | sich waschen / das Kind waschen |
| 相互 | 复数「互相」 | sich treffen, sich streiten, sich einigen |

## 二、必背的真反身动词表

| 动词 | 汉语 | 例句 |
| :--- | :--- | :--- |
| sich beeilen | 赶紧 | **Beeil dich!** |
| sich erholen | 休养 | **Ich habe mich gut erholt.** |
| sich erkälten | 感冒 | **Er hat sich erkältet.** |
| sich verspäten | 迟到 | **Der Zug hat sich verspätet.** |
| sich befinden | 位于 | **Das Museum befindet sich im Zentrum.** |
| sich verlieben in + A | 爱上 | **Sie hat sich in ihn verliebt.** |
| sich entschuldigen bei + D / für + A | 道歉 | **Ich entschuldige mich für die Verspätung.** |
| sich bedanken bei + D / für + A | 致谢 | **Ich bedanke mich für Ihre Hilfe.** |
| sich entscheiden für + A | 决定 | **Wir haben uns für das Hotel entschieden.** |
| sich vorstellen（第四格） | 自我介绍 | **Darf ich mich vorstellen?** |
| sich vorstellen（第三格） | 想象 | **Das kann ich mir nicht vorstellen.** |
| sich unterhalten mit + D über + A | 交谈 | **Wir unterhielten uns über Politik.** |

注意 **sich vorstellen** 一词两义，靠反身代词的格区分，这是高频考点。

## 三、语序

| 情况 | 位置 | 例 |
| :--- | :--- | :--- |
| 主语是名词 | 反身代词紧跟动词 | **Gestern hat sich mein Bruder verletzt.** |
| 主语是代词 | 反身代词在主语之后 | **Gestern hat er sich verletzt.** |
| 从句 | 紧跟主语 | ..., weil **er sich** verletzt hat. |

## 四、完成时一律用 haben

即使是位移意味的反身动词也用 haben：**Ich habe mich beeilt.**

## 五、例句

**Ich interessiere mich sehr für deutsche Geschichte.**
我对德国历史很感兴趣。

**Wir müssen uns beeilen, sonst verpassen wir den Bus.**
我们得快点，不然赶不上公交。

**Hast du dich schon für einen Kurs angemeldet?**
你已经报名参加课程了吗？

**Sie hat sich beim Chef über die Arbeitszeiten beschwert.**
她向老板抱怨了工作时间。

**Erinnerst du dich noch an unseren ersten Tag?**
你还记得我们的第一天吗？

**Setz dich bitte und fühl dich wie zu Hause.**
请坐，别客气。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich bin mich beeilt. | Ich habe mich beeilt. | 反身动词用 haben |
| Ich stelle mich das vor.（想说「我想象」） | Ich stelle mir das vor. | 有第四格宾语时反身用第三格 |
| Ich freue auf die Ferien. | Ich freue mich auf die Ferien. | 不能丢反身代词 |
| Wir treffen morgen. | Wir treffen uns morgen. | 相互动词需要反身代词 |
"""

AUTHORED['动词/虚拟式二式构成'] = """
# 虚拟式二式：构成（Konjunktiv II — Formen）

> CEFR B1 · 关键词：Konjunktiv II, würde, Präteritumstamm

虚拟式二式（Konjunktiv II）以 **过去时词干** 为基础。
它不表示过去，而表示「不是事实」。

## 一、构成规则

1. 取 **过去时** 第一人称形式（ich kam, ich hatte, ich konnte）；
2. 强变化动词的 a / o / u **变音**（kam → käme, wurde → würde）；
3. 加词尾 **-e, -est, -e, -en, -et, -en**。

| 人称 | sein | haben | werden | kommen | können |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ich | wäre | hätte | würde | käme | könnte |
| du | wärst | hättest | würdest | kämest | könntest |
| er/sie/es | wäre | hätte | würde | käme | könnte |
| wir | wären | hätten | würden | kämen | könnten |
| ihr | wärt | hättet | würdet | kämet | könntet |
| sie/Sie | wären | hätten | würden | kämen | könnten |

## 二、必须掌握的原形二式

| 不定式 | 二式 | 不定式 | 二式 |
| :--- | :--- | :--- | :--- |
| sein | wäre | müssen | müsste |
| haben | hätte | dürfen | dürfte |
| werden | würde | sollen | sollte（不变音） |
| können | könnte | wollen | wollte（不变音） |
| wissen | wüsste | gehen | ginge |
| geben | gäbe | kommen | käme |
| lassen | ließe | tun | täte |
| bleiben | bliebe | finden | fände |
| brauchen | bräuchte | nehmen | nähme |

## 三、würde + 不定式：安全万能式

弱变化动词的二式与过去时完全同形（machte = machte），
听不出虚拟语气，所以除上表那些常用词以外，一律用 **würde + 不定式**：

* **Ich würde dir gern helfen.**（不说 Ich hülfe dir gern.）
* **Was würdest du an meiner Stelle machen?**

规则：sein, haben, werden, 情态动词, wissen 用原形二式；其余用 würde。

## 四、过去的虚拟式：只有一个形式

**hätte / wäre + 第二分词**，不管原句是过去时、完成时还是过去完成时：

* **Ich hätte mehr lernen sollen.** 我本该多学一点。
* **Wenn du gekommen wärst, hätten wir uns gefreut.**
  你要是来了，我们会很高兴的。

情态动词的过去虚拟式用双不定式：**hätte ... machen können**。

## 五、例句

**Wenn ich Zeit hätte, käme ich mit.**
我要是有时间就一起去了。

**Ich wäre dir sehr dankbar, wenn du mir helfen würdest.**
如果你能帮我，我会非常感激。

**Das hätte ich nicht gedacht.**
这我可没想到。

**An deiner Stelle würde ich noch warten.**
换了我会再等等。

**Wir hätten den Zug fast verpasst.**
我们差点没赶上火车。

**Er tat so, als ob er nichts wüsste.**
他装作什么都不知道的样子。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich würde haben Zeit. | Ich hätte Zeit. | haben 用原形二式 |
| Wenn ich reich wäre, würde ich sein glücklich. | ... wäre ich glücklich. | sein 用原形二式 |
| Ich hätte gegangen. | Ich wäre gegangen. | 助动词的选择与完成时一致 |
| Ich hätte kommen gekonnt. | Ich hätte kommen können. | 双不定式 |
"""

AUTHORED['动词/虚拟式二式用法'] = """
# 虚拟式二式：用法（Konjunktiv II — Gebrauch）

> CEFR B1 · 关键词：Irrealis, Wunsch, Höflichkeit, Ratschlag

一句话概括：**凡是「不是真的」和「不好意思直说」的场合，都用二式。**

## 一、六大用法

| 用法 | 例句 | 汉语 |
| :--- | :--- | :--- |
| 非现实条件 | **Wenn ich Geld hätte, würde ich reisen.** | 我要是有钱就去旅行 |
| 非现实愿望 | **Wenn ich nur mehr Zeit hätte!** | 我要是有更多时间就好了 |
| 客气请求 | **Könnten Sie mir bitte helfen?** | 您能帮我一下吗 |
| 建议 | **An deiner Stelle würde ich kündigen.** | 换了我会辞职 |
| 非现实比较 | **Er tut, als ob er alles wüsste.** | 他装得好像什么都知道 |
| 差一点 | **Ich wäre fast gestürzt.** | 我差点摔倒 |

## 二、非现实条件句的三种语序

1. **Wenn ich Zeit hätte, würde ich kommen.**
2. 主句在前：**Ich würde kommen, wenn ich Zeit hätte.**
3. 省略 wenn，动词提到句首：**Hätte ich Zeit, würde ich kommen.**（书面）

指向过去时全部换成 hätte/wäre + 第二分词：
**Wenn ich Zeit gehabt hätte, wäre ich gekommen.**
我当时要是有时间就来了。

## 三、愿望句

* 带 wenn：**Wenn er doch endlich anriefe!**
* 不带 wenn（动词打头）：**Hätte ich das nur gewusst!**
* 常加语气词 **doch, nur, bloß** 加强。

## 四、礼貌的等级

| 说法 | 礼貌度 |
| :--- | :--- |
| Gib mir das Salz. | 直接 |
| Kannst du mir das Salz geben? | 一般 |
| Könntest du mir das Salz geben? | 客气 |
| Würden Sie mir bitte das Salz reichen? | 很客气 |
| Wären Sie so freundlich, mir das Salz zu reichen? | 非常正式 |

## 五、例句

**Wenn das Wetter besser wäre, könnten wir grillen.**
天气要是好一点，我们就能烧烤了。

**Ich hätte gern zwei Kilo Äpfel.**
我想要两公斤苹果。（商店用语）

**Du solltest wirklich mehr schlafen.**
你真该多睡点。

**Beinahe hätte ich den Termin vergessen.**
我差点忘了这个约。

**Er spricht Deutsch, als wäre er hier geboren.**
他德语说得就像在这里出生一样。

**Ohne deine Hilfe hätte ich das nie geschafft.**
没有你的帮助我绝不可能做成。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Wenn ich Zeit hätte, komme ich. | ..., käme ich / würde ich kommen. | 主从句都要用二式 |
| Wenn ich reich wäre gewesen | Wenn ich reich gewesen wäre | 语序：助动词在最后 |
| Ich möchte gern zwei Kilo Äpfel haben.（商店） | Ich hätte gern zwei Kilo Äpfel. | 固定说法更自然 |
| als ob er weiß alles | als ob er alles wüsste | als ob 后动词末位且用二式 |
"""

AUTHORED['动词/虚拟式一式'] = """
# 虚拟式一式与间接引语（Konjunktiv I und indirekte Rede）

> CEFR B2 · 关键词：Konjunktiv I, indirekte Rede, Distanz

虚拟式一式的唯一功能是 **转述别人的话而不表态**。
它是德语新闻、法庭记录、学术引用的标志性形式：
用了一式，读者就知道「这是别人说的，作者不担保真假」。

## 一、构成：不定式词干 + -e, -est, -e, -en, -et, -en

| 人称 | machen | fahren | haben | werden | können | sein |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ich | mache | fahre | habe | werde | könne | **sei** |
| du | machest | fahrest | habest | werdest | könnest | seiest |
| er/sie/es | mach**e** | fahr**e** | hab**e** | werd**e** | könn**e** | **sei** |
| wir | machen | fahren | haben | werden | können | seien |
| ihr | machet | fahret | habet | werdet | könnet | seiet |
| sie/Sie | machen | fahren | haben | werden | können | seien |

只有 sein 不规则；第三人称单数没有 -t，这是识别一式的关键。

## 二、替代规则（非常重要）

当一式形式与直陈式 **完全相同** 时（如 sie machen = sie machen），
必须换用 **二式**；二式若也不清楚，用 **würde + 不定式**。

| 人称 | 优先 | 实际常用 |
| :--- | :--- | :--- |
| er/sie/es | 一式 | er komme, er habe, er sei |
| sie（复数）、ich | 一式与直陈式同形 | 换二式：sie kämen, sie hätten |

## 三、三个时间层次

| 直接引语 | 间接引语 |
| :--- | :--- |
| 现在：Ich **bin** krank. | Er sagt, er **sei** krank. |
| 过去（三种时态都一样）：Ich **war / bin gewesen / war gewesen** krank. | Er sagt, er **sei** krank **gewesen**. |
| 将来：Ich **werde** kommen. | Er sagt, er **werde** kommen. |

## 四、其他必要的转换

* 人称代词随视角改变：Ich → er / sie。
* 时间地点词：heute → an jenem Tag、hier → dort。
* 疑问句用 ob 或疑问词引导：
  **Er fragte, ob ich Zeit hätte.** 他问我有没有时间。
* 命令用 solle / möge：**Sie sagte, ich solle warten.** 她说我该等着。

## 五、例句

**Der Sprecher erklärte, die Regierung habe keine andere Wahl gehabt.**
发言人解释说，政府当时没有别的选择。

**Sie behauptet, sie sei zu diesem Zeitpunkt nicht im Büro gewesen.**
她声称她当时不在办公室。

**Die Zeitung berichtet, der Minister werde am Freitag zurücktreten.**
报纸报道说部长将于周五辞职。

**Er sagte, er könne uns leider nicht helfen.**
他说他很遗憾不能帮我们。

**Man fragte ihn, wo er die Nacht verbracht habe.**
有人问他那晚在哪里过的。

**Der Arzt riet ihm, er solle mehr Sport treiben.**
医生建议他多运动。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Er sagt, er ist krank.（正式文体） | Er sagt, er sei krank. | 书面转述用一式 |
| Sie sagen, sie machen das.（歧义） | Sie sagen, sie machten das. | 与直陈式同形时换二式 |
| Er sagte, er hätte gestern gekommen. | Er sagte, er sei gestern gekommen. | 助动词选择不变 |
| Er fragte, ob habe ich Zeit. | Er fragte, ob ich Zeit hätte. | 从句动词末位 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 动词：句型与结构
# ---------------------------------------------------------------------------
AUTHORED['动词/带zu不定式'] = """
# 带 zu 的不定式（Infinitiv mit zu）

> CEFR B1 · 关键词：Infinitivsatz, zu, um zu

不定式短语是 dass 从句的轻量替代：**主语相同时，用不定式更地道**。

## 一、基本形式

* **Ich habe vergessen, die Tür abzuschließen.** 我忘了锁门。
* 可分动词：zu 插在前缀与词干之间 → **abzuschließen, einzukaufen**。
* 完成不定式：**Er behauptet, alles gelesen zu haben.** 他声称都读过了。
* 被动不定式：**Er hofft, eingeladen zu werden.** 他希望被邀请。

## 二、什么时候可以用不定式代替 dass 从句

| 条件 | 例 |
| :--- | :--- |
| 主句主语 = 从句主语 | Ich hoffe, dass ich bald komme. → Ich hoffe, bald zu kommen. |
| 主句宾语 = 从句主语 | Ich bitte dich, dass du kommst. → Ich bitte dich zu kommen. |
| 主语不同 | **不能** 转换，必须保留 dass 从句 |

## 三、常见的引导词

| 类别 | 例词 | 例句 |
| :--- | :--- | :--- |
| 动词 | versuchen, hoffen, vergessen, beginnen, aufhören, versprechen, vorschlagen, empfehlen, erlauben, verbieten, bitten | **Er versprach, pünktlich zu sein.** |
| 名词加 haben/sein | Lust, Zeit, Angst, Gelegenheit, Absicht | **Ich habe keine Lust auszugehen.** |
| 形容词加 sein | wichtig, schwer, leicht, möglich, schön, verboten | **Es ist verboten, hier zu parken.** |
| 介词 | um, ohne, (an)statt | **Er ging, ohne sich zu verabschieden.** |

## 四、三个介词性不定式

| 结构 | 意义 | 替代从句（主语不同时） |
| :--- | :--- | :--- |
| um ... zu | 为了 | damit |
| ohne ... zu | 没有…… | ohne dass |
| (an)statt ... zu | 而不是 | (an)statt dass |

**Ich lerne Deutsch, um in Deutschland zu studieren.**
我学德语是为了在德国留学。
**Ich spare Geld, damit meine Tochter studieren kann.**
我攒钱是为了让我女儿能上大学。（主语不同，必须用 damit）

## 五、例句

**Es ist nicht leicht, eine Wohnung in München zu finden.**
在慕尼黑找房子不容易。

**Hast du Lust, heute Abend ins Kino zu gehen?**
你今晚有兴趣去看电影吗？

**Der Arzt hat mir empfohlen, mehr Sport zu treiben.**
医生建议我多运动。

**Sie ging weg, ohne ein Wort zu sagen.**
她一句话没说就走了。

**Anstatt zu arbeiten, spielt er den ganzen Tag Computerspiele.**
他整天打游戏而不工作。

**Ich freue mich darauf, dich wiederzusehen.**
我期待再见到你。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe vergessen zu abschließen die Tür. | ..., die Tür abzuschließen. | 不定式在末位，zu 插在可分动词中间 |
| Ich lerne Deutsch, um meine Eltern zu sein stolz. | ..., damit meine Eltern stolz sind. | 主语不同不能用 um zu |
| Ich muss zu gehen. | Ich muss gehen. | 情态动词后不带 zu |
| Ich hoffe, dass zu kommen. | Ich hoffe zu kommen. | dass 与 zu 不能并用 |
"""

AUTHORED['动词/不带zu不定式'] = """
# 不带 zu 的不定式与 AcI（Infinitiv ohne zu）

> CEFR B2 · 关键词：Ersatzinfinitiv, AcI, lassen, sehen, hören

## 一、哪些动词后面不带 zu

| 类别 | 动词 | 例 |
| :--- | :--- | :--- |
| 情态动词 | können, müssen, dürfen, wollen, sollen, mögen | **Ich muss gehen.** |
| werden（将来） | werden | **Ich werde gehen.** |
| 感官动词（AcI） | sehen, hören, fühlen, spüren | **Ich sehe ihn kommen.** |
| lassen | lassen | **Ich lasse ihn warten.** |
| 位移动词 | gehen, kommen, fahren, laufen | **Ich gehe schwimmen.** |
| 其他 | bleiben, helfen, lehren, lernen | **Er bleibt sitzen.** |

helfen, lernen, lehren 在短句中可以不带 zu，
补足语较长时通常加 zu：**Er half mir, den Schrank in den zweiten Stock zu tragen.**

## 二、AcI 结构（Akkusativ + Infinitiv）

「我看见他来」在德语里是 **第四格 + 不定式**：

* **Ich sehe ihn kommen.** = Ich sehe, dass er kommt.
* **Wir hörten die Kinder singen.** 我们听见孩子们在唱歌。
* **Sie fühlte ihr Herz schlagen.** 她感到自己的心在跳。

## 三、lassen 的四种意义

| 意义 | 例 | 汉语 |
| :--- | :--- | :--- |
| 让、允许 | **Lass mich in Ruhe!** | 别烦我 |
| 使、叫别人做 | **Ich lasse mir die Haare schneiden.** | 我去理发 |
| 留下、忘带 | **Ich habe den Schlüssel zu Hause gelassen.** | 我把钥匙落家里了 |
| sich lassen 表被动可能 | **Das lässt sich machen.** | 这事能办 |

## 四、完成时的双不定式（Ersatzinfinitiv）

这些动词在完成时不用第二分词，而用 **不定式**：

| 现在时 | 完成时 |
| :--- | :--- |
| Ich muss arbeiten. | Ich habe arbeiten **müssen**. |
| Ich lasse ihn warten. | Ich habe ihn warten **lassen**. |
| Ich sehe ihn kommen. | Ich habe ihn kommen **sehen**. |
| Ich helfe ihm tragen. | Ich habe ihm tragen **helfen**.（也可 geholfen） |

从句中出现双不定式时，**助动词跳到前面**（这是德语唯一的例外语序）：
**..., weil ich habe arbeiten müssen.**

## 五、例句

**Ich lasse mir jeden Monat die Haare schneiden.**
我每个月去理一次发。

**Hast du ihn gestern weggehen sehen?**
你昨天看见他走了吗？

**Sie ist einkaufen gegangen.**
她买东西去了。

**Bleib bitte sitzen, ich hole das schon.**
你坐着别动，我去拿。

**Er hat mich drei Stunden warten lassen.**
他让我等了三个小时。

**Ich kann das leider nicht machen lassen.**
这事我恐怕没法让人代办。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe arbeiten gemusst. | Ich habe arbeiten müssen. | 双不定式 |
| Ich sehe ihn zu kommen. | Ich sehe ihn kommen. | 感官动词后不带 zu |
| Ich lasse schneiden meine Haare. | Ich lasse mir die Haare schneiden. | 语序与第三格 |
| ..., weil ich arbeiten müssen habe. | ..., weil ich habe arbeiten müssen. | 双不定式时助动词前置 |
"""

AUTHORED['动词/支配介词的动词'] = """
# 支配介词的动词（Verben mit Präpositionen）

> CEFR B1 · 关键词：Präpositionalobjekt, feste Verbindung

这类搭配是德语学习的硬骨头：介词和格都固定，与汉语毫无对应。
背单词时必须连介词一起背：**warten auf + A**，而不是只背 warten。

## 一、按介词归类的高频表

| 介词 + 格 | 动词 | 例句 |
| :--- | :--- | :--- |
| auf + A | warten, sich freuen, achten, hoffen, sich verlassen, reagieren, verzichten, bestehen | **Ich warte auf den Bus.** |
| an + A | denken, sich erinnern, sich wenden, glauben, sich gewöhnen | **Denkst du oft an sie?** |
| an + D | teilnehmen, leiden, arbeiten, zweifeln, erkennen | **Er nimmt an der Sitzung teil.** |
| über + A | sprechen, sich freuen, sich ärgern, sich beschweren, nachdenken, lachen, berichten | **Wir sprechen über das Projekt.** |
| für + A | sich interessieren, sich bedanken, sorgen, sich entscheiden, halten | **Ich interessiere mich für Kunst.** |
| von + D | träumen, erzählen, abhängen, sich verabschieden, halten（评价） | **Was hältst du von dem Plan?** |
| mit + D | rechnen, anfangen, aufhören, sich beschäftigen, sich unterhalten, telefonieren | **Ich rechne mit Problemen.** |
| um + A | bitten, sich bewerben, sich kümmern, sich handeln, kämpfen | **Ich bitte dich um Hilfe.** |
| nach + D | fragen, sich erkundigen, suchen, riechen, schmecken | **Er fragt nach dem Weg.** |
| vor + D | Angst haben, warnen, schützen, sich fürchten | **Ich habe Angst vor Hunden.** |
| zu + D | gehören, gratulieren, einladen, führen, beitragen | **Ich gratuliere dir zum Geburtstag.** |

## 二、同一动词不同介词，意义不同

| 动词 | 搭配 | 意义 |
| :--- | :--- | :--- |
| sich freuen | auf + A | 期待将来 |
| sich freuen | über + A | 为已发生的事高兴 |
| bestehen | auf + A | 坚持 |
| bestehen | aus + D | 由……组成 |
| halten | von + D | 对……的评价 |
| halten | für + A | 认为是 |
| sprechen | mit + D | 和某人说 |
| sprechen | über/von + A/D | 谈论某事 |

## 三、提问与回答

| 指人 | 指物 |
| :--- | :--- |
| 疑问：**Auf wen** wartest du? | **Worauf** wartest du? |
| 回答：Auf **ihn**. | **Darauf**. |

## 四、例句

**Ich freue mich sehr auf die Sommerferien.**
我很期待暑假。

**Sie hat sich bei ihrem Chef über den Lärm beschwert.**
她向老板抱怨了噪音。

**Es hängt vom Wetter ab, ob wir wandern gehen.**
我们去不去徒步取决于天气。

**Er hat mich um einen Gefallen gebeten.**
他请我帮个忙。

**Wir müssen mit Verspätungen rechnen.**
我们得料到会晚点。

**Woran denkst du gerade?**
你在想什么？

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich warte für dich. | Ich warte auf dich. | 固定介词 auf 加第四格 |
| Ich denke über dich. | Ich denke an dich. | denken an 才是「想念」 |
| Ich interessiere mich in Musik. | ... für Musik. | 受英语干扰 |
| Ich nehme an die Sitzung teil. | ... an der Sitzung teil. | teilnehmen an 加第三格 |
"""

AUTHORED['动词/da与wo复合词'] = """
# da- 与 wo- 复合词（Pronominaladverbien）

> CEFR B1 · 关键词：da-Komposita, wo-Komposita, Präpositionaladverb

德语规定：**介词后面不能直接跟指物的代词**。
不能说 mit es、auf das（指物），必须用 **da(r)- 复合词**；
提问时用 **wo(r)- 复合词**。

## 一、构成

| 情形 | 形式 | 例 |
| :--- | :--- | :--- |
| 介词以辅音开头 | da + 介词 | damit, davon, dazu, dafür, danach, dabei |
| 介词以元音开头 | dar + 介词 | darauf, daran, darin, darüber, darum, daraus |
| 疑问，辅音开头 | wo + 介词 | womit, wovon, wofür, wonach |
| 疑问，元音开头 | wor + 介词 | worauf, woran, worüber, worin |

## 二、人与物的分工

| 指代对象 | 疑问 | 回答 |
| :--- | :--- | :--- |
| 人 | **Auf wen** wartest du? | Auf **meinen Bruder**. / Auf **ihn**. |
| 物或事 | **Worauf** wartest du? | Auf **den Bus**. / **Darauf**. |

**Mit wem sprichst du?**（和谁说）／ **Womit schreibst du?**（用什么写）

## 三、da- 复合词作从句的先行词

这是它最重要的功能：当动词要求介词，而宾语是一个 **dass 从句或不定式** 时，
必须先用 da- 复合词占位：

* **Ich freue mich darauf, dich zu sehen.** 我期待见到你。
* **Er hat sich darüber beschwert, dass es zu laut ist.** 他抱怨太吵。
* **Wir rechnen damit, dass es regnet.** 我们估计会下雨。
* **Es hängt davon ab, ob du Zeit hast.** 这取决于你有没有时间。

## 四、作篇章衔接

da- 复合词也可以指代上文整句：

**Er hat den Vertrag gekündigt. Damit hat niemand gerechnet.**
他解除了合同。这谁也没料到。

## 五、例句

**Worüber habt ihr so lange gesprochen?**
你们聊了这么久是聊什么？

**Ich kann mich noch gut daran erinnern.**
我还清楚地记得这件事。

**Hast du Interesse daran, mitzukommen?**
你有兴趣一起来吗？

**Darum geht es hier nicht.**
这里说的不是这个。

**Wofür brauchst du das Geld?**
你要这笔钱做什么？

**Ich bin dagegen, dass wir die Sitzung verschieben.**
我反对把会议推迟。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich warte auf es. | Ich warte darauf. | 指物不能用介词加代词 |
| Auf was wartest du?（口语可，书面不可） | Worauf wartest du? | 书面用 wo- 复合词 |
| Ich freue mich, dass du kommst.（动词要求 auf） | Ich freue mich darauf, dass du kommst. | 需要 da- 复合词占位 |
| womit wem | mit wem | 指人用介词加疑问代词 |
"""

AUTHORED['动词/功能动词结构'] = """
# 功能动词结构（Funktionsverbgefüge）

> CEFR C1 · 关键词：Funktionsverbgefüge, Nominalstil, Amtssprache

功能动词结构是「动词 + 名词」的固定组合，其中动词几乎失去实义，
意义主要由名词承担。它是德语公文、法律、学术、新闻的典型标志，
读懂它等于读懂正式德语。

## 一、结构与还原

| 功能动词结构 | 等值单个动词 | 汉语 |
| :--- | :--- | :--- |
| **eine Entscheidung treffen** | entscheiden | 作出决定 |
| **einen Antrag stellen** | beantragen | 提出申请 |
| **in Kraft treten** | gelten | 生效 |
| **zur Verfügung stehen** | verfügbar sein | 可供使用 |
| **Kritik üben an + D** | kritisieren | 批评 |
| **Rücksicht nehmen auf + A** | berücksichtigen | 顾及 |
| **in Betracht ziehen** | erwägen | 加以考虑 |
| **zum Ausdruck bringen** | ausdrücken | 表达 |
| **eine Rolle spielen** | wichtig sein | 起作用 |
| **Abschied nehmen von + D** | sich verabschieden | 告别 |
| **einen Vorschlag machen** | vorschlagen | 提建议 |
| **Anspruch erheben auf + A** | beanspruchen | 主张权利 |

## 二、常见的功能动词

**bringen, kommen, stellen, stehen, setzen, sitzen, nehmen, geben,
treffen, führen, üben, finden, ziehen, treten**。

一个规律：**bringen / setzen / stellen** 一类表示 **使动、开始**，
**kommen / stehen / sein** 一类表示 **状态、结果**：

| 使动 | 状态 |
| :--- | :--- |
| in Gang bringen 使启动 | in Gang sein 在运转 |
| zur Verfügung stellen 提供 | zur Verfügung stehen 可用 |
| in Bewegung setzen 使运动 | in Bewegung sein 在运动 |
| zum Abschluss bringen 使完成 | zum Abschluss kommen 得以完成 |

## 三、为什么不直接用动词

* 可以省去施动者，使表述客观：**Es wurde eine Entscheidung getroffen.**
* 名词可以带定语，信息密度高：**eine schnelle und einstimmige Entscheidung**。
* 语体正式。日常口语中请优先使用简单动词。

## 四、例句

**Der Vorstand hat gestern eine wichtige Entscheidung getroffen.**
董事会昨天作出了一项重要决定。

**Das neue Gesetz tritt am 1. Januar in Kraft.**
新法律于一月一日生效。

**Für Rückfragen stehe ich Ihnen gern zur Verfügung.**
如有疑问，我乐意为您解答。

**Die Opposition übte scharfe Kritik an dem Vorschlag.**
反对党对该建议提出了尖锐批评。

**Wir müssen auch die Kosten in Betracht ziehen.**
我们还必须考虑成本。

**Bitte nehmen Sie Rücksicht auf die anderen Gäste.**
请顾及其他客人。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| eine Entscheidung machen | eine Entscheidung treffen | 功能动词不能按英语 make 直译 |
| in Kraft kommen | in Kraft treten | 固定搭配 |
| Kritik machen | Kritik üben | 固定搭配 |
| zur Verfügung geben | zur Verfügung stellen | 提供用 stellen |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 介词
# ---------------------------------------------------------------------------
AUTHORED['介词/支配第四格'] = """
# 支配第四格的介词（Präpositionen mit Akkusativ）

> CEFR A2 · 关键词：Akkusativpräposition, durch, für, gegen, ohne, um

德语介词的第一条铁律：**介词决定后面名词的格**。
下面七个介词永远、无条件地要求第四格。

## 一、记忆口诀：durch – für – gegen – ohne – um – bis – entlang

| 介词 | 核心意义 | 例 |
| :--- | :--- | :--- |
| **durch** | 穿过；通过（手段） | durch den Park, durch Zufall |
| **für** | 为了；对于；换取 | für dich, für zwei Wochen |
| **gegen** | 反对；朝向；撞上；大约（时间） | gegen die Wand, gegen 8 Uhr |
| **ohne** | 没有（后面常省冠词） | ohne mich, ohne Zucker |
| **um** | 围绕；在（钟点）；关于 | um den Tisch, um 9 Uhr |
| **bis** | 直到（常与第二个介词连用） | bis morgen, bis zum Bahnhof |
| **entlang** | 沿着（后置！） | den Fluss entlang |

## 二、需要注意的细节

1. **bis** 单独用时后面多为无冠词的时间或地名：bis Montag, bis Berlin。
   一旦要加冠词，就换成 **bis zu + D**：bis zum nächsten Jahr。
2. **entlang** 表示「沿着走」时 **放在名词后面** 并要求第四格；
   放在前面时要求第三格或第二格（较正式）。
3. **ohne** 后面通常不加不定冠词：ohne Auto（没有车），不是 ohne ein Auto。
4. **gegen** 表示时间时意为「大约」，而 **um** 表示「准点」：
   um 8 Uhr（八点整）／ gegen 8 Uhr（八点左右）。

## 三、例句

**Wir sind durch den ganzen Wald gelaufen.**
我们穿过了整片森林。

**Dieses Geschenk ist für dich.**
这个礼物是给你的。

**Ich habe nichts gegen ihn.**
我对他没有意见。

**Ohne deine Hilfe hätte ich das nicht geschafft.**
没有你的帮助我做不到。

**Der Kurs dauert bis nächsten Freitag.**
课程持续到下周五。

**Gehen Sie einfach die Straße entlang.**
您沿着这条街走就行。

## 四、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| für mir | für mich | für 永远加第四格 |
| ohne meinem Bruder | ohne meinen Bruder | 第四格 |
| bis dem Bahnhof | bis zum Bahnhof | 带冠词要用 bis zu |
| entlang den Fluss（口语可） | den Fluss entlang | 后置用法最标准 |
"""

AUTHORED['介词/支配第三格'] = """
# 支配第三格的介词（Präpositionen mit Dativ）

> CEFR A2 · 关键词：Dativpräposition, aus, bei, mit, nach, seit, von, zu

这一组介词永远要求第三格，属于必须背下来的核心清单。

## 一、清单

| 介词 | 核心意义 | 例 |
| :--- | :--- | :--- |
| **aus** | 从……里出来；来自；材料 | aus dem Haus, aus China, aus Holz |
| **bei** | 在……处；在某人家；在……时 | bei der Arbeit, bei mir, beim Essen |
| **mit** | 和；用（工具） | mit dem Bus, mit einem Messer |
| **nach** | 往（地名）；在……之后；按照 | nach Berlin, nach dem Essen |
| **seit** | 自从（持续到现在） | seit drei Jahren |
| **von** | 从；属于；由（施动者） | von hier, ein Freund von mir |
| **zu** | 到（人或机构）；为了 | zum Arzt, zur Schule |
| **gegenüber** | 对面（常后置） | dem Bahnhof gegenüber |
| **außer** | 除……之外 | außer mir |
| **ab** | 从……起（时间） | ab Montag |

## 二、三组最容易混的对立

| 对立 | 规则 | 例 |
| :--- | :--- | :--- |
| **nach vs. zu** | nach 用于国家、城市、方位（无冠词）；zu 用于人和机构 | nach Italien / zum Bahnhof |
| **aus vs. von** | aus 表示从内部出来、来源国；von 表示从某点、某人处 | aus der Schweiz / von meiner Tante |
| **seit vs. vor** | seit 表示延续；vor 表示某个过去的时点 | seit zwei Jahren / vor zwei Jahren |

**in die Schweiz, in die Türkei, in die USA** —— 带冠词的国名用 in + A，不用 nach。

## 三、融合形式

bei dem = **beim**；von dem = **vom**；zu dem = **zum**；zu der = **zur**。

## 四、例句

**Ich komme gerade aus der Bibliothek.**
我刚从图书馆出来。

**Beim Kochen höre ich immer Musik.**
做饭的时候我总听音乐。

**Fahren wir mit dem Zug oder mit dem Auto?**
我们坐火车还是开车？

**Nach der Arbeit gehe ich zum Sport.**
下班后我去运动。

**Wir wohnen seit fünf Jahren in Hamburg.**
我们在汉堡住了五年了。

**Außer dir kenne ich hier niemanden.**
除了你我在这里谁也不认识。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich gehe nach dem Arzt. | Ich gehe zum Arzt. | 人和机构用 zu |
| Ich fahre nach die Schweiz. | Ich fahre in die Schweiz. | 带冠词国名用 in + A |
| seit zwei Jahre | seit zwei Jahren | 第三格复数加 -n |
| mit mein Freund | mit meinem Freund | mit 加第三格 |
"""

AUTHORED['介词/方位介词'] = """
# 方位介词（Wechselpräpositionen）

> CEFR A2 · 关键词：Wechselpräposition, Wohin, Wo, Akkusativ, Dativ

九个方位介词既可以带第四格，也可以带第三格，取决于句子回答的问题：
**Wohin?（去哪儿，有方向、有位移）→ 第四格；
Wo?（在哪儿，无位移的位置）→ 第三格。**

## 一、九个介词

| 介词 | 意义 | Wohin? (A) | Wo? (D) |
| :--- | :--- | :--- | :--- |
| **in** | 在……里 / 进入 | in **die** Schule gehen | in **der** Schule sein |
| **an** | 紧靠、贴着 | an **die** Wand hängen | an **der** Wand hängen |
| **auf** | 在……上面 | auf **den** Tisch legen | auf **dem** Tisch liegen |
| **über** | 在……上方 | über **den** Fluss fliegen | über **dem** Sofa hängen |
| **unter** | 在……下面 | unter **das** Bett schieben | unter **dem** Bett liegen |
| **vor** | 在……前面 | vor **die** Tür stellen | vor **der** Tür stehen |
| **hinter** | 在……后面 | hinter **das** Haus gehen | hinter **dem** Haus sein |
| **neben** | 在……旁边 | neben **mich** setzen | neben **mir** sitzen |
| **zwischen** | 在……之间 | zwischen **die** Bücher stellen | zwischen **den** Büchern stehen |

## 二、配对动词：位移 vs. 静止

| Wohin? 第四格 | Wo? 第三格 |
| :--- | :--- |
| **stellen**（立放） | **stehen**（立着） |
| **legen**（平放） | **liegen**（躺着） |
| **setzen**（使坐） | **sitzen**（坐着） |
| **hängen**（挂上，弱变化） | **hängen**（挂着，强变化：hing, gehangen） |
| **stecken**（插入） | **stecken**（插着） |

* **Ich stelle die Flasche auf den Tisch.**（放上去，第四格）
* **Die Flasche steht auf dem Tisch.**（在桌上，第三格）

## 三、抽象用法

介词用于时间和抽象意义时，格是固定的，与 wohin/wo 无关：

* 时间：**in einer Woche, vor drei Tagen, an dem Tag = am Tag** —— 第三格。
* über + A 表示「关于」：**über das Wetter sprechen**。
* 动词固定搭配按搭配走：**sich freuen auf + A, teilnehmen an + D**。

## 四、融合形式

in dem = **im**；in das = **ins**；an dem = **am**；an das = **ans**；
auf das = **aufs**；über das = **übers**；vor dem = **vorm**。

## 五、例句

**Häng bitte das Bild über das Sofa.**
请把画挂到沙发上方。

**Das Bild hängt jetzt über dem Sofa.**
画现在挂在沙发上方。

**Die Kinder laufen in den Garten.**
孩子们跑进花园。

**Die Kinder spielen im Garten.**
孩子们在花园里玩。

**Setz dich bitte neben mich.**
请坐我旁边。

**Zwischen den beiden Häusern steht ein alter Baum.**
两栋房子之间有一棵老树。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich gehe in der Schule. | Ich gehe in die Schule. | 有位移用第四格 |
| Das Buch liegt auf den Tisch. | ... auf dem Tisch. | 静止用第三格 |
| Ich lege mich ins Bett.（正确） | —— | 位移，第四格无误 |
| in eine Woche | in einer Woche | 时间用第三格 |
"""

AUTHORED['介词/支配第二格'] = """
# 支配第二格的介词（Präpositionen mit Genitiv）

> CEFR B2 · 关键词：Genitivpräposition, Schriftsprache

第二格介词几乎全部属于书面语和公文语体。
掌握它们是从 B1 迈向 B2/C1 的标志。

## 一、高频清单

| 介词 | 意义 | 例 |
| :--- | :--- | :--- |
| **wegen** | 因为 | wegen des schlechten Wetters |
| **trotz** | 尽管 | trotz der Kälte |
| **während** | 在……期间 | während der Ferien |
| **statt / anstatt** | 代替 | statt eines Briefes |
| **aufgrund** | 由于（正式） | aufgrund neuer Erkenntnisse |
| **innerhalb** | 在……之内 | innerhalb einer Woche |
| **außerhalb** | 在……之外 | außerhalb der Stadt |
| **oberhalb / unterhalb** | 在……上方／下方 | unterhalb des Gipfels |
| **infolge** | 由于……的后果 | infolge des Unfalls |
| **angesichts** | 鉴于 | angesichts der Lage |
| **hinsichtlich / bezüglich** | 关于 | bezüglich Ihrer Anfrage |
| **mithilfe** | 借助 | mithilfe eines Wörterbuchs |
| **anlässlich** | 值……之际 | anlässlich des Jubiläums |
| **zugunsten** | 有利于 | zugunsten der Kinder |

## 二、口语中的替代

口语里 wegen, trotz, während 常带第三格，
考试和写作中请坚持第二格：

| 口语 | 书面标准 |
| :--- | :--- |
| wegen dem Regen | wegen des Regens |
| trotz dem Lärm | trotz des Lärms |
| während dem Essen | während des Essens |

**特例**：后面是无冠词的复数或单个名词时，反而必须用第三格或加 von：
**wegen Umbauarbeiten**（无冠词，形式不变）、
**innerhalb von drei Tagen**（数词短语用 von + D）。

## 三、位置

wegen 在固定说法中可后置：**des Wetters wegen**，
与人称代词连用时有 **meinetwegen, deinetwegen, seinetwegen** 等专门形式，
其中 meinetwegen 还引申为「我无所谓、随你便」。

## 四、例句

**Wegen des dichten Nebels wurde der Flug gestrichen.**
由于浓雾，航班被取消了。

**Trotz seiner Erkältung ist er zur Arbeit gegangen.**
尽管感冒了，他还是去上班了。

**Während des Vortrags klingelte mehrmals ein Handy.**
报告期间有部手机响了好几次。

**Innerhalb weniger Minuten war der Saal leer.**
几分钟之内大厅就空了。

**Bezüglich Ihrer Anfrage melde ich mich nächste Woche.**
关于您的询问，我下周答复。

**Statt eines Autos hat er sich ein Fahrrad gekauft.**
他没买车，买了辆自行车。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| wegen dem Wetter（书面） | wegen des Wetters | 书面用第二格 |
| während die Ferien | während der Ferien | 第二格复数用 der |
| innerhalb drei Tagen | innerhalb von drei Tagen | 无冠词数词用 von + D |
| trotz des Regen | trotz des Regens | 阳性中性单数第二格加 -s |
"""

AUTHORED['介词/融合形式'] = """
# 介词与冠词的融合（Verschmelzung）

> CEFR A2 · 关键词：Verschmelzung, im, zum, ans

德语中介词与定冠词常常缩合成一个词。
这不是随意的口语现象，很多融合形式是 **必须使用** 的。

## 一、常用融合表

| 介词 + 冠词 | 融合 | 介词 + 冠词 | 融合 |
| :--- | :--- | :--- | :--- |
| an dem | **am** | an das | **ans** |
| in dem | **im** | in das | **ins** |
| bei dem | **beim** | von dem | **vom** |
| zu dem | **zum** | zu der | **zur** |
| auf das | **aufs** | für das | **fürs** |
| durch das | **durchs** | um das | **ums** |
| über das | **übers** | unter das | **unters** |
| vor dem | **vorm** | hinter dem | **hinterm** |

上排（am, im, beim, vom, zum, zur, ans, ins）是标准书面语；
下排（aufs, durchs, übers, vorm, hinterm）偏口语，正式写作中可拆开。

## 二、必须融合的场合

| 场合 | 例 |
| :--- | :--- |
| 时间说明 | **am Montag, im Mai, im Sommer, zum ersten Mal** |
| 最高级 | **am schönsten, am besten** |
| 固定短语 | **zum Beispiel, zur Zeit, im Allgemeinen, ins Bett gehen** |
| 泛指的地点 | **Ich gehe ins Kino / zur Schule.** |

## 三、不能融合的场合

当定冠词带 **强调、指示** 意义（相当于「这个、那个」）时必须拆开：

* **Ich gehe in das Haus, das du mir gezeigt hast.**
  我去你给我看的那栋房子。（后面带关系从句，冠词有所指）
* **An dem Tag war ich krank.** 就是那天我病了。

判断方法：如果冠词可以重读，就不要融合。

## 四、例句

**Am Wochenende fahren wir ans Meer.**
周末我们去海边。

**Im Winter ist es hier am kältesten.**
这里冬天最冷。

**Sie geht zur Arbeit, er bleibt beim Kind.**
她去上班，他留下带孩子。

**Zum Glück hat es aufgehört zu regnen.**
幸好雨停了。

**Wir treffen uns um acht vorm Kino.**
我们八点在电影院门口见。

**Er ging in das Zimmer, in dem das Licht noch brannte.**
他走进那间还亮着灯的房间。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| in dem Mai | im Mai | 时间说明必须融合 |
| an die Wand hängen（Wo? 语境） | an der Wand hängen | 融合与否不改变格的选择 |
| zu dem Beispiel | zum Beispiel | 固定短语 |
| Ich gehe im Kino. | Ich gehe ins Kino. | 有位移用第四格融合形式 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 副词
# ---------------------------------------------------------------------------
AUTHORED['副词/副词的种类'] = """
# 副词的种类（Adverbien — Klassen）

> CEFR A2 · 关键词：Temporaladverb, Lokaladverb, Modaladverb, Kausaladverb

德语副词 **永远不变格**，这是它与形容词最大的区别。
按语义可分为四大类，正好对应中场语序的 TeKaMoLo 顺序。

## 一、四大类

| 类别 | 提问 | 常见词 |
| :--- | :--- | :--- |
| **时间 Temporal** | wann? wie lange? wie oft? | heute, gestern, morgen, jetzt, bald, immer, oft, manchmal, nie, damals, gerade, schon, noch |
| **原因 Kausal** | warum? | deshalb, deswegen, darum, daher, folglich, trotzdem, dennoch |
| **方式 Modal** | wie? | gern, sehr, so, gut, schnell, kaum, besonders, leider, hoffentlich, vielleicht |
| **地点 Lokal** | wo? wohin? woher? | hier, da, dort, oben, unten, links, rechts, draußen, drinnen, hin, her |

## 二、hin 与 her：德语方位思维的核心

**hin = 离开说话人；her = 朝向说话人。**

| 词 | 意义 | 例 |
| :--- | :--- | :--- |
| hinein / herein | 进去 / 进来 | **Komm herein!** 进来吧 |
| hinauf / herauf | 上去 / 上来 | **Er ging die Treppe hinauf.** |
| hinaus / heraus | 出去 / 出来 | **Nimm das Buch heraus.** |
| wohin / woher | 去哪儿 / 从哪儿来 | **Woher kommst du?** |

口语中常缩为 rein, raus, rauf, runter：**Komm rein!**

## 三、形容词也能当副词

德语不需要英语的 -ly：形容词原形直接作状语。

**Er fährt schnell.** 他开得快。
**Sie spricht gut Deutsch.** 她德语说得好。

只有 **纯副词**（如 hier, gestern, leider）不能作定语，
不能说 die gestern Zeitung，要说 **die Zeitung von gestern**。

## 四、例句

**Gestern waren wir zum ersten Mal dort.**
我们昨天第一次去那儿。

**Leider kann ich morgen nicht kommen.**
可惜我明天不能来。

**Es hat geregnet, deshalb sind wir zu Hause geblieben.**
下雨了，所以我们待在家里。

**Drinnen ist es viel wärmer als draußen.**
里面比外面暖和多了。

**Ich gehe gern schwimmen, besonders im Sommer.**
我喜欢游泳，尤其是夏天。

**Er kommt heute Abend bestimmt noch vorbei.**
他今晚一定还会过来。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Er fährt schnellich. | Er fährt schnell. | 德语无 -ly |
| die hier Leute | die Leute hier | 纯副词不作前置定语 |
| Komm hinein!（对着自己的房间说） | Komm herein! | her 表示朝向说话人 |
| Ich gehe gerne nach Hause.（正确） | —— | gern / gerne 皆可 |
"""

AUTHORED['副词/副词的比较级'] = """
# 副词的比较级与特殊形式（Steigerung der Adverbien）

> CEFR B1 · 关键词：Komparativ, Superlativ, am besten, gern

## 一、一般规则

由形容词充当的副词按形容词规则加 **-er / am ...-sten**，
但作状语时 **最高级永远用 am ...-sten**，不加词尾。

| 原级 | 比较级 | 最高级 |
| :--- | :--- | :--- |
| schnell | schneller | am schnellsten |
| laut | lauter | am lautesten |
| oft | öfter | am häufigsten |

## 二、必须背的不规则形式

| 原级 | 比较级 | 最高级 | 意义 |
| :--- | :--- | :--- | :--- |
| **gern** | lieber | am liebsten | 喜欢 |
| **gut** | besser | am besten | 好 |
| **viel** | mehr | am meisten | 多 |
| **wenig** | weniger | am wenigsten | 少 |
| **bald** | eher | am ehesten | 早、宁可 |
| **hoch** | höher | am höchsten | 高 |
| **nah** | näher | am nächsten | 近 |

gern / lieber / am liebsten 是口语中出现频率最高的一组：
**Ich trinke gern Tee, lieber Kaffee, am liebsten Wasser.**

## 三、纯副词的比较

时间、地点副词（hier, dort, heute）本身不能比较，
要表达程度就换成形容词或短语：
不能说 hierer，要说 **weiter vorn, weiter hinten**。

## 四、几个常用的加强结构

| 结构 | 意义 | 例 |
| :--- | :--- | :--- |
| immer + 比较级 | 越来越 | **Es wird immer kälter.** |
| je ... desto ... | 越……越…… | **Je mehr, desto besser.** |
| so ... wie | 和……一样 | **Er läuft so schnell wie ich.** |
| viel / etwas / noch + 比较级 | 程度修饰 | **viel besser, etwas später** |

## 五、例句

**Sie spricht Deutsch besser als ich.**
她德语说得比我好。

**Am liebsten würde ich sofort losfahren.**
我最想马上出发。

**Je länger ich hier wohne, desto wohler fühle ich mich.**
我在这儿住得越久越自在。

**Die Tage werden immer kürzer.**
白天越来越短了。

**Am meisten hat mich das Ende überrascht.**
最让我意外的是结尾。

**Komm bitte etwas früher als gestern.**
请比昨天早一点来。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich mag gerner Kaffee. | Ich trinke lieber Kaffee. | gern 的比较级是 lieber |
| Er läuft der schnellste.（作状语） | Er läuft am schnellsten. | 状语最高级用 am ...-sten |
| mehr besser | viel besser | 比较级不重复加强 |
| Je mehr, desto besser ist es.（语序） | Je mehr, desto besser. | desto 后直接跟比较级 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 小品词（Modalpartikeln）
# ---------------------------------------------------------------------------
AUTHORED['小品词/总论'] = """
# 语气词总论（Modalpartikeln）

> CEFR B1 · 关键词：Modalpartikel, Abtönungspartikel, Sprecherhaltung

语气词是德语口语的灵魂。它们 **不改变句子的命题内容**，
只表达说话人的态度：惊讶、不耐烦、缓和、催促、共识。
汉语靠「嘛、呢、吧、啊、可」，德语靠 doch, mal, ja, denn, eben, halt, wohl, schon。

## 一、四条共同特征

1. **不重读**，重音在句子的其他成分上；
2. **位置固定在中场**，通常紧跟在主语和代词之后、其他成分之前；
3. **不能单独回答问题**，不能置于前场（句首）；
4. 与同形的副词或连词区别开：
   * **Er kommt ja.**（语气词，不重读，「他不是要来嘛」）
   * **Ja, er kommt.**（回答词，重读）

## 二、按句型分工

| 句型 | 可用语气词 |
| :--- | :--- |
| 陈述句 | ja, doch, eben, halt, wohl, schon, einfach |
| 是非疑问 | denn, etwa, doch（求确认） |
| W- 疑问 | denn, bloß, nur |
| 命令句 | mal, doch, doch mal, ruhig, bloß, ja（警告） |
| 感叹句 | aber, vielleicht, ja |

## 三、位置示例

**Kannst du mir bitte mal kurz helfen?**
—— 代词 mir 在前，语气词 mal 紧随其后。

**Das ist ja unglaublich!**
**Warum hast du das denn nicht gesagt?**

## 四、组合使用

语气词可以叠加，顺序基本固定：**denn > doch > mal > eben/halt**。

* **Komm doch mal her!** 你过来一下嘛。
* **Das ist doch eben das Problem.** 这不正是问题所在嘛。

## 五、例句

**Du weißt ja, wie er ist.**
你也知道他那个人。

**Setz dich doch!**
你坐啊。

**Wo warst du denn so lange?**
你到底去哪儿了这么久？

**Das kann man halt nicht ändern.**
这也没办法改变。

**Er wird wohl schon zu Hause sein.**
他大概已经到家了吧。

**Mach das bloß nicht noch mal!**
你可别再这么干了！

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Denn warum kommst du nicht? | Warum kommst du denn nicht? | 语气词不能在前场 |
| Doch komm her! | Komm doch her! | 同上 |
| 在正式书面语中大量使用 | 学术写作中避免 | 语气词属口语语体 |
| 重读语气词 | 不重读 | 重读会变成副词或回答词 |
"""

AUTHORED['小品词/doch'] = """
# 语气词 doch

> CEFR B1 · 关键词：doch, Widerspruch, Aufforderung

doch 是使用频率最高、意义最丰富的语气词，核心含义是
**「与对方的预设相反」或「你其实知道」**。

## 一、五种用法

| 用法 | 例句 | 汉语语感 |
| :--- | :--- | :--- |
| 反驳否定问句（重读，回答词） | A: Kommst du nicht? — B: **Doch!** | 我来啊！ |
| 提醒共识 | **Du kennst ihn doch.** | 你不是认识他嘛 |
| 缓和的请求、劝告 | **Setz dich doch.** | 你坐啊 |
| 不耐烦、催促 | **Jetzt komm doch endlich!** | 快点儿啊 |
| 愿望句加强 | **Wenn er doch käme!** | 他要是来了该多好 |

## 二、doch 作回答词：德语的独门武器

对 **否定疑问句** 表示肯定时，德语不能用 ja，必须用 doch：

* A: **Hast du keinen Hunger?** 你不饿吗？
  B: **Doch, ich habe Hunger.** 饿啊。（用 ja 会造成误解）
  B: **Nein, ich habe keinen Hunger.** 不饿。

## 三、doch 作连词

doch 还可以当 **并列连词**「但是」，此时位于句首但 **不占前场**
（后面直接跟主语）：

**Er hat es versucht, doch es hat nicht geklappt.**
他试过了，可是没成。

## 四、doch mal 组合

命令句中 **doch mal** 是最常用的软化组合：

**Ruf mich doch mal an!** 有空给我打个电话嘛。

## 五、例句

**Das habe ich dir doch schon gesagt.**
这我不是跟你说过了吗。

**Nimm doch noch ein Stück Kuchen.**
再吃块蛋糕嘛。

**Das kann doch nicht wahr sein!**
这不可能是真的吧！

**Wenn ich doch nur mehr Zeit hätte!**
我要是有更多时间就好了！

**Sei doch nicht so ungeduldig.**
你别这么没耐心嘛。

**A: Du magst kein Bier? — B: Doch, sehr gern sogar.**
你不喜欢啤酒？—— 喜欢啊，还很喜欢呢。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| A: Kommst du nicht? B: Ja. | B: Doch. | 反驳否定问句必须用 doch |
| Doch setz dich. | Setz dich doch. | 语气词位于中场 |
| Er hat es versucht, doch es hat es nicht geklappt. | ..., doch es hat nicht geklappt. | doch 作连词不占位 |
| 在论文中写 Das ist doch klar. | Das ist offensichtlich. | 语体不符 |
"""

AUTHORED['小品词/mal'] = """
# 语气词 mal

> CEFR A2 · 关键词：mal, einmal, Aufforderung

mal 是 einmal 的弱读形式，作用是把要求 **变小、变随意**，
相当于汉语的「一下、一下下、试试」。

## 一、核心用法

| 用法 | 例句 | 汉语 |
| :--- | :--- | :--- |
| 软化命令 | **Komm mal her.** | 你过来一下 |
| 软化请求 | **Kannst du mir mal helfen?** | 你能帮我一下吗 |
| 提议 | **Wir könnten mal ins Museum gehen.** | 我们哪天可以去趟博物馆 |
| 表示「总有一天」 | **Ich möchte mal nach Japan.** | 我想有朝一日去日本 |
| 与 doch 连用 | **Guck doch mal!** | 你瞧瞧嘛 |

## 二、mal 与 einmal 的区别

* **einmal** 重读，表示「一次」这个数量：**Ich war nur einmal dort.**
* **mal** 不重读，是语气词：**Warst du schon mal dort?** 你去过吗？

## 三、日常固定说法

| 说法 | 意义 |
| :--- | :--- |
| **Moment mal!** | 等一下！ |
| **Sag mal, ...** | 我说啊…… |
| **Hör mal zu.** | 你听着 |
| **Schauen wir mal.** | 我们看看再说 |
| **nicht mal** | 连……都不 |

**Er hat nicht mal Danke gesagt.** 他连声谢谢都没说。

## 四、位置

mal 位于中场，紧跟代词之后，可分动词前缀之前：

**Ruf mich morgen mal an.**（mich → mal → an）

## 五、例句

**Warte mal kurz, ich komme gleich.**
你等一下，我马上来。

**Sag mal, hast du meine Nachricht bekommen?**
我说，你收到我的消息了吗？

**Wir sollten uns mal wieder treffen.**
我们该再聚聚了。

**Hast du schon mal Sushi probiert?**
你吃过寿司吗？

**Zeig mir das mal bitte.**
给我看一下这个。

**Das ist nicht mal so teuer.**
这甚至都不算贵。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Mal komm her. | Komm mal her. | 语气词不能在句首 |
| Ich war einmal in Berlin.（想说「去过」） | Ich war schon mal in Berlin. | einmal 强调次数 |
| Ruf mal mich an. | Ruf mich mal an. | 代词优先在前 |
| Er hat nicht einmal Danke gesagt.（也可） | 语气略强 | 两者都对，语气不同 |
"""

AUTHORED['小品词/ja'] = """
# 语气词 ja

> CEFR B1 · 关键词：ja, gemeinsames Wissen, Erstaunen

ja 作语气词时 **不是「是」**，而是提示「这是我们都知道的事」，
或者表达惊讶、警告。

## 一、三种用法

| 用法 | 例句 | 汉语语感 |
| :--- | :--- | :--- |
| 共识（不重读） | **Du weißt ja, dass ich morgen fliege.** | 你也知道我明天要飞 |
| 惊讶（重读，感叹句） | **Das ist ja fantastisch!** | 这也太棒了吧！ |
| 严厉警告（命令句，重读） | **Komm ja pünktlich!** | 你可得准时来！ |

## 二、ja 与 doch 的区别

这是学习者最难分清的一对：

| | ja | doch |
| :--- | :--- | :--- |
| 前提 | 对方 **已经知道**，我只是提一下 | 对方 **似乎忘了或反着想**，我要提醒 |
| 例 | Er ist **ja** Arzt.（大家都知道） | Er ist **doch** Arzt!（你怎么忘了呢） |
| 能否用于命令句 | 只能表警告 | 表缓和请求 |

## 三、语气词 ja 不能重读的情形

用于「共识」时绝不重读，且不能单独回答问题：
A: Kommst du? — B: **Ja.**（这是回答词，不是语气词）

## 四、例句

**Ich kann dir das erklären, du bist ja Ingenieur.**
我可以给你解释，你本来就是工程师嘛。

**Das ist ja unglaublich!**
这简直难以置信！

**Da bist du ja endlich!**
你可算来了！

**Vergiss ja nicht, den Herd auszuschalten!**
你可千万别忘了关炉子！

**Wir haben ja noch Zeit.**
我们不是还有时间嘛。

**Das habe ich ja gar nicht gewusst.**
这我可完全不知道。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ja, das ist fantastisch!（想表达惊讶） | Das ist ja fantastisch! | 位置决定意义 |
| Komm ja her.（想缓和） | Komm doch her. | ja 在命令句里是警告 |
| Du weißt doch nicht, dass ...（想说共识） | Du weißt ja, dass ... | ja 表共识 |
| 把语气词 ja 翻译成「是」 | 按语气翻译 | 语气词无对应实词 |
"""

AUTHORED['小品词/denn'] = """
# 语气词 denn

> CEFR A2 · 关键词：denn, Frage, Interesse

denn 只出现在 **疑问句** 中，把生硬的提问变成有兴趣、有礼貌的询问。
不带 denn 的问句常显得像审问。

## 一、两种句型

| 句型 | 例 | 汉语 |
| :--- | :--- | :--- |
| W- 疑问句 | **Wie heißt du denn?** | 你叫什么呀 |
| 是非疑问句 | **Hast du denn Zeit?** | 你有时间吗 |

对比：
* **Wo warst du?** 你去哪儿了？（可能带责问）
* **Wo warst du denn?** 你去哪儿啦？（关心、好奇）

## 二、denn 表示惊讶或不解

**Was ist denn hier passiert?** 这儿到底出什么事了？
**Bist du denn verrückt?** 你疯了不成？

## 三、与并列连词 denn 区别

连词 denn 意为「因为」，**不占前场，后面语序不变**：

**Ich bleibe zu Hause, denn ich bin krank.**
我待在家里，因为我病了。

判断方法：在疑问句中的是语气词，连接两个陈述句的是连词。

## 四、口语弱读形式

denn 在口语中常弱读为 **-n**：
Was ist **n** das? = Was ist denn das?（仅口语，书写时不可）

## 五、例句

**Was machst du denn hier?**
你在这儿做什么呢？

**Wie spät ist es denn?**
现在几点啦？

**Hast du denn schon gegessen?**
你吃过了吗？

**Warum sagst du denn nichts?**
你怎么什么都不说呀？

**Wer ist das denn?**
那是谁呀？

**Ich komme später, denn ich habe noch einen Termin.**
我晚点来，因为我还有个约。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Denn was machst du? | Was machst du denn? | 语气词在中场 |
| Das ist denn schön.（陈述句） | Das ist ja schön. | denn 只用于疑问句 |
| Ich bleibe zu Hause, denn bin ich krank. | ..., denn ich bin krank. | 连词 denn 后语序不变 |
| Warum denn du kommst nicht? | Warum kommst du denn nicht? | 疑问句动词第二位 |
"""

AUTHORED['小品词/eben与halt'] = """
# 语气词 eben 与 halt

> CEFR B2 · 关键词：eben, halt, Resignation, Unabänderlichkeit

eben 和 halt 表达 **「事情就是这样，没法改变」** 的态度，
是德语式的「就这样吧、没办法」。两者意义几乎相同，
**halt 偏南德和口语，eben 通用**。

## 一、核心用法

| 用法 | 例句 | 汉语 |
| :--- | :--- | :--- |
| 表示无奈接受 | **Das ist eben so.** | 事情就是这样 |
| 确认对方说法 | A: Er hat keine Zeit. — B: **Eben!** | 就是说啊 |
| 得出必然结论（命令句） | **Dann geh eben allein.** | 那你就自己去呗 |
| 强调理由 | **Er kommt nicht, er ist halt krank.** | 他不来，他病了嘛 |

## 二、eben 的其他词性

| 词性 | 意义 | 例 |
| :--- | :--- | :--- |
| 语气词 | 就是这样 | Das ist eben so. |
| 时间副词 | 刚才 | **Er ist eben gegangen.** |
| 形容词 | 平坦的 | **eine ebene Fläche** |

判断靠位置和重音：时间副词可以放句首（**Eben war er noch hier.**），
语气词不能。

## 三、eben 与 halt 的地域分布

| 地区 | 偏好 |
| :--- | :--- |
| 德国北部 | eben |
| 德国南部、奥地利、瑞士 | halt |
| 书面语 | eben（halt 几乎不用于正式文本） |

## 四、常见搭配

* **eben deshalb / eben darum** 正因为如此
* **nicht eben** 并不怎么：**Das war nicht eben billig.** 这可不便宜。
* **doch eben** 组合：**Das ist doch eben das Problem.**

## 五、例句

**Man kann eben nicht alles haben.**
人总不能什么都得到。

**Dann müssen wir halt später anfangen.**
那我们就只好晚点开始了。

**Eben deshalb habe ich dich angerufen.**
正因为如此我才给你打电话。

**Das Leben ist halt kein Wunschkonzert.**
生活本来就不是点歌节目（不能事事如愿）。

**A: Er hört nie zu. — B: Eben!**
他从来不听。—— 可不是嘛！

**Wenn du nicht willst, dann lass es eben.**
你不愿意就算了呗。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Halt das ist so. | Das ist halt so. | 语气词在中场 |
| 学术论文中使用 halt | 改用 nun einmal / eben | 语体不符 |
| Eben er ist gegangen.（想说刚才） | Eben ist er gegangen. | 时间副词占前场时动词第二位 |
| 把 eben 一律译成「刚才」 | 按语气判断 | 一词多性 |
"""

AUTHORED['小品词/wohl与其他'] = """
# 语气词 wohl, schon, etwa, bloß, ruhig

> CEFR B2 · 关键词：wohl, schon, etwa, bloß, ruhig

## 一、wohl —— 推测

wohl 表示「大概、想必」，相当于一个弱化的 vermutlich：

* **Er ist wohl krank.** 他大概病了。
* **Das wird wohl stimmen.** 这想必是对的。
* 与将来时连用表推测：**Sie wird wohl schon schlafen.** 她大概已经睡了。

固定说法：**Ob er wohl kommt?** 他到底会不会来呢？

## 二、schon —— 安抚与让步

| 用法 | 例 | 汉语 |
| :--- | :--- | :--- |
| 安抚 | **Das wird schon klappen.** | 会成的，别担心 |
| 让步（后接 aber） | **Schön ist es schon, aber teuer.** | 好看是好看，就是贵 |
| 催促 | **Nun komm schon!** | 你快点儿啊 |
| 时间副词（重读） | **Er ist schon da.** | 他已经到了 |

## 三、etwa —— 带否定预期的疑问

用 etwa 提问，说话人 **希望答案是「不」**：

**Hast du etwa alles aufgegessen?** 你该不会全吃光了吧？
**Bist du etwa müde?** 你不会是累了吧？

（etwa 作副词时另有「大约」义：etwa 20 Personen。）

## 四、bloß / nur —— 加强的愿望与警告

* 愿望：**Wenn er bloß anriefe!** 他要是能打个电话就好了！
* 警告：**Mach das bloß nicht!** 你可别这么干！
* W- 疑问句表焦急：**Wo ist bloß mein Schlüssel?** 我钥匙到底在哪儿啊？

## 五、ruhig —— 放心去做

命令句中的 ruhig 表示「尽管、放心」：

**Du kannst ruhig fragen.** 你尽管问。
**Bleib ruhig sitzen.** 你坐着别动没关系。

## 六、例句

**Sie wird wohl im Stau stehen.**
她大概是堵车了。

**Das schaffst du schon!**
你肯定能做到！

**Du hast doch nicht etwa den Termin vergessen?**
你该不会把约会忘了吧？

**Wo hab ich bloß meine Brille hingelegt?**
我到底把眼镜放哪儿了？

**Nehmen Sie ruhig noch ein Stück.**
您尽管再拿一块。

**Schnell ist das Auto schon, aber es verbraucht zu viel.**
这车快是快，就是太费油。

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Wohl er ist krank. | Er ist wohl krank. | 语气词在中场 |
| Hast du etwa Zeit?（想问是否有空） | Hast du Zeit? | etwa 暗含否定预期 |
| Etwa 20 Leute waren da.（正确，副词） | —— | 副词用法不同 |
| Bleib bitte ruhig sitzen.（歧义） | 语境区分 | ruhig 也可作形容词「安静地」 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 数词
# ---------------------------------------------------------------------------
AUTHORED['数词/基数与序数'] = """
# 基数词与序数词（Grund- und Ordnungszahlen）

> CEFR A1 · 关键词：Kardinalzahl, Ordinalzahl, Bruchzahl

## 一、基数词

| 数 | 词 | 数 | 词 |
| :--- | :--- | :--- | :--- |
| 0 | null | 13 | dreizehn |
| 1 | eins | 16 | **sechzehn**（无 s） |
| 2 | zwei | 17 | **siebzehn**（无 en） |
| 3 | drei | 20 | zwanzig |
| 4 | vier | 30 | **dreißig**（-ßig） |
| 5 | fünf | 60 | **sechzig** |
| 6 | sechs | 70 | **siebzig** |
| 7 | sieben | 100 | (ein)hundert |
| 11 | elf | 1000 | (ein)tausend |
| 12 | zwölf | 10^6 | eine Million |

**读法从个位开始**：21 = **einundzwanzig**（一和二十），
345 = **dreihundertfünfundvierzig**。百万以上是名词：
zwei Millionen, drei Milliarden。

## 二、eins 的变化

单独计数用 **eins**；后面带名词时变成 **不定冠词 ein/eine** 并按格变化：
**ein Buch, eine Frau, einen Tag**。
强调「一个」时可重读：**Ich habe nur EIN Problem.**

## 三、序数词

构成规则：**1–19 加 -t，20 以上加 -st**，然后按形容词变格。

| 序数 | 形式 | 序数 | 形式 |
| :--- | :--- | :--- | :--- |
| 第一 | **der erste**（不规则） | 第七 | der siebte（不规则） |
| 第二 | der zweite | 第八 | der achte（只一个 t） |
| 第三 | **der dritte**（不规则） | 第二十 | der zwanzigste |
| 第四 | der vierte | 第一百 | der hundertste |

书写时用数字加点：**der 1. Mai, am 3. Oktober**。

## 四、分数与倍数

| 类型 | 形式 | 例 |
| :--- | :--- | :--- |
| 分数 | 序数词 + -l（中性名词） | ein Drittel, zwei Fünftel |
| 二分之一 | **die Hälfte / halb** | ein halbes Jahr |
| 一点五 | **anderthalb / eineinhalb** | anderthalb Stunden |
| 倍数 | 基数 + -mal / -fach | dreimal, dreifach |
| 种类 | 基数 + -erlei | dreierlei |

## 五、例句

**Ich habe zweiundvierzig Euro bezahlt.**
我付了四十二欧元。

**Das ist schon das dritte Mal diese Woche.**
这已经是本周第三次了。

**Er wohnt im vierten Stock.**
他住在四楼（德国的第四层）。

**Ungefähr ein Drittel der Studenten hat bestanden.**
大约三分之一的学生通过了。

**Wir treffen uns in anderthalb Stunden.**
我们一个半小时后见。

**Die Miete ist dreimal so hoch wie früher.**
房租是以前的三倍。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| ein und zwanzig | einundzwanzig | 连写 |
| sechszehn / siebenzig | sechzehn / siebzig | 不规则删音 |
| der einte | der erste | 不规则序数 |
| Ich habe eins Buch. | Ich habe ein Buch. | 带名词用 ein |
"""

AUTHORED['数词/日期与钟点'] = """
# 日期、钟点与量的表达（Datum, Uhrzeit, Maße）

> CEFR A1 · 关键词：Datum, Uhrzeit, Maßangabe

## 一、钟点：正式与口语两套

| 数字 | 正式（24 小时） | 口语 |
| :--- | :--- | :--- |
| 13:00 | dreizehn Uhr | eins / ein Uhr |
| 14:15 | vierzehn Uhr fünfzehn | Viertel nach zwei |
| 14:30 | vierzehn Uhr dreißig | **halb drei**（差半小时到三点） |
| 14:45 | vierzehn Uhr fünfundvierzig | Viertel vor drei |
| 14:20 | vierzehn Uhr zwanzig | zwanzig nach zwei / **zehn vor halb drei** |

**最大的陷阱：halb drei = 2:30**，不是 3:30。德语着眼于「还差多少到下一点」。

提问：**Wie spät ist es?** / **Wie viel Uhr ist es?**
回答时间点用 **um**：um acht Uhr；时间段用 **von ... bis**。

## 二、日期

| 场合 | 形式 |
| :--- | :--- |
| 问日期 | **Der Wievielte ist heute?** / Den Wievielten haben wir? |
| 答（第一格） | **Heute ist der 5. Juni.** |
| 答（第四格） | **Heute haben wir den 5. Juni.** |
| 在某天 | **am 5. Juni** = an dem fünften Juni |
| 书信抬头 | **Berlin, den 5. Juni 2026** |
| 年份 | **1998** 或 **im Jahr 1998**（不说 in 1998） |

## 三、时间前置词小结

| 单位 | 介词 | 例 |
| :--- | :--- | :--- |
| 钟点 | um | um 9 Uhr |
| 日、星期、时段 | am | am Montag, am Abend |
| 月份、季节、年代 | im | im Mai, im Sommer |
| 夜里 | in der | in der Nacht |
| 时长 | 无介词或 für/seit | zwei Stunden, seit drei Tagen |

## 四、度量与货币

阳性、中性度量名词在数词后 **用单数**：
**zwei Glas Wasser, drei Stück Kuchen, 100 Gramm Butter, fünf Euro**。
阴性度量名词用复数：**zwei Flaschen Wein, drei Tassen Kaffee**。

## 五、例句

**Der Zug fährt um halb sieben ab.**
火车六点半发车。

**Wir haben heute den siebzehnten März.**
今天是三月十七号。

**Am ersten Januar hat fast alles geschlossen.**
一月一号几乎全都关门。

**Sie ist 1995 in Leipzig geboren.**
她一九九五年生于莱比锡。

**Bitte zwei Glas Wasser und drei Stück Kuchen.**
请来两杯水、三块蛋糕。

**Die Sitzung dauert von neun bis halb zwölf.**
会议从九点开到十一点半。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| halb drei = 3:30 | halb drei = 2:30 | 德语向前看 |
| in 1998 | 1998 / im Jahr 1998 | 年份不加 in |
| am Mai | im Mai | 月份用 im |
| zwei Gläser Wasser（点单） | zwei Glas Wasser | 中性度量词用单数 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 句法
# ---------------------------------------------------------------------------
AUTHORED['句法/句子成分'] = """
# 句子成分（Satzglieder）

> CEFR A2 · 关键词：Satzglied, Verschiebeprobe, Subjekt, Objekt

德语语序规则全部建立在「句子成分」这个概念上。
**一个句子成分 = 一个可以整体移到句首的单位。**
这条「移位测试（Verschiebeprobe）」是判断成分边界的唯一可靠方法。

## 一、成分清单

| 成分 | 德语名 | 提问 | 例 |
| :--- | :--- | :--- | :--- |
| 主语 | Subjekt | wer? was? | **Der Lehrer** erklärt die Regel. |
| 谓语 | Prädikat | —— | Der Lehrer **erklärt** die Regel. |
| 第四格宾语 | Akkusativobjekt | wen? was? | ... **die Regel**. |
| 第三格宾语 | Dativobjekt | wem? | Er hilft **dem Kind**. |
| 第二格宾语 | Genitivobjekt | wessen? | Man beschuldigt ihn **des Diebstahls**. |
| 介词宾语 | Präpositionalobjekt | worauf? auf wen? | Ich warte **auf den Bus**. |
| 状语 | Adverbialbestimmung | wann? wo? wie? warum? | Er kommt **morgen**. |
| 表语 | Prädikativ | was ist er? | Er ist **Arzt**. |

## 二、移位测试

**Der neue Kollege aus Hamburg** arbeitet seit gestern bei uns.
→ **Seit gestern** arbeitet der neue Kollege aus Hamburg bei uns.
→ **Bei uns** arbeitet der neue Kollege aus Hamburg seit gestern.

「der neue Kollege aus Hamburg」整体移动，说明它是 **一个** 成分；
不能只移「aus Hamburg」，因为它是名词的定语，不是独立成分。

## 三、定语不是句子成分

定语（Attribut）依附于名词，随名词一起移动：

| 定语类型 | 例 |
| :--- | :--- |
| 形容词定语 | der **neue** Wagen |
| 第二格定语 | das Haus **meiner Eltern** |
| 介词定语 | die Frau **mit dem Hut** |
| 关系从句 | der Mann, **der dort steht** |
| 扩展分词定语 | die **gestern gekaufte** Zeitung |

## 四、表语与状语的区别

sein, werden, bleiben 后面的成分是 **表语**，不能省略：
* **Er ist Lehrer.**（去掉 Lehrer 句子不成立）
* **Er arbeitet in Berlin.**（in Berlin 是状语，可省）

## 五、例句

**Meiner Schwester hat der Film überhaupt nicht gefallen.**
我妹妹一点也不喜欢这部电影。（第三格宾语在前场）

**Auf diese Frage kann ich Ihnen leider keine Antwort geben.**
这个问题我恐怕无法答复您。

**Der Vorschlag des Vorstands wurde einstimmig angenommen.**
董事会的建议获得一致通过。

**Gestern Abend war es hier ziemlich laut.**
昨晚这里相当吵。

**Sie gilt als eine der besten Ärztinnen der Klinik.**
她被认为是这家诊所最好的医生之一。

**Man hat ihn des Betrugs beschuldigt.**
有人指控他诈骗。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Gestern ich war müde. | Gestern war ich müde. | 前场只能有一个成分 |
| Der Mann mit dem Hut, der steht dort... | Der Mann mit dem Hut steht dort. | 定语不独立占位 |
| Er ist in Berlin Lehrer.（语序生硬） | Er ist Lehrer in Berlin. | 表语靠近动词 |
| Ich warte den Bus. | Ich warte auf den Bus. | 介词宾语不可省介词 |
"""

AUTHORED['句法/动词位置与句框'] = """
# 动词位置与句框（Verbstellung und Satzklammer）

> CEFR A1 · 关键词：Verbzweit, Verbend, Satzklammer, Vorfeld

德语最核心的句法规则只有一条：**动词的位置由句子类型决定**，
而其余成分被夹在两个动词部分之间，形成 **句框（Satzklammer）**。

## 一、三种动词位置

| 句型 | 位置 | 例 |
| :--- | :--- | :--- |
| 陈述句、W- 疑问句 | 变位动词 **第二位** | Ich **habe** gestern gearbeitet. |
| 是非疑问句、命令句、非现实条件句 | 变位动词 **第一位** | **Hast** du gearbeitet? |
| 从句 | 变位动词 **末位** | ..., weil ich gearbeitet **habe**. |

「第二位」指第二个 **成分**，不是第二个词：
**Gestern Abend um zehn** | **habe** | ich | gearbeitet.

## 二、句框：德语的骨架

| 前场 | 左括号 | 中场 | 右括号 |
| :--- | :--- | :--- | :--- |
| Ich | **habe** | gestern den ganzen Tag im Büro | **gearbeitet**. |
| Morgen | **will** | ich mit meinem Chef darüber | **sprechen**. |
| Der Zug | **kommt** | in zehn Minuten | **an**. |
| Das Haus | **wurde** | im letzten Jahr komplett | **renoviert**. |

右括号里可以出现：第二分词、不定式、可分前缀、表语的一部分、
以及固定搭配的名词（Rad **fahren**, in Kraft **treten**）。

## 三、什么进右括号

| 结构 | 右括号内容 |
| :--- | :--- |
| 完成时 | 第二分词 + haben/sein |
| 情态动词 | 不定式 |
| 将来时 | 不定式 |
| 被动 | 第二分词（+ werden） |
| 可分动词 | 前缀 |
| 多重结构 | **gemacht worden sein** —— 顺序从右向左 |

**Das Problem hätte längst gelöst werden können.**
这个问题早就本该被解决的。（右括号四个词，顺序固定）

## 四、后场（Nachfeld）

少数成分可以放在右括号 **之后**：

* 比较短语：**Er ist größer geworden als sein Bruder.**
* 从句：**Ich habe gehört, dass du umziehst.**
* 不定式短语：**Ich habe vergessen, dich anzurufen.**
* 过长的介词短语（口语）。

## 五、例句

**Am Wochenende fahren wir zu meinen Eltern.**
周末我们去我父母那儿。

**Kannst du mir bitte kurz bei der Übersetzung helfen?**
你能帮我翻译一下吗？

**Der Vertrag muss bis Freitag unterschrieben werden.**
合同必须在周五前签好。

**Ich weiß nicht, ob er heute noch kommt.**
我不知道他今天还来不来。

**Steig bitte am Hauptbahnhof aus.**
请在中央车站下车。

**Sie hat mir gesagt, dass sie den Termin verschieben musste.**
她跟我说她不得不推迟这个约。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Morgen ich gehe ins Kino. | Morgen gehe ich ins Kino. | 动词第二位 |
| Ich habe gearbeitet gestern im Büro. | Ich habe gestern im Büro gearbeitet. | 分词在右括号 |
| ..., weil ich habe keine Zeit. | ..., weil ich keine Zeit habe. | 从句动词末位 |
| Der Zug an kommt. | Der Zug kommt an. | 可分前缀在右括号 |
"""

AUTHORED['句法/中场语序'] = """
# 中场语序 TeKaMoLo（Mittelfeld）

> CEFR B1 · 关键词：Mittelfeld, TeKaMoLo, Thema-Rhema

中场是句框内部的区域，成分多、顺序活。
德语中场语序由三条原则叠加决定：**代词优先、已知在前、状语按 TeKaMoLo。**

## 一、总顺序模板

| 1 | 2 | 3 | 4 | 5 |
| :--- | :--- | :--- | :--- | :--- |
| 代词（N→A→D） | 已知名词 | 状语 TeKaMoLo | 否定词 nicht | 新信息、介词宾语 |

## 二、代词与名词的排列

| 规则 | 例 |
| :--- | :--- |
| 代词一律靠前，紧跟变位动词或主语 | **Gestern hat er es mir gegeben.** |
| 两个代词：第四格在第三格前 | **Er gibt es mir.** |
| 两个名词：第三格在第四格前 | **Er gibt dem Kind das Buch.** |
| 一名词一代词：代词在前 | **Er gibt es dem Kind. / Er gibt ihm das Buch.** |

## 三、TeKaMoLo：状语的顺序

| 缩写 | 类别 | 提问 | 例 |
| :--- | :--- | :--- | :--- |
| **Te** | temporal 时间 | wann? | heute, um acht |
| **Ka** | kausal 原因 | warum? | wegen des Regens |
| **Mo** | modal 方式 | wie? | mit dem Auto, gern |
| **Lo** | lokal 地点 | wo? wohin? | nach Hause, in Berlin |

**Ich fahre heute wegen des Streiks mit dem Fahrrad ins Büro.**
我今天因为罢工骑自行车去办公室。

这是默认顺序，不是铁律：需要强调时可以调整，
但把地点放在时间前通常听起来别扭。

## 四、已知与未知（Thema–Rhema）

德语句子的信息重心在 **后面**。
带定冠词的已知信息靠前，带不定冠词的新信息靠后：

* **Ich habe das Buch einem Kollegen gegeben.**（书是已知的）
* **Ich habe dem Kollegen ein Buch gegeben.**（书是新信息）

## 五、例句

**Ich habe ihn dir gestern schon vorgestellt.**
我昨天就把他介绍给你了。

**Wir müssen morgen wegen des Umzugs früher aufstehen.**
我们明天因为搬家得早点起。

**Sie hat mir das Paket leider nicht rechtzeitig geschickt.**
她可惜没能及时把包裹寄给我。

**Er fährt jeden Sommer mit seiner Familie nach Italien.**
他每年夏天和家人去意大利。

**Man hat den Kindern die Geschichte mehrmals erzählt.**
有人给孩子们讲过好几遍这个故事。

**Kannst du es mir bitte noch einmal erklären?**
你能再给我解释一遍吗？

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Er gibt mir es. | Er gibt es mir. | 两代词：第四格在前 |
| Ich fahre nach Berlin morgen. | Ich fahre morgen nach Berlin. | 时间在地点前 |
| Er hat gestern mir geholfen. | Er hat mir gestern geholfen. | 代词靠前 |
| Ich gebe das Buch dem Kind.（无强调语境） | Ich gebe dem Kind das Buch. | 两名词：第三格在前 |
"""

AUTHORED['句法/前场'] = """
# 前场与话题化（Vorfeld）

> CEFR B1 · 关键词：Vorfeld, Topikalisierung, Inversion

前场是变位动词之前的位置。它 **只能容纳一个句子成分**，
放什么进去决定了句子的出发点和篇章衔接。

## 一、谁可以进前场

| 成分 | 例 |
| :--- | :--- |
| 主语（最常见） | **Ich** komme morgen. |
| 时间状语 | **Morgen** komme ich. |
| 地点状语 | **In Berlin** war ich noch nie. |
| 第四格宾语 | **Diesen Film** habe ich schon gesehen. |
| 第三格宾语 | **Meinem Bruder** gefällt das nicht. |
| 介词宾语 | **Auf dich** habe ich gewartet. |
| 整个从句 | **Weil es regnet**, bleiben wir zu Hause. |
| es（虚位） | **Es** kamen viele Gäste. |

## 二、前场的三大功能

1. **衔接上文**：把已知信息放前场，句子读起来连贯。
   **Gestern war ich im Museum. Dort habe ich einen alten Freund getroffen.**
2. **对比强调**：**Fleisch esse ich nicht, Fisch schon.**
3. **设定框架**：时间、地点、条件先行。

## 三、不占前场的成分

以下位于句首但 **不算前场**，后面语序不变：

| 类型 | 例 |
| :--- | :--- |
| 并列连词 und, aber, oder, denn, sondern | **Aber ich habe keine Zeit.** |
| 呼语、感叹词、Ja/Nein | **Anna, kommst du?** |
| 前置的 also, ja, nein, tja | **Nein, ich komme nicht.** |

对比 **副词性连词**（deshalb, trotzdem, dann, außerdem），它们 **占前场**，
所以后面必须倒装：**Es regnet, deshalb bleiben wir zu Hause.**

## 四、从句在前场

整个从句算一个成分，因此主句动词紧跟其后（「动词碰动词」）：

**Wenn du Zeit hast, ruf mich bitte an.**
**Dass er nicht gekommen ist, hat mich geärgert.**

## 五、例句

**Diesen Vorschlag kann ich leider nicht unterstützen.**
这个建议我恐怕无法支持。

**In den letzten Jahren hat sich viel verändert.**
最近几年变化很大。

**Darüber müssen wir noch einmal in Ruhe sprechen.**
这件事我们得再心平气和地谈一次。

**Obwohl es spät war, sind wir noch spazieren gegangen.**
虽然已经很晚了，我们还是去散了步。

**Es waren mehr Leute da, als wir erwartet hatten.**
来的人比我们预期的多。

**Zu Hause bleibe ich heute bestimmt nicht.**
我今天肯定不待在家里。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Morgen ich habe keine Zeit. | Morgen habe ich keine Zeit. | 前场后必须倒装 |
| Gestern im Kino war ich. | Gestern war ich im Kino. | 前场只放一个成分 |
| Deshalb ich bleibe zu Hause. | Deshalb bleibe ich zu Hause. | deshalb 占前场 |
| Aber bleibe ich zu Hause. | Aber ich bleibe zu Hause. | aber 不占前场 |
"""

AUTHORED['句法/否定'] = """
# 否定（Negation）

> CEFR A2 · 关键词：nicht, kein, Satznegation, Sondernegation

德语否定的难点不在词汇，而在 **nicht 放哪儿**。

## 一、nicht 还是 kein

| 用 kein | 用 nicht |
| :--- | :--- |
| 否定带 **不定冠词** 的名词：Ich habe **kein** Auto. | 否定带定冠词或物主冠词的名词：Das ist **nicht** mein Auto. |
| 否定 **无冠词** 的名词：Ich trinke **keinen** Kaffee. | 否定动词、形容词、副词：Ich komme **nicht**. |
| 否定物质名词、抽象名词：Ich habe **keine** Zeit. | 否定专有名词：Das ist **nicht** Berlin. |

kein 按不定冠词变格，且有复数：**keine Kinder**。

## 二、nicht 的位置：整句否定

整句否定时，nicht 站在 **中场的最后**，即右括号之前：

* **Ich kenne diesen Mann nicht.**
* **Ich habe ihn gestern nicht gesehen.**（分词前）
* **Ich kann heute nicht kommen.**（不定式前）
* **Der Zug fährt nicht ab.**（可分前缀前）

但下列成分要 **排在 nicht 之后**（因为它们与动词构成一体）：

| 类型 | 例 |
| :--- | :--- |
| 表语 | Er ist **nicht müde**. |
| 方向、地点补足语 | Ich fahre **nicht nach Berlin**. |
| 介词宾语 | Ich warte **nicht auf ihn**. |
| 固定搭配的名词 | Er fährt **nicht Rad**. |

## 三、局部否定（Sondernegation）

要否定某一个成分，就把 nicht 直接放在它前面，通常后接 sondern：

**Ich fahre nicht morgen, sondern übermorgen.**
我不是明天走，是后天走。

## 四、其他否定词

| 词 | 意义 | 例 |
| :--- | :--- | :--- |
| nie / niemals | 从不 | Ich war **nie** dort. |
| niemand | 没有人 | **Niemand** hat angerufen. |
| nichts | 什么都没有 | Ich habe **nichts** gehört. |
| nirgendwo / nirgends | 哪儿也不 | Ich finde ihn **nirgends**. |
| noch nicht / nicht mehr | 还没 / 不再 | Er ist **noch nicht** da. |
| kein ... mehr | 不再有 | Ich habe **kein Geld mehr**. |
| weder ... noch | 既不……也不 | **weder Fisch noch Fleisch** |

**德语不用双重否定表否定**：不能说 Ich habe nicht nichts gesehen。

## 五、例句

**Ich habe heute leider keine Zeit.**
我今天可惜没时间。

**Das Paket ist bis jetzt noch nicht angekommen.**
包裹到现在还没到。

**Sie wohnt nicht mehr in München.**
她不在慕尼黑住了。

**Er hat mir nicht geantwortet.**
他没回复我。

**Niemand konnte die Frage beantworten.**
没人能回答这个问题。

**Wir fahren nicht mit dem Auto, sondern mit dem Zug.**
我们不开车，坐火车。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe nicht Zeit. | Ich habe keine Zeit. | 无冠词名词用 kein |
| Ich bin nicht müde nicht. | Ich bin nicht müde. | 表语在 nicht 之后 |
| Ich kenne nicht ihn. | Ich kenne ihn nicht. | 代词在 nicht 之前 |
| Ich habe nichts nicht gesehen. | Ich habe nichts gesehen. | 不用双重否定 |
"""

AUTHORED['句法/疑问句'] = """
# 疑问句（Fragesätze）

> CEFR A1 · 关键词：Ja/Nein-Frage, W-Frage, indirekte Frage

## 一、两种直接疑问句

| 类型 | 动词位置 | 例 | 回答 |
| :--- | :--- | :--- | :--- |
| 是非疑问 Ja/Nein-Frage | **第一位** | **Kommst** du morgen? | Ja / Nein / Doch |
| 补充疑问 W-Frage | 疑问词占前场，动词第二位 | **Wann kommst** du? | 具体信息 |

## 二、疑问词一览

| 词 | 意义 | 例 |
| :--- | :--- | :--- |
| wer / wen / wem / wessen | 谁（四个格） | **Wem** gehört das? |
| was | 什么 | **Was** machst du? |
| wann / seit wann / bis wann | 何时 | **Seit wann** lernst du Deutsch? |
| wo / wohin / woher | 在哪 / 去哪 / 从哪 | **Woher** kommst du? |
| wie | 怎样 | **Wie** geht es dir? |
| wie viel / wie viele | 多少 | **Wie viele** Geschwister hast du? |
| wie lange / wie oft | 多久 / 多常 | **Wie oft** fährst du? |
| warum / wieso / weshalb | 为什么 | **Warum** lachst du? |
| welcher / welche / welches | 哪一个（变格） | **Welchen** Film meinst du? |
| was für ein | 什么样的 | **Was für ein** Auto ist das? |

**welcher 与 was für ein 的区别**：welcher 从已知范围中挑选，
was für ein 询问性质。

## 三、否定疑问句与 doch

**Hast du keinen Hunger?** 你不饿吗？
肯定回答必须用 **Doch**，否定回答用 **Nein**。

## 四、间接疑问句：动词到末位

| 直接 | 间接 |
| :--- | :--- |
| Wann kommt er? | Ich weiß nicht, **wann er kommt**. |
| Kommt er? | Ich weiß nicht, **ob er kommt**. |

是非疑问变间接疑问要加 **ob**；
补充疑问保留疑问词。间接疑问句是从句，动词末位，前面用逗号。

## 五、其他提问方式

| 形式 | 例 |
| :--- | :--- |
| 反义疑问（附加问句） | Du kommst doch, **oder**? / **nicht wahr**? |
| 陈述句 + 升调（口语） | **Du kommst morgen?** |
| 选择疑问 | Trinkst du Tee **oder** Kaffee? |
| wo- 复合词提问 | **Worauf** wartest du? |

## 六、例句

**Wie lange dauert die Fahrt nach Köln?**
去科隆要多久？

**Was für einen Wein möchten Sie?**
您想要什么样的葡萄酒？

**Weißt du, ob der Laden heute geöffnet hat?**
你知道这家店今天开不开吗？

**Wem hast du den Schlüssel gegeben?**
你把钥匙给谁了？

**Er hat gefragt, warum wir nicht gekommen sind.**
他问我们为什么没来。

**Du hast das doch schon erledigt, oder?**
这事你已经办好了吧？

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Warum du kommst nicht? | Warum kommst du nicht? | 动词第二位 |
| Ich weiß nicht, wann kommt er. | ..., wann er kommt. | 间接疑问动词末位 |
| Ich weiß nicht, wenn er kommt. | ..., ob er kommt. | wenn ≠ ob |
| A: Kommst du nicht? B: Ja. | B: Doch. | 否定问句用 doch |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 从句
# ---------------------------------------------------------------------------
AUTHORED['从句/从句总览'] = """
# 从句总览（Nebensätze — Überblick）

> CEFR B1 · 关键词：Nebensatz, Konjunktion, Verbendstellung

从句是德语从 A2 迈向 B1 的分水岭。规则只有一条，但必须彻底自动化：
**从句中变位动词在最后。**

## 一、三种从句的引导方式

| 类型 | 引导词 | 例 |
| :--- | :--- | :--- |
| 连词从句 | dass, weil, wenn, ob, obwohl ... | Ich weiß, **dass** er kommt. |
| 关系从句 | der/die/das, welcher, wo, was | Der Mann, **der** dort steht, ... |
| 间接疑问句 | 疑问词 或 ob | Ich frage, **wann** er kommt. |

## 二、从句内部语序

| 位置 | 内容 |
| :--- | :--- |
| 1 | 连词 / 关系词 |
| 2 | 主语 |
| 3 | 中场（宾语、状语，规则同主句） |
| 末 | 变位动词（前面是不定式或分词） |

**..., weil ich dir das Buch gestern nicht geben konnte.**

三个例外语序：
1. 双不定式：助动词跳到不定式之前 —— **..., weil ich habe arbeiten müssen.**
2. 比较短语可留在动词后 —— **..., weil er größer ist als ich.**
3. 后置的从句、不定式短语 —— **..., weil ich gehört habe, dass du kommst.**

## 三、从句的位置与逗号

| 位置 | 例 | 主句语序 |
| :--- | :--- | :--- |
| 后置 | Ich bleibe zu Hause, **weil es regnet**. | 正常 |
| 前置 | **Weil es regnet**, bleibe ich zu Hause. | 倒装（从句占前场） |
| 中插 | Der Mann, **der dort steht**, ist mein Chef. | 被从句打断 |

**德语从句一律用逗号隔开**，这与英语不同，不可省略。

## 四、连词的三大类别（决定语序）

| 类别 | 例词 | 后面语序 |
| :--- | :--- | :--- |
| 并列连词 | und, aber, oder, denn, sondern | 不变（不占前场） |
| 副词性连词 | deshalb, trotzdem, dann, außerdem | 倒装（占前场） |
| 从属连词 | weil, dass, wenn, obwohl, damit | **动词末位** |

同义但类别不同的三组，最容易出错：
weil（从属）／ denn（并列）／ deshalb（副词性）；
obwohl（从属）／ aber（并列）／ trotzdem（副词性）。

## 五、例句

**Ich habe gehört, dass du eine neue Stelle gefunden hast.**
我听说你找到新工作了。

**Obwohl er sehr müde war, hat er weitergearbeitet.**
虽然他很累，他还是继续工作了。

**Wenn du morgen Zeit hast, können wir uns treffen.**
你明天要是有空，我们可以见个面。

**Er kam zu spät, weil er den Bus verpasst hatte.**
他迟到了，因为他没赶上公交。

**Ich weiß nicht, ob sich das noch ändern lässt.**
我不知道这还能不能改。

**Bevor wir anfangen, möchte ich noch etwas erklären.**
在我们开始之前，我还想说明一点。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| ..., weil ich habe keine Zeit. | ..., weil ich keine Zeit habe. | 动词末位 |
| Weil es regnet, ich bleibe zu Hause. | Weil es regnet, bleibe ich zu Hause. | 从句占前场，主句倒装 |
| Ich glaube dass er kommt. | Ich glaube, dass er kommt. | 必须加逗号 |
| ..., weil er hat mir geholfen. | ..., weil er mir geholfen hat. | 助动词也在末位 |
"""

AUTHORED['从句/dass从句'] = """
# dass 从句与主语从句（Inhaltssätze）

> CEFR A2 · 关键词：dass, Subjektsatz, Objektsatz, es

dass 从句是德语最基本的内容从句，充当句子的 **主语或宾语**。

## 一、作宾语

跟在表示「说、想、知道、感觉」的动词后面：

**Ich weiß, dass du recht hast.** 我知道你说得对。
**Er hat gesagt, dass er später kommt.** 他说他晚点来。

高频动词：sagen, wissen, glauben, denken, meinen, hoffen, finden,
erzählen, hören, sehen, merken, vermuten, bezweifeln, versprechen。

## 二、作主语

**Dass er nicht angerufen hat, ärgert mich.**
他没打电话这件事让我生气。

主语从句后置时，前场用 **es** 占位：
**Es ärgert mich, dass er nicht angerufen hat.**

常见框架：Es ist schön / wichtig / schade / klar / möglich, dass ...

## 三、需要 da- 复合词铺垫的情形

如果主句动词要求某个介词，dass 从句前必须加 da- 复合词：

| 动词 | 例 |
| :--- | :--- |
| sich freuen über | **Ich freue mich darüber, dass du kommst.** |
| warten auf | **Wir warten darauf, dass es aufhört zu regnen.** |
| denken an | **Denk daran, dass wir morgen früh los müssen.** |
| abhängen von | **Es hängt davon ab, dass alle mitmachen.** |

## 四、省略 dass

口语和某些动词后可以省略 dass，此时从句变成 **主句语序**（动词第二位）：

**Ich glaube, er kommt heute nicht.**（= Ich glaube, dass er heute nicht kommt.）

注意：一旦省略 dass，动词就 **不再在末位**。

## 五、用不定式替代

主句和从句主语相同时，优先用带 zu 的不定式：

**Ich hoffe, dass ich bald fertig bin.** → **Ich hoffe, bald fertig zu sein.**

## 六、例句

**Es tut mir leid, dass ich mich nicht früher gemeldet habe.**
抱歉我没有早点联系你。

**Sie hat mir versprochen, dass sie pünktlich sein wird.**
她答应我她会准时。

**Dass du das geschafft hast, freut mich sehr.**
你做成了这件事，我很高兴。

**Ich bin sicher, dass wir eine Lösung finden.**
我确信我们会找到办法。

**Wir müssen damit rechnen, dass es Verzögerungen gibt.**
我们必须料到会有延误。

**Ich denke, das ist keine gute Idee.**
我觉得这不是个好主意。

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich weiß, dass er kommt heute. | ..., dass er heute kommt. | 动词末位 |
| Ich freue mich, dass du kommst.（freuen über） | Ich freue mich darüber, dass ... | 需要 da- 复合词 |
| Ich glaube, dass er kommt nicht. | Ich glaube, er kommt nicht. / ..., dass er nicht kommt. | 省略 dass 则不倒装 |
| Das ist schön dass du da bist. | Es ist schön, dass du da bist. | es 占位 + 逗号 |
"""

AUTHORED['从句/原因与让步'] = """
# 原因从句与让步从句（Kausal- und Konzessivsätze）

> CEFR B1 · 关键词：weil, da, obwohl, trotzdem

## 一、原因：weil / da / denn / deshalb

| 词 | 类别 | 语序 | 语感 |
| :--- | :--- | :--- | :--- |
| **weil** | 从属连词 | 动词末位 | 最常用，回答 warum |
| **da** | 从属连词 | 动词末位 | 原因已知，多前置，书面 |
| **denn** | 并列连词 | 语序不变 | 补充说明，不能前置 |
| **deshalb / deswegen / darum / daher** | 副词性连词 | 倒装 | 引出 **结果** |

**Ich bleibe zu Hause, weil ich krank bin.**
**Da ich krank bin, bleibe ich zu Hause.**
**Ich bleibe zu Hause, denn ich bin krank.**
**Ich bin krank, deshalb bleibe ich zu Hause.**

介词版本：**wegen + G**（Ich bleibe wegen meiner Krankheit zu Hause.）、
aufgrund + G、vor + D（不受控的生理反应：vor Angst zittern）、
aus + D（有意识的动机：aus Liebe）。

## 二、让步：obwohl / trotzdem / aber / trotz

| 词 | 类别 | 语序 |
| :--- | :--- | :--- |
| **obwohl / obgleich / obschon** | 从属连词 | 动词末位 |
| **trotzdem / dennoch** | 副词性连词 | 倒装 |
| **aber / doch** | 并列连词 | 语序不变 |
| **trotz + G** | 介词 | —— |

**Obwohl es regnete, sind wir spazieren gegangen.**
**Es regnete, trotzdem sind wir spazieren gegangen.**
**Trotz des Regens sind wir spazieren gegangen.**

## 三、无条件让步

| 结构 | 例 |
| :--- | :--- |
| **auch wenn / selbst wenn** | **Auch wenn es regnet, gehen wir.** 就算下雨我们也去 |
| **wie ... auch** | **Wie schwer es auch ist, ...** 无论多难 |
| **wer/was/wo auch immer** | **Was auch immer passiert, ...** 无论发生什么 |
| **so ... auch** | **So müde er auch war, ...** 尽管他那么累 |

## 四、例句

**Weil der Zug Verspätung hatte, kam ich zu spät zur Sitzung.**
因为火车晚点，我开会迟到了。

**Da wir noch Zeit haben, können wir zu Fuß gehen.**
既然我们还有时间，可以走着去。

**Er hat den Test bestanden, obwohl er kaum gelernt hatte.**
虽然他几乎没学，还是通过了考试。

**Das Konzert war ausverkauft, trotzdem haben wir noch Karten bekommen.**
音乐会票卖光了，我们还是弄到了票。

**Sie zitterte vor Kälte.**
她冷得发抖。

**Auch wenn du recht hast, solltest du höflicher sein.**
就算你有理，也该客气点。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Weil es regnet, deshalb bleibe ich zu Hause. | 二选一 | 不能同时用 |
| ..., obwohl er hat kaum gelernt. | ..., obwohl er kaum gelernt hatte. | 动词末位 |
| Denn ich bin krank, bleibe ich zu Hause. | Da ich krank bin, ... | denn 不能前置 |
| Trotz dem Regen（书面） | Trotz des Regens | trotz 加第二格 |
"""

AUTHORED['从句/时间从句'] = """
# 时间从句（Temporalsätze）

> CEFR B1 · 关键词：als, wenn, wann, während, bevor, nachdem, seit(dem), bis

## 一、als / wenn / wann 三分法

德语学习者最经典的陷阱：

| 词 | 用法 | 例 |
| :--- | :--- | :--- |
| **als** | 过去的 **一次性** 事件或一段状态 | **Als ich Kind war**, wohnten wir in Bonn. |
| **wenn** | 现在或将来的一次；任何时候的 **反复**（每当） | **Wenn ich Zeit habe**, lese ich. / **Immer wenn** es regnete, ... |
| **wann** | 疑问词，只用于直接或间接疑问 | Ich weiß nicht, **wann** er kommt. |

口诀：**过去一次用 als，其余用 wenn，问句用 wann。**

## 二、同时、先后、直到

| 连词 | 时间关系 | 例 |
| :--- | :--- | :--- |
| **während** | 同时进行 | **Während ich koche**, deckst du den Tisch. |
| **solange** | 只要……期间 | **Solange du hier wohnst**, gelten meine Regeln. |
| **bevor / ehe** | 主句在从句 **之前** | **Bevor du gehst**, ruf mich an. |
| **nachdem** | 主句在从句 **之后** | **Nachdem er gegessen hatte**, ging er. |
| **sobald** | 一……就…… | **Sobald ich ankomme**, melde ich mich. |
| **seit / seitdem** | 自从 | **Seitdem sie umgezogen ist**, sehen wir sie selten. |
| **bis** | 直到 | Warte, **bis ich zurück bin**. |

## 三、nachdem 的时态配套（重要）

nachdem 从句必须比主句 **早一个时态层次**：

| 从句 | 主句 |
| :--- | :--- |
| 过去完成时 | 过去时 / 现在完成时 |
| 现在完成时 | 现在时 / 将来时 |

**Nachdem wir gegessen hatten, gingen wir spazieren.**
**Nachdem ich gefrühstückt habe, fahre ich ins Büro.**

## 四、介词替代

| 从句 | 介词短语 |
| :--- | :--- |
| während ... | **während + G**：während der Sitzung |
| bevor ... | **vor + D**：vor der Sitzung |
| nachdem ... | **nach + D**：nach der Sitzung |
| seitdem ... | **seit + D**：seit der Sitzung |
| bis ... | **bis zu + D**：bis zum Abend |

## 五、例句

**Als ich gestern nach Hause kam, war niemand da.**
我昨天回家时一个人都没有。

**Immer wenn ich ihn treffe, redet er über seine Arbeit.**
每次我遇到他，他都聊工作。

**Während des Films ist er eingeschlafen.**
电影放着他就睡着了。

**Bevor du unterschreibst, lies bitte den Vertrag genau.**
签字之前请仔细读合同。

**Nachdem der Regen aufgehört hatte, kam die Sonne heraus.**
雨停之后太阳出来了。

**Seit sie in Berlin wohnt, hat sie sich sehr verändert.**
自从她住在柏林，变化很大。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Wenn ich Kind war, ... | Als ich Kind war, ... | 过去一次性用 als |
| Ich weiß nicht, wenn er kommt. | ..., wann er kommt. | 间接疑问用 wann |
| Nachdem er isst, geht er. | Nachdem er gegessen hat, geht er. | 时态要错开 |
| Während ich koche, du deckst den Tisch. | ..., deckst du den Tisch. | 主句倒装 |
"""

AUTHORED['从句/目的与结果'] = """
# 目的从句与结果从句（Final- und Konsekutivsätze）

> CEFR B1 · 关键词：damit, um zu, so dass, sodass, zu ... um zu

## 一、目的：damit vs. um ... zu

| 结构 | 条件 | 例 |
| :--- | :--- | :--- |
| **um ... zu** | 主从句 **主语相同** | Ich lerne Deutsch, **um in Wien zu studieren**. |
| **damit** | 主语 **不同**（相同时也可，但不自然） | Ich spreche langsam, **damit du mich verstehst**. |

介词替代：**zu + D**（zum Lernen）、**für + A**、**zwecks + G**（公文）。

目的从句里不用情态动词 wollen / können：
不说 damit ich kann schlafen，而说 **damit ich schlafen kann**，
更常见的是直接省略：**damit ich schlafe**。

## 二、结果：so dass / sodass

| 结构 | 说明 | 例 |
| :--- | :--- | :--- |
| **sodass / so dass** | 引出结果 | Er sprach leise, **sodass ich ihn kaum verstand**. |
| **so + 形容词 + dass** | 强调程度 | Er sprach **so leise, dass** ich ihn kaum verstand. |
| **solch ein / so ein ... dass** | 名词的程度 | Es war **so ein Lärm, dass** wir gehen mussten. |
| 副词性连词 **also, folglich, infolgedessen** | 主句倒装 | Es regnete, **folglich blieben wir zu Hause**. |

## 三、否定结果：zu ... um zu 与 zu ... als dass

| 结构 | 意义 | 例 |
| :--- | :--- | :--- |
| **zu + 形容词 + um ... zu** | 太……以至于不能 | Er ist **zu jung, um** Auto **zu fahren**. |
| **genug / ausreichend ... um zu** | 足够……可以 | Er ist alt **genug, um** zu wählen. |
| **zu ... als dass + 虚拟式二式** | 太……以至于不可能（书面） | Es ist **zu spät, als dass** wir noch anfangen **könnten**. |
| **ohne dass / ohne zu** | 没有……就 | Er ging, **ohne sich zu verabschieden**. |

## 四、例句

**Ich habe früher Feierabend gemacht, um pünktlich zu Hause zu sein.**
我提早下班，为的是准时到家。

**Ich schreibe es auf, damit du es nicht vergisst.**
我写下来，免得你忘了。

**Der Koffer war so schwer, dass ich ihn kaum tragen konnte.**
箱子太重了，我几乎搬不动。

**Er hat sich verletzt, sodass er nicht mitspielen kann.**
他受伤了，所以不能上场。

**Sie ist zu erfahren, um so einen Fehler zu machen.**
她太有经验了，不会犯这种错。

**Das Angebot war zu gut, als dass wir es hätten ablehnen können.**
这个报价太好了，我们不可能拒绝。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich lerne Deutsch, um meine Eltern zu sein stolz. | ..., damit meine Eltern stolz sind. | 主语不同用 damit |
| ..., damit ich kann schlafen. | ..., damit ich schlafen kann. | 从句动词末位 |
| Er ist zu jung, um nicht Auto zu fahren. | Er ist zu jung, um Auto zu fahren. | zu ... um zu 本身含否定 |
| Er sprach so leise, sodass ... | Er sprach so leise, dass ... | so 与 sodass 不并用 |
"""

AUTHORED['从句/条件从句'] = """
# 条件从句（Konditionalsätze）

> CEFR B1 · 关键词：wenn, falls, Realis, Irrealis, uneingeleitet

## 一、真实条件（Realis）

用 **wenn** 或 **falls** + 直陈式：

**Wenn es morgen regnet, bleiben wir zu Hause.**
明天要是下雨，我们就待在家里。

| 词 | 语感 |
| :--- | :--- |
| **wenn** | 通用，也可表「每当」 |
| **falls / im Falle, dass** | 强调「万一」，可能性较低 |
| **sofern / vorausgesetzt, dass** | 只要、前提是（正式） |

主句里常用 **dann** 或 **so** 呼应：
**Wenn du fertig bist, dann sag Bescheid.**

## 二、非真实条件（Irrealis）：虚拟式二式

| 时间 | 形式 | 例 |
| :--- | :--- | :--- |
| 现在／将来 | wäre / hätte / würde | **Wenn ich Zeit hätte, würde ich mitkommen.** |
| 过去 | hätte/wäre + 第二分词 | **Wenn ich Zeit gehabt hätte, wäre ich mitgekommen.** |
| 混合 | 过去条件 + 现在结果 | **Wenn ich damals studiert hätte, wäre ich jetzt Arzt.** |

## 三、省略 wenn 的条件句

去掉 wenn，把动词提到 **句首**，主句常加 so / dann：

* **Hätte ich Zeit, würde ich mitkommen.**
* **Wäre er gekommen, hätten wir uns gefreut.**
* **Sollten Sie Fragen haben, wenden Sie sich bitte an mich.**（公文常用）

## 四、其他表达条件的手段

| 手段 | 例 |
| :--- | :--- |
| 命令句 + und / oder | **Beeil dich, und wir schaffen es noch.** |
| bei + D | **Bei Regen fällt das Spiel aus.** |
| ohne + A / ohne ... zu | **Ohne deine Hilfe wäre das nichts geworden.** |
| sonst / andernfalls | **Beeil dich, sonst kommen wir zu spät.** |
| es sei denn（除非） | **Wir fahren, es sei denn, es schneit.** |

## 五、例句

**Falls Sie den Termin nicht wahrnehmen können, sagen Sie bitte ab.**
如果您不能赴约，请取消。

**Wenn ich du wäre, würde ich das Angebot annehmen.**
我要是你就接受这个提议。

**Wenn du mich gefragt hättest, hätte ich dir geholfen.**
你当初要是问我，我就帮你了。

**Sollte es Probleme geben, rufen Sie mich bitte sofort an.**
万一有问题，请立刻打给我。

**Bei schlechtem Wetter findet die Führung im Museum statt.**
天气不好的话，导览在博物馆内进行。

**Wir kommen pünktlich, es sei denn, der Zug hat Verspätung.**
我们会准时到，除非火车晚点。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Wenn ich Zeit hätte, komme ich. | ..., käme ich / würde ich kommen. | 主从句都用虚拟式 |
| Wenn er kommt, dann ich freue mich. | ..., dann freue ich mich. | dann 占前场要倒装 |
| Ich weiß nicht, wenn er kommt. | ..., ob er kommt. | wenn 表条件，不表疑问 |
| Wenn ich hätte Zeit, ... | Wenn ich Zeit hätte, ... | 从句动词末位 |
"""

AUTHORED['从句/方式与比较'] = """
# 方式从句与比较从句（Modal- und Komparativsätze）

> CEFR B2 · 关键词：indem, ohne dass, als ob, je desto

## 一、方式与手段

| 连词 | 意义 | 例 |
| :--- | :--- | :--- |
| **indem** | 通过……方式（同一主语） | **Indem er täglich übte**, wurde er besser. |
| **dadurch, dass** | 通过……（可换主语） | Er half mir **dadurch, dass** er den Antrag ausfüllte. |
| **ohne dass / ohne ... zu** | 没有…… | Er ging, **ohne dass** ich es merkte. |
| **(an)statt dass / statt ... zu** | 而不是 | **Statt** zu helfen, sah er nur zu. |
| **wobei** | 与此同时、其中 | Er arbeitet viel, **wobei** er kaum Pausen macht. |

**indem 不等于「同时」**，它回答的是 wie / wodurch。

## 二、比较从句

| 结构 | 意义 | 例 |
| :--- | :--- | :--- |
| **so ... wie** | 一样 | Er ist **so groß wie** sein Vater. |
| **-er als** | 比 | Er ist **größer als** sein Vater. |
| **je ... desto / umso** | 越……越…… | **Je mehr** man übt, **desto besser** wird man. |
| **wie ... so** | 如同 | **Wie** man sät, **so** erntet man. |

**je ... desto** 的语序是固定难点：
je 从句是 **从句**（动词末位），desto 主句是 **倒装**（比较级 + 动词 + 主语）：

**Je länger ich hier arbeite, desto besser gefällt es mir.**

## 三、非真实比较：als ob / als wenn / als

三种写法意思相同，语序不同：

| 结构 | 语序 | 例 |
| :--- | :--- | :--- |
| **als ob / als wenn** | 动词末位 | Er tut, **als ob er alles wüsste**. |
| **als** | 动词 **紧跟 als** | Er tut, **als wüsste er alles**. |

动词用 **虚拟式二式**（口语中也见直陈式）。

## 四、例句

**Man lernt eine Sprache, indem man sie täglich benutzt.**
学语言靠每天使用。

**Er hat die Prüfung bestanden, ohne dass er viel gelernt hätte.**
他没怎么学就通过了考试。

**Je früher wir losfahren, desto weniger Stau haben wir.**
我们出发越早，堵车越少。

**Sie sieht aus, als hätte sie die ganze Nacht nicht geschlafen.**
她看上去像整晚没睡。

**Das Ergebnis war besser, als wir erwartet hatten.**
结果比我们预期的好。

**Statt sich zu beschweren, sollte er selbst etwas ändern.**
他与其抱怨，不如自己改变点什么。

## 五、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Je mehr man übt, desto man wird besser. | ..., desto besser wird man. | desto 后先比较级再动词 |
| Er ist größer wie ich. | Er ist größer als ich. | 比较级用 als |
| Er tut, als ob er weiß alles. | ..., als ob er alles wüsste. | 动词末位 + 虚拟式 |
| Indem er kam, war ich schon weg.（想说「当」） | Als er kam, ... | indem 不表时间 |
"""

AUTHORED['从句/关系从句基础'] = """
# 关系从句：基础（Relativsätze — Grundlagen）

> CEFR B1 · 关键词：Relativsatz, Relativpronomen, Bezugswort

关系从句用来给名词加上一整句话的说明。
德语的关系代词形式几乎与定冠词相同，只有 **第二格和第三格复数** 例外。

## 一、关系代词变格表

| 格 | 阳性 | 阴性 | 中性 | 复数 |
| :--- | :--- | :--- | :--- | :--- |
| 第一格 | **der** | **die** | **das** | **die** |
| 第四格 | **den** | die | das | die |
| 第三格 | **dem** | der | dem | **denen** |
| 第二格 | **dessen** | **deren** | **dessen** | **deren** |

## 二、两条铁律

1. **性和数** 来自主句的先行词；
2. **格** 由关系从句 **内部** 的功能决定。

* **Der Mann, _der_ dort steht, ...**（der 是从句主语 → 第一格）
* **Der Mann, _den_ ich gestern traf, ...**（den 是从句宾语 → 第四格）
* **Der Mann, _dem_ ich geholfen habe, ...**（helfen 要第三格）
* **Der Mann, _dessen_ Auto kaputt ist, ...**（第二格作定语）

## 三、语序与标点

关系从句是从句，**变位动词在最后**，前后都要有逗号：

**Das Buch, das du mir empfohlen hast, war wirklich gut.**

关系从句紧跟在先行词后面；若先行词后还有介词短语，可以稍微后移，
但不能离得太远。

## 四、带介词的关系从句

介词放在关系代词 **前面**，介词决定格：

* **Der Kollege, _mit dem_ ich arbeite, ist Österreicher.**
* **Das Projekt, _an dem_ wir arbeiten, ist fast fertig.**
* **Die Frage, _auf die_ ich warte, ist noch offen.**

介词绝不能像英语那样丢到句尾。

## 五、第二格关系代词

dessen / deren 后面的名词 **不带冠词，也不变格**：

**Die Firma, deren Chef zurückgetreten ist, sucht einen Nachfolger.**
那家老板辞职的公司在找继任者。

## 六、例句

**Kennst du die Frau, die dort am Fenster sitzt?**
你认识坐在窗边的那个女人吗？

**Der Film, den wir gestern gesehen haben, war ziemlich langweilig.**
我们昨天看的那部电影相当无聊。

**Das ist der Kollege, dem ich mein Auto geliehen habe.**
这就是我把车借给他的那位同事。

**Die Studenten, denen ich geholfen habe, haben alle bestanden.**
我帮过的那些学生都通过了。

**Das Haus, in dem ich aufgewachsen bin, steht nicht mehr.**
我长大的那栋房子已经不在了。

**Ein Land, dessen Sprache man spricht, versteht man besser.**
一个国家，你会说它的语言就更能理解它。

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Der Mann, den dort steht | Der Mann, der dort steht | 从句主语用第一格 |
| Der Kollege, den ich arbeite mit | ..., mit dem ich arbeite | 介词前置 |
| Die Firma, deren der Chef ... | Die Firma, deren Chef ... | 第二格后名词不带冠词 |
| Das Buch, das du hast mir empfohlen | ..., das du mir empfohlen hast | 动词末位 |
"""

AUTHORED['从句/关系从句进阶'] = """
# 关系从句：进阶（welcher, wo, Präposition + wo）

> CEFR B2 · 关键词：welcher, wo, worauf, Relativadverb

## 一、welcher 系列

welcher / welche / welches 是 der/die/das 的正式替代形式，
用于避免同形重复（如 die die）：

**Die Regelung, welche die Kommission beschlossen hat, tritt bald in Kraft.**

它 **没有第二格**（不能说 welches Auto 作关系代词的第二格），
第二格只能用 dessen / deren。日常口语中很少使用 welcher。

## 二、wo 及其复合形式

| 形式 | 用法 | 例 |
| :--- | :--- | :--- |
| **wo** | 地点先行词（也可用 in dem/der） | Die Stadt, **wo** ich geboren bin, ... |
| **wohin / woher** | 方向 | Das Land, **wohin** er gereist ist, ... |
| **wo** | 时间先行词（口语） | Der Tag, **wo** wir uns trafen ...（正式：an dem） |
| **worauf, worüber, womit ...** | 先行词是 **整句** 或不定代词 | Er kam zu spät, **worüber** sich alle ärgerten. |

地名（专有名词）后 **只能用 wo**：
**In Heidelberg, wo ich studiert habe, ...**（不能用 in dem）

## 三、指代整个主句的关系从句

用 **was** 或 **wo(r)- 复合词**，前面必须有逗号：

* **Er hat die Prüfung bestanden, was uns alle gefreut hat.**
  他通过了考试，这让我们都很高兴。
* **Sie kam nicht, womit niemand gerechnet hatte.**
  她没来，这谁也没料到。

## 四、was 的其他先行词

was 用在这些词之后：

| 先行词 | 例 |
| :--- | :--- |
| 不定代词 alles, etwas, nichts, vieles, weniges | **Alles, was du sagst, stimmt.** |
| 中性名词化的最高级 | **Das Beste, was mir passiert ist.** |
| 中性指示代词 das | **Das, was du meinst, verstehe ich.** |

## 五、扩展的分词定语作替代

书面德语常把关系从句压缩为 **扩展定语**：

| 关系从句 | 扩展定语 |
| :--- | :--- |
| das Kind, das auf der Straße spielt | das **auf der Straße spielende** Kind |
| der Brief, der gestern geschrieben wurde | der **gestern geschriebene** Brief |
| die Aufgabe, die gelöst werden muss | die **zu lösende** Aufgabe |

## 六、例句

**Das ist genau das, was ich gesucht habe.**
这正是我要找的。

**Er hat mir nicht geantwortet, was ich sehr unhöflich finde.**
他没回我，我觉得这很不礼貌。

**Die Firma, für welche sie arbeitet, hat ihren Sitz in Zürich.**
她工作的那家公司总部在苏黎世。

**Wien, wo ich zwei Jahre gelebt habe, ist eine wunderbare Stadt.**
维也纳，我在那儿住过两年，是座美妙的城市。

**Es gibt nichts, was ich dagegen tun könnte.**
我对此无能为力。

**Das Thema, worüber wir gestern gesprochen haben, ist heikel.**
我们昨天谈的那个话题很敏感。

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Alles, das du sagst | Alles, was du sagst | 不定代词后用 was |
| In Heidelberg, in dem ich studiert habe | In Heidelberg, wo ich ... | 地名后用 wo |
| Er kam zu spät, was alle ärgerten sich darüber | ..., worüber sich alle ärgerten | 用 wo- 复合词 |
| welches Autos（第二格） | dessen Auto | welcher 无第二格 |
"""

AUTHORED['从句/自由关系从句'] = """
# 自由关系从句（Freie Relativsätze）

> CEFR B2 · 关键词：wer, was, wo, Korrelat

自由关系从句 **没有先行词**，由 wer, was, wo, wie, wann 等直接引导，
整个从句本身充当主句的一个成分。汉语的「谁……谁就……」正是同一思路。

## 一、wer：泛指的人

**Wer** 变格：wer（第一格）／ wen（第四格）／ wem（第三格）／ wessen（第二格）。
主句中常用 **der / den / dem** 呼应：

* **Wer nicht fragt, (der) bleibt dumm.** 不问的人就一直无知。
* **Wer zuletzt lacht, lacht am besten.** 谁笑到最后，谁笑得最好。
* **Wem das nicht passt, der kann gehen.** 谁不满意谁就可以走。

当两个词的格相同时，主句的呼应词可以省略；
格不同时通常保留：**Wer nicht arbeitet, dem gebe ich nichts.**

## 二、was：泛指的事

* **Was du sagst, ist richtig.** 你说的是对的。
* **Was mich betrifft, (so) bin ich einverstanden.** 就我而言，我同意。
* 主句呼应词是 **das**：**Was er versprochen hat, das hält er auch.**

## 三、wo / wohin / woher：地点

* **Wo ein Wille ist, ist auch ein Weg.** 有志者事竟成。
* **Wohin du auch gehst, ich komme mit.** 你去哪儿我都跟着。

## 四、加 auch (immer) 表示无条件

| 形式 | 意义 |
| :--- | :--- |
| **wer auch immer** | 无论谁 |
| **was auch immer** | 无论什么 |
| **wo auch immer** | 无论哪里 |
| **wann auch immer** | 无论何时 |
| **wie auch immer** | 无论怎样 |

**Was auch immer passiert, ich stehe zu dir.**
无论发生什么，我都支持你。

## 五、语序提醒

自由关系从句同样是 **从句**，动词末位；
它若在句首就占据前场，主句必须倒装：

**Wer zu spät kommt, den bestraft das Leben.**

## 六、例句

**Wer Deutsch lernen will, muss viel lesen.**
想学德语的人必须多读。

**Was ich nicht weiß, macht mich nicht heiß.**
我不知道的事不会让我上火（眼不见心不烦）。

**Wem ich vertraue, dem sage ich auch die Wahrheit.**
我信任谁，就对谁说实话。

**Wo viel Licht ist, ist auch viel Schatten.**
光亮之处也多阴影。

**Wie auch immer du dich entscheidest, ich akzeptiere es.**
不管你怎么决定，我都接受。

**Was du heute kannst besorgen, das verschiebe nicht auf morgen.**
今日事今日毕。

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Wer nicht fragt, bleibt er dumm. | Wer nicht fragt, bleibt dumm. | 呼应词与主语不重复 |
| Wer zu spät kommt, das Leben bestraft ihn. | ..., den bestraft das Leben. | 主句倒装 |
| Was du sagst, ist das richtig. | Was du sagst, ist richtig. | 呼应词误置 |
| Wer will Deutsch lernen, ... | Wer Deutsch lernen will, ... | 从句动词末位 |
"""

AUTHORED['从句/间接疑问句'] = """
# 间接疑问句（Indirekte Fragesätze）

> CEFR B1 · 关键词：ob, W-Wort, Verbendstellung, höfliche Frage

间接疑问句把一个问题嵌进另一个句子里。
它有两个作用：**转述提问**，以及 **让提问变客气**。

## 一、两种形式

| 直接问 | 间接问 | 引导词 |
| :--- | :--- | :--- |
| **Kommt er?**（是非） | Ich weiß nicht, **ob er kommt**. | ob |
| **Wann kommt er?**（W-） | Ich weiß nicht, **wann er kommt**. | 疑问词 |

两者都遵守：**动词末位、前面加逗号、不加问号**（除非整句是问句）。

## 二、常见的引导主句

| 类型 | 例 |
| :--- | :--- |
| 直接引出 | Ich weiß nicht, ... / Ich frage mich, ... |
| 转述 | Er hat gefragt, ... / Sie wollte wissen, ... |
| 客气提问 | **Können Sie mir sagen, wo der Bahnhof ist?** |
| 客气提问 | **Wissen Sie, ob der Zug pünktlich kommt?** |
| 不确定 | Es ist unklar, ... / Es kommt darauf an, ... |

客气度对比：
**Wo ist der Bahnhof?** → **Entschuldigung, können Sie mir sagen, wo der Bahnhof ist?**

## 三、ob 与 wenn 的区别（高频错误）

| 词 | 意义 | 例 |
| :--- | :--- | :--- |
| **ob** | 是否（疑问） | Ich weiß nicht, **ob** er kommt. |
| **wenn** | 如果 / 当…… | **Wenn** er kommt, freue ich mich. |

汉语「如果」和「是否」在德语里必须分开，不可混用。

## 四、带介词的间接疑问

主句动词要求介词时，用 **da- 复合词** 铺垫：

**Es hängt davon ab, ob wir genug Zeit haben.**
**Ich bin mir nicht sicher darüber, wie wir vorgehen sollen.**

疑问词本身带介词时，介词随疑问词一起前移：
**Ich weiß nicht, worauf er wartet. / ..., mit wem er gesprochen hat.**

## 五、与虚拟式的配合

正式转述中常用虚拟式一式或二式：
**Er fragte, ob ich Zeit hätte.** 他问我有没有时间。

## 六、例句

**Können Sie mir sagen, wie ich zum Museum komme?**
您能告诉我怎么去博物馆吗？

**Ich habe keine Ahnung, warum das Programm nicht funktioniert.**
我完全不知道这个程序为什么不好使。

**Sie wollte wissen, ob wir am Freitag Zeit haben.**
她想知道我们周五有没有空。

**Es ist noch offen, wer die Präsentation hält.**
谁做展示还没定。

**Ich frage mich, worauf wir eigentlich noch warten.**
我在想我们到底还在等什么。

**Mich interessiert, wie du das gemacht hast.**
我很想知道你是怎么做到的。

## 七、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich weiß nicht, wenn er kommt. | ..., ob er kommt. | ob 表「是否」 |
| Ich weiß nicht, wann kommt er. | ..., wann er kommt. | 动词末位 |
| Können Sie mir sagen, wo ist der Bahnhof? | ..., wo der Bahnhof ist? | 同上 |
| Ich frage mich, auf was er wartet.（书面） | ..., worauf er wartet. | 书面用 wo- 复合词 |
"""

# ---------------------------------------------------------------------------
# AUTHORED — 连词
# ---------------------------------------------------------------------------
AUTHORED['连词/并列连词'] = """
# 并列连词（Koordinierende Konjunktionen）

> CEFR A1 · 关键词：und, aber, oder, denn, sondern, Position 0

并列连词连接两个 **地位相同** 的成分或句子。
它们的关键特征是 **不占前场（位置 0）**，后面语序完全不变。

## 一、五个核心连词

| 连词 | 意义 | 例 |
| :--- | :--- | :--- |
| **und** | 和、而且 | Ich koche, **und** du deckst den Tisch. |
| **aber** | 但是 | Ich bin müde, **aber** ich arbeite weiter. |
| **oder** | 或者 | Kommst du mit, **oder** bleibst du hier? |
| **denn** | 因为 | Ich bleibe hier, **denn** ich bin müde. |
| **sondern** | 而是（前面必有否定） | Er ist nicht Arzt, **sondern** Apotheker. |

## 二、aber 与 sondern 的分工

| 情形 | 用词 |
| :--- | :--- |
| 前句 **无否定** | aber |
| 前句 **有否定** 且后句是「更正」 | **sondern** |
| 前句有否定但后句只是「补充对比」 | aber |

* **Er ist nicht reich, sondern arm.**（更正：不是富，是穷）
* **Er ist nicht reich, aber glücklich.**（对比：不富，但幸福）

固定搭配：**nicht nur ..., sondern auch ...**。

## 三、省略与逗号

主语相同时后句可省略主语：**Ich stehe auf und gehe ins Bad.**（und 前不加逗号）

逗号规则：und / oder 连接两个 **完整主句** 时逗号可加可不加；
**aber, sondern, denn 前必须加逗号**。

## 四、并列成分

并列连词也能连接词或短语，不只是句子：

**Tee oder Kaffee? / schnell, aber ungenau / mein Bruder und ich**

## 五、例句

**Ich wollte anrufen, aber mein Handy war leer.**
我本想打电话，可我手机没电了。

**Wir fahren nicht mit dem Auto, sondern mit dem Zug.**
我们不开车，坐火车。

**Er lernt viel, denn die Prüfung ist nächste Woche.**
他学得很努力，因为下周就考试了。

**Möchten Sie hier essen oder alles mitnehmen?**
您在这儿吃还是全部带走？

**Sie spricht nicht nur Deutsch, sondern auch Russisch.**
她不仅会德语，还会俄语。

**Ich habe geklingelt und lange gewartet.**
我按了门铃，等了很久。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| ..., denn bin ich müde. | ..., denn ich bin müde. | denn 不占前场 |
| Er ist nicht Arzt, aber Apotheker. | ..., sondern Apotheker. | 更正用 sondern |
| Nicht nur Deutsch, aber auch Russisch. | ..., sondern auch Russisch. | 固定搭配 |
| Ich bin müde aber ich arbeite weiter. | ..., aber ich arbeite weiter. | aber 前加逗号 |
"""

AUTHORED['连词/副词性连词'] = """
# 副词性连词（Konjunktionaladverbien）

> CEFR B1 · 关键词：deshalb, trotzdem, dann, Inversion

副词性连词是「披着连词外衣的副词」。
它们既连接句子，又 **占据前场**，因此后面必须 **倒装**：
连词 + 变位动词 + 主语。

## 一、按语义分类

| 语义 | 连词 |
| :--- | :--- |
| 原因结果 | **deshalb, deswegen, darum, daher, also, folglich, somit** |
| 让步 | **trotzdem, dennoch, allerdings, jedoch** |
| 时间 | **dann, danach, anschließend, zuerst, schließlich, seitdem, inzwischen** |
| 补充 | **außerdem, zudem, ferner, überdies, ebenfalls** |
| 对比 | **dagegen, hingegen, stattdessen, vielmehr** |
| 条件 | **sonst, andernfalls, notfalls** |

## 二、位置的灵活性

副词性连词既可以在 **前场**，也可以在 **中场**：

* **Deshalb bleibe ich zu Hause.**（前场，倒装）
* **Ich bleibe deshalb zu Hause.**（中场，正常语序）

这正是它与从属连词、并列连词的分水岭。

## 三、三组对照记忆

| 意义 | 从属连词（动词末位） | 并列连词（不占位） | 副词性连词（倒装） |
| :--- | :--- | :--- | :--- |
| 因为 / 所以 | weil, da | denn | deshalb, also |
| 虽然 / 但是 | obwohl | aber | trotzdem, dennoch |
| 如果 / 否则 | wenn, falls | —— | sonst, andernfalls |
| 而且 | —— | und | außerdem, zudem |

## 四、jedoch 与 allerdings 的特殊性

jedoch 和 allerdings 既可占前场（倒装），
也可像 aber 一样置于句首而 **不占位**：

**Er hat es versprochen, jedoch hat er es vergessen.**
**Er hat es versprochen, jedoch er hat es vergessen.**（较少见）

推荐固定使用倒装形式。

## 五、例句

**Der Zug fiel aus, deshalb mussten wir ein Taxi nehmen.**
火车停运了，所以我们只好打车。

**Es war eiskalt, trotzdem sind wir schwimmen gegangen.**
天冷极了，我们还是去游泳了。

**Zuerst schreiben wir das Konzept, danach besprechen wir es.**
我们先写方案，然后再讨论。

**Die Wohnung ist teuer, außerdem liegt sie sehr weit draußen.**
这套房子贵，而且位置很偏。

**Beeil dich, sonst verpassen wir den Anfang.**
快点，否则我们会错过开头。

**Er wollte kündigen, stattdessen hat er eine Beförderung bekommen.**
他本想辞职，结果反倒升了职。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Deshalb ich bleibe zu Hause. | Deshalb bleibe ich zu Hause. | 占前场必须倒装 |
| Trotzdem er war müde, arbeitete er. | Obwohl er müde war, arbeitete er. | trotzdem 不引导从句 |
| Weil es regnet, deshalb bleibe ich. | 二选一 | 不能双重标记 |
| Außerdem, ich habe keine Zeit. | Außerdem habe ich keine Zeit. | 不加逗号，直接倒装 |
"""

AUTHORED['连词/双部连词'] = """
# 双部连词（Zweiteilige Konnektoren）

> CEFR B1 · 关键词：entweder oder, sowohl als auch, weder noch

双部连词由两个部分共同表意，是提高表达层次的利器。

## 一、清单

| 连词 | 意义 | 例 |
| :--- | :--- | :--- |
| **entweder ... oder** | 要么……要么 | **Entweder** rufst du an **oder** du schreibst. |
| **sowohl ... als auch** | 既……又…… | Er spricht **sowohl** Deutsch **als auch** Französisch. |
| **weder ... noch** | 既不……也不…… | Ich habe **weder** Zeit **noch** Lust. |
| **nicht nur ... sondern auch** | 不仅……而且…… | **Nicht nur** die Miete, **sondern auch** der Strom ist teuer. |
| **zwar ... aber** | 虽然……但是…… | Das Hotel ist **zwar** billig, **aber** laut. |
| **einerseits ... andererseits** | 一方面……另一方面 | **Einerseits** will er bleiben, **andererseits** reizt ihn die Stelle. |
| **je ... desto** | 越……越…… | **Je** mehr, **desto** besser. |
| **teils ... teils** | 部分……部分…… | Der Vortrag war **teils** spannend, **teils** langweilig. |

## 二、语序要点

| 连词 | 第一部分 | 第二部分 |
| :--- | :--- | :--- |
| entweder ... oder | 可占前场（倒装）或在中场 | oder 不占位 |
| weder ... noch | —— | **noch 占前场 → 倒装** |
| zwar ... aber | zwar 常在中场 | aber 不占位 |
| nicht nur ... sondern auch | nicht nur 占前场则倒装 | sondern 不占位 |

* **Weder habe ich Zeit, noch habe ich Lust.**（两处都倒装）
* **Nicht nur hat er sich verspätet, sondern er hat auch nichts gesagt.**（前半倒装）

## 三、weder ... noch 已含否定

不能再加 nicht 或 kein：
不说 Ich habe weder keine Zeit noch ...。

## 四、平行结构

双部连词连接的两个部分必须 **词类和句法功能相同**：

* 名词 + 名词：sowohl **den Vertrag** als auch **die Anlagen**
* 动词 + 动词：entweder **anrufen** oder **schreiben**
* 从句 + 从句：nicht nur, **weil** ..., sondern auch, **weil** ...

## 五、例句

**Wir können entweder heute Abend oder morgen früh telefonieren.**
我们可以今晚或明早通电话。

**Sie ist sowohl kompetent als auch sehr geduldig.**
她既专业又非常有耐心。

**Ich kenne weder ihn noch seine Familie.**
他和他家人我都不认识。

**Die Wohnung ist zwar klein, aber sehr hell.**
这套房子虽然小，但很亮堂。

**Nicht nur die Kinder, sondern auch die Eltern hatten Spaß.**
不仅孩子们，家长们也玩得开心。

**Einerseits verstehe ich dich, andererseits finde ich die Reaktion übertrieben.**
一方面我理解你，另一方面我觉得反应过头了。

## 六、常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe weder keine Zeit noch Lust. | Ich habe weder Zeit noch Lust. | weder noch 已含否定 |
| Nicht nur die Miete, aber auch der Strom | ..., sondern auch der Strom | 固定搭配用 sondern |
| Zwar ist es billig, aber es ist laut es. | Zwar ist es billig, aber es ist laut. | 无重复主语 |
| Weder ich habe Zeit, noch ich habe Lust. | Weder habe ich Zeit, noch habe ich Lust. | 两处都倒装 |
"""

# ---------------------------------------------------------------------------
# EXPANSIONS — 给原有参考型条目补齐双语例句与错误提示
# ---------------------------------------------------------------------------
EXPANSIONS['名词/名词'] = """
## 例句

**Der Schlüssel liegt auf dem Tisch im Wohnzimmer.**
钥匙在客厅的桌子上。

**Das Mädchen spielt mit seinem Bruder im Garten.**
那个女孩和她哥哥在花园里玩。（Mädchen 是中性，代词用 sein）

**Die Freiheit der Presse ist im Grundgesetz verankert.**
新闻自由写在基本法里。（-heit 结尾必为阴性）

**Ich habe dem Kollegen die Unterlagen schon geschickt.**
我已经把材料寄给同事了。

**Die Meinung der Studierenden wurde nicht berücksichtigt.**
学生们的意见没有被考虑。

**Ohne Zucker schmeckt der Kaffee viel besser.**
不加糖的咖啡好喝多了。

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| das Freiheit | die Freiheit | -heit 一律阴性 |
| Das Mädchen und ihr Bruder | Das Mädchen und sein Bruder | 语法性优先于自然性 |
| Ich sehe der Mann. | Ich sehe den Mann. | 第四格阳性用 den |
| die Universitäten Bibliothek | die Universitätsbibliothek | 复合词连写并加中缀 |
"""

EXPANSIONS['名词/阳性弱变化'] = """
## 例句

**Der Student hat den Kurs abgeschlossen.**
这个大学生修完了课程。（第一格）

**Ich habe den Studenten gestern getroffen.**
我昨天遇到了那个大学生。（第四格加 -en）

**Sie hat dem Kollegen geholfen.**
她帮了那位同事。（第三格加 -n）

**Das ist die Meinung des Präsidenten.**
这是总统的意见。（第二格加 -en）

**Der Name des Zeugen darf nicht genannt werden.**
证人的名字不得公开。

**Wir haben den Nachbarn um Hilfe gebeten.**
我们请邻居帮忙了。

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich sehe den Student. | Ich sehe den Studenten. | 第一格以外都加 -(e)n |
| des Names | des Namens | Name 属混合变化，第二格加 -ns |
| Ich helfe dem Kollege. | Ich helfe dem Kollegen. | 第三格加 -n |
| der Käsen | der Käse | Käse 不属阳性弱变化 |
"""

EXPANSIONS['名词/名词词尾'] = """
## 例句

**Die Gesundheit ist wichtiger als der Erfolg.**
健康比成功更重要。（-heit 阴性）

**Die Möglichkeit besteht, aber sie ist gering.**
可能性是有的，但很小。（-keit 阴性）

**Die Regierung hat eine neue Verordnung erlassen.**
政府颁布了一项新条例。（-ung 阴性）

**Das Mädchen und das Häuschen sind beide Neutrum.**
Mädchen 和 Häuschen 都是中性。（-chen 中性）

**Der Motor des Fahrzeugs macht seltsame Geräusche.**
车的发动机发出奇怪的声响。（-or 阳性）

**Die Universität liegt am Rand der Innenstadt.**
大学在市中心边缘。（-tät 阴性）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| der Meinung（作主语） | die Meinung | -ung 阴性 |
| die Mädchen（单数） | das Mädchen | -chen 中性 |
| das Universität | die Universität | -tät 阴性 |
| die Motor | der Motor | -or 阳性 |
"""

EXPANSIONS['名词/名词复合中缀'] = """
## 例句

**Der Bundestag hat das Gesetz mit großer Mehrheit verabschiedet.**
联邦议院以多数票通过了该法律。（Bundes- 带 Fugen-s）

**Am Bahnhofsplatz wird seit Monaten gebaut.**
火车站广场已经施工好几个月了。

**Die Arbeitszeit wurde auf 35 Stunden verkürzt.**
工时被缩短到三十五小时。

**Er sammelt alte Wörterbücher aus dem 19. Jahrhundert.**
他收集十九世纪的旧词典。（复数式中缀 -er）

**Das Sonnenlicht fiel durch das Fenster.**
阳光透过窗户照进来。（-en 中缀）

**Die Hilfeleistung kam zu spät.**
救助来得太晚了。（Hilfe 后不加 s）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Bundtag | Bundestag | 需要 Fugen-s |
| Arbeitzeit | Arbeitszeit | Arbeit 后加 s |
| Wortbücher | Wörterbücher | 用复数式中缀 |
| hilfslos | hilflos | 该词不加中缀 |
"""

EXPANSIONS['代词/代词'] = """
## 例句

**Kannst du mir bitte das Buch geben? Ich brauche es dringend.**
你能把书给我吗？我急着要用。

**Sie hat sich sehr über dein Geschenk gefreut.**
她非常喜欢你的礼物。（反身代词）

**Dieser Vorschlag gefällt mir besser als jener.**
这个建议比那个更合我意。（指示代词）

**Jemand hat angerufen, aber niemand hat sich gemeldet.**
有人打过电话，可是没人说话。（不定代词）

**Der Kollege, dessen Büro neben meinem liegt, ist krank.**
办公室在我隔壁的那位同事病了。（关系代词第二格）

**Es regnet seit heute Morgen ununterbrochen.**
从今早起就一直下雨。（虚位 es）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Er gibt mir es. | Er gibt es mir. | 两个代词第四格在前 |
| Ich freue mir. | Ich freue mich. | freuen 用第四格反身 |
| Ich warte auf es. | Ich warte darauf. | 指物用 da- 复合词 |
| Das ist meiner Buch. | Das ist mein Buch. | 中性第一格无词尾 |
"""

EXPANSIONS['动词/动词'] = """
## 例句

**Ich muss heute leider länger arbeiten.**
今天我可惜得加班。（情态动词 + 不定式）

**Wir sind gestern erst um Mitternacht angekommen.**
我们昨天午夜才到。（sein 作助动词）

**Sie hat den Vertrag bereits unterschrieben.**
她已经签了合同。（haben 作助动词）

**Das Fenster wurde vom Sturm zerstört.**
窗户被暴风摧毁了。（werden 构成被动）

**Er wird nächstes Jahr in Berlin studieren.**
他明年将在柏林上大学。（werden 构成将来时）

**Steh bitte auf, der Zug fährt gleich ab.**
请起来，火车马上开了。（可分动词）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe gegangen. | Ich bin gegangen. | 位移动词用 sein |
| Ich will zu gehen. | Ich will gehen. | 情态动词后不带 zu |
| Der Zug abfährt. | Der Zug fährt ab. | 可分前缀放句末 |
| Ich werde gegangen. | Ich werde gehen. | 将来时用不定式 |
"""

EXPANSIONS['动词/动词前缀'] = """
## 例句

**Kannst du bitte meine Frage beantworten?**
你能回答我的问题吗？（be- 使其及物）

**Ich kann dir dieses Restaurant sehr empfehlen.**
我非常推荐你这家餐厅。（emp- 不可分）

**Wer hat Amerika eigentlich entdeckt?**
到底是谁发现了美洲？（ent- 表相反）

**Er hat leider den falschen Zug genommen und ist umgestiegen.**
他可惜坐错了车，中途换乘了。（um- 可分）

**Bitte wiederholen Sie den letzten Satz.**
请重复最后一句。（wieder- 此处不可分）

**Der Vertrag wurde gestern übersetzt.**
合同昨天被翻译了。（über- 不可分，无 ge-）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe die Frage gebeantwortet. | ... beantwortet. | 不可分前缀不加 ge- |
| Ich habe ihn angerufen zu. | Ich habe ihn angerufen. | 可分前缀与 ge- 合并 |
| Er hat übergesetzt.（翻译义） | Er hat übersetzt. | 重音决定可分与否 |
| Ich rufe an dich. | Ich rufe dich an. | 前缀在句末 |
"""

EXPANSIONS['介词/介词支配格'] = """
## 例句

**Ich fahre mit dem Rad durch den Park zur Arbeit.**
我骑车穿过公园去上班。（mit + D, durch + A, zu + D）

**Das Geschenk ist für meine Schwester.**
这个礼物是给我妹妹的。（für + A）

**Seit dem Umzug wohnen wir außerhalb der Stadt.**
搬家以后我们住在城外。（seit + D, außerhalb + G）

**Stell die Vase bitte auf den Tisch.**
请把花瓶放到桌上。（方向，第四格）

**Die Vase steht schon auf dem Tisch.**
花瓶已经在桌上了。（位置，第三格）

**Trotz des Regens sind wir spazieren gegangen.**
尽管下雨，我们还是去散步了。（trotz + G）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| mit mein Freund | mit meinem Freund | mit 加第三格 |
| für mir | für mich | für 加第四格 |
| Ich gehe in der Schule.（有位移） | in die Schule | 方向用第四格 |
| wegen dem Wetter（书面） | wegen des Wetters | wegen 加第二格 |
"""

EXPANSIONS['介词/介词辨析'] = """
## 例句

**Ab morgen gelten die neuen Preise.**
新价格从明天起生效。（ab：起点）

**Seit drei Jahren lerne ich Deutsch.**
我学德语三年了。（seit：延续到现在）

**Vor drei Jahren habe ich angefangen.**
我三年前开始的。（vor：过去的时点）

**Er hat die Prüfung nach nur zwei Monaten bestanden.**
他仅两个月后就通过了考试。（nach：之后）

**Bis zum Wochenende muss der Bericht fertig sein.**
报告必须在周末前完成。（bis zu：直到）

**Aus Angst vor Fehlern hat er gar nichts gesagt.**
出于对犯错的恐惧，他什么都没说。（aus：动机；vor：对象）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Seit morgen | Ab morgen | seit 只指向过去 |
| Ich lerne Deutsch vor drei Jahren.（仍在学） | seit drei Jahren | 延续用 seit |
| bis dem Wochenende | bis zum Wochenende | 带冠词用 bis zu |
| Ich habe Angst von Hunden. | Angst vor Hunden | 固定介词 vor |
"""

EXPANSIONS['句法/句法'] = """
## 例句

**Morgen fahren wir mit dem Auto nach München.**
明天我们开车去慕尼黑。（时间前置，动词第二位）

**Hast du den Bericht schon gelesen?**
你读过报告了吗？（是非疑问，动词第一位）

**Ich weiß nicht, ob er heute noch kommt.**
我不知道他今天还来不来。（从句动词末位）

**Weil es stark regnete, blieben wir zu Hause.**
因为雨很大，我们待在家里。（从句占前场，主句倒装）

**Der Vertrag muss bis Freitag unterschrieben werden.**
合同必须在周五前签署。（句框：muss ... werden）

**Er hat mir das Buch gestern in der Bibliothek gegeben.**
他昨天在图书馆把书给了我。（中场 TeKaMoLo）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Morgen wir fahren nach München. | Morgen fahren wir ... | 动词第二位 |
| ..., weil ich habe keine Zeit. | ..., weil ich keine Zeit habe. | 从句动词末位 |
| Ich fahre nach Berlin morgen. | Ich fahre morgen nach Berlin. | 时间在地点前 |
| Deshalb ich bleibe hier. | Deshalb bleibe ich hier. | 副词性连词占前场 |
"""

EXPANSIONS['动词/不规则动词'] = """
## 例句

**Ich nahm den frühen Zug und kam pünktlich an.**
我坐了早班车，准时到达。（nehmen → nahm；kommen → kam）

**Sie hat mir gestern ein Buch gegeben.**
她昨天给了我一本书。（geben → gegeben）

**Wir sind den ganzen Tag durch die Stadt gelaufen.**
我们在城里走了一整天。（laufen → gelaufen，用 sein）

**Er hat das Fenster geschlossen, weil es zog.**
他关上了窗，因为有穿堂风。（schließen → geschlossen）

**Was hast du dazu gedacht?**
你对此怎么想的？（denken → gedacht，混合变化）

**Der Kuchen ist im Ofen verbrannt.**
蛋糕在烤箱里烤糊了。（brennen → verbrannt）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| Ich habe genehmt. | Ich habe genommen. | 强变化第二分词 |
| Er hat gelaufen. | Er ist gelaufen. | 位移动词用 sein |
| Ich denkte. | Ich dachte. | 混合变化改元音 |
| Sie hat gegeben mir das Buch. | Sie hat mir das Buch gegeben. | 分词在句末 |
"""

EXPANSIONS['其他/发音'] = """
## 例句

**Der Bäcker verkauft frische Brötchen.**
面包师卖新鲜的小面包。（ä 读作 /ɛ/）

**Im Frühling blühen die Bäume.**
春天树木开花。（ü 读作 /yː/）

**Die Straße ist wegen Bauarbeiten gesperrt.**
这条街因施工封闭。（ß 读作清 /s/）

**Ich möchte gern einen Tee mit Zitrone.**
我想要一杯柠檬茶。（ö 读作 /øː/；z 读作 /ts/）

**Das Mädchen spricht sehr deutlich.**
这个女孩说话很清楚。（-chen 中的 ch 读作 /ç/）

**Der Vogel sitzt auf dem Dach.**
鸟停在屋顶上。（v 读作 /f/；a 后的 ch 读作 /x/）

## 常见错误

| 错误 | 正确 | 说明 |
| :--- | :--- | :--- |
| 把 z 读成英语 /z/ | /ts/ | Zeit 读 /tsaɪt/ |
| 把 v 读成 /v/ | /f/ | Vater 读 /ˈfaːtɐ/ |
| 把 ch 一律读成 /k/ | /ç/ 或 /x/ | ich /ɪç/，Buch /buːx/ |
| 词尾浊辅音读成浊音 | 清化 | Tag 读 /taːk/ |
"""

EXPANSIONS['其他/其他'] = """
## 课堂与日常高频表达

**Können Sie das bitte wiederholen?**
您能再说一遍吗？

**Wie schreibt man das?**
这个怎么写？

**Was bedeutet dieses Wort auf Chinesisch?**
这个词中文是什么意思？

**Entschuldigung, ich habe das nicht verstanden.**
不好意思，我没听懂。

**Könnten Sie bitte etwas langsamer sprechen?**
您能说慢一点吗？

**Ich hätte da noch eine Frage.**
我还有一个问题。

## 学习建议

| 阶段 | 重点 | 建议 |
| :--- | :--- | :--- |
| A1–A2 | 冠词、格、语序 | 名词一律连冠词和复数一起背 |
| B1 | 从句、被动、虚拟式二式 | 每天造五个从句 |
| B2 | 支配介词的动词、连词体系 | 建立自己的搭配表 |
| C1 | 名词化、功能动词结构、扩展定语 | 读报刊社论并改写 |
"""

# @@CONTENT@@

# ---------------------------------------------------------------------------
# 4. Tree
# ---------------------------------------------------------------------------
# TREE = [ (part title, part slug, [ (chapter title, chapter slug,
#            [ (topic title, topic slug, CEFR level), ... ]) ]) ]
TREE = []
TREE = [
    ('导言', 'intro', [
        ('使用说明', 'intro/guide', [
            ('前言与使用指南', 'intro/前言', 'A1'),
        ]),
    ]),
    ('第一部分　词法（Morphologie）', 'part1_morphologie', [
        ('第一章　名词', 'ch01_substantiv', [
            ('名词总论：性、数、格', '名词/名词', 'A1'),
            ('名词的复数', '名词/名词的复数', 'A1'),
            ('阳性弱变化名词（n-Deklination）', '名词/阳性弱变化', 'B1'),
            ('名词词尾与性别判断', '名词/名词词尾', 'A2'),
            ('复合名词与构词法', '名词/复合名词与构词法', 'B1'),
            ('名词复合中缀（Fugenelement）', '名词/名词复合中缀', 'B2'),
        ]),
        ('第二章　格', 'ch02_kasus', [
            ('四个格总览', '格/四个格总览', 'A1'),
            ('第一格（Nominativ）', '格/第一格', 'A1'),
            ('第四格（Akkusativ）', '格/第四格', 'A1'),
            ('第三格（Dativ）', '格/第三格', 'A2'),
            ('第二格（Genitiv）', '格/第二格', 'B1'),
            ('支配第三格的动词', '格/支配第三格的动词', 'A2'),
            ('双宾语的顺序', '格/双宾语顺序', 'B1'),
            ('支配第二格的动词与形容词', '格/支配第二格的词', 'C1'),
        ]),
        ('第三章　冠词与限定词', 'ch03_artikel', [
            ('冠词总论', '冠词/冠词', 'A1'),
            ('定冠词的用法', '冠词/定冠词用法', 'A1'),
            ('不定冠词与零冠词', '冠词/不定冠词与零冠词', 'A1'),
            ('否定冠词 kein', '冠词/否定冠词kein', 'A1'),
            ('der 类限定词（dieser, jeder, welcher）', '冠词/der类限定词', 'A2'),
            ('物主冠词', '冠词/物主冠词', 'A1'),
        ]),
        ('第四章　形容词', 'ch04_adjektiv', [
            ('形容词总论', '形容词/形容词', 'A1'),
            ('形容词变格总览', '形容词/形容词变格', 'A2'),
            ('弱变化（定冠词后）', '形容词/弱变化', 'A2'),
            ('强变化（无冠词）', '形容词/强变化', 'B1'),
            ('混合变化（不定冠词后）', '形容词/混合变化', 'A2'),
            ('比较级与最高级', '形容词/比较级与最高级', 'A2'),
            ('形容词的支配关系', '形容词/支配关系', 'B2'),
            ('扩展的分词定语', '形容词/扩展定语', 'C1'),
        ]),
        ('第五章　代词', 'ch05_pronomen', [
            ('代词总论', '代词/代词', 'A1'),
            ('人称代词', '代词/人称代词', 'A1'),
            ('反身代词', '代词/反身代词', 'A2'),
            ('指示代词', '代词/指示代词', 'B1'),
            ('不定代词', '代词/不定代词', 'A2'),
            ('关系代词', '代词/关系代词', 'B1'),
            ('es 的用法', '代词/es的用法', 'B1'),
        ]),
        ('第六章　数词', 'ch06_numerale', [
            ('数词总论', '数词/数词', 'A1'),
            ('基数词与序数词', '数词/基数与序数', 'A1'),
            ('日期、钟点与量的表达', '数词/日期与钟点', 'A1'),
        ]),
        ('第七章　动词：形态与时态', 'ch07_verb_tempus', [
            ('动词总论', '动词/动词', 'A1'),
            ('动词变位', '动词/变位', 'A1'),
            ('现在时（Präsens）', '动词/现在时', 'A1'),
            ('过去时（Präteritum）', '动词/过去时', 'A2'),
            ('现在完成时（Perfekt）', '动词/现在完成时', 'A1'),
            ('过去完成时（Plusquamperfekt）', '动词/过去完成时', 'B1'),
            ('将来时（Futur I / II）', '动词/将来时', 'B1'),
            ('不规则动词表', '动词/不规则动词', 'A2'),
            ('可分动词与不可分动词', '动词/可分与不可分动词', 'A2'),
            ('动词前缀详解', '动词/动词前缀', 'B2'),
            ('动词的用法模式', '动词/用法模式', 'B1'),
        ]),
        ('第八章　动词：语态与式', 'ch08_verb_genus', [
            ('行动方式与语态总论', '动词/行动方式', 'B1'),
            ('过程被动（Vorgangspassiv）', '动词/过程被动', 'B1'),
            ('状态被动与被动替代式', '动词/状态被动', 'B2'),
            ('叙述方式总论（Modus）', '动词/叙述方式', 'B1'),
            ('命令式（Imperativ）', '动词/命令式', 'A1'),
            ('虚拟式二式：构成', '动词/虚拟式二式构成', 'B1'),
            ('虚拟式二式：用法', '动词/虚拟式二式用法', 'B1'),
            ('虚拟式一式与间接引语', '动词/虚拟式一式', 'B2'),
            ('情态动词', '动词/情态动词', 'A2'),
            ('情态动词的主观用法', '动词/情态动词主观用法', 'B2'),
            ('反身动词', '动词/反身动词', 'A2'),
        ]),
        ('第九章　动词：非限定形式与句型', 'ch09_verb_infinit', [
            ('不定式总论', '动词/不定式', 'B1'),
            ('带 zu 的不定式', '动词/带zu不定式', 'B1'),
            ('不带 zu 的不定式与 AcI', '动词/不带zu不定式', 'B2'),
            ('分词（Partizip I / II）', '动词/分词', 'B1'),
            ('支配介词的动词', '动词/支配介词的动词', 'B1'),
            ('da- 与 wo- 复合词', '动词/da与wo复合词', 'B1'),
            ('功能动词结构', '动词/功能动词结构', 'C1'),
        ]),
        ('第十章　副词', 'ch10_adverb', [
            ('副词总论', '副词/副词', 'A1'),
            ('副词的种类', '副词/副词的种类', 'A2'),
            ('副词的比较级与特殊形式', '副词/副词的比较级', 'B1'),
        ]),
        ('第十一章　介词', 'ch11_praeposition', [
            ('介词总论', '介词/介词', 'A1'),
            ('介词与格的对应', '介词/介词支配格', 'A2'),
            ('支配第四格的介词', '介词/支配第四格', 'A2'),
            ('支配第三格的介词', '介词/支配第三格', 'A2'),
            ('方位介词（Wechselpräpositionen）', '介词/方位介词', 'A2'),
            ('支配第二格的介词', '介词/支配第二格', 'B2'),
            ('介词与冠词的融合', '介词/融合形式', 'A2'),
            ('易混介词辨析', '介词/介词辨析', 'B1'),
        ]),
    ]),
    ('第二部分　句法（Syntax）', 'part2_syntax', [
        ('第十二章　句子结构', 'ch12_satzbau', [
            ('句法总论', '句法/句法', 'A2'),
            ('句子成分', '句法/句子成分', 'A2'),
            ('动词位置与句框', '句法/动词位置与句框', 'A1'),
            ('中场语序 TeKaMoLo', '句法/中场语序', 'B1'),
            ('前场与话题化', '句法/前场', 'B1'),
            ('否定', '句法/否定', 'A2'),
            ('疑问句', '句法/疑问句', 'A1'),
        ]),
        ('第十三章　连词与句子连接', 'ch13_konnektoren', [
            ('连词总论', '连词/连词', 'A2'),
            ('并列连词', '连词/并列连词', 'A1'),
            ('副词性连词', '连词/副词性连词', 'B1'),
            ('双部连词', '连词/双部连词', 'B1'),
        ]),
        ('第十四章　从句', 'ch14_nebensatz', [
            ('从句总览', '从句/从句总览', 'B1'),
            ('dass 从句与主语从句', '从句/dass从句', 'A2'),
            ('原因从句与让步从句', '从句/原因与让步', 'B1'),
            ('时间从句', '从句/时间从句', 'B1'),
            ('目的从句与结果从句', '从句/目的与结果', 'B1'),
            ('条件从句', '从句/条件从句', 'B1'),
            ('方式从句与比较从句', '从句/方式与比较', 'B2'),
            ('间接疑问句', '从句/间接疑问句', 'B1'),
        ]),
        ('第十五章　关系从句', 'ch15_relativsatz', [
            ('关系从句：基础', '从句/关系从句基础', 'B1'),
            ('关系从句：进阶', '从句/关系从句进阶', 'B2'),
            ('自由关系从句', '从句/自由关系从句', 'B2'),
        ]),
        ('第十六章　语气词', 'ch16_modalpartikeln', [
            ('语气词总论', '小品词/总论', 'B1'),
            ('doch', '小品词/doch', 'B1'),
            ('mal', '小品词/mal', 'A2'),
            ('ja', '小品词/ja', 'B1'),
            ('denn', '小品词/denn', 'A2'),
            ('eben 与 halt', '小品词/eben与halt', 'B2'),
            ('wohl, schon, etwa, bloß, ruhig', '小品词/wohl与其他', 'B2'),
        ]),
    ]),
    ('附录', 'appendix', [
        ('第十七章　附录', 'ch17_anhang', [
            ('发音与正字法', '其他/发音', 'A1'),
            ('其他补充', '其他/其他', 'B1'),
        ]),
    ]),
]


# ---------------------------------------------------------------------------
# 5. Assemble
# ---------------------------------------------------------------------------
def main():
    content, copied = import_legacy()
    print('imported %d legacy topics, %d images written to %s'
          % (len(content), len(copied), IMG_WEB_DIR))

    for slug, pairs in PATCHES.items():
        if slug not in content:
            raise SystemExit('ERROR: patch target %r not imported' % slug)
        for find, replace in pairs:
            if find not in content[slug]:
                raise SystemExit('ERROR: patch anchor not found in %r: %r'
                                 % (slug, find[:60]))
            content[slug] = content[slug].replace(find, replace, 1)

    for slug, extra in EXPANSIONS.items():
        if slug not in content:
            raise SystemExit('ERROR: expansion target %r not imported' % slug)
        content[slug] = content[slug].rstrip() + '\n\n' + extra.strip() + '\n'

    for slug, body in AUTHORED.items():
        if slug in content:
            raise SystemExit('ERROR: authored slug %r collides with legacy' % slug)
        content[slug] = body.strip() + '\n'

    parts = []
    seen = set()
    for part_title, part_slug, chapters in TREE:
        ch_out = []
        for ch_title, ch_slug, topics in chapters:
            t_out = []
            for t_title, t_slug, level in topics:
                if t_slug not in content:
                    raise SystemExit('ERROR: tree slug has no content: %r' % t_slug)
                if t_slug in seen:
                    raise SystemExit('ERROR: duplicate tree slug: %r' % t_slug)
                seen.add(t_slug)
                t_out.append({'title': t_title, 'slug': t_slug, 'level': level})
            ch_out.append({'title': ch_title, 'slug': ch_slug, 'topics': t_out})
        parts.append({'title': part_title, 'slug': part_slug, 'chapters': ch_out})

    orphans = sorted(set(content) - seen)
    if orphans:
        raise SystemExit('ERROR: orphan content keys: %s' % orphans)

    data = {'tree': {'parts': parts}, 'content': content}
    js = ('const GERMAN_GRAMMAR_DATA = '
          + json.dumps(data, ensure_ascii=False, indent=2)
          + ';\n\nif (typeof module !== \'undefined\' && module.exports) {\n'
            '  module.exports = GERMAN_GRAMMAR_DATA;\n}\n')
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js)

    total = sum(len(v) for v in content.values())
    print('parts=%d chapters=%d topics=%d chars=%d mean=%d'
          % (len(parts), sum(len(p['chapters']) for p in parts), len(seen),
             total, total // max(len(seen), 1)))
    print('wrote %s (%.1f KB)' % (OUT_FILE, os.path.getsize(OUT_FILE) / 1024.0))


if __name__ == '__main__':
    if not os.path.isdir(DOCS_DIR):
        sys.exit('ERROR: %s not found' % DOCS_DIR)
    os.makedirs(IMG_OUT_DIR, exist_ok=True)
    for f in os.listdir(IMG_OUT_DIR):
        if f != '.gitkeep':
            os.remove(os.path.join(IMG_OUT_DIR, f))
    main()
