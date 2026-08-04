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
  * data/english-vocabulary.js (in repo, ECDICT-derived EN->ZH glosses)
  * vocabulary.js (in repo, Italian headwords — used for the FR<->IT cognate layer)
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
    ("s'approvisionner", "de", "s'approvisionner de qqch", "储备某物"),
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

# Lexique's dominant reading is not always the one the faux-ami trap lives in
# ("nouvelle" is far more frequent as an adjective, but the trap is the noun).
FAUX_AMI_CGRAM = {
    "nouvelle": "NOM",
}


# ===========================================================================
# helpers
# ===========================================================================
def log(msg):
    sys.stderr.write(msg + "\n")
    sys.stderr.flush()


def ensure_sources(cache, offline=False):
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
    if not os.path.exists(kaikki) or os.path.getsize(kaikki) < 1000:
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

    curated_by_pair = defaultdict(list)
    for verb, prep, frame, zh in CURATED:
        curated_by_pair[(verb, prep)].append((frame, zh))

    all_pairs = set(curated_by_pair) | set(pair_count)
    # The contrast drill prompts with the Chinese half and asks for the
    # preposition, so one verb must never carry the same Chinese gloss under two
    # different prepositions — that question would have two correct answers.
    zh_by_verb = defaultdict(set)
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
            _, zh_part = js_extract(text)
            if zh_part in zh_by_verb[verb]:
                stats["dup"] += 1
                continue
            zh_by_verb[verb].add(zh_part)
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
    part = re.split(r"[;,；，、]", text)[0]
    part = BRACKET_RE.sub("", part).strip(" .;,:：")
    if not part or not CJK_RE.search(part):
        return ""
    if re.search(r"[a-zA-Z]", part):        # leftover POS artefact / latin noise
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


def build_cognates(cache, lex, out_path, max_rank=12000, min_score=50):
    log("loading glossaries ...")
    kaikki = load_kaikki(os.path.join(cache, "fr_kaikki_slim.jsonl"))
    en_vocab = {}
    for w in load_js_array(os.path.join(ROOT, "data", "english-vocabulary.js"), "ENGLISH_VOCABULARY_DATA"):
        key = (w.get("english") or "").lower()
        if key and key not in en_vocab:
            en_vocab[key] = w
    it_by_en = {}
    for w in load_js_array(os.path.join(ROOT, "vocabulary.js"), "VOCABULARY_DATA"):
        key = (w.get("english") or "").split(",")[0].strip().lower()
        if key and key not in it_by_en:
            it_by_en[key] = w
    fr_zh = {}
    gloss_path = os.path.join(ROOT, "data", "french-vocabulary-glossary.js")
    if os.path.exists(gloss_path):
        for w in load_js_array(gloss_path, "FRENCH_GLOSSARY_VOCABULARY_DATA"):
            fw = (w.get("french") or "").lower()
            if fw and fw not in fr_zh and w.get("chinese"):
                fr_zh[fw] = w["chinese"]
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
    faux_added = 0
    for french, english, zh, lookalike, warning in FAUX_AMIS + [f[:5] for f in FAUX_AMIS_IT]:
        head = french.split()[0]
        rank = lex.rank.get(head) or lex.rank.get(french) or (max_rank + 1)
        score, _ = similarity(french, lookalike, FR_EN_PATTERNS)
        cgram = FAUX_AMI_CGRAM.get(french) or lex.cgram.get(head)
        pos = POS_MAP.get(cgram, "expr.")
        gender = lex.genre.get(head) if cgram == "NOM" else None
        if cgram == "NOM" and not gender:      # Wiktionary fallback, as above
            for e in kaikki.get(head, []):
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
            "chineseSource": "authored",
        }
        if gender:
            row["gender"] = gender
        rows[french] = row      # faux-ami entry always wins over the mined one

    # "suicide" and "suicidé" are different words, but when they also share the
    # same English and Chinese gloss they are the same flash-card twice.
    by_shape = {}
    for key in sorted(rows, key=lambda k: (len(k), rows[k]["rank"])):
        r = rows[key]
        shape = (strip_accents(r["french"].lower()), r["english"], r["chinese"])
        if shape in by_shape and not r.get("falseFriend"):
            rejected["accent_variant_duplicate"] += 1
            del rows[key]
            continue
        by_shape[shape] = key

    faux_added = sum(1 for r in rows.values() if r.get("falseFriend"))
    data = sorted(rows.values(), key=lambda r: (-r["similarityScore"], r["rank"]))
    header = (
        "// French cognate data — French <-> English (with an Italian bridge) look-alikes.\n"
        "// Mirrors data/cognates.js exactly, with `french` replacing `italian`:\n"
        "//   {french, english, chinese, patternType, similarityScore, difficulty, rank}\n"
        "// Additive fields: partOfSpeech, gender, falseFriend, lookalike, warning,\n"
        "//   italian / italianSimilarity / italianPatternType, similarityBasis,\n"
        "//   patternNote (reason when patternType is null), source, chineseSource.\n"
        "// similarityBasis='english' -> similarityScore compares french vs english;\n"
        "// similarityBasis='lookalike' (faux amis) -> it compares french vs the trap word.\n"
        "// Sources: Lexique 3.83 (CC BY-SA 4.0), Wiktionary/Wiktextract (CC BY-SA 3.0),\n"
        "//   ECDICT-derived data/english-vocabulary.js, hand-authored faux-amis table.\n"
        "// Rebuild: python3 scripts/build_french_extras.py\n"
        "// Total entries: %d (faux amis: %d)\n" % (len(data), faux_added)
    )
    body = "const FRENCH_COGNATE_DATA = %s;\n\n" % json.dumps(data, ensure_ascii=False, indent=2)
    tail = ("if (typeof window !== 'undefined') { window.FRENCH_COGNATE_DATA = FRENCH_COGNATE_DATA; }\n"
            "if (typeof module !== 'undefined' && module.exports) { module.exports = FRENCH_COGNATE_DATA; }\n")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(header + "\n" + body + tail)
    log("cognates: %d entries (%d faux amis)" % (len(data), faux_added))
    log("  rejected: %s" % dict(rejected))
    npat = sum(1 for r in data if r["patternType"])
    log("  classified patternType: %d / %d  (italian bridge: %d)"
        % (npat, len(data), sum(1 for r in data if r.get("italian"))))
    return data


# ===========================================================================
# main
# ===========================================================================
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=DEFAULT_CACHE)
    ap.add_argument("--offline", action="store_true")
    ap.add_argument("--only", choices=["collocations", "cognates"])
    args = ap.parse_args()

    cache = ensure_sources(args.cache, args.offline)
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
