#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the German "extras" datasets for Dimenticato.

Emits three files, all mirroring the shapes of their Italian counterparts:

  data/german-collocations-data.js  -> window.GERMAN_COLLOCATIONS_DATA
        Same shape as VERB_COLLOCATIONS_DATA ({meta, verbs, prepositions}), with
        the preposition key carrying the governed case ("auf +A", "an +D"),
        because in German the case is part of the collocation.
        A second, structurally identical sub-dataset `.nounVerb` holds
        Funktionsverbgefuege / Nomen-Verb-Verbindungen keyed noun -> light verb.

  data/german-cognates.js           -> window.GERMAN_COGNATE_DATA
        Same shape as COGNATE_DATA with `german` replacing `italian`, plus the
        additive `falseFriend` / `pos` / `englishGloss` fields.

  data/german-course-data.js        -> GERMAN_COURSE_DATA
        The existing 54-unit A1-C1 course, enriched with grammar-book slugs,
        per-unit example sentences and 40+ practice headwords per unit.

Sources (all permissive, recorded per entry in the emitted data):
  * Tatoeba deu-cmn sentence pairs   - CC BY 2.0 FR  (https://tatoeba.org)
  * data/german-vocabulary.js        - in-repo (deutsch-data, PGH word list)
  * data/english-vocabulary.js       - in-repo (wordfreq + EnWords/ECDICT)
  * Rektion / Funktionsverbgefuege tables, false-friend notes, course copy:
    originally authored for this application (no dictionary was scraped).

Usage:
    python3 scripts/build_german_extras.py            # uses cached /tmp corpus
    python3 scripts/build_german_extras.py --fetch    # (re)download Tatoeba
"""

import argparse
import bz2
import csv
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
CACHE = os.environ.get('DE_EXTRAS_CACHE', '/tmp')

TATOEBA = 'Tatoeba CC BY 2.0 FR'
AUTHORED = 'Dimenticato (authored)'

# --------------------------------------------------------------------------
# 1. Verben mit festen Praepositionen (Rektion)
#    verb | preposition | case | english | chinese | pattern phrase | phrase zh | level
#    "case" is A (Akkusativ), D (Dativ) or G (Genitiv).
# --------------------------------------------------------------------------

REKTION = r"""
# --- an + Akkusativ ---
denken|an|A|to think of|想起，想到|an die Zukunft denken|想到未来|A2
sich erinnern|an|A|to remember|回忆起|sich an die Kindheit erinnern|回忆起童年|B1
erinnern|an|A|to remind sb of|提醒，使想起|jemanden an den Termin erinnern|提醒某人有约|B1
sich gewöhnen|an|A|to get used to|习惯于|sich an das Klima gewöhnen|习惯这里的气候|B1
glauben|an|A|to believe in|相信，信仰|an das Gute glauben|相信善良|B1
sich wenden|an|A|to turn to sb|求助于，找某人|sich an den Chef wenden|去找老板|B2
schreiben|an|A|to write to sb|写信给|einen Brief an die Firma schreiben|给公司写信|A2
sich richten|an|A|to be addressed to|面向，针对|Das Angebot richtet sich an Studenten|该优惠面向学生|B2
appellieren|an|A|to appeal to|呼吁，诉诸|an die Vernunft appellieren|诉诸理性|C1
sich anpassen|an|A|to adapt to|适应|sich an neue Regeln anpassen|适应新规则|B2
grenzen|an|A|to border on|与…接壤|Deutschland grenzt an Polen|德国与波兰接壤|B2
sich klammern|an|A|to cling to|紧抓不放|sich an die Hoffnung klammern|抓住希望不放|C1
liefern|an|A|to deliver to|交付给|Waren an den Kunden liefern|把货交给客户|B2
verkaufen|an|A|to sell to|卖给|das Auto an einen Freund verkaufen|把车卖给朋友|B1
sich gewöhnen|an|A|to get used to|习惯于|sich an den Lärm gewöhnen|习惯噪音|B1

# --- an + Dativ ---
teilnehmen|an|D|to take part in|参加|an einem Kurs teilnehmen|参加课程|B1
arbeiten|an|D|to work on|从事，忙于|an einem Projekt arbeiten|做一个项目|B1
leiden|an|D|to suffer from (an illness)|患（病）|an einer Grippe leiden|患流感|B2
sterben|an|D|to die of|死于|an einer Krankheit sterben|死于疾病|B1
zweifeln|an|D|to doubt|怀疑|an seinen Worten zweifeln|怀疑他的话|B2
erkennen|an|D|to recognize by|凭…认出|jemanden an der Stimme erkennen|凭声音认出某人|B2
liegen|an|D|to be due to|原因在于|Es liegt am Wetter|这是天气的原因|B1
hindern|an|D|to prevent from|阻止|jemanden an der Arbeit hindern|妨碍某人工作|B2
sich beteiligen|an|D|to participate in|参与|sich an der Diskussion beteiligen|参与讨论|B2
sich orientieren|an|D|to take one's bearings from|以…为准|sich an den Vorgaben orientieren|以规定为准|C1
sich rächen|an|D|to take revenge on|向…报复|sich an dem Gegner rächen|向对手报复|C1
mangeln|an|D|to be lacking in|缺少|Es mangelt an Zeit|缺少时间|C1
fehlen|an|D|to be short of|缺乏|Es fehlt an Personal|人手不足|B2
zunehmen|an|D|to increase in|在…方面增加|an Gewicht zunehmen|体重增加|B2
sich erfreuen|an|D|to take pleasure in|以…为乐|sich an der Musik erfreuen|欣赏音乐|C1
sich beteiligen|an|D|to have a share in|参股，参与|sich an der Firma beteiligen|参股这家公司|B2
zunehmen|an|D|to gain in|增长|an Bedeutung zunehmen|变得更重要|C1

# --- auf + Akkusativ ---
warten|auf|A|to wait for|等待|auf den Bus warten|等公交车|A1
sich freuen|auf|A|to look forward to|期待（未来的事）|sich auf den Urlaub freuen|期待假期|A2
hoffen|auf|A|to hope for|盼望，希望得到|auf besseres Wetter hoffen|盼望天气转好|B1
achten|auf|A|to pay attention to|注意|auf die Gesundheit achten|注意健康|B1
aufpassen|auf|A|to look after|照看|auf das Kind aufpassen|照看孩子|A2
sich verlassen|auf|A|to rely on|依靠，信赖|sich auf einen Freund verlassen|信赖朋友|B1
sich vorbereiten|auf|A|to prepare for|为…做准备|sich auf die Prüfung vorbereiten|准备考试|B1
sich konzentrieren|auf|A|to concentrate on|集中于|sich auf die Arbeit konzentrieren|专心工作|B1
sich beziehen|auf|A|to refer to|涉及，参照|sich auf Ihr Schreiben beziehen|参照您的来信|B2
verzichten|auf|A|to do without|放弃|auf Zucker verzichten|不吃糖|B2
reagieren|auf|A|to react to|对…做出反应|auf die Kritik reagieren|回应批评|B1
antworten|auf|A|to answer sth|回答|auf die Frage antworten|回答问题|A2
ankommen|auf|A|to depend on|取决于|Es kommt auf das Wetter an|这取决于天气|B1
sich einigen|auf|A|to agree on|商定|sich auf einen Termin einigen|商定日期|B2
hinweisen|auf|A|to point out|指出|auf die Gefahr hinweisen|指出危险|B2
sich beschränken|auf|A|to be limited to|限于|sich auf das Wichtigste beschränken|只讲重点|C1
drängen|auf|A|to press for|催促|auf eine Antwort drängen|催要答复|C1
sich spezialisieren|auf|A|to specialize in|专门从事|sich auf Kinderheilkunde spezialisieren|专攻儿科|C1
zurückführen|auf|A|to attribute to|归因于|den Fehler auf Stress zurückführen|把错误归因于压力|C1
sich stürzen|auf|A|to pounce on|扑向|sich auf das Essen stürzen|扑向食物|C1
schießen|auf|A|to shoot at|向…射击|auf das Ziel schießen|向目标射击|B2
zielen|auf|A|to aim at|瞄准，以…为目标|auf den Erfolg zielen|以成功为目标|C1
sich einlassen|auf|A|to get involved in|涉足，答应|sich auf ein Risiko einlassen|冒险一试|C1
aufmerksam machen|auf|A|to draw attention to|提请注意|auf ein Problem aufmerksam machen|提请注意问题|B2
Wert legen|auf|A|to attach importance to|重视|auf Pünktlichkeit Wert legen|重视守时|B2
Rücksicht nehmen|auf|A|to show consideration for|体谅|auf die Nachbarn Rücksicht nehmen|体谅邻居|B2
Einfluss nehmen|auf|A|to influence|施加影响|auf die Entscheidung Einfluss nehmen|影响决定|C1
sich auswirken|auf|A|to have an effect on|对…产生影响|sich auf die Preise auswirken|影响价格|C1
sich berufen|auf|A|to invoke|援引|sich auf das Gesetz berufen|援引法律|C1
anspielen|auf|A|to allude to|暗指|auf den Streit anspielen|影射那场争吵|C1
trinken|auf|A|to drink to|为…干杯|auf die Gesundheit trinken|为健康干杯|B1
antworten|auf|A|to reply to|答复|auf den Brief antworten|回信|A2

# --- auf + Dativ ---
bestehen|auf|D|to insist on|坚持|auf seinem Recht bestehen|坚持自己的权利|B2
beruhen|auf|D|to be based on|基于|auf einem Irrtum beruhen|基于误会|C1
basieren|auf|D|to be based on|以…为基础|auf Fakten basieren|以事实为基础|C1
beharren|auf|D|to persist in|固执于|auf seiner Meinung beharren|坚持己见|C1

# --- aus + Dativ ---
bestehen|aus|D|to consist of|由…组成|Die Wohnung besteht aus drei Zimmern|住房由三个房间组成|B1
folgen|aus|D|to follow from|由…得出|Daraus folgt ein neues Problem|由此产生一个新问题|C1
sich ergeben|aus|D|to result from|由…产生|Das ergibt sich aus dem Vertrag|这由合同得出|C1
stammen|aus|D|to come from|来自，出身于|aus einer kleinen Stadt stammen|来自一个小城|B1
resultieren|aus|D|to result from|源于|Der Streit resultiert aus einem Missverständnis|争执源于误会|C1
schließen|aus|D|to conclude from|由…推断|aus dem Verhalten schließen|从行为推断|C1
sich zusammensetzen|aus|D|to be composed of|由…构成|Das Team setzt sich aus Experten zusammen|团队由专家构成|C1
lernen|aus|D|to learn from|从…中吸取|aus Fehlern lernen|从错误中学习|B1

# --- bei + Dativ ---
sich bedanken|bei|D|to thank sb|向某人道谢|sich bei dem Kollegen bedanken|向同事道谢|B1
sich entschuldigen|bei|D|to apologize to sb|向某人道歉|sich bei der Lehrerin entschuldigen|向老师道歉|A2
sich beschweren|bei|D|to complain to sb|向某人投诉|sich beim Chef beschweren|向老板投诉|B1
helfen|bei|D|to help with|在…上帮忙|beim Umzug helfen|帮忙搬家|A2
sich erkundigen|bei|D|to inquire of sb|向某人打听|sich bei der Auskunft erkundigen|向问询处打听|B2
bleiben|bei|D|to stick to|坚持|bei seiner Meinung bleiben|坚持自己的看法|B1
sich melden|bei|D|to report to|向…报到，联系|sich beim Amt melden|去局里报到|B1
unterstützen|bei|D|to support with|在…上支持|jemanden bei der Arbeit unterstützen|在工作上支持某人|B2
sich bewerben|bei|D|to apply to (a company)|向（公司）求职|sich bei einer Firma bewerben|向一家公司求职|B1

# --- durch + Akkusativ ---
sich auszeichnen|durch|A|to be distinguished by|以…见长|sich durch Qualität auszeichnen|以质量见长|C1
ersetzen|durch|A|to replace with|用…代替|Öl durch Gas ersetzen|用天然气代替石油|B2

# --- für + Akkusativ ---
sich interessieren|für|A|to be interested in|对…感兴趣|sich für Musik interessieren|对音乐感兴趣|A2
danken|für|A|to thank for|因…而感谢|für die Hilfe danken|感谢帮助|A2
sich bedanken|für|A|to say thanks for|为…道谢|sich für das Geschenk bedanken|为礼物道谢|B1
sich entscheiden|für|A|to decide on|决定选择|sich für den blauen Mantel entscheiden|决定买蓝大衣|B1
sorgen|für|A|to take care of|照顾，负责|für die Familie sorgen|养家|B1
sich engagieren|für|A|to be committed to|致力于|sich für den Umweltschutz engagieren|投身环保|C1
kämpfen|für|A|to fight for|为…而奋斗|für die Freiheit kämpfen|为自由而战|B2
sich eignen|für|A|to be suitable for|适合|Der Film eignet sich für Kinder|这部电影适合儿童|B2
halten|für|A|to consider sb/sth to be|认为是|jemanden für ehrlich halten|认为某人诚实|B1
sich entschuldigen|für|A|to apologize for|为…道歉|sich für die Verspätung entschuldigen|为迟到道歉|B1
ausgeben|für|A|to spend on|花在…上|Geld für Bücher ausgeben|把钱花在书上|B1
sich einsetzen|für|A|to stand up for|为…出力|sich für die Kollegen einsetzen|为同事出面|C1
sich schämen|für|A|to be ashamed of|为…羞愧|sich für sein Verhalten schämen|为自己的行为羞愧|B2
sich begeistern|für|A|to be enthusiastic about|热衷于|sich für Fußball begeistern|热衷足球|B2
stimmen|für|A|to vote for|投票赞成|für den Vorschlag stimmen|投票赞成提案|B2
plädieren|für|A|to plead for|主张|für eine schnelle Lösung plädieren|主张尽快解决|C1
werben|für|A|to advertise|为…做宣传|für ein Produkt werben|为产品做广告|B2

# --- gegen + Akkusativ ---
protestieren|gegen|A|to protest against|抗议|gegen den Krieg protestieren|抗议战争|B2
kämpfen|gegen|A|to fight against|与…斗争|gegen die Krankheit kämpfen|与疾病斗争|B2
sich wehren|gegen|A|to defend oneself against|抵抗，反驳|sich gegen die Vorwürfe wehren|反驳指责|C1
verstoßen|gegen|A|to violate|违反|gegen die Regeln verstoßen|违反规则|C1
sich entscheiden|gegen|A|to decide against|决定不选|sich gegen den Umzug entscheiden|决定不搬家|B2
stimmen|gegen|A|to vote against|投票反对|gegen das Gesetz stimmen|投票反对法律|B2
klagen|gegen|A|to sue|起诉|gegen die Firma klagen|起诉那家公司|C1
demonstrieren|gegen|A|to demonstrate against|游行反对|gegen die Politik demonstrieren|游行反对政策|B2
sich richten|gegen|A|to be directed against|针对|Die Kritik richtet sich gegen den Plan|批评针对该计划|C1
sich versichern|gegen|A|to insure oneself against|投保|sich gegen Diebstahl versichern|投保防盗|B2
helfen|gegen|A|to help against|对…有效|Das Mittel hilft gegen Kopfschmerzen|这药治头疼|B1

# --- in + Akkusativ ---
sich verlieben|in|A|to fall in love with|爱上|sich in eine Kollegin verlieben|爱上一位同事|B1
einwilligen|in|A|to consent to|同意|in den Vorschlag einwilligen|同意该建议|C1
geraten|in|A|to get into|陷入|in Schwierigkeiten geraten|陷入困境|B2
sich einmischen|in|A|to interfere in|干涉|sich in fremde Angelegenheiten einmischen|干涉别人的事|C1
eingreifen|in|A|to intervene in|干预|in die Diskussion eingreifen|介入讨论|C1
sich verwandeln|in|A|to turn into|变成|sich in einen Frosch verwandeln|变成青蛙|B2
übersetzen|in|A|to translate into|译成|den Text ins Deutsche übersetzen|把课文译成德语|B1
einführen|in|A|to introduce sb to|带…熟悉|jemanden in die Arbeit einführen|带某人熟悉工作|B2
investieren|in|A|to invest in|投资于|in erneuerbare Energien investieren|投资可再生能源|B2
sich einarbeiten|in|A|to get familiar with|熟悉（新工作）|sich in das Thema einarbeiten|熟悉这个课题|C1

# --- in + Dativ ---
bestehen|in|D|to consist in|在于|Das Problem besteht in den Kosten|问题在于费用|C1
sich irren|in|D|to be mistaken about|在…上弄错|sich in der Adresse irren|把地址弄错|B2
sich täuschen|in|D|to be deceived about|看错|sich in einem Menschen täuschen|看错了人|C1
sich auskennen|in|D|to know one's way around|熟悉|sich in der Stadt auskennen|熟悉这座城市|B1
unterrichten|in|D|to teach (a subject)|教授|in Mathematik unterrichten|教数学|B1
sich üben|in|D|to practise|练习|sich in Geduld üben|练习耐心|C1

# --- mit + Dativ ---
sich beschäftigen|mit|D|to occupy oneself with|从事，研究|sich mit Geschichte beschäftigen|研究历史|B1
rechnen|mit|D|to reckon with|预计，估计到|mit Regen rechnen|预计会下雨|B2
anfangen|mit|D|to start with|以…开始|mit der Arbeit anfangen|开始工作|A2
beginnen|mit|D|to begin with|开始|mit dem Kurs beginnen|开始课程|A2
aufhören|mit|D|to stop doing|停止|mit dem Rauchen aufhören|戒烟|A2
sich unterhalten|mit|D|to converse with|与…交谈|sich mit dem Nachbarn unterhalten|和邻居聊天|B1
sprechen|mit|D|to speak with|与…谈话|mit dem Arzt sprechen|和医生谈|A1
sich treffen|mit|D|to meet with|与…见面|sich mit Freunden treffen|和朋友见面|A2
telefonieren|mit|D|to phone sb|与…通电话|mit den Eltern telefonieren|给父母打电话|A2
sich verstehen|mit|D|to get along with|与…相处|sich mit den Kollegen gut verstehen|和同事相处得好|B1
sich abfinden|mit|D|to come to terms with|接受（现实）|sich mit der Lage abfinden|接受现状|C1
vergleichen|mit|D|to compare with|与…比较|die Preise mit dem Angebot vergleichen|与报价比较|B1
sich befassen|mit|D|to deal with|处理，研究|sich mit dem Antrag befassen|处理申请|C1
sich begnügen|mit|D|to be content with|满足于|sich mit wenig begnügen|知足|C1
sich streiten|mit|D|to quarrel with|与…争吵|sich mit dem Bruder streiten|和哥哥吵架|B1
verbinden|mit|D|to connect with|与…联系起来|Erfolg mit Fleiß verbinden|把成功与勤奋联系起来|B2
übereinstimmen|mit|D|to agree with|与…一致|mit der Aussage übereinstimmen|与该说法一致|C1
sich verabreden|mit|D|to arrange to meet|与…约好|sich mit dem Kunden verabreden|与客户约好|B1
zusammenhängen|mit|D|to be connected with|与…有关|Das hängt mit dem Wetter zusammen|这与天气有关|B2
sich auseinandersetzen|mit|D|to engage critically with|深入探讨|sich mit dem Thema auseinandersetzen|深入探讨这个题目|C1
sich anfreunden|mit|D|to make friends with|与…交朋友|sich mit den Nachbarn anfreunden|与邻居交上朋友|B2
umgehen|mit|D|to handle|对待，使用|mit Geld sparsam umgehen|花钱节省|B2
sich identifizieren|mit|D|to identify with|认同|sich mit der Firma identifizieren|认同这家公司|C1
sich versöhnen|mit|D|to reconcile with|与…和解|sich mit dem Freund versöhnen|与朋友和好|B2

# --- nach + Dativ ---
fragen|nach|D|to ask for/about|询问|nach dem Weg fragen|问路|A1
suchen|nach|D|to search for|寻找|nach dem Schlüssel suchen|找钥匙|A2
sich sehnen|nach|D|to long for|渴望|sich nach Ruhe sehnen|渴望安静|C1
riechen|nach|D|to smell of|闻起来有…味|nach Kaffee riechen|有咖啡味|B1
schmecken|nach|D|to taste of|尝起来有…味|nach Zitrone schmecken|有柠檬味|B1
streben|nach|D|to strive for|追求|nach Erfolg streben|追求成功|C1
sich erkundigen|nach|D|to inquire about|打听|sich nach dem Preis erkundigen|打听价格|B2
greifen|nach|D|to reach for|伸手去拿|nach dem Glas greifen|去拿杯子|B2
rufen|nach|D|to call for|呼唤|nach dem Kellner rufen|叫服务员|B1
klingen|nach|D|to sound like|听起来像|nach einer guten Idee klingen|听起来是个好主意|B2
sich richten|nach|D|to go by|依照|sich nach den Regeln richten|按规定办|B2
urteilen|nach|D|to judge by|据…判断|nach dem Aussehen urteilen|以貌取人|C1
verlangen|nach|D|to crave|渴求|nach Wasser verlangen|想喝水|C1
forschen|nach|D|to research into|探究|nach den Ursachen forschen|探究原因|C1
duften|nach|D|to smell (pleasantly) of|散发…香味|nach Blumen duften|散发花香|B2
aussehen|nach|D|to look like|看起来像|Es sieht nach Regen aus|看样子要下雨|B1

# --- über + Akkusativ ---
sich freuen|über|A|to be glad about|为…高兴（已发生的事）|sich über das Geschenk freuen|为礼物高兴|A2
sich ärgern|über|A|to be annoyed about|对…生气|sich über den Lärm ärgern|因噪音生气|B1
sich beschweren|über|A|to complain about|抱怨|sich über den Service beschweren|抱怨服务|B1
sprechen|über|A|to talk about|谈论|über die Arbeit sprechen|谈工作|A2
reden|über|A|to talk about|谈论|über Politik reden|谈政治|A2
diskutieren|über|A|to discuss|讨论|über den Plan diskutieren|讨论计划|B1
nachdenken|über|A|to think about|思考|über die Zukunft nachdenken|思考未来|B1
sich informieren|über|A|to get information about|了解|sich über den Kurs informieren|了解课程|B1
sich wundern|über|A|to be surprised at|对…感到奇怪|sich über die Antwort wundern|对答复感到奇怪|B2
lachen|über|A|to laugh at|笑，嘲笑|über den Witz lachen|笑这个笑话|A2
sich aufregen|über|A|to get worked up about|为…激动生气|sich über den Verkehr aufregen|为交通生气|B2
klagen|über|A|to complain of|诉说（不适）|über Kopfschmerzen klagen|诉说头疼|B2
berichten|über|A|to report on|报道|über das Konzert berichten|报道音乐会|B1
schreiben|über|A|to write about|写关于…的文章|über seine Reise schreiben|写他的旅行|A2
verfügen|über|A|to have at one's disposal|拥有，支配|über viel Erfahrung verfügen|拥有丰富经验|C1
entscheiden|über|A|to decide on|对…做决定|über den Antrag entscheiden|对申请做出决定|B2
sich streiten|über|A|to argue about|为…争论|über die Kosten streiten|为费用争论|B2
sich beklagen|über|A|to complain about|埋怨|sich über das Essen beklagen|埋怨饭菜|C1
staunen|über|A|to marvel at|惊叹|über die Technik staunen|惊叹于技术|B2
herrschen|über|A|to rule over|统治|über ein Land herrschen|统治一个国家|C1
sich einigen|über|A|to come to an agreement on|就…达成一致|sich über den Preis einigen|就价格达成一致|B2
urteilen|über|A|to pass judgement on|评判|über andere urteilen|评判他人|C1
sich lustig machen|über|A|to make fun of|取笑|sich über den Nachbarn lustig machen|取笑邻居|B2
informieren|über|A|to inform about|通知|die Kunden über Änderungen informieren|通知客户变动|B1
sich unterhalten|über|A|to talk about|谈论|sich über den Film unterhalten|谈论这部电影|B1
verhandeln|über|A|to negotiate about|就…谈判|über den Vertrag verhandeln|就合同谈判|C1
sich Gedanken machen|über|A|to think about|考虑|sich Gedanken über die Zukunft machen|考虑未来|B2
Bescheid wissen|über|A|to be informed about|了解，知情|über die Regeln Bescheid wissen|了解规定|B2

# --- um + Akkusativ ---
sich kümmern|um|A|to take care of|照料|sich um die Kinder kümmern|照料孩子|B1
sich bewerben|um|A|to apply for|申请|sich um eine Stelle bewerben|申请职位|B1
bitten|um|A|to ask for|请求|um Hilfe bitten|请求帮助|A2
sich handeln|um|A|to be a matter of|涉及，是|Es handelt sich um einen Irrtum|这是个误会|B2
sich sorgen|um|A|to worry about|担心|sich um die Eltern sorgen|担心父母|B2
kämpfen|um|A|to fight for|争取|um den Sieg kämpfen|争取胜利|B2
sich streiten|um|A|to fight over|争夺|sich um das Erbe streiten|争夺遗产|B2
sich drehen|um|A|to be about|围绕|Alles dreht sich um Geld|一切都围着钱转|B2
gehen|um|A|to be about|事关|Es geht um die Sicherheit|事关安全|B1
sich bemühen|um|A|to make an effort for|努力争取|sich um eine Lösung bemühen|努力寻求解决办法|B2
beneiden|um|A|to envy for|羡慕|jemanden um seinen Erfolg beneiden|羡慕某人的成功|C1
bringen|um|A|to deprive of|使失去|jemanden um den Schlaf bringen|让某人睡不着|C1
betrügen|um|A|to cheat out of|骗取|jemanden um sein Geld betrügen|骗某人的钱|C1
sich Sorgen machen|um|A|to be worried about|为…担心|sich Sorgen um die Prüfung machen|为考试担心|B1

# --- unter + Dativ ---
leiden|unter|D|to suffer from (conditions)|因…而痛苦|unter dem Lärm leiden|受噪音之苦|B2
verstehen|unter|D|to understand by|把…理解为|Was verstehst du unter Freiheit|你怎么理解自由|C1
sich vorstellen|unter|D|to imagine by|对…的设想|Was stellst du dir unter Glück vor|你心目中的幸福是什么|C1

# --- von + Dativ ---
abhängen|von|D|to depend on|取决于|vom Wetter abhängen|取决于天气|B1
träumen|von|D|to dream of|梦想，梦见|von einer Reise träumen|梦想去旅行|B1
erzählen|von|D|to tell about|讲述|von seinem Urlaub erzählen|讲他的假期|A2
sprechen|von|D|to speak of|谈到|von einem Problem sprechen|谈到一个问题|B1
halten|von|D|to think of (opinion)|对…的看法|Was hältst du von dem Plan|你觉得这个计划怎么样|B1
sich verabschieden|von|D|to say goodbye to|向…告别|sich von den Gästen verabschieden|向客人告别|B1
überzeugen|von|D|to convince of|使相信|jemanden von der Idee überzeugen|说服某人接受这个想法|B2
sich erholen|von|D|to recover from|从…中恢复|sich von der Krankheit erholen|病后康复|B1
profitieren|von|D|to benefit from|从中获益|von der Erfahrung profitieren|从经验中获益|B2
leben|von|D|to live on|靠…生活|von seinem Gehalt leben|靠工资生活|B1
hören|von|D|to hear about|听说|von dem Unfall hören|听说这起事故|A2
handeln|von|D|to be about|内容是|Das Buch handelt von der Liebe|这本书讲爱情|B1
ausgehen|von|D|to assume|以…为出发点，认为|von einem Irrtum ausgehen|认为是个误会|C1
sich unterscheiden|von|D|to differ from|与…不同|sich von anderen unterscheiden|与众不同|B2
abraten|von|D|to advise against|劝阻|von dem Kauf abraten|劝其别买|C1
berichten|von|D|to report about|讲述|von der Reise berichten|讲述旅行|B1
absehen|von|D|to refrain from|放弃，不予考虑|von einer Klage absehen|放弃起诉|C1
sich distanzieren|von|D|to distance oneself from|与…划清界限|sich von der Aussage distanzieren|与该言论划清界限|C1
sich trennen|von|D|to part with|与…分开|sich von alten Sachen trennen|处理掉旧东西|B2
befreien|von|D|to free from|使摆脱|jemanden von einer Pflicht befreien|免除某人的义务|C1
abweichen|von|D|to deviate from|偏离|vom Thema abweichen|偏离主题|C1
wissen|von|D|to know about|知道|nichts von dem Plan wissen|对计划毫不知情|B1

# --- vor + Dativ ---
Angst haben|vor|D|to be afraid of|害怕|Angst vor dem Hund haben|怕狗|A2
sich fürchten|vor|D|to be afraid of|害怕|sich vor der Prüfung fürchten|害怕考试|B1
warnen|vor|D|to warn about|警告|vor dem Sturm warnen|警告有风暴|B2
schützen|vor|D|to protect from|保护免受|sich vor der Sonne schützen|防晒|B1
sich verstecken|vor|D|to hide from|躲避|sich vor dem Lehrer verstecken|躲着老师|B1
fliehen|vor|D|to flee from|逃离|vor dem Krieg fliehen|逃离战争|B2
sich ekeln|vor|D|to be disgusted by|对…厌恶|sich vor Spinnen ekeln|讨厌蜘蛛|C1
erschrecken|vor|D|to be startled by|被…吓到|vor dem Hund erschrecken|被狗吓到|B2
sich hüten|vor|D|to beware of|提防|sich vor falschen Freunden hüten|提防假朋友|C1
retten|vor|D|to save from|救出|jemanden vor dem Ertrinken retten|救人于溺水|B2
zittern|vor|D|to tremble with|因…发抖|vor Kälte zittern|冻得发抖|B2
Respekt haben|vor|D|to have respect for|尊敬|Respekt vor den Eltern haben|尊敬父母|B2

# --- zu + Dativ ---
gehören|zu|D|to belong to|属于|zur Familie gehören|属于这个家|A2
führen|zu|D|to lead to|导致|zu Problemen führen|导致问题|B1
passen|zu|D|to go with|与…相配|Die Jacke passt zu der Hose|上衣和裤子很配|A2
gratulieren|zu|D|to congratulate on|祝贺|zum Geburtstag gratulieren|祝贺生日|A2
einladen|zu|D|to invite to|邀请参加|zum Essen einladen|请吃饭|A2
sich entschließen|zu|D|to decide on|决心|sich zu einem Umzug entschließen|决定搬家|B2
beitragen|zu|D|to contribute to|对…有贡献|zum Erfolg beitragen|为成功做贡献|B2
zwingen|zu|D|to force to|迫使|jemanden zum Verkauf zwingen|迫使某人卖掉|B2
überreden|zu|D|to persuade to|说服做|jemanden zum Mitkommen überreden|说服某人一起来|B2
dienen|zu|D|to serve for|用于|Das dient zur Sicherheit|这是为了安全|B2
neigen|zu|D|to tend to|倾向于|zu Übertreibungen neigen|爱夸张|C1
sich äußern|zu|D|to comment on|就…发表意见|sich zu dem Vorfall äußern|就此事发表看法|C1
auffordern|zu|D|to call on to|要求|jemanden zur Mitarbeit auffordern|要求某人合作|C1
verurteilen|zu|D|to sentence to|判处|zu einer Geldstrafe verurteilen|判处罚金|C1
raten|zu|D|to advise to|建议|zu einer Pause raten|建议休息一下|B2
werden|zu|D|to turn into|变成|Das Wasser wird zu Eis|水变成冰|B1
wählen|zu|D|to elect as|选为|jemanden zum Vorsitzenden wählen|选某人为主席|C1
ernennen|zu|D|to appoint as|任命为|jemanden zum Direktor ernennen|任命某人为主任|C1
Stellung nehmen|zu|D|to take a position on|就…表态|zu dem Vorwurf Stellung nehmen|就指责表态|C1
kommen|zu|D|to arrive at (a result)|得出|zu einem Ergebnis kommen|得出结果|B2
sich entwickeln|zu|D|to develop into|发展成|sich zu einem Problem entwickeln|发展成一个问题|B2
zählen|zu|D|to be among|属于…之列|zu den Besten zählen|属于最好的之列|B2
sich bekennen|zu|D|to profess|公开承认|sich zu seinem Fehler bekennen|公开承认错误|C1
"""

# --------------------------------------------------------------------------
# 2. Funktionsverbgefuege / Nomen-Verb-Verbindungen
#    noun | light verb | english | chinese | phrase | phrase zh | level
#    Keyed noun -> verb so the shared renderer groups by the light verb, which
#    is exactly the axis a learner has to drill ("eine Entscheidung ___").
# --------------------------------------------------------------------------

FVG = r"""
Entscheidung|treffen|to make a decision|做出决定|eine Entscheidung treffen|做出决定|B1
Entscheidung|fällen|to render a decision|作出裁决|eine Entscheidung fällen|作出裁决|C1
Frage|stellen|to ask a question|提问|eine Frage stellen|提问|A2
Frage|kommen|to be an option|可以考虑|in Frage kommen|可以考虑|B2
Frage|stellen|to call into question|提出质疑|etwas in Frage stellen|对某事提出质疑|B2
Antrag|stellen|to file an application|提出申请|einen Antrag stellen|提出申请|B2
Kritik|üben|to criticize|提出批评|Kritik üben|提出批评|C1
Rücksicht|nehmen|to show consideration|体谅|Rücksicht nehmen|体谅别人|B2
Abschied|nehmen|to say farewell|告别|Abschied nehmen|告别|B2
Platz|nehmen|to take a seat|就座|Platz nehmen|请坐|B1
Einfluss|nehmen|to exert influence|施加影响|Einfluss nehmen|施加影响|C1
Stellung|nehmen|to state one's position|表态|Stellung nehmen|表明立场|C1
Urlaub|nehmen|to take leave|休假|Urlaub nehmen|休假|B1
Rache|nehmen|to take revenge|复仇|Rache nehmen|复仇|C1
Verantwortung|übernehmen|to take responsibility|承担责任|Verantwortung übernehmen|承担责任|B2
Verantwortung|tragen|to bear responsibility|负有责任|Verantwortung tragen|负有责任|B2
Aufmerksamkeit|schenken|to pay attention|加以关注|jemandem Aufmerksamkeit schenken|关注某人|C1
Vertrauen|schenken|to place trust in|给予信任|jemandem Vertrauen schenken|信任某人|C1
Glauben|schenken|to give credence to|相信|einer Aussage Glauben schenken|相信某种说法|C1
Beachtung|schenken|to pay heed to|加以重视|einem Hinweis Beachtung schenken|重视提示|C1
Rede|halten|to give a speech|发表演讲|eine Rede halten|发表演讲|B2
Vortrag|halten|to give a talk|作报告|einen Vortrag halten|作报告|B2
Versprechen|halten|to keep a promise|信守承诺|ein Versprechen halten|信守承诺|B1
Ordnung|halten|to keep things tidy|保持整洁|Ordnung halten|保持整洁|B1
Diät|halten|to keep to a diet|节食|Diät halten|节食|B2
Frieden|schließen|to make peace|讲和|Frieden schließen|讲和|C1
Vertrag|schließen|to conclude a contract|签订合同|einen Vertrag schließen|签订合同|B2
Freundschaft|schließen|to strike up a friendship|结交朋友|Freundschaft schließen|结交朋友|B2
Kompromiss|schließen|to reach a compromise|达成妥协|einen Kompromiss schließen|达成妥协|C1
Antwort|geben|to give an answer|给出答复|eine Antwort geben|给出答复|A2
Auskunft|geben|to give information|提供信息|Auskunft geben|提供信息|B2
Rat|geben|to give advice|提出建议|einen Rat geben|提出建议|B1
Mühe|geben|to make an effort|努力|sich Mühe geben|努力|B1
Bescheid|geben|to let sb know|告知|Bescheid geben|告知一声|B1
Erlaubnis|geben|to give permission|准许|die Erlaubnis geben|准许|B2
Bescheid|wissen|to be in the know|知情|Bescheid wissen|知情|B2
Angst|haben|to be afraid|害怕|Angst haben|害怕|A2
Recht|haben|to be right|说得对|Recht haben|说得对|A2
Hunger|haben|to be hungry|饿|Hunger haben|肚子饿|A1
Zeit|haben|to have time|有空|Zeit haben|有时间|A1
Lust|haben|to feel like|有兴致|Lust haben|想要，有兴致|A2
Erfolg|haben|to be successful|取得成功|Erfolg haben|取得成功|B1
Glück|haben|to be lucky|走运|Glück haben|运气好|A2
Geduld|haben|to be patient|有耐心|Geduld haben|有耐心|B1
Ahnung|haben|to have a clue|了解，知道|keine Ahnung haben|一无所知|B1
Eile|haben|to be in a hurry|着急|Es hat keine Eile|不急|B2
Sorgen|machen|to worry|担心|sich Sorgen machen|担心|B1
Gedanken|machen|to think sth over|考虑|sich Gedanken machen|仔细考虑|B2
Vorwürfe|machen|to reproach|责备|jemandem Vorwürfe machen|责备某人|C1
Mut|machen|to encourage|鼓励|jemandem Mut machen|给某人鼓劲|B2
Spaß|machen|to be fun|使人开心|Das macht Spaß|这很有趣|A2
Fehler|machen|to make a mistake|犯错|einen Fehler machen|犯错误|A2
Urlaub|machen|to go on holiday|度假|Urlaub machen|度假|A2
Fortschritte|machen|to make progress|取得进步|Fortschritte machen|取得进步|B1
Ernst|machen|to get serious|动真格|Ernst machen|说到做到|C1
Vorschlag|machen|to make a suggestion|提出建议|einen Vorschlag machen|提出建议|B1
Kraft|treten|to come into force|生效|in Kraft treten|生效|C1
Erscheinung|treten|to appear|显现|in Erscheinung treten|显现出来|C1
Streik|treten|to go on strike|举行罢工|in den Streik treten|开始罢工|C1
Verbindung|setzen|to get in touch|取得联系|sich in Verbindung setzen|取得联系|B2
Druck|setzen|to put under pressure|施压|jemanden unter Druck setzen|向某人施压|C1
Gang|setzen|to set in motion|启动|etwas in Gang setzen|使某事运转起来|C1
Betracht|ziehen|to take into consideration|加以考虑|etwas in Betracht ziehen|考虑某事|C1
Schluss|ziehen|to draw a conclusion|得出结论|einen Schluss ziehen|得出结论|C1
Bilanz|ziehen|to take stock|作总结|Bilanz ziehen|作总结|C1
Konsequenzen|ziehen|to draw consequences|采取相应措施|Konsequenzen ziehen|吸取教训|C1
Verfügung|stehen|to be available|可供使用|zur Verfügung stehen|可供使用|B2
Verfügung|stellen|to make available|提供|zur Verfügung stellen|提供使用|B2
Debatte|stehen|to be under discussion|正在讨论中|zur Debatte stehen|正在讨论中|C1
Rede|stehen|to answer for sth|作出交代|Rede und Antwort stehen|作出交代|C1
Wort|halten|to keep one's word|守信|sein Wort halten|说话算数|B2
Wort|ergreifen|to take the floor|发言|das Wort ergreifen|开始发言|C1
Maßnahmen|ergreifen|to take measures|采取措施|Maßnahmen ergreifen|采取措施|C1
Initiative|ergreifen|to take the initiative|主动行动|die Initiative ergreifen|主动行动|C1
Anspruch|nehmen|to make use of|占用，利用|etwas in Anspruch nehmen|利用某物|C1
Anspruch|erheben|to lay claim to|提出要求|Anspruch erheben|提出权利要求|C1
Einspruch|erheben|to raise an objection|提出异议|Einspruch erheben|提出异议|C1
Klage|erheben|to bring an action|提起诉讼|Klage erheben|提起诉讼|C1
Ausdruck|bringen|to express|表达|etwas zum Ausdruck bringen|表达某事|C1
Sprache|bringen|to bring up a topic|谈及|etwas zur Sprache bringen|把某事提出来讨论|C1
Ende|bringen|to bring to an end|完成|etwas zu Ende bringen|把某事做完|B2
Opfer|bringen|to make a sacrifice|作出牺牲|Opfer bringen|作出牺牲|C1
Gefahr|laufen|to run the risk|冒…的风险|Gefahr laufen|有…的危险|C1
Rechnung|tragen|to take account of|顾及|einer Sache Rechnung tragen|考虑到某事|C1
Sorge|tragen|to see to it|负责|Sorge tragen|负责照料|C1
Bedeutung|beimessen|to attach importance|赋予意义|einer Sache Bedeutung beimessen|重视某事|C1
Anwendung|finden|to be applied|得到应用|Anwendung finden|得到应用|C1
Beachtung|finden|to receive attention|受到关注|Beachtung finden|受到关注|C1
Zustimmung|finden|to meet with approval|获得赞同|Zustimmung finden|获得赞同|C1
Ausdruck|finden|to find expression|得到表达|Ausdruck finden|得以表达|C1
Anerkennung|finden|to gain recognition|得到认可|Anerkennung finden|得到认可|C1
Kritik|äußern|to voice criticism|表达批评|Kritik äußern|提出批评|C1
Wunsch|äußern|to express a wish|表达愿望|einen Wunsch äußern|说出愿望|B2
Zweifel|äußern|to express doubts|表示怀疑|Zweifel äußern|表示怀疑|C1
Hilfe|leisten|to give assistance|给予帮助|Hilfe leisten|提供帮助|B2
Widerstand|leisten|to put up resistance|进行抵抗|Widerstand leisten|进行抵抗|C1
Arbeit|leisten|to do work|做工作|gute Arbeit leisten|工作出色|B2
Beitrag|leisten|to make a contribution|作出贡献|einen Beitrag leisten|作出贡献|B2
Verzicht|leisten|to renounce|放弃|Verzicht leisten|放弃|C1
Gesellschaft|leisten|to keep company|作陪|jemandem Gesellschaft leisten|陪伴某人|B2
Interesse|zeigen|to show interest|表现出兴趣|Interesse zeigen|表现出兴趣|B1
Wirkung|zeigen|to take effect|见效|Wirkung zeigen|见效|B2
Verständnis|zeigen|to show understanding|表示理解|Verständnis zeigen|表示理解|B2
Prüfung|bestehen|to pass an exam|通过考试|eine Prüfung bestehen|通过考试|B1
Prüfung|ablegen|to sit an exam|参加考试|eine Prüfung ablegen|参加考试|B2
Eid|ablegen|to take an oath|宣誓|einen Eid ablegen|宣誓|C1
Geständnis|ablegen|to make a confession|坦白|ein Geständnis ablegen|坦白|C1
Rechenschaft|ablegen|to render account|作出交代|Rechenschaft ablegen|作出交代|C1
Krieg|führen|to wage war|发动战争|Krieg führen|打仗|C1
Gespräch|führen|to hold a conversation|进行谈话|ein Gespräch führen|进行谈话|B2
Diskussion|führen|to hold a discussion|进行讨论|eine Diskussion führen|展开讨论|B2
Leben|führen|to lead a life|过着…的生活|ein ruhiges Leben führen|过平静的生活|B2
Regie|führen|to direct (a film)|执导|Regie führen|担任导演|C1
Buch|führen|to keep records|记账|Buch führen|记账|C1
Kurs|belegen|to take a course|选修课程|einen Kurs belegen|选修一门课|B1
Platz|belegen|to take a place (rank)|获得名次|den ersten Platz belegen|获得第一名|B2
Rolle|spielen|to play a role|起作用|eine Rolle spielen|起作用|B1
Risiko|eingehen|to take a risk|冒险|ein Risiko eingehen|冒风险|C1
Kompromiss|eingehen|to accept a compromise|接受妥协|einen Kompromiss eingehen|作出妥协|C1
Verpflichtung|eingehen|to enter into an obligation|承担义务|eine Verpflichtung eingehen|承担义务|C1
Ehe|eingehen|to enter into marriage|结婚|die Ehe eingehen|缔结婚姻|C1
Antwort|erhalten|to receive an answer|得到答复|eine Antwort erhalten|得到答复|B1
Auskunft|erhalten|to obtain information|得到信息|Auskunft erhalten|获得信息|B2
Erlaubnis|erhalten|to obtain permission|获得许可|die Erlaubnis erhalten|获得许可|B2
Aufmerksamkeit|erregen|to attract attention|引起注意|Aufmerksamkeit erregen|引起注意|C1
Aufsehen|erregen|to cause a stir|引起轰动|Aufsehen erregen|引起轰动|C1
Zweifel|hegen|to harbour doubts|心存怀疑|Zweifel hegen|心存疑虑|C1
Bedenken|haben|to have misgivings|有顾虑|Bedenken haben|有顾虑|C1
Verdacht|schöpfen|to become suspicious|起疑心|Verdacht schöpfen|起疑心|C1
Mut|fassen|to pluck up courage|鼓起勇气|Mut fassen|鼓起勇气|C1
Entschluss|fassen|to make up one's mind|下定决心|einen Entschluss fassen|下定决心|C1
Vertrauen|fassen|to gain confidence|产生信任|Vertrauen fassen|开始信任|C1
Fuß|fassen|to gain a foothold|站稳脚跟|Fuß fassen|立足|C1
Erfahrung|sammeln|to gather experience|积累经验|Erfahrung sammeln|积累经验|B2
Kraft|sammeln|to gather strength|积蓄力量|Kräfte sammeln|积蓄体力|B2
Musik|hören|to listen to music|听音乐|Musik hören|听音乐|A1
Sport|treiben|to do sports|做运动|Sport treiben|运动|A2
Aufwand|treiben|to go to great lengths|花费很大力气|großen Aufwand treiben|大费周章|C1
Hausaufgaben|machen|to do homework|做作业|Hausaufgaben machen|做作业|A1
Frühstück|machen|to make breakfast|做早餐|Frühstück machen|做早饭|A1
Geld|verdienen|to earn money|挣钱|Geld verdienen|挣钱|A2
Miete|zahlen|to pay rent|付房租|Miete zahlen|付房租|A2
Steuern|zahlen|to pay taxes|纳税|Steuern zahlen|缴税|B2
Rechnung|bezahlen|to pay the bill|付账|die Rechnung bezahlen|结账|A2
Termin|vereinbaren|to arrange an appointment|约定时间|einen Termin vereinbaren|预约|B1
Termin|absagen|to cancel an appointment|取消预约|einen Termin absagen|取消预约|B1
Bewerbung|schreiben|to write an application|写求职信|eine Bewerbung schreiben|写求职信|B1
Notizen|machen|to take notes|做笔记|sich Notizen machen|做笔记|B1
Rat|holen|to seek advice|征求意见|sich Rat holen|征求意见|B2
Atem|holen|to draw breath|喘口气|Atem holen|喘口气|B2
Beschwerde|einlegen|to lodge a complaint|提出申诉|Beschwerde einlegen|提出申诉|C1
Pause|einlegen|to take a break|休息一下|eine Pause einlegen|休息一下|B1
Wert|legen|to attach value|重视|Wert legen|重视|B2
Bedingung|stellen|to set a condition|提出条件|eine Bedingung stellen|提出条件|B2
Forderung|stellen|to make a demand|提出要求|eine Forderung stellen|提出要求|C1
Weichen|stellen|to set the course|指明方向|die Weichen stellen|定下方向|C1
Rechnung|stellen|to invoice|开账单|eine Rechnung stellen|开具账单|B2
Aufgabe|lösen|to solve a task|解题|eine Aufgabe lösen|解决一道题|A2
Problem|lösen|to solve a problem|解决问题|ein Problem lösen|解决问题|B1
Konflikt|lösen|to resolve a conflict|化解冲突|einen Konflikt lösen|化解冲突|B2
Vertrag|kündigen|to terminate a contract|解除合同|einen Vertrag kündigen|解约|B2
Wohnung|kündigen|to give notice on a flat|退租|die Wohnung kündigen|退租|B2
Ziel|erreichen|to reach a goal|达到目标|ein Ziel erreichen|达到目标|B1
Einigung|erzielen|to reach an agreement|达成一致|eine Einigung erzielen|达成一致|C1
Ergebnis|erzielen|to achieve a result|取得结果|ein gutes Ergebnis erzielen|取得好成绩|C1
Gewinn|erzielen|to make a profit|获取利润|Gewinn erzielen|获利|C1
Aufmerksamkeit|widmen|to devote attention|投入关注|einer Sache Aufmerksamkeit widmen|关注某事|C1
Zeit|widmen|to devote time|投入时间|jemandem Zeit widmen|为某人花时间|C1
"""

# --------------------------------------------------------------------------
# Utilities
# --------------------------------------------------------------------------

UML = {'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue'}


def slugify(text):
    out = []
    for ch in text.strip().lower():
        if ch in UML:
            out.append(UML[ch])
        elif ch.isalnum():
            out.append(ch)
        elif ch in ' -':
            out.append('_')
    slug = ''.join(out)
    slug = re.sub(r'_+', '_', slug).strip('_')
    return slug


def parse_table(raw, arity):
    rows = []
    for line in raw.strip().split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = [p.strip() for p in line.split('|')]
        if len(parts) != arity:
            raise SystemExit('bad row (%d fields, expected %d): %s' % (len(parts), arity, line))
        rows.append(parts)
    return rows


def js_dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2)


def write_js(path, header, global_name, payload, extra_tail=''):
    # `var` so the browser global matches the Italian datasets, plus an explicit
    # window assignment (harmless in a classic script, required under a bundler)
    # and the CommonJS export so the file can be loaded head-less in Node.
    body = 'var %s = %s;\n' % (global_name, js_dump(payload))
    body += ("if (typeof window !== 'undefined') {\n  window.%s = %s;\n}\n"
             % (global_name, global_name))
    text = header + '\n' + body + extra_tail + \
        "\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = %s;\n}\n" % global_name
    with io.open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)
    return len(text.encode('utf-8'))


# --------------------------------------------------------------------------
# Tatoeba corpus (deu-cmn), CC BY 2.0 FR
# --------------------------------------------------------------------------

TATOEBA_FILES = {
    'deu_sentences.tsv.bz2': 'https://downloads.tatoeba.org/exports/per_language/deu/deu_sentences.tsv.bz2',
    'cmn_sentences.tsv.bz2': 'https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2',
    'deu-cmn_links.tsv.bz2': 'https://downloads.tatoeba.org/exports/per_language/deu/deu-cmn_links.tsv.bz2',
}


def fetch_tatoeba(force=False):
    for name, url in TATOEBA_FILES.items():
        dest = os.path.join(CACHE, name)
        if force or not os.path.exists(dest):
            sys.stderr.write('downloading %s\n' % url)
            urllib.request.urlretrieve(url, dest)


def _read_tsv_bz2(name):
    path = os.path.join(CACHE, name)
    with bz2.open(path, 'rt', encoding='utf-8', newline='') as fh:
        for row in csv.reader(fh, delimiter='\t', quoting=csv.QUOTE_NONE):
            yield row


try:
    import zhconv

    def to_simplified(text):
        return zhconv.convert(text, 'zh-cn')
except Exception:  # pragma: no cover - optional dependency
    def to_simplified(text):
        return text


BAD_DE_CHARS = set('"„“»«()[]<>*_/\\@#$%^&{}|~`0123456789')


def load_pairs():
    """Return [(german, chinese)] Tatoeba deu-cmn pairs fit for drilling."""
    deu, cmn = {}, {}
    for row in _read_tsv_bz2('deu_sentences.tsv.bz2'):
        if len(row) >= 3 and row[1] == 'deu':
            deu[row[0]] = row[2]
    for row in _read_tsv_bz2('cmn_sentences.tsv.bz2'):
        if len(row) >= 3 and row[1] == 'cmn':
            cmn[row[0]] = row[2]

    best = {}
    for row in _read_tsv_bz2('deu-cmn_links.tsv.bz2'):
        if len(row) < 2:
            continue
        de_id, zh_id = row[0], row[1]
        de = deu.get(de_id)
        zh = cmn.get(zh_id)
        if not de or not zh:
            continue
        if not sentence_ok(de):
            continue
        zh_s = to_simplified(zh).strip()
        if not translation_ok(zh_s):
            continue
        # keep the shortest acceptable Chinese rendering per German sentence
        prev = best.get(de)
        if prev is None or len(zh_s) < len(prev):
            best[de] = zh_s
    return sorted(best.items(), key=lambda kv: len(kv[0]))


def sentence_ok(de):
    de = de.strip()
    if not (18 <= len(de) <= 88):
        return False
    if any(ch in BAD_DE_CHARS for ch in de):
        return False
    if de[-1] not in '.!?':
        return False
    if '.' in de[:-1] or '…' in de or ' - ' in de or '–' in de:
        return False
    if re.search(r'[一-鿿]', de):
        return False
    if len(de.split()) < 4:
        return False
    return True


def translation_ok(zh):
    if not (3 <= len(zh) <= 42):
        return False
    if re.search(r'[A-Za-z]', zh):
        return False
    if not re.search(r'[一-鿿]', zh):
        return False
    if any(ch in zh for ch in '"“”()（）[]'):
        return False
    return True


# Case evidence: the token that follows the preposition.
ACC_MARKERS = {
    'den', 'einen', 'meinen', 'deinen', 'seinen', 'ihren', 'unseren', 'euren',
    'keinen', 'diesen', 'jeden', 'welchen', 'jemanden', 'mich', 'dich', 'ihn',
    'wen', 'jenen', 'solchen',
}
DAT_MARKERS = {
    'dem', 'einem', 'meinem', 'deinem', 'seinem', 'ihrem', 'unserem', 'eurem',
    'keinem', 'diesem', 'jedem', 'welchem', 'jemandem', 'mir', 'dir', 'ihm',
    'ihnen', 'wem', 'jenem', 'solchem', 'denen',
}
# preposition + article contractions
CONTRACTIONS = {
    'an': {'A': {'ans'}, 'D': {'am'}},
    'auf': {'A': {'aufs'}, 'D': set()},
    'in': {'A': {'ins'}, 'D': {'im'}},
    'von': {'A': set(), 'D': {'vom'}},
    'zu': {'A': set(), 'D': {'zum', 'zur'}},
    'bei': {'A': set(), 'D': {'beim'}},
    'für': {'A': {'fürs'}, 'D': set()},
    'um': {'A': {'ums'}, 'D': set()},
    'über': {'A': {'übers'}, 'D': set()},
    'unter': {'A': {'unters'}, 'D': set()},
    'vor': {'A': set(), 'D': {'vorm'}},
    'durch': {'A': {'durchs'}, 'D': set()},
    'aus': {'A': set(), 'D': set()},
    'mit': {'A': set(), 'D': set()},
    'nach': {'A': set(), 'D': set()},
    'gegen': {'A': set(), 'D': set()},
}
DA_FORMS = {
    'an': ['daran', 'woran', 'dran'],
    'auf': ['darauf', 'worauf', 'drauf'],
    'aus': ['daraus', 'woraus'],
    'bei': ['dabei', 'wobei'],
    'durch': ['dadurch', 'wodurch'],
    'für': ['dafür', 'wofür'],
    'gegen': ['dagegen', 'wogegen'],
    'in': ['darin', 'worin', 'drin'],
    'mit': ['damit', 'womit'],
    'nach': ['danach', 'wonach'],
    'über': ['darüber', 'worüber'],
    'um': ['darum', 'worum'],
    'unter': ['darunter', 'worunter'],
    'von': ['davon', 'wovon'],
    'vor': ['davor', 'wovor'],
    'zu': ['dazu', 'wozu'],
}

SEPARABLE_PREFIXES = [
    'ab', 'an', 'auf', 'aus', 'bei', 'ein', 'her', 'hin', 'los', 'mit', 'nach',
    'vor', 'weg', 'zu', 'zurück', 'zusammen', 'teil', 'fest', 'frei', 'statt',
    'entgegen', 'voran', 'fort', 'durch', 'über', 'um', 'unter',
]


def verb_stems(display):
    """Return (regex, prefix_or_None) used to spot the verb in a sentence."""
    core = display
    for lead in ('sich ', ):
        if core.startswith(lead):
            core = core[len(lead):]
    # multiword light-verb phrases: use the final verb
    parts = core.split()
    verb = parts[-1]
    prefix = None
    for pre in sorted(SEPARABLE_PREFIXES, key=len, reverse=True):
        if verb.startswith(pre) and len(verb) - len(pre) >= 4:
            prefix = pre
            verb = verb[len(pre):]
            break
    base = re.sub(r'(en|n)$', '', verb)
    if len(base) < 3:
        base = verb
    return base, prefix, parts


# Inflectional endings a finite/participial German verb form can carry.  Using a
# closed list (rather than \w{0,5}) keeps nouns that merely share the stem out:
# "Freund" no longer counts as evidence for "sich freuen".
VERB_SUFFIX = r'(?:test|tet|ten|est|end|st|et|en|te|e|t)?'

# Prepositions that govern exactly one case, so a bare co-occurrence with the
# verb is already unambiguous evidence of the collocation.
ONE_CASE_PREPS = {
    'aus': 'D', 'bei': 'D', 'mit': 'D', 'nach': 'D', 'von': 'D', 'zu': 'D',
    'seit': 'D', 'gegenüber': 'D',
    'für': 'A', 'gegen': 'A', 'um': 'A', 'durch': 'A', 'ohne': 'A',
}


# With a two-way preposition + Dativ the competing reading is locative or
# temporal ("am Sonntag arbeiten", "an der Wand"), which is NOT the verb's
# prepositional object, so those sentences are rejected as evidence.
TWO_WAY_PREPS = {'an', 'auf', 'in', 'über', 'unter', 'vor', 'neben', 'zwischen', 'hinter'}
TEMPORAL_LOCATIVE = {
    'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag',
    'sonnabend', 'sonntag', 'morgen', 'vormittag', 'mittag', 'nachmittag',
    'abend', 'nacht', 'wochenende', 'tag', 'tage', 'tagen', 'anfang', 'ende',
    'januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august',
    'september', 'oktober', 'november', 'dezember', 'jahr', 'jahre', 'monat',
    'sommer', 'winter', 'frühling', 'herbst', 'ersten', 'zweiten', 'dritten',
    'vierten', 'fünften', 'sechsten', 'siebten', 'achten', 'neunten', 'zehnten',
    'tisch', 'wand', 'fenster', 'tür', 'boden', 'himmel', 'strand', 'see',
    'fluss', 'ufer', 'straße', 'ecke', 'berg', 'meer', 'haus', 'zimmer',
    'küche', 'bahnhof', 'flughafen', 'universität', 'schule', 'stadt', 'land',
    'markt', 'park', 'bett', 'wagen', 'zug', 'weg', 'himmel', 'dach',
}
SUPERLATIVE_RE = re.compile(r'e?sten$')


def locative_reading(lowered, alts):
    for i, token in enumerate(lowered):
        if token in alts:
            nxt = lowered[i + 1] if i + 1 < len(lowered) else ''
            if nxt in TEMPORAL_LOCATIVE or SUPERLATIVE_RE.search(nxt):
                return True
    return False


def make_verb_re(base):
    return re.compile(r'\b(?:ge)?%s%s\b' % (re.escape(base), VERB_SUFFIX), re.IGNORECASE)


def verb_span(rx, sentence):
    """Span of the stem when it occurs as a lowercase (i.e. verbal) token."""
    for m in rx.finditer(sentence):
        token = m.group(0)
        if token[:1].isupper() and m.start() != 0:
            continue  # capitalised mid-sentence => it is a noun, not our verb
        return m.span()
    return None


def verb_hit(rx, sentence):
    return verb_span(rx, sentence) is not None


def same_clause(sentence, span_a, span_b):
    """No clause boundary between the two spans (approximated by a comma)."""
    lo = min(span_a[1], span_b[1])
    hi = max(span_a[0], span_b[0])
    if hi <= lo:
        return True
    return ',' not in sentence[lo:hi] and ';' not in sentence[lo:hi]


def build_mined_examples(pairs, patterns, per_pattern=6):
    """Map (verb_display, prep, case) -> [(sentence, translation)]."""
    out = defaultdict(list)
    weak = defaultdict(list)
    prepared = []
    for verb, prep, case in patterns:
        base, prefix, parts = verb_stems(verb)
        verb_re = make_verb_re(base)
        prefix_re = re.compile(r'\b%s\w{0,3}\b' % re.escape(prefix), re.IGNORECASE) if prefix else None
        noun_re = None
        if len(parts) > 1 and parts[0] != 'sich':
            # "Angst haben", "interessiert sein", "stolz sein": the light verb
            # alone is worthless evidence, the other half has to be there too
            noun_re = re.compile(r'\b%s\w{0,3}\b' % re.escape(parts[0]), re.IGNORECASE)
        prep_alts = [prep] + sorted(CONTRACTIONS.get(prep, {}).get(case, set()))
        prep_re = re.compile(r'\b(%s)\b' % '|'.join(re.escape(p) for p in prep_alts), re.IGNORECASE)
        da_re = re.compile(r'\b(%s)\b' % '|'.join(DA_FORMS.get(prep, [])), re.IGNORECASE) if DA_FORMS.get(prep) else None
        prepared.append((verb, prep, case, verb_re, prefix_re, noun_re, prep_re, da_re, prep_alts))

    contraction_case = {}
    for p, m in CONTRACTIONS.items():
        for c, forms in m.items():
            for f in forms:
                contraction_case[f] = c

    for de, zh in pairs:
        tokens = re.findall(r"[\wäöüÄÖÜß]+", de)
        lowered = [t.lower() for t in tokens]
        lowset = set(lowered)
        for (verb, prep, case, verb_re, prefix_re, noun_re, prep_re, da_re, prep_alts) in prepared:
            key = (verb, prep, case)
            if len(out[key]) >= per_pattern:
                continue
            vspan = verb_span(verb_re, de)
            if vspan is None:
                continue
            if prefix_re is not None and not (prefix_re.search(de) or verb.replace('sich ', '') in de):
                continue
            if noun_re is not None and not noun_re.search(de):
                continue
            hit = False
            # (a) contraction that already encodes the case
            for alt in prep_alts:
                if alt == prep:
                    continue
                if alt.lower() in lowset and contraction_case.get(alt.lower()) == case:
                    hit = True
            # (b) preposition followed by an unambiguous case marker
            if not hit and prep.lower() in lowset:
                idx = lowered.index(prep.lower())
                nxt = lowered[idx + 1] if idx + 1 < len(lowered) else ''
                if case == 'A' and nxt in ACC_MARKERS:
                    if not (nxt == 'den' and idx + 2 < len(lowered) and lowered[idx + 2].endswith('n')):
                        hit = True
                elif case == 'D' and nxt in DAT_MARKERS:
                    hit = True
            # two-way preposition + Dativ: reject the competing locative /
            # temporal reading ("am Sonntag arbeiten", "an der Wand stehen")
            if hit and case == 'D' and prep in TWO_WAY_PREPS:
                if locative_reading(lowered, set(p.lower() for p in prep_alts)):
                    hit = False
                    continue
            # (c) pronominal adverb (daran / worauf ...) - case-neutral but
            #     unambiguous evidence of a prepositional object, as long as it
            #     sits in the same clause as the verb (otherwise it belongs to
            #     a different governor: "Ich bin daran gewoehnt, zu arbeiten")
            if not hit and da_re is not None:
                dm = da_re.search(de)
                if dm is not None and same_clause(de, vspan, dm.span()):
                    hit = True
            if hit:
                out[key].append((de, zh))
            elif prep.lower() in lowset and ONE_CASE_PREPS.get(prep) == case:
                # single-case preposition: co-occurrence is already unambiguous
                if len(weak[key]) < per_pattern:
                    weak[key].append((de, zh))

    for key, extra in weak.items():
        for item in extra:
            if len(out[key]) >= per_pattern:
                break
            if item not in out[key]:
                out[key].append(item)
    return out
def build_mined_fvg(pairs, patterns, per_pattern=4):
    """Map (noun, light_verb) -> [(sentence, translation)] from Tatoeba."""
    out = defaultdict(list)
    prepared = []
    for noun, verb in patterns:
        base, prefix, _ = verb_stems(verb)
        verb_re = make_verb_re(base)
        prefix_re = re.compile(r'\b%s\w{0,3}\b' % re.escape(prefix), re.IGNORECASE) if prefix else None
        noun_re = re.compile(r'\b%s\w{0,4}\b' % re.escape(noun))
        prepared.append((noun, verb, verb_re, prefix_re, noun_re))

    for de, zh in pairs:
        for (noun, verb, verb_re, prefix_re, noun_re) in prepared:
            key = (noun, verb)
            if len(out[key]) >= per_pattern:
                continue
            if not noun_re.search(de):
                continue
            if not verb_hit(verb_re, de):
                continue
            if prefix_re is not None and not prefix_re.search(de):
                continue
            out[key].append((de, zh))
    return out


# --------------------------------------------------------------------------
# Additional Rektion rows (second authoring pass): adjective- and noun-governed
# prepositions belong to the same lexical system and are drilled the same way,
# so they live in the same table as "<adjective> sein" / "<noun> haben".
# --------------------------------------------------------------------------

REKTION_EXTRA = r"""
# --- an + Akkusativ ---
sich machen|an|A|to set about|着手做|sich an die Arbeit machen|着手工作|B2
vermieten|an|A|to rent out to|出租给|die Wohnung an Studenten vermieten|把房子租给学生|B2
adressieren|an|A|to address to|寄给|den Brief an die Firma adressieren|把信寄到公司|B2
weiterleiten|an|A|to forward to|转发给|die Mail an den Kollegen weiterleiten|把邮件转给同事|B2
übergeben|an|A|to hand over to|移交给|die Arbeit an den Nachfolger übergeben|把工作移交给接任者|C1
anknüpfen|an|A|to build on|承接，联系|an die Tradition anknüpfen|承接传统|C1
sich halten|an|A|to abide by|遵守|sich an die Regeln halten|遵守规则|B2
gewöhnt sein|an|A|to be used to|习惯于|an das Klima gewöhnt sein|习惯这种气候|B2
senden|an|A|to send to|发送给|eine Nachricht an alle senden|把消息发给所有人|B1

# --- an + Dativ ---
abnehmen|an|D|to decrease in|在…方面减少|an Gewicht abnehmen|体重减轻|B2
teilhaben|an|D|to share in|分享，参与|am Erfolg teilhaben|分享成功|C1
scheitern|an|D|to fail because of|因…而失败|an den Kosten scheitern|因费用而告吹|B2
verzweifeln|an|D|to despair of|对…绝望|an sich selbst verzweifeln|对自己绝望|C1
festhalten|an|D|to stick to|坚持|an dem Plan festhalten|坚持原计划|B2
sich messen|an|D|to measure oneself against|以…为标杆|sich an den Besten messen|向最优秀者看齐|C1
erkranken|an|D|to fall ill with|患上|an Grippe erkranken|患上流感|C1
Freude haben|an|D|to take pleasure in|以…为乐|Freude an der Arbeit haben|喜欢这份工作|B1
Interesse haben|an|D|to be interested in|对…有兴趣|Interesse an Musik haben|对音乐感兴趣|B1
Spaß haben|an|D|to have fun with|觉得…有意思|Spaß am Spiel haben|玩得开心|A2
interessiert sein|an|D|to be interested in|对…感兴趣|an einer Zusammenarbeit interessiert sein|有意合作|B2
beteiligt sein|an|D|to be involved in|参与其中|an dem Projekt beteiligt sein|参与该项目|B2
reich sein|an|D|to be rich in|富含|an Vitaminen reich sein|富含维生素|B2
arm sein|an|D|to be poor in|缺乏|an Rohstoffen arm sein|缺乏原料|C1
schuld sein|an|D|to be to blame for|对…有责任|an dem Unfall schuld sein|对事故负有责任|B2

# --- auf + Akkusativ ---
stolz sein|auf|A|to be proud of|为…自豪|auf die Kinder stolz sein|为孩子骄傲|A2
neugierig sein|auf|A|to be curious about|好奇|auf das Ergebnis neugierig sein|对结果好奇|B1
böse sein|auf|A|to be angry with|生…的气|auf den Freund böse sein|生朋友的气|B1
gespannt sein|auf|A|to be eager for|期待|auf den Film gespannt sein|期待这部电影|B2
eifersüchtig sein|auf|A|to be jealous of|嫉妒|auf den Kollegen eifersüchtig sein|嫉妒同事|B2
Lust haben|auf|A|to fancy sth|想要|Lust auf Kaffee haben|想喝咖啡|A2
Appetit haben|auf|A|to have an appetite for|想吃|Appetit auf Kuchen haben|想吃蛋糕|B1
Anspruch haben|auf|A|to be entitled to|有权享有|Anspruch auf Urlaub haben|有权休假|C1
sich stützen|auf|A|to be based on|以…为依据|sich auf Daten stützen|以数据为依据|C1
zurückkommen|auf|A|to come back to|回到（话题）|auf das Thema zurückkommen|回到这个话题|B2
vertrauen|auf|A|to trust in|信赖|auf sein Können vertrauen|相信自己的能力|B2
pochen|auf|A|to insist on|坚持要求|auf sein Recht pochen|坚持自己的权利|C1
sich einstellen|auf|A|to adjust to|适应，有所准备|sich auf die Kälte einstellen|适应寒冷|B2
hinauslaufen|auf|A|to amount to|归结为|auf dasselbe hinauslaufen|结果都一样|C1
schwören|auf|A|to swear by|极为信赖|auf ein Hausmittel schwören|极信赖偏方|C1
aufmerksam werden|auf|A|to become aware of|注意到|auf den Fehler aufmerksam werden|注意到错误|C1

# --- auf + Dativ ---
fußen|auf|D|to be founded on|基于|auf einer Idee fußen|基于一个想法|C1
aufbauen|auf|D|to build upon|以…为基础|auf Erfahrung aufbauen|以经验为基础|C1

# --- aus + Dativ ---
entstehen|aus|D|to arise from|由…产生|aus einem Streit entstehen|由争吵引起|B2
übersetzen|aus|D|to translate from|从…翻译|aus dem Deutschen übersetzen|从德语译出|B1
werden|aus|D|to become of|…后来如何|Was ist aus ihm geworden|他后来怎么样了|B1
machen|aus|D|to make out of|用…做成|aus Holz ein Regal machen|用木头做架子|B1

# --- bei + Dativ ---
mitwirken|bei|D|to collaborate on|参与|bei einem Projekt mitwirken|参与一个项目|C1
anrufen|bei|D|to call sb|给…打电话|bei der Firma anrufen|给公司打电话|A2
vorbeikommen|bei|D|to drop by sb's place|顺路拜访|bei einem Freund vorbeikommen|顺道去朋友家|B1
wohnen|bei|D|to live with|住在…家|bei den Eltern wohnen|住在父母家|A1
arbeiten|bei|D|to work for|在…就职|bei einer Bank arbeiten|在银行工作|A2

# --- durch + Akkusativ ---
teilen|durch|A|to divide by|除以|zehn durch zwei teilen|十除以二|B1
gekennzeichnet sein|durch|A|to be characterized by|以…为特征|durch Vielfalt gekennzeichnet sein|以多样性为特征|C1

# --- für + Akkusativ ---
bürgen|für|A|to vouch for|担保|für einen Freund bürgen|为朋友担保|C1
schwärmen|für|A|to be crazy about|迷恋|für eine Sängerin schwärmen|迷恋一位歌手|C1
gelten|für|A|to apply to|适用于|Die Regel gilt für alle|规则适用于所有人|B2
verantwortlich sein|für|A|to be responsible for|对…负责|für das Team verantwortlich sein|对团队负责|B2
typisch sein|für|A|to be typical of|是…的典型|typisch für die Region sein|是该地区的典型|B2
bekannt sein|für|A|to be known for|以…闻名|für seinen Käse bekannt sein|以奶酪闻名|B1
dankbar sein|für|A|to be grateful for|对…感激|für die Hilfe dankbar sein|感谢帮助|B1
geeignet sein|für|A|to be suitable for|适合|für Anfänger geeignet sein|适合初学者|B1
wichtig sein|für|A|to be important for|对…重要|für die Gesundheit wichtig sein|对健康很重要|A2
Verständnis haben|für|A|to be understanding of|理解|Verständnis für die Lage haben|理解这种处境|B2
Zeit haben|für|A|to have time for|有时间做|Zeit für die Familie haben|有时间陪家人|A2
Interesse zeigen|für|A|to show interest in|对…表示兴趣|Interesse für Kunst zeigen|对艺术表示兴趣|B2

# --- gegen + Akkusativ ---
sich sträuben|gegen|A|to resist|抵触|sich gegen die Änderung sträuben|抵触这项改动|C1
immun sein|gegen|A|to be immune to|对…免疫|gegen das Virus immun sein|对病毒免疫|C1
allergisch sein|gegen|A|to be allergic to|对…过敏|gegen Pollen allergisch sein|对花粉过敏|B1
verlieren|gegen|A|to lose to|输给|gegen die Mannschaft verlieren|输给那支球队|B1
tauschen|gegen|A|to exchange for|换成|Euro gegen Dollar tauschen|把欧元换成美元|B1
sprechen|gegen|A|to speak against|反对|gegen den Vorschlag sprechen|反对这个提议|B2

# --- in + Akkusativ ---
einteilen|in|A|to divide into|划分为|in drei Gruppen einteilen|分成三组|B2
sich stürzen|in|A|to plunge into|投入|sich in die Arbeit stürzen|一头扎进工作|C1
verwickeln|in|A|to involve in|卷入|jemanden in einen Streit verwickeln|把某人卷入争吵|C1
umrechnen|in|A|to convert into|换算成|Euro in Dollar umrechnen|把欧元换算成美元|B2

# --- in + Dativ ---
übereinstimmen|in|D|to agree in|在…上一致|in diesem Punkt übereinstimmen|在这一点上一致|C1
sich unterscheiden|in|D|to differ in|在…方面不同|sich in der Größe unterscheiden|大小不同|B2
gut sein|in|D|to be good at|擅长|in Mathematik gut sein|数学好|A2
erfahren sein|in|D|to be experienced in|在…方面有经验|in diesem Bereich erfahren sein|在该领域有经验|C1

# --- mit + Dativ ---
zufrieden sein|mit|D|to be satisfied with|对…满意|mit dem Ergebnis zufrieden sein|对结果满意|A2
verheiratet sein|mit|D|to be married to|与…结婚|mit einer Ärztin verheiratet sein|妻子是医生|B1
einverstanden sein|mit|D|to agree with|同意|mit dem Vorschlag einverstanden sein|同意这个建议|B1
verwandt sein|mit|D|to be related to|与…有亲属关系|mit ihm verwandt sein|与他是亲戚|B2
experimentieren|mit|D|to experiment with|用…做试验|mit neuen Formen experimentieren|尝试新形式|C1
versorgen|mit|D|to supply with|向…提供|die Stadt mit Wasser versorgen|向城市供水|B2
sich vertragen|mit|D|to get along with|与…相处融洽|sich mit den Nachbarn vertragen|与邻居和睦相处|B2

# --- nach + Dativ ---
benennen|nach|D|to name after|以…命名|die Straße nach dem Dichter benennen|以诗人的名字命名街道|C1
sich umsehen|nach|D|to look around for|物色|sich nach einer Wohnung umsehen|物色房子|B2
Sehnsucht haben|nach|D|to long for|思念|Sehnsucht nach zu Hause haben|想家|B2
schicken|nach|D|to send for|派人去请|nach dem Arzt schicken|派人请医生|C1

# --- um + Akkusativ ---
ersuchen|um|A|to request|请求|um Auskunft ersuchen|请求提供信息|C1
wetten|um|A|to bet|打赌|um zehn Euro wetten|赌十欧元|B2
trauern|um|A|to mourn for|哀悼|um einen Freund trauern|悼念朋友|C1

# --- von + Dativ ---
abhängig sein|von|D|to be dependent on|依赖于|vom Wetter abhängig sein|取决于天气|B1
begeistert sein|von|D|to be enthusiastic about|对…着迷|von der Idee begeistert sein|对这个想法很兴奋|B2
überzeugt sein|von|D|to be convinced of|确信|von dem Plan überzeugt sein|确信这个方案|B2
enttäuscht sein|von|D|to be disappointed by|对…失望|von dem Film enttäuscht sein|对电影失望|B1
zeugen|von|D|to testify to|表明|von Mut zeugen|表明勇气|C1
wimmeln|von|D|to be teeming with|充满|von Fehlern wimmeln|错误百出|C1
sich ernähren|von|D|to live on|以…为食|sich von Gemüse ernähren|以蔬菜为食|B2

# --- vor + Dativ ---
sich schämen|vor|D|to feel ashamed before|在…面前羞愧|sich vor den Kollegen schämen|在同事面前难堪|B2
bewahren|vor|D|to protect from|使免于|jemanden vor Schaden bewahren|使某人免受损害|C1
sicher sein|vor|D|to be safe from|不受…侵害|vor Regen sicher sein|不怕下雨|B2
kapitulieren|vor|D|to capitulate to|向…屈服|vor den Problemen kapitulieren|向困难屈服|C1

# --- zu + Dativ ---
bereit sein|zu|D|to be ready for|准备好|zu einem Kompromiss bereit sein|愿意妥协|B2
fähig sein|zu|D|to be capable of|有能力做|zu einer Entscheidung fähig sein|能够作出决定|C1
freundlich sein|zu|D|to be friendly to|对…友好|zu den Gästen freundlich sein|对客人友好|A2
nett sein|zu|D|to be nice to|对…好|zu den Kindern nett sein|对孩子好|A2
taugen|zu|D|to be good for|适合做|zu nichts taugen|一无是处|C1
sich eignen|zu|D|to be suited to|适合作|sich zum Lehrer eignen|适合当老师|B2
verhelfen|zu|D|to help sb get|帮助…获得|jemandem zum Erfolg verhelfen|帮某人取得成功|C1
Vertrauen haben|zu|D|to have confidence in|信任|Vertrauen zu dem Arzt haben|信任这位医生|B2

# --- über + Akkusativ ---
wachen|über|A|to watch over|看管|über die Sicherheit wachen|负责安全|C1
sich täuschen|über|A|to be mistaken about|对…判断错误|sich über die Lage täuschen|误判形势|C1
sich klar werden|über|A|to become clear about|弄清楚|sich über die Folgen klar werden|弄清后果|C1
sich hinwegsetzen|über|A|to disregard|无视|sich über die Regeln hinwegsetzen|无视规则|C1
Auskunft geben|über|A|to give information about|说明|Auskunft über den Preis geben|说明价格|B2
sich äußern|über|A|to comment on|评论|sich über den Vorfall äußern|评论此事|C1
"""

FVG_EXTRA = r"""
Maßnahme|ergreifen|to take measures|采取措施|Maßnahmen ergreifen|采取措施|C1
Initiative|ergreifen|to take the initiative|采取主动|die Initiative ergreifen|主动出击|C1
Wort|ergreifen|to take the floor|发言|das Wort ergreifen|发言|C1
Chance|ergreifen|to seize the chance|抓住机会|die Chance ergreifen|抓住机会|B2
Gelegenheit|nutzen|to seize the opportunity|利用机会|die Gelegenheit nutzen|利用机会|B2
Anerkennung|finden|to gain recognition|得到认可|Anerkennung finden|获得认可|C1
Beachtung|finden|to receive attention|受到重视|Beachtung finden|受到关注|C1
Zustimmung|finden|to meet with approval|获得赞同|Zustimmung finden|获得赞同|C1
Verwendung|finden|to be used|被使用|Verwendung finden|得到使用|C1
Anwendung|finden|to be applied|得到应用|Anwendung finden|得到应用|C1
Ausdruck|finden|to find expression|得到表达|Ausdruck finden|得以表现|C1
Ausdruck|bringen|to express|表达|etwas zum Ausdruck bringen|把某事表达出来|C1
Sprache|bringen|to bring up|提起|etwas zur Sprache bringen|提起某事|C1
Ende|bringen|to bring to an end|结束|etwas zu Ende bringen|把事情做完|B2
Ordnung|bringen|to put in order|整理|etwas in Ordnung bringen|把某物整理好|B1
Gefahr|bringen|to endanger|使陷入危险|jemanden in Gefahr bringen|使某人陷入危险|B2
Verlegenheit|bringen|to embarrass|使为难|jemanden in Verlegenheit bringen|让某人难堪|C1
Erfahrung|bringen|to find out|获悉|etwas in Erfahrung bringen|打听到某事|C1
Kraft|treten|to come into force|生效|in Kraft treten|生效|C1
Erscheinung|treten|to appear|显现|in Erscheinung treten|显露出来|C1
Verbindung|treten|to make contact|取得联系|mit jemandem in Verbindung treten|与某人取得联系|C1
Streik|treten|to go on strike|举行罢工|in den Streik treten|开始罢工|C1
Betracht|ziehen|to take into consideration|加以考虑|etwas in Betracht ziehen|考虑某事|C1
Bilanz|ziehen|to take stock|作总结|Bilanz ziehen|作总结|C1
Schluss|ziehen|to draw a conclusion|得出结论|einen Schluss ziehen|得出结论|C1
Konsequenz|ziehen|to draw consequences|采取相应措施|Konsequenzen ziehen|做出相应处理|C1
Rechenschaft|ziehen|to call to account|追究责任|jemanden zur Rechenschaft ziehen|追究某人的责任|C1
Zweifel|ziehen|to call into doubt|表示怀疑|etwas in Zweifel ziehen|对某事表示怀疑|C1
Anspruch|nehmen|to make use of|占用，利用|etwas in Anspruch nehmen|占用某物|C1
Kauf|nehmen|to put up with|勉强接受|etwas in Kauf nehmen|勉强接受某事|C1
Bezug|nehmen|to refer to|提及|auf etwas Bezug nehmen|提及某事|C1
Abstand|nehmen|to refrain from|放弃|von etwas Abstand nehmen|放弃某事|C1
Auskunft|erteilen|to give information|提供咨询|Auskunft erteilen|提供咨询|C1
Erlaubnis|erteilen|to grant permission|准许|die Erlaubnis erteilen|准予|C1
Auftrag|erteilen|to place an order|下达委托|einen Auftrag erteilen|下达委托|C1
Widerstand|leisten|to put up resistance|抵抗|Widerstand leisten|进行抵抗|C1
Hilfe|leisten|to render assistance|提供帮助|Hilfe leisten|施以援手|B2
Beitrag|leisten|to make a contribution|作出贡献|einen Beitrag leisten|作出贡献|B2
Arbeit|leisten|to do work|完成工作|gute Arbeit leisten|干得漂亮|B2
Verzicht|leisten|to renounce|放弃|auf etwas Verzicht leisten|放弃某物|C1
Gesellschaft|leisten|to keep company|陪伴|jemandem Gesellschaft leisten|陪伴某人|B2
Folge|leisten|to comply with|听从|einer Aufforderung Folge leisten|听从要求|C1
"""

# Display order for the preposition tree: frequency of use in German Rektion.
PREP_ORDER = ['an', 'auf', 'für', 'mit', 'nach', 'über', 'um', 'von', 'vor',
              'zu', 'aus', 'bei', 'in', 'gegen', 'durch', 'unter']
CASE_LABEL = {
    'A': 'Akkusativ（第四格）',
    'D': 'Dativ（第三格）',
    'G': 'Genitiv（第二格）',
}


def prep_key(prep, case):
    return '%s +%s' % (prep, case)


def example_string(german, chinese):
    """Format one drillable example the way the collocation UI parses it."""
    german = german.strip()
    if german and german[-1] not in '.!?':
        german += '.'
    return '%s %s' % (german, chinese.strip())


def build_collocations(pairs):
    rows = parse_table(REKTION + REKTION_EXTRA, 8)
    seen_rows = set()
    clean = []
    for r in rows:
        key = (r[0], r[1], r[2], r[5])  # verb, prep, case, pattern
        if key in seen_rows:
            continue
        seen_rows.add(key)
        clean.append(r)

    patterns = sorted({(r[0], r[1], r[2]) for r in clean})
    sys.stderr.write('mining Tatoeba for %d Rektion patterns ...\n' % len(patterns))
    mined = build_mined_examples(pairs, patterns, per_pattern=4)

    verbs = {}
    total_examples = 0
    used_keys = []
    for verb, prep, case, en, zh, pattern, pattern_zh, level in clean:
        key = prep_key(prep, case)
        if key not in used_keys:
            used_keys.append(key)
        entry = verbs.setdefault(verb, {
            'display': verb,
            'prepositions': {},
            'prepositionOrder': [],
            'entries': [],
        })
        if key not in entry['prepositions']:
            entry['prepositions'][key] = []
            entry['prepositionOrder'].append(key)

        structured = {
            'preposition': prep,
            'case': case,
            'caseLabel': CASE_LABEL[case],
            'key': key,
            'english': en,
            'chinese': zh,
            'pattern': pattern,
            'patternChinese': pattern_zh,
            'level': level,
            'examples': [],
        }
        first = example_string(pattern, pattern_zh)
        if first not in entry['prepositions'][key]:
            entry['prepositions'][key].append(first)
            structured['examples'].append({'de': pattern, 'zh': pattern_zh, 'source': AUTHORED})
            total_examples += 1
        for de, tzh in mined.get((verb, prep, case), []):
            text = example_string(de, tzh)
            if text in entry['prepositions'][key]:
                continue
            entry['prepositions'][key].append(text)
            structured['examples'].append({'de': de, 'zh': tzh, 'source': TATOEBA})
            total_examples += 1
        entry['entries'].append(structured)

    index = defaultdict(list)
    for verb, data in verbs.items():
        for key in data['prepositionOrder']:
            index[key].append(verb)
    for key in index:
        index[key].sort(key=lambda v: v.lower())

    ordered_keys = []
    for prep in PREP_ORDER:
        for case in ('A', 'D', 'G'):
            key = prep_key(prep, case)
            if key in index:
                ordered_keys.append(key)
    for key in sorted(index):
        if key not in ordered_keys:
            ordered_keys.append(key)

    return {
        'meta': {
            'language': 'de',
            'sourceField': 'german',
            'totalVerbs': len(verbs),
            'totalExamples': total_examples,
            'prepositionOrder': ordered_keys,
            'prepositionCase': {k: k.split('+')[1] for k in ordered_keys},
            'prepositionBase': {k: k.split(' +')[0] for k in ordered_keys},
            'caseLabels': CASE_LABEL,
            'title': '德语动词的介词搭配（Rektion）',
            'note': '介词条目自带支配格：“auf +A”与“auf +D”是两个不同的搭配。',
            'licenses': [TATOEBA, AUTHORED],
        },
        'verbs': verbs,
        'prepositions': dict(index),
    }


def build_noun_verb(pairs):
    rows = parse_table(FVG + FVG_EXTRA, 7)
    seen_rows = set()
    clean = []
    for r in rows:
        key = (r[0], r[1], r[4])
        if key in seen_rows:
            continue
        seen_rows.add(key)
        clean.append(r)

    patterns = sorted({(r[0], r[1]) for r in clean})
    sys.stderr.write('mining Tatoeba for %d Funktionsverbgefuege ...\n' % len(patterns))
    mined = build_mined_fvg(pairs, patterns, per_pattern=3)

    nouns = {}
    total_examples = 0
    for noun, verb, en, zh, phrase, phrase_zh, level in clean:
        entry = nouns.setdefault(noun, {
            'display': noun,
            'prepositions': {},
            'prepositionOrder': [],
            'entries': [],
        })
        if verb not in entry['prepositions']:
            entry['prepositions'][verb] = []
            entry['prepositionOrder'].append(verb)
        structured = {
            'noun': noun,
            'verb': verb,
            'english': en,
            'chinese': zh,
            'pattern': phrase,
            'patternChinese': phrase_zh,
            'level': level,
            'examples': [],
        }
        first = example_string(phrase, phrase_zh)
        if first not in entry['prepositions'][verb]:
            entry['prepositions'][verb].append(first)
            structured['examples'].append({'de': phrase, 'zh': phrase_zh, 'source': AUTHORED})
            total_examples += 1
        for de, tzh in mined.get((noun, verb), []):
            text = example_string(de, tzh)
            if text in entry['prepositions'][verb]:
                continue
            entry['prepositions'][verb].append(text)
            structured['examples'].append({'de': de, 'zh': tzh, 'source': TATOEBA})
            total_examples += 1
        entry['entries'].append(structured)

    index = defaultdict(list)
    for noun, data in nouns.items():
        for verb in data['prepositionOrder']:
            index[verb].append(noun)
    for verb in index:
        index[verb].sort(key=lambda n: n.lower())

    order = sorted(index, key=lambda v: (-len(index[v]), v.lower()))
    return {
        'meta': {
            'language': 'de',
            'sourceField': 'german',
            'totalVerbs': len(nouns),
            'totalExamples': total_examples,
            'prepositionOrder': order,
            'title': '名词—动词固定搭配（Funktionsverbgefüge）',
            'note': '本子集以名词为词条、以功能动词为“介词”轴，结构与主数据集完全一致。',
            'licenses': [TATOEBA, AUTHORED],
        },
        'verbs': nouns,
        'prepositions': dict(index),
    }
# --------------------------------------------------------------------------
# 3. Cognates  (German <-> English)
# --------------------------------------------------------------------------

def load_js_dataset(filename, global_name):
    """Read a repo dataset by evaluating it in node and dumping JSON."""
    import subprocess
    path = os.path.join(DATA, filename)
    script = (
        "const fs=require('fs'),vm=require('vm');"
        "const c=vm.createContext({console});c.window=c;"
        "const d=vm.runInContext(fs.readFileSync(%s,'utf8')+';%s',c);"
        "process.stdout.write(JSON.stringify(d));"
    ) % (json.dumps(path), global_name)
    out = subprocess.run(
        ['node', '--max-old-space-size=8192', '-e', script],
        check=True, stdout=subprocess.PIPE)
    return json.loads(out.stdout.decode('utf-8'))


def norm_compare(s):
    s = unicodedata.normalize('NFD', (s or '').strip().lower())
    return ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')


def edit_distance(a, b):
    a, b = norm_compare(a), norm_compare(b)
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def similarity(a, b):
    a, b = norm_compare(a), norm_compare(b)
    longest = max(len(a), len(b)) or 1
    return int(round((1 - edit_distance(a, b) / longest) * 100))


POS_MARK = re.compile(r'\b(?:n|v|vt|vi|adj|adv|prep|conj|pron|art|num|int|aux)\.', re.IGNORECASE)
PAREN = re.compile(r'[（(\[][^）)\]]*[）)\]]')
SPLIT_ZH = re.compile(r'[,;，；、/|\s]+')


def zh_senses(text):
    if not text:
        return set()
    text = POS_MARK.sub('，', text)
    text = PAREN.sub('，', text)
    out = set()
    for token in SPLIT_ZH.split(text):
        token = token.strip('.。，、；;:：!！?？“”"\'…-— ')
        if not token or len(token) > 8:
            continue
        if re.search(r'[A-Za-z0-9]', token):
            continue
        if not re.search(r'[一-鿿]', token):
            continue
        out.add(token)
    return out


STOP_SENSES = {
    '的', '地', '得', '了', '是', '有', '在', '和', '与', '等', '使', '把', '着',
    '之', '其', '所', '一', '不', '也', '就', '这', '那', '某', '人', '事', '物',
}


def senses_agree(de_senses, en_senses):
    de_senses = {s for s in de_senses if s not in STOP_SENSES}
    en_senses = {s for s in en_senses if s not in STOP_SENSES}
    if not de_senses or not en_senses:
        return False
    if de_senses & en_senses:
        return True
    for a in de_senses:
        if len(a) < 2:
            continue
        for b in en_senses:
            if len(b) < 2:
                continue
            if a in b or b in a:
                return True
    return False


# (regex, replacement, patternType label, anchored-at-end?)
# Latinate / learned suffix correspondences: extremely regular, high precision.
SUFFIX_RULES = [
    (r'ität$', 'ity', '-ität/-ity'),
    (r'tät$', 'ty', '-tät/-ty'),
    (r'ismus$', 'ism', '-ismus/-ism'),
    (r'istisch$', 'istic', '-istisch/-istic'),
    (r'isch$', 'ic', '-isch/-ic'),
    (r'logie$', 'logy', '-logie/-logy'),
    (r'graphie$', 'graphy', '-graphie/-graphy'),
    (r'grafie$', 'graphy', '-grafie/-graphy'),
    (r'nomie$', 'nomy', '-nomie/-nomy'),
    (r'ie$', 'y', '-ie/-y'),
    (r'enz$', 'ence', '-enz/-ence'),
    (r'anz$', 'ance', '-anz/-ance'),
    (r'iv$', 'ive', '-iv/-ive'),
    (r'ur$', 'ure', '-ur/-ure'),
    (r'är$', 'ary', '-är/-ary'),
    (r'ell$', 'al', '-ell/-al'),
    (r'ös$', 'ous', '-ös/-ous'),
    (r'ieren$', 'ate', '-ieren/-ate'),
    (r'ieren$', 'ize', '-ieren/-ize'),
    (r'ieren$', '', '-ieren/-Ø'),
    (r'ik$', 'ics', '-ik/-ics'),
    (r'ik$', 'ic', '-ik/-ic'),
    (r'abel$', 'able', '-abel/-able'),
    (r'ibel$', 'ible', '-ibel/-ible'),
    (r'tion$', 'tion', '-tion/-tion'),
    (r'sion$', 'sion', '-sion/-sion'),
    (r'ment$', 'ment', '-ment/-ment'),
    (r'tur$', 'ture', '-tur/-ture'),
    (r'phie$', 'phy', '-phie/-phy'),
]

# Germanic inflectional trimming.
TRIM_RULES = [
    (r'en$', '', None),
    (r'n$', '', None),
    (r'e$', '', None),
    (r'el$', 'le', None),
    (r's$', 'se', None),
    (r'$', 'e', None),
]

# High German consonant shift and the regular vowel correspondences.
SHIFT_RULES = [
    (r'acht', 'ight', 'gh↔ch'),
    (r'acht', 'eight', 'gh↔ch'),
    (r'icht', 'ight', 'gh↔ch'),
    (r'echt', 'ight', 'gh↔ch'),
    (r'ocht', 'ought', 'gh↔ch'),
    (r'auch', 'ough', 'gh↔ch'),
    (r'sch', 'sh', 'sh↔sch'),
    # 德语的 s-Verhärtung：sl-/sm-/sn-/sw- 一律写成 schl-/schm-/schn-/schw-
    # （Schwan/swan、Schmuggel/smuggle）；词尾的 -sch 对应英语 -s（falsch/false）。
    # 这条以前没有自己的规则，sch→sh 再掉个 h 的两步派生让这些词被 Ø↔h 兜走，
    # 界面就会说成「德语比英语多一个 h」，而真实差异是 sch↔s。
    # 只写这两个真实环境，不写成裸的 sch→s：规则表一宽，同分的候选就会换人，
    # scheinen/shine、schaffen/shape 这些走 sh↔sch 的词对会被顶掉。
    (r'sch(?=[lmnw])', 's', 's↔sch'),
    (r'sch$', 's', 's↔sch'),
    (r'tz', 't', 't↔z/tz'),
    (r'z', 't', 't↔z/tz'),
    (r'z', 'c', 'c↔z'),
    (r'ss', 't', 't↔ss/ß'),
    (r'ß', 't', 't↔ss/ß'),
    (r'ß', 'ss', 't↔ss/ß'),
    (r'pf', 'p', 'p↔pf'),
    (r'ff', 'p', 'p↔f'),
    (r'f', 'p', 'p↔f'),
    (r'ch', 'k', 'k↔ch'),
    (r'ch', 'gh', 'gh↔ch'),
    (r'tt', 'd', 'd↔t'),
    (r't', 'd', 'd↔t'),
    (r'd', 'th', 'th↔d'),
    (r'b', 'v', 'v↔b'),
    (r'g', 'y', 'y↔g'),
    (r'v', 'f', 'f↔v'),
    (r'w', 'v', 'v↔w'),
    (r'k', 'c', 'c↔k'),
    (r'au', 'ou', 'ou↔au'),
    (r'au', 'ow', 'ow↔au'),
    (r'ei', 'i', 'i↔ei'),
    (r'ei', 'o', 'o↔ei'),
    (r'ei', 'oa', 'oa↔ei'),
    (r'ie', 'ee', 'ee↔ie'),
    (r'ie', 'ea', 'ea↔ie'),
    (r'u', 'oo', 'oo↔u'),
    (r'u', 'o', 'o↔u'),
    (r'ü', 'u', 'u↔ü'),
    (r'ü', 'i', 'i↔ü'),
    (r'ü', 'ee', 'ee↔ü'),
    (r'ö', 'e', 'e↔ö'),
    (r'ä', 'e', 'e↔ä'),
    (r'ä', 'a', 'a↔ä'),
    (r'a', 'o', 'o↔a'),
    # 德语侧有 h、英语侧没有。标签一律写成「英语↔德语」，所以是 Ø↔h 而不是 h↔Ø。
    (r'h', '', 'Ø↔h'),
]

# The label that wins when several correspondences fired at once.
# 后缀族排在字母替换前面：Universität/university 同时命中 -ität/-ity 和 c↔k 时
# 要归到后缀族，而不是被字母规则抢走。
LABEL_PRIORITY = [lab for _, _, lab in SUFFIX_RULES] + [
    't↔z/tz', 't↔ss/ß', 'p↔pf', 'p↔f', 'k↔ch', 'gh↔ch', 'd↔t', 'th↔d',
    'v↔b', 'y↔g', 'f↔v', 'sh↔sch', 's↔sch', 'c↔k', 'c↔z', 'v↔w',
    'ou↔au', 'ow↔au', 'oo↔u', 'ee↔ie', 'ea↔ie', 'i↔ei', 'o↔ei', 'oa↔ei',
    'u↔ü', 'i↔ü', 'ee↔ü', 'e↔ö', 'e↔ä', 'a↔ä', 'o↔u', 'o↔a', 'Ø↔h',
]
LABEL_RANK = {lab: i for i, lab in enumerate(LABEL_PRIORITY)}

# 组里少于这么多词就不单独出卡片，patternType 置空并入 Other。
# 一个词的「规律」不成其为规律。
MIN_PATTERN_GROUP = 5

# --------------------------------------------------------------------------
# 标签的表面双向验证
#
# 规则是在派生链的中间形态上触发的，链条走完之后标签未必还对得上真实的词对：
# frei/free 是靠 $→e 补出 "freie" 再 ie→ee 才连上的，"frei" 里根本没有 ie，
# 贴 ee↔ie 就是无中生有。所以在写进数据前，把标签拆回两侧字符串重新核对：
#   字母标签写作 `英语↔德语`（'c↔k' = 英语 c、德语 k），一侧可以是 Ø/ss 这类
#     斜杠分隔的多选；
#   后缀标签写作 `-德语/-英语`（'-ität/-ity'），按词尾核对。
# 对不上的标签一律丢掉，全丢光就落到 null（界面上的 Other）。
# --------------------------------------------------------------------------
EMPTY_SIDE = ('Ø', '∅', '')

# 单个 h 的表面检验要认二合字母：ch/sch/ph/th 里的 h 不是一个自成一体的 h，
# 它属于前面那个字母。不认这一条，Ø↔h（「德语有 h、英语没有」）就会去兜
# 真实差异是 sch↔s 的词——Schwan/swan 表面上「德语有 h、英语没 h」全对，
# 可那个 h 是 sch 的一半，界面却会说成「存在 Ø ↔ h 的字母对应」。
BARE_H_RE = re.compile(r'(?<![cpst])h')


def _occurs(letters, word):
    """标签一侧的字母串是否作为独立音位出现在词里。"""
    if letters == 'h':
        return BARE_H_RE.search(word) is not None
    return letters in word


def _split_sides(label):
    """返回 (英语侧候选, 德语侧候选, 是否后缀规则)；不认识的标签返回 None。"""
    if '↔' in label:
        en, de = label.split('↔', 1)
        return ([p.strip() for p in en.split('/')],
                [p.strip() for p in de.split('/')], False)
    if label.startswith('-') and '/' in label:
        de, en = label.split('/', 1)
        return ([en.strip().lstrip('-')], [de.strip().lstrip('-')], True)
    return None


def label_holds(label, german, english):
    """标签描述的对应，在真实的德/英词对表面上是否成立。"""
    sides = _split_sides(label)
    if sides is None:
        return True  # identisch / falscher Freund 这类不是规则标签
    en_alts, de_alts, is_suffix = sides
    g, e = german.lower(), english.lower()
    en_real = [a for a in en_alts if a not in EMPTY_SIDE]
    de_real = [a for a in de_alts if a not in EMPTY_SIDE]
    if is_suffix:
        if not de_real or not any(g.endswith(a) for a in de_real):
            return False
        if not en_real:
            # -ieren/-Ø 说的是「英语里没有对应后缀」。除了德语词尾本身，
            # 同一个德语词尾在别的规则里对应的英语词尾（-ieren → -ate/-ize）
            # 也不能出现，否则 optimieren/optimize 会被说成「没有对应后缀」。
            siblings = list(de_real) + [
                en for de, en, _ in SUFFIX_RULES
                if en and de.rstrip('$') in de_real]
            return not any(e.endswith(a) for a in siblings)
        return any(e.endswith(a) for a in en_real)
    if de_real and not any(_occurs(a, g) for a in de_real):
        return False
    if en_real:
        return any(_occurs(a, e) for a in en_real)
    # 英语侧是 Ø：要求德语侧那串字母在英语里确实不出现
    return not any(_occurs(a, e) for a in de_real)


COMPILED_SUFFIX =[(re.compile(p), r, lab) for p, r, lab in SUFFIX_RULES]
COMPILED_TRIM = [(re.compile(p), r, lab) for p, r, lab in TRIM_RULES]
COMPILED_SHIFT = [(re.compile(p), r, lab) for p, r, lab in SHIFT_RULES]


def collapse_doubles(word):
    out = []
    for ch in word:
        if out and out[-1] == ch:
            continue
        out.append(ch)
    return ''.join(out)


def candidates_for(german, max_depth=3, cap=900):
    """Return {english_candidate: frozenset(labels)} generated by the rules.

    同一个英语候选常常有好几条派生路径：Universität → university 既可以走
    -ität/-ity，也可以走 -tät/-ty。这里对多条路径取并集，交给 pick_label 按
    LABEL_PRIORITY 挑一条；以前取的是交集，两条路径一撞标签就被清空，
    -ität/-ity、-logie/-logy、-istisch/-istic 这些最规整的后缀族整组消失。
    """
    start = german.lower()
    seen = {start: frozenset()}
    frontier = [(start, frozenset())]
    for _ in range(max_depth):
        nxt = []
        for word, labels in frontier:
            for compiled in (COMPILED_SUFFIX, COMPILED_TRIM, COMPILED_SHIFT):
                for rx, repl, lab in compiled:
                    for m in rx.finditer(word):
                        cand = word[:m.start()] + repl + word[m.end():]
                        if not (2 <= len(cand) <= 24) or cand == word:
                            continue
                        new_labels = labels | ({lab} if lab else frozenset())
                        old = seen.get(cand)
                        if old is not None:
                            merged = old | new_labels
                            if merged == old:
                                continue  # 没带来新标签，不必再展开一遍
                            seen[cand] = merged
                        else:
                            seen[cand] = new_labels
                        nxt.append((cand, new_labels))
                        if len(seen) > cap:
                            break
                    if len(seen) > cap:
                        break
                if len(seen) > cap:
                    break
            if len(seen) > cap:
                break
        if len(seen) > cap:
            break
        frontier = nxt
    return seen


def pick_label(labels, german=None, english=None):
    """按优先级挑一条标签；给了词对就先做表面双向验证，验不过的丢掉。"""
    best, best_rank = None, 10 ** 6
    for lab in labels:
        if german is not None and not label_holds(lab, german, english):
            continue
        rank = LABEL_RANK.get(lab, 10 ** 5)
        if rank < best_rank:
            best, best_rank = lab, rank
    return best


GENDER_SUFFIX = [
    ('f', ('ung', 'heit', 'keit', 'schaft', 'ion', 'tät', 'ität', 'ik', 'enz',
           'anz', 'ur', 'ie', 'ei', 'age', 'üre', 'itis', 'sis')),
    ('n', ('chen', 'lein', 'ment', 'tum', 'um', 'ma')),
    ('m', ('ling', 'ismus', 'ant', 'ent', 'ist', 'or', 'eur', 'ör', 'iker', 'är')),
]
# Endings that look like a gender-bearing suffix but are not one.
GENDER_SUFFIX_BLOCK = ('pion',)  # der Champion, der Spion, der Skorpion
POS_FROM_NOTES = [
    (re.compile(r'^(m|f|n)\b'), 'Substantiv'),
    (re.compile(r'^S\b'), 'Substantiv'),
    (re.compile(r'Subst'), 'Substantiv'),
    (re.compile(r'^V(t|i)?\b|^\d\.\s*V|^\+\s*sich|Verb'), 'Verb'),
    (re.compile(r'^Adj'), 'Adjektiv'),
    (re.compile(r'^Adv'), 'Adverb'),
    (re.compile(r'Präp'), 'Präposition'),
    (re.compile(r'Konj'), 'Konjunktion'),
    (re.compile(r'Pron'), 'Pronomen'),
    (re.compile(r'Num'), 'Numerale'),
    (re.compile(r'Art'), 'Artikel'),
    (re.compile(r'Interj'), 'Interjektion'),
]
ARTICLE = {'m': 'der', 'f': 'die', 'n': 'das'}


# Nouns whose gender neither the source notes nor the suffix rules give, and
# whose compound head is not in the vocabulary either. Authored by hand.
GENDER_OVERRIDE = {
    'Handy': 'n', 'Kollege': 'm', 'Vokal': 'm', 'Zentrale': 'f',
    'Fotograf': 'm', 'Junge': 'm', 'Kunde': 'm', 'Neffe': 'm', 'Bote': 'm',
    'Zeuge': 'm', 'Erbe': 'm', 'Riese': 'm', 'Löwe': 'm', 'Hase': 'm',
    'Affe': 'm', 'Rabe': 'm', 'Ochse': 'm', 'Buchstabe': 'm', 'Name': 'm',
    'Gedanke': 'm', 'Wille': 'm', 'Glaube': 'm', 'Friede': 'm', 'Same': 'm',
    'List': 'f', 'Legende': 'f', 'Champion': 'm', 'Parameter': 'm',
    'Basketball': 'm', 'Handball': 'm', 'Fußball': 'm', 'Homepage': 'f',
    'Team': 'n', 'Level': 'n', 'Ticket': 'n', 'Baby': 'n', 'Hobby': 'n',
    'Computer': 'm', 'Laptop': 'm', 'Film': 'm', 'Job': 'm', 'Chef': 'm',
    'Bus': 'm', 'Test': 'm', 'Sport': 'm', 'Park': 'm', 'Club': 'm',
    'Song': 'm', 'Star': 'm', 'Trend': 'm', 'Bar': 'f', 'Band': 'f',
    'Show': 'f', 'Serie': 'f', 'Szene': 'f', 'Firma': 'f', 'Pizza': 'f',
}

# Derivational prefixes: "Gehalt" must not inherit the gender of "Halt".
DERIV_PREFIX = {'ver', 'ent', 'zer', 'emp', 'miss', 'ge', 'be', 'er', 'un', 'ur'}


def build_gender_index(german_vocab):
    """(word -> gender for the entries that state one, set of all headwords)."""
    idx = {}
    words = set()
    for w in german_vocab:
        low = (w.get('german') or '').lower()
        if not low:
            continue
        words.add(low)
        m = re.match(r'^(m|f|n)\b', (w.get('notes') or '').strip())
        if m:
            idx.setdefault(low, m.group(1))
    return {'gender': idx, 'words': words}


def compound_gender(word, index):
    """German compounds inherit the gender of their last element.

    Both halves have to be real headwords, otherwise "Legende" would split
    into "Leg" + "Ende" and come out neuter.
    """
    low = word.lower()
    if len(low) < 7:
        return None
    idx, words = index['gender'], index['words']
    for cut in range(3, len(low) - 3):
        prefix, tail = low[:cut], low[cut:]
        if prefix in DERIV_PREFIX or prefix.rstrip('s') in DERIV_PREFIX:
            continue
        g = idx.get(tail)
        if not g:
            continue
        stems = {prefix, prefix.rstrip('s'), prefix.rstrip('n'),
                 prefix + 'e', prefix + 'en', prefix.rstrip('s') + 'en'}
        if stems & words:
            return g
    return None


def pos_and_gender(word, notes, gender_idx=None):
    notes = (notes or '').strip()
    pos = None
    for rx, label in POS_FROM_NOTES:
        if rx.search(notes):
            pos = label
            break
    gender = None
    m = re.match(r'^(m|f|n)\b', notes)
    if m:
        gender = m.group(1)
    if pos is None and word[:1].isupper():
        pos = 'Substantiv'
    if pos == 'Substantiv' and gender is None:
        gender = GENDER_OVERRIDE.get(word)
    if pos == 'Substantiv' and gender is None:
        low = word.lower()
        if not low.endswith(GENDER_SUFFIX_BLOCK):
            for g, sufs in GENDER_SUFFIX:
                for suf in sufs:
                    # the stem has to survive the suffix, else "List" -> -ist
                    if low.endswith(suf) and len(low) - len(suf) >= 3:
                        gender = g
                        break
                if gender:
                    break
    if pos == 'Substantiv' and gender is None and gender_idx:
        gender = compound_gender(word, gender_idx)
    if pos is None and word.lower().endswith('en') and word[:1].islower():
        pos = 'Verb'
    return pos, gender


def short_gloss(text, limit=28):
    text = (text or '').strip()
    text = re.sub(r'\s+', ' ', text)
    if len(text) <= limit:
        return text
    cut = text[:limit]
    for sep in ('；', ';', '，', ',', ' '):
        idx = cut.rfind(sep)
        if idx >= 8:
            return cut[:idx].strip()
    return cut.strip()


# Curated Germanic core pairs. Every one is a textbook German-English cognate;
# they are seeded explicitly so the A1 on-ramp does not depend on the miner.
CURATED = r"""
Haus|house
Wasser|water
Buch|book
Milch|milk
Hand|hand
Finger|finger
Arm|arm
Fuß|foot
Herz|heart
Auge|eye
Ohr|ear
Nase|nose
Mund|mouth
Zahn|tooth
Haar|hair
Blut|blood
Knie|knee
Vater|father
Mutter|mother
Bruder|brother
Schwester|sister
Sohn|son
Tochter|daughter
Freund|friend
Mann|man
Frau|wife
Kind|child
Name|name
Sommer|summer
Winter|winter
Sonne|sun
Mond|moon
Stern|star
Wind|wind
Regen|rain
Schnee|snow
Eis|ice
Feuer|fire
Erde|earth
Land|land
Feld|field
Wald|wood
Baum|tree
Gras|grass
Blume|flower
Apfel|apple
Brot|bread
Butter|butter
Salz|salt
Fleisch|flesh
Fisch|fish
Vogel|fowl
Kuh|cow
Kalb|calf
Schaf|sheep
Schwein|swine
Maus|mouse
Katze|cat
Hund|hound
Bär|bear
Wolf|wolf
Haus|house
Tür|door
Fenster|window
Bett|bed
Stuhl|stool
Tisch|desk
Garten|garden
Straße|street
Weg|way
Brücke|bridge
Kirche|church
Schule|school
Buch|book
Wort|word
Name|name
Zahl|tale
Hund|hound
Gold|gold
Silber|silver
Eisen|iron
Stein|stone
Glas|glass
Holz|holt
Horn|horn
Ring|ring
Ball|ball
Boot|boat
Schiff|ship
Nacht|night
Licht|light
Recht|right
acht|eight
Woche|week
Jahr|year
Tag|day
Morgen|morning
Abend|evening
Zeit|tide
Stunde|hour
Sommer|summer
alt|old
neu|new
jung|young
gut|good
lang|long
kurz|short
breit|broad
tief|deep
hoch|high
warm|warm
kalt|cold
hart|hard
weich|soft
voll|full
frei|free
grün|green
blau|blue
braun|brown
weiß|white
rot|red
schwarz|swarthy
hell|light
still|still
wild|wild
falsch|false
recht|right
link|left
beste|best
besser|better
trinken|drink
essen|eat
schlafen|sleep
sehen|see
hören|hear
sagen|say
sprechen|speak
singen|sing
sitzen|sit
stehen|stand
gehen|go
kommen|come
bringen|bring
machen|make
haben|have
geben|give
nehmen|nim
finden|find
binden|bind
helfen|help
hoffen|hope
lieben|love
leben|live
lernen|learn
lehren|teach
lachen|laugh
weinen|weep
denken|think
danken|thank
waschen|wash
werfen|warp
brechen|break
backen|bake
kochen|cook
fallen|fall
halten|hold
hängen|hang
springen|spring
schwimmen|swim
schreiben|scribe
schneiden|shred
brennen|burn
wachsen|wax
winken|wink
mahlen|mill
melken|milk
schmelzen|smelt
schmieden|smith
sinken|sink
stechen|stick
tragen|drag
wandern|wander
warten|ward
wissen|wit
zählen|tell
ziehen|tow
öffnen|open
beginnen|begin
bleiben|belive
folgen|follow
füllen|fill
hüpfen|hop
kaufen|cheap
klopfen|clop
lecken|lick
legen|lay
liegen|lie
mögen|may
müssen|must
können|can
sollen|shall
wollen|will
werden|worth
sein|be
tun|do
Sturm|storm
Welle|wave
See|sea
Ufer|over
Insel|isle
Berg|barrow
Tal|dale
Fluss|flood
Quelle|well
Bach|beck
Wolke|welkin
Himmel|heaven
Hölle|hell
Gott|god
Seele|soul
Geist|ghost
Traum|dream
Wille|will
Not|need
Schmerz|smart
Angst|angst
Ruhe|rest
Krieg|war
Frieden|peace
Volk|folk
König|king
Ritter|rider
Knecht|knight
Herr|sir
Gast|guest
Nachbar|neighbour
Nachbar|neighbor
Bruder|brother
Vetter|father
Kuchen|cake
Bier|beer
Wein|wine
Suppe|soup
Pfanne|pan
Pfad|path
Pfeffer|pepper
Pflanze|plant
Pflug|plough
Pfeife|pipe
Pfosten|post
Kupfer|copper
Waffe|weapon
offen|open
Schiff|ship
scharf|sharp
Seife|soap
Sieb|sieve
Dorf|thorp
Korb|corf
"""


def build_cognates(german_vocab, english_vocab):
    en_by_word = {}
    for entry in english_vocab:
        word = (entry.get('english') or '').strip().lower()
        if not word or not re.fullmatch(r"[a-z][a-z'-]*", word):
            continue
        en_by_word.setdefault(word, entry)
    en_collapsed = {}
    for word, entry in en_by_word.items():
        en_collapsed.setdefault(collapse_doubles(word), entry)

    de_by_word = {}
    for entry in german_vocab:
        word = (entry.get('german') or '').strip()
        if word and word not in de_by_word:
            de_by_word[word] = entry

    gender_idx = build_gender_index(german_vocab)

    en_senses_cache = {}

    def en_senses_of(entry):
        key = entry['english']
        if key not in en_senses_cache:
            en_senses_cache[key] = zh_senses(entry.get('chinese') or entry.get('meaning'))
        return en_senses_cache[key]

    results = {}
    rejected = defaultdict(int)

    def consider(de_entry, en_entry, labels, curated=False):
        german = de_entry['german']
        english = en_entry['english']
        de_s = zh_senses(de_entry.get('chinese') or de_entry.get('meaning'))
        en_s = en_senses_of(en_entry)
        if not curated and not senses_agree(de_s, en_s):
            rejected['gloss_mismatch'] += 1
            return
        score = similarity(german, english)
        if score < 40:
            rejected['too_distant'] += 1
            return
        pos, gender = pos_and_gender(german, de_entry.get('notes'), gender_idx)
        if pos is None:
            rejected['no_pos'] += 1
            return
        if pos == 'Substantiv' and gender is None:
            rejected['noun_without_gender'] += 1
            return
        gloss = short_gloss(de_entry.get('chinese') or de_entry.get('meaning'))
        if not gloss:
            rejected['no_gloss'] += 1
            return
        label = ('identisch' if norm_compare(german) == norm_compare(english)
                 else pick_label(labels, german, english))
        prev = results.get(german)
        if prev is not None and prev['similarityScore'] >= score and not curated:
            return
        results[german] = {
            'german': german,
            'display': ('%s %s' % (ARTICLE[gender], german)) if gender else german,
            'english': english,
            'chinese': gloss,
            'patternType': label,
            'similarityScore': score,
            'difficulty': 'easy' if score >= 70 else 'medium',
            'rank': de_entry.get('rank'),
            'pos': pos,
            'gender': gender,
            'englishChinese': short_gloss(en_entry.get('chinese') or ''),
            'englishRank': en_entry.get('rank'),
            'falseFriend': False,
            'source': 'german-vocabulary.js × english-vocabulary.js (ECDICT) + Lautverschiebung rules',
        }

    # (a) curated Germanic core
    for line in CURATED.strip().split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        german, english = [p.strip() for p in line.split('|')]
        de_entry = de_by_word.get(german)
        en_entry = en_by_word.get(english.lower())
        if not de_entry or not en_entry:
            rejected['curated_unresolved'] += 1
            continue
        cands = candidates_for(german)
        labels = cands.get(english.lower(), frozenset())
        consider(de_entry, en_entry, labels, curated=True)

    # (b) rule-generated pairs, gated on Chinese-gloss agreement
    for german, de_entry in de_by_word.items():
        if german in results:
            continue
        if not re.fullmatch(r"[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß-]{1,17}", german):
            continue
        cands = candidates_for(german)
        best = None
        # 只取分数最高的那个候选，同分的由 cands 的插入顺序（也就是规则表的
        # 排列）决定。这意味着往规则表里加一条规则就可能换掉一条同分的词对
        # （scheinen 到 shine 和到 seine 都是 62 分），所以新加的规则要写窄、
        # 写到真实的音变环境上，加完必须对比前后的词对增删。
        for cand, labels in cands.items():
            hit = en_by_word.get(cand) or en_collapsed.get(collapse_doubles(cand))
            if not hit:
                continue
            score = similarity(german, hit['english'])
            if best is None or score > best[1]:
                best = (hit, score, labels)
        if best is None:
            continue
        consider(de_entry, best[0], best[2])

    # (c) 组太小的并入 Other：一条规律只兜住三两个词，界面上单独出一张卡片
    #     只会让人以为那是一条规律。identisch 不受此限，它不是规则标签。
    #     并入前先试一次更笼统的后缀族：Biografie/biography 走的是 -grafie/-graphy
    #     这条只有 3 个词的派生路径，但它同时实实在在是一条 -ie/-y，落到 Other 冤枉。
    #     只放宽到后缀标签（两头都锚在词尾，误贴的余地小），字母标签不做这个回退。
    #
    #     回退会把词从一个组挪到另一个组，所以它自己就可能把某个组抽到线下，
    #     得反复跑到不动点。跑够轮数不等于收敛：轮数用完时必须真的再数一遍，
    #     否则数据一变就可能悄悄发出一个 thin 组。
    def thin_labels():
        sizes = defaultdict(int)
        for c in results.values():
            if c['patternType']:
                sizes[c['patternType']] += 1
        return {lab: n for lab, n in sizes.items()
                if n < MIN_PATTERN_GROUP and lab != 'identisch'}

    MAX_THIN_PASSES = 8
    for _ in range(MAX_THIN_PASSES):
        thin = thin_labels()
        if not thin:
            break
        for c in results.values():
            if c['patternType'] not in thin:
                continue
            fallback = pick_label(
                [lab for _, _, lab in SUFFIX_RULES if lab not in thin],
                c['german'], c['english'])
            c['patternType'] = fallback
            rejected['pattern_group_too_thin'] += 1

    leftover = thin_labels()
    if leftover:
        raise RuntimeError(
            'MIN_PATTERN_GROUP=%d 未收敛：跑满 %d 轮后仍有小组 %s。'
            '不要放宽阈值，先查是哪条规则在来回抢词。'
            % (MIN_PATTERN_GROUP, MAX_THIN_PASSES,
               ', '.join('%s=%d' % kv for kv in sorted(leftover.items()))))

    return list(results.values()), rejected
# --------------------------------------------------------------------------
# 3b. Falsche Freunde
#     german | english look-alike | correct english | german meaning (zh) |
#     what the english look-alike means (zh) | german word for the look-alike | level
# --------------------------------------------------------------------------

FALSE_FRIENDS = r"""
Gift|gift|poison|毒，毒物|礼物|Geschenk|B1
bekommen|become|to get, to receive|得到，收到|变成|werden|A2
also|also|so, therefore|所以，那么|也|auch|A1
Rock|rock|skirt|裙子|岩石；摇滚|Fels|A2
Chef|chef|boss, superior|老板，上司|厨师长|Küchenchef|A2
Handy|handy|mobile phone|手机|方便的|praktisch|A1
Rat|rat|advice|建议，忠告|老鼠|Ratte|B1
brav|brave|well-behaved|听话的，乖的|勇敢的|mutig|A2
eventuell|eventually|possibly, perhaps|可能，也许|最终|schließlich|B1
sensibel|sensible|sensitive|敏感的|明智的|vernünftig|B2
Art|art|kind, type, manner|种类，方式|艺术|Kunst|A2
bald|bald|soon|很快，不久|秃头的|kahl|A1
Bad|bad|bath, bathroom|浴室，洗澡|坏的|schlecht|A1
fast|fast|almost|几乎|快的|schnell|A1
Gymnasium|gymnasium|grammar school|文理中学|体育馆|Turnhalle|B1
Kind|kind|child|孩子|善良的|freundlich|A1
List|list|cunning, ruse|计谋，狡计|清单|Liste|C1
Mist|mist|manure; rubbish|粪肥；糟糕|薄雾|Nebel|B1
Not|not|hardship, need|困境，急需|不|nicht|B1
See|see|lake; sea|湖；海|看见|sehen|A2
Tag|tag|day|天，日|标签|Etikett|A1
Wand|wand|wall|墙|魔杖|Zauberstab|A2
aktuell|actually|current, up-to-date|当前的，最新的|实际上|tatsächlich|B1
Aktion|action|campaign; special offer|活动，促销|行动|Handlung|B1
Argument|argument|reason, point|论据，理由|争吵|Streit|B2
Boot|boot|boat|小船|靴子|Stiefel|A2
Brand|brand|fire|火灾|品牌|Marke|B2
Dose|dose|tin, can|罐头|剂量|Dosis|B1
Fabrik|fabric|factory|工厂|织物|Stoff|A2
Fahrt|fart|journey, ride|行程，行驶|放屁|Furz|A2
Gang|gang|corridor; gear|走廊；档位|团伙|Bande|B1
genial|genial|brilliant|天才的，绝妙的|亲切的|freundlich|B2
hell|hell|bright, light|明亮的|地狱|Hölle|A1
Hut|hut|hat|帽子|小屋|Hütte|A2
Kollege|college|colleague|同事|大学|Hochschule|A2
Konkurrenz|concurrence|competition|竞争|同时发生|Übereinstimmung|B2
kontrollieren|to control|to check|检查，核对|操控|steuern|B1
Kost|cost|food, diet|饮食|费用|Kosten|B2
Kritik|critic|criticism, review|批评，评论|批评家|Kritiker|B2
kurios|curious|odd, strange|奇特的|好奇的|neugierig|C1
Lager|lager|warehouse; camp|仓库；营地|淡啤酒|helles Bier|B2
Lust|lust|desire, inclination|兴致，愿望|色欲|Begierde|A2
Mantel|mantle|coat|大衣|斗篷|Umhang|A2
Mappe|map|folder|文件夹|地图|Karte|B1
Marmelade|marmalade|jam|果酱|柑橘酱|Orangenmarmelade|A2
Menü|menu|set meal|套餐|菜单|Speisekarte|B1
Note|note|grade, mark|分数，成绩|便条|Notiz|A2
Pension|pension|guest house|小旅馆|养老金|Rente|B1
Personal|personal|staff, personnel|员工，人事|个人的|persönlich|B1
Prospekt|prospect|brochure|宣传册|前景|Aussicht|B2
Provision|provision|commission|佣金|供应|Versorgung|C1
realisieren|to realize|to implement|实现，落实|意识到|bemerken|B2
Regal|regal|shelf|架子|王的|königlich|A2
Rente|rent|pension|养老金|租金|Miete|B1
Rezept|receipt|recipe; prescription|食谱；处方|收据|Quittung|B1
Roman|Roman|novel|长篇小说|罗马的|römisch|A2
Schal|shawl|scarf|围巾|披肩|Umhängetuch|A2
Sekt|sect|sparkling wine|气泡酒|教派|Sekte|B1
seriös|serious|reputable|正经的，可靠的|严肃的|ernst|B2
Sinn|sin|sense, meaning|意义，感觉|罪|Sünde|A2
spenden|to spend|to donate|捐赠|花费|ausgeben|B2
Strom|storm|electricity; current|电；水流|暴风雨|Sturm|B1
sympathisch|sympathetic|likeable|讨人喜欢的|同情的|mitfühlend|B1
Tablett|tablet|tray|托盘|药片|Tablette|B1
Taste|taste|key, button|按键|味道|Geschmack|B1
Termin|term|appointment, deadline|约会，期限|学期|Semester|A2
übersehen|to oversee|to overlook|忽略，看漏|监督|beaufsichtigen|B2
Vokal|vocal|vowel|元音|声乐的|gesanglich|C1
wenn|when|if, whenever|如果，每当|什么时候|wann|A1
wer|where|who|谁|哪里|wo|A1
wo|who|where|哪里|谁|wer|A1
wollen|woollen|to want|想要|羊毛的|wollig|A1
Zentrale|central|headquarters|总部|中心的|zentral|B2
Dom|dome|cathedral|大教堂|圆顶|Kuppel|B1
Etikett|etiquette|label|标签|礼节|Etikette|B2
Fantasie|fantasy|imagination|想象力|幻想|Fantasiewelt|B1
Fotograf|photograph|photographer|摄影师|照片|Foto|B1
irritieren|to irritate|to confuse|使困惑|激怒|verärgern|C1
Kaution|caution|deposit|押金|谨慎|Vorsicht|B2
konsequent|consequent|consistent, resolute|一贯的，坚定的|随之而来的|folgend|B2
Physiker|physician|physicist|物理学家|内科医生|Arzt|B2
Sympathie|sympathy|liking|好感|同情|Mitleid|B2
blamieren|to blame|to embarrass|使出丑|责备|beschuldigen|B2
Fell|fell|fur, hide|毛皮|砍倒|fällen|B2
Konfession|confession|denomination|教派|忏悔|Beichte|C1
Ambulanz|ambulance|outpatient clinic|门诊部|救护车|Krankenwagen|C1
"""


def build_false_friends(de_by_word, en_by_word, gender_idx=None):
    out = []
    missing = []
    for row in parse_table(FALSE_FRIENDS, 7):
        german, look, correct_en, de_zh, look_zh, de_for_look, level = row
        de_entry = de_by_word.get(german)
        if de_entry is None:
            missing.append(german)
            continue
        pos, gender = pos_and_gender(german, de_entry.get('notes'), gender_idx)
        if pos is None:
            pos = 'Substantiv' if german[:1].isupper() else 'Verb'
        if pos == 'Substantiv' and gender is None:
            missing.append(german + ' (no gender)')
            continue
        out.append({
            'german': german,
            'display': ('%s %s' % (ARTICLE[gender], german)) if gender else german,
            'english': correct_en,
            'chinese': de_zh,
            'patternType': 'falscher Freund',
            'similarityScore': similarity(german, look),
            'difficulty': 'medium',
            'rank': de_entry.get('rank'),
            'pos': pos,
            'gender': gender,
            'englishChinese': de_zh,
            'englishRank': (en_by_word.get(look.lower()) or {}).get('rank'),
            'falseFriend': True,
            'falseFriendOf': look,
            'falseFriendChinese': look_zh,
            'germanFor': de_for_look,
            'level': level,
            'source': AUTHORED,
        })
    return out, missing


# --------------------------------------------------------------------------
# 4. Course enrichment
# --------------------------------------------------------------------------

# Every one of the 144 course grammar labels mapped onto a slug that exists in
# GERMAN_GRAMMAR_DATA.content, so the tags stop being dead text.
GRAMMAR_SLUGS = {
    'Adverbien/Adjektive': '副词/副词',
    'Akkusativ': '冠词/冠词',
    'Dativ': '冠词/冠词',
    'Dativ 人称代词': '代词/代词',
    'Dativ 介词': '介词/介词支配格',
    'Dativ 宾语': '句法/句法',
    'Dativ/Akkusativ 代词顺序': '句法/句法',
    'Futur I/II': '动词/变位',
    'Genitiv': '冠词/冠词',
    'Genitiv 介词': '介词/介词支配格',
    'Genitiv 属性': '名词/名词',
    'Imperativ': '动词/叙述方式',
    'Konjunktiv I': '动词/叙述方式',
    'Konjunktiv II': '动词/叙述方式',
    'Modalsätze': '连词/连词',
    'Partizip I/II 作定语': '动词/分词',
    'Partizip I/II 作形容词': '动词/分词',
    'Partizipialkonstruktionen': '动词/分词',
    'Perfekt': '动词/变位',
    'Perfekt mit haben/sein': '动词/变位',
    'Plusquamperfekt': '动词/变位',
    'Präsens': '动词/变位',
    'Präteritum': '动词/变位',
    'Präteritum von haben/sein': '动词/变位',
    'Zustandspassiv': '动词/行动方式',
    'als/wenn': '连词/连词',
    'bevor/seit/während': '连词/连词',
    'brauchen': '动词/动词',
    'brauchen + zu': '动词/不定式',
    'damit': '连词/连词',
    'dass/weil 从句': '连词/连词',
    'dürfen': '动词/动词',
    'einander': '代词/代词',
    'es 的功能': '代词/代词',
    'finale Nebensätze': '连词/连词',
    'für/ohne': '介词/介词支配格',
    'haben': '动词/动词',
    'je ... desto': '连词/连词',
    'kein': '冠词/冠词',
    'können': '动词/动词',
    'man': '代词/代词',
    'mit + Dativ': '介词/介词支配格',
    'müssen': '动词/动词',
    'n-Deklination': '名词/阳性弱变化',
    'nachdem': '连词/连词',
    'obwohl': '连词/连词',
    'ohne zu/ohne dass': '动词/不定式',
    'sein': '动词/动词',
    'sollte': '动词/动词',
    'trotz': '介词/介词支配格',
    'um ... zu': '动词/不定式',
    'welch-': '代词/代词',
    'welch- 与 was für ein': '代词/代词',
    'wenn 从句': '连词/连词',
    'wenn 条件句': '连词/连词',
    'werden + Infinitiv': '动词/变位',
    'werden 的功能': '动词/动词',
    'wissen': '动词/动词',
    'wollen': '动词/动词',
    'während/wegen': '介词/介词支配格',
    'zu + Infinitiv': '动词/不定式',
    '不可分前缀动词': '动词/动词前缀',
    '不可分动词': '动词/动词前缀',
    '不定代词': '代词/代词',
    '不定代词作代词': '代词/代词',
    '不定冠词后的形容词词尾': '形容词/形容词变格',
    '主观用法情态动词': '动词/动词',
    '二项连接词': '连词/连词',
    '人称代词': '代词/代词',
    '介词 auf 与 in': '介词/介词辨析',
    '介词宾语': '动词/用法模式',
    '代副词': '副词/副词',
    '代词功能': '代词/代词',
    '以 W-Wort 或 ob 引导的从句': '连词/连词',
    '关系从句': '句法/句法',
    '关系从句 mit was/wo(r)-': '句法/句法',
    '关系代词 was 与 Genitiv': '代词/代词',
    '动词名词化': '名词/名词',
    '单复数': '名词/名词',
    '双向介词': '介词/介词支配格',
    '反身代词': '代词/代词',
    '句中时间/原因/情态/地点成分': '句法/句法',
    '句框': '句法/句法',
    '可分/不可分动词': '动词/动词前缀',
    '可分动词': '动词/动词前缀',
    '可分动词 Präteritum': '动词/动词前缀',
    '同义转述': '其他/其他',
    '同位语': '句法/句法',
    '名词/动词/形容词介词搭配': '动词/用法模式',
    '名词动词搭配': '动词/用法模式',
    '名词化': '名词/名词',
    '名词化形容词': '名词/名词',
    '因果主从句': '连词/连词',
    '国际名词复数': '名词/名词',
    '图表论证': '其他/其他',
    '复杂时态与 Konjunktiv II': '动词/叙述方式',
    '定冠词与不定冠词': '冠词/冠词',
    '对立/选择/情态从句': '连词/连词',
    '属格文学表达': '名词/名词',
    '并列连词': '连词/连词',
    '形容词词尾': '形容词/形容词变格',
    '情态动词 Perfekt': '动词/动词',
    '情态动词 Präteritum': '动词/动词',
    '情态动词 mögen': '动词/动词',
    '情态动词 sollen': '动词/动词',
    '情态动词被动态': '动词/行动方式',
    '情态动词被动态从句': '动词/行动方式',
    '情态动词转述': '动词/叙述方式',
    '情态表达': '动词/动词',
    '成对连词': '连词/连词',
    '扩展分词': '动词/分词',
    '指代副词': '副词/副词',
    '指示冠词与代词': '代词/代词',
    '文本照应': '句法/句法',
    '文本结构': '句法/句法',
    '方位副词': '副词/副词',
    '无主句被动态': '动词/行动方式',
    '无冠词形容词词尾': '形容词/形容词变格',
    '时间表达': '其他/其他',
    '条件句 mit sollen': '连词/连词',
    '概括性关系从句': '句法/句法',
    '正式定义': '其他/其他',
    '比较级与最高级': '形容词/形容词',
    '比较级形容词词尾': '形容词/形容词变格',
    '派生形容词': '形容词/形容词',
    '演讲与读者来信结构': '其他/其他',
    '物主冠词': '冠词/冠词',
    '科技语体': '其他/其他',
    '绝对比较级': '形容词/形容词',
    '虚拟语气': '动词/叙述方式',
    '衔接手段': '句法/句法',
    '被动态': '动词/行动方式',
    '被动态替代形式': '动词/行动方式',
    '要求句': '动词/叙述方式',
    '语体分析': '其他/其他',
    '语序': '句法/句法',
    '语气小品词': '句法/句法',
    '转述立场': '动词/叙述方式',
    '过去时 Konjunktiv II': '动词/叙述方式',
    '连接副词': '副词/副词',
    '连接词意义': '连词/连词',
    '连续/让步连接词': '连词/连词',
    '间接引语': '动词/叙述方式',
    '陈述句与疑问句': '句法/句法',
}

# unit id | German morphemes (space separated) | Chinese gloss keywords
UNIT_TOPICS = r"""
A1-01|Hallo Gruß grüß Tag Name Vorname Herr Frau Land Stadt Zahl Nummer Sprache heißen kommen wohnen sprechen buchstabieren Alter Adresse Telefon Deutsch Österreich Schweiz Familie Person willkommen|问候 名字 国家 号码 数字
A1-02|Stadt Dorf Ort Haus Straße Platz Gebäude Kirche Markt Brücke Turm Bild Foto Ding Mensch Leute Region Gegend Norden Süden Westen Osten klein groß alt neu hoch|城市 村庄 建筑 地方 照片
A1-03|Familie Eltern Vater Mutter Bruder Schwester Kind Sohn Tochter Oma Opa Onkel Tante Hobby Freizeit Uhr Woche Monat Brief Geschwister Ehe heiraten Verwandte Enkel|家庭 父母 兄弟 姐妹 爱好 星期
A1-04|Lebensmittel Brot Milch Käse Obst Gemüse Fleisch Fisch Ei Zucker Salz kaufen bestellen bezahlen Preis Geld Euro Cent Café Markt Laden Geschäft Kasse billig teuer|食品 购买 价格 商店 钱
A1-05|Beruf Arbeit Arbeiter Kollege Chef Firma Büro kochen essen trinken Küche Restaurant Speise Getränk früher heute Leute Stunde Job Lehrer Arzt Student Verkäufer|职业 工作 吃 喝 饭
A1-06|Treffen treffen planen Plan Termin Vergangenheit Postkarte Jahr Lebenslauf Uhrzeit Minute Stunde Kalender Datum gestern morgen Verabredung besuchen Besuch warten|见面 计划 时间 日期 过去
A1-07|Hotel Zimmer Wetter Reise reisen Rezeption reservieren Person arbeiten Freizeit Empfang Bett Dusche Koffer Gast Urlaub Sonne Regen Schnee Wind warm kalt buchen|旅馆 天气 房间 旅行 预订
A1-08|Straße Platz Orientierung Kleidung Kleid Hose Hemd Schuh Jacke Mantel Farbe Größe Gedicht Projekt Richtung links rechts geradeaus Ecke Karte Weg Norden|方向 衣服 颜色 尺寸 街道
A1-09|Verkehr Bahn Zug Bus Auto Fahrrad fahren Grenze Sprache Zeitung vergleichen Land Dorf Stadt Straßenbahn Haltestelle Fahrkarte Flughafen Flugzeug Bahnhof abfahren ankommen|交通 火车 汽车 车站 比较
A1-10|Wohnung Haus Miete mieten Möbel Tisch Stuhl Schrank Küche Bad Zimmer Fest feiern Meinung wohnen organisieren Balkon Keller Garten Nachbar Vermieter umziehen|住房 家具 房间 意见 庆祝
A2-11|Universität Studium studieren Wohnung Möbel Anzeige Wochenende Information Kurs lesen schreiben Student Semester Vorlesung Prüfung Bibliothek Fach lernen Note Seminar|大学 学习 广告 课程 周末
A2-12|Reise Hauptstadt Gebäude Kultur Geschichte Datum Jahreszeit Lied Museum Denkmal Schloss besichtigen Frühling Sommer Herbst Winter Führung Tourist Sehenswürdigkeit|首都 文化 历史 季节 参观
A2-13|Glückwunsch Landschaft Zeitung Wettbewerb Sport Gewinner Europa fragen berichten beschreiben Spiel Mannschaft Verein trainieren Sieg gewinnen verlieren Meisterschaft Preis|祝贺 风景 体育 比赛 报道
A2-14|Termin Körper Kopf Hand Fuß Auge Ohr Zahn Arzt Praxis Rat Museum Geschichte Krankheit krank gesund Medikament Apotheke Schmerz Fieber pflegen untersuchen|身体 医生 健康 生病 建议
A2-15|Praktikum Wunsch Höflichkeit Reise Österreich Haus Brief Kaffee bitten fragen wünschen danken höflich Einladung einladen antworten Formular Anrede Gruß|愿望 礼貌 邀请 信 咖啡
A2-16|Bank Konto Geld überweisen sparen Verabredung Unternehmen Kommunikation Firma Nachricht Wissen Freizeit Gast Kredit Zins bar Karte E-Mail Telefon anrufen|银行 账户 汇款 通讯 公司
A2-17|Erfindung Erfinder erfinden Ausbildung Meinung Besonderheit Lebenslauf Familie Region informieren erzählen Technik Maschine Werkzeug Patent entwickeln Geschichte Biografie|发明 培训 意见 地区 讲述
A2-18|Beruf Firma Bewerbung bewerben Kollege Computer Vergangenheit Arbeit Gespräch regelmäßig Stelle Vertrag Gehalt Abteilung Leiter Erfahrung Zeugnis kündigen einstellen|求职 公司 同事 电脑 谈话
A2-19|Küste Insel Meer Bevölkerung Natur Erlebnis Sprache Getränk Geschichte Sturm Hafen Schiff Fisch Welle Strand Wind Nebel Boot fischen segeln|海 岛 自然 风暴 港口
A2-20|Ausländer Unfall Auto Versicherung Lebenslauf Sprache Einwanderung Familie Region Teil Fahrer Führerschein Polizei Schaden retten helfen Notruf Krankenhaus melden|事故 保险 外国人 移民 救助
B1-21|Medien Fernsehen Radio Zeitung Zeitschrift Sendung Nachricht Werbung Journalist Publikum Bericht Interview Redaktion Programm senden veröffentlichen Leser Zuschauer|媒体 电视 广播 报纸 广告
B1-22|Bildung Schule Lehrer Schüler Unterricht Klasse Abitur Note Prüfung Studium Ausbildung lernen unterrichten Wissen Fach Zeugnis Universität Hochschule Lehrplan|教育 学校 教师 考试 学习
B1-23|Umwelt Natur Klima Wetter Energie Strom Wasser Müll Abfall schützen Schutz Luft Wald Erde Verschmutzung recyceln sparen erneuerbar Umweltschutz Sonne|环境 气候 能源 保护 污染
B1-24|Gesundheit Ernährung Sport Bewegung Krankheit Arzt Medizin Vorsorge Stress Schlaf essen trinken rauchen Diät Gewicht fit Therapie Behandlung heilen|健康 营养 运动 疾病 治疗
B1-25|Arbeitsmarkt Beruf Stelle Bewerbung Vorstellung Gehalt Karriere Chef Kollege Team Projekt Aufgabe Verantwortung Erfolg selbstständig Praktikum Arbeitgeber Arbeitnehmer|职业 岗位 面试 团队 责任
B1-26|Reise Tourismus Urlaub Hotel Flug Flughafen Bahn Ticket Gepäck Ziel buchen besichtigen Ausland Sehenswürdigkeit Reiseführer Souvenir Abenteuer erleben|旅游 假期 机场 行李 目的地
B1-27|Gesellschaft Politik Staat Regierung Wahl Bürger Recht Gesetz Freiheit Meinung diskutieren wählen Partei Parlament Demokratie Verantwortung Gemeinschaft|社会 政治 国家 选举 法律
B1-28|Wohnen Wohnung Miete Vermieter Nachbar Umzug Möbel Einrichtung Haushalt Reparatur renovieren Vertrag Kaution Zimmer Küche Bad Balkon Heizung Strom|住房 租金 邻居 搬家 家务
B1-29|Kultur Kunst Musik Theater Film Literatur Buch Autor Künstler Ausstellung Konzert Museum Roman Gedicht Schauspieler Regisseur Publikum Bühne|文化 艺术 音乐 电影 文学
B1-30|Prüfung Aufgabe Text Zusammenfassung Argument Meinung begründen erklären beschreiben vergleichen Stellungnahme Vortrag Präsentation Notiz Gliederung Ergebnis|考试 任务 论据 说明 总结
B2-01|Reise reisen Urlaub Fahrt fahren Flug fliegen Verkehr Mobilität Unterkunft Hotel Ausflug Ziel Route Gepäck Bahn Zug Abfahrt Ankunft Angebot Planung Aussicht Argument Meinung buchen unterwegs|旅行 出行 交通 计划 观点
B2-02|Schönheit schön Körper Gesundheit gesund Haut Haar Auge Gesicht Figur Pflege Mode Stil Sport Fitness Ernährung Gefühl Wirkung Umfrage Meinung Augenblick Erscheinung|美 身体 健康 外表 感觉
B2-03|Nachbar Nachbarschaft Streit streiten Konflikt Lärm Zuhören zuhören Verständnis Rücksicht Toleranz Vermittlung Lösung Gespräch Kompromiss Beschwerde Miete Wohnung Haus Garten Kultur fremd|邻居 冲突 争执 理解 解决
B2-04|Gegenstand Ding Sache Wert wertvoll Material Form Farbe Größe Gewicht Beschreibung Produkt Präsentation Handel Besitz Konsum sammeln kaufen verkaufen Ordnung Erinnerung Werkzeug|物品 东西 价值 描述 产品
B2-05|Zusammenarbeit Verständigung Verhandlung verhandeln Kompromiss Dialog Absprache Vereinbarung Partner Partnerschaft Ehe heiraten Scheidung Vertrauen Rücksicht Reaktion Verhalten Plan Ziel gemeinsam|合作 协商 对话 婚姻 共同
B2-06|Arbeit arbeiten Beruf beruflich Bewerbung bewerben Stelle Kollege Chef Büro Karriere Vertrag Gehalt Lohn Aufgabe Team Firma Betrieb Globalisierung Arbeitsplatz Arbeitszeit Anweisung|工作 职业 求职 公司 同事
B2-07|Natur Umwelt Klima Wetter Jahreszeit Pflanze Baum Tier Wald Boden Wasser Luft Katastrophe Erdbeben Sturm Ernährung Landwirtschaft Forschung Medizin Heilung natürlich ökologisch|自然 环境 气候 植物 营养
B2-08|Wissen wissen Können können Lernen lernen Kenntnis Erkenntnis Gedächtnis Bildung Ausbildung Schule Universität Studium Forschung Fähigkeit Begabung Erfahrung Weiterbildung Prüfung Methode Denken|知识 能力 学习 教育 记忆
B2-09|Gefühl Emotion Stimmung Angst Freude Trauer Wut Liebe Hoffnung Enttäuschung Ausdruck Empfindung Reaktion Erzählung Geschichte Kunst Musik Bedeutung Situation Verstand Erlebnis|感情 情绪 恐惧 快乐 表达
B2-10|Ausland ausländisch Organisation Behörde Formular Antrag Vertrag Visum Aufenthalt Anpassung Kultur Sitte Bewerbung Arbeitsplatz Firma Telefon Termin Plan Umzug Erfahrung international|国外 机关 合同 文化 适应
B2-11|Leistung leisten Erfolg erfolgreich Misserfolg Scheitern Gründung gründen Selbstständigkeit Wettbewerb Preis Auszeichnung Ziel Motivation Intelligenz Begabung Anstrengung Schule Prüfung Rede Firma|成绩 成功 失败 竞争 奖项
B2-12|Sprache sprachlos Gespräch Smalltalk Konversation Schweigen schweigen Geste Mimik Hand Fuß Blick Körpersprache Musik Ton Beschwerde Sprichwort Ironie Ausdruck Kommunikation Mitteilung|语言 交谈 手势 音乐 投诉
C1-01|Netzwerk Gemeinschaft Marketing Interview Computer Austausch Individualität Gruppe Pressekonferenz Standpunkt Kommentar Beziehung Kontakt Plattform Nutzer vernetzen|网络 社群 交流 观点 关系
C1-02|Kunst Therapie Geld Künstler Leben Museum Schauspiel Musik Kolumne Erfahrung Definition Gemälde Ausstellung Skulptur Galerie kreativ Werk|艺术 治疗 艺术家 博物馆 作品
C1-03|Suche Stelle Kompetenz Vorstellung Arbeitsvertrag Verhandlung Anzeige Ausbildung Qualifikation Lebenslauf Bewerbung Arbeitstag Gehalt Personal Auswahl|求职 能力 合同 谈判 资格
C1-04|Engagement Ehrenamt Verein Hilfe Organisation Spende Frieden Preisträger Tätigkeit Förderung Freiwillige Empfänger Unterstützung helfen fördern|志愿 协会 帮助 捐赠 组织
C1-05|Tabu Kommunikation Ironie Lüge Korrespondenz Redewendung Geschlecht Sprache Täuschung Stil Dialog Anspielung Wahrheit Höflichkeit andeuten|禁忌 交流 谎言 语言 风格
C1-06|Jugend Alter Bevölkerung Generation Sprache Interview Entwicklung Erfahrung Konflikt Text Jugendliche Senior Rente Nachwuchs altern|青年 年龄 人口 一代 冲突
C1-07|Glück Liebe Verzicht Schokolade Lebensgeschichte Unterhaltung Lebenslauf Erzählung Fortsetzung Genuss Erfolg Erfahrung Zufriedenheit Sehnsucht|幸福 爱情 放弃 享受 成功
C1-08|Technik Entwicklung Erfindung Roboter Medizin Forschung Zukunft Industrie Zelle Intelligenz Innovation Haushalt Automatisierung Fortschritt digital|技术 发明 机器人 医学 未来
C1-09|Geld Währung Bank Dienstleistung Kunde Kündigung Kauf Verbraucher Verhandlung Kredit Rechnung Beratung Konto Zins Investition Vermögen|货币 银行 服务 消费 账单
C1-10|Sinn Sehen Riechen Schmecken Fühlen Wahrnehmung Duft Geschmack Haut Lärm Musik Auge Ohr Nase Zunge empfinden spüren|感觉 视觉 气味 味道 噪音
C1-11|Globalisierung Karriere Wirtschaft Klima Wandel Entwicklung Schutz Vortrag Grafik Diskussion Welthandel Umwelt international Konzern Markt|全球化 经济 气候 环境 讨论
C1-12|Wandel Wert Lernen Veränderung Zeit Rhythmus Arbeit Gesellschaft Original Tanz Erziehung Zukunft Tradition Fortschritt Umbruch verändern|变化 价值 学习 社会 传统
"""

FUNCTION_POS = re.compile(r'^(Präp|Konj|Pron|Art|Num|Interj|Abk)')
LEVEL_RANK_CAP = {'A1': 2800, 'A2': 4800, 'B1': 8000, 'B2': 12000, 'C1': 16000}
LEVEL_SENT_LEN = {'A1': (18, 46), 'A2': (18, 56), 'B1': (22, 66), 'B2': (26, 78), 'C1': (30, 88)}
HEADWORD_TARGET = 42


def normalize_headword(value):
    return unicodedata.normalize('NFKC', str(value or '')).lower().replace('/', '').strip()


def build_course(course, german_vocab, pairs, grammar_slugs_available):
    # replicate german-course.js / tests/test-german-course-data.js index build
    index = {}
    for word in german_vocab:
        for value in (word.get('german'), word.get('display')):
            key = normalize_headword(value)
            if key and key not in index:
                index[key] = word

    topics = {}
    for line in UNIT_TOPICS.strip().split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        unit_id, morphemes, zh_keys = [p.strip() for p in line.split('|')]
        topics[unit_id] = (morphemes.split(), zh_keys.split())

    vocab_words = set((w.get('german') or '').lower() for w in german_vocab)
    used_globally = defaultdict(int)
    stats = {'units': 0, 'headwords': 0, 'examples': 0, 'unitsUnderTarget': [],
             'unitsWithoutExamples': [], 'unresolvedSlugs': set()}
    enriched = {}
    used_sentences = set()

    for level in course['levels']:
        cap = LEVEL_RANK_CAP[level['id']]
        lo, hi = LEVEL_SENT_LEN[level['id']]
        for unit in level['units']:
            morphemes, zh_keys = topics.get(unit['id'], ([], []))
            headwords, seen_ids = [], set()

            # keep every original syllabus headword (they all resolve today)
            for headword in unit['headwords']:
                hit = index.get(normalize_headword(headword))
                if hit is None or id(hit) in seen_ids:
                    continue
                seen_ids.add(id(hit))
                headwords.append(headword)

            def take(word):
                german = word.get('german') or ''
                if not re.fullmatch(r"[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß.-]*", german):
                    return False
                if index.get(normalize_headword(german)) is not word:
                    return False
                if id(word) in seen_ids:
                    return False
                gloss = (word.get('meaning') or word.get('chinese') or '').strip()
                if len(gloss) < 2:
                    return False
                seen_ids.add(id(word))
                headwords.append(german)
                return True

            candidates = []
            for word in german_vocab:
                rank = word.get('rank') or 10 ** 6
                if rank > cap:
                    continue
                german = word.get('german') or ''
                if used_globally[german] >= 2:
                    continue
                if FUNCTION_POS.search((word.get('notes') or '').strip()):
                    continue  # prepositions/conjunctions/pronouns are not topical
                low = german.lower()
                noun = german[:1].isupper()
                hit = False
                for m in morphemes:
                    ml = m.lower()
                    # a capitalised morpheme may only pull nouns and vice versa,
                    # else "Ehe" grabs "eher" and "Zug" grabs "zugeben"
                    if m[:1].isupper() != noun:
                        continue
                    if low.startswith(ml) and len(low) <= len(ml) + 5:
                        hit = True
                        break
                    if len(ml) >= 5 and low.endswith(ml) and len(low) > len(ml) + 2:
                        # only as the head of a real compound: Nahverkehr yes,
                        # "preisen" from "reisen" no
                        head = low[:-len(ml)]
                        if head in vocab_words or head.rstrip('s') in vocab_words:
                            hit = True
                            break
                if not hit:
                    gloss = word.get('meaning') or ''
                    for key in zh_keys:
                        if key and key in gloss:
                            hit = True
                            break
                if hit:
                    candidates.append((used_globally[german], rank, word))
            candidates.sort(key=lambda t: (t[0], t[1]))
            for _, _, word in candidates:
                if len(headwords) >= HEADWORD_TARGET:
                    break
                take(word)

            for hw in headwords:
                used_globally[hw] += 1
            if len(headwords) < HEADWORD_TARGET:
                stats['unitsUnderTarget'].append('%s(%d)' % (unit['id'], len(headwords)))

            # example sentences: Tatoeba pairs that use this unit's vocabulary
            hw_regexes = [re.compile(r'\b%s\w{0,4}\b' % re.escape(h), re.IGNORECASE)
                          for h in headwords if len(h) >= 4]
            scored = []
            for de, zh in pairs:
                if not (lo <= len(de) <= hi):
                    continue
                if de in used_sentences:
                    continue
                hits, lead = 0, None
                for idx_rx, rx in enumerate(hw_regexes):
                    if rx.search(de):
                        hits += 1
                        if lead is None:
                            lead = idx_rx
                        if hits >= 3:
                            break
                if hits >= 1:
                    scored.append((-hits, len(de), de, zh, lead))
            scored.sort()
            examples = []
            per_headword = defaultdict(int)
            chosen_tokens = []
            for _, _, de, zh, lead in scored:
                if len(examples) >= 6:
                    break
                if per_headword[lead] >= 2:
                    continue  # do not let one word own the whole unit
                toks = set(re.findall(r'[\wäöüÄÖÜß]+', de.lower()))
                if any(len(toks & prev) / float(max(1, len(toks | prev))) >= 0.6
                       for prev in chosen_tokens):
                    continue  # near-duplicate of a sentence already taken
                per_headword[lead] += 1
                chosen_tokens.append(toks)
                used_sentences.add(de)
                examples.append({'de': de, 'zh': zh, 'source': TATOEBA})
            if not examples:
                stats['unitsWithoutExamples'].append(unit['id'])

            links = []
            for label in unit['grammar']:
                slug = GRAMMAR_SLUGS.get(label)
                if slug and slug not in grammar_slugs_available:
                    stats['unresolvedSlugs'].add(slug)
                    slug = None
                links.append({'label': label, 'slug': slug})

            enriched[unit['id']] = {
                'headwords': headwords,
                'examples': examples,
                'grammarLinks': links,
            }
            stats['units'] += 1
            stats['headwords'] += len(headwords)
            stats['examples'] += len(examples)

    stats['unresolvedSlugs'] = sorted(stats['unresolvedSlugs'])
    return enriched, stats
COURSE_HEADER = '''// Guided German curriculum for Dimenticato.  GENERATED — edit
// scripts/build_german_extras.py and re-run it instead of editing this file.
//
// The lesson sequence follows the table-of-contents scope visible in the
// user's local "走遍德国 / Passwort Deutsch" A1-B1 and "Mittelpunkt" B2-C1
// course books. The compact summaries, grammar labels and practice headword
// selections are independently organized for this application. No scanned
// textbook pages or exercise text are redistributed.
//
// Enrichment added by the content-parity pass:
//   * GERMAN_COURSE_GRAMMAR_SLUGS maps every course grammar label onto a slug
//     that exists in GERMAN_GRAMMAR_DATA.content, so unit.grammarLinks[].slug
//     can be rendered as a real link into the Grammar Book.
//   * unit.examples carries Tatoeba (CC BY 2.0 FR) German/Chinese sentence
//     pairs that actually use the unit's vocabulary.
//   * unit.headwords was raised from 10-12 to up to %d entries per unit, all
//     resolvable against data/german-vocabulary.js, so a practice session has
//     a real distractor pool.
''' % HEADWORD_TARGET

COURSE_PARSER = '''
function parseGermanCourseUnits(level, raw) {
  return raw.trim().split('\\n').filter(Boolean).map((line) => {
    const [number, title, summary, grammar, headwords] = line.split('|');
    const id = `${level}-${String(number).padStart(2, '0')}`;
    const grammarList = grammar.split(';').map((item) => item.trim()).filter(Boolean);
    const extras = GERMAN_COURSE_UNIT_EXTRAS[id] || {};
    return {
      id,
      number: Number(number),
      title,
      summary,
      grammar: grammarList,
      grammarLinks: grammarList.map((label) => ({
        label,
        slug: GERMAN_COURSE_GRAMMAR_SLUGS[label] || null
      })),
      headwords: headwords.split(',').map((item) => item.trim()).filter(Boolean),
      examples: extras.examples || []
    };
  });
}
'''


def emit_course(course, enriched, path):
    parts = [COURSE_HEADER]
    parts.append('\nconst GERMAN_COURSE_GRAMMAR_SLUGS = %s;\n' % js_dump(GRAMMAR_SLUGS))
    extras = {uid: {'examples': data['examples']} for uid, data in enriched.items()}
    parts.append('\nconst GERMAN_COURSE_UNIT_EXTRAS = %s;\n' % js_dump(extras))
    parts.append(COURSE_PARSER)
    parts.append('\nconst GERMAN_COURSE_DATA = {\n')
    parts.append('  sources: %s,\n' % js_dump(course['sources']).replace('\n', '\n  '))
    parts.append('  grammarSlugs: GERMAN_COURSE_GRAMMAR_SLUGS,\n')
    parts.append('  levels: [\n')
    for level in course['levels']:
        lines = []
        for unit in level['units']:
            lines.append('|'.join([
                str(unit['number']),
                unit['title'],
                unit['summary'],
                ';'.join(unit['grammar']),
                ','.join(enriched[unit['id']]['headwords']),
            ]))
        parts.append('    {\n')
        parts.append('      id: %s,\n' % json.dumps(level['id'], ensure_ascii=False))
        parts.append('      title: %s,\n' % json.dumps(level['title'], ensure_ascii=False))
        parts.append('      chineseTitle: %s,\n' % json.dumps(level['chineseTitle'], ensure_ascii=False))
        parts.append('      description: %s,\n' % json.dumps(level['description'], ensure_ascii=False))
        parts.append("      units: parseGermanCourseUnits('%s', `\n%s\n      `)\n" % (level['id'], '\n'.join(lines)))
        parts.append('    },\n')
    parts.append('  ]\n};\n')
    parts.append("\nif (typeof module !== 'undefined' && module.exports) {\n"
                 "  module.exports = GERMAN_COURSE_DATA;\n}\n")
    text = ''.join(parts)
    with io.open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)
    return len(text.encode('utf-8'))


COLLOC_HEADER = '''// German verb collocations (Rektion) for Dimenticato.  GENERATED — edit
// scripts/build_german_extras.py and re-run it instead of editing this file.
//
// Shape is identical to data/verb-collocations-data.js (VERB_COLLOCATIONS_DATA):
//   { meta: { totalVerbs, totalExamples, prepositionOrder },
//     verbs: { '<verb>': { display, prepositions: { '<prep>': ['DE 中文', ...] },
//                          prepositionOrder: ['<prep>', ...] } },
//     prepositions: { '<prep>': ['<verb>', ...] } }
// with one German-specific twist: the preposition key carries the case it
// governs ("auf +A" vs "auf +D"), because in German the case is part of the
// collocation and changes the meaning.  meta.prepositionCase / .prepositionBase
// decompose the key for any renderer that wants the two halves separately, and
// each verb additionally carries a structured `entries` array (english gloss,
// Chinese gloss, CEFR level, per-example source).
//
// GERMAN_COLLOCATIONS_DATA.nounVerb is a second, structurally identical dataset
// for Funktionsverbgefüge / Nomen-Verb-Verbindungen, keyed noun -> light verb.
//
// Sources: collocation inventory and Chinese/English glosses authored for this
// application; example sentences mined from Tatoeba (CC BY 2.0 FR).
'''

COGNATE_HEADER = '''// German <-> English cognates for Dimenticato.  GENERATED — edit
// scripts/build_german_extras.py and re-run it instead of editing this file.
//
// Shape mirrors data/cognates.js (COGNATE_DATA) with `german` replacing
// `italian`: { german, english, chinese, patternType, similarityScore,
// difficulty, rank } plus the additive fields display, pos, gender,
// englishChinese, englishRank, source and falseFriend.
//
// Pairs were produced two ways, both gated on Chinese-gloss agreement between
// data/german-vocabulary.js and data/english-vocabulary.js (ECDICT):
//   1. a curated list of core Germanic pairs, and
//   2. a rule transducer implementing the High German consonant shift
//      (t↔z/ss, p↔pf/f, d↔t, k↔ch, th↔d …) plus the regular Latinate suffix
//      correspondences (-ität/-ity, -ismus/-ism, -isch/-ic, -ie/-y …).
// `patternType` records the correspondence that fired, so Pattern Groups mode
// has real groups rather than one big null bucket.
//
// Entries with falseFriend === true are *falsche Freunde*.  For those entries
// `english` is the CORRECT translation of the German word (so every prompt
// mode stays truthful) and the deceptive English look-alike lives in
// `falseFriendOf`, with `falseFriendChinese` (what the look-alike really means)
// and `germanFor` (the German word that does mean the look-alike).
// `similarityScore` for those entries measures german vs falseFriendOf,
// because the resemblance is the whole point of the entry.
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fetch', action='store_true', help='(re)download the Tatoeba corpus')
    ap.add_argument('--skip-collocations', action='store_true')
    ap.add_argument('--skip-cognates', action='store_true')
    ap.add_argument('--skip-course', action='store_true')
    args = ap.parse_args()

    if args.fetch:
        fetch_tatoeba(force=True)
    else:
        fetch_tatoeba(force=False)

    sys.stderr.write('loading Tatoeba deu-cmn pairs ...\n')
    pairs = load_pairs()
    sys.stderr.write('usable deu-cmn pairs: %d\n' % len(pairs))

    report = {}

    if not args.skip_collocations:
        data = build_collocations(pairs)
        data['nounVerb'] = build_noun_verb(pairs)
        size = write_js(
            os.path.join(DATA, 'german-collocations-data.js'),
            COLLOC_HEADER, 'GERMAN_COLLOCATIONS_DATA', data)
        report['collocations'] = {
            'verbs': data['meta']['totalVerbs'],
            'examples': data['meta']['totalExamples'],
            'prepositionKeys': len(data['meta']['prepositionOrder']),
            'nounVerbNouns': data['nounVerb']['meta']['totalVerbs'],
            'nounVerbExamples': data['nounVerb']['meta']['totalExamples'],
            'bytes': size,
        }

    german_vocab = load_js_dataset('german-vocabulary.js', 'GERMAN_VOCABULARY_DATA')

    if not args.skip_cognates:
        english_vocab = load_js_dataset('english-vocabulary.js', 'ENGLISH_VOCABULARY_DATA')
        sys.stderr.write('mining cognates over %d German x %d English headwords ...\n'
                         % (len(german_vocab), len(english_vocab)))
        cognates, rejected = build_cognates(german_vocab, english_vocab)
        de_by_word = {}
        for entry in german_vocab:
            de_by_word.setdefault(entry.get('german'), entry)
        en_by_word = {}
        for entry in english_vocab:
            en_by_word.setdefault((entry.get('english') or '').lower(), entry)
        friends, missing = build_false_friends(de_by_word, en_by_word,
                                               build_gender_index(german_vocab))
        by_word = {c['german']: c for c in cognates}
        for f in friends:
            by_word[f['german']] = f
        allc = sorted(by_word.values(), key=lambda c: (c.get('rank') or 10 ** 6, c['german']))
        tail = ("\nGERMAN_COGNATE_DATA.falseFriends = "
                "GERMAN_COGNATE_DATA.filter(function (w) { return w.falseFriend; });\n")
        size = write_js(
            os.path.join(DATA, 'german-cognates.js'),
            COGNATE_HEADER, 'GERMAN_COGNATE_DATA', allc, extra_tail=tail)
        patterns = defaultdict(int)
        for c in allc:
            patterns[c['patternType']] += 1
        report['cognates'] = {
            'total': len(allc),
            'falseFriends': len(friends),
            'falseFriendsUnresolved': missing,
            'withPatternType': sum(1 for c in allc if c['patternType']),
            'distinctPatternTypes': len(patterns),
            'rejected': dict(rejected),
            'bytes': size,
        }

    if not args.skip_course:
        grammar = load_js_dataset('german-grammar-data.js', 'GERMAN_GRAMMAR_DATA')
        available = set(grammar['content'].keys())
        course = load_js_dataset('german-course-data.js', 'GERMAN_COURSE_DATA')
        enriched, stats = build_course(course, german_vocab, pairs, available)
        size = emit_course(course, enriched, os.path.join(DATA, 'german-course-data.js'))
        stats['bytes'] = size
        stats['grammarLabels'] = len(GRAMMAR_SLUGS)
        report['course'] = stats

    json.dump(report, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write('\n')


if __name__ == '__main__':
    main()
