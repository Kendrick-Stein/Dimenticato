// French vocabulary curriculum: a build input for data/vocab/fr.js, merged by
// `python3 scripts/build_french_vocabulary.py assemble`. The site never loads
// this file.
//
// The topic progression follows the A1-B1 scope visible in the user's
// "你好！法语 / Le nouveau Taxi!" course books. Definitions and notes are
// independently written for this application; scanned textbook pages are not
// redistributed.
//
// Frequency (per million, film subtitles + books averaged) and the corpus rank
// come from Lexique 3.83（CC-BY-SA）; English glosses come from Wiktionary/kaikki（CC-BY-SA）.
// Rebuild with: python3 scripts/build_french_vocabulary.py curriculum ...
//
// Row format:
//   french|display|feminine|meaning|english|notes|partOfSpeech|gender|level|frequency|freqRank

const FRENCH_VOCABULARY_DATA = `
être|être||是；存在|to be; to be located; to be situated|A1 · 核心动词|v||A1|23660.9850|2
avoir|avoir||有；拥有|to have; to own; to possess; to get; to have (to experience or suffer from a state or condition)|A1 · 核心动词|v||A1|15680.0150|9
faire|faire||做；制作|to do; to make|A1 · 核心动词|v||A1|7071.2350|19
aller|aller||去；前往|to go; to attend (school, church regularly)|A1 · 核心动词|v||A1|6423.8500|24
venir|venir||来；来到|to come (to move from one place to another that is nearer the speaker); See venir de.|A1 · 核心动词|v||A1|2139.1750|57
pouvoir|pouvoir||能够；可以|can, to be able to; may (of a choice)|A1 · 核心动词|v||A1|4092.1350|35
vouloir|vouloir||想要；愿意|to want, wish, desire; to see oneself as; to give the impression of, to seem|A1 · 核心动词|v||A1|3444.7200|41
devoir|devoir||应该；必须|must, to have to, should (as a requirement); must|A1 · 核心动词|v||A1|2275.3750|56
savoir|savoir||知道；会|to know (something); to know how (to do something)|A1 · 核心动词|v||A1|3260.1450|45
dire|dire||说；告诉|to say, to tell (to express through speech); to tell (to order, to advise)|A1 · 核心动词|v||A1|5389.3250|28
parler|parler||说话；谈论|to speak, talk; to be able to communicate in a language; to speak|A1 · 核心动词|v||A1|1528.2800|69
voir|voir||看见；理解|to see (visually); to see (to understand)|A1 · 核心动词|v||A1|3260.5950|44
prendre|prendre||拿；乘坐；吃喝|to take; to eat; to drink|A1 · 核心动词|v||A1|1690.1250|65
mettre|mettre||放置；穿戴|to put; to place; to put on|A1 · 核心动词|v||A1|1044.2750|101
donner|donner||给；给予|to give, to transfer the possession/holding of something to someone else; to donate|A1 · 核心动词|v||A1|1052.8400|100
trouver|trouver||找到；觉得|to find (something to be the case); to think or consider (something to be so); to find oneself (at a place or in a situation)|A1 · 核心动词|v||A1|1153.9950|94
aimer|aimer||喜欢；爱|to love (usually of a person, otherwise the meaning is closer to English like); to like (often with bien)|A1 · 核心动词|v||A1|1225.3400|88
penser|penser||思考；认为|to think, reflect, concentrate one's mind on something; to think, imagine, believe|A1 · 核心动词|v||A1|1177.6350|90
demander|demander||询问；请求|to ask; to request|A1 · 核心动词|v||A1|947.1150|108
répondre|répondre||回答|to reply, to answer; to answer for|A1 · 核心动词|v||A1|359.1650|248
bonjour|bonjour||你好；日安|good day; good afternoon; goodbye|A1 · 问候|interj||A1|311.0600|286
bonsoir|bonsoir||晚上好|good evening|A1 · 问候|interj||A1|91.7000|796
salut|salut||你好；再见（非正式）|hi, hello; bye, goodbye|A1 · 问候|interj||A1|169.6200|469
au revoir|au revoir||再见|goodbye|A1 · 问候|interj||A1||
à bientôt|à bientôt||回头见；很快再见|see you soon, see you later, laters (an informal farewell wish)|A1 · 问候|interj||A1||
merci|merci||谢谢|thank you|A1 · 礼貌表达|interj||A1|489.1850|187
s'il vous plaît|s'il vous plaît||请（正式或复数）|please, if you please; here you go, here you are|A1 · 礼貌表达|loc||A1||
s'il te plaît|s'il te plaît||请（非正式单数）|please; here you go, here you are|A1 · 礼貌表达|loc||A1||
excusez-moi|excusez-moi||劳驾；请原谅|excuse me|A1 · 礼貌表达|interj||A1||
pardon|pardon||对不起；请再说一遍|excuse me; sorry|A1 · 礼貌表达|interj||A1|113.5850|671
oui|oui||是；对|yes|A1 · 基础表达|adv||A1|1922.4600|64
non|non||不；不是|no|A1 · 基础表达|adv||A1|2587.9950|53
d'accord|d'accord||好的；同意|in agreement|A1 · 基础表达|loc||A1||
peut-être|peut-être||也许|maybe, perhaps|A1 · 基础表达|adv||A1|802.8250|122
bien sûr|bien sûr||当然|of course|A1 · 基础表达|loc||A1||
je|je||我|I|A1 · 人称代词|pron||A1|18422.9850|4
tu|tu||你（非正式单数）|you (singular)|A1 · 人称代词|pron||A1|8599.3950|15
il|il||他；它（阳性）|he (third-person singular masculine subject pronoun for human subject); it (third-person singular subject pronoun for grammatically masculine objects)|A1 · 人称代词|pron||A1|14527.5100|10
elle|elle||她；它（阴性）|she; it (feminine gender third-person singular subject pronoun)|A1 · 人称代词|pron||A1|5756.0100|25
on|on||人们；我们（口语）|one, people, you, someone (an unspecified individual); we|A1 · 人称代词|pron||A1|6712.3900|21
nous|nous||我们|the plural personal pronoun in the first person:; we|A1 · 人称代词|pron||A1|4319.9800|34
vous|vous||您；你们|the plural personal pronoun in the second person; you (all)|A1 · 人称代词|pron||A1|8548.4300|16
ils|ils||他们；它们（阳性或混合）|they (male or mixed group); they (female)|A1 · 人称代词|pron||A1|2942.3000|49
elles|elles||她们；它们（阴性）|they (female)|A1 · 人称代词|pron||A1|512.8250|184
qui|qui||谁；……的人|who, whom; who, which, that|A1 · 疑问词|pron||A1|6719.8800|20
que|que||什么；……的事物|The inanimate direct-object or predicative interrogative pronoun: what; The inanimate subject interrogative pronoun in impersonal constructions.|A1 · 疑问词|pron||A1|3708.4250|40
quoi|quoi||什么|what; what, (that) which|A1 · 疑问词|pron||A1|884.5500|113
où|où||哪里；在……的地方|where (interrogative); where (relative pronoun)|A1 · 疑问词|adv||A1|2122.6800|58
quand|quand||什么时候|when (at what time)|A1 · 疑问词|adv||A1|1653.9950|66
comment|comment||怎样；如何|how; how many; how much|A1 · 疑问词|adv||A1|543.9300|172
pourquoi|pourquoi||为什么|why|A1 · 疑问词|adv||A1|766.7900|127
combien|combien||多少|how much (for uncountable nouns and portions); how much (for money)|A1 · 疑问词|adv||A1|249.3100|338
quel|quel||哪个；什么样的（阳性）|which; what, what a (used to form exclamations)|A1 · 疑问限定词|det|m|A1|461.5250|196
quelle|quelle||哪个；什么样的（阴性）|which?; What a ...!|A1 · 疑问限定词|det|f|A1|378.4700|237
et|et||和；并且|and|A1 · 连接词|conj||A1|16894.4050|6
ou|ou||或者|or; either...or|A1 · 连接词|conj||A1|2006.9050|61
mais|mais||但是|but, although|A1 · 连接词|conj||A1|4821.3850|29
parce que|parce que||因为|because|A1 · 连接词|conj||A1|437.9750|204
donc|donc||所以|therefore, consequently; thus|A2 · 连接词|conj||A2|529.1950|176
si|si||如果；是否；是的（反驳否定）|if, whether; if (assuming that)|A1 · 连接词|conj||A1|1516.0350|71
le|le||这；该（阳性定冠词）|the (definite article); the; my, your, etc.|A1 · 冠词|art|m|A1|15981.8550|7
la|la||这；该（阴性定冠词）|la, the note 'A'|A1 · 冠词|art|f|A1|19290.2000|3
les|les||这些；那些（复数定冠词）|the (plural definite article)|A1 · 冠词|art||A1|11691.3400|13
un|un||一个（阳性）|an, a|A1 · 冠词与数字|art|m|A1|12819.1500|12
une|une||一个（阴性）|front page (of a publication)|A1 · 冠词与数字|art|f|A1|8747.9100|14
des|des||一些；复数不定冠词|some; of the (plural indefinite/partitive article)|A1 · 冠词|art||A1|8340.3200|17
du|du||一些；从这个（阳性缩合）|Forms the partitive article.|A1 · 冠词|art||A1|5638.4300|27
de la|de la||一些（阴性部分冠词）|of the; some; the feminine partitive article|A1 · 冠词|art||A1||
de l'|de l'||一些（元音前）|some; the singular prevocalic partitive article|A1 · 冠词|art||A1||
ce|ce||这个（阳性）|this, that|A1 · 指示词|det|m|A1|4088.8400|36
cette|cette||这个（阴性）|this, that (feminine singular)|A1 · 指示词|det|f|A1|2111.4750|59
ces|ces||这些|these, those|A1 · 指示词|det||A1|1385.0050|77
mon|mon||我的（阳性）|my (used to qualify masculine nouns and vowel-initial words regardless of gender)|A1 · 所有词|det|m|A1|3078.4800|47
ma|ma||我的（阴性）|my (feminine singular)|A1 · 所有词|det|f|A1|2007.0300|60
mes|mes||我的（复数）|my (when referring to a plural noun)|A1 · 所有词|det||A1|1062.6700|99
ton|ton||你的（阳性）|your|A1 · 所有词|det|m|A1|1016.8950|105
ta|ta||你的（阴性）|your|A1 · 所有词|det|f|A1|758.8300|130
son|son||他／她的（阳性）|his, her, their, its (used to qualify masculine nouns and before a vowel)|A1 · 所有词|det|m|A1|3218.2900|46
sa|sa||他／她的（阴性）|his, her, its, their, one's|A1 · 所有词|det|f|A1|2504.3600|54
notre|notre||我们的|our|A1 · 所有词|det||A1|851.8100|115
votre|votre||您的；你们的|your, belonging to you (plural or formal)|A1 · 所有词|det||A1|1161.0000|92
leur|leur||他们的；她们的|their|A1 · 所有词|det||A1|355.6600|253
homme|homme||男人；人|man (adult male human); man, Man (species)|A1 · 人物|n.m|m|A1|1261.2000|86
femme|femme||女人；妻子|woman; wife|A1 · 人物|n.f|f|A1|1022.5300|103
personne|personne||人；没有人|no one, nobody; anyone|A1 · 人物|pron|m|A1|444.8800|203
ami|ami||男性朋友|friend (one who is affectionately attached to another)|A1 · 人际关系|n.m|m|A1|551.0500|168
amie|amie||女性朋友|friend|A1 · 人际关系|n.f|f|A1|551.0500|168
famille|famille||家庭；家人|family (group of related people); family|A1 · 家庭|n.f|f|A1|329.6550|270
père|père||父亲|father (parent); father (clergyman)|A1 · 家庭|n.m|m|A1|809.5300|121
mère|mère||母亲|mother|A1 · 家庭|n.f|f|A1|724.0350|136
parents|parents||父母；亲属|relative, relation, family member; parent|A1 · 家庭|n.m|m|A1|167.3650|474
frère|frère||兄弟|brother (relation, relative); brother (monk)|A1 · 家庭|n.m|m|A1|303.3700|293
sœur|sœur||姐妹|sister; nun|A1 · 家庭|n.f|f|A1|173.0000|462
fils|fils||儿子|son; any male descendant|A1 · 家庭|n.m|m|A1|363.8950|245
fille|fille||女儿；女孩|girl; daughter|A1 · 家庭|n.f|f|A1|716.8950|139
enfant|enfant||孩子|child (someone who is not yet an adult); child (offspring of any age)|A1 · 家庭|n.m|m|A1|730.6350|134
mari|mari||丈夫|husband; cannabis, marijuana|A1 · 家庭|n.m|m|A1|194.2050|416
nom|nom||姓；名称|name; last name, family name|A1 · 身份|n.m|m|A1|482.8350|193
prénom|prénom||名|first name, given name|A1 · 身份|n.m|m|A1|28.1750|2163
âge|âge||年龄；年纪|age|A1 · 身份|n.m|m|A1|185.0100|435
adresse|adresse||地址；住址|address (the description or instructions to determine a geographic location); address (location or instructions to location a piece of data)|A1 · 身份|n.f|f|A1|61.8600|1153
nationalité|nationalité||国籍|nationality|A1 · 身份|n.f|f|A1|5.0500|6824
français|français||法语；法国的；法国人|French; Franco-American or Francophone|A1 · 语言与国籍|adj|m|A1|170.9550|465
française|française||法国的；法国女性|Frenchwoman|A1 · 语言与国籍|adj|f|A1|170.9550|465
chinois|chinois||中文；中国的；中国人|of China; Chinese|A1 · 语言与国籍|adj|m|A1|23.2400|2542
anglais|anglais||英语；英国的|English language|A1 · 语言与国籍|n.m|m|A1|65.2700|1096
allemand|allemand||德语；德国的|German (The German language)|A1 · 语言与国籍|n.m|m|A1|70.3150|1018
italien|italien||意大利语；意大利的|Italian (male)|A1 · 语言与国籍|adj|m|A1|31.2000|1991
pays|pays||国家；乡村|land; region; home ground; homeland; home country; country; nation; country|A1 · 地理|n.m|m|A1|222.0600|370
France|France||法国|France|A1 · 地理|n.f|f|A1||
Chine|Chine||中国|China|A1 · 地理|n.f|f|A1|0.6050|19611
ville|ville||城市|town, city|A1 · 城市|n.f|f|A1|324.0550|274
village|village||村庄|village; town, city|A1 · 城市|n.m|m|A1|119.9050|633
rue|rue||街道|street, road; rue (the plant)|A1 · 城市|n.f|f|A1|360.3900|246
place|place||广场；位置；座位|place, square, plaza, piazza; place, space, room|A1 · 城市|n.f|f|A1|384.9400|232
quartier|quartier||街区|quarter, district (part of town), neighbourhood; impoverished neighbourhood, often suburban|A2 · 城市|n.m|m|A2|88.9300|822
maison|maison||房子；家|house|A1 · 住房|n.f|f|A1|590.5450|159
appartement|appartement||公寓；公寓套房|apartment, flat|A1 · 住房|n.m|m|A1|87.7950|833
chambre|chambre||房间；卧室|a chamber in its various senses, including:; a room.|A1 · 住房|n.f|f|A1|350.9750|258
cuisine|cuisine||厨房；烹饪|kitchen; culinary art or cuisine|A1 · 住房|n.f|f|A1|111.6650|682
salle de bains|salle de bains||浴室|bathroom (room containing a bath where one can bathe); bathroom (room containing a toilet)|A1 · 住房|n.f|f|A1||
salon|salon||客厅|living room; salon|A1 · 住房|n.m|m|A1|70.2300|1019
porte|porte||门|door; gate (to a city, at airport)|A1 · 住房|n.f|f|A1|475.6400|194
fenêtre|fenêtre||窗户|window|A1 · 住房|n.f|f|A1|185.3750|433
table|table||桌子|table (furniture with a top surface to accommodate a variety of uses); flat surface atop various objects|A1 · 物品|n.f|f|A1|249.0850|339
chaise|chaise||椅子|chair, seat|A1 · 物品|n.f|f|A1|79.1650|927
lit|lit||床|bed; layer|A1 · 物品|n.m|m|A1|261.2250|327
livre|livre||书|book; pound (unit of weight)|A1 · 物品|n.m|m|A1|242.3000|347
téléphone|téléphone||电话；手机|telephone|A1 · 物品|n.m|m|A1|128.8100|590
ordinateur|ordinateur||电脑|a computer, a computing device.|A1 · 物品|n.m|m|A1|20.7050|2753
clé|clé||钥匙|key (device for unlocking); key (essential attribute)|A1 · 物品|n.f|f|A1|83.3550|883
travail|travail||工作|work; labor; job|A1 · 工作|n.m|m|A1|326.6400|272
métier|métier||职业|job, profession, trade; skill, craft|A1 · 工作|n.m|m|A1|69.7800|1032
emploi|emploi||工作岗位；使用|job; employment|A2 · 工作|n.m|m|A2|30.0650|2047
entreprise|entreprise||公司；企业|company, business; enterprise, project|A2 · 工作|n.f|f|A2|33.3350|1896
bureau|bureau||办公室；书桌|desk; office (room)|A1 · 工作|n.m|m|A1|158.6000|493
collègue|collègue||同事|colleague; friend|A2 · 工作|n.m|m|A2|35.5100|1810
étudiant|étudiant||男学生；大学生|student|A1 · 学习|n.m|m|A1|38.2600|1709
étudiante|étudiante||女学生；大学生|student (female)|A1 · 学习|n.f|f|A1|38.2600|1709
école|école||学校|school|A1 · 学习|n.f|f|A1|175.4350|456
université|université||大学|university (institution of higher education)|A1 · 学习|n.f|f|A1|27.8200|2185
cours|cours||课程|stream of water, river; course (of events)|A1 · 学习|n.m|m|A1|159.9050|491
professeur|professeur||老师|teacher; professor|A1 · 学习|n.m|m|A1|81.2350|909
apprendre|apprendre||学习；得知|to learn; to teach|A1 · 学习|v||A1|317.5800|280
comprendre|comprendre||理解|to understand, comprehend; to comprise, include|A1 · 学习|v||A1|754.1550|132
lire|lire||阅读|to read; to be read|A1 · 学习|v||A1|302.9450|295
écrire|écrire||写|to write|A1 · 学习|v||A1|323.8700|275
jour|jour||天；白天|day; daylight, light|A1 · 时间|n.m|m|A1|1201.8400|89
semaine|semaine||星期；周|week; menstrual period|A1 · 时间|n.f|f|A1|244.1750|344
mois|mois||月份；月|month|A1 · 时间|n.m|m|A1|308.5850|288
année|année||年|year (period)|A1 · 时间|n.f|f|A1|345.8950|262
aujourd'hui|aujourd'hui||今天|today; nowadays|A1 · 时间|adv||A1|259.2050|330
demain|demain||明天|tomorrow|A1 · 时间|adv||A1|279.9850|311
hier|hier||昨天|yesterday|A1 · 时间|adv||A1|158.2050|495
matin|matin||早晨|morning|A1 · 时间|n.m|m|A1|335.8850|269
après-midi|après-midi||下午|afternoon|A1 · 时间|n.m|m|A1||
soir|soir||晚上|evening|A1 · 时间|n.m|m|A1|569.1700|162
nuit|nuit||夜晚|night|A1 · 时间|n.f|f|A1|662.3900|145
heure|heure||小时；时间点|hour, time; o'clock|A1 · 时间|n.f|f|A1|816.9200|119
minute|minute||分钟|minute (etymology 1, time unit, all same senses)|A1 · 时间|n.f|f|A1|271.8500|317
lundi|lundi||星期一|Monday|A1 · 日期|n.m|m|A1|30.7000|2015
mardi|mardi||星期二|Tuesday|A1 · 日期|n.m|m|A1|19.9650|2832
mercredi|mercredi||星期三|Wednesday|A1 · 日期|n.m|m|A1|17.0600|3142
jeudi|jeudi||星期四|Thursday (day of the week)|A1 · 日期|n.m|m|A1|24.8000|2414
vendredi|vendredi||星期五|Friday|A1 · 日期|n.m|m|A1|25.7700|2331
samedi|samedi||星期六|Saturday|A1 · 日期|n.m|m|A1|41.9800|1592
dimanche|dimanche||星期日|Sunday|A1 · 日期|n.m|m|A1|82.5650|892
temps|temps||时间；天气|time (in general); weather|A1 · 时间与天气|n.m|m|A1|1160.2200|93
soleil|soleil||太阳；阳光|sun (star); sunflower|A1 · 天气|n.m|m|A1|228.8650|361
pluie|pluie||雨|rain; loads of things|A1 · 天气|n.f|f|A1|84.3350|869
chaud|chaud||热的|warm, hot; on heat|A1 · 天气与形容词|adj|m|A1|98.7350|753
froid|froid||冷的|cold (temperature); distant, unfriendly|A1 · 天气与形容词|adj|m|A1|144.4550|536
beau|beau||漂亮的；天气好的|handsome, fine, attractive; nice|A1 · 形容词|adj|m|A1|645.9650|149
bon|bon||好的；美味的|good; right, correct, appropriate|A1 · 形容词|adj|m|A1|1172.0500|91
grand|grand||大的；高的|big; tall|A1 · 形容词|adj|m|A1|941.6900|109
petit|petit||小的；矮的|small; little|A1 · 形容词|adj|m|A1|1324.3800|84
nouveau|nouveau||新的|new person, new thing|A1 · 形容词|n.m|m|A1|261.2000|328
vieux|vieux||老的；旧的|old|A1 · 形容词|adj|m|A1|397.5550|227
jeune|jeune||年轻的|young|A1 · 形容词|adj||A1|433.1000|207
facile|facile||容易的|easy, simple; easy, promiscuous (consenting readily to sex)|A1 · 形容词|adj||A1|129.0000|588
difficile|difficile||困难的|difficult; choosy, fussy, picky|A1 · 形容词|adj||A1|134.3450|569
important|important||重要的|important; large, considerable, significant|A2 · 形容词|adj|m|A2|158.0600|496
intéressant|intéressant||有趣的|interesting|A1 · 形容词|adj|m|A1|48.9100|1397
content|content||高兴的；满意的|content, satisfied, pleased|A1 · 情绪|adj|m|A1|132.7150|572
heureux|heureux||幸福的；高兴的|happy; glad|A2 · 情绪|adj|m|A2|219.2250|375
triste|triste||悲伤的|sad|A1 · 情绪|adj||A1|104.5250|717
fatigué|fatigué||疲惫的|tired|A1 · 情绪|adj|m|A1|33.7400|1878
beaucoup|beaucoup||很多；非常|much, very much, a lot; very|A1 · 数量副词|adv||A1|543.7100|173
peu|peu||少；不太|few; little|A1 · 数量副词|n.m|m|A1|959.0800|107
très|très||非常|very|A1 · 程度副词|adv||A1|1355.3650|81
trop|trop||太；过多|too; too much; very, really, so|A1 · 程度副词|adv||A1|824.7700|117
assez|assez||相当；足够|to a sufficient or moderate degree; enough; sufficiently|A1 · 程度副词|adv||A1|413.9450|219
plus|plus||更多；加|used to express the comparative and superlative of a following adjective or adverb; more, -er (comparative)|A1 · 数量副词|adv||A1|4538.4900|32
moins|moins||更少；减|minus; negative|A1 · 数量副词|adv||A1|598.4650|156
toujours|toujours||总是；仍然|always; still|A1 · 频率副词|adv||A1|1083.0700|98
souvent|souvent||经常|often|A1 · 频率副词|adv||A1|211.2500|387
parfois|parfois||有时|sometimes|A1 · 频率副词|adv||A1|220.1100|372
jamais|jamais||从不；永不|never; ever|A1 · 频率副词|adv||A1|1241.5950|87
ici|ici||这里|here|A1 · 地点副词|adv||A1|1447.3950|74
là|là||那里|referring to physical place; there|A1 · 地点副词|adv||A1|1593.0950|68
maintenant|maintenant||现在|now, currently|A1 · 时间副词|adv||A1|762.8100|128
déjà|déjà||已经|already, before; again (following a question)|A2 · 时间副词|adv||A2|692.0600|142
encore|encore||还；再一次|still; more|A1 · 时间副词|adv||A1|1377.9950|79
avec|avec||和；用|with|A1 · 介词|prép||A1|3852.6500|38
sans|sans||没有；不带|without (not having); without (not doing or having done)|A1 · 介词|prép||A1|1613.7800|67
pour|pour||为了；给；持续|for (meant for, intended for); for (in support of)|A1 · 介词|prép||A1|6638.3950|22
chez|chez||在……家／机构|to, at, in or into the home, office, etc. of; by extension, to, at or in the country of|A1 · 介词|prép||A1|761.3600|129
dans|dans||在……里面|in, inside (enclosed in a physical space, a group, a state); to (indicates direction towards certain large subdivisions, see usage notes)|A1 · 介词|prép||A1|6477.3350|23
sur|sur||在……上面；关于|on, upon; on top of|A1 · 介词|prép||A1|3920.2900|37
sous|sous||在……下面|below, under|A1 · 介词|prép||A1|674.0950|144
devant|devant||在……前面|confronted with, faced with; in front of, before|A1 · 介词|prép||A1|449.2650|202
derrière|derrière||在……后面|behind; at the bottom of, behind (covertly responsible for)|A1 · 介词|prép||A1|227.2450|363
entre|entre||在……之间|between; among|A1 · 介词|prép||A1|603.3550|155
près de|près de||靠近|close to, near.; almost, nearly.|A1 · 介词短语|loc||A1|10.2250|4360
loin de|loin de||远离|far from|A1 · 介词短语|loc||A1||
à gauche|à gauche||向左；在左边|on the left; to the left|A1 · 方位|loc||A1||
à droite|à droite||向右；在右边|on the right; to the right|A1 · 方位|loc||A1||
tout droit|tout droit||一直向前|to the front; straight ahead|A1 · 方位|loc||A1||
manger|manger||吃|to eat|A1 · 饮食|v||A1|374.2150|238
boire|boire||喝|to drink|A1 · 饮食|v||A1|306.6850|291
eau|eau||水|In particular, rain; Natural liquid quantities or expanses|A1 · 饮食|n.f|f|A1|382.8000|234
café|café||咖啡；咖啡馆|coffee (drink); coffee colour|A1 · 饮食|n.m|m|A1|170.4300|467
thé|thé||茶|tea (especially made from leaves of the tea plant)|A1 · 饮食|n.m|m|A1|56.9350|1245
pain|pain||面包|bread; piece of bread|A1 · 饮食|n.m|m|A1|86.4950|844
fromage|fromage||奶酪|cheese|A1 · 饮食|n.m|m|A1|27.0900|2243
viande|viande||肉|meat; an object of sexual desire; a piece of meat|A1 · 饮食|n.f|f|A1|44.7150|1505
poisson|poisson||鱼|fish (marine animal)|A1 · 饮食|n.m|m|A1|67.9850|1053
légume|légume||蔬菜|vegetable; vegetable, cabbage (someone in a vegetative state)|A1 · 饮食|n.m|m|A1|19.3050|2887
fruit|fruit||水果|fruit|A1 · 饮食|n.m|m|A1|51.7500|1329
repas|repas||一餐；饭|meal, repast|A1 · 饮食|n.m|m|A1|62.5750|1142
petit déjeuner|petit déjeuner||早餐|breakfast (morning meal); a small or light breakfast|A1 · 饮食|n.m|m|A1||
déjeuner|déjeuner||午餐；吃午饭|lunch, luncheon; breakfast|A1 · 饮食|n.m|m|A1|55.5000|1265
dîner|dîner||晚餐；吃晚饭|dinner, evening meal; lunch, midday meal|A1 · 饮食|n.m|m|A1|78.5150|936
restaurant|restaurant||餐馆|restaurant|A1 · 饮食|n.m|m|A1|49.5150|1382
marché|marché||市场|market; deal, contract|A1 · 购物|n.m|m|A1|68.3950|1047
magasin|magasin||商店|shop, store; warehouse, storehouse|A1 · 购物|n.m|m|A1|63.0800|1135
acheter|acheter||购买|to purchase; buy|A1 · 购物|v||A1|219.5400|374
vendre|vendre||出售|to sell; to sell out (betray)|A1 · 购物|v||A1|149.7950|518
prix|prix||价格；奖项|prize; price|A1 · 购物|n.m|m|A1|117.0250|651
argent|argent||钱；银；白银|silver; money, cash|A1 · 购物|n.m|m|A1|354.7450|254
cher|cher||昂贵的；亲爱的|dear, beloved; expensive, costly|A1 · 购物|adj|m|A1|169.7000|468
gratuit|gratuit||免费的|free of charge; gratuitous, for no reason|A2 · 购物|adj|m|A2|18.6950|2954
vêtement|vêtement||衣服|garment, item of clothing; clothes, clothing|A1 · 购物|n.m|m|A1|75.8100|962
chemise|chemise||衬衫|shirt (that opens in the front); folder (office supplies)|A1 · 购物|n.f|f|A1|67.5400|1060
pantalon|pantalon||裤子|trousers (UK), pants (US); knickers|A1 · 购物|n.m|m|A1|54.6550|1285
robe|robe||连衣裙|dress, frock; fur, coat (of an animal)|A1 · 购物|n.f|f|A1|116.3050|655
chaussure|chaussure||鞋|shoe; the shoe industry|A1 · 购物|n.f|f|A1|65.0350|1101
couleur|couleur||颜色|color/colour; a flush|A1 · 描述|n.f|f|A1|140.4850|551
rouge|rouge||红色的|red (of a red color); red (left-wing, socialist)|A1 · 颜色|adj||A1|188.0850|427
bleu|bleu||蓝色的|blue; very rare, underdone|A1 · 颜色|adj||A1|139.1250|555
vert|vert||绿色的|green; green, environmentally friendly|A1 · 颜色|adj|m|A1|98.8650|750
blanc|blanc||白色的|white color; blank, unused|A1 · 颜色|adj|m|A1|274.6400|314
noir|noir||黑色的|black in colour; dark|A1 · 颜色|adj|m|A1|313.5200|281
voyager|voyager||旅行|to travel, to voyage|A1 · 旅行|v||A1|36.6200|1776
voyage|voyage||旅行（阳性名词）|trip, journey, voyage; travel|A1 · 旅行|n.m|m|A1|131.6200|579
vacances|vacances||假期|vacancy; holidays, vacation|A1 · 旅行|n.f|f|A1|75.2350|972
train|train||火车|train (rail mounted vehicle); pace|A1 · 交通|n.m|m|A1|271.9650|316
avion|avion||飞机|aeroplane|A1 · 交通|n.m|m|A1|103.1950|725
voiture|voiture||汽车|car (wheeled vehicle usually pulled by a horse); car (wagon)|A1 · 交通|n.f|f|A1|356.2550|251
bus|bus||公交车|bus|A1 · 交通|n.m|m|A1|30.5850|2022
métro|métro||地铁|metro; subway (US), underground (UK), Tube (UK); resident or native of metropolitan France|A1 · 交通|n.m|m|A1|29.7600|2071
vélo|vélo||自行车|bike, bicycle, cycle; cycling (the activity of riding bicycles)|A1 · 交通|n.m|m|A1|32.0150|1955
gare|gare||火车站|railway station|A1 · 交通|n.f|f|A1|63.3400|1132
aéroport|aéroport||机场|airport (place, company managing such a place)|A1 · 交通|n.m|m|A1|21.0600|2717
billet|billet||票；纸币|note, a brief message; ticket|A1 · 交通|n.m|m|A1|73.7250|988
partir|partir||离开；出发|to go away, leave, depart; to originate|A1 · 旅行|v||A1|798.8250|123
arriver|arriver||到达；发生|to arrive (often followed by a location); to cope, to manage|A1 · 旅行|v||A1|987.7300|106
rester|rester||停留；保持|to stay; to remain, be left over|A1 · 旅行|v||A1|898.6700|112
retourner|retourner||返回；翻转|to turn over, turn upside-down; (in cooking) to turn; to toss (salad), turn over (earth, soil)|A2 · 旅行|v||A2|268.1150|320
réserver|réserver||预订；保留|to reserve, to make a reservation (for), to book; to reserve, to put aside|A1 · 旅行|v||A1|40.9400|1620
hôtel|hôtel||酒店|mansion, town house, hotel (sense 1); hotel (sense 2)|A1 · 旅行|n.m|m|A1|136.7950|561
plage|plage||海滩|beach; range|A1 · 旅行|n.f|f|A1|67.5400|1061
montagne|montagne||山；山区|mountain; mountain (huge amount)|A1 · 旅行|n.f|f|A1|71.9150|1001
mer|mer||海|sea (large body of water); the ocean (the continuous body of salt water covering a majority of the Earth's surface)|A1 · 旅行|n.f|f|A1|182.0900|441
loisir|loisir||休闲活动|leisure, hobby|A2 · 休闲|n.m|m|A2|12.9500|3768
sport|sport||运动|sport|A1 · 休闲|n.m|m|A1|25.4250|2360
musique|musique||音乐|music|A1 · 休闲|n.f|f|A1|142.0600|544
cinéma|cinéma||电影；电影院|cinema, filmmaking (the art of making films and movies); cinema (the film and movie industry)|A1 · 休闲|n.m|m|A1|71.0000|1008
photo|photo||照片；摄影|photo|A1 · 休闲|n.f|f|A1|151.8450|513
fête|fête||节日；聚会|winter holidays (always in plural); party|A1 · 休闲|n.f|f|A1|125.0100|610
jouer|jouer||玩；演奏|to play (engage in games or play); to play (produce music from a musical instrument)|A1 · 休闲|v||A1|453.6750|198
écouter|écouter||听|to listen; to listen to|A1 · 休闲|v||A1|392.4900|229
regarder|regarder||看；观看|to look at; to watch|A1 · 休闲|v||A1|1097.6000|96
sortir|sortir||出去；外出|to exit, go out, come out; to take out, bring out|A1 · 休闲|v||A1|755.9150|131
santé|santé||健康|health|A2 · 健康|n.f|f|A2|70.6950|1013
maladie|maladie||疾病|illness, disease|A2 · 健康|n.f|f|A2|63.3600|1131
médecin|médecin||医生|physician; (medical) doctor|A1 · 健康|n.m|m|A1|107.9000|705
hôpital|hôpital||医院|hospital|A1 · 健康|n.m|m|A1|94.0400|783
pharmacie|pharmacie||药店|pharmacy, drugstore; pharmacy (science of medicinal substances)|A1 · 健康|n.f|f|A1|10.3300|4326
mal|mal||疼；不好地|badly|A1 · 健康|adv||A1|401.7050|223
tête|tête||头|head (part of the body); head (leader)|A1 · 身体|n.f|f|A1|699.6600|141
main|main||手|hand; handball|A1 · 身体|n.f|f|A1|864.4950|114
œil|œil||眼睛|eye, organ that is sensitive to light, helping organisms to see; glyph, rendering of a single character|A1 · 身体|n.m|m|A1|823.8150|118
corps|corps||身体|body; field (in abstract algebra)|A2 · 身体|n.m|m|A2|365.2450|244
dormir|dormir||睡觉|to sleep|A1 · 日常生活|v||A1|325.5700|273
se lever|se lever||起床|to raise, lift; to rise, stand up|A1 · 日常生活|v.pr||A1|303.3600|294
se coucher|se coucher||上床睡觉|to lay, to lay down; to put to bed, to put up (a lodger)|A1 · 日常生活|v.pr||A1|189.0900|425
commencer|commencer||开始|to begin, commence|A1 · 日常生活|v||A1|429.3600|209
finir|finir||结束；完成|to finish, end, complete; to end up|A1 · 日常生活|v||A1|487.7900|189
attendre|attendre||等待|to wait for, to await; to expect|A1 · 日常生活|v||A1|1029.0750|102
porter|porter||穿；携带|to carry; to support, to bear|A1 · 日常生活|v||A1|397.4550|228
ouvrir|ouvrir||打开|to open; to begin, to initiate|A1 · 日常生活|v||A1|452.9100|199
fermer|fermer||关闭|to shut; to close|A1 · 日常生活|v||A1|217.9050|378
vivre|vivre||生活；活着|to live; to experience|A2 · 社会生活|v||A2|485.2650|191
changer|changer||改变；更换|to exchange (something); to change (money, a job, one's circumstances etc.)|A2 · 社会生活|v||A2|329.2400|271
choisir|choisir||选择|to choose|A1 · 社会生活|v||A1|152.2000|512
décider|décider||决定|to decide; to persuade, convince (someone)|A2 · 社会生活|v||A2|210.9750|388
essayer|essayer||尝试；试穿|to test, to try on; to try, to attempt|A2 · 社会生活|v||A2|483.5450|192
réussir|réussir||成功；通过|to manage to do something; to pass (a test); to succeed at something|A2 · 学习与工作|v||A2|127.0200|601
perdre|perdre||丢失；输|to lose (be unable to find); to lose (not win)|A2 · 日常生活|v||A2|461.7200|195
gagner|gagner||赢；赚|to win; to earn|A2 · 日常生活|v||A2|237.6600|350
rencontrer|rencontrer||遇见；会面|to meet; to come across|A1 · 人际关系|v||A1|214.7750|385
inviter|inviter||邀请|to invite|A1 · 人际关系|v||A1|99.5650|746
aider|aider||帮助|to help; to aid; to use|A1 · 人际关系|v||A1|423.6800|213
envoyer|envoyer||发送|to send; to gulp down with relish|A2 · 沟通|v||A2|268.9000|318
recevoir|recevoir||收到；接待|to receive; to entertain (to welcome guests)|A2 · 沟通|v||A2|208.5950|394
message|message||消息|message|A1 · 沟通|n.m|m|A1|79.8400|918
lettre|lettre||信；字母|letter (written character); letter (written message)|A1 · 沟通|n.f|f|A1|206.3900|400
internet|internet||互联网|the Internet|A1 · 媒体|n.m|m|A1|2.8050|9622
journal|journal||报纸；日记|diary, journal; newspaper|A2 · 媒体|n.m|m|A2|154.2500|507
télévision|télévision||电视|television|A1 · 媒体|n.f|f|A1|25.3500|2366
information|information||信息；新闻|piece of information]; news|A2 · 媒体|n.f|f|A2|49.8750|1373
article|article||文章；商品|article (a piece of nonfictional writing); article|A2 · 媒体|n.m|m|A2|47.3950|1436
réseau social|réseau social||社交网络|social network, social media|A2 · 媒体|n.m|m|A2||
opinion|opinion||意见；观点|opinion (thought, estimation)|A2 · 观点表达|n.f|f|A2|39.2750|1673
avis|avis||意见；评价|opinion; piece of advice|A2 · 观点表达|n.m|m|A2|102.1800|729
idée|idée||想法；主意|idea|A1 · 观点表达|n.f|f|A1|359.1100|249
raison|raison||理由；理性|reason (cause); reason (mental faculties)|A2 · 观点表达|n.f|f|A2|388.3600|230
problème|problème||问题|problem; trouble|A1 · 观点表达|n.m|m|A1|307.5350|290
solution|solution||解决办法|solution|A2 · 观点表达|n.f|f|A2|52.7350|1309
possible|possible||可能的|possible|A2 · 观点表达|adj||A2|206.6850|399
nécessaire|nécessaire||必要的|necessary|A2 · 观点表达|adj||A2|60.0550|1189
différent|différent||不同的|different|A2 · 观点表达|adj|m|A2|113.9150|669
même|même||相同的；甚至|even|A2 · 观点表达|adv||A2|1133.1700|95
exemple|exemple||例子|example|A2 · 观点表达|n.m|m|A2|109.9100|695
environnement|environnement||环境|environment; nature|B1 · 社会议题|n.m|m|B1|6.4800|5808
nature|nature||自然|nature; lexical category|A2 · 环境|n.f|f|A2|78.0400|940
pollution|pollution||污染|pollution|B1 · 环境|n.f|f|B1|1.8300|12143
énergie|énergie||能源；精力|energy (quantity that denotes the ability to do work); energy, motivation|B1 · 环境|n.f|f|B1|36.3600|1778
protéger|protéger||保护|to protect; to protect oneself|A2 · 环境|v||A2|101.4700|735
société|société||社会；公司|company, frequentation; group of people|B1 · 社会|n.f|f|B1|68.8450|1042
culture|culture||文化|crop; culture (“arts, customs and habits”)|A2 · 文化|n.f|f|A2|25.5800|2347
histoire|histoire||历史；故事|story; history|A2 · 文化|n.f|f|A2|359.7250|247
art|art||艺术|art|A2 · 文化|n.m|m|A2|82.1400|901
avenir|avenir||未来|future|A2 · 时间与社会|n.m|m|A2|93.1650|788
projet|projet||计划；项目|project; plan|A2 · 计划|n.m|m|A2|69.7950|1031
rêve|rêve||梦想|dream|A2 · 计划|n.m|m|A2|143.6650|537
expérience|expérience||经历；经验；实验|experiment, trial, test; experience (something one goes through)|B1 · 经历|n.f|f|B1|65.3800|1092
souvenir|souvenir||回忆；纪念品|to remember|A2 · 经历|v||A2|265.2300|321
habitude|habitude||习惯|habit (action done on a regular basis)|A2 · 日常生活|n.f|f|A2|126.3400|605
liberté|liberté||自由|freedom, liberty|B1 · 社会议题|n.f|f|B1|88.7500|824
égalité|égalité||平等|equality; deuce|B1 · 社会议题|n.f|f|B1|7.5850|5267
responsabilité|responsabilité||责任|responsibility; legal liability|B1 · 社会议题|n.f|f|B1|33.0900|1907
relation|relation||关系|relation; relationship|A2 · 人际关系|n.f|f|A2|63.6550|1124
accord|accord||协议；一致|chord; agreement|B1 · 观点表达|n.m|m|B1|451.1750|201
désaccord|désaccord||分歧；不同意|disagreement, discord|B1 · 观点表达|n.m|m|B1|4.1100|7704
cependant|cependant||然而|meanwhile; however, nevertheless, yet, notwithstanding|B1 · 连接词|adv||B1|79.9000|917
pourtant|pourtant||然而；可是|however, yet|B1 · 连接词|adv||B1|235.7400|353
en revanche|en revanche||相反；另一方面|however; on the other hand|B1 · 连接词|loc||B1||
d'abord|d'abord||首先|first, at first, right away; primarily|A2 · 组织表达|adv||A2|172.3850|464
ensuite|ensuite||然后|in turn, subsequently, thereafter, then|A2 · 组织表达|adv||A2|148.5550|524
enfin|enfin||最后；终于；总之|finally; in the end; at last, finally|A2 · 组织表达|adv||A2|353.0500|257
par exemple|par exemple||例如|for example, for instance; on the other hand, by the way|A2 · 组织表达|loc||A2||
en général|en général||一般来说|in general, on the whole|A2 · 组织表达|loc||A2||
à mon avis|à mon avis||在我看来|in my opinion|A2 · 观点表达|loc||A2||
selon|selon||根据；依照|according to; whichever applies; depending on|B1 · 观点表达|prép||B1|96.1400|763
malgré|malgré||尽管；不顾|despite, in spite of; against (one's) will, despite (one's) protest|B1 · 让步表达|prép||B1|119.0250|638
grâce à|grâce à||多亏；由于（积极原因）|thanks to|B1 · 原因表达|loc||B1||
à cause de|à cause de||由于（消极原因）|because of|A2 · 原因表达|loc||A2||
afin de|afin de||为了|in order to, so, so that|B1 · 目的表达|loc||B1|29.4100|2086
alors que|alors que||而；然而；当……时|while, whereas, though; expresses a sense of opposition between simultaneous events; when, while|B1 · 复杂连接|conj||B1||
tandis que|tandis que||而；同时|whereas, while, whilst|B1 · 复杂连接|conj||B1|75.5950|967
`.trim().split('\n').map((line, index) => {
  const [french, display, feminine, meaning, english, notes,
         partOfSpeech, gender, level, frequency, freqRank] = line.split('|');
  const rank = freqRank ? Number(freqRank) : 900000 + index;
  return {
    french,
    display: display || french,
    feminine: feminine || '',
    meaning,
    chinese: meaning,
    english: english || '',
    notes,
    rank,
    source: '课程整理：你好！法语 A1-B1 主题范围',
    level,
    partOfSpeech,
    gender: gender || '',
    textbookPage: '',
    frequency: frequency ? Number(frequency) : null,
    freqRank: freqRank ? Number(freqRank) : null,
    freqSource: frequency ? 'Lexique 3.83（CC-BY-SA）' : ''
  };
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FRENCH_VOCABULARY_DATA;
}
