// French verb collocations (verb + governed preposition + complement).
// Mirrors the Italian data/verb-collocations-data.js shape exactly:
//   { meta: { totalVerbs, totalExamples, prepositionOrder },
//     verbs: { <slug>: { display, prepositions: { <prep>: ["<fr> <zh>"] }, prepositionOrder } },
//     prepositions: { <prep>: [<slug>] } }
// Additive fields (ignored by the current renderer): meta.language, meta.sources,
//   verbs[x].sources (per-example provenance), verbs[x].notes (à/de contrast notes),
//   verbs[x].nounCollocations (verb + noun collocations).
// Sources: hand-authored government table + Tatoeba (CC BY 2.0 FR) + Lexique 3.83 (CC BY-SA 4.0).
// Rebuild: python3 scripts/build_french_extras.py
// Total verbs: 777 / Total examples: 2878

const FRENCH_COLLOCATIONS_DATA = {
  "meta": {
    "totalVerbs": 777,
    "totalExamples": 2878,
    "prepositionOrder": [
      "à",
      "de",
      "en",
      "par",
      "pour",
      "sur",
      "dans",
      "avec",
      "contre",
      "vers",
      "chez",
      "entre"
    ],
    "language": "french",
    "sources": [
      {
        "id": "curated",
        "label": "本项目自编动词支配表（依据标准法语语法）",
        "license": "project-authored"
      },
      {
        "id": "direct",
        "label": "Tatoeba fra-cmn 直接对译",
        "license": "Tatoeba CC BY 2.0 FR"
      },
      {
        "id": "indirect",
        "label": "Tatoeba fra→eng→cmn 间接对译",
        "license": "Tatoeba CC BY 2.0 FR"
      },
      {
        "id": "lexique",
        "label": "Lexique 3.83（词元与频率）",
        "license": "Lexique 3.83 CC BY-SA 4.0"
      }
    ],
    "generatedBy": "scripts/build_french_extras.py"
  },
  "verbs": {
    "abaisser": {
      "display": "abaisser",
      "prepositions": {
        "à": [
          "Je ne m'abaisserai pas à son niveau. 我不会堕落到他那个地步。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "3850",
            "zh": "503065",
            "eng": ""
          }
        ]
      }
    },
    "abandonner": {
      "display": "abandonner",
      "prepositions": {
        "par": [
          "Ils ont été abandonnés par leur mère. 她们被母亲抛弃了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "486840",
            "zh": "6097977",
            "eng": "307534"
          }
        ]
      }
    },
    "abattre": {
      "display": "abattre",
      "prepositions": {
        "par": [
          "L'arbre fut abattu par le vent. 树被风吹倒了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "2285959",
            "zh": "350670",
            "eng": "43780"
          }
        ]
      }
    },
    "abonder": {
      "display": "abonder",
      "prepositions": {
        "en": [
          "Le pétrole abonde en Arabie. 阿拉伯盛产石油。",
          "Notre pays abonde en produits finis. 我国物产丰富。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "790301",
            "zh": "790081",
            "eng": "67424"
          },
          {
            "kind": "indirect",
            "fr": "533677",
            "zh": "2188413",
            "eng": "29174"
          }
        ]
      }
    },
    "abonner": {
      "display": "abonner",
      "prepositions": {
        "à": [
          "Je m'abonne à deux journaux. 我订阅了两份报纸。",
          "Es-tu abonnée à de quelconques magazines ? 你有订阅任何杂志吗？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "330961",
            "zh": "835375",
            "eng": "258831"
          },
          {
            "kind": "indirect",
            "fr": "928327",
            "zh": "840518",
            "eng": "25104"
          }
        ]
      }
    },
    "aboyer": {
      "display": "aboyer",
      "prepositions": {
        "sur": [
          "Un chien aboiera sur les étrangers. 狗会对陌生人叫。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "8778",
            "zh": "1417538",
            "eng": "239190"
          }
        ]
      }
    },
    "abriter": {
      "display": "abriter",
      "prepositions": {
        "de": [
          "J'ai dû m'abriter de la pluie sous un arbre. 我不得不在树下躲雨。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "135404",
            "zh": "343941",
            "eng": ""
          }
        ]
      }
    },
    "absenter": {
      "display": "absenter",
      "prepositions": {
        "de": [
          "Pourquoi vous êtes-vous absentés de la classe hier ? 你们昨天为什么离开教室？",
          "Pourquoi vous êtes-vous absenté de la classe hier ? 你昨天为何逃课？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "469922",
            "zh": "471332",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "469918",
            "zh": "2031385",
            "eng": "16454"
          }
        ]
      }
    },
    "absorber": {
      "display": "absorber",
      "prepositions": {
        "par": [
          "Il est absorbé par sa recherche. 他专注于他的研究。",
          "J'aimerais savoir comment ces substances sont absorbées par le corps. 我想知道这些物质是怎么被人体吸收的。",
          "Il était complètement absorbé par le livre. 他完全沉浸在书里。",
          "Tom était si absorbé par son travail qu'il en oublia de manger. 汤姆太专注于他的工作，以至于忘了吃饭。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "472174",
            "zh": "824364",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "845037",
            "zh": "358974",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "753261",
            "zh": "811927",
            "eng": "302105"
          },
          {
            "kind": "indirect",
            "fr": "1692888",
            "zh": "2000407",
            "eng": "37127"
          }
        ]
      }
    },
    "abstenir": {
      "display": "abstenir",
      "prepositions": {
        "de": [
          "Je ne peux m'abstenir d'exprimer mes doutes. 我忍不住要说出我的疑惑。",
          "J'ai dû m'abstenir de fumer pendant que j'étais à l'hôpital. 在医院的时候，我不得不戒烟。",
          "Je dois m'abstenir de la tâche car je n'en suis pas à la hauteur. 我必须推掉这任务，因为我不能胜任。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "492252",
            "zh": "344518",
            "eng": "256818"
          },
          {
            "kind": "indirect",
            "fr": "1003037",
            "zh": "1878437",
            "eng": "259867"
          },
          {
            "kind": "indirect",
            "fr": "1446317",
            "zh": "1394894",
            "eng": "254378"
          }
        ]
      }
    },
    "abuser": {
      "display": "abuser",
      "prepositions": {
        "de": [
          "Le roi abusa de son pouvoir. 国王滥用权力。",
          "N'abusez pas de moi, s'il vous plaît. 别骗我！",
          "Il a abusé de notre confiance. 他背叛了我们的信赖。",
          "Il semble que le flic de cette série télé soit un ripou qui abuse de son autorité. 这套电视剧里的惊察似乎是个滥用职权的坏蛋。"
        ],
        "par": [
          "Ne te laisse pas abuser par les apparences ! 不要被外貌蒙蔽了。",
          "J'ai été abusé par son apparence. 他的外表欺骗了我。",
          "Je refuse de me laisser abuser par sa ruse. 我是不会被她的诡计骗倒的。"
        ]
      },
      "prepositionOrder": [
        "de",
        "par"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "691719",
            "zh": "759564",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14382",
            "zh": "348492",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "131730",
            "zh": "1485257",
            "eng": "294572"
          },
          {
            "kind": "indirect",
            "fr": "1727939",
            "zh": "1345529",
            "eng": "645891"
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "4508870",
            "zh": "4517819",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "499578",
            "zh": "346909",
            "eng": "285783"
          },
          {
            "kind": "indirect",
            "fr": "1660183",
            "zh": "1665752",
            "eng": "1658683"
          }
        ]
      }
    },
    "accabler": {
      "display": "accabler",
      "prepositions": {
        "de": [
          "Le professeur a commencé à m'accabler de questions. 那个老师开始问我一堆问题。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1091935",
            "zh": "1589639",
            "eng": ""
          }
        ]
      }
    },
    "accepter": {
      "display": "accepter",
      "prepositions": {
        "de": [
          "accepter de faire qqch 接受／答应做某事",
          "J'ai accepté d'aider la vieille femme. 我同意帮助老太太。",
          "Il a accepté d'aider cette vieille dame. 他同意帮助这位老太太。",
          "Elle ne voulait pas me lâcher jusqu'à ce que j'accepte d'aller avec elle au cinéma. 她不愿松开我，直到我同意和她去电影院。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "426200",
            "zh": "426345",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1468676",
            "zh": "889114",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "815158",
            "zh": "815305",
            "eng": ""
          }
        ]
      }
    },
    "accompagner": {
      "display": "accompagner",
      "prepositions": {
        "à": [
          "Jim l'accompagna au piano. Jim为她用钢琴伴奏。",
          "Elle m'accompagna au piano. 她为我作钢琴伴奏。",
          "Je l'ai accompagné au piano. 我为她作钢琴伴奏。",
          "Elle m'accompagnera au piano. 她会弹钢琴为我伴奏。",
          "Je vous accompagnerai à l'aéroport. 我陪你去机场吧。",
          "Je vais vous accompagner à la gare. 我会告诉你去车站的路。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "336598",
            "zh": "336504",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1354446",
            "zh": "8884144",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135213",
            "zh": "848743",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1198578",
            "zh": "902958",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4165505",
            "zh": "619470",
            "eng": "18191"
          },
          {
            "kind": "indirect",
            "fr": "11133930",
            "zh": "851505",
            "eng": "26006"
          }
        ]
      }
    },
    "accoutumer": {
      "display": "accoutumer",
      "prepositions": {
        "à": [
          "Nous nous sommes accoutumés au froid. 我们已经习惯寒冷了。",
          "Les gens ici sont accoutumés au froid. 这里的人习惯了寒冷。",
          "Il est accoutumé à voyager. 他习惯了旅行。",
          "Je suis accoutumé à travailler toute la nuit. 我习惯整夜工作。",
          "Vous allez bientôt vous accoutumer à votre nouvelle école. 你很快就会适应你的新学校。",
          "T'es-tu enfin accoutumé à consommer de la nourriture japonaise ? 你们习惯吃日本的食物了吗？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "2902345",
            "zh": "10600788",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334347",
            "zh": "334406",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1330064",
            "zh": "825129",
            "eng": "304688"
          },
          {
            "kind": "indirect",
            "fr": "1348168",
            "zh": "883284",
            "eng": "259591"
          },
          {
            "kind": "indirect",
            "fr": "474838",
            "zh": "476574",
            "eng": "16650"
          },
          {
            "kind": "indirect",
            "fr": "1475967",
            "zh": "2333753",
            "eng": "281697"
          }
        ]
      }
    },
    "accrocher": {
      "display": "accrocher",
      "prepositions": {
        "à": [
          "L'image est accrochée au mur. 那幅图挂在墙上。",
          "Le portrait d'un vieil homme était accroché au mur. 一张老人的画像挂在墙上。",
          "Accroche cette image au mur. 把那幅画挂到墙上。",
          "Il accrocha une photo au mur. 他把一张照片挂在墙上。",
          "Il accrocha une lampe au plafond. 他把一盏灯挂在了天花板上。",
          "Une horloge est accrochée au mur. 墙壁上挂着一个时钟。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1132194",
            "zh": "1323952",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135675",
            "zh": "428027",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "400520",
            "zh": "408499",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "452998",
            "zh": "512870",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132994",
            "zh": "444611",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "575137",
            "zh": "779046",
            "eng": "320255"
          }
        ]
      }
    },
    "accueillir": {
      "display": "accueillir",
      "prepositions": {
        "avec": [
          "Elle m'a accueilli avec un sourire. 她用一个微笑迎接了我。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "791333",
            "zh": "791348",
            "eng": ""
          }
        ]
      }
    },
    "accuser": {
      "display": "accuser",
      "prepositions": {
        "de": [
          "accuser qqn de qqch 指控某人某事",
          "Elle m'accusa de dire un mensonge. 她指责我说谎。",
          "Qui veut noyer son chien l'accuse de la rage. 欲加之罪，何患无辞。",
          "Ils m'accusèrent de ne pas avoir tenu ma promesse. 他们指责我没有信守诺言。",
          "Vous ne pouvez pas l'accuser de vol sans avoir de preuves. 没有证据你们不能指责他偷东西。",
          "Elle m'accusa d'être un menteur. 她骂我是个骗子。",
          "Il m'accusa d'avoir volé sa montre. 他指控我偷了他的手表。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1354449",
            "zh": "894145",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13992",
            "zh": "437436",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334826",
            "zh": "334835",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "972001",
            "zh": "1326493",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1900927",
            "zh": "891124",
            "eng": "314414"
          },
          {
            "kind": "indirect",
            "fr": "919228",
            "zh": "8761456",
            "eng": "298388"
          }
        ]
      }
    },
    "accéder": {
      "display": "accéder",
      "prepositions": {
        "à": [
          "Le prince accéda au trône. 王子继承了王位。",
          "J'utilise souvent SSH pour accéder à mes ordinateurs à distance. 我经常使用SSH来远程连接到我的电脑。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "844661",
            "zh": "845127",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "388614",
            "zh": "368550",
            "eng": ""
          }
        ]
      }
    },
    "acheter": {
      "display": "acheter",
      "prepositions": {
        "pour": [
          "Je l'ai acheté pour douze dollars. 我用12美元买的。",
          "Elle me dit que sa mère l'avait acheté pour elle. 她告诉我她妈妈买给她了。",
          "Je l'achèterai pour toi demain. 我明天给你买。",
          "Je l'ai acheté pour dix dollars. 我花10美元买的。",
          "Tom ne sait pas ce que Mary veut qu'il lui achète pour son anniversaire. 汤姆不知道玛莉想要他买什么生日礼物给她。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "7067",
            "zh": "411707",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334011",
            "zh": "334038",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12666919",
            "zh": "10120910",
            "eng": "10120906"
          },
          {
            "kind": "indirect",
            "fr": "495391",
            "zh": "1446766",
            "eng": "254785"
          },
          {
            "kind": "indirect",
            "fr": "1306630",
            "zh": "13561224",
            "eng": "1029120"
          }
        ]
      }
    },
    "achever": {
      "display": "achever",
      "prepositions": {
        "en": [
          "La deuxième guerre mondiale s'est achevée en dix-neuf-cents-quarante-cinq. 第二次世界大战结束于1945年。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "1509946",
            "zh": "798293",
            "eng": "276061"
          }
        ]
      }
    },
    "adapter": {
      "display": "adapter",
      "prepositions": {
        "à": [
          "Tu dois t'adapter à la situation. 你必须随机应变。",
          "Je suis lent à m'adapter à de nouvelles situations. 我适应新环境很慢。",
          "Une pizza c'est le type de nourriture adapté au mode de vie contemporain. 比萨是种适合现在的生活方式的食物。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1066765",
            "zh": "1059271",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2173302",
            "zh": "9526055",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1610765",
            "zh": "5595087",
            "eng": "34795"
          }
        ]
      }
    },
    "adhérer": {
      "display": "adhérer",
      "prepositions": {
        "à": [
          "L'Albanie veut adhérer à l'Union européenne. 阿尔巴尼亚想加入欧盟。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "1889803",
            "zh": "1892667",
            "eng": "1802676"
          }
        ]
      }
    },
    "admirer": {
      "display": "admirer",
      "prepositions": {
        "pour": [
          "Je l'admire pour son courage. 我佩服他的勇气。",
          "Je t'admire pour ton courage. 我佩服你的勇气。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "130462",
            "zh": "512110",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "481438",
            "zh": "793232",
            "eng": "16872"
          }
        ]
      }
    },
    "adresser": {
      "display": "adresser",
      "prepositions": {
        "à": [
          "Le Président s'est adressé à la nation à la télévision. 总统在电视上对国民讲话。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "791294",
            "zh": "791425",
            "eng": ""
          }
        ]
      }
    },
    "advenir": {
      "display": "advenir",
      "prepositions": {
        "de": [
          "Tout le monde est désireux de savoir ce qu'il est advenu de l'ex-champion. 大家都渴望知道前冠军得主发生了什么。",
          "Qu'est-il advenu de ton chien ? 你的狗怎么了？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "828785",
            "zh": "829691",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "396170",
            "zh": "872216",
            "eng": "17244"
          }
        ]
      }
    },
    "affecter": {
      "display": "affecter",
      "prepositions": {
        "par": [
          "Elle n'est pas du tout affectée par la mort de son mari. 她对她丈夫的死漠不关心。",
          "Ce village n'est pas affecté par la pollution de l'air. 这座村没有空气污染。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "134646",
            "zh": "343138",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "495869",
            "zh": "345695",
            "eng": "58003"
          }
        ]
      }
    },
    "agacer": {
      "display": "agacer",
      "prepositions": {
        "par": [
          "En ville il était toujours agacé par les bruits en tous genres. 他在城市里一直受到噪音或者其他的干扰。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "129543",
            "zh": "333001",
            "eng": "279450"
          }
        ]
      }
    },
    "agir": {
      "display": "agir",
      "prepositions": {
        "sur": [
          "Il est impératif que vous agissiez sur-le-champ. 您必须马上行动。",
          "L'acide agit sur les choses qui contiennent du métal. 酸会和金属物质起化学反应。",
          "Ils agirent sur la base de l'information. 他们根据情报采取行动。"
        ],
        "avec": [
          "Elle a agi avec préméditation. 她按着预谋的决定行动了。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "avec"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "563779",
            "zh": "819700",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333264",
            "zh": "333275",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1348491",
            "zh": "8882018",
            "eng": "305828"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "842646",
            "zh": "842647",
            "eng": ""
          }
        ]
      }
    },
    "aider": {
      "display": "aider",
      "prepositions": {
        "à": [
          "aider qqn à faire qqch 帮助某人做某事",
          "Tom m'a aidé à déménager. 汤姆帮我搬了家。",
          "Je dois l'aider à tout prix. 我必须不惜一切代价帮助她。",
          "Pouvez-vous m'aider à le trouver ? 你可以帮忙找找吗？",
          "Tu peux m'aider à trouver un emploi ? 你能帮我找一个工作吗？",
          "Il m'a aidé à surmonter les difficultés. 他帮助我克服了困难。",
          "Pouvez-vous m'aider à faire la vaisselle ? 你能帮我洗碗吗？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "785702",
            "zh": "785918",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12962",
            "zh": "1446807",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129268",
            "zh": "349765",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9211004",
            "zh": "9210031",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132172",
            "zh": "819792",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8091",
            "zh": "437235",
            "eng": ""
          }
        ]
      }
    },
    "aimer": {
      "display": "aimer",
      "prepositions": {
        "à": [
          "aimer à faire qqch 喜欢做某事（书面语）",
          "Elle l'aimera à jamais. 她会永远爱着他。",
          "Il ne l'aimait pas au début. 他一开始不喜欢她。",
          "Les États-Unis sont un pays qui aime à croire qu'il n'a pas de classes sociales. 美国是一个自称没有社会阶层的国家。",
          "Je t'aime au coton. 我非常喜欢你。",
          "J'aime à la fois les chats et les chiens. 我喜欢狗和猫。",
          "Avez-vous aimé votre séjour à Hokkaido ? 你喜欢住在北海道吗？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1330206",
            "zh": "1532383",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "331633",
            "zh": "401008",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14095",
            "zh": "812218",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8045103",
            "zh": "803741",
            "eng": "257095"
          },
          {
            "kind": "indirect",
            "fr": "967963",
            "zh": "848640",
            "eng": "28947"
          },
          {
            "kind": "indirect",
            "fr": "135111",
            "zh": "842463",
            "eng": "321281"
          }
        ]
      }
    },
    "aller": {
      "display": "aller",
      "prepositions": {
        "à": [
          "J'irai à pied. 我走路去。",
          "Allons à la plage. 我们去海边吧。",
          "Allons à New York ! 去纽约吧！",
          "Je vais au magasin. 我去商店。",
          "Je dois aller au lit. 我该上床了。",
          "Je veux aller à Tokyo. 我想去东京。"
        ],
        "en": [
          "Tu iras en train ? 你坐火车去吗？",
          "Je veux y aller en métro. 我想乘地铁去。",
          "Tu peux y aller en bateau. 你可以坐船去那。",
          "Mon père est allé en Chine. 我爸爸去中国了。",
          "J'aimerais aller en France. 我想要去法国。",
          "Je vais en Amérique cet été. 我今年夏天要去美国。"
        ],
        "chez": [
          "aller chez qqn 去某人家；去（医生）那里",
          "Tom est allé chez Mary. 汤姆去了玛丽家。",
          "Je peux aller chez toi demain. 明天我能去你家。",
          "Tu as besoin d'aller chez le coiffeur. 你该去理发店了。",
          "Aujourd'hui je suis allé chez le médecin. 今天我去看了医生。",
          "Tu ferais mieux d'aller chez le dentiste. 你最好去看牙医。",
          "Tu n'as pas besoin d'aller chez le dentiste. 你不需要去看牙医。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en",
        "chez"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1578185",
            "zh": "380734",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "628165",
            "zh": "10609046",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "811427",
            "zh": "812243",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1049664",
            "zh": "1504028",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3211",
            "zh": "501373",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6647",
            "zh": "10270512",
            "eng": ""
          }
        ],
        "en": [
          {
            "kind": "direct",
            "fr": "399672",
            "zh": "399588",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129298",
            "zh": "346002",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "430369",
            "zh": "332753",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134914",
            "zh": "677472",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "338091",
            "zh": "366880",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11301",
            "zh": "858884",
            "eng": ""
          }
        ],
        "chez": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "5591390",
            "zh": "11919635",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7967057",
            "zh": "3537825",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426114",
            "zh": "426377",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "441395",
            "zh": "1314396",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "905361",
            "zh": "905347",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "826776",
            "zh": "1325044",
            "eng": ""
          }
        ]
      }
    },
    "allonger": {
      "display": "allonger",
      "prepositions": {
        "sur": [
          "Un homme ivre dormait allongé sur le banc. 一个醉了的男人在长椅上睡觉。",
          "Il est allongé sur le banc. 他躺在长凳上。",
          "Je me suis allongé sur mon lit. 我躺在床上。",
          "Je me suis allongé sur l'herbe. 我在草地上直躺下来了。"
        ],
        "dans": [
          "Kyoko est allongée dans l'herbe. 恭子正躺在草地上。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "678943",
            "zh": "677623",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "416958",
            "zh": "2254399",
            "eng": "292679"
          },
          {
            "kind": "indirect",
            "fr": "6388",
            "zh": "2336000",
            "eng": "258251"
          },
          {
            "kind": "indirect",
            "fr": "842683",
            "zh": "842684",
            "eng": "259188"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "400824",
            "zh": "798177",
            "eng": "19332"
          }
        ]
      }
    },
    "allouer": {
      "display": "allouer",
      "prepositions": {
        "de": [
          "Allouer plus d'argent à l'éducation stimulera la croissance économique. 更多投资在教育的钱将会刺激经济成长。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "341907",
            "zh": "772166",
            "eng": "19132"
          }
        ]
      }
    },
    "amasser": {
      "display": "amasser",
      "prepositions": {
        "de": [
          "Un avare amasse de l'argent non pas parce qu'il est prudent mais parce qu'il est avide. 守财奴积聚钱财不是因为他谨慎，而是因为他贪婪。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "3780",
            "zh": "502975",
            "eng": ""
          }
        ]
      }
    },
    "amener": {
      "display": "amener",
      "prepositions": {
        "à": [
          "Un effort permanent amène à un succès certain. 功到自然成。",
          "Je l'ai amené au restaurant le plus cher du campus. 我把他带到校区里最贵的餐馆去了。",
          "Les idées de Freud sur le comportement humain l'ont amené à être honoré en tant que profond penseur. 弗洛伊德关于人类行为的思想使他被敬为一个知识渊博的思想家。",
          "Jimmy insista pour que je l'amène au zoo. 吉米坚持要我带他去动物园。",
          "Cinq minutes de marche nous amenèrent au parc. 走了五分钟，我们就到达了公园。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "539746",
            "zh": "408959",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "425899",
            "zh": "426408",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3775",
            "zh": "502965",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1018568",
            "zh": "793966",
            "eng": "53369"
          },
          {
            "kind": "indirect",
            "fr": "589439",
            "zh": "340255",
            "eng": "72473"
          }
        ]
      }
    },
    "amuser": {
      "display": "amuser",
      "prepositions": {
        "à": [
          "Je m'amuse bien au Canada. 我现在在加拿大很开心。",
          "Il s'est amusé à lire une histoire policière. 他看一本推理小说来消遣。",
          "Ils se sont amusés à la fête. 他们在派对上玩得很开心。",
          "On s'est bien amusé à la fête. 我们在派对上玩得很开心。",
          "On s'est bien amusé à regarder la télé. 我们喜欢看电视。",
          "Nous nous sommes bien amusés au pique-nique. 我们在野餐玩得很开心。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "390364",
            "zh": "893991",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132721",
            "zh": "346743",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "355159",
            "zh": "779543",
            "eng": "305974"
          },
          {
            "kind": "indirect",
            "fr": "1251163",
            "zh": "868481",
            "eng": "262829"
          },
          {
            "kind": "indirect",
            "fr": "139334",
            "zh": "772095",
            "eng": "248056"
          },
          {
            "kind": "indirect",
            "fr": "460154",
            "zh": "868401",
            "eng": "262836"
          }
        ]
      }
    },
    "annuler": {
      "display": "annuler",
      "prepositions": {
        "à": [
          "Le pique-nique a été annulé à cause de la pluie. 由于下雨，野餐取消了。",
          "J'ai dû annuler mon voyage à cause de la grève. 由于罢工，我不得不取消了我的行程。",
          "Le match fut annulé à cause de la pluie. 比赛因为下雨取消了。"
        ],
        "en": [
          "De nombreux vols furent annulés en raison du typhon. 由于台风原因，很多航班被取消了。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "181704",
            "zh": "430987",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11891",
            "zh": "405037",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "337340",
            "zh": "337320",
            "eng": "26750"
          }
        ],
        "en": [
          {
            "kind": "indirect",
            "fr": "1491333",
            "zh": "750159",
            "eng": "275441"
          }
        ]
      }
    },
    "apparaître": {
      "display": "apparaître",
      "prepositions": {
        "sur": [
          "Mon nom n'apparaît pas sur la liste. 我的名字没有出现在名单上。"
        ],
        "dans": [
          "Un bateau apparut soudain dans la brume. 一艘船突然从雾中出现。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "11455202",
            "zh": "894039",
            "eng": "251970"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "135316",
            "zh": "431497",
            "eng": ""
          }
        ]
      }
    },
    "appartenir": {
      "display": "appartenir",
      "prepositions": {
        "à": [
          "appartenir à qqn 属于某人",
          "Ce livre appartient à Tony. 这本书属于托尼。",
          "Cela appartient à mon frère. 那个是我哥哥的。",
          "Ce vélo appartient à notre école. 那辆自行车属于我们学校。",
          "J'appartiens à l'équipe de baseball. 我隶属棒球队。",
          "L'avenir appartient à ceux qui se lèvent tôt. 未来是属于早起的人的。",
          "Ça appartient à mon frère. 它属于我兄弟。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "427828",
            "zh": "787046",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "867118",
            "zh": "867141",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10493",
            "zh": "406333",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "472204",
            "zh": "472870",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4212",
            "zh": "411638",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "457242",
            "zh": "780235",
            "eng": "628448"
          }
        ]
      }
    },
    "appeler": {
      "display": "appeler",
      "prepositions": {
        "pour": [
          "Elle nous appela pour l'aider. 她向我们大声求助。",
          "Il a appelé pour dire qu'il ne pourrait pas assister à la réunion. 他打电话来说不能参加会议。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "2310798",
            "zh": "2029319",
            "eng": "312921"
          },
          {
            "kind": "indirect",
            "fr": "131734",
            "zh": "6624667",
            "eng": "294600"
          }
        ]
      }
    },
    "apprendre": {
      "display": "apprendre",
      "prepositions": {
        "à": [
          "apprendre à faire qqch 学着做某事",
          "Il a appris à nager. 他学过游泳。",
          "Il m'a appris à nager. 他教了我游泳。",
          "On apprend à tout âge. 活到老，学到老。",
          "Le garçon a appris à lire. 男孩学会了阅读。",
          "Je veux apprendre à danser. 我想学跳舞。",
          "Qui vous a appris à danser ? 谁教你跳舞的?"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "131597",
            "zh": "343870",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "493617",
            "zh": "345679",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "810831",
            "zh": "503082",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "488835",
            "zh": "1445962",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1141508",
            "zh": "1455143",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "389552",
            "zh": "411650",
            "eng": ""
          }
        ]
      }
    },
    "approcher": {
      "display": "approcher",
      "prepositions": {
        "de": [
          "N'approchez pas du chien. 别走近那只狗。",
          "Ne t'approche pas de moi ! 不要接近我。",
          "L'ennemi approche de la ville. 敌人靠近城镇。",
          "À l'approche de Noël, le commerce a quelque peu repris. 圣诞节快到了，生意也好了点。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "12111",
            "zh": "350680",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1973436",
            "zh": "340165",
            "eng": "1972620"
          },
          {
            "kind": "indirect",
            "fr": "500949",
            "zh": "347280",
            "eng": "426605"
          },
          {
            "kind": "indirect",
            "fr": "814434",
            "zh": "458158",
            "eng": "62815"
          }
        ]
      }
    },
    "approvisionner": {
      "display": "approvisionner",
      "prepositions": {
        "en": [
          "Le magasin peut nous approvisionner en tout ce dont nous avons besoin. 这家商店可以提供所有我们需要的东西。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "943640",
            "zh": "8143519",
            "eng": "44859"
          }
        ]
      }
    },
    "apprécier": {
      "display": "apprécier",
      "prepositions": {
        "de": [
          "Il apprécie de dormir. 他喜欢睡觉。",
          "J'apprécie de travailler ici. 我喜欢在这儿工作。",
          "Elle n'appréciait pas de vivre en ville. 她不喜欢住在城市里。",
          "J'ai apprécié de parler avec lui à la fête. 聚会上我和他谈得很愉快。",
          "J'apprécie de prendre le petit-déjeuner avec toi. 我喜欢和你一起吃早饭。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1679097",
            "zh": "2083009",
            "eng": "1676741"
          },
          {
            "kind": "indirect",
            "fr": "2415939",
            "zh": "10361416",
            "eng": "2325176"
          },
          {
            "kind": "indirect",
            "fr": "969383",
            "zh": "891060",
            "eng": "315842"
          },
          {
            "kind": "indirect",
            "fr": "459975",
            "zh": "1438463",
            "eng": "260185"
          },
          {
            "kind": "indirect",
            "fr": "1427345",
            "zh": "8584878",
            "eng": "1426786"
          }
        ]
      }
    },
    "apprêter": {
      "display": "apprêter",
      "prepositions": {
        "à": [
          "Je m'apprêtais à partir quand le téléphone sonna. 电话响的时候我正准备要走。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "129523",
            "zh": "1330013",
            "eng": ""
          }
        ]
      }
    },
    "appuyer": {
      "display": "appuyer",
      "prepositions": {
        "sur": [
          "appuyer sur qqch 按（按钮）；靠在某物上",
          "Vous n'avez qu'à appuyer sur le bouton. 您只要按下按钮就行了。",
          "En cas d'incendie, appuyez sur le bouton. 万一发生火灾，按下按钮。",
          "En cas d'incendie, brisez la vitre et appuyez sur le bouton rouge. 万一发生火灾，打碎玻璃并按下红色按钮。",
          "Tout ce que tu as à faire est d'appuyer sur ce bouton pour prendre la photo. 你要做的就是按这个按钮拍照。",
          "Appuie sur le bouton. 按下按钮。",
          "Appuie sur une touche. 按任何键。"
        ],
        "contre": [
          "Ne vous appuyez pas contre le mur. 别倚著墙。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "contre"
      ],
      "sources": {
        "sur": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "427441",
            "zh": "783011",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "120070",
            "zh": "797094",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335462",
            "zh": "335525",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11283",
            "zh": "1335406",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10549641",
            "zh": "10733635",
            "eng": "4496213"
          },
          {
            "kind": "indirect",
            "fr": "10740733",
            "zh": "10740735",
            "eng": "9164876"
          }
        ],
        "contre": [
          {
            "kind": "indirect",
            "fr": "134996",
            "zh": "5574664",
            "eng": "44088"
          }
        ]
      }
    },
    "arranger": {
      "display": "arranger",
      "prepositions": {
        "pour": [
          "Comment t'es-tu donc arrangé pour faire ça ? 你是怎么做到这一点的呢？",
          "Je m'arrangerai pour que quelqu'un vienne te chercher chez toi. 我会安排一下，叫个人去你家接你。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "461449",
            "zh": "461549",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334311",
            "zh": "334326",
            "eng": ""
          }
        ]
      }
    },
    "arriver": {
      "display": "arriver",
      "prepositions": {
        "à": [
          "arriver à faire qqch 设法做成某事",
          "J'arriverai à entrer. 我会进去。",
          "Je suis arrivé à la gare. 我到火车站了。",
          "Il arrive à l'improviste. 他来的很突然。",
          "L'avion arriva à l'heure. 飞机准时到了。",
          "Je n'arrive pas à dormir. 我睡不着。",
          "Le train arriva à l'heure. 火车准时到了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1119164",
            "zh": "824616",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "331808",
            "zh": "406367",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "449786",
            "zh": "454447",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "461474",
            "zh": "461498",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1189414",
            "zh": "1189409",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465092",
            "zh": "510665",
            "eng": ""
          }
        ]
      }
    },
    "arrêter": {
      "display": "arrêter",
      "prepositions": {
        "de": [
          "arrêter de faire qqch 停止做某事",
          "Arrête de rêver. 别做梦了。",
          "Arrête de parler. 不要说话了。",
          "Arrête de me taper ! 别再打我了！",
          "Arrête de parler fort. 停止大声说话。",
          "Père a arrêté de boire. 父亲戒酒了。",
          "Arrête de me critiquer ! 不要再批评我了！"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "6465586",
            "zh": "10325722",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129367",
            "zh": "5092251",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8685213",
            "zh": "10299642",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426544",
            "zh": "430993",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134908",
            "zh": "334237",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3844",
            "zh": "503061",
            "eng": ""
          }
        ]
      }
    },
    "aspirer": {
      "display": "aspirer",
      "prepositions": {
        "à": [
          "aspirer à qqch 渴望；向往",
          "Nous aspirons à la paix. 我们渴望和平。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "544818",
            "zh": "349514",
            "eng": "263268"
          }
        ]
      }
    },
    "asseoir": {
      "display": "asseoir",
      "prepositions": {
        "sur": [
          "Elle est assise sur le banc. 她坐在长椅上。",
          "Il est assis sur deux chaises. 他坐在两张椅子上。",
          "Il est assis sur une mine d'or. 他坐在一座金矿上。",
          "Le chat est assis sur la table. 猫坐在桌子上。",
          "Il est inconfortable d'être assis sur cette chaise. 坐在这张椅子上不舒服。",
          "Elle était assise sur une chaise, à regarder la télé. 她坐在椅子上看电视。"
        ],
        "dans": [
          "Qui est cet homme assis dans le coin ? 坐在角落的那个男人是谁？",
          "Il est assis dans la salle de réunion. 他正坐在会议室里。",
          "Je voudrais être assis dans le compartiment non-fumeur s'il vous plaît. 我想坐在无烟区。",
          "Merci de rester assis dans votre siège jusqu'à notre arrivée au terminus. 请留在您的座位上，直到我们到达终点站。",
          "Nous nous assîmes dans un silence complet. 我们一言不发地坐着。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "1110569",
            "zh": "839616",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "846330",
            "zh": "846481",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "804001",
            "zh": "805206",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3138400",
            "zh": "347218",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "835522",
            "zh": "835539",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1397192",
            "zh": "11254299",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "430582",
            "zh": "415702",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2456987",
            "zh": "332471",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9169",
            "zh": "333040",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "750194",
            "zh": "1316739",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "496914",
            "zh": "345975",
            "eng": "273688"
          }
        ]
      }
    },
    "assister": {
      "display": "assister",
      "prepositions": {
        "à": [
          "assister à qqch 出席；观看（≠ 帮助）",
          "J'assisterai au prochain meeting. 我会参加下次的会议。",
          "Tu aurais dû assister à cette réunion. 你应该参加这个会议的。",
          "Des dizaines de jeunes ont assisté à la manifestation. 几十个年轻人参加了示威游行。",
          "Nous n'avions encore jamais assisté à un mariage chinois. 我们还从来没参加过中国人的婚礼呢。",
          "J'assisterai à la réunion. 我将参加这个会议。",
          "Vas-tu assister à la réunion ? 你要参加会议吗？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "465262",
            "zh": "466200",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1097235",
            "zh": "874731",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335194",
            "zh": "335242",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "398196",
            "zh": "397895",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "356193",
            "zh": "819443",
            "eng": "256570"
          },
          {
            "kind": "indirect",
            "fr": "9513",
            "zh": "874470",
            "eng": "22524"
          }
        ]
      }
    },
    "attacher": {
      "display": "attacher",
      "prepositions": {
        "à": [
          "Une carte était attachée au cadeau. 一张卡片被附在了礼物上。",
          "Mary est très attachée à la petite fille. 玛莉很喜欢那个小女孩。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "129059",
            "zh": "801487",
            "eng": "274350"
          },
          {
            "kind": "indirect",
            "fr": "13519",
            "zh": "1438724",
            "eng": "31983"
          }
        ]
      }
    },
    "attaquer": {
      "display": "attaquer",
      "prepositions": {
        "par": [
          "Le fort a été attaqué par surprise. 要塞意外地被攻击了。",
          "Nous étions attaqués par un essaim d'abeilles. 我们被一大群蜜蜂攻击。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "335773",
            "zh": "335860",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1893570",
            "zh": "389516",
            "eng": "22666"
          }
        ]
      }
    },
    "atteindre": {
      "display": "atteindre",
      "prepositions": {
        "de": [
          "Le communisme ne sera jamais atteint de mon vivant. 在我有生之年永不可能实现共产主义。",
          "Je suis atteint du VIH. 我有艾滋病。",
          "Je suis atteint d'un cancer. 我有癌症。",
          "De nombreux patients atteints du cancer perdent leurs cheveux à cause de la chimiothérapie. 很多癌症患者都因为化疗而脱发。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "3348",
            "zh": "334455",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10707746",
            "zh": "10699401",
            "eng": "10696105"
          },
          {
            "kind": "indirect",
            "fr": "10704897",
            "zh": "10699402",
            "eng": "2245875"
          },
          {
            "kind": "indirect",
            "fr": "755884",
            "zh": "2321367",
            "eng": "744557"
          }
        ]
      }
    },
    "attendre": {
      "display": "attendre",
      "prepositions": {
        "avec": [
          "Franck attendait avec plaisir son rendez-vous du soir. 法兰克高兴地等待着他晚上的约会。",
          "J'attends avec impatience d'aller chasser avec mon père. 我等不及想要和我爸爸去狩猎。",
          "J'attends avec impatience d'entendre votre opinion sur ce sujet. 我迫不及待地想要听到您在这件事上的想法。",
          "J'attends avec impatience de vous revoir. 我期待再见到你。",
          "J'attends avec impatience de vos nouvelles. 我期待收到你的来信。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "480985",
            "zh": "481175",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "140042",
            "zh": "334871",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3915",
            "zh": "503205",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1723016",
            "zh": "894005",
            "eng": "257051"
          },
          {
            "kind": "indirect",
            "fr": "10937",
            "zh": "880312",
            "eng": "64000"
          }
        ]
      }
    },
    "atterrir": {
      "display": "atterrir",
      "prepositions": {
        "sur": [
          "Notre balle passa par-dessus la barrière et atterrit sur le chantier. 我们的球越过了栅栏，掉到了工地里。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "10526192",
            "zh": "10530870",
            "eng": "10472682"
          }
        ]
      }
    },
    "attirer": {
      "display": "attirer",
      "prepositions": {
        "par": [
          "Il était attiré par cette femme. 他被那个女人吸引住了。",
          "Il était attiré par son sourire. 他被她的笑容吸引住了。",
          "Elle est attirée par les hommes asiatiques. 她对亚洲男性有好感。",
          "Les papillons de nuit sont attirés par la lumière. 飞蛾被光线吸引。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "15374",
            "zh": "375328",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133191",
            "zh": "793855",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2283393",
            "zh": "13871019",
            "eng": "2282110"
          },
          {
            "kind": "indirect",
            "fr": "3659655",
            "zh": "1067172",
            "eng": "63582"
          }
        ]
      }
    },
    "attraper": {
      "display": "attraper",
      "prepositions": {
        "par": [
          "Il l'attrapa par le bras. 他抓住了她的胳膊。",
          "Le cerf a été attrapé par un lion. 鹿被一头狮子抓住了。",
          "Je l'attrapai par le bras avant qu'il ne tombât. 在他倒下前我抓住了他的手臂。"
        ],
        "avec": [
          "Elle me lançait les raisins et j'essayais de les attraper avec la bouche. 她朝我丢葡萄，我试着用嘴接住它们。"
        ]
      },
      "prepositionOrder": [
        "par",
        "avec"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "133199",
            "zh": "1394880",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "413798",
            "zh": "464838",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1011539",
            "zh": "779042",
            "eng": "284050"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "808187",
            "zh": "808205",
            "eng": ""
          }
        ]
      }
    },
    "attribuer": {
      "display": "attribuer",
      "prepositions": {
        "à": [
          "Il attribue son échec à la mauvaise chance. 他把他的错误归咎于坏运气。",
          "Ne jamais attribuer à la malveillance ce que la bêtise suffit à expliquer. 能解释为愚蠢的，就不要解释为恶意。",
          "Il attribua son succès à la chance. 他把他的成功归功于好运。",
          "Il attribue son succès à la bonne fortune. 他将他的成功归功于好运。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "132466",
            "zh": "343638",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12419784",
            "zh": "12419792",
            "eng": "2570990"
          },
          {
            "kind": "indirect",
            "fr": "130541",
            "zh": "1438323",
            "eng": "288178"
          },
          {
            "kind": "indirect",
            "fr": "3670271",
            "zh": "1438327",
            "eng": "298794"
          }
        ]
      }
    },
    "augmenter": {
      "display": "augmenter",
      "prepositions": {
        "de": [
          "Son salaire a été augmenté de 10%. 他的工资涨了10％。",
          "Le taux de croissance du PNB au troisième trimestre a augmenté de 1% par rapport au trimestre précédent. 第三季国民生产总值较上一季成长了1％。",
          "Les prix ont augmenté de manière stable. 物价一直在稳定上升。",
          "La production d'acier augmentera de 2% ce mois-ci comparé au précédent. 今个月的钢铁产量和上个月比起来，估计会上升两个巴仙。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "337374",
            "zh": "345926",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "830340",
            "zh": "830321",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "134970",
            "zh": "365791",
            "eng": "319921"
          },
          {
            "kind": "indirect",
            "fr": "1206167",
            "zh": "389919",
            "eng": "242013"
          }
        ]
      }
    },
    "autoriser": {
      "display": "autoriser",
      "prepositions": {
        "à": [
          "autoriser qqn à faire qqch 允许某人做某事",
          "Il m'a autorisé à les virer. 他授权给我解雇了他们。",
          "Je ne t'autorise pas à utiliser mon stylo. 我不允许你用我的钢笔。",
          "Mon père ne m'autorise pas à avoir un chien. 我父亲不让我养狗。",
          "Ils ne nous autoriseront pas à entrer dans le jardin. 他们不会允许我们进花园的。",
          "Suis-je autorisé à utiliser ceci ? 能让我用用吗？",
          "Elle l'autorisa à s'y rendre seul. 她允许他一个人去。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "805606",
            "zh": "805193",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "461455",
            "zh": "461536",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "339404",
            "zh": "9959843",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "785317",
            "zh": "785985",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2130292",
            "zh": "5574405",
            "eng": "2129925"
          },
          {
            "kind": "indirect",
            "fr": "3296365",
            "zh": "636223",
            "eng": "27654"
          }
        ]
      }
    },
    "avaler": {
      "display": "avaler",
      "prepositions": {
        "de": [
          "Il a avalé du détergent par erreur. 他误吞了洗衣粉。",
          "Je trouve que c'est crevant de croquer des pommes, je préfère donc avaler de la compote. 我感觉咬苹果好累，所以喜欢吸苹果泥。",
          "Je ne peux rien avaler de plus. 我吃不下去了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "335174",
            "zh": "335222",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1065090",
            "zh": "1065088",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "330292",
            "zh": "13678191",
            "eng": "31231"
          }
        ]
      }
    },
    "avancer": {
      "display": "avancer",
      "prepositions": {
        "vers": [
          "Un homme étrange s'est avancé vers moi et m'a demandé de l'argent. 有个怪人上前来问我要钱。"
        ]
      },
      "prepositionOrder": [
        "vers"
      ],
      "sources": {
        "vers": [
          {
            "kind": "direct",
            "fr": "135001",
            "zh": "342856",
            "eng": ""
          }
        ]
      }
    },
    "avertir": {
      "display": "avertir",
      "prepositions": {
        "de": [
          "Je l'avertis de ne pas être en retard. 我警告了他不要迟到。",
          "Je vous avez avertis de ne pas venir ici. 我警告过你别来这里。",
          "Je suis venu t'avertir de ne pas faire ça. 我来警告你别那样做。",
          "Elle l'avertit de ne pas sortir seul durant la nuit. 她警告他晚上不要一个人出去。",
          "Notre professeur l'avertit de ne plus être en retard. 我们的老师警告他不要再迟到。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1081233",
            "zh": "883499",
            "eng": "403378"
          },
          {
            "kind": "indirect",
            "fr": "5857767",
            "zh": "6075558",
            "eng": "4927665"
          },
          {
            "kind": "indirect",
            "fr": "8026978",
            "zh": "5925227",
            "eng": "2300275"
          },
          {
            "kind": "indirect",
            "fr": "1069479",
            "zh": "1438527",
            "eng": "887519"
          },
          {
            "kind": "indirect",
            "fr": "1055679",
            "zh": "365885",
            "eng": "273048"
          }
        ]
      }
    },
    "aveugler": {
      "display": "aveugler",
      "prepositions": {
        "par": [
          "Elle est aveuglée par l'amour. 她被爱情蒙蔽了双眼。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "1794027",
            "zh": "13744218",
            "eng": "1789115"
          }
        ]
      }
    },
    "avoir": {
      "display": "avoir",
      "prepositions": {
        "à": [
          "avoir mal à la tête 头疼",
          "avoir droit à qqch 有权享受某物",
          "avoir affaire à qqn 与某人打交道",
          "J'ai mal au crâne. 我头痛。",
          "J'ai mal à la dent. 我牙疼。",
          "Il a mal à la tête. 他的头痛了。",
          "J'ai mal aux dents. 我的牙很痛。",
          "J'ai mal aux fesses. 我屁股痛。",
          "J'ai mal à l'épaule. 我肩膀痛。"
        ],
        "de": [
          "avoir besoin de qqch 需要某物",
          "avoir envie de faire qqch 想做某事",
          "avoir peur de qqch 害怕某事",
          "J'ai du temps. 我有时间。",
          "J'ai de l'asthme. 我有哮喘。",
          "J'ai de la fièvre. 我发烧了。",
          "J'ai de la chance. 我运气很好。",
          "Il n'y a pas d'eau. 没有水。",
          "Je n'ai pas de nom. 我没有名字。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "129590",
            "zh": "332568",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "470703",
            "zh": "470984",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "477902",
            "zh": "688812",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4583797",
            "zh": "344244",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "470370",
            "zh": "471169",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "899475",
            "zh": "736268",
            "eng": ""
          }
        ],
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1302575",
            "zh": "4859550",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6115283",
            "zh": "10699398",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "417977",
            "zh": "1065847",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "5991426",
            "zh": "437296",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1444289",
            "zh": "1444292",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "5552408",
            "zh": "11046616",
            "eng": ""
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "avoir raison 有道理；说得对",
          "collocation": "avoir raison",
          "chinese": "有道理；说得对",
          "source": "authored"
        },
        {
          "text": "avoir tort 错了；没道理",
          "collocation": "avoir tort",
          "chinese": "错了；没道理",
          "source": "authored"
        },
        {
          "text": "avoir faim 饿了",
          "collocation": "avoir faim",
          "chinese": "饿了",
          "source": "authored"
        },
        {
          "text": "avoir soif 渴了",
          "collocation": "avoir soif",
          "chinese": "渴了",
          "source": "authored"
        },
        {
          "text": "avoir froid 冷",
          "collocation": "avoir froid",
          "chinese": "冷",
          "source": "authored"
        },
        {
          "text": "avoir chaud 热",
          "collocation": "avoir chaud",
          "chinese": "热",
          "source": "authored"
        },
        {
          "text": "avoir sommeil 困了",
          "collocation": "avoir sommeil",
          "chinese": "困了",
          "source": "authored"
        },
        {
          "text": "avoir mal 疼",
          "collocation": "avoir mal",
          "chinese": "疼",
          "source": "authored"
        },
        {
          "text": "avoir lieu 举行；发生",
          "collocation": "avoir lieu",
          "chinese": "举行；发生",
          "source": "authored"
        },
        {
          "text": "avoir de la chance 运气好",
          "collocation": "avoir de la chance",
          "chinese": "运气好",
          "source": "authored"
        }
      ]
    },
    "avoir besoin": {
      "display": "avoir besoin",
      "prepositions": {
        "de": [
          "avoir besoin de qqch 需要某物"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "avoir confiance": {
      "display": "avoir confiance",
      "prepositions": {
        "en": [
          "avoir confiance en qqn 信任某人"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "avoir envie": {
      "display": "avoir envie",
      "prepositions": {
        "de": [
          "avoir envie de qqch 想要某物"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "avoir peur": {
      "display": "avoir peur",
      "prepositions": {
        "de": [
          "avoir peur de qqch 害怕某事"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "baigner": {
      "display": "baigner",
      "prepositions": {
        "dans": [
          "Elle baigne dans le rock. 她沉迷于摇滚乐。",
          "S'il fait beau, j'irai me baigner dans le fleuve. 如果天气好，我要去河里游泳。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "7103808",
            "zh": "863808",
            "eng": "312441"
          },
          {
            "kind": "indirect",
            "fr": "2825889",
            "zh": "9007438",
            "eng": "278812"
          }
        ]
      }
    },
    "balader": {
      "display": "balader",
      "prepositions": {
        "à": [
          "Je suis en train de me balader à vélo. 我在骑自行车溜达。"
        ],
        "dans": [
          "J'aime me balader dans la nature. 我喜欢在大自然中散步。"
        ]
      },
      "prepositionOrder": [
        "à",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1488493",
            "zh": "1488492",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "8315986",
            "zh": "2081689",
            "eng": "7213144"
          }
        ]
      }
    },
    "balayer": {
      "display": "balayer",
      "prepositions": {
        "par": [
          "Beaucoup de maisons furent balayées par l'inondation. 许多房屋被洪水冲走了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "12498",
            "zh": "334208",
            "eng": ""
          }
        ]
      }
    },
    "baser": {
      "display": "baser",
      "prepositions": {
        "sur": [
          "Cela est basé sur des suppositions. 这是建立在猜测的基础上。",
          "Cette histoire est basée sur des faits réels. 这个故事是基于真实事件写的。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "336610",
            "zh": "336581",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "728249",
            "zh": "1964269",
            "eng": ""
          }
        ]
      }
    },
    "battre": {
      "display": "battre",
      "prepositions": {
        "pour": [
          "Je me bats pour la justice. 我为正义而战。",
          "Ils se sont battus pour la liberté. 他们为了自由而战。"
        ],
        "avec": [
          "T'es-tu battu avec Ken ? 你和肯吵架了吗?"
        ]
      },
      "prepositionOrder": [
        "pour",
        "avec"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "180588",
            "zh": "9583407",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "331258",
            "zh": "390848",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "348556",
            "zh": "875261",
            "eng": "62530"
          }
        ]
      }
    },
    "bavarder": {
      "display": "bavarder",
      "prepositions": {
        "avec": [
          "J'ai passé tout l'après-midi à bavarder avec des amis. 我用了一整个下午和我的朋友聊天。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "3923",
            "zh": "503216",
            "eng": ""
          }
        ]
      }
    },
    "bayer": {
      "display": "bayer",
      "prepositions": {
        "à": [
          "Arrête de bayer aux corneilles. 别再傻看着。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "1072214",
            "zh": "5102246",
            "eng": "693620"
          }
        ]
      }
    },
    "blesser": {
      "display": "blesser",
      "prepositions": {
        "en": [
          "Elle s'est blessée en tombant. 她摔伤了。"
        ],
        "par": [
          "Personne n'a été blessé par la bombe. 没有人因这个炸弹而受伤。"
        ],
        "dans": [
          "Il a été blessé dans un accident ferroviaire. 他在一次铁路事故中受了伤。",
          "Tom a été grièvement blessé dans un accident de la circulation. 汤姆在交通意外中受了重伤。",
          "Il a été blessé dans un accident au travail. 他工作时发生意外，受了伤。",
          "Il a été blessé dans un accident de voiture. 他在一次车祸中受伤了。",
          "J'ai été blessé dans l'accident de la route. 我在这场交通意外中受了伤。",
          "Il a été blessé dans un accident de circulation. 他在一场交通意外中受了伤。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "134561",
            "zh": "9953291",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "11568053",
            "zh": "11568908",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "1147449",
            "zh": "1314226",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "781315",
            "zh": "616291",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1647804",
            "zh": "393384",
            "eng": "297089"
          },
          {
            "kind": "indirect",
            "fr": "3169444",
            "zh": "876932",
            "eng": "298502"
          },
          {
            "kind": "indirect",
            "fr": "6454518",
            "zh": "802533",
            "eng": "254337"
          },
          {
            "kind": "indirect",
            "fr": "1141534",
            "zh": "802532",
            "eng": "296227"
          }
        ]
      }
    },
    "bloquer": {
      "display": "bloquer",
      "prepositions": {
        "par": [
          "Après la tempête, cette route a été bloquée par des chutes d'arbres. 暴风雨过后，那条路被倒下来的树堵住了。",
          "Le trafic était bloqué par un glissement de terrain. 交通被山崩所阻断。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "1136762",
            "zh": "678908",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "181080",
            "zh": "801447",
            "eng": "63772"
          }
        ]
      }
    },
    "blâmer": {
      "display": "blâmer",
      "prepositions": {
        "pour": [
          "Je ne vous blâme pas pour l'avoir frappé. 我不怪你撞到他。",
          "Certes tu t'es trompé, mais je ne peux pas te blâmer pour cela. 你固然是错了，但也不能怪你。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "136362",
            "zh": "887688",
            "eng": "260888"
          },
          {
            "kind": "indirect",
            "fr": "635869",
            "zh": "393700",
            "eng": "27214"
          }
        ]
      }
    },
    "boire": {
      "display": "boire",
      "prepositions": {
        "de": [
          "Buvez du thé. 喝茶。",
          "Je buvais du lait. 我刚才在喝牛奶。",
          "Nous buvons de tout. 我们什么都喝。",
          "J'ai bu du thé hier. 我昨天喝了茶。",
          "Mélanie boit du lait. 梅拉妮在喝牛奶。",
          "Il ne boit pas de café. 他不喝咖啡。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "8984243",
            "zh": "6092434",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6900",
            "zh": "770709",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "470363",
            "zh": "471196",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "5490004",
            "zh": "10284565",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2790051",
            "zh": "2790039",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1724519",
            "zh": "1724523",
            "eng": ""
          }
        ]
      }
    },
    "bonder": {
      "display": "bonder",
      "prepositions": {
        "de": [
          "Le train était bondé de monde. 火车挤满了人。",
          "Il faudra t'habituer aux trains bondés de Tokyo. 你要习惯东京拥挤的火车。",
          "La pièce était bondée de journalistes attendant que la conférence de presse commence. 房间挤满了等待发布会开始的记者。",
          "La plage était bondée de touristes. 这个沙滩挤满了游客"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "429079",
            "zh": "819751",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426231",
            "zh": "426321",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "817866",
            "zh": "818836",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4990681",
            "zh": "4989883",
            "eng": "4989459"
          }
        ]
      }
    },
    "border": {
      "display": "border",
      "prepositions": {
        "de": [
          "L'étang était bordé d'arbres. 池溏的四周长满了树木。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "826827",
            "zh": "616236",
            "eng": "277306"
          }
        ]
      }
    },
    "bouillir": {
      "display": "bouillir",
      "prepositions": {
        "de": [
          "Nous sommes en train de bouillir de l'eau. 我们在烧水。",
          "Faites bouillir de l'eau. 烧一点水。",
          "Jessie fait bouillir de l'eau pour faire le café. 杰西正在烧开水来冲咖啡。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "3657852",
            "zh": "10301351",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3657451",
            "zh": "392263",
            "eng": "64141"
          },
          {
            "kind": "indirect",
            "fr": "1359097",
            "zh": "891967",
            "eng": "53706"
          }
        ]
      }
    },
    "bourrer": {
      "display": "bourrer",
      "prepositions": {
        "de": [
          "L'été, la place Saint-Marc, à Venise, est toujours bourrée de touristes. 威尼斯的圣马可广场在夏季总是挤满了游客。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "10629626",
            "zh": "332776",
            "eng": ""
          }
        ]
      }
    },
    "briser": {
      "display": "briser",
      "prepositions": {
        "en": [
          "Le vase était brisé en morceaux. 花瓶被摔成了碎片。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "3141626",
            "zh": "485861",
            "eng": "23706"
          }
        ]
      }
    },
    "brûler": {
      "display": "brûler",
      "prepositions": {
        "dans": [
          "Ne sens-tu pas quelque chose qui brûle dans la cuisine ? 你没觉得厨房里有什么东西烧糊了吗？"
        ],
        "avec": [
          "Le soufre brûle avec une flamme bleue. 硫磺燃烧着蓝色的火焰。",
          "Je me suis brûlé avec de l'eau bouillante. 我给沸水烫伤了。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "avec"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "833871",
            "zh": "1313989",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "135587",
            "zh": "798050",
            "eng": "325501"
          },
          {
            "kind": "indirect",
            "fr": "129833",
            "zh": "2183247",
            "eng": "282143"
          }
        ]
      }
    },
    "bâtir": {
      "display": "bâtir",
      "prepositions": {
        "en": [
          "Les pyramides furent bâties en des temps anciens. 金字塔是古时候建造的。",
          "Rome ne fut pas bâtie en un jour. 罗马不是一天建成的。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "803601",
            "zh": "845935",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8941299",
            "zh": "74",
            "eng": "1777"
          }
        ]
      }
    },
    "cacher": {
      "display": "cacher",
      "prepositions": {
        "dans": [
          "Je me suis caché dans les herbes hautes. 我躲在高草丛里了。",
          "Le renard s'est caché dans l'arbre creux. 狐狸躲在了空心树里面。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "11946185",
            "zh": "8936488",
            "eng": "8933496"
          },
          {
            "kind": "indirect",
            "fr": "9012440",
            "zh": "365792",
            "eng": "63325"
          }
        ]
      }
    },
    "casser": {
      "display": "casser",
      "prepositions": {
        "en": [
          "Le moteur de la voiture cassa en route. 汽车的发动机在路上坏了。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "463517",
            "zh": "1311380",
            "eng": ""
          }
        ]
      }
    },
    "causer": {
      "display": "causer",
      "prepositions": {
        "par": [
          "Ce qui était tout d'abord une catastrophe naturelle est vite devenu une débâcle causée par l'homme. 起初的天灾迅速演变为了人祸。",
          "Certaines maladies sont causées par un gène défectueux. 一些疾病的产生原因是基因缺陷。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "2143096",
            "zh": "10272653",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1190543",
            "zh": "3630130",
            "eng": "681062"
          }
        ]
      }
    },
    "cesser": {
      "display": "cesser",
      "prepositions": {
        "de": [
          "cesser de faire qqch 停止做某事",
          "Cessez de me mentir ! 您可别再说瞎话了！",
          "Il a cessé de pleuvoir. 雨停了。",
          "Tu dois cesser de fumer. 你必须停止吸烟。",
          "Vous devez cesser de fumer. 您该戒烟。",
          "Tu devrais cesser de fumer. 你该戒烟。",
          "L'arbre a cessé de grandir. 这棵树停止生长了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "8685200",
            "zh": "10299645",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10129985",
            "zh": "10746650",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "427375",
            "zh": "429114",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "468813",
            "zh": "469339",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474825",
            "zh": "469337",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1032120",
            "zh": "1409360",
            "eng": ""
          }
        ]
      }
    },
    "changer": {
      "display": "changer",
      "prepositions": {
        "de": [
          "changer de qqch 更换某物（换车、换工作）",
          "Ne change pas d'avis. 不要改变你的心意。",
          "Cette fille a changé de look. 这个女孩样子变了。",
          "J'aimerais changer de l'argent. 我想换点钱。",
          "Le garçon ne changea pas d'avis. 男孩没有改变主意。",
          "Il a changé de sujet de conversation. 他转变了话题。",
          "Qu'est-ce qui t'a fait changer d'avis ? 是什么让你改变了主意？"
        ],
        "en": [
          "changer qqch en qqch 把某物变成某物",
          "Le temps change souvent en Angleterre. 英国的天气经常变。",
          "L'eau s'est changée en glace. 水结成冰了。"
        ]
      },
      "prepositionOrder": [
        "de",
        "en"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "9330",
            "zh": "872102",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4321",
            "zh": "406730",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135613",
            "zh": "411643",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "571250",
            "zh": "846680",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133542",
            "zh": "429196",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3661",
            "zh": "502780",
            "eng": ""
          }
        ],
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "336717",
            "zh": "336600",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3657931",
            "zh": "2241817",
            "eng": "270834"
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "changer d'avis 改变主意",
          "collocation": "changer d'avis",
          "chinese": "改变主意",
          "source": "authored"
        }
      ]
    },
    "chanter": {
      "display": "chanter",
      "prepositions": {
        "en": [
          "Ils chantaient en chœur. 他们齐声合唱。",
          "Il chanta en travaillant. 他一边唱歌一边工作。",
          "Je n'aime pas chanter en public. 我不喜欢在公共场合唱歌。",
          "Tom veut apprendre à chanter en français. 汤姆想学唱法语歌。",
          "As-tu déjà entendu cette chanson chantée en français ? 你有听过那首歌的法文版本吗？"
        ],
        "dans": [
          "Il aime chanter dans la baignoire. 他喜欢在浴缸里唱歌。",
          "Le moineau chante dans les arbres. 麻雀正在树上唱歌。",
          "Les oiseaux chantaient dans les bois. 鸟儿在森林里歌唱。",
          "Je l'ai entendue chanter dans sa chambre. 我听到她在她的房间里唱歌。",
          "Quelquefois j'entends mon père chanter dans la salle de bain. 我有时会听到父亲在浴室里唱歌。",
          "On doit aller chanter dans une maison de retraite, aujourd'hui. 我们今天得去养老院唱歌。"
        ],
        "avec": [
          "Viens chanter avec moi. 跟我一起来唱吧。",
          "J'aime bien chanter avec Tom. 我喜欢跟汤姆唱歌。"
        ]
      },
      "prepositionOrder": [
        "en",
        "dans",
        "avec"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "332373",
            "zh": "346003",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "494093",
            "zh": "1454456",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "14661",
            "zh": "881562",
            "eng": "270616"
          },
          {
            "kind": "indirect",
            "fr": "6016282",
            "zh": "5780497",
            "eng": "5780474"
          },
          {
            "kind": "indirect",
            "fr": "1577938",
            "zh": "368718",
            "eng": "68530"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "2979053",
            "zh": "876745",
            "eng": "289506"
          },
          {
            "kind": "indirect",
            "fr": "10116166",
            "zh": "8744816",
            "eng": "8743000"
          },
          {
            "kind": "indirect",
            "fr": "822983",
            "zh": "642841",
            "eng": "269469"
          },
          {
            "kind": "indirect",
            "fr": "1317571",
            "zh": "881007",
            "eng": "261049"
          },
          {
            "kind": "indirect",
            "fr": "7000",
            "zh": "13556591",
            "eng": "255204"
          },
          {
            "kind": "indirect",
            "fr": "5741444",
            "zh": "5715125",
            "eng": "5715092"
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "564177",
            "zh": "628538",
            "eng": "563197"
          },
          {
            "kind": "indirect",
            "fr": "5741488",
            "zh": "5715120",
            "eng": "5715087"
          }
        ]
      }
    },
    "charger": {
      "display": "charger",
      "prepositions": {
        "de": [
          "charger qqn de qqch 委托某人做某事",
          "Je n'aime pas me charger de lourdes responsabilités. 我不喜欢担负重要责任。",
          "Elle a été chargée de cours. 她以前是一位老师。",
          "Je me chargerai de ce problème. 我会处理这个问题。",
          "Je suis chargé d'une importante mission. 我身负一个重要的任务。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "7132",
            "zh": "510902",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7547438",
            "zh": "686418",
            "eng": "418829"
          },
          {
            "kind": "indirect",
            "fr": "623095",
            "zh": "417782",
            "eng": "6898771"
          },
          {
            "kind": "indirect",
            "fr": "6345",
            "zh": "332907",
            "eng": "258528"
          }
        ]
      }
    },
    "chercher": {
      "display": "chercher",
      "prepositions": {
        "à": [
          "chercher à faire qqch 设法做某事",
          "Ils cherchaient à percer la ligne ennemie. 他们试图冲破敌军防线。",
          "Je viendrai vous chercher à 8 heures demain matin. 我明早八点来接你。",
          "N'oublie pas de venir me chercher à 6 heures demain. 不要忘记明天6点来找我。",
          "Je préfère chercher une solution aux problèmes, pas seulement les dénoncer. 我更喜欢寻求问题的解决方法，而不仅仅是揭露它们。",
          "Il cherche à plaire. 他非常想让别人满意。",
          "J'ai faim, je vais chercher à manger. 我饿了，所以我要吃东西。"
        ],
        "dans": [
          "Cherche dans chaque pièce. 搜查每个房间。"
        ]
      },
      "prepositionOrder": [
        "à",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "461450",
            "zh": "461548",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135357",
            "zh": "332657",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "487372",
            "zh": "487445",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4042",
            "zh": "389809",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1182037",
            "zh": "13901004",
            "eng": "300120"
          },
          {
            "kind": "indirect",
            "fr": "7415405",
            "zh": "6120924",
            "eng": "372009"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "7071810",
            "zh": "13174513",
            "eng": "2249861"
          }
        ]
      }
    },
    "choisir": {
      "display": "choisir",
      "prepositions": {
        "de": [
          "choisir de faire qqch 选择做某事",
          "Il a choisi d'être avocat dans la vie. 他选择了律师作为他的终生职业。",
          "J'ai choisi de moi-même d'être professeur. 教书是我自己选择的职业。",
          "Il a choisi de ne pas se présenter à l'élection présidentielle. 他选择不出席总统大选。"
        ],
        "pour": [
          "Il a été choisi pour sa perspicacité. 他因为他的洞察力而被选上了。",
          "Qui t'a choisi pour cette mission ? 谁选你来做这个任务？"
        ],
        "entre": [
          "choisir entre deux choses 在两者之间选择",
          "Elle ne peut pas choisir entre trouver un emploi ou aller à l'université. 她在找工作和读大学之间无法取舍。",
          "Choisis entre les deux. 在两者之间做选择。",
          "J'ai dû choisir entre les deux. 我必须在两者中选择。",
          "Tu peux choisir entre la soupe et la salade. 你有两种选择，汤，或沙拉。"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour",
        "entre"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "353478",
            "zh": "353499",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "928110",
            "zh": "2031260",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132916",
            "zh": "405145",
            "eng": ""
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "803983",
            "zh": "805500",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3961659",
            "zh": "5845553",
            "eng": "3731241"
          }
        ],
        "entre": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "134457",
            "zh": "819726",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11433",
            "zh": "13199823",
            "eng": "280838"
          },
          {
            "kind": "indirect",
            "fr": "11540329",
            "zh": "4265778",
            "eng": "280824"
          },
          {
            "kind": "indirect",
            "fr": "553781",
            "zh": "1424257",
            "eng": "52341"
          }
        ]
      }
    },
    "chouchouter": {
      "display": "chouchouter",
      "prepositions": {
        "de": [
          "C'est la chouchoute du professeur. 她是老师的宝贝。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "134509",
            "zh": "437231",
            "eng": ""
          }
        ]
      }
    },
    "chuchoter": {
      "display": "chuchoter",
      "prepositions": {
        "à": [
          "Permettez-moi de vous chuchoter à l'oreille. 我凑到你耳边说。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "12921804",
            "zh": "13922428",
            "eng": "3726256"
          }
        ]
      }
    },
    "circuler": {
      "display": "circuler",
      "prepositions": {
        "sur": [
          "Aux États-Unis, les voitures circulent sur le côté droit de la route. 在美国，汽车靠右行驶。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "6396064",
            "zh": "707694",
            "eng": "4356255"
          }
        ]
      }
    },
    "classer": {
      "display": "classer",
      "prepositions": {
        "par": [
          "Les livres étaient classés par ordre alphabétique. 书是按字母排序的。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "11189992",
            "zh": "10706229",
            "eng": "10091680"
          }
        ]
      }
    },
    "cliquer": {
      "display": "cliquer",
      "prepositions": {
        "sur": [
          "Cliquez sur l'image pour aller à la page suivante ! 点击图片进入下一页!"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "785954",
            "zh": "787562",
            "eng": ""
          }
        ]
      }
    },
    "clouer": {
      "display": "clouer",
      "prepositions": {
        "à": [
          "La Tour Eiffel est clouée au cœur de Paris. 埃菲尔铁塔镶嵌在巴黎的中心。",
          "Les muscles de ses jambes s'étaient atrophiés durant les sept mois qu'il était cloué au lit. 他的腿部肌肉在他卧床不起的七个月中萎缩了。",
          "Elle était clouée au lit hier. 她昨天卧病在床。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1007689",
            "zh": "1330046",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "801064",
            "zh": "864398",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1540215",
            "zh": "864362",
            "eng": "244352"
          }
        ]
      }
    },
    "coincer": {
      "display": "coincer",
      "prepositions": {
        "dans": [
          "Il y a quelque chose de coincé dans le tuyau. 有东西卡在管子里。",
          "Je suis coincé dans mon boulot. 我被工作困住了。",
          "Une arête est coincée dans ma gorge. 一根鱼刺卡在我嗓子里了。",
          "J'ai une arête coincée dans ma gorge. 我被鱼骨刺到了喉咙。",
          "Avez-vous jamais été coincé dans un ascenseur ? 你有没有被困在电梯里过？",
          "Le réparateur devait arriver à midi, mais il s'est retrouvé coincé dans des bouchons pendant plusieurs heures. 这个工人本来应该在中午十二点到达, 但他被交通堵塞困住了几个小时。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "1385428",
            "zh": "785246",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2281939",
            "zh": "6568300",
            "eng": "2253284"
          },
          {
            "kind": "indirect",
            "fr": "1608301",
            "zh": "1602364",
            "eng": "1602365"
          },
          {
            "kind": "indirect",
            "fr": "9222",
            "zh": "1899644",
            "eng": "19356"
          },
          {
            "kind": "indirect",
            "fr": "955243",
            "zh": "9135844",
            "eng": "953289"
          },
          {
            "kind": "indirect",
            "fr": "704617",
            "zh": "778901",
            "eng": "704605"
          }
        ]
      }
    },
    "coller": {
      "display": "coller",
      "prepositions": {
        "à": [
          "Il écouta l'oreille collée à la porte. 他把耳朵贴在门上听。",
          "Les yeux de Tom étaient collés à l'écran. Tom的眼睛被荧幕吸引住了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "131217",
            "zh": "6091761",
            "eng": "291898"
          },
          {
            "kind": "indirect",
            "fr": "4837307",
            "zh": "4844724",
            "eng": "4837198"
          }
        ]
      }
    },
    "combattre": {
      "display": "combattre",
      "prepositions": {
        "pour": [
          "Ils ont combattu pour leur pays. 他们为祖国而战斗。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "11969052",
            "zh": "1366198",
            "eng": "306548"
          }
        ]
      }
    },
    "commencer": {
      "display": "commencer",
      "prepositions": {
        "à": [
          "commencer à faire qqch 开始做某事",
          "Je commence à peine. 我才刚开始。",
          "Il commença à courir. 他跑了起来。",
          "Ça commence à 6 h 30. 六点半开始。",
          "Il a commencé à neiger. 开始下雪了。",
          "Je commençai à saigner. 我开始流血了。",
          "Elle commença à chanter. 她开始唱歌了。"
        ],
        "par": [
          "commencer par qqch 从某事开始",
          "Commençons par ce problème. 从这个问题开始吧。",
          "Commençons par la dernière ligne ! 让我们从最后一行开始吧。",
          "Commençons par le premier chapitre. 从第一章开始吧。",
          "Un voyage de mille milles commence par un simple pas. 千里之行，始于足下。",
          "Il a commencé par dire qu'il ne parlerait pas trop longtemps. 他一开始说他不会说很久。",
          "Commençons par la leçon 10. 我们从第十课开始吧。"
        ]
      },
      "prepositionOrder": [
        "à",
        "par"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "6537",
            "zh": "9518567",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "362340",
            "zh": "13532022",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1569149",
            "zh": "10657915",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "397262",
            "zh": "794257",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465172",
            "zh": "466269",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465708",
            "zh": "465837",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "781400",
            "zh": "784559",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13556886",
            "zh": "780070",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1365255",
            "zh": "13532019",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "751010",
            "zh": "3657277",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130690",
            "zh": "375294",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "9970",
            "zh": "1446985",
            "eng": "73451"
          }
        ]
      },
      "notes": {
        "par": "commencer par = 从…开始；commencer à faire = 开始做",
        "à": "commencer à faire = 开始做；commencer par = 从…开始"
      }
    },
    "commettre": {
      "display": "commettre",
      "prepositions": {
        "de": [
          "Je commets trop de fautes. 我犯错太多。",
          "Ne commets pas de nouveau la même erreur. 不要再犯同样的错了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "804697",
            "zh": "804854",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "500968",
            "zh": "347419",
            "eng": ""
          }
        ]
      }
    },
    "communiquer": {
      "display": "communiquer",
      "prepositions": {
        "par": [
          "Aux premiers temps, les hommes communiquaient par signaux de fumée. 以前人们用烟作为联络信号。",
          "Ils communiquent par gestes. 她们用手势沟通。",
          "Les pilotes communiquent par radio avec l'aéroport. 飞行员用无线电与机场沟通。"
        ],
        "avec": [
          "Le langage est le moyen par lequel les gens communiquent avec les autres. 语言是人们与他人交流的手段。"
        ]
      },
      "prepositionOrder": [
        "par",
        "avec"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "817149",
            "zh": "817267",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "181761",
            "zh": "10323881",
            "eng": "305564"
          },
          {
            "kind": "indirect",
            "fr": "4727393",
            "zh": "798201",
            "eng": "35510"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "529729",
            "zh": "1314425",
            "eng": ""
          }
        ]
      }
    },
    "comparer": {
      "display": "comparer",
      "prepositions": {
        "à": [
          "Londres est grand, comparé à Paris. 和巴黎比起来，伦敦很大。",
          "Comparée à ta voiture, la mienne est petite. 和你的车比起来，我的车很小。",
          "Nos problèmes ne sont rien comparés aux siens. 我们的问题和她的比起来不算什么。",
          "Tes problèmes ne sont rien, comparés aux miens. 和我的比起来，你的问题微不足道。",
          "La lecture d'un livre peut être comparée à un voyage. 阅读一本书可以比作一次旅行。",
          "Si on la compare à Tokyo, Londres est une petite ville. 如果和东京比，那伦敦就是个小城市。"
        ],
        "avec": [
          "comparer qqch avec qqch 把某物与某物比较"
        ]
      },
      "prepositionOrder": [
        "à",
        "avec"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "13823",
            "zh": "389432",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14982",
            "zh": "332575",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7993",
            "zh": "799275",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1017330",
            "zh": "1328021",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129637",
            "zh": "1313759",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "393766",
            "zh": "846734",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "compatir": {
      "display": "compatir",
      "prepositions": {
        "avec": [
          "Je compatis avec toi. 我同情你。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "477125",
            "zh": "762968",
            "eng": "17448"
          }
        ]
      }
    },
    "comporter": {
      "display": "comporter",
      "prepositions": {
        "de": [
          "La langue française comporte beaucoup de synonymes. 法语中包含了很多近义词。",
          "Ce livre comporte beaucoup de belles illustrations. 这本书包含了许多美丽的插图。",
          "Ta rédaction est très bonne, et comporte peu de fautes. 你的作文非常好，而且错误很少。",
          "Ayant été écrite en grande hâte, cette lettre comporte pas mal de fautes. 这封信是十分匆匆忙忙地写的，所以有不少笔误。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "459456",
            "zh": "512860",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1870793",
            "zh": "1870806",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426130",
            "zh": "426366",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2188829",
            "zh": "758630",
            "eng": "66982"
          }
        ]
      }
    },
    "composer": {
      "display": "composer",
      "prepositions": {
        "de": [
          "Le comité est composé de douze membres. 委员会由十二名成员组成。",
          "Cette forêt est surtout composée de cyprès. 这片森林的树主要是柏树。",
          "Ce groupe est composé de six membres. 那组有六个组员。",
          "L'eau est composée d'oxygène et d'hydrogène. 水是由氢和氧组成的。",
          "Le comité est composé de scientifiques et d'ingénieurs. 委员会是由科学家和工程师组成的。",
          "À strictement parler, le chinois est composé de centaines de dialectes. 严格来说，中文包含几百种方言。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "713321",
            "zh": "1350318",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "690097",
            "zh": "690098",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "486607",
            "zh": "371142",
            "eng": "50523"
          },
          {
            "kind": "indirect",
            "fr": "119991",
            "zh": "377728",
            "eng": "270780"
          },
          {
            "kind": "indirect",
            "fr": "459876",
            "zh": "393683",
            "eng": "49656"
          },
          {
            "kind": "indirect",
            "fr": "727208",
            "zh": "10192346",
            "eng": "239509"
          }
        ]
      }
    },
    "compter": {
      "display": "compter",
      "prepositions": {
        "sur": [
          "compter sur qqn 指望某人",
          "J'ai compté sur lui. 我依靠了他。",
          "On ne peut pas compter sur eux. 他们不可靠。",
          "Il est si honnête que je peux compter sur lui. 他很诚实，我可以信赖他。",
          "Tu peux compter sur lui. 你可以依靠他。",
          "On peut compter sur elle. 你可以相信她。",
          "Tu peux compter sur Jack. 你可以信赖杰克。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "465706",
            "zh": "465840",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9391914",
            "zh": "10287444",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "131261",
            "zh": "452625",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "663661",
            "zh": "1780770",
            "eng": "9905"
          },
          {
            "kind": "indirect",
            "fr": "485911",
            "zh": "779053",
            "eng": "662711"
          },
          {
            "kind": "indirect",
            "fr": "3661784",
            "zh": "840667",
            "eng": "53087"
          }
        ]
      }
    },
    "concentrer": {
      "display": "concentrer",
      "prepositions": {
        "sur": [
          "Je ne peux pas me concentrer sur mon travail à cause du bruit. 由于噪音，我无法集中精力工作了。",
          "Je pense que nous devrions nous concentrer sur d'autres choses. 我想我们应集中于另外的事情。",
          "Je n'arrive pas à me concentrer sur deux choses à la fois. 我不能同时注意两件事。",
          "Comment veux-tu te concentrer sur tes devoirs avec la télé allumée ? 你开着电视怎么能安心学习呢？"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "786315",
            "zh": "787537",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "5959540",
            "zh": "8500204",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2302474",
            "zh": "6903875",
            "eng": "2301964"
          },
          {
            "kind": "indirect",
            "fr": "2310771",
            "zh": "717323",
            "eng": "717326"
          }
        ]
      }
    },
    "concerner": {
      "display": "concerner",
      "prepositions": {
        "en": [
          "Cette affaire ne te concerne en rien. 这件事与你无关。"
        ],
        "par": [
          "Je ne suis pas concerné par cette affaire. 这件事和我无关。",
          "Je suis vraiment concerné par votre avenir. 我真的很关心你的未来。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "1523196",
            "zh": "1185800",
            "eng": "1185801"
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "7248",
            "zh": "345820",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "127922",
            "zh": "796002",
            "eng": "261765"
          }
        ]
      }
    },
    "condamner": {
      "display": "condamner",
      "prepositions": {
        "à": [
          "L'homme est condamné à mourir. 人注定要死的。",
          "L'accusé a été condamné à mort. 被告被判处了死刑。",
          "Ton âme est condamnée à l'enfer. 你的灵魂已坠进了地狱。",
          "Votre plan est condamné à l'échec. 您的计划是注定要失败的。",
          "Le meurtrier fut déclaré coupable et condamné à un emprisonnement à vie. 凶手被判有罪，并处以终身监禁。",
          "Le juge l'a condamné à un an d'emprisonnement. 法官判了他一年有期徒刑。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "500908",
            "zh": "500933",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134740",
            "zh": "346803",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "443218",
            "zh": "339289",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474397",
            "zh": "476655",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3815",
            "zh": "503022",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "437487",
            "zh": "385511",
            "eng": "282740"
          }
        ]
      }
    },
    "conduire": {
      "display": "conduire",
      "prepositions": {
        "à": [
          "Je te conduirai à l'aéroport. 我会开车送你去机场。",
          "Je vais vous conduire à l'aéroport. 我会开车送你们去机场。",
          "Cette route vous conduit à la gare. 这条路带你们通往火车站。",
          "Il eut l'amabilité de me conduire à l'hôpital. 他好心地把我送到医院。",
          "L'alcoolisme est un facteur conduisant à l'impuissance. 酗酒是导致阳痿的一个因素。",
          "Je préfère conduire à marcher. 我喜欢骑车胜过走路。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "542546",
            "zh": "745828",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "338398",
            "zh": "745829",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465310",
            "zh": "466148",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334024",
            "zh": "334052",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2113699",
            "zh": "796378",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "337847",
            "zh": "875042",
            "eng": "320514"
          }
        ]
      }
    },
    "confondre": {
      "display": "confondre",
      "prepositions": {
        "avec": [
          "Elle m'a confondu avec mon frère. 她把我认作我弟弟了。",
          "Il me confond toujours avec ma sœur. 他老是把我和我姐姐搞错。",
          "Je l'ai confondu avec son frère. 我把他误认为是他的兄弟。",
          "Ils le confondirent avec son frère. 他们错把他当成他的兄弟。",
          "Vous me confondez avec quelqu'un d'autre. 你认错人了。",
          "Il semble que vous m'ayez confondu avec mon frère aîné. 你似乎把我当成我哥哥了。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "791226",
            "zh": "791483",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130750",
            "zh": "343842",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "540189",
            "zh": "848358",
            "eng": "539608"
          },
          {
            "kind": "indirect",
            "fr": "823639",
            "zh": "8589133",
            "eng": "307424"
          },
          {
            "kind": "indirect",
            "fr": "12846089",
            "zh": "11341477",
            "eng": "8311741"
          },
          {
            "kind": "indirect",
            "fr": "1174436",
            "zh": "2017439",
            "eng": "69298"
          }
        ]
      }
    },
    "conformer": {
      "display": "conformer",
      "prepositions": {
        "à": [
          "Merci de vous conformer aux recommandations de l'infirmière. 请遵循护士的指导。",
          "Vous devez vous conformer aux règles de circulation. 你应该遵守交通规则。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "486878",
            "zh": "686643",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "551484",
            "zh": "660566",
            "eng": "484905"
          }
        ]
      }
    },
    "confronter": {
      "display": "confronter",
      "prepositions": {
        "à": [
          "Il est confronté à de nombreuses difficultés. 他面临着许多困难。",
          "La Russie est confrontée à de grandes difficultés financières. 俄罗斯面临着严重的财政困难。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "834740",
            "zh": "885382",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11184531",
            "zh": "405750",
            "eng": "29368"
          }
        ]
      }
    },
    "connaître": {
      "display": "connaître",
      "prepositions": {
        "pour": [
          "Kyoto est connu pour ses autels et ses temples. 京都以它的祭坛和寺院而闻名。",
          "La ville dans laquelle je suis né est connue pour ses vieux châteaux. 我出生的城市以它的古老的城堡们而闻名。",
          "Le lac Towada est connu pour sa beauté. 十和田湖以它的美丽闻名。",
          "Kyoto est connue pour ses temples anciens. 京都以古庙有名。",
          "Kobe est connue pour être une ville portuaire. 神户是一个著名的港口城市。",
          "La cuisine coréenne est connue pour son goût épicé. 韩国菜以辛辣闻名。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "379595",
            "zh": "379588",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "685982",
            "zh": "1313813",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "341297",
            "zh": "797100",
            "eng": "266534"
          },
          {
            "kind": "indirect",
            "fr": "9209",
            "zh": "797142",
            "eng": "19296"
          },
          {
            "kind": "indirect",
            "fr": "751156",
            "zh": "797040",
            "eng": "269687"
          },
          {
            "kind": "indirect",
            "fr": "12451517",
            "zh": "426999",
            "eng": "20813"
          }
        ]
      }
    },
    "consacrer": {
      "display": "consacrer",
      "prepositions": {
        "à": [
          "Il s'est toujours consacré à l'étude de l'énergie atomique depuis qu'il a été diplômé de l'université. 从他大学毕业后，他就一直致力于原子能的研究。",
          "L'argent que vous leur donnez sera consacré à un bon usage. 你给他们的钱会用到好处。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "489593",
            "zh": "490067",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "477507",
            "zh": "5558508",
            "eng": "17893"
          }
        ]
      }
    },
    "conseiller": {
      "display": "conseiller",
      "prepositions": {
        "de": [
          "Il m'a conseillé d'aller là-bas. 他建议我去那里。",
          "Je lui ai conseillé de garder le secret. 我建议他保密。",
          "Son médecin lui conseilla d'arrêter de fumer. 他的医生建议他戒烟。",
          "Je lui conseillai de prendre un train du matin. 我建议她去乘早车。",
          "Notre professeur de musique me conseilla de visiter Vienne. 我们的音乐老师建议我去游览维也纳。",
          "Je te conseille de ne jamais vivre au-dessus de tes moyens. 我建议你永远不要入不敷出。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "120007",
            "zh": "713134",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "127651",
            "zh": "717161",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130192",
            "zh": "332499",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "127801",
            "zh": "337223",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9717",
            "zh": "6148370",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334838",
            "zh": "334848",
            "eng": ""
          }
        ]
      }
    },
    "consentir": {
      "display": "consentir",
      "prepositions": {
        "à": [
          "consentir à qqch 同意某事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "consister": {
      "display": "consister",
      "prepositions": {
        "à": [
          "consister à faire qqch 在于做某事",
          "Son travail consiste à laver des voitures. 他的工作是洗车。",
          "Mon travail consiste à m'occuper de ce bébé. 我的工作是照顾那婴儿。",
          "À la maison, le travail de Mike consiste à laver les fenêtres. 在家里，麦克的工作就是擦窗户。",
          "La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui. 自由旨在能够做所有不伤害其他人的事。",
          "Le véritable art de vivre consiste à voir le merveilleux dans le quotidien. 生活真正的艺术是在平凡中看到不平凡。"
        ],
        "en": [
          "consister en qqch 由…构成"
        ]
      },
      "prepositionOrder": [
        "à",
        "en"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1732626",
            "zh": "9179750",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "479629",
            "zh": "348933",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13401",
            "zh": "444651",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3692",
            "zh": "502843",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "461482",
            "zh": "461489",
            "eng": ""
          }
        ],
        "en": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "consommer": {
      "display": "consommer",
      "prepositions": {
        "de": [
          "Les Suisses consomment beaucoup de bière. 瑞士人消耗不少啤酒。",
          "Vous êtes-vous enfin accoutumées à consommer de la nourriture japonaise ? 你们习惯吃日本的食物了吗？",
          "Ils consomment de la viande. 他们吃肉。",
          "Puis-je consommer de l'alcool ? 我可以喝酒吗？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1102596",
            "zh": "1250601",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1475974",
            "zh": "2333753",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8648934",
            "zh": "8854279",
            "eng": "2336608"
          },
          {
            "kind": "indirect",
            "fr": "1259591",
            "zh": "567980",
            "eng": "64381"
          }
        ]
      }
    },
    "constituer": {
      "display": "constituer",
      "prepositions": {
        "de": [
          "L'homme est constitué d'une âme et d'un corps. 人是由灵魂和肉身组成的。",
          "L'air que nous respirons est constitué d'oxygène et d'azote. 我们呼吸的空气是由氧气和氮气组成的。"
        ],
        "pour": [
          "Une commission a été constituée pour enquêter sur les prix. 为了调查物价，成立了一个委员会。",
          "Une nouvelle équipe fut constituée pour participer à la course d'avirons. 为了参加划船比赛，一支新的队伍组成了。"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "10683121",
            "zh": "348130",
            "eng": "270298"
          },
          {
            "kind": "indirect",
            "fr": "1516325",
            "zh": "9409466",
            "eng": "262578"
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "351182",
            "zh": "351235",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "839766",
            "zh": "336671",
            "eng": ""
          }
        ]
      }
    },
    "construire": {
      "display": "construire",
      "prepositions": {
        "en": [
          "Rome ne fut pas construite en un jour. 罗马不是一天建成的。"
        ],
        "pour": [
          "Londres était une ville construite pour le cheval. 伦敦是一个为马而建立的城市。",
          "Ce mur a-t-il été construit pour laisser les gens dehors ou les garder à l'intérieur ? 建造这堵墙是为了把人隔在外面还是把他们留在里面？"
        ]
      },
      "prepositionOrder": [
        "en",
        "pour"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "8941302",
            "zh": "74",
            "eng": "1777"
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "791206",
            "zh": "791495",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "815232",
            "zh": "815254",
            "eng": ""
          }
        ]
      }
    },
    "contenir": {
      "display": "contenir",
      "prepositions": {
        "de": [
          "Ce verre contient de l'eau. 这个杯子里有水。",
          "Ce poisson ne contient pas de poison. 这条鱼没有毒。",
          "Ce livre contient de nombreuses images. 这本书有很多插图。",
          "Les oranges contiennent beaucoup de vitamine C. 柳丁含有大量的维生素 C。",
          "Les carottes contiennent beaucoup de vitamine A. 胡萝卜中含有大量的维生素A。",
          "L'acide agit sur les choses qui contiennent du métal. 酸会和金属物质起化学反应。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "331087",
            "zh": "9135883",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337104",
            "zh": "336955",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334361",
            "zh": "334386",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1354440",
            "zh": "891131",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "407140",
            "zh": "797070",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333264",
            "zh": "333275",
            "eng": ""
          }
        ]
      }
    },
    "contenter": {
      "display": "contenter",
      "prepositions": {
        "de": [
          "Ne vous contentez pas de pleurer, faites quelque chose ! 别只顾着哭，做些什么啊！"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "2153829",
            "zh": "9955959",
            "eng": ""
          }
        ]
      }
    },
    "continuer": {
      "display": "continuer",
      "prepositions": {
        "à": [
          "continuer à faire qqch 继续做某事",
          "J'ai continué à lire. 我继续阅读。",
          "J'ai continué à chanter. 我继续唱歌。",
          "Sa mère continuera à travailler. 她母亲将继续工作。",
          "Il a continué à se moquer de moi. 他继续嘲笑我。",
          "Elle a continué à pleurer toute la nuit. 她一整晚都在哭。",
          "Ils continuent à lui demander de partir. 他们坚持让他走。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "486653",
            "zh": "1428112",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135180",
            "zh": "4270138",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335940",
            "zh": "334275",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "180634",
            "zh": "390889",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "485229",
            "zh": "333193",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "651536",
            "zh": "333037",
            "eng": ""
          }
        ]
      }
    },
    "contraindre": {
      "display": "contraindre",
      "prepositions": {
        "à": [
          "Il la contraignit à s'asseoir. 他强迫她坐下。",
          "Elle l'a contraint à s'asseoir. 她强迫他坐下。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1166832",
            "zh": "1325243",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1339617",
            "zh": "13108753",
            "eng": "887120"
          }
        ]
      }
    },
    "contribuer": {
      "display": "contribuer",
      "prepositions": {
        "à": [
          "contribuer à qqch 为某事作出贡献",
          "Il a beaucoup contribué au développement de l'économie. 他为经济发展作了很多贡献。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "131917",
            "zh": "427606",
            "eng": ""
          }
        ]
      }
    },
    "convaincre": {
      "display": "convaincre",
      "prepositions": {
        "de": [
          "Elle est convaincue de mon innocence. 她相信我是无辜的了。",
          "Je l'ai convaincu d'abandonner l'idée. 我说服他放弃了这个主意。",
          "Elle ne put le convaincre d'écrire une chanson pour elle. 她没能说服他为她写首歌。",
          "Ma femme essaya de me convaincre d'acheter une nouvelle voiture. 我妻子试图说服我买辆新车。",
          "Il m'a convaincu de son innocence. 他让我相信他是无辜的。",
          "Je suis convaincu de son innocence. 我相信他是无辜的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "134671",
            "zh": "345978",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14027",
            "zh": "336728",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1392991",
            "zh": "12538405",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8315",
            "zh": "1314418",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "132437",
            "zh": "5715190",
            "eng": "298532"
          },
          {
            "kind": "indirect",
            "fr": "454246",
            "zh": "881095",
            "eng": "283570"
          }
        ]
      }
    },
    "convenir": {
      "display": "convenir",
      "prepositions": {
        "à": [
          "convenir à qqn 适合某人",
          "Ce film convient aux enfants. 这部电影适合小孩看。",
          "Ta robe ne convient pas à la circonstance. 你的裙子不适合这种场合。",
          "Le poste ne convient pas à des jeunes filles. 这个岗位不合适小姑娘。",
          "Ce travail ne convient pas à de jeunes filles. 这个工作不适合年轻女孩。",
          "Ces ciseaux conviennent aux gauchers et aux droitiers. 这把剪刀左右撇子都适用。",
          "J'ai dû changer de vêtements parce que ce que je portais ne convenait pas à la situation. 我必须要换衣服，因为我现在穿的衣服不适合这个环境。"
        ],
        "pour": [
          "Le candidat a-t-il les capacités qui conviennent pour mener à bien le travail ? 那位求职者能胜任工作吗？"
        ]
      },
      "prepositionOrder": [
        "à",
        "pour"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "474748",
            "zh": "476622",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474962",
            "zh": "476522",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "479414",
            "zh": "2383499",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "847319",
            "zh": "847736",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7105434",
            "zh": "4117365",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2431334",
            "zh": "4797661",
            "eng": ""
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "492383",
            "zh": "344768",
            "eng": ""
          }
        ]
      }
    },
    "convertir": {
      "display": "convertir",
      "prepositions": {
        "à": [
          "Je suis né de confession hébraïque, mais en vieillissant, je me suis converti au narcissisme. 我天生具有希伯来人的说服才能，但当我年纪大了的时候，我把它转换成了自恋。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "433712",
            "zh": "873447",
            "eng": "433711"
          }
        ]
      }
    },
    "correspondre": {
      "display": "correspondre",
      "prepositions": {
        "à": [
          "Un mètre cube correspond à 1000 litres. 1立方米等于1000升。",
          "Ses idées ne correspondent pas aux miennes. 他的意见跟我的不一致。",
          "Tes paroles doivent correspondre à tes actions. 你的言行必须一致。",
          "La vie est belle parce qu'elle ne correspond pas toujours à nos attentes ! 人生美好啊，因为它不总是符合我们的预期。",
          "Un kilo de ketchup correspond à deux kilos de tomates. 一公斤的番茄酱等于两公斤的西红柿。",
          "Je ne connais personne qui corresponde à cette description. 我不认识符合条件的人。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "3576",
            "zh": "501723",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130275",
            "zh": "406731",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337044",
            "zh": "336937",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1671687",
            "zh": "12438599",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3692360",
            "zh": "923640",
            "eng": "934017"
          },
          {
            "kind": "indirect",
            "fr": "7967404",
            "zh": "8635816",
            "eng": "7821775"
          }
        ]
      }
    },
    "coucher": {
      "display": "coucher",
      "prepositions": {
        "avec": [
          "J'ai couché avec mon patron. 我把我老板睡了。",
          "Je veux coucher avec ta femme. 我想跟你老婆睡觉。",
          "Dima coucha avec 25 hommes en une seule nuit, puis les tua. 狄马一晚和二十五个男人睡了觉，然后就把他们杀掉了。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "489377",
            "zh": "11702350",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "784645",
            "zh": "786020",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "480038",
            "zh": "486513",
            "eng": ""
          }
        ]
      }
    },
    "couler": {
      "display": "couler",
      "prepositions": {
        "sur": [
          "Deux larmes ont coulé sur ses joues. 两滴眼泪从她的脸颊滑落下来。",
          "Des larmes coulèrent sur les joues d'Alice. 泪水沿着爱丽丝的脸颊流下来。",
          "Des larmes pourraient bien couler sur ton visage, je ne regarderai pas en arrière. 任凭眼泪在你脸上滑过，我头也不回。"
        ],
        "dans": [
          "Le ruisseau coule dans l'étang. 溪水流进这个池塘里。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "138651",
            "zh": "8727847",
            "eng": "72766"
          },
          {
            "kind": "indirect",
            "fr": "979986",
            "zh": "840557",
            "eng": "325975"
          },
          {
            "kind": "indirect",
            "fr": "4095649",
            "zh": "4081389",
            "eng": "4094882"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "1351774",
            "zh": "868280",
            "eng": "495618"
          }
        ]
      }
    },
    "couper": {
      "display": "couper",
      "prepositions": {
        "en": [
          "Je me suis coupé en me rasant. 刮胡子时，我把脸刮破了。",
          "Je me suis coupé en me rasant ce matin. 我今天早上刮胡子的时候把自己弄伤了。",
          "La pomme fut coupée en deux par elle avec un couteau. 苹果被她用刀切成了两半。",
          "Faites cuire les pommes de terre pelées et coupées en morceaux 20 minutes à l'eau bouillante. 把去皮切成小块的土豆放在滚水里煮20分钟。",
          "Depuis que j'ai installé des panneaux solaires sur ma maison, ma facture d'énergie a été coupée en deux. 自从我在我的房子上装了太阳能电池板，我的电费单就减半了。",
          "Il s'est coupé en quatre pour faire plaisir à sa femme. 他竭尽全力地讨好他老婆。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "518310",
            "zh": "721052",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "817449",
            "zh": "848467",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "459698",
            "zh": "1323686",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4015",
            "zh": "811065",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "811209",
            "zh": "812359",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1645946",
            "zh": "2516527",
            "eng": "296803"
          }
        ]
      }
    },
    "courir": {
      "display": "courir",
      "prepositions": {
        "dans": [
          "Nous courûmes dans le parc. 我们在公园里跑了步。",
          "J'ai vu de petits animaux courir dans tous les sens. 我看见小动物向四面八方跑去。",
          "S'il vous plait, ne courez pas dans la classe. 不要在课室里奔跑。",
          "À peine m'avait-elle aperçu qu'elle commença à courir dans ma direction. 她一见到我就马上跑了过来。"
        ],
        "vers": [
          "Les enfants courent vers la classe. 孩子们向教室跑去。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "vers"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "808104",
            "zh": "808263",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "128467",
            "zh": "343731",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1012548",
            "zh": "851050",
            "eng": "482046"
          },
          {
            "kind": "indirect",
            "fr": "488744",
            "zh": "343119",
            "eng": "314433"
          }
        ],
        "vers": [
          {
            "kind": "direct",
            "fr": "687144",
            "zh": "782280",
            "eng": ""
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "courir un risque 冒风险",
          "collocation": "courir un risque",
          "chinese": "冒风险",
          "source": "authored"
        }
      ]
    },
    "couronner": {
      "display": "couronner",
      "prepositions": {
        "de": [
          "Sa tentative d'évasion fut couronnée de succès. 他尝试逃走而成功了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "486603",
            "zh": "340119",
            "eng": "287260"
          }
        ]
      }
    },
    "couvrir": {
      "display": "couvrir",
      "prepositions": {
        "de": [
          "Il était couvert de boue. 他身上满是泥。",
          "Son visage a été couvert de boue. 他的脸上满是泥。",
          "Le pays en entier était couvert de neige. 整个国家被大雪覆盖了。",
          "L'oiseau était couvert de plumes blanches. 鸟儿身上铺满了白色的羽毛。",
          "Le sommet du Mt Fuji était couvert de neige. 富士山顶盖满了雪。",
          "Le prisonnier s'est échappé sous le couvert de la nuit. 犯人趁着夜晚逃走了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "132985",
            "zh": "1790081",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130228",
            "zh": "1790079",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334006",
            "zh": "334033",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334655",
            "zh": "334657",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "349798",
            "zh": "349929",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "484123",
            "zh": "335485",
            "eng": ""
          }
        ]
      }
    },
    "coïncider": {
      "display": "coïncider",
      "prepositions": {
        "avec": [
          "Le jour du festival coïncide avec celui de l'examen. 节日和考试碰巧在同一天。",
          "La publication de l'article a été programmée pour coïncider avec l'anniversaire du professeur. 文章的发表被预定在教授生日那天。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "333862",
            "zh": "333834",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "791307",
            "zh": "791400",
            "eng": ""
          }
        ]
      }
    },
    "coûter": {
      "display": "coûter",
      "prepositions": {
        "de": [
          "Ce dommage nous coûtera beaucoup d'argent. 这破坏会花费我们很多钱。",
          "Les réparations coûteront beaucoup d'argent. 修理将要花费很多钱。",
          "La construction de ce pont coûta beaucoup d'argent. 建这条桥花了不少钱。",
          "Une lune de miel au Canada coûte beaucoup d'argent. 去加拿大渡蜜月要花很多钱。",
          "Ce manteau a peut-être coûté beaucoup d'argent, mais il en vaut la peine. 那件大衣可能需要很多钱，但它值得。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "837777",
            "zh": "837776",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "128346",
            "zh": "336244",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1114185",
            "zh": "337336",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "345040",
            "zh": "357172",
            "eng": "63628"
          },
          {
            "kind": "indirect",
            "fr": "11454369",
            "zh": "6068362",
            "eng": "68700"
          }
        ]
      }
    },
    "cracher": {
      "display": "cracher",
      "prepositions": {
        "par": [
          "À Singapour, c'est un crime de cracher par terre. 随地吐痰在新加坡算是犯罪行为。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "485292",
            "zh": "10569178",
            "eng": "52474"
          }
        ]
      }
    },
    "craindre": {
      "display": "craindre",
      "prepositions": {
        "de": [
          "craindre de faire qqch 怕做某事",
          "Il craint d'être en retard. 他担心他可能会迟到。",
          "Je craignais d'arriver en retard. 我怕我会迟到。",
          "À Londres, la police craint toujours de trouver une bombe dans le train ou le métro. 在伦敦，警察总是担心在列车或地铁上发现炸弹。",
          "Je crains de t'avoir offensé. 我怕我冒犯了你。",
          "Je craignais d'être en retard. 我怕我可能迟到了。",
          "Il craint de commettre des erreurs. 他怕犯错。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1359179",
            "zh": "1361972",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "861169",
            "zh": "861157",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1330412",
            "zh": "5363943",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4426310",
            "zh": "835456",
            "eng": "237703"
          },
          {
            "kind": "indirect",
            "fr": "389664",
            "zh": "884203",
            "eng": "277413"
          },
          {
            "kind": "indirect",
            "fr": "442564",
            "zh": "340107",
            "eng": "294958"
          }
        ]
      }
    },
    "crever": {
      "display": "crever",
      "prepositions": {
        "de": [
          "Ce temps est à crever de chaud, j'ai tout simplement pas envie de sortir. 这天气热死人了，简直就不愿出门。",
          "Je crève de faim. 我饿死了！",
          "Je crève d'envie d'une boisson fraîche. 我迫切需要冷饮。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "2565206",
            "zh": "2564382",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "487277",
            "zh": "388516",
            "eng": "1754"
          },
          {
            "kind": "indirect",
            "fr": "1339546",
            "zh": "1450467",
            "eng": "262251"
          }
        ]
      }
    },
    "critiquer": {
      "display": "critiquer",
      "prepositions": {
        "pour": [
          "Le gardien de but anglais a été critiqué pour le nombre de buts qu'il a concédés. 英格兰的守门员因为自己失球过多而被批评。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "9117802",
            "zh": "3579584",
            "eng": "3579585"
          }
        ]
      }
    },
    "croire": {
      "display": "croire",
      "prepositions": {
        "à": [
          "croire à qqch 相信某事（存在／有效）",
          "Je crois aux fantômes. 我信鬼神之说。",
          "Il croit aux fantômes. 他相信鬼神之说。",
          "Tu crois aux fantômes ? 你相信鬼神之说吗？",
          "Je crois à cette histoire. 我相信那个故事。",
          "Vous croyez aux fantômes ? 您相信鬼神之说吗？",
          "Mon fils croit au Père Noël. 我儿子相信圣诞老人。"
        ],
        "en": [
          "croire en qqn 信任某人；信仰",
          "Nous croyons en Dieu. 我们相信上帝。",
          "Je crois encore en l'amour. 我依旧相信爱情。",
          "Nous croyons en la démocratie. 我们相信民主。",
          "Les chrétiens croient en Jésus-Christ. 天主教徒信奉耶稣基督。",
          "Elle lui dit qu'elle croyait en l'astrologie. 她告诉了他自己相信占星术。",
          "Crois en tes rêves, peu importe à quel point ils semblent impossibles ! 相信你的梦想，不论它们有多么地不切实际。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "127982",
            "zh": "426885",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133470",
            "zh": "366888",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10439",
            "zh": "472354",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7087",
            "zh": "343987",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135487",
            "zh": "346473",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1344024",
            "zh": "6065894",
            "eng": ""
          }
        ],
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "361130",
            "zh": "12615504",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1962115",
            "zh": "1962128",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "614817",
            "zh": "614821",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11046",
            "zh": "345990",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "911687",
            "zh": "5091735",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10112788",
            "zh": "10327482",
            "eng": ""
          }
        ]
      },
      "notes": {
        "en": "croire en qqn = 信任／信仰；croire à qqch = 相信某事属实",
        "à": "croire à qqch = 相信某事属实；croire en qqn = 信任某人"
      }
    },
    "croiser": {
      "display": "croiser",
      "prepositions": {
        "dans": [
          "Elle me sourit lorsqu'elle me croisa dans la rue. 她在大街上看见我的时候冲我笑了笑。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "134554",
            "zh": "2411914",
            "eng": "315881"
          }
        ]
      }
    },
    "cuisiner": {
      "display": "cuisiner",
      "prepositions": {
        "pour": [
          "Ils vont cuisiner pour vous. 他们会为你做饭。",
          "Elle aime cuisiner pour sa famille. 她喜欢为她的家人做饭。",
          "Il aime cuisiner pour sa famille. 他喜欢为家人做饭。",
          "Elle devra cuisiner pour tout le monde. 她将必须为大家做饭。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "4079697",
            "zh": "12169649",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334076",
            "zh": "334082",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "936945",
            "zh": "889623",
            "eng": "294448"
          },
          {
            "kind": "indirect",
            "fr": "134119",
            "zh": "905874",
            "eng": "312294"
          }
        ]
      }
    },
    "céder": {
      "display": "céder",
      "prepositions": {
        "à": [
          "Elle a cédé à la tentation. 她屈服于诱惑了。",
          "Ne cède pas à ces exigences. 不要屈服于这些要求。",
          "Tu ne dois pas céder à la tentation. 你不应该屈服在诱惑之下。",
          "Il céda sa place au vieil homme. 他把座位让给了老人。",
          "Elle a cédé sa place à une personne âgée. 她把她的座位让给了一个老人。",
          "Nous ne céderons jamais aux exigences des terroristes. 我们决不会屈服于恐怖份子的要求之下。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "806160",
            "zh": "805560",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799705",
            "zh": "798320",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4860560",
            "zh": "1228964",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3383202",
            "zh": "3500946",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11966426",
            "zh": "847867",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "442603",
            "zh": "471543",
            "eng": "23023"
          }
        ]
      }
    },
    "danser": {
      "display": "danser",
      "prepositions": {
        "sur": [
          "Parler de musique, c'est comme danser sur l'architecture. 用言语探讨音乐就好像用舞蹈议论建筑。",
          "Dansons sur sa chanson. 我们随着她的音乐起舞吧。"
        ],
        "avec": [
          "Veux-tu danser avec moi ? 你愿意和我跳舞吗？",
          "Pourquoi ne venez-vous pas danser avec moi ? 为什么你不来跟我跳舞？",
          "Ming ne dansait pas avec Masao à ce moment-là. 那时明没有在和正雄跳舞。",
          "Pourquoi n'as-tu pas dansé avec lui ? 你为什么不跟他跳舞呢？",
          "Elle a dit qu'elle danserait avec moi si je lui apportais des roses rouges. 她说，若我送她红玫瑰，她将与我跳舞。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "avec"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "3767247",
            "zh": "12537038",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "133745",
            "zh": "344404",
            "eng": "309114"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "3473",
            "zh": "336871",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "427867",
            "zh": "796806",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "801244",
            "zh": "798261",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "685561",
            "zh": "869953",
            "eng": "36352"
          },
          {
            "kind": "indirect",
            "fr": "694424",
            "zh": "1193451",
            "eng": "694399"
          }
        ]
      }
    },
    "dater": {
      "display": "dater",
      "prepositions": {
        "de": [
          "dater de qqch 始于（某个年代）"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "demander": {
      "display": "demander",
      "prepositions": {
        "à": [
          "demander à qqn 向某人询问",
          "Demande à Alex. 问亚力克斯吧。",
          "Il a demandé à ma mère. 他问了我的妈妈。",
          "Demandez à la guérite là-bas. 问那边的警察岗哨。",
          "J'ai demandé à Mike de m'aider. 我请迈克帮助我。",
          "Il a demandé à l'homme de l'aider. 他叫那个男人帮助他。",
          "J'ai demandé à Tom de jouer de la guitare. 我叫汤姆弹吉他。"
        ],
        "de": [
          "demander à qqn de faire qqch 请某人做某事",
          "Elle m'a demandé de l'aide. 她向我求助。",
          "Ne me demandez pas d'argent. 不要问我要钱。",
          "Elle lui a demandé de l'aide. 她向他求助。",
          "Tu peux lui demander de l'aide. 你可以向他求助。",
          "Il me demanda de garder le secret. 他要求我保存秘密。",
          "Il m'a demandé de lui passer le sel. 他让我把盐递给他。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "428936",
            "zh": "1959167",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132327",
            "zh": "760707",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1599010",
            "zh": "798348",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6913",
            "zh": "846110",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "131070",
            "zh": "1358685",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "791233",
            "zh": "791478",
            "eng": ""
          }
        ],
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "790595",
            "zh": "791656",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7958",
            "zh": "798426",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "783838",
            "zh": "784083",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3953168",
            "zh": "1691738",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "463676",
            "zh": "628525",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "348832",
            "zh": "842750",
            "eng": ""
          }
        ]
      }
    },
    "dessiner": {
      "display": "dessiner",
      "prepositions": {
        "sur": [
          "Peux-tu me le dessiner sur un morceau de papier, s'il te plait ? 请你帮我在这张纸上画个草图。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "559052",
            "zh": "392204",
            "eng": ""
          }
        ]
      }
    },
    "destiner": {
      "display": "destiner",
      "prepositions": {
        "à": [
          "Il était destiné à ne plus jamais la revoir. 他注定再也见不到她了。",
          "Ces livres ne sont pas destinés aux jeunes lecteurs. 这本书不是给年轻读者看的。",
          "Ce livre est destiné aux étudiants dont le japonais n'est pas la langue maternelle. 这本书是给母语不是日语的学生的。",
          "Il était destiné à devenir un grand musicien. 他命中注定要成为伟大的音乐家。",
          "Les livres sont destinés aux gens qui voudraient être ailleurs. 书是为了那些希望自己在另一个地方的人。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "336172",
            "zh": "336243",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "817719",
            "zh": "818942",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "407579",
            "zh": "811490",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "131534",
            "zh": "361792",
            "eng": "293548"
          },
          {
            "kind": "indirect",
            "fr": "1011084",
            "zh": "771953",
            "eng": "667893"
          }
        ]
      }
    },
    "devoir": {
      "display": "devoir",
      "prepositions": {
        "en": [
          "Je dois en acheter un demain. 我明天必须买一个。",
          "Je devrais vraiment m'en aller. 我真的该走了。",
          "Dis-moi ce que je dois en faire. 告诉我拿它做什么。",
          "Tu dois t'en aller. 你们得走了。",
          "Je dois m'en aller. 我得走了。",
          "Je dois m'en approcher. 我肯定越来越接近了。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "429748",
            "zh": "564560",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2391950",
            "zh": "9973713",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "816182",
            "zh": "816484",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "453692",
            "zh": "1740732",
            "eng": "16159"
          },
          {
            "kind": "indirect",
            "fr": "1996336",
            "zh": "345397",
            "eng": "785358"
          },
          {
            "kind": "indirect",
            "fr": "1582202",
            "zh": "6094880",
            "eng": "1582087"
          }
        ]
      }
    },
    "différencier": {
      "display": "différencier",
      "prepositions": {
        "de": [
          "Est-ce qu'un enfant de son âge peut différencier le bien du mal ? 一个像她那么大的小孩能够分辨是非吗？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "133675",
            "zh": "821436",
            "eng": "308557"
          }
        ]
      }
    },
    "différer": {
      "display": "différer",
      "prepositions": {
        "de": [
          "Mon avis diffère du tien. 我的看法跟你的不同。",
          "Londres diffère de Tokyo en termes de climat. 伦敦的气候和东京不同。",
          "Le climat de Londres diffère de celui de Tokyo. 伦敦的气候和东京的不同。",
          "L'anglais britannique diffère de l'anglais américain sur beaucoup de points. 英式英语和美式英语在很多地方上有所不同。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1215522",
            "zh": "852191",
            "eng": "250435"
          },
          {
            "kind": "indirect",
            "fr": "1330406",
            "zh": "5363933",
            "eng": "29270"
          },
          {
            "kind": "indirect",
            "fr": "336577",
            "zh": "336471",
            "eng": "29287"
          },
          {
            "kind": "indirect",
            "fr": "1023223",
            "zh": "459350",
            "eng": "66594"
          }
        ]
      }
    },
    "diminuer": {
      "display": "diminuer",
      "prepositions": {
        "de": [
          "Ses revenus ont diminué de moitié depuis qu'il est à la retraite. 退休后他的收入少了一半。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1807105",
            "zh": "332994",
            "eng": ""
          }
        ]
      }
    },
    "diplômer": {
      "display": "diplômer",
      "prepositions": {
        "de": [
          "Mon père est diplômé de l'université d'Harvard. 我爸爸是哈佛大学毕业的。",
          "Elle n'avait que 18 ans quand elle fut diplômée de l'université. 她十八岁就大学毕业了。",
          "Il s'est toujours consacré à l'étude de l'énergie atomique depuis qu'il a été diplômé de l'université. 从他大学毕业后，他就一直致力于原子能的研究。",
          "Il est diplômé de l'Université de Tôkyô. 他毕业于东京大学。",
          "Il est diplômé de Cambridge avec mention. 他以优异的成绩毕业于剑桥大学。",
          "Je suis diplômé de l'université de Kyoto. 我毕业于京都大学。"
        ],
        "en": [
          "Il est diplômé en littérature moderne. 他拿到了现代文学的文凭。"
        ]
      },
      "prepositionOrder": [
        "de",
        "en"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "333399",
            "zh": "333403",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1297094",
            "zh": "838499",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "489593",
            "zh": "490067",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "428877",
            "zh": "832988",
            "eng": "301931"
          },
          {
            "kind": "indirect",
            "fr": "334569",
            "zh": "334577",
            "eng": "289799"
          },
          {
            "kind": "indirect",
            "fr": "1084294",
            "zh": "835634",
            "eng": "1084111"
          }
        ],
        "en": [
          {
            "kind": "direct",
            "fr": "140044",
            "zh": "332756",
            "eng": ""
          }
        ]
      }
    },
    "dire": {
      "display": "dire",
      "prepositions": {
        "à": [
          "Veux-tu que je le dise à Tom ? 你要我告诉汤姆吗？",
          "Dis à Tom que je n'y serai pas. 告诉汤姆我不会在那儿。",
          "Il est parti sans dire au revoir. 他不辞而别。",
          "Je veux dire à Mary que je l'aime. 我想告诉玛丽，我爱她。",
          "Dis à Thomas où il doit s'asseoir. 告诉汤姆他应该坐哪儿。",
          "Je lui dirai quoi dire à la réunion. 我会告诉她开会的时候说些什么。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "5899602",
            "zh": "9475943",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6821335",
            "zh": "10481689",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "120063",
            "zh": "833039",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "5829845",
            "zh": "10059353",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10278623",
            "zh": "10278319",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465397",
            "zh": "381090",
            "eng": ""
          }
        ]
      }
    },
    "diriger": {
      "display": "diriger",
      "prepositions": {
        "vers": [
          "Nous nous dirigions vers notre maison de montagne. 我们向山间小屋走去。",
          "Des centaines de bœufs se sont dirigés vers le lac. 数以百计的水牛走向湖边。"
        ]
      },
      "prepositionOrder": [
        "vers"
      ],
      "sources": {
        "vers": [
          {
            "kind": "direct",
            "fr": "847040",
            "zh": "847822",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "9628",
            "zh": "797061",
            "eng": "24452"
          }
        ]
      }
    },
    "discuter": {
      "display": "discuter",
      "prepositions": {
        "de": [
          "discuter de qqch 讨论某事",
          "Discutons de ce problème plus tard. 我们稍后讨论这个问题。",
          "Nous avons déjà discuté de ce sujet. 我们详细地讨论了这个问题。",
          "Nous discutions souvent de notre futur. 我们过去常常谈论我们的将来。",
          "Discutons tout de suite de ce problème. 让我们马上讨论这个问题吧。",
          "Ils discutèrent du plan durant des heures. 他们谈计划谈了几个小时。",
          "Ne discutons pas de cette affaire aujourd'hui. 今天让我们不要讨论这件事。"
        ],
        "avec": [
          "discuter avec qqn 和某人讨论",
          "Je souhaite discuter avec ton oncle. 我想和你的舅舅谈一谈。",
          "Je voudrais discuter avec monsieur Zhang et monsieur Li. 我要和张先生、李先生谈谈。",
          "Il a vingt ans et pourtant il a encore peur de discuter avec les filles. 他20岁了，但他还是怕和女生聊天。",
          "Je vais en discuter avec mon père. 我会和父亲谈谈这件事的。",
          "Cela ne sert à rien de discuter avec lui. 跟他吵没用。",
          "Elle avait quelque chose à discuter avec lui. 她有点事要和他谈谈。"
        ]
      },
      "prepositionOrder": [
        "de",
        "avec"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1101995",
            "zh": "1325258",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "331862",
            "zh": "429863",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "126538",
            "zh": "414615",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "839051",
            "zh": "335620",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "816187",
            "zh": "816480",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1164097",
            "zh": "860978",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3050753",
            "zh": "3044029",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "661078",
            "zh": "400229",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "389582",
            "zh": "404462",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11146242",
            "zh": "402298",
            "eng": "48347"
          },
          {
            "kind": "indirect",
            "fr": "130061",
            "zh": "5905030",
            "eng": "284457"
          },
          {
            "kind": "indirect",
            "fr": "938297",
            "zh": "587425",
            "eng": "316253"
          }
        ]
      }
    },
    "disposer": {
      "display": "disposer",
      "prepositions": {
        "de": [
          "Je dispose de temps. 我有时间。",
          "Elles disposent de vin. 她们有酒。",
          "Je dispose d'un dictionnaire. 我有词典。",
          "Il dispose de sa propre chambre. 他有自己的房间。",
          "Chaque étudiant dispose d'un casier. 每个学生都有一柜子。",
          "Tu ne peux entrer en Chine que si tu disposes d'un visa. 只有得了签证才可以来中国。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1302576",
            "zh": "4859550",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4729603",
            "zh": "10481695",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "810434",
            "zh": "695413",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1314735",
            "zh": "4517811",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12926",
            "zh": "833817",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1544615",
            "zh": "1477291",
            "eng": ""
          }
        ]
      }
    },
    "disputer": {
      "display": "disputer",
      "prepositions": {
        "avec": [
          "Il s'est disputé avec son frère. 他和他弟弟吵了起来。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "413910",
            "zh": "464758",
            "eng": ""
          }
        ]
      }
    },
    "dissuader": {
      "display": "dissuader",
      "prepositions": {
        "de": [
          "Elle le dissuada de le faire. 她劝告他不要那样做。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1357933",
            "zh": "2338543",
            "eng": "886850"
          }
        ]
      }
    },
    "distinguer": {
      "display": "distinguer",
      "prepositions": {
        "de": [
          "Sais-tu distinguer le bien du mal ? 你知道分辨好坏吗？",
          "Elle ne sait pas comment distinguer le bien du mal. 她不知道如何辨别善与恶。",
          "Ça n'est pas toujours facile de distinguer le bien du mal. 分辨好坏并不总是容易的。",
          "Tu dois savoir distinguer le bien du mal. 你需要区分善与恶。",
          "Il est facile de distinguer le bien du mal. 是非对错并不难分。",
          "Je n'arrive pas à le distinguer de son frère. 我分不清他和他的弟弟。"
        ],
        "entre": [
          "distinguer entre deux choses 区分两者"
        ]
      },
      "prepositionOrder": [
        "de",
        "entre"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "591190",
            "zh": "782673",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10678854",
            "zh": "2037340",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465734",
            "zh": "465827",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "376723",
            "zh": "375979",
            "eng": "15940"
          },
          {
            "kind": "indirect",
            "fr": "888795",
            "zh": "1570042",
            "eng": "1160341"
          },
          {
            "kind": "indirect",
            "fr": "937419",
            "zh": "926843",
            "eng": "284825"
          }
        ],
        "entre": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "distribuer": {
      "display": "distribuer",
      "prepositions": {
        "à": [
          "Ma mère distribue souvent des tartes aux passants. 我的母亲经常让行人吃耳光。",
          "Cette association humanitaire recherche des bénévoles pour distribuer des repas aux sans-abris pendant le mois de décembre. 这个人道主义组织正在找志愿者在12月份把饭分给无家可归的人。",
          "Les sauveteurs vont distribuer des vivres aux victimes du tremblement de terre. 救助人员将为地震受灾者发放物资。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "690733",
            "zh": "691291",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3954",
            "zh": "503248",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1662746",
            "zh": "796124",
            "eng": "19581"
          }
        ]
      }
    },
    "divorcer": {
      "display": "divorcer",
      "prepositions": {
        "de": [
          "Elle divorça de son mari. 她与丈夫离婚。",
          "Il a divorcé de sa femme le mois dernier. 上个月他和妻子离婚了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1335674",
            "zh": "781427",
            "eng": "316753"
          },
          {
            "kind": "indirect",
            "fr": "7267140",
            "zh": "839492",
            "eng": "300627"
          }
        ]
      }
    },
    "divulguer": {
      "display": "divulguer",
      "prepositions": {
        "de": [
          "Les autorités ont divulgué peu d'informations utiles sur la propagation de COVID-19 au début de l'épidémie. 当局在疫情之初几乎没有透露关于新型冠状病毒的有用信息。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "8558486",
            "zh": "8563310",
            "eng": "8558488"
          }
        ]
      }
    },
    "dominer": {
      "display": "dominer",
      "prepositions": {
        "par": [
          "Certaines personnes disent que le Japon est une société dominée par la gent masculine. 有些人说日本是个男性统治的社会。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "1100002",
            "zh": "9974946",
            "eng": ""
          }
        ]
      }
    },
    "donner": {
      "display": "donner",
      "prepositions": {
        "à": [
          "Je l'ai donné à ce petit garçon. 我把它给这个小男孩。",
          "J'ai donné à Tom mon vieux vélo. 我把我的旧自行车给了汤姆。",
          "Elle m'a donné beaucoup à manger. 她给了我很多吃的东西。",
          "Le professeur a donné à John une récompense. 老师给了约翰一个奖品。",
          "Tom donna à Marie tout l'argent qu'il avait. 汤姆把他的所有钱都给了玛丽。",
          "J'ai donné au garçon le peu d'argent que j'avais. 我把我仅有的钱给了那个男孩。"
        ],
        "sur": [
          "donner sur qqch 窗户／房间朝向某处"
        ]
      },
      "prepositionOrder": [
        "à",
        "sur"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "805509",
            "zh": "805232",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10745490",
            "zh": "10745496",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134353",
            "zh": "805202",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "805508",
            "zh": "805233",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1647726",
            "zh": "1865147",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7128",
            "zh": "333500",
            "eng": ""
          }
        ],
        "sur": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "donner un coup de main 搭把手；帮个忙",
          "collocation": "donner un coup de main",
          "chinese": "搭把手；帮个忙",
          "source": "authored"
        },
        {
          "text": "donner rendez-vous 约见面",
          "collocation": "donner rendez-vous",
          "chinese": "约见面",
          "source": "authored"
        }
      ]
    },
    "dormir": {
      "display": "dormir",
      "prepositions": {
        "sur": [
          "Le chat dort sur la chaise. 猫儿在椅子上睡觉。",
          "Le chat dormit sur la table. 猫在桌子上睡觉。",
          "Le chien a dormi sur le tapis. 狗在地毯上睡过。",
          "Le chien dormait sur le tapis. 狗在地毯上睡觉。",
          "C'est super de dormir sur un tapis. 在地毯上睡觉好极了。",
          "Avoir la conscience tranquille permet de dormir sur ses deux oreilles. 问心无愧是一个非常柔软的枕头。"
        ],
        "dans": [
          "Elle dormit dans la voiture. 她在车子里睡觉。",
          "Qui est-ce qui dort dans mon lit ? 谁在我床上睡觉？",
          "Comment les gens peuvent-ils dormir dans l'avion ? 人们怎么能在飞机上睡觉？",
          "Ils dorment dans des chambres séparées, bien que mariés. 他们分房睡，即使他们已经结婚了。",
          "J'ai dormi dans le bus. 我在公交车上睡觉了。",
          "Alice dort dans sa chambre. 爱丽丝正在自己的房间里睡觉。"
        ],
        "avec": [
          "Il a dormi avec la fenêtre ouverte. 他开着窗睡着了。",
          "Elle dort avec deux coussins. 她用两个枕头睡觉。",
          "Je ne peux pas dormir avec tout ce boucan. 我听着噪音不能睡觉。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans",
        "avec"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "433750",
            "zh": "721053",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "5270837",
            "zh": "2217675",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "828681",
            "zh": "829728",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "828706",
            "zh": "829722",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465505",
            "zh": "465507",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "876294",
            "zh": "876218",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "1977245",
            "zh": "4797670",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "466015",
            "zh": "2383430",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "425114",
            "zh": "425117",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1407161",
            "zh": "10696114",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4078314",
            "zh": "5574496",
            "eng": "4077314"
          },
          {
            "kind": "indirect",
            "fr": "2158222",
            "zh": "8920787",
            "eng": "4510252"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "132838",
            "zh": "410852",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2407614",
            "zh": "8903305",
            "eng": "317101"
          },
          {
            "kind": "indirect",
            "fr": "5373441",
            "zh": "5684086",
            "eng": "5373198"
          }
        ]
      }
    },
    "doter": {
      "display": "doter",
      "prepositions": {
        "de": [
          "Si on était censé parler plus qu'on écoute, on serait doté de deux bouches et d'une seule oreille. 如果我们应该少听多说话, 那么我们应该得到两个嘴巴一只耳朵才是。",
          "Mars est dotée de deux lunes. 火星有两个卫星。",
          "Il est doté d'une grande intelligence. 他聪明得很。",
          "La maison est dotée de tous les équipements. 这套房子设施便利齐全。",
          "Il est doté d'un sens aigu des responsabilités. 他有强烈的责任感。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "2019872",
            "zh": "771986",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2989905",
            "zh": "3739095",
            "eng": "2079905"
          },
          {
            "kind": "indirect",
            "fr": "2041205",
            "zh": "5555696",
            "eng": "1386865"
          },
          {
            "kind": "indirect",
            "fr": "4875367",
            "zh": "10019601",
            "eng": "2268184"
          },
          {
            "kind": "indirect",
            "fr": "7820660",
            "zh": "883456",
            "eng": "300585"
          }
        ]
      }
    },
    "doubler": {
      "display": "doubler",
      "prepositions": {
        "par": [
          "J'ai été doublé par une voiture. 我被一辆车超了。",
          "Le lièvre fut doublé par la tortue. 野兔被乌龟抛了在后头。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "7134",
            "zh": "512806",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "537693",
            "zh": "339505",
            "eng": "537039"
          }
        ]
      }
    },
    "douer": {
      "display": "douer",
      "prepositions": {
        "pour": [
          "Il est très doué pour jouer du violon. 他非常擅长拉小提琴。",
          "Il n'est pas doué pour retenir les noms. 他不擅于记名字。",
          "Elle est douée pour contourner les règles. 她擅于逃避规则。",
          "Elle est très douée pour enseigner l'anglais. 她很擅长英语教学。",
          "Je suis naturellement doué pour les mathématiques. 我在数学上很有天分。",
          "Il est doué pour oublier. 他很善忘。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "130779",
            "zh": "887778",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "330169",
            "zh": "10256744",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "856449",
            "zh": "856400",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134177",
            "zh": "1855104",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135127",
            "zh": "2028061",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "427136",
            "zh": "345764",
            "eng": "303687"
          }
        ]
      }
    },
    "douter": {
      "display": "douter",
      "prepositions": {
        "de": [
          "douter de qqch 怀疑某事",
          "Douter de soi est le premier signe d'intelligence. 自我怀疑是聪明的第一标志。",
          "Les gens qui aiment ne doutent de rien, ou doutent de tout. 喜欢的人什么都不怀疑，或什么都疑神疑鬼。",
          "J'ai commencé à douter de la justesse de son propos. 我开始怀疑他陈述的准确性。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3399",
            "zh": "334205",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3690",
            "zh": "502841",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "515671",
            "zh": "348423",
            "eng": "260724"
          }
        ]
      }
    },
    "déambuler": {
      "display": "déambuler",
      "prepositions": {
        "dans": [
          "J'ai déambulé dans les rues pour tuer le temps. 我在街上散步，消磨时间。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "12231378",
            "zh": "475215",
            "eng": "23949"
          }
        ]
      }
    },
    "débarrasser": {
      "display": "débarrasser",
      "prepositions": {
        "de": [
          "Tu dois te débarrasser de cette mauvaise habitude. 你必须改掉这个坏习惯。",
          "Comment puis-je me débarrasser de mon complexe d'infériorité ? 我有什么办法可以脱离我的自卑情结吗？",
          "Je n'arrive pas à me débarrasser de mon rhume. 我的感冒怎么也不好。",
          "Je n'arrive pas à me débarrasser de ce mal de tête. 我这次头痛就是好不起来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "339515",
            "zh": "9970082",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6480013",
            "zh": "10472676",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "134949",
            "zh": "916660",
            "eng": "63739"
          },
          {
            "kind": "indirect",
            "fr": "11789487",
            "zh": "13321254",
            "eng": "7791637"
          }
        ]
      }
    },
    "débattre": {
      "display": "débattre",
      "prepositions": {
        "sur": [
          "Nous avons débattu sur le problème. 我们讨论了那个问题。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "917457",
            "zh": "410689",
            "eng": "23171"
          }
        ]
      }
    },
    "déborder": {
      "display": "déborder",
      "prepositions": {
        "de": [
          "Ses yeux débordaient de larmes. 他热泪盈眶。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "896205",
            "zh": "3031847",
            "eng": "287674"
          }
        ]
      }
    },
    "débrouiller": {
      "display": "débrouiller",
      "prepositions": {
        "pour": [
          "Je me suis débrouillé pour réparer moi-même mon véhicule. 我自己搞定，修好了我的车。",
          "On s'est débrouillé pour être là-bas à temps. 我们总算准时到那里了。",
          "Ils se sont débrouillés pour franchir le fleuve. 他们渡河前进。",
          "Je me suis débrouillé pour le lui faire comprendre. 我设法让他明白了。"
        ],
        "avec": [
          "Je te laisserai te débrouiller avec ça. 我把这个留给你。"
        ]
      },
      "prepositionOrder": [
        "pour",
        "avec"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "816192",
            "zh": "816474",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1251138",
            "zh": "895132",
            "eng": "262815"
          },
          {
            "kind": "indirect",
            "fr": "795870",
            "zh": "795857",
            "eng": "307019"
          },
          {
            "kind": "indirect",
            "fr": "935188",
            "zh": "794076",
            "eng": "284617"
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "1511580",
            "zh": "688348",
            "eng": "1511072"
          }
        ]
      }
    },
    "débuter": {
      "display": "débuter",
      "prepositions": {
        "par": [
          "La cérémonie débuta par son discours. 仪式以他的讲话开始。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "645332",
            "zh": "1394872",
            "eng": "20057"
          }
        ]
      }
    },
    "décevoir": {
      "display": "décevoir",
      "prepositions": {
        "par": [
          "Des milliers de personnes furent déçues par la publicité. 成千上万的人对这个广告很失望。",
          "J'ai été déçu par son discours. 我对他的演说感到失望。",
          "Ma mère a été déçue par mon échec. 我的母亲对我的失败感到失望。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "333265",
            "zh": "333273",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1271136",
            "zh": "862887",
            "eng": "285359"
          },
          {
            "kind": "indirect",
            "fr": "11946124",
            "zh": "8777538",
            "eng": "251841"
          }
        ]
      }
    },
    "déchirer": {
      "display": "déchirer",
      "prepositions": {
        "en": [
          "Elle déchira en mille morceaux la lettre. 她把信撕得粉碎。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "336210",
            "zh": "336253",
            "eng": ""
          }
        ]
      }
    },
    "décider": {
      "display": "décider",
      "prepositions": {
        "de": [
          "décider de faire qqch 决定做某事",
          "Elle décida de l'épouser. 她决定和他结婚。",
          "Je décidai de lui pardonner. 我决定原谅他。",
          "J'ai décidé de ne pas y aller. 我决定不去了。",
          "Il a décidé d'aller en France. 他决定去法国。",
          "Elle décida de ne pas y aller. 她决定不去了。",
          "As-tu décidé d'aller au Japon ? 你决定去日本了吗？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1335667",
            "zh": "1360032",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11918965",
            "zh": "11917772",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8588",
            "zh": "347042",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132335",
            "zh": "343774",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134291",
            "zh": "345724",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "419366",
            "zh": "387062",
            "eng": ""
          }
        ]
      },
      "notes": {
        "de": "décider de faire = 决定做；se décider à faire = 下定决心做"
      }
    },
    "déclencher": {
      "display": "déclencher",
      "prepositions": {
        "dans": [
          "Un feu s'est déclenché dans mon quartier la nuit dernière. 昨晚我邻居家着火了。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "8268",
            "zh": "332903",
            "eng": ""
          }
        ]
      }
    },
    "décoller": {
      "display": "décoller",
      "prepositions": {
        "à": [
          "Cet avion décolle à huit heures du matin. 这架飞机早上8点起飞。",
          "L'avion décolla à l'heure. 这班飞机准时起飞。",
          "Notre avion a décollé à six heures, exactement à l'heure prévue. 我们的飞机准时在六时正起飞了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "351148",
            "zh": "351244",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "5655145",
            "zh": "868459",
            "eng": "318093"
          },
          {
            "kind": "indirect",
            "fr": "11380460",
            "zh": "1747183",
            "eng": "23345"
          }
        ]
      }
    },
    "déconseiller": {
      "display": "déconseiller",
      "prepositions": {
        "de": [
          "Je te déconseille d'y aller. 你最好不要去那儿。",
          "Je te déconseille de sortir. 你最好不要出门。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "139593",
            "zh": "343405",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1484735",
            "zh": "838569",
            "eng": ""
          }
        ]
      }
    },
    "décorer": {
      "display": "décorer",
      "prepositions": {
        "avec": [
          "Le hall était décoré avec des peintures japonaises. 大厅用日本画做装饰。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "335950",
            "zh": "336009",
            "eng": ""
          }
        ]
      }
    },
    "dédier": {
      "display": "dédier",
      "prepositions": {
        "à": [
          "Ce magasin est dédié aux ustensiles de cuisine. 这家店是专门卖厨房用品的。",
          "Son père a dédié sa vie à la science. 她父亲把一生都贡献给科学事业了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "15165",
            "zh": "343915",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1275376",
            "zh": "343777",
            "eng": "1275373"
          }
        ]
      }
    },
    "défendre": {
      "display": "défendre",
      "prepositions": {
        "contre": [
          "C'était la seule façon dont nous pouvions nous défendre contre tous ces tirs terribles. 那是我们在枪林弹雨中自保的唯一方法。"
        ]
      },
      "prepositionOrder": [
        "contre"
      ],
      "sources": {
        "contre": [
          {
            "kind": "indirect",
            "fr": "794305",
            "zh": "1397409",
            "eng": "43047"
          }
        ]
      }
    },
    "déferler": {
      "display": "déferler",
      "prepositions": {
        "sur": [
          "Les vagues déferlent sur la plage. 波浪拍打着海岸。",
          "Une rafale de vent froid déferla sur la maison. 冷空气疾风席卷整栋房子。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "461468",
            "zh": "461512",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "793561",
            "zh": "793595",
            "eng": ""
          }
        ]
      }
    },
    "dégager": {
      "display": "dégager",
      "prepositions": {
        "de": [
          "Dégage de ma pelouse ! 滚出我的草坪！"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "4996141",
            "zh": "9958199",
            "eng": "2476975"
          }
        ]
      }
    },
    "dégouliner": {
      "display": "dégouliner",
      "prepositions": {
        "de": [
          "Je dégouline de sueur. 我正流着汗。",
          "La sueur dégoulinait de mon front. 汗水从我的额头上落下。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "237299",
            "zh": "336502",
            "eng": "21028"
          },
          {
            "kind": "indirect",
            "fr": "12337263",
            "zh": "5585161",
            "eng": "21252"
          }
        ]
      }
    },
    "déguiser": {
      "display": "déguiser",
      "prepositions": {
        "en": [
          "Le garçon est un loup déguisé en mouton. 这男孩是一头披着羊皮的狼。",
          "Il s'est déguisé en femme. 他把自己化装成一个女人。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "835421",
            "zh": "835625",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1564125",
            "zh": "844504",
            "eng": "299469"
          }
        ]
      }
    },
    "déjeuner": {
      "display": "déjeuner",
      "prepositions": {
        "avec": [
          "J'ai déjeuné avec lui aujourd'hui. 我今天跟他吃午饭。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "5741540",
            "zh": "5694478",
            "eng": "3903691"
          }
        ]
      }
    },
    "démener": {
      "display": "démener",
      "prepositions": {
        "pour": [
          "J'ai dû me démener pour sortir du métro. 我挣扎着挤出地铁。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "129297",
            "zh": "350057",
            "eng": ""
          }
        ]
      }
    },
    "démissionner": {
      "display": "démissionner",
      "prepositions": {
        "de": [
          "Il démissionna de son poste. 他从他的位子上辞职了。",
          "Elle est résolue à démissionner de la société. 她决心要辞职离开公司。",
          "Elle a décidé de démissionner de son poste. 她决定辞去她的工作。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "461523",
            "zh": "829723",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "661151",
            "zh": "344511",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4775398",
            "zh": "891650",
            "eng": "521663"
          }
        ]
      }
    },
    "déménager": {
      "display": "déménager",
      "prepositions": {
        "à": [
          "Sa décision de déménager à Chicago nous a surpris. 他决定搬去芝加哥使我们感到很惊讶。",
          "Il a déménagé à Tokyo. 他搬到了东京。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "335979",
            "zh": "336038",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "133026",
            "zh": "8932569",
            "eng": "301917"
          }
        ]
      }
    },
    "dénuer": {
      "display": "dénuer",
      "prepositions": {
        "de": [
          "Parfois, les choses qui arrivent sont dénuées de sens. 有时候，发生的事情并不是合情合理的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1835404",
            "zh": "1589550",
            "eng": "1589553"
          }
        ]
      }
    },
    "dépendre": {
      "display": "dépendre",
      "prepositions": {
        "de": [
          "dépendre de qqn/qqch 取决于某人／某事",
          "Ça dépend de toi. 这就要看你了。",
          "Ça dépend de vous. 这就要看您了。",
          "Ça dépend du contexte. 这要看情况。",
          "Cela dépend du contexte. 就是在语境中会变化。",
          "Cela ne dépend pas de toi. 这可由不得你。",
          "Kyoto dépend du secteur du tourisme. 京都依赖旅游业。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "501128",
            "zh": "347705",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "501130",
            "zh": "501185",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3149",
            "zh": "501316",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1078570",
            "zh": "365004",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "878268",
            "zh": "878267",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4571992",
            "zh": "798173",
            "eng": ""
          }
        ]
      }
    },
    "dépenser": {
      "display": "dépenser",
      "prepositions": {
        "pour": [
          "De grosses sommes d'argent ont été dépensées pour le pont. 建这条桥花了不少钱。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "484777",
            "zh": "337336",
            "eng": "274951"
          }
        ]
      }
    },
    "déplaire": {
      "display": "déplaire",
      "prepositions": {
        "à": [
          "déplaire à qqn 使某人不快"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "déposer": {
      "display": "déposer",
      "prepositions": {
        "à": [
          "Je te déposerai à la gare. 我载你到车站。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "10300000",
            "zh": "891648",
            "eng": "26100"
          }
        ]
      }
    },
    "dépourvoir": {
      "display": "dépourvoir",
      "prepositions": {
        "de": [
          "Tu es dépourvue de manières. 你不讲礼貌。",
          "Vénus est dépourvue de lunes. 金星没有卫星。",
          "La vie, sans amour, est dépourvue de sens. 没有爱的人生没有意义。",
          "Lorsqu'il revint à lui, il se trouva étendu dans une petite cellule dépourvue de fenêtre. 他醒了过来，发现自己正躺在一间不见天日的狭小囚室里。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "7839612",
            "zh": "10514447",
            "eng": "5272265"
          },
          {
            "kind": "indirect",
            "fr": "7839577",
            "zh": "4262122",
            "eng": "4769368"
          },
          {
            "kind": "indirect",
            "fr": "2065914",
            "zh": "2065330",
            "eng": "2065607"
          },
          {
            "kind": "indirect",
            "fr": "1252708",
            "zh": "2272597",
            "eng": "1251240"
          }
        ]
      }
    },
    "dépêcher": {
      "display": "dépêcher",
      "prepositions": {
        "pour": [
          "Je me dépêchai pour avoir le premier train. 我匆匆忙忙，为的是能赶上第一班火车。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "333914",
            "zh": "333916",
            "eng": ""
          }
        ]
      }
    },
    "déranger": {
      "display": "déranger",
      "prepositions": {
        "de": [
          "Ça ne me dérange pas d'attendre un peu. 我不介意等一会儿。",
          "Est-ce que ça te dérange d'allumer la télé ? 你介意打开电视吗？",
          "Ça ne me dérange pas de marcher sous la pluie. 我不介意在雨中漫步。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "10890052",
            "zh": "884200",
            "eng": "53409"
          },
          {
            "kind": "indirect",
            "fr": "236752",
            "zh": "6138320",
            "eng": "39179"
          },
          {
            "kind": "indirect",
            "fr": "1356412",
            "zh": "887800",
            "eng": "256140"
          }
        ]
      }
    },
    "désobéir": {
      "display": "désobéir",
      "prepositions": {
        "à": [
          "désobéir à qqn 不服从某人"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "détailler": {
      "display": "détailler",
      "prepositions": {
        "de": [
          "Il donna une description détaillée de l'accident. 他详细地描述了事故状况。",
          "Il a donné une description détaillée de l'accident. 他详细地叙述了那场意外的经过。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "135166",
            "zh": "6073893",
            "eng": "683958"
          },
          {
            "kind": "indirect",
            "fr": "131043",
            "zh": "843881",
            "eng": "290916"
          }
        ]
      }
    },
    "détecter": {
      "display": "détecter",
      "prepositions": {
        "dans": [
          "Le cancer peut être facilement guéri s'il est détecté dans sa phase initiale. 癌症如果在第一阶段被发现的话是很容易治愈的。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "499370",
            "zh": "346884",
            "eng": "63418"
          }
        ]
      }
    },
    "déterminer": {
      "display": "déterminer",
      "prepositions": {
        "à": [
          "Il est déterminé à aller en Angleterre. 他决心去英国。",
          "Elle est déterminée à quitter l'entreprise. 她决心要辞职离开公司。",
          "Je suis déterminé à devenir un scientifique. 我决心要成为一名科学家。",
          "Elle est fermement déterminée à posséder son propre magasin. 她下定决心要拥有自己的店。",
          "Je suis déterminé à réaliser ce plan. 我决心要推行这个计划。",
          "Il était déterminé à partir à l'étranger. 他下定决心要出国了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "130719",
            "zh": "352052",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "339600",
            "zh": "344511",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1385392",
            "zh": "926776",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337316",
            "zh": "337302",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11585164",
            "zh": "366914",
            "eng": "6872999"
          },
          {
            "kind": "indirect",
            "fr": "131754",
            "zh": "846280",
            "eng": "294737"
          }
        ]
      }
    },
    "détester": {
      "display": "détester",
      "prepositions": {
        "de": [
          "Il est détesté de tous. 他被所有人憎恨。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "131746",
            "zh": "1314090",
            "eng": ""
          }
        ]
      }
    },
    "détruire": {
      "display": "détruire",
      "prepositions": {
        "par": [
          "La ville fut détruite par le feu. 这个城市毁于火灾。",
          "La ville fut détruite par les inondations après la tempête. 小镇被暴风雨后的洪水摧毁了。",
          "Il perdit la raison quand il vit sa maison détruite par le feu. 看着自己的房子被烧得精光，他顿时丧失了理智。",
          "Il n'y a jamais eu une nation qui n'a pas été détruite par la suite. 从古到今，没有过不灭亡的国家。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "3836001",
            "zh": "868409",
            "eng": "45050"
          },
          {
            "kind": "indirect",
            "fr": "336754",
            "zh": "336645",
            "eng": "277888"
          },
          {
            "kind": "indirect",
            "fr": "132448",
            "zh": "1866683",
            "eng": "298637"
          },
          {
            "kind": "indirect",
            "fr": "4008777",
            "zh": "3845390",
            "eng": "4008773"
          }
        ]
      }
    },
    "effacer": {
      "display": "effacer",
      "prepositions": {
        "de": [
          "Il souhaite effacer de mauvais souvenirs. 他希望抹去不好的记忆。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "3928",
            "zh": "503220",
            "eng": ""
          }
        ]
      }
    },
    "effrayer": {
      "display": "effrayer",
      "prepositions": {
        "par": [
          "Le chat a été effrayé par un bruit inhabituel. 猫被没听过的噪音惊吓到了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "9802991",
            "zh": "5926186",
            "eng": "44552"
          }
        ]
      }
    },
    "embarquer": {
      "display": "embarquer",
      "prepositions": {
        "pour": [
          "Le vieux couple s'est embarqué pour un tour du monde. 老夫妇出发去环游世界了。"
        ],
        "sur": [
          "Tous les passagers embarquèrent sur le navire. 乘客全都登上了船。"
        ]
      },
      "prepositionOrder": [
        "pour",
        "sur"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "426140",
            "zh": "426361",
            "eng": ""
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "1287060",
            "zh": "1769181",
            "eng": "268409"
          }
        ]
      }
    },
    "embaucher": {
      "display": "embaucher",
      "prepositions": {
        "pour": [
          "Des détectives privés ont été embauchés pour examiner l'étrange affaire. 私家侦探们受雇调查这桩奇怪的案件。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "6218056",
            "zh": "1883480",
            "eng": "263337"
          }
        ]
      }
    },
    "embrasser": {
      "display": "embrasser",
      "prepositions": {
        "sur": [
          "Elle l'embrassa sur la joue. 她在他的脸颊上吻了一下。",
          "Il m'a embrassé sur le front. 他吻了我的额头。",
          "Il l'a embrassée sur le front. 他吻她的前额。",
          "Je l'ai embrassée sur le front. 我亲了她的额头。",
          "Il l'attira contre lui et l'embrassa sur la bouche. 他一把拉过她，然后吻了下去。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "1341631",
            "zh": "1501622",
            "eng": "887258"
          },
          {
            "kind": "indirect",
            "fr": "132284",
            "zh": "13529490",
            "eng": "297798"
          },
          {
            "kind": "indirect",
            "fr": "11151416",
            "zh": "6559015",
            "eng": "6558860"
          },
          {
            "kind": "indirect",
            "fr": "4956947",
            "zh": "4506224",
            "eng": "4755412"
          },
          {
            "kind": "indirect",
            "fr": "11742580",
            "zh": "8496263",
            "eng": "6381800"
          }
        ]
      }
    },
    "emmener": {
      "display": "emmener",
      "prepositions": {
        "à": [
          "Ce bus t'emmènera à la gare. 这辆车会带你去火车站。",
          "Mon père m'a emmené au cinéma hier soir. 昨晚我父亲带我去电影院了。",
          "Mon père m'emmenait parfois à son bureau. 我父亲有时候会带我去他的办公室。",
          "Nous avons vu la femme emmenée à l'hôpital. 我们看见那个女人被送进了医院。",
          "Ma mère m'emmena au parc. 妈妈带我去公园。",
          "Ce bus vous emmènera au musée. 这辆公车会载你去博物馆。"
        ],
        "avec": [
          "Je l'emmènerai avec moi à l'hôpital. 我会带他跟我一起去医院。"
        ]
      },
      "prepositionOrder": [
        "à",
        "avec"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "516983",
            "zh": "517600",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "461341",
            "zh": "461644",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134901",
            "zh": "510756",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426062",
            "zh": "426395",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "341482",
            "zh": "886569",
            "eng": "320781"
          },
          {
            "kind": "indirect",
            "fr": "399885",
            "zh": "785088",
            "eng": "60688"
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "920722",
            "zh": "917804",
            "eng": "917802"
          }
        ]
      }
    },
    "emménager": {
      "display": "emménager",
      "prepositions": {
        "dans": [
          "Récemment, j'ai emménagé dans un nouvel appartement. 最近我搬到另一栋公寓。"
        ],
        "avec": [
          "Il emménage avec sa petite amie. 他正在和他的女朋友搬新家。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "avec"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "181069",
            "zh": "801398",
            "eng": "243755"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "6112",
            "zh": "389942",
            "eng": ""
          }
        ]
      }
    },
    "empiéter": {
      "display": "empiéter",
      "prepositions": {
        "sur": [
          "N'empiète pas sur sa vie privée. 不要侵犯她的隐私。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "1186948",
            "zh": "1780724",
            "eng": "309040"
          }
        ]
      }
    },
    "emplir": {
      "display": "emplir",
      "prepositions": {
        "de": [
          "Elle portait un panier empli de fleurs. 她提着一只满是鲜花的篮子。",
          "Ses yeux étaient emplis de larmes. 他的眼里涌动着泪花。",
          "Le ciel est empli de nuages noirs. 天空乌云密布。",
          "La maison était emplie d'objets d'art pleins de couleurs. 房子里放满了五颜六色的艺术品。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "762047",
            "zh": "375975",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "134688",
            "zh": "1186910",
            "eng": "7772954"
          },
          {
            "kind": "indirect",
            "fr": "622835",
            "zh": "2052704",
            "eng": "462922"
          },
          {
            "kind": "indirect",
            "fr": "3474961",
            "zh": "3477025",
            "eng": "681595"
          }
        ]
      }
    },
    "emporter": {
      "display": "emporter",
      "prepositions": {
        "par": [
          "Le terrain a été emporté par la pluie. 土壤被雨水冲走了。",
          "Le chapeau a été emporté par le vent. 帽子被风吹了起来。",
          "Certaines personnes étaient accrochées à des branches d'arbres durant plusieurs heures, afin d'éviter d'être emportées par les eaux. 为了不被洪水冲走，有的人紧紧地抱着树干长达数个钟头。"
        ],
        "avec": [
          "Le bon coté de ce dictionnaire électronique est qu'on peut facilement l'emporter avec soi. 这电子辞典的好处就是便于携带。"
        ]
      },
      "prepositionOrder": [
        "par",
        "avec"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "873294",
            "zh": "1313982",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11265563",
            "zh": "5909517",
            "eng": "5918490"
          },
          {
            "kind": "indirect",
            "fr": "3673165",
            "zh": "3671479",
            "eng": "3671465"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "449408",
            "zh": "794251",
            "eng": ""
          }
        ]
      }
    },
    "empêcher": {
      "display": "empêcher",
      "prepositions": {
        "de": [
          "empêcher qqn de faire qqch 阻止某人做某事",
          "La pluie m'a empêché de sortir. 下雨使我无法出门。",
          "Sa blessure l'empêche de travailler. 他的伤让他无法工作。",
          "Je n'ai pas pu m'empêcher de pleurer. 我忍不住哭了。",
          "Personne ne peut m'empêcher d'y aller. 没人能阻止我去那儿。",
          "La tempête l'empêcha d'arriver à l'heure. 狂风暴雨造成她无法准时抵达。",
          "La pauvreté l'empêchait de fréquenter l'école. 贫困让他无法上学。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "335477",
            "zh": "335542",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130864",
            "zh": "512484",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "487991",
            "zh": "785845",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "427085",
            "zh": "426892",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "698796",
            "zh": "602898",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "459604",
            "zh": "463908",
            "eng": ""
          }
        ]
      }
    },
    "encombrer": {
      "display": "encombrer",
      "prepositions": {
        "de": [
          "La route était encombrée de voitures. 路上挤满了汽车。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "236560",
            "zh": "1328199",
            "eng": ""
          }
        ]
      }
    },
    "encourager": {
      "display": "encourager",
      "prepositions": {
        "à": [
          "encourager qqn à faire qqch 鼓励某人做某事",
          "Mon père m'a encouragé à apprendre le piano. 我的父亲鼓励我去学钢琴。",
          "On nous encourage à utiliser notre imagination. 我们被鼓励使用想像力。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "417151",
            "zh": "13922391",
            "eng": "319192"
          },
          {
            "kind": "indirect",
            "fr": "1006065",
            "zh": "8388770",
            "eng": "249003"
          }
        ]
      }
    },
    "endommager": {
      "display": "endommager",
      "prepositions": {
        "par": [
          "Le toit a été endommagé par la tempête. 屋顶被暴风雨损坏了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "819842",
            "zh": "907248",
            "eng": "25570"
          }
        ]
      }
    },
    "endormir": {
      "display": "endormir",
      "prepositions": {
        "en": [
          "Je me suis endormi en lisant. 我看书的时候睡着了。"
        ],
        "sur": [
          "Il s'est endormi sur mon épaule. 他倚着我的肩膀睡着了。",
          "Le chien s'est endormi sur la couverture. 狗在毯子上睡着了。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "487481",
            "zh": "1446791",
            "eng": "322096"
          }
        ],
        "sur": [
          {
            "kind": "direct",
            "fr": "4956375",
            "zh": "10569123",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12686904",
            "zh": "10361414",
            "eng": "7789262"
          }
        ]
      }
    },
    "endurer": {
      "display": "endurer",
      "prepositions": {
        "de": [
          "Il a enduré plus de sacrifices pour l'Amérique que la plupart d'entre nous peuvent à peine imaginer. 他为美国承受了比我们大多数人所能想象的更多的牺牲。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "334001",
            "zh": "334030",
            "eng": ""
          }
        ]
      }
    },
    "enfermer": {
      "display": "enfermer",
      "prepositions": {
        "dans": [
          "Elle s'est enfermée dans sa chambre. 她把自己关在房里。",
          "Elle s'est enfermée dans la salle de bains. 她把自己锁在浴室了。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "500332",
            "zh": "512107",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6971563",
            "zh": "10182834",
            "eng": ""
          }
        ]
      }
    },
    "enfiler": {
      "display": "enfiler",
      "prepositions": {
        "de": [
          "Enfile d'abord un peignoir. 先把浴袍穿起来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1708815",
            "zh": "1708814",
            "eng": ""
          }
        ]
      }
    },
    "enfuir": {
      "display": "enfuir",
      "prepositions": {
        "avec": [
          "Il s'est enfui avec l'argent. 他携款潜逃。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "1175575",
            "zh": "1878433",
            "eng": "1174737"
          }
        ]
      }
    },
    "engager": {
      "display": "engager",
      "prepositions": {
        "dans": [
          "Elles se sont engagées dans la recherche sur le cancer. 他们从事癌症研究工作。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "1788520",
            "zh": "349560",
            "eng": "305589"
          }
        ]
      }
    },
    "ennuyer": {
      "display": "ennuyer",
      "prepositions": {
        "avec": [
          "Il nous a ennuyés avec ses longues histoires. 他长长的故事让我们觉得厌烦了。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "5594151",
            "zh": "889378",
            "eng": "287163"
          }
        ]
      }
    },
    "enquêter": {
      "display": "enquêter",
      "prepositions": {
        "sur": [
          "Une commission a été constituée pour enquêter sur les prix. 为了调查物价，成立了一个委员会。",
          "Nous devons enquêter sur la disparition du médecin. 我们必须调查医生的失踪案。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "351182",
            "zh": "351235",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11377435",
            "zh": "8902607",
            "eng": "49638"
          }
        ]
      }
    },
    "enseigner": {
      "display": "enseigner",
      "prepositions": {
        "à": [
          "Il m'a enseigné à nager. 他教了我游泳。",
          "Elle enseigne à lire et à écrire. 她教阅读和写作。",
          "Il a enseigné au groupe de garçons indiens. 他教过一群印度男生。",
          "Enseigner à de jeunes enfants n'est pas facile. 教小朋友并不容易。",
          "Il sait bien enseigner aux gens, du coup ses enfants sont très obéissants. 他很会教育人所以他的孩子都很听话。",
          "Le père de Bob enseigne à une école de filles. 鲍勃的父亲在女校教书。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "495867",
            "zh": "345679",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1183983",
            "zh": "844508",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "412306",
            "zh": "464914",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1460700",
            "zh": "10459890",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1488577",
            "zh": "1488564",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "463502",
            "zh": "410719",
            "eng": "33243"
          }
        ]
      }
    },
    "entendre": {
      "display": "entendre",
      "prepositions": {
        "avec": [
          "Je m'entends très bien avec ma belle-mère. 我和婆婆相处得十分融洽。",
          "Tu dois faire un effort pour t'entendre avec tout le monde. 你要努力和大家相处。",
          "Je m'entends bien avec lui. 我跟他处得很好。",
          "Je ne m'entendais pas avec elle. 我没有和她相处过。",
          "Je t'entends avec grandes difficultés. 我几乎听不到你。",
          "Je m'entends bien avec mon petit frère. 我与我的弟弟相处融洽。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "6560",
            "zh": "501120",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "180813",
            "zh": "346131",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "332330",
            "zh": "686921",
            "eng": "3903083"
          },
          {
            "kind": "indirect",
            "fr": "5681207",
            "zh": "846340",
            "eng": "261095"
          },
          {
            "kind": "indirect",
            "fr": "6000373",
            "zh": "380597",
            "eng": "16857"
          },
          {
            "kind": "indirect",
            "fr": "4260829",
            "zh": "881908",
            "eng": "530804"
          }
        ]
      }
    },
    "enterrer": {
      "display": "enterrer",
      "prepositions": {
        "dans": [
          "On l'a enterrée dans sa ville natale. 她被安葬在她的家乡。",
          "Il est dit qu'un trésor est enterré dans cet endroit. 据说这个区域埋着财宝。",
          "Ils l'ont enterré dans le cimetière près de l'église. 他们把他埋葬在教堂旁的墓园。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "537912",
            "zh": "864386",
            "eng": "315356"
          },
          {
            "kind": "indirect",
            "fr": "336207",
            "zh": "336188",
            "eng": "59605"
          },
          {
            "kind": "indirect",
            "fr": "11146202",
            "zh": "918020",
            "eng": "307408"
          }
        ]
      }
    },
    "entourer": {
      "display": "entourer",
      "prepositions": {
        "de": [
          "Il était entouré d'une foule de journalistes. 他被一大群记者包围着。"
        ],
        "par": [
          "Le jardin était entouré par une barrière en bois. 花园被木栅栏围了起来。",
          "Le Japon est entouré par la mer. 日本被海环绕着。",
          "Le Japon est un pays entouré par la mer de tous les côtés. 日本是个四面环海的国家。"
        ]
      },
      "prepositionOrder": [
        "de",
        "par"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "11184769",
            "zh": "563648",
            "eng": "562104"
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "333138",
            "zh": "333146",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "129729",
            "zh": "8938664",
            "eng": "281509"
          },
          {
            "kind": "indirect",
            "fr": "129738",
            "zh": "8938624",
            "eng": "281542"
          }
        ]
      }
    },
    "entrer": {
      "display": "entrer",
      "prepositions": {
        "en": [
          "entrer en contact avec qqn 与某人取得联系",
          "Le train venant de Genève va entrer en gare. 从日内瓦来的火车就要进站了。",
          "La loi entrera en vigueur à partir du 1er avril. 法律将从4月1日起生效。",
          "Comment es-tu entré en possession de cet argent ? 你是怎么搞到这笔钱的？",
          "Ce volcan est entré en éruption deux fois cette année. 这座火山在这年内爆发了两次。",
          "Des mesures de sécurité étendues entrèrent en vigueur. 广泛的安全措施实施了。",
          "Tu ne peux entrer en Chine que si tu disposes d'un visa. 只有得了签证才可以来中国。"
        ],
        "dans": [
          "entrer dans un lieu 进入某处",
          "Il entra dans la pièce. 他走进了房间。",
          "Tu es entré dans ma chambre. 你进了我的房间。",
          "Je suis entré dans la marine. 我加入了海军。",
          "Je l'ai vu entrer dans la pièce. 我看到他进房间。",
          "Le pénis est entré dans le vagin. 阴茎进入了阴道。",
          "Un étranger entra dans l'immeuble. 一个陌生人进了大楼。"
        ]
      },
      "prepositionOrder": [
        "en",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3572",
            "zh": "343780",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337253",
            "zh": "451444",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "817436",
            "zh": "10360634",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "661139",
            "zh": "431578",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "829224",
            "zh": "829589",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1544615",
            "zh": "1477291",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "133290",
            "zh": "989138",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "181850",
            "zh": "512446",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "892890",
            "zh": "786117",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "136026",
            "zh": "10695952",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "948110",
            "zh": "948109",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8759",
            "zh": "343896",
            "eng": ""
          }
        ]
      }
    },
    "entretenir": {
      "display": "entretenir",
      "prepositions": {
        "avec": [
          "Je me suis entretenu avec lui. 我采访了他。",
          "J'aimerais m'entretenir avec toi. 我想和你谈谈。",
          "Je veux m'en entretenir avec lui. 我想和他谈谈那件事。",
          "Je me suis entretenu avec lui à ce sujet. 我跟他谈过这个问题。",
          "Puis-je m'entretenir avec vous une minute ? 我可以和你讲一下话吗?",
          "Je préfèrerais m'entretenir avec vous en privé. 我想和你单独谈谈。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "5578736",
            "zh": "5085511",
            "eng": "5085474"
          },
          {
            "kind": "indirect",
            "fr": "497230",
            "zh": "346138",
            "eng": "71237"
          },
          {
            "kind": "indirect",
            "fr": "1350624",
            "zh": "372122",
            "eng": "50469"
          },
          {
            "kind": "indirect",
            "fr": "11481754",
            "zh": "876747",
            "eng": "254322"
          },
          {
            "kind": "indirect",
            "fr": "6560301",
            "zh": "795288",
            "eng": "267692"
          },
          {
            "kind": "indirect",
            "fr": "563634",
            "zh": "563639",
            "eng": "17622"
          }
        ]
      }
    },
    "envisager": {
      "display": "envisager",
      "prepositions": {
        "de": [
          "Nous envisageons de rester une semaine. 我们计划待一周。",
          "Est-ce que Tom envisage toujours de faire ça avec Marie ? 汤姆还打算跟玛莉一起做那件事吗？",
          "J'ai envisagé de changer de travail, mais au final j'ai décidé de ne pas le faire. 我考虑过要不要换工作，但是我最终还是决定不要那样做。",
          "J'ai envisagé de changer d'emploi. 我考虑更换工作。",
          "J'envisage d'aller à l'étranger l'an prochain. 我在考虑明年去国外。",
          "J'ai tellement appris de mes erreurs que j'envisage d'en commettre quelques-unes de plus ! 我从我的错误里学到了这么多，现在我想再犯几个错！"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "465185",
            "zh": "466249",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12145081",
            "zh": "12144941",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "5441255",
            "zh": "10332901",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "479656",
            "zh": "358147",
            "eng": "258740"
          },
          {
            "kind": "indirect",
            "fr": "484028",
            "zh": "335032",
            "eng": "262163"
          },
          {
            "kind": "indirect",
            "fr": "1181650",
            "zh": "1397097",
            "eng": "1181507"
          }
        ]
      }
    },
    "envoyer": {
      "display": "envoyer",
      "prepositions": {
        "par": [
          "Je l'enverrai par courriel cet après-midi. 我今天下午用电邮发。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "1242100",
            "zh": "1242085",
            "eng": "1242088"
          }
        ]
      }
    },
    "essayer": {
      "display": "essayer",
      "prepositions": {
        "de": [
          "essayer de faire qqch 试着做某事",
          "J'essaie de dormir. 我试着睡觉。",
          "N'essaie jamais de mourir. 千万不要自杀。",
          "Ma femme essaye de dormir. 我的妻子在试图睡觉。",
          "J'ai essayé de te le dire. 我试过告诉你的。",
          "Essaie de ne rien oublier. 尽量别忘掉任何事。",
          "J'essayais de tuer le temps. 我试着消磨时间。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "465374",
            "zh": "466124",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3860",
            "zh": "458833",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10990",
            "zh": "939776",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "180409",
            "zh": "714794",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4081020",
            "zh": "9555206",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3523",
            "zh": "501603",
            "eng": ""
          }
        ]
      }
    },
    "estimer": {
      "display": "estimer",
      "prepositions": {
        "pour": [
          "Nous avons beaucoup d'estime pour le professeur Turner. 我们十分尊重特纳教授。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "1251109",
            "zh": "13911363",
            "eng": "262805"
          }
        ]
      }
    },
    "exagérer": {
      "display": "exagérer",
      "prepositions": {
        "de": [
          "Tu exagères de ne rentrer qu'à cette heure-ci. 你在这个时候才回来真是太过分了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "365996",
            "zh": "365988",
            "eng": ""
          }
        ]
      }
    },
    "examiner": {
      "display": "examiner",
      "prepositions": {
        "par": [
          "Vous devriez vous faire examiner par un docteur. 您应该让医生给您检查身体。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "740015",
            "zh": "2437266",
            "eng": ""
          }
        ]
      }
    },
    "exclure": {
      "display": "exclure",
      "prepositions": {
        "de": [
          "Il a été exclu de l'école. 他被逐出了学校。",
          "Il a été exclu de l'équipe. 他被队里开除了。",
          "Il a été exclu du club pour avoir enfreint les règles. 他触犯会规，被踢出了俱乐部。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "331728",
            "zh": "349674",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130981",
            "zh": "782131",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3428166",
            "zh": "349729",
            "eng": "295134"
          }
        ]
      }
    },
    "excuser": {
      "display": "excuser",
      "prepositions": {
        "pour": [
          "Il n'y a pas d'excuse pour son retard. 他迟到没有理由。",
          "Vous devriez vous excuser pour votre grossièreté. 您该为您的粗鲁道歉。",
          "Il concocta une bonne excuse pour ne pas venir à la fête. 为了不去聚会，他编了个好借口。",
          "Je m'excuse pour hier. 我为昨天发生的事道歉。",
          "Tu n'as pas besoin de t'excuser pour ça. 您无需道歉。",
          "Pourquoi t'excuser pour quelque chose que tu n'as même pas fait ? 为什么你要对你没做过的事表示抱歉？"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "413906",
            "zh": "464764",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "781415",
            "zh": "784519",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "131294",
            "zh": "1311608",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4299617",
            "zh": "9960214",
            "eng": "4299418"
          },
          {
            "kind": "indirect",
            "fr": "10141044",
            "zh": "13527832",
            "eng": "11075893"
          },
          {
            "kind": "indirect",
            "fr": "5684687",
            "zh": "334920",
            "eng": "416893"
          }
        ]
      }
    },
    "exiger": {
      "display": "exiger",
      "prepositions": {
        "de": [
          "Ce travail exige de la pratique. 这个工作需要实践。",
          "Le gouvernement colombien a exigé plus d'argent. 哥伦比亚政府要了更多的钱。",
          "Elle exigea de voir le gérant. 她要求要见见经理。",
          "Notre professeur a exigé de nous taire. 老师要我们保持安静。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "479471",
            "zh": "512896",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "804404",
            "zh": "805145",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1372712",
            "zh": "346935",
            "eng": "314022"
          },
          {
            "kind": "indirect",
            "fr": "439270",
            "zh": "349527",
            "eng": "272998"
          }
        ]
      }
    },
    "exister": {
      "display": "exister",
      "prepositions": {
        "sur": [
          "Je me demande si la vie existe sur d'autres planètes. 不知道别的星球上有没有生物呢？"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "614801",
            "zh": "426959",
            "eng": ""
          }
        ]
      }
    },
    "expliquer": {
      "display": "expliquer",
      "prepositions": {
        "en": [
          "Il l'a expliqué en détail. 他为我做了详细说明。",
          "Il expliqua en détail ce qu'il avait vu. 他详细地解释了他看到的事。",
          "J'expliquerai en détail la semaine prochaine. 我下周会详细说明的。"
        ],
        "avec": [
          "Je vous explique avec un schéma. 让我用一张图来说明。"
        ]
      },
      "prepositionOrder": [
        "en",
        "avec"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "131095",
            "zh": "335328",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "343279",
            "zh": "343319",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "131269",
            "zh": "344204",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "130843",
            "zh": "13795580",
            "eng": "270673"
          }
        ]
      }
    },
    "exporter": {
      "display": "exporter",
      "prepositions": {
        "de": [
          "Le Japon exporte beaucoup de voitures à l'étranger. 日本出口很多汽车到国外。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "355449",
            "zh": "399981",
            "eng": ""
          }
        ]
      }
    },
    "exposer": {
      "display": "exposer",
      "prepositions": {
        "à": [
          "Elle m'expose au danger. 她使我处于危险的冒险。",
          "Ma chambre est exposée à l'est. 我的房间面向东边。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "862759",
            "zh": "862610",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7071885",
            "zh": "788834",
            "eng": "251788"
          }
        ]
      }
    },
    "exprimer": {
      "display": "exprimer",
      "prepositions": {
        "en": [
          "Peux-tu t'exprimer en anglais ? 你能用英语表达自己吗？"
        ],
        "par": [
          "Elle s'est exprimée par l'intermédiaire d'un interprète. 她透过传译员发言。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "338672",
            "zh": "811818",
            "eng": "69352"
          }
        ],
        "par": [
          {
            "kind": "indirect",
            "fr": "4760116",
            "zh": "846009",
            "eng": "310003"
          }
        ]
      }
    },
    "expulser": {
      "display": "expulser",
      "prepositions": {
        "de": [
          "Son fils a été expulsé de l'école. 他的儿子被学校开除了。",
          "J'ai été expulsé du lycée. 我被高中退学了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "572784",
            "zh": "848596",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1354198",
            "zh": "881004",
            "eng": "327632"
          }
        ]
      }
    },
    "extirper": {
      "display": "extirper",
      "prepositions": {
        "de": [
          "Elle l'extirpa de la boue. 她把他从烂泥中拽出来了。",
          "Nous réussîmes à nous extirper de là. 我们从那里逃了出来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1348298",
            "zh": "1419915",
            "eng": "887345"
          },
          {
            "kind": "indirect",
            "fr": "1330327",
            "zh": "801983",
            "eng": "24927"
          }
        ]
      }
    },
    "fabriquer": {
      "display": "fabriquer",
      "prepositions": {
        "en": [
          "Cette machine a été fabriquée en France. 这部机器是在法国制造的。",
          "Cet appareil photo a été fabriqué en Allemagne. 这个照相机是德国制造的。",
          "Ce produit a été fabriqué en Chine. 这个产品是中国制造的。",
          "Cette télévision a été fabriquée en Chine. 这台电视是中国制造的。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "338096",
            "zh": "392262",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335432",
            "zh": "335495",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11745160",
            "zh": "10194195",
            "eng": "5568134"
          },
          {
            "kind": "indirect",
            "fr": "6823157",
            "zh": "5777488",
            "eng": "5701346"
          }
        ]
      }
    },
    "faire": {
      "display": "faire",
      "prepositions": {
        "pour": [
          "Je le fais pour eux. 我为他们做。",
          "Il l'a fait pour le fric. 他做这个是为了钱。",
          "Que puis-je faire pour t'aider ? 我可以做什么来帮你呢？",
          "Tu t'en fais trop pour ton poids. 你太担心你的体重了。",
          "Je suis prêt à tout faire pour vous. 我甘心为你做任何事。",
          "C'est ce que je peux faire pour vous. 这是我能为您做的。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "1724325",
            "zh": "9423560",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "459518",
            "zh": "463938",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1149180",
            "zh": "2070506",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1801961",
            "zh": "2437249",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "793274",
            "zh": "794001",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "781401",
            "zh": "784558",
            "eng": ""
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "faire attention 注意；当心",
          "collocation": "faire attention",
          "chinese": "注意；当心",
          "source": "authored"
        },
        {
          "text": "faire la cuisine 做饭",
          "collocation": "faire la cuisine",
          "chinese": "做饭",
          "source": "authored"
        },
        {
          "text": "faire la vaisselle 洗碗",
          "collocation": "faire la vaisselle",
          "chinese": "洗碗",
          "source": "authored"
        },
        {
          "text": "faire les courses 买东西；采购",
          "collocation": "faire les courses",
          "chinese": "买东西；采购",
          "source": "authored"
        },
        {
          "text": "faire la queue 排队",
          "collocation": "faire la queue",
          "chinese": "排队",
          "source": "authored"
        },
        {
          "text": "faire du sport 做运动",
          "collocation": "faire du sport",
          "chinese": "做运动",
          "source": "authored"
        },
        {
          "text": "faire une promenade 散步",
          "collocation": "faire une promenade",
          "chinese": "散步",
          "source": "authored"
        },
        {
          "text": "faire des progrès 取得进步",
          "collocation": "faire des progrès",
          "chinese": "取得进步",
          "source": "authored"
        },
        {
          "text": "faire un effort 努力一把",
          "collocation": "faire un effort",
          "chinese": "努力一把",
          "source": "authored"
        },
        {
          "text": "faire la fête 开派对；狂欢",
          "collocation": "faire la fête",
          "chinese": "开派对；狂欢",
          "source": "authored"
        },
        {
          "text": "faire le ménage 做家务",
          "collocation": "faire le ménage",
          "chinese": "做家务",
          "source": "authored"
        }
      ]
    },
    "faire attention": {
      "display": "faire attention",
      "prepositions": {
        "à": [
          "faire attention à qqch 注意某事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "faire semblant": {
      "display": "faire semblant",
      "prepositions": {
        "de": [
          "faire semblant de faire qqch 假装做某事"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "falloir": {
      "display": "falloir",
      "prepositions": {
        "en": [
          "Il me faut m'en aller. 我得走了。",
          "Il nous faut nous en aller. 我们必须走了。",
          "Il me faut vraiment m'en aller. 我真的得走了。",
          "Il ne faut pas t'en faire pour la publicité. 你不用担心宣传的事。",
          "Je ne sais pas s'il faut en rire ou en pleurer. 我真是哭笑不得了。"
        ],
        "pour": [
          "Mon épée peut être émoussée, mais c'est plus qu'il n'en faut pour quelqu'un comme toi. 我的剑虽然是钝的，但应付你的话是绰绰有余的。"
        ]
      },
      "prepositionOrder": [
        "en",
        "pour"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "1996327",
            "zh": "345397",
            "eng": "785358"
          },
          {
            "kind": "indirect",
            "fr": "1996494",
            "zh": "7767666",
            "eng": "1893749"
          },
          {
            "kind": "indirect",
            "fr": "2391957",
            "zh": "713158",
            "eng": "2390840"
          },
          {
            "kind": "indirect",
            "fr": "4142215",
            "zh": "13907644",
            "eng": "3730212"
          },
          {
            "kind": "indirect",
            "fr": "13251893",
            "zh": "387615",
            "eng": "19569"
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "498429",
            "zh": "498431",
            "eng": ""
          }
        ]
      }
    },
    "fasciner": {
      "display": "fasciner",
      "prepositions": {
        "par": [
          "Il était fasciné par sa beauté. 他被她的美貌迷倒了。",
          "Les jeunes enfants sont souvent fascinés par la science. 小孩常常对科学很有热情。",
          "Les touristes ont été fascinés par le magnifique paysage. 观光客被独特的景致所吸引。",
          "Je ne devrais peut-être pas te le dire, mais je suis vraiment fasciné par ta beauté. 我或许不应该告诉你，但我真的被你的美丽迷倒了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "136358",
            "zh": "375369",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12632164",
            "zh": "993751",
            "eng": "681989"
          },
          {
            "kind": "indirect",
            "fr": "13085596",
            "zh": "1238324",
            "eng": "20915"
          },
          {
            "kind": "indirect",
            "fr": "618413",
            "zh": "618480",
            "eng": "618391"
          }
        ]
      }
    },
    "fatiguer": {
      "display": "fatiguer",
      "prepositions": {
        "pour": [
          "Je suis trop fatigué pour grimper. 我累得爬不动了。",
          "Il était trop fatigué pour aller plus loin. 他因为太疲劳而无法继续前进。",
          "Je suis trop fatigué pour faire mes devoirs. 我太累了，做不了功课。",
          "Ils étaient trop fatigués pour gravir la montagne. 他们累得爬不动山了。",
          "Et si on dînait dehors ce soir, je suis trop fatigué pour cuisiner. 我们今晚到外面吃吧，我太累了，做不动饭了。",
          "Je suis trop fatigué pour sortir courir. 我太累了，没办法出门跑步了。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "135810",
            "zh": "345707",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130684",
            "zh": "432907",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "795279",
            "zh": "795451",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "467983",
            "zh": "469551",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "181368",
            "zh": "429254",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1092076",
            "zh": "13890318",
            "eng": "5001496"
          }
        ]
      }
    },
    "fermer": {
      "display": "fermer",
      "prepositions": {
        "à": [
          "Le magasin a fermé à cinq heures. 商店5点关门了。",
          "Nous avons trouvé la porte de devant fermée à clé. 我们发现前门被锁上了。",
          "Le marché du riz japonais est fermé à l'importation. 日本米市场禁止进口。",
          "L'école fut fermée une journée à cause de la neige. 学校因大雪停课一天。",
          "L'école a été fermé à cause de la neige. 停课是因为下雪。",
          "La porte était fermée à clé de l'intérieur. 这门从里面被反锁了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "180854",
            "zh": "343682",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "805060",
            "zh": "805042",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129719",
            "zh": "343450",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "336167",
            "zh": "333198",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8580377",
            "zh": "5668897",
            "eng": "21565"
          },
          {
            "kind": "indirect",
            "fr": "463748",
            "zh": "754653",
            "eng": "48142"
          }
        ]
      }
    },
    "ficher": {
      "display": "ficher",
      "prepositions": {
        "de": [
          "Je me fiche de la célébrité. 我不在意名声。",
          "Je m'en fiche de toi. 我不在乎你。",
          "Je me fiche de mon CV. 我根本不在乎我的简历。",
          "Je me fiche de ce qu'il advienne. 我不在乎发生什么事。",
          "Je me fiche de ce que les gens pensent de ma façon de m'habiller. 我不在乎别人怎么看我的打扮。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "127950",
            "zh": "343108",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "13161733",
            "zh": "13161734",
            "eng": "10064175"
          },
          {
            "kind": "indirect",
            "fr": "1786399",
            "zh": "504940",
            "eng": "504938"
          },
          {
            "kind": "indirect",
            "fr": "9672665",
            "zh": "833805",
            "eng": "25151"
          },
          {
            "kind": "indirect",
            "fr": "7028815",
            "zh": "506877",
            "eng": "258319"
          }
        ]
      }
    },
    "fier": {
      "display": "fier",
      "prepositions": {
        "à": [
          "Je me fie à toi. 我信任你。",
          "Ne te fie à personne ! 谁也不要相信。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "457739",
            "zh": "1878344",
            "eng": "457741"
          },
          {
            "kind": "indirect",
            "fr": "2092743",
            "zh": "13119391",
            "eng": "2091090"
          }
        ]
      }
    },
    "finir": {
      "display": "finir",
      "prepositions": {
        "de": [
          "finir de faire qqch 做完某事",
          "J'ai fini de me laver. 我洗好了。",
          "J'ai déjà fini de dîner. 我已经吃晚饭了。",
          "J'ai fini de lire ce livre. 我看完了这本书。",
          "As-tu fini de lire ce livre ? 你读完那本书了吗？",
          "As-tu fini de lire le roman ? 你读完那本小说了吗？",
          "J'ai fini de manger ce gâteau. 我把这包饼吃完了。"
        ],
        "par": [
          "finir par faire qqch 最终做了某事",
          "Il a fini par apparaître. 他最终出现了。",
          "Elle a fini par s'endormir. 她终于睡着了。",
          "Il a fini par s'abîmer la santé. 他最后搞坏了身体。",
          "Tu as fini par obtenir un boulot. 你终于成功找到工作了。",
          "Elle a fini par aimer cette maison. 她最后开始喜欢这个房子了。",
          "Tout finit toujours par s'arranger. 船到桥头自然直。"
        ]
      },
      "prepositionOrder": [
        "de",
        "par"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "2300036",
            "zh": "2300033",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1171000",
            "zh": "835390",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7103",
            "zh": "490039",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "429737",
            "zh": "813582",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474831",
            "zh": "476580",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1077530",
            "zh": "1077522",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "335965",
            "zh": "336024",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2887975",
            "zh": "383288",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335964",
            "zh": "336023",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474828",
            "zh": "350679",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "15573",
            "zh": "336950",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "389043",
            "zh": "380739",
            "eng": ""
          }
        ]
      },
      "notes": {
        "de": "finir de faire = 做完；finir par faire = 最终做了",
        "par": "finir par faire = 最终做了；finir de faire = 做完"
      }
    },
    "fleurir": {
      "display": "fleurir",
      "prepositions": {
        "à": [
          "Beaucoup de fleurs commencent à fleurir au printemps. 许多花到了春天开始开花了。"
        ],
        "dans": [
          "Les boutons fleuriront dans quelques jours. 过两三天就要开花了。"
        ]
      },
      "prepositionOrder": [
        "à",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "461801",
            "zh": "462048",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "788159",
            "zh": "804893",
            "eng": ""
          }
        ]
      }
    },
    "flotter": {
      "display": "flotter",
      "prepositions": {
        "sur": [
          "L'huile flottera sur l'eau. 油漂浮在水上。",
          "Les pétales flottent sur l'eau. 花瓣浮在水面上。",
          "La substance est suffisamment légère pour flotter sur l'eau. 这种物质很轻，可以浮在水面上。"
        ],
        "dans": [
          "Ses cheveux dorés flottaient dans le vent estival. 她的一头金发在夏日的微风中飘荡。",
          "Un nuage flottait dans le ciel. 天空中飘过一朵云。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "3657950",
            "zh": "10696011",
            "eng": "324266"
          },
          {
            "kind": "indirect",
            "fr": "6467930",
            "zh": "760833",
            "eng": "23743"
          },
          {
            "kind": "indirect",
            "fr": "13343835",
            "zh": "410560",
            "eng": "44134"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "482254",
            "zh": "1401749",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1226661",
            "zh": "13725599",
            "eng": "26527"
          }
        ]
      }
    },
    "flâner": {
      "display": "flâner",
      "prepositions": {
        "dans": [
          "J'ai flâné dans les rues pour passer le temps. 我在街上散步，消磨时间。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "180323",
            "zh": "475215",
            "eng": "23949"
          }
        ]
      }
    },
    "fonctionner": {
      "display": "fonctionner",
      "prepositions": {
        "en": [
          "Les feux tricolores fonctionnent en continu. 红绿灯一直在运作。",
          "Ces machines ne fonctionnent pas en ce moment. 这些机器目前不运转。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "799513",
            "zh": "798395",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "331265",
            "zh": "343841",
            "eng": ""
          }
        ]
      }
    },
    "fonder": {
      "display": "fonder",
      "prepositions": {
        "en": [
          "Harvard fut fondé en 1636. 哈佛始建于1636年。",
          "Cette école fut fondée en 1970. 这所学校是1970年建成的。",
          "Cette école a été fondée en 1650. 这所学校建于1650年。",
          "Notre école a été fondée en 1990. 我们的学校是在一九九零年创立的。",
          "L'université Harvard a été fondée en 1636. 哈佛大学是在一六三六年创立的。"
        ],
        "sur": [
          "Toutes les études cliniques ne sont pas fondées sur des hypothèses. 不是所有的临床研究都是假设驱动的。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "5524471",
            "zh": "1358639",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334936",
            "zh": "334981",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "338256",
            "zh": "799263",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "532489",
            "zh": "618181",
            "eng": "29190"
          },
          {
            "kind": "indirect",
            "fr": "7032314",
            "zh": "600001",
            "eng": "35606"
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "8558990",
            "zh": "8563446",
            "eng": "8558991"
          }
        ]
      }
    },
    "fondre": {
      "display": "fondre",
      "prepositions": {
        "en": [
          "En entendant la triste nouvelle, elle fondit en larmes. 听到这个悲伤的消息，她泣不成声。",
          "La petite fille a fondu en larmes. 这个年轻的女孩泪流满面。"
        ],
        "sur": [
          "Un plat en plastique fondra sur la cuisinière. 塑料盘子在烤箱里会化的。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "139885",
            "zh": "343469",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11967316",
            "zh": "804978",
            "eng": "46468"
          }
        ],
        "sur": [
          {
            "kind": "direct",
            "fr": "13239",
            "zh": "444641",
            "eng": ""
          }
        ]
      }
    },
    "forcer": {
      "display": "forcer",
      "prepositions": {
        "à": [
          "Il m'a forcé à y aller. 他强迫我到那里去。",
          "Elle le força à s'asseoir. 她强迫他坐下。",
          "L'armée l'a forcé à démissionner. 军队强迫他辞职。",
          "Elle le força à manger des épinards. 她强迫他吃菠菜。",
          "Je ne te forcerai jamais à l'épouser. 我永远不会逼你跟他结婚。",
          "La maladie l'a forcé à abandonner l'école. 生病迫使他退学。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "389578",
            "zh": "2192770",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1339614",
            "zh": "13108753",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "812318",
            "zh": "812205",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1348225",
            "zh": "6937159",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10225",
            "zh": "790751",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "330976",
            "zh": "336445",
            "eng": ""
          }
        ]
      }
    },
    "foutre": {
      "display": "foutre",
      "prepositions": {
        "de": [
          "Je me fous de mon CV. 我根本不在乎我的简历。",
          "Tu t'en fous de ce que je dis, c'est ça ? 你当我说话在放屁，是吗？",
          "Si la saucisse est aussi grosse que le pain, on s'en fout de quelle taille est le pain. 如果香肠和面包一样粗，我们无所谓面包有多大。",
          "Est-ce que tu te fous de moi ? 你是在跟我开玩笑吧？！"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "504937",
            "zh": "504940",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2302781",
            "zh": "2300128",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "804712",
            "zh": "804843",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3782869",
            "zh": "48",
            "eng": "1334"
          }
        ]
      }
    },
    "frapper": {
      "display": "frapper",
      "prepositions": {
        "à": [
          "Il m'a frappé à la tête. 他打了我的头。",
          "Je l'ai frappé au ventre. 我打了他的肚子。",
          "Quelqu'un a frappé à la porte. 有人敲门了。",
          "Il a frappé à la porte fermée. 他敲了敲紧闭的门。",
          "Un homme laid frappa à ma porte. 一个丑男人敲了我的门。",
          "J'ai entendu frapper à la porte. 我听到了敲门声。"
        ],
        "par": [
          "Il m'a frappé par erreur. 他不小心打到了我。",
          "Sa maison a été frappée par la foudre. 他的房子遭到雷击。",
          "J'ai été frappé par la foudre. 我被雷劈了。"
        ]
      },
      "prepositionOrder": [
        "à",
        "par"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "15440",
            "zh": "343980",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "846384",
            "zh": "846375",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "500881",
            "zh": "347125",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "893504",
            "zh": "846262",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10018",
            "zh": "333234",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1098603",
            "zh": "889161",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "335176",
            "zh": "335224",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "579895",
            "zh": "848648",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2589189",
            "zh": "5574631",
            "eng": "2544955"
          }
        ]
      }
    },
    "frissonner": {
      "display": "frissonner",
      "prepositions": {
        "de": [
          "Je frissonne de froid. 我的身体被冻得瑟瑟发抖。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "11237948",
            "zh": "8800808",
            "eng": "10657438"
          }
        ]
      }
    },
    "fumer": {
      "display": "fumer",
      "prepositions": {
        "dans": [
          "Vous ne pouvez pas fumer dans cette pièce. 这房间是禁止吸烟的。",
          "Je t'ai déjà dit de ne pas fumer dans ta chambre. 我已经和你说过不要在你的房间吸烟。",
          "S'il vous plaît abstenez-vous de fumer dans les endroits publics. 在公共场所请控制自己不要吸烟。",
          "Tu ne peux pas fumer dans l'ascenseur. 电梯内不准吸烟。",
          "Pourrais-tu ne pas fumer dans cette pièce ? 请问你能不在房间里吸烟吗？",
          "Il est interdit aux élèves de fumer dans l'enceinte de l'école. 学生不得在校园范围内吸烟。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "3632552",
            "zh": "430240",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "888708",
            "zh": "1334017",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8668",
            "zh": "1312466",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3556285",
            "zh": "523893",
            "eng": "65234"
          },
          {
            "kind": "indirect",
            "fr": "2490610",
            "zh": "5903471",
            "eng": "1268812"
          },
          {
            "kind": "indirect",
            "fr": "9978545",
            "zh": "419264",
            "eng": "48938"
          }
        ]
      }
    },
    "fâcher": {
      "display": "fâcher",
      "prepositions": {
        "avec": [
          "Pourquoi es-tu fâché avec lui ? 你为什么跟他生气？"
        ],
        "contre": [
          "Tu es fâché contre Tom ? 你在生汤姆的气吗？",
          "Je suis fâché contre elle. 我生她的气。",
          "Elle doit être fâchée contre moi. 她一定在生我的气。",
          "Il s'est fâché contre moi parce que je l'ai appelé Nabot. 我把他叫做“矮子”，他就气得不得了。"
        ]
      },
      "prepositionOrder": [
        "avec",
        "contre"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "839495",
            "zh": "839505",
            "eng": ""
          }
        ],
        "contre": [
          {
            "kind": "indirect",
            "fr": "4418331",
            "zh": "4887670",
            "eng": "4667067"
          },
          {
            "kind": "indirect",
            "fr": "394817",
            "zh": "738501",
            "eng": "321938"
          },
          {
            "kind": "indirect",
            "fr": "838366",
            "zh": "861150",
            "eng": "317010"
          },
          {
            "kind": "indirect",
            "fr": "9131597",
            "zh": "422970",
            "eng": "33569"
          }
        ]
      }
    },
    "féliciter": {
      "display": "féliciter",
      "prepositions": {
        "de": [
          "féliciter qqn de qqch 为某事祝贺某人"
        ],
        "pour": [
          "Il me félicita pour mon succès. 他为我的成功恭贺我。",
          "Je vous félicite pour vos fiançailles. 我为你的订婚祝贺。"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ],
        "pour": [
          {
            "kind": "indirect",
            "fr": "936569",
            "zh": "836294",
            "eng": "297924"
          },
          {
            "kind": "indirect",
            "fr": "11584",
            "zh": "8857229",
            "eng": "54466"
          }
        ]
      }
    },
    "gagner": {
      "display": "gagner",
      "prepositions": {
        "à": [
          "gagner à être connu 越了解越觉得好",
          "Tu ne gagnes rien à dénigrer les autres. 通过诋毁别人，你得不到什么。",
          "Trouver un gentil garçon, c'est plus dur que de gagner au loto. 找一个好男人比中彩票还要难。",
          "Comment as-tu gagné ta vie à Tokyo ? 你在东京如何维持生计？",
          "J'ai gagné à la loterie. 我中奖了。",
          "Si je gagne à la loterie, je pourrai avoir la belle vie. 如果我中了彩劵，就一辈子衣食无忧了。"
        ],
        "en": [
          "gagner en qualité 在质量上有所提升"
        ],
        "contre": [
          "gagner contre qqn 战胜某人"
        ]
      },
      "prepositionOrder": [
        "à",
        "en",
        "contre"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "2872970",
            "zh": "1358598",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1082814",
            "zh": "1082812",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2404260",
            "zh": "472385",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "406122",
            "zh": "1411695",
            "eng": "320982"
          },
          {
            "kind": "indirect",
            "fr": "10711531",
            "zh": "1454045",
            "eng": "320983"
          }
        ],
        "en": [
          {
            "kind": "curated",
            "authored": true
          }
        ],
        "contre": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "gagner du temps 赢得时间",
          "collocation": "gagner du temps",
          "chinese": "赢得时间",
          "source": "authored"
        },
        {
          "text": "gagner sa vie 谋生",
          "collocation": "gagner sa vie",
          "chinese": "谋生",
          "source": "authored"
        }
      ]
    },
    "garder": {
      "display": "garder",
      "prepositions": {
        "en": [
          "Gardez en mémoire ce qu'il a dit ! 你要好好记住他的话。"
        ],
        "pour": [
          "Veuillez le garder pour vous. 请保密。"
        ]
      },
      "prepositionOrder": [
        "en",
        "pour"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "7634758",
            "zh": "1194728",
            "eng": "286098"
          }
        ],
        "pour": [
          {
            "kind": "indirect",
            "fr": "1835343",
            "zh": "404460",
            "eng": "1734719"
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "garder le silence 保持沉默",
          "collocation": "garder le silence",
          "chinese": "保持沉默",
          "source": "authored"
        }
      ]
    },
    "garer": {
      "display": "garer",
      "prepositions": {
        "dans": [
          "Tu ne peux pas te garer dans cette rue. 这条街不准停车。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "4244454",
            "zh": "2882913",
            "eng": "2882914"
          }
        ]
      }
    },
    "gaspiller": {
      "display": "gaspiller",
      "prepositions": {
        "de": [
          "Tu gaspilles de l'eau. 你在浪费水。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "2226662",
            "zh": "10371729",
            "eng": "2218508"
          }
        ]
      }
    },
    "geler": {
      "display": "geler",
      "prepositions": {
        "à": [
          "L'eau gèle à 32 degrés Fahrenheit. 水在华氏32度结成冰。",
          "L'eau gèle à zéro degré Celsius. 水在摄氏0度时结成冰。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "457155",
            "zh": "798360",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "895015",
            "zh": "875046",
            "eng": "270776"
          }
        ]
      }
    },
    "glisser": {
      "display": "glisser",
      "prepositions": {
        "sur": [
          "Il a glissé sur la glace. 他在冰上滑了一跤。",
          "Ne glisse pas sur la glace. 不要在冰上滑倒啊。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "133238",
            "zh": "10605119",
            "eng": "10605036"
          },
          {
            "kind": "indirect",
            "fr": "9576761",
            "zh": "3364555",
            "eng": "3022625"
          }
        ]
      }
    },
    "goûter": {
      "display": "goûter",
      "prepositions": {
        "à": [
          "goûter à qqch 尝一尝某物"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "grandir": {
      "display": "grandir",
      "prepositions": {
        "en": [
          "Il grandit en Australie. 他在澳大利亚长大。",
          "Où as-tu grandi en Australie ? 你在澳洲的哪里长大?"
        ],
        "dans": [
          "J'ai grandi dans une petite ville. 我在一个小镇长大。",
          "J'ai grandi dans les montagnes. 我在山区长大。",
          "Il a grandi dans un petit village. 他在一个小村庄里长大。",
          "J'ai grandi dans cette petite ville. 我在这个小镇上长大的。",
          "J'ai grandi dans une famille pauvre. 我出身贫寒。"
        ]
      },
      "prepositionOrder": [
        "en",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "3050750",
            "zh": "332981",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "390233",
            "zh": "900263",
            "eng": "65150"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "1704207",
            "zh": "12687028",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11557969",
            "zh": "4464879",
            "eng": "2330008"
          },
          {
            "kind": "indirect",
            "fr": "408672",
            "zh": "875372",
            "eng": "299545"
          },
          {
            "kind": "indirect",
            "fr": "943642",
            "zh": "802077",
            "eng": "253665"
          },
          {
            "kind": "indirect",
            "fr": "2187061",
            "zh": "5613652",
            "eng": "2182447"
          }
        ]
      }
    },
    "grignoter": {
      "display": "grignoter",
      "prepositions": {
        "entre": [
          "Si tu veux maigrir, tu devrais arrêter de grignoter entre les repas. 如果你想变瘦，就应该少点在正餐以外吃零食。"
        ]
      },
      "prepositionOrder": [
        "entre"
      ],
      "sources": {
        "entre": [
          {
            "kind": "direct",
            "fr": "181615",
            "zh": "1085661",
            "eng": ""
          }
        ]
      }
    },
    "grimper": {
      "display": "grimper",
      "prepositions": {
        "à": [
          "Un ours peut grimper à un arbre. 熊会爬树。",
          "J'ai vu des singes grimper à l'arbre. 我看见一些猴子正在爬树。",
          "Il est facile pour un singe de grimper à un arbre. 对猴子来说，爬树很容易。",
          "Ne grimpez pas à cette échelle, elle n'est pas sûre. 不要爬那个梯子，它不安全。",
          "Tom grimpe à un arbre. 汤姆在爬树。"
        ],
        "sur": [
          "Comment est-ce que le chat a réussi à grimper sur le toit ? 那只猫是怎么爬上屋顶的？",
          "Le chat a grimpé sur le noyer. 猫咪爬上了核桃树。"
        ],
        "dans": [
          "Grimpe dans la voiture ! 上车吧！",
          "Grimpe dans ta voiture ! 进你的车里。"
        ]
      },
      "prepositionOrder": [
        "à",
        "sur",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "9079",
            "zh": "677642",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426066",
            "zh": "426391",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "138697",
            "zh": "345849",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10465",
            "zh": "472292",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "6892279",
            "zh": "10464507",
            "eng": "1662295"
          }
        ],
        "sur": [
          {
            "kind": "direct",
            "fr": "8674163",
            "zh": "10538075",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "6047934",
            "zh": "13543768",
            "eng": "12283861"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "1849973",
            "zh": "7768011",
            "eng": "1839425"
          },
          {
            "kind": "indirect",
            "fr": "3641774",
            "zh": "5701333",
            "eng": "3636095"
          }
        ]
      }
    },
    "gronder": {
      "display": "gronder",
      "prepositions": {
        "par": [
          "Ils furent grondés par l'instituteur. 他们被老师训斥了。",
          "En vérité, je me suis fait gronder par ma mère. 老实说，我被我妈妈骂了。",
          "Tom sera grondé par son père. 汤姆会被他老爸教训的。",
          "As-tu été grondé par ta maîtresse ? 你被老师骂了吗？"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "1358027",
            "zh": "4972636",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "358397",
            "zh": "397129",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1692608",
            "zh": "2024142",
            "eng": "37038"
          },
          {
            "kind": "indirect",
            "fr": "8979422",
            "zh": "373174",
            "eng": "69154"
          }
        ]
      }
    },
    "grouiller": {
      "display": "grouiller",
      "prepositions": {
        "de": [
          "New York grouille de très hauts immeubles. 纽约充满着高楼大厦。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "9970081",
            "zh": "864383",
            "eng": "35925"
          }
        ]
      }
    },
    "guider": {
      "display": "guider",
      "prepositions": {
        "par": [
          "Il s'est laissé guider par la jalousie. 嫉妒让他那样做了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "1484739",
            "zh": "785268",
            "eng": ""
          }
        ]
      }
    },
    "guérir": {
      "display": "guérir",
      "prepositions": {
        "de": [
          "Le médecin la guérit de son mal. 医生治好了她的病。",
          "Le médicament l'a guéri de sa maladie. 那药治好了他的病。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1586606",
            "zh": "335717",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11923375",
            "zh": "1321383",
            "eng": "324221"
          }
        ]
      }
    },
    "générer": {
      "display": "générer",
      "prepositions": {
        "de": [
          "Le tourisme génère de nombreux emplois nouveaux. 旅游业创造了许多新的工作职位。",
          "Un courant électrique peut générer du magnétisme. 电流可以产生磁性。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "479095",
            "zh": "2138396",
            "eng": "20931"
          },
          {
            "kind": "indirect",
            "fr": "129520",
            "zh": "796023",
            "eng": "279237"
          }
        ]
      }
    },
    "habiller": {
      "display": "habiller",
      "prepositions": {
        "en": [
          "La dame habillée en blanc est une actrice célèbre. 穿白衣服的女士是个著名演员。",
          "Elle est toujours habillée en noir. 她总是一身黑。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "39714",
            "zh": "389831",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "133920",
            "zh": "1243801",
            "eng": "310426"
          }
        ]
      }
    },
    "habiter": {
      "display": "habiter",
      "prepositions": {
        "à": [
          "J'habite à Kakogawa. 我住在加古川。",
          "Elle habite à Kyoto. 她住在京都。",
          "J'habite à Tbilissi. 我住在提比里斯。",
          "J'habite à Maastricht. 我住在马斯特里赫特。",
          "Il habite à la campagne. 他住在乡下地区。",
          "Elle habite à côté de lui. 她住在他的隔壁。"
        ],
        "en": [
          "J'habite en Amérique. 我住在美国。",
          "Où tu habites en Turquie ? 你在土耳其哪儿生活?",
          "J'ai un ami qui habite en Angleterre. 我有个住在英国的朋友。",
          "Il habite en Angleterre. 他居住在英格兰。"
        ],
        "dans": [
          "J'habite dans cet hôtel. 我住在这家旅店。",
          "Il habite dans une pomme. 他住在苹果里面。",
          "J'habite dans la capitale. 我住在首都。",
          "J'habite dans un appartement. 我住在一间公寓里。",
          "J'habite dans une grande ville. 我住在一个大城市里。",
          "Il n'habite pas dans mon quartier. 他不住在我的小区。"
        ],
        "chez": [
          "habiter chez qqn 住在某人家",
          "Maintenant, j'habite chez mon oncle. 我现在住在叔叔家.",
          "Vous habitez chez vos parents ? 你和你的父母同住吗？"
        ]
      },
      "prepositionOrder": [
        "à",
        "en",
        "dans",
        "chez"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "9626",
            "zh": "343749",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "676999",
            "zh": "736578",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1482176",
            "zh": "1482174",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10015796",
            "zh": "10018249",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "181710",
            "zh": "757718",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "457757",
            "zh": "457755",
            "eng": ""
          }
        ],
        "en": [
          {
            "kind": "direct",
            "fr": "13132013",
            "zh": "13132035",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1114727",
            "zh": "1862596",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7386",
            "zh": "614447",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7098044",
            "zh": "3783372",
            "eng": "3176252"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "488162",
            "zh": "10450904",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "514796",
            "zh": "514814",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9287774",
            "zh": "9423562",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "606504",
            "zh": "10363134",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "127472",
            "zh": "334645",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "181682",
            "zh": "408271",
            "eng": ""
          }
        ],
        "chez": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "352942",
            "zh": "352944",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "440032",
            "zh": "793955",
            "eng": "440064"
          }
        ]
      }
    },
    "habituer": {
      "display": "habituer",
      "prepositions": {
        "à": [
          "Je ne suis pas habituée à me lever tôt. 我不习惯早起。",
          "Je suis habitué à me coucher très tard. 我习惯晚睡。",
          "Tu vas bientôt t'habituer à parler en public. 你很快就会习惯在大庭广众说话了。",
          "Il était habitué à parler avec des étrangers. 他习惯和外国人说话。",
          "Tu vas bientôt t'habituer à ta nouvelle école. 你很快就会适应你的新学校。",
          "Il faudra t'habituer aux trains bondés de Tokyo. 你要习惯东京拥挤的火车。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "126531",
            "zh": "801362",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "416900",
            "zh": "1059273",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335441",
            "zh": "335504",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "796975",
            "zh": "797543",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474837",
            "zh": "476574",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426231",
            "zh": "426321",
            "eng": ""
          }
        ]
      }
    },
    "harceler": {
      "display": "harceler",
      "prepositions": {
        "par": [
          "Nos troupes étaient constamment harcelées par les guérilleros. 我们军队总是被游击队骚扰。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "1619416",
            "zh": "5613606",
            "eng": "23564"
          }
        ]
      }
    },
    "heurter": {
      "display": "heurter",
      "prepositions": {
        "par": [
          "J'ai presque été heurté par une voiture. 我几乎被车撞到了。",
          "Il a failli être heurté par la voiture en traversant la rue. 他过马路时差点被车撞。",
          "Elle fut heurtée par une voiture. 她被车撞了。",
          "Le chien fut heurté par un camion. 狗被卡车撞了。",
          "Le chien fut heurté par une voiture. 狗被车撞了。",
          "Elle a presque été heurtée par une voiture. 她几乎被车撞到。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "1337158",
            "zh": "885519",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "494739",
            "zh": "344874",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1315112",
            "zh": "850126",
            "eng": "388642"
          },
          {
            "kind": "indirect",
            "fr": "746291",
            "zh": "6111958",
            "eng": "239172"
          },
          {
            "kind": "indirect",
            "fr": "1335903",
            "zh": "904912",
            "eng": "388643"
          },
          {
            "kind": "indirect",
            "fr": "1341674",
            "zh": "895160",
            "eng": "388645"
          }
        ]
      }
    },
    "honorer": {
      "display": "honorer",
      "prepositions": {
        "de": [
          "Je suis honoré de vous rencontrer. 我很荣幸能见到你。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "6874592",
            "zh": "345284",
            "eng": "63896"
          }
        ]
      }
    },
    "humilier": {
      "display": "humilier",
      "prepositions": {
        "par": [
          "Le garçon ne fût pas humilié par le rire de ses camarades de classe. 那个男孩没有因为他同学的笑而谦卑。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "6759481",
            "zh": "1873139",
            "eng": "47491"
          }
        ]
      }
    },
    "hâter": {
      "display": "hâter",
      "prepositions": {
        "vers": [
          "Nous nous sommes hâtés vers la gare. 我们匆忙地去火车站了。",
          "Je me suis hâté vers la maison pour la trouver vide. 我匆匆忙忙的赶到那房子去，但却发现里面原来是空的。"
        ]
      },
      "prepositionOrder": [
        "vers"
      ],
      "sources": {
        "vers": [
          {
            "kind": "indirect",
            "fr": "2066308",
            "zh": "395891",
            "eng": "395890"
          },
          {
            "kind": "indirect",
            "fr": "432266",
            "zh": "432364",
            "eng": "254246"
          }
        ]
      }
    },
    "hériter": {
      "display": "hériter",
      "prepositions": {
        "de": [
          "hériter de qqch 继承某物",
          "Il a hérité de la propriété de son père. 他继承了他父亲的财产。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "133132",
            "zh": "397539",
            "eng": ""
          }
        ]
      }
    },
    "hésiter": {
      "display": "hésiter",
      "prepositions": {
        "à": [
          "hésiter à faire qqch 犹豫要不要做某事",
          "N'hésitez pas à poser des questions. 尽管提问。",
          "Si tu as la moindre difficulté, n'hésites pas à me demander de l'aide. 如果你有任何问题，你可以向我提问。",
          "Les journalistes n'hésitent pas à s'immiscer dans l'intimité des gens. 记者没有犹豫地去干涉了人们的私生活。",
          "N'hésite pas à poser des questions. 随时问任何问题都可以。",
          "N'hésite pas à me poser des questions. 请随便问问题。",
          "N'hésitez pas à poser des questions, je vous prie. 欢迎随时提问。"
        ],
        "entre": [
          "hésiter entre deux choses 在两者之间犹豫"
        ]
      },
      "prepositionOrder": [
        "à",
        "entre"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "128224",
            "zh": "1397035",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "139414",
            "zh": "365049",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "576065",
            "zh": "614789",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1638822",
            "zh": "839481",
            "eng": "36621"
          },
          {
            "kind": "indirect",
            "fr": "9758",
            "zh": "350685",
            "eng": "25785"
          },
          {
            "kind": "indirect",
            "fr": "1272779",
            "zh": "851544",
            "eng": "38505"
          }
        ],
        "entre": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "ignorer": {
      "display": "ignorer",
      "prepositions": {
        "de": [
          "Ne fais jamais confiance à un homme dont tu ignores tout du passé. 不要相信一个你一点都不了解他过去的人。",
          "J'ignore de quoi tu parles. 我不知道您在说什么。",
          "Elle ignore tout de la sexualité. 她对性一无所知。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "8886",
            "zh": "332608",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2318899",
            "zh": "10450773",
            "eng": "953423"
          },
          {
            "kind": "indirect",
            "fr": "1272906",
            "zh": "344818",
            "eng": "311057"
          }
        ]
      }
    },
    "immiscer": {
      "display": "immiscer",
      "prepositions": {
        "dans": [
          "Ne t'immisce pas dans ses affaires. 不要干涉他的事。",
          "Il s'est immiscé dans son intimité. 他侵犯了她的隐私。",
          "Prenez garde de ne pas vous immiscer dans sa vie privée. 注意不要侵犯她的隐私。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "882427",
            "zh": "1316897",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1816464",
            "zh": "1780725",
            "eng": "302793"
          },
          {
            "kind": "indirect",
            "fr": "133733",
            "zh": "842448",
            "eng": "309041"
          }
        ]
      }
    },
    "impliquer": {
      "display": "impliquer",
      "prepositions": {
        "dans": [
          "Je ne veux pas être impliqué dans cette histoire. 我不想被牵扯到这件事里。",
          "Ils se sont impliqués dans la recherche sur le cancer. 他们从事癌症研究工作。",
          "Mon père est vraiment très impliqué dans la bourse à présent. 我爸爸现在非常专注于股市。",
          "Il était impliqué dans l'affaire. 他被卷进了是非中。",
          "Il admet être impliqué dans le scandale. 他承认自己与这宗丑闻有牵连。",
          "Je ne veux pas être impliqué dans cette affaire. 我可不想卷入这场纷争中去。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "416020",
            "zh": "787633",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1788516",
            "zh": "349560",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333555",
            "zh": "333572",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "336493",
            "zh": "336450",
            "eng": "290546"
          },
          {
            "kind": "indirect",
            "fr": "236569",
            "zh": "1951802",
            "eng": "290498"
          },
          {
            "kind": "indirect",
            "fr": "7285",
            "zh": "1188447",
            "eng": "253621"
          }
        ]
      }
    },
    "implorer": {
      "display": "implorer",
      "prepositions": {
        "de": [
          "Il l'a implorée de le favoriser. 他请求她给予优待。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "331821",
            "zh": "332618",
            "eng": ""
          }
        ]
      }
    },
    "impressionner": {
      "display": "impressionner",
      "prepositions": {
        "par": [
          "Je suis très impressionné par votre travail. 我对你们的工作印象深刻。",
          "Je fus impressionné par son travail. 她的作品给我留下了深刻印象。",
          "J'ai été très impressionné par son histoire. 他的故事给我留下了很深的印象。",
          "J'ai été grandement impressionné par les décors. 我被这景色深深迷住了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "6613",
            "zh": "679447",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3586989",
            "zh": "6132389",
            "eng": "2130914"
          },
          {
            "kind": "indirect",
            "fr": "417253",
            "zh": "2715531",
            "eng": "260786"
          },
          {
            "kind": "indirect",
            "fr": "2567383",
            "zh": "5551144",
            "eng": "48577"
          }
        ]
      }
    },
    "imprégner": {
      "display": "imprégner",
      "prepositions": {
        "de": [
          "L'air était imprégné de l'odeur de la mer. 空气中充斥着海的气息。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "11185909",
            "zh": "12384714",
            "eng": "10131082"
          }
        ]
      }
    },
    "inciter": {
      "display": "inciter",
      "prepositions": {
        "à": [
          "inciter qqn à faire qqch 促使某人做某事",
          "Son conseil m'a incité à changer d'avis. 他的建议促使我改变了主意。",
          "La vue de l'argent l'a incité à voler. 看到这笔钱使他被诱惑偷东西。",
          "J'ai incité mes étudiants à travailler davantage. 我鼓励学生们更努力地学习。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "130161",
            "zh": "410831",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12320522",
            "zh": "9961549",
            "eng": "48633"
          },
          {
            "kind": "indirect",
            "fr": "480658",
            "zh": "2254413",
            "eng": "258993"
          }
        ]
      }
    },
    "indiquer": {
      "display": "indiquer",
      "prepositions": {
        "sur": [
          "Le contenu de la boîte est indiqué sur l'étiquette. 箱子的内容在标签上面写着。",
          "La date de fabrication est indiquée sur le couvercle. 生产日期在盖子上。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "181998",
            "zh": "455323",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "181999",
            "zh": "4621020",
            "eng": ""
          }
        ]
      }
    },
    "informer": {
      "display": "informer",
      "prepositions": {
        "de": [
          "Je suis juste venu vous informer du fait. 我只是来告诉你们事实的。",
          "Elle lut la lettre et fut ainsi informée de son décès. 她读了信，由此得知他的死讯。"
        ],
        "sur": [
          "Je suis bien informé sur ce sujet. 我对这件事知情。"
        ]
      },
      "prepositionOrder": [
        "de",
        "sur"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "465398",
            "zh": "466069",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "835904",
            "zh": "1324010",
            "eng": ""
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "11481752",
            "zh": "817366",
            "eng": "7829853"
          }
        ]
      }
    },
    "inonder": {
      "display": "inonder",
      "prepositions": {
        "de": [
          "Je voyageais à travers les villages et les champs peuplés de cigales et inondés de rayons de soleil. 游荡在知了和阳光充斥的村舍田野"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "13376567",
            "zh": "13376566",
            "eng": ""
          }
        ]
      }
    },
    "inquiéter": {
      "display": "inquiéter",
      "prepositions": {
        "pour": [
          "Tu n'as plus à t'inquiéter pour moi. 你不用再为我担心了。",
          "Je m'inquiète pour Tom. 我在为汤姆担心。",
          "Je m'inquiète pour toi. 我很担心你。",
          "Ne t'inquiète pas pour moi. 不要担心我。",
          "Je m'inquiétais pour sa santé. 我担心他的健康。",
          "Nous nous inquiétons pour toi. 我们很担心你。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "11172197",
            "zh": "12686304",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2262944",
            "zh": "5924732",
            "eng": "1839542"
          },
          {
            "kind": "indirect",
            "fr": "5306743",
            "zh": "348010",
            "eng": "706994"
          },
          {
            "kind": "indirect",
            "fr": "9728",
            "zh": "793248",
            "eng": "25528"
          },
          {
            "kind": "indirect",
            "fr": "127699",
            "zh": "5691278",
            "eng": "260589"
          },
          {
            "kind": "indirect",
            "fr": "482152",
            "zh": "348011",
            "eng": "17389"
          }
        ]
      }
    },
    "inscrire": {
      "display": "inscrire",
      "prepositions": {
        "dans": [
          "Je me suis inscrit dans cette école il y a deux ans. 两年前我在这个学校注册了。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "472741",
            "zh": "472786",
            "eng": ""
          }
        ]
      }
    },
    "insister": {
      "display": "insister",
      "prepositions": {
        "pour": [
          "Elle insista pour que je voie un docteur. 她坚持让我去看医生。",
          "Jimmy insista pour que je l'amène au zoo. 吉米坚持要我带他去动物园。"
        ],
        "sur": [
          "insister sur qqch 强调某事",
          "Monsieur Johnson insiste sur sa théorie. 约翰逊先生坚持他的理论。",
          "Je veux insister sur ce point en particulier. 我想特别强调这一点。",
          "Ils insistent sur le fait qu'il devrait partir. 他们坚持让他走。",
          "Elle insistait sur le fait que c'était ma faute. 她坚持认为那是我的错。"
        ]
      },
      "prepositionOrder": [
        "pour",
        "sur"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "134356",
            "zh": "1314030",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1018568",
            "zh": "793966",
            "eng": "53369"
          }
        ],
        "sur": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "465177",
            "zh": "466260",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135160",
            "zh": "2368479",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "336147",
            "zh": "333037",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "483880",
            "zh": "333503",
            "eng": ""
          }
        ]
      }
    },
    "inspirer": {
      "display": "inspirer",
      "prepositions": {
        "de": [
          "Cette histoire est inspirée de faits réels. 这个故事是基于真实事件写的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "13389094",
            "zh": "1964269",
            "eng": "57257"
          }
        ]
      }
    },
    "installer": {
      "display": "installer",
      "prepositions": {
        "sur": [
          "De nombreux radars ont été installés sur le bord de la route. 路边装了许多雷达。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "900323",
            "zh": "900301",
            "eng": ""
          }
        ]
      }
    },
    "interdire": {
      "display": "interdire",
      "prepositions": {
        "de": [
          "interdire à qqn de faire qqch 禁止某人做某事",
          "Il m'est interdit d'utiliser ce téléphone. 我被禁止使用这部电话。",
          "Il est interdit de fumer pendant le service. 值班时间不准吸烟。",
          "Il est interdit de discuter dans la bibliothèque. 不准在图书馆里谈话。",
          "Il est interdit de lire des livres dans cette bibliothèque. 这个图书馆里禁止看书。",
          "Il y a beaucoup de zones au Canada où il est interdit d'abattre des arbres. 在加拿大有很多区域砍伐树木是非法的。",
          "Il est interdit de fumer. 禁止吸烟。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "7265",
            "zh": "390438",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1097810",
            "zh": "344402",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799630",
            "zh": "798325",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "480764",
            "zh": "481336",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1291299",
            "zh": "3408562",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3647295",
            "zh": "4885840",
            "eng": "2717915"
          }
        ]
      }
    },
    "intervenir": {
      "display": "intervenir",
      "prepositions": {
        "dans": [
          "Vous n'avez aucun droit d'intervenir dans les affaires des autres. 你没有干涉他人事务的权力。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "459219",
            "zh": "1227061",
            "eng": "69132"
          }
        ]
      }
    },
    "introduire": {
      "display": "introduire",
      "prepositions": {
        "dans": [
          "Un cambrioleur s'est introduit dans sa maison. 一个窃贼闯进了他的房子。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "8089110",
            "zh": "844475",
            "eng": "19212"
          }
        ]
      }
    },
    "intéresser": {
      "display": "intéresser",
      "prepositions": {
        "par": [
          "Je suis intéressé par l'anglais. 我对英语感兴趣。",
          "Il est très intéressé par la biologie. 他对生物学不太感兴趣。",
          "Je suis très intéressé par la musique. 我对音乐非常感兴趣。",
          "Ils sont très intéressés par l'astronomie. 他们对天文学十分感兴趣。",
          "Je suis intéressé par l'histoire de l'Asie. 我对亚洲的历史很感兴趣。",
          "Je suis plus intéressé par l'anglais parlé. 我对口语英语更感兴趣。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "796954",
            "zh": "797545",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132770",
            "zh": "510690",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "472193",
            "zh": "472883",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1363705",
            "zh": "1566316",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10183",
            "zh": "390458",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "788005",
            "zh": "909456",
            "eng": ""
          }
        ]
      }
    },
    "inventer": {
      "display": "inventer",
      "prepositions": {
        "en": [
          "Le papier fut inventé en Chine. 纸是中国发明的。"
        ],
        "par": [
          "Le téléphone a été inventé par Bell. 电话是由贝尔发明的。",
          "Le papier a été inventé par les Chinois. 纸是由中国人发明的。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "3835913",
            "zh": "1315973",
            "eng": "1315848"
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "539767",
            "zh": "1659811",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12942422",
            "zh": "801453",
            "eng": "263350"
          }
        ]
      }
    },
    "inviter": {
      "display": "inviter",
      "prepositions": {
        "à": [
          "inviter qqn à faire qqch 邀请某人做某事",
          "Il m'a invité à une fête. 他邀请我去一个宴会。",
          "Merci de m'avoir invité à diner. 谢谢你邀请我吃饭。",
          "J'aimerais t'inviter à la soirée. 我想请你参加派对。",
          "Merci de m'avoir invité à la fête. 感谢你请我来参加派对。",
          "Elle nous invita à sa fête d'anniversaire. 她邀请我们去她的生日派对。",
          "Je l'ai invité à une fête et il a accepté. 我邀请他去派对，他接受了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "992788",
            "zh": "1314152",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "399909",
            "zh": "1541584",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10446",
            "zh": "347060",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "341348",
            "zh": "343965",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333175",
            "zh": "333181",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "793997",
            "zh": "794135",
            "eng": ""
          }
        ]
      }
    },
    "jeter": {
      "display": "jeter",
      "prepositions": {
        "par": [
          "Ne jetez rien par terre. 不要往地上扔任何东西。",
          "Il déchira sa lettre en petits morceaux et les jeta par la fenêtre. 他把信撕成碎片，扔出了窗外。"
        ],
        "dans": [
          "Le démon se saisit de ma sœur et la jeta dans un puits sans fond, avec un ricanement. 恶魔一把抓住了我的妹妹，一边狰狞地狂笑着，一边把她丢进了一个无底洞里。"
        ]
      },
      "prepositionOrder": [
        "par",
        "dans"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "655253",
            "zh": "791641",
            "eng": "434668"
          },
          {
            "kind": "indirect",
            "fr": "132547",
            "zh": "373192",
            "eng": "299234"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "799758",
            "zh": "1085704",
            "eng": "723182"
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "jeter un coup d'œil 看一眼",
          "collocation": "jeter un coup d'œil",
          "chinese": "看一眼",
          "source": "authored"
        }
      ]
    },
    "joindre": {
      "display": "joindre",
      "prepositions": {
        "à": [
          "Comme je suis malade, je ne me joindrai pas à vous. 我病了，那我就不跟你们一起了。",
          "Je me joins volontiers au Parti communiste chinois. 我自愿加入中国共产党。",
          "Puis-je me joindre à vous ? 我可以参加吗？",
          "Aimeriez-vous vous joindre à ma soirée ? 你来不来我的派对啊？",
          "J'ai essayé de te joindre au téléphone mais ça ne passait pas. 我打了电话给你，但却接不通。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "134787",
            "zh": "343721",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1046597",
            "zh": "521148",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "13970",
            "zh": "380601",
            "eng": "321988"
          },
          {
            "kind": "indirect",
            "fr": "484808",
            "zh": "337472",
            "eng": "250375"
          },
          {
            "kind": "indirect",
            "fr": "469905",
            "zh": "472950",
            "eng": "16440"
          }
        ]
      }
    },
    "jouer": {
      "display": "jouer",
      "prepositions": {
        "à": [
          "jouer à un jeu / à un sport 玩（游戏）；从事（球类运动）",
          "Jouons aux échecs. 我们下象棋吧。",
          "Jouons au football. 去踢足球吧。",
          "Il a joué au tennis. 他打了网球。",
          "J'ai joué au tennis. 我打了网球。",
          "Tu joues au tennis ? 你打网球吗？",
          "Il joue bien au golf. 他高尔夫球打得好。"
        ],
        "de": [
          "jouer d'un instrument 演奏（乐器）",
          "Je joue du piano. 我弹钢琴。",
          "Je joue du violon. 我拉小提琴。",
          "J'aime jouer du piano. 我喜欢弹钢琴。",
          "Il sait jouer du piano. 他会弹钢琴。",
          "Elle sait jouer du piano. 她会弹钢琴。",
          "Elle joue bien du violon. 她的小提琴拉得很好。"
        ],
        "avec": [
          "Allez, joue avec moi, j'm'ennuie trop ! 来呀，跟我玩，我太无聊了！",
          "Tu ne devrais pas jouer avec ses sentiments. 你不该玩弄他的感情。",
          "Ne joue pas avec la clef. 不要玩钥匙。",
          "Ne joue pas avec ma patience. 别挑战我的耐心。",
          "Le bébé joue avec des jouets. 这个小婴儿正在玩一些玩具。",
          "Ne jouez pas avec les allumettes. 别玩洋火"
        ]
      },
      "prepositionOrder": [
        "à",
        "de",
        "avec"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "8666835",
            "zh": "10333118",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11628",
            "zh": "332489",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335074",
            "zh": "335093",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "427382",
            "zh": "669021",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "431371",
            "zh": "10272101",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7920077",
            "zh": "10199428",
            "eng": ""
          }
        ],
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "6945",
            "zh": "763739",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6962",
            "zh": "711635",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6942",
            "zh": "347427",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "772089",
            "zh": "398359",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134096",
            "zh": "405262",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "343220",
            "zh": "343226",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "3495",
            "zh": "501562",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1320378",
            "zh": "970191",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12114",
            "zh": "1692270",
            "eng": "1691374"
          },
          {
            "kind": "indirect",
            "fr": "5600041",
            "zh": "5363959",
            "eng": "1495855"
          },
          {
            "kind": "indirect",
            "fr": "12463980",
            "zh": "895714",
            "eng": "45871"
          },
          {
            "kind": "indirect",
            "fr": "7700487",
            "zh": "5136615",
            "eng": "2270517"
          }
        ]
      },
      "notes": {
        "de": "jouer de = 演奏乐器；jouer à = 玩游戏／球类",
        "à": "jouer à = 玩游戏／球类；jouer de = 演奏乐器"
      }
    },
    "jouir": {
      "display": "jouir",
      "prepositions": {
        "de": [
          "Elles jouissent d'un immense prestige. 她们享有崇高的威望。",
          "Elles jouissent d'une grande réputation. 她们享有盛名。",
          "Il jouissait du privilège d'une éducation privée. 他享有私人教学的特权。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "899443",
            "zh": "899319",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1078535",
            "zh": "899318",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465710",
            "zh": "465835",
            "eng": ""
          }
        ]
      }
    },
    "juger": {
      "display": "juger",
      "prepositions": {
        "par": [
          "À en juger par son apparence, il doit être riche. 从他的外表来看，他应该是个有钱人。",
          "À en juger par son visage, il semble qu'il ait réussi. 从他脸上的神情来看，他似乎是成功了。",
          "À en juger par le ciel, il est possible qu'il pleuve cet après-midi. 从天色上判断，今天下午可能会下雨。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "130223",
            "zh": "346736",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "492330",
            "zh": "344707",
            "eng": "285814"
          },
          {
            "kind": "indirect",
            "fr": "463504",
            "zh": "871123",
            "eng": "18148"
          }
        ]
      }
    },
    "jurer": {
      "display": "jurer",
      "prepositions": {
        "de": [
          "Il a juré d'arrêter de fumer. 他发誓要戒烟。",
          "Les deux amoureux jurèrent de s'aimer éternellement. 两个恋人发誓永远相爱。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1557993",
            "zh": "332445",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3359383",
            "zh": "9953359",
            "eng": "3384326"
          }
        ]
      }
    },
    "laisser": {
      "display": "laisser",
      "prepositions": {
        "en": [
          "Ils m'ont laissé m'en aller. 他们让我走。",
          "Je vous laisserai vous en débrouiller. 我把这个留给你。",
          "L'une des filles fut laissée en arrière. 这些女孩当中其中一个被留下来了。"
        ],
        "sur": [
          "Je l'ai laissé sur la table. 我把它留在桌上了。",
          "Le cambrioleur fut détecté par l'une des choses qu'il avait laissée sur place. 警方根据现场遗下的证物把贼子找了出来。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "1935611",
            "zh": "765254",
            "eng": "495626"
          },
          {
            "kind": "indirect",
            "fr": "1511962",
            "zh": "688348",
            "eng": "1511072"
          },
          {
            "kind": "indirect",
            "fr": "1357926",
            "zh": "892566",
            "eng": "267826"
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "909677",
            "zh": "6114426",
            "eng": "436723"
          },
          {
            "kind": "indirect",
            "fr": "1234046",
            "zh": "387116",
            "eng": "19204"
          }
        ]
      }
    },
    "languir": {
      "display": "languir",
      "prepositions": {
        "de": [
          "Je commence à me languir de ma petite amie. 我开始想念我的女朋友。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1079961",
            "zh": "1328156",
            "eng": ""
          }
        ]
      }
    },
    "larguer": {
      "display": "larguer",
      "prepositions": {
        "sur": [
          "La première bombe atomique a été larguée sur le Japon. 第一颗原子弹投放到日本。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "890864",
            "zh": "348600",
            "eng": "244024"
          }
        ]
      }
    },
    "lasser": {
      "display": "lasser",
      "prepositions": {
        "de": [
          "N'es-tu pas lassé de faire chaque jour la même chose ? 你每天都是做一模一样的东西，难道不会觉得闷吗？",
          "Je suis lassé de regarder la télé. 我电视看腻了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "544398",
            "zh": "417764",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7009",
            "zh": "11321700",
            "eng": "255122"
          }
        ]
      }
    },
    "lever": {
      "display": "lever",
      "prepositions": {
        "pour": [
          "Tu devrais te lever pour parler. 你应该站起来说话。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "1574782",
            "zh": "1231036",
            "eng": "1573800"
          }
        ]
      }
    },
    "lier": {
      "display": "lier",
      "prepositions": {
        "à": [
          "Son échec semble être lié à son caractère. 看来他的失败和他的性格有关。",
          "C'est une croyance répandue, d'après un sondage national aux États-Unis, que les musulmans sont liés au terrorisme. 根据美国国民的一个投票，人们普遍认为穆斯林人和恐怖主义有关。",
          "Je ne suis lié à ce crime en aucune manière. 我与这起犯罪没有任何关系。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "130340",
            "zh": "673276",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3774",
            "zh": "502962",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4099781",
            "zh": "811963",
            "eng": "4098137"
          }
        ]
      }
    },
    "lire": {
      "display": "lire",
      "prepositions": {
        "sur": [
          "Je lis sur les lèvres. 我读唇语。"
        ],
        "dans": [
          "Je l'ai lu dans le journal. 我在报纸上看到了它。",
          "J'ai lu dans le journal qu'il avait été assassiné. 我在报纸上看到他被暗杀了。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "5254223",
            "zh": "10260764",
            "eng": "2246047"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "14837",
            "zh": "332437",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "139729",
            "zh": "431519",
            "eng": ""
          }
        ]
      }
    },
    "livrer": {
      "display": "livrer",
      "prepositions": {
        "à": [
          "Nous avons appelé le restaurant pour qu'il vienne nous livrer à domicile. 我们打了电话叫饭店送外卖到我家。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "619562",
            "zh": "619555",
            "eng": ""
          }
        ]
      }
    },
    "lutter": {
      "display": "lutter",
      "prepositions": {
        "contre": [
          "lutter contre qqch 与某事作斗争",
          "On ne peut pas lutter contre son destin. 人算不如天算。",
          "Il lutta contre la discrimination raciale. 他反对种族歧视。"
        ]
      },
      "prepositionOrder": [
        "contre"
      ],
      "sources": {
        "contre": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "704296",
            "zh": "704297",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7434757",
            "zh": "761264",
            "eng": "300140"
          }
        ]
      }
    },
    "léguer": {
      "display": "léguer",
      "prepositions": {
        "à": [
          "Il a légué sa fortune à son fils. 他把财产留给了他的儿子。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "12485081",
            "zh": "847889",
            "eng": "12476575"
          }
        ]
      }
    },
    "manquer": {
      "display": "manquer",
      "prepositions": {
        "à": [
          "manquer à qqn 使某人想念（Tu me manques 我想你）",
          "Vous allez manquer à vos amis. 您的朋友会想您的。",
          "Tu nous manques beaucoup à tous. 我们都非常想你。",
          "Tu nous manqueras à tous quand tu partiras. 你走了，我们都会想你的。",
          "Ça manquait à Tom. 汤姆错过了它。",
          "Je ne manquerai à personne. 不会有人想念我。",
          "La mère a beaucoup manqué à son enfant. 这孩子非常想念他的母亲。"
        ],
        "de": [
          "manquer de qqch 缺乏某物",
          "Je manque d'argent. 我缺钱。",
          "Certains chats manquent de queues. 有没有尾巴的猫。",
          "Notre village ne manque pas d'eau. 我们村不缺水。",
          "Le Japon manque de matières premières. 日本缺乏原材料。",
          "En ce moment, je manque de liquidités. 此刻我缺少现金。",
          "Qui ne gaspille pas ne manque de rien. 不浪费则不匮乏。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "181834",
            "zh": "713080",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335735",
            "zh": "335821",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2307180",
            "zh": "332548",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4395511",
            "zh": "9961268",
            "eng": "4394832"
          },
          {
            "kind": "indirect",
            "fr": "2101914",
            "zh": "13799571",
            "eng": "2091128"
          },
          {
            "kind": "indirect",
            "fr": "7427401",
            "zh": "872131",
            "eng": "245985"
          }
        ],
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "7348",
            "zh": "1862260",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "482315",
            "zh": "805688",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "762423",
            "zh": "762132",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "331058",
            "zh": "408483",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "801380",
            "zh": "801376",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1198740",
            "zh": "718437",
            "eng": ""
          }
        ]
      },
      "notes": {
        "de": "manquer de qqch = 缺乏某物；manquer à qqn = 让某人想念",
        "à": "manquer à qqn = 让某人想念；manquer de = 缺乏"
      }
    },
    "marcher": {
      "display": "marcher",
      "prepositions": {
        "sur": [
          "Marche sur le trottoir. 在人行道上走。",
          "Peux-tu imaginer marcher sur la Lune ? 你可以想象在月球上行走吗？",
          "Ne marchez pas sur les éclats de verre. 不要踩在碎玻璃上。",
          "Une mouche peut marcher sur le plafond. 苍蝇能在天花板上走。",
          "J'ai failli marcher sur une moufette hier soir. 我昨晚差点踩到一只臭鼬。",
          "Je ne suis pas habitué à marcher sur de longues distances. 我走不惯远路。"
        ],
        "dans": [
          "Il aime marcher dans le parc. 他喜欢在公园里走走。",
          "Il marchera dans le parc cet après-midi. 他下午会去公园走一走。",
          "En marchant dans la rue, j'ai rencontré un vieil ami. 我在街上碰见了一个老朋友。",
          "Elle marcha dans les bois. 她在树林里散步。",
          "Ne pas marcher dans l'herbe. 不要踩草地。",
          "Je marche dans la forêt tous les jours. 我每天都去森林散步。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "337853",
            "zh": "345830",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8833",
            "zh": "332556",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9392",
            "zh": "844442",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13072",
            "zh": "798176",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "423340",
            "zh": "423342",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "951675",
            "zh": "1895531",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "132012",
            "zh": "389400",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130848",
            "zh": "663250",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "816305",
            "zh": "385984",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "6153763",
            "zh": "891808",
            "eng": "315167"
          },
          {
            "kind": "indirect",
            "fr": "6477687",
            "zh": "6959856",
            "eng": "265288"
          },
          {
            "kind": "indirect",
            "fr": "14377",
            "zh": "402228",
            "eng": "261845"
          }
        ]
      }
    },
    "marier": {
      "display": "marier",
      "prepositions": {
        "avec": [
          "Il s'est marié avec ma sœur. 他和我妹妹结婚了。",
          "Il s'est marié avec une actrice. 他和一个女演员结婚了。",
          "Il était marié avec une Canadienne. 他和一个加拿大人结了婚。",
          "Je veux me marier avec une fille comme elle. 我想和一个像她那样的女孩结婚。",
          "Il s'est marié avec une jolie fille. 他娶了一个漂亮的女孩。",
          "Je lui ai dit, une fois pour toutes, que je ne me marierai pas avec lui. 我告诉他，我永远不会嫁给他。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "132293",
            "zh": "410877",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "803754",
            "zh": "803826",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14460",
            "zh": "407268",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334193",
            "zh": "334198",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "15358",
            "zh": "833131",
            "eng": "289596"
          },
          {
            "kind": "indirect",
            "fr": "127676",
            "zh": "13524080",
            "eng": "260480"
          }
        ]
      }
    },
    "maîtriser": {
      "display": "maîtriser",
      "prepositions": {
        "en": [
          "Une langue étrangère ne peut être maîtrisée en un an et quelques. 一个外国语言无法在一年左右就被掌握。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "588987",
            "zh": "830457",
            "eng": "21913"
          }
        ]
      }
    },
    "menacer": {
      "display": "menacer",
      "prepositions": {
        "de": [
          "menacer de faire qqch 威胁要做某事",
          "Il menaça de le rendre public. 他威胁要公开。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "816196",
            "zh": "816461",
            "eng": ""
          }
        ]
      }
    },
    "mener": {
      "display": "mener",
      "prepositions": {
        "à": [
          "Sa femme le mène à la baguette. 他对老婆言听计从。",
          "Ces problèmes ne nous mènent à rien. 这些问题对我们毫无效果。",
          "La réponse nous mène à un cercle vicieux. 回答把我们带入了一个恶性循环。",
          "Ça ne mène à rien de se disputer avec lui à ce sujet. 和他争论这件事得不出结果。",
          "Conduire sur une route glissante peut mener à l'accident. 在光滑的路上开车会导致车祸。",
          "Le candidat a-t-il les capacités qui conviennent pour mener à bien le travail ? 那位求职者能胜任工作吗？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1311857",
            "zh": "775891",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335559",
            "zh": "335619",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3969",
            "zh": "503262",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1215499",
            "zh": "1314189",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "815635",
            "zh": "816518",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "492383",
            "zh": "344768",
            "eng": ""
          }
        ]
      }
    },
    "mentir": {
      "display": "mentir",
      "prepositions": {
        "à": [
          "Ne te mens pas à toi-même. 不要欺骗你自己。",
          "Le suspect a menti au commissaire. 那嫌疑犯对侦察官撒了个谎。",
          "Tu peux mentir à tous les autres, mais tu ne peux pas te mentir à toi-même. 你可以向别人撒谎，但你不会向自己撒谎。",
          "Un ambassadeur est un homme honnête envoyé mentir à l'étranger pour le bien de son pays. 大使是为了本国的利益被派去外国撒谎的正直的人。",
          "Tu ne peux pas te mentir à toi-même. 买了东西还说谎，别人不知口袋知。",
          "Veux-tu savoir pourquoi j'ai menti à Tom ? 你想知道为什么我对Tom说话吗？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "806190",
            "zh": "1272224",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1190679",
            "zh": "1223757",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "820457",
            "zh": "7772533",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "393545",
            "zh": "782184",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11243164",
            "zh": "6015731",
            "eng": "11236388"
          },
          {
            "kind": "indirect",
            "fr": "5706342",
            "zh": "4844994",
            "eng": "2025827"
          }
        ]
      }
    },
    "mettre": {
      "display": "mettre",
      "prepositions": {
        "en": [
          "mettre qqch en marche 启动；使运转",
          "Il s'est mis en colère. 他生气了。",
          "Je l'ai mise en colère. 我让她生气了。",
          "Mettons en ordre le bureau. 我们把书桌整理干净吧。",
          "Ce cadre met en valeur la toile. 这个画框能让画升值。",
          "Rien ne le met jamais en colère. 没有什么事曾让他愤怒。",
          "Pourquoi s'est-il mis en colère ? 他为什么生气了呢？"
        ],
        "sur": [
          "Ne le mets pas sur mon bureau. 不要把它放在我的桌子上。",
          "Le vieil homme s'est mis sur son chemin. 这个老人挡了她的路。",
          "Ne mettez rien sur cette boîte, s'il vous plaît. 不要放任何东西在箱子上面。",
          "Dans la discussion, l'accent était mis sur le chômage. 讨论的重点是失业问题。"
        ],
        "dans": [
          "Ne me mettez pas dans la même classe avec eux. 不要把我和他们放在同一班。",
          "Je l'ai mis dans le tiroir. 我把它放在抽屉里。",
          "Tu vas la mettre dans l'embarras. 你会令她害羞。",
          "Je ne veux pas te mettre dans la merde. 我不想给你带来麻烦。",
          "Le garçon rassembla une poignée de cacahuètes et les mit dans une petite boite. 男孩收集了一把花生，然后把它们放到了一个小箱子里。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "507235",
            "zh": "389804",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "532486",
            "zh": "663234",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333514",
            "zh": "333524",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "180254",
            "zh": "4674470",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "993948",
            "zh": "844470",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9052245",
            "zh": "10339534",
            "eng": ""
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "545130",
            "zh": "839533",
            "eng": "25531"
          },
          {
            "kind": "indirect",
            "fr": "7699684",
            "zh": "802544",
            "eng": "43415"
          },
          {
            "kind": "indirect",
            "fr": "5324609",
            "zh": "4816290",
            "eng": "44472"
          },
          {
            "kind": "indirect",
            "fr": "492005",
            "zh": "344245",
            "eng": "280093"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "9722",
            "zh": "423393",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1489720",
            "zh": "795255",
            "eng": "42572"
          },
          {
            "kind": "indirect",
            "fr": "10761116",
            "zh": "8280964",
            "eng": "3918517"
          },
          {
            "kind": "indirect",
            "fr": "497238",
            "zh": "346133",
            "eng": "252875"
          },
          {
            "kind": "indirect",
            "fr": "350210",
            "zh": "691966",
            "eng": "267998"
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "mettre la table 摆餐具；布置餐桌",
          "collocation": "mettre la table",
          "chinese": "摆餐具；布置餐桌",
          "source": "authored"
        },
        {
          "text": "mettre du temps 花费时间",
          "collocation": "mettre du temps",
          "chinese": "花费时间",
          "source": "authored"
        }
      ]
    },
    "monter": {
      "display": "monter",
      "prepositions": {
        "sur": [
          "Elle est montée sur un chameau. 她骑着骆驼。",
          "Si tu veux atteindre le placard du haut tu dois monter sur un tabouret. 站在这个凳子上的话，你可以摸到衣柜顶。"
        ],
        "dans": [
          "monter dans un bus 上（车、飞机）",
          "Montons dans le bus. 上巴士吧。",
          "Monte dans la voiture ! 上车吧！",
          "Elles montèrent dans le train. 她们上了火车。",
          "Le singe est monté dans un arbre. 猴子爬上了树。",
          "Où êtes-vous montées dans ce bus ? 你是从哪里上公交车的？",
          "Nous vîmes l'enfant monter dans le bus. 我们看见孩子上了车。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "4626819",
            "zh": "9462618",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "330821",
            "zh": "1944096",
            "eng": "57645"
          }
        ],
        "dans": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "13089",
            "zh": "9453427",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1849970",
            "zh": "7768011",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1689760",
            "zh": "9179794",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1174133",
            "zh": "1372495",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1348568",
            "zh": "5552144",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334272",
            "zh": "334266",
            "eng": ""
          }
        ]
      }
    },
    "moquer": {
      "display": "moquer",
      "prepositions": {
        "de": [
          "Comment oses-tu te moquer de moi ? 你怎么敢笑我？",
          "Tu ne devrais pas te moquer d'eux. 你别嘲弄他们。",
          "Tout le monde s'était moqué de moi. 大家都嘲笑了我。",
          "Tu ne devrais pas te moquer de Tom. 你不该取笑汤姆。",
          "Nous nous sommes moqués de lui à ce sujet. 我们因为那件事嘲笑他。",
          "Ne vous moquez pas de lui car il a fait une erreur. 不要笑他犯了错误。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "391230",
            "zh": "1021017",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "640075",
            "zh": "1786003",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335331",
            "zh": "335334",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1147333",
            "zh": "10617836",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "716010",
            "zh": "1424223",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1461601",
            "zh": "336508",
            "eng": ""
          }
        ]
      }
    },
    "mordre": {
      "display": "mordre",
      "prepositions": {
        "par": [
          "Je viens de me faire mordre par un moustique. 我刚刚被蚊子咬了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "2369901",
            "zh": "4762200",
            "eng": "2362201"
          }
        ]
      }
    },
    "mourir": {
      "display": "mourir",
      "prepositions": {
        "dans": [
          "Mon grand-père mourut dans la même pièce que celle où il était né. 我祖父死在他出生的同一间屋子里。",
          "Elle est morte dans ses bras. 她死在他的怀里。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "710254",
            "zh": "710337",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3279450",
            "zh": "3784087",
            "eng": "2815084"
          }
        ]
      }
    },
    "mâcher": {
      "display": "mâcher",
      "prepositions": {
        "de": [
          "Je mâche de la gomme. 我嚼口香糖。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "2528463",
            "zh": "9956903",
            "eng": "2528462"
          }
        ]
      }
    },
    "méditer": {
      "display": "méditer",
      "prepositions": {
        "sur": [
          "Il a médité sur sa vie future. 他正在思考他未来的生活。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "6214196",
            "zh": "10713939",
            "eng": "298778"
          }
        ]
      }
    },
    "méfier": {
      "display": "méfier",
      "prepositions": {
        "de": [
          "Je me méfie de lui. 我觉得他有点可疑。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "8742857",
            "zh": "1567827",
            "eng": "283480"
          }
        ]
      }
    },
    "mériter": {
      "display": "mériter",
      "prepositions": {
        "de": [
          "mériter de faire qqch 值得做某事",
          "Il mérite d'être promu. 他应该得到晋升。",
          "Ce film mérite d'être vu. 那部电影值得一看。",
          "À Kyôto, il y a beaucoup de sites qui méritent d'être vus. 在京都，有很多的景点值得一看。",
          "Vous méritez de réussir. 你的成功是应得的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "335919",
            "zh": "335937",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2924444",
            "zh": "2029445",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "783999",
            "zh": "784011",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "482205",
            "zh": "1428113",
            "eng": "17579"
          }
        ]
      }
    },
    "mêler": {
      "display": "mêler",
      "prepositions": {
        "de": [
          "Ne te mêle pas de ses affaires. 别掺和他的事。",
          "Ne te mêle pas de ce qui ne te regarde pas ! 不要干预不关你的事！",
          "Pourquoi t'es-tu mêlé d'une affaire qui ne te regardait pas du tout ? 为什么你要干涉一件跟你完全不相干的事呢？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "882429",
            "zh": "2085114",
            "eng": "285025"
          },
          {
            "kind": "indirect",
            "fr": "428425",
            "zh": "785227",
            "eng": "264623"
          },
          {
            "kind": "indirect",
            "fr": "5067265",
            "zh": "5067357",
            "eng": "5067246"
          }
        ]
      }
    },
    "nager": {
      "display": "nager",
      "prepositions": {
        "dans": [
          "J'aimerais nager dans cette rivière. 我想在这条河里游泳。",
          "J'ai essayé de nager dans la rivière. 我试着在河里游泳。",
          "Il va nager dans le fleuve tous les jours. 他每天去河里游泳。",
          "Il est dangereux de nager dans cette rivière. 在这条河里游泳很危险。",
          "Lorsque j'étais petit, j'allais nager dans l'étang. 我还是个小男孩时常去池塘游泳。",
          "J'allais souvent nager dans la mer quand j'étais enfant. 我小时候经常在海里游泳。"
        ],
        "avec": [
          "Je veux aller nager avec Tom. 我想和汤姆去游泳。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "avec"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "7270",
            "zh": "894183",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "791321",
            "zh": "791373",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133388",
            "zh": "1314413",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "331946",
            "zh": "352038",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "787871",
            "zh": "337473",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8164",
            "zh": "1651504",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "5645601",
            "zh": "10335034",
            "eng": ""
          }
        ]
      }
    },
    "naviguer": {
      "display": "naviguer",
      "prepositions": {
        "sur": [
          "Elle passe carrément trop de temps à naviguer sur le Net. 她花实在太多的时间在网上冲浪。"
        ],
        "dans": [
          "Avez-vous déjà navigué dans un ballon dirigeable ? 您乘过热气球吗？"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "948097",
            "zh": "948096",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "331855",
            "zh": "336097",
            "eng": ""
          }
        ]
      }
    },
    "naître": {
      "display": "naître",
      "prepositions": {
        "en": [
          "Je suis né en 1972. 一九七二年生的。",
          "Il est né en Russie. 他出生在俄罗斯。",
          "Il est né en Afrique. 他出生在非洲。",
          "Je suis née en Russie. 我出生在俄罗斯。",
          "John Lennon est né en 1940. 约翰·列侬是1940年出生的。",
          "Mon grand-père est né en 1920. 我祖父生于1920年。"
        ],
        "dans": [
          "Il est né dans une petite ville de l'Italie. 他出生在一个意大利的小城市。",
          "Abraham Lincoln, le 16e Président des États-Unis, est né dans une cabane au Kentucky. 伯拉罕·林肯，美国第16任总统，生于肯塔基州的一个简陋的小屋里。",
          "Je suis né dans cet hôpital. 我在这家医院出生。",
          "Il est né dans cette même pièce. 他就是在这间屋子里出生的。",
          "Elle est née dans un village reculé du Népal. 她出生于尼泊尔的一个偏远小山村。",
          "Abraham Lincoln, le 16e Président des États-Unis, est né dans une fuste au Kentucky. 美国的第十六任总统亚伯拉罕·林肯是在肯塔基州的一间木屋中出生的。"
        ]
      },
      "prepositionOrder": [
        "en",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "688909",
            "zh": "382982",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12674163",
            "zh": "10495862",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130680",
            "zh": "343370",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1084692",
            "zh": "12686737",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11790",
            "zh": "766045",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7698",
            "zh": "346082",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "130723",
            "zh": "426293",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "791337",
            "zh": "791342",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11154023",
            "zh": "10696064",
            "eng": "6968986"
          },
          {
            "kind": "indirect",
            "fr": "1246494",
            "zh": "1245336",
            "eng": "1246266"
          },
          {
            "kind": "indirect",
            "fr": "1090801",
            "zh": "1891237",
            "eng": "682324"
          },
          {
            "kind": "indirect",
            "fr": "640610",
            "zh": "596684",
            "eng": "241323"
          }
        ]
      }
    },
    "noter": {
      "display": "noter",
      "prepositions": {
        "pour": [
          "Il l'a noté pour ne pas l'oublier. 为了记住那件事，他把它写下来。"
        ],
        "dans": [
          "Il le nota dans son carnet. 他把这记在他的笔记本上。"
        ]
      },
      "prepositionOrder": [
        "pour",
        "dans"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "891437",
            "zh": "1178843",
            "eng": "939127"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "333739",
            "zh": "333745",
            "eng": ""
          }
        ]
      }
    },
    "noyer": {
      "display": "noyer",
      "prepositions": {
        "dans": [
          "On l'a noyée dans la baignoire. 有人把她淹死在浴缸里。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "2979050",
            "zh": "805059",
            "eng": "24545"
          }
        ]
      }
    },
    "nuire": {
      "display": "nuire",
      "prepositions": {
        "à": [
          "nuire à qqn/qqch 损害某人／某物",
          "La grève a nui à l'économie nationale. 罢工妨碍了国家经济。",
          "Cela pourrait nuire à notre entreprise. 这会打击我们的生意。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "571205",
            "zh": "819787",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8406937",
            "zh": "5613631",
            "eng": "4665494"
          }
        ]
      }
    },
    "nécessiter": {
      "display": "nécessiter",
      "prepositions": {
        "de": [
          "Aller à cette école nécessite beaucoup d'argent. 上这所学校需要很多钱。",
          "La vérité nécessite peu de mots. 真理不需要很多的话。",
          "Jouer du piano nécessite de la dextérité manuelle. 弹钢琴需要手指灵活。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "11317",
            "zh": "430982",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "565621",
            "zh": "881851",
            "eng": "269612"
          },
          {
            "kind": "indirect",
            "fr": "12509598",
            "zh": "12487859",
            "eng": "5781623"
          }
        ]
      }
    },
    "obliger": {
      "display": "obliger",
      "prepositions": {
        "à": [
          "obliger qqn à faire qqch 迫使某人做某事",
          "Je l'ai obligé à dire la vérité. 我逼他说出了真相。",
          "Mon père m'a obligé à laver la voiture. 我父亲要我洗车。",
          "On m'a obligé à aller travailler le dimanche. 我被迫在星期天上班。"
        ],
        "de": [
          "Suis-je obligé d'être hospitalisé ? 我必须住院吗?",
          "J'ai été obligé de signer le papier. 我被迫签了那张纸。",
          "Suis-je obligé de faire un discours ? 我必须发表一段演讲吗？",
          "J'ai été obligée d'étudier l'espagnol. 我被迫学了西班牙语。",
          "Tu n'es pas obligé de quitter ton travail. 你没必要辞掉工作。",
          "Tu n'es pas obligée de rester à l'hôpital. 你不必要呆在医院。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "472736",
            "zh": "472798",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "580185",
            "zh": "891054",
            "eng": "319202"
          },
          {
            "kind": "indirect",
            "fr": "9766185",
            "zh": "1205938",
            "eng": "7787220"
          }
        ],
        "de": [
          {
            "kind": "direct",
            "fr": "1403650",
            "zh": "1344764",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7535",
            "zh": "429076",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8080",
            "zh": "346774",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "797822",
            "zh": "799284",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "181807",
            "zh": "530700",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1053332",
            "zh": "1314453",
            "eng": ""
          }
        ]
      }
    },
    "obséder": {
      "display": "obséder",
      "prepositions": {
        "par": [
          "Je suis obsédée par le français ces derniers temps. 我最近着迷于法语。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "1474148",
            "zh": "1474146",
            "eng": ""
          }
        ]
      }
    },
    "obtenir": {
      "display": "obtenir",
      "prepositions": {
        "de": [
          "Elle obtient de bonnes notes en anglais. 她取得了优异的英语成绩。",
          "Les lions se sont battus entre eux pour obtenir de la nourriture. 狮子为了得到食物相互争斗。",
          "Il n'a pas obtenu de permis de conduire avant d'avoir vingt-huit ans. 他二十八岁才拿到驾照。",
          "Il se tourna vers ses amis pour obtenir de l'aide. 他寻求他的朋友的帮助。",
          "Si on mélange du bleu et du rouge, on obtient du violet. 如果将蓝色和红色混合，就会得到紫色。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "805022",
            "zh": "804998",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335430",
            "zh": "335493",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "838517",
            "zh": "838510",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1359166",
            "zh": "842306",
            "eng": "304376"
          },
          {
            "kind": "indirect",
            "fr": "2382243",
            "zh": "13539424",
            "eng": "2380300"
          }
        ]
      }
    },
    "obéir": {
      "display": "obéir",
      "prepositions": {
        "à": [
          "obéir à qqn 服从某人",
          "Le lion obéit au dompteur. 狮子听从驯兽师的指挥。",
          "Obéir à la loi est notre devoir. 遵守法律是我们的义务。",
          "Nous nous devons d'obéir à la loi. 我们必须遵纪守法。",
          "Il nous appela à obéir à la règle. 他要求我们服从规则。",
          "Nous devons toujours obéir aux lois. 我们总要遵守法律。",
          "Obéir à la loi est le devoir de chacun. 遵守法律是每个人的责任。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1484411",
            "zh": "2626332",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1021002",
            "zh": "775461",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "792498",
            "zh": "792784",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "844716",
            "zh": "845111",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "390032",
            "zh": "1438614",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2714181",
            "zh": "1019295",
            "eng": ""
          }
        ]
      }
    },
    "occasionner": {
      "display": "occasionner",
      "prepositions": {
        "de": [
          "La tempête occasionna beaucoup de dommage. 暴风雨造成了很大的损害。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "998638",
            "zh": "903315",
            "eng": "325297"
          }
        ]
      }
    },
    "occuper": {
      "display": "occuper",
      "prepositions": {
        "pour": [
          "Je suis occupé pour le moment. 我现在忙着呢。",
          "Je suis trop occupé pour l'aider. 我太忙了，无法帮助他。",
          "Elle est occupée pour l'instant et ne peut vous parler. 她现在忙，没有办法跟你们说话。",
          "Je suis occupé pour l'instant. 我现在很忙。",
          "Je suis trop occupé pour y aller. 我太忙了不能去。",
          "Je suis désolé, je suis occupé pour l'instant. 抱歉，我现在很忙。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "355650",
            "zh": "363982",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6984",
            "zh": "795863",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "499573",
            "zh": "1923114",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "961018",
            "zh": "459759",
            "eng": "755276"
          },
          {
            "kind": "indirect",
            "fr": "433230",
            "zh": "769697",
            "eng": "438382"
          },
          {
            "kind": "indirect",
            "fr": "1348165",
            "zh": "2307742",
            "eng": "51478"
          }
        ]
      }
    },
    "offrir": {
      "display": "offrir",
      "prepositions": {
        "à": [
          "Que voulez-vous offrir à Tom pour Noël ? 你们想送汤姆什么圣诞礼物？",
          "On offrit à l'actrice un bouquet de fleurs après la représentation. 演出后，女演员收到了一束花。",
          "J'offris un tambourin à mon père. 我送了个长鼓给我父亲。",
          "Il n'arrête pas d'offrir des cadeaux à sa femme. 他一直会给他妻子送礼物。",
          "Je lui ai offert un briquet à double flamme que j'ai acheté aux États-Unis. 我送了他一个在美国买的双火焰的打火机。",
          "Tom offrit à Marie une boîte de chocolats, puis mangea tous les chocolats lui-même. 汤姆给了玛丽一盒巧克力，然后自己把全部巧克力都吃掉了。"
        ],
        "de": [
          "offrir de faire qqch 主动提出做某事",
          "Ils nous ont offert du café. 他们送了咖啡给我们。",
          "J'ai reçu une bonne offre d'emploi. 我得到了一个好的工作机会。",
          "La Suisse offre de nombreuses curiosités. 瑞士有很多景点。",
          "L'offre d'emploi tient toujours. 这份工作录取仍然有效。",
          "Chérie, offre du café aux invités. 亲爱的，给客人端点咖啡吧。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "9520763",
            "zh": "10695943",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12167",
            "zh": "345916",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "804734",
            "zh": "804808",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "535801",
            "zh": "5856905",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "744765",
            "zh": "744782",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "6564082",
            "zh": "10086137",
            "eng": "6563577"
          }
        ],
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "799108",
            "zh": "799212",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "479650",
            "zh": "1325289",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "450851",
            "zh": "9012245",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8106530",
            "zh": "793944",
            "eng": "68356"
          },
          {
            "kind": "indirect",
            "fr": "1023073",
            "zh": "4265178",
            "eng": "4770642"
          }
        ]
      }
    },
    "omettre": {
      "display": "omettre",
      "prepositions": {
        "de": [
          "Je suis désolée, j'ai omis de faire mes devoirs. 对不起，我忘了作业这回事了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "10308616",
            "zh": "5100272",
            "eng": "509618"
          }
        ]
      }
    },
    "opiner": {
      "display": "opiner",
      "prepositions": {
        "de": [
          "Il opina de manière encourageante. 他点头以示鼓励。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "2343721",
            "zh": "10099050",
            "eng": "2237843"
          }
        ]
      }
    },
    "opposer": {
      "display": "opposer",
      "prepositions": {
        "à": [
          "Je ne pourrais sûrement pas non plus m'opposer à lui. 我也许不会反对他去。",
          "Je m'opposai à ce qu'il paie la note. 我反对他付账单。",
          "Je m'oppose à ce qu'elle y aille seule. 我不同意她一个人去那儿。",
          "Je ne m'oppose pas à ce que tu ailles travailler à l'extérieur, mais qui s'occupera des enfants ? 我并不反对你出去工作，可是小孩靠谁来照看呢？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "691662",
            "zh": "419938",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1720013",
            "zh": "892448",
            "eng": "252317"
          },
          {
            "kind": "indirect",
            "fr": "968296",
            "zh": "333922",
            "eng": "261007"
          },
          {
            "kind": "indirect",
            "fr": "564128",
            "zh": "347730",
            "eng": "17774"
          }
        ]
      }
    },
    "opter": {
      "display": "opter",
      "prepositions": {
        "pour": [
          "opter pour qqch 选择某物",
          "Il y a beaucoup de monde, aussi, aujourd'hui, nous avons opté pour la formule buffet. 因为人很多，今天我们会采取自助餐的形式。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "459680",
            "zh": "8692921",
            "eng": "327744"
          }
        ]
      }
    },
    "ordonner": {
      "display": "ordonner",
      "prepositions": {
        "de": [
          "Son docteur lui ordonna de se reposer. 他的医生命令他休息。",
          "Le policier leur a ordonné de s'arrêter. 警察命令他们停手。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "333521",
            "zh": "333530",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799185",
            "zh": "799186",
            "eng": ""
          }
        ]
      }
    },
    "organiser": {
      "display": "organiser",
      "prepositions": {
        "pour": [
          "Qu'as-tu organisé pour demain ? 你明天有什么安排啦？"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "578570",
            "zh": "578567",
            "eng": ""
          }
        ]
      }
    },
    "oublier": {
      "display": "oublier",
      "prepositions": {
        "de": [
          "oublier de faire qqch 忘记做某事",
          "N'oublie pas de m'écrire. 别忘了写信给我。",
          "N'oublie pas de m'appeler. 不要忘了给我打电话。",
          "J'oublie de lui téléphoner. 我忘了打电话给他。",
          "J'ai oublié de quoi il s'agit. 我忘了这是什么。",
          "J'ai oublié de poster la lettre. 我忘了寄信。",
          "N'oublie pas de poster la lettre. 别忘了寄信。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "180935",
            "zh": "345874",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "343171",
            "zh": "343301",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "495932",
            "zh": "345752",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "909134",
            "zh": "823030",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "822857",
            "zh": "3283111",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "128322",
            "zh": "345845",
            "eng": ""
          }
        ]
      }
    },
    "ouvrir": {
      "display": "ouvrir",
      "prepositions": {
        "pour": [
          "L'exposition sera ouverte pour encore un mois. 展览会将在另一个月召开。",
          "S'il vous plaît, quand la boîte aux lettres a-t-elle été ouverte pour la dernière fois ? 请问最后一次开信箱在什么时间？"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "120110",
            "zh": "389836",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "822102",
            "zh": "420548",
            "eng": ""
          }
        ]
      }
    },
    "paralyser": {
      "display": "paralyser",
      "prepositions": {
        "par": [
          "L'enfant était paralysé par la peur. 那个孩子被吓得一动也不能动。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "11225389",
            "zh": "1882128",
            "eng": "47395"
          }
        ]
      }
    },
    "pardonner": {
      "display": "pardonner",
      "prepositions": {
        "à": [
          "pardonner à qqn 原谅某人",
          "Tom n'a pardonné à personne. 汤姆没原谅过任何人。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "5739421",
            "zh": "5739296",
            "eng": "5739198"
          }
        ]
      }
    },
    "parler": {
      "display": "parler",
      "prepositions": {
        "de": [
          "parler de qqch 谈论某事",
          "Je parle d'eux. 我说的是他们。",
          "J'ai parlé de musique. 我说的是音乐。",
          "Ils parlent de musique. 他们在谈音乐。",
          "Est-ce que tu parles de moi ? 你在说我吗？",
          "Elle parlait d'une voix faible. 她用微弱的声音说着。",
          "Tu voulais me parler de liberté ? 你是想跟我谈自由吗？"
        ],
        "avec": [
          "Parle avec moi. 跟我说。",
          "Je parle avec qui ? 我正在跟谁讲话？",
          "Tom a parlé avec Mary hier. 汤姆昨天和玛丽说话了。",
          "Je parlerai avec toi demain. 我明天要和你谈谈。",
          "C'était agréable de parler avec elle. 和她交谈很愉快。",
          "Elle commença à parler avec un étranger. 她开始和一个陌生人交谈。"
        ]
      },
      "prepositionOrder": [
        "de",
        "avec"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "10574742",
            "zh": "10737179",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6763",
            "zh": "444648",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "808123",
            "zh": "808217",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "376667",
            "zh": "337972",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134452",
            "zh": "345970",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3226",
            "zh": "501405",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "1502913",
            "zh": "759647",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3647",
            "zh": "353485",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4022046",
            "zh": "9953344",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "430372",
            "zh": "663248",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "438912",
            "zh": "817637",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1155967",
            "zh": "2357614",
            "eng": ""
          }
        ]
      },
      "notes": {
        "de": "parler de qqch = 谈论某事；parler à qqn = 对某人说"
      }
    },
    "parsemer": {
      "display": "parsemer",
      "prepositions": {
        "de": [
          "Le jardin est parsemé de fleurs magnifiques. 花园里散落着美丽的花朵。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "11619837",
            "zh": "13561227",
            "eng": "3618400"
          }
        ]
      }
    },
    "partager": {
      "display": "partager",
      "prepositions": {
        "avec": [
          "Partage avec ton frère ! 跟你兄弟分享。",
          "Je veux le partager avec toi. 我想跟你分享。"
        ],
        "entre": [
          "partager qqch entre plusieurs personnes 在几个人之间分配某物"
        ]
      },
      "prepositionOrder": [
        "avec",
        "entre"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "6600621",
            "zh": "10696127",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2470635",
            "zh": "8918149",
            "eng": ""
          }
        ],
        "entre": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "participer": {
      "display": "participer",
      "prepositions": {
        "à": [
          "participer à qqch 参加某事",
          "Nous participerons au marathon. 我们将参加马拉松。",
          "Je n'ai pas participé à la conversation. 我没有参与对话。",
          "Je ne veux pas participer à la cérémonie. 我不想参加典礼。",
          "Prévoyez-vous de participer à la réunion ? 你们准备参加会议吗？",
          "Avez-vous prévu de participer à la réunion ? 你们说了要参加会议了吗？",
          "Je suis sûr qu'il va participer à la compétition. 他会参加比赛吧。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3472661",
            "zh": "2085112",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "461802",
            "zh": "462046",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7142",
            "zh": "400984",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "478679",
            "zh": "819749",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10347",
            "zh": "676558",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "236568",
            "zh": "340081",
            "eng": ""
          }
        ]
      }
    },
    "partir": {
      "display": "partir",
      "prepositions": {
        "en": [
          "partir en vacances 去度假；出发去",
          "Ils partirent en pique-nique. 他们出发去野餐了。",
          "J'ai hâte de partir en voyage. 我很期待去旅游.",
          "Partons en voyage à New York ! 去纽约旅行吧！",
          "Le voleur est parti en courant. 小偷跑了。",
          "J'ai hâte de partir en vacances. 我等不及要去度假。",
          "Aimerais-tu partir en promenade ? 你要出去散步吗？"
        ],
        "pour": [
          "partir pour un lieu 动身去某地",
          "Je prends parti pour vous. 我支持你们。",
          "Il est parti pour Londres. 他去了伦敦。",
          "Il est parti pour le Canada hier. 他昨天出发去加拿大了。",
          "Il partit pour Londres avant-hier. 他前天去伦敦。",
          "Ça ne vaut pas le coup de partir pour deux jours. 不值得去两天。",
          "Mon fils va partir pour la France la semaine prochaine. 我儿子下周要去法国了。"
        ]
      },
      "prepositionOrder": [
        "en",
        "pour"
      ],
      "sources": {
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "504435",
            "zh": "796913",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "180704",
            "zh": "180705",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "811429",
            "zh": "812239",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "332119",
            "zh": "9963109",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3941",
            "zh": "503237",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3325462",
            "zh": "9453423",
            "eng": ""
          }
        ],
        "pour": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "332086",
            "zh": "389445",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1805167",
            "zh": "2030748",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "390348",
            "zh": "414620",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "415683",
            "zh": "2889963",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "846257",
            "zh": "846504",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7687",
            "zh": "787593",
            "eng": ""
          }
        ]
      }
    },
    "parvenir": {
      "display": "parvenir",
      "prepositions": {
        "à": [
          "parvenir à faire qqch 终于做到某事",
          "Je parviens à le voir dans vos yeux. 我能从你的眼里看到。",
          "Finalement nous sommes parvenus à un compromis. 最后我们达成了协议。",
          "À la longue, il parvint à comprendre la théorie. 最后，他终于明白了那个理论。",
          "Je ne parviens pas à me rappeler quand était la dernière fois que je l'ai vu sourire. 我想不起来我什么时候最后一次看见他笑。",
          "Je parviens à le ressentir. 我感觉得到它。",
          "Je parviens à voir la lumière. 我能看到光线。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1112243",
            "zh": "1323780",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "818270",
            "zh": "779535",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "131187",
            "zh": "335109",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3640538",
            "zh": "13004964",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1842781",
            "zh": "10699360",
            "eng": "1841705"
          },
          {
            "kind": "indirect",
            "fr": "3659663",
            "zh": "833079",
            "eng": "323700"
          }
        ]
      }
    },
    "passer": {
      "display": "passer",
      "prepositions": {
        "par": [
          "passer par qqch 经过某处；经历某事",
          "Nous sommes déjà passés par ici. 这里我们以前来过。",
          "Le car de touristes est passé par un long tunnel. 观光巴士穿过了一条长长的隧道。",
          "Notre balle passa par-dessus la barrière et atterrit sur le chantier. 我们的球越过了栅栏，掉到了工地里。"
        ],
        "pour": [
          "passer pour qqn 被当作某种人",
          "Il passe pour le meilleur avocat de cette ville. 他被认为是这座城市里最好的律师。"
        ],
        "chez": [
          "passer chez qqn 顺路去某人家",
          "Passons chez lui. 我们去拜访他吧。"
        ]
      },
      "prepositionOrder": [
        "par",
        "pour",
        "chez"
      ],
      "sources": {
        "par": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "1704328",
            "zh": "9012155",
            "eng": "1702602"
          },
          {
            "kind": "indirect",
            "fr": "1224910",
            "zh": "729492",
            "eng": "20929"
          },
          {
            "kind": "indirect",
            "fr": "10526192",
            "zh": "10530870",
            "eng": "10472682"
          }
        ],
        "pour": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1214617",
            "zh": "9961562",
            "eng": ""
          }
        ],
        "chez": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "474003",
            "zh": "759172",
            "eng": "466045"
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "passer un examen 参加考试（≠ 通过）",
          "collocation": "passer un examen",
          "chinese": "参加考试（≠ 通过）",
          "source": "authored"
        },
        {
          "text": "passer du temps 花时间",
          "collocation": "passer du temps",
          "chinese": "花时间",
          "source": "authored"
        }
      ]
    },
    "patiner": {
      "display": "patiner",
      "prepositions": {
        "sur": [
          "Est-ce sans risque de patiner sur ce lac ? 在这个湖上滑冰安全吗？"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "4655898",
            "zh": "4645581",
            "eng": "4622705"
          }
        ]
      }
    },
    "payer": {
      "display": "payer",
      "prepositions": {
        "pour": [
          "Où dois-je payer pour le gaz ? 我该在哪儿付煤气费？",
          "Combien as-tu payé pour cet ordinateur ? 这台电脑你用多少钱买的？",
          "À peu près combien devrai-je payer pour tous les traitements ? 所有的医药费我大概要付多少？",
          "Elle paiera pour ça. 这债她早晚要还的。",
          "As-tu payé pour le livre ? 你付钱买这本书了吗?",
          "Es-tu payée pour faire ça ? 是有人花钱让你做这事吗？"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "781408",
            "zh": "784535",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10356",
            "zh": "375376",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "483913",
            "zh": "333845",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1902705",
            "zh": "13892004",
            "eng": "1894132"
          },
          {
            "kind": "indirect",
            "fr": "961108",
            "zh": "842301",
            "eng": "237586"
          },
          {
            "kind": "indirect",
            "fr": "7853327",
            "zh": "5715194",
            "eng": "2641981"
          }
        ]
      }
    },
    "paître": {
      "display": "paître",
      "prepositions": {
        "dans": [
          "Les vaches paissent dans le pré. 牛在牧地上吃草。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "9243",
            "zh": "2511454",
            "eng": "19510"
          }
        ]
      }
    },
    "peindre": {
      "display": "peindre",
      "prepositions": {
        "par": [
          "Ces tableaux ont été peints par lui. 那些图画是他画的。",
          "La barrière sera peinte par Tom demain. Tom明天将漆栅栏。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "2009724",
            "zh": "886584",
            "eng": "42007"
          },
          {
            "kind": "indirect",
            "fr": "1170537",
            "zh": "864421",
            "eng": "44091"
          }
        ]
      }
    },
    "penser": {
      "display": "penser",
      "prepositions": {
        "à": [
          "penser à qqn/qqch 想念某人；想着某事",
          "Je pense à toi. 我想你。",
          "Je ne peux pas penser à tout. 我不可能全都想到。",
          "Je pense tout à fait comme vous. 我和您想得完全一样。",
          "Tu as l'air de penser à autre chose. 你像是在想其他事情。",
          "Soudain, j'ai pensé à ma mère décédée. 我忽然想起了我死去的妈妈。",
          "Quand je le vois, je pense à mon grand-père. 当我看到他的时候，我想到了我的祖父。"
        ],
        "de": [
          "penser de qqch 对某事的看法，多用于疑问句 Que pensez-vous de …",
          "Un vrai scientifique ne penserait pas de cette manière. 一个正确的科学家不会那样想。",
          "Je sais que tu penses beaucoup de bien de lui. 我知道你对他评价很高。",
          "Je me fiche de ce que les gens pensent de ma façon de m'habiller. 我不在乎别人怎么看我的打扮。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "332309",
            "zh": "813490",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "181182",
            "zh": "429274",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "815222",
            "zh": "815292",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335974",
            "zh": "336033",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "127543",
            "zh": "343382",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "472244",
            "zh": "472838",
            "eng": ""
          }
        ],
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "135252",
            "zh": "9956621",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12907307",
            "zh": "5701329",
            "eng": "3911651"
          },
          {
            "kind": "indirect",
            "fr": "7028815",
            "zh": "506877",
            "eng": "258319"
          }
        ]
      },
      "notes": {
        "de": "penser de qqch = 对某事的看法（多用于疑问句 Que penses-tu de… ?）",
        "à": "penser à = 想着（对象）；penser de = 对…的看法"
      }
    },
    "percuter": {
      "display": "percuter",
      "prepositions": {
        "par": [
          "J'ai vu un homme se faire percuter par une voiture. 我看到有个男人被车撞了。",
          "Il a été percuté par une voiture et est mort sur le coup. 他被车撞了之后便过世了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "8894230",
            "zh": "5780514",
            "eng": "3527301"
          },
          {
            "kind": "indirect",
            "fr": "679032",
            "zh": "1304158",
            "eng": "678806"
          }
        ]
      }
    },
    "perdre": {
      "display": "perdre",
      "prepositions": {
        "dans": [
          "Je l'ai perdu dans la foule. 我在人群中和他走失了。",
          "Le prince était perdu dans les bois. 王子在森林中迷了路。",
          "Une fois, je me suis perdu dans un arbre. 有一次，我在树里迷路了。",
          "Si tu te perds dans une rue, demande à un policier. 如果你迷路了，请向警察询问。",
          "Il s'est perdu dans les bois. 他在森林中迷了路。",
          "On s'est perdu dans les bois. 我们在树林中迷路了。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "6284",
            "zh": "343711",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "499435",
            "zh": "346894",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "553830",
            "zh": "553827",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "565861",
            "zh": "5909520",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "132677",
            "zh": "332770",
            "eng": "269482"
          },
          {
            "kind": "indirect",
            "fr": "8349667",
            "zh": "552096",
            "eng": "4011886"
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "perdre du temps 浪费时间",
          "collocation": "perdre du temps",
          "chinese": "浪费时间",
          "source": "authored"
        },
        {
          "text": "perdre patience 失去耐心",
          "collocation": "perdre patience",
          "chinese": "失去耐心",
          "source": "authored"
        }
      ]
    },
    "permettre": {
      "display": "permettre",
      "prepositions": {
        "de": [
          "permettre à qqn de faire qqch 允许某人做某事",
          "Elle lui permit d'y aller seul. 她允许他一个人去。",
          "Je ne peux pas vous permettre de faire cela. 我不允许你那样做。",
          "Je ne pouvais pas me permettre d'acheter un vélo. 我买不起自行车。",
          "Avoir bonne conscience permet de dormir tranquille. 问心无愧是一个非常柔软的枕头。",
          "J'espère que tes parents nous permettront de nous marier. 希望你父母会让我们结婚吧。",
          "Ce diplôme vous permet d'avoir accès à la carrière d'ingénieur. 这文凭能让你获得工程师的职位。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "13974",
            "zh": "636223",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9074",
            "zh": "452635",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "808116",
            "zh": "408812",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "876299",
            "zh": "876218",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "614490",
            "zh": "393386",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6142480",
            "zh": "6164397",
            "eng": ""
          }
        ]
      }
    },
    "persuader": {
      "display": "persuader",
      "prepositions": {
        "de": [
          "Le médecin l'a persuadé d'arrêter de fumer. 医生说服了他戒烟。",
          "Elle a tenté de le persuader de se rendre à la réunion. 她试图说服他来参加会议。",
          "J'ai eu des difficultés à essayer de le persuader d'annuler le voyage. 说服他中止旅行真是件苦差事。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "533514",
            "zh": "1314169",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1390378",
            "zh": "9972418",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1680960",
            "zh": "2029323",
            "eng": "402792"
          }
        ]
      }
    },
    "peser": {
      "display": "peser",
      "prepositions": {
        "sur": [
          "Je me suis pesé sur la balance de la salle de bain. 我用浴室的体重计量了体重。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "1130358",
            "zh": "8730060",
            "eng": "324956"
          }
        ]
      }
    },
    "peupler": {
      "display": "peupler",
      "prepositions": {
        "de": [
          "Je voyageais à travers les villages et les champs peuplés de cigales et inondés de rayons de soleil. 游荡在知了和阳光充斥的村舍田野"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "13376567",
            "zh": "13376566",
            "eng": ""
          }
        ]
      }
    },
    "piquer": {
      "display": "piquer",
      "prepositions": {
        "par": [
          "J'ai été piqué par une abeille. 我被蜜蜂蛰了一下。",
          "J'ai été piqué par des moustiques. 我被蚊子咬的。",
          "J'ai été piqué par un moustique. 我被蚊子叮了。",
          "Je viens de me faire piquer par une abeille. 我刚给蜜蜂蛰了。",
          "J'ai été massivement piqué par les moustiques. 我被很多的蚊子叮了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "334133",
            "zh": "334139",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6719",
            "zh": "1102424",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "541688",
            "zh": "4760169",
            "eng": "4794027"
          },
          {
            "kind": "indirect",
            "fr": "12607566",
            "zh": "13887430",
            "eng": "12579614"
          },
          {
            "kind": "indirect",
            "fr": "930714",
            "zh": "804604",
            "eng": "23594"
          }
        ]
      }
    },
    "placer": {
      "display": "placer",
      "prepositions": {
        "en": [
          "L'homme a été placé en garde à vue. 这个男人被警察拘留了。"
        ],
        "sur": [
          "Ne placez rien sur cette boîte, s'il vous plaît. 不要放任何东西在箱子上面。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "11231321",
            "zh": "895602",
            "eng": "45325"
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "5324610",
            "zh": "4816290",
            "eng": "44472"
          }
        ]
      }
    },
    "plaire": {
      "display": "plaire",
      "prepositions": {
        "à": [
          "plaire à qqn 讨某人喜欢",
          "Cette chanson plaît aux personnes de tous âges. 这首歌老少皆宜。",
          "La guerre plaît seulement à ceux qui ne l'ont pas vu. 只有没目睹那场战争的人才喜欢它。",
          "Un bon fils est toujours soucieux de plaire à ses parents. 好孩子总想让他的父母满意。",
          "S'il te plaît à l'avenir ne parle plus anglais devant moi, d'accord ? 请你以后不要在我面前说英文了，OK?",
          "Je ne plais pas à Tom. 汤姆不喜欢我。",
          "Le football ne plaît pas à mon père. 我爸爸不喜欢足球。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "14590",
            "zh": "347074",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1666413",
            "zh": "12438609",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333890",
            "zh": "333910",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1085043",
            "zh": "838425",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2089649",
            "zh": "1438558",
            "eng": "1026036"
          },
          {
            "kind": "indirect",
            "fr": "429280",
            "zh": "333380",
            "eng": "430198"
          }
        ]
      }
    },
    "pleurer": {
      "display": "pleurer",
      "prepositions": {
        "en": [
          "Elle pleura en lisant la lettre. 她流泪看着信。",
          "Elle a pleuré en lisant la carte. 她一边读这封信一边哭。",
          "Nous avons tous pleuré en regardant le film. 我们看电影时都哭了。"
        ],
        "sur": [
          "Il ne sert à rien de pleurer sur le lait versé. 为溅出的牛奶哭也没用。",
          "Il ne sert à rien de pleurer sur le lait renversé. 为打翻的牛奶而哭泣是没用的。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "337032",
            "zh": "336910",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "486828",
            "zh": "891738",
            "eng": "388697"
          },
          {
            "kind": "indirect",
            "fr": "3430267",
            "zh": "6103096",
            "eng": "3424496"
          }
        ],
        "sur": [
          {
            "kind": "direct",
            "fr": "400502",
            "zh": "765989",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "937355",
            "zh": "806253",
            "eng": "51897"
          }
        ]
      }
    },
    "pleuvoir": {
      "display": "pleuvoir",
      "prepositions": {
        "à": [
          "Il pleut à verse. 天下着倾盆大雨。",
          "Il a plu à tout le monde. 大家都喜欢他。",
          "Il est probable qu'il pleuve à nouveau. 很有可能还会下雨。",
          "Il pleut à seaux. 雨下得很大。",
          "Il a plu à Séville. 塞维利亚下了大雨。"
        ],
        "en": [
          "Il pleut beaucoup en juin au Japon. 在日本，6月的时候会下很多雨。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "384565",
            "zh": "411642",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1505412",
            "zh": "683635",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1328026",
            "zh": "1361959",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "827317",
            "zh": "9992078",
            "eng": "384559"
          },
          {
            "kind": "indirect",
            "fr": "9991278",
            "zh": "5919369",
            "eng": "5920122"
          }
        ],
        "en": [
          {
            "kind": "indirect",
            "fr": "1354309",
            "zh": "8775799",
            "eng": "281199"
          }
        ]
      }
    },
    "plonger": {
      "display": "plonger",
      "prepositions": {
        "dans": [
          "plonger dans qqch 潜入；沉浸于",
          "Il plongea dans l'eau et remonta pour respirer. 他潜进水里，然后又浮上水来换气。",
          "Nous avons trouvé ce garçon plongé dans un sommeil profond. 我们发现这个男孩睡得很沉。",
          "Je plongeai dans le fleuve. 我跳进了河里。",
          "Elle plongea dans la piscine. 她跳入了游泳池。",
          "Il est plongé dans les cours de latin. 他专心致志地学习拉丁语。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1182178",
            "zh": "1254558",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "893444",
            "zh": "805573",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "557992",
            "zh": "5931781",
            "eng": "475953"
          },
          {
            "kind": "indirect",
            "fr": "1135587",
            "zh": "858943",
            "eng": "312089"
          },
          {
            "kind": "indirect",
            "fr": "4096740",
            "zh": "1964244",
            "eng": "293342"
          }
        ]
      }
    },
    "poignarder": {
      "display": "poignarder",
      "prepositions": {
        "dans": [
          "Elle l'a poignardé dans le dos. 她在他的背上戳了一下。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "1341659",
            "zh": "4760174",
            "eng": ""
          }
        ]
      }
    },
    "polir": {
      "display": "polir",
      "prepositions": {
        "avec": [
          "Il n'est pas nécessaire d'être poli avec ce genre de personne. 对这种人，用不着客气。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "2201246",
            "zh": "1750557",
            "eng": ""
          }
        ]
      }
    },
    "polluer": {
      "display": "polluer",
      "prepositions": {
        "par": [
          "L'air était pollué par les gaz d'échappement. 空气被废气污染了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "534215",
            "zh": "1692103",
            "eng": "275646"
          }
        ]
      }
    },
    "porter": {
      "display": "porter",
      "prepositions": {
        "sur": [
          "porter sur qqch 涉及某事"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "poser": {
      "display": "poser",
      "prepositions": {
        "à": [
          "poser une question à qqn 向某人提问",
          "Tu pourras me poser au bureau mercredi ? 周三你可以载我到办公室吗？",
          "Il a une libellule posée au plafond. 天花板上有一只蜻蜓。",
          "On posa à chaque élève une question. 每个学生都被问了一个问题。"
        ],
        "pour": [
          "poser pour un photographe 为摄影师摆姿势"
        ],
        "sur": [
          "poser qqch sur la table 把某物放在桌上"
        ]
      },
      "prepositionOrder": [
        "à",
        "pour",
        "sur"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "640130",
            "zh": "2368463",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "139577",
            "zh": "616484",
            "eng": "278780"
          },
          {
            "kind": "indirect",
            "fr": "1450074",
            "zh": "1912189",
            "eng": "1449853"
          }
        ],
        "pour": [
          {
            "kind": "curated",
            "authored": true
          }
        ],
        "sur": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "poser une question 提问",
          "collocation": "poser une question",
          "chinese": "提问",
          "source": "authored"
        },
        {
          "text": "poser un problème 带来问题",
          "collocation": "poser un problème",
          "chinese": "带来问题",
          "source": "authored"
        }
      ]
    },
    "posséder": {
      "display": "posséder",
      "prepositions": {
        "de": [
          "Il possède de nombreux livres d'Histoire. 他有很多历史书籍。",
          "Je ne possède pas de chat. 我没有猫。",
          "Il possède beaucoup d'argent. 他有很多钱。",
          "Je ne possède pas de guitare. 我没有吉他。",
          "Je ne possède pas de lecteur de CDs, mais j'ai néanmoins acheté le CD. 我没有 CD 播放机，但还是把唱片买下来了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "426237",
            "zh": "332663",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "964861",
            "zh": "407226",
            "eng": "881861"
          },
          {
            "kind": "indirect",
            "fr": "131146",
            "zh": "480581",
            "eng": "480576"
          },
          {
            "kind": "indirect",
            "fr": "2509157",
            "zh": "4761857",
            "eng": "2276161"
          },
          {
            "kind": "indirect",
            "fr": "820404",
            "zh": "363581",
            "eng": "252636"
          }
        ]
      }
    },
    "postuler": {
      "display": "postuler",
      "prepositions": {
        "pour": [
          "Tu devrais postuler pour cet emploi. 你该申请这份工作。",
          "Tom a postulé pour cet emploi. 汤姆申请了这份工作。",
          "J'ai postulé pour un stage d'été. 我应征了一个暑期实习。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "474829",
            "zh": "476583",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1704656",
            "zh": "840663",
            "eng": "37258"
          },
          {
            "kind": "indirect",
            "fr": "12818936",
            "zh": "718377",
            "eng": "718376"
          }
        ]
      }
    },
    "poursuivre": {
      "display": "poursuivre",
      "prepositions": {
        "en": [
          "Je te poursuivrai en justice. 我要控告你。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "536389",
            "zh": "793531",
            "eng": "64269"
          }
        ]
      }
    },
    "pousser": {
      "display": "pousser",
      "prepositions": {
        "sur": [
          "Rien ne semble pousser sur ce sol. 这个土壤似乎长不出任何东西来。",
          "Les pommes poussent sur des arbres. 苹果长在树上。",
          "L'argent ne pousse pas sur les arbres. 钱不会从树上长出来。",
          "L'herbe ne pousse pas sur les sentiers battus. 滚石不生苔。"
        ],
        "dans": [
          "Il l'a poussée dans la piscine. 他把她推到了泳池里。",
          "Du bambou pousse dans le jardin. 花园里有竹子在生长。",
          "Le riz pousse dans les climats chauds. 水稻生长在温暖的气候。",
          "Des mauvaises herbes ont poussé dans le jardin. 花园里杂草丛生。",
          "Elle l'a poussé dans la piscine. 她把他推到游泳池里去了。",
          "Le riz pousse dans des pays chauds. 稻米生长在温暖的国家。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "140110",
            "zh": "891120",
            "eng": "57684"
          },
          {
            "kind": "indirect",
            "fr": "3645807",
            "zh": "13167250",
            "eng": "29615"
          },
          {
            "kind": "indirect",
            "fr": "9134",
            "zh": "806228",
            "eng": "18574"
          },
          {
            "kind": "indirect",
            "fr": "827393",
            "zh": "5617157",
            "eng": "279026"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "1664332",
            "zh": "10336763",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1012639",
            "zh": "801334",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "454238",
            "zh": "759768",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799814",
            "zh": "798289",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1664329",
            "zh": "13931508",
            "eng": "1664323"
          },
          {
            "kind": "indirect",
            "fr": "134994",
            "zh": "734926",
            "eng": "320210"
          }
        ]
      }
    },
    "pouvoir": {
      "display": "pouvoir",
      "prepositions": {
        "en": [
          "Hitler a pris le pouvoir en 1933. 希特勒在一九三三年取得了权力。",
          "Est-ce que je peux en manger un peu ? 我可以吃一点吗？",
          "Il a plus d'argent qu'on ne peut en dépenser. 他有花不完的钱。",
          "Si tu ne peux pas avoir d'enfants, tu peux toujours en adopter. 如果你不能有孩子，你总能领养。",
          "Comme il ne pouvait en supporter plus, il prit ses jambes à son cou. 因为他再也受不了了，所以他撒腿就跑了。",
          "Tu peux t'en aller. 您可以走了。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "13170",
            "zh": "616225",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12430",
            "zh": "386570",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333405",
            "zh": "333408",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3659",
            "zh": "502779",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "131731",
            "zh": "842158",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "893881",
            "zh": "396894",
            "eng": "518553"
          }
        ]
      }
    },
    "prendre": {
      "display": "prendre",
      "prepositions": {
        "par": [
          "prendre qqn par la main 拉着某人的手",
          "Il m'a pris par la main. 他抓住了我的手。",
          "Tout ce que je fais doit passer par sa permission. 我做的每件事都要通过他的允许。",
          "Je prévois de passer par chez elle la semaine prochaine. 下礼拜我要去拜访她一下。",
          "Il m'a pris par le cou. 他抓住了我的脖子。",
          "Il me prit par le bras. 他抓住了我的手臂。",
          "Ça m'a pris par surprise. 这个让我惊讶到了!"
        ],
        "pour": [
          "prendre qqn pour qqn 把某人误当成某人",
          "Il me prit pour ma mère. 他把我错认为我妈妈了。",
          "Fais-toi passer pour moi. 假装你是我。",
          "Il m'a pris pour un Anglais. 他误认为我是一个英国人。",
          "Je l'ai pris pour un homme honnête. 我把他当成一个老实人。",
          "Nous l'avons pris pour un Américain. 我们以为他是美国人。",
          "Il le prit pour un reproche implicite. 他把那视作了委婉的批评。"
        ]
      },
      "prepositionOrder": [
        "par",
        "pour"
      ],
      "sources": {
        "par": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "132298",
            "zh": "337871",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1078596",
            "zh": "382433",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135552",
            "zh": "1221392",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "132301",
            "zh": "779465",
            "eng": "297895"
          },
          {
            "kind": "indirect",
            "fr": "132334",
            "zh": "843807",
            "eng": "252110"
          },
          {
            "kind": "indirect",
            "fr": "2021686",
            "zh": "2021495",
            "eng": "2021217"
          }
        ],
        "pour": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "343290",
            "zh": "343314",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "790174",
            "zh": "791687",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132352",
            "zh": "760566",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132751",
            "zh": "390437",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426813",
            "zh": "10272600",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "452288",
            "zh": "1323335",
            "eng": ""
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "prendre une décision 做决定",
          "collocation": "prendre une décision",
          "chinese": "做决定",
          "source": "authored"
        },
        {
          "text": "prendre le train 坐火车",
          "collocation": "prendre le train",
          "chinese": "坐火车",
          "source": "authored"
        },
        {
          "text": "prendre un café 喝杯咖啡",
          "collocation": "prendre un café",
          "chinese": "喝杯咖啡",
          "source": "authored"
        },
        {
          "text": "prendre une douche 洗澡",
          "collocation": "prendre une douche",
          "chinese": "洗澡",
          "source": "authored"
        },
        {
          "text": "prendre rendez-vous 预约",
          "collocation": "prendre rendez-vous",
          "chinese": "预约",
          "source": "authored"
        },
        {
          "text": "prendre des vacances 休假",
          "collocation": "prendre des vacances",
          "chinese": "休假",
          "source": "authored"
        },
        {
          "text": "prendre froid 着凉",
          "collocation": "prendre froid",
          "chinese": "着凉",
          "source": "authored"
        },
        {
          "text": "prendre la parole 发言",
          "collocation": "prendre la parole",
          "chinese": "发言",
          "source": "authored"
        }
      ]
    },
    "presser": {
      "display": "presser",
      "prepositions": {
        "de": [
          "À la fin d'une journée de travail, tout le monde est pressé de rentrer chez soi. 工作了一天之后，大家都急着回家。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "13998",
            "zh": "346122",
            "eng": ""
          }
        ]
      }
    },
    "prier": {
      "display": "prier",
      "prepositions": {
        "de": [
          "On m'a prié d'attendre ici. 我被要求在这里等。",
          "Je vous prie de me pardonner. 我请您原谅我。",
          "Je te prie de fermer la porte ! 请关门。",
          "Je la priai d'attendre un moment. 我请求她等一下。",
          "Je te prie de me présenter à elle. 请你把我介绍给她。",
          "Je te prie d'écouter attentivement. 我请你专心听。"
        ],
        "pour": [
          "Ils se sont agenouillés et ont prié pour que la guerre finisse bientôt. 他们跪了下来祈祷，希望战争快点结束。"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "465667",
            "zh": "465884",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "180655",
            "zh": "346079",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1736748",
            "zh": "396001",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "806197",
            "zh": "1272226",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "808133",
            "zh": "808211",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12780",
            "zh": "472954",
            "eng": ""
          }
        ],
        "pour": [
          {
            "kind": "indirect",
            "fr": "392501",
            "zh": "1329546",
            "eng": "305999"
          }
        ]
      }
    },
    "priver": {
      "display": "priver",
      "prepositions": {
        "de": [
          "Cette loi nous privera de nos droits fondamentaux. 这项法律会剥夺我们的基本权利。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "945999",
            "zh": "1409040",
            "eng": ""
          }
        ]
      }
    },
    "procurer": {
      "display": "procurer",
      "prepositions": {
        "de": [
          "La lecture me procure beaucoup de plaisir. 阅读带给我巨大的快乐。",
          "Le soleil nous procure de la lumière et de la chaleur. 太阳提供我们光和热。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "129635",
            "zh": "1424177",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1688206",
            "zh": "4265916",
            "eng": "275126"
          }
        ]
      }
    },
    "produire": {
      "display": "produire",
      "prepositions": {
        "de": [
          "Cet événement s'est produit de façon soudaine. 这件事突然自己发生的。",
          "L'Allemagne a produit beaucoup de scientifiques. 德国出了很多科学家。",
          "On utilise l'énergie nucléaire pour produire de l'électricité. 我们用原子能发电。",
          "La bombe atomique est le produit de la physique du XXe siècle. 原子弹是二十世纪物理学的产物。",
          "Les Allemands ne veulent pas produire d'électricité nucléaire, mais ils n'ont rien contre consommer celle de leurs voisins. 德国人不愿意生产核电，但他们不反对使用邻国的。",
          "Les vaches produisent du lait. 牛可产奶。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "698845",
            "zh": "696962",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12769",
            "zh": "472965",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "136066",
            "zh": "2348943",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "136129",
            "zh": "2186458",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "797934",
            "zh": "799271",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "181058",
            "zh": "7767652",
            "eng": "619902"
          }
        ]
      }
    },
    "profiter": {
      "display": "profiter",
      "prepositions": {
        "de": [
          "profiter de qqch 利用某事；享受某物",
          "Tom profite de toi. 汤姆在利用你。",
          "Si tu peux profiter de la gravité, fais-le. 你如果能利用重力，那就这么做吧。",
          "Je souhaiterais profiter de cette occasion. 我想要利用这个机会。",
          "Elle profita du beau temps pour peindre le mur. 她趁天气好粉刷了墙壁。",
          "Nous avons profité de la plage toute la journée. 我们在海边玩了一整天。",
          "J'espère que tu pourras profiter de ton temps en Chine. 希望你会享受在中国的时光。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "10784937",
            "zh": "12253227",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "411246",
            "zh": "411248",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "845919",
            "zh": "1313476",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134560",
            "zh": "408851",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "237208",
            "zh": "337889",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1169523",
            "zh": "1169522",
            "eng": ""
          }
        ]
      }
    },
    "programmer": {
      "display": "programmer",
      "prepositions": {
        "pour": [
          "La publication de l'article a été programmée pour coïncider avec l'anniversaire du professeur. 文章的发表被预定在教授生日那天。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "791307",
            "zh": "791400",
            "eng": ""
          }
        ]
      }
    },
    "promener": {
      "display": "promener",
      "prepositions": {
        "dans": [
          "Je me promène dans un parc. 我在公园散步。",
          "Nous sommes allés nous promener dans la forêt. 我们去了林中散步。",
          "J'ai vu un joli paon faisant la roue en me promenant dans le bois tout à l'heure. 我刚才在树林里散步时看见了一只漂亮的孔雀在开屏。",
          "Allons nous promener dans le parc. 让我们在公园里散步吧。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "6009",
            "zh": "396360",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "181453",
            "zh": "332688",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "909248",
            "zh": "943714",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12915714",
            "zh": "894051",
            "eng": "240456"
          }
        ]
      }
    },
    "promettre": {
      "display": "promettre",
      "prepositions": {
        "de": [
          "promettre à qqn de faire qqch 答应某人做某事",
          "Elle promit de l'épouser. 她答应了要嫁给他。",
          "Il promit de se marier avec elle. 他承诺跟她结婚。",
          "Je promets de régler ce problème. 我会处理这个问题。",
          "Il m'a promis de venir à quatre heures. 他答应我四点来。",
          "J'ai promis d'aider mon frère avec ses devoirs. 我答应了弟弟教他做功课。",
          "Il avait promis de venir, mais il n'est pas venu. 他保证过会来却没有来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1337241",
            "zh": "1731969",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "126581",
            "zh": "439062",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1484704",
            "zh": "417782",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "451930",
            "zh": "10276226",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337360",
            "zh": "337327",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1300805",
            "zh": "1328210",
            "eng": ""
          }
        ]
      }
    },
    "proposer": {
      "display": "proposer",
      "prepositions": {
        "de": [
          "proposer de faire qqch 提议做某事"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "protester": {
      "display": "protester",
      "prepositions": {
        "contre": [
          "protester contre qqch 抗议某事"
        ]
      },
      "prepositionOrder": [
        "contre"
      ],
      "sources": {
        "contre": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "protéger": {
      "display": "protéger",
      "prepositions": {
        "contre": [
          "Les capotes protègent contre les MST. 避孕套可以预防性传播疾病。"
        ]
      },
      "prepositionOrder": [
        "contre"
      ],
      "sources": {
        "contre": [
          {
            "kind": "indirect",
            "fr": "1902947",
            "zh": "9054559",
            "eng": "1879696"
          }
        ]
      }
    },
    "provenir": {
      "display": "provenir",
      "prepositions": {
        "de": [
          "provenir de qqch 来源于某物",
          "Ce mot provient du grec. 这个词来源于希腊语。",
          "Cela provient du fait que l'anglais est une langue internationale. 这是因为英语是全球性的语言。",
          "Plus de 90 pourcents des visites d'une page Web proviennent de moteurs de recherche. 一个网页超过百分之九十的访问量是来自于搜索引擎的。",
          "Les superstitions proviennent de l'incapacité des hommes à reconnaître que des coïncidences sont simplement des coïncidences. 迷信之所以存在，是因为人无法接受巧合只是巧合而已。",
          "Ce mot provient du latin. 这个词源于拉丁语。",
          "Le titre de ce roman provient de la Bible. 这本小说的名字出自《圣经》。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "849587",
            "zh": "6284425",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "898324",
            "zh": "888441",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4093",
            "zh": "389821",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "715579",
            "zh": "10311643",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "946735",
            "zh": "6332429",
            "eng": "2060138"
          },
          {
            "kind": "indirect",
            "fr": "392601",
            "zh": "647680",
            "eng": "46521"
          }
        ]
      }
    },
    "préoccuper": {
      "display": "préoccuper",
      "prepositions": {
        "par": [
          "Je suis juste préoccupé par mon poids. 我只是担心我的体重。",
          "Je ne suis pas préoccupé par cette affaire. 这件事与我无关。",
          "Il est préoccupé par la possibilité d'être en retard. 他担心他可能会迟到。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "3679712",
            "zh": "1446950",
            "eng": "275258"
          },
          {
            "kind": "indirect",
            "fr": "495248",
            "zh": "345290",
            "eng": "253507"
          },
          {
            "kind": "indirect",
            "fr": "1365137",
            "zh": "1361972",
            "eng": "1226157"
          }
        ]
      }
    },
    "préparer": {
      "display": "préparer",
      "prepositions": {
        "à": [
          "Nous sommes préparés au pire. 我们已经做好了最坏的准备。",
          "Il est nécessaire d'être préparé au pire. 必须为最坏的情况作好准备。",
          "Je suis préparé à mourir. 我已经准备去死了。",
          "Mère nous prépara à déjeuner. 母亲为我们准备了午餐。",
          "Ma mère m'a préparé à déjeuner. 妈妈为我准备了午饭。",
          "Tu devrais te préparer au pire. 你应该作最坏的准备。"
        ],
        "pour": [
          "Nous trouvâmes en arrivant un repas gigantesque préparé pour nous. 我们到达后发现一顿大餐已经为我们准备好了。",
          "Je me suis bien préparé pour cet examen. 我为这次考试好好准备了一番。",
          "Je suis occupé à me préparer pour demain. 我正忙着为明天作准备。"
        ]
      },
      "prepositionOrder": [
        "à",
        "pour"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "7047085",
            "zh": "373530",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "338636",
            "zh": "338632",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1185671",
            "zh": "7980271",
            "eng": "1185673"
          },
          {
            "kind": "indirect",
            "fr": "497241",
            "zh": "346152",
            "eng": "320734"
          },
          {
            "kind": "indirect",
            "fr": "15701",
            "zh": "332840",
            "eng": "320758"
          },
          {
            "kind": "indirect",
            "fr": "8396008",
            "zh": "719278",
            "eng": "719281"
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "486582",
            "zh": "340126",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "180824",
            "zh": "365907",
            "eng": "59030"
          },
          {
            "kind": "indirect",
            "fr": "498764",
            "zh": "864360",
            "eng": "328727"
          }
        ]
      }
    },
    "présenter": {
      "display": "présenter",
      "prepositions": {
        "à": [
          "Elle m'a présenté à son frère. 她把我介绍给了她弟。",
          "Je me suis présenté à la réunion. 我出席了会议。",
          "Je te prie de me présenter à elle. 请你把我介绍给她。",
          "À la réception, il m'a présenté à sa famille. 在招待会上，他把我介绍给了他的家人。",
          "Combien de personnes étaient-elles présentes à la réunion ? 多少人出席了会议？",
          "Veuillez présenter mes amitiés à votre père. 请向您的父亲表达我的敬意。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "431027",
            "zh": "10551917",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426051",
            "zh": "426396",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "808133",
            "zh": "808211",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "564109",
            "zh": "1323600",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9637",
            "zh": "366851",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474180",
            "zh": "1314237",
            "eng": ""
          }
        ]
      }
    },
    "prévenir": {
      "display": "prévenir",
      "prepositions": {
        "de": [
          "Je vous préviendrai de l'arrivée des marchandises. 货物运到，我会通知你们的。",
          "Je l'ai prévenu du danger. 我跟他说过很危险的。",
          "Il n'était pas prévenu du danger. 他没有意识到自己有危险。",
          "Je t'avais prévenu de ne pas venir ici. 我警告过你别来这里。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "134792",
            "zh": "782098",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "127648",
            "zh": "3341512",
            "eng": "1362386"
          },
          {
            "kind": "indirect",
            "fr": "130999",
            "zh": "882985",
            "eng": "290658"
          },
          {
            "kind": "indirect",
            "fr": "5857766",
            "zh": "6075558",
            "eng": "4927665"
          }
        ]
      }
    },
    "prévoir": {
      "display": "prévoir",
      "prepositions": {
        "de": [
          "Je prévois de jouer au football demain. 我打算明天踢足球。",
          "Tu ne prévois pas d'y aller, n'est-ce pas ? 你不准备去，是吗？",
          "Avez-vous prévu de participer à la réunion ? 你们说了要参加会议了吗？",
          "Ils avaient prévu de se voir ici à sept heures. 他们约了七点在这儿碰头。",
          "Je prévois de travailler dans une maison close. 我打算去妓院做事。",
          "Je prévois de passer par chez elle la semaine prochaine. 下礼拜我要去拜访她一下。"
        ],
        "pour": [
          "Le redémarrage du serveur est prévu pour 9 heures ce soir. 服务器重启预定在今晚9点。",
          "Qu'as-tu prévu pour ce soir ? 你今晚有什么打算？",
          "As-tu quelque chose de prévu pour ce soir ? 今晚有什么计划吗？"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "14715",
            "zh": "441482",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "691680",
            "zh": "419934",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10347",
            "zh": "676558",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "624939",
            "zh": "718626",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1489678",
            "zh": "1193446",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135552",
            "zh": "1221392",
            "eng": ""
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "3029161",
            "zh": "2921290",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "949341",
            "zh": "848562",
            "eng": "848510"
          },
          {
            "kind": "indirect",
            "fr": "1099537",
            "zh": "5094727",
            "eng": "1096512"
          }
        ]
      }
    },
    "prêter": {
      "display": "prêter",
      "prepositions": {
        "à": [
          "Tu n'aurais pas dû prêter cet argent à une telle personne. 你不应该借钱给这样的人。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "830389",
            "zh": "830356",
            "eng": "36469"
          }
        ]
      }
    },
    "publier": {
      "display": "publier",
      "prepositions": {
        "en": [
          "Le livre fut publié en 1689. 这本书出版于1689年。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "598003",
            "zh": "1358783",
            "eng": "553660"
          }
        ]
      }
    },
    "punir": {
      "display": "punir",
      "prepositions": {
        "pour": [
          "C'est un acte criminel et tu seras sûrement puni pour cela ! 那是犯罪行为，你肯定会受到惩罚的!"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "829280",
            "zh": "829305",
            "eng": ""
          }
        ]
      }
    },
    "pénétrer": {
      "display": "pénétrer",
      "prepositions": {
        "dans": [
          "Ne laisse personne pénétrer dans la pièce. 不要让任何人进入这个房间。",
          "Je vis un étranger pénétrer dans cette maison. 我看到一个陌生人进了那间屋子。",
          "Veuillez éteindre vos cigarettes avant de pénétrer dans le musée. 请你在进入博物馆之前先把烟弄熄。",
          "Découvrez votre chef lorsque vous pénétrez dans un lieu de culte. 当你进入礼拜堂时，把你的帽子脱下来。",
          "Il prit une longue inspiration avant de pénétrer dans le bureau de son patron. 他在进老板办公室前深吸了一口气。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "1076849",
            "zh": "845445",
            "eng": "276671"
          },
          {
            "kind": "indirect",
            "fr": "1360569",
            "zh": "10294819",
            "eng": "257263"
          },
          {
            "kind": "indirect",
            "fr": "530305",
            "zh": "1030352",
            "eng": "318165"
          },
          {
            "kind": "indirect",
            "fr": "803747",
            "zh": "896671",
            "eng": "706791"
          },
          {
            "kind": "indirect",
            "fr": "1077727",
            "zh": "13945454",
            "eng": "1077721"
          }
        ]
      }
    },
    "pêcher": {
      "display": "pêcher",
      "prepositions": {
        "dans": [
          "Je suis allé pêcher dans la rivière hier. 昨天我去河边钓鱼了。",
          "On nous a octroyé le privilège de pouvoir pêcher dans cette baie. 我们得到了在这个海湾内捕鱼的特权。"
        ],
        "avec": [
          "J'irai pêcher avec lui. 我跟他去钓鱼。",
          "J'allais régulièrement pêcher avec mon père lorsque j'étais enfant. 我小的时候经常跟我父亲一起去钓鱼的。",
          "Viens pêcher avec moi. 跟我一起去钓鱼。",
          "J'allai souvent pêcher avec lui. 我经常和他去钓鱼。",
          "J'aime aller pêcher avec mon père. 我喜欢和父亲一起去钓鱼。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "avec"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "333987",
            "zh": "333992",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "987148",
            "zh": "8842854",
            "eng": "23233"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "1815340",
            "zh": "392772",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8162",
            "zh": "686920",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "13972",
            "zh": "1438475",
            "eng": "27680"
          },
          {
            "kind": "indirect",
            "fr": "940833",
            "zh": "848234",
            "eng": "284427"
          },
          {
            "kind": "indirect",
            "fr": "3953174",
            "zh": "1672011",
            "eng": "261534"
          }
        ]
      }
    },
    "questionner": {
      "display": "questionner",
      "prepositions": {
        "à": [
          "Oses-tu le questionner au sujet de l'accident ? 你敢问他有关事故的问题吗？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "804585",
            "zh": "805046",
            "eng": ""
          }
        ]
      }
    },
    "raccompagner": {
      "display": "raccompagner",
      "prepositions": {
        "chez": [
          "Voulez-vous que je vous raccompagne chez vous ? 你愿意让我送你回家吗？"
        ]
      },
      "prepositionOrder": [
        "chez"
      ],
      "sources": {
        "chez": [
          {
            "kind": "direct",
            "fr": "429082",
            "zh": "796813",
            "eng": ""
          }
        ]
      }
    },
    "raconter": {
      "display": "raconter",
      "prepositions": {
        "à": [
          "Kenji a raconté à ses amis une histoire sur son voyage en Inde. 健二向他的朋友们叙述了一件他在印度旅游时发生的事。",
          "Ne le raconte à personne ! 别跟任何人说哟。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "8800",
            "zh": "346754",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2092747",
            "zh": "4885068",
            "eng": "2092602"
          }
        ]
      }
    },
    "raffoler": {
      "display": "raffoler",
      "prepositions": {
        "de": [
          "Ils raffolent de cette chanson. 他们非常喜欢那首歌曲。",
          "Il raffole de toi. 他被你迷住了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "843164",
            "zh": "842767",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "381791",
            "zh": "393756",
            "eng": "381793"
          }
        ]
      }
    },
    "ramener": {
      "display": "ramener",
      "prepositions": {
        "à": [
          "Cela vous dérangerait-il de me ramener à la maison ? 您介意带我回家吗？",
          "La musique m'a ramené à mon enfance. 这些音乐勾起了我儿时的回忆。",
          "Cette photo me ramène à mon enfance. 这张照片带我回到我的童年时光。"
        ],
        "chez": [
          "Reprenons un verre, et puis je vous ramènerai chez vous. 再喝最后一杯，然后就让我送你回家吧。",
          "Je te ramènerai chez toi. 我开车送你回家。",
          "Je peux te ramener chez toi ? 我可以带你回家吗？",
          "Pourriez-vous me ramener chez moi ? 你可以载我回家吗?",
          "Je lui ai demandé de me ramener chez moi. 我请他开车送我回家。"
        ]
      },
      "prepositionOrder": [
        "à",
        "chez"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1219587",
            "zh": "1347000",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "486306",
            "zh": "339490",
            "eng": "49421"
          },
          {
            "kind": "indirect",
            "fr": "1418306",
            "zh": "793605",
            "eng": "46867"
          }
        ],
        "chez": [
          {
            "kind": "direct",
            "fr": "5489860",
            "zh": "8500210",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "598107",
            "zh": "819412",
            "eng": "24132"
          },
          {
            "kind": "indirect",
            "fr": "10734465",
            "zh": "10734473",
            "eng": "3909200"
          },
          {
            "kind": "indirect",
            "fr": "11135126",
            "zh": "836383",
            "eng": "24131"
          },
          {
            "kind": "indirect",
            "fr": "127672",
            "zh": "884204",
            "eng": "260419"
          }
        ]
      }
    },
    "ranger": {
      "display": "ranger",
      "prepositions": {
        "dans": [
          "Elle plia les serviettes et les rangea dans une armoire. 她把毛巾折叠好再放入柜子里。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "1176769",
            "zh": "6822543",
            "eng": "291603"
          }
        ]
      }
    },
    "rappeler": {
      "display": "rappeler",
      "prepositions": {
        "de": [
          "Je dois me rappeler d'acheter ce livre demain. 明天我一定要记得去买那一本书。",
          "Tu te rappelles de moi ? 你记得我么?",
          "Je me rappelle de moins en moins de mon enfance. 我对童年的记忆越来越模糊了."
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "127962",
            "zh": "827065",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "338749",
            "zh": "765982",
            "eng": "250327"
          },
          {
            "kind": "indirect",
            "fr": "565643",
            "zh": "342109",
            "eng": "246027"
          }
        ]
      }
    },
    "ravir": {
      "display": "ravir",
      "prepositions": {
        "de": [
          "Il serait ravi d'entendre ça. 他听到这个会很高兴的。",
          "Je suis ravi de te rencontrer. 很高兴认识你。",
          "Ravi de faire ta connaissance. 认识你很高兴",
          "Je suis ravi de les rencontrer. 我很高兴能和他们会面。",
          "Ravie de te revoir. 很高兴能再见到你。",
          "Je suis ravi de te voir. 我很高兴见到你。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "3556",
            "zh": "501709",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10243",
            "zh": "493913",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1109129",
            "zh": "1105591",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "486510",
            "zh": "339938",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "181201",
            "zh": "339208",
            "eng": "32634"
          },
          {
            "kind": "indirect",
            "fr": "862311",
            "zh": "342857",
            "eng": "3444146"
          }
        ]
      }
    },
    "rayer": {
      "display": "rayer",
      "prepositions": {
        "de": [
          "Votre nom a été rayé de la liste. 你的名字已经从名单删除了。",
          "Eh bien, je peux le rayer de ma liste de choses à faire avant de mourir. 太好了，死前心愿又完成了一样。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "11662499",
            "zh": "4846808",
            "eng": "4846787"
          },
          {
            "kind": "indirect",
            "fr": "9481361",
            "zh": "2513951",
            "eng": "2513950"
          }
        ]
      }
    },
    "recevoir": {
      "display": "recevoir",
      "prepositions": {
        "de": [
          "Nous recevons beaucoup d'appels venant de l'étranger. 我们接到许多来自国外的电话。",
          "Cette pièce ne reçoit pas beaucoup de lumière du soleil. 这间房照不到很多阳光。",
          "Un enfant ne devrait pas recevoir plus d'argent de poche qu'il n'est nécessaire. 给孩子的零用钱不该超过必要的数额。",
          "Pas une lettre je n'ai reçue d'elle. 她一封信也没有寄来。",
          "Kate a reçu de l'argent de son père. 凯特从她的父亲那里得到了一些钱。",
          "Il a reçu pas mal de lettres, ce matin. 今天早上他收到好多信。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1411008",
            "zh": "875133",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335465",
            "zh": "335528",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1645944",
            "zh": "2614567",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1409517",
            "zh": "388357",
            "eng": "261020"
          },
          {
            "kind": "indirect",
            "fr": "4442360",
            "zh": "890521",
            "eng": "62721"
          },
          {
            "kind": "indirect",
            "fr": "1544725",
            "zh": "343416",
            "eng": "1316331"
          }
        ]
      }
    },
    "recommander": {
      "display": "recommander",
      "prepositions": {
        "de": [
          "Le professeur m'a recommandé de lire Shakespeare. 老师建议我读莎士比亚。",
          "Mon professeur m'a recommandé de lire Shakespeare. 我老师建议我读莎士比亚。",
          "Elle lui recommanda de faire de l'exercice chaque jour. 她建议他每天锻炼。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "809628",
            "zh": "808850",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "817143",
            "zh": "817277",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1129543",
            "zh": "1323694",
            "eng": ""
          }
        ]
      }
    },
    "recommencer": {
      "display": "recommencer",
      "prepositions": {
        "à": [
          "J'espère que vous n'allez pas recommencer à me mentir. 希望你不要再继续骗我了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "533524",
            "zh": "398346",
            "eng": ""
          }
        ]
      }
    },
    "reconduire": {
      "display": "reconduire",
      "prepositions": {
        "chez": [
          "L'as-tu reconduite chez elle la nuit dernière ? 昨晚你把她送回家了吗？",
          "Je lui ai demandé de me reconduire chez moi. 我请他开车送我回家。"
        ]
      },
      "prepositionOrder": [
        "chez"
      ],
      "sources": {
        "chez": [
          {
            "kind": "direct",
            "fr": "794540",
            "zh": "795756",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "5372029",
            "zh": "884204",
            "eng": "260419"
          }
        ]
      }
    },
    "recouvrir": {
      "display": "recouvrir",
      "prepositions": {
        "de": [
          "Ces rues sont recouvertes d'asphalte. 这条街铺上了柏油。",
          "Cette montagne est recouverte de neige. 这座山被雪覆盖了。",
          "Le sommet de la montagne est recouvert de neige. 山顶被雪覆盖了。",
          "Les trois quarts de la superficie de la Terre sont recouverts d'eau. 地表的四分之三被水覆盖。",
          "La montagne était recouverte de neige. 这座山被雪覆盖着。",
          "La machine était recouverte de poussière. 机器蒙上了一层灰。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "2865942",
            "zh": "872208",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337715",
            "zh": "397116",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335946",
            "zh": "336005",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "977489",
            "zh": "4262062",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "684355",
            "zh": "872435",
            "eng": "245078"
          },
          {
            "kind": "indirect",
            "fr": "437641",
            "zh": "7774743",
            "eng": "48823"
          }
        ]
      }
    },
    "redonner": {
      "display": "redonner",
      "prepositions": {
        "à": [
          "Cela révèle l'ambition des dirigeants locaux de redonner à la région son niveau d'excellence. 这表明了地方领导恢复地区卓越水平的雄心。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "799168",
            "zh": "799195",
            "eng": ""
          }
        ]
      }
    },
    "refuser": {
      "display": "refuser",
      "prepositions": {
        "de": [
          "refuser de faire qqch 拒绝做某事",
          "Il a refusé de nous croire. 他拒绝相信我们。",
          "Il refusa de me serrer la main. 他拒绝跟我握手。",
          "Ils refusèrent d'aller à l'armée. 他们拒绝参军。",
          "Le cheval s'arrêta et refusa de bouger. 马停了下来，而且拒绝移动。",
          "Je refuse d'être traité comme un enfant. 我拒绝被像一个孩子般对待。",
          "Il a refusé de leur donner l'information. 他拒绝给他们提供信息。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "132203",
            "zh": "785851",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "343215",
            "zh": "343233",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1286975",
            "zh": "1665513",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "971445",
            "zh": "3742623",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8136",
            "zh": "427621",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133138",
            "zh": "405139",
            "eng": ""
          }
        ]
      }
    },
    "regarder": {
      "display": "regarder",
      "prepositions": {
        "par": [
          "Il était assis à regarder par la fenêtre. 他坐在那里看着窗外。",
          "Nous avons regardé par la fenêtre, mais nous n'avons rien vu. 我们看了窗外，但什么都没看见。",
          "J'ai regardé par la fenêtre. 我望向窗外。",
          "Elle a regardé par la fenêtre. 她看了窗外。",
          "En regardant par la fenêtre, j'ai vu une voiture venir. 向窗外望去，我看到一辆车驶来。"
        ],
        "dans": [
          "Je l'ai regardé dans les yeux. 我直视他的眼睛。",
          "Ne regarde pas dans ma chambre. 不要往我房间里看。",
          "Elle m'a regardé dans les yeux. 她看着我的眼睛。",
          "Regarde dans mes yeux. 看着我的眼睛。",
          "Regarde dans le miroir. 照镜子。",
          "J'ai regardé dans le placard. 我瞧了瞧橱柜。"
        ],
        "avec": [
          "Il me regarda avec surprise. 他惊奇地看着我。"
        ]
      },
      "prepositionOrder": [
        "par",
        "dans",
        "avec"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "132084",
            "zh": "453731",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426049",
            "zh": "426397",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "432528",
            "zh": "13109231",
            "eng": "259183"
          },
          {
            "kind": "indirect",
            "fr": "4188517",
            "zh": "8387375",
            "eng": "315530"
          },
          {
            "kind": "indirect",
            "fr": "129033",
            "zh": "1193453",
            "eng": "274183"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "127738",
            "zh": "332762",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "139056",
            "zh": "333189",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4775486",
            "zh": "10460418",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "671710",
            "zh": "873186",
            "eng": "456317"
          },
          {
            "kind": "indirect",
            "fr": "3217343",
            "zh": "8731975",
            "eng": "2648072"
          },
          {
            "kind": "indirect",
            "fr": "8064997",
            "zh": "2029406",
            "eng": "239944"
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "1579749",
            "zh": "608123",
            "eng": "295385"
          }
        ]
      }
    },
    "regorger": {
      "display": "regorger",
      "prepositions": {
        "de": [
          "La nature regorge de mystère. 大自然已充满了谜团。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "3330800",
            "zh": "1218193",
            "eng": "1216239"
          }
        ]
      }
    },
    "regretter": {
      "display": "regretter",
      "prepositions": {
        "de": [
          "regretter de faire qqch 后悔做了某事",
          "Je regrette d'y être allé. 我后悔去过那里。",
          "Je regrette de te l'avoir dit. 我后悔告诉了你。",
          "Il regrette d'avoir perdu son temps. 他后悔浪费了他的时间。",
          "Je regrette de ne pas aller à Versailles. 我很遗憾没去凡尔赛。",
          "Je regrette de ne pas avoir travaillé plus dur. 我后悔没有更努力地工作。",
          "Il regrette d'avoir été paresseux pendant sa jeunesse. 他很后悔在年轻的时候没有努力。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "354290",
            "zh": "354449",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9031",
            "zh": "634817",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132410",
            "zh": "683677",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "843555",
            "zh": "844174",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1064550",
            "zh": "1328219",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132526",
            "zh": "864536",
            "eng": ""
          }
        ]
      }
    },
    "rejeter": {
      "display": "rejeter",
      "prepositions": {
        "sur": [
          "Il a rejeté sur moi la faute de l'accident. 他为这个意外指责我。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "1683393",
            "zh": "844489",
            "eng": "290920"
          }
        ]
      }
    },
    "relever": {
      "display": "relever",
      "prepositions": {
        "de": [
          "relever de qqch 属于…的范畴",
          "La prévention des feux de forêt relève de la responsabilité de chacun. 防止山火，人人有责。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "487962",
            "zh": "1746082",
            "eng": "269497"
          }
        ]
      }
    },
    "remercier": {
      "display": "remercier",
      "prepositions": {
        "de": [
          "remercier qqn de qqch 为某事感谢某人（较书面，多接抽象事物）",
          "Je vous remercie de tout cœur. 我衷心感谢您。",
          "Je te remercie du fond du cœur. 我打心底里感激你。",
          "Je vous remercie de la part de mon fils. 我为我的儿子向您致谢。",
          "Je vous remercie d'avance pour votre aide. 我先谢谢你的帮忙。",
          "Il me remercia d'être venu. 他感谢我的到来。",
          "Je vous remercie de votre réponse. 谢谢你的答复。"
        ],
        "pour": [
          "remercier qqn pour qqch 为某物感谢某人（多接具体事物）",
          "Je vous remercie pour hier. 昨天的事真的要谢谢您了。",
          "Je te remercie pour ton aide. 谢谢您的帮助。",
          "Tom m'a remercié pour le cadeau. 汤姆为这个礼物感谢我。",
          "Je vous remercie pour votre invitation. 感谢您的邀请。",
          "Je voulais te remercier pour ce que tu as fait aujourd'hui. 我想为你今天所做的事感谢你。"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "486826",
            "zh": "803835",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "374823",
            "zh": "4759994",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "445323",
            "zh": "10267403",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "374822",
            "zh": "396374",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "132171",
            "zh": "833088",
            "eng": "297243"
          },
          {
            "kind": "indirect",
            "fr": "3481919",
            "zh": "332508",
            "eng": "2645019"
          }
        ],
        "pour": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "4316782",
            "zh": "5100139",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "13021248",
            "zh": "700491",
            "eng": "462516"
          },
          {
            "kind": "indirect",
            "fr": "387350",
            "zh": "870390",
            "eng": "37041"
          },
          {
            "kind": "indirect",
            "fr": "376684",
            "zh": "842433",
            "eng": "268110"
          },
          {
            "kind": "indirect",
            "fr": "3598801",
            "zh": "6093372",
            "eng": "3596415"
          }
        ]
      }
    },
    "remettre": {
      "display": "remettre",
      "prepositions": {
        "à": [
          "Je m'en remettais à lui. 我信赖他。",
          "Ne remets plus à plus tard ta recherche d'emploi. 不要拖延去找工作的事。",
          "Ne remets pas à demain ce que tu peux faire aujourd'hui. 不要把今天你能做的事情拖到明天。",
          "Quelques braves passagers ont attrapé le pickpocket et l'ont remis aux policiers. 几位见义勇为的乘客把小偷抓住了，还把他送到了警方的手中。",
          "Il a remis son départ à demain. 他把出发推时到明天了。"
        ],
        "en": [
          "Remettre en forme après lavage. 洗后弄平。",
          "Certains ont remis en cause son honnêteté. 有些人质疑他的诚实。",
          "Leur voyage fut remis en raison de la pluie. 他们的旅行因为下雨延期了。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "808138",
            "zh": "808210",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799768",
            "zh": "798310",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14250",
            "zh": "1314378",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "390116",
            "zh": "499593",
            "eng": "24520"
          },
          {
            "kind": "indirect",
            "fr": "841886",
            "zh": "842230",
            "eng": "299407"
          }
        ],
        "en": [
          {
            "kind": "direct",
            "fr": "3390",
            "zh": "334417",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "13223569",
            "zh": "838605",
            "eng": "286994"
          },
          {
            "kind": "indirect",
            "fr": "1223639",
            "zh": "475530",
            "eng": "305320"
          }
        ]
      }
    },
    "remonter": {
      "display": "remonter",
      "prepositions": {
        "à": [
          "Le qipao est un vêtement féminin classique dont l'origine remonte à la Chine du 17e siècle. 旗袍是一种17世纪起源于中国的传统式样的女性服装。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "769307",
            "zh": "727692",
            "eng": ""
          }
        ]
      }
    },
    "remplacer": {
      "display": "remplacer",
      "prepositions": {
        "par": [
          "remplacer qqch par qqch 用某物替换某物"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "remplir": {
      "display": "remplir",
      "prepositions": {
        "de": [
          "Mon cœur était rempli de joie. 我心里充满着快乐。",
          "Il a un panier rempli de fraises. 他有个装满草莓的篮子。",
          "Le panier était rempli de fraises. 篮子里装满了草莓。",
          "Ses yeux étaient remplis de larmes. 她的眼里充满了泪水。",
          "Ses yeux étaient remplis de tristesse. 她的眼神里充满了悲哀。",
          "Son magasin est toujours rempli de clients. 他的店总是挤满了顾客。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "3927",
            "zh": "503219",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "412530",
            "zh": "464895",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "332247",
            "zh": "346762",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133846",
            "zh": "454254",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "867899",
            "zh": "867898",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130382",
            "zh": "892452",
            "eng": ""
          }
        ]
      }
    },
    "remédier": {
      "display": "remédier",
      "prepositions": {
        "à": [
          "remédier à qqch 补救某事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "rencontrer": {
      "display": "rencontrer",
      "prepositions": {
        "en": [
          "Je l'ai rencontré en rentrant chez moi. 我在回家的路上遇到了他。",
          "Les deux politiciens se sont rencontrés en face à face pour la première fois. 两个政客第一次面对面。"
        ],
        "par": [
          "Je l'ai rencontrée par hasard. 我偶然碰到了她。",
          "Nous l'avons rencontrée par hasard. 我们偶然碰到了她。",
          "Je l'ai rencontrée par hasard à un arrêt de bus. 我碰巧在公交车站遇到了她。"
        ],
        "pour": [
          "Je l'ai rencontré pour la première fois à Kyoto. 我第一次见到她是在京都。",
          "Je n'oublierai jamais le jour où je l'ai rencontré pour la première fois. 我永远不会忘记那天我第一次与他见面。",
          "C'est le lieu inoubliable où nous nous sommes rencontrés pour la première fois. 这是我们第一次见面令人难忘的地方。",
          "Je l'ai rencontrée pour la première fois à Londres. 我第一次遇见她是在伦敦。",
          "Je l'ai rencontré pour la première fois il y a 3 ans. 我第一次见他是三年前的事了。",
          "Te souviens-tu du jour où nous nous sommes rencontrés pour la première fois ? 你记不记得我们认识的那一天？"
        ],
        "dans": [
          "Nous nous rencontrerons dans trois heures. 我们三小时后见吧。",
          "Nous nous rencontrâmes dans un café près du campus. 我们在校园附近的咖啡厅碰面。",
          "Je n'aurais jamais cru la rencontrer dans un tel endroit. 我想也没有想过会在这样的地方碰到她。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par",
        "pour",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "454033",
            "zh": "794156",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335806",
            "zh": "335895",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "9092",
            "zh": "343368",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333011",
            "zh": "332910",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14339",
            "zh": "352059",
            "eng": ""
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "8062",
            "zh": "9955999",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2005316",
            "zh": "4760054",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335796",
            "zh": "335885",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "862277",
            "zh": "9961327",
            "eng": "255942"
          },
          {
            "kind": "indirect",
            "fr": "7494",
            "zh": "423883",
            "eng": "252569"
          },
          {
            "kind": "indirect",
            "fr": "8026",
            "zh": "136402",
            "eng": "247252"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "6285810",
            "zh": "3303132",
            "eng": "2713336"
          },
          {
            "kind": "indirect",
            "fr": "2168984",
            "zh": "5418959",
            "eng": "1893779"
          },
          {
            "kind": "indirect",
            "fr": "14309",
            "zh": "517315",
            "eng": "254881"
          }
        ]
      }
    },
    "rendre": {
      "display": "rendre",
      "prepositions": {
        "à": [
          "Pourquoi t'es-tu rendu à Tokyo ? 你为什么去了东京？",
          "Je me rends à l'école chaque jour. 我每天都去学校。",
          "Je dois me rendre à la bibliothèque. 我得去趟图书馆。",
          "Comment puis-je me rendre au commissariat ? 请问警察局怎么走？",
          "Nous nous y rendons à l'équinoxe de printemps. 我们到了春分去。",
          "Si j'étais riche, je me rendrais à l'étranger. 如果我有钱了，我就出国。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "907207",
            "zh": "10637263",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1234219",
            "zh": "10695991",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8737154",
            "zh": "10580071",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8873",
            "zh": "344393",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "947084",
            "zh": "955374",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1360641",
            "zh": "10696081",
            "eng": ""
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "rendre visite à qqn 拜访某人",
          "collocation": "rendre visite à qqn",
          "chinese": "拜访某人",
          "source": "authored"
        },
        {
          "text": "rendre service à qqn 帮某人的忙",
          "collocation": "rendre service à qqn",
          "chinese": "帮某人的忙",
          "source": "authored"
        }
      ]
    },
    "renoncer": {
      "display": "renoncer",
      "prepositions": {
        "à": [
          "renoncer à qqch 放弃某事",
          "Je ne peux pas renoncer à mes rêves. 我不能放弃我的梦想。",
          "Renoncer à la cigarette n'est pas dur, renoncer à toi l'es trop. 戒烟容易，戒你太难！",
          "Ne renonce pas à tes rêves ! 别放弃梦想。",
          "Elle a dû renoncer à son rêve. 她不得不放弃梦想。",
          "Le peuple japonais a renoncé à la guerre. 日本人放弃了战争。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "5668070",
            "zh": "10326064",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1085042",
            "zh": "838433",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3453389",
            "zh": "6774618",
            "eng": "3442599"
          },
          {
            "kind": "indirect",
            "fr": "4662383",
            "zh": "2444549",
            "eng": "2439732"
          },
          {
            "kind": "indirect",
            "fr": "589667",
            "zh": "332967",
            "eng": "281685"
          }
        ]
      }
    },
    "rentrer": {
      "display": "rentrer",
      "prepositions": {
        "à": [
          "Il est rentré à six heures. 他六点回来了。",
          "Je ne suis pas rentré à la maison hier. 我昨天没回家。",
          "Mon père rentre à la maison ce week-end. 我爸爸会在这周末回家。",
          "Pourquoi es-tu rentré à la maison si tard ? 你为什么这么晚回家？",
          "Mon père est rentré à la maison à neuf heures. 我爸九点回家。",
          "Mes parents veulent que je rentre à la maison. 我的家长想让我回家。"
        ],
        "chez": [
          "rentrer chez soi 回自己家",
          "Je dois rentrer chez moi. 我该回家了。",
          "Je veux rentrer chez moi. 我想回家。",
          "Vous devez rentrer chez vous. 你们必须回家。",
          "Je suis rentré chez moi en train. 我坐火车回了家。",
          "Il vient juste de rentrer chez lui. 他刚回到家。",
          "Très bien, tu peux rentrer chez toi. 好，你可以回家了。"
        ]
      },
      "prepositionOrder": [
        "à",
        "chez"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "133536",
            "zh": "429099",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10065820",
            "zh": "10064217",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "534922",
            "zh": "334238",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "905363",
            "zh": "905345",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134841",
            "zh": "10522511",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2015658",
            "zh": "3080260",
            "eng": ""
          }
        ],
        "chez": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "6676",
            "zh": "343852",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6055180",
            "zh": "6055181",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7699280",
            "zh": "9961677",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "128014",
            "zh": "10602058",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "131178",
            "zh": "335119",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10278619",
            "zh": "10278326",
            "eng": ""
          }
        ]
      }
    },
    "renverser": {
      "display": "renverser",
      "prepositions": {
        "par": [
          "J'ai failli me faire renverser par une voiture. 我差点被车撞倒。",
          "J'ai failli me faire renverser par un camion. 我差点被卡车撞到。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "181677",
            "zh": "364004",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1134051",
            "zh": "13071569",
            "eng": "4665803"
          }
        ]
      }
    },
    "reporter": {
      "display": "reporter",
      "prepositions": {
        "à": [
          "Il a reporté son voyage à demain. 他把他的旅行推迟到明天了。",
          "La fête a été reportée à mardi. 聚会已经推迟到了下周二。",
          "La réunion a été reportée à demain. 会议已经被延迟到明天了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "841931",
            "zh": "846640",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "554606",
            "zh": "2058564",
            "eng": "50040"
          },
          {
            "kind": "indirect",
            "fr": "3469028",
            "zh": "8795333",
            "eng": "3455731"
          }
        ]
      }
    },
    "reposer": {
      "display": "reposer",
      "prepositions": {
        "en": [
          "Repose en paix. 安息吧。",
          "Puisse ton âme reposer en paix. 愿你的在天之灵安息。"
        ],
        "sur": [
          "Ne te repose pas trop sur les autres. 不要太过于依赖别人。",
          "Une grande responsabilité repose sur ses épaules. 他身肩重任。",
          "Que tu réussisses ou pas repose sur tes propres efforts. 你成功与否取决于你自身的努力。",
          "Je me repose toujours sur lui en cas de problème. 我在困难时总是依赖他。",
          "La véritable amitié repose sur la confiance mutuelle. 真正的友谊建立在彼此信任的基础上。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "715523",
            "zh": "13744202",
            "eng": "692884"
          },
          {
            "kind": "indirect",
            "fr": "5684520",
            "zh": "11706391",
            "eng": "761571"
          }
        ],
        "sur": [
          {
            "kind": "direct",
            "fr": "427314",
            "zh": "444711",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1970252",
            "zh": "1233797",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "336056",
            "zh": "332945",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "457959",
            "zh": "6095969",
            "eng": "412768"
          },
          {
            "kind": "indirect",
            "fr": "11720270",
            "zh": "2490074",
            "eng": "7772943"
          }
        ]
      }
    },
    "reprocher": {
      "display": "reprocher",
      "prepositions": {
        "à": [
          "Je ne peux pas reprocher à Tom de ne pas attendre. 我不能怪汤姆不等著。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "5658125",
            "zh": "6070993",
            "eng": "1951351"
          }
        ]
      }
    },
    "requérir": {
      "display": "requérir",
      "prepositions": {
        "de": [
          "Maîtriser une langue étrangère requiert de la patience. 精通一种外语需要耐心。",
          "Apprendre une langue étrangère requiert beaucoup de temps. 学外语很费时间。",
          "Les enfants requièrent beaucoup de sommeil. 孩子需要很多睡眠。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "3487342",
            "zh": "798045",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1462300",
            "zh": "10467036",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1482978",
            "zh": "358180",
            "eng": "579224"
          }
        ]
      }
    },
    "respecter": {
      "display": "respecter",
      "prepositions": {
        "de": [
          "C'est un scientifique respecté de tous. 他是个受所有人尊敬的科学家。"
        ],
        "par": [
          "Il est respecté par tout le monde. 大家都很尊敬他。"
        ]
      },
      "prepositionOrder": [
        "de",
        "par"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "468093",
            "zh": "469480",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "indirect",
            "fr": "131748",
            "zh": "1541997",
            "eng": "294697"
          }
        ]
      }
    },
    "respirer": {
      "display": "respirer",
      "prepositions": {
        "par": [
          "Je ne peux pas respirer par le nez. 我的鼻子没办法呼吸了。",
          "Respire par le nez. 用你的鼻子呼吸。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "134765",
            "zh": "343677",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1173638",
            "zh": "4845078",
            "eng": "4666280"
          }
        ]
      }
    },
    "ressembler": {
      "display": "ressembler",
      "prepositions": {
        "à": [
          "ressembler à qqn 像某人",
          "Cela ressemble à un œuf. 这看上去像个蛋。",
          "Ma sœur ressemble à ma mère. 我妹妹很像我妈妈。",
          "Daniel ressemble à un Ouïgour. 丹尼尔看起来像个维吾尔族人。",
          "Il ressemble beaucoup à son père. 他很像他的父亲。",
          "Elle ressemble beaucoup à sa mère. 她非常像她的母亲。",
          "Vu de loin, ça ressemble à une balle. 远看像一个球。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "334184",
            "zh": "334185",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334005",
            "zh": "334032",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1602208",
            "zh": "2102027",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133278",
            "zh": "662315",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "464790",
            "zh": "465002",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "348695",
            "zh": "439085",
            "eng": ""
          }
        ]
      }
    },
    "ressentir": {
      "display": "ressentir",
      "prepositions": {
        "pour": [
          "Tu ne ressens vraiment rien pour moi ? 你对我完全没有感觉吗？"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "10507579",
            "zh": "5555220",
            "eng": "5485234"
          }
        ]
      }
    },
    "rester": {
      "display": "rester",
      "prepositions": {
        "avec": [
          "Je veux que tu restes avec moi. 我想你和我待在一起。",
          "Nous restâmes avec eux tout au long de l'été. 我们整个夏天都和他们待在一起。",
          "Je pense qu'il vaudrait mieux que vous restiez avec nous. 我觉得你们最好还是和我们待在一起。",
          "Reste avec nous. 和我们留在一起吧！",
          "Il est parti pour rester avec son cousin. 他去和他的表弟待在一起了。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "525127",
            "zh": "718676",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333056",
            "zh": "333073",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8952",
            "zh": "375370",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1435145",
            "zh": "7768128",
            "eng": "660408"
          },
          {
            "kind": "indirect",
            "fr": "336491",
            "zh": "336444",
            "eng": "289250"
          }
        ]
      }
    },
    "retirer": {
      "display": "retirer",
      "prepositions": {
        "de": [
          "Il reste une chose à faire, c'est d'aller rapidement à la banque retirer de l'argent. 还有件事就是马上到银行里去取些钱。",
          "Ton nom a été retiré de la liste. 你的名字已经从名单删除了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "661122",
            "zh": "421116",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "997312",
            "zh": "4846808",
            "eng": "4846787"
          }
        ]
      }
    },
    "retourner": {
      "display": "retourner",
      "prepositions": {
        "à": [
          "Elle retourna au Japon. 她回到了日本。",
          "Il est retourné au magasin. 他回店里去了。",
          "Je dois retourner au bureau. 我必须回办公室。",
          "Et si nous retournions à la maison ? 我们何不回家呢？",
          "L'année prochaine, je retourne à Macao. 明年我回澳门。",
          "Aussitôt qu'il eut fini son travail, il retourna à la maison. 他一干完活儿就回了家。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1460551",
            "zh": "10334413",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "795250",
            "zh": "795619",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1774358",
            "zh": "1819099",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3356",
            "zh": "334555",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "819831",
            "zh": "383290",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "489481",
            "zh": "10275077",
            "eng": ""
          }
        ]
      }
    },
    "retrouver": {
      "display": "retrouver",
      "prepositions": {
        "dans": [
          "Si tu pars maintenant, tu vas certainement te retrouver dans les embouteillages. 你现在出门的话，肯定会堵车的。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "180264",
            "zh": "422986",
            "eng": ""
          }
        ]
      }
    },
    "revenir": {
      "display": "revenir",
      "prepositions": {
        "sur": [
          "revenir sur qqch 收回（诺言）；重提某事",
          "Je voudrais revenir sur ma déclaration précédente. 我要重新考虑我前面的声明。"
        ],
        "dans": [
          "S'il vous plaît revenez dans trois jours. 请在三天内回来。",
          "Je dois aller faire les courses, je reviens dans une heure. 我该去买东西了，我一小时后回来。",
          "Je reviens dans trente minutes donc je serai à l'heure pour le concert. 我半小时后回来，所以我应该来得及去音乐会。",
          "Je reviens dans une minute. 我马上就回来。",
          "Il reviendra dans dix minutes. 他十分钟后会回来。",
          "Il est trois heures maintenant ; je reviendrai dans une heure. 现在是三时正，我一个小时后再来吧。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3792",
            "zh": "502997",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "781412",
            "zh": "784525",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3468",
            "zh": "501524",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "11545",
            "zh": "343887",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2058184",
            "zh": "819694",
            "eng": "593653"
          },
          {
            "kind": "indirect",
            "fr": "751339",
            "zh": "881220",
            "eng": "288377"
          },
          {
            "kind": "indirect",
            "fr": "8533",
            "zh": "1570836",
            "eng": "241792"
          }
        ]
      }
    },
    "rimer": {
      "display": "rimer",
      "prepositions": {
        "avec": [
          "Industrialisation rime souvent avec pollution. 工业化常会导致环境污染。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "4572041",
            "zh": "10272133",
            "eng": "245164"
          }
        ]
      }
    },
    "rire": {
      "display": "rire",
      "prepositions": {
        "de": [
          "rire de qqn 取笑某人",
          "Tu ris de moi ? 你在嘲笑我吗？",
          "Ils ont ri de mon idée. 他们嘲笑我的想法。",
          "Il a ri de tout son cœur. 他从心底笑了出来。",
          "Ils ont tous ri de ses blagues. 他们全都被他的笑话逗笑了。",
          "Il rit souvent de ses propres blagues. 他常常因他自己的笑话而笑。",
          "Je ne pouvais m'empêcher de rire de sa coupe de cheveux. 我忍不住取笑他的发型。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "1092070",
            "zh": "8514537",
            "eng": "1091989"
          },
          {
            "kind": "indirect",
            "fr": "7267221",
            "zh": "842467",
            "eng": "307558"
          },
          {
            "kind": "indirect",
            "fr": "391210",
            "zh": "346677",
            "eng": "299834"
          },
          {
            "kind": "indirect",
            "fr": "4873115",
            "zh": "872192",
            "eng": "306304"
          },
          {
            "kind": "indirect",
            "fr": "1228660",
            "zh": "876703",
            "eng": "293287"
          },
          {
            "kind": "indirect",
            "fr": "130395",
            "zh": "1407999",
            "eng": "287336"
          }
        ]
      }
    },
    "risquer": {
      "display": "risquer",
      "prepositions": {
        "de": [
          "risquer de faire qqch 有做某事的危险",
          "Il risquait d'être arrêté et incarcéré. 他冒着被逮捕和监禁的危险。",
          "Il a risqué de perdre toute sa fortune. 他冒着失去所有财产的危险。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "461349",
            "zh": "461634",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1184623",
            "zh": "2393431",
            "eng": "300762"
          }
        ]
      }
    },
    "rompre": {
      "display": "rompre",
      "prepositions": {
        "avec": [
          "rompre avec qqn 与某人断绝关系",
          "Tom a rompu avec Marie. 汤姆和玛丽分手了。",
          "Je pense que vous devriez rompre avec votre petit ami. 我觉得你应该跟男友分手。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "1511083",
            "zh": "9958464",
            "eng": "1723461"
          },
          {
            "kind": "indirect",
            "fr": "12004158",
            "zh": "1399764",
            "eng": "864262"
          }
        ]
      }
    },
    "rouer": {
      "display": "rouer",
      "prepositions": {
        "de": [
          "Il a été roué de coups. 他被打得鼻青脸肿的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "12697904",
            "zh": "11808806",
            "eng": "294159"
          }
        ]
      }
    },
    "rouler": {
      "display": "rouler",
      "prepositions": {
        "en": [
          "Je préfère aller à pied que de rouler en vélo. 我更愿意走路，而不是骑自行车。"
        ],
        "sur": [
          "Nous devons payer le péage pour rouler sur cette route. 我们必得缴通行税才能在这条道路上行驶。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "1181386",
            "zh": "614776",
            "eng": ""
          }
        ],
        "sur": [
          {
            "kind": "direct",
            "fr": "861188",
            "zh": "863175",
            "eng": ""
          }
        ]
      }
    },
    "réagir": {
      "display": "réagir",
      "prepositions": {
        "à": [
          "Notre corps réagit à nos sensations. 我们的身体会对我们的感情做出反应。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "913978",
            "zh": "1394895",
            "eng": "23476"
          }
        ]
      }
    },
    "récompenser": {
      "display": "récompenser",
      "prepositions": {
        "par": [
          "Une fois, il a été récompensé par une médaille d'or. 他曾经被授予金牌。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "1074042",
            "zh": "334280",
            "eng": ""
          }
        ]
      }
    },
    "réduire": {
      "display": "réduire",
      "prepositions": {
        "en": [
          "La maison fut réduite en cendres par l'incendie. 房子被大火烧成了灰烬。",
          "Notre école a été réduite en cendres. 我们的学校被烧成了灰烬。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "139637",
            "zh": "346751",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "9420",
            "zh": "483730",
            "eng": "21515"
          }
        ]
      }
    },
    "réfléchir": {
      "display": "réfléchir",
      "prepositions": {
        "à": [
          "réfléchir à qqch 仔细考虑某事",
          "Elle réfléchit à partir en voyage. 她考虑去旅行。",
          "Réfléchissons au pire qui pourrait arriver. 考虑一下最坏的情况下会发生什么。",
          "Nous réfléchirons à cela lorsque le moment viendra. 到时候我们再考虑吧。",
          "Tu dois réfléchir à quelle sorte de travail tu veux faire. 你一定要考虑清楚你想做怎么样的工作。",
          "Veuillez réfléchir à la question. 请想想这个问题。",
          "Je pense qu'il te faut réfléchir à ton futur. 我觉得你应该考虑到未来。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "470384",
            "zh": "471143",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3169",
            "zh": "501331",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "813912",
            "zh": "813502",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "469992",
            "zh": "418565",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "15162",
            "zh": "881160",
            "eng": "43754"
          },
          {
            "kind": "indirect",
            "fr": "8390157",
            "zh": "1319821",
            "eng": "1318780"
          }
        ]
      }
    },
    "régler": {
      "display": "régler",
      "prepositions": {
        "par": [
          "Vous devez régler par avance. 您必须预先付钱。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "701977",
            "zh": "787172",
            "eng": "273598"
          }
        ]
      }
    },
    "réjouir": {
      "display": "réjouir",
      "prepositions": {
        "de": [
          "Je me réjouis de l'entendre. 我听到这个很开心。",
          "Je me réjouis de te voir dimanche prochain. 我期待下周日能见到你。",
          "Je me réjouis de ne pas avoir acheté une telle chose. 我很高兴没有买这样的东西。",
          "Je me réjouis de le voir. 我期待再次见到他。",
          "Je m'en réjouis d'avance. 我很期待哦。",
          "Je me réjouis de te revoir. 我期待着再次见到你。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1085688",
            "zh": "763741",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "816207",
            "zh": "816443",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465704",
            "zh": "465842",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1360623",
            "zh": "802006",
            "eng": "284454"
          },
          {
            "kind": "indirect",
            "fr": "2397641",
            "zh": "3610746",
            "eng": "1565471"
          },
          {
            "kind": "indirect",
            "fr": "1132084",
            "zh": "889365",
            "eng": "32704"
          }
        ]
      }
    },
    "répondre": {
      "display": "répondre",
      "prepositions": {
        "à": [
          "répondre à qqn/qqch 回答某人／某事",
          "Réponds à la question. 回答问题。",
          "Répondez au téléphone ! 接电话。",
          "Il répondit à ses parents. 他回答了他的父母。",
          "Je peux répondre à sa question. 我能回答他的问题。",
          "Merci de répondre à ma question. 请回答我的问题。",
          "Elle n'a pas répondu à ma lettre. 她没有回我的信。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "128225",
            "zh": "777935",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129525",
            "zh": "332436",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133524",
            "zh": "408853",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "127712",
            "zh": "636201",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "349800",
            "zh": "349931",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134387",
            "zh": "408474",
            "eng": ""
          }
        ]
      }
    },
    "réprimander": {
      "display": "réprimander",
      "prepositions": {
        "pour": [
          "Il m'a réprimandé pour mon oubli. 他责备了我的疏忽。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "12452309",
            "zh": "842131",
            "eng": "7885825"
          }
        ]
      }
    },
    "réputer": {
      "display": "réputer",
      "prepositions": {
        "pour": [
          "Detroit est réputée pour son industrie automobile. 底特律因它的汽车工业而出名。",
          "Les Japonais sont réputés pour être polis. 人们都以为日本人是讲究礼貌的。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "1198765",
            "zh": "473010",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "6486789",
            "zh": "1946779",
            "eng": "281778"
          }
        ]
      }
    },
    "réserver": {
      "display": "réserver",
      "prepositions": {
        "pour": [
          "J'ai réservé pour ce soir. 我有今晚的预订。",
          "J'essaie de me réserver pour le dessert. 我尽量留着胃吃甜点。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "11461374",
            "zh": "848320",
            "eng": "243328"
          },
          {
            "kind": "indirect",
            "fr": "3139162",
            "zh": "333303",
            "eng": "2074261"
          }
        ]
      }
    },
    "résider": {
      "display": "résider",
      "prepositions": {
        "dans": [
          "La beauté réside dans les yeux de celui qui regarde. 美驻留在看的那个人的眼里。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "3964",
            "zh": "503258",
            "eng": ""
          }
        ]
      }
    },
    "résister": {
      "display": "résister",
      "prepositions": {
        "à": [
          "résister à qqch 抵抗某事",
          "Aucun homme ne peut résister au charme d'une femme. 没有男人能够抵挡女人的诱惑。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "549122",
            "zh": "1561580",
            "eng": "537795"
          }
        ]
      }
    },
    "résoudre": {
      "display": "résoudre",
      "prepositions": {
        "par": [
          "C'est un problème que tu dois résoudre par toi-même. 这是一个你必须自己解决的问题。",
          "Ce problème est trop difficile pour être résolu par des enfants de l'école primaire. 这个问题让小学生解决太难了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "1461464",
            "zh": "1426531",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337016",
            "zh": "336874",
            "eng": ""
          }
        ]
      }
    },
    "réussir": {
      "display": "réussir",
      "prepositions": {
        "à": [
          "réussir à faire qqch 成功做到某事",
          "Il a réussi à s'évader. 他成功地逃脱了。",
          "A-t-il réussi à l'examen? 他考试通过了吗？",
          "Il a réussi à traverser la rivière à la nage. 他成功地游过了河。",
          "Vous avez finalement réussi à trouver un emploi. 你终于成功找到工作了。",
          "Comment est-ce que le chat a réussi à grimper sur le toit ? 那只猫是怎么爬上屋顶的？",
          "Elle n'a pas réussi à le convaincre d'écrire une chanson pour elle. 她没能说服他为她写首歌。"
        ],
        "dans": [
          "réussir dans la vie 在事业／生活中成功",
          "Une personne travailleuse réussira dans la vie. 勤劳的人将获得成功人生。",
          "Il était satisfait de se donner tous les moyens de réussir dans la vie. 他很高兴能通过各种方法在人生中取得成功。",
          "Sa santé lui a permis de réussir dans la vie. 他健康的身体使他能在生活中成功。"
        ]
      },
      "prepositionOrder": [
        "à",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "131233",
            "zh": "10494727",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "791261",
            "zh": "791442",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132560",
            "zh": "1314151",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474827",
            "zh": "350679",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8674163",
            "zh": "10538075",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1392993",
            "zh": "12538405",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "8506386",
            "zh": "13119411",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335947",
            "zh": "336006",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "131959",
            "zh": "1397413",
            "eng": "295927"
          }
        ]
      }
    },
    "réveiller": {
      "display": "réveiller",
      "prepositions": {
        "à": [
          "Je le réveille à 6 heures chaque matin. 我每天早上6点叫醒他。",
          "Chéri, pense à me réveiller à 11 heures pour que j'aille travailler. 亲爱的，记得11点喊我起床工作。",
          "On compte sur toi pour nous réveiller à l'heure, alors ne t'endors pas. 我们指望着你到时把我们叫醒，所以别睡着了。",
          "Je me réveille à huit heures. 我八点起床。",
          "Je me réveillai à cinq heures du matin. 我今天早上五点醒来。",
          "Je me suis réveillé à six heures ce matin. 我今天早上六点起床。"
        ],
        "en": [
          "Sa conscience s'est soudainement réveillée en lui. 他突然良心发现。"
        ],
        "par": [
          "C'est beaucoup mieux d'être réveillé par les oiseaux que par un réveil. 被闹钟唤醒没有被鸟唤醒的好。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en",
        "par"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "135271",
            "zh": "333105",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2302777",
            "zh": "2302670",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337414",
            "zh": "454665",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7992513",
            "zh": "6486887",
            "eng": "7798499"
          },
          {
            "kind": "indirect",
            "fr": "1813266",
            "zh": "893375",
            "eng": "242177"
          },
          {
            "kind": "indirect",
            "fr": "433401",
            "zh": "802109",
            "eng": "257525"
          }
        ],
        "en": [
          {
            "kind": "direct",
            "fr": "129646",
            "zh": "13877239",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "392306",
            "zh": "392307",
            "eng": ""
          }
        ]
      }
    },
    "rêver": {
      "display": "rêver",
      "prepositions": {
        "de": [
          "rêver de qqch 梦见；梦想某事",
          "J'ai rêvé de toi. 我梦到你了。",
          "On dirait que je vais encore rêver de toi ce soir. 看来晚上又要梦见你了。",
          "Je rêverai de toi. 我会梦到你的。",
          "As-tu déjà rêvé de moi ? 你梦见过我吗？",
          "Je n'ai jamais rêvé de te voir ici. 我做梦也没想到会在这里见到你。",
          "J'ai rêvé de toi presque toutes les nuits cette semaine. 这个礼拜的每个晚上，我几乎都会梦到你。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3827",
            "zh": "503039",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1065073",
            "zh": "1065072",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2053708",
            "zh": "7771848",
            "eng": "1890892"
          },
          {
            "kind": "indirect",
            "fr": "5668027",
            "zh": "8514610",
            "eng": "3415292"
          },
          {
            "kind": "indirect",
            "fr": "457737",
            "zh": "2304960",
            "eng": "252735"
          },
          {
            "kind": "indirect",
            "fr": "8463575",
            "zh": "7774800",
            "eng": "4404628"
          }
        ]
      }
    },
    "s'abstenir": {
      "display": "s'abstenir",
      "prepositions": {
        "de": [
          "Prière de s'abstenir de fumer dans l'ascenseur. 电梯内不准吸烟。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "10830196",
            "zh": "523893",
            "eng": "10651489"
          }
        ]
      }
    },
    "s'accorder": {
      "display": "s'accorder",
      "prepositions": {
        "avec": [
          "Ce chapeau rouge s'accorde bien avec sa robe. 这顶红帽子很衬她的裙子。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "334083",
            "zh": "334073",
            "eng": ""
          }
        ]
      }
    },
    "s'adapter": {
      "display": "s'adapter",
      "prepositions": {
        "à": [
          "Il s'adapta à sa nouvelle vie. 他适应了新的生活。",
          "Quelques plantes ne s'adaptent pas au froid. 有些植物无法适应寒冷。",
          "Nos yeux prennent du temps pour s'adapter au noir. 我们的眼睛需要时间来适应黑暗。",
          "L'homme a d'importantes dispositions pour s'adapter aux changements environnementaux. 人类适应环境变化的能力很强。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "865060",
            "zh": "1312432",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334060",
            "zh": "334064",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334371",
            "zh": "334396",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "457986",
            "zh": "458155",
            "eng": "270269"
          }
        ]
      }
    },
    "s'adonner": {
      "display": "s'adonner",
      "prepositions": {
        "à": [
          "Finalement elle s'adonna à la tentation et mangea le gâteau en entier. 她终于受不了诱惑，吃掉了整件蛋糕。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "338999",
            "zh": "338995",
            "eng": "39843"
          }
        ]
      }
    },
    "s'adresser": {
      "display": "s'adresser",
      "prepositions": {
        "à": [
          "s'adresser à qqn 向某人打听；找某人办事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "s'agir": {
      "display": "s'agir",
      "prepositions": {
        "de": [
          "il s'agit de qqch 事关某事；是关于某事",
          "Il ne s'agit pas d'un mensonge. 不是谎话。",
          "La question se pose de savoir s'il s'agit d'art. 问题是，知否是艺术。",
          "Juste comme s'il s'agissait de ma queue, où que j'aille, il ira. 它就像我的尾巴一样，我去哪里它就去哪里。",
          "Nous supposons qu'il s'agit d'un empoisonnement par morsure de serpent. 我们猜这是一种被蛇咬伤的毒。",
          "Il est difficile à déterminer s'il s'agit du son d'enfants qui rient ou qui crient. 很难判断是孩子的笑声还是哭声。",
          "Il s'agit du mien. 这是我的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "7839029",
            "zh": "12002574",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1605442",
            "zh": "3579734",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "425145",
            "zh": "425146",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4083",
            "zh": "811099",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "811164",
            "zh": "812371",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4547349",
            "zh": "4760167",
            "eng": "2233709"
          }
        ]
      }
    },
    "s'agripper": {
      "display": "s'agripper",
      "prepositions": {
        "à": [
          "L'homme qui se noyait s'agrippa à la corde. 那个溺水的男人抓紧了绳子。",
          "Inconsciemment ma mère s'agrippa à la chaise. 母亲无意中握住了椅子。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "337004",
            "zh": "336862",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1684431",
            "zh": "366830",
            "eng": "63943"
          }
        ]
      }
    },
    "s'allonger": {
      "display": "s'allonger",
      "prepositions": {
        "sur": [
          "Elle s'allongea sur l'herbe. 她在草地上躺了下来。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "134516",
            "zh": "346844",
            "eng": "315539"
          }
        ]
      }
    },
    "s'apercevoir": {
      "display": "s'apercevoir",
      "prepositions": {
        "de": [
          "s'apercevoir de qqch 察觉到某事",
          "Quand Papa va s'apercevoir de ce que tu as fait, il va devenir dingue. 当爸爸发现你做了什么的时候，他会发疯的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "817845",
            "zh": "818840",
            "eng": ""
          }
        ]
      }
    },
    "s'appeler": {
      "display": "s'appeler",
      "prepositions": {
        "de": [
          "Si l'on savait ce que l'on faisait, ça ne s'appellerait pas de la recherche, non ? 如果我们知道我们在做什么，那么这不能称之为研究，是吗？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "4137",
            "zh": "1772683",
            "eng": "2291"
          }
        ]
      }
    },
    "s'appliquer": {
      "display": "s'appliquer",
      "prepositions": {
        "à": [
          "Cette règle s'applique à toi aussi. 这个规则对你也适用。"
        ],
        "dans": [
          "Cette règle ne s'applique pas dans tous les cas. 这条规则不是任何情况下都奏效的。"
        ]
      },
      "prepositionOrder": [
        "à",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "335447",
            "zh": "335510",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "429485",
            "zh": "1424167",
            "eng": ""
          }
        ]
      }
    },
    "s'approcher": {
      "display": "s'approcher",
      "prepositions": {
        "de": [
          "s'approcher de qqn/qqch 靠近某人／某物",
          "L'histoire s'approche de la vérité historique. 故事与历史真相接近。",
          "Un typhon s'approche du Japon. 台风正接近日本。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "952773",
            "zh": "10484122",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "129147",
            "zh": "834327",
            "eng": "275427"
          }
        ]
      }
    },
    "s'approvisionner": {
      "display": "s'approvisionner",
      "prepositions": {
        "de": [
          "s'approvisionner de qqch 储备某物"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "s'apprêter": {
      "display": "s'apprêter",
      "prepositions": {
        "à": [
          "s'apprêter à faire qqch 准备做某事",
          "On s'apprêtait à rentrer dans la chambre. 我们正要进房间。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "4738004",
            "zh": "333238",
            "eng": "249338"
          }
        ]
      }
    },
    "s'appuyer": {
      "display": "s'appuyer",
      "prepositions": {
        "sur": [
          "La malade leva la tête et s'appuya sur la pyramide de coussins richement brodés. 女病者抬头把身体靠在以金字塔的样子排成的绚丽绣花垫。"
        ],
        "contre": [
          "s'appuyer contre qqch 靠在某物上",
          "Il s'appuyait contre le mur. 他靠着墙。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "contre"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "451002",
            "zh": "845976",
            "eng": ""
          }
        ],
        "contre": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "848589",
            "zh": "848544",
            "eng": "303544"
          }
        ]
      }
    },
    "s'arranger": {
      "display": "s'arranger",
      "prepositions": {
        "pour": [
          "Je suis sûr que les choses vont s'arranger pour le mieux. 我肯定事情会往好的方向发展。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "12174",
            "zh": "343410",
            "eng": ""
          }
        ]
      }
    },
    "s'arrêter": {
      "display": "s'arrêter",
      "prepositions": {
        "de": [
          "s'arrêter de faire qqch 停下不做某事",
          "Que penses-tu qu'il se passerait si la Terre s'arrêtait de tourner ? 如果地球停止自传，你认为会发生什么？",
          "Elle ne peut pas s'arrêter de rire. 她笑得停不下来。",
          "Allons-y dès qu'il s'arrêtera de pleuvoir. 只要雨一停我们就走。",
          "Nous irons lorsqu'il s'arrêtera de pleuvoir. 雨停了我们就会去。"
        ],
        "pour": [
          "Elle s'arrêta pour fumer une cigarette. 她停下来抽了根烟。",
          "Il s'arrêta pour regarder l'affiche. 他停下脚步看起海报。"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "4394662",
            "zh": "9007582",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10790158",
            "zh": "6470896",
            "eng": "1647933"
          },
          {
            "kind": "indirect",
            "fr": "9899",
            "zh": "5091636",
            "eng": "26833"
          },
          {
            "kind": "indirect",
            "fr": "1351797",
            "zh": "874156",
            "eng": "503838"
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "794431",
            "zh": "795771",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "541137",
            "zh": "9970751",
            "eng": "304649"
          }
        ]
      }
    },
    "s'asseoir": {
      "display": "s'asseoir",
      "prepositions": {
        "sur": [
          "Son ami et lui s'assirent sur le banc. 他和他朋友坐在长凳上。",
          "Il s'assit sur le banc. 他坐在长凳上。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "130059",
            "zh": "408814",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "678760",
            "zh": "832960",
            "eng": "501259"
          }
        ]
      }
    },
    "s'attendre": {
      "display": "s'attendre",
      "prepositions": {
        "à": [
          "s'attendre à qqch 预料到某事",
          "On s'attend à ce que cent cinquante mille couples se marient à Shanghai en 2006. 预计2006年15万对夫妇将会在上海结婚。",
          "On s'attend à une bonne récolte cette année. 我们期望今年丰收。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3550",
            "zh": "501704",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "773948",
            "zh": "900677",
            "eng": "243138"
          }
        ]
      }
    },
    "s'efforcer": {
      "display": "s'efforcer",
      "prepositions": {
        "de": [
          "s'efforcer de faire qqch 努力做某事",
          "Il s'efforça de rendre sa femme heureuse, mais en vain. 他试着想让他妻子开心，但是没有成功。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "11707071",
            "zh": "5963255",
            "eng": "296804"
          }
        ]
      }
    },
    "s'empêcher": {
      "display": "s'empêcher",
      "prepositions": {
        "de": [
          "Le président n'a pas pu s'empêcher de rire. 总统不由自主地笑了起来。",
          "Elle a eu du mal à s'empêcher de rire quand elle a vu la robe. 当她看到那件衣服, 她无法抑制自己的笑声。",
          "Il ne put s'empêcher de sauter de joie à l'annonce de la bonne nouvelle. 他听到那个好消息，高兴得跳了起来。",
          "Quand elle a commencé à bégayer, ses camarades de classe n'ont pas pu s'empêcher de rire. 她一开始结巴，她的同学们就忍不住笑了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "661088",
            "zh": "400615",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "136417",
            "zh": "774475",
            "eng": "311125"
          },
          {
            "kind": "indirect",
            "fr": "12179936",
            "zh": "425356",
            "eng": "290549"
          },
          {
            "kind": "indirect",
            "fr": "9775392",
            "zh": "2130872",
            "eng": "1012408"
          }
        ]
      }
    },
    "s'enfuir": {
      "display": "s'enfuir",
      "prepositions": {
        "en": [
          "Percevant le danger, il s'enfuit en courant. 他感觉到危险就逃跑了。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "579736",
            "zh": "848195",
            "eng": "20691"
          }
        ]
      }
    },
    "s'engager": {
      "display": "s'engager",
      "prepositions": {
        "à": [
          "s'engager à faire qqch 承诺做某事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "s'enorgueillir": {
      "display": "s'enorgueillir",
      "prepositions": {
        "de": [
          "Un bon artisan s'enorgueillit de son ouvrage. 好的工匠为自己的作品感到骄傲。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "12266009",
            "zh": "3148945",
            "eng": "326599"
          }
        ]
      }
    },
    "s'entendre": {
      "display": "s'entendre",
      "prepositions": {
        "avec": [
          "s'entendre avec qqn 与某人相处融洽",
          "C'est très difficile de s'entendre avec lui. 和他相处好难。",
          "Elle s'entend vraiment bien avec ma grand-mère. 她真的和我的祖母相处得很好。",
          "Il s'entend bien avec ses employés. 他和他的员工相处。",
          "Elle s'entendra bien avec ma grand-mère. 她应该能跟我奶奶相处得来。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "181200",
            "zh": "674242",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "451577",
            "zh": "1312395",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "354167",
            "zh": "804990",
            "eng": "295429"
          },
          {
            "kind": "indirect",
            "fr": "12198268",
            "zh": "1877685",
            "eng": "314366"
          }
        ]
      }
    },
    "s'entretenir": {
      "display": "s'entretenir",
      "prepositions": {
        "avec": [
          "Elle est occupée à l'instant et ne peut s'entretenir avec toi. 她现在忙，不能跟你说话。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "1939231",
            "zh": "1397358",
            "eng": "1345498"
          }
        ]
      }
    },
    "s'envelopper": {
      "display": "s'envelopper",
      "prepositions": {
        "dans": [
          "Elle s'enveloppa dans une couverture. 她用一条毯子把自己裹起来。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "12122519",
            "zh": "860989",
            "eng": "317169"
          }
        ]
      }
    },
    "s'envoler": {
      "display": "s'envoler",
      "prepositions": {
        "pour": [
          "Trente-deux boursiers malgaches s'envolent pour la Chine. 三十二名领奖学金的马达加斯加学生飞往中国。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "6204",
            "zh": "842214",
            "eng": ""
          }
        ]
      }
    },
    "s'excuser": {
      "display": "s'excuser",
      "prepositions": {
        "de": [
          "s'excuser de qqch 为某事道歉",
          "Il devrait s'excuser d'avoir été impoli avec les invités. 他应该为自己对客人的粗鲁无礼而道歉。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "1153894",
            "zh": "1776503",
            "eng": "47524"
          }
        ]
      }
    },
    "s'exercer": {
      "display": "s'exercer",
      "prepositions": {
        "à": [
          "s'exercer à faire qqch 练习做某事",
          "Elle passe beaucoup de temps à s'exercer au piano. 她花很多时间练钢琴。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "9037610",
            "zh": "336428",
            "eng": "312035"
          }
        ]
      }
    },
    "s'habiller": {
      "display": "s'habiller",
      "prepositions": {
        "en": [
          "Il s'habillait en femme. 他打扮得像女人一样。",
          "Elle s'habille toujours en noir. 她总是穿着黑色的衣服。",
          "Elle ne s'habille jamais en vert. 她从来不穿绿色的衣服。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "894985",
            "zh": "4635781",
            "eng": "2764252"
          },
          {
            "kind": "indirect",
            "fr": "1156122",
            "zh": "836582",
            "eng": "836583"
          },
          {
            "kind": "indirect",
            "fr": "1088413",
            "zh": "1019959",
            "eng": "1019956"
          }
        ]
      }
    },
    "s'habituer": {
      "display": "s'habituer",
      "prepositions": {
        "à": [
          "s'habituer à qqch 习惯于某事",
          "Lentement ses yeux s'habituaient à l'obscurité. 他慢慢地适应了黑暗。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "6056979",
            "zh": "7774772",
            "eng": "6093009"
          }
        ]
      }
    },
    "s'immiscer": {
      "display": "s'immiscer",
      "prepositions": {
        "dans": [
          "Les journalistes n'hésitent pas à s'immiscer dans l'intimité des gens. 记者没有犹豫地去干涉了人们的私生活。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "576065",
            "zh": "614789",
            "eng": ""
          }
        ]
      }
    },
    "s'inquiéter": {
      "display": "s'inquiéter",
      "prepositions": {
        "de": [
          "s'inquiéter de qqch 为某事担心"
        ],
        "pour": [
          "Pourquoi s'inquiéter pour Tom ? 为什么要担心Tom？"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ],
        "pour": [
          {
            "kind": "indirect",
            "fr": "8165616",
            "zh": "4504420",
            "eng": "4503002"
          }
        ]
      }
    },
    "s'inscrire": {
      "display": "s'inscrire",
      "prepositions": {
        "dans": [
          "Cette découverte s'inscrira dans l'histoire. 这个发现将会在历史上留下光辉的一页。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "459797",
            "zh": "461493",
            "eng": "57487"
          }
        ]
      }
    },
    "s'installer": {
      "display": "s'installer",
      "prepositions": {
        "en": [
          "Elle a décidé de s'installer en Belgique. 她决定搬到比利时。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "11491944",
            "zh": "11491771",
            "eng": "11483210"
          }
        ]
      }
    },
    "s'introduire": {
      "display": "s'introduire",
      "prepositions": {
        "dans": [
          "Il s'introduisit dans une maison. 他闯入一间房子。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "1316307",
            "zh": "771355",
            "eng": "283445"
          }
        ]
      }
    },
    "s'intéresser": {
      "display": "s'intéresser",
      "prepositions": {
        "à": [
          "s'intéresser à qqch 对某事感兴趣",
          "Elle semble s'intéresser à lui. 她看起来对他感兴趣。",
          "Mary s'intéresse à la politique. 玛丽对政治感兴趣。",
          "Yoko s'intéresse à la philatélie. 洋子有收集邮票的兴趣。",
          "Tom s'intéresse aux mathématiques. 汤姆对数学感兴趣。",
          "Elle s'intéresse beaucoup à son ménage. 她对家务事非常感兴趣。",
          "Ils s'intéressent beaucoup à l'astronomie. 他们对天文学非常感兴趣。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1924856",
            "zh": "10696045",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13550",
            "zh": "401026",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799718",
            "zh": "798331",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1173495",
            "zh": "10546756",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "828664",
            "zh": "829731",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "344392",
            "zh": "344409",
            "eng": ""
          }
        ]
      }
    },
    "s'occuper": {
      "display": "s'occuper",
      "prepositions": {
        "de": [
          "s'occuper de qqch/qqn 照料某人；处理某事",
          "Il aime s'occuper du jardin. 他喜欢照顾花园。",
          "Qui s'occupera de ton chien ? 谁要照顾你的狗？",
          "On doit s'occuper de soi-même. 我们应该照顾自己。",
          "Elle n'a personne qui s'occupe d'elle. 她没有照顾她的人。",
          "Qui va s'occuper de ton chat dans ce cas-là ? 那谁来照顾你的猫呢 ?",
          "Maman s'occupera du bébé pendant que j'irai au bal. 我去参加舞会，母亲就帮忙照顾婴儿。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "132982",
            "zh": "887704",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1347630",
            "zh": "3742569",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "337905",
            "zh": "408855",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "829227",
            "zh": "12615484",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "403251",
            "zh": "426873",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "416224",
            "zh": "380160",
            "eng": ""
          }
        ]
      }
    },
    "s'offrir": {
      "display": "s'offrir",
      "prepositions": {
        "à": [
          "Un brillant avenir s'offre à lui. 大好的前途摆在他面前。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "4275659",
            "zh": "333125",
            "eng": "284932"
          }
        ]
      }
    },
    "s'opposer": {
      "display": "s'opposer",
      "prepositions": {
        "à": [
          "s'opposer à qqch 反对某事",
          "L'Église catholique s'oppose au divorce. 天主教教会反对离婚。",
          "Tous les pays civilisés s'opposent à la guerre. 所有文明国家都反对战争。",
          "Mes parents s'opposent à ce que ma sœur épouse un étranger. 我父母反对我妹妹嫁一个外国人。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "459460",
            "zh": "1244622",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "729105",
            "zh": "337296",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14881",
            "zh": "400985",
            "eng": ""
          }
        ]
      }
    },
    "s'unir": {
      "display": "s'unir",
      "prepositions": {
        "pour": [
          "Le président a appelé la population à s'unir pour combattre la pauvreté et la maladie. 总统呼吁全国民众在对抗贫穷或疾病的时候，一定要团结一致。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "1268307",
            "zh": "805706",
            "eng": ""
          }
        ]
      }
    },
    "s'écarter": {
      "display": "s'écarter",
      "prepositions": {
        "de": [
          "Il ne s'écarta pas de ses principes. 他不会违背他的原则。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "847014",
            "zh": "847875",
            "eng": ""
          }
        ]
      }
    },
    "s'échapper": {
      "display": "s'échapper",
      "prepositions": {
        "de": [
          "De l'air s'échappe du pneu. 轮胎漏气了。",
          "De la fumée s'échappe de la cheminée. 烟从烟囱上升。",
          "Le serpent glissant s'échappa de ses mains. 那条蛇滑溜溜的，一下子就从他的手中掉了出来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "630595",
            "zh": "336599",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11135129",
            "zh": "797052",
            "eng": "25880"
          },
          {
            "kind": "indirect",
            "fr": "801672",
            "zh": "1733330",
            "eng": "718436"
          }
        ]
      }
    },
    "s'élever": {
      "display": "s'élever",
      "prepositions": {
        "dans": [
          "La fumée s'élevait dans les airs. 烟向空中升起。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "336054",
            "zh": "336103",
            "eng": ""
          }
        ]
      }
    },
    "s'éloigner": {
      "display": "s'éloigner",
      "prepositions": {
        "de": [
          "Au son du sifflet, le bateau commença à s'éloigner du port. 汽笛声响起，船开始慢慢地驶离港口。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "9321",
            "zh": "332689",
            "eng": ""
          }
        ]
      }
    },
    "s'étendre": {
      "display": "s'étendre",
      "prepositions": {
        "sur": [
          "Les dégâts du typhon s'étendaient sur plusieurs préfectures. 台风的破坏跨越了好几个省。",
          "Son influence s'étend sur tout le pays. 他的影响遍及全国。",
          "Les Alpes s'étendent sur huit pays européens. 阿尔卑斯山地跨欧洲八国。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "461461",
            "zh": "461527",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "362335",
            "zh": "6065350",
            "eng": "286902"
          },
          {
            "kind": "indirect",
            "fr": "10547954",
            "zh": "882028",
            "eng": "10547907"
          }
        ]
      }
    },
    "s'étonner": {
      "display": "s'étonner",
      "prepositions": {
        "de": [
          "s'étonner de qqch 对某事感到惊讶"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "sacrifier": {
      "display": "sacrifier",
      "prepositions": {
        "pour": [
          "Il s'est sacrifié pour sa patrie. 他把他的一生献给了他的国家。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "12180279",
            "zh": "805588",
            "eng": "296421"
          }
        ]
      }
    },
    "saigner": {
      "display": "saigner",
      "prepositions": {
        "de": [
          "Vous saignez du nez. 您流鼻血了。",
          "Aujourd'hui j'ai saigné du nez. 我今天鼻子流血了 。",
          "Ce matin, j'ai saigné de l'oreille. 今天早上我耳朵流血了。",
          "Elle saigne du nez. 她在流鼻血。",
          "Sa jambe blessée se mit à saigner de nouveau. 他受伤的脚又开始流血了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "543451",
            "zh": "10696098",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1119451",
            "zh": "1119450",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2655895",
            "zh": "8689147",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2075722",
            "zh": "8655346",
            "eng": "950190"
          },
          {
            "kind": "indirect",
            "fr": "484779",
            "zh": "337335",
            "eng": "287445"
          }
        ]
      }
    },
    "saisir": {
      "display": "saisir",
      "prepositions": {
        "par": [
          "Elle le saisit par la main. 她抓住他的手。",
          "Quelqu'un me saisit par le bras. 有人抓住了我的手臂。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "1341623",
            "zh": "10260790",
            "eng": "887165"
          },
          {
            "kind": "indirect",
            "fr": "12568",
            "zh": "6114399",
            "eng": "24530"
          }
        ]
      }
    },
    "saluer": {
      "display": "saluer",
      "prepositions": {
        "en": [
          "Elle le salua en agitant la main. 她挥着手向他打招呼。"
        ],
        "avec": [
          "Madame Parker le salua avec un sourire. 帕克夫人面带微笑向他打招呼。"
        ]
      },
      "prepositionOrder": [
        "en",
        "avec"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "977743",
            "zh": "802084",
            "eng": "314879"
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "646669",
            "zh": "802083",
            "eng": "35732"
          }
        ]
      }
    },
    "satisfaire": {
      "display": "satisfaire",
      "prepositions": {
        "de": [
          "Je suis assez satisfait de toi. 我对你相当满意。",
          "Elle dit être satisfaite de sa vie. 她说很满意她的生活。",
          "Êtes-vous satisfait de votre nouvelle maison ? 您对您的新家满意吗？",
          "Dans l'ensemble, je suis satisfait du résultat. 总的来说，我对这个结果很满意。",
          "Il était satisfait de se donner tous les moyens de réussir dans la vie. 他很高兴能通过各种方法在人生中取得成功。",
          "Je suis satisfait de mon salaire. 对于自己的工资，我感到挺满足。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "859167",
            "zh": "2007031",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465515",
            "zh": "465922",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10413",
            "zh": "472400",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2934572",
            "zh": "435339",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335947",
            "zh": "336006",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "128193",
            "zh": "1867339",
            "eng": "264679"
          }
        ]
      }
    },
    "sauter": {
      "display": "sauter",
      "prepositions": {
        "par": [
          "Ken sauta par-dessus le mur. Ken跃过了墙。",
          "Ken a sauté par-dessus le mur. 肯跳过了墙。",
          "Son cheval sauta par-dessus la clôture. 他的马跳过了栅栏。"
        ],
        "dans": [
          "Le garçon a sauté dans l'eau. 这个男孩跳入了水中。",
          "Tout le monde a sauté dans la piscine. 每个人都跳进了游泳池。"
        ]
      },
      "prepositionOrder": [
        "par",
        "dans"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "971920",
            "zh": "1323687",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "730249",
            "zh": "836124",
            "eng": "62439"
          },
          {
            "kind": "indirect",
            "fr": "494756",
            "zh": "848632",
            "eng": "287303"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "11912015",
            "zh": "869856",
            "eng": "268023"
          },
          {
            "kind": "indirect",
            "fr": "2589962",
            "zh": "6151295",
            "eng": "4500374"
          }
        ]
      }
    },
    "savoir": {
      "display": "savoir",
      "prepositions": {
        "sur": [
          "Tu en sais beaucoup sur le sumo. 你很了解相扑。",
          "Nous en savons peu sur son histoire personnelle. 我们对他的私事知道得很少。",
          "Il sait tout sur tout, il n'y aucune chose qu'il ignore. 他上知天文，下晓地理，没有什么是他不知道的。",
          "Il y a beaucoup de choses que tu ne sais pas sur ma personnalité. 我的个性还有很多方面是你不了解的。",
          "Dites-moi tout ce qu'il y a à savoir sur votre plan, s'il vous plaît. 请把你们的全盘计划告诉我。",
          "Tu es un vrai lettré de tout savoir sur les poèmes de la dynastie Tang. 你很儒雅，关于唐诗什么都知道。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "376670",
            "zh": "6148364",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334811",
            "zh": "334816",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1153471",
            "zh": "1153468",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4025",
            "zh": "811071",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "15298",
            "zh": "333034",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2086482",
            "zh": "2086479",
            "eng": ""
          }
        ]
      }
    },
    "scintiller": {
      "display": "scintiller",
      "prepositions": {
        "dans": [
          "D'innombrables étoiles scintillaient dans le ciel. 无数星星在天上闪烁。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "9106",
            "zh": "5767608",
            "eng": "18312"
          }
        ]
      }
    },
    "se baigner": {
      "display": "se baigner",
      "prepositions": {
        "dans": [
          "Quelques enfants se baignent dans la rivière. 一些孩子在河里游泳。",
          "Il est dangereux de se baigner dans cette rivière. 在这条河里游泳很危险。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "128953",
            "zh": "347072",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "392011",
            "zh": "352038",
            "eng": ""
          }
        ]
      }
    },
    "se battre": {
      "display": "se battre",
      "prepositions": {
        "pour": [
          "se battre pour qqch 为某事奋斗",
          "Les gens dans le monde se battent toujours pour plus de liberté et d'égalité. 世界上的人总是为了更多的自由和平等而争斗。",
          "Il se bat pour sa vie. 他在为生活战斗。",
          "Ils se battent toujours pour des broutilles. 他们总是为了小事吵架。"
        ],
        "contre": [
          "se battre contre qqn 与某人搏斗",
          "Les réfugiés se battaient contre la faim. 难民与饥饿作斗争。"
        ]
      },
      "prepositionOrder": [
        "pour",
        "contre"
      ],
      "sources": {
        "pour": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3749",
            "zh": "502896",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "6572575",
            "zh": "10040435",
            "eng": "2948054"
          },
          {
            "kind": "indirect",
            "fr": "8755899",
            "zh": "8744878",
            "eng": "8742932"
          }
        ],
        "contre": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "804761",
            "zh": "804794",
            "eng": ""
          }
        ]
      }
    },
    "se borner": {
      "display": "se borner",
      "prepositions": {
        "à": [
          "se borner à faire qqch 仅限于做某事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se briser": {
      "display": "se briser",
      "prepositions": {
        "en": [
          "Le vase se brisa en mille morceaux. 花瓶摔成碎片了。",
          "La bouteille se brisa en morceaux. 瓶子摔成了碎片。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "336732",
            "zh": "336615",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1347280",
            "zh": "8888005",
            "eng": "318575"
          }
        ]
      }
    },
    "se cacher": {
      "display": "se cacher",
      "prepositions": {
        "dans": [
          "L'enfant se cachait dans la boîte. 孩子躲在箱子里。",
          "L'homme se cachait dans une forêt dense. 男人躲在一个茂密的森林里。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "459630",
            "zh": "463880",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "459628",
            "zh": "463881",
            "eng": ""
          }
        ]
      }
    },
    "se changer": {
      "display": "se changer",
      "prepositions": {
        "en": [
          "L'eau se changea en glace. 水结成冰了。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "3657928",
            "zh": "2241817",
            "eng": "270834"
          }
        ]
      }
    },
    "se composer": {
      "display": "se composer",
      "prepositions": {
        "de": [
          "L'année se compose de douze mois. 一年有十二个月。",
          "Le comité se compose de dix membres. 这委员会有 10 位成员。",
          "La Terre se compose de mer et de terre. 地球是由海洋和陆地组成的。",
          "Une molécule d'eau se compose de deux atomes d'hydrogène et d'un atome d'oxygène. 水分子由两个氢原子和一个氧原子组成。",
          "Notre comité se compose de dix membres. 我们的委员会是由十位会员组成的。",
          "L'eau se compose d'oxygène et d'hydrogène. 水是由氢和氧组成的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "7731116",
            "zh": "778507",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "486605",
            "zh": "340147",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1147186",
            "zh": "610538",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "844091",
            "zh": "844142",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "136054",
            "zh": "470963",
            "eng": "28247"
          },
          {
            "kind": "indirect",
            "fr": "180680",
            "zh": "377728",
            "eng": "270780"
          }
        ]
      }
    },
    "se concentrer": {
      "display": "se concentrer",
      "prepositions": {
        "sur": [
          "Il se concentra sur ses études. 他专心于学习。",
          "Elle se concentra sur son nouveau travail. 她专注在她的新工作上。",
          "Un comité devrait se concentrer sur des problèmes plus concrets. 委员会应该把注意力集中在更具体的问题上。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "832092",
            "zh": "1964261",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "678987",
            "zh": "678033",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13923",
            "zh": "338629",
            "eng": ""
          }
        ]
      }
    },
    "se consacrer": {
      "display": "se consacrer",
      "prepositions": {
        "à": [
          "se consacrer à qqch 献身于某事",
          "Après son départ à la retraite, Teresa se consacra au soin des orphelins. 退休后，德蕾莎投身照顾孤儿的工作。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "484771",
            "zh": "337292",
            "eng": "239649"
          }
        ]
      }
    },
    "se coucher": {
      "display": "se coucher",
      "prepositions": {
        "à": [
          "Il va se coucher à huit heures. 他八点上床睡觉。",
          "Alice se coucha à 10 heures. 爱丽丝十点睡觉。",
          "Le soleil se couche à l'ouest. 太阳在西边落下",
          "Il allait se coucher à onze heures d'habitude. 他通常在十一点上床睡觉。",
          "Le soleil se lève à l'est et se couche à l'ouest. 太阳在东方升起，西方落下。"
        ],
        "sur": [
          "Mon chien se couche souvent sur la pelouse. 我家的狗经常躺在草地上。"
        ]
      },
      "prepositionOrder": [
        "à",
        "sur"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1372215",
            "zh": "883449",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10585",
            "zh": "840786",
            "eng": "67351"
          },
          {
            "kind": "indirect",
            "fr": "1949344",
            "zh": "2254363",
            "eng": "275141"
          },
          {
            "kind": "indirect",
            "fr": "1176721",
            "zh": "879153",
            "eng": "291573"
          },
          {
            "kind": "indirect",
            "fr": "1010081",
            "zh": "579954",
            "eng": "3615926"
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "589107",
            "zh": "8388697",
            "eng": "250768"
          }
        ]
      }
    },
    "se couvrir": {
      "display": "se couvrir",
      "prepositions": {
        "de": [
          "L'orgueil ne réussit jamais mieux que quand il se couvre de modestie. 满招损, 谦受益。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "790499",
            "zh": "790430",
            "eng": ""
          }
        ]
      }
    },
    "se cultiver": {
      "display": "se cultiver",
      "prepositions": {
        "dans": [
          "Le riz se cultive dans les régions pluvieuses. 人们在多雨地区种植水稻。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "427282",
            "zh": "798329",
            "eng": ""
          }
        ]
      }
    },
    "se dire": {
      "display": "se dire",
      "prepositions": {
        "en": [
          "Comment ça se dit en coréen ? 用韩文怎么说？",
          "Comment ça se dit en italien ? 那个词用意大利语怎么说？",
          "Comment ça se dit en anglais ? 这个用英语怎么说？",
          "Beaucoup de vérités se disent en plaisantant. 笑谈之中有至理。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "13418220",
            "zh": "13519210",
            "eng": "13192529"
          },
          {
            "kind": "indirect",
            "fr": "12705113",
            "zh": "394970",
            "eng": "1649"
          },
          {
            "kind": "indirect",
            "fr": "12705121",
            "zh": "8677502",
            "eng": "8677520"
          },
          {
            "kind": "indirect",
            "fr": "9885",
            "zh": "806766",
            "eng": "26662"
          }
        ]
      }
    },
    "se diriger": {
      "display": "se diriger",
      "prepositions": {
        "vers": [
          "se diriger vers un lieu 朝某处走去",
          "Ils se dirigent vers la forêt. 他们正向森林而去。",
          "Beethoven se dirige vers le piano, s'y assoit et commence à jouer. 贝多芬走向钢琴，坐下来并开始弹。"
        ]
      },
      "prepositionOrder": [
        "vers"
      ],
      "sources": {
        "vers": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "11700890",
            "zh": "2393835",
            "eng": "306920"
          },
          {
            "kind": "indirect",
            "fr": "11138618",
            "zh": "813594",
            "eng": "34024"
          }
        ]
      }
    },
    "se disputer": {
      "display": "se disputer",
      "prepositions": {
        "avec": [
          "se disputer avec qqn 与某人争吵",
          "Ça ne mène à rien de se disputer avec lui à ce sujet. 和他争论这件事得不出结果。",
          "Elle se disputait toujours avec ses frères. 她一直和她的兄弟争吵。",
          "Elle se disputait toujours avec ses parents. 她总和她父母吵架。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1215499",
            "zh": "1314189",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12619823",
            "zh": "332633",
            "eng": "310411"
          },
          {
            "kind": "indirect",
            "fr": "133926",
            "zh": "5581668",
            "eng": "310456"
          }
        ]
      }
    },
    "se dissoudre": {
      "display": "se dissoudre",
      "prepositions": {
        "dans": [
          "Le sucre se dissout dans l'eau. 糖溶于水。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "2226464",
            "zh": "736554",
            "eng": "243599"
          }
        ]
      }
    },
    "se distinguer": {
      "display": "se distinguer",
      "prepositions": {
        "par": [
          "La maison se distingue par sa forme inhabituelle. 那房子因为其少有的形状被突显出来。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "786317",
            "zh": "787385",
            "eng": ""
          }
        ]
      }
    },
    "se dresser": {
      "display": "se dresser",
      "prepositions": {
        "sur": [
          "La maison se dresse sur la colline. 房子矗立在山丘上。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "4949743",
            "zh": "13942853",
            "eng": "49373"
          }
        ]
      }
    },
    "se débarrasser": {
      "display": "se débarrasser",
      "prepositions": {
        "de": [
          "Il est difficile de se débarrasser d'une mauvaise habitude. 一旦养成了坏习惯，就很难改回来了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "766372",
            "zh": "385601",
            "eng": ""
          }
        ]
      }
    },
    "se débrouiller": {
      "display": "se débrouiller",
      "prepositions": {
        "pour": [
          "Elle se débrouilla pour conduire une voiture. 她成功地开车了。",
          "Elle se débrouilla pour préserver les apparences. 她设法保住面子。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "4766180",
            "zh": "795233",
            "eng": "311703"
          },
          {
            "kind": "indirect",
            "fr": "4766188",
            "zh": "794084",
            "eng": "311887"
          }
        ]
      }
    },
    "se décider": {
      "display": "se décider",
      "prepositions": {
        "à": [
          "se décider à faire qqch 下决心做某事",
          "Elle se décida à devenir secrétaire. 她下决心要成为秘书。",
          "L'homme se décida à attendre à la gare que sa femme vienne. 男人觉定在火车站等到他妻子来。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "844093",
            "zh": "844139",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1941777",
            "zh": "12347359",
            "eng": ""
          }
        ]
      }
    },
    "se déplacer": {
      "display": "se déplacer",
      "prepositions": {
        "en": [
          "La tour se déplace en ligne droite, d'autant de cases qu'elle le désire, ou le peut. 车沿直线移动，移动的格数随它所愿，或随其所能。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "5438523",
            "zh": "13881322",
            "eng": ""
          }
        ]
      }
    },
    "se dépêcher": {
      "display": "se dépêcher",
      "prepositions": {
        "de": [
          "se dépêcher de faire qqch 赶紧做某事",
          "Ils doivent se dépêcher de rentrer. 他们得赶紧回家。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "8661100",
            "zh": "9555197",
            "eng": ""
          }
        ]
      }
    },
    "se dérouler": {
      "display": "se dérouler",
      "prepositions": {
        "en": [
          "Tout se déroula en douceur. 一切进展顺利。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "1330419",
            "zh": "10752767",
            "eng": "273694"
          }
        ]
      }
    },
    "se ficher": {
      "display": "se ficher",
      "prepositions": {
        "de": [
          "Elle se fiche de comment elle s'habille. 她不在乎她的穿着。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1357958",
            "zh": "852138",
            "eng": "388419"
          }
        ]
      }
    },
    "se fier": {
      "display": "se fier",
      "prepositions": {
        "à": [
          "se fier à qqn 信任某人",
          "Elle se fie à lui. 她相信他。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "4758214",
            "zh": "1862829",
            "eng": "887479"
          }
        ]
      }
    },
    "se fâcher": {
      "display": "se fâcher",
      "prepositions": {
        "contre": [
          "se fâcher contre qqn 对某人生气",
          "Tom se fâcha contre les enfants. 汤姆对孩子们生气。"
        ]
      },
      "prepositionOrder": [
        "contre"
      ],
      "sources": {
        "contre": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "1704652",
            "zh": "873282",
            "eng": "37256"
          }
        ]
      }
    },
    "se heurter": {
      "display": "se heurter",
      "prepositions": {
        "à": [
          "se heurter à qqch 遇到（阻碍）"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se jeter": {
      "display": "se jeter",
      "prepositions": {
        "dans": [
          "Ce fleuve se jette dans le Pacifique. 这条河汇入太平洋。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "3047207",
            "zh": "4463430",
            "eng": "2267887"
          }
        ]
      }
    },
    "se joindre": {
      "display": "se joindre",
      "prepositions": {
        "à": [
          "se joindre à qqn 加入某人"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se lancer": {
      "display": "se lancer",
      "prepositions": {
        "dans": [
          "se lancer dans qqch 投身于某事"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se lever": {
      "display": "se lever",
      "prepositions": {
        "pour": [
          "Linda se leva pour chanter. 琳达站起来唱歌。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "13778",
            "zh": "834577",
            "eng": "29593"
          }
        ]
      }
    },
    "se limiter": {
      "display": "se limiter",
      "prepositions": {
        "à": [
          "se limiter à qqch 局限于某事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se marier": {
      "display": "se marier",
      "prepositions": {
        "avec": [
          "se marier avec qqn 与某人结婚",
          "Il promit de se marier avec elle. 他承诺跟她结婚。",
          "Pourquoi se marier avec une femme quand on aime les hommes ? 喜欢男人，为什么还要和女人结婚？",
          "Penses-tu qu'il veuille toujours se marier avec moi ? 你认为他还想娶我吗？"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "126581",
            "zh": "439062",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3658",
            "zh": "349280",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1813047",
            "zh": "1936612",
            "eng": "1813019"
          }
        ]
      }
    },
    "se mettre": {
      "display": "se mettre",
      "prepositions": {
        "à": [
          "se mettre à faire qqch 开始做起某事",
          "Il se mit à pleuvoir. 开始下雨了。",
          "L'alarme incendie se mit à sonner. 火警警报响了。",
          "Il va peut-être se mettre à neiger. 可能要开始下雪了。",
          "D'un seul coup, elle se mit à rire. 这时，她突然笑了起来。",
          "Il prit son crayon et se mit à écrire. 他拿起笔，写了起来。",
          "Elle se calma avant de se mettre à parler. 她在说话前让自己冷静下来。"
        ],
        "en": [
          "se mettre en colère 发火",
          "Il se mit en colère et la frappa. 他生气并打了她。",
          "Elle se mit très en colère contre ses enfants. 她对她的孩子非常生气。",
          "Ce n'est pas son genre de se mettre en colère à ce point. 这么生气不像他。",
          "Mon père se met toujours en colère. 我父亲常常发怒。",
          "Il a dit aux garçons de se mettre en rang. 他叫男孩们排好队。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "529031",
            "zh": "10642126",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1074009",
            "zh": "334258",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "374073",
            "zh": "13531827",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1183991",
            "zh": "13532040",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "397306",
            "zh": "385685",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1048028",
            "zh": "9955979",
            "eng": ""
          }
        ],
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "465429",
            "zh": "466008",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "472252",
            "zh": "472823",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335435",
            "zh": "335498",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1360693",
            "zh": "364360",
            "eng": "318991"
          },
          {
            "kind": "indirect",
            "fr": "11155474",
            "zh": "8560573",
            "eng": "8555017"
          }
        ]
      }
    },
    "se monter": {
      "display": "se monter",
      "prepositions": {
        "à": [
          "La facture se montait à 100 dollars. 帐单金额高达100美元。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "795883",
            "zh": "796650",
            "eng": ""
          }
        ]
      }
    },
    "se moquer": {
      "display": "se moquer",
      "prepositions": {
        "de": [
          "se moquer de qqn 嘲笑某人",
          "Il a continué à se moquer de moi. 他继续嘲笑我。",
          "C'est l'hôpital qui se moque de la charité. 五十步笑百步。",
          "Tom se moque toujours de John à cause de son dialecte. 汤姆总是因为约翰的方言嘲笑他。",
          "Ils se moquèrent de Marie. 他们取笑玛丽。",
          "Elle se moquait de son mari. 她取笑了她的丈夫。",
          "On ne se moquait pas de toi. 我们没有笑话你。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "180634",
            "zh": "390889",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "628338",
            "zh": "628347",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465320",
            "zh": "466133",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "817101",
            "zh": "836227",
            "eng": "293019"
          },
          {
            "kind": "indirect",
            "fr": "134649",
            "zh": "819260",
            "eng": "316777"
          },
          {
            "kind": "indirect",
            "fr": "10930949",
            "zh": "6141297",
            "eng": "3728987"
          }
        ]
      }
    },
    "se méfier": {
      "display": "se méfier",
      "prepositions": {
        "de": [
          "se méfier de qqn 提防某人",
          "Tom se méfie de Marie, même s'il affirme le contraire. 汤姆虽然说了一套，但依然怀疑玛丽。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "4445312",
            "zh": "5574542",
            "eng": "4445309"
          }
        ]
      }
    },
    "se mêler": {
      "display": "se mêler",
      "prepositions": {
        "de": [
          "Tom se mêle toujours de ce qui ne le regarde pas. 汤姆总是多管闲事。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "5067269",
            "zh": "5067352",
            "eng": "5067268"
          }
        ]
      }
    },
    "se nourrir": {
      "display": "se nourrir",
      "prepositions": {
        "de": [
          "Cet animal se nourrit de viande. 那种动物靠肉食为生。",
          "Ces animaux se nourrissent d'herbe. 这种动物以草为食。",
          "Les pandas se nourrissent de bambous. 熊猫以竹为食。",
          "Les abeilles se nourrissent de nectar. 蜜蜂以花蜜为食。",
          "Ils se nourrissent de viande. 他们吃肉。",
          "Les zombies se nourrissent de cerveaux. 僵尸吃脑子。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "791309",
            "zh": "791388",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "119987",
            "zh": "676497",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "400827",
            "zh": "350663",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "902880",
            "zh": "8689165",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8648936",
            "zh": "8854279",
            "eng": "2336608"
          },
          {
            "kind": "indirect",
            "fr": "8659297",
            "zh": "9964368",
            "eng": "6055457"
          }
        ]
      }
    },
    "se noyer": {
      "display": "se noyer",
      "prepositions": {
        "dans": [
          "L'enfant sait comment nager, ainsi elle ne se noiera pas dans l'eau. 这个孩子知道如何游泳，所以她不会在水里溺死。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "2720089",
            "zh": "918085",
            "eng": "918079"
          }
        ]
      }
    },
    "se parler": {
      "display": "se parler",
      "prepositions": {
        "à": [
          "Mon grand-père se parle parfois à lui-même quand il est seul. 我祖父一个人的时候，有时会自言自语。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "128998",
            "zh": "813616",
            "eng": ""
          }
        ]
      }
    },
    "se passer": {
      "display": "se passer",
      "prepositions": {
        "de": [
          "se passer de qqch 没有某物也行"
        ],
        "dans": [
          "Les journaux, les magazines et les émissions d'information nous disent ce qui se passe dans le monde. 报纸、杂志和新闻广播讲述着世界上正在发生的事。",
          "Personne ne sait ce qu'il se passera dans le futur. 没有人知道未来会发生什么事。"
        ]
      },
      "prepositionOrder": [
        "de",
        "dans"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "483226",
            "zh": "332822",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "5411166",
            "zh": "1423385",
            "eng": "1423286"
          }
        ]
      }
    },
    "se pencher": {
      "display": "se pencher",
      "prepositions": {
        "sur": [
          "se pencher sur qqch 俯身；研究某问题"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se perdre": {
      "display": "se perdre",
      "prepositions": {
        "dans": [
          "Le garçon se perdit dans la forêt. 小男孩在森林中迷路了。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "1533606",
            "zh": "364848",
            "eng": "1530373"
          }
        ]
      }
    },
    "se permettre": {
      "display": "se permettre",
      "prepositions": {
        "de": [
          "Il ne peut pas se permettre d'acheter une voiture. 他买不起车。",
          "Il ne peut pas se permettre d'acheter une nouvelle voiture. 他买不起新的汽车。",
          "Il ne peut pas se permettre d'acheter une voiture, encore moins une maison. 他买不起一辆汽车，更不要说一套房子了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1153623",
            "zh": "1454054",
            "eng": "298498"
          },
          {
            "kind": "indirect",
            "fr": "871965",
            "zh": "761033",
            "eng": "284850"
          },
          {
            "kind": "indirect",
            "fr": "8436881",
            "zh": "1361992",
            "eng": "298499"
          }
        ]
      }
    },
    "se plaindre": {
      "display": "se plaindre",
      "prepositions": {
        "de": [
          "se plaindre de qqch 抱怨某事",
          "Ken se plaignit d'avoir mal à la tête. Ken抱怨头痛。",
          "Il se plaint toujours de la nourriture. 他总是抱怨伙食不好。",
          "Il se plaint souvent de son mal de dents. 他常常抱怨牙痛。",
          "Les paysans se plaignent toujours du temps. 农民总是抱怨天气。",
          "Il ne fait que se plaindre du matin au soir. 他从早到晚只是在抱怨。",
          "Il se plaignait du bruit. 他抱怨这个噪音。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "344271",
            "zh": "344421",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130755",
            "zh": "429175",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "421488",
            "zh": "1236438",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "864930",
            "zh": "7774819",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "461957",
            "zh": "462024",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "138881",
            "zh": "833112",
            "eng": "291109"
          }
        ]
      }
    },
    "se plier": {
      "display": "se plier",
      "prepositions": {
        "à": [
          "On doit se plier aux circonstances. 你必须随机应变。",
          "Un démocrate est un citoyen libre qui se plie à la volonté de la majorité. 民主主义者是屈服于大部分人的自由公民。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1011441",
            "zh": "1059271",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3595",
            "zh": "502710",
            "eng": ""
          }
        ]
      }
    },
    "se poser": {
      "display": "se poser",
      "prepositions": {
        "sur": [
          "Demain, il va se poser sur la lune. 明天他会在月球降落。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "1037388",
            "zh": "8592711",
            "eng": "1481"
          }
        ]
      }
    },
    "se prendre": {
      "display": "se prendre",
      "prepositions": {
        "pour": [
          "Il se prend pour un artiste. 他自以为自己是个艺术家。",
          "Il se prend pour un grand poète. 他自认为他自己是个伟大的诗人。",
          "N'importe quelle andouille avec un appareil photo, se prend pour une photographe. 每个有照相机的傻瓜都觉得自己是摄影家。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "1032161",
            "zh": "10569504",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7689383",
            "zh": "2485288",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1107070",
            "zh": "7773127",
            "eng": ""
          }
        ]
      }
    },
    "se préoccuper": {
      "display": "se préoccuper",
      "prepositions": {
        "de": [
          "Il se préoccupe de la santé de son père. 他担心他父亲的身体。",
          "Personne ne se préoccupe de ce que tu penses. 没人在意你的看法。",
          "La vie est trop courte pour se préoccuper de ce genre de choses. 人生短暂，用来担心这种事情，实在太浪费了。",
          "Cette entreprise embauche des gens sans se préoccuper de race, de religion ou de nationalité. 这家公司不分种族、宗教或国籍雇用人。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "136264",
            "zh": "343946",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "552440",
            "zh": "12591982",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12319233",
            "zh": "1566313",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "785355",
            "zh": "785359",
            "eng": ""
          }
        ]
      }
    },
    "se préparer": {
      "display": "se préparer",
      "prepositions": {
        "à": [
          "se préparer à faire qqch 准备做某事"
        ],
        "pour": [
          "La plupart des étudiants se préparent pour les examens finaux. 大多数学生都在为期末考试复习。"
        ]
      },
      "prepositionOrder": [
        "à",
        "pour"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ],
        "pour": [
          {
            "kind": "indirect",
            "fr": "12484",
            "zh": "2254420",
            "eng": "1428489"
          }
        ]
      }
    },
    "se présenter": {
      "display": "se présenter",
      "prepositions": {
        "à": [
          "Une voiture se présenta à la porte principale. 一辆车在正门口的地方停了下来。",
          "Il a choisi de ne pas se présenter à l'élection présidentielle. 他选择不出席总统大选。",
          "Il va se présenter aux élections municipales. 他将竞选市长。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "128261",
            "zh": "1221311",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132916",
            "zh": "405145",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "132162",
            "zh": "804819",
            "eng": "297177"
          }
        ]
      }
    },
    "se quereller": {
      "display": "se quereller",
      "prepositions": {
        "avec": [
          "Il est inutile de se quereller avec lui à ce sujet. 和他争论这件事得不出结果。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "1271951",
            "zh": "1314189",
            "eng": "47272"
          }
        ]
      }
    },
    "se ranger": {
      "display": "se ranger",
      "prepositions": {
        "de": [
          "Il se range toujours de son côté. 他总是跟她站在同一边。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "130760",
            "zh": "844439",
            "eng": "289198"
          }
        ]
      }
    },
    "se refuser": {
      "display": "se refuser",
      "prepositions": {
        "à": [
          "Tout le monde se refuse à parler. 没人会讲。",
          "Elle se refusa à accepter l'argent. 她拒绝接受这笔钱。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "2101967",
            "zh": "5574510",
            "eng": "2091104"
          },
          {
            "kind": "indirect",
            "fr": "433359",
            "zh": "851468",
            "eng": "311185"
          }
        ]
      }
    },
    "se regarder": {
      "display": "se regarder",
      "prepositions": {
        "dans": [
          "Mary se regarda dans le miroir. 玛丽看着镜中的自己。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "332299",
            "zh": "427552",
            "eng": ""
          }
        ]
      }
    },
    "se relever": {
      "display": "se relever",
      "prepositions": {
        "de": [
          "La plus grande réussite dans la vie c'est de se relever d'un échec. 人生最大的成就是从失败中站起来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1091792",
            "zh": "838331",
            "eng": ""
          }
        ]
      }
    },
    "se remettre": {
      "display": "se remettre",
      "prepositions": {
        "en": [
          "Elle se remettra en moins de deux. 她很快会康复的。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "133985",
            "zh": "363989",
            "eng": "52128"
          }
        ]
      }
    },
    "se remplir": {
      "display": "se remplir",
      "prepositions": {
        "de": [
          "Ses yeux se remplirent de larmes. 她热泪盈眶。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "336479",
            "zh": "336435",
            "eng": "325986"
          }
        ]
      }
    },
    "se rencontrer": {
      "display": "se rencontrer",
      "prepositions": {
        "dans": [
          "Les cultures orientales et occidentales se rencontrent dans ce pays. 东西方文化在这个国家融合。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "390155",
            "zh": "439069",
            "eng": ""
          }
        ]
      }
    },
    "se rendre": {
      "display": "se rendre",
      "prepositions": {
        "à": [
          "Il devra se rendre à la gare. 他该去火车站了。",
          "Quand doit-elle se rendre à l'étranger ? 她什么时候要出国？",
          "D'où j'habite, on peut se rendre à pied à l'école. 我学校离我家只是几步路的路程。",
          "Elle a tenté de le persuader de se rendre à la réunion. 她试图说服他来参加会议。",
          "Il se rend au bureau en voiture. 他开车去办公室。",
          "Elle se rendit au musée en taxi. 她搭计程车去博物馆了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "500800",
            "zh": "782319",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465659",
            "zh": "465894",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "951678",
            "zh": "372366",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1390378",
            "zh": "9972418",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1344900",
            "zh": "804821",
            "eng": "294629"
          },
          {
            "kind": "indirect",
            "fr": "1351642",
            "zh": "905878",
            "eng": "388676"
          }
        ]
      }
    },
    "se rendre compte": {
      "display": "se rendre compte",
      "prepositions": {
        "de": [
          "se rendre compte de qqch 意识到某事"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se repentir": {
      "display": "se repentir",
      "prepositions": {
        "de": [
          "Il se repentait d'avoir trahi son pays au profit de l'ennemi. 他后悔对敌人出卖了他的国家。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "464694",
            "zh": "778768",
            "eng": ""
          }
        ]
      }
    },
    "se reposer": {
      "display": "se reposer",
      "prepositions": {
        "sur": [
          "On ne doit pas se reposer sur le rapport. 那篇报导不可靠。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "indirect",
            "fr": "497219",
            "zh": "346113",
            "eng": "44029"
          }
        ]
      }
    },
    "se retirer": {
      "display": "se retirer",
      "prepositions": {
        "dans": [
          "Il se retira dans sa chambre après dîner. 他在吃过晚餐后回到了自己的房间。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "133481",
            "zh": "8815170",
            "eng": "304487"
          }
        ]
      }
    },
    "se réjouir": {
      "display": "se réjouir",
      "prepositions": {
        "de": [
          "se réjouir de qqch 为某事高兴",
          "Il se réjouissait d'avoir réussi l'examen. 他为考试及格感到高兴。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "560576",
            "zh": "604466",
            "eng": "47308"
          }
        ]
      }
    },
    "se résigner": {
      "display": "se résigner",
      "prepositions": {
        "à": [
          "se résigner à qqch 认命接受某事",
          "Il ne put se résigner à tirer sur le cerf. 他无法让自己射鹿。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "413811",
            "zh": "464802",
            "eng": ""
          }
        ]
      }
    },
    "se résoudre": {
      "display": "se résoudre",
      "prepositions": {
        "à": [
          "se résoudre à faire qqch 下决心做某事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se réunir": {
      "display": "se réunir",
      "prepositions": {
        "pour": [
          "Une multitude de personnes se réunirent pour voir le défilé. 一大群人聚在一起看巡游。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "7416455",
            "zh": "10538612",
            "eng": "2258082"
          }
        ]
      }
    },
    "se saisir": {
      "display": "se saisir",
      "prepositions": {
        "de": [
          "Il se saisit de la main de l'enfant. 他抓住了孩子的手。",
          "Le policier se saisit du bras du voleur. 警察抓着小偷的胳膊。",
          "Le démon se saisit de ma sœur et la jeta dans un puits sans fond, avec un ricanement. 恶魔一把抓住了我的妹妹，一边狰狞地狂笑着，一边把她丢进了一个无底洞里。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1229472",
            "zh": "1350317",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1238317",
            "zh": "793971",
            "eng": "1236479"
          },
          {
            "kind": "indirect",
            "fr": "799758",
            "zh": "1085704",
            "eng": "723182"
          }
        ]
      }
    },
    "se sentir": {
      "display": "se sentir",
      "prepositions": {
        "à": [
          "Elle se sent à l'aise dans leur maison. 她在他们家里感觉很放松。",
          "Elle se sentit mal à l'aise en pensant à son futur. 想到自己的未来，她不安起来。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "134611",
            "zh": "8914615",
            "eng": "316473"
          },
          {
            "kind": "indirect",
            "fr": "331989",
            "zh": "2680393",
            "eng": "314689"
          }
        ]
      }
    },
    "se servir": {
      "display": "se servir",
      "prepositions": {
        "de": [
          "se servir de qqch 使用某物",
          "Le bébé ne sait pas encore se servir d'une cuillère. 宝宝还不会使用勺子。",
          "Est-ce que tu sais comment on se sert d'un ordinateur ? 你会用电脑吗？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1170468",
            "zh": "336888",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7966085",
            "zh": "2003361",
            "eng": "513513"
          }
        ]
      }
    },
    "se situer": {
      "display": "se situer",
      "prepositions": {
        "à": [
          "La ville se situe à la pointe la plus au nord du Japon. 城市位于日本的最北端。",
          "Son bureau se situe au huitième étage. 他的办公室在八楼。",
          "Notre école se situe au-delà du fleuve. 我们学校在河的对面。",
          "Mon appartement se situe au quatrième étage. 我的公寓在四楼。",
          "La bibliothèque se situe au quatrième étage. 图书馆在四楼。",
          "Les toilettes des messieurs se situent au premier étage. 男厕所在二楼。"
        ],
        "en": [
          "Le Japon se situe en Asie. 日本在亚洲。"
        ],
        "dans": [
          "Notre école se situe dans ce village. 我们的学校在这个村子里。",
          "Le Japon se situe dans l'hémisphère nord. 日本位于北半球。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "461657",
            "zh": "462104",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "624471",
            "zh": "876935",
            "eng": "286528"
          },
          {
            "kind": "indirect",
            "fr": "13841",
            "zh": "862671",
            "eng": "29104"
          },
          {
            "kind": "indirect",
            "fr": "550056",
            "zh": "788805",
            "eng": "251775"
          },
          {
            "kind": "indirect",
            "fr": "1788537",
            "zh": "903056",
            "eng": "270708"
          },
          {
            "kind": "indirect",
            "fr": "3628537",
            "zh": "8715880",
            "eng": "2615578"
          }
        ],
        "en": [
          {
            "kind": "indirect",
            "fr": "9009490",
            "zh": "1415769",
            "eng": "3680831"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "7716367",
            "zh": "3148837",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799584",
            "zh": "798334",
            "eng": ""
          }
        ]
      }
    },
    "se soucier": {
      "display": "se soucier",
      "prepositions": {
        "de": [
          "se soucier de qqch 在意某事",
          "Personne ne se soucie de ce que tu penses. 没人在意你的看法。",
          "Elle se souciait toujours de ma santé. 她总是关心我的健康。",
          "Qui se soucie de quand elle se mariera ? 谁管她什么时候要结婚?",
          "Qui se soucie de quand elle va se marier ? 谁管她什么时候结婚？",
          "Il dit ce qu'il pense sans se soucier de ce que les autres pensent. 他说话从来不理别人的感受。",
          "Tom ne se soucie pas de la protection des renseignements sur sa vie privée en ligne. 汤姆上网时并不在乎个人资讯的保护。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1556892",
            "zh": "12591982",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "6011401",
            "zh": "918669",
            "eng": "310435"
          },
          {
            "kind": "indirect",
            "fr": "4431365",
            "zh": "896620",
            "eng": "307991"
          },
          {
            "kind": "indirect",
            "fr": "1623446",
            "zh": "868490",
            "eng": "388899"
          },
          {
            "kind": "indirect",
            "fr": "132874",
            "zh": "364950",
            "eng": "301080"
          },
          {
            "kind": "indirect",
            "fr": "8133574",
            "zh": "13524177",
            "eng": "8133576"
          }
        ]
      }
    },
    "se soumettre": {
      "display": "se soumettre",
      "prepositions": {
        "à": [
          "On devrait toujours se soumettre à la loi. 我们总要遵守法律。",
          "Accepter les normes des autres, c'est se soumettre à leur pouvoir. 接受对方的准则就是给予他权力。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "1339849",
            "zh": "1438614",
            "eng": "1075502"
          },
          {
            "kind": "indirect",
            "fr": "483112",
            "zh": "332683",
            "eng": "71958"
          }
        ]
      }
    },
    "se souvenir": {
      "display": "se souvenir",
      "prepositions": {
        "de": [
          "se souvenir de qqch 记得某事",
          "Je suis surpris que Tom se souvienne de nous. 我惊讶于 Tom 还记得我们。",
          "Tom ne se souvient pas d'où il a enterré l'argent. 汤姆把他钱埋的地方给忘掉了。",
          "Personne ne se souviendrait de lui. 没人会记住他的。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "6865966",
            "zh": "9583404",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6591461",
            "zh": "6591459",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10781820",
            "zh": "13138794",
            "eng": "10781818"
          }
        ]
      }
    },
    "se suicider": {
      "display": "se suicider",
      "prepositions": {
        "en": [
          "Il se suicida en prenant du poison. 他服毒自杀了。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "762422",
            "zh": "762134",
            "eng": ""
          }
        ]
      }
    },
    "se séparer": {
      "display": "se séparer",
      "prepositions": {
        "de": [
          "Elle va se séparer de son petit ami. 她要和男友分手了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "486536",
            "zh": "340088",
            "eng": "312161"
          }
        ]
      }
    },
    "se targuer": {
      "display": "se targuer",
      "prepositions": {
        "de": [
          "Il se targue de savoir parler six langues. 他显摆自己能说6种语言。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "10363722",
            "zh": "363968",
            "eng": "288622"
          }
        ]
      }
    },
    "se tenir": {
      "display": "se tenir",
      "prepositions": {
        "à": [
          "La fête se tiendra à l'extérieur, si le temps le permet. 若天气许可的话，派对将会在户外举行。",
          "Les gens qui ne sont pas pressés se tiennent à droite dans les escaliers mécaniques. 不赶时间的人们站在自动扶梯的右边。",
          "Il se tenait à la porte. 他站在了门口。",
          "Il se tenait au coin de la rue. 他站在街角。",
          "Un poids-lourd se tenait au milieu de la chaussée. 路中间有一辆卡车。",
          "Chaque joueur est dans l'obligation de se tenir aux règles. 每一位选手都有义务遵守规则。"
        ],
        "sur": [
          "Elle se tenait sur le pont avec ses longs cheveux flottants au vent. 她站在甲板上，长头发随风飞舞。"
        ],
        "dans": [
          "La fête se tiendra dans le jardin sauf en cas de pluie. 除非下雨，宴会将在花园里举行。",
          "La conférence se tiendra dans l'auditorium disposé à cet effet. 会议将会在特意安排的礼堂里举行。",
          "Une femme étrange se tenait dans l'embrasure de la porte. 门口站着一个奇怪的女人。"
        ]
      },
      "prepositionOrder": [
        "à",
        "sur",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "8448975",
            "zh": "3739017",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "896730",
            "zh": "1325199",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1340553",
            "zh": "1450414",
            "eng": "302277"
          },
          {
            "kind": "indirect",
            "fr": "478148",
            "zh": "333711",
            "eng": "301685"
          },
          {
            "kind": "indirect",
            "fr": "12941",
            "zh": "487597",
            "eng": "36949"
          },
          {
            "kind": "indirect",
            "fr": "136314",
            "zh": "672821",
            "eng": "273550"
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "1053877",
            "zh": "2411903",
            "eng": "315862"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "237100",
            "zh": "343785",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "795435",
            "zh": "797300",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10370162",
            "zh": "5995698",
            "eng": "7244636"
          }
        ]
      }
    },
    "se terminer": {
      "display": "se terminer",
      "prepositions": {
        "en": [
          "La compétition se termina en nul. 比赛以平局结束。",
          "Notre conversation se termine toujours en querelle. 我们的对话总是以争吵收场。",
          "La guerre froide se termina en même temps que la chute de l'URSS. 冷战以苏联解体结束。"
        ],
        "par": [
          "se terminer par qqch 以某事结束",
          "Le roman se termine par la mort de l'héroïne. 小说以女主角的死告终。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "835886",
            "zh": "9576701",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465390",
            "zh": "466084",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1086737",
            "zh": "6005574",
            "eng": "326069"
          }
        ],
        "par": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "683184",
            "zh": "813482",
            "eng": ""
          }
        ]
      }
    },
    "se tourner": {
      "display": "se tourner",
      "prepositions": {
        "vers": [
          "se tourner vers qqn 转向某人；向某人求助",
          "Le Japon se tourne vers les pays arabes pour le pétrole. 日本靠阿拉伯国家提供石油。",
          "Il se tourna vers ses amis pour obtenir de l'aide. 他寻求他的朋友的帮助。"
        ]
      },
      "prepositionOrder": [
        "vers"
      ],
      "sources": {
        "vers": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "331055",
            "zh": "333498",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1359166",
            "zh": "842306",
            "eng": "304376"
          }
        ]
      }
    },
    "se transformer": {
      "display": "se transformer",
      "prepositions": {
        "en": [
          "se transformer en qqch 变成某物",
          "Par degrés, leur amitié se transforma en amour. 他和她之间的友谊，渐渐地酝酿成了爱情。",
          "L'eau se transforme en vapeur quand elle est bouillie. 水沸腾后变为蒸汽。",
          "Quand la glace fond, elle se transforme en eau. 冰融了就会化成水。",
          "Lorsque l'eau gèle, elle se transforme en glace. 水结冻后，变成冰。",
          "L'eau bouillante s'évapore et se transforme en gaz. 沸水蒸发成气体。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "552035",
            "zh": "672340",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "483831",
            "zh": "333212",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "426629",
            "zh": "762032",
            "eng": "318316"
          },
          {
            "kind": "indirect",
            "fr": "1118968",
            "zh": "899965",
            "eng": "681016"
          },
          {
            "kind": "indirect",
            "fr": "11262619",
            "zh": "3537860",
            "eng": "4728685"
          }
        ]
      }
    },
    "se tromper": {
      "display": "se tromper",
      "prepositions": {
        "de": [
          "se tromper de qqch 弄错（车、路、日子）"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "se trouver": {
      "display": "se trouver",
      "prepositions": {
        "sur": [
          "Une colombe blanche se trouve sur le toit. 屋顶上有只白鸽。",
          "Tout ce qui se trouve sur le web ne peut pas être trouvé par Google. 不是所有在网络上的东西都能用谷歌搜寻到。",
          "Le chat se trouve sur la table. 猫坐在桌子上。",
          "Le livre se trouve sur la table. 书在桌子上。",
          "Une pomme se trouve sur le bureau. 书桌上有一个苹果。",
          "Les clefs se trouvent sur la table. 钥匙在桌子上。"
        ],
        "dans": [
          "Notre école se trouve dans ce village. 我们的学校在这个村子里。",
          "Mon père se trouve dans sa chambre. 我父亲在他的房间里。",
          "Personne ne se trouve dans la pièce. 没有人在房间里。",
          "Personne ne se trouvait dans la pièce. 房间里没有人。",
          "Ta mère se trouve dans un état critique. 你母亲现在情况危殆。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "457368",
            "zh": "389833",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "458356",
            "zh": "1365915",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8961279",
            "zh": "347218",
            "eng": "3065763"
          },
          {
            "kind": "indirect",
            "fr": "2163937",
            "zh": "2345989",
            "eng": "2163151"
          },
          {
            "kind": "indirect",
            "fr": "897473",
            "zh": "745821",
            "eng": "20566"
          },
          {
            "kind": "indirect",
            "fr": "540820",
            "zh": "349271",
            "eng": "533766"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "3337102",
            "zh": "3148837",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1335659",
            "zh": "861155",
            "eng": "319252"
          },
          {
            "kind": "indirect",
            "fr": "2101603",
            "zh": "871187",
            "eng": "2091154"
          },
          {
            "kind": "indirect",
            "fr": "2101558",
            "zh": "801456",
            "eng": "44238"
          },
          {
            "kind": "indirect",
            "fr": "963822",
            "zh": "874511",
            "eng": "17403"
          }
        ]
      }
    },
    "se vanter": {
      "display": "se vanter",
      "prepositions": {
        "de": [
          "Il se vante de pouvoir parler six langues. 他显摆自己能说6种语言。",
          "Elle se vante toujours d'être une bonne nageuse. 她老是吹嘘自己是个游泳健将。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "133535",
            "zh": "363968",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333365",
            "zh": "333369",
            "eng": ""
          }
        ]
      }
    },
    "se vendre": {
      "display": "se vendre",
      "prepositions": {
        "à": [
          "Les œufs se vendent à la douzaine. 蛋是按打卖的。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "1339346",
            "zh": "8897383",
            "eng": "325219"
          }
        ]
      }
    },
    "sembler": {
      "display": "sembler",
      "prepositions": {
        "en": [
          "Le ciel semble en colère. 天空风云骤起。",
          "Est-ce que je semble en amour quand je parle ? 听起来像是我恋爱了吗？"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "337021",
            "zh": "336885",
            "eng": "18143"
          },
          {
            "kind": "indirect",
            "fr": "394643",
            "zh": "887853",
            "eng": "394638"
          }
        ]
      }
    },
    "sentir": {
      "display": "sentir",
      "prepositions": {
        "en": [
          "Je me sens en forme. 我觉得精神很好。",
          "Je me sens en forme ce matin. 我今天早晨感觉良好。",
          "Je me sens en effet assez bien. 我感觉非常棒。",
          "Je me sens en sécurité avec lui. 我和他在一起时很有安全感。",
          "Je ne me sentais jamais bien en présence de mon père. 我在我爸的公司一直感觉不自在。",
          "Il n'y a aucune raison pour que tu te sentes en infériorité à l'égard de quiconque. 你没理由觉得自己比别人差的。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "4682074",
            "zh": "826231",
            "eng": "33524"
          },
          {
            "kind": "indirect",
            "fr": "10686274",
            "zh": "5670803",
            "eng": "242203"
          },
          {
            "kind": "indirect",
            "fr": "2069644",
            "zh": "2370690",
            "eng": "1887209"
          },
          {
            "kind": "indirect",
            "fr": "1815343",
            "zh": "358174",
            "eng": "284444"
          },
          {
            "kind": "indirect",
            "fr": "1972740",
            "zh": "1516456",
            "eng": "261531"
          },
          {
            "kind": "indirect",
            "fr": "4426388",
            "zh": "2474946",
            "eng": "69892"
          }
        ]
      }
    },
    "serrer": {
      "display": "serrer",
      "prepositions": {
        "dans": [
          "J'ai besoin que quelqu'un me serre dans ses bras et me dise que tout ira bien. 我需要某人抱着我并对我说一切会顺利的。",
          "Les économies d'énergie peuvent réduire les émissions de gaz à effet de serre dans l'atmosphère. 节约能源可减少温室气体排出到大气层。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "757999",
            "zh": "757998",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12715187",
            "zh": "2121574",
            "eng": ""
          }
        ]
      }
    },
    "servir": {
      "display": "servir",
      "prepositions": {
        "à": [
          "servir à faire qqch 用来做某事",
          "Ça ne sert à rien de pleurer. 哭是无济于事的。",
          "Ça ne sert à rien de réessayer. 再试也无济于事了。",
          "Ça ne sert à rien de lui redemander. 再问他也没用。",
          "Cela ne sert à rien de lui donner des conseils. 给他任何的忠告都是没有用的。",
          "Il ne sert à rien de pleurer sur le lait versé. 为溅出的牛奶哭也没用。",
          "Ça ne sert plus à rien de continuer à réfléchir. 再思考也没用了。"
        ],
        "de": [
          "servir de qqch 充当某物",
          "Je ne leur sers pas de thé. 我不给他们茶喝。",
          "Vous pouvez vous servir du gâteau. 你自己拿蛋糕吃吧。",
          "Puis-je me servir de ton téléphone ? 我能用你的电话吗？",
          "Le petit déjeuner est servi de 7 à 9 heures. 早餐时间在七点到九点。",
          "J'ai aménagé le garage pour m'en servir d'atelier. 我把车库改造成工作室使用。",
          "À quoi sert de lire, puisqu'à vingt-deux ans, on sait déjà tout. 反正到了二十二岁什么都知道了，看书还有什么用呢。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "9251",
            "zh": "429073",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13588",
            "zh": "333210",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "504436",
            "zh": "796901",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "353420",
            "zh": "353507",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "400502",
            "zh": "765989",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3301",
            "zh": "334713",
            "eng": ""
          }
        ],
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1944652",
            "zh": "9953342",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "332627",
            "zh": "332593",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "896866",
            "zh": "733154",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "740018",
            "zh": "2437269",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "128283",
            "zh": "389398",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "841809",
            "zh": "842114",
            "eng": ""
          }
        ]
      },
      "notes": {
        "de": "servir de qqch = 充当某物；servir à = 用来做…",
        "à": "servir à = 用来做…；servir de = 充当…"
      }
    },
    "siffler": {
      "display": "siffler",
      "prepositions": {
        "en": [
          "Il sifflait tout en marchant. 他边走边吹口哨。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "4036223",
            "zh": "832975",
            "eng": "491545"
          }
        ]
      }
    },
    "signifier": {
      "display": "signifier",
      "prepositions": {
        "pour": [
          "Ton amitié signifie beaucoup pour moi. 你的友谊对我来说意义重大。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "indirect",
            "fr": "372982",
            "zh": "907876",
            "eng": "503856"
          }
        ]
      }
    },
    "situer": {
      "display": "situer",
      "prepositions": {
        "en": [
          "Greifswald est située en Poméranie occidentale. 格赖夫斯瓦尔德位于前波美拉尼亚。",
          "Cet hôtel est bien situé en ce qui concerne les transports en commun. 这间酒店的交通位置很方便。"
        ],
        "sur": [
          "Londres, la capitale de l'Angleterre, est située sur la Tamise. 英国首都伦敦在泰晤士河畔。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "866873",
            "zh": "867093",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "749815",
            "zh": "351825",
            "eng": "60476"
          }
        ],
        "sur": [
          {
            "kind": "direct",
            "fr": "426196",
            "zh": "334130",
            "eng": ""
          }
        ]
      }
    },
    "skier": {
      "display": "skier",
      "prepositions": {
        "avec": [
          "J'aimerais aller skier avec elle. 我想和她去滑雪。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "direct",
            "fr": "127786",
            "zh": "334617",
            "eng": ""
          }
        ]
      }
    },
    "sombrer": {
      "display": "sombrer",
      "prepositions": {
        "dans": [
          "Il sombra dans un violent accès de colère contre moi. 他向我大发脾气。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "839079",
            "zh": "371736",
            "eng": ""
          }
        ]
      }
    },
    "songer": {
      "display": "songer",
      "prepositions": {
        "à": [
          "songer à qqch 考虑；想到",
          "Avez-vous songé à devenir infirmière ? 你曾经想过当个护士吗?",
          "Je ne veux même pas songer à ce qui pourrait arriver. 我甚至不想去想会发生什么。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "15004",
            "zh": "760741",
            "eng": "20981"
          },
          {
            "kind": "indirect",
            "fr": "2420874",
            "zh": "5401619",
            "eng": "2033978"
          }
        ]
      }
    },
    "sonner": {
      "display": "sonner",
      "prepositions": {
        "à": [
          "On a sonné à la porte. 门铃儿响了。",
          "Qui sonne à la porte ? 谁在按门铃？",
          "La cloche sonne à midi. 正午时分钟声响起。",
          "La cloche sonne à 8 heures. 铃声在八点钟响起。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "427109",
            "zh": "1411726",
            "eng": "426951"
          },
          {
            "kind": "indirect",
            "fr": "6829164",
            "zh": "13109409",
            "eng": "6829827"
          },
          {
            "kind": "indirect",
            "fr": "4086493",
            "zh": "780370",
            "eng": "33870"
          },
          {
            "kind": "indirect",
            "fr": "331223",
            "zh": "836138",
            "eng": "49933"
          }
        ]
      }
    },
    "sortir": {
      "display": "sortir",
      "prepositions": {
        "de": [
          "sortir de qqch 从某处出来",
          "Tu es sorti de cours ? 下课了吗？",
          "Ils sont sortis de très bonne heure. 他们很早就出去了。",
          "En sortant de la gare, je vis un homme. 离开车站的时候，我看到一个男人。",
          "J'ai dû me démener pour sortir du métro. 我挣扎着挤出地铁。",
          "C'est comme cela qu'il s'est sorti du danger. 他就是那样脱离危险的。",
          "Le criminel sortit de la maison les mains en l'air. 犯人手举在空中走出了房子。"
        ],
        "avec": [
          "sortir avec qqn 与某人交往",
          "Peux-tu t'en sortir avec ta rémunération ? 你现在的薪水够用吗？",
          "Tom sort avec Jane depuis presque un an maintenant. 汤姆和简交往已经有一年。",
          "Mes parents ne me laissaient pas sortir avec les garçons. 我父母不让我和男生约会。",
          "Il n'a pas honte de dire qu'il ne sortira jamais avec une planche à pain. 他不知羞耻地说他绝不会跟一个飞机场谈恋爱。",
          "Je sors avec Lisa ce soir. 我今晚要和丽莎出去。",
          "Elle veut sortir avec lui. 她想和他约会。"
        ]
      },
      "prepositionOrder": [
        "de",
        "avec"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "2298604",
            "zh": "2298602",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "705177",
            "zh": "705584",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "584520",
            "zh": "1330028",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129297",
            "zh": "350057",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335445",
            "zh": "335508",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "391752",
            "zh": "1313796",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "337400",
            "zh": "348895",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "180907",
            "zh": "345317",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "413813",
            "zh": "464776",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "706442",
            "zh": "706448",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "8395",
            "zh": "861160",
            "eng": "243257"
          },
          {
            "kind": "indirect",
            "fr": "1347272",
            "zh": "1928641",
            "eng": "887514"
          }
        ]
      }
    },
    "soucier": {
      "display": "soucier",
      "prepositions": {
        "de": [
          "Ne te soucie pas de cela. 不要担心它。",
          "Tu te soucies trop de ton poids. 你太担心你的体重了。",
          "Ne te soucie pas de moi. 不要担心我。",
          "Ne te soucie pas du passé. 不要担心过去。",
          "Ne te soucie pas de ce que les autres disent. 别介意别人所说的话。",
          "J'étais trop fatiguée pour me soucier d'autre chose que de mon lit. 我累得只想躺在床上。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1197193",
            "zh": "825933",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1801959",
            "zh": "2437249",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1123150",
            "zh": "793248",
            "eng": "25528"
          },
          {
            "kind": "indirect",
            "fr": "1339342",
            "zh": "796829",
            "eng": "23628"
          },
          {
            "kind": "indirect",
            "fr": "1359105",
            "zh": "431622",
            "eng": "274698"
          },
          {
            "kind": "indirect",
            "fr": "134733",
            "zh": "1869879",
            "eng": "317787"
          }
        ]
      }
    },
    "souffler": {
      "display": "souffler",
      "prepositions": {
        "sur": [
          "Il fit souffler sur les dés par sa petite amie, pour lui porter chance, avant qu'il les lance. 他掷骰子之前让他的女友在上面吹气来给他带来好运。"
        ],
        "dans": [
          "Par la fenêtre ouverte un vent glacial soufflait dans la chambre. 一股寒风从敞开着的窗口吹入屋内。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "811367",
            "zh": "812306",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "2910694",
            "zh": "10626693",
            "eng": ""
          }
        ]
      }
    },
    "souffrir": {
      "display": "souffrir",
      "prepositions": {
        "de": [
          "souffrir de qqch 患某病；受某事之苦",
          "Il souffre d'un rhume. 他患了感冒。",
          "Je souffre de maux de ventre. 我受胃痛折磨。",
          "Elle souffre d'une maladie grave. 她患了一种严重疾病。",
          "Ma mère souffre souvent de maux de tête. 我的母亲经常被头痛困扰。",
          "Ils souffrent de difficultés financières. 他们正在经受财政困难。",
          "Maintes personnes souffrent de la faim dans le monde. 世界上许多人在挨饿。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "133295",
            "zh": "1325254",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "839057",
            "zh": "344395",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "335813",
            "zh": "335902",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7623",
            "zh": "1313971",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "120044",
            "zh": "389431",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "804754",
            "zh": "804795",
            "eng": ""
          }
        ]
      }
    },
    "soulager": {
      "display": "soulager",
      "prepositions": {
        "de": [
          "Je suis soulagé d'entendre cela. 我听到这个很开心。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1112066",
            "zh": "763741",
            "eng": "254847"
          }
        ]
      }
    },
    "soumettre": {
      "display": "soumettre",
      "prepositions": {
        "à": [
          "Ne te soumets pas à ces exigences. 不要屈服于这些要求。",
          "Tout est soumis aux lois de la nature. 一切合乎自然法则。",
          "Nous ne devons pas ignorer la souffrance des populations soumises à une mauvaise gestion. 我们不能忽视暴政之下饱受苦难的人民。",
          "Avant de pouvoir embarquer dans l'avion, vous devrez vous soumettre aux contrôles de sécurité de l'aéroport. 你要通过了机场的安全检查才能登机。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "799703",
            "zh": "798320",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "237132",
            "zh": "367907",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1732730",
            "zh": "13901030",
            "eng": "636331"
          },
          {
            "kind": "indirect",
            "fr": "1017202",
            "zh": "1016605",
            "eng": "1016242"
          }
        ]
      }
    },
    "soupçonner": {
      "display": "soupçonner",
      "prepositions": {
        "de": [
          "Il me soupçonne de mentir. 他怀疑我说谎。",
          "On le soupçonnait d'être un espion. 人们怀疑他是间谍。",
          "Je les soupçonne de couper la bière avec de l'eau dans ce bistro. 我怀疑那家酒馆的啤酒兑水了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "901531",
            "zh": "1225691",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130956",
            "zh": "1371220",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1337008",
            "zh": "7773128",
            "eng": "68645"
          }
        ]
      }
    },
    "sourire": {
      "display": "sourire",
      "prepositions": {
        "à": [
          "Elle sourit à son bébé. 她对着她的孩子微笑。"
        ],
        "avec": [
          "Il me sourit avec gratitude. 他给了我一个认可的微笑。"
        ]
      },
      "prepositionOrder": [
        "à",
        "avec"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "528838",
            "zh": "842488",
            "eng": "512662"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "805528",
            "zh": "805224",
            "eng": ""
          }
        ]
      }
    },
    "soutenir": {
      "display": "soutenir",
      "prepositions": {
        "en": [
          "Nous avons promis de le soutenir en cas de problèmes. 我们承诺万一他有麻烦的时候支持他。"
        ],
        "par": [
          "Le Japon a une économie soutenue par des salariés qui travaillent dur dans les grandes villes. 日本的经济是由一群勤奋工作的大城市上班族支撑起的。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "1199042",
            "zh": "781133",
            "eng": "243458"
          }
        ],
        "par": [
          {
            "kind": "indirect",
            "fr": "129745",
            "zh": "1458934",
            "eng": "281575"
          }
        ]
      }
    },
    "souvenir": {
      "display": "souvenir",
      "prepositions": {
        "de": [
          "Je me souviens encore de son nom. 我仍然记得他的名字。",
          "Je ne me souviens pas de ton nom. 我不记得你的名字了。",
          "Tu te souviens encore de mon nom ? 你还记得我的名字吗 ?",
          "Je me souviens d'avoir vu la reine. 我记得见过皇后。",
          "Je me souviens de la première fois. 我记得第一次。",
          "Je me souviens d'avoir regardé ce film. 我记得看过这部电影。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "6542",
            "zh": "651241",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "465151",
            "zh": "466283",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13238616",
            "zh": "13235752",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "136063",
            "zh": "421329",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "338715",
            "zh": "794229",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "338459",
            "zh": "745901",
            "eng": ""
          }
        ]
      }
    },
    "spécialiser": {
      "display": "spécialiser",
      "prepositions": {
        "en": [
          "Je me suis spécialisée en philosophie, à l'université. 我在大学主修哲学。",
          "Je suis spécialisé en Sciences Économiques. 我专攻经济学。",
          "Elle est spécialisée en littérature française. 她的专业是法国的文学"
        ],
        "dans": [
          "Cet éditeur est spécialisé dans la littérature pour enfants. 这家出版社专门出版儿童文学。"
        ]
      },
      "prepositionOrder": [
        "en",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "1075422",
            "zh": "795322",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1541208",
            "zh": "337260",
            "eng": "238003"
          },
          {
            "kind": "indirect",
            "fr": "1564200",
            "zh": "340493",
            "eng": "312130"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "11381159",
            "zh": "3149460",
            "eng": "7885822"
          }
        ]
      }
    },
    "subir": {
      "display": "subir",
      "prepositions": {
        "de": [
          "L'entreprise a subi d'énormes dégâts. 公司遭受了巨大的破坏。",
          "L'entreprise a subi de grosses pertes. 公司遭受了巨大的损失。",
          "La maison n'a pas subi beaucoup de dégâts car le feu a été rapidement étouffé. 火很快便被扑熄了，房子只受到轻微损坏。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "414105",
            "zh": "754032",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "754016",
            "zh": "754025",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "585135",
            "zh": "373199",
            "eng": "23876"
          }
        ]
      }
    },
    "submerger": {
      "display": "submerger",
      "prepositions": {
        "par": [
          "Le stade fut submergé par les fans de baseball. 体育场挤满了棒球迷。",
          "Il a été submergé par le nombre. 他被数字征服了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "336737",
            "zh": "336623",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "132727",
            "zh": "342689",
            "eng": "300225"
          }
        ]
      }
    },
    "subvenir": {
      "display": "subvenir",
      "prepositions": {
        "à": [
          "À ton âge, tu devrais subvenir à tes besoins. 你这个年纪，应该要自力更生了。",
          "Que fait ce monsieur, pour subvenir à ses besoins ? 那位先生靠什么生活？",
          "J'ai travaillé dur pour subvenir aux besoins de ma famille. 我努力工作养家糊口。",
          "Tu es maintenant assez vieux pour subvenir à tes propres besoins. 你已经到了可以自给自足的年纪了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "474187",
            "zh": "1323748",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "2162156",
            "zh": "7768241",
            "eng": "569325"
          },
          {
            "kind": "indirect",
            "fr": "12038541",
            "zh": "357930",
            "eng": "256523"
          },
          {
            "kind": "indirect",
            "fr": "397258",
            "zh": "1179281",
            "eng": "16415"
          }
        ]
      }
    },
    "succéder": {
      "display": "succéder",
      "prepositions": {
        "à": [
          "succéder à qqn 接替某人"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "suffire": {
      "display": "suffire",
      "prepositions": {
        "à": [
          "suffire à qqn/qqch 对某人／某事够用",
          "Ne jamais attribuer à la malveillance ce que la bêtise suffit à expliquer. 能解释为愚蠢的，就不要解释为恶意。"
        ],
        "de": [
          "Il suffit de me croire sur parole. 请相信我的话。",
          "Si vous voulez savoir, il suffit de demander. 如果您想知道，直接问就是了。",
          "Il ne suffit pas de faire le bien, il faut encore le bien faire. 做好事是不够的，还必须做得很好。",
          "Il suffit d'une fois. 一次就够了。",
          "Il suffit de demander à Tom. 问问汤姆吧。",
          "Il ne suffit pas d'être riche. 有钱还不够。"
        ],
        "pour": [
          "Ça suffit pour aujourd'hui, je suis fatigué. 今天这样就够了, 我累了。",
          "Ça suffit pour aujourd'hui. 我们今天就到这里吧。",
          "Ce repas suffit pour trois. 这饭足够三个人吃。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de",
        "pour"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "12419784",
            "zh": "12419792",
            "eng": "2570990"
          }
        ],
        "de": [
          {
            "kind": "direct",
            "fr": "801223",
            "zh": "798264",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4835522",
            "zh": "7781704",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "829274",
            "zh": "828685",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11171641",
            "zh": "10266778",
            "eng": "3734113"
          },
          {
            "kind": "indirect",
            "fr": "9254341",
            "zh": "2338654",
            "eng": "2235837"
          },
          {
            "kind": "indirect",
            "fr": "9857074",
            "zh": "5780620",
            "eng": "3734115"
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "837759",
            "zh": "759557",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "810234",
            "zh": "10617430",
            "eng": "242641"
          },
          {
            "kind": "indirect",
            "fr": "895035",
            "zh": "1397137",
            "eng": "72682"
          }
        ]
      }
    },
    "suggérer": {
      "display": "suggérer",
      "prepositions": {
        "de": [
          "Elle suggéra de faire une fête. 她建议搞一个派对。",
          "Mon père a suggéré d'aller au cinéma cet après-midi. 爸爸建议今天下午去看电影。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "139605",
            "zh": "352050",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "134872",
            "zh": "780368",
            "eng": "319137"
          }
        ]
      }
    },
    "suicider": {
      "display": "suicider",
      "prepositions": {
        "en": [
          "Il s'est suicidé en ingérant du poison. 他服毒自杀了。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "784544",
            "zh": "762134",
            "eng": ""
          }
        ]
      }
    },
    "suivre": {
      "display": "suivre",
      "prepositions": {
        "de": [
          "suivre qqn des yeux 用目光追随某人"
        ],
        "sur": [
          "suivre qqch sur une carte 在地图上跟踪某物"
        ],
        "avec": [
          "suivre qqch avec attention 密切关注某事"
        ]
      },
      "prepositionOrder": [
        "de",
        "sur",
        "avec"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          }
        ],
        "sur": [
          {
            "kind": "curated",
            "authored": true
          }
        ],
        "avec": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      },
      "nounCollocations": [
        {
          "text": "suivre un cours 上一门课",
          "collocation": "suivre un cours",
          "chinese": "上一门课",
          "source": "authored"
        }
      ]
    },
    "supplier": {
      "display": "supplier",
      "prepositions": {
        "de": [
          "Il me supplia de rester. 他恳求我留下来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "566247",
            "zh": "663260",
            "eng": ""
          }
        ]
      }
    },
    "supporter": {
      "display": "supporter",
      "prepositions": {
        "de": [
          "Je ne supportais pas de la regarder. 我无法忍受看着她。",
          "Je ne supporte pas de voir des animaux être tourmentés. 我受不了看着动物被虐待的感觉。",
          "Je ne pouvais pas supporter de le regarder. 我不能忍受就这样看着它。",
          "Je ne supporte pas de voir des animaux souffrir. 我无法忍受看着动物受苦。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "335987",
            "zh": "336046",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4452762",
            "zh": "344843",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1350552",
            "zh": "846318",
            "eng": "383861"
          },
          {
            "kind": "indirect",
            "fr": "7967392",
            "zh": "10744884",
            "eng": "7863755"
          }
        ]
      }
    },
    "surfer": {
      "display": "surfer",
      "prepositions": {
        "sur": [
          "Elle passe carrément trop de temps à surfer sur le web. 她花实在太多的时间在网上冲浪。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "948151",
            "zh": "948096",
            "eng": ""
          }
        ]
      }
    },
    "surgir": {
      "display": "surgir",
      "prepositions": {
        "de": [
          "Un chat a surgi de sous le bureau. 一只猫从桌底下出来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "822394",
            "zh": "4641835",
            "eng": "387384"
          }
        ]
      }
    },
    "surprendre": {
      "display": "surprendre",
      "prepositions": {
        "en": [
          "Je l'ai surpris en train de voler de l'argent. 我抓到他偷钱。"
        ],
        "par": [
          "Je fus surpris par sa persévérance. 我对他的坚持感到很惊讶。",
          "J'ai été surpris par cette nouvelle inattendue. 我对这个始料不及的消息感到很惊讶。",
          "Je fus surpris par la nouvelle. 我听到这个消息很吃惊。",
          "Tout le voisinage fut surpris par cette nouvelle. 整个小区对这个消息很惊讶。",
          "J'ai été surpris par la nouvelle de son décès soudain. 他突然过世的消息让我感到惊讶。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "129979",
            "zh": "848977",
            "eng": "283552"
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "796645",
            "zh": "796704",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12133",
            "zh": "336619",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "887641",
            "zh": "332632",
            "eng": "45186"
          },
          {
            "kind": "indirect",
            "fr": "336933",
            "zh": "336694",
            "eng": "18661"
          },
          {
            "kind": "indirect",
            "fr": "127730",
            "zh": "431600",
            "eng": "260734"
          }
        ]
      }
    },
    "survenir": {
      "display": "survenir",
      "prepositions": {
        "à": [
          "Cet accident est survenu à cause de ma négligence. 由于我的疏忽，事故发生了。",
          "Un tremblement de terre peut survenir à tout moment. 地震随时都可能发生。",
          "D'après certains savants, un séisme majeur pourrait maintenant survenir à tout moment. 据一些学者称，现在可能随时发生一场特大地震。",
          "Ça peut survenir à tout moment. 它随时有可能发生。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "12148",
            "zh": "400994",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129310",
            "zh": "444789",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1066721",
            "zh": "796126",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "463528",
            "zh": "483956",
            "eng": "42440"
          }
        ]
      }
    },
    "survivre": {
      "display": "survivre",
      "prepositions": {
        "à": [
          "survivre à qqch 在某事中幸存",
          "Peu survivent à cette maladie. 很少人能从这种疾病下活下来。",
          "Son entreprise ne survécut pas à la crise. 他的公司没有从危机中幸存。",
          "Une seule personne a survécu à l'accident. 只有一人幸免于难。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "335811",
            "zh": "335900",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1533611",
            "zh": "5496290",
            "eng": "1530354"
          },
          {
            "kind": "indirect",
            "fr": "2041985",
            "zh": "796958",
            "eng": "47182"
          }
        ]
      }
    },
    "suspecter": {
      "display": "suspecter",
      "prepositions": {
        "de": [
          "Nous l'avons suspecté de mentir. 我们怀疑他说谎了。",
          "Il était suspecté d'être un espion. 人们怀疑他是间谍。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1339135",
            "zh": "8656963",
            "eng": "249240"
          },
          {
            "kind": "indirect",
            "fr": "659033",
            "zh": "1371220",
            "eng": "290311"
          }
        ]
      }
    },
    "suspendre": {
      "display": "suspendre",
      "prepositions": {
        "à": [
          "La lampe était suspendue à la branche d'un arbre. 灯笼在树枝上吊着。",
          "Il était surpris de voir que le chef-d'œuvre du grand artiste était suspendu au mur à l'envers. 他实在有点不能相信，堂堂一个大画家的杰作，居然会被上下倒转地挂在墙上。",
          "Suspends ton manteau au crochet. 把你的外套挂在钩子上。"
        ],
        "dans": [
          "La Terre n'est rien d'autre qu'une sphère suspendue dans l'espace. 地球只不过是悬浮在太空中的一个球体。"
        ]
      },
      "prepositionOrder": [
        "à",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "340287",
            "zh": "1448906",
            "eng": "29713"
          },
          {
            "kind": "indirect",
            "fr": "1300737",
            "zh": "522202",
            "eng": "49668"
          },
          {
            "kind": "indirect",
            "fr": "583267",
            "zh": "838520",
            "eng": "21245"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "1333258",
            "zh": "701215",
            "eng": ""
          }
        ]
      }
    },
    "sympathiser": {
      "display": "sympathiser",
      "prepositions": {
        "avec": [
          "Nous avons sympathisé avec eux. 我们与他们交朋友了。"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "indirect",
            "fr": "4912477",
            "zh": "842431",
            "eng": "249246"
          }
        ]
      }
    },
    "séjourner": {
      "display": "séjourner",
      "prepositions": {
        "dans": [
          "Il séjourna dans un hôtel bon marché. 他住进了一家很便宜的旅馆。",
          "Avez-vous déjà séjourné dans un pays étranger ? 你有没有去过外国？",
          "Je veux séjourner dans un hôtel près de l'aéroport. 我想住在机场附近的旅馆里。",
          "Je prévois de séjourner dans un hôtel cinq étoiles. 我打算去五星级酒店住。"
        ],
        "chez": [
          "Je séjourne chez un ami. 我和一位朋友住在一起。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "chez"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "1774318",
            "zh": "2298472",
            "eng": "1773701"
          },
          {
            "kind": "indirect",
            "fr": "570278",
            "zh": "403454",
            "eng": "69531"
          },
          {
            "kind": "indirect",
            "fr": "1243795",
            "zh": "1241329",
            "eng": "1242858"
          },
          {
            "kind": "indirect",
            "fr": "5927276",
            "zh": "13894734",
            "eng": "1398459"
          }
        ],
        "chez": [
          {
            "kind": "indirect",
            "fr": "127978",
            "zh": "917836",
            "eng": "262047"
          }
        ]
      }
    },
    "séparer": {
      "display": "séparer",
      "prepositions": {
        "de": [
          "Ma femme veut que je me sépare de ce joli vieux chapeau. 我老婆想让我把那顶顶好的老帽子给扔掉。",
          "Il vit séparé de sa femme. 他和老婆分居。",
          "J'ai l'intention de me séparer d'elle. 我打算与她分手。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "7760",
            "zh": "10514103",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "132094",
            "zh": "346102",
            "eng": "296777"
          },
          {
            "kind": "indirect",
            "fr": "394814",
            "zh": "881904",
            "eng": "394802"
          }
        ]
      }
    },
    "tacher": {
      "display": "tacher",
      "prepositions": {
        "de": [
          "Sa chemise était tachée de sauce. 他的衬衫被酱汁弄脏了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "786320",
            "zh": "787380",
            "eng": ""
          }
        ]
      }
    },
    "taper": {
      "display": "taper",
      "prepositions": {
        "sur": [
          "Le soleil d'été tapait sur nous. 夏日的阳光照在我们身上。",
          "Je sentis quelqu'un me taper sur l'épaule. 我感觉有人拍了拍我的肩。",
          "C'est une pagaille totale, et ça me tape sur les nerfs. 这完全一团乱，让我心烦意乱。"
        ],
        "dans": [
          "Il tapa dans le ballon. 他踢了那颗球。",
          "Fred a tapé dans la balle. 佛瑞德踢了一球。"
        ]
      },
      "prepositionOrder": [
        "sur",
        "dans"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "336744",
            "zh": "336630",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "496880",
            "zh": "345932",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3547",
            "zh": "13117848",
            "eng": "1727"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "131366",
            "zh": "1239336",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "13261",
            "zh": "824617",
            "eng": "34091"
          }
        ]
      }
    },
    "tarder": {
      "display": "tarder",
      "prepositions": {
        "à": [
          "tarder à faire qqch 迟迟不做某事",
          "Vous vous mettrez sans tarder à l'aimer. 你很快就会开始喜欢他的。",
          "Nous ne tarderons pas à connaître la vérité. 真相很快就会水落石出了。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "499067",
            "zh": "346703",
            "eng": "52134"
          },
          {
            "kind": "indirect",
            "fr": "10971247",
            "zh": "339275",
            "eng": "32477"
          }
        ]
      }
    },
    "tendre": {
      "display": "tendre",
      "prepositions": {
        "à": [
          "Cela tend à prouver que vous êtes un menteur. 这正可以说明您是个骗子。",
          "Les fruits tendent à rapidement se décomposer. 水果一般不久就会腐烂。"
        ],
        "vers": [
          "tendre vers qqch 趋向于某事"
        ]
      },
      "prepositionOrder": [
        "à",
        "vers"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "12335",
            "zh": "714798",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1046712",
            "zh": "1737865",
            "eng": ""
          }
        ],
        "vers": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "tenir": {
      "display": "tenir",
      "prepositions": {
        "à": [
          "tenir à qqch / à faire qqch 重视某事；坚持要做某事",
          "Ils nous tiendront au courant. 他们会让我们知道发生了什么。"
        ],
        "de": [
          "tenir de qqn 长得像某人；秉性像某人",
          "Elle tient de son père. 她像她爸爸。",
          "Demain, les cours habituels n'auront pas lieu, compte tenu de la préparation pour la rencontre d'athlétisme. 明天是运动会的排练，没有往常的课程。"
        ],
        "pour": [
          "Il tient pour principe de ne jamais parler des autres en mal. 他坚持着从不说别人坏话的原则。",
          "Nous le tenons pour honnête. 我们认为他诚实。",
          "Il tient pour principe de faire une promenade chaque matin. 他给自己定下每天早上散步的规矩。"
        ],
        "dans": [
          "25 personnes tiennent dans ce minibus. 这辆迷你巴士能容纳25个人。"
        ]
      },
      "prepositionOrder": [
        "à",
        "de",
        "pour",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "6966299",
            "zh": "5739306",
            "eng": "3131488"
          }
        ],
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "338172",
            "zh": "688791",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10774266",
            "zh": "6484853",
            "eng": "533370"
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "465663",
            "zh": "465889",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1460760",
            "zh": "6568345",
            "eng": "1458771"
          },
          {
            "kind": "indirect",
            "fr": "1051048",
            "zh": "1394902",
            "eng": "303879"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "475062",
            "zh": "476236",
            "eng": ""
          }
        ]
      },
      "notes": {
        "de": "tenir de qqn = 长得／性格像某人",
        "à": "tenir à = 重视／坚持；tenir de = 像（某人）"
      },
      "nounCollocations": [
        {
          "text": "tenir compte de qqch 考虑到某事",
          "collocation": "tenir compte de qqch",
          "chinese": "考虑到某事",
          "source": "authored"
        },
        {
          "text": "tenir parole 守信用",
          "collocation": "tenir parole",
          "chinese": "守信用",
          "source": "authored"
        }
      ]
    },
    "tenter": {
      "display": "tenter",
      "prepositions": {
        "de": [
          "Elle a tenté de se suicider. 她企图自杀。",
          "Le chien tenta de mordre ma main. 小狗狂咬我的手。",
          "Nous avons tenté de le persuader. 我们试着劝了他。",
          "Pourquoi as-tu tenté de t'enfuir ? 为什么你企图逃走？",
          "Le vieil homme tenta de nager 5 kilomètres. 老人试图游5公里。",
          "Elle a tenté de le persuader de se rendre à la réunion. 她试图说服他来参加会议。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "134413",
            "zh": "397543",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "332197",
            "zh": "335872",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "390126",
            "zh": "711630",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474818",
            "zh": "476596",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "336144",
            "zh": "332826",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1390378",
            "zh": "9972418",
            "eng": ""
          }
        ]
      }
    },
    "terminer": {
      "display": "terminer",
      "prepositions": {
        "en": [
          "La guerre s'est terminée en 1945. 这场战争结束于1945年。",
          "La seconde Guerre Mondiale s'est terminée en 1945. 第二次世界大战结束于1945年。"
        ],
        "par": [
          "terminer par qqch 以某事收尾",
          "La rencontre s'est terminée par un match nul. 比赛以平局结束。"
        ],
        "avec": [
          "Quand tu auras terminé avec le livre, remets-le là où tu l'as trouvé. 你一用完了这本书，就把它放回原来找到的地方。",
          "Elle en a terminé avec son travail avant cinq heures. 她在五点钟前做完了她的工作。"
        ]
      },
      "prepositionOrder": [
        "en",
        "par",
        "avec"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "139089",
            "zh": "10696130",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799828",
            "zh": "798293",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "10719337",
            "zh": "9576701",
            "eng": "10455342"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "838865",
            "zh": "838876",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "817150",
            "zh": "802126",
            "eng": "310191"
          }
        ]
      }
    },
    "tirer": {
      "display": "tirer",
      "prepositions": {
        "sur": [
          "tirer sur qqn 向某人开枪",
          "Le chasseur a tiré sur le cerf. 猎人射了鹿。",
          "Il ne put se résigner à tirer sur le cerf. 他无法让自己射鹿。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "413797",
            "zh": "464839",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "413811",
            "zh": "464802",
            "eng": ""
          }
        ]
      }
    },
    "tomber": {
      "display": "tomber",
      "prepositions": {
        "en": [
          "tomber en panne 抛锚；出故障",
          "La ville tombe en ruines. 这座城市成为了一片废墟。",
          "La voiture tomba en panne. 汽车发生故障了。",
          "La voiture est tombée en panne. 车抛锚了。",
          "Les feuilles tombent en automne. 秋天树叶会掉落。",
          "Je suis tombé en amour avec toi. 我爱上了你。",
          "Si la voiture tombe en panne, nous marcherons. 如果车子坏了，我们就走路。"
        ],
        "sur": [
          "tomber sur qqn 偶然碰到某人",
          "Je suis tombé sur elle par hasard. 我偶然碰到了她。",
          "Les feuilles tombaient sur le sol. 树叶掉在地上。",
          "Une pomme est tombée sur le sol. 一个苹果落到了地上。",
          "Je suis tombé sur ce livre par hasard. 我偶然发现了那本书。",
          "Je suis tombé sur un vieil ami dans le bus. 我偶然在巴士上碰见了一位旧朋友。",
          "Je suis tombé sur un vieil ami à moi dans le train. 我在火车上碰到老朋友。"
        ],
        "dans": [
          "tomber dans qqch 落入某处",
          "Il est tombé dans le fossé. 他掉进沟里了。",
          "Elle est presque tombée dans les pommes. 她几乎喝晕了。",
          "Tom est tombé dans l'eau glacé de la rivière. 汤姆掉进了冰冷的河水里。",
          "J'ai glissé et je suis tombé dans les escaliers. 我滑了一跤并从楼梯上摔下来。",
          "Ils tombèrent immédiatement dans la conversation. 他们很快就聊起来了。",
          "De nombreuses traditions locales sont tombées dans l'oubli ces dernières années. 近几年，很多当地的传统都衰败了。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "1010085",
            "zh": "9475767",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "336069",
            "zh": "336112",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3641766",
            "zh": "10723681",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "333381",
            "zh": "333388",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "762041",
            "zh": "762029",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "139411",
            "zh": "894354",
            "eng": ""
          }
        ],
        "sur": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "14986",
            "zh": "343368",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "414071",
            "zh": "817370",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "9978334",
            "zh": "6047413",
            "eng": "29639"
          },
          {
            "kind": "indirect",
            "fr": "2290868",
            "zh": "348397",
            "eng": "18133"
          },
          {
            "kind": "indirect",
            "fr": "488988",
            "zh": "343223",
            "eng": "35391"
          },
          {
            "kind": "indirect",
            "fr": "590889",
            "zh": "9797465",
            "eng": "257015"
          }
        ],
        "dans": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "461708",
            "zh": "462070",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1328698",
            "zh": "5949076",
            "eng": "313141"
          },
          {
            "kind": "indirect",
            "fr": "3922765",
            "zh": "4762220",
            "eng": "3922520"
          },
          {
            "kind": "indirect",
            "fr": "12459803",
            "zh": "889133",
            "eng": "256707"
          },
          {
            "kind": "indirect",
            "fr": "7434787",
            "zh": "4760176",
            "eng": "305676"
          },
          {
            "kind": "indirect",
            "fr": "1263856",
            "zh": "2077798",
            "eng": "18642"
          }
        ]
      }
    },
    "toucher": {
      "display": "toucher",
      "prepositions": {
        "à": [
          "toucher à qqch 碰某物；触及某事",
          "La rencontre touche à sa fin. 会议接近了尾声。",
          "Ne touche pas à ça. 别碰它。",
          "Ne touchez pas à la marchandise ! 不要触碰这些货物。",
          "Les vacances touchent à leur fin. 假期快要结束了。",
          "Ne touche pas à mon appareil photo. 不要碰我的相机。",
          "Mon garçon, ne touche pas au miroir. 孩子，不要碰那面镜子！"
        ],
        "par": [
          "Dans l'ensemble, les nobles étaient très peu touchés par l'impôt. 总体来说，贵族受到税收的影响微乎其微。",
          "Plus de 28 millions de Canadiens ont été touchés par des brèches à la vie privée l'année dernière. 去年，超过2800万加拿大人被隐私泄露受到影响了。"
        ]
      },
      "prepositionOrder": [
        "à",
        "par"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "451572",
            "zh": "1328075",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "12316",
            "zh": "819332",
            "eng": "433652"
          },
          {
            "kind": "indirect",
            "fr": "180436",
            "zh": "1238383",
            "eng": "267445"
          },
          {
            "kind": "indirect",
            "fr": "1302855",
            "zh": "747641",
            "eng": "19799"
          },
          {
            "kind": "indirect",
            "fr": "616503",
            "zh": "824590",
            "eng": "410769"
          },
          {
            "kind": "indirect",
            "fr": "11047875",
            "zh": "5455279",
            "eng": "1503467"
          }
        ],
        "par": [
          {
            "kind": "indirect",
            "fr": "407548",
            "zh": "13890569",
            "eng": "407549"
          },
          {
            "kind": "indirect",
            "fr": "8402222",
            "zh": "10192265",
            "eng": "8402223"
          }
        ]
      }
    },
    "tourner": {
      "display": "tourner",
      "prepositions": {
        "à": [
          "Tourne à gauche. 向左转。",
          "Veuillez tourner à droite. 请向右转。",
          "Tournez à droite au carrefour. 在十字路口右转。",
          "Tourne à gauche au coin suivant. 下一个街角左转。",
          "Vous auriez dû tourner à gauche. 您本应左转的。",
          "La discussion a tourné au pugilat. 讨论最后变成了打架。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "465012",
            "zh": "465034",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "482895",
            "zh": "512815",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6046",
            "zh": "389828",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "438666",
            "zh": "746056",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6628471",
            "zh": "10752794",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14998",
            "zh": "2031480",
            "eng": ""
          }
        ]
      }
    },
    "traduire": {
      "display": "traduire",
      "prepositions": {
        "en": [
          "traduire qqch en français 把某物译成（法语）",
          "Pour autant que je sache, ce livre n'a jamais été traduit en japonais. 据我所知，这本书尚未被翻译成日语。",
          "Mon père a traduit en japonais le document français. 爸爸把那份法文的文件翻译成了日文。",
          "Pour autant que je sache, le livre n'a jamais été traduit en japonais. 据我所知，这本书从来没有被翻译成日文。"
        ],
        "dans": [
          "C'est une grande joie de voir ses propres phrases traduites dans une multitude d'autres langues. 看到你自己的句子被翻译成多种语言是一件很开心的事情。"
        ]
      },
      "prepositionOrder": [
        "en",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "8447860",
            "zh": "5550273",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "134857",
            "zh": "617593",
            "eng": "319048"
          },
          {
            "kind": "indirect",
            "fr": "11488334",
            "zh": "471481",
            "eng": "251459"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "4472196",
            "zh": "4456359",
            "eng": "4456136"
          }
        ]
      }
    },
    "traiter": {
      "display": "traiter",
      "prepositions": {
        "de": [
          "Il te traite même d'idiot. 他甚至叫你傻瓜。",
          "Ce livre traite de la vie au Royaume-Uni. 这本书关于生活在英国。",
          "Je n'aime pas être traité de cette manière. 我不喜欢以这种方式被对待。",
          "Nous traiterons de ce problème au chapitre trois. 我们在第三章讨论这个问题。",
          "Ils le traitèrent de lâche. 他们称他胆小鬼。",
          "Qui tu traites de stupide ? 说谁笨蛋呢？！"
        ],
        "avec": [
          "Ces problèmes doivent être traités avec attention. 这些问题必须谨慎处理。",
          "Les directions d'entreprises japonaises doivent apprendre comment traiter avec les travailleurs américains, dit-il. 他说：“日本管理层必须学会如何处理美国员工。”"
        ]
      },
      "prepositionOrder": [
        "de",
        "avec"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1086909",
            "zh": "768216",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "585348",
            "zh": "3011094",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7236",
            "zh": "397114",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1283315",
            "zh": "1329989",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1056617",
            "zh": "842426",
            "eng": "307401"
          },
          {
            "kind": "indirect",
            "fr": "11662491",
            "zh": "4879006",
            "eng": "4870398"
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "1021687",
            "zh": "9501200",
            "eng": "55057"
          },
          {
            "kind": "indirect",
            "fr": "484889",
            "zh": "336860",
            "eng": "73585"
          }
        ]
      }
    },
    "transformer": {
      "display": "transformer",
      "prepositions": {
        "en": [
          "Ce qui était au départ une catastrophe naturelle s'est rapidement transformé en une débâcle causée par l'homme. 起初的天灾迅速演变为了人祸。",
          "La peur s'est rapidement transformée en colère. 恐惧很快变成愤怒。",
          "La méchante sorcière lança un sort sur l'homme et le transforma en insecte. 恶毒的巫婆在男人身上施了咒语，把他变成了一只虫子。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "9184623",
            "zh": "10272653",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11310914",
            "zh": "5949245",
            "eng": "5731056"
          },
          {
            "kind": "indirect",
            "fr": "119771",
            "zh": "13014678",
            "eng": "28613"
          }
        ]
      }
    },
    "transmettre": {
      "display": "transmettre",
      "prepositions": {
        "à": [
          "Transmets mes amitiés à ta famille. 请代我向你的家人问好。",
          "Nous devons transmettre notre culture à la prochaine génération. 我们应当把文化传承到下一代。"
        ],
        "par": [
          "La malaria est transmise par les moustiques. 疟疾是由蚊子传染的。"
        ]
      },
      "prepositionOrder": [
        "à",
        "par"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "240196",
            "zh": "653489",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1052013",
            "zh": "1328170",
            "eng": ""
          }
        ],
        "par": [
          {
            "kind": "direct",
            "fr": "460768",
            "zh": "835724",
            "eng": ""
          }
        ]
      }
    },
    "transporter": {
      "display": "transporter",
      "prepositions": {
        "par": [
          "De nos jours, beaucoup de marchandises sont transportées par avion. 如今很多的货物都由飞机运送。",
          "Les marchandises furent transportées par bateau. 这批货物是由船只运送的。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "14956",
            "zh": "408272",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1838796",
            "zh": "1238385",
            "eng": "267448"
          }
        ]
      }
    },
    "travailler": {
      "display": "travailler",
      "prepositions": {
        "pour": [
          "travailler pour qqn 为某人工作",
          "Je travaille pour toi. 我为你工作。",
          "Il travaille pour elle. 他为她工作。",
          "Ils travaillent pour moi. 他们为我工作。",
          "Elle travaille pour un hôpital. 她为一家医院工作。",
          "Je travaille pour une agence de voyage. 我在旅行社工作.",
          "Je travaille pour une compagnie maritime. 我为一家船运公司工作。"
        ],
        "dans": [
          "Je travaille dans une usine. 我在一家工厂工作。",
          "Je travaille dans une banque. 我在银行工作。",
          "Je travaille dans ce bâtiment. 我在这栋楼里工作。",
          "J'ai déjà travaillé dans un restaurant. 我曾在一家饭店工作过。",
          "Les femmes travaillent dans un restaurant. 女人们在一家餐馆工作。",
          "Amy a travaillé dans la cour samedi dernier. 艾美上星期六在院子里工作。"
        ],
        "avec": [
          "Il travaille avec Marie. 他和玛丽一起工作。",
          "Je travaille avec un Espagnol. 我和一个西班牙人一起工作。",
          "Je travaille avec son copain. 我和她的男朋友在一起上班。",
          "Est-ce que tu travailles avec Tom ? 你跟汤姆一起工作吗？",
          "Je peux travailler avec n'importe qui. 我能跟任何人工作。",
          "Ça a toujours été un plaisir de travailler avec toi. 跟你共事总是很愉快。"
        ],
        "chez": [
          "travailler chez qqn 在某公司／某人处工作"
        ]
      },
      "prepositionOrder": [
        "pour",
        "dans",
        "avec",
        "chez"
      ],
      "sources": {
        "pour": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "754297",
            "zh": "827655",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "133169",
            "zh": "343864",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6815531",
            "zh": "9962513",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "787974",
            "zh": "804917",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "128003",
            "zh": "180706",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "590050",
            "zh": "850111",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "11152594",
            "zh": "2684992",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "663092",
            "zh": "333599",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2941294",
            "zh": "7773207",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7575",
            "zh": "659849",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "477722",
            "zh": "819780",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799440",
            "zh": "798407",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "2319643",
            "zh": "10713306",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "619559",
            "zh": "9955806",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "912734",
            "zh": "6093516",
            "eng": "912735"
          },
          {
            "kind": "indirect",
            "fr": "4099365",
            "zh": "6149012",
            "eng": "3738398"
          },
          {
            "kind": "indirect",
            "fr": "12548312",
            "zh": "6094832",
            "eng": "4979557"
          },
          {
            "kind": "indirect",
            "fr": "8389349",
            "zh": "5780605",
            "eng": "64346"
          }
        ],
        "chez": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "traîner": {
      "display": "traîner",
      "prepositions": {
        "en": [
          "Les élèves américains sont à la traîne en maths. 美国学生的数学跟不上了。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "12723128",
            "zh": "13858600",
            "eng": "67585"
          }
        ]
      }
    },
    "trembler": {
      "display": "trembler",
      "prepositions": {
        "de": [
          "Je tremble de froid. 我的身体被冻得瑟瑟发抖。",
          "Sa voix tremblait de colère. 她的声音因愤怒而颤抖。",
          "Son corps trembla d'excitation. 他兴奋得颤抖了起来。",
          "La scène effroyable le fit trembler de peur. 令人震惊的光景让了他吓得发抖。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "11117630",
            "zh": "8800808",
            "eng": "10657438"
          },
          {
            "kind": "indirect",
            "fr": "1640508",
            "zh": "8877847",
            "eng": "309511"
          },
          {
            "kind": "indirect",
            "fr": "10314288",
            "zh": "984923",
            "eng": "287077"
          },
          {
            "kind": "indirect",
            "fr": "2458909",
            "zh": "1316081",
            "eng": "1316059"
          }
        ]
      }
    },
    "tremper": {
      "display": "tremper",
      "prepositions": {
        "dans": [
          "La pointe de la lance était trempée dans un poison mortel. 矛尖浸在一种致命的毒药里。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "799647",
            "zh": "765679",
            "eng": "764188"
          }
        ]
      }
    },
    "tricher": {
      "display": "tricher",
      "prepositions": {
        "à": [
          "Il a triché à l'examen de biologie. 他在生物学考试时作弊。",
          "C'est mal de tricher aux jeux de cartes. 玩牌作弊是错误的。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "136304",
            "zh": "842475",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "12946",
            "zh": "801348",
            "eng": ""
          }
        ]
      }
    },
    "tromper": {
      "display": "tromper",
      "prepositions": {
        "par": [
          "Ne te laisse pas tromper par son apparence. 不可被她的外表蒙骗。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "1776228",
            "zh": "13240167",
            "eng": "1771909"
          }
        ]
      }
    },
    "trouver": {
      "display": "trouver",
      "prepositions": {
        "dans": [
          "Tu peux le trouver dans n'importe quelle librairie. 你在任何书店都可以买到。",
          "C'est le même parapluie que celui que j'ai trouvé dans le bus. 那把伞跟我在车上发现的是同一把。",
          "Je me trouvais dans les montagnes. 我以前在山里。",
          "Je me trouve dans une situation désespérée. 我处在绝境。",
          "Il advint que nous nous trouvions dans le même train. 我们偶然乘上了同一辆列车。",
          "Je me trouvai dans l'incapacité de me rendre à sa fête d'anniversaire. 我那时没法去他的生日派对。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "139267",
            "zh": "336674",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "136395",
            "zh": "392672",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7469473",
            "zh": "15",
            "eng": "1290"
          },
          {
            "kind": "indirect",
            "fr": "1593931",
            "zh": "5926180",
            "eng": "1486339"
          },
          {
            "kind": "indirect",
            "fr": "1012914",
            "zh": "2031261",
            "eng": "262973"
          },
          {
            "kind": "indirect",
            "fr": "1322341",
            "zh": "1789987",
            "eng": "1318852"
          }
        ]
      }
    },
    "truffer": {
      "display": "truffer",
      "prepositions": {
        "de": [
          "Ce livre est truffé d'erreurs. 这本书充满了错误。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1679274",
            "zh": "868421",
            "eng": "1676686"
          }
        ]
      }
    },
    "trébucher": {
      "display": "trébucher",
      "prepositions": {
        "sur": [
          "J'ai trébuché sur le tapis en entrant dans la maison. 进家门后，我被垫子绊倒了。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "336931",
            "zh": "336692",
            "eng": ""
          }
        ]
      }
    },
    "tuer": {
      "display": "tuer",
      "prepositions": {
        "par": [
          "L'éléphant a été tué par le chasseur. 大象被猎人杀死了。",
          "Il a été tué par ma main. 他为我亲手所杀。",
          "Mon canari a été tué par un chat. 我的金丝雀被一只猫杀死了。"
        ],
        "pour": [
          "Il le tua pour venger son défunt père. 他杀死了他，为死去的父亲报了仇。"
        ],
        "dans": [
          "Elle fut tuée dans un accident automobile. 她死于一场汽车车祸。",
          "Beaucoup de gens ont été tués dans l'accident d'avion. 许多人在飞机失事中丧生了。",
          "Personne n'a été tué dans l'incendie. 没人死在火里。",
          "Son fils a été tué dans un accident de la route. 他的儿子于交通事故去世了",
          "3 ressortissants malais et un Philippin ont été tués dans l'attentat de Davao à Mindanao. 3个马来西亚侨民与一个菲律宾国民在棉兰老岛达沃市爆炸里被炸死了。"
        ],
        "avec": [
          "Elle l'a tué avec un couteau. 她用一把刀杀死了他。"
        ]
      },
      "prepositionOrder": [
        "par",
        "pour",
        "dans",
        "avec"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "423598",
            "zh": "717189",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1249490",
            "zh": "2031401",
            "eng": "1248739"
          },
          {
            "kind": "indirect",
            "fr": "423597",
            "zh": "893039",
            "eng": "250282"
          }
        ],
        "pour": [
          {
            "kind": "direct",
            "fr": "867544",
            "zh": "867545",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "459943",
            "zh": "1589651",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134750",
            "zh": "349682",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10932968",
            "zh": "6127047",
            "eng": "3885012"
          },
          {
            "kind": "indirect",
            "fr": "133789",
            "zh": "2410944",
            "eng": "309539"
          },
          {
            "kind": "indirect",
            "fr": "958071",
            "zh": "958075",
            "eng": "958063"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "1341629",
            "zh": "1409339",
            "eng": ""
          }
        ]
      }
    },
    "tâcher": {
      "display": "tâcher",
      "prepositions": {
        "de": [
          "Vous pourriez au moins tâcher d'être un peu plus poli, même si ça ne vous ressemble pas. 无论你平时怎么大大咧咧的，起码试着稍微礼貌一点吧。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "558575",
            "zh": "13907647",
            "eng": "328585"
          }
        ]
      }
    },
    "téléphoner": {
      "display": "téléphoner",
      "prepositions": {
        "à": [
          "téléphoner à qqn 给某人打电话",
          "Il m'a téléphoné à minuit. 他半夜打了个电话给我。",
          "Je voudrais téléphoner aux parents. 我想打电话给父母。",
          "J'aimerais téléphoner à ma famille. 我想给家人打电话。",
          "C'est Mike qui téléphona à la police. 是迈克打电话报警的。",
          "Elle était déjà allée se coucher quand je lui ai téléphoné à 23 h. 23点我打电话给她的时候，她已经去睡觉了。",
          "Qui a téléphoné à Ann ? 谁打电话给安？"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "15460",
            "zh": "333194",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "428114",
            "zh": "811280",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1421818",
            "zh": "9963202",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8877",
            "zh": "893984",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "8069",
            "zh": "510772",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "10924158",
            "zh": "825902",
            "eng": "276104"
          }
        ]
      }
    },
    "user": {
      "display": "user",
      "prepositions": {
        "de": [
          "On pensait auparavant que seuls les humains pouvaient user du langage. 以前人们以为只有人类才懂得用语言沟通。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "891127",
            "zh": "402466",
            "eng": "270473"
          }
        ]
      }
    },
    "utiliser": {
      "display": "utiliser",
      "prepositions": {
        "pour": [
          "Cet adjectif est utilisé pour qualifier une femme. 这个形容词是用来形容女人的。",
          "Quel critère avez-vous utilisé pour élire cet essai en tant que gagnant ? 您是用了什么标准选定这篇评论胜出呢？",
          "Les ordinateurs sont utilisés pour envoyer des messages par courrier électronique. 电脑被用来通过电子邮件发送信息。",
          "Quelles techniques à la fin as-tu utilisées pour améliorer ton chinois dans un cours laps de temps ? 你到底是用了什么办法在短期内提高了你的汉语？",
          "Les feux tricolores sont utilisés pour réguler le trafic. 交通灯是用来控制交通的。"
        ]
      },
      "prepositionOrder": [
        "pour"
      ],
      "sources": {
        "pour": [
          {
            "kind": "direct",
            "fr": "1182067",
            "zh": "1182065",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3810",
            "zh": "503018",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "539918",
            "zh": "813475",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1169503",
            "zh": "1169500",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "749594",
            "zh": "1570036",
            "eng": "240363"
          }
        ]
      }
    },
    "vacciner": {
      "display": "vacciner",
      "prepositions": {
        "contre": [
          "J'ai été vacciné contre la grippe. 我接种了流感疫苗。"
        ]
      },
      "prepositionOrder": [
        "contre"
      ],
      "sources": {
        "contre": [
          {
            "kind": "direct",
            "fr": "772986",
            "zh": "785831",
            "eng": ""
          }
        ]
      }
    },
    "varier": {
      "display": "varier",
      "prepositions": {
        "de": [
          "Le prix de l'or varie d'un jour à l'autre. 金价每天都在变动。",
          "Les opinions varient d'une personne à l'autre. 观点因人而异。",
          "La durée du temps de sommeil varie vraiment d'une personne à une autre. 睡眠时间的长短可因人而异。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "339752",
            "zh": "349525",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "128666",
            "zh": "1695461",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1164925",
            "zh": "1164921",
            "eng": ""
          }
        ]
      }
    },
    "veiller": {
      "display": "veiller",
      "prepositions": {
        "à": [
          "veiller à qqch 留心；负责某事",
          "Je veillerai à ce que vous ayez une augmentation après la première année. 我将确保你们在第一年后有一个增长。",
          "Je vous en prie, veillez à ne pas casser ce vase. 请小心别打碎了这个花瓶。"
        ],
        "sur": [
          "veiller sur qqn 照看某人"
        ]
      },
      "prepositionOrder": [
        "à",
        "sur"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "10035",
            "zh": "332684",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7427281",
            "zh": "769753",
            "eng": "60045"
          }
        ],
        "sur": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "venir": {
      "display": "venir",
      "prepositions": {
        "de": [
          "venir de faire qqch 刚刚做了某事（最近过去时）",
          "Tu viens d'où ? 你是哪里人？",
          "Je viens de Tokyo. 我来自东京。",
          "Il vient de Gênes. 他从热那亚来。",
          "Je viens de Chine. 我是从中国来的。",
          "Je viens d'Égypte. 我来自埃及。",
          "Je viens de Kyoto. 我是从京都来的。"
        ],
        "avec": [
          "Venez avec nous. 和我们一起来吧。",
          "Ne veux-tu pas venir avec moi ? 你不想和我一起来吗？",
          "Il avait envie de venir avec nous. 他想和我们一起来。",
          "Cela te dérangerait-il de venir avec moi ? 跟我一起来会不会麻烦你？",
          "Cela vous ennuierait-il de venir avec moi ? 你介意跟我一起来吗？",
          "Il a demandé à sa femme si elle venait avec lui. 他问了他妻子是不是跟他一起来。"
        ]
      },
      "prepositionOrder": [
        "de",
        "avec"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "3475",
            "zh": "374862",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14750",
            "zh": "343599",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "904281",
            "zh": "904284",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1963296",
            "zh": "717391",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2394520",
            "zh": "10189718",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3340814",
            "zh": "2848940",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "10685",
            "zh": "345794",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13968",
            "zh": "375343",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "541907",
            "zh": "687038",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "795120",
            "zh": "795660",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "795705",
            "zh": "795661",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "132095",
            "zh": "408234",
            "eng": ""
          }
        ]
      }
    },
    "verrouiller": {
      "display": "verrouiller",
      "prepositions": {
        "de": [
          "Cette porte est verrouillée de l'intérieur. 这门从里面被反锁了。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "1855613",
            "zh": "754653",
            "eng": "1164095"
          }
        ]
      }
    },
    "vider": {
      "display": "vider",
      "prepositions": {
        "de": [
          "Il porta le verre à ses lèvres et le vida d'un trait. 他把杯子举到嘴边，一饮而尽。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "755850",
            "zh": "755851",
            "eng": ""
          }
        ]
      }
    },
    "viser": {
      "display": "viser",
      "prepositions": {
        "à": [
          "viser à faire qqch 旨在做某事"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "visiter": {
      "display": "visiter",
      "prepositions": {
        "en": [
          "Les deux cotés des berges du fleuve Huangpu sont les plus belles, on peut les visiter en bateau. 黄浦江两岸最好看，可以坐在船里游览。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "1121127",
            "zh": "421136",
            "eng": ""
          }
        ]
      }
    },
    "vivre": {
      "display": "vivre",
      "prepositions": {
        "de": [
          "vivre de qqch 靠某物为生",
          "Tu ne peux plus vivre de ce côté. 你不能再住在这边了。",
          "J'ai vécu plus d'un mois à Nagoya. 我在名古屋生活了1个多月。",
          "Ils vivent de l'autre côté de la rue. 他们住在路对面。",
          "Les Japonais vivent de riz et de poisson. 日本人以米饭和鱼为生存之食。",
          "Ce n'est pas rare du tout de vivre plus de 90 ans. 活到90岁以上一点都不稀奇。",
          "Nous autres Japonais vivons de riz. 我们日本人以米饭为主食。"
        ],
        "en": [
          "Ils vivent en paix. 他们过着和平的生活。",
          "Elles vivent en-dessous. 她们住在楼下。",
          "Nous vivrons en Angleterre. 我们会住在英国。",
          "Les éléphants vivent en Asie et en Afrique. 大象生活在亚洲和非洲。",
          "Combien de temps ont-ils vécu en Angleterre ? 他们在英国住了多久？"
        ],
        "dans": [
          "Nous vivons dans la banlieue. 我们住在郊区。",
          "Les poissons vivent dans la mer. 鱼生活在海里。",
          "Ils vivent dans une grande maison. 他们住在一栋大房子里。",
          "Je ne veux pas vivre dans la peur. 我不想在恐惧中生活。",
          "Ils vivent dans un bon environnement. 他们的生活环境很好。",
          "Beaucoup de hérons vivent dans le marais. 许多苍鹭在沼泽地中生活。"
        ],
        "avec": [
          "Je pense que le fait que j'ai vécu avec toi a influencé la façon dont tu vis. 我觉得我和你一起住影响了你生活的方式。"
        ]
      },
      "prepositionOrder": [
        "de",
        "en",
        "dans",
        "avec"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "480123",
            "zh": "480125",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3362",
            "zh": "334443",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "545805",
            "zh": "6103122",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1538055",
            "zh": "2333772",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3363",
            "zh": "334442",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4990292",
            "zh": "602909",
            "eng": "22609"
          }
        ],
        "en": [
          {
            "kind": "direct",
            "fr": "333316",
            "zh": "333466",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "4729497",
            "zh": "10460786",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "546396",
            "zh": "688826",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "846088",
            "zh": "846015",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1152308",
            "zh": "788840",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "1298730",
            "zh": "8829214",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9217",
            "zh": "389392",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "524366",
            "zh": "10283396",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "5801584",
            "zh": "2037323",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426147",
            "zh": "426018",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "10374685",
            "zh": "10513294",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "3200",
            "zh": "501355",
            "eng": ""
          }
        ]
      }
    },
    "voir": {
      "display": "voir",
      "prepositions": {
        "dans": [
          "Il vit dans le coin. 他在这附近居住。",
          "Tu vis dans mon cœur. 你住在我心里。",
          "Je vis dans ce quartier. 我住在这区。",
          "Elle vit dans le confort. 她生活得很舒适。",
          "Je vis dans un appartement. 我住在一间公寓里。",
          "Personne ne vit dans ce bâtiment. 没有人住在这栋楼里。"
        ],
        "avec": [
          "Je vis avec mes parents. 我跟父母住在一起.",
          "Je n'ai rien à voir avec ce crime. 这个犯罪和我一点关系都没有。",
          "Elle n'a rien à voir avec ce problème. 她和这问题没有关系。",
          "Tu sais, je ne t'ai jamais vu avec un mec. 你知道吗，我从没见过你跟一个男人一起。",
          "Je t'ai vu avec un garçon de grande taille. 我看见你和一个高个子男孩在一起。",
          "Elle n'a vraiment rien à voir avec cette affaire. 她真的和这件事无关。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "avec"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "14463",
            "zh": "339470",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2508110",
            "zh": "4490242",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14848",
            "zh": "441465",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134143",
            "zh": "349524",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "7409",
            "zh": "10363134",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "15283",
            "zh": "444814",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "180714",
            "zh": "180712",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "334891",
            "zh": "334900",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "818664",
            "zh": "818808",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "802487",
            "zh": "802865",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "426025",
            "zh": "347723",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "15575",
            "zh": "408484",
            "eng": ""
          }
        ]
      }
    },
    "voler": {
      "display": "voler",
      "prepositions": {
        "dans": [
          "Un aigle vole dans le ciel. 一只鹰在天上飞。"
        ],
        "vers": [
          "Les oiseaux volèrent vers le sud. 群鸟南翔。",
          "Si j'étais un oiseau, je pourrais voler vers toi. 如果我是一只小鸟，我就可以飞到你的身边了。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "vers"
      ],
      "sources": {
        "dans": [
          {
            "kind": "direct",
            "fr": "13837",
            "zh": "343451",
            "eng": ""
          }
        ],
        "vers": [
          {
            "kind": "indirect",
            "fr": "2001828",
            "zh": "2007038",
            "eng": "278211"
          },
          {
            "kind": "indirect",
            "fr": "935136",
            "zh": "501362",
            "eng": "30798"
          }
        ]
      }
    },
    "voter": {
      "display": "voter",
      "prepositions": {
        "pour": [
          "voter pour qqn 投票支持某人",
          "Votez pour Tom. 投票给汤姆。",
          "J'ai voté pour Ken. 我投肯一票。",
          "Je vais certainement voter pour Tom. 我一定要给汤姆投票。",
          "Aussi étrange à dire, personne ne vota pour le candidat. 奇怪的是，谁也没有投那候选人一票。"
        ],
        "contre": [
          "voter contre qqch 投票反对某事",
          "Personne ne vota contre. 没有人投反对票。"
        ]
      },
      "prepositionOrder": [
        "pour",
        "contre"
      ],
      "sources": {
        "pour": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "12353699",
            "zh": "6101261",
            "eng": "2240284"
          },
          {
            "kind": "indirect",
            "fr": "568795",
            "zh": "771594",
            "eng": "465055"
          },
          {
            "kind": "indirect",
            "fr": "5645383",
            "zh": "6936203",
            "eng": "4976768"
          },
          {
            "kind": "indirect",
            "fr": "488734",
            "zh": "343099",
            "eng": "20628"
          }
        ],
        "contre": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "indirect",
            "fr": "3649005",
            "zh": "2000401",
            "eng": "804297"
          }
        ]
      }
    },
    "vouer": {
      "display": "vouer",
      "prepositions": {
        "à": [
          "Un tel projet est voué à l'échec. 这样的计划注定会失败的。",
          "Elle a voué sa vie à l'éducation. 她把她的一生献给了教育事业。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "802039",
            "zh": "798162",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134158",
            "zh": "404453",
            "eng": ""
          }
        ]
      }
    },
    "vouloir": {
      "display": "vouloir",
      "prepositions": {
        "en": [
          "Elle ne veut pas en parler. 她不想提了。",
          "Je ne veux pas en discuter. 我不想谈论这件事。",
          "Il voulait en savoir davantage sur eux. 他想进一步了解他们。",
          "Est-ce que tu ne veux pas en connaître la raison ? 你不想知道原因吗？",
          "J'aime faire de la peinture à l'huile, mais je ne veux pas en faire mon métier à vie. 我喜欢画油画，但是我不想拿它做我的终身职业。",
          "Je veux m'en aller. 我想去。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "3715",
            "zh": "502857",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "2217240",
            "zh": "4859514",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129052",
            "zh": "452589",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3032724",
            "zh": "3035561",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "667550",
            "zh": "420970",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1978619",
            "zh": "13243127",
            "eng": "1977717"
          }
        ]
      }
    },
    "voyager": {
      "display": "voyager",
      "prepositions": {
        "à": [
          "Il aime voyager à l'étranger. 他喜欢到国外旅行",
          "J'eus la chance de voyager à l'étranger. 我有个到国外旅游的机会。",
          "Il va voyager à l'étranger l'année prochaine. 明年他要去国外旅游。",
          "Je voyageais à travers les villages et les champs peuplés de cigales et inondés de rayons de soleil. 游荡在知了和阳光充斥的村舍田野",
          "Elle voyagea au Japon. 她环游了日本。",
          "Il voyagea à travers le pays. 他周游全国各地。"
        ],
        "en": [
          "J'aime voyager en hiver. 我喜欢冬天旅游。",
          "Les Japonais aiment voyager en groupe. 日本人喜欢集体旅游。",
          "Si j'avais le temps et l'argent, je voudrais voyager en Europe. 如果我有时间有钱，我要到欧洲去旅游。",
          "J'aime voyager en train. 我喜欢搭火车旅行。",
          "Je n'ai jamais voyagé en avion. 我从来都没有乘过飞机。",
          "Gulliver a voyagé en quête d'aventure. 格列佛为寻求探险而旅行。"
        ],
        "dans": [
          "Voyager dans l'espace n'est plus un rêve. 太空旅行已不再是幻想。",
          "Je veux voyager dans le monde entier. 我要环游世界。"
        ],
        "avec": [
          "Je n'ai personne qui veuille voyager avec moi. 我没有一个愿意跟我一起旅行的人。",
          "Je veux voyager avec toi. 我想和你去旅行。",
          "Nous voyageons avec un budget serré. 我们很节省地旅行。",
          "Je n'aime pas voyager avec beaucoup de bagages. 我出门不喜欢带很多行李。"
        ]
      },
      "prepositionOrder": [
        "à",
        "en",
        "dans",
        "avec"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "936941",
            "zh": "931063",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "9501",
            "zh": "801916",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "15518",
            "zh": "415641",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "13376567",
            "zh": "13376566",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1337263",
            "zh": "8739363",
            "eng": "567463"
          },
          {
            "kind": "indirect",
            "fr": "1350006",
            "zh": "834391",
            "eng": "296436"
          }
        ],
        "en": [
          {
            "kind": "direct",
            "fr": "5647791",
            "zh": "13109163",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "129781",
            "zh": "453767",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1166764",
            "zh": "421108",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "410257",
            "zh": "805082",
            "eng": "262276"
          },
          {
            "kind": "indirect",
            "fr": "11375047",
            "zh": "1766196",
            "eng": "7794443"
          },
          {
            "kind": "indirect",
            "fr": "11002",
            "zh": "1394899",
            "eng": "63514"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "341334",
            "zh": "10326108",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7686420",
            "zh": "875324",
            "eng": "271162"
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "3291",
            "zh": "334914",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1337156",
            "zh": "851482",
            "eng": "29042"
          },
          {
            "kind": "indirect",
            "fr": "120039",
            "zh": "895647",
            "eng": "324689"
          },
          {
            "kind": "indirect",
            "fr": "12454399",
            "zh": "6956916",
            "eng": "6954739"
          }
        ]
      }
    },
    "vêtir": {
      "display": "vêtir",
      "prepositions": {
        "de": [
          "Ils étaient tous vêtus d'un uniforme. 他们都穿着制服。",
          "Elle est vêtue de blanc. 她穿着白色的衣服。",
          "Elle est toujours vêtue de noir. 她总是一身黑。",
          "Qui est la femme vêtue de rose ? 那个穿粉红色衣服的女人是谁？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "465519",
            "zh": "465916",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4760540",
            "zh": "8738757",
            "eng": "316164"
          },
          {
            "kind": "indirect",
            "fr": "936667",
            "zh": "1243801",
            "eng": "310426"
          },
          {
            "kind": "indirect",
            "fr": "1358913",
            "zh": "900712",
            "eng": "68628"
          }
        ]
      }
    },
    "éblouir": {
      "display": "éblouir",
      "prepositions": {
        "par": [
          "J'ai été ébloui par les phares d'une voiture qui approchait. 我被前方驶来的车的车头灯晃得眼花。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "10249175",
            "zh": "8888029",
            "eng": "321889"
          }
        ]
      }
    },
    "échanger": {
      "display": "échanger",
      "prepositions": {
        "contre": [
          "échanger qqch contre qqch 用某物交换某物"
        ]
      },
      "prepositionOrder": [
        "contre"
      ],
      "sources": {
        "contre": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    },
    "échapper": {
      "display": "échapper",
      "prepositions": {
        "à": [
          "échapper à qqch 逃脱某事",
          "On n'échappe pas à son destin. 人算不如天算。",
          "Il a échappé à la mort de justesse. 他险些被杀害。",
          "Ils sont allés à Édimbourg pour échapper à la chaleur estivale. 他们去了爱丁堡避暑。",
          "Le robot échappa au contrôle. 这个机器人失控了。",
          "Personne n'échappe au vieillissement. 没有人能逃过衰老。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "706685",
            "zh": "704297",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "131798",
            "zh": "834401",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "852608",
            "zh": "850977",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "988377",
            "zh": "798420",
            "eng": "798418"
          },
          {
            "kind": "indirect",
            "fr": "3645967",
            "zh": "8765233",
            "eng": "2435887"
          }
        ]
      }
    },
    "échouer": {
      "display": "échouer",
      "prepositions": {
        "à": [
          "Il échoua à l'examen d'entrée. 他在入学考试中失败了。",
          "Nos plans ont échoué à la dernière minute. 我们的方案在最后的时刻失败了。",
          "Ayant échoué à de nombreuses reprises, il n'abandonna pourtant jamais le plan. 虽然失败了很多次，但是他仍从不放弃。",
          "Ils ont échoué à l'examen. 他们考试失败了。",
          "Il a échoué à son examen de conduite. 他没有通过他的驾驶考试。",
          "Bien des étudiants ont échoué à l'examen. 很多学生考试没过。"
        ],
        "sur": [
          "Une baleine blessée s'est échouée sur la plage. 一条受伤的鲸鱼在海滩边搁浅了。"
        ],
        "dans": [
          "Il a échoué dans sa tentative de traverser la rivière à la nage. 他想游泳渡河的企图失败了。"
        ]
      },
      "prepositionOrder": [
        "à",
        "sur",
        "dans"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "1461362",
            "zh": "10275149",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "545767",
            "zh": "606795",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "500990",
            "zh": "347424",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "639638",
            "zh": "6114404",
            "eng": "306743"
          },
          {
            "kind": "indirect",
            "fr": "12457763",
            "zh": "887681",
            "eng": "293901"
          },
          {
            "kind": "indirect",
            "fr": "14635",
            "zh": "2635856",
            "eng": "274814"
          }
        ],
        "sur": [
          {
            "kind": "direct",
            "fr": "815641",
            "zh": "816502",
            "eng": ""
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "130511",
            "zh": "435363",
            "eng": ""
          }
        ]
      }
    },
    "éclater": {
      "display": "éclater",
      "prepositions": {
        "en": [
          "La guerre a éclaté en 1939. 战争在1939年爆发了。",
          "D'un coup, elle a éclaté en sanglots. 她突然泣不成声了。",
          "La première Guerre Mondiale a éclaté en 1914. 第一次世界大战于1914年爆发。",
          "À peine était-il entré dans la pièce qu'elle éclata en sanglots. 他刚进房间，她就泣不成声了。",
          "La fillette a éclaté en sanglots. 这个年轻的女孩泪流满面。",
          "Leur querelle éclata en raison d'un malentendu. 他们的争吵因误解而起。"
        ],
        "dans": [
          "Je m'éclate dans la vie. 我为人生感到很开心。"
        ]
      },
      "prepositionOrder": [
        "en",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "139088",
            "zh": "343857",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "15645",
            "zh": "392675",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "799546",
            "zh": "798366",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "130031",
            "zh": "414042",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "11967317",
            "zh": "804978",
            "eng": "46468"
          },
          {
            "kind": "indirect",
            "fr": "8979349",
            "zh": "775428",
            "eng": "305122"
          }
        ],
        "dans": [
          {
            "kind": "indirect",
            "fr": "11223662",
            "zh": "805012",
            "eng": "270517"
          }
        ]
      }
    },
    "économiser": {
      "display": "économiser",
      "prepositions": {
        "de": [
          "Elle économise de l'argent pour aller à l'étranger. 她为了去国外正在省钱。",
          "Il se serra la ceinture pendant de nombreuses années afin d'économiser de l'argent. 为了存钱，他省吃俭用了许多年。",
          "Sans travail, je ne peux pas économiser de l'argent. 没有工作，我就没法存钱。",
          "Il économise de l'argent afin qu'il puisse aller à l'université. 他在攒钱上大学。"
        ],
        "pour": [
          "J'économise pour acheter une nouvelle voiture. 我在省钱买新车。"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "11381",
            "zh": "401071",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "793617",
            "zh": "793612",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "822399",
            "zh": "6563548",
            "eng": "535037"
          },
          {
            "kind": "indirect",
            "fr": "352320",
            "zh": "357167",
            "eng": "301241"
          }
        ],
        "pour": [
          {
            "kind": "indirect",
            "fr": "330956",
            "zh": "5691280",
            "eng": "258818"
          }
        ]
      }
    },
    "écouter": {
      "display": "écouter",
      "prepositions": {
        "de": [
          "Écoutons de la musique. 我们听点音乐吧。",
          "Nous écoutons de la musique. 我们听音乐。",
          "J'aimerais écouter de la musique pop. 我想要听流行音乐。",
          "Je suis en train d'écouter de la musique. 我正在听音乐。",
          "J'étudie souvent en écoutant de la musique. 我经常边学习边听音乐。",
          "Son unique plaisir est d'écouter de la musique. 她唯一的乐趣就是听音乐。"
        ],
        "avec": [
          "J'écoute avec patience mais sans intérêt. 我很耐心地听着，但不感兴趣。",
          "J'essayai de l'écouter avec attention. 我试着仔细地听他说话。"
        ]
      },
      "prepositionOrder": [
        "de",
        "avec"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "1040095",
            "zh": "10275082",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "466778",
            "zh": "669045",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6910",
            "zh": "765723",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "804690",
            "zh": "804865",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6761",
            "zh": "343877",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "135952",
            "zh": "754658",
            "eng": ""
          }
        ],
        "avec": [
          {
            "kind": "direct",
            "fr": "843400",
            "zh": "843477",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1365199",
            "zh": "883292",
            "eng": "260600"
          }
        ]
      }
    },
    "écraser": {
      "display": "écraser",
      "prepositions": {
        "par": [
          "Un chien a été écrasé par un camion. 一条狗被卡车碾过。",
          "Elle fut écrasée par une voiture. 她被车子辗过了。",
          "J'ai failli être écrasé par un camion. 我差点被卡车撞到。",
          "Un étudiant a été écrasé par une voiture sur Basin street. 有个学生在贝辛路被车轧了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "786347",
            "zh": "787367",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "1084342",
            "zh": "908370",
            "eng": "388640"
          },
          {
            "kind": "indirect",
            "fr": "180485",
            "zh": "13071569",
            "eng": "4665803"
          },
          {
            "kind": "indirect",
            "fr": "1084335",
            "zh": "11235952",
            "eng": "73115"
          }
        ]
      }
    },
    "écrire": {
      "display": "écrire",
      "prepositions": {
        "en": [
          "Ce livre est écrit en anglais. 这本书是用英文写的。",
          "Je ne peux pas écrire en chinois. 我不会写中文。",
          "J'ai acheté un journal écrit en anglais. 我买了份英文写的报纸。",
          "Hier, j'ai reçu une lettre écrite en anglais. 昨天，我收到一封用英语写的信。",
          "Le texte de l'hymne national du Canada a d'abord été écrit en français. 加拿大国歌的歌词最初是用法文写的。",
          "Elle écrit en chinois. 她写中文。"
        ],
        "sur": [
          "Qu'a-t-elle écrit sur le tableau noir ? 她在黑板上写了什么？"
        ],
        "dans": [
          "Je crois ce qu'elle a écrit dans sa lettre. 我相信她信上写的东西。",
          "Veuillez ne pas écrire dans ce livre de la bibliothèque. 请不要在图书馆的书上涂写。"
        ]
      },
      "prepositionOrder": [
        "en",
        "sur",
        "dans"
      ],
      "sources": {
        "en": [
          {
            "kind": "direct",
            "fr": "1008680",
            "zh": "868416",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "1608624",
            "zh": "10329961",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6793",
            "zh": "441466",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "6487",
            "zh": "334643",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "971843",
            "zh": "1085608",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "7499413",
            "zh": "8860672",
            "eng": "462412"
          }
        ],
        "sur": [
          {
            "kind": "indirect",
            "fr": "8774455",
            "zh": "13573481",
            "eng": "8763566"
          }
        ],
        "dans": [
          {
            "kind": "direct",
            "fr": "127817",
            "zh": "343375",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "971399",
            "zh": "963656",
            "eng": "963650"
          }
        ]
      }
    },
    "éduquer": {
      "display": "éduquer",
      "prepositions": {
        "à": [
          "Il est fier d'avoir été éduqué aux États-Unis. 他对自己在美国读过书这件事感到很骄傲。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "130500",
            "zh": "8798298",
            "eng": "287961"
          }
        ]
      }
    },
    "égarer": {
      "display": "égarer",
      "prepositions": {
        "dans": [
          "Nous nous sommes égarés dans le brouillard. 我们在雾中迷了路。"
        ]
      },
      "prepositionOrder": [
        "dans"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "4912463",
            "zh": "799258",
            "eng": "249403"
          }
        ]
      }
    },
    "éloigner": {
      "display": "éloigner",
      "prepositions": {
        "de": [
          "Mon pays est éloigné du Japon. 我的国家离日本很远。",
          "Ton école est-elle éloignée d'ici ? 你的学校离这儿远吗？",
          "Depuis combien de temps es-tu éloignée de ta famille ? 你离开家有多久了?",
          "Depuis combien de temps êtes-vous éloigné de votre famille ? 您离开家有多久了？",
          "Tom veut que je reste éloigné de lui. Tom要我离他远一点。",
          "Vous devriez vous tenir éloignés de Tom. 你应该离汤姆远点儿。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "119934",
            "zh": "683590",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "470375",
            "zh": "471158",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474858",
            "zh": "476559",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "474857",
            "zh": "476560",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "4008957",
            "zh": "3748345",
            "eng": "4008923"
          },
          {
            "kind": "indirect",
            "fr": "5906498",
            "zh": "5091097",
            "eng": "4502308"
          }
        ]
      }
    },
    "émaner": {
      "display": "émaner",
      "prepositions": {
        "de": [
          "Le pouvoir politique émane du canon de fusil. 枪杆子里面出政权。",
          "Je ne réponds jamais aux courriels émanant de gens que je ne connais pas. 我从不回复陌生人发来的电子邮件。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "13043642",
            "zh": "13042874",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "955640",
            "zh": "9467400",
            "eng": ""
          }
        ]
      }
    },
    "émouvoir": {
      "display": "émouvoir",
      "prepositions": {
        "par": [
          "Je fus ému par son amour pour les autres. 我被她对别人的爱心所感动。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "indirect",
            "fr": "3139282",
            "zh": "1529525",
            "eng": "261293"
          }
        ]
      }
    },
    "épouser": {
      "display": "épouser",
      "prepositions": {
        "de": [
          "Elle ne l'a pas épousé de sa propre volonté. 她是被迫和他结婚的。"
        ],
        "pour": [
          "Il l'a épousée pour son fric. 他为了她的钱取了她。",
          "Elle l'a épousé pour son fric. 她为了他的钱嫁给了他。"
        ]
      },
      "prepositionOrder": [
        "de",
        "pour"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "457555",
            "zh": "403582",
            "eng": "314632"
          }
        ],
        "pour": [
          {
            "kind": "indirect",
            "fr": "3793294",
            "zh": "3783437",
            "eng": "3783170"
          },
          {
            "kind": "indirect",
            "fr": "3793293",
            "zh": "3783436",
            "eng": "887300"
          }
        ]
      }
    },
    "éprendre": {
      "display": "éprendre",
      "prepositions": {
        "de": [
          "Je ne suis pas épris d'elle. 我不爱她。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "486542",
            "zh": "340108",
            "eng": "261346"
          }
        ]
      }
    },
    "épuiser": {
      "display": "épuiser",
      "prepositions": {
        "par": [
          "Je suis épuisé par le travail. 我工作累死了。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "333919",
            "zh": "333924",
            "eng": ""
          }
        ]
      }
    },
    "équiper": {
      "display": "équiper",
      "prepositions": {
        "de": [
          "Ce bateau n'est pas équipé de radar. 这艘船没有雷达装备。",
          "Ma voiture est équipée d'un lecteur CD. 我的汽车配备了一个CD机。",
          "Chaque robot est équipé d'un synthétiseur vocal. 每个机器人身上都安装了一台发声器。",
          "Sa cuisine est équipée de nombreux appareils qui facilitent le travail. 她的厨房备有许多方便工作的器具。",
          "Notre voiture est équipée de l'air conditionné. 我们的车配备了空调。",
          "Est-ce que la pièce est équipée de l'air conditionné ? 房间有没有空调？"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "direct",
            "fr": "470379",
            "zh": "471152",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "432487",
            "zh": "444617",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "832765",
            "zh": "534323",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "829127",
            "zh": "829625",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "348558",
            "zh": "785127",
            "eng": "65546"
          },
          {
            "kind": "indirect",
            "fr": "180998",
            "zh": "1328999",
            "eng": "44190"
          }
        ]
      }
    },
    "équivaloir": {
      "display": "équivaloir",
      "prepositions": {
        "à": [
          "Ne pas désirer équivaut à posséder. 没有欲望就等于拥有。",
          "Que tu viennes et dises maintenant cette sorte de chose équivaudrait à jeter de l'huile sur le feu. 你现在说这种话，只会火上加油。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "direct",
            "fr": "3489",
            "zh": "72",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "488687",
            "zh": "342717",
            "eng": "242057"
          }
        ]
      }
    },
    "ériger": {
      "display": "ériger",
      "prepositions": {
        "à": [
          "Une tour a été érigée à côté de chez moi. 我家的旁边建了一栋高楼。"
        ]
      },
      "prepositionOrder": [
        "à"
      ],
      "sources": {
        "à": [
          {
            "kind": "indirect",
            "fr": "960003",
            "zh": "552794",
            "eng": "250518"
          }
        ]
      }
    },
    "établir": {
      "display": "établir",
      "prepositions": {
        "par": [
          "Le niveau de la sécurité, comme établi par le Département de la Sécurité intérieure, est orange. 根据国土安全部的规定，目前的安全水准是橙色等级。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "418943",
            "zh": "418945",
            "eng": ""
          }
        ]
      }
    },
    "étendre": {
      "display": "étendre",
      "prepositions": {
        "sur": [
          "J'ai vu un jeune homme étendu sur un banc sous un cerisier dans le parc. 在公园里，我看到一个年轻人躺在一棵樱桃树下的长椅上。",
          "Il était étendu sur le dos. 他仰躺。",
          "J'étais étendu sur mon lit. 我躺在床上。",
          "Je me suis étendu sur l'herbe. 我在草地上直躺下来了。"
        ]
      },
      "prepositionOrder": [
        "sur"
      ],
      "sources": {
        "sur": [
          {
            "kind": "direct",
            "fr": "8665",
            "zh": "453753",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "330363",
            "zh": "736294",
            "eng": "295394"
          },
          {
            "kind": "indirect",
            "fr": "3666082",
            "zh": "2336000",
            "eng": "258251"
          },
          {
            "kind": "indirect",
            "fr": "6230",
            "zh": "842684",
            "eng": "259188"
          }
        ]
      }
    },
    "étonner": {
      "display": "étonner",
      "prepositions": {
        "par": [
          "Je suis étonné par ton audace. 我对你的大胆感到很惊讶。",
          "J'ai été étonné par son courage. 我被他的勇气吓到了。",
          "Je suis étonné par ton attitude irresponsable. 我对你不负责任的态度感到惊讶。",
          "Je suis étonné par ses progrès rapides en anglais. 我对他英语的快速进步感到吃惊。"
        ]
      },
      "prepositionOrder": [
        "par"
      ],
      "sources": {
        "par": [
          {
            "kind": "direct",
            "fr": "335295",
            "zh": "335317",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "14734",
            "zh": "401120",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "331986",
            "zh": "846786",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "488999",
            "zh": "714784",
            "eng": ""
          }
        ]
      }
    },
    "étudier": {
      "display": "étudier",
      "prepositions": {
        "dans": [
          "Mary est en train d'étudier dans sa chambre. 玛丽在她的房间里读书。"
        ],
        "avec": [
          "Étudie avec application. 好好学习。",
          "Il étudia avec application. 他努力学习。",
          "J'étudie toujours avec application. 我总是用功读书。",
          "J'étudie avec beaucoup d'assiduité. 我现在非常集中的学习。",
          "Maintenant que tu es lycéen, tu devrais étudier avec plus de vigueur. 你现在是大学生了，应该努力点读书。"
        ]
      },
      "prepositionOrder": [
        "dans",
        "avec"
      ],
      "sources": {
        "dans": [
          {
            "kind": "indirect",
            "fr": "452776",
            "zh": "862842",
            "eng": "31924"
          }
        ],
        "avec": [
          {
            "kind": "indirect",
            "fr": "1197639",
            "zh": "5092230",
            "eng": "53465"
          },
          {
            "kind": "indirect",
            "fr": "1910390",
            "zh": "6103217",
            "eng": "1908967"
          },
          {
            "kind": "indirect",
            "fr": "5066663",
            "zh": "919879",
            "eng": "66085"
          },
          {
            "kind": "indirect",
            "fr": "5430685",
            "zh": "8928634",
            "eng": "2546516"
          },
          {
            "kind": "indirect",
            "fr": "479842",
            "zh": "517391",
            "eng": "31204"
          }
        ]
      }
    },
    "évader": {
      "display": "évader",
      "prepositions": {
        "de": [
          "Un dangereux criminel s'est évadé de prison. 有一个危险的罪犯从监狱里逃了出来。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "11322364",
            "zh": "10335115",
            "eng": "10331204"
          }
        ]
      }
    },
    "éviter": {
      "display": "éviter",
      "prepositions": {
        "de": [
          "éviter de faire qqch 避免做某事",
          "J'évite de discuter des sujets personnels avec le patron. 我避免跟老板讨论个人话题。",
          "Pour éviter d'attraper un rhume, prenez beaucoup de vitamine C. 要避免得感冒，多补充点维生素C。",
          "Évite d'ouvrir la fenêtre, je n'ai pas trop envie de sentir de courants d'air dans mon dos. 不要开窗，我不太想感觉后面有气流。",
          "Aujourd'hui je quitte le travail un peu plus tard, afin d'éviter d'être surchargé de travail demain matin. 我今天晚点下班，省得明天早上手忙脚乱。",
          "Certaines personnes étaient accrochées à des branches d'arbres durant plusieurs heures, afin d'éviter d'être emportées par les eaux. 为了不被洪水冲走，有的人紧紧地抱着树干长达数个钟头。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "curated",
            "authored": true
          },
          {
            "kind": "direct",
            "fr": "4564092",
            "zh": "5684092",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "134957",
            "zh": "352315",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "3952",
            "zh": "503245",
            "eng": ""
          },
          {
            "kind": "direct",
            "fr": "383136",
            "zh": "383127",
            "eng": ""
          },
          {
            "kind": "indirect",
            "fr": "3673165",
            "zh": "3671479",
            "eng": "3671465"
          }
        ]
      }
    },
    "évoluer": {
      "display": "évoluer",
      "prepositions": {
        "en": [
          "La tempête évolua en un typhon. 暴风雨发展成了一个台风。"
        ]
      },
      "prepositionOrder": [
        "en"
      ],
      "sources": {
        "en": [
          {
            "kind": "indirect",
            "fr": "1367550",
            "zh": "870386",
            "eng": "325313"
          }
        ]
      }
    },
    "évoquer": {
      "display": "évoquer",
      "prepositions": {
        "de": [
          "Ses propos ne m'évoquent rien du tout. 他的话对我来说没有任何意义。"
        ]
      },
      "prepositionOrder": [
        "de"
      ],
      "sources": {
        "de": [
          {
            "kind": "indirect",
            "fr": "12213920",
            "zh": "358446",
            "eng": "286044"
          }
        ]
      }
    },
    "être d'accord": {
      "display": "être d'accord",
      "prepositions": {
        "avec": [
          "être d'accord avec qqn 同意某人的看法"
        ]
      },
      "prepositionOrder": [
        "avec"
      ],
      "sources": {
        "avec": [
          {
            "kind": "curated",
            "authored": true
          }
        ]
      }
    }
  },
  "prepositions": {
    "à": [
      "abaisser",
      "abonner",
      "accompagner",
      "accoutumer",
      "accrocher",
      "accéder",
      "adapter",
      "adhérer",
      "adresser",
      "aider",
      "aimer",
      "aller",
      "amener",
      "amuser",
      "annuler",
      "appartenir",
      "apprendre",
      "apprêter",
      "arriver",
      "aspirer",
      "assister",
      "attacher",
      "attribuer",
      "autoriser",
      "avoir",
      "balader",
      "bayer",
      "chercher",
      "chuchoter",
      "clouer",
      "coller",
      "commencer",
      "comparer",
      "condamner",
      "conduire",
      "conformer",
      "confronter",
      "consacrer",
      "consentir",
      "consister",
      "continuer",
      "contraindre",
      "contribuer",
      "convenir",
      "convertir",
      "correspondre",
      "croire",
      "céder",
      "demander",
      "destiner",
      "dire",
      "distribuer",
      "donner",
      "décoller",
      "dédier",
      "déménager",
      "déplaire",
      "déposer",
      "désobéir",
      "déterminer",
      "emmener",
      "encourager",
      "enseigner",
      "exposer",
      "faire attention",
      "fermer",
      "fier",
      "fleurir",
      "forcer",
      "frapper",
      "gagner",
      "geler",
      "goûter",
      "grimper",
      "habiter",
      "habituer",
      "hésiter",
      "inciter",
      "inviter",
      "joindre",
      "jouer",
      "lier",
      "livrer",
      "léguer",
      "manquer",
      "mener",
      "mentir",
      "nuire",
      "obliger",
      "obéir",
      "offrir",
      "opposer",
      "pardonner",
      "participer",
      "parvenir",
      "penser",
      "plaire",
      "pleuvoir",
      "poser",
      "préparer",
      "présenter",
      "prêter",
      "questionner",
      "raconter",
      "ramener",
      "recommencer",
      "redonner",
      "remettre",
      "remonter",
      "remédier",
      "rendre",
      "renoncer",
      "rentrer",
      "reporter",
      "reprocher",
      "ressembler",
      "retourner",
      "réagir",
      "réfléchir",
      "répondre",
      "résister",
      "réussir",
      "réveiller",
      "s'adapter",
      "s'adonner",
      "s'adresser",
      "s'agripper",
      "s'appliquer",
      "s'apprêter",
      "s'attendre",
      "s'engager",
      "s'exercer",
      "s'habituer",
      "s'intéresser",
      "s'offrir",
      "s'opposer",
      "se borner",
      "se consacrer",
      "se coucher",
      "se décider",
      "se fier",
      "se heurter",
      "se joindre",
      "se limiter",
      "se mettre",
      "se monter",
      "se parler",
      "se plier",
      "se préparer",
      "se présenter",
      "se refuser",
      "se rendre",
      "se résigner",
      "se résoudre",
      "se sentir",
      "se situer",
      "se soumettre",
      "se tenir",
      "se vendre",
      "servir",
      "songer",
      "sonner",
      "soumettre",
      "sourire",
      "subvenir",
      "succéder",
      "suffire",
      "survenir",
      "survivre",
      "suspendre",
      "tarder",
      "tendre",
      "tenir",
      "toucher",
      "tourner",
      "transmettre",
      "tricher",
      "téléphoner",
      "veiller",
      "viser",
      "vouer",
      "voyager",
      "échapper",
      "échouer",
      "éduquer",
      "équivaloir",
      "ériger"
    ],
    "de": [
      "abriter",
      "absenter",
      "abstenir",
      "abuser",
      "accabler",
      "accepter",
      "accuser",
      "advenir",
      "allouer",
      "amasser",
      "approcher",
      "apprécier",
      "arrêter",
      "atteindre",
      "augmenter",
      "avaler",
      "avertir",
      "avoir",
      "avoir besoin",
      "avoir envie",
      "avoir peur",
      "boire",
      "bonder",
      "border",
      "bouillir",
      "bourrer",
      "cesser",
      "changer",
      "charger",
      "choisir",
      "chouchouter",
      "commettre",
      "comporter",
      "composer",
      "conseiller",
      "consommer",
      "constituer",
      "contenir",
      "contenter",
      "convaincre",
      "couronner",
      "couvrir",
      "coûter",
      "craindre",
      "crever",
      "dater",
      "demander",
      "différencier",
      "différer",
      "diminuer",
      "diplômer",
      "discuter",
      "disposer",
      "dissuader",
      "distinguer",
      "divorcer",
      "divulguer",
      "doter",
      "douter",
      "débarrasser",
      "déborder",
      "décider",
      "déconseiller",
      "dégager",
      "dégouliner",
      "démissionner",
      "dénuer",
      "dépendre",
      "dépourvoir",
      "déranger",
      "détailler",
      "détester",
      "effacer",
      "emplir",
      "empêcher",
      "encombrer",
      "endurer",
      "enfiler",
      "entourer",
      "envisager",
      "essayer",
      "exagérer",
      "exclure",
      "exiger",
      "exporter",
      "expulser",
      "extirper",
      "faire semblant",
      "ficher",
      "finir",
      "foutre",
      "frissonner",
      "féliciter",
      "gaspiller",
      "grouiller",
      "guérir",
      "générer",
      "honorer",
      "hériter",
      "ignorer",
      "implorer",
      "imprégner",
      "informer",
      "inonder",
      "inspirer",
      "interdire",
      "jouer",
      "jouir",
      "jurer",
      "languir",
      "lasser",
      "manquer",
      "menacer",
      "moquer",
      "mâcher",
      "méfier",
      "mériter",
      "mêler",
      "nécessiter",
      "obliger",
      "obtenir",
      "occasionner",
      "offrir",
      "omettre",
      "opiner",
      "ordonner",
      "oublier",
      "parler",
      "parsemer",
      "penser",
      "permettre",
      "persuader",
      "peupler",
      "posséder",
      "presser",
      "prier",
      "priver",
      "procurer",
      "produire",
      "profiter",
      "promettre",
      "proposer",
      "provenir",
      "prévenir",
      "prévoir",
      "raffoler",
      "rappeler",
      "ravir",
      "rayer",
      "recevoir",
      "recommander",
      "recouvrir",
      "refuser",
      "regorger",
      "regretter",
      "relever",
      "remercier",
      "remplir",
      "requérir",
      "respecter",
      "retirer",
      "rire",
      "risquer",
      "rouer",
      "réjouir",
      "rêver",
      "s'abstenir",
      "s'agir",
      "s'apercevoir",
      "s'appeler",
      "s'approcher",
      "s'approvisionner",
      "s'arrêter",
      "s'efforcer",
      "s'empêcher",
      "s'enorgueillir",
      "s'excuser",
      "s'inquiéter",
      "s'occuper",
      "s'écarter",
      "s'échapper",
      "s'éloigner",
      "s'étonner",
      "saigner",
      "satisfaire",
      "se composer",
      "se couvrir",
      "se débarrasser",
      "se dépêcher",
      "se ficher",
      "se moquer",
      "se méfier",
      "se mêler",
      "se nourrir",
      "se passer",
      "se permettre",
      "se plaindre",
      "se préoccuper",
      "se ranger",
      "se relever",
      "se remplir",
      "se rendre compte",
      "se repentir",
      "se réjouir",
      "se saisir",
      "se servir",
      "se soucier",
      "se souvenir",
      "se séparer",
      "se targuer",
      "se tromper",
      "se vanter",
      "servir",
      "sortir",
      "soucier",
      "souffrir",
      "soulager",
      "soupçonner",
      "souvenir",
      "subir",
      "suffire",
      "suggérer",
      "suivre",
      "supplier",
      "supporter",
      "surgir",
      "suspecter",
      "séparer",
      "tacher",
      "tenir",
      "tenter",
      "traiter",
      "trembler",
      "truffer",
      "tâcher",
      "user",
      "varier",
      "venir",
      "verrouiller",
      "vider",
      "vivre",
      "vêtir",
      "économiser",
      "écouter",
      "éloigner",
      "émaner",
      "épouser",
      "éprendre",
      "équiper",
      "évader",
      "éviter",
      "évoquer"
    ],
    "en": [
      "abonder",
      "achever",
      "aller",
      "annuler",
      "approvisionner",
      "avoir confiance",
      "blesser",
      "briser",
      "bâtir",
      "casser",
      "changer",
      "chanter",
      "concerner",
      "consister",
      "construire",
      "couper",
      "croire",
      "devoir",
      "diplômer",
      "déchirer",
      "déguiser",
      "endormir",
      "entrer",
      "expliquer",
      "exprimer",
      "fabriquer",
      "falloir",
      "fonctionner",
      "fonder",
      "fondre",
      "gagner",
      "garder",
      "grandir",
      "habiller",
      "habiter",
      "inventer",
      "laisser",
      "maîtriser",
      "mettre",
      "naître",
      "partir",
      "placer",
      "pleurer",
      "pleuvoir",
      "poursuivre",
      "pouvoir",
      "publier",
      "remettre",
      "rencontrer",
      "reposer",
      "rouler",
      "réduire",
      "réveiller",
      "s'enfuir",
      "s'habiller",
      "s'installer",
      "saluer",
      "se briser",
      "se changer",
      "se dire",
      "se déplacer",
      "se dérouler",
      "se mettre",
      "se remettre",
      "se situer",
      "se suicider",
      "se terminer",
      "se transformer",
      "sembler",
      "sentir",
      "siffler",
      "situer",
      "soutenir",
      "spécialiser",
      "suicider",
      "surprendre",
      "terminer",
      "tomber",
      "traduire",
      "transformer",
      "traîner",
      "visiter",
      "vivre",
      "vouloir",
      "voyager",
      "éclater",
      "écrire",
      "évoluer"
    ],
    "par": [
      "abandonner",
      "abattre",
      "absorber",
      "abuser",
      "affecter",
      "agacer",
      "attaquer",
      "attirer",
      "attraper",
      "aveugler",
      "balayer",
      "blesser",
      "bloquer",
      "causer",
      "classer",
      "commencer",
      "communiquer",
      "concerner",
      "cracher",
      "dominer",
      "doubler",
      "débuter",
      "décevoir",
      "détruire",
      "effrayer",
      "emporter",
      "endommager",
      "entourer",
      "envoyer",
      "examiner",
      "exprimer",
      "fasciner",
      "finir",
      "frapper",
      "gronder",
      "guider",
      "harceler",
      "heurter",
      "humilier",
      "impressionner",
      "intéresser",
      "inventer",
      "jeter",
      "juger",
      "mordre",
      "obséder",
      "paralyser",
      "passer",
      "peindre",
      "percuter",
      "piquer",
      "polluer",
      "prendre",
      "préoccuper",
      "regarder",
      "remplacer",
      "rencontrer",
      "renverser",
      "respecter",
      "respirer",
      "récompenser",
      "régler",
      "résoudre",
      "réveiller",
      "saisir",
      "sauter",
      "se distinguer",
      "se terminer",
      "soutenir",
      "submerger",
      "surprendre",
      "terminer",
      "toucher",
      "transmettre",
      "transporter",
      "tromper",
      "tuer",
      "éblouir",
      "écraser",
      "émouvoir",
      "épuiser",
      "établir",
      "étonner"
    ],
    "pour": [
      "acheter",
      "admirer",
      "appeler",
      "arranger",
      "battre",
      "blâmer",
      "choisir",
      "combattre",
      "connaître",
      "constituer",
      "construire",
      "convenir",
      "critiquer",
      "cuisiner",
      "douer",
      "débrouiller",
      "démener",
      "dépenser",
      "dépêcher",
      "embarquer",
      "embaucher",
      "estimer",
      "excuser",
      "faire",
      "falloir",
      "fatiguer",
      "féliciter",
      "garder",
      "inquiéter",
      "insister",
      "lever",
      "noter",
      "occuper",
      "opter",
      "organiser",
      "ouvrir",
      "partir",
      "passer",
      "payer",
      "poser",
      "postuler",
      "prendre",
      "prier",
      "programmer",
      "préparer",
      "prévoir",
      "punir",
      "remercier",
      "rencontrer",
      "ressentir",
      "réprimander",
      "réputer",
      "réserver",
      "s'arranger",
      "s'arrêter",
      "s'envoler",
      "s'inquiéter",
      "s'unir",
      "sacrifier",
      "se battre",
      "se débrouiller",
      "se lever",
      "se prendre",
      "se préparer",
      "se réunir",
      "signifier",
      "suffire",
      "tenir",
      "travailler",
      "tuer",
      "utiliser",
      "voter",
      "économiser",
      "épouser"
    ],
    "sur": [
      "aboyer",
      "agir",
      "allonger",
      "apparaître",
      "appuyer",
      "asseoir",
      "atterrir",
      "baser",
      "circuler",
      "cliquer",
      "compter",
      "concentrer",
      "couler",
      "danser",
      "dessiner",
      "donner",
      "dormir",
      "débattre",
      "déferler",
      "embarquer",
      "embrasser",
      "empiéter",
      "endormir",
      "enquêter",
      "exister",
      "flotter",
      "fonder",
      "fondre",
      "glisser",
      "grimper",
      "indiquer",
      "informer",
      "insister",
      "installer",
      "laisser",
      "larguer",
      "lire",
      "marcher",
      "mettre",
      "monter",
      "méditer",
      "naviguer",
      "patiner",
      "peser",
      "placer",
      "pleurer",
      "porter",
      "poser",
      "pousser",
      "rejeter",
      "reposer",
      "revenir",
      "rouler",
      "s'allonger",
      "s'appuyer",
      "s'asseoir",
      "s'étendre",
      "savoir",
      "se concentrer",
      "se coucher",
      "se dresser",
      "se pencher",
      "se poser",
      "se reposer",
      "se tenir",
      "se trouver",
      "situer",
      "souffler",
      "suivre",
      "surfer",
      "taper",
      "tirer",
      "tomber",
      "trébucher",
      "veiller",
      "échouer",
      "écrire",
      "étendre"
    ],
    "dans": [
      "allonger",
      "apparaître",
      "asseoir",
      "baigner",
      "balader",
      "blesser",
      "brûler",
      "cacher",
      "chanter",
      "chercher",
      "coincer",
      "couler",
      "courir",
      "croiser",
      "dormir",
      "déambuler",
      "déclencher",
      "détecter",
      "emménager",
      "enfermer",
      "engager",
      "enterrer",
      "entrer",
      "fleurir",
      "flotter",
      "flâner",
      "fumer",
      "garer",
      "grandir",
      "grimper",
      "habiter",
      "immiscer",
      "impliquer",
      "inscrire",
      "intervenir",
      "introduire",
      "jeter",
      "lire",
      "marcher",
      "mettre",
      "monter",
      "mourir",
      "nager",
      "naviguer",
      "naître",
      "noter",
      "noyer",
      "paître",
      "perdre",
      "plonger",
      "poignarder",
      "pousser",
      "promener",
      "pénétrer",
      "pêcher",
      "ranger",
      "regarder",
      "rencontrer",
      "retrouver",
      "revenir",
      "résider",
      "réussir",
      "s'appliquer",
      "s'envelopper",
      "s'immiscer",
      "s'inscrire",
      "s'introduire",
      "s'élever",
      "sauter",
      "scintiller",
      "se baigner",
      "se cacher",
      "se cultiver",
      "se dissoudre",
      "se jeter",
      "se lancer",
      "se noyer",
      "se passer",
      "se perdre",
      "se regarder",
      "se rencontrer",
      "se retirer",
      "se situer",
      "se tenir",
      "se trouver",
      "serrer",
      "sombrer",
      "souffler",
      "spécialiser",
      "suspendre",
      "séjourner",
      "taper",
      "tenir",
      "tomber",
      "traduire",
      "travailler",
      "tremper",
      "trouver",
      "tuer",
      "vivre",
      "voir",
      "voler",
      "voyager",
      "échouer",
      "éclater",
      "écrire",
      "égarer",
      "étudier"
    ],
    "avec": [
      "accueillir",
      "agir",
      "attendre",
      "attraper",
      "battre",
      "bavarder",
      "brûler",
      "chanter",
      "communiquer",
      "comparer",
      "compatir",
      "confondre",
      "coucher",
      "coïncider",
      "danser",
      "discuter",
      "disputer",
      "dormir",
      "débrouiller",
      "décorer",
      "déjeuner",
      "emmener",
      "emménager",
      "emporter",
      "enfuir",
      "ennuyer",
      "entendre",
      "entretenir",
      "expliquer",
      "fâcher",
      "jouer",
      "marier",
      "nager",
      "parler",
      "partager",
      "polir",
      "pêcher",
      "regarder",
      "rester",
      "rimer",
      "rompre",
      "s'accorder",
      "s'entendre",
      "s'entretenir",
      "saluer",
      "se disputer",
      "se marier",
      "se quereller",
      "skier",
      "sortir",
      "sourire",
      "suivre",
      "sympathiser",
      "terminer",
      "traiter",
      "travailler",
      "tuer",
      "venir",
      "vivre",
      "voir",
      "voyager",
      "écouter",
      "étudier",
      "être d'accord"
    ],
    "contre": [
      "appuyer",
      "défendre",
      "fâcher",
      "gagner",
      "lutter",
      "protester",
      "protéger",
      "s'appuyer",
      "se battre",
      "se fâcher",
      "vacciner",
      "voter",
      "échanger"
    ],
    "vers": [
      "avancer",
      "courir",
      "diriger",
      "hâter",
      "se diriger",
      "se tourner",
      "tendre",
      "voler"
    ],
    "chez": [
      "aller",
      "habiter",
      "passer",
      "raccompagner",
      "ramener",
      "reconduire",
      "rentrer",
      "séjourner",
      "travailler"
    ],
    "entre": [
      "choisir",
      "distinguer",
      "grignoter",
      "hésiter",
      "partager"
    ]
  }
};

if (typeof window !== 'undefined') { window.FRENCH_COLLOCATIONS_DATA = FRENCH_COLLOCATIONS_DATA; }
if (typeof module !== 'undefined' && module.exports) { module.exports = FRENCH_COLLOCATIONS_DATA; }
