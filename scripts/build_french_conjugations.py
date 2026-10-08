#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build data/fr-conjugations.js — a full French conjugation dataset.

Every inflected form in the output is either copied from an openly licensed
corpus or computed by the rule engine in this file.  No paradigm table is
hand-written, and nothing is derived from a copyleft-incompatible source.

  * English Wiktionary via Wiktextract / kaikki.org (CC BY-SA 4.0 + GFDL) —
    the per-verb conjugation table (`source: "conjugation"` forms) supplies
    every SIMPLE tense, the present and past participle, the English gloss,
    the auxiliary each verb takes, and the "French terms with aspirated h"
    category behind the `aspirateH` flag.  A cell Wiktionary spells "-" is a
    genuine hole in the paradigm and is preserved as such.
  * Lexique 3.83 (CC BY-SA 4.0, New Lexicon Project / lexique.org) — lemma
    frequencies (freqlemfilms2 = subtitle corpus, freqlemlivres = book corpus)
    give the corpus rank of every verb and decide which verb makes the cut;
    per-surface-form frequencies order the spelling alternatives (paie before
    paye); the `par:pas` rows with their genre/nombre columns supply the
    attested past-participle agreement forms (due, absoute, crue — none of
    which "add -e" would produce).
  * ECDICT 1.0.28 (skywind3000, free for any use) — English → Chinese pivot,
    used ONLY for verbs that are new to the dataset.  Chinese glosses of verbs
    that are already shipped are carried over verbatim from the previous
    build, because 322 of them were corrected by hand (see the
    "修正 881 条中文释义撞车与中转错译" commit) and a fresh pivot would undo that.

Written here, not taken from anywhere:
  * the compound tenses (auxiliary + past participle, with être-agreement and
    pronominal support) — Wiktionary only spells them out as "avoir + past
    participle", so they are assembled from the auxiliary's own paradigm;
  * the reflexive layer (pronoun placement, elision, imperative -toi/-nous/-vous);
  * `RegularEngine`, a rule conjugator for the three regular classes, used as a
    fallback for the handful of verbs Wiktionary has no entry for;
  * the paradigm classifier that computes `model` (verbs are grouped by the
    ending sequence left after stripping the stem they share with their own
    infinitive, and each class is named after its most frequent member).

Elision of the SUBJECT pronoun is deliberately NOT baked in: "ai" is stored under
the `je` key, and the app's conjugation engine renders "j'ai".  The `aspirateH`
flag tells that layer when elision must be suppressed (je hais, not j'hais).
Reflexive-pronoun elision ("m'appelle") IS part of the form itself and is stored.

Usage:
    python3 scripts/build_french_conjugations.py [--work /tmp/frconj] [--limit 1800]

Downloads expected in --work (see DOWNLOADS below for the exact URLs):
    Lexique383.tsv
    fr-verbs.jsonl        (kaikki.org French by-pos-verb dump)
    stardict.db           (ECDICT sqlite; only needed when new verbs appear)
"""

import argparse
import json
import os
import re
import sqlite3
import sys
import unicodedata
from collections import Counter, OrderedDict
from data_module import register_footer

DOWNLOADS = """
  https://kaikki.org/dictionary/French/pos-verb/kaikki.org-dictionary-French-by-pos-verb.jsonl
  http://www.lexique.org/databases/Lexique383/Lexique383.tsv
  https://github.com/skywind3000/ECDICT/releases/download/1.0.28/ecdict-sqlite-28.zip
"""

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(REPO, 'data', 'fr-conjugations.js')

PERSONS = ['je', 'tu', 'il_elle_on', 'nous', 'vous', 'ils_elles']

# The 20 tense/mood groups every non-defective verb must carry.
CANONICAL_TENSES = [
    'indicatif_present', 'indicatif_imparfait', 'indicatif_passe_simple',
    'indicatif_futur_simple', 'indicatif_passe_compose',
    'indicatif_plus_que_parfait', 'indicatif_passe_anterieur',
    'indicatif_futur_anterieur', 'conditionnel_present', 'conditionnel_passe',
    'subjonctif_present', 'subjonctif_imparfait', 'subjonctif_passe',
    'subjonctif_plus_que_parfait', 'imperatif_present', 'imperatif_passe',
    'participe_present', 'participe_passe', 'infinitif_present',
    'infinitif_passe',
]

# The seven simple tenses Wiktionary spells out cell by cell.
SIMPLE_TENSES = [
    'indicatif_present', 'indicatif_imparfait', 'indicatif_passe_simple',
    'indicatif_futur_simple', 'conditionnel_present', 'subjonctif_present',
    'subjonctif_imparfait',
]

TENSE_LABELS = {
    'indicatif_present': ('Indicatif', 'Présent'),
    'indicatif_imparfait': ('Indicatif', 'Imparfait'),
    'indicatif_passe_simple': ('Indicatif', 'Passé simple'),
    'indicatif_futur_simple': ('Indicatif', 'Futur simple'),
    'conditionnel_present': ('Conditionnel', 'Présent'),
    'subjonctif_present': ('Subjonctif', 'Présent'),
    'subjonctif_imparfait': ('Subjonctif', 'Imparfait'),
    'imperatif_present': ('Impératif', 'Présent'),
}

REFLEXIVE_PRONOUN = {
    'je': 'me', 'tu': 'te', 'il_elle_on': 'se',
    'nous': 'nous', 'vous': 'vous', 'ils_elles': 'se',
}
VOWEL_START = re.compile(r'^[aàâeéèêëiîïoôuùûüyh]', re.IGNORECASE)

SOURCE_LABEL = ('Wiktionary/Wiktextract via kaikki.org (CC BY-SA 4.0) + '
                'Lexique 3.83 (CC BY-SA 4.0) + compound tenses generated by '
                'scripts/build_french_conjugations.py')

# --------------------------------------------------------------------------
# Curated linguistic tables (small, closed classes — each one is verified in
# scripts/validate_french_conjugations.js against the gold set).
# --------------------------------------------------------------------------

# Verbs whose compound tenses take être even though Wiktionary marks them "ae"
# (avoir when transitive, être when intransitive).  These are the textbook
# DR MRS VANDERTRAMP movement verbs; the intransitive/être reading is the one
# taught first, so it is the one drilled.  `auxiliaryAlt` records the other.
ETRE_PREFERRED_FOR_DUAL = {
    'monter', 'remonter', 'descendre', 'redescendre', 'sortir', 'ressortir',
    'passer', 'repasser', 'rentrer', 'retourner', 'entrer', 'tomber', 'retomber',
    'partir', 'repartir', 'demeurer', 'apparaître', 'apparaitre', 'accourir',
    'monter', 'échoir', 'éclore', 'ressusciter', 'redevenir',
}

# Essentially- or commonly-pronominal verbs.  Each is conjugated from its base
# verb's paradigm with the reflexive pronoun and the être auxiliary.
PRONOMINAL_VERBS = [
    # (surface infinitive, base verb, english, chinese)
    ("s'appeler", 'appeler', 'to be called, to be named', '名叫；叫作'),
    ('se lever', 'lever', 'to get up, to stand up', '起床；起身'),
    ('se trouver', 'trouver', 'to be located, to find oneself', '位于；处于'),
    ('se rendre', 'rendre', 'to go to, to surrender', '前往；投降'),
    ('se mettre', 'mettre', 'to start, to place oneself', '开始；置身于'),
    ('se sentir', 'sentir', 'to feel', '感觉；觉得'),
    ('se souvenir', 'souvenir', 'to remember', '记得；回忆起'),
    ('se rappeler', 'rappeler', 'to recall, to remember', '想起；记得'),
    ('se demander', 'demander', 'to wonder', '自问；想知道'),
    ('se passer', 'passer', 'to happen, to take place', '发生；进行'),
    ('se produire', 'produire', 'to occur, to happen', '发生；出现'),
    ('se tourner', 'tourner', 'to turn (oneself)', '转身；转向'),
    ('se lancer', 'lancer', 'to launch oneself, to embark on', '投身；开始'),
    ('se coucher', 'coucher', 'to go to bed, to lie down', '睡觉；躺下'),
    ('se réveiller', 'réveiller', 'to wake up', '醒来；睡醒'),
    ("s'habiller", 'habiller', 'to get dressed', '穿衣服'),
    ('se laver', 'laver', 'to wash oneself', '洗澡；洗漱'),
    ('se dépêcher', 'dépêcher', 'to hurry up', '赶快；匆忙'),
    ('se promener', 'promener', 'to go for a walk', '散步；遛弯'),
    ('se reposer', 'reposer', 'to rest', '休息'),
    ('se tromper', 'tromper', 'to be mistaken', '弄错；搞错'),
    ('se marier', 'marier', 'to get married', '结婚'),
    ('se préparer', 'préparer', 'to get ready', '准备；做准备'),
    ("s'arrêter", 'arrêter', 'to stop (oneself)', '停下；停止'),
    ("s'approcher", 'approcher', 'to come closer', '靠近；走近'),
    ("s'occuper", 'occuper', 'to take care of, to deal with', '照料；负责'),
    ("s'intéresser", 'intéresser', 'to be interested in', '对…感兴趣'),
    ("s'inquiéter", 'inquiéter', 'to worry', '担心；着急'),
    ("s'ennuyer", 'ennuyer', 'to be bored', '感到无聊'),
    ("s'endormir", 'endormir', 'to fall asleep', '入睡；睡着'),
    ("s'installer", 'installer', 'to settle in, to move in', '安顿；住下'),
    ("s'exprimer", 'exprimer', 'to express oneself', '表达自己'),
    ("s'engager", 'engager', 'to commit oneself', '承诺；投身'),
    ("s'adresser", 'adresser', 'to address oneself to, to speak to', '向…讲话；找…'),
    ("s'excuser", 'excuser', 'to apologise', '道歉；抱歉'),
    ("s'asseoir", 'asseoir', 'to sit down', '坐下'),
    ('se taire', 'taire', 'to be quiet, to keep silent', '沉默；不作声'),
    ('se battre', 'battre', 'to fight', '打架；战斗'),
    ('se plaindre', 'plaindre', 'to complain', '抱怨；诉苦'),
    ('se moquer', 'moquer', 'to make fun of', '嘲笑；取笑'),
    ('se servir', 'servir', 'to use, to help oneself', '使用；自取'),
    ('se débrouiller', 'débrouiller', 'to manage, to cope', '设法应付；自己想办法'),
    ('se fâcher', 'fâcher', 'to get angry', '生气；发火'),
    ('se méfier', 'méfier', 'to be wary of, to distrust', '提防；不信任'),
    ("s'enfuir", 'enfuir', 'to flee, to run away', '逃走；逃跑'),
    ("s'évanouir", 'évanouir', 'to faint', '晕倒；昏厥'),
    # Essentially pronominal: Wiktionary's conjugation table for the bare lemma
    # itself bakes in the reflexive pronoun ("je m'efforce"), i.e. the source
    # treats the verb as existing only in the pronominal voice.
    ("s'efforcer", 'efforcer', 'to strive, to endeavour, to try hard', '努力；尽力'),
    ("s'envoler", 'envoler', 'to fly away, to take off', '起飞；飞走'),
    ("s'emparer", 'emparer', 'to seize, to take hold of', '夺取；抓住'),
    ("s'écrier", 'écrier', 'to cry out, to exclaim', '喊叫；惊呼'),
    ("s'évader", 'évader', 'to escape, to break out', '逃脱；越狱'),
    ("s'acharner", 'acharner', 'to persist relentlessly, to hound', '拼命；执着；穷追不舍'),
    ("s'obstiner", 'obstiner', 'to persist stubbornly', '固执；坚持不改'),
    ("s'épanouir", 'épanouir', 'to blossom, to flourish', '开花；绽放；充分发展'),
    ("s'abstenir", 'abstenir', 'to abstain, to refrain', '戒除；弃权；避免'),
    ("s'absenter", 'absenter', 'to be away, to absent oneself', '离开；缺席'),
    ("s'enquérir", 'enquérir', 'to inquire, to ask about', '打听；询问'),
    ("s'esclaffer", 'esclaffer', 'to burst out laughing', '哈哈大笑'),
    ("s'extasier", 'extasier', 'to be enraptured, to go into raptures over', '赞叹不已；心醉神迷'),
]

# Standard forms that the machine-readable conjugation table omits, added back
# one cell at a time with the reason.  This is not a paradigm table: nothing may
# go in here that the cited reference does not print as an alternative of that
# exact cell.
EXTRA_FORMS = {
    # fr.wiktionary "Conjugaison:français/pouvoir": «Ce verbe possède aussi une
    # conjugaison alternative à la première personne du singulier de
    # l'indicatif : je puis.»  It is the only possible form in the inversion
    # "puis-je ?", so a learner has to meet it.
    ('pouvoir', 'indicatif_present', 0): ['puis'],
}

# Verbs that exist only (or all but only) in the pronominal voice.  Shipping a
# bare "j'efforce" card would be teaching French that nobody writes, so the
# frequency pass skips these lemmas and they appear solely as the pronominal
# entry above -- with the same corpus rank, since Lexique lemmatises the
# pronominal occurrences onto the bare infinitive.
PRONOMINAL_ONLY = {
    'efforcer', 'envoler', 'emparer', 'écrier', 'évanouir', 'évader', 'acharner',
    'obstiner', 'épanouir', 'abstenir', 'absenter', 'enquérir', 'esclaffer',
    'extasier', 'enfuir', 'méfier', 'souvenir',
}

# Hand-checked Chinese glosses, used for verbs that are NEW to the dataset (a
# verb that already ships keeps the Chinese gloss it already has -- see
# load_previous_chinese).
MANUAL_CHINESE = {
    'être': '是；存在', 'avoir': '有；拥有', 'faire': '做；制作', 'aller': '去；前往',
    'dire': '说；告诉', 'pouvoir': '能够；可以', 'vouloir': '想要；愿意', 'voir': '看见；看到',
    'savoir': '知道；会', 'devoir': '应该；必须', 'venir': '来；来到', 'prendre': '拿；乘坐',
    'parler': '说话；谈论', 'suivre': '跟随；听从', 'falloir': '必须；需要', 'passer': '经过；度过',
    'croire': '相信；认为', 'aimer': '喜欢；爱', 'penser': '思考；认为', 'trouver': '找到；觉得',
    'regarder': '看；注视', 'laisser': '留下；让', 'donner': '给；给予', 'mettre': '放；穿上',
    'attendre': '等待', 'connaître': '认识；了解', 'arriver': '到达；发生', 'rester': '留下；停留',
    'demander': '询问；请求', 'partir': '离开；出发', 'entendre': '听见；听说', 'appeler': '叫；打电话',
    'comprendre': '理解；懂', 'travailler': '工作；学习', 'sortir': '出去；出来', 'tenir': '拿着；坚持',
    'chercher': '寻找；找', 'rendre': '归还；使变得', 'perdre': '失去；输', 'porter': '携带；穿',
    'montrer': '展示；指出', 'commencer': '开始', 'finir': '结束；完成', 'jouer': '玩；演奏',
    'lire': '阅读；读', 'écrire': '写；书写', 'vivre': '生活；活着', 'mourir': '死亡；去世',
    'naître': '出生；诞生', 'boire': '喝；饮', 'manger': '吃', 'dormir': '睡觉',
    'courir': '跑；奔跑', 'ouvrir': '打开；开启', 'offrir': '赠送；提供', 'recevoir': '收到；接待',
    'répondre': '回答；答复', 'entrer': '进入；进去', 'monter': '上升；登上', 'descendre': '下来；下降',
    'tomber': '掉落；跌倒', 'revenir': '回来；返回', 'devenir': '变成；成为', 'choisir': '选择',
    'payer': '支付；付款', 'acheter': '购买；买', 'vendre': '出售；卖', 'apprendre': '学习；得知',
    'oublier': '忘记', 'changer': '改变；更换', 'garder': '保存；看管', 'quitter': '离开；辞去',
    'marcher': '走路；运转', 'arrêter': '停止；逮捕', 'tuer': '杀死', 'jeter': '扔；抛',
    'servir': '服务；充当', 'valoir': '值；等于', 'plaire': '使高兴；讨人喜欢', 'suffire': '足够；满足',
    'conduire': '驾驶；引导', 'construire': '建造；构建', 'produire': '生产；产生', 'traduire': '翻译',
    'craindre': '害怕；担心', 'peindre': '画；涂', 'joindre': '连接；联系', 'résoudre': '解决；决心',
    'vaincre': '战胜；克服', 'coudre': '缝；缝合', 'moudre': '磨；碾', 'acquérir': '获得；取得',
    'cueillir': '采摘；采集', 'fuir': '逃跑；躲避', 'haïr': '憎恨；讨厌', 'rire': '笑',
    'battre': '打；击败', 'pleuvoir': '下雨', 'asseoir': '使坐下；安置', 'nettoyer': '打扫；清洁',
    'essayer': '尝试；试穿', 'envoyer': '发送；派遣', 'préférer': '更喜欢；偏爱', 'espérer': '希望；期望',
    'répéter': '重复；再说', 'emmener': '带走；带去', 'amener': '带来；引起', 'lever': '举起；抬起',
    'peser': '称重；有…重', 'semer': '播种；散布', 'céder': '让步；让出', 'régler': '调节；结算',
}

# Verbs whose Wiktionary entry carries no usable gloss (the page is only a
# form-of/etymology stub), or that Wiktionary has no entry for at all.
# Hand-written here rather than left empty -- the alternative is shipping the
# verb with no meaning, which we never do.
MANUAL_ENGLISH = {
    'médire': 'to speak ill of, to malign',
    'quérir': 'to fetch, to go and get (literary)',
    'gésir': 'to lie, to be lying down',
    'ouïr': 'to hear (archaic)',
    'trôner': 'to sit enthroned, to hold pride of place',
    'écoeurer': 'to sicken, to disgust',
    'férir': 'to strike (only in "sans coup férir")',
    'occire': 'to slay, to kill (archaic)',
    'ester': 'to appear in court, to litigate',
    'brumasser': 'to drizzle, to be misty',
    'ravoir': 'to get back, to have again',
    'sourdre': 'to well up, to spring forth',
    'saouler': 'to make drunk, to intoxicate',
    'soûler': 'to make drunk, to intoxicate',
    'manoeuvrer': 'to manoeuvre, to operate',
    'infiltrer': 'to infiltrate, to seep into',
    'river': 'to rivet, to clinch',
    'chaloir': 'to matter (only in "peu me chaut")',
    'seoir': 'to suit, to become (someone)',
    'échoir': 'to fall due, to devolve upon',
    'déchoir': 'to fall from grace, to decline',
    'oindre': 'to anoint',
    'amuïr': 'to fall silent, to become mute (of a sound)',
    'chauvir': 'to prick up the ears (of a horse or donkey)',
    'apparoir': 'to be evident (legal, in "il appert")',
    'forclore': 'to bar, to foreclose (legal)',
    'occlure': 'to occlude, to close off',
    'receper': 'to coppice, to cut back to the stump',
    'recéper': 'to coppice, to cut back to the stump',
}

MANUAL_ENGLISH_ZH = {
    'médire': '诽谤；说坏话', 'quérir': '寻找；去取', 'gésir': '躺；卧', 'ouïr': '听见',
    'trôner': '高踞；居首位', 'écoeurer': '使恶心；使反感', 'férir': '打击', 'occire': '杀死',
    'ester': '出庭；起诉', 'brumasser': '下毛毛雨；起薄雾', 'ravoir': '重新得到',
    'sourdre': '涌出；发源', 'saouler': '使喝醉', 'soûler': '使喝醉',
    'manoeuvrer': '操纵；调动', 'infiltrer': '渗透；渗入', 'river': '铆接；铆住',
    'chaloir': '关系；要紧', 'seoir': '适合；相称', 'échoir': '到期；轮到',
    'déchoir': '衰落；堕落', 'oindre': '涂油；敷圣油', 'amuïr': '（语音）脱落；不再发音',
    'chauvir': '竖起耳朵', 'apparoir': '（法律）显见', 'forclore': '（法律）失权；除斥',
    'occlure': '闭塞；封闭', 'receper': '平茬；截干', 'recéper': '平茬；截干',
}

# Impersonal verbs, i.e. verbs that only ever take "il".  Wiktionary already
# dashes the other five persons for the ones it covers (neiger, pleuvoir,
# falloir); this list is only consulted for verbs Wiktionary has no table for,
# where the rule engine would otherwise inflect them right through.
IMPERSONAL = {
    'brumasser': ('je', 'tu', 'nous', 'vous', 'ils_elles'),
}

MOJIBAKE = re.compile(r'[�]|Ã[\x80-\xbf]|â€')
CJK = re.compile(r'[一-鿿]')
PLACEHOLDER = re.compile(r'^(\?+|todo|n/?a|null|none|-+|\(n\))$', re.IGNORECASE)


# --------------------------------------------------------------------------
# Wiktionary (kaikki.org) extraction
# --------------------------------------------------------------------------

# A real French inflected form is one orthographic word written with the French
# alphabet.  Anything with a space, an apostrophe or a hyphen in Wiktionary's
# table is either a clitic-carrying variant of the same table ("m'appelle",
# "nous appelons", "fiche-t'en", "s'en faut") or the multiword compound-tense
# placeholder; both belong to a different row of the dataset than the plain
# paradigm.  Wiktextract also emits the pronunciation of every cell as if it
# were another form of it ("pø" beside "peux", "mɑ̃ʒ" beside "mange"), which is
# why the alphabet is spelled out letter by letter here instead of as a Latin-1
# range: "ø" and "ɥ" are IPA, never French orthography.
WORD_FORM = re.compile(r'^[a-zàâäçéèêëîïôöùûüÿœæ]+$', re.IGNORECASE)

# Leading reflexive clitic, for verbs whose only Wiktionary table is the
# pronominal one (souvenir, efforcer, abstenir ...).
REFLEXIVE_PREFIX = re.compile(r"^(?:m'|t'|s'|me |te |se |nous |vous )")
REFLEXIVE_SUFFIX = re.compile(r'-(?:toi|nous|vous)$')

TENSE_BY_TAGS = {
    ('indicative', 'present'): 'indicatif_present',
    ('imperfect', 'indicative'): 'indicatif_imparfait',
    ('historic', 'indicative', 'past'): 'indicatif_passe_simple',
    ('future', 'indicative'): 'indicatif_futur_simple',
    ('conditional',): 'conditionnel_present',
    ('present', 'subjunctive'): 'subjonctif_present',
    ('imperfect', 'subjunctive'): 'subjonctif_imparfait',
    ('imperative',): 'imperatif_present',
}
PERSON_BY_TAGS = {
    ('first-person', 'singular'): 0, ('second-person', 'singular'): 1,
    ('singular', 'third-person'): 2, ('first-person', 'plural'): 3,
    ('plural', 'second-person'): 4, ('plural', 'third-person'): 5,
}
NONFINITE_BY_TAGS = {
    ('gerund', 'participle', 'present'): 'participe_present',
    ('participle', 'past'): 'participe_passe',
}
ASPIRATED_H_CATEGORY = 'French terms with aspirated h'
CONJUGATION_CATEGORY = 'French verbs with conjugation '


def _add(bucket, key, value):
    lst = bucket.setdefault(key, [])
    if value not in lst:
        lst.append(value)


def load_kaikki(path, cache_path, refresh=False):
    """kaikki JSONL -> {headword: {glosses, aux, cats, slots, refl_slots}}.

    `slots` and `refl_slots` are keyed by (tense_key, person_index) for the
    finite tenses and by (tense_key, None) for the participles.  A Wiktionary
    cell spelled "-" is dropped, which is exactly right: it means the verb has
    no such form, and the caller reports the hole in `defective` / `gaps`.
    """
    if os.path.exists(cache_path) and not refresh:
        with open(cache_path, encoding='utf-8') as f:
            raw = json.load(f)
        return {w: {'glosses': r['glosses'], 'aux': r['aux'], 'cats': set(r['cats']),
                    'slots': {tuple(json.loads(k)): v for k, v in r['slots'].items()},
                    'refl_slots': {tuple(json.loads(k)): v for k, v in r['refl_slots'].items()}}
                for w, r in raw.items()}

    records = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            if '"pos": "verb"' not in line:
                continue
            try:
                d = json.loads(line)
            except ValueError:
                continue
            if d.get('lang_code') != 'fr' or d.get('pos') != 'verb':
                continue
            word = d.get('word')
            if not word:
                continue
            head_args = set()
            for h in (d.get('head_templates') or []):
                for v in (h.get('args') or {}).values():
                    head_args.add(str(v))
            if 'verb form' in head_args:
                continue

            rec = records.setdefault(word, {'glosses': [], 'aux': set(), 'cats': set(),
                                            'slots': {}, 'refl_slots': {}})
            for c in (d.get('categories') or []):
                name = c if isinstance(c, str) else c.get('name')
                if name:
                    rec['cats'].add(name)
            for s in d.get('senses', []):
                for c in (s.get('categories') or []):
                    name = c if isinstance(c, str) else c.get('name')
                    if name:
                        rec['cats'].add(name)
                if s.get('form_of') or s.get('alt_of'):
                    continue
                if set(s.get('tags') or []) & {'form-of', 'obsolete', 'archaic'}:
                    continue
                for g in (s.get('glosses') or []):
                    g = g.strip()
                    if g and g not in rec['glosses']:
                        rec['glosses'].append(g)

            for fm in (d.get('forms') or []):
                if fm.get('source') != 'conjugation':
                    continue
                form = (fm.get('form') or '').strip()
                tags = set(fm.get('tags') or [])
                if 'multiword-construction' in tags:
                    if 'infinitive' in tags:
                        if form.startswith('être'):
                            rec['aux'].add('être')
                        elif form.startswith('avoir'):
                            rec['aux'].add('avoir')
                    continue
                if 'table-tags' in tags or 'inflection-template' in tags:
                    continue
                if not form or form == '-':
                    continue

                person = None
                rest = tuple(sorted(tags - {'reflexive'}))
                for k, idx in PERSON_BY_TAGS.items():
                    if set(k) <= tags:
                        person = idx
                        rest = tuple(sorted(tags - set(k) - {'reflexive'}))
                        break
                if person is None:
                    key = NONFINITE_BY_TAGS.get(rest)
                    slot = (key, None) if key else None
                else:
                    tense = TENSE_BY_TAGS.get(rest)
                    slot = (tense, person) if tense else None
                if slot is None:
                    continue

                if WORD_FORM.match(form):
                    _add(rec['slots'], slot, form)
                    continue
                bare = REFLEXIVE_SUFFIX.sub('', REFLEXIVE_PREFIX.sub('', form)).strip()
                if bare != form and WORD_FORM.match(bare):
                    _add(rec['refl_slots'], slot, bare)

    out = {w: {'glosses': r['glosses'], 'aux': sorted(r['aux']), 'cats': r['cats'],
               'slots': r['slots'], 'refl_slots': r['refl_slots']}
           for w, r in records.items()}
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump({w: {'glosses': r['glosses'], 'aux': r['aux'], 'cats': sorted(r['cats']),
                       'slots': {json.dumps(k): v for k, v in r['slots'].items()},
                       'refl_slots': {json.dumps(k): v for k, v in r['refl_slots'].items()}}
                   for w, r in out.items()}, f, ensure_ascii=False)
    return out


def kaikki_lookup(records, lemma):
    """Wiktionary spells manoeuvrer "manœuvrer"; Lexique keeps the digraph."""
    if lemma in records:
        return records[lemma], lemma
    ligatured = lemma.replace('oe', 'œ').replace('ae', 'æ')
    if ligatured != lemma and ligatured in records:
        return records[ligatured], ligatured
    return None, None


def paradigm_from_kaikki(rec, lemma, spelling):
    """{tense_key: [[alt, ...] x6]} + participles, or None if the table is empty.

    A verb whose entire Wiktionary table is pronominal ("je m'efforce") is
    de-cliticised here, so the bare paradigm the pronominal builder needs comes
    straight out of the source instead of being invented.
    """
    slots = rec['slots']
    if not any(k[0] in SIMPLE_TENSES for k in slots):
        # Essentially-pronominal verb: the finite paradigm only exists in the
        # reflexive table, but the past participle sits in the plain section
        # (Wiktionary lists "souvenu" unclitised), so the plain slots are laid
        # over the de-cliticised ones rather than replaced by them.
        slots = dict(rec['refl_slots'])
        slots.update(rec['slots'])
    if not any(k[0] in SIMPLE_TENSES for k in slots):
        return None
    unligature = spelling != lemma
    def fix(words):
        if not unligature:
            return list(words)
        return [w.replace('œ', 'oe').replace('æ', 'ae') for w in words]

    raw = {}
    for tense in SIMPLE_TENSES + ['imperatif_present']:
        table = [fix(slots.get((tense, p), [])) for p in range(6)]
        if any(table):
            raw[tense] = table
    for key in ('participe_present', 'participe_passe'):
        vals = fix(slots.get((key, None), []))
        if vals:
            raw[key] = vals
    return raw


# --------------------------------------------------------------------------
# The regular-paradigm rule engine
# --------------------------------------------------------------------------

class RegularEngine(object):
    """Conjugate a regular verb from its infinitive.

    Only the three productive classes are handled — 1st group -er (with the
    orthographic adjustments of -cer/-ger/-yer/-e?er/-é?er), 2nd group -ir with
    the -iss- infix, and the regular -re class.  Everything else returns None
    rather than guessing.  -eler/-eter are refused on purpose: whether a verb
    doubles the consonant (appelle) or takes a grave accent (achète) is lexical,
    not rule-governed.
    """

    PRESENT_ER = ['e', 'es', 'e', 'ons', 'ez', 'ent']
    PRESENT_IR = ['is', 'is', 'it', 'issons', 'issez', 'issent']
    PRESENT_RE = ['s', 's', '', 'ons', 'ez', 'ent']
    IMPERFECT = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient']
    FUTURE = ['ai', 'as', 'a', 'ons', 'ez', 'ont']
    CONDITIONAL = IMPERFECT
    SUBJ_PRESENT_ER = ['e', 'es', 'e', 'ions', 'iez', 'ent']
    SUBJ_PRESENT_IR = ['isse', 'isses', 'isse', 'issions', 'issiez', 'issent']
    SUBJ_PRESENT_RE = ['e', 'es', 'e', 'ions', 'iez', 'ent']
    PAST_ER = ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent']
    PAST_IR = ['is', 'is', 'it', 'îmes', 'îtes', 'irent']
    PAST_RE = PAST_IR
    SUBJ_IMPERFECT_ER = ['asse', 'asses', 'ât', 'assions', 'assiez', 'assent']
    SUBJ_IMPERFECT_IR = ['isse', 'isses', 'ît', 'issions', 'issiez', 'issent']
    SUBJ_IMPERFECT_RE = SUBJ_IMPERFECT_IR

    MUTE_E = re.compile(r'^e(s|nt)?$')

    @classmethod
    def klass(cls, inf):
        if inf.endswith('eler') or inf.endswith('eter'):
            return None
        if inf.endswith('er'):
            return 'er'
        if inf.endswith('ir'):
            return 'ir'
        if inf.endswith('re'):
            return 're'
        return None

    @staticmethod
    def _soften(stem, ending):
        """-cer -> ç and -ger -> ge in front of a hard a / o."""
        if not ending or ending[0] not in 'aâo':
            return stem
        if stem.endswith('c'):
            return stem[:-1] + 'ç'
        if stem.endswith('g'):
            return stem + 'e'
        return stem

    @classmethod
    def _mutate_er_stem(cls, stem, ending, future=False):
        """y -> i, e -> è and é -> è in front of a mute e."""
        mute = future or bool(cls.MUTE_E.match(ending))
        if not mute:
            return stem
        if stem.endswith('y') and len(stem) > 1 and stem[-2] in 'aeou':
            # -ayer keeps both spellings; the -oyer / -uyer change is obligatory.
            return stem[:-1] + 'i' if stem[-2] in 'ou' else stem
        if re.search(r'e[^aeiouyàâéèêëîïôùûü]$', stem):
            return stem[:-2] + 'è' + stem[-1]
        if not future and re.search(r'é[^aeiouyàâéèêëîïôùûü]$', stem):
            return stem[:-2] + 'è' + stem[-1]
        return stem

    @classmethod
    def conjugate(cls, inf):
        k = cls.klass(inf)
        if not k:
            return None
        stem = inf[:-2]
        raw = {}
        if k == 'er':
            present = cls.PRESENT_ER
            subj_present = cls.SUBJ_PRESENT_ER
            past = cls.PAST_ER
            subj_imperfect = cls.SUBJ_IMPERFECT_ER
            pp = stem + 'é'
            future_stem = inf
        elif k == 'ir':
            present = cls.PRESENT_IR
            subj_present = cls.SUBJ_PRESENT_IR
            past = cls.PAST_IR
            subj_imperfect = cls.SUBJ_IMPERFECT_IR
            pp = stem + 'i'
            future_stem = inf
        else:
            present = cls.PRESENT_RE
            subj_present = cls.SUBJ_PRESENT_RE
            past = cls.PAST_RE
            subj_imperfect = cls.SUBJ_IMPERFECT_RE
            pp = stem + 'u'
            future_stem = inf[:-1]

        def build(endings, base=None, future=False):
            out = []
            for e in endings:
                s = base if base is not None else stem
                if k == 'er' and base is None:
                    s = cls._mutate_er_stem(s, e, future=future)
                s = cls._soften(s, e)
                out.append([s + e])
            return out

        raw['indicatif_present'] = build(present)
        infix = 'iss' if k == 'ir' else ''
        raw['indicatif_imparfait'] = build([infix + e for e in cls.IMPERFECT])
        raw['indicatif_passe_simple'] = build(past)
        raw['subjonctif_present'] = build(subj_present)
        raw['subjonctif_imparfait'] = build(subj_imperfect)
        if k == 'er':
            fut = cls._mutate_er_stem(stem, 'e', future=True) + 'er'
        else:
            fut = future_stem
        raw['indicatif_futur_simple'] = build(cls.FUTURE, base=fut)
        raw['conditionnel_present'] = build(cls.CONDITIONAL, base=fut)
        imp = list(raw['indicatif_present'])
        raw['imperatif_present'] = [[], list(imp[1]), [], list(imp[3]), list(imp[4]), []]
        if k == 'er':
            raw['imperatif_present'][1] = list(imp[0])  # parle, not parles
        raw['participe_present'] = [cls._soften(stem, 'a') + infix + 'ant']
        raw['participe_passe'] = [pp]
        return raw


# --------------------------------------------------------------------------
# Paradigm classification (what the `model` field reports)
# --------------------------------------------------------------------------

def paradigm_signature(infinitive, raw):
    """A verb's inflectional class, computed from its own forms.

    The stem a verb shares with every one of its own forms is stripped away and
    what remains — the ordered list of endings — is the signature.  Verbs that
    inflect alike land on the same signature no matter what they mean or how
    they are prefixed (faire / refaire / satisfaire all reduce to
    "-aire, -ais, -aisons, -erai, -is, -asse"), while a verb with a suppletive
    stem (aller: vais / allons / irai) shares its stem with nothing and ends up
    in a class of its own, which is correct.
    """
    words = [infinitive]
    keys = sorted(raw)
    for key in keys:
        slots = raw[key]
        if key in ('participe_present', 'participe_passe'):
            words.extend(slots)
        else:
            for alts in slots:
                words.extend(alts)
    core = os.path.commonprefix(words)
    parts = [('infinitif', (infinitive[len(core):],))]
    for key in keys:
        slots = raw[key]
        if key in ('participe_present', 'participe_passe'):
            parts.append((key, tuple(w[len(core):] for w in slots)))
        else:
            parts.append((key, tuple(tuple(a[len(core):] for a in alts) for alts in slots)))
    return json.dumps(parts, ensure_ascii=False, sort_keys=True)


# --------------------------------------------------------------------------
# Glosses
# --------------------------------------------------------------------------

POS_LINE = re.compile(r'^\s*(?:\[[^\]]*\]|[a-zA-Z]{1,6}\.)\s*')
PARENS = re.compile(r'\([^)]*\)')


def clean_english(glosses):
    out = []
    for g in glosses:
        g = re.sub(r'\s+', ' ', g).strip().rstrip('.')
        # Wiktionary appends a long parenthetical clarifier to many glosses
        # ("to purr (to make a vibrating sound ...)").  Keep the head.
        core = re.sub(r'\s*\([^()]*\)\s*$', '', g).strip()
        if core:
            g = core
        if not g or len(g) > 90:
            continue
        if g.lower().startswith(('alternative spelling', 'obsolete spelling',
                                 'misspelling', 'pre-1990', 'post-1990',
                                 'alternative form', 'archaic form', 'dated form',
                                 'eye dialect', 'nonstandard spelling')):
            continue
        out.append(g)
        if len(out) == 2 or sum(len(x) + 2 for x in out) > 60:
            break
    text = '; '.join(out)
    if len(text) > 80:
        text = out[0][:80]
    return text


def english_pivot_keys(glosses):
    """Candidate English dictionary keys extracted from Wiktionary glosses."""
    keys = []
    for g in glosses:
        g = PARENS.sub(' ', g)
        for piece in re.split(r'[;,]', g):
            piece = piece.strip().lower()
            piece = re.sub(r'^to\s+', '', piece)
            piece = re.sub(r'[^a-z\s\-]', '', piece).strip()
            if not piece:
                continue
            if piece not in keys:
                keys.append(piece)
            head = piece.split()[0]
            if head and head not in keys:
                keys.append(head)
    return keys[:14]


def ecdict_chinese(cur, cache, key):
    if key in cache:
        return cache[key]
    cur.execute('SELECT translation, pos FROM stardict WHERE word = ? COLLATE NOCASE LIMIT 1', (key,))
    row = cur.fetchone()
    result = None
    if row and row[0]:
        verb_lines, other_lines = [], []
        for line in str(row[0]).split('\n'):
            line = line.strip()
            if not line or not CJK.search(line):
                continue
            is_verb = bool(re.match(r'^(v|vt|vi|va|aux)\.', line))
            body = POS_LINE.sub('', line).strip()
            body = body.strip(' ,;，；')
            if not body or not CJK.search(body):
                continue
            (verb_lines if is_verb else other_lines).append(body)
        chosen = verb_lines or other_lines
        if chosen:
            parts = []
            for body in chosen[:2]:
                bits = [b.strip() for b in re.split(r'[,，;；]', body) if b.strip()]
                parts.extend(bits[:3])
            parts = list(OrderedDict.fromkeys(parts))[:4]
            text = '；'.join(parts)
            if len(text) > 40:
                text = '；'.join(parts[:2])
            if len(text) > 40:
                text = text[:40]
            if CJK.search(text):
                result = text
    cache[key] = result
    return result


def load_previous_chinese(path):
    """infinitive -> chinese, read out of the dataset this build replaces.

    322 of these were rewritten by hand to kill the collisions the English pivot
    produced; re-running ECDICT would silently throw that work away.  A verb
    that already ships keeps its gloss, full stop.
    """
    if not os.path.exists(path):
        return {}
    import canonical_conjugations
    out = OrderedDict()
    for e in canonical_conjugations.verbs_of(path):
        # conjugations/1 (word / zh) or the legacy shape (infinitive / chinese)
        word, zh = e.get('word') or e.get('infinitive'), e.get('zh') or e.get('chinese')
        if word and zh:
            out[word] = zh
    return out


# --------------------------------------------------------------------------
# Quality gates
# --------------------------------------------------------------------------

def bad_text(value):
    if not value or not str(value).strip():
        return 'empty'
    v = str(value).strip()
    if MOJIBAKE.search(v):
        return 'mojibake'
    if PLACEHOLDER.match(v):
        return 'placeholder'
    if re.search(r'(.{3,}?)\1{2,}', v):
        return 'repetition'
    return None


# --------------------------------------------------------------------------
# Lexique
# --------------------------------------------------------------------------

LEX_TAG = {
    'indicatif_present': 'ind:pre', 'indicatif_imparfait': 'ind:imp',
    'indicatif_passe_simple': 'ind:pas', 'indicatif_futur_simple': 'ind:fut',
    'conditionnel_present': 'cnd:pre', 'subjonctif_present': 'sub:pre',
    'subjonctif_imparfait': 'sub:imp',
}
LEX_PERSON = ['1s', '2s', '3s', '1p', '2p', '3p']


def load_lexique(path):
    """Return (lemma -> frequency, forms index, surface-form frequency index).

    forms index keys:
        (lemma, 'ind:pre:1s')     — an attested finite form
        (lemma, 'par:pas')        — any attested past participle
        (lemma, 'par:pas:m:s')    — past participle agreeing in gender/number
        (participle, 'ADJ')       — a participle that lexicalised as an adjective
    The gender/number of a participle lives in Lexique's `genre` / `nombre`
    columns, not in `infover`, which is why "due" and "absoute" are reachable at
    all: no suffix rule produces them from "dû" / "absous".
    """
    import csv
    freq = OrderedDict()
    forms = {}
    form_freq = {}
    with open(path, encoding='utf-8') as f:
        for row in csv.DictReader(f, delimiter='\t'):
            if row['cgram'] == 'ADJ':
                forms.setdefault((row['lemme'], 'ADJ'), set()).add(row['ortho'])
                continue
            if row['cgram'] != 'VER':
                continue
            lemma = row['lemme']
            if lemma not in freq:
                try:
                    freq[lemma] = round(float(row['freqlemfilms2']) + float(row['freqlemlivres']), 2)
                except ValueError:
                    freq[lemma] = 0.0
            try:
                surface = float(row['freqfilms2']) + float(row['freqlivres'])
            except ValueError:
                surface = 0.0
            key = (lemma, row['ortho'])
            form_freq[key] = max(form_freq.get(key, 0.0), surface)
            for tag in row['infover'].split(';'):
                tag = tag.strip()
                if not tag:
                    continue
                forms.setdefault((lemma, tag), set()).add(row['ortho'])
                if tag == 'par:pas':
                    genre = (row['genre'] or 'm')[:1]
                    nombre = (row['nombre'] or 's')[:1]
                    forms.setdefault((lemma, 'par:pas:%s:%s' % (genre, nombre)), set()).add(row['ortho'])
                    if not row['nombre']:
                        forms.setdefault((lemma, 'par:pas:%s:p' % genre), set()).add(row['ortho'])
    return freq, forms, form_freq


def strip_accents(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text)
                   if unicodedata.category(c) != 'Mn')


def merge_attested(generated, attested):
    """Fold in a corpus-attested spelling variant that differs only in accents.

    Wiktionary ships one spelling of the -éger family ("protégerai" or
    "protègerai"); both have been correct since 1990 and the corpus has both, so
    both are offered.  The extra variant only takes the lead when Wiktionary's
    own form is unattested in the corpus; otherwise it is appended, so marginal
    variants ("eussé", used only in "eussé-je") never displace the citation form.
    """
    if not attested:
        return generated
    extra = [a for a in sorted(attested)
             if a not in generated
             and any(strip_accents(a) == strip_accents(g) for g in generated)]
    if not extra:
        return generated
    if any(g in attested for g in generated):
        return generated + extra
    return extra + [g for g in generated if g not in extra]


# --------------------------------------------------------------------------
# The conjugation engine
# --------------------------------------------------------------------------

def join_alts(alts):
    seen = []
    for a in alts:
        if a and a not in seen:
            seen.append(a)
    return '/'.join(seen)


def reflexive_prefix(person, word):
    pron = REFLEXIVE_PRONOUN[person]
    if pron in ('me', 'te', 'se') and VOWEL_START.match(word or ''):
        return pron[0] + "'" + word
    return pron + ' ' + word


class Conjugator(object):
    def __init__(self, kaikki, lex_forms, form_freq):
        self.kaikki = kaikki
        self.lex_forms = lex_forms
        self.form_freq = form_freq
        self.cache = {}
        self.aux_tables = {}
        self.origin = {}

    def simple(self, infinitive):
        """(raw paradigm, origin) — Wiktionary if it has a table, else the rules."""
        if infinitive in self.cache:
            return self.cache[infinitive], self.origin[infinitive]
        rec, spelling = kaikki_lookup(self.kaikki, infinitive)
        raw, origin = None, None
        if rec:
            raw = paradigm_from_kaikki(rec, infinitive, spelling)
            origin = 'wiktionary'
        if raw is None:
            raw = RegularEngine.conjugate(infinitive)
            origin = 'rule-engine' if raw else None
            if raw is not None:
                # The rule engine knows morphology, not usage: it will happily
                # inflect an impersonal verb through all six persons.
                for person in IMPERSONAL.get(infinitive, ()):
                    for key, slots in raw.items():
                        if key not in ('participe_present', 'participe_passe'):
                            slots[PERSONS.index(person)] = []
        if raw is not None:
            for (lemma, tense, idx), extra in EXTRA_FORMS.items():
                if lemma == infinitive and raw.get(tense):
                    for form in extra:
                        if form not in raw[tense][idx]:
                            raw[tense][idx].append(form)
            raw = self.order_alternatives(infinitive, raw)
        self.cache[infinitive] = raw
        self.origin[infinitive] = origin
        return raw, origin

    def order_alternatives(self, lemma, raw):
        """Put the spelling the corpus actually prefers first (paie before paye)."""
        out = {}
        for key, slots in raw.items():
            if key in ('participe_present', 'participe_passe'):
                out[key] = self._sorted(lemma, slots)
            else:
                out[key] = [self._sorted(lemma, alts) for alts in slots]
        return out

    def _sorted(self, lemma, alts):
        if len(alts) < 2:
            return list(alts)
        keyed = [(-self.form_freq.get((lemma, a), 0.0), i, a) for i, a in enumerate(alts)]
        return [a for _f, _i, a in sorted(keyed)]

    def aux_table(self, aux):
        if aux not in self.aux_tables:
            raw, _o = self.simple(aux)
            self.aux_tables[aux] = raw
        return self.aux_tables[aux]

    # -- helpers ------------------------------------------------------------
    def attested_participles(self, lemma, ms):
        """Every spelling the corpus records for this verb's past participle.

        Two Lexique views are unioned: the verb's own `par:pas` rows, and the
        adjective paradigm of the participle itself -- French lexicons file
        "maudits/maudites" under the adjective "maudit" rather than under the
        verb, so the verb view alone has holes.
        """
        att = set(self.lex_forms.get((lemma, 'par:pas')) or ())
        if ms:
            att |= set(self.lex_forms.get((ms, 'ADJ')) or ())
        return att

    def participles(self, lemma, raw):
        """{ms, fs, mp, fp} — masculine singular from Wiktionary; agreement by
        the regular -e/-s/-es rule whenever the corpus confirms that spelling,
        and from Lexique's gender/number columns when it does not.

        The order matters.  "add -e" is right for the overwhelming majority and
        Lexique's morphological tagging is not always trustworthy (it files
        "maudis" as a masculine plural participle, which it is not).  But the
        rule is wrong exactly where French is irregular -- devoir gives "due",
        not "dûe"; croître gives "crue", not "crûe"; absoudre gives "absoute",
        not "absouse" -- and those are the cases the corpus has to settle.
        """
        past = raw.get('participe_passe') or []
        ms = past[0] if past else ''
        pp = {'ms': ms, 'fs': '', 'mp': '', 'fp': ''}
        if not ms:
            return pp
        attested = self.attested_participles(lemma, ms)
        naive_fs = ms if ms.endswith('e') else ms + 'e'
        naive = {
            'fs': naive_fs,
            'mp': ms if ms.endswith(('s', 'x')) else ms + 's',
            'fp': naive_fs if naive_fs.endswith('s') else naive_fs + 's',
        }
        for slot, tag in (('fs', 'f:s'), ('mp', 'm:p'), ('fp', 'f:p')):
            if naive[slot] in attested:
                pp[slot] = naive[slot]
                continue
            cands = self.lex_forms.get((lemma, 'par:pas:%s' % tag)) or set()
            cands = [c for c in cands if c != ms or slot == 'mp']
            if cands:
                # Several lemmas have two participles in the corpus; keep the one
                # built on the same stem as the form Wiktionary gives.
                pp[slot] = max(sorted(cands), key=lambda c: len(os.path.commonprefix([c, ms])))
            else:
                pp[slot] = naive[slot]
        return pp

    @staticmethod
    def agreement_for(person, pp):
        if person in ('je', 'tu', 'il_elle_on'):
            cand = [pp['ms'], pp['fs']]
        elif person == 'nous':
            cand = [pp['mp'], pp['fp']]
        elif person == 'ils_elles':
            cand = [pp['mp'], pp['fp']]
        else:  # vous: polite singular or plural, either gender
            cand = [pp['ms'], pp['fs'], pp['mp'], pp['fp']]
        return [c for c in cand if c]

    @staticmethod
    def person_mask(raw):
        """Which persons this verb has at all (impersonal verbs only have il)."""
        mask = [False] * 6
        for key in SIMPLE_TENSES:
            for idx, alts in enumerate(raw.get(key) or []):
                if idx < 6 and alts:
                    mask[idx] = True
        return mask

    def compound_person(self, aux_slots, pp, auxiliary, reflexive, mask=None):
        """aux_slots: 6 alternative-lists of the auxiliary's simple tense."""
        forms = OrderedDict()
        for idx, person in enumerate(PERSONS):
            aux_alts = aux_slots[idx] if idx < len(aux_slots) else []
            if mask is not None and not mask[idx]:
                forms[person] = ''
                continue
            if not aux_alts:
                forms[person] = ''
                continue
            pieces = []
            if auxiliary == 'être':
                pps = self.agreement_for(person, pp)
            else:
                pps = [pp['ms']] if pp['ms'] else []
            for a in aux_alts:
                for participle in pps:
                    phrase = '%s %s' % (a, participle)
                    if reflexive:
                        phrase = reflexive_prefix(person, phrase)
                    pieces.append(phrase)
            forms[person] = join_alts(pieces)
        return forms


def choose_auxiliary(inf, rec):
    """Return (auxiliary, alternative_or_None)."""
    aux = set(rec.get('aux') or []) if rec else set()
    if aux == {'être'}:
        return 'être', None
    if aux == {'avoir', 'être'}:
        if inf in ETRE_PREFERRED_FOR_DUAL:
            return 'être', 'avoir'
        return 'avoir', 'être'
    if aux == {'avoir'}:
        if inf in ETRE_PREFERRED_FOR_DUAL:
            return 'être', 'avoir'
        return 'avoir', None
    # No Wiktionary evidence — fall back to the closed être class.
    if inf in ETRE_PREFERRED_FOR_DUAL:
        return 'être', 'avoir'
    return 'avoir', None


def build_verb(conj, infinitive, base_infinitive, meta):
    """meta: dict(rank, frequency, corpusRank, english, chinese, auxiliary,
                  auxiliaryAlt, reflexive, aspirateH)"""
    raw, origin = conj.simple(base_infinitive)
    if raw is None:
        return None
    reflexive = meta['reflexive']
    auxiliary = meta['auxiliary']
    pp = conj.participles(base_infinitive, raw)
    lex = conj.lex_forms
    attested_pp = conj.attested_participles(base_infinitive, pp['ms'])
    if auxiliary != 'être' and not reflexive:
        # An intransitive avoir-verb has no agreeing participle: "dormie" and
        # "plues" are not French.  Only the masculine singular is unconditionally
        # safe, so the agreement forms are kept exactly when the corpus attests
        # them.
        for slot in ('fs', 'mp', 'fp'):
            if pp[slot] and pp[slot] not in attested_pp:
                pp[slot] = ''
    aux_raw = conj.aux_table(auxiliary)
    mask = conj.person_mask(raw)

    tenses = OrderedDict()

    def add_person(key, slots, lex_tag=None):
        group, label = TENSE_LABELS[key]
        built = OrderedDict()
        for idx, person in enumerate(PERSONS):
            alts = list(slots[idx]) if idx < len(slots) else []
            if lex_tag and alts:
                alts = merge_attested(
                    alts, lex.get((base_infinitive, '%s:%s' % (lex_tag, LEX_PERSON[idx]))))
            words = []
            for a in alts:
                words.append(reflexive_prefix(person, a) if reflexive else a)
            built[person] = join_alts(words)
        if not any(built.values()):
            return
        tenses[key] = OrderedDict([
            ('type', 'person'), ('group_label', group), ('tense_label', label),
            ('forms', built),
        ])

    def add_single(key, group, label, values):
        vals = [v for v in values if v]
        if not vals:
            return
        tenses[key] = OrderedDict([
            ('type', 'single'), ('group_label', group), ('tense_label', label),
            ('forms', vals),
        ])

    # --- simple tenses ----------------------------------------------------
    for key in SIMPLE_TENSES:
        if raw.get(key):
            add_person(key, raw[key], lex_tag=LEX_TAG[key])

    # --- compound tenses --------------------------------------------------
    compounds = [
        ('indicatif_passe_compose', 'Indicatif', 'Passé composé', 'indicatif_present'),
        ('indicatif_plus_que_parfait', 'Indicatif', 'Plus-que-parfait', 'indicatif_imparfait'),
        ('indicatif_passe_anterieur', 'Indicatif', 'Passé antérieur', 'indicatif_passe_simple'),
        ('indicatif_futur_anterieur', 'Indicatif', 'Futur antérieur', 'indicatif_futur_simple'),
        ('conditionnel_passe', 'Conditionnel', 'Passé', 'conditionnel_present'),
        ('subjonctif_passe', 'Subjonctif', 'Passé', 'subjonctif_present'),
        ('subjonctif_plus_que_parfait', 'Subjonctif', 'Plus-que-parfait', 'subjonctif_imparfait'),
    ]
    for key, group, label, aux_key in compounds:
        if not aux_raw.get(aux_key):
            continue
        forms = conj.compound_person(aux_raw[aux_key], pp, auxiliary, reflexive, mask)
        if not any(forms.values()):
            continue
        tenses[key] = OrderedDict([
            ('type', 'person'), ('group_label', group), ('tense_label', label),
            ('forms', forms),
        ])

    # --- impératif --------------------------------------------------------
    imp_slots = raw.get('imperatif_present') or [[]] * 6
    if reflexive:
        suffix = {'tu': '-toi', 'nous': '-nous', 'vous': '-vous'}
        built = OrderedDict()
        for idx, person in enumerate(PERSONS):
            alts = imp_slots[idx] if idx < len(imp_slots) else []
            built[person] = (join_alts([a + suffix[person] for a in alts])
                             if alts and person in suffix else '')
        if any(built.values()):
            tenses['imperatif_present'] = OrderedDict([
                ('type', 'person'), ('group_label', 'Impératif'), ('tense_label', 'Présent'),
                ('forms', built),
            ])
    else:
        add_person('imperatif_present', imp_slots)
        aux_imp = aux_raw.get('imperatif_present') or [[]] * 6
        built = OrderedDict()
        for idx, person in enumerate(PERSONS):
            alts = aux_imp[idx] if idx < len(aux_imp) else []
            if not alts:
                built[person] = ''
                continue
            pps = (Conjugator.agreement_for(person, pp) if auxiliary == 'être'
                   else ([pp['ms']] if pp['ms'] else []))
            built[person] = join_alts(['%s %s' % (a, p) for a in alts for p in pps])
        if any(built.values()) and tenses.get('imperatif_present'):
            tenses['imperatif_passe'] = OrderedDict([
                ('type', 'person'), ('group_label', 'Impératif'), ('tense_label', 'Passé'),
                ('forms', built),
            ])

    # --- non-finite -------------------------------------------------------
    pres_part = list(raw.get('participe_present') or [])
    pres_part = merge_attested(pres_part, lex.get((base_infinitive, 'par:pre')))
    pres_values = [reflexive_prefix('il_elle_on', a) if reflexive else a for a in pres_part]
    add_single('participe_present', 'Participe', 'Présent', pres_values)

    ordered_pp = merge_attested([v for v in (pp['ms'], pp['fs'], pp['mp'], pp['fp']) if v],
                                attested_pp)
    add_single('participe_passe', 'Participe', 'Passé', list(OrderedDict.fromkeys(ordered_pp)))

    add_single('infinitif_present', 'Infinitif', 'Présent', [infinitive])
    if auxiliary == 'être':
        pieces = ['être %s' % v for v in OrderedDict.fromkeys(
            [pp['ms'], pp['fs'], pp['mp'], pp['fp']]) if v]
    else:
        pieces = ['avoir %s' % pp['ms']] if pp['ms'] else []
    if reflexive:
        pieces = [reflexive_prefix('il_elle_on', p) for p in pieces]
    add_single('infinitif_passe', 'Infinitif', 'Passé', pieces)

    # A verb with no past participle (poindre in some sources) is genuinely
    # defective: it simply has no compound tenses.  Keep it for its simple
    # tenses rather than dropping it, but insist on a usable paradigm.
    finite = sum(1 for t in tenses.values() if t['type'] == 'person')
    if len(tenses) < 3 or finite < 1:
        return None

    entry = OrderedDict()
    entry['rank'] = meta['rank']
    entry['infinitive'] = infinitive
    entry['frequency'] = meta['frequency']
    entry['corpusRank'] = meta['corpusRank']
    entry['english'] = meta['english']
    entry['chinese'] = meta['chinese']
    entry['partOfSpeech'] = 'verbe pronominal' if reflexive else 'verbe'
    entry['model'] = ''            # filled in by assign_models()
    entry['auxiliary'] = auxiliary
    if meta.get('auxiliaryAlt'):
        entry['auxiliaryAlt'] = meta['auxiliaryAlt']
    if reflexive:
        entry['reflexive'] = True
        entry['frequencyBasis'] = 'Lexique lemma frequency of the base verb "%s"' % base_infinitive
    if meta.get('aspirateH'):
        entry['aspirateH'] = True
    missing = [k for k in CANONICAL_TENSES if k not in tenses]
    if missing:
        # Declared, not silently absent: falloir has no plural, clore has no
        # passé simple, pouvoir has no imperative.  The validator checks that a
        # tense is missing only when it is listed here.
        entry['defective'] = missing
    gaps = OrderedDict()
    for key, t in tenses.items():
        if t['type'] != 'person':
            continue
        empty = [p for p in PERSONS if not t['forms'][p]]
        if key.startswith('imperatif'):
            empty = [p for p in empty if p in ('tu', 'nous', 'vous')]
        if empty:
            # Every person slot Wiktionary spells "-", declared per tense:
            # falloir is impersonal, clore has no "nous/vous" present, pleuvoir
            # has no singular imperative.  The validator refuses any undeclared
            # hole.
            gaps[key] = empty
    if gaps:
        entry['gaps'] = gaps
    entry['participle'] = OrderedDict([('ms', pp['ms']), ('fs', pp['fs']),
                                       ('mp', pp['mp']), ('fp', pp['fp'])])
    entry['source'] = SOURCE_LABEL
    entry['tenses'] = tenses
    entry['_base'] = base_infinitive
    entry['_origin'] = origin
    return entry


# --------------------------------------------------------------------------
# Build
# --------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--work', default='/tmp/frconj')
    ap.add_argument('--limit', type=int, default=1800)
    ap.add_argument('--refresh-cache', action='store_true')
    ap.add_argument('--out', default=OUT_PATH)
    ap.add_argument('--prev', default=OUT_PATH,
                    help='dataset to inherit reviewed Chinese glosses from')
    args = ap.parse_args()

    work = args.work
    need = {
        'lexique': os.path.join(work, 'Lexique383.tsv'),
        'kaikki': os.path.join(work, 'fr-verbs.jsonl'),
    }
    for label, path in need.items():
        if not os.path.exists(path):
            sys.exit('missing %s at %s\nDownload:%s' % (label, path, DOWNLOADS))
    ecdict_path = os.path.join(work, 'stardict.db')

    previous_chinese = load_previous_chinese(args.prev)
    print('previous dataset: %d reviewed Chinese glosses carried over'
          % len(previous_chinese))

    freq, lex_forms, form_freq = load_lexique(need['lexique'])
    ordered = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))
    corpus_rank = {lemma: i + 1 for i, (lemma, _f) in enumerate(ordered)}
    print('lexique: %d verb lemmas, %d (lemma, morph-tag) attestations'
          % (len(ordered), len(lex_forms)))

    kaikki = load_kaikki(need['kaikki'],
                         os.path.join(work, 'fr-verb-kaikki-cache.json'),
                         refresh=args.refresh_cache)
    print('kaikki: %d French verb headwords with an entry' % len(kaikki))

    conj = Conjugator(kaikki, lex_forms, form_freq)

    # --- who can be conjugated at all, and into which paradigm class ------
    candidates = []
    signature = {}
    origins = Counter()
    for lemma, f in ordered:
        raw, origin = conj.simple(lemma)
        if raw is None:
            continue
        candidates.append((lemma, f))
        signature[lemma] = paradigm_signature(lemma, raw)
        origins[origin] += 1
    print('conjugatable candidates: %d  (%s)' % (len(candidates), dict(origins)))
    classes = {}
    for lemma, _f in candidates:
        classes.setdefault(signature[lemma], []).append(lemma)
    # each class is named after its most frequent member
    class_name = {sig: members[0] for sig, members in classes.items()}
    print('paradigm classes computed from the forms: %d' % len(classes))

    db = sqlite3.connect(ecdict_path) if os.path.exists(ecdict_path) else None
    cur = db.cursor() if db else None
    zh_cache = {}
    stats = Counter()
    rejects = []

    def try_build(lemma, f):
        """Run the quality gate; return an entry or None (and log why)."""
        rec, _spelling = kaikki_lookup(kaikki, lemma)
        rec = rec or {'glosses': [], 'aux': [], 'cats': set()}
        english = MANUAL_ENGLISH.get(lemma) or clean_english(rec['glosses'])
        if bad_text(english) or len(english) < 2:
            stats['no_english_gloss'] += 1
            rejects.append((lemma, 'no_english_gloss'))
            return None
        if english.strip().lower() == lemma.lower():
            stats['gloss_is_headword'] += 1
            rejects.append((lemma, 'gloss_is_headword'))
            return None
        chinese = (previous_chinese.get(lemma) or MANUAL_CHINESE.get(lemma)
                   or MANUAL_ENGLISH_ZH.get(lemma))
        if chinese:
            stats['chinese_inherited' if lemma in previous_chinese else 'chinese_manual'] += 1
        else:
            if cur is None:
                sys.exit('"%s" is new to the dataset and needs an ECDICT lookup, but %s\n'
                         'is missing.  Download:%s' % (lemma, ecdict_path, DOWNLOADS))
            for key in english_pivot_keys(rec['glosses']):
                chinese = ecdict_chinese(cur, zh_cache, key)
                if chinese:
                    break
            if chinese:
                stats['chinese_new_from_ecdict'] += 1
        if not chinese or bad_text(chinese) or not CJK.search(chinese):
            stats['no_chinese_gloss'] += 1
            rejects.append((lemma, 'no_chinese_gloss'))
            return None
        aux, aux_alt = choose_auxiliary(lemma, rec)
        meta = {
            'rank': 0, 'frequency': f, 'corpusRank': corpus_rank[lemma],
            'english': english, 'chinese': chinese, 'auxiliary': aux,
            'auxiliaryAlt': aux_alt, 'reflexive': False,
            'aspirateH': ASPIRATED_H_CATEGORY in (rec.get('cats') or set()),
        }
        entry = build_verb(conj, lemma, lemma, meta)
        if entry is None:
            stats['conjugation_failed'] += 1
            rejects.append((lemma, 'conjugation_failed'))
            return None
        return entry

    picked = []
    for lemma, f in candidates:
        if len(picked) >= args.limit:
            break
        if lemma in PRONOMINAL_ONLY:
            stats['skipped_pronominal_only'] += 1
            continue
        entry = try_build(lemma, f)
        if entry is None:
            continue
        picked.append(entry)
        stats['accepted'] += 1

    # --- paradigm-class supplement ---------------------------------------
    # Pure corpus frequency leaves plenty of inflectional classes with no
    # representative (moudre, éclore, prévaloir, ...).  A conjugation trainer
    # should be able to show every pattern, so for each still-uncovered class we
    # add exactly one verb: its most frequent member, and only if it clears the
    # same gloss gate.  Nothing is added to hit a count -- the supplement stops
    # as soon as every class has a representative.
    picked_names = set(e['infinitive'] for e in picked)
    covered = set(signature[e['_base']] for e in picked if e['_base'] in signature)
    for _s, base, _e, _c in PRONOMINAL_VERBS:
        if base in signature:
            covered.add(signature[base])
    for lemma, f in candidates:
        if lemma in picked_names or lemma in PRONOMINAL_ONLY:
            continue
        sig = signature[lemma]
        if sig in covered:
            continue
        entry = try_build(lemma, f)
        if entry is None:
            continue
        covered.add(sig)
        picked.append(entry)
        picked_names.add(lemma)
        stats['accepted_class_coverage'] += 1

    # --- continuity with the dataset being replaced -----------------------
    # Every lemma below is an ordinary Lexique headword; it is listed here only
    # because it already shipped.  Dropping a verb from the study set orphans
    # whatever spaced-repetition history the learner has built on that card, so
    # a verb leaves the dataset only when it can no longer be conjugated or
    # glossed -- never merely because the frequency cutoff moved.
    for lemma in previous_chinese:
        if lemma in picked_names or lemma.startswith("s'") or lemma.startswith('se '):
            continue
        if lemma in PRONOMINAL_ONLY or lemma not in signature:
            continue
        entry = try_build(lemma, freq.get(lemma, 0.0))
        if entry is None:
            continue
        picked.append(entry)
        picked_names.add(lemma)
        stats['accepted_continuity'] += 1

    # --- pronominal verbs -------------------------------------------------
    for surface, base, en, zh in PRONOMINAL_VERBS:
        raw, _origin = conj.simple(base)
        if raw is None:
            stats['pronominal_no_paradigm'] += 1
            rejects.append((surface, 'pronominal_no_paradigm'))
            continue
        rec, _spelling = kaikki_lookup(kaikki, base)
        meta = {
            'rank': 0,
            'frequency': freq.get(base, 0.0),
            'corpusRank': corpus_rank.get(base, 0),
            'english': en,
            'chinese': previous_chinese.get(surface) or zh,
            'auxiliary': 'être', 'auxiliaryAlt': None, 'reflexive': True,
            'aspirateH': bool(rec and ASPIRATED_H_CATEGORY in rec['cats']),
        }
        entry = build_verb(conj, surface, base, meta)
        if entry is None:
            stats['pronominal_failed'] += 1
            continue
        picked.append(entry)
        stats['accepted_pronominal'] += 1

    # rank = position in this dataset ordered by real corpus frequency
    picked.sort(key=lambda e: (-e['frequency'], e['infinitive']))
    seen = set()
    unique = []
    for e in picked:
        if e['infinitive'] in seen:
            continue
        seen.add(e['infinitive'])
        unique.append(e)
    picked = unique

    origin_counter = Counter()
    for i, e in enumerate(picked):
        e['rank'] = i + 1
        e['model'] = class_name.get(signature.get(e['_base'], ''), e['_base'])
        origin_counter[e.pop('_origin')] += 1
        e.pop('_base')
        e.move_to_end('auxiliary', last=False)
        for field in ('rank', 'infinitive', 'frequency', 'corpusRank', 'english',
                      'chinese', 'partOfSpeech', 'model', 'auxiliary'):
            e.move_to_end(field)
        for field in ('auxiliaryAlt', 'reflexive', 'frequencyBasis', 'aspirateH',
                      'defective', 'gaps', 'participle', 'source', 'tenses'):
            if field in e:
                e.move_to_end(field)

    total_forms = 0
    for e in picked:
        for t in e['tenses'].values():
            vals = t['forms'].values() if isinstance(t['forms'], dict) else t['forms']
            total_forms += sum(1 for v in vals if v)

    header = (
        '// French conjugation dataset — auto-generated by\n'
        '// scripts/build_french_conjugations.py.  DO NOT EDIT BY HAND.\n'
        '//\n'
        '// Verbs: %d   Tense/mood groups: up to %d   Non-empty forms: %d\n'
        '//\n'
        '// Sources and licences:\n'
        '//   * English Wiktionary via Wiktextract / kaikki.org — CC BY-SA 4.0 + GFDL\n'
        '//     (every simple-tense form, the participles, the English gloss, the\n'
        '//     auxiliary, and the aspirated-h flag)\n'
        '//   * Lexique 3.83 — CC BY-SA 4.0 (lexique.org): lemma frequency and corpus\n'
        '//     rank, spelling-variant ordering, attested participle agreement\n'
        '//   * ECDICT 1.0.28 — English→Chinese pivot, used only for verbs new to the\n'
        '//     dataset; glosses already shipped are inherited verbatim, including the\n'
        '//     322 that were corrected by hand\n'
        '//   * Compound tenses, the reflexive layer and the regular-paradigm rule\n'
        '//     engine are generated by the build script itself\n'
        '//\n'
        '// Which verbs are in: the most frequent %d in Lexique that can be conjugated\n'
        '// and glossed, plus one representative of every inflectional class the\n'
        '// frequency pass missed, plus the curated pronominals, plus any verb an\n'
        '// earlier build already shipped (so no learner loses a card).\n'
        '//\n'
        '// Subject-pronoun elision is NOT baked in: "ai" is stored under the "je"\n'
        '// key and the app renders "j\'ai".  `aspirateH: true` marks verbs whose\n'
        '// initial h blocks elision (je hais).  Reflexive-pronoun elision\n'
        '// ("m\'appelle") is part of the form and IS stored.\n'
        % (len(picked), max(len(e['tenses']) for e in picked), total_forms, args.limit)
    )

    body = json.dumps(picked, ensure_ascii=False, separators=(',', ':'))
    js = (header +
          '\n(function () {\n  \'use strict\';\n\n'
          '  const FRENCH_CONJUGATION_DATA = ' + body + ';\n\n'
          '  if (typeof window !== \'undefined\') {\n'
          '    window.FRENCH_CONJUGATION_DATA = FRENCH_CONJUGATION_DATA;\n  }\n\n'
          '  if (typeof module !== \'undefined\' && module.exports) {\n'
          '    module.exports = FRENCH_CONJUGATION_DATA;\n  }\n' +
          ''.join('  ' + l if l.strip() else l
                  for l in register_footer('conjugations', 'fr', 'FRENCH_CONJUGATION_DATA').splitlines(True)) +
          '})();\n')
    with open(args.out, 'w', encoding='utf-8') as f:
        f.write(js)

    print('wrote %s (%.1f MB)' % (args.out, os.path.getsize(args.out) / 1e6))
    print('verbs: %d, non-empty forms: %d' % (len(picked), total_forms))
    print('form origin:', dict(origin_counter))
    print('stats:', dict(sorted(stats.items())))
    print('auxiliary distribution:', dict(Counter(e['auxiliary'] for e in picked)))
    print('tense-group counts:', dict(sorted(Counter(len(e['tenses']) for e in picked).items())))
    print('paradigm classes represented: %d of %d'
          % (len(set(e['model'] for e in picked)), len(classes)))
    print('aspirate-h verbs: %s' % sorted(e['infinitive'] for e in picked if e.get('aspirateH')))
    print('rejected candidates: %d -> %s' % (len(rejects), rejects[:40]))
    # 落盘的是旧（逐动词 forms 对象）形状；统一转成 conjugations/1（docs/data-schema.md）
    if os.path.abspath(args.out) == os.path.abspath(OUT_PATH):
        import canonical_conjugations
        canonical_conjugations.canonicalize('fr')

    # side-car report used by the validator for cross-checking
    with open(os.path.join(work, 'build-report.json'), 'w', encoding='utf-8') as f:
        json.dump({'stats': dict(stats), 'verbs': len(picked), 'forms': total_forms,
                   'classes': len(classes), 'rejects': rejects},
                  f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
