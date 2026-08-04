// German verb collocations (Rektion) for Dimenticato.  GENERATED — edit
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

var GERMAN_COLLOCATIONS_DATA = {
  "meta": {
    "language": "de",
    "sourceField": "german",
    "totalVerbs": 349,
    "totalExamples": 838,
    "prepositionOrder": [
      "an +A",
      "an +D",
      "auf +A",
      "auf +D",
      "für +A",
      "mit +D",
      "nach +D",
      "über +A",
      "um +A",
      "von +D",
      "vor +D",
      "zu +D",
      "aus +D",
      "bei +D",
      "in +A",
      "in +D",
      "gegen +A",
      "durch +A",
      "unter +D"
    ],
    "prepositionCase": {
      "an +A": "A",
      "an +D": "D",
      "auf +A": "A",
      "auf +D": "D",
      "für +A": "A",
      "mit +D": "D",
      "nach +D": "D",
      "über +A": "A",
      "um +A": "A",
      "von +D": "D",
      "vor +D": "D",
      "zu +D": "D",
      "aus +D": "D",
      "bei +D": "D",
      "in +A": "A",
      "in +D": "D",
      "gegen +A": "A",
      "durch +A": "A",
      "unter +D": "D"
    },
    "prepositionBase": {
      "an +A": "an",
      "an +D": "an",
      "auf +A": "auf",
      "auf +D": "auf",
      "für +A": "für",
      "mit +D": "mit",
      "nach +D": "nach",
      "über +A": "über",
      "um +A": "um",
      "von +D": "von",
      "vor +D": "vor",
      "zu +D": "zu",
      "aus +D": "aus",
      "bei +D": "bei",
      "in +A": "in",
      "in +D": "in",
      "gegen +A": "gegen",
      "durch +A": "durch",
      "unter +D": "unter"
    },
    "caseLabels": {
      "A": "Akkusativ（第四格）",
      "D": "Dativ（第三格）",
      "G": "Genitiv（第二格）"
    },
    "title": "德语动词的介词搭配（Rektion）",
    "note": "介词条目自带支配格：“auf +A”与“auf +D”是两个不同的搭配。",
    "licenses": [
      "Tatoeba CC BY 2.0 FR",
      "Dimenticato (authored)"
    ]
  },
  "verbs": {
    "denken": {
      "display": "denken",
      "prepositions": {
        "an +A": [
          "an die Zukunft denken. 想到未来",
          "Denk ab und zu an mich! 偶尔想想我啊。",
          "Mama, woran denkst du gerade? 妈妈，你在想什么？",
          "Ich bemühe mich, nicht daran zu denken. 我尽量不去想它。",
          "Warum glaubst du, dass ich an dich denke? 你为什么会认为我在想你？"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to think of",
          "chinese": "想起，想到",
          "pattern": "an die Zukunft denken",
          "patternChinese": "想到未来",
          "level": "A2",
          "examples": [
            {
              "de": "an die Zukunft denken",
              "zh": "想到未来",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Denk ab und zu an mich!",
              "zh": "偶尔想想我啊。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Mama, woran denkst du gerade?",
              "zh": "妈妈，你在想什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich bemühe mich, nicht daran zu denken.",
              "zh": "我尽量不去想它。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Warum glaubst du, dass ich an dich denke?",
              "zh": "你为什么会认为我在想你？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich erinnern": {
      "display": "sich erinnern",
      "prepositions": {
        "an +A": [
          "sich an die Kindheit erinnern. 回忆起童年",
          "Erinnerst du dich an mich? 你记得我么?",
          "Ach ja, ich erinnere mich daran. 哦，对！我记得那个。",
          "Du erinnerst mich an mich selbst. 你让我想起我自己。",
          "Erinnerst du dich noch an meinen Namen? 你还记得我的名字吗？"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to remember",
          "chinese": "回忆起",
          "pattern": "sich an die Kindheit erinnern",
          "patternChinese": "回忆起童年",
          "level": "B1",
          "examples": [
            {
              "de": "sich an die Kindheit erinnern",
              "zh": "回忆起童年",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Erinnerst du dich an mich?",
              "zh": "你记得我么?",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ach ja, ich erinnere mich daran.",
              "zh": "哦，对！我记得那个。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du erinnerst mich an mich selbst.",
              "zh": "你让我想起我自己。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Erinnerst du dich noch an meinen Namen?",
              "zh": "你还记得我的名字吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "erinnern": {
      "display": "erinnern",
      "prepositions": {
        "an +A": [
          "jemanden an den Termin erinnern. 提醒某人有约",
          "Erinnerst du dich an mich? 你记得我么?",
          "Ach ja, ich erinnere mich daran. 哦，对！我记得那个。",
          "Du erinnerst mich an mich selbst. 你让我想起我自己。",
          "Erinnerst du dich noch an meinen Namen? 你还记得我的名字吗？"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to remind sb of",
          "chinese": "提醒，使想起",
          "pattern": "jemanden an den Termin erinnern",
          "patternChinese": "提醒某人有约",
          "level": "B1",
          "examples": [
            {
              "de": "jemanden an den Termin erinnern",
              "zh": "提醒某人有约",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Erinnerst du dich an mich?",
              "zh": "你记得我么?",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ach ja, ich erinnere mich daran.",
              "zh": "哦，对！我记得那个。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du erinnerst mich an mich selbst.",
              "zh": "你让我想起我自己。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Erinnerst du dich noch an meinen Namen?",
              "zh": "你还记得我的名字吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich gewöhnen": {
      "display": "sich gewöhnen",
      "prepositions": {
        "an +A": [
          "sich an das Klima gewöhnen. 习惯这里的气候",
          "Ich bin daran gewöhnt. 我习惯了。",
          "Daran gewöhnst du dich. 你会习惯的。",
          "Du wirst dich daran gewöhnen. 你会习惯的。",
          "Inzwischen habe ich mich daran gewöhnt. 我现在已经习惯它了。",
          "sich an den Lärm gewöhnen. 习惯噪音"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to get used to",
          "chinese": "习惯于",
          "pattern": "sich an das Klima gewöhnen",
          "patternChinese": "习惯这里的气候",
          "level": "B1",
          "examples": [
            {
              "de": "sich an das Klima gewöhnen",
              "zh": "习惯这里的气候",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich bin daran gewöhnt.",
              "zh": "我习惯了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Daran gewöhnst du dich.",
              "zh": "你会习惯的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du wirst dich daran gewöhnen.",
              "zh": "你会习惯的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Inzwischen habe ich mich daran gewöhnt.",
              "zh": "我现在已经习惯它了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to get used to",
          "chinese": "习惯于",
          "pattern": "sich an den Lärm gewöhnen",
          "patternChinese": "习惯噪音",
          "level": "B1",
          "examples": [
            {
              "de": "sich an den Lärm gewöhnen",
              "zh": "习惯噪音",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "glauben": {
      "display": "glauben",
      "prepositions": {
        "an +A": [
          "an das Gute glauben. 相信善良",
          "Ich glaube an dich. 我相信你。",
          "Nicht wenige glauben immer noch daran. 还有不少人依然相信呢。",
          "Ich glaube daran, dass Wissen Macht ist. 我相信，知识就是力量。",
          "Warum glaubst du, dass ich an dich denke? 你为什么会认为我在想你？"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to believe in",
          "chinese": "相信，信仰",
          "pattern": "an das Gute glauben",
          "patternChinese": "相信善良",
          "level": "B1",
          "examples": [
            {
              "de": "an das Gute glauben",
              "zh": "相信善良",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich glaube an dich.",
              "zh": "我相信你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Nicht wenige glauben immer noch daran.",
              "zh": "还有不少人依然相信呢。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich glaube daran, dass Wissen Macht ist.",
              "zh": "我相信，知识就是力量。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Warum glaubst du, dass ich an dich denke?",
              "zh": "你为什么会认为我在想你？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich wenden": {
      "display": "sich wenden",
      "prepositions": {
        "an +A": [
          "sich an den Chef wenden. 去找老板",
          "Wenden Sie sich an meinen Kollegen. 请您跟我的同事谈谈。",
          "Im Notfall wende dich an meinen Agenten. 万一有紧急情况，联系我的代理人。",
          "Ich weiß nicht, an wen ich mich wenden soll. 我不知道该和谁商量好。",
          "Falls du irgendeine Frage hast, kannst du dich an mich wenden. 如果你有任何问题，你可以向我提问。"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to turn to sb",
          "chinese": "求助于，找某人",
          "pattern": "sich an den Chef wenden",
          "patternChinese": "去找老板",
          "level": "B2",
          "examples": [
            {
              "de": "sich an den Chef wenden",
              "zh": "去找老板",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Wenden Sie sich an meinen Kollegen.",
              "zh": "请您跟我的同事谈谈。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Im Notfall wende dich an meinen Agenten.",
              "zh": "万一有紧急情况，联系我的代理人。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich weiß nicht, an wen ich mich wenden soll.",
              "zh": "我不知道该和谁商量好。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Falls du irgendeine Frage hast, kannst du dich an mich wenden.",
              "zh": "如果你有任何问题，你可以向我提问。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "schreiben": {
      "display": "schreiben",
      "prepositions": {
        "an +A": [
          "einen Brief an die Firma schreiben. 给公司写信",
          "Tom schreibt einen Brief an seinen besten Freund. 汤姆在给他最好的朋友写信。"
        ],
        "über +A": [
          "über seine Reise schreiben. 写他的旅行"
        ]
      },
      "prepositionOrder": [
        "an +A",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to write to sb",
          "chinese": "写信给",
          "pattern": "einen Brief an die Firma schreiben",
          "patternChinese": "给公司写信",
          "level": "A2",
          "examples": [
            {
              "de": "einen Brief an die Firma schreiben",
              "zh": "给公司写信",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Tom schreibt einen Brief an seinen besten Freund.",
              "zh": "汤姆在给他最好的朋友写信。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to write about",
          "chinese": "写关于…的文章",
          "pattern": "über seine Reise schreiben",
          "patternChinese": "写他的旅行",
          "level": "A2",
          "examples": [
            {
              "de": "über seine Reise schreiben",
              "zh": "写他的旅行",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich richten": {
      "display": "sich richten",
      "prepositions": {
        "an +A": [
          "Das Angebot richtet sich an Studenten. 该优惠面向学生"
        ],
        "gegen +A": [
          "Die Kritik richtet sich gegen den Plan. 批评针对该计划"
        ],
        "nach +D": [
          "sich nach den Regeln richten. 按规定办"
        ]
      },
      "prepositionOrder": [
        "an +A",
        "gegen +A",
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to be addressed to",
          "chinese": "面向，针对",
          "pattern": "Das Angebot richtet sich an Studenten",
          "patternChinese": "该优惠面向学生",
          "level": "B2",
          "examples": [
            {
              "de": "Das Angebot richtet sich an Studenten",
              "zh": "该优惠面向学生",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to be directed against",
          "chinese": "针对",
          "pattern": "Die Kritik richtet sich gegen den Plan",
          "patternChinese": "批评针对该计划",
          "level": "C1",
          "examples": [
            {
              "de": "Die Kritik richtet sich gegen den Plan",
              "zh": "批评针对该计划",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to go by",
          "chinese": "依照",
          "pattern": "sich nach den Regeln richten",
          "patternChinese": "按规定办",
          "level": "B2",
          "examples": [
            {
              "de": "sich nach den Regeln richten",
              "zh": "按规定办",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "appellieren": {
      "display": "appellieren",
      "prepositions": {
        "an +A": [
          "an die Vernunft appellieren. 诉诸理性"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to appeal to",
          "chinese": "呼吁，诉诸",
          "pattern": "an die Vernunft appellieren",
          "patternChinese": "诉诸理性",
          "level": "C1",
          "examples": [
            {
              "de": "an die Vernunft appellieren",
              "zh": "诉诸理性",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich anpassen": {
      "display": "sich anpassen",
      "prepositions": {
        "an +A": [
          "sich an neue Regeln anpassen. 适应新规则"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to adapt to",
          "chinese": "适应",
          "pattern": "sich an neue Regeln anpassen",
          "patternChinese": "适应新规则",
          "level": "B2",
          "examples": [
            {
              "de": "sich an neue Regeln anpassen",
              "zh": "适应新规则",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "grenzen": {
      "display": "grenzen",
      "prepositions": {
        "an +A": [
          "Deutschland grenzt an Polen. 德国与波兰接壤"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to border on",
          "chinese": "与…接壤",
          "pattern": "Deutschland grenzt an Polen",
          "patternChinese": "德国与波兰接壤",
          "level": "B2",
          "examples": [
            {
              "de": "Deutschland grenzt an Polen",
              "zh": "德国与波兰接壤",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich klammern": {
      "display": "sich klammern",
      "prepositions": {
        "an +A": [
          "sich an die Hoffnung klammern. 抓住希望不放"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to cling to",
          "chinese": "紧抓不放",
          "pattern": "sich an die Hoffnung klammern",
          "patternChinese": "抓住希望不放",
          "level": "C1",
          "examples": [
            {
              "de": "sich an die Hoffnung klammern",
              "zh": "抓住希望不放",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "liefern": {
      "display": "liefern",
      "prepositions": {
        "an +A": [
          "Waren an den Kunden liefern. 把货交给客户"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to deliver to",
          "chinese": "交付给",
          "pattern": "Waren an den Kunden liefern",
          "patternChinese": "把货交给客户",
          "level": "B2",
          "examples": [
            {
              "de": "Waren an den Kunden liefern",
              "zh": "把货交给客户",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verkaufen": {
      "display": "verkaufen",
      "prepositions": {
        "an +A": [
          "das Auto an einen Freund verkaufen. 把车卖给朋友"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to sell to",
          "chinese": "卖给",
          "pattern": "das Auto an einen Freund verkaufen",
          "patternChinese": "把车卖给朋友",
          "level": "B1",
          "examples": [
            {
              "de": "das Auto an einen Freund verkaufen",
              "zh": "把车卖给朋友",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "teilnehmen": {
      "display": "teilnehmen",
      "prepositions": {
        "an +D": [
          "an einem Kurs teilnehmen. 参加课程"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to take part in",
          "chinese": "参加",
          "pattern": "an einem Kurs teilnehmen",
          "patternChinese": "参加课程",
          "level": "B1",
          "examples": [
            {
              "de": "an einem Kurs teilnehmen",
              "zh": "参加课程",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "arbeiten": {
      "display": "arbeiten",
      "prepositions": {
        "an +D": [
          "an einem Projekt arbeiten. 做一个项目",
          "Der Schriftsteller arbeitet an einem neuen Buch. 那个作家正在写新书。"
        ],
        "bei +D": [
          "bei einer Bank arbeiten. 在银行工作",
          "Er arbeitet beim Sozialamt. 他在福利办事处上班。",
          "Das Mädchen, das beim Bäcker arbeitet, ist niedlich. 在面包房工作的姑娘很可爱。",
          "Ich arbeite bei Alibaba. 我在阿里巴巴工作",
          "Er arbeitet bei einer Bank. 他在银行工作。"
        ]
      },
      "prepositionOrder": [
        "an +D",
        "bei +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to work on",
          "chinese": "从事，忙于",
          "pattern": "an einem Projekt arbeiten",
          "patternChinese": "做一个项目",
          "level": "B1",
          "examples": [
            {
              "de": "an einem Projekt arbeiten",
              "zh": "做一个项目",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Der Schriftsteller arbeitet an einem neuen Buch.",
              "zh": "那个作家正在写新书。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to work for",
          "chinese": "在…就职",
          "pattern": "bei einer Bank arbeiten",
          "patternChinese": "在银行工作",
          "level": "A2",
          "examples": [
            {
              "de": "bei einer Bank arbeiten",
              "zh": "在银行工作",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er arbeitet beim Sozialamt.",
              "zh": "他在福利办事处上班。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das Mädchen, das beim Bäcker arbeitet, ist niedlich.",
              "zh": "在面包房工作的姑娘很可爱。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich arbeite bei Alibaba.",
              "zh": "我在阿里巴巴工作",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er arbeitet bei einer Bank.",
              "zh": "他在银行工作。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "leiden": {
      "display": "leiden",
      "prepositions": {
        "an +D": [
          "an einer Grippe leiden. 患流感"
        ],
        "unter +D": [
          "unter dem Lärm leiden. 受噪音之苦"
        ]
      },
      "prepositionOrder": [
        "an +D",
        "unter +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to suffer from (an illness)",
          "chinese": "患（病）",
          "pattern": "an einer Grippe leiden",
          "patternChinese": "患流感",
          "level": "B2",
          "examples": [
            {
              "de": "an einer Grippe leiden",
              "zh": "患流感",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "unter",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "unter +D",
          "english": "to suffer from (conditions)",
          "chinese": "因…而痛苦",
          "pattern": "unter dem Lärm leiden",
          "patternChinese": "受噪音之苦",
          "level": "B2",
          "examples": [
            {
              "de": "unter dem Lärm leiden",
              "zh": "受噪音之苦",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sterben": {
      "display": "sterben",
      "prepositions": {
        "an +D": [
          "an einer Krankheit sterben. 死于疾病"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to die of",
          "chinese": "死于",
          "pattern": "an einer Krankheit sterben",
          "patternChinese": "死于疾病",
          "level": "B1",
          "examples": [
            {
              "de": "an einer Krankheit sterben",
              "zh": "死于疾病",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "zweifeln": {
      "display": "zweifeln",
      "prepositions": {
        "an +D": [
          "an seinen Worten zweifeln. 怀疑他的话",
          "Ich zweifel nicht daran. 我没有疑问。"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to doubt",
          "chinese": "怀疑",
          "pattern": "an seinen Worten zweifeln",
          "patternChinese": "怀疑他的话",
          "level": "B2",
          "examples": [
            {
              "de": "an seinen Worten zweifeln",
              "zh": "怀疑他的话",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich zweifel nicht daran.",
              "zh": "我没有疑问。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "erkennen": {
      "display": "erkennen",
      "prepositions": {
        "an +D": [
          "jemanden an der Stimme erkennen. 凭声音认出某人"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to recognize by",
          "chinese": "凭…认出",
          "pattern": "jemanden an der Stimme erkennen",
          "patternChinese": "凭声音认出某人",
          "level": "B2",
          "examples": [
            {
              "de": "jemanden an der Stimme erkennen",
              "zh": "凭声音认出某人",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "liegen": {
      "display": "liegen",
      "prepositions": {
        "an +D": [
          "Es liegt am Wetter. 这是天气的原因",
          "Mein Haus liegt am Rand der Stadt. 我的家在那座城市的郊外.",
          "Die Kirche liegt am Fuße des Berges. 教堂位于山脚。",
          "Es liegt daran, dass du ein Mädchen bist. 那是因为你是女生。",
          "Das liegt daran, dass du ein Mädchen bist. 那是因为你是女生。"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be due to",
          "chinese": "原因在于",
          "pattern": "Es liegt am Wetter",
          "patternChinese": "这是天气的原因",
          "level": "B1",
          "examples": [
            {
              "de": "Es liegt am Wetter",
              "zh": "这是天气的原因",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Mein Haus liegt am Rand der Stadt.",
              "zh": "我的家在那座城市的郊外.",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Die Kirche liegt am Fuße des Berges.",
              "zh": "教堂位于山脚。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es liegt daran, dass du ein Mädchen bist.",
              "zh": "那是因为你是女生。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das liegt daran, dass du ein Mädchen bist.",
              "zh": "那是因为你是女生。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "hindern": {
      "display": "hindern",
      "prepositions": {
        "an +D": [
          "jemanden an der Arbeit hindern. 妨碍某人工作"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to prevent from",
          "chinese": "阻止",
          "pattern": "jemanden an der Arbeit hindern",
          "patternChinese": "妨碍某人工作",
          "level": "B2",
          "examples": [
            {
              "de": "jemanden an der Arbeit hindern",
              "zh": "妨碍某人工作",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich beteiligen": {
      "display": "sich beteiligen",
      "prepositions": {
        "an +D": [
          "sich an der Diskussion beteiligen. 参与讨论",
          "Würdest du dich an dem Projekt beteiligen? 你愿意加入这个项目吗？",
          "Ich habe mich nicht an dem Gespräch beteiligt. 我没有参与对话。",
          "Er stritt ab, an dem Verbrechen beteiligt gewesen zu sein. 他否认参与了犯罪。",
          "sich an der Firma beteiligen. 参股这家公司"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to participate in",
          "chinese": "参与",
          "pattern": "sich an der Diskussion beteiligen",
          "patternChinese": "参与讨论",
          "level": "B2",
          "examples": [
            {
              "de": "sich an der Diskussion beteiligen",
              "zh": "参与讨论",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Würdest du dich an dem Projekt beteiligen?",
              "zh": "你愿意加入这个项目吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe mich nicht an dem Gespräch beteiligt.",
              "zh": "我没有参与对话。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er stritt ab, an dem Verbrechen beteiligt gewesen zu sein.",
              "zh": "他否认参与了犯罪。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to have a share in",
          "chinese": "参股，参与",
          "pattern": "sich an der Firma beteiligen",
          "patternChinese": "参股这家公司",
          "level": "B2",
          "examples": [
            {
              "de": "sich an der Firma beteiligen",
              "zh": "参股这家公司",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich orientieren": {
      "display": "sich orientieren",
      "prepositions": {
        "an +D": [
          "sich an den Vorgaben orientieren. 以规定为准"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to take one's bearings from",
          "chinese": "以…为准",
          "pattern": "sich an den Vorgaben orientieren",
          "patternChinese": "以规定为准",
          "level": "C1",
          "examples": [
            {
              "de": "sich an den Vorgaben orientieren",
              "zh": "以规定为准",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich rächen": {
      "display": "sich rächen",
      "prepositions": {
        "an +D": [
          "sich an dem Gegner rächen. 向对手报复"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to take revenge on",
          "chinese": "向…报复",
          "pattern": "sich an dem Gegner rächen",
          "patternChinese": "向对手报复",
          "level": "C1",
          "examples": [
            {
              "de": "sich an dem Gegner rächen",
              "zh": "向对手报复",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "mangeln": {
      "display": "mangeln",
      "prepositions": {
        "an +D": [
          "Es mangelt an Zeit. 缺少时间"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be lacking in",
          "chinese": "缺少",
          "pattern": "Es mangelt an Zeit",
          "patternChinese": "缺少时间",
          "level": "C1",
          "examples": [
            {
              "de": "Es mangelt an Zeit",
              "zh": "缺少时间",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "fehlen": {
      "display": "fehlen",
      "prepositions": {
        "an +D": [
          "Es fehlt an Personal. 人手不足"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be short of",
          "chinese": "缺乏",
          "pattern": "Es fehlt an Personal",
          "patternChinese": "人手不足",
          "level": "B2",
          "examples": [
            {
              "de": "Es fehlt an Personal",
              "zh": "人手不足",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "zunehmen": {
      "display": "zunehmen",
      "prepositions": {
        "an +D": [
          "an Gewicht zunehmen. 体重增加",
          "an Bedeutung zunehmen. 变得更重要"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to increase in",
          "chinese": "在…方面增加",
          "pattern": "an Gewicht zunehmen",
          "patternChinese": "体重增加",
          "level": "B2",
          "examples": [
            {
              "de": "an Gewicht zunehmen",
              "zh": "体重增加",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to gain in",
          "chinese": "增长",
          "pattern": "an Bedeutung zunehmen",
          "patternChinese": "变得更重要",
          "level": "C1",
          "examples": [
            {
              "de": "an Bedeutung zunehmen",
              "zh": "变得更重要",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich erfreuen": {
      "display": "sich erfreuen",
      "prepositions": {
        "an +D": [
          "sich an der Musik erfreuen. 欣赏音乐",
          "Der Einsame erfreut sich am Beobachten von Ameisen. 那个孤僻的人以观察蚂蚁取乐。"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to take pleasure in",
          "chinese": "以…为乐",
          "pattern": "sich an der Musik erfreuen",
          "patternChinese": "欣赏音乐",
          "level": "C1",
          "examples": [
            {
              "de": "sich an der Musik erfreuen",
              "zh": "欣赏音乐",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Der Einsame erfreut sich am Beobachten von Ameisen.",
              "zh": "那个孤僻的人以观察蚂蚁取乐。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "warten": {
      "display": "warten",
      "prepositions": {
        "auf +A": [
          "auf den Bus warten. 等公交车",
          "Ich warte auf ihn. 我在等他。",
          "Auf wen wartest du? 你在等谁?",
          "Warten Sie auf mich! 等等我。",
          "Warte unten auf mich. 在楼下等我"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to wait for",
          "chinese": "等待",
          "pattern": "auf den Bus warten",
          "patternChinese": "等公交车",
          "level": "A1",
          "examples": [
            {
              "de": "auf den Bus warten",
              "zh": "等公交车",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich warte auf ihn.",
              "zh": "我在等他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Auf wen wartest du?",
              "zh": "你在等谁?",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Warten Sie auf mich!",
              "zh": "等等我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Warte unten auf mich.",
              "zh": "在楼下等我",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich freuen": {
      "display": "sich freuen",
      "prepositions": {
        "auf +A": [
          "sich auf den Urlaub freuen. 期待假期",
          "Er freut sich darauf. 他对此很期待。",
          "Ich freue mich darauf. 我很期待哦。",
          "Ich freue mich auf Ihren Besuch. 我期待着您的光临。",
          "Ich freue mich darauf, dich zu treffen. 我期待见到你。"
        ],
        "über +A": [
          "sich über das Geschenk freuen. 为礼物高兴",
          "Ich freue mich über deinen Erfolg. 我为你的成功感到高兴。"
        ]
      },
      "prepositionOrder": [
        "auf +A",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to look forward to",
          "chinese": "期待（未来的事）",
          "pattern": "sich auf den Urlaub freuen",
          "patternChinese": "期待假期",
          "level": "A2",
          "examples": [
            {
              "de": "sich auf den Urlaub freuen",
              "zh": "期待假期",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er freut sich darauf.",
              "zh": "他对此很期待。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich freue mich darauf.",
              "zh": "我很期待哦。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich freue mich auf Ihren Besuch.",
              "zh": "我期待着您的光临。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich freue mich darauf, dich zu treffen.",
              "zh": "我期待见到你。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to be glad about",
          "chinese": "为…高兴（已发生的事）",
          "pattern": "sich über das Geschenk freuen",
          "patternChinese": "为礼物高兴",
          "level": "A2",
          "examples": [
            {
              "de": "sich über das Geschenk freuen",
              "zh": "为礼物高兴",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich freue mich über deinen Erfolg.",
              "zh": "我为你的成功感到高兴。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "hoffen": {
      "display": "hoffen",
      "prepositions": {
        "auf +A": [
          "auf besseres Wetter hoffen. 盼望天气转好"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to hope for",
          "chinese": "盼望，希望得到",
          "pattern": "auf besseres Wetter hoffen",
          "patternChinese": "盼望天气转好",
          "level": "B1",
          "examples": [
            {
              "de": "auf besseres Wetter hoffen",
              "zh": "盼望天气转好",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "achten": {
      "display": "achten",
      "prepositions": {
        "auf +A": [
          "auf die Gesundheit achten. 注意健康",
          "Achte nicht auf ihn. 不用理他。",
          "Warum achtest du nicht auf mich? 为什么你不理我？",
          "Ich achte nicht darauf, was sie sagen. 我不在意他们说什么。",
          "Achtet darauf, dass ihr vor um fünf hier seid. 注意，你们最迟要在五点钟之前到这儿。"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to pay attention to",
          "chinese": "注意",
          "pattern": "auf die Gesundheit achten",
          "patternChinese": "注意健康",
          "level": "B1",
          "examples": [
            {
              "de": "auf die Gesundheit achten",
              "zh": "注意健康",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Achte nicht auf ihn.",
              "zh": "不用理他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Warum achtest du nicht auf mich?",
              "zh": "为什么你不理我？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich achte nicht darauf, was sie sagen.",
              "zh": "我不在意他们说什么。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Achtet darauf, dass ihr vor um fünf hier seid.",
              "zh": "注意，你们最迟要在五点钟之前到这儿。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "aufpassen": {
      "display": "aufpassen",
      "prepositions": {
        "auf +A": [
          "auf das Kind aufpassen. 照看孩子",
          "Pass auf dich auf. 照顾好自己。",
          "Pass auf dich auf! 照顾好自己。",
          "Pass gut auf dich auf. 照顾好你自己。",
          "Passen Sie auf Ihren Kopf auf. 小心碰头。"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to look after",
          "chinese": "照看",
          "pattern": "auf das Kind aufpassen",
          "patternChinese": "照看孩子",
          "level": "A2",
          "examples": [
            {
              "de": "auf das Kind aufpassen",
              "zh": "照看孩子",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Pass auf dich auf.",
              "zh": "照顾好自己。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Pass auf dich auf!",
              "zh": "照顾好自己。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Pass gut auf dich auf.",
              "zh": "照顾好你自己。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Passen Sie auf Ihren Kopf auf.",
              "zh": "小心碰头。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich verlassen": {
      "display": "sich verlassen",
      "prepositions": {
        "auf +A": [
          "sich auf einen Freund verlassen. 信赖朋友",
          "Ich verlasse mich auf dich. 我信任你。",
          "Du kannst dich auf ihn verlassen. 你可以依靠他。",
          "Er hat keinen Freund, auf den er sich verlassen kann. 他没有一个能依靠的朋友。"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to rely on",
          "chinese": "依靠，信赖",
          "pattern": "sich auf einen Freund verlassen",
          "patternChinese": "信赖朋友",
          "level": "B1",
          "examples": [
            {
              "de": "sich auf einen Freund verlassen",
              "zh": "信赖朋友",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich verlasse mich auf dich.",
              "zh": "我信任你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du kannst dich auf ihn verlassen.",
              "zh": "你可以依靠他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er hat keinen Freund, auf den er sich verlassen kann.",
              "zh": "他没有一个能依靠的朋友。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich vorbereiten": {
      "display": "sich vorbereiten",
      "prepositions": {
        "auf +A": [
          "sich auf die Prüfung vorbereiten. 准备考试"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to prepare for",
          "chinese": "为…做准备",
          "pattern": "sich auf die Prüfung vorbereiten",
          "patternChinese": "准备考试",
          "level": "B1",
          "examples": [
            {
              "de": "sich auf die Prüfung vorbereiten",
              "zh": "准备考试",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich konzentrieren": {
      "display": "sich konzentrieren",
      "prepositions": {
        "auf +A": [
          "sich auf die Arbeit konzentrieren. 专心工作",
          "Er konzentrierte sich aufs Lernen. 他专心于学习。"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to concentrate on",
          "chinese": "集中于",
          "pattern": "sich auf die Arbeit konzentrieren",
          "patternChinese": "专心工作",
          "level": "B1",
          "examples": [
            {
              "de": "sich auf die Arbeit konzentrieren",
              "zh": "专心工作",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er konzentrierte sich aufs Lernen.",
              "zh": "他专心于学习。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich beziehen": {
      "display": "sich beziehen",
      "prepositions": {
        "auf +A": [
          "sich auf Ihr Schreiben beziehen. 参照您的来信",
          "Beziehst du dich auf mich? 你在说我吗？"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to refer to",
          "chinese": "涉及，参照",
          "pattern": "sich auf Ihr Schreiben beziehen",
          "patternChinese": "参照您的来信",
          "level": "B2",
          "examples": [
            {
              "de": "sich auf Ihr Schreiben beziehen",
              "zh": "参照您的来信",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Beziehst du dich auf mich?",
              "zh": "你在说我吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "verzichten": {
      "display": "verzichten",
      "prepositions": {
        "auf +A": [
          "auf Zucker verzichten. 不吃糖"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to do without",
          "chinese": "放弃",
          "pattern": "auf Zucker verzichten",
          "patternChinese": "不吃糖",
          "level": "B2",
          "examples": [
            {
              "de": "auf Zucker verzichten",
              "zh": "不吃糖",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "reagieren": {
      "display": "reagieren",
      "prepositions": {
        "auf +A": [
          "auf die Kritik reagieren. 回应批评"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to react to",
          "chinese": "对…做出反应",
          "pattern": "auf die Kritik reagieren",
          "patternChinese": "回应批评",
          "level": "B1",
          "examples": [
            {
              "de": "auf die Kritik reagieren",
              "zh": "回应批评",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "antworten": {
      "display": "antworten",
      "prepositions": {
        "auf +A": [
          "auf die Frage antworten. 回答问题",
          "auf den Brief antworten. 回信"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to answer sth",
          "chinese": "回答",
          "pattern": "auf die Frage antworten",
          "patternChinese": "回答问题",
          "level": "A2",
          "examples": [
            {
              "de": "auf die Frage antworten",
              "zh": "回答问题",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to reply to",
          "chinese": "答复",
          "pattern": "auf den Brief antworten",
          "patternChinese": "回信",
          "level": "A2",
          "examples": [
            {
              "de": "auf den Brief antworten",
              "zh": "回信",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "ankommen": {
      "display": "ankommen",
      "prepositions": {
        "auf +A": [
          "Es kommt auf das Wetter an. 这取决于天气",
          "Es kommt darauf an. 不一定。",
          "Das kommt auf den Zusammenhang an. 这得看情况。",
          "Es kommt nicht darauf an, was du liest, sondern wie du liest. 重要的是你怎么读，而不是你读什么。"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to depend on",
          "chinese": "取决于",
          "pattern": "Es kommt auf das Wetter an",
          "patternChinese": "这取决于天气",
          "level": "B1",
          "examples": [
            {
              "de": "Es kommt auf das Wetter an",
              "zh": "这取决于天气",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Es kommt darauf an.",
              "zh": "不一定。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das kommt auf den Zusammenhang an.",
              "zh": "这得看情况。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es kommt nicht darauf an, was du liest, sondern wie du liest.",
              "zh": "重要的是你怎么读，而不是你读什么。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich einigen": {
      "display": "sich einigen",
      "prepositions": {
        "auf +A": [
          "sich auf einen Termin einigen. 商定日期"
        ],
        "über +A": [
          "sich über den Preis einigen. 就价格达成一致"
        ]
      },
      "prepositionOrder": [
        "auf +A",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to agree on",
          "chinese": "商定",
          "pattern": "sich auf einen Termin einigen",
          "patternChinese": "商定日期",
          "level": "B2",
          "examples": [
            {
              "de": "sich auf einen Termin einigen",
              "zh": "商定日期",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to come to an agreement on",
          "chinese": "就…达成一致",
          "pattern": "sich über den Preis einigen",
          "patternChinese": "就价格达成一致",
          "level": "B2",
          "examples": [
            {
              "de": "sich über den Preis einigen",
              "zh": "就价格达成一致",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "hinweisen": {
      "display": "hinweisen",
      "prepositions": {
        "auf +A": [
          "auf die Gefahr hinweisen. 指出危险"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to point out",
          "chinese": "指出",
          "pattern": "auf die Gefahr hinweisen",
          "patternChinese": "指出危险",
          "level": "B2",
          "examples": [
            {
              "de": "auf die Gefahr hinweisen",
              "zh": "指出危险",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich beschränken": {
      "display": "sich beschränken",
      "prepositions": {
        "auf +A": [
          "sich auf das Wichtigste beschränken. 只讲重点"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to be limited to",
          "chinese": "限于",
          "pattern": "sich auf das Wichtigste beschränken",
          "patternChinese": "只讲重点",
          "level": "C1",
          "examples": [
            {
              "de": "sich auf das Wichtigste beschränken",
              "zh": "只讲重点",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "drängen": {
      "display": "drängen",
      "prepositions": {
        "auf +A": [
          "auf eine Antwort drängen. 催要答复",
          "Die EU drängt seit Jahren darauf, dass Italien seinen Schuldenberg abträgt. 欧盟对意大利已施压多年，要求其解决掉堆积如山的债务。"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to press for",
          "chinese": "催促",
          "pattern": "auf eine Antwort drängen",
          "patternChinese": "催要答复",
          "level": "C1",
          "examples": [
            {
              "de": "auf eine Antwort drängen",
              "zh": "催要答复",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Die EU drängt seit Jahren darauf, dass Italien seinen Schuldenberg abträgt.",
              "zh": "欧盟对意大利已施压多年，要求其解决掉堆积如山的债务。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich spezialisieren": {
      "display": "sich spezialisieren",
      "prepositions": {
        "auf +A": [
          "sich auf Kinderheilkunde spezialisieren. 专攻儿科"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to specialize in",
          "chinese": "专门从事",
          "pattern": "sich auf Kinderheilkunde spezialisieren",
          "patternChinese": "专攻儿科",
          "level": "C1",
          "examples": [
            {
              "de": "sich auf Kinderheilkunde spezialisieren",
              "zh": "专攻儿科",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "zurückführen": {
      "display": "zurückführen",
      "prepositions": {
        "auf +A": [
          "den Fehler auf Stress zurückführen. 把错误归因于压力"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to attribute to",
          "chinese": "归因于",
          "pattern": "den Fehler auf Stress zurückführen",
          "patternChinese": "把错误归因于压力",
          "level": "C1",
          "examples": [
            {
              "de": "den Fehler auf Stress zurückführen",
              "zh": "把错误归因于压力",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich stürzen": {
      "display": "sich stürzen",
      "prepositions": {
        "auf +A": [
          "sich auf das Essen stürzen. 扑向食物"
        ],
        "in +A": [
          "sich in die Arbeit stürzen. 一头扎进工作",
          "Er stürzte in den Abgrund. 他坠入了深渊。"
        ]
      },
      "prepositionOrder": [
        "auf +A",
        "in +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to pounce on",
          "chinese": "扑向",
          "pattern": "sich auf das Essen stürzen",
          "patternChinese": "扑向食物",
          "level": "C1",
          "examples": [
            {
              "de": "sich auf das Essen stürzen",
              "zh": "扑向食物",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to plunge into",
          "chinese": "投入",
          "pattern": "sich in die Arbeit stürzen",
          "patternChinese": "一头扎进工作",
          "level": "C1",
          "examples": [
            {
              "de": "sich in die Arbeit stürzen",
              "zh": "一头扎进工作",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er stürzte in den Abgrund.",
              "zh": "他坠入了深渊。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "schießen": {
      "display": "schießen",
      "prepositions": {
        "auf +A": [
          "auf das Ziel schießen. 向目标射击"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to shoot at",
          "chinese": "向…射击",
          "pattern": "auf das Ziel schießen",
          "patternChinese": "向目标射击",
          "level": "B2",
          "examples": [
            {
              "de": "auf das Ziel schießen",
              "zh": "向目标射击",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "zielen": {
      "display": "zielen",
      "prepositions": {
        "auf +A": [
          "auf den Erfolg zielen. 以成功为目标"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to aim at",
          "chinese": "瞄准，以…为目标",
          "pattern": "auf den Erfolg zielen",
          "patternChinese": "以成功为目标",
          "level": "C1",
          "examples": [
            {
              "de": "auf den Erfolg zielen",
              "zh": "以成功为目标",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich einlassen": {
      "display": "sich einlassen",
      "prepositions": {
        "auf +A": [
          "sich auf ein Risiko einlassen. 冒险一试"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to get involved in",
          "chinese": "涉足，答应",
          "pattern": "sich auf ein Risiko einlassen",
          "patternChinese": "冒险一试",
          "level": "C1",
          "examples": [
            {
              "de": "sich auf ein Risiko einlassen",
              "zh": "冒险一试",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "aufmerksam machen": {
      "display": "aufmerksam machen",
      "prepositions": {
        "auf +A": [
          "auf ein Problem aufmerksam machen. 提请注意问题"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to draw attention to",
          "chinese": "提请注意",
          "pattern": "auf ein Problem aufmerksam machen",
          "patternChinese": "提请注意问题",
          "level": "B2",
          "examples": [
            {
              "de": "auf ein Problem aufmerksam machen",
              "zh": "提请注意问题",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Wert legen": {
      "display": "Wert legen",
      "prepositions": {
        "auf +A": [
          "auf Pünktlichkeit Wert legen. 重视守时",
          "Wir sollten nicht zu viel Wert aufs Geld legen. 我们不应该把金钱看得太重。"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to attach importance to",
          "chinese": "重视",
          "pattern": "auf Pünktlichkeit Wert legen",
          "patternChinese": "重视守时",
          "level": "B2",
          "examples": [
            {
              "de": "auf Pünktlichkeit Wert legen",
              "zh": "重视守时",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Wir sollten nicht zu viel Wert aufs Geld legen.",
              "zh": "我们不应该把金钱看得太重。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "Rücksicht nehmen": {
      "display": "Rücksicht nehmen",
      "prepositions": {
        "auf +A": [
          "auf die Nachbarn Rücksicht nehmen. 体谅邻居"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to show consideration for",
          "chinese": "体谅",
          "pattern": "auf die Nachbarn Rücksicht nehmen",
          "patternChinese": "体谅邻居",
          "level": "B2",
          "examples": [
            {
              "de": "auf die Nachbarn Rücksicht nehmen",
              "zh": "体谅邻居",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Einfluss nehmen": {
      "display": "Einfluss nehmen",
      "prepositions": {
        "auf +A": [
          "auf die Entscheidung Einfluss nehmen. 影响决定"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to influence",
          "chinese": "施加影响",
          "pattern": "auf die Entscheidung Einfluss nehmen",
          "patternChinese": "影响决定",
          "level": "C1",
          "examples": [
            {
              "de": "auf die Entscheidung Einfluss nehmen",
              "zh": "影响决定",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich auswirken": {
      "display": "sich auswirken",
      "prepositions": {
        "auf +A": [
          "sich auf die Preise auswirken. 影响价格"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to have an effect on",
          "chinese": "对…产生影响",
          "pattern": "sich auf die Preise auswirken",
          "patternChinese": "影响价格",
          "level": "C1",
          "examples": [
            {
              "de": "sich auf die Preise auswirken",
              "zh": "影响价格",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich berufen": {
      "display": "sich berufen",
      "prepositions": {
        "auf +A": [
          "sich auf das Gesetz berufen. 援引法律"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to invoke",
          "chinese": "援引",
          "pattern": "sich auf das Gesetz berufen",
          "patternChinese": "援引法律",
          "level": "C1",
          "examples": [
            {
              "de": "sich auf das Gesetz berufen",
              "zh": "援引法律",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "anspielen": {
      "display": "anspielen",
      "prepositions": {
        "auf +A": [
          "auf den Streit anspielen. 影射那场争吵"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to allude to",
          "chinese": "暗指",
          "pattern": "auf den Streit anspielen",
          "patternChinese": "影射那场争吵",
          "level": "C1",
          "examples": [
            {
              "de": "auf den Streit anspielen",
              "zh": "影射那场争吵",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "trinken": {
      "display": "trinken",
      "prepositions": {
        "auf +A": [
          "auf die Gesundheit trinken. 为健康干杯"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to drink to",
          "chinese": "为…干杯",
          "pattern": "auf die Gesundheit trinken",
          "patternChinese": "为健康干杯",
          "level": "B1",
          "examples": [
            {
              "de": "auf die Gesundheit trinken",
              "zh": "为健康干杯",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "bestehen": {
      "display": "bestehen",
      "prepositions": {
        "auf +D": [
          "auf seinem Recht bestehen. 坚持自己的权利",
          "Sie werden darauf bestehen, dass sie etwas länger bleibt. 他们会坚持要她逗留久一点。"
        ],
        "aus +D": [
          "Die Wohnung besteht aus drei Zimmern. 住房由三个房间组成",
          "Das Kleid besteht aus einem dünnen Stoff. 这件衣服是由薄织物制成的。",
          "Die Brücke besteht aus Holz. 桥是木制的。",
          "Dieser Tisch besteht aus Holz. 这张桌子是木制的。",
          "Die Erde besteht aus Meer und Land. 地球是由海洋和陆地组成的。"
        ],
        "in +D": [
          "Das Problem besteht in den Kosten. 问题在于费用",
          "Ihre Arbeit besteht darin, Kartoffeln zu frittieren. 他们的工作是煎土豆。",
          "Toms hauptsächliches Problem besteht in seinem fehlenden Sinn für Humor. 汤姆的主要问题是他一点幽默感都没有",
          "Der Reiz des Lebens besteht darin, fremden Menschen und Dingen zu begegnen. 生活的乐趣在于碰见陌生的人和陌生的事。"
        ]
      },
      "prepositionOrder": [
        "auf +D",
        "aus +D",
        "in +D"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "auf +D",
          "english": "to insist on",
          "chinese": "坚持",
          "pattern": "auf seinem Recht bestehen",
          "patternChinese": "坚持自己的权利",
          "level": "B2",
          "examples": [
            {
              "de": "auf seinem Recht bestehen",
              "zh": "坚持自己的权利",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie werden darauf bestehen, dass sie etwas länger bleibt.",
              "zh": "他们会坚持要她逗留久一点。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to consist of",
          "chinese": "由…组成",
          "pattern": "Die Wohnung besteht aus drei Zimmern",
          "patternChinese": "住房由三个房间组成",
          "level": "B1",
          "examples": [
            {
              "de": "Die Wohnung besteht aus drei Zimmern",
              "zh": "住房由三个房间组成",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Das Kleid besteht aus einem dünnen Stoff.",
              "zh": "这件衣服是由薄织物制成的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Die Brücke besteht aus Holz.",
              "zh": "桥是木制的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dieser Tisch besteht aus Holz.",
              "zh": "这张桌子是木制的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Die Erde besteht aus Meer und Land.",
              "zh": "地球是由海洋和陆地组成的。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to consist in",
          "chinese": "在于",
          "pattern": "Das Problem besteht in den Kosten",
          "patternChinese": "问题在于费用",
          "level": "C1",
          "examples": [
            {
              "de": "Das Problem besteht in den Kosten",
              "zh": "问题在于费用",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ihre Arbeit besteht darin, Kartoffeln zu frittieren.",
              "zh": "他们的工作是煎土豆。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Toms hauptsächliches Problem besteht in seinem fehlenden Sinn für Humor.",
              "zh": "汤姆的主要问题是他一点幽默感都没有",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Der Reiz des Lebens besteht darin, fremden Menschen und Dingen zu begegnen.",
              "zh": "生活的乐趣在于碰见陌生的人和陌生的事。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "beruhen": {
      "display": "beruhen",
      "prepositions": {
        "auf +D": [
          "auf einem Irrtum beruhen. 基于误会",
          "Worauf beruhen Ihre Annahmen? 您的假设是根据什么?"
        ]
      },
      "prepositionOrder": [
        "auf +D"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "auf +D",
          "english": "to be based on",
          "chinese": "基于",
          "pattern": "auf einem Irrtum beruhen",
          "patternChinese": "基于误会",
          "level": "C1",
          "examples": [
            {
              "de": "auf einem Irrtum beruhen",
              "zh": "基于误会",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Worauf beruhen Ihre Annahmen?",
              "zh": "您的假设是根据什么?",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "basieren": {
      "display": "basieren",
      "prepositions": {
        "auf +D": [
          "auf Fakten basieren. 以事实为基础",
          "Dieses Spiel basiert auf einem Roman. 这款游戏基于一本小说。"
        ]
      },
      "prepositionOrder": [
        "auf +D"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "auf +D",
          "english": "to be based on",
          "chinese": "以…为基础",
          "pattern": "auf Fakten basieren",
          "patternChinese": "以事实为基础",
          "level": "C1",
          "examples": [
            {
              "de": "auf Fakten basieren",
              "zh": "以事实为基础",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Dieses Spiel basiert auf einem Roman.",
              "zh": "这款游戏基于一本小说。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "beharren": {
      "display": "beharren",
      "prepositions": {
        "auf +D": [
          "auf seiner Meinung beharren. 坚持己见",
          "Sie beharren darauf, dass er gehen sollte. 他们坚持让他走。",
          "Sie beharrt darauf, dass ihre Analyse korrekt sei. 她坚持自己的分析是正确的。"
        ]
      },
      "prepositionOrder": [
        "auf +D"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "auf +D",
          "english": "to persist in",
          "chinese": "固执于",
          "pattern": "auf seiner Meinung beharren",
          "patternChinese": "坚持己见",
          "level": "C1",
          "examples": [
            {
              "de": "auf seiner Meinung beharren",
              "zh": "坚持己见",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie beharren darauf, dass er gehen sollte.",
              "zh": "他们坚持让他走。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie beharrt darauf, dass ihre Analyse korrekt sei.",
              "zh": "她坚持自己的分析是正确的。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "folgen": {
      "display": "folgen",
      "prepositions": {
        "aus +D": [
          "Daraus folgt ein neues Problem. 由此产生一个新问题"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to follow from",
          "chinese": "由…得出",
          "pattern": "Daraus folgt ein neues Problem",
          "patternChinese": "由此产生一个新问题",
          "level": "C1",
          "examples": [
            {
              "de": "Daraus folgt ein neues Problem",
              "zh": "由此产生一个新问题",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich ergeben": {
      "display": "sich ergeben",
      "prepositions": {
        "aus +D": [
          "Das ergibt sich aus dem Vertrag. 这由合同得出"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to result from",
          "chinese": "由…产生",
          "pattern": "Das ergibt sich aus dem Vertrag",
          "patternChinese": "这由合同得出",
          "level": "C1",
          "examples": [
            {
              "de": "Das ergibt sich aus dem Vertrag",
              "zh": "这由合同得出",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "stammen": {
      "display": "stammen",
      "prepositions": {
        "aus +D": [
          "aus einer kleinen Stadt stammen. 来自一个小城",
          "Dieses Wort stammt aus dem Griechischen. 这个词来源于希腊语。",
          "Sie stammt aus Frankreich. 她是法国的。",
          "Er stammte aus einer winzigen Bergstadt. 他来自一个小山城。"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to come from",
          "chinese": "来自，出身于",
          "pattern": "aus einer kleinen Stadt stammen",
          "patternChinese": "来自一个小城",
          "level": "B1",
          "examples": [
            {
              "de": "aus einer kleinen Stadt stammen",
              "zh": "来自一个小城",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Dieses Wort stammt aus dem Griechischen.",
              "zh": "这个词来源于希腊语。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie stammt aus Frankreich.",
              "zh": "她是法国的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er stammte aus einer winzigen Bergstadt.",
              "zh": "他来自一个小山城。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "resultieren": {
      "display": "resultieren",
      "prepositions": {
        "aus +D": [
          "Der Streit resultiert aus einem Missverständnis. 争执源于误会"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to result from",
          "chinese": "源于",
          "pattern": "Der Streit resultiert aus einem Missverständnis",
          "patternChinese": "争执源于误会",
          "level": "C1",
          "examples": [
            {
              "de": "Der Streit resultiert aus einem Missverständnis",
              "zh": "争执源于误会",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "schließen": {
      "display": "schließen",
      "prepositions": {
        "aus +D": [
          "aus dem Verhalten schließen. 从行为推断",
          "Daraus kann man schließen, dass Feminismus immer noch notwendig ist. 从这来看，你能因此论定女权主义还是必要的。",
          "Es sieht nach Regen aus, wir sollten besser die Fenster schließen. 好像快要下雨了。我们把窗关上吧。"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to conclude from",
          "chinese": "由…推断",
          "pattern": "aus dem Verhalten schließen",
          "patternChinese": "从行为推断",
          "level": "C1",
          "examples": [
            {
              "de": "aus dem Verhalten schließen",
              "zh": "从行为推断",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Daraus kann man schließen, dass Feminismus immer noch notwendig ist.",
              "zh": "从这来看，你能因此论定女权主义还是必要的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es sieht nach Regen aus, wir sollten besser die Fenster schließen.",
              "zh": "好像快要下雨了。我们把窗关上吧。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich zusammensetzen": {
      "display": "sich zusammensetzen",
      "prepositions": {
        "aus +D": [
          "Das Team setzt sich aus Experten zusammen. 团队由专家构成"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to be composed of",
          "chinese": "由…构成",
          "pattern": "Das Team setzt sich aus Experten zusammen",
          "patternChinese": "团队由专家构成",
          "level": "C1",
          "examples": [
            {
              "de": "Das Team setzt sich aus Experten zusammen",
              "zh": "团队由专家构成",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "lernen": {
      "display": "lernen",
      "prepositions": {
        "aus +D": [
          "aus Fehlern lernen. 从错误中学习",
          "Hänge nicht an der Vergangenheit, sondern lerne daraus! 不要沉迷于过去，而是要从中吸取教训。",
          "Du musst aus Fehlern lernen. 你必须从失败中吸取教训。",
          "Du musst aus deinen Fehlern lernen. 你必须从失败中吸取教训。",
          "Wir sollten aus der Geschichte lernen. 我们要以史为鉴。"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to learn from",
          "chinese": "从…中吸取",
          "pattern": "aus Fehlern lernen",
          "patternChinese": "从错误中学习",
          "level": "B1",
          "examples": [
            {
              "de": "aus Fehlern lernen",
              "zh": "从错误中学习",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Hänge nicht an der Vergangenheit, sondern lerne daraus!",
              "zh": "不要沉迷于过去，而是要从中吸取教训。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du musst aus Fehlern lernen.",
              "zh": "你必须从失败中吸取教训。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du musst aus deinen Fehlern lernen.",
              "zh": "你必须从失败中吸取教训。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir sollten aus der Geschichte lernen.",
              "zh": "我们要以史为鉴。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich bedanken": {
      "display": "sich bedanken",
      "prepositions": {
        "bei +D": [
          "sich bei dem Kollegen bedanken. 向同事道谢",
          "Er bedankte sich bei mir. 他跟我说谢谢。",
          "Du solltest dich bei ihm bedanken. 你应该感谢他。",
          "Tom hat sich bei mir für das Geschenk bedankt. 汤姆为这个礼物感谢我。",
          "Bedank dich nicht bei mir, bedank dich bei Tom! 别谢我，谢汤姆。"
        ],
        "für +A": [
          "sich für das Geschenk bedanken. 为礼物道谢",
          "Ich habe mich bei Mary für ihre Hilfe bedankt. 我对玛丽的帮助表示了感谢。",
          "Tom hat sich bei mir für das Geschenk bedankt. 汤姆为这个礼物感谢我。"
        ]
      },
      "prepositionOrder": [
        "bei +D",
        "für +A"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to thank sb",
          "chinese": "向某人道谢",
          "pattern": "sich bei dem Kollegen bedanken",
          "patternChinese": "向同事道谢",
          "level": "B1",
          "examples": [
            {
              "de": "sich bei dem Kollegen bedanken",
              "zh": "向同事道谢",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er bedankte sich bei mir.",
              "zh": "他跟我说谢谢。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du solltest dich bei ihm bedanken.",
              "zh": "你应该感谢他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Tom hat sich bei mir für das Geschenk bedankt.",
              "zh": "汤姆为这个礼物感谢我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Bedank dich nicht bei mir, bedank dich bei Tom!",
              "zh": "别谢我，谢汤姆。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to say thanks for",
          "chinese": "为…道谢",
          "pattern": "sich für das Geschenk bedanken",
          "patternChinese": "为礼物道谢",
          "level": "B1",
          "examples": [
            {
              "de": "sich für das Geschenk bedanken",
              "zh": "为礼物道谢",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich habe mich bei Mary für ihre Hilfe bedankt.",
              "zh": "我对玛丽的帮助表示了感谢。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Tom hat sich bei mir für das Geschenk bedankt.",
              "zh": "汤姆为这个礼物感谢我。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich entschuldigen": {
      "display": "sich entschuldigen",
      "prepositions": {
        "bei +D": [
          "sich bei der Lehrerin entschuldigen. 向老师道歉",
          "Warum sollte ich mich bei dir entschuldigen? 为什么我要向你道歉？",
          "Er hat sich mit keinem Wort bei ihr entschuldigt. 他连一声道歉也没有对她说。"
        ],
        "für +A": [
          "sich für die Verspätung entschuldigen. 为迟到道歉",
          "Warum willst du dich für etwas entschuldigen, das du nicht gemacht hast? 为什么你要对你没做过的事表示抱歉？",
          "Alles was du tun musst, ist, dich für deine Verspätung zu entschuldigen. 你要做的只是为迟到而道歉。"
        ]
      },
      "prepositionOrder": [
        "bei +D",
        "für +A"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to apologize to sb",
          "chinese": "向某人道歉",
          "pattern": "sich bei der Lehrerin entschuldigen",
          "patternChinese": "向老师道歉",
          "level": "A2",
          "examples": [
            {
              "de": "sich bei der Lehrerin entschuldigen",
              "zh": "向老师道歉",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Warum sollte ich mich bei dir entschuldigen?",
              "zh": "为什么我要向你道歉？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er hat sich mit keinem Wort bei ihr entschuldigt.",
              "zh": "他连一声道歉也没有对她说。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to apologize for",
          "chinese": "为…道歉",
          "pattern": "sich für die Verspätung entschuldigen",
          "patternChinese": "为迟到道歉",
          "level": "B1",
          "examples": [
            {
              "de": "sich für die Verspätung entschuldigen",
              "zh": "为迟到道歉",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Warum willst du dich für etwas entschuldigen, das du nicht gemacht hast?",
              "zh": "为什么你要对你没做过的事表示抱歉？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Alles was du tun musst, ist, dich für deine Verspätung zu entschuldigen.",
              "zh": "你要做的只是为迟到而道歉。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich beschweren": {
      "display": "sich beschweren",
      "prepositions": {
        "bei +D": [
          "sich beim Chef beschweren. 向老板投诉"
        ],
        "über +A": [
          "sich über den Service beschweren. 抱怨服务",
          "Er beschwerte sich über den Lärm. 他抱怨这个噪音。",
          "Er hat sich über den Lärm beschwert. 他抱怨这个噪音。",
          "Du beschwerst dich immer über deinen Mann. 你总是在抱怨你的丈夫。",
          "Er beschwert sich dauernd darüber, wie klein sein Zimmer ist. 他总是抱怨他的房间小。"
        ]
      },
      "prepositionOrder": [
        "bei +D",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to complain to sb",
          "chinese": "向某人投诉",
          "pattern": "sich beim Chef beschweren",
          "patternChinese": "向老板投诉",
          "level": "B1",
          "examples": [
            {
              "de": "sich beim Chef beschweren",
              "zh": "向老板投诉",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to complain about",
          "chinese": "抱怨",
          "pattern": "sich über den Service beschweren",
          "patternChinese": "抱怨服务",
          "level": "B1",
          "examples": [
            {
              "de": "sich über den Service beschweren",
              "zh": "抱怨服务",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er beschwerte sich über den Lärm.",
              "zh": "他抱怨这个噪音。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er hat sich über den Lärm beschwert.",
              "zh": "他抱怨这个噪音。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du beschwerst dich immer über deinen Mann.",
              "zh": "你总是在抱怨你的丈夫。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er beschwert sich dauernd darüber, wie klein sein Zimmer ist.",
              "zh": "他总是抱怨他的房间小。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "helfen": {
      "display": "helfen",
      "prepositions": {
        "bei +D": [
          "beim Umzug helfen. 帮忙搬家",
          "Ich helfe dir beim flashen. 我来帮你刷机吧。",
          "Ich helfe Mama beim Kochen. 我帮忙妈妈做菜。",
          "Jemand sollte Tom dabei helfen. 有人应该帮汤姆做这些事。",
          "Dabei kann ich dir nicht helfen. 在这事上我帮不了你。"
        ],
        "gegen +A": [
          "Das Mittel hilft gegen Kopfschmerzen. 这药治头疼"
        ]
      },
      "prepositionOrder": [
        "bei +D",
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to help with",
          "chinese": "在…上帮忙",
          "pattern": "beim Umzug helfen",
          "patternChinese": "帮忙搬家",
          "level": "A2",
          "examples": [
            {
              "de": "beim Umzug helfen",
              "zh": "帮忙搬家",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich helfe dir beim flashen.",
              "zh": "我来帮你刷机吧。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich helfe Mama beim Kochen.",
              "zh": "我帮忙妈妈做菜。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Jemand sollte Tom dabei helfen.",
              "zh": "有人应该帮汤姆做这些事。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dabei kann ich dir nicht helfen.",
              "zh": "在这事上我帮不了你。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to help against",
          "chinese": "对…有效",
          "pattern": "Das Mittel hilft gegen Kopfschmerzen",
          "patternChinese": "这药治头疼",
          "level": "B1",
          "examples": [
            {
              "de": "Das Mittel hilft gegen Kopfschmerzen",
              "zh": "这药治头疼",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich erkundigen": {
      "display": "sich erkundigen",
      "prepositions": {
        "bei +D": [
          "sich bei der Auskunft erkundigen. 向问询处打听",
          "Du solltest dich bei deinem Arzt erkundigen. 你应该咨询你的医生。"
        ],
        "nach +D": [
          "sich nach dem Preis erkundigen. 打听价格",
          "Hast du dich nach dem Preis erkundigt? 你问了价钱吗？"
        ]
      },
      "prepositionOrder": [
        "bei +D",
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to inquire of sb",
          "chinese": "向某人打听",
          "pattern": "sich bei der Auskunft erkundigen",
          "patternChinese": "向问询处打听",
          "level": "B2",
          "examples": [
            {
              "de": "sich bei der Auskunft erkundigen",
              "zh": "向问询处打听",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Du solltest dich bei deinem Arzt erkundigen.",
              "zh": "你应该咨询你的医生。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to inquire about",
          "chinese": "打听",
          "pattern": "sich nach dem Preis erkundigen",
          "patternChinese": "打听价格",
          "level": "B2",
          "examples": [
            {
              "de": "sich nach dem Preis erkundigen",
              "zh": "打听价格",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Hast du dich nach dem Preis erkundigt?",
              "zh": "你问了价钱吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "bleiben": {
      "display": "bleiben",
      "prepositions": {
        "bei +D": [
          "bei seiner Meinung bleiben. 坚持自己的看法",
          "Bleib bei mir, Tom! 留在我身边，汤姆！",
          "Darf ich hier bei dir bleiben? 我可以和你一起待在这儿吗？",
          "Wir bleiben bei unserem Onkel. 我们待在舅舅家。",
          "Ich will, dass du bei mir bleibst. 我想你和我待在一起。"
        ]
      },
      "prepositionOrder": [
        "bei +D"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to stick to",
          "chinese": "坚持",
          "pattern": "bei seiner Meinung bleiben",
          "patternChinese": "坚持自己的看法",
          "level": "B1",
          "examples": [
            {
              "de": "bei seiner Meinung bleiben",
              "zh": "坚持自己的看法",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Bleib bei mir, Tom!",
              "zh": "留在我身边，汤姆！",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Darf ich hier bei dir bleiben?",
              "zh": "我可以和你一起待在这儿吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir bleiben bei unserem Onkel.",
              "zh": "我们待在舅舅家。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich will, dass du bei mir bleibst.",
              "zh": "我想你和我待在一起。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich melden": {
      "display": "sich melden",
      "prepositions": {
        "bei +D": [
          "sich beim Amt melden. 去局里报到",
          "Ich werde mich bald bei dir melden. 我会很快跟你联络。",
          "Bitte melde dich bei uns. 请联系我们。",
          "Ich habe mich kurz bei meinen Eltern gemeldet. 我跟父母联络了一下。",
          "Vergiss nicht, dich bei uns zu melden, sobald du in London ankommst! 别忘了一到伦敦就给我们留言啊。"
        ]
      },
      "prepositionOrder": [
        "bei +D"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to report to",
          "chinese": "向…报到，联系",
          "pattern": "sich beim Amt melden",
          "patternChinese": "去局里报到",
          "level": "B1",
          "examples": [
            {
              "de": "sich beim Amt melden",
              "zh": "去局里报到",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich werde mich bald bei dir melden.",
              "zh": "我会很快跟你联络。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Bitte melde dich bei uns.",
              "zh": "请联系我们。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe mich kurz bei meinen Eltern gemeldet.",
              "zh": "我跟父母联络了一下。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Vergiss nicht, dich bei uns zu melden, sobald du in London ankommst!",
              "zh": "别忘了一到伦敦就给我们留言啊。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "unterstützen": {
      "display": "unterstützen",
      "prepositions": {
        "bei +D": [
          "jemanden bei der Arbeit unterstützen. 在工作上支持某人"
        ]
      },
      "prepositionOrder": [
        "bei +D"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to support with",
          "chinese": "在…上支持",
          "pattern": "jemanden bei der Arbeit unterstützen",
          "patternChinese": "在工作上支持某人",
          "level": "B2",
          "examples": [
            {
              "de": "jemanden bei der Arbeit unterstützen",
              "zh": "在工作上支持某人",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich bewerben": {
      "display": "sich bewerben",
      "prepositions": {
        "bei +D": [
          "sich bei einer Firma bewerben. 向一家公司求职"
        ],
        "um +A": [
          "sich um eine Stelle bewerben. 申请职位",
          "Tom denkt darüber nach, sich um eine besser bezahlte Arbeit zu bewerben. 汤姆正考虑应聘薪酬更高的工作。"
        ]
      },
      "prepositionOrder": [
        "bei +D",
        "um +A"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to apply to (a company)",
          "chinese": "向（公司）求职",
          "pattern": "sich bei einer Firma bewerben",
          "patternChinese": "向一家公司求职",
          "level": "B1",
          "examples": [
            {
              "de": "sich bei einer Firma bewerben",
              "zh": "向一家公司求职",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to apply for",
          "chinese": "申请",
          "pattern": "sich um eine Stelle bewerben",
          "patternChinese": "申请职位",
          "level": "B1",
          "examples": [
            {
              "de": "sich um eine Stelle bewerben",
              "zh": "申请职位",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Tom denkt darüber nach, sich um eine besser bezahlte Arbeit zu bewerben.",
              "zh": "汤姆正考虑应聘薪酬更高的工作。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich auszeichnen": {
      "display": "sich auszeichnen",
      "prepositions": {
        "durch +A": [
          "sich durch Qualität auszeichnen. 以质量见长",
          "Nur Kavaliere zeichnen sich durch solch ein Benehmen aus. 这样的举止只可能是个绅士。"
        ]
      },
      "prepositionOrder": [
        "durch +A"
      ],
      "entries": [
        {
          "preposition": "durch",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "durch +A",
          "english": "to be distinguished by",
          "chinese": "以…见长",
          "pattern": "sich durch Qualität auszeichnen",
          "patternChinese": "以质量见长",
          "level": "C1",
          "examples": [
            {
              "de": "sich durch Qualität auszeichnen",
              "zh": "以质量见长",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Nur Kavaliere zeichnen sich durch solch ein Benehmen aus.",
              "zh": "这样的举止只可能是个绅士。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "ersetzen": {
      "display": "ersetzen",
      "prepositions": {
        "durch +A": [
          "Öl durch Gas ersetzen. 用天然气代替石油",
          "Sie ersetzte die Butter durch Margarine. 她用人造黄油代替了黄油。",
          "Sie hat die Butter durch Margarine ersetzt. 她用人造黄油代替了黄油。"
        ]
      },
      "prepositionOrder": [
        "durch +A"
      ],
      "entries": [
        {
          "preposition": "durch",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "durch +A",
          "english": "to replace with",
          "chinese": "用…代替",
          "pattern": "Öl durch Gas ersetzen",
          "patternChinese": "用天然气代替石油",
          "level": "B2",
          "examples": [
            {
              "de": "Öl durch Gas ersetzen",
              "zh": "用天然气代替石油",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie ersetzte die Butter durch Margarine.",
              "zh": "她用人造黄油代替了黄油。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie hat die Butter durch Margarine ersetzt.",
              "zh": "她用人造黄油代替了黄油。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich interessieren": {
      "display": "sich interessieren",
      "prepositions": {
        "für +A": [
          "sich für Musik interessieren. 对音乐感兴趣",
          "Sie interessiert sich nicht mehr für mich. 她已不再对我感兴趣了。",
          "Sie scheint sich für ihn zu interessieren. 她看起来对他感兴趣。",
          "Ich glaube, sie interessiert sich für dich. 我想她对你有兴趣。",
          "Ich glaube, sie interessiert sich für mich. 我觉得她对我有好感。"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be interested in",
          "chinese": "对…感兴趣",
          "pattern": "sich für Musik interessieren",
          "patternChinese": "对音乐感兴趣",
          "level": "A2",
          "examples": [
            {
              "de": "sich für Musik interessieren",
              "zh": "对音乐感兴趣",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie interessiert sich nicht mehr für mich.",
              "zh": "她已不再对我感兴趣了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie scheint sich für ihn zu interessieren.",
              "zh": "她看起来对他感兴趣。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich glaube, sie interessiert sich für dich.",
              "zh": "我想她对你有兴趣。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich glaube, sie interessiert sich für mich.",
              "zh": "我觉得她对我有好感。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "danken": {
      "display": "danken",
      "prepositions": {
        "für +A": [
          "für die Hilfe danken. 感谢帮助",
          "Danke für den Rat! 谢谢你的建议。",
          "Danke für Ihren Besuch! 感谢您的光临。",
          "Danke für den Kommentar. 谢谢您的评论。",
          "Danke für Ihren Rückruf! 感谢您的回电。"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to thank for",
          "chinese": "因…而感谢",
          "pattern": "für die Hilfe danken",
          "patternChinese": "感谢帮助",
          "level": "A2",
          "examples": [
            {
              "de": "für die Hilfe danken",
              "zh": "感谢帮助",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Danke für den Rat!",
              "zh": "谢谢你的建议。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Danke für Ihren Besuch!",
              "zh": "感谢您的光临。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Danke für den Kommentar.",
              "zh": "谢谢您的评论。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Danke für Ihren Rückruf!",
              "zh": "感谢您的回电。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich entscheiden": {
      "display": "sich entscheiden",
      "prepositions": {
        "für +A": [
          "sich für den blauen Mantel entscheiden. 决定买蓝大衣",
          "Jeder entscheidet für sich. 大家自己做决定。",
          "Ich kann mich entweder für Tee oder für Kaffee entscheiden. 我可以在茶和咖啡之间做个选择。",
          "Du musst dich entscheiden, was für ein Mensch du sein willst. 你必须得决定你想要成为一个什么样的人。"
        ],
        "gegen +A": [
          "sich gegen den Umzug entscheiden. 决定不搬家"
        ]
      },
      "prepositionOrder": [
        "für +A",
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to decide on",
          "chinese": "决定选择",
          "pattern": "sich für den blauen Mantel entscheiden",
          "patternChinese": "决定买蓝大衣",
          "level": "B1",
          "examples": [
            {
              "de": "sich für den blauen Mantel entscheiden",
              "zh": "决定买蓝大衣",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Jeder entscheidet für sich.",
              "zh": "大家自己做决定。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich kann mich entweder für Tee oder für Kaffee entscheiden.",
              "zh": "我可以在茶和咖啡之间做个选择。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du musst dich entscheiden, was für ein Mensch du sein willst.",
              "zh": "你必须得决定你想要成为一个什么样的人。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to decide against",
          "chinese": "决定不选",
          "pattern": "sich gegen den Umzug entscheiden",
          "patternChinese": "决定不搬家",
          "level": "B2",
          "examples": [
            {
              "de": "sich gegen den Umzug entscheiden",
              "zh": "决定不搬家",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sorgen": {
      "display": "sorgen",
      "prepositions": {
        "für +A": [
          "für die Familie sorgen. 养家",
          "Ich sorge für den Unterhalt meiner Familie. 我赚钱养家。",
          "Sorge dafür, dass das Kind nicht krank wird! 确保这个孩子不生病。",
          "Alles, was du tun musst, ist, für dich selbst zu sorgen. 你要做的只是照顾好你自己。",
          "Wer den Schaden hat, braucht für den Spott nicht zu sorgen. 落井下石乃人之天性。"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to take care of",
          "chinese": "照顾，负责",
          "pattern": "für die Familie sorgen",
          "patternChinese": "养家",
          "level": "B1",
          "examples": [
            {
              "de": "für die Familie sorgen",
              "zh": "养家",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich sorge für den Unterhalt meiner Familie.",
              "zh": "我赚钱养家。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sorge dafür, dass das Kind nicht krank wird!",
              "zh": "确保这个孩子不生病。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Alles, was du tun musst, ist, für dich selbst zu sorgen.",
              "zh": "你要做的只是照顾好你自己。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wer den Schaden hat, braucht für den Spott nicht zu sorgen.",
              "zh": "落井下石乃人之天性。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich engagieren": {
      "display": "sich engagieren",
      "prepositions": {
        "für +A": [
          "sich für den Umweltschutz engagieren. 投身环保"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be committed to",
          "chinese": "致力于",
          "pattern": "sich für den Umweltschutz engagieren",
          "patternChinese": "投身环保",
          "level": "C1",
          "examples": [
            {
              "de": "sich für den Umweltschutz engagieren",
              "zh": "投身环保",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "kämpfen": {
      "display": "kämpfen",
      "prepositions": {
        "für +A": [
          "für die Freiheit kämpfen. 为自由而战",
          "Ich kämpfe für Gerechtigkeit. 我为正义而战。",
          "Sie kämpften für ihr Vaterland. 他们为祖国而战斗。",
          "Ich werde für mein Volk kämpfen. 我会为我的人民而战。",
          "Sie haben für ihr Vaterland gekämpft. 他们为祖国而战斗。"
        ],
        "gegen +A": [
          "gegen die Krankheit kämpfen. 与疾病斗争",
          "Ich kämpfte gegen den Schlaf. 我和睡魔作了斗争。",
          "Die Flüchtlinge kämpften gegen den Hunger. 难民与饥饿作斗争。",
          "Wir kämpfen gegen die Zeit. 我们在跟时间斗争。",
          "Er kämpfte gegen die Rassendiskriminierung. 他反对种族歧视。"
        ],
        "um +A": [
          "um den Sieg kämpfen. 争取胜利",
          "Er kämpft um sein Leben. 他在为生活战斗。",
          "Die Löwen haben miteinander um Nahrung gekämpft. 狮子为了得到食物相互争斗。"
        ]
      },
      "prepositionOrder": [
        "für +A",
        "gegen +A",
        "um +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to fight for",
          "chinese": "为…而奋斗",
          "pattern": "für die Freiheit kämpfen",
          "patternChinese": "为自由而战",
          "level": "B2",
          "examples": [
            {
              "de": "für die Freiheit kämpfen",
              "zh": "为自由而战",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich kämpfe für Gerechtigkeit.",
              "zh": "我为正义而战。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie kämpften für ihr Vaterland.",
              "zh": "他们为祖国而战斗。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich werde für mein Volk kämpfen.",
              "zh": "我会为我的人民而战。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie haben für ihr Vaterland gekämpft.",
              "zh": "他们为祖国而战斗。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to fight against",
          "chinese": "与…斗争",
          "pattern": "gegen die Krankheit kämpfen",
          "patternChinese": "与疾病斗争",
          "level": "B2",
          "examples": [
            {
              "de": "gegen die Krankheit kämpfen",
              "zh": "与疾病斗争",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich kämpfte gegen den Schlaf.",
              "zh": "我和睡魔作了斗争。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Die Flüchtlinge kämpften gegen den Hunger.",
              "zh": "难民与饥饿作斗争。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir kämpfen gegen die Zeit.",
              "zh": "我们在跟时间斗争。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er kämpfte gegen die Rassendiskriminierung.",
              "zh": "他反对种族歧视。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to fight for",
          "chinese": "争取",
          "pattern": "um den Sieg kämpfen",
          "patternChinese": "争取胜利",
          "level": "B2",
          "examples": [
            {
              "de": "um den Sieg kämpfen",
              "zh": "争取胜利",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er kämpft um sein Leben.",
              "zh": "他在为生活战斗。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Die Löwen haben miteinander um Nahrung gekämpft.",
              "zh": "狮子为了得到食物相互争斗。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich eignen": {
      "display": "sich eignen",
      "prepositions": {
        "für +A": [
          "Der Film eignet sich für Kinder. 这部电影适合儿童",
          "Diese Trägerhemden, die ich heute gekauft habe, sind nicht für den Sommer geeignet. 今天买的这几件吊带不适合夏天穿。",
          "Dieses Spielzeug ist für Mädchen geeignet. 这些玩具适合女生。",
          "Denkst du, dass er für die Stelle geeignet ist? 你认为他适合这个职位吗？",
          "Die Eingabemethode eignet sich auch für diese Version. 此输入法也适用于这个版本。"
        ],
        "zu +D": [
          "sich zum Lehrer eignen. 适合当老师",
          "Dieser Raum ist nicht zum Schlafen geeignet. 这间房子不适合睡觉。",
          "Dieser Fisch ist nicht zum Verzehr geeignet. 这条鱼不能吃了。",
          "Sie trug einen Kimono, der geeignet war, Männern Herzklopfen zu verschaffen. 她身穿让男人心动的和服。"
        ]
      },
      "prepositionOrder": [
        "für +A",
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be suitable for",
          "chinese": "适合",
          "pattern": "Der Film eignet sich für Kinder",
          "patternChinese": "这部电影适合儿童",
          "level": "B2",
          "examples": [
            {
              "de": "Der Film eignet sich für Kinder",
              "zh": "这部电影适合儿童",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Diese Trägerhemden, die ich heute gekauft habe, sind nicht für den Sommer geeignet.",
              "zh": "今天买的这几件吊带不适合夏天穿。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dieses Spielzeug ist für Mädchen geeignet.",
              "zh": "这些玩具适合女生。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Denkst du, dass er für die Stelle geeignet ist?",
              "zh": "你认为他适合这个职位吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Die Eingabemethode eignet sich auch für diese Version.",
              "zh": "此输入法也适用于这个版本。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to be suited to",
          "chinese": "适合作",
          "pattern": "sich zum Lehrer eignen",
          "patternChinese": "适合当老师",
          "level": "B2",
          "examples": [
            {
              "de": "sich zum Lehrer eignen",
              "zh": "适合当老师",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Dieser Raum ist nicht zum Schlafen geeignet.",
              "zh": "这间房子不适合睡觉。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dieser Fisch ist nicht zum Verzehr geeignet.",
              "zh": "这条鱼不能吃了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie trug einen Kimono, der geeignet war, Männern Herzklopfen zu verschaffen.",
              "zh": "她身穿让男人心动的和服。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "halten": {
      "display": "halten",
      "prepositions": {
        "für +A": [
          "jemanden für ehrlich halten. 认为某人诚实",
          "Ich halte ihn für meinen Freund. 我把他看作我的朋友。",
          "Wir halten Tom für einen ehrlichen Menschen. 我们觉得汤姆是个正直的人。",
          "Nicht nur ich halte Tom für fett. 觉得汤姆肥的人不止我一个。",
          "Halte diese Plätze für Senioren frei! 把这些座位留给老人。"
        ],
        "von +D": [
          "Was hältst du von dem Plan. 你觉得这个计划怎么样",
          "Ich halte nichts von ihm. 我看不太起他这个人。",
          "Ich halte viel von diesem Buch. 我对这本书评价很高。",
          "Was halten Sie von einer Tasse Tee? 喝杯红茶吗？",
          "Was haltet ihr von einer Tasse Tee? 喝杯红茶吗？"
        ]
      },
      "prepositionOrder": [
        "für +A",
        "von +D"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to consider sb/sth to be",
          "chinese": "认为是",
          "pattern": "jemanden für ehrlich halten",
          "patternChinese": "认为某人诚实",
          "level": "B1",
          "examples": [
            {
              "de": "jemanden für ehrlich halten",
              "zh": "认为某人诚实",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich halte ihn für meinen Freund.",
              "zh": "我把他看作我的朋友。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir halten Tom für einen ehrlichen Menschen.",
              "zh": "我们觉得汤姆是个正直的人。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Nicht nur ich halte Tom für fett.",
              "zh": "觉得汤姆肥的人不止我一个。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Halte diese Plätze für Senioren frei!",
              "zh": "把这些座位留给老人。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to think of (opinion)",
          "chinese": "对…的看法",
          "pattern": "Was hältst du von dem Plan",
          "patternChinese": "你觉得这个计划怎么样",
          "level": "B1",
          "examples": [
            {
              "de": "Was hältst du von dem Plan",
              "zh": "你觉得这个计划怎么样",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich halte nichts von ihm.",
              "zh": "我看不太起他这个人。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich halte viel von diesem Buch.",
              "zh": "我对这本书评价很高。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Was halten Sie von einer Tasse Tee?",
              "zh": "喝杯红茶吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Was haltet ihr von einer Tasse Tee?",
              "zh": "喝杯红茶吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "ausgeben": {
      "display": "ausgeben",
      "prepositions": {
        "für +A": [
          "Geld für Bücher ausgeben. 把钱花在书上",
          "Ich gebe mehr für Lebenshaltungskosten aus. 我花的生活费变多了。",
          "Es sieht für morgen nach Regen aus, aber ich werde mein Bestes geben. 虽然明天好像会下雨，但我会加油的。"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to spend on",
          "chinese": "花在…上",
          "pattern": "Geld für Bücher ausgeben",
          "patternChinese": "把钱花在书上",
          "level": "B1",
          "examples": [
            {
              "de": "Geld für Bücher ausgeben",
              "zh": "把钱花在书上",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich gebe mehr für Lebenshaltungskosten aus.",
              "zh": "我花的生活费变多了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es sieht für morgen nach Regen aus, aber ich werde mein Bestes geben.",
              "zh": "虽然明天好像会下雨，但我会加油的。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich einsetzen": {
      "display": "sich einsetzen",
      "prepositions": {
        "für +A": [
          "sich für die Kollegen einsetzen. 为同事出面"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to stand up for",
          "chinese": "为…出力",
          "pattern": "sich für die Kollegen einsetzen",
          "patternChinese": "为同事出面",
          "level": "C1",
          "examples": [
            {
              "de": "sich für die Kollegen einsetzen",
              "zh": "为同事出面",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich schämen": {
      "display": "sich schämen",
      "prepositions": {
        "für +A": [
          "sich für sein Verhalten schämen. 为自己的行为羞愧",
          "Er schämt sich für seinen Misserfolg. 他为他的失败感到羞耻。",
          "Er schämte sich für sein Versagen. 他为他的失败感到羞耻。",
          "Sie schämte sich für ihre Unachtsamkeit. 她为自己的粗心感到羞耻。",
          "Ich habe mich für mein Verhalten geschämt. 我对自己的行为感到羞愧。"
        ],
        "vor +D": [
          "sich vor den Kollegen schämen. 在同事面前难堪"
        ]
      },
      "prepositionOrder": [
        "für +A",
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be ashamed of",
          "chinese": "为…羞愧",
          "pattern": "sich für sein Verhalten schämen",
          "patternChinese": "为自己的行为羞愧",
          "level": "B2",
          "examples": [
            {
              "de": "sich für sein Verhalten schämen",
              "zh": "为自己的行为羞愧",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er schämt sich für seinen Misserfolg.",
              "zh": "他为他的失败感到羞耻。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er schämte sich für sein Versagen.",
              "zh": "他为他的失败感到羞耻。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie schämte sich für ihre Unachtsamkeit.",
              "zh": "她为自己的粗心感到羞耻。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe mich für mein Verhalten geschämt.",
              "zh": "我对自己的行为感到羞愧。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to feel ashamed before",
          "chinese": "在…面前羞愧",
          "pattern": "sich vor den Kollegen schämen",
          "patternChinese": "在同事面前难堪",
          "level": "B2",
          "examples": [
            {
              "de": "sich vor den Kollegen schämen",
              "zh": "在同事面前难堪",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich begeistern": {
      "display": "sich begeistern",
      "prepositions": {
        "für +A": [
          "sich für Fußball begeistern. 热衷足球"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be enthusiastic about",
          "chinese": "热衷于",
          "pattern": "sich für Fußball begeistern",
          "patternChinese": "热衷足球",
          "level": "B2",
          "examples": [
            {
              "de": "sich für Fußball begeistern",
              "zh": "热衷足球",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "stimmen": {
      "display": "stimmen",
      "prepositions": {
        "für +A": [
          "für den Vorschlag stimmen. 投票赞成提案",
          "Sie stimmte entgegen der Parteilinie für Herrn Nishioka. 她不论党派把票投给了西冈先生。"
        ],
        "gegen +A": [
          "gegen das Gesetz stimmen. 投票反对法律"
        ]
      },
      "prepositionOrder": [
        "für +A",
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to vote for",
          "chinese": "投票赞成",
          "pattern": "für den Vorschlag stimmen",
          "patternChinese": "投票赞成提案",
          "level": "B2",
          "examples": [
            {
              "de": "für den Vorschlag stimmen",
              "zh": "投票赞成提案",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie stimmte entgegen der Parteilinie für Herrn Nishioka.",
              "zh": "她不论党派把票投给了西冈先生。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to vote against",
          "chinese": "投票反对",
          "pattern": "gegen das Gesetz stimmen",
          "patternChinese": "投票反对法律",
          "level": "B2",
          "examples": [
            {
              "de": "gegen das Gesetz stimmen",
              "zh": "投票反对法律",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "plädieren": {
      "display": "plädieren",
      "prepositions": {
        "für +A": [
          "für eine schnelle Lösung plädieren. 主张尽快解决"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to plead for",
          "chinese": "主张",
          "pattern": "für eine schnelle Lösung plädieren",
          "patternChinese": "主张尽快解决",
          "level": "C1",
          "examples": [
            {
              "de": "für eine schnelle Lösung plädieren",
              "zh": "主张尽快解决",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "werben": {
      "display": "werben",
      "prepositions": {
        "für +A": [
          "für ein Produkt werben. 为产品做广告"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to advertise",
          "chinese": "为…做宣传",
          "pattern": "für ein Produkt werben",
          "patternChinese": "为产品做广告",
          "level": "B2",
          "examples": [
            {
              "de": "für ein Produkt werben",
              "zh": "为产品做广告",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "protestieren": {
      "display": "protestieren",
      "prepositions": {
        "gegen +A": [
          "gegen den Krieg protestieren. 抗议战争"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to protest against",
          "chinese": "抗议",
          "pattern": "gegen den Krieg protestieren",
          "patternChinese": "抗议战争",
          "level": "B2",
          "examples": [
            {
              "de": "gegen den Krieg protestieren",
              "zh": "抗议战争",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich wehren": {
      "display": "sich wehren",
      "prepositions": {
        "gegen +A": [
          "sich gegen die Vorwürfe wehren. 反驳指责"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to defend oneself against",
          "chinese": "抵抗，反驳",
          "pattern": "sich gegen die Vorwürfe wehren",
          "patternChinese": "反驳指责",
          "level": "C1",
          "examples": [
            {
              "de": "sich gegen die Vorwürfe wehren",
              "zh": "反驳指责",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verstoßen": {
      "display": "verstoßen",
      "prepositions": {
        "gegen +A": [
          "gegen die Regeln verstoßen. 违反规则",
          "Er hat gegen ein Gesetz verstoßen. 他触犯了法律。",
          "Du darfst nicht gegen das Gesetz verstoßen. 你不许犯法。",
          "Er wird nicht gegen seine Prinzipien verstoßen. 他不会违背他的原则。",
          "Ich werde nie wieder gegen ein Gesetz verstoßen. 我不会再违法了。"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to violate",
          "chinese": "违反",
          "pattern": "gegen die Regeln verstoßen",
          "patternChinese": "违反规则",
          "level": "C1",
          "examples": [
            {
              "de": "gegen die Regeln verstoßen",
              "zh": "违反规则",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er hat gegen ein Gesetz verstoßen.",
              "zh": "他触犯了法律。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du darfst nicht gegen das Gesetz verstoßen.",
              "zh": "你不许犯法。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er wird nicht gegen seine Prinzipien verstoßen.",
              "zh": "他不会违背他的原则。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich werde nie wieder gegen ein Gesetz verstoßen.",
              "zh": "我不会再违法了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "klagen": {
      "display": "klagen",
      "prepositions": {
        "gegen +A": [
          "gegen die Firma klagen. 起诉那家公司"
        ],
        "über +A": [
          "über Kopfschmerzen klagen. 诉说头疼"
        ]
      },
      "prepositionOrder": [
        "gegen +A",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to sue",
          "chinese": "起诉",
          "pattern": "gegen die Firma klagen",
          "patternChinese": "起诉那家公司",
          "level": "C1",
          "examples": [
            {
              "de": "gegen die Firma klagen",
              "zh": "起诉那家公司",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to complain of",
          "chinese": "诉说（不适）",
          "pattern": "über Kopfschmerzen klagen",
          "patternChinese": "诉说头疼",
          "level": "B2",
          "examples": [
            {
              "de": "über Kopfschmerzen klagen",
              "zh": "诉说头疼",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "demonstrieren": {
      "display": "demonstrieren",
      "prepositions": {
        "gegen +A": [
          "gegen die Politik demonstrieren. 游行反对政策"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to demonstrate against",
          "chinese": "游行反对",
          "pattern": "gegen die Politik demonstrieren",
          "patternChinese": "游行反对政策",
          "level": "B2",
          "examples": [
            {
              "de": "gegen die Politik demonstrieren",
              "zh": "游行反对政策",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich versichern": {
      "display": "sich versichern",
      "prepositions": {
        "gegen +A": [
          "sich gegen Diebstahl versichern. 投保防盗"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to insure oneself against",
          "chinese": "投保",
          "pattern": "sich gegen Diebstahl versichern",
          "patternChinese": "投保防盗",
          "level": "B2",
          "examples": [
            {
              "de": "sich gegen Diebstahl versichern",
              "zh": "投保防盗",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich verlieben": {
      "display": "sich verlieben",
      "prepositions": {
        "in +A": [
          "sich in eine Kollegin verlieben. 爱上一位同事",
          "Ich habe mich in dich verliebt. 我爱上了你。",
          "Ich war insgeheim in ihn verliebt. 我偷偷单恋他。",
          "Wann hast du dich in mich verliebt? 你什么时候爱上我的？",
          "Ich glaube, ich werde mich in dich verlieben. 我觉得我要爱上你了。"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to fall in love with",
          "chinese": "爱上",
          "pattern": "sich in eine Kollegin verlieben",
          "patternChinese": "爱上一位同事",
          "level": "B1",
          "examples": [
            {
              "de": "sich in eine Kollegin verlieben",
              "zh": "爱上一位同事",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich habe mich in dich verliebt.",
              "zh": "我爱上了你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich war insgeheim in ihn verliebt.",
              "zh": "我偷偷单恋他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wann hast du dich in mich verliebt?",
              "zh": "你什么时候爱上我的？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich glaube, ich werde mich in dich verlieben.",
              "zh": "我觉得我要爱上你了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "einwilligen": {
      "display": "einwilligen",
      "prepositions": {
        "in +A": [
          "in den Vorschlag einwilligen. 同意该建议"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to consent to",
          "chinese": "同意",
          "pattern": "in den Vorschlag einwilligen",
          "patternChinese": "同意该建议",
          "level": "C1",
          "examples": [
            {
              "de": "in den Vorschlag einwilligen",
              "zh": "同意该建议",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "geraten": {
      "display": "geraten",
      "prepositions": {
        "in +A": [
          "in Schwierigkeiten geraten. 陷入困境",
          "Ich bin in einen Regenschauer geraten und bin völlig durchnässt. 我遇上了阵雨被淋得全身湿透。"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to get into",
          "chinese": "陷入",
          "pattern": "in Schwierigkeiten geraten",
          "patternChinese": "陷入困境",
          "level": "B2",
          "examples": [
            {
              "de": "in Schwierigkeiten geraten",
              "zh": "陷入困境",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich bin in einen Regenschauer geraten und bin völlig durchnässt.",
              "zh": "我遇上了阵雨被淋得全身湿透。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich einmischen": {
      "display": "sich einmischen",
      "prepositions": {
        "in +A": [
          "sich in fremde Angelegenheiten einmischen. 干涉别人的事"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to interfere in",
          "chinese": "干涉",
          "pattern": "sich in fremde Angelegenheiten einmischen",
          "patternChinese": "干涉别人的事",
          "level": "C1",
          "examples": [
            {
              "de": "sich in fremde Angelegenheiten einmischen",
              "zh": "干涉别人的事",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "eingreifen": {
      "display": "eingreifen",
      "prepositions": {
        "in +A": [
          "in die Diskussion eingreifen. 介入讨论"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to intervene in",
          "chinese": "干预",
          "pattern": "in die Diskussion eingreifen",
          "patternChinese": "介入讨论",
          "level": "C1",
          "examples": [
            {
              "de": "in die Diskussion eingreifen",
              "zh": "介入讨论",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich verwandeln": {
      "display": "sich verwandeln",
      "prepositions": {
        "in +A": [
          "sich in einen Frosch verwandeln. 变成青蛙"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to turn into",
          "chinese": "变成",
          "pattern": "sich in einen Frosch verwandeln",
          "patternChinese": "变成青蛙",
          "level": "B2",
          "examples": [
            {
              "de": "sich in einen Frosch verwandeln",
              "zh": "变成青蛙",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "übersetzen": {
      "display": "übersetzen",
      "prepositions": {
        "in +A": [
          "den Text ins Deutsche übersetzen. 把课文译成德语"
        ],
        "aus +D": [
          "aus dem Deutschen übersetzen. 从德语译出"
        ]
      },
      "prepositionOrder": [
        "in +A",
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to translate into",
          "chinese": "译成",
          "pattern": "den Text ins Deutsche übersetzen",
          "patternChinese": "把课文译成德语",
          "level": "B1",
          "examples": [
            {
              "de": "den Text ins Deutsche übersetzen",
              "zh": "把课文译成德语",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to translate from",
          "chinese": "从…翻译",
          "pattern": "aus dem Deutschen übersetzen",
          "patternChinese": "从德语译出",
          "level": "B1",
          "examples": [
            {
              "de": "aus dem Deutschen übersetzen",
              "zh": "从德语译出",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "einführen": {
      "display": "einführen",
      "prepositions": {
        "in +A": [
          "jemanden in die Arbeit einführen. 带某人熟悉工作",
          "Die Antwort führt uns in einen Teufelskreis. 回答把我们带入了一个恶性循环。"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to introduce sb to",
          "chinese": "带…熟悉",
          "pattern": "jemanden in die Arbeit einführen",
          "patternChinese": "带某人熟悉工作",
          "level": "B2",
          "examples": [
            {
              "de": "jemanden in die Arbeit einführen",
              "zh": "带某人熟悉工作",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Die Antwort führt uns in einen Teufelskreis.",
              "zh": "回答把我们带入了一个恶性循环。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "investieren": {
      "display": "investieren",
      "prepositions": {
        "in +A": [
          "in erneuerbare Energien investieren. 投资可再生能源"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to invest in",
          "chinese": "投资于",
          "pattern": "in erneuerbare Energien investieren",
          "patternChinese": "投资可再生能源",
          "level": "B2",
          "examples": [
            {
              "de": "in erneuerbare Energien investieren",
              "zh": "投资可再生能源",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich einarbeiten": {
      "display": "sich einarbeiten",
      "prepositions": {
        "in +A": [
          "sich in das Thema einarbeiten. 熟悉这个课题"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to get familiar with",
          "chinese": "熟悉（新工作）",
          "pattern": "sich in das Thema einarbeiten",
          "patternChinese": "熟悉这个课题",
          "level": "C1",
          "examples": [
            {
              "de": "sich in das Thema einarbeiten",
              "zh": "熟悉这个课题",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich irren": {
      "display": "sich irren",
      "prepositions": {
        "in +D": [
          "sich in der Adresse irren. 把地址弄错"
        ]
      },
      "prepositionOrder": [
        "in +D"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to be mistaken about",
          "chinese": "在…上弄错",
          "pattern": "sich in der Adresse irren",
          "patternChinese": "把地址弄错",
          "level": "B2",
          "examples": [
            {
              "de": "sich in der Adresse irren",
              "zh": "把地址弄错",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich täuschen": {
      "display": "sich täuschen",
      "prepositions": {
        "in +D": [
          "sich in einem Menschen täuschen. 看错了人"
        ],
        "über +A": [
          "sich über die Lage täuschen. 误判形势"
        ]
      },
      "prepositionOrder": [
        "in +D",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to be deceived about",
          "chinese": "看错",
          "pattern": "sich in einem Menschen täuschen",
          "patternChinese": "看错了人",
          "level": "C1",
          "examples": [
            {
              "de": "sich in einem Menschen täuschen",
              "zh": "看错了人",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to be mistaken about",
          "chinese": "对…判断错误",
          "pattern": "sich über die Lage täuschen",
          "patternChinese": "误判形势",
          "level": "C1",
          "examples": [
            {
              "de": "sich über die Lage täuschen",
              "zh": "误判形势",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich auskennen": {
      "display": "sich auskennen",
      "prepositions": {
        "in +D": [
          "sich in der Stadt auskennen. 熟悉这座城市"
        ]
      },
      "prepositionOrder": [
        "in +D"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to know one's way around",
          "chinese": "熟悉",
          "pattern": "sich in der Stadt auskennen",
          "patternChinese": "熟悉这座城市",
          "level": "B1",
          "examples": [
            {
              "de": "sich in der Stadt auskennen",
              "zh": "熟悉这座城市",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "unterrichten": {
      "display": "unterrichten",
      "prepositions": {
        "in +D": [
          "in Mathematik unterrichten. 教数学"
        ]
      },
      "prepositionOrder": [
        "in +D"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to teach (a subject)",
          "chinese": "教授",
          "pattern": "in Mathematik unterrichten",
          "patternChinese": "教数学",
          "level": "B1",
          "examples": [
            {
              "de": "in Mathematik unterrichten",
              "zh": "教数学",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich üben": {
      "display": "sich üben",
      "prepositions": {
        "in +D": [
          "sich in Geduld üben. 练习耐心"
        ]
      },
      "prepositionOrder": [
        "in +D"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to practise",
          "chinese": "练习",
          "pattern": "sich in Geduld üben",
          "patternChinese": "练习耐心",
          "level": "C1",
          "examples": [
            {
              "de": "sich in Geduld üben",
              "zh": "练习耐心",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich beschäftigen": {
      "display": "sich beschäftigen",
      "prepositions": {
        "mit +D": [
          "sich mit Geschichte beschäftigen. 研究历史",
          "Marie ist damit beschäftigt, das Huhn zu rupfen. 玛丽忙着拔鸡毛。",
          "Sie ist damit beschäftigt, die Reise vorzubereiten. 她正忙着准备这次旅行。",
          "Ich bin gerade damit beschäftigt, ein Buch zu schreiben. 我现在正忙着写一本书。",
          "Ich war schon damit beschäftigt, meine Ferien zu planen. 我已经在忙于计划假期了。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to occupy oneself with",
          "chinese": "从事，研究",
          "pattern": "sich mit Geschichte beschäftigen",
          "patternChinese": "研究历史",
          "level": "B1",
          "examples": [
            {
              "de": "sich mit Geschichte beschäftigen",
              "zh": "研究历史",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Marie ist damit beschäftigt, das Huhn zu rupfen.",
              "zh": "玛丽忙着拔鸡毛。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie ist damit beschäftigt, die Reise vorzubereiten.",
              "zh": "她正忙着准备这次旅行。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich bin gerade damit beschäftigt, ein Buch zu schreiben.",
              "zh": "我现在正忙着写一本书。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich war schon damit beschäftigt, meine Ferien zu planen.",
              "zh": "我已经在忙于计划假期了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "rechnen": {
      "display": "rechnen",
      "prepositions": {
        "mit +D": [
          "mit Regen rechnen. 预计会下雨",
          "Ich habe überhaupt nicht damit gerechnet, dich hier anzutreffen. 我完全没料到会在这里碰到你。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to reckon with",
          "chinese": "预计，估计到",
          "pattern": "mit Regen rechnen",
          "patternChinese": "预计会下雨",
          "level": "B2",
          "examples": [
            {
              "de": "mit Regen rechnen",
              "zh": "预计会下雨",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich habe überhaupt nicht damit gerechnet, dich hier anzutreffen.",
              "zh": "我完全没料到会在这里碰到你。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "anfangen": {
      "display": "anfangen",
      "prepositions": {
        "mit +D": [
          "mit der Arbeit anfangen. 开始工作",
          "Morgen fange ich mit der Diät an. 明天，我开始节食。",
          "Fangen wir mit der letzten Zeile an! 让我们从最后一行开始吧。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to start with",
          "chinese": "以…开始",
          "pattern": "mit der Arbeit anfangen",
          "patternChinese": "开始工作",
          "level": "A2",
          "examples": [
            {
              "de": "mit der Arbeit anfangen",
              "zh": "开始工作",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Morgen fange ich mit der Diät an.",
              "zh": "明天，我开始节食。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Fangen wir mit der letzten Zeile an!",
              "zh": "让我们从最后一行开始吧。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "beginnen": {
      "display": "beginnen",
      "prepositions": {
        "mit +D": [
          "mit dem Kurs beginnen. 开始课程",
          "Eine Reise von tausend Meilen beginnt mit dem ersten Schritt. 千里之行，始于足下。",
          "Eine tausend Meilen lange Reise beginnt mit einem einzigen Schritt. 千里之行，始于足下。",
          "Lasst uns mit Seite dreißig beginnen. 让我们从第30页开始。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to begin with",
          "chinese": "开始",
          "pattern": "mit dem Kurs beginnen",
          "patternChinese": "开始课程",
          "level": "A2",
          "examples": [
            {
              "de": "mit dem Kurs beginnen",
              "zh": "开始课程",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Eine Reise von tausend Meilen beginnt mit dem ersten Schritt.",
              "zh": "千里之行，始于足下。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Eine tausend Meilen lange Reise beginnt mit einem einzigen Schritt.",
              "zh": "千里之行，始于足下。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Lasst uns mit Seite dreißig beginnen.",
              "zh": "让我们从第30页开始。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "aufhören": {
      "display": "aufhören",
      "prepositions": {
        "mit +D": [
          "mit dem Rauchen aufhören. 戒烟",
          "Hör mal auf damit! 住手。",
          "Hör auf mit dem Mobbing. 停止霸凌！",
          "Wenn du etwas länger leben möchtest, hör mit dem Rauchen auf. 如果你想活得久一点就戒烟。",
          "Hör auf mit den Unkenrufen! 别说这么不吉利的话。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to stop doing",
          "chinese": "停止",
          "pattern": "mit dem Rauchen aufhören",
          "patternChinese": "戒烟",
          "level": "A2",
          "examples": [
            {
              "de": "mit dem Rauchen aufhören",
              "zh": "戒烟",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Hör mal auf damit!",
              "zh": "住手。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Hör auf mit dem Mobbing.",
              "zh": "停止霸凌！",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wenn du etwas länger leben möchtest, hör mit dem Rauchen auf.",
              "zh": "如果你想活得久一点就戒烟。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Hör auf mit den Unkenrufen!",
              "zh": "别说这么不吉利的话。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich unterhalten": {
      "display": "sich unterhalten",
      "prepositions": {
        "mit +D": [
          "sich mit dem Nachbarn unterhalten. 和邻居聊天"
        ],
        "über +A": [
          "sich über den Film unterhalten. 谈论这部电影"
        ]
      },
      "prepositionOrder": [
        "mit +D",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to converse with",
          "chinese": "与…交谈",
          "pattern": "sich mit dem Nachbarn unterhalten",
          "patternChinese": "和邻居聊天",
          "level": "B1",
          "examples": [
            {
              "de": "sich mit dem Nachbarn unterhalten",
              "zh": "和邻居聊天",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to talk about",
          "chinese": "谈论",
          "pattern": "sich über den Film unterhalten",
          "patternChinese": "谈论这部电影",
          "level": "B1",
          "examples": [
            {
              "de": "sich über den Film unterhalten",
              "zh": "谈论这部电影",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sprechen": {
      "display": "sprechen",
      "prepositions": {
        "mit +D": [
          "mit dem Arzt sprechen. 和医生谈",
          "Ich spreche jeden Tag mit ihm. 我每天都跟他说。",
          "Warum willst du mit mir sprechen? 为什么你想和我谈谈吗?",
          "Über was willst du mit mir sprechen? 你想跟我说什么？",
          "Sie fing an, mit einem Hund zu sprechen. 她对一条狗开始了说话。"
        ],
        "über +A": [
          "über die Arbeit sprechen. 谈工作",
          "Tom will nicht darüber sprechen. 汤姆不想谈这件事。",
          "Ich will nicht darüber sprechen. 我不想谈论这个问题。",
          "Gut, lasst uns nicht mehr darüber sprechen! 好了，不要再说了。",
          "Ich würde gerne mit Ihnen über den Preis sprechen. 我想和你谈谈价钱。"
        ],
        "von +D": [
          "von einem Problem sprechen. 谈到一个问题",
          "Gut, sprechen wir nicht mehr davon! 好了，不要再说了。",
          "Ich weiß nicht, wovon Sie sprechen. 我不知道您在说什么。",
          "Es ist sehr unhöflich von dir, so zu sprechen. 你这么说很失礼。",
          "Ich weiß nicht, von was Sie sprechen. 我不知道您在说什么。"
        ],
        "gegen +A": [
          "gegen den Vorschlag sprechen. 反对这个提议"
        ]
      },
      "prepositionOrder": [
        "mit +D",
        "über +A",
        "von +D",
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to speak with",
          "chinese": "与…谈话",
          "pattern": "mit dem Arzt sprechen",
          "patternChinese": "和医生谈",
          "level": "A1",
          "examples": [
            {
              "de": "mit dem Arzt sprechen",
              "zh": "和医生谈",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich spreche jeden Tag mit ihm.",
              "zh": "我每天都跟他说。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Warum willst du mit mir sprechen?",
              "zh": "为什么你想和我谈谈吗?",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Über was willst du mit mir sprechen?",
              "zh": "你想跟我说什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie fing an, mit einem Hund zu sprechen.",
              "zh": "她对一条狗开始了说话。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to talk about",
          "chinese": "谈论",
          "pattern": "über die Arbeit sprechen",
          "patternChinese": "谈工作",
          "level": "A2",
          "examples": [
            {
              "de": "über die Arbeit sprechen",
              "zh": "谈工作",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Tom will nicht darüber sprechen.",
              "zh": "汤姆不想谈这件事。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich will nicht darüber sprechen.",
              "zh": "我不想谈论这个问题。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Gut, lasst uns nicht mehr darüber sprechen!",
              "zh": "好了，不要再说了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich würde gerne mit Ihnen über den Preis sprechen.",
              "zh": "我想和你谈谈价钱。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to speak of",
          "chinese": "谈到",
          "pattern": "von einem Problem sprechen",
          "patternChinese": "谈到一个问题",
          "level": "B1",
          "examples": [
            {
              "de": "von einem Problem sprechen",
              "zh": "谈到一个问题",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Gut, sprechen wir nicht mehr davon!",
              "zh": "好了，不要再说了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich weiß nicht, wovon Sie sprechen.",
              "zh": "我不知道您在说什么。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es ist sehr unhöflich von dir, so zu sprechen.",
              "zh": "你这么说很失礼。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich weiß nicht, von was Sie sprechen.",
              "zh": "我不知道您在说什么。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to speak against",
          "chinese": "反对",
          "pattern": "gegen den Vorschlag sprechen",
          "patternChinese": "反对这个提议",
          "level": "B2",
          "examples": [
            {
              "de": "gegen den Vorschlag sprechen",
              "zh": "反对这个提议",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich treffen": {
      "display": "sich treffen",
      "prepositions": {
        "mit +D": [
          "sich mit Freunden treffen. 和朋友见面",
          "Ich will mich nicht mit dir treffen. 我不想见你。",
          "Netzaktivisten wollen sich mit dem obersten Führer treffen. 网络积极分子想跟最高领袖见面。",
          "Ich will mich mit Tom treffen. 我想见汤姆。",
          "In meiner Freizeit treffe ich mich gern mit Freunden. 在我闲暇之时我喜欢和朋友们聚聚。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to meet with",
          "chinese": "与…见面",
          "pattern": "sich mit Freunden treffen",
          "patternChinese": "和朋友见面",
          "level": "A2",
          "examples": [
            {
              "de": "sich mit Freunden treffen",
              "zh": "和朋友见面",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich will mich nicht mit dir treffen.",
              "zh": "我不想见你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Netzaktivisten wollen sich mit dem obersten Führer treffen.",
              "zh": "网络积极分子想跟最高领袖见面。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich will mich mit Tom treffen.",
              "zh": "我想见汤姆。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "In meiner Freizeit treffe ich mich gern mit Freunden.",
              "zh": "在我闲暇之时我喜欢和朋友们聚聚。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "telefonieren": {
      "display": "telefonieren",
      "prepositions": {
        "mit +D": [
          "mit den Eltern telefonieren. 给父母打电话",
          "Warum hast du nicht gestern Abend mit mir telefoniert? 你昨晚怎么没给我打电话？",
          "Der Kunde hat zwei Stunden lang mit dem Verkäufer telefoniert. 客人和售货员打了2小时电话。",
          "Nächste Woche werde ich dir schreiben oder mit dir telefonieren. 下周我会给你写信或打电话的。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to phone sb",
          "chinese": "与…通电话",
          "pattern": "mit den Eltern telefonieren",
          "patternChinese": "给父母打电话",
          "level": "A2",
          "examples": [
            {
              "de": "mit den Eltern telefonieren",
              "zh": "给父母打电话",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Warum hast du nicht gestern Abend mit mir telefoniert?",
              "zh": "你昨晚怎么没给我打电话？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Der Kunde hat zwei Stunden lang mit dem Verkäufer telefoniert.",
              "zh": "客人和售货员打了2小时电话。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Nächste Woche werde ich dir schreiben oder mit dir telefonieren.",
              "zh": "下周我会给你写信或打电话的。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich verstehen": {
      "display": "sich verstehen",
      "prepositions": {
        "mit +D": [
          "sich mit den Kollegen gut verstehen. 和同事相处得好",
          "Ich verstehe mich gut mit ihm. 我跟他处得很好。",
          "Verstehst du dich gut mit deinem Chef? 你跟老板合得来吗？",
          "Ich verstehe mich mit meinem jüngeren Bruder. 我与我的弟弟相处融洽。",
          "Bitte sprich deutlich, damit dich jeder versteht. 请道明以使大家明白你的意思。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to get along with",
          "chinese": "与…相处",
          "pattern": "sich mit den Kollegen gut verstehen",
          "patternChinese": "和同事相处得好",
          "level": "B1",
          "examples": [
            {
              "de": "sich mit den Kollegen gut verstehen",
              "zh": "和同事相处得好",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich verstehe mich gut mit ihm.",
              "zh": "我跟他处得很好。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Verstehst du dich gut mit deinem Chef?",
              "zh": "你跟老板合得来吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich verstehe mich mit meinem jüngeren Bruder.",
              "zh": "我与我的弟弟相处融洽。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Bitte sprich deutlich, damit dich jeder versteht.",
              "zh": "请道明以使大家明白你的意思。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich abfinden": {
      "display": "sich abfinden",
      "prepositions": {
        "mit +D": [
          "sich mit der Lage abfinden. 接受现状"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to come to terms with",
          "chinese": "接受（现实）",
          "pattern": "sich mit der Lage abfinden",
          "patternChinese": "接受现状",
          "level": "C1",
          "examples": [
            {
              "de": "sich mit der Lage abfinden",
              "zh": "接受现状",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "vergleichen": {
      "display": "vergleichen",
      "prepositions": {
        "mit +D": [
          "die Preise mit dem Angebot vergleichen. 与报价比较",
          "Du kannst dich nicht mit mir vergleichen. 你不如我。",
          "Vergleiche deine Antworten mit denen des Lehrers. 把你的答案和老师的比较一下。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to compare with",
          "chinese": "与…比较",
          "pattern": "die Preise mit dem Angebot vergleichen",
          "patternChinese": "与报价比较",
          "level": "B1",
          "examples": [
            {
              "de": "die Preise mit dem Angebot vergleichen",
              "zh": "与报价比较",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Du kannst dich nicht mit mir vergleichen.",
              "zh": "你不如我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Vergleiche deine Antworten mit denen des Lehrers.",
              "zh": "把你的答案和老师的比较一下。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich befassen": {
      "display": "sich befassen",
      "prepositions": {
        "mit +D": [
          "sich mit dem Antrag befassen. 处理申请",
          "Wir befassten uns mit der Wirtschaftspolitik der Regierung. 我们研究了政府的经济政策。",
          "Er schrieb einen Brief, der sich mit der Angelegenheit sehr ernsthaft befasste. 他写了一封信函认真地讨论了那个事情。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to deal with",
          "chinese": "处理，研究",
          "pattern": "sich mit dem Antrag befassen",
          "patternChinese": "处理申请",
          "level": "C1",
          "examples": [
            {
              "de": "sich mit dem Antrag befassen",
              "zh": "处理申请",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Wir befassten uns mit der Wirtschaftspolitik der Regierung.",
              "zh": "我们研究了政府的经济政策。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er schrieb einen Brief, der sich mit der Angelegenheit sehr ernsthaft befasste.",
              "zh": "他写了一封信函认真地讨论了那个事情。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich begnügen": {
      "display": "sich begnügen",
      "prepositions": {
        "mit +D": [
          "sich mit wenig begnügen. 知足"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to be content with",
          "chinese": "满足于",
          "pattern": "sich mit wenig begnügen",
          "patternChinese": "知足",
          "level": "C1",
          "examples": [
            {
              "de": "sich mit wenig begnügen",
              "zh": "知足",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich streiten": {
      "display": "sich streiten",
      "prepositions": {
        "mit +D": [
          "sich mit dem Bruder streiten. 和哥哥吵架",
          "Es bringt nichts, mit ihm darüber zu streiten. 和他争论这件事得不出结果。",
          "Es führt zu nichts, mit ihm darüber zu streiten. 和他争论这件事得不出结果。",
          "Er streitet sich immer mit seiner Frau. 他总是与他的妻子吵架。",
          "Sie streitet sich immer mit ihren Brüdern. 她一直和她的兄弟争吵。"
        ],
        "über +A": [
          "über die Kosten streiten. 为费用争论",
          "Worüber streitet ihr zwei euch? 你们两个在争论什么？",
          "Es bringt nichts, mit ihm darüber zu streiten. 和他争论这件事得不出结果。",
          "Es führt zu nichts, mit ihm darüber zu streiten. 和他争论这件事得不出结果。"
        ],
        "um +A": [
          "sich um das Erbe streiten. 争夺遗产"
        ]
      },
      "prepositionOrder": [
        "mit +D",
        "über +A",
        "um +A"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to quarrel with",
          "chinese": "与…争吵",
          "pattern": "sich mit dem Bruder streiten",
          "patternChinese": "和哥哥吵架",
          "level": "B1",
          "examples": [
            {
              "de": "sich mit dem Bruder streiten",
              "zh": "和哥哥吵架",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Es bringt nichts, mit ihm darüber zu streiten.",
              "zh": "和他争论这件事得不出结果。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es führt zu nichts, mit ihm darüber zu streiten.",
              "zh": "和他争论这件事得不出结果。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er streitet sich immer mit seiner Frau.",
              "zh": "他总是与他的妻子吵架。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie streitet sich immer mit ihren Brüdern.",
              "zh": "她一直和她的兄弟争吵。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to argue about",
          "chinese": "为…争论",
          "pattern": "über die Kosten streiten",
          "patternChinese": "为费用争论",
          "level": "B2",
          "examples": [
            {
              "de": "über die Kosten streiten",
              "zh": "为费用争论",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Worüber streitet ihr zwei euch?",
              "zh": "你们两个在争论什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es bringt nichts, mit ihm darüber zu streiten.",
              "zh": "和他争论这件事得不出结果。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es führt zu nichts, mit ihm darüber zu streiten.",
              "zh": "和他争论这件事得不出结果。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to fight over",
          "chinese": "争夺",
          "pattern": "sich um das Erbe streiten",
          "patternChinese": "争夺遗产",
          "level": "B2",
          "examples": [
            {
              "de": "sich um das Erbe streiten",
              "zh": "争夺遗产",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verbinden": {
      "display": "verbinden",
      "prepositions": {
        "mit +D": [
          "Erfolg mit Fleiß verbinden. 把成功与勤奋联系起来",
          "Wir verbinden die Farbe Schwarz oft mit Tod. 我们常把黑色跟死亡联系起来。",
          "Ich mag es nicht, Geschäft mit Vergnügen zu verbinden. 我不喜欢把生意和快乐混在一起。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to connect with",
          "chinese": "与…联系起来",
          "pattern": "Erfolg mit Fleiß verbinden",
          "patternChinese": "把成功与勤奋联系起来",
          "level": "B2",
          "examples": [
            {
              "de": "Erfolg mit Fleiß verbinden",
              "zh": "把成功与勤奋联系起来",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Wir verbinden die Farbe Schwarz oft mit Tod.",
              "zh": "我们常把黑色跟死亡联系起来。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich mag es nicht, Geschäft mit Vergnügen zu verbinden.",
              "zh": "我不喜欢把生意和快乐混在一起。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "übereinstimmen": {
      "display": "übereinstimmen",
      "prepositions": {
        "mit +D": [
          "mit der Aussage übereinstimmen. 与该说法一致"
        ],
        "in +D": [
          "in diesem Punkt übereinstimmen. 在这一点上一致"
        ]
      },
      "prepositionOrder": [
        "mit +D",
        "in +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to agree with",
          "chinese": "与…一致",
          "pattern": "mit der Aussage übereinstimmen",
          "patternChinese": "与该说法一致",
          "level": "C1",
          "examples": [
            {
              "de": "mit der Aussage übereinstimmen",
              "zh": "与该说法一致",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to agree in",
          "chinese": "在…上一致",
          "pattern": "in diesem Punkt übereinstimmen",
          "patternChinese": "在这一点上一致",
          "level": "C1",
          "examples": [
            {
              "de": "in diesem Punkt übereinstimmen",
              "zh": "在这一点上一致",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich verabreden": {
      "display": "sich verabreden",
      "prepositions": {
        "mit +D": [
          "sich mit dem Kunden verabreden. 与客户约好"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to arrange to meet",
          "chinese": "与…约好",
          "pattern": "sich mit dem Kunden verabreden",
          "patternChinese": "与客户约好",
          "level": "B1",
          "examples": [
            {
              "de": "sich mit dem Kunden verabreden",
              "zh": "与客户约好",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "zusammenhängen": {
      "display": "zusammenhängen",
      "prepositions": {
        "mit +D": [
          "Das hängt mit dem Wetter zusammen. 这与天气有关"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to be connected with",
          "chinese": "与…有关",
          "pattern": "Das hängt mit dem Wetter zusammen",
          "patternChinese": "这与天气有关",
          "level": "B2",
          "examples": [
            {
              "de": "Das hängt mit dem Wetter zusammen",
              "zh": "这与天气有关",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich auseinandersetzen": {
      "display": "sich auseinandersetzen",
      "prepositions": {
        "mit +D": [
          "sich mit dem Thema auseinandersetzen. 深入探讨这个题目"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to engage critically with",
          "chinese": "深入探讨",
          "pattern": "sich mit dem Thema auseinandersetzen",
          "patternChinese": "深入探讨这个题目",
          "level": "C1",
          "examples": [
            {
              "de": "sich mit dem Thema auseinandersetzen",
              "zh": "深入探讨这个题目",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich anfreunden": {
      "display": "sich anfreunden",
      "prepositions": {
        "mit +D": [
          "sich mit den Nachbarn anfreunden. 与邻居交上朋友"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to make friends with",
          "chinese": "与…交朋友",
          "pattern": "sich mit den Nachbarn anfreunden",
          "patternChinese": "与邻居交上朋友",
          "level": "B2",
          "examples": [
            {
              "de": "sich mit den Nachbarn anfreunden",
              "zh": "与邻居交上朋友",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "umgehen": {
      "display": "umgehen",
      "prepositions": {
        "mit +D": [
          "mit Geld sparsam umgehen. 花钱节省"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to handle",
          "chinese": "对待，使用",
          "pattern": "mit Geld sparsam umgehen",
          "patternChinese": "花钱节省",
          "level": "B2",
          "examples": [
            {
              "de": "mit Geld sparsam umgehen",
              "zh": "花钱节省",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich identifizieren": {
      "display": "sich identifizieren",
      "prepositions": {
        "mit +D": [
          "sich mit der Firma identifizieren. 认同这家公司"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to identify with",
          "chinese": "认同",
          "pattern": "sich mit der Firma identifizieren",
          "patternChinese": "认同这家公司",
          "level": "C1",
          "examples": [
            {
              "de": "sich mit der Firma identifizieren",
              "zh": "认同这家公司",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich versöhnen": {
      "display": "sich versöhnen",
      "prepositions": {
        "mit +D": [
          "sich mit dem Freund versöhnen. 与朋友和好",
          "Ich würde mich eher umbringen als mich mit meinem Schicksal zu versöhnen. 与其向命运妥协，我宁可自杀。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to reconcile with",
          "chinese": "与…和解",
          "pattern": "sich mit dem Freund versöhnen",
          "patternChinese": "与朋友和好",
          "level": "B2",
          "examples": [
            {
              "de": "sich mit dem Freund versöhnen",
              "zh": "与朋友和好",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich würde mich eher umbringen als mich mit meinem Schicksal zu versöhnen.",
              "zh": "与其向命运妥协，我宁可自杀。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "fragen": {
      "display": "fragen",
      "prepositions": {
        "nach +D": [
          "nach dem Weg fragen. 问路",
          "Ich frag mal nach dem Weg. 我问问路。",
          "Frag ihn nach seinem Namen. 问他一下他的名字。",
          "Ich frage ihn morgen danach. 我明天会问他。",
          "Ich fragte ihn nach seinem Namen. 我问了他叫什么名字。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to ask for/about",
          "chinese": "询问",
          "pattern": "nach dem Weg fragen",
          "patternChinese": "问路",
          "level": "A1",
          "examples": [
            {
              "de": "nach dem Weg fragen",
              "zh": "问路",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich frag mal nach dem Weg.",
              "zh": "我问问路。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Frag ihn nach seinem Namen.",
              "zh": "问他一下他的名字。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich frage ihn morgen danach.",
              "zh": "我明天会问他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich fragte ihn nach seinem Namen.",
              "zh": "我问了他叫什么名字。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "suchen": {
      "display": "suchen",
      "prepositions": {
        "nach +D": [
          "nach dem Schlüssel suchen. 找钥匙",
          "Nach wem suchst du? 你在找谁？",
          "Wir suchen nach ihm. 我们在找他。",
          "Nach wem suchst du, Tom? 你在找谁，汤姆？",
          "Wonach sollte ich suchen? 我应该寻找什么？"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to search for",
          "chinese": "寻找",
          "pattern": "nach dem Schlüssel suchen",
          "patternChinese": "找钥匙",
          "level": "A2",
          "examples": [
            {
              "de": "nach dem Schlüssel suchen",
              "zh": "找钥匙",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Nach wem suchst du?",
              "zh": "你在找谁？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir suchen nach ihm.",
              "zh": "我们在找他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Nach wem suchst du, Tom?",
              "zh": "你在找谁，汤姆？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wonach sollte ich suchen?",
              "zh": "我应该寻找什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich sehnen": {
      "display": "sich sehnen",
      "prepositions": {
        "nach +D": [
          "sich nach Ruhe sehnen. 渴望安静",
          "Ich sehne mich nach dir. 我想你。",
          "Ich habe mich nach deinem Anblick gesehnt. 我一直想见你。",
          "Maria sehnte sich danach, geliebt zu werden. 玛丽渴求的就是有人关爱她。",
          "Wir sehnen uns nach Frieden. 我们渴望和平。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to long for",
          "chinese": "渴望",
          "pattern": "sich nach Ruhe sehnen",
          "patternChinese": "渴望安静",
          "level": "C1",
          "examples": [
            {
              "de": "sich nach Ruhe sehnen",
              "zh": "渴望安静",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich sehne mich nach dir.",
              "zh": "我想你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe mich nach deinem Anblick gesehnt.",
              "zh": "我一直想见你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Maria sehnte sich danach, geliebt zu werden.",
              "zh": "玛丽渴求的就是有人关爱她。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir sehnen uns nach Frieden.",
              "zh": "我们渴望和平。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "riechen": {
      "display": "riechen",
      "prepositions": {
        "nach +D": [
          "nach Kaffee riechen. 有咖啡味",
          "Das riecht nach Käse. 那闻起来像奶酪。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to smell of",
          "chinese": "闻起来有…味",
          "pattern": "nach Kaffee riechen",
          "patternChinese": "有咖啡味",
          "level": "B1",
          "examples": [
            {
              "de": "nach Kaffee riechen",
              "zh": "有咖啡味",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Das riecht nach Käse.",
              "zh": "那闻起来像奶酪。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "schmecken": {
      "display": "schmecken",
      "prepositions": {
        "nach +D": [
          "nach Zitrone schmecken. 有柠檬味",
          "Wonach schmeckt dieser Joghurt? 这个酸奶是什么口味的？",
          "Das schmeckt nach mehr. 那很开胃。",
          "Dieser Kuchen schmeckt nach Käse. 这块蛋糕尝起来有奶酪的味道。",
          "Dieser Salat schmeckt nach Zitrone. 这个沙拉有柠檬的味道。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to taste of",
          "chinese": "尝起来有…味",
          "pattern": "nach Zitrone schmecken",
          "patternChinese": "有柠檬味",
          "level": "B1",
          "examples": [
            {
              "de": "nach Zitrone schmecken",
              "zh": "有柠檬味",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Wonach schmeckt dieser Joghurt?",
              "zh": "这个酸奶是什么口味的？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das schmeckt nach mehr.",
              "zh": "那很开胃。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dieser Kuchen schmeckt nach Käse.",
              "zh": "这块蛋糕尝起来有奶酪的味道。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dieser Salat schmeckt nach Zitrone.",
              "zh": "这个沙拉有柠檬的味道。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "streben": {
      "display": "streben",
      "prepositions": {
        "nach +D": [
          "nach Erfolg streben. 追求成功",
          "Mayuko strebt immer nach Perfektion. 麻由子总是追求完美。",
          "Er strebt immer nach Erfolg und Reichtum. 他一直在追求成功和财富。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to strive for",
          "chinese": "追求",
          "pattern": "nach Erfolg streben",
          "patternChinese": "追求成功",
          "level": "C1",
          "examples": [
            {
              "de": "nach Erfolg streben",
              "zh": "追求成功",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Mayuko strebt immer nach Perfektion.",
              "zh": "麻由子总是追求完美。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er strebt immer nach Erfolg und Reichtum.",
              "zh": "他一直在追求成功和财富。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "greifen": {
      "display": "greifen",
      "prepositions": {
        "nach +D": [
          "nach dem Glas greifen. 去拿杯子"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to reach for",
          "chinese": "伸手去拿",
          "pattern": "nach dem Glas greifen",
          "patternChinese": "去拿杯子",
          "level": "B2",
          "examples": [
            {
              "de": "nach dem Glas greifen",
              "zh": "去拿杯子",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "rufen": {
      "display": "rufen",
      "prepositions": {
        "nach +D": [
          "nach dem Kellner rufen. 叫服务员",
          "Ich rufe dich an, wenn ich nach Hause komme. 我到家后给你打电话。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to call for",
          "chinese": "呼唤",
          "pattern": "nach dem Kellner rufen",
          "patternChinese": "叫服务员",
          "level": "B1",
          "examples": [
            {
              "de": "nach dem Kellner rufen",
              "zh": "叫服务员",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich rufe dich an, wenn ich nach Hause komme.",
              "zh": "我到家后给你打电话。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "klingen": {
      "display": "klingen",
      "prepositions": {
        "nach +D": [
          "nach einer guten Idee klingen. 听起来是个好主意"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to sound like",
          "chinese": "听起来像",
          "pattern": "nach einer guten Idee klingen",
          "patternChinese": "听起来是个好主意",
          "level": "B2",
          "examples": [
            {
              "de": "nach einer guten Idee klingen",
              "zh": "听起来是个好主意",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "urteilen": {
      "display": "urteilen",
      "prepositions": {
        "nach +D": [
          "nach dem Aussehen urteilen. 以貌取人",
          "Seinem Aussehen nach zu urteilen, ist er ein reicher Mann. 从他的外表来看，他应该是个有钱人。",
          "Dem Himmel nach zu urteilen, wird es wahrscheinlich regnen. 看看天的样子，要下雨了。",
          "Dem Himmel nach zu urteilen, könnte es heute Nachmittag regnen. 从天色上判断，今天下午可能会下雨。"
        ],
        "über +A": [
          "über andere urteilen. 评判他人"
        ]
      },
      "prepositionOrder": [
        "nach +D",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to judge by",
          "chinese": "据…判断",
          "pattern": "nach dem Aussehen urteilen",
          "patternChinese": "以貌取人",
          "level": "C1",
          "examples": [
            {
              "de": "nach dem Aussehen urteilen",
              "zh": "以貌取人",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Seinem Aussehen nach zu urteilen, ist er ein reicher Mann.",
              "zh": "从他的外表来看，他应该是个有钱人。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dem Himmel nach zu urteilen, wird es wahrscheinlich regnen.",
              "zh": "看看天的样子，要下雨了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dem Himmel nach zu urteilen, könnte es heute Nachmittag regnen.",
              "zh": "从天色上判断，今天下午可能会下雨。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to pass judgement on",
          "chinese": "评判",
          "pattern": "über andere urteilen",
          "patternChinese": "评判他人",
          "level": "C1",
          "examples": [
            {
              "de": "über andere urteilen",
              "zh": "评判他人",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verlangen": {
      "display": "verlangen",
      "prepositions": {
        "nach +D": [
          "nach Wasser verlangen. 想喝水",
          "Meiner Meinung nach, verlangt Tom uns viel zu viel ab. 我觉得汤姆对我们的期待太高了。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to crave",
          "chinese": "渴求",
          "pattern": "nach Wasser verlangen",
          "patternChinese": "想喝水",
          "level": "C1",
          "examples": [
            {
              "de": "nach Wasser verlangen",
              "zh": "想喝水",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Meiner Meinung nach, verlangt Tom uns viel zu viel ab.",
              "zh": "我觉得汤姆对我们的期待太高了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "forschen": {
      "display": "forschen",
      "prepositions": {
        "nach +D": [
          "nach den Ursachen forschen. 探究原因"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to research into",
          "chinese": "探究",
          "pattern": "nach den Ursachen forschen",
          "patternChinese": "探究原因",
          "level": "C1",
          "examples": [
            {
              "de": "nach den Ursachen forschen",
              "zh": "探究原因",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "duften": {
      "display": "duften",
      "prepositions": {
        "nach +D": [
          "nach Blumen duften. 散发花香"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to smell (pleasantly) of",
          "chinese": "散发…香味",
          "pattern": "nach Blumen duften",
          "patternChinese": "散发花香",
          "level": "B2",
          "examples": [
            {
              "de": "nach Blumen duften",
              "zh": "散发花香",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "aussehen": {
      "display": "aussehen",
      "prepositions": {
        "nach +D": [
          "Es sieht nach Regen aus. 看样子要下雨",
          "Von meinem Zimmer in Brooklyn aus kann ich bis nach Manhattan sehen. 我能从布鲁克林的房间看到曼哈顿。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to look like",
          "chinese": "看起来像",
          "pattern": "Es sieht nach Regen aus",
          "patternChinese": "看样子要下雨",
          "level": "B1",
          "examples": [
            {
              "de": "Es sieht nach Regen aus",
              "zh": "看样子要下雨",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Von meinem Zimmer in Brooklyn aus kann ich bis nach Manhattan sehen.",
              "zh": "我能从布鲁克林的房间看到曼哈顿。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich ärgern": {
      "display": "sich ärgern",
      "prepositions": {
        "über +A": [
          "sich über den Lärm ärgern. 因噪音生气",
          "Sie ärgert sich über mich. 她在跟我赌气。",
          "Ich ärgerte mich darüber, genarrt worden zu sein. 我很生气我被骗了。",
          "Ich ärgerte mich darüber, dass man mich hinters Licht geführt hatte. 我很生气我被骗了。"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to be annoyed about",
          "chinese": "对…生气",
          "pattern": "sich über den Lärm ärgern",
          "patternChinese": "因噪音生气",
          "level": "B1",
          "examples": [
            {
              "de": "sich über den Lärm ärgern",
              "zh": "因噪音生气",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie ärgert sich über mich.",
              "zh": "她在跟我赌气。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich ärgerte mich darüber, genarrt worden zu sein.",
              "zh": "我很生气我被骗了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich ärgerte mich darüber, dass man mich hinters Licht geführt hatte.",
              "zh": "我很生气我被骗了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "reden": {
      "display": "reden",
      "prepositions": {
        "über +A": [
          "über Politik reden. 谈政治",
          "Worüber redet ihr gerade? 大家在说什么呢？",
          "Ich muss nicht darüber reden. 我不需要谈论它。",
          "Worüber redet ihr eigentlich? 你到底在谈什么?",
          "Ich verstehe nicht, worüber ihr redet. 我不明白你们在说什么。"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to talk about",
          "chinese": "谈论",
          "pattern": "über Politik reden",
          "patternChinese": "谈政治",
          "level": "A2",
          "examples": [
            {
              "de": "über Politik reden",
              "zh": "谈政治",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Worüber redet ihr gerade?",
              "zh": "大家在说什么呢？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich muss nicht darüber reden.",
              "zh": "我不需要谈论它。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Worüber redet ihr eigentlich?",
              "zh": "你到底在谈什么?",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich verstehe nicht, worüber ihr redet.",
              "zh": "我不明白你们在说什么。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "diskutieren": {
      "display": "diskutieren",
      "prepositions": {
        "über +A": [
          "über den Plan diskutieren. 讨论计划",
          "Ich will nicht darüber diskutieren. 我不想谈论这件事。",
          "Wir diskutieren gerade über den Islam. 我们正谈论伊斯兰教。",
          "Es bringt nichts, darüber zu diskutieren. 争论是它是没有用的。"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to discuss",
          "chinese": "讨论",
          "pattern": "über den Plan diskutieren",
          "patternChinese": "讨论计划",
          "level": "B1",
          "examples": [
            {
              "de": "über den Plan diskutieren",
              "zh": "讨论计划",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich will nicht darüber diskutieren.",
              "zh": "我不想谈论这件事。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir diskutieren gerade über den Islam.",
              "zh": "我们正谈论伊斯兰教。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es bringt nichts, darüber zu diskutieren.",
              "zh": "争论是它是没有用的。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "nachdenken": {
      "display": "nachdenken",
      "prepositions": {
        "über +A": [
          "über die Zukunft nachdenken. 思考未来",
          "Denk mal darüber nach. 你想想。",
          "Worüber denkst du nach? 你在想什么？",
          "Denk darüber nach, okay? 想一想，好吗？",
          "Ich denke später darüber nach. 我之后再考虑。"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to think about",
          "chinese": "思考",
          "pattern": "über die Zukunft nachdenken",
          "patternChinese": "思考未来",
          "level": "B1",
          "examples": [
            {
              "de": "über die Zukunft nachdenken",
              "zh": "思考未来",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Denk mal darüber nach.",
              "zh": "你想想。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Worüber denkst du nach?",
              "zh": "你在想什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Denk darüber nach, okay?",
              "zh": "想一想，好吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich denke später darüber nach.",
              "zh": "我之后再考虑。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich informieren": {
      "display": "sich informieren",
      "prepositions": {
        "über +A": [
          "sich über den Kurs informieren. 了解课程"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to get information about",
          "chinese": "了解",
          "pattern": "sich über den Kurs informieren",
          "patternChinese": "了解课程",
          "level": "B1",
          "examples": [
            {
              "de": "sich über den Kurs informieren",
              "zh": "了解课程",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich wundern": {
      "display": "sich wundern",
      "prepositions": {
        "über +A": [
          "sich über die Antwort wundern. 对答复感到奇怪"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to be surprised at",
          "chinese": "对…感到奇怪",
          "pattern": "sich über die Antwort wundern",
          "patternChinese": "对答复感到奇怪",
          "level": "B2",
          "examples": [
            {
              "de": "sich über die Antwort wundern",
              "zh": "对答复感到奇怪",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "lachen": {
      "display": "lachen",
      "prepositions": {
        "über +A": [
          "über den Witz lachen. 笑这个笑话",
          "Lach nicht über mich. 你别笑我。",
          "Zuerst lachen sie über dich, dann bekämpfen sie dich, und dann gewinnst du. 首先他们嘲笑你，其次他们和你作战，然后你赢了。"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to laugh at",
          "chinese": "笑，嘲笑",
          "pattern": "über den Witz lachen",
          "patternChinese": "笑这个笑话",
          "level": "A2",
          "examples": [
            {
              "de": "über den Witz lachen",
              "zh": "笑这个笑话",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Lach nicht über mich.",
              "zh": "你别笑我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Zuerst lachen sie über dich, dann bekämpfen sie dich, und dann gewinnst du.",
              "zh": "首先他们嘲笑你，其次他们和你作战，然后你赢了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich aufregen": {
      "display": "sich aufregen",
      "prepositions": {
        "über +A": [
          "sich über den Verkehr aufregen. 为交通生气",
          "Worüber regen sie sich auf? 他们为什么在生气？"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to get worked up about",
          "chinese": "为…激动生气",
          "pattern": "sich über den Verkehr aufregen",
          "patternChinese": "为交通生气",
          "level": "B2",
          "examples": [
            {
              "de": "sich über den Verkehr aufregen",
              "zh": "为交通生气",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Worüber regen sie sich auf?",
              "zh": "他们为什么在生气？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "berichten": {
      "display": "berichten",
      "prepositions": {
        "über +A": [
          "über das Konzert berichten. 报道音乐会"
        ],
        "von +D": [
          "von der Reise berichten. 讲述旅行",
          "Berichte mir von Deutschland! 给我讲讲关于德国的事吧。"
        ]
      },
      "prepositionOrder": [
        "über +A",
        "von +D"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to report on",
          "chinese": "报道",
          "pattern": "über das Konzert berichten",
          "patternChinese": "报道音乐会",
          "level": "B1",
          "examples": [
            {
              "de": "über das Konzert berichten",
              "zh": "报道音乐会",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to report about",
          "chinese": "讲述",
          "pattern": "von der Reise berichten",
          "patternChinese": "讲述旅行",
          "level": "B1",
          "examples": [
            {
              "de": "von der Reise berichten",
              "zh": "讲述旅行",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Berichte mir von Deutschland!",
              "zh": "给我讲讲关于德国的事吧。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "verfügen": {
      "display": "verfügen",
      "prepositions": {
        "über +A": [
          "über viel Erfahrung verfügen. 拥有丰富经验"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to have at one's disposal",
          "chinese": "拥有，支配",
          "pattern": "über viel Erfahrung verfügen",
          "patternChinese": "拥有丰富经验",
          "level": "C1",
          "examples": [
            {
              "de": "über viel Erfahrung verfügen",
              "zh": "拥有丰富经验",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "entscheiden": {
      "display": "entscheiden",
      "prepositions": {
        "über +A": [
          "über den Antrag entscheiden. 对申请做出决定"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to decide on",
          "chinese": "对…做决定",
          "pattern": "über den Antrag entscheiden",
          "patternChinese": "对申请做出决定",
          "level": "B2",
          "examples": [
            {
              "de": "über den Antrag entscheiden",
              "zh": "对申请做出决定",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich beklagen": {
      "display": "sich beklagen",
      "prepositions": {
        "über +A": [
          "sich über das Essen beklagen. 埋怨饭菜",
          "Sie hat sich bei mir über meinen kleinen Lohn beklagt. 她向我抱怨我微薄的薪水。",
          "Er beklagt sich immer darüber, wie klein sein Zimmer sei. 他总是抱怨他的房间小。"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to complain about",
          "chinese": "埋怨",
          "pattern": "sich über das Essen beklagen",
          "patternChinese": "埋怨饭菜",
          "level": "C1",
          "examples": [
            {
              "de": "sich über das Essen beklagen",
              "zh": "埋怨饭菜",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie hat sich bei mir über meinen kleinen Lohn beklagt.",
              "zh": "她向我抱怨我微薄的薪水。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er beklagt sich immer darüber, wie klein sein Zimmer sei.",
              "zh": "他总是抱怨他的房间小。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "staunen": {
      "display": "staunen",
      "prepositions": {
        "über +A": [
          "über die Technik staunen. 惊叹于技术"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to marvel at",
          "chinese": "惊叹",
          "pattern": "über die Technik staunen",
          "patternChinese": "惊叹于技术",
          "level": "B2",
          "examples": [
            {
              "de": "über die Technik staunen",
              "zh": "惊叹于技术",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "herrschen": {
      "display": "herrschen",
      "prepositions": {
        "über +A": [
          "über ein Land herrschen. 统治一个国家"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to rule over",
          "chinese": "统治",
          "pattern": "über ein Land herrschen",
          "patternChinese": "统治一个国家",
          "level": "C1",
          "examples": [
            {
              "de": "über ein Land herrschen",
              "zh": "统治一个国家",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich lustig machen": {
      "display": "sich lustig machen",
      "prepositions": {
        "über +A": [
          "sich über den Nachbarn lustig machen. 取笑邻居",
          "Über wen machst du dich lustig? 你在笑话谁？",
          "Machst du dich über mich lustig? 你在嘲笑我吗？",
          "Mach dich nicht über mich lustig! 你别笑我。",
          "Wir machten uns deswegen über ihn lustig. 我们因为那件事嘲笑他。"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to make fun of",
          "chinese": "取笑",
          "pattern": "sich über den Nachbarn lustig machen",
          "patternChinese": "取笑邻居",
          "level": "B2",
          "examples": [
            {
              "de": "sich über den Nachbarn lustig machen",
              "zh": "取笑邻居",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Über wen machst du dich lustig?",
              "zh": "你在笑话谁？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Machst du dich über mich lustig?",
              "zh": "你在嘲笑我吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Mach dich nicht über mich lustig!",
              "zh": "你别笑我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir machten uns deswegen über ihn lustig.",
              "zh": "我们因为那件事嘲笑他。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "informieren": {
      "display": "informieren",
      "prepositions": {
        "über +A": [
          "die Kunden über Änderungen informieren. 通知客户变动"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to inform about",
          "chinese": "通知",
          "pattern": "die Kunden über Änderungen informieren",
          "patternChinese": "通知客户变动",
          "level": "B1",
          "examples": [
            {
              "de": "die Kunden über Änderungen informieren",
              "zh": "通知客户变动",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verhandeln": {
      "display": "verhandeln",
      "prepositions": {
        "über +A": [
          "über den Vertrag verhandeln. 就合同谈判"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to negotiate about",
          "chinese": "就…谈判",
          "pattern": "über den Vertrag verhandeln",
          "patternChinese": "就合同谈判",
          "level": "C1",
          "examples": [
            {
              "de": "über den Vertrag verhandeln",
              "zh": "就合同谈判",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich Gedanken machen": {
      "display": "sich Gedanken machen",
      "prepositions": {
        "über +A": [
          "sich Gedanken über die Zukunft machen. 考虑未来"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to think about",
          "chinese": "考虑",
          "pattern": "sich Gedanken über die Zukunft machen",
          "patternChinese": "考虑未来",
          "level": "B2",
          "examples": [
            {
              "de": "sich Gedanken über die Zukunft machen",
              "zh": "考虑未来",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Bescheid wissen": {
      "display": "Bescheid wissen",
      "prepositions": {
        "über +A": [
          "über die Regeln Bescheid wissen. 了解规定"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to be informed about",
          "chinese": "了解，知情",
          "pattern": "über die Regeln Bescheid wissen",
          "patternChinese": "了解规定",
          "level": "B2",
          "examples": [
            {
              "de": "über die Regeln Bescheid wissen",
              "zh": "了解规定",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich kümmern": {
      "display": "sich kümmern",
      "prepositions": {
        "um +A": [
          "sich um die Kinder kümmern. 照料孩子",
          "Ich kümmere mich um meinen Großvater. 我照顾我的爷爷。",
          "Wer kümmert sich darum, wann sie heiratet? 谁在乎她何时结婚?",
          "Sie kümmert sich nicht darum, wie sie sich anzieht. 她不在乎她的穿着。",
          "Du kümmerst dich ums Geldverdienen; ich kümmere mich darum, gut auszusehen. 你负责赚钱养家，我负责貌美如花。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to take care of",
          "chinese": "照料",
          "pattern": "sich um die Kinder kümmern",
          "patternChinese": "照料孩子",
          "level": "B1",
          "examples": [
            {
              "de": "sich um die Kinder kümmern",
              "zh": "照料孩子",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich kümmere mich um meinen Großvater.",
              "zh": "我照顾我的爷爷。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wer kümmert sich darum, wann sie heiratet?",
              "zh": "谁在乎她何时结婚?",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie kümmert sich nicht darum, wie sie sich anzieht.",
              "zh": "她不在乎她的穿着。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du kümmerst dich ums Geldverdienen; ich kümmere mich darum, gut auszusehen.",
              "zh": "你负责赚钱养家，我负责貌美如花。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "bitten": {
      "display": "bitten",
      "prepositions": {
        "um +A": [
          "um Hilfe bitten. 请求帮助",
          "Mach bitte einen Bogen um ihn. 请远离他。",
          "Ich möchte euch um einen Gefallen bitten. 我想请你们帮个忙。",
          "Wir werden ihm helfen, wenn er uns darum bittet. 如果他问我们的话，我们就会帮他的忙。",
          "Bitte kümmern Sie sich während meiner Abwesenheit um meinen Hund! 麻烦在我离开的时候帮忙照顾我的狗。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to ask for",
          "chinese": "请求",
          "pattern": "um Hilfe bitten",
          "patternChinese": "请求帮助",
          "level": "A2",
          "examples": [
            {
              "de": "um Hilfe bitten",
              "zh": "请求帮助",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Mach bitte einen Bogen um ihn.",
              "zh": "请远离他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich möchte euch um einen Gefallen bitten.",
              "zh": "我想请你们帮个忙。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir werden ihm helfen, wenn er uns darum bittet.",
              "zh": "如果他问我们的话，我们就会帮他的忙。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Bitte kümmern Sie sich während meiner Abwesenheit um meinen Hund!",
              "zh": "麻烦在我离开的时候帮忙照顾我的狗。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich handeln": {
      "display": "sich handeln",
      "prepositions": {
        "um +A": [
          "Es handelt sich um einen Irrtum. 这是个误会",
          "Ich glaube, dass es sich um einen echten Picasso handelt. 我认为是一幅毕加索的原画。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to be a matter of",
          "chinese": "涉及，是",
          "pattern": "Es handelt sich um einen Irrtum",
          "patternChinese": "这是个误会",
          "level": "B2",
          "examples": [
            {
              "de": "Es handelt sich um einen Irrtum",
              "zh": "这是个误会",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich glaube, dass es sich um einen echten Picasso handelt.",
              "zh": "我认为是一幅毕加索的原画。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich sorgen": {
      "display": "sich sorgen",
      "prepositions": {
        "um +A": [
          "sich um die Eltern sorgen. 担心父母",
          "Sorg dich nicht um mich. 不要担心我。",
          "Ich kann für andere sorgen, weil es jemanden gibt, der sich um mich kümmert. 我能够照顾别人，正是因为有别人正照顾着我。",
          "Ich sorge mich um mein Gewicht. 我担心我的体重。",
          "Sie sorgt sich um deine Sicherheit. 她担心你的安全。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to worry about",
          "chinese": "担心",
          "pattern": "sich um die Eltern sorgen",
          "patternChinese": "担心父母",
          "level": "B2",
          "examples": [
            {
              "de": "sich um die Eltern sorgen",
              "zh": "担心父母",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sorg dich nicht um mich.",
              "zh": "不要担心我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich kann für andere sorgen, weil es jemanden gibt, der sich um mich kümmert.",
              "zh": "我能够照顾别人，正是因为有别人正照顾着我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich sorge mich um mein Gewicht.",
              "zh": "我担心我的体重。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie sorgt sich um deine Sicherheit.",
              "zh": "她担心你的安全。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich drehen": {
      "display": "sich drehen",
      "prepositions": {
        "um +A": [
          "Alles dreht sich um Geld. 一切都围着钱转",
          "Die Welt dreht sich nicht um dich. 世界不是围着你转的。",
          "Sie drehten sich um. 他们转过身。",
          "Die Erde dreht sich um die Sonne. 地球绕着太阳转。",
          "Dreh dich um, falls du sie sehen willst. 如果你想见她就回头。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to be about",
          "chinese": "围绕",
          "pattern": "Alles dreht sich um Geld",
          "patternChinese": "一切都围着钱转",
          "level": "B2",
          "examples": [
            {
              "de": "Alles dreht sich um Geld",
              "zh": "一切都围着钱转",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Die Welt dreht sich nicht um dich.",
              "zh": "世界不是围着你转的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie drehten sich um.",
              "zh": "他们转过身。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Die Erde dreht sich um die Sonne.",
              "zh": "地球绕着太阳转。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dreh dich um, falls du sie sehen willst.",
              "zh": "如果你想见她就回头。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "gehen": {
      "display": "gehen",
      "prepositions": {
        "um +A": [
          "Es geht um die Sicherheit. 事关安全",
          "Worum geht es in dem Buch? 这本书的内容是什么？",
          "Worum geht es in dem Brief? 信的内容是什么？",
          "Worum geht es in dieser Vorlesung? 那个讲座是关于什么主题的？",
          "Das ist so geheim, dass nicht mal ich weiß, worum es geht. 这太秘密了，连我都不知道它是关于什么的。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to be about",
          "chinese": "事关",
          "pattern": "Es geht um die Sicherheit",
          "patternChinese": "事关安全",
          "level": "B1",
          "examples": [
            {
              "de": "Es geht um die Sicherheit",
              "zh": "事关安全",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Worum geht es in dem Buch?",
              "zh": "这本书的内容是什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Worum geht es in dem Brief?",
              "zh": "信的内容是什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Worum geht es in dieser Vorlesung?",
              "zh": "那个讲座是关于什么主题的？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das ist so geheim, dass nicht mal ich weiß, worum es geht.",
              "zh": "这太秘密了，连我都不知道它是关于什么的。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich bemühen": {
      "display": "sich bemühen",
      "prepositions": {
        "um +A": [
          "sich um eine Lösung bemühen. 努力寻求解决办法"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to make an effort for",
          "chinese": "努力争取",
          "pattern": "sich um eine Lösung bemühen",
          "patternChinese": "努力寻求解决办法",
          "level": "B2",
          "examples": [
            {
              "de": "sich um eine Lösung bemühen",
              "zh": "努力寻求解决办法",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "beneiden": {
      "display": "beneiden",
      "prepositions": {
        "um +A": [
          "jemanden um seinen Erfolg beneiden. 羡慕某人的成功",
          "Ich beneide dich um dein derzeitiges Leben. 我很羡慕你现在的生活。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to envy for",
          "chinese": "羡慕",
          "pattern": "jemanden um seinen Erfolg beneiden",
          "patternChinese": "羡慕某人的成功",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden um seinen Erfolg beneiden",
              "zh": "羡慕某人的成功",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich beneide dich um dein derzeitiges Leben.",
              "zh": "我很羡慕你现在的生活。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "bringen": {
      "display": "bringen",
      "prepositions": {
        "um +A": [
          "jemanden um den Schlaf bringen. 让某人睡不着",
          "Ich bring dich um. 我要杀你！",
          "Bringen Sie sie um! 杀了他们",
          "Ich wünschte nur, ich hätte ein bisschen mehr Zeit, um das hier zu Ende zu bringen. 我只希望有多一点时间完成。",
          "Ich möchte in China studieren, um mein Chinesisch auf ein höheres Niveau zu bringen. 为了提高我的汉语水平，我想去中国学习。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to deprive of",
          "chinese": "使失去",
          "pattern": "jemanden um den Schlaf bringen",
          "patternChinese": "让某人睡不着",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden um den Schlaf bringen",
              "zh": "让某人睡不着",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich bring dich um.",
              "zh": "我要杀你！",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Bringen Sie sie um!",
              "zh": "杀了他们",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich wünschte nur, ich hätte ein bisschen mehr Zeit, um das hier zu Ende zu bringen.",
              "zh": "我只希望有多一点时间完成。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich möchte in China studieren, um mein Chinesisch auf ein höheres Niveau zu bringen.",
              "zh": "为了提高我的汉语水平，我想去中国学习。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "betrügen": {
      "display": "betrügen",
      "prepositions": {
        "um +A": [
          "jemanden um sein Geld betrügen. 骗某人的钱"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to cheat out of",
          "chinese": "骗取",
          "pattern": "jemanden um sein Geld betrügen",
          "patternChinese": "骗某人的钱",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden um sein Geld betrügen",
              "zh": "骗某人的钱",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich Sorgen machen": {
      "display": "sich Sorgen machen",
      "prepositions": {
        "um +A": [
          "sich Sorgen um die Prüfung machen. 为考试担心",
          "Ich mache mir Sorgen um ihn. 我担心他。",
          "Ich mache mir Sorgen um dich. 我很担心你。",
          "Warum machst du dir Sorgen um mich? 你为什么为我担忧？",
          "Mach dir möglichst keine Sorgen um mich. 尽量别担心我。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to be worried about",
          "chinese": "为…担心",
          "pattern": "sich Sorgen um die Prüfung machen",
          "patternChinese": "为考试担心",
          "level": "B1",
          "examples": [
            {
              "de": "sich Sorgen um die Prüfung machen",
              "zh": "为考试担心",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich mache mir Sorgen um ihn.",
              "zh": "我担心他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich mache mir Sorgen um dich.",
              "zh": "我很担心你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Warum machst du dir Sorgen um mich?",
              "zh": "你为什么为我担忧？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Mach dir möglichst keine Sorgen um mich.",
              "zh": "尽量别担心我。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "verstehen": {
      "display": "verstehen",
      "prepositions": {
        "unter +D": [
          "Was verstehst du unter Freiheit. 你怎么理解自由"
        ]
      },
      "prepositionOrder": [
        "unter +D"
      ],
      "entries": [
        {
          "preposition": "unter",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "unter +D",
          "english": "to understand by",
          "chinese": "把…理解为",
          "pattern": "Was verstehst du unter Freiheit",
          "patternChinese": "你怎么理解自由",
          "level": "C1",
          "examples": [
            {
              "de": "Was verstehst du unter Freiheit",
              "zh": "你怎么理解自由",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich vorstellen": {
      "display": "sich vorstellen",
      "prepositions": {
        "unter +D": [
          "Was stellst du dir unter Glück vor. 你心目中的幸福是什么"
        ]
      },
      "prepositionOrder": [
        "unter +D"
      ],
      "entries": [
        {
          "preposition": "unter",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "unter +D",
          "english": "to imagine by",
          "chinese": "对…的设想",
          "pattern": "Was stellst du dir unter Glück vor",
          "patternChinese": "你心目中的幸福是什么",
          "level": "C1",
          "examples": [
            {
              "de": "Was stellst du dir unter Glück vor",
              "zh": "你心目中的幸福是什么",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "abhängen": {
      "display": "abhängen",
      "prepositions": {
        "von +D": [
          "vom Wetter abhängen. 取决于天气",
          "Das hängt von dir ab. 取决于你",
          "Das hängt ganz von dir ab. 这都取决于你。",
          "Das hängt nicht von dir ab. 这可由不得你。",
          "Das hängt vom Zusammenhang ab. 这得看情况。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to depend on",
          "chinese": "取决于",
          "pattern": "vom Wetter abhängen",
          "patternChinese": "取决于天气",
          "level": "B1",
          "examples": [
            {
              "de": "vom Wetter abhängen",
              "zh": "取决于天气",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Das hängt von dir ab.",
              "zh": "取决于你",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das hängt ganz von dir ab.",
              "zh": "这都取决于你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das hängt nicht von dir ab.",
              "zh": "这可由不得你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das hängt vom Zusammenhang ab.",
              "zh": "这得看情况。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "träumen": {
      "display": "träumen",
      "prepositions": {
        "von +D": [
          "von einer Reise träumen. 梦想去旅行",
          "Ich träume oft von dir. 我常梦见你。",
          "Ich habe von dir geträumt. 我梦到你了。",
          "Ich werde von dir träumen. 我会梦到你的。",
          "Hast du je von mir geträumt? 你梦见过我吗？"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to dream of",
          "chinese": "梦想，梦见",
          "pattern": "von einer Reise träumen",
          "patternChinese": "梦想去旅行",
          "level": "B1",
          "examples": [
            {
              "de": "von einer Reise träumen",
              "zh": "梦想去旅行",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich träume oft von dir.",
              "zh": "我常梦见你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe von dir geträumt.",
              "zh": "我梦到你了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich werde von dir träumen.",
              "zh": "我会梦到你的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Hast du je von mir geträumt?",
              "zh": "你梦见过我吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "erzählen": {
      "display": "erzählen",
      "prepositions": {
        "von +D": [
          "von seinem Urlaub erzählen. 讲他的假期",
          "Erzählen Sie Tom davon. 告诉汤姆。",
          "Wer hat dir davon erzählt? 这件事是谁告诉你的？",
          "Erzähle niemandem von unserem Plan. 不要把我们的计划告诉任何人。",
          "Du darfst niemandem davon erzählen! 对谁都别说哟。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to tell about",
          "chinese": "讲述",
          "pattern": "von seinem Urlaub erzählen",
          "patternChinese": "讲他的假期",
          "level": "A2",
          "examples": [
            {
              "de": "von seinem Urlaub erzählen",
              "zh": "讲他的假期",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Erzählen Sie Tom davon.",
              "zh": "告诉汤姆。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wer hat dir davon erzählt?",
              "zh": "这件事是谁告诉你的？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Erzähle niemandem von unserem Plan.",
              "zh": "不要把我们的计划告诉任何人。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du darfst niemandem davon erzählen!",
              "zh": "对谁都别说哟。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich verabschieden": {
      "display": "sich verabschieden",
      "prepositions": {
        "von +D": [
          "sich von den Gästen verabschieden. 向客人告别"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to say goodbye to",
          "chinese": "向…告别",
          "pattern": "sich von den Gästen verabschieden",
          "patternChinese": "向客人告别",
          "level": "B1",
          "examples": [
            {
              "de": "sich von den Gästen verabschieden",
              "zh": "向客人告别",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "überzeugen": {
      "display": "überzeugen",
      "prepositions": {
        "von +D": [
          "jemanden von der Idee überzeugen. 说服某人接受这个想法"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to convince of",
          "chinese": "使相信",
          "pattern": "jemanden von der Idee überzeugen",
          "patternChinese": "说服某人接受这个想法",
          "level": "B2",
          "examples": [
            {
              "de": "jemanden von der Idee überzeugen",
              "zh": "说服某人接受这个想法",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich erholen": {
      "display": "sich erholen",
      "prepositions": {
        "von +D": [
          "sich von der Krankheit erholen. 病后康复",
          "Sie hatte sich wieder vom Schock über den Tod ihres Vaters erholt. 她从她父亲过世的震惊中恢复了。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to recover from",
          "chinese": "从…中恢复",
          "pattern": "sich von der Krankheit erholen",
          "patternChinese": "病后康复",
          "level": "B1",
          "examples": [
            {
              "de": "sich von der Krankheit erholen",
              "zh": "病后康复",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie hatte sich wieder vom Schock über den Tod ihres Vaters erholt.",
              "zh": "她从她父亲过世的震惊中恢复了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "profitieren": {
      "display": "profitieren",
      "prepositions": {
        "von +D": [
          "von der Erfahrung profitieren. 从经验中获益",
          "Die Versicherung profitierte von der Konjunkturerholung. 保险得利于经济的改善。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to benefit from",
          "chinese": "从中获益",
          "pattern": "von der Erfahrung profitieren",
          "patternChinese": "从经验中获益",
          "level": "B2",
          "examples": [
            {
              "de": "von der Erfahrung profitieren",
              "zh": "从经验中获益",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Die Versicherung profitierte von der Konjunkturerholung.",
              "zh": "保险得利于经济的改善。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "leben": {
      "display": "leben",
      "prepositions": {
        "von +D": [
          "von seinem Gehalt leben. 靠工资生活",
          "Sie lebt vom Schreiben. 她靠写作生活。",
          "Wir Japaner leben von Reis. 我们日本人以米饭为主食。",
          "Damals lebten wir von der Hand in den Mund. 这些日子我们勉强糊口。",
          "Er lebt weit entfernt von seiner Heimatstadt. 他住得离老家很远。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to live on",
          "chinese": "靠…生活",
          "pattern": "von seinem Gehalt leben",
          "patternChinese": "靠工资生活",
          "level": "B1",
          "examples": [
            {
              "de": "von seinem Gehalt leben",
              "zh": "靠工资生活",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie lebt vom Schreiben.",
              "zh": "她靠写作生活。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir Japaner leben von Reis.",
              "zh": "我们日本人以米饭为主食。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Damals lebten wir von der Hand in den Mund.",
              "zh": "这些日子我们勉强糊口。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er lebt weit entfernt von seiner Heimatstadt.",
              "zh": "他住得离老家很远。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "hören": {
      "display": "hören",
      "prepositions": {
        "von +D": [
          "von dem Unfall hören. 听说这起事故",
          "Hast du was von ihm gehört? 你收到他的音讯了吗?",
          "Das habe ich von ihm gehört. 我从他那听到的。",
          "Keiner hatte davon je gehört. 从没有人听说过这件事。",
          "Davon habe ich noch nie gehört. 我从没听说过这件事。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to hear about",
          "chinese": "听说",
          "pattern": "von dem Unfall hören",
          "patternChinese": "听说这起事故",
          "level": "A2",
          "examples": [
            {
              "de": "von dem Unfall hören",
              "zh": "听说这起事故",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Hast du was von ihm gehört?",
              "zh": "你收到他的音讯了吗?",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das habe ich von ihm gehört.",
              "zh": "我从他那听到的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Keiner hatte davon je gehört.",
              "zh": "从没有人听说过这件事。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Davon habe ich noch nie gehört.",
              "zh": "我从没听说过这件事。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "handeln": {
      "display": "handeln",
      "prepositions": {
        "von +D": [
          "Das Buch handelt von der Liebe. 这本书讲爱情",
          "Das Buch handelt vom Leben im Vereinten Königreich. 这本书关于生活在英国。",
          "Auf dem Schreibtisch liegt ein Buch, das vom Tanzen handelt. 桌子上有一本关于舞蹈的书。",
          "Das Buch handelt von Sternen. 这是一本关于星星的书。",
          "Dieses Buch handelt von Sternen. 这是一本关于星星的书。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to be about",
          "chinese": "内容是",
          "pattern": "Das Buch handelt von der Liebe",
          "patternChinese": "这本书讲爱情",
          "level": "B1",
          "examples": [
            {
              "de": "Das Buch handelt von der Liebe",
              "zh": "这本书讲爱情",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Das Buch handelt vom Leben im Vereinten Königreich.",
              "zh": "这本书关于生活在英国。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Auf dem Schreibtisch liegt ein Buch, das vom Tanzen handelt.",
              "zh": "桌子上有一本关于舞蹈的书。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das Buch handelt von Sternen.",
              "zh": "这是一本关于星星的书。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dieses Buch handelt von Sternen.",
              "zh": "这是一本关于星星的书。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "ausgehen": {
      "display": "ausgehen",
      "prepositions": {
        "von +D": [
          "von einem Irrtum ausgehen. 认为是个误会",
          "Wir gehen davon aus, dass Tom nicht mehr allzu lange leben wird. 我们不指望汤姆能活得更久。",
          "Sie geht von seiner Unschuld aus. 她假设他是无辜的。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to assume",
          "chinese": "以…为出发点，认为",
          "pattern": "von einem Irrtum ausgehen",
          "patternChinese": "认为是个误会",
          "level": "C1",
          "examples": [
            {
              "de": "von einem Irrtum ausgehen",
              "zh": "认为是个误会",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Wir gehen davon aus, dass Tom nicht mehr allzu lange leben wird.",
              "zh": "我们不指望汤姆能活得更久。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie geht von seiner Unschuld aus.",
              "zh": "她假设他是无辜的。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich unterscheiden": {
      "display": "sich unterscheiden",
      "prepositions": {
        "von +D": [
          "sich von anderen unterscheiden. 与众不同"
        ],
        "in +D": [
          "sich in der Größe unterscheiden. 大小不同"
        ]
      },
      "prepositionOrder": [
        "von +D",
        "in +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to differ from",
          "chinese": "与…不同",
          "pattern": "sich von anderen unterscheiden",
          "patternChinese": "与众不同",
          "level": "B2",
          "examples": [
            {
              "de": "sich von anderen unterscheiden",
              "zh": "与众不同",
              "source": "Dimenticato (authored)"
            }
          ]
        },
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to differ in",
          "chinese": "在…方面不同",
          "pattern": "sich in der Größe unterscheiden",
          "patternChinese": "大小不同",
          "level": "B2",
          "examples": [
            {
              "de": "sich in der Größe unterscheiden",
              "zh": "大小不同",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "abraten": {
      "display": "abraten",
      "prepositions": {
        "von +D": [
          "von dem Kauf abraten. 劝其别买"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to advise against",
          "chinese": "劝阻",
          "pattern": "von dem Kauf abraten",
          "patternChinese": "劝其别买",
          "level": "C1",
          "examples": [
            {
              "de": "von dem Kauf abraten",
              "zh": "劝其别买",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "absehen": {
      "display": "absehen",
      "prepositions": {
        "von +D": [
          "von einer Klage absehen. 放弃起诉"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to refrain from",
          "chinese": "放弃，不予考虑",
          "pattern": "von einer Klage absehen",
          "patternChinese": "放弃起诉",
          "level": "C1",
          "examples": [
            {
              "de": "von einer Klage absehen",
              "zh": "放弃起诉",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich distanzieren": {
      "display": "sich distanzieren",
      "prepositions": {
        "von +D": [
          "sich von der Aussage distanzieren. 与该言论划清界限"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to distance oneself from",
          "chinese": "与…划清界限",
          "pattern": "sich von der Aussage distanzieren",
          "patternChinese": "与该言论划清界限",
          "level": "C1",
          "examples": [
            {
              "de": "sich von der Aussage distanzieren",
              "zh": "与该言论划清界限",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich trennen": {
      "display": "sich trennen",
      "prepositions": {
        "von +D": [
          "sich von alten Sachen trennen. 处理掉旧东西",
          "Mein Haus ist von seinem durch einen Fluss getrennt. 我的家与他的隔着一条江。",
          "Tom hat sich von Mary getrennt. 汤姆和玛丽分手了。",
          "Was trennt Guangdong von Guangxi? 广东与广西之间隔着什么？",
          "Auch wenn ich von meinen Eltern getrennt bin, vermisse ich sie nicht. 即使离开父母，也不会思念他们。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to part with",
          "chinese": "与…分开",
          "pattern": "sich von alten Sachen trennen",
          "patternChinese": "处理掉旧东西",
          "level": "B2",
          "examples": [
            {
              "de": "sich von alten Sachen trennen",
              "zh": "处理掉旧东西",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Mein Haus ist von seinem durch einen Fluss getrennt.",
              "zh": "我的家与他的隔着一条江。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Tom hat sich von Mary getrennt.",
              "zh": "汤姆和玛丽分手了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Was trennt Guangdong von Guangxi?",
              "zh": "广东与广西之间隔着什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Auch wenn ich von meinen Eltern getrennt bin, vermisse ich sie nicht.",
              "zh": "即使离开父母，也不会思念他们。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "befreien": {
      "display": "befreien",
      "prepositions": {
        "von +D": [
          "jemanden von einer Pflicht befreien. 免除某人的义务",
          "Er befreite das Volk von seinen Ketten. 他让人们摆脱了奴役。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to free from",
          "chinese": "使摆脱",
          "pattern": "jemanden von einer Pflicht befreien",
          "patternChinese": "免除某人的义务",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden von einer Pflicht befreien",
              "zh": "免除某人的义务",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er befreite das Volk von seinen Ketten.",
              "zh": "他让人们摆脱了奴役。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "abweichen": {
      "display": "abweichen",
      "prepositions": {
        "von +D": [
          "vom Thema abweichen. 偏离主题"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to deviate from",
          "chinese": "偏离",
          "pattern": "vom Thema abweichen",
          "patternChinese": "偏离主题",
          "level": "C1",
          "examples": [
            {
              "de": "vom Thema abweichen",
              "zh": "偏离主题",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "wissen": {
      "display": "wissen",
      "prepositions": {
        "von +D": [
          "nichts von dem Plan wissen. 对计划毫不知情"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to know about",
          "chinese": "知道",
          "pattern": "nichts von dem Plan wissen",
          "patternChinese": "对计划毫不知情",
          "level": "B1",
          "examples": [
            {
              "de": "nichts von dem Plan wissen",
              "zh": "对计划毫不知情",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Angst haben": {
      "display": "Angst haben",
      "prepositions": {
        "vor +D": [
          "Angst vor dem Hund haben. 怕狗",
          "Sie haben Angst vor mir. 他们怕我。",
          "Ich habe Angst vor dem Tod. 我怕死。",
          "Ich habe vor dem Bus Angst. 我害怕公交车。",
          "Ich habe Angst vorm Sterben. 我怕死。"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to be afraid of",
          "chinese": "害怕",
          "pattern": "Angst vor dem Hund haben",
          "patternChinese": "怕狗",
          "level": "A2",
          "examples": [
            {
              "de": "Angst vor dem Hund haben",
              "zh": "怕狗",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie haben Angst vor mir.",
              "zh": "他们怕我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe Angst vor dem Tod.",
              "zh": "我怕死。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe vor dem Bus Angst.",
              "zh": "我害怕公交车。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe Angst vorm Sterben.",
              "zh": "我怕死。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich fürchten": {
      "display": "sich fürchten",
      "prepositions": {
        "vor +D": [
          "sich vor der Prüfung fürchten. 害怕考试",
          "Tom fürchtet sich vor Dir. 汤姆怕你。",
          "Er fürchtet sich vor dem Tod. 他害怕死亡。",
          "Er fürchtet sich vor dem Hund. 他怕那只狗。",
          "Er fürchtet sich vor dem Tod nicht. 他不怕死。"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to be afraid of",
          "chinese": "害怕",
          "pattern": "sich vor der Prüfung fürchten",
          "patternChinese": "害怕考试",
          "level": "B1",
          "examples": [
            {
              "de": "sich vor der Prüfung fürchten",
              "zh": "害怕考试",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Tom fürchtet sich vor Dir.",
              "zh": "汤姆怕你。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er fürchtet sich vor dem Tod.",
              "zh": "他害怕死亡。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er fürchtet sich vor dem Hund.",
              "zh": "他怕那只狗。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er fürchtet sich vor dem Tod nicht.",
              "zh": "他不怕死。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "warnen": {
      "display": "warnen",
      "prepositions": {
        "vor +D": [
          "vor dem Sturm warnen. 警告有风暴"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to warn about",
          "chinese": "警告",
          "pattern": "vor dem Sturm warnen",
          "patternChinese": "警告有风暴",
          "level": "B2",
          "examples": [
            {
              "de": "vor dem Sturm warnen",
              "zh": "警告有风暴",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "schützen": {
      "display": "schützen",
      "prepositions": {
        "vor +D": [
          "sich vor der Sonne schützen. 防晒"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to protect from",
          "chinese": "保护免受",
          "pattern": "sich vor der Sonne schützen",
          "patternChinese": "防晒",
          "level": "B1",
          "examples": [
            {
              "de": "sich vor der Sonne schützen",
              "zh": "防晒",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich verstecken": {
      "display": "sich verstecken",
      "prepositions": {
        "vor +D": [
          "sich vor dem Lehrer verstecken. 躲着老师"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to hide from",
          "chinese": "躲避",
          "pattern": "sich vor dem Lehrer verstecken",
          "patternChinese": "躲着老师",
          "level": "B1",
          "examples": [
            {
              "de": "sich vor dem Lehrer verstecken",
              "zh": "躲着老师",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "fliehen": {
      "display": "fliehen",
      "prepositions": {
        "vor +D": [
          "vor dem Krieg fliehen. 逃离战争"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to flee from",
          "chinese": "逃离",
          "pattern": "vor dem Krieg fliehen",
          "patternChinese": "逃离战争",
          "level": "B2",
          "examples": [
            {
              "de": "vor dem Krieg fliehen",
              "zh": "逃离战争",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich ekeln": {
      "display": "sich ekeln",
      "prepositions": {
        "vor +D": [
          "sich vor Spinnen ekeln. 讨厌蜘蛛"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to be disgusted by",
          "chinese": "对…厌恶",
          "pattern": "sich vor Spinnen ekeln",
          "patternChinese": "讨厌蜘蛛",
          "level": "C1",
          "examples": [
            {
              "de": "sich vor Spinnen ekeln",
              "zh": "讨厌蜘蛛",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "erschrecken": {
      "display": "erschrecken",
      "prepositions": {
        "vor +D": [
          "vor dem Hund erschrecken. 被狗吓到"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to be startled by",
          "chinese": "被…吓到",
          "pattern": "vor dem Hund erschrecken",
          "patternChinese": "被狗吓到",
          "level": "B2",
          "examples": [
            {
              "de": "vor dem Hund erschrecken",
              "zh": "被狗吓到",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich hüten": {
      "display": "sich hüten",
      "prepositions": {
        "vor +D": [
          "sich vor falschen Freunden hüten. 提防假朋友"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to beware of",
          "chinese": "提防",
          "pattern": "sich vor falschen Freunden hüten",
          "patternChinese": "提防假朋友",
          "level": "C1",
          "examples": [
            {
              "de": "sich vor falschen Freunden hüten",
              "zh": "提防假朋友",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "retten": {
      "display": "retten",
      "prepositions": {
        "vor +D": [
          "jemanden vor dem Ertrinken retten. 救人于溺水",
          "Er hat einen Jungen vor dem Ertrinken gerettet. 他救了一个溺水的男孩。",
          "Sie haben den Jungen vor dem Ertrinken gerettet. 他们救了这个落水的男孩。"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to save from",
          "chinese": "救出",
          "pattern": "jemanden vor dem Ertrinken retten",
          "patternChinese": "救人于溺水",
          "level": "B2",
          "examples": [
            {
              "de": "jemanden vor dem Ertrinken retten",
              "zh": "救人于溺水",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er hat einen Jungen vor dem Ertrinken gerettet.",
              "zh": "他救了一个溺水的男孩。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie haben den Jungen vor dem Ertrinken gerettet.",
              "zh": "他们救了这个落水的男孩。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "zittern": {
      "display": "zittern",
      "prepositions": {
        "vor +D": [
          "vor Kälte zittern. 冻得发抖"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to tremble with",
          "chinese": "因…发抖",
          "pattern": "vor Kälte zittern",
          "patternChinese": "冻得发抖",
          "level": "B2",
          "examples": [
            {
              "de": "vor Kälte zittern",
              "zh": "冻得发抖",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Respekt haben": {
      "display": "Respekt haben",
      "prepositions": {
        "vor +D": [
          "Respekt vor den Eltern haben. 尊敬父母"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to have respect for",
          "chinese": "尊敬",
          "pattern": "Respekt vor den Eltern haben",
          "patternChinese": "尊敬父母",
          "level": "B2",
          "examples": [
            {
              "de": "Respekt vor den Eltern haben",
              "zh": "尊敬父母",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "gehören": {
      "display": "gehören",
      "prepositions": {
        "zu +D": [
          "zur Familie gehören. 属于这个家",
          "Ich gehöre zum Segelklub. 我参加帆船社。",
          "Ich gehöre zum Tennisclub. 我是网球俱乐部的会员。",
          "Veränderung gehört zum Leben dazu. 变化是人生固有的一部分。",
          "Island gehörte zu Dänemark. 冰岛曾属于丹麦。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to belong to",
          "chinese": "属于",
          "pattern": "zur Familie gehören",
          "patternChinese": "属于这个家",
          "level": "A2",
          "examples": [
            {
              "de": "zur Familie gehören",
              "zh": "属于这个家",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich gehöre zum Segelklub.",
              "zh": "我参加帆船社。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich gehöre zum Tennisclub.",
              "zh": "我是网球俱乐部的会员。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Veränderung gehört zum Leben dazu.",
              "zh": "变化是人生固有的一部分。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Island gehörte zu Dänemark.",
              "zh": "冰岛曾属于丹麦。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "führen": {
      "display": "führen",
      "prepositions": {
        "zu +D": [
          "zu Problemen führen. 导致问题",
          "Seine Mühen führten nicht zum Erfolg. 他的努力没有成果。",
          "Seine Mühen führten zu keinem Ergebnis. 他的努力没有成果。",
          "Egal welche Straße, alle führen zum Park. 哪条路都可以去公园哦。",
          "Maßloser Stolz führt zu keinem guten Ende. 骄傲使人落后。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to lead to",
          "chinese": "导致",
          "pattern": "zu Problemen führen",
          "patternChinese": "导致问题",
          "level": "B1",
          "examples": [
            {
              "de": "zu Problemen führen",
              "zh": "导致问题",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Seine Mühen führten nicht zum Erfolg.",
              "zh": "他的努力没有成果。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Seine Mühen führten zu keinem Ergebnis.",
              "zh": "他的努力没有成果。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Egal welche Straße, alle führen zum Park.",
              "zh": "哪条路都可以去公园哦。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Maßloser Stolz führt zu keinem guten Ende.",
              "zh": "骄傲使人落后。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "passen": {
      "display": "passen",
      "prepositions": {
        "zu +D": [
          "Die Jacke passt zu der Hose. 上衣和裤子很配",
          "Der Schlips passt gut zu deinem Hemd. 这条领带很配你的衣服。",
          "Der rote Hut passt gut zu ihrem Kleid. 这顶红帽子很衬她的裙子。",
          "Ihre blauen Schuhe passen gut zu diesem Kleid. 她那双蓝鞋子和这个裙子很搭配。",
          "Ich habe ein Auto gefunden, das zu meinem Alter passt. 我找到了一辆适合我这个年龄的汽车!"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to go with",
          "chinese": "与…相配",
          "pattern": "Die Jacke passt zu der Hose",
          "patternChinese": "上衣和裤子很配",
          "level": "A2",
          "examples": [
            {
              "de": "Die Jacke passt zu der Hose",
              "zh": "上衣和裤子很配",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Der Schlips passt gut zu deinem Hemd.",
              "zh": "这条领带很配你的衣服。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Der rote Hut passt gut zu ihrem Kleid.",
              "zh": "这顶红帽子很衬她的裙子。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ihre blauen Schuhe passen gut zu diesem Kleid.",
              "zh": "她那双蓝鞋子和这个裙子很搭配。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich habe ein Auto gefunden, das zu meinem Alter passt.",
              "zh": "我找到了一辆适合我这个年龄的汽车!",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "gratulieren": {
      "display": "gratulieren",
      "prepositions": {
        "zu +D": [
          "zum Geburtstag gratulieren. 祝贺生日",
          "Ich gratuliere zu eurer Verlobung. 我为你的订婚祝贺。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to congratulate on",
          "chinese": "祝贺",
          "pattern": "zum Geburtstag gratulieren",
          "patternChinese": "祝贺生日",
          "level": "A2",
          "examples": [
            {
              "de": "zum Geburtstag gratulieren",
              "zh": "祝贺生日",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich gratuliere zu eurer Verlobung.",
              "zh": "我为你的订婚祝贺。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "einladen": {
      "display": "einladen",
      "prepositions": {
        "zu +D": [
          "zum Essen einladen. 请吃饭",
          "Sie laden mich zum Kartenspielen ein. 他们邀请我去玩牌。",
          "Lade uns zum Abendessen ins Restaurant ein. 请我们去饭店吃晚饭。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to invite to",
          "chinese": "邀请参加",
          "pattern": "zum Essen einladen",
          "patternChinese": "请吃饭",
          "level": "A2",
          "examples": [
            {
              "de": "zum Essen einladen",
              "zh": "请吃饭",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie laden mich zum Kartenspielen ein.",
              "zh": "他们邀请我去玩牌。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Lade uns zum Abendessen ins Restaurant ein.",
              "zh": "请我们去饭店吃晚饭。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich entschließen": {
      "display": "sich entschließen",
      "prepositions": {
        "zu +D": [
          "sich zu einem Umzug entschließen. 决定搬家"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to decide on",
          "chinese": "决心",
          "pattern": "sich zu einem Umzug entschließen",
          "patternChinese": "决定搬家",
          "level": "B2",
          "examples": [
            {
              "de": "sich zu einem Umzug entschließen",
              "zh": "决定搬家",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "beitragen": {
      "display": "beitragen",
      "prepositions": {
        "zu +D": [
          "zum Erfolg beitragen. 为成功做贡献",
          "Das Eis war dick genug, um mich beim Gehen zu tragen. 冰厚得足以让我在上面走路。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to contribute to",
          "chinese": "对…有贡献",
          "pattern": "zum Erfolg beitragen",
          "patternChinese": "为成功做贡献",
          "level": "B2",
          "examples": [
            {
              "de": "zum Erfolg beitragen",
              "zh": "为成功做贡献",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Das Eis war dick genug, um mich beim Gehen zu tragen.",
              "zh": "冰厚得足以让我在上面走路。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "zwingen": {
      "display": "zwingen",
      "prepositions": {
        "zu +D": [
          "jemanden zum Verkauf zwingen. 迫使某人卖掉",
          "Niemand zwingt dich dazu. 没人在强迫你这么做。",
          "Wir können die Leute nicht dazu zwingen. 我们不能强迫人去做。",
          "Unlautere Mittel führen zwingend zu unlauteren Zielen. 手段的不纯洁，必然导致目的的不纯洁。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to force to",
          "chinese": "迫使",
          "pattern": "jemanden zum Verkauf zwingen",
          "patternChinese": "迫使某人卖掉",
          "level": "B2",
          "examples": [
            {
              "de": "jemanden zum Verkauf zwingen",
              "zh": "迫使某人卖掉",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Niemand zwingt dich dazu.",
              "zh": "没人在强迫你这么做。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir können die Leute nicht dazu zwingen.",
              "zh": "我们不能强迫人去做。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Unlautere Mittel führen zwingend zu unlauteren Zielen.",
              "zh": "手段的不纯洁，必然导致目的的不纯洁。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "überreden": {
      "display": "überreden",
      "prepositions": {
        "zu +D": [
          "jemanden zum Mitkommen überreden. 说服某人一起来",
          "Mit Tom über Anime zu reden, macht am meisten Spaß. 和汤姆谈论动漫话题的时候最开心。",
          "Du hast nichts davon, schlecht über andere zu reden. 通过诋毁别人，你得不到什么。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to persuade to",
          "chinese": "说服做",
          "pattern": "jemanden zum Mitkommen überreden",
          "patternChinese": "说服某人一起来",
          "level": "B2",
          "examples": [
            {
              "de": "jemanden zum Mitkommen überreden",
              "zh": "说服某人一起来",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Mit Tom über Anime zu reden, macht am meisten Spaß.",
              "zh": "和汤姆谈论动漫话题的时候最开心。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Du hast nichts davon, schlecht über andere zu reden.",
              "zh": "通过诋毁别人，你得不到什么。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "dienen": {
      "display": "dienen",
      "prepositions": {
        "zu +D": [
          "Das dient zur Sicherheit. 这是为了安全",
          "Eine Pfanne dient zum Braten. 锅是用来炒的。",
          "Diese Werkzeuge dienen zum Häuserbau. 这些工具是用来造房子的。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to serve for",
          "chinese": "用于",
          "pattern": "Das dient zur Sicherheit",
          "patternChinese": "这是为了安全",
          "level": "B2",
          "examples": [
            {
              "de": "Das dient zur Sicherheit",
              "zh": "这是为了安全",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Eine Pfanne dient zum Braten.",
              "zh": "锅是用来炒的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Diese Werkzeuge dienen zum Häuserbau.",
              "zh": "这些工具是用来造房子的。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "neigen": {
      "display": "neigen",
      "prepositions": {
        "zu +D": [
          "zu Übertreibungen neigen. 爱夸张",
          "Du neigst dazu, Dinge zu vergessen. 你很健忘。",
          "Tschetschenen neigen zur Unabhängigkeit. 车臣人倾向独立。",
          "Junge Menschen neigen dazu, Dinge zu weit zu treiben. 青年人总爱挑战极端。",
          "Menschen, die die Geschichte ignorieren, neigen dazu ihre Fehler zu wiederholen. 无视历史的人往往会重蹈覆辙。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to tend to",
          "chinese": "倾向于",
          "pattern": "zu Übertreibungen neigen",
          "patternChinese": "爱夸张",
          "level": "C1",
          "examples": [
            {
              "de": "zu Übertreibungen neigen",
              "zh": "爱夸张",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Du neigst dazu, Dinge zu vergessen.",
              "zh": "你很健忘。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Tschetschenen neigen zur Unabhängigkeit.",
              "zh": "车臣人倾向独立。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Junge Menschen neigen dazu, Dinge zu weit zu treiben.",
              "zh": "青年人总爱挑战极端。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Menschen, die die Geschichte ignorieren, neigen dazu ihre Fehler zu wiederholen.",
              "zh": "无视历史的人往往会重蹈覆辙。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich äußern": {
      "display": "sich äußern",
      "prepositions": {
        "zu +D": [
          "sich zu dem Vorfall äußern. 就此事发表看法",
          "Nichts Süßes essen zu dürfen ist äußerst qualvoll. 不能吃甜食是极其痛苦的事情。"
        ],
        "über +A": [
          "sich über den Vorfall äußern. 评论此事"
        ]
      },
      "prepositionOrder": [
        "zu +D",
        "über +A"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to comment on",
          "chinese": "就…发表意见",
          "pattern": "sich zu dem Vorfall äußern",
          "patternChinese": "就此事发表看法",
          "level": "C1",
          "examples": [
            {
              "de": "sich zu dem Vorfall äußern",
              "zh": "就此事发表看法",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Nichts Süßes essen zu dürfen ist äußerst qualvoll.",
              "zh": "不能吃甜食是极其痛苦的事情。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to comment on",
          "chinese": "评论",
          "pattern": "sich über den Vorfall äußern",
          "patternChinese": "评论此事",
          "level": "C1",
          "examples": [
            {
              "de": "sich über den Vorfall äußern",
              "zh": "评论此事",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "auffordern": {
      "display": "auffordern",
      "prepositions": {
        "zu +D": [
          "jemanden zur Mitarbeit auffordern. 要求某人合作"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to call on to",
          "chinese": "要求",
          "pattern": "jemanden zur Mitarbeit auffordern",
          "patternChinese": "要求某人合作",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden zur Mitarbeit auffordern",
              "zh": "要求某人合作",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verurteilen": {
      "display": "verurteilen",
      "prepositions": {
        "zu +D": [
          "zu einer Geldstrafe verurteilen. 判处罚金",
          "Der Angeklagte wurde zum Tode verurteilt. 被告被判处了死刑。",
          "Der Richter verurteilte ihn zu einem Jahr Gefängnis. 法官判了他一年有期徒刑。",
          "Der Richter hat ihn zu einem Jahr Gefängnis verurteilt. 法官判了他一年有期徒刑。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to sentence to",
          "chinese": "判处",
          "pattern": "zu einer Geldstrafe verurteilen",
          "patternChinese": "判处罚金",
          "level": "C1",
          "examples": [
            {
              "de": "zu einer Geldstrafe verurteilen",
              "zh": "判处罚金",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Der Angeklagte wurde zum Tode verurteilt.",
              "zh": "被告被判处了死刑。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Der Richter verurteilte ihn zu einem Jahr Gefängnis.",
              "zh": "法官判了他一年有期徒刑。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Der Richter hat ihn zu einem Jahr Gefängnis verurteilt.",
              "zh": "法官判了他一年有期徒刑。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "raten": {
      "display": "raten",
      "prepositions": {
        "zu +D": [
          "zu einer Pause raten. 建议休息一下",
          "Was raten Sie mir zu tun? 您建议我做什么？",
          "Ich rate dir, das nicht zu essen. 我劝告你别吃那个。",
          "Es ist nicht seine Art, derart in Wut zu geraten. 这么生气不像他。",
          "Unsere Musiklehrerin hat mir geraten, Wien zu besuchen. 我们的音乐老师建议我去游览维也纳。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to advise to",
          "chinese": "建议",
          "pattern": "zu einer Pause raten",
          "patternChinese": "建议休息一下",
          "level": "B2",
          "examples": [
            {
              "de": "zu einer Pause raten",
              "zh": "建议休息一下",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Was raten Sie mir zu tun?",
              "zh": "您建议我做什么？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich rate dir, das nicht zu essen.",
              "zh": "我劝告你别吃那个。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Es ist nicht seine Art, derart in Wut zu geraten.",
              "zh": "这么生气不像他。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Unsere Musiklehrerin hat mir geraten, Wien zu besuchen.",
              "zh": "我们的音乐老师建议我去游览维也纳。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "werden": {
      "display": "werden",
      "prepositions": {
        "zu +D": [
          "Das Wasser wird zu Eis. 水变成冰",
          "Ich werde morgen nicht zur Schule gehen. 我明天不会去学校。",
          "Wir werden uns zum Abendessen verspäten. 我们的晚饭要晚点吃了。",
          "Ich werde bis zum letzten Atemzug kämpfen. 我会战斗到最后一口气。",
          "Jede beliebige Pflicht kann zur Qual werden. 任何任务都可能变得费力。"
        ],
        "aus +D": [
          "Was ist aus ihm geworden. 他后来怎么样了",
          "Er muss aus dem Amt entfernt werden. 他必须被免职。",
          "Ich werde aus ihr nicht schlau. 我真读不懂她。",
          "Sie werden bald aus Hongkong eintreffen. 他们就快从香港抵达了。",
          "Das Meer kann von hier aus gehört werden. 我们从这里可以听到海的声音。"
        ]
      },
      "prepositionOrder": [
        "zu +D",
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to turn into",
          "chinese": "变成",
          "pattern": "Das Wasser wird zu Eis",
          "patternChinese": "水变成冰",
          "level": "B1",
          "examples": [
            {
              "de": "Das Wasser wird zu Eis",
              "zh": "水变成冰",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich werde morgen nicht zur Schule gehen.",
              "zh": "我明天不会去学校。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir werden uns zum Abendessen verspäten.",
              "zh": "我们的晚饭要晚点吃了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich werde bis zum letzten Atemzug kämpfen.",
              "zh": "我会战斗到最后一口气。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Jede beliebige Pflicht kann zur Qual werden.",
              "zh": "任何任务都可能变得费力。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        },
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to become of",
          "chinese": "…后来如何",
          "pattern": "Was ist aus ihm geworden",
          "patternChinese": "他后来怎么样了",
          "level": "B1",
          "examples": [
            {
              "de": "Was ist aus ihm geworden",
              "zh": "他后来怎么样了",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er muss aus dem Amt entfernt werden.",
              "zh": "他必须被免职。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich werde aus ihr nicht schlau.",
              "zh": "我真读不懂她。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie werden bald aus Hongkong eintreffen.",
              "zh": "他们就快从香港抵达了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Das Meer kann von hier aus gehört werden.",
              "zh": "我们从这里可以听到海的声音。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "wählen": {
      "display": "wählen",
      "prepositions": {
        "zu +D": [
          "jemanden zum Vorsitzenden wählen. 选某人为主席",
          "Er wurde zum Bürgermeister gewählt. 他被选为市长。",
          "Mike wurde zum Vorsitzenden gewählt. 迈克当选为主席。",
          "Sie haben sie zur Präsidentin gewählt. 他们选她为总统。",
          "Er ist zum Präsidenten gewählt worden. 他被选为总统。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to elect as",
          "chinese": "选为",
          "pattern": "jemanden zum Vorsitzenden wählen",
          "patternChinese": "选某人为主席",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden zum Vorsitzenden wählen",
              "zh": "选某人为主席",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er wurde zum Bürgermeister gewählt.",
              "zh": "他被选为市长。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Mike wurde zum Vorsitzenden gewählt.",
              "zh": "迈克当选为主席。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie haben sie zur Präsidentin gewählt.",
              "zh": "他们选她为总统。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er ist zum Präsidenten gewählt worden.",
              "zh": "他被选为总统。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "ernennen": {
      "display": "ernennen",
      "prepositions": {
        "zu +D": [
          "jemanden zum Direktor ernennen. 任命某人为主任",
          "Der Vorstand beschloss einstimmig, sie zur Generaldirektorin zu ernennen. 董事会一致决定任命她为执行总裁。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to appoint as",
          "chinese": "任命为",
          "pattern": "jemanden zum Direktor ernennen",
          "patternChinese": "任命某人为主任",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden zum Direktor ernennen",
              "zh": "任命某人为主任",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Der Vorstand beschloss einstimmig, sie zur Generaldirektorin zu ernennen.",
              "zh": "董事会一致决定任命她为执行总裁。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "Stellung nehmen": {
      "display": "Stellung nehmen",
      "prepositions": {
        "zu +D": [
          "zu dem Vorwurf Stellung nehmen. 就指责表态"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to take a position on",
          "chinese": "就…表态",
          "pattern": "zu dem Vorwurf Stellung nehmen",
          "patternChinese": "就指责表态",
          "level": "C1",
          "examples": [
            {
              "de": "zu dem Vorwurf Stellung nehmen",
              "zh": "就指责表态",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "kommen": {
      "display": "kommen",
      "prepositions": {
        "zu +D": [
          "zu einem Ergebnis kommen. 得出结果",
          "Komm zu mir um elf Uhr. 十一点钟来看我。",
          "Komm zu mir nach Hause! 到我家来吧。",
          "Kann ich zu dir kommen? 我能去你那吗？",
          "Er wird zum Fest kommen. 他会来参加派对。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to arrive at (a result)",
          "chinese": "得出",
          "pattern": "zu einem Ergebnis kommen",
          "patternChinese": "得出结果",
          "level": "B2",
          "examples": [
            {
              "de": "zu einem Ergebnis kommen",
              "zh": "得出结果",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Komm zu mir um elf Uhr.",
              "zh": "十一点钟来看我。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Komm zu mir nach Hause!",
              "zh": "到我家来吧。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Kann ich zu dir kommen?",
              "zh": "我能去你那吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er wird zum Fest kommen.",
              "zh": "他会来参加派对。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich entwickeln": {
      "display": "sich entwickeln",
      "prepositions": {
        "zu +D": [
          "sich zu einem Problem entwickeln. 发展成一个问题",
          "Die Stadt entwickelte sich zum wirtschaftlichen Zentrum. 这座城镇发展成为了一个经济中心。",
          "China entwickelt sich zu schnell. 中国发展得太快了。",
          "Ihr kleiner Protest entwickelte sich zu einer Massendemonstration. 他们小型的示威引发了一场大规模的游行。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to develop into",
          "chinese": "发展成",
          "pattern": "sich zu einem Problem entwickeln",
          "patternChinese": "发展成一个问题",
          "level": "B2",
          "examples": [
            {
              "de": "sich zu einem Problem entwickeln",
              "zh": "发展成一个问题",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Die Stadt entwickelte sich zum wirtschaftlichen Zentrum.",
              "zh": "这座城镇发展成为了一个经济中心。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "China entwickelt sich zu schnell.",
              "zh": "中国发展得太快了。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ihr kleiner Protest entwickelte sich zu einer Massendemonstration.",
              "zh": "他们小型的示威引发了一场大规模的游行。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "zählen": {
      "display": "zählen",
      "prepositions": {
        "zu +D": [
          "zu den Besten zählen. 属于最好的之列",
          "Tom schloss die Augen und begann Schafe zu zählen. 汤姆闭上了眼睛开始数羊。",
          "Er zählt zu den größten Wissenschaftlern weltweit. 他是世界上最伟大的科学家之一。",
          "Er wird zu den größten Wissenschaftlern der Welt gezählt. 他是世界上最伟大的科学家之一。",
          "Deutsch, Englisch und Niederländisch zählen zu den westgermanischen Sprachen. 德语，英语，荷兰语共属西日耳曼语支。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to be among",
          "chinese": "属于…之列",
          "pattern": "zu den Besten zählen",
          "patternChinese": "属于最好的之列",
          "level": "B2",
          "examples": [
            {
              "de": "zu den Besten zählen",
              "zh": "属于最好的之列",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Tom schloss die Augen und begann Schafe zu zählen.",
              "zh": "汤姆闭上了眼睛开始数羊。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er zählt zu den größten Wissenschaftlern weltweit.",
              "zh": "他是世界上最伟大的科学家之一。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Er wird zu den größten Wissenschaftlern der Welt gezählt.",
              "zh": "他是世界上最伟大的科学家之一。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Deutsch, Englisch und Niederländisch zählen zu den westgermanischen Sprachen.",
              "zh": "德语，英语，荷兰语共属西日耳曼语支。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich bekennen": {
      "display": "sich bekennen",
      "prepositions": {
        "zu +D": [
          "sich zu seinem Fehler bekennen. 公开承认错误"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to profess",
          "chinese": "公开承认",
          "pattern": "sich zu seinem Fehler bekennen",
          "patternChinese": "公开承认错误",
          "level": "C1",
          "examples": [
            {
              "de": "sich zu seinem Fehler bekennen",
              "zh": "公开承认错误",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich machen": {
      "display": "sich machen",
      "prepositions": {
        "an +A": [
          "sich an die Arbeit machen. 着手工作"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to set about",
          "chinese": "着手做",
          "pattern": "sich an die Arbeit machen",
          "patternChinese": "着手工作",
          "level": "B2",
          "examples": [
            {
              "de": "sich an die Arbeit machen",
              "zh": "着手工作",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "vermieten": {
      "display": "vermieten",
      "prepositions": {
        "an +A": [
          "die Wohnung an Studenten vermieten. 把房子租给学生"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to rent out to",
          "chinese": "出租给",
          "pattern": "die Wohnung an Studenten vermieten",
          "patternChinese": "把房子租给学生",
          "level": "B2",
          "examples": [
            {
              "de": "die Wohnung an Studenten vermieten",
              "zh": "把房子租给学生",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "adressieren": {
      "display": "adressieren",
      "prepositions": {
        "an +A": [
          "den Brief an die Firma adressieren. 把信寄到公司",
          "Dieser Brief ist an dich adressiert. 这封信是寄给你。"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to address to",
          "chinese": "寄给",
          "pattern": "den Brief an die Firma adressieren",
          "patternChinese": "把信寄到公司",
          "level": "B2",
          "examples": [
            {
              "de": "den Brief an die Firma adressieren",
              "zh": "把信寄到公司",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Dieser Brief ist an dich adressiert.",
              "zh": "这封信是寄给你。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "weiterleiten": {
      "display": "weiterleiten",
      "prepositions": {
        "an +A": [
          "die Mail an den Kollegen weiterleiten. 把邮件转给同事"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to forward to",
          "chinese": "转发给",
          "pattern": "die Mail an den Kollegen weiterleiten",
          "patternChinese": "把邮件转给同事",
          "level": "B2",
          "examples": [
            {
              "de": "die Mail an den Kollegen weiterleiten",
              "zh": "把邮件转给同事",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "übergeben": {
      "display": "übergeben",
      "prepositions": {
        "an +A": [
          "die Arbeit an den Nachfolger übergeben. 把工作移交给接任者"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to hand over to",
          "chinese": "移交给",
          "pattern": "die Arbeit an den Nachfolger übergeben",
          "patternChinese": "把工作移交给接任者",
          "level": "C1",
          "examples": [
            {
              "de": "die Arbeit an den Nachfolger übergeben",
              "zh": "把工作移交给接任者",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "anknüpfen": {
      "display": "anknüpfen",
      "prepositions": {
        "an +A": [
          "an die Tradition anknüpfen. 承接传统"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to build on",
          "chinese": "承接，联系",
          "pattern": "an die Tradition anknüpfen",
          "patternChinese": "承接传统",
          "level": "C1",
          "examples": [
            {
              "de": "an die Tradition anknüpfen",
              "zh": "承接传统",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich halten": {
      "display": "sich halten",
      "prepositions": {
        "an +A": [
          "sich an die Regeln halten. 遵守规则"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to abide by",
          "chinese": "遵守",
          "pattern": "sich an die Regeln halten",
          "patternChinese": "遵守规则",
          "level": "B2",
          "examples": [
            {
              "de": "sich an die Regeln halten",
              "zh": "遵守规则",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "gewöhnt sein": {
      "display": "gewöhnt sein",
      "prepositions": {
        "an +A": [
          "an das Klima gewöhnt sein. 习惯这种气候"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to be used to",
          "chinese": "习惯于",
          "pattern": "an das Klima gewöhnt sein",
          "patternChinese": "习惯这种气候",
          "level": "B2",
          "examples": [
            {
              "de": "an das Klima gewöhnt sein",
              "zh": "习惯这种气候",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "senden": {
      "display": "senden",
      "prepositions": {
        "an +A": [
          "eine Nachricht an alle senden. 把消息发给所有人"
        ]
      },
      "prepositionOrder": [
        "an +A"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "an +A",
          "english": "to send to",
          "chinese": "发送给",
          "pattern": "eine Nachricht an alle senden",
          "patternChinese": "把消息发给所有人",
          "level": "B1",
          "examples": [
            {
              "de": "eine Nachricht an alle senden",
              "zh": "把消息发给所有人",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "abnehmen": {
      "display": "abnehmen",
      "prepositions": {
        "an +D": [
          "an Gewicht abnehmen. 体重减轻"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to decrease in",
          "chinese": "在…方面减少",
          "pattern": "an Gewicht abnehmen",
          "patternChinese": "体重减轻",
          "level": "B2",
          "examples": [
            {
              "de": "an Gewicht abnehmen",
              "zh": "体重减轻",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "teilhaben": {
      "display": "teilhaben",
      "prepositions": {
        "an +D": [
          "am Erfolg teilhaben. 分享成功"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to share in",
          "chinese": "分享，参与",
          "pattern": "am Erfolg teilhaben",
          "patternChinese": "分享成功",
          "level": "C1",
          "examples": [
            {
              "de": "am Erfolg teilhaben",
              "zh": "分享成功",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "scheitern": {
      "display": "scheitern",
      "prepositions": {
        "an +D": [
          "an den Kosten scheitern. 因费用而告吹"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to fail because of",
          "chinese": "因…而失败",
          "pattern": "an den Kosten scheitern",
          "patternChinese": "因费用而告吹",
          "level": "B2",
          "examples": [
            {
              "de": "an den Kosten scheitern",
              "zh": "因费用而告吹",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verzweifeln": {
      "display": "verzweifeln",
      "prepositions": {
        "an +D": [
          "an sich selbst verzweifeln. 对自己绝望"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to despair of",
          "chinese": "对…绝望",
          "pattern": "an sich selbst verzweifeln",
          "patternChinese": "对自己绝望",
          "level": "C1",
          "examples": [
            {
              "de": "an sich selbst verzweifeln",
              "zh": "对自己绝望",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "festhalten": {
      "display": "festhalten",
      "prepositions": {
        "an +D": [
          "an dem Plan festhalten. 坚持原计划",
          "Halt dich am Seil fest! 抓住绳子。"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to stick to",
          "chinese": "坚持",
          "pattern": "an dem Plan festhalten",
          "patternChinese": "坚持原计划",
          "level": "B2",
          "examples": [
            {
              "de": "an dem Plan festhalten",
              "zh": "坚持原计划",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Halt dich am Seil fest!",
              "zh": "抓住绳子。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich messen": {
      "display": "sich messen",
      "prepositions": {
        "an +D": [
          "sich an den Besten messen. 向最优秀者看齐"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to measure oneself against",
          "chinese": "以…为标杆",
          "pattern": "sich an den Besten messen",
          "patternChinese": "向最优秀者看齐",
          "level": "C1",
          "examples": [
            {
              "de": "sich an den Besten messen",
              "zh": "向最优秀者看齐",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "erkranken": {
      "display": "erkranken",
      "prepositions": {
        "an +D": [
          "an Grippe erkranken. 患上流感"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to fall ill with",
          "chinese": "患上",
          "pattern": "an Grippe erkranken",
          "patternChinese": "患上流感",
          "level": "C1",
          "examples": [
            {
              "de": "an Grippe erkranken",
              "zh": "患上流感",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Freude haben": {
      "display": "Freude haben",
      "prepositions": {
        "an +D": [
          "Freude an der Arbeit haben. 喜欢这份工作"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to take pleasure in",
          "chinese": "以…为乐",
          "pattern": "Freude an der Arbeit haben",
          "patternChinese": "喜欢这份工作",
          "level": "B1",
          "examples": [
            {
              "de": "Freude an der Arbeit haben",
              "zh": "喜欢这份工作",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Interesse haben": {
      "display": "Interesse haben",
      "prepositions": {
        "an +D": [
          "Interesse an Musik haben. 对音乐感兴趣"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be interested in",
          "chinese": "对…有兴趣",
          "pattern": "Interesse an Musik haben",
          "patternChinese": "对音乐感兴趣",
          "level": "B1",
          "examples": [
            {
              "de": "Interesse an Musik haben",
              "zh": "对音乐感兴趣",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Spaß haben": {
      "display": "Spaß haben",
      "prepositions": {
        "an +D": [
          "Spaß am Spiel haben. 玩得开心"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to have fun with",
          "chinese": "觉得…有意思",
          "pattern": "Spaß am Spiel haben",
          "patternChinese": "玩得开心",
          "level": "A2",
          "examples": [
            {
              "de": "Spaß am Spiel haben",
              "zh": "玩得开心",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "interessiert sein": {
      "display": "interessiert sein",
      "prepositions": {
        "an +D": [
          "an einer Zusammenarbeit interessiert sein. 有意合作"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be interested in",
          "chinese": "对…感兴趣",
          "pattern": "an einer Zusammenarbeit interessiert sein",
          "patternChinese": "有意合作",
          "level": "B2",
          "examples": [
            {
              "de": "an einer Zusammenarbeit interessiert sein",
              "zh": "有意合作",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "beteiligt sein": {
      "display": "beteiligt sein",
      "prepositions": {
        "an +D": [
          "an dem Projekt beteiligt sein. 参与该项目"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be involved in",
          "chinese": "参与其中",
          "pattern": "an dem Projekt beteiligt sein",
          "patternChinese": "参与该项目",
          "level": "B2",
          "examples": [
            {
              "de": "an dem Projekt beteiligt sein",
              "zh": "参与该项目",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "reich sein": {
      "display": "reich sein",
      "prepositions": {
        "an +D": [
          "an Vitaminen reich sein. 富含维生素"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be rich in",
          "chinese": "富含",
          "pattern": "an Vitaminen reich sein",
          "patternChinese": "富含维生素",
          "level": "B2",
          "examples": [
            {
              "de": "an Vitaminen reich sein",
              "zh": "富含维生素",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "arm sein": {
      "display": "arm sein",
      "prepositions": {
        "an +D": [
          "an Rohstoffen arm sein. 缺乏原料"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be poor in",
          "chinese": "缺乏",
          "pattern": "an Rohstoffen arm sein",
          "patternChinese": "缺乏原料",
          "level": "C1",
          "examples": [
            {
              "de": "an Rohstoffen arm sein",
              "zh": "缺乏原料",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "schuld sein": {
      "display": "schuld sein",
      "prepositions": {
        "an +D": [
          "an dem Unfall schuld sein. 对事故负有责任"
        ]
      },
      "prepositionOrder": [
        "an +D"
      ],
      "entries": [
        {
          "preposition": "an",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "an +D",
          "english": "to be to blame for",
          "chinese": "对…有责任",
          "pattern": "an dem Unfall schuld sein",
          "patternChinese": "对事故负有责任",
          "level": "B2",
          "examples": [
            {
              "de": "an dem Unfall schuld sein",
              "zh": "对事故负有责任",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "stolz sein": {
      "display": "stolz sein",
      "prepositions": {
        "auf +A": [
          "auf die Kinder stolz sein. 为孩子骄傲"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to be proud of",
          "chinese": "为…自豪",
          "pattern": "auf die Kinder stolz sein",
          "patternChinese": "为孩子骄傲",
          "level": "A2",
          "examples": [
            {
              "de": "auf die Kinder stolz sein",
              "zh": "为孩子骄傲",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "neugierig sein": {
      "display": "neugierig sein",
      "prepositions": {
        "auf +A": [
          "auf das Ergebnis neugierig sein. 对结果好奇"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to be curious about",
          "chinese": "好奇",
          "pattern": "auf das Ergebnis neugierig sein",
          "patternChinese": "对结果好奇",
          "level": "B1",
          "examples": [
            {
              "de": "auf das Ergebnis neugierig sein",
              "zh": "对结果好奇",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "böse sein": {
      "display": "böse sein",
      "prepositions": {
        "auf +A": [
          "auf den Freund böse sein. 生朋友的气"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to be angry with",
          "chinese": "生…的气",
          "pattern": "auf den Freund böse sein",
          "patternChinese": "生朋友的气",
          "level": "B1",
          "examples": [
            {
              "de": "auf den Freund böse sein",
              "zh": "生朋友的气",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "gespannt sein": {
      "display": "gespannt sein",
      "prepositions": {
        "auf +A": [
          "auf den Film gespannt sein. 期待这部电影"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to be eager for",
          "chinese": "期待",
          "pattern": "auf den Film gespannt sein",
          "patternChinese": "期待这部电影",
          "level": "B2",
          "examples": [
            {
              "de": "auf den Film gespannt sein",
              "zh": "期待这部电影",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "eifersüchtig sein": {
      "display": "eifersüchtig sein",
      "prepositions": {
        "auf +A": [
          "auf den Kollegen eifersüchtig sein. 嫉妒同事"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to be jealous of",
          "chinese": "嫉妒",
          "pattern": "auf den Kollegen eifersüchtig sein",
          "patternChinese": "嫉妒同事",
          "level": "B2",
          "examples": [
            {
              "de": "auf den Kollegen eifersüchtig sein",
              "zh": "嫉妒同事",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Lust haben": {
      "display": "Lust haben",
      "prepositions": {
        "auf +A": [
          "Lust auf Kaffee haben. 想喝咖啡"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to fancy sth",
          "chinese": "想要",
          "pattern": "Lust auf Kaffee haben",
          "patternChinese": "想喝咖啡",
          "level": "A2",
          "examples": [
            {
              "de": "Lust auf Kaffee haben",
              "zh": "想喝咖啡",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Appetit haben": {
      "display": "Appetit haben",
      "prepositions": {
        "auf +A": [
          "Appetit auf Kuchen haben. 想吃蛋糕"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to have an appetite for",
          "chinese": "想吃",
          "pattern": "Appetit auf Kuchen haben",
          "patternChinese": "想吃蛋糕",
          "level": "B1",
          "examples": [
            {
              "de": "Appetit auf Kuchen haben",
              "zh": "想吃蛋糕",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Anspruch haben": {
      "display": "Anspruch haben",
      "prepositions": {
        "auf +A": [
          "Anspruch auf Urlaub haben. 有权休假"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to be entitled to",
          "chinese": "有权享有",
          "pattern": "Anspruch auf Urlaub haben",
          "patternChinese": "有权休假",
          "level": "C1",
          "examples": [
            {
              "de": "Anspruch auf Urlaub haben",
              "zh": "有权休假",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich stützen": {
      "display": "sich stützen",
      "prepositions": {
        "auf +A": [
          "sich auf Daten stützen. 以数据为依据",
          "Er stützte seinen Körper auf einen Stock. 他拄着手杖。",
          "Stütze deine Ellenbogen nicht auf den Tisch. 不要把你的手肘放在桌子上。"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to be based on",
          "chinese": "以…为依据",
          "pattern": "sich auf Daten stützen",
          "patternChinese": "以数据为依据",
          "level": "C1",
          "examples": [
            {
              "de": "sich auf Daten stützen",
              "zh": "以数据为依据",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er stützte seinen Körper auf einen Stock.",
              "zh": "他拄着手杖。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Stütze deine Ellenbogen nicht auf den Tisch.",
              "zh": "不要把你的手肘放在桌子上。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "zurückkommen": {
      "display": "zurückkommen",
      "prepositions": {
        "auf +A": [
          "auf das Thema zurückkommen. 回到这个话题"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to come back to",
          "chinese": "回到（话题）",
          "pattern": "auf das Thema zurückkommen",
          "patternChinese": "回到这个话题",
          "level": "B2",
          "examples": [
            {
              "de": "auf das Thema zurückkommen",
              "zh": "回到这个话题",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "vertrauen": {
      "display": "vertrauen",
      "prepositions": {
        "auf +A": [
          "auf sein Können vertrauen. 相信自己的能力"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to trust in",
          "chinese": "信赖",
          "pattern": "auf sein Können vertrauen",
          "patternChinese": "相信自己的能力",
          "level": "B2",
          "examples": [
            {
              "de": "auf sein Können vertrauen",
              "zh": "相信自己的能力",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "pochen": {
      "display": "pochen",
      "prepositions": {
        "auf +A": [
          "auf sein Recht pochen. 坚持自己的权利"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to insist on",
          "chinese": "坚持要求",
          "pattern": "auf sein Recht pochen",
          "patternChinese": "坚持自己的权利",
          "level": "C1",
          "examples": [
            {
              "de": "auf sein Recht pochen",
              "zh": "坚持自己的权利",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich einstellen": {
      "display": "sich einstellen",
      "prepositions": {
        "auf +A": [
          "sich auf die Kälte einstellen. 适应寒冷"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to adjust to",
          "chinese": "适应，有所准备",
          "pattern": "sich auf die Kälte einstellen",
          "patternChinese": "适应寒冷",
          "level": "B2",
          "examples": [
            {
              "de": "sich auf die Kälte einstellen",
              "zh": "适应寒冷",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "hinauslaufen": {
      "display": "hinauslaufen",
      "prepositions": {
        "auf +A": [
          "auf dasselbe hinauslaufen. 结果都一样"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to amount to",
          "chinese": "归结为",
          "pattern": "auf dasselbe hinauslaufen",
          "patternChinese": "结果都一样",
          "level": "C1",
          "examples": [
            {
              "de": "auf dasselbe hinauslaufen",
              "zh": "结果都一样",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "schwören": {
      "display": "schwören",
      "prepositions": {
        "auf +A": [
          "auf ein Hausmittel schwören. 极信赖偏方"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to swear by",
          "chinese": "极为信赖",
          "pattern": "auf ein Hausmittel schwören",
          "patternChinese": "极信赖偏方",
          "level": "C1",
          "examples": [
            {
              "de": "auf ein Hausmittel schwören",
              "zh": "极信赖偏方",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "aufmerksam werden": {
      "display": "aufmerksam werden",
      "prepositions": {
        "auf +A": [
          "auf den Fehler aufmerksam werden. 注意到错误"
        ]
      },
      "prepositionOrder": [
        "auf +A"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "auf +A",
          "english": "to become aware of",
          "chinese": "注意到",
          "pattern": "auf den Fehler aufmerksam werden",
          "patternChinese": "注意到错误",
          "level": "C1",
          "examples": [
            {
              "de": "auf den Fehler aufmerksam werden",
              "zh": "注意到错误",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "fußen": {
      "display": "fußen",
      "prepositions": {
        "auf +D": [
          "auf einer Idee fußen. 基于一个想法"
        ]
      },
      "prepositionOrder": [
        "auf +D"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "auf +D",
          "english": "to be founded on",
          "chinese": "基于",
          "pattern": "auf einer Idee fußen",
          "patternChinese": "基于一个想法",
          "level": "C1",
          "examples": [
            {
              "de": "auf einer Idee fußen",
              "zh": "基于一个想法",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "aufbauen": {
      "display": "aufbauen",
      "prepositions": {
        "auf +D": [
          "auf Erfahrung aufbauen. 以经验为基础"
        ]
      },
      "prepositionOrder": [
        "auf +D"
      ],
      "entries": [
        {
          "preposition": "auf",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "auf +D",
          "english": "to build upon",
          "chinese": "以…为基础",
          "pattern": "auf Erfahrung aufbauen",
          "patternChinese": "以经验为基础",
          "level": "C1",
          "examples": [
            {
              "de": "auf Erfahrung aufbauen",
              "zh": "以经验为基础",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "entstehen": {
      "display": "entstehen",
      "prepositions": {
        "aus +D": [
          "aus einem Streit entstehen. 由争吵引起",
          "Angst entsteht immer aus Unwissenheit. 恐惧来源于未知。"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to arise from",
          "chinese": "由…产生",
          "pattern": "aus einem Streit entstehen",
          "patternChinese": "由争吵引起",
          "level": "B2",
          "examples": [
            {
              "de": "aus einem Streit entstehen",
              "zh": "由争吵引起",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Angst entsteht immer aus Unwissenheit.",
              "zh": "恐惧来源于未知。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "machen": {
      "display": "machen",
      "prepositions": {
        "aus +D": [
          "aus Holz ein Regal machen. 用木头做架子",
          "Er macht das Beste aus seinem Talent. 他善用他的天赋。",
          "Sie machte einen Rock aus ihrem alten Kleid. 她把旧连衣裙换了一条裙子。",
          "Tom macht kein Geheimnis daraus, dass er schwul ist. 汤姆公开自己的同性恋倾向。",
          "Sie zerschnitt den Stoff, um daraus Bandagen zu machen. 她裁下布制作绷带。"
        ]
      },
      "prepositionOrder": [
        "aus +D"
      ],
      "entries": [
        {
          "preposition": "aus",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "aus +D",
          "english": "to make out of",
          "chinese": "用…做成",
          "pattern": "aus Holz ein Regal machen",
          "patternChinese": "用木头做架子",
          "level": "B1",
          "examples": [
            {
              "de": "aus Holz ein Regal machen",
              "zh": "用木头做架子",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Er macht das Beste aus seinem Talent.",
              "zh": "他善用他的天赋。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie machte einen Rock aus ihrem alten Kleid.",
              "zh": "她把旧连衣裙换了一条裙子。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Tom macht kein Geheimnis daraus, dass er schwul ist.",
              "zh": "汤姆公开自己的同性恋倾向。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sie zerschnitt den Stoff, um daraus Bandagen zu machen.",
              "zh": "她裁下布制作绷带。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "mitwirken": {
      "display": "mitwirken",
      "prepositions": {
        "bei +D": [
          "bei einem Projekt mitwirken. 参与一个项目"
        ]
      },
      "prepositionOrder": [
        "bei +D"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to collaborate on",
          "chinese": "参与",
          "pattern": "bei einem Projekt mitwirken",
          "patternChinese": "参与一个项目",
          "level": "C1",
          "examples": [
            {
              "de": "bei einem Projekt mitwirken",
              "zh": "参与一个项目",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "anrufen": {
      "display": "anrufen",
      "prepositions": {
        "bei +D": [
          "bei der Firma anrufen. 给公司打电话"
        ]
      },
      "prepositionOrder": [
        "bei +D"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to call sb",
          "chinese": "给…打电话",
          "pattern": "bei der Firma anrufen",
          "patternChinese": "给公司打电话",
          "level": "A2",
          "examples": [
            {
              "de": "bei der Firma anrufen",
              "zh": "给公司打电话",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "vorbeikommen": {
      "display": "vorbeikommen",
      "prepositions": {
        "bei +D": [
          "bei einem Freund vorbeikommen. 顺道去朋友家"
        ]
      },
      "prepositionOrder": [
        "bei +D"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to drop by sb's place",
          "chinese": "顺路拜访",
          "pattern": "bei einem Freund vorbeikommen",
          "patternChinese": "顺道去朋友家",
          "level": "B1",
          "examples": [
            {
              "de": "bei einem Freund vorbeikommen",
              "zh": "顺道去朋友家",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "wohnen": {
      "display": "wohnen",
      "prepositions": {
        "bei +D": [
          "bei den Eltern wohnen. 住在父母家",
          "Sie wohnt bei ihm nebenan. 她住在他的隔壁。",
          "Ich wohne bei meinem Onkel. 我住在我的伯父家",
          "Tom wohnt jetzt bei seinem Onkel. 汤姆现在跟他叔叔住在一起。",
          "Jetzt wohne ich bei meinem Onkel. 我现在住在叔叔家."
        ]
      },
      "prepositionOrder": [
        "bei +D"
      ],
      "entries": [
        {
          "preposition": "bei",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "bei +D",
          "english": "to live with",
          "chinese": "住在…家",
          "pattern": "bei den Eltern wohnen",
          "patternChinese": "住在父母家",
          "level": "A1",
          "examples": [
            {
              "de": "bei den Eltern wohnen",
              "zh": "住在父母家",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie wohnt bei ihm nebenan.",
              "zh": "她住在他的隔壁。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Ich wohne bei meinem Onkel.",
              "zh": "我住在我的伯父家",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Tom wohnt jetzt bei seinem Onkel.",
              "zh": "汤姆现在跟他叔叔住在一起。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Jetzt wohne ich bei meinem Onkel.",
              "zh": "我现在住在叔叔家.",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "teilen": {
      "display": "teilen",
      "prepositions": {
        "durch +A": [
          "zehn durch zwei teilen. 十除以二",
          "Sechs geteilt durch zwei ist drei. 六除以二得三。"
        ]
      },
      "prepositionOrder": [
        "durch +A"
      ],
      "entries": [
        {
          "preposition": "durch",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "durch +A",
          "english": "to divide by",
          "chinese": "除以",
          "pattern": "zehn durch zwei teilen",
          "patternChinese": "十除以二",
          "level": "B1",
          "examples": [
            {
              "de": "zehn durch zwei teilen",
              "zh": "十除以二",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sechs geteilt durch zwei ist drei.",
              "zh": "六除以二得三。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "gekennzeichnet sein": {
      "display": "gekennzeichnet sein",
      "prepositions": {
        "durch +A": [
          "durch Vielfalt gekennzeichnet sein. 以多样性为特征"
        ]
      },
      "prepositionOrder": [
        "durch +A"
      ],
      "entries": [
        {
          "preposition": "durch",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "durch +A",
          "english": "to be characterized by",
          "chinese": "以…为特征",
          "pattern": "durch Vielfalt gekennzeichnet sein",
          "patternChinese": "以多样性为特征",
          "level": "C1",
          "examples": [
            {
              "de": "durch Vielfalt gekennzeichnet sein",
              "zh": "以多样性为特征",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "bürgen": {
      "display": "bürgen",
      "prepositions": {
        "für +A": [
          "für einen Freund bürgen. 为朋友担保"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to vouch for",
          "chinese": "担保",
          "pattern": "für einen Freund bürgen",
          "patternChinese": "为朋友担保",
          "level": "C1",
          "examples": [
            {
              "de": "für einen Freund bürgen",
              "zh": "为朋友担保",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "schwärmen": {
      "display": "schwärmen",
      "prepositions": {
        "für +A": [
          "für eine Sängerin schwärmen. 迷恋一位歌手",
          "Seine Studenten schwärmten für ihn. 学生们都衷心钦佩他们的老师。"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be crazy about",
          "chinese": "迷恋",
          "pattern": "für eine Sängerin schwärmen",
          "patternChinese": "迷恋一位歌手",
          "level": "C1",
          "examples": [
            {
              "de": "für eine Sängerin schwärmen",
              "zh": "迷恋一位歌手",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Seine Studenten schwärmten für ihn.",
              "zh": "学生们都衷心钦佩他们的老师。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "gelten": {
      "display": "gelten",
      "prepositions": {
        "für +A": [
          "Die Regel gilt für alle. 规则适用于所有人"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to apply to",
          "chinese": "适用于",
          "pattern": "Die Regel gilt für alle",
          "patternChinese": "规则适用于所有人",
          "level": "B2",
          "examples": [
            {
              "de": "Die Regel gilt für alle",
              "zh": "规则适用于所有人",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verantwortlich sein": {
      "display": "verantwortlich sein",
      "prepositions": {
        "für +A": [
          "für das Team verantwortlich sein. 对团队负责"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be responsible for",
          "chinese": "对…负责",
          "pattern": "für das Team verantwortlich sein",
          "patternChinese": "对团队负责",
          "level": "B2",
          "examples": [
            {
              "de": "für das Team verantwortlich sein",
              "zh": "对团队负责",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "typisch sein": {
      "display": "typisch sein",
      "prepositions": {
        "für +A": [
          "typisch für die Region sein. 是该地区的典型"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be typical of",
          "chinese": "是…的典型",
          "pattern": "typisch für die Region sein",
          "patternChinese": "是该地区的典型",
          "level": "B2",
          "examples": [
            {
              "de": "typisch für die Region sein",
              "zh": "是该地区的典型",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "bekannt sein": {
      "display": "bekannt sein",
      "prepositions": {
        "für +A": [
          "für seinen Käse bekannt sein. 以奶酪闻名"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be known for",
          "chinese": "以…闻名",
          "pattern": "für seinen Käse bekannt sein",
          "patternChinese": "以奶酪闻名",
          "level": "B1",
          "examples": [
            {
              "de": "für seinen Käse bekannt sein",
              "zh": "以奶酪闻名",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "dankbar sein": {
      "display": "dankbar sein",
      "prepositions": {
        "für +A": [
          "für die Hilfe dankbar sein. 感谢帮助"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be grateful for",
          "chinese": "对…感激",
          "pattern": "für die Hilfe dankbar sein",
          "patternChinese": "感谢帮助",
          "level": "B1",
          "examples": [
            {
              "de": "für die Hilfe dankbar sein",
              "zh": "感谢帮助",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "geeignet sein": {
      "display": "geeignet sein",
      "prepositions": {
        "für +A": [
          "für Anfänger geeignet sein. 适合初学者"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be suitable for",
          "chinese": "适合",
          "pattern": "für Anfänger geeignet sein",
          "patternChinese": "适合初学者",
          "level": "B1",
          "examples": [
            {
              "de": "für Anfänger geeignet sein",
              "zh": "适合初学者",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "wichtig sein": {
      "display": "wichtig sein",
      "prepositions": {
        "für +A": [
          "für die Gesundheit wichtig sein. 对健康很重要"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be important for",
          "chinese": "对…重要",
          "pattern": "für die Gesundheit wichtig sein",
          "patternChinese": "对健康很重要",
          "level": "A2",
          "examples": [
            {
              "de": "für die Gesundheit wichtig sein",
              "zh": "对健康很重要",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Verständnis haben": {
      "display": "Verständnis haben",
      "prepositions": {
        "für +A": [
          "Verständnis für die Lage haben. 理解这种处境"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to be understanding of",
          "chinese": "理解",
          "pattern": "Verständnis für die Lage haben",
          "patternChinese": "理解这种处境",
          "level": "B2",
          "examples": [
            {
              "de": "Verständnis für die Lage haben",
              "zh": "理解这种处境",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Zeit haben": {
      "display": "Zeit haben",
      "prepositions": {
        "für +A": [
          "Zeit für die Familie haben. 有时间陪家人",
          "Ich würde gerne Deutsch lernen, aber ich habe keine Zeit dafür. 我想学德语，但是我没有时间。",
          "Wir haben keine Zeit für Erklärungen. 没时间解释。",
          "Haben wir Zeit für noch einen Kaffee? 我们有时间再喝一杯咖啡吗？"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to have time for",
          "chinese": "有时间做",
          "pattern": "Zeit für die Familie haben",
          "patternChinese": "有时间陪家人",
          "level": "A2",
          "examples": [
            {
              "de": "Zeit für die Familie haben",
              "zh": "有时间陪家人",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich würde gerne Deutsch lernen, aber ich habe keine Zeit dafür.",
              "zh": "我想学德语，但是我没有时间。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Wir haben keine Zeit für Erklärungen.",
              "zh": "没时间解释。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Haben wir Zeit für noch einen Kaffee?",
              "zh": "我们有时间再喝一杯咖啡吗？",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "Interesse zeigen": {
      "display": "Interesse zeigen",
      "prepositions": {
        "für +A": [
          "Interesse für Kunst zeigen. 对艺术表示兴趣"
        ]
      },
      "prepositionOrder": [
        "für +A"
      ],
      "entries": [
        {
          "preposition": "für",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "für +A",
          "english": "to show interest in",
          "chinese": "对…表示兴趣",
          "pattern": "Interesse für Kunst zeigen",
          "patternChinese": "对艺术表示兴趣",
          "level": "B2",
          "examples": [
            {
              "de": "Interesse für Kunst zeigen",
              "zh": "对艺术表示兴趣",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich sträuben": {
      "display": "sich sträuben",
      "prepositions": {
        "gegen +A": [
          "sich gegen die Änderung sträuben. 抵触这项改动"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to resist",
          "chinese": "抵触",
          "pattern": "sich gegen die Änderung sträuben",
          "patternChinese": "抵触这项改动",
          "level": "C1",
          "examples": [
            {
              "de": "sich gegen die Änderung sträuben",
              "zh": "抵触这项改动",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "immun sein": {
      "display": "immun sein",
      "prepositions": {
        "gegen +A": [
          "gegen das Virus immun sein. 对病毒免疫"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to be immune to",
          "chinese": "对…免疫",
          "pattern": "gegen das Virus immun sein",
          "patternChinese": "对病毒免疫",
          "level": "C1",
          "examples": [
            {
              "de": "gegen das Virus immun sein",
              "zh": "对病毒免疫",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "allergisch sein": {
      "display": "allergisch sein",
      "prepositions": {
        "gegen +A": [
          "gegen Pollen allergisch sein. 对花粉过敏"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to be allergic to",
          "chinese": "对…过敏",
          "pattern": "gegen Pollen allergisch sein",
          "patternChinese": "对花粉过敏",
          "level": "B1",
          "examples": [
            {
              "de": "gegen Pollen allergisch sein",
              "zh": "对花粉过敏",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verlieren": {
      "display": "verlieren",
      "prepositions": {
        "gegen +A": [
          "gegen die Mannschaft verlieren. 输给那支球队"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to lose to",
          "chinese": "输给",
          "pattern": "gegen die Mannschaft verlieren",
          "patternChinese": "输给那支球队",
          "level": "B1",
          "examples": [
            {
              "de": "gegen die Mannschaft verlieren",
              "zh": "输给那支球队",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "tauschen": {
      "display": "tauschen",
      "prepositions": {
        "gegen +A": [
          "Euro gegen Dollar tauschen. 把欧元换成美元",
          "Sie tauschte ihr altes Kleid gegen einen Rock. 她把旧连衣裙换了一条裙子。"
        ]
      },
      "prepositionOrder": [
        "gegen +A"
      ],
      "entries": [
        {
          "preposition": "gegen",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "gegen +A",
          "english": "to exchange for",
          "chinese": "换成",
          "pattern": "Euro gegen Dollar tauschen",
          "patternChinese": "把欧元换成美元",
          "level": "B1",
          "examples": [
            {
              "de": "Euro gegen Dollar tauschen",
              "zh": "把欧元换成美元",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie tauschte ihr altes Kleid gegen einen Rock.",
              "zh": "她把旧连衣裙换了一条裙子。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "einteilen": {
      "display": "einteilen",
      "prepositions": {
        "in +A": [
          "in drei Gruppen einteilen. 分成三组"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to divide into",
          "chinese": "划分为",
          "pattern": "in drei Gruppen einteilen",
          "patternChinese": "分成三组",
          "level": "B2",
          "examples": [
            {
              "de": "in drei Gruppen einteilen",
              "zh": "分成三组",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verwickeln": {
      "display": "verwickeln",
      "prepositions": {
        "in +A": [
          "jemanden in einen Streit verwickeln. 把某人卷入争吵",
          "Nicht nur du, sondern auch ich war darin verwickelt. 不止你， 连我也被牵连了。"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to involve in",
          "chinese": "卷入",
          "pattern": "jemanden in einen Streit verwickeln",
          "patternChinese": "把某人卷入争吵",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden in einen Streit verwickeln",
              "zh": "把某人卷入争吵",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Nicht nur du, sondern auch ich war darin verwickelt.",
              "zh": "不止你， 连我也被牵连了。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "umrechnen": {
      "display": "umrechnen",
      "prepositions": {
        "in +A": [
          "Euro in Dollar umrechnen. 把欧元换算成美元"
        ]
      },
      "prepositionOrder": [
        "in +A"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "in +A",
          "english": "to convert into",
          "chinese": "换算成",
          "pattern": "Euro in Dollar umrechnen",
          "patternChinese": "把欧元换算成美元",
          "level": "B2",
          "examples": [
            {
              "de": "Euro in Dollar umrechnen",
              "zh": "把欧元换算成美元",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "gut sein": {
      "display": "gut sein",
      "prepositions": {
        "in +D": [
          "in Mathematik gut sein. 数学好"
        ]
      },
      "prepositionOrder": [
        "in +D"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to be good at",
          "chinese": "擅长",
          "pattern": "in Mathematik gut sein",
          "patternChinese": "数学好",
          "level": "A2",
          "examples": [
            {
              "de": "in Mathematik gut sein",
              "zh": "数学好",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "erfahren sein": {
      "display": "erfahren sein",
      "prepositions": {
        "in +D": [
          "in diesem Bereich erfahren sein. 在该领域有经验"
        ]
      },
      "prepositionOrder": [
        "in +D"
      ],
      "entries": [
        {
          "preposition": "in",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "in +D",
          "english": "to be experienced in",
          "chinese": "在…方面有经验",
          "pattern": "in diesem Bereich erfahren sein",
          "patternChinese": "在该领域有经验",
          "level": "C1",
          "examples": [
            {
              "de": "in diesem Bereich erfahren sein",
              "zh": "在该领域有经验",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "zufrieden sein": {
      "display": "zufrieden sein",
      "prepositions": {
        "mit +D": [
          "mit dem Ergebnis zufrieden sein. 对结果满意",
          "Sie sagt, sie sei mit ihrem Leben zufrieden. 她说很满意她的生活。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to be satisfied with",
          "chinese": "对…满意",
          "pattern": "mit dem Ergebnis zufrieden sein",
          "patternChinese": "对结果满意",
          "level": "A2",
          "examples": [
            {
              "de": "mit dem Ergebnis zufrieden sein",
              "zh": "对结果满意",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Sie sagt, sie sei mit ihrem Leben zufrieden.",
              "zh": "她说很满意她的生活。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "verheiratet sein": {
      "display": "verheiratet sein",
      "prepositions": {
        "mit +D": [
          "mit einer Ärztin verheiratet sein. 妻子是医生"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to be married to",
          "chinese": "与…结婚",
          "pattern": "mit einer Ärztin verheiratet sein",
          "patternChinese": "妻子是医生",
          "level": "B1",
          "examples": [
            {
              "de": "mit einer Ärztin verheiratet sein",
              "zh": "妻子是医生",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "einverstanden sein": {
      "display": "einverstanden sein",
      "prepositions": {
        "mit +D": [
          "mit dem Vorschlag einverstanden sein. 同意这个建议"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to agree with",
          "chinese": "同意",
          "pattern": "mit dem Vorschlag einverstanden sein",
          "patternChinese": "同意这个建议",
          "level": "B1",
          "examples": [
            {
              "de": "mit dem Vorschlag einverstanden sein",
              "zh": "同意这个建议",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verwandt sein": {
      "display": "verwandt sein",
      "prepositions": {
        "mit +D": [
          "mit ihm verwandt sein. 与他是亲戚"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to be related to",
          "chinese": "与…有亲属关系",
          "pattern": "mit ihm verwandt sein",
          "patternChinese": "与他是亲戚",
          "level": "B2",
          "examples": [
            {
              "de": "mit ihm verwandt sein",
              "zh": "与他是亲戚",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "experimentieren": {
      "display": "experimentieren",
      "prepositions": {
        "mit +D": [
          "mit neuen Formen experimentieren. 尝试新形式"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to experiment with",
          "chinese": "用…做试验",
          "pattern": "mit neuen Formen experimentieren",
          "patternChinese": "尝试新形式",
          "level": "C1",
          "examples": [
            {
              "de": "mit neuen Formen experimentieren",
              "zh": "尝试新形式",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "versorgen": {
      "display": "versorgen",
      "prepositions": {
        "mit +D": [
          "die Stadt mit Wasser versorgen. 向城市供水",
          "Schafe versorgen uns mit Wolle. 绵羊提供我们羊毛。",
          "Kühe versorgen uns mit guter Milch. 牛供给我们好奶。",
          "Dieser Damm versorgt uns mit Wasser und Strom. 这个水坝给我们提供水和电。",
          "Diese Schule versorgt die Schüler mit Lehrbüchern. 这所学校为学生提供教科书。"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to supply with",
          "chinese": "向…提供",
          "pattern": "die Stadt mit Wasser versorgen",
          "patternChinese": "向城市供水",
          "level": "B2",
          "examples": [
            {
              "de": "die Stadt mit Wasser versorgen",
              "zh": "向城市供水",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Schafe versorgen uns mit Wolle.",
              "zh": "绵羊提供我们羊毛。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Kühe versorgen uns mit guter Milch.",
              "zh": "牛供给我们好奶。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Dieser Damm versorgt uns mit Wasser und Strom.",
              "zh": "这个水坝给我们提供水和电。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Diese Schule versorgt die Schüler mit Lehrbüchern.",
              "zh": "这所学校为学生提供教科书。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich vertragen": {
      "display": "sich vertragen",
      "prepositions": {
        "mit +D": [
          "sich mit den Nachbarn vertragen. 与邻居和睦相处"
        ]
      },
      "prepositionOrder": [
        "mit +D"
      ],
      "entries": [
        {
          "preposition": "mit",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "mit +D",
          "english": "to get along with",
          "chinese": "与…相处融洽",
          "pattern": "sich mit den Nachbarn vertragen",
          "patternChinese": "与邻居和睦相处",
          "level": "B2",
          "examples": [
            {
              "de": "sich mit den Nachbarn vertragen",
              "zh": "与邻居和睦相处",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "benennen": {
      "display": "benennen",
      "prepositions": {
        "nach +D": [
          "die Straße nach dem Dichter benennen. 以诗人的名字命名街道"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to name after",
          "chinese": "以…命名",
          "pattern": "die Straße nach dem Dichter benennen",
          "patternChinese": "以诗人的名字命名街道",
          "level": "C1",
          "examples": [
            {
              "de": "die Straße nach dem Dichter benennen",
              "zh": "以诗人的名字命名街道",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich umsehen": {
      "display": "sich umsehen",
      "prepositions": {
        "nach +D": [
          "sich nach einer Wohnung umsehen. 物色房子"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to look around for",
          "chinese": "物色",
          "pattern": "sich nach einer Wohnung umsehen",
          "patternChinese": "物色房子",
          "level": "B2",
          "examples": [
            {
              "de": "sich nach einer Wohnung umsehen",
              "zh": "物色房子",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Sehnsucht haben": {
      "display": "Sehnsucht haben",
      "prepositions": {
        "nach +D": [
          "Sehnsucht nach zu Hause haben. 想家"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to long for",
          "chinese": "思念",
          "pattern": "Sehnsucht nach zu Hause haben",
          "patternChinese": "想家",
          "level": "B2",
          "examples": [
            {
              "de": "Sehnsucht nach zu Hause haben",
              "zh": "想家",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "schicken": {
      "display": "schicken",
      "prepositions": {
        "nach +D": [
          "nach dem Arzt schicken. 派人请医生",
          "Ich möchte dieses Paket nach Japan schicken. 我想把这个包裹寄到日本。"
        ]
      },
      "prepositionOrder": [
        "nach +D"
      ],
      "entries": [
        {
          "preposition": "nach",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "nach +D",
          "english": "to send for",
          "chinese": "派人去请",
          "pattern": "nach dem Arzt schicken",
          "patternChinese": "派人请医生",
          "level": "C1",
          "examples": [
            {
              "de": "nach dem Arzt schicken",
              "zh": "派人请医生",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich möchte dieses Paket nach Japan schicken.",
              "zh": "我想把这个包裹寄到日本。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "ersuchen": {
      "display": "ersuchen",
      "prepositions": {
        "um +A": [
          "um Auskunft ersuchen. 请求提供信息",
          "Einige Minister ersuchten bei Hofe um Erlaubnis. 几位大臣奏请朝廷的准许。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to request",
          "chinese": "请求",
          "pattern": "um Auskunft ersuchen",
          "patternChinese": "请求提供信息",
          "level": "C1",
          "examples": [
            {
              "de": "um Auskunft ersuchen",
              "zh": "请求提供信息",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Einige Minister ersuchten bei Hofe um Erlaubnis.",
              "zh": "几位大臣奏请朝廷的准许。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "wetten": {
      "display": "wetten",
      "prepositions": {
        "um +A": [
          "um zehn Euro wetten. 赌十欧元",
          "Ich wette mit dir um hundert Dollar, dass Tom schwul ist. 我和你赌一百元，汤姆是同性恋。"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to bet",
          "chinese": "打赌",
          "pattern": "um zehn Euro wetten",
          "patternChinese": "赌十欧元",
          "level": "B2",
          "examples": [
            {
              "de": "um zehn Euro wetten",
              "zh": "赌十欧元",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ich wette mit dir um hundert Dollar, dass Tom schwul ist.",
              "zh": "我和你赌一百元，汤姆是同性恋。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "trauern": {
      "display": "trauern",
      "prepositions": {
        "um +A": [
          "um einen Freund trauern. 悼念朋友"
        ]
      },
      "prepositionOrder": [
        "um +A"
      ],
      "entries": [
        {
          "preposition": "um",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "um +A",
          "english": "to mourn for",
          "chinese": "哀悼",
          "pattern": "um einen Freund trauern",
          "patternChinese": "悼念朋友",
          "level": "C1",
          "examples": [
            {
              "de": "um einen Freund trauern",
              "zh": "悼念朋友",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "abhängig sein": {
      "display": "abhängig sein",
      "prepositions": {
        "von +D": [
          "vom Wetter abhängig sein. 取决于天气"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to be dependent on",
          "chinese": "依赖于",
          "pattern": "vom Wetter abhängig sein",
          "patternChinese": "取决于天气",
          "level": "B1",
          "examples": [
            {
              "de": "vom Wetter abhängig sein",
              "zh": "取决于天气",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "begeistert sein": {
      "display": "begeistert sein",
      "prepositions": {
        "von +D": [
          "von der Idee begeistert sein. 对这个想法很兴奋"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to be enthusiastic about",
          "chinese": "对…着迷",
          "pattern": "von der Idee begeistert sein",
          "patternChinese": "对这个想法很兴奋",
          "level": "B2",
          "examples": [
            {
              "de": "von der Idee begeistert sein",
              "zh": "对这个想法很兴奋",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "überzeugt sein": {
      "display": "überzeugt sein",
      "prepositions": {
        "von +D": [
          "von dem Plan überzeugt sein. 确信这个方案"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to be convinced of",
          "chinese": "确信",
          "pattern": "von dem Plan überzeugt sein",
          "patternChinese": "确信这个方案",
          "level": "B2",
          "examples": [
            {
              "de": "von dem Plan überzeugt sein",
              "zh": "确信这个方案",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "enttäuscht sein": {
      "display": "enttäuscht sein",
      "prepositions": {
        "von +D": [
          "von dem Film enttäuscht sein. 对电影失望"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to be disappointed by",
          "chinese": "对…失望",
          "pattern": "von dem Film enttäuscht sein",
          "patternChinese": "对电影失望",
          "level": "B1",
          "examples": [
            {
              "de": "von dem Film enttäuscht sein",
              "zh": "对电影失望",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "zeugen": {
      "display": "zeugen",
      "prepositions": {
        "von +D": [
          "von Mut zeugen. 表明勇气"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to testify to",
          "chinese": "表明",
          "pattern": "von Mut zeugen",
          "patternChinese": "表明勇气",
          "level": "C1",
          "examples": [
            {
              "de": "von Mut zeugen",
              "zh": "表明勇气",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "wimmeln": {
      "display": "wimmeln",
      "prepositions": {
        "von +D": [
          "von Fehlern wimmeln. 错误百出",
          "Die Wäsche von Bruno wimmelt von Ungeziefer. 布鲁诺的衣服里全是害虫。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to be teeming with",
          "chinese": "充满",
          "pattern": "von Fehlern wimmeln",
          "patternChinese": "错误百出",
          "level": "C1",
          "examples": [
            {
              "de": "von Fehlern wimmeln",
              "zh": "错误百出",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Die Wäsche von Bruno wimmelt von Ungeziefer.",
              "zh": "布鲁诺的衣服里全是害虫。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "sich ernähren": {
      "display": "sich ernähren",
      "prepositions": {
        "von +D": [
          "sich von Gemüse ernähren. 以蔬菜为食",
          "Bienen ernähren sich von Nektar. 蜜蜂以花蜜为食。",
          "Pandas ernähren sich von Bambus. 熊猫以竹为食。",
          "Diese Tiere ernähren sich von Gras. 这几种动物是吃草的。",
          "Japaner ernähren sich von Reis und Fisch. 日本人以米饭和鱼为生存之食。"
        ]
      },
      "prepositionOrder": [
        "von +D"
      ],
      "entries": [
        {
          "preposition": "von",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "von +D",
          "english": "to live on",
          "chinese": "以…为食",
          "pattern": "sich von Gemüse ernähren",
          "patternChinese": "以蔬菜为食",
          "level": "B2",
          "examples": [
            {
              "de": "sich von Gemüse ernähren",
              "zh": "以蔬菜为食",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Bienen ernähren sich von Nektar.",
              "zh": "蜜蜂以花蜜为食。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Pandas ernähren sich von Bambus.",
              "zh": "熊猫以竹为食。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Diese Tiere ernähren sich von Gras.",
              "zh": "这几种动物是吃草的。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Japaner ernähren sich von Reis und Fisch.",
              "zh": "日本人以米饭和鱼为生存之食。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "bewahren": {
      "display": "bewahren",
      "prepositions": {
        "vor +D": [
          "jemanden vor Schaden bewahren. 使某人免受损害"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to protect from",
          "chinese": "使免于",
          "pattern": "jemanden vor Schaden bewahren",
          "patternChinese": "使某人免受损害",
          "level": "C1",
          "examples": [
            {
              "de": "jemanden vor Schaden bewahren",
              "zh": "使某人免受损害",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sicher sein": {
      "display": "sicher sein",
      "prepositions": {
        "vor +D": [
          "vor Regen sicher sein. 不怕下雨"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to be safe from",
          "chinese": "不受…侵害",
          "pattern": "vor Regen sicher sein",
          "patternChinese": "不怕下雨",
          "level": "B2",
          "examples": [
            {
              "de": "vor Regen sicher sein",
              "zh": "不怕下雨",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "kapitulieren": {
      "display": "kapitulieren",
      "prepositions": {
        "vor +D": [
          "vor den Problemen kapitulieren. 向困难屈服"
        ]
      },
      "prepositionOrder": [
        "vor +D"
      ],
      "entries": [
        {
          "preposition": "vor",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "vor +D",
          "english": "to capitulate to",
          "chinese": "向…屈服",
          "pattern": "vor den Problemen kapitulieren",
          "patternChinese": "向困难屈服",
          "level": "C1",
          "examples": [
            {
              "de": "vor den Problemen kapitulieren",
              "zh": "向困难屈服",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "bereit sein": {
      "display": "bereit sein",
      "prepositions": {
        "zu +D": [
          "zu einem Kompromiss bereit sein. 愿意妥协"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to be ready for",
          "chinese": "准备好",
          "pattern": "zu einem Kompromiss bereit sein",
          "patternChinese": "愿意妥协",
          "level": "B2",
          "examples": [
            {
              "de": "zu einem Kompromiss bereit sein",
              "zh": "愿意妥协",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "fähig sein": {
      "display": "fähig sein",
      "prepositions": {
        "zu +D": [
          "zu einer Entscheidung fähig sein. 能够作出决定"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to be capable of",
          "chinese": "有能力做",
          "pattern": "zu einer Entscheidung fähig sein",
          "patternChinese": "能够作出决定",
          "level": "C1",
          "examples": [
            {
              "de": "zu einer Entscheidung fähig sein",
              "zh": "能够作出决定",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "freundlich sein": {
      "display": "freundlich sein",
      "prepositions": {
        "zu +D": [
          "zu den Gästen freundlich sein. 对客人友好"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to be friendly to",
          "chinese": "对…友好",
          "pattern": "zu den Gästen freundlich sein",
          "patternChinese": "对客人友好",
          "level": "A2",
          "examples": [
            {
              "de": "zu den Gästen freundlich sein",
              "zh": "对客人友好",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "nett sein": {
      "display": "nett sein",
      "prepositions": {
        "zu +D": [
          "zu den Kindern nett sein. 对孩子好",
          "Seien Sie nett zu Ann. 善待安。",
          "Seien Sie nett zu ihr. 对她好点。",
          "Sei nett zu den anderen! 对他人要友善。",
          "Sei nett zu den anderen. 对他人要友善。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to be nice to",
          "chinese": "对…好",
          "pattern": "zu den Kindern nett sein",
          "patternChinese": "对孩子好",
          "level": "A2",
          "examples": [
            {
              "de": "zu den Kindern nett sein",
              "zh": "对孩子好",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Seien Sie nett zu Ann.",
              "zh": "善待安。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Seien Sie nett zu ihr.",
              "zh": "对她好点。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sei nett zu den anderen!",
              "zh": "对他人要友善。",
              "source": "Tatoeba CC BY 2.0 FR"
            },
            {
              "de": "Sei nett zu den anderen.",
              "zh": "对他人要友善。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "taugen": {
      "display": "taugen",
      "prepositions": {
        "zu +D": [
          "zu nichts taugen. 一无是处"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to be good for",
          "chinese": "适合做",
          "pattern": "zu nichts taugen",
          "patternChinese": "一无是处",
          "level": "C1",
          "examples": [
            {
              "de": "zu nichts taugen",
              "zh": "一无是处",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "verhelfen": {
      "display": "verhelfen",
      "prepositions": {
        "zu +D": [
          "jemandem zum Erfolg verhelfen. 帮某人取得成功"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to help sb get",
          "chinese": "帮助…获得",
          "pattern": "jemandem zum Erfolg verhelfen",
          "patternChinese": "帮某人取得成功",
          "level": "C1",
          "examples": [
            {
              "de": "jemandem zum Erfolg verhelfen",
              "zh": "帮某人取得成功",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Vertrauen haben": {
      "display": "Vertrauen haben",
      "prepositions": {
        "zu +D": [
          "Vertrauen zu dem Arzt haben. 信任这位医生",
          "Ihr habt keine andere Wahl, als einander zu vertrauen. 信任对方是你们唯一的选择。"
        ]
      },
      "prepositionOrder": [
        "zu +D"
      ],
      "entries": [
        {
          "preposition": "zu",
          "case": "D",
          "caseLabel": "Dativ（第三格）",
          "key": "zu +D",
          "english": "to have confidence in",
          "chinese": "信任",
          "pattern": "Vertrauen zu dem Arzt haben",
          "patternChinese": "信任这位医生",
          "level": "B2",
          "examples": [
            {
              "de": "Vertrauen zu dem Arzt haben",
              "zh": "信任这位医生",
              "source": "Dimenticato (authored)"
            },
            {
              "de": "Ihr habt keine andere Wahl, als einander zu vertrauen.",
              "zh": "信任对方是你们唯一的选择。",
              "source": "Tatoeba CC BY 2.0 FR"
            }
          ]
        }
      ]
    },
    "wachen": {
      "display": "wachen",
      "prepositions": {
        "über +A": [
          "über die Sicherheit wachen. 负责安全"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to watch over",
          "chinese": "看管",
          "pattern": "über die Sicherheit wachen",
          "patternChinese": "负责安全",
          "level": "C1",
          "examples": [
            {
              "de": "über die Sicherheit wachen",
              "zh": "负责安全",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich klar werden": {
      "display": "sich klar werden",
      "prepositions": {
        "über +A": [
          "sich über die Folgen klar werden. 弄清后果"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to become clear about",
          "chinese": "弄清楚",
          "pattern": "sich über die Folgen klar werden",
          "patternChinese": "弄清后果",
          "level": "C1",
          "examples": [
            {
              "de": "sich über die Folgen klar werden",
              "zh": "弄清后果",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "sich hinwegsetzen": {
      "display": "sich hinwegsetzen",
      "prepositions": {
        "über +A": [
          "sich über die Regeln hinwegsetzen. 无视规则"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to disregard",
          "chinese": "无视",
          "pattern": "sich über die Regeln hinwegsetzen",
          "patternChinese": "无视规则",
          "level": "C1",
          "examples": [
            {
              "de": "sich über die Regeln hinwegsetzen",
              "zh": "无视规则",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    },
    "Auskunft geben": {
      "display": "Auskunft geben",
      "prepositions": {
        "über +A": [
          "Auskunft über den Preis geben. 说明价格"
        ]
      },
      "prepositionOrder": [
        "über +A"
      ],
      "entries": [
        {
          "preposition": "über",
          "case": "A",
          "caseLabel": "Akkusativ（第四格）",
          "key": "über +A",
          "english": "to give information about",
          "chinese": "说明",
          "pattern": "Auskunft über den Preis geben",
          "patternChinese": "说明价格",
          "level": "B2",
          "examples": [
            {
              "de": "Auskunft über den Preis geben",
              "zh": "说明价格",
              "source": "Dimenticato (authored)"
            }
          ]
        }
      ]
    }
  },
  "prepositions": {
    "an +A": [
      "adressieren",
      "anknüpfen",
      "appellieren",
      "denken",
      "erinnern",
      "gewöhnt sein",
      "glauben",
      "grenzen",
      "liefern",
      "schreiben",
      "senden",
      "sich anpassen",
      "sich erinnern",
      "sich gewöhnen",
      "sich halten",
      "sich klammern",
      "sich machen",
      "sich richten",
      "sich wenden",
      "verkaufen",
      "vermieten",
      "weiterleiten",
      "übergeben"
    ],
    "über +A": [
      "Auskunft geben",
      "berichten",
      "Bescheid wissen",
      "diskutieren",
      "entscheiden",
      "herrschen",
      "informieren",
      "klagen",
      "lachen",
      "nachdenken",
      "reden",
      "schreiben",
      "sich aufregen",
      "sich beklagen",
      "sich beschweren",
      "sich einigen",
      "sich freuen",
      "sich Gedanken machen",
      "sich hinwegsetzen",
      "sich informieren",
      "sich klar werden",
      "sich lustig machen",
      "sich streiten",
      "sich täuschen",
      "sich unterhalten",
      "sich wundern",
      "sich ärgern",
      "sich äußern",
      "sprechen",
      "staunen",
      "urteilen",
      "verfügen",
      "verhandeln",
      "wachen"
    ],
    "gegen +A": [
      "allergisch sein",
      "demonstrieren",
      "helfen",
      "immun sein",
      "klagen",
      "kämpfen",
      "protestieren",
      "sich entscheiden",
      "sich richten",
      "sich sträuben",
      "sich versichern",
      "sich wehren",
      "sprechen",
      "stimmen",
      "tauschen",
      "verlieren",
      "verstoßen"
    ],
    "nach +D": [
      "aussehen",
      "benennen",
      "duften",
      "forschen",
      "fragen",
      "greifen",
      "klingen",
      "riechen",
      "rufen",
      "schicken",
      "schmecken",
      "Sehnsucht haben",
      "sich erkundigen",
      "sich richten",
      "sich sehnen",
      "sich umsehen",
      "streben",
      "suchen",
      "urteilen",
      "verlangen"
    ],
    "an +D": [
      "abnehmen",
      "arbeiten",
      "arm sein",
      "beteiligt sein",
      "erkennen",
      "erkranken",
      "fehlen",
      "festhalten",
      "Freude haben",
      "hindern",
      "Interesse haben",
      "interessiert sein",
      "leiden",
      "liegen",
      "mangeln",
      "reich sein",
      "scheitern",
      "schuld sein",
      "sich beteiligen",
      "sich erfreuen",
      "sich messen",
      "sich orientieren",
      "sich rächen",
      "Spaß haben",
      "sterben",
      "teilhaben",
      "teilnehmen",
      "verzweifeln",
      "zunehmen",
      "zweifeln"
    ],
    "bei +D": [
      "anrufen",
      "arbeiten",
      "bleiben",
      "helfen",
      "mitwirken",
      "sich bedanken",
      "sich beschweren",
      "sich bewerben",
      "sich entschuldigen",
      "sich erkundigen",
      "sich melden",
      "unterstützen",
      "vorbeikommen",
      "wohnen"
    ],
    "unter +D": [
      "leiden",
      "sich vorstellen",
      "verstehen"
    ],
    "auf +A": [
      "achten",
      "ankommen",
      "anspielen",
      "Anspruch haben",
      "antworten",
      "Appetit haben",
      "aufmerksam machen",
      "aufmerksam werden",
      "aufpassen",
      "böse sein",
      "drängen",
      "eifersüchtig sein",
      "Einfluss nehmen",
      "gespannt sein",
      "hinauslaufen",
      "hinweisen",
      "hoffen",
      "Lust haben",
      "neugierig sein",
      "pochen",
      "reagieren",
      "Rücksicht nehmen",
      "schießen",
      "schwören",
      "sich auswirken",
      "sich berufen",
      "sich beschränken",
      "sich beziehen",
      "sich einigen",
      "sich einlassen",
      "sich einstellen",
      "sich freuen",
      "sich konzentrieren",
      "sich spezialisieren",
      "sich stürzen",
      "sich stützen",
      "sich verlassen",
      "sich vorbereiten",
      "stolz sein",
      "trinken",
      "vertrauen",
      "verzichten",
      "warten",
      "Wert legen",
      "zielen",
      "zurückführen",
      "zurückkommen"
    ],
    "in +A": [
      "einführen",
      "eingreifen",
      "einteilen",
      "einwilligen",
      "geraten",
      "investieren",
      "sich einarbeiten",
      "sich einmischen",
      "sich stürzen",
      "sich verlieben",
      "sich verwandeln",
      "umrechnen",
      "verwickeln",
      "übersetzen"
    ],
    "auf +D": [
      "aufbauen",
      "basieren",
      "beharren",
      "beruhen",
      "bestehen",
      "fußen"
    ],
    "aus +D": [
      "bestehen",
      "entstehen",
      "folgen",
      "lernen",
      "machen",
      "resultieren",
      "schließen",
      "sich ergeben",
      "sich zusammensetzen",
      "stammen",
      "werden",
      "übersetzen"
    ],
    "in +D": [
      "bestehen",
      "erfahren sein",
      "gut sein",
      "sich auskennen",
      "sich irren",
      "sich täuschen",
      "sich unterscheiden",
      "sich üben",
      "unterrichten",
      "übereinstimmen"
    ],
    "für +A": [
      "ausgeben",
      "bekannt sein",
      "bürgen",
      "dankbar sein",
      "danken",
      "geeignet sein",
      "gelten",
      "halten",
      "Interesse zeigen",
      "kämpfen",
      "plädieren",
      "schwärmen",
      "sich bedanken",
      "sich begeistern",
      "sich eignen",
      "sich einsetzen",
      "sich engagieren",
      "sich entscheiden",
      "sich entschuldigen",
      "sich interessieren",
      "sich schämen",
      "sorgen",
      "stimmen",
      "typisch sein",
      "verantwortlich sein",
      "Verständnis haben",
      "werben",
      "wichtig sein",
      "Zeit haben"
    ],
    "um +A": [
      "beneiden",
      "betrügen",
      "bitten",
      "bringen",
      "ersuchen",
      "gehen",
      "kämpfen",
      "sich bemühen",
      "sich bewerben",
      "sich drehen",
      "sich handeln",
      "sich kümmern",
      "sich sorgen",
      "sich Sorgen machen",
      "sich streiten",
      "trauern",
      "wetten"
    ],
    "durch +A": [
      "ersetzen",
      "gekennzeichnet sein",
      "sich auszeichnen",
      "teilen"
    ],
    "zu +D": [
      "auffordern",
      "beitragen",
      "bereit sein",
      "dienen",
      "einladen",
      "ernennen",
      "freundlich sein",
      "fähig sein",
      "führen",
      "gehören",
      "gratulieren",
      "kommen",
      "neigen",
      "nett sein",
      "passen",
      "raten",
      "sich bekennen",
      "sich eignen",
      "sich entschließen",
      "sich entwickeln",
      "sich äußern",
      "Stellung nehmen",
      "taugen",
      "verhelfen",
      "Vertrauen haben",
      "verurteilen",
      "werden",
      "wählen",
      "zwingen",
      "zählen",
      "überreden"
    ],
    "von +D": [
      "abhängen",
      "abhängig sein",
      "abraten",
      "absehen",
      "abweichen",
      "ausgehen",
      "befreien",
      "begeistert sein",
      "berichten",
      "enttäuscht sein",
      "erzählen",
      "halten",
      "handeln",
      "hören",
      "leben",
      "profitieren",
      "sich distanzieren",
      "sich erholen",
      "sich ernähren",
      "sich trennen",
      "sich unterscheiden",
      "sich verabschieden",
      "sprechen",
      "träumen",
      "wimmeln",
      "wissen",
      "zeugen",
      "überzeugen",
      "überzeugt sein"
    ],
    "vor +D": [
      "Angst haben",
      "bewahren",
      "erschrecken",
      "fliehen",
      "kapitulieren",
      "Respekt haben",
      "retten",
      "schützen",
      "sich ekeln",
      "sich fürchten",
      "sich hüten",
      "sich schämen",
      "sich verstecken",
      "sicher sein",
      "warnen",
      "zittern"
    ],
    "mit +D": [
      "anfangen",
      "aufhören",
      "beginnen",
      "einverstanden sein",
      "experimentieren",
      "rechnen",
      "sich abfinden",
      "sich anfreunden",
      "sich auseinandersetzen",
      "sich befassen",
      "sich begnügen",
      "sich beschäftigen",
      "sich identifizieren",
      "sich streiten",
      "sich treffen",
      "sich unterhalten",
      "sich verabreden",
      "sich verstehen",
      "sich versöhnen",
      "sich vertragen",
      "sprechen",
      "telefonieren",
      "umgehen",
      "verbinden",
      "vergleichen",
      "verheiratet sein",
      "versorgen",
      "verwandt sein",
      "zufrieden sein",
      "zusammenhängen",
      "übereinstimmen"
    ]
  },
  "nounVerb": {
    "meta": {
      "language": "de",
      "sourceField": "german",
      "totalVerbs": 148,
      "totalExamples": 339,
      "prepositionOrder": [
        "machen",
        "haben",
        "nehmen",
        "bringen",
        "leisten",
        "stellen",
        "ziehen",
        "finden",
        "führen",
        "geben",
        "halten",
        "ergreifen",
        "ablegen",
        "eingehen",
        "fassen",
        "schenken",
        "schließen",
        "treten",
        "erhalten",
        "erheben",
        "erteilen",
        "erzielen",
        "lösen",
        "setzen",
        "stehen",
        "tragen",
        "zeigen",
        "äußern",
        "belegen",
        "einlegen",
        "erregen",
        "holen",
        "kündigen",
        "sammeln",
        "treiben",
        "widmen",
        "zahlen",
        "absagen",
        "beimessen",
        "bestehen",
        "bezahlen",
        "erreichen",
        "fällen",
        "hegen",
        "hören",
        "kommen",
        "laufen",
        "legen",
        "nutzen",
        "schreiben",
        "schöpfen",
        "spielen",
        "treffen",
        "verdienen",
        "vereinbaren",
        "wissen",
        "üben",
        "übernehmen"
      ],
      "title": "名词—动词固定搭配（Funktionsverbgefüge）",
      "note": "本子集以名词为词条、以功能动词为“介词”轴，结构与主数据集完全一致。",
      "licenses": [
        "Tatoeba CC BY 2.0 FR",
        "Dimenticato (authored)"
      ]
    },
    "verbs": {
      "Entscheidung": {
        "display": "Entscheidung",
        "prepositions": {
          "treffen": [
            "eine Entscheidung treffen. 做出决定"
          ],
          "fällen": [
            "eine Entscheidung fällen. 作出裁决"
          ]
        },
        "prepositionOrder": [
          "treffen",
          "fällen"
        ],
        "entries": [
          {
            "noun": "Entscheidung",
            "verb": "treffen",
            "english": "to make a decision",
            "chinese": "做出决定",
            "pattern": "eine Entscheidung treffen",
            "patternChinese": "做出决定",
            "level": "B1",
            "examples": [
              {
                "de": "eine Entscheidung treffen",
                "zh": "做出决定",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Entscheidung",
            "verb": "fällen",
            "english": "to render a decision",
            "chinese": "作出裁决",
            "pattern": "eine Entscheidung fällen",
            "patternChinese": "作出裁决",
            "level": "C1",
            "examples": [
              {
                "de": "eine Entscheidung fällen",
                "zh": "作出裁决",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Frage": {
        "display": "Frage",
        "prepositions": {
          "stellen": [
            "eine Frage stellen. 提问",
            "Sie stellte ihm Fragen. 她问了他问题。",
            "Stellen Sie ruhig Fragen! 尽管提问。",
            "Ich stelle ständig Fragen. 我总是问问题。",
            "etwas in Frage stellen. 对某事提出质疑"
          ],
          "kommen": [
            "in Frage kommen. 可以考虑",
            "Das kommt nicht in Frage! 不可能！",
            "Ein so teures Auto zu kaufen kommt gar nicht in Frage! 根本不可能买到这么贵的车子。"
          ]
        },
        "prepositionOrder": [
          "stellen",
          "kommen"
        ],
        "entries": [
          {
            "noun": "Frage",
            "verb": "stellen",
            "english": "to ask a question",
            "chinese": "提问",
            "pattern": "eine Frage stellen",
            "patternChinese": "提问",
            "level": "A2",
            "examples": [
              {
                "de": "eine Frage stellen",
                "zh": "提问",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Sie stellte ihm Fragen.",
                "zh": "她问了他问题。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Stellen Sie ruhig Fragen!",
                "zh": "尽管提问。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich stelle ständig Fragen.",
                "zh": "我总是问问题。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Frage",
            "verb": "kommen",
            "english": "to be an option",
            "chinese": "可以考虑",
            "pattern": "in Frage kommen",
            "patternChinese": "可以考虑",
            "level": "B2",
            "examples": [
              {
                "de": "in Frage kommen",
                "zh": "可以考虑",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Das kommt nicht in Frage!",
                "zh": "不可能！",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ein so teures Auto zu kaufen kommt gar nicht in Frage!",
                "zh": "根本不可能买到这么贵的车子。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Frage",
            "verb": "stellen",
            "english": "to call into question",
            "chinese": "提出质疑",
            "pattern": "etwas in Frage stellen",
            "patternChinese": "对某事提出质疑",
            "level": "B2",
            "examples": [
              {
                "de": "etwas in Frage stellen",
                "zh": "对某事提出质疑",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Antrag": {
        "display": "Antrag",
        "prepositions": {
          "stellen": [
            "einen Antrag stellen. 提出申请"
          ]
        },
        "prepositionOrder": [
          "stellen"
        ],
        "entries": [
          {
            "noun": "Antrag",
            "verb": "stellen",
            "english": "to file an application",
            "chinese": "提出申请",
            "pattern": "einen Antrag stellen",
            "patternChinese": "提出申请",
            "level": "B2",
            "examples": [
              {
                "de": "einen Antrag stellen",
                "zh": "提出申请",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Kritik": {
        "display": "Kritik",
        "prepositions": {
          "üben": [
            "Kritik üben. 提出批评",
            "Nach Toms Tod getraute sich aus Rücksicht niemand mehr, an Maria Kritik zu üben. 汤姆死后，出于考虑没有人再批评玛利亚了。"
          ],
          "äußern": [
            "Kritik äußern. 提出批评"
          ]
        },
        "prepositionOrder": [
          "üben",
          "äußern"
        ],
        "entries": [
          {
            "noun": "Kritik",
            "verb": "üben",
            "english": "to criticize",
            "chinese": "提出批评",
            "pattern": "Kritik üben",
            "patternChinese": "提出批评",
            "level": "C1",
            "examples": [
              {
                "de": "Kritik üben",
                "zh": "提出批评",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Nach Toms Tod getraute sich aus Rücksicht niemand mehr, an Maria Kritik zu üben.",
                "zh": "汤姆死后，出于考虑没有人再批评玛利亚了。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Kritik",
            "verb": "äußern",
            "english": "to voice criticism",
            "chinese": "表达批评",
            "pattern": "Kritik äußern",
            "patternChinese": "提出批评",
            "level": "C1",
            "examples": [
              {
                "de": "Kritik äußern",
                "zh": "提出批评",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Rücksicht": {
        "display": "Rücksicht",
        "prepositions": {
          "nehmen": [
            "Rücksicht nehmen. 体谅别人"
          ]
        },
        "prepositionOrder": [
          "nehmen"
        ],
        "entries": [
          {
            "noun": "Rücksicht",
            "verb": "nehmen",
            "english": "to show consideration",
            "chinese": "体谅",
            "pattern": "Rücksicht nehmen",
            "patternChinese": "体谅别人",
            "level": "B2",
            "examples": [
              {
                "de": "Rücksicht nehmen",
                "zh": "体谅别人",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Abschied": {
        "display": "Abschied",
        "prepositions": {
          "nehmen": [
            "Abschied nehmen. 告别"
          ]
        },
        "prepositionOrder": [
          "nehmen"
        ],
        "entries": [
          {
            "noun": "Abschied",
            "verb": "nehmen",
            "english": "to say farewell",
            "chinese": "告别",
            "pattern": "Abschied nehmen",
            "patternChinese": "告别",
            "level": "B2",
            "examples": [
              {
                "de": "Abschied nehmen",
                "zh": "告别",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Platz": {
        "display": "Platz",
        "prepositions": {
          "nehmen": [
            "Platz nehmen. 请坐",
            "Nehmen Sie bitte Platz. 请坐。",
            "Bitte nehmen Sie Platz. 请坐。",
            "Nehmen Sie bitte Platz! 请坐。"
          ],
          "belegen": [
            "den ersten Platz belegen. 获得第一名"
          ]
        },
        "prepositionOrder": [
          "nehmen",
          "belegen"
        ],
        "entries": [
          {
            "noun": "Platz",
            "verb": "nehmen",
            "english": "to take a seat",
            "chinese": "就座",
            "pattern": "Platz nehmen",
            "patternChinese": "请坐",
            "level": "B1",
            "examples": [
              {
                "de": "Platz nehmen",
                "zh": "请坐",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Nehmen Sie bitte Platz.",
                "zh": "请坐。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Bitte nehmen Sie Platz.",
                "zh": "请坐。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Nehmen Sie bitte Platz!",
                "zh": "请坐。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Platz",
            "verb": "belegen",
            "english": "to take a place (rank)",
            "chinese": "获得名次",
            "pattern": "den ersten Platz belegen",
            "patternChinese": "获得第一名",
            "level": "B2",
            "examples": [
              {
                "de": "den ersten Platz belegen",
                "zh": "获得第一名",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Einfluss": {
        "display": "Einfluss",
        "prepositions": {
          "nehmen": [
            "Einfluss nehmen. 施加影响"
          ]
        },
        "prepositionOrder": [
          "nehmen"
        ],
        "entries": [
          {
            "noun": "Einfluss",
            "verb": "nehmen",
            "english": "to exert influence",
            "chinese": "施加影响",
            "pattern": "Einfluss nehmen",
            "patternChinese": "施加影响",
            "level": "C1",
            "examples": [
              {
                "de": "Einfluss nehmen",
                "zh": "施加影响",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Stellung": {
        "display": "Stellung",
        "prepositions": {
          "nehmen": [
            "Stellung nehmen. 表明立场"
          ]
        },
        "prepositionOrder": [
          "nehmen"
        ],
        "entries": [
          {
            "noun": "Stellung",
            "verb": "nehmen",
            "english": "to state one's position",
            "chinese": "表态",
            "pattern": "Stellung nehmen",
            "patternChinese": "表明立场",
            "level": "C1",
            "examples": [
              {
                "de": "Stellung nehmen",
                "zh": "表明立场",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Urlaub": {
        "display": "Urlaub",
        "prepositions": {
          "nehmen": [
            "Urlaub nehmen. 休假"
          ],
          "machen": [
            "Urlaub machen. 度假",
            "Ich habe im Urlaub nichts gemacht. 在假期中我什么都没有做。"
          ]
        },
        "prepositionOrder": [
          "nehmen",
          "machen"
        ],
        "entries": [
          {
            "noun": "Urlaub",
            "verb": "nehmen",
            "english": "to take leave",
            "chinese": "休假",
            "pattern": "Urlaub nehmen",
            "patternChinese": "休假",
            "level": "B1",
            "examples": [
              {
                "de": "Urlaub nehmen",
                "zh": "休假",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Urlaub",
            "verb": "machen",
            "english": "to go on holiday",
            "chinese": "度假",
            "pattern": "Urlaub machen",
            "patternChinese": "度假",
            "level": "A2",
            "examples": [
              {
                "de": "Urlaub machen",
                "zh": "度假",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich habe im Urlaub nichts gemacht.",
                "zh": "在假期中我什么都没有做。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Rache": {
        "display": "Rache",
        "prepositions": {
          "nehmen": [
            "Rache nehmen. 复仇"
          ]
        },
        "prepositionOrder": [
          "nehmen"
        ],
        "entries": [
          {
            "noun": "Rache",
            "verb": "nehmen",
            "english": "to take revenge",
            "chinese": "复仇",
            "pattern": "Rache nehmen",
            "patternChinese": "复仇",
            "level": "C1",
            "examples": [
              {
                "de": "Rache nehmen",
                "zh": "复仇",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Verantwortung": {
        "display": "Verantwortung",
        "prepositions": {
          "übernehmen": [
            "Verantwortung übernehmen. 承担责任"
          ],
          "tragen": [
            "Verantwortung tragen. 负有责任",
            "Kapitäne tragen die Verantwortung für Schiff und Besatzung. 船长们对他们的船只和船员负有责任。",
            "Eltern tragen die Verantwortung für die Erziehung ihrer Kinder. 父母承担教育子女的责任。"
          ]
        },
        "prepositionOrder": [
          "übernehmen",
          "tragen"
        ],
        "entries": [
          {
            "noun": "Verantwortung",
            "verb": "übernehmen",
            "english": "to take responsibility",
            "chinese": "承担责任",
            "pattern": "Verantwortung übernehmen",
            "patternChinese": "承担责任",
            "level": "B2",
            "examples": [
              {
                "de": "Verantwortung übernehmen",
                "zh": "承担责任",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Verantwortung",
            "verb": "tragen",
            "english": "to bear responsibility",
            "chinese": "负有责任",
            "pattern": "Verantwortung tragen",
            "patternChinese": "负有责任",
            "level": "B2",
            "examples": [
              {
                "de": "Verantwortung tragen",
                "zh": "负有责任",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Kapitäne tragen die Verantwortung für Schiff und Besatzung.",
                "zh": "船长们对他们的船只和船员负有责任。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Eltern tragen die Verantwortung für die Erziehung ihrer Kinder.",
                "zh": "父母承担教育子女的责任。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Aufmerksamkeit": {
        "display": "Aufmerksamkeit",
        "prepositions": {
          "schenken": [
            "jemandem Aufmerksamkeit schenken. 关注某人"
          ],
          "erregen": [
            "Aufmerksamkeit erregen. 引起注意"
          ],
          "widmen": [
            "einer Sache Aufmerksamkeit widmen. 关注某事"
          ]
        },
        "prepositionOrder": [
          "schenken",
          "erregen",
          "widmen"
        ],
        "entries": [
          {
            "noun": "Aufmerksamkeit",
            "verb": "schenken",
            "english": "to pay attention",
            "chinese": "加以关注",
            "pattern": "jemandem Aufmerksamkeit schenken",
            "patternChinese": "关注某人",
            "level": "C1",
            "examples": [
              {
                "de": "jemandem Aufmerksamkeit schenken",
                "zh": "关注某人",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Aufmerksamkeit",
            "verb": "erregen",
            "english": "to attract attention",
            "chinese": "引起注意",
            "pattern": "Aufmerksamkeit erregen",
            "patternChinese": "引起注意",
            "level": "C1",
            "examples": [
              {
                "de": "Aufmerksamkeit erregen",
                "zh": "引起注意",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Aufmerksamkeit",
            "verb": "widmen",
            "english": "to devote attention",
            "chinese": "投入关注",
            "pattern": "einer Sache Aufmerksamkeit widmen",
            "patternChinese": "关注某事",
            "level": "C1",
            "examples": [
              {
                "de": "einer Sache Aufmerksamkeit widmen",
                "zh": "关注某事",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Vertrauen": {
        "display": "Vertrauen",
        "prepositions": {
          "schenken": [
            "jemandem Vertrauen schenken. 信任某人"
          ],
          "fassen": [
            "Vertrauen fassen. 开始信任"
          ]
        },
        "prepositionOrder": [
          "schenken",
          "fassen"
        ],
        "entries": [
          {
            "noun": "Vertrauen",
            "verb": "schenken",
            "english": "to place trust in",
            "chinese": "给予信任",
            "pattern": "jemandem Vertrauen schenken",
            "patternChinese": "信任某人",
            "level": "C1",
            "examples": [
              {
                "de": "jemandem Vertrauen schenken",
                "zh": "信任某人",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Vertrauen",
            "verb": "fassen",
            "english": "to gain confidence",
            "chinese": "产生信任",
            "pattern": "Vertrauen fassen",
            "patternChinese": "开始信任",
            "level": "C1",
            "examples": [
              {
                "de": "Vertrauen fassen",
                "zh": "开始信任",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Glauben": {
        "display": "Glauben",
        "prepositions": {
          "schenken": [
            "einer Aussage Glauben schenken. 相信某种说法",
            "Man sollte dem Wetterbericht nicht allzu viel Glauben schenken. 人们不应当太过相信天气预报。",
            "Den Ergebnissen automatischer Tests sollte man nicht übermäßig Glauben schenken. 不要过分相信自动检测的结果。"
          ]
        },
        "prepositionOrder": [
          "schenken"
        ],
        "entries": [
          {
            "noun": "Glauben",
            "verb": "schenken",
            "english": "to give credence to",
            "chinese": "相信",
            "pattern": "einer Aussage Glauben schenken",
            "patternChinese": "相信某种说法",
            "level": "C1",
            "examples": [
              {
                "de": "einer Aussage Glauben schenken",
                "zh": "相信某种说法",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Man sollte dem Wetterbericht nicht allzu viel Glauben schenken.",
                "zh": "人们不应当太过相信天气预报。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Den Ergebnissen automatischer Tests sollte man nicht übermäßig Glauben schenken.",
                "zh": "不要过分相信自动检测的结果。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Beachtung": {
        "display": "Beachtung",
        "prepositions": {
          "schenken": [
            "einem Hinweis Beachtung schenken. 重视提示",
            "Du musst seinem Rat Beachtung schenken. 你一定要注意他的建议。",
            "Menschen, denen nicht gut zuzureden ist, schenkt man am besten keine Beachtung. 对于那些不讲理的人，不予理会是最好的方式。"
          ],
          "finden": [
            "Beachtung finden. 受到关注"
          ]
        },
        "prepositionOrder": [
          "schenken",
          "finden"
        ],
        "entries": [
          {
            "noun": "Beachtung",
            "verb": "schenken",
            "english": "to pay heed to",
            "chinese": "加以重视",
            "pattern": "einem Hinweis Beachtung schenken",
            "patternChinese": "重视提示",
            "level": "C1",
            "examples": [
              {
                "de": "einem Hinweis Beachtung schenken",
                "zh": "重视提示",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du musst seinem Rat Beachtung schenken.",
                "zh": "你一定要注意他的建议。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Menschen, denen nicht gut zuzureden ist, schenkt man am besten keine Beachtung.",
                "zh": "对于那些不讲理的人，不予理会是最好的方式。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Beachtung",
            "verb": "finden",
            "english": "to receive attention",
            "chinese": "受到关注",
            "pattern": "Beachtung finden",
            "patternChinese": "受到关注",
            "level": "C1",
            "examples": [
              {
                "de": "Beachtung finden",
                "zh": "受到关注",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Rede": {
        "display": "Rede",
        "prepositions": {
          "halten": [
            "eine Rede halten. 发表演讲",
            "Ich halte nie eine Rede, ohne nervös zu sein. 我没有一次演讲的时候是不紧张的。"
          ],
          "stehen": [
            "Rede und Antwort stehen. 作出交代"
          ]
        },
        "prepositionOrder": [
          "halten",
          "stehen"
        ],
        "entries": [
          {
            "noun": "Rede",
            "verb": "halten",
            "english": "to give a speech",
            "chinese": "发表演讲",
            "pattern": "eine Rede halten",
            "patternChinese": "发表演讲",
            "level": "B2",
            "examples": [
              {
                "de": "eine Rede halten",
                "zh": "发表演讲",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich halte nie eine Rede, ohne nervös zu sein.",
                "zh": "我没有一次演讲的时候是不紧张的。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Rede",
            "verb": "stehen",
            "english": "to answer for sth",
            "chinese": "作出交代",
            "pattern": "Rede und Antwort stehen",
            "patternChinese": "作出交代",
            "level": "C1",
            "examples": [
              {
                "de": "Rede und Antwort stehen",
                "zh": "作出交代",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Vortrag": {
        "display": "Vortrag",
        "prepositions": {
          "halten": [
            "einen Vortrag halten. 作报告"
          ]
        },
        "prepositionOrder": [
          "halten"
        ],
        "entries": [
          {
            "noun": "Vortrag",
            "verb": "halten",
            "english": "to give a talk",
            "chinese": "作报告",
            "pattern": "einen Vortrag halten",
            "patternChinese": "作报告",
            "level": "B2",
            "examples": [
              {
                "de": "einen Vortrag halten",
                "zh": "作报告",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Versprechen": {
        "display": "Versprechen",
        "prepositions": {
          "halten": [
            "ein Versprechen halten. 信守承诺",
            "Du solltest dein Versprechen halten. 你应该信守诺言。",
            "Er hat sein Versprechen nicht gehalten. 他没有遵守诺言。",
            "Ich glaube, dass er sein Versprechen halten wird. 我相信他会信守诺言。"
          ]
        },
        "prepositionOrder": [
          "halten"
        ],
        "entries": [
          {
            "noun": "Versprechen",
            "verb": "halten",
            "english": "to keep a promise",
            "chinese": "信守承诺",
            "pattern": "ein Versprechen halten",
            "patternChinese": "信守承诺",
            "level": "B1",
            "examples": [
              {
                "de": "ein Versprechen halten",
                "zh": "信守承诺",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du solltest dein Versprechen halten.",
                "zh": "你应该信守诺言。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Er hat sein Versprechen nicht gehalten.",
                "zh": "他没有遵守诺言。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich glaube, dass er sein Versprechen halten wird.",
                "zh": "我相信他会信守诺言。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Ordnung": {
        "display": "Ordnung",
        "prepositions": {
          "halten": [
            "Ordnung halten. 保持整洁"
          ],
          "bringen": [
            "etwas in Ordnung bringen. 把某物整理好"
          ]
        },
        "prepositionOrder": [
          "halten",
          "bringen"
        ],
        "entries": [
          {
            "noun": "Ordnung",
            "verb": "halten",
            "english": "to keep things tidy",
            "chinese": "保持整洁",
            "pattern": "Ordnung halten",
            "patternChinese": "保持整洁",
            "level": "B1",
            "examples": [
              {
                "de": "Ordnung halten",
                "zh": "保持整洁",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Ordnung",
            "verb": "bringen",
            "english": "to put in order",
            "chinese": "整理",
            "pattern": "etwas in Ordnung bringen",
            "patternChinese": "把某物整理好",
            "level": "B1",
            "examples": [
              {
                "de": "etwas in Ordnung bringen",
                "zh": "把某物整理好",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Diät": {
        "display": "Diät",
        "prepositions": {
          "halten": [
            "Diät halten. 节食",
            "Ich finde, Tom sollte Diät halten. 我觉得汤姆需要减肥了。"
          ]
        },
        "prepositionOrder": [
          "halten"
        ],
        "entries": [
          {
            "noun": "Diät",
            "verb": "halten",
            "english": "to keep to a diet",
            "chinese": "节食",
            "pattern": "Diät halten",
            "patternChinese": "节食",
            "level": "B2",
            "examples": [
              {
                "de": "Diät halten",
                "zh": "节食",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich finde, Tom sollte Diät halten.",
                "zh": "我觉得汤姆需要减肥了。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Frieden": {
        "display": "Frieden",
        "prepositions": {
          "schließen": [
            "Frieden schließen. 讲和"
          ]
        },
        "prepositionOrder": [
          "schließen"
        ],
        "entries": [
          {
            "noun": "Frieden",
            "verb": "schließen",
            "english": "to make peace",
            "chinese": "讲和",
            "pattern": "Frieden schließen",
            "patternChinese": "讲和",
            "level": "C1",
            "examples": [
              {
                "de": "Frieden schließen",
                "zh": "讲和",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Vertrag": {
        "display": "Vertrag",
        "prepositions": {
          "schließen": [
            "einen Vertrag schließen. 签订合同"
          ],
          "kündigen": [
            "einen Vertrag kündigen. 解约"
          ]
        },
        "prepositionOrder": [
          "schließen",
          "kündigen"
        ],
        "entries": [
          {
            "noun": "Vertrag",
            "verb": "schließen",
            "english": "to conclude a contract",
            "chinese": "签订合同",
            "pattern": "einen Vertrag schließen",
            "patternChinese": "签订合同",
            "level": "B2",
            "examples": [
              {
                "de": "einen Vertrag schließen",
                "zh": "签订合同",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Vertrag",
            "verb": "kündigen",
            "english": "to terminate a contract",
            "chinese": "解除合同",
            "pattern": "einen Vertrag kündigen",
            "patternChinese": "解约",
            "level": "B2",
            "examples": [
              {
                "de": "einen Vertrag kündigen",
                "zh": "解约",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Freundschaft": {
        "display": "Freundschaft",
        "prepositions": {
          "schließen": [
            "Freundschaft schließen. 结交朋友",
            "Über das Internet können wir viele Freundschaften schließen. 通过网络，我们可以结交很多朋友。"
          ]
        },
        "prepositionOrder": [
          "schließen"
        ],
        "entries": [
          {
            "noun": "Freundschaft",
            "verb": "schließen",
            "english": "to strike up a friendship",
            "chinese": "结交朋友",
            "pattern": "Freundschaft schließen",
            "patternChinese": "结交朋友",
            "level": "B2",
            "examples": [
              {
                "de": "Freundschaft schließen",
                "zh": "结交朋友",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Über das Internet können wir viele Freundschaften schließen.",
                "zh": "通过网络，我们可以结交很多朋友。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Kompromiss": {
        "display": "Kompromiss",
        "prepositions": {
          "schließen": [
            "einen Kompromiss schließen. 达成妥协",
            "Wir haben versucht, einen Kompromiss mit ihnen zu schließen. 我们试着和他们妥协。"
          ],
          "eingehen": [
            "einen Kompromiss eingehen. 作出妥协"
          ]
        },
        "prepositionOrder": [
          "schließen",
          "eingehen"
        ],
        "entries": [
          {
            "noun": "Kompromiss",
            "verb": "schließen",
            "english": "to reach a compromise",
            "chinese": "达成妥协",
            "pattern": "einen Kompromiss schließen",
            "patternChinese": "达成妥协",
            "level": "C1",
            "examples": [
              {
                "de": "einen Kompromiss schließen",
                "zh": "达成妥协",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Wir haben versucht, einen Kompromiss mit ihnen zu schließen.",
                "zh": "我们试着和他们妥协。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Kompromiss",
            "verb": "eingehen",
            "english": "to accept a compromise",
            "chinese": "接受妥协",
            "pattern": "einen Kompromiss eingehen",
            "patternChinese": "作出妥协",
            "level": "C1",
            "examples": [
              {
                "de": "einen Kompromiss eingehen",
                "zh": "作出妥协",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Antwort": {
        "display": "Antwort",
        "prepositions": {
          "geben": [
            "eine Antwort geben. 给出答复",
            "Tom kann dir morgen eine Antwort geben. 汤姆明天会给你一个答案。",
            "Die Studenten konnten keine Antwort geben. 学生们无法给出一个答案。",
            "Niemand konnte die richtige Antwort geben. 谁也说不出正确答案。"
          ],
          "erhalten": [
            "eine Antwort erhalten. 得到答复"
          ]
        },
        "prepositionOrder": [
          "geben",
          "erhalten"
        ],
        "entries": [
          {
            "noun": "Antwort",
            "verb": "geben",
            "english": "to give an answer",
            "chinese": "给出答复",
            "pattern": "eine Antwort geben",
            "patternChinese": "给出答复",
            "level": "A2",
            "examples": [
              {
                "de": "eine Antwort geben",
                "zh": "给出答复",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Tom kann dir morgen eine Antwort geben.",
                "zh": "汤姆明天会给你一个答案。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Die Studenten konnten keine Antwort geben.",
                "zh": "学生们无法给出一个答案。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Niemand konnte die richtige Antwort geben.",
                "zh": "谁也说不出正确答案。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Antwort",
            "verb": "erhalten",
            "english": "to receive an answer",
            "chinese": "得到答复",
            "pattern": "eine Antwort erhalten",
            "patternChinese": "得到答复",
            "level": "B1",
            "examples": [
              {
                "de": "eine Antwort erhalten",
                "zh": "得到答复",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Auskunft": {
        "display": "Auskunft",
        "prepositions": {
          "geben": [
            "Auskunft geben. 提供信息"
          ],
          "erhalten": [
            "Auskunft erhalten. 获得信息"
          ],
          "erteilen": [
            "Auskunft erteilen. 提供咨询"
          ]
        },
        "prepositionOrder": [
          "geben",
          "erhalten",
          "erteilen"
        ],
        "entries": [
          {
            "noun": "Auskunft",
            "verb": "geben",
            "english": "to give information",
            "chinese": "提供信息",
            "pattern": "Auskunft geben",
            "patternChinese": "提供信息",
            "level": "B2",
            "examples": [
              {
                "de": "Auskunft geben",
                "zh": "提供信息",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Auskunft",
            "verb": "erhalten",
            "english": "to obtain information",
            "chinese": "得到信息",
            "pattern": "Auskunft erhalten",
            "patternChinese": "获得信息",
            "level": "B2",
            "examples": [
              {
                "de": "Auskunft erhalten",
                "zh": "获得信息",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Auskunft",
            "verb": "erteilen",
            "english": "to give information",
            "chinese": "提供咨询",
            "pattern": "Auskunft erteilen",
            "patternChinese": "提供咨询",
            "level": "C1",
            "examples": [
              {
                "de": "Auskunft erteilen",
                "zh": "提供咨询",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Rat": {
        "display": "Rat",
        "prepositions": {
          "geben": [
            "einen Rat geben. 提出建议"
          ],
          "holen": [
            "sich Rat holen. 征求意见"
          ]
        },
        "prepositionOrder": [
          "geben",
          "holen"
        ],
        "entries": [
          {
            "noun": "Rat",
            "verb": "geben",
            "english": "to give advice",
            "chinese": "提出建议",
            "pattern": "einen Rat geben",
            "patternChinese": "提出建议",
            "level": "B1",
            "examples": [
              {
                "de": "einen Rat geben",
                "zh": "提出建议",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Rat",
            "verb": "holen",
            "english": "to seek advice",
            "chinese": "征求意见",
            "pattern": "sich Rat holen",
            "patternChinese": "征求意见",
            "level": "B2",
            "examples": [
              {
                "de": "sich Rat holen",
                "zh": "征求意见",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Mühe": {
        "display": "Mühe",
        "prepositions": {
          "geben": [
            "sich Mühe geben. 努力",
            "Ich habe mir alle Mühe gegeben. 我已经尽力了。",
            "Tom sollte sich mehr Mühe geben. 汤姆应该多努力。",
            "Ich werde mir Mühe geben, dich nicht beim Lernen zu stören. 我会尽量不打扰你复习。"
          ]
        },
        "prepositionOrder": [
          "geben"
        ],
        "entries": [
          {
            "noun": "Mühe",
            "verb": "geben",
            "english": "to make an effort",
            "chinese": "努力",
            "pattern": "sich Mühe geben",
            "patternChinese": "努力",
            "level": "B1",
            "examples": [
              {
                "de": "sich Mühe geben",
                "zh": "努力",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich habe mir alle Mühe gegeben.",
                "zh": "我已经尽力了。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Tom sollte sich mehr Mühe geben.",
                "zh": "汤姆应该多努力。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich werde mir Mühe geben, dich nicht beim Lernen zu stören.",
                "zh": "我会尽量不打扰你复习。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Bescheid": {
        "display": "Bescheid",
        "prepositions": {
          "geben": [
            "Bescheid geben. 告知一声",
            "Gebt uns bitte Bescheid. 请让我们知道。",
            "Wenn du nicht kommen kannst, solltest du mir vorher Bescheid geben. 如果你不能来，你该让我提前知道。"
          ],
          "wissen": [
            "Bescheid wissen. 知情"
          ]
        },
        "prepositionOrder": [
          "geben",
          "wissen"
        ],
        "entries": [
          {
            "noun": "Bescheid",
            "verb": "geben",
            "english": "to let sb know",
            "chinese": "告知",
            "pattern": "Bescheid geben",
            "patternChinese": "告知一声",
            "level": "B1",
            "examples": [
              {
                "de": "Bescheid geben",
                "zh": "告知一声",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Gebt uns bitte Bescheid.",
                "zh": "请让我们知道。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Wenn du nicht kommen kannst, solltest du mir vorher Bescheid geben.",
                "zh": "如果你不能来，你该让我提前知道。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Bescheid",
            "verb": "wissen",
            "english": "to be in the know",
            "chinese": "知情",
            "pattern": "Bescheid wissen",
            "patternChinese": "知情",
            "level": "B2",
            "examples": [
              {
                "de": "Bescheid wissen",
                "zh": "知情",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Erlaubnis": {
        "display": "Erlaubnis",
        "prepositions": {
          "geben": [
            "die Erlaubnis geben. 准许"
          ],
          "erhalten": [
            "die Erlaubnis erhalten. 获得许可"
          ],
          "erteilen": [
            "die Erlaubnis erteilen. 准予"
          ]
        },
        "prepositionOrder": [
          "geben",
          "erhalten",
          "erteilen"
        ],
        "entries": [
          {
            "noun": "Erlaubnis",
            "verb": "geben",
            "english": "to give permission",
            "chinese": "准许",
            "pattern": "die Erlaubnis geben",
            "patternChinese": "准许",
            "level": "B2",
            "examples": [
              {
                "de": "die Erlaubnis geben",
                "zh": "准许",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Erlaubnis",
            "verb": "erhalten",
            "english": "to obtain permission",
            "chinese": "获得许可",
            "pattern": "die Erlaubnis erhalten",
            "patternChinese": "获得许可",
            "level": "B2",
            "examples": [
              {
                "de": "die Erlaubnis erhalten",
                "zh": "获得许可",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Erlaubnis",
            "verb": "erteilen",
            "english": "to grant permission",
            "chinese": "准许",
            "pattern": "die Erlaubnis erteilen",
            "patternChinese": "准予",
            "level": "C1",
            "examples": [
              {
                "de": "die Erlaubnis erteilen",
                "zh": "准予",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Angst": {
        "display": "Angst",
        "prepositions": {
          "haben": [
            "Angst haben. 害怕",
            "Ich habe keine Angst. 我不怕。",
            "Haben Sie keine Angst! 不要害怕。",
            "Sie haben Angst vor mir. 他们怕我。"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Angst",
            "verb": "haben",
            "english": "to be afraid",
            "chinese": "害怕",
            "pattern": "Angst haben",
            "patternChinese": "害怕",
            "level": "A2",
            "examples": [
              {
                "de": "Angst haben",
                "zh": "害怕",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich habe keine Angst.",
                "zh": "我不怕。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Haben Sie keine Angst!",
                "zh": "不要害怕。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Sie haben Angst vor mir.",
                "zh": "他们怕我。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Recht": {
        "display": "Recht",
        "prepositions": {
          "haben": [
            "Recht haben. 说得对",
            "Hab ich nicht Recht? 我错了吗？",
            "Ich habe auch das Recht zu reden. 我也有权讲话。",
            "Ich denke du könntest Recht haben. 我猜想你可能是对的。"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Recht",
            "verb": "haben",
            "english": "to be right",
            "chinese": "说得对",
            "pattern": "Recht haben",
            "patternChinese": "说得对",
            "level": "A2",
            "examples": [
              {
                "de": "Recht haben",
                "zh": "说得对",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Hab ich nicht Recht?",
                "zh": "我错了吗？",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe auch das Recht zu reden.",
                "zh": "我也有权讲话。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich denke du könntest Recht haben.",
                "zh": "我猜想你可能是对的。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Hunger": {
        "display": "Hunger",
        "prepositions": {
          "haben": [
            "Hunger haben. 肚子饿",
            "Ich habe immer Hunger. 我总是饿了。",
            "Mama, ich habe Hunger. 妈妈，我肚子饿了。",
            "Ich hab übelst Hunger. 我肚子饿极了。"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Hunger",
            "verb": "haben",
            "english": "to be hungry",
            "chinese": "饿",
            "pattern": "Hunger haben",
            "patternChinese": "肚子饿",
            "level": "A1",
            "examples": [
              {
                "de": "Hunger haben",
                "zh": "肚子饿",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich habe immer Hunger.",
                "zh": "我总是饿了。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Mama, ich habe Hunger.",
                "zh": "妈妈，我肚子饿了。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich hab übelst Hunger.",
                "zh": "我肚子饿极了。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Zeit": {
        "display": "Zeit",
        "prepositions": {
          "haben": [
            "Zeit haben. 有时间",
            "Heute habe ich Zeit. 我今天有空。",
            "Ich habe keine Zeit. 我没时间。",
            "Wir haben keine Zeit. 我们没时间。"
          ],
          "widmen": [
            "jemandem Zeit widmen. 为某人花时间"
          ]
        },
        "prepositionOrder": [
          "haben",
          "widmen"
        ],
        "entries": [
          {
            "noun": "Zeit",
            "verb": "haben",
            "english": "to have time",
            "chinese": "有空",
            "pattern": "Zeit haben",
            "patternChinese": "有时间",
            "level": "A1",
            "examples": [
              {
                "de": "Zeit haben",
                "zh": "有时间",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Heute habe ich Zeit.",
                "zh": "我今天有空。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe keine Zeit.",
                "zh": "我没时间。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Wir haben keine Zeit.",
                "zh": "我们没时间。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Zeit",
            "verb": "widmen",
            "english": "to devote time",
            "chinese": "投入时间",
            "pattern": "jemandem Zeit widmen",
            "patternChinese": "为某人花时间",
            "level": "C1",
            "examples": [
              {
                "de": "jemandem Zeit widmen",
                "zh": "为某人花时间",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Lust": {
        "display": "Lust",
        "prepositions": {
          "haben": [
            "Lust haben. 想要，有兴致",
            "Ich habe Lust, zu kotzen. 我想吐。",
            "Ich habe Lust auf Nudeln. 我想吃面条了。",
            "Ich habe Lust auf ein Eis. 我想吃冰淇淋了。"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Lust",
            "verb": "haben",
            "english": "to feel like",
            "chinese": "有兴致",
            "pattern": "Lust haben",
            "patternChinese": "想要，有兴致",
            "level": "A2",
            "examples": [
              {
                "de": "Lust haben",
                "zh": "想要，有兴致",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich habe Lust, zu kotzen.",
                "zh": "我想吐。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe Lust auf Nudeln.",
                "zh": "我想吃面条了。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe Lust auf ein Eis.",
                "zh": "我想吃冰淇淋了。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Erfolg": {
        "display": "Erfolg",
        "prepositions": {
          "haben": [
            "Erfolg haben. 取得成功",
            "Sie wird wahrscheinlich Erfolg haben. 她很有可能会有所成就。",
            "Ich bin mir sicher, dass er Erfolg haben wird. 他一定会成功。",
            "Ein arbeitsamer Mensch wird Erfolg haben im Leben. 勤劳的人将获得成功人生。"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Erfolg",
            "verb": "haben",
            "english": "to be successful",
            "chinese": "取得成功",
            "pattern": "Erfolg haben",
            "patternChinese": "取得成功",
            "level": "B1",
            "examples": [
              {
                "de": "Erfolg haben",
                "zh": "取得成功",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Sie wird wahrscheinlich Erfolg haben.",
                "zh": "她很有可能会有所成就。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich bin mir sicher, dass er Erfolg haben wird.",
                "zh": "他一定会成功。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ein arbeitsamer Mensch wird Erfolg haben im Leben.",
                "zh": "勤劳的人将获得成功人生。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Glück": {
        "display": "Glück",
        "prepositions": {
          "haben": [
            "Glück haben. 运气好",
            "Heute hab ich Glück. 我今天运气很好。",
            "Was für ein Glück Sie haben! 您运气多好啊！",
            "Heute habe ich anscheinend kein Glück. 很显然我今天运气不好。"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Glück",
            "verb": "haben",
            "english": "to be lucky",
            "chinese": "走运",
            "pattern": "Glück haben",
            "patternChinese": "运气好",
            "level": "A2",
            "examples": [
              {
                "de": "Glück haben",
                "zh": "运气好",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Heute hab ich Glück.",
                "zh": "我今天运气很好。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Was für ein Glück Sie haben!",
                "zh": "您运气多好啊！",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Heute habe ich anscheinend kein Glück.",
                "zh": "很显然我今天运气不好。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Geduld": {
        "display": "Geduld",
        "prepositions": {
          "haben": [
            "Geduld haben. 有耐心",
            "Ich habe keine Geduld. 我没耐性。",
            "Hab ein bisschen Geduld! 耐心点。",
            "Habt vor allen Dingen Geduld. 尤其是要有耐心。"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Geduld",
            "verb": "haben",
            "english": "to be patient",
            "chinese": "有耐心",
            "pattern": "Geduld haben",
            "patternChinese": "有耐心",
            "level": "B1",
            "examples": [
              {
                "de": "Geduld haben",
                "zh": "有耐心",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich habe keine Geduld.",
                "zh": "我没耐性。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Hab ein bisschen Geduld!",
                "zh": "耐心点。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Habt vor allen Dingen Geduld.",
                "zh": "尤其是要有耐心。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Ahnung": {
        "display": "Ahnung",
        "prepositions": {
          "haben": [
            "keine Ahnung haben. 一无所知",
            "Ich habe keine Ahnung. 我不知道。",
            "Ich habe keine Ahnung, wer sie ist. 我不知道她是谁。",
            "Ich habe keine Ahnung, was zu tun ist. 我不知道该怎么办。"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Ahnung",
            "verb": "haben",
            "english": "to have a clue",
            "chinese": "了解，知道",
            "pattern": "keine Ahnung haben",
            "patternChinese": "一无所知",
            "level": "B1",
            "examples": [
              {
                "de": "keine Ahnung haben",
                "zh": "一无所知",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich habe keine Ahnung.",
                "zh": "我不知道。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe keine Ahnung, wer sie ist.",
                "zh": "我不知道她是谁。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe keine Ahnung, was zu tun ist.",
                "zh": "我不知道该怎么办。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Eile": {
        "display": "Eile",
        "prepositions": {
          "haben": [
            "Es hat keine Eile. 不急"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Eile",
            "verb": "haben",
            "english": "to be in a hurry",
            "chinese": "着急",
            "pattern": "Es hat keine Eile",
            "patternChinese": "不急",
            "level": "B2",
            "examples": [
              {
                "de": "Es hat keine Eile",
                "zh": "不急",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Sorgen": {
        "display": "Sorgen",
        "prepositions": {
          "machen": [
            "sich Sorgen machen. 担心",
            "Was macht dir Sorgen? 你着什么急？",
            "Mach dir keine Sorgen. 别担心。",
            "Wir machen uns Sorgen. 我们很担心。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Sorgen",
            "verb": "machen",
            "english": "to worry",
            "chinese": "担心",
            "pattern": "sich Sorgen machen",
            "patternChinese": "担心",
            "level": "B1",
            "examples": [
              {
                "de": "sich Sorgen machen",
                "zh": "担心",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Was macht dir Sorgen?",
                "zh": "你着什么急？",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Mach dir keine Sorgen.",
                "zh": "别担心。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Wir machen uns Sorgen.",
                "zh": "我们很担心。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Gedanken": {
        "display": "Gedanken",
        "prepositions": {
          "machen": [
            "sich Gedanken machen. 仔细考虑",
            "Du machst dir zu viele Gedanken um dein Gewicht. 你太担心你的体重了。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Gedanken",
            "verb": "machen",
            "english": "to think sth over",
            "chinese": "考虑",
            "pattern": "sich Gedanken machen",
            "patternChinese": "仔细考虑",
            "level": "B2",
            "examples": [
              {
                "de": "sich Gedanken machen",
                "zh": "仔细考虑",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du machst dir zu viele Gedanken um dein Gewicht.",
                "zh": "你太担心你的体重了。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Vorwürfe": {
        "display": "Vorwürfe",
        "prepositions": {
          "machen": [
            "jemandem Vorwürfe machen. 责备某人",
            "Sie machte mir bittere Vorwürfe. 她严厉地指责我。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Vorwürfe",
            "verb": "machen",
            "english": "to reproach",
            "chinese": "责备",
            "pattern": "jemandem Vorwürfe machen",
            "patternChinese": "责备某人",
            "level": "C1",
            "examples": [
              {
                "de": "jemandem Vorwürfe machen",
                "zh": "责备某人",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Sie machte mir bittere Vorwürfe.",
                "zh": "她严厉地指责我。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Mut": {
        "display": "Mut",
        "prepositions": {
          "machen": [
            "jemandem Mut machen. 给某人鼓劲",
            "Mutter macht Tee für uns. 母亲给我们沏茶。",
            "Die Mutter machte sich Sorgen um ihre Kinder. 母亲很担心孩子。",
            "Meine Mutter ist dabei einen Kuchen zu machen. 我的母亲在做蛋糕。"
          ],
          "fassen": [
            "Mut fassen. 鼓起勇气"
          ]
        },
        "prepositionOrder": [
          "machen",
          "fassen"
        ],
        "entries": [
          {
            "noun": "Mut",
            "verb": "machen",
            "english": "to encourage",
            "chinese": "鼓励",
            "pattern": "jemandem Mut machen",
            "patternChinese": "给某人鼓劲",
            "level": "B2",
            "examples": [
              {
                "de": "jemandem Mut machen",
                "zh": "给某人鼓劲",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Mutter macht Tee für uns.",
                "zh": "母亲给我们沏茶。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Die Mutter machte sich Sorgen um ihre Kinder.",
                "zh": "母亲很担心孩子。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Meine Mutter ist dabei einen Kuchen zu machen.",
                "zh": "我的母亲在做蛋糕。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Mut",
            "verb": "fassen",
            "english": "to pluck up courage",
            "chinese": "鼓起勇气",
            "pattern": "Mut fassen",
            "patternChinese": "鼓起勇气",
            "level": "C1",
            "examples": [
              {
                "de": "Mut fassen",
                "zh": "鼓起勇气",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Spaß": {
        "display": "Spaß",
        "prepositions": {
          "machen": [
            "Das macht Spaß. 这很有趣",
            "Ich mache nur Spaß. 我开玩笑。",
            "Es hat viel Spaß gemacht. 它很好玩。",
            "Seereisen machen großen Spaß. 海上旅行很有趣。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Spaß",
            "verb": "machen",
            "english": "to be fun",
            "chinese": "使人开心",
            "pattern": "Das macht Spaß",
            "patternChinese": "这很有趣",
            "level": "A2",
            "examples": [
              {
                "de": "Das macht Spaß",
                "zh": "这很有趣",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich mache nur Spaß.",
                "zh": "我开玩笑。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Es hat viel Spaß gemacht.",
                "zh": "它很好玩。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Seereisen machen großen Spaß.",
                "zh": "海上旅行很有趣。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Fehler": {
        "display": "Fehler",
        "prepositions": {
          "machen": [
            "einen Fehler machen. 犯错误",
            "Du machst immer Fehler. 你总是犯错。",
            "Den Fehler machen viele. 很多人都会犯这个错。",
            "Jeder kann Fehler machen. 谁都会犯错。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Fehler",
            "verb": "machen",
            "english": "to make a mistake",
            "chinese": "犯错",
            "pattern": "einen Fehler machen",
            "patternChinese": "犯错误",
            "level": "A2",
            "examples": [
              {
                "de": "einen Fehler machen",
                "zh": "犯错误",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du machst immer Fehler.",
                "zh": "你总是犯错。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Den Fehler machen viele.",
                "zh": "很多人都会犯这个错。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Jeder kann Fehler machen.",
                "zh": "谁都会犯错。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Fortschritte": {
        "display": "Fortschritte",
        "prepositions": {
          "machen": [
            "Fortschritte machen. 取得进步",
            "Du hast Fortschritte gemacht. 你进步了。",
            "Sie macht Fortschritte in Chinesisch. 她中文有进步。",
            "Sein Englisch macht große Fortschritte. 他的英语很有进步。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Fortschritte",
            "verb": "machen",
            "english": "to make progress",
            "chinese": "取得进步",
            "pattern": "Fortschritte machen",
            "patternChinese": "取得进步",
            "level": "B1",
            "examples": [
              {
                "de": "Fortschritte machen",
                "zh": "取得进步",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du hast Fortschritte gemacht.",
                "zh": "你进步了。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Sie macht Fortschritte in Chinesisch.",
                "zh": "她中文有进步。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Sein Englisch macht große Fortschritte.",
                "zh": "他的英语很有进步。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Ernst": {
        "display": "Ernst",
        "prepositions": {
          "machen": [
            "Ernst machen. 说到做到"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Ernst",
            "verb": "machen",
            "english": "to get serious",
            "chinese": "动真格",
            "pattern": "Ernst machen",
            "patternChinese": "说到做到",
            "level": "C1",
            "examples": [
              {
                "de": "Ernst machen",
                "zh": "说到做到",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Vorschlag": {
        "display": "Vorschlag",
        "prepositions": {
          "machen": [
            "einen Vorschlag machen. 提出建议",
            "Sie hat ihm diesbezüglich einen Vorschlag gemacht. 她就那件事给他提出建议。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Vorschlag",
            "verb": "machen",
            "english": "to make a suggestion",
            "chinese": "提出建议",
            "pattern": "einen Vorschlag machen",
            "patternChinese": "提出建议",
            "level": "B1",
            "examples": [
              {
                "de": "einen Vorschlag machen",
                "zh": "提出建议",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Sie hat ihm diesbezüglich einen Vorschlag gemacht.",
                "zh": "她就那件事给他提出建议。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Kraft": {
        "display": "Kraft",
        "prepositions": {
          "treten": [
            "in Kraft treten. 生效",
            "Das Abkommen wird heute um Mitternacht in Kraft treten. 协议将在今晚午夜生效。"
          ],
          "sammeln": [
            "Kräfte sammeln. 积蓄体力"
          ]
        },
        "prepositionOrder": [
          "treten",
          "sammeln"
        ],
        "entries": [
          {
            "noun": "Kraft",
            "verb": "treten",
            "english": "to come into force",
            "chinese": "生效",
            "pattern": "in Kraft treten",
            "patternChinese": "生效",
            "level": "C1",
            "examples": [
              {
                "de": "in Kraft treten",
                "zh": "生效",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Das Abkommen wird heute um Mitternacht in Kraft treten.",
                "zh": "协议将在今晚午夜生效。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Kraft",
            "verb": "sammeln",
            "english": "to gather strength",
            "chinese": "积蓄力量",
            "pattern": "Kräfte sammeln",
            "patternChinese": "积蓄体力",
            "level": "B2",
            "examples": [
              {
                "de": "Kräfte sammeln",
                "zh": "积蓄体力",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Erscheinung": {
        "display": "Erscheinung",
        "prepositions": {
          "treten": [
            "in Erscheinung treten. 显现出来"
          ]
        },
        "prepositionOrder": [
          "treten"
        ],
        "entries": [
          {
            "noun": "Erscheinung",
            "verb": "treten",
            "english": "to appear",
            "chinese": "显现",
            "pattern": "in Erscheinung treten",
            "patternChinese": "显现出来",
            "level": "C1",
            "examples": [
              {
                "de": "in Erscheinung treten",
                "zh": "显现出来",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Streik": {
        "display": "Streik",
        "prepositions": {
          "treten": [
            "in den Streik treten. 开始罢工"
          ]
        },
        "prepositionOrder": [
          "treten"
        ],
        "entries": [
          {
            "noun": "Streik",
            "verb": "treten",
            "english": "to go on strike",
            "chinese": "举行罢工",
            "pattern": "in den Streik treten",
            "patternChinese": "开始罢工",
            "level": "C1",
            "examples": [
              {
                "de": "in den Streik treten",
                "zh": "开始罢工",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Verbindung": {
        "display": "Verbindung",
        "prepositions": {
          "setzen": [
            "sich in Verbindung setzen. 取得联系",
            "Du solltest mich nicht mit solchen Leuten in Verbindung setzen. 你不应该把我和那样的人联系在一起。",
            "Ich werde mich so bald wie möglich mit ihm in Verbindung setzen. 我会尽快和他联络。"
          ],
          "treten": [
            "mit jemandem in Verbindung treten. 与某人取得联系"
          ]
        },
        "prepositionOrder": [
          "setzen",
          "treten"
        ],
        "entries": [
          {
            "noun": "Verbindung",
            "verb": "setzen",
            "english": "to get in touch",
            "chinese": "取得联系",
            "pattern": "sich in Verbindung setzen",
            "patternChinese": "取得联系",
            "level": "B2",
            "examples": [
              {
                "de": "sich in Verbindung setzen",
                "zh": "取得联系",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du solltest mich nicht mit solchen Leuten in Verbindung setzen.",
                "zh": "你不应该把我和那样的人联系在一起。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich werde mich so bald wie möglich mit ihm in Verbindung setzen.",
                "zh": "我会尽快和他联络。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Verbindung",
            "verb": "treten",
            "english": "to make contact",
            "chinese": "取得联系",
            "pattern": "mit jemandem in Verbindung treten",
            "patternChinese": "与某人取得联系",
            "level": "C1",
            "examples": [
              {
                "de": "mit jemandem in Verbindung treten",
                "zh": "与某人取得联系",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Druck": {
        "display": "Druck",
        "prepositions": {
          "setzen": [
            "jemanden unter Druck setzen. 向某人施压"
          ]
        },
        "prepositionOrder": [
          "setzen"
        ],
        "entries": [
          {
            "noun": "Druck",
            "verb": "setzen",
            "english": "to put under pressure",
            "chinese": "施压",
            "pattern": "jemanden unter Druck setzen",
            "patternChinese": "向某人施压",
            "level": "C1",
            "examples": [
              {
                "de": "jemanden unter Druck setzen",
                "zh": "向某人施压",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Gang": {
        "display": "Gang",
        "prepositions": {
          "setzen": [
            "etwas in Gang setzen. 使某事运转起来",
            "Dieses Gerät wird per Schalter in Gang gesetzt. 这个装置是用开关启动的。",
            "Sie haben es nicht geschafft, ihr Auto in Gang zu setzen. 他们没法发动他们的车。"
          ]
        },
        "prepositionOrder": [
          "setzen"
        ],
        "entries": [
          {
            "noun": "Gang",
            "verb": "setzen",
            "english": "to set in motion",
            "chinese": "启动",
            "pattern": "etwas in Gang setzen",
            "patternChinese": "使某事运转起来",
            "level": "C1",
            "examples": [
              {
                "de": "etwas in Gang setzen",
                "zh": "使某事运转起来",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Dieses Gerät wird per Schalter in Gang gesetzt.",
                "zh": "这个装置是用开关启动的。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Sie haben es nicht geschafft, ihr Auto in Gang zu setzen.",
                "zh": "他们没法发动他们的车。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Betracht": {
        "display": "Betracht",
        "prepositions": {
          "ziehen": [
            "etwas in Betracht ziehen. 考虑某事",
            "Wir können es in Betracht ziehen. 我们可以考虑。"
          ]
        },
        "prepositionOrder": [
          "ziehen"
        ],
        "entries": [
          {
            "noun": "Betracht",
            "verb": "ziehen",
            "english": "to take into consideration",
            "chinese": "加以考虑",
            "pattern": "etwas in Betracht ziehen",
            "patternChinese": "考虑某事",
            "level": "C1",
            "examples": [
              {
                "de": "etwas in Betracht ziehen",
                "zh": "考虑某事",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Wir können es in Betracht ziehen.",
                "zh": "我们可以考虑。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Schluss": {
        "display": "Schluss",
        "prepositions": {
          "ziehen": [
            "einen Schluss ziehen. 得出结论"
          ]
        },
        "prepositionOrder": [
          "ziehen"
        ],
        "entries": [
          {
            "noun": "Schluss",
            "verb": "ziehen",
            "english": "to draw a conclusion",
            "chinese": "得出结论",
            "pattern": "einen Schluss ziehen",
            "patternChinese": "得出结论",
            "level": "C1",
            "examples": [
              {
                "de": "einen Schluss ziehen",
                "zh": "得出结论",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Bilanz": {
        "display": "Bilanz",
        "prepositions": {
          "ziehen": [
            "Bilanz ziehen. 作总结"
          ]
        },
        "prepositionOrder": [
          "ziehen"
        ],
        "entries": [
          {
            "noun": "Bilanz",
            "verb": "ziehen",
            "english": "to take stock",
            "chinese": "作总结",
            "pattern": "Bilanz ziehen",
            "patternChinese": "作总结",
            "level": "C1",
            "examples": [
              {
                "de": "Bilanz ziehen",
                "zh": "作总结",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Konsequenzen": {
        "display": "Konsequenzen",
        "prepositions": {
          "ziehen": [
            "Konsequenzen ziehen. 吸取教训"
          ]
        },
        "prepositionOrder": [
          "ziehen"
        ],
        "entries": [
          {
            "noun": "Konsequenzen",
            "verb": "ziehen",
            "english": "to draw consequences",
            "chinese": "采取相应措施",
            "pattern": "Konsequenzen ziehen",
            "patternChinese": "吸取教训",
            "level": "C1",
            "examples": [
              {
                "de": "Konsequenzen ziehen",
                "zh": "吸取教训",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Verfügung": {
        "display": "Verfügung",
        "prepositions": {
          "stehen": [
            "zur Verfügung stehen. 可供使用"
          ],
          "stellen": [
            "zur Verfügung stellen. 提供使用",
            "Stellen Sie bitte Kontaktdaten zur Verfügung. 请提供联系方式。",
            "Die Firma stellt ihnen Uniformen zur Verfügung. 公司为他们提供制服。"
          ]
        },
        "prepositionOrder": [
          "stehen",
          "stellen"
        ],
        "entries": [
          {
            "noun": "Verfügung",
            "verb": "stehen",
            "english": "to be available",
            "chinese": "可供使用",
            "pattern": "zur Verfügung stehen",
            "patternChinese": "可供使用",
            "level": "B2",
            "examples": [
              {
                "de": "zur Verfügung stehen",
                "zh": "可供使用",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Verfügung",
            "verb": "stellen",
            "english": "to make available",
            "chinese": "提供",
            "pattern": "zur Verfügung stellen",
            "patternChinese": "提供使用",
            "level": "B2",
            "examples": [
              {
                "de": "zur Verfügung stellen",
                "zh": "提供使用",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Stellen Sie bitte Kontaktdaten zur Verfügung.",
                "zh": "请提供联系方式。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Die Firma stellt ihnen Uniformen zur Verfügung.",
                "zh": "公司为他们提供制服。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Debatte": {
        "display": "Debatte",
        "prepositions": {
          "stehen": [
            "zur Debatte stehen. 正在讨论中"
          ]
        },
        "prepositionOrder": [
          "stehen"
        ],
        "entries": [
          {
            "noun": "Debatte",
            "verb": "stehen",
            "english": "to be under discussion",
            "chinese": "正在讨论中",
            "pattern": "zur Debatte stehen",
            "patternChinese": "正在讨论中",
            "level": "C1",
            "examples": [
              {
                "de": "zur Debatte stehen",
                "zh": "正在讨论中",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Wort": {
        "display": "Wort",
        "prepositions": {
          "halten": [
            "sein Wort halten. 说话算数",
            "Er hat nicht Wort gehalten. 他没有遵守诺言。",
            "Er hat sein Wort nicht gehalten. 他没有遵守诺言。",
            "Ich habe mein Wort immer gehalten. 我一直信守我的诺言。"
          ],
          "ergreifen": [
            "das Wort ergreifen. 开始发言"
          ]
        },
        "prepositionOrder": [
          "halten",
          "ergreifen"
        ],
        "entries": [
          {
            "noun": "Wort",
            "verb": "halten",
            "english": "to keep one's word",
            "chinese": "守信",
            "pattern": "sein Wort halten",
            "patternChinese": "说话算数",
            "level": "B2",
            "examples": [
              {
                "de": "sein Wort halten",
                "zh": "说话算数",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Er hat nicht Wort gehalten.",
                "zh": "他没有遵守诺言。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Er hat sein Wort nicht gehalten.",
                "zh": "他没有遵守诺言。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe mein Wort immer gehalten.",
                "zh": "我一直信守我的诺言。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Wort",
            "verb": "ergreifen",
            "english": "to take the floor",
            "chinese": "发言",
            "pattern": "das Wort ergreifen",
            "patternChinese": "开始发言",
            "level": "C1",
            "examples": [
              {
                "de": "das Wort ergreifen",
                "zh": "开始发言",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Maßnahmen": {
        "display": "Maßnahmen",
        "prepositions": {
          "ergreifen": [
            "Maßnahmen ergreifen. 采取措施",
            "Die Regierung wird drastische Maßnahmen ergreifen müssen, um das Problem zu lösen. 政府将采取强制措施来解决这一问题。"
          ]
        },
        "prepositionOrder": [
          "ergreifen"
        ],
        "entries": [
          {
            "noun": "Maßnahmen",
            "verb": "ergreifen",
            "english": "to take measures",
            "chinese": "采取措施",
            "pattern": "Maßnahmen ergreifen",
            "patternChinese": "采取措施",
            "level": "C1",
            "examples": [
              {
                "de": "Maßnahmen ergreifen",
                "zh": "采取措施",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Die Regierung wird drastische Maßnahmen ergreifen müssen, um das Problem zu lösen.",
                "zh": "政府将采取强制措施来解决这一问题。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Initiative": {
        "display": "Initiative",
        "prepositions": {
          "ergreifen": [
            "die Initiative ergreifen. 主动行动"
          ]
        },
        "prepositionOrder": [
          "ergreifen"
        ],
        "entries": [
          {
            "noun": "Initiative",
            "verb": "ergreifen",
            "english": "to take the initiative",
            "chinese": "主动行动",
            "pattern": "die Initiative ergreifen",
            "patternChinese": "主动行动",
            "level": "C1",
            "examples": [
              {
                "de": "die Initiative ergreifen",
                "zh": "主动行动",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Anspruch": {
        "display": "Anspruch",
        "prepositions": {
          "nehmen": [
            "etwas in Anspruch nehmen. 利用某物",
            "Wie viel Zeit wird es in Anspruch nehmen? 会花多长时间呢？"
          ],
          "erheben": [
            "Anspruch erheben. 提出权利要求"
          ]
        },
        "prepositionOrder": [
          "nehmen",
          "erheben"
        ],
        "entries": [
          {
            "noun": "Anspruch",
            "verb": "nehmen",
            "english": "to make use of",
            "chinese": "占用，利用",
            "pattern": "etwas in Anspruch nehmen",
            "patternChinese": "利用某物",
            "level": "C1",
            "examples": [
              {
                "de": "etwas in Anspruch nehmen",
                "zh": "利用某物",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Wie viel Zeit wird es in Anspruch nehmen?",
                "zh": "会花多长时间呢？",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Anspruch",
            "verb": "erheben",
            "english": "to lay claim to",
            "chinese": "提出要求",
            "pattern": "Anspruch erheben",
            "patternChinese": "提出权利要求",
            "level": "C1",
            "examples": [
              {
                "de": "Anspruch erheben",
                "zh": "提出权利要求",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Einspruch": {
        "display": "Einspruch",
        "prepositions": {
          "erheben": [
            "Einspruch erheben. 提出异议"
          ]
        },
        "prepositionOrder": [
          "erheben"
        ],
        "entries": [
          {
            "noun": "Einspruch",
            "verb": "erheben",
            "english": "to raise an objection",
            "chinese": "提出异议",
            "pattern": "Einspruch erheben",
            "patternChinese": "提出异议",
            "level": "C1",
            "examples": [
              {
                "de": "Einspruch erheben",
                "zh": "提出异议",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Klage": {
        "display": "Klage",
        "prepositions": {
          "erheben": [
            "Klage erheben. 提起诉讼"
          ]
        },
        "prepositionOrder": [
          "erheben"
        ],
        "entries": [
          {
            "noun": "Klage",
            "verb": "erheben",
            "english": "to bring an action",
            "chinese": "提起诉讼",
            "pattern": "Klage erheben",
            "patternChinese": "提起诉讼",
            "level": "C1",
            "examples": [
              {
                "de": "Klage erheben",
                "zh": "提起诉讼",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Ausdruck": {
        "display": "Ausdruck",
        "prepositions": {
          "bringen": [
            "etwas zum Ausdruck bringen. 表达某事"
          ],
          "finden": [
            "Ausdruck finden. 得以表达"
          ]
        },
        "prepositionOrder": [
          "bringen",
          "finden"
        ],
        "entries": [
          {
            "noun": "Ausdruck",
            "verb": "bringen",
            "english": "to express",
            "chinese": "表达",
            "pattern": "etwas zum Ausdruck bringen",
            "patternChinese": "表达某事",
            "level": "C1",
            "examples": [
              {
                "de": "etwas zum Ausdruck bringen",
                "zh": "表达某事",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Ausdruck",
            "verb": "finden",
            "english": "to find expression",
            "chinese": "得到表达",
            "pattern": "Ausdruck finden",
            "patternChinese": "得以表达",
            "level": "C1",
            "examples": [
              {
                "de": "Ausdruck finden",
                "zh": "得以表达",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Sprache": {
        "display": "Sprache",
        "prepositions": {
          "bringen": [
            "etwas zur Sprache bringen. 把某事提出来讨论"
          ]
        },
        "prepositionOrder": [
          "bringen"
        ],
        "entries": [
          {
            "noun": "Sprache",
            "verb": "bringen",
            "english": "to bring up a topic",
            "chinese": "谈及",
            "pattern": "etwas zur Sprache bringen",
            "patternChinese": "把某事提出来讨论",
            "level": "C1",
            "examples": [
              {
                "de": "etwas zur Sprache bringen",
                "zh": "把某事提出来讨论",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Ende": {
        "display": "Ende",
        "prepositions": {
          "bringen": [
            "etwas zu Ende bringen. 把某事做完",
            "Ich beabsichtige, das Projekt zu Ende zu bringen. 我打算完成这个项目。",
            "Wir müssen diese Aufgabe gemeinsam zu Ende bringen. 我们必须一起完成这个任务。",
            "Wir haben wahrscheinlich nicht genug Zeit, das heute zu Ende zu bringen. 我们应该不够时间在今天之内完成它。"
          ]
        },
        "prepositionOrder": [
          "bringen"
        ],
        "entries": [
          {
            "noun": "Ende",
            "verb": "bringen",
            "english": "to bring to an end",
            "chinese": "完成",
            "pattern": "etwas zu Ende bringen",
            "patternChinese": "把某事做完",
            "level": "B2",
            "examples": [
              {
                "de": "etwas zu Ende bringen",
                "zh": "把某事做完",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich beabsichtige, das Projekt zu Ende zu bringen.",
                "zh": "我打算完成这个项目。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Wir müssen diese Aufgabe gemeinsam zu Ende bringen.",
                "zh": "我们必须一起完成这个任务。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Wir haben wahrscheinlich nicht genug Zeit, das heute zu Ende zu bringen.",
                "zh": "我们应该不够时间在今天之内完成它。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Opfer": {
        "display": "Opfer",
        "prepositions": {
          "bringen": [
            "Opfer bringen. 作出牺牲"
          ]
        },
        "prepositionOrder": [
          "bringen"
        ],
        "entries": [
          {
            "noun": "Opfer",
            "verb": "bringen",
            "english": "to make a sacrifice",
            "chinese": "作出牺牲",
            "pattern": "Opfer bringen",
            "patternChinese": "作出牺牲",
            "level": "C1",
            "examples": [
              {
                "de": "Opfer bringen",
                "zh": "作出牺牲",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Gefahr": {
        "display": "Gefahr",
        "prepositions": {
          "laufen": [
            "Gefahr laufen. 有…的危险"
          ],
          "bringen": [
            "jemanden in Gefahr bringen. 使某人陷入危险",
            "Das wird dich in Gefahr bringen. 那将会使你处于危险。"
          ]
        },
        "prepositionOrder": [
          "laufen",
          "bringen"
        ],
        "entries": [
          {
            "noun": "Gefahr",
            "verb": "laufen",
            "english": "to run the risk",
            "chinese": "冒…的风险",
            "pattern": "Gefahr laufen",
            "patternChinese": "有…的危险",
            "level": "C1",
            "examples": [
              {
                "de": "Gefahr laufen",
                "zh": "有…的危险",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Gefahr",
            "verb": "bringen",
            "english": "to endanger",
            "chinese": "使陷入危险",
            "pattern": "jemanden in Gefahr bringen",
            "patternChinese": "使某人陷入危险",
            "level": "B2",
            "examples": [
              {
                "de": "jemanden in Gefahr bringen",
                "zh": "使某人陷入危险",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Das wird dich in Gefahr bringen.",
                "zh": "那将会使你处于危险。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Rechnung": {
        "display": "Rechnung",
        "prepositions": {
          "tragen": [
            "einer Sache Rechnung tragen. 考虑到某事"
          ],
          "bezahlen": [
            "die Rechnung bezahlen. 结账",
            "Tom bezahlte die Rechnung. 汤姆付了账单。",
            "Ich bezahlte die Rechnung. 我买了单。",
            "Ich habe die Rechnung bezahlt. 我买了单。"
          ],
          "stellen": [
            "eine Rechnung stellen. 开具账单"
          ]
        },
        "prepositionOrder": [
          "tragen",
          "bezahlen",
          "stellen"
        ],
        "entries": [
          {
            "noun": "Rechnung",
            "verb": "tragen",
            "english": "to take account of",
            "chinese": "顾及",
            "pattern": "einer Sache Rechnung tragen",
            "patternChinese": "考虑到某事",
            "level": "C1",
            "examples": [
              {
                "de": "einer Sache Rechnung tragen",
                "zh": "考虑到某事",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Rechnung",
            "verb": "bezahlen",
            "english": "to pay the bill",
            "chinese": "付账",
            "pattern": "die Rechnung bezahlen",
            "patternChinese": "结账",
            "level": "A2",
            "examples": [
              {
                "de": "die Rechnung bezahlen",
                "zh": "结账",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Tom bezahlte die Rechnung.",
                "zh": "汤姆付了账单。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich bezahlte die Rechnung.",
                "zh": "我买了单。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe die Rechnung bezahlt.",
                "zh": "我买了单。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Rechnung",
            "verb": "stellen",
            "english": "to invoice",
            "chinese": "开账单",
            "pattern": "eine Rechnung stellen",
            "patternChinese": "开具账单",
            "level": "B2",
            "examples": [
              {
                "de": "eine Rechnung stellen",
                "zh": "开具账单",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Sorge": {
        "display": "Sorge",
        "prepositions": {
          "tragen": [
            "Sorge tragen. 负责照料"
          ]
        },
        "prepositionOrder": [
          "tragen"
        ],
        "entries": [
          {
            "noun": "Sorge",
            "verb": "tragen",
            "english": "to see to it",
            "chinese": "负责",
            "pattern": "Sorge tragen",
            "patternChinese": "负责照料",
            "level": "C1",
            "examples": [
              {
                "de": "Sorge tragen",
                "zh": "负责照料",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Bedeutung": {
        "display": "Bedeutung",
        "prepositions": {
          "beimessen": [
            "einer Sache Bedeutung beimessen. 重视某事"
          ]
        },
        "prepositionOrder": [
          "beimessen"
        ],
        "entries": [
          {
            "noun": "Bedeutung",
            "verb": "beimessen",
            "english": "to attach importance",
            "chinese": "赋予意义",
            "pattern": "einer Sache Bedeutung beimessen",
            "patternChinese": "重视某事",
            "level": "C1",
            "examples": [
              {
                "de": "einer Sache Bedeutung beimessen",
                "zh": "重视某事",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Anwendung": {
        "display": "Anwendung",
        "prepositions": {
          "finden": [
            "Anwendung finden. 得到应用"
          ]
        },
        "prepositionOrder": [
          "finden"
        ],
        "entries": [
          {
            "noun": "Anwendung",
            "verb": "finden",
            "english": "to be applied",
            "chinese": "得到应用",
            "pattern": "Anwendung finden",
            "patternChinese": "得到应用",
            "level": "C1",
            "examples": [
              {
                "de": "Anwendung finden",
                "zh": "得到应用",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Zustimmung": {
        "display": "Zustimmung",
        "prepositions": {
          "finden": [
            "Zustimmung finden. 获得赞同"
          ]
        },
        "prepositionOrder": [
          "finden"
        ],
        "entries": [
          {
            "noun": "Zustimmung",
            "verb": "finden",
            "english": "to meet with approval",
            "chinese": "获得赞同",
            "pattern": "Zustimmung finden",
            "patternChinese": "获得赞同",
            "level": "C1",
            "examples": [
              {
                "de": "Zustimmung finden",
                "zh": "获得赞同",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Anerkennung": {
        "display": "Anerkennung",
        "prepositions": {
          "finden": [
            "Anerkennung finden. 得到认可"
          ]
        },
        "prepositionOrder": [
          "finden"
        ],
        "entries": [
          {
            "noun": "Anerkennung",
            "verb": "finden",
            "english": "to gain recognition",
            "chinese": "得到认可",
            "pattern": "Anerkennung finden",
            "patternChinese": "得到认可",
            "level": "C1",
            "examples": [
              {
                "de": "Anerkennung finden",
                "zh": "得到认可",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Wunsch": {
        "display": "Wunsch",
        "prepositions": {
          "äußern": [
            "einen Wunsch äußern. 说出愿望"
          ]
        },
        "prepositionOrder": [
          "äußern"
        ],
        "entries": [
          {
            "noun": "Wunsch",
            "verb": "äußern",
            "english": "to express a wish",
            "chinese": "表达愿望",
            "pattern": "einen Wunsch äußern",
            "patternChinese": "说出愿望",
            "level": "B2",
            "examples": [
              {
                "de": "einen Wunsch äußern",
                "zh": "说出愿望",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Zweifel": {
        "display": "Zweifel",
        "prepositions": {
          "äußern": [
            "Zweifel äußern. 表示怀疑"
          ],
          "hegen": [
            "Zweifel hegen. 心存疑虑"
          ],
          "ziehen": [
            "etwas in Zweifel ziehen. 对某事表示怀疑"
          ]
        },
        "prepositionOrder": [
          "äußern",
          "hegen",
          "ziehen"
        ],
        "entries": [
          {
            "noun": "Zweifel",
            "verb": "äußern",
            "english": "to express doubts",
            "chinese": "表示怀疑",
            "pattern": "Zweifel äußern",
            "patternChinese": "表示怀疑",
            "level": "C1",
            "examples": [
              {
                "de": "Zweifel äußern",
                "zh": "表示怀疑",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Zweifel",
            "verb": "hegen",
            "english": "to harbour doubts",
            "chinese": "心存怀疑",
            "pattern": "Zweifel hegen",
            "patternChinese": "心存疑虑",
            "level": "C1",
            "examples": [
              {
                "de": "Zweifel hegen",
                "zh": "心存疑虑",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Zweifel",
            "verb": "ziehen",
            "english": "to call into doubt",
            "chinese": "表示怀疑",
            "pattern": "etwas in Zweifel ziehen",
            "patternChinese": "对某事表示怀疑",
            "level": "C1",
            "examples": [
              {
                "de": "etwas in Zweifel ziehen",
                "zh": "对某事表示怀疑",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Hilfe": {
        "display": "Hilfe",
        "prepositions": {
          "leisten": [
            "Hilfe leisten. 提供帮助",
            "Herr Doktor, bitte leisten Sie diesem Kind erste Hilfe. 医生，请给这孩子急救。",
            "Frau Doktor, bitte leisten Sie diesem Kind erste Hilfe. 医生，请给这孩子急救。"
          ]
        },
        "prepositionOrder": [
          "leisten"
        ],
        "entries": [
          {
            "noun": "Hilfe",
            "verb": "leisten",
            "english": "to give assistance",
            "chinese": "给予帮助",
            "pattern": "Hilfe leisten",
            "patternChinese": "提供帮助",
            "level": "B2",
            "examples": [
              {
                "de": "Hilfe leisten",
                "zh": "提供帮助",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Herr Doktor, bitte leisten Sie diesem Kind erste Hilfe.",
                "zh": "医生，请给这孩子急救。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Frau Doktor, bitte leisten Sie diesem Kind erste Hilfe.",
                "zh": "医生，请给这孩子急救。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Widerstand": {
        "display": "Widerstand",
        "prepositions": {
          "leisten": [
            "Widerstand leisten. 进行抵抗"
          ]
        },
        "prepositionOrder": [
          "leisten"
        ],
        "entries": [
          {
            "noun": "Widerstand",
            "verb": "leisten",
            "english": "to put up resistance",
            "chinese": "进行抵抗",
            "pattern": "Widerstand leisten",
            "patternChinese": "进行抵抗",
            "level": "C1",
            "examples": [
              {
                "de": "Widerstand leisten",
                "zh": "进行抵抗",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Arbeit": {
        "display": "Arbeit",
        "prepositions": {
          "leisten": [
            "gute Arbeit leisten. 工作出色",
            "Du hast perfekte Arbeit geleistet. 你做了一项完美的工作。",
            "Tom hat hervorragende Arbeit geleistet. 汤姆做得很出色。",
            "Tom hat ausgezeichnete Arbeit geleistet. 汤姆做得很出色。"
          ]
        },
        "prepositionOrder": [
          "leisten"
        ],
        "entries": [
          {
            "noun": "Arbeit",
            "verb": "leisten",
            "english": "to do work",
            "chinese": "做工作",
            "pattern": "gute Arbeit leisten",
            "patternChinese": "工作出色",
            "level": "B2",
            "examples": [
              {
                "de": "gute Arbeit leisten",
                "zh": "工作出色",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du hast perfekte Arbeit geleistet.",
                "zh": "你做了一项完美的工作。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Tom hat hervorragende Arbeit geleistet.",
                "zh": "汤姆做得很出色。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Tom hat ausgezeichnete Arbeit geleistet.",
                "zh": "汤姆做得很出色。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Beitrag": {
        "display": "Beitrag",
        "prepositions": {
          "leisten": [
            "einen Beitrag leisten. 作出贡献",
            "Jeder kann einen Beitrag leisten. 每个人都有能力作贡献。"
          ]
        },
        "prepositionOrder": [
          "leisten"
        ],
        "entries": [
          {
            "noun": "Beitrag",
            "verb": "leisten",
            "english": "to make a contribution",
            "chinese": "作出贡献",
            "pattern": "einen Beitrag leisten",
            "patternChinese": "作出贡献",
            "level": "B2",
            "examples": [
              {
                "de": "einen Beitrag leisten",
                "zh": "作出贡献",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Jeder kann einen Beitrag leisten.",
                "zh": "每个人都有能力作贡献。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Verzicht": {
        "display": "Verzicht",
        "prepositions": {
          "leisten": [
            "Verzicht leisten. 放弃",
            "auf etwas Verzicht leisten. 放弃某物"
          ]
        },
        "prepositionOrder": [
          "leisten"
        ],
        "entries": [
          {
            "noun": "Verzicht",
            "verb": "leisten",
            "english": "to renounce",
            "chinese": "放弃",
            "pattern": "Verzicht leisten",
            "patternChinese": "放弃",
            "level": "C1",
            "examples": [
              {
                "de": "Verzicht leisten",
                "zh": "放弃",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Verzicht",
            "verb": "leisten",
            "english": "to renounce",
            "chinese": "放弃",
            "pattern": "auf etwas Verzicht leisten",
            "patternChinese": "放弃某物",
            "level": "C1",
            "examples": [
              {
                "de": "auf etwas Verzicht leisten",
                "zh": "放弃某物",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Gesellschaft": {
        "display": "Gesellschaft",
        "prepositions": {
          "leisten": [
            "jemandem Gesellschaft leisten. 陪伴某人"
          ]
        },
        "prepositionOrder": [
          "leisten"
        ],
        "entries": [
          {
            "noun": "Gesellschaft",
            "verb": "leisten",
            "english": "to keep company",
            "chinese": "作陪",
            "pattern": "jemandem Gesellschaft leisten",
            "patternChinese": "陪伴某人",
            "level": "B2",
            "examples": [
              {
                "de": "jemandem Gesellschaft leisten",
                "zh": "陪伴某人",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Interesse": {
        "display": "Interesse",
        "prepositions": {
          "zeigen": [
            "Interesse zeigen. 表现出兴趣"
          ]
        },
        "prepositionOrder": [
          "zeigen"
        ],
        "entries": [
          {
            "noun": "Interesse",
            "verb": "zeigen",
            "english": "to show interest",
            "chinese": "表现出兴趣",
            "pattern": "Interesse zeigen",
            "patternChinese": "表现出兴趣",
            "level": "B1",
            "examples": [
              {
                "de": "Interesse zeigen",
                "zh": "表现出兴趣",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Wirkung": {
        "display": "Wirkung",
        "prepositions": {
          "zeigen": [
            "Wirkung zeigen. 见效"
          ]
        },
        "prepositionOrder": [
          "zeigen"
        ],
        "entries": [
          {
            "noun": "Wirkung",
            "verb": "zeigen",
            "english": "to take effect",
            "chinese": "见效",
            "pattern": "Wirkung zeigen",
            "patternChinese": "见效",
            "level": "B2",
            "examples": [
              {
                "de": "Wirkung zeigen",
                "zh": "见效",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Verständnis": {
        "display": "Verständnis",
        "prepositions": {
          "zeigen": [
            "Verständnis zeigen. 表示理解"
          ]
        },
        "prepositionOrder": [
          "zeigen"
        ],
        "entries": [
          {
            "noun": "Verständnis",
            "verb": "zeigen",
            "english": "to show understanding",
            "chinese": "表示理解",
            "pattern": "Verständnis zeigen",
            "patternChinese": "表示理解",
            "level": "B2",
            "examples": [
              {
                "de": "Verständnis zeigen",
                "zh": "表示理解",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Prüfung": {
        "display": "Prüfung",
        "prepositions": {
          "bestehen": [
            "eine Prüfung bestehen. 通过考试",
            "Ich muss diese Prüfung bestehen. 我必须通过这场考试。",
            "Ich hoffe, dass Mary die Prüfung besteht. 我希望玛丽通过考试。",
            "Arbeite hart, dann wirst du deine Prüfung bestehen. 好好努力，你就能通过考试。"
          ],
          "ablegen": [
            "eine Prüfung ablegen. 参加考试"
          ]
        },
        "prepositionOrder": [
          "bestehen",
          "ablegen"
        ],
        "entries": [
          {
            "noun": "Prüfung",
            "verb": "bestehen",
            "english": "to pass an exam",
            "chinese": "通过考试",
            "pattern": "eine Prüfung bestehen",
            "patternChinese": "通过考试",
            "level": "B1",
            "examples": [
              {
                "de": "eine Prüfung bestehen",
                "zh": "通过考试",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich muss diese Prüfung bestehen.",
                "zh": "我必须通过这场考试。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich hoffe, dass Mary die Prüfung besteht.",
                "zh": "我希望玛丽通过考试。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Arbeite hart, dann wirst du deine Prüfung bestehen.",
                "zh": "好好努力，你就能通过考试。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          },
          {
            "noun": "Prüfung",
            "verb": "ablegen",
            "english": "to sit an exam",
            "chinese": "参加考试",
            "pattern": "eine Prüfung ablegen",
            "patternChinese": "参加考试",
            "level": "B2",
            "examples": [
              {
                "de": "eine Prüfung ablegen",
                "zh": "参加考试",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Eid": {
        "display": "Eid",
        "prepositions": {
          "ablegen": [
            "einen Eid ablegen. 宣誓"
          ]
        },
        "prepositionOrder": [
          "ablegen"
        ],
        "entries": [
          {
            "noun": "Eid",
            "verb": "ablegen",
            "english": "to take an oath",
            "chinese": "宣誓",
            "pattern": "einen Eid ablegen",
            "patternChinese": "宣誓",
            "level": "C1",
            "examples": [
              {
                "de": "einen Eid ablegen",
                "zh": "宣誓",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Geständnis": {
        "display": "Geständnis",
        "prepositions": {
          "ablegen": [
            "ein Geständnis ablegen. 坦白"
          ]
        },
        "prepositionOrder": [
          "ablegen"
        ],
        "entries": [
          {
            "noun": "Geständnis",
            "verb": "ablegen",
            "english": "to make a confession",
            "chinese": "坦白",
            "pattern": "ein Geständnis ablegen",
            "patternChinese": "坦白",
            "level": "C1",
            "examples": [
              {
                "de": "ein Geständnis ablegen",
                "zh": "坦白",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Rechenschaft": {
        "display": "Rechenschaft",
        "prepositions": {
          "ablegen": [
            "Rechenschaft ablegen. 作出交代"
          ],
          "ziehen": [
            "jemanden zur Rechenschaft ziehen. 追究某人的责任"
          ]
        },
        "prepositionOrder": [
          "ablegen",
          "ziehen"
        ],
        "entries": [
          {
            "noun": "Rechenschaft",
            "verb": "ablegen",
            "english": "to render account",
            "chinese": "作出交代",
            "pattern": "Rechenschaft ablegen",
            "patternChinese": "作出交代",
            "level": "C1",
            "examples": [
              {
                "de": "Rechenschaft ablegen",
                "zh": "作出交代",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Rechenschaft",
            "verb": "ziehen",
            "english": "to call to account",
            "chinese": "追究责任",
            "pattern": "jemanden zur Rechenschaft ziehen",
            "patternChinese": "追究某人的责任",
            "level": "C1",
            "examples": [
              {
                "de": "jemanden zur Rechenschaft ziehen",
                "zh": "追究某人的责任",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Krieg": {
        "display": "Krieg",
        "prepositions": {
          "führen": [
            "Krieg führen. 打仗"
          ]
        },
        "prepositionOrder": [
          "führen"
        ],
        "entries": [
          {
            "noun": "Krieg",
            "verb": "führen",
            "english": "to wage war",
            "chinese": "发动战争",
            "pattern": "Krieg führen",
            "patternChinese": "打仗",
            "level": "C1",
            "examples": [
              {
                "de": "Krieg führen",
                "zh": "打仗",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Gespräch": {
        "display": "Gespräch",
        "prepositions": {
          "führen": [
            "ein Gespräch führen. 进行谈话"
          ]
        },
        "prepositionOrder": [
          "führen"
        ],
        "entries": [
          {
            "noun": "Gespräch",
            "verb": "führen",
            "english": "to hold a conversation",
            "chinese": "进行谈话",
            "pattern": "ein Gespräch führen",
            "patternChinese": "进行谈话",
            "level": "B2",
            "examples": [
              {
                "de": "ein Gespräch führen",
                "zh": "进行谈话",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Diskussion": {
        "display": "Diskussion",
        "prepositions": {
          "führen": [
            "eine Diskussion führen. 展开讨论",
            "Der Schuldspruch durch die Geschworenen führte zu einer gewaltigen Diskussion. 陪审团作出的犯罪判决激起了很大的争论。"
          ]
        },
        "prepositionOrder": [
          "führen"
        ],
        "entries": [
          {
            "noun": "Diskussion",
            "verb": "führen",
            "english": "to hold a discussion",
            "chinese": "进行讨论",
            "pattern": "eine Diskussion führen",
            "patternChinese": "展开讨论",
            "level": "B2",
            "examples": [
              {
                "de": "eine Diskussion führen",
                "zh": "展开讨论",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Der Schuldspruch durch die Geschworenen führte zu einer gewaltigen Diskussion.",
                "zh": "陪审团作出的犯罪判决激起了很大的争论。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Leben": {
        "display": "Leben",
        "prepositions": {
          "führen": [
            "ein ruhiges Leben führen. 过平静的生活",
            "Sie führte ein einsames Leben. 她的生活很寂寞。",
            "Sie führt ein komfortables Leben. 她生活得很舒适。",
            "Sie führten ein glückliches Leben. 他们生活得很幸福。"
          ]
        },
        "prepositionOrder": [
          "führen"
        ],
        "entries": [
          {
            "noun": "Leben",
            "verb": "führen",
            "english": "to lead a life",
            "chinese": "过着…的生活",
            "pattern": "ein ruhiges Leben führen",
            "patternChinese": "过平静的生活",
            "level": "B2",
            "examples": [
              {
                "de": "ein ruhiges Leben führen",
                "zh": "过平静的生活",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Sie führte ein einsames Leben.",
                "zh": "她的生活很寂寞。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Sie führt ein komfortables Leben.",
                "zh": "她生活得很舒适。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Sie führten ein glückliches Leben.",
                "zh": "他们生活得很幸福。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Regie": {
        "display": "Regie",
        "prepositions": {
          "führen": [
            "Regie führen. 担任导演"
          ]
        },
        "prepositionOrder": [
          "führen"
        ],
        "entries": [
          {
            "noun": "Regie",
            "verb": "führen",
            "english": "to direct (a film)",
            "chinese": "执导",
            "pattern": "Regie führen",
            "patternChinese": "担任导演",
            "level": "C1",
            "examples": [
              {
                "de": "Regie führen",
                "zh": "担任导演",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Buch": {
        "display": "Buch",
        "prepositions": {
          "führen": [
            "Buch führen. 记账"
          ]
        },
        "prepositionOrder": [
          "führen"
        ],
        "entries": [
          {
            "noun": "Buch",
            "verb": "führen",
            "english": "to keep records",
            "chinese": "记账",
            "pattern": "Buch führen",
            "patternChinese": "记账",
            "level": "C1",
            "examples": [
              {
                "de": "Buch führen",
                "zh": "记账",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Kurs": {
        "display": "Kurs",
        "prepositions": {
          "belegen": [
            "einen Kurs belegen. 选修一门课"
          ]
        },
        "prepositionOrder": [
          "belegen"
        ],
        "entries": [
          {
            "noun": "Kurs",
            "verb": "belegen",
            "english": "to take a course",
            "chinese": "选修课程",
            "pattern": "einen Kurs belegen",
            "patternChinese": "选修一门课",
            "level": "B1",
            "examples": [
              {
                "de": "einen Kurs belegen",
                "zh": "选修一门课",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Rolle": {
        "display": "Rolle",
        "prepositions": {
          "spielen": [
            "eine Rolle spielen. 起作用",
            "Es spielt keine Rolle. 没关系。",
            "Er spielte die Rolle des Hamlet. 他扮演哈姆雷特的角色。",
            "Die Natur spielt eine wichtige Rolle in unserem Leben. 大自然在我们的生活中扮演着重要的角色。"
          ]
        },
        "prepositionOrder": [
          "spielen"
        ],
        "entries": [
          {
            "noun": "Rolle",
            "verb": "spielen",
            "english": "to play a role",
            "chinese": "起作用",
            "pattern": "eine Rolle spielen",
            "patternChinese": "起作用",
            "level": "B1",
            "examples": [
              {
                "de": "eine Rolle spielen",
                "zh": "起作用",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Es spielt keine Rolle.",
                "zh": "没关系。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Er spielte die Rolle des Hamlet.",
                "zh": "他扮演哈姆雷特的角色。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Die Natur spielt eine wichtige Rolle in unserem Leben.",
                "zh": "大自然在我们的生活中扮演着重要的角色。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Risiko": {
        "display": "Risiko",
        "prepositions": {
          "eingehen": [
            "ein Risiko eingehen. 冒风险"
          ]
        },
        "prepositionOrder": [
          "eingehen"
        ],
        "entries": [
          {
            "noun": "Risiko",
            "verb": "eingehen",
            "english": "to take a risk",
            "chinese": "冒险",
            "pattern": "ein Risiko eingehen",
            "patternChinese": "冒风险",
            "level": "C1",
            "examples": [
              {
                "de": "ein Risiko eingehen",
                "zh": "冒风险",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Verpflichtung": {
        "display": "Verpflichtung",
        "prepositions": {
          "eingehen": [
            "eine Verpflichtung eingehen. 承担义务"
          ]
        },
        "prepositionOrder": [
          "eingehen"
        ],
        "entries": [
          {
            "noun": "Verpflichtung",
            "verb": "eingehen",
            "english": "to enter into an obligation",
            "chinese": "承担义务",
            "pattern": "eine Verpflichtung eingehen",
            "patternChinese": "承担义务",
            "level": "C1",
            "examples": [
              {
                "de": "eine Verpflichtung eingehen",
                "zh": "承担义务",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Ehe": {
        "display": "Ehe",
        "prepositions": {
          "eingehen": [
            "die Ehe eingehen. 缔结婚姻"
          ]
        },
        "prepositionOrder": [
          "eingehen"
        ],
        "entries": [
          {
            "noun": "Ehe",
            "verb": "eingehen",
            "english": "to enter into marriage",
            "chinese": "结婚",
            "pattern": "die Ehe eingehen",
            "patternChinese": "缔结婚姻",
            "level": "C1",
            "examples": [
              {
                "de": "die Ehe eingehen",
                "zh": "缔结婚姻",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Aufsehen": {
        "display": "Aufsehen",
        "prepositions": {
          "erregen": [
            "Aufsehen erregen. 引起轰动"
          ]
        },
        "prepositionOrder": [
          "erregen"
        ],
        "entries": [
          {
            "noun": "Aufsehen",
            "verb": "erregen",
            "english": "to cause a stir",
            "chinese": "引起轰动",
            "pattern": "Aufsehen erregen",
            "patternChinese": "引起轰动",
            "level": "C1",
            "examples": [
              {
                "de": "Aufsehen erregen",
                "zh": "引起轰动",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Bedenken": {
        "display": "Bedenken",
        "prepositions": {
          "haben": [
            "Bedenken haben. 有顾虑"
          ]
        },
        "prepositionOrder": [
          "haben"
        ],
        "entries": [
          {
            "noun": "Bedenken",
            "verb": "haben",
            "english": "to have misgivings",
            "chinese": "有顾虑",
            "pattern": "Bedenken haben",
            "patternChinese": "有顾虑",
            "level": "C1",
            "examples": [
              {
                "de": "Bedenken haben",
                "zh": "有顾虑",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Verdacht": {
        "display": "Verdacht",
        "prepositions": {
          "schöpfen": [
            "Verdacht schöpfen. 起疑心"
          ]
        },
        "prepositionOrder": [
          "schöpfen"
        ],
        "entries": [
          {
            "noun": "Verdacht",
            "verb": "schöpfen",
            "english": "to become suspicious",
            "chinese": "起疑心",
            "pattern": "Verdacht schöpfen",
            "patternChinese": "起疑心",
            "level": "C1",
            "examples": [
              {
                "de": "Verdacht schöpfen",
                "zh": "起疑心",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Entschluss": {
        "display": "Entschluss",
        "prepositions": {
          "fassen": [
            "einen Entschluss fassen. 下定决心",
            "Ich habe letztes Jahr den Entschluss gefasst, nach Japan zu kommen. 我去年下决心要到日本来。",
            "Sobald er einen Entschluss gefasst hat, kann keiner ihn davon abhalten. 一旦他决定了，就没有人能阻止他了。"
          ]
        },
        "prepositionOrder": [
          "fassen"
        ],
        "entries": [
          {
            "noun": "Entschluss",
            "verb": "fassen",
            "english": "to make up one's mind",
            "chinese": "下定决心",
            "pattern": "einen Entschluss fassen",
            "patternChinese": "下定决心",
            "level": "C1",
            "examples": [
              {
                "de": "einen Entschluss fassen",
                "zh": "下定决心",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Ich habe letztes Jahr den Entschluss gefasst, nach Japan zu kommen.",
                "zh": "我去年下决心要到日本来。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Sobald er einen Entschluss gefasst hat, kann keiner ihn davon abhalten.",
                "zh": "一旦他决定了，就没有人能阻止他了。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Fuß": {
        "display": "Fuß",
        "prepositions": {
          "fassen": [
            "Fuß fassen. 立足"
          ]
        },
        "prepositionOrder": [
          "fassen"
        ],
        "entries": [
          {
            "noun": "Fuß",
            "verb": "fassen",
            "english": "to gain a foothold",
            "chinese": "站稳脚跟",
            "pattern": "Fuß fassen",
            "patternChinese": "立足",
            "level": "C1",
            "examples": [
              {
                "de": "Fuß fassen",
                "zh": "立足",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Erfahrung": {
        "display": "Erfahrung",
        "prepositions": {
          "sammeln": [
            "Erfahrung sammeln. 积累经验"
          ],
          "bringen": [
            "etwas in Erfahrung bringen. 打听到某事"
          ]
        },
        "prepositionOrder": [
          "sammeln",
          "bringen"
        ],
        "entries": [
          {
            "noun": "Erfahrung",
            "verb": "sammeln",
            "english": "to gather experience",
            "chinese": "积累经验",
            "pattern": "Erfahrung sammeln",
            "patternChinese": "积累经验",
            "level": "B2",
            "examples": [
              {
                "de": "Erfahrung sammeln",
                "zh": "积累经验",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Erfahrung",
            "verb": "bringen",
            "english": "to find out",
            "chinese": "获悉",
            "pattern": "etwas in Erfahrung bringen",
            "patternChinese": "打听到某事",
            "level": "C1",
            "examples": [
              {
                "de": "etwas in Erfahrung bringen",
                "zh": "打听到某事",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Musik": {
        "display": "Musik",
        "prepositions": {
          "hören": [
            "Musik hören. 听音乐",
            "Sie hört gerne Musik. 她喜欢听音乐。",
            "Er hörte keine Musik. 他没有听音乐。",
            "Lass uns Musik hören. 我们听点音乐吧。"
          ]
        },
        "prepositionOrder": [
          "hören"
        ],
        "entries": [
          {
            "noun": "Musik",
            "verb": "hören",
            "english": "to listen to music",
            "chinese": "听音乐",
            "pattern": "Musik hören",
            "patternChinese": "听音乐",
            "level": "A1",
            "examples": [
              {
                "de": "Musik hören",
                "zh": "听音乐",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Sie hört gerne Musik.",
                "zh": "她喜欢听音乐。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Er hörte keine Musik.",
                "zh": "他没有听音乐。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Lass uns Musik hören.",
                "zh": "我们听点音乐吧。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Sport": {
        "display": "Sport",
        "prepositions": {
          "treiben": [
            "Sport treiben. 运动",
            "Er treibt zweimal die Woche Sport. 他一周做两次运动。",
            "Ich treibe jeden Tag zwei Stunden Sport. 我每天做两个小时的运动。",
            "Treibe mehr Sport, ansonsten wirst du übergewichtig. 多做运动，不然你会超重。"
          ]
        },
        "prepositionOrder": [
          "treiben"
        ],
        "entries": [
          {
            "noun": "Sport",
            "verb": "treiben",
            "english": "to do sports",
            "chinese": "做运动",
            "pattern": "Sport treiben",
            "patternChinese": "运动",
            "level": "A2",
            "examples": [
              {
                "de": "Sport treiben",
                "zh": "运动",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Er treibt zweimal die Woche Sport.",
                "zh": "他一周做两次运动。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich treibe jeden Tag zwei Stunden Sport.",
                "zh": "我每天做两个小时的运动。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Treibe mehr Sport, ansonsten wirst du übergewichtig.",
                "zh": "多做运动，不然你会超重。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Aufwand": {
        "display": "Aufwand",
        "prepositions": {
          "treiben": [
            "großen Aufwand treiben. 大费周章"
          ]
        },
        "prepositionOrder": [
          "treiben"
        ],
        "entries": [
          {
            "noun": "Aufwand",
            "verb": "treiben",
            "english": "to go to great lengths",
            "chinese": "花费很大力气",
            "pattern": "großen Aufwand treiben",
            "patternChinese": "大费周章",
            "level": "C1",
            "examples": [
              {
                "de": "großen Aufwand treiben",
                "zh": "大费周章",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Hausaufgaben": {
        "display": "Hausaufgaben",
        "prepositions": {
          "machen": [
            "Hausaufgaben machen. 做作业",
            "Geh deine Hausaufgaben machen! 快去做作业。",
            "Hast du die Hausaufgaben gemacht? 你写作业了没有？",
            "Hast du deine Hausaufgaben gemacht? 你的作业，做完了没有？"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Hausaufgaben",
            "verb": "machen",
            "english": "to do homework",
            "chinese": "做作业",
            "pattern": "Hausaufgaben machen",
            "patternChinese": "做作业",
            "level": "A1",
            "examples": [
              {
                "de": "Hausaufgaben machen",
                "zh": "做作业",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Geh deine Hausaufgaben machen!",
                "zh": "快去做作业。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Hast du die Hausaufgaben gemacht?",
                "zh": "你写作业了没有？",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Hast du deine Hausaufgaben gemacht?",
                "zh": "你的作业，做完了没有？",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Frühstück": {
        "display": "Frühstück",
        "prepositions": {
          "machen": [
            "Frühstück machen. 做早饭",
            "Mama macht gerade Frühstück. 妈妈正在准备早餐。",
            "Ich habe ihr Frühstück gemacht. 我弄了早餐给她。",
            "Meine Schwestern werden Frühstück machen. 我的姊妹将会准备早餐。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Frühstück",
            "verb": "machen",
            "english": "to make breakfast",
            "chinese": "做早餐",
            "pattern": "Frühstück machen",
            "patternChinese": "做早饭",
            "level": "A1",
            "examples": [
              {
                "de": "Frühstück machen",
                "zh": "做早饭",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Mama macht gerade Frühstück.",
                "zh": "妈妈正在准备早餐。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Ich habe ihr Frühstück gemacht.",
                "zh": "我弄了早餐给她。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Meine Schwestern werden Frühstück machen.",
                "zh": "我的姊妹将会准备早餐。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Geld": {
        "display": "Geld",
        "prepositions": {
          "verdienen": [
            "Geld verdienen. 挣钱",
            "Tom verdient viel Geld. 汤姆赚很多钱。",
            "Er verdient gutes Geld. 他收入可观。",
            "Wie verdienst du dein Geld? 你怎么赚钱？"
          ]
        },
        "prepositionOrder": [
          "verdienen"
        ],
        "entries": [
          {
            "noun": "Geld",
            "verb": "verdienen",
            "english": "to earn money",
            "chinese": "挣钱",
            "pattern": "Geld verdienen",
            "patternChinese": "挣钱",
            "level": "A2",
            "examples": [
              {
                "de": "Geld verdienen",
                "zh": "挣钱",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Tom verdient viel Geld.",
                "zh": "汤姆赚很多钱。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Er verdient gutes Geld.",
                "zh": "他收入可观。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Wie verdienst du dein Geld?",
                "zh": "你怎么赚钱？",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Miete": {
        "display": "Miete",
        "prepositions": {
          "zahlen": [
            "Miete zahlen. 付房租",
            "Du solltest deine Miete im Voraus zahlen. 你应该提前付租金。",
            "Da ich die Miete nicht zahlen konnte, habe ich ihn um Hilfe gebeten. 因为我付不了租金，我就向他请求帮助。"
          ]
        },
        "prepositionOrder": [
          "zahlen"
        ],
        "entries": [
          {
            "noun": "Miete",
            "verb": "zahlen",
            "english": "to pay rent",
            "chinese": "付房租",
            "pattern": "Miete zahlen",
            "patternChinese": "付房租",
            "level": "A2",
            "examples": [
              {
                "de": "Miete zahlen",
                "zh": "付房租",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du solltest deine Miete im Voraus zahlen.",
                "zh": "你应该提前付租金。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Da ich die Miete nicht zahlen konnte, habe ich ihn um Hilfe gebeten.",
                "zh": "因为我付不了租金，我就向他请求帮助。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Steuern": {
        "display": "Steuern",
        "prepositions": {
          "zahlen": [
            "Steuern zahlen. 缴税",
            "Alle Amerikaner müssen ihre Steuern zahlen. 所有美国人都需要缴税。"
          ]
        },
        "prepositionOrder": [
          "zahlen"
        ],
        "entries": [
          {
            "noun": "Steuern",
            "verb": "zahlen",
            "english": "to pay taxes",
            "chinese": "纳税",
            "pattern": "Steuern zahlen",
            "patternChinese": "缴税",
            "level": "B2",
            "examples": [
              {
                "de": "Steuern zahlen",
                "zh": "缴税",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Alle Amerikaner müssen ihre Steuern zahlen.",
                "zh": "所有美国人都需要缴税。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Termin": {
        "display": "Termin",
        "prepositions": {
          "vereinbaren": [
            "einen Termin vereinbaren. 预约"
          ],
          "absagen": [
            "einen Termin absagen. 取消预约"
          ]
        },
        "prepositionOrder": [
          "vereinbaren",
          "absagen"
        ],
        "entries": [
          {
            "noun": "Termin",
            "verb": "vereinbaren",
            "english": "to arrange an appointment",
            "chinese": "约定时间",
            "pattern": "einen Termin vereinbaren",
            "patternChinese": "预约",
            "level": "B1",
            "examples": [
              {
                "de": "einen Termin vereinbaren",
                "zh": "预约",
                "source": "Dimenticato (authored)"
              }
            ]
          },
          {
            "noun": "Termin",
            "verb": "absagen",
            "english": "to cancel an appointment",
            "chinese": "取消预约",
            "pattern": "einen Termin absagen",
            "patternChinese": "取消预约",
            "level": "B1",
            "examples": [
              {
                "de": "einen Termin absagen",
                "zh": "取消预约",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Bewerbung": {
        "display": "Bewerbung",
        "prepositions": {
          "schreiben": [
            "eine Bewerbung schreiben. 写求职信"
          ]
        },
        "prepositionOrder": [
          "schreiben"
        ],
        "entries": [
          {
            "noun": "Bewerbung",
            "verb": "schreiben",
            "english": "to write an application",
            "chinese": "写求职信",
            "pattern": "eine Bewerbung schreiben",
            "patternChinese": "写求职信",
            "level": "B1",
            "examples": [
              {
                "de": "eine Bewerbung schreiben",
                "zh": "写求职信",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Notizen": {
        "display": "Notizen",
        "prepositions": {
          "machen": [
            "sich Notizen machen. 做笔记",
            "Tom machte sich Notizen. 汤姆记了笔记。"
          ]
        },
        "prepositionOrder": [
          "machen"
        ],
        "entries": [
          {
            "noun": "Notizen",
            "verb": "machen",
            "english": "to take notes",
            "chinese": "做笔记",
            "pattern": "sich Notizen machen",
            "patternChinese": "做笔记",
            "level": "B1",
            "examples": [
              {
                "de": "sich Notizen machen",
                "zh": "做笔记",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Tom machte sich Notizen.",
                "zh": "汤姆记了笔记。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Atem": {
        "display": "Atem",
        "prepositions": {
          "holen": [
            "Atem holen. 喘口气"
          ]
        },
        "prepositionOrder": [
          "holen"
        ],
        "entries": [
          {
            "noun": "Atem",
            "verb": "holen",
            "english": "to draw breath",
            "chinese": "喘口气",
            "pattern": "Atem holen",
            "patternChinese": "喘口气",
            "level": "B2",
            "examples": [
              {
                "de": "Atem holen",
                "zh": "喘口气",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Beschwerde": {
        "display": "Beschwerde",
        "prepositions": {
          "einlegen": [
            "Beschwerde einlegen. 提出申诉"
          ]
        },
        "prepositionOrder": [
          "einlegen"
        ],
        "entries": [
          {
            "noun": "Beschwerde",
            "verb": "einlegen",
            "english": "to lodge a complaint",
            "chinese": "提出申诉",
            "pattern": "Beschwerde einlegen",
            "patternChinese": "提出申诉",
            "level": "C1",
            "examples": [
              {
                "de": "Beschwerde einlegen",
                "zh": "提出申诉",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Pause": {
        "display": "Pause",
        "prepositions": {
          "einlegen": [
            "eine Pause einlegen. 休息一下",
            "Legen wir eine zehnminütige Pause ein! 休息10分钟"
          ]
        },
        "prepositionOrder": [
          "einlegen"
        ],
        "entries": [
          {
            "noun": "Pause",
            "verb": "einlegen",
            "english": "to take a break",
            "chinese": "休息一下",
            "pattern": "eine Pause einlegen",
            "patternChinese": "休息一下",
            "level": "B1",
            "examples": [
              {
                "de": "eine Pause einlegen",
                "zh": "休息一下",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Legen wir eine zehnminütige Pause ein!",
                "zh": "休息10分钟",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Wert": {
        "display": "Wert",
        "prepositions": {
          "legen": [
            "Wert legen. 重视",
            "Wir sollten nicht zu viel Wert aufs Geld legen. 我们不应该把金钱看得太重。",
            "Maria und Tom legen Wert auf ihre Privatsphäre. 玛丽和汤姆注重隐私。",
            "In der westlichen Kultur wird großer Wert auf das Individuum gelegt. 西方文化很看重个人。"
          ]
        },
        "prepositionOrder": [
          "legen"
        ],
        "entries": [
          {
            "noun": "Wert",
            "verb": "legen",
            "english": "to attach value",
            "chinese": "重视",
            "pattern": "Wert legen",
            "patternChinese": "重视",
            "level": "B2",
            "examples": [
              {
                "de": "Wert legen",
                "zh": "重视",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Wir sollten nicht zu viel Wert aufs Geld legen.",
                "zh": "我们不应该把金钱看得太重。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Maria und Tom legen Wert auf ihre Privatsphäre.",
                "zh": "玛丽和汤姆注重隐私。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "In der westlichen Kultur wird großer Wert auf das Individuum gelegt.",
                "zh": "西方文化很看重个人。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Bedingung": {
        "display": "Bedingung",
        "prepositions": {
          "stellen": [
            "eine Bedingung stellen. 提出条件"
          ]
        },
        "prepositionOrder": [
          "stellen"
        ],
        "entries": [
          {
            "noun": "Bedingung",
            "verb": "stellen",
            "english": "to set a condition",
            "chinese": "提出条件",
            "pattern": "eine Bedingung stellen",
            "patternChinese": "提出条件",
            "level": "B2",
            "examples": [
              {
                "de": "eine Bedingung stellen",
                "zh": "提出条件",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Forderung": {
        "display": "Forderung",
        "prepositions": {
          "stellen": [
            "eine Forderung stellen. 提出要求"
          ]
        },
        "prepositionOrder": [
          "stellen"
        ],
        "entries": [
          {
            "noun": "Forderung",
            "verb": "stellen",
            "english": "to make a demand",
            "chinese": "提出要求",
            "pattern": "eine Forderung stellen",
            "patternChinese": "提出要求",
            "level": "C1",
            "examples": [
              {
                "de": "eine Forderung stellen",
                "zh": "提出要求",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Weichen": {
        "display": "Weichen",
        "prepositions": {
          "stellen": [
            "die Weichen stellen. 定下方向"
          ]
        },
        "prepositionOrder": [
          "stellen"
        ],
        "entries": [
          {
            "noun": "Weichen",
            "verb": "stellen",
            "english": "to set the course",
            "chinese": "指明方向",
            "pattern": "die Weichen stellen",
            "patternChinese": "定下方向",
            "level": "C1",
            "examples": [
              {
                "de": "die Weichen stellen",
                "zh": "定下方向",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Aufgabe": {
        "display": "Aufgabe",
        "prepositions": {
          "lösen": [
            "eine Aufgabe lösen. 解决一道题",
            "Kein Lehrer konnte die Aufgabe lösen. 这道题目没有一位老师会做。"
          ]
        },
        "prepositionOrder": [
          "lösen"
        ],
        "entries": [
          {
            "noun": "Aufgabe",
            "verb": "lösen",
            "english": "to solve a task",
            "chinese": "解题",
            "pattern": "eine Aufgabe lösen",
            "patternChinese": "解决一道题",
            "level": "A2",
            "examples": [
              {
                "de": "eine Aufgabe lösen",
                "zh": "解决一道题",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Kein Lehrer konnte die Aufgabe lösen.",
                "zh": "这道题目没有一位老师会做。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Problem": {
        "display": "Problem",
        "prepositions": {
          "lösen": [
            "ein Problem lösen. 解决问题",
            "Das Problem ist gelöst. 问题已经解决了。",
            "Das Problem wurde gelöst. 问题已经解决了。",
            "Er kann dieses Problem lösen. 他能解决这个问题。"
          ]
        },
        "prepositionOrder": [
          "lösen"
        ],
        "entries": [
          {
            "noun": "Problem",
            "verb": "lösen",
            "english": "to solve a problem",
            "chinese": "解决问题",
            "pattern": "ein Problem lösen",
            "patternChinese": "解决问题",
            "level": "B1",
            "examples": [
              {
                "de": "ein Problem lösen",
                "zh": "解决问题",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Das Problem ist gelöst.",
                "zh": "问题已经解决了。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Das Problem wurde gelöst.",
                "zh": "问题已经解决了。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Er kann dieses Problem lösen.",
                "zh": "他能解决这个问题。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Konflikt": {
        "display": "Konflikt",
        "prepositions": {
          "lösen": [
            "einen Konflikt lösen. 化解冲突"
          ]
        },
        "prepositionOrder": [
          "lösen"
        ],
        "entries": [
          {
            "noun": "Konflikt",
            "verb": "lösen",
            "english": "to resolve a conflict",
            "chinese": "化解冲突",
            "pattern": "einen Konflikt lösen",
            "patternChinese": "化解冲突",
            "level": "B2",
            "examples": [
              {
                "de": "einen Konflikt lösen",
                "zh": "化解冲突",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Wohnung": {
        "display": "Wohnung",
        "prepositions": {
          "kündigen": [
            "die Wohnung kündigen. 退租"
          ]
        },
        "prepositionOrder": [
          "kündigen"
        ],
        "entries": [
          {
            "noun": "Wohnung",
            "verb": "kündigen",
            "english": "to give notice on a flat",
            "chinese": "退租",
            "pattern": "die Wohnung kündigen",
            "patternChinese": "退租",
            "level": "B2",
            "examples": [
              {
                "de": "die Wohnung kündigen",
                "zh": "退租",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Ziel": {
        "display": "Ziel",
        "prepositions": {
          "erreichen": [
            "ein Ziel erreichen. 达到目标",
            "Hast du dein Ziel erreicht? 你达成你的目标了吗？",
            "Sie haben ihr Ziel erreicht. 他们已经达到了目标。",
            "Endlich erreichte er sein Ziel. 他终于完成了他的目标。"
          ]
        },
        "prepositionOrder": [
          "erreichen"
        ],
        "entries": [
          {
            "noun": "Ziel",
            "verb": "erreichen",
            "english": "to reach a goal",
            "chinese": "达到目标",
            "pattern": "ein Ziel erreichen",
            "patternChinese": "达到目标",
            "level": "B1",
            "examples": [
              {
                "de": "ein Ziel erreichen",
                "zh": "达到目标",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Hast du dein Ziel erreicht?",
                "zh": "你达成你的目标了吗？",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Sie haben ihr Ziel erreicht.",
                "zh": "他们已经达到了目标。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Endlich erreichte er sein Ziel.",
                "zh": "他终于完成了他的目标。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Einigung": {
        "display": "Einigung",
        "prepositions": {
          "erzielen": [
            "eine Einigung erzielen. 达成一致"
          ]
        },
        "prepositionOrder": [
          "erzielen"
        ],
        "entries": [
          {
            "noun": "Einigung",
            "verb": "erzielen",
            "english": "to reach an agreement",
            "chinese": "达成一致",
            "pattern": "eine Einigung erzielen",
            "patternChinese": "达成一致",
            "level": "C1",
            "examples": [
              {
                "de": "eine Einigung erzielen",
                "zh": "达成一致",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Ergebnis": {
        "display": "Ergebnis",
        "prepositions": {
          "erzielen": [
            "ein gutes Ergebnis erzielen. 取得好成绩",
            "Sie haben herausragende Ergebnisse auf verschiedenen Gebieten erzielt. 他们在不同的领域取得了卓越的成就。"
          ]
        },
        "prepositionOrder": [
          "erzielen"
        ],
        "entries": [
          {
            "noun": "Ergebnis",
            "verb": "erzielen",
            "english": "to achieve a result",
            "chinese": "取得结果",
            "pattern": "ein gutes Ergebnis erzielen",
            "patternChinese": "取得好成绩",
            "level": "C1",
            "examples": [
              {
                "de": "ein gutes Ergebnis erzielen",
                "zh": "取得好成绩",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Sie haben herausragende Ergebnisse auf verschiedenen Gebieten erzielt.",
                "zh": "他们在不同的领域取得了卓越的成就。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Gewinn": {
        "display": "Gewinn",
        "prepositions": {
          "erzielen": [
            "Gewinn erzielen. 获利"
          ]
        },
        "prepositionOrder": [
          "erzielen"
        ],
        "entries": [
          {
            "noun": "Gewinn",
            "verb": "erzielen",
            "english": "to make a profit",
            "chinese": "获取利润",
            "pattern": "Gewinn erzielen",
            "patternChinese": "获利",
            "level": "C1",
            "examples": [
              {
                "de": "Gewinn erzielen",
                "zh": "获利",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Maßnahme": {
        "display": "Maßnahme",
        "prepositions": {
          "ergreifen": [
            "Maßnahmen ergreifen. 采取措施",
            "Die Regierung wird drastische Maßnahmen ergreifen müssen, um das Problem zu lösen. 政府将采取强制措施来解决这一问题。"
          ]
        },
        "prepositionOrder": [
          "ergreifen"
        ],
        "entries": [
          {
            "noun": "Maßnahme",
            "verb": "ergreifen",
            "english": "to take measures",
            "chinese": "采取措施",
            "pattern": "Maßnahmen ergreifen",
            "patternChinese": "采取措施",
            "level": "C1",
            "examples": [
              {
                "de": "Maßnahmen ergreifen",
                "zh": "采取措施",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Die Regierung wird drastische Maßnahmen ergreifen müssen, um das Problem zu lösen.",
                "zh": "政府将采取强制措施来解决这一问题。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Chance": {
        "display": "Chance",
        "prepositions": {
          "ergreifen": [
            "die Chance ergreifen. 抓住机会"
          ]
        },
        "prepositionOrder": [
          "ergreifen"
        ],
        "entries": [
          {
            "noun": "Chance",
            "verb": "ergreifen",
            "english": "to seize the chance",
            "chinese": "抓住机会",
            "pattern": "die Chance ergreifen",
            "patternChinese": "抓住机会",
            "level": "B2",
            "examples": [
              {
                "de": "die Chance ergreifen",
                "zh": "抓住机会",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Gelegenheit": {
        "display": "Gelegenheit",
        "prepositions": {
          "nutzen": [
            "die Gelegenheit nutzen. 利用机会",
            "Nutze diese Gelegenheit gut! 好好把握这个机会。",
            "Du solltest diese Gelegenheit nutzen. 你要好好把握这个时机。"
          ]
        },
        "prepositionOrder": [
          "nutzen"
        ],
        "entries": [
          {
            "noun": "Gelegenheit",
            "verb": "nutzen",
            "english": "to seize the opportunity",
            "chinese": "利用机会",
            "pattern": "die Gelegenheit nutzen",
            "patternChinese": "利用机会",
            "level": "B2",
            "examples": [
              {
                "de": "die Gelegenheit nutzen",
                "zh": "利用机会",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Nutze diese Gelegenheit gut!",
                "zh": "好好把握这个机会。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Du solltest diese Gelegenheit nutzen.",
                "zh": "你要好好把握这个时机。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Verwendung": {
        "display": "Verwendung",
        "prepositions": {
          "finden": [
            "Verwendung finden. 得到使用"
          ]
        },
        "prepositionOrder": [
          "finden"
        ],
        "entries": [
          {
            "noun": "Verwendung",
            "verb": "finden",
            "english": "to be used",
            "chinese": "被使用",
            "pattern": "Verwendung finden",
            "patternChinese": "得到使用",
            "level": "C1",
            "examples": [
              {
                "de": "Verwendung finden",
                "zh": "得到使用",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Verlegenheit": {
        "display": "Verlegenheit",
        "prepositions": {
          "bringen": [
            "jemanden in Verlegenheit bringen. 让某人难堪",
            "Du wirst sie in Verlegenheit bringen. 你会令她害羞。",
            "Lass das! Du bringst sie in Verlegenheit. 得了！你弄得她不自在了！"
          ]
        },
        "prepositionOrder": [
          "bringen"
        ],
        "entries": [
          {
            "noun": "Verlegenheit",
            "verb": "bringen",
            "english": "to embarrass",
            "chinese": "使为难",
            "pattern": "jemanden in Verlegenheit bringen",
            "patternChinese": "让某人难堪",
            "level": "C1",
            "examples": [
              {
                "de": "jemanden in Verlegenheit bringen",
                "zh": "让某人难堪",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du wirst sie in Verlegenheit bringen.",
                "zh": "你会令她害羞。",
                "source": "Tatoeba CC BY 2.0 FR"
              },
              {
                "de": "Lass das! Du bringst sie in Verlegenheit.",
                "zh": "得了！你弄得她不自在了！",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      },
      "Konsequenz": {
        "display": "Konsequenz",
        "prepositions": {
          "ziehen": [
            "Konsequenzen ziehen. 做出相应处理"
          ]
        },
        "prepositionOrder": [
          "ziehen"
        ],
        "entries": [
          {
            "noun": "Konsequenz",
            "verb": "ziehen",
            "english": "to draw consequences",
            "chinese": "采取相应措施",
            "pattern": "Konsequenzen ziehen",
            "patternChinese": "做出相应处理",
            "level": "C1",
            "examples": [
              {
                "de": "Konsequenzen ziehen",
                "zh": "做出相应处理",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Kauf": {
        "display": "Kauf",
        "prepositions": {
          "nehmen": [
            "etwas in Kauf nehmen. 勉强接受某事"
          ]
        },
        "prepositionOrder": [
          "nehmen"
        ],
        "entries": [
          {
            "noun": "Kauf",
            "verb": "nehmen",
            "english": "to put up with",
            "chinese": "勉强接受",
            "pattern": "etwas in Kauf nehmen",
            "patternChinese": "勉强接受某事",
            "level": "C1",
            "examples": [
              {
                "de": "etwas in Kauf nehmen",
                "zh": "勉强接受某事",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Bezug": {
        "display": "Bezug",
        "prepositions": {
          "nehmen": [
            "auf etwas Bezug nehmen. 提及某事"
          ]
        },
        "prepositionOrder": [
          "nehmen"
        ],
        "entries": [
          {
            "noun": "Bezug",
            "verb": "nehmen",
            "english": "to refer to",
            "chinese": "提及",
            "pattern": "auf etwas Bezug nehmen",
            "patternChinese": "提及某事",
            "level": "C1",
            "examples": [
              {
                "de": "auf etwas Bezug nehmen",
                "zh": "提及某事",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Abstand": {
        "display": "Abstand",
        "prepositions": {
          "nehmen": [
            "von etwas Abstand nehmen. 放弃某事"
          ]
        },
        "prepositionOrder": [
          "nehmen"
        ],
        "entries": [
          {
            "noun": "Abstand",
            "verb": "nehmen",
            "english": "to refrain from",
            "chinese": "放弃",
            "pattern": "von etwas Abstand nehmen",
            "patternChinese": "放弃某事",
            "level": "C1",
            "examples": [
              {
                "de": "von etwas Abstand nehmen",
                "zh": "放弃某事",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Auftrag": {
        "display": "Auftrag",
        "prepositions": {
          "erteilen": [
            "einen Auftrag erteilen. 下达委托"
          ]
        },
        "prepositionOrder": [
          "erteilen"
        ],
        "entries": [
          {
            "noun": "Auftrag",
            "verb": "erteilen",
            "english": "to place an order",
            "chinese": "下达委托",
            "pattern": "einen Auftrag erteilen",
            "patternChinese": "下达委托",
            "level": "C1",
            "examples": [
              {
                "de": "einen Auftrag erteilen",
                "zh": "下达委托",
                "source": "Dimenticato (authored)"
              }
            ]
          }
        ]
      },
      "Folge": {
        "display": "Folge",
        "prepositions": {
          "leisten": [
            "einer Aufforderung Folge leisten. 听从要求",
            "Du musst dem Rat deiner Mutter Folge leisten. 你必须听你母亲的建议。"
          ]
        },
        "prepositionOrder": [
          "leisten"
        ],
        "entries": [
          {
            "noun": "Folge",
            "verb": "leisten",
            "english": "to comply with",
            "chinese": "听从",
            "pattern": "einer Aufforderung Folge leisten",
            "patternChinese": "听从要求",
            "level": "C1",
            "examples": [
              {
                "de": "einer Aufforderung Folge leisten",
                "zh": "听从要求",
                "source": "Dimenticato (authored)"
              },
              {
                "de": "Du musst dem Rat deiner Mutter Folge leisten.",
                "zh": "你必须听你母亲的建议。",
                "source": "Tatoeba CC BY 2.0 FR"
              }
            ]
          }
        ]
      }
    },
    "prepositions": {
      "treffen": [
        "Entscheidung"
      ],
      "fällen": [
        "Entscheidung"
      ],
      "stellen": [
        "Antrag",
        "Bedingung",
        "Forderung",
        "Frage",
        "Rechnung",
        "Verfügung",
        "Weichen"
      ],
      "kommen": [
        "Frage"
      ],
      "üben": [
        "Kritik"
      ],
      "äußern": [
        "Kritik",
        "Wunsch",
        "Zweifel"
      ],
      "nehmen": [
        "Abschied",
        "Abstand",
        "Anspruch",
        "Bezug",
        "Einfluss",
        "Kauf",
        "Platz",
        "Rache",
        "Rücksicht",
        "Stellung",
        "Urlaub"
      ],
      "belegen": [
        "Kurs",
        "Platz"
      ],
      "machen": [
        "Ernst",
        "Fehler",
        "Fortschritte",
        "Frühstück",
        "Gedanken",
        "Hausaufgaben",
        "Mut",
        "Notizen",
        "Sorgen",
        "Spaß",
        "Urlaub",
        "Vorschlag",
        "Vorwürfe"
      ],
      "übernehmen": [
        "Verantwortung"
      ],
      "tragen": [
        "Rechnung",
        "Sorge",
        "Verantwortung"
      ],
      "schenken": [
        "Aufmerksamkeit",
        "Beachtung",
        "Glauben",
        "Vertrauen"
      ],
      "erregen": [
        "Aufmerksamkeit",
        "Aufsehen"
      ],
      "widmen": [
        "Aufmerksamkeit",
        "Zeit"
      ],
      "fassen": [
        "Entschluss",
        "Fuß",
        "Mut",
        "Vertrauen"
      ],
      "finden": [
        "Anerkennung",
        "Anwendung",
        "Ausdruck",
        "Beachtung",
        "Verwendung",
        "Zustimmung"
      ],
      "halten": [
        "Diät",
        "Ordnung",
        "Rede",
        "Versprechen",
        "Vortrag",
        "Wort"
      ],
      "stehen": [
        "Debatte",
        "Rede",
        "Verfügung"
      ],
      "bringen": [
        "Ausdruck",
        "Ende",
        "Erfahrung",
        "Gefahr",
        "Opfer",
        "Ordnung",
        "Sprache",
        "Verlegenheit"
      ],
      "schließen": [
        "Freundschaft",
        "Frieden",
        "Kompromiss",
        "Vertrag"
      ],
      "kündigen": [
        "Vertrag",
        "Wohnung"
      ],
      "eingehen": [
        "Ehe",
        "Kompromiss",
        "Risiko",
        "Verpflichtung"
      ],
      "geben": [
        "Antwort",
        "Auskunft",
        "Bescheid",
        "Erlaubnis",
        "Mühe",
        "Rat"
      ],
      "erhalten": [
        "Antwort",
        "Auskunft",
        "Erlaubnis"
      ],
      "erteilen": [
        "Auftrag",
        "Auskunft",
        "Erlaubnis"
      ],
      "holen": [
        "Atem",
        "Rat"
      ],
      "wissen": [
        "Bescheid"
      ],
      "haben": [
        "Ahnung",
        "Angst",
        "Bedenken",
        "Eile",
        "Erfolg",
        "Geduld",
        "Glück",
        "Hunger",
        "Lust",
        "Recht",
        "Zeit"
      ],
      "treten": [
        "Erscheinung",
        "Kraft",
        "Streik",
        "Verbindung"
      ],
      "sammeln": [
        "Erfahrung",
        "Kraft"
      ],
      "setzen": [
        "Druck",
        "Gang",
        "Verbindung"
      ],
      "ziehen": [
        "Betracht",
        "Bilanz",
        "Konsequenz",
        "Konsequenzen",
        "Rechenschaft",
        "Schluss",
        "Zweifel"
      ],
      "ergreifen": [
        "Chance",
        "Initiative",
        "Maßnahme",
        "Maßnahmen",
        "Wort"
      ],
      "erheben": [
        "Anspruch",
        "Einspruch",
        "Klage"
      ],
      "laufen": [
        "Gefahr"
      ],
      "bezahlen": [
        "Rechnung"
      ],
      "beimessen": [
        "Bedeutung"
      ],
      "hegen": [
        "Zweifel"
      ],
      "leisten": [
        "Arbeit",
        "Beitrag",
        "Folge",
        "Gesellschaft",
        "Hilfe",
        "Verzicht",
        "Widerstand"
      ],
      "zeigen": [
        "Interesse",
        "Verständnis",
        "Wirkung"
      ],
      "bestehen": [
        "Prüfung"
      ],
      "ablegen": [
        "Eid",
        "Geständnis",
        "Prüfung",
        "Rechenschaft"
      ],
      "führen": [
        "Buch",
        "Diskussion",
        "Gespräch",
        "Krieg",
        "Leben",
        "Regie"
      ],
      "spielen": [
        "Rolle"
      ],
      "schöpfen": [
        "Verdacht"
      ],
      "hören": [
        "Musik"
      ],
      "treiben": [
        "Aufwand",
        "Sport"
      ],
      "verdienen": [
        "Geld"
      ],
      "zahlen": [
        "Miete",
        "Steuern"
      ],
      "vereinbaren": [
        "Termin"
      ],
      "absagen": [
        "Termin"
      ],
      "schreiben": [
        "Bewerbung"
      ],
      "einlegen": [
        "Beschwerde",
        "Pause"
      ],
      "legen": [
        "Wert"
      ],
      "lösen": [
        "Aufgabe",
        "Konflikt",
        "Problem"
      ],
      "erreichen": [
        "Ziel"
      ],
      "erzielen": [
        "Einigung",
        "Ergebnis",
        "Gewinn"
      ],
      "nutzen": [
        "Gelegenheit"
      ]
    }
  }
};
if (typeof window !== 'undefined') {
  window.GERMAN_COLLOCATIONS_DATA = GERMAN_COLLOCATIONS_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GERMAN_COLLOCATIONS_DATA;
}
