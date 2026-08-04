// Guided German curriculum for Dimenticato.
//
// The lesson sequence follows the table-of-contents scope visible in the
// user's local "走遍德国 / Passwort Deutsch" A1-B1 and "Mittelpunkt" B2-C1
// course books. The compact summaries, grammar labels and practice headword
// selections are independently organized for this application. No scanned
// textbook pages or exercise text are redistributed.

function parseGermanCourseUnits(level, raw) {
  return raw.trim().split('\n').filter(Boolean).map((line) => {
    const [number, title, summary, grammar, headwords] = line.split('|');
    return {
      id: `${level}-${String(number).padStart(2, '0')}`,
      number: Number(number),
      title,
      summary,
      grammar: grammar.split(';').map((item) => item.trim()).filter(Boolean),
      headwords: headwords.split(',').map((item) => item.trim()).filter(Boolean)
    };
  });
}

const GERMAN_COURSE_DATA = {
  sources: [
    '走遍德国 初级 1-3（A1-B1）',
    '走遍德国 中级 1-2 / Mittelpunkt（B2-C1）',
    '德语中高级词汇练习与解析（进阶词汇范围参考）'
  ],
  levels: [
    {
      id: 'A1',
      title: 'Grundlagen',
      chineseTitle: '基础沟通',
      description: '从问候、自我介绍和家庭进入城市、出行、饮食与住房。',
      units: parseGermanCourseUnits('A1', `
1|Guten Tag|问候、自我介绍、国家与数字|Präsens;sein;人称代词;陈述句与疑问句|hallo,Tag,Name,Land,Zahl,heißen,kommen,wohnen,sprechen,sein
2|Bilder aus Deutschland|描述城市、村庄、人物与物品|定冠词与不定冠词;单复数;kein;wissen|Stadt,Dorf,Ort,Mensch,Ding,Haus,Straße,Deutschland,hoch,alt
3|Meine Familie und ich|家庭、爱好、时间与日常活动|物主冠词;haben;可分动词;情态动词 mögen|Familie,Eltern,Vater,Mutter,Bruder,Schwester,Hobby,Uhr,Woche,Brief
4|Der Münsterplatz in Freiburg|城市活动、食品、购物与价格|Akkusativ;brauchen;können;müssen;man|Lebensmittel,kaufen,bestellen,bezahlen,Preis,Café,brauchen,können,müssen,Samstag
5|Leute in Hamburg|职业、城市生活、过去与饮食|介词 auf 与 in;Präteritum von haben/sein;für/ohne|Beruf,Arbeit,Stadt,früher,heute,kochen,essen,Leute,haben,sein
6|Ortstermin Leipzig|安排会面、讲述过去、明信片与简历|Perfekt mit haben/sein;句框|Treffen,planen,Vergangenheit,Postkarte,Jahr,Lebenslauf,kommen,gehen,Uhrzeit,Stadt
7|Ein Hotel in Salzburg|酒店、天气、旅行与预订|Perfekt;Dativ;mit + Dativ|Hotel,Wetter,Reise,Zimmer,Rezeption,reservieren,Person,arbeiten,Freizeit,Empfang
8|Projekt Nürnberg|城市方位、服装、颜色与项目展示|双向介词;welch-;wollen;dürfen|Straße,Platz,Orientierung,Kleidung,Farbe,Größe,Gedicht,Projekt,Stadt,Richtung
9|Basel im Dreiländereck|城乡比较、交通、工作与新闻|比较级与最高级;Dativ 介词;Dativ 人称代词|Stadt,Land,Verkehr,Arbeit,Sprache,Zeitung,vergleichen,argumentieren,Bahn,Grenze
10|Wohnen in Bochum|住房、购物、庆祝活动与表达意见|情态动词 Präteritum;dass/weil 从句|Haus,Wohnung,Lebensmittel,Fest,Meinung,Vergangenheit,wohnen,organisieren,müssen,wollen
      `)
    },
    {
      id: 'A2',
      title: 'Alltag und Regionen',
      chineseTitle: '日常与地区',
      description: '扩展旅行、健康、工作、通信、文化和跨地区生活场景。',
      units: parseGermanCourseUnits('A2', `
11|Frankfurt an der Oder|大学、住房、家具、广告与周末活动|Dativ 宾语;Imperativ;情态动词 sollen|Universität,Wohnung,Möbel,Anzeige,Wochenende,Information,Kurs,lesen,schreiben,sollen
12|Eine Reise nach Berlin|建筑方位、历史事件、文化与季节|双向介词;wenn 从句;时间表达|Reise,Hauptstadt,Gebäude,Kultur,Geschichte,Datum,Jahreszeit,Lied,orientieren,verstehen
13|Europastadt Aachen|祝福、风景、竞赛和体育报道|形容词词尾;Genitiv;以 W-Wort 或 ob 引导的从句|Glückwunsch,Landschaft,Zeitung,Wettbewerb,Sport,Gewinner,Europa,fragen,berichten,beschreiben
14|Zu Besuch in Dresden|预约、身体护理、医生建议与历史|不定冠词后的形容词词尾;反身代词;sollte|Termin,Körper,Arzt,Rat,Museum,Geschichte,besuchen,planen,beschreiben,pflegen
15|In Wien zu Hause|实习报告、愿望、礼貌与住房文化|并列连词;Konjunktiv II;无冠词形容词词尾|Praktikum,Wunsch,Höflichkeit,Reise,Österreich,Haus,Brief,Kaffee,bitten,fragen
16|Eine E-Mail aus Zürich|银行、约会、企业沟通与休闲|zu + Infinitiv;介词宾语;代副词|Bank,Verabredung,Unternehmen,Kommunikation,Firma,Land,Nachricht,Wissen,Freizeit,Gast
17|Schwabenmetropole Stuttgart|发明、职业培训、分歧与人物传记|关系从句;情态动词转述;n-Deklination|Erfindung,Erfinder,Ausbildung,Meinung,Besonderheit,Lebenslauf,Familie,Region,informieren,erzählen
18|Eine Firma in Hannover|企业历史、求职、同事交流与电脑|Präteritum;不可分动词;als/wenn;obwohl|Beruf,Firma,Bewerbung,Kollege,Computer,Vergangenheit,Stadt,Arbeit,Gespräch,regelmäßig
19|An der Nordseeküste|自然体验、人口、低地德语与海洋故事|bevor/seit/während;可分动词 Präteritum|Küste,Insel,Meer,Bevölkerung,Natur,Erlebnis,Sprache,Getränk,Geschichte,Sturm
20|Im Saarland|移民、意外、车辆、保险与人物经历|brauchen + zu;wenn 条件句;damit;um ... zu|Ausländer,Unfall,Auto,Versicherung,Lebenslauf,Sprache,Einwanderung,Familie,Region,Teil
      `)
    },
    {
      id: 'B1',
      title: 'Selbstständig handeln',
      chineseTitle: '独立表达',
      description: '围绕社会、媒体、教育、旅行和考试任务提升叙述与论证能力。',
      units: parseGermanCourseUnits('B1', `
21|Münchner Ansichten|生活质量、节庆、统计、警情与剧本|比较级形容词词尾;被动态;语序|Lebensstandard,Lebensqualität,Vergleich,Oktoberfest,Statistik,Polizei,Drehbuch,Reihenfolge,Feier,berichten
22|Pontresina|健康、自然疗法、农业、冬季运动与推测|情态表达;情态动词被动态;成对连词|Gesundheit,Medizin,Bauer,Arbeit,Winter,Vermutung,Argument,Ski,Zentrum,Berg
23|Eindrücke aus Kärnten|少数群体、民主、宗教、节庆与传统|情态动词 Perfekt;je ... desto;不定代词|Minderheit,Demokratie,Brauch,Religion,Fest,Foto,Region,Tradition,Parlament,erzählen
24|Menschen in Jena|老年生活、体育、占星和人物故事|Genitiv 介词;während/wegen;trotz;werden + Infinitiv|Alter,Sport,Astrologie,Geschichte,Planetarium,Stadt,Aktivität,erzählen,vermuten,lesen
25|Den Rhein entlang|消费习惯、图表、莱茵故事与口试|名词化形容词;Partizip I/II 作形容词|Rhein,Gewohnheit,Grafik,Veranstaltung,Geschichte,Prüfung,Wasser,Schiff,Romantik,argumentieren
26|Im Kanton Bern|瑞士、新闻、音乐、山地救援与求助|间接引语;Konjunktiv I;关系代词 was 与 Genitiv|Land,Zeitung,Musik,Berg,Rettung,Dank,Hilfsorganisation,Bericht,Not,helfen
27|Urlaub am Bodensee|度假、旅馆、自行车、岛屿与旅行经历|方位副词;名词化形容词;过去时 Konjunktiv II|Urlaub,See,Pension,Fahrrad,Insel,Erlebnis,vergleichen,Nachricht,Reise,erzählen
28|Lernen in Graz|广告、学校、报名、考试与书面表达|es 的功能;Zustandspassiv;werden 的功能|Anzeige,Brief,Veranstaltung,Schule,Prüfung,Kommunikation,Lernen,Universität,anmelden,organisieren
29|Medienstadt Mainz|媒体、印刷、广告、报刊与一分钟演讲|Plusquamperfekt;nachdem;welch- 与 was für ein|Medien,Zeitung,Erfinder,Druck,Anzeige,Rede,Meinung,Bewegung,Stadt,lesen
30|Au-pair in Göttingen|求职面试、家庭、住房、出游与口试|Dativ/Akkusativ 代词顺序;语气小品词;einander|Vorstellungsgespräch,Haushalt,Wohnen,Ausflug,Prüfung,Foto,Stadt,Kind,diskutieren,planen
      `)
    },
    {
      id: 'B2',
      title: 'Argumentieren und kooperieren',
      chineseTitle: '论证与协作',
      description: '训练较长对话、系统论证、协作沟通和复杂书面表达。',
      units: parseGermanCourseUnits('B2', `
1|Reisen|旅行选择、移动方式、计划与观点辩护|因果主从句;句框;连接副词|Reise,Urlaub,Mobilität,Dorf,Angebot,Bedürfnis,Planung,Lösung,Aussicht,Argument,Unterkunft,Verkehr
2|Einfach schön|审美、身体、健康、意见调查与特别时刻|句中时间/原因/情态/地点成分|Schönheit,Körper,Gesundheit,Augenblick,Wort,Gefühl,Diskussion,Vermutung,Ratgeber,Ergebnis,Fragebogen,Interview
3|Nebenan und Gegenüber|邻里、争执、倾听、调解与跨文化经验|对立/选择/情态从句;派生形容词|Nachbar,Nachbarschaft,Streit,Konflikt,Zuhören,Diskussion,Lösung,Telefon,Erfahrung,Garten,Grund,Versöhnung
4|Dinge|物品描述、价值、产品展示与消费|形容词词尾;关系从句 mit was/wo(r)-|Gegenstand,Wert,Beschreibung,Produkt,Präsentation,Handel,Ordnung,Besitz,Konsum,sammeln,kaufen,verkaufen
5|Kooperieren|协作、谈判、对话、婚姻与共同计划|二项连接词;Konjunktiv II;文本照应|Zusammenarbeit,Verständigung,Verhandlung,Kompromiss,Dialog,Monolog,Verhalten,Reaktion,Scheidung,Ehe,Plan,Konflikt
6|Arbeit|职业角色、求职、全球化与工作生活|名词动词搭配;被动态;复杂时态与 Konjunktiv II|Arbeit,Beruf,Bewerbung,Rolle,Globalisierung,Anzeige,Anweisung,Kollege,Büro,Karriere,Erfahrung,Vertrag
7|Natur|自然、灾害、克隆、营养和植物疗法|间接引语;虚拟语气;被动态替代形式|Natur,Jahreszeit,Katastrophe,Klon,Ernährung,Pflanze,Bericht,Forschung,Umwelt,Vorteil,Nachteil,Medizin
8|Wissen und Können|知识、能力、学习、记忆和终身教育|同义转述;Modalsätze;finale Nebensätze|Wissen,Können,Lernen,Gedächtnis,Bildung,Forschung,Musik,Vortrag,Definition,Fähigkeit,Erfahrung,Weiterbildung
9|Gefühle|情绪、非语言表达、故事与艺术体验|名词/动词/形容词介词搭配;主观用法情态动词|Gefühl,Emotion,Verstand,Bedeutung,Situation,Erzählung,Korrespondenz,Kunst,Empfindung,Reaktion,Ausdruck,Stimmung
10|Arbeiten international|海外工作、表格、合同、机关与文化适应|Partizip I/II 作定语;ohne zu/ohne dass|Ausland,Organisation,Telefon,Formular,Vertrag,Behörde,Kultur,Anpassung,Plan,Bewerbung,Mietvertrag,Arbeitsplatz
11|Leistungen|成功、失败、自雇、教育和奖项|连续/让步连接词;演讲与读者来信结构|Leistung,Erfolg,Misserfolg,Gründung,Schule,Preis,Rede,Motivation,Intelligenz,Wettbewerb,Ziel,Firma
12|Sprachlos|闲谈、肢体语言、音乐、投诉和表达策略|关系从句;指代副词;概括性关系从句|Sprache,Smalltalk,Konversation,Hand,Fuß,Musik,Beschwerde,Sprichwort,Kommunikation,Geste,Mimik,Ironie
      `)
    },
    {
      id: 'C1',
      title: 'Präzision und Diskurs',
      chineseTitle: '精确表达',
      description: '面向学术、职业和公共议题，训练隐含意义、复杂文本与正式论述。',
      units: parseGermanCourseUnits('C1', `
1|Netzwerke|个人网络、社群、营销、访谈和网络文化|名词动词搭配;Genitiv 属性;同位语|Netzwerk,Gemeinschaft,Marketing,Interview,Computer,Austausch,Individualität,Gruppe,Pressekonferenz,Standpunkt,Kommentar,Beziehung
2|Alles Kunst|艺术定义、治疗、市场、艺术家与人生选择|连接词意义;转述立场;语体分析|Kunst,Therapie,Geld,Künstler,Leben,Museum,Schauspiel,Musik,Kolumne,Erfahrung,Definition,Gemälde
3|Suchen, finden, tun|职位搜索、能力、评估中心、劳动合同与谈判|国际名词复数;Partizipialkonstruktionen;扩展分词|Suche,Stelle,Kompetenz,Vorstellung,Arbeitsvertrag,Verhandlung,Anzeige,Ausbildung,Qualifikation,Lebenslauf,Bewerbung,Arbeitstag
4|Im Einsatz|志愿服务、协会、援助、捐赠与公共参与|不可分前缀动词;Genitiv 介词|Engagement,Ehrenamt,Verein,Hilfe,Organisation,Spende,Frieden,Preisträger,Tätigkeit,Förderung,Freiwillige,Empfänger
5|Sagen und Meinen|禁忌、反讽、谎言、性别语言与惯用表达|无主句被动态;语气小品词;情态动词被动态从句|Tabu,Kommunikation,Ironie,Lüge,Korrespondenz,Redewendung,Geschlecht,Sprache,Täuschung,Stil,Dialog,Anspielung
6|Jung und Alt|人口、代际、青年语言与创意文本|Futur I/II;指示冠词与代词|Jugend,Alter,Bevölkerung,Generation,Sprache,Interview,Entwicklung,Erfahrung,Konflikt,Text,Jugendliche,Senior
7|Viel Glück|幸福、爱情、放弃、人生故事与文学改写|绝对比较级;名词化;属格文学表达|Glück,Liebe,Verzicht,Schokolade,Lebensgeschichte,Unterhaltung,Lebenslauf,Erzählung,Fortsetzung,Genuss,Erfolg,Erfahrung
8|Neue Welten|工业变革、机器人、新医学与未来发明|不定代词作代词;衔接手段;科技语体|Technik,Entwicklung,Erfindung,Roboter,Medizin,Forschung,Zukunft,Industrie,Zelle,Intelligenz,Innovation,Haushalt
9|Geld|货币、银行服务、投诉、消费和谈判|条件句 mit sollen;要求句;间接引语|Geld,Währung,Bank,Dienstleistung,Kunde,Kündigung,Kauf,Verbraucher,Verhandlung,Kredit,Rechnung,Beratung
10|Sinne|视觉、嗅觉、味觉、触觉、噪声与超感知|动词名词化;同义转述;正式定义|Sinn,Sehen,Riechen,Schmecken,Fühlen,Wahrnehmung,Duft,Geschmack,Haut,Lärm,Musik,Auge
11|Globalisierung heute|国际职业、经济、气候变化与公共讨论|名词动词搭配;图表论证;Adverbien/Adjektive|Globalisierung,Karriere,Wirtschaft,Klima,Wandel,Entwicklung,Schutz,Vortrag,Grafik,Diskussion,Welthandel,Umwelt
12|Wandel|价值变化、教育转型、时间、节奏与社会变迁|代词功能;可分/不可分动词;文本结构|Wandel,Wert,Lernen,Veränderung,Zeit,Rhythmus,Arbeit,Gesellschaft,Original,Tanz,Erziehung,Zukunft
      `)
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GERMAN_COURSE_DATA;
}
