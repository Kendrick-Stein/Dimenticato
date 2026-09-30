// Guided German curriculum for Dimenticato.  GENERATED — edit
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
//   * unit.headwords was raised from 10-12 to up to 42 entries per unit, all
//     resolvable against data/german-vocabulary.js, so a practice session has
//     a real distractor pool.

const GERMAN_COURSE_GRAMMAR_SLUGS = {
  "Adverbien/Adjektive": "副词/副词的种类与位置",
  "Akkusativ": "冠词/冠词",
  "Dativ": "冠词/冠词",
  "Dativ 人称代词": "代词/代词",
  "Dativ 介词": "介词/介词支配格",
  "Dativ 宾语": "句法/句法",
  "Dativ/Akkusativ 代词顺序": "句法/句法",
  "Futur I/II": "动词/变位",
  "Genitiv": "冠词/冠词",
  "Genitiv 介词": "介词/介词支配格",
  "Genitiv 属性": "名词/名词",
  "Imperativ": "动词/叙述方式",
  "Konjunktiv I": "动词/叙述方式",
  "Konjunktiv II": "动词/叙述方式",
  "Modalsätze": "连词/从属连词总表",
  "Partizip I/II 作定语": "非限定形式/分词",
  "Partizip I/II 作形容词": "非限定形式/分词",
  "Partizipialkonstruktionen": "非限定形式/分词",
  "Perfekt": "动词/变位",
  "Perfekt mit haben/sein": "动词/变位",
  "Plusquamperfekt": "动词/变位",
  "Präsens": "动词/变位",
  "Präteritum": "动词/变位",
  "Präteritum von haben/sein": "动词/变位",
  "Zustandspassiv": "动词/行动方式",
  "als/wenn": "连词/时间从句连词",
  "bevor/seit/während": "连词/时间从句连词",
  "brauchen": "动词/动词",
  "brauchen + zu": "非限定形式/带zu的不定式",
  "damit": "连词/原因结果与目的",
  "dass/weil 从句": "连词/从属连词总表",
  "dürfen": "动词/动词",
  "einander": "代词/代词",
  "es 的功能": "代词/代词",
  "finale Nebensätze": "连词/原因结果与目的",
  "für/ohne": "介词/介词支配格",
  "haben": "动词/动词",
  "je ... desto": "连词/双重连词",
  "kein": "冠词/冠词",
  "können": "动词/动词",
  "man": "代词/代词",
  "mit + Dativ": "介词/介词支配格",
  "müssen": "动词/动词",
  "n-Deklination": "名词/阳性弱变化",
  "nachdem": "连词/时间从句连词",
  "obwohl": "连词/让步与对比",
  "ohne zu/ohne dass": "非限定形式/带zu的不定式",
  "sein": "动词/动词",
  "sollte": "动词/动词",
  "trotz": "介词/介词支配格",
  "um ... zu": "非限定形式/带zu的不定式",
  "welch-": "代词/代词",
  "welch- 与 was für ein": "代词/代词",
  "wenn 从句": "连词/时间从句连词",
  "wenn 条件句": "条件与比较/条件句",
  "werden + Infinitiv": "动词/变位",
  "werden 的功能": "动词/动词",
  "wissen": "动词/动词",
  "wollen": "动词/动词",
  "während/wegen": "介词/介词支配格",
  "zu + Infinitiv": "非限定形式/带zu的不定式",
  "不可分前缀动词": "动词/动词前缀",
  "不可分动词": "动词/动词前缀",
  "不定代词": "代词/代词",
  "不定代词作代词": "代词/代词",
  "不定冠词后的形容词词尾": "形容词/形容词变格",
  "主观用法情态动词": "动词/动词",
  "二项连接词": "连词/双重连词",
  "人称代词": "代词/代词",
  "介词 auf 与 in": "介词/介词辨析",
  "介词宾语": "动词/用法模式",
  "代副词": "副词/代副词da-wo",
  "代词功能": "代词/代词",
  "以 W-Wort 或 ob 引导的从句": "从句/间接疑问句",
  "关系从句": "句法/句法",
  "关系从句 mit was/wo(r)-": "句法/句法",
  "关系代词 was 与 Genitiv": "代词/代词",
  "动词名词化": "名词/名词",
  "单复数": "名词/名词",
  "双向介词": "介词/介词支配格",
  "反身代词": "代词/代词",
  "句中时间/原因/情态/地点成分": "句法/句法",
  "句框": "句法/句法",
  "可分/不可分动词": "动词/动词前缀",
  "可分动词": "动词/动词前缀",
  "可分动词 Präteritum": "动词/动词前缀",
  "同义转述": "其他/其他",
  "同位语": "句法/句法",
  "名词/动词/形容词介词搭配": "动词/用法模式",
  "名词动词搭配": "动词/用法模式",
  "名词化": "名词/名词",
  "名词化形容词": "名词/名词",
  "因果主从句": "连词/原因结果与目的",
  "国际名词复数": "名词/名词",
  "图表论证": "其他/其他",
  "复杂时态与 Konjunktiv II": "动词/叙述方式",
  "定冠词与不定冠词": "冠词/冠词",
  "对立/选择/情态从句": "连词/从属连词总表",
  "属格文学表达": "名词/名词",
  "并列连词": "连词/并列连词",
  "形容词词尾": "形容词/形容词变格",
  "情态动词 Perfekt": "动词/动词",
  "情态动词 Präteritum": "动词/动词",
  "情态动词 mögen": "动词/动词",
  "情态动词 sollen": "动词/动词",
  "情态动词被动态": "动词/行动方式",
  "情态动词被动态从句": "动词/行动方式",
  "情态动词转述": "动词/叙述方式",
  "情态表达": "动词/动词",
  "成对连词": "连词/双重连词",
  "扩展分词": "非限定形式/扩展分词定语",
  "指代副词": "副词/代副词da-wo",
  "指示冠词与代词": "代词/代词",
  "文本照应": "句法/句法",
  "文本结构": "句法/句法",
  "方位副词": "副词/hin与her",
  "无主句被动态": "动词/行动方式",
  "无冠词形容词词尾": "形容词/形容词变格",
  "时间表达": "其他/其他",
  "条件句 mit sollen": "条件与比较/条件句",
  "概括性关系从句": "句法/句法",
  "正式定义": "其他/其他",
  "比较级与最高级": "形容词/形容词",
  "比较级形容词词尾": "形容词/形容词变格",
  "派生形容词": "形容词/形容词",
  "演讲与读者来信结构": "其他/其他",
  "物主冠词": "冠词/冠词",
  "科技语体": "其他/其他",
  "绝对比较级": "形容词/形容词",
  "虚拟语气": "动词/叙述方式",
  "衔接手段": "句法/句法",
  "被动态": "动词/行动方式",
  "被动态替代形式": "动词/行动方式",
  "要求句": "动词/叙述方式",
  "语体分析": "其他/其他",
  "语序": "句法/句法",
  "语气小品词": "句法/句法",
  "转述立场": "动词/叙述方式",
  "过去时 Konjunktiv II": "动词/叙述方式",
  "连接副词": "副词/副词的种类与位置",
  "连接词意义": "连词/从属连词总表",
  "连续/让步连接词": "连词/让步与对比",
  "间接引语": "动词/叙述方式",
  "陈述句与疑问句": "句法/句法"
};

const GERMAN_COURSE_UNIT_EXTRAS = {
  "A1-01": {
    "examples": [
      {
        "de": "Er macht seiner Frau ständig Geschenke.",
        "zh": "他一直会给他妻子送礼物。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Tom liebt seine Frau.",
        "zh": "汤姆爱他的妻子。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Kennst du seinen Namen?",
        "zh": "你知道他的名字吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Hallo, was macht ihr da?",
        "zh": "你们好，你们在做什么？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Name und Adresse, bitte.",
        "zh": "请把姓名和地址告诉我。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er sieht auf Frauen herab.",
        "zh": "他小看女人。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-02": {
    "examples": [
      {
        "de": "Kleiner Fehler, große Wirkung.",
        "zh": "失之毫厘，谬之千里。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Vor meinem Haus ist ein kleiner Garten.",
        "zh": "我家前面有个小庭院。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Hinter meinem Haus ist ein kleiner Teich.",
        "zh": "我家后院有个小水池。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der Markt ist groß.",
        "zh": "市场很大。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er ist kleiner als Tom.",
        "zh": "他比汤姆矮。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich bin kleiner als du.",
        "zh": "我比你矮。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-03": {
    "examples": [
      {
        "de": "Haben diese Kinder Eltern?",
        "zh": "这些孩子有家长吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Mein Onkel hat drei Kinder.",
        "zh": "我的叔叔有三个孩子。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Familie Evans hatte sechs Kinder.",
        "zh": "伊文思家有六个孩子。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Mutter sorgte sich um ihre Kinder.",
        "zh": "母亲很担心孩子。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Onkel Tom ist der Bruder meiner Mutter.",
        "zh": "汤姆叔叔是我妈妈的兄弟。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er hat einen Bruder und zwei Schwestern.",
        "zh": "他有一个兄弟和两个姐妹。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-04": {
    "examples": [
      {
        "de": "Wir werden Brot kaufen.",
        "zh": "我们会买面包。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Kann man mit Geld Glück kaufen?",
        "zh": "钱能不能买到幸福？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sie hätte das Geld nicht bezahlen brauchen.",
        "zh": "她本来没必要付钱的。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sie sparen ihr Geld für den Kauf eines Hauses.",
        "zh": "他们在储钱买房子。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich kaufte kein Brot.",
        "zh": "我没买面包。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir brauchen das Geld.",
        "zh": "我们需要那笔钱。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-05": {
    "examples": [
      {
        "de": "Der Mann arbeitet in seinem Büro.",
        "zh": "男人在自己的办公室里工作。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Mir ist heute nicht nach Arbeiten.",
        "zh": "我今天不想上班。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wer hat heute Dienst?",
        "zh": "今天谁值班？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er ist Arzt von Beruf.",
        "zh": "他的职业是医生。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Essen und trinken Sie.",
        "zh": "吃吧，喝吧。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er verschlang sein Essen.",
        "zh": "他狼吞虎咽地吃了一顿。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-06": {
    "examples": [
      {
        "de": "Komm mich morgen besuchen.",
        "zh": "明天来看看我。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Lass uns ihn besuchen gehen!",
        "zh": "我们去拜访他吧。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich komme dich morgen besuchen.",
        "zh": "我明天会来看你。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir werden dich besuchen kommen.",
        "zh": "我们会来拜访你。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Zehn Jahre sind eine lange Zeit.",
        "zh": "十年是很长的时间。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Komm mich besuchen, wenn du Zeit hast.",
        "zh": "你有时间的时候就来看看我吧。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-07": {
    "examples": [
      {
        "de": "Der Raum ist kalt.",
        "zh": "这间房间很冷。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir reisen morgen ab.",
        "zh": "我们明天要离开。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich liebe es zu reisen.",
        "zh": "我喜欢旅行。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Eintritt nur für Personal.",
        "zh": "非工作人员禁止入内。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich möchte ein Zimmer reservieren.",
        "zh": "我想预定一个房间。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wie viele Zimmer hat ihre Wohnung?",
        "zh": "她的公寓有几间房呢？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-08": {
    "examples": [
      {
        "de": "Nehmt die Straße links.",
        "zh": "走左边的道路。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Nehmen Sie die Straße links.",
        "zh": "走左边的道路。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Kleidung ist dort drüben.",
        "zh": "衣服在那里",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er sah nach links und rechts.",
        "zh": "他左右看了看。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich verkaufe Kleidung online.",
        "zh": "我在网络上卖衣服。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Bist du für oder gegen das Projekt?",
        "zh": "你赞成还是反对这个计划？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-09": {
    "examples": [
      {
        "de": "Sie fuhren mit dem Auto zum Bahnhof.",
        "zh": "他们开车去车站。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das Flugzeug landet am Flughafen Tan-Son-Nhat.",
        "zh": "飞机降落在新山一机场。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das Flugzeug landete auf dem Flughafen Narita.",
        "zh": "飞机在成田机场着陆。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wo ist der Bahnhof?",
        "zh": "火车站在哪里?",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er kann Auto fahren.",
        "zh": "他会开车。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich lerne Auto fahren.",
        "zh": "我正在学习如何驾驶。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A1-10": {
    "examples": [
      {
        "de": "Ich möchte ein Haus mieten.",
        "zh": "我想租房。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich möchte eine Wohnung mieten.",
        "zh": "我要租房。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wollen Sie es hören?",
        "zh": "您想听它吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Toms Haus hat drei Zimmer.",
        "zh": "汤姆家有三间房。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir mieteten eine Wohnung.",
        "zh": "我们租了公寓。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wo kann man ein Auto mieten?",
        "zh": "在哪里能借到车？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-11": {
    "examples": [
      {
        "de": "Viele Studenten studieren gerne morgens.",
        "zh": "许多学生喜欢在早上学习。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Viele Studenten mögen es, morgens zu studieren.",
        "zh": "许多学生喜欢在早上学习。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir sollen die Namen der Studenten alphabetisch ordnen.",
        "zh": "我们应该把学生的名字跟着字母顺序来安排。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das sind alles Studenten.",
        "zh": "他们都是大学生。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir sind beide Studenten.",
        "zh": "咱们都是学生。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sie lehrt Lesen und Schreiben.",
        "zh": "她教阅读和写作。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-12": {
    "examples": [
      {
        "de": "Der Frühling kommt nach dem Winter.",
        "zh": "冬去春来。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der Frühling sät, der Herbst erntet.",
        "zh": "春天播种秋天收获。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der Winter ist die kälteste Jahreszeit.",
        "zh": "冬天是一年之中最冷的季节。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich habe nicht viel von einem Reisenden.",
        "zh": "我还算不上个旅行家。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich mag den Winter lieber als den Sommer.",
        "zh": "我喜欢冬天胜过夏天。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der Frühling ist meine liebste Jahreszeit.",
        "zh": "春天是我最喜爱的季节。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-13": {
    "examples": [
      {
        "de": "Er ist eindeutig der beste Spieler der Mannschaft.",
        "zh": "他明显是队里最厉害的球员。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir halten ihn für den besten Spieler der Mannschaft.",
        "zh": "我们认为他是队里最厉害的选手。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich bin nicht allzu sportlich.",
        "zh": "我不太擅长运动。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich bin ein schlechter Sportler.",
        "zh": "我不擅长运动。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Welche Mannschaft wird gewinnen?",
        "zh": "哪个队会赢？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er wird möglicherweise das Turnier gewinnen.",
        "zh": "他有可能赢得比赛。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-14": {
    "examples": [
      {
        "de": "Der Arzt kurierte sie von ihrer Krankheit.",
        "zh": "医生治好了她的病。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Gott hat mich mit einem gesunden Körper gesegnet.",
        "zh": "上帝赐予我健康的身体。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Was raten Sie mir zu tun?",
        "zh": "您建议我做什么？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er heilte meine Krankheit.",
        "zh": "他治好了我的病。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ihr ganzer Körper schmerzte.",
        "zh": "她浑身酸痛。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Gesundheit geht vor Reichtum.",
        "zh": "健康比财富重要。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-15": {
    "examples": [
      {
        "de": "Wir glauben an Gott.",
        "zh": "我们相信上帝。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir glauben das nicht.",
        "zh": "我们不相信那个。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Bitte antworten Sie mir.",
        "zh": "请回答我。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Tom kennt alle Antworten.",
        "zh": "汤姆知道所有答案。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er hat gerade das Haus verlassen.",
        "zh": "他刚离开家。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Bring mich bitte bis vor die Haustür!",
        "zh": "请把我送到家门口。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-16": {
    "examples": [
      {
        "de": "Das Geld gehört der Firma.",
        "zh": "那是公司的钱。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Schaust du die Nachrichten?",
        "zh": "你看新闻吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Firma hat Bankrott gemacht.",
        "zh": "公司倒闭了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er hat etwas Geld auf der Bank.",
        "zh": "他银行里有点钱。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich habe sehr gute Nachrichten!",
        "zh": "我有一些非常好的消息。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich plane, mehr Geld zu sparen.",
        "zh": "我打算存更多钱。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-17": {
    "examples": [
      {
        "de": "Ich kann es hören.",
        "zh": "我听得到。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wann hören wir auf?",
        "zh": "什么时候结束？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wo befinden wir uns?",
        "zh": "我们在哪儿呀？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Gegend war ruhig.",
        "zh": "这地区很安静。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ist das deine Familie?",
        "zh": "这是你的家人吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir sind eine Familie.",
        "zh": "我们是个家庭。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-18": {
    "examples": [
      {
        "de": "Tom ist ein guter Arbeiter.",
        "zh": "汤姆是个好工人。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich arbeite in dieser Firma.",
        "zh": "我在这家公司工作。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Tom ist mein bester Arbeiter.",
        "zh": "汤姆是我最好的员工。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Stelle die Leiter an die Mauer.",
        "zh": "把梯子靠墙放着。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er ist der Leiter meiner Abteilung.",
        "zh": "他是我部门的主管。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Tom arbeitet bei einer amerikanischen Firma.",
        "zh": "汤姆给一家美国公司干活。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-19": {
    "examples": [
      {
        "de": "Im Meer sind Inseln.",
        "zh": "海里有岛。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Im Meer gibt es Inseln.",
        "zh": "海里有岛。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das Schiff ist jetzt im Hafen.",
        "zh": "船现在在港口这边。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Wellen branden am Strand an.",
        "zh": "波浪拍打着海岸。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Marine bewacht unsere Küsten.",
        "zh": "这海军保卫我们的海岸。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das Schiff läuft in den Hafen ein.",
        "zh": "船进港了。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "A2-20": {
    "examples": [
      {
        "de": "Der Unfall geschah auf der Autobahn.",
        "zh": "事故发生在高速公路上。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der Autor ist Brasilianer.",
        "zh": "作者是巴西人。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Autorin ist sehr humorvoll.",
        "zh": "作家很有幽默感。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er unterwirft sich der Autorität.",
        "zh": "他向权力屈服。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Polizei erreichte den Unfallort.",
        "zh": "警察到达了事故现场。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Eine fremde Sprache zu lernen erfordert viel Zeit.",
        "zh": "学外语很费时间。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-21": {
    "examples": [
      {
        "de": "Das Fernsehen hat das Radio ersetzt.",
        "zh": "电视代替了收音机。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich habe die Nachricht im Radio gehört.",
        "zh": "我从收音机听到了这个消息。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich möchte diese Nachricht noch nicht veröffentlichen.",
        "zh": "我还不想公开这条新闻。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das ist ein Fernseher.",
        "zh": "这是一台电视机。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Glaube nie den Medien!",
        "zh": "永远不要相信媒体。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Rufen Sie die Polizei!",
        "zh": "报警！",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-22": {
    "examples": [
      {
        "de": "Die Schüler sind in den Ferien.",
        "zh": "现在学生在放假。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Diese Schule hat viele Schüler.",
        "zh": "这个学校有很多学生。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Bist du Schüler an dieser Schule?",
        "zh": "你是这所学校的学生吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Diese Schülerin ist Amerikanerin.",
        "zh": "那个女学生是美洲人。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "In unserer Klasse sind vierzig Schüler.",
        "zh": "我们班有四十个学生。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er arbeitet am härtesten in seiner Klasse.",
        "zh": "他在他班里学习最努力。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-23": {
    "examples": [
      {
        "de": "Tom muss sich schützen.",
        "zh": "汤姆得保护自己。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich brauche frische Luft.",
        "zh": "我需要新鲜空气。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Mein Vater war mal Müller.",
        "zh": "我父亲以前是磨坊主。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wofür braucht man Religion?",
        "zh": "为什么宗教是必要的？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir mussten lügen, um uns zu schützen.",
        "zh": "为了保护自己，我们只好说谎。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der Deich schützte die Stadt vor Hochwasser.",
        "zh": "堤坝保护了城市免受洪灾。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-24": {
    "examples": [
      {
        "de": "Boxen ist nicht immer eine raue Sportart.",
        "zh": "拳击并不总是一种粗暴的运动。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sumo ist eine traditionell japanische Sportart.",
        "zh": "相扑是日本传统的体育活动。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Darf ich hier rauchen?",
        "zh": "我可以在这里吸烟吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er ist vom Lesen müde.",
        "zh": "他读累了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich gehe in die Stadt.",
        "zh": "我进城去。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich schlafe im Stehen.",
        "zh": "我站着睡觉。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-25": {
    "examples": [
      {
        "de": "Viel Erfolg bei der Prüfung!",
        "zh": "祝考试好运！",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Mein Chef hat die schwierigen Aufgaben mir zugewiesen.",
        "zh": "我老板把艰巨的任务指派给了我。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Kapitäne tragen die Verantwortung für Schiff und Besatzung.",
        "zh": "船长们对他们的船只和船员负有责任。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Da ist Wasser im Glas.",
        "zh": "杯子里有水。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Es ist kein Wasser da.",
        "zh": "没有水。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich bin nicht schuldig.",
        "zh": "我没有罪。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-26": {
    "examples": [
      {
        "de": "Das Flugzeug flog über den Berg.",
        "zh": "飞机飞过了山。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das Flugzeug machte eine perfekte Landung.",
        "zh": "这架飞机完美的着陆了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Tom stand im U-Bahnhof Westminster auf dem Bahnsteig.",
        "zh": "汤姆站在威斯敏斯特地铁站的站台上。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Demonstration am Bahnhof hat die Reisenden beeinträchtigt.",
        "zh": "火车站的示威抗议给旅客们造成了影响。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich verstehe nur Bahnhof.",
        "zh": "对我来说这都是鸟语。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wann fliegt dein Flugzeug ab?",
        "zh": "你的飞机什么时候起飞？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-27": {
    "examples": [
      {
        "de": "Er ist nur ein Politiker.",
        "zh": "他只不过是个政治家。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Du redest wie ein Politiker.",
        "zh": "你说话说得像个政客。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ist das gesetzlich zugelassen?",
        "zh": "这样合法吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Nicht wählen ist schon ein Wahl.",
        "zh": "不决定本身就是一个决定。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Nicht wählen ist bereits eine Wahl.",
        "zh": "不决定本身就是一个决定。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Gesetze einzuhalten ist unsere Pflicht.",
        "zh": "遵守法律是我们的义务。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-28": {
    "examples": [
      {
        "de": "Wir haben neue Nachbarn.",
        "zh": "我们有新邻居。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich hasse meine Nachbarn.",
        "zh": "我讨厌我的邻居。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich muss für die Prüfung lernen.",
        "zh": "我必须读书准备考试。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir lernen Englisch in der Schule.",
        "zh": "我们在学校学英文。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wir gehen zur Schule, um zu lernen.",
        "zh": "我们去学校学习。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sind Wasser und Strom in der Miete inbegriffen?",
        "zh": "租金含水电费吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-29": {
    "examples": [
      {
        "de": "Ich schlief beim Lesen eines Buches ein.",
        "zh": "我看书的时候睡着了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Lesen Sie dieses Buch!",
        "zh": "看这本书。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ihr Garten ist ein Kunstwerk.",
        "zh": "她的花园是一件艺术作品。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sie ist eine junge Künstlerin.",
        "zh": "她是文艺青年。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er heiratete eine Schauspielerin.",
        "zh": "他和一个女演员结婚了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sind berühmte Musiker auf der Bühne?",
        "zh": "舞台上有著名音乐家吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B1-30": {
    "examples": [
      {
        "de": "Ich will in der Stadt wohnen.",
        "zh": "我想住在城市。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Dieses Foto erinnert mich an meine glückliche Kindheit.",
        "zh": "这张照片让我想起童年的快乐时光。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Aber Sie haben Kinder.",
        "zh": "但是您有孩子。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Als Kind sang sie gut.",
        "zh": "她还是个孩子的时候，唱歌很好听。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Dieses Foto machte er.",
        "zh": "这张照片是他拍的。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Gib mir das Notizbuch!",
        "zh": "把笔记本给我。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-01": {
    "examples": [
      {
        "de": "Außerdem kann ich fliegen.",
        "zh": "此外，我能飞。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das Auto hatte eine Panne.",
        "zh": "车抛锚了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Es gibt zwei Kühe im Dorf.",
        "zh": "村里有两头母牛。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich verstehe Toms Ansicht.",
        "zh": "我理解汤姆的观点。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Aussichten sind negativ.",
        "zh": "前景不妙。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Vögel fliegen am Himmel.",
        "zh": "鸟儿在空中飞翔。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-02": {
    "examples": [
      {
        "de": "Der Berg hat eine schöne Form.",
        "zh": "这座山有一个美丽的外形。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Maria hat ein schönes Gesicht.",
        "zh": "玛利亚的脸很漂亮。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das Wohnzimmermobiliar war modernen Stils.",
        "zh": "客厅的家具风格现代。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich kann meine Gefühle nicht in Worte fassen.",
        "zh": "我说不出我的感觉。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Wohnzimmereinrichtung war von modernem Stil.",
        "zh": "客厅的家具风格现代。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Nur schade, dass diese schönen Worte nicht aus meiner Feder sind.",
        "zh": "只可惜那些美妙的词语并非出于我手。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-03": {
    "examples": [
      {
        "de": "Hören Sie bitte auf zu streiten!",
        "zh": "请您们别再吵了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Weißt du, sie streiten sich wieder.",
        "zh": "你知道吗，他们又在吵架。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die brauchen keinen Grund.",
        "zh": "他们不需要理由。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich habe nicht verstanden.",
        "zh": "我不懂。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich hasse meine Nachbarin.",
        "zh": "我讨厌我的邻居。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich hasse meinen Nachbarn.",
        "zh": "我讨厌我的邻居。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-04": {
    "examples": [
      {
        "de": "Dieser Artikel ist ohne Wert.",
        "zh": "这篇文章没有价值。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Nichts ist so wertvoll wie Zeit.",
        "zh": "没有什么和时间一样珍贵。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich suche den Besitzer dieser Gitarre.",
        "zh": "我在找这把吉他的主人。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Möbel aus gutem Material verkaufen sich gut.",
        "zh": "用优质材料做的家具卖得很好。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sie ist dabei, Material für ein Buch zu sammeln.",
        "zh": "她在为一本书收集材料。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die industrielle Produktion ist im Juli stark gestiegen.",
        "zh": "7月份工业生产大幅增长。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-05": {
    "examples": [
      {
        "de": "Können wir den Planeten retten?",
        "zh": "我们能拯救这颗星球吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Von welchem Planeten kommst du?",
        "zh": "你来自哪个行星？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich kann mit jedem zusammenarbeiten.",
        "zh": "我能跟任何人工作。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich würde gerne mit Ihrer Firma zusammenarbeiten.",
        "zh": "我想和贵公司合作。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die können gut miteinander.",
        "zh": "他们相处融洽。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ihr Verhalten ist niveaulos.",
        "zh": "她的行为很粗俗。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-06": {
    "examples": [
      {
        "de": "Mein Onkel arbeitet in diesem Büro.",
        "zh": "我的叔叔在这个办公室里工作。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sie arbeitet als Sekretärin im Supermarkt.",
        "zh": "她在超市做秘书。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das sind Kollegen von mir.",
        "zh": "我和他们是同事。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er ist von Beruf Zahnarzt.",
        "zh": "他是一位专职牙医。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Mein Beruf ist mein Hobby.",
        "zh": "我的职业正是我的爱好。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Eine Rolle Farbfilm, bitte!",
        "zh": "请给我一卷彩色胶片。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-07": {
    "examples": [
      {
        "de": "In Ankara sind alle Jahreszeiten wie Winter.",
        "zh": "在安卡拉，所有季节都像冬天一样。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Im Wald leben wilde Tiere.",
        "zh": "森林里住着野生动物。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sie sagte, sie möge Tiere.",
        "zh": "她说她喜欢动物。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Tom erklettert einen Baum.",
        "zh": "汤姆在爬树。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Baumwolle nimmt Wasser auf.",
        "zh": "棉花吸水。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das ist zu unserem Vorteil.",
        "zh": "那对我们有利。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-08": {
    "examples": [
      {
        "de": "Alte Hunde können neue Tricks lernen.",
        "zh": "老的犬可以学新的诡计。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wissen kann nur durch Lernen erlangt werden.",
        "zh": "只有学习才能获得知识。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Erwachsene können diese Musik nur schwer verstehen.",
        "zh": "成年人很难理解那些音乐。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Lassen Sie mich das Ergebnis wissen, sobald Sie können.",
        "zh": "尽早让我知道结果。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich muss für Mathe lernen.",
        "zh": "我需要学习数学。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Man hört, er sei bankrott.",
        "zh": "听说他破产了。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-09": {
    "examples": [
      {
        "de": "Liebe ist nicht nur ein Gefühl, sondern auch eine Kunst.",
        "zh": "所谓爱，并不仅仅是一种情感，也是一种艺术。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Vorsicht! Emotionale Abhängigkeit ist kein Synonym für Liebe!",
        "zh": "小心，精神依赖不是爱的同义词！",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Freundschaft ist Liebe mit Verstand.",
        "zh": "友情是理性的爱情。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Deine Situation ist nicht hoffnungslos.",
        "zh": "你的状况并非毫无希望。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich bin emotional dafür, aber rational dagegen.",
        "zh": "我感情上支持，但是理性上反对。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wenn sie fröhlich oder traurig ist, kann sie ihre Gefühle ausdrücken.",
        "zh": "当感到高兴或悲伤时，她能表达感情。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-10": {
    "examples": [
      {
        "de": "Planst du ins Ausland zu gehen?",
        "zh": "你打算出国吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Dürfte ich das Telefonbuch sehen?",
        "zh": "我能看看电话簿吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er hat im Ausland studiert.",
        "zh": "他出国留学了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Telefoniert Tom noch immer?",
        "zh": "汤姆还在打电话吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das ist ein sehr guter Plan.",
        "zh": "这计划很好。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der Plan wird funktionieren.",
        "zh": "这计划会成功。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-11": {
    "examples": [
      {
        "de": "Misserfolg ist die Mutter des Erfolgs.",
        "zh": "失败是成功之母。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Lass uns nach der Schule darüber reden.",
        "zh": "放学后我们再说这个。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ihr gemeinsames Ziel war das Gelingen des Projekts.",
        "zh": "这些人共同的目标是把这个项目做成功。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er bekam einen Preis für den Gewinn des Wettbewerbs.",
        "zh": "他赢了竞赛而获得了奖品。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wenn man Erfolg haben will, muss man erst etwas leisten.",
        "zh": "如果你想成功，必先付出努力。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Verkaufsförderungsaktion unserer Firma war sehr erfolgreich.",
        "zh": "我们公司的促销活动取得了巨大成功。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "B2-12": {
    "examples": [
      {
        "de": "Gib mir mal mein Handtuch.",
        "zh": "帮我递一下毛巾。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich werde noch ein Handtuch bringen.",
        "zh": "我再拿块毛巾过来。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Musik ist die gemeinsame Sprache der Menschheit.",
        "zh": "音乐是人类共通的语言。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Gestern erhielt ich einen in englischer Sprache verfassten Brief.",
        "zh": "昨天，我收到一封用英语写的信。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Eine Programmiersprache ist in Wirklichkeit genau wie eine Fremdsprache.",
        "zh": "编程语言实际上就像一门外语。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Behalten Sie ihn im Blick!",
        "zh": "把他看住。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-01": {
    "examples": [
      {
        "de": "Welcher Gruppe willst du beitreten?",
        "zh": "你想加入哪一组？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "An meinem Kommentar entzündete sich ein Streit in der Gruppe.",
        "zh": "我的评论引起了小组内的争论。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Bist du an Musik interessiert?",
        "zh": "你对音乐感不感兴趣？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Welcher Wochentag war gestern?",
        "zh": "昨天星期几？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ein Armer hat keine Verwandten.",
        "zh": "穷人无亲戚。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er hat ihr Geschenk angenommen.",
        "zh": "他接受了她的礼物。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-02": {
    "examples": [
      {
        "de": "Geld hat sein Leben verändert.",
        "zh": "金钱改变了他的生活。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Musik erfüllt unser Leben mit Freude.",
        "zh": "音乐让我们的生活充满快乐。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ohne Musik wäre das Leben ein Fehler.",
        "zh": "没有音乐的话，生命是错误的。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Als ich sah, dass ein Gemälde fehlte, ließ ich das Museum sofort schließen.",
        "zh": "我如果发现一幅画失窃了，我会立即关闭博物馆。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das Geld habe ich ihm gegeben.",
        "zh": "钱是我给他的。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Kann Kunst die Welt verändern?",
        "zh": "艺术能改变世界吗 ?",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-03": {
    "examples": [
      {
        "de": "Ich suche schon lange nach einer neuen Stelle.",
        "zh": "我找工作已经很久了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Bitte stelle das Radio leiser.",
        "zh": "请把收音机关小声点。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Könnte ich eine Frage stellen?",
        "zh": "我能问个问题吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Was für eine Arbeit suchen Sie?",
        "zh": "你想找哪个方面的工作？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er hat sonderbare Vorstellungen.",
        "zh": "他有着奇妙的想法。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich pfeife auf meinen Lebenslauf.",
        "zh": "我根本不在乎我的简历。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-04": {
    "examples": [
      {
        "de": "Ist es nicht die Höhe, als Freiwilliger auch noch angefeindet zu werden?",
        "zh": "做志工还被人嫌，这不是太冤枉了吗?",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Selbsthilfe ist die beste Hilfe.",
        "zh": "自助是最好的帮助。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Dieser gemeinnützige Verein hat seine erste Spende erhalten.",
        "zh": "这个公益协会收到了第一笔捐款。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Du kannst ihn um Hilfe bitten.",
        "zh": "你可以向他求助。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Gib mir bitte noch eine Gabel.",
        "zh": "请你给我多一把叉子。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wie viele Gabeln brauchen wir?",
        "zh": "我们需要多少把叉子？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-05": {
    "examples": [
      {
        "de": "Es war ein stiller Winterabend.",
        "zh": "这是个静谧的冬夜。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Könntest du denn nun endlich stille sein?",
        "zh": "别说了好吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Wahrheit kann schmerzhafter sein als eine Lüge.",
        "zh": "真相可能比谎言更令人痛苦。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Lüge brachte ihm Ärger ein, als sein Chef die Wahrheit herausfand.",
        "zh": "当他的上司察觉他的谎言，麻烦来了。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich lerne gerne Fremdsprachen.",
        "zh": "我喜欢学习外语。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich lerne sehr gerne Sprachen.",
        "zh": "我喜欢学习语言。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-06": {
    "examples": [
      {
        "de": "Halte diese Plätze für Senioren frei!",
        "zh": "把这些座位留给老人。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Eine Meute Jugendlicher prügelte sich.",
        "zh": "一群年轻人在打架。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der Jugendliche, der spricht, ist mein Bruder.",
        "zh": "那个说话的小孩是我弟弟。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Im Winter rutschen viele Senioren auf Eis aus.",
        "zh": "冬天有很多老人在冰上滑倒。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Jugend ist unsere Hoffnung!",
        "zh": "年轻人是我们的希望啊！",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ein Auto hielt am Haupteingang.",
        "zh": "一辆车在正门口的地方停了下来。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-07": {
    "examples": [
      {
        "de": "Er war glücklich zu hören, dass sie Erfolg gehabt hatte.",
        "zh": "听到她成功的消息，他很高兴。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Erst wenn man die alltäglichen Kleinigkeiten lieben lernt, wird das Leben glücklich.",
        "zh": "热爱生活中的日常琐事，人生才会快乐。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich mag weiße Schokolade lieber als normale.",
        "zh": "比起普通的巧克力，我更喜欢白巧克力。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Wenn du abnehmen willst, solltest du auf Zwischenmahlzeiten verzichten.",
        "zh": "你如果想减肥，就应该减少两餐之间的零食。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Liebe hat doch wohl ein Ablaufdatum?! Oder es gibt so was wie Liebe überhaupt nicht.",
        "zh": "爱情是会过期的吧！？或者爱情这种东西压根就是不存在的。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das ist unsere einzige Chance.",
        "zh": "这是我们唯一的机会。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-08": {
    "examples": [
      {
        "de": "Die jüngsten Fortschritte in der Medizin sind bemerkenswert.",
        "zh": "医学的最新进展颇为显著。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Der wissenschaftliche und technische Fortschritt hat die Menschheit reich gemacht.",
        "zh": "由于科学技术的进步，人类现在很富裕。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er konstruierte einen Roboter.",
        "zh": "他造了一个机器人。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Du hast eine glänzende Zukunft.",
        "zh": "你有光明的未来。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Zukunft sah sehr düster aus.",
        "zh": "前途一片阴暗。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Mein Vater ist Elektrotechniker.",
        "zh": "我父亲是个电子工程师。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-09": {
    "examples": [
      {
        "de": "Banken verlangen höhere Zinsen für Kredite an riskante Kunden.",
        "zh": "银行对风险客户收取较高的贷款利息。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Herr Ober, die Rechnung bitte!",
        "zh": "服务生，买单。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Kauft keine Sachen auf Kredit.",
        "zh": "别赊账买东西。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Ich muss Geld von der Bank holen.",
        "zh": "我需要把钱从银行提出来。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er bekam einen Kredit von der Bank.",
        "zh": "他从银行得到了贷款。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er hat eine Menge Geld auf der Bank.",
        "zh": "他在银行里有大量钱财。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-10": {
    "examples": [
      {
        "de": "Wasser ist geschmacklos, geruchlos und farblos.",
        "zh": "水无味、无臭、无色。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Beethoven war ein großer Musiker.",
        "zh": "贝多芬是一个伟大的音乐家。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Sie hat einen Musiker geheiratet.",
        "zh": "她和一位音乐家结了婚。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Das kann man mit bloßem Auge sehen.",
        "zh": "用肉眼就能看见。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Du kannst die Sterne mit bloßem Auge sehen, und noch besser mit einem Teleskop.",
        "zh": "你可以用肉眼观星，用望远镜的话，还能看得更清楚。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Die Chrysanthemen riechen gut.",
        "zh": "菊花很香。",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-11": {
    "examples": [
      {
        "de": "Ich studiere gerade Ökonomie an der Universität.",
        "zh": "我正在大学里读经济。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Er hat zur Entwicklung der Wirtschaft viel beigetragen.",
        "zh": "他为经济发展作了很多贡献。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Es wird auch die wirtschaftliche Entwicklung der Stadt fördern.",
        "zh": "它也会促进城市的经济发展。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Was ist wichtiger: wirtschaftliche Entwicklung oder Umweltschutz?",
        "zh": "发展经济和保护环境哪一个更重要?",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Reis wächst in warmen Klimaten.",
        "zh": "水稻生长在温暖的气候。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Bist du zum Supermarkt gegangen?",
        "zh": "你去过超市了吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  },
  "C1-12": {
    "examples": [
      {
        "de": "Bei welcher Zeitung arbeiten Sie?",
        "zh": "您在哪间报社工作？",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Diese Woche arbeite ich die ganze Zeit.",
        "zh": "这周我一直在工作。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Mathematik zu lernen kann die Denkweise verändern.",
        "zh": "学习数学能够改变思维。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Es ist unmöglich, in kurzer Zeit Englisch zu lernen.",
        "zh": "不可能短时间内学会英语。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Über Musik zu sprechen ist wie über Architektur zu tanzen.",
        "zh": "用言语探讨音乐就好像用舞蹈议论建筑。",
        "source": "Tatoeba CC BY 2.0 FR"
      },
      {
        "de": "Bist du mit der Arbeit fertig?",
        "zh": "你完成工作了吗？",
        "source": "Tatoeba CC BY 2.0 FR"
      }
    ]
  }
};

function parseGermanCourseUnits(level, raw) {
  return raw.trim().split('\n').filter(Boolean).map((line) => {
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

const GERMAN_COURSE_DATA = {
  sources: [
    "走遍德国 初级 1-3（A1-B1）",
    "走遍德国 中级 1-2 / Mittelpunkt（B2-C1）",
    "德语中高级词汇练习与解析（进阶词汇范围参考）"
  ],
  grammarSlugs: GERMAN_COURSE_GRAMMAR_SLUGS,
  levels: [
    {
      id: "A1",
      title: "Grundlagen",
      chineseTitle: "基础沟通",
      description: "从问候、自我介绍和家庭进入城市、出行、饮食与住房。",
      units: parseGermanCourseUnits('A1', `
1|Guten Tag|问候、自我介绍、国家与数字|Präsens;sein;人称代词;陈述句与疑问句|hallo,Tag,Name,Land,Zahl,heißen,kommen,wohnen,sprechen,sein,Macht,Deutschland,Frau,Stadt,Deutsche,Frauen,Familie,Tage,Alter,Herr,Österreich,Sprache,Staat,Nummer,willkommen,Telefon,vollkommen,Adresse,Hauptstadt,Personal,Marke,bestellen,Koalition,Innenstadt,vorkommen,Nation,Österreicher,national,digital,Mittelalter,Altstadt,begrüßen
2|Bilder aus Deutschland|描述城市、村庄、人物与物品|定冠词与不定冠词;单复数;kein;wissen|Stadt,Dorf,Ort,Mensch,Ding,Haus,Straße,Deutschland,hoch,alt,Leute,Platz,Bild,neu,Stelle,groß,Kirche,Raum,Foto,Region,kleiner,Markt,klein,Gebäude,Bildung,Bau,irgendwo,Westen,Gegend,City,Aufnahme,Brücke,Süden,großartig,Menschheit,Bleibe,Haushalt,Architektur,Neubau,Parkplatz,aufbauen,neulich
3|Meine Familie und ich|家庭、爱好、时间与日常活动|物主冠词;haben;可分动词;情态动词 mögen|Familie,Eltern,Vater,Mutter,Bruder,Schwester,Hobby,Uhr,Woche,Brief,Kinder,Kind,Sohn,Freund,Tochter,Sonntag,Monat,Wochenende,Samstag,Freitag,Ehe,Montag,Mittwoch,Donnerstag,Dienstag,Fan,Oma,Freizeit,Kindheit,Ehefrau,Onkel,Ehemann,heiraten,Schwestern,Opa
4|Der Münsterplatz in Freiburg|城市活动、食品、购物与价格|Akkusativ;brauchen;können;müssen;man|Lebensmittel,kaufen,bestellen,bezahlen,Preis,Café,brauchen,können,müssen,Samstag,Geld,Euro,Europa,wert,Einsatz,Laden,Kauf,Geschäft,sparen,lösen,Fischer,Eis,Einheit,teuer,Zeug,Milch,Brot,Handlung,Zucker,Ei,Eingang,Cent,Center,einkaufen,Gemüse,Käse,Kasse,Zinsen,billig,Börse,Obst,Markt
5|Leute in Hamburg|职业、城市生活、过去与饮食|介词 auf 与 in;Präteritum von haben/sein;für/ohne|Beruf,Arbeit,Stadt,früher,heute,kochen,essen,Leute,haben,sein,arbeiten,laut,Job,Stunde,Mitarbeiter,Firma,Chef,Lehrer,Hotel,Werk,Arzt,Organisation,Zusammenarbeit,Dienst,trinken,wirken,Büro,Küche,Studenten,Tätigkeit,genießen,Gast,tätig,Restaurant,Alltag,Arbeitgeber,Operation,Arbeiter,gegessen,Netzwerk,Kollege,Redaktion
6|Ortstermin Leipzig|安排会面、讲述过去、明信片与简历|Perfekt mit haben/sein;句框|Treffen,planen,Vergangenheit,Postkarte,Jahr,Lebenslauf,kommen,gehen,Uhrzeit,Stadt,nach,durch,Zeit,lange,morgen,Unternehmen,gestern,vorbei,warten,Programm,Besuch,Plan,Minute,Anspruch,Konzept,besuchen,Besucher,Pause,Termin,morgens,Dauer,Planung,Datum,vorhaben,Halbzeit,Jahrgang,Stunde,Freizeit
7|Ein Hotel in Salzburg|酒店、天气、旅行与预订|Perfekt;Dativ;mit + Dativ|Hotel,Wetter,Reise,Zimmer,Rezeption,reservieren,Person,arbeiten,Freizeit,Empfang,Wohnung,Bett,Sonne,Urlaub,Tour,Fahrt,Forschung,reisen,kalt,warm,Dusche,Raum,Gast,Personal
8|Projekt Nürnberg|城市方位、服装、颜色与项目展示|双向介词;welch-;wollen;dürfen|Straße,Platz,Orientierung,Kleidung,Farbe,Größe,Gedicht,Projekt,Stadt,Richtung,gegen,links,rechts,Karte,Ecke,Schuhe,Einrichtung,Hose,runden,Steuer,Mini,Format,Kleid,Jacke,Nummer,Parkplatz
9|Basel im Dreiländereck|城乡比较、交通、工作与新闻|比较级与最高级;Dativ 介词;Dativ 人称代词|Stadt,Land,Verkehr,Arbeit,Sprache,Zeitung,vergleichen,argumentieren,Bahn,Grenze,Auto,fahren,Vergleich,Verbindung,Linie,Zug,Wagen,relativ,Autor,Flughafen,näher,Bus,Bahnhof,Zugang,Anhänger,Fahrzeug,Fahrrad,Station,Flugzeug,Autobahn,Autofahrer,Dorf,Hauptstadt,Innenstadt,Altstadt
10|Wohnen in Bochum|住房、购物、庆祝活动与表达意见|情态动词 Präteritum;dass/weil 从句|Haus,Wohnung,Lebensmittel,Fest,Meinung,Vergangenheit,wohnen,organisieren,müssen,wollen,hören,Bad,Tisch,feiern,Garten,Befinden,Nachbarn,Keller,Festival,Feier,Miete,äußern,Kindergarten,Stuhl,mieten,Kühlschrank,Zimmer,Küche,Haushalt
      `)
    },
    {
      id: "A2",
      title: "Alltag und Regionen",
      chineseTitle: "日常与地区",
      description: "扩展旅行、健康、工作、通信、文化和跨地区生活场景。",
      units: parseGermanCourseUnits('A2', `
11|Frankfurt an der Oder|大学、住房、家具、广告与周末活动|Dativ 宾语;Imperativ;情态动词 sollen|Universität,Wohnung,Möbel,Anzeige,Wochenende,Information,Kurs,lesen,schreiben,sollen,lernen,Informationen,Studium,Werbung,Prüfung,Unterricht,Lehre,Bibliothek,Fach,Note,Propaganda,studieren,kennenlernen,unterschreiben,texten,Kandidat,Student,Seminar,Mediziner,Semester,Fakultät,Überprüfung,Display,Vorlesungen,Diplom,Plakat,Studenten
12|Eine Reise nach Berlin|建筑方位、历史事件、文化与季节|双向介词;wenn 从句;时间表达|Reise,Hauptstadt,Gebäude,Kultur,Geschichte,Datum,Jahreszeit,Lied,orientieren,verstehen,Sommer,Saison,Schloss,Winter,Herbst,Führung,Museum,Einführung,Durchführung,Ausführung,historisch,Frühling,Historiker,Antike,Denkmal,Aufführung,Reisende,Besuch
13|Europastadt Aachen|祝福、风景、竞赛和体育报道|形容词词尾;Genitiv;以 W-Wort 或 ob 引导的从句|Glückwunsch,Landschaft,Zeitung,Wettbewerb,Sport,Gewinner,Europa,fragen,berichten,beschreiben,Spiel,Beispiel,Spieler,gewinnen,Verein,Nachrichten,Mannschaft,Sieg,Bericht,verlieren,kämpfen,Wunsch,melden,Sieger,Stadion,Turnier,Vereinigung,vermitteln,Meldung,Spieltag,Meisterschaft,Nationalmannschaft,Sportler,trainieren,Spielzeug,Spielzeit,Pressemitteilung,Weltmeisterschaft,sportlich,Siegel,Tageszeitung,Heimspiel
14|Zu Besuch in Dresden|预约、身体护理、医生建议与历史|不定冠词后的形容词词尾;反身代词;sollte|Termin,Körper,Arzt,Rat,Museum,Geschichte,besuchen,planen,beschreiben,pflegen,Wohl,Kopf,Fußball,Angebot,Handy,Auge,Fuß,Praxis,krank,Gesundheit,angeboten,Handel,Krankheit,Vorschlag,gesund,Tipp,Verfassung,angebracht,Schmerz,Ohr,Rathaus,raten,untersuchen,Doktor,Erkrankung,Handbuch,Handwerk,leeren,Rate,gesunden,Fieber,Handball
15|In Wien zu Hause|实习报告、愿望、礼貌与住房文化|并列连词;Konjunktiv II;无冠词形容词词尾|Praktikum,Wunsch,Höflichkeit,Reise,Österreich,Haus,Brief,Kaffee,bitten,fragen,Glaube,glauben,Antwort,verlassen,Zeichen,antworten,Vertrauen,wünschen,unglaublich,Anlage,überzeugen,eingeladen,Botschaft,Engagement,Einladung,Signal,zugelassen,Kredit,danken,Überzeugung,eingegangen,trauen,Gutschein,Informatik,Gastgeber,nachkommen,Gruß,einladen,Haustür,Ampel,Zeile,Kult
16|Eine E-Mail aus Zürich|银行、约会、企业沟通与休闲|zu + Infinitiv;介词宾语;代副词|Bank,Verabredung,Unternehmen,Kommunikation,Firma,Land,Nachricht,Wissen,Freizeit,Gast,bar,Konto,Versicherung,anrufen,Agentur,Medium,Reporter,Sparkasse,Volkswagen,Krankenkassen,Kreditkarte,Gesellschafter,Geld,Nachrichten,Karte,Telefon,sparen,Zinsen,Kredit,Gastgeber
17|Schwabenmetropole Stuttgart|发明、职业培训、分歧与人物传记|关系从句;情态动词转述;n-Deklination|Erfindung,Erfinder,Ausbildung,Meinung,Besonderheit,Lebenslauf,Familie,Region,informieren,erzählen,Technik,entwickeln,Maschine,Bezirk,ausgebildet,Feedback,Werkzeug,Techniker,widersprechen,Aussprache,bemerken,hören,Befinden,Gegend,äußern
18|Eine Firma in Hannover|企业历史、求职、同事交流与电脑|Präteritum;不可分动词;als/wenn;obwohl|Beruf,Firma,Bewerbung,Kollege,Computer,Vergangenheit,Stadt,Arbeit,Gespräch,regelmäßig,Internet,reden,Erfahrung,Vertrag,Leiter,Abteilung,User,Unterhaltung,unterhalten,Gehalt,einstellen,Kumpel,Berufung,bewerben,Laptop,Datei,Baustelle,Bewerber,Kollegin,Arbeitszeit,kündigen,Tastatur,Mitarbeit,Zeugnis,Tankstelle,Stelle,Mitarbeiter,Zusammenarbeit,Arbeitgeber,Arbeiter,Versicherung,Volkswagen
19|An der Nordseeküste|自然体验、人口、低地德语与海洋故事|bevor/seit/während;可分动词 Präteritum|Küste,Insel,Meer,Bevölkerung,Natur,Erlebnis,Sprache,Getränk,Geschichte,Sturm,natürlich,Schiff,Boot,Kanal,Strand,gezwungen,Hafen,Zoll,Golf,Welle,Phänomen,Marine,Flotte,Ostsee,Getränke,Beach,Bucht,Halbinsel,naiv,Naturschutz,Nordsee,Ozean,Flughafen,Fischer,Plakat,Aussprache
20|Im Saarland|移民、意外、车辆、保险与人物经历|brauchen + zu;wenn 条件句;damit;um ... zu|Ausländer,Unfall,Auto,Versicherung,Lebenslauf,Sprache,Einwanderung,Familie,Region,Teil,sicher,Polizei,helfen,Geschehen,Krankenhaus,Fahrer,retten,Teilnahme,sichern,Fremde,Führerschein,Radfahrer,Unglück,Berichterstattung,Sicherung,Vorfall,Verkehrsunfall,Krankenversicherung,Autorität,Krankenkasse,versichern,Autor,melden,Autobahn,Autofahrer,Krankenkassen
      `)
    },
    {
      id: "B1",
      title: "Selbstständig handeln",
      chineseTitle: "独立表达",
      description: "围绕社会、媒体、教育、旅行和考试任务提升叙述与论证能力。",
      units: parseGermanCourseUnits('B1', `
21|Münchner Ansichten|生活质量、节庆、统计、警情与剧本|比较级形容词词尾;被动态;语序|Lebensstandard,Lebensqualität,Vergleich,Oktoberfest,Statistik,Polizei,Drehbuch,Reihenfolge,Feier,berichten,Medien,Interview,fernsehen,Radio,Sendung,Zuschauer,Publikum,Leser,Zeitschrift,Fernseher,senden,Journalist,veröffentlichen,Rundfunk,Absage,Kleinanzeigen,Tagesschau,Slogan,Ansage,Fernsehsender,Radiosender,Hörspiel,Programmierer,Programm,Bericht,Werbung,Nachricht,Anzeige,Redaktion,Propaganda,texten,Medium
22|Pontresina|健康、自然疗法、农业、冬季运动与推测|情态表达;情态动词被动态;成对连词|Gesundheit,Medizin,Bauer,Arbeit,Winter,Vermutung,Argument,Ski,Zentrum,Berg,Schule,Klasse,Schüler,schulen,Hochschule,prüfen,geprüft,Grundschule,Erziehung,Lehrerin,Abitur,Ferien,Weiterbildung,Monitor,unterrichten,Zensur,History,Realschule,Pädagogik,Schülerin,Erzieher,Studiengang,Fachleute,Fortbildung,Fachmann,erziehen,Fachhochschule,Hauptschule,Berufsschule,Berufsausbildung,Gebildete,Internat
23|Eindrücke aus Kärnten|少数群体、民主、宗教、节庆与传统|情态动词 Perfekt;je ... desto;不定代词|Minderheit,Demokratie,Brauch,Religion,Fest,Foto,Region,Tradition,Parlament,erzählen,Lage,Luft,Erde,Schutz,Energie,Wald,Müller,Umgebung,schützen,Strom,Umwelt,Umfeld,Klima,wahren,Müll,geschützt,bewahren,bedeckt,Datenschutz,Klimawandel,Klimaschutz,Umweltschutz,Abfall,Arbeitsbedingungen,Luftwaffe,Wasserstoff,Hochwasser,Milieu,Schütz,Tierschutz,Witterung,Denkmalschutz
24|Menschen in Jena|老年生活、体育、占星和人物故事|Genitiv 介词;während/wegen;trotz;werden + Infinitiv|Alter,Sport,Astrologie,Geschichte,Planetarium,Stadt,Aktivität,erzählen,vermuten,lesen,Bewegung,Behandlung,bewegen,Gewicht,Schlaf,Stress,Therapie,Ernährung,rauchen,Kampagne,Arena,Springer,Prognose,Trikot,Gleichgewicht,heilen,Psychiatrie,Diät,Attacke,Kreislauf,Spielplatz,Turner,Leichtathletik,Psychotherapie,Übergewicht,Sportart,Vorsorge,Motorsport,Sportwagen,Anfall,Wrack,verbrauchen
25|Den Rhein entlang|消费习惯、图表、莱茵故事与口试|名词化形容词;Partizip I/II 作形容词|Rhein,Gewohnheit,Grafik,Veranstaltung,Geschichte,Prüfung,Wasser,Schiff,Romantik,argumentieren,Team,Erfolg,Aufgabe,Verantwortung,Karriere,Vorstellung,verpflichtet,Pflicht,Arbeitnehmer,schuldig,Verpflichtung,Arbeitsmarkt,beruflich,selbstständig,Haftung,Stellenwert,verpflichten,Geschäftsstelle,Berufsleben,Berufserfahrung,Vorstellungsgespräch,Dienststelle,Job,Projekt,Chef,Gehalt,Berufung,Bewerbung,Baustelle,Praktikum,Tankstelle,Berufsschule
26|Im Kanton Bern|瑞士、新闻、音乐、山地救援与求助|间接引语;Konjunktiv I;关系代词 was 与 Genitiv|Land,Zeitung,Musik,Berg,Rettung,Dank,Hilfsorganisation,Bericht,Not,helfen,Ziel,Ausland,erleben,Flug,Abenteuer,Tourismus,Ticket,Ausflug,buchen,Gepäck,eingetroffen,Urlauber,besichtigen,Einreise,Bahnsteig,Flugplatz,Tourist,Bahn,Urlaub,Bahnhof,Anhänger,Flugzeug,Ferien,Reisende
27|Urlaub am Bodensee|度假、旅馆、自行车、岛屿与旅行经历|方位副词;名词化形容词;过去时 Konjunktiv II|Urlaub,See,Pension,Fahrrad,Insel,Erlebnis,vergleichen,Nachricht,Reise,erzählen,Gesellschaft,Politik,Regierung,Wahl,Partei,Politiker,Rechte,Bürger,wählen,Ordnung,Gesetz,Freiheit,Öffentlichkeit,politisch,Gesetze,Wähler,Gemeinschaft,Status,Nazi,diskutieren,sozial,Wahlkampf,Kanzler,gesetzlich,Sozialismus,Bürgerkrieg,legal,Nationalsozialismus,Jura,Grundgesetz,Meinungsfreiheit,staatlich
28|Lernen in Graz|广告、学校、报名、考试与书面表达|es 的功能;Zustandspassiv;werden 的功能|Anzeige,Brief,Veranstaltung,Schule,Prüfung,Kommunikation,Lernen,Universität,anmelden,organisieren,Umzug,Balkon,Schlafzimmer,Mieter,Nachbar,Nachbarschaft,Vermieter,Auszug,Heizung,Zimmermann,Reparatur,umziehen,Apartment,Wohnungsbau,Hausarbeit,Kaution,Zins,Kinderzimmer,Bad,Vertrag,Strom,Nachbarn,Einrichtung,Miete,Möbel
29|Medienstadt Mainz|媒体、印刷、广告、报刊与一分钟演讲|Plusquamperfekt;nachdem;welch- 与 was für ein|Medien,Zeitung,Erfinder,Druck,Anzeige,Rede,Meinung,Bewegung,Stadt,lesen,Film,Buch,Kunst,Künstler,Literatur,Theater,Ausstellung,Roman,Kino,Bühne,Konzert,Schauspieler,Musiker,filmen,Regisseur,Schauspielerin,Jazz,Künstlerin,Buche,Trailer,Gastronomie,musikalisch,Kunstwerk,Atelier,Kunststoff,Produzent,Reportage,künstlerisch,Buchstabe,kulturell,Filmemacher,Barock
30|Au-pair in Göttingen|求职面试、家庭、住房、出游与口试|Dativ/Akkusativ 代词顺序;语气小品词;einander|Vorstellungsgespräch,Haushalt,Wohnen,Ausflug,Prüfung,Foto,Stadt,Kind,diskutieren,planen,Ergebnis,Text,erklären,Auftrag,Erklärung,Aussage,Mission,Vortrag,Auseinandersetzung,Angabe,Fazit,Präsentation,Zusammenfassung,Anleitung,nachweisen,angeben,lehren,rechtfertigen,Argumentation,begründen,Anmerkung,Gliederung,Anweisung,aufklären,interpretieren,motivieren,detailliert,Notiz,Wahlergebnis,Rechenschaft,Deutung,zusammenfassen
      `)
    },
    {
      id: "B2",
      title: "Argumentieren und kooperieren",
      chineseTitle: "论证与协作",
      description: "训练较长对话、系统论证、协作沟通和复杂书面表达。",
      units: parseGermanCourseUnits('B2', `
1|Reisen|旅行选择、移动方式、计划与观点辩护|因果主从句;句框;连接副词|Reise,Urlaub,Mobilität,Dorf,Angebot,Bedürfnis,Planung,Lösung,Aussicht,Argument,Unterkunft,Verkehr,unterwegs,fliegen,Ansicht,Ansatz,Ankunft,wandern,Zugriff,Aspekt,Route,Abfahrt,Rucksack,Standpunkt,entworfen,Wanderung,Kombi,Router,Wanderer,Nahverkehr,radfahren,überfahren,aufsteigen,Ausfahrt,Verkehrsmittel,Anreise,Einfahrt,Raumfahrt,Panne,planmäßig,Kreuzfahrt,Geschlechtsverkehr
2|Einfach schön|审美、身体、健康、意见调查与特别时刻|句中时间/原因/情态/地点成分|Schönheit,Körper,Gesundheit,Augenblick,Wort,Gefühl,Diskussion,Vermutung,Ratgeber,Ergebnis,Fragebogen,Interview,schön,Form,Gesicht,Schöne,schönen,perfekt,fühlen,Haut,Wirkung,Modell,Moderne,Stil,Amerika,Erscheinen,Gefühle,Figur,Pflege,süß,Haar,Umfrage,Mode,spüren,fein,lecker,wunderschön,Stille,Wahrnehmung,Moderator,Fitness,empfinden
3|Nebenan und Gegenüber|邻里、争执、倾听、调解与跨文化经验|对立/选择/情态从句;派生形容词|Nachbar,Nachbarschaft,Streit,Konflikt,Zuhören,Diskussion,Lösung,Telefon,Erfahrung,Garten,Grund,Versöhnung,Begriff,Verständnis,Auflösung,Verstand,verständlich,Fassung,Erkenntnis,Intelligenz,streiten,Auffassung,Hirn,erledigen,Toleranz,Lärm,Kündigung,begreifen,Rücksicht,Vermittlung,Beschwerde,fremd,erfassen,Kompromiss,Beendigung,einsehen,verwickelt,unverständlich,Erfassung,Hausfrau,Missverständnis,Einverständnis
4|Dinge|物品描述、价值、产品展示与消费|形容词词尾;关系从句 mit was/wo(r)-|Gegenstand,Wert,Beschreibung,Produkt,Präsentation,Handel,Ordnung,Besitz,Konsum,sammeln,kaufen,verkaufen,Artikel,Sache,gelten,Inhalt,Material,Produktion,Erinnerung,Tatsache,Formel,Besitzer,darstellen,Hauptsache,Objekt,Dreck,wertvoll,Wertung,Formation,Schrott,Tagesordnung,Formular,Geltung,Anschaffung,würdig,schildern,Mehrwert,Überlieferung,Hautfarbe,wertlos,Warentest,Neuordnung
5|Kooperieren|协作、谈判、对话、婚姻与共同计划|二项连接词;Konjunktiv II;文本照应|Zusammenarbeit,Verständigung,Verhandlung,Kompromiss,Dialog,Monolog,Verhalten,Reaktion,Scheidung,Ehe,Plan,Konflikt,gemeinsam,Partner,miteinander,Süd,Kooperation,Vereinbarung,Partnerschaft,Planet,verhandeln,Unterscheidung,Ehepaar,zusammenarbeiten,Partnerin,mitspielen,zusammenleben,Mitwirkung,Genossenschaft,Zusammenstellung,Absprache,Koordination,Selbstvertrauen,Gemeinsamkeiten,kooperieren,Hörbuch,Gesprächspartner,Talkshow,mitwirken,Geschäftspartner,Planer,miterleben
6|Arbeit|职业角色、求职、全球化与工作生活|名词动词搭配;被动态;复杂时态与 Konjunktiv II|Arbeit,Beruf,Bewerbung,Rolle,Globalisierung,Anzeige,Anweisung,Kollege,Büro,Karriere,Erfahrung,Vertrag,Betrieb,Lohn,Schicht,angestellt,Arbeitsplatz,Journalismus,Workshop,Rechtsprechung,Mitarbeiterin,Arbeitsgemeinschaft,Holding,Arbeitslose,Arbeitstag,Sekretär,Öffentlichkeitsarbeit,Überstunden,Aktiengesellschaft,haushalten,Fluggesellschaft,Betriebsrat,Kompanie,Arbeitsweise,Lehramt,Doktorarbeit,Handarbeit,Kaufhaus,Arbeitende,Dolmetscher,Arbeitsstelle,Ehrenamt
7|Natur|自然、灾害、克隆、营养和植物疗法|间接引语;虚拟语气;被动态替代形式|Natur,Jahreszeit,Katastrophe,Klon,Ernährung,Pflanze,Bericht,Forschung,Umwelt,Vorteil,Nachteil,Medizin,Boden,Baum,Tier,Landwirtschaft,Rasse,Erdbeben,Heilung,Tierheim,Dorn,Tierarzt,Baumwolle,Baumarkt,Jahreszeiten,ökologisch,Vegetation,Fußboden,physisch,Wasserfall,Grundwasser,Dachboden,Luftfahrt,Mineralwasser,Naturwissenschaft,Naturschutzgebiet,Ansammlung,Tierwelt,Luftdruck,moderat,Wasserkraft,Leitungswasser
8|Wissen und Können|知识、能力、学习、记忆和终身教育|同义转述;Modalsätze;finale Nebensätze|Wissen,Können,Lernen,Gedächtnis,Bildung,Forschung,Musik,Vortrag,Definition,Fähigkeit,Erfahrung,Weiterbildung,langen,Methode,Vermögen,Kenntnis,Kompetenz,fähig,Kapazität,unfähig,Produktivität,kompetent,Unfähigkeit,Intellektuelle,Akademiker,gerichtlich,Fachwissen,Mittelschule,schöpfen,Gesamtschule,Objektivität,Begabung,informativ,Intuition,Wettbewerbsfähigkeit,bankrott,imstande,Bildungssystem,Schulbildung,pädagogisch,Erwachsenenbildung,Schulsystem
9|Gefühle|情绪、非语言表达、故事与艺术体验|名词/动词/形容词介词搭配;主观用法情态动词|Gefühl,Emotion,Verstand,Bedeutung,Situation,Erzählung,Korrespondenz,Kunst,Empfindung,Reaktion,Ausdruck,Stimmung,Liebe,Angst,Scheiße,Freude,lustig,Hoffnung,Mut,Spannung,sauer,Laune,Wut,Panik,fürchten,Trauer,Hit,Grauen,ausdrücken,emotional,aussprechen,Enttäuschung,unzufrieden,formulieren,Mitgefühl,Vorgeschichte,Vorfreude,Vorliebe,Lebensfreude,Kunstgeschichte,Gesichtsausdruck,Volksverhetzung
10|Arbeiten international|海外工作、表格、合同、机关与文化适应|Partizip I/II 作定语;ohne zu/ohne dass|Ausland,Organisation,Telefon,Formular,Vertrag,Behörde,Kultur,Anpassung,Plan,Bewerbung,Mietvertrag,Arbeitsplatz,Amt,Verwaltung,international,Antrag,entsprechen,Aufenthalt,gewachsen,Abwehr,anpassen,Instanz,Anstalt,Organ,Referent,Terminal,fügen,vertraglich,Visum,Telefonat,Aufenthaltsort,Kulturgeschichte,Mobiltelefon,auswandern,Weltkulturerbe,Sitte,Arbeitsvertrag,Tarifvertrag,Funktionär,Kulturgut,Legislative,Telefonbuch
11|Leistungen|成功、失败、自雇、教育和奖项|连续/让步连接词;演讲与读者来信结构|Leistung,Erfolg,Misserfolg,Gründung,Schule,Preis,Rede,Motivation,Intelligenz,Wettbewerb,Ziel,Firma,Chance,gründen,erfolgreich,leisten,Niederlage,Konkurrenz,scheitern,Auszeichnung,Rekord,gelingen,Resultat,klappen,Verlierer,gewährleisten,Rückgang,Dienstleistung,rückgängig,Gegenleistung,Anstrengung,Preisgeld,Gewährleistung,Aufpreis,Erfolgsgeschichte,Flop,Hilfeleistung,Errungenschaft,schiefgehen,Abschlussprüfung,Fiasko,Fachschule
12|Sprachlos|闲谈、肢体语言、音乐、投诉和表达策略|关系从句;指代副词;概括性关系从句|Sprache,Smalltalk,Konversation,Hand,Fuß,Musik,Beschwerde,Sprichwort,Kommunikation,Geste,Mimik,Ironie,Blick,Ton,schweigen,Überblick,Mitteilung,Einblick,Ausblick,Tonne,Muttersprache,Handtuch,Handvoll,Fremdsprache,Germanistik,sprachlich,Gestein,sprachlos,Popmusik,Linguistik,Tonfall,Körpersprache,Blickfeld,Sprachwissenschaft,Umgangssprache,Handschuh,Lichtblick,Musikverein,Durchblick,Programmiersprache,Terminologie,Kammermusik
      `)
    },
    {
      id: "C1",
      title: "Präzision und Diskurs",
      chineseTitle: "精确表达",
      description: "面向学术、职业和公共议题，训练隐含意义、复杂文本与正式论述。",
      units: parseGermanCourseUnits('C1', `
1|Netzwerke|个人网络、社群、营销、访谈和网络文化|名词动词搭配;Genitiv 属性;同位语|Netzwerk,Gemeinschaft,Marketing,Interview,Computer,Austausch,Individualität,Gruppe,Pressekonferenz,Standpunkt,Kommentar,Beziehung,Sex,welcher,interessiert,Kontakt,Bezug,Verhältnis,angenommen,Beziehungen,Plattform,Chat,Kontext,ausmachen,Zielgruppe,verwandt,Bindung,relevant,austauschen,Arbeitsgruppe,Relation,Abstammung,Vernetzung,Webcam,Einbeziehung,Geometrie,Stecker,vernetzt,Symposium,Bruderschaft,Altersgruppe,Festnetz
2|Alles Kunst|艺术定义、治疗、市场、艺术家与人生选择|连接词意义;转述立场;语体分析|Kunst,Therapie,Geld,Künstler,Leben,Museum,Schauspiel,Musik,Kolumne,Erfahrung,Definition,Gemälde,Galerie,Werkstatt,Lebensjahr,Satire,kreativ,Lebensraum,Privatleben,Lebenszeit,Lebensstil,Geldbörse,Therapeut,Lebensende,Chemotherapie,Geldgeber,kunstvoll,Choreographie,Lebensform,Gage,Jugendstil,Graphik,Lebenserfahrung,Werkstoff,Kunstausstellung,Sachbuch,Physiotherapie,Nachtleben,Kampfkunst,Kunststück,Alltagsleben,Musikszene
3|Suchen, finden, tun|职位搜索、能力、评估中心、劳动合同与谈判|国际名词复数;Partizipialkonstruktionen;扩展分词|Suche,Stelle,Kompetenz,Vorstellung,Arbeitsvertrag,Verhandlung,Anzeige,Ausbildung,Qualifikation,Lebenslauf,Bewerbung,Arbeitstag,Auswahl,Mitgliedschaft,Anzeiger,Kandidatur,Personalien,Qualifizierung,Beratungsstelle,Kaufvertrag,Inkompetenz,Grundausbildung,Liquidität,Schwachstelle,Vertragspartner,befähigt,Sucher,Medienkompetenz,Unfallstelle,Zulässigkeit,Tragfähigkeit,Gerichtsverhandlung,wehrlos,Belastbarkeit,Fachgruppe,Kontrakt,Zweigstelle,leistungsfähig,befähigen,Habilitation,Monatsgehalt,habilitieren
4|Im Einsatz|志愿服务、协会、援助、捐赠与公共参与|不可分前缀动词;Genitiv 介词|Engagement,Ehrenamt,Verein,Hilfe,Organisation,Spende,Frieden,Preisträger,Tätigkeit,Förderung,Freiwillige,Empfänger,Unterstützung,Liga,Verband,Struktur,fördern,freiwillig,Akademie,wenden,Mithilfe,Gabe,Gewebe,Organismus,Spender,Freiwilliger,Nachhilfe,Sportverein,Beihilfe,verhelfen,Sozialhilfe,behilflich,Monopol,Miliz,Selbsthilfe,Assoziation,Beistand,Entwicklungshilfe,Jugendhilfe,Bürgerinitiative,Hausbesitzer,Geburtshilfe
5|Sagen und Meinen|禁忌、反讽、谎言、性别语言与惯用表达|无主句被动态;语气小品词;情态动词被动态从句|Tabu,Kommunikation,Ironie,Lüge,Korrespondenz,Redewendung,Geschlecht,Sprache,Täuschung,Stil,Dialog,Anspielung,Wahrheit,Gebrauch,meiden,andeuten,stilistisch,Sprachkurs,Amtssprache,Landessprache,Erfahrungsaustausch,Informationsaustausch,Wechselstrom,Germanist,Fremdheit,stilisieren,Literatursprache,Höflichkeitsform,einsprachig,Austausch,Stille,austauschen,Gewebe,Muttersprache,Fremdsprache,Germanistik,sprachlich,Höflichkeit,Symposium,Linguistik,Körpersprache,Sprachwissenschaft
6|Jung und Alt|人口、代际、青年语言与创意文本|Futur I/II;指示冠词与代词|Jugend,Alter,Bevölkerung,Generation,Sprache,Interview,Entwicklung,Erfahrung,Konflikt,Text,Jugendliche,Senior,Rente,Migranten,Senioren,Nachwuchs,alternativ,Zeitalter,Weiterentwicklung,Erzeugung,Jugendamt,Stadtentwicklung,Kollision,Textilien,altern,jugendlich,Altersklasse,Zivilbevölkerung,Gesamtbevölkerung,Haupteingang,Durchschnittsalter,Altersklassen,Altersheim,Menschenhandel,volljährig,Jugendherberge,Weltbevölkerung,Volkszählung,Bevölkerungswachstum,Bevölkerungsdichte,Altertum,Altersgrenze
7|Viel Glück|幸福、爱情、放弃、人生故事与文学改写|绝对比较级;名词化;属格文学表达|Glück,Liebe,Verzicht,Schokolade,Lebensgeschichte,Unterhaltung,Lebenslauf,Erzählung,Fortsetzung,Genuss,Erfolg,Erfahrung,glücklich,verzichten,verliebt,aufgeben,Sehnsucht,begraben,Zufriedenheit,aufräumen,selig,Liebesgeschichte,preisgeben,Resignation,Liebeserklärung,Glücksfall,unvergessen,Liebespaar,krönen,glimpflich,beglücken,Wonne,resignieren,fallenlassen,abstrahieren,abschwören,Wohl,Chance,erfolgreich,genießen,gelingen,klappen
8|Neue Welten|工业变革、机器人、新医学与未来发明|不定代词作代词;衔接手段;科技语体|Technik,Entwicklung,Erfindung,Roboter,Medizin,Forschung,Zukunft,Industrie,Zelle,Intelligenz,Innovation,Haushalt,künftig,technisch,Support,Fortschritt,Fächer,erfinden,medizinisch,Elektrotechnik,Automatisierung,Fachkräftemangel,Fertigkeiten,Gentechnik,Präparat,Fachzeitschrift,Medizintechnik,Industrieller,Rüstungsindustrie,Spezifikation,Hydraulik,gentechnisch,Staatshaushalt,Auswahlverfahren,Biotechnologie,Lebensmittelindustrie,Wirtschaftsforschung,Messtechnik,Marktforschung,Zahnmedizin,Bevölkerungsentwicklung,Telefonzelle
9|Geld|货币、银行服务、投诉、消费和谈判|条件句 mit sollen;要求句;间接引语|Geld,Währung,Bank,Dienstleistung,Kunde,Kündigung,Kauf,Verbraucher,Verhandlung,Kredit,Rechnung,Beratung,dienen,Server,Dienstleistungen,Ober,Kaufmann,Investition,Diener,Verbrauch,Fräulein,Kellner,Schalter,Bedienung,Schilling,Dienstleister,Volksbank,Rettungsdienst,Zentralbank,Bundesbank,konsumieren,Kaufkraft,Raiffeisenbank,Girokonto,Dienstzeit,Sicherheitsdienst,Geldpolitik,Zinssatz,Weltbank,Zahlungsmittel,Postbank,Volkskunde
10|Sinne|视觉、嗅觉、味觉、触觉、噪声与超感知|动词名词化;同义转述;正式定义|Sinn,Sehen,Riechen,Schmecken,Fühlen,Wahrnehmung,Duft,Geschmack,Haut,Lärm,Musik,Auge,Nase,Geruch,sinnlos,Hauch,optisch,spürbar,Aufsehen,bewusstlos,schalen,Gestank,Sensibilität,Ohrfeige,geschmacklos,visuell,Ohrwurm,betäubt,verspüren,aufspüren,Augenarzt,Empfindlichkeit,Beigeschmack,wahrnehmbar,absterben,fühlbar,überkommen,nachspüren,Musiker,spüren,Ohr,empfinden
11|Globalisierung heute|国际职业、经济、气候变化与公共讨论|名词动词搭配;图表论证;Adverbien/Adjektive|Globalisierung,Karriere,Wirtschaft,Klima,Wandel,Entwicklung,Schutz,Vortrag,Grafik,Diskussion,Welthandel,Umwelt,Finanzen,finanziell,wirtschaftlich,Supermarkt,Konzern,Marktplatz,besprechen,Ökonomie,Marktwirtschaft,Volkswirtschaft,Wirtschaftspolitik,Flohmarkt,ökonomisch,Wirtschaftskrise,Wirtschaftlichkeit,Wirtschaftswachstum,Forstwirtschaft,Brandschutz,Weltwirtschaft,Ökonom,Podiumsdiskussion,Wohlfahrt,Grafikkarte,Rezession,Grafiker,Wohnungsmarkt,Rechtsschutz,Schwarzmarkt,Betriebswirtschaftslehre,Lebenssituation
12|Wandel|价值变化、教育转型、时间、节奏与社会变迁|代词功能;可分/不可分动词;文本结构|Wandel,Wert,Lernen,Veränderung,Zeit,Rhythmus,Arbeit,Gesellschaft,Original,Tanz,Erziehung,Zukunft,ändern,Zeitpunkt,Prozess,verändert,Zeitraum,Änderung,verändern,diverse,traditionell,Architekt,Soziologie,Bundespräsident,Umwandlung,Zeitplan,gesellschaftlich,Prominente,Sozialdemokratie,variieren,Sozialwissenschaften,Zeitgeist,Zivilgesellschaft,Umbruch,Unterwelt,allerhand,asozial,Sozialversicherung,Verwandlung,Zeitreise,Zwangsarbeit,Wertschöpfung
      `)
    },
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GERMAN_COURSE_DATA;
}

// 统一注册：消费方经 LangLoader.data(lang, module) 取数（lib/lang-loader.js）
(globalThis.DIM_DATA = globalThis.DIM_DATA || {});
(globalThis.DIM_DATA.course = globalThis.DIM_DATA.course || {}).de = GERMAN_COURSE_DATA;
