#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build data/de-grammar.js (GERMAN_GRAMMAR_DATA).

!!! RETIRED AS THE SOURCE OF TRUTH (2026-10) !!!
The Docusaurus corpus this script reads (deutsch-data/grammar/docs) was
deleted on 2026-09-30, so a rebuild is impossible without a private copy and
would silently throw away every edit made to the data file since.  The
shipped data/de-grammar.js is now the source of truth: edit it in
place and normalise it with

    python3 scripts/canonicalize_grammar.py de

This script is kept for provenance (the authored topic text below is the
origin of most of the book) and refuses to run unless DOCS_DIR exists and
--force is passed.  Its output goes through scripts/grammar_schema.py, so it
emits grammar/1 (positional p<N>/ch<NN>/t<NN> slugs, the Chinese authoring
slugs below kept in meta.aliases).

Two content sources are merged:

1. The legacy Docusaurus corpus under deutsch-data/grammar/docs/ (27 topics).
   It carries no licence, so it was removed from the repo on 2026-09-30; the
   shipped data/de-grammar.js keeps the converted text, and a rebuild
   needs a local copy of that corpus at the same path.
   Those files reference 71 images with Windows-style relative paths
   (``![](.\\img\\X.png)``) that do not resolve from the site root, so every
   image 404s in the app.  Instead of re-pointing the references at PNG
   screenshots (which are un-searchable, not theme-aware and carry third-party
   copyright), every image reference is replaced at build time by an authored
   Markdown table / prose block that carries the same information.  The build
   fails if any ``![...](...)`` reference survives.

2. Authored topics (this file) that close the coverage gap against the Italian
   grammar book: cases, the full declension system, word order, subordinate
   clauses, relative clauses, Passiv, Konjunktiv I/II, participles, modal
   particles, negation, ...

Output shape: grammar/1 (docs/data-schema.md).

Run:  python3 scripts/build_german_grammar.py --force   (needs DOCS_DIR)
Check: node scripts/validate_german_grammar.js
"""

import json
import os
import re
import sys
import grammar_schema

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DOCS_DIR = os.path.join(ROOT, 'deutsch-data', 'grammar', 'docs')
OUT_FILE = os.path.join(ROOT, 'data', 'de-grammar.js')

GLOBAL_NAME = 'GERMAN_GRAMMAR_DATA'

# Slug -> source markdown path, for the 27 legacy topics we keep.
LEGACY_SOURCES = {
    'intro/前言': '前言.md',
    '名词/名词': '名词/名词.md',
    '名词/阳性弱变化': '名词/阳性弱变化.md',
    '名词/名词复合中缀': '名词/名词复合中缀.md',
    '名词/名词词尾': '名词/名词词尾.md',
    '冠词/冠词': '冠词/冠词.md',
    '形容词/形容词': '形容词/形容词.md',
    '形容词/形容词变格': '形容词/形容词变格.md',
    '数词/数词': '数词/数词.md',
    '代词/代词': '代词/代词.md',
    '动词/动词': '动词/动词.md',
    '动词/变位': '动词/变位.md',
    '动词/行动方式': '动词/行动方式.md',
    '动词/叙述方式': '动词/叙述方式.md',
    '动词/不定式': '动词/不定式.md',
    '动词/分词': '动词/分词.md',
    '动词/动词前缀': '动词/动词前缀.md',
    '动词/不规则动词': '动词/不规则动词.md',
    '动词/用法模式': '动词/用法模式.md',
    '副词/副词': '副词/副词.md',
    '介词/介词': '介词/介词.md',
    '介词/介词支配格': '介词/介词支配格.md',
    '介词/介词辨析': '介词/介词辨析.md',
    '连词/连词': '连词/连词.md',
    '句法/句法': '句法/句法.md',
    '其他/其他': '其他/其他.md',
    '其他/发音': '其他/发音.md',
}

IMG_RE = re.compile(r'!\[[^\]]*\]\(([^)]*)\)')


def read(path):
    with open(path, 'r', encoding='utf-8') as fh:
        return fh.read()


def strip_frontmatter(text):
    if text.startswith('---'):
        end = text.find('---', 3)
        if end != -1:
            return text[end + 3:].lstrip('\n')
    return text


def img_key(ref):
    """Normalise `.\\img\\X.png` / `./img/X.png` to the bare basename."""
    return ref.replace('\\', '/').rsplit('/', 1)[-1]


# ---------------------------------------------------------------------------
# 1. Image replacements.  Key = image basename, value = markdown that conveys
#    what the screenshot showed.  Sourced from the surrounding prose of the
#    original chapter plus standard reference grammar (Duden, Helbig/Buscha).
# ---------------------------------------------------------------------------

IMAGE_REPLACEMENTS = {}

# --- 名词 ------------------------------------------------------------------

IMAGE_REPLACEMENTS['名词构词-1.png'] = """
**德语自源词后缀的构词能力（按性统计）**

| 后缀 | 性 | 数量级 | 例词 |
| --- | --- | --- | --- |
| -ung | die | 最大（1300+） | die Wohnung, die Endung, die Hoffnung |
| -heit / -keit | die | 大（800+） | die Gesundheit, die Einsamkeit |
| -schaft | die | 中 | die Freundschaft, die Wissenschaft |
| -er | der | 大 | der Arbeiter, der Fernseher |
| -ling | der | 小 | der Schmetterling, der Lehrling |
| -chen / -lein | das | 中 | das Mädchen, das Vöglein |
| Ge-…(-e) | das | 中 | das Gebäude, das Getränk |

结论：自源词后缀中，阴性后缀（-ung, -heit, -keit, -schaft）的构词能力最强，
这也是词典里 die 词条最多（9421 个）的主要原因。
""".strip()

IMAGE_REPLACEMENTS['名词构词-2.png'] = """
**外来词后缀的构词能力（按性统计）**

| 后缀 | 性 | 例词 |
| --- | --- | --- |
| -ion / -tion | die | die Produktion, die Information |
| -tät / -ität | die | die Universität, die Aktivität |
| -ur | die | die Natur, die Kultur |
| -ie | die | die Demokratie, die Fotografie |
| -enz / -anz | die | die Konferenz, die Toleranz |
| -ist / -ismus | der | der Optimist, der Idealismus |
| -ent / -ant | der | der Student, der Praktikant |
| -eur / -or | der | der Friseur, der Motor |
| -ment / -um | das | das Dokument, das Publikum |

结论：外来词后缀同样是阴性后缀（-ion, -tät, -ur, -ie）数量最多。
""".strip()

IMAGE_REPLACEMENTS['名词的性-1.png'] = """
**穷举：以 -ag 结尾的名词**

| 性 | 词 |
| --- | --- |
| der（10 个，83–100%） | Airbag, Belag, Gag, Haag, Hag, Jetlag, Sarkophag, Schlag, Tag, -trag（Vertrag, Antrag, Auftrag …） |
| die | 0 个 |
| das（2 个，航海／罕用） | Stag（支索）等 |

所以对初学者可以直接说：**-ag 结尾几乎 100% 是 der**。
""".strip()

IMAGE_REPLACEMENTS['名词的性-4.png'] = """
**穷举：以 -ur 结尾的名词**

| 性 | 数量 | 词 |
| --- | --- | --- |
| die | 90 多个 | die Natur, die Kultur, die Frisur, die Diktatur, die Rasur, die Rezeptur, die Figur, die Tastatur … |
| der | 少数 | der Flur（走廊）、der Schwur（誓言，来自 schwören）、der Merkur（水星／墨丘利，行星名皆阳性） |
| das | 少数 | das Abitur（缩写自 Abiturium，-ium 是中性词尾）、das Futur（拉丁语时态名称随 das Tempus 为中性）、das Dur（大调） |

即：**-ur 结尾基本上是 die**，例外都能用词源解释。
""".strip()

IMAGE_REPLACEMENTS['名词的性-2.png'] = """
**穷举：以 -acht 结尾的名词**

| 性 | 词 |
| --- | --- |
| die（绝大多数） | die Acht, die Andacht, die Fracht, die Jacht, die Macht, die Nacht, die Pacht, die Pracht, die Schlacht, die Tracht, die Wacht |
| der（仅 4 个，均来自动词词干） | der Bedacht, der Verdacht, der Betracht, der Schacht |

结论：**末尾三个字母是 -acht 的，是阴性的概率极高**；四个例外在初级阶段基本不会遇到。
""".strip()

IMAGE_REPLACEMENTS['名词的性-3.png'] = """
**统计：以 -e 结尾的名词（含外来词）**

| 性 | 数量 | 说明 |
| --- | --- | --- |
| die | 约 88% | die Tasche, die Lampe, die Blume, die Sprache … |
| der | 261 个 | 几乎全是形容词变化（der Beamte）或阳性弱变化（der Junge, der Kunde）；纯例外只有 der Käse |
| das | 99 个 | Ge-…-e 集合名词（das Gebäude, das Gebirge）、名词化中性词；初学只需注意 das Auge, das Ende, das Interesse |

即：**-e 结尾优先猜 die**，但要把「阳性弱变化」这一大类单独立出来记。
""".strip()

IMAGE_REPLACEMENTS['名词的性-5.png'] = """
**穷举：-ass 结尾**

| 性 | 词 |
| --- | --- |
| der（绝大多数） | der Bass, der Pass, der Kompass, der Erlass, der Nachlass, der Ablass |
| das（只有 2 个） | das Fass（来自 fassen，但复数为 Fässer）、das Nass（直接由形容词 nass 变来，形容词名词化为中性） |
| die | 无 |
""".strip()

IMAGE_REPLACEMENTS['名词的性-6.png'] = """
**穷举：-ess 结尾**

| 性 | 词 |
| --- | --- |
| der（绝大多数） | der Prozess, der Kongress, der Express, der Exzess, der Stress |
| die（5 个，规律很强） | die Fitness, die Wellness（英语 -ness 原则上是阴性）、die Hostess, die Stewardess, die Baroness（加阴性词尾表示女性） |
| das（只有 1 个） | das Business（对标的德语词是 das Geschäft） |
""".strip()

IMAGE_REPLACEMENTS['名词的性-7.png'] = """
**穷举：-iss 结尾**

| 性 | 词 |
| --- | --- |
| der（绝大多数） | der Riss, der Biss, der Kompromiss, der Verriss, der Imbiss |
| das（1 个） | das Gebiss（带典型中性前缀 Ge-） |
| die（1 个） | die Miss（指女性，用 die 很正常） |
""".strip()

IMAGE_REPLACEMENTS['名词的性-8.png'] = """
**穷举：-oss 结尾**

| 性 | 词 |
| --- | --- |
| der（几乎全部） | der Koloss, der Verdross（罕）、der Schoss 等 |
| das（3 个） | das Geschoss（Ge- 前缀）、das Ross（＝das Pferd）、das Schloss（-oss 中唯一复数为 ⸚er 的词） |

附带规律：**复数为 ⸚er / -er 的名词大概率是中性**。
""".strip()

IMAGE_REPLACEMENTS['名词的性-9.png'] = """
**穷举：-uss 结尾**

| 性 | 词 |
| --- | --- |
| der（绝大多数） | der Fluss, der Schluss, der Kuss, der Genuss, der Einfluss, der Überfluss, der Verdruss, der Beschluss |
| das（1 个） | das Muss（情态动词名词化，参见 das Soll） |
| die（1 个） | die Nuss（词源来自拉丁语阴性 nux，只能单独记） |

「元音 + ss」的组合只有 -ass, -ess, -iss, -oss, -uss 五种，因此可以下结论：
**-*ss 结尾原则上是 der**，例外都能用别的规律解释。
""".strip()

IMAGE_REPLACEMENTS['名词的性-11.png'] = """
**穷举：-at 结尾**

| 性 | 典型词 | 说明 |
| --- | --- | --- |
| das（最多） | das Zitat, das Referat, das Resultat, das Attentat, das Format, das Plakat, das Quadrat, das Diktat | 表示「事、物、结果」 |
| der | der Soldat, der Kandidat, der Diplomat, der Demokrat, der Automat, der Advokat | 几乎全是**表示人的阳性弱变化**；例外 der Apparat（来自拉丁语阳性 apparatus） |
| die（少） | die Heirat, die Tat, die Saat | -at 是词干的一部分，不是后缀 |
""".strip()

IMAGE_REPLACEMENTS['名词的性-10.png'] = """
**以 -el /əl/ 结尾的名词：性与复数**

| 性 | 复数 | 例词 | 例外 |
| --- | --- | --- | --- |
| die | 加 -n | die Gabel–Gabeln, die Nudel–Nudeln, die Regel–Regeln | — |
| der | 单复数同形（部分变音） | der Löffel–Löffel, der Vogel–Vögel | der Muskel–Muskeln, der Pantoffel–Pantoffeln, der Stachel–Stacheln（这 3 个阳性词却加 -n） |
| das | 单复数同形 | das Mittel–Mittel, das Rätsel–Rätsel | — |

附加规律：**以 -el 结尾的阳性词，若主元音是 a，复数一律变音**：
Apfel–Äpfel, Sattel–Sättel, Schnabel–Schnäbel, Vogel–Vögel, Mangel–Mängel,
Mantel–Mäntel, Nagel–Nägel（唯一例外 die Raspel–Raspeln）。

易混词对（同形不同性、意思不同）：

| 词 | 阳性 | 中性 |
| --- | --- | --- |
| Gehalt | der Gehalt, -e 含量 | das Gehalt, ⸚er 薪水 |
| Band | der Band, ⸚e 卷册 | das Band, ⸚er 带子 |
| See | der See, -n 湖 | die See 海（阴性） |
""".strip()

IMAGE_REPLACEMENTS['名词复数.png'] = """
**德语名词复数的五种词尾**

| 复数词尾 | 可否变音 | 主要适用 | 例词 |
| --- | --- | --- | --- |
| -e | 可变音（少数高频词） | 多数阳性、部分中性、部分单音节阴性 | der Tag–Tage；der Stuhl–Stühle；die Hand–Hände |
| -⸚（零词尾） | 可变音 | -er / -el / -en 结尾的阳性与中性 | der Lehrer–Lehrer；der Vogel–Vögel；das Mittel–Mittel |
| -er | 可变音 | 单音节中性词、少量阳性 | das Kind–Kinder；das Buch–Bücher；der Mann–Männer |
| -(e)n | 不变音 | 绝大多数阴性词、阳性弱变化 | die Frau–Frauen；die Blume–Blumen；der Student–Studenten |
| -s | 不变音 | 外来词、缩写、以元音结尾的词 | das Auto–Autos；der Chef–Chefs；die Oma–Omas |

要点：

* 变音的前提有两条——重读元音必须是 a / o / u / au，而且必须是高频词，所以变音的词其实很少。
* 表示人、以 -in 结尾的词，复数一律加 **-nen**：die Studentin–die Studentinnen（这是发音造成的变体，不是独立规则）。
* 以 -nis 结尾的词复数加 **-se**：das Ergebnis–die Ergebnisse；同理 der Bus–die Busse（否则 s 会读成浊音）。
* 第三格复数（Dativ Plural）除 -s 复数外一律再加 **-n**：mit den Kindern, mit den Büchern。
""".strip()

IMAGE_REPLACEMENTS['名词词尾-en.png'] = """
**常见的阳性 -en 名词（约 120 个中的高频部分）**

| 词 | 意思 | 词 | 意思 |
| --- | --- | --- | --- |
| der Boden | 地面，阁楼 | der Nacken | 后颈 |
| der Bogen | 弓，弧 | der Ofen | 炉子 |
| der Braten | 烤肉 | der Rasen | 草坪 |
| der Brunnen | 井，喷泉 | der Rücken | 背 |
| der Daumen | 拇指 | der Samen | 种子 |
| der Faden | 线 | der Schaden | 损失 |
| der Garten | 花园 | der Schatten | 影子 |
| der Hafen | 港口 | der Schinken | 火腿 |
| der Haken | 钩子 | der Schlitten | 雪橇 |
| der Kragen | 衣领 | der Segen | 祝福 |
| der Kuchen | 蛋糕 | der Wagen | 车 |
| der Laden | 商店 | der Zeigen…（复合词） | — |
| der Magen | 胃 | der Knochen | 骨头 |

规律：**-en 结尾的名词，只要不是动词原形名词化（das Essen）、也不是带小称
后缀 -chen（das Mädchen），就几乎 100% 是阳性**，而且复数与单数同形。
（das Zeichen 受 -chen 影响，das Wappen 属于 Zeichen 一类，das Becken 是外来词。）
""".strip()

IMAGE_REPLACEMENTS['名词复合中缀-1.png'] = """
**德语复合词的中缀（Fugenelement）分布**

| 中缀 | 出现频率 | 例词 |
| --- | --- | --- |
| 零中缀 | 最高 | Haus + Tür → Haustür |
| -s- | 最高（有形中缀中） | Bundestag, Liebeslied, Universitätsbibliothek |
| -(e)n- | 高 | Sonnenstrahl, Straßenbahn, Blumenladen |
| -er- | 中 | Wörterbuch, Kindergarten, Bilderbuch |
| -e- | 低 | Hundehütte, Tagebuch |
| -ens- | 很低 | Herzenswunsch, Namensschild |

中缀多半来自古德语的第二格（des Bundes Tag → Bundestag）或复数词尾
（Wörterbuch）。
""".strip()

IMAGE_REPLACEMENTS['名词复合中缀-2.png'] = """
**一定要加 -s- 的情况**

| 前一个词的结尾 | 例词 |
| --- | --- |
| -ung | Zeitungsartikel, Wohnungssuche, Regierungschef |
| -heit / -keit | Sicherheitsgurt, Gesundheitssystem, Möglichkeitsform |
| -schaft | Wirtschaftskrise, Freundschaftsspiel |
| -tät / -ität | Universitätsbibliothek, Qualitätskontrolle |
| -ion | Informationsblatt, Diskussionsrunde |
| -ling | Lieblingsfarbe, Frühlingsanfang |
| -tum | Eigentumswohnung, Christentumsgeschichte |
| -sal / -sam | Schicksalsschlag |
| 动名词（das Leben, das Essen …） | Lebenslauf, Essenszeit |

`Liebe` 比较特殊：古德语有 das Lieb 与 die Liebe 两个词，所以一律用
**Liebes-**（Liebeslied, Liebesbrief, liebesfähig）。
""".strip()

IMAGE_REPLACEMENTS['名词复合中缀-3.png'] = """
**不加 -s- 的情况**

| 规律 | 例词 |
| --- | --- |
| 大多数阴性名词（阴性第二格本来就不加 -s） | Nachtzug, Handtuch, Nasenspitze |
| 前词以 -er / -el / -en 结尾 | Lehrerzimmer, Löffelstiel, Wagentür |
| 前词以 s / ß / z / sch / tz 结尾 | Glasflasche, Holzhaus, Fleischsalat |
| 形容词 + 名词 | Rotwein, Großstadt, Schnellzug |
| 动词词干 + 名词（动宾结构） | Schreibtisch, Waschmaschine, Bügeleisen |
""".strip()

IMAGE_REPLACEMENTS['名词复合中缀-4.png'] = """
**动宾结构不加中缀：-nahme 系列穷举**

| 词 | 意思 |
| --- | --- |
| die Teilnahme | 参加 |
| die Aufnahme | 接纳；录音；拍摄 |
| die Annahme | 接受；假设 |
| die Abnahme | 减少；验收 |
| die Zunahme | 增加 |
| die Einnahme | 收入；服用 |
| die Ausnahme | 例外 |
| die Übernahme | 接管 |
| die Rücknahme | 收回 |
| die Inbetriebnahme | 投入使用 |

这些词都是「动词 + 宾语」关系（an-nehmen → Annahme），**一律不加中缀 -s-**。
""".strip()

# --- 形容词 ----------------------------------------------------------------

IMAGE_REPLACEMENTS['形容词比较级变音.png'] = """
**单音节形容词的比较级变音穷施表**

| 类别 | 词 |
| --- | --- |
| **一定变音**（约 20 个） | alt–älter, arm–ärmer, hart–härter, kalt–kälter, krank–kränker, lang–länger, scharf–schärfer, schwach–schwächer, schwarz–schwärzer, stark–stärker, warm–wärmer, dumm–dümmer, jung–jünger, klug–klüger, kurz–kürzer, groß–größer, hoch–höher, nah–näher, grob–gröber, oft–öfter |
| **可变可不变**（约 9 个，趋势是不变音） | bang(er), blass(er), fromm(er), gesund(er), glatt(er), karg(er), nass(er), rot(er), schmal(er) |

要点：

* 只有**主元音是 a / o / u 的单音节形容词**才可能变音，而且必须是高频词。
* gesund 是唯一的双音节词，但第一个音节是非重读的 ge-，四舍五入也算单音节。
* **不变音**的高频反例：brav, klar, laut, rasch, sanft, schlank, stolz, voll, wahr, zart。
""".strip()

IMAGE_REPLACEMENTS['三个性四个格.png'] = """
**定冠词「三个性四个格」总表**

| 格（提示问句） | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| 第一格 N.（wie **wer**?） | d**er** Mann | d**ie** Frau | d**as** Kind | d**ie** Leute |
| 第四格 A.（für **wen**?） | d**en** Mann | d**ie** Frau | d**as** Kind | d**ie** Leute |
| 第三格 D.（mit **wem**?） | d**em** Mann | d**er** Frau | d**em** Kind | d**en** Leute**n** |
| 第二格 G.（**wessen**twegen?） | d**es** Mann**es** | d**er** Frau | d**es** Kind**es** | d**er** Leute |

记忆要点：**不要光背冠词，要连着介词结构整句背**——
「wie der Mann / für den Mann / mit dem Mann / wegen des Mannes」，
而不是「der, den, dem, des」。这样才能把格和它的触发词绑在一起。

把 er/sie/es 的人称代词表和这个表放在一起看，两张表的词尾是一致的。
""".strip()

IMAGE_REPLACEMENTS['形容词变格-01.png'] = """
**弱变化**（定冠词 der/die/das/die、dieser、jener、jeder、welcher、alle 之后）

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| N. | der nett**e** Mann | die nett**e** Frau | das nett**e** Kind | die nett**en** Leute |
| A. | den nett**en** Mann | die nett**e** Frau | das nett**e** Kind | die nett**en** Leute |
| D. | dem nett**en** Mann | der nett**en** Frau | dem nett**en** Kind | den nett**en** Leuten |
| G. | des nett**en** Mannes | der nett**en** Frau | des nett**en** Kindes | der nett**en** Leute |

**强变化**（前面没有冠词时）

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| N. | nett**er** Mann | nett**e** Frau | nett**es** Kind | nett**e** Leute |
| A. | nett**en** Mann | nett**e** Frau | nett**es** Kind | nett**e** Leute |
| D. | nett**em** Mann | nett**er** Frau | nett**em** Kind | nett**en** Leuten |
| G. | nett**en** Mannes ⚠ | nett**er** Frau | nett**en** Kindes ⚠ | nett**er** Leute |

**混合变化**（ein/kein/mein 等之后）

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| N. | ein nett**er** Mann | eine nett**e** Frau | ein nett**es** Kind | keine nett**en** Leute |
| A. | einen nett**en** Mann | eine nett**e** Frau | ein nett**es** Kind | keine nett**en** Leute |
| D. | einem nett**en** Mann | einer nett**en** Frau | einem nett**en** Kind | keinen nett**en** Leuten |
| G. | eines nett**en** Mannes | einer nett**en** Frau | eines nett**en** Kindes | keiner nett**en** Leute |

三张表一比就能看出：形容词词尾只有三种来源——
① 加 **-e**；② 加 **-en**；③ 加**定冠词此时该有的词尾**（-er/-e/-es/-em/-en）。
强变化表和定冠词表高度重合，只有上表中标 ⚠ 的「无冠词、阳性/中性、第二格」
两格不一致（那里用 -en，不用 -es）。
""".strip()

IMAGE_REPLACEMENTS['形容词变格-02.png'] = """
**两步判断法（3.0 版）**

```
第一步：冠词有词尾吗？
  ├─ 有  →  第二步：是「第一格单数的模样」吗？
  │           ├─ 是  →  形容词加 -e
  │           └─ 否  →  形容词加 -en
  └─ 没有（或根本没有冠词）→ 加「定冠词此时该有的词尾」
                              （-er / -e / -es / -em / -en）
```

三种结果正好对应上面三张表里的三种颜色：
**-e = 橙色**，**-en = 紫色**，**定冠词词尾 = 蓝色**。

这一版有一个已知的 bug：无冠词的阳性/中性第二格实际要加 -en 而不是 -es
（Anfang letzten Monats、schweren Herzens），需要单独记。下一版修掉了它。
""".strip()

IMAGE_REPLACEMENTS['形容词变格-03.png'] = """
**形容词变化 4.0（©肖深刻的九叔）——两步推理，无例外**

```
                     形容词词尾
        ┌────────────────┴────────────────┐
   冠词有词尾                        冠词无词尾 / 无冠词
   ┌──────┴──────┐                ┌────────┴────────┐
冠词和名词是            其他       无冠词但名词        其他
第一格单数的模样                   有第二格词尾
     │                 │              │                │
    -e               -en            -en        定冠词此时该有的词尾
                                               └→ en / er / e / es / em
```

要点：

* 「无冠词但名词有第二格词尾」其实就是「无冠词的阳性/中性单数第二格」
  （schwer**en** Herz**ens**、Anfang letzt**en** Monat**s**）。
* 最后那个「八爪鱼」表示德语三性四格的词尾一共只有 **-en, -er, -e, -es, -em**
  五种可能，前面圈里的 -e / -en 也包含在其中。
* 这一版把 3.0 的特例吸收进了判断树，因此没有 bug，而且左右对称。
""".strip()

# --- 代词 ------------------------------------------------------------------

IMAGE_REPLACEMENTS['关系代词.png'] = """
**关系代词总表（der 的 16 个变体 + was + wo + wer/was 句型）**

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| N. | der | die | das | die |
| A. | den | die | das | die |
| D. | dem | der | dem | **denen** |
| G. | **dessen** | **deren** | **dessen** | **deren** |

五大类：

1. **der ×16**：性和数由先行词决定，格由关系从句里的成分决定。
   *Das ist der Mann, **der** dort steht.*（他站着 → 第一格）
2. **介词 + 关系代词**：介词决定格，介词必须与关系代词一起提到从句句首。
   *Der Kollege, **mit dem** ich arbeite, ist krank.*
3. **was**：先行词是 alles / nichts / etwas / das / 整个句子 / 中性最高级时用 was。
   *Das ist alles, **was** ich weiß.* / *Er kam zu spät, **was** mich ärgerte.*
4. **wo / wohin / woher**：先行词是地点或时间，可代替「介词 + 关系代词」。
   *die Stadt, **wo** ich geboren bin*（＝ in der）
5. **wer …, der … / was …, das …**：无先行词的泛指关系句。
   *Wer nicht fragt, der bleibt dumm.*

在基础阶段，会用 der×16 加上 was 和 wo，再加第 5 点的两个句型就够用了。
""".strip()

IMAGE_REPLACEMENTS['beide.png'] = """
**人称代词后的 beide**

| 人称代词 | 第一格 | 第四格 | 第三格 |
| --- | --- | --- | --- |
| wir | **wir beide**（不加 -n！） | uns beide | uns **beiden** |
| ihr | **ihr beide**（不加 -n！） | euch beide | euch **beiden** |
| sie / Sie | sie beide | sie beide | ihnen beiden |

需要特别注意的两处（原图中标黑的地方）：

* 第一格的 **wir beide / ihr beide** 用强变化词尾 **-e**，不是 beiden；
* 第三格的 **uns beiden / euch beiden** 必须加 **-n**。

其他情况按普通形容词变格：die beiden Bücher（弱变化）、
beide Bücher（强变化）、meine beiden Brüder（弱变化）。
""".strip()

# --- 动词 ------------------------------------------------------------------

IMAGE_REPLACEMENTS['被动态.png'] = """
**被动态总览**

| 类型 | 结构 | 例句 | 强调 |
| --- | --- | --- | --- |
| 过程被动 Vorgangspassiv | werden + P.II | Das Auto **wird repariert**. 车正在被修。 | 过程、动作 |
| 状态被动 Zustandspassiv | sein + P.II | Das Auto **ist repariert**. 车修好了。 | 结果、状态 |

时态一览（以 reparieren 为例）：

| 时态 | 过程被动 |
| --- | --- |
| 现在时 | Das Auto wird repariert. |
| 过去时 | Das Auto wurde repariert. |
| 现在完成时 | Das Auto ist repariert **worden**. |
| 过去完成时 | Das Auto war repariert worden. |
| 将来时 | Das Auto wird repariert werden. |
| 情态动词 | Das Auto muss repariert werden. |

施动者：**von + D.**（人、机构）／**durch + A.**（媒介、手段）。
*Der Brief wurde **von meiner Mutter** geschrieben.* /
*Die Stadt wurde **durch ein Erdbeben** zerstört.*
""".strip()

IMAGE_REPLACEMENTS['虚拟式.png'] = """
**虚拟式（Konjunktiv）总览**

**共同特点**

| 人称 | 虚拟式词尾（K.I 与 K.II 相同） |
| --- | --- |
| ich | -e |
| du | -est |
| er/sie/es | -e |
| wir | -en |
| ihr | -et |
| sie/Sie | -en |

时态只有两个：**现在／将来**用一层，**过去**用另一层——
K.II 过去用 `hätte / wäre + P.II`，K.I 过去用 `habe / sei + P.II`。

| | 第二虚拟式 K.II | 第一虚拟式 K.I |
| --- | --- | --- |
| 构成基础 | **过去时词干**（+ 变音） | **动词原形词干** |
| 主要用法 | 非现实、假设、客气 | 转述（切割性引用）、固定搭配 |
| 现在/将来 | wäre, hätte, käme / würde + 原形 | sei, habe, komme |
| 过去 | hätte/wäre + P.II | habe/sei + P.II |

**口语里描述过去**：现在完成时为主；过去时只保留 haben→hatte, sein→war,
es gibt→es gab 和情态动词（konnte, musste …）。

**第二虚拟式常用形式**（其余一律用 würden + 原形）

| 原形 | K.II | 原形 | K.II |
| --- | --- | --- | --- |
| haben | hätte | gehen | ginge |
| sein | wäre | kommen | käme |
| es gibt | es gäbe | stehen | stünde |
| können | könnte | lassen | ließe |
| müssen | müsste | wissen | wüsste |
| werden | würde | brauchen | bräuchte |

经典例句：
*Wenn ich ein Vogel wäre, würde ich zu dir fliegen.*
*Wenn es die Sonne nicht gäbe, könnten wir nicht leben.*

**第一虚拟式变位**

| 人称 | machen | fahren | essen | sein | können |
| --- | --- | --- | --- | --- | --- |
| ich | mache | fahre | esse | **sei** | könne |
| du | machest | fahrest | essest | seiest | könnest |
| er/sie/es | **mache** | **fahre** | **esse** | **sei** | **könne** |
| wir | machen | fahren | essen | seien | können |
| ihr | machet | fahret | esset | seiet | könnet |
| sie/Sie | machen | fahren | essen | seien | können |

只有第三人称单数（和 sein 的全部形式）与直陈式不同形，所以实际转述时
第一虚拟式与直陈式同形的人称要改用第二虚拟式。

固定搭配例句：*Gott sei Dank.* / *Es sei denn, …* /
*Edel sei der Mensch, hilfreich und gut.*
""".strip()

IMAGE_REPLACEMENTS['命令式.png'] = """
**命令式（Imperativ）总表**

| 对象 | 构成 | machen | kommen | sprechen | fahren | sein | haben |
| --- | --- | --- | --- | --- | --- | --- | --- |
| du | 词干（去 -st，一般不加 -e） | Mach! | Komm! | **Sprich!** | Fahr! | **Sei!** | Hab! |
| ihr | ＝现在时 ihr 形式 | Macht! | Kommt! | Sprecht! | Fahrt! | **Seid!** | Habt! |
| Sie | 原形 + Sie | Machen Sie! | Kommen Sie! | Sprechen Sie! | Fahren Sie! | **Seien Sie!** | Haben Sie! |
| wir | 原形 + wir | Machen wir! | Gehen wir! | — | — | Seien wir! | — |

**e → i/ie 换字母的动词，命令式 du 形式也换**（总共 21 个，常见的 9 个）：

| 原形 | du 现在时 | 命令式 |
| --- | --- | --- |
| essen | isst | **Iss!** |
| vergessen | vergisst | Vergiss! |
| lesen | liest | Lies! |
| sprechen | sprichst | Sprich! |
| helfen | hilfst | Hilf! |
| geben | gibst | Gib! |
| nehmen | nimmst | **Nimm!** |
| sehen | siehst | Sieh! |
| treffen | triffst | Triff! |

注意：

* **变音（a → ä）的动词命令式不变音**：du fährst → **Fahr!**；du läufst → **Lauf!**
* nehmen 是唯一一个长音变短音的（/eː/ → /ɪ/）；geb- 变 gib- 仍是长音。
* empfehlen 不规则（Empfiehl!），但 fehlen 是规则动词。
* 词干以 -t, -d, -ig, -m/-n（前面是辅音）结尾的加 -e：Arbeit**e**! Rechn**e**! Entschuldig**e**!
""".strip()

# 动词前缀 mind maps ---------------------------------------------------------

IMAGE_REPLACEMENTS['动词前缀be-.png'] = """
**be- 的语义地图**（约 400 个动词，99% 及物加第四格）

| 义项 | 说明 | 例词 |
| --- | --- | --- |
| 使不及物动词变及物 | 原来的介词宾语变成第四格宾语 | antworten auf etw. → etw. beantworten；steigen auf etw. → etw. besteigen |
| 「在……上加东西」 | 名词变动词 | die Waffe → bewaffnen；der Name → benennen |
| 「使成为……」 | 形容词变动词 | frei → befreien；ruhig → beruhigen |
| 加强／完成 | — | kommen → bekommen；suchen → besuchen |

真正的例外只有两个：**jm./etw. begegnen**（加第三格）和 **js./etw. (G) bedürfen**（加第二格）。
be- 的词源对理解没有帮助，不必去查。
""".strip()

IMAGE_REPLACEMENTS['动词前缀er-.png'] = """
**er- 的语义地图**

| 义项 | 例词 |
| --- | --- |
| 形容词 → 动词，「使变得……」 | leicht → erleichtern；weit → erweitern（er- 加比较级只有这两个词） |
| 开始、发生 | erblühen 开花；erklingen 响起；erwachen 醒来 |
| 通过动作达到目的（获得） | erarbeiten 挣得；erkämpfen 争得；erfragen 问到 |
| 死亡（大量） | ertrinken 淹死；erfrieren 冻死；ersticken 窒息；erschießen 枪杀 |

er- 的动词不加 -ieren 后缀（erfrieren、eruieren 里的 ieren 是词干的一部分）。
""".strip()

IMAGE_REPLACEMENTS['动词前缀ver-.png'] = """
**ver- 的语义地图**（500 多个动词）

| 义项 | 例词 |
| --- | --- |
| 名词/形容词 → 及物动词 | der Film → verfilmen；besser → verbessern |
| 加强原动作 | suchen → versuchen 尝试；bessern → verbessern 改善 |
| 与原动作相反 | kaufen 买 → verkaufen 卖；lernen 学 → verlernen 忘掉 |
| 「弄错」（全部是反身动词） | sich versprechen 说错；sich verlaufen 走错路；sich verschreiben 写错 |
| 消耗殆尽 | verbrauchen 用光；verbrennen 烧掉；verblühen 凋谢 |
| 死亡（只有两个） | verhungern 饿死；verdursten 渴死 |

与 er- 不同，ver- 可以加 -ieren 后缀。
""".strip()

IMAGE_REPLACEMENTS['动词前缀aus-.png'] = """
**aus-（可分）的语义地图**

| 义项 | 例词 |
| --- | --- |
| 出来、向外 | ausgehen 出去；aussteigen 下车；ausziehen 搬出；ausgeben 支出 |
| 关闭 | ausmachen 关掉；ausschalten 关闭；ausbrennen 停燃 |
| 完成、到底 | ausfüllen 填完；ausschlafen 睡够；austrinken 喝光 |
| 选出、挑出 | aussuchen 挑选；auswählen 挑出 |
""".strip()

IMAGE_REPLACEMENTS['动词前缀bei.png'] = """
**bei-（可分）的语义地图**

| 义项 | 例词 |
| --- | --- |
| 附上、随附 | beilegen 附送；beifügen 附加；beischreiben 补注 |
| 参加、加入 | beitreten 加入；beiwohnen 出席 |
| 贡献 | beitragen 致力于；beisteuern 出一份力 |

前缀 bei- 就是「附」。作动词前缀是「附上、在一旁」；作名词前缀是「次要的、旁的」
（die Beilage 配菜、der Beiname 别名），与同源的英语 by-（bypass）意思一致。
""".strip()

IMAGE_REPLACEMENTS['动词前缀nach-.png'] = """
**nach-（可分）的语义地图**

nach 作为可分前缀，含义可以高度概括为「在……之后」。

| 义项 | 例词 |
| --- | --- |
| 随后、跟着 | nachlaufen 追着跑；nachblicken 目送；nachfolgen 接任 |
| 补做 | nachlernen 补学；nachholen 补上；nachzahlen 补交 |
| 模仿 | nachmachen 模仿；nachahmen 效仿；nachsprechen 跟着说 |
| 追查、查阅 | nachdenken 思考；nachschlagen 查（词典）；nachfragen 追问 |
""".strip()

IMAGE_REPLACEMENTS['动词前缀zu-.png'] = """
**zu-（可分）的语义地图**

zu 作可分前缀只有两项含义，都能统一在「箭头 →」这个意象下。

| 义项 | 例词 |
| --- | --- |
| 朝向（→） | zuschicken 寄给；zuschießen 射向；zuhören 倾听；zusehen 旁观 |
| 合上（→←，距离缩到零） | zumachen 关上；zuschließen 锁上；zunehmen 增加（补足到某量） |

zugehen / zufahren 的结构其实是 **auf jn./etw. zugehen**，本来是
`auf … zu` 的介词结构，因为句子需要一个动词，后面的 zu 就与动词粘在一起了。
""".strip()

IMAGE_REPLACEMENTS['动词前缀ueber-.png'] = """
**über- 构成的动词（约 90 个）：可分与不可分**

| 类型 | 感觉 | 例词 |
| --- | --- | --- |
| **可分**（重音在 über） | 像一个短语，「越过去、翻过去」 | **über**laufen 溢出；**über**setzen 摆渡；**über**kochen 煮溢；**über**wechseln 转过去 |
| **不可分**（重音在动词） | 像一个带前缀微调意思的词 | über**setzen** 翻译；über**legen** 考虑；über**raschen** 使惊讶；über**queren** 横穿 |
| **两可**（意思不同） | — | umfahren / übersetzen 一类的对立词对 |

特别注意：表示「吃腻、看腻、听腻」的三个反身动词都是**可分**的，重音在 über：
sich **über**essen（吃撑）、sich **über**arbeiten（累垮）、sich **über**nehmen（逞强）。
""".strip()

IMAGE_REPLACEMENTS['动词前缀wider-.png'] = """
**wider-（「反、对着」）构成的动词：Duden 收录 17 个**

| 类型 | 例词 |
| --- | --- |
| **可分**（表「反射」） | **wider**hallen 回响；**wider**spiegeln 反映；**wider**klingen 回响 |
| **不可分**（其余全部） | wider**sprechen** 反驳；wider**stehen** 抵抗；wider**setzen** (sich) 反抗；wider**rufen** 撤销；wider**legen** 驳倒；wider**fahren** 遭遇 |

规律：**除了表「反射」的几个词是可分的，其他都不可分。**
""".strip()

IMAGE_REPLACEMENTS['动词前缀wieder-.png'] = """
**wieder-（「再、又」）构成的动词：Duden 收录 46 个**

| 类型 | 例词 |
| --- | --- |
| **可分**（绝大多数） | **wieder**sehen 再见；**wieder**kommen 再来；**wieder**geben 复述；**wieder**finden 重新找到 |
| **不可分**（4 个表「恢复」的词，朗氏词典均未收录） | wieder**holen** 重复（唯一高频词） |

学习者可以直接把 **wiederholen 当作不可分动词**记
（wiederholen – wiederholte – wiederholt，重音在 hol）。
""".strip()

IMAGE_REPLACEMENTS['nehmen-1.png'] = """
**nehmen 家族（前缀 + nehmen）**

| 动词 | 意思 | 前缀逻辑 |
| --- | --- | --- |
| nehmen | 拿，取 | — |
| **ab**nehmen | 拿下；减少；减肥；接（电话） | ab = off，「拿下来」 |
| **an**nehmen | 接受；假设 | an = 接触，「拿到身上」 |
| **auf**nehmen | 接纳；录音；拍摄 | auf = 往上拿起 |
| **aus**nehmen | 除外；掏空 | aus = 拿出来 |
| **ein**nehmen | 服（药）；进（餐）；占领；收入 | ein = 拿进去 |
| **mit**nehmen | 带走 | mit = 一起 |
| **teil**nehmen | 参加 | 拿到一份 |
| **über**nehmen | 接管，承担 | über = 接过来 |
| **unter**nehmen | 采取（行动） | unter = 着手 |
| **vor**nehmen (sich) | 打算做 | vor = 摆在面前 |
| **weg**nehmen | 拿走 | weg = 走开 |
| **zu**nehmen | 增加；长胖 | zu = 加上去 |
| **zurück**nehmen | 收回 | zurück = 拿回 |

把同一个词根的所有前缀动词摆在一起，近义词的辨析就变得直观。
""".strip()

IMAGE_REPLACEMENTS['nehmen-2.png'] = """
**abnehmen 的所有义项——都只与 nehmen（take）和 ab（off）有关**

| 义项 | 例句 |
| --- | --- |
| 拿下、取下 | Er **nimmt** den Hut **ab**. 他摘下帽子。 |
| 减少、下降 | Das Interesse **nimmt ab**. 兴趣在减退。 |
| 减肥 | Ich habe fünf Kilo **abgenommen**. 我瘦了五公斤。 |
| 接（电话） | Niemand **nimmt ab**. 没人接。 |
| 收（钱）、验收 | Er **nahm** mir die Arbeit **ab**. 他接手了我的工作。 |
| 拿走（给别人减负） | Darf ich Ihnen den Mantel **abnehmen**? 我帮您拿外套好吗？ |

ab (off) 相当于汉语的「下、掉、走」，所以所有义项都是「把某物 take off」。
""".strip()

IMAGE_REPLACEMENTS['fordern-1.png'] = """
**「要求」的三个近义词**

| 动词 | 语感 | 名词/形容词参照 | 例句 |
| --- | --- | --- | --- |
| verlangen | 「想要有」，与「渴望」有关 | das Verlangen 热望 | Er **verlangt** eine Erklärung. 他要一个解释。 |
| fordern | 「主张要有」，正式提出要求 | die Forderung 要求 | Die Gewerkschaft **fordert** mehr Lohn. 工会要求加薪。 |
| erfordern | 「有必要」，事物本身需要 | erforderlich 必需的 | Das **erfordert** viel Geduld. 这需要很多耐心。 |

fördern（促进）来自 fürder（更远、往前），所以早期还有「运送」的含义，
今天这项含义改用 befördern；「把矿石运出来」于是有了「开采」义。
""".strip()

IMAGE_REPLACEMENTS['fordern-2.png'] = """
**-fordern / -fördern 家族一览**

| 动词 | 意思 | 前缀逻辑 |
| --- | --- | --- |
| fordern | 要求 | — |
| **auf**fordern | 邀请，号召 | auf = 唤起 |
| **an**fordern | 索取，申领 | an = 朝向对方 |
| **ein**fordern | 追讨 | ein = 收进来 |
| **ab**fordern | 向某人索要 | ab = 从某人处取走 |
| **heraus**fordern | 挑战 | heraus = 叫出来 |
| **über**fordern | 要求过高 | über = 超过 |
| **unter**fordern | 要求过低 | unter = 不足 |
| fördern | 促进；开采 | 「往前推」 |
| **be**fördern | 运输；晋升 | be- 使及物 |

只要理解介词/前缀的深层含义，把同族词摆在一起，辨析就是小菜一碟。
""".strip()

IMAGE_REPLACEMENTS['用法模式nach.jpg'] = """
**nach 的用法结构（Verwendungsmuster）**

nach 在用法结构中的含义仍然可以高度概括为「在……之后」。

| 结构 | 含义 | 例句 |
| --- | --- | --- |
| nach + D.（时间） | ……之后 | **nach** dem Essen 饭后；**nach** zwei Stunden 两小时后 |
| nach + 地名（无冠词） | 去…… | **nach** Berlin fahren；**nach** Hause gehen |
| nach + 方位 | 朝…… | **nach** links, **nach** Norden |
| nach + D.（依据） | 按照 | **nach** meiner Meinung；dem Gesetz **nach**（可后置） |
| fragen nach + D. | 打听 | Er **fragt nach** dem Weg. |
| suchen nach + D. | 寻找 | Sie **sucht nach** ihrer Brille. |
| riechen / schmecken nach + D. | 有……味道 | Es **riecht nach** Kaffee. |
| sich sehnen nach + D. | 渴望 | Ich **sehne mich nach** Ruhe. |
| streben nach + D. | 追求 | Er **strebt nach** Erfolg. |
| greifen nach + D. | 伸手去拿 | Sie **griff nach** dem Buch. |

做法：把词典中几乎所有带 nach 的用法结构找出来，再细分，囊括在同一个意象下，
并尽可能按语义发展脉络排列。
""".strip()

# --- 介词 ------------------------------------------------------------------

IMAGE_REPLACEMENTS['介词.png'] = """
**27 个核心介词（掌握它们就掌握了德语介词 90% 以上的知识点）**

| 类别 | 介词 |
| --- | --- |
| 只支配第三格（9 个） | aus, bei, mit, nach, seit, von, zu, gegenüber, ab |
| 只支配第四格（5 个） | durch, für, gegen, ohne, um |
| 静三动四（Wechselpräpositionen，9 个） | an, auf, hinter, in, neben, über, unter, vor, zwischen |
| 支配第二格（4 个最常见） | während, wegen, trotz, statt |
""".strip()

IMAGE_REPLACEMENTS['介词ab.png'] = """
**ab 的语义地图**

核心意象：**脱离**（＝英语 off；英语 of 也同源：「脱离」意味着「来自、是其中一部分」）。

| 用法 | 含义 | 例子 |
| --- | --- | --- |
| 介词 + D. | 时间/空间的「从……起」 | **ab** morgen；**ab** Frankfurt；**ab** dem 18. Lebensjahr |
| 可分前缀①「拿掉、去掉」 | 脱离 | abnehmen 拿下；abschneiden 切下；abwaschen 洗掉 |
| 可分前缀②「离开、出发」 | 脱离 | abfahren 开走；abfliegen 起飞；abreisen 动身 |
| 副词 | 掉了、脱了 | Der Knopf ist **ab**. 扣子掉了。 |

**ab vs. seit**：seit 是从过去到现在并可能继续（＝ since）；
ab 只表示起点、不关心终点，起点也不一定在过去（＝ from … on）。
""".strip()

IMAGE_REPLACEMENTS['介词von.png'] = """
**von 的语义地图**

核心意象：**来自**（所有义项都由此派生）。

| 用法 | 例子 |
| --- | --- |
| 来自（人、非国家地名） | Ich komme **von** meiner Tante. |
| 起点（时间/空间，常与 bis 搭配） | **von** Montag **bis** Freitag；**von** hier **bis** dort |
| 代替第二格（口语与不带冠词时） | die Mutter **von** Anna；ein Freund **von** mir |
| 被动句的施动者 | Der Brief wurde **von** ihm geschrieben. |
| 关于（≈ über） | Er erzählt **von** seiner Reise. |

**aus vs. von**：绝招是用「词对」——**aus 和 in 是一对，von–bei–zu 是一组**。
「在某地方」用 in 的，「来自」就用 **aus**（in China → aus China）；
否则用 **von**（bei meiner Tante → von meiner Tante）。
""".strip()

IMAGE_REPLACEMENTS['介词aus.png'] = """
**aus 的语义地图**

核心意象：**从内部出来**（无论作介词还是作前缀，都统一在这个模糊意象下）。

| 用法 | 例子 |
| --- | --- |
| 来自（国家、城市、封闭空间） | **aus** China；**aus** dem Haus kommen |
| 材料 | ein Tisch **aus** Holz |
| 原因（无冠词，抽象名词） | **aus** Liebe；**aus** Angst；**aus** Versehen |
| 可分前缀「出来」 | ausgehen, aussteigen, ausziehen |
| 可分前缀「关闭、耗尽」 | ausmachen, ausbrennen, austrinken |
| 副词「灭了、完了」 | Das Licht ist **aus**. |
""".strip()

IMAGE_REPLACEMENTS['介词ueber.png'] = """
**über 的语义地图**

核心意象：**一条线**——从上方跨过、笼罩、统摄。

| 用法 | 例子 |
| --- | --- |
| 在……上方（静三动四） | Das Bild hängt **über** dem Sofa.（D.）／ Er hängt es **über** das Sofa.（A.） |
| 越过、经由 | **über** die Brücke gehen；**über** München fliegen |
| 关于 | ein Buch **über** Deutschland；sprechen **über** + A. |
| 超过（数量） | **über** 100 Euro |
| 前缀（可分）「越过、溢出」 | überlaufen, überkochen |
| 前缀（不可分）「覆盖、超越」 | übersetzen 翻译, überlegen 考虑, überraschen |
""".strip()

IMAGE_REPLACEMENTS['介词auf.png'] = """
**auf 的语义地图**

核心意象：**一个面**（über 的感觉是条线，auf 的感觉是个面）。

| 用法 | 例子 |
| --- | --- |
| 在……（水平面）上（静三动四） | **auf** dem Tisch（D.）／ **auf** den Tisch legen（A.） |
| 去（开放空间、机构） | **auf** die Post；**auf** den Markt；**auf** eine Party |
| 用（语言） | **auf** Deutsch |
| 从下往上（＝英语 up） | **auf**stehen 起立；**auf**machen 打开；**auf**wachen 醒来 |
| 动介搭配 | warten **auf** + A.；sich freuen **auf** + A.；antworten **auf** + A. |

auf 最原始的含义就是英语的 up，很多结构和复合词都可以用 up 来理解。
""".strip()

IMAGE_REPLACEMENTS['介词an.png'] = """
**an 的语义地图**

核心意象：**小型接触面**——两个物体挨近形成的小接触面，或用无形的触手抓住。

| 用法 | 例子 |
| --- | --- |
| 贴着、靠着（静三动四） | Das Bild hängt **an** der Wand（D.）／ Er hängt es **an** die Wand（A.） |
| 时间点（天、日期） | **am** Montag；**am** 3. Mai；**am** Abend |
| 到（人、机构） | Ich schreibe **an** meinen Chef. |
| 边界（河、海、山脚） | **am** Rhein；**am** Meer |
| 动介搭配 | denken **an** + A.；sich erinnern **an** + A.；teilnehmen **an** + D. |

记忆窍门：一个房间有 6 个面，**除了我们站的那个面用 auf，其他 5 个面都用 an**。
""".strip()

IMAGE_REPLACEMENTS['介词zu.png'] = """
**zu 的语义地图**

核心意象：**一个箭头 →**。zu 的所有义项都能统一在这个意象下。

| 用法 | 例子 |
| --- | --- |
| 介词：方向（人、机构） | **zu** mir；**zu** Bett gehen；**zum** Arzt gehen |
| 介词：时间点/场合 | **zu** Weihnachten；**zu** Mittag |
| 介词：目的 | **zum** Lernen；**zur** Erholung |
| 副词：太…… | **zu** teuer；**zu** spät |
| 副词：关着 | Die Tür ist **zu**. |
| 不定式符号 | Ich habe vor, nach Berlin **zu** fahren. |
| 可分前缀 | zumachen 关上；zuhören 倾听 |

zu Bett 也可以说 ins Bett，区别在于：静三动四的 9 个介词能准确表示相对位置关系，
而 zu 只表示方向。von–bei–zu 是一组：在哪儿用 bei，去那儿就用 zu，从那儿来用 von。
""".strip()

IMAGE_REPLACEMENTS['介词ueber位置.png'] = """
**位置示意：über＝一条线**

```
        ────────────  ← über（在上方笼罩、跨过，不必接触）
            ▨  物体
```
*Die Lampe hängt **über** dem Tisch.* 灯挂在桌子上方（不接触）。
""".strip()

IMAGE_REPLACEMENTS['介词auf位置.png'] = """
**位置示意：auf＝一个大的面**

```
            ▨  物体
        ▓▓▓▓▓▓▓▓▓▓▓▓  ← auf（放在水平面上，完全接触）
```
*Das Buch liegt **auf** dem Tisch.* 书放在桌面上。
""".strip()

IMAGE_REPLACEMENTS['介词an位置.png'] = """
**位置示意：an＝小型接触面**

```
        ▓│
        ▓│▨  ← an（侧面贴靠，接触面很小）
        ▓│
```
*Das Bild hängt **an** der Wand.* 画挂在墙上（贴着竖直面）。
""".strip()

IMAGE_REPLACEMENTS['介词zu位置.png'] = """
**位置示意：zu＝一个方向箭头**

```
        ▨  ───────→  ⌂
```
*Ich gehe **zum** Bahnhof.* 我朝火车站走（只表方向，不表最终位置关系）。
""".strip()

IMAGE_REPLACEMENTS['介词um位置.png'] = """
**位置示意：um＝围绕一圈**

```
           ↗ ─── ↘
          │   ▨   │   ← um（绕着中心转一圈）
           ↖ ─── ↙
```
*Die Erde dreht sich **um** die Sonne.* 地球绕着太阳转。
""".strip()

IMAGE_REPLACEMENTS['介词um.png'] = """
**um 的语义地图**

核心意象：**围绕**。

| 用法 | 例子 |
| --- | --- |
| 围绕（空间） | **um** den Tisch sitzen；**um** die Ecke |
| 钟点 | **um** 8 Uhr |
| 差额 | Der Preis stieg **um** 10 Prozent. |
| 为了（获得） | Er bittet **um** Hilfe；sich kümmern **um** + A. |
| um … zu + 不定式 | Ich lerne Deutsch, **um** in Berlin zu studieren. |
| 前缀（可分）「转向、围绕」 | **um**drehen, **um**ziehen |
| 前缀（不可分）「围住」 | um**armen** 拥抱, um**geben** 环绕 |

词源：um 来自古希腊语 amphi（围绕；两边），现代德语里还有 die Amphibie（两栖动物）、
das Amphitheater（圆形剧场）。amphi 掉了后一个音节成了 um，掉了前一个音节成了 bei，
所以 um（围绕）和 bei（在附近）是同源词；beide 就是 bei + de。
""".strip()

IMAGE_REPLACEMENTS['介词bei.png'] = """
**bei 的语义地图**

朗氏词典给 bei 列了 18 项含义，其实可以归成 6 项，再归成 2 项，最后合并成一个字：**附**。

| 用法 | 例子 |
| --- | --- |
| 在某人处、在某公司 | **bei** meinem Onkel wohnen；**bei** Siemens arbeiten |
| 在……附近 | Potsdam liegt **bei** Berlin. |
| 在……的时候（同时发生） | **beim** Essen；**bei** der Arbeit；**bei** Regen |
| 随身带着 | Ich habe kein Geld **bei** mir. |
| 条件 | **bei** diesem Wetter bleibe ich zu Hause. |

**bei vs. zu**：bei 是静态的（在旁边），zu 是动态的（朝那边去）。
德语对「动」和「静」极其敏感。
""".strip()

IMAGE_REPLACEMENTS['介词nach.png'] = """
**nach 的语义地图**

核心意象：**在……之后**（含义不多，可以完全统一）。

| 用法 | 例子 |
| --- | --- |
| 时间「之后」 | **nach** dem Essen；**nach** zwei Stunden |
| 去（国家、城市、方位，不带冠词） | **nach** Berlin；**nach** Hause；**nach** links |
| 按照、依据（可前置也可后置） | **nach** dem Gesetz ＝ dem Gesetz **nach** |
| 动介搭配 | fragen **nach**；suchen **nach**；riechen **nach** |
| 可分前缀 | **nach**denken 思考；**nach**machen 模仿；**nach**holen 补上 |
""".strip()

IMAGE_REPLACEMENTS['介词unter.png'] = """
**unter 的语义地图**

unter 的所有用法都可以概括为两点：**infra/under（在下面）** 与 **inter/among（在中间）**。

| 含义 | 用法 | 例子 |
| --- | --- | --- |
| under | 在……下方（静三动四） | **unter** dem Tisch（D.）／ **unter** den Tisch（A.） |
| under | 少于 | Kinder **unter** 6 Jahren |
| among | 在……之中 | **unter** Freunden；**unter** anderem（u. a.） |
| under | 可分前缀（重读） | **unter**gehen 沉没；**unter**streichen 划线 |
| inter | 不可分前缀（不重读） | unter**brechen** 打断（＝英语 interrupt）；unter**halten** 交谈 |

参见同源词：infrarot 红外线、die Infrastruktur 基础设施；international 国际的、das Internet。
""".strip()

# --- 句法 ------------------------------------------------------------------

IMAGE_REPLACEMENTS['句子成分.png'] = """
**德语的句子成分与词类**

句子成分只有 6 种：

| 成分 | 德语 | 说明 | 例子 |
| --- | --- | --- | --- |
| 主语 | Subjekt | 第一格 | **Der Lehrer** kommt. |
| 谓语 | Prädikat | 变位动词（+ 句框第二部分） | Er **hat** das Buch **gelesen**. |
| 宾语 | Objekt | 第四格/第三格/第二格/介词宾语 | Er gibt **mir** **das Buch**. |
| 状语 | Adverbialbestimmung | 时间、原因、情状、地点 | Er kommt **morgen** **mit dem Zug**. |
| 补足语 | Prädikativ/Ergänzung | 与 sein/werden/bleiben 搭配 | Er wird **Arzt**. |
| 定语 | Attribut | 修饰名词，不独立作成分 | das **neue** Buch |

词类主要有 11 种：**名、动、形、数、冠、代、副、介、连、小、叹**
（「小」指小品词／语气词）。
""".strip()

IMAGE_REPLACEMENTS['基本句型.png'] = """
**德语的 5 种基本句型**

| 句型 | 结构 | 例句 |
| --- | --- | --- |
| ① 主 + 谓 | S + V | Das Kind **schläft**. |
| ② 主 + 谓 + 表语 | S + sein/werden/bleiben + N./Adj. | Er **ist** Lehrer. / Sie **wird** müde. |
| ③ 主 + 谓 + 第四格宾语 | S + V + A. | Ich **lese** das Buch. |
| ④ 主 + 谓 + 第三格（+ 第四格）宾语 | S + V + D. (+ A.) | Ich **helfe** dir. / Ich **gebe** dir das Buch. |
| ⑤ 主 + 谓 + 必需状语 | S + V + Adv. | Er **wohnt** in Berlin. |

所有句子都是在这 5 种句型的基础上变化的，**从句也不例外**：
整个句子作成分就是从句，作什么成分就叫什么从句（作主语＝主语从句）。
德语从句有两个明显标志——**理论上都有引导词**，**变位动词在最后一位**，
所以比英语从句好辨认得多。
""".strip()

IMAGE_REPLACEMENTS['语序.png'] = """
**语序：句框 + TeKaMoLo**

主句的「场」结构：

| 前场 Vorfeld | 左括号 | 中场 Mittelfeld | 右括号 | 后场 |
| --- | --- | --- | --- | --- |
| 一个成分 | 变位动词（第 2 位） | 其余成分 | 不可变部分 | 从句/比较句 |
| Morgen | **will** | ich mit dem Zug nach Köln | **fahren**. | |
| Ich | **habe** | ihm gestern das Buch | **gegeben**. | |

规则：

* **变位动词永远在第二位**（第二个成分，不是第二个词）；除了动词，其他成分都可以提前，但一次只能提前一个，主语被挤到动词后面，其余成分保持原位。
* 中场状语顺序 **te-ka-mo-lo**：
  **te**mporal 时间（Wann?）→ **ka**usal 原因（Warum?）→ **mo**dal 情状（Wie?）→ **lo**kal 地点（Wo? Wohin?）。
  *Ich fahre **morgen** **wegen der Prüfung** **mit dem Zug** **nach Köln**.*
* 宾语顺序：**名 + 名 → 三格在前**（Ich gebe **dem Kind** **das Buch**）；
  **只要有代词，代词在前**（Ich gebe **es** **dem Kind**；Ich gebe **es ihm**）。
""".strip()

IMAGE_REPLACEMENTS['kein.png'] = """
**kein 的变格（＝ ein 的变格 + 复数）**

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| N. | kein | keine | kein | keine |
| A. | keinen | keine | kein | keine |
| D. | keinem | keiner | keinem | keinen |
| G. | keines | keiner | keines | keiner |

**什么时候用 kein，什么时候用 nicht？**

| 被否定的成分 | 用什么 | 例句 |
| --- | --- | --- |
| 带不定冠词的名词 | kein | Ich habe **ein** Auto. → Ich habe **kein** Auto. |
| 零冠词的名词（物质、抽象、复数） | kein | Ich trinke Kaffee. → Ich trinke **keinen** Kaffee. |
| 带定冠词/物主冠词的名词 | nicht | Das ist **nicht** mein Auto. |
| 动词、形容词、状语、整句 | nicht | Ich komme **nicht**. |
""".strip()

IMAGE_REPLACEMENTS['ja&nein&doch.jpg'] = """
**ja / nein / doch 的回答规则**

| 问句 | 事实是肯定的 | 事实是否定的 |
| --- | --- | --- |
| **肯定问句**：Kommst du mit? | **Ja**, ich komme mit. | **Nein**, ich komme nicht mit. |
| **否定问句**：Kommst du **nicht** mit? | **Doch**, ich komme mit. | **Nein**, ich komme nicht mit. |

一句话记住：**只有在「否定问句 + 肯定回答」时才用 doch**。

* Hast du **kein** Geld? – **Doch**, ich habe Geld.（我有）
* Hast du **kein** Geld? – **Nein**, ich habe kein Geld.（我没有）
* Ist das **nicht** schön? – **Doch**, sehr schön!
""".strip()

# --- 其他 ------------------------------------------------------------------

IMAGE_REPLACEMENTS['德语的阶段.png'] = """
**德语学习的阶段（CEFR）**

| 级别 | 词汇量（约） | 能做什么 | 语法重点 |
| --- | --- | --- | --- |
| A1 | 650–1000 | 自我介绍、日常寒暄 | 三性四格、现在时、完成时、可分动词、情态动词 |
| A2 | 1300–2000 | 处理日常生活情景 | 过去时、形容词变格、从句入门（weil, dass）、比较级 |
| B1 | 2400–3000 | 讲述经历、表达观点 | 关系从句、被动态、第二虚拟式、Konnektoren |
| B2 | 4000–6000 | 讨论抽象话题、读报刊 | 间接引语、扩展分词定语、名词化、语气小品词 |
| C1 | 8000+ | 学术与职业场景自如表达 | Funktionsverbgefüge、Passiversatz、篇章连接 |
| C2 | — | 接近母语者 | 语体、修辞 |

泛读泛听（青少年德语新闻、肥皂剧）只是「零食」——不要完美主义，关键是坚持；
水平没到就先提高级别，不要硬看；不要把所有材料都变成精读精听。
""".strip()

IMAGE_REPLACEMENTS['PasswortDeutsch.jpg'] = """
**德语基本语法框架（分布在 A1–B1 三个级别）**

| 级别 | 名词/冠词 | 动词 | 句法 |
| --- | --- | --- | --- |
| **A1** | 三性四格、定/不定/否定冠词、复数、物主冠词 | 现在时、可分动词、情态动词、命令式、现在完成时 | 陈述句、疑问句、句框、并列连词 |
| **A2** | 形容词变格、比较级/最高级、指示与不定代词 | 过去时、过去完成时、反身动词、将来时 I | 从句（weil, dass, wenn, ob）、从句语序 |
| **B1** | 名词化、n-变化、第二格 | 被动态、第二虚拟式、动词的介词搭配 | 关系从句、不定式从句、TeKaMoLo、双重连词 |

这三层框架搭完，德语的「骨架」就完整了，B2 以上主要是在这个骨架上加语体和词汇。
""".strip()

IMAGE_REPLACEMENTS['口语时态.png'] = """
**口语中的时态选择**

| 要表达的时间 | 口语里实际用什么 | 例子 |
| --- | --- | --- |
| 现在 | 现在时 | Ich **arbeite** gerade. |
| 将来 | **现在时 + 时间状语**（Futur I 用得少） | Ich **fahre** morgen nach Köln. |
| 将来的推测 | Futur I | Er **wird** wohl krank **sein**. |
| 过去（一般） | **现在完成时** | Ich **habe** gestern gearbeitet. |
| 过去（sein/haben/情态动词/es gibt） | **过去时** | Ich **war** müde. / Ich **hatte** keine Zeit. / Ich **musste** gehen. / Es **gab** Probleme. |
| 更早的过去 | 过去完成时 | Ich **hatte** schon gegessen, als er kam. |

一句话：**口语讲过去用完成时，但 haben, sein, es gibt 和情态动词用过去时。**
书面叙事（小说、新闻）则整体用过去时。
""".strip()

IMAGE_REPLACEMENTS['时间表达.png'] = """
**时间表达一览**

| 提问 | 结构 | 例子 |
| --- | --- | --- |
| Wann?（时间点） | um + 钟点 | **um** 8 Uhr |
| Wann?（天/日期） | am + 天/日期 | **am** Montag；**am** 3. Mai |
| Wann?（月/季/世纪） | im + 月/季 | **im** Mai；**im** Sommer |
| Wann?（年份） | 直接说年份 或 im Jahr(e) | 1990 ＝ (**im Jahr**) 1990 |
| Wann?（之前/之后） | vor / nach + D. | **vor** zwei Jahren；**nach** dem Essen |
| Seit wann? | seit + D. | **seit** drei Monaten |
| Bis wann? | bis + A. | **bis** nächsten Freitag |
| Wie lange? | 第四格（无介词）/ 无 | Ich bleibe **einen Monat**. |
| Wie oft? | jeden/jede/jedes + A. | **jeden Tag**, **jede Woche** |

特例：**nachts**（副词，小写）、**heute Morgen**（名词大写）、
**morgen früh**（不是 morgen Morgen）。
""".strip()


# ---------------------------------------------------------------------------
# 2. Prose fixes for the legacy corpus (the text used to point at the images).
# ---------------------------------------------------------------------------

PROSE_FIXES = {
    '形容词/形容词变格': [
        ('观察三个表格，我们容易得出：', '观察上面三个表格，我们容易得出：'),
        ('这个示意图上的颜色完全和形容词变化三个表格中的颜色相对应。',
         '这个判断树和形容词变化三个表格是完全对应的：加 -e 对应橙色，加 -en 对应紫色，'
         '加「定冠词此时该有的词尾」对应蓝色。'),
        ('最后那个八爪鱼一样的东西，指的是词尾只有这5种可能性。',
         '判断树最后那个「八爪鱼」，指的是词尾只有这 5 种可能性。'),
    ],
    '名词/名词': [
        ('德语自源词阴性的词尾构词能力最强大，比如ung和heit，见下图：',
         '德语自源词阴性的词尾构词能力最强大，比如 -ung 和 -heit，见下表：'),
        # `*` is used as a wildcard for "any vowel" here; escape it so marked
        # does not read it as emphasis.
        ('-*ss（*为元音字母）', r'-\*ss（\*为元音字母）'),
        ('**-*ss 结尾原则上是 der**', r'**-\*ss 结尾原则上是 der**'),
    ],
    '代词/代词': [
        # `*16` is a footnote marker in the source, not emphasis.
        ('der*16', r'der\*16'),
    ],
    '介词/介词辨析': [
        ('从下面的思维导图可以看出，aus的各项含义，无论是做介词还是做前缀，都可以高度统一到一个模糊的意象下。',
         '从下面的语义地图可以看出，aus 的各项含义，无论是做介词还是做前缀，都可以高度统一到一个模糊的意象下。'),
        ('在详解各项意思之前，我们先把zu的主要意思用示意图总结，找到一目了然的感觉。',
         '在详解各项意思之前，我们先把 zu 的主要意思用下表总结，找到一目了然的感觉。'),
    ],
    '动词/叙述方式': [
        ('### 第一虚拟式', '本章是叙述方式的总览，第一虚拟式、第二虚拟式与间接引语各有专门的章节。\n\n### 第一虚拟式'),
    ],
    'intro/前言': [],
}

# Extra material appended to a few legacy topics.
APPENDIX = {
    'intro/前言': """

## 怎么用这本语法书

这本语法书按「词法 — 动词 — 句法 — 附录」四大部分组织，共 100 多个专题，
每个专题都标了 CEFR 级别（A1–C1），可以按级别挑着看，也可以当工具书查。

* **A1–A2 阶段**：先把「三个性四个格」、动词现在时变位、句框和完成时啃下来，
  这四样是德语的骨架，其余都是挂在骨架上的。
* **B1 阶段**：关系从句、被动态、第二虚拟式、动词的介词搭配。
* **B2–C1 阶段**：间接引语、扩展分词定语、被动态的替代形式、语气小品词。

书里的所有表格都是可搜索的文本（不是图片），可以直接复制到自己的笔记里。
每个专题都尽量做到：**规则 → 表格 → 例句（带中文）→ 常见错误**。

## 一点方法论

德语语法的难点不在规则多，而在规则之间互相牵制：
名词的**性**决定冠词，冠词决定形容词词尾，动词决定**格**，连词决定**语序**。
所以背孤立的表格效率很低，**要连着整个结构一起背**——
不要背「der, den, dem, des」，要背「wie der Mann / für den Mann / mit dem Mann / wegen des Mannes」。
""",
    '动词/行动方式': '',
}


# ---------------------------------------------------------------------------
# 3. Authored topics.
# ---------------------------------------------------------------------------

AUTHORED = []


def T(slug, title, level, md):
    AUTHORED.append({'slug': slug, 'title': title, 'level': level, 'md': md.strip() + '\n'})


# === AUTHORED TOPICS BEGIN ===

T('名词/名词的性', '名词的性（Genus）', 'A1', """
# 名词的性（Genus）

德语每个名词都有性：**阳性 der / 阴性 die / 中性 das**。性不是「意义上的性别」，
而是词的语法属性，所以 **das Mädchen**（女孩）是中性、**die Person**（人）是阴性。
背单词时必须**连冠词一起背**：不是 Tisch，而是 *der Tisch*。

## 三条判断原则

| 原则 | 说明 | 例子 |
| --- | --- | --- |
| ① 词尾原则（最强） | 某种词尾属于某种性，字母越多越可靠 | -ung → die；-chen → das；-ismus → der |
| ② 种类原则（最简明） | 属于某个语义类别的是某种性 | 星期/月份/季节/方位 → der；金属/化学元素 → das |
| ③ 类比原则 | 新词、外来词联想到已有的德语词 | das E-Mail?→ **die** E-Mail（＝die Post/die Nachricht） |

## 按词尾判断（高可靠度）

| 性 | 词尾 | 例词 |
| --- | --- | --- |
| **der** | -er（人/工具）、-ling、-ismus、-ist、-ent、-ant、-or、-eur、-ig、-ich、-en（非动名词） | der Lehrer, der Lehrling, der Kapitalismus, der Tourist, der Student, der Motor, der Ingenieur, der Honig, der Teppich, der Garten |
| **die** | -ung、-heit、-keit、-schaft、-ei、-ion、-tät、-ur、-ik、-ie、-enz、-anz、-in（女性） | die Zeitung, die Freiheit, die Möglichkeit, die Freundschaft, die Bäckerei, die Nation, die Universität, die Kultur, die Musik, die Familie, die Konferenz, die Lehrerin |
| **das** | -chen、-lein、-ment、-um、-tum、-nis、-zeug、-ett、Ge-、动词原形名词化 | das Mädchen, das Fräulein, das Dokument, das Museum, das Eigentum, das Ergebnis, das Werkzeug, das Ballett, das Gebäude, das Essen |

## 按语义类别判断

| 性 | 类别 | 例词 |
| --- | --- | --- |
| der | 星期、日、月、季节、方位、自然现象（风雨雪雾）、酒类、汽车品牌 | der Montag, der Mai, der Sommer, der Norden, der Regen, der Wein, der BMW |
| die | 数字名词化、多数树/花/水果、摩托车与船 | die Eins, die Tanne, die Rose, die Birne, die Titanic |
| das | 幼小的人和动物、金属与化学元素、颜色、字母、语言、名词化的词类 | das Kind, das Kalb, das Gold, das Blau, das A, das Deutsch, das Ich |

## 例句

1. **Der Lehrer erklärt die Regel dem Kind.** — 老师给孩子解释规则。（三个性同时出现）
2. **Die Freiheit ist das wichtigste Gut.** — 自由是最重要的财富。（-heit → die）
3. **Das Mädchen liest ein Buch; es ist erst sechs Jahre alt.** — 那女孩在读书，她才六岁。（-chen → das，代词也用 es）
4. **Am Montag scheint die Sonne, aber der Wind ist kalt.** — 星期一有太阳，但是风很冷。
5. **Die Universität hat ein neues Gebäude.** — 大学有一座新楼。（-tät → die，Ge- → das）
6. **Der Kapitalismus und die Demokratie sind zwei verschiedene Dinge.** — 资本主义和民主是两回事。
7. **Ich brauche das Werkzeug aus dem Keller.** — 我需要地下室里的那个工具。

## 常见错误

* ❌ *das Universität* → ✅ **die** Universität（-tät 一律阴性）
* ❌ *die Mädchen ist nett* → ✅ **Das** Mädchen ist nett.（小称后缀 -chen 压倒自然性别）
* ❌ *der E-Mail* → ✅ **die** E-Mail（类比 die Post）
* ❌ 只背 *Tisch* 不背冠词 → 到了要变格的时候必然出错，因为格的词尾取决于性。
"""),

T('名词/名词的复数', '名词的复数（Plural）', 'A1', """
# 名词的复数（Plural）

德语复数**不看词的意思，只看词形**，而且复数一律用定冠词 **die**。
一共五种词尾，前三种有可能变音。

## 五种复数词尾

| 词尾 | 变音 | 主要适用 | 例子 |
| --- | --- | --- | --- |
| **-e** | 可 | 多数阳性、部分中性、部分单音节阴性 | der Tag – die Tage；der Stuhl – die Stühle；die Hand – die Hände |
| **-⸚（零词尾）** | 可 | 以 -er / -el / -en 结尾的阳性和中性 | der Lehrer – die Lehrer；der Vogel – die Vögel；das Mittel – die Mittel |
| **-er** | 可 | 单音节中性词，少量阳性 | das Kind – die Kinder；das Buch – die Bücher；der Mann – die Männer |
| **-(e)n** | 不 | 绝大多数阴性词、阳性弱变化 | die Frau – die Frauen；die Blume – die Blumen；der Student – die Studenten |
| **-s** | 不 | 外来词、缩写、元音结尾的词 | das Auto – die Autos；der Chef – die Chefs；die Oma – die Omas |

## 三条几乎无例外的规则

1. **-in → -innen**：die Studentin – die Studentin**nen**（发音造成的变体）。
2. **-nis → -nisse**，**-us → -usse**：das Ergebnis – die Ergebni**sse**；der Bus – die Bu**sse**（否则 s 会读成浊音）。
3. **第三格复数再加 -n**（-s 复数除外）：mit den **Kindern**, mit den **Büchern**, aber: mit den **Autos**。

## 变音的条件

只有重读元音是 **a / o / u / au** 的**高频词**才可能变音：
der Vater – die V**ä**ter；der Sohn – die S**ö**hne；die Mutter – die M**ü**tter；
das Haus – die H**äu**ser。
所以变音的词其实并不多，**der Onkel – die Onkel**、**der Tag – die Tage** 都不变音。

## 例句

1. **Die Kinder spielen im Garten.** — 孩子们在花园里玩。
2. **Ich habe zwei Brüder und drei Schwestern.** — 我有两个兄弟和三个姐妹。
3. **Die Häuser in dieser Straße sind alt.** — 这条街上的房子都很旧。
4. **Er spricht mit den Studentinnen über die Prüfung.** — 他和女学生们谈考试。
5. **Wir fahren mit den Autos, nicht mit den Fahrrädern.** — 我们开车去，不骑自行车。
6. **In den Büchern stehen viele Beispiele.** — 书里有很多例子。
7. **Die Lehrer geben den Kindern Hausaufgaben.** — 老师们给孩子们布置作业。

## 常见错误

* ❌ *mit den Kinder* → ✅ mit den **Kindern**（第三格复数必须加 -n）
* ❌ *die Fraus* → ✅ die **Frauen**（-s 复数只用于外来词）
* ❌ *zwei Bier**s*** → ✅ zwei **Bier**（度量单位在数词后不变复数：drei Glas Wasser, fünf Stück）
* ❌ 把复数当作「加 s」——德语的 -s 复数是少数派，不是默认。
"""),

T('名词/名词的格变化', '名词的格变化（Deklination）', 'A1', """
# 名词的格变化（Deklination）

德语的**格**主要体现在冠词上，名词本身只在两个地方变形：
**阳性/中性单数第二格加 -(e)s**，**第三格复数加 -n**。

## 全表（以 der Mann / die Frau / das Kind / die Kinder 为例）

| 格 | 阳性 | 阴性 | 中性 | 复数 |
| --- | --- | --- | --- | --- |
| N. | der Mann | die Frau | das Kind | die Kinder |
| A. | den Mann | die Frau | das Kind | die Kinder |
| D. | dem Mann | der Frau | dem Kind | den Kinder**n** |
| G. | des Mann**es** | der Frau | des Kind**es** | der Kinder |

## 第二格 -s 还是 -es？

| 情况 | 词尾 | 例子 |
| --- | --- | --- |
| 单音节词 | 多用 **-es** | des Kind**es**, des Mann**es**, des Tag**es**（也可 des Tags） |
| 以 -s, -ß, -x, -z, -tz 结尾 | 必须 **-es** | des Hau**ses**, des Platz**es**, des Chef**s**（外来词例外） |
| 多音节、以 -el/-er/-en 结尾 | 用 **-s** | des Lehrer**s**, des Vogel**s**, des Garten**s** |
| 外来词、以元音结尾 | 用 **-s** | des Auto**s**, des Sofa**s** |

## 第三格复数的 -n

复数形式如果本身不以 **-n** 或 **-s** 结尾，第三格复数必须加 **-n**：

| 复数 | 第三格复数 |
| --- | --- |
| die Kinder | den Kinder**n** |
| die Bücher | den Bücher**n** |
| die Tage | den Tage**n** |
| die Frauen | den Frauen（已有 -n） |
| die Autos | den Autos（-s 复数不加） |

## 例句

1. **Das ist das Auto des Lehrers.** — 这是老师的车。（第二格）
2. **Wegen des schlechten Wetters bleiben wir zu Hause.** — 因为天气不好我们待在家。
3. **Ich helfe den Kindern bei den Hausaufgaben.** — 我帮孩子们做作业。（第三格复数 + -n）
4. **Der Titel des Buches ist lang.** — 这本书的标题很长。
5. **Am Ende des Tages sind alle müde.** — 一天结束时大家都累了。
6. **Mit den Büchern in der Tasche ging er nach Hause.** — 他包里装着书回家了。
7. **Die Farbe des Hauses gefällt mir nicht.** — 这房子的颜色我不喜欢。

## 常见错误

* ❌ *das Auto **des Lehrer*** → ✅ des Lehrer**s**
* ❌ *mit den Freunde* → ✅ mit den **Freunden**
* ❌ *des Frau* → ✅ **der** Frau（阴性第二格用 der，名词不加 -s）
* 口语里第二格常被 **von + D.** 代替：das Auto **von** meinem Lehrer——考试作文里仍应写第二格。
"""),

T('冠词/定冠词', '定冠词（bestimmter Artikel）', 'A1', """
# 定冠词（bestimmter Artikel）

定冠词 **der / die / das** 表示「说话双方都知道的那一个」。它同时携带了名词的
**性、数、格**三条信息，是整个德语语法的枢纽。

## 变格表

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| N.（谁？） | **der** | **die** | **das** | **die** |
| A.（把谁？） | **den** | die | das | die |
| D.（给谁？） | **dem** | **der** | **dem** | **den** (+ -n) |
| G.（谁的？） | **des** (+ -s) | der | **des** (+ -s) | der |

只有 5 种词尾：**-r, -e, -s, -m, -n**。把它们记熟，后面形容词变格、
指示代词、关系代词全都跟着走。

## 什么时候必须用定冠词

| 情况 | 例子 |
| --- | --- |
| 上文提过、双方已知 | Ich sehe **einen** Mann. **Der** Mann ist groß. |
| 世上独一无二 | **die** Sonne, **der** Mond, **die** Erde |
| 最高级、序数词 | **der** beste Film, **der** erste Tag |
| 带定语从句或第二格定语限定 | **das** Buch, das ich gestern kaufte |
| 河流、山脉、海洋、部分国名 | **der** Rhein, **die** Alpen, **die** Schweiz, **die** Türkei, **die** USA |
| 日期、季节、月份（与介词缩合） | **am** Montag, **im** Sommer, **im** Mai |
| 身体部位（代替物主冠词） | Er wäscht sich **die** Hände. |

## 与介词的缩合（Verschmelzung）

| 缩合 | 展开 | 例子 |
| --- | --- | --- |
| am / ans | an dem / an das | **am** Fenster；**ans** Fenster |
| im / ins | in dem / in das | **im** Kino；**ins** Kino |
| beim | bei dem | **beim** Arzt |
| zum / zur | zu dem / zu der | **zum** Bahnhof；**zur** Schule |
| vom | von dem | **vom** Vater |
| aufs, fürs, durchs, übers | auf das … | **aufs** Land fahren |

## 例句

1. **Der Mann, den du gesehen hast, ist mein Bruder.** — 你看见的那个男人是我哥哥。
2. **Ich gebe dem Kind das Buch.** — 我把书给那个孩子。
3. **Die Farbe des Autos ist rot.** — 这辆车的颜色是红的。
4. **Im Sommer fahren wir in die Schweiz.** — 夏天我们去瑞士。
5. **Sie geht zum Arzt, weil ihr der Kopf wehtut.** — 她去看医生，因为她头疼。
6. **Die Kinder spielen mit den Hunden im Park.** — 孩子们在公园里和狗玩。
7. **Der Rhein ist der längste Fluss Deutschlands.** — 莱茵河是德国最长的河。

## 常见错误

* ❌ *Ich gehe zu dem Schule* → ✅ **zur** Schule（缩合形式在口语中几乎是强制的）
* ❌ *Ich fahre in die Deutschland* → ✅ nach **Deutschland**（中性国名不带冠词）
* ❌ *Er wäscht seine Hände* → ✅ Er wäscht sich **die** Hände.（身体部位用定冠词 + 反身第三格）
"""),

T('冠词/不定冠词与零冠词', '不定冠词与零冠词', 'A1', """
# 不定冠词与零冠词

## 不定冠词 ein / eine

用于**第一次提到、不确定的、类别中的任意一个**。不定冠词**没有复数**——
复数时用零冠词，否定时用 keine。

| 格 | 阳性 m. | 阴性 f. | 中性 n. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| N. | **ein** | eine | **ein** | —（零冠词） |
| A. | einen | eine | **ein** | — |
| D. | einem | einer | einem | — |
| G. | eines (+ -s) | einer | eines (+ -s) | — |

注意加粗的三格：**ein 在阳性第一格和中性第一/四格没有词尾**，
这正是形容词「混合变化」要补上词尾的地方（ein **guter** Mann, ein **gutes** Kind）。

## 零冠词（Nullartikel）

| 情况 | 例子 |
| --- | --- |
| 复数的「不定」 | Ich sehe **Kinder** im Park. |
| 物质名词、抽象名词 | Ich trinke **Kaffee**. / Er hat **Angst**. |
| 职业、国籍、宗教（作表语，无形容词修饰） | Er ist **Lehrer**. / Sie ist **Deutsche**. |
| 城市名、多数国名 | Ich wohne in **Berlin**. / Er kommt aus **Japan**. |
| 固定短语、成语 | zu **Hause**, nach **Hause**, mit **Freude**, zu **Fuß** |
| 标题、告示、电报体 | **Zimmer** frei. / **Vorsicht**, Stufe! |
| 度量、材料 | ein Glas **Wasser**, ein Kilo **Reis**, aus **Holz** |

⚠ 表语带形容词时冠词回来：Er ist **ein guter** Lehrer.

## 例句

1. **Ich habe einen Hund und eine Katze.** — 我有一条狗和一只猫。
2. **Er ist Arzt, aber er ist ein sehr junger Arzt.** — 他是医生，不过是个很年轻的医生。
3. **Ich trinke morgens Kaffee, abends Tee.** — 我早上喝咖啡，晚上喝茶。
4. **Gib mir bitte ein Glas Wasser.** — 请给我一杯水。
5. **Kinder brauchen Liebe und Geduld.** — 孩子需要爱和耐心。
6. **Sie fährt mit einem Freund nach Hause.** — 她和一个朋友一起回家。
7. **Das ist der Hut eines Mannes, nicht einer Frau.** — 这是一位男士的帽子，不是女士的。

## 常见错误

* ❌ *Er ist ein Lehrer.*（无修饰语时）→ ✅ Er ist **Lehrer**.
* ❌ *Ich gehe nach dem Hause* → ✅ **nach Hause**（固定短语零冠词）
* ❌ *Ich habe eine Angst* → ✅ Ich habe **Angst**.
* ❌ 复数用 *eine*：*eine Bücher* → ✅ **Bücher** / **keine** Bücher
"""),

T('冠词/限定词与物主冠词', '限定词与物主冠词', 'A2', """
# 限定词与物主冠词（Determinative）

限定词是「冠词类」的词，站在名词前面表示性数格。按变格方式分成两大类。

## 一、der 类（跟定冠词一样变，后面形容词弱变化）

**dieser**（这个）、**jener**（那个）、**jeder**（每个）、**welcher**（哪个）、
**mancher**（有些）、**solcher**（这样的）、**alle**（所有，只复数）、**beide**（两者）

| 格 | m. | f. | n. | Pl. |
| --- | --- | --- | --- | --- |
| N. | dies**er** | dies**e** | dies**es** | dies**e** |
| A. | dies**en** | dies**e** | dies**es** | dies**e** |
| D. | dies**em** | dies**er** | dies**em** | dies**en** |
| G. | dies**es** | dies**er** | dies**es** | dies**er** |

## 二、ein 类（跟不定冠词一样变，后面形容词混合变化）

**mein, dein, sein, ihr, unser, euer, Ihr**（物主冠词）＋ **kein**

| 人称 | 物主冠词 | 例 |
| --- | --- | --- |
| ich | mein | mein Vater |
| du | dein | dein Buch |
| er / es | **sein** | seine Mutter |
| sie（她） | **ihr** | ihr Mann |
| wir | unser | unsere Stadt |
| ihr | euer（+ 词尾时省 e：**eure**） | eure Freunde |
| sie（他们） | ihr | ihre Kinder |
| Sie（您） | Ihr | Ihr Name |

| 格 | m. | f. | n. | Pl. |
| --- | --- | --- | --- | --- |
| N. | mein | mein**e** | mein | mein**e** |
| A. | mein**en** | mein**e** | mein | mein**e** |
| D. | mein**em** | mein**er** | mein**em** | mein**en** |
| G. | mein**es** | mein**er** | mein**es** | mein**er** |

**关键**：物主冠词的**词干**取决于「谁拥有」，**词尾**取决于「被拥有的东西」的性数格。
*Die Frau sucht **ihren** Mann.*（ihr- 因为拥有者是「她」，-en 因为 Mann 是阳性第四格）

## 例句

1. **Dieses Buch gehört meinem Bruder.** — 这本书是我哥哥的。
2. **Jeder Student muss diese Prüfung bestehen.** — 每个学生都必须通过这场考试。
3. **Welchen Film möchtest du sehen?** — 你想看哪部电影？
4. **Ihr Mann arbeitet bei unserer Firma.** — 她丈夫在我们公司工作。
5. **Manche Leute glauben solche Geschichten.** — 有些人相信这样的故事。
6. **Alle Kinder bekommen ihre Geschenke.** — 所有孩子都拿到了他们的礼物。
7. **Wir fahren mit unseren Freunden in eure Stadt.** — 我们和我们的朋友一起去你们的城市。

## 常见错误

* ❌ *Die Frau sucht **seinen** Mann.* → ✅ **ihren** Mann（拥有者是女性用 ihr-）
* ❌ *euere Freunde* → ✅ *eure Freunde*（euer 加词尾时中间的 e 脱落）
* ❌ *jeder Kinder* → ✅ **jedes** Kind（jeder 只用于单数）
* ❌ *alle Buch* → ✅ **alle Bücher**（alle 只用于复数）
"""),

T('形容词/比较级与最高级', '比较级与最高级', 'A2', """
# 比较级与最高级（Komparativ und Superlativ）

## 构成

| 原级 | 比较级 -er | 最高级 am …-sten / der/die/das …-ste |
| --- | --- | --- |
| schnell | schnell**er** | am schnell**sten** / der schnell**ste** |
| klein | klein**er** | am klein**sten** |
| alt | **ä**lt**er** | am **ä**lt**esten** |
| groß | größer | am **größten**（不规则） |
| gut | **besser** | am **besten** |
| viel | **mehr** | am **meisten** |
| gern | **lieber** | am **liebsten** |
| hoch | **höher** | am **höchsten** |
| nah | **näher** | am **nächsten** |

**加 -esten 的条件**：词干以 **-d, -t, -s, -ß, -z, -sch** 结尾时最高级加 **-esten**
（am ältesten, am heißesten, am hübschesten）。

## 变音

只有**主元音是 a/o/u 的单音节高频词**变音：alt–älter, jung–jünger, kalt–kälter,
lang–länger, stark–stärker, warm–wärmer, kurz–kürzer, dumm–dümmer, klug–klüger。
**不变音**：brav, klar, laut, rasch, sanft, schlank, stolz, voll, wahr, zart。

## 两种最高级形式

| 形式 | 用在哪里 | 例子 |
| --- | --- | --- |
| **am …-sten** | 作状语或表语（不带名词） | Er läuft **am schnellsten**. |
| **der/die/das …-ste** | 作定语（带名词），要变格 | Er ist **der schnellste** Läufer. |

## 比较结构

| 结构 | 含义 | 例子 |
| --- | --- | --- |
| so … **wie** | 一样 | Er ist **so groß wie** ich. |
| 比较级 + **als** | 比 | Er ist **größer als** ich. |
| **immer** + 比较级 | 越来越 | Es wird **immer kälter**. |
| **je** …, **desto/umso** … | 越……越…… | **Je** mehr ich lerne, **desto** besser verstehe ich. |
| **nicht so … wie** | 不如 | Ich bin **nicht so schnell wie** du. |

## 例句

1. **Mein Bruder ist zwei Jahre älter als ich.** — 我哥哥比我大两岁。
2. **Dieses Hotel ist so teuer wie das andere.** — 这家酒店和那家一样贵。
3. **Im Winter werden die Tage immer kürzer.** — 冬天白天越来越短。
4. **Das ist das beste Restaurant der Stadt.** — 这是全城最好的饭店。
5. **Je länger ich hier wohne, desto mehr gefällt es mir.** — 我在这儿住得越久就越喜欢。
6. **Am liebsten trinke ich Tee, lieber als Kaffee.** — 我最喜欢喝茶，比咖啡更喜欢。
7. **Der Mount Everest ist der höchste Berg der Welt.** — 珠峰是世界最高峰。

## 常见错误

* ❌ *größer **wie** ich* → ✅ größer **als** ich（比较级只能配 als；so … wie 才配 wie）
* ❌ *mehr schnell* → ✅ **schneller**（德语不用 mehr 构成比较级）
* ❌ *Er ist **am besten** Schüler* → ✅ Er ist **der beste** Schüler.（带名词要用定冠词形式并变格）
* ❌ *Je mehr, **desto** ich lerne* → ✅ Je mehr ich lerne, desto …（je 和 desto 引导的都是动词在后的从句／主句语序）
"""),

T('形容词/形容词的支配与名词化', '形容词的支配与名词化', 'B1', """
# 形容词的支配与名词化

## 一、形容词支配的格

有些形容词要求一个特定格的补足语，**位置在形容词前面**。

| 支配 | 形容词 | 例句 |
| --- | --- | --- |
| **第三格** | ähnlich, bekannt, böse, dankbar, egal, fremd, klar, leicht, möglich, nah, peinlich, treu, wichtig, überlegen | Das ist **mir** egal. 这我无所谓。 |
| **第四格**（度量） | alt, breit, dick, hoch, lang, schwer, tief, wert | Das Kind ist **einen Meter** groß. |
| **第二格**（书面） | bewusst, fähig, sicher, schuldig, verdächtig, würdig | Er ist sich **seiner Schuld** bewusst. |

## 二、形容词 + 介词（固定搭配，必须整体记）

| 搭配 | 意思 | 例句 |
| --- | --- | --- |
| stolz **auf** + A. | 为……骄傲 | Ich bin stolz **auf** dich. |
| böse **auf** + A. | 生……的气 | Sie ist böse **auf** ihren Bruder. |
| interessiert **an** + D. | 对……感兴趣 | Er ist interessiert **an** Musik. |
| zufrieden **mit** + D. | 对……满意 | Wir sind zufrieden **mit** dem Ergebnis. |
| abhängig **von** + D. | 依赖于 | Das ist abhängig **vom** Wetter. |
| bereit **zu** + D. | 准备好 | Sind Sie bereit **zum** Start? |
| verantwortlich **für** + A. | 对……负责 | Er ist verantwortlich **für** das Projekt. |
| reich **an** + D. | 富含 | Obst ist reich **an** Vitaminen. |

## 三、形容词的名词化（Substantivierung）

形容词**大写**后可直接当名词用，**词尾仍按形容词变格规则**。

| 指代 | 性 | 例子 |
| --- | --- | --- |
| 男性的人 | der | **der** Deutsch**e** / ein Deutsch**er** |
| 女性的人 | die | **die** Deutsch**e** / eine Deutsch**e** |
| 复数的人 | die | **die** Deutsch**en** / Deutsch**e** |
| 抽象事物 | das | **das** Gut**e**, **das** Neu**e**, **das** Wichtigst**e** |

固定搭配：**etwas / nichts / viel / wenig / alles** + 大写形容词：
etwas **Neues**（强变化 -es），alles **Gute**（alles 是 der 类，弱变化 -e）。

## 例句

1. **Das ist mir völlig egal.** — 这我完全无所谓。（egal + D.）
2. **Er ist sehr stolz auf seine Tochter.** — 他为女儿感到骄傲。
3. **Der Turm ist hundert Meter hoch.** — 这座塔一百米高。（第四格度量）
4. **Ein Deutscher und eine Französin sitzen im Zug.** — 一个德国男人和一个法国女人坐在火车上。
5. **Ich wünsche dir alles Gute!** — 祝你一切都好！
6. **Hast du etwas Neues gehört?** — 你听到什么新消息了吗？
7. **Die Alten und die Jungen verstehen sich nicht immer.** — 老人和年轻人并不总是互相理解。

## 常见错误

* ❌ *Ich bin interessiert **für** Musik* → ✅ interessiert **an** Musik（介词搭配不能按母语推）
* ❌ *etwas Neu* → ✅ etwas **Neues**（名词化后必须带形容词词尾并大写）
* ❌ *Er ist ein Deutsch* → ✅ Er ist **Deutscher**（无冠词时强变化 -er）
* ❌ *alles Gutes* → ✅ alles **Gute**（alles 有词尾，形容词弱变化加 -e）
"""),

T('数词/基数词与序数词', '基数词与序数词', 'A1', """
# 基数词与序数词

## 一、基数词（Kardinalzahlen）

| 数 | 词 | 数 | 词 | 数 | 词 |
| --- | --- | --- | --- | --- | --- |
| 0 | null | 11 | elf | 30 | dreißig |
| 1 | eins | 12 | zwölf | 40 | vierzig |
| 2 | zwei | 13 | dreizehn | 50 | fünfzig |
| 3 | drei | 14 | vierzehn | 60 | sechzig |
| 4 | vier | 15 | fünfzehn | 70 | siebzig |
| 5 | fünf | 16 | **sechzehn** | 80 | achtzig |
| 6 | sechs | 17 | **siebzehn** | 90 | neunzig |
| 7 | sieben | 18 | achtzehn | 100 | (ein)hundert |
| 8 | acht | 19 | neunzehn | 1000 | (ein)tausend |
| 9 | neun | 20 | zwanzig | 10⁶ | **eine Million** |
| 10 | zehn | 21 | **einundzwanzig** | 10⁹ | **eine Milliarde** |

**读法规则**：两位数**个位在前**——`einundzwanzig`（1 和 20）；
三位数从左到右读，个十位仍然倒装——`345 = dreihundertfünfundvierzig`。
21–999999 一律**连写**，Million/Milliarde 是名词，要**大写、分写、有复数**：
*zwei Millionen Menschen*。

要点：

* **eins** 单独说时带 -s；后面跟名词时用冠词形式 **ein/eine**：*ein Buch*, *einundzwanzig Bücher*。
* 电话号码、年份逐位或分段读：*1990 = neunzehnhundertneunzig*；2005 = zweitausendfünf。
* 小数点用逗号：**3,5 = drei Komma fünf**；千位分隔用点或空格：**1.000**。

## 二、序数词（Ordinalzahlen）

| 规则 | 范围 | 例子 |
| --- | --- | --- |
| 基数 + **-t** | 1.–19. | der zwei**t**e, der vier**t**e, der zehn**t**e |
| 基数 + **-st** | 20. 起 | der zwanzig**st**e, der hundert**st**e |
| 不规则 | — | 1. **der erste**；3. **der dritte**；7. **der siebte**；8. **der achte** |

序数词**必须变格**（按形容词规则）：*am **dritten** Mai*, *der **erste** Versuch*。
书写时数字后加点：**der 3. Mai**。

## 例句

1. **Ich habe zweiundvierzig Euro dabei.** — 我带了 42 欧元。
2. **Sie wohnt im dritten Stock.** — 她住在三楼（德式：第三层＝中国四楼）。
3. **Der Kurs beginnt am ersten September.** — 课程 9 月 1 日开始。
4. **Zwei Millionen Menschen leben in dieser Stadt.** — 这座城市住着两百万人。
5. **Das ist mein zweites Auto.** — 这是我的第二辆车。
6. **Er wurde neunzehnhundertneunzig geboren.** — 他 1990 年出生。
7. **Die Temperatur liegt bei drei Komma fünf Grad.** — 温度是 3.5 度。

## 常见错误

* ❌ *zwanzig-eins* → ✅ **einundzwanzig**（个位在前）
* ❌ *am erste Mai* → ✅ am **ersten** Mai（序数词要变格）
* ❌ *zwei Million* → ✅ zwei **Millionen**（Million 是名词，有复数）
* ❌ *3.5 Grad* 读成 „drei Punkt fünf" → ✅ **drei Komma fünf**
"""),

T('数词/日期钟点与度量', '日期、钟点与度量', 'A1', """
# 日期、钟点与度量

## 一、星期与月份

| 星期 | 月份 |
| --- | --- |
| der Montag, der Dienstag, der Mittwoch, der Donnerstag, der Freitag, der Samstag（南德 Sonnabend）, der Sonntag | der Januar, Februar, März, April, Mai, Juni, Juli, August, September, Oktober, November, Dezember |

用法：**am** Montag（星期）、**im** Mai（月份）、**im** Sommer（季节）、
**am** Wochenende、**in** der Nacht（例外用 in）。
副词形式小写：montags（每逢星期一）、abends、nachts。

## 二、日期

| 场合 | 写法 | 读法 |
| --- | --- | --- |
| 「今天是几号」 | Heute ist **der 3. Mai**. | der **dritte** Mai |
| 「在几号」 | **Am 3. Mai** … | am **dritten** Mai |
| 信头 | Berlin, **den 3. Mai 2024** | den dritten Mai |
| 全数字 | **03.05.2024** | 日.月.年（与英美相反！） |

## 三、钟点

| 官方（车站、广播） | 口语 |
| --- | --- |
| 13:00 dreizehn Uhr | eins / ein Uhr |
| 13:15 dreizehn Uhr fünfzehn | **Viertel nach eins** |
| 13:30 dreizehn Uhr dreißig | **halb zwei**（「半个到两点」！） |
| 13:45 dreizehn Uhr fünfundvierzig | **Viertel vor zwei** |
| 13:20 | zwanzig nach eins / **zehn vor halb zwei** |

提问：**Wie spät ist es?** / **Wie viel Uhr ist es?**；
回答时间点用 **um**：*Der Zug fährt **um** 8 Uhr.*

⚠ 最大的陷阱：**halb zwei ＝ 1:30**，不是 2:30。德语看的是「差半小时到下一个整点」。

## 四、度量与分数

| 类别 | 用法 | 例子 |
| --- | --- | --- |
| 度量单位（阳性/中性） | 数词后**用单数** | zwei **Glas** Wasser, drei **Kilo** Reis, fünf **Stück** |
| 阴性单位 | 用复数 | zwei **Flaschen** Wein, drei **Tassen** Kaffee |
| 分数 | 基数 + **-tel** | ein Drit**tel**, ein Vier**tel**, drei Vier**tel** |
| 一半 | **die Hälfte**（名词）/ **halb**（形容词） | die Hälfte des Kuchens；ein halbes Jahr |
| 倍数 | 基数 + **-mal / -fach** | drei**mal**, drei**fach** |
| 百分比 | Prozent | zwanzig **Prozent** |

## 例句

1. **Am Montag, dem 3. Mai, beginnt der Kurs.** — 课程在 5 月 3 日星期一开始。
2. **Der Zug fährt um halb acht ab.** — 火车 7:30 开。
3. **Ich trinke jeden Morgen zwei Tassen Kaffee.** — 我每天早上喝两杯咖啡。
4. **Wir haben drei Kilo Äpfel gekauft.** — 我们买了三公斤苹果。
5. **Ein Viertel der Studenten hat die Prüfung nicht bestanden.** — 四分之一的学生没通过考试。
6. **Sie war ein halbes Jahr in Deutschland.** — 她在德国待了半年。
7. **Die Miete ist um zehn Prozent gestiegen.** — 房租涨了 10%。

## 常见错误

* ❌ *halb zwei* 理解成 2:30 → ✅ 是 **1:30**
* ❌ *zwei Gläser Wasser*（当作度量时）→ ✅ zwei **Glas** Wasser（中性/阳性单位不变复数）
* ❌ *am Mai* → ✅ **im** Mai
* ❌ 日期写成 *05.03.2024* 表示 3 月 5 日 → 德语是**日在前**，5 月 3 日写作 **03.05.**
"""),

T('代词/人称代词', '人称代词', 'A1', """
# 人称代词（Personalpronomen）

## 变格表

| 第一格 N. | 第四格 A. | 第三格 D. |
| --- | --- | --- |
| ich 我 | **mich** | **mir** |
| du 你 | **dich** | **dir** |
| er 他/它(m.) | **ihn** | **ihm** |
| sie 她/它(f.) | sie | **ihr** |
| es 它(n.) | es | **ihm** |
| wir 我们 | **uns** | uns |
| ihr 你们 | **euch** | euch |
| sie 他们 | sie | **ihnen** |
| Sie 您/您们 | Sie | **Ihnen** |

第二格（meiner, deiner, seiner …）几乎只出现在少数支配第二格的动词和固定表达里
（*Ich erinnere mich **seiner**.*），日常不用。

## 三条关键规则

1. **代词的性跟着名词走，不跟着「意思」走**：
   *Wo ist **der Tisch**? – **Er** ist im Zimmer.*（不是 es）
   *Das **Mädchen** ist krank. **Es** bleibt zu Hause.*（中性）
2. **代词优先原则**：中场里只要出现代词，代词就排在名词前面；两个代词时**第四格在前**。
   *Ich gebe **dem Kind** **das Buch**.* → *Ich gebe **es** **dem Kind**.* → *Ich gebe **es ihm**.*
3. **du / ihr / Sie 的选择**：对家人、朋友、同学、儿童用 du；对多人用 ihr；
   对陌生人、公务场合用 **Sie**（永远大写，动词用复数形式）。

## 例句

1. **Kennst du ihn? – Ja, ich kenne ihn gut.** — 你认识他吗？——认识，我很熟。
2. **Kannst du mir helfen? – Natürlich helfe ich dir.** — 你能帮我吗？——当然帮你。
3. **Wo ist mein Schlüssel? – Ich habe ihn auf den Tisch gelegt.** — 我钥匙呢？——我放桌上了。
4. **Das Buch gehört mir, nicht ihm.** — 这本书是我的，不是他的。
5. **Ich schenke es ihnen zum Geburtstag.** — 我把它作为生日礼物送给他们。
6. **Wie geht es Ihnen, Herr Müller?** — 穆勒先生，您好吗？
7. **Die Suppe ist zu heiß. Sie schmeckt mir trotzdem.** — 汤太烫了，但我还是觉得好吃。

## 常见错误

* ❌ *Wo ist der Zug? – **Es** kommt gleich.* → ✅ **Er** kommt gleich.（der → er）
* ❌ *Ich gebe **ihm es*** → ✅ Ich gebe **es ihm**.（两个代词时第四格在前）
* ❌ *Ich helfe **dich*** → ✅ Ich helfe **dir**.（helfen 支配第三格）
* ❌ 用 du 称呼陌生人 → 在德国是明显的失礼；正式场合一律 **Sie**。
"""),

T('代词/物主代词', '物主代词', 'A1', """
# 物主代词（Possessivpronomen）

物主词有两种用法：作**冠词**（后面带名词）和作**代词**（独立使用，代替名词）。
词干相同，词尾不同。

## 一、作冠词（Possessivartikel）

词干由**拥有者**决定，词尾由**被拥有的名词**决定（ein 类变格）。

| 拥有者 | 词干 | 例子 |
| --- | --- | --- |
| ich | mein- | **mein** Vater, **meine** Mutter, **mein** Kind |
| du | dein- | **deinen** Bruder（阳性第四格） |
| er / es | **sein-** | **seine** Schwester |
| sie（她） | **ihr-** | **ihr** Mann |
| wir | unser- | **unserem** Lehrer |
| ihr | euer- → **eur-** | **eure** Freunde |
| sie（他们） | ihr- | **ihre** Kinder |
| Sie（您） | **Ihr-**（大写） | **Ihr** Name |

## 二、独立作代词

不带名词时，**阳性第一格和中性第一/四格要补上词尾**（强变化词尾）：

| 格 | m. | f. | n. | Pl. |
| --- | --- | --- | --- | --- |
| N. | mein**er** | meine | mein**s** | meine |
| A. | meinen | meine | mein**s** | meine |
| D. | meinem | meiner | meinem | meinen |

*Wessen Auto ist das? – Das ist **meins**.*（＝ mein Auto）
*Dein Wagen ist neu, **meiner** ist alt.*

## 三、第三种形式：der meine / der meinige（书面语）

*Dieses Buch ist **das meine**.* — 这本书是我的。（正式、略显文雅）
日常更常说：*Das Buch **gehört mir**.* 或 *Das ist **meins**.*

## 例句

1. **Mein Bruder wohnt bei seiner Freundin.** — 我哥哥住在他女朋友那里。
2. **Hast du deinen Ausweis dabei? – Ja, hier ist meiner.** — 你带证件了吗？——带了，这是我的。
3. **Ihre Eltern besuchen uns am Wochenende.** — 她的父母周末来看我们。
4. **Wir fahren mit unserem Auto, nicht mit eurem.** — 我们开我们的车，不开你们的。
5. **Ist das Ihr Mantel, Frau Meier?** — 迈尔女士，这是您的大衣吗？
6. **Sein Zimmer ist größer als meins.** — 他的房间比我的大。
7. **Die Kinder haben ihre Hausaufgaben schon gemacht.** — 孩子们已经做完他们的作业了。

## 常见错误

* ❌ *Das ist **mein**.*（独立使用）→ ✅ Das ist **meins** / **meiner** / **meine**（要补词尾）
* ❌ *Die Frau und **sein** Mann* → ✅ **ihr** Mann（拥有者是女性）
* ❌ *euere Freunde* → ✅ **eure** Freunde
* ❌ *ihr Name*（写给客户）→ 敬语必须大写：**Ihr** Name
"""),

T('代词/反身代词', '反身代词', 'A2', """
# 反身代词（Reflexivpronomen）

## 形式

| 人称 | 第四格 | 第三格 |
| --- | --- | --- |
| ich | **mich** | **mir** |
| du | **dich** | **dir** |
| er/sie/es | **sich** | **sich** |
| wir | **uns** | uns |
| ihr | **euch** | euch |
| sie/Sie | **sich** | **sich** |

只有第一、二人称单数区分第四格和第三格（mich/mir, dich/dir），
第三人称一律 **sich**。

## 什么时候用第三格？

**句子里已经有另一个第四格宾语时，反身代词就用第三格。**

| 第四格 | 第三格 |
| --- | --- |
| Ich wasche **mich**. 我洗澡。 | Ich wasche **mir** die Hände. 我洗手。 |
| Ich ziehe **mich** an. 我穿衣服。 | Ich ziehe **mir** den Mantel an. 我穿上大衣。 |
| Ich stelle **mich** vor. 我作自我介绍。 | Ich stelle **mir** das vor. 我想象一下。 |

## 位置

反身代词紧跟变位动词；如果主语是名词，可以放在主语前后：

* 主句：*Ich **freue mich** auf den Urlaub.*
* 倒装：*Heute **freue ich mich** auf den Urlaub.*
* 名词主语倒装：*Heute **freut sich** **mein Bruder**.*（sich 抢在名词主语前）
* 从句：*…, weil ich **mich** auf den Urlaub freue.*

## 常用反身动词（必须整体记）

| 反身动词 | 意思 | 例句 |
| --- | --- | --- |
| sich freuen **auf** + A. | 期待 | Ich freue mich **auf** das Wochenende. |
| sich freuen **über** + A. | 为……高兴 | Ich freue mich **über** dein Geschenk. |
| sich interessieren **für** + A. | 对……感兴趣 | Er interessiert sich **für** Politik. |
| sich erinnern **an** + A. | 记得 | Erinnerst du dich **an** mich? |
| sich beschäftigen **mit** + D. | 从事 | Sie beschäftigt sich **mit** Kunst. |
| sich bewerben **um** + A. | 申请 | Er bewirbt sich **um** die Stelle. |
| sich ärgern **über** + A. | 生气 | Ich ärgere mich **über** den Lärm. |
| sich befinden | 位于 | Das Museum befindet sich im Zentrum. |

## 相互代词 einander

复数时 sich 可能有「互相」的意思，为避免歧义可用 **einander**：
*Sie helfen **sich**.*（自己帮自己／互相帮）→ *Sie helfen **einander**.*（互相帮）
与介词连写：mit**einander**, für**einander**, von**einander**。

## 例句

1. **Ich freue mich sehr auf deinen Besuch.** — 我很期待你来访。
2. **Wasch dir bitte vor dem Essen die Hände!** — 吃饭前请洗手！
3. **Er interessiert sich nicht für Fußball.** — 他对足球不感兴趣。
4. **Setzen Sie sich bitte!** — 请坐！
5. **Wir haben uns lange nicht gesehen.** — 我们好久没见了。（相互）
6. **Kannst du dir das vorstellen?** — 你能想象吗？（第三格）
7. **Sie ärgert sich darüber, dass niemand hilft.** — 她因为没人帮忙而生气。

## 常见错误

* ❌ *Ich wasche **mich** die Hände* → ✅ Ich wasche **mir** die Hände.（已有第四格宾语）
* ❌ *Ich freue **mir*** → ✅ Ich freue **mich**（freuen 是第四格反身）
* ❌ *…, weil ich auf den Urlaub **mich** freue* → ✅ weil ich **mich** auf den Urlaub freue（反身代词尽量靠前）
* ❌ 漏掉 sich：*Ich interessiere für Musik* → ✅ Ich interessiere **mich** für Musik.
"""),

T('代词/指示代词', '指示代词', 'A2', """
# 指示代词（Demonstrativpronomen）

## 一、der / die / das 作指示代词（口语最常用）

变格与关系代词完全相同，**重读**，常代替人称代词指刚提到的人或物：

| 格 | m. | f. | n. | Pl. |
| --- | --- | --- | --- | --- |
| N. | der | die | das | die |
| A. | den | die | das | die |
| D. | dem | der | dem | **denen** |
| G. | **dessen** | **deren** | **dessen** | **deren** |

*Kennst du Herrn Meier? – **Den** kenne ich gut!* 我可太认识他了！
*Meine Schwester und **deren** Mann kommen auch.*（deren 避免 ihr 的歧义）

## 二、dieser / jener

| | 用法 | 例子 |
| --- | --- | --- |
| **dieser** | 这个（近，或指后面要说的） | **Dieses** Buch gefällt mir. |
| **jener** | 那个（远，书面语，口语少用） | in **jenen** Tagen 在那些日子里 |

口语常说 **der da / das dort** 代替 jener：*Nicht dieses, sondern **das da**.*

## 三、derselbe / der gleiche

| 词 | 含义 | 例子 |
| --- | --- | --- |
| **derselbe** | 同一个（同一实体） | Wir wohnen in **demselben** Haus. 我们住同一栋楼。 |
| **der gleiche** | 一样的（相同但不是同一个） | Wir haben **die gleichen** Schuhe. 我们的鞋一模一样。 |

derselbe 前半部分按定冠词变，后半部分按形容词弱变化变：
**des**selb**en**, **dem**selb**en**, **die**selb**e** …

## 四、solcher / derjenige

* **solch-**（这样的）：*Solche Fehler darf man nicht machen.*
  加不定冠词时：**ein solcher** Fehler ＝ **solch ein** Fehler。
* **derjenige**（那个……的），后面几乎必接关系从句：
  ***Derjenige**, der das gesagt hat, soll sich melden.*

## 例句

1. **Kennst du diesen Mann? – Den? Ja, das ist mein Nachbar.** — 你认识这个人吗？——他？认识，是我邻居。
2. **Meine Kollegin und deren Tochter kommen morgen.** — 我同事和她的女儿明天来。
3. **Wir sind im selben Jahr geboren.** — 我们同一年出生。
4. **Sie trägt die gleiche Jacke wie ich.** — 她穿的夹克和我的一样。
5. **Solche Probleme lassen sich nicht schnell lösen.** — 这样的问题不可能很快解决。
6. **Diejenigen, die schon fertig sind, dürfen gehen.** — 已经做完的人可以走了。
7. **Das ist der Freund, mit dem ich studiert habe; dessen Bruder kenne ich auch.** — 这是和我一起上学的朋友，他哥哥我也认识。

## 常见错误

* ❌ *Meine Schwester und **ihr** Mann*（若指别人的丈夫会歧义）→ 明确指前者用 **deren** Mann
* ❌ *derselbe* 与 *der gleiche* 混用 → 「同一辆车」是 **dasselbe** Auto，「一样的车」是 **das gleiche** Auto
* ❌ *ein solches* 写成 *solch eines* → ✅ **solch ein** Fehler / **ein solcher** Fehler
* ❌ 把 das 当万能指示词：*Das Mann* → ✅ **Der** Mann（指示代词也要按性变）
"""),

T('代词/不定代词', '不定代词与 man', 'B1', """
# 不定代词（Indefinitpronomen）与 man

## 一、man：泛指的「人们」

**man** 只有第一格；第四格用 **einen**，第三格用 **einem**，物主用 **sein**。
动词永远用**第三人称单数**。

| 格 | 形式 | 例子 |
| --- | --- | --- |
| N. | **man** | **Man** spricht hier Deutsch. |
| A. | **einen** | Das macht **einen** müde. |
| D. | **einem** | Das hilft **einem** nicht. |
| 物主 | **sein** | Man muss **sein** Bestes geben. |

man 是德语代替被动、代替「你/我们/大家」的万能主语：
*Wie sagt **man** das auf Deutsch?* 这个德语怎么说？

⚠ man ≠ der Mann（男人）。写作时拼错是常见的低级错误。

## 二、jemand / niemand / etwas / nichts

| 词 | 意思 | 变格 |
| --- | --- | --- |
| **jemand** | 某人 | A. jemand(en), D. jemand(em) |
| **niemand** | 没有人 | A. niemand(en), D. niemand(em) |
| **etwas** | 某物、一些 | 不变 |
| **nichts** | 什么也没有 | 不变 |

后接形容词时形容词**大写 + 强变化 -es**：
*etwas **Schönes**, nichts **Neues**, jemand **Fremdes***。

## 三、jeder / alle / einige / manche / mehrere / wenige / viele

| 词 | 用法 | 例子 |
| --- | --- | --- |
| **jeder** | 每一个（只单数） | **Jeder** Student bekommt ein Buch. |
| **alle** | 所有（只复数） | **Alle** Studenten sind da. |
| **einige** | 一些 | **Einige** Leute warten noch. |
| **manche** | 有些 | **Manche** verstehen das nicht. |
| **mehrere** | 好几个 | Ich habe **mehrere** Versuche gemacht. |
| **viele / wenige** | 许多／很少 | **Viele** kommen, **wenige** bleiben. |
| **beide** | 两者都 | **Beide** Bücher sind gut. |
| **kein** | 没有 | Ich habe **keine** Zeit. |

这些词后面的形容词多数用**强变化**（einige gut**e** Bücher），
但 alle / beide / manche 之后用**弱变化**（alle gut**en** Bücher）。

## 四、einer / keiner / welcher 独立使用

*Hast du einen Stift? – Ja, ich habe **einen**. / Nein, ich habe **keinen**.*
*Brauchst du Milch? – Ja, hast du **welche**?*（物质名词用 welch-）

## 例句

1. **Man darf hier nicht rauchen.** — 这里不许抽烟。
2. **In Deutschland isst man viel Brot.** — 在德国人们吃很多面包。
3. **Hat jemand meine Brille gesehen? – Nein, niemand.** — 有人看见我的眼镜吗？——没有。
4. **Ich habe etwas Wichtiges zu sagen.** — 我有重要的事要说。
5. **Jeder weiß das, aber niemand sagt es.** — 每个人都知道，但没人说。
6. **Einige Studenten sind gekommen, viele nicht.** — 来了一些学生，很多没来。
7. **Wenn man müde ist, hilft einem Kaffee nicht mehr.** — 人累的时候咖啡也帮不了忙了。

## 常见错误

* ❌ *Man **sind** hier freundlich* → ✅ Man **ist**（永远第三人称单数）
* ❌ *Wenn man müde ist, muss **er** schlafen* → ✅ muss **man** schlafen（同一句里必须保持 man）
* ❌ *etwas Schön* → ✅ etwas **Schönes**
* ❌ *alle Buch* → ✅ **alle Bücher**；*jede Studenten* → ✅ **jeder** Student
"""),

T('代词/疑问代词与es', '疑问代词与代词 es', 'A2', """
# 疑问代词与代词 es

## 一、wer / was 的变格

| 格 | 问人 | 问物 |
| --- | --- | --- |
| N. | **wer** 谁 | **was** 什么 |
| A. | **wen** 把谁 | was |
| D. | **wem** 给谁 | —（用 wo(r)- 复合） |
| G. | **wessen** 谁的 | — |

*<b>Wer</b> hat angerufen?* / *<b>Wen</b> hast du gesehen?* /
*<b>Wem</b> gehört das?* / *<b>Wessen</b> Auto ist das?*

## 二、welcher 与 was für ein

| 词 | 含义 | 例子 |
| --- | --- | --- |
| **welcher**（der 类变格） | 「哪一个」——在已知范围内选择 | **Welches** Buch möchtest du? |
| **was für ein**（ein 按后面的句法成分变格） | 「什么样的」——问性质 | **Was für ein** Auto fährst du? |

注意 **was für** 里的 für **不支配第四格**，冠词的格由它在句中的作用决定：
*Mit **was für einem** Auto bist du gekommen?*（mit 决定第三格）

## 三、疑问副词与 wo(r)- 复合

问介词宾语时：**问人用「介词 + wen/wem」，问物用 wo(r) + 介词**。

| 动词搭配 | 问人 | 问物 |
| --- | --- | --- |
| warten auf + A. | **Auf wen** wartest du? | **Worauf** wartest du? |
| denken an + A. | **An wen** denkst du? | **Woran** denkst du? |
| sprechen über + A. | **Über wen**? | **Worüber**? |
| Angst haben vor + D. | **Vor wem**? | **Wovor**? |

元音开头的介词插入 **r**：wo**r**auf, wo**r**an, wo**r**über, wo**r**in。

## 四、代词 es 的四种身份

| 身份 | 说明 | 例子 |
| --- | --- | --- |
| ① 真代词 | 代替中性名词 | Wo ist das Buch? – **Es** liegt dort. |
| ② 无人称主语 | 自然现象、感觉、时间 | **Es** regnet. / **Es** ist kalt. / **Es** ist drei Uhr. |
| ③ 占位主语（Vorfeld-es） | 只占前场，句子提前后消失 | **Es** kamen viele Gäste. → Viele Gäste **kamen**. |
| ④ 关联词（Korrelat） | 指向后面的从句或不定式 | **Es** freut mich, dass du kommst. |

固定搭配里的 es 不能省：*Wie geht **es** dir?* / *Ich habe **es** eilig.* /
*Es gibt …*（有）——**es gibt + 第四格**：*Hier **gibt es** einen Park.*

## 例句

1. **Wem hast du das Buch gegeben?** — 你把书给谁了？
2. **Wessen Jacke hängt da?** — 那是谁的夹克？
3. **Was für einen Wagen möchten Sie kaufen?** — 您想买什么样的车？
4. **Worauf wartest du? – Auf den Bus.** — 你在等什么？——等公交车。
5. **Es regnet seit gestern ohne Pause.** — 从昨天起一直下雨。
6. **Es gibt heute keine Milch mehr.** — 今天没有牛奶了。
7. **Es tut mir leid, dass ich zu spät komme.** — 很抱歉我来晚了。

## 常见错误

* ❌ *Auf was wartest du?*（口语可接受，书面不规范）→ ✅ **Worauf** wartest du?
* ❌ *Worauf wartest du?* 用来问人 → 问人必须用 **auf wen**
* ❌ *Hier ist ein Park* 想表达「有」→ ✅ Hier **gibt es einen** Park.（es gibt + 第四格）
* ❌ *Wie geht dir?* → ✅ Wie geht **es** dir?
"""),

T('副词/副词的种类与位置', '副词的种类与位置', 'A2', """
# 副词的种类与位置

德语副词**不变格**（这是它和形容词最大的区别），但可以有比较级
（schnell – schneller – am schnellsten）。形容词作状语时形式与副词相同：
*Er fährt **schnell**.*

## 一、按意义分类

| 类别 | 提问 | 常见词 |
| --- | --- | --- |
| 时间 temporal | Wann? Wie lange? Wie oft? | heute, gestern, morgen, jetzt, damals, bald, immer, oft, manchmal, nie, schon, noch, endlich |
| 原因 kausal | Warum? | deshalb, deswegen, darum, daher, also, folglich, trotzdem, dennoch |
| 情状 modal | Wie? | gern, sehr, kaum, fast, besonders, leider, hoffentlich, vielleicht, natürlich, wahrscheinlich |
| 地点 lokal | Wo? Wohin? Woher? | hier, dort, oben, unten, links, rechts, überall, nirgends, hin, her, dorthin, von dort |

## 二、连接性副词（Konjunktionaladverbien）

这类词**占据前场（第一位）**，因此后面直接跟变位动词——这是它们和并列连词最大的区别。

| 副词 | 意思 | 例句 |
| --- | --- | --- |
| deshalb / deswegen / darum / daher | 因此 | Es regnet, **deshalb bleibe ich** zu Hause. |
| trotzdem / dennoch | 尽管如此 | Er ist krank, **trotzdem arbeitet er**. |
| außerdem | 此外 | Es ist teuer, **außerdem ist es** hässlich. |
| sonst | 否则 | Beeil dich, **sonst kommst du** zu spät. |
| dann / danach | 然后 | Ich esse, **dann gehe ich** ins Bett. |
| jedoch / allerdings | 然而 | Das Zimmer ist klein, **jedoch ist es** hell. |

## 三、位置：TeKaMoLo

多个状语同时出现时，中场的顺序是
**te**mporal → **ka**usal → **mo**dal → **lo**kal：

*Ich fahre **morgen** **wegen der Prüfung** **mit dem Zug** **nach Köln**.*
（明天／因为考试／坐火车／去科隆）

其他位置规则：

* 句子副词（leider, hoffentlich, wahrscheinlich, vielleicht）位置靠前，通常在中场开头、代词之后：*Ich habe **leider** keine Zeit.*
* 前场只能放一个成分，任何副词都可以提到前场：*<b>Morgen</b> fahre ich nach Köln.*
* 地点状语中「方向」比「地点」更靠后：*Er geht **heute** **ins Kino**.*

## 例句

1. **Gestern war ich leider nicht zu Hause.** — 昨天我可惜不在家。
2. **Er kommt oft zu spät, deshalb ist der Chef böse.** — 他经常迟到，所以老板生气了。
3. **Wir waren müde, trotzdem sind wir noch ausgegangen.** — 我们很累，但还是出去了。
4. **Ich fahre morgen früh mit dem Auto in die Stadt.** — 我明天一早开车进城。
5. **Beeil dich, sonst verpassen wir den Zug!** — 快点，不然我们赶不上火车！
6. **Hier oben ist die Aussicht besonders schön.** — 这上面的景色特别美。
7. **Sie spricht sehr gut Deutsch, außerdem kann sie Französisch.** — 她德语说得很好，此外还会法语。

## 常见错误

* ❌ *Deshalb **ich bleibe** zu Hause* → ✅ deshalb **bleibe ich**（连接性副词占第一位，动词必须紧跟）
* ❌ *Ich fahre nach Köln morgen* → ✅ Ich fahre **morgen** nach Köln.（时间在地点前）
* ❌ 给副词加词尾：*Er fährt schnelle* → ✅ Er fährt **schnell**.
* ❌ *Er ist krank, trotzdem **er arbeitet*** → ✅ trotzdem **arbeitet er**（对比从属连词 obwohl **er arbeitet**）
"""),

T('副词/代副词da-wo', 'da- / wo- 代副词', 'B1', """
# da- / wo- 代副词（Pronominaladverbien）

德语规则：**介词后面指「物」或「事」时，不用「介词 + 代词」，而用 da(r) + 介词**；
提问同理用 **wo(r) + 介词**。指「人」时仍用普通的「介词 + 人称代词」。

| | 指人 | 指物 / 指事 |
| --- | --- | --- |
| 陈述 | mit **ihm**, für **sie**, an **ihn** | **damit**, **dafür**, **daran** |
| 提问 | **mit wem**, **für wen**, **an wen** | **womit**, **wofür**, **woran** |

元音开头的介词插入 **r**：da**r**auf, da**r**an, da**r**über, da**r**in, da**r**um,
wo**r**auf, wo**r**an, wo**r**über, wo**r**in。

## 常见形式

| 介词 | da- 形式 | wo- 形式 |
| --- | --- | --- |
| an | daran | woran |
| auf | darauf | worauf |
| aus | daraus | woraus |
| bei | dabei | wobei |
| durch | dadurch | wodurch |
| für | dafür | wofür |
| mit | damit | womit |
| nach | danach | wonach |
| über | darüber | worüber |
| um | darum | worum |
| von | davon | wovon |
| vor | davor | wovor |
| zu | dazu | wozu |

⚠ **ohne, außer, seit, gegenüber 没有 da- 形式**。

## 三种用途

1. **回指已经提到的事物**
   *Ich habe eine neue Wohnung. – Erzähl mir mehr **davon**!*
2. **前指后面的 dass 从句或不定式**（Korrelat，B1 的重点）
   *Ich freue mich **darauf**, dass du kommst.*
   *Er denkt **daran**, ein Auto zu kaufen.*
   *Wir warten **darauf**, dass es aufhört zu regnen.*
3. **提问**
   *<b>Worauf</b> wartest du? – Auf den Bus.*

## 例句

1. **Ich interessiere mich sehr dafür.** — 我对此很感兴趣。
2. **Worüber habt ihr gesprochen? – Über den neuen Chef.** — 你们聊什么了？——聊新老板。
3. **Er hat Angst davor, allein zu fliegen.** — 他害怕独自坐飞机。
4. **Denk bitte daran, das Fenster zu schließen!** — 请记得关窗户！
5. **Damit kann ich nichts anfangen.** — 这东西我用不上。
6. **Wir haben lange darüber diskutiert, ob wir umziehen sollen.** — 我们讨论了很久是否该搬家。
7. **Auf wen wartest du? – Auf meine Schwester.** — 你在等谁？——等我妹妹。（指人，不能用 worauf）

## 常见错误

* ❌ *Ich warte auf **es*** → ✅ Ich warte **darauf**.（指物必须用代副词）
* ❌ *<b>Wo</b>auf wartest du?* 用来问人 → 问人用 **auf wen**
* ❌ *Ich freue mich, dass du kommst* 里省掉 darauf——多数情况可省，但
  **erinnern an / warten auf / denken an** 等强搭配动词通常保留关联词：*Ich erinnere mich **daran**, dass …*
* ❌ *daraus* 写成 *da aus* → 代副词必须连写
"""),

T('副词/hin与her', 'hin 与 her（方向副词）', 'B1', """
# hin 与 her（方向副词）

德语对「方向」极其敏感。两个词把整个空间关系分成两半：

| 词 | 方向 | 记忆 |
| --- | --- | --- |
| **hin** | **离开说话人**（去那边） | hin ＝ 去 |
| **her** | **朝向说话人**（来这边） | her ＝ 来 |

*Komm **her**!* 过来！ *Geh **hin**!* 过去！

## 一、与 wo 结合

| 提问 | 意思 | 回答 |
| --- | --- | --- |
| **Wo?** | 在哪儿（静） | Ich bin **in** der Stadt. |
| **Wohin?** | 去哪儿（动，离开） | Ich gehe **in die** Stadt. |
| **Woher?** | 从哪儿来 | Ich komme **aus** der Stadt. |

口语里 wohin / woher 常拆开放句尾：
*<b>Wo</b> gehst du <b>hin</b>?* ＝ Wohin gehst du?
*<b>Wo</b> kommst du <b>her</b>?* ＝ Woher kommst du?

## 二、与介词结合成可分前缀

| her- | hin- | 意思 |
| --- | --- | --- |
| **herein**kommen | **hinein**gehen | 进来／进去 |
| **heraus**kommen | **hinaus**gehen | 出来／出去 |
| **herauf**kommen | **hinauf**gehen | 上来／上去 |
| **herunter**kommen | **hinunter**gehen | 下来／下去 |
| **herüber**kommen | **hinüber**gehen | 过来／过去 |
| **heran**kommen | — | 靠近 |

口语缩写：herein → **rein**，heraus → **raus**，herauf → **rauf**，
herunter → **runter**，herüber → **rüber**。
*Komm **rein**!* 进来！ *Geh **raus**!* 出去！（口语里 rein/raus 兼表两个方向）

## 三、其他常见用法

| 结构 | 意思 | 例子 |
| --- | --- | --- |
| **hin und her** | 来来回回 | Er läuft **hin und her**. |
| **hin und wieder** | 偶尔 | **Hin und wieder** rufe ich an. |
| **von … her** | 从……角度 | **Vom** Gefühl **her** ist das richtig. |
| **vor sich hin** | 自顾自地 | Er summt **vor sich hin**. |

## 例句

1. **Wo gehst du hin? – Ich gehe zum Bahnhof.** — 你去哪儿？——我去火车站。
2. **Komm bitte herein und mach die Tür zu!** — 请进来把门关上！
3. **Er ging die Treppe hinunter, und sie kam herauf.** — 他下楼，她上楼。
4. **Wo kommen Sie her? – Aus Österreich.** — 您从哪儿来？——奥地利。
5. **Das Kind lief nervös hin und her.** — 孩子紧张地走来走去。
6. **Kannst du mal kurz rüberkommen?** — 你能过来一下吗？
7. **Hin und wieder denke ich an die alte Zeit.** — 我偶尔会想起过去。

## 常见错误

* ❌ *Komm **hin**!*（叫人过来）→ ✅ Komm **her**!（朝说话人用 her）
* ❌ *Wo gehst du?* → ✅ **Wohin** gehst du? / **Wo** gehst du **hin**?
* ❌ 把 hinein/herein 用反：站在屋里叫人进来说 **herein**；站在屋外叫人进去说 **hinein**。
* ❌ *Ich gehe **in** die Stadt* 与 *Ich bin **in** der Stadt* 用同一个格 → 静三动四要分清。
"""),

T('语气词/语气小品词总论', '语气小品词总论', 'B2', """
# 语气小品词总论（Modalpartikeln）

语气小品词（也叫 Abtönungspartikeln）是德语口语的灵魂：它们**不改变句子的命题内容**，
只调整说话人的态度、预期和与听话人的关系。汉语里对应的往往是「嘛、呢、吧、啊、可」
这样的语气词，或者干脆靠语调表达。

## 五个共同特征

| 特征 | 说明 |
| --- | --- |
| ① 不变形 | 没有词形变化，也不能变级 |
| ② 位置固定 | 只出现在**中场**，通常紧跟在主语/代词之后，绝不能放在前场 |
| ③ 不重读 | 重读之后就变成了别的词类（*Komm **doch**!* 语气词 vs. *Doch!* 应答词） |
| ④ 不能单独回答问题 | 不能作为对问句的独立回答 |
| ⑤ 句型敏感 | 每个小品词只能用在特定句型里（陈述句／疑问句／命令句） |

## 一词多类

同一个词往往兼有其他词类身份，只有在中场、不重读时才是语气小品词：

| 词 | 作其他词类 | 作语气小品词 |
| --- | --- | --- |
| doch | 应答词「不，是的」 | Komm **doch** mit!（劝说） |
| ja | 应答词「是」 | Das ist **ja** toll!（惊讶） |
| mal | 数词「次」 | Warte **mal**!（缓和） |
| denn | 并列连词「因为」 | Was machst du **denn**?（关切） |
| eben / halt | 副词「刚才／正好」 | Das ist **eben** so.（认命） |
| schon | 副词「已经」 | Das wird **schon** klappen.（安慰） |
| wohl | 副词「舒服地」 | Er ist **wohl** krank.（推测） |
| eigentlich | 形容词「本来的」 | Wie heißt du **eigentlich**?（转话题） |
| ruhig | 形容词「安静的」 | Frag **ruhig**!（放心） |
| bloß / nur | 副词「只」 | Was hast du **bloß** gemacht?（不耐） |

## 句型分布速查

| 小品词 | 陈述句 | 是非问 | W- 问 | 命令句 |
| --- | --- | --- | --- | --- |
| doch | ✓ | — | ✓ | ✓ |
| ja | ✓ | — | — | ✓（警告） |
| mal | ✓ | ✓ | — | ✓ |
| denn | — | ✓ | ✓ | — |
| eben / halt | ✓ | — | — | ✓ |
| wohl | ✓ | ✓ | — | — |

## 例句（同一句话，加不同小品词，意思完全不同）

1. **Du kommst mit.** — 你一起来。（中性陈述）
2. **Du kommst doch mit?** — 你会一起来的吧？（期待肯定）
3. **Du kommst ja mit!** — 你居然要一起来！（惊讶／已知）
4. **Komm mal mit!** — 你来一下吧。（缓和的请求）
5. **Kommst du denn mit?** — 那你到底来不来？（关切、追问）
6. **Du kommst eben mit.** — 你就是得一起来。（无可奈何）
7. **Du kommst wohl mit.** — 你大概会一起来。（推测）

## 常见错误

* ❌ 把语气小品词放到前场：*<b>Doch</b> komm mit!* → ✅ Komm **doch** mit!
* ❌ 逐字翻译成汉语实词——它们大多**不该被翻译**，只该被「语气化」。
* ❌ 一句话堆三四个小品词（*Komm doch mal eben ja mit*）——最多两个，且有固定顺序（如 **doch mal**, **ja mal**, **denn eigentlich**）。
* ❌ 在正式书面语（论文、公文）里使用——它们属于口语和亲近语体。
"""),

T('语气词/doch', '语气小品词 doch', 'B2', """
# 语气小品词 doch

**doch** 是使用频率最高的语气小品词。核心含义：**与对方（或情境）的预期相反**，
说话人要「把预期扳回来」。

## 四种用法

| 句型 | 功能 | 例句 | 语气 |
| --- | --- | --- | --- |
| **命令句** | 加强、劝说（听上去更热情，不是更凶） | Komm **doch** rein! | 「进来嘛！」 |
| **陈述句** | 提醒对方一件他本该知道的事 | Du weißt **doch**, dass ich keine Zeit habe. | 「你不是知道嘛」 |
| **陈述句 + 升调** | 求证，期待对方说 ja | Du hilfst mir **doch**? | 「你会帮我的吧？」 |
| **W- 问句** | 说话人一时想不起来 | Wie hieß er **doch** gleich? | 「他到底叫什么来着？」 |
| **感叹句** | 强烈的愿望（配第二虚拟式） | Wenn er **doch** endlich käme! | 「他要是能来就好了！」 |

## doch 与 doch mal 的区别

* **doch** 单用：带一点「你怎么还不……」的催促。
* **doch mal**：把催促软化成随口的建议——这是德国人日常最常用的组合。
  *Ruf ihn **doch mal** an!* 你不如给他打个电话。
* **doch bitte**：正式而恳切。*Schicken Sie mir **doch bitte** die Unterlagen.*

## 与应答词 doch 的区别

**重读的 doch** 是应答词，用来**推翻否定问句**，可以单独成句：
*Kommst du nicht mit? – **Doch**!*（我来！）
而语气小品词 doch **不重读、不能单独成句、只能在中场**。

## 例句

1. **Setz dich doch!** — 你坐啊！（热情的邀请）
2. **Das habe ich dir doch gesagt!** — 我不是跟你说过了嘛！
3. **Du kommst doch morgen, oder?** — 你明天会来的，对吧？
4. **Frag ihn doch selbst!** — 你自己问他不就得了。
5. **Wie war doch noch mal Ihr Name?** — 您叫什么来着？
6. **Wenn ich doch mehr Zeit hätte!** — 我要是有更多时间就好了！
7. **Das ist doch nicht möglich!** — 这不可能吧！（惊讶／不接受）

## 常见错误

* ❌ 把语气小品词 doch 重读 → 会被听成应答词「不，是的」，语气完全变了。
* ❌ *<b>Doch</b> setz dich!* → ✅ Setz dich **doch**!（不能放前场）
* ❌ 在公文里写 doch → 属于口语语体。
* ❌ 用 doch 表达「但是」——那是连词 **doch/aber**，位置和重音都不同：
  *Ich wollte kommen, **doch** ich hatte keine Zeit.*（这里的 doch 是连词，可以在句首）
"""),

T('语气词/mal', '语气小品词 mal', 'B2', """
# 语气小品词 mal

**mal**（einmal 的弱化形式）核心功能是**把要求「变小」**——
让命令听起来像随口一提，让请求听起来不那么强硬。汉语常译作「一下、一下子、吧」。

## 用法

| 句型 | 功能 | 例句 |
| --- | --- | --- |
| **命令句** | 缓和命令（最常见） | Warte **mal**! 等一下！ |
| **陈述句（第一人称）** | 「我先……一下」 | Ich schaue **mal** nach. |
| **是非问句** | 试探性请求 | Kannst du **mal** kommen? |
| **和 doch 连用** | 最自然的日常建议 | Ruf ihn **doch mal** an! |
| **和 eben/kurz 连用** | 强调「很快、就一下」 | Ich gehe **mal eben** einkaufen. |

## mal 与 einmal

* **einmal**（重读）＝ 数量「一次」：*Ich war **einmal** in Berlin.*（我去过一次柏林）
* **mal**（不重读）＝ 语气小品词：*Ich war **mal** in Berlin.*（我以前去过柏林）——
  这里的 mal 表示「某个不确定的过去时间」，不是次数。

## nochmal / schon mal / erst mal

| 组合 | 意思 | 例句 |
| --- | --- | --- |
| **noch mal** | 再一次 | Sag das bitte **noch mal**. |
| **schon mal** | 曾经、先 | Warst du **schon mal** in Wien? |
| **erst mal** | 先…… | Ich muss **erst mal** duschen. |
| **nicht mal** | 连……都不 | Er hat **nicht mal** gegrüßt. |

## 例句

1. **Komm mal her!** — 你过来一下！
2. **Zeig mir mal dein Handy.** — 给我看看你的手机。
3. **Ich rufe dich später mal an.** — 我回头给你打电话。
4. **Kannst du mir mal helfen?** — 你能帮我一下吗？
5. **Probier das doch mal!** — 你试试嘛！
6. **Warst du schon mal in Deutschland?** — 你去过德国吗？
7. **Er hat nicht mal danke gesagt.** — 他连谢谢都没说。

## 常见错误

* ❌ *<b>Mal</b> komm her!* → ✅ Komm **mal** her!（不能放前场）
* ❌ 把 mal 当「次数」写在正式文本里：*Ich habe ihn mal getroffen* 在论文中应写
  **einmal** 或 **einst / früher**。
* ❌ *noch mal* 写成 *nochmal* 在正式文本里 → 正字法推荐分写 **noch mal**（nochmals 是副词）。
* ❌ 命令句不加 mal 而希望显得客气 → 德语里 *Warte!* 很生硬，*Warte **mal**!* 才自然。
"""),

T('语气词/ja', '语气小品词 ja', 'B2', """
# 语气小品词 ja

**ja** 作语气小品词有两个几乎相反的用法，靠**重音**区分。

## 一、不重读的 ja：「这是我们都知道的」

出现在**陈述句**里，表示说话人认为信息**对听话人来说是已知的、显而易见的**，
以此建立共识。汉语常译「嘛、本来就」。

*Du weißt **ja**, dass ich morgen fliege.* 你知道嘛，我明天要飞。
*Das ist **ja** nicht schlimm.* 这本来也不算什么。

## 二、重读的 ja：惊讶

出现在**感叹式的陈述句**里，表示说话人**刚刚发现**、感到意外。

*Du bist **ja** ganz nass!* 你都湿透了！
*Das ist **ja** unglaublich!* 这简直难以置信！

## 三、命令句中的 ja：严厉警告

在命令句里，**ja** 变成强烈的警告，常与 nicht 连用，语气比不加时重得多。

*Komm **ja** nicht zu spät!* 你可千万别迟到！
*Mach das **ja** nicht noch mal!* 你敢再干一次试试！

⚠ 这一点和 doch 正相反：**doch 使命令变软，ja 使命令变硬**。

## 与 doch 的组合

**ja doch**（不耐烦的应付）：*Ja doch, ich komme ja schon!* 好啦好啦，我这就来！

## 例句

1. **Wir kennen uns ja schon lange.** — 我们不是早就认识了嘛。
2. **Das Wetter ist ja furchtbar!** — 这天气也太糟了！
3. **Du hast ja recht.** — 你说得对（我承认）。
4. **Vergiss ja nicht deinen Pass!** — 你可千万别忘了护照！
5. **Er ist ja noch ein Kind.** — 他毕竟还是个孩子嘛。
6. **Da bist du ja endlich!** — 你可算来了！
7. **Sag es ihm ja nicht!** — 你可别告诉他！

## 常见错误

* ❌ 把命令句里的 ja 理解成「请」→ 它是**警告**，用错会显得很凶。
* ❌ *<b>Ja</b>, komm nicht zu spät!* 与 *Komm **ja** nicht zu spät!* 混淆——
  前者的 ja 是应答词（在前场、有逗号），后者才是语气小品词。
* ❌ 用不重读的 ja 传达新信息：ja 的前提是「听话人已知」，
  告诉对方全新的消息要用 **übrigens**（顺便说）而不是 ja。
* ❌ 在书面论述文里使用 → 属于口语。
"""),

T('语气词/denn', '语气小品词 denn', 'B2', """
# 语气小品词 denn

**denn** 作语气小品词**只出现在疑问句里**，把一个冷冰冰的问题变成
「有兴趣、有关切、承接上文」的问题。不加 denn 的问句在德语里常常显得像审问。

## 用法

| 句型 | 功能 | 例句 |
| --- | --- | --- |
| **W- 问句** | 表示关切、好奇，承接情境 | Was machst du **denn** hier? 你怎么在这儿？ |
| **是非问句** | 追问、确认 | Hast du **denn** keine Angst? 你难道不怕吗？ |
| **反问** | 表示惊讶或不满 | Bist du **denn** verrückt? 你疯了吗？ |
| **wo denn / wann denn** | 强化疑问 | Wo **denn**? 到底在哪儿？ |

## 位置

denn 在中场，**紧跟在主语（代词）之后**：
*Warum **kommst du denn** so spät?*
*Was **hat er denn** gesagt?*

## 与连词 denn 的区别

| | 词类 | 位置 | 例句 |
| --- | --- | --- | --- |
| 连词 denn（因为） | 并列连词，占位 0 | 句首（子句前），后面是**正常语序** | Ich bleibe zu Hause, **denn** ich bin krank. |
| 语气小品词 denn | Partikel | 中场，不重读 | Warum bleibst du **denn** zu Hause? |

## 语气差别演示

| 不加 denn | 加 denn |
| --- | --- |
| Was machst du hier?（可能听起来像质问「你在这干嘛」） | Was machst du **denn** hier?（惊喜「你怎么在这儿」） |
| Wie heißt du?（生硬） | Wie heißt du **denn**?（亲切，常对孩子说） |
| Hast du kein Geld?（指责） | Hast du **denn** kein Geld?（关切／惊讶） |

## 例句

1. **Wo warst du denn so lange?** — 你到底上哪儿去了这么久？
2. **Was ist denn passiert?** — 究竟出什么事了？
3. **Hast du denn schon gegessen?** — 你已经吃过了吗？
4. **Wie alt bist du denn?** — 你多大啦？（对孩子，亲切）
5. **Warum sagst du das denn nicht früher?** — 你怎么不早说呢？
6. **Ist das denn so schwer?** — 这有那么难吗？
7. **Wer hat denn angerufen?** — 是谁打的电话呀？

## 常见错误

* ❌ 把语气小品词 denn 放在句首：*<b>Denn</b> was machst du hier?* → ✅ Was machst du **denn** hier?
* ❌ 在陈述句里用作语气小品词：*Ich bin **denn** müde* → 不成立（陈述句的 denn 只能是连词）
* ❌ 连词 denn 后面用从句语序：*…, denn ich krank **bin*** → ✅ denn ich **bin** krank.（denn 是并列连词，不改变语序）
* ❌ 所有问句都加 denn → 连续追问时会显得咄咄逼人，一段对话里用一两次即可。
"""),

T('语气词/eben', '语气小品词 eben', 'B2', """
# 语气小品词 eben

**eben** 表示「事情就是这样，改变不了」——一种**认命、下结论、确认对方说法**的语气。
汉语常译「就是、本来就、可不是嘛」。

## 用法

| 句型 | 功能 | 例句 |
| --- | --- | --- |
| **陈述句** | 无可奈何的确认 | Das ist **eben** so. 事情就是这样。 |
| **陈述句** | 给出唯一的结论 | Dann müssen wir **eben** zu Fuß gehen. 那我们就只好走路了。 |
| **独立使用（重读）** | 「可不是嘛」——表示完全同意 | – Er hört nie zu. – **Eben**! |
| **命令句** | 「那就……吧」 | Dann geh **eben**! |

## 时间副词 eben ≠ 语气小品词 eben

* 时间副词 **eben**＝「刚才」（＝ gerade）：*Er ist **eben** gegangen.* 他刚走。
* 语气小品词 **eben**＝「就是这样」：*Er ist **eben** so.* 他就是这么个人。
* **mal eben**＝「一小会儿」：*Ich gehe **mal eben** zum Bäcker.*

判断方法：能替换成 gerade 的是时间副词，能替换成 nun einmal / halt 的是语气小品词。

## 例句

1. **Das Leben ist eben nicht immer gerecht.** — 生活本来就不总是公平的。
2. **Wenn du keine Zeit hast, komm eben später.** — 你要是没时间，那就晚点来吧。
3. **Er ist eben noch jung.** — 他毕竟还年轻嘛。
4. **– Das kostet viel zu viel. – Eben!** — ——太贵了。——可不是嘛！
5. **Dann kaufen wir eben ein anderes.** — 那我们就买别的吧。
6. **So ist das eben mit dem Wetter in Hamburg.** — 汉堡的天气就是这样。
7. **Ich habe eben angerufen, aber niemand war da.** — 我刚才打了电话，但没人在。（时间副词）

## 常见错误

* ❌ 把「刚才」的 eben 和语气小品词混用而不看位置和重音——
  语气小品词 **不重读**且不能提到前场；时间副词可以：*<b>Eben</b> war er noch hier.*（时间）
* ❌ *<b>Eben</b> ist das so!*（想表达「就是这样」）→ ✅ Das ist **eben** so.
* ❌ 用 eben 表达强烈情绪 → eben 的语气是**平的、认命的**；要表达不满该用 **bloß / nur**。
* ❌ 在正式书面语中使用。
"""),

T('语气词/halt', '语气小品词 halt', 'B2', """
# 语气小品词 halt

**halt** 与 **eben** 意思几乎完全相同——「就是这样、没办法」，
区别主要是**地域**和**语体**。

| | eben | halt |
| --- | --- | --- |
| 地域 | 全德通用，北德为主 | **南德、奥地利、瑞士**为主，但已扩散到全德口语 |
| 语体 | 中性口语 | 更随意、更口语化 |
| 可否独立成句 | 可以（**Eben!** ＝可不是嘛） | 一般**不能**单独成句 |
| 命令句 | 可以 | 可以 |

## 用法

| 句型 | 例句 | 意思 |
| --- | --- | --- |
| 陈述句：认命的结论 | Dann müssen wir **halt** warten. | 那我们就只好等着 |
| 陈述句：解释「本性如此」 | Er ist **halt** so. | 他就是这样的人 |
| 命令句 | Mach's **halt** selber! | 那你自己干吧 |
| 与 eben 连用（强调） | Das ist **halt eben** so. | 事情就是这样（南德） |

## 与其他词类的 halt 区分

* 名词 **der Halt**（停靠、支撑）：*Der Zug hat hier keinen **Halt**.*
* 动词 **halten** 的命令式 **Halt!**（站住！）——重读、独立成句、常有感叹号。
* 语气小品词 halt——**不重读、在中场、小写、不能单独成句**。

## 例句

1. **Das ist halt so, da kann man nichts machen.** — 事情就是这样，没辙。
2. **Wenn der Bus nicht kommt, nehmen wir halt ein Taxi.** — 公交车不来，我们就打车吧。
3. **Er redet halt gern.** — 他就是爱说话。
4. **Dann bleib halt zu Hause!** — 那你就待在家里吧！
5. **In Bayern sagt man halt „Servus".** — 在巴伐利亚人们就是说 Servus。
6. **Ich bin halt kein Morgenmensch.** — 我就是不擅长早起。
7. **Das Wetter ist halt im April immer so.** — 四月的天气本来就这样。

## 常见错误

* ❌ 把 **Halt!**（站住）和语气小品词 halt 混淆——前者重读、句首、带感叹号。
* ❌ *<b>Halt</b> ist das so* → ✅ Das ist **halt** so.
* ❌ 在北德正式场合频繁使用 halt 会带上明显的南德口音标记；写作一律避免。
* ❌ 认为 halt 有「停」的意思参与句意——作语气小品词时它完全不表达「停」。
"""),

T('介词/支配第四格的介词', '支配第四格的介词', 'A1', """
# 支配第四格的介词（Präpositionen mit Akkusativ）

只有 5 个核心成员，可以用口诀记：**durch – für – gegen – ohne – um**（「度佛根欧姆」）。
加上 **bis, entlang, wider** 共 8 个。

| 介词 | 主要含义 | 例句 |
| --- | --- | --- |
| **durch** | 穿过；通过（手段） | Wir gehen **durch den** Park. / **durch einen** Zufall 偶然地 |
| **für** | 为了；对于；（时长） | Das ist **für dich**. / **für eine** Woche |
| **gegen** | 反对；朝向；大约（时间） | Ich bin **gegen diesen** Plan. / **gegen 8 Uhr** |
| **ohne** | 没有（后面常零冠词） | **ohne** Geld；**ohne meinen** Bruder |
| **um** | 围绕；在（钟点）；差额 | **um den** Tisch；**um 8 Uhr**；**um 10 Prozent** |
| **bis** | 直到（常与另一介词连用） | **bis** Montag；**bis zum** Bahnhof |
| **entlang** | 沿着（**后置**！） | Wir gehen **den Fluss entlang**. |
| **wider** | 违背（书面） | **wider** meinen Willen |

## 三个细节

1. **bis** 单独用时后面几乎不带冠词；带冠词时要加第二个介词：
   *bis **zur** Ecke*, *bis **zum** Ende*, *bis **nach** Berlin*。
2. **entlang** 表示「沿着」时**放在名词后面**并支配第四格：
   *Er geht **die Straße entlang**.*（前置时支配第三格或第二格，罕用）
3. **ohne** 后面通常不带冠词：*ohne Auto*, *ohne Probleme*；
   但要具体所指时带：*ohne **meinen** Mantel*。

## 常见缩合

durch das → **durchs**；für das → **fürs**；um das → **ums**（口语）。

## 例句

1. **Der Zug fährt durch einen langen Tunnel.** — 火车穿过一条长隧道。
2. **Ich habe ein Geschenk für meine Mutter gekauft.** — 我给妈妈买了礼物。
3. **Wir sind gegen die neue Regel.** — 我们反对新规定。
4. **Ohne dich gehe ich nicht.** — 没有你我不去。
5. **Der Unterricht beginnt um Viertel nach acht.** — 课八点一刻开始。
6. **Bis nächsten Freitag muss die Arbeit fertig sein.** — 工作必须在下周五前完成。
7. **Sie joggt jeden Morgen den Fluss entlang.** — 她每天早上沿着河跑步。

## 常见错误

* ❌ *für **mir*** → ✅ für **mich**（这 5 个介词永远第四格，不看动静）
* ❌ *bis **dem** Bahnhof* → ✅ bis **zum** Bahnhof
* ❌ *entlang die Straße*（前置 + 第四格）→ ✅ **die Straße entlang**
* ❌ *gegen **dem** Wind* → ✅ gegen **den** Wind
"""),

T('介词/支配第三格的介词', '支配第三格的介词', 'A1', """
# 支配第三格的介词（Präpositionen mit Dativ）

核心 9 个：**aus – bei – mit – nach – seit – von – zu – gegenüber – ab**，
再加 **außer, entgegen, entsprechend, gemäß, laut, samt, zufolge**。

| 介词 | 主要含义 | 例句 |
| --- | --- | --- |
| **aus** | 来自（国家/封闭空间）；材料；原因 | **aus** China；**aus dem** Haus；**aus** Holz；**aus** Angst |
| **bei** | 在……处；在……时；附近 | **bei** meinem Onkel；**beim** Essen；**bei** München |
| **mit** | 和；用（工具） | **mit** meiner Frau；**mit dem** Bus |
| **nach** | 去（地名/方位）；之后；按照 | **nach** Berlin；**nach dem** Essen；**nach** meiner Meinung |
| **seit** | 自从（持续到现在） | **seit** drei Jahren |
| **von** | 从；来自（人）；的（代第二格）；被 | **von** Berlin；**von** meiner Mutter |
| **zu** | 到（人/机构）；在（场合）；为了 | **zum** Arzt；**zu** Weihnachten；**zum** Lernen |
| **gegenüber** | 对面（可前置可后置） | **gegenüber der** Post ＝ **der** Post **gegenüber** |
| **ab** | 从……起 | **ab** Montag；**ab** Frankfurt |
| **außer** | 除了 | **außer** mir |
| **laut / gemäß / zufolge** | 根据（公文） | **laut** dem Bericht |

## 三组必须辨析

| 对比 | 规则 | 例子 |
| --- | --- | --- |
| **aus vs. von** | 「在某地方」用 in 的，「来自」用 **aus**；用 bei 的，「来自」用 **von** | in China → **aus** China；bei Anna → **von** Anna |
| **nach vs. zu** | 地名、方位、Hause 用 **nach**；人、机构用 **zu** | **nach** Berlin / **zum** Bahnhof |
| **seit vs. ab** | seit 从过去到现在（＝since）；ab 只标起点，可以在未来（＝from … on） | **seit** 2020 / **ab** morgen |

## 常见缩合

bei dem → **beim**；von dem → **vom**；zu dem → **zum**；zu der → **zur**。

## 例句

1. **Ich komme gerade aus dem Kino.** — 我刚从电影院出来。
2. **Sie wohnt bei ihren Eltern.** — 她住在父母那里。
3. **Wir fahren mit dem Zug nach Hamburg.** — 我们坐火车去汉堡。
4. **Nach dem Essen gehen wir spazieren.** — 饭后我们去散步。
5. **Seit einem Jahr lerne ich Deutsch.** — 我学德语一年了。
6. **Das ist ein Geschenk von meiner Schwester.** — 这是我姐姐送的礼物。
7. **Ab nächster Woche arbeite ich zu Hause.** — 从下周起我在家办公。

## 常见错误

* ❌ *aus **meiner** Tante kommen*（指人）→ ✅ **von** meiner Tante
* ❌ *nach **dem** Arzt gehen* → ✅ **zum** Arzt gehen
* ❌ *seit **zwei Jahre*** → ✅ seit **zwei Jahren**（第三格复数加 -n）
* ❌ *mit **meinen** Freund* → ✅ mit **meinem** Freund
"""),

T('介词/支配第二格的介词', '支配第二格的介词', 'B1', """
# 支配第二格的介词（Präpositionen mit Genitiv）

第二格介词是**书面语的标志**。最常见的四个：**während, wegen, trotz, statt**
（口诀「wegen-trotz-während-statt」）。

## 常用清单

| 介词 | 意思 | 例句 |
| --- | --- | --- |
| **während** | 在……期间 | **während der** Ferien 在假期里 |
| **wegen** | 因为 | **wegen des** schlechten Wetters |
| **trotz** | 尽管 | **trotz des** Regens |
| **statt / anstatt** | 代替 | **statt eines** Autos |
| **innerhalb / außerhalb** | 在……之内／之外 | **innerhalb einer** Woche |
| **oberhalb / unterhalb** | 在……上方／下方 | **unterhalb des** Dorfes |
| **diesseits / jenseits** | 在……这边／那边 | **jenseits der** Grenze |
| **aufgrund / infolge** | 由于／因……的结果 | **aufgrund der** Krise |
| **anlässlich** | 值……之际 | **anlässlich des** Jubiläums |
| **hinsichtlich / bezüglich** | 关于（公文） | **bezüglich Ihrer** Anfrage |
| **mangels / mittels / seitens** | 因缺乏／借助／由……方面 | **mangels** Beweisen |
| **um … willen** | 为了……的缘故 | **um** Gottes **willen** |

## 三条实用规则

1. **口语常用第三格代替**：*wegen **dem** Wetter*（口语）／ *wegen **des** Wetters*（规范）。
   考试作文里请写第二格。
2. **人称代词特殊形式**：wegen 与代词结合成 **meinetwegen, deinetwegen, seinetwegen,
   ihretwegen, unsertwegen**（不说 *wegen mir* 的规范形式）。
3. **无冠词的单数名词后要用第三格或加冠词**：*trotz Regen**s*** 需要词尾；
   若名词无法体现第二格（如 *wegen Umbau*），规范写法是加冠词 *wegen **des** Umbaus*。

## 例句

1. **Während der Vorlesung darf man nicht telefonieren.** — 上课期间不许打电话。
2. **Wegen eines Unfalls kam der Zug zu spät.** — 由于一起事故，火车晚点了。
3. **Trotz des starken Regens sind wir spazieren gegangen.** — 尽管下大雨，我们还是去散步了。
4. **Statt eines Briefes hat er eine E-Mail geschickt.** — 他没写信，而是发了封邮件。
5. **Innerhalb weniger Minuten war alles vorbei.** — 几分钟之内一切就结束了。
6. **Aufgrund der neuen Regeln müssen wir umplanen.** — 由于新规定，我们得重新安排。
7. **Meinetwegen können wir sofort losfahren.** — 就我而言，我们可以马上出发。

## 常见错误

* ❌ *während **die** Ferien* → ✅ während **der** Ferien
* ❌ *wegen **mir***（规范书面）→ ✅ **meinetwegen**
* ❌ *trotz **dem** Regen* 在作文中 → ✅ trotz **des** Regens
* ❌ 把 während 的介词用法和连词用法混淆：介词 während **+ 第二格名词**；
  连词 während **+ 从句**（*während ich arbeite*）。
"""),

T('介词/方位介词', '方位介词（静三动四）', 'A2', """
# 方位介词（Wechselpräpositionen，静三动四）

9 个介词既可以支配第三格，也可以支配第四格：
**an, auf, hinter, in, neben, über, unter, vor, zwischen**。

| 提问 | 格 | 含义 |
| --- | --- | --- |
| **Wo?** 在哪儿 | **第三格 D.** | 位置、静止状态 |
| **Wohin?** 去哪儿 | **第四格 A.** | 方向、位移终点 |

⚠ 关键不是「动词有没有动作」，而是「这个动作**有没有跨越边界到达新位置**」：
*Ich laufe **im** Zimmer.*（在房间里跑来跑去 → D.）
*Ich laufe **ins** Zimmer.*（跑进房间 → A.）

## 九个介词的空间含义

| 介词 | 空间意象 | Wo? (D.) | Wohin? (A.) |
| --- | --- | --- | --- |
| **an** | 小接触面（竖直面、边缘） | Das Bild hängt **an der** Wand. | Ich hänge es **an die** Wand. |
| **auf** | 水平面之上 | Das Buch liegt **auf dem** Tisch. | Ich lege es **auf den** Tisch. |
| **in** | 内部 | Ich bin **in der** Schule. | Ich gehe **in die** Schule. |
| **über** | 上方（不接触）／越过 | Die Lampe hängt **über dem** Tisch. | Ich hänge sie **über den** Tisch. |
| **unter** | 下方 | Die Katze liegt **unter dem** Bett. | Sie kriecht **unter das** Bett. |
| **vor** | 前面 | Er steht **vor der** Tür. | Er stellt sich **vor die** Tür. |
| **hinter** | 后面 | Der Garten ist **hinter dem** Haus. | Er geht **hinter das** Haus. |
| **neben** | 旁边 | Sie sitzt **neben mir**. | Sie setzt sich **neben mich**. |
| **zwischen** | 两者之间 | Es steht **zwischen den** Häusern. | Er stellt es **zwischen die** Häuser. |

## 动词配对

德语用**成对的动词**强化这个区别：

| 静（不及物，弱变化，+ D.） | 动（及物，规则，+ A.） |
| --- | --- |
| liegen – lag – gelegen 躺着 | legen – legte – gelegt 放平 |
| stehen – stand – gestanden 立着 | stellen – stellte – gestellt 竖着放 |
| sitzen – saß – gesessen 坐着 | setzen – setzte – gesetzt 使坐下 |
| hängen – hing – gehangen 挂着 | hängen – hängte – gehängt 挂上 |
| stecken 插着 | stecken 插入 |

## 时间用法（一律第三格）

**an**（天/日期）：am Montag；**in**（月/年/时段）：im Mai, in einer Woche；
**vor**（之前）：vor zwei Jahren；**zwischen**：zwischen 8 und 9 Uhr。

## 例句

1. **Das Auto steht vor dem Haus.** — 车停在房子前面。
2. **Stell das Auto bitte vor das Haus!** — 请把车停到房子前面！
3. **Die Kinder spielen im Garten.** — 孩子们在花园里玩。
4. **Die Kinder laufen in den Garten.** — 孩子们跑进花园。
5. **Der Schlüssel liegt zwischen den Büchern.** — 钥匙在书中间。
6. **Häng den Mantel bitte an die Tür.** — 请把大衣挂到门上。
7. **Am Montag fahren wir in die Berge.** — 星期一我们去山里。

## 常见错误

* ❌ *Ich gehe **in der** Schule*（想说「去学校」）→ ✅ **in die** Schule
* ❌ *Ich lege das Buch **auf dem** Tisch* → ✅ **auf den** Tisch（legen 是方向动词）
* ❌ 混用 liegen/legen：*Ich **liege** das Buch auf den Tisch* → ✅ **lege**
* ❌ 把「跑步」一律当动作用第四格：*Ich jogge **in den** Park*（每天在公园里跑）→ ✅ **im** Park
"""),

T('介词/介词与冠词的缩合', '介词与冠词的缩合', 'A1', """
# 介词与冠词的缩合（Verschmelzung）

德语里介词常与定冠词合并成一个词。有些是**强制的**，有些只是口语习惯。

## 常用缩合表

| 介词 + 冠词 | 缩合形式 | 例子 | 强制性 |
| --- | --- | --- | --- |
| an + dem | **am** | **am** Fenster, **am** Montag | 强制 |
| an + das | **ans** | **ans** Meer fahren | 强制 |
| in + dem | **im** | **im** Kino, **im** Mai | 强制 |
| in + das | **ins** | **ins** Kino gehen | 强制 |
| bei + dem | **beim** | **beim** Arzt, **beim** Essen | 强制 |
| von + dem | **vom** | **vom** Bahnhof | 强制 |
| zu + dem | **zum** | **zum** Arzt | 强制 |
| zu + der | **zur** | **zur** Schule | 强制 |
| auf + das | **aufs** | **aufs** Land | 口语 |
| für + das | **fürs** | **fürs** Erste | 口语 |
| durch + das | **durchs** | **durchs** Fenster | 口语 |
| um + das | **ums** | **ums** Leben kommen | 口语 |
| über + das | **übers** | **übers** Wochenende | 口语 |
| unter + dem | **unterm** | **unterm** Tisch | 口语 |
| vor + dem | **vorm** | **vorm** Haus | 口语 |
| hinter + dem | **hinterm** | **hinterm** Haus | 口语 |

## 什么时候不能缩合？

当定冠词被**强调**、或后面跟着**关系从句/指示意义**时，必须拆开：

* *Ich gehe **in das** Kino, das neu eröffnet hat.* 我去那家新开的电影院。
* *Nicht in dieses, sondern **in das** andere Zimmer!* 不是这间，是那间！
* *Er sitzt **auf dem** Stuhl, den ich gekauft habe.*

## 固定短语中的缩合

**am besten**（最好）、**im Allgemeinen**（一般来说）、**zum Beispiel**（例如）、
**zur Zeit**（目前）、**beim Frühstück**（早餐时）、**ums Leben kommen**（丧生）、
**aufs Ganze gehen**（孤注一掷）。

## 例句

1. **Ich gehe heute Abend ins Theater.** — 我今晚去剧院。
2. **Am Wochenende bleiben wir im Hotel.** — 周末我们待在酒店。
3. **Sie fährt zur Arbeit und kommt erst am Abend zurück.** — 她去上班，晚上才回来。
4. **Beim Kochen höre ich immer Musik.** — 做饭的时候我总听音乐。
5. **Er kommt gerade vom Arzt.** — 他刚从医生那儿回来。
6. **Wir fahren übers Wochenende ans Meer.** — 我们周末去海边。
7. **Ich gehe in das Zimmer, in dem er wartet.** — 我进他等着的那个房间。（不缩合）

## 常见错误

* ❌ *Ich gehe zu dem Schule* → ✅ **zur** Schule（强制缩合）
* ❌ *in dem Mai* → ✅ **im** Mai
* ❌ 把口语缩合写进正式文本：*Er steht **vorm** Haus* 在作文中宜写 **vor dem** Haus。
* ❌ 该拆不拆：*Ich gehe **ins** Kino, das neu ist* → ✅ **in das** Kino, das neu ist.
"""),

T('介词/介词搭配', '动词、形容词与名词的介词搭配', 'B1', """
# 动词、形容词与名词的介词搭配

德语中大量动词、形容词、名词与**固定的介词**搭配，而且介词还规定了**格**。
这类搭配无法推导，只能整体记忆——但记的时候要连「介词 + 格」一起记。

## 一、动词 + 介词（最高频 24 组）

| 搭配 | 意思 | 例句 |
| --- | --- | --- |
| warten **auf** + A. | 等待 | Ich warte **auf** den Bus. |
| sich freuen **auf** + A. | 期待 | Ich freue mich **auf** den Urlaub. |
| sich freuen **über** + A. | 为……高兴 | Sie freut sich **über** das Geschenk. |
| denken **an** + A. | 想到 | Denk **an** mich! |
| sich erinnern **an** + A. | 记得 | Ich erinnere mich **an** dich. |
| glauben **an** + A. | 相信 | Er glaubt **an** Gott. |
| sich interessieren **für** + A. | 感兴趣 | Ich interessiere mich **für** Kunst. |
| sorgen **für** + A. | 照料 | Sie sorgt **für** die Kinder. |
| sich bewerben **um** + A. | 申请 | Er bewirbt sich **um** die Stelle. |
| bitten **um** + A. | 请求 | Ich bitte **um** Hilfe. |
| sich kümmern **um** + A. | 操心 | Wer kümmert sich **um** den Hund? |
| sprechen **über** + A. | 谈论 | Wir sprechen **über** Politik. |
| sich ärgern **über** + A. | 生气 | Er ärgert sich **über** den Lärm. |
| sich beschweren **über** + A. | 投诉 | Sie beschwert sich **über** das Essen. |
| anfangen / beginnen **mit** + D. | 开始 | Wir fangen **mit** der Arbeit an. |
| aufhören **mit** + D. | 停止 | Hör **mit** dem Rauchen auf! |
| sich beschäftigen **mit** + D. | 从事 | Er beschäftigt sich **mit** Physik. |
| rechnen **mit** + D. | 预计 | Wir rechnen **mit** Regen. |
| fragen **nach** + D. | 打听 | Er fragt **nach** dem Weg. |
| suchen **nach** + D. | 寻找 | Sie sucht **nach** ihrer Brille. |
| Angst haben **vor** + D. | 害怕 | Ich habe Angst **vor** Hunden. |
| schützen **vor** + D. | 保护免受 | Das schützt **vor** Kälte. |
| gehören **zu** + D. | 属于 | Das gehört **zu** meinen Aufgaben. |
| teilnehmen **an** + D. | 参加 | Sie nimmt **an** dem Kurs teil. |

## 二、形容词 + 介词

stolz **auf** + A.｜böse **auf** + A.｜interessiert **an** + D.｜
zufrieden **mit** + D.｜abhängig **von** + D.｜bereit **zu** + D.｜
verantwortlich **für** + A.｜typisch **für** + A.｜reich **an** + D.

## 三、名词 + 介词（多与同源动词一致）

die Angst **vor** + D.｜die Freude **über/auf** + A.｜das Interesse **an** + D.｜
die Frage **nach** + D.｜die Antwort **auf** + A.｜der Grund **für** + A.｜
die Lust **auf** + A.｜die Hoffnung **auf** + A.

## 四、和 da-/wo- 复合词配套

指事物用代副词，接从句时用关联词：
*Ich warte **darauf**, dass er kommt.* / *<b>Worauf</b> wartest du?*

## 例句

1. **Wir warten seit einer Stunde auf den Zug.** — 我们等火车等了一小时。
2. **Erinnerst du dich noch an unseren Lehrer?** — 你还记得我们老师吗？
3. **Er hat sich über die schlechte Note geärgert.** — 他为糟糕的分数生气。
4. **Sie beschäftigt sich seit Jahren mit chinesischer Literatur.** — 她多年从事中国文学研究。
5. **Ich habe große Angst vor der Prüfung.** — 我很怕这场考试。
6. **Der Erfolg hängt vom Wetter ab.** — 成功取决于天气。
7. **Vielen Dank für Ihre Antwort auf meine Frage.** — 谢谢您对我问题的答复。

## 常见错误

* ❌ *Ich warte **für** dich*（英语干扰）→ ✅ Ich warte **auf** dich.
* ❌ *Ich denke **über** dich*（英语 think about）→ ✅ Ich denke **an** dich.
* ❌ *sich freuen auf* 与 *sich freuen über* 混用：**auf ＝ 未来**，**über ＝ 已发生**。
* ❌ 记住了介词却忘了格：*warten auf **dem** Bus* → ✅ auf **den** Bus（auf 在这里是抽象用法，一律第四格）。
"""),

T('连词/并列连词', '并列连词', 'A1', """
# 并列连词（Nebenordnende Konjunktionen）

并列连词连接两个**地位平等**的句子或成分。最重要的特点：
**它们不占句子位置（位置 0），因此后面的语序完全不变**。

## 五个核心：ADUSO

| 缩写 | 连词 | 意思 | 例句 |
| --- | --- | --- | --- |
| **A** | aber | 但是 | Ich bin müde, **aber ich komme** mit. |
| **D** | denn | 因为 | Ich bleibe zu Hause, **denn ich bin** krank. |
| **U** | und | 和 | Er kommt, **und sie geht**. |
| **S** | sondern | 而是（前面必须有否定） | Nicht heute, **sondern morgen**. |
| **O** | oder | 或者 | Kommst du, **oder bleibst du**? |

记忆口诀 **ADUSO**：这五个词后面**动词不移到句尾，也不占第一位**。

## 与连接性副词的关键区别

| 类型 | 位置 | 后面的语序 | 例句 |
| --- | --- | --- | --- |
| 并列连词（aber, denn, und, sondern, oder） | 位置 **0** | 主语 + 动词（正常） | …, **denn** **ich bin** krank. |
| 连接性副词（deshalb, trotzdem, dann, außerdem） | 位置 **1**（前场） | 动词 + 主语（倒装） | …, **deshalb** **bin ich** zu Hause. |
| 从属连词（weil, obwohl, dass） | 引导从句 | 动词到**句尾** | …, **weil** ich krank **bin**. |

同样一句「我病了所以待在家」，三种写法：

* *Ich bleibe zu Hause, **denn** ich **bin** krank.*
* *Ich **bin** krank, **deshalb** **bleibe ich** zu Hause.*
* *Ich bleibe zu Hause, **weil** ich krank **bin**.*

## sondern vs. aber

**sondern** 用于「不是 A，而是 B」——前一分句**必须有否定词**，
且 A、B 互相排斥：*Er ist nicht Arzt, **sondern** Lehrer.*
**aber** 表示单纯的转折，前面有没有否定都行：
*Er ist nicht reich, **aber** (er ist) glücklich.*

## 省略与逗号

* und / oder 连接的两句主语相同时可省略第二个主语：
  *Er kam **und** setzte sich.*（此时 und 前**不加**逗号）
* aber, sondern, denn 前面**一律加逗号**。

## 例句

1. **Ich lerne Deutsch, und mein Bruder lernt Französisch.** — 我学德语，我弟弟学法语。
2. **Er wollte kommen, aber er hatte keine Zeit.** — 他本想来，可是没时间。
3. **Wir gehen nicht ins Kino, sondern ins Theater.** — 我们不去电影院，去剧院。
4. **Beeil dich, oder wir verpassen den Bus!** — 快点，不然我们赶不上公交！
5. **Ich mache das Fenster zu, denn es ist kalt.** — 我把窗关上，因为很冷。
6. **Sie stand auf und ging zur Tür.** — 她站起来走向门口。
7. **Das ist nicht mein Problem, sondern deins.** — 这不是我的问题，是你的。

## 常见错误

* ❌ *…, denn ich krank **bin*** → ✅ denn ich **bin** krank.（denn 不是从属连词！）
* ❌ *…, weil ich **bin** krank* → ✅ weil ich krank **bin**.
* ❌ 用 aber 代替 sondern：*Nicht heute, **aber** morgen* → ✅ **sondern** morgen
* ❌ *Deshalb **ich bleibe** zu Hause* → ✅ Deshalb **bleibe ich** zu Hause.
"""),

T('连词/从属连词总表', '从属连词总表', 'A2', """
# 从属连词总表（Subjunktionen）

从属连词引导**从句**，最重要的后果是：**变位动词移到从句最后一位**。

*Ich komme nicht, **weil** ich keine Zeit **habe**.*

## 按语义分类的全表

| 类别 | 连词 | 意思 | 例句 |
| --- | --- | --- | --- |
| **原因** | weil, da | 因为 | Ich bleibe, **weil** es regnet. |
| **结果** | so dass / sodass, so … dass | 以至于 | Es regnete, **sodass** wir blieben. |
| **让步** | obwohl, obgleich, obschon, wenngleich | 虽然 | **Obwohl** er krank ist, arbeitet er. |
| **条件** | wenn, falls, sofern | 如果 | **Wenn** du kommst, freue ich mich. |
| **目的** | damit | 为了 | Ich spare, **damit** ich reisen kann. |
| **时间：同时** | während, solange, wenn（反复）, als（一次性过去） | 当……时 | **Als** ich klein war, … |
| **时间：先后** | nachdem, sobald, seit(dem), bevor, ehe, bis | 在……之后／之前 | **Nachdem** er gegessen hatte, ging er. |
| **方式** | indem, dadurch dass, ohne dass, (an)statt dass | 通过、不…… | **Indem** man übt, lernt man. |
| **比较** | wie, als, als ob, je … desto | 像、比、好像 | Er tut so, **als ob** er schliefe. |
| **限定** | soweit, soviel, außer dass | 就……而言 | **Soweit** ich weiß, … |
| **宾语/主语从句** | dass, ob | （引导内容） | Ich weiß, **dass** er kommt. |
| **关系** | der/die/das, wer, was, wo | （引导关系从句） | der Mann, **der** dort steht |

## 三条通用规则

1. **动词到句尾**：从句的变位动词永远在最后。
   带情态动词或完成时的从句，**助动词在最后**：
   *…, weil ich nicht kommen **kann**.* / *…, weil ich gearbeitet **habe**.*
   例外：**双不定式**结构中助动词提到两个不定式之前：
   *…, weil ich nicht **habe** kommen können.*
2. **可以前置**：从句放在主句前面时，整个从句算作前场的一个成分，
   所以主句要倒装（动词紧跟从句）：
   ***Weil** es regnet, **bleibe ich** zu Hause.*（动词碰动词，中间只隔一个逗号）
3. **逗号强制**：德语的从句**必须**用逗号与主句隔开（与英语不同）。

## 高频辨析

| 对比 | 区别 |
| --- | --- |
| **als vs. wenn** | als ＝ 过去**一次性**事件；wenn ＝ 现在/将来，或过去**反复** |
| **weil vs. da vs. denn** | weil 强调新信息（可回答 warum）；da 强调已知原因，多前置；denn 是并列连词 |
| **damit vs. um … zu** | 主语不同用 **damit**；主语相同两者皆可，口语偏好 **um … zu** |
| **bevor vs. nachdem** | 时态配合：nachdem 用「前一时态」（Plusquamperfekt + Präteritum） |
| **wenn vs. falls** | falls 强调可能性较低、更书面 |

## 例句

1. **Ich rufe dich an, sobald ich zu Hause bin.** — 我一到家就给你打电话。
2. **Obwohl es sehr kalt war, sind wir schwimmen gegangen.** — 虽然很冷，我们还是去游泳了。
3. **Damit alle mitkommen können, nehmen wir zwei Autos.** — 为了让大家都能来，我们开两辆车。
4. **Nachdem er gegessen hatte, ging er sofort ins Bett.** — 他吃完饭就直接睡了。
5. **Indem man Fehler macht, lernt man am meisten.** — 人是在犯错中学得最多的。
6. **Ich weiß nicht, ob er heute kommt.** — 我不知道他今天来不来。
7. **Soweit ich weiß, ist das Büro morgen geschlossen.** — 据我所知，办公室明天关门。

## 常见错误

* ❌ *…, weil ich **habe** keine Zeit* → ✅ weil ich keine Zeit **habe**
* ❌ *Weil es regnet, **ich bleibe** zu Hause* → ✅ **bleibe ich** zu Hause
* ❌ 从句前漏逗号（受英语影响）→ 德语的 dass/weil/wenn 从句前**必须**有逗号
* ❌ *Als ich ein Kind war* 与 *Wenn ich ein Kind war* 混用 → 过去一次性用 **als**
"""),

T('连词/时间从句连词', '时间从句连词', 'B1', """
# 时间从句连词（Temporale Nebensätze）

时间从句是德语从句里最讲究**时态配合**的一类。

## 全表

| 连词 | 意思 | 时间关系 | 例句 |
| --- | --- | --- | --- |
| **als** | 当……时（过去**一次性**） | 同时／点 | **Als** ich in Berlin **war**, besuchte ich das Museum. |
| **wenn** | 当……时（现在/将来；过去**反复**） | 同时／反复 | **Wenn** ich Zeit habe, lese ich. / Immer **wenn** er kam, … |
| **während** | 在……期间 | 同时（持续） | **Während** ich koche, hört sie Musik. |
| **solange** | 只要、在……期间 | 同时（同长度） | **Solange** es regnet, bleiben wir hier. |
| **sooft** | 每当 | 反复 | **Sooft** er kommt, bringt er Blumen. |
| **bevor / ehe** | 在……之前 | 从句在后 | **Bevor** ich gehe, räume ich auf. |
| **nachdem** | 在……之后 | 从句在前 | **Nachdem** er gegessen **hatte**, ging er. |
| **sobald** | 一……就 | 紧接 | **Sobald** ich ankomme, rufe ich an. |
| **seit / seitdem** | 自从 | 起点 | **Seitdem** er hier wohnt, ist alles anders. |
| **bis** | 直到 | 终点 | Warte, **bis** ich fertig bin. |

## nachdem 的时态配合（考试必考）

从句的动作**先发生**，所以从句要用「前一个时态」：

| 主句 | 从句（nachdem） |
| --- | --- |
| 现在时 / 将来 | **现在完成时** |
| 过去时 | **过去完成时** |

* *<b>Nachdem</b> ich **gegessen habe**, gehe ich spazieren.*
* *<b>Nachdem</b> ich **gegessen hatte**, ging ich spazieren.*

**bevor** 相反：主从句一般用**同一时态**。
*<b>Bevor</b> ich **gehe**, räume ich auf.*

## als vs. wenn（最高频错误）

| | 用 als | 用 wenn |
| --- | --- | --- |
| 过去 + 一次性 | ✓ **Als** ich 18 wurde, … | ✗ |
| 过去 + 反复 | ✗ | ✓ (Immer) **wenn** ich klein war, … |
| 现在 / 将来 | ✗ | ✓ **Wenn** ich Zeit habe, … |

口诀：**「过去一次用 als，其余全用 wenn」**。
（wann 只用于**疑问**和**间接疑问**：*Ich weiß nicht, **wann** er kommt.*）

## 例句

1. **Als ich gestern nach Hause kam, war niemand da.** — 昨天我回家时没人在。
2. **Wenn ich müde bin, trinke ich einen Kaffee.** — 我累的时候会喝杯咖啡。
3. **Während sie telefonierte, kochte er das Essen.** — 她打电话的时候他在做饭。
4. **Nachdem wir gegessen hatten, spielten wir Karten.** — 我们吃完饭后打牌。
5. **Bevor du gehst, schließ bitte das Fenster.** — 你走之前请把窗户关上。
6. **Sobald der Film zu Ende ist, gehen wir.** — 电影一结束我们就走。
7. **Seitdem er in München wohnt, sehen wir uns selten.** — 自从他住在慕尼黑，我们很少见面。

## 常见错误

* ❌ *<b>Wenn</b> ich gestern nach Hause kam …* → ✅ **Als**（过去一次性）
* ❌ *<b>Wann</b> ich Zeit habe, lese ich.* → ✅ **Wenn**（wann 只用于疑问）
* ❌ *Nachdem ich **esse**, gehe ich* → ✅ Nachdem ich **gegessen habe**
* ❌ *Bis ich fertig **bin nicht**, warte* → ✅ Warte, **bis** ich fertig **bin**.
"""),

T('连词/原因结果与目的', '原因、结果与目的从句', 'A2', """
# 原因、结果与目的从句

## 一、原因（Kausal）

| 手段 | 词类 | 语序 | 例句 |
| --- | --- | --- | --- |
| **weil** | 从属连词 | 动词到句尾 | Ich komme nicht, **weil** ich krank **bin**. |
| **da** | 从属连词（书面，多前置，原因为已知） | 动词到句尾 | **Da** es regnet, bleiben wir zu Hause. |
| **denn** | 并列连词 | 语序不变 | Ich komme nicht, **denn** ich **bin** krank. |
| **wegen** + G. | 介词 | 名词结构 | **Wegen** der Krankheit komme ich nicht. |
| **deshalb / deswegen / darum / daher** | 连接性副词 | 倒装 | Ich bin krank, **deshalb komme ich** nicht. |
| **nämlich** | 副词（不能在句首！） | 中场 | Ich komme nicht; ich bin **nämlich** krank. |

**weil vs. da**：weil 提供**新信息**，能回答 warum，可放句末；
da 表示**双方已知**的原因，习惯放句首。

## 二、结果（Konsekutiv）

| 结构 | 例句 |
| --- | --- |
| **so dass / sodass** + 从句 | Er sprach leise, **sodass** ihn niemand verstand. |
| **so + 形容词 + dass** | Er sprach **so** leise, **dass** ihn niemand verstand. |
| **solch- + 名词 + dass** | Es war **solch ein** Lärm, **dass** wir nichts hörten. |
| **zu + 形容词 + um … zu**（否定结果） | Er ist **zu** jung, **um** allein **zu** reisen. |

## 三、目的（Final）

| 结构 | 条件 | 例句 |
| --- | --- | --- |
| **damit** + 从句 | 主从句**主语不同**（相同也可以） | Ich erkläre es noch mal, **damit** **du** es verstehst. |
| **um … zu** + 不定式 | 主从句**主语必须相同** | Ich lerne Deutsch, **um** in Berlin **zu studieren**. |
| **zu / für** + 名词 | 名词化 | Ich lerne Deutsch **für** mein Studium. |

⚠ **um … zu 的隐含主语必须等于主句主语**：
✗ *Ich erkläre es, **um** du es verstehst.* → ✓ **damit** du es verstehst.

另外，主句里有 **wollen / möchten** 时不能再用 um … zu 表目的（意思重复）：
✗ *Ich will nach Berlin fahren, um zu studieren wollen.*

## 例句

1. **Ich gehe früh ins Bett, weil ich morgen früh aufstehen muss.** — 我早睡，因为明天要早起。
2. **Da du schon hier bist, können wir gleich anfangen.** — 既然你已经来了，我们可以马上开始。
3. **Es hat stark geregnet, deshalb ist die Straße nass.** — 下大雨了，所以路是湿的。
4. **Der Film war so langweilig, dass ich eingeschlafen bin.** — 电影太无聊了，我睡着了。
5. **Ich spare Geld, um mir ein Auto zu kaufen.** — 我攒钱是为了买辆车。
6. **Ich schreibe es auf, damit du es nicht vergisst.** — 我写下来，好让你别忘了。
7. **Wegen des Streiks fahren heute keine Züge.** — 由于罢工，今天没有火车。

## 常见错误

* ❌ *…, weil ich **bin** krank* → ✅ weil ich krank **bin**
* ❌ *<b>Nämlich</b> ich bin krank* → ✅ Ich bin **nämlich** krank.（nämlich 不能在句首）
* ❌ *Ich lerne Deutsch, **um** ich in Berlin studiere* → ✅ **um** in Berlin **zu studieren**
* ❌ *Ich erkläre es, **um** du es verstehst* → ✅ **damit** du es verstehst.（主语不同必须用 damit）
"""),

T('连词/让步与对比', '让步与对比从句', 'B1', """
# 让步与对比从句

## 一、让步（Konzessiv）：「虽然……但是」

| 手段 | 词类 | 语序 | 例句 |
| --- | --- | --- | --- |
| **obwohl / obgleich / obschon** | 从属连词 | 动词到句尾 | **Obwohl** es regnet, gehen wir spazieren. |
| **wenn … auch** | 从属连词 | 动词到句尾 | **Wenn** es **auch** regnet, … |
| **trotzdem / dennoch** | 连接性副词 | 倒装 | Es regnet; **trotzdem gehen wir** spazieren. |
| **aber / doch** | 并列连词 | 语序不变 | Es regnet, **aber wir gehen** spazieren. |
| **trotz** + G. | 介词 | 名词结构 | **Trotz** des Regens gehen wir spazieren. |
| **zwar …, aber …** | 关联结构 | — | Es regnet **zwar**, **aber** wir gehen trotzdem. |

⚠ **obwohl（从句）** 和 **trotzdem（副词）** 不能连用于同一层：
✗ *<b>Obwohl</b> es regnet, **trotzdem** gehen wir.* → 选一个即可。

## 二、无条件让步：「无论……都」

| 结构 | 例句 |
| --- | --- |
| **wer / was / wo / wann + auch (immer)** | **Was** du **auch** sagst, ich glaube dir nicht. |
| **egal, ob / wer / was** | **Egal, ob** es regnet, wir fahren. |
| **wie + 形容词 + auch** | **Wie** schwer es **auch** ist, ich schaffe es. |
| **ob … oder** | **Ob** du willst **oder** nicht, du musst mit. |

## 三、对比（Adversativ）：「而……」

| 手段 | 例句 |
| --- | --- |
| **während**（对比义） | **Während** mein Bruder gern liest, sehe ich lieber fern. |
| **wohingegen / hingegen** | Er arbeitet viel, sie **hingegen** ruht sich aus. |
| **dagegen** | Der Sommer war heiß, der Herbst **dagegen** kühl. |
| **(je)doch / allerdings** | Das Hotel ist gut, **allerdings** ziemlich teuer. |
| **anstatt dass / anstatt … zu** | **Anstatt zu** arbeiten, spielt er. |

⚠ **während** 有两个意思：时间「当……时」和对比「而……」，靠上下文区分。

## 例句

1. **Obwohl er müde war, hat er weitergearbeitet.** — 虽然他累了，还是继续工作。
2. **Es war kalt; trotzdem sind wir schwimmen gegangen.** — 天很冷，我们还是去游泳了。
3. **Trotz seiner Krankheit kam er zur Arbeit.** — 尽管生着病，他还是来上班了。
4. **Was du auch sagst, ich ändere meine Meinung nicht.** — 不管你说什么，我都不改主意。
5. **Während meine Schwester gern kocht, esse ich lieber auswärts.** — 我姐姐爱做饭，而我更爱在外面吃。
6. **Er ist zwar jung, aber sehr erfahren.** — 他虽然年轻，却很有经验。
7. **Anstatt zu lernen, hat er den ganzen Tag gespielt.** — 他一整天没学习，光在玩。

## 常见错误

* ❌ *<b>Obwohl</b> es regnet, **trotzdem** gehen wir* → 二选一
* ❌ *Trotzdem es regnet, gehen wir*（把 trotzdem 当连词）→ ✅ **Obwohl** es regnet, …
* ❌ *…, obwohl er müde **war** nicht* → 语序：obwohl er **nicht** müde **war**
* ❌ *trotz **dem** Regen*（作文中）→ ✅ **trotz des Regens**
"""),

T('连词/双重连词', '双重连词', 'B1', """
# 双重连词（zweiteilige Konnektoren）

双重连词由两部分组成，把两个成分或两个句子对举起来。它们**本身不改变语序**，
但每一部分的位置有讲究。

## 全表

| 连词 | 意思 | 例句 |
| --- | --- | --- |
| **sowohl … als auch** | 既……又…… | Er spricht **sowohl** Englisch **als auch** Französisch. |
| **nicht nur …, sondern auch** | 不但……而且 | Sie ist **nicht nur** klug, **sondern auch** fleißig. |
| **weder … noch** | 既不……也不（本身含否定！） | Ich habe **weder** Zeit **noch** Lust. |
| **entweder … oder** | 要么……要么 | **Entweder** du kommst mit, **oder** du bleibst hier. |
| **zwar …, aber** | 虽然……但是 | Das Auto ist **zwar** alt, **aber** es fährt gut. |
| **einerseits …, andererseits** | 一方面……另一方面 | **Einerseits** will ich reisen, **andererseits** fehlt mir das Geld. |
| **je …, desto/umso** | 越……越…… | **Je** mehr ich übe, **desto** besser werde ich. |
| **teils …, teils** | 部分……部分 | Das Wetter war **teils** sonnig, **teils** bewölkt. |
| **erstens …, zweitens** | 第一……第二 | **Erstens** ist es teuer, **zweitens** ist es weit. |
| **nicht …, sondern** | 不是……而是 | Wir fahren **nicht** heute, **sondern** morgen. |

## 三个必须注意的语序

1. **weder … noch 已经是否定，不能再加 nicht/kein**：
   ✓ *Ich habe **weder** Geld **noch** Zeit.*
   ✗ *Ich habe **weder kein** Geld …*
   noch 后面如果接整句要**倒装**：*Er raucht nicht, **noch trinkt er**.*
2. **entweder 在句首时后面倒装**（也可以放在中场不倒装）：
   *<b>Entweder</b> **gehen wir** ins Kino, **oder** wir bleiben zu Hause.*
   ＝ *Wir gehen **entweder** ins Kino, **oder** …*
3. **je …, desto**：je 引导的是**从句**（动词在最后），desto 引导的是**主句**
   （比较级紧跟 desto，然后是动词）：
   ***Je** länger ich hier **wohne**, **desto** besser **gefällt** es mir.*

## nicht nur … sondern auch 的位置

两部分要放在**被对比的成分正前面**：
*Er hat **nicht nur** das Auto gewaschen, **sondern auch** den Rasen gemäht.*
如果 nicht nur 在句首，主句要倒装：
*<b>Nicht nur</b> **hat er** das Auto gewaschen, **sondern** er **hat auch** …*

## 例句

1. **Sowohl mein Bruder als auch meine Schwester studieren in Berlin.** — 我哥哥和我姐姐都在柏林上学。
2. **Er ist nicht nur intelligent, sondern auch bescheiden.** — 他不但聪明，而且谦虚。
3. **Ich habe weder Hunger noch Durst.** — 我既不饿也不渴。
4. **Entweder rufst du an, oder du schreibst eine E-Mail.** — 你要么打电话，要么发邮件。
5. **Die Wohnung ist zwar klein, aber sehr gemütlich.** — 房子虽小，但很舒适。
6. **Je früher wir losfahren, desto weniger Stau haben wir.** — 我们出发越早，堵车越少。
7. **Einerseits möchte ich bleiben, andererseits muss ich arbeiten.** — 一方面我想留下，另一方面我得工作。

## 常见错误

* ❌ *weder … **oder*** → ✅ weder … **noch**
* ❌ *Ich habe weder **keine** Zeit* → ✅ Ich habe weder Zeit noch Lust.（不能双重否定）
* ❌ *Je mehr ich übe, **desto ich werde** besser* → ✅ desto **besser werde ich**
* ❌ *nicht nur …, **aber auch*** → ✅ **sondern auch**
"""),

T('动词/变位', '现在时变位', 'A1', """
# 现在时变位（Konjugation im Präsens）

德语动词由**词干**（Stamm）加**词尾**（Endung）构成。不定式 *lernen* 去掉 -en
得到词干 *lern-*，再按人称加词尾。

## 规则动词词尾

| 人称 | 词尾 | lernen | wohnen |
| --- | --- | --- | --- |
| ich | **-e** | lern**e** | wohn**e** |
| du | **-st** | lern**st** | wohn**st** |
| er/sie/es | **-t** | lern**t** | wohn**t** |
| wir | **-en** | lern**en** | wohn**en** |
| ihr | **-t** | lern**t** | wohn**t** |
| sie/Sie | **-en** | lern**en** | wohn**en** |

## 四类拼写调整

| 情况 | 规则 | 例子 |
| --- | --- | --- |
| 词干以 **-d, -t, -m, -n**（前面是辅音）结尾 | du/er/ihr 前加 **-e-** | du arbeit**e**st, er find**e**t, ihr atm**e**t |
| 词干以 **-s, -ss, -ß, -z, -tz, -x** 结尾 | du 只加 **-t** | du hei**ßt**, du sit**zt**, du rei**st** |
| 不定式以 **-eln** 结尾 | ich 形式脱落 e | ich samm**le**（sammeln） |
| 不定式以 **-ern** 结尾 | 词尾按 -n | wir änd**ern**, ich änd(e)re |

## 强变化动词的元音变换

第 2、3 人称单数（du / er-sie-es）词干元音变化：

| 变化 | 动词 | du | er/sie/es |
| --- | --- | --- | --- |
| **a → ä** | fahren | f**ä**hrst | f**ä**hrt |
| **a → ä** | schlafen, tragen, halten, fallen | schl**ä**fst | schl**ä**ft |
| **au → äu** | laufen | l**äu**fst | l**äu**ft |
| **e → i** | geben, essen, helfen, sprechen | g**i**bst | g**i**bt |
| **e → ie** | sehen, lesen, empfehlen, stehlen | s**ie**hst | s**ie**ht |

⚠ 只有单数第二、第三人称变音，**复数一律回到原元音**：*wir fahren, ihr fahrt*。

## 三个最不规则的动词

| | sein | haben | werden |
| --- | --- | --- | --- |
| ich | **bin** | **habe** | **werde** |
| du | **bist** | **hast** | **wirst** |
| er/sie/es | **ist** | **hat** | **wird** |
| wir | **sind** | **haben** | **werden** |
| ihr | **seid** | **habt** | **werdet** |
| sie/Sie | **sind** | **haben** | **werden** |

## 例句

1. **Ich arbeite in einem Büro in Hamburg.** — 我在汉堡的一家办公室工作。
2. **Du sprichst sehr gut Deutsch.** — 你德语说得很好。
3. **Er fährt jeden Tag mit dem Fahrrad zur Arbeit.** — 他每天骑车上班。
4. **Wie heißt du?** — 你叫什么名字？
5. **Sie liest gerade ein spannendes Buch.** — 她正在读一本精彩的书。
6. **Wir sammeln Geld für ein Projekt.** — 我们在为一个项目筹钱。
7. **Ihr seid heute sehr still.** — 你们今天很安静。

## 常见错误

* ❌ *du **sprechst*** → ✅ du **sprichst**（e → i）
* ❌ *wir **fährt*** → ✅ wir **fahren**（复数不变音）
* ❌ *du **heißst*** → ✅ du **heißt**（词干以 ß 结尾，只加 -t）
* ❌ *er **arbeitt*** → ✅ er **arbeitet**（加口型 e）
"""),

T('动词/可分与不可分动词', '可分动词与不可分动词', 'A2', """
# 可分动词与不可分动词（trennbare / untrennbare Verben）

德语动词常带前缀。前缀是否**重读**决定它是否可分。

| | 可分（trennbar） | 不可分（untrennbar） |
| --- | --- | --- |
| 重音 | 在**前缀**上：**AUF**stehen | 在**词干**上：ver**STE**hen |
| 主句现在时/过去时 | 前缀移到**句尾** | 不动 |
| 第二分词 | ge 插在中间：**auf**ge**standen** | **不加 ge-**：**verstanden** |
| zu 不定式 | zu 插在中间：**auf**zu**stehen** | zu 在前：**zu** verstehen |

## 常见前缀分类

| 类型 | 前缀 | 例子 |
| --- | --- | --- |
| **永远可分**（重读） | ab-, an-, auf-, aus-, bei-, ein-, mit-, nach-, vor-, zu-, zurück-, weg-, los-, hin-, her-, zusammen-, fest-, statt-, teil- | **an**rufen, **ein**kaufen, **zurück**kommen |
| **永远不可分**（非重读） | be-, emp-, ent-, er-, ge-, miss-, ver-, zer-, hinter- | **be**suchen, **er**klären, **ver**stehen |
| **两可**（重音区分意义） | durch-, über-, um-, unter-, wieder-, wider- | **UM**ziehen 搬家（可分）／um**ZIE**hen 围绕（不可分） |

## 两可前缀的意义差别

| 动词 | 可分（具体义） | 不可分（抽象义） |
| --- | --- | --- |
| **umfahren** | **um**fahren 撞倒 | um**fahren** 绕行 |
| **übersetzen** | **über**setzen 摆渡过河 | über**setzen** 翻译 |
| **durchschauen** | **durch**schauen 透过……看 | durch**schauen** 看穿（某人） |
| **wiederholen** | **wieder**holen 再取回 | wieder**holen** 重复 |
| **umschreiben** | **um**schreiben 改写 | um**schreiben** 意译、描述 |

## 各句式中的位置

| 句式 | 例句 |
| --- | --- |
| 主句现在时 | Ich **stehe** um 7 Uhr **auf**. |
| 主句过去时 | Ich **stand** um 7 Uhr **auf**. |
| 完成时 | Ich **bin** um 7 Uhr **aufgestanden**.（前缀 + ge + 分词） |
| 情态动词 | Ich **muss** früh **aufstehen**.（合起来） |
| 从句 | …, weil ich früh **aufstehe**.（合起来，在句尾） |
| zu 不定式 | Ich habe keine Lust **aufzustehen**. |
| 命令式 | **Steh** bitte **auf**! |

## 例句

1. **Der Zug fährt um 8:15 Uhr ab.** — 火车 8 点 15 分发车。
2. **Ich rufe dich heute Abend an.** — 我今晚给你打电话。
3. **Hast du gestern eingekauft?** — 你昨天买东西了吗？
4. **Er hat die Aufgabe nicht verstanden.** — 他没听懂这道题。
5. **Es ist schwer, früh aufzustehen.** — 早起很难。
6. **Sie hat den Text ins Chinesische übersetzt.** — 她把课文译成了中文。
7. **Wir ziehen nächsten Monat nach Köln um.** — 我们下个月搬到科隆。

## 常见错误

* ❌ *Ich **aufstehe** um 7* → ✅ Ich **stehe** um 7 **auf**.
* ❌ *Ich habe gebesucht* → ✅ *Ich habe besucht*（不可分前缀不加 **ge-**）
* ❌ *…, weil ich **stehe** früh **auf*** → ✅ weil ich früh **aufstehe**
* ❌ *Ich versuche **zu aufstehen*** → ✅ **aufzustehen**
"""),

T('动词/反身动词', '反身动词', 'A2', """
# 反身动词（Reflexive Verben）

反身动词的动作**回指主语**，必须带反身代词 sich。

## 反身代词表

| 人称 | 第四格 A. | 第三格 D. |
| --- | --- | --- |
| ich | **mich** | **mir** |
| du | **dich** | **dir** |
| er/sie/es | **sich** | **sich** |
| wir | **uns** | **uns** |
| ihr | **euch** | **euch** |
| sie/Sie | **sich** | **sich** |

只有第一、二人称单数区分第三格和第四格，其余形式相同。

## 一、真反身动词（必须带 sich）

sich beeilen 赶紧｜sich erholen 休养｜sich verspäten 迟到｜
sich schämen 羞愧｜sich bedanken 道谢｜sich erkälten 感冒｜
sich freuen 高兴｜sich irren 弄错｜sich befinden 位于｜sich weigern 拒绝

这些动词离开 sich 就不存在：✗ *Ich beeile.*

## 二、假反身动词（可反身可及物）

| 及物用法 | 反身用法 |
| --- | --- |
| Ich wasche **das Auto**. | Ich wasche **mich**. |
| Sie zieht **das Kind** an. | Sie zieht **sich** an. |
| Er setzt **das Kind** auf den Stuhl. | Er setzt **sich** auf den Stuhl. |
| Wir treffen **ihn** morgen. | Wir treffen **uns** morgen. |

## 三、什么时候用第三格反身代词？

当句子里**另有一个第四格宾语**时，反身代词降为第三格：

| 第四格 | 第三格（另有宾语） |
| --- | --- |
| Ich wasche **mich**. | Ich wasche **mir** **die Hände**. |
| Ich ziehe **mich** an. | Ich ziehe **mir** **den Mantel** an. |
| — | Ich stelle **mir** **das** vor. 我想象一下 |
| — | Kannst du **dir** **das** merken? 你能记住吗 |

常用「第三格反身」动词：sich etwas vorstellen（想象）、sich etwas merken（记住）、
sich etwas ansehen（看看）、sich etwas überlegen（考虑）、sich etwas leisten（负担得起）、
sich etwas wünschen（希望得到）。

## 四、语序

反身代词紧跟变位动词（主句）或主语（倒装/从句）：

* *Ich **habe mich** gestern erkältet.*
* *Gestern **habe ich mich** erkältet.*
* *…, weil **ich mich** erkältet habe.*
* 主语是名词时，sich 可以在主语前：*Gestern hat **sich** **mein Bruder** erkältet.*

## 五、相互代词

复数时 sich/uns/euch 可表示「互相」，也可用 **einander**：
*Wir **sehen uns** morgen.* ＝ *Wir sehen **einander** morgen.*

## 例句

1. **Beeil dich, wir haben nur noch zehn Minuten!** — 快点，我们只剩十分钟了！
2. **Ich habe mich sehr über deinen Brief gefreut.** — 我收到你的信非常高兴。
3. **Wäschst du dir vor dem Essen die Hände?** — 你饭前洗手吗？
4. **Er kann sich das einfach nicht merken.** — 他就是记不住。
5. **Wir treffen uns um acht vor dem Kino.** — 我们八点在电影院前见。
6. **Setzen Sie sich bitte!** — 请坐。
7. **Nach der Prüfung möchte ich mich richtig erholen.** — 考完试我想好好休息。

## 常见错误

* ❌ *Ich freue **mir*** → ✅ Ich freue **mich**（sich freuen 支配第四格）
* ❌ *Ich wasche **mich** die Hände* → ✅ Ich wasche **mir** die Hände
* ❌ *Ich **mich** beeile* → ✅ Ich **beeile mich**
* ❌ *Er hat **ihn** erkältet*（指自己）→ ✅ Er hat **sich** erkältet.
"""),

T('动词/命令式', '命令式', 'A1', """
# 命令式（Imperativ）

德语有**四种**命令形式，对应 du、ihr、Sie 和 wir。

| 对象 | 构成 | lernen | kommen | fahren | sprechen |
| --- | --- | --- | --- | --- | --- |
| **du** | 词干（去 -st），无主语 | Lern! | Komm! | Fahr! | Sprich! |
| **ihr** | ＝ ihr 的现在时，无主语 | Lernt! | Kommt! | Fahrt! | Sprecht! |
| **Sie** | 不定式 + **Sie** | Lernen Sie! | Kommen Sie! | Fahren Sie! | Sprechen Sie! |
| **wir** | 不定式 + **wir** | Lernen wir! | Kommen wir! | — | — |

## du 形式的四条细节

1. **元音 e → i/ie 的动词要变音，且不加 -e**：
   geben → **Gib**! ｜ nehmen → **Nimm**! ｜ lesen → **Lies**! ｜ helfen → **Hilf**! ｜
   essen → **Iss**! ｜ sehen → **Sieh**! ｜ vergessen → **Vergiss**!
2. **a → ä 的动词在命令式里不变音**：
   fahren → **Fahr**!（不是 *Fähr*）｜ schlafen → **Schlaf**!｜ laufen → **Lauf**!
3. **词干以 -d, -t, -ig, -m/-n（前有辅音）结尾必须加 -e**：
   **Arbeite**! ｜ **Warte**! ｜ **Entschuldige**! ｜ **Atme**!
4. 其他动词的 **-e 可加可不加**，口语一般省略：*Komm(e)! Sag(e)!*

## 特殊形式

| 动词 | du | ihr | Sie |
| --- | --- | --- | --- |
| **sein** | **Sei** ruhig! | **Seid** ruhig! | **Seien Sie** ruhig! |
| **haben** | **Hab** Geduld! | **Habt** Geduld! | **Haben Sie** Geduld! |
| **werden** | **Werde** gesund! | **Werdet** …! | **Werden Sie** …! |

## 可分动词与反身动词

前缀到句尾，反身代词紧跟动词：
*<b>Steh</b> bitte **auf**!*｜*<b>Ruf</b> mich **an**!*｜*<b>Setz dich</b>!*｜*<b>Beeilen Sie sich</b>!*

## 让语气变柔和

德语的祈使句直接说会显得生硬，通常加**语气词**或改用问句：

* **bitte**：*Mach bitte das Fenster zu.*
* **doch / mal / doch mal**：*Komm doch mal vorbei!*
* **情态动词问句**：*Könnten Sie bitte das Fenster schließen?*（最礼貌）
* **陈述式表命令**（严厉）：*Du gehst jetzt sofort ins Bett!*

## 例句

1. **Komm bitte pünktlich!** — 请准时来！
2. **Sprich bitte langsamer.** — 请说慢一点。
3. **Nehmt eure Bücher heraus!** — 你们把书拿出来！
4. **Seien Sie bitte vorsichtig.** — 请您小心。
5. **Vergiss deinen Schlüssel nicht!** — 别忘了你的钥匙！
6. **Rufen wir doch ein Taxi.** — 我们叫辆出租车吧。
7. **Warte kurz, ich komme gleich.** — 稍等，我马上来。

## 常见错误

* ❌ *<b>Du</b> komm!* → ✅ **Komm!**（du/ihr 命令式不带主语）
* ❌ *<b>Sprech</b>!* → ✅ **Sprich!**（e → i 要变）
* ❌ *<b>Fähr</b> langsam!* → ✅ **Fahr** langsam!（a → ä 不变）
* ❌ *<b>Bist</b> ruhig!* → ✅ **Sei** ruhig!
"""),

T('动词/动词的支配', '动词的支配（Valenz）', 'B1', """
# 动词的支配（Valenz / Rektion）

一个动词要求几个、什么格的补足语，这叫**支配（Valenz）**。
学一个新动词，一定要连它的支配一起记。

## 一、支配第四格（绝大多数及物动词）

sehen, hören, kaufen, lesen, brauchen, finden, haben, kennen, lieben, fragen, besuchen…
*Ich **kenne** **den Mann**.*

## 二、只支配第三格（必须背！）

| 动词 | 意思 | 例句 |
| --- | --- | --- |
| **helfen** | 帮助 | Ich helfe **dir**. |
| **danken** | 感谢 | Ich danke **Ihnen**. |
| **gratulieren** | 祝贺 | Wir gratulieren **dem Sieger**. |
| **antworten** | 回答（人） | Antworte **mir**! |
| **gehören** | 属于 | Das Buch gehört **mir**. |
| **gefallen** | 使喜欢 | Der Film gefällt **mir**. |
| **schmecken** | 好吃 | Die Suppe schmeckt **mir**. |
| **passen** | 合适 | Der Termin passt **mir** nicht. |
| **begegnen** | 遇见 | Ich bin **ihm** begegnet. |
| **folgen** | 跟随 | Folgen Sie **mir**! |
| **glauben** | 相信（人） | Ich glaube **dir**. |
| **vertrauen** | 信任 | Ich vertraue **dir**. |
| **zuhören** | 听（人） | Hör **mir** zu! |
| **fehlen** | 缺少 | **Mir** fehlt Zeit. |
| **weh tun** | 弄疼 | Der Kopf tut **mir** weh. |

## 三、支配双宾语（第三格人 + 第四格物）

geben, schenken, zeigen, erklären, empfehlen, bringen, schicken, kaufen, leihen, sagen…
*Ich **gebe** **dem Kind**(D.) **das Buch**(A.).*

**语序规则**：
1. 两个都是名词 → **D. 在前**：*Ich gebe **dem Kind** **das Buch**.*
2. 有一个是代词 → **代词在前**：*Ich gebe **es** **dem Kind**.*
3. 两个都是代词 → **A. 在前**：*Ich gebe **es** **ihm**.*
（口诀：**代词优先，双代词第四格优先**）

## 四、支配第二格（书面，少数）

sich erinnern（旧式）、bedürfen、gedenken、sich schämen、sich rühmen、
sich bedienen、beschuldigen（+ A. + G.）、verdächtigen。
*Wir **gedenken** **der Opfer**.*

## 五、支配介词宾语

见「介词搭配」一节：warten **auf** + A.、denken **an** + A.、
sich freuen **über** + A.、helfen **bei** + D.…

## 六、无主语/虚主语动词

*<b>Es</b> regnet.*｜*<b>Es</b> gibt + A.*｜*<b>Mir</b> ist kalt.*｜*<b>Es</b> geht **mir** gut.*

## 例句

1. **Kannst du mir bitte helfen?** — 你能帮我一下吗？
2. **Das Auto gehört meinem Bruder.** — 这辆车是我哥哥的。
3. **Ich schenke meiner Mutter Blumen.** — 我送给妈妈花。
4. **Zeig es mir bitte!** — 请拿给我看看！
5. **Der Lehrer erklärt den Schülern die Regel.** — 老师给学生们讲解规则。
6. **Diese Farbe steht dir sehr gut.** — 这个颜色很适合你。
7. **Es gibt hier keinen Supermarkt.** — 这里没有超市。

## 常见错误

* ❌ *Ich helfe **dich*** → ✅ Ich helfe **dir**
* ❌ *Ich danke **dich*** → ✅ Ich danke **dir**
* ❌ *Ich gebe **dem Kind** **es*** → ✅ Ich gebe **es** **dem Kind**
* ❌ *Ich frage **dir***（fragen 支配第四格！）→ ✅ Ich frage **dich**
"""),

T('时态/现在时的用法', '现在时的用法', 'A1', """
# 现在时的用法（Präsens）

德语现在时的使用范围比中文和英语都**宽**：一个形式覆盖「正在」「经常」「将来」
甚至「历史叙述」。德语**没有**英语式的进行时（no *I am doing*）。

## 六种用法

| 用法 | 说明 | 例句 |
| --- | --- | --- |
| **当下正在发生** | 相当于英语进行时 | Ich **lese** gerade ein Buch. 我正在看书。 |
| **习惯、反复** | 常与 immer, oft, jeden Tag 连用 | Er **steht** jeden Tag um 6 Uhr auf. |
| **普遍真理** | 定义、规律 | Wasser **kocht** bei 100 Grad. |
| **将来**（有时间词即可） | 德语最常用的将来表达 | Morgen **fahre** ich nach Berlin. |
| **历史现在时** | 讲故事、讲历史更生动 | 1848 **beginnt** die Revolution. |
| **从过去持续到现在** | 与 seit / schon 连用，中文说「已经……了」 | Ich **wohne** **seit** drei Jahren hier. |

⚠ 最后一条是中国学生高频错误来源：
英语用完成时（*I have lived here for 3 years*），德语用**现在时 + seit**。

## 强调「正在」的手段

德语没有进行时，需要强调时用副词或结构：

* **gerade / eben**：*Ich esse **gerade**.*
* **beim + 名词化不定式**：*Ich bin **beim Essen**.*
* **dabei sein, etwas zu tun**：*Ich **bin dabei**, das Essen **zu kochen**.*
* **am + 名词化不定式**（口语，西部）：*Ich bin **am Arbeiten**.*

## 现在时表将来的条件

只要句中有明确的**时间状语**或语境清楚，就用现在时而不用 werden：

* *Nächste Woche **habe** ich Urlaub.*（比 *werde … haben* 自然）
* 用 **werden** 主要是为了表示**推测**或**强调意愿/承诺**：
  *Er **wird** wohl im Stau stehen.*（推测）

## 例句

1. **Ich arbeite seit fünf Jahren bei dieser Firma.** — 我在这家公司工作五年了。
2. **Was machst du gerade?** — 你正在做什么？
3. **Der Zug kommt in zehn Minuten an.** — 火车十分钟后到。
4. **Im Winter schneit es hier oft.** — 这里冬天经常下雪。
5. **Nächsten Sommer ziehen wir nach Wien.** — 明年夏天我们搬去维也纳。
6. **Die Erde dreht sich um die Sonne.** — 地球绕着太阳转。
7. **Ich bin gerade dabei, die Wohnung aufzuräumen.** — 我正在收拾房间。

## 常见错误

* ❌ *Ich **habe** hier drei Jahre **gewohnt***（意为「至今仍住」）→ ✅ Ich **wohne** seit drei Jahren hier.
* ❌ *Ich **bin lesend*** → ✅ Ich lese **gerade**.
* ❌ *Ich **werde** morgen nach Berlin **fahren*** 并不错，但更自然的是 *Morgen **fahre** ich nach Berlin.*
* ❌ *seit drei **Jahre*** → ✅ seit drei **Jahren**
"""),

T('时态/现在完成时', '现在完成时', 'A1', """
# 现在完成时（Perfekt）

Perfekt 是**口语中叙述过去的默认时态**。
构成：**haben / sein（变位）+ 第二分词（句尾）**。

## 第二分词的构成

| 类型 | 规则 | 例子 |
| --- | --- | --- |
| 规则动词 | **ge- + 词干 + -t** | machen → **gemacht**；kaufen → **gekauft** |
| 词干以 -d/-t 结尾 | ge- + 词干 + **-et** | arbeiten → **gearbeitet** |
| 不规则动词 | **ge- + 变化词干 + -en** | sprechen → **gesprochen**；gehen → **gegangen** |
| 混合动词 | ge- + 变化词干 + **-t** | bringen → **gebracht**；denken → **gedacht** |
| 可分动词 | 前缀 + **ge** + 分词 | aufstehen → **auf**ge**standen** |
| 不可分前缀（be-, er-, ver-, ent-, ge-, zer-, emp-, miss-） | **不加 ge-** | besuchen → **besucht**；verstehen → **verstanden** |
| **-ieren** 结尾的动词 | **不加 ge-** | studieren → **studiert**；telefonieren → **telefoniert** |

## haben 还是 sein？

| 用 **sein** | 用 **haben** |
| --- | --- |
| **位移动词**（不及物）：gehen, fahren, kommen, fliegen, laufen, reisen, steigen | 所有**及物**动词（带第四格宾语） |
| **状态变化**：aufstehen, einschlafen, aufwachen, sterben, wachsen, werden | 所有**反身**动词 |
| **sein, bleiben, werden, passieren, geschehen, begegnen, gelingen** | 所有**情态**动词 |
|  | 大多数不表位移的不及物动词：arbeiten, schlafen, warten |

⚠ 同一个动词带宾语时改用 haben：
*Ich **bin** nach Berlin **gefahren**.*（不及物）
*Ich **habe** das Auto **gefahren**.*（及物）

## 语序：句框（Satzklammer）

变位的 haben/sein 在**第二位**，第二分词在**最后**：

*Ich **habe** gestern mit meinem Bruder in der Stadt Kaffee **getrunken**.*

从句中助动词移到最后：*…, weil ich Kaffee getrunken **habe**.*

## Perfekt vs. Präteritum

| | Perfekt | Präteritum |
| --- | --- | --- |
| 场合 | **口语**、书信、对话 | **书面**叙述、小说、新闻 |
| 例外 | — | sein, haben, werden 和情态动词在口语中也常用过去时 |

南德/奥地利口语几乎只用 Perfekt；北德叙述会混用。

## 例句

1. **Ich habe gestern einen Film gesehen.** — 我昨天看了部电影。
2. **Wir sind am Wochenende nach München gefahren.** — 我们周末去了慕尼黑。
3. **Hast du schon gegessen?** — 你吃过了吗？
4. **Er ist um sechs Uhr aufgestanden.** — 他六点起的床。
5. **Sie hat drei Jahre in Berlin studiert.** — 她在柏林上了三年学。
6. **Was ist passiert?** — 出什么事了？
7. **Ich habe den Text nicht verstanden.** — 我没看懂这篇课文。

## 常见错误

* ❌ *Ich **habe** nach Hause **gegangen*** → ✅ Ich **bin** nach Hause gegangen.
* ❌ *Ich habe **gestudiert*** → ✅ Ich habe **studiert**（-ieren 不加 ge-）
* ❌ *Ich habe **gebesucht*** → ✅ **besucht**
* ❌ *Ich habe gesehen einen Film* → ✅ Ich habe einen Film **gesehen**（分词必须在最后）
"""),

T('时态/过去时', '过去时', 'A2', """
# 过去时（Präteritum）

Präteritum 是**书面叙述**的时态：小说、童话、新闻报道、履历。
口语中除了 sein / haben / werden / 情态动词，一般用 Perfekt。

## 一、弱变化（规则）动词：词干 + **-te-** + 词尾

| 人称 | 词尾 | lernen | arbeiten |
| --- | --- | --- | --- |
| ich | **-te** | lern**te** | arbeit**ete** |
| du | **-test** | lern**test** | arbeit**etest** |
| er/sie/es | **-te** | lern**te** | arbeit**ete** |
| wir | **-ten** | lern**ten** | arbeit**eten** |
| ihr | **-tet** | lern**tet** | arbeit**etet** |
| sie/Sie | **-ten** | lern**ten** | arbeit**eten** |

⚠ **第一人称和第三人称单数完全相同**（都是 -te），这是德语时态的通例。

## 二、强变化（不规则）动词：换元音，**单数第一/三人称不加词尾**

| 人称 | gehen | sprechen | fahren | sein |
| --- | --- | --- | --- | --- |
| ich | **ging** | **sprach** | **fuhr** | **war** |
| du | ging**st** | sprach**st** | fuhr**st** | war**st** |
| er/sie/es | **ging** | **sprach** | **fuhr** | **war** |
| wir | ging**en** | sprach**en** | fuhr**en** | war**en** |
| ihr | ging**t** | sprach**t** | fuhr**t** | war**t** |
| sie/Sie | ging**en** | sprach**en** | fuhr**en** | war**en** |

## 三、混合动词：换元音 **+** 弱变化词尾

bringen → **brachte**｜denken → **dachte**｜kennen → **kannte**｜
nennen → **nannte**｜rennen → **rannte**｜wissen → **wusste**｜
senden → **sandte**｜brennen → **brannte**

## 四、口语中也常用过去时的动词

| 动词 | 过去时 | 例句 |
| --- | --- | --- |
| sein | war | Ich **war** gestern krank. |
| haben | hatte | Ich **hatte** keine Zeit. |
| werden | wurde | Es **wurde** dunkel. |
| können | konnte | Ich **konnte** nicht kommen. |
| müssen | musste | Wir **mussten** warten. |
| wollen | wollte | Er **wollte** helfen. |
| dürfen | durfte | Sie **durfte** nicht mit. |
| sollen | sollte | Du **solltest** anrufen. |
| mögen | mochte | Ich **mochte** ihn nicht. |
| es gibt | es gab | **Es gab** viele Probleme. |

## 例句

1. **Als ich klein war, wohnten wir auf dem Land.** — 我小时候我们住在乡下。
2. **Er stand auf, öffnete das Fenster und ging hinaus.** — 他站起来，打开窗，走了出去。
3. **Sie sprach kein Wort Deutsch, als sie ankam.** — 她刚到的时候一句德语也不会说。
4. **Wir hatten damals kein Geld für ein Auto.** — 我们那时没钱买车。
5. **Der Zug fuhr pünktlich um acht ab.** — 火车八点准时开走了。
6. **Ich wusste nicht, dass du hier bist.** — 我不知道你在这儿。
7. **Es war einmal ein König, der drei Töchter hatte.** — 从前有一位国王，他有三个女儿。

## 常见错误

* ❌ *er **gingte*** → ✅ er **ging**（强变化单数不加词尾）
* ❌ *ich **wusst*** → ✅ ich **wusste**
* ❌ 在口语里说 *Ich **kaufte** gestern Brot* 会显得像在念小说 → 口语用 *Ich **habe** Brot **gekauft**.*
* ❌ *er **warte*** 想说「他曾是」→ ✅ er **war**（warten 的过去时才是 wartete）
"""),

T('时态/过去完成时', '过去完成时', 'B1', """
# 过去完成时（Plusquamperfekt）

表示「**过去的过去**」：某事在另一个过去事件之前已经完成。

**构成：hatte / war（过去时）+ 第二分词**

| Perfekt | Plusquamperfekt |
| --- | --- |
| ich **habe** gelernt | ich **hatte** gelernt |
| ich **bin** gefahren | ich **war** gefahren |

助动词的选择（haben 还是 sein）与现在完成时**完全一致**。

## 典型用法：与 nachdem 连用

| 从句（先发生） | 主句（后发生） |
| --- | --- |
| **Plusquamperfekt** | **Präteritum** |
| Nachdem er **gegessen hatte**, | **ging** er spazieren. |

也可以是「Perfekt + Präsens」这一对（时间轴整体前移到现在）：
*Nachdem ich **gegessen habe**, gehe ich spazieren.*

## 其他触发词

| 词 | 例句 |
| --- | --- |
| **nachdem** | Nachdem sie angekommen **war**, rief sie an. |
| **als**（含先后） | Als ich kam, **war** er schon **gegangen**. |
| **bevor**（逆序，主句用过去完成时） | Bevor ich einschlief, **hatte** ich noch gelesen. |
| **schon / bereits** | Der Film **hatte** schon **begonnen**. |
| **vorher / zuvor / davor** | Wir waren müde; wir **hatten** vorher gearbeitet. |

## 三个时间层次一览

| 层次 | 时态 | 例句 |
| --- | --- | --- |
| 过去的过去 | Plusquamperfekt | Ich **hatte** die Tür **abgeschlossen**, |
| 过去 | Präteritum / Perfekt | dann **ging** ich zur Arbeit. |
| 现在 | Präsens | Jetzt **bin** ich im Büro. |

## 例句

1. **Nachdem wir gegessen hatten, gingen wir ins Kino.** — 我们吃完饭后去了电影院。
2. **Als ich am Bahnhof ankam, war der Zug schon abgefahren.** — 我到火车站时，火车已经开走了。
3. **Er hatte den Schlüssel vergessen und musste warten.** — 他忘了钥匙，只好等着。
4. **Ich war noch nie in Italien gewesen, bevor ich sie kennenlernte.** — 认识她之前我从没去过意大利。
5. **Sie hatte drei Jahre in Japan gelebt und sprach perfekt Japanisch.** — 她在日本住过三年，日语说得很好。
6. **Wir hatten uns verlaufen, deshalb kamen wir zu spät.** — 我们迷路了，所以来晚了。
7. **Nachdem der Regen aufgehört hatte, wurde es wieder warm.** — 雨停之后又暖和起来了。

## 常见错误

* ❌ *Nachdem ich **aß**, ging ich* → ✅ Nachdem ich **gegessen hatte**, ging ich
* ❌ *Ich **war** gelernt* → ✅ Ich **hatte** gelernt（助动词按动词本身选）
* ❌ 主从句都用过去完成时：*Nachdem ich gegessen hatte, **war** ich spazieren **gegangen*** → 主句用 **ging**
* ❌ 在没有另一个过去事件作参照时滥用过去完成时 → 只有出现「过去的过去」才用它
"""),

T('时态/将来时', '将来时 I 与 II', 'B1', """
# 将来时 I 与 II（Futur I / Futur II）

## 一、Futur I：**werden（变位）+ 不定式（句尾）**

| 人称 | 形式 |
| --- | --- |
| ich | **werde** … machen |
| du | **wirst** … machen |
| er/sie/es | **wird** … machen |
| wir/sie/Sie | **werden** … machen |
| ihr | **werdet** … machen |

### Futur I 的两个真正用途

| 用途 | 说明 | 例句 |
| --- | --- | --- |
| **推测**（最常见） | 常带 wohl, sicher, wahrscheinlich | Er **wird** wohl im Stau **stehen**. 他大概堵车了。 |
| **强调意愿/承诺/预言** | 郑重其事 | Ich **werde** dich nie **vergessen**. |

⚠ **单纯说未来的事，德语更常用现在时 + 时间状语**：
*<b>Morgen fahre ich</b> nach Berlin.*（比 *werde … fahren* 自然得多）

## 二、Futur II：**werden + 第二分词 + haben/sein**

表示「到将来某时**已经完成**」，或对**过去**的推测。

| 用途 | 例句 |
| --- | --- |
| 将来完成 | Bis morgen **werde** ich den Text **übersetzt haben**. 到明天我就把课文译完了。 |
| **对过去的推测**（更常见） | Er **wird** den Zug **verpasst haben**. 他大概是没赶上火车。 |

Futur II 在日常口语里罕见，推测过去更常说：
*Er **hat** den Zug **wohl** verpasst.*

## 三、表达将来的其他手段

| 手段 | 例句 |
| --- | --- |
| 现在时 + 时间词 | **Nächste Woche** habe ich Urlaub. |
| **wollen**（打算） | Ich **will** morgen anfangen. |
| **vorhaben / planen** | Ich **habe vor**, Medizin zu studieren. |
| **dabei sein zu** | — |
| **sollen**（他人安排） | Ich **soll** morgen zum Chef kommen. |

## 四、推测程度的副词阶梯

**bestimmt / sicher**（肯定）＞ **wohl / wahrscheinlich**（大概）＞
**vielleicht / möglicherweise**（也许）＞ **kaum**（几乎不）

## 例句

1. **Nächstes Jahr werde ich in Deutschland studieren.** — 明年我要去德国上学。
2. **Wo ist Anna? – Sie wird noch im Büro sein.** — 安娜在哪儿？——她大概还在办公室。
3. **Ich werde dir helfen, das verspreche ich.** — 我会帮你的，我保证。
4. **Bis Ende des Monats werden wir umgezogen sein.** — 到月底我们就搬完家了。
5. **Er wird das Buch wohl schon gelesen haben.** — 他大概已经读过这本书了。
6. **Das Wetter wird morgen wahrscheinlich besser.** — 明天天气大概会好一些。
7. **Morgen kommt mein Bruder aus Wien.** — 明天我哥哥从维也纳来。（现在时表将来）

## 常见错误

* ❌ *Ich werde morgen nach Berlin **fahre*** → ✅ **fahren**（不定式）
* ❌ 把 werden 的所有用法混为一谈：**werden + 不定式**＝将来；**werden + 第二分词**＝被动；
  **werden + 形容词/名词**＝「变成」（*Er **wird** Arzt.*）
* ❌ 用 Futur I 说每一件未来的事 → 有时间状语时用现在时更地道
* ❌ *Er wird den Zug verpasst **werden*** → ✅ verpasst **haben**
"""),

T('情态动词/情态动词基础', '情态动词的变位与意义', 'A1', """
# 情态动词的变位与意义（Modalverben）

德语有 6 个情态动词：**können, müssen, wollen, sollen, dürfen, mögen**
（外加 möchten）。它们与**不定式**连用，构成句框：情态动词在第二位，不定式在句尾。

## 现在时变位（注意：单数变元音，且 ich / er 无词尾）

| | können | müssen | wollen | sollen | dürfen | mögen | möchten |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ich | **kann** | **muss** | **will** | **soll** | **darf** | **mag** | **möchte** |
| du | kannst | musst | willst | sollst | darfst | magst | möchtest |
| er/sie/es | **kann** | **muss** | **will** | **soll** | **darf** | **mag** | **möchte** |
| wir | können | müssen | wollen | sollen | dürfen | mögen | möchten |
| ihr | könnt | müsst | wollt | sollt | dürft | mögt | möchtet |
| sie/Sie | können | müssen | wollen | sollen | dürfen | mögen | möchten |

过去时一律**弱变化且去变音**：konnte, musste, wollte, sollte, durfte, mochte。

## 六个词的核心意义

| 动词 | 主要含义 | 例句 |
| --- | --- | --- |
| **können** | 能力；可能性；（口语）许可 | Ich **kann** schwimmen. / **Kann** ich helfen? |
| **müssen** | 必须（客观强制） | Ich **muss** arbeiten. |
| **wollen** | 想要（强烈意愿、计划） | Er **will** Arzt werden. |
| **sollen** | 应该（他人的要求、建议、传闻） | Du **sollst** deine Mutter anrufen. |
| **dürfen** | 允许（正式许可） | Hier **darf** man nicht rauchen. |
| **mögen** | 喜欢（常独立使用） | Ich **mag** keinen Kaffee. |
| **möchten** | 想要（礼貌，＝mögen 的虚拟式二式） | Ich **möchte** einen Tee. |

## 三组高频辨析

| 对比 | 区别 |
| --- | --- |
| **müssen vs. sollen** | müssen＝客观必要／内在需要；sollen＝**别人**要求你 |
| **nicht müssen vs. nicht dürfen** | *Du **musst** nicht* ＝ 不必；*Du **darfst** nicht* ＝ 不许（英语 mustn't！） |
| **wollen vs. möchten** | wollen 直接、强硬；möchten 客气，点餐、请求首选 |
| **mögen vs. möchten** | mögen＋名词＝喜欢；möchten＝此刻想要 |

## 情态动词单独使用

有明确语境时可省略不定式：
*Ich **muss** jetzt nach Hause (gehen).* ｜ *Ich **kann** kein Deutsch.* ｜
*Er **will** nach Berlin.*｜*<b>Darf</b> ich?*

## 例句

1. **Kannst du mir bitte helfen?** — 你能帮我一下吗？
2. **Ich muss heute länger arbeiten.** — 我今天必须加班。
3. **Hier darf man nicht parken.** — 这里不许停车。
4. **Du musst nicht kommen, wenn du keine Zeit hast.** — 你没时间的话不必来。
5. **Was möchten Sie trinken?** — 您想喝点什么？
6. **Der Arzt sagt, ich soll mehr Sport machen.** — 医生说我应该多运动。
7. **Sie will nächstes Jahr nach Kanada auswandern.** — 她想明年移民加拿大。

## 常见错误

* ❌ *Ich kann **zu** schwimmen* → ✅ Ich kann **schwimmen**（情态动词后**不带 zu**）
* ❌ *Ich muss nicht rauchen*（想说「不许抽烟」）→ ✅ Ich **darf** nicht rauchen.
* ❌ *er **kannt*** → ✅ er **kann**（单数第三人称无词尾）
* ❌ *Ich will einen Kaffee, bitte*（点餐显得粗鲁）→ ✅ Ich **hätte gern** / **möchte** einen Kaffee.
"""),

T('情态动词/情态动词的完成时', '情态动词的完成时与双不定式', 'B1', """
# 情态动词的完成时与双不定式

情态动词讲过去，**口语中最常用过去时**（Präteritum），因为形式简单：
*Ich **konnte** nicht kommen.*｜*Wir **mussten** warten.*

需要用完成时的时候，会出现德语特有的**双不定式**（Ersatzinfinitiv）结构。

## 一、带实义动词时：haben + 不定式 + 情态动词不定式

| 现在时 | 完成时 |
| --- | --- |
| Ich **kann** nicht kommen. | Ich **habe** nicht **kommen können**. |
| Er **muss** arbeiten. | Er **hat arbeiten müssen**. |
| Sie **darf** mitfahren. | Sie **hat mitfahren dürfen**. |

⚠ 情态动词此时**不用第二分词**（不是 *gekonnt*），而用**不定式**形式，
且放在**最后**：… + 实义动词不定式 + 情态动词不定式。

## 二、情态动词单独使用时：用真正的第二分词

gekonnt, gemusst, gewollt, gesollt, gedurft, gemocht

*Ich **habe** es nicht **gekonnt**.* ｜ *Das **habe** ich nicht **gewollt**.* ｜
*Ich **habe** keinen Kaffee **gemocht**.*

## 三、从句中的语序倒置（考试难点）

正常从句里变位动词在最后；但**双不定式结构中，助动词 haben 跳到两个不定式之前**：

* 主句：*Ich **habe** nicht **kommen können**.*
* 从句：*…, weil ich nicht **habe kommen können**.*（不是 *kommen können habe*）

同样规则适用于 lassen, sehen, hören, brauchen：
*…, weil er sich **hat** operieren **lassen**.*

## 四、哪个时态用哪个

| 场合 | 推荐 |
| --- | --- |
| 口语讲过去 | **Präteritum**：Ich konnte nicht. |
| 需要完成体、或与其他完成时并列 | Perfekt + 双不定式 |
| 书面叙述 | Präteritum |

## 五、与虚拟式二式的组合（过去的非现实）

*Ich **hätte** kommen **können**.* 我本来能来的。
*Du **hättest** anrufen **sollen**.* 你本该打个电话。
*Das **hätte** nicht passieren **dürfen**.* 这本不该发生。

## 例句

1. **Ich habe gestern nicht kommen können.** — 我昨天来不了。
2. **Er hat den ganzen Sonntag arbeiten müssen.** — 他整个星期天都得工作。
3. **Wir haben als Kinder nicht fernsehen dürfen.** — 我们小时候不许看电视。
4. **Das habe ich wirklich nicht gewollt.** — 我真的不是故意的。
5. **Sie ärgert sich, weil sie nicht hat mitfahren können.** — 她很生气，因为没能一起去。
6. **Du hättest mich anrufen sollen.** — 你本该给我打电话的。
7. **Ich habe mir die Haare schneiden lassen.** — 我去理了发。

## 常见错误

* ❌ *Ich habe nicht kommen **gekonnt*** → ✅ … kommen **können**
* ❌ *…, weil ich nicht kommen können **habe*** → ✅ weil ich nicht **habe** kommen können
* ❌ *Ich bin arbeiten müssen* → ✅ Ich **habe** arbeiten müssen（永远用 haben）
* ❌ 单独使用时也用不定式：*Das habe ich nicht **wollen*** → ✅ **gewollt**
"""),

T('情态动词/主观用法', '情态动词的主观用法', 'C1', """
# 情态动词的主观用法（subjektiver Gebrauch）

同一个情态动词有两套意义：
**客观用法**说的是「事情本身的必要/可能」；
**主观用法**说的是「**说话人**对某事真实性的判断」，相当于中文的「想必／据说／据称」。

## 主观意义一览（按确信度从高到低）

| 情态动词 | 主观含义 | 例句 | 相当于 |
| --- | --- | --- | --- |
| **müssen** | 几乎肯定（推断） | Er **muss** krank sein. 他肯定病了。 | sicher / bestimmt |
| **dürfte** | 有把握的推测（客气） | Er **dürfte** schon zu Hause sein. | wahrscheinlich |
| **können / könnte** | 有可能 | Das **könnte** stimmen. | vielleicht |
| **mögen** | 姑且承认（让步） | Er **mag** recht haben, aber … | zwar … aber |
| **nicht können** | 不可能 | Das **kann** nicht wahr sein. | unmöglich |
| **sollen** | **据说**（第三方来源，说话人不担保） | Er **soll** sehr reich sein. 据说他很有钱。 | angeblich |
| **wollen** | **自称**（主语自己说的，说话人存疑） | Er **will** alles gesehen haben. 他声称都看见了。 | er behauptet |

⚠ 最容易混淆的是最后两个：
**sollen ＝ 别人说的**（据说）｜**wollen ＝ 他自己说的**（自称）。

## 指向过去：情态动词 + 第二分词 + haben/sein

| 现在 | 过去 |
| --- | --- |
| Er **muss** krank **sein**. | Er **muss** krank **gewesen sein**. |
| Sie **soll** reich **sein**. | Sie **soll** reich **gewesen sein**. |
| Er **will** es **wissen**. | Er **will** es **gewusst haben**. |
| Das **kann** stimmen. | Das **kann** gestimmt **haben**. |

## 怎么区分客观与主观？

| 线索 | 客观 | 主观 |
| --- | --- | --- |
| 能否换成 "es ist nötig / möglich" | 能 | 不能 |
| 是否可替换为 sicher/angeblich/vielleicht | 不能 | 能 |
| 是否带「不定式完成态」 | 少见 | 常见 |

*Er **muss** viel arbeiten.*（客观：他不得不多工作）
*Er **muss** viel gearbeitet haben.*（主观：他想必工作了很多）

## 例句

1. **Das Licht brennt – er muss zu Hause sein.** — 灯亮着，他肯定在家。
2. **Sie dürfte inzwischen angekommen sein.** — 她现在应该已经到了。
3. **Das kann doch nicht wahr sein!** — 这不可能是真的！
4. **Der Politiker soll bestochen worden sein.** — 据说这位政客受了贿。
5. **Er will den Unfall gesehen haben.** — 他声称目击了这起事故。
6. **Das mag ja stimmen, aber es hilft uns nicht.** — 这也许没错，可对我们没帮助。
7. **Sie könnte den Zug verpasst haben.** — 她可能没赶上火车。

## 常见错误

* ❌ 用 sollen 表示自己的推测 → sollen 只转述**第三方**说法
* ❌ *Er will alles **gesehen*** → ✅ gesehen **haben**（过去用完成不定式）
* ❌ *Er **muss** krank **war*** → ✅ krank **gewesen sein**
* ❌ 把 *Das kann nicht wahr sein* 理解为「这不允许是真的」→ 主观义为「不可能」
"""),

T('虚拟式/虚拟式二式构成', '虚拟式二式的构成', 'B1', """
# 虚拟式二式的构成（Konjunktiv II）

虚拟式二式表达「**非现实**」：假设、愿望、礼貌、建议。

## 一、构成规则

**由过去时词干变来**：过去时词干 +（元音变音 a/o/u → ä/ö/ü）+ 词尾 **-e, -est, -e, -en, -et, -en**

| 人称 | sein (war) | haben (hatte) | werden (wurde) | kommen (kam) |
| --- | --- | --- | --- | --- |
| ich | **wäre** | **hätte** | **würde** | **käme** |
| du | wär(e)st | hättest | würdest | kämest |
| er/sie/es | **wäre** | **hätte** | **würde** | **käme** |
| wir | wären | hätten | würden | kämen |
| ihr | wär(e)t | hättet | würdet | kämet |
| sie/Sie | wären | hätten | würden | kämen |

## 二、必须掌握的原形式（其余用 würde 代替）

| 动词 | K II | 动词 | K II |
| --- | --- | --- | --- |
| sein | **wäre** | können | **könnte** |
| haben | **hätte** | müssen | **müsste** |
| werden | **würde** | dürfen | **dürfte** |
| wissen | **wüsste** | sollen | **sollte**（无变音） |
| gehen | ginge | wollen | **wollte**（无变音） |
| kommen | käme | mögen | **möchte** |
| geben | gäbe | tun | täte |
| finden | fände | brauchen | bräuchte |
| lassen | ließe | bleiben | bliebe |

⚠ **弱变化动词的 K II 与过去时同形**（*lernte ＝ lernte*），所以必须用 **würde + 不定式**：
*Ich **würde** mehr **lernen**.*

## 三、würde 替代形式

**würde（变位）+ 不定式（句尾）** 适用于：
* 所有弱变化动词
* 形式生僻的强变化动词（*hülfe, stürbe, schwömme* 现代口语不用）
* 口语中的绝大多数情况

**但 sein, haben, werden, wissen 和 6 个情态动词几乎从不用 würde**：
✗ *Ich würde mehr Zeit haben* → ✓ *Ich **hätte** mehr Zeit.*

## 四、过去的虚拟式：只有一个形式

**hätte / wäre + 第二分词**

*Ich **hätte** dir **geholfen**.* 我本来会帮你的。
*Er **wäre** früher **gekommen**.* 他本来会早点来的。

⚠ 虚拟式二式**不区分**过去时/完成时/过去完成时——过去一律用 hätte/wäre + P II。

## 例句

1. **Wenn ich Zeit hätte, würde ich mitkommen.** — 我要是有时间就一起去了。
2. **An deiner Stelle wäre ich vorsichtiger.** — 换作是我会更小心。
3. **Könnten Sie mir bitte helfen?** — 您能帮我一下吗？
4. **Ich wüsste gern, wann der Zug fährt.** — 我很想知道火车什么时候开。
5. **Er hätte den Termin fast vergessen.** — 他差点忘了这个约会。
6. **Wir wären gern länger geblieben.** — 我们本来想多待一会儿。
7. **Ohne dich hätte ich das nie geschafft.** — 没有你我绝对做不成。

## 常见错误

* ❌ *Ich **würde haben** mehr Zeit* → ✅ Ich **hätte** mehr Zeit.
* ❌ *Ich **würde** gestern **gekommen sein*** → ✅ Ich **wäre** gestern **gekommen**.
* ❌ *Wenn ich reich **wäre**, ich **würde** reisen* → 语序：**würde ich** reisen
* ❌ *er **wärte*** → ✅ er **wäre**
"""),

T('虚拟式/虚拟式二式用法', '虚拟式二式的用法', 'B1', """
# 虚拟式二式的用法

## 一、非现实条件句（Irreale Bedingungssätze）

| 时间 | 结构 | 例句 |
| --- | --- | --- |
| **现在/将来不现实** | wenn + K II，主句 K II / würde | **Wenn** ich Geld **hätte**, **würde** ich ein Haus kaufen. |
| **过去不现实** | wenn + hätte/wäre + P II | **Wenn** ich Geld **gehabt hätte**, **hätte** ich ein Haus gekauft. |
| **混合** | 过去条件 + 现在结果 | Wenn ich damals studiert **hätte**, **wäre** ich jetzt Arzt. |

**可以省略 wenn**，此时动词提到句首：
*<b>Hätte</b> ich Geld, würde ich ein Haus kaufen.*
*<b>Wäre</b> er früher gekommen, hätte er sie noch getroffen.*

## 二、礼貌请求（最高频的日常用法）

| 直接 | 礼貌 |
| --- | --- |
| Kannst du …? | **Könntest** du …? |
| Haben Sie Zeit? | **Hätten** Sie Zeit? |
| Ich will … | Ich **möchte** … / Ich **hätte gern** … |
| Ist es möglich …? | **Wäre** es möglich …? |
| Du sollst … | Du **solltest** …（建议） |

*<b>Würden Sie</b> mir bitte helfen?*｜*<b>Dürfte</b> ich Sie kurz stören?*

## 三、愿望句（Irreale Wunschsätze）

加 **doch / nur / bloß**，句末用感叹号：

* *Wenn ich **doch nur** mehr Zeit **hätte**!*
* *<b>Hätte</b> ich **bloß** nichts gesagt!*（省略 wenn）
* *<b>Wäre</b> er **doch** hier!*

## 四、非现实比较：als ob / als wenn / als

*Er tut so, **als ob** er alles **wüsste**.*
*Er tut so, **als wüsste** er alles.*（als 后直接倒装，**不能**再加 ob）
*Sie sah aus, **als hätte** sie geweint.*

## 五、其他常用格式

| 格式 | 意思 | 例句 |
| --- | --- | --- |
| **beinahe / fast + K II** | 差点儿…… | Ich **wäre** fast **gefallen**. |
| **an deiner Stelle** | 换作是我 | **An deiner Stelle würde** ich kündigen. |
| **sonst / andernfalls** | 否则就…… | Beeil dich, **sonst** **kämen** wir zu spät. |
| **es wäre besser, wenn** | 最好…… | **Es wäre besser, wenn** du zu Hause bliebest. |
| **hätte … sollen/können** | 本该／本能 | Du **hättest** früher **kommen sollen**. |

## 例句

1. **Wenn ich mehr Zeit hätte, würde ich ein Instrument lernen.** — 我要是有更多时间就学个乐器。
2. **Hätte ich das gewusst, wäre ich nicht gekommen.** — 我要是知道这事就不来了。
3. **Könnten Sie mir bitte den Weg zum Bahnhof zeigen?** — 您能告诉我去火车站怎么走吗？
4. **Wenn ich doch nur besser Deutsch sprechen könnte!** — 我要是德语能说得更好就好了！
5. **Er tut so, als ob er mich nicht kennen würde.** — 他装作不认识我。
6. **An deiner Stelle hätte ich das nicht gesagt.** — 换作是我就不会那样说。
7. **Ich wäre beinahe zu spät gekommen.** — 我差点儿迟到。

## 常见错误

* ❌ *Wenn ich Zeit **habe**, würde ich kommen* → ✅ **hätte**（条件句两边都要虚拟式）
* ❌ *Wenn ich Zeit hätte, **ich würde** kommen* → ✅ **würde ich** kommen
* ❌ *…, als ob er alles **weiß*** → ✅ **wüsste**
* ❌ *<b>Als ob</b> wüsste er alles*（省略 ob 却保留）→ ✅ **als wüsste er** alles
"""),

T('虚拟式/虚拟式一式', '虚拟式一式与间接引语', 'C1', """
# 虚拟式一式与间接引语（Konjunktiv I / indirekte Rede）

虚拟式一式几乎只出现在**新闻、报道、学术转述**中，用来表明
「这是**别人说的**，我不担保真假」。

## 一、构成：**不定式词干 + -e, -est, -e, -en, -et, -en**

| 人称 | sein | haben | können | gehen | machen |
| --- | --- | --- | --- | --- | --- |
| ich | **sei** | habe | könne | gehe | mache |
| du | sei(e)st | habest | könnest | gehest | machest |
| **er/sie/es** | **sei** | **habe** | **könne** | **gehe** | **mache** |
| wir | seien | haben | können | gehen | machen |
| ihr | seiet | habet | könnet | gehet | machet |
| sie/Sie | seien | haben | können | gehen | machen |

⚠ **sein 是唯一不带 -e 的单数形式**（ich sei / er sei），也是唯一全套形式都可用的动词。

## 二、与直陈式同形时改用虚拟式二式

第一人称单数和所有复数形式常与直陈式一样（*ich habe*, *wir haben*），
这时**换成虚拟式二式**以保持「转述」的标记：

| 直接引语 | 间接引语 |
| --- | --- |
| „Ich **habe** keine Zeit." | Er sagt, er **habe** keine Zeit. ✓（K I 可辨） |
| „Wir **haben** keine Zeit." | Sie sagen, sie **hätten** keine Zeit. ✓（K I 与直陈同形 → 用 K II） |
| „Sie **gehen** nach Hause." | Er sagt, sie **gingen** nach Hause. |

## 三、时间的三层对应

| 直接引语 | 间接引语 |
| --- | --- |
| 现在时 | **K I 现在**：Er sagt, er **sei** krank. |
| 过去时 / 完成时 / 过去完成时 | **K I 完成**：Er sagt, er **sei** krank **gewesen**. |
| 将来时 | **werde + 不定式**：Er sagt, er **werde** kommen. |

注意：间接引语只有**三个**时间层，不像直陈式有六个。

## 四、其他变化

* **人称代词**要转换：„Ich helfe **dir**." → Er sagte, er helfe **mir**.
* **dass 可要可不要**：*Er sagt, **dass** er krank **sei**.* ＝ *Er sagt, er **sei** krank.*
  （不带 dass 时语序**不变**，动词在第二位）
* **疑问句**用 ob 或疑问词：*Er fragte, **ob** ich Zeit **hätte**.*
* **命令**用 solle / möge：„Komm!" → Er sagte, ich **solle** kommen.

## 五、虚拟式一式的另一个用途：愿望与说明书

固定说法里保留下来：
*Es **lebe** die Freiheit!*｜*Gott **sei** Dank!*｜
*Man **nehme** 200 g Mehl …*（食谱）｜*Es **sei** darauf hingewiesen, dass …*（学术）

## 例句

1. **Der Minister erklärte, die Lage sei unter Kontrolle.** — 部长表示局势已受控制。
2. **Sie sagte, sie habe den Termin vergessen.** — 她说她忘了这个约会。
3. **Er behauptet, er sei nie dort gewesen.** — 他声称自己从未去过那里。
4. **Die Zeitung berichtet, die Preise würden weiter steigen.** — 报纸报道说物价还会上涨。
5. **Er fragte, ob ich ihm helfen könne.** — 他问我能不能帮他。
6. **Der Arzt sagte, ich solle mehr schlafen.** — 医生说我该多睡觉。
7. **Man nehme drei Eier und etwas Zucker.** — 取三个鸡蛋和一些糖。

## 常见错误

* ❌ *Er sagt, er **ist** krank*（书面转述）→ ✅ er **sei** krank
* ❌ *Sie sagen, sie **haben** keine Zeit* → ✅ sie **hätten** keine Zeit（同形要换 K II）
* ❌ *Er sagt, dass er **sei** krank* → ✅ dass er krank **sei**（有 dass 就是从句语序）
* ❌ 用间接引语时忘了转换人称和时间副词（heute → an jenem Tag）
"""),

T('虚拟式/虚拟式的替代形式', '虚拟式的替代形式与情态动词', 'C1', """
# 虚拟式的替代形式与情态动词的虚拟式

## 一、würde + 不定式：什么时候必须用？

| 情况 | 用 würde | 用原形 K II |
| --- | --- | --- |
| 弱变化动词（lernte, machte…） | ✓ 必须 | ✗ 与过去时同形 |
| sein, haben, werden, wissen | ✗ 不用 | ✓ wäre, hätte, würde, wüsste |
| 情态动词 | ✗ 不用 | ✓ könnte, müsste, dürfte, sollte |
| 生僻强变化（hülfe, stürbe, schwömme, träte） | ✓ 口语必须 | 仅见于文学 |
| 常用强变化（käme, ginge, gäbe, ließe, fände, bliebe） | 口语常用 | 书面优先 |

**条件句里不要两边都用 würde**（虽然口语常见，考试会扣分）：
✗ *Wenn ich Zeit **würde haben**, würde ich kommen.*
✓ *Wenn ich Zeit **hätte**, **würde** ich kommen.*

## 二、情态动词的虚拟式二式（高频！）

| 形式 | 用法 | 例句 |
| --- | --- | --- |
| **könnte** | 可能／礼貌请求 | **Könntest** du mir helfen? |
| **müsste** | 推测／本该 | Er **müsste** längst da sein. |
| **dürfte** | 有把握的推测／客气请求 | Das **dürfte** stimmen. |
| **sollte** | 建议 | Du **solltest** zum Arzt gehen. |
| **möchte** | 礼貌的愿望 | Ich **möchte** einen Kaffee. |
| **wollte**（≈ würde gern） | 婉转 | Ich **wollte** nur fragen … |

## 三、过去的「本该／本能／本可以」

**hätte + 不定式 + 情态动词不定式**（双不定式）：

| 结构 | 意思 | 例句 |
| --- | --- | --- |
| hätte … **können** | 本来能 | Ich **hätte** dir **helfen können**. |
| hätte … **sollen** | 本该 | Du **hättest** früher **kommen sollen**. |
| hätte … **müssen** | 本必须 | Wir **hätten** anrufen **müssen**. |
| hätte … **dürfen** | 本可以（获准） | Das **hätte** er nicht **sagen dürfen**. |

从句中助动词前置：*…, dass du früher **hättest kommen sollen**.*

## 四、不用虚拟式也能表达非现实的手段

| 手段 | 例句 |
| --- | --- |
| **beinahe / fast + K II** | Ich **wäre** fast eingeschlafen. |
| **sonst / andernfalls** | Ruf an, **sonst** macht er sich Sorgen. |
| **ohne … zu / ohne dass** | **Ohne** dich **hätte** ich es nicht geschafft. |
| **angenommen / gesetzt den Fall** | **Angenommen**, du **hättest** recht … |
| **eigentlich** | **Eigentlich** sollte ich arbeiten. |

## 例句

1. **Du solltest wirklich mehr schlafen.** — 你真的该多睡点。
2. **Das dürfte kein Problem sein.** — 这应该不成问题。
3. **Ich hätte dich gern früher angerufen.** — 我本想早点给你打电话的。
4. **Wir hätten den Zug fast verpasst.** — 我们差点没赶上火车。
5. **Das hättest du mir sagen müssen!** — 这你本该告诉我！
6. **Angenommen, es würde morgen regnen – was machen wir dann?** — 假设明天下雨，我们怎么办？
7. **Ich wollte nur fragen, ob Sie kurz Zeit hätten.** — 我只是想问问您有没有一点时间。

## 常见错误

* ❌ *Ich **würde** mehr Zeit **haben*** → ✅ Ich **hätte** mehr Zeit.
* ❌ *Ich **hätte** dir helfen **gekonnt*** → ✅ helfen **können**
* ❌ 双 würde：*Wenn er kommen würde, würde ich mich freuen* → 书面宜写 *Wenn er **käme**, würde ich mich freuen.*
* ❌ *Du **hättest sollen** früher kommen* → ✅ Du hättest früher **kommen sollen**.
"""),

T('被动态/过程被动态', '过程被动态', 'B1', """
# 过程被动态（Vorgangspassiv）

被动态把注意力从「谁做」转到「**做了什么**」。
构成：**werden（变位）+ 第二分词（句尾）**。

## 一、主动 → 被动的三步转换

主动：*<b>Der Mechaniker</b> repariert **das Auto**.*
被动：*<b>Das Auto</b> wird (**von dem Mechaniker**) repariert.*

| 步骤 | 规则 |
| --- | --- |
| 1 | 主动句的**第四格宾语** → 被动句的**主语（第一格）** |
| 2 | 主动句的主语 → **von + 第三格**（可省略），或干脆不出现 |
| 3 | 动词 → **werden + 第二分词** |

⚠ 主动句的**第三格宾语在被动句里保持第三格**，不能升为主语：
*Man hilft **dem Kind**.* → *<b>Dem Kind</b> wird geholfen.*（**Dem** 不变！）

## 二、von / durch / mit 的分工

| 介词 | 表示 | 例句 |
| --- | --- | --- |
| **von** + D. | 施动者（人、机构、有意志者） | Das Haus wurde **von** einem Architekten gebaut. |
| **durch** + A. | 中介、原因、手段 | Die Stadt wurde **durch** ein Erdbeben zerstört. |
| **mit** + D. | 工具 | Der Brief wurde **mit** der Hand geschrieben. |

## 三、无被动态的动词

* 所有**不及物**动词（除无人称被动，见另一节）：*Er schläft* 无被动
* **haben, besitzen, bekommen, kennen, wissen, kosten, es gibt**
* 大多数**反身**动词：*Ich wasche mich* 无被动
* 表示数量/度量：*Das Buch kostet 20 Euro.*

## 四、句框

被动句也是句框结构：**werden 在第二位，第二分词在句尾**。

*Das neue Krankenhaus **wird** nächstes Jahr in der Innenstadt **eröffnet**.*
从句：*…, weil das Krankenhaus eröffnet **wird**.*

## 例句

1. **Das Auto wird gerade repariert.** — 车正在修。
2. **Die Rechnung wird von der Firma bezahlt.** — 账单由公司支付。
3. **Hier werden alte Häuser abgerissen.** — 这里正在拆旧房子。
4. **Der Patient wird sofort operiert.** — 病人马上要动手术。
5. **Die Brücke wurde durch das Hochwasser beschädigt.** — 桥被洪水损坏了。
6. **Dem Kind wird von allen geholfen.** — 大家都在帮这个孩子。
7. **In Österreich wird auch Deutsch gesprochen.** — 奥地利也说德语。

## 常见错误

* ❌ *Das Auto **ist** repariert*（想说「正在被修」）→ ✅ **wird** repariert（ist ＝ 状态被动）
* ❌ *<b>Das Kind</b> wird geholfen* → ✅ **Dem Kind** wird geholfen.
* ❌ *Das Haus wurde **bei** einem Architekten gebaut* → ✅ **von** einem Architekten
* ❌ *Das Buch wird 20 Euro gekostet* → kosten 没有被动态
"""),

T('被动态/被动态的时态', '被动态的各种时态', 'B1', """
# 被动态的各种时态

被动态在每个时态里的形式，关键是记住 **werden 的相应形式 + 第二分词**，
以及完成时里 werden 的分词是特殊的 **worden**（不是 geworden）。

## 全时态表（以 *reparieren* 为例）

| 时态 | 形式 | 例句 |
| --- | --- | --- |
| **现在时** | wird + P II | Das Auto **wird repariert**. |
| **过去时** | wurde + P II | Das Auto **wurde repariert**. |
| **现在完成时** | ist + P II + **worden** | Das Auto **ist repariert worden**. |
| **过去完成时** | war + P II + **worden** | Das Auto **war repariert worden**. |
| **将来时 I** | wird + P II + **werden** | Das Auto **wird repariert werden**. |
| **将来时 II** | wird + P II + worden sein | Das Auto **wird repariert worden sein**. |

⚠ 两个必记点：
1. 被动完成时的助动词永远是 **sein**（不是 haben）。
2. werden 作被动助动词时，第二分词是 **worden**；
   作实义动词「变成」时才是 **geworden**（*Er ist Arzt **geworden**.*）。

## 情态动词 + 被动

**情态动词 + 第二分词 + werden**

| 时态 | 例句 |
| --- | --- |
| 现在 | Das Auto **muss repariert werden**. 车必须修。 |
| 过去 | Das Auto **musste repariert werden**. |
| 完成（双不定式） | Das Auto **hat repariert werden müssen**. |
| 虚拟式 | Das Auto **müsste repariert werden**. |

从句中的双不定式：*…, weil das Auto **hat** repariert werden **müssen**.*

## 从句中的语序

| 主句 | 从句 |
| --- | --- |
| Das Auto **wird** repariert. | …, weil das Auto repariert **wird**. |
| Das Auto **ist** repariert worden. | …, weil das Auto repariert worden **ist**. |
| Das Auto **muss** repariert werden. | …, weil das Auto repariert werden **muss**. |

## 例句

1. **Das Formular wird jeden Tag überprüft.** — 表格每天都会被检查。
2. **Die Kirche wurde im 15. Jahrhundert gebaut.** — 这座教堂建于 15 世纪。
3. **Mein Fahrrad ist gestern gestohlen worden.** — 我的自行车昨天被偷了。
4. **Das Problem war schon gelöst worden, bevor ich kam.** — 我来之前问题就已经解决了。
5. **Die Ergebnisse werden morgen bekannt gegeben werden.** — 结果将在明天公布。
6. **Der Antrag muss bis Freitag eingereicht werden.** — 申请必须在周五前提交。
7. **Alle Fenster haben ausgetauscht werden müssen.** — 所有窗户都不得不更换。

## 常见错误

* ❌ *Das Auto **hat** repariert worden* → ✅ **ist** repariert worden
* ❌ *… ist repariert **geworden*** → ✅ **worden**
* ❌ *Das Auto muss repariert **worden*** → ✅ repariert **werden**（情态动词后用不定式）
* ❌ *…, weil das Auto repariert **ist** worden* → ✅ repariert worden **ist**
"""),

T('被动态/状态被动', '状态被动与被动的替代形式', 'B2', """
# 状态被动与被动的替代形式

## 一、状态被动（Zustandspassiv）：**sein + 第二分词**

描述动作**完成后的状态**，回答「现在是什么样」。

| 过程被动（werden） | 状态被动（sein） |
| --- | --- |
| Die Tür **wird** geschlossen. 门正在被关上。 | Die Tür **ist** geschlossen. 门是关着的。 |
| Das Fenster **wird** geöffnet. | Das Fenster **ist** geöffnet. |
| Der Tisch **wird** gedeckt. | Der Tisch **ist** gedeckt. |

时态：*Die Tür **war** geschlossen.*（过去）／*Die Tür **ist** geschlossen **gewesen**.*（完成，罕用）

⚠ 状态被动只有**现在时和过去时**常用，且**通常不带 von + 施动者**。

## 二、被动的替代形式（Passiversatzformen）

德语常用主动结构表达被动意义，B2/C1 写作与阅读的重点。

| 结构 | 等价于 | 例句 |
| --- | --- | --- |
| **man + 主动** | 一般被动 | **Man** repariert das Auto. ＝ Das Auto wird repariert. |
| **sein + zu + 不定式** | können/müssen + 被动 | Das Problem **ist zu lösen**. ＝ … kann/muss gelöst werden. |
| **sich lassen + 不定式** | können + 被动 | Das Fenster **lässt sich** nicht öffnen. ＝ … kann nicht geöffnet werden. |
| **形容词 -bar** | können + 被动 | Das Wasser ist **trinkbar**. ＝ … kann getrunken werden. |
| **形容词 -lich** | können + 被动 | Die Schrift ist **unleserlich**. |
| **sich + 副词**（中动态） | 一般描述 | Das Buch **liest sich** gut. 这本书读起来很好。 |
| **bekommen/kriegen + P II**（受益被动） | 第三格宾语升级 | Er **bekommt** das Buch **geschenkt**. |
| **gehören + P II**（应当，口语） | müssen + 被动 | Das **gehört verboten**! 这该被禁止！ |

## 三、无人称被动（unpersönliches Passiv）

不及物动词也能构成被动，主语是虚位的 **es**（只在句首出现）：

* *<b>Es</b> wird hier viel **gearbeitet**.* 这里很忙。
* *Hier **wird** nicht **geraucht**.* 这里不许抽烟。（es 消失）
* *<b>Es</b> wurde bis Mitternacht **getanzt**.* 一直跳舞到半夜。

这种被动**没有主语**，强调「活动本身」，常用于规定和描述场面。

## 例句

1. **Das Geschäft ist ab 18 Uhr geschlossen.** — 商店 18 点后关门（状态）。
2. **Das Geschäft wird um 18 Uhr geschlossen.** — 商店 18 点关门（动作）。
3. **Dieses Formular ist bis Montag auszufüllen.** — 这张表须在周一前填好。
4. **Der Fehler lässt sich leicht beheben.** — 这个错误很容易排除。
5. **Man darf hier nicht parken.** — 这里不许停车。
6. **Es wird auf dem Fest bis morgen früh gefeiert.** — 派对要庆祝到明早。
7. **Sie hat ein Fahrrad geschenkt bekommen.** — 她收到了一辆自行车作礼物。

## 常见错误

* ❌ *Die Tür **ist** gerade geschlossen*（想说「正在关」）→ ✅ **wird** geschlossen
* ❌ *Das Problem ist zu **lösen werden*** → ✅ ist zu **lösen**
* ❌ *Das Fenster lässt **es** sich nicht öffnen* → ✅ Das Fenster **lässt sich** nicht öffnen.
* ❌ *<b>Hier es wird</b> nicht geraucht* → ✅ Hier **wird** nicht geraucht.（es 只在第一位）
"""),

T('非限定形式/带zu的不定式', '带 zu 的不定式', 'A2', """
# 带 zu 的不定式（Infinitiv mit zu）

不定式结构可以代替 dass 从句，让句子更简洁——**前提是主语相同或明确**。

## 一、基本形式

| 类型 | 形式 | 例子 |
| --- | --- | --- |
| 普通动词 | **zu** + 不定式 | **zu** lernen |
| 可分动词 | 前缀 + **zu** + 词干 | **auf**zu**stehen**, **ein**zu**kaufen** |
| 完成不定式 | P II + **zu** haben/sein | **gelernt zu haben**, **gekommen zu sein** |
| 被动不定式 | P II + **zu** werden | **repariert zu werden** |

## 二、什么时候用 zu 不定式？

| 触发 | 例句 |
| --- | --- |
| **动词 + zu 不定式** | Ich **versuche**, pünktlich **zu sein**. |
| **形容词 + zu 不定式** | Es ist **wichtig**, jeden Tag **zu üben**. |
| **名词 + zu 不定式** | Ich habe **keine Lust**, heute **auszugehen**. |
| **um / ohne / (an)statt … zu** | Ich lerne, **um** die Prüfung **zu bestehen**. |
| **es 作形式主语** | **Es** macht Spaß, Deutsch **zu lernen**. |

常见带 zu 的动词：versuchen, beginnen, anfangen, aufhören, vergessen, vorhaben,
hoffen, versprechen, beschließen, sich freuen, Angst haben, Zeit haben, scheinen, brauchen…

## 三、**不带 zu** 的情况（必须记住）

| 类别 | 动词 | 例句 |
| --- | --- | --- |
| 情态动词 | können, müssen, wollen, sollen, dürfen, mögen | Ich **muss gehen**. |
| 感官动词 | sehen, hören, fühlen, spüren | Ich **sehe** ihn **kommen**. |
| 使役 | lassen | Ich **lasse** das Auto **reparieren**. |
| 位移 | gehen, fahren, kommen（+ 目的） | Ich **gehe schwimmen**. |
| 其他 | bleiben, helfen（口语）, lernen, lehren | Er **bleibt sitzen**. |
| **werden** | 将来时 | Ich **werde kommen**. |

⚠ **brauchen** 特殊：否定时**要**带 zu：*Du **brauchst** nicht **zu kommen**.*
（口语中 zu 常省略）

## 四、um … zu / ohne … zu / (an)statt … zu

| 结构 | 意思 | 例句 | 主语条件 |
| --- | --- | --- | --- |
| **um … zu** | 为了 | Ich spare, **um zu reisen**. | 必须与主句主语相同 |
| **ohne … zu** | 没有…… | Er ging, **ohne** etwas **zu sagen**. | 同上 |
| **(an)statt … zu** | 不……而是 | **Statt zu** arbeiten, schläft er. | 同上 |

主语不同时改用从句：**damit** / **ohne dass** / **anstatt dass**。

## 五、逗号

新正字法中，单纯的 zu 不定式**可以不加逗号**；
但带 um/ohne/statt、或含扩展成分、或有指示词（es, darauf）时**必须加**。

## 例句

1. **Ich habe vergessen, das Fenster zu schließen.** — 我忘了关窗。
2. **Es ist nicht leicht, eine Wohnung zu finden.** — 找房子不容易。
3. **Er hat versprochen, morgen anzurufen.** — 他答应明天打电话。
4. **Sie ging weg, ohne sich zu verabschieden.** — 她走了，没有道别。
5. **Ich freue mich, dich wiederzusehen.** — 很高兴再见到你。
6. **Statt zu lernen, hat er Videospiele gespielt.** — 他没学习，在打游戏。
7. **Er behauptet, alles schon erledigt zu haben.** — 他声称一切都已办妥。

## 常见错误

* ❌ *Ich muss **zu** gehen* → ✅ Ich muss **gehen**
* ❌ *Ich habe vergessen **zu anrufen*** → ✅ **anzurufen**
* ❌ *Ich lerne Deutsch, **um** ich in Berlin **studiere*** → ✅ **um** … **zu studieren**
* ❌ *Ich sehe ihn **zu** kommen* → ✅ Ich sehe ihn **kommen**
"""),

T('非限定形式/分词', '第一分词与第二分词', 'B2', """
# 第一分词与第二分词（Partizip I / Partizip II）

## 一、构成

| | 构成 | 例子 | 意义 |
| --- | --- | --- | --- |
| **第一分词 (P I)** | 不定式 + **-d** | lachen → **lachend**；schlafen → **schlafend** | **主动、正在进行**（＝ing） |
| **第二分词 (P II)** | ge- + 词干 + -t/-en | machen → **gemacht**；schreiben → **geschrieben** | **被动、已完成**（及物动词）；**完成**（不及物） |

## 二、作定语（要加形容词词尾）

| 分词 | 例子 | 展开为 |
| --- | --- | --- |
| P I | das **schlafende** Kind 睡着的孩子 | das Kind, das schläft |
| P I | die **lachenden** Leute | die Leute, die lachen |
| P II（及物） | das **gekochte** Ei 煮熟的蛋 | das Ei, das gekocht wurde |
| P II（不及物完成） | der **angekommene** Zug 已到达的火车 | der Zug, der angekommen ist |
| **zu + P I**（Gerundivum） | die **zu lösende** Aufgabe 待解决的任务 | die Aufgabe, die gelöst werden muss |

⚠ 只有**位移/状态变化类不及物动词**（用 sein 的）才能用 P II 作定语；
*<b>der geschlafene</b> Mann* 是错的。

## 三、作状语（不加词尾）

* *Er kam **lachend** ins Zimmer.* 他笑着走进房间。
* *<b>Verglichen</b> mit gestern ist es heute kalt.* 和昨天相比今天很冷。
* 短语：**streng genommen**（严格说来）、**offen gestanden**（老实说）、
  **kurz gesagt**（简言之）、**vorausgesetzt, dass**（前提是）

## 四、作形容词/名词化

许多分词已变成独立词：*spannend*（扮演形容词）、*bekannt*、*interessiert*。
名词化：**der/die Reisende**（旅客）、**der Angestellte**（职员）、
**der Verletzte**（伤者）、**die Studierenden**（学生们）——按形容词变格。

## 五、P I 与 P II 的意义对照

| P I（主动进行） | P II（被动完成） |
| --- | --- |
| das **kochende** Wasser 沸腾的水 | das **gekochte** Wasser 煮开过的水 |
| die **überraschende** Nachricht 令人惊讶的消息 | der **überraschte** Mann 感到惊讶的人 |
| ein **spannender** Film 扣人心弦的电影 | ein **gespannter** Zuschauer 全神贯注的观众 |

## 例句

1. **Das weinende Kind wurde von seiner Mutter getröstet.** — 哭泣的孩子被妈妈安慰了。
2. **Der reparierte Wagen steht schon vor der Tür.** — 修好的车已经停在门口。
3. **Sie verließ singend das Haus.** — 她唱着歌离开了房子。
4. **Die zu erledigenden Aufgaben stehen auf der Liste.** — 待办事项都在清单上。
5. **Streng genommen ist das nicht korrekt.** — 严格说来这不正确。
6. **Die Zahl der Studierenden ist gestiegen.** — 学生人数上升了。
7. **Ein überraschendes Ergebnis überraschte alle Beteiligten.** — 一个出人意料的结果让所有参与者都吃了一惊。

## 常见错误

* ❌ *das **schlafend** Kind* → ✅ das **schlafende** Kind（作定语要变格）
* ❌ *Er kam **lachende** ins Zimmer* → ✅ **lachend**（作状语不变格）
* ❌ *der **gearbeitete** Mann* → arbeiten 是不及物且用 haben，不能作 P II 定语
* ❌ 把 P I 当英语进行时用：*Ich bin **lernend*** → ✅ Ich lerne **gerade**.
"""),

T('非限定形式/扩展分词定语', '扩展的分词定语', 'C1', """
# 扩展的分词定语（erweitertes Partizipialattribut）

这是**书面德语的招牌结构**：把整个关系从句压缩成一个放在名词前的长定语。
学术论文、法律文本、新闻报道里随处可见，是 C1 阅读的关键难点。

## 一、结构公式

**冠词 + [ 状语 / 补足语 … + 分词 ] + 名词**

| 关系从句 | 扩展分词定语 |
| --- | --- |
| der Zug, **der um 8 Uhr in Berlin ankommt** | der **um 8 Uhr in Berlin ankommende** Zug |
| das Buch, **das gestern veröffentlicht wurde** | das **gestern veröffentlichte** Buch |
| die Aufgabe, **die bis morgen gelöst werden muss** | die **bis morgen zu lösende** Aufgabe |

## 二、三种分词的意义

| 分词 | 意义 | 对应从句 |
| --- | --- | --- |
| **P I**（-end） | 主动、同时 | der …, der … tut |
| **P II** | 被动、已完成（及物）／完成（不及物） | der …, der … wurde / ist |
| **zu + P I** | 被动 + 必要/可能（Gerundivum） | der …, der … werden muss/kann |

## 三、拆解长定语的四步法（阅读技巧）

以 *die von vielen Experten seit Jahren geforderte Reform* 为例：

1. 找**冠词**（die）和它对应的**名词**（Reform）——中间全是定语。
2. 找**分词**（geforderte），确定主被动：P II ＋ 及物动词 → 被动。
3. 把分词还原成从句谓语：*die Reform, die … gefordert wird/wurde*。
4. 把中间的成分按原顺序填回：*die Reform, die **von vielen Experten** **seit Jahren** gefordert wird*。

## 四、写作时的转换练习

| 关系从句 | 压缩后 |
| --- | --- |
| die Studenten, die in Deutschland studieren | die **in Deutschland studierenden** Studenten |
| der Vertrag, der letzte Woche unterschrieben wurde | der **letzte Woche unterschriebene** Vertrag |
| die Frage, die man nicht beantworten kann | die **nicht zu beantwortende** Frage |
| das Kind, das von seinen Eltern erzogen wird | das **von seinen Eltern erzogene** Kind |

## 五、使用限制

* 口语中几乎不用——**说话时请用关系从句**。
* 定语过长（超过 8–10 个词）会难以理解，写作时应拆回从句。
* **zu + P I** 只能由**及物动词**构成。
* 分词定语与关系从句**不能混合**在同一个名词上（会造成歧义）。

## 例句

1. **Die von der Regierung geplanten Reformen stoßen auf Kritik.** — 政府计划的改革遭到批评。
2. **Der im Jahr 1990 gegründete Verein hat heute 500 Mitglieder.** — 这家 1990 年成立的协会今天有 500 名会员。
3. **Die immer weiter steigenden Mieten sind ein großes Problem.** — 不断上涨的房租是个大问题。
4. **Das ist eine kaum zu lösende Aufgabe.** — 这是一项几乎无法解决的任务。
5. **Die vom Sturm beschädigten Häuser werden repariert.** — 被风暴损坏的房屋正在修缮。
6. **Der seit Wochen andauernde Streik lähmt den Verkehr.** — 持续数周的罢工使交通瘫痪。
7. **Alle an dem Projekt beteiligten Mitarbeiter erhalten eine Prämie.** — 所有参与该项目的员工都获得奖金。

## 常见错误

* ❌ *die **gefordert** Reform* → ✅ die **geforderte** Reform（必须带形容词词尾）
* ❌ *die **zu lösend** Aufgabe* → ✅ die **zu lösende** Aufgabe
* ❌ 用不及物动词构造被动式定语：*der **gelaufene** Mann* → ✗
* ❌ 在口语中堆砌长定语 → 说话时改用关系从句更自然
"""),

T('格/四个格总论', '四个格总论', 'A1', """
# 四个格总论（Die vier Kasus）

德语用**格（Kasus）**来标记一个名词在句中的角色。格不体现在名词本身，
而体现在它前面的**冠词、形容词词尾**上——所以学德语名词＝学冠词表。

| 格 | 德语名 | 提问 | 句子角色 | 例 |
| --- | --- | --- | --- | --- |
| 第一格 | Nominativ | **wer? / was?** | 主语、系表 | **Der Mann** schläft. |
| 第二格 | Genitiv | **wessen?** | 领属、第二格宾语 | das Auto **des Mannes** |
| 第三格 | Dativ | **wem?** | 间接宾语、介词宾语 | Ich helfe **dem Mann**. |
| 第四格 | Akkusativ | **wen? / was?** | 直接宾语、介词宾语 | Ich sehe **den Mann**. |

## 定冠词与不定冠词全表

| | 阳性 m. | 中性 n. | 阴性 f. | 复数 Pl. |
| --- | --- | --- | --- | --- |
| **N.** | **der** / ein | **das** / ein | **die** / eine | **die** / – |
| **A.** | **den** / einen | **das** / ein | **die** / eine | **die** / – |
| **D.** | **dem** / einem | **dem** / einem | **der** / einer | **den** + **-n** / – |
| **G.** | **des** + -(e)s / eines | **des** + -(e)s / eines | **der** / einer | **der** / – |

三条口诀：
1. **只有阳性在第四格变**（der → den），中性和阴性 N. = A.。
2. **第三格复数的名词要加 -n**（den Kinder**n**, den Freunde**n**），
   已有 -n 或以 -s 结尾的除外。
3. **阳性/中性第二格单数名词要加 -(e)s**（des Mann**es**, des Auto**s**）。

## 什么决定格？

| 决定因素 | 例子 |
| --- | --- |
| **动词的支配** | helfen + D.、sehen + A.、geben + D. + A. |
| **介词** | für + A.、mit + D.、wegen + G.、in + D./A. |
| **句子成分** | 主语永远第一格；表语（sein/werden/bleiben 后）也是**第一格** |
| **时间/度量的无介词表达** | **jeden Tag**（A.）、**eines Tages**（G.） |

## 例句

1. **Der Lehrer(N.) gibt dem Schüler(D.) das Buch(A.).** — 老师把书给学生。
2. **Wem gehört dieses Fahrrad?** — 这辆自行车是谁的？
3. **Das ist das Haus meines Onkels.** — 这是我叔叔的房子。
4. **Ich sehe den Hund, aber der Hund sieht mich nicht.** — 我看见了狗，可狗没看见我。
5. **Er ist ein guter Lehrer.** — 他是位好老师。（表语用第一格）
6. **Wir helfen den Kindern bei den Hausaufgaben.** — 我们帮孩子们做作业。
7. **Jeden Morgen trinke ich einen Kaffee.** — 每天早上我喝一杯咖啡。

## 常见错误

* ❌ *Er ist einen guter Lehrer* → ✅ *Er ist **ein guter** Lehrer*（sein 后用第一格）
* ❌ *Ich helfe **den** Mann* → ✅ **dem** Mann
* ❌ *mit den Kinder* → ✅ mit den Kinder**n**（第三格复数加 -n）
* ❌ *das Auto **des Mann*** → ✅ des Mann**es**
"""),

T('格/第一格与第四格', '第一格与第四格', 'A1', """
# 第一格与第四格（Nominativ und Akkusativ）

## 一、第一格（Nominativ）

**用在哪儿？**

| 用法 | 例句 |
| --- | --- |
| **主语** | **Der Zug** kommt. |
| **系动词后的表语**（sein, werden, bleiben, heißen, scheinen） | Er ist **ein Student**. / Sie wird **Ärztin**. |
| **同位语**（与第一格名词并列） | Herr Müller, **unser Lehrer**, ist krank. |
| **称呼语** | **Lieber Freund**, … |
| **als / wie 后接第一格名词时** | Er arbeitet als **Lehrer**. |

## 二、第四格（Akkusativ）

| 用法 | 例句 |
| --- | --- |
| **直接宾语**（及物动词） | Ich lese **das Buch**. |
| **第四格介词后** | für **mich**, ohne **ihn**, durch **den Park** |
| **方位介词表方向** | Ich gehe **in die Stadt**. |
| **时间段/时间点**（无介词） | **jeden Tag**, **nächste Woche**, **einen Monat lang** |
| **度量** | Der Turm ist **einen Meter** hoch. Es kostet **einen Euro**. |
| **固定表达** | Guten Tag! Vielen Dank! Herzlichen Glückwunsch! |

## 三、只有阳性区分！

| | m. | n. | f. | Pl. |
| --- | --- | --- | --- | --- |
| N. | **der / ein / mein** | das / ein | die / eine | die / meine |
| A. | **den / einen / meinen** | das / ein | die / eine | die / meine |

所以「格」的功夫其实就是：**看到阳性名词就想一下它是主语还是宾语**。

## 四、人称代词

| N. | ich | du | er | sie | es | wir | ihr | sie/Sie |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A.** | **mich** | **dich** | **ihn** | sie | es | **uns** | **euch** | sie/Sie |

## 五、词序自由但格不能错

德语靠格标记角色，所以宾语可以前置：
*<b>Den Film</b> habe ich schon gesehen.*（宾语在前场，仍是宾语）
中文和英语靠语序，德语靠**词尾**——这是德语学习的核心转变。

## 例句

1. **Der Hund beißt den Mann.** — 狗咬了那个男人。
2. **Den Hund beißt der Mann.** — 那个男人咬了狗。（语序变了，意思由格决定）
3. **Mein Bruder ist ein guter Koch.** — 我哥哥是个好厨师。
4. **Ich habe einen Bruder und eine Schwester.** — 我有一个哥哥和一个姐姐。
5. **Nächsten Sommer besuche ich meine Großeltern.** — 明年夏天我去看祖父母。
6. **Kennst du ihn?** — 你认识他吗？
7. **Der Fluss ist einen Kilometer breit.** — 这条河一公里宽。

## 常见错误

* ❌ *Ich bin **einen** Student* → ✅ **ein** Student
* ❌ *Ich habe **ein** Bruder* → ✅ **einen** Bruder
* ❌ *Ich sehe **er*** → ✅ Ich sehe **ihn**
* ❌ *Jeden **Tages** trinke ich Kaffee* → ✅ **jeden Tag**（时间段用第四格）
"""),

T('格/第三格', '第三格', 'A2', """
# 第三格（Dativ）

第三格是德语里「**受益者、感受者、方向的接受方**」的格。

## 一、第三格出现的四种场合

| 场合 | 例句 |
| --- | --- |
| **只支配第三格的动词** | Ich helfe **dir**. / Das gehört **mir**. |
| **双宾动词的间接宾语（人）** | Ich gebe **dem Kind** das Buch. |
| **第三格介词之后** | mit **dem** Bus, bei **meinem** Vater, seit **einem** Jahr |
| **方位介词表位置（Wo?）** | Das Buch liegt **auf dem** Tisch. |

## 二、第三格的形式

| | m. | n. | f. | Pl. |
| --- | --- | --- | --- | --- |
| 定冠词 | **dem** | **dem** | **der** | **den** (+名词 -n) |
| 不定冠词 | **einem** | **einem** | **einer** | – (keinen) |
| 人称代词 | **ihm** | **ihm** | **ihr** | **ihnen** |

第一/二人称代词：**mir, dir, uns, euch, Ihnen**。

⚠ 复数第三格名词**要加 -n**：mit den Kinder**n**, aus den Länder**n**
（复数已以 -n 或 -s 结尾的除外：mit den Frauen, mit den Autos）。

## 三、特殊用法

| 用法 | 说明 | 例句 |
| --- | --- | --- |
| **利益第三格**（Pertinenzdativ） | 表身体部位归属，代替物主冠词 | Er wäscht **sich** **die Hände**. / **Mir** tut der Kopf weh. |
| **判断第三格** | 「对我来说」 | Das ist **mir** zu teuer. / **Mir** ist kalt. |
| **形容词支配第三格** | ähnlich, dankbar, treu, bekannt, klar, wichtig, nützlich, peinlich | Das ist **mir** klar. |
| **无主语句** | 感受主体用第三格 | **Mir** ist schlecht. |
| **被动中保留** | 主动的第三格宾语在被动中不变 | **Dem Kind** wird geholfen. |

## 四、双宾语的语序

| 组合 | 顺序 | 例句 |
| --- | --- | --- |
| 名词 + 名词 | **D. → A.** | Ich gebe **dem Kind** **das Buch**. |
| 代词 + 名词 | **代词在前** | Ich gebe **es** **dem Kind**. / Ich gebe **ihm** **das Buch**. |
| 代词 + 代词 | **A. → D.** | Ich gebe **es** **ihm**. |

## 例句

1. **Kannst du mir bitte das Salz geben?** — 你能把盐递给我吗？
2. **Wie geht es Ihnen?** — 您好吗？
3. **Der Mantel gehört meiner Schwester.** — 这件大衣是我姐姐的。
4. **Mir ist heute den ganzen Tag kalt.** — 我今天一整天都觉得冷。
5. **Das Kleid steht dir ausgezeichnet.** — 这条裙子很适合你。
6. **Wir fahren mit den Kindern ans Meer.** — 我们带孩子们去海边。
7. **Ich habe es ihm schon gesagt.** — 我已经告诉他了。

## 常见错误

* ❌ *Ich danke **dich*** → ✅ Ich danke **dir**
* ❌ *mit den Freunde* → ✅ mit den Freunde**n**
* ❌ *Ich gebe **dem Kind** **es*** → ✅ Ich gebe **es** dem Kind
* ❌ *Ich wasche **meine** Hände*（德语更自然）→ ✅ Ich wasche **mir die** Hände
"""),

T('格/第二格', '第二格', 'B1', """
# 第二格（Genitiv）

第二格主要表示**领属关系**，是书面语的标志；口语常用 **von + 第三格** 代替。

## 一、形式

| | m. | n. | f. | Pl. |
| --- | --- | --- | --- | --- |
| 定冠词 | **des** + 名词 -(e)s | **des** + -(e)s | **der** | **der** |
| 不定冠词 | **eines** + -(e)s | **eines** + -(e)s | **einer** | – |

**名词加 -s 还是 -es？**

| 情况 | 词尾 | 例子 |
| --- | --- | --- |
| 单音节词 | **-es** | des Mann**es**, des Kind**es**, des Tag**es** |
| 以 -s, -ß, -x, -z, -tz 结尾 | **-es**（必须） | des Hause**s**, des Platz**es** |
| 多音节、以 -el/-er/-en 结尾 | **-s** | des Lehrer**s**, des Vater**s** |
| 外来词、以元音结尾 | **-s** | des Auto**s**, des Kino**s** |
| **n-变化名词** | **-(e)n** | des Student**en**, des Herr**n** |

## 二、位置

* **名词后置**（常规）：*das Haus **meines Vaters***
* **人名前置**（不带冠词）：**Annas** Buch、**Goethes** Werke
  （以 s/ß/x/z 结尾的人名加撇号：**Hans'** Auto）
* 表**类属**时：*die Farbe **des Autos***

## 三、其他用法

| 用法 | 例句 |
| --- | --- |
| **第二格介词后** | wegen **des** Regens, während **der** Ferien, trotz **des** Wetters |
| **第二格动词**（书面） | Wir gedenken **der Opfer**. / Er bedarf **der Ruhe**. |
| **第二格形容词** | Er ist sich **seiner Sache** sicher. / **des Lebens** müde |
| **不确定时间** | **eines Tages** 有一天；**eines Abends** 某天晚上 |
| **固定短语** | **meines Erachtens** 依我看；**letzten Endes** 归根结底；**guter Dinge** 心情好 |

## 四、口语替代：von + D.

| 书面（第二格） | 口语（von + D.） |
| --- | --- |
| das Auto **meines Bruders** | das Auto **von meinem Bruder** |
| die Mutter **des Kindes** | die Mutter **von dem Kind** |

**必须用 von** 的情况：
* 名词前没有冠词或形容词，无法体现第二格：*der Preis **von** Gold*
* 复数无冠词：*die Meinung **von** Experten*
* 地名/人名带修饰时：*die Museen **von** Berlin*

## 例句

1. **Das ist das Fahrrad meines Bruders.** — 这是我弟弟的自行车。
2. **Wegen des schlechten Wetters bleiben wir zu Hause.** — 由于天气不好我们待在家。
3. **Am Ende des Monats bin ich immer pleite.** — 每到月底我总是没钱。
4. **Die Rolle der Frauen hat sich stark verändert.** — 女性的角色发生了很大变化。
5. **Eines Tages wirst du mich verstehen.** — 总有一天你会理解我。
6. **Der Titel des Buches gefällt mir nicht.** — 我不喜欢这本书的标题。
7. **Er ist der Vorsitzende des Vereins.** — 他是协会主席。

## 常见错误

* ❌ *das Auto **von meines Bruders*** → ✅ von **meinem Bruder** 或 **meines Bruders**
* ❌ *des Student* → ✅ des Student**en**（n-变化）
* ❌ *Annas' Buch* → ✅ **Annas** Buch（不以 s 结尾的人名不用撇号）
* ❌ *wegen **dem** Wetter*（作文中）→ ✅ wegen **des** Wetters
"""),

T('语序/句框结构', '句框结构（Satzklammer）', 'A2', """
# 句框结构（Satzklammer）

德语句子的骨架是「**动词把句子夹起来**」：变位动词在左，另一个动词成分在右，
中间是**中场（Mittelfeld）**。这是德语语序最核心的概念。

## 一、句子的五个位置

| 前场 Vorfeld | 左括号 | 中场 Mittelfeld | 右括号 | 后场 Nachfeld |
| --- | --- | --- | --- | --- |
| Morgen | **will** | ich mit meinem Bruder nach Berlin | **fahren** | , weil er dort wohnt. |
| Ich | **habe** | gestern einen Film | **gesehen** | . |
| Er | **steht** | jeden Tag um sechs | **auf** | . |
| Das Auto | **wird** | gerade in der Werkstatt | **repariert** | . |

## 二、什么进右括号？

| 结构 | 右括号 |
| --- | --- |
| 完成时 | 第二分词：… **gesehen** |
| 情态动词 | 不定式：… **fahren** |
| 将来时 | 不定式：… **kommen** |
| 被动 | 第二分词：… **repariert** |
| 可分动词 | 前缀：… **auf** |
| 复合谓语 | 名词/形容词部分：Rad **fahren**, kaputt **machen** |
| 多个动词 | 顺序：不定式 + 情态动词 —— … **fahren müssen** |

## 三、三种句框类型

| 句型 | 左括号 | 例 |
| --- | --- | --- |
| **陈述句** | 变位动词在**第二位** | Ich **fahre** morgen nach Berlin. |
| **是否问句 / 命令句** | 变位动词在**第一位** | **Fährst** du morgen? / **Fahr** los! |
| **从句** | **连词**（动词到最右） | …, weil ich morgen nach Berlin **fahre**. |

从句里左右括号「合并」到句尾：*…, weil ich nach Berlin **fahren will**.*

## 四、为什么这个概念重要？

* 中场里的成分（时间、宾语、地点…）可以自由调换顺序，
  但**括号本身的位置不可动**。
* 学德语的第一大错误就是把动词写在了英语/中文的位置上。
* 长句子里，右括号可能在很远的地方——**读德语要先找到右括号才能理解句意**。

## 例句

1. **Ich habe gestern Abend mit meiner Familie in einem italienischen Restaurant gegessen.** — 昨晚我和家人在一家意大利餐厅吃饭。
2. **Morgen muss ich leider sehr früh aufstehen.** — 明天我不得不很早起床。
3. **Der Brief ist vor drei Tagen abgeschickt worden.** — 信三天前寄出了。
4. **Kannst du mir das bitte noch einmal erklären?** — 你能再给我解释一遍吗？
5. **Sie hat sich über das Geschenk sehr gefreut.** — 她对这份礼物非常高兴。
6. **Wir fangen um neun Uhr mit der Arbeit an.** — 我们九点开始工作。
7. **Er sagte, dass er den Termin nicht wahrnehmen könne.** — 他说他没法赴约。

## 常见错误

* ❌ *Ich habe **gesehen** einen Film gestern* → ✅ … einen Film **gesehen**
* ❌ *Ich **aufstehe** früh* → ✅ Ich **stehe** früh **auf**
* ❌ *Morgen **ich fahre** nach Berlin* → ✅ Morgen **fahre ich** …
* ❌ *…, weil ich **will** nach Berlin fahren* → ✅ weil ich nach Berlin **fahren will**
"""),

T('语序/前场与倒装', '前场与倒装', 'A1', """
# 前场与倒装（Vorfeld und Inversion）

德语陈述句最铁的规则：**变位动词永远在第二位（V2）**。
第一位（前场）只能放**一个成分**，放什么由信息重心决定。

## 一、前场只能放一个成分

| 前场 | 动词 | 其余 |
| --- | --- | --- |
| **Ich** | fahre | morgen nach Berlin. |
| **Morgen** | fahre | ich nach Berlin. |
| **Nach Berlin** | fahre | ich morgen. |
| **Mit dem Zug** | fahre | ich morgen nach Berlin. |
| **Weil ich Urlaub habe,** | fahre | ich morgen nach Berlin.（整个从句算一个成分） |

⚠ 前场放了别的成分，主语就必须移到动词**后面**——这就是所谓的**倒装**。
它不是「特殊句型」，而是 V2 规则的自然结果。

## 二、什么该放前场？

| 目的 | 例子 |
| --- | --- |
| 承接上文（已知信息） | **Das Buch** habe ich schon gelesen. |
| 强调时间/地点框架 | **Im Sommer** fahren wir ans Meer. |
| 对比 | **Ihn** kenne ich, **sie** nicht. |
| 衔接副词 | **Deshalb** bleibe ich zu Hause. |

## 三、不占位置的成分（位置 0）

以下东西放句首**不引起倒装**，因为它们不算前场成分：

| 类型 | 例子 |
| --- | --- |
| 并列连词 aber, denn, und, sondern, oder | *…, **denn** **ich habe** keine Zeit.* |
| 称呼语、感叹词 | ***Anna**, **kannst du** mir helfen?* / ***Ach**, **das ist** schade.* |
| ja / nein / doch | ***Nein**, **ich komme** nicht.* |
| 后接逗号的插入语 | ***Ehrlich gesagt**, **ich weiß** es nicht.*（也可倒装） |

## 四、动词在第一位的三种句子

| 句型 | 例句 |
| --- | --- |
| 是否问句 | **Kommst** du morgen? |
| 命令句 | **Mach** bitte das Fenster zu! |
| 省略 wenn 的条件句 | **Hätte** ich Zeit, käme ich mit. |

## 五、疑问词句

疑问词本身占前场：*<b>Wann</b> **kommst du**?*｜*<b>Warum</b> **hast du** das gemacht?*

## 例句

1. **Heute Abend gehe ich ins Kino.** — 今晚我去看电影。
2. **In München wohnt meine Tante.** — 我姑妈住在慕尼黑。
3. **Deutsch lerne ich seit zwei Jahren.** — 德语我学了两年了。
4. **Deshalb bin ich zu Hause geblieben.** — 所以我留在了家里。
5. **Nein, das stimmt nicht.** — 不，这不对。
6. **Als ich klein war, wohnten wir in Köln.** — 我小时候我们住在科隆。
7. **Und dann ist er einfach gegangen.** — 然后他就那么走了。

## 常见错误

* ❌ *Morgen **ich fahre** nach Berlin* → ✅ Morgen **fahre ich** nach Berlin
* ❌ *Heute Abend im Kino gehe ich*（前场两个成分）→ ✅ 只能放一个
* ❌ *Deshalb **ich bleibe** zu Hause* → ✅ Deshalb **bleibe ich** …
* ❌ *…, denn **habe ich** keine Zeit* → ✅ denn **ich habe** keine Zeit
"""),

T('语序/中场排序', '中场排序：TeKaMoLo', 'B1', """
# 中场排序：TeKaMoLo

中场（左右括号之间）里各成分的顺序不是随意的，遵循两套原则。

## 一、状语顺序：**TeKaMoLo**

| 缩写 | 德语 | 意思 | 提问 |
| --- | --- | --- | --- |
| **Te** | **Te**mporal | 时间 | wann? wie lange? wie oft? |
| **Ka** | **Ka**usal | 原因 | warum? weshalb? |
| **Mo** | **Mo**dal | 方式 | wie? womit? |
| **Lo** | **Lo**kal | 地点 | wo? wohin? woher? |

*Ich fahre **morgen**(Te) **wegen der Konferenz**(Ka) **mit dem Zug**(Mo) **nach Berlin**(Lo).*

这是**默认顺序**，不是铁律：被强调的成分可以前移，或干脆放到前场。

## 二、宾语与代词的顺序

| 规则 | 例句 |
| --- | --- |
| 代词**全部**排在名词前面 | Ich habe **es** **meinem Bruder** gegeben. |
| 多个代词：**N. → A. → D.** | **Er** hat **es** **mir** gegeben. |
| 多个名词：**D. → A.** | Ich habe **meinem Bruder** **das Buch** gegeben. |
| 反身代词紧跟主语 | Gestern hat **sich** **mein Bruder** erkältet. |

## 三、已知信息在前，新信息在后

德语中场的深层原则是**信息结构**：
**definit / 已知 → indefinit / 新**

* *Ich habe **dem Kind**(已知) **ein Buch**(新) gegeben.*
* *Ich habe **das Buch**(已知) **einem Kind**(新) gegeben.*

带定冠词、代词、专有名词的成分靠前；带不定冠词、无冠词的成分靠后。

## 四、nicht 的位置

**nicht 位于中场末尾、右括号之前**，但要放在这些成分**前面**：
* 右括号成分（分词、不定式、可分前缀）：*Ich habe ihn **nicht gesehen**.*
* 介词短语（表地点/方向的必要补足语）：*Ich fahre **nicht nach Berlin**.*
* 表语形容词：*Das ist **nicht gut**.*

## 五、完整的中场模板

| 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- |
| 主语（若不在前场） | 代词宾语 | 时间 | 原因 | 方式 | 地点 / 新信息宾语 |
| … hat | **er es mir** | gestern | deswegen | schnell | im Büro gegeben. |

## 例句

1. **Ich fahre morgen mit dem Auto nach Hamburg.** — 我明天开车去汉堡。
2. **Er hat mir gestern in der Kantine ein Buch geschenkt.** — 他昨天在食堂送了我一本书。
3. **Wir treffen uns wegen des Projekts heute Nachmittag im Büro.** — 我们为项目今天下午在办公室碰头。
4. **Sie hat es ihm nicht gesagt.** — 她没告诉他。
5. **Aus gesundheitlichen Gründen kann er leider nicht kommen.** — 出于健康原因他遗憾不能来。
6. **Ich habe dem Kind das Buch gegeben.** — 我把书给了那个孩子。
7. **Der Chef hat den Mitarbeitern die neuen Regeln ausführlich erklärt.** — 老板向员工详细解释了新规定。

## 常见错误

* ❌ *Ich fahre **nach Berlin morgen*** → ✅ **morgen nach Berlin**（时间在地点前）
* ❌ *Ich habe **meinem Bruder es** gegeben* → ✅ **es meinem Bruder**
* ❌ *Ich habe **nicht** ihn gesehen* → ✅ Ich habe ihn **nicht** gesehen
* ❌ *Er hat gestern **mir** ein Buch geschenkt* → ✅ **mir gestern**（代词优先）
"""),

T('语序/后场与框外成分', '后场与框外成分', 'B2', """
# 后场与框外成分（Nachfeld / Ausklammerung）

右括号之后的部分叫**后场**。德语原则上把一切塞进句框，
但有五类成分**习惯或必须**放到框外。

## 一、必须在后场的成分

| 类型 | 例句 |
| --- | --- |
| **从句** | Ich habe gehört, **dass er krank ist**. |
| **不定式结构** | Ich habe vergessen, **das Fenster zu schließen**. |
| **关系从句**（若离先行词太远） | Ich habe den Mann gesehen, **der gestern hier war**. |

## 二、常见的框外提取（Ausklammerung）

| 类型 | 框内（正式） | 框外（自然） |
| --- | --- | --- |
| **比较成分 als / wie** | Er ist **größer als ich** geworden. | Er ist größer geworden **als ich**. |
| **长介词短语** | Ich habe **mit dem neuen Kollegen aus Berlin** gesprochen. | Ich habe gesprochen **mit dem neuen Kollegen aus Berlin**.（口语） |
| **列举** | — | Wir haben alles gekauft: **Brot, Milch, Käse und Obst**. |
| **补充说明** | — | Er ist gestern angekommen, **völlig erschöpft**. |

框外提取会让句子更易读，但**书面正式文体倾向于把成分留在框内**。

## 三、比较成分的位置（最常考）

| 结构 | 位置 |
| --- | --- |
| **als / wie + 成分** | 通常在**右括号之后** |

* *Er hat mehr gearbeitet **als ich**.*
* *Sie ist so groß geworden **wie ihre Schwester**.*
* *Ich habe noch nie so viel gegessen **wie heute**.*

## 四、从句作前场时的「动词碰动词」

从句放在前场，主句动词紧随其后，形成两个动词相邻：
*<b>Weil es regnet</b>, **bleibe** ich zu Hause.*
*<b>Was du gesagt hast</b>, **stimmt** nicht.*

## 五、后场使用的分寸

| 场合 | 建议 |
| --- | --- |
| 口语 | 大量使用框外提取，句子更好懂 |
| 正式书面 | 尽量保持句框完整，从句/不定式除外 |
| 长中场（超过 10 词） | 把最长的介词短语提到框外，避免读者「失去右括号」 |

## 例句

1. **Ich habe gestern gehört, dass du umziehst.** — 我昨天听说你要搬家。
2. **Er hat versprochen, uns morgen anzurufen.** — 他答应明天给我们打电话。
3. **Das Wetter war besser, als wir erwartet hatten.** — 天气比我们预期的好。
4. **Sie hat viel mehr geleistet als alle anderen.** — 她做的比其他所有人都多。
5. **Wir haben lange gesprochen über die Zukunft des Projekts.** — 我们就项目的未来谈了很久。
6. **Weil der Zug Verspätung hatte, kamen wir zu spät.** — 因为火车晚点，我们迟到了。
7. **Er kam nach Hause, müde und hungrig.** — 他回到家，又累又饿。

## 常见错误

* ❌ *Ich habe **dass er krank ist** gehört* → ✅ 从句放后场
* ❌ *Er ist größer **als ich** geworden* 虽可，但更自然是 *… geworden **als ich***
* ❌ *<b>Weil es regnet</b>, **ich bleibe** zu Hause* → ✅ **bleibe ich**
* ❌ 在正式作文中把大量成分甩到框外 → 会显得口语化
"""),

T('句子类型/陈述句与疑问句', '陈述句与疑问句', 'A1', """
# 陈述句与疑问句

## 一、陈述句（Aussagesatz）：动词第二位

*Ich **fahre** morgen nach Berlin.*｜*Morgen **fahre** ich nach Berlin.*

## 二、是否问句（Ja/Nein-Frage）：动词第一位

*<b>Fährst</b> du morgen nach Berlin?*｜*<b>Hast</b> du das Buch gelesen?*

回答用 **ja / nein / doch**：

| 问题 | 回答「是」 | 回答「否」 |
| --- | --- | --- |
| 肯定问句：Kommst du? | **Ja**, ich komme. | **Nein**, ich komme nicht. |
| 否定问句：Kommst du **nicht**? | **Doch**, ich komme! | **Nein**, ich komme nicht. |

⚠ **doch** 专门用来**推翻否定问句的预设**，中文常译成「不，我来！」

## 三、疑问词问句（W-Frage）：疑问词第一位

| 疑问词 | 问什么 | 例句 |
| --- | --- | --- |
| **wer / wen / wem / wessen** | 人（四个格） | **Wem** hast du geholfen? |
| **was** | 事物 | **Was** machst du? |
| **wann** | 时间 | **Wann** kommst du? |
| **wo / wohin / woher** | 在哪／去哪／从哪 | **Wohin** fährst du? |
| **wie** | 怎样 | **Wie** geht es dir? |
| **warum / wieso / weshalb** | 为什么 | **Warum** lachst du? |
| **welch-**（变格） | 哪一个 | **Welchen** Film hast du gesehen? |
| **was für ein**（变格） | 什么样的 | **Was für ein** Auto hast du? |
| **wie viel / wie viele** | 多少 | **Wie viele** Bücher hast du? |
| **wo(r)- + 介词** | 问事物的介词宾语 | **Worauf** wartest du? |

## 四、welch- 与 was für ein 的区别

* **welch-**：从**已知的有限选择**中挑一个 → *<b>Welches</b> Auto nimmst du – das rote oder das blaue?*
* **was für ein**：问**性质、种类** → *<b>Was für ein</b> Auto ist das? – Ein Sportwagen.*
  （für 在这里**不支配格**，格由句子决定：*<b>Was für einen</b> Wagen hast du?*）

## 五、其他问句形式

| 形式 | 例句 |
| --- | --- |
| **反问/确认**（语调上扬） | Du kommst morgen? |
| **附加疑问** | Du kommst morgen, **oder**? / …, **nicht wahr**? |
| **礼貌请求式问句** | **Könnten Sie** mir bitte helfen? |
| **间接问句** | Ich weiß nicht, **ob** er kommt. / …, **wann** er kommt. |

## 例句

1. **Wohin fahrt ihr in den Ferien?** — 你们假期去哪儿？
2. **Hast du schon gegessen? – Nein, noch nicht.** — 你吃了吗？——还没有。
3. **Kommst du nicht mit? – Doch, natürlich!** — 你不一起来吗？——来啊，当然！
4. **Was für einen Beruf hat dein Vater?** — 你父亲做什么工作？
5. **Welches Kleid gefällt dir besser?** — 你更喜欢哪条裙子？
6. **Worüber habt ihr gesprochen?** — 你们谈了什么？
7. **Wie lange wohnst du schon hier?** — 你在这儿住多久了？

## 常见错误

* ❌ *<b>Du kommst</b> morgen?*（作正式疑问）→ ✅ **Kommst du** morgen?
* ❌ 否定问句用 ja 肯定：*Kommst du nicht? – **Ja**, ich komme* → ✅ **Doch**
* ❌ *<b>Was für</b> **einem** Auto hast du?* → ✅ **einen**（格由动词决定）
* ❌ *<b>Über was</b> sprecht ihr?*（口语可，书面）→ ✅ **Worüber**
"""),

T('句子类型/命令句与感叹句', '命令句、感叹句与愿望句', 'A2', """
# 命令句、感叹句与愿望句

## 一、命令句（Imperativsatz）

动词在**第一位**，du/ihr 形式**不带主语**：
*<b>Komm</b> her!*｜*<b>Macht</b> die Bücher auf!*｜*<b>Nehmen Sie</b> Platz!*

其他表达命令的方式（语气由强到弱）：

| 形式 | 例句 | 语气 |
| --- | --- | --- |
| 直陈式现在时 | **Du gehst** jetzt sofort ins Bett! | 最强硬 |
| 不定式（标语） | Nicht **rauchen**! / Bitte **anschnallen**! | 非人称 |
| 第二分词（口令） | **Aufgepasst**! **Stillgestanden**! | 军事/紧急 |
| 被动/无人称 | Hier **wird** nicht **geraucht**. | 规定 |
| 情态动词问句 | **Könnten Sie** bitte …? | 最礼貌 |
| müssen/sollen 陈述 | Du **solltest** früher schlafen. | 建议 |

## 二、感叹句（Ausrufesatz）

| 结构 | 例句 |
| --- | --- |
| **Wie + 形容词 + 动词 + 主语!** | **Wie schön** ist das Wetter! |
| **Was für ein + 名词!** | **Was für ein** Glück! |
| **Welch (ein) + 名词!**（书面） | **Welch** eine Überraschung! |
| **So + 形容词!**（口语） | **So** ein Unsinn! |
| 动词第一位 + aber/doch | **Ist** das **aber** kalt! |
| 从句形式 | **Dass** du auch immer zu spät kommst! |

## 三、愿望句（Wunschsatz）

| 类型 | 结构 | 例句 |
| --- | --- | --- |
| **可实现的愿望** | 虚拟式二式 + gern | Ich **hätte gern** einen Kaffee. |
| **非现实愿望** | wenn + K II + doch/nur/bloß + ! | **Wenn** ich **doch nur** mehr Zeit **hätte**! |
| 省略 wenn | 动词第一位 | **Hätte** ich **bloß** nichts gesagt! |
| **祝愿**（虚拟式一式，固定） | K I | **Möge** es dir gut gehen! / Es **lebe** die Freiheit! |
| **祝福语**（省略动词） | — | Gute Reise! Frohes Fest! Alles Gute! |

## 四、语气词在这三类句中的作用

| 句型 | 常用语气词 |
| --- | --- |
| 命令句 | **doch, mal, doch mal, bitte, ruhig, einfach** |
| 感叹句 | **aber, vielleicht, doch** |
| 愿望句 | **doch, nur, bloß, doch nur** |

*<b>Komm doch mal</b> vorbei!*｜*Das ist **aber** teuer!*｜*Wäre er **doch nur** hier!*

## 例句

1. **Sei bitte pünktlich!** — 请准时！
2. **Bitte nicht stören!** — 请勿打扰！
3. **Wie schnell die Zeit vergeht!** — 时间过得真快！
4. **Was für ein schöner Tag!** — 多么美好的一天！
5. **Wenn ich doch nur besser Deutsch könnte!** — 我要是德语更好就好了！
6. **Hätte ich bloß früher angefangen!** — 我要是早点开始就好了！
7. **Ich hätte gern zwei Karten für heute Abend.** — 我想要两张今晚的票。

## 常见错误

* ❌ *<b>Du komm</b> her!* → ✅ **Komm** her!
* ❌ *Wie schön **das Wetter ist**!*（感叹句语序）→ ✅ Wie schön **ist das Wetter**!
* ❌ *Wenn ich mehr Zeit **habe**!* → ✅ **hätte**（非现实愿望要虚拟式）
* ❌ *Ich will einen Kaffee*（点单）→ ✅ Ich **hätte gern** einen Kaffee.
"""),

T('从句/从句总论', '从句总论：Nebensätze', 'A2', """
# 从句总论（Nebensätze）

从句是不能独立成句的句子，必须依附主句。德语从句的**唯一形式特征**是：
**变位动词跑到最后一位**。

## 一、三种从句形式

| 类型 | 引导词 | 动词位置 | 例句 |
| --- | --- | --- | --- |
| **连词从句** | dass, weil, wenn, obwohl… | **句尾** | …, weil ich müde **bin**. |
| **关系从句** | der, die, das, wer, was, wo… | **句尾** | der Mann, der dort **steht** |
| **间接疑问句** | ob / 疑问词 | **句尾** | …, ob er **kommt** / wann er **kommt** |

## 二、从句里动词的排列（由内到外）

| 结构 | 从句形式 |
| --- | --- |
| 简单时态 | …, weil er **kommt**. |
| 完成时 | …, weil er **gekommen ist**.（分词 + 助动词） |
| 情态动词 | …, weil er **kommen muss**. |
| 被动 | …, weil das Auto **repariert wird**. |
| 被动完成 | …, weil das Auto **repariert worden ist**. |
| **双不定式** | …, weil er **hat kommen müssen**.（助动词**提前**！） |
| 可分动词 | …, weil er früh **aufsteht**.（合起来） |

## 三、从句的位置

| 位置 | 例句 |
| --- | --- |
| **后置**（最常见） | Ich bleibe zu Hause, **weil es regnet**. |
| **前置**（占前场，主句倒装） | **Weil es regnet**, bleibe ich zu Hause. |
| **插入**（在主句中间，前后都要逗号） | Der Mann, **der dort steht**, ist mein Lehrer. |

## 四、从句的句法角色

| 角色 | 例句 |
| --- | --- |
| 主语从句 | **Dass du kommst**, freut mich. |
| 宾语从句 | Ich weiß, **dass du kommst**. |
| 状语从句 | Ich komme, **wenn ich Zeit habe**. |
| 定语从句 | das Buch, **das ich gestern gekauft habe** |

## 五、逗号规则

德语从句**必须**用逗号与主句隔开（与英语不同！）：
* *Ich weiß, dass er kommt.*（英语 I know that he comes 无逗号）
* 关系从句两边都要逗号：*Der Mann, der dort steht, ist mein Lehrer.*
* 例外：新正字法中单纯的 zu 不定式可不加逗号。

## 例句

1. **Ich glaube, dass er heute nicht kommt.** — 我觉得他今天不来。
2. **Wenn du Zeit hast, ruf mich bitte an.** — 你有时间的话请给我打电话。
3. **Er ist müde, weil er die ganze Nacht gearbeitet hat.** — 他很累，因为他工作了一整夜。
4. **Das Auto, das vor dem Haus steht, gehört meinem Nachbarn.** — 停在房前的车是我邻居的。
5. **Ich weiß nicht, ob ich morgen kommen kann.** — 我不知道明天能不能来。
6. **Obwohl es regnete, sind wir spazieren gegangen.** — 虽然下雨，我们还是去散步了。
7. **Sie ärgert sich, weil sie nicht hat mitfahren können.** — 她生气，因为没能一起去。

## 常见错误

* ❌ *…, weil ich **bin** müde* → ✅ weil ich müde **bin**
* ❌ *Wenn du Zeit hast, **du rufst** mich an* → ✅ **rufst du** mich an（也可用命令式）
* ❌ 漏逗号：*Ich weiß dass er kommt* → ✅ *Ich weiß, dass er kommt*（dass 前必须有逗号）
* ❌ *…, weil er kommen müssen **hat*** → ✅ weil er **hat** kommen müssen
"""),

T('从句/dass从句', 'dass 从句与 es 的用法', 'B1', """
# dass 从句与 es 的用法

**dass** 引导内容从句，本身没有意义，只是把一个完整句子「打包」成主句的一个成分。

## 一、dass 从句的三种角色

| 角色 | 例句 | 可替换为 |
| --- | --- | --- |
| **宾语从句** | Ich hoffe, **dass** du kommst. | 名词：Ich hoffe auf dein Kommen. |
| **主语从句** | **Dass** du kommst, freut mich. | Es freut mich, dass du kommst. |
| **同位/说明** | die Tatsache, **dass** er gelogen hat | — |

## 二、常见的引导词

| 类别 | 词 |
| --- | --- |
| 言语类动词 | sagen, erzählen, berichten, behaupten, erklären, versprechen |
| 认知类动词 | wissen, glauben, denken, meinen, hoffen, vermuten, finden |
| 感情类动词 | sich freuen, sich ärgern, bedauern, fürchten |
| 无人称表达 | es ist wichtig/klar/schade/möglich, es freut mich, es stimmt |

## 三、什么时候可以省略 dass？

在言语/认知动词之后可以省略，此时从句**语序不变**（动词第二位）：

* *Ich glaube, **dass** er krank **ist**.* ＝ *Ich glaube, er **ist** krank.*
* *Er sagt, **dass** er kommt.* ＝ *Er sagt, er kommt.*

⚠ 感情动词和无人称表达之后**不能省略**：
✗ *Es freut mich, du kommst.* → ✓ *Es freut mich, **dass** du kommst.*

## 四、关键点：es 的四种身份

| 身份 | 说明 | 例句 |
| --- | --- | --- |
| **形式主语（占位）** | 从句在后场时占前场；从句前置则消失 | **Es** ist schade, dass … ／ Dass …, ist schade. |
| **形式宾语** | 与从句呼应，不能省略 | Ich finde **es** gut, dass du kommst. |
| **真主语**（无人称动词） | 不能省略、不能替换 | **Es** regnet. **Es** gibt … |
| **回指代词** | 指前面提到的中性名词 | Das Buch? Ich habe **es** gelesen. |

## 五、介词 + dass → da(r)- 复合词

动词带固定介词时，dass 从句前要用**代副词**：

| 动词 + 介词 | 与 dass 从句连用 |
| --- | --- |
| warten **auf** | Ich warte **darauf**, **dass** er kommt. |
| sich freuen **auf** | Ich freue mich **darauf**, **dass** du kommst. |
| denken **an** | Denk **daran**, **dass** wir morgen früh los müssen. |
| sich ärgern **über** | Er ärgert sich **darüber**, **dass** niemand hilft. |

## 六、dass 从句 vs. zu 不定式

主语相同时，**zu 不定式更简洁自然**：
*Ich hoffe, **dass ich** dich bald sehe.* → *Ich hoffe, dich bald **zu sehen**.*
主语不同时**必须**用 dass：*Ich hoffe, **dass du** bald kommst.*

## 例句

1. **Ich hoffe, dass wir uns bald wiedersehen.** — 我希望我们很快再见。
2. **Es ist wichtig, dass du pünktlich bist.** — 你准时很重要。
3. **Dass er gelogen hat, war allen klar.** — 他撒了谎，这一点大家都清楚。
4. **Ich finde es gut, dass du dich entschuldigt hast.** — 我觉得你道歉是对的。
5. **Wir warten darauf, dass der Regen aufhört.** — 我们在等雨停。
6. **Er sagt, er habe keine Zeit.** — 他说他没时间。（省略 dass）
7. **Die Tatsache, dass niemand geholfen hat, ärgert mich.** — 没人帮忙这件事让我恼火。

## 常见错误

* ❌ *Ich glaube, dass er **ist** krank* → ✅ dass er krank **ist**
* ❌ *Ich warte, **dass** er kommt* → ✅ Ich warte **darauf**, dass er kommt
* ❌ *Es freut mich, du kommst* → ✅ …, **dass** du kommst
* ❌ *Ich hoffe, dass ich dich zu sehen* → ✅ Ich hoffe, dich **zu sehen**
"""),

T('从句/间接疑问句', '间接疑问句', 'B1', """
# 间接疑问句（indirekte Fragesätze）

把一个问题「嵌进」另一个句子里，就成了间接疑问句。它是**从句**，
所以**动词到句尾**，而且**句末用句号而不是问号**（除非整句是问句）。

## 一、两种引导方式

| 原问句类型 | 引导词 | 例子 |
| --- | --- | --- |
| **是否问句**（无疑问词） | **ob** | Kommt er? → Ich weiß nicht, **ob** er **kommt**. |
| **W-问句**（有疑问词） | **原疑问词** | Wann kommt er? → Ich weiß nicht, **wann** er **kommt**. |

## 二、转换的四个变化

| 变化 | 直接 | 间接 |
| --- | --- | --- |
| 加引导词 | Kommt er? | …, **ob** er kommt |
| 动词到句尾 | **Kommt** er? | …, ob er **kommt** |
| 人称代词调整 | „Hilfst **du mir**?" | Er fragte, ob **ich ihm** helfe. |
| 标点 | ? | .（整句非疑问时） |

## 三、常见的引导主句

| 类型 | 例子 |
| --- | --- |
| 询问 | Ich möchte wissen, … / Können Sie mir sagen, … / Ich frage mich, … |
| 不确定 | Ich weiß nicht, … / Ich bin nicht sicher, … / Es ist unklar, … |
| 转述 | Er hat gefragt, … / Sie wollte wissen, … |

**礼貌用法**：把直接问句改成间接问句会显得客气得多：
*<b>Wo ist</b> der Bahnhof?* → *<b>Können Sie mir sagen, wo</b> der Bahnhof **ist**?*

## 四、ob vs. wenn vs. dass

| 词 | 用法 | 例句 |
| --- | --- | --- |
| **ob** | 间接**是否**问句（＝英语 whether/if 的疑问义） | Ich weiß nicht, **ob** er kommt. |
| **wenn** | 条件「如果」／时间「当」 | Ich komme, **wenn** ich Zeit habe. |
| **dass** | 陈述内容 | Ich weiß, **dass** er kommt. |

⚠ 中国学生最常见的错误是用 wenn 代替 ob——因为英语 if 兼有两义。

## 五、疑问词 + 介词

带介词的问句转成间接形式时，代副词照搬：
*<b>Worauf</b> wartest du?* → *Er fragte, **worauf** ich **warte**.*
*<b>Mit wem</b> sprichst du?* → *Ich weiß nicht, **mit wem** er **spricht**.*

## 六、与虚拟式的结合（书面转述）

*Er fragte, **ob** ich Zeit **hätte**.*｜*Sie wollte wissen, **wann** der Zug **abfahre**.*

## 例句

1. **Ich weiß nicht, ob er heute kommt.** — 我不知道他今天来不来。
2. **Können Sie mir sagen, wie spät es ist?** — 您能告诉我几点了吗？
3. **Er fragte mich, warum ich so spät gekommen sei.** — 他问我为什么来得这么晚。
4. **Mich interessiert, wie viel das kostet.** — 我想知道这要多少钱。
5. **Es ist unklar, wer den Fehler gemacht hat.** — 谁犯的错还不清楚。
6. **Sie wollte wissen, mit wem ich gesprochen hatte.** — 她想知道我和谁谈过。
7. **Ich frage mich, ob das eine gute Idee ist.** — 我怀疑这是不是个好主意。

## 常见错误

* ❌ *Ich weiß nicht, **wenn** er kommt*（想说「是否」）→ ✅ **ob**
* ❌ *Können Sie mir sagen, wo **ist** der Bahnhof?* → ✅ wo der Bahnhof **ist**
* ❌ *Ich weiß nicht, ob **kommt er*** → ✅ ob **er kommt**
* ❌ 间接疑问句后面加问号：*Ich weiß nicht, ob er kommt?* → ✅ 整句不是疑问句时用句号
"""),

T('关系从句/关系代词', '关系从句与关系代词', 'B1', """
# 关系从句与关系代词（Relativsätze）

关系从句用来修饰名词，相当于中文的「……的」。
它是从句，所以**动词在最后**，前后用逗号隔开。

## 一、关系代词表（≈ 定冠词，只有 4 处不同）

| | m. | n. | f. | Pl. |
| --- | --- | --- | --- | --- |
| **N.** | der | das | die | die |
| **A.** | den | das | die | die |
| **D.** | dem | dem | der | **denen** |
| **G.** | **dessen** | **dessen** | **deren** | **deren** |

粗体的四个形式与定冠词不同，必须单独记。

## 二、两条黄金规则

> **性和数**由**先行词**决定；**格**由**关系从句内部的角色**决定。

*Der Mann, **der** dort steht, …*（阳性单数；从句里作主语 → N.）
*Der Mann, **den** ich kenne, …*（阳性单数；从句里作宾语 → A.）
*Der Mann, **dem** ich geholfen habe, …*（helfen + D. → D.）
*Der Mann, **dessen** Auto kaputt ist, …*（领属 → G.）

## 三、第二格关系代词的特殊语法

**dessen / deren 后面的名词不带冠词**，且形容词按**混合变化**：

* *der Mann, **dessen** Auto* ✓ ／ *dessen **das** Auto* ✗
* *die Frau, **deren** neues Buch gerade erschienen ist*（neue**s** 是混合变化的中性词尾）
* *die Kinder, **deren** Eltern arbeiten*

## 四、关系从句的位置

紧跟先行词；如果先行词后还有句框成分，可以移到句末：

* *Der Mann, **der dort steht**, ist mein Lehrer.*（插入）
* *Ich habe gestern den Mann getroffen, **der uns geholfen hat**.*（后置）

## 五、welch- 作关系代词

*welcher / welche / welches* 也可作关系代词，但**非常书面、过时**，
现代德语只在避免 der 重复时偶尔使用：
*das Buch, **welches** ich meinte*（一般说 *das*）

## 六、与中文的最大差别

中文「……的」在名词**前**，德语关系从句在名词**后**：
「站在那儿的那个男人」→ *der Mann, **der dort steht***
翻译时必须做前后顺序的转换。

## 例句

1. **Das ist der Kollege, der mir immer hilft.** — 这是那位总帮我的同事。
2. **Der Film, den wir gestern gesehen haben, war langweilig.** — 我们昨天看的电影很无聊。
3. **Die Frau, der ich das Buch geliehen habe, ist verreist.** — 我把书借给的那位女士出门了。
4. **Ich kenne einen Mann, dessen Sohn in China studiert.** — 我认识一个人，他儿子在中国上学。
5. **Das sind die Studenten, denen der Professor geholfen hat.** — 这些是教授帮过的学生。
6. **Die Stadt, deren Altstadt sehr schön ist, heißt Regensburg.** — 那座老城很美的城市叫雷根斯堡。
7. **Er hat mir ein Buch geschenkt, das ich schon lange lesen wollte.** — 他送了我一本我早就想读的书。

## 常见错误

* ❌ *Der Mann, **den** dort steht* → ✅ **der**（从句里是主语）
* ❌ *Der Mann, **der** ich kenne* → ✅ **den**（从句里是宾语）
* ❌ *die Kinder, **deren die** Eltern* → ✅ **deren** Eltern（不带冠词）
* ❌ *Das ist der Mann, der dort **steht nicht*** → 语序：der dort **nicht steht**
"""),

T('关系从句/介词加关系代词', '介词 + 关系代词', 'B1', """
# 介词 + 关系代词

当关系从句里的动词或成分需要**介词**时，介词要**放在关系代词前面**，
和关系代词一起提到从句最前。

## 一、基本结构：**介词 + 关系代词（格由介词决定）**

| 例句 | 说明 |
| --- | --- |
| das Haus, **in dem** ich wohne | wohnen **in** + D. |
| der Freund, **mit dem** ich spreche | sprechen **mit** + D. |
| die Frage, **auf die** ich warte | warten **auf** + A. |
| die Firma, **für die** er arbeitet | arbeiten **für** + A. |
| das Thema, **über das** wir reden | reden **über** + A. |

⚠ 介词**绝不能**留在从句末尾（不像英语 *the house I live in*）。

## 二、找对格的三步法

1. 找出从句里的**动词/介词搭配**（如 warten auf + A.）
2. 用这个介词的**支配**决定关系代词的格（auf → A.）
3. 性和数仍由**先行词**决定（die Frage → 阴性单数 → **die**）
→ *die Frage, **auf die** ich warte*

## 三、指地点/时间时的简化：wo / wohin / woher / als

| 完整形式 | 简化 |
| --- | --- |
| die Stadt, **in der** ich wohne | die Stadt, **wo** ich wohne |
| das Land, **in das** er reist | das Land, **wohin** er reist |
| der Tag, **an dem** wir uns trafen | der Tag, **als** wir uns trafen |
| die Zeit, **in der** ich studierte | die Zeit, **als** ich studierte |

**地名和国名只能用 wo**（不能用 in dem）：
*Berlin, **wo** ich studiert habe, …*

## 四、第二格 + 介词

*der Mann, **mit dessen** Sohn ich studiere*（我和他儿子一起上学的那个人）
*die Firma, **an deren** Erfolg niemand glaubte*

结构：**介词 + dessen/deren + 名词**。

## 五、was 的介词形式：**wo(r) + 介词**

先行词是 alles/nichts/etwas/das 或整句时：
*Das ist alles, **worauf** es ankommt.*
*Er kam zu spät, **worüber** sich alle ärgerten.*

## 例句

1. **Das ist das Haus, in dem ich geboren wurde.** — 这就是我出生的房子。
2. **Der Kollege, mit dem ich zusammenarbeite, ist sehr nett.** — 和我一起工作的同事很好。
3. **Die Prüfung, auf die ich mich vorbereite, ist im Juni.** — 我正在准备的考试在六月。
4. **Das Problem, über das wir gesprochen haben, ist gelöst.** — 我们谈过的问题解决了。
5. **Ich erinnere mich an den Tag, an dem wir uns kennenlernten.** — 我记得我们认识的那天。
6. **München, wo meine Schwester wohnt, gefällt mir sehr.** — 我姐姐住的慕尼黑我很喜欢。
7. **Der Autor, dessen Buch ich lese, kommt aus Wien.** — 我在读其作品的那位作者来自维也纳。

## 常见错误

* ❌ *das Haus, **das** ich wohne **in*** → ✅ das Haus, **in dem** ich wohne
* ❌ *die Frage, **auf der** ich warte* → ✅ **auf die**（auf + A.）
* ❌ *Berlin, **in dem** ich studiert habe* → ✅ Berlin, **wo** …
* ❌ *der Mann, **mit deren** Sohn* → ✅ **mit dessen** Sohn（阳性用 dessen）
"""),

T('关系从句/wer与was', '关系代词 wer、was 与 wo', 'B2', """
# 关系代词 wer、was 与 wo

除了 der/die/das，德语还有几种**没有具体先行词**的关系从句。

## 一、**wer**：泛指「凡是……的人」

按四个格变化：**wer – wen – wem – wessen**。
主句常用 **der / den / dem** 呼应（格相同时可省略）。

| 例句 | 说明 |
| --- | --- |
| **Wer** nicht arbeitet, (**der**) soll auch nicht essen. | 不劳动者不得食 |
| **Wer** zuletzt lacht, lacht am besten. | 谚语 |
| **Wen** ich einlade, (**den**) bestimme ich selbst. | wen(A.) / den(A.) |
| **Wem** ich vertraue, **dem** helfe ich auch. | wem(D.) / dem(D.) |

⚠ 主从句格不同时，**主句的呼应词不能省略**：
*<b>Wer</b>(N.) fleißig ist, **dem**(D.) hilft das Glück.*

## 二、**was**：先行词是「事」

| 先行词类型 | 例句 |
| --- | --- |
| **alles, nichts, etwas, vieles, weniges, manches** | Das ist alles, **was** ich weiß. |
| **das / dasjenige** | Das ist **das**, **was** ich meine. |
| **中性名词化形容词最高级** | Das Beste, **was** mir passiert ist. |
| **整个主句**（放句末） | Er kam zu spät, **was** mich sehr ärgerte. |
| 无先行词（泛指） | **Was** du sagst, stimmt nicht. |

带介词时用 **wo(r)-** 复合词：
*Das ist etwas, **worüber** ich nachdenken muss.*
*Er hat gelogen, **womit** niemand gerechnet hatte.*

## 三、**wo / wohin / woher**：地点

| 用法 | 例句 |
| --- | --- |
| 地名、国名（**只能**用 wo） | Wien, **wo** ich studiert habe, ist wunderschön. |
| 一般地点名词（可替代 in dem） | das Dorf, **wo**（＝ in dem）ich aufgewachsen bin |
| 方向 | die Stadt, **wohin** wir ziehen |
| 来源 | das Land, **woher** er kommt |
| 抽象「情况」 | Es gibt Fälle, **wo** das nicht gilt.（口语） |

## 四、时间的 **als / wo**

*der Tag, **an dem**（＝ **wo**，口语）wir uns kennenlernten*
*damals, **als** ich noch studierte*

## 五、对比小结

| 关系词 | 先行词 |
| --- | --- |
| der/die/das | 具体名词 |
| **wer** | 无先行词，指人（泛指） |
| **was** | alles/nichts/etwas/das、名词化最高级、整句 |
| **wo** | 地点、地名 |

## 例句

1. **Wer Deutsch lernen will, muss viel üben.** — 想学德语的人必须多练。
2. **Das ist alles, was ich dazu sagen kann.** — 这就是我能说的全部。
3. **Er hat mir nicht geantwortet, was mich sehr geärgert hat.** — 他没回我，这让我很生气。
4. **Wem ich einmal vertraut habe, den enttäusche ich nicht.** — 我一旦信任过谁，就不会让他失望。
5. **Zürich, wo meine Eltern leben, ist sehr teuer.** — 我父母住的苏黎世很贵。
6. **Das Beste, was du tun kannst, ist zu schweigen.** — 你能做的最好的事就是保持沉默。
7. **Es gibt nichts, worüber man sich Sorgen machen müsste.** — 没什么可担心的。

## 常见错误

* ❌ *Das ist alles, **das** ich weiß* → ✅ **was**
* ❌ *Wien, **in dem** ich studiert habe* → ✅ Wien, **wo** …
* ❌ *Er kam zu spät, **das** mich ärgerte* → ✅ **was**（指整句）
* ❌ *<b>Wer</b> fleißig ist, hilft das Glück* → ✅ …, **dem** hilft das Glück
"""),

T('关系从句/关系从句的应用', '关系从句的应用与替代', 'B2', """
# 关系从句的应用与替代

## 一、限定性与非限定性

德语**不用逗号区分**这两类（英语用），两者都要逗号。
区别只在语义：

* *Die Studenten, **die fleißig sind**, bestehen die Prüfung.*
  （限定：只有用功的那些通过）
* *Meine Schwester, **die in Berlin wohnt**, kommt morgen.*
  （非限定：补充说明，我只有一个姐姐）

## 二、关系从句与其他修饰手段的转换

| 关系从句 | 等价表达 |
| --- | --- |
| der Mann, **der dort steht** | der **dort stehende** Mann（P I 定语） |
| das Buch, **das gestern erschien** | das **gestern erschienene** Buch（P II 定语） |
| die Aufgabe, **die gelöst werden muss** | die **zu lösende** Aufgabe（zu + P I） |
| der Mann **mit dem Hut** | der Mann, **der einen Hut trägt** |
| die Frau **aus Berlin** | die Frau, **die aus Berlin kommt** |

**什么时候用哪个？**
口语和一般书面 → 关系从句；学术、新闻、法律 → 分词定语。

## 三、关系从句的位置难题

关系从句应紧跟先行词，但句框会造成冲突：

| 写法 | 评价 |
| --- | --- |
| Ich habe den Mann, **der uns geholfen hat**, gestern getroffen. | 正确但笨重 |
| Ich habe gestern den Mann getroffen, **der uns geholfen hat**. | ✓ 推荐（后置到后场） |

规则：关系从句可以**越过右括号**放到句末，只要不产生歧义。

## 四、多重关系从句的处理

嵌套过深会难懂，建议拆句：

✗ *Der Mann, der das Buch, das ich gestern gekauft habe, geschrieben hat, ist berühmt.*
✓ *Der Mann hat das Buch geschrieben, das ich gestern gekauft habe. Er ist berühmt.*

## 五、常见语篇功能

| 功能 | 例句 |
| --- | --- |
| 下定义 | Ein Vegetarier ist jemand, **der kein Fleisch isst**. |
| 补充背景 | Goethe, **der 1749 geboren wurde**, … |
| 评论整句 | Er kam nicht, **was uns alle enttäuschte**. |
| 指代不确定的人 | Ich suche jemanden, **der Chinesisch spricht**.（可用虚拟式表非现实） |

## 六、与虚拟式结合

寻找**尚不存在**的对象时，可用虚拟式二式：
*Ich suche eine Wohnung, die nicht so teuer **wäre**.*
（更常见的是直陈式，虚拟式强调「理想中的」）

## 例句

1. **Ein Wörterbuch ist ein Buch, das Wörter erklärt.** — 词典是解释词语的书。
2. **Ich habe gestern einen Film gesehen, der mich sehr beeindruckt hat.** — 我昨天看了一部让我印象深刻的电影。
3. **Meine Nachbarin, die Ärztin ist, hat mir geholfen.** — 我那位当医生的邻居帮了我。
4. **Wir suchen einen Mitarbeiter, der fließend Chinesisch spricht.** — 我们在找一位中文流利的员工。
5. **Der von allen erwartete Bericht ist endlich erschienen.** — 大家期待的报告终于发表了。
6. **Er hat die Prüfung nicht bestanden, was niemanden überraschte.** — 他没通过考试，这没让任何人意外。
7. **Alles, was du brauchst, findest du im Schrank.** — 你需要的一切都在柜子里。

## 常见错误

* ❌ 关系从句离先行词太远造成歧义 → 把从句移到句末或拆句
* ❌ *der Mann, der uns geholfen hat ist gekommen* 漏掉后一个逗号 → 关系从句两边都要逗号
* ❌ *die **gelöst** Aufgabe* → ✅ die **zu lösende** Aufgabe
* ❌ 用英语习惯省略关系代词：*das Buch **ich gekauft habe*** → 德语**不能省略**关系代词
"""),

T('条件与比较/条件句', '条件句', 'B1', """
# 条件句（Konditionalsätze）

## 一、现实条件（realis）：直陈式

| 结构 | 例句 |
| --- | --- |
| **wenn** + 现在时，主句现在时 | **Wenn** es regnet, **bleibe** ich zu Hause. |
| **falls / sofern**（可能性较低，书面） | **Falls** du Zeit hast, ruf mich an. |
| 省略 wenn（动词第一位） | **Regnet** es, bleibe ich zu Hause. |
| **im Falle, dass / für den Fall, dass** | **Im Falle, dass** es regnet, … |
| **bei + 名词** | **Bei** Regen bleiben wir zu Hause. |

## 二、非现实条件（irrealis）：虚拟式二式

| 时间 | 结构 | 例句 |
| --- | --- | --- |
| **现在/将来** | wenn + K II，主句 K II / würde | **Wenn** ich Zeit **hätte**, **würde** ich mitkommen. |
| **过去** | wenn + hätte/wäre + P II | **Wenn** ich Zeit **gehabt hätte**, **wäre** ich mitgekommen. |
| **混合** | 过去条件 → 现在结果 | **Wenn** ich damals studiert **hätte**, **wäre** ich jetzt Arzt. |

省略 wenn，动词提到第一位：
*<b>Hätte</b> ich Zeit, würde ich mitkommen.*
*<b>Wäre</b> ich du, würde ich es anders machen.*

## 三、其他条件表达

| 手段 | 例句 |
| --- | --- |
| **sonst / andernfalls**（否则） | Beeil dich, **sonst** verpassen wir den Zug. |
| **ohne … zu / ohne dass** | **Ohne** deine Hilfe **hätte** ich es nicht geschafft. |
| **es sei denn, dass**（除非） | Wir kommen, **es sei denn**, es regnet. |
| **vorausgesetzt, dass**（前提是） | **Vorausgesetzt, dass** alles klappt, … |
| **angenommen, dass**（假设） | **Angenommen**, du **hättest** recht … |
| **nur wenn / außer wenn** | **Nur wenn** du übst, wirst du besser. |
| **命令式 + und/oder** | Komm mit, **und** du wirst es nicht bereuen. |

## 四、wenn vs. falls vs. ob

| 词 | 用法 |
| --- | --- |
| **wenn** | 条件「如果」／时间「当」（可能性中性） |
| **falls** | 条件，强调「万一」，可能性较低，较书面 |
| **ob** | **不是**条件连词！只用于间接疑问「是否」 |

## 五、条件句里不能用 werden 表将来

✗ *Wenn ich Zeit **haben werde**, komme ich.*
✓ *Wenn ich Zeit **habe**, komme ich.*（用现在时表将来）

## 例句

1. **Wenn du müde bist, geh ins Bett.** — 你累了就去睡觉。
2. **Falls ich zu spät komme, fangt schon mal an.** — 万一我来晚了，你们先开始。
3. **Wenn ich reich wäre, würde ich um die Welt reisen.** — 我要是有钱就环游世界。
4. **Hätte ich das gewusst, wäre ich nicht gekommen.** — 早知道我就不来了。
5. **Beeil dich, sonst kommen wir zu spät.** — 快点，不然我们要迟到了。
6. **Wir gehen spazieren, es sei denn, es regnet.** — 我们去散步，除非下雨。
7. **Ohne dich hätte ich die Prüfung nicht bestanden.** — 没有你我考不过这场考试。

## 常见错误

* ❌ *Wenn ich Zeit **habe**, **würde** ich kommen* → 两边时态要一致
* ❌ *<b>Ob</b> es regnet, bleibe ich zu Hause* → ✅ **Wenn**
* ❌ *Wenn ich Zeit hätte, **ich würde** kommen* → ✅ **würde ich** kommen
* ❌ *Wenn ich morgen Zeit **haben werde*** → ✅ Zeit **habe**
"""),

T('条件与比较/比较从句', '比较级、最高级与比较从句', 'A2', """
# 比较级、最高级与比较从句

## 一、三个等级的构成

| 等级 | 构成 | 例子 |
| --- | --- | --- |
| **原级** | 原形 | schnell, schön, alt |
| **比较级** | **+ -er**（单音节常变音） | schnell**er**, sch**ö**n**er**, **ä**lt**er** |
| **最高级** | **am + -sten** / **der/die/das + -ste** | am schnell**sten** / der schnell**ste** |

变音的单音节形容词：alt, jung, groß, kurz, lang, warm, kalt, stark, schwach,
hart, klug, dumm, arm, scharf, hoch, nah, oft, grob。

以 **-d, -t, -s, -ß, -z, -sch** 结尾的最高级加 **-est**：
kält**est**-, heiß**est**-, kürz**est**-, hübsch**est**-。

## 二、不规则形式（必背）

| 原级 | 比较级 | 最高级 |
| --- | --- | --- |
| gut | **besser** | am **besten** |
| viel | **mehr** | am **meisten** |
| gern | **lieber** | am **liebsten** |
| hoch | **höher** | am **höchsten** |
| nah | **näher** | am **nächsten** |
| groß | **größer** | am **größten** |
| bald | **eher** | am **ehesten** |

## 三、比较从句：wie 和 als

| 结构 | 用法 | 例句 |
| --- | --- | --- |
| **(genau)so … wie** | 相等 | Er ist **so groß wie** ich. |
| **nicht so … wie** | 不及 | Er ist **nicht so alt wie** du. |
| **-er als** | 超过 | Er ist **älter als** ich. |
| **je … desto/umso** | 越……越 | **Je** mehr, **desto** besser. |
| **als ob / als wenn**（K II） | 好像 | Er tut so, **als ob** er alles wüsste. |
| **immer + 比较级** | 越来越 | Es wird **immer kälter**. |

⚠ 比较对象的**格与被比较的成分一致**：
*Ich kenne ihn besser als **dich**.*（比较宾语）
*Ich kenne ihn besser als **du**.*（比较主语——意思完全不同！）

## 四、比较级/最高级作定语要加词尾

**先加比较级/最高级词尾，再加形容词变格词尾**：
*ein **älterer** Mann*｜*die **schönste** Stadt*｜*mein **bester** Freund*
*mit dem **schnellsten** Zug*

## 五、am -sten 与 der -ste 的区别

| 形式 | 用法 | 例句 |
| --- | --- | --- |
| **am schnellsten** | 作**状语/表语**（不带名词） | Er läuft **am schnellsten**. |
| **der/die/das schnellste** | 作**定语**（带名词） | Er ist **der schnellste** Läufer. |

## 六、加强与减弱

**viel / weit / bedeutend / wesentlich + 比较级**（强）：*viel besser*
**etwas / ein bisschen / ein wenig + 比较级**（弱）：*etwas besser*
**bei weitem der beste**（远远最好的）

## 例句

1. **Mein Bruder ist zwei Jahre älter als ich.** — 我哥哥比我大两岁。
2. **Dieses Buch ist genauso interessant wie das andere.** — 这本书和那本一样有趣。
3. **Im Sommer sind die Tage am längsten.** — 夏天白天最长。
4. **Je länger ich hier wohne, desto besser gefällt es mir.** — 我在这儿住得越久就越喜欢。
5. **Sie spricht viel besser Deutsch als ihr Mann.** — 她德语说得比她丈夫好得多。
6. **Das ist der schönste Tag meines Lebens.** — 这是我一生中最美好的一天。
7. **Es wird immer schwieriger, eine Wohnung zu finden.** — 找房子越来越难了。

## 常见错误

* ❌ *älter **wie** ich* → ✅ älter **als** ich（比较级用 als）
* ❌ *so groß **als** ich* → ✅ so groß **wie** ich
* ❌ *Er ist **der am schnellsten** Läufer* → ✅ **der schnellste** Läufer
* ❌ *ein **älter** Mann* → ✅ ein **älterer** Mann
"""),

T('条件与比较/als ob', 'als ob 与非现实比较', 'B2', """
# als ob 与非现实比较（irreale Vergleichssätze）

「好像……似的」——说话人认为这个比较**不符合事实**，所以要用**虚拟式**。

## 一、三种形式

| 结构 | 语序 | 例句 |
| --- | --- | --- |
| **als ob** + K II | 动词到**句尾** | Er tut so, **als ob** er alles **wüsste**. |
| **als wenn** + K II（口语） | 动词到句尾 | Er tut so, **als wenn** er müde **wäre**. |
| **als** + K II | 动词**紧跟 als**（第二位式倒装） | Er tut so, **als wüsste** er alles. |

⚠ **als** 后面不能再有 ob/wenn，且动词**必须紧跟**：
✗ *als er alles wüsste* → ✓ *<b>als wüsste er</b> alles*

## 二、时间关系

| 关系 | 形式 | 例句 |
| --- | --- | --- |
| **同时** | K II 现在 | Sie sieht aus, **als ob** sie krank **wäre**. |
| **先于主句** | K II 过去（hätte/wäre + P II） | Sie sieht aus, **als ob** sie geweint **hätte**. |

## 三、常见的引导表达

| 表达 | 意思 |
| --- | --- |
| **so tun, als ob** | 装作 |
| **aussehen, als ob** | 看起来好像 |
| **scheinen, als ob** | 似乎 |
| **klingen, als ob** | 听起来像 |
| **wirken, als ob** | 给人感觉像 |
| **Es ist (mir), als ob** | 我觉得好像 |
| **das Gefühl haben, als ob** | 有种……的感觉 |

## 四、能不能用直陈式？

可以，但意思变了：用**直陈式**表示说话人认为**可能是真的**：

* *Es sieht aus, **als ob** es **regnet**.*（看样子真要下雨）
* *Es sieht aus, **als ob** es **regnen würde**.*（像是要下雨的样子，但也许不会）

考试和规范写作里，**als ob 一般搭配虚拟式二式**。

## 五、与 wie 的对比

| 结构 | 真实性 | 例句 |
| --- | --- | --- |
| **wie** | 真实比较 | Er arbeitet **wie** sein Vater.（他确实像他父亲那样工作） |
| **als ob** | 非现实 | Er arbeitet, **als ob** er nie müde **würde**.（其实他会累） |

## 例句

1. **Er tut so, als ob er mich nicht kennen würde.** — 他装作不认识我。
2. **Sie sieht aus, als hätte sie die ganze Nacht nicht geschlafen.** — 她看起来像一整夜没睡。
3. **Es klingt, als ob du krank wärst.** — 听起来你像是病了。
4. **Er redet, als wäre er der Chef.** — 他说话的口气像是老板。
5. **Mir ist, als ob ich das schon einmal erlebt hätte.** — 我觉得这事我好像经历过。
6. **Sie benimmt sich, als ob nichts passiert wäre.** — 她表现得好像什么都没发生。
7. **Das Zimmer sieht aus, als hätte hier ein Sturm getobt.** — 房间看起来像刮过一场风暴。

## 常见错误

* ❌ *als ob er alles **weiß*** → ✅ **wüsste**
* ❌ *<b>als</b> er alles wüsste* → ✅ **als wüsste er** alles
* ❌ *<b>als ob wüsste</b> er alles*（混用两种语序）→ ✅ als ob er alles wüsste
* ❌ 用 wie 表非现实：*Er tut so, **wie** er alles wüsste* → ✅ **als ob**
"""),

T('否定/nicht的位置', 'nicht 的位置', 'A2', """
# nicht 的位置

德语的 **nicht** 位置不固定，取决于**否定整句**还是**否定某一成分**。

## 一、句子否定（Satznegation）

**nicht 尽量靠后，但必须在下列成分之前：**

| 必须在 nicht 之后的成分 | 例句 |
| --- | --- |
| 右括号（第二分词、不定式、可分前缀） | Ich habe ihn **nicht gesehen**. / Ich rufe **nicht an**. |
| 表语（sein/werden/bleiben 后的形容词、名词） | Das ist **nicht gut**. / Er ist **nicht mein Freund**. |
| 必要的方向/地点补足语 | Ich fahre **nicht nach Berlin**. / Er wohnt **nicht in Köln**. |
| 与动词结合紧密的成分 | Er fährt **nicht Auto**. / Sie spielt **nicht Klavier**. |
| 介词宾语 | Ich warte **nicht auf ihn**. |

**nicht 在这些成分之后：**

| 在 nicht 之前的成分 | 例句 |
| --- | --- |
| 主语 | **Ich** komme nicht. |
| 变位动词 | Ich **komme** nicht. |
| 第三格/第四格宾语（定指） | Ich kenne **den Mann** nicht. |
| 时间状语 | Ich komme **heute** nicht. |
| 代词 | Ich habe **es ihm** nicht gegeben. |

**记忆公式**：主语 → 动词 → 代词 → 时间 → 定指宾语 → **nicht** → 方式 → 地点 → 右括号

## 二、成分否定（Sondernegation）

nicht 紧放在被否定的成分**前面**，通常后接 **sondern**：

* *Ich fahre **nicht heute**, sondern morgen.*
* *<b>Nicht ich</b> habe das gesagt, sondern er.*
* *Er hat **nicht das Buch** gekauft, sondern die Zeitung.*

## 三、与情态动词的组合意义差别

| 句子 | 意思 |
| --- | --- |
| Du **musst nicht** kommen. | 你**不必**来。 |
| Du **darfst nicht** kommen. | 你**不许**来。 |
| Er **kann nicht** kommen. | 他不能来。 |
| Er **braucht nicht zu** kommen. | 他不必来。 |

## 四、nicht 与 kein 的分工

| 用 **kein** | 用 **nicht** |
| --- | --- |
| 否定带**不定冠词**的名词：Ich habe **kein** Auto. | 否定带**定冠词/物主冠词**的名词：Ich habe **das Auto nicht**. |
| 否定**零冠词**名词：Ich habe **keine** Zeit. | 否定动词、形容词、副词、代词 |
| 否定**不可数**名词：Ich trinke **keinen** Kaffee. | 否定专有名词：Das ist **nicht** Anna. |

## 例句

1. **Ich kenne diesen Mann nicht.** — 我不认识这个人。
2. **Das Wetter ist heute nicht besonders gut.** — 今天天气不太好。
3. **Er ist gestern nicht gekommen.** — 他昨天没来。
4. **Wir fahren nicht nach Italien, sondern nach Spanien.** — 我们不去意大利，去西班牙。
5. **Ich habe ihm das Geld nicht gegeben.** — 我没把钱给他。
6. **Du musst dich nicht entschuldigen.** — 你不必道歉。
7. **Nicht alle Studenten haben bestanden.** — 不是所有学生都通过了。

## 常见错误

* ❌ *Ich habe **nicht** ihn gesehen*（句子否定）→ ✅ Ich habe ihn **nicht** gesehen
* ❌ *Ich fahre nach Berlin **nicht*** → ✅ **nicht nach Berlin**
* ❌ *Ich habe **nicht ein** Auto* → ✅ **kein** Auto
* ❌ *Das ist gut **nicht*** → ✅ Das ist **nicht** gut
"""),

T('否定/kein与其他否定词', 'kein 与其他否定词', 'A2', """
# kein 与其他否定词

## 一、kein 的变格（＝ein 的变格 + 复数）

| | m. | n. | f. | Pl. |
| --- | --- | --- | --- | --- |
| **N.** | kein | kein | keine | **keine** |
| **A.** | **keinen** | kein | keine | **keine** |
| **D.** | keinem | keinem | keiner | **keinen** |
| **G.** | keines | keines | keiner | **keiner** |

## 二、否定词全表

| 肯定 | 否定 | 例句 |
| --- | --- | --- |
| ein / – | **kein** | Ich habe **kein** Geld. |
| jemand | **niemand** | **Niemand** war da. |
| etwas / alles | **nichts** | Ich habe **nichts** gesagt. |
| irgendwo / überall | **nirgendwo / nirgends** | Ich finde ihn **nirgends**. |
| irgendwohin | **nirgendwohin** | Wir gehen **nirgendwohin**. |
| immer / oft | **nie / niemals** | Ich war **nie** in Japan. |
| noch | **nicht mehr / kein … mehr** | Ich habe **kein** Geld **mehr**. |
| schon | **noch nicht / noch kein** | Er ist **noch nicht** da. |
| auch | **auch nicht / auch kein** | Ich **auch nicht**. |
| und | **weder … noch** | **weder** Zeit **noch** Lust |
| alle | **kein / keiner** | **Keiner** hat geholfen. |

## 三、schon / noch 的否定配对（易错）

| 肯定 | 否定 |
| --- | --- |
| **schon**（已经） | **noch nicht**（还没） |
| **schon einmal**（曾经） | **noch nie**（从未） |
| **noch**（还有） | **nicht mehr / kein … mehr**（不再） |
| **immer noch**（仍然） | **immer noch nicht**（仍然没有） |

*Bist du **schon** fertig? – Nein, **noch nicht**.*
*Hast du **noch** Geld? – Nein, ich habe **kein** Geld **mehr**.*

## 四、双重否定

德语的两个否定词**互相抵消**（≠ 某些方言/英语口语）：
*Ich habe **nichts nicht** gesagt* ＝ 我什么都说了（罕用，容易误解）
**规范德语一句只用一个否定词**：
✗ *Ich habe **keine** Zeit **nicht***｜✓ *Ich habe **keine** Zeit*

例外：weder … noch 本身已含否定，不能再加 nicht/kein。

## 五、其他否定手段

| 手段 | 例子 |
| --- | --- |
| 前缀 **un-** | **un**freundlich, **Un**glück, **un**möglich |
| 前缀 **miss-** | **miss**verstehen, **Miss**erfolg |
| 后缀 **-los** | arbeits**los**, hoffnungs**los** |
| **nicht-** | **Nicht**raucher, **nicht**staatlich |
| **ohne** | **ohne** Probleme |
| **kaum** | Ich habe **kaum** geschlafen. 我几乎没睡。 |
| **wenig / selten** | Er kommt **selten**. |

## 六、niemand / jemand 的变格

| N. | A. | D. |
| --- | --- | --- |
| niemand | niemand(en) | niemand(em) |
| jemand | jemand(en) | jemand(em) |

带词尾的形式更正式；口语常用不带词尾的。

## 例句

1. **Ich habe keinen Hunger, aber großen Durst.** — 我不饿，但很渴。
2. **Niemand konnte mir helfen.** — 没人能帮我。
3. **Ich habe nichts davon gewusst.** — 我对此一无所知。
4. **Er raucht nicht mehr.** — 他不抽烟了。
5. **Ich war noch nie in Afrika.** — 我从没去过非洲。
6. **Wir haben weder Zeit noch Geld.** — 我们既没时间也没钱。
7. **So etwas gibt es nirgendwo sonst.** — 这种东西别处没有。

## 常见错误

* ❌ *Ich habe **nicht ein** Auto* → ✅ **kein** Auto
* ❌ *Ich habe **keine** Zeit **nicht*** → ✅ 只用一个否定词
* ❌ *Ich habe **nicht mehr kein** Geld* → ✅ **kein** Geld **mehr**
* ❌ *Bist du schon fertig? – **Nein, nicht noch.*** → ✅ **Noch nicht.**
"""),

T('动词/行动方式', '动作方式（Aktionsart）', 'C1', """
# 动作方式（Aktionsart）

**Aktionsart** 描述一个动词表达的动作**在时间上的性质**：是持续的、开始的、
结束的，还是反复的。它不同于「体（Aspekt）」——德语没有语法化的体，
只能靠**词汇手段**（前缀、后缀、构词）表达。

## 一、两大类

| 类别 | 意义 | 例子 |
| --- | --- | --- |
| **持续性（durativ / imperfektiv）** | 动作没有内在终点 | schlafen, arbeiten, wohnen, lieben, warten |
| **终结性（perfektiv）** | 动作有明确的起点或终点 | einschlafen, ankommen, finden, platzen |

## 二、终结性的细分

| 子类 | 意义 | 前缀/手段 | 例子 |
| --- | --- | --- | --- |
| **起始（inchoativ/ingressiv）** | 动作**开始** | ein-, er-, los-, auf- | **ein**schlafen 入睡；**er**blühen 开始开花；**los**fahren 出发 |
| **终止（egressiv/resultativ）** | 动作**完成/达到结果** | ver-, aus-, ab-, er- | **ver**blühen 凋谢；**aus**trinken 喝光；**er**schießen 击毙 |
| **瞬间（punktuell/momentan）** | 一瞬间完成 | — | platzen, finden, erblicken |
| **反复（iterativ/frequentativ）** | 反复进行 | -eln, -ern 后缀 | strei**cheln**（← streichen）；lä**cheln**（← lachen）；flatt**ern** |
| **强化（intensiv）** | 动作加强 | 元音/辅音变化 | schnitzen（← schneiden）；schluchzen |
| **使役（kausativ）** | 使某物发生某动作 | 元音变换 | **setzen**（使坐 ← sitzen）；**legen**（← liegen）；**tränken**（← trinken） |

## 三、成对的「持续 vs. 使役」动词

| 持续（不及物，强变化） | 使役（及物，弱变化） |
| --- | --- |
| sitzen 坐着 | **setzen** 使坐下 |
| liegen 躺着 | **legen** 放平 |
| stehen 立着 | **stellen** 竖着放 |
| hängen（hing）挂着 | **hängen**（hängte）挂上 |
| trinken 喝 | **tränken** 给……喝水 |
| fallen 落下 | **fällen** 砍倒 |
| sinken 下沉 | **senken** 使下降 |
| wachen 醒着 | **wecken** 唤醒 |
| verschwinden 消失 | — |

## 四、为什么这个概念有用？

1. **决定完成时助动词**：终结性的位移/状态变化动词用 **sein**
   （*Er **ist** eingeschlafen*），持续性的用 **haben**（*Er **hat** geschlafen*）。
2. **决定能否与时间状语搭配**：
   持续性动词配 *stundenlang, lange*；终结性动词配 *plötzlich, um 8 Uhr*。
   ✗ *Ich bin **stundenlang** eingeschlafen.*
3. **决定能否用第一分词作定语**：终结性动词的 P I 常不自然。
4. **解释前缀的意义**：前缀 er-/ver-/ab-/aus- 的核心功能往往就是改变 Aktionsart。

## 五、与 Aspekt（体）的区别

斯拉夫语通过成对动词表达「完成体/未完成体」，德语没有这套语法范畴。
德语只能用**词汇**（前缀、副词）逼近：
*Ich **las** das Buch.*（读了/在读，模糊）
*Ich **las** das Buch **zu Ende**.*（读完了）
*Ich **habe** das Buch **ausgelesen**.*（读完了）

## 例句

1. **Das Baby schlief drei Stunden.** — 婴儿睡了三小时。（持续）
2. **Das Baby ist sofort eingeschlafen.** — 婴儿马上就睡着了。（起始）
3. **Die Blumen blühen im Mai.** — 花在五月开放。（持续）
4. **Die Blumen sind schon verblüht.** — 花已经谢了。（终止）
5. **Er trank langsam sein Bier und trank es schließlich aus.** — 他慢慢喝啤酒，最后喝光了。
6. **Sie streichelte die Katze.** — 她抚摸着猫。（反复）
7. **Leg das Buch auf den Tisch, es soll dort liegen.** — 把书放桌上，让它放在那儿。（使役 vs. 持续）

## 常见错误

* ❌ *Ich **habe** eingeschlafen* → ✅ Ich **bin** eingeschlafen（状态变化用 sein）
* ❌ *Ich **liege** das Buch auf den Tisch* → ✅ **lege**
* ❌ *Er ist **stundenlang** angekommen* → 终结性动词不能配持续时间状语
* ❌ 把 Aktionsart 当成时态：它是**词汇**性质，不是变位形式
"""),

# === AUTHORED TOPICS END ===


# ---------------------------------------------------------------------------
# 4. Tree layout.  Every slug listed here must exist in either the legacy set
#    or the authored set; the build fails otherwise.
# ---------------------------------------------------------------------------

LAYOUT = []


# === LAYOUT BEGIN ===

def P(title, slug, *chapters):
    LAYOUT.append({'title': title, 'slug': slug, 'chapters': list(chapters)})


def C(title, slug, *topics):
    return {'title': title, 'slug': slug, 'topics': list(topics)}


def t(slug, title=None, level=None):
    """A tree entry.  title/level are only needed for legacy pages; authored
    topics carry their own (see T())."""
    return {'slug': slug, 'title': title, 'level': level}


P('第一部分　词法', 'morphologie',
  C('第一章　名词', 'kap-substantiv',
    t('名词/名词', '名词总论', 'A1'),
    t('名词/名词的性'),
    t('名词/名词的复数'),
    t('名词/名词的格变化'),
    t('名词/阳性弱变化', '阳性弱变化（n-变化）', 'B1'),
    t('名词/名词词尾', '名词词尾与词性推断', 'A2'),
    t('名词/名词复合中缀', '复合名词与连接中缀', 'B2'),
    ),
  C('第二章　冠词与限定词', 'kap-artikel',
    t('冠词/冠词', '冠词概览', 'A1'),
    t('冠词/定冠词'),
    t('冠词/不定冠词与零冠词'),
    t('冠词/限定词与物主冠词'),
    ),
  C('第三章　形容词', 'kap-adjektiv',
    t('形容词/形容词', '形容词总论', 'A1'),
    t('形容词/形容词变格', '形容词变格三张表', 'A2'),
    t('形容词/比较级与最高级'),
    t('形容词/形容词的支配与名词化'),
    ),
  C('第四章　数词与时间表达', 'kap-numerale',
    t('数词/数词', '数词总论', 'A1'),
    t('数词/基数词与序数词'),
    t('数词/日期钟点与度量'),
    ),
  C('第五章　代词', 'kap-pronomen',
    t('代词/代词', '代词总论', 'A1'),
    t('代词/人称代词'),
    t('代词/物主代词'),
    t('代词/反身代词'),
    t('代词/指示代词'),
    t('代词/不定代词'),
    t('代词/疑问代词与es'),
    ),
  C('第六章　副词与语气小品词', 'kap-adverb',
    t('副词/副词的种类与位置'),
    t('副词/代副词da-wo'),
    t('副词/hin与her'),
    t('语气词/语气小品词总论'),
    t('语气词/doch'),
    t('语气词/mal'),
    t('语气词/ja'),
    t('语气词/denn'),
    t('语气词/eben'),
    t('语气词/halt'),
    ),
  C('第七章　介词', 'kap-praeposition',
    t('介词/介词', '介词总论', 'A1'),
    t('介词/介词支配格', '介词的格支配一览', 'A2'),
    t('介词/支配第四格的介词'),
    t('介词/支配第三格的介词'),
    t('介词/支配第二格的介词'),
    t('介词/方位介词'),
    t('介词/介词与冠词的缩合'),
    t('介词/介词搭配'),
    t('介词/介词辨析', '近义介词辨析', 'B1'),
    ),
  C('第八章　连词', 'kap-konjunktion',
    t('连词/并列连词'),
    t('连词/从属连词总表'),
    t('连词/时间从句连词'),
    t('连词/原因结果与目的'),
    t('连词/让步与对比'),
    t('连词/双重连词'),
    ),
  )

P('第二部分　动词', 'verb',
  C('第九章　动词基础', 'kap-verb-basis',
    t('动词/动词', '动词总论', 'A1'),
    t('动词/变位'),
    t('动词/可分与不可分动词'),
    t('动词/反身动词'),
    t('动词/命令式'),
    t('动词/动词的支配'),
    t('动词/不规则动词', '不规则动词总表', 'A2'),
    ),
  C('第十章　时态', 'kap-tempus',
    t('时态/现在时的用法'),
    t('时态/现在完成时'),
    t('时态/过去时'),
    t('时态/过去完成时'),
    t('时态/将来时'),
    ),
  C('第十一章　情态动词', 'kap-modalverb',
    t('情态动词/情态动词基础'),
    t('情态动词/情态动词的完成时'),
    t('情态动词/主观用法'),
    ),
  C('第十二章　虚拟式', 'kap-konjunktiv',
    t('动词/叙述方式', '三种叙述方式（Modus）', 'B1'),
    t('虚拟式/虚拟式二式构成'),
    t('虚拟式/虚拟式二式用法'),
    t('虚拟式/虚拟式一式'),
    t('虚拟式/虚拟式的替代形式'),
    ),
  C('第十三章　被动态', 'kap-passiv',
    t('被动态/过程被动态'),
    t('被动态/被动态的时态'),
    t('被动态/状态被动'),
    ),
  C('第十四章　非限定形式', 'kap-infinit',
    t('非限定形式/带zu的不定式'),
    t('非限定形式/分词'),
    t('非限定形式/扩展分词定语'),
    ),
  C('第十五章　动词构词与用法模式', 'kap-verb-wortbildung',
    t('动词/动词前缀', '动词前缀详解', 'B2'),
    t('动词/行动方式'),
    t('动词/用法模式', '高频动词用法模式', 'B2'),
    ),
  )

P('第三部分　句法', 'syntax',
  C('第十六章　格与句子成分', 'kap-kasus',
    t('格/四个格总论'),
    t('格/第一格与第四格'),
    t('格/第三格'),
    t('格/第二格'),
    t('句法/句法', '句子成分与基本句型', 'A2'),
    ),
  C('第十七章　语序', 'kap-wortstellung',
    t('语序/句框结构'),
    t('语序/前场与倒装'),
    t('语序/中场排序'),
    t('语序/后场与框外成分'),
    ),
  C('第十八章　句子类型', 'kap-satzarten',
    t('句子类型/陈述句与疑问句'),
    t('句子类型/命令句与感叹句'),
    ),
  C('第十九章　从句', 'kap-nebensatz',
    t('从句/从句总论'),
    t('从句/dass从句'),
    t('从句/间接疑问句'),
    ),
  C('第二十章　关系从句', 'kap-relativsatz',
    t('关系从句/关系代词'),
    t('关系从句/介词加关系代词'),
    t('关系从句/wer与was'),
    t('关系从句/关系从句的应用'),
    ),
  C('第二十一章　条件与比较', 'kap-konditional',
    t('条件与比较/条件句'),
    t('条件与比较/比较从句'),
    t('条件与比较/als ob'),
    ),
  C('第二十二章　否定', 'kap-negation',
    t('否定/nicht的位置'),
    t('否定/kein与其他否定词'),
    ),
  )

P('第四部分　附录', 'anhang',
  C('第二十三章　语音与学习指南', 'kap-anhang',
    t('intro/前言', '前言与使用指南', 'A1'),
    t('其他/发音', '德语语音与拼读', 'A1'),
    t('其他/其他', '缩写、标点与杂项', 'A1'),
    ),
  )

# === LAYOUT END ===


# ---------------------------------------------------------------------------
# 5. Assemble.
# ---------------------------------------------------------------------------

# Legacy pages that were bare stubs (137-700 chars, no examples, no tables) and
# are fully superseded by the authored topics listed beside them.  They are
# dropped rather than shipped, because every shipped topic has to clear the
# length floor enforced by scripts/validate_german_grammar.js.
# Legacy pages whose markdown source has no h1 of its own.
MISSING_HEADINGS = {
    '形容词/形容词变格': '形容词变格三张表',
}

DROPPED_LEGACY = {
    '动词/不定式': '非限定形式/带zu的不定式',
    '动词/分词': '非限定形式/分词',
    '连词/连词': '连词/并列连词 + 连词/从属连词总表',
    '副词/副词': '副词/副词的种类与位置',
}


def load_legacy():
    out = {}
    for slug, rel in LEGACY_SOURCES.items():
        if slug in DROPPED_LEGACY:
            continue
        path = os.path.join(DOCS_DIR, rel)
        text = strip_frontmatter(read(path))

        missing = []

        def repl(match):
            key = img_key(match.group(1))
            block = IMAGE_REPLACEMENTS.get(key)
            if block is None:
                missing.append(key)
                return match.group(0)
            return block

        text = IMG_RE.sub(repl, text)
        if missing:
            raise SystemExit('No replacement authored for image(s): %s (in %s)'
                             % (', '.join(sorted(set(missing))), slug))

        for old, new in PROSE_FIXES.get(slug, []):
            if old not in text:
                raise SystemExit('PROSE_FIXES miss in %s: %r' % (slug, old[:40]))
            text = text.replace(old, new)

        if slug in APPENDIX and APPENDIX[slug]:
            text = text.rstrip() + '\n' + APPENDIX[slug]

        text = text.strip()
        if not text.startswith('#'):
            # Every shipped topic must open with an h1 so the renderer has a
            # title inside the body as well as in the tree.
            text = '# %s\n\n%s' % (MISSING_HEADINGS[slug], text)

        out[slug] = text + '\n'
    return out


def build():
    content = load_legacy()
    titles = {}
    levels = {}

    overridden = 0
    for topic in AUTHORED:
        slug = topic['slug']
        if slug in content:
            overridden += 1
        content[slug] = topic['md']
        titles[slug] = topic['title']
        levels[slug] = topic['level']

    parts = []
    seen = set()
    for part in LAYOUT:
        chapters = []
        for chapter in part['chapters']:
            topics = []
            for entry in chapter['topics']:
                slug = entry['slug']
                if slug not in content:
                    raise SystemExit('LAYOUT references unknown slug: %s' % slug)
                if slug in seen:
                    raise SystemExit('LAYOUT lists slug twice: %s' % slug)
                seen.add(slug)
                topics.append({
                    'title': entry.get('title') or titles.get(slug) or slug.split('/')[-1],
                    'slug': slug,
                    'level': entry.get('level') or levels.get(slug) or 'A1',
                })
            chapters.append({
                'title': chapter['title'],
                'slug': chapter['slug'],
                'topics': topics,
            })
        parts.append({'title': part['title'], 'slug': part['slug'], 'chapters': chapters})

    orphans = sorted(set(content) - seen)
    if orphans:
        raise SystemExit('Content keys not present in LAYOUT: %s' % ', '.join(orphans))

    # `meta` is optional and already supported by grammar-book.js (it renders a
    # welcome card before a topic is picked).  French ships it; German did not.
    meta = {
        'title': '德语语法',
        'description': '从左侧目录选择 A1–C1 专题开始阅读（%d 章 / %d 个专题）'
                       % (sum(len(p['chapters']) for p in parts), len(seen)),
    }
    data = {'meta': meta, 'tree': {'parts': parts}, 'content': content}

    # Final guard: no surviving image references anywhere.
    leftovers = IMG_RE.findall(json.dumps(data, ensure_ascii=False))
    if leftovers:
        raise SystemExit('Image references survived: %s' % leftovers[:5])

    grammar_schema.write('de', grammar_schema.canonicalize(data, 'de'), path=OUT_FILE)

    total_chars = sum(len(v) for v in content.values())
    print('parts     : %d' % len(parts))
    print('chapters  : %d' % sum(len(p['chapters']) for p in parts))
    print('topics    : %d  (legacy kept %d, dropped %d, authored %d, of which overrides %d)'
          % (len(content), len(LEGACY_SOURCES) - len(DROPPED_LEGACY),
             len(DROPPED_LEGACY), len(AUTHORED), overridden))
    print('characters: %d  (mean %d)' % (total_chars, total_chars // max(1, len(content))))
    print('written   : %s' % OUT_FILE)


if __name__ == '__main__':
    if '--force' not in sys.argv[1:] or not os.path.isdir(DOCS_DIR):
        raise SystemExit(
            'build_german_grammar.py is retired: data/de-grammar.js is the source of truth.\n'
            'Edit it in place and run  python3 scripts/canonicalize_grammar.py de\n'
            '(a rebuild needs %s and --force, and discards edits made to the data file)' % DOCS_DIR)
    build()
