#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build the two French "extras" datasets that Italian already has:

  data/french-collocations-data.js   ->  window.FRENCH_COLLOCATIONS_DATA
  data/french-cognates.js            ->  window.FRENCH_COGNATE_DATA

Both mirror the Italian reference shapes exactly:

  VERB_COLLOCATIONS_DATA = {
    meta:         { totalVerbs, totalExamples, prepositionOrder: [...] },
    verbs:        { <slug>: { display, prepositions: { <prep>: [str, ...] }, prepositionOrder: [...] } },
    prepositions: { <prep>: [<slug>, ...] }
  }
  COGNATE_DATA = [{ italian, english, chinese, patternType, similarityScore, difficulty, rank }]

...with `french` replacing `italian`.  Extra (purely additive) fields are documented
in the emitted file headers; no reference field is renamed or removed.

--------------------------------------------------------------------------------
SOURCES (all open / redistributable — see report)
--------------------------------------------------------------------------------
  * Tatoeba sentence + link exports .................. CC BY 2.0 FR
      https://downloads.tatoeba.org/exports/per_language/fra/fra_sentences.tsv.bz2
      https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2
      https://downloads.tatoeba.org/exports/per_language/fra/fra-cmn_links.tsv.bz2
      https://downloads.tatoeba.org/exports/per_language/fra/fra-eng_links.tsv.bz2
      https://downloads.tatoeba.org/exports/per_language/eng/eng-cmn_links.tsv.bz2
  * Lexique 3.83 (lemmas, POS, gender, film-subtitle frequency) ... CC BY-SA 4.0
      http://www.lexique.org/databases/Lexique383/Lexique383.zip
  * Wiktextract / kaikki.org French dump (EN glosses, gender) ..... CC BY-SA 3.0 + GFDL
      https://kaikki.org/dictionary/French/kaikki.org-dictionary-French.jsonl
  * data/vocab/en.js (in repo, ECDICT-derived EN->ZH glosses)
  * data/vocab/it.js (in repo, Italian headwords — used for the FR<->IT cognate layer)
  * data/vocab/fr.js (in repo, the FR->ZH gloss layers; see GlossContext)
    All three are schema v1 files (docs/vocab-schema.md), read via
    scripts/vocab_schema.py.
  * Hand-authored French verb-government table + faux-amis table (this file).

Optional python dependency: `zhconv` (MIT) for Traditional -> Simplified Chinese.
Install with `python3 -m pip install zhconv`.  Without it, Traditional sentences
are dropped rather than converted.

--------------------------------------------------------------------------------
USAGE
--------------------------------------------------------------------------------
  python3 scripts/build_french_extras.py [--cache DIR] [--offline]

Downloads (~620 MB, mostly the kaikki dump) are cached under DIR
(default /tmp/dimenticato-fr-extras) and are never committed.
"""

import argparse
import bz2
import csv
import json
import os
import re
import subprocess
import sys
import unicodedata
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import vocab_schema  # noqa: E402  (data/vocab/*.js reader)
DEFAULT_CACHE = "/tmp/dimenticato-fr-extras"

TATOEBA_LICENSE = "Tatoeba CC BY 2.0 FR"
LEXIQUE_LICENSE = "Lexique 3.83 CC BY-SA 4.0"
WIKT_LICENSE = "Wiktionary/Wiktextract CC BY-SA 3.0"

SOURCES = {
    "fra_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/fra/fra_sentences.tsv.bz2",
    "cmn_sentences.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2",
    "fra-cmn_links.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/fra/fra-cmn_links.tsv.bz2",
    "fra-eng_links.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/fra/fra-eng_links.tsv.bz2",
    "eng-cmn_links.tsv.bz2": "https://downloads.tatoeba.org/exports/per_language/eng/eng-cmn_links.tsv.bz2",
    "Lexique383.zip": "http://www.lexique.org/databases/Lexique383/Lexique383.zip",
}
KAIKKI_URL = "https://kaikki.org/dictionary/French/kaikki.org-dictionary-French.jsonl"

# ---------------------------------------------------------------------------
# preposition inventory (drives the browser's left-hand tree)
# ---------------------------------------------------------------------------
PREPOSITION_ORDER = ["à", "de", "en", "par", "pour", "sur", "dans",
                     "avec", "contre", "vers", "chez", "entre"]
PREPSET = set(PREPOSITION_ORDER)
CONTRACT = {"au": "à", "aux": "à", "du": "de", "d'": "de", "à": "à", "de": "de"}

# ===========================================================================
# 1. HAND-AUTHORED VERB-GOVERNMENT TABLE
# ---------------------------------------------------------------------------
# (display_form, preposition, frame, chinese_gloss)
# `display_form` is the citation form used as both the slug and the display
# label; `frame` is the qqn/qqch/inf construction shown to the learner.
# Authored for this repo; verified against standard French grammar (Grevisse
# "Le bon usage" government lists) — no machine translation involved.
# ===========================================================================
CURATED = [
    # ---- à + infinitif -----------------------------------------------------
    ("aider", "à", "aider qqn à faire qqch", "帮助某人做某事"),
    ("aimer", "à", "aimer à faire qqch", "喜欢做某事（书面语）"),
    ("apprendre", "à", "apprendre à faire qqch", "学着做某事"),
    ("arriver", "à", "arriver à faire qqch", "设法做成某事"),
    ("s'apprêter", "à", "s'apprêter à faire qqch", "准备做某事"),
    ("aspirer", "à", "aspirer à qqch", "渴望；向往"),
    ("s'attendre", "à", "s'attendre à qqch", "预料到某事"),
    ("autoriser", "à", "autoriser qqn à faire qqch", "允许某人做某事"),
    ("chercher", "à", "chercher à faire qqch", "设法做某事"),
    ("commencer", "à", "commencer à faire qqch", "开始做某事"),
    ("consentir", "à", "consentir à qqch", "同意某事"),
    ("consister", "à", "consister à faire qqch", "在于做某事"),
    ("continuer", "à", "continuer à faire qqch", "继续做某事"),
    ("contribuer", "à", "contribuer à qqch", "为某事作出贡献"),
    ("se décider", "à", "se décider à faire qqch", "下决心做某事"),
    ("encourager", "à", "encourager qqn à faire qqch", "鼓励某人做某事"),
    ("s'engager", "à", "s'engager à faire qqch", "承诺做某事"),
    ("s'exercer", "à", "s'exercer à faire qqch", "练习做某事"),
    ("s'habituer", "à", "s'habituer à qqch", "习惯于某事"),
    ("hésiter", "à", "hésiter à faire qqch", "犹豫要不要做某事"),
    ("inciter", "à", "inciter qqn à faire qqch", "促使某人做某事"),
    ("inviter", "à", "inviter qqn à faire qqch", "邀请某人做某事"),
    ("se mettre", "à", "se mettre à faire qqch", "开始做起某事"),
    ("obliger", "à", "obliger qqn à faire qqch", "迫使某人做某事"),
    ("parvenir", "à", "parvenir à faire qqch", "终于做到某事"),
    ("se préparer", "à", "se préparer à faire qqch", "准备做某事"),
    ("renoncer", "à", "renoncer à qqch", "放弃某事"),
    ("réussir", "à", "réussir à faire qqch", "成功做到某事"),
    ("servir", "à", "servir à faire qqch", "用来做某事"),
    ("songer", "à", "songer à qqch", "考虑；想到"),
    ("tarder", "à", "tarder à faire qqch", "迟迟不做某事"),
    ("tenir", "à", "tenir à qqch / à faire qqch", "重视某事；坚持要做某事"),
    ("viser", "à", "viser à faire qqch", "旨在做某事"),
    ("se borner", "à", "se borner à faire qqch", "仅限于做某事"),
    ("se consacrer", "à", "se consacrer à qqch", "献身于某事"),
    ("se limiter", "à", "se limiter à qqch", "局限于某事"),
    ("se résigner", "à", "se résigner à qqch", "认命接受某事"),
    ("se résoudre", "à", "se résoudre à faire qqch", "下决心做某事"),
    ("veiller", "à", "veiller à qqch", "留心；负责某事"),
    # ---- à + complément d'objet indirect ----------------------------------
    ("s'adresser", "à", "s'adresser à qqn", "向某人打听；找某人办事"),
    ("appartenir", "à", "appartenir à qqn", "属于某人"),
    ("assister", "à", "assister à qqch", "出席；观看（≠ 帮助）"),
    ("convenir", "à", "convenir à qqn", "适合某人"),
    ("croire", "à", "croire à qqch", "相信某事（存在／有效）"),
    ("déplaire", "à", "déplaire à qqn", "使某人不快"),
    ("désobéir", "à", "désobéir à qqn", "不服从某人"),
    ("échapper", "à", "échapper à qqch", "逃脱某事"),
    ("s'intéresser", "à", "s'intéresser à qqch", "对某事感兴趣"),
    ("se joindre", "à", "se joindre à qqn", "加入某人"),
    ("manquer", "à", "manquer à qqn", "使某人想念（Tu me manques 我想你）"),
    ("nuire", "à", "nuire à qqn/qqch", "损害某人／某物"),
    ("obéir", "à", "obéir à qqn", "服从某人"),
    ("s'opposer", "à", "s'opposer à qqch", "反对某事"),
    ("pardonner", "à", "pardonner à qqn", "原谅某人"),
    ("participer", "à", "participer à qqch", "参加某事"),
    ("penser", "à", "penser à qqn/qqch", "想念某人；想着某事"),
    ("plaire", "à", "plaire à qqn", "讨某人喜欢"),
    ("réfléchir", "à", "réfléchir à qqch", "仔细考虑某事"),
    ("remédier", "à", "remédier à qqch", "补救某事"),
    ("répondre", "à", "répondre à qqn/qqch", "回答某人／某事"),
    ("ressembler", "à", "ressembler à qqn", "像某人"),
    ("résister", "à", "résister à qqch", "抵抗某事"),
    ("se fier", "à", "se fier à qqn", "信任某人"),
    ("succéder", "à", "succéder à qqn", "接替某人"),
    ("suffire", "à", "suffire à qqn/qqch", "对某人／某事够用"),
    ("survivre", "à", "survivre à qqch", "在某事中幸存"),
    ("téléphoner", "à", "téléphoner à qqn", "给某人打电话"),
    ("toucher", "à", "toucher à qqch", "碰某物；触及某事"),
    ("goûter", "à", "goûter à qqch", "尝一尝某物"),
    ("jouer", "à", "jouer à un jeu / à un sport", "玩（游戏）；从事（球类运动）"),
    ("se heurter", "à", "se heurter à qqch", "遇到（阻碍）"),
    ("faire attention", "à", "faire attention à qqch", "注意某事"),
    # ---- de + infinitif ----------------------------------------------------
    ("accepter", "de", "accepter de faire qqch", "接受／答应做某事"),
    ("s'arrêter", "de", "s'arrêter de faire qqch", "停下不做某事"),
    ("arrêter", "de", "arrêter de faire qqch", "停止做某事"),
    ("cesser", "de", "cesser de faire qqch", "停止做某事"),
    ("choisir", "de", "choisir de faire qqch", "选择做某事"),
    ("craindre", "de", "craindre de faire qqch", "怕做某事"),
    ("décider", "de", "décider de faire qqch", "决定做某事"),
    ("se dépêcher", "de", "se dépêcher de faire qqch", "赶紧做某事"),
    ("s'efforcer", "de", "s'efforcer de faire qqch", "努力做某事"),
    ("empêcher", "de", "empêcher qqn de faire qqch", "阻止某人做某事"),
    ("essayer", "de", "essayer de faire qqch", "试着做某事"),
    ("éviter", "de", "éviter de faire qqch", "避免做某事"),
    ("finir", "de", "finir de faire qqch", "做完某事"),
    ("interdire", "de", "interdire à qqn de faire qqch", "禁止某人做某事"),
    ("menacer", "de", "menacer de faire qqch", "威胁要做某事"),
    ("mériter", "de", "mériter de faire qqch", "值得做某事"),
    ("offrir", "de", "offrir de faire qqch", "主动提出做某事"),
    ("oublier", "de", "oublier de faire qqch", "忘记做某事"),
    ("permettre", "de", "permettre à qqn de faire qqch", "允许某人做某事"),
    ("promettre", "de", "promettre à qqn de faire qqch", "答应某人做某事"),
    ("proposer", "de", "proposer de faire qqch", "提议做某事"),
    ("refuser", "de", "refuser de faire qqch", "拒绝做某事"),
    ("regretter", "de", "regretter de faire qqch", "后悔做了某事"),
    ("risquer", "de", "risquer de faire qqch", "有做某事的危险"),
    ("venir", "de", "venir de faire qqch", "刚刚做了某事（最近过去时）"),
    ("faire semblant", "de", "faire semblant de faire qqch", "假装做某事"),
    ("avoir besoin", "de", "avoir besoin de qqch", "需要某物"),
    ("avoir envie", "de", "avoir envie de qqch", "想要某物"),
    ("avoir peur", "de", "avoir peur de qqch", "害怕某事"),
    # ---- de + complément ---------------------------------------------------
    ("s'apercevoir", "de", "s'apercevoir de qqch", "察觉到某事"),
    ("s'approcher", "de", "s'approcher de qqn/qqch", "靠近某人／某物"),
    ("changer", "de", "changer de qqch", "更换某物（换车、换工作）"),
    ("charger", "de", "charger qqn de qqch", "委托某人做某事"),
    ("dépendre", "de", "dépendre de qqn/qqch", "取决于某人／某事"),
    ("discuter", "de", "discuter de qqch", "讨论某事"),
    ("douter", "de", "douter de qqch", "怀疑某事"),
    ("s'excuser", "de", "s'excuser de qqch", "为某事道歉"),
    ("hériter", "de", "hériter de qqch", "继承某物"),
    ("s'inquiéter", "de", "s'inquiéter de qqch", "为某事担心"),
    ("jouer", "de", "jouer d'un instrument", "演奏（乐器）"),
    ("manquer", "de", "manquer de qqch", "缺乏某物"),
    ("se méfier", "de", "se méfier de qqn", "提防某人"),
    ("se moquer", "de", "se moquer de qqn", "嘲笑某人"),
    ("s'occuper", "de", "s'occuper de qqch/qqn", "照料某人；处理某事"),
    ("parler", "de", "parler de qqch", "谈论某事"),
    ("se passer", "de", "se passer de qqch", "没有某物也行"),
    ("se plaindre", "de", "se plaindre de qqch", "抱怨某事"),
    ("profiter", "de", "profiter de qqch", "利用某事；享受某物"),
    ("se rendre compte", "de", "se rendre compte de qqch", "意识到某事"),
    ("rêver", "de", "rêver de qqch", "梦见；梦想某事"),
    ("rire", "de", "rire de qqn", "取笑某人"),
    ("se servir", "de", "se servir de qqch", "使用某物"),
    ("se soucier", "de", "se soucier de qqch", "在意某事"),
    ("souffrir", "de", "souffrir de qqch", "患某病；受某事之苦"),
    ("se souvenir", "de", "se souvenir de qqch", "记得某事"),
    ("se tromper", "de", "se tromper de qqch", "弄错（车、路、日子）"),
    ("vivre", "de", "vivre de qqch", "靠某物为生"),
    ("remercier", "de", "remercier qqn de qqch", "为某事感谢某人（较书面，多接抽象事物）"),
    ("féliciter", "de", "féliciter qqn de qqch", "为某事祝贺某人"),
    ("accuser", "de", "accuser qqn de qqch", "指控某人某事"),
    ("se réjouir", "de", "se réjouir de qqch", "为某事高兴"),
    ("s'étonner", "de", "s'étonner de qqch", "对某事感到惊讶"),
    ("sortir", "de", "sortir de qqch", "从某处出来"),
    ("provenir", "de", "provenir de qqch", "来源于某物"),
    ("dater", "de", "dater de qqch", "始于（某个年代）"),
    ("relever", "de", "relever de qqch", "属于…的范畴"),
    # ---- en ---------------------------------------------------------------
    ("croire", "en", "croire en qqn", "信任某人；信仰"),
    ("se transformer", "en", "se transformer en qqch", "变成某物"),
    ("traduire", "en", "traduire qqch en français", "把某物译成（法语）"),
    ("consister", "en", "consister en qqch", "由…构成"),
    ("partir", "en", "partir en vacances", "去度假；出发去"),
    ("tomber", "en", "tomber en panne", "抛锚；出故障"),
    ("mettre", "en", "mettre qqch en marche", "启动；使运转"),
    ("se mettre", "en", "se mettre en colère", "发火"),
    ("entrer", "en", "entrer en contact avec qqn", "与某人取得联系"),
    ("changer", "en", "changer qqch en qqch", "把某物变成某物"),
    ("avoir confiance", "en", "avoir confiance en qqn", "信任某人"),
    # ---- par --------------------------------------------------------------
    ("commencer", "par", "commencer par qqch", "从某事开始"),
    ("finir", "par", "finir par faire qqch", "最终做了某事"),
    ("passer", "par", "passer par qqch", "经过某处；经历某事"),
    ("remplacer", "par", "remplacer qqch par qqch", "用某物替换某物"),
    ("se terminer", "par", "se terminer par qqch", "以某事结束"),
    ("prendre", "par", "prendre qqn par la main", "拉着某人的手"),
    ("terminer", "par", "terminer par qqch", "以某事收尾"),
    # ---- pour -------------------------------------------------------------
    ("partir", "pour", "partir pour un lieu", "动身去某地"),
    ("voter", "pour", "voter pour qqn", "投票支持某人"),
    ("opter", "pour", "opter pour qqch", "选择某物"),
    ("remercier", "pour", "remercier qqn pour qqch", "为某物感谢某人（多接具体事物）"),
    ("se battre", "pour", "se battre pour qqch", "为某事奋斗"),
    ("passer", "pour", "passer pour qqn", "被当作某种人"),
    ("prendre", "pour", "prendre qqn pour qqn", "把某人误当成某人"),
    ("travailler", "pour", "travailler pour qqn", "为某人工作"),
    # ---- sur --------------------------------------------------------------
    ("compter", "sur", "compter sur qqn", "指望某人"),
    ("appuyer", "sur", "appuyer sur qqch", "按（按钮）；靠在某物上"),
    ("insister", "sur", "insister sur qqch", "强调某事"),
    ("veiller", "sur", "veiller sur qqn", "照看某人"),
    ("se pencher", "sur", "se pencher sur qqch", "俯身；研究某问题"),
    ("donner", "sur", "donner sur qqch", "窗户／房间朝向某处"),
    ("tirer", "sur", "tirer sur qqn", "向某人开枪"),
    ("tomber", "sur", "tomber sur qqn", "偶然碰到某人"),
    ("porter", "sur", "porter sur qqch", "涉及某事"),
    ("revenir", "sur", "revenir sur qqch", "收回（诺言）；重提某事"),
    # ---- dans -------------------------------------------------------------
    ("entrer", "dans", "entrer dans un lieu", "进入某处"),
    ("monter", "dans", "monter dans un bus", "上（车、飞机）"),
    ("se lancer", "dans", "se lancer dans qqch", "投身于某事"),
    ("plonger", "dans", "plonger dans qqch", "潜入；沉浸于"),
    ("tomber", "dans", "tomber dans qqch", "落入某处"),
    ("réussir", "dans", "réussir dans la vie", "在事业／生活中成功"),
    # ---- avec -------------------------------------------------------------
    ("se marier", "avec", "se marier avec qqn", "与某人结婚"),
    ("sortir", "avec", "sortir avec qqn", "与某人交往"),
    ("se disputer", "avec", "se disputer avec qqn", "与某人争吵"),
    ("s'entendre", "avec", "s'entendre avec qqn", "与某人相处融洽"),
    ("rompre", "avec", "rompre avec qqn", "与某人断绝关系"),
    ("discuter", "avec", "discuter avec qqn", "和某人讨论"),
    ("comparer", "avec", "comparer qqch avec qqch", "把某物与某物比较"),
    ("être d'accord", "avec", "être d'accord avec qqn", "同意某人的看法"),
    # ---- contre -----------------------------------------------------------
    ("lutter", "contre", "lutter contre qqch", "与某事作斗争"),
    ("se battre", "contre", "se battre contre qqn", "与某人搏斗"),
    ("protester", "contre", "protester contre qqch", "抗议某事"),
    ("échanger", "contre", "échanger qqch contre qqch", "用某物交换某物"),
    ("voter", "contre", "voter contre qqch", "投票反对某事"),
    ("se fâcher", "contre", "se fâcher contre qqn", "对某人生气"),
    ("s'appuyer", "contre", "s'appuyer contre qqch", "靠在某物上"),
    # ---- vers -------------------------------------------------------------
    ("se diriger", "vers", "se diriger vers un lieu", "朝某处走去"),
    ("se tourner", "vers", "se tourner vers qqn", "转向某人；向某人求助"),
    ("tendre", "vers", "tendre vers qqch", "趋向于某事"),
    # ---- chez -------------------------------------------------------------
    ("aller", "chez", "aller chez qqn", "去某人家；去（医生）那里"),
    ("habiter", "chez", "habiter chez qqn", "住在某人家"),
    ("passer", "chez", "passer chez qqn", "顺路去某人家"),
    ("rentrer", "chez", "rentrer chez soi", "回自己家"),
    ("travailler", "chez", "travailler chez qqn", "在某公司／某人处工作"),
    # ---- entre ------------------------------------------------------------
    ("choisir", "entre", "choisir entre deux choses", "在两者之间选择"),
    ("hésiter", "entre", "hésiter entre deux choses", "在两者之间犹豫"),
    ("partager", "entre", "partager qqch entre plusieurs personnes", "在几个人之间分配某物"),
    ("distinguer", "entre", "distinguer entre deux choses", "区分两者"),
    # ---- high-frequency verbs the corpus miner deliberately skips -----------
    # (auxiliaries and heavily transitive verbs are excluded from mining, but
    #  they still govern prepositions, and a verb entry with an empty
    #  `prepositions` map would render as a blank card)
    ("avoir", "de", "avoir besoin de qqch", "需要某物"),
    ("avoir", "de", "avoir envie de faire qqch", "想做某事"),
    ("avoir", "de", "avoir peur de qqch", "害怕某事"),
    ("avoir", "à", "avoir mal à la tête", "头疼"),
    ("avoir", "à", "avoir droit à qqch", "有权享受某物"),
    ("avoir", "à", "avoir affaire à qqn", "与某人打交道"),
    ("gagner", "à", "gagner à être connu", "越了解越觉得好"),
    ("gagner", "en", "gagner en qualité", "在质量上有所提升"),
    ("gagner", "contre", "gagner contre qqn", "战胜某人"),
    ("poser", "à", "poser une question à qqn", "向某人提问"),
    ("poser", "sur", "poser qqch sur la table", "把某物放在桌上"),
    ("poser", "pour", "poser pour un photographe", "为摄影师摆姿势"),
    ("suivre", "de", "suivre qqn des yeux", "用目光追随某人"),
    ("suivre", "avec", "suivre qqch avec attention", "密切关注某事"),
    ("suivre", "sur", "suivre qqch sur une carte", "在地图上跟踪某物"),
]

# Pairs whose whole point is the à/de (or à/en) contrast — the browser shows
# them side by side, so both members must always survive filtering.
CONTRAST_NOTE = {
    ("penser", "à"): "penser à = 想着（对象）；penser de = 对…的看法",
    ("penser", "de"): "penser de qqch = 对某事的看法（多用于疑问句 Que penses-tu de… ?）",
    ("jouer", "à"): "jouer à = 玩游戏／球类；jouer de = 演奏乐器",
    ("jouer", "de"): "jouer de = 演奏乐器；jouer à = 玩游戏／球类",
    ("manquer", "à"): "manquer à qqn = 让某人想念；manquer de = 缺乏",
    ("manquer", "de"): "manquer de qqch = 缺乏某物；manquer à qqn = 让某人想念",
    ("servir", "à"): "servir à = 用来做…；servir de = 充当…",
    ("servir", "de"): "servir de qqch = 充当某物；servir à = 用来做…",
    ("tenir", "à"): "tenir à = 重视／坚持；tenir de = 像（某人）",
    ("tenir", "de"): "tenir de qqn = 长得／性格像某人",
    ("croire", "à"): "croire à qqch = 相信某事属实；croire en qqn = 信任某人",
    ("croire", "en"): "croire en qqn = 信任／信仰；croire à qqch = 相信某事属实",
    ("parler", "à"): "parler à qqn = 对某人说；parler de qqch = 谈论某事",
    ("parler", "de"): "parler de qqch = 谈论某事；parler à qqn = 对某人说",
    ("commencer", "à"): "commencer à faire = 开始做；commencer par = 从…开始",
    ("commencer", "par"): "commencer par = 从…开始；commencer à faire = 开始做",
    ("finir", "de"): "finir de faire = 做完；finir par faire = 最终做了",
    ("finir", "par"): "finir par faire = 最终做了；finir de faire = 做完",
    ("décider", "de"): "décider de faire = 决定做；se décider à faire = 下定决心做",
}

# Extra curated entries needed to make the contrast pairs complete.
CURATED += [
    ("penser", "de", "penser de qqch", "对某事的看法，多用于疑问句 Que pensez-vous de …"),
    ("servir", "de", "servir de qqch", "充当某物"),
    ("tenir", "de", "tenir de qqn", "长得像某人；秉性像某人"),
    ("demander", "à", "demander à qqn", "向某人询问"),
    ("demander", "de", "demander à qqn de faire qqch", "请某人做某事"),
    ("s'agir", "de", "il s'agit de qqch", "事关某事；是关于某事"),
]

# Third authoring pass: scripts/sources/french-collocations/*.txt
#   C|verb|prep|frame|中文释义          extra curated government line (-> CURATED)
#   E|verb|prep|Phrase française.|中文译文。  authored example sentence
#   N|verb|prep|对比说明                 à/de contrast note (-> CONTRAST_NOTE)
# Authored for this repo; examples are shown after the frame line(s) and
# before the Tatoeba sentences.
FR_SOURCE_DIR = os.path.join(ROOT, "scripts", "sources", "french-collocations")
AUTHORED_EXAMPLES = defaultdict(list)     # (verb, prep) -> [(fr, zh, where)]


def load_authored_sources():
    if not os.path.isdir(FR_SOURCE_DIR):
        return
    for name in sorted(os.listdir(FR_SOURCE_DIR)):
        if not name.endswith(".txt"):
            continue
        with open(os.path.join(FR_SOURCE_DIR, name), encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, 1):
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = [x.strip() for x in line.split("|")]
                where = "%s:%d" % (name, lineno)
                if len(parts) < 2 or (len(parts) > 2 and parts[2] not in PREPSET):
                    raise SystemExit("%s: bad row / unknown preposition: %s" % (where, line))
                if parts[0] == "C" and len(parts) == 5:
                    CURATED.append(tuple(parts[1:]))
                elif parts[0] == "N" and len(parts) == 4:
                    CONTRAST_NOTE[(parts[1], parts[2])] = parts[3]
                elif parts[0] == "E" and len(parts) == 5:
                    AUTHORED_EXAMPLES[(parts[1], parts[2])].append((parts[3], parts[4], where))
                else:
                    raise SystemExit("%s: bad row: %s" % (where, line))


# ===========================================================================
# 2. VERB + NOUN COLLOCATIONS (additive layer; corpus-checked in build)
#    (verb_display, collocation, chinese)
# ===========================================================================
NOUN_COLLOCATIONS = [
    ("prendre", "prendre une décision", "做决定"),
    ("prendre", "prendre le train", "坐火车"),
    ("prendre", "prendre un café", "喝杯咖啡"),
    ("prendre", "prendre une douche", "洗澡"),
    ("prendre", "prendre rendez-vous", "预约"),
    ("prendre", "prendre des vacances", "休假"),
    ("prendre", "prendre froid", "着凉"),
    ("prendre", "prendre la parole", "发言"),
    ("faire", "faire attention", "注意；当心"),
    ("faire", "faire la cuisine", "做饭"),
    ("faire", "faire la vaisselle", "洗碗"),
    ("faire", "faire les courses", "买东西；采购"),
    ("faire", "faire la queue", "排队"),
    ("faire", "faire du sport", "做运动"),
    ("faire", "faire une promenade", "散步"),
    ("faire", "faire des progrès", "取得进步"),
    ("faire", "faire un effort", "努力一把"),
    ("faire", "faire la fête", "开派对；狂欢"),
    ("faire", "faire le ménage", "做家务"),
    ("avoir", "avoir raison", "有道理；说得对"),
    ("avoir", "avoir tort", "错了；没道理"),
    ("avoir", "avoir faim", "饿了"),
    ("avoir", "avoir soif", "渴了"),
    ("avoir", "avoir froid", "冷"),
    ("avoir", "avoir chaud", "热"),
    ("avoir", "avoir sommeil", "困了"),
    ("avoir", "avoir mal", "疼"),
    ("avoir", "avoir lieu", "举行；发生"),
    ("avoir", "avoir de la chance", "运气好"),
    ("poser", "poser une question", "提问"),
    ("poser", "poser un problème", "带来问题"),
    ("rendre", "rendre visite à qqn", "拜访某人"),
    ("rendre", "rendre service à qqn", "帮某人的忙"),
    ("donner", "donner un coup de main", "搭把手；帮个忙"),
    ("donner", "donner rendez-vous", "约见面"),
    ("passer", "passer un examen", "参加考试（≠ 通过）"),
    ("passer", "passer du temps", "花时间"),
    ("perdre", "perdre du temps", "浪费时间"),
    ("perdre", "perdre patience", "失去耐心"),
    ("gagner", "gagner du temps", "赢得时间"),
    ("gagner", "gagner sa vie", "谋生"),
    ("tenir", "tenir compte de qqch", "考虑到某事"),
    ("tenir", "tenir parole", "守信用"),
    ("mettre", "mettre la table", "摆餐具；布置餐桌"),
    ("mettre", "mettre du temps", "花费时间"),
    ("suivre", "suivre un cours", "上一门课"),
    ("jeter", "jeter un coup d'œil", "看一眼"),
    ("garder", "garder le silence", "保持沉默"),
    ("changer", "changer d'avis", "改变主意"),
    ("courir", "courir un risque", "冒风险"),
]

# ===========================================================================
# 3. FAUX AMIS (French word that looks like an English/Italian word but is not)
#    (french, real_english, chinese, lookalike, warning_zh)
# ===========================================================================
FAUX_AMIS = [
    ("actuellement", "currently", "目前；现在", "actually", "≠ actually（实际上）= en fait"),
    ("actuel", "current", "当前的", "actual", "≠ actual（实际的）= réel"),
    ("assister", "to attend", "出席；参加", "to assist", "assister à = 出席；帮助 = aider"),
    ("librairie", "bookshop", "书店", "library", "≠ library（图书馆）= bibliothèque"),
    ("sensible", "sensitive", "敏感的", "sensible", "≠ sensible（明智的）= raisonnable"),
    ("journée", "day (duration)", "一整天", "journey", "≠ journey（旅程）= voyage"),
    ("rester", "to stay", "留下；待着", "to rest", "≠ to rest（休息）= se reposer"),
    ("attendre", "to wait for", "等待", "to attend", "≠ to attend（出席）= assister à"),
    ("demander", "to ask", "询问；请求", "to demand", "≠ to demand（强烈要求）= exiger"),
    ("blesser", "to injure", "使受伤", "to bless", "≠ to bless（祝福）= bénir"),
    ("prétendre", "to claim", "声称", "to pretend", "≠ to pretend（假装）= faire semblant"),
    ("réaliser", "to carry out", "实现；完成", "to realize", "“意识到” 更常用 se rendre compte"),
    ("ignorer", "not to know", "不知道", "to ignore", "≠ to ignore（无视）= ne pas tenir compte de"),
    ("supporter", "to endure", "忍受", "to support", "≠ to support（支持）= soutenir"),
    ("achever", "to complete", "完成", "to achieve", "≠ to achieve（取得）= réussir / atteindre"),
    ("passer un examen", "to sit an exam", "参加考试", "to pass an exam", "通过考试 = réussir un examen"),
    ("large", "wide", "宽的", "large", "≠ large（大的）= grand"),
    ("raisin", "grape", "葡萄", "raisin", "≠ raisin（葡萄干）= raisin sec"),
    ("monnaie", "change (coins)", "零钱", "money", "≠ money（钱）= argent"),
    ("occasion", "opportunity; bargain", "机会；二手货", "occasion", "d'occasion = 二手的"),
    ("location", "renting", "租赁", "location", "≠ location（地点）= emplacement / lieu"),
    ("cave", "cellar", "地窖；酒窖", "cave", "≠ cave（山洞）= grotte"),
    ("coin", "corner", "角落", "coin", "≠ coin（硬币）= pièce"),
    ("pain", "bread", "面包", "pain", "≠ pain（疼痛）= douleur"),
    ("chair", "flesh", "肉体", "chair", "≠ chair（椅子）= chaise"),
    ("crayon", "pencil", "铅笔", "crayon", "≠ crayon（蜡笔）= crayon de couleur"),
    ("veste", "jacket", "外套", "vest", "≠ vest（背心）= gilet"),
    ("figure", "face", "脸", "figure", "figure = 脸；数字 = chiffre"),
    ("envie", "desire", "欲望；想要", "envy", "avoir envie de = 想要"),
    ("rude", "harsh, tough", "严酷的", "rude", "≠ rude（无礼的）= impoli"),
    ("gentil", "kind", "友善的", "gentle", "≠ gentle（温柔的）= doux"),
    ("expérience", "experiment; experience", "实验；经验", "experience", "既指经验也指实验"),
    ("préservatif", "condom", "避孕套", "preservative", "≠ preservative（防腐剂）= conservateur"),
    ("photographe", "photographer", "摄影师", "photograph", "照片 = photographie / photo"),
    ("hasard", "chance", "偶然", "hazard", "≠ hazard（危险）= danger"),
    ("mécanique", "mechanical", "机械的", "mechanic", "技工 = mécanicien"),
    ("phrase", "sentence", "句子", "phrase", "≠ phrase（短语）= locution"),
    ("lecture", "reading", "阅读", "lecture", "≠ lecture（讲座）= conférence"),
    ("collège", "middle school", "初中", "college", "≠ college（大学）= université"),
    ("veste", "jacket", "上衣", "vest", "≠ vest（背心）= gilet"),
    ("blanquette", "veal stew", "白汁炖小牛肉", "blanket", "≠ blanket（毯子）= couverture"),
    ("terrible", "terrific / terrible", "了不起的；可怕的", "terrible", "口语中常表示“棒极了”"),
    ("médecin", "doctor", "医生", "medicine", "药 = médicament；医学 = médecine"),
    ("librairie", "bookshop", "书店", "library", "≠ library（图书馆）= bibliothèque"),
    ("sale", "dirty", "脏的", "sale", "≠ sale（打折）= soldes"),
    ("bras", "arm", "手臂", "bras", "≠ bras（胸罩）= soutien-gorge"),
    ("chance", "luck", "运气", "chance", "≠ chance（机会）= occasion"),
    ("actualité", "current affairs", "时事", "actuality", "les actualités = 新闻"),
    ("commander", "to order", "订购；点菜", "to command", "≠ to command（命令）= ordonner"),
    ("déception", "disappointment", "失望", "deception", "≠ deception（欺骗）= tromperie"),
    ("éventuellement", "possibly", "有可能", "eventually", "≠ eventually（最终）= finalement"),
    ("formidable", "great", "了不起的", "formidable", "褒义：太棒了"),
    ("grand", "tall, big", "高的；大的", "grand", "≠ grand（宏伟的）= grandiose"),
    ("injure", "insult", "辱骂", "injury", "≠ injury（受伤）= blessure"),
    ("journal", "newspaper", "报纸", "journal", "≠ journal（期刊）= revue"),
    ("marron", "brown; chestnut", "栗色；栗子", "maroon", "≠ maroon（褐红色）= bordeaux"),
    ("nouvelle", "piece of news; short story", "消息；短篇小说", "novel", "≠ novel（长篇小说）= roman"),
    ("prune", "plum", "李子", "prune", "≠ prune（西梅干）= pruneau"),
    ("rentrer", "to go back home", "回家", "to rent", "≠ to rent（租）= louer"),
    ("user", "to wear out", "用旧；磨损", "to use", "≠ to use（使用）= utiliser / se servir de"),
]

# Italian look-alikes that are NOT reliable French cognates (FR<->IT faux amis)
FAUX_AMIS_IT = [
    ("attendre", "to wait for", "等待", "attendere", "it. attendere = 等待（同义）；但 fr. attendre ≠ en. attend"),
    ("salir", "to make dirty", "弄脏", "salire", "≠ it. salire（上升）= monter"),
    ("monter", "to go up", "上；登上", "montare", "it. montare 也有“组装”义"),
    ("regarder", "to look at", "看", "riguardare", "≠ it. riguardare（涉及）= concerner"),
    ("chercher", "to look for", "寻找", "cercare", "同源同义，可直接迁移"),
]

# ---------------------------------------------------------------------------
# 3b. 同形巧合 / 经典 faux-amis 补充（2026 修：释义不再走英语跳板）
# ---------------------------------------------------------------------------
# 上面那批是原有的手写表。下面这批补的是两类漏网之鱼：
#
#   A. 「同形词 identical」档里的纯拼写巧合。法语 rue / chat / pub / cap …
#      跟英语同形词毫无语义交集，却被包装成「拼写完全一样，只有发音和词性
#      需要单独记」的最安全一档，中文抄的还是英语同形词的义（rue→懊悔、
#      chat→聊天）。它们其实是最好的 faux-ami 素材，全部改成 faux-ami。
#
#   B. 教科书级 faux-amis（décevoir / conducteur / entrée / pièce …）。原来
#      以普通同源词身份混在表里，中文写的恰恰是学习者最该避开的那个义。
#      讽刺的是 déception 早就被正确标成 faux-ami 写「失望」，而动词
#      décevoir 写「欺骗」—— 同一份数据里自己打自己的脸。
#
# 中文一律按法语词本身的义写，不看英语 look-alike。
FAUX_AMIS_2026 = [
    # ---- A. 同形巧合 -------------------------------------------------------
    ("rue", "street", "街道；马路", "rue", "≠ 英语 rue（懊悔）= regretter"),
    ("chat", "cat", "猫", "chat", "≠ 英语 chat（聊天）= bavarder / tchatter"),
    ("pub", "advert", "广告；宣传", "pub", "pub 是 publicité 的缩写；≠ 英语 pub（酒馆）= bar / bistrot"),
    ("sol", "ground, floor", "地面；土壤", "sol", "≠ 英语 sol（音名 G）；「地面」= ground"),
    ("fan", "fan, supporter", "粉丝；爱好者", "fan", "≠ 英语 fan（风扇；扇子）= ventilateur / éventail"),
    ("cap", "cape; course", "海角；航向", "cap", "≠ 英语 cap（帽子）= casquette"),
    ("pic", "peak", "山峰；尖镐", "pick", "≠ 英语 pick（挑选）= choisir"),
    ("trac", "stage fright", "怯场；紧张", "track", "≠ 英语 track（轨道）= piste / voie"),
    ("cor", "horn; corn (on the foot)", "号角；鸡眼", "corn", "≠ 英语 corn（玉米）= maïs"),
    ("bas", "low; stocking", "低的；长袜", "bass", "≠ 英语 bass（低音）= basse / grave"),
    ("receler", "to harbour, to receive stolen goods", "窝藏；藏有", "receive",
     "≠ 英语 receive（收到）= recevoir"),
    # ---- B. 经典 faux-amis -------------------------------------------------
    ("décevoir", "to disappoint", "使失望", "deceive", "≠ 英语 deceive（欺骗）= tromper"),
    ("conducteur", "driver", "司机；驾驶员", "conductor",
     "≠ 英语 conductor（乐队指挥；售票员）= chef d'orchestre / contrôleur"),
    ("entrée", "entrance; starter", "入口；前菜", "entry", "≠ 英语 entry（登录；词条）= saisie"),
    ("propre", "clean; own", "干净的；自己的", "proper", "≠ 英语 proper（恰当的）= approprié"),
    ("ancien", "former; old", "从前的；旧的", "ancient", "≠ 英语 ancient（远古的）= antique"),
    ("front", "forehead", "额头", "front", "≠ 英语 front（前面）= devant / avant"),
    ("marche", "walking; step", "走路；台阶", "march", "≠ 英语 march（行军）= marche militaire"),
    ("partition", "musical score", "乐谱", "partition", "≠ 英语 partition（分割；隔断）= cloison"),
    ("cabinet", "office; practice; cabinet", "诊所；事务所；内阁", "cabinet",
     "≠ 英语 cabinet（橱柜）= placard / armoire"),
    ("tissu", "fabric, cloth", "布料；织物", "tissue", "≠ 英语 tissue（纸巾）= mouchoir en papier"),
    ("caméra", "video camera", "摄像机", "camera", "≠ 英语 camera（照相机）= appareil photo"),
    ("pièce", "room; part; coin", "房间；零件；硬币", "piece", "≠ 英语 piece（一块）= morceau"),
    ("général", "general (army officer)", "将军", "general",
     "le général 是名词「将军」；同形形容词 général 才是「普通的」"),
    ("banc", "bench", "长凳", "bank", "≠ 英语 bank（银行）= banque"),
    ("sentence", "verdict", "判决", "sentence", "≠ 英语 sentence（句子）= phrase"),
    ("corne", "horn", "角", "corn", "≠ 英语 corn（玉米）= maïs"),
    ("mars", "March", "三月", "march", "≠ 英语 march（行军）= marche"),
    ("reste", "remainder", "剩余；其余", "rest", "≠ 英语 rest（休息）= repos"),
    ("donner", "to give", "给；给予", "donate", "≠ 英语 donate（捐赠）= faire un don"),
    ("arrêter", "to stop", "停止；停下", "arrest", "arrêter 也有「逮捕」义，但基本义是「停止」"),
    ("comprendre", "to understand", "理解；懂", "comprise", "≠ 英语 comprise（包含）—— 基本义是「理解」"),
    ("asseoir", "to seat, to sit down", "坐下；使坐下", "assert", "≠ 英语 assert（断言）= affirmer"),
    ("désolé", "sorry", "抱歉的", "desolate", "≠ 英语 desolate（荒凉的）= désertique"),
    ("corps", "body", "身体", "corps", "≠ 英语 corps（军团）= corps d'armée"),
    ("joli", "pretty", "漂亮的", "jolly", "≠ 英语 jolly（欢乐的）= joyeux"),
    ("compter", "to count", "数；计算", "comprise", "≠ 英语 comprise（包含）= comprendre"),
    ("partie", "part", "部分", "party", "≠ 英语 party（政党）= parti；（聚会）= fête"),
    ("carte", "map; card", "地图；卡片", "card", "carte = 地图／卡片；纸牌 = carte à jouer"),
    ("prix", "price; prize", "价格；奖项", "prize", "prix 首义是「价格」，「奖项」是次义"),
    ("blanc", "white", "白色的", "blank", "≠ 英语 blank（空白的）= vierge"),
    ("scène", "stage", "舞台；场景", "scene", "≠ 英语 scene（现场）= lieu / les lieux"),
    ("professeur", "teacher", "老师", "professor", "≠ 英语 professor（大学教授）= professeur d'université"),
    ("poste", "post office", "邮局", "position", "la poste = 邮局；le poste = 岗位／机台"),
    ("manière", "way, manner", "方式；方法", "manners", "≠ 英语 manners（礼貌）= bonnes manières"),
    ("époque", "era, period", "时代；时期", "epoch", "≠ 英语 epoch（新纪元）= ère"),
    ("magasin", "shop, store", "商店", "magazine", "≠ 英语 magazine（杂志）= revue"),
    ("glace", "ice; ice cream; mirror", "冰；冰淇淋；镜子", "glass", "≠ 英语 glass（玻璃杯）= verre"),
    ("croisière", "cruise", "巡航；乘船游览", "cruiser", "≠ 英语 cruiser（巡洋舰）= croiseur"),
    ("communier", "to receive communion", "领圣餐", "communicate", "≠ 英语 communicate（沟通）= communiquer"),
    ("pochette", "clutch bag; pocket square", "小手袋；口袋巾", "pocket", "≠ 英语 pocket（衣袋）= poche"),
    # ---- C. 语义闸门查出来的其余错配 ---------------------------------------
    ("retirer", "to withdraw, to take off", "取出；撤回；脱下", "retire",
     "≠ 英语 retire（退休）= prendre sa retraite"),
    ("dessin", "drawing", "图画；素描", "design", "≠ 英语 design（设计）= conception"),
    ("essai", "attempt, test", "尝试；试验", "essay", "≠ 英语 essay（散文；论文）= dissertation"),
    ("barbe", "beard", "胡子；胡须", "barb", "≠ 英语 barb（倒钩）= barbelure"),
    ("défaut", "flaw, defect", "缺点；缺陷", "default", "≠ 英语 default（默认值）= valeur par défaut"),
    ("stade", "stadium; stage", "体育场；阶段", "stage", "≠ 英语 stage（舞台）= scène；法语 stage 是「实习」"),
    ("grossier", "coarse, rude", "粗糙的；粗鲁的", "gross", "≠ 英语 gross（总的）= brut"),
    ("stand", "stand, stall (at a fair)", "展台；摊位", "stand", "≠ 英语 stand（站立）= être debout"),
    ("ride", "wrinkle", "皱纹", "ride", "≠ 英语 ride（骑；乘）= monter / rouler"),
    ("fourniture", "supply, supplies", "供应；用品", "furniture", "≠ 英语 furniture（家具）= meubles"),
    ("chaire", "pulpit; professorship", "讲坛；教席", "chair", "≠ 英语 chair（椅子）= chaise"),
    # ---- D. 拼写完全一样、义项却错位的（原先挂在「同形词」档，最容易骗人）----
    ("siège", "seat; head office", "座位；总部", "siege", "≠ 英语 siege（围攻）；法语 siège 首义是「座位／总部」"),
    ("canon", "cannon; standard", "大炮；准则", "canon", "≠ 英语 canon（教规）；「大炮」的英语是 cannon，两个 n"),
    ("plateau", "tray; set (film)", "托盘；摄影棚", "plateau", "≠ 英语 plateau（高原；停滞期）；法语首义是「托盘」"),
    ("reconnaissance", "gratitude; recognition", "感激；承认", "reconnaissance",
     "≠ 英语 reconnaissance（侦察）；法语首义是「感激／承认」"),
    ("lot", "batch; prize", "一批；奖品", "lot", "≠ 英语 a lot（许多）= beaucoup"),
    ("instance", "authority; court level", "机构；审级", "instance", "≠ 英语 instance（例子）= exemple"),
    # ---- E. 英语同形词把中文带偏的（第二轮抽查）-----------------------------
    # 这几条的中文原来直接抄英语同形词的 ECDICT 首义，抄出来的是另一个词的义：
    # tempe→temple→「庙」、pôle→pole→「棒」、môle→mole→「痣」。
    ("tempe", "temple (side of the head)", "太阳穴；鬓角", "temple",
     "英语 temple 的常用义是「庙宇」；法语 tempe 只有「太阳穴」义，庙宇是 temple"),
    ("pôle", "pole (of the earth, of a magnet)", "极；极地；中心", "pole",
     "≠ 英语 pole（杆；棒）= perche / poteau"),
    ("môle", "breakwater, mole (pier)", "防波堤；码头", "mole",
     "≠ 英语 mole（痣；鼹鼠）= grain de beauté / taupe"),
    ("party", "party (social gathering)", "聚会；派对", "party",
     "法语 party 只有「聚会」义；「政党」是 parti"),
    ("ban", "proclamation; banns; ostracism", "公告；结婚公告；放逐", "ban",
     "≠ 英语 ban（禁令）= interdiction；法语 ban 是「公告」，mettre au ban 才是「排斥」"),
]

# Lexique's dominant reading is not always the one the faux-ami trap lives in
# ("nouvelle" is far more frequent as an adjective, but the trap is the noun).
FAUX_AMI_CGRAM = {
    "nouvelle": "NOM",
}

# 新增 faux-amis 的词性/阴阳性一律写死：这样「整表重建」和「只重跑释义层」
# 两条路径拿到的行完全一样，不依赖 Lexique 的主导读法。
FAUX_AMI_POS = {
    "rue": ("NOM", "f"), "chat": ("NOM", "m"), "pub": ("NOM", "f"), "sol": ("NOM", "m"),
    "fan": ("NOM", "m"), "cap": ("NOM", "m"), "pic": ("NOM", "m"), "trac": ("NOM", "m"),
    "cor": ("NOM", "m"), "bas": ("ADJ", None), "receler": ("VER", None),
    "décevoir": ("VER", None), "conducteur": ("NOM", "m"), "entrée": ("NOM", "f"),
    "propre": ("ADJ", None), "ancien": ("ADJ", None), "front": ("NOM", "m"),
    "marche": ("NOM", "f"), "partition": ("NOM", "f"), "cabinet": ("NOM", "m"),
    "tissu": ("NOM", "m"), "caméra": ("NOM", "f"), "pièce": ("NOM", "f"),
    "général": ("NOM", "m"), "banc": ("NOM", "m"), "sentence": ("NOM", "f"),
    "corne": ("NOM", "f"), "mars": ("NOM", "m"), "reste": ("NOM", "m"),
    "donner": ("VER", None), "arrêter": ("VER", None), "comprendre": ("VER", None),
    "asseoir": ("VER", None), "désolé": ("ADJ", None), "corps": ("NOM", "m"),
    "joli": ("ADJ", None), "compter": ("VER", None), "partie": ("NOM", "f"),
    "carte": ("NOM", "f"), "prix": ("NOM", "m"), "blanc": ("ADJ", None),
    "scène": ("NOM", "f"), "professeur": ("NOM", "m"), "poste": ("NOM", "f"),
    "manière": ("NOM", "f"), "époque": ("NOM", "f"), "magasin": ("NOM", "m"),
    "glace": ("NOM", "f"), "croisière": ("NOM", "f"), "communier": ("VER", None),
    "pochette": ("NOM", "f"), "retirer": ("VER", None), "dessin": ("NOM", "m"),
    "essai": ("NOM", "m"), "barbe": ("NOM", "f"), "défaut": ("NOM", "m"),
    "stade": ("NOM", "m"), "grossier": ("ADJ", None), "stand": ("NOM", "m"),
    "ride": ("NOM", "f"), "fourniture": ("NOM", "f"), "chaire": ("NOM", "f"),
    "siège": ("NOM", "m"), "canon": ("NOM", "m"), "plateau": ("NOM", "m"),
    "reconnaissance": ("NOM", "f"), "lot": ("NOM", "m"), "instance": ("NOM", "f"),
    "tempe": ("NOM", "f"), "pôle": ("NOM", "m"), "môle": ("NOM", "m"),
    "party": ("NOM", "f"), "ban": ("NOM", "m"),
}

# ---------------------------------------------------------------------------
# 3c. 手写中文覆盖表（词条本身是真同源词，只是 ECDICT 挑错了义项）
# ---------------------------------------------------------------------------
# 这些条目的英法配对没问题，问题在「英语词的哪个义项」：gin 是酒不是陷阱，
# clonage 是克隆不是「研制兼容产品」，relativement 是「相对地」不是「相关地」。
# 语义闸门会把它们判为可疑；有了这张表就不必整条丢掉。
AUTHORED_GLOSSES = {
    # 同形巧合里仍然成立的借词 / 真同源词
    "match": "比赛；对手", "bar": "酒吧", "kid": "小孩（口语）；小山羊",
    "gin": "杜松子酒", "omission": "遗漏；疏忽", "clonage": "克隆",
    "auditionner": "试镜；面试（演员）", "relativement": "相对地；比较而言",
    "tendresse": "温柔；柔情",
    # 语义闸门查出来、但英法配对成立的
    "passer": "经过；通过；度过", "forme": "形状；形式", "entier": "整个的；全部的",
    "société": "社会；公司", "cour": "庭院；宫廷；法院", "déposer": "放下；存放",
    "élever": "抬高；抚养", "saluer": "问候；致敬", "balancer": "摇摆；平衡",
    "retraite": "退休；撤退", "terme": "术语；期限", "marié": "已婚的",
    "trembler": "发抖；颤抖", "autoriser": "准许；授权", "tendre": "温柔的；嫩的",
    "rose": "粉红色的；玫瑰色的", "commandement": "命令；指挥",
    "normalement": "通常；正常地", "abuser": "滥用；欺骗", "net": "清晰的；净的",
    "employer": "雇用；使用", "populaire": "受欢迎的；大众的", "scénario": "剧本；情节",
    "portefeuille": "钱包；投资组合", "pasteur": "牧师", "capacité": "能力；容量",
    "peste": "瘟疫；鼠疫", "féminin": "女性的；阴性的", "disposition": "布置；安排；意向",
    "dépôt": "存放；仓库；沉积物", "activer": "启动；激活",
    "industrie": "工业；产业", "évoquer": "唤起；提及", "menu": "菜单",
    "grille": "栅栏；格子表", "réplique": "回答；台词；复制品", "grandeur": "大小；伟大",
    "accéder": "进入；到达；访问", "bonnet": "无边帽；软帽", "précédent": "先例；前一个",
    "orphelin": "孤儿", "satané": "该死的", "qualifier": "限定；称之为",
    "gorille": "大猩猩", "conjurer": "恳求；驱除", "franchise": "坦率；免赔额；特许经营",
    "vicieux": "恶劣的；不正当的", "roulette": "小轮子；轮盘赌", "hypocrite": "伪君子",
    "déplacement": "移动；出差", "attaché": "附加的；专员", "intrigue": "阴谋；情节",
    "agitation": "骚动；激动", "chargeur": "充电器；弹匣", "reconstituer": "重建；还原",
    "protecteur": "保护者；保护的", "démocrate": "民主人士；民主党人",
    "fraternité": "博爱；手足情谊", "recul": "后退；退让", "timing": "时机；节奏把握",
    "descendant": "后代；子孙", "vigile": "保安；警卫", "implanter": "植入；设立",
    "médiocre": "平庸的；中等的", "indigène": "土著的；本地的", "tata": "姑妈；阿姨（儿语）",
    "priser": "珍视；吸鼻烟", "surcharger": "使超载；超负荷", "chronique": "慢性的",
    "singulier": "单数的；奇特的", "endosser": "背书；承担",
    "élaborer": "制定；精心拟定", "verbe": "动词", "restriction": "限制；限定",
    "chauffeur": "司机", "cabaret": "歌舞餐厅；卡巴莱", "décliner": "婉拒；下降；变格",
    # 人工抽样复核时逮到的：义项挑得太偏（不是同形陷阱，是选错了那一条义）
    "ordre": "命令；秩序；次序", "point": "点；地点；程度；观点", "servir": "服务；招待；用作",
    "choix": "选择；挑选", "acte": "行为；证书；（戏剧）幕", "vacance": "空缺；空位",
    "enchanté": "幸会；很高兴认识您", "majesté": "陛下；威严", "calcul": "计算；演算",
    "profil": "侧面；轮廓；简介", "profiler": "描绘轮廓；使显现", "électricité": "电；电力",
    "obsession": "痴迷；强迫观念", "visualiser": "想象；使可见", "tequila": "龙舌兰酒",
    "édition": "版本；出版", "organisme": "机构；生物体",
    "débiter": "记入借方；切割；说出", "optique": "光学的；视角", "dard": "毒刺；标枪",
    "butte": "小丘；土墩", "débit": "流量；借方；零售", "terrier": "洞穴；梗犬",
    "collet": "衣领；圈套", "suite": "接下来的部分；套房；续集",

    # -----------------------------------------------------------------------
    # 第二轮：接入 core 之后逐条抽查补的三组
    # -----------------------------------------------------------------------
    # (a) 复核点名的高频错义：中文抄的是英语同形词的义，不是法语词的义
    "avocat": "律师；辩护人；鳄梨", "presse": "新闻界；报刊；压榨机",
    "staff": "全体职员；工作班子", "impressionner": "使有印象；使感动",
    "ambulance": "救护车",

    # (b) core 覆盖不到、只能靠英语跳板的行，逐条判读后改对
    "caravane": "大篷车；旅行拖车；商队", "boxer": "拳击",
    "liqueur": "利口酒；甜烧酒", "équation": "方程；方程式",
    "rétro": "复古的；怀旧的", "parachuter": "空投；伞降",
    "synchronisation": "同步", "originaire": "原籍的；来自某地的",
    "sire": "陛下", "grappin": "抓钩；四爪锚", "finale": "决赛；终曲",
    "prescription": "处方；规定；时效", "invalide": "残疾的；无效的",
    "inceste": "乱伦", "démolition": "拆除；拆毁",
    "favoriser": "偏袒；有利于；促进", "forge": "锻造车间；铁匠铺",
    "implant": "植入物；植入体", "invoquer": "援引；祈求",
    "prêcher": "布道；说教", "harcèlement": "骚扰", "vanité": "虚荣；自负",
    "intrigant": "搞阴谋的；诡计多端的", "infidélité": "不忠；背叛",
    "progressivement": "逐渐地；渐进地", "cohérent": "连贯的；一致的",
    "funky": "放克风格的；时髦的", "barré": "划掉的；封锁的",
    "indéfiniment": "无限期地", "recompter": "重新数；重新清点",
    "hit": "热门歌曲；轰动一时的作品", "pipeau": "牧笛；小笛", "gamma": "伽马",
    "sketch": "小品；短剧", "allocation": "津贴；补助金", "joker": "百搭牌；王牌",
    "loser": "失败者", "ring": "拳击台", "gentilhomme": "贵族；绅士",
    "compatible": "兼容的；相容的", "immaculé": "洁白无瑕的；一尘不染的",
    "méticuleux": "一丝不苟的", "lobe": "叶；裂片；耳垂",
    "séparément": "分别地；单独地", "promo": "促销；宣传", "astronaute": "宇航员",
    "projecteur": "投影仪；探照灯", "canot": "小艇；救生艇",
    "commune": "市镇；公社", "clergé": "神职人员", "illégalement": "非法地",
    "patio": "内院；露台", "indulgence": "宽容；纵容",
    "délicatesse": "细腻；体贴；精致", "cassette": "盒式磁带；小盒",
    "parer": "装饰；招架", "intervention": "介入；干预；手术",
    "réhabilitation": "康复；平反", "grotesque": "荒诞的；滑稽可笑的",
    "sobre": "节制的；朴素的", "dégénéré": "堕落的；退化的",
    "cutter": "美工刀；裁纸刀", "présidence": "主席职务；总统任期",

    # (c) core 也会犯「英语同形词」的错（joint→seal→海豹、lime→file→档案），
    #     以及 ECDICT 义项挑偏、说明句太长的，一并按法语词本身的义重写
    "plaque": "板；牌匾；牙菌斑", "vase": "花瓶", "joint": "接缝；垫圈",
    "balance": "天平；秤", "sinistre": "阴森的；不祥的", "étiquette": "标签；礼节",
    "obstruction": "阻塞；妨碍", "lime": "锉刀；酸橙", "stratège": "战略家",
    "malice": "恶意；狡黠", "remémorer": "回忆起；使想起", "réclame": "广告；宣传",
    "hangar": "库棚；机库", "rayure": "条纹；划痕", "relaxer": "放松；释放",
    "décréter": "颁布；下令", "concorder": "一致；相符", "délibérer": "商议；审议",
    "ruse": "诡计；花招", "trait": "线条；特征；笔画", "pose": "姿势；安放",
    "spectre": "幽灵；光谱", "clarté": "明亮；清晰", "gel": "结冰；凝胶",
    "autorisé": "获准的；权威的", "bloc": "块；集团；街区", "sauce": "调味汁；酱汁",
    "affecter": "影响；分配；假装", "dispenser": "免除；分发",
    "braver": "不畏；顶住；蔑视", "mutation": "突变；变异；调动",
    "muse": "缪斯；灵感女神", "transaction": "交易；和解", "arc": "弓；弧；拱",
    "bit": "比特；位", "master": "硕士学位；硕士课程", "palme": "棕榈叶；蹼泳脚蹼",
    "bey": "贝伊（奥斯曼帝国的地方长官）", "matrice": "矩阵；母体；模具",
    "finition": "修整；精加工", "probation": "缓刑；见习期",
    "zoomer": "变焦；推拉镜头", "shoot": "射门", "blues": "布鲁斯音乐；忧郁",
    "tank": "坦克；箱柜", "relayer": "接替；转播", "émission": "节目；播放；发射",
    "express": "特快的；快速的", "icône": "图标；圣像",
    "convenance": "合适；方便；礼节", "conditionner": "包装；制约",
    "ardu": "艰巨的；费力的", "phénoménal": "非凡的；惊人的",
    "pâlir": "变苍白；褪色", "représentatif": "有代表性的；典型的",
    "spécialiser": "使专门化；专攻", "itinéraire": "路线；行程",
    "alléger": "减轻；使轻便", "album": "相册；唱片专辑",
    "agressif": "好斗的；侵略性的", "jet": "喷射；投掷",
    "engagement": "承诺；约定；投入", "torture": "酷刑；折磨",
    "tolérer": "容忍；宽容", "griller": "烤；烘烤",
    "pénétrer": "进入；穿透；渗透", "équipage": "全体船员；机组人员",
    "liaison": "联系；联络；私情", "réserve": "储备；保留；保护区",
    "associé": "合伙人；同伴", "pressé": "匆忙的；紧迫的", "renoncer": "放弃；抛弃",
    "unité": "单位；单元；统一", "attacher": "系；拴；附上",
    "superbe": "华丽的；极好的", "survivre": "幸存；生还", "départ": "出发；启程",
    "super": "极好的；超级的", "sûr": "确信的；可靠的；安全的",
    "casino": "赌场", "conteneur": "集装箱", "container": "集装箱",
    "légion": "军团；大批", "collage": "拼贴画", "plaquer": "镀；贴面；抛弃",
    "conférer": "授予；商议",

    # (d) 闸门无法裁决的跳板行：这些词 core 里没有（或没过 core 闸门），英语侧
    #     又拿不到能裁决的义项集合，闸门只能给 unknown。原来它们照样挂着跳板
    #     中文，界面上跟裁决通过的行长得一模一样，看不出「这条没人核过」。
    #     逐条人工判读后写进手写层：判对的按法语词本身的义补全，ECDICT 括号
    #     注释太啰嗦的削掉，判错的（ban → 「禁令」是英语义）改走 faux-amis 表。
    "rivière": "河流；河", "flûte": "长笛", "euro": "欧元",
    "carnaval": "狂欢节；嘉年华", "constitution": "宪法；构成；体质",
    "secte": "教派；宗派", "barbelé": "带倒刺的；有刺的",
    "palestinien": "巴勒斯坦的；巴勒斯坦人的", "prototype": "原型；样机",
    "bourbon": "波旁威士忌；波旁王朝", "réconciliation": "和解；和好",
    "fascisme": "法西斯主义", "caricature": "漫画；讽刺画",
    "masturbation": "手淫", "faction": "派系；派别；站岗",
    "confidentialité": "保密性；机密性", "testostérone": "睾酮；睾丸激素",
    "dopamine": "多巴胺", "extrémiste": "极端主义者",
    "combiner": "组合；结合；策划", "lasagne": "千层面；烤宽面条",
    "anémie": "贫血", "musée": "博物馆", "plain": "平坦的；平的",
    "torpille": "鱼雷；电鳐", "diagnostiquer": "诊断",

    # (e) 教材词表里搭配义项掉了省略号，只剩光杆虚词（"把；看作"）。虚词单元
    #     由 drop_bare_particles 兜底剔掉，但剔完剩下的半句还是不成话，这几条
    #     按搭配本身补全。
    "considérer": "认为；把…看作", "réagir": "作出反应；起反应",
    "consacrer": "奉献；把…用于", "dater": "注明日期；追溯到",
    "confronter": "使对质；对照", "collaborer": "合作；协作",
    "tarder": "延迟；拖延；迟迟不做", "correctement": "正确地；恰当地",

    # (f) 抽查残句时顺带撞见的选义错（都是 ECDICT 把英语同形词的义挑了过来）
    "navigateur": "浏览器；航海者；导航员",   # ≠ navigator，现代法语首义是浏览器
    "stressant": "令人紧张的；有压力的",       # 原为动词 stress 的义「着重；重读」
    "gravité": "重力；地心引力；严重性",       # 原末项「严格」是 gravity 的误挑
    "préfecture": "省政府；省会",             # 原为日式「地方长官辖区」
    "brigadier": "警长；下士；工头",           # ≠ 英语 brigadier（准将）
}

# ---------------------------------------------------------------------------
# 3d. 直接删掉的条目：配对本身就是垃圾，给不出可靠中文
# ---------------------------------------------------------------------------
DROP_COGNATES = {
    "are": "英语 are 是 be 的变位形式，不是可对照的实词；法语 are（公亩）与它毫无关系",
    "berline": "配的英语 berlin 是专有名词/生僻织物词，学习者用不上",
    "tire": "法语 tire 是动词变位形式，配 en tire（轮胎/疲劳）纯属巧合",
    "casse": "法语 casse 多为动词变位，配 en case 无语义交集",
    "paye": "配 en payer（支付者）错位，paye 是「工资」",
    "colon": "配 en colonel（上校）错位，colon 是「殖民者／结肠」",
    "raie": "配 en ray（光线）错位，raie 是「条纹／鳐鱼」",
    "rider": "法语 rider 是「使起皱」，配 en ride（骑）纯属同形",
    "volée": "ECDICT 释义是残句「(箭」；第二轮的括号配对修复能还原成「齐射」，但整行上一轮已删，两条重建路径要一致，保持删除",
}


# ===========================================================================
# helpers
# ===========================================================================
def log(msg):
    sys.stderr.write(msg + "\n")
    sys.stderr.flush()


def ensure_sources(cache, offline=False, need_kaikki=True):
    os.makedirs(cache, exist_ok=True)
    for name, url in SOURCES.items():
        dest = os.path.join(cache, name)
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            continue
        if offline:
            raise SystemExit("missing source %s and --offline given" % dest)
        log("downloading %s ..." % name)
        subprocess.check_call(["curl", "-sSL", "-o", dest, url])
    lexdir = os.path.join(cache, "lex")
    if not os.path.exists(os.path.join(lexdir, "Lexique383.tsv")):
        subprocess.check_call(["unzip", "-o", "-q", os.path.join(cache, "Lexique383.zip"), "-d", lexdir])
    kaikki = os.path.join(cache, "fr_kaikki_slim.jsonl")
    # 搭配层只用 Tatoeba + Lexique；570 MB 的 kaikki 仅同源词层需要。
    if need_kaikki and (not os.path.exists(kaikki) or os.path.getsize(kaikki) < 1000):
        if offline:
            raise SystemExit("missing %s and --offline given" % kaikki)
        log("streaming kaikki French dump (570 MB) -> slim jsonl ...")
        stream_kaikki(KAIKKI_URL, kaikki)
    return cache


def stream_kaikki(url, dest):
    """Download the wiktextract dump and keep only the fields we need."""
    keep_pos = {"noun", "verb", "adj", "adv"}
    proc = subprocess.Popen(["curl", "-sSL", url], stdout=subprocess.PIPE)
    n = 0
    with open(dest, "w", encoding="utf-8") as out:
        for raw in proc.stdout:
            try:
                e = json.loads(raw.decode("utf-8"))
            except Exception:
                continue
            if e.get("lang_code") != "fr" or e.get("pos") not in keep_pos:
                continue
            glosses, examples, tags = [], [], set(e.get("tags") or [])
            for s in e.get("senses") or []:
                tags.update(s.get("tags") or [])
                for g in (s.get("glosses") or []):
                    if g not in glosses:
                        glosses.append(g)
                for ex in (s.get("examples") or []):
                    if ex.get("text"):
                        examples.append({"t": ex["text"], "e": ex.get("english") or ""})
            if not glosses:
                continue
            rec = {"w": e["word"], "p": e["pos"], "t": sorted(tags), "g": glosses[:6]}
            if examples:
                rec["x"] = examples[:6]
            if e.get("etymology_text"):
                rec["ety"] = e["etymology_text"][:400]
            out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            n += 1
    proc.wait()
    log("  kept %d French wiktionary entries" % n)


def read_bz2_tsv(path):
    with bz2.open(path, "rt", encoding="utf-8", newline="") as fh:
        for row in csv.reader(fh, delimiter="\t", quoting=csv.QUOTE_NONE):
            yield row


try:
    import zhconv

    def to_simplified(text):
        return zhconv.convert(text, "zh-cn")
    HAVE_ZHCONV = True
except ImportError:  # pragma: no cover
    def to_simplified(text):
        return text
    HAVE_ZHCONV = False


TRAD_MARKERS = set("們這說國個時來點沒買賣車東風飛馬鳥語書聽讀學會對開關長門問題發現實愛歡樂"
                   "體幾號嗎麼樣還從當種類數萬億億義議認識維護權興業農產專屬華觀親")


def strip_accents(text):
    return "".join(c for c in unicodedata.normalize("NFD", text)
                   if unicodedata.category(c) != "Mn").lower()


def edit_distance(a, b):
    a, b = strip_accents(a), strip_accents(b)
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i]
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost))
        prev = cur
    return prev[len(b)]


def _f(x):
    try:
        return float(x or 0)
    except ValueError:
        return 0.0


# ===========================================================================
# 4. LEXIQUE 3.83
# ===========================================================================
class Lexique(object):
    def __init__(self, path):
        verb_share = defaultdict(lambda: [0.0, 0.0])
        cands = defaultdict(set)
        self.lemfreq = defaultdict(float)
        self.lemfreq_books = defaultdict(float)
        self.cgram = {}
        self.genre = {}
        # A lemma can be listed under several parts of speech ("par" is both a
        # preposition and the golf noun).  Keep the frequency-dominant reading.
        cgram_freq = defaultdict(lambda: defaultdict(float))
        infover = defaultdict(set)
        with open(path, encoding="utf-8") as fh:
            for r in csv.DictReader(fh, delimiter="\t"):
                o, lem, cg = r["ortho"], r["lemme"], r["cgram"]
                fq = _f(r["freqfilms2"])
                if cg in ("VER", "AUX"):
                    verb_share[o][0] += fq + 0.01
                    cands[o].add(lem)
                    infover[o].add(r["infover"])
                else:
                    verb_share[o][1] += fq + 0.01
                self.lemfreq[lem] = max(self.lemfreq[lem], _f(r["freqlemfilms2"]))
                self.lemfreq_books[lem] = max(self.lemfreq_books[lem], _f(r["freqlemlivres"]))
                if r["islem"] == "1":
                    cgram_freq[lem][cg] += fq + 0.001
                    if cg == "NOM" and r["genre"] in ("m", "f"):
                        self.genre.setdefault(lem, r["genre"])
        self.cgram = {lem: max(d.items(), key=lambda kv: kv[1])[0] for lem, d in cgram_freq.items()}
        # A form counts as a verb when the verb reading dominates its frequency;
        # among competing lemmas the most frequent lemma wins (so "suis" -> être).
        self.verb_form = {}
        for o, (v, other) in verb_share.items():
            if v > 0 and v / (v + other) >= 0.55:
                self.verb_form[o] = max(cands[o], key=lambda l: self.lemfreq.get(l, 0.0))
        self.inf = set()
        self.partpas = set()
        for o, tags in infover.items():
            joined = ";".join(tags)
            if "inf;" in joined:
                self.inf.add(o)
            if "par:pas" in joined:
                self.partpas.add(o)
        lemmas = [l for l, cg in self.cgram.items()
                  if cg in ("NOM", "ADJ", "VER", "ADV")
                  and (self.lemfreq[l] > 0 or self.lemfreq_books[l] > 0)]
        lemmas.sort(key=lambda l: (-self.lemfreq[l], -self.lemfreq_books[l], l))
        # real corpus rank (Lexique film-subtitle lemma frequency, books as tiebreak)
        self.rank = {l: i + 1 for i, l in enumerate(lemmas)}


# ===========================================================================
# 5. TATOEBA
# ===========================================================================
CJK_RE = re.compile(r"[一-鿿]")
FR_OK_RE = re.compile(r"^[0-9A-Za-zÀ-ÖØ-öø-ÿŒœ'   ’\-,;:!?.«»()%]+$")
TOKEN_RE = re.compile(r"[a-zà-öø-ÿœæ]+['’]|[a-zà-öø-ÿœæ]+|[0-9]+|[^\sa-zà-öø-ÿœæ0-9]")


def tokenize(text):
    return TOKEN_RE.findall(text.lower().replace("’", "'"))


def load_tatoeba(cache):
    """Return (all_fr_sentences, fr_zh_pairs).

    A pair is (fr_id, fr_text, zh_text, zh_id, kind, eng_pivot_id) where kind is
    'direct' (fra-cmn link) or 'indirect' (fra-eng-cmn chain).
    """
    fra, cmn = {}, {}
    for row in read_bz2_tsv(os.path.join(cache, "fra_sentences.tsv.bz2")):
        if len(row) >= 3:
            fra[row[0]] = row[2]
    for row in read_bz2_tsv(os.path.join(cache, "cmn_sentences.tsv.bz2")):
        if len(row) >= 3:
            cmn[row[0]] = row[2]
    direct = defaultdict(list)
    for row in read_bz2_tsv(os.path.join(cache, "fra-cmn_links.tsv.bz2")):
        if len(row) >= 2 and row[0] in fra and row[1] in cmn:
            direct[row[0]].append(row[1])
    fe = defaultdict(list)
    for row in read_bz2_tsv(os.path.join(cache, "fra-eng_links.tsv.bz2")):
        if len(row) >= 2:
            fe[row[0]].append(row[1])
    ec = defaultdict(list)
    for row in read_bz2_tsv(os.path.join(cache, "eng-cmn_links.tsv.bz2")):
        if len(row) >= 2 and row[1] in cmn:
            ec[row[0]].append(row[1])
    pairs = []
    for fid, ftext in fra.items():
        zids = direct.get(fid)
        if zids:
            pairs.append((fid, ftext, cmn[zids[0]], zids[0], "direct", ""))
            continue
        for eid in fe.get(fid, [])[:3]:
            z = ec.get(eid)
            if z:
                pairs.append((fid, ftext, cmn[z[0]], z[0], "indirect", eid))
                break
    return fra, pairs


def clean_zh(text):
    text = text.strip()
    if not CJK_RE.search(text):
        return None
    text = to_simplified(text)
    if any(ch in TRAD_MARKERS for ch in text):
        return None          # still traditional -> zhconv unavailable, drop it
    if len(text) > 42 or len(text) < 2:
        return None
    if re.search(r"[A-Za-z]{4,}", text):
        return None
    return text


def clean_fr(text, min_tok=3, max_tok=18):
    """Keep only sentences that the app's example parser can split unambiguously."""
    text = text.strip().replace("’", "'")
    if not text or CJK_RE.search(text):
        return None
    if not FR_OK_RE.match(text):
        return None
    ntok = len(text.split())
    if ntok < min_tok or ntok > max_tok:
        return None
    if text[-1] not in ".!?":
        return None
    if re.search(r"[.!?！？。]", text[:-1]):
        return None
    return text


def js_extract(raw):
    """Faithful port of verb-collocations-practice.js extractItZh()."""
    text = str(raw).strip()
    m = re.match(r"^(.+?[\.!?！？。])\s*(.+)$", text)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    idx = -1
    for i, ch in enumerate(text):
        if "一" <= ch <= "鿿":
            idx = i
            break
    if idx > 0:
        return text[:idx].strip(), text[idx:].strip()
    return text, ""


# ===========================================================================
# 6. GOVERNMENT MINING
# ===========================================================================
SKIP_AFTER_VERB = set("""ne pas plus jamais rien tout toujours souvent beaucoup bien mal vraiment
encore déjà aussi trop peu très y en me te se nous vous lui leur la le les l' m' t' s' guère
parfois immédiatement directement enfin même seulement simplement finalement soudain volontiers""".split())
AUXLIKE = {"avoir", "être", "aller", "pouvoir", "vouloir", "devoir", "falloir", "faire", "laisser",
           "venir", "sembler", "paraître", "oser", "savoir"}
DETS = set("le la les un une des du de l' mon ma mes ton ta tes son sa ses ce cet cette ces "
           "notre nos votre vos leur leurs".split())
# determiners that can never be a preverbal clitic — a verb form right after one
# is really a noun ("un manque de", "ce pouvoir de")
NOUN_TRIGGER_DETS = set("un une des du mon ma mes ton ta tes son sa ses ce cet cette ces "
                        "notre nos votre vos plusieurs quelques chaque".split())
H_ASPIRE = {"hâter", "heurter", "hisser", "hurler", "hausser"}
VOWELS = "aeiouyâàéèêëîïôöûùü"


def refl_form(lemma):
    if lemma and (lemma[0] in VOWELS or (lemma[0] == "h" and lemma not in H_ASPIRE)):
        return "s'" + lemma
    return "se " + lemma


def mine_sentence(tokens, lex):
    """Return [(verb_key, preposition, gap)] hits.

    `gap` is 'none' when the preposition follows the verb directly (modulo
    clitics/adverbs), 'det' when a determiner-headed object NP intervenes
    ("donner un livre à Marie"), 'bare' otherwise.  Only 'none' and (for the
    ditransitive à) 'det' hits are trustworthy enough to be shown as examples.
    """
    hits = []
    n = len(tokens)
    for i, tok in enumerate(tokens):
        lemma = lex.verb_form.get(tok)
        if not lemma:
            continue
        if lemma in AUXLIKE and i + 1 < n and tokens[i + 1] in lex.verb_form \
                and (tokens[i + 1] in lex.inf or tokens[i + 1] in lex.partpas):
            continue
        # "un manque de ...", "ce pouvoir de ..." -> the token is a noun, not a verb
        if i > 0 and tokens[i - 1] in NOUN_TRIGGER_DETS:
            continue
        key = refl_form(lemma) if (i > 0 and tokens[i - 1] in ("se", "s'")) else lemma
        j, steps, gap = i + 1, 0, "none"
        while j < n and steps < 3:
            tk = tokens[j]
            if tk in CONTRACT or tk in PREPSET:
                hits.append((key, CONTRACT.get(tk, tk), gap))
                break
            if tk in SKIP_AFTER_VERB:
                j += 1
                continue
            if tk.isalpha() and tk not in lex.verb_form:
                if gap == "none":
                    gap = "det" if tk in DETS else "bare"
                j += 1
                steps += 1
                continue
            break
    return hits


# quality thresholds for the corpus-mined layer
MIN_SUPPORT = 6          # occurrences in the 722k-sentence French corpus
MIN_LIFT = 1.5           # p(prep|verb) / p(prep)
MIN_SHARE = 0.08         # p(prep|verb)
MAX_EXAMPLES = 6         # corpus examples kept per (verb, preposition)


def build_collocations(cache, lex, out_path):
    log("loading Tatoeba ...")
    fra, pairs = load_tatoeba(cache)
    log("  %d French sentences, %d with a Chinese translation" % (len(fra), len(pairs)))

    pair_count, verb_count, prep_count = Counter(), Counter(), Counter()
    for text in fra.values():
        for key, prep, _gap in mine_sentence(tokenize(text), lex):
            pair_count[(key, prep)] += 1
            verb_count[key] += 1
            prep_count[prep] += 1
    total_prep = sum(prep_count.values())
    log("  mined %d (verb, prep) pairs over %d verbs" % (len(pair_count), len(verb_count)))

    curated_keys = {(v, p) for v, p, _, _ in CURATED}

    # ---- examples from the FR-ZH aligned subset -----------------------------
    candidates = defaultdict(list)        # (verb, prep) -> [(sortkey, text, meta)]
    stats = {"zh_rejected": 0, "fr_rejected": 0, "roundtrip_rejected": 0,
             "gap_rejected": 0, "dup": 0}
    for fid, ftext, ztext, zid, kind, eid in pairs:
        fr = clean_fr(ftext)
        if not fr:
            stats["fr_rejected"] += 1
            continue
        zh = clean_zh(ztext)
        if not zh:
            stats["zh_rejected"] += 1
            continue
        combined = fr + " " + zh
        got_fr, got_zh = js_extract(combined)
        if got_fr != fr or got_zh != zh:
            stats["roundtrip_rejected"] += 1
            continue
        for key, prep, gap in set(mine_sentence(tokenize(ftext), lex)):
            if gap == "bare" or (gap == "det" and prep != "à"):
                stats["gap_rejected"] += 1
                continue
            # best examples first: direct translations, adjacent preposition, short
            sortkey = (0 if kind == "direct" else 1, 0 if gap == "none" else 1, len(fr))
            candidates[(key, prep)].append((sortkey, combined, {
                "kind": kind, "fr": fid, "zh": zid, "eng": eid,
            }))

    examples = {}
    for pairkey, cands in candidates.items():
        cands.sort(key=lambda c: c[0])
        seen_fr, seen_zh, kept = set(), set(), []
        for _sk, text, meta in cands:
            fr_part, zh_part = js_extract(text)
            nf = re.sub(r"[^a-z]", "", strip_accents(fr_part))
            if nf in seen_fr or zh_part in seen_zh:
                stats["dup"] += 1
                continue
            seen_fr.add(nf)
            seen_zh.add(zh_part)
            kept.append((text, meta))
            if len(kept) >= MAX_EXAMPLES:
                break
        examples[pairkey] = kept

    # Borderline (rare / regional / non-standard) pairs dropped on review;
    # applies to curated and corpus-mined pairs alike.
    PRUNED_PAIRS = {("bayer", "à"), ("s'ennuyer", "de"),
                    ("s'approvisionner", "de"), ("débattre", "sur")}

    # ---- decide which (verb, prep) pairs ship -------------------------------
    verbs = {}
    prep_index = defaultdict(list)
    total_examples = 0
    kept_corpus = kept_curated = 0
    rejected_pairs = 0

    def add(key, prep, entries, meta):
        e = verbs.setdefault(key, {"display": key, "prepositions": {},
                                   "prepositionOrder": [], "sources": {}, "notes": {}})
        e["prepositions"][prep] = [t for t, _ in entries]
        e["sources"][prep] = [m for _, m in entries]
        if prep not in e["prepositionOrder"]:
            e["prepositionOrder"].append(prep)
        if meta.get("note"):
            e["notes"][prep] = meta["note"]

    load_authored_sources()
    curated_by_pair = defaultdict(list)
    for verb, prep, frame, zh in CURATED:
        curated_by_pair[(verb, prep)].append((frame, zh))
    for (verb, prep), items in AUTHORED_EXAMPLES.items():
        if (verb, prep) not in curated_by_pair:
            raise SystemExit("%s: authored example for %s + %s has no C (frame) line"
                             % (items[0][2], verb, prep))

    all_pairs = (set(curated_by_pair) | set(pair_count)) - PRUNED_PAIRS
    # The contrast drill prompts with the Chinese half and asks for the
    # preposition, so one verb must never carry the same Chinese gloss under two
    # different prepositions — that question would have two correct answers.
    zh_by_verb = defaultdict(set)
    # same key the validator uses to reject a French sentence repeated
    # inside one verb (an authored sentence can coincide with a mined one)
    fr_by_verb = defaultdict(set)

    def fr_key(s):
        s = unicodedata.normalize("NFD", s.lower())
        s = "".join(c for c in s if unicodedata.category(c) != "Mn")
        return re.sub(r"[^a-z ]", "", s).strip()

    for (verb, prep) in sorted(all_pairs):
        entries = []
        note = CONTRAST_NOTE.get((verb, prep))
        is_curated = (verb, prep) in curated_by_pair
        if is_curated:
            for frame, zh in curated_by_pair[(verb, prep)]:
                text = "%s %s" % (frame, zh)
                got_fr, got_zh = js_extract(text)
                if got_fr != frame or got_zh != zh:
                    raise SystemExit("curated entry not parseable by the app: %r" % text)
                if zh in zh_by_verb[verb]:
                    raise SystemExit("curated gloss %r is ambiguous for verb %r" % (zh, verb))
                zh_by_verb[verb].add(zh)
                entries.append((text, {"kind": "curated", "authored": True}))
            for fr_s, zh_s, where in AUTHORED_EXAMPLES.get((verb, prep), []):
                text = "%s %s" % (fr_s, zh_s)
                got_fr, got_zh = js_extract(text)
                if (got_fr != fr_s or got_zh != zh_s or clean_fr(fr_s, 2, 30) != fr_s
                        or not CJK_RE.search(zh_s) or CJK_RE.search(fr_s)):
                    raise SystemExit("%s: authored example not parseable by the app: %r" % (where, text))
                if zh_s in zh_by_verb[verb]:
                    raise SystemExit("%s: Chinese %r repeats another example of %r" % (where, zh_s, verb))
                if fr_key(fr_s) in fr_by_verb[verb]:
                    raise SystemExit("%s: French sentence repeats another example of %r" % (where, verb))
                zh_by_verb[verb].add(zh_s)
                fr_by_verb[verb].add(fr_key(fr_s))
                entries.append((text, {"kind": "authored", "authored": True}))
            kept_curated += 1
        else:
            n = pair_count.get((verb, prep), 0)
            if verb in ("être", "avoir") or n < MIN_SUPPORT:
                rejected_pairs += 1
                continue
            share = n / verb_count[verb]
            lift = share / (prep_count[prep] / total_prep)
            if share < MIN_SHARE or lift < MIN_LIFT:
                rejected_pairs += 1
                continue
        added = 0
        for text, meta in examples.get((verb, prep), []):
            fr_part, zh_part = js_extract(text)
            if zh_part in zh_by_verb[verb] or fr_key(fr_part) in fr_by_verb[verb]:
                stats["dup"] += 1
                continue
            zh_by_verb[verb].add(zh_part)
            fr_by_verb[verb].add(fr_key(fr_part))
            entries.append((text, meta))
            added += 1
            if added >= MAX_EXAMPLES:
                break
        if not is_curated:
            if len(entries) == 0:
                rejected_pairs += 1
                continue
            kept_corpus += 1
        if not entries:
            rejected_pairs += 1
            continue
        add(verb, prep, entries, {"note": note})
        total_examples += len(entries)

    # ---- verb + noun collocations (additive layer) --------------------------
    noun_hits = 0
    for verb, colloc, zh in NOUN_COLLOCATIONS:
        entry = verbs.get(verb)
        if entry is None:
            entry = verbs.setdefault(verb, {"display": verb, "prepositions": {},
                                            "prepositionOrder": [], "sources": {}, "notes": {}})
        text = "%s %s" % (colloc, zh)
        got_fr, got_zh = js_extract(text)
        if got_fr != colloc or got_zh != zh:
            raise SystemExit("noun collocation not parseable: %r" % text)
        entry.setdefault("nounCollocations", []).append(
            {"text": text, "collocation": colloc, "chinese": zh, "source": "authored"})
        noun_hits += 1

    # A verb with an empty `prepositions` map renders as a blank card in the
    # practice screen, so it must not ship — noun collocations alone are not
    # enough.  Anything that lands here needs a curated government line above.
    for key in [k for k, v in verbs.items() if not v["prepositionOrder"]]:
        if verbs[key].get("nounCollocations"):
            raise SystemExit(
                "verb %r has noun collocations but no preposition — add a CURATED entry" % key)
        del verbs[key]

    # ---- order + index ------------------------------------------------------
    for key, entry in verbs.items():
        entry["prepositionOrder"].sort(key=lambda p: PREPOSITION_ORDER.index(p))
        entry["prepositions"] = {p: entry["prepositions"][p] for p in entry["prepositionOrder"]}
        entry["sources"] = {p: entry["sources"][p] for p in entry["prepositionOrder"]}
        if not entry["notes"]:
            del entry["notes"]
        for prep in entry["prepositionOrder"]:
            prep_index[prep].append(key)
    for prep in prep_index:
        prep_index[prep].sort()

    data = {
        "meta": {
            "totalVerbs": len(verbs),
            "totalExamples": sum(len(v) for e in verbs.values() for v in e["prepositions"].values()),
            "prepositionOrder": [p for p in PREPOSITION_ORDER if prep_index.get(p)],
            "language": "french",
            "sources": [
                {"id": "curated", "label": "本项目自编动词支配表（依据标准法语语法）", "license": "project-authored"},
                {"id": "authored", "label": "本项目自编例句（scripts/sources/french-collocations）", "license": "project-authored"},
                {"id": "direct", "label": "Tatoeba fra-cmn 直接对译", "license": TATOEBA_LICENSE},
                {"id": "indirect", "label": "Tatoeba fra→eng→cmn 间接对译", "license": TATOEBA_LICENSE},
                {"id": "lexique", "label": "Lexique 3.83（词元与频率）", "license": LEXIQUE_LICENSE},
            ],
            "generatedBy": "scripts/build_french_extras.py",
        },
        "verbs": {k: verbs[k] for k in sorted(verbs)},
        "prepositions": {p: prep_index[p] for p in PREPOSITION_ORDER if prep_index.get(p)},
    }
    header = (
        "// French verb collocations (verb + governed preposition + complement).\n"
        "// Mirrors the Italian data/verb-collocations-data.js shape exactly:\n"
        "//   { meta: { totalVerbs, totalExamples, prepositionOrder },\n"
        "//     verbs: { <slug>: { display, prepositions: { <prep>: [\"<fr> <zh>\"] }, prepositionOrder } },\n"
        "//     prepositions: { <prep>: [<slug>] } }\n"
        "// Additive fields (ignored by the current renderer): meta.language, meta.sources,\n"
        "//   verbs[x].sources (per-example provenance), verbs[x].notes (à/de contrast notes),\n"
        "//   verbs[x].nounCollocations (verb + noun collocations).\n"
        "// Sources: hand-authored government table + Tatoeba (CC BY 2.0 FR) + Lexique 3.83 (CC BY-SA 4.0).\n"
        "// Rebuild: python3 scripts/build_french_extras.py\n"
        "// Total verbs: %d / Total examples: %d\n" % (data["meta"]["totalVerbs"], data["meta"]["totalExamples"])
    )
    body = "const FRENCH_COLLOCATIONS_DATA = %s;\n\n" % json.dumps(data, ensure_ascii=False, indent=2)
    tail = ("if (typeof window !== 'undefined') { window.FRENCH_COLLOCATIONS_DATA = FRENCH_COLLOCATIONS_DATA; }\n"
            "if (typeof module !== 'undefined' && module.exports) { module.exports = FRENCH_COLLOCATIONS_DATA; }\n")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(header + "\n" + body + tail)
    log("collocations: %d verbs, %d examples (curated pairs %d, corpus pairs %d, rejected pairs %d, noun collocations %d)"
        % (data["meta"]["totalVerbs"], data["meta"]["totalExamples"], kept_curated, kept_corpus,
           rejected_pairs, noun_hits))
    log("  example filter: fr_rejected=%(fr_rejected)d zh_rejected=%(zh_rejected)d "
        "roundtrip_rejected=%(roundtrip_rejected)d dup=%(dup)d" % stats)
    return data


# ===========================================================================
# 7. COGNATES
# ===========================================================================
# French -> English orthographic correspondences.  (fr_suffix, en_suffix, label)
FR_EN_PATTERNS = [
    ("ation", "ation", "-ation/-ation"),
    ("tion", "tion", "-tion/-tion"),
    ("sion", "sion", "-sion/-sion"),
    ("ité", "ity", "-ité/-ity"),
    ("té", "ty", "-té/-ty"),
    ("eur", "or", "-eur/-or"),
    ("eur", "er", "-eur/-er"),
    ("ique", "ic", "-ique/-ic"),
    ("aire", "ary", "-aire/-ary"),
    ("oire", "ory", "-oire/-ory"),
    ("eux", "ous", "-eux/-ous"),
    ("euse", "ous", "-euse/-ous"),
    ("ance", "ance", "-ance/-ance"),
    ("ence", "ence", "-ence/-ence"),
    ("isme", "ism", "-isme/-ism"),
    ("iste", "ist", "-iste/-ist"),
    ("if", "ive", "-if/-ive"),
    ("ive", "ive", "-ive/-ive"),
    ("able", "able", "-able/-able"),
    ("ible", "ible", "-ible/-ible"),
    ("ment", "ment", "-ment/-ment"),
    ("age", "age", "-age/-age"),
    ("ure", "ure", "-ure/-ure"),
    # -esse 有两条对应：tendresse/tenderness、richesse/richness 走 -ness，
    # adresse/address、hôtesse/hostess 走 -ess。-ness 必须排在前面，否则
    # "tenderness" 会先被 -esse/-ess 吃掉（词干 tendern，看着也像对得上）。
    ("esse", "ness", "-esse/-ness"),
    ("esse", "ess", "-esse/-ess"),
    ("ance", "ancy", "-ance/-ancy"),
    ("ie", "y", "-ie/-y"),
    ("al", "al", "-al/-al"),
    ("el", "al", "-el/-al"),
    ("ant", "ant", "-ant/-ant"),
    ("ent", "ent", "-ent/-ent"),
    ("aine", "ain", "-aine/-ain"),
    ("er", "ate", "-er/-ate"),
    ("ier", "ier", "-ier/-ier"),
    ("phe", "ph", "-phe/-ph"),
    ("que", "c", "-que/-c"),
    ("ère", "er", "-ère/-er"),
    ("é", "ated", "-é/-ated"),
    ("ien", "ian", "-ien/-ian"),
    ("ienne", "ian", "-ienne/-ian"),
    ("aise", "ese", "-aise/-ese"),
    ("ais", "ese", "-ais/-ese"),
    ("logie", "logy", "-logie/-logy"),
    ("graphie", "graphy", "-graphie/-graphy"),
    ("nomie", "nomy", "-nomie/-nomy"),
    ("iser", "ize", "-iser/-ize"),
    ("ifier", "ify", "-ifier/-ify"),
    ("eau", "el", "-eau/-el"),
    ("ette", "et", "-ette/-et"),
    ("é", "ed", "-é/-ed"),
    ("e", "", "-e/-∅（法语词尾哑音 e 脱落）"),
]
# French -> Italian orthographic correspondences (the FR<->IT bridge).
FR_IT_PATTERNS = [
    ("tion", "zione", "-tion/-zione"),
    ("sion", "sione", "-sion/-sione"),
    ("ité", "ità", "-ité/-ità"),
    ("té", "tà", "-té/-tà"),
    ("eur", "ore", "-eur/-ore"),
    ("ique", "ico", "-ique/-ico"),
    ("aire", "ario", "-aire/-ario"),
    ("oire", "orio", "-oire/-orio"),
    ("eux", "oso", "-eux/-oso"),
    ("ance", "anza", "-ance/-anza"),
    ("ence", "enza", "-ence/-enza"),
    ("isme", "ismo", "-isme/-ismo"),
    ("iste", "ista", "-iste/-ista"),
    ("if", "ivo", "-if/-ivo"),
    ("al", "ale", "-al/-ale"),
    ("el", "ale", "-el/-ale"),
    ("ment", "mente", "-ment/-mente"),
    ("age", "aggio", "-age/-aggio"),
    ("ure", "ura", "-ure/-ura"),
    ("ie", "ia", "-ie/-ia"),
    ("ant", "ante", "-ant/-ante"),
    ("ent", "ente", "-ent/-ente"),
    ("er", "are", "-er/-are"),
    ("ir", "ire", "-ir/-ire"),
]
IDENTICAL_LABEL = "同形词 identical"
FAUX_AMI_LABEL = "假朋友 faux-ami"
PATTERN_LABELS = ({p[2] for p in FR_EN_PATTERNS} | {IDENTICAL_LABEL, FAUX_AMI_LABEL})
IT_PATTERN_LABELS = {p[2] for p in FR_IT_PATTERNS} | {IDENTICAL_LABEL}


def classify(word_a, word_b, table):
    """Return a pattern label when a regular suffix correspondence holds."""
    a, b = word_a.lower(), word_b.lower()
    if strip_accents(a) == strip_accents(b):
        return IDENTICAL_LABEL
    for sa, sb, label in table:
        if a.endswith(sa) and b.endswith(sb):
            stem_a = strip_accents(a[:-len(sa)]) if sa else strip_accents(a)
            stem_b = strip_accents(b[:-len(sb)]) if sb else strip_accents(b)
            if not stem_a or not stem_b:
                continue
            if sa and not sb and stem_a != stem_b:
                continue        # the "silent final e" rule must be exact
            d = edit_distance(stem_a, stem_b)
            if d / max(len(stem_a), len(stem_b)) <= 0.34:
                return label
    return None


def common_prefix_len(a, b):
    """Accent-insensitive shared initial substring length.

    Real cognates almost always keep the onset intact (nation/nation,
    chambre/chamber, liberte/liberty).  Accidental look-alikes produced by pure
    edit distance do not (valise/case, pote/mate, bouge/bulge), so this is used
    as a cheap etymological sanity check.
    """
    a, b = strip_accents(a.lower()), strip_accents(b.lower())
    n = 0
    for ca, cb in zip(a, b):
        if ca != cb:
            break
        n += 1
    return n


def base_similarity(distance, maxlen):
    """Same curve as scripts/cognate_extractor.js (the Italian reference)."""
    ratio = distance / maxlen if maxlen else 0
    if ratio <= 0.1:
        return 100
    if ratio <= 0.2:
        return 90 - round(ratio * 10)
    if ratio <= 0.3:
        return 80 - round(ratio * 10)
    if ratio <= 0.5:
        return 60 - round(ratio * 20)
    return max(30, 50 - round(ratio * 50))


def similarity(a, b, table):
    d = edit_distance(a, b)
    maxlen = max(len(a), len(b))
    score = base_similarity(d, maxlen)
    pattern = classify(a, b, table)
    if pattern and pattern != IDENTICAL_LABEL:
        score += 20
    if abs(len(a) - len(b)) <= 2:
        score += 10
    return min(100, int(score)), pattern


PLACEHOLDER_RE = re.compile(r"^(\?+|n/?a|todo|tbd|-+|\(n\)|null|none)$", re.I)
BAD_CHARS_RE = re.compile("[�Ãâƒ]")


def is_bad_gloss(text, headword=""):
    t = (text or "").strip()
    if not t or PLACEHOLDER_RE.match(t):
        return True
    if BAD_CHARS_RE.search(t):
        return True
    if headword and strip_accents(t) == strip_accents(headword):
        return True
    parts = [p for p in re.split(r"[;,；，]", t) if p.strip()]
    if len(parts) >= 3 and len({strip_accents(p.strip()) for p in parts}) == 1:
        return True
    return False


def load_js_array(path, const_name):
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    m = re.search(re.escape(const_name) + r"\s*=\s*(\[[\s\S]*?\n\]);", text)
    if not m:
        raise SystemExit("cannot parse %s from %s" % (const_name, path))
    payload = re.sub(r",(\s*[\]}])", r"\1", m.group(1))   # tolerate trailing commas
    return json.loads(payload)


# v1 part of speech -> the ECDICT marker split_ecdict() recognises.
EN_POS_MARK = {"verb": "v", "noun": "n", "adjective": "adj", "adverb": "adv",
               "preposition": "prep", "conjunction": "conj", "pronoun": "pron",
               "article": "art", "interjection": "int", "numeral": "num",
               "abbreviation": "abbr"}


def load_english_vocab():
    """data/vocab/en.js -> {headword: {"english", "meaning"}}, first entry wins.

    `meaning` is the ECDICT-style "n.书v.登记" string chinese_for() and
    ecdict_sense_units() split on POS markers: v1 moved the markers into
    `pos` / `posAll` and joins the per-POS senses of `zh` with "；", so they are
    re-attached here whenever the sense count matches the POS list.
    """
    out = {}
    for e in vocab_schema.read_vocab("en")["entries"]:
        key = (e.get("word") or "").lower()
        if not key or key in out:
            continue
        zh = e.get("zh") or ""
        pos_all = e.get("posAll") or ([e["pos"]] if e.get("pos") else [])
        senses = zh.split("；") if len(pos_all) > 1 else [zh]
        if pos_all and len(senses) == len(pos_all):
            zh = "".join("%s.%s" % (EN_POS_MARK[p], g) if p in EN_POS_MARK else g
                         for p, g in zip(pos_all, senses))
        out[key] = {"english": e["word"], "meaning": zh}
    return out


# data/vocab/fr.js merges three layers; `src` (-> meta.sources) and
# `levelSource` tell them apart.  The first layer to supply a word owns its
# `zh`, `en` and `src`, in this order: curriculum, textbook glossary, core.
FR_CURRICULUM_SOURCE_PREFIX = "课程整理"


def fr_layer(data, entry):
    """'curriculum' | 'glossary' | 'core' for one data/vocab/fr.js entry.

    Textbook entries carry levelSource 'textbook' unless the frequency band
    was easier (then 'freq-band'), so the source string decides for those:
    only the Lexique core layer has a non-textbook source.
    """
    src = vocab_schema.source_of(data, entry)
    if src.startswith(FR_CURRICULUM_SOURCE_PREFIX):
        return "curriculum"
    if entry.get("levelSource") == "textbook" or "总词汇表" in src:
        return "glossary"
    return "core"


def load_kaikki(path):
    entries = defaultdict(list)
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            e = json.loads(line)
            entries[e["w"]].append(e)
    return entries


GLOSS_STRIP_RE = re.compile(r"^\([^)]*\)\s*")
POS_MAP = {"NOM": "n.", "ADJ": "adj.", "VER": "v.", "ADV": "adv."}

# ECDICT packs every sense of a word into one string with inline POS markers
# ("n.火箭v.飞速上升", "v.放,置; n.一套,一副; adj.固定的").  Splitting on the
# markers lets us (a) drop the "v." artefacts and (b) pick the sense whose part
# of speech matches the French headword, so noun `set` -> 一套 and not 放.
POS_MARKER_RE = re.compile(r"(?<![a-zA-Z])(n|vt|vi|v|adj|adv|ad|num|prep|conj|pron|art|int|abbr|a)\.\s*")
WANT_MARKERS = {"NOM": {"n"}, "VER": {"v", "vt", "vi"}, "ADJ": {"adj", "a"}, "ADV": {"adv", "ad"}}
BRACKET_RE = re.compile(r"^[\[(（【][^\])）】]*[\])）】]\s*")

# ECDICT 把限定说明写在括号里，而括号里照样有逗号（"(光,热等的)发射,射出"）。
# 按逗号硬切会切出「(光」这种括号不配对的残句，而「纯中日韩字符」这类校验
# 查不出来 —— 残句里一个汉字都不缺。所以：切义项要跳过括号内部的分隔符，
# 切完再逐条查括号配对，不配对的一律不用。
BRACKET_PAIRS = {"(": ")", "（": "）", "[": "]", "【": "】",
                 "《": "》", "〈": "〉", "〔": "〕", "{": "}"}
BRACKET_CLOSERS = {v: k for k, v in BRACKET_PAIRS.items()}
SENSE_SEPARATORS = "；;，,、"


def brackets_balanced(text):
    """括号是否成对且嵌套正确（残句检测的唯一判据）。"""
    stack = []
    for ch in text or "":
        if ch in BRACKET_PAIRS:
            stack.append(BRACKET_PAIRS[ch])
        elif ch in BRACKET_CLOSERS:
            if not stack or stack.pop() != ch:
                return False
    return not stack


def split_senses(text, seps=SENSE_SEPARATORS):
    """按义项分隔符切分，但括号深度 > 0 时的分隔符不算数。"""
    parts, buf, depth = [], [], 0
    for ch in text or "":
        if ch in BRACKET_PAIRS:
            depth += 1
        elif ch in BRACKET_CLOSERS and depth:
            depth -= 1
        if depth == 0 and ch in seps:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
    parts.append("".join(buf))
    return [p for p in parts if p.strip()]


def split_ecdict(meaning):
    """-> [(pos_marker, text), ...] in source order."""
    marks = list(POS_MARKER_RE.finditer(meaning))
    if not marks:
        return [("", meaning)]
    segs = []
    if marks[0].start() > 0:
        segs.append(("", meaning[:marks[0].start()]))
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(meaning)
        segs.append((m.group(1).lower(), meaning[m.end():end]))
    return segs


def first_clean_sense(text):
    # ECDICT register/domain markers first ("[数,理]常数" must not be split on
    # the comma inside the bracket), then take the leading sense.
    text = re.sub(r"[<《][^>》]*[>》]", "", text or "")
    text = re.sub(r"\[[^\]]*\]?", "", text)
    parts = split_senses(text)
    part = parts[0] if parts else ""
    part = BRACKET_RE.sub("", part).strip(" .;,:：")
    if not part or not CJK_RE.search(part):
        return ""
    if re.search(r"[a-zA-Z]", part):        # leftover POS artefact / latin noise
        return ""
    if not brackets_balanced(part):         # 括号残句（"(光"、"容器(箱"）
        return ""
    return part


def chinese_for(entry, cgram):
    """Pick the ECDICT sense that matches the French part of speech."""
    meaning = entry.get("meaning") or entry.get("chinese") or ""
    want = WANT_MARKERS.get(cgram, set())
    segs = split_ecdict(meaning)
    for group in ([s for s in segs if s[0] in want], [s for s in segs if s[0] not in want]):
        for _, text in group:
            got = first_clean_sense(text)
            if got:
                return got
    return ""


def english_candidates(kaikki_entries, cgram):
    """Pull single-word English glosses out of the Wiktionary senses."""
    want = {"NOM": "noun", "ADJ": "adj", "VER": "verb", "ADV": "adv"}.get(cgram)
    out = []
    for e in kaikki_entries:
        if want and e["p"] != want:
            continue
        for gloss in e["g"]:
            g = GLOSS_STRIP_RE.sub("", gloss).strip()
            g = re.split(r"[;,(]", g)[0].strip()
            if want == "verb" and g.lower().startswith("to "):
                g = g[3:].strip()
            g = re.sub(r"^(a|an|the)\s+", "", g, flags=re.I).strip()
            if not g or " " in g or not re.match(r"^[a-zA-Z-]{3,}$", g):
                continue
            gl = g.lower()
            if gl not in out:
                out.append(gl)
        if len(out) >= 6:
            break
    return out[:6]


# ===========================================================================
# 7b. 释义层：权威教材 > 手写表 > ECDICT 英语跳板（并给跳板加语义闸门）
# ===========================================================================
# 老管线是「先给法语词配一个拼写像的英语词，再把那个英语词的 ECDICT 中文抄
# 过来」。法语词和英语 look-alike 语义不重合时中文就是错的（rue→懊悔、
# glace→玻璃、pièce→块），而且没有任何标注。
#
# 本仓库其实早就有权威的法→中层（教材词表），当初没接上。现在的优先级链：
#
#   1. 手写 faux-amis / 手写覆盖表（authored）
#   2. 课程整理词表  data/vocab/fr.js 里 src 为「课程整理…」的条目
#   3. 教材总词汇表  data/vocab/fr.js 里 levelSource=textbook / src 为总词汇表的条目
#   4. 词频核心词表  data/vocab/fr.js 其余条目（Lexique core），且必须通过 core 闸门
#   （三层的原始输入在 data/vocab/src/，由 build_french_vocabulary.py assemble
#    合并进 fr.js；分层靠 fr_layer()。）
#   5. ECDICT 英语跳板，且必须通过语义闸门
#   6. 都拿不到 → 删条目（宁可少给，不要给错）
#
# 关于第 4 层 core：它的文件头写着「中文经英文转写 ECDICT」，跟这里要修的是
# 同一类根因，所以不能算权威层。但两条跳板的**起点**不一样，质量差一个量级：
#
#   core   ：法语词自己的 Wiktionary 词条 → 那条词条的英文释义 → ECDICT
#   本表旧路：跟法语词**拼写最像**的英语词 → ECDICT
#
# 前者起点至少是这个法语词，错也只错在 ECDICT 挑哪个义项；后者起点就可能是
# 另一个词（valeur→valor→英勇、tempe→temple→庙），错得没边。所以 core 排在
# 跳板前面，但要过一道 core 闸门（见 GlossContext.core_gate）：它的中文必须能
# 被独立推出来的义项集合佐证，凭空冒出来的（cassette→矿体）不采用。
# core 仍然会犯「英语同形词」的错（joint→seal→海豹、lime→file→档案），逐条
# 抽查出来的那些走手写覆盖表 AUTHORED_GLOSSES。

ZH_SENSE_SPLIT_RE = re.compile(r"[;；,，、/]")
ZH_PAREN_RE = re.compile(r"[（(][^）)]*[）)]")
LATIN_RE = re.compile(r"[A-Za-z]")
MARKUP_RE = re.compile(r"[<>\[\]《》]")


# 教材词表把「把…看作」「与…合作」这类搭配义项的省略号丢了，只剩一个光杆
# 介词／助词单元（"把；看作"、"与；合作"）。它在卡片上就是个没有意义的残字，
# 跟括号残句是同一类毛病，只是括号配对查不出来 —— 单元长度为 1 且落在这张
# 虚词表里的，落盘前一律剔掉；剔空了就当没有中文（走下一层来源）。
BARE_PARTICLES = set("与和或使把被给对向为从在让同跟并的地得了着之而就都也再又将该欲以由到于")


def drop_bare_particles(text):
    units = [u.strip() for u in split_senses(text or "") if u.strip()]
    kept = [u for u in units if not (len(u) == 1 and u in BARE_PARTICLES)]
    return "；".join(kept) if len(kept) != len(units) else (text or "")


def usable_zh(text, headword=""):
    """能不能直接进 `chinese` 字段（跟 validate_french_extras.js 的规则对齐）。"""
    t = drop_bare_particles((text or "").strip()).strip()
    if not t or is_bad_gloss(t, headword):
        return ""
    if not CJK_RE.search(t) or LATIN_RE.search(t) or MARKUP_RE.search(t):
        return ""
    if not brackets_balanced(t):            # 括号残句一律不进 `chinese`
        return ""
    return t


def zh_units(text):
    return [u.strip() for u in ZH_SENSE_SPLIT_RE.split(ZH_PAREN_RE.sub("", text or "")) if u.strip()]


# core 的中文自带两类噪音：它自己的消歧后缀「（阳性名词）」和 ECDICT 的语域
# 标记「〈非正〉」「(非正式)」。同源词卡片另有 partOfSpeech / gender 两列，
# 这些后缀是重复信息，进卡片之前去掉。
CORE_POS_TAIL_RE = re.compile(
    r"[（(](?:阳性|阴性)?(?:名词|动词|形容词|副词|代词|介词|连词|数词|感叹词|冠词)[）)]\s*$")
CORE_MARKUP_RE = re.compile(r"[〈《<][^〉》>]*[〉》>]")
CORE_REGISTER_RE = re.compile(r"[（(](?:非正式|非正|口语|口|俚语|俚|书面|书)[）)]")


def clean_core_zh(text):
    t = CORE_MARKUP_RE.sub("", text or "")
    t = CORE_REGISTER_RE.sub("", t)
    t = CORE_POS_TAIL_RE.sub("", t)
    units = [u.strip(" ；;，,、") for u in split_senses(t, "；;")]
    return "；".join(u for u in units if u)


ZH_STOP_CHARS = set("的地得了着之其一有为是不很多少不个")


def zh_share_sense(a, b):
    """两串中文释义是否至少共享一个义项。

    只做字符串包含会把同义不同词判成不共享（时刻/瞬间、出租车/出租汽车、
    公交车/公共汽车），而这一层的判定要用来删条目，宁可判松不判严：所以
    再加一条「义项之间共享实义汉字」。「猫/聊天」「街道/懊悔」「身体/军团」
    这类真的没交集的，仍然一个字都不共享。
    """
    ua, ub = zh_units(a), zh_units(b)
    for x in ua:
        for y in ub:
            if x == y or x in y or y in x:
                return True
            if (set(x) & set(y)) - ZH_STOP_CHARS:
                return True
    return False


def english_gloss_words(full_gloss):
    """把 Wiktionary 的法→英释义串拆成可查 ECDICT 的单词，主义项排在最前。"""
    out = []
    for i, seg in enumerate(str(full_gloss or "").split(";")):
        seg = re.sub(r"\([^)]*\)", "", seg)
        for part in seg.split(","):
            part = part.strip().lower()
            part = re.sub(r"^(to|a|an|the)\s+", "", part)
            part = re.sub(r"[^a-z\- ]", "", part).strip()
            if not part or " " in part or len(part) < 2:
                continue
            if part not in [w for w, _ in out]:
                out.append((part, i == 0))
    return out


class GlossContext(object):
    """释义层要用到的全部词典，全部来自仓库内文件（不联网）。"""

    AUTH_SRC = {
        "curriculum": "french-vocabulary.js（课程整理词表）",
        "glossary": "french-vocabulary-glossary.js（教材总词汇表）",
    }

    def __init__(self, root=None):
        self.auth_zh = {}
        self.auth_src = {}
        self.wiktionary_en = {}
        self.core_zh = {}
        data = vocab_schema.read_vocab("fr")
        # 课程词表优先级更高：先收教材总词汇表，再让课程词表覆盖。
        rank = {"glossary": 0, "curriculum": 1}
        entries = [(fr_layer(data, e), e) for e in data["entries"]]
        for layer, w in sorted(entries, key=lambda t: rank.get(t[0], -1)):
            k = (w.get("word") or "").lower()
            if not k:
                continue
            if layer == "core":
                self.wiktionary_en.setdefault(k, w.get("en") or "")
                self.core_zh.setdefault(k, w.get("zh") or "")
                continue
            self.auth_zh[k] = w.get("zh") or ""
            self.auth_src[k] = self.AUTH_SRC[layer]
            if w.get("en"):
                self.wiktionary_en[k] = w["en"]
        self.en_vocab = load_english_vocab()

    def pivot_zh(self, english, cgram):
        """英语词经 ECDICT 得到的中文首义（对**英语词**是可信的）。"""
        ev = self.en_vocab.get((english or "").lower())
        return chinese_for(ev, cgram) if ev else ""

    def english_senses(self, english, cgram):
        """英语词在 ECDICT 里的**全部**义项。闸门要看全集，不能只看被挑中的那一个：
        information 的首义被挑成「通知」，但它同样收了「信息」。"""
        ev = self.en_vocab.get((english or "").lower())
        return ecdict_sense_units(ev, cgram) if ev else []

    def english_is_primary_gloss(self, french, english):
        """英语词是不是法语词**主义项**里的英文释义。

        Wiktionary 的法→英释义按义项排序，第一段就是主义项：rue 是
        "street, road"（"rue" 那个植物义排在后面），chat 是 "cat (feline)"。
        所以这一条能干净地把「法英同形但主义项不同」挑出来。
        """
        full = self.wiktionary_en.get((french or "").lower())
        if not full:
            return None
        primary = str(full).split(";")[0].lower()
        return re.search(r"\b%s\b" % re.escape((english or "").lower()), primary) is not None

    def core_gate(self, french, core_zh, english, cgram):
        """core 闸门：core 的中文必须有旁证才能采用。

        core 的中文也是英语跳板的产物，不能白纸黑字照抄。旁证有两路，沾上
        任意一路即通过：
          * 法语词自己的义项锚（它的 Wiktionary 法→英释义逐个过 ECDICT）；
          * 本行英语 look-alike 的**全部** ECDICT 义项。
        两路都不沾，说明这条中文在仓库里找不到第二个来源支持（cassette→
        「矿体」就是这样冒出来的），不采用，退回跳板。
        """
        for pool in (self.anchor_senses(french, cgram), self.english_senses(english, cgram)):
            if pool and zh_share_sense(core_zh, "；".join(pool)):
                return True
        return False

    def anchor_senses(self, french, cgram):
        """法语词自己的义项锚：把它的 Wiktionary 法→英释义逐个过 ECDICT。"""
        full = self.wiktionary_en.get((french or "").lower())
        if not full:
            return []
        out = []
        for word, _primary in english_gloss_words(full):
            out.extend(self.english_senses(word, cgram))
        return out


CGRAM_FROM_POS = {"n.m": "NOM", "n.f": "NOM", "v.": "VER", "adj.": "ADJ", "adv.": "ADV"}


def ecdict_sense_units(entry, cgram):
    """ECDICT 的 meaning 串 -> 干净的中文义项列表（丢掉词性标记和词典标注）。"""
    if not entry:
        return []
    meaning = entry.get("meaning") or entry.get("chinese") or ""
    out = []
    for _marker, text in split_ecdict(meaning):
        text = re.sub(r"[<《][^>》]*[>》]", "", text or "")
        text = re.sub(r"\[[^\]]*\]?", "", text)
        for part in split_senses(text):
            part = BRACKET_RE.sub("", part).strip(" .;,:：")
            if not part or not CJK_RE.search(part) or re.search(r"[a-zA-Z]", part):
                continue
            if not brackets_balanced(part):
                continue
            out.append(part)
    return out


def semantic_gate(french, english, cgram, trusted_zh, ctx):
    """英语 look-alike 的义，跟法语词自己的义，是否至少共享一个义项。

    返回 'pass' / 'fail' / 'unknown'。'unknown' = 手上没有能裁决的材料，
    既不算证据也不算反证。

    判定结果会用来删条目，所以取「两路都不通才算 fail」的保守口径：
      * 英文侧：英语词是不是法语词主义项的英文释义（moment/moment、
        hôtel/hotel、taxi/taxi 靠这一条留住）；
      * 中文侧：有权威中文就拿它跟英语词的**全部** ECDICT 义项比
        （information 的首义被挑成「通知」，但它同样收了「信息」）；
        没有权威中文，就用法语词自己的英文释义过一遍 ECDICT 当锚。
    """
    if ctx.english_is_primary_gloss(french, english):
        return "pass"
    en_senses = ctx.english_senses(english, cgram)
    if not en_senses:
        return "unknown"
    if trusted_zh:
        return "pass" if zh_share_sense(trusted_zh, "；".join(en_senses)) else "fail"
    anchor = ctx.anchor_senses(french, cgram)
    if not anchor:
        return "unknown"
    pivot = ctx.pivot_zh(english, cgram)
    if not pivot:
        return "unknown"
    return "pass" if zh_share_sense(pivot, "；".join(anchor)) else "fail"


def resolve_chinese(row, ctx):
    """按优先级链定出 (中文, chineseSource, 闸门结论)；中文为空表示这条要删。"""
    french = row["french"]
    key = french.lower()
    cgram = CGRAM_FROM_POS.get(row.get("partOfSpeech") or "", "")

    trusted = usable_zh(AUTHORED_GLOSSES.get(key, ""), french)
    source = "authored（手写覆盖）"
    if not trusted:
        trusted = usable_zh(ctx.auth_zh.get(key, ""), french)
        source = ctx.auth_src.get(key, "")
    gate = semantic_gate(french, row["english"], cgram, trusted, ctx)
    if trusted:
        return trusted, source, gate

    # 第 4 层：词频核心词表。起点是法语词自己的 Wiktionary 词条，比「拼写最像
    # 的英语词」这条跳板可靠一个量级，但仍要过 core 闸门。
    core = usable_zh(clean_core_zh(ctx.core_zh.get(key, "")), french)
    if core and ctx.core_gate(french, core, row["english"], cgram):
        gate = semantic_gate(french, row["english"], cgram, core, ctx)
        return core, "french-vocabulary-core.js（词频核心词表）", gate

    if gate == "fail":
        return "", "", gate       # 跳板中文可疑，又没有权威中文兜底 -> 删

    pivot = usable_zh(ctx.pivot_zh(row["english"], cgram), french)
    if pivot:
        suffix = "（语义闸门通过）" if gate == "pass" else "（闸门无法裁决）"
        return pivot, "english-vocabulary.js (ECDICT) via EN pivot" + suffix, gate
    return "", "", gate


def refine_pattern(row):
    """后缀组自动校验：法语词尾 + 英语词尾 + 去重音词干编辑距离 <= 2。

    croisière/cruiser、communier/communicate、pochette/pocket 这种「后缀对得上、
    词根其实是另一个词」的错配，先由手写 faux-amis 表接走；这里兜住剩下的。
    不满足的踢回 Other（patternType=null）并写明原因。
    """
    pattern = classify(row["french"], row["english"], FR_EN_PATTERNS)
    if not pattern or pattern in (IDENTICAL_LABEL, FAUX_AMI_LABEL):
        return pattern, None
    fr, en = row["french"].lower(), row["english"].lower()
    for sa, sb, label in FR_EN_PATTERNS:
        if label != pattern:
            continue
        if not fr.endswith(sa):
            return None, "后缀组校验未通过：法语词不以 -%s 结尾（待复核）" % sa
        if sb and not en.endswith(sb):
            return None, "后缀组校验未通过：英语词不以 -%s 结尾（待复核）" % sb
        stem_a = strip_accents(fr[:-len(sa)] if sa else fr)
        stem_b = strip_accents(en[:-len(sb)] if sb else en)
        d = edit_distance(stem_a, stem_b)
        if d > 2:
            return None, "后缀组校验未通过：词干 %s / %s 编辑距离 %d > 2（待复核）" % (stem_a, stem_b, d)
        return pattern, None
    return pattern, None


def apply_gloss_layer(rows, ctx, stats):
    """就地重算每一行的中文 / 来源 / 后缀组标签，并删掉给不出可靠中文的行。

    只依赖 (french, english, partOfSpeech) 和仓库内词典，不读自己写过的字段，
    所以重复跑结果一样 —— 「整表重建」和「只重跑释义层」两条路径同解。
    """
    for key in sorted(rows):
        row = rows[key]
        if row.get("falseFriend"):
            continue                       # 手写 faux-amis 行整行都是手写的
        if row["french"].lower() in DROP_COGNATES:
            stats["dropped_bad_pairing"] += 1
            del rows[key]
            continue
        zh, src, gate = resolve_chinese(row, ctx)
        if not zh:
            stats["dropped_no_trusted_chinese"] += 1
            del rows[key]
            continue
        if zh != row["chinese"]:
            stats["chinese_rewritten"] += 1
        row["chinese"] = zh
        row["chineseSource"] = src
        row["semanticGate"] = gate
        stats["source_" + src.split("（")[0].strip()] += 1
        pattern, note = refine_pattern(row)
        if pattern != row.get("patternType"):
            stats["pattern_refined"] += 1
        row["patternType"] = pattern
        if pattern is None:
            row["patternNote"] = note or row.get("patternNote") or "无规则后缀对应（仅词形接近）"
        else:
            row.pop("patternNote", None)
        # 同形词档的语义闸门：法语词的真实义与英语同形词的义必须共享义项。
        # 闸门没过、连权威中文都没有的行，在 resolve_chinese 里已经被判空删掉了；
        # 能走到这里的都拿着教材/手写中文，释义本身可信，留着（真正会骗人的
        # siège / canon / plateau / lot 这类已经被手写 faux-amis 表接走）。
        if pattern == IDENTICAL_LABEL and gate == "fail":
            stats["identical_gate_fail_kept"] += 1

    # 释义换掉之后可能出现新的「重音变体 + 同一个释义」重卡
    dedup_by_shape(rows, stats, "dropped_shape_duplicate")
    return rows


def dedup_by_shape(rows, stats, counter_key):
    """"suicide" 和 "suicidé" 是两个词，但释义也一样时就是同一张卡片两遍。"""
    by_shape = {}
    for key in sorted(rows, key=lambda k: (len(k), rows[k]["rank"], k)):
        r = rows[key]
        shape = (strip_accents(r["french"].lower()), r["english"], r["chinese"])
        if shape in by_shape and not r.get("falseFriend"):
            stats[counter_key] += 1
            del rows[key]
            continue
        by_shape[shape] = key
    return rows


def add_faux_amis(rows, lex, kaikki, max_rank):
    """把手写 faux-amis 表写进 rows（同名的挖掘行一律被顶掉）。"""
    for french, english, zh, lookalike, warning in (
            FAUX_AMIS + FAUX_AMIS_2026 + [f[:5] for f in FAUX_AMIS_IT]):
        head = french.split()[0]
        rank = lex.rank.get(head) or lex.rank.get(french) or (max_rank + 1)
        score, _ = similarity(french, lookalike, FR_EN_PATTERNS)
        forced = FAUX_AMI_POS.get(french)
        cgram = (forced[0] if forced else None) or FAUX_AMI_CGRAM.get(french) or lex.cgram.get(head)
        pos = POS_MAP.get(cgram, "expr.")
        gender = (forced[1] if forced else None) or (lex.genre.get(head) if cgram == "NOM" else None)
        if cgram == "NOM" and not gender:      # Wiktionary fallback, as above
            for e in (kaikki or {}).get(head, []):
                if e["p"] == "noun" and ("masculine" in e["t"] or "feminine" in e["t"]):
                    gender = "m" if "masculine" in e["t"] else "f"
                    break
        if cgram == "NOM":
            if not gender:
                raise SystemExit("faux-ami noun without gender: %s" % french)
            pos = "n.m" if gender == "m" else "n.f"
        row = {
            "french": french,
            "english": english,
            "chinese": zh,
            "patternType": FAUX_AMI_LABEL,
            "similarityScore": score,
            "difficulty": "hard",
            "rank": rank,
            "partOfSpeech": pos,
            "similarityBasis": "lookalike",
            "falseFriend": True,
            "lookalike": lookalike,
            "warning": warning,
            "source": "authored faux-amis table",
            "chineseSource": "authored（手写 faux-amis 表）",
        }
        if gender:
            row["gender"] = gender
        old = rows.get(french)
        if old and "italian" in old:           # 保住已有的意语桥接
            for k in ("italian", "italianSimilarity", "italianPatternType"):
                if k in old:
                    row[k] = old[k]
        rows[french] = row
    return rows


def write_cognates(rows, out_path, stats):
    data = sorted(rows.values(), key=lambda r: (-r["similarityScore"], r["rank"], r["french"]))
    # 构建期硬检查：括号残句绝不允许落盘。「纯中日韩字符」查不出 "(光"、
    # "容器(箱" 这类被逗号切断的 ECDICT 说明，只有配对检查能查出来。
    broken = [(r["french"], r["chinese"]) for r in data if not brackets_balanced(r["chinese"])]
    if broken:
        raise SystemExit("括号残句（括号不配对的中文释义）：%s" % broken[:10])
    faux = sum(1 for r in data if r.get("falseFriend"))
    header = (
        "// French cognate data — French <-> English (with an Italian bridge) look-alikes.\n"
        "// Mirrors data/cognates.js exactly, with `french` replacing `italian`:\n"
        "//   {french, english, chinese, patternType, similarityScore, difficulty, rank}\n"
        "// Additive fields: partOfSpeech, gender, falseFriend, lookalike, warning,\n"
        "//   italian / italianSimilarity / italianPatternType, similarityBasis,\n"
        "//   patternNote (reason when patternType is null), source, chineseSource,\n"
        "//   semanticGate (pass|fail|unknown — 见下).\n"
        "// similarityBasis='english' -> similarityScore compares french vs english;\n"
        "// similarityBasis='lookalike' (faux amis) -> it compares french vs the trap word.\n"
        "//\n"
        "// 中文释义的优先级链（2026 修：不再无条件走英语跳板）：\n"
        "//   1. 手写 faux-amis 表 / 手写覆盖表 ....... chineseSource 以 authored 开头\n"
        "//   2. data/french-vocabulary.js（课程整理词表）\n"
        "//   3. data/french-vocabulary-glossary.js（教材总词汇表）\n"
        "//   4. ECDICT 英语跳板，且必须通过语义闸门（法语词的真实义与英语 look-alike\n"
        "//      的 ECDICT 义至少共享一个义项）；闸门不过又没有权威中文兜底的直接删\n"
        "//   5. 都拿不到可靠中文的条目直接删掉（宁可少给，不要给错）\n"
        "// Sources: Lexique 3.83 (CC BY-SA 4.0), Wiktionary/Wiktextract (CC BY-SA 3.0),\n"
        "//   ECDICT-derived data/english-vocabulary.js, hand-authored faux-amis table,\n"
        "//   in-repo French textbook glossaries (authoritative FR->ZH layer).\n"
        "// Rebuild: python3 scripts/build_french_extras.py            (整表重建，需要联网缓存)\n"
        "//          python3 scripts/build_french_extras.py --only cognate-glosses  (只重跑释义层)\n"
        "// Total entries: %d (faux amis: %d)\n" % (len(data), faux)
    )
    body = "const FRENCH_COGNATE_DATA = %s;\n\n" % json.dumps(data, ensure_ascii=False, indent=2)
    tail = ("if (typeof window !== 'undefined') { window.FRENCH_COGNATE_DATA = FRENCH_COGNATE_DATA; }\n"
            "if (typeof module !== 'undefined' && module.exports) { module.exports = FRENCH_COGNATE_DATA; }\n")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(header + "\n" + body + tail)
    log("cognates: %d entries (%d faux amis)" % (len(data), faux))
    log("  gloss layer: %s" % dict(sorted(stats.items())))
    npat = sum(1 for r in data if r["patternType"])
    log("  classified patternType: %d / %d  (italian bridge: %d)"
        % (npat, len(data), sum(1 for r in data if r.get("italian"))))
    return data


class _RowLexique(object):
    """只重跑释义层时没有 Lexique 缓存；已有数据行里就带着 rank/词性/阴阳性。"""

    def __init__(self, rows):
        self.rank = {}
        self.cgram = {}
        self.genre = {}
        for key, r in rows.items():
            self.rank[key] = r["rank"]
            cg = CGRAM_FROM_POS.get(r.get("partOfSpeech") or "")
            if cg:
                self.cgram[key] = cg
            if r.get("gender"):
                self.genre[key] = r["gender"]


def refresh_cognate_glosses(out_path):
    """只重跑释义层：读现成的 data/french-cognates.js，重算中文/来源/后缀组。

    不需要 620MB 的下载缓存。释义层只依赖 (french, english, partOfSpeech) 和
    仓库内词典，所以重复跑字节一致，跟整表重建走的也是同一段代码。

    但它只是「现有行的不动点」，不等于整表重建的结果：它不重新挖行（缓存换成
    新的 kaikki 快照后多出来的词进不来），也不给手写 faux-amis 行补意大利语桥
    （那一步在 build_cognates 里）。所以发布前的最后一次落盘要走整表重建，
    --only cognate-glosses 只用来快速迭代释义层。
    """
    existing = load_js_array(out_path, "FRENCH_COGNATE_DATA")
    rows = {}
    for r in existing:
        rows[r["french"]] = dict(r)
    lex = _RowLexique(rows)
    max_rank = max(r["rank"] for r in rows.values())
    stats = Counter()
    add_faux_amis(rows, lex, {}, max_rank)
    dedup_by_shape(rows, stats, "dropped_accent_variant")
    ctx = GlossContext(ROOT)
    apply_gloss_layer(rows, ctx, stats)
    return write_cognates(rows, out_path, stats)


def build_cognates(cache, lex, out_path, max_rank=12000, min_score=50):
    log("loading glossaries ...")
    kaikki = load_kaikki(os.path.join(cache, "fr_kaikki_slim.jsonl"))
    en_vocab = load_english_vocab()
    it_by_en = {}
    for w in vocab_schema.read_vocab("it")["entries"]:
        key = (w.get("en") or "").split(",")[0].strip().lower()
        if key and key not in it_by_en:
            it_by_en[key] = {"italian": w["word"]}
    fr_zh = {}
    fr_data = vocab_schema.read_vocab("fr")
    for w in fr_data["entries"]:
        if fr_layer(fr_data, w) == "core":
            continue
        fw = (w.get("word") or "").lower()
        if fw and fw not in fr_zh and w.get("zh"):
            fr_zh[fw] = w["zh"]
    log("  kaikki=%d english=%d italian-by-en=%d fr-zh-glossary=%d"
        % (len(kaikki), len(en_vocab), len(it_by_en), len(fr_zh)))

    rejected = Counter()
    rows = {}
    for lemma, rank in sorted(lex.rank.items(), key=lambda kv: kv[1]):
        if rank > max_rank:
            break
        cgram = lex.cgram.get(lemma)
        if cgram not in POS_MAP:
            continue
        ents = kaikki.get(lemma)
        if not ents:
            rejected["no_wiktionary_entry"] += 1
            continue
        best = None
        for en in english_candidates(ents, cgram):
            score, pattern = similarity(lemma, en, FR_EN_PATTERNS)
            if best is None or score > best[0]:
                best = (score, en, pattern)
        if best is None:
            rejected["no_single_word_english_gloss"] += 1
            continue
        score, en, pattern = best
        if score < min_score:
            rejected["below_similarity_threshold"] += 1
            continue
        # Edit distance alone happily pairs valise/case and pote/mate.  Demand
        # actual cognate evidence: a regular suffix correspondence, or a shared
        # onset of >= 3 characters.
        if pattern is None and common_prefix_len(lemma, en) < 3:
            rejected["no_cognate_evidence"] += 1
            continue
        # The card shows french + english + chinese together, so the Chinese has
        # to gloss the *English* sense we picked (fr `glace` -> en `glass` must
        # not be captioned 冰).  Pivot first, French glossary only as a fallback.
        zh = ""
        zh_source = "english-vocabulary.js (ECDICT) via EN pivot"
        ev = en_vocab.get(en)
        if ev:
            zh = chinese_for(ev, cgram)
        if not zh:
            zh = first_clean_sense(fr_zh.get(lemma) or "")
            zh_source = "french-vocabulary-glossary.js"
        if not zh or is_bad_gloss(zh, lemma) or not CJK_RE.search(zh):
            rejected["no_usable_chinese_gloss"] += 1
            continue
        # NB: no headword-repetition check here — an English gloss identical to the
        # French headword ("nation", "table") is exactly what a cognate is.
        if is_bad_gloss(en):
            rejected["bad_english_gloss"] += 1
            continue
        gender = lex.genre.get(lemma) if cgram == "NOM" else None
        pos = POS_MAP[cgram]
        if cgram == "NOM":
            if not gender:
                # Wiktionary fallback for gender
                for e in ents:
                    if e["p"] == "noun":
                        if "masculine" in e["t"]:
                            gender = "m"
                            break
                        if "feminine" in e["t"]:
                            gender = "f"
                            break
            if not gender:
                rejected["noun_without_gender"] += 1
                continue
            pos = "n.m" if gender == "m" else "n.f"
        row = {
            "french": lemma,
            "english": en,
            "chinese": zh,
            "patternType": pattern,
            "similarityScore": score,
            "difficulty": "easy" if score >= 80 else ("medium" if score >= 50 else "hard"),
            "rank": rank,
            # ---- additive fields ------------------------------------------
            "partOfSpeech": pos,
            "similarityBasis": "english",
            "falseFriend": False,
            "source": "Lexique 3.83 + Wiktionary(FR) + ECDICT",
            "chineseSource": zh_source,
        }
        if gender:
            row["gender"] = gender
        if pattern is None:
            row["patternNote"] = "无规则后缀对应（仅词形接近）"
        it = it_by_en.get(en)
        if it:
            it_score, it_pattern = similarity(lemma, it["italian"], FR_IT_PATTERNS)
            if it_score >= 65 and common_prefix_len(lemma, it["italian"]) >= 3:
                row["italian"] = it["italian"]
                row["italianSimilarity"] = it_score
                row["italianPatternType"] = it_pattern
        rows[lemma] = row

    # ---- faux amis ---------------------------------------------------------
    add_faux_amis(rows, lex, kaikki, max_rank)

    # "suicide" and "suicidé" are different words, but when they also share the
    # same English and Chinese gloss they are the same flash-card twice.
    stats = Counter()
    dedup_by_shape(rows, stats, "dropped_accent_variant")

    # ---- 释义层：权威教材 > 手写表 > 带语义闸门的 ECDICT 跳板 ----------------
    # 跟 --only cognate-glosses 走的是同一段代码，且只依赖仓库内词典，
    # 所以两条路径的输出一致。
    apply_gloss_layer(rows, GlossContext(ROOT), stats)

    log("  rejected: %s" % dict(rejected))
    return write_cognates(rows, out_path, stats)


# ===========================================================================
# main
# ===========================================================================
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=DEFAULT_CACHE)
    ap.add_argument("--offline", action="store_true")
    ap.add_argument("--only", choices=["collocations", "cognates", "cognate-glosses"])
    args = ap.parse_args()

    # 只重跑释义层：不碰 Lexique / kaikki 缓存，材料全在仓库里。
    if args.only == "cognate-glosses":
        refresh_cognate_glosses(os.path.join(ROOT, "data", "french-cognates.js"))
        return

    cache = ensure_sources(args.cache, args.offline,
                           need_kaikki=args.only != "collocations")
    if not HAVE_ZHCONV:
        log("WARNING: zhconv not installed — Traditional-Chinese sentences will be dropped")
    log("loading Lexique 3.83 ...")
    lex = Lexique(os.path.join(cache, "lex", "Lexique383.tsv"))
    log("  %d verb forms, %d ranked lemmas" % (len(lex.verb_form), len(lex.rank)))

    if args.only in (None, "collocations"):
        build_collocations(cache, lex, os.path.join(ROOT, "data", "french-collocations-data.js"))
    if args.only in (None, "cognates"):
        build_cognates(cache, lex, os.path.join(ROOT, "data", "french-cognates.js"))


if __name__ == "__main__":
    main()
