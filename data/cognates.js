// Cognate Vocabulary Data
// Italian-English similar words for efficient vocabulary transfer
// Entry count: see the summary scripts/validate_italian_extras.js prints (deliberately
// not written down here — every hand-editing round changes it and a stale number is worse
// than no number).
// Generated on 2026-04-27
// Structure: {italian, english, chinese, patternType, similarityScore, difficulty, rank}
//
// 2026-08-05 人工校订：原始数据是机器抓来的，123 条的中文/英文侧是机翻或抓取残渣
// （「僵尸 僵尸 僵尸 僵尸」「9月 (中文(简体) ).」「因库博语Name」「bble」），另有一批
// 是纯拼写巧合被当成同源词、中文直接教反了（ape=蜜蜂不是猿，libreria=书店不是图书馆）。
//
// 教反的那批改成假朋友条目，字段沿用德/法两份数据的写法：
//   falseFriend: true      —— 这是假朋友
//   english                —— 意大利语词【真正】的意思（各种出题模式都拿它当答案）
//   falseFriendOf          —— 骗人的那个英语词
//   falseFriendChinese     —— 那个英语词的真实意思
//   italianFor             —— 「那个英语词」对应的意大利语说法（德语侧叫 germanFor）
//   warning                —— 成句的提示，法语数据里也是这个字段；cognate-app.js 优先读它
//   patternType: '假朋友 faux-ami'
// 这些条目的 similarityScore 比的是「意大利语词 vs falseFriendOf」而不是 english，
// 这正是 cognate-app.js similarityLabel() 认的语义（会显示成「100% 形似 “ape”」）。
//
// 修正时若 english 换了词（"ta" → "den, lair" 这种），similarityScore 用归一化
// Levenshtein 重算（floor((1-d/maxlen)*100)，该公式能复现原数据里 libreria=62）；
// 重算结果低于 50 的直接置 null —— 宁可不显示，也不显示假的「与英语相似」。
//
// 2026-08-05 第二轮：补掉第一轮漏下的中文侧残渣，并把 difficulty 的档位契约钉死。
//   1. difficulty 一律由 similarityScore 推出，不再手填：
//        >= 80 → easy    50-79 → medium    < 50 或 null → hard
//      浏览模式的筛选器把这三档明文写成「Easy（≥80%）/ Medium（50-79%）/ Hard（<50%）」，
//      任何一条对不上，用户按档位筛出来的词就带着打脸的百分比。假朋友条目也照此办理
//      （它们的分数比的是那个陷阱英语词，但档位仍然要跟展示的百分比一致）。
//      similarityScore = null 表示「重算后不足 50，或根本没有可信的英语形似对象」，
//      归入 hard —— 这类词得纯靠背，没有拼写红利。
//   2. 中文侧只允许汉字加全角标点（，；（）），不许有拉丁字母，也不许有 ASCII 半角
//      空格（第一轮的正则没含空格，「决 定」「受 难」这类整批漏网）。
//   3. 一批词的 english 本身就是抓取残渣（"mit"/"reigns"/"colt"/"cost"），中文是照着
//      这个残渣翻的。这种改 english 为真义、similarityScore 按上面的规则重算或置 null，
//      而不是保留一个凑出来的百分比。专有名词沿用数据里既有的写法："mark (name)" +
//      「马可（名字）」。
//   4. 联合国语料带来的机构义（Brasile→「联合国」、strumento→「文书」）一律换成词典义。
//
// 2026-08-05 第三轮（上线前）：
//   1. 【删条】negro 被删掉了。上一轮把它的中文修成「黑色的（旧用法；指人时为冒犯语）」，
//      但 english 留成了 "black"，而数据里没有 nero —— English Prompt 于是会出题
//      「English: black」，把 negro 当成唯一正确答案收下。释义里的警告救不了这件事：
//      出题模式要的是「答案」，一个词只要在 english 侧占着一个常用词，就等于被推荐使用。
//      这类条目的判据是「答案本身该不该被教」，不是「释义准不准」，所以只能删或降级成
//      不可能成为答案的形式。以后往这份数据里加词，先过这一关。
//   2. 【纯音译释义】cravatta→「克鲁瓦塔」、oca→「奥卡」、mago→「马高」这一批（和第二轮
//      的 duca→「达克」同源）：english 侧存的是意大利语原词本身，中文是照着那个原词音译的。
//      改成真义，similarityScore 按第二轮的公式重算，够不到 50 的置 null。
//   3. 【机械残渣后缀】famiglia→「家庭情况」、popolo→「人员」、naso→「鼻头」、
//      ritorno→「返回时」、collega→「同事们」这一批：机翻把上下文里的搭配词粘在了词条上。
//   4. 【软件/联合国本地化义】porto→「端口」、segno→「签名」、missione→「特派团」、
//      livello→「职等」、presidente→「庭长」：语料域串了，一律换回词典义。
//   5. 【两侧对不上】中文里的义项必须在 english 侧有对应，否则出题模式会拿一个英文词
//      去问一个它并不表示的意思（polo/「极」就是这样）。改法是收窄中文或换准 english。
// 以上不变量由 scripts/validate_italian_extras.js 固化，改动这份数据后必须跑它。

var COGNATE_DATA = [
  {
    "italian": "no",
    "english": "no",
    "chinese": "不；没有",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 23
  },
  {
    "italian": "me",
    "english": "me",
    "chinese": "我",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 42
  },
  {
    "italian": "idea",
    "english": "idea",
    "chinese": "想法；主意",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 239
  },
  {
    "italian": "piano",
    "english": "piano",
    "chinese": "钢琴",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 349
  },
  {
    "italian": "importante",
    "english": "important",
    "chinese": "重要的",
    "patternType": "-ante/-ant",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 417
  },
  {
    "italian": "fantastico",
    "english": "fantastic",
    "chinese": "极好的，了不起的",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 468
  },
  {
    "italian": "film",
    "english": "film",
    "chinese": "电影",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 525
  },
  {
    "italian": "perfetto",
    "english": "perfect",
    "chinese": "完美无缺",
    "patternType": "-etto/-et",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 578
  },
  {
    "italian": "presidente",
    "english": "president",
    "chinese": "总统；主席",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 638
  },
  {
    "italian": "attenzione",
    "english": "attention",
    "chinese": "注意；当心",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 648
  },
  {
    "italian": "situazione",
    "english": "situation",
    "chinese": "情况",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 651
  },
  {
    "italian": "intenzione",
    "english": "intention",
    "chinese": "意图",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 782
  },
  {
    "italian": "speciale",
    "english": "special",
    "chinese": "特殊的；特别的",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 783
  },
  {
    "italian": "pero",
    "english": "pear tree",
    "chinese": "梨树",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 842
  },
  {
    "italian": "lista",
    "english": "list",
    "chinese": "列表",
    "patternType": "-ista/-ist",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 862
  },
  {
    "italian": "generale",
    "english": "general",
    "chinese": "总的，全面的；将军",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 871
  },
  {
    "italian": "incredibile",
    "english": "incredible",
    "chinese": "不可思议",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 892
  },
  {
    "italian": "errore",
    "english": "error",
    "chinese": "错误",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 912
  },
  {
    "italian": "normale",
    "english": "normal",
    "chinese": "正常的，普通的",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 944
  },
  {
    "italian": "posizione",
    "english": "position",
    "chinese": "位置；职位",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 954
  },
  {
    "italian": "impossibile",
    "english": "impossible",
    "chinese": "不可能的",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 976
  },
  {
    "italian": "base",
    "english": "base",
    "chinese": "基础",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1008
  },
  {
    "italian": "ex",
    "english": "ex",
    "chinese": "前任",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1034
  },
  {
    "italian": "contatto",
    "english": "contact",
    "chinese": "接触；联系",
    "patternType": "-atto/-at",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1108
  },
  {
    "italian": "America",
    "english": "america",
    "chinese": "美国",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1117
  },
  {
    "italian": "possibilità",
    "english": "possibility",
    "chinese": "可能性",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1161
  },
  {
    "italian": "necessario",
    "english": "necessary",
    "chinese": "必要的",
    "patternType": "-ario/-ary",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1163
  },
  {
    "italian": "reale",
    "english": "real",
    "chinese": "真实的；皇家的",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1177
  },
  {
    "italian": "sergente",
    "english": "sergeant",
    "chinese": "中士",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1235
  },
  {
    "italian": "presente",
    "english": "present",
    "chinese": "现在的；在场的",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1296
  },
  {
    "italian": "radio",
    "english": "radio",
    "chinese": "电台",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1323
  },
  {
    "italian": "operazione",
    "english": "operation",
    "chinese": "行动；手术；操作",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1363
  },
  {
    "italian": "bob",
    "english": "bobsleigh",
    "chinese": "有舵雪橇",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1488,
    "falseFriend": true,
    "falseFriendOf": "bob",
    "falseFriendChinese": "上下晃动；波波头",
    "italianFor": "oscillare / caschetto",
    "warning": "≠ bob（上下晃动；波波头）= oscillare / caschetto"
  },
  {
    "italian": "stazione",
    "english": "station",
    "chinese": "车站",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1493
  },
  {
    "italian": "contrario",
    "english": "contrary",
    "chinese": "相反",
    "patternType": "-ario/-ary",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1501
  },
  {
    "italian": "colore",
    "english": "color",
    "chinese": "颜色",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1598
  },
  {
    "italian": "professore",
    "english": "professor",
    "chinese": "教授",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1618
  },
  {
    "italian": "legale",
    "english": "legal",
    "chinese": "合法的；法律的",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1622
  },
  {
    "italian": "show",
    "english": "show",
    "chinese": "演出，表演",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1639
  },
  {
    "italian": "Anna",
    "english": "anna (name)",
    "chinese": "安娜（名字）",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1651
  },
  {
    "italian": "innocente",
    "english": "innocent",
    "chinese": "无辜的；无罪的",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1694
  },
  {
    "italian": "effetto",
    "english": "effect",
    "chinese": "效果",
    "patternType": "-etto/-et",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1700
  },
  {
    "italian": "assistente",
    "english": "assistant",
    "chinese": "助手；助理",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1724
  },
  {
    "italian": "taxi",
    "english": "taxi",
    "chinese": "出租车",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1741
  },
  {
    "italian": "super",
    "english": "super",
    "chinese": "超级；在上面",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1868
  },
  {
    "italian": "area",
    "english": "area",
    "chinese": "区域",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1907
  },
  {
    "italian": "cinema",
    "english": "cinema",
    "chinese": "电影院",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1947
  },
  {
    "italian": "animale",
    "english": "animal",
    "chinese": "动物",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1996
  },
  {
    "italian": "alice",
    "english": "alice",
    "chinese": "爱丽丝",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2034
  },
  {
    "italian": "killer",
    "english": "killer",
    "chinese": "杀手",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2057
  },
  {
    "italian": "naturale",
    "english": "natural",
    "chinese": "自然的；天然的",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2079
  },
  {
    "italian": "funerale",
    "english": "funeral",
    "chinese": "葬礼",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2130
  },
  {
    "italian": "partner",
    "english": "partner",
    "chinese": "合作伙伴",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2147
  },
  {
    "italian": "informazione",
    "english": "information",
    "chinese": "信息",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2178
  },
  {
    "italian": "protezione",
    "english": "protection",
    "chinese": "保护",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2266
  },
  {
    "italian": "Chicago",
    "english": "chicago",
    "chinese": "芝加哥",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2318
  },
  {
    "italian": "totale",
    "english": "total",
    "chinese": "共计",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2328
  },
  {
    "italian": "recente",
    "english": "recent",
    "chinese": "近期",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2367
  },
  {
    "italian": "pizza",
    "english": "pizza",
    "chinese": "披萨",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2369
  },
  {
    "italian": "baby",
    "english": "baby",
    "chinese": "宝宝",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2397
  },
  {
    "italian": "modello",
    "english": "model",
    "chinese": "模型；款式",
    "patternType": "-ello/-el",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2556
  },
  {
    "italian": "panico",
    "english": "panic",
    "chinese": "恐慌",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2557
  },
  {
    "italian": "marina",
    "english": "marina",
    "chinese": "码头",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2562
  },
  {
    "italian": "impressione",
    "english": "impressions",
    "chinese": "印象",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2601
  },
  {
    "italian": "nazione",
    "english": "nation",
    "chinese": "国家",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2672
  },
  {
    "italian": "artista",
    "english": "artist",
    "chinese": "艺术家",
    "patternType": "-ista/-ist",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2676
  },
  {
    "italian": "California",
    "english": "california",
    "chinese": "加利福尼亚州",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2677
  },
  {
    "italian": "università",
    "english": "university",
    "chinese": "大学",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2713
  },
  {
    "italian": "sale",
    "english": "salt",
    "chinese": "盐",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2721
  },
  {
    "italian": "incubo",
    "english": "incubus",
    "chinese": "噩梦",
    "patternType": null,
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 2756
  },
  {
    "italian": "senatore",
    "english": "senator",
    "chinese": "参议员",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2760
  },
  {
    "italian": "materiale",
    "english": "material",
    "chinese": "材料",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2825
  },
  {
    "italian": "opportunità",
    "english": "opportunities",
    "chinese": "机会",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2833
  },
  {
    "italian": "unità",
    "english": "unit",
    "chinese": "单位",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2844
  },
  {
    "italian": "Elena",
    "english": "elena",
    "chinese": "伊莲娜",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2880
  },
  {
    "italian": "federale",
    "english": "federal",
    "chinese": "联邦",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2910
  },
  {
    "italian": "van",
    "english": "van",
    "chinese": "货车；面包车",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2921
  },
  {
    "italian": "sufficiente",
    "english": "sufficient",
    "chinese": "足够",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2926
  },
  {
    "italian": "oscar",
    "english": "oscar",
    "chinese": "奥斯卡",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2927
  },
  {
    "italian": "west",
    "english": "west",
    "chinese": "西；西方",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 2967
  },
  {
    "italian": "televisione",
    "english": "television",
    "chinese": "电视",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3038
  },
  {
    "italian": "sociale",
    "english": "social",
    "chinese": "社会",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3041
  },
  {
    "italian": "reputazione",
    "english": "reputation",
    "chinese": "名誉",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3056
  },
  {
    "italian": "DOC",
    "english": "doc",
    "chinese": "医生",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3194
  },
  {
    "italian": "studente",
    "english": "student",
    "chinese": "学生",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3200
  },
  {
    "italian": "professionale",
    "english": "professional",
    "chinese": "专业",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3231
  },
  {
    "italian": "brillante",
    "english": "brilliant",
    "chinese": "出色的；闪亮的",
    "patternType": "-ante/-ant",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3239
  },
  {
    "italian": "Eva",
    "english": "eva",
    "chinese": "爱娃",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3252
  },
  {
    "italian": "metro",
    "english": "metro",
    "chinese": "地铁",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3268
  },
  {
    "italian": "zombie",
    "english": "zombie",
    "chinese": "僵尸",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3280
  },
  {
    "italian": "aggressione",
    "english": "aggression",
    "chinese": "侵略",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3324
  },
  {
    "italian": "Chiara",
    "english": "chiara",
    "chinese": "奇亚拉",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3344
  },
  {
    "italian": "alibi",
    "english": "alibi",
    "chinese": "不在场证明",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3356
  },
  {
    "italian": "urgente",
    "english": "urgent",
    "chinese": "紧急",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3374
  },
  {
    "italian": "Antonio",
    "english": "antonio",
    "chinese": "安东尼奥",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3421
  },
  {
    "italian": "romantico",
    "english": "romantic",
    "chinese": "浪漫主义",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3425
  },
  {
    "italian": "Texas",
    "english": "texas",
    "chinese": "德克萨斯",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3428
  },
  {
    "italian": "extra",
    "english": "extra",
    "chinese": "额外的",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3473
  },
  {
    "italian": "Africa",
    "english": "africa",
    "chinese": "非洲",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3533
  },
  {
    "italian": "e-mail",
    "english": "e-mail",
    "chinese": "电子邮件",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3541
  },
  {
    "italian": "manager",
    "english": "manager",
    "chinese": "经理；管理者",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3595
  },
  {
    "italian": "intervista",
    "english": "interview",
    "chinese": "访谈",
    "patternType": "-ista/-ist",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3712
  },
  {
    "italian": "registrazione",
    "english": "registration",
    "chinese": "登记",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3783
  },
  {
    "italian": "Barbara",
    "english": "barbara (name)",
    "chinese": "芭芭拉（名字）",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3795
  },
  {
    "italian": "confessione",
    "english": "confession",
    "chinese": "认罪",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3826
  },
  {
    "italian": "Russia",
    "english": "russia",
    "chinese": "俄罗斯",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3829
  },
  {
    "italian": "produzione",
    "english": "production",
    "chinese": "生产",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3839
  },
  {
    "italian": "Florida",
    "english": "florida",
    "chinese": "佛罗里达州",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3912
  },
  {
    "italian": "chance",
    "english": "chance",
    "chinese": "机会",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3926
  },
  {
    "italian": "elegante",
    "english": "elegant",
    "chinese": "优雅",
    "patternType": "-ante/-ant",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 3943
  },
  {
    "italian": "go",
    "english": "go",
    "chinese": "走开",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4017
  },
  {
    "italian": "mortale",
    "english": "mortal",
    "chinese": "人类",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4037
  },
  {
    "italian": "mago",
    "english": "magician",
    "chinese": "魔术师；魔法师",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 4038
  },
  {
    "italian": "capacità",
    "english": "capacity",
    "chinese": "能力",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4062
  },
  {
    "italian": "villa",
    "english": "villa",
    "chinese": "别墅",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4067
  },
  {
    "italian": "confusione",
    "english": "confusion",
    "chinese": "混淆",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4096
  },
  {
    "italian": "tradizione",
    "english": "tradition",
    "chinese": "传统",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4104
  },
  {
    "italian": "classico",
    "english": "classic",
    "chinese": "经典",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4128
  },
  {
    "italian": "magico",
    "english": "magic",
    "chinese": "魔术",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4132
  },
  {
    "italian": "prostituta",
    "english": "prostitute",
    "chinese": "卖淫",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4173
  },
  {
    "italian": "collezione",
    "english": "collection",
    "chinese": "收藏",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4176
  },
  {
    "italian": "considerazione",
    "english": "consideration",
    "chinese": "考虑，考量",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4202
  },
  {
    "italian": "evidente",
    "english": "evident",
    "chinese": "明显的，显而易见的",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4258
  },
  {
    "italian": "impatto",
    "english": "impact",
    "chinese": "影响",
    "patternType": "-atto/-at",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4261
  },
  {
    "italian": "consulente",
    "english": "consultant",
    "chinese": "咨询人",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4262
  },
  {
    "italian": "India",
    "english": "india",
    "chinese": "印度",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4310
  },
  {
    "italian": "tumore",
    "english": "tumor",
    "chinese": "肿瘤",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4313
  },
  {
    "italian": "pastore",
    "english": "pastor",
    "chinese": "牧师",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4339
  },
  {
    "italian": "cravatta",
    "english": "necktie",
    "chinese": "领带",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 4365
  },
  {
    "italian": "dose",
    "english": "dose",
    "chinese": "剂量",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4402
  },
  {
    "italian": "Victoria",
    "english": "victoria",
    "chinese": "维多利亚州",
    "patternType": "-oria/-ory",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4425
  },
  {
    "italian": "maya",
    "english": "maya",
    "chinese": "玛雅",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4459
  },
  {
    "italian": "cowboy",
    "english": "cowboy",
    "chinese": "牛仔",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4466
  },
  {
    "italian": "educazione",
    "english": "education",
    "chinese": "教育；教养，礼貌",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4482
  },
  {
    "italian": "vodka",
    "english": "vodka",
    "chinese": "伏特加",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4486
  },
  {
    "italian": "generazione",
    "english": "generation",
    "chinese": "生成",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4519
  },
  {
    "italian": "promozione",
    "english": "promotion",
    "chinese": "晋升",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4607
  },
  {
    "italian": "violazione",
    "english": "violation",
    "chinese": "违反",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4731
  },
  {
    "italian": "opzione",
    "english": "option",
    "chinese": "选项",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4741
  },
  {
    "italian": "associazione",
    "english": "association",
    "chinese": "协会",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4758
  },
  {
    "italian": "capitale",
    "english": "capital",
    "chinese": "资本",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4770
  },
  {
    "italian": "appello",
    "english": "appeal",
    "chinese": "上诉",
    "patternType": "-ello/-el",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4801
  },
  {
    "italian": "pasta",
    "english": "pasta",
    "chinese": "面条",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4872
  },
  {
    "italian": "invisibile",
    "english": "invisible",
    "chinese": "隐形",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4881
  },
  {
    "italian": "tigre",
    "english": "tiger",
    "chinese": "老虎",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 4922
  },
  {
    "italian": "Diana",
    "english": "diana",
    "chinese": "迪亚娜",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4945
  },
  {
    "italian": "alternativa",
    "english": "alternative",
    "chinese": "备选案文",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 4960
  },
  {
    "italian": "umanità",
    "english": "humanity",
    "chinese": "人类",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5005
  },
  {
    "italian": "Mario",
    "english": "mario",
    "chinese": "马里奥",
    "patternType": "-ario/-ary",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5015
  },
  {
    "italian": "database",
    "english": "database",
    "chinese": "数据库",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5046
  },
  {
    "italian": "investigatore",
    "english": "investigator",
    "chinese": "调查员",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5050
  },
  {
    "italian": "ella",
    "english": "ella",
    "chinese": "爱拉",
    "patternType": "-ella/-el",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5058
  },
  {
    "italian": "terrore",
    "english": "terror",
    "chinese": "恐怖行动",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5101
  },
  {
    "italian": "ala",
    "english": "wing",
    "chinese": "翅膀，机翼；（球队）边锋",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 5103
  },
  {
    "italian": "videocamera",
    "english": "video camera",
    "chinese": "摄像机",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5110
  },
  {
    "italian": "melissa",
    "english": "melissa",
    "chinese": "梅丽莎",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5126
  },
  {
    "italian": "presentazione",
    "english": "presentation",
    "chinese": "介绍，展示；提交",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5162
  },
  {
    "italian": "descrizione",
    "english": "description",
    "chinese": "说明",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5167
  },
  {
    "italian": "poker",
    "english": "poker",
    "chinese": "扑克游戏",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5269
  },
  {
    "italian": "Valentino",
    "english": "valentino",
    "chinese": "瓦伦蒂诺",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5274
  },
  {
    "italian": "Teresa",
    "english": "teresa",
    "chinese": "特丽莎",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5286
  },
  {
    "italian": "zoo",
    "english": "zoo",
    "chinese": "动物园",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5287
  },
  {
    "italian": "conclusione",
    "english": "conclusion",
    "chinese": "结论",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5294
  },
  {
    "italian": "gene",
    "english": "gene",
    "chinese": "基因",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5303
  },
  {
    "italian": "volume",
    "english": "volume",
    "chinese": "音量",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5313
  },
  {
    "italian": "campus",
    "english": "campus",
    "chinese": "校园",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5350
  },
  {
    "italian": "concetto",
    "english": "concept",
    "chinese": "概念",
    "patternType": "-etto/-et",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5367
  },
  {
    "italian": "vagina",
    "english": "vagina",
    "chinese": "阴道",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5393
  },
  {
    "italian": "collaborazione",
    "english": "collaboration",
    "chinese": "协作",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5473
  },
  {
    "italian": "festival",
    "english": "festival",
    "chinese": "节日",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5476
  },
  {
    "italian": "compassione",
    "english": "compassion",
    "chinese": "同情心",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5497
  },
  {
    "italian": "Ivan",
    "english": "ivan",
    "chinese": "伊万",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5499
  },
  {
    "italian": "ira",
    "english": "ire, wrath",
    "chinese": "愤怒；怒火",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 5504
  },
  {
    "italian": "Canada",
    "english": "canada",
    "chinese": "加拿大",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5533
  },
  {
    "italian": "Carlo",
    "english": "carlo",
    "chinese": "卡罗",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5570
  },
  {
    "italian": "cesso",
    "english": "toilet",
    "chinese": "厕所（粗俗说法）",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 5571
  },
  {
    "italian": "Carla",
    "english": "carla",
    "chinese": "卡拉",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5606
  },
  {
    "italian": "specifico",
    "english": "specific",
    "chinese": "具体",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5609
  },
  {
    "italian": "combinazione",
    "english": "combination",
    "chinese": "组合",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5633
  },
  {
    "italian": "Tokyo",
    "english": "tokyo",
    "chinese": "东京",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5643
  },
  {
    "italian": "perfezione",
    "english": "perfection",
    "chinese": "完美无缺",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5667
  },
  {
    "italian": "clown",
    "english": "clown",
    "chinese": "小丑",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5681
  },
  {
    "italian": "complimento",
    "english": "compliment",
    "chinese": "恭维",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5695
  },
  {
    "italian": "elementare",
    "english": "elementary",
    "chinese": "小学",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5713
  },
  {
    "italian": "Andrea",
    "english": "andrea",
    "chinese": "安德里亚",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5723
  },
  {
    "italian": "collaborare",
    "english": "collaborate",
    "chinese": "协作",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5766
  },
  {
    "italian": "shopping",
    "english": "shopping",
    "chinese": "购物",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5774
  },
  {
    "italian": "continuazione",
    "english": "continuation",
    "chinese": "继续",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5779
  },
  {
    "italian": "dentista",
    "english": "dentist",
    "chinese": "牙医",
    "patternType": "-ista/-ist",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5857
  },
  {
    "italian": "menu",
    "english": "menu",
    "chinese": "菜单",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5884
  },
  {
    "italian": "Toro",
    "english": "bull",
    "chinese": "公牛；（星座）金牛座",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 5885
  },
  {
    "italian": "depressione",
    "english": "depression",
    "chinese": "抑郁症",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5919
  },
  {
    "italian": "corruzione",
    "english": "corruption",
    "chinese": "腐败",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 5992
  },
  {
    "italian": "manco",
    "english": "not even",
    "chinese": "甚至不；连…也不",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 6011
  },
  {
    "italian": "server",
    "english": "server",
    "chinese": "服务器",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6023
  },
  {
    "italian": "diploma",
    "english": "diploma",
    "chinese": "文凭",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6037
  },
  {
    "italian": "modella",
    "english": "model",
    "chinese": "（女）模特",
    "patternType": "-ella/-el",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6085
  },
  {
    "italian": "quantità",
    "english": "quantity",
    "chinese": "数量",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6106
  },
  {
    "italian": "astronave",
    "english": "spaceship",
    "chinese": "宇宙飞船",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 6153
  },
  {
    "italian": "nausea",
    "english": "nausea",
    "chinese": "恶心",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6196
  },
  {
    "italian": "protagonista",
    "english": "protagonist",
    "chinese": "主角",
    "patternType": "-ista/-ist",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6220
  },
  {
    "italian": "arrogante",
    "english": "arrogant",
    "chinese": "傲慢无礼",
    "patternType": "-ante/-ant",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6228
  },
  {
    "italian": "improbabile",
    "english": "improbable",
    "chinese": "无法",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6300
  },
  {
    "italian": "professione",
    "english": "profession",
    "chinese": "职业",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6301
  },
  {
    "italian": "Omar",
    "english": "omar",
    "chinese": "奥马尔",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6315
  },
  {
    "italian": "emozione",
    "english": "emotion",
    "chinese": "情绪",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6403
  },
  {
    "italian": "portale",
    "english": "portal",
    "chinese": "门户",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6424
  },
  {
    "italian": "probabilità",
    "english": "probability",
    "chinese": "概率",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6439
  },
  {
    "italian": "appropriato",
    "english": "appropriate",
    "chinese": "适当",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6447
  },
  {
    "italian": "overdose",
    "english": "overdose",
    "chinese": "过量",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6486
  },
  {
    "italian": "formula",
    "english": "formula",
    "chinese": "公式",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6535
  },
  {
    "italian": "Australia",
    "english": "australia",
    "chinese": "澳大利亚",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6575
  },
  {
    "italian": "bowling",
    "english": "bowling",
    "chinese": "保龄球",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6583
  },
  {
    "italian": "vulnerabile",
    "english": "vulnerable",
    "chinese": "脆弱",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6584
  },
  {
    "italian": "hobby",
    "english": "hobby",
    "chinese": "爱好",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6606
  },
  {
    "italian": "hockey",
    "english": "hockey",
    "chinese": "曲棍球",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6645
  },
  {
    "italian": "concentrato",
    "english": "concentrate",
    "chinese": "集中精神",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6647
  },
  {
    "italian": "prudente",
    "english": "prudent",
    "chinese": "谨慎",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6670
  },
  {
    "italian": "destinazione",
    "english": "destination",
    "chinese": "目标",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6676
  },
  {
    "italian": "statale",
    "english": "state",
    "chinese": "国家的；国有的",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6699
  },
  {
    "italian": "rituale",
    "english": "ritual",
    "chinese": "仪式",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6700
  },
  {
    "italian": "banana",
    "english": "banana",
    "chinese": "香蕉",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6707
  },
  {
    "italian": "decente",
    "english": "decent",
    "chinese": "体面",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6749
  },
  {
    "italian": "personalità",
    "english": "personality",
    "chinese": "个性",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6807
  },
  {
    "italian": "agenda",
    "english": "diary, planner",
    "chinese": "记事本，日程本",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6842,
    "falseFriend": true,
    "falseFriendOf": "agenda",
    "falseFriendChinese": "议程",
    "italianFor": "ordine del giorno",
    "warning": "≠ agenda（议程）= ordine del giorno"
  },
  {
    "italian": "convincente",
    "english": "convincing",
    "chinese": "说服力",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 6934
  },
  {
    "italian": "fragile",
    "english": "fragile",
    "chinese": "脆弱",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7024
  },
  {
    "italian": "Georgia",
    "english": "georgia",
    "chinese": "格鲁吉亚",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7040
  },
  {
    "italian": "visuale",
    "english": "visual",
    "chinese": "视觉",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7050
  },
  {
    "italian": "intelligence",
    "english": "intelligence",
    "chinese": "情报",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7061
  },
  {
    "italian": "priorità",
    "english": "priority",
    "chinese": "优先级",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7066
  },
  {
    "italian": "limousine",
    "english": "limousine",
    "chinese": "轿车",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7077
  },
  {
    "italian": "creazione",
    "english": "creation",
    "chinese": "创建",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7123
  },
  {
    "italian": "distante",
    "english": "distant",
    "chinese": "遥远",
    "patternType": "-ante/-ant",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7142
  },
  {
    "italian": "categoria",
    "english": "category",
    "chinese": "类别",
    "patternType": "-oria/-ory",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7154
  },
  {
    "italian": "globale",
    "english": "global",
    "chinese": "全球",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7222
  },
  {
    "italian": "edizione",
    "english": "edition",
    "chinese": "版本",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7258
  },
  {
    "italian": "Ceneri",
    "english": "ashes",
    "chinese": "灰烬",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 7350
  },
  {
    "italian": "polo",
    "english": "pole",
    "chinese": "（地球的）极；磁极",
    "patternType": null,
    "similarityScore": 75,
    "difficulty": "medium",
    "rank": 7368
  },
  {
    "italian": "Luca",
    "english": "luca",
    "chinese": "卢卡",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7371
  },
  {
    "italian": "country",
    "english": "country",
    "chinese": "国家",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7388
  },
  {
    "italian": "Franco",
    "english": "franco",
    "chinese": "弗兰科",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7393
  },
  {
    "italian": "definizione",
    "english": "definition",
    "chinese": "定义",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7414
  },
  {
    "italian": "aquila",
    "english": "eagle",
    "chinese": "鹰，雕",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 7425
  },
  {
    "italian": "bacon",
    "english": "bacon",
    "chinese": "培根，咸肉",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7484
  },
  {
    "italian": "sentimentale",
    "english": "sentimental",
    "chinese": "感伤",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7488
  },
  {
    "italian": "Cuba",
    "english": "cuba",
    "chinese": "古巴",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7506
  },
  {
    "italian": "cognato",
    "english": "brother-in-law",
    "chinese": "姐夫，妹夫；大伯子，小叔子",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 7526
  },
  {
    "italian": "discrezione",
    "english": "discretion",
    "chinese": "酌情决定",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7533
  },
  {
    "italian": "orchestra",
    "english": "orchestra",
    "chinese": "乐团",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7548
  },
  {
    "italian": "spot",
    "english": "spot",
    "chinese": "（电视）广告片",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7593
  },
  {
    "italian": "distratto",
    "english": "distracted",
    "chinese": "心不在焉的，分心的",
    "patternType": "-atto/-at",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7608
  },
  {
    "italian": "app",
    "english": "app",
    "chinese": "应用",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7730
  },
  {
    "italian": "monitor",
    "english": "monitor",
    "chinese": "显示器",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7765
  },
  {
    "italian": "cagnolino",
    "english": "puppy",
    "chinese": "小狗",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 7807
  },
  {
    "italian": "insetto",
    "english": "insect",
    "chinese": "昆虫",
    "patternType": "-etto/-et",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7830
  },
  {
    "italian": "creatore",
    "english": "creator",
    "chinese": "创建者",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7847
  },
  {
    "italian": "lava",
    "english": "lava",
    "chinese": "熔岩",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7851
  },
  {
    "italian": "interruzione",
    "english": "interruption",
    "chinese": "中断",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7856
  },
  {
    "italian": "Alberto",
    "english": "alberto",
    "chinese": "阿尔贝托",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7867
  },
  {
    "italian": "federazione",
    "english": "federation",
    "chinese": "联邦",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7902
  },
  {
    "italian": "concentrazione",
    "english": "concentration",
    "chinese": "浓度",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7909
  },
  {
    "italian": "attrazione",
    "english": "attraction",
    "chinese": "吸引力",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7927
  },
  {
    "italian": "curiosità",
    "english": "curiosity",
    "chinese": "好奇心",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7987
  },
  {
    "italian": "immigrazione",
    "english": "immigration",
    "chinese": "移民",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 7998
  },
  {
    "italian": "brandy",
    "english": "brandy",
    "chinese": "白兰地",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8001
  },
  {
    "italian": "eternità",
    "english": "eternity",
    "chinese": "永远",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8007
  },
  {
    "italian": "crack",
    "english": "crack",
    "chinese": "裂缝",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8024
  },
  {
    "italian": "convivere",
    "english": "cohabit",
    "chinese": "同居；共同生活",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 8039
  },
  {
    "italian": "critico",
    "english": "critic",
    "chinese": "评论家",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8046
  },
  {
    "italian": "donazione",
    "english": "donation",
    "chinese": "捐赠",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8072
  },
  {
    "italian": "preparazione",
    "english": "preparation",
    "chinese": "准备，筹备",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8103
  },
  {
    "italian": "Arizona",
    "english": "arizona",
    "chinese": "亚利桑那州",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8113
  },
  {
    "italian": "evoluzione",
    "english": "evolution",
    "chinese": "演变",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8126
  },
  {
    "italian": "aggressivo",
    "english": "aggressive",
    "chinese": "攻击性",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8141
  },
  {
    "italian": "chilo",
    "english": "kilo",
    "chinese": "公斤",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8142
  },
  {
    "italian": "brutale",
    "english": "brutal",
    "chinese": "残酷",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8166
  },
  {
    "italian": "anatra",
    "english": "duck",
    "chinese": "鸭子",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 8186
  },
  {
    "italian": "clacson",
    "english": "horn",
    "chinese": "喇叭",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 8222
  },
  {
    "italian": "SUV",
    "english": "suv",
    "chinese": "运动型多用途车，越野车",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8228
  },
  {
    "italian": "gorilla",
    "english": "gorilla",
    "chinese": "大猩猩",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8238
  },
  {
    "italian": "reporter",
    "english": "reporter",
    "chinese": "记者",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8289
  },
  {
    "italian": "architetto",
    "english": "architect",
    "chinese": "建筑师",
    "patternType": "-etto/-et",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8291
  },
  {
    "italian": "gossip",
    "english": "gossip",
    "chinese": "闲话",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8302
  },
  {
    "italian": "Tessa",
    "english": "tessa",
    "chinese": "泰萨",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8324
  },
  {
    "italian": "account",
    "english": "account",
    "chinese": "账户",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8331
  },
  {
    "italian": "Roberto",
    "english": "roberto",
    "chinese": "罗伯托",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8337
  },
  {
    "italian": "midollo",
    "english": "marrow",
    "chinese": "骨髓",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 8365
  },
  {
    "italian": "immortale",
    "english": "immortal",
    "chinese": "长生不老",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8387
  },
  {
    "italian": "dignità",
    "english": "dignity",
    "chinese": "尊严",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8395
  },
  {
    "italian": "miserabile",
    "english": "miserable",
    "chinese": "悲惨",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8407
  },
  {
    "italian": "oca",
    "english": "goose",
    "chinese": "鹅",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 8413
  },
  {
    "italian": "bridge",
    "english": "bridge",
    "chinese": "桥",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8488
  },
  {
    "italian": "Cristina",
    "english": "cristina",
    "chinese": "克莉丝汀娜",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8507
  },
  {
    "italian": "fatale",
    "english": "fatal",
    "chinese": "致命",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8524
  },
  {
    "italian": "insignificante",
    "english": "insignificant",
    "chinese": "无关紧要",
    "patternType": "-ante/-ant",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8534
  },
  {
    "italian": "seminario",
    "english": "seminar",
    "chinese": "研讨会",
    "patternType": "-ario/-ary",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8543
  },
  {
    "italian": "specialista",
    "english": "specialist",
    "chinese": "专家",
    "patternType": "-ista/-ist",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8578
  },
  {
    "italian": "popcorn",
    "english": "popcorn",
    "chinese": "爆米花",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8636
  },
  {
    "italian": "veterinario",
    "english": "veterinarian",
    "chinese": "兽医",
    "patternType": "-ario/-ary",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8665
  },
  {
    "italian": "distributore",
    "english": "distributor",
    "chinese": "分销商",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8671
  },
  {
    "italian": "infernale",
    "english": "infernal",
    "chinese": "地狱",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8709
  },
  {
    "italian": "tragico",
    "english": "tragic",
    "chinese": "悲剧",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8714
  },
  {
    "italian": "imminente",
    "english": "imminent",
    "chinese": "即将",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8718
  },
  {
    "italian": "banale",
    "english": "banal",
    "chinese": "平庸的，老套的",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8731
  },
  {
    "italian": "streaming",
    "english": "streaming",
    "chinese": "流媒体",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8743
  },
  {
    "italian": "drive",
    "english": "drive",
    "chinese": "驱动",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8753
  },
  {
    "italian": "mentore",
    "english": "mentor",
    "chinese": "导师",
    "patternType": "-ore/-or",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8755
  },
  {
    "italian": "deficiente",
    "english": "moron",
    "chinese": "蠢货，笨蛋（骂人话）",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 90,
    "difficulty": "easy",
    "rank": 8774,
    "falseFriend": true,
    "falseFriendOf": "deficient",
    "falseFriendChinese": "不足的，缺乏的",
    "italianFor": "carente",
    "warning": "≠ deficient（不足的，缺乏的）= carente"
  },
  {
    "italian": "invenzione",
    "english": "invention",
    "chinese": "发明",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8788
  },
  {
    "italian": "montgomery",
    "english": "montgomery",
    "chinese": "蒙哥马利",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8839
  },
  {
    "italian": "yacht",
    "english": "yacht",
    "chinese": "游艇",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8859
  },
  {
    "italian": "differente",
    "english": "different",
    "chinese": "不同",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8861
  },
  {
    "italian": "primario",
    "english": "primary",
    "chinese": "小学",
    "patternType": "-ario/-ary",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8871
  },
  {
    "italian": "artificiale",
    "english": "artificial",
    "chinese": "人工",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8903
  },
  {
    "italian": "logico",
    "english": "logic",
    "chinese": "逻辑",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8945
  },
  {
    "italian": "evacuazione",
    "english": "evacuation",
    "chinese": "撤离",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 8948
  },
  {
    "italian": "identificazione",
    "english": "identification",
    "chinese": "识别",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9021
  },
  {
    "italian": "necessità",
    "english": "necessity",
    "chinese": "必要性",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9033
  },
  {
    "italian": "liberazione",
    "english": "liberation",
    "chinese": "解放组织",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9035
  },
  {
    "italian": "dama",
    "english": "lady",
    "chinese": "贵妇；淑女",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 9136
  },
  {
    "italian": "Madrid",
    "english": "madrid",
    "chinese": "马德里",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9155
  },
  {
    "italian": "Giorgio",
    "english": "giorgio",
    "chinese": "乔治",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9160
  },
  {
    "italian": "ironico",
    "english": "ironic",
    "chinese": "讽刺",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9196
  },
  {
    "italian": "dorsale",
    "english": "dorsal",
    "chinese": "背部的；（山、海）脊",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9225
  },
  {
    "italian": "inappropriato",
    "english": "inappropriate",
    "chinese": "不适当",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9246
  },
  {
    "italian": "celia",
    "english": "celia",
    "chinese": "西莉亚",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9271
  },
  {
    "italian": "distrazione",
    "english": "distraction",
    "chinese": "分散注意力",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9287
  },
  {
    "italian": "balletto",
    "english": "ballet",
    "chinese": "芭蕾舞团",
    "patternType": "-etto/-et",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9291
  },
  {
    "italian": "gravità",
    "english": "gravity",
    "chinese": "重力",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9312
  },
  {
    "italian": "ambizione",
    "english": "ambition",
    "chinese": "目标",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9347
  },
  {
    "italian": "Maura",
    "english": "maura",
    "chinese": "马乌拉",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9355
  },
  {
    "italian": "Sabrina",
    "english": "sabrina",
    "chinese": "莎宾娜",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9358
  },
  {
    "italian": "conquista",
    "english": "conquest",
    "chinese": "征服",
    "patternType": "-ista/-ist",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9371
  },
  {
    "italian": "panorama",
    "english": "panorama",
    "chinese": "全景图",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9432
  },
  {
    "italian": "analista",
    "english": "analyst",
    "chinese": "分析员",
    "patternType": "-ista/-ist",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9448
  },
  {
    "italian": "container",
    "english": "container",
    "chinese": "容器",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9453
  },
  {
    "italian": "vialetto",
    "english": "driveway",
    "chinese": "车道",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 9484
  },
  {
    "italian": "Colorado",
    "english": "colorado",
    "chinese": "科罗拉多州",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9492
  },
  {
    "italian": "identico",
    "english": "identical",
    "chinese": "完全相同的",
    "patternType": "-ico/-ic",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9512
  },
  {
    "italian": "damigella",
    "english": "damsel",
    "chinese": "少女；小姐",
    "patternType": "-ella/-el",
    "similarityScore": 55,
    "difficulty": "medium",
    "rank": 9553
  },
  {
    "italian": "motto",
    "english": "motto",
    "chinese": "格言",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9593
  },
  {
    "italian": "plasma",
    "english": "plasma",
    "chinese": "等离子体",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9600
  },
  {
    "italian": "rivale",
    "english": "rival",
    "chinese": "对手",
    "patternType": "-ale/-al",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9610
  },
  {
    "italian": "ictus",
    "english": "stroke (medical)",
    "chinese": "中风",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 9628
  },
  {
    "italian": "cola",
    "english": "cola",
    "chinese": "可乐",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9658
  },
  {
    "italian": "Iran",
    "english": "iran",
    "chinese": "伊朗",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9661
  },
  {
    "italian": "citazione",
    "english": "citation",
    "chinese": "引用",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9670
  },
  {
    "italian": "continente",
    "english": "continent",
    "chinese": "大陆",
    "patternType": "-ente/-ent",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9677
  },
  {
    "italian": "recitazione",
    "english": "recitation",
    "chinese": "朗诵",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9712
  },
  {
    "italian": "horror",
    "english": "horror",
    "chinese": "恐怖片",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9719
  },
  {
    "italian": "formidabile",
    "english": "formidable",
    "chinese": "了不起的，极好的",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9725
  },
  {
    "italian": "nostalgia",
    "english": "nostalgia",
    "chinese": "怀旧",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9758
  },
  {
    "italian": "game",
    "english": "game",
    "chinese": "游戏",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9783
  },
  {
    "italian": "Alaska",
    "english": "alaska",
    "chinese": "阿拉斯加",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9815
  },
  {
    "italian": "ape",
    "english": "bee",
    "chinese": "蜜蜂",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9820,
    "falseFriend": true,
    "falseFriendOf": "ape",
    "falseFriendChinese": "猿",
    "italianFor": "scimmia",
    "warning": "≠ ape（猿）= scimmia"
  },
  {
    "italian": "detenzione",
    "english": "detention",
    "chinese": "拘留",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9863
  },
  {
    "italian": "karate",
    "english": "karate",
    "chinese": "空手道",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9865
  },
  {
    "italian": "empire",
    "english": "empire",
    "chinese": "帝国",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9912
  },
  {
    "italian": "mozione",
    "english": "motion",
    "chinese": "动议",
    "patternType": "-zione/-tion",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9941
  },
  {
    "italian": "celebrità",
    "english": "celebrities",
    "chinese": "名人",
    "patternType": "-ità/-ity",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9958
  },
  {
    "italian": "successo",
    "english": "success",
    "chinese": "成功；成就",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 205
  },
  {
    "italian": "momento",
    "english": "moment",
    "chinese": "时刻；瞬间",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 218
  },
  {
    "italian": "problema",
    "english": "problem",
    "chinese": "问题",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 262
  },
  {
    "italian": "persona",
    "english": "person",
    "chinese": "人",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 317
  },
  {
    "italian": "Secondo",
    "english": "second",
    "chinese": "第二的；按照，根据",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 323
  },
  {
    "italian": "possibile",
    "english": "possible",
    "chinese": "可能的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 431
  },
  {
    "italian": "fortuna",
    "english": "fortune",
    "chinese": "运气；财富",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 584
  },
  {
    "italian": "revisione",
    "english": "revision",
    "chinese": "订正",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 653
  },
  {
    "italian": "specie",
    "english": "species",
    "chinese": "物种",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 883
  },
  {
    "italian": "programma",
    "english": "programme",
    "chinese": "节目；程序；计划",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 946
  },
  {
    "italian": "terribile",
    "english": "terrible",
    "chinese": "可怕的，糟糕的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 968
  },
  {
    "italian": "questione",
    "english": "question",
    "chinese": "问题",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1002
  },
  {
    "italian": "lettera",
    "english": "letter",
    "chinese": "信件",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1082
  },
  {
    "italian": "missione",
    "english": "mission",
    "chinese": "任务；使命",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1098
  },
  {
    "italian": "decisione",
    "english": "decision",
    "chinese": "决定",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1151
  },
  {
    "italian": "occasione",
    "english": "occasion",
    "chinese": "机会；场合",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1157
  },
  {
    "italian": "processo",
    "english": "process",
    "chinese": "过程；审判",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1216
  },
  {
    "italian": "periodo",
    "english": "period",
    "chinese": "期间",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1344
  },
  {
    "italian": "destino",
    "english": "destiny",
    "chinese": "命运",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1450
  },
  {
    "italian": "accesso",
    "english": "access",
    "chinese": "进入；通道",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1641
  },
  {
    "italian": "americano",
    "english": "american",
    "chinese": "美国人",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1736
  },
  {
    "italian": "privato",
    "english": "private",
    "chinese": "私人的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1899
  },
  {
    "italian": "società",
    "english": "society",
    "chinese": "社会；公司",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 1974
  },
  {
    "italian": "completo",
    "english": "complete",
    "chinese": "完整的；齐全的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2007
  },
  {
    "italian": "universo",
    "english": "universe",
    "chinese": "宇宙",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2038
  },
  {
    "italian": "talento",
    "english": "talent",
    "chinese": "天赋",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2076
  },
  {
    "italian": "militare",
    "english": "military",
    "chinese": "军事",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2100
  },
  {
    "italian": "medicina",
    "english": "medicine",
    "chinese": "医学；药",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2172
  },
  {
    "italian": "opinione",
    "english": "opinion",
    "chinese": "意见",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2220
  },
  {
    "italian": "versione",
    "english": "version",
    "chinese": "版本",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2291
  },
  {
    "italian": "credito",
    "english": "credit",
    "chinese": "信贷",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2366
  },
  {
    "italian": "stomaco",
    "english": "stomach",
    "chinese": "胃",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2380
  },
  {
    "italian": "cinese",
    "english": "chinese",
    "chinese": "中国的；汉语，中文",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2410
  },
  {
    "italian": "pensione",
    "english": "pension",
    "chinese": "退休金；养老金",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2570
  },
  {
    "italian": "adorabile",
    "english": "adorable",
    "chinese": "可爱",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2626
  },
  {
    "italian": "positivo",
    "english": "positive",
    "chinese": "积极的；阳性的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2701
  },
  {
    "italian": "preciso",
    "english": "precise",
    "chinese": "精确的；准确的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2750
  },
  {
    "italian": "probabile",
    "english": "probable",
    "chinese": "可能的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2780
  },
  {
    "italian": "concerto",
    "english": "concert",
    "chinese": "音乐会",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2794
  },
  {
    "italian": "supporto",
    "english": "support",
    "chinese": "支撑；支持",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2847
  },
  {
    "italian": "passione",
    "english": "passion",
    "chinese": "热情",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2866
  },
  {
    "italian": "profilo",
    "english": "profile",
    "chinese": "侧面，轮廓；简介",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2876
  },
  {
    "italian": "sincero",
    "english": "sincere",
    "chinese": "真诚",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2936
  },
  {
    "italian": "visione",
    "english": "vision",
    "chinese": "愿景",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 2952
  },
  {
    "italian": "creatura",
    "english": "creature",
    "chinese": "动物",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3013
  },
  {
    "italian": "documento",
    "english": "document",
    "chinese": "文档",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3108
  },
  {
    "italian": "negativo",
    "english": "negative",
    "chinese": "负数",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3341
  },
  {
    "italian": "uniforme",
    "english": "uniform",
    "chinese": "制服",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3538
  },
  {
    "italian": "vampiro",
    "english": "vampire",
    "chinese": "吸血鬼",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3599
  },
  {
    "italian": "divisione",
    "english": "division",
    "chinese": "分割，划分；（数）除法",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3677
  },
  {
    "italian": "italiano",
    "english": "italian",
    "chinese": "意大利语；意大利的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3836
  },
  {
    "italian": "deposito",
    "english": "deposit",
    "chinese": "存款",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3858
  },
  {
    "italian": "reverendo",
    "english": "reverend",
    "chinese": "牧师",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3877
  },
  {
    "italian": "imbecille",
    "english": "imbecile",
    "chinese": "无智",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 3966
  },
  {
    "italian": "whisky",
    "english": "whiskey",
    "chinese": "威士忌",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4052
  },
  {
    "italian": "dollaro",
    "english": "dollar",
    "chinese": "美元数",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4054
  },
  {
    "italian": "cultura",
    "english": "culture",
    "chinese": "文化",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4092
  },
  {
    "italian": "eliminare",
    "english": "eliminate",
    "chinese": "消除；淘汰",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4134
  },
  {
    "italian": "violento",
    "english": "violent",
    "chinese": "暴力行为",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4215
  },
  {
    "italian": "accento",
    "english": "accent",
    "chinese": "重音",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4263
  },
  {
    "italian": "stupide",
    "english": "stupid",
    "chinese": "蠢货",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4366
  },
  {
    "italian": "cocaina",
    "english": "cocaine",
    "chinese": "可卡因",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4378
  },
  {
    "italian": "internazionale",
    "english": "international",
    "chinese": "国际",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4513
  },
  {
    "italian": "Monica",
    "english": "monica (name)",
    "chinese": "莫妮卡（名字）",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4542
  },
  {
    "italian": "religione",
    "english": "religion",
    "chinese": "宗教",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4604
  },
  {
    "italian": "stabile",
    "english": "stable",
    "chinese": "稳定",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4680
  },
  {
    "italian": "congresso",
    "english": "congress",
    "chinese": "大会",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4724
  },
  {
    "italian": "candidato",
    "english": "candidate",
    "chinese": "候选人",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4795
  },
  {
    "italian": "origine",
    "english": "origin",
    "chinese": "来源",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4812
  },
  {
    "italian": "appetito",
    "english": "appetite",
    "chinese": "进食",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4870
  },
  {
    "italian": "Berlino",
    "english": "berlin",
    "chinese": "柏林",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 4964
  },
  {
    "italian": "sindrome",
    "english": "syndrome",
    "chinese": "综合症",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 5483
  },
  {
    "italian": "amministratore",
    "english": "administrator",
    "chinese": "管理员，管理者",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 5740
  },
  {
    "italian": "diagnosi",
    "english": "diagnosis",
    "chinese": "诊断",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6129
  },
  {
    "italian": "applauso",
    "english": "applause",
    "chinese": "掌声",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6199
  },
  {
    "italian": "Scienze",
    "english": "science",
    "chinese": "科学",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6253
  },
  {
    "italian": "vicepresidente",
    "english": "vice-president",
    "chinese": "副主席",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6366
  },
  {
    "italian": "delicato",
    "english": "delicate",
    "chinese": "细腻",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6389
  },
  {
    "italian": "elemento",
    "english": "element",
    "chinese": "元素；要素",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6395
  },
  {
    "italian": "classica",
    "english": "classic",
    "chinese": "经典",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6433
  },
  {
    "italian": "regione",
    "english": "region",
    "chinese": "区域",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6445
  },
  {
    "italian": "circuito",
    "english": "circuit",
    "chinese": "电路；巡回",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6522
  },
  {
    "italian": "maniaco",
    "english": "maniac",
    "chinese": "疯子",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6689
  },
  {
    "italian": "illusione",
    "english": "illusion",
    "chinese": "错觉",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6753
  },
  {
    "italian": "cannone",
    "english": "cannon",
    "chinese": "炮声",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6800
  },
  {
    "italian": "massacro",
    "english": "massacre",
    "chinese": "屠杀",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 6974
  },
  {
    "italian": "commento",
    "english": "comment",
    "chinese": "注释",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7036
  },
  {
    "italian": "epidemia",
    "english": "epidemic",
    "chinese": "流行病",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7041
  },
  {
    "italian": "progresso",
    "english": "progress",
    "chinese": "进展",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7107
  },
  {
    "italian": "invasione",
    "english": "invasion",
    "chinese": "入侵",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7176
  },
  {
    "italian": "barriera",
    "english": "barrier",
    "chinese": "障碍",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7284
  },
  {
    "italian": "Israele",
    "english": "israel",
    "chinese": "以色列",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7343
  },
  {
    "italian": "pancake",
    "english": "pancakes",
    "chinese": "煎饼",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7421
  },
  {
    "italian": "intenso",
    "english": "intense",
    "chinese": "强度",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7610
  },
  {
    "italian": "caverna",
    "english": "cavern",
    "chinese": "山洞",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7621
  },
  {
    "italian": "vaccino",
    "english": "vaccine",
    "chinese": "疫苗",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7825
  },
  {
    "italian": "celebrare",
    "english": "celebrate",
    "chinese": "庆祝",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 7863
  },
  {
    "italian": "yogurt",
    "english": "yoghurt",
    "chinese": "酸奶",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8342
  },
  {
    "italian": "capsula",
    "english": "capsule",
    "chinese": "胶囊",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8423
  },
  {
    "italian": "antidoto",
    "english": "antidote",
    "chinese": "解药",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8430
  },
  {
    "italian": "violino",
    "english": "violin",
    "chinese": "小提琴",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8493
  },
  {
    "italian": "creativo",
    "english": "creative",
    "chinese": "创意",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8770
  },
  {
    "italian": "credibile",
    "english": "credible",
    "chinese": "可信的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8860
  },
  {
    "italian": "offensivo",
    "english": "offensive",
    "chinese": "冒犯的；进攻的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8872
  },
  {
    "italian": "patrigno",
    "english": "stepfather",
    "chinese": "继父",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 8938
  },
  {
    "italian": "orgasmo",
    "english": "orgasm",
    "chinese": "高潮",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8970
  },
  {
    "italian": "balcone",
    "english": "balcony",
    "chinese": "阳台",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8974
  },
  {
    "italian": "ostile",
    "english": "hostile",
    "chinese": "敌对",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 8990
  },
  {
    "italian": "pentagono",
    "english": "pentagon",
    "chinese": "五边形",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9059
  },
  {
    "italian": "tabacco",
    "english": "tobacco",
    "chinese": "烟草",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9149
  },
  {
    "italian": "vulcano",
    "english": "volcano",
    "chinese": "火山喷发",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9230
  },
  {
    "italian": "modesto",
    "english": "modest",
    "chinese": "谦虚的；适度的，不多的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9360
  },
  {
    "italian": "formato",
    "english": "format",
    "chinese": "格式",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9410
  },
  {
    "italian": "Baltimora",
    "english": "baltimore",
    "chinese": "巴尔的摩",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9417
  },
  {
    "italian": "opportuno",
    "english": "opportune",
    "chinese": "适当的；合宜的",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9461
  },
  {
    "italian": "insulto",
    "english": "insult",
    "chinese": "侮辱",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9559
  },
  {
    "italian": "convento",
    "english": "convent",
    "chinese": "修道院",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9724
  },
  {
    "italian": "intestino",
    "english": "intestine",
    "chinese": "肠道",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9729
  },
  {
    "italian": "indicare",
    "english": "indicate",
    "chinese": "指出，表明",
    "patternType": null,
    "similarityScore": 99,
    "difficulty": "easy",
    "rank": 9994
  },
  {
    "italian": "stato",
    "english": "state",
    "chinese": "状态；国家",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 70
  },
  {
    "italian": "parte",
    "english": "part",
    "chinese": "部分；一方",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 147
  },
  {
    "italian": "senso",
    "english": "sense",
    "chinese": "感觉",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 517
  },
  {
    "italian": "causa",
    "english": "cause",
    "chinese": "原因",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 625
  },
  {
    "italian": "pace",
    "english": "peace",
    "chinese": "和平",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 671
  },
  {
    "italian": "musica",
    "english": "music",
    "chinese": "音乐",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 673
  },
  {
    "italian": "minuto",
    "english": "minute",
    "chinese": "分钟",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 742
  },
  {
    "italian": "porto",
    "english": "port",
    "chinese": "港口",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 858
  },
  {
    "italian": "centro",
    "english": "centre",
    "chinese": "中心",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 882
  },
  {
    "italian": "linea",
    "english": "line",
    "chinese": "线；线路",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1054
  },
  {
    "italian": "fronte",
    "english": "front",
    "chinese": "前面；前线",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1062
  },
  {
    "italian": "calma",
    "english": "calm",
    "chinese": "平静；冷静",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1071
  },
  {
    "italian": "visita",
    "english": "visit",
    "chinese": "参观；探访；就诊",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1208
  },
  {
    "italian": "differenza",
    "english": "difference",
    "chinese": "差别；不同",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1247
  },
  {
    "italian": "hotel",
    "english": "hotel",
    "chinese": "旅馆",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1254
  },
  {
    "italian": "responsabile",
    "english": "responsible",
    "chinese": "负责",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1333
  },
  {
    "italian": "serie",
    "english": "series",
    "chinese": "系列；连续剧",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1417
  },
  {
    "italian": "guida",
    "english": "guide",
    "chinese": "指南",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1423
  },
  {
    "italian": "laboratorio",
    "english": "laboratory",
    "chinese": "实验室",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1469
  },
  {
    "italian": "natura",
    "english": "nature",
    "chinese": "自然；本性",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1593
  },
  {
    "italian": "continuo",
    "english": "continuous",
    "chinese": "连续",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1669
  },
  {
    "italian": "stile",
    "english": "style",
    "chinese": "风格",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1672
  },
  {
    "italian": "magia",
    "english": "magic",
    "chinese": "魔法；魔术",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1699
  },
  {
    "italian": "creare",
    "english": "create",
    "chinese": "创建",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1743
  },
  {
    "italian": "importanza",
    "english": "importance",
    "chinese": "重要性",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1785
  },
  {
    "italian": "Emma",
    "english": "emma (name)",
    "chinese": "艾玛（名字）",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1857
  },
  {
    "italian": "angelo",
    "english": "angel",
    "chinese": "天使",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 1929
  },
  {
    "italian": "preparato",
    "english": "prepared",
    "chinese": "准备好的",
    "patternType": null,
    "similarityScore": 66,
    "difficulty": "medium",
    "rank": 2110
  },
  {
    "italian": "Laura",
    "english": "laura (name)",
    "chinese": "劳拉（名字）",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2225
  },
  {
    "italian": "crisi",
    "english": "crisis",
    "chinese": "危机",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2303
  },
  {
    "italian": "falso",
    "english": "false",
    "chinese": "虚假",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2314
  },
  {
    "italian": "complicato",
    "english": "complicated",
    "chinese": "复杂",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2428
  },
  {
    "italian": "banda",
    "english": "band",
    "chinese": "乐队；帮派",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2484
  },
  {
    "italian": "esplosione",
    "english": "explosion",
    "chinese": "爆炸",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2485
  },
  {
    "italian": "intervento",
    "english": "intervention",
    "chinese": "干预",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2543
  },
  {
    "italian": "pilota",
    "english": "pilot",
    "chinese": "飞行员",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2572
  },
  {
    "italian": "evento",
    "english": "event",
    "chinese": "事件",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2587
  },
  {
    "italian": "eccellente",
    "english": "excellent",
    "chinese": "极好的，优秀的",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2774
  },
  {
    "italian": "tomba",
    "english": "tomb",
    "chinese": "墓",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2820
  },
  {
    "italian": "scala",
    "english": "scale",
    "chinese": "楼梯；比例尺；音阶",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2853
  },
  {
    "italian": "Europa",
    "english": "europe",
    "chinese": "欧洲",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2884
  },
  {
    "italian": "fiero",
    "english": "proud",
    "chinese": "自豪的，骄傲的",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 2982
  },
  {
    "italian": "coincidenza",
    "english": "coincidence",
    "chinese": "巧合",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 2987
  },
  {
    "italian": "oceano",
    "english": "ocean",
    "chinese": "海洋",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3090
  },
  {
    "italian": "partecipare",
    "english": "participate",
    "chinese": "参与",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3211
  },
  {
    "italian": "figura",
    "english": "figure",
    "chinese": "图形；人物；身材",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3255
  },
  {
    "italian": "conferenza",
    "english": "conference",
    "chinese": "会议",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3429
  },
  {
    "italian": "demone",
    "english": "demon",
    "chinese": "恶魔",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3444
  },
  {
    "italian": "territorio",
    "english": "territory",
    "chinese": "领土",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3500
  },
  {
    "italian": "costo",
    "english": "cost",
    "chinese": "费用",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3535
  },
  {
    "italian": "matematica",
    "english": "mathematics",
    "chinese": "数学",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3635
  },
  {
    "italian": "adulto",
    "english": "adult",
    "chinese": "成人",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3700
  },
  {
    "italian": "possesso",
    "english": "possession",
    "chinese": "拥有",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3730
  },
  {
    "italian": "espressione",
    "english": "expression",
    "chinese": "表达式",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 3905
  },
  {
    "italian": "esperimento",
    "english": "experiment",
    "chinese": "实验",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4047
  },
  {
    "italian": "difficoltà",
    "english": "difficulty",
    "chinese": "难度",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4151
  },
  {
    "italian": "caos",
    "english": "chaos",
    "chinese": "混乱",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4159
  },
  {
    "italian": "unione",
    "english": "union",
    "chinese": "工会",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4243
  },
  {
    "italian": "complice",
    "english": "accomplice",
    "chinese": "共犯",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4315
  },
  {
    "italian": "protocollo",
    "english": "protocol",
    "chinese": "议定书",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4470
  },
  {
    "italian": "sacrificio",
    "english": "sacrifice",
    "chinese": "牺牲",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4479
  },
  {
    "italian": "portafoglio",
    "english": "portfolio",
    "chinese": "组合",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4565
  },
  {
    "italian": "passaporto",
    "english": "passport",
    "chinese": "护照",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4615
  },
  {
    "italian": "trasmissione",
    "english": "transmission",
    "chinese": "传输",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4692
  },
  {
    "italian": "drago",
    "english": "dragon",
    "chinese": "龙",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4745
  },
  {
    "italian": "Diego",
    "english": "diego (name)",
    "chinese": "迭戈（名字）",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4767
  },
  {
    "italian": "schema",
    "english": "scheme",
    "chinese": "计划",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4882
  },
  {
    "italian": "valle",
    "english": "valley",
    "chinese": "谷类",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 4972
  },
  {
    "italian": "indipendente",
    "english": "independent",
    "chinese": "独立",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5066
  },
  {
    "italian": "modulo",
    "english": "module",
    "chinese": "模块",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5106
  },
  {
    "italian": "intelligenza",
    "english": "intelligence",
    "chinese": "情报",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5131
  },
  {
    "italian": "fondamentale",
    "english": "fundamental",
    "chinese": "基础",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5289
  },
  {
    "italian": "logica",
    "english": "logic",
    "chinese": "逻辑",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5295
  },
  {
    "italian": "aprile",
    "english": "april",
    "chinese": "四月",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5309
  },
  {
    "italian": "acido",
    "english": "acid",
    "chinese": "酸盐",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5441
  },
  {
    "italian": "dieta",
    "english": "diet",
    "chinese": "饮食",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5490
  },
  {
    "italian": "Corea",
    "english": "korea",
    "chinese": "韩国",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5494
  },
  {
    "italian": "repubblica",
    "english": "republic",
    "chinese": "共和国",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5521
  },
  {
    "italian": "sperma",
    "english": "sperm",
    "chinese": "精子",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5623
  },
  {
    "italian": "statua",
    "english": "statue",
    "chinese": "雕像",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5719
  },
  {
    "italian": "alieno",
    "english": "alien",
    "chinese": "外国人",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5784
  },
  {
    "italian": "investimento",
    "english": "investment",
    "chinese": "投资",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 5943
  },
  {
    "italian": "Satana",
    "english": "satan",
    "chinese": "恶魔",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6148
  },
  {
    "italian": "solitudine",
    "english": "solitude",
    "chinese": "孤独",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6287
  },
  {
    "italian": "valido",
    "english": "valid",
    "chinese": "无效",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6320
  },
  {
    "italian": "eliminato",
    "english": "eliminated",
    "chinese": "已删除",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6376
  },
  {
    "italian": "entusiasmo",
    "english": "enthusiasm",
    "chinese": "热情",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6431
  },
  {
    "italian": "colto",
    "english": "cultured, learned",
    "chinese": "有学识的，有教养的",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 6495
  },
  {
    "italian": "orbita",
    "english": "orbit",
    "chinese": "轨道",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6526
  },
  {
    "italian": "barone",
    "english": "baron",
    "chinese": "男爵",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6598
  },
  {
    "italian": "dramma",
    "english": "drama",
    "chinese": "戏剧",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6637
  },
  {
    "italian": "senato",
    "english": "senate",
    "chinese": "参议院",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6702
  },
  {
    "italian": "ossessione",
    "english": "obsession",
    "chinese": "执着",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6885
  },
  {
    "italian": "Milano",
    "english": "milan",
    "chinese": "米兰",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 6990
  },
  {
    "italian": "peste",
    "english": "plague",
    "chinese": "瘟疫，鼠疫",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 7193,
    "falseFriend": true,
    "falseFriendOf": "pest",
    "falseFriendChinese": "害虫",
    "italianFor": "parassita",
    "warning": "≠ pest（害虫）= parassita"
  },
  {
    "italian": "iniziativa",
    "english": "initiative",
    "chinese": "倡议",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7261
  },
  {
    "italian": "gratitudine",
    "english": "gratitude",
    "chinese": "谢谢",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7291
  },
  {
    "italian": "poeta",
    "english": "poet",
    "chinese": "诗人",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7366
  },
  {
    "italian": "altare",
    "english": "altar",
    "chinese": "祭坛",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7572
  },
  {
    "italian": "privilegio",
    "english": "privilege",
    "chinese": "特权",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7786
  },
  {
    "italian": "abuso",
    "english": "abuse",
    "chinese": "虐待",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7798
  },
  {
    "italian": "tradizionale",
    "english": "traditional",
    "chinese": "传统",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7812
  },
  {
    "italian": "individuo",
    "english": "individual",
    "chinese": "个人",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7826
  },
  {
    "italian": "pope",
    "english": "popes",
    "chinese": "数字",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7832
  },
  {
    "italian": "quarantena",
    "english": "quarantine",
    "chinese": "检疫",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7888
  },
  {
    "italian": "essenziale",
    "english": "essential",
    "chinese": "关键",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7912
  },
  {
    "italian": "apocalisse",
    "english": "apocalypse",
    "chinese": "启示录",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7970
  },
  {
    "italian": "passeggero",
    "english": "passenger",
    "chinese": "乘客",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 7990
  },
  {
    "italian": "divino",
    "english": "divine",
    "chinese": "神圣的，神的",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8053
  },
  {
    "italian": "Romani",
    "english": "romans",
    "chinese": "罗马人",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8248
  },
  {
    "italian": "telegramma",
    "english": "telegram",
    "chinese": "电报",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8313
  },
  {
    "italian": "tribù",
    "english": "tribe",
    "chinese": "部落",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8398
  },
  {
    "italian": "ammissione",
    "english": "admission",
    "chinese": "录取",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8432
  },
  {
    "italian": "contributo",
    "english": "contribution",
    "chinese": "捐款",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8551
  },
  {
    "italian": "galla",
    "english": "gall",
    "chinese": "胆量",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8571
  },
  {
    "italian": "sacrificare",
    "english": "sacrifice",
    "chinese": "牺牲",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8739
  },
  {
    "italian": "dormitorio",
    "english": "dormitory",
    "chinese": "宿舍",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8893
  },
  {
    "italian": "determinare",
    "english": "determine",
    "chinese": "决定",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8906
  },
  {
    "italian": "gallo",
    "english": "gall",
    "chinese": "胆量",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 8942
  },
  {
    "italian": "confidenza",
    "english": "familiarity",
    "chinese": "亲近；熟络",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 9083,
    "falseFriend": true,
    "falseFriendOf": "confidence",
    "falseFriendChinese": "信心",
    "italianFor": "fiducia",
    "warning": "≠ confidence（信心）= fiducia"
  },
  {
    "italian": "elettronica",
    "english": "electronics",
    "chinese": "电子",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9123
  },
  {
    "italian": "maturo",
    "english": "mature",
    "chinese": "成熟",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9269
  },
  {
    "italian": "parlamento",
    "english": "parliament",
    "chinese": "议会",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9328
  },
  {
    "italian": "meccanismo",
    "english": "mechanism",
    "chinese": "机制",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9455
  },
  {
    "italian": "reggimento",
    "english": "regiment",
    "chinese": "团",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9507
  },
  {
    "italian": "donare",
    "english": "donate",
    "chinese": "捐赠",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9522
  },
  {
    "italian": "elettricità",
    "english": "electricity",
    "chinese": "电",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9619
  },
  {
    "italian": "battaglione",
    "english": "battalion",
    "chinese": "营",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9664
  },
  {
    "italian": "astuto",
    "english": "astute",
    "chinese": "聪明",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9773
  },
  {
    "italian": "contrabbando",
    "english": "contraband",
    "chinese": "违禁品",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9806
  },
  {
    "italian": "troll",
    "english": "troll",
    "chinese": "巨怪",
    "patternType": null,
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 9833
  },
  {
    "italian": "competenza",
    "english": "competence",
    "chinese": "权限",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9838
  },
  {
    "italian": "organo",
    "english": "organ",
    "chinese": "机关",
    "patternType": null,
    "similarityScore": 98,
    "difficulty": "easy",
    "rank": 9849
  },
  {
    "italian": "difficile",
    "english": "difficult",
    "chinese": "困难",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 460
  },
  {
    "italian": "controllo",
    "english": "control",
    "chinese": "控制",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 595
  },
  {
    "italian": "direttore",
    "english": "director",
    "chinese": "主任；经理；导演",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 1218
  },
  {
    "italian": "interesse",
    "english": "interest",
    "chinese": "兴趣；利息",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 2224
  },
  {
    "italian": "ambulanza",
    "english": "ambulance",
    "chinese": "救护车",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 2350
  },
  {
    "italian": "movimento",
    "english": "movement",
    "chinese": "移动",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 2377
  },
  {
    "italian": "corridoio",
    "english": "corridor",
    "chinese": "走廊",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 2766
  },
  {
    "italian": "struttura",
    "english": "structure",
    "chinese": "结构",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 3043
  },
  {
    "italian": "influenza",
    "english": "influence",
    "chinese": "影响",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 3067
  },
  {
    "italian": "organizzazione",
    "english": "organization",
    "chinese": "组织",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 3158
  },
  {
    "italian": "sigaretta",
    "english": "cigarette",
    "chinese": "香烟",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 3171
  },
  {
    "italian": "preside",
    "english": "principal",
    "chinese": "校长",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 3295
  },
  {
    "italian": "traditore",
    "english": "traitor",
    "chinese": "卖国贼",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 3645
  },
  {
    "italian": "autorità",
    "english": "authority",
    "chinese": "权力",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 3684
  },
  {
    "italian": "ministero",
    "english": "ministry",
    "chinese": "部委",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4019
  },
  {
    "italian": "comunicazione",
    "english": "communication",
    "chinese": "通讯",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4237
  },
  {
    "italian": "tecnica",
    "english": "technical",
    "chinese": "技术",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4289
  },
  {
    "italian": "immaginazione",
    "english": "imagination",
    "chinese": "想象力",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4326
  },
  {
    "italian": "interrogatorio",
    "english": "interrogation",
    "chinese": "审讯",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4393
  },
  {
    "italian": "comunità",
    "english": "community",
    "chinese": "社区",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4568
  },
  {
    "italian": "trasporto",
    "english": "transport",
    "chinese": "运输",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4742
  },
  {
    "italian": "principio",
    "english": "principle",
    "chinese": "原则；开始",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4782
  },
  {
    "italian": "sensibile",
    "english": "sensitive",
    "chinese": "敏感",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 4860
  },
  {
    "italian": "industria",
    "english": "industry",
    "chinese": "工业",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 5412
  },
  {
    "italian": "conflitto",
    "english": "conflict",
    "chinese": "冲突",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 5539
  },
  {
    "italian": "frequenza",
    "english": "frequency",
    "chinese": "频率",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 5721
  },
  {
    "italian": "perimetro",
    "english": "perimeter",
    "chinese": "周边",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 5883
  },
  {
    "italian": "discusso",
    "english": "discussed",
    "chinese": "讨论",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 5936
  },
  {
    "italian": "contenuto",
    "english": "content",
    "chinese": "内容",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 6038
  },
  {
    "italian": "dedicato",
    "english": "dedicated",
    "chinese": "专用",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 6183
  },
  {
    "italian": "esplosivo",
    "english": "explosive",
    "chinese": "炸药",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 6491
  },
  {
    "italian": "innocenza",
    "english": "innocence",
    "chinese": "无罪",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 6657
  },
  {
    "italian": "negoziare",
    "english": "negotiate",
    "chinese": "谈判",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 6862
  },
  {
    "italian": "instabile",
    "english": "unstable",
    "chinese": "不稳定",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 7068
  },
  {
    "italian": "esclusiva",
    "english": "exclusive",
    "chinese": "独家",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 7440
  },
  {
    "italian": "depresso",
    "english": "depressed",
    "chinese": "忧郁",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 7582
  },
  {
    "italian": "corrispondenza",
    "english": "correspondence",
    "chinese": "来往信件",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 7749
  },
  {
    "italian": "operativo",
    "english": "operating",
    "chinese": "运行",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 7766
  },
  {
    "italian": "Cristiano",
    "english": "christian",
    "chinese": "基督教徒",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 7784
  },
  {
    "italian": "competere",
    "english": "compete",
    "chinese": "竞争",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 8093
  },
  {
    "italian": "rilevante",
    "english": "relevant",
    "chinese": "相关",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 8201
  },
  {
    "italian": "artificio",
    "english": "artifice",
    "chinese": "艺术",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 8221
  },
  {
    "italian": "autentico",
    "english": "authentic",
    "chinese": "真实",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 8572
  },
  {
    "italian": "autografo",
    "english": "autograph",
    "chinese": "签名",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 8710
  },
  {
    "italian": "provincia",
    "english": "province",
    "chinese": "省份",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 8712
  },
  {
    "italian": "circolare",
    "english": "circular",
    "chinese": "圆形",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 9014
  },
  {
    "italian": "assemblea",
    "english": "assembly",
    "chinese": "大会",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 9245
  },
  {
    "italian": "religioso",
    "english": "religious",
    "chinese": "宗教",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 9570
  },
  {
    "italian": "inaccettabile",
    "english": "unacceptable",
    "chinese": "无法接受",
    "patternType": null,
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 9582
  },
  {
    "italian": "caso",
    "english": "case",
    "chinese": "情况；案件",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 253
  },
  {
    "italian": "nome",
    "english": "name",
    "chinese": "名称",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 260
  },
  {
    "italian": "macchina",
    "english": "machine",
    "chinese": "机器；汽车",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 350
  },
  {
    "italian": "strano",
    "english": "strange",
    "chinese": "奇怪",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 509
  },
  {
    "italian": "dottore",
    "english": "doctor",
    "chinese": "医生",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 538
  },
  {
    "italian": "arrivo",
    "english": "arrival",
    "chinese": "抵达",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 747
  },
  {
    "italian": "sistema",
    "english": "system",
    "chinese": "系统",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 816
  },
  {
    "italian": "segreto",
    "english": "secret",
    "chinese": "秘密",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 854
  },
  {
    "italian": "realtà",
    "english": "reality",
    "chinese": "现实",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 941
  },
  {
    "italian": "simile",
    "english": "similar",
    "chinese": "类似",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1069
  },
  {
    "italian": "pubblico",
    "english": "public",
    "chinese": "公众；公开的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1087
  },
  {
    "italian": "guardia",
    "english": "guard",
    "chinese": "警卫",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1121
  },
  {
    "italian": "attacco",
    "english": "attack",
    "chinese": "攻击",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1171
  },
  {
    "italian": "crimine",
    "english": "crime",
    "chinese": "犯罪；罪行",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1189
  },
  {
    "italian": "episodio",
    "english": "episode",
    "chinese": "一集；事件",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1239
  },
  {
    "italian": "data",
    "english": "date",
    "chinese": "日期",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1318
  },
  {
    "italian": "energia",
    "english": "energy",
    "chinese": "能量；精力",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1345
  },
  {
    "italian": "offerta",
    "english": "offer",
    "chinese": "提议",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1382
  },
  {
    "italian": "esperienza",
    "english": "experience",
    "chinese": "经历",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1399
  },
  {
    "italian": "pianeta",
    "english": "planet",
    "chinese": "行星",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1414
  },
  {
    "italian": "orribile",
    "english": "horrible",
    "chinese": "可怕的，糟糕的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1429
  },
  {
    "italian": "comando",
    "english": "command",
    "chinese": "命令",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1471
  },
  {
    "italian": "segnale",
    "english": "signal",
    "chinese": "信号",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1478
  },
  {
    "italian": "sceriffo",
    "english": "sheriff",
    "chinese": "警长",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1512
  },
  {
    "italian": "dipartimento",
    "english": "department",
    "chinese": "部门",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1520
  },
  {
    "italian": "decidere",
    "english": "decide",
    "chinese": "决定",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1617
  },
  {
    "italian": "creato",
    "english": "created",
    "chinese": "创建",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1690
  },
  {
    "italian": "principe",
    "english": "prince",
    "chinese": "王子；亲王",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1710
  },
  {
    "italian": "capace",
    "english": "capable",
    "chinese": "能够",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1782
  },
  {
    "italian": "pratica",
    "english": "practice",
    "chinese": "实践",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1882
  },
  {
    "italian": "Numeri",
    "english": "numbers",
    "chinese": "数字",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 1969
  },
  {
    "italian": "distanza",
    "english": "distance",
    "chinese": "距离",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2033
  },
  {
    "italian": "corrente",
    "english": "current",
    "chinese": "水流；电流；当前的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2089
  },
  {
    "italian": "allarme",
    "english": "alarm",
    "chinese": "警报",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2098
  },
  {
    "italian": "ministro",
    "english": "minister",
    "chinese": "部长",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2133
  },
  {
    "italian": "presenza",
    "english": "presence",
    "chinese": "出席；在场",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2149
  },
  {
    "italian": "est",
    "english": "east",
    "chinese": "东",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2182
  },
  {
    "italian": "violenza",
    "english": "violence",
    "chinese": "暴力行为",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2184
  },
  {
    "italian": "articolo",
    "english": "article",
    "chinese": "文章；物品；条款",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2185
  },
  {
    "italian": "Francia",
    "english": "france",
    "chinese": "法国",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2229
  },
  {
    "italian": "Roma",
    "english": "rome",
    "chinese": "罗马",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2231
  },
  {
    "italian": "disastro",
    "english": "disaster",
    "chinese": "灾难",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2284
  },
  {
    "italian": "minimo",
    "english": "minimum",
    "chinese": "最低",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2307
  },
  {
    "italian": "analisi",
    "english": "analysis",
    "chinese": "分析",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2386
  },
  {
    "italian": "proposta",
    "english": "proposal",
    "chinese": "建议",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2466
  },
  {
    "italian": "teatro",
    "english": "theatre",
    "chinese": "剧场",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2492
  },
  {
    "italian": "Coso",
    "english": "thing, thingy",
    "chinese": "那个东西，那家伙（口语）",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 2604
  },
  {
    "italian": "nota",
    "english": "note",
    "chinese": "笔记；音符；便条",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2638
  },
  {
    "italian": "miracolo",
    "english": "miracle",
    "chinese": "奇迹",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2659
  },
  {
    "italian": "suicidio",
    "english": "suicide",
    "chinese": "自杀",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2687
  },
  {
    "italian": "onesto",
    "english": "honest",
    "chinese": "诚实的",
    "patternType": null,
    "similarityScore": 66,
    "difficulty": "medium",
    "rank": 2707
  },
  {
    "italian": "maestà",
    "english": "majesty",
    "chinese": "陛下",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2799
  },
  {
    "italian": "tecnologia",
    "english": "technology",
    "chinese": "技术",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2803
  },
  {
    "italian": "attività",
    "english": "activity",
    "chinese": "活动",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2837
  },
  {
    "italian": "scienza",
    "english": "science",
    "chinese": "科学",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2856
  },
  {
    "italian": "confuso",
    "english": "confused",
    "chinese": "困惑的；混乱的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2898
  },
  {
    "italian": "Messico",
    "english": "mexico",
    "chinese": "墨西哥",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2913
  },
  {
    "italian": "istante",
    "english": "instant",
    "chinese": "即时",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 2931
  },
  {
    "italian": "ione",
    "english": "ion",
    "chinese": "离子",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3037
  },
  {
    "italian": "disgustoso",
    "english": "disgusting",
    "chinese": "恶心",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3046
  },
  {
    "italian": "cioccolato",
    "english": "chocolate",
    "chinese": "巧克力",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3094
  },
  {
    "italian": "settore",
    "english": "sector",
    "chinese": "部门",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3124
  },
  {
    "italian": "considerato",
    "english": "considered",
    "chinese": "考虑",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3266
  },
  {
    "italian": "elicottero",
    "english": "helicopter",
    "chinese": "直升机",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3333
  },
  {
    "italian": "mistero",
    "english": "mystery",
    "chinese": "谜题",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3335
  },
  {
    "italian": "Germania",
    "english": "germany",
    "chinese": "德国",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3400
  },
  {
    "italian": "segretario",
    "english": "secretary",
    "chinese": "秘书",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3442
  },
  {
    "italian": "tragedia",
    "english": "tragedy",
    "chinese": "悲剧",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3487
  },
  {
    "italian": "minima",
    "english": "minimum",
    "chinese": "最低",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3630
  },
  {
    "italian": "curioso",
    "english": "curious",
    "chinese": "好奇的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3759
  },
  {
    "italian": "riserva",
    "english": "reserve",
    "chinese": "准备金",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3780
  },
  {
    "italian": "leggenda",
    "english": "legend",
    "chinese": "图例",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3787
  },
  {
    "italian": "atmosfera",
    "english": "atmosphere",
    "chinese": "大气层",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 3922
  },
  {
    "italian": "simbolo",
    "english": "symbol",
    "chinese": "符号",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4102
  },
  {
    "italian": "accetta",
    "english": "accept",
    "chinese": "接受",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4148
  },
  {
    "italian": "licenza",
    "english": "license",
    "chinese": "许可证",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4153
  },
  {
    "italian": "tono",
    "english": "tone",
    "chinese": "语气",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4167
  },
  {
    "italian": "isolato",
    "english": "isolated",
    "chinese": "单独",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4216
  },
  {
    "italian": "segreteria",
    "english": "secretariat",
    "chinese": "秘书处",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4241
  },
  {
    "italian": "batteria",
    "english": "battery",
    "chinese": "电池",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4249
  },
  {
    "italian": "assistenza",
    "english": "assistance",
    "chinese": "协助",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4360
  },
  {
    "italian": "patetico",
    "english": "pathetic",
    "chinese": "可悲的，可怜的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4427
  },
  {
    "italian": "gentili",
    "english": "gentiles",
    "chinese": "外国侨民",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4476
  },
  {
    "italian": "rivoluzione",
    "english": "revolution",
    "chinese": "革命",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4484
  },
  {
    "italian": "autopsia",
    "english": "autopsy",
    "chinese": "尸检",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4532
  },
  {
    "italian": "continuato",
    "english": "continued",
    "chinese": "续",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4630
  },
  {
    "italian": "cinesi",
    "english": "chinese",
    "chinese": "中国的（复数）；中国人",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4674
  },
  {
    "italian": "autorizzazione",
    "english": "authorization",
    "chinese": "授权",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4681
  },
  {
    "italian": "eccellenza",
    "english": "excellence",
    "chinese": "优秀",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4685
  },
  {
    "italian": "economia",
    "english": "economy",
    "chinese": "经济",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4727
  },
  {
    "italian": "entusiasta",
    "english": "enthusiastic",
    "chinese": "热情的，热衷的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4728
  },
  {
    "italian": "codardo",
    "english": "coward",
    "chinese": "胆小鬼",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4779
  },
  {
    "italian": "connessione",
    "english": "connection",
    "chinese": "连接",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4840
  },
  {
    "italian": "stadio",
    "english": "stadium",
    "chinese": "体育场",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4858
  },
  {
    "italian": "assoluto",
    "english": "absolute",
    "chinese": "绝对",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4935
  },
  {
    "italian": "osservazione",
    "english": "observation",
    "chinese": "观察",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 4995
  },
  {
    "italian": "esecuzione",
    "english": "execution",
    "chinese": "执行",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5068
  },
  {
    "italian": "strumento",
    "english": "instrument",
    "chinese": "工具，器械；乐器",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5094
  },
  {
    "italian": "lesbica",
    "english": "lesbian",
    "chinese": "女同性恋",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5208
  },
  {
    "italian": "popolazione",
    "english": "population",
    "chinese": "人口数",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5218
  },
  {
    "italian": "rivolta",
    "english": "revolt",
    "chinese": "叛乱",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5280
  },
  {
    "italian": "generoso",
    "english": "generous",
    "chinese": "宽宏大量",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5315
  },
  {
    "italian": "galleria",
    "english": "gallery",
    "chinese": "画廊",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5319
  },
  {
    "italian": "causare",
    "english": "cause",
    "chinese": "原因",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5366
  },
  {
    "italian": "microfono",
    "english": "microphone",
    "chinese": "麦克风",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5401
  },
  {
    "italian": "opposto",
    "english": "opposite",
    "chinese": "相对",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5424
  },
  {
    "italian": "calibro",
    "english": "caliber",
    "chinese": "口径",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5595
  },
  {
    "italian": "conseguenza",
    "english": "consequence",
    "chinese": "结果",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5641
  },
  {
    "italian": "scienziato",
    "english": "scientist",
    "chinese": "科学家",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5652
  },
  {
    "italian": "novembre",
    "english": "november",
    "chinese": "十一月",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5738
  },
  {
    "italian": "ispirazione",
    "english": "inspiration",
    "chinese": "灵感",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5750
  },
  {
    "italian": "raro",
    "english": "rare",
    "chinese": "罕见",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5818
  },
  {
    "italian": "cioccolata",
    "english": "chocolate",
    "chinese": "巧克力块",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5820
  },
  {
    "italian": "autunno",
    "english": "autumn",
    "chinese": "秋季",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5904
  },
  {
    "italian": "consenso",
    "english": "consent",
    "chinese": "同意书",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5922
  },
  {
    "italian": "regolare",
    "english": "regular",
    "chinese": "常设经常",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5941
  },
  {
    "italian": "proibito",
    "english": "prohibited",
    "chinese": "被禁止",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 5942
  },
  {
    "italian": "fama",
    "english": "fame",
    "chinese": "名声",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6064
  },
  {
    "italian": "riabilitazione",
    "english": "rehabilitation",
    "chinese": "康复",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6099
  },
  {
    "italian": "costante",
    "english": "constant",
    "chinese": "常数",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6238
  },
  {
    "italian": "intervenire",
    "english": "intervention",
    "chinese": "干预",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6247
  },
  {
    "italian": "dividere",
    "english": "divide",
    "chinese": "分隔",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6264
  },
  {
    "italian": "ginnastica",
    "english": "gymnastics",
    "chinese": "体操",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6349
  },
  {
    "italian": "conforto",
    "english": "comfort",
    "chinese": "舒适",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6364
  },
  {
    "italian": "Michele",
    "english": "michael",
    "chinese": "迈克尔",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6374
  },
  {
    "italian": "espresso",
    "english": "expression",
    "chinese": "表达式",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6392
  },
  {
    "italian": "archivio",
    "english": "archive",
    "chinese": "归档",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6472
  },
  {
    "italian": "sequenza",
    "english": "sequence",
    "chinese": "顺序",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6488
  },
  {
    "italian": "fenomeno",
    "english": "phenomenon",
    "chinese": "现象",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6493
  },
  {
    "italian": "assalto",
    "english": "assault",
    "chinese": "突击，猛攻",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6569
  },
  {
    "italian": "lotteria",
    "english": "lottery",
    "chinese": "彩票",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6619
  },
  {
    "italian": "bottone",
    "english": "button",
    "chinese": "按钮",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6620
  },
  {
    "italian": "agitato",
    "english": "agitated",
    "chinese": "激动",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6759
  },
  {
    "italian": "dipendenza",
    "english": "dependence",
    "chinese": "依赖性",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6808
  },
  {
    "italian": "legittima",
    "english": "legitimate",
    "chinese": "合法",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 6987
  },
  {
    "italian": "carità",
    "english": "charity",
    "chinese": "慈善事业",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7012
  },
  {
    "italian": "democrazia",
    "english": "democracy",
    "chinese": "民主与民主",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7184
  },
  {
    "italian": "fondazione",
    "english": "foundation",
    "chinese": "基础",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7304
  },
  {
    "italian": "mito",
    "english": "myth",
    "chinese": "神话；传奇人物",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7308
  },
  {
    "italian": "volgare",
    "english": "vulgar",
    "chinese": "粗鲁",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7341
  },
  {
    "italian": "iniziale",
    "english": "initial",
    "chinese": "最初的；首字母",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7460
  },
  {
    "italian": "cervo",
    "english": "cervous",
    "chinese": "宫颈",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7471
  },
  {
    "italian": "determinato",
    "english": "determined",
    "chinese": "坚定的；确定的，特定的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7522
  },
  {
    "italian": "spettacolare",
    "english": "spectacular",
    "chinese": "壮观",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7556
  },
  {
    "italian": "circolazione",
    "english": "circulation",
    "chinese": "发行量",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7611
  },
  {
    "italian": "semestre",
    "english": "semester",
    "chinese": "学期",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7638
  },
  {
    "italian": "estremo",
    "english": "extreme",
    "chinese": "极端",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7659
  },
  {
    "italian": "mina",
    "english": "mine",
    "chinese": "矿；地雷",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7891
  },
  {
    "italian": "descrivere",
    "english": "describe",
    "chinese": "描述",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7942
  },
  {
    "italian": "corriere",
    "english": "courier",
    "chinese": "快递员，信使",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 7971
  },
  {
    "italian": "letteratura",
    "english": "literature",
    "chinese": "文学",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8002
  },
  {
    "italian": "definire",
    "english": "define",
    "chinese": "定义",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8088
  },
  {
    "italian": "Brasile",
    "english": "brazil",
    "chinese": "巴西",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8104
  },
  {
    "italian": "arteria",
    "english": "artery",
    "chinese": "动脉",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8163
  },
  {
    "italian": "clima",
    "english": "climate",
    "chinese": "气候；氛围",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8223
  },
  {
    "italian": "rimorso",
    "english": "remorse",
    "chinese": "悔过",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8307
  },
  {
    "italian": "educato",
    "english": "polite, well-mannered",
    "chinese": "有礼貌的，有教养的",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8319,
    "falseFriend": true,
    "falseFriendOf": "educated",
    "falseFriendChinese": "受过教育的",
    "italianFor": "istruito",
    "warning": "≠ educated（受过教育的）= istruito"
  },
  {
    "italian": "furioso",
    "english": "furious",
    "chinese": "愤怒",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8345
  },
  {
    "italian": "fattore",
    "english": "factor",
    "chinese": "因素",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8457
  },
  {
    "italian": "atleta",
    "english": "athlete",
    "chinese": "运动员",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8512
  },
  {
    "italian": "collegio",
    "english": "boarding school",
    "chinese": "寄宿学校；（选举）选区",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8620,
    "falseFriend": true,
    "falseFriendOf": "college",
    "falseFriendChinese": "大学，学院",
    "italianFor": "università",
    "warning": "≠ college（大学，学院）= università"
  },
  {
    "italian": "aborto",
    "english": "abortion",
    "chinese": "堕胎",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8695
  },
  {
    "italian": "Irlanda",
    "english": "ireland",
    "chinese": "爱尔兰",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8715
  },
  {
    "italian": "anomalia",
    "english": "anomaly",
    "chinese": "异常",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8749
  },
  {
    "italian": "costituzione",
    "english": "constitution",
    "chinese": "宪法",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8754
  },
  {
    "italian": "apprezzare",
    "english": "appreciate",
    "chinese": "感谢",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8798
  },
  {
    "italian": "contesto",
    "english": "context",
    "chinese": "上下文",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8888
  },
  {
    "italian": "essenza",
    "english": "essence",
    "chinese": "实质",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8930
  },
  {
    "italian": "appassionato",
    "english": "passionate",
    "chinese": "热爱…的；热情的",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8947
  },
  {
    "italian": "ottimista",
    "english": "optimistic",
    "chinese": "乐观",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9032
  },
  {
    "italian": "bizzarro",
    "english": "bizarre",
    "chinese": "奇异无比",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9135
  },
  {
    "italian": "indipendenza",
    "english": "independence",
    "chinese": "独立",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9199
  },
  {
    "italian": "urgenza",
    "english": "urgency",
    "chinese": "紧急",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9466
  },
  {
    "italian": "accusare",
    "english": "accuse",
    "chinese": "指控",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9577
  },
  {
    "italian": "biologia",
    "english": "biology",
    "chinese": "生物学",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9594
  },
  {
    "italian": "maratona",
    "english": "marathon",
    "chinese": "马拉松",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9633
  },
  {
    "italian": "assente",
    "english": "absent",
    "chinese": "缺席",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9649
  },
  {
    "italian": "facoltà",
    "english": "faculty",
    "chinese": "学院",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9710
  },
  {
    "italian": "osservato",
    "english": "observed",
    "chinese": "被观察到的；被遵守的",
    "patternType": null,
    "similarityScore": 55,
    "difficulty": "medium",
    "rank": 9723
  },
  {
    "italian": "coreano",
    "english": "korean",
    "chinese": "韩语",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9732
  },
  {
    "italian": "addome",
    "english": "abdomen",
    "chinese": "腹部",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9862
  },
  {
    "italian": "celibato",
    "english": "celibacy",
    "chinese": "独身",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9905
  },
  {
    "italian": "istruttore",
    "english": "instructor",
    "chinese": "教员",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 9920
  },
  {
    "italian": "storia",
    "english": "story",
    "chinese": "故事；历史",
    "patternType": "-oria/-ory",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 312
  },
  {
    "italian": "valore",
    "english": "value",
    "chinese": "价值",
    "patternType": "-ore/-or",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 1819
  },
  {
    "italian": "gloria",
    "english": "glory",
    "chinese": "荣耀",
    "patternType": "-oria/-ory",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 2277
  },
  {
    "italian": "diario",
    "english": "diary",
    "chinese": "日记",
    "patternType": "-ario/-ary",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 3131
  },
  {
    "italian": "tratto",
    "english": "tract",
    "chinese": "路径",
    "patternType": "-atto/-at",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 3381
  },
  {
    "italian": "mentale",
    "english": "mentality",
    "chinese": "心态",
    "patternType": "-ale/-al",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 3654
  },
  {
    "italian": "affetto",
    "english": "affection",
    "chinese": "爱",
    "patternType": "-etto/-et",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 3978
  },
  {
    "italian": "protetto",
    "english": "protected",
    "chinese": "保护",
    "patternType": "-etto/-et",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 4536
  },
  {
    "italian": "infezione",
    "english": "infection",
    "chinese": "感染",
    "patternType": "-zione/-tion",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 4714
  },
  {
    "italian": "autore",
    "english": "author",
    "chinese": "作者",
    "patternType": "-ore/-or",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 5612
  },
  {
    "italian": "letale",
    "english": "lethal",
    "chinese": "致命",
    "patternType": "-ale/-al",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 6221
  },
  {
    "italian": "orrore",
    "english": "horror",
    "chinese": "恐惧",
    "patternType": "-ore/-or",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 6579
  },
  {
    "italian": "musicista",
    "english": "musician",
    "chinese": "音乐家",
    "patternType": "-ista/-ist",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 8118
  },
  {
    "italian": "duello",
    "english": "duel",
    "chinese": "决斗",
    "patternType": "-ello/-el",
    "similarityScore": 83,
    "difficulty": "easy",
    "rank": 8711
  },
  {
    "italian": "fatto",
    "english": "fact",
    "chinese": "事实；行为；已完成的",
    "patternType": "-atto/-at",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 49
  },
  {
    "italian": "onore",
    "english": "honor",
    "chinese": "荣誉",
    "patternType": "-ore/-or",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 758
  },
  {
    "italian": "certamente",
    "english": "certainly",
    "chinese": "当然",
    "patternType": "-mente/-ly",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 1134
  },
  {
    "italian": "castello",
    "english": "castle",
    "chinese": "城堡",
    "patternType": "-ello/-el",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 2629
  },
  {
    "italian": "patto",
    "english": "pact",
    "chinese": "协议，条约",
    "patternType": "-atto/-at",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 2720
  },
  {
    "italian": "morale",
    "english": "morality",
    "chinese": "道德",
    "patternType": "-ale/-al",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 2739
  },
  {
    "italian": "reazione",
    "english": "reaction",
    "chinese": "反应",
    "patternType": "-zione/-tion",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 2956
  },
  {
    "italian": "commissario",
    "english": "commissioner",
    "chinese": "专员",
    "patternType": "-ario/-ary",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 3412
  },
  {
    "italian": "attraente",
    "english": "attractive",
    "chinese": "吸引性",
    "patternType": "-ente/-ent",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 3666
  },
  {
    "italian": "funzione",
    "english": "function",
    "chinese": "函数",
    "patternType": "-zione/-tion",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 5420
  },
  {
    "italian": "diamante",
    "english": "diamond",
    "chinese": "钻石",
    "patternType": "-ante/-ant",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 6025
  },
  {
    "italian": "adozione",
    "english": "adoption",
    "chinese": "收养",
    "patternType": "-zione/-tion",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 7312
  },
  {
    "italian": "irritante",
    "english": "irritation",
    "chinese": "刺激",
    "patternType": "-ante/-ant",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 8627
  },
  {
    "italian": "ratto",
    "english": "rat",
    "chinese": "鼠类",
    "patternType": "-atto/-at",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 8681
  },
  {
    "italian": "erezione",
    "english": "erection",
    "chinese": "竖起",
    "patternType": "-zione/-tion",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 9090
  },
  {
    "italian": "scenario",
    "english": "scenery",
    "chinese": "风景",
    "patternType": "-ario/-ary",
    "similarityScore": 82,
    "difficulty": "easy",
    "rank": 9344
  },
  {
    "italian": "durante",
    "english": "during",
    "chinese": "期间",
    "patternType": "-ante/-ant",
    "similarityScore": 81,
    "difficulty": "easy",
    "rank": 657
  },
  {
    "italian": "lezione",
    "english": "lesson",
    "chinese": "课；教训",
    "patternType": "-zione/-tion",
    "similarityScore": 81,
    "difficulty": "easy",
    "rank": 1304
  },
  {
    "italian": "sezione",
    "english": "section",
    "chinese": "节次",
    "patternType": "-zione/-tion",
    "similarityScore": 81,
    "difficulty": "easy",
    "rank": 2973
  },
  {
    "italian": "geniale",
    "english": "genius",
    "chinese": "天赋",
    "patternType": "-ale/-al",
    "similarityScore": 81,
    "difficulty": "easy",
    "rank": 3464
  },
  {
    "italian": "umiliante",
    "english": "humiliating",
    "chinese": "丢脸",
    "patternType": "-ante/-ant",
    "similarityScore": 81,
    "difficulty": "easy",
    "rank": 9192
  },
  {
    "italian": "elezione",
    "english": "selection",
    "chinese": "选择",
    "patternType": "-zione/-tion",
    "similarityScore": 81,
    "difficulty": "easy",
    "rank": 9950
  },
  {
    "italian": "azione",
    "english": "action",
    "chinese": "动作",
    "patternType": "-zione/-tion",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 1709
  },
  {
    "italian": "atto",
    "english": "act",
    "chinese": "行为",
    "patternType": "-atto/-at",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 2155
  },
  {
    "italian": "specialmente",
    "english": "especially",
    "chinese": "特别是",
    "patternType": "-mente/-ly",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 2451
  },
  {
    "italian": "punizione",
    "english": "punishment",
    "chinese": "惩罚",
    "patternType": "-zione/-tion",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 3059
  },
  {
    "italian": "fico",
    "english": "fig",
    "chinese": "无花果",
    "patternType": "-ico/-ic",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 3066
  },
  {
    "italian": "accetto",
    "english": "i accept",
    "chinese": "我答应",
    "patternType": "-etto/-et",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 3436
  },
  {
    "italian": "comico",
    "english": "comedian",
    "chinese": "喜剧演员",
    "patternType": "-ico/-ic",
    "similarityScore": 80,
    "difficulty": "easy",
    "rank": 8533
  },
  {
    "italian": "appartamento",
    "english": "apartment",
    "chinese": "公寓",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 1024
  },
  {
    "italian": "colonnello",
    "english": "colonel",
    "chinese": "上校",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 1564
  },
  {
    "italian": "immaginare",
    "english": "imagine",
    "chinese": "设想",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 1801
  },
  {
    "italian": "principessa",
    "english": "princess",
    "chinese": "公主",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 1825
  },
  {
    "italian": "governatore",
    "english": "governor",
    "chinese": "总督",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 2589
  },
  {
    "italian": "organizzare",
    "english": "organize",
    "chinese": "组织",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 3063
  },
  {
    "italian": "infarto",
    "english": "infarction",
    "chinese": "梗死术",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 3974
  },
  {
    "italian": "istituto",
    "english": "institution",
    "chinese": "机构",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 4130
  },
  {
    "italian": "considerare",
    "english": "consider",
    "chinese": "考虑",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 4440
  },
  {
    "italian": "confessare",
    "english": "confess",
    "chinese": "承认吧",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 5115
  },
  {
    "italian": "pervertito",
    "english": "pervert",
    "chinese": "变态",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 5509
  },
  {
    "italian": "realizzare",
    "english": "realize",
    "chinese": "实现",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 5548
  },
  {
    "italian": "disturbare",
    "english": "disturb",
    "chinese": "扰动",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 6626
  },
  {
    "italian": "litigio",
    "english": "litigation",
    "chinese": "诉讼",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 8099
  },
  {
    "italian": "interpretare",
    "english": "interpret",
    "chinese": "解释",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 9121
  },
  {
    "italian": "arbitro",
    "english": "arbitrator",
    "chinese": "仲裁员",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 9604
  },
  {
    "italian": "commerciale",
    "english": "commercial trade",
    "chinese": "商业贸易",
    "patternType": "-ale/-al",
    "similarityScore": 74,
    "difficulty": "medium",
    "rank": 3588
  },
  {
    "italian": "personalmente",
    "english": "personally",
    "chinese": "亲自；就个人而言",
    "patternType": "-mente/-ly",
    "similarityScore": 72,
    "difficulty": "medium",
    "rank": 2727
  },
  {
    "italian": "approvazione",
    "english": "approval",
    "chinese": "核准",
    "patternType": "-zione/-tion",
    "similarityScore": 72,
    "difficulty": "medium",
    "rank": 6161
  },
  {
    "italian": "allergico",
    "english": "allergic person",
    "chinese": "过敏者",
    "patternType": "-ico/-ic",
    "similarityScore": 72,
    "difficulty": "medium",
    "rank": 9311
  },
  {
    "italian": "centrale",
    "english": "central",
    "chinese": "中心的，中央的",
    "patternType": "-ale/-al",
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 1708
  },
  {
    "italian": "criminale",
    "english": "criminal",
    "chinese": "罪犯；犯罪的",
    "patternType": "-ale/-al",
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 2208
  },
  {
    "italian": "ideale",
    "english": "ideal",
    "chinese": "理想的；理想",
    "patternType": "-ale/-al",
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 4247
  },
  {
    "italian": "normalmente",
    "english": "normally",
    "chinese": "通常，一般",
    "patternType": "-mente/-ly",
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 4388
  },
  {
    "italian": "musicale",
    "english": "musical music",
    "chinese": "音乐",
    "patternType": "-ale/-al",
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 6103
  },
  {
    "italian": "automatico",
    "english": "automatic",
    "chinese": "自动的",
    "patternType": "-ico/-ic",
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 8426
  },
  {
    "italian": "nazista",
    "english": "nazi",
    "chinese": "纳粹",
    "patternType": "-ista/-ist",
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 8721
  },
  {
    "italian": "industriale",
    "english": "industrial industry",
    "chinese": "工业",
    "patternType": "-ale/-al",
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 8740
  },
  {
    "italian": "scientifico",
    "english": "scientific research",
    "chinese": "科学研究",
    "patternType": "-ico/-ic",
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 8844
  },
  {
    "italian": "finalmente",
    "english": "finally",
    "chinese": "终于",
    "patternType": "-mente/-ly",
    "similarityScore": 70,
    "difficulty": "medium",
    "rank": 773
  },
  {
    "italian": "totalmente",
    "english": "totally",
    "chinese": "完全地；彻底地",
    "patternType": "-mente/-ly",
    "similarityScore": 70,
    "difficulty": "medium",
    "rank": 2755
  },
  {
    "italian": "politico",
    "english": "political policy",
    "chinese": "政治政策",
    "patternType": "-ico/-ic",
    "similarityScore": 70,
    "difficulty": "medium",
    "rank": 4303
  },
  {
    "italian": "economico",
    "english": "economic",
    "chinese": "经济的；便宜的",
    "patternType": "-ico/-ic",
    "similarityScore": 88,
    "difficulty": "easy",
    "rank": 6463
  },
  {
    "italian": "legalmente",
    "english": "legally",
    "chinese": "合法地",
    "patternType": "-mente/-ly",
    "similarityScore": 70,
    "difficulty": "medium",
    "rank": 6969
  },
  {
    "italian": "facciale",
    "english": "facial",
    "chinese": "面部的",
    "patternType": "-ale/-al",
    "similarityScore": 75,
    "difficulty": "medium",
    "rank": 9307
  },
  {
    "italian": "dimostrazione",
    "english": "demonstration",
    "chinese": "演示",
    "patternType": null,
    "similarityScore": 64,
    "difficulty": "medium",
    "rank": 6912
  },
  {
    "italian": "non",
    "english": "not",
    "chinese": "不；没有",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2
  },
  {
    "italian": "telefono",
    "english": "telephone",
    "chinese": "电话",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 497
  },
  {
    "italian": "genere",
    "english": "gender",
    "chinese": "性别；类型",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 518
  },
  {
    "italian": "messaggio",
    "english": "message",
    "chinese": "消息",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 712
  },
  {
    "italian": "finire",
    "english": "finish",
    "chinese": "结束",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 804
  },
  {
    "italian": "potere",
    "english": "power",
    "chinese": "权力；能够",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 825
  },
  {
    "italian": "appuntamento",
    "english": "appointment",
    "chinese": "约会；预约",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 837
  },
  {
    "italian": "compagnia",
    "english": "company",
    "chinese": "公司；陪伴",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 957
  },
  {
    "italian": "studio",
    "english": "study",
    "chinese": "学习；书房",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 978
  },
  {
    "italian": "interessante",
    "english": "interesting",
    "chinese": "有意思的",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1000
  },
  {
    "italian": "corso",
    "english": "course",
    "chinese": "课程",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1089
  },
  {
    "italian": "codice",
    "english": "code",
    "chinese": "代码",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1252
  },
  {
    "italian": "passaggio",
    "english": "passage",
    "chinese": "段落",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1437
  },
  {
    "italian": "Londra",
    "english": "london",
    "chinese": "伦敦",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1537
  },
  {
    "italian": "uso",
    "english": "use",
    "chinese": "使用；用途",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1600
  },
  {
    "italian": "Parigi",
    "english": "paris",
    "chinese": "巴黎",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1612
  },
  {
    "italian": "obiettivo",
    "english": "objective",
    "chinese": "目标",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1635
  },
  {
    "italian": "angolo",
    "english": "angle",
    "chinese": "角度",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1747
  },
  {
    "italian": "convinto",
    "english": "convinced",
    "chinese": "确信",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1804
  },
  {
    "italian": "succedere",
    "english": "succeed",
    "chinese": "发生；继任",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1858
  },
  {
    "italian": "villaggio",
    "english": "village",
    "chinese": "村庄",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1885
  },
  {
    "italian": "ispettore",
    "english": "inspector",
    "chinese": "督察；检查员",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1892
  },
  {
    "italian": "genio",
    "english": "genius",
    "chinese": "天才",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1944
  },
  {
    "italian": "Cancro",
    "english": "cancer",
    "chinese": "癌症",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 1968
  },
  {
    "italian": "arrestato",
    "english": "arrested",
    "chinese": "被捕的",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2018
  },
  {
    "italian": "collega",
    "english": "colleague",
    "chinese": "同事",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2068
  },
  {
    "italian": "membro",
    "english": "member",
    "chinese": "成员",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2248
  },
  {
    "italian": "aeroporto",
    "english": "airport",
    "chinese": "机场",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2276
  },
  {
    "italian": "preparare",
    "english": "prepare",
    "chinese": "准备",
    "patternType": null,
    "similarityScore": 77,
    "difficulty": "medium",
    "rank": 2290
  },
  {
    "italian": "abbandonato",
    "english": "abandoned",
    "chinese": "废弃",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2400
  },
  {
    "italian": "famoso",
    "english": "famous",
    "chinese": "著名的",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2433
  },
  {
    "italian": "debito",
    "english": "debt",
    "chinese": "债务",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2501
  },
  {
    "italian": "organizzato",
    "english": "organized",
    "chinese": "组织",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2632
  },
  {
    "italian": "babbo",
    "english": "dad, father",
    "chinese": "爸爸（托斯卡纳一带常用）",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2757,
    "falseFriend": true,
    "falseFriendOf": "babble",
    "falseFriendChinese": "咿呀乱语",
    "italianFor": "balbettare",
    "warning": "≠ babble（咿呀乱语）= balbettare"
  },
  {
    "italian": "giornalista",
    "english": "journalist",
    "chinese": "记者",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2851
  },
  {
    "italian": "esca",
    "english": "bait, lure",
    "chinese": "鱼饵，诱饵",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 2885
  },
  {
    "italian": "titolo",
    "english": "title",
    "chinese": "标题",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2915
  },
  {
    "italian": "inventato",
    "english": "invented",
    "chinese": "发明",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2991
  },
  {
    "italian": "frase",
    "english": "phrase",
    "chinese": "语句",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3159
  },
  {
    "italian": "esplodere",
    "english": "explode",
    "chinese": "爆炸",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3162
  },
  {
    "italian": "attore",
    "english": "actor",
    "chinese": "演员",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3168
  },
  {
    "italian": "cerimonia",
    "english": "ceremony",
    "chinese": "仪式",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3217
  },
  {
    "italian": "marcia",
    "english": "march",
    "chinese": "游行",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3409
  },
  {
    "italian": "trasferito",
    "english": "transferred",
    "chinese": "转让",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3440
  },
  {
    "italian": "eroina",
    "english": "heroin",
    "chinese": "海洛因",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3456
  },
  {
    "italian": "delizioso",
    "english": "delicious",
    "chinese": "好吃",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3526
  },
  {
    "italian": "esistenza",
    "english": "existence",
    "chinese": "存在",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3590
  },
  {
    "italian": "museo",
    "english": "museum",
    "chinese": "博物馆",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3609
  },
  {
    "italian": "Mosca",
    "english": "moscow",
    "chinese": "莫斯科",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3672
  },
  {
    "italian": "combinato",
    "english": "combined",
    "chinese": "合计",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3721
  },
  {
    "italian": "Italia",
    "english": "italy",
    "chinese": "意大利",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3735
  },
  {
    "italian": "scorta",
    "english": "escort",
    "chinese": "护送",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3804
  },
  {
    "italian": "versi",
    "english": "verses",
    "chinese": "诗句，诗行",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3909
  },
  {
    "italian": "esagerato",
    "english": "exaggerated",
    "chinese": "夸大其词",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 3931
  },
  {
    "italian": "tempio",
    "english": "temple",
    "chinese": "庙宇",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4035
  },
  {
    "italian": "settembre",
    "english": "september",
    "chinese": "九月",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4119
  },
  {
    "italian": "informato",
    "english": "informed",
    "chinese": "知情的，了解情况的",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4133
  },
  {
    "italian": "trattamento",
    "english": "treatment",
    "chinese": "治疗",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4177
  },
  {
    "italian": "frigo",
    "english": "fridge",
    "chinese": "冰箱",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4220
  },
  {
    "italian": "procedere",
    "english": "proceed",
    "chinese": "继续",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4321
  },
  {
    "italian": "metodo",
    "english": "method",
    "chinese": "方法",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4327
  },
  {
    "italian": "trasformato",
    "english": "transformed",
    "chinese": "已转换",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4346
  },
  {
    "italian": "Spagna",
    "english": "spain",
    "chinese": "西班牙",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4369
  },
  {
    "italian": "carattere",
    "english": "character",
    "chinese": "性格；字符",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4399
  },
  {
    "italian": "curare",
    "english": "care",
    "chinese": "护理",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4404
  },
  {
    "italian": "distruzione",
    "english": "destruction",
    "chinese": "销毁",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4528
  },
  {
    "italian": "complesso",
    "english": "complex",
    "chinese": "复杂",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4578
  },
  {
    "italian": "ambasciatore",
    "english": "ambassador",
    "chinese": "大使",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4592
  },
  {
    "italian": "trono",
    "english": "throne",
    "chinese": "宝座",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4635
  },
  {
    "italian": "tecnico",
    "english": "technical",
    "chinese": "技术",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 4841
  },
  {
    "italian": "accademia",
    "english": "academy",
    "chinese": "学院",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5024
  },
  {
    "italian": "pagamento",
    "english": "payment",
    "chinese": "付款",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5062
  },
  {
    "italian": "circo",
    "english": "circus",
    "chinese": "马戏团",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5244
  },
  {
    "italian": "interrotto",
    "english": "interrupted",
    "chinese": "中断",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5322
  },
  {
    "italian": "supermercato",
    "english": "supermarket",
    "chinese": "超市",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5439
  },
  {
    "italian": "pianta",
    "english": "plant",
    "chinese": "工厂",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5525
  },
  {
    "italian": "apparire",
    "english": "appear",
    "chinese": "出现，显得",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5535
  },
  {
    "italian": "prospettiva",
    "english": "perspective",
    "chinese": "视角",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5626
  },
  {
    "italian": "Cesare",
    "english": "caesar",
    "chinese": "凯撒",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5657
  },
  {
    "italian": "trasformare",
    "english": "transform",
    "chinese": "转换",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5678
  },
  {
    "italian": "massaggio",
    "english": "massage",
    "chinese": "按摩",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5729
  },
  {
    "italian": "psichiatra",
    "english": "psychiatrist",
    "chinese": "心理医生",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5866
  },
  {
    "italian": "rappresentante",
    "english": "representative",
    "chinese": "代表",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 5932
  },
  {
    "italian": "messe",
    "english": "masses",
    "chinese": "弥撒（复数）；收成",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6021
  },
  {
    "italian": "osservare",
    "english": "observe",
    "chinese": "观察",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6092
  },
  {
    "italian": "votare",
    "english": "vote",
    "chinese": "表决",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6115
  },
  {
    "italian": "assistito",
    "english": "assistant",
    "chinese": "助理",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6386
  },
  {
    "italian": "gabinetto",
    "english": "cabinet",
    "chinese": "内阁",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6508
  },
  {
    "italian": "costruzione",
    "english": "construction",
    "chinese": "建筑业",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6540
  },
  {
    "italian": "tesi",
    "english": "thesis",
    "chinese": "论文",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6578
  },
  {
    "italian": "trasportare",
    "english": "transport",
    "chinese": "运输，搬运",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6711
  },
  {
    "italian": "garantire",
    "english": "guarantee",
    "chinese": "保证",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6789
  },
  {
    "italian": "apprezzato",
    "english": "appreciated",
    "chinese": "感谢",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6790
  },
  {
    "italian": "approccio",
    "english": "approach",
    "chinese": "办法",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 6955
  },
  {
    "italian": "disordine",
    "english": "disorder",
    "chinese": "障碍",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 7065
  },
  {
    "italian": "accompagnato",
    "english": "accompanied",
    "chinese": "附带",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 7298
  },
  {
    "italian": "insistere",
    "english": "insist on",
    "chinese": "坚持",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 7361
  },
  {
    "italian": "tenero",
    "english": "tender",
    "chinese": "柔软的；温柔的",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 7668
  },
  {
    "italian": "critica",
    "english": "criticism",
    "chinese": "批评",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 7725
  },
  {
    "italian": "ironia",
    "english": "irony",
    "chinese": "讽刺",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 7788
  },
  {
    "italian": "parata",
    "english": "parade",
    "chinese": "游行",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 7989
  },
  {
    "italian": "pepe",
    "english": "pepper",
    "chinese": "胡椒酱",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8229
  },
  {
    "italian": "psichiatrico",
    "english": "psychiatry",
    "chinese": "精神病学",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8259
  },
  {
    "italian": "ipocrita",
    "english": "hypocrite",
    "chinese": "伪君子",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8326
  },
  {
    "italian": "beneficio",
    "english": "benefit",
    "chinese": "福利",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8455
  },
  {
    "italian": "bacino",
    "english": "basin",
    "chinese": "盆地；水池",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8520
  },
  {
    "italian": "esplorare",
    "english": "explore",
    "chinese": "探索",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8560
  },
  {
    "italian": "materasso",
    "english": "mattress",
    "chinese": "床垫",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8656
  },
  {
    "italian": "atrio",
    "english": "atrium",
    "chinese": "门厅，前厅；（解剖）心房",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8758
  },
  {
    "italian": "anonimo",
    "english": "anonymous",
    "chinese": "匿名组织",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8823
  },
  {
    "italian": "etica",
    "english": "ethics",
    "chinese": "道德操守",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8873
  },
  {
    "italian": "cancelliere",
    "english": "chancellor",
    "chinese": "总理",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 8963
  },
  {
    "italian": "idraulico",
    "english": "hydraulic",
    "chinese": "液压",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 9161
  },
  {
    "italian": "escludere",
    "english": "exclude",
    "chinese": "排除",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 9255
  },
  {
    "italian": "trasformata",
    "english": "transformed",
    "chinese": "转换",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 9294
  },
  {
    "italian": "pratico",
    "english": "practical",
    "chinese": "实用",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 9478
  },
  {
    "italian": "patata",
    "english": "potato",
    "chinese": "马铃薯",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 9563
  },
  {
    "italian": "sigaro",
    "english": "cigar",
    "chinese": "雪茄",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 9602
  },
  {
    "italian": "utero",
    "english": "uterus",
    "chinese": "子宫",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 9772
  },
  {
    "italian": "stalla",
    "english": "stable",
    "chinese": "牲口棚；马厩",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 9854
  },
  {
    "italian": "tre",
    "english": "three",
    "chinese": "三",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 235
  },
  {
    "italian": "stare",
    "english": "stay",
    "chinese": "留下来",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 272
  },
  {
    "italian": "famiglia",
    "english": "family",
    "chinese": "家庭",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 278
  },
  {
    "italian": "capitano",
    "english": "captain",
    "chinese": "上尉；船长；队长",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 572
  },
  {
    "italian": "città",
    "english": "city",
    "chinese": "城市",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 639
  },
  {
    "italian": "arrivato",
    "english": "arrived",
    "chinese": "抵达",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 665
  },
  {
    "italian": "prigione",
    "english": "prison",
    "chinese": "监狱",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 700
  },
  {
    "italian": "lungo",
    "english": "long",
    "chinese": "长",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 707
  },
  {
    "italian": "usare",
    "english": "use",
    "chinese": "使用",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 716
  },
  {
    "italian": "semplice",
    "english": "simple",
    "chinese": "简单",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 788
  },
  {
    "italian": "rispetto",
    "english": "respect",
    "chinese": "尊重",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 904
  },
  {
    "italian": "rapporto",
    "english": "report",
    "chinese": "报告；关系",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 911
  },
  {
    "italian": "sorpresa",
    "english": "surprise",
    "chinese": "惊讶",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 916
  },
  {
    "italian": "servizio",
    "english": "service",
    "chinese": "服务",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 920
  },
  {
    "italian": "silenzio",
    "english": "silence",
    "chinese": "安静",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1066
  },
  {
    "italian": "droga",
    "english": "drugs",
    "chinese": "毒品",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1160
  },
  {
    "italian": "umano",
    "english": "human",
    "chinese": "人类",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1263
  },
  {
    "italian": "nord",
    "english": "north",
    "chinese": "北；北方",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1312
  },
  {
    "italian": "segno",
    "english": "sign",
    "chinese": "记号；符号；迹象",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1346
  },
  {
    "italian": "banca",
    "english": "bank",
    "chinese": "银行",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1390
  },
  {
    "italian": "messa",
    "english": "mass",
    "chinese": "弥撒；安放，放置",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1401
  },
  {
    "italian": "progetto",
    "english": "project",
    "chinese": "项目",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1439
  },
  {
    "italian": "lingua",
    "english": "language",
    "chinese": "语言",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1519
  },
  {
    "italian": "palla",
    "english": "ball",
    "chinese": "球",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1565
  },
  {
    "italian": "corte",
    "english": "court",
    "chinese": "法庭；宫廷",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1630
  },
  {
    "italian": "conta",
    "english": "count",
    "chinese": "计数",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1640
  },
  {
    "italian": "Maria",
    "english": "mary",
    "chinese": "玛丽",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1676
  },
  {
    "italian": "parco",
    "english": "park",
    "chinese": "公园",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1897
  },
  {
    "italian": "politica",
    "english": "policy",
    "chinese": "政策",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 1955
  },
  {
    "italian": "rotta",
    "english": "route",
    "chinese": "航线；航向",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2003
  },
  {
    "italian": "giardino",
    "english": "garden",
    "chinese": "花园",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2050
  },
  {
    "italian": "vittoria",
    "english": "victory",
    "chinese": "胜利",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2069
  },
  {
    "italian": "invitato",
    "english": "invited",
    "chinese": "被邀请的；宾客",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2119
  },
  {
    "italian": "ruolo",
    "english": "role",
    "chinese": "角色",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2125
  },
  {
    "italian": "promessa",
    "english": "promise",
    "chinese": "承诺",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2390
  },
  {
    "italian": "montagna",
    "english": "mountain",
    "chinese": "山；山脉",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2517
  },
  {
    "italian": "copia",
    "english": "copy",
    "chinese": "复制",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2571
  },
  {
    "italian": "sorveglianza",
    "english": "surveillance",
    "chinese": "监视",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2573
  },
  {
    "italian": "dichiarazione",
    "english": "declaration",
    "chinese": "声明",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2574
  },
  {
    "italian": "pazienza",
    "english": "patience",
    "chinese": "耐心",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2631
  },
  {
    "italian": "fase",
    "english": "phase",
    "chinese": "阶段",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2685
  },
  {
    "italian": "ovest",
    "english": "west",
    "chinese": "西部",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2722
  },
  {
    "italian": "esterno",
    "english": "exterior",
    "chinese": "外部",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2790
  },
  {
    "italian": "mappa",
    "english": "map",
    "chinese": "地图",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 2895
  },
  {
    "italian": "accusato",
    "english": "accused",
    "chinese": "被告",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3044
  },
  {
    "italian": "salvo",
    "english": "safe",
    "chinese": "安全的；平安的",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 3139
  },
  {
    "italian": "istinto",
    "english": "instinct",
    "chinese": "直觉",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3246
  },
  {
    "italian": "prodotto",
    "english": "product",
    "chinese": "产品",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3283
  },
  {
    "italian": "Marco",
    "english": "mark (name)",
    "chinese": "马可（名字）",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3427
  },
  {
    "italian": "studiato",
    "english": "studied",
    "chinese": "学习",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3475
  },
  {
    "italian": "cassa",
    "english": "cash",
    "chinese": "现金",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3626
  },
  {
    "italian": "giapponese",
    "english": "japanese",
    "chinese": "日语",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3741
  },
  {
    "italian": "conte",
    "english": "count",
    "chinese": "计数",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3823
  },
  {
    "italian": "croce",
    "english": "cross",
    "chinese": "十字架；交叉",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3856
  },
  {
    "italian": "confermato",
    "english": "confirmed",
    "chinese": "确认",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3871
  },
  {
    "italian": "tocco",
    "english": "touch",
    "chinese": "触摸",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 3911
  },
  {
    "italian": "pietà",
    "english": "pity",
    "chinese": "遗憾",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4031
  },
  {
    "italian": "tema",
    "english": "theme",
    "chinese": "主题",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4041
  },
  {
    "italian": "cortesia",
    "english": "courtesy",
    "chinese": "礼貌",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4088
  },
  {
    "italian": "linguaggio",
    "english": "language",
    "chinese": "语言",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4103
  },
  {
    "italian": "Leone",
    "english": "lion",
    "chinese": "狮子",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4230
  },
  {
    "italian": "tenda",
    "english": "tent",
    "chinese": "帐篷",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4332
  },
  {
    "italian": "speso",
    "english": "spent",
    "chinese": "支出额",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4374
  },
  {
    "italian": "cimitero",
    "english": "cemetery",
    "chinese": "墓地",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4416
  },
  {
    "italian": "monte",
    "english": "mount",
    "chinese": "山，山峰",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4428
  },
  {
    "italian": "sofferenza",
    "english": "suffering",
    "chinese": "痛苦，苦难",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4438
  },
  {
    "italian": "vomitare",
    "english": "vomiting",
    "chinese": "呕吐",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4461
  },
  {
    "italian": "emorragia",
    "english": "hemorrhage",
    "chinese": "出血",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4468
  },
  {
    "italian": "feci",
    "english": "feces",
    "chinese": "粪便",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4478
  },
  {
    "italian": "condotto",
    "english": "conduit",
    "chinese": "管道",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4597
  },
  {
    "italian": "prezioso",
    "english": "precious",
    "chinese": "珍贵",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4601
  },
  {
    "italian": "lama",
    "english": "blame",
    "chinese": "责怪",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 4810
  },
  {
    "italian": "recitare",
    "english": "reciting",
    "chinese": "朗诵",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5020
  },
  {
    "italian": "recupero",
    "english": "recovery",
    "chinese": "恢复",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5109
  },
  {
    "italian": "Marte",
    "english": "mars",
    "chinese": "火星",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5145
  },
  {
    "italian": "preda",
    "english": "prey",
    "chinese": "猎物",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5271
  },
  {
    "italian": "incluso",
    "english": "included",
    "chinese": "包含",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5419
  },
  {
    "italian": "attirare",
    "english": "attract",
    "chinese": "吸引",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5445
  },
  {
    "italian": "eccezione",
    "english": "exceptions",
    "chinese": "例外",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5460
  },
  {
    "italian": "corrotto",
    "english": "corrupt",
    "chinese": "腐败",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5527
  },
  {
    "italian": "condotta",
    "english": "conduct",
    "chinese": "行为；管道",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5651
  },
  {
    "italian": "vomito",
    "english": "vomiting",
    "chinese": "呕吐",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5764
  },
  {
    "italian": "condoglianze",
    "english": "condolences",
    "chinese": "慰问",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5806
  },
  {
    "italian": "marzo",
    "english": "march",
    "chinese": "三月",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 5970
  },
  {
    "italian": "gemma",
    "english": "gem",
    "chinese": "宝石",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6027
  },
  {
    "italian": "concludere",
    "english": "conclusion",
    "chinese": "结论",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6036
  },
  {
    "italian": "durata",
    "english": "duration",
    "chinese": "会期",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6068
  },
  {
    "italian": "dicembre",
    "english": "december",
    "chinese": "十二月",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6074
  },
  {
    "italian": "infermeria",
    "english": "infirmary",
    "chinese": "医务室",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6206
  },
  {
    "italian": "invitare",
    "english": "inviting",
    "chinese": "邀请",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6215
  },
  {
    "italian": "Paolo",
    "english": "paul",
    "chinese": "保罗",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6290
  },
  {
    "italian": "ignorare",
    "english": "ignoring",
    "chinese": "忽略",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6321
  },
  {
    "italian": "condurre",
    "english": "conduct",
    "chinese": "行为",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6329
  },
  {
    "italian": "volontario",
    "english": "volunteering",
    "chinese": "志愿工作",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6341
  },
  {
    "italian": "caporale",
    "english": "corporal",
    "chinese": "下士",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6369
  },
  {
    "italian": "alleanza",
    "english": "alliance",
    "chinese": "联盟",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6492
  },
  {
    "italian": "testo",
    "english": "text",
    "chinese": "文本",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6504
  },
  {
    "italian": "biscotto",
    "english": "biscuit",
    "chinese": "饼干",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6560
  },
  {
    "italian": "trasferire",
    "english": "transfer",
    "chinese": "转让",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6816
  },
  {
    "italian": "estratto",
    "english": "extract",
    "chinese": "提取",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 6881
  },
  {
    "italian": "elefante",
    "english": "elephant",
    "chinese": "大象",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7025
  },
  {
    "italian": "inserito",
    "english": "inserted",
    "chinese": "插入的",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7099
  },
  {
    "italian": "teso",
    "english": "tense",
    "chinese": "时态",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7102
  },
  {
    "italian": "inserire",
    "english": "insert",
    "chinese": "插入",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7267
  },
  {
    "italian": "ostacolo",
    "english": "obstacle",
    "chinese": "障碍",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7354
  },
  {
    "italian": "composto",
    "english": "compound",
    "chinese": "化合物",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7586
  },
  {
    "italian": "morfina",
    "english": "morphine",
    "chinese": "吗啡",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7744
  },
  {
    "italian": "terrificante",
    "english": "terrifying",
    "chinese": "吓人",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7878
  },
  {
    "italian": "furia",
    "english": "fury",
    "chinese": "愤怒",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7955
  },
  {
    "italian": "valutare",
    "english": "evaluate",
    "chinese": "评估",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 7983
  },
  {
    "italian": "libreria",
    "english": "bookshop, bookcase",
    "chinese": "书店；书架",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8138,
    "falseFriend": true,
    "falseFriendOf": "library",
    "falseFriendChinese": "图书馆",
    "italianFor": "biblioteca",
    "warning": "≠ library（图书馆）= biblioteca"
  },
  {
    "italian": "perla",
    "english": "pearl",
    "chinese": "珍珠",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8143
  },
  {
    "italian": "farsa",
    "english": "farce",
    "chinese": "闹剧",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8158
  },
  {
    "italian": "chilometro",
    "english": "kilometer",
    "chinese": "公里长",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8314
  },
  {
    "italian": "setta",
    "english": "set",
    "chinese": "设定",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8366
  },
  {
    "italian": "tosto",
    "english": "toast",
    "chinese": "祝酒词",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8384
  },
  {
    "italian": "psicologia",
    "english": "psychology",
    "chinese": "心理学",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8428
  },
  {
    "italian": "evacuare",
    "english": "evacuate",
    "chinese": "撤离",
    "patternType": null,
    "similarityScore": 87,
    "difficulty": "easy",
    "rank": 8484
  },
  {
    "italian": "garantito",
    "english": "guaranteed",
    "chinese": "保证",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8672
  },
  {
    "italian": "ispezione",
    "english": "inspection",
    "chinese": "检查",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8716
  },
  {
    "italian": "fontana",
    "english": "fountain",
    "chinese": "喷泉",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8810
  },
  {
    "italian": "chimico",
    "english": "chemical",
    "chinese": "化学",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 8940
  },
  {
    "italian": "metafora",
    "english": "metaphor",
    "chinese": "隐喻",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9068
  },
  {
    "italian": "estrazione",
    "english": "extraction",
    "chinese": "提取",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9109
  },
  {
    "italian": "spionaggio",
    "english": "espionage",
    "chinese": "间谍",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9115
  },
  {
    "italian": "corno",
    "english": "horn",
    "chinese": "喇叭",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9139
  },
  {
    "italian": "informare",
    "english": "inform you",
    "chinese": "告诉你",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9366
  },
  {
    "italian": "legittimo",
    "english": "legitimate",
    "chinese": "合法",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9554
  },
  {
    "italian": "tentazione",
    "english": "temptation",
    "chinese": "诱惑",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9567
  },
  {
    "italian": "giurisdizione",
    "english": "jurisdiction",
    "chinese": "管辖权",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9694
  },
  {
    "italian": "Giura",
    "english": "swears",
    "chinese": "发誓",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 9785
  },
  {
    "italian": "grana",
    "english": "grain",
    "chinese": "谷物",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9794
  },
  {
    "italian": "arrendersi",
    "english": "surrender",
    "chinese": "投降",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9852
  },
  {
    "italian": "guardaroba",
    "english": "wardrobe",
    "chinese": "衣橱",
    "patternType": null,
    "similarityScore": 62,
    "difficulty": "medium",
    "rank": 9980
  },
  {
    "italian": "polizia",
    "english": "police",
    "chinese": "警察",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 325
  },
  {
    "italian": "deciso",
    "english": "decided",
    "chinese": "果断的；已决定的",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 710
  },
  {
    "italian": "livello",
    "english": "level",
    "chinese": "水平；级别",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1200
  },
  {
    "italian": "inglese",
    "english": "english",
    "chinese": "英语；英国的",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1243
  },
  {
    "italian": "mostro",
    "english": "monster",
    "chinese": "怪兽",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1284
  },
  {
    "italian": "maestro",
    "english": "master",
    "chinese": "大师；老师",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1377
  },
  {
    "italian": "ritorno",
    "english": "return",
    "chinese": "返回；归来",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1431
  },
  {
    "italian": "soldato",
    "english": "soldier",
    "chinese": "士兵",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1592
  },
  {
    "italian": "entrata",
    "english": "entry",
    "chinese": "入口；进入",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1674
  },
  {
    "italian": "procuratore",
    "english": "prosecutor",
    "chinese": "检察官",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1701
  },
  {
    "italian": "palazzo",
    "english": "palace",
    "chinese": "宫殿；大楼",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 1898
  },
  {
    "italian": "partito",
    "english": "party",
    "chinese": "政党",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2044
  },
  {
    "italian": "assurdo",
    "english": "absurd",
    "chinese": "荒谬的",
    "patternType": null,
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 2070
  },
  {
    "italian": "discutere",
    "english": "discuss",
    "chinese": "讨论",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2157
  },
  {
    "italian": "terapia",
    "english": "therapy",
    "chinese": "治疗",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2281
  },
  {
    "italian": "traccia",
    "english": "track",
    "chinese": "痕迹；踪迹；音轨",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2309
  },
  {
    "italian": "polvere",
    "english": "powder",
    "chinese": "粉末",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2317
  },
  {
    "italian": "agenzia",
    "english": "agency",
    "chinese": "机构",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2540
  },
  {
    "italian": "attaccato",
    "english": "attached",
    "chinese": "附着的，粘住的；被攻击的",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2648
  },
  {
    "italian": "commissione",
    "english": "committee",
    "chinese": "委员会",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2730
  },
  {
    "italian": "sfortunatamente",
    "english": "unfortunately",
    "chinese": "很遗憾",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2970
  },
  {
    "italian": "rifugio",
    "english": "refuge",
    "chinese": "庇护",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2980
  },
  {
    "italian": "profumo",
    "english": "perfume",
    "chinese": "发光",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 2986
  },
  {
    "italian": "soffrire",
    "english": "suffer",
    "chinese": "受苦，遭受；患（病）",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3112
  },
  {
    "italian": "proprietà",
    "english": "property",
    "chinese": "属性",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3133
  },
  {
    "italian": "convincere",
    "english": "to convince",
    "chinese": "要说服",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3185
  },
  {
    "italian": "russo",
    "english": "russian",
    "chinese": "俄语；俄罗斯的",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3188
  },
  {
    "italian": "crudele",
    "english": "cruelty",
    "chinese": "残酷",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3296
  },
  {
    "italian": "tappeto",
    "english": "carpet",
    "chinese": "地毯",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3578
  },
  {
    "italian": "eccitante",
    "english": "exciting",
    "chinese": "令人兴奋",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3579
  },
  {
    "italian": "offrire",
    "english": "offer",
    "chinese": "提议",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3655
  },
  {
    "italian": "gesto",
    "english": "gesture",
    "chinese": "手势",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3690
  },
  {
    "italian": "fatica",
    "english": "fatigue",
    "chinese": "疲劳",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 3924
  },
  {
    "italian": "comitato",
    "english": "committee",
    "chinese": "委员会",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4090
  },
  {
    "italian": "obiezione",
    "english": "objection",
    "chinese": "反对",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4097
  },
  {
    "italian": "coperto",
    "english": "covered",
    "chinese": "覆盖",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4193
  },
  {
    "italian": "continuamente",
    "english": "continuously",
    "chinese": "不断地",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4251
  },
  {
    "italian": "filmato",
    "english": "filmed",
    "chinese": "拍摄",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4268
  },
  {
    "italian": "fotografia",
    "english": "photography",
    "chinese": "摄影",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4274
  },
  {
    "italian": "misura",
    "english": "measure",
    "chinese": "计量",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4344
  },
  {
    "italian": "campeggio",
    "english": "camping",
    "chinese": "露营",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4421
  },
  {
    "italian": "guidato",
    "english": "guided",
    "chinese": "指导",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4754
  },
  {
    "italian": "dozzina",
    "english": "dozens",
    "chinese": "几十个",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4804
  },
  {
    "italian": "tipico",
    "english": "typical",
    "chinese": "典型的，独特的",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4809
  },
  {
    "italian": "servo",
    "english": "servant",
    "chinese": "佣人",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4936
  },
  {
    "italian": "assenza",
    "english": "absence",
    "chinese": "缺席",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 4983
  },
  {
    "italian": "esercizio",
    "english": "exercise",
    "chinese": "练习",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5119
  },
  {
    "italian": "riservato",
    "english": "reserved",
    "chinese": "保留",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5173
  },
  {
    "italian": "passera",
    "english": "passage",
    "chinese": "通过",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5181
  },
  {
    "italian": "ottobre",
    "english": "october",
    "chinese": "十月",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5205
  },
  {
    "italian": "autorizzato",
    "english": "authorized",
    "chinese": "核定数",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5213
  },
  {
    "italian": "occuparsi",
    "english": "occupying",
    "chinese": "占用",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5336
  },
  {
    "italian": "sostanza",
    "english": "substance",
    "chinese": "实质",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5345
  },
  {
    "italian": "psicopatico",
    "english": "psychopath",
    "chinese": "精神病患者",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5370
  },
  {
    "italian": "giungla",
    "english": "jungle",
    "chinese": "丛林",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5578
  },
  {
    "italian": "esaminare",
    "english": "examination",
    "chinese": "考试",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 5754
  },
  {
    "italian": "riferimento",
    "english": "reference",
    "chinese": "参考文献",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6205
  },
  {
    "italian": "impulso",
    "english": "pulse",
    "chinese": "脉冲",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6230
  },
  {
    "italian": "colonna",
    "english": "column",
    "chinese": "柱子；专栏",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6361
  },
  {
    "italian": "Colonia",
    "english": "cologne",
    "chinese": "科隆（德国城市）",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6489
  },
  {
    "italian": "pallone",
    "english": "balloon",
    "chinese": "气球",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6602
  },
  {
    "italian": "prepararsi",
    "english": "prepare for",
    "chinese": "做准备",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6806
  },
  {
    "italian": "ridurre",
    "english": "reduce",
    "chinese": "减少",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6809
  },
  {
    "italian": "inevitabile",
    "english": "unavoidable",
    "chinese": "不可避免的",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6811
  },
  {
    "italian": "efficace",
    "english": "effective",
    "chinese": "有效",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6814
  },
  {
    "italian": "ribelle",
    "english": "rebel",
    "chinese": "叛乱",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 6921
  },
  {
    "italian": "dominio",
    "english": "domain",
    "chinese": "域名",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 7174
  },
  {
    "italian": "operare",
    "english": "operation",
    "chinese": "操作",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 7317
  },
  {
    "italian": "riservata",
    "english": "reserved",
    "chinese": "保留",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 7427
  },
  {
    "italian": "emotivo",
    "english": "emotional",
    "chinese": "情感",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 7469
  },
  {
    "italian": "sottomarino",
    "english": "submarine",
    "chinese": "潜艇",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 7503
  },
  {
    "italian": "soddisfazione",
    "english": "satisfaction",
    "chinese": "满意",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 7619
  },
  {
    "italian": "esposto",
    "english": "exposed",
    "chinese": "已曝光",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 7777
  },
  {
    "italian": "tossico",
    "english": "toxic",
    "chinese": "毒性",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8205
  },
  {
    "italian": "occupare",
    "english": "occupying",
    "chinese": "占用",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8352
  },
  {
    "italian": "rimedio",
    "english": "remedy",
    "chinese": "补救",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8361
  },
  {
    "italian": "lealtà",
    "english": "loyalty",
    "chinese": "忠诚",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8399
  },
  {
    "italian": "contenitore",
    "english": "container",
    "chinese": "容器",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8795
  },
  {
    "italian": "banchetto",
    "english": "banquet",
    "chinese": "宴会",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8886
  },
  {
    "italian": "sciarpa",
    "english": "scarf",
    "chinese": "围巾",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8910
  },
  {
    "italian": "svedese",
    "english": "swedish",
    "chinese": "瑞典语",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8951
  },
  {
    "italian": "plotone",
    "english": "platoon",
    "chinese": "排长",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 8983
  },
  {
    "italian": "comandare",
    "english": "command",
    "chinese": "命令",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9088
  },
  {
    "italian": "servita",
    "english": "served",
    "chinese": "任职",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9125
  },
  {
    "italian": "diviso",
    "english": "divided",
    "chinese": "分隔",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9174
  },
  {
    "italian": "profeta",
    "english": "prophet",
    "chinese": "预告",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9298
  },
  {
    "italian": "abbandono",
    "english": "abandonment",
    "chinese": "放弃",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9392
  },
  {
    "italian": "ansioso",
    "english": "anxious",
    "chinese": "焦虑",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9415
  },
  {
    "italian": "battesimo",
    "english": "baptism",
    "chinese": "洗礼",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9422
  },
  {
    "italian": "tromba",
    "english": "trouble",
    "chinese": "麻烦",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9548
  },
  {
    "italian": "senatrice",
    "english": "senator",
    "chinese": "参议员",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9645
  },
  {
    "italian": "funebre",
    "english": "funeral",
    "chinese": "葬礼",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9708
  },
  {
    "italian": "discesa",
    "english": "descent",
    "chinese": "血统",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9744
  },
  {
    "italian": "granata",
    "english": "grenade",
    "chinese": "手榴弹",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9746
  },
  {
    "italian": "giardiniere",
    "english": "gardening",
    "chinese": "园艺",
    "patternType": null,
    "similarityScore": 61,
    "difficulty": "medium",
    "rank": 9891
  },
  {
    "italian": "mi",
    "english": "me",
    "chinese": "我；对我",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 13
  },
  {
    "italian": "io",
    "english": "i",
    "chinese": "我",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 30
  },
  {
    "italian": "detto",
    "english": "said",
    "chinese": "说",
    "patternType": "-etto/-et",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 61
  },
  {
    "italian": "tipo",
    "english": "type",
    "chinese": "类型；种类",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 225
  },
  {
    "italian": "faccia",
    "english": "face",
    "chinese": "脸",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 275
  },
  {
    "italian": "tesoro",
    "english": "treasure",
    "chinese": "财宝",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 293
  },
  {
    "italian": "mano",
    "english": "hand",
    "chinese": "手",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 356
  },
  {
    "italian": "piacere",
    "english": "pleasure",
    "chinese": "荣幸",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 382
  },
  {
    "italian": "papa",
    "english": "pope",
    "chinese": "罗马教宗",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 403
  },
  {
    "italian": "foto",
    "english": "photos",
    "chinese": "照片",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 496
  },
  {
    "italian": "vista",
    "english": "view",
    "chinese": "视野；视力",
    "patternType": "-ista/-ist",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 542
  },
  {
    "italian": "esatto",
    "english": "exact",
    "chinese": "准确",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 560
  },
  {
    "italian": "mente",
    "english": "mind",
    "chinese": "头脑",
    "patternType": "-mente/-ly",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 580
  },
  {
    "italian": "cura",
    "english": "care",
    "chinese": "护理",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 656
  },
  {
    "italian": "aria",
    "english": "air",
    "chinese": "空气",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 721
  },
  {
    "italian": "gruppo",
    "english": "group",
    "chinese": "组",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 745
  },
  {
    "italian": "cerca",
    "english": "search",
    "chinese": "搜索",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 750
  },
  {
    "italian": "chiaro",
    "english": "clear",
    "chinese": "清楚的；明亮的",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 794
  },
  {
    "italian": "ordine",
    "english": "order",
    "chinese": "顺序；命令",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 801
  },
  {
    "italian": "coraggio",
    "english": "courage",
    "chinese": "勇气",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 999
  },
  {
    "italian": "spazio",
    "english": "space",
    "chinese": "空间",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1050
  },
  {
    "italian": "ricerca",
    "english": "research",
    "chinese": "研究",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1073
  },
  {
    "italian": "stagione",
    "english": "season",
    "chinese": "季节",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1230
  },
  {
    "italian": "comandante",
    "english": "commander",
    "chinese": "指挥官",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1277
  },
  {
    "italian": "vino",
    "english": "wine",
    "chinese": "葡萄酒",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1294
  },
  {
    "italian": "caffè",
    "english": "coffee",
    "chinese": "咖啡",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1299
  },
  {
    "italian": "comune",
    "english": "common",
    "chinese": "常见",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1325
  },
  {
    "italian": "tale",
    "english": "such",
    "chinese": "这样的；某个",
    "patternType": "假朋友 faux-ami",
    "similarityScore": 100,
    "difficulty": "easy",
    "rank": 1395,
    "falseFriend": true,
    "falseFriendOf": "tale",
    "falseFriendChinese": "故事",
    "italianFor": "racconto",
    "warning": "≠ tale（故事）= racconto"
  },
  {
    "italian": "praticamente",
    "english": "practically",
    "chinese": "实际上",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1523
  },
  {
    "italian": "coppia",
    "english": "couple",
    "chinese": "夫妇",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1546
  },
  {
    "italian": "naso",
    "english": "nose",
    "chinese": "鼻子",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1558
  },
  {
    "italian": "nemico",
    "english": "enemy",
    "chinese": "敌人",
    "patternType": "-ico/-ic",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1560
  },
  {
    "italian": "isola",
    "english": "island",
    "chinese": "岛屿",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1644
  },
  {
    "italian": "francese",
    "english": "french",
    "chinese": "法语",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1738
  },
  {
    "italian": "paga",
    "english": "pay",
    "chinese": "工资",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1772
  },
  {
    "italian": "teoria",
    "english": "theory",
    "chinese": "理论",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1893
  },
  {
    "italian": "popolo",
    "english": "people",
    "chinese": "人民；民族",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1932
  },
  {
    "italian": "compagno",
    "english": "comrade",
    "chinese": "同伴；同志",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 1972
  },
  {
    "italian": "pagina",
    "english": "page",
    "chinese": "页，页面",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2048
  },
  {
    "italian": "spia",
    "english": "spy",
    "chinese": "间谍",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2144
  },
  {
    "italian": "cugino",
    "english": "cousin",
    "chinese": "堂兄弟；表兄弟",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2193
  },
  {
    "italian": "dannato",
    "english": "damned",
    "chinese": "该死的",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 2395
  },
  {
    "italian": "sospettato",
    "english": "suspected",
    "chinese": "嫌疑人；被怀疑的",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2407
  },
  {
    "italian": "lago",
    "english": "lake",
    "chinese": "湖",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2489
  },
  {
    "italian": "tavola",
    "english": "table",
    "chinese": "桌子；木板",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2565
  },
  {
    "italian": "galera",
    "english": "prison, jail",
    "chinese": "监狱，牢房",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 2693
  },
  {
    "italian": "bestia",
    "english": "beast",
    "chinese": "野兽",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2723
  },
  {
    "italian": "prete",
    "english": "priest",
    "chinese": "神父；教士",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2877
  },
  {
    "italian": "trattato",
    "english": "treaty",
    "chinese": "条约",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2904
  },
  {
    "italian": "lancio",
    "english": "launch",
    "chinese": "发射",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2914
  },
  {
    "italian": "ammettere",
    "english": "admittedly",
    "chinese": "承认",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2937
  },
  {
    "italian": "ricevere",
    "english": "receive",
    "chinese": "实收",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 2990
  },
  {
    "italian": "riso",
    "english": "rice",
    "chinese": "稻米",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3187
  },
  {
    "italian": "blocco",
    "english": "blocking",
    "chinese": "屏蔽",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3265
  },
  {
    "italian": "febbre",
    "english": "fever",
    "chinese": "发烧",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3303
  },
  {
    "italian": "olio",
    "english": "oil",
    "chinese": "石油",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3311
  },
  {
    "italian": "tecnicamente",
    "english": "technically",
    "chinese": "技术上",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3432
  },
  {
    "italian": "contea",
    "english": "county",
    "chinese": "县",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3516
  },
  {
    "italian": "coraggioso",
    "english": "courageous",
    "chinese": "勇敢的",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3528
  },
  {
    "italian": "notare",
    "english": "note",
    "chinese": "注意到，察觉",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3738
  },
  {
    "italian": "spagnolo",
    "english": "spanish",
    "chinese": "西班牙语",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3746
  },
  {
    "italian": "poesia",
    "english": "poetry",
    "chinese": "诗歌",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3850
  },
  {
    "italian": "nobile",
    "english": "nobleman",
    "chinese": "贵族",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3865
  },
  {
    "italian": "impero",
    "english": "empire",
    "chinese": "帝国",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3932
  },
  {
    "italian": "flotta",
    "english": "fleet",
    "chinese": "舰队；船队",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3961
  },
  {
    "italian": "ossigeno",
    "english": "oxygen",
    "chinese": "氧气",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 3976
  },
  {
    "italian": "armato",
    "english": "armed",
    "chinese": "武装",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 4117
  },
  {
    "italian": "gentiluomo",
    "english": "gentleman",
    "chinese": "绅士",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 4126
  },
  {
    "italian": "armata",
    "english": "armed",
    "chinese": "武装",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 4259
  },
  {
    "italian": "roccia",
    "english": "rock",
    "chinese": "岩石，岩壁",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 4364
  },
  {
    "italian": "ostaggio",
    "english": "hostage",
    "chinese": "人质",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 4432
  },
  {
    "italian": "lancia",
    "english": "launch",
    "chinese": "发射",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 4822
  },
  {
    "italian": "sede",
    "english": "seat",
    "chinese": "席位",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 4874
  },
  {
    "italian": "barista",
    "english": "bartender",
    "chinese": "酒保",
    "patternType": "-ista/-ist",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5224
  },
  {
    "italian": "chiusura",
    "english": "closure",
    "chinese": "结束",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5409
  },
  {
    "italian": "accedere",
    "english": "access",
    "chinese": "进入；访问",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5444
  },
  {
    "italian": "chiarire",
    "english": "clarify",
    "chinese": "澄清",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5703
  },
  {
    "italian": "duca",
    "english": "duke",
    "chinese": "公爵",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5706
  },
  {
    "italian": "ricevuta",
    "english": "receipt",
    "chinese": "收据",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5726
  },
  {
    "italian": "divorziato",
    "english": "divorced",
    "chinese": "离婚的",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5814
  },
  {
    "italian": "obitorio",
    "english": "obituary",
    "chinese": "讣告",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5832
  },
  {
    "italian": "carrozza",
    "english": "carriage",
    "chinese": "车厢；马车",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5843
  },
  {
    "italian": "monaco",
    "english": "monk",
    "chinese": "僧侣",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5864
  },
  {
    "italian": "agosto",
    "english": "august",
    "chinese": "八月",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 5877
  },
  {
    "italian": "rene",
    "english": "kidney",
    "chinese": "肾，肾脏",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 5931
  },
  {
    "italian": "fiamma",
    "english": "flame",
    "chinese": "火焰",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6028
  },
  {
    "italian": "bollente",
    "english": "boiling",
    "chinese": "沸腾",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6373
  },
  {
    "italian": "galassia",
    "english": "galaxy",
    "chinese": "银河系",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6462
  },
  {
    "italian": "eccitato",
    "english": "excited",
    "chinese": "兴奋",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6520
  },
  {
    "italian": "affidabile",
    "english": "reliable",
    "chinese": "可靠性",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6591
  },
  {
    "italian": "favoloso",
    "english": "fabulous",
    "chinese": "不可思议",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6621
  },
  {
    "italian": "rivelare",
    "english": "reveal",
    "chinese": "揭露，透露",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6680
  },
  {
    "italian": "postale",
    "english": "post",
    "chinese": "邮政的",
    "patternType": "-ale/-al",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6686
  },
  {
    "italian": "risorsa",
    "english": "resource",
    "chinese": "资源",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6777
  },
  {
    "italian": "palo",
    "english": "pole",
    "chinese": "杆",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6923
  },
  {
    "italian": "direttrice",
    "english": "director",
    "chinese": "女主任；女经理",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 6961
  },
  {
    "italian": "Scozia",
    "english": "scotland",
    "chinese": "苏格兰",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7101
  },
  {
    "italian": "bloccare",
    "english": "blocking",
    "chinese": "屏蔽",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7134
  },
  {
    "italian": "filosofia",
    "english": "philosophy",
    "chinese": "哲学",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7156
  },
  {
    "italian": "sobrio",
    "english": "sober",
    "chinese": "清醒的；朴素的",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7201
  },
  {
    "italian": "febbraio",
    "english": "february",
    "chinese": "二月",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7276
  },
  {
    "italian": "rifare",
    "english": "remake",
    "chinese": "重新制作",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7321
  },
  {
    "italian": "deriva",
    "english": "drift",
    "chinese": "漂移",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7358
  },
  {
    "italian": "tana",
    "english": "den, lair",
    "chinese": "巢穴，窝",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 7489
  },
  {
    "italian": "farmacia",
    "english": "pharmacy",
    "chinese": "药店",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7520
  },
  {
    "italian": "Enrico",
    "english": "henry (name)",
    "chinese": "亨利（名字）",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7549
  },
  {
    "italian": "cospirazione",
    "english": "conspiracy",
    "chinese": "阴谋",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7697
  },
  {
    "italian": "storico",
    "english": "history",
    "chinese": "历史",
    "patternType": "-ico/-ic",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7737
  },
  {
    "italian": "Pietro",
    "english": "peter",
    "chinese": "彼得",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 7978
  },
  {
    "italian": "fritto",
    "english": "fried",
    "chinese": "炸开",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8032
  },
  {
    "italian": "suggerimento",
    "english": "suggestion",
    "chinese": "建议",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8086
  },
  {
    "italian": "manutenzione",
    "english": "maintenance",
    "chinese": "维修",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8148
  },
  {
    "italian": "ispirato",
    "english": "inspired",
    "chinese": "灵感",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8200
  },
  {
    "italian": "escluso",
    "english": "excluded",
    "chinese": "不包括",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8207
  },
  {
    "italian": "rispettato",
    "english": "respected",
    "chinese": "受到尊重",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8250
  },
  {
    "italian": "trofeo",
    "english": "trophy",
    "chinese": "奖杯",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8283
  },
  {
    "italian": "Egitto",
    "english": "egypt",
    "chinese": "埃及",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8389
  },
  {
    "italian": "sfera",
    "english": "sphere",
    "chinese": "球体；领域",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8397
  },
  {
    "italian": "baia",
    "english": "bay",
    "chinese": "湾",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8475
  },
  {
    "italian": "cappella",
    "english": "chapel",
    "chinese": "礼拜堂",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8501
  },
  {
    "italian": "riflesso",
    "english": "reflection",
    "chinese": "反思",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8510
  },
  {
    "italian": "sella",
    "english": "saddle",
    "chinese": "鞍",
    "patternType": "-ella/-el",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8562
  },
  {
    "italian": "Napoli",
    "english": "naples",
    "chinese": "那不勒斯",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8828
  },
  {
    "italian": "fortezza",
    "english": "fortress",
    "chinese": "堡垒",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8892
  },
  {
    "italian": "brusio",
    "english": "bruise",
    "chinese": "瘀伤",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 8941
  },
  {
    "italian": "spacco",
    "english": "spare",
    "chinese": "备件",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9101
  },
  {
    "italian": "turco",
    "english": "turkey",
    "chinese": "土耳其",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9138
  },
  {
    "italian": "cece",
    "english": "celery",
    "chinese": "芹菜",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9182
  },
  {
    "italian": "piantato",
    "english": "planted",
    "chinese": "已种植",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9218
  },
  {
    "italian": "annunciare",
    "english": "announcement",
    "chinese": "通知",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9325
  },
  {
    "italian": "bagaglio",
    "english": "baggage",
    "chinese": "行李",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9394
  },
  {
    "italian": "rasoio",
    "english": "razor",
    "chinese": "剃须刀",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9485
  },
  {
    "italian": "Grecia",
    "english": "greece",
    "chinese": "希腊",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9556
  },
  {
    "italian": "fuso",
    "english": "fussed",
    "chinese": "乱七八糟的",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9618
  },
  {
    "italian": "barbiere",
    "english": "barbershop",
    "chinese": "理发店",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9726
  },
  {
    "italian": "montare",
    "english": "mount",
    "chinese": "安装；组装",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 9755
  },
  {
    "italian": "nodo",
    "english": "no",
    "chinese": "没有",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9771
  },
  {
    "italian": "annunciato",
    "english": "announced",
    "chinese": "已公布",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9937
  },
  {
    "italian": "Venere",
    "english": "venus",
    "chinese": "金星",
    "patternType": null,
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9938
  },
  {
    "italian": "tatto",
    "english": "touch",
    "chinese": "触摸",
    "patternType": "-atto/-at",
    "similarityScore": 60,
    "difficulty": "medium",
    "rank": 9951
  },
  {
    "italian": "immediatamente",
    "english": "immediately",
    "chinese": "马上",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 1496
  },
  {
    "italian": "ridicolo",
    "english": "ridiculous",
    "chinese": "荒谬的，可笑的",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 1729
  },
  {
    "italian": "prigioniero",
    "english": "prisoner",
    "chinese": "囚犯",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 3433
  },
  {
    "italian": "arrestare",
    "english": "arrest",
    "chinese": "逮捕",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 3697
  },
  {
    "italian": "impressionante",
    "english": "impressive",
    "chinese": "令人印象深刻",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 5141
  },
  {
    "italian": "assistere",
    "english": "assist",
    "chinese": "协助",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 5665
  },
  {
    "italian": "fortunatamente",
    "english": "fortunately",
    "chinese": "幸运的是",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 5707
  },
  {
    "italian": "investire",
    "english": "invest",
    "chinese": "投资",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 7842
  },
  {
    "italian": "delinquente",
    "english": "inquent",
    "chinese": "频率",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 8052
  },
  {
    "italian": "piattaforma",
    "english": "platform",
    "chinese": "平台",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 8054
  },
  {
    "italian": "spiritoso",
    "english": "spirit",
    "chinese": "精神",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 8267
  },
  {
    "italian": "stringere",
    "english": "string",
    "chinese": "字符串",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 8513
  },
  {
    "italian": "coinvolgimento",
    "english": "involvement",
    "chinese": "参与",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 8869
  },
  {
    "italian": "verifica",
    "english": "verification",
    "chinese": "核查",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 9189
  },
  {
    "italian": "definitivamente",
    "english": "definitively",
    "chinese": "彻底地；最终地",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 9202
  },
  {
    "italian": "compenso",
    "english": "compensation",
    "chinese": "补偿",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 9289
  },
  {
    "italian": "inventare",
    "english": "invent",
    "chinese": "发明",
    "patternType": null,
    "similarityScore": 53,
    "difficulty": "medium",
    "rank": 9543
  },
  {
    "italian": "stupido",
    "english": "stupid",
    "chinese": "愚蠢的；蠢货",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 715
  },
  {
    "italian": "governo",
    "english": "government",
    "chinese": "政府",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 1146
  },
  {
    "italian": "accusa",
    "english": "accusation",
    "chinese": "指控",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 1910
  },
  {
    "italian": "telecamera",
    "english": "camera",
    "chinese": "摄影机",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 2682
  },
  {
    "italian": "invito",
    "english": "invitation",
    "chinese": "邀请",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 2706
  },
  {
    "italian": "sinceramente",
    "english": "sincerely",
    "chinese": "真诚地",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 2878
  },
  {
    "italian": "robot",
    "english": "robotics",
    "chinese": "机器人学",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 3125
  },
  {
    "italian": "conferma",
    "english": "confirmation",
    "chinese": "确认",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 3470
  },
  {
    "italian": "incredibilmente",
    "english": "incredibly",
    "chinese": "难以置信地",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 3784
  },
  {
    "italian": "nucleare",
    "english": "nuclear power",
    "chinese": "核能",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4290
  },
  {
    "italian": "contattare",
    "english": "contact",
    "chinese": "联系人",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4445
  },
  {
    "italian": "imperatore",
    "english": "emperor",
    "chinese": "皇上",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4474
  },
  {
    "italian": "comunicare",
    "english": "communication",
    "chinese": "通讯",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4570
  },
  {
    "italian": "particolarmente",
    "english": "particularly",
    "chinese": "特别是",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4627
  },
  {
    "italian": "interrompere",
    "english": "interrupt",
    "chinese": "中断",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4672
  },
  {
    "italian": "visitare",
    "english": "visit",
    "chinese": "参观，拜访",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4706
  },
  {
    "italian": "ammiraglio",
    "english": "admiral",
    "chinese": "上将",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4747
  },
  {
    "italian": "identificare",
    "english": "identify",
    "chinese": "识别",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4989
  },
  {
    "italian": "basket",
    "english": "basketball",
    "chinese": "篮球",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 4992
  },
  {
    "italian": "medaglia",
    "english": "medal",
    "chinese": "奖牌",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 5097
  },
  {
    "italian": "confermare",
    "english": "confirm",
    "chinese": "确认",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 5354
  },
  {
    "italian": "spendere",
    "english": "spend",
    "chinese": "开支",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 5404
  },
  {
    "italian": "canna",
    "english": "cannabis",
    "chinese": "大麻",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 5590
  },
  {
    "italian": "recita",
    "english": "recitation",
    "chinese": "朗诵",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 5903
  },
  {
    "italian": "desiderare",
    "english": "desire",
    "chinese": "愿望",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 6805
  },
  {
    "italian": "precisamente",
    "english": "precisely",
    "chinese": "确切地；正是",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 7081
  },
  {
    "italian": "necessariamente",
    "english": "necessarily",
    "chinese": "必然",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 7385
  },
  {
    "italian": "stima",
    "english": "estimate",
    "chinese": "估计数",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 7483
  },
  {
    "italian": "psicologo",
    "english": "psychologist",
    "chinese": "心理学家",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 7647
  },
  {
    "italian": "donatore",
    "english": "donor",
    "chinese": "捐助者",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 7695
  },
  {
    "italian": "adrenalina",
    "english": "adrenaline",
    "chinese": "肾上腺素",
    "patternType": null,
    "similarityScore": 90,
    "difficulty": "easy",
    "rank": 8416
  },
  {
    "italian": "postazione",
    "english": "posting",
    "chinese": "张贴",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 8670
  },
  {
    "italian": "stupidaggine",
    "english": "stupidity",
    "chinese": "蠢货",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 9268
  },
  {
    "italian": "cavalleria",
    "english": "cavalry",
    "chinese": "骑兵",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 9286
  },
  {
    "italian": "equipaggiamento",
    "english": "equipment",
    "chinese": "设备",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 9490
  },
  {
    "italian": "divorziare",
    "english": "divorce",
    "chinese": "离婚",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 9506
  },
  {
    "italian": "rappresentare",
    "english": "represent",
    "chinese": "代表",
    "patternType": null,
    "similarityScore": 52,
    "difficulty": "medium",
    "rank": 9693
  },
  {
    "italian": "probabilmente",
    "english": "probably",
    "chinese": "大概，很可能",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 524
  },
  {
    "italian": "passare",
    "english": "pass",
    "chinese": "经过；通过",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 591
  },
  {
    "italian": "pena",
    "english": "penalty",
    "chinese": "处罚",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 1074
  },
  {
    "italian": "salvare",
    "english": "save",
    "chinese": "保存",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 1084
  },
  {
    "italian": "battaglia",
    "english": "battle",
    "chinese": "战斗；战役",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 1507
  },
  {
    "italian": "risolvere",
    "english": "solve",
    "chinese": "解决",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 1643
  },
  {
    "italian": "accettare",
    "english": "accept",
    "chinese": "接受",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 1667
  },
  {
    "italian": "sistemare",
    "english": "arrange",
    "chinese": "整理；安排",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 1855
  },
  {
    "italian": "bottiglia",
    "english": "bottle",
    "chinese": "瓶子",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 1863
  },
  {
    "italian": "desiderio",
    "english": "desire",
    "chinese": "愿望",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 1925
  },
  {
    "italian": "termine",
    "english": "term",
    "chinese": "期限；术语",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 2067
  },
  {
    "italian": "nervoso",
    "english": "nervous",
    "chinese": "紧张的；神经质的",
    "patternType": null,
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 2306
  },
  {
    "italian": "risultato",
    "english": "result",
    "chinese": "结果",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 2419
  },
  {
    "italian": "familiare",
    "english": "family",
    "chinese": "家庭",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 2697
  },
  {
    "italian": "interessato",
    "english": "interested, concerned",
    "chinese": "感兴趣的；有关的",
    "patternType": null,
    "similarityScore": 63,
    "difficulty": "medium",
    "rank": 2698
  },
  {
    "italian": "muovere",
    "english": "move",
    "chinese": "移动",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 2792
  },
  {
    "italian": "ufficialmente",
    "english": "officially",
    "chinese": "正式地",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 3130
  },
  {
    "italian": "porno",
    "english": "porn",
    "chinese": "色情影片",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 3230
  },
  {
    "italian": "massa",
    "english": "mass",
    "chinese": "质量；大量",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 3640
  },
  {
    "italian": "attaccare",
    "english": "attack",
    "chinese": "攻击；粘贴",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 3967
  },
  {
    "italian": "cabina",
    "english": "cabin",
    "chinese": "小室；驾驶舱；船舱",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 4024
  },
  {
    "italian": "riportare",
    "english": "report",
    "chinese": "报告",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 4043
  },
  {
    "italian": "dettaglio",
    "english": "detail",
    "chinese": "细节",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 4300
  },
  {
    "italian": "difendere",
    "english": "defend",
    "chinese": "保卫",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 4372
  },
  {
    "italian": "terribilmente",
    "english": "terribly",
    "chinese": "非常，极其",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 4963
  },
  {
    "italian": "salvatore",
    "english": "savior",
    "chinese": "救赎",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 5204
  },
  {
    "italian": "Veronica",
    "english": "veronica (name)",
    "chinese": "维罗妮卡（名字）",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 5317
  },
  {
    "italian": "pillola",
    "english": "pill",
    "chinese": "药丸",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 5349
  },
  {
    "italian": "rimuovere",
    "english": "remove",
    "chinese": "删除",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 6135
  },
  {
    "italian": "cristallo",
    "english": "crystal glass",
    "chinese": "晶体玻璃",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 6197
  },
  {
    "italian": "costato",
    "english": "cost",
    "chinese": "费用",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 6309
  },
  {
    "italian": "apparentemente",
    "english": "apparently",
    "chinese": "看起来；表面上",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 6752
  },
  {
    "italian": "conquistare",
    "english": "conquer",
    "chinese": "征服",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 6754
  },
  {
    "italian": "precisione",
    "english": "precision",
    "chinese": "精确，精度",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 6869
  },
  {
    "italian": "trapianto",
    "english": "transplantation",
    "chinese": "移植",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 7185
  },
  {
    "italian": "presentimento",
    "english": "premonition",
    "chinese": "预感",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 7290
  },
  {
    "italian": "Svizzera",
    "english": "switzerland",
    "chinese": "瑞士",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 7432
  },
  {
    "italian": "disperatamente",
    "english": "desperately",
    "chinese": "拼命地；绝望地",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 7511
  },
  {
    "italian": "maresciallo",
    "english": "marshal",
    "chinese": "元帅",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 8023
  },
  {
    "italian": "procura",
    "english": "procurement",
    "chinese": "采购",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 8376
  },
  {
    "italian": "passero",
    "english": "pass",
    "chinese": "通过",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 8409
  },
  {
    "italian": "moderno",
    "english": "modern",
    "chinese": "现代的",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 8439
  },
  {
    "italian": "audace",
    "english": "audacious",
    "chinese": "大胆",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 8827
  },
  {
    "italian": "cellula",
    "english": "cell",
    "chinese": "单元格",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 9106
  },
  {
    "italian": "formare",
    "english": "form",
    "chinese": "窗体",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 9168
  },
  {
    "italian": "teletrasporto",
    "english": "teleportation",
    "chinese": "瞬间移动，传送",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 9361
  },
  {
    "italian": "finanziaria",
    "english": "financial year",
    "chinese": "财政年度",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 9598
  },
  {
    "italian": "Francesca",
    "english": "francesca (name)",
    "chinese": "弗朗西斯卡（名字）",
    "patternType": null,
    "similarityScore": 51,
    "difficulty": "medium",
    "rank": 9768
  },
  {
    "italian": "bello",
    "english": "beautiful",
    "chinese": "美丽的；漂亮的",
    "patternType": "-ello/-el",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 309
  },
  {
    "italian": "serio",
    "english": "serious",
    "chinese": "严肃的，认真的",
    "patternType": null,
    "similarityScore": 71,
    "difficulty": "medium",
    "rank": 474
  },
  {
    "italian": "idiota",
    "english": "idiot",
    "chinese": "白痴，笨蛋",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 769
  },
  {
    "italian": "tenente",
    "english": "lieutenant",
    "chinese": "中尉",
    "patternType": "-ente/-ent",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 1193
  },
  {
    "italian": "proteggere",
    "english": "protect",
    "chinese": "保护",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 1489
  },
  {
    "italian": "memoria",
    "english": "memory",
    "chinese": "记忆；内存",
    "patternType": "-oria/-ory",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 1553
  },
  {
    "italian": "soluzione",
    "english": "solution",
    "chinese": "解决方案",
    "patternType": "-zione/-tion",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 1675
  },
  {
    "italian": "conversazione",
    "english": "conversation",
    "chinese": "对话，交谈",
    "patternType": "-zione/-tion",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 1838
  },
  {
    "italian": "finale",
    "english": "final",
    "chinese": "最后的；决赛",
    "patternType": "-ale/-al",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 1853
  },
  {
    "italian": "stella",
    "english": "star",
    "chinese": "星星；明星",
    "patternType": "-ella/-el",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 1952
  },
  {
    "italian": "direzione",
    "english": "direction",
    "chinese": "方向；管理层",
    "patternType": "-zione/-tion",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 2111
  },
  {
    "italian": "calmo",
    "english": "calm",
    "chinese": "平静的，冷静的",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 2190
  },
  {
    "italian": "trappola",
    "english": "trap",
    "chinese": "陷阱",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 2203
  },
  {
    "italian": "sopravvivere",
    "english": "survive",
    "chinese": "幸存下来",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 2237
  },
  {
    "italian": "cella",
    "english": "cell",
    "chinese": "牢房；小室",
    "patternType": "-ella/-el",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 2246
  },
  {
    "italian": "muoversi",
    "english": "move",
    "chinese": "移动",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 2387
  },
  {
    "italian": "studiare",
    "english": "study",
    "chinese": "学习",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 2416
  },
  {
    "italian": "traffico",
    "english": "traffic",
    "chinese": "交通",
    "patternType": "-ico/-ic",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 2436
  },
  {
    "italian": "pari",
    "english": "equal",
    "chinese": "相等的；同等的",
    "patternType": null,
    "similarityScore": null,
    "difficulty": "hard",
    "rank": 2652
  },
  {
    "italian": "reparto",
    "english": "department",
    "chinese": "部门",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3006
  },
  {
    "italian": "distretto",
    "english": "district",
    "chinese": "区，地区",
    "patternType": "-etto/-et",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3074
  },
  {
    "italian": "illegale",
    "english": "illegal",
    "chinese": "非法的",
    "patternType": "-ale/-al",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3082
  },
  {
    "italian": "recuperare",
    "english": "recover",
    "chinese": "恢复",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3157
  },
  {
    "italian": "professionista",
    "english": "professional",
    "chinese": "专业人士，职业选手",
    "patternType": "-ista/-ist",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3316
  },
  {
    "italian": "condizione",
    "english": "condition",
    "chinese": "条件；状况",
    "patternType": "-zione/-tion",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3354
  },
  {
    "italian": "corretto",
    "english": "correct",
    "chinese": "正确的",
    "patternType": "-etto/-et",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3380
  },
  {
    "italian": "disposizione",
    "english": "disposal",
    "chinese": "处置",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3494
  },
  {
    "italian": "annuncio",
    "english": "announcement",
    "chinese": "通知",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3664
  },
  {
    "italian": "ipotesi",
    "english": "hypotheses",
    "chinese": "假设",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 3815
  },
  {
    "italian": "identità",
    "english": "identity",
    "chinese": "身份",
    "patternType": "-ità/-ity",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 4015
  },
  {
    "italian": "carro",
    "english": "carriage",
    "chinese": "大车，货车",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 4040
  },
  {
    "italian": "qualità",
    "english": "quality",
    "chinese": "质量，品质",
    "patternType": "-ità/-ity",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 4053
  },
  {
    "italian": "insalata",
    "english": "salad",
    "chinese": "沙拉",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 4238
  },
  {
    "italian": "rispettare",
    "english": "respect",
    "chinese": "尊重",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 4544
  },
  {
    "italian": "manuale",
    "english": "manual",
    "chinese": "手册；手动的",
    "patternType": "-ale/-al",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 4947
  },
  {
    "italian": "riflettere",
    "english": "reflect",
    "chinese": "反映",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 5351
  },
  {
    "italian": "leva",
    "english": "leverage",
    "chinese": "杠杆",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 5377
  },
  {
    "italian": "umorismo",
    "english": "humor",
    "chinese": "风趣",
    "patternType": "-ismo/-ism",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 5395
  },
  {
    "italian": "recentemente",
    "english": "recently",
    "chinese": "近来",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 5631
  },
  {
    "italian": "frutto",
    "english": "fruit",
    "chinese": "果实",
    "patternType": "-utto/-ut",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 5887
  },
  {
    "italian": "tennis",
    "english": "tennis court",
    "chinese": "网球场",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 5934
  },
  {
    "italian": "vitale",
    "english": "vital",
    "chinese": "至关重要的；生命的",
    "patternType": "-ale/-al",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 5947
  },
  {
    "italian": "lavanderia",
    "english": "laundry",
    "chinese": "洗衣业",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6071
  },
  {
    "italian": "competizione",
    "english": "competition",
    "chinese": "竞赛，比赛",
    "patternType": "-zione/-tion",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6076
  },
  {
    "italian": "distrettuale",
    "english": "district",
    "chinese": "地区",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6371
  },
  {
    "italian": "restituire",
    "english": "return",
    "chinese": "归还",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6388
  },
  {
    "italian": "maschile",
    "english": "male",
    "chinese": "男性",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6421
  },
  {
    "italian": "obbligo",
    "english": "obligation",
    "chinese": "义务",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6500
  },
  {
    "italian": "pianoforte",
    "english": "piano",
    "chinese": "钢琴",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6525
  },
  {
    "italian": "stellare",
    "english": "star",
    "chinese": "星号",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6577
  },
  {
    "italian": "fotografo",
    "english": "photographer",
    "chinese": "摄影师",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6733
  },
  {
    "italian": "torcia",
    "english": "torchlight",
    "chinese": "火炬灯",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 6984
  },
  {
    "italian": "esagerare",
    "english": "exaggerating",
    "chinese": "夸张",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7014
  },
  {
    "italian": "esistere",
    "english": "exist",
    "chinese": "已存在",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7034
  },
  {
    "italian": "permanente",
    "english": "permanent",
    "chinese": "永久的，持久的",
    "patternType": "-ente/-ent",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7146
  },
  {
    "italian": "finanziario",
    "english": "financial year",
    "chinese": "财政年度",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7215
  },
  {
    "italian": "calendario",
    "english": "calendar",
    "chinese": "日历",
    "patternType": "-ario/-ary",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7614
  },
  {
    "italian": "Simone",
    "english": "simon (name)",
    "chinese": "西蒙（名字）",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7628
  },
  {
    "italian": "digitale",
    "english": "digital",
    "chinese": "数字的",
    "patternType": "-ale/-al",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7679
  },
  {
    "italian": "terrorismo",
    "english": "terrorism",
    "chinese": "恐怖主义",
    "patternType": "-ismo/-ism",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7873
  },
  {
    "italian": "incrocio",
    "english": "intersection",
    "chinese": "交叉",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 7913
  },
  {
    "italian": "armatura",
    "english": "armor",
    "chinese": "装甲",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 8155
  },
  {
    "italian": "promettere",
    "english": "promise",
    "chinese": "承诺",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 8465
  },
  {
    "italian": "separazione",
    "english": "separation",
    "chinese": "分离，分开",
    "patternType": "-zione/-tion",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 8497
  },
  {
    "italian": "dichiarare",
    "english": "declare",
    "chinese": "声明",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 8515
  },
  {
    "italian": "regolarmente",
    "english": "regularly",
    "chinese": "经常",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 8772
  },
  {
    "italian": "documentario",
    "english": "documentary",
    "chinese": "纪录片",
    "patternType": "-ario/-ary",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 8815
  },
  {
    "italian": "superficiale",
    "english": "surface",
    "chinese": "表面",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 8996
  },
  {
    "italian": "formale",
    "english": "formal",
    "chinese": "正式的",
    "patternType": "-ale/-al",
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 9176
  },
  {
    "italian": "pubblicare",
    "english": "publish",
    "chinese": "发布",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 9339
  },
  {
    "italian": "britannico",
    "english": "british",
    "chinese": "英国",
    "patternType": null,
    "similarityScore": 50,
    "difficulty": "medium",
    "rank": 9606
  }
];

// 统一注册：消费方经 LangLoader.data(lang, module) 取数（lib/lang-loader.js）
(globalThis.DIM_DATA = globalThis.DIM_DATA || {});
(globalThis.DIM_DATA.cognates = globalThis.DIM_DATA.cognates || {}).it = COGNATE_DATA;
