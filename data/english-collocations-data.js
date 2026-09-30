// English verb collocations: verb + dependent preposition (depend on) and
// phrasal verbs (give up, put up with).  GENERATED - edit
// scripts/english_collocations_source/*.txt and re-run
//   python3 scripts/build_english_collocations.py
// Mirrors the Italian data/verb-collocations-data.js shape exactly:
//   { meta: { totalVerbs, totalExamples, prepositionOrder },
//     verbs: { <slug>: { display, prepositions: { <key>: ["<en> <zh>"] }, prepositionOrder } },
//     prepositions: { <key>: [<slug>] } }
// Keys include adverb particles (up, out, off...) and multi-word sequences
// (up with); meta.keyKinds / meta.particles tell prepositions and particles apart.
// Additive fields (ignored by the renderer): meta.language, meta.particles,
//   meta.keyKinds, meta.sources, verbs[x].zipf, verbs[x].senses.
// Sources: sentences and translations authored for this project; wordfreq for ranking.
// Total verbs: 882 / Total examples: 3220

const ENGLISH_VERB_COLLOCATIONS_DATA = {
  "meta": {
    "totalVerbs": 882,
    "totalExamples": 3220,
    "prepositionOrder": [
      "about",
      "at",
      "for",
      "from",
      "in",
      "into",
      "of",
      "on",
      "onto",
      "to",
      "with",
      "against",
      "among",
      "as",
      "between",
      "by",
      "like",
      "towards",
      "under",
      "upon",
      "without",
      "up",
      "out",
      "off",
      "down",
      "away",
      "back",
      "over",
      "through",
      "around",
      "along",
      "across",
      "aside",
      "apart",
      "ahead",
      "behind",
      "forward",
      "together",
      "round",
      "after",
      "above",
      "out of",
      "up on",
      "up to",
      "up with",
      "in on",
      "out for",
      "back to",
      "up for",
      "away from",
      "down on",
      "along with",
      "away at",
      "back on",
      "down to",
      "in with",
      "out on",
      "away with",
      "in for",
      "off on",
      "off with",
      "on to",
      "out with",
      "ahead with",
      "around to",
      "down with",
      "forward to",
      "on with",
      "out about",
      "out against",
      "out at",
      "out to",
      "over with",
      "through to",
      "through with",
      "up against",
      "up as",
      "up in"
    ],
    "language": "english",
    "particles": [
      "about",
      "in",
      "on",
      "by",
      "under",
      "up",
      "out",
      "off",
      "down",
      "away",
      "back",
      "over",
      "through",
      "around",
      "along",
      "across",
      "aside",
      "apart",
      "ahead",
      "behind",
      "forward",
      "together",
      "round",
      "out of",
      "up on",
      "up to",
      "up with",
      "in on",
      "out for",
      "back to",
      "up for",
      "away from",
      "down on",
      "along with",
      "away at",
      "back on",
      "down to",
      "in with",
      "out on",
      "away with",
      "in for",
      "off on",
      "off with",
      "on to",
      "out with",
      "ahead with",
      "around to",
      "down with",
      "forward to",
      "on with",
      "out about",
      "out against",
      "out at",
      "out to",
      "over with",
      "through to",
      "through with",
      "up against",
      "up as",
      "up in"
    ],
    "keyKinds": {
      "about": "both",
      "at": "preposition",
      "for": "preposition",
      "from": "preposition",
      "in": "both",
      "into": "preposition",
      "of": "preposition",
      "on": "both",
      "onto": "preposition",
      "to": "preposition",
      "with": "preposition",
      "against": "preposition",
      "among": "preposition",
      "as": "preposition",
      "between": "preposition",
      "by": "both",
      "like": "preposition",
      "towards": "preposition",
      "under": "particle",
      "upon": "preposition",
      "without": "preposition",
      "up": "particle",
      "out": "particle",
      "off": "both",
      "down": "particle",
      "away": "particle",
      "back": "particle",
      "over": "both",
      "through": "both",
      "around": "both",
      "along": "particle",
      "across": "both",
      "aside": "particle",
      "apart": "particle",
      "ahead": "particle",
      "behind": "both",
      "forward": "particle",
      "together": "particle",
      "round": "particle",
      "after": "preposition",
      "above": "preposition",
      "out of": "particle",
      "up on": "particle",
      "up to": "particle",
      "up with": "particle",
      "in on": "particle",
      "out for": "particle",
      "back to": "particle",
      "up for": "particle",
      "away from": "particle",
      "down on": "particle",
      "along with": "particle",
      "away at": "particle",
      "back on": "particle",
      "down to": "particle",
      "in with": "particle",
      "out on": "particle",
      "away with": "particle",
      "in for": "particle",
      "off on": "particle",
      "off with": "particle",
      "on to": "particle",
      "out with": "particle",
      "ahead with": "particle",
      "around to": "particle",
      "down with": "particle",
      "forward to": "particle",
      "on with": "particle",
      "out about": "particle",
      "out against": "particle",
      "out at": "particle",
      "out to": "particle",
      "over with": "particle",
      "through to": "particle",
      "through with": "particle",
      "up against": "particle",
      "up as": "particle",
      "up in": "particle"
    },
    "keyNote": "Keys are whatever follows the verb: a dependent preposition (depend on), an adverb particle of a phrasal verb (give up), or a particle + preposition sequence (put up with). keyKinds tells them apart; \"both\" means the key is used both ways by different verbs/senses.",
    "sources": [
      {
        "id": "authored",
        "label": "本项目自编英语动词搭配与例句（原创句子与中文翻译）",
        "license": "project-authored"
      },
      {
        "id": "wordfreq",
        "label": "wordfreq Zipf 频率（仅用于动词排序）",
        "license": "wordfreq MIT / data CC BY-SA 4.0"
      }
    ],
    "generatedBy": "scripts/build_english_collocations.py"
  },
  "verbs": {
    "abide": {
      "display": "abide",
      "prepositions": {
        "by": [
          "Players must abide by the rules of the game. 选手必须遵守比赛规则。",
          "We will abide by the committee's decision. 我们会遵从委员会的决定。"
        ]
      },
      "prepositionOrder": [
        "by"
      ],
      "zipf": 3.59,
      "senses": {
        "by": [
          {
            "zh": "遵守",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "abound": {
      "display": "abound",
      "prepositions": {
        "in": [
          "The river abounds in fish. 这条河里鱼很多。",
          "The region abounds in natural resources. 这个地区自然资源丰富。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.27,
      "senses": {
        "in": [
          {
            "zh": "富于；充满",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "absorb": {
      "display": "absorb",
      "prepositions": {
        "in": [
          "She was so absorbed in her book that she missed her stop. 她看书太入迷，坐过了站。",
          "The boys were absorbed in the video game. 男孩们全神贯注地玩着电子游戏。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.81,
      "senses": {
        "in": [
          {
            "zh": "使专心于；使全神贯注",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "abstain": {
      "display": "abstain",
      "prepositions": {
        "from": [
          "Patients should abstain from alcohol before surgery. 病人手术前应戒酒。",
          "Three members abstained from voting. 有三名成员投了弃权票。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.07,
      "senses": {
        "from": [
          {
            "zh": "戒除；（投票时）弃权",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "account": {
      "display": "account",
      "prepositions": {
        "for": [
          "How do you account for the missing money? 你怎么解释那笔不见了的钱？",
          "Nobody could account for his sudden change of mood. 没人能解释他为何突然情绪大变。",
          "Young people account for most of our customers. 年轻人占了我们顾客的大多数。",
          "Oil exports accounted for half of the national income. 石油出口占了国民收入的一半。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 5.21,
      "senses": {
        "for": [
          {
            "zh": "解释；说明",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "占（比例）",
            "kind": "preposition",
            "examples": [
              2,
              3
            ]
          }
        ]
      }
    },
    "accuse": {
      "display": "accuse",
      "prepositions": {
        "of": [
          "The police accused him of theft. 警方指控他盗窃。",
          "She was accused of lying to the court. 她被指控在法庭上撒谎。",
          "Don't accuse me of something I didn't do. 别把我没做过的事栽到我头上。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.71,
      "senses": {
        "of": [
          {
            "zh": "指控；指责",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "accustom": {
      "display": "accustom",
      "prepositions": {
        "to": [
          "It took me a while to accustom myself to the noise. 我花了一段时间才习惯那噪音。",
          "She is not accustomed to such cold weather. 她不习惯这么冷的天气。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 2.06,
      "senses": {
        "to": [
          {
            "zh": "使习惯于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "acquaint": {
      "display": "acquaint",
      "prepositions": {
        "with": [
          "Please acquaint yourself with the safety procedures. 请熟悉一下安全程序。",
          "Are you acquainted with the new manager? 你认识新来的经理吗？"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 2.51,
      "senses": {
        "with": [
          {
            "zh": "使熟悉；使了解",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "act": {
      "display": "act",
      "prepositions": {
        "on": [
          "The police acted on a tip from a neighbor. 警方根据一位邻居提供的线索采取了行动。",
          "This medicine acts on the nervous system. 这种药作用于神经系统。"
        ],
        "as": [
          "A large tree acted as a shelter from the rain. 一棵大树成了躲雨的地方。",
          "She will act as our guide during the trip. 旅途中她将担任我们的导游。"
        ],
        "up": [
          "My old laptop is acting up again. 我的旧笔记本电脑又出毛病了。",
          "The kids always act up when they are tired. 孩子们一累就开始闹。"
        ],
        "out": [
          "The children acted out a scene from the story. 孩子们把故事中的一个场景表演了出来。",
          "Some teenagers act out when they feel ignored. 有些青少年觉得被忽视时就会做出过激行为。"
        ]
      },
      "prepositionOrder": [
        "on",
        "as",
        "up",
        "out"
      ],
      "zipf": 5.3,
      "senses": {
        "on": [
          {
            "zh": "按照……行事；对……起作用",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "as": [
          {
            "zh": "充当；担任",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "捣乱；（机器）出毛病",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "表演出来；（因情绪）做出不良举动",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "adapt": {
      "display": "adapt",
      "prepositions": {
        "to": [
          "It took her months to adapt to the cold climate. 她花了好几个月才适应寒冷的气候。",
          "Animals must adapt to changes in their environment. 动物必须适应环境的变化。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.98,
      "senses": {
        "to": [
          {
            "zh": "适应",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "add": {
      "display": "add",
      "prepositions": {
        "up": [
          "Can you add up these numbers for me? 你能帮我把这些数字加起来吗？",
          "His story just doesn't add up. 他的说法根本说不通。"
        ],
        "up to": [
          "Small savings can add up to a large sum. 小额储蓄积累起来也能成为一大笔钱。",
          "All these delays add up to a serious problem. 这些延误加在一起就是个严重问题。"
        ],
        "to": [
          "The bad weather added to our difficulties. 恶劣的天气给我们增添了困难。",
          "The new garden adds to the value of the house. 新花园提升了房子的价值。"
        ],
        "on": [
          "They added on a small fee for delivery. 他们另加了一小笔送货费。",
          "We plan to add a room on at the back. 我们打算在后面加盖一个房间。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up to",
        "to",
        "on"
      ],
      "zipf": 5.09,
      "senses": {
        "up": [
          {
            "zh": "加起来；讲得通",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up to": [
          {
            "zh": "总计达；意味着",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "增加；增添",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "附加；加上",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "adhere": {
      "display": "adhere",
      "prepositions": {
        "to": [
          "All staff must adhere to the safety rules. 全体员工都必须遵守安全规定。",
          "He adhered to his principles all his life. 他一生都坚守自己的原则。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.57,
      "senses": {
        "to": [
          {
            "zh": "遵守；坚持",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "adjust": {
      "display": "adjust",
      "prepositions": {
        "to": [
          "My eyes slowly adjusted to the darkness. 我的眼睛慢慢适应了黑暗。",
          "New students need time to adjust to university life. 新生需要时间来适应大学生活。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.07,
      "senses": {
        "to": [
          {
            "zh": "适应；调整以适应",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "admit": {
      "display": "admit",
      "prepositions": {
        "to": [
          "He admitted to breaking the window. 他承认打破了窗户。",
          "She would never admit to being wrong. 她绝不会承认自己错了。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.58,
      "senses": {
        "to": [
          {
            "zh": "承认（错误、罪行等）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "advise": {
      "display": "advise",
      "prepositions": {
        "against": [
          "The doctor advised against eating too much salt. 医生建议不要吃太多盐。",
          "I would advise against traveling alone at night. 我建议不要夜里独自出行。"
        ],
        "on": [
          "She advises companies on tax matters. 她为企业提供税务方面的咨询。",
          "A lawyer can advise you on your rights. 律师可以就你的权利为你提供建议。"
        ]
      },
      "prepositionOrder": [
        "against",
        "on"
      ],
      "zipf": 4.09,
      "senses": {
        "against": [
          {
            "zh": "劝阻；建议不要",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "就……提供建议",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "agree": {
      "display": "agree",
      "prepositions": {
        "with": [
          "I completely agree with you. 我完全同意你的看法。",
          "Most experts agree with this conclusion. 大多数专家赞同这个结论。",
          "Spicy food doesn't agree with me. 辛辣食物不适合我。"
        ],
        "on": [
          "We finally agreed on a date for the wedding. 我们终于商定了婚礼的日期。",
          "The two sides could not agree on a price. 双方未能就价格达成一致。"
        ],
        "to": [
          "The boss agreed to our plan. 老板同意了我们的计划。",
          "Both countries agreed to the terms of the treaty. 两国都接受了条约的条款。"
        ]
      },
      "prepositionOrder": [
        "with",
        "on",
        "to"
      ],
      "zipf": 4.97,
      "senses": {
        "with": [
          {
            "zh": "同意（某人或观点）；（食物、气候）适合",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "on": [
          {
            "zh": "就……达成一致",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "同意（计划、提议）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "aim": {
      "display": "aim",
      "prepositions": {
        "at": [
          "The hunter aimed at the deer but missed. 猎人瞄准了那头鹿，但没打中。",
          "This course is aimed at beginners. 这门课程是面向初学者的。"
        ],
        "for": [
          "We are aiming for a higher score this year. 我们今年力争拿到更高的分数。",
          "Always aim for the best, but prepare for the worst. 要力争最好，但也要做最坏的打算。"
        ]
      },
      "prepositionOrder": [
        "at",
        "for"
      ],
      "zipf": 4.51,
      "senses": {
        "at": [
          {
            "zh": "瞄准；针对",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "力争；以……为目标",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "allow": {
      "display": "allow",
      "prepositions": {
        "for": [
          "You should allow for traffic delays. 你应该把交通延误考虑进去。",
          "The budget allows for some extra costs. 预算中留出了一些额外开支的余地。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 5.01,
      "senses": {
        "for": [
          {
            "zh": "考虑到；留出余地",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "allude": {
      "display": "allude",
      "prepositions": {
        "to": [
          "He alluded to his troubles but gave no details. 他暗示了自己的困境，但没有细说。",
          "The speech alluded to recent events in the capital. 演讲中隐约提到了首都最近发生的事。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 2.7,
      "senses": {
        "to": [
          {
            "zh": "暗指；提及",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "alternate": {
      "display": "alternate",
      "prepositions": {
        "between": [
          "The weather alternated between rain and sunshine. 天气时雨时晴。",
          "His mood alternates between joy and despair. 他的情绪在喜悦和绝望之间交替。"
        ]
      },
      "prepositionOrder": [
        "between"
      ],
      "zipf": 4.11,
      "senses": {
        "between": [
          {
            "zh": "在……之间交替",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "amount": {
      "display": "amount",
      "prepositions": {
        "to": [
          "His debts amount to thousands of dollars. 他的债务总计达数千美元。",
          "Their answer amounted to a refusal. 他们的回答等于是拒绝。",
          "The changes don't amount to much. 这些变化算不上什么。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 5.13,
      "senses": {
        "to": [
          {
            "zh": "总计；等于",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "answer": {
      "display": "answer",
      "prepositions": {
        "back": [
          "Children who answer back are often sent to their rooms. 顶嘴的孩子常被罚回自己房间。",
          "Don't answer back when your teacher is speaking. 老师讲话时不要顶嘴。"
        ],
        "for": [
          "One day he will have to answer for his crimes. 总有一天他得为自己的罪行付出代价。",
          "The minister must answer for the failure of the policy. 部长必须为这项政策的失败负责。"
        ],
        "to": [
          "In this company, every manager answers to the board. 在这家公司，每位经理都要向董事会汇报。",
          "She doesn't like having to answer to anyone. 她不喜欢受任何人管束。"
        ]
      },
      "prepositionOrder": [
        "back",
        "for",
        "to"
      ],
      "zipf": 5.17,
      "senses": {
        "back": [
          {
            "zh": "顶嘴",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "对……负责；为……承担后果",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "向……汇报；受……管辖",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "apologize": {
      "display": "apologize",
      "prepositions": {
        "to": [
          "You should apologize to your sister. 你应该向你姐姐道歉。",
          "He apologized to the audience for the delay. 他为延误向观众道歉。"
        ],
        "for": [
          "I apologize for the confusion. 造成混乱，我深表歉意。",
          "She apologized for being late again. 她为又一次迟到而道歉。"
        ]
      },
      "prepositionOrder": [
        "to",
        "for"
      ],
      "zipf": 4.16,
      "senses": {
        "to": [
          {
            "zh": "向（某人）道歉",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "为（某事）道歉",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "appeal": {
      "display": "appeal",
      "prepositions": {
        "to": [
          "This kind of music appeals to young people. 这类音乐吸引年轻人。",
          "The police appealed to the public for help. 警方呼吁公众提供帮助。"
        ],
        "for": [
          "The charity is appealing for donations. 这家慈善机构正在呼吁捐款。",
          "Local leaders appealed for calm after the riot. 骚乱过后，当地领导人呼吁大家保持冷静。"
        ],
        "against": [
          "He plans to appeal against the court's decision. 他打算对法院的判决提出上诉。",
          "The club appealed against the fine. 俱乐部对罚款提出了申诉。"
        ]
      },
      "prepositionOrder": [
        "to",
        "for",
        "against"
      ],
      "zipf": 4.67,
      "senses": {
        "to": [
          {
            "zh": "吸引；向……呼吁",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "呼吁；恳求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "对（判决）提出上诉",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "apply": {
      "display": "apply",
      "prepositions": {
        "for": [
          "She applied for a job at the bank. 她申请了银行的一份工作。",
          "You need to apply for a visa in advance. 你需要提前申请签证。"
        ],
        "to": [
          "These rules apply to everyone. 这些规定适用于所有人。",
          "He applied to three universities. 他申请了三所大学。"
        ]
      },
      "prepositionOrder": [
        "for",
        "to"
      ],
      "zipf": 4.81,
      "senses": {
        "for": [
          {
            "zh": "申请",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "适用于；向……申请",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "approve": {
      "display": "approve",
      "prepositions": {
        "of": [
          "Her parents don't approve of her boyfriend. 她父母不认可她的男朋友。",
          "I don't approve of cheating in any form. 我不赞成任何形式的作弊。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 4.08,
      "senses": {
        "of": [
          {
            "zh": "赞成；认可",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "argue": {
      "display": "argue",
      "prepositions": {
        "with": [
          "He often argues with his brother about money. 他常为钱的事跟他哥哥吵架。",
          "There is no point arguing with her. 跟她争辩毫无意义。"
        ],
        "about": [
          "They argued about politics all evening. 他们整晚都在争论政治问题。",
          "Let's not argue about small things. 我们别为小事争吵了。"
        ],
        "for": [
          "The author argues for stricter gun laws. 作者主张实施更严格的枪支法。",
          "Several members argued for a delay. 有几位成员主张推迟。"
        ],
        "against": [
          "Many scientists argued against the new policy. 许多科学家反对这项新政策。",
          "She argued against moving to the city. 她反对搬到城里去。"
        ]
      },
      "prepositionOrder": [
        "with",
        "about",
        "for",
        "against"
      ],
      "zipf": 4.46,
      "senses": {
        "with": [
          {
            "zh": "与……争吵",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "为……争论",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "主张；为……辩护",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "反对；提出理由反对",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "arise": {
      "display": "arise",
      "prepositions": {
        "from": [
          "Most of our problems arise from poor communication. 我们的大多数问题源于沟通不畅。",
          "Several questions arose from the discussion. 讨论中引出了几个问题。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.93,
      "senses": {
        "from": [
          {
            "zh": "由……引起；起因于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "arrange": {
      "display": "arrange",
      "prepositions": {
        "for": [
          "I have arranged for a taxi to pick you up. 我已经安排了一辆出租车来接你。",
          "The school arranged for extra classes before the exam. 学校在考试前安排了额外的课程。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.0,
      "senses": {
        "for": [
          {
            "zh": "安排（某事或某人做某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "arrive": {
      "display": "arrive",
      "prepositions": {
        "at": [
          "We arrived at the station just in time. 我们刚好及时到达车站。",
          "The jury arrived at a verdict after two days. 陪审团两天后作出了裁决。"
        ],
        "in": [
          "They arrived in Paris late at night. 他们深夜抵达巴黎。",
          "When did you arrive in this country? 你是什么时候来到这个国家的？"
        ]
      },
      "prepositionOrder": [
        "at",
        "in"
      ],
      "zipf": 4.38,
      "senses": {
        "at": [
          {
            "zh": "到达（较小地点）；得出（结论）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "到达（城市、国家）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "ascribe": {
      "display": "ascribe",
      "prepositions": {
        "to": [
          "Doctors ascribe his illness to stress. 医生认为他的病是压力造成的。",
          "This quote is often ascribed to a famous poet. 这句话常被认为出自一位著名诗人。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 2.75,
      "senses": {
        "to": [
          {
            "zh": "把……归于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "ask": {
      "display": "ask",
      "prepositions": {
        "for": [
          "If you get lost, just ask for directions. 如果迷路了，就问问路。",
          "She asked her manager for a day off. 她向经理请了一天假。",
          "The customer asked for the bill. 顾客要求结账。"
        ],
        "about": [
          "He asked about the price of the tickets. 他询问了票价。",
          "Several students asked about the final exam. 有几个学生问起了期末考试的事。"
        ],
        "after": [
          "Your grandmother asked after you yesterday. 你奶奶昨天问起你的近况。",
          "Everyone at the office asks after your health. 办公室里每个人都在问候你的身体。"
        ],
        "out": [
          "He finally asked her out to dinner. 他终于约她出去吃晚饭了。",
          "I was too shy to ask anyone out in college. 大学时我太害羞，从没约过任何人。"
        ],
        "around": [
          "I will ask around and see if anyone has a spare room. 我去四处打听一下，看有没有人有空房间。",
          "She asked around for a good dentist. 她四处打听哪里有好牙医。"
        ]
      },
      "prepositionOrder": [
        "for",
        "about",
        "after",
        "out",
        "around"
      ],
      "zipf": 5.34,
      "senses": {
        "for": [
          {
            "zh": "要求；请求",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "about": [
          {
            "zh": "询问（某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "after": [
          {
            "zh": "问候；打听（某人近况）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "约（某人）出去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "around": [
          {
            "zh": "四处打听",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "aspire": {
      "display": "aspire",
      "prepositions": {
        "to": [
          "She aspires to a career in medicine. 她立志从事医学工作。",
          "Few young players aspire to coaching. 很少有年轻球员有志于当教练。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.47,
      "senses": {
        "to": [
          {
            "zh": "渴望（得到）；有志于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "assist": {
      "display": "assist",
      "prepositions": {
        "with": [
          "Volunteers assisted with the cleanup. 志愿者协助了清理工作。",
          "Can you assist me with these boxes? 你能帮我搬一下这些箱子吗？"
        ],
        "in": [
          "The new tool assists in finding errors. 这个新工具有助于查找错误。",
          "Nurses assisted in the operation. 护士们协助了这次手术。"
        ]
      },
      "prepositionOrder": [
        "with",
        "in"
      ],
      "zipf": 4.42,
      "senses": {
        "with": [
          {
            "zh": "协助（某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "帮助（做某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "associate": {
      "display": "associate",
      "prepositions": {
        "with": [
          "Many people associate summer with the beach. 许多人一想到夏天就会联想到海滩。",
          "His mother didn't want him to associate with those boys. 他母亲不希望他跟那些男孩来往。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 4.39,
      "senses": {
        "with": [
          {
            "zh": "把……联系在一起；与……交往",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "assure": {
      "display": "assure",
      "prepositions": {
        "of": [
          "Let me assure you of our full support. 请相信我们会全力支持你。",
          "The company assured customers of the product's safety. 公司向顾客保证该产品是安全的。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 4.06,
      "senses": {
        "of": [
          {
            "zh": "使确信；向……保证",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "atone": {
      "display": "atone",
      "prepositions": {
        "for": [
          "He tried to atone for his mistakes by helping others. 他试图通过帮助别人来弥补自己的过错。",
          "Nothing can atone for such cruelty. 如此残忍的行为是无法弥补的。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 2.86,
      "senses": {
        "for": [
          {
            "zh": "弥补；赎（罪）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "attach": {
      "display": "attach",
      "prepositions": {
        "to": [
          "Please attach a photo to your application. 请在申请表上附一张照片。",
          "She attaches great importance to honesty. 她非常看重诚实。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.75,
      "senses": {
        "to": [
          {
            "zh": "系上；附上；重视",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "attend": {
      "display": "attend",
      "prepositions": {
        "to": [
          "I have some business to attend to this afternoon. 今天下午我有些事要处理。",
          "A nurse attended to the injured man. 一名护士照料着那位受伤的男子。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.55,
      "senses": {
        "to": [
          {
            "zh": "处理；照料",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "attest": {
      "display": "attest",
      "prepositions": {
        "to": [
          "Her many awards attest to her talent. 她获得的众多奖项证明了她的才华。",
          "Several witnesses attested to his honesty. 几位证人证实了他的诚实。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.25,
      "senses": {
        "to": [
          {
            "zh": "证明；证实",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "attribute": {
      "display": "attribute",
      "prepositions": {
        "to": [
          "He attributes his success to hard work. 他把成功归因于努力。",
          "The poem is usually attributed to an unknown monk. 这首诗通常被认为出自一位无名僧人之手。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.77,
      "senses": {
        "to": [
          {
            "zh": "把……归因于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "auction": {
      "display": "auction",
      "prepositions": {
        "off": [
          "The family auctioned off the old farm. 这家人把老农场拍卖了。",
          "Her paintings were auctioned off for charity. 她的画作被拍卖用于慈善。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 4.27,
      "senses": {
        "off": [
          {
            "zh": "拍卖掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "average": {
      "display": "average",
      "prepositions": {
        "out": [
          "Our monthly costs average out at about a thousand dollars. 我们每月的开支平均约为一千美元。",
          "Good days and bad days usually average out. 好日子和坏日子通常会相互抵消。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 5.16,
      "senses": {
        "out": [
          {
            "zh": "平均为；最终持平",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "back": {
      "display": "back",
      "prepositions": {
        "up": [
          "My friends backed me up during the argument. 争论中我的朋友们都支持我。",
          "Always back up your files before an update. 更新前一定要备份文件。",
          "Can you back the car up a little? 你能把车往后倒一点吗？"
        ],
        "down": [
          "Neither side was willing to back down. 双方都不肯让步。",
          "The government backed down after the protests. 抗议之后政府让步了。"
        ],
        "out": [
          "He backed out of the deal at the last minute. 他在最后一刻退出了这笔交易。",
          "You promised to come, so don't back out now. 你答应过要来的，现在可别反悔。"
        ],
        "off": [
          "The dog growled, so I backed off slowly. 那条狗发出低吼，于是我慢慢往后退。",
          "Back off and let her make her own choice. 别逼她了，让她自己做决定。"
        ],
        "away": [
          "The child backed away from the stranger. 孩子从陌生人身边往后退。",
          "The company backed away from its earlier promise. 公司收回了先前的承诺。"
        ]
      },
      "prepositionOrder": [
        "up",
        "down",
        "out",
        "off",
        "away"
      ],
      "zipf": 6.04,
      "senses": {
        "up": [
          {
            "zh": "支持；备份；倒车",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "down": [
          {
            "zh": "让步；退让",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "退出；食言",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "后退；不再逼迫",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "后退；回避",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bail": {
      "display": "bail",
      "prepositions": {
        "out": [
          "The government bailed out several failing banks. 政府出手救助了几家濒临倒闭的银行。",
          "His parents bailed him out when he lost his job. 他失业时父母帮他渡过了难关。",
          "The pilot bailed out just before the crash. 飞行员在坠机前一刻跳伞逃生。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.01,
      "senses": {
        "out": [
          {
            "zh": "帮助脱离困境；（从飞机）跳伞",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "bank": {
      "display": "bank",
      "prepositions": {
        "on": [
          "Don't bank on getting a pay rise this year. 别指望今年会加薪。",
          "We are banking on good weather for the picnic. 我们指望野餐那天天气好。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 5.16,
      "senses": {
        "on": [
          {
            "zh": "指望；依赖",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bargain": {
      "display": "bargain",
      "prepositions": {
        "with": [
          "She bargained with the seller for twenty minutes. 她和卖家讨价还价了二十分钟。",
          "You can't bargain with kidnappers. 跟绑匪是没法讲条件的。"
        ],
        "for": [
          "We didn't bargain for such heavy traffic. 我们没料到交通会这么拥堵。",
          "He got more trouble than he bargained for. 他惹上的麻烦比预想的多。"
        ]
      },
      "prepositionOrder": [
        "with",
        "for"
      ],
      "zipf": 3.95,
      "senses": {
        "with": [
          {
            "zh": "与……讨价还价",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "预料到（多用于否定）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "base": {
      "display": "base",
      "prepositions": {
        "on": [
          "The film is based on a true story. 这部电影是根据真实故事改编的。",
          "We should base our decisions on facts. 我们应当以事实为依据作决定。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 5.05,
      "senses": {
        "on": [
          {
            "zh": "以……为基础",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "be": {
      "display": "be",
      "prepositions": {
        "over": [
          "The meeting will be over by noon. 会议中午前就会结束。",
          "I'm glad the exams are over at last. 考试终于结束了，我很高兴。"
        ],
        "up to": [
          "It is up to you where we eat tonight. 今晚在哪儿吃由你决定。",
          "What are the kids up to in the garden? 孩子们在花园里搞什么名堂？"
        ],
        "into": [
          "My brother is really into jazz these days. 我哥哥最近特别迷爵士乐。",
          "She was into photography as a teenager. 她十几岁时热衷于摄影。"
        ],
        "off": [
          "I am off to the library now. 我现在要去图书馆了。",
          "This milk smells like it is off. 这牛奶闻起来好像坏了。"
        ],
        "back": [
          "I will be back in ten minutes. 我十分钟后回来。",
          "When is your father back from his trip? 你父亲出差什么时候回来？"
        ]
      },
      "prepositionOrder": [
        "over",
        "up to",
        "into",
        "off",
        "back"
      ],
      "zipf": 6.79,
      "senses": {
        "over": [
          {
            "zh": "结束",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up to": [
          {
            "zh": "由……决定；在搞（鬼）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "热衷于；迷上",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "离开；（食物）变质",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "回来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bear": {
      "display": "bear",
      "prepositions": {
        "with": [
          "Please bear with me for a moment. 请稍等我一下。",
          "Thank you for bearing with us during the repairs. 感谢您在维修期间的耐心。"
        ],
        "out": [
          "The data bears out our theory. 数据证实了我们的理论。",
          "Her story was borne out by the video. 录像证实了她的说法。"
        ],
        "on": [
          "These facts bear on the case. 这些事实与本案有关。",
          "His past does not bear on this decision. 他的过去与这个决定无关。"
        ],
        "up": [
          "She is bearing up well after the loss of her husband. 丈夫去世后她坚强地挺了过来。",
          "How are you bearing up under all this pressure? 在这么大的压力下，你还撑得住吗？"
        ]
      },
      "prepositionOrder": [
        "with",
        "out",
        "on",
        "up"
      ],
      "zipf": 4.71,
      "senses": {
        "with": [
          {
            "zh": "耐心等待；容忍",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "证实",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "与……有关；影响",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "挺住；支撑",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "beat": {
      "display": "beat",
      "prepositions": {
        "up": [
          "A gang beat him up outside the bar. 一伙人在酒吧外把他痛打了一顿。",
          "The victim was badly beaten up. 受害者被打得很惨。"
        ],
        "off": [
          "The small army beat off the attack. 那支小部队击退了进攻。",
          "She beat off strong competition to win the job. 她击败了强劲对手，获得了这份工作。"
        ]
      },
      "prepositionOrder": [
        "up",
        "off"
      ],
      "zipf": 5.01,
      "senses": {
        "up": [
          {
            "zh": "痛打",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "击退；击败（对手）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "beg": {
      "display": "beg",
      "prepositions": {
        "for": [
          "The prisoner begged for mercy. 囚犯乞求宽恕。",
          "An old man was begging for food on the street. 一位老人在街上乞讨食物。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.05,
      "senses": {
        "for": [
          {
            "zh": "乞求；恳求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "begin": {
      "display": "begin",
      "prepositions": {
        "with": [
          "The story begins with a wedding. 故事从一场婚礼开始。",
          "Let's begin with a short review. 我们先简短地复习一下。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 4.84,
      "senses": {
        "with": [
          {
            "zh": "以……开始",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "believe": {
      "display": "believe",
      "prepositions": {
        "in": [
          "Do you believe in ghosts? 你相信有鬼吗？",
          "I believe in hard work and honesty. 我相信勤奋和诚实的价值。",
          "His coach always believed in him. 他的教练一直对他充满信心。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 5.51,
      "senses": {
        "in": [
          {
            "zh": "相信（……的存在或价值）",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "belong": {
      "display": "belong",
      "prepositions": {
        "to": [
          "This bag belongs to my sister. 这个包是我姐姐的。",
          "The island once belonged to Spain. 这座岛曾经属于西班牙。",
          "Which club do you belong to? 你是哪个俱乐部的成员？"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.38,
      "senses": {
        "to": [
          {
            "zh": "属于",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "bend": {
      "display": "bend",
      "prepositions": {
        "down": [
          "He bent down to tie his shoe. 他弯下腰系鞋带。",
          "She bent down and picked up the coin. 她弯腰捡起了那枚硬币。"
        ],
        "over": [
          "The doctor bent over to examine the sick child. 医生俯下身给生病的孩子做检查。",
          "Bend over and touch your toes. 弯下腰摸你的脚趾。"
        ]
      },
      "prepositionOrder": [
        "down",
        "over"
      ],
      "zipf": 4.13,
      "senses": {
        "down": [
          {
            "zh": "弯腰",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "俯身",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "benefit": {
      "display": "benefit",
      "prepositions": {
        "from": [
          "Everyone can benefit from regular exercise. 每个人都能从经常锻炼中受益。",
          "Local shops benefited from the tourist season. 当地商店在旅游旺季获益。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.82,
      "senses": {
        "from": [
          {
            "zh": "从……中受益",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bet": {
      "display": "bet",
      "prepositions": {
        "on": [
          "He bet on the wrong horse. 他押错了马。",
          "I wouldn't bet on him arriving on time. 我可不敢保证他会准时到。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.79,
      "senses": {
        "on": [
          {
            "zh": "在……上下注；确信",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bid": {
      "display": "bid",
      "prepositions": {
        "for": [
          "Three companies are bidding for the contract. 有三家公司在竞标这份合同。",
          "The city bid for the Olympic Games. 这座城市申办过奥运会。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.4,
      "senses": {
        "for": [
          {
            "zh": "投标；争取",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bite": {
      "display": "bite",
      "prepositions": {
        "off": [
          "The dog bit off a piece of the sandwich. 狗咬下了一块三明治。",
          "Don't bite off more than you can chew. 别贪多嚼不烂。"
        ],
        "into": [
          "She bit into a crisp apple. 她咬了一口脆苹果。",
          "Rising costs are biting into our profits. 成本上涨正在蚕食我们的利润。"
        ]
      },
      "prepositionOrder": [
        "off",
        "into"
      ],
      "zipf": 4.31,
      "senses": {
        "off": [
          {
            "zh": "咬下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "咬进；侵蚀",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "black": {
      "display": "black",
      "prepositions": {
        "out": [
          "She blacked out from the heat. 她热得昏了过去。",
          "The storm blacked out half the city. 暴风雨让半个城市都停了电。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 5.46,
      "senses": {
        "out": [
          {
            "zh": "昏厥；（使）停电",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "blame": {
      "display": "blame",
      "prepositions": {
        "for": [
          "Don't blame yourself for the accident. 别为这次事故责怪自己。",
          "They blamed the coach for the defeat. 他们把失利归咎于教练。"
        ],
        "on": [
          "He blamed the mistake on his assistant. 他把错误归咎于他的助理。",
          "You can't blame everything on bad luck. 你不能把一切都怪到运气不好上。"
        ]
      },
      "prepositionOrder": [
        "for",
        "on"
      ],
      "zipf": 4.63,
      "senses": {
        "for": [
          {
            "zh": "因……责怪",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "把……归咎于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "blend": {
      "display": "blend",
      "prepositions": {
        "in": [
          "The new building blends in with its surroundings. 新楼与周围环境融为一体。",
          "He tried to blend in with the locals. 他努力融入当地人之中。"
        ],
        "with": [
          "Blend the butter with the sugar. 把黄油和糖搅拌均匀。",
          "Her voice blended with the music. 她的声音与音乐融为一体。"
        ]
      },
      "prepositionOrder": [
        "in",
        "with"
      ],
      "zipf": 3.95,
      "senses": {
        "in": [
          {
            "zh": "融入；协调",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……混合",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bless": {
      "display": "bless",
      "prepositions": {
        "with": [
          "She is blessed with a beautiful voice. 她天生有一副好嗓子。",
          "We have been blessed with good health. 我们有幸身体一直很健康。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 4.17,
      "senses": {
        "with": [
          {
            "zh": "使有幸拥有",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "block": {
      "display": "block",
      "prepositions": {
        "out": [
          "Thick curtains block out the light. 厚窗帘能挡住光线。",
          "She tried to block out the painful memory. 她试图忘掉那段痛苦的回忆。"
        ],
        "off": [
          "Police blocked off the street after the accident. 事故发生后警方封锁了这条街。",
          "The main entrance was blocked off for repairs. 正门因维修被封闭了。"
        ]
      },
      "prepositionOrder": [
        "out",
        "off"
      ],
      "zipf": 4.88,
      "senses": {
        "out": [
          {
            "zh": "遮挡；刻意忘掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "封锁",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "blow": {
      "display": "blow",
      "prepositions": {
        "up": [
          "The soldiers blew up the bridge. 士兵们炸毁了那座桥。",
          "Can you help me blow up these balloons? 你能帮我吹这些气球吗？",
          "He blew up at me for no reason. 他无缘无故冲我发火。"
        ],
        "out": [
          "She blew out the candles on her cake. 她吹灭了蛋糕上的蜡烛。",
          "The wind blew the match out. 风把火柴吹灭了。"
        ],
        "over": [
          "Wait until the storm blows over. 等风暴过去再说。",
          "The scandal soon blew over. 丑闻很快就平息了。"
        ],
        "away": [
          "The wind blew my hat away. 风把我的帽子吹跑了。",
          "Her performance blew the judges away. 她的表演让评委们惊叹不已。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out",
        "over",
        "away"
      ],
      "zipf": 4.59,
      "senses": {
        "up": [
          {
            "zh": "爆炸；炸毁；给……充气；发火",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "out": [
          {
            "zh": "吹灭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "（风波）平息；（风暴）过去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "吹走；使惊叹",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "boast": {
      "display": "boast",
      "prepositions": {
        "about": [
          "He is always boasting about his rich uncle. 他总是吹嘘他那个有钱的叔叔。",
          "She never boasts about her grades. 她从不炫耀自己的成绩。"
        ],
        "of": [
          "He boasted of his victory to anyone who would listen. 他逢人便吹嘘自己的胜利。",
          "The general often boasted of his courage in battle. 那位将军常夸耀自己在战场上的英勇。"
        ]
      },
      "prepositionOrder": [
        "about",
        "of"
      ],
      "zipf": 3.51,
      "senses": {
        "about": [
          {
            "zh": "吹嘘；夸耀",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "of": [
          {
            "zh": "吹嘘；夸耀（较正式）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bog": {
      "display": "bog",
      "prepositions": {
        "down": [
          "The project got bogged down in paperwork. 这个项目陷在了繁琐的文书工作中。",
          "Don't get bogged down in small details. 别在细枝末节上纠缠。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 3.34,
      "senses": {
        "down": [
          {
            "zh": "使陷入困境；使停滞",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "boil": {
      "display": "boil",
      "prepositions": {
        "down to": [
          "The whole problem boils down to money. 整个问题归根结底是钱的问题。",
          "What it boils down to is a lack of trust. 说到底就是缺乏信任。"
        ],
        "over": [
          "Watch the milk so it doesn't boil over. 看着牛奶，别让它溢出来。",
          "Anger finally boiled over into violence. 愤怒最终演变成了暴力。"
        ]
      },
      "prepositionOrder": [
        "down to",
        "over"
      ],
      "zipf": 3.83,
      "senses": {
        "down to": [
          {
            "zh": "归结为",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "沸腾溢出；（情绪）失控",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bone": {
      "display": "bone",
      "prepositions": {
        "up on": [
          "I need to bone up on my French before the trip. 出发前我得突击一下法语。",
          "She boned up on the company before the interview. 面试前她恶补了关于这家公司的信息。"
        ]
      },
      "prepositionOrder": [
        "up on"
      ],
      "zipf": 4.47,
      "senses": {
        "up on": [
          {
            "zh": "突击学习；温习",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "book": {
      "display": "book",
      "prepositions": {
        "in": [
          "We booked in at the hotel around six. 我们六点左右在酒店办理了入住。",
          "Please book in at the front desk first. 请先到前台登记。"
        ],
        "up": [
          "The restaurant is booked up for the weekend. 这家餐厅周末已经订满了。",
          "Summer flights book up quickly. 夏季航班很快就会订满。"
        ]
      },
      "prepositionOrder": [
        "in",
        "up"
      ],
      "zipf": 5.43,
      "senses": {
        "in": [
          {
            "zh": "登记入住",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "订满",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "boot": {
      "display": "boot",
      "prepositions": {
        "up": [
          "My computer takes ages to boot up. 我的电脑要很久才能启动。",
          "Boot up the system and log in. 启动系统然后登录。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.19,
      "senses": {
        "up": [
          {
            "zh": "启动（电脑）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "border": {
      "display": "border",
      "prepositions": {
        "on": [
          "His confidence borders on arrogance. 他的自信近乎傲慢。",
          "The situation bordered on the absurd. 情况简直荒唐。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.7,
      "senses": {
        "on": [
          {
            "zh": "接近；近乎",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "borrow": {
      "display": "borrow",
      "prepositions": {
        "from": [
          "I borrowed some money from my cousin. 我向我表哥借了些钱。",
          "English has borrowed many words from French. 英语从法语中借用了许多词汇。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.0,
      "senses": {
        "from": [
          {
            "zh": "向……借",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "boss": {
      "display": "boss",
      "prepositions": {
        "around": [
          "Stop bossing me around! 别再对我指手画脚了！",
          "He bosses his younger brothers around all day. 他整天对弟弟们颐指气使。"
        ]
      },
      "prepositionOrder": [
        "around"
      ],
      "zipf": 4.76,
      "senses": {
        "around": [
          {
            "zh": "对……发号施令",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bother": {
      "display": "bother",
      "prepositions": {
        "about": [
          "Don't bother about the dishes, I will do them. 别管碗了，我来洗。",
          "He never bothers about what others think. 他从不在乎别人怎么想。"
        ],
        "with": [
          "I won't bother with a coat today. 今天我就不穿外套了。",
          "Why bother with details at this stage? 现在这个阶段何必在细节上费心？"
        ]
      },
      "prepositionOrder": [
        "about",
        "with"
      ],
      "zipf": 4.39,
      "senses": {
        "about": [
          {
            "zh": "为……操心",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "费心于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bottle": {
      "display": "bottle",
      "prepositions": {
        "up": [
          "It is unhealthy to bottle up your anger. 压抑怒火对身体不好。",
          "He bottled up his feelings for years. 他多年来一直把感情藏在心里。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.57,
      "senses": {
        "up": [
          {
            "zh": "抑制（情绪）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bottom": {
      "display": "bottom",
      "prepositions": {
        "out": [
          "House prices seem to have bottomed out. 房价似乎已经触底了。",
          "The recession is expected to bottom out next year. 经济衰退预计明年触底。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.84,
      "senses": {
        "out": [
          {
            "zh": "降到最低点",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bounce": {
      "display": "bounce",
      "prepositions": {
        "back": [
          "The economy bounced back quickly. 经济迅速复苏了。",
          "She bounced back after a bad start. 开局不利后她重新振作了起来。"
        ],
        "off": [
          "The ball bounced off the wall. 球从墙上弹了回来。",
          "Can I bounce a few ideas off you? 我能跟你交流几个想法吗？"
        ]
      },
      "prepositionOrder": [
        "back",
        "off"
      ],
      "zipf": 4.02,
      "senses": {
        "back": [
          {
            "zh": "恢复；重新振作",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "从……弹回；（与人）交流（想法）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bow": {
      "display": "bow",
      "prepositions": {
        "to": [
          "The actors bowed to the audience. 演员们向观众鞠躬。",
          "The company bowed to public pressure. 公司屈服于公众压力。"
        ],
        "out": [
          "The champion bowed out after twenty years. 冠军在二十年后宣布隐退。",
          "He bowed out of the race for health reasons. 他因健康原因退出了竞选。"
        ]
      },
      "prepositionOrder": [
        "to",
        "out"
      ],
      "zipf": 4.3,
      "senses": {
        "to": [
          {
            "zh": "向……鞠躬；屈服于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "退出；隐退",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "box": {
      "display": "box",
      "prepositions": {
        "in": [
          "Another car boxed me in at the parking lot. 在停车场另一辆车把我堵住了。",
          "She felt boxed in by the strict rules. 严格的规定让她感到束手束脚。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 5.04,
      "senses": {
        "in": [
          {
            "zh": "困住；包围",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "brace": {
      "display": "brace",
      "prepositions": {
        "for": [
          "The coastal towns are bracing for the storm. 沿海城镇正在为风暴做准备。",
          "Brace yourself for some bad news. 做好心理准备，有坏消息。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 3.72,
      "senses": {
        "for": [
          {
            "zh": "为（困难）做好准备",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "brag": {
      "display": "brag",
      "prepositions": {
        "about": [
          "He likes to brag about his new car. 他喜欢炫耀他的新车。",
          "She never bragged about her success. 她从不夸耀自己的成功。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 3.49,
      "senses": {
        "about": [
          {
            "zh": "吹嘘",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "branch": {
      "display": "branch",
      "prepositions": {
        "out": [
          "The bakery branched out into coffee. 那家面包店把业务扩展到了咖啡。",
          "After years as a singer, she branched out into acting. 做了多年歌手后，她开始涉足表演。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.58,
      "senses": {
        "out": [
          {
            "zh": "扩展业务；拓展领域",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "break": {
      "display": "break",
      "prepositions": {
        "down": [
          "Our car broke down on the highway. 我们的车在高速公路上抛锚了。",
          "She broke down in tears at the funeral. 她在葬礼上失声痛哭。",
          "The peace talks broke down last week. 和谈上周破裂了。",
          "Enzymes break down food in the stomach. 酶在胃里分解食物。",
          "Let's break the task down into smaller steps. 我们把任务分解成更小的步骤吧。"
        ],
        "up": [
          "She broke up with her boyfriend last month. 她上个月和男朋友分手了。",
          "The band broke up after their third album. 乐队在发行第三张专辑后解散了。",
          "Police broke up the fight. 警察制止了斗殴。"
        ],
        "into": [
          "Someone broke into our house last night. 昨晚有人闯进了我们家。",
          "The crowd broke into applause. 人群中突然爆发出掌声。"
        ],
        "in": [
          "Thieves broke in while we were on holiday. 我们度假时小偷闯了进来。",
          "Sorry to break in, but dinner is ready. 抱歉打断一下，晚饭好了。"
        ],
        "out": [
          "War broke out in the summer of that year. 那年夏天爆发了战争。",
          "A fire broke out in the kitchen. 厨房突然起火了。"
        ],
        "out of": [
          "Two prisoners broke out of jail last night. 昨晚有两名囚犯越狱了。",
          "She wanted to break out of her daily routine. 她想摆脱日复一日的生活。"
        ],
        "off": [
          "They broke off their engagement. 他们解除了婚约。",
          "He broke off a piece of chocolate. 他掰下一块巧克力。"
        ],
        "through": [
          "Our troops finally broke through the enemy lines. 我们的部队终于突破了敌军防线。",
          "The sun broke through after the rain. 雨后太阳破云而出。"
        ],
        "away": [
          "The region wants to break away from the country. 该地区想脱离这个国家。",
          "The prisoner broke away from the guards. 囚犯挣脱了看守。"
        ]
      },
      "prepositionOrder": [
        "down",
        "up",
        "into",
        "in",
        "out",
        "out of",
        "off",
        "through",
        "away"
      ],
      "zipf": 5.18,
      "senses": {
        "down": [
          {
            "zh": "（机器）出故障；（情绪）崩溃；（谈判）破裂",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          },
          {
            "zh": "分解；细分",
            "kind": "particle",
            "examples": [
              3,
              4
            ]
          }
        ],
        "up": [
          {
            "zh": "分手；解散；制止（打斗）",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "into": [
          {
            "zh": "破门而入；突然开始（某动作）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "闯入；插嘴",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "（战争、火灾等）爆发；逃出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out of": [
          {
            "zh": "逃出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "中断；折断",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "突破",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "脱离；挣脱",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "breathe": {
      "display": "breathe",
      "prepositions": {
        "in": [
          "Breathe in slowly through your nose. 用鼻子慢慢吸气。",
          "He breathed in the fresh mountain air. 他呼吸着山间清新的空气。"
        ],
        "out": [
          "Now breathe out through your mouth. 现在用嘴呼气。",
          "She breathed out a sigh of relief. 她松了一口气。"
        ]
      },
      "prepositionOrder": [
        "in",
        "out"
      ],
      "zipf": 4.26,
      "senses": {
        "in": [
          {
            "zh": "吸气",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "呼气",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "brighten": {
      "display": "brighten",
      "prepositions": {
        "up": [
          "The sky brightened up in the afternoon. 下午天空放晴了。",
          "Fresh flowers will brighten up the room. 鲜花会让房间亮堂起来。",
          "His face brightened up when he saw her. 他一看到她，脸上就露出了笑容。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.25,
      "senses": {
        "up": [
          {
            "zh": "变得明亮；使高兴起来",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "bring": {
      "display": "bring",
      "prepositions": {
        "up": [
          "She was brought up by her grandparents. 她是由祖父母抚养长大的。",
          "Please don't bring up politics at dinner. 吃饭时请别提政治。",
          "He brought the issue up at the meeting. 他在会上提出了这个问题。"
        ],
        "about": [
          "The internet brought about huge social changes. 互联网带来了巨大的社会变革。",
          "What brought about this sudden decision? 是什么促成了这个突然的决定？"
        ],
        "back": [
          "Could you bring back some bread? 你能带些面包回来吗？",
          "This song brings back happy memories. 这首歌唤起了美好的回忆。",
          "The town wants to bring back its old market. 小镇想恢复原来的集市。"
        ],
        "down": [
          "The new policy should bring down prices. 新政策应该能降低物价。",
          "The scandal brought down the government. 这桩丑闻导致政府倒台。"
        ],
        "in": [
          "The company brought in a new manager. 公司请来了一位新经理。",
          "The concert brought in a lot of money. 这场音乐会带来了一大笔收入。"
        ],
        "out": [
          "The firm will bring out a new phone next month. 这家公司下个月将推出一款新手机。",
          "A crisis brings out the best in some people. 危机能激发一些人最好的一面。"
        ],
        "forward": [
          "The meeting has been brought forward to Monday. 会议已提前到星期一。",
          "She brought forward a new proposal. 她提出了一项新建议。"
        ],
        "along": [
          "Feel free to bring along a friend. 欢迎带个朋友来。",
          "Remember to bring your camera along. 记得带上相机。"
        ],
        "round": [
          "The nurse brought him round with cold water. 护士用冷水把他弄醒了。",
          "We finally brought her round to our view. 我们终于说服她接受我们的观点。"
        ]
      },
      "prepositionOrder": [
        "up",
        "about",
        "back",
        "down",
        "in",
        "out",
        "forward",
        "along",
        "round"
      ],
      "zipf": 5.27,
      "senses": {
        "up": [
          {
            "zh": "抚养；提出（话题）",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "about": [
          {
            "zh": "引起；导致",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "带回；使回忆起；恢复",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "down": [
          {
            "zh": "降低；推翻",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "引进；带来（收入）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "推出；使显现",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "forward": [
          {
            "zh": "提前；提出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "along": [
          {
            "zh": "带上",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "round": [
          {
            "zh": "使苏醒；说服",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "browse": {
      "display": "browse",
      "prepositions": {
        "through": [
          "I browsed through some magazines while I waited. 等候时我翻看了几本杂志。",
          "She browsed through the online catalog. 她浏览了在线目录。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 3.59,
      "senses": {
        "through": [
          {
            "zh": "浏览；翻阅",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "buckle": {
      "display": "buckle",
      "prepositions": {
        "up": [
          "Please buckle up before we start. 出发前请系好安全带。",
          "The driver reminded everyone to buckle up. 司机提醒大家系好安全带。"
        ],
        "down": [
          "You need to buckle down and study. 你得静下心来好好学习。",
          "After the holiday, the team buckled down to work. 假期结束后，团队开始专心工作。"
        ]
      },
      "prepositionOrder": [
        "up",
        "down"
      ],
      "zipf": 3.5,
      "senses": {
        "up": [
          {
            "zh": "系好安全带",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "开始认真做事",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "budget": {
      "display": "budget",
      "prepositions": {
        "for": [
          "We budgeted for a new roof this year. 我们今年为换新屋顶编列了预算。",
          "Did you budget for unexpected costs? 你有没有为意外开支做预算？"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.82,
      "senses": {
        "for": [
          {
            "zh": "为……编列预算",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "build": {
      "display": "build",
      "prepositions": {
        "up": [
          "Traffic builds up around five o'clock. 五点左右交通开始拥堵。",
          "Exercise helps you build up your strength. 锻炼有助于增强体力。"
        ],
        "on": [
          "We can build on this early success. 我们可以在这一初步成功的基础上继续发展。",
          "The new study builds on earlier research. 这项新研究是在早期研究的基础上展开的。"
        ]
      },
      "prepositionOrder": [
        "up",
        "on"
      ],
      "zipf": 5.04,
      "senses": {
        "up": [
          {
            "zh": "逐渐增加；增强",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "以……为基础发展",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bump": {
      "display": "bump",
      "prepositions": {
        "into": [
          "I bumped into an old friend at the station. 我在车站碰到一个老朋友。",
          "He bumped into a chair in the dark. 他在黑暗中撞到了一把椅子。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 3.98,
      "senses": {
        "into": [
          {
            "zh": "偶遇；撞上",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "bundle": {
      "display": "bundle",
      "prepositions": {
        "up": [
          "Bundle up, it is freezing outside. 多穿点，外面冷极了。",
          "She bundled up the old newspapers. 她把旧报纸捆了起来。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.93,
      "senses": {
        "up": [
          {
            "zh": "穿暖和；捆扎",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "burn": {
      "display": "burn",
      "prepositions": {
        "down": [
          "The old factory burned down last night. 那座旧工厂昨晚被烧毁了。",
          "Someone tried to burn the barn down. 有人企图烧掉那座谷仓。"
        ],
        "out": [
          "The candle had burned out by morning. 到早上蜡烛已经燃尽了。",
          "Many young doctors burn out within a few years. 许多年轻医生几年内就精疲力竭了。"
        ],
        "up": [
          "The rocket burned up in the atmosphere. 火箭在大气层中烧毁了。",
          "The child is burning up with fever. 孩子烧得滚烫。"
        ]
      },
      "prepositionOrder": [
        "down",
        "out",
        "up"
      ],
      "zipf": 4.53,
      "senses": {
        "down": [
          {
            "zh": "烧毁",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "燃尽；精疲力竭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "烧光；发高烧",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "burst": {
      "display": "burst",
      "prepositions": {
        "into": [
          "She burst into tears when she heard the news. 听到这个消息，她突然哭了起来。",
          "The house burst into flames. 房子突然燃起熊熊大火。",
          "He burst into the room without knocking. 他没敲门就闯进了房间。"
        ],
        "out": [
          "Everyone burst out laughing. 大家突然哄堂大笑。",
          "The boy burst out crying when his balloon flew away. 气球飞走时，小男孩突然大哭起来。"
        ]
      },
      "prepositionOrder": [
        "into",
        "out"
      ],
      "zipf": 4.15,
      "senses": {
        "into": [
          {
            "zh": "突然（哭、笑等）；闯入",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "out": [
          {
            "zh": "突然（大笑、大喊）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "butt": {
      "display": "butt",
      "prepositions": {
        "in": [
          "Sorry to butt in, but you have a phone call. 抱歉插一句，有你的电话。",
          "Stop butting in on our conversation. 别打断我们谈话。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 4.28,
      "senses": {
        "in": [
          {
            "zh": "插嘴；干涉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "buy": {
      "display": "buy",
      "prepositions": {
        "up": [
          "Investors are buying up land near the coast. 投资者正在大量收购海岸附近的土地。",
          "She bought up all the tickets. 她把票全买下了。"
        ],
        "out": [
          "He bought out his partner last year. 他去年买下了合伙人的股份。",
          "A larger firm bought the company out. 一家更大的公司收购了该公司。"
        ],
        "into": [
          "I don't buy into all that advertising. 我可不信那些广告。",
          "Many voters bought into his promises. 许多选民相信了他的承诺。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out",
        "into"
      ],
      "zipf": 5.32,
      "senses": {
        "up": [
          {
            "zh": "全部买下；大量收购",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "买断（股份）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "相信；接受（观点）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "call": {
      "display": "call",
      "prepositions": {
        "off": [
          "They called off the match because of the rain. 因为下雨，他们取消了比赛。",
          "The wedding was called off at the last minute. 婚礼在最后一刻被取消了。",
          "We had to call the trip off. 我们不得不取消这次旅行。"
        ],
        "back": [
          "I'm busy right now; can I call you back later? 我现在很忙，稍后给你回电话好吗？",
          "She never called me back. 她一直没给我回电话。"
        ],
        "for": [
          "This situation calls for immediate action. 这种情况需要立即采取行动。",
          "The recipe calls for two eggs and some milk. 这个食谱需要两个鸡蛋和一些牛奶。",
          "Protesters are calling for lower taxes. 抗议者要求降低税收。"
        ],
        "on": [
          "The teacher called on me to answer the question. 老师叫我回答问题。",
          "The mayor called on residents to save water. 市长号召居民节约用水。",
          "We called on our old neighbors during the holiday. 假期里我们拜访了老邻居。"
        ],
        "up": [
          "I called up my brother to wish him happy birthday. 我打电话祝哥哥生日快乐。",
          "He was called up to serve in the army. 他被征召入伍。"
        ],
        "in": [
          "The company called in a consultant to fix the problem. 公司请来一位顾问解决问题。",
          "We had to call in a plumber last night. 昨晚我们不得不叫来一个水管工。"
        ],
        "out": [
          "Someone called out my name in the crowd. 人群中有人喊了我的名字。",
          "She called out the manager for his rude behavior. 她公开指责经理的粗鲁行为。"
        ]
      },
      "prepositionOrder": [
        "off",
        "back",
        "for",
        "on",
        "up",
        "in",
        "out"
      ],
      "zipf": 5.51,
      "senses": {
        "off": [
          {
            "zh": "取消",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "back": [
          {
            "zh": "回电话",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "需要；要求",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "on": [
          {
            "zh": "号召；请求；拜访",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "up": [
          {
            "zh": "打电话给；征召",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "请来（专家等）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "大声喊；公开指责",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "calm": {
      "display": "calm",
      "prepositions": {
        "down": [
          "Calm down and tell me what happened. 冷静下来，告诉我发生了什么。",
          "It took an hour to calm the baby down. 花了一个小时才让宝宝平静下来。",
          "The wind finally calmed down in the evening. 傍晚风终于平息了。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.54,
      "senses": {
        "down": [
          {
            "zh": "冷静下来；使平静",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "capitalize": {
      "display": "capitalize",
      "prepositions": {
        "on": [
          "The team capitalized on the other side's mistakes. 这支球队充分利用了对方的失误。",
          "She capitalized on her language skills to find a job. 她凭借语言能力找到了工作。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.34,
      "senses": {
        "on": [
          {
            "zh": "利用",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "care": {
      "display": "care",
      "prepositions": {
        "about": [
          "She really cares about the environment. 她真的很关心环境。",
          "I don't care about what other people think. 我不在乎别人怎么想。",
          "Do you care about politics at all? 你到底关不关心政治？"
        ],
        "for": [
          "He cared for his sick mother for years. 他照顾生病的母亲很多年。",
          "Nurses care for patients day and night. 护士日夜照顾病人。",
          "Would you care for a cup of tea? 您想来杯茶吗？"
        ]
      },
      "prepositionOrder": [
        "about",
        "for"
      ],
      "zipf": 5.56,
      "senses": {
        "about": [
          {
            "zh": "关心；在乎",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "for": [
          {
            "zh": "照顾；想要（礼貌用语）",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "carry": {
      "display": "carry",
      "prepositions": {
        "out": [
          "The researchers carried out a survey of local farmers. 研究人员对当地农民进行了一项调查。",
          "Orders must be carried out without delay. 命令必须立刻执行。",
          "We will carry out the repairs next week. 我们将在下周进行维修。"
        ],
        "on": [
          "Please carry on with your work. 请继续你们的工作。",
          "They carried on talking after the bell rang. 铃响后他们还在继续聊天。",
          "We can't carry on like this forever. 我们不能永远这样下去。"
        ],
        "away": [
          "I got carried away and spent too much money. 我一时冲动花了太多钱。",
          "Don't get carried away by early success. 不要被早期的成功冲昏头脑。"
        ],
        "off": [
          "It was a risky idea, but she carried it off. 这个主意很冒险，但她成功做到了。",
          "Few actors could carry off such a difficult role. 很少有演员能驾驭这么难的角色。"
        ],
        "over": [
          "Unused leave can be carried over to next year. 未休的假期可以结转到明年。",
          "His good mood carried over into the evening. 他的好心情一直延续到晚上。"
        ]
      },
      "prepositionOrder": [
        "out",
        "on",
        "away",
        "off",
        "over"
      ],
      "zipf": 4.89,
      "senses": {
        "out": [
          {
            "zh": "执行；实施；进行",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "on": [
          {
            "zh": "继续",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "away": [
          {
            "zh": "使失去控制；使激动",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "成功完成（难事）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "延续；结转",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "carve": {
      "display": "carve",
      "prepositions": {
        "up": [
          "The empire was carved up after the war. 战后帝国被瓜分了。",
          "The brothers carved up the family business. 兄弟几个瓜分了家族企业。"
        ],
        "out": [
          "She carved out a successful career in law. 她在法律界闯出了一番成功的事业。",
          "The small firm carved out a niche in the market. 这家小公司在市场上开辟了一席之地。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out"
      ],
      "zipf": 3.41,
      "senses": {
        "up": [
          {
            "zh": "瓜分",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "开创；努力取得",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cash": {
      "display": "cash",
      "prepositions": {
        "in on": [
          "Shops are cashing in on the holiday season. 商店都在趁节日季赚钱。",
          "He cashed in on his fame by writing a book. 他借自己的名气写书赚钱。"
        ],
        "in": [
          "She cashed in her savings bonds. 她兑现了储蓄债券。",
          "I cashed in my chips and left the casino. 我兑换了筹码，离开了赌场。"
        ]
      },
      "prepositionOrder": [
        "in on",
        "in"
      ],
      "zipf": 4.92,
      "senses": {
        "in on": [
          {
            "zh": "从中获利",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "兑现",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cast": {
      "display": "cast",
      "prepositions": {
        "off": [
          "The sailors cast off at dawn. 水手们在黎明时解缆起航。",
          "She cast off her old habits and started fresh. 她摆脱旧习惯，重新开始。"
        ],
        "aside": [
          "They cast aside their differences to work together. 他们抛开分歧，共同合作。",
          "Old toys are often cast aside for new ones. 旧玩具常被丢在一边，换上新的。"
        ]
      },
      "prepositionOrder": [
        "off",
        "aside"
      ],
      "zipf": 4.79,
      "senses": {
        "off": [
          {
            "zh": "解缆；摆脱",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "aside": [
          {
            "zh": "抛弃；丢在一边",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "catch": {
      "display": "catch",
      "prepositions": {
        "up": [
          "Walk slowly so the children can catch up. 走慢点，好让孩子们跟上。",
          "I missed a week of school and need to catch up. 我缺了一周课，需要补上。"
        ],
        "up with": [
          "She ran fast to catch up with her friends. 她跑得很快去追赶朋友们。",
          "His lies finally caught up with him. 他的谎言终于让他自食其果。"
        ],
        "up on": [
          "I spent the weekend catching up on sleep. 我周末都在补觉。",
          "Let's meet for coffee and catch up on the news. 我们见面喝杯咖啡，聊聊近况吧。"
        ],
        "on": [
          "The new app caught on quickly among teenagers. 这款新应用很快在青少年中流行起来。",
          "It took him a while to catch on to the joke. 他过了一会儿才明白这个笑话。"
        ],
        "out": [
          "The teacher caught him out with a simple question. 老师用一个简单的问题就让他露了馅。",
          "Many drivers were caught out by the sudden snow. 突如其来的大雪让许多司机措手不及。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up with",
        "up on",
        "on",
        "out"
      ],
      "zipf": 4.87,
      "senses": {
        "up": [
          {
            "zh": "赶上",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up with": [
          {
            "zh": "赶上；（坏事）找上门",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up on": [
          {
            "zh": "补做；了解最新情况",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "流行起来；理解",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "使露出马脚；使措手不及",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cater": {
      "display": "cater",
      "prepositions": {
        "for": [
          "The hotel caters for families with young children. 这家酒店专为带小孩的家庭提供服务。",
          "The school caters for students of all abilities. 这所学校满足各种能力学生的需要。"
        ],
        "to": [
          "These shows cater to popular taste. 这些节目迎合大众口味。",
          "The shop caters to tourists. 这家店面向游客。"
        ]
      },
      "prepositionOrder": [
        "for",
        "to"
      ],
      "zipf": 3.55,
      "senses": {
        "for": [
          {
            "zh": "满足需要；为……提供",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "迎合",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cave": {
      "display": "cave",
      "prepositions": {
        "in": [
          "The roof of the old mine caved in. 旧矿井的顶部坍塌了。",
          "The boss finally caved in to our demands. 老板最终屈服于我们的要求。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 4.2,
      "senses": {
        "in": [
          {
            "zh": "坍塌；屈服",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "center": {
      "display": "center",
      "prepositions": {
        "on": [
          "The discussion centered on climate change. 讨论集中在气候变化上。",
          "The novel centers on a young doctor. 这部小说以一位年轻医生为中心。"
        ],
        "around": [
          "Their lives center around their children. 他们的生活围绕着孩子转。",
          "The town's economy centers around fishing. 这个镇的经济以渔业为中心。"
        ]
      },
      "prepositionOrder": [
        "on",
        "around"
      ],
      "zipf": 5.19,
      "senses": {
        "on": [
          {
            "zh": "以……为中心",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "around": [
          {
            "zh": "围绕",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "chalk": {
      "display": "chalk",
      "prepositions": {
        "up": [
          "The team chalked up another victory. 这支队伍又取得了一场胜利。",
          "She has chalked up many achievements. 她已取得许多成就。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.69,
      "senses": {
        "up": [
          {
            "zh": "取得（成绩）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "change": {
      "display": "change",
      "prepositions": {
        "into": [
          "The caterpillar changed into a butterfly. 毛毛虫变成了蝴蝶。",
          "I need to change into something warmer. 我需要换件暖和点的衣服。"
        ],
        "from": [
          "The light changed from red to green. 信号灯从红色变成了绿色。",
          "His mood changed from calm to angry. 他的情绪从平静转为愤怒。"
        ],
        "over": [
          "The factory changed over to solar power. 工厂改用了太阳能。",
          "We changed over from paper files to an electronic system. 我们从纸质档案改用了电子系统。"
        ],
        "for": [
          "Can I change this shirt for a larger size? 我能把这件衬衫换成大一号的吗？",
          "She changed her dollars for euros at the airport. 她在机场把美元换成了欧元。"
        ]
      },
      "prepositionOrder": [
        "into",
        "from",
        "over",
        "for"
      ],
      "zipf": 5.54,
      "senses": {
        "into": [
          {
            "zh": "变成；换上（衣服）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "从……变成",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "转换；改用",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "换成；兑换",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "charge": {
      "display": "charge",
      "prepositions": {
        "with": [
          "He was charged with theft. 他被控盗窃。",
          "She was charged with organizing the conference. 她负责组织这次会议。"
        ],
        "for": [
          "The hotel charged us for breakfast. 酒店向我们收了早餐费。",
          "They don't charge for delivery. 他们不收送货费。"
        ],
        "into": [
          "The children charged into the room screaming. 孩子们尖叫着冲进房间。",
          "A bull charged into the crowd. 一头公牛冲进了人群。"
        ],
        "up": [
          "Don't forget to charge up your phone. 别忘了给手机充电。",
          "The battery takes an hour to charge up. 电池充满要一个小时。"
        ]
      },
      "prepositionOrder": [
        "with",
        "for",
        "into",
        "up"
      ],
      "zipf": 5.02,
      "senses": {
        "with": [
          {
            "zh": "指控；使负责",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "收费",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "冲进",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "充电",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "chase": {
      "display": "chase",
      "prepositions": {
        "after": [
          "The dog chased after the ball. 狗追着球跑。",
          "He spent years chasing after fame. 他多年来一直追名逐利。"
        ],
        "up": [
          "Could you chase up that order for me? 你能帮我催一下那个订单吗？",
          "I need to chase up the people who haven't paid. 我得催一下那些还没付钱的人。"
        ],
        "away": [
          "The farmer chased away the birds. 农夫把鸟赶走了。",
          "A cup of hot tea chased the cold away. 一杯热茶驱走了寒意。"
        ]
      },
      "prepositionOrder": [
        "after",
        "up",
        "away"
      ],
      "zipf": 4.44,
      "senses": {
        "after": [
          {
            "zh": "追赶；追求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "催促；追查",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "赶走",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "chat": {
      "display": "chat",
      "prepositions": {
        "up": [
          "He tried to chat up the girl at the bar. 他试图和酒吧里的女孩搭讪。",
          "She was chatting up the new neighbor. 她在和新来的邻居搭讪。"
        ],
        "with": [
          "I chatted with my grandma for an hour. 我和奶奶聊了一个小时。",
          "He enjoys chatting with customers. 他喜欢和顾客聊天。"
        ],
        "about": [
          "We chatted about our plans for the summer. 我们聊了聊暑假计划。",
          "They were chatting about football. 他们在聊足球。"
        ]
      },
      "prepositionOrder": [
        "up",
        "with",
        "about"
      ],
      "zipf": 4.57,
      "senses": {
        "up": [
          {
            "zh": "搭讪",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……聊天",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "聊（某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cheat": {
      "display": "cheat",
      "prepositions": {
        "on": [
          "She found out that he had cheated on her. 她发现他对她不忠。",
          "He would never cheat on his wife. 他绝不会背叛妻子。"
        ],
        "out of": [
          "The salesman cheated the old man out of his savings. 推销员骗走了老人的积蓄。",
          "I feel cheated out of a good holiday. 我觉得一个好好的假期被毁了。"
        ],
        "in": [
          "He was caught cheating in the final exam. 他期末考试作弊被抓了。",
          "Anyone who cheats in the race will be disqualified. 任何在比赛中作弊的人都将被取消资格。"
        ]
      },
      "prepositionOrder": [
        "on",
        "out of",
        "in"
      ],
      "zipf": 4.06,
      "senses": {
        "on": [
          {
            "zh": "对……不忠",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out of": [
          {
            "zh": "骗走",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "在……中作弊",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "check": {
      "display": "check",
      "prepositions": {
        "in": [
          "We checked in at the hotel around noon. 我们中午左右在酒店办理了入住。",
          "You should check in two hours before your flight. 你应该在航班起飞前两小时办理登机手续。"
        ],
        "out": [
          "Guests must check out by eleven in the morning. 客人必须在上午十一点前退房。",
          "Check out this video, it's hilarious! 看看这个视频，太搞笑了！",
          "The police are checking out his story. 警方正在核实他的说法。"
        ],
        "on": [
          "I'll go and check on the baby. 我去看看宝宝。",
          "The nurse checks on the patients every hour. 护士每小时查看一次病人。"
        ],
        "up on": [
          "The bank checked up on his credit history. 银行调查了他的信用记录。",
          "My mother always checks up on me when I travel. 我出门在外时，妈妈总要查问我的情况。"
        ],
        "for": [
          "Always check for mistakes before you submit. 提交前一定要检查有没有错误。",
          "The doctor checked him for signs of infection. 医生检查他是否有感染迹象。"
        ],
        "off": [
          "She checked off each item on the list. 她把清单上的每一项都核对打了勾。",
          "Check the names off as people arrive. 人到了就把名字勾掉。"
        ]
      },
      "prepositionOrder": [
        "in",
        "out",
        "on",
        "up on",
        "for",
        "off"
      ],
      "zipf": 5.31,
      "senses": {
        "in": [
          {
            "zh": "登记入住；办理登机手续",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "退房；查看；核实",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "on": [
          {
            "zh": "查看；检查（情况）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up on": [
          {
            "zh": "调查；核查",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "检查是否有",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "核对后打勾",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cheer": {
      "display": "cheer",
      "prepositions": {
        "up": [
          "Cheer up, it's not the end of the world! 振作点，天又没塌下来！",
          "A phone call from her friend cheered her up. 朋友的一个电话让她高兴起来。",
          "We bought him flowers to cheer him up. 我们给他买了花让他开心一下。"
        ],
        "on": [
          "The crowd cheered on the runners at the finish line. 人群在终点为跑步者加油。",
          "Her parents came to cheer her on. 她的父母来为她加油。"
        ],
        "for": [
          "Everyone cheered for the home team. 大家都在为主队欢呼。",
          "The students cheered for their teacher when she won. 老师获胜时学生们为她欢呼。"
        ]
      },
      "prepositionOrder": [
        "up",
        "on",
        "for"
      ],
      "zipf": 4.06,
      "senses": {
        "up": [
          {
            "zh": "使高兴；振作起来",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "on": [
          {
            "zh": "为……加油",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "为……欢呼",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "chew": {
      "display": "chew",
      "prepositions": {
        "over": [
          "Let me chew it over for a few days. 让我考虑几天。",
          "We chewed over the proposal during lunch. 我们午饭时仔细讨论了这个提议。"
        ],
        "on": [
          "The puppy chewed on my shoe. 小狗啃我的鞋。",
          "Here is something to chew on before the meeting. 开会前有件事给你琢磨一下。"
        ]
      },
      "prepositionOrder": [
        "over",
        "on"
      ],
      "zipf": 3.66,
      "senses": {
        "over": [
          {
            "zh": "仔细考虑",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "嚼；琢磨",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "chill": {
      "display": "chill",
      "prepositions": {
        "out": [
          "We just chilled out at home all weekend. 我们整个周末都在家放松。",
          "Chill out, there's plenty of time. 别急，时间还多着呢。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.18,
      "senses": {
        "out": [
          {
            "zh": "放松；冷静",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "chip": {
      "display": "chip",
      "prepositions": {
        "in": [
          "We all chipped in to buy her a present. 我们大家凑钱给她买了礼物。",
          "Everyone chipped in with ideas. 大家纷纷出主意。"
        ],
        "away at": [
          "Rising prices are chipping away at our savings. 物价上涨正在一点点侵蚀我们的积蓄。",
          "She kept chipping away at the problem until she solved it. 她一点点攻克难题，直到解决。"
        ]
      },
      "prepositionOrder": [
        "in",
        "away at"
      ],
      "zipf": 4.31,
      "senses": {
        "in": [
          {
            "zh": "凑钱；插话",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away at": [
          {
            "zh": "逐渐削弱",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "choke": {
      "display": "choke",
      "prepositions": {
        "back": [
          "She choked back tears as she said goodbye. 她道别时强忍住泪水。",
          "He choked back his anger. 他压住了怒火。"
        ],
        "on": [
          "The baby choked on a piece of apple. 宝宝被一块苹果噎住了。",
          "He nearly choked on his coffee when he heard the news. 听到这个消息，他差点被咖啡呛着。"
        ]
      },
      "prepositionOrder": [
        "back",
        "on"
      ],
      "zipf": 3.72,
      "senses": {
        "back": [
          {
            "zh": "忍住（泪水、情绪）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "被……噎住",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "choose": {
      "display": "choose",
      "prepositions": {
        "between": [
          "It's hard to choose between these two dresses. 在这两条裙子之间很难做出选择。",
          "Students must choose between history and geography. 学生必须在历史和地理之间选一门。"
        ],
        "from": [
          "You can choose from over fifty flavors. 你可以从五十多种口味中挑选。",
          "There were so many books to choose from. 可选的书太多了。"
        ]
      },
      "prepositionOrder": [
        "between",
        "from"
      ],
      "zipf": 4.91,
      "senses": {
        "between": [
          {
            "zh": "在……之间选择",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "从……中挑选",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "chop": {
      "display": "chop",
      "prepositions": {
        "up": [
          "Chop up the garlic very finely. 把大蒜切得很碎。",
          "He chopped the wood up for the fire. 他劈好柴准备生火。"
        ],
        "down": [
          "They chopped down the dead tree. 他们砍倒了那棵枯树。",
          "The old oak was chopped down last winter. 那棵老橡树去年冬天被砍倒了。"
        ]
      },
      "prepositionOrder": [
        "up",
        "down"
      ],
      "zipf": 3.77,
      "senses": {
        "up": [
          {
            "zh": "切碎",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "砍倒",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "clam": {
      "display": "clam",
      "prepositions": {
        "up": [
          "He clammed up when I asked about his past. 我问起他的过去时，他闭口不谈。",
          "The witness suddenly clammed up. 证人突然不说话了。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.22,
      "senses": {
        "up": [
          {
            "zh": "闭口不言",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "clamp": {
      "display": "clamp",
      "prepositions": {
        "down on": [
          "The city is clamping down on illegal parking. 市政府正在严厉整治违章停车。",
          "The government clamped down on tax evasion. 政府严厉打击逃税行为。"
        ]
      },
      "prepositionOrder": [
        "down on"
      ],
      "zipf": 3.45,
      "senses": {
        "down on": [
          {
            "zh": "严厉限制；取缔",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "clash": {
      "display": "clash",
      "prepositions": {
        "with": [
          "Protesters clashed with police outside the building. 抗议者在大楼外与警察发生冲突。",
          "That red tie clashes with your shirt. 那条红领带和你的衬衫不搭。",
          "The concert clashes with my evening class. 音乐会和我的夜校课时间冲突。"
        ],
        "over": [
          "The two parties clashed over the budget. 两党在预算问题上发生争执。",
          "They often clash over how to raise the children. 他们常为如何教育孩子发生争执。"
        ]
      },
      "prepositionOrder": [
        "with",
        "over"
      ],
      "zipf": 3.97,
      "senses": {
        "with": [
          {
            "zh": "与……冲突；不相配",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "over": [
          {
            "zh": "因……发生争执",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "clean": {
      "display": "clean",
      "prepositions": {
        "up": [
          "Let's clean up the kitchen before the guests arrive. 客人到之前我们把厨房收拾干净吧。",
          "Volunteers cleaned up the beach after the festival. 节日过后志愿者清理了海滩。",
          "Who is going to clean this mess up? 这一团糟谁来收拾？"
        ],
        "out": [
          "I cleaned out the garage over the weekend. 周末我把车库彻底清理了一遍。",
          "It's time to clean out the fridge. 该清理冰箱了。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out"
      ],
      "zipf": 4.97,
      "senses": {
        "up": [
          {
            "zh": "打扫干净；清理",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "out": [
          {
            "zh": "彻底清理",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "clear": {
      "display": "clear",
      "prepositions": {
        "up": [
          "Let's clear up this misunderstanding right now. 我们现在就把这个误会澄清吧。",
          "It rained all morning, but it cleared up later. 下了一上午雨，后来放晴了。",
          "Please clear up your toys before bed. 睡觉前请把你的玩具收拾好。"
        ],
        "out": [
          "We cleared out the attic last spring. 去年春天我们清空了阁楼。",
          "The landlord told us to clear out by Friday. 房东让我们周五前搬走。"
        ],
        "away": [
          "Could you clear away the dishes? 你能把碗碟收走吗？",
          "Workers cleared away the snow from the road. 工人们清除了路上的积雪。"
        ],
        "of": [
          "He was cleared of all charges. 他被裁定所有罪名均不成立。",
          "The streets were cleared of snow by morning. 到早上街道上的雪都清除了。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out",
        "away",
        "of"
      ],
      "zipf": 5.25,
      "senses": {
        "up": [
          {
            "zh": "整理；澄清；（天）放晴",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "out": [
          {
            "zh": "清空；离开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "收拾走",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "of": [
          {
            "zh": "清除；宣告无罪",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "climb": {
      "display": "climb",
      "prepositions": {
        "down": [
          "The minister was forced to climb down over the new tax. 部长被迫在新税问题上让步。",
          "Neither side was willing to climb down. 双方都不愿让步。"
        ],
        "up": [
          "The cat climbed up the tree and wouldn't come down. 猫爬上树，不肯下来。",
          "We climbed up to the top of the hill. 我们爬到了山顶。"
        ]
      },
      "prepositionOrder": [
        "down",
        "up"
      ],
      "zipf": 4.22,
      "senses": {
        "down": [
          {
            "zh": "让步；退让",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "爬上",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cling": {
      "display": "cling",
      "prepositions": {
        "to": [
          "The child clung to his mother's hand. 孩子紧紧抓着妈妈的手。",
          "They still cling to old traditions. 他们仍然固守着古老的传统。",
          "She clings to the hope that he will return. 她仍抱着他会回来的希望。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.49,
      "senses": {
        "to": [
          {
            "zh": "紧抱；坚持",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "clock": {
      "display": "clock",
      "prepositions": {
        "in": [
          "Workers must clock in by eight. 员工必须八点前打卡上班。",
          "She forgot to clock in this morning. 她今天早上忘了打卡。"
        ],
        "out": [
          "He clocked out early to pick up his kids. 他提前打卡下班去接孩子。",
          "Don't clock out before the shift ends. 班次结束前不要打卡下班。"
        ],
        "up": [
          "The car has clocked up a lot of miles. 这辆车已经跑了很多里程。",
          "She clocked up her tenth win of the season. 她拿下了本赛季第十场胜利。"
        ]
      },
      "prepositionOrder": [
        "in",
        "out",
        "up"
      ],
      "zipf": 4.43,
      "senses": {
        "in": [
          {
            "zh": "打卡上班",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "打卡下班",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "累积达到",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "close": {
      "display": "close",
      "prepositions": {
        "down": [
          "The local cinema closed down last year. 当地的电影院去年倒闭了。",
          "Many small shops were forced to close down. 许多小商店被迫关门。"
        ],
        "in": [
          "The enemy was closing in from all sides. 敌人正从四面八方逼近。",
          "The days close in quickly in winter. 冬天白昼很快变短。"
        ],
        "in on": [
          "The police are closing in on the suspect. 警方正在逼近嫌疑人。",
          "The lions closed in on the young zebra. 狮子们围住了那只小斑马。"
        ],
        "off": [
          "The road was closed off after the accident. 事故后道路被封闭了。",
          "Police closed off the whole area. 警察封锁了整个区域。"
        ]
      },
      "prepositionOrder": [
        "down",
        "in",
        "in on",
        "off"
      ],
      "zipf": 5.36,
      "senses": {
        "down": [
          {
            "zh": "倒闭；关闭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "逼近；（天）渐短",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in on": [
          {
            "zh": "包围；逼近",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "封闭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cloud": {
      "display": "cloud",
      "prepositions": {
        "over": [
          "It clouded over in the afternoon and started to rain. 下午天阴了，开始下雨。",
          "The sky suddenly clouded over. 天空突然阴了下来。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 4.46,
      "senses": {
        "over": [
          {
            "zh": "（天）变阴",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "coincide": {
      "display": "coincide",
      "prepositions": {
        "with": [
          "Her visit coincided with the spring festival. 她来访时恰逢春节。",
          "His views coincide with mine on this issue. 在这个问题上他的观点与我一致。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.49,
      "senses": {
        "with": [
          {
            "zh": "与……同时发生；与……一致",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "collaborate": {
      "display": "collaborate",
      "prepositions": {
        "with": [
          "The author collaborated with a famous illustrator. 作者与一位著名插画师合作。",
          "Our lab collaborates with several universities. 我们实验室与几所大学合作。"
        ],
        "on": [
          "The two teams collaborated on the new design. 两个团队合作完成了新设计。",
          "We are collaborating on a research paper. 我们正在合写一篇研究论文。"
        ]
      },
      "prepositionOrder": [
        "with",
        "on"
      ],
      "zipf": 3.51,
      "senses": {
        "with": [
          {
            "zh": "与……合作",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "就……合作",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "collide": {
      "display": "collide",
      "prepositions": {
        "with": [
          "A bus collided with a truck on the highway. 一辆公交车在高速公路上与一辆卡车相撞。",
          "His plans collided with those of his boss. 他的计划与老板的计划相冲突。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.29,
      "senses": {
        "with": [
          {
            "zh": "与……相撞；冲突",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "come": {
      "display": "come",
      "prepositions": {
        "up": [
          "Your name came up at the meeting yesterday. 昨天开会时有人提到了你的名字。",
          "Something urgent has come up, so I have to leave. 突然有急事，我得走了。",
          "The question comes up in almost every interview. 这个问题几乎在每次面试中都会被问到。"
        ],
        "up with": [
          "She came up with a clever solution to the problem. 她想出了一个解决问题的巧妙办法。",
          "We need to come up with a name for the new product. 我们得给新产品想个名字。",
          "Who came up with this crazy plan? 这个疯狂的计划是谁想出来的？"
        ],
        "across": [
          "I came across an old photo of my grandparents. 我偶然发现了一张祖父母的老照片。",
          "Have you ever come across a word like this before? 你以前遇到过这样的词吗？",
          "He comes across as a bit shy at first. 他一开始给人的印象有点害羞。",
          "Her speech came across very well. 她的演讲效果很好。"
        ],
        "back": [
          "When are you coming back from your trip? 你旅行什么时候回来？",
          "The pain came back after a few days. 几天后疼痛又回来了。"
        ],
        "out": [
          "Her new novel comes out next month. 她的新小说下个月出版。",
          "The truth came out in the end. 真相最终还是大白了。",
          "When does the updated version come out? 更新版本什么时候发布？"
        ],
        "down with": [
          "I think I'm coming down with a cold. 我觉得我快感冒了。",
          "Half the class came down with the flu last week. 上周班上一半的人得了流感。"
        ],
        "from": [
          "My family comes from a small village in the south. 我家来自南方的一个小村庄。",
          "Where does this strange smell come from? 这股怪味是从哪儿来的？"
        ],
        "on": [
          "Come on, we're going to miss the bus! 快点，我们要赶不上公交车了！",
          "Come on, you can do better than that. 加油，你可以做得更好。"
        ],
        "around": [
          "He came around slowly after the operation. 手术后他慢慢苏醒过来。",
          "My parents finally came around to the idea. 我父母最终接受了这个想法。"
        ],
        "along": [
          "How is your thesis coming along? 你的论文进展如何？",
          "We're going to the park; do you want to come along? 我们要去公园，你想一起来吗？"
        ],
        "over": [
          "Why don't you come over for dinner on Friday? 周五过来吃晚饭怎么样？",
          "My cousin came over to help me move. 我表哥过来帮我搬家。"
        ],
        "in": [
          "Please knock before you come in. 进来之前请先敲门。",
          "The tide comes in very quickly here. 这里涨潮很快。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up with",
        "across",
        "back",
        "out",
        "down with",
        "from",
        "on",
        "around",
        "along",
        "over",
        "in"
      ],
      "zipf": 5.78,
      "senses": {
        "up": [
          {
            "zh": "被提及；出现",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "up with": [
          {
            "zh": "想出（主意、办法）",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "across": [
          {
            "zh": "偶然遇见；偶然发现",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "给人……印象",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "back": [
          {
            "zh": "回来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "出版；发布；（真相）公开",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "down with": [
          {
            "zh": "患上（小病）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "来自；出身于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "快点；加油（催促）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "around": [
          {
            "zh": "恢复知觉；改变看法",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "along": [
          {
            "zh": "进展；跟着来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "过来（拜访）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "进来；（潮水）上涨",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "comment": {
      "display": "comment",
      "prepositions": {
        "on": [
          "The minister refused to comment on the rumors. 部长拒绝对传言发表评论。",
          "Several readers commented on the article. 好几位读者对这篇文章发表了评论。",
          "Could you comment on my draft? 你能给我的草稿提点意见吗？"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.88,
      "senses": {
        "on": [
          {
            "zh": "对……发表评论",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "commit": {
      "display": "commit",
      "prepositions": {
        "to": [
          "The government has committed to cutting emissions. 政府已承诺减少排放。",
          "He's not ready to commit to a serious relationship. 他还没准备好投入一段认真的感情。",
          "She committed herself to helping the poor. 她致力于帮助穷人。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.33,
      "senses": {
        "to": [
          {
            "zh": "致力于；承诺",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "communicate": {
      "display": "communicate",
      "prepositions": {
        "with": [
          "Dolphins communicate with each other using sounds. 海豚用声音相互交流。",
          "It's hard to communicate with my teenage son. 和我十几岁的儿子很难沟通。",
          "We communicate with our overseas office by email. 我们通过电子邮件与海外办事处联络。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 4.2,
      "senses": {
        "with": [
          {
            "zh": "与……交流",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "compare": {
      "display": "compare",
      "prepositions": {
        "with": [
          "Compared with last year, sales have doubled. 与去年相比，销量翻了一番。",
          "Nothing compares with a home cooked meal. 什么都比不上家常饭菜。"
        ],
        "to": [
          "Poets often compare love to a rose. 诗人常把爱情比作玫瑰。",
          "Critics compared her voice to a young Adele. 评论家把她的声音比作年轻时的阿黛尔。"
        ]
      },
      "prepositionOrder": [
        "with",
        "to"
      ],
      "zipf": 4.45,
      "senses": {
        "with": [
          {
            "zh": "与……比较",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "把……比作",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "compensate": {
      "display": "compensate",
      "prepositions": {
        "for": [
          "Nothing can compensate for the loss of a child. 什么都无法弥补失去孩子的痛苦。",
          "The airline compensated us for the delay. 航空公司因延误给了我们赔偿。",
          "Hard work can compensate for a lack of talent. 勤能补拙。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 3.78,
      "senses": {
        "for": [
          {
            "zh": "弥补；赔偿",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "compete": {
      "display": "compete",
      "prepositions": {
        "with": [
          "Small shops can't compete with big supermarkets. 小商店竞争不过大超市。",
          "The two brothers always competed with each other. 兄弟俩总是互相较劲。"
        ],
        "for": [
          "Hundreds of students competed for the scholarship. 数百名学生争夺这份奖学金。",
          "Plants compete for sunlight in the forest. 森林里的植物争夺阳光。"
        ],
        "in": [
          "She will compete in the national championship. 她将参加全国锦标赛。",
          "Over forty countries competed in the games. 四十多个国家参加了运动会。"
        ],
        "against": [
          "We competed against a much stronger team. 我们和一支强得多的队伍比赛。",
          "Local farmers must compete against cheap imports. 本地农民必须与廉价进口商品竞争。"
        ]
      },
      "prepositionOrder": [
        "with",
        "for",
        "in",
        "against"
      ],
      "zipf": 4.39,
      "senses": {
        "with": [
          {
            "zh": "与……竞争",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "争夺",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "参加（比赛）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "与……对抗",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "complain": {
      "display": "complain",
      "prepositions": {
        "about": [
          "He's always complaining about his job. 他总是抱怨自己的工作。",
          "Neighbors complained about the noise. 邻居们投诉了噪音。"
        ],
        "of": [
          "She complained of a headache and went home. 她说头疼，就回家了。",
          "The patient complained of chest pain. 病人诉说胸口疼。"
        ],
        "to": [
          "We complained to the manager about the service. 我们向经理投诉了服务问题。",
          "You should complain to the council. 你应该向市议会投诉。"
        ]
      },
      "prepositionOrder": [
        "about",
        "of",
        "to"
      ],
      "zipf": 4.23,
      "senses": {
        "about": [
          {
            "zh": "抱怨",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "of": [
          {
            "zh": "诉说（病痛）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "向……投诉",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "comply": {
      "display": "comply",
      "prepositions": {
        "with": [
          "All products must comply with safety standards. 所有产品都必须符合安全标准。",
          "He refused to comply with the court order. 他拒绝遵守法院的命令。",
          "Visitors are asked to comply with the museum rules. 参观者需遵守博物馆的规定。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 4.04,
      "senses": {
        "with": [
          {
            "zh": "遵守；服从",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "conceal": {
      "display": "conceal",
      "prepositions": {
        "from": [
          "She concealed the truth from her family. 她对家人隐瞒了真相。",
          "He couldn't conceal his anger from us. 他无法在我们面前掩饰愤怒。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.52,
      "senses": {
        "from": [
          {
            "zh": "对……隐瞒",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "concentrate": {
      "display": "concentrate",
      "prepositions": {
        "on": [
          "I can't concentrate on my work with all this noise. 这么吵，我没法专心工作。",
          "The course concentrates on spoken English. 这门课侧重英语口语。",
          "Just concentrate on the road while you drive. 开车时专心看路就行。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.07,
      "senses": {
        "on": [
          {
            "zh": "集中精力于",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "conclude": {
      "display": "conclude",
      "prepositions": {
        "with": [
          "The concert concluded with a famous waltz. 音乐会以一首著名的圆舞曲结束。",
          "She concluded her speech with a short poem. 她以一首短诗结束了演讲。"
        ],
        "from": [
          "What can we conclude from these results? 我们能从这些结果中得出什么结论？",
          "The police concluded from the evidence that it was an accident. 警方根据证据断定这是一场意外。"
        ]
      },
      "prepositionOrder": [
        "with",
        "from"
      ],
      "zipf": 3.9,
      "senses": {
        "with": [
          {
            "zh": "以……结束",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "从……得出结论",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "concur": {
      "display": "concur",
      "prepositions": {
        "with": [
          "I concur with the committee's decision. 我同意委员会的决定。",
          "Most experts concur with this view. 大多数专家同意这一观点。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.18,
      "senses": {
        "with": [
          {
            "zh": "同意",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "condemn": {
      "display": "condemn",
      "prepositions": {
        "to": [
          "The murderer was condemned to life in prison. 凶手被判终身监禁。",
          "Poverty condemned them to a hard life. 贫穷让他们注定过着艰苦的生活。"
        ],
        "for": [
          "The attack was condemned for its cruelty. 这次袭击因其残忍而受到谴责。",
          "Leaders condemned the company for polluting the river. 领导人谴责这家公司污染河流。"
        ]
      },
      "prepositionOrder": [
        "to",
        "for"
      ],
      "zipf": 3.72,
      "senses": {
        "to": [
          {
            "zh": "判处；使注定",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "谴责",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "confer": {
      "display": "confer",
      "prepositions": {
        "with": [
          "The judge conferred with the lawyers. 法官与律师们进行了商议。",
          "Let me confer with my colleagues first. 让我先和同事商量一下。"
        ],
        "on": [
          "The university conferred an honorary degree on her. 大学授予她荣誉学位。",
          "The title was conferred on him by the king. 国王授予他这个头衔。"
        ]
      },
      "prepositionOrder": [
        "with",
        "on"
      ],
      "zipf": 3.19,
      "senses": {
        "with": [
          {
            "zh": "与……商议",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "授予",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "confess": {
      "display": "confess",
      "prepositions": {
        "to": [
          "He confessed to stealing the money. 他承认偷了钱。",
          "I must confess to a slight fear of dogs. 我得承认自己有点怕狗。",
          "She finally confessed to her parents. 她终于向父母坦白了。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.82,
      "senses": {
        "to": [
          {
            "zh": "承认；坦白",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "confide": {
      "display": "confide",
      "prepositions": {
        "in": [
          "She confided in her sister about the divorce. 她向姐姐倾诉了离婚的事。",
          "He has nobody to confide in. 他没有可以倾诉的人。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 2.9,
      "senses": {
        "in": [
          {
            "zh": "向……吐露（秘密）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "confine": {
      "display": "confine",
      "prepositions": {
        "to": [
          "Please confine your comments to the topic. 请把你的评论限制在这个话题内。",
          "He was confined to bed for a week. 他卧床一周。",
          "The problem is not confined to big cities. 这个问题不仅限于大城市。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 2.92,
      "senses": {
        "to": [
          {
            "zh": "限制在",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "conform": {
      "display": "conform",
      "prepositions": {
        "to": [
          "The building does not conform to safety regulations. 这栋建筑不符合安全规定。",
          "Teenagers often feel pressure to conform to their peers. 青少年常感到要与同龄人保持一致的压力。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.53,
      "senses": {
        "to": [
          {
            "zh": "符合；遵守",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "confront": {
      "display": "confront",
      "prepositions": {
        "with": [
          "The detective confronted him with the evidence. 侦探拿证据与他对质。",
          "We are confronted with a difficult choice. 我们面临一个艰难的选择。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.8,
      "senses": {
        "with": [
          {
            "zh": "使面对；使对质",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "confuse": {
      "display": "confuse",
      "prepositions": {
        "with": [
          "People often confuse me with my twin sister. 人们常把我和我的双胞胎姐姐搞混。",
          "Don't confuse confidence with arrogance. 不要把自信和傲慢混为一谈。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.67,
      "senses": {
        "with": [
          {
            "zh": "把……与……混淆",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "congratulate": {
      "display": "congratulate",
      "prepositions": {
        "on": [
          "I congratulated her on her promotion. 我祝贺她升职了。",
          "Let me congratulate you on your excellent results. 让我祝贺你取得了优异的成绩。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.59,
      "senses": {
        "on": [
          {
            "zh": "祝贺",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "connect": {
      "display": "connect",
      "prepositions": {
        "to": [
          "Connect the printer to your laptop. 把打印机连接到你的笔记本电脑上。",
          "I can't connect to the internet. 我连不上网。"
        ],
        "with": [
          "Police connected him with the robbery. 警方认为他与抢劫案有关。",
          "Good teachers connect with their students. 好老师能与学生心灵相通。"
        ]
      },
      "prepositionOrder": [
        "to",
        "with"
      ],
      "zipf": 4.38,
      "senses": {
        "to": [
          {
            "zh": "连接到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……有关联；与……沟通",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "consent": {
      "display": "consent",
      "prepositions": {
        "to": [
          "Her father consented to the marriage. 她父亲同意了这门婚事。",
          "The patient consented to the operation. 病人同意做手术。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.36,
      "senses": {
        "to": [
          {
            "zh": "同意",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "consist": {
      "display": "consist",
      "prepositions": {
        "of": [
          "The team consists of five engineers and a designer. 这个团队由五名工程师和一名设计师组成。",
          "Breakfast consisted of bread and coffee. 早餐只有面包和咖啡。",
          "Water consists of hydrogen and oxygen. 水由氢和氧组成。"
        ],
        "in": [
          "Happiness consists in being content with what you have. 幸福在于知足。",
          "The charm of the town consists in its quiet streets. 这个小镇的魅力在于它安静的街道。"
        ]
      },
      "prepositionOrder": [
        "of",
        "in"
      ],
      "zipf": 3.94,
      "senses": {
        "of": [
          {
            "zh": "由……组成",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "in": [
          {
            "zh": "在于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "conspire": {
      "display": "conspire",
      "prepositions": {
        "against": [
          "The officers conspired against the general. 军官们密谋反对将军。",
          "It felt as if the weather was conspiring against us. 感觉就连天气都在跟我们作对。"
        ],
        "with": [
          "He conspired with his partner to cheat investors. 他和合伙人合谋欺骗投资者。",
          "She was accused of conspiring with the enemy. 她被指控与敌人勾结。"
        ]
      },
      "prepositionOrder": [
        "against",
        "with"
      ],
      "zipf": 2.81,
      "senses": {
        "against": [
          {
            "zh": "密谋反对",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……合谋",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "consult": {
      "display": "consult",
      "prepositions": {
        "with": [
          "I need to consult with my lawyer first. 我得先和律师商量一下。",
          "The manager consulted with the team before deciding. 经理做决定前征求了团队意见。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.87,
      "senses": {
        "with": [
          {
            "zh": "与……商量",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "contend": {
      "display": "contend",
      "prepositions": {
        "with": [
          "Farmers have to contend with droughts and floods. 农民不得不应对干旱和洪水。",
          "She has a lot to contend with at the moment. 她目前有很多难题要应付。"
        ],
        "for": [
          "Three candidates are contending for the presidency. 三位候选人正在角逐总统职位。",
          "The two clubs are contending for the title. 两家俱乐部正在争夺冠军。"
        ]
      },
      "prepositionOrder": [
        "with",
        "for"
      ],
      "zipf": 3.56,
      "senses": {
        "with": [
          {
            "zh": "应付；对付",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "争夺",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "contrast": {
      "display": "contrast",
      "prepositions": {
        "with": [
          "His quiet manner contrasts with his brother's loud voice. 他的沉静和他哥哥的大嗓门形成鲜明对比。",
          "The white walls contrast nicely with the dark floor. 白墙与深色地板形成了很好的对比。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 4.46,
      "senses": {
        "with": [
          {
            "zh": "与……形成对比",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "contribute": {
      "display": "contribute",
      "prepositions": {
        "to": [
          "Smoking contributes to heart disease. 吸烟会诱发心脏病。",
          "Everyone contributed to the success of the project. 每个人都为项目的成功做出了贡献。",
          "She contributes to several magazines. 她为好几家杂志撰稿。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.34,
      "senses": {
        "to": [
          {
            "zh": "促成；为……做贡献；为（报刊）撰稿",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "convert": {
      "display": "convert",
      "prepositions": {
        "into": [
          "They converted the old barn into a house. 他们把旧谷仓改建成了住宅。",
          "Solar panels convert sunlight into electricity. 太阳能电池板把阳光转化为电能。"
        ],
        "to": [
          "He converted to Buddhism in his thirties. 他三十多岁时皈依了佛教。",
          "Many drivers are converting to electric cars. 许多司机正改用电动车。"
        ]
      },
      "prepositionOrder": [
        "into",
        "to"
      ],
      "zipf": 4.11,
      "senses": {
        "into": [
          {
            "zh": "把……转变为",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "皈依；改用",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "convict": {
      "display": "convict",
      "prepositions": {
        "of": [
          "He was convicted of fraud. 他被判诈骗罪。",
          "The jury convicted her of murder. 陪审团裁定她犯有谋杀罪。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.56,
      "senses": {
        "of": [
          {
            "zh": "判定有罪",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "convince": {
      "display": "convince",
      "prepositions": {
        "of": [
          "She convinced the jury of her innocence. 她让陪审团相信了她的清白。",
          "I'm not convinced of the need for a new office. 我不认为有必要换新办公室。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 4.26,
      "senses": {
        "of": [
          {
            "zh": "使相信",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cool": {
      "display": "cool",
      "prepositions": {
        "down": [
          "Let the soup cool down before you eat it. 等汤凉一点再喝。",
          "You should cool down before you make a decision. 你应该冷静下来再做决定。"
        ],
        "off": [
          "We jumped into the lake to cool off. 我们跳进湖里凉快一下。",
          "Give him some time to cool off. 给他点时间平静下来。"
        ]
      },
      "prepositionOrder": [
        "down",
        "off"
      ],
      "zipf": 5.15,
      "senses": {
        "down": [
          {
            "zh": "冷却；冷静",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "凉快下来；平静下来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cooperate": {
      "display": "cooperate",
      "prepositions": {
        "with": [
          "Witnesses are cooperating with the police. 目击者正在配合警方。",
          "The two countries agreed to cooperate with each other on trade. 两国同意在贸易方面相互合作。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.79,
      "senses": {
        "with": [
          {
            "zh": "与……合作",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cope": {
      "display": "cope",
      "prepositions": {
        "with": [
          "She coped with the pressure remarkably well. 她非常好地应对了压力。",
          "The hospital can't cope with so many patients. 医院应付不了这么多病人。",
          "How do you cope with stress at work? 你如何应对工作压力？"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 4.04,
      "senses": {
        "with": [
          {
            "zh": "应付；处理",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "cordon": {
      "display": "cordon",
      "prepositions": {
        "off": [
          "Police cordoned off the street after the explosion. 爆炸发生后警方封锁了这条街。",
          "The area was cordoned off for hours. 该区域被封锁了好几个小时。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 3.14,
      "senses": {
        "off": [
          {
            "zh": "用警戒线封锁",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "correspond": {
      "display": "correspond",
      "prepositions": {
        "to": [
          "The word corresponds to a French expression. 这个词相当于一个法语表达。",
          "The numbers on the map correspond to the photos. 地图上的编号与照片对应。"
        ],
        "with": [
          "I corresponded with a pen pal in Japan for years. 我和一位日本笔友通了好多年信。",
          "His story doesn't correspond with the facts. 他的说法与事实不符。"
        ]
      },
      "prepositionOrder": [
        "to",
        "with"
      ],
      "zipf": 3.5,
      "senses": {
        "to": [
          {
            "zh": "相当于；符合",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……通信；与……一致",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cotton": {
      "display": "cotton",
      "prepositions": {
        "on": [
          "It took me ages to cotton on to what he meant. 我过了好久才明白他的意思。",
          "She soon cottoned on to the trick. 她很快就识破了这个把戏。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.35,
      "senses": {
        "on": [
          {
            "zh": "明白；领悟",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cough": {
      "display": "cough",
      "prepositions": {
        "up": [
          "He coughed up some blood and went to the doctor. 他咳出了一些血，就去看了医生。",
          "I had to cough up fifty dollars for the ticket. 我不得不掏五十美元买票。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.95,
      "senses": {
        "up": [
          {
            "zh": "咳出；勉强付钱",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "count": {
      "display": "count",
      "prepositions": {
        "on": [
          "You can always count on me. 你随时可以指望我。",
          "Don't count on the weather being good. 别指望天气会好。",
          "We're counting on your support. 我们指望你的支持。"
        ],
        "down": [
          "The children counted down to midnight. 孩子们倒数到午夜。",
          "Everyone is counting down the days to the holiday. 大家都在倒数着等待放假。"
        ],
        "in": [
          "If you're going to the concert, count me in. 你们要去音乐会的话，算我一个。",
          "Count us in for the picnic on Sunday. 周日的野餐算上我们。"
        ],
        "out": [
          "I'm too tired tonight, so count me out. 我今晚太累了，别算我。",
          "Don't count him out; he could still win. 别把他排除在外，他还有可能赢。"
        ],
        "as": [
          "A tomato counts as a fruit, not a vegetable. 西红柿算水果，不算蔬菜。",
          "Does a short walk count as exercise? 散散步算锻炼吗？"
        ],
        "towards": [
          "This essay counts towards your final grade. 这篇论文会计入你的期末成绩。",
          "Part time work also counts towards your pension. 兼职工作也计入养老金年限。"
        ]
      },
      "prepositionOrder": [
        "on",
        "down",
        "in",
        "out",
        "as",
        "towards"
      ],
      "zipf": 4.83,
      "senses": {
        "on": [
          {
            "zh": "依靠；指望",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "down": [
          {
            "zh": "倒数",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "算上",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "不算在内",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "as": [
          {
            "zh": "被视为；算作",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "towards": [
          {
            "zh": "计入",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cover": {
      "display": "cover",
      "prepositions": {
        "up": [
          "The company tried to cover up the scandal. 公司试图掩盖丑闻。",
          "Cover yourself up; it's freezing outside. 穿严实点，外面冷极了。"
        ],
        "for": [
          "Can you cover for me while I'm at the dentist? 我去看牙时你能替我顶一下班吗？",
          "She covered for her brother when he came home late. 弟弟晚归时她替他打掩护。"
        ],
        "with": [
          "The mountains were covered with snow. 山上覆盖着雪。",
          "She covered the table with a white cloth. 她用白布盖住了桌子。"
        ]
      },
      "prepositionOrder": [
        "up",
        "for",
        "with"
      ],
      "zipf": 5.08,
      "senses": {
        "up": [
          {
            "zh": "掩盖；盖住",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "代班；替……打掩护",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "用……覆盖",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "crack": {
      "display": "crack",
      "prepositions": {
        "down on": [
          "The police are cracking down on drunk driving. 警方正在严厉打击酒驾。",
          "The school cracked down on cheating. 学校严厉整治作弊行为。"
        ],
        "up": [
          "Everyone cracked up at his joke. 大家都被他的笑话逗得哈哈大笑。",
          "He nearly cracked up under all the stress. 在这么大的压力下他差点崩溃。"
        ]
      },
      "prepositionOrder": [
        "down on",
        "up"
      ],
      "zipf": 4.41,
      "senses": {
        "down on": [
          {
            "zh": "严厉打击",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "大笑；精神崩溃",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cram": {
      "display": "cram",
      "prepositions": {
        "for": [
          "He stayed up all night cramming for the exam. 他熬了一整夜突击备考。",
          "Cramming for tests is not an effective way to learn. 考前突击不是有效的学习方法。"
        ],
        "into": [
          "We crammed into a tiny taxi. 我们挤进了一辆小小的出租车。",
          "She crammed all her clothes into one suitcase. 她把所有衣服都塞进一个行李箱。"
        ]
      },
      "prepositionOrder": [
        "for",
        "into"
      ],
      "zipf": 3.14,
      "senses": {
        "for": [
          {
            "zh": "临时抱佛脚；突击备考",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "塞进",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "crank": {
      "display": "crank",
      "prepositions": {
        "up": [
          "Crank up the music, I love this song! 把音乐开大点，我喜欢这首歌！",
          "The factory cranked up production before the holidays. 工厂在节前加大了产量。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.61,
      "senses": {
        "up": [
          {
            "zh": "调大；加大",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "creep": {
      "display": "creep",
      "prepositions": {
        "up on": [
          "Old age creeps up on all of us. 衰老不知不觉降临到我们每个人身上。",
          "The kitten crept up on the mouse. 小猫悄悄靠近老鼠。"
        ],
        "in": [
          "Errors crept in when the data was copied. 复制数据时悄悄出现了错误。",
          "Doubt began to creep in. 疑虑开始悄悄产生。"
        ]
      },
      "prepositionOrder": [
        "up on",
        "in"
      ],
      "zipf": 3.84,
      "senses": {
        "up on": [
          {
            "zh": "悄悄接近；不知不觉来临",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "悄悄出现",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "crop": {
      "display": "crop",
      "prepositions": {
        "up": [
          "Problems kept cropping up during the project. 项目进行中不断冒出问题。",
          "His name cropped up in conversation. 谈话中提到了他的名字。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.15,
      "senses": {
        "up": [
          {
            "zh": "突然出现",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cross": {
      "display": "cross",
      "prepositions": {
        "out": [
          "He crossed out the wrong answer and wrote a new one. 他划掉错误答案，重新写了一个。",
          "Please cross my name out. 请把我的名字划掉。"
        ],
        "off": [
          "I crossed off the tasks I had finished. 我把完成的任务划掉了。",
          "You can cross him off the guest list. 你可以把他从客人名单上划掉。"
        ],
        "over": [
          "The singer crossed over from jazz to pop. 这位歌手从爵士乐转向了流行乐。",
          "They crossed over into the next valley. 他们翻越到了下一个山谷。"
        ]
      },
      "prepositionOrder": [
        "out",
        "off",
        "over"
      ],
      "zipf": 5.0,
      "senses": {
        "out": [
          {
            "zh": "划掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "从名单上划去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "越过；转换",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "crowd": {
      "display": "crowd",
      "prepositions": {
        "around": [
          "Fans crowded around the singer for autographs. 歌迷们围着歌手要签名。",
          "The children crowded around the teacher. 孩子们围在老师身边。"
        ],
        "into": [
          "Thousands of people crowded into the square. 成千上万的人挤进了广场。",
          "We all crowded into the small kitchen. 我们都挤进了小厨房。"
        ],
        "out": [
          "Big chains are crowding out local businesses. 大型连锁店正在挤垮本地商家。",
          "Weeds crowded out the flowers. 杂草把花都挤没了。"
        ]
      },
      "prepositionOrder": [
        "around",
        "into",
        "out"
      ],
      "zipf": 4.7,
      "senses": {
        "around": [
          {
            "zh": "围拢",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "挤进",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "排挤；挤掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cry": {
      "display": "cry",
      "prepositions": {
        "out": [
          "She cried out in pain when she fell. 她摔倒时疼得大叫起来。",
          "Someone cried out for help from the river. 有人在河里大声呼救。"
        ],
        "out for": [
          "This old house is crying out for a new coat of paint. 这栋老房子急需重新刷漆。",
          "The system is crying out for reform. 这个制度亟需改革。"
        ],
        "over": [
          "It's no use crying over spilt milk. 覆水难收，哭也没用。",
          "She cried over the ending of the film. 她为电影的结局而哭。"
        ]
      },
      "prepositionOrder": [
        "out",
        "out for",
        "over"
      ],
      "zipf": 4.59,
      "senses": {
        "out": [
          {
            "zh": "大声叫喊",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out for": [
          {
            "zh": "迫切需要",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "为……哭泣",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cuddle": {
      "display": "cuddle",
      "prepositions": {
        "up": [
          "The children cuddled up to their mother. 孩子们依偎在妈妈身边。",
          "We cuddled up under a blanket. 我们一起蜷在毯子下。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.4,
      "senses": {
        "up": [
          {
            "zh": "依偎",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cure": {
      "display": "cure",
      "prepositions": {
        "of": [
          "The medicine cured him of his cough. 这药治好了他的咳嗽。",
          "Nothing could cure her of her fear of flying. 什么都没法让她不再害怕坐飞机。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 4.32,
      "senses": {
        "of": [
          {
            "zh": "治愈；使改掉",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "curl": {
      "display": "curl",
      "prepositions": {
        "up": [
          "The cat curled up by the fire. 猫蜷缩在炉火旁。",
          "I love to curl up on the sofa with a good book. 我喜欢蜷在沙发上看一本好书。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.52,
      "senses": {
        "up": [
          {
            "zh": "蜷缩",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "cut": {
      "display": "cut",
      "prepositions": {
        "off": [
          "The electricity was cut off during the storm. 暴风雨期间电力被切断了。",
          "The village was cut off by the flood. 村子被洪水隔绝了。",
          "Sorry, we got cut off in the middle of the call. 抱歉，我们的通话中途断了。"
        ],
        "down on": [
          "The doctor told him to cut down on sugar. 医生让他少吃糖。",
          "We're trying to cut down on plastic waste. 我们正在努力减少塑料垃圾。"
        ],
        "down": [
          "They cut down the old tree in the yard. 他们砍倒了院子里的老树。",
          "Huge areas of forest are cut down every year. 每年都有大片森林被砍伐。"
        ],
        "out": [
          "She cut out an article from the newspaper. 她从报纸上剪下一篇文章。",
          "You should cut out fried food for a while. 你应该暂时戒掉油炸食品。"
        ],
        "in": [
          "Sorry to cut in, but I have a question. 抱歉插一句，我有个问题。",
          "A taxi cut in right in front of us. 一辆出租车在我们正前方加塞。"
        ],
        "back": [
          "The school had to cut back on staff. 学校不得不裁减员工。",
          "The government cut back spending on roads. 政府削减了道路建设的开支。"
        ],
        "up": [
          "Cut up the onions and fry them gently. 把洋葱切碎，用小火炒。",
          "He cut the paper up into small pieces. 他把纸剪成小片。"
        ]
      },
      "prepositionOrder": [
        "off",
        "down on",
        "down",
        "out",
        "in",
        "back",
        "up"
      ],
      "zipf": 5.24,
      "senses": {
        "off": [
          {
            "zh": "切断；中断；使隔绝",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "down on": [
          {
            "zh": "减少",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "砍倒",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "剪下；删去；戒掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "插嘴；（车）加塞",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "削减",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "切碎",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "dabble": {
      "display": "dabble",
      "prepositions": {
        "in": [
          "He dabbles in painting in his spare time. 他业余时间涉猎绘画。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 2.68,
      "senses": {
        "in": [
          {
            "zh": "涉猎；浅尝",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dash": {
      "display": "dash",
      "prepositions": {
        "off": [
          "He dashed off a quick note to his boss. 他匆匆给老板写了张便条。",
          "Sorry, I have to dash off to a meeting. 抱歉，我得赶去开会了。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 4.0,
      "senses": {
        "off": [
          {
            "zh": "匆匆写完",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "匆忙离开",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ]
      }
    },
    "date": {
      "display": "date",
      "prepositions": {
        "back to": [
          "The church dates back to the twelfth century. 这座教堂的历史可追溯到十二世纪。"
        ],
        "from": [
          "These coins date from Roman times. 这些硬币可追溯到罗马时代。"
        ]
      },
      "prepositionOrder": [
        "back to",
        "from"
      ],
      "zipf": 5.22,
      "senses": {
        "back to": [
          {
            "zh": "追溯到",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "from": [
          {
            "zh": "始于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dawn": {
      "display": "dawn",
      "prepositions": {
        "on": [
          "It suddenly dawned on me that I had left my keys at home. 我突然意识到自己把钥匙落在家里了。",
          "It finally dawned on him that she was joking. 他终于意识到她在开玩笑。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.27,
      "senses": {
        "on": [
          {
            "zh": "使……开始明白",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "deal": {
      "display": "deal",
      "prepositions": {
        "with": [
          "The manager dealt with the complaint quickly. 经理很快处理了这起投诉。",
          "How do you deal with stress at work? 你如何应对工作压力？",
          "This chapter deals with the causes of the war. 本章论述了战争的起因。"
        ],
        "in": [
          "His family deals in antique furniture. 他家经营古董家具生意。",
          "The shop dealt in rare books for decades. 这家店几十年来一直买卖珍本书。"
        ],
        "out": [
          "She dealt out the cards to each player. 她把牌发给每位玩家。",
          "The judge dealt out harsh sentences to the gang. 法官对这伙人判处了重刑。"
        ]
      },
      "prepositionOrder": [
        "with",
        "in",
        "out"
      ],
      "zipf": 5.32,
      "senses": {
        "with": [
          {
            "zh": "处理；应对",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "论述；涉及",
            "kind": "preposition",
            "examples": [
              2
            ]
          }
        ],
        "in": [
          {
            "zh": "经营；买卖",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "分发（纸牌等）；施以（惩罚）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "decide": {
      "display": "decide",
      "prepositions": {
        "on": [
          "Have you decided on a name for the baby? 你们给宝宝定好名字了吗？",
          "We finally decided on the blue curtains. 我们最终选定了蓝色窗帘。"
        ],
        "against": [
          "He decided against taking the job. 他决定不接受这份工作。",
          "In the end they decided against moving abroad. 最后他们决定不移居国外。"
        ]
      },
      "prepositionOrder": [
        "on",
        "against"
      ],
      "zipf": 4.78,
      "senses": {
        "on": [
          {
            "zh": "决定；选定",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "决定不",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "dedicate": {
      "display": "dedicate",
      "prepositions": {
        "to": [
          "She dedicated the book to her mother. 她把这本书献给了母亲。",
          "The charity is dedicated to protecting wildlife. 这个慈善机构致力于保护野生动物。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.51,
      "senses": {
        "to": [
          {
            "zh": "把……献给；致力于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "defer": {
      "display": "defer",
      "prepositions": {
        "to": [
          "I defer to your judgment on this matter. 在这件事上我听从你的判断。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.2,
      "senses": {
        "to": [
          {
            "zh": "听从；遵从",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "delight": {
      "display": "delight",
      "prepositions": {
        "in": [
          "He delights in teasing his sister. 他以捉弄妹妹为乐。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.97,
      "senses": {
        "in": [
          {
            "zh": "以……为乐",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "delve": {
      "display": "delve",
      "prepositions": {
        "into": [
          "The book delves into the history of the city. 这本书深入探讨了这座城市的历史。",
          "Researchers delved into the old records. 研究人员深入查阅了旧档案。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 3.14,
      "senses": {
        "into": [
          {
            "zh": "深入探究",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "depend": {
      "display": "depend",
      "prepositions": {
        "on": [
          "The price depends on the size of the room. 价格取决于房间的大小。",
          "Whether we go depends on the weather. 我们去不去取决于天气。",
          "You can always depend on your old friends. 你总是可以依靠老朋友。",
          "Many villages depend on tourism for income. 许多村庄依靠旅游业获得收入。"
        ],
        "upon": [
          "Success depends upon careful planning. 成功取决于周密的计划。",
          "The whole plan depends upon his cooperation. 整个计划都取决于他是否配合。"
        ]
      },
      "prepositionOrder": [
        "on",
        "upon"
      ],
      "zipf": 4.2,
      "senses": {
        "on": [
          {
            "zh": "取决于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "依靠；信赖",
            "kind": "preposition",
            "examples": [
              2,
              3
            ]
          }
        ],
        "upon": [
          {
            "zh": "取决于；依赖（较正式）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "deprive": {
      "display": "deprive",
      "prepositions": {
        "of": [
          "The prisoners were deprived of sleep. 囚犯们被剥夺了睡眠。",
          "Poverty deprives children of a good education. 贫困使孩子们失去良好的教育。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.19,
      "senses": {
        "of": [
          {
            "zh": "剥夺",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "derive": {
      "display": "derive",
      "prepositions": {
        "from": [
          "Many English words derive from Latin. 许多英语单词源自拉丁语。",
          "She derives great pleasure from gardening. 她从园艺中获得很大乐趣。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.51,
      "senses": {
        "from": [
          {
            "zh": "源于；从……获得",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "descend": {
      "display": "descend",
      "prepositions": {
        "from": [
          "She is descended from a famous poet. 她是一位著名诗人的后裔。",
          "All modern dogs descend from wolves. 所有现代犬都起源于狼。"
        ],
        "on": [
          "Tourists descend on the island every August. 每年八月游客都会涌向这座岛。"
        ]
      },
      "prepositionOrder": [
        "from",
        "on"
      ],
      "zipf": 3.51,
      "senses": {
        "from": [
          {
            "zh": "是……的后裔；源于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "突然到访；涌向",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "despair": {
      "display": "despair",
      "prepositions": {
        "of": [
          "The doctors had despaired of saving her. 医生们对救活她已经不抱希望。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.82,
      "senses": {
        "of": [
          {
            "zh": "对……绝望",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "deter": {
      "display": "deter",
      "prepositions": {
        "from": [
          "High fines deter people from parking here. 高额罚款使人们不敢在这里停车。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.48,
      "senses": {
        "from": [
          {
            "zh": "阻止；使不敢",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "detract": {
      "display": "detract",
      "prepositions": {
        "from": [
          "The small errors do not detract from the value of the study. 这些小错误并不减损这项研究的价值。",
          "The rainy weather did not detract from our enjoyment. 下雨天并没有减少我们的乐趣。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.01,
      "senses": {
        "from": [
          {
            "zh": "减损；贬低",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "deviate": {
      "display": "deviate",
      "prepositions": {
        "from": [
          "The pilot had to deviate from the planned route. 飞行员不得不偏离计划航线。",
          "Please don't deviate from the instructions. 请不要偏离说明操作。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.06,
      "senses": {
        "from": [
          {
            "zh": "偏离",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "devote": {
      "display": "devote",
      "prepositions": {
        "to": [
          "He devoted his life to helping the poor. 他毕生致力于帮助穷人。",
          "The meeting was devoted to the budget. 这次会议专门讨论预算。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.53,
      "senses": {
        "to": [
          {
            "zh": "把……献给；致力于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "die": {
      "display": "die",
      "prepositions": {
        "of": [
          "His grandfather died of cancer last year. 他的祖父去年死于癌症。",
          "Thousands died of hunger during the famine. 饥荒期间有数千人饿死。"
        ],
        "from": [
          "The soldier died from his wounds. 那名士兵因伤势过重死亡。",
          "Nobody should die from a preventable disease. 没有人应该死于可预防的疾病。"
        ],
        "for": [
          "They were ready to die for their country. 他们随时准备为国捐躯。",
          "I'm dying for a cup of tea. 我特别想喝杯茶。",
          "The kids are dying for the holidays to start. 孩子们巴不得假期马上开始。"
        ],
        "down": [
          "We waited for the wind to die down. 我们等着风慢慢平息。",
          "The applause finally died down. 掌声终于平息了。"
        ],
        "out": [
          "Dinosaurs died out millions of years ago. 恐龙在数百万年前就灭绝了。",
          "The old custom is slowly dying out. 这个古老的习俗正在逐渐消失。"
        ],
        "off": [
          "The leaves on the plant started dying off. 植物的叶子开始一片片枯死。",
          "Bees are dying off at an alarming rate. 蜜蜂正以惊人的速度大量死亡。"
        ]
      },
      "prepositionOrder": [
        "of",
        "from",
        "for",
        "down",
        "out",
        "off"
      ],
      "zipf": 5.07,
      "senses": {
        "of": [
          {
            "zh": "死于（疾病等）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "死于（伤害等）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "为……献身",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "渴望（用进行时）",
            "kind": "preposition",
            "examples": [
              1,
              2
            ]
          }
        ],
        "down": [
          {
            "zh": "逐渐平息",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "灭绝；消失",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "相继死去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "differ": {
      "display": "differ",
      "prepositions": {
        "from": [
          "British spelling differs from American spelling in places. 英式拼写在一些地方与美式拼写不同。",
          "The new model differs little from the old one. 新款与旧款差别不大。"
        ],
        "on": [
          "The two experts differ on this question. 两位专家在这个问题上意见不一。",
          "We differed on how to spend the money. 我们在如何花这笔钱上意见不同。"
        ],
        "with": [
          "I beg to differ with you on that point. 在那一点上恕我不能同意你。",
          "Scientists who differ with the official view are often ignored. 与官方观点不同的科学家常常被忽视。"
        ]
      },
      "prepositionOrder": [
        "from",
        "on",
        "with"
      ],
      "zipf": 4.03,
      "senses": {
        "from": [
          {
            "zh": "与……不同",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "在……上意见不一",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……意见不一",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "differentiate": {
      "display": "differentiate",
      "prepositions": {
        "between": [
          "Young children cannot always differentiate between fantasy and reality. 小孩子并不总能区分幻想和现实。"
        ],
        "from": [
          "What differentiates this phone from its rivals? 这款手机与竞争对手有何不同？"
        ]
      },
      "prepositionOrder": [
        "between",
        "from"
      ],
      "zipf": 3.62,
      "senses": {
        "between": [
          {
            "zh": "区分",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "from": [
          {
            "zh": "使有别于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dig": {
      "display": "dig",
      "prepositions": {
        "up": [
          "The dog dug up a bone in the garden. 狗在花园里刨出一根骨头。",
          "A journalist dug up some old scandals. 一名记者挖出了一些陈年丑闻。"
        ],
        "into": [
          "The police are digging into his past. 警方正在深入调查他的过去。",
          "We had to dig into our savings. 我们不得不动用积蓄。"
        ],
        "in": [
          "Dinner is ready, so dig in! 晚饭好了，开吃吧！",
          "The kids dug in as soon as the pizza arrived. 披萨一到，孩子们就开吃了。"
        ],
        "out": [
          "I dug out some old photos for you. 我给你翻出了一些老照片。"
        ]
      },
      "prepositionOrder": [
        "up",
        "into",
        "in",
        "out"
      ],
      "zipf": 4.22,
      "senses": {
        "up": [
          {
            "zh": "挖出；发掘",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "深入调查",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "动用（钱款）",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "开吃",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "找出",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dine": {
      "display": "dine",
      "prepositions": {
        "out": [
          "We usually dine out on Saturday nights. 我们通常周六晚上出去吃饭。",
          "They could not afford to dine out very often. 他们负担不起经常在外面吃饭。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 3.49,
      "senses": {
        "out": [
          {
            "zh": "在外吃饭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "dip": {
      "display": "dip",
      "prepositions": {
        "into": [
          "I had to dip into my savings to pay the bill. 我不得不动用积蓄来付账。",
          "I like to dip into a poetry book before bed. 我喜欢睡前翻翻诗集。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 4.05,
      "senses": {
        "into": [
          {
            "zh": "动用（钱款）",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "随便翻阅",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ]
      }
    },
    "disagree": {
      "display": "disagree",
      "prepositions": {
        "with": [
          "I disagree with you completely. 我完全不同意你的看法。",
          "Few scientists disagree with this conclusion. 很少有科学家不同意这个结论。",
          "Spicy food disagrees with me. 我一吃辛辣食物就不舒服。"
        ],
        "about": [
          "We disagreed about where to go on holiday. 我们在去哪儿度假的问题上意见不一。"
        ],
        "on": [
          "The partners disagree on almost everything. 两位合伙人几乎在所有事上都意见不一。"
        ]
      },
      "prepositionOrder": [
        "with",
        "about",
        "on"
      ],
      "zipf": 4.09,
      "senses": {
        "with": [
          {
            "zh": "不同意",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "（食物、气候）不适合",
            "kind": "preposition",
            "examples": [
              2
            ]
          }
        ],
        "about": [
          {
            "zh": "在……上意见不一",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "在……上意见不一",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "disapprove": {
      "display": "disapprove",
      "prepositions": {
        "of": [
          "Her parents disapprove of her boyfriend. 她的父母不认可她的男朋友。",
          "Many people disapprove of smoking in public. 许多人不赞成在公共场所吸烟。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.12,
      "senses": {
        "of": [
          {
            "zh": "不赞成",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "discriminate": {
      "display": "discriminate",
      "prepositions": {
        "against": [
          "Employers must not discriminate against older workers. 雇主不得歧视年长的员工。"
        ],
        "between": [
          "The test discriminates between strong and weak readers. 这项测试能区分阅读能力强和弱的人。"
        ]
      },
      "prepositionOrder": [
        "against",
        "between"
      ],
      "zipf": 3.51,
      "senses": {
        "against": [
          {
            "zh": "歧视",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "between": [
          {
            "zh": "区分",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dish": {
      "display": "dish",
      "prepositions": {
        "out": [
          "She dished out the soup to the children. 她把汤分给孩子们。",
          "He is quick to dish out advice. 他总爱随便给人出主意。"
        ],
        "up": [
          "Can you help me dish up the dinner? 你能帮我盛饭菜吗？"
        ]
      },
      "prepositionOrder": [
        "out",
        "up"
      ],
      "zipf": 4.21,
      "senses": {
        "out": [
          {
            "zh": "分发；随意给予",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "盛（饭菜）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dispense": {
      "display": "dispense",
      "prepositions": {
        "with": [
          "Let's dispense with the formalities. 我们免去那些客套吧。",
          "The company dispensed with paper forms years ago. 公司多年前就不再使用纸质表格了。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.11,
      "senses": {
        "with": [
          {
            "zh": "免除；省去",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "dispose": {
      "display": "dispose",
      "prepositions": {
        "of": [
          "Please dispose of your rubbish properly. 请妥善处理你的垃圾。",
          "The company disposed of its old computers. 公司处理掉了旧电脑。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.53,
      "senses": {
        "of": [
          {
            "zh": "处理掉；丢弃",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "dissuade": {
      "display": "dissuade",
      "prepositions": {
        "from": [
          "Nothing could dissuade him from leaving. 谁也劝不住他，他执意要走。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.01,
      "senses": {
        "from": [
          {
            "zh": "劝阻",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "distinguish": {
      "display": "distinguish",
      "prepositions": {
        "between": [
          "Can you distinguish between these two sounds? 你能区分这两个音吗？",
          "Babies soon learn to distinguish between faces. 婴儿很快就学会区分不同的面孔。"
        ],
        "from": [
          "What distinguishes humans from other animals? 人类与其他动物的区别是什么？"
        ]
      },
      "prepositionOrder": [
        "between",
        "from"
      ],
      "zipf": 3.87,
      "senses": {
        "between": [
          {
            "zh": "区分",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "把……与……区别开",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dive": {
      "display": "dive",
      "prepositions": {
        "into": [
          "She dived into the pool. 她一头扎进泳池。",
          "Let's dive into the details of the plan. 我们来深入讨论计划的细节。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 4.12,
      "senses": {
        "into": [
          {
            "zh": "潜入；一头扎进",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "深入研究",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ]
      }
    },
    "divide": {
      "display": "divide",
      "prepositions": {
        "into": [
          "The teacher divided the class into four groups. 老师把全班分成四个小组。",
          "The book is divided into three parts. 这本书分为三部分。"
        ],
        "up": [
          "They divided up the profits equally. 他们平分了利润。",
          "We divided up the chores among the four of us. 我们四个人分担了家务。"
        ],
        "between": [
          "She divides her time between London and Paris. 她一半时间在伦敦，一半时间在巴黎。"
        ],
        "by": [
          "If you divide ten by two, you get five. 十除以二等于五。"
        ]
      },
      "prepositionOrder": [
        "into",
        "up",
        "between",
        "by"
      ],
      "zipf": 4.12,
      "senses": {
        "into": [
          {
            "zh": "分成",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "分配；瓜分",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "between": [
          {
            "zh": "在……之间分配",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "by": [
          {
            "zh": "除以",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "do": {
      "display": "do",
      "prepositions": {
        "up": [
          "Do up your coat before you go outside. 出门前把外套扣好。",
          "She bent down to do her laces up. 她弯下腰系鞋带。",
          "They bought an old farmhouse and did it up. 他们买了一座旧农舍并把它翻修了一番。",
          "The couple spent the summer doing up their kitchen. 这对夫妇花了一个夏天翻新厨房。"
        ],
        "without": [
          "We can do without a car in the city. 在城里我们没有车也行。",
          "I could do without all this noise, honestly. 说实话，这些噪音我实在受够了。"
        ],
        "away with": [
          "The school has done away with uniforms. 这所学校已经取消了校服。",
          "Many countries want to do away with the death penalty. 许多国家想废除死刑。"
        ],
        "with": [
          "What does this letter have to do with me? 这封信跟我有什么关系？",
          "The problem has nothing to do with money. 这个问题与钱无关。"
        ],
        "over": [
          "The teacher asked him to do the essay over. 老师让他把这篇文章重写一遍。",
          "If you make a mistake, just do it over. 如果出错了，重做一遍就行。"
        ]
      },
      "prepositionOrder": [
        "up",
        "without",
        "away with",
        "with",
        "over"
      ],
      "zipf": 6.35,
      "senses": {
        "up": [
          {
            "zh": "系上；扣好",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "装修；翻新",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "without": [
          {
            "zh": "没有……也行",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away with": [
          {
            "zh": "废除；去掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……有关",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "重做",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "donate": {
      "display": "donate",
      "prepositions": {
        "to": [
          "She donated her old clothes to charity. 她把旧衣服捐给了慈善机构。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.04,
      "senses": {
        "to": [
          {
            "zh": "捐赠给",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dote": {
      "display": "dote",
      "prepositions": {
        "on": [
          "The old man dotes on his grandchildren. 老人非常宠爱他的孙辈。",
          "She absolutely dotes on her cat. 她对自己的猫宠爱至极。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 2.23,
      "senses": {
        "on": [
          {
            "zh": "溺爱",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "double": {
      "display": "double",
      "prepositions": {
        "up": [
          "The kids had to double up in one bedroom. 孩子们只好挤在一间卧室里。",
          "He doubled up with laughter. 他笑弯了腰。"
        ],
        "back": [
          "We doubled back when we realized we were lost. 意识到迷路后，我们原路折回。"
        ],
        "as": [
          "The sofa doubles as a bed. 这张沙发还可以当床用。"
        ]
      },
      "prepositionOrder": [
        "up",
        "back",
        "as"
      ],
      "zipf": 5.01,
      "senses": {
        "up": [
          {
            "zh": "合用；挤在一起",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "弯腰（大笑或疼痛）",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "折回",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "as": [
          {
            "zh": "兼作",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "doze": {
      "display": "doze",
      "prepositions": {
        "off": [
          "Grandma dozed off in her armchair. 奶奶在扶手椅上打起了盹。",
          "I kept dozing off during the lecture. 讲座时我一直打瞌睡。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 2.64,
      "senses": {
        "off": [
          {
            "zh": "打盹；打瞌睡",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "drag": {
      "display": "drag",
      "prepositions": {
        "on": [
          "The meeting dragged on for hours. 会议拖了好几个小时。",
          "The war dragged on for years. 战争拖了好多年。"
        ],
        "out": [
          "They dragged the negotiations out for months. 他们把谈判拖了好几个月。"
        ],
        "into": [
          "Don't drag me into your argument. 别把我卷进你们的争吵。"
        ]
      },
      "prepositionOrder": [
        "on",
        "out",
        "into"
      ],
      "zipf": 4.29,
      "senses": {
        "on": [
          {
            "zh": "拖延；拖得太久",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "拖长",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "把……卷入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "draw": {
      "display": "draw",
      "prepositions": {
        "up": [
          "The lawyer drew up a new contract. 律师起草了一份新合同。",
          "Let's draw up a list of guests. 我们来列一份客人名单吧。",
          "A taxi drew up outside the hotel. 一辆出租车在酒店外停了下来。",
          "A police car drew up beside us. 一辆警车在我们旁边停了下来。"
        ],
        "on": [
          "The novel draws on the author's own childhood. 这部小说取材于作者本人的童年。",
          "She drew on years of experience to solve the problem. 她凭借多年的经验解决了这个问题。"
        ],
        "back": [
          "The child drew back in fear. 孩子吓得往后退。",
          "She drew back from the edge of the cliff. 她从悬崖边退了回来。"
        ],
        "in": [
          "The evenings are drawing in now that autumn is here. 秋天到了，天黑得越来越早。"
        ],
        "to": [
          "The festival draws visitors to the town every summer. 这个节日每年夏天都吸引游客来到小镇。"
        ]
      },
      "prepositionOrder": [
        "up",
        "on",
        "back",
        "in",
        "to"
      ],
      "zipf": 4.81,
      "senses": {
        "up": [
          {
            "zh": "起草；拟定",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "（车辆）停下",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "on": [
          {
            "zh": "利用；借鉴",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "退缩；后退",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "（白昼）变短；天黑得早",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "吸引到",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dream": {
      "display": "dream",
      "prepositions": {
        "of": [
          "She has always dreamed of becoming a pilot. 她一直梦想成为一名飞行员。",
          "I wouldn't dream of leaving without saying goodbye. 我绝不会不告而别。"
        ],
        "about": [
          "Last night I dreamed about my old school. 昨晚我梦见了我的母校。",
          "He often dreams about living by the sea. 他常常梦想住在海边。"
        ],
        "up": [
          "Who dreamed up this silly idea? 这个愚蠢的主意是谁想出来的？",
          "The kids dreamed up a new game. 孩子们想出了一个新游戏。"
        ]
      },
      "prepositionOrder": [
        "of",
        "about",
        "up"
      ],
      "zipf": 4.91,
      "senses": {
        "of": [
          {
            "zh": "梦想；渴望",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "想都不会想（用于否定）",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "梦见；梦想",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "想出；编造",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "dress": {
      "display": "dress",
      "prepositions": {
        "up": [
          "Everyone dressed up for the wedding. 大家都为婚礼盛装打扮。",
          "You don't need to dress up for the party. 参加这个聚会你不必盛装打扮。"
        ],
        "up as": [
          "My son dressed up as a pirate. 我儿子装扮成了海盗。"
        ],
        "down": [
          "Staff are allowed to dress down on Fridays. 员工周五可以穿得随便些。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up as",
        "down"
      ],
      "zipf": 4.76,
      "senses": {
        "up": [
          {
            "zh": "盛装打扮",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up as": [
          {
            "zh": "装扮成",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "穿着随便",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "drift": {
      "display": "drift",
      "prepositions": {
        "off": [
          "I drifted off during the film. 我看电影时不知不觉睡着了。",
          "The baby finally drifted off to sleep. 宝宝终于慢慢睡着了。"
        ],
        "apart": [
          "We drifted apart after we left school. 毕业后我们渐渐疏远了。",
          "Old friends sometimes drift apart without any quarrel. 老朋友有时会在没有争吵的情况下渐渐疏远。"
        ]
      },
      "prepositionOrder": [
        "off",
        "apart"
      ],
      "zipf": 3.82,
      "senses": {
        "off": [
          {
            "zh": "渐渐睡着",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "apart": [
          {
            "zh": "渐渐疏远",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "drink": {
      "display": "drink",
      "prepositions": {
        "to": [
          "Let's drink to your success! 让我们为你的成功干杯！",
          "They drank to the health of the bride. 他们为新娘的健康干杯。"
        ],
        "up": [
          "Drink up your milk before it gets cold. 趁牛奶还没凉快喝完。",
          "Drink up, we have to leave soon. 快喝完吧，我们马上得走了。"
        ]
      },
      "prepositionOrder": [
        "to",
        "up"
      ],
      "zipf": 4.9,
      "senses": {
        "to": [
          {
            "zh": "为……干杯",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "喝光",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "drive": {
      "display": "drive",
      "prepositions": {
        "off": [
          "He got in the car and drove off without a word. 他上了车，一言不发地开走了。",
          "The thieves drove off in a stolen van. 窃贼们开着一辆偷来的面包车逃走了。"
        ],
        "away": [
          "The high prices drove customers away. 高昂的价格把顾客都赶跑了。",
          "Their constant arguing drove their friends away. 他们不停地争吵，把朋友都赶走了。"
        ],
        "at": [
          "I don't understand what you're driving at. 我不明白你想说什么。",
          "What exactly is the author driving at here? 作者在这里究竟想表达什么？"
        ],
        "up": [
          "The shortage has driven up the price of rice. 短缺推高了大米价格。",
          "Tourism is driving up house prices in the area. 旅游业正在推高该地区的房价。"
        ],
        "into": [
          "Debt drove the family into poverty. 债务使这个家庭陷入贫困。"
        ]
      },
      "prepositionOrder": [
        "off",
        "away",
        "at",
        "up",
        "into"
      ],
      "zipf": 5.13,
      "senses": {
        "off": [
          {
            "zh": "驾车离开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "赶走；使离开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "at": [
          {
            "zh": "意指；想说",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "抬高（价格）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "迫使陷入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "drop": {
      "display": "drop",
      "prepositions": {
        "out": [
          "He dropped out after his first year at college. 他读完大一就退学了。",
          "Two runners dropped out halfway through the race. 两名选手在比赛中途退出。"
        ],
        "out of": [
          "She dropped out of the competition with an injury. 她因伤退出了比赛。",
          "Too many teenagers drop out of school early. 太多青少年过早辍学。"
        ],
        "off": [
          "Can you drop me off at the station? 你能把我送到车站吗？",
          "I dropped the kids off at school this morning. 今天早上我把孩子们送到了学校。",
          "Grandpa dropped off in front of the television. 爷爷在电视机前睡着了。",
          "I dropped off as soon as my head hit the pillow. 我头一沾枕头就睡着了。",
          "Sales usually drop off after Christmas. 圣诞节后销量通常会下降。",
          "Interest in the show dropped off after the first season. 第一季之后，人们对这部剧的兴趣下降了。"
        ],
        "by": [
          "Drop by any time you are in town. 你来城里时随时过来坐坐。",
          "A neighbor dropped by with some cake. 一位邻居带着蛋糕顺道来访。"
        ],
        "in": [
          "Why don't you drop in for coffee tomorrow? 你明天何不过来喝杯咖啡？",
          "Feel free to drop in whenever you like. 你想什么时候来坐坐都行。"
        ],
        "in on": [
          "We dropped in on my aunt on the way home. 我们回家路上顺道去看了姑姑。"
        ]
      },
      "prepositionOrder": [
        "out",
        "out of",
        "off",
        "by",
        "in",
        "in on"
      ],
      "zipf": 4.99,
      "senses": {
        "out": [
          {
            "zh": "退学；退出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out of": [
          {
            "zh": "退出；从……辍学",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "让……下车；把……送到",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "打瞌睡；睡着",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          },
          {
            "zh": "下降；减少",
            "kind": "particle",
            "examples": [
              4,
              5
            ]
          }
        ],
        "by": [
          {
            "zh": "顺便拜访",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "顺便拜访",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in on": [
          {
            "zh": "顺道拜访（某人）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "drown": {
      "display": "drown",
      "prepositions": {
        "out": [
          "The music drowned out our conversation. 音乐声盖过了我们的谈话。",
          "The crowd drowned out the speaker with boos. 人群的嘘声淹没了演讲者的声音。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 3.68,
      "senses": {
        "out": [
          {
            "zh": "淹没（声音）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "drum": {
      "display": "drum",
      "prepositions": {
        "up": [
          "The team is trying to drum up support for the plan. 团队正努力为这个计划争取支持。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.11,
      "senses": {
        "up": [
          {
            "zh": "竭力争取（支持等）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dry": {
      "display": "dry",
      "prepositions": {
        "up": [
          "The river dries up every summer. 这条河每年夏天都会干涸。",
          "Funding for the project has dried up. 这个项目的资金已经断了。",
          "I'll wash the dishes if you dry up. 如果你擦碗，我就来洗。"
        ],
        "out": [
          "Leave your boots by the fire to dry out. 把靴子放在炉火边烘干。",
          "The paint needs a day to dry out completely. 油漆需要一天才能完全干透。"
        ],
        "off": [
          "He dried himself off with a towel. 他用毛巾把身体擦干。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out",
        "off"
      ],
      "zipf": 4.74,
      "senses": {
        "up": [
          {
            "zh": "干涸；枯竭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "擦干（餐具）",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "out": [
          {
            "zh": "变干；使干透",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "弄干",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dust": {
      "display": "dust",
      "prepositions": {
        "off": [
          "He dusted off his old guitar and started playing again. 他翻出旧吉他，又开始弹了起来。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 4.41,
      "senses": {
        "off": [
          {
            "zh": "重新拿出来用",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "dwell": {
      "display": "dwell",
      "prepositions": {
        "on": [
          "Don't dwell on your mistakes. 别老想着自己的错误。",
          "The speaker dwelled on the risks for too long. 演讲者在风险问题上讲得太久了。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.57,
      "senses": {
        "on": [
          {
            "zh": "老是想着；细说",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "ease": {
      "display": "ease",
      "prepositions": {
        "off": [
          "The rain eased off in the afternoon. 下午雨小了。",
          "You should ease off a little and get some rest. 你应该稍微放松一下，休息休息。"
        ],
        "up": [
          "Traffic usually eases up after seven. 七点以后交通通常会缓解。"
        ],
        "up on": [
          "Ease up on him, he is only a child. 对他宽容点，他还只是个孩子。"
        ],
        "into": [
          "She eased into her new role quickly. 她很快就适应了新角色。"
        ]
      },
      "prepositionOrder": [
        "off",
        "up",
        "up on",
        "into"
      ],
      "zipf": 4.34,
      "senses": {
        "off": [
          {
            "zh": "减轻；放松",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "缓和",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up on": [
          {
            "zh": "对……宽容些",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "慢慢适应；逐渐进入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "eat": {
      "display": "eat",
      "prepositions": {
        "out": [
          "We eat out about once a week. 我们大约每周在外面吃一次饭。",
          "Do you feel like eating out tonight? 你今晚想出去吃吗？"
        ],
        "up": [
          "Eat up your vegetables, please. 请把你的蔬菜吃完。",
          "The new project ate up most of our budget. 新项目耗掉了我们大部分预算。"
        ],
        "into": [
          "Rising rents are eating into our savings. 不断上涨的房租正在蚕食我们的积蓄。"
        ],
        "away at": [
          "Guilt was eating away at him. 内疚感一直折磨着他。",
          "The sea slowly eats away at the cliffs. 海水慢慢侵蚀着悬崖。"
        ]
      },
      "prepositionOrder": [
        "out",
        "up",
        "into",
        "away at"
      ],
      "zipf": 5.13,
      "senses": {
        "out": [
          {
            "zh": "在外吃饭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "吃光",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "耗尽（时间、金钱）",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "消耗；侵蚀",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "away at": [
          {
            "zh": "侵蚀；折磨",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "edge": {
      "display": "edge",
      "prepositions": {
        "out": [
          "The home team edged out their rivals. 主队险胜对手。",
          "Online shops are edging out small local stores. 网店正在逐渐挤垮本地小商店。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.74,
      "senses": {
        "out": [
          {
            "zh": "险胜；逐渐排挤",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "egg": {
      "display": "egg",
      "prepositions": {
        "on": [
          "His friends egged him on to jump. 他的朋友们怂恿他跳下去。",
          "The crowd egged the fighters on. 人群怂恿两名打斗者继续打下去。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.46,
      "senses": {
        "on": [
          {
            "zh": "怂恿",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "eke": {
      "display": "eke",
      "prepositions": {
        "out": [
          "The family eked out a living on the farm. 这家人靠农场勉强维持生计。",
          "We eked out our food supplies for a week. 我们省吃俭用，让食物撑了一个星期。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 2.63,
      "senses": {
        "out": [
          {
            "zh": "勉强维持（生计）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "elaborate": {
      "display": "elaborate",
      "prepositions": {
        "on": [
          "Could you elaborate on that point? 你能详细说明一下那一点吗？",
          "The minister refused to elaborate on his plans. 部长拒绝详细说明他的计划。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.06,
      "senses": {
        "on": [
          {
            "zh": "详细说明",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "elect": {
      "display": "elect",
      "prepositions": {
        "to": [
          "She was elected to parliament at thirty. 她三十岁时当选为议员。",
          "He was elected to the board last year. 他去年当选为董事会成员。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.03,
      "senses": {
        "to": [
          {
            "zh": "选入",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "eliminate": {
      "display": "eliminate",
      "prepositions": {
        "from": [
          "Our team was eliminated from the tournament. 我们队在锦标赛中被淘汰了。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.15,
      "senses": {
        "from": [
          {
            "zh": "淘汰",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "emanate": {
      "display": "emanate",
      "prepositions": {
        "from": [
          "A strange smell emanated from the kitchen. 厨房里飘出一股奇怪的气味。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 2.51,
      "senses": {
        "from": [
          {
            "zh": "从……散发出来",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "embark": {
      "display": "embark",
      "prepositions": {
        "on": [
          "He embarked on a new career in law. 他开始了新的法律职业生涯。",
          "The team embarked on a long journey across Asia. 团队开始了横跨亚洲的漫长旅程。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.4,
      "senses": {
        "on": [
          {
            "zh": "开始；着手",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "emerge": {
      "display": "emerge",
      "prepositions": {
        "from": [
          "A cat emerged from under the car. 一只猫从车底下钻了出来。",
          "The country is slowly emerging from recession. 该国正在慢慢走出经济衰退。"
        ],
        "as": [
          "She emerged as the clear winner. 她脱颖而出，成为无可争议的赢家。",
          "Tourism has emerged as the main industry. 旅游业已经成为主要产业。"
        ]
      },
      "prepositionOrder": [
        "from",
        "as"
      ],
      "zipf": 3.89,
      "senses": {
        "from": [
          {
            "zh": "从……出现；摆脱",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "as": [
          {
            "zh": "作为……出现",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "emigrate": {
      "display": "emigrate",
      "prepositions": {
        "to": [
          "His family emigrated to Canada in the eighties. 他家在八十年代移民到了加拿大。"
        ],
        "from": [
          "Her grandparents emigrated from Italy. 她的祖父母从意大利移民而来。"
        ]
      },
      "prepositionOrder": [
        "to",
        "from"
      ],
      "zipf": 2.89,
      "senses": {
        "to": [
          {
            "zh": "移居到",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "from": [
          {
            "zh": "从……移居",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "empty": {
      "display": "empty",
      "prepositions": {
        "out": [
          "He emptied out his pockets onto the table. 他把口袋里的东西都倒在桌子上。",
          "Empty out the old water before you add fresh water. 加清水之前先把旧水倒掉。"
        ],
        "into": [
          "The river empties into the sea near the city. 这条河在城市附近流入大海。"
        ]
      },
      "prepositionOrder": [
        "out",
        "into"
      ],
      "zipf": 4.59,
      "senses": {
        "out": [
          {
            "zh": "倒空；清空",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "流入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "encroach": {
      "display": "encroach",
      "prepositions": {
        "on": [
          "The new houses encroach on farmland. 新建的房屋侵占了农田。",
          "I don't want to encroach on your free time. 我不想占用你的空闲时间。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 2.49,
      "senses": {
        "on": [
          {
            "zh": "侵犯；侵占",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "end": {
      "display": "end",
      "prepositions": {
        "up": [
          "We ended up staying at home. 我们最后待在了家里。",
          "If you keep this up, you'll end up in trouble. 你再这样下去，最后会惹上麻烦。",
          "He ended up as a teacher in a small village. 他最终在一个小村庄当了老师。"
        ],
        "in": [
          "Their marriage ended in divorce. 他们的婚姻以离婚告终。",
          "The match ended in a draw. 比赛以平局告终。"
        ],
        "with": [
          "The concert ended with a famous song. 音乐会以一首名曲结束。",
          "The evening ended with fireworks over the river. 晚会以河上的烟花结束。"
        ]
      },
      "prepositionOrder": [
        "up",
        "in",
        "with"
      ],
      "zipf": 5.68,
      "senses": {
        "up": [
          {
            "zh": "最终成为；最后处于",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "in": [
          {
            "zh": "以……告终",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "以……结束",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "endow": {
      "display": "endow",
      "prepositions": {
        "with": [
          "She is endowed with great patience. 她天生极有耐心。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 2.43,
      "senses": {
        "with": [
          {
            "zh": "赋予",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "engage": {
      "display": "engage",
      "prepositions": {
        "in": [
          "Students are encouraged to engage in sports. 学生们被鼓励参加体育运动。",
          "The company does not engage in illegal practices. 公司不从事违法活动。"
        ],
        "with": [
          "Good teachers engage with their students. 好老师会与学生积极互动。",
          "The government must engage with local communities. 政府必须与当地社区沟通。"
        ]
      },
      "prepositionOrder": [
        "in",
        "with"
      ],
      "zipf": 4.36,
      "senses": {
        "in": [
          {
            "zh": "从事；参与",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……交流；接触",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "engross": {
      "display": "engross",
      "prepositions": {
        "in": [
          "The boy was engrossed in his book. 男孩全神贯注地看书。",
          "She was so engrossed in her work that she forgot lunch. 她全神贯注地工作，连午饭都忘了。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 1.8,
      "senses": {
        "in": [
          {
            "zh": "使全神贯注",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "enlist": {
      "display": "enlist",
      "prepositions": {
        "in": [
          "He enlisted in the navy at eighteen. 他十八岁时参加了海军。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.37,
      "senses": {
        "in": [
          {
            "zh": "应征入伍；加入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "enquire": {
      "display": "enquire",
      "prepositions": {
        "about": [
          "I am writing to enquire about the job. 我写信来询问这份工作的情况。"
        ],
        "into": [
          "The committee will enquire into the accident. 委员会将调查这起事故。"
        ]
      },
      "prepositionOrder": [
        "about",
        "into"
      ],
      "zipf": 2.91,
      "senses": {
        "about": [
          {
            "zh": "询问",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "调查",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "enroll": {
      "display": "enroll",
      "prepositions": {
        "in": [
          "She enrolled in an evening Spanish class. 她报了一个西班牙语夜校班。",
          "More students are enrolling in online courses. 越来越多的学生报名参加网络课程。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.45,
      "senses": {
        "in": [
          {
            "zh": "注册；报名",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "enter": {
      "display": "enter",
      "prepositions": {
        "into": [
          "The two firms entered into a partnership. 两家公司建立了合作关系。",
          "I don't want to enter into an argument with you. 我不想和你争论。"
        ],
        "for": [
          "She entered for the school poetry prize. 她报名参加了学校诗歌奖评选。",
          "Over a hundred people entered for the marathon. 一百多人报名参加了马拉松。"
        ]
      },
      "prepositionOrder": [
        "into",
        "for"
      ],
      "zipf": 4.81,
      "senses": {
        "into": [
          {
            "zh": "开始（讨论、协议等）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "报名参加",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "entrust": {
      "display": "entrust",
      "prepositions": {
        "with": [
          "She entrusted her neighbor with the keys. 她把钥匙托付给了邻居。"
        ],
        "to": [
          "They entrusted the task to a young engineer. 他们把这项任务交给了一位年轻工程师。"
        ]
      },
      "prepositionOrder": [
        "with",
        "to"
      ],
      "zipf": 2.87,
      "senses": {
        "with": [
          {
            "zh": "委托（某人做某事）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "把……托付给",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "equate": {
      "display": "equate",
      "prepositions": {
        "with": [
          "Many people equate wealth with happiness. 许多人把财富等同于幸福。",
          "You shouldn't equate silence with agreement. 你不应该把沉默等同于同意。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.2,
      "senses": {
        "with": [
          {
            "zh": "把……等同于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "equip": {
      "display": "equip",
      "prepositions": {
        "with": [
          "The lab is equipped with modern instruments. 实验室配备了现代化仪器。",
          "The course equips students with practical skills. 这门课程使学生掌握实用技能。"
        ],
        "for": [
          "School did not equip me for real life. 学校没有让我做好面对现实生活的准备。"
        ]
      },
      "prepositionOrder": [
        "with",
        "for"
      ],
      "zipf": 3.5,
      "senses": {
        "with": [
          {
            "zh": "配备",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "使具备（做……的能力）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "erupt": {
      "display": "erupt",
      "prepositions": {
        "into": [
          "The protest erupted into violence. 抗议演变成了暴力冲突。",
          "The quiet meeting erupted into shouting. 平静的会议突然变成了一片争吵。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 2.97,
      "senses": {
        "into": [
          {
            "zh": "突然演变成",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "escape": {
      "display": "escape",
      "prepositions": {
        "from": [
          "Two prisoners escaped from the jail last night. 昨晚有两名囚犯越狱了。",
          "Reading helps me escape from daily worries. 阅读让我暂时摆脱日常烦恼。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.64,
      "senses": {
        "from": [
          {
            "zh": "从……逃脱",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "even": {
      "display": "even",
      "prepositions": {
        "out": [
          "Prices should even out over the next few months. 未来几个月价格应该会趋于平稳。",
          "The workload should even out once the new staff arrive. 新员工到岗后，工作量应该会均衡一些。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 5.99,
      "senses": {
        "out": [
          {
            "zh": "变平稳；使均等",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "evolve": {
      "display": "evolve",
      "prepositions": {
        "from": [
          "Birds are thought to have evolved from dinosaurs. 人们认为鸟类是由恐龙进化而来的。"
        ],
        "into": [
          "The small shop evolved into a large company. 这家小店逐渐发展成了一家大公司。"
        ]
      },
      "prepositionOrder": [
        "from",
        "into"
      ],
      "zipf": 3.8,
      "senses": {
        "from": [
          {
            "zh": "由……演变而来",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "演变成",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "excel": {
      "display": "excel",
      "prepositions": {
        "at": [
          "She excels at mathematics. 她擅长数学。"
        ],
        "in": [
          "He excelled in every sport he tried. 他尝试的每项运动都很出色。"
        ]
      },
      "prepositionOrder": [
        "at",
        "in"
      ],
      "zipf": 3.73,
      "senses": {
        "at": [
          {
            "zh": "擅长",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "在……方面出色",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "exchange": {
      "display": "exchange",
      "prepositions": {
        "for": [
          "Can I exchange this shirt for a larger size? 我能把这件衬衫换成大一号的吗？",
          "We exchanged our dollars for euros at the airport. 我们在机场把美元换成了欧元。"
        ],
        "with": [
          "He exchanged phone numbers with the girl next to him. 他和旁边的女孩互换了电话号码。"
        ]
      },
      "prepositionOrder": [
        "for",
        "with"
      ],
      "zipf": 4.85,
      "senses": {
        "for": [
          {
            "zh": "用……交换",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……交换",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "exclude": {
      "display": "exclude",
      "prepositions": {
        "from": [
          "Women were once excluded from voting. 女性曾经被排除在投票之外。",
          "Children under ten are excluded from the competition. 十岁以下的儿童不能参加比赛。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.78,
      "senses": {
        "from": [
          {
            "zh": "把……排除在外",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "exempt": {
      "display": "exempt",
      "prepositions": {
        "from": [
          "Charities are exempted from this tax. 慈善机构免缴这项税。",
          "He was exempted from military service. 他被免除了兵役。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.78,
      "senses": {
        "from": [
          {
            "zh": "免除",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "expand": {
      "display": "expand",
      "prepositions": {
        "on": [
          "The author expands on this idea in the second chapter. 作者在第二章详细阐述了这个观点。",
          "Would you care to expand on your answer? 你能把你的回答展开讲讲吗？"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.35,
      "senses": {
        "on": [
          {
            "zh": "详述",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "expect": {
      "display": "expect",
      "prepositions": {
        "of": [
          "What do you expect of me? 你对我有什么期望？",
          "Too much is expected of young doctors. 人们对年轻医生期望过高。"
        ],
        "from": [
          "We expect a reply from the company soon. 我们期待公司很快回复。"
        ]
      },
      "prepositionOrder": [
        "of",
        "from"
      ],
      "zipf": 5.01,
      "senses": {
        "of": [
          {
            "zh": "对……期望",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "期待从……得到",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "experiment": {
      "display": "experiment",
      "prepositions": {
        "with": [
          "The chef likes to experiment with new flavors. 这位厨师喜欢尝试新口味。",
          "Many teenagers experiment with different styles. 许多青少年会尝试不同的风格。"
        ],
        "on": [
          "Should scientists experiment on animals? 科学家应该用动物做实验吗？"
        ]
      },
      "prepositionOrder": [
        "with",
        "on"
      ],
      "zipf": 4.38,
      "senses": {
        "with": [
          {
            "zh": "尝试；用……做实验",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "在……身上做实验",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "explain": {
      "display": "explain",
      "prepositions": {
        "away": [
          "He tried to explain away the missing money. 他试图为那笔不见的钱找借口开脱。",
          "You cannot simply explain away such a serious mistake. 这么严重的错误，你不能就这样搪塞过去。"
        ],
        "to": [
          "Let me explain the rules to you. 让我向你解释一下规则。"
        ]
      },
      "prepositionOrder": [
        "away",
        "to"
      ],
      "zipf": 4.89,
      "senses": {
        "away": [
          {
            "zh": "为……辩解；搪塞",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "向……解释",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "expose": {
      "display": "expose",
      "prepositions": {
        "to": [
          "Don't expose the plants to direct sunlight. 不要让这些植物受阳光直射。",
          "Travel exposed her to new cultures. 旅行让她接触到了新的文化。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.98,
      "senses": {
        "to": [
          {
            "zh": "使接触；使暴露于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "face": {
      "display": "face",
      "prepositions": {
        "up to": [
          "You have to face up to your problems. 你必须勇敢面对自己的问题。",
          "He finally faced up to the fact that he was ill. 他终于接受了自己生病的事实。"
        ],
        "with": [
          "The city is faced with a housing crisis. 这座城市面临住房危机。"
        ],
        "down": [
          "She faced down her critics with calm answers. 她用冷静的回答压倒了批评者。"
        ]
      },
      "prepositionOrder": [
        "up to",
        "with",
        "down"
      ],
      "zipf": 5.45,
      "senses": {
        "up to": [
          {
            "zh": "勇敢面对",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "面临",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "勇敢对抗",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "factor": {
      "display": "factor",
      "prepositions": {
        "in": [
          "Remember to factor in the cost of travel. 记得把旅费考虑在内。",
          "Did you factor in the time for delays? 你把延误的时间算进去了吗？"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 4.67,
      "senses": {
        "in": [
          {
            "zh": "把……计算在内",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "fade": {
      "display": "fade",
      "prepositions": {
        "away": [
          "The sound of the music faded away. 音乐声渐渐消失了。"
        ],
        "out": [
          "The light slowly faded out. 光线慢慢暗了下去。"
        ],
        "into": [
          "The ship faded into the mist. 船渐渐隐没在薄雾中。"
        ]
      },
      "prepositionOrder": [
        "away",
        "out",
        "into"
      ],
      "zipf": 3.86,
      "senses": {
        "away": [
          {
            "zh": "逐渐消失",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "逐渐消失",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "渐渐隐入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fall": {
      "display": "fall",
      "prepositions": {
        "apart": [
          "My old shoes are falling apart. 我的旧鞋快散架了。",
          "After the scandal, the band fell apart. 丑闻之后，乐队解散了。"
        ],
        "behind": [
          "He fell behind with his studies after being ill. 他生病后功课落下了。",
          "Don't fall behind with the rent. 别拖欠房租。"
        ],
        "down": [
          "The old barn finally fell down. 那个旧谷仓终于倒塌了。",
          "The toddler fell down and started crying. 小孩摔倒后哭了起来。"
        ],
        "for": [
          "He fell for her the moment they met. 他们一见面他就爱上了她。",
          "I can't believe you fell for that old trick. 真不敢相信你会上那种老把戏的当。"
        ],
        "out": [
          "The brothers fell out over their inheritance. 兄弟俩因遗产闹翻了。",
          "Her hair started to fall out after the treatment. 治疗后她开始掉头发。"
        ],
        "through": [
          "Our holiday plans fell through at the last minute. 我们的度假计划在最后一刻泡汤了。"
        ],
        "back on": [
          "It's good to have savings to fall back on. 有积蓄可以作为后盾是好事。"
        ],
        "off": [
          "Attendance has fallen off this year. 今年出勤率下降了。"
        ],
        "over": [
          "The vase fell over and broke. 花瓶倒下摔碎了。"
        ],
        "into": [
          "The report falls into three sections. 这份报告分为三个部分。",
          "The house fell into disrepair. 这栋房子年久失修。"
        ]
      },
      "prepositionOrder": [
        "apart",
        "behind",
        "down",
        "for",
        "out",
        "through",
        "back on",
        "off",
        "over",
        "into"
      ],
      "zipf": 5.13,
      "senses": {
        "apart": [
          {
            "zh": "散架；崩溃",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "behind": [
          {
            "zh": "落后",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "倒塌；摔倒",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "爱上",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "上当",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "争吵；闹翻",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "脱落",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "落空；失败",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "back on": [
          {
            "zh": "依靠；求助于",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "减少；下降",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "摔倒；倒下",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "分为",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "陷入（某种状态）",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ]
      }
    },
    "familiarize": {
      "display": "familiarize",
      "prepositions": {
        "with": [
          "Take time to familiarize yourself with the rules. 花点时间熟悉一下规则。",
          "New staff must familiarize themselves with the safety procedures. 新员工必须熟悉安全规程。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 2.79,
      "senses": {
        "with": [
          {
            "zh": "使熟悉",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "fan": {
      "display": "fan",
      "prepositions": {
        "out": [
          "The search party fanned out across the field. 搜救队在田野上散开搜索。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.92,
      "senses": {
        "out": [
          {
            "zh": "散开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fear": {
      "display": "fear",
      "prepositions": {
        "for": [
          "She feared for her son's safety. 她为儿子的安全担忧。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.95,
      "senses": {
        "for": [
          {
            "zh": "为……担心",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "feast": {
      "display": "feast",
      "prepositions": {
        "on": [
          "We feasted on fresh seafood. 我们尽情享用了新鲜海鲜。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.95,
      "senses": {
        "on": [
          {
            "zh": "尽情享用",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "feed": {
      "display": "feed",
      "prepositions": {
        "on": [
          "Owls feed on mice and other small animals. 猫头鹰以老鼠等小动物为食。",
          "Rumors feed on uncertainty. 谣言在不确定中滋生。"
        ],
        "into": [
          "These results will feed into the final report. 这些结果将被纳入最终报告。"
        ]
      },
      "prepositionOrder": [
        "on",
        "into"
      ],
      "zipf": 4.67,
      "senses": {
        "on": [
          {
            "zh": "以……为食",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "影响；纳入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "feel": {
      "display": "feel",
      "prepositions": {
        "like": [
          "I don't feel like cooking tonight. 我今晚不想做饭。",
          "Do you feel like going for a walk? 你想去散散步吗？"
        ],
        "for": [
          "I really feel for families who lost their homes. 我真心同情那些失去家园的家庭。"
        ],
        "up to": [
          "I don't feel up to a long trip today. 我今天没精力长途旅行。"
        ],
        "about": [
          "How do you feel about the new manager? 你觉得新经理怎么样？"
        ]
      },
      "prepositionOrder": [
        "like",
        "for",
        "up to",
        "about"
      ],
      "zipf": 5.67,
      "senses": {
        "like": [
          {
            "zh": "想要",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "同情",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "up to": [
          {
            "zh": "有精力做",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "about": [
          {
            "zh": "对……的感受",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fence": {
      "display": "fence",
      "prepositions": {
        "off": [
          "They fenced off the dangerous area. 他们用栅栏把危险区域隔开了。"
        ],
        "in": [
          "The farmer fenced in his sheep. 农夫用栅栏把羊圈起来。"
        ]
      },
      "prepositionOrder": [
        "off",
        "in"
      ],
      "zipf": 4.21,
      "senses": {
        "off": [
          {
            "zh": "用栅栏隔开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "用栅栏围住",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fend": {
      "display": "fend",
      "prepositions": {
        "off": [
          "She fended off questions from reporters. 她避开了记者们的提问。",
          "The company fended off a takeover bid. 公司挡住了一次收购企图。"
        ],
        "for": [
          "The children had to fend for themselves. 孩子们不得不自己照顾自己。"
        ]
      },
      "prepositionOrder": [
        "off",
        "for"
      ],
      "zipf": 3.21,
      "senses": {
        "off": [
          {
            "zh": "挡开；抵御",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "照料（自己）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fight": {
      "display": "fight",
      "prepositions": {
        "back": [
          "When the bully hit him, he fought back. 那个恶霸打他时，他进行了反击。",
          "She fought back tears as she spoke. 她说话时强忍着泪水。"
        ],
        "off": [
          "The body can fight off most infections. 身体能抵御大多数感染。",
          "She fought off the urge to laugh. 她忍住了笑。",
          "The soldiers fought off the attack. 士兵们击退了进攻。"
        ],
        "for": [
          "They fought for their rights. 他们为自己的权利而斗争。",
          "Workers are fighting for better pay. 工人们正在争取更高的工资。"
        ],
        "against": [
          "The country fought against poverty for decades. 这个国家数十年来一直与贫困作斗争。"
        ],
        "over": [
          "The children fought over the last cookie. 孩子们为最后一块饼干争吵起来。"
        ],
        "with": [
          "He often fought with his brother as a kid. 他小时候经常和哥哥打架。"
        ]
      },
      "prepositionOrder": [
        "back",
        "off",
        "for",
        "against",
        "over",
        "with"
      ],
      "zipf": 5.23,
      "senses": {
        "back": [
          {
            "zh": "反击",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "强忍（泪水等）",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "击退；抵御（疾病）",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "for": [
          {
            "zh": "为……而战",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "与……作斗争",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "为……争吵",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "与……打架；争吵",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "figure": {
      "display": "figure",
      "prepositions": {
        "out": [
          "I can't figure out how this machine works. 我弄不明白这台机器怎么运作。",
          "Don't worry, we'll figure it out together. 别担心，我们会一起想出办法的。",
          "She finally figured out the answer. 她终于想出了答案。"
        ],
        "in": [
          "Money figures in almost every decision he makes. 他做的几乎每个决定都和钱有关。"
        ],
        "on": [
          "We figured on arriving before dark. 我们估计天黑前到达。"
        ]
      },
      "prepositionOrder": [
        "out",
        "in",
        "on"
      ],
      "zipf": 5.07,
      "senses": {
        "out": [
          {
            "zh": "弄清楚；想出",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "in": [
          {
            "zh": "出现在；起作用",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "预计；指望",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "file": {
      "display": "file",
      "prepositions": {
        "for": [
          "The couple filed for divorce. 这对夫妇申请离婚了。",
          "He filed for unemployment benefits. 他申请了失业救济金。",
          "The company filed for bankruptcy last month. 该公司上个月申请破产。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.75,
      "senses": {
        "for": [
          {
            "zh": "申请（离婚、破产等）",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "fill": {
      "display": "fill",
      "prepositions": {
        "in": [
          "Please fill in this form. 请填写这张表格。",
          "Fill in the blanks with the correct words. 用正确的单词填空。"
        ],
        "in for": [
          "Can you fill in for me while I'm away? 我不在时你能替我一下吗？",
          "A substitute teacher filled in for Mrs Wang today. 今天一位代课老师替王老师上课。"
        ],
        "in on": [
          "I'll fill you in on the details later. 稍后我再告诉你详细情况。"
        ],
        "out": [
          "You need to fill out an application. 你需要填写一份申请表。",
          "He filled out the survey in five minutes. 他五分钟就填完了调查问卷。"
        ],
        "up": [
          "Fill up the tank before the long drive. 长途驾驶前把油箱加满。",
          "The room quickly filled up with guests. 房间里很快挤满了客人。"
        ],
        "with": [
          "Her eyes filled with tears. 她眼里充满了泪水。",
          "The news filled us with hope. 这个消息让我们充满了希望。"
        ]
      },
      "prepositionOrder": [
        "in",
        "in for",
        "in on",
        "out",
        "up",
        "with"
      ],
      "zipf": 4.64,
      "senses": {
        "in": [
          {
            "zh": "填写",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in for": [
          {
            "zh": "代替（某人工作）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in on": [
          {
            "zh": "告知详情",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "填写（表格）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "装满；加满",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "充满",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "find": {
      "display": "find",
      "prepositions": {
        "out": [
          "I found out the truth last week. 我上周弄清了真相。",
          "We found out that the shop had closed. 我们发现那家店已经关门了。",
          "Can you find out when the train leaves? 你能查一下火车什么时候开吗？"
        ],
        "out about": [
          "How did you find out about the party? 你是怎么知道聚会的事的？",
          "Nobody found out about their secret wedding. 没人知道他们秘密举行了婚礼。"
        ],
        "for": [
          "The jury found for the defendant. 陪审团裁定被告胜诉。"
        ],
        "against": [
          "The court found against the company. 法院判决公司败诉。"
        ]
      },
      "prepositionOrder": [
        "out",
        "out about",
        "for",
        "against"
      ],
      "zipf": 5.76,
      "senses": {
        "out": [
          {
            "zh": "发现；查明",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "out about": [
          {
            "zh": "得知",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "判决（胜诉）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "against": [
          {
            "zh": "判……败诉",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "finish": {
      "display": "finish",
      "prepositions": {
        "off": [
          "Let's finish off the cake. 我们把蛋糕吃完吧。",
          "I need to finish off this report tonight. 我今晚得把这份报告写完。"
        ],
        "up": [
          "We finished up at a small cafe by the river. 我们最后来到了河边的一家小咖啡馆。"
        ],
        "with": [
          "Have you finished with the newspaper? 报纸你看完了吗？",
          "She says she has finished with him for good. 她说她和他彻底断了。"
        ]
      },
      "prepositionOrder": [
        "off",
        "up",
        "with"
      ],
      "zipf": 4.91,
      "senses": {
        "off": [
          {
            "zh": "吃完；完成",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "最终处于",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "用完",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "与……断绝关系",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ]
      }
    },
    "fire": {
      "display": "fire",
      "prepositions": {
        "away": [
          "If you have any questions, fire away. 如果你有问题，尽管问吧。"
        ],
        "up": [
          "The speech fired up the crowd. 这番演讲点燃了人群的热情。",
          "He fired up his laptop and checked his email. 他打开笔记本电脑查看邮件。"
        ],
        "at": [
          "The soldiers fired at the enemy position. 士兵们向敌军阵地开火。"
        ]
      },
      "prepositionOrder": [
        "away",
        "up",
        "at"
      ],
      "zipf": 5.3,
      "senses": {
        "away": [
          {
            "zh": "开始提问",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "激发",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "启动（设备）",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "at": [
          {
            "zh": "向……开火",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fish": {
      "display": "fish",
      "prepositions": {
        "for": [
          "He was obviously fishing for compliments. 他显然是在讨人夸奖。"
        ],
        "out": [
          "She fished out her keys from her bag. 她从包里掏出了钥匙。",
          "He fished a coin out of his pocket. 他从口袋里掏出一枚硬币。"
        ]
      },
      "prepositionOrder": [
        "for",
        "out"
      ],
      "zipf": 4.9,
      "senses": {
        "for": [
          {
            "zh": "刻意索取",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "掏出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "fit": {
      "display": "fit",
      "prepositions": {
        "in": [
          "The new student found it hard to fit in. 新同学发现很难融入集体。",
          "The doctor can fit you in at noon. 医生中午可以抽空给你看病。"
        ],
        "in with": [
          "Does this plan fit in with your schedule? 这个计划与你的日程安排相符吗？"
        ],
        "into": [
          "All my clothes fit into one suitcase. 我所有的衣服都能装进一个行李箱。"
        ],
        "with": [
          "His story does not fit with the facts. 他的说法与事实不符。"
        ],
        "out": [
          "The ship was fitted out for a long voyage. 这艘船已为远航装备妥当。"
        ]
      },
      "prepositionOrder": [
        "in",
        "in with",
        "into",
        "with",
        "out"
      ],
      "zipf": 4.95,
      "senses": {
        "in": [
          {
            "zh": "适应；融入",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "抽出时间见",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "in with": [
          {
            "zh": "与……相符",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "装进",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "与……相符",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "装备",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fix": {
      "display": "fix",
      "prepositions": {
        "up": [
          "They fixed up the old house themselves. 他们自己修缮了那座旧房子。"
        ],
        "up with": [
          "My sister fixed me up with a date. 我姐姐给我安排了一次约会。"
        ],
        "on": [
          "His eyes were fixed on the screen. 他的目光盯着屏幕。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up with",
        "on"
      ],
      "zipf": 4.75,
      "senses": {
        "up": [
          {
            "zh": "修理；装修",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up with": [
          {
            "zh": "为……安排",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "注视；确定",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fizzle": {
      "display": "fizzle",
      "prepositions": {
        "out": [
          "The protest fizzled out after a few days. 抗议几天后就不了了之了。",
          "Their romance fizzled out by the summer. 到了夏天，他们的恋情就无疾而终了。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 2.5,
      "senses": {
        "out": [
          {
            "zh": "不了了之",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "flag": {
      "display": "flag",
      "prepositions": {
        "down": [
          "We flagged down a taxi. 我们招手拦了一辆出租车。",
          "A driver flagged down a passing police car. 一名司机招手拦下了一辆路过的警车。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.58,
      "senses": {
        "down": [
          {
            "zh": "招手使停下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "flare": {
      "display": "flare",
      "prepositions": {
        "up": [
          "Fighting flared up again in the north. 北部再次爆发了战斗。",
          "My back pain flares up in cold weather. 天冷时我的背痛就会发作。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.64,
      "senses": {
        "up": [
          {
            "zh": "突然爆发；复发",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "flee": {
      "display": "flee",
      "prepositions": {
        "from": [
          "Thousands fled from the war zone. 数千人逃离了战区。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.81,
      "senses": {
        "from": [
          {
            "zh": "逃离",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "flesh": {
      "display": "flesh",
      "prepositions": {
        "out": [
          "You need to flesh out your argument with examples. 你需要用例子来充实你的论点。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.2,
      "senses": {
        "out": [
          {
            "zh": "充实",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "flick": {
      "display": "flick",
      "prepositions": {
        "through": [
          "I flicked through a magazine while I waited. 等待时我翻了翻杂志。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 3.63,
      "senses": {
        "through": [
          {
            "zh": "快速翻阅",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "flip": {
      "display": "flip",
      "prepositions": {
        "through": [
          "He flipped through the photos on his phone. 他快速翻看手机里的照片。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 4.2,
      "senses": {
        "through": [
          {
            "zh": "快速翻阅",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "flirt": {
      "display": "flirt",
      "prepositions": {
        "with": [
          "He was flirting with the waitress. 他在和女服务员调情。",
          "She has been flirting with the idea of moving abroad. 她一直有出国的念头。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.52,
      "senses": {
        "with": [
          {
            "zh": "调情",
            "kind": "preposition",
            "examples": [
              0
            ]
          },
          {
            "zh": "有（做某事的）念头",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ]
      }
    },
    "flock": {
      "display": "flock",
      "prepositions": {
        "to": [
          "Fans flocked to the stadium. 球迷们涌向体育场。",
          "Tourists flock to the beaches in August. 八月份游客蜂拥来到海滩。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.69,
      "senses": {
        "to": [
          {
            "zh": "蜂拥而至",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "flow": {
      "display": "flow",
      "prepositions": {
        "from": [
          "Many benefits flow from regular exercise. 许多益处源自经常锻炼。"
        ],
        "into": [
          "The river flows into the lake. 这条河流入湖中。"
        ]
      },
      "prepositionOrder": [
        "from",
        "into"
      ],
      "zipf": 4.68,
      "senses": {
        "from": [
          {
            "zh": "源于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "流入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fly": {
      "display": "fly",
      "prepositions": {
        "into": [
          "He flew into a rage when he heard the news. 他听到消息后勃然大怒。"
        ],
        "away": [
          "The bird flew away when I came closer. 我走近时鸟飞走了。"
        ]
      },
      "prepositionOrder": [
        "into",
        "away"
      ],
      "zipf": 4.75,
      "senses": {
        "into": [
          {
            "zh": "勃然（大怒）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "away": [
          {
            "zh": "飞走",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "focus": {
      "display": "focus",
      "prepositions": {
        "on": [
          "Try to focus on the task in front of you. 试着专注于眼前的任务。",
          "The study focuses on young adults. 这项研究关注的是年轻人。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 5.0,
      "senses": {
        "on": [
          {
            "zh": "集中于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "fold": {
      "display": "fold",
      "prepositions": {
        "up": [
          "Fold up the map when you're done. 看完后把地图折起来。",
          "The small business folded up after a year. 那家小企业一年后就倒闭了。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.08,
      "senses": {
        "up": [
          {
            "zh": "折叠",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "倒闭",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ]
      }
    },
    "follow": {
      "display": "follow",
      "prepositions": {
        "up": [
          "The police followed up every lead. 警方跟进了每一条线索。",
          "I'll follow up with an email tomorrow. 我明天会再发一封邮件跟进。"
        ],
        "up with": [
          "She followed up her first novel with a book of poems. 她继第一部小说之后又出版了一本诗集。"
        ],
        "through": [
          "He never follows through on his promises. 他从不兑现自己的承诺。",
          "It's easy to make plans but hard to follow through. 制定计划容易，坚持到底却很难。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up with",
        "through"
      ],
      "zipf": 5.14,
      "senses": {
        "up": [
          {
            "zh": "跟进",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up with": [
          {
            "zh": "接着做",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "through": [
          {
            "zh": "贯彻到底",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "fool": {
      "display": "fool",
      "prepositions": {
        "around": [
          "Stop fooling around and do your homework. 别胡闹了，快做作业。",
          "The boys were fooling around in the back of the class. 男孩们在教室后排胡闹。"
        ],
        "with": [
          "Don't fool with the electrical wires. 别乱动电线。"
        ]
      },
      "prepositionOrder": [
        "around",
        "with"
      ],
      "zipf": 4.29,
      "senses": {
        "around": [
          {
            "zh": "胡闹；闲荡",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "乱摆弄",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "forbid": {
      "display": "forbid",
      "prepositions": {
        "from": [
          "He was forbidden from leaving the country. 他被禁止出境。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.66,
      "senses": {
        "from": [
          {
            "zh": "禁止",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "force": {
      "display": "force",
      "prepositions": {
        "into": [
          "He was forced into early retirement. 他被迫提前退休。"
        ],
        "on": [
          "Don't force your opinions on others. 不要把你的观点强加于人。"
        ],
        "out": [
          "The chairman was forced out after the scandal. 丑闻之后，董事长被迫下台。"
        ]
      },
      "prepositionOrder": [
        "into",
        "on",
        "out"
      ],
      "zipf": 5.23,
      "senses": {
        "into": [
          {
            "zh": "迫使",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "把……强加于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "迫使离开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "forge": {
      "display": "forge",
      "prepositions": {
        "ahead": [
          "The company forged ahead with its plans. 公司稳步推进其计划。"
        ]
      },
      "prepositionOrder": [
        "ahead"
      ],
      "zipf": 3.78,
      "senses": {
        "ahead": [
          {
            "zh": "稳步前进",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "forget": {
      "display": "forget",
      "prepositions": {
        "about": [
          "I completely forgot about the meeting. 我完全忘了开会这回事。",
          "Forget about work and enjoy your weekend. 别想工作了，好好享受周末吧。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 5.06,
      "senses": {
        "about": [
          {
            "zh": "忘记",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "forgive": {
      "display": "forgive",
      "prepositions": {
        "for": [
          "Please forgive me for being late. 请原谅我迟到了。",
          "She never forgave him for lying. 她始终没有原谅他撒谎。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.25,
      "senses": {
        "for": [
          {
            "zh": "原谅",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "fork": {
      "display": "fork",
      "prepositions": {
        "out": [
          "We had to fork out a lot for the repairs. 我们不得不花一大笔钱修理。",
          "Parents have to fork out a fortune for school uniforms. 家长们不得不为校服掏一大笔钱。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.03,
      "senses": {
        "out": [
          {
            "zh": "不情愿地付钱",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "found": {
      "display": "found",
      "prepositions": {
        "on": [
          "The theory is founded on careful observation. 这个理论建立在细致观察的基础上。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 5.68,
      "senses": {
        "on": [
          {
            "zh": "以……为基础",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "freak": {
      "display": "freak",
      "prepositions": {
        "out": [
          "She freaked out when she saw the spider. 她看到蜘蛛时吓坏了。",
          "Don't freak out, it's only a small scratch. 别慌，只是一道小划痕。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.08,
      "senses": {
        "out": [
          {
            "zh": "惊慌失措",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "free": {
      "display": "free",
      "prepositions": {
        "from": [
          "The new machine frees workers from boring tasks. 新机器使工人摆脱了枯燥的工作。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 5.63,
      "senses": {
        "from": [
          {
            "zh": "使摆脱",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "freeze": {
      "display": "freeze",
      "prepositions": {
        "over": [
          "The lake froze over last winter. 去年冬天湖面结冰了。",
          "The pond freezes over every January. 池塘每年一月都会结冰。"
        ],
        "out": [
          "The other girls froze her out of the group. 其他女孩把她排挤出了小圈子。"
        ]
      },
      "prepositionOrder": [
        "over",
        "out"
      ],
      "zipf": 4.11,
      "senses": {
        "over": [
          {
            "zh": "结冰",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "排挤",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fret": {
      "display": "fret",
      "prepositions": {
        "about": [
          "Don't fret about the small things. 别为小事烦恼。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 3.27,
      "senses": {
        "about": [
          {
            "zh": "为……烦恼",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "frighten": {
      "display": "frighten",
      "prepositions": {
        "away": [
          "The noise frightened the birds away. 噪音把鸟儿吓跑了。"
        ],
        "into": [
          "They frightened him into signing the paper. 他们恐吓他，逼他签了那份文件。"
        ]
      },
      "prepositionOrder": [
        "away",
        "into"
      ],
      "zipf": 3.08,
      "senses": {
        "away": [
          {
            "zh": "吓跑",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "吓得（做某事）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fritter": {
      "display": "fritter",
      "prepositions": {
        "away": [
          "He frittered away his inheritance on gambling. 他把遗产都挥霍在赌博上了。"
        ]
      },
      "prepositionOrder": [
        "away"
      ],
      "zipf": 2.26,
      "senses": {
        "away": [
          {
            "zh": "浪费",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "frown": {
      "display": "frown",
      "prepositions": {
        "on": [
          "The school frowns on students using phones in class. 学校不赞成学生在课上用手机。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.26,
      "senses": {
        "on": [
          {
            "zh": "不赞成",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "fumble": {
      "display": "fumble",
      "prepositions": {
        "for": [
          "He fumbled for the light switch in the dark. 他在黑暗中摸索电灯开关。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 3.36,
      "senses": {
        "for": [
          {
            "zh": "摸索着找",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "furnish": {
      "display": "furnish",
      "prepositions": {
        "with": [
          "The hotel room was furnished with antiques. 酒店房间里摆着古董家具。",
          "Can you furnish us with more details? 你能向我们提供更多细节吗？"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.14,
      "senses": {
        "with": [
          {
            "zh": "提供；配备",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "fuss": {
      "display": "fuss",
      "prepositions": {
        "over": [
          "My aunt always fusses over me. 我姑姑总是对我过分关心。"
        ],
        "about": [
          "Stop fussing about your hair. 别再为你的头发瞎操心了。"
        ]
      },
      "prepositionOrder": [
        "over",
        "about"
      ],
      "zipf": 3.62,
      "senses": {
        "over": [
          {
            "zh": "过分关心",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "about": [
          {
            "zh": "为……小题大做；瞎操心",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gamble": {
      "display": "gamble",
      "prepositions": {
        "on": [
          "They gambled on the weather staying dry. 他们冒险赌天气不会下雨。"
        ],
        "away": [
          "He gambled away his entire fortune. 他把全部家产都赌光了。"
        ]
      },
      "prepositionOrder": [
        "on",
        "away"
      ],
      "zipf": 3.79,
      "senses": {
        "on": [
          {
            "zh": "押注于；冒险指望",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "away": [
          {
            "zh": "赌光",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gang": {
      "display": "gang",
      "prepositions": {
        "up on": [
          "The older boys ganged up on him. 大男孩们联合起来欺负他。"
        ]
      },
      "prepositionOrder": [
        "up on"
      ],
      "zipf": 4.5,
      "senses": {
        "up on": [
          {
            "zh": "联合起来对付",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gather": {
      "display": "gather",
      "prepositions": {
        "around": [
          "The children gathered around the storyteller. 孩子们围在讲故事的人身边。"
        ],
        "up": [
          "She gathered up her papers and left. 她收拾起文件离开了。"
        ]
      },
      "prepositionOrder": [
        "around",
        "up"
      ],
      "zipf": 4.24,
      "senses": {
        "around": [
          {
            "zh": "围拢",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "收拾；聚拢",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gaze": {
      "display": "gaze",
      "prepositions": {
        "at": [
          "She sat gazing at the sea for hours. 她坐着凝望大海好几个小时。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 3.7,
      "senses": {
        "at": [
          {
            "zh": "凝视",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gear": {
      "display": "gear",
      "prepositions": {
        "up for": [
          "The town is gearing up for the festival. 小镇正在为节日做准备。"
        ],
        "towards": [
          "The course is geared towards beginners. 这门课程是面向初学者的。"
        ]
      },
      "prepositionOrder": [
        "up for",
        "towards"
      ],
      "zipf": 4.46,
      "senses": {
        "up for": [
          {
            "zh": "为……做好准备",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "towards": [
          {
            "zh": "使适合于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "get": {
      "display": "get",
      "prepositions": {
        "up": [
          "I usually get up at seven on weekdays. 我工作日通常七点起床。",
          "She got up early to catch the first train. 她早早起床去赶头班火车。"
        ],
        "along with": [
          "Do you get along with your new roommate? 你和新室友相处得好吗？",
          "He has never got along with his older brother. 他和哥哥一直合不来。"
        ],
        "on with": [
          "Stop chatting and get on with your homework. 别聊天了，继续写你的作业。",
          "She gets on with everyone in the office. 她和办公室里每个人都处得来。"
        ],
        "over": [
          "It took him weeks to get over the flu. 他花了好几周才从流感中恢复过来。",
          "She still hasn't got over the loss of her dog. 她还没从失去爱犬的悲痛中走出来。",
          "You need to get over your fear of speaking in public. 你需要克服当众讲话的恐惧。"
        ],
        "back": [
          "What time did you get back last night? 你昨晚几点回来的？",
          "I lent him my bike and never got it back. 我把自行车借给他，一直没要回来。"
        ],
        "back to": [
          "I will get back to you after the meeting. 开完会我再回复你。",
          "Let's get back to the main question. 我们回到主要问题上来吧。"
        ],
        "away": [
          "The thief got away before the police arrived. 警察赶到之前小偷就逃走了。",
          "We hope to get away for a few days in May. 我们希望五月能出去玩几天。"
        ],
        "away with": [
          "He cheated on the test and got away with it. 他考试作弊却没受到处罚。",
          "You won't get away with lying to your parents. 你对父母撒谎是逃不掉惩罚的。"
        ],
        "out of": [
          "She got out of the car and waved at us. 她下了车，向我们挥手。",
          "He always tries to get out of washing the dishes. 他总想逃避洗碗。"
        ],
        "off": [
          "We got off the bus at the wrong stop. 我们在错误的车站下了公交车。",
          "Get off at the next station and change trains. 在下一站下车换乘。"
        ],
        "on": [
          "Hurry up and get on the train! 快点上火车！",
          "Several passengers got on at the airport. 有几名乘客在机场上了车。"
        ],
        "through": [
          "Their friendship helped her get through a hard year. 他们的友谊帮她熬过了艰难的一年。",
          "I called the bank but couldn't get through. 我给银行打电话，但一直打不通。"
        ],
        "through to": [
          "I tried to explain, but I just couldn't get through to him. 我试着解释，但就是没法让他明白。"
        ],
        "around": [
          "It is easy to get around the city by subway. 在这座城市里坐地铁出行很方便。",
          "News of the wedding soon got around. 婚礼的消息很快就传开了。"
        ],
        "around to": [
          "I finally got around to cleaning the garage. 我终于抽出时间打扫了车库。",
          "She never gets around to answering her emails. 她总是没空回复邮件。"
        ],
        "ahead": [
          "You have to work hard to get ahead in this company. 在这家公司想出人头地就得努力工作。"
        ],
        "by": [
          "They get by on a very small income. 他们靠微薄的收入勉强度日。",
          "I know enough French to get by. 我的法语够日常应付。"
        ],
        "down": [
          "The rainy weather is really getting me down. 这阴雨天真让我心情低落。",
          "Don't let the criticism get you down. 别让批评影响你的心情。"
        ],
        "down to": [
          "Let's get down to business. 我们言归正传吧。",
          "After lunch we got down to the real work. 午饭后我们开始认真干活。"
        ],
        "in": [
          "The burglar got in through the kitchen window. 窃贼从厨房窗户进来了。",
          "Our flight gets in at midnight. 我们的航班半夜到达。"
        ],
        "into": [
          "He got into trouble for skipping class. 他因逃课惹了麻烦。",
          "She got into jazz when she was at college. 她在大学时迷上了爵士乐。"
        ],
        "together": [
          "Let's get together for dinner next week. 我们下周聚一起吃个饭吧。",
          "The whole family gets together at New Year. 全家人在新年时团聚。"
        ],
        "across": [
          "The teacher managed to get the idea across clearly. 老师成功地把这个概念讲清楚了。"
        ],
        "over with": [
          "Let's just get the exam over with. 我们赶紧把考试应付完吧。"
        ],
        "at": [
          "What exactly are you getting at? 你到底想说什么？"
        ]
      },
      "prepositionOrder": [
        "up",
        "along with",
        "on with",
        "over",
        "back",
        "back to",
        "away",
        "away with",
        "out of",
        "off",
        "on",
        "through",
        "through to",
        "around",
        "around to",
        "ahead",
        "by",
        "down",
        "down to",
        "in",
        "into",
        "together",
        "across",
        "over with",
        "at"
      ],
      "zipf": 6.28,
      "senses": {
        "up": [
          {
            "zh": "起床",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "along with": [
          {
            "zh": "与……相处融洽",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on with": [
          {
            "zh": "与……相处；继续做",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "从（疾病、打击等）中恢复；克服",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "back": [
          {
            "zh": "回来；取回",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back to": [
          {
            "zh": "稍后回复（某人）；回到（某事）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "逃脱；离开度假",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away with": [
          {
            "zh": "逃脱（惩罚）；做坏事而不受惩罚",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out of": [
          {
            "zh": "从……出来；逃避（责任）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "下（车、船等）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "上（车、船等）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "度过（难关）；接通电话",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through to": [
          {
            "zh": "使理解；与……接通",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "around": [
          {
            "zh": "走动；传开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "around to": [
          {
            "zh": "终于抽出时间做",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "ahead": [
          {
            "zh": "取得成功；领先",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "by": [
          {
            "zh": "勉强维持生活",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "使沮丧",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down to": [
          {
            "zh": "开始认真处理",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "进入；到达",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "进入；卷入；开始喜欢",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "together": [
          {
            "zh": "聚会",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "across": [
          {
            "zh": "使被理解",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over with": [
          {
            "zh": "把（不愉快的事）了结",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "at": [
          {
            "zh": "暗示；指责",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "give": {
      "display": "give",
      "prepositions": {
        "up": [
          "Never give up on your dreams. 永远不要放弃你的梦想。",
          "He gave up smoking last year. 他去年戒烟了。",
          "The puzzle was too hard, so I gave it up. 这个谜题太难了，我就放弃了。"
        ],
        "up on": [
          "The doctors never gave up on her. 医生们从未放弃她。"
        ],
        "in": [
          "The government refused to give in to the protesters. 政府拒绝向抗议者让步。",
          "After an hour of begging, his mother gave in. 在他央求了一个小时后，他母亲让步了。",
          "Please give in your essays by Friday. 请在周五前上交论文。"
        ],
        "back": [
          "Can you give me back my pen? 你能把笔还给我吗？",
          "I gave the book back to the library yesterday. 我昨天把书还给图书馆了。"
        ],
        "away": [
          "She gave away all her old clothes. 她把旧衣服全都送人了。",
          "Don't give away the ending of the film! 别透露电影的结局！"
        ],
        "out": [
          "The teacher gave out the test papers. 老师分发了试卷。",
          "After ten miles my legs finally gave out. 走了十英里后我的腿终于撑不住了。"
        ],
        "off": [
          "The flowers give off a sweet smell. 这些花散发出一股甜香。",
          "The old heater gives off very little heat. 这台旧取暖器几乎不发热。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up on",
        "in",
        "back",
        "away",
        "out",
        "off"
      ],
      "zipf": 5.71,
      "senses": {
        "up": [
          {
            "zh": "放弃；戒除",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "up on": [
          {
            "zh": "对……不再抱希望",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "屈服；让步",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "上交",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "back": [
          {
            "zh": "归还",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "赠送；泄露",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "分发；耗尽",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "发出（气味、光、热）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "glance": {
      "display": "glance",
      "prepositions": {
        "at": [
          "She glanced at her watch nervously. 她紧张地看了一眼手表。",
          "He glanced at the headlines and put the paper down. 他扫了一眼标题就放下了报纸。"
        ],
        "through": [
          "I only had time to glance through the report. 我只来得及浏览一下报告。"
        ]
      },
      "prepositionOrder": [
        "at",
        "through"
      ],
      "zipf": 3.91,
      "senses": {
        "at": [
          {
            "zh": "瞥一眼",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "浏览",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "glare": {
      "display": "glare",
      "prepositions": {
        "at": [
          "The old man glared at the noisy boys. 老人怒视着那些吵闹的男孩。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 3.36,
      "senses": {
        "at": [
          {
            "zh": "怒视",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gloss": {
      "display": "gloss",
      "prepositions": {
        "over": [
          "The report glossed over the main problems. 报告对主要问题轻描淡写。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 3.47,
      "senses": {
        "over": [
          {
            "zh": "掩饰；轻描淡写",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "glow": {
      "display": "glow",
      "prepositions": {
        "with": [
          "Her face glowed with pride. 她脸上洋溢着自豪。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.91,
      "senses": {
        "with": [
          {
            "zh": "洋溢着",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "go": {
      "display": "go",
      "prepositions": {
        "on": [
          "Please go on, I am listening. 请继续说，我在听。",
          "What is going on in the kitchen? 厨房里发生什么事了？",
          "The meeting went on for three hours. 会议持续了三个小时。"
        ],
        "out": [
          "We went out for pizza last night. 我们昨晚出去吃了比萨。",
          "Suddenly all the lights went out. 突然所有的灯都灭了。"
        ],
        "out with": [
          "How long have you been going out with her? 你和她交往多久了？"
        ],
        "off": [
          "A bomb went off near the station. 车站附近发生了炸弹爆炸。",
          "My alarm went off at six this morning. 我的闹钟今早六点响了。",
          "The milk has gone off, so don't drink it. 牛奶已经变质了，别喝。"
        ],
        "over": [
          "Let's go over the plan once more. 我们再把计划过一遍吧。",
          "She went over her notes before the exam. 考试前她复习了笔记。"
        ],
        "through": [
          "The country went through a long recession. 这个国家经历了长期的经济衰退。",
          "I went through all my pockets but found no key. 我翻遍了所有口袋也没找到钥匙。"
        ],
        "back": [
          "I never want to go back to that hotel. 我再也不想回那家酒店了。",
          "This tradition goes back hundreds of years. 这一传统可以追溯到几百年前。"
        ],
        "back on": [
          "He went back on his promise to help us. 他违背了帮助我们的承诺。"
        ],
        "down": [
          "House prices have gone down this year. 今年房价下降了。",
          "The sun goes down around eight in summer. 夏天太阳八点左右落山。"
        ],
        "up": [
          "The price of petrol keeps going up. 汽油价格不断上涨。",
          "New apartment blocks are going up everywhere. 到处都在建新的公寓楼。"
        ],
        "ahead": [
          "You can go ahead and start without me. 你们可以先开始，不用等我。",
          "The concert will go ahead despite the rain. 尽管下雨，音乐会仍将照常举行。"
        ],
        "ahead with": [
          "The city decided to go ahead with the new bridge. 市政府决定着手修建新桥。"
        ],
        "with": [
          "Does this tie go with my shirt? 这条领带配我的衬衫吗？",
          "Stress often goes with a demanding job. 高强度的工作往往伴随着压力。"
        ],
        "along with": [
          "I will go along with whatever you decide. 无论你怎么决定我都同意。"
        ],
        "without": [
          "We had to go without hot water for a week. 我们不得不一周都没有热水用。",
          "Many families go without basic medicine. 许多家庭连基本药品都没有。"
        ],
        "for": [
          "I think I will go for the chicken salad. 我想我要鸡肉沙拉。",
          "If you really want the job, go for it! 如果你真想要这份工作，就去争取吧！"
        ],
        "away": [
          "Go away and leave me alone! 走开，别烦我！",
          "The pain went away after an hour. 一个小时后疼痛消失了。"
        ],
        "by": [
          "Three years went by before we met again. 三年过去后我们才再次相见。"
        ],
        "through with": [
          "She was nervous but went through with the operation. 她很紧张，但还是做完了手术。"
        ],
        "round": [
          "Is there enough cake to go round? 蛋糕够每人一份吗？"
        ],
        "into": [
          "I won't go into the details now. 我现在不细说了。",
          "After college he went into banking. 大学毕业后他进入了银行业。"
        ],
        "off with": [
          "Someone went off with my umbrella. 有人把我的伞拿走了。"
        ],
        "under": [
          "The small shop went under during the recession. 那家小店在经济衰退中倒闭了。"
        ]
      },
      "prepositionOrder": [
        "on",
        "out",
        "out with",
        "off",
        "over",
        "through",
        "back",
        "back on",
        "down",
        "up",
        "ahead",
        "ahead with",
        "with",
        "along with",
        "without",
        "for",
        "away",
        "by",
        "through with",
        "round",
        "into",
        "off with",
        "under"
      ],
      "zipf": 6.03,
      "senses": {
        "on": [
          {
            "zh": "继续；发生",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "out": [
          {
            "zh": "外出；熄灭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out with": [
          {
            "zh": "与……交往（恋爱）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "爆炸；（警报、闹钟等）响起",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "（食物）变质",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "over": [
          {
            "zh": "仔细检查；复习",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "经历（困难）；仔细查看",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "回去；追溯到",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back on": [
          {
            "zh": "违背（承诺）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "下降；下沉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "上升；被建起",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "ahead": [
          {
            "zh": "开始；继续进行",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "ahead with": [
          {
            "zh": "着手进行",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "与……相配；伴随",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "along with": [
          {
            "zh": "同意；赞成",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "without": [
          {
            "zh": "没有……也行",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "选择；努力争取",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "离开；消失",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "by": [
          {
            "zh": "（时间）流逝",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "through with": [
          {
            "zh": "完成；将……进行到底",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "round": [
          {
            "zh": "足够分配",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "详细讨论；进入（某行业）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off with": [
          {
            "zh": "与……私奔；拿走",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "under": [
          {
            "zh": "破产；沉没",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gobble": {
      "display": "gobble",
      "prepositions": {
        "up": [
          "The kids gobbled up the cookies. 孩子们把饼干一扫而光。",
          "Big firms are gobbling up small ones. 大公司正在吞并小公司。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 2.83,
      "senses": {
        "up": [
          {
            "zh": "狼吞虎咽；吞并",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "gossip": {
      "display": "gossip",
      "prepositions": {
        "about": [
          "The neighbors love gossiping about each other. 邻居们喜欢互相说闲话。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 3.88,
      "senses": {
        "about": [
          {
            "zh": "议论；说闲话",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "graduate": {
      "display": "graduate",
      "prepositions": {
        "from": [
          "She graduated from Oxford in law. 她毕业于牛津大学法学专业。",
          "He graduated from high school last June. 他去年六月高中毕业。"
        ],
        "in": [
          "My sister graduated in chemistry. 我姐姐获得了化学学位。"
        ]
      },
      "prepositionOrder": [
        "from",
        "in"
      ],
      "zipf": 4.5,
      "senses": {
        "from": [
          {
            "zh": "毕业于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "获得……学位",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "grapple": {
      "display": "grapple",
      "prepositions": {
        "with": [
          "Scientists are still grappling with this problem. 科学家们仍在努力解决这个问题。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.12,
      "senses": {
        "with": [
          {
            "zh": "努力解决；与……搏斗",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "grieve": {
      "display": "grieve",
      "prepositions": {
        "for": [
          "The whole nation grieved for the victims. 全国人民为遇难者哀悼。"
        ],
        "over": [
          "She is still grieving over her father's death. 她仍在为父亲的去世而悲痛。"
        ]
      },
      "prepositionOrder": [
        "for",
        "over"
      ],
      "zipf": 3.33,
      "senses": {
        "for": [
          {
            "zh": "为……悲伤",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "因……悲痛",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "grin": {
      "display": "grin",
      "prepositions": {
        "at": [
          "The boy grinned at me from across the room. 男孩在房间另一头冲我咧嘴一笑。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 3.59,
      "senses": {
        "at": [
          {
            "zh": "对……咧嘴笑",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "grow": {
      "display": "grow",
      "prepositions": {
        "up": [
          "I grew up in a small village. 我在一个小村庄长大。",
          "What do you want to be when you grow up? 你长大后想做什么？"
        ],
        "out of": [
          "He has grown out of his school uniform. 他长大了，校服穿不下了。",
          "Most kids grow out of their fear of the dark. 大多数孩子长大后就不怕黑了。"
        ],
        "into": [
          "The small shop grew into a national chain. 这家小店发展成了全国连锁店。"
        ],
        "on": [
          "The song grows on you after a while. 这首歌听一阵子就会越来越喜欢。"
        ],
        "apart": [
          "We grew apart after college. 大学毕业后我们渐渐疏远了。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out of",
        "into",
        "on",
        "apart"
      ],
      "zipf": 4.9,
      "senses": {
        "up": [
          {
            "zh": "长大",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out of": [
          {
            "zh": "长大穿不下；长大后不再",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "成长为",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "越来越被喜欢",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "apart": [
          {
            "zh": "渐渐疏远",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "growl": {
      "display": "growl",
      "prepositions": {
        "at": [
          "The dog growled at the stranger. 狗对着陌生人低吼。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 3.14,
      "senses": {
        "at": [
          {
            "zh": "对……咆哮",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "grumble": {
      "display": "grumble",
      "prepositions": {
        "about": [
          "He is always grumbling about his salary. 他总是抱怨自己的工资。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 2.8,
      "senses": {
        "about": [
          {
            "zh": "抱怨",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "guard": {
      "display": "guard",
      "prepositions": {
        "against": [
          "Wash your hands to guard against infection. 勤洗手以防感染。",
          "We must guard against complacency. 我们必须防止自满。"
        ]
      },
      "prepositionOrder": [
        "against"
      ],
      "zipf": 4.73,
      "senses": {
        "against": [
          {
            "zh": "防范",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "guess": {
      "display": "guess",
      "prepositions": {
        "at": [
          "We can only guess at his motives. 我们只能猜测他的动机。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 5.17,
      "senses": {
        "at": [
          {
            "zh": "猜测",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gulp": {
      "display": "gulp",
      "prepositions": {
        "down": [
          "He gulped down his coffee and ran out. 他一口喝完咖啡就跑了出去。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 2.93,
      "senses": {
        "down": [
          {
            "zh": "狼吞虎咽地吃喝",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "gush": {
      "display": "gush",
      "prepositions": {
        "over": [
          "Everyone gushed over the new baby. 大家都对新生儿赞不绝口。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 2.83,
      "senses": {
        "over": [
          {
            "zh": "对……过分夸赞",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hack": {
      "display": "hack",
      "prepositions": {
        "into": [
          "Someone hacked into the school's database. 有人入侵了学校的数据库。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 4.05,
      "senses": {
        "into": [
          {
            "zh": "非法侵入（计算机系统）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "haggle": {
      "display": "haggle",
      "prepositions": {
        "over": [
          "Tourists haggled over the price of a rug. 游客为一块地毯讨价还价。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 2.65,
      "senses": {
        "over": [
          {
            "zh": "为……讨价还价",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hammer": {
      "display": "hammer",
      "prepositions": {
        "out": [
          "The two sides hammered out an agreement overnight. 双方连夜敲定了一项协议。"
        ],
        "away at": [
          "He kept hammering away at the problem. 他一直在不懈地钻研这个问题。"
        ]
      },
      "prepositionOrder": [
        "out",
        "away at"
      ],
      "zipf": 4.16,
      "senses": {
        "out": [
          {
            "zh": "经过讨论达成",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "away at": [
          {
            "zh": "坚持不懈地做",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hand": {
      "display": "hand",
      "prepositions": {
        "in": [
          "Hand in your homework by Monday. 周一前上交作业。",
          "She handed her resignation in yesterday. 她昨天递交了辞呈。"
        ],
        "out": [
          "Volunteers handed out food to the homeless. 志愿者向无家可归者分发食物。"
        ],
        "over": [
          "Hand over the keys, please. 请把钥匙交出来。",
          "He handed the business over to his son. 他把生意交给了儿子。"
        ],
        "down": [
          "The ring was handed down from my grandmother. 这枚戒指是从我外婆那里传下来的。"
        ],
        "back": [
          "The teacher handed back our tests. 老师把试卷发还给我们。"
        ]
      },
      "prepositionOrder": [
        "in",
        "out",
        "over",
        "down",
        "back"
      ],
      "zipf": 5.41,
      "senses": {
        "in": [
          {
            "zh": "上交",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "分发",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "移交；交出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "传下来",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "back": [
          {
            "zh": "归还",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hang": {
      "display": "hang",
      "prepositions": {
        "up": [
          "She hung up before I could explain. 我还没来得及解释她就挂了电话。",
          "Don't hang up, I have something to tell you. 别挂电话，我有事要告诉你。",
          "Hang your coat up in the hall. 把你的外套挂在门厅。"
        ],
        "up on": [
          "He got angry and hung up on me. 他生气了，挂了我的电话。"
        ],
        "out": [
          "We used to hang out at the mall after school. 我们以前放学后常在商场闲逛。"
        ],
        "out with": [
          "Who do you usually hang out with on weekends? 你周末通常和谁一起玩？"
        ],
        "on": [
          "Hang on, I will be ready in a minute. 等一下，我马上就好。",
          "Hang on tight, the road is bumpy. 抓紧，路很颠簸。",
          "The whole case hangs on one witness. 整个案件取决于一名证人。"
        ],
        "around": [
          "There were some teenagers hanging around the park. 有几个青少年在公园里闲逛。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up on",
        "out",
        "out with",
        "on",
        "around"
      ],
      "zipf": 4.6,
      "senses": {
        "up": [
          {
            "zh": "挂断电话",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "挂起",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "up on": [
          {
            "zh": "挂断（某人的）电话",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "闲逛；消磨时间",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out with": [
          {
            "zh": "与……一起玩",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "稍等；紧紧抓住",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "取决于",
            "kind": "preposition",
            "examples": [
              2
            ]
          }
        ],
        "around": [
          {
            "zh": "闲待着；逗留",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hanker": {
      "display": "hanker",
      "prepositions": {
        "after": [
          "She still hankers after a life in the city. 她仍渴望城市生活。"
        ]
      },
      "prepositionOrder": [
        "after"
      ],
      "zipf": 1.97,
      "senses": {
        "after": [
          {
            "zh": "渴望",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "happen": {
      "display": "happen",
      "prepositions": {
        "to": [
          "What happened to your leg? 你的腿怎么了？",
          "The same thing happened to me last year. 同样的事去年也发生在我身上。"
        ],
        "upon": [
          "We happened upon a small cafe in the old town. 我们在老城区偶然发现了一家小咖啡馆。"
        ]
      },
      "prepositionOrder": [
        "to",
        "upon"
      ],
      "zipf": 5.19,
      "senses": {
        "to": [
          {
            "zh": "发生在……身上",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "upon": [
          {
            "zh": "偶然发现",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hark": {
      "display": "hark",
      "prepositions": {
        "back to": [
          "The design harks back to the nineteen fifties. 这个设计让人想起二十世纪五十年代。"
        ]
      },
      "prepositionOrder": [
        "back to"
      ],
      "zipf": 2.81,
      "senses": {
        "back to": [
          {
            "zh": "追溯到；回想",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "harp": {
      "display": "harp",
      "prepositions": {
        "on": [
          "Stop harping on my mistakes. 别再唠叨我的错误了。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.4,
      "senses": {
        "on": [
          {
            "zh": "喋喋不休地说",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "have": {
      "display": "have",
      "prepositions": {
        "on": [
          "She had on a bright red coat. 她穿着一件鲜红的外套。"
        ],
        "over": [
          "We are having some friends over for dinner. 我们请了几个朋友来家里吃饭。"
        ],
        "against": [
          "I have nothing against your friends. 我对你的朋友没有任何意见。"
        ],
        "back": [
          "The school would love to have her back next year. 学校很希望明年再请她回来。"
        ]
      },
      "prepositionOrder": [
        "on",
        "over",
        "against",
        "back"
      ],
      "zipf": 6.71,
      "senses": {
        "on": [
          {
            "zh": "穿着",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "请（某人）来家里",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "against": [
          {
            "zh": "对……有意见",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "back": [
          {
            "zh": "请回来；再邀请",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "head": {
      "display": "head",
      "prepositions": {
        "for": [
          "We are heading for the beach. 我们正前往海滩。",
          "The company is heading for bankruptcy. 这家公司正走向破产。"
        ],
        "off": [
          "It is late, I should head off now. 很晚了，我该走了。",
          "The police headed off trouble at the stadium. 警方防止了体育场可能出现的骚乱。"
        ],
        "back": [
          "We headed back to the hotel before dark. 我们在天黑前返回了酒店。"
        ],
        "out": [
          "I am heading out to the shops. Do you need anything? 我要出门去商店，你要带什么吗？"
        ]
      },
      "prepositionOrder": [
        "for",
        "off",
        "back",
        "out"
      ],
      "zipf": 5.51,
      "senses": {
        "for": [
          {
            "zh": "前往",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "出发；阻止",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "返回",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "出门",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "heal": {
      "display": "heal",
      "prepositions": {
        "up": [
          "The cut healed up in a week. 伤口一周就愈合了。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.12,
      "senses": {
        "up": [
          {
            "zh": "愈合",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hear": {
      "display": "hear",
      "prepositions": {
        "from": [
          "Have you heard from Anna recently? 你最近有安娜的消息吗？",
          "We look forward to hearing from you. 我们期待您的回复。"
        ],
        "of": [
          "I have never heard of that writer. 我从没听说过那位作家。",
          "Have you heard of the new cafe downtown? 你听说过市中心那家新咖啡馆吗？"
        ],
        "about": [
          "Did you hear about the accident on the highway? 你听说高速公路上的事故了吗？"
        ],
        "out": [
          "Please hear me out before you decide. 你决定之前请先听我把话说完。"
        ]
      },
      "prepositionOrder": [
        "from",
        "of",
        "about",
        "out"
      ],
      "zipf": 5.23,
      "senses": {
        "from": [
          {
            "zh": "收到……的消息",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "of": [
          {
            "zh": "听说过",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "听说（某事的详情）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "听完（某人的话）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "heat": {
      "display": "heat",
      "prepositions": {
        "up": [
          "I will heat up some soup for lunch. 我午饭热点汤。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.86,
      "senses": {
        "up": [
          {
            "zh": "加热",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "help": {
      "display": "help",
      "prepositions": {
        "with": [
          "Can you help me with my homework? 你能帮我做作业吗？",
          "My brother helped with the moving. 我哥哥帮忙搬了家。"
        ],
        "out": [
          "My parents helped me out when I lost my job. 我失业时父母帮了我一把。",
          "If you need money, I can help out. 如果你需要钱，我可以帮忙。"
        ],
        "to": [
          "Please help yourself to some cake. 请随便吃点蛋糕。"
        ]
      },
      "prepositionOrder": [
        "with",
        "out",
        "to"
      ],
      "zipf": 5.75,
      "senses": {
        "with": [
          {
            "zh": "帮助做",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "帮忙（尤指困难时）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "自行取用",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hesitate": {
      "display": "hesitate",
      "prepositions": {
        "over": [
          "He hesitated over the final question. 他在最后一道题上犹豫了。"
        ],
        "about": [
          "She hesitated about accepting the job offer. 她对是否接受这份工作犹豫不决。"
        ]
      },
      "prepositionOrder": [
        "over",
        "about"
      ],
      "zipf": 3.79,
      "senses": {
        "over": [
          {
            "zh": "在……上犹豫",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "about": [
          {
            "zh": "对……犹豫不决",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hide": {
      "display": "hide",
      "prepositions": {
        "from": [
          "The cat hid from the visitors under the bed. 猫躲在床底下躲避客人。",
          "She tried to hide the truth from her parents. 她试图对父母隐瞒真相。"
        ],
        "away": [
          "He hid away in his room all weekend. 他整个周末都躲在房间里。"
        ]
      },
      "prepositionOrder": [
        "from",
        "away"
      ],
      "zipf": 4.54,
      "senses": {
        "from": [
          {
            "zh": "躲避；对……隐瞒",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "躲藏",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hinge": {
      "display": "hinge",
      "prepositions": {
        "on": [
          "Everything hinges on the vote tomorrow. 一切都取决于明天的投票。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.32,
      "senses": {
        "on": [
          {
            "zh": "取决于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hint": {
      "display": "hint",
      "prepositions": {
        "at": [
          "The minister hinted at an early election. 部长暗示可能会提前选举。",
          "She hinted at a surprise but said nothing more. 她暗示有个惊喜，但没再多说。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 4.07,
      "senses": {
        "at": [
          {
            "zh": "暗示",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "hire": {
      "display": "hire",
      "prepositions": {
        "out": [
          "They hire out bikes to tourists. 他们向游客出租自行车。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.4,
      "senses": {
        "out": [
          {
            "zh": "出租",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hit": {
      "display": "hit",
      "prepositions": {
        "on": [
          "She finally hit on a solution. 她终于想到了解决办法。",
          "Some guy kept hitting on her at the bar. 酒吧里有个家伙一直在跟她搭讪。"
        ],
        "back": [
          "The minister hit back at his critics. 部长对批评者予以回击。"
        ],
        "off": [
          "We hit it off the moment we met. 我们一见面就很投缘。"
        ]
      },
      "prepositionOrder": [
        "on",
        "back",
        "off"
      ],
      "zipf": 5.37,
      "senses": {
        "on": [
          {
            "zh": "想到（主意）；搭讪",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "回击",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "一见如故",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hold": {
      "display": "hold",
      "prepositions": {
        "on": [
          "Hold on, I will get my coat. 等一下，我去拿外套。",
          "Hold on a minute, I am putting you through. 请稍等，我给你转接。"
        ],
        "on to": [
          "Hold on to the rail when the train moves. 火车开动时抓紧扶手。",
          "You should hold on to those old photos. 你应该保留那些老照片。"
        ],
        "up": [
          "Sorry I am late, I was held up in traffic. 抱歉我迟到了，路上堵车了。",
          "The strike held up production for weeks. 罢工使生产耽误了好几周。",
          "Two men held up a bank in the city center. 两名男子在市中心抢劫了一家银行。",
          "She held up her hand to ask a question. 她举手提问。"
        ],
        "back": [
          "He could hardly hold back his tears. 他几乎忍不住眼泪。",
          "I felt she was holding something back. 我觉得她有所隐瞒。"
        ],
        "out": [
          "Our water supply will not hold out much longer. 我们的水供应撑不了多久了。"
        ],
        "out for": [
          "The union is holding out for a better offer. 工会坚持要求更好的条件。"
        ],
        "off": [
          "We held off buying a house until prices fell. 我们推迟买房，直到房价下跌。"
        ],
        "against": [
          "She made a mistake, but I don't hold it against her. 她犯了错，但我不会因此记恨她。"
        ],
        "to": [
          "I will hold you to your promise. 我会让你兑现承诺。"
        ],
        "together": [
          "The team held together through a difficult season. 球队在困难的赛季中保持了团结。"
        ]
      },
      "prepositionOrder": [
        "on",
        "on to",
        "up",
        "back",
        "out",
        "out for",
        "off",
        "against",
        "to",
        "together"
      ],
      "zipf": 5.19,
      "senses": {
        "on": [
          {
            "zh": "等一下；坚持",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on to": [
          {
            "zh": "紧紧抓住；保留",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "耽搁；延误",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "抢劫",
            "kind": "particle",
            "examples": [
              2
            ]
          },
          {
            "zh": "举起；支撑",
            "kind": "particle",
            "examples": [
              3
            ]
          }
        ],
        "back": [
          {
            "zh": "抑制；隐瞒",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "维持；坚持",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out for": [
          {
            "zh": "坚持要求",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "推迟；拖延",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "against": [
          {
            "zh": "因……对某人怀恨",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "使（某人）遵守（承诺）；坚持",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "together": [
          {
            "zh": "保持团结",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "home": {
      "display": "home",
      "prepositions": {
        "in on": [
          "The missile homed in on its target. 导弹锁定了目标。"
        ]
      },
      "prepositionOrder": [
        "in on"
      ],
      "zipf": 5.81,
      "senses": {
        "in on": [
          {
            "zh": "对准；集中注意",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hook": {
      "display": "hook",
      "prepositions": {
        "up": [
          "Can you hook up the printer to my laptop? 你能把打印机连到我的笔记本电脑上吗？"
        ],
        "up with": [
          "I hooked up with some old friends in London. 我在伦敦联系上了几个老朋友。"
        ],
        "on": [
          "She is hooked on that new TV series. 她迷上了那部新电视剧。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up with",
        "on"
      ],
      "zipf": 4.37,
      "senses": {
        "up": [
          {
            "zh": "连接（设备）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up with": [
          {
            "zh": "与……结识；联系上",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "迷上",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hop": {
      "display": "hop",
      "prepositions": {
        "on": [
          "Hop on, I will give you a ride. 上车吧，我载你一程。"
        ],
        "off": [
          "We hopped off the bus near the museum. 我们在博物馆附近下了公交车。"
        ]
      },
      "prepositionOrder": [
        "on",
        "off"
      ],
      "zipf": 4.4,
      "senses": {
        "on": [
          {
            "zh": "跳上（车）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "跳下（车）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hope": {
      "display": "hope",
      "prepositions": {
        "for": [
          "We are hoping for good weather tomorrow. 我们希望明天天气好。",
          "The farmers hoped for rain all summer. 农民们整个夏天都盼着下雨。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 5.44,
      "senses": {
        "for": [
          {
            "zh": "希望；盼望",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "huddle": {
      "display": "huddle",
      "prepositions": {
        "together": [
          "The campers huddled together for warmth. 露营者挤在一起取暖。"
        ]
      },
      "prepositionOrder": [
        "together"
      ],
      "zipf": 3.08,
      "senses": {
        "together": [
          {
            "zh": "挤在一起",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hunger": {
      "display": "hunger",
      "prepositions": {
        "for": [
          "The people hungered for freedom. 人民渴望自由。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.1,
      "senses": {
        "for": [
          {
            "zh": "渴望",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hunt": {
      "display": "hunt",
      "prepositions": {
        "for": [
          "I spent an hour hunting for my glasses. 我花了一个小时找眼镜。"
        ],
        "down": [
          "The police hunted down the escaped prisoner. 警方追捕到了逃犯。"
        ]
      },
      "prepositionOrder": [
        "for",
        "down"
      ],
      "zipf": 4.49,
      "senses": {
        "for": [
          {
            "zh": "寻找",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "追捕到；找到",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hurry": {
      "display": "hurry",
      "prepositions": {
        "up": [
          "Hurry up or we will miss the bus! 快点，不然我们赶不上公交车了！",
          "Can you hurry them up a bit? 你能催他们快一点吗？"
        ],
        "off": [
          "He hurried off to catch his train. 他匆匆离开去赶火车。"
        ]
      },
      "prepositionOrder": [
        "up",
        "off"
      ],
      "zipf": 4.14,
      "senses": {
        "up": [
          {
            "zh": "赶快",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "匆匆离开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "hush": {
      "display": "hush",
      "prepositions": {
        "up": [
          "The company tried to hush up the scandal. 公司试图掩盖这桩丑闻。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.47,
      "senses": {
        "up": [
          {
            "zh": "掩盖",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "identify": {
      "display": "identify",
      "prepositions": {
        "with": [
          "Many readers identify with the main character. 许多读者对主人公产生共鸣。"
        ],
        "as": [
          "The man was identified as a former employee. 这名男子被确认为前雇员。"
        ]
      },
      "prepositionOrder": [
        "with",
        "as"
      ],
      "zipf": 4.56,
      "senses": {
        "with": [
          {
            "zh": "认同；与……产生共鸣",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "as": [
          {
            "zh": "确认为；认定是",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "idle": {
      "display": "idle",
      "prepositions": {
        "away": [
          "We idled away the afternoon by the pool. 我们在泳池边消磨了一个下午。"
        ]
      },
      "prepositionOrder": [
        "away"
      ],
      "zipf": 3.7,
      "senses": {
        "away": [
          {
            "zh": "虚度",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "immerse": {
      "display": "immerse",
      "prepositions": {
        "in": [
          "She immersed herself in her work after the divorce. 离婚后她全身心投入工作。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 2.94,
      "senses": {
        "in": [
          {
            "zh": "使沉浸于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "impose": {
      "display": "impose",
      "prepositions": {
        "on": [
          "The government imposed a new tax on sugar. 政府对糖征收了一项新税。",
          "I don't want to impose on you. 我不想给你添麻烦。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.92,
      "senses": {
        "on": [
          {
            "zh": "把……强加于；给……添麻烦",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "impress": {
      "display": "impress",
      "prepositions": {
        "on": [
          "My father impressed on me the value of honesty. 我父亲让我牢记诚实的可贵。"
        ],
        "with": [
          "He impressed the judges with his speech. 他的演讲给评委留下了深刻印象。"
        ]
      },
      "prepositionOrder": [
        "on",
        "with"
      ],
      "zipf": 3.93,
      "senses": {
        "on": [
          {
            "zh": "使铭记",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "以……给人深刻印象",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "improve": {
      "display": "improve",
      "prepositions": {
        "on": [
          "She improved on her personal best by two seconds. 她把个人最好成绩提高了两秒。",
          "It is hard to improve on the original design. 很难在原设计的基础上再改进。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.79,
      "senses": {
        "on": [
          {
            "zh": "改进；超越",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "increase": {
      "display": "increase",
      "prepositions": {
        "by": [
          "Sales increased by ten percent last year. 去年销售额增长了百分之十。",
          "The population has increased by half since then. 从那以后人口增加了一半。"
        ],
        "in": [
          "The city has increased in size rapidly. 这座城市的规模迅速扩大。"
        ]
      },
      "prepositionOrder": [
        "by",
        "in"
      ],
      "zipf": 5.08,
      "senses": {
        "by": [
          {
            "zh": "增加了（幅度）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "在……方面增加",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "indulge": {
      "display": "indulge",
      "prepositions": {
        "in": [
          "On holiday we indulged in local desserts. 度假时我们尽情享用当地甜点。",
          "He rarely indulges in gossip. 他很少说闲话。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.54,
      "senses": {
        "in": [
          {
            "zh": "沉迷于；尽情享受",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "infer": {
      "display": "infer",
      "prepositions": {
        "from": [
          "What can we infer from these results? 我们能从这些结果推断出什么？"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.16,
      "senses": {
        "from": [
          {
            "zh": "从……推断",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "inform": {
      "display": "inform",
      "prepositions": {
        "of": [
          "Please inform us of any change of address. 地址如有变更请通知我们。",
          "The patient was informed of the risks. 病人被告知了风险。"
        ],
        "about": [
          "Nobody informed me about the meeting. 没人通知我开会的事。"
        ],
        "on": [
          "He informed on his own partners. 他告发了自己的合伙人。"
        ]
      },
      "prepositionOrder": [
        "of",
        "about",
        "on"
      ],
      "zipf": 4.15,
      "senses": {
        "of": [
          {
            "zh": "通知；告知",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "告知有关……的情况",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "告发",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "inherit": {
      "display": "inherit",
      "prepositions": {
        "from": [
          "He inherited the farm from his uncle. 他从叔叔那里继承了农场。",
          "She inherited her blue eyes from her mother. 她的蓝眼睛遗传自母亲。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.52,
      "senses": {
        "from": [
          {
            "zh": "从……继承",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "inject": {
      "display": "inject",
      "prepositions": {
        "into": [
          "The government injected money into the banks. 政府向银行注入资金。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 3.44,
      "senses": {
        "into": [
          {
            "zh": "向……注入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "inquire": {
      "display": "inquire",
      "prepositions": {
        "about": [
          "I am calling to inquire about the job. 我打电话来询问这份工作。"
        ],
        "into": [
          "The committee will inquire into the incident. 委员会将调查这起事件。"
        ],
        "after": [
          "She inquired after my mother's health. 她问候了我母亲的身体状况。"
        ]
      },
      "prepositionOrder": [
        "about",
        "into",
        "after"
      ],
      "zipf": 3.38,
      "senses": {
        "about": [
          {
            "zh": "询问",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "调查",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "after": [
          {
            "zh": "问候",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "insert": {
      "display": "insert",
      "prepositions": {
        "into": [
          "Insert the card into the slot. 把卡插入卡槽。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 4.01,
      "senses": {
        "into": [
          {
            "zh": "插入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "insist": {
      "display": "insist",
      "prepositions": {
        "on": [
          "She insisted on paying for dinner. 她坚持要付晚饭钱。",
          "My father insists on punctuality. 我父亲坚持要守时。",
          "He insisted on his innocence throughout the trial. 整个审判过程中他一直坚称自己无罪。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.03,
      "senses": {
        "on": [
          {
            "zh": "坚持；坚决要求",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "insure": {
      "display": "insure",
      "prepositions": {
        "against": [
          "Is your house insured against flood damage? 你的房子投保了水灾险吗？"
        ]
      },
      "prepositionOrder": [
        "against"
      ],
      "zipf": 3.4,
      "senses": {
        "against": [
          {
            "zh": "为……投保",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "integrate": {
      "display": "integrate",
      "prepositions": {
        "into": [
          "It takes time to integrate into a new culture. 融入一种新文化需要时间。"
        ],
        "with": [
          "The app integrates with most calendars. 这个应用可以与大多数日历集成。"
        ]
      },
      "prepositionOrder": [
        "into",
        "with"
      ],
      "zipf": 3.72,
      "senses": {
        "into": [
          {
            "zh": "使融入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "与……结合",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "interest": {
      "display": "interest",
      "prepositions": {
        "in": [
          "Can I interest you in a cup of coffee? 要不要来杯咖啡？",
          "The teacher tried to interest the class in poetry. 老师试图让全班对诗歌产生兴趣。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 5.17,
      "senses": {
        "in": [
          {
            "zh": "使对……感兴趣",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "interfere": {
      "display": "interfere",
      "prepositions": {
        "with": [
          "Don't let games interfere with your studies. 别让游戏影响你的学习。",
          "Mobile phones may interfere with the equipment. 手机可能会干扰这台设备。"
        ],
        "in": [
          "I don't want to interfere in your private life. 我不想干涉你的私生活。"
        ]
      },
      "prepositionOrder": [
        "with",
        "in"
      ],
      "zipf": 3.88,
      "senses": {
        "with": [
          {
            "zh": "妨碍；干扰",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "干涉",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "intervene": {
      "display": "intervene",
      "prepositions": {
        "in": [
          "The police had to intervene in the fight. 警察不得不介入这场斗殴。",
          "The central bank intervened in the currency market. 央行干预了外汇市场。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.65,
      "senses": {
        "in": [
          {
            "zh": "干预",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "introduce": {
      "display": "introduce",
      "prepositions": {
        "to": [
          "Let me introduce you to my wife. 让我把你介绍给我妻子。",
          "My uncle introduced me to classical music. 我叔叔引导我接触了古典音乐。"
        ],
        "into": [
          "The company introduced a new system into its factories. 公司在工厂里引入了新系统。"
        ]
      },
      "prepositionOrder": [
        "to",
        "into"
      ],
      "zipf": 4.37,
      "senses": {
        "to": [
          {
            "zh": "把……介绍给；使初次接触",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "引入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "invest": {
      "display": "invest",
      "prepositions": {
        "in": [
          "She invested all her savings in the company. 她把全部积蓄都投进了这家公司。",
          "Schools should invest in good teachers. 学校应该在优秀教师上投入。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 4.32,
      "senses": {
        "in": [
          {
            "zh": "投资于；在……上投入",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "invite": {
      "display": "invite",
      "prepositions": {
        "to": [
          "They invited us to their wedding. 他们邀请我们参加婚礼。"
        ],
        "over": [
          "Why don't we invite the neighbors over? 我们为什么不请邻居来家里坐坐呢？"
        ],
        "out": [
          "He invited her out for dinner. 他约她出去吃饭。"
        ]
      },
      "prepositionOrder": [
        "to",
        "over",
        "out"
      ],
      "zipf": 4.3,
      "senses": {
        "to": [
          {
            "zh": "邀请参加",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "邀请到家中",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "邀请外出",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "involve": {
      "display": "involve",
      "prepositions": {
        "in": [
          "Try to involve everyone in the discussion. 尽量让每个人都参与讨论。",
          "He was involved in a car accident. 他卷入了一起车祸。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 4.28,
      "senses": {
        "in": [
          {
            "zh": "使参与；牵涉",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "iron": {
      "display": "iron",
      "prepositions": {
        "out": [
          "We need to iron out a few problems first. 我们需要先解决几个问题。",
          "The two sides ironed out their differences. 双方消除了分歧。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.74,
      "senses": {
        "out": [
          {
            "zh": "解决（问题、分歧）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "jack": {
      "display": "jack",
      "prepositions": {
        "up": [
          "Hotels jack up their prices in summer. 酒店在夏季大幅涨价。",
          "He jacked up the car to change the tire. 他用千斤顶把车顶起来换轮胎。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.82,
      "senses": {
        "up": [
          {
            "zh": "抬高（价格）；用千斤顶顶起",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "jazz": {
      "display": "jazz",
      "prepositions": {
        "up": [
          "A bright scarf will jazz up that plain dress. 一条鲜艳的围巾会让那件朴素的裙子更出彩。",
          "They jazzed up the old cafe with new lights. 他们用新灯饰把老咖啡馆装扮得更时髦。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.31,
      "senses": {
        "up": [
          {
            "zh": "使更有趣；装饰",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "join": {
      "display": "join",
      "prepositions": {
        "in": [
          "Everyone joined in the singing. 大家都跟着一起唱。",
          "Can I join in the game? 我能一起玩吗？"
        ],
        "up": [
          "He joined up when he was eighteen. 他十八岁时参了军。",
          "The two groups joined up to fight the plan. 两个团体联合起来反对这项计划。"
        ]
      },
      "prepositionOrder": [
        "in",
        "up"
      ],
      "zipf": 5.0,
      "senses": {
        "in": [
          {
            "zh": "参加（活动）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "参军；联合",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "joke": {
      "display": "joke",
      "prepositions": {
        "about": [
          "You shouldn't joke about such serious matters. 你不该拿这么严肃的事开玩笑。",
          "They joked about the terrible food. 他们拿那糟糕的饭菜开玩笑。"
        ],
        "with": [
          "The teacher often jokes with her students. 这位老师常和学生们开玩笑。",
          "He was joking with the waiter. 他在和服务员开玩笑。"
        ]
      },
      "prepositionOrder": [
        "about",
        "with"
      ],
      "zipf": 4.68,
      "senses": {
        "about": [
          {
            "zh": "拿……开玩笑",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……开玩笑",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "jot": {
      "display": "jot",
      "prepositions": {
        "down": [
          "Let me jot down your phone number. 我把你的电话号码记一下。",
          "She jotted down a few ideas during the lecture. 讲座中她随手记下了几个想法。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 2.86,
      "senses": {
        "down": [
          {
            "zh": "草草记下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "judge": {
      "display": "judge",
      "prepositions": {
        "by": [
          "You can't judge people by their clothes. 你不能凭衣着来评判一个人。",
          "Judging by his accent, he is from the south. 从口音判断，他是南方人。"
        ],
        "from": [
          "Judging from the clouds, it will rain soon. 从云层来看，很快就要下雨了。",
          "It is hard to judge from a single photo. 仅凭一张照片很难判断。"
        ]
      },
      "prepositionOrder": [
        "by",
        "from"
      ],
      "zipf": 4.95,
      "senses": {
        "by": [
          {
            "zh": "根据……判断",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "从……来判断",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "jump": {
      "display": "jump",
      "prepositions": {
        "at": [
          "She jumped at the chance to study abroad. 她抓住了出国留学的机会。",
          "Most people would jump at such an offer. 大多数人都会欣然接受这样的提议。"
        ],
        "to": [
          "Don't jump to conclusions. 不要急于下结论。",
          "He jumped to the wrong conclusion. 他草率地得出了错误的结论。"
        ],
        "on": [
          "The critics jumped on his every mistake. 批评者抓住他的每一个错误不放。",
          "My boss jumps on me whenever I am late. 我一迟到，老板就训我。"
        ],
        "in": [
          "Feel free to jump in with questions. 有问题尽管随时插话提问。",
          "She jumped in to help without being asked. 没人请她，她就主动上前帮忙。"
        ]
      },
      "prepositionOrder": [
        "at",
        "to",
        "on",
        "in"
      ],
      "zipf": 4.69,
      "senses": {
        "at": [
          {
            "zh": "欣然抓住（机会）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "匆忙得出（结论）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "猛烈抨击；抓住（错误）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "插话；主动参与",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "keep": {
      "display": "keep",
      "prepositions": {
        "up": [
          "Keep up the good work! 继续保持，干得好！",
          "It is hard to keep up a conversation in a second language. 用第二语言维持对话很难。"
        ],
        "up with": [
          "I can't keep up with you, slow down! 我跟不上你，慢一点！",
          "She reads the news to keep up with world events. 她看新闻以了解国际大事。",
          "Wages have not kept up with prices. 工资的增长没有跟上物价。"
        ],
        "on": [
          "He kept on talking during the film. 看电影时他一直说个不停。",
          "Keep on trying and you will succeed. 坚持尝试，你终会成功。"
        ],
        "off": [
          "Please keep off the grass. 请勿践踏草坪。",
          "Try to keep off sugar for a month. 试着一个月不吃糖。"
        ],
        "away": [
          "Keep away from the edge of the cliff. 离悬崖边远一点。",
          "Garlic is said to keep mosquitoes away. 据说大蒜能驱赶蚊子。"
        ],
        "out": [
          "A strong fence keeps out wild animals. 结实的篱笆能把野兽挡在外面。",
          "The sign on the door said keep out. 门上的牌子写着禁止入内。"
        ],
        "back": [
          "I think he is keeping something back. 我觉得他有所隐瞒。",
          "Police kept the crowd back from the fire. 警察让人群远离火场。"
        ],
        "from": [
          "Nothing could keep her from finishing the race. 什么都无法阻止她跑完比赛。",
          "He kept the bad news from his mother. 他没把坏消息告诉他母亲。"
        ],
        "to": [
          "Let's keep to the plan. 我们还是按计划来吧。",
          "Please keep to the path in the forest. 在森林里请沿着小路走。"
        ],
        "down": [
          "Please keep your voice down in the library. 在图书馆里请压低声音。",
          "We need to keep costs down this year. 我们今年需要控制成本。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up with",
        "on",
        "off",
        "away",
        "out",
        "back",
        "from",
        "to",
        "down"
      ],
      "zipf": 5.66,
      "senses": {
        "up": [
          {
            "zh": "保持；维持",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up with": [
          {
            "zh": "跟上；了解（最新情况）",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "on": [
          {
            "zh": "继续；不停地",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "远离；不踏上",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "使远离",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "使不进入",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "保留；隐瞒；阻止前进",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "阻止；使免于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "遵守；坚持",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "压低；控制",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "key": {
      "display": "key",
      "prepositions": {
        "in": [
          "Key in your password and press enter. 输入密码然后按回车键。",
          "She keyed in the customer's details. 她输入了客户的详细信息。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 5.12,
      "senses": {
        "in": [
          {
            "zh": "输入（数据）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "kick": {
      "display": "kick",
      "prepositions": {
        "off": [
          "The festival kicks off on Friday night. 节日活动将于周五晚上开幕。",
          "The match kicked off at three. 比赛三点开球。"
        ],
        "out": [
          "He was kicked out of school for fighting. 他因打架被学校开除了。",
          "The landlord kicked the noisy tenants out. 房东把吵闹的房客赶了出去。"
        ],
        "in": [
          "The painkillers should kick in soon. 止痛药应该很快就会见效。",
          "The new tax kicks in next year. 新税明年开始实施。"
        ],
        "back": [
          "On Sundays I just kick back and watch television. 周日我就放松一下看看电视。",
          "Let's kick back and enjoy the sunset. 我们放松一下，欣赏日落吧。"
        ]
      },
      "prepositionOrder": [
        "off",
        "out",
        "in",
        "back"
      ],
      "zipf": 4.72,
      "senses": {
        "off": [
          {
            "zh": "开始；（足球）开球",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "赶出；开除",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "开始生效",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "放松",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "kid": {
      "display": "kid",
      "prepositions": {
        "around": [
          "Stop kidding around and help me. 别闹了，过来帮我。",
          "The boys were just kidding around. 男孩们只是闹着玩。"
        ]
      },
      "prepositionOrder": [
        "around"
      ],
      "zipf": 4.99,
      "senses": {
        "around": [
          {
            "zh": "开玩笑；闹着玩",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "kill": {
      "display": "kill",
      "prepositions": {
        "off": [
          "The cold winter killed off many plants. 寒冷的冬天冻死了许多植物。",
          "The writer killed off the hero in the last book. 作者在最后一本书里让主人公死去了。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 5.09,
      "senses": {
        "off": [
          {
            "zh": "消灭；使灭绝",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "kneel": {
      "display": "kneel",
      "prepositions": {
        "down": [
          "She knelt down to pray. 她跪下祈祷。",
          "He kneeled down to look under the bed. 他跪下来往床底下看。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 3.24,
      "senses": {
        "down": [
          {
            "zh": "跪下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "knock": {
      "display": "knock",
      "prepositions": {
        "down": [
          "He was knocked down by a bus. 他被一辆公共汽车撞倒了。",
          "They plan to knock down the old school. 他们计划拆除那所旧学校。",
          "I knocked the price down by fifty dollars. 我把价格砍掉了五十美元。"
        ],
        "out": [
          "The boxer knocked out his opponent in the first round. 拳击手在第一回合就击倒了对手。",
          "Our team was knocked out in the semifinal. 我们队在半决赛中被淘汰了。"
        ],
        "over": [
          "The cat knocked over a glass of milk. 猫打翻了一杯牛奶。",
          "Be careful not to knock the lamp over. 小心别把台灯碰倒。"
        ],
        "off": [
          "We usually knock off at five on Fridays. 周五我们通常五点下班。",
          "The shop knocked ten percent off the price. 商店把价格降了百分之十。"
        ],
        "into": [
          "I knocked into the table and spilled my coffee. 我撞到了桌子，把咖啡洒了。",
          "He knocked into an old lady on the stairs. 他在楼梯上撞到了一位老太太。"
        ]
      },
      "prepositionOrder": [
        "down",
        "out",
        "over",
        "off",
        "into"
      ],
      "zipf": 4.35,
      "senses": {
        "down": [
          {
            "zh": "撞倒；拆除；（价格）压低",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "out": [
          {
            "zh": "击昏；淘汰",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "碰倒",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "下班；（从价格中）减去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "撞到；碰撞",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "know": {
      "display": "know",
      "prepositions": {
        "about": [
          "Do you know about the new rules? 你知道新规定吗？",
          "She knows a lot about ancient history. 她对古代历史了解很多。"
        ],
        "of": [
          "I know of a good restaurant nearby. 我知道附近有家不错的餐馆。",
          "Not that I know of. 据我所知没有。"
        ]
      },
      "prepositionOrder": [
        "about",
        "of"
      ],
      "zipf": 6.1,
      "senses": {
        "about": [
          {
            "zh": "知道；了解（某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "of": [
          {
            "zh": "听说过；知道（有）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "label": {
      "display": "label",
      "prepositions": {
        "as": [
          "He was unfairly labeled as a troublemaker. 他被不公平地贴上了捣乱分子的标签。"
        ]
      },
      "prepositionOrder": [
        "as"
      ],
      "zipf": 4.43,
      "senses": {
        "as": [
          {
            "zh": "把……称为；给……贴上标签",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lag": {
      "display": "lag",
      "prepositions": {
        "behind": [
          "Our town lags behind in internet speed. 我们镇的网速落后。",
          "He lagged behind the other runners. 他落在其他跑步者后面。"
        ]
      },
      "prepositionOrder": [
        "behind"
      ],
      "zipf": 3.67,
      "senses": {
        "behind": [
          {
            "zh": "落后",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "land": {
      "display": "land",
      "prepositions": {
        "in": [
          "His temper landed him in trouble again. 他的坏脾气又让他惹上了麻烦。"
        ],
        "on": [
          "The bird landed on the roof. 鸟落在了屋顶上。"
        ]
      },
      "prepositionOrder": [
        "in",
        "on"
      ],
      "zipf": 5.22,
      "senses": {
        "in": [
          {
            "zh": "使陷入（困境）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "落在……上",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lapse": {
      "display": "lapse",
      "prepositions": {
        "into": [
          "The patient lapsed into a coma. 病人陷入了昏迷。",
          "He sometimes lapses into his native dialect. 他有时会不自觉地说起家乡方言。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 3.49,
      "senses": {
        "into": [
          {
            "zh": "陷入；回到（某状态）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "lash": {
      "display": "lash",
      "prepositions": {
        "out at": [
          "She lashed out at the reporters. 她猛烈抨击了记者。"
        ]
      },
      "prepositionOrder": [
        "out at"
      ],
      "zipf": 3.38,
      "senses": {
        "out at": [
          {
            "zh": "猛烈抨击；突然攻击",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "latch": {
      "display": "latch",
      "prepositions": {
        "on to": [
          "The media quickly latched on to the story. 媒体很快抓住了这个新闻。"
        ]
      },
      "prepositionOrder": [
        "on to"
      ],
      "zipf": 3.34,
      "senses": {
        "on to": [
          {
            "zh": "抓住；理解",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "laugh": {
      "display": "laugh",
      "prepositions": {
        "at": [
          "Don't laugh at other people's mistakes. 别嘲笑别人的错误。",
          "Everyone laughed at his joke. 大家都被他的笑话逗笑了。"
        ],
        "off": [
          "He laughed off the rumors about his health. 他对有关自己健康的传言一笑置之。"
        ],
        "about": [
          "We still laugh about that trip. 我们现在提起那次旅行还会笑。"
        ]
      },
      "prepositionOrder": [
        "at",
        "off",
        "about"
      ],
      "zipf": 4.66,
      "senses": {
        "at": [
          {
            "zh": "嘲笑；因……而笑",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "一笑置之",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "about": [
          {
            "zh": "就……发笑",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "launch": {
      "display": "launch",
      "prepositions": {
        "into": [
          "He launched into a long speech about politics. 他开始长篇大论地谈起政治。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 4.69,
      "senses": {
        "into": [
          {
            "zh": "开始（长篇讲话、活动）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lay": {
      "display": "lay",
      "prepositions": {
        "off": [
          "The factory laid off two hundred workers. 工厂解雇了两百名工人。",
          "Many staff were laid off during the crisis. 危机期间许多员工被裁员。"
        ],
        "out": [
          "The report lays out a clear plan for reform. 这份报告清楚阐述了改革计划。",
          "She laid out the plates on the table. 她把盘子摆在桌子上。"
        ],
        "down": [
          "The soldiers laid down their weapons. 士兵们放下了武器。",
          "The law lays down strict rules for drivers. 法律为司机制定了严格的规定。"
        ],
        "aside": [
          "Try to lay aside some money each month. 尽量每月存点钱。"
        ]
      },
      "prepositionOrder": [
        "off",
        "out",
        "down",
        "aside"
      ],
      "zipf": 4.64,
      "senses": {
        "off": [
          {
            "zh": "解雇",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "布置；陈列；阐明",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "放下；制定（规则）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "aside": [
          {
            "zh": "留出；搁置",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lead": {
      "display": "lead",
      "prepositions": {
        "to": [
          "Too much stress can lead to illness. 压力过大会导致疾病。",
          "This path leads to the river. 这条小路通向河边。"
        ],
        "up to": [
          "In the weeks leading up to the election, tension grew. 选举前的几周里，气氛越来越紧张。"
        ],
        "on": [
          "She was just leading him on. 她只是在玩弄他的感情。"
        ]
      },
      "prepositionOrder": [
        "to",
        "up to",
        "on"
      ],
      "zipf": 5.2,
      "senses": {
        "to": [
          {
            "zh": "导致；通向",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up to": [
          {
            "zh": "在……之前的阶段；为……做铺垫",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "误导；欺骗感情",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "leaf": {
      "display": "leaf",
      "prepositions": {
        "through": [
          "She leafed through a magazine while waiting. 她边等边翻阅杂志。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 4.22,
      "senses": {
        "through": [
          {
            "zh": "翻阅",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "leak": {
      "display": "leak",
      "prepositions": {
        "out": [
          "News of the merger leaked out early. 合并的消息提前泄露了。"
        ],
        "to": [
          "Someone leaked the report to the press. 有人向媒体泄露了这份报告。"
        ]
      },
      "prepositionOrder": [
        "out",
        "to"
      ],
      "zipf": 4.09,
      "senses": {
        "out": [
          {
            "zh": "泄露",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "向……泄露",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lean": {
      "display": "lean",
      "prepositions": {
        "on": [
          "You can always lean on your friends. 你随时可以依靠你的朋友。",
          "They leaned on him to sign the deal. 他们逼他签了协议。"
        ],
        "against": [
          "He leaned against the wall and waited. 他靠在墙上等着。"
        ],
        "towards": [
          "I am leaning towards the cheaper option. 我倾向于选择便宜的那个。"
        ],
        "over": [
          "She leaned over to whisper something. 她俯过身来低声说了些什么。"
        ]
      },
      "prepositionOrder": [
        "on",
        "against",
        "towards",
        "over"
      ],
      "zipf": 4.14,
      "senses": {
        "on": [
          {
            "zh": "依靠；向……施压",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "靠在……上",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "towards": [
          {
            "zh": "倾向于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "俯身",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "learn": {
      "display": "learn",
      "prepositions": {
        "from": [
          "We should learn from our mistakes. 我们应该从错误中吸取教训。",
          "She learned a lot from her grandmother. 她从奶奶那里学到了很多。"
        ],
        "about": [
          "Children learn about nature at the farm. 孩子们在农场了解大自然。",
          "I only learned about the change this morning. 我今天早上才得知这个变动。"
        ],
        "of": [
          "We learned of his death from the newspaper. 我们从报纸上得知了他的死讯。"
        ]
      },
      "prepositionOrder": [
        "from",
        "about",
        "of"
      ],
      "zipf": 5.17,
      "senses": {
        "from": [
          {
            "zh": "从……中学习",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "了解；得知",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "of": [
          {
            "zh": "得知",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "leave": {
      "display": "leave",
      "prepositions": {
        "for": [
          "We leave for Paris tomorrow morning. 我们明天早上动身去巴黎。",
          "He left for work without breakfast. 他没吃早饭就去上班了。"
        ],
        "out": [
          "You left out an important detail. 你漏掉了一个重要细节。",
          "She felt left out when nobody invited her. 没人邀请她，她觉得被冷落了。"
        ],
        "behind": [
          "I left my umbrella behind in the taxi. 我把雨伞落在出租车上了。",
          "Some students were left behind by the fast pace. 有些学生跟不上快节奏而掉队了。"
        ],
        "to": [
          "Leave the cooking to me. 做饭的事交给我吧。",
          "She left her house to her niece. 她把房子留给了侄女。"
        ],
        "off": [
          "Let's start where we left off yesterday. 我们从昨天停下的地方开始。"
        ]
      },
      "prepositionOrder": [
        "for",
        "out",
        "behind",
        "to",
        "off"
      ],
      "zipf": 5.34,
      "senses": {
        "for": [
          {
            "zh": "动身去（某地）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "遗漏；排除",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "behind": [
          {
            "zh": "留下；落下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "交给；留给",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "停止；中断",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lecture": {
      "display": "lecture",
      "prepositions": {
        "on": [
          "She lectures on modern history at the university. 她在大学讲授现代史。"
        ],
        "about": [
          "My mother lectured me about staying out late. 我妈妈就我晚归的事训了我一顿。"
        ]
      },
      "prepositionOrder": [
        "on",
        "about"
      ],
      "zipf": 4.14,
      "senses": {
        "on": [
          {
            "zh": "讲授；讲课",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "about": [
          {
            "zh": "就……训诫",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lend": {
      "display": "lend",
      "prepositions": {
        "to": [
          "Could you lend your notes to me? 你能把笔记借给我吗？",
          "The bank refused to lend money to the firm. 银行拒绝向这家公司贷款。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.92,
      "senses": {
        "to": [
          {
            "zh": "借给",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "let": {
      "display": "let",
      "prepositions": {
        "down": [
          "I promised to help, and I won't let you down. 我答应过帮忙，我不会让你失望的。",
          "The team felt let down by their coach. 队员们觉得教练让他们失望了。"
        ],
        "in": [
          "Open the window and let some fresh air in. 打开窗户让新鲜空气进来。",
          "The guard refused to let us in. 门卫不让我们进去。"
        ],
        "in on": [
          "Are you going to let me in on the secret? 你打算告诉我这个秘密吗？"
        ],
        "off": [
          "The officer let him off with a warning. 警官警告了他一下就放他走了。",
          "The teacher let us off homework today. 老师今天免了我们的作业。"
        ],
        "out": [
          "Who let the dog out? 谁把狗放出去了？",
          "She let out a cry of surprise. 她发出一声惊叫。"
        ],
        "on": [
          "Don't let on that you know about the party. 别透露你知道聚会的事。"
        ],
        "up": [
          "The rain finally let up in the afternoon. 下午雨终于小了。"
        ]
      },
      "prepositionOrder": [
        "down",
        "in",
        "in on",
        "off",
        "out",
        "on",
        "up"
      ],
      "zipf": 5.6,
      "senses": {
        "down": [
          {
            "zh": "使失望",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "让……进来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in on": [
          {
            "zh": "让……知道（秘密）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "放过；免于惩罚",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "放出；发出（声音）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "泄露（秘密）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "（雨、压力等）减弱",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "level": {
      "display": "level",
      "prepositions": {
        "with": [
          "Just level with me, what really happened? 跟我说实话吧，到底发生了什么？"
        ],
        "off": [
          "Prices have started to level off. 价格已开始趋于平稳。"
        ]
      },
      "prepositionOrder": [
        "with",
        "off"
      ],
      "zipf": 5.41,
      "senses": {
        "with": [
          {
            "zh": "对……坦诚相告",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "趋于平稳",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "liaise": {
      "display": "liaise",
      "prepositions": {
        "with": [
          "Our team liaises with the local police. 我们团队与当地警方保持联络。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 2.51,
      "senses": {
        "with": [
          {
            "zh": "与……联络",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lie": {
      "display": "lie",
      "prepositions": {
        "down": [
          "I feel dizzy, I need to lie down. 我头晕，需要躺一下。",
          "The doctor asked him to lie down on the bed. 医生让他躺到床上。"
        ],
        "about": [
          "He lied about his age to get the job. 他为了得到这份工作谎报了年龄。"
        ],
        "to": [
          "Never lie to your doctor. 永远不要对医生撒谎。"
        ],
        "in": [
          "The problem lies in the design. 问题在于设计。",
          "Her strength lies in her patience. 她的长处在于有耐心。",
          "On Sundays I like to lie in until ten. 星期天我喜欢睡懒觉到十点。"
        ],
        "ahead": [
          "Nobody knows what lies ahead. 没人知道未来会怎样。"
        ]
      },
      "prepositionOrder": [
        "down",
        "about",
        "to",
        "in",
        "ahead"
      ],
      "zipf": 4.84,
      "senses": {
        "down": [
          {
            "zh": "躺下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "就……撒谎",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "对……撒谎",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "在于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "睡懒觉",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "ahead": [
          {
            "zh": "在前方；即将来临",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lift": {
      "display": "lift",
      "prepositions": {
        "off": [
          "The rocket lifted off at dawn. 火箭在黎明时分发射升空。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 4.5,
      "senses": {
        "off": [
          {
            "zh": "（火箭）发射升空",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "light": {
      "display": "light",
      "prepositions": {
        "up": [
          "Fireworks lit up the night sky. 烟花照亮了夜空。",
          "Her face lit up when she saw the gift. 看到礼物时她脸上露出了喜色。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 5.33,
      "senses": {
        "up": [
          {
            "zh": "照亮；（脸）发亮",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "limit": {
      "display": "limit",
      "prepositions": {
        "to": [
          "Please limit your answer to one page. 请把答案限制在一页之内。",
          "Entry is limited to members only. 仅限会员入内。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.7,
      "senses": {
        "to": [
          {
            "zh": "限制在",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "line": {
      "display": "line",
      "prepositions": {
        "up": [
          "People lined up outside the cinema. 人们在电影院外排队。",
          "We have lined up some great speakers. 我们已经安排了几位出色的演讲者。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 5.49,
      "senses": {
        "up": [
          {
            "zh": "排队；安排",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "linger": {
      "display": "linger",
      "prepositions": {
        "on": [
          "The smell of smoke lingered on for days. 烟味持续了好几天。"
        ],
        "over": [
          "We lingered over coffee after dinner. 晚饭后我们慢慢地喝着咖啡。"
        ]
      },
      "prepositionOrder": [
        "on",
        "over"
      ],
      "zipf": 3.31,
      "senses": {
        "on": [
          {
            "zh": "持续；逗留",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "在……上磨蹭",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "link": {
      "display": "link",
      "prepositions": {
        "to": [
          "Smoking is linked to many diseases. 吸烟与多种疾病有关。"
        ],
        "with": [
          "The new road links the town with the coast. 新公路把小镇和海岸连接起来。"
        ]
      },
      "prepositionOrder": [
        "to",
        "with"
      ],
      "zipf": 4.99,
      "senses": {
        "to": [
          {
            "zh": "与……有关联",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "把……与……联系起来",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "listen": {
      "display": "listen",
      "prepositions": {
        "to": [
          "I love listening to music while I cook. 我喜欢边做饭边听音乐。",
          "You never listen to my advice. 你从不听我的建议。"
        ],
        "for": [
          "She listened for the sound of his car. 她留心听着他的车声。"
        ],
        "in": [
          "Millions listened in to the final match on the radio. 数百万人通过收音机收听了决赛。"
        ],
        "out for": [
          "Listen out for your name at the gate. 在登机口留意广播里叫你的名字。"
        ]
      },
      "prepositionOrder": [
        "to",
        "for",
        "in",
        "out for"
      ],
      "zipf": 5.06,
      "senses": {
        "to": [
          {
            "zh": "听",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "留心听",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "收听；偷听",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out for": [
          {
            "zh": "留心听",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "live": {
      "display": "live",
      "prepositions": {
        "on": [
          "He lives on a small pension. 他靠一点养老金生活。",
          "Pandas live mainly on bamboo. 熊猫主要以竹子为食。"
        ],
        "with": [
          "She still lives with her parents. 她还和父母住在一起。",
          "You will have to learn to live with the noise. 你得学会忍受这些噪音。"
        ],
        "up to": [
          "The film didn't live up to my expectations. 这部电影没有达到我的期望。",
          "He worked hard to live up to his father's name. 他努力工作以不辜负父亲的名声。"
        ],
        "through": [
          "My grandparents lived through the war. 我的祖父母经历过那场战争。"
        ],
        "off": [
          "He is thirty and still lives off his parents. 他三十岁了还靠父母养活。"
        ],
        "for": [
          "She lives for her music. 她为音乐而活。"
        ]
      },
      "prepositionOrder": [
        "on",
        "with",
        "up to",
        "through",
        "off",
        "for"
      ],
      "zipf": 5.54,
      "senses": {
        "on": [
          {
            "zh": "靠……生活；以……为食",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……同住；忍受",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up to": [
          {
            "zh": "达到（期望）；不辜负",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "经历过（困难时期）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "依靠……生活",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "为……而活",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "load": {
      "display": "load",
      "prepositions": {
        "with": [
          "They loaded the van with furniture. 他们往货车里装满了家具。"
        ],
        "up": [
          "We loaded up the car and drove off. 我们把车装满东西就出发了。"
        ]
      },
      "prepositionOrder": [
        "with",
        "up"
      ],
      "zipf": 4.58,
      "senses": {
        "with": [
          {
            "zh": "用……装满",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "装满",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lock": {
      "display": "lock",
      "prepositions": {
        "up": [
          "Don't forget to lock up before you leave. 离开前别忘了锁好门。",
          "He should be locked up for what he did. 他干了那种事应该被关起来。"
        ],
        "out": [
          "I locked myself out of the house again. 我又把自己锁在门外了。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out"
      ],
      "zipf": 4.51,
      "senses": {
        "up": [
          {
            "zh": "锁好门窗；把……关起来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "把……锁在门外",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "log": {
      "display": "log",
      "prepositions": {
        "in": [
          "You need a password to log in. 你需要密码才能登录。"
        ],
        "out": [
          "Always log out on shared computers. 在公用电脑上一定要退出登录。"
        ]
      },
      "prepositionOrder": [
        "in",
        "out"
      ],
      "zipf": 4.37,
      "senses": {
        "in": [
          {
            "zh": "登录",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "退出登录",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "long": {
      "display": "long",
      "prepositions": {
        "for": [
          "After a long winter, we longed for sunshine. 漫长的冬季过后，我们渴望阳光。",
          "She longs for a quiet life in the country. 她渴望在乡下过宁静的生活。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 5.81,
      "senses": {
        "for": [
          {
            "zh": "渴望",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "look": {
      "display": "look",
      "prepositions": {
        "at": [
          "Look at the sky, it is going to rain. 看天空，要下雨了。",
          "The committee will look at your proposal next week. 委员会下周会审议你的提案。"
        ],
        "for": [
          "I am looking for my car keys. 我在找我的车钥匙。",
          "Many graduates are looking for their first job. 许多毕业生正在找第一份工作。"
        ],
        "after": [
          "Who looks after the kids when you are at work? 你上班时谁照看孩子？",
          "You should look after your health. 你应该照顾好自己的身体。"
        ],
        "into": [
          "The police are looking into the cause of the fire. 警方正在调查火灾的起因。",
          "I will look into the matter and call you back. 我会调查一下这件事再给你回电话。"
        ],
        "forward to": [
          "I am looking forward to seeing you again. 我盼望着再见到你。",
          "The children look forward to the summer holidays. 孩子们盼着放暑假。"
        ],
        "up": [
          "Look the word up in a dictionary. 在词典里查一下这个词。",
          "She looked up the train times online. 她在网上查了火车时刻。",
          "Things are finally looking up for our business. 我们的生意终于开始好转了。"
        ],
        "up to": [
          "Many young players look up to him. 许多年轻球员都很敬仰他。"
        ],
        "down on": [
          "She looks down on people who never read. 她看不起从不读书的人。",
          "Don't look down on anyone because of their job. 不要因为别人的职业而看不起他们。"
        ],
        "out": [
          "Look out! There is a car coming. 当心！有车来了。"
        ],
        "out for": [
          "Look out for pickpockets in the market. 在市场里要提防扒手。",
          "Older kids should look out for the younger ones. 大孩子应该照顾小孩子。"
        ],
        "back on": [
          "When I look back on my school days, I feel happy. 回想起学生时代，我感到很快乐。"
        ],
        "through": [
          "She looked through the files for the missing report. 她翻阅文件寻找那份丢失的报告。"
        ],
        "over": [
          "Could you look over my essay before I hand it in? 我交论文之前你能帮我看一下吗？"
        ],
        "around": [
          "We looked around the old town all afternoon. 我们整个下午都在老城区四处参观。"
        ],
        "like": [
          "It looks like it is going to snow. 看起来要下雪了。",
          "He looks like his father. 他长得像他父亲。"
        ],
        "on": [
          "A crowd looked on as the firemen fought the blaze. 消防员灭火时一群人在旁观。",
          "I look on her as my own sister. 我把她当作亲妹妹看待。"
        ],
        "to": [
          "Many people look to the government for help. 许多人指望政府提供帮助。"
        ]
      },
      "prepositionOrder": [
        "at",
        "for",
        "after",
        "into",
        "forward to",
        "up",
        "up to",
        "down on",
        "out",
        "out for",
        "back on",
        "through",
        "over",
        "around",
        "like",
        "on",
        "to"
      ],
      "zipf": 5.81,
      "senses": {
        "at": [
          {
            "zh": "看；审视",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "寻找",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "after": [
          {
            "zh": "照顾",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "调查；研究",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "forward to": [
          {
            "zh": "盼望",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "查找（资料）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "好转",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "up to": [
          {
            "zh": "尊敬；仰慕",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down on": [
          {
            "zh": "看不起",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "小心；当心",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out for": [
          {
            "zh": "留意；照顾",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back on": [
          {
            "zh": "回顾",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "through": [
          {
            "zh": "浏览；翻阅",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "快速检查",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "around": [
          {
            "zh": "四处看看",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "like": [
          {
            "zh": "看起来像",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "旁观",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "把……看作",
            "kind": "preposition",
            "examples": [
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "指望；依赖",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "loom": {
      "display": "loom",
      "prepositions": {
        "over": [
          "The threat of war loomed over the region. 战争的威胁笼罩着这个地区。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 3.34,
      "senses": {
        "over": [
          {
            "zh": "笼罩",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "lose": {
      "display": "lose",
      "prepositions": {
        "out": [
          "Small farmers lose out under the new rules. 新规定下小农户吃亏。"
        ],
        "out to": [
          "Local shops are losing out to online stores. 本地商店正在输给网店。"
        ]
      },
      "prepositionOrder": [
        "out",
        "out to"
      ],
      "zipf": 5.08,
      "senses": {
        "out": [
          {
            "zh": "吃亏；错失",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out to": [
          {
            "zh": "输给",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "major": {
      "display": "major",
      "prepositions": {
        "in": [
          "She majored in economics at college. 她大学主修经济学。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 5.3,
      "senses": {
        "in": [
          {
            "zh": "主修",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "make": {
      "display": "make",
      "prepositions": {
        "up": [
          "He made up an excuse for being late. 他编了一个迟到的借口。",
          "I think she made the whole story up. 我觉得整个故事都是她编的。",
          "They argued in the morning but made up by lunch. 他们早上吵了架，到午饭时就和好了。",
          "She spent an hour making herself up before the party. 她派对前花了一个小时化妆。",
          "Women make up half of the workforce. 女性占劳动力的一半。",
          "The class is made up of twenty students. 这个班由二十名学生组成。"
        ],
        "up for": [
          "He bought her flowers to make up for his mistake. 他给她买花来弥补自己的过错。",
          "Nothing can make up for lost time. 失去的时间无法弥补。"
        ],
        "up with": [
          "Have you made up with your sister yet? 你和你姐姐和好了吗？"
        ],
        "out": [
          "I couldn't make out what he was saying. 我听不清他在说什么。",
          "In the fog we could just make out the shore. 在雾中我们勉强能看清海岸。",
          "He made out that he was very busy. 他装出一副很忙的样子。"
        ],
        "for": [
          "The children made for the door as soon as the bell rang. 铃一响孩子们就朝门口奔去。"
        ],
        "off with": [
          "The thieves made off with her jewelry. 窃贼偷走了她的首饰。"
        ],
        "into": [
          "They made the old barn into a lovely home. 他们把旧谷仓改造成了漂亮的住宅。"
        ],
        "of": [
          "The table is made of solid oak. 这张桌子是实心橡木做的。",
          "What do you make of his new plan? 你怎么看他的新计划？"
        ],
        "from": [
          "Paper is made from wood pulp. 纸是用木浆制成的。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up for",
        "up with",
        "out",
        "for",
        "off with",
        "into",
        "of",
        "from"
      ],
      "zipf": 6.08,
      "senses": {
        "up": [
          {
            "zh": "编造",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "和好",
            "kind": "particle",
            "examples": [
              2
            ]
          },
          {
            "zh": "化妆",
            "kind": "particle",
            "examples": [
              3
            ]
          },
          {
            "zh": "构成；组成",
            "kind": "particle",
            "examples": [
              4,
              5
            ]
          }
        ],
        "up for": [
          {
            "zh": "弥补",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up with": [
          {
            "zh": "与……和好",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "辨认出；理解",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "假装；声称",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "for": [
          {
            "zh": "朝……走去",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "off with": [
          {
            "zh": "偷走；携……逃跑",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "把……制成",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "of": [
          {
            "zh": "用……制成；理解",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "用……制成（原料变化）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "manage": {
      "display": "manage",
      "prepositions": {
        "without": [
          "I can't manage without my glasses. 没有眼镜我可不行。"
        ]
      },
      "prepositionOrder": [
        "without"
      ],
      "zipf": 4.54,
      "senses": {
        "without": [
          {
            "zh": "没有……也能应付",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "map": {
      "display": "map",
      "prepositions": {
        "out": [
          "She has mapped out her whole career. 她已详细规划好了自己的整个职业生涯。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.76,
      "senses": {
        "out": [
          {
            "zh": "详细规划",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "mark": {
      "display": "mark",
      "prepositions": {
        "down": [
          "All winter coats have been marked down. 所有冬季外套都降价了。"
        ],
        "out": [
          "They marked out the field with white paint. 他们用白漆画出了场地。"
        ],
        "up": [
          "Shops mark up prices before the holidays. 商店在节前提高价格。"
        ]
      },
      "prepositionOrder": [
        "down",
        "out",
        "up"
      ],
      "zipf": 5.05,
      "senses": {
        "down": [
          {
            "zh": "降价",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "标出",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "提价",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "marry": {
      "display": "marry",
      "prepositions": {
        "into": [
          "She married into a wealthy family. 她嫁入了一个富裕家庭。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 4.4,
      "senses": {
        "into": [
          {
            "zh": "通过婚姻成为……的成员",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "marvel": {
      "display": "marvel",
      "prepositions": {
        "at": [
          "We marveled at the beauty of the mountains. 我们惊叹于群山之美。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 4.16,
      "senses": {
        "at": [
          {
            "zh": "对……感到惊奇",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "match": {
      "display": "match",
      "prepositions": {
        "up": [
          "Their stories don't match up. 他们的说法对不上。"
        ],
        "with": [
          "The curtains match with the sofa. 窗帘和沙发很配。"
        ]
      },
      "prepositionOrder": [
        "up",
        "with"
      ],
      "zipf": 5.13,
      "senses": {
        "up": [
          {
            "zh": "相符",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "与……相配",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "matter": {
      "display": "matter",
      "prepositions": {
        "to": [
          "Your opinion really matters to me. 你的意见对我真的很重要。",
          "Money doesn't matter to him at all. 他根本不在乎钱。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 5.38,
      "senses": {
        "to": [
          {
            "zh": "对……重要",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "measure": {
      "display": "measure",
      "prepositions": {
        "up": [
          "The new manager didn't measure up. 新经理不称职。"
        ],
        "up to": [
          "Does the hotel measure up to its reviews? 这家酒店名副其实吗？"
        ]
      },
      "prepositionOrder": [
        "up",
        "up to"
      ],
      "zipf": 4.65,
      "senses": {
        "up": [
          {
            "zh": "达到标准；合格",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up to": [
          {
            "zh": "符合；达到（标准）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "meddle": {
      "display": "meddle",
      "prepositions": {
        "in": [
          "Stop meddling in my affairs. 别再干涉我的事。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 2.85,
      "senses": {
        "in": [
          {
            "zh": "干涉",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "meet": {
      "display": "meet",
      "prepositions": {
        "with": [
          "The president met with union leaders today. 总统今天与工会领导人会面。",
          "The plan met with strong opposition. 该计划遭到了强烈反对。"
        ],
        "up": [
          "Let's meet up after work. 我们下班后碰个面吧。"
        ],
        "up with": [
          "I met up with some old classmates in town. 我在城里和几个老同学聚了聚。"
        ]
      },
      "prepositionOrder": [
        "with",
        "up",
        "up with"
      ],
      "zipf": 5.27,
      "senses": {
        "with": [
          {
            "zh": "与……会面；遭遇",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "碰头；相聚",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up with": [
          {
            "zh": "与……碰头",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "melt": {
      "display": "melt",
      "prepositions": {
        "away": [
          "The crowd melted away when it began to rain. 下雨后人群逐渐散去。"
        ],
        "down": [
          "The old coins were melted down. 那些旧硬币被熔掉了。"
        ]
      },
      "prepositionOrder": [
        "away",
        "down"
      ],
      "zipf": 3.96,
      "senses": {
        "away": [
          {
            "zh": "渐渐消失",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "熔化",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "merge": {
      "display": "merge",
      "prepositions": {
        "with": [
          "The bank merged with a rival last year. 这家银行去年与一家竞争对手合并了。"
        ],
        "into": [
          "The two villages slowly merged into one town. 两个村庄逐渐合并成了一个小镇。"
        ]
      },
      "prepositionOrder": [
        "with",
        "into"
      ],
      "zipf": 3.75,
      "senses": {
        "with": [
          {
            "zh": "与……合并",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "融合成；并入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "mess": {
      "display": "mess",
      "prepositions": {
        "up": [
          "I really messed up the interview. 我面试彻底搞砸了。",
          "Don't mess up the kitchen. 别把厨房弄乱。"
        ],
        "with": [
          "Don't mess with my computer. 别乱动我的电脑。",
          "You don't want to mess with him. 你可别招惹他。"
        ],
        "around": [
          "Stop messing around and get to work. 别胡闹了，干活吧。"
        ]
      },
      "prepositionOrder": [
        "up",
        "with",
        "around"
      ],
      "zipf": 4.57,
      "senses": {
        "up": [
          {
            "zh": "弄乱；搞砸",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "招惹；乱动",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "around": [
          {
            "zh": "胡闹；瞎混",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "mingle": {
      "display": "mingle",
      "prepositions": {
        "with": [
          "The singer mingled with fans after the show. 演出结束后歌手和歌迷交流。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.21,
      "senses": {
        "with": [
          {
            "zh": "与……交往；混合",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "miss": {
      "display": "miss",
      "prepositions": {
        "out": [
          "Book now so you don't miss out. 现在就预订，以免错过。"
        ],
        "out on": [
          "He missed out on the promotion. 他错失了升职机会。",
          "Don't miss out on this great offer. 别错过这个超值优惠。"
        ]
      },
      "prepositionOrder": [
        "out",
        "out on"
      ],
      "zipf": 5.22,
      "senses": {
        "out": [
          {
            "zh": "错过（机会）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out on": [
          {
            "zh": "错过",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "mistake": {
      "display": "mistake",
      "prepositions": {
        "for": [
          "People often mistake him for his brother. 人们常把他误认为是他哥哥。",
          "I mistook the salt for sugar. 我错把盐当成了糖。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.67,
      "senses": {
        "for": [
          {
            "zh": "把……误认为",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "mix": {
      "display": "mix",
      "prepositions": {
        "up": [
          "I always mix up the twins. 我总是分不清那对双胞胎。",
          "Someone mixed up the files. 有人把文件弄混了。"
        ],
        "with": [
          "Oil does not mix with water. 油和水不相溶。",
          "He doesn't mix with the other kids. 他不跟其他孩子来往。"
        ],
        "up in": [
          "How did you get mixed up in this mess? 你怎么被卷入这场乱局的？"
        ]
      },
      "prepositionOrder": [
        "up",
        "with",
        "up in"
      ],
      "zipf": 4.71,
      "senses": {
        "up": [
          {
            "zh": "混淆；弄混",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……混合；与……交往",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up in": [
          {
            "zh": "卷入",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "moan": {
      "display": "moan",
      "prepositions": {
        "about": [
          "He is always moaning about the weather. 他总是抱怨天气。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 3.37,
      "senses": {
        "about": [
          {
            "zh": "抱怨",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "mop": {
      "display": "mop",
      "prepositions": {
        "up": [
          "She mopped up the spilled juice. 她把洒出来的果汁擦干净了。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.39,
      "senses": {
        "up": [
          {
            "zh": "擦干净；收拾残局",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "mount": {
      "display": "mount",
      "prepositions": {
        "up": [
          "The bills are mounting up. 账单越积越多。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.47,
      "senses": {
        "up": [
          {
            "zh": "逐渐增加",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "mourn": {
      "display": "mourn",
      "prepositions": {
        "for": [
          "The village mourned for the fishermen lost at sea. 全村人哀悼在海上遇难的渔民。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 3.43,
      "senses": {
        "for": [
          {
            "zh": "哀悼",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "move": {
      "display": "move",
      "prepositions": {
        "on": [
          "Let's move on to the next item on the agenda. 我们进入议程的下一项吧。",
          "It is time to move on and forget the past. 是时候向前看，忘掉过去了。"
        ],
        "in": [
          "Our new neighbors moved in last week. 我们的新邻居上周搬进来了。"
        ],
        "in with": [
          "She moved in with her boyfriend in March. 她三月搬去和男朋友同住了。"
        ],
        "out": [
          "He moved out of his parents' house at eighteen. 他十八岁时从父母家搬了出去。",
          "The tenants moved out without paying the rent. 租客没付房租就搬走了。"
        ],
        "away": [
          "My best friend moved away when I was ten. 我十岁时最好的朋友搬走了。"
        ],
        "up": [
          "She quickly moved up to a management position. 她很快晋升到管理职位。"
        ],
        "over": [
          "Could you move over a little so I can sit down? 你能挪一挪让我坐下吗？"
        ],
        "along": [
          "The police told the crowd to move along. 警察让人群往前走不要停留。"
        ],
        "to": [
          "They moved to Canada when she was a child. 她小时候他们搬到了加拿大。"
        ],
        "forward": [
          "The project is moving forward on schedule. 该项目正按计划推进。"
        ]
      },
      "prepositionOrder": [
        "on",
        "in",
        "in with",
        "out",
        "away",
        "up",
        "over",
        "along",
        "to",
        "forward"
      ],
      "zipf": 5.35,
      "senses": {
        "on": [
          {
            "zh": "继续前进；转向（新话题）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "搬进",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "in with": [
          {
            "zh": "搬去和……同住",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "搬出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "搬离；离开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "升职；上移",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "挪开；让位",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "along": [
          {
            "zh": "往前走",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "搬到；转向",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "forward": [
          {
            "zh": "推进；向前发展",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "muddle": {
      "display": "muddle",
      "prepositions": {
        "through": [
          "We had no plan, but we muddled through. 我们没有计划，但还是应付过去了。"
        ],
        "up": [
          "I always muddle up their names. 我总是把他们的名字弄混。"
        ]
      },
      "prepositionOrder": [
        "through",
        "up"
      ],
      "zipf": 2.79,
      "senses": {
        "through": [
          {
            "zh": "应付过去",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "弄混",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "mull": {
      "display": "mull",
      "prepositions": {
        "over": [
          "I need some time to mull it over. 我需要一些时间好好考虑一下。",
          "She mulled over the offer for days. 她把这个提议考虑了好几天。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 2.94,
      "senses": {
        "over": [
          {
            "zh": "仔细考虑",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "multiply": {
      "display": "multiply",
      "prepositions": {
        "by": [
          "Multiply the width by the length. 用宽度乘以长度。"
        ]
      },
      "prepositionOrder": [
        "by"
      ],
      "zipf": 3.5,
      "senses": {
        "by": [
          {
            "zh": "乘以",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "muse": {
      "display": "muse",
      "prepositions": {
        "on": [
          "He mused on the meaning of life. 他沉思着人生的意义。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.59,
      "senses": {
        "on": [
          {
            "zh": "沉思",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "nag": {
      "display": "nag",
      "prepositions": {
        "at": [
          "My mother keeps nagging at me to tidy my room. 我妈一直唠叨让我收拾房间。",
          "A doubt nagged at her all day. 一个疑虑困扰了她一整天。"
        ],
        "about": [
          "He's always nagging about my driving. 他总是对我开车的方式唠叨个不停。",
          "Stop nagging about the dishes, I'll do them later. 别再为洗碗唠叨了，我待会儿洗。"
        ]
      },
      "prepositionOrder": [
        "at",
        "about"
      ],
      "zipf": 3.18,
      "senses": {
        "at": [
          {
            "zh": "唠叨；困扰",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "为……唠叨",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "nail": {
      "display": "nail",
      "prepositions": {
        "down": [
          "We need to nail down the details of the contract. 我们需要敲定合同的细节。",
          "It's hard to nail him down to a date. 很难让他定下一个日期。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.21,
      "senses": {
        "down": [
          {
            "zh": "确定；敲定",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "narrow": {
      "display": "narrow",
      "prepositions": {
        "down": [
          "We narrowed down the list to three candidates. 我们把名单缩小到三个候选人。",
          "Can you narrow your search down a bit? 你能把搜索范围缩小一点吗？"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.39,
      "senses": {
        "down": [
          {
            "zh": "缩小（范围）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "negotiate": {
      "display": "negotiate",
      "prepositions": {
        "with": [
          "The union is negotiating with management. 工会正在与资方谈判。",
          "We negotiated with the landlord for a lower rent. 我们和房东协商降低房租。"
        ],
        "for": [
          "Workers are negotiating for better pay. 工人们正在争取更高的工资。",
          "The players are negotiating for a new contract. 球员们正在谈判争取一份新合同。"
        ]
      },
      "prepositionOrder": [
        "with",
        "for"
      ],
      "zipf": 3.99,
      "senses": {
        "with": [
          {
            "zh": "与……谈判",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "为……谈判",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "nibble": {
      "display": "nibble",
      "prepositions": {
        "at": [
          "The rabbit nibbled at a carrot. 兔子小口啃着胡萝卜。",
          "She just nibbled at her food because she wasn't hungry. 她不饿，只吃了几口。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 2.85,
      "senses": {
        "at": [
          {
            "zh": "小口咬；一点点吃",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "nod": {
      "display": "nod",
      "prepositions": {
        "off": [
          "Grandpa nodded off in front of the television. 爷爷在电视机前打起了瞌睡。",
          "I nearly nodded off during the lecture. 讲座时我差点睡着了。"
        ],
        "at": [
          "She nodded at me from across the room. 她在房间另一头向我点头示意。",
          "He nodded at the door, telling us to leave. 他朝门点点头，示意我们离开。"
        ]
      },
      "prepositionOrder": [
        "off",
        "at"
      ],
      "zipf": 3.74,
      "senses": {
        "off": [
          {
            "zh": "打瞌睡",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "at": [
          {
            "zh": "向……点头",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "nose": {
      "display": "nose",
      "prepositions": {
        "around": [
          "Someone has been nosing around in my desk. 有人一直在翻我的书桌。",
          "Reporters were nosing around the hotel. 记者在酒店里四处打探。"
        ]
      },
      "prepositionOrder": [
        "around"
      ],
      "zipf": 4.51,
      "senses": {
        "around": [
          {
            "zh": "四处打探",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "note": {
      "display": "note",
      "prepositions": {
        "down": [
          "I noted down her phone number. 我记下了她的电话号码。",
          "Please note down any questions you have. 请把你的问题都记下来。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 5.04,
      "senses": {
        "down": [
          {
            "zh": "记下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "notify": {
      "display": "notify",
      "prepositions": {
        "of": [
          "Please notify us of any change of address. 地址如有变更请通知我们。",
          "The winners will be notified of the results by email. 获奖者将通过电子邮件收到结果通知。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.73,
      "senses": {
        "of": [
          {
            "zh": "通知",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "number": {
      "display": "number",
      "prepositions": {
        "among": [
          "She numbers among the best writers of her generation. 她是同代人中最优秀的作家之一。",
          "He is numbered among the heroes of the war. 他被列为这场战争的英雄之一。"
        ]
      },
      "prepositionOrder": [
        "among"
      ],
      "zipf": 5.62,
      "senses": {
        "among": [
          {
            "zh": "属于……之列",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "object": {
      "display": "object",
      "prepositions": {
        "to": [
          "Many residents objected to the new airport. 许多居民反对建新机场。",
          "Do you object to my opening the window? 你介意我开窗吗？",
          "I strongly object to being treated like a child. 我强烈反对被当成小孩对待。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.56,
      "senses": {
        "to": [
          {
            "zh": "反对",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "obsess": {
      "display": "obsess",
      "prepositions": {
        "over": [
          "She obsesses over every little detail. 她对每个小细节都过分在意。",
          "Stop obsessing over your weight. 别老是纠结你的体重了。"
        ],
        "about": [
          "He obsessed about the exam for weeks. 他为这次考试焦虑了好几个星期。",
          "Teenagers often obsess about their looks. 青少年常常过分在意外表。"
        ]
      },
      "prepositionOrder": [
        "over",
        "about"
      ],
      "zipf": 2.9,
      "senses": {
        "over": [
          {
            "zh": "痴迷于；过分担心",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "对……念念不忘",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "occur": {
      "display": "occur",
      "prepositions": {
        "to": [
          "It never occurred to me that she might be lying. 我从没想到她可能在撒谎。",
          "Did it occur to you to ask for help? 你有没有想过要请人帮忙？",
          "A brilliant idea occurred to him in the shower. 他洗澡时想到了一个绝妙的主意。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.47,
      "senses": {
        "to": [
          {
            "zh": "想到",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "offer": {
      "display": "offer",
      "prepositions": {
        "up": [
          "They offered up prayers for the victims. 他们为遇难者祈祷。",
          "She offered up a few ideas at the meeting. 她在会上提出了几个想法。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 5.05,
      "senses": {
        "up": [
          {
            "zh": "奉献；提出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "open": {
      "display": "open",
      "prepositions": {
        "up": [
          "It took months before he opened up to me. 过了好几个月他才对我敞开心扉。",
          "The country has opened up to foreign investment. 这个国家已向外国投资开放。",
          "Open up the box and see what's inside. 打开盒子看看里面有什么。"
        ],
        "onto": [
          "The kitchen opens onto a small garden. 厨房通向一个小花园。",
          "Our room opened onto the beach. 我们的房间直通海滩。"
        ],
        "with": [
          "The show opened with a song. 演出以一首歌开场。",
          "He opened with a joke about the weather. 他以一个关于天气的笑话开场。"
        ]
      },
      "prepositionOrder": [
        "up",
        "onto",
        "with"
      ],
      "zipf": 5.48,
      "senses": {
        "up": [
          {
            "zh": "敞开心扉；开放；打开",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "onto": [
          {
            "zh": "通向",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "以……开始",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "operate": {
      "display": "operate",
      "prepositions": {
        "on": [
          "The surgeon operated on her knee. 外科医生给她的膝盖做了手术。",
          "They had to operate on him immediately. 他们不得不立即给他动手术。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.5,
      "senses": {
        "on": [
          {
            "zh": "给……做手术",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "opt": {
      "display": "opt",
      "prepositions": {
        "for": [
          "Most students opted for the online course. 大多数学生选择了网课。",
          "We opted for a quiet wedding. 我们选择了一个低调的婚礼。"
        ],
        "out": [
          "You can opt out of the pension scheme. 你可以选择不参加养老金计划。",
          "Several countries opted out of the agreement. 几个国家选择退出这项协议。"
        ],
        "in": [
          "Customers must opt in to receive our newsletter. 客户须选择订阅才能收到我们的通讯。",
          "Only a few employees opted in. 只有少数员工选择加入。"
        ]
      },
      "prepositionOrder": [
        "for",
        "out",
        "in"
      ],
      "zipf": 3.9,
      "senses": {
        "for": [
          {
            "zh": "选择",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "选择不参加",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "选择加入",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "order": {
      "display": "order",
      "prepositions": {
        "around": [
          "Stop ordering me around; I'm not your servant! 别对我呼来喝去，我不是你的仆人！",
          "He likes ordering his younger brothers around. 他喜欢对弟弟们发号施令。"
        ],
        "in": [
          "Let's order in pizza tonight. 今晚叫披萨外卖吧。",
          "We were too tired to cook, so we ordered in. 我们累得不想做饭，就叫了外卖。"
        ],
        "from": [
          "I ordered these books from an online shop. 我从网店订购了这些书。",
          "You can order from the menu at any time. 你随时可以按菜单点菜。"
        ]
      },
      "prepositionOrder": [
        "around",
        "in",
        "from"
      ],
      "zipf": 5.49,
      "senses": {
        "around": [
          {
            "zh": "对……发号施令",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "叫外卖",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "从……订购",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "originate": {
      "display": "originate",
      "prepositions": {
        "from": [
          "The custom originated from an old legend. 这个习俗源于一个古老的传说。",
          "The fire originated from a faulty wire. 火灾起因于一根有故障的电线。"
        ],
        "in": [
          "Tea drinking originated in China. 饮茶起源于中国。",
          "The virus is thought to have originated in bats. 人们认为这种病毒起源于蝙蝠。"
        ]
      },
      "prepositionOrder": [
        "from",
        "in"
      ],
      "zipf": 3.37,
      "senses": {
        "from": [
          {
            "zh": "起源于；来自",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "发源于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "oscillate": {
      "display": "oscillate",
      "prepositions": {
        "between": [
          "His mood oscillated between hope and despair. 他的情绪在希望和绝望之间摇摆。",
          "Prices oscillated between high and low all year. 全年价格忽高忽低。"
        ]
      },
      "prepositionOrder": [
        "between"
      ],
      "zipf": 2.42,
      "senses": {
        "between": [
          {
            "zh": "在……之间摇摆",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "overflow": {
      "display": "overflow",
      "prepositions": {
        "with": [
          "The stadium was overflowing with fans. 体育场挤满了球迷。",
          "Her heart overflowed with joy. 她心中充满了喜悦。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.39,
      "senses": {
        "with": [
          {
            "zh": "充满；挤满",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "owe": {
      "display": "owe",
      "prepositions": {
        "to": [
          "I owe my success to my parents. 我的成功归功于父母。",
          "He owes a lot of money to the bank. 他欠银行很多钱。",
          "We owe it to our children to protect the planet. 我们有责任为孩子们保护地球。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.13,
      "senses": {
        "to": [
          {
            "zh": "归功于；欠……",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "own": {
      "display": "own",
      "prepositions": {
        "up": [
          "Nobody owned up to breaking the window. 没有人承认打破了窗户。",
          "He finally owned up to his mistake. 他终于承认了自己的错误。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 5.74,
      "senses": {
        "up": [
          {
            "zh": "坦白承认",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pack": {
      "display": "pack",
      "prepositions": {
        "up": [
          "We packed up our things and left the hotel early. 我们收拾好东西，一早就离开了酒店。",
          "It's time to pack up and go home. 该收拾东西回家了。"
        ],
        "in": [
          "He packed in his job to travel around Asia. 他辞掉工作去亚洲各地旅行。",
          "My old laptop finally packed in last week. 我的旧笔记本电脑上周终于坏掉了。"
        ],
        "into": [
          "Hundreds of fans packed into the small hall. 数百名歌迷挤进了那个小礼堂。",
          "We packed into the car and drove to the beach. 我们挤进车里，开车去了海边。"
        ]
      },
      "prepositionOrder": [
        "up",
        "in",
        "into"
      ],
      "zipf": 4.66,
      "senses": {
        "up": [
          {
            "zh": "收拾行李；打包",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "放弃；辞掉；（机器）停止运转",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "挤进",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pair": {
      "display": "pair",
      "prepositions": {
        "up": [
          "The teacher paired up the students for the project. 老师让学生们两两结对完成这个项目。",
          "Let's pair up and practice the dialogue. 我们两人一组练习这段对话吧。"
        ],
        "with": [
          "This wine pairs well with fish. 这种葡萄酒配鱼很好。",
          "The new designer was paired with an experienced engineer. 新来的设计师和一位经验丰富的工程师搭档。"
        ]
      },
      "prepositionOrder": [
        "up",
        "with"
      ],
      "zipf": 4.72,
      "senses": {
        "up": [
          {
            "zh": "结对；配成一对",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……搭配",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pan": {
      "display": "pan",
      "prepositions": {
        "out": [
          "Our plans for the weekend didn't pan out. 我们的周末计划没能实现。",
          "Let's wait and see how things pan out. 我们等等看事情会怎样发展。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.39,
      "senses": {
        "out": [
          {
            "zh": "发展；结果（尤指成功）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pander": {
      "display": "pander",
      "prepositions": {
        "to": [
          "Some newspapers pander to their readers' worst instincts. 有些报纸迎合读者最低级的趣味。",
          "Politicians often pander to voters before an election. 政客们常在选举前讨好选民。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 2.64,
      "senses": {
        "to": [
          {
            "zh": "迎合；讨好",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "part": {
      "display": "part",
      "prepositions": {
        "with": [
          "She refused to part with her grandmother's ring. 她舍不得把祖母留下的戒指给别人。",
          "I hate parting with my old books. 我很不舍得处理掉我的旧书。"
        ],
        "from": [
          "He parted from his family at the station. 他在车站与家人分别。",
          "The singer parted from the band after ten years. 这位歌手在十年后离开了乐队。"
        ]
      },
      "prepositionOrder": [
        "with",
        "from"
      ],
      "zipf": 5.78,
      "senses": {
        "with": [
          {
            "zh": "舍弃；割舍（心爱之物）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "与……分开",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "participate": {
      "display": "participate",
      "prepositions": {
        "in": [
          "All students are expected to participate in the discussion. 所有学生都应参与讨论。",
          "Over fifty countries participated in the conference. 五十多个国家参加了这次会议。",
          "She rarely participates in class activities. 她很少参加班级活动。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 4.42,
      "senses": {
        "in": [
          {
            "zh": "参加；参与",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "pass": {
      "display": "pass",
      "prepositions": {
        "away": [
          "His grandfather passed away last spring. 他的祖父去年春天去世了。",
          "She passed away peacefully in her sleep. 她在睡梦中安详地离世。"
        ],
        "out": [
          "He almost passed out from the heat. 他差点因为太热而晕倒。",
          "Several runners passed out near the finish line. 好几名跑者在终点线附近晕倒了。",
          "The teacher passed out the exam papers. 老师分发了试卷。",
          "Volunteers were passing out leaflets on the street. 志愿者们在街上分发传单。"
        ],
        "on": [
          "Could you pass on my thanks to your mother? 你能代我向你母亲转达谢意吗？",
          "Please read this note and pass it on. 请读完这张便条后传下去。",
          "I think I'll pass on dessert tonight. 我想今晚就不吃甜点了。",
          "He passed on the job offer because of the long hours. 由于工作时间太长，他放弃了那份工作邀约。"
        ],
        "by": [
          "We passed by a lovely little cafe on our walk. 我们散步时经过一家可爱的小咖啡馆。",
          "Don't let this chance pass you by. 别让这次机会从你身边溜走。"
        ],
        "down": [
          "The recipe was passed down from my great grandmother. 这个食谱是从我曾祖母那里传下来的。",
          "These stories are passed down through generations. 这些故事代代相传。"
        ],
        "for": [
          "With her accent, she could pass for a local. 凭她的口音，她可以被当成本地人。",
          "He is forty but could pass for thirty. 他四十岁了，但看上去像三十岁。"
        ],
        "up": [
          "I can't pass up an offer like this. 这样的机会我可不能错过。",
          "She passed up the chance to study abroad. 她放弃了出国留学的机会。"
        ]
      },
      "prepositionOrder": [
        "away",
        "out",
        "on",
        "by",
        "down",
        "for",
        "up"
      ],
      "zipf": 5.05,
      "senses": {
        "away": [
          {
            "zh": "去世",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "昏倒；失去知觉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "分发",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "on": [
          {
            "zh": "传递；转告",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "放弃（机会等）",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "by": [
          {
            "zh": "经过；错过",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "传给（后代）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "被当作；被误认为",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "错过；放弃（机会）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "patch": {
      "display": "patch",
      "prepositions": {
        "up": [
          "They finally patched up their quarrel. 他们终于和好了。",
          "The doctor patched him up and sent him home. 医生给他简单处理了伤口，然后让他回家了。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.2,
      "senses": {
        "up": [
          {
            "zh": "修补；调和（关系）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pay": {
      "display": "pay",
      "prepositions": {
        "for": [
          "Who is going to pay for the damage? 谁来赔偿这些损失？",
          "I paid for the tickets online. 我在网上付了票钱。",
          "He will pay for his mistakes one day. 总有一天他会为自己的错误付出代价。"
        ],
        "back": [
          "I'll pay you back next week. 我下周还你钱。",
          "It took her years to pay back the loan. 她花了好几年才还清贷款。"
        ],
        "off": [
          "They finally paid off their mortgage. 他们终于还清了房贷。",
          "He is working two jobs to pay off his debts. 他打两份工来还债。",
          "All that hard work really paid off. 所有的努力都得到了回报。",
          "Her gamble paid off in the end. 她的冒险最终成功了。"
        ],
        "out": [
          "The insurance company paid out millions after the flood. 洪水过后，保险公司支付了数百万的赔款。",
          "We had to pay out a lot for the repairs. 我们不得不为维修花一大笔钱。"
        ]
      },
      "prepositionOrder": [
        "for",
        "back",
        "off",
        "out"
      ],
      "zipf": 5.4,
      "senses": {
        "for": [
          {
            "zh": "为……付钱；为……付出代价",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "back": [
          {
            "zh": "偿还",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "还清（债务）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "取得成功；得到回报",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "out": [
          {
            "zh": "付出（大笔钱）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "peel": {
      "display": "peel",
      "prepositions": {
        "off": [
          "She peeled off her wet socks. 她把湿袜子脱了下来。",
          "The paint on the walls is starting to peel off. 墙上的漆开始剥落了。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 3.8,
      "senses": {
        "off": [
          {
            "zh": "剥下；脱掉；剥落",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "peer": {
      "display": "peer",
      "prepositions": {
        "at": [
          "The old man peered at the small print. 老人眯着眼看那些小字。",
          "She peered at me over her glasses. 她从眼镜上方盯着我看。"
        ],
        "into": [
          "The children peered into the dark cave. 孩子们往黑漆漆的山洞里张望。",
          "He peered into the shop window. 他往商店的橱窗里张望。"
        ]
      },
      "prepositionOrder": [
        "at",
        "into"
      ],
      "zipf": 4.14,
      "senses": {
        "at": [
          {
            "zh": "凝视；盯着看",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "往……里窥视",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "perk": {
      "display": "perk",
      "prepositions": {
        "up": [
          "She perked up when she heard the good news. 听到好消息，她一下子来了精神。",
          "A cup of coffee will perk you up. 一杯咖啡会让你提起精神。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.19,
      "senses": {
        "up": [
          {
            "zh": "振作起来；活跃起来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "persist": {
      "display": "persist",
      "prepositions": {
        "in": [
          "He persisted in asking the same question. 他一再追问同一个问题。",
          "If you persist in breaking the rules, you will be punished. 如果你执意违反规定，就会受到惩罚。"
        ],
        "with": [
          "She persisted with her piano lessons for years. 她坚持上了很多年的钢琴课。",
          "We decided to persist with the original plan. 我们决定坚持原来的计划。"
        ]
      },
      "prepositionOrder": [
        "in",
        "with"
      ],
      "zipf": 3.53,
      "senses": {
        "in": [
          {
            "zh": "坚持（做某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "坚持（某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pertain": {
      "display": "pertain",
      "prepositions": {
        "to": [
          "These rules pertain to all employees. 这些规定适用于全体员工。",
          "Please keep your questions to matters pertaining to the course. 请只提与本课程有关的问题。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 2.88,
      "senses": {
        "to": [
          {
            "zh": "与……有关",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "peter": {
      "display": "peter",
      "prepositions": {
        "out": [
          "The path petered out near the river. 小路在河边渐渐消失了。",
          "Interest in the project soon petered out. 大家对这个项目的兴趣很快就消退了。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.88,
      "senses": {
        "out": [
          {
            "zh": "逐渐减少；逐渐消失",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "phase": {
      "display": "phase",
      "prepositions": {
        "out": [
          "The company is phasing out its old models. 公司正在逐步淘汰旧型号。",
          "Plastic bags will be phased out by next year. 塑料袋将在明年之前被逐步淘汰。"
        ],
        "in": [
          "The new rules will be phased in over two years. 新规定将在两年内逐步实施。",
          "The school is phasing in online exams. 学校正在逐步引入在线考试。"
        ]
      },
      "prepositionOrder": [
        "out",
        "in"
      ],
      "zipf": 4.64,
      "senses": {
        "out": [
          {
            "zh": "逐步淘汰",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "逐步采用",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pick": {
      "display": "pick",
      "prepositions": {
        "up": [
          "Please pick up your toys from the floor. 请把你的玩具从地上捡起来。",
          "She picked up the phone and dialed. 她拿起电话拨号。",
          "I'll pick you up at the airport. 我会去机场接你。",
          "Who is picking up the kids from school today? 今天谁去学校接孩子？",
          "He picked up some Spanish while living in Mexico. 他在墨西哥生活时学会了一些西班牙语。",
          "Children pick up new words very quickly. 孩子们学新词非常快。",
          "Business usually picks up before the holidays. 生意通常在节假日前好转。",
          "The wind picked up in the afternoon. 下午风变大了。"
        ],
        "out": [
          "Help me pick out a gift for my sister. 帮我给妹妹挑一件礼物。",
          "She picked out a red dress for the party. 她为晚会挑了一条红裙子。"
        ],
        "on": [
          "The older boys kept picking on him. 那些大男孩总是欺负他。",
          "Why are you always picking on me? 你为什么总是找我的茬？"
        ]
      },
      "prepositionOrder": [
        "up",
        "out",
        "on"
      ],
      "zipf": 5.08,
      "senses": {
        "up": [
          {
            "zh": "捡起；拿起",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "接（某人）",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          },
          {
            "zh": "（无意中）学会",
            "kind": "particle",
            "examples": [
              4,
              5
            ]
          },
          {
            "zh": "好转；回升",
            "kind": "particle",
            "examples": [
              6,
              7
            ]
          }
        ],
        "out": [
          {
            "zh": "挑选",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "找碴；欺负",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "piece": {
      "display": "piece",
      "prepositions": {
        "together": [
          "Police are trying to piece together what happened. 警方正在努力拼凑出事情的经过。",
          "She pieced the torn photo together. 她把撕破的照片拼了起来。"
        ]
      },
      "prepositionOrder": [
        "together"
      ],
      "zipf": 5.04,
      "senses": {
        "together": [
          {
            "zh": "拼凑出；弄清",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pile": {
      "display": "pile",
      "prepositions": {
        "up": [
          "The dishes piled up in the sink. 水槽里的碗碟堆成了山。",
          "Work keeps piling up while I'm away. 我不在的时候，工作一直在堆积。"
        ],
        "into": [
          "We all piled into the taxi. 我们全都挤进了出租车。",
          "The fans piled into the stadium. 球迷们涌进了体育场。"
        ]
      },
      "prepositionOrder": [
        "up",
        "into"
      ],
      "zipf": 4.14,
      "senses": {
        "up": [
          {
            "zh": "堆积",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "蜂拥挤进",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pin": {
      "display": "pin",
      "prepositions": {
        "down": [
          "It's hard to pin down the exact cause of the problem. 很难确定问题的确切原因。",
          "I tried to pin him down to a date, but he wouldn't say. 我想让他定个日子，但他不肯说。"
        ],
        "on": [
          "They tried to pin the blame on the new intern. 他们试图把责任推给新来的实习生。",
          "You can't pin this mistake on me. 你不能把这个错误归咎于我。"
        ]
      },
      "prepositionOrder": [
        "down",
        "on"
      ],
      "zipf": 4.28,
      "senses": {
        "down": [
          {
            "zh": "确定；使明确表态",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "归咎于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pine": {
      "display": "pine",
      "prepositions": {
        "for": [
          "She was pining for her home in the country. 她思念着自己在乡下的家。",
          "The dog pined for its owner while he was away. 主人不在时，那条狗一直很想念他。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.1,
      "senses": {
        "for": [
          {
            "zh": "渴望；思念",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pipe": {
      "display": "pipe",
      "prepositions": {
        "down": [
          "Pipe down, I'm trying to sleep! 小声点，我正想睡觉呢！",
          "The kids finally piped down after dinner. 孩子们吃完晚饭终于安静下来了。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.25,
      "senses": {
        "down": [
          {
            "zh": "安静下来；少说话",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pitch": {
      "display": "pitch",
      "prepositions": {
        "in": [
          "If everyone pitches in, we'll finish by noon. 如果大家都出把力，我们中午前就能完成。",
          "The neighbors pitched in to repair the roof. 邻居们一起帮忙修屋顶。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 4.43,
      "senses": {
        "in": [
          {
            "zh": "协力；出一份力",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "plan": {
      "display": "plan",
      "prepositions": {
        "on": [
          "We're planning on leaving early tomorrow. 我们打算明天早点出发。",
          "I didn't plan on staying this long. 我本没打算待这么久。"
        ],
        "for": [
          "It's wise to plan for retirement early. 尽早为退休做打算是明智的。",
          "We need to plan for the worst. 我们需要做最坏的打算。"
        ],
        "ahead": [
          "If you plan ahead, the trip will be much easier. 如果提前规划，旅行会轻松得多。",
          "She always plans ahead for exams. 她总是提前为考试做计划。"
        ]
      },
      "prepositionOrder": [
        "on",
        "for",
        "ahead"
      ],
      "zipf": 5.29,
      "senses": {
        "on": [
          {
            "zh": "打算",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "为……做计划",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "ahead": [
          {
            "zh": "提前计划",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "play": {
      "display": "play",
      "prepositions": {
        "with": [
          "Stop playing with your food. 别再摆弄你的食物了。",
          "The kitten played with a ball of string. 小猫在玩一团线。"
        ],
        "down": [
          "The government tried to play down the crisis. 政府试图淡化这场危机。",
          "He always plays down his own achievements. 他总是轻描淡写自己的成就。"
        ],
        "up": [
          "The media played up the scandal. 媒体大肆渲染了这桩丑闻。",
          "In the interview, play up your language skills. 面试时要突出你的语言能力。"
        ],
        "along": [
          "I didn't believe him, but I played along. 我不相信他，但还是配合着他。",
          "She played along with the joke. 她顺着这个玩笑演了下去。"
        ],
        "against": [
          "We are playing against the champions next week. 我们下周将对阵冠军队。",
          "She played against her own sister in the final. 她在决赛中与自己的妹妹对决。"
        ]
      },
      "prepositionOrder": [
        "with",
        "down",
        "up",
        "along",
        "against"
      ],
      "zipf": 5.61,
      "senses": {
        "with": [
          {
            "zh": "玩弄；摆弄",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "淡化；贬低",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "夸大；强调",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "along": [
          {
            "zh": "假装合作；配合",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "与……比赛",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "plead": {
      "display": "plead",
      "prepositions": {
        "for": [
          "The prisoners pleaded for mercy. 犯人们恳求宽恕。",
          "She pleaded for more time to finish the work. 她恳求多给些时间完成工作。"
        ],
        "with": [
          "He pleaded with his parents to let him go. 他恳求父母让他去。",
          "I pleaded with the officer, but he gave me a ticket anyway. 我向警官求情，但他还是给我开了罚单。"
        ]
      },
      "prepositionOrder": [
        "for",
        "with"
      ],
      "zipf": 3.63,
      "senses": {
        "for": [
          {
            "zh": "恳求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "向……恳求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "plow": {
      "display": "plow",
      "prepositions": {
        "through": [
          "I plowed through the entire report last night. 我昨晚硬着头皮看完了整份报告。",
          "The truck plowed through the deep snow. 卡车在厚厚的积雪中艰难前行。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 3.21,
      "senses": {
        "through": [
          {
            "zh": "艰难地读完；费力地穿过",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "plug": {
      "display": "plug",
      "prepositions": {
        "in": [
          "Did you plug in the kettle? 你把水壶插上电了吗？",
          "Plug the charger in before you go to bed. 睡觉前把充电器插上。"
        ],
        "away": [
          "He kept plugging away at his thesis. 他一直埋头苦写论文。",
          "If you plug away, you'll get there eventually. 只要坚持不懈，你最终会成功。"
        ]
      },
      "prepositionOrder": [
        "in",
        "away"
      ],
      "zipf": 4.14,
      "senses": {
        "in": [
          {
            "zh": "插上电源",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "坚持不懈地做",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "plunge": {
      "display": "plunge",
      "prepositions": {
        "into": [
          "She plunged into her new job with enthusiasm. 她满怀热情地投入新工作。",
          "The country was plunged into war. 这个国家陷入了战争。",
          "He plunged into the icy water. 他跳进了冰冷的水里。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 3.49,
      "senses": {
        "into": [
          {
            "zh": "跳入；投入；使陷入",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "point": {
      "display": "point",
      "prepositions": {
        "out": [
          "She pointed out several errors in my essay. 她指出了我文章中的几处错误。",
          "I should point out that the price has changed. 我应该指出价格已经变了。"
        ],
        "at": [
          "It's rude to point at people. 用手指着别人是不礼貌的。",
          "The child pointed at the moon. 孩子指着月亮。"
        ],
        "to": [
          "All the evidence points to one suspect. 所有证据都指向一名嫌疑人。",
          "The data point to a sharp rise in costs. 数据表明成本急剧上升。"
        ]
      },
      "prepositionOrder": [
        "out",
        "at",
        "to"
      ],
      "zipf": 5.54,
      "senses": {
        "out": [
          {
            "zh": "指出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "at": [
          {
            "zh": "指着",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "表明；指向",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "poke": {
      "display": "poke",
      "prepositions": {
        "at": [
          "He poked at his salad without eating. 他用叉子拨弄着沙拉，一口也没吃。",
          "The boy poked at the fire with a stick. 男孩用棍子拨弄火堆。"
        ],
        "around": [
          "Someone has been poking around in my desk. 有人一直在翻我的书桌。",
          "We spent the afternoon poking around old bookshops. 我们花了一下午逛旧书店。"
        ]
      },
      "prepositionOrder": [
        "at",
        "around"
      ],
      "zipf": 3.6,
      "senses": {
        "at": [
          {
            "zh": "戳；拨弄",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "around": [
          {
            "zh": "翻找；四处探查",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "polish": {
      "display": "polish",
      "prepositions": {
        "off": [
          "The kids polished off the whole pizza. 孩子们一下子把整张披萨吃光了。",
          "I polished off my homework before dinner. 我在晚饭前迅速写完了作业。"
        ],
        "up": [
          "I need to polish up my French before the trip. 旅行前我得温习一下法语。",
          "She polished up her speech the night before. 她在前一晚润色了演讲稿。"
        ]
      },
      "prepositionOrder": [
        "off",
        "up"
      ],
      "zipf": 4.29,
      "senses": {
        "off": [
          {
            "zh": "很快吃完；迅速完成",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "改进；温习",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "ponder": {
      "display": "ponder",
      "prepositions": {
        "over": [
          "She pondered over the offer for days. 她把这个提议考虑了好几天。",
          "He sat pondering over his next move. 他坐在那里琢磨下一步该怎么走。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 3.35,
      "senses": {
        "over": [
          {
            "zh": "仔细考虑",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pop": {
      "display": "pop",
      "prepositions": {
        "up": [
          "Ads keep popping up on my screen. 广告不停在我的屏幕上弹出来。",
          "His name popped up in the conversation. 谈话中突然提到了他的名字。"
        ],
        "in": [
          "I'll pop in to see you on my way home. 我回家路上顺便来看看你。",
          "She popped in for a quick coffee. 她顺便进来喝了杯咖啡。"
        ],
        "out": [
          "I'm just popping out to the shop. 我去趟商店，马上回来。",
          "A rabbit popped out of the bushes. 一只兔子从灌木丛里窜了出来。"
        ]
      },
      "prepositionOrder": [
        "up",
        "in",
        "out"
      ],
      "zipf": 4.87,
      "senses": {
        "up": [
          {
            "zh": "突然出现",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "顺便拜访",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "突然出来；短暂外出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pore": {
      "display": "pore",
      "prepositions": {
        "over": [
          "She spent hours poring over old maps. 她花了好几个小时仔细研究旧地图。",
          "The lawyers pored over the contract. 律师们仔细审阅了合同。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 3.28,
      "senses": {
        "over": [
          {
            "zh": "仔细阅读；钻研",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pose": {
      "display": "pose",
      "prepositions": {
        "as": [
          "The thief posed as a delivery man. 小偷冒充送货员。",
          "He was arrested for posing as a doctor. 他因冒充医生而被捕。"
        ],
        "for": [
          "The team posed for a photo after the match. 比赛结束后，队员们摆姿势合影。",
          "She posed for the artist every Sunday. 她每个星期天都给那位画家当模特。"
        ]
      },
      "prepositionOrder": [
        "as",
        "for"
      ],
      "zipf": 4.1,
      "senses": {
        "as": [
          {
            "zh": "冒充",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "摆姿势（拍照、画像）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pounce": {
      "display": "pounce",
      "prepositions": {
        "on": [
          "The cat pounced on the mouse. 猫猛地扑向老鼠。",
          "Reporters pounced on his careless remark. 记者们立刻抓住了他那句轻率的话大做文章。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 2.97,
      "senses": {
        "on": [
          {
            "zh": "猛扑；抓住（错误、机会）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pour": {
      "display": "pour",
      "prepositions": {
        "in": [
          "Letters of support poured in from all over the country. 支持信从全国各地纷纷涌来。",
          "Donations began pouring in after the earthquake. 地震后捐款开始大量涌入。"
        ],
        "into": [
          "They poured millions into the new project. 他们向新项目投入了数百万资金。",
          "She poured all her energy into her studies. 她把全部精力都投入到学习中。"
        ],
        "out": [
          "He poured out his troubles to his best friend. 他向最好的朋友倾诉了自己的烦恼。",
          "She poured her heart out in a long letter. 她在一封长信中倾诉了心声。"
        ]
      },
      "prepositionOrder": [
        "in",
        "into",
        "out"
      ],
      "zipf": 4.1,
      "senses": {
        "in": [
          {
            "zh": "大量涌入",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "投入（大量金钱、精力）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "倾诉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pray": {
      "display": "pray",
      "prepositions": {
        "for": [
          "We are all praying for your quick recovery. 我们都在祈祷你早日康复。",
          "The farmers prayed for rain. 农民们祈求下雨。"
        ],
        "to": [
          "She prayed to God for strength. 她向上帝祈求力量。",
          "People prayed to the gods for a good harvest. 人们向神灵祈求丰收。"
        ]
      },
      "prepositionOrder": [
        "for",
        "to"
      ],
      "zipf": 4.4,
      "senses": {
        "for": [
          {
            "zh": "为……祈祷；祈求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "向……祈祷",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "preach": {
      "display": "preach",
      "prepositions": {
        "to": [
          "Stop preaching to me about healthy eating. 别再跟我说教健康饮食了。",
          "The priest preached to a large crowd. 牧师向一大群人布道。"
        ],
        "about": [
          "He's always preaching about the importance of hard work. 他总是大谈努力工作的重要性。"
        ]
      },
      "prepositionOrder": [
        "to",
        "about"
      ],
      "zipf": 3.69,
      "senses": {
        "to": [
          {
            "zh": "向……说教；布道",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "宣讲；鼓吹",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "prepare": {
      "display": "prepare",
      "prepositions": {
        "for": [
          "The students are preparing for their final exams. 学生们正在准备期末考试。",
          "We need to prepare for the storm. 我们需要为暴风雨做好准备。",
          "Nothing could have prepared me for the news. 这个消息让我完全措手不及。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.55,
      "senses": {
        "for": [
          {
            "zh": "为……做准备",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "present": {
      "display": "present",
      "prepositions": {
        "with": [
          "The mayor presented her with an award. 市长向她颁发了奖项。",
          "The new job presented him with many challenges. 新工作给他带来了许多挑战。"
        ],
        "to": [
          "The report will be presented to the board next week. 这份报告将于下周提交给董事会。",
          "She presented her ideas to the whole class. 她向全班展示了自己的想法。"
        ]
      },
      "prepositionOrder": [
        "with",
        "to"
      ],
      "zipf": 5.18,
      "senses": {
        "with": [
          {
            "zh": "向……赠送；使面临",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "把……呈交给",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "preside": {
      "display": "preside",
      "prepositions": {
        "over": [
          "The judge presided over the trial. 这位法官主持了审判。",
          "She will preside over the meeting tomorrow. 她将主持明天的会议。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 2.99,
      "senses": {
        "over": [
          {
            "zh": "主持；掌管",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "press": {
      "display": "press",
      "prepositions": {
        "for": [
          "The union is pressing for higher wages. 工会正在强烈要求提高工资。",
          "Residents pressed for a new school in the area. 居民们强烈要求在本地区新建一所学校。"
        ],
        "on": [
          "Despite the rain, we pressed on to the summit. 尽管下着雨，我们还是继续向山顶前进。",
          "Let's press on with the agenda. 我们继续讨论议程吧。",
          "She pressed some money on me before I left. 我走之前她硬塞给我一些钱。",
          "Don't press your views on others. 不要把你的观点强加给别人。"
        ]
      },
      "prepositionOrder": [
        "for",
        "on"
      ],
      "zipf": 5.16,
      "senses": {
        "for": [
          {
            "zh": "迫切要求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "继续进行",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "强加给；把……硬塞给",
            "kind": "preposition",
            "examples": [
              2,
              3
            ]
          }
        ]
      }
    },
    "pressure": {
      "display": "pressure",
      "prepositions": {
        "into": [
          "Don't let anyone pressure you into signing. 别让任何人逼你签字。",
          "He felt pressured into taking the job. 他觉得自己是被迫接受这份工作的。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 5.01,
      "senses": {
        "into": [
          {
            "zh": "迫使（某人）做",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "prevail": {
      "display": "prevail",
      "prepositions": {
        "over": [
          "In the end, common sense prevailed over fear. 最终，理智战胜了恐惧。",
          "Good will prevail over evil. 正义终将战胜邪恶。"
        ],
        "on": [
          "We prevailed on him to stay for dinner. 我们劝他留下来吃晚饭。",
          "She was prevailed on to sing a song. 她经不住劝，唱了一首歌。"
        ]
      },
      "prepositionOrder": [
        "over",
        "on"
      ],
      "zipf": 3.55,
      "senses": {
        "over": [
          {
            "zh": "战胜；压倒",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "劝说",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "prevent": {
      "display": "prevent",
      "prepositions": {
        "from": [
          "The rain prevented us from going out. 下雨让我们没法出门。",
          "This medicine prevents the virus from spreading. 这种药能防止病毒扩散。",
          "Nothing will prevent me from finishing this book. 什么也阻止不了我写完这本书。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.79,
      "senses": {
        "from": [
          {
            "zh": "阻止；防止",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "prey": {
      "display": "prey",
      "prepositions": {
        "on": [
          "Owls prey on mice and other small animals. 猫头鹰捕食老鼠和其他小动物。",
          "These scammers prey on elderly people. 这些骗子专门欺骗老年人。",
          "The guilt preyed on his mind for years. 内疚多年来一直折磨着他。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.98,
      "senses": {
        "on": [
          {
            "zh": "捕食；欺骗（弱者）；使烦恼",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "pride": {
      "display": "pride",
      "prepositions": {
        "on": [
          "The restaurant prides itself on its fresh ingredients. 这家餐厅以新鲜的食材为傲。",
          "She prides herself on never being late. 她为自己从不迟到而自豪。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.49,
      "senses": {
        "on": [
          {
            "zh": "以……自豪",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "print": {
      "display": "print",
      "prepositions": {
        "out": [
          "Could you print out this document for me? 你能帮我把这份文件打印出来吗？",
          "I printed the tickets out last night. 我昨晚把票打印出来了。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.54,
      "senses": {
        "out": [
          {
            "zh": "打印出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "proceed": {
      "display": "proceed",
      "prepositions": {
        "with": [
          "We will proceed with the plan as scheduled. 我们将按计划继续进行。",
          "The council decided to proceed with the new road. 市议会决定继续修建那条新路。"
        ],
        "to": [
          "Passengers should proceed to gate twelve. 请旅客前往十二号登机口。",
          "Let's now proceed to the next question. 我们现在接着讨论下一个问题。"
        ],
        "against": [
          "The bank decided to proceed against the company. 银行决定对这家公司提起诉讼。"
        ]
      },
      "prepositionOrder": [
        "with",
        "to",
        "against"
      ],
      "zipf": 4.18,
      "senses": {
        "with": [
          {
            "zh": "继续进行",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "接着去（某处）；转而做",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "起诉",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "profit": {
      "display": "profit",
      "prepositions": {
        "from": [
          "Everyone can profit from a good education. 每个人都能从良好的教育中受益。",
          "Some companies profited from the crisis. 一些公司从这场危机中获利。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.7,
      "senses": {
        "from": [
          {
            "zh": "从……中获利；受益",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "prohibit": {
      "display": "prohibit",
      "prepositions": {
        "from": [
          "Visitors are prohibited from taking photos. 参观者不得拍照。",
          "The law prohibits companies from selling alcohol to minors. 法律禁止公司向未成年人出售酒类。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.51,
      "senses": {
        "from": [
          {
            "zh": "禁止",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "prop": {
      "display": "prop",
      "prepositions": {
        "up": [
          "He propped up the broken shelf with a brick. 他用一块砖头撑住了坏掉的架子。",
          "The government propped up the failing bank. 政府扶持了那家濒临倒闭的银行。"
        ],
        "against": [
          "She propped her bike against the wall. 她把自行车靠在墙上。"
        ]
      },
      "prepositionOrder": [
        "up",
        "against"
      ],
      "zipf": 3.77,
      "senses": {
        "up": [
          {
            "zh": "支撑；扶持",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "靠在……上",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "protect": {
      "display": "protect",
      "prepositions": {
        "from": [
          "Sunscreen protects your skin from sunburn. 防晒霜能保护皮肤免受晒伤。",
          "Parents want to protect their children from harm. 父母都想保护孩子不受伤害。"
        ],
        "against": [
          "This vaccine protects against the flu. 这种疫苗可以预防流感。",
          "The walls were built to protect the town against floods. 修建这些墙是为了保护城镇免遭洪水。"
        ]
      },
      "prepositionOrder": [
        "from",
        "against"
      ],
      "zipf": 4.92,
      "senses": {
        "from": [
          {
            "zh": "保护……免受",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "防御；防止",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "protest": {
      "display": "protest",
      "prepositions": {
        "against": [
          "Thousands of people protested against the new tax. 成千上万的人抗议新税。",
          "Students protested against the rise in fees. 学生们抗议学费上涨。"
        ],
        "about": [
          "Local residents protested about the noise. 当地居民对噪音提出抗议。"
        ]
      },
      "prepositionOrder": [
        "against",
        "about"
      ],
      "zipf": 4.45,
      "senses": {
        "against": [
          {
            "zh": "抗议；反对",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "就……提出抗议；抱怨",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "provide": {
      "display": "provide",
      "prepositions": {
        "for": [
          "He works hard to provide for his family. 他努力工作养家。",
          "The law provides for fines of up to a thousand dollars. 法律规定最高可罚款一千美元。"
        ],
        "with": [
          "The hotel provided us with free breakfast. 酒店为我们提供了免费早餐。",
          "Each student will be provided with a laptop. 每名学生都将获得一台笔记本电脑。"
        ]
      },
      "prepositionOrder": [
        "for",
        "with"
      ],
      "zipf": 5.15,
      "senses": {
        "for": [
          {
            "zh": "供养；（法律等）规定",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "向……提供",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pry": {
      "display": "pry",
      "prepositions": {
        "into": [
          "I don't want to pry into your private life. 我不想打探你的私生活。",
          "Journalists kept prying into her past. 记者们一直在挖她的过去。"
        ]
      },
      "prepositionOrder": [
        "into"
      ],
      "zipf": 3.08,
      "senses": {
        "into": [
          {
            "zh": "打听；窥探（隐私）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pull": {
      "display": "pull",
      "prepositions": {
        "over": [
          "The police officer told me to pull over. 警察让我靠边停车。",
          "Let's pull over and check the map. 我们靠边停一下，看看地图。"
        ],
        "out": [
          "The company pulled out of the deal at the last minute. 公司在最后一刻退出了交易。",
          "A car suddenly pulled out in front of me. 一辆车突然从我前面开了出来。"
        ],
        "off": [
          "Nobody thought she could pull off such a big event. 没人想到她能办成这么大的活动。",
          "We pulled it off in the end! 我们最终成功了！"
        ],
        "through": [
          "The doctors think he will pull through. 医生认为他能挺过来。",
          "The company pulled through the recession. 公司挺过了经济衰退。"
        ],
        "down": [
          "They pulled down the old factory last year. 他们去年拆除了那座旧工厂。",
          "The building will be pulled down to make way for a park. 这栋楼将被拆除，为公园腾出地方。"
        ],
        "up": [
          "A taxi pulled up outside the hotel. 一辆出租车在酒店门外停了下来。",
          "Let me pull up the file on my computer. 我在电脑上调出这个文件。"
        ],
        "together": [
          "Pull yourself together and stop crying. 振作起来，别哭了。",
          "She pulled herself together before the interview. 面试前她让自己镇定下来。"
        ]
      },
      "prepositionOrder": [
        "over",
        "out",
        "off",
        "through",
        "down",
        "up",
        "together"
      ],
      "zipf": 4.82,
      "senses": {
        "over": [
          {
            "zh": "（车辆）靠边停",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "退出；驶出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "成功完成（难事）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "渡过难关；康复",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "拆毁",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "停下；调出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "together": [
          {
            "zh": "振作起来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "pump": {
      "display": "pump",
      "prepositions": {
        "up": [
          "I need to pump up my bike tyres. 我需要给自行车轮胎打气。",
          "The coach pumped up the team before the game. 教练在比赛前给队员们打气。"
        ],
        "into": [
          "The government pumped billions into the economy. 政府向经济注入了数十亿资金。"
        ]
      },
      "prepositionOrder": [
        "up",
        "into"
      ],
      "zipf": 4.28,
      "senses": {
        "up": [
          {
            "zh": "给……充气；使振奋",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "向……大量投入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "punish": {
      "display": "punish",
      "prepositions": {
        "for": [
          "He was punished for cheating on the test. 他因考试作弊受到了惩罚。",
          "Don't punish yourself for small mistakes. 别因为小错误而责怪自己。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 3.95,
      "senses": {
        "for": [
          {
            "zh": "因……惩罚",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "push": {
      "display": "push",
      "prepositions": {
        "for": [
          "Parents are pushing for smaller class sizes. 家长们力争缩小班级规模。",
          "She pushed for a change in the law. 她极力推动修改法律。"
        ],
        "back": [
          "The meeting has been pushed back to Friday. 会议被推迟到周五了。",
          "We had to push back the launch date. 我们不得不推迟发布日期。"
        ],
        "ahead": [
          "The city is pushing ahead with its plans for a new airport. 该市正在坚持推进新机场的计划。",
          "Despite the protests, they pushed ahead. 尽管有抗议，他们仍坚持推进。"
        ],
        "around": [
          "Don't let your boss push you around. 别让你的老板对你指手画脚。",
          "He was tired of being pushed around. 他受够了被人欺负。"
        ]
      },
      "prepositionOrder": [
        "for",
        "back",
        "ahead",
        "around"
      ],
      "zipf": 4.82,
      "senses": {
        "for": [
          {
            "zh": "力争；要求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "推迟",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "ahead": [
          {
            "zh": "坚持推进",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "around": [
          {
            "zh": "摆布；欺负",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "put": {
      "display": "put",
      "prepositions": {
        "off": [
          "Don't put off until tomorrow what you can do today. 今日事，今日毕。",
          "We had to put the wedding off because of the storm. 由于暴风雨，我们不得不推迟婚礼。",
          "The smell put me off my food. 那股味道让我没了胃口。",
          "Don't be put off by his rude manner. 别因为他态度粗鲁就打退堂鼓。"
        ],
        "on": [
          "Put on your coat, it's cold outside. 穿上外套，外面很冷。",
          "She put her glasses on to read the menu. 她戴上眼镜看菜单。",
          "He put on a brave face at the funeral. 在葬礼上他强作镇定。",
          "I've put on weight since the holidays. 假期过后我胖了。"
        ],
        "out": [
          "The firefighters put out the fire quickly. 消防员很快就把火扑灭了。",
          "Please put out your cigarette. 请把烟熄掉。",
          "I hope we're not putting you out. 希望我们没给你添麻烦。",
          "She was put out by his late arrival. 他迟到让她很不高兴。"
        ],
        "up with": [
          "I can't put up with this noise any longer. 我再也受不了这噪音了。",
          "How do you put up with his behavior? 你怎么受得了他的行为？"
        ],
        "up": [
          "My aunt put us up for the night. 我姑妈留我们住了一晚。",
          "They put up posters all over town. 他们在全城张贴了海报。"
        ],
        "away": [
          "Put your phone away during the lesson. 上课时把手机收起来。",
          "She put the dishes away after dinner. 晚饭后她把碗碟收好。"
        ],
        "down": [
          "Put down that knife before you cut yourself. 把刀放下，别割伤自己。",
          "He's always putting his colleagues down. 他总是贬低自己的同事。"
        ],
        "forward": [
          "She put forward a new proposal at the meeting. 她在会上提出了一项新建议。",
          "Several ideas were put forward for discussion. 有几个想法被提出来讨论。"
        ],
        "through": [
          "Could you put me through to the manager? 能帮我接经理吗？",
          "Please hold while I put you through. 请稍等，我为您接通。"
        ],
        "aside": [
          "Try to put aside some money every month. 每个月尽量存一点钱。",
          "Let's put aside our differences and work together. 让我们抛开分歧，一起合作吧。"
        ]
      },
      "prepositionOrder": [
        "off",
        "on",
        "out",
        "up with",
        "up",
        "away",
        "down",
        "forward",
        "through",
        "aside"
      ],
      "zipf": 5.66,
      "senses": {
        "off": [
          {
            "zh": "推迟",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "使反感；使失去兴趣",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "on": [
          {
            "zh": "穿上",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "假装；增加（体重）",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "out": [
          {
            "zh": "扑灭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "给……添麻烦；使不快",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "up with": [
          {
            "zh": "容忍；忍受",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "提供住宿；张贴",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "把……收起来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "放下；贬低",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "forward": [
          {
            "zh": "提出（建议）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "接通（电话）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "aside": [
          {
            "zh": "留出；抛开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "puzzle": {
      "display": "puzzle",
      "prepositions": {
        "over": [
          "Scientists have puzzled over this question for years. 科学家们多年来一直在苦苦思索这个问题。",
          "She puzzled over the strange message. 她对那条奇怪的消息百思不得其解。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 3.96,
      "senses": {
        "over": [
          {
            "zh": "苦苦思索",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "qualify": {
      "display": "qualify",
      "prepositions": {
        "for": [
          "You may qualify for a student discount. 你也许有资格享受学生折扣。",
          "Our team qualified for the World Cup. 我们队获得了世界杯参赛资格。"
        ],
        "as": [
          "She qualified as a nurse last year. 她去年取得了护士资格。",
          "He trained for five years to qualify as a lawyer. 他培训了五年才取得律师资格。"
        ]
      },
      "prepositionOrder": [
        "for",
        "as"
      ],
      "zipf": 4.19,
      "senses": {
        "for": [
          {
            "zh": "有资格获得；取得参赛资格",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "as": [
          {
            "zh": "取得……资格",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "quarrel": {
      "display": "quarrel",
      "prepositions": {
        "with": [
          "I don't want to quarrel with you. 我不想和你吵架。",
          "She often quarrels with her brother. 她经常和哥哥吵架。"
        ],
        "about": [
          "The children quarreled about whose turn it was. 孩子们为轮到谁而争吵。",
          "They quarrel about money all the time. 他们总是为钱吵架。"
        ]
      },
      "prepositionOrder": [
        "with",
        "about"
      ],
      "zipf": 3.31,
      "senses": {
        "with": [
          {
            "zh": "与……争吵",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "为……争吵",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "queue": {
      "display": "queue",
      "prepositions": {
        "up": [
          "People queued up for hours to buy tickets. 人们排了几个小时的队买票。",
          "Please queue up at the counter. 请在柜台前排队。"
        ],
        "for": [
          "We queued for the bus in the rain. 我们冒雨排队等公交车。"
        ]
      },
      "prepositionOrder": [
        "up",
        "for"
      ],
      "zipf": 3.78,
      "senses": {
        "up": [
          {
            "zh": "排队",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "排队等候",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "quibble": {
      "display": "quibble",
      "prepositions": {
        "about": [
          "Let's not quibble about a few dollars. 我们别为几块钱争来争去了。"
        ],
        "over": [
          "They spent an hour quibbling over the wording. 他们花了一个小时在措辞上斤斤计较。"
        ]
      },
      "prepositionOrder": [
        "about",
        "over"
      ],
      "zipf": 2.69,
      "senses": {
        "about": [
          {
            "zh": "为小事争论",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "在……上吹毛求疵",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "quiet": {
      "display": "quiet",
      "prepositions": {
        "down": [
          "The teacher waited for the class to quiet down. 老师等着全班安静下来。",
          "Things usually quiet down after nine. 九点以后通常就安静了。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.65,
      "senses": {
        "down": [
          {
            "zh": "安静下来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "quote": {
      "display": "quote",
      "prepositions": {
        "from": [
          "The speaker quoted from a famous poem. 演讲者引用了一首名诗中的句子。",
          "He often quotes from the Bible. 他经常引用圣经里的话。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.51,
      "senses": {
        "from": [
          {
            "zh": "引用",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "race": {
      "display": "race",
      "prepositions": {
        "against": [
          "The rescue team was racing against time. 救援队在与时间赛跑。",
          "She raced against the best runners in the country. 她和全国最好的赛跑选手同场竞技。"
        ]
      },
      "prepositionOrder": [
        "against"
      ],
      "zipf": 5.08,
      "senses": {
        "against": [
          {
            "zh": "与……赛跑",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rack": {
      "display": "rack",
      "prepositions": {
        "up": [
          "The team racked up five wins in a row. 这支队伍连胜五场。",
          "He racked up huge debts on his credit card. 他在信用卡上欠下了巨额债务。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.9,
      "senses": {
        "up": [
          {
            "zh": "积累；累积",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rail": {
      "display": "rail",
      "prepositions": {
        "against": [
          "The article rails against the rising cost of housing. 这篇文章痛斥房价上涨。",
          "He railed against the unfair decision. 他痛斥这个不公平的决定。"
        ]
      },
      "prepositionOrder": [
        "against"
      ],
      "zipf": 4.41,
      "senses": {
        "against": [
          {
            "zh": "抱怨；痛斥",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rain": {
      "display": "rain",
      "prepositions": {
        "off": [
          "The football match was rained off. 足球赛因雨取消了。",
          "Our picnic got rained off again. 我们的野餐又因为下雨泡汤了。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 4.71,
      "senses": {
        "off": [
          {
            "zh": "因雨取消",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rake": {
      "display": "rake",
      "prepositions": {
        "in": [
          "The film raked in millions in its first week. 这部电影首周就狂揽数百万。",
          "Their shop is raking in the money this summer. 今年夏天他们的店赚了很多钱。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.38,
      "senses": {
        "in": [
          {
            "zh": "大量赚取",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rally": {
      "display": "rally",
      "prepositions": {
        "around": [
          "Friends rallied around her after the accident. 事故发生后，朋友们都来帮助她。",
          "The whole town rallied around the family. 全镇的人都团结起来帮助这家人。"
        ]
      },
      "prepositionOrder": [
        "around"
      ],
      "zipf": 4.34,
      "senses": {
        "around": [
          {
            "zh": "团结在……周围；齐心协力帮助",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "range": {
      "display": "range",
      "prepositions": {
        "from": [
          "Prices range from ten to fifty dollars. 价格从十美元到五十美元不等。",
          "The students' ages range from eight to twelve. 学生们的年龄在八到十二岁之间。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 5.12,
      "senses": {
        "from": [
          {
            "zh": "从……到……不等",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rank": {
      "display": "rank",
      "prepositions": {
        "among": [
          "This book ranks among the best novels of the century. 这本书位列本世纪最佳小说之列。",
          "The city ranks among the safest in the world. 这座城市是世界上最安全的城市之一。"
        ],
        "as": [
          "He ranks as one of the greatest players ever. 他被列为有史以来最伟大的球员之一。"
        ]
      },
      "prepositionOrder": [
        "among",
        "as"
      ],
      "zipf": 4.44,
      "senses": {
        "among": [
          {
            "zh": "位列……之中",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "as": [
          {
            "zh": "被列为",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "rant": {
      "display": "rant",
      "prepositions": {
        "about": [
          "He's always ranting about the government. 他总是大声抱怨政府。",
          "She ranted about her noisy neighbors for an hour. 她抱怨吵闹的邻居，抱怨了一个小时。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 3.67,
      "senses": {
        "about": [
          {
            "zh": "大声抱怨",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rat": {
      "display": "rat",
      "prepositions": {
        "on": [
          "Someone ratted on us to the teacher. 有人向老师告了我们的状。",
          "He would never rat on a friend. 他绝不会出卖朋友。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.17,
      "senses": {
        "on": [
          {
            "zh": "告发；出卖",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rattle": {
      "display": "rattle",
      "prepositions": {
        "off": [
          "She rattled off the names of all the planets. 她一口气说出了所有行星的名字。",
          "The waiter rattled off the specials. 服务员一口气报出了特色菜。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 3.35,
      "senses": {
        "off": [
          {
            "zh": "一口气说出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rave": {
      "display": "rave",
      "prepositions": {
        "about": [
          "Everyone is raving about the new restaurant. 大家都对那家新餐馆赞不绝口。",
          "Critics raved about her performance. 评论家对她的表演大加赞赏。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 3.52,
      "senses": {
        "about": [
          {
            "zh": "极力称赞",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "reach": {
      "display": "reach",
      "prepositions": {
        "out": [
          "She reached out and took my hand. 她伸出手握住了我的手。",
          "Feel free to reach out if you need help. 需要帮助的话随时联系。"
        ],
        "for": [
          "He reached for his wallet. 他伸手去拿钱包。",
          "The child reached for the cookie jar. 孩子伸手去够饼干罐。"
        ]
      },
      "prepositionOrder": [
        "out",
        "for"
      ],
      "zipf": 4.94,
      "senses": {
        "out": [
          {
            "zh": "伸出手；主动联系",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "伸手去拿",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "react": {
      "display": "react",
      "prepositions": {
        "to": [
          "How did your parents react to the news? 你父母对这个消息有什么反应？",
          "Some people react badly to this medicine. 有些人对这种药有不良反应。"
        ],
        "against": [
          "Teenagers often react against their parents' values. 青少年常常反抗父母的价值观。"
        ]
      },
      "prepositionOrder": [
        "to",
        "against"
      ],
      "zipf": 4.16,
      "senses": {
        "to": [
          {
            "zh": "对……作出反应",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "反对；反抗",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "read": {
      "display": "read",
      "prepositions": {
        "out": [
          "The teacher read out the names of the winners. 老师宣读了获奖者的名字。",
          "Could you read the list out for everyone? 你能给大家念一下名单吗？"
        ],
        "about": [
          "I read about the accident in the newspaper. 我在报纸上读到了那起事故的报道。",
          "She loves reading about ancient history. 她喜欢阅读有关古代历史的书。"
        ],
        "up on": [
          "I need to read up on the company before the interview. 面试前我需要查阅一下这家公司的资料。",
          "He's been reading up on climate change. 他一直在研读有关气候变化的资料。"
        ],
        "into": [
          "Don't read too much into his silence. 别对他的沉默想太多。",
          "She tends to read meaning into every little thing. 她总是对每件小事都过度解读。"
        ]
      },
      "prepositionOrder": [
        "out",
        "about",
        "up on",
        "into"
      ],
      "zipf": 5.54,
      "senses": {
        "out": [
          {
            "zh": "大声读出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "读到关于……的内容",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up on": [
          {
            "zh": "研读；查阅资料",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "对……做过度解读",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "reason": {
      "display": "reason",
      "prepositions": {
        "with": [
          "It's impossible to reason with him when he's angry. 他生气的时候根本没法和他讲道理。",
          "I tried to reason with the angry customer. 我试着跟那位生气的顾客讲道理。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 5.32,
      "senses": {
        "with": [
          {
            "zh": "与……讲道理",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rebel": {
      "display": "rebel",
      "prepositions": {
        "against": [
          "Many teenagers rebel against authority. 许多青少年反抗权威。",
          "The people rebelled against the cruel king. 人民起来反抗残暴的国王。"
        ]
      },
      "prepositionOrder": [
        "against"
      ],
      "zipf": 4.08,
      "senses": {
        "against": [
          {
            "zh": "反抗；叛逆",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "reckon": {
      "display": "reckon",
      "prepositions": {
        "on": [
          "We didn't reckon on so many guests. 我们没料到会来这么多客人。",
          "You can't reckon on good weather in April. 四月份的好天气是指望不上的。"
        ],
        "with": [
          "If you hurt her, you'll have to reckon with me. 如果你伤害她，你就得跟我算账。",
          "She is a force to be reckoned with. 她是一股不可小觑的力量。"
        ]
      },
      "prepositionOrder": [
        "on",
        "with"
      ],
      "zipf": 3.76,
      "senses": {
        "on": [
          {
            "zh": "指望；预计",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "对付；考虑到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "recoil": {
      "display": "recoil",
      "prepositions": {
        "from": [
          "She recoiled from his touch. 他一碰她，她就往后缩。",
          "Most people recoil from the idea of violence. 大多数人对暴力的念头感到畏惧。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.19,
      "senses": {
        "from": [
          {
            "zh": "退缩；畏缩",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "recover": {
      "display": "recover",
      "prepositions": {
        "from": [
          "It took him months to recover from the injury. 他花了好几个月才从伤病中恢复。",
          "The economy is slowly recovering from the recession. 经济正在从衰退中慢慢复苏。",
          "She never fully recovered from the shock. 她始终没能从那次打击中完全恢复过来。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.29,
      "senses": {
        "from": [
          {
            "zh": "从……中恢复",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "reduce": {
      "display": "reduce",
      "prepositions": {
        "to": [
          "The price was reduced to twenty dollars. 价格降到了二十美元。",
          "The sad film reduced her to tears. 那部悲伤的电影让她哭了起来。",
          "The fire reduced the house to ashes. 大火把房子烧成了灰烬。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.73,
      "senses": {
        "to": [
          {
            "zh": "使减少到；使陷入（某种境地）",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "refer": {
      "display": "refer",
      "prepositions": {
        "to": [
          "She never referred to her time in prison. 她从未提起自己坐牢的那段日子。",
          "What does this word refer to? 这个词指的是什么？",
          "Please refer to the manual for details. 详细信息请参阅手册。",
          "You may refer to your notes during the exam. 考试时可以参考笔记。",
          "My doctor referred me to a specialist. 我的医生把我转诊给了一位专科医生。",
          "The case was referred to a higher court. 此案被移交给了上级法院。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.45,
      "senses": {
        "to": [
          {
            "zh": "提到；指的是",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "查阅；参考",
            "kind": "preposition",
            "examples": [
              2,
              3
            ]
          },
          {
            "zh": "把……转交给",
            "kind": "preposition",
            "examples": [
              4,
              5
            ]
          }
        ]
      }
    },
    "reflect": {
      "display": "reflect",
      "prepositions": {
        "on": [
          "Take some time to reflect on what you have learned. 花点时间反思一下你学到的东西。",
          "He reflected on his years in the army. 他回想起自己在部队的岁月。",
          "His behavior reflects badly on the whole school. 他的行为给整个学校抹了黑。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.39,
      "senses": {
        "on": [
          {
            "zh": "反思；思考",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "对……产生影响（尤指不好的）",
            "kind": "preposition",
            "examples": [
              2
            ]
          }
        ]
      }
    },
    "refrain": {
      "display": "refrain",
      "prepositions": {
        "from": [
          "Please refrain from smoking in the building. 请勿在大楼内吸烟。",
          "I refrained from saying what I really thought. 我忍住没说出真实想法。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.63,
      "senses": {
        "from": [
          {
            "zh": "避免；克制",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "regard": {
      "display": "regard",
      "prepositions": {
        "as": [
          "Many people regard him as a hero. 很多人把他视为英雄。",
          "This book is regarded as a classic. 这本书被视为经典之作。",
          "I have always regarded her as a close friend. 我一直把她当作亲密的朋友。"
        ]
      },
      "prepositionOrder": [
        "as"
      ],
      "zipf": 4.36,
      "senses": {
        "as": [
          {
            "zh": "把……视为",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "register": {
      "display": "register",
      "prepositions": {
        "for": [
          "You must register for the course by Friday. 你必须在周五之前报名这门课。",
          "Over a thousand runners registered for the race. 一千多名选手报名参加了比赛。"
        ],
        "with": [
          "All visitors must register with the front desk. 所有访客必须在前台登记。",
          "He registered with a local doctor. 他在当地一位医生那里登记就诊。"
        ]
      },
      "prepositionOrder": [
        "for",
        "with"
      ],
      "zipf": 4.59,
      "senses": {
        "for": [
          {
            "zh": "报名；登记参加",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "在……登记",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rein": {
      "display": "rein",
      "prepositions": {
        "in": [
          "The government must rein in spending. 政府必须控制开支。",
          "Try to rein in your temper. 试着控制一下你的脾气。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.37,
      "senses": {
        "in": [
          {
            "zh": "控制；约束",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rejoice": {
      "display": "rejoice",
      "prepositions": {
        "in": [
          "They rejoiced in their team's victory. 他们为球队的胜利而欢欣鼓舞。",
          "She rejoiced in her newfound freedom. 她为自己重获的自由而欣喜。"
        ],
        "at": [
          "The whole village rejoiced at the news. 全村人听到这个消息都很高兴。"
        ]
      },
      "prepositionOrder": [
        "in",
        "at"
      ],
      "zipf": 3.46,
      "senses": {
        "in": [
          {
            "zh": "为……而高兴",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "at": [
          {
            "zh": "因……欣喜",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "relate": {
      "display": "relate",
      "prepositions": {
        "to": [
          "The new rules relate to safety at work. 新规定与工作安全有关。",
          "I can't relate to people who hate music. 我无法理解讨厌音乐的人。",
          "Teenagers often find it hard to relate to their parents. 青少年常常觉得很难与父母相互理解。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.24,
      "senses": {
        "to": [
          {
            "zh": "与……有关；理解并同情",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "relieve": {
      "display": "relieve",
      "prepositions": {
        "of": [
          "The new assistant relieved me of a lot of work. 新助手替我分担了很多工作。",
          "He was relieved of his duties after the scandal. 丑闻发生后，他被解除了职务。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.77,
      "senses": {
        "of": [
          {
            "zh": "解除；免除",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rely": {
      "display": "rely",
      "prepositions": {
        "on": [
          "You can always rely on me. 你随时可以信赖我。",
          "Many farmers rely on rain for their crops. 许多农民靠雨水灌溉庄稼。",
          "We shouldn't rely too much on technology. 我们不应过度依赖技术。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.29,
      "senses": {
        "on": [
          {
            "zh": "依赖；信赖",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "remark": {
      "display": "remark",
      "prepositions": {
        "on": [
          "Everyone remarked on how well she looked. 大家都说她气色真好。",
          "He didn't remark on the change. 他对这个变化没作评论。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.66,
      "senses": {
        "on": [
          {
            "zh": "评论；谈论",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "remind": {
      "display": "remind",
      "prepositions": {
        "of": [
          "This song reminds me of my childhood. 这首歌让我想起了我的童年。",
          "You remind me of your father. 你让我想起了你父亲。"
        ],
        "about": [
          "Please remind me about the meeting tomorrow. 请提醒我明天开会。",
          "She reminded him about the bill. 她提醒他账单的事。"
        ]
      },
      "prepositionOrder": [
        "of",
        "about"
      ],
      "zipf": 4.37,
      "senses": {
        "of": [
          {
            "zh": "使想起",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "提醒（某事）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rent": {
      "display": "rent",
      "prepositions": {
        "out": [
          "They rent out their spare room to students. 他们把空房间租给学生。",
          "We rented the flat out while we were abroad. 我们出国期间把公寓租了出去。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.58,
      "senses": {
        "out": [
          {
            "zh": "出租",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "repent": {
      "display": "repent",
      "prepositions": {
        "of": [
          "He repented of his sins before he died. 他在临终前忏悔了自己的罪过。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 3.35,
      "senses": {
        "of": [
          {
            "zh": "悔悟；忏悔",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "reply": {
      "display": "reply",
      "prepositions": {
        "to": [
          "Have you replied to her email yet? 你回复她的邮件了吗？",
          "He didn't reply to my question. 他没有回答我的问题。",
          "Please reply to this letter within a week. 请在一周内回复此信。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.5,
      "senses": {
        "to": [
          {
            "zh": "回复；答复",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "report": {
      "display": "report",
      "prepositions": {
        "to": [
          "All new staff should report to the main office. 所有新员工都应到总办公室报到。",
          "She reports directly to the director. 她直接向总监汇报工作。"
        ],
        "on": [
          "The journalist reported on the elections. 这名记者报道了选举情况。",
          "Can you report on your progress next week? 你下周能汇报一下进展吗？"
        ]
      },
      "prepositionOrder": [
        "to",
        "on"
      ],
      "zipf": 5.32,
      "senses": {
        "to": [
          {
            "zh": "向……汇报；向……报到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "报道；汇报",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "resign": {
      "display": "resign",
      "prepositions": {
        "from": [
          "He resigned from his job last month. 他上个月辞职了。",
          "The minister resigned from the government. 这位部长从政府辞职了。"
        ],
        "to": [
          "She resigned herself to a long wait. 她只好无奈地接受长时间的等待。"
        ]
      },
      "prepositionOrder": [
        "from",
        "to"
      ],
      "zipf": 3.97,
      "senses": {
        "from": [
          {
            "zh": "辞去",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "听任；无奈接受",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "resort": {
      "display": "resort",
      "prepositions": {
        "to": [
          "They resorted to violence to get what they wanted. 他们诉诸暴力来达到目的。",
          "I hope we don't have to resort to legal action. 我希望我们不必诉诸法律手段。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.37,
      "senses": {
        "to": [
          {
            "zh": "诉诸；采取（手段）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "respond": {
      "display": "respond",
      "prepositions": {
        "to": [
          "The company has not yet responded to our complaint. 公司还没有回应我们的投诉。",
          "The patient responded well to the treatment. 病人对治疗反应良好。",
          "How should I respond to his message? 我该怎么回复他的消息？"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.53,
      "senses": {
        "to": [
          {
            "zh": "回应；对……有反应",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "rest": {
      "display": "rest",
      "prepositions": {
        "on": [
          "The future of the company rests on this deal. 公司的未来取决于这笔交易。",
          "His argument rests on weak evidence. 他的论点建立在薄弱的证据之上。"
        ],
        "with": [
          "The final decision rests with the manager. 最终决定权在经理手里。",
          "Responsibility rests with the parents. 责任在于父母。"
        ]
      },
      "prepositionOrder": [
        "on",
        "with"
      ],
      "zipf": 5.23,
      "senses": {
        "on": [
          {
            "zh": "依靠；取决于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "由……负责",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "restrict": {
      "display": "restrict",
      "prepositions": {
        "to": [
          "Entry is restricted to members only. 仅限会员入场。",
          "Try to restrict your sugar intake to one spoon a day. 尽量把糖的摄入量限制在每天一勺。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.8,
      "senses": {
        "to": [
          {
            "zh": "把……限制在",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "result": {
      "display": "result",
      "prepositions": {
        "in": [
          "The storm resulted in heavy damage. 暴风雨造成了严重损失。",
          "Poor planning resulted in delays. 计划不周导致了延误。"
        ],
        "from": [
          "His illness resulted from poor diet. 他的病是由饮食不良引起的。",
          "Most accidents result from carelessness. 大多数事故是粗心大意造成的。"
        ]
      },
      "prepositionOrder": [
        "in",
        "from"
      ],
      "zipf": 5.18,
      "senses": {
        "in": [
          {
            "zh": "导致",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "由……引起",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "retaliate": {
      "display": "retaliate",
      "prepositions": {
        "against": [
          "The country retaliated against the attack. 该国对这次袭击进行了报复。",
          "Workers who complain should not be retaliated against. 提出投诉的员工不应遭到报复。"
        ]
      },
      "prepositionOrder": [
        "against"
      ],
      "zipf": 3.1,
      "senses": {
        "against": [
          {
            "zh": "报复",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "retire": {
      "display": "retire",
      "prepositions": {
        "from": [
          "He retired from teaching at sixty. 他六十岁时从教学岗位退休。",
          "She retired from professional tennis last year. 她去年退出了职业网坛。"
        ],
        "to": [
          "They retired to a small village by the sea. 他们退休后搬到了海边的一个小村子。"
        ]
      },
      "prepositionOrder": [
        "from",
        "to"
      ],
      "zipf": 4.05,
      "senses": {
        "from": [
          {
            "zh": "从……退休；退出",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "退隐到",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "return": {
      "display": "return",
      "prepositions": {
        "to": [
          "She returned to her hometown after the war. 战后她回到了家乡。",
          "Let's return to the main point. 我们回到正题吧。",
          "Life slowly returned to normal. 生活逐渐恢复正常。"
        ],
        "from": [
          "He has just returned from a business trip. 他刚出差回来。"
        ]
      },
      "prepositionOrder": [
        "to",
        "from"
      ],
      "zipf": 5.19,
      "senses": {
        "to": [
          {
            "zh": "返回；回到（话题、状态）",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "from": [
          {
            "zh": "从……回来",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "revel": {
      "display": "revel",
      "prepositions": {
        "in": [
          "She reveled in the attention. 她陶醉于众人的关注之中。",
          "The children reveled in the freedom of summer. 孩子们尽情享受夏天的自由。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.11,
      "senses": {
        "in": [
          {
            "zh": "陶醉于；尽情享受",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "revert": {
      "display": "revert",
      "prepositions": {
        "to": [
          "After the holiday, we reverted to our usual routine. 假期结束后，我们又恢复了平常的作息。",
          "The land will revert to its original owner. 这块地将归还原主。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.35,
      "senses": {
        "to": [
          {
            "zh": "恢复；回到（原状）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "revolve": {
      "display": "revolve",
      "prepositions": {
        "around": [
          "The Earth revolves around the sun. 地球围绕太阳转动。",
          "Her whole life revolves around her children. 她的整个生活都围着孩子转。"
        ]
      },
      "prepositionOrder": [
        "around"
      ],
      "zipf": 3.24,
      "senses": {
        "around": [
          {
            "zh": "围绕……转动；以……为中心",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rid": {
      "display": "rid",
      "prepositions": {
        "of": [
          "We need to rid the house of mice. 我们需要清除房子里的老鼠。",
          "She wanted to rid herself of her bad habits. 她想改掉自己的坏习惯。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 4.5,
      "senses": {
        "of": [
          {
            "zh": "使摆脱；清除",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "ride": {
      "display": "ride",
      "prepositions": {
        "out": [
          "The company managed to ride out the crisis. 公司设法渡过了危机。",
          "We rode out the storm in a small cabin. 我们在一间小木屋里挨过了暴风雨。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.85,
      "senses": {
        "out": [
          {
            "zh": "安然度过（困境）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rifle": {
      "display": "rifle",
      "prepositions": {
        "through": [
          "Someone had rifled through my drawers. 有人翻过我的抽屉。",
          "She rifled through her bag for her keys. 她在包里翻找钥匙。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 4.18,
      "senses": {
        "through": [
          {
            "zh": "快速翻找",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "ring": {
      "display": "ring",
      "prepositions": {
        "up": [
          "I'll ring you up tomorrow morning. 我明天早上给你打电话。",
          "She rings up her mother every Sunday. 她每个星期天都给母亲打电话。"
        ],
        "back": [
          "Can I ring you back in ten minutes? 我十分钟后给你回电话好吗？",
          "He promised to ring back but never did. 他答应回电话，却一直没回。"
        ]
      },
      "prepositionOrder": [
        "up",
        "back"
      ],
      "zipf": 4.81,
      "senses": {
        "up": [
          {
            "zh": "打电话",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "回电话",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rip": {
      "display": "rip",
      "prepositions": {
        "off": [
          "That taxi driver ripped us off. 那个出租车司机宰了我们一笔。",
          "Tourists often get ripped off in this area. 游客在这一带经常被宰。"
        ],
        "up": [
          "She ripped up his letter in anger. 她愤怒地撕碎了他的信。",
          "He ripped the contract up and walked out. 他把合同撕掉后走了出去。"
        ]
      },
      "prepositionOrder": [
        "off",
        "up"
      ],
      "zipf": 4.26,
      "senses": {
        "off": [
          {
            "zh": "敲竹杠；诈骗",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "撕碎",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rise": {
      "display": "rise",
      "prepositions": {
        "above": [
          "She managed to rise above her difficult childhood. 她设法克服了艰难的童年经历。",
          "We must rise above petty arguments. 我们必须超越无谓的争吵。"
        ],
        "to": [
          "She always rises to the occasion. 她总能在关键时刻表现出色。",
          "Our team must rise to the challenge. 我们队必须勇敢迎接挑战。"
        ]
      },
      "prepositionOrder": [
        "above",
        "to"
      ],
      "zipf": 4.81,
      "senses": {
        "above": [
          {
            "zh": "超越；克服",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "起而应对（挑战）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rob": {
      "display": "rob",
      "prepositions": {
        "of": [
          "Two men robbed him of his wallet. 两名男子抢走了他的钱包。",
          "The injury robbed her of a place in the final. 伤病使她失去了决赛的资格。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 4.35,
      "senses": {
        "of": [
          {
            "zh": "抢劫；剥夺",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "roll": {
      "display": "roll",
      "prepositions": {
        "out": [
          "The company will roll out the new app next month. 公司下个月将推出新应用。",
          "Roll out the dough until it is thin. 把面团擀薄。"
        ],
        "over": [
          "The baby rolled over for the first time today. 宝宝今天第一次翻身。",
          "He rolled over and went back to sleep. 他翻了个身又睡着了。"
        ],
        "up": [
          "Roll up your sleeves before you wash the dishes. 洗碗前把袖子卷起来。",
          "He rolled up an hour late as usual. 他照常晚到了一个小时。"
        ],
        "in": [
          "Offers of help started rolling in. 援助的提议开始源源不断地涌来。"
        ]
      },
      "prepositionOrder": [
        "out",
        "over",
        "up",
        "in"
      ],
      "zipf": 4.75,
      "senses": {
        "out": [
          {
            "zh": "推出；铺开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "翻身",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "卷起；（人）到场",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "大量涌来",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "root": {
      "display": "root",
      "prepositions": {
        "for": [
          "We're all rooting for you! 我们都在为你加油！",
          "Which team are you rooting for? 你支持哪支队伍？"
        ],
        "out": [
          "The new manager promised to root out corruption. 新经理承诺要根除腐败。",
          "It's hard to root out old prejudices. 旧的偏见很难根除。"
        ]
      },
      "prepositionOrder": [
        "for",
        "out"
      ],
      "zipf": 4.41,
      "senses": {
        "for": [
          {
            "zh": "为……加油；支持",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "根除",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rope": {
      "display": "rope",
      "prepositions": {
        "in": [
          "I got roped in to help with the school fair. 我被拉去帮忙办学校义卖会。",
          "She roped her friends in to paint the house. 她拉朋友们来帮忙粉刷房子。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 4.06,
      "senses": {
        "in": [
          {
            "zh": "说服（某人）帮忙",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "round": {
      "display": "round",
      "prepositions": {
        "up": [
          "The farmer rounded up his sheep before the storm. 农夫在暴风雨来临前把羊群赶到一起。",
          "Police rounded up several suspects. 警方围捕了几名嫌疑人。",
          "Round the number up to the nearest ten. 把这个数向上取整到最接近的十位。"
        ],
        "off": [
          "We rounded off the evening with a walk by the river. 我们在河边散步，为这个夜晚画上圆满的句号。",
          "She rounded off her speech with a joke. 她用一个笑话结束了演讲。"
        ],
        "down": [
          "The price was rounded down to the nearest dollar. 价格被向下取整到最接近的整美元。"
        ]
      },
      "prepositionOrder": [
        "up",
        "off",
        "down"
      ],
      "zipf": 5.14,
      "senses": {
        "up": [
          {
            "zh": "聚拢；围捕",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "向上取整",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "off": [
          {
            "zh": "圆满结束",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "向下取整",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "rub": {
      "display": "rub",
      "prepositions": {
        "out": [
          "He rubbed out the wrong answer and wrote a new one. 他擦掉错误的答案，写了一个新的。",
          "Rub out the pencil marks before you hand it in. 交之前把铅笔痕迹擦掉。"
        ],
        "off on": [
          "I hope her good habits rub off on you. 我希望她的好习惯能影响到你。",
          "His enthusiasm rubbed off on the whole team. 他的热情感染了整个团队。"
        ],
        "in": [
          "I know I made a mistake, so don't rub it in. 我知道我犯了错，别再揭我伤疤了。"
        ]
      },
      "prepositionOrder": [
        "out",
        "off on",
        "in"
      ],
      "zipf": 3.97,
      "senses": {
        "out": [
          {
            "zh": "擦掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off on": [
          {
            "zh": "（品质等）感染；影响",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "反复提及（令人难堪的事）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "rule": {
      "display": "rule",
      "prepositions": {
        "out": [
          "The police have not ruled out murder. 警方尚未排除谋杀的可能。",
          "We can't rule out the possibility of rain. 我们不能排除下雨的可能。"
        ],
        "on": [
          "The court will rule on the case next week. 法院将于下周对此案作出裁决。",
          "The judge ruled on the matter quickly. 法官很快就此事作出了裁决。"
        ],
        "over": [
          "The king ruled over a vast empire. 这位国王统治着一个庞大的帝国。",
          "The family ruled over the region for centuries. 这个家族统治该地区长达数个世纪。"
        ]
      },
      "prepositionOrder": [
        "out",
        "on",
        "over"
      ],
      "zipf": 4.94,
      "senses": {
        "out": [
          {
            "zh": "排除",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "对……作出裁决",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "统治",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "run": {
      "display": "run",
      "prepositions": {
        "into": [
          "I ran into an old friend at the station. 我在车站偶遇了一位老朋友。",
          "The project ran into serious problems. 这个项目遇到了严重的问题。"
        ],
        "out of": [
          "We've run out of milk. 我们的牛奶喝完了。",
          "The printer is running out of ink. 打印机快没墨了。"
        ],
        "away": [
          "The boy ran away from home. 那个男孩离家出走了。",
          "You can't run away from your problems. 你不能逃避你的问题。"
        ],
        "over": [
          "The dog was nearly run over by a truck. 那条狗差点被卡车轧到。",
          "The meeting ran over by twenty minutes. 会议超时了二十分钟。"
        ],
        "for": [
          "She is running for mayor. 她正在竞选市长。",
          "He decided to run for president. 他决定竞选总统。"
        ],
        "across": [
          "I ran across an old photo of us yesterday. 我昨天偶然发现了一张我们的旧照片。",
          "She ran across the book in a secondhand shop. 她在一家二手书店偶然看到了那本书。"
        ],
        "through": [
          "Let's run through the plan once more. 我们再把计划过一遍。",
          "The actors ran through their lines before the show. 演出前演员们把台词过了一遍。"
        ],
        "down": [
          "My phone battery has run down. 我的手机没电了。",
          "He's always running down his own country. 他总是贬低自己的国家。"
        ],
        "off": [
          "The thief ran off with my bag. 小偷抢了我的包跑了。",
          "The dog ran off into the woods. 那条狗跑进了树林里。"
        ]
      },
      "prepositionOrder": [
        "into",
        "out of",
        "away",
        "over",
        "for",
        "across",
        "through",
        "down",
        "off"
      ],
      "zipf": 5.49,
      "senses": {
        "into": [
          {
            "zh": "偶遇；遇到（困难）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out of": [
          {
            "zh": "用完；耗尽",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "逃跑；逃避",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "碾过",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "超时",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "竞选",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "across": [
          {
            "zh": "偶然发现",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "快速过一遍；排练",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "（电池等）耗尽",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "贬低",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "逃走",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "rush": {
      "display": "rush",
      "prepositions": {
        "into": [
          "Don't rush into marriage. 不要仓促结婚。",
          "He rushed into a decision he later regretted. 他仓促做了一个后来令他后悔的决定。"
        ],
        "off": [
          "Sorry, I have to rush off to a meeting. 抱歉，我得赶去开会了。",
          "She rushed off without saying goodbye. 她没说再见就匆匆走了。"
        ]
      },
      "prepositionOrder": [
        "into",
        "off"
      ],
      "zipf": 4.48,
      "senses": {
        "into": [
          {
            "zh": "仓促行事",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "匆忙离开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "sail": {
      "display": "sail",
      "prepositions": {
        "through": [
          "She sailed through her driving test. 她轻轻松松通过了驾照考试。",
          "He sailed through the interview. 他顺利通过了面试。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 4.01,
      "senses": {
        "through": [
          {
            "zh": "轻松通过",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "save": {
      "display": "save",
      "prepositions": {
        "up": [
          "She is saving up for a new laptop. 她正在攒钱买新笔记本电脑。",
          "We saved up for years to buy this house. 我们攒了好多年钱才买下这栋房子。"
        ],
        "on": [
          "You can save on fuel by driving more slowly. 开慢一点可以省油。",
          "They moved to a smaller flat to save on rent. 为了省房租，他们搬到了一套更小的公寓。"
        ],
        "from": [
          "The seat belt saved him from serious injury. 安全带使他免受重伤。",
          "She saved the child from drowning. 她救了那个差点淹死的孩子。"
        ]
      },
      "prepositionOrder": [
        "up",
        "on",
        "from"
      ],
      "zipf": 5.14,
      "senses": {
        "up": [
          {
            "zh": "攒钱",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "节省（开支）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "使免于；拯救",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "scare": {
      "display": "scare",
      "prepositions": {
        "away": [
          "The noise scared the birds away. 噪音把鸟都吓跑了。"
        ],
        "off": [
          "The high prices scared off many buyers. 高昂的价格吓跑了许多买家。"
        ]
      },
      "prepositionOrder": [
        "away",
        "off"
      ],
      "zipf": 4.07,
      "senses": {
        "away": [
          {
            "zh": "吓跑",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "吓退；吓跑",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "scrape": {
      "display": "scrape",
      "prepositions": {
        "by": [
          "They scrape by on a small pension. 他们靠一点退休金勉强度日。"
        ],
        "through": [
          "He just scraped through the final exam. 他期末考试勉强及格。"
        ]
      },
      "prepositionOrder": [
        "by",
        "through"
      ],
      "zipf": 3.4,
      "senses": {
        "by": [
          {
            "zh": "勉强维持",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "through": [
          {
            "zh": "勉强通过",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "scream": {
      "display": "scream",
      "prepositions": {
        "at": [
          "Stop screaming at your little sister! 别冲你妹妹大喊大叫！"
        ],
        "for": [
          "The swimmer screamed for help. 游泳者尖叫着求救。"
        ]
      },
      "prepositionOrder": [
        "at",
        "for"
      ],
      "zipf": 4.14,
      "senses": {
        "at": [
          {
            "zh": "冲……尖叫",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "尖叫着要求",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "screw": {
      "display": "screw",
      "prepositions": {
        "up": [
          "I really screwed up the interview. 我把面试彻底搞砸了。",
          "Don't screw this up; it's our last chance. 别把事情搞砸了，这是我们最后的机会。",
          "He screwed up his eyes against the bright sun. 阳光刺眼，他眯起了眼睛。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.25,
      "senses": {
        "up": [
          {
            "zh": "搞砸",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "皱起（脸、眼睛）",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ]
      }
    },
    "scribble": {
      "display": "scribble",
      "prepositions": {
        "down": [
          "I scribbled down her phone number on my hand. 我把她的电话号码草草写在手上。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 2.73,
      "senses": {
        "down": [
          {
            "zh": "草草记下",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "scroll": {
      "display": "scroll",
      "prepositions": {
        "through": [
          "She scrolled through her messages on the bus. 她在公交车上翻看着消息。",
          "I wasted an hour scrolling through photos. 我刷照片浪费了一个小时。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 3.86,
      "senses": {
        "through": [
          {
            "zh": "滚动浏览",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "seal": {
      "display": "seal",
      "prepositions": {
        "off": [
          "Police sealed off the area after the explosion. 爆炸发生后，警方封锁了该区域。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 4.3,
      "senses": {
        "off": [
          {
            "zh": "封锁",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "search": {
      "display": "search",
      "prepositions": {
        "for": [
          "Rescue teams are still searching for survivors. 救援队仍在搜寻幸存者。",
          "I searched for my keys everywhere. 我到处找钥匙。"
        ],
        "through": [
          "He searched through his pockets for a coin. 他翻遍口袋找硬币。"
        ]
      },
      "prepositionOrder": [
        "for",
        "through"
      ],
      "zipf": 4.96,
      "senses": {
        "for": [
          {
            "zh": "寻找；搜寻",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "翻遍；仔细搜查",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "see": {
      "display": "see",
      "prepositions": {
        "off": [
          "My parents came to the airport to see me off. 我父母到机场来为我送行。",
          "We saw our guests off at the station. 我们在车站为客人送行。"
        ],
        "through": [
          "She saw through his excuse immediately. 她立刻就看穿了他的借口。",
          "Nobody was fooled; everyone could see through the trick. 没人上当，大家都识破了这个把戏。",
          "Once he starts a project, he always sees it through. 他一旦开始一个项目，总会坚持到底。",
          "We need someone who will see this reform through. 我们需要一个能把这项改革进行到底的人。"
        ],
        "to": [
          "Don't worry about the tickets; I'll see to them. 票的事别担心，我来处理。",
          "Could you see to the guests while I finish cooking? 我做完饭之前，你能招呼一下客人吗？"
        ],
        "about": [
          "I'll see about getting the heating fixed tomorrow. 我明天会安排人修暖气。",
          "We should see about booking a hotel soon. 我们应该尽快着手订酒店了。"
        ]
      },
      "prepositionOrder": [
        "off",
        "through",
        "to",
        "about"
      ],
      "zipf": 6.1,
      "senses": {
        "off": [
          {
            "zh": "为（某人）送行",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "看穿；识破",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "坚持完成（某事）",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "to": [
          {
            "zh": "负责处理；照料",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "处理；安排",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "seek": {
      "display": "seek",
      "prepositions": {
        "out": [
          "He sought out the best teacher in the city. 他找到了城里最好的老师。",
          "Tourists seek out quiet beaches away from the crowds. 游客们专门寻找远离人群的安静海滩。"
        ],
        "from": [
          "You should seek advice from a lawyer. 你应该向律师寻求建议。",
          "The charity seeks support from local businesses. 这家慈善机构向本地企业寻求支持。"
        ]
      },
      "prepositionOrder": [
        "out",
        "from"
      ],
      "zipf": 4.61,
      "senses": {
        "out": [
          {
            "zh": "找到；寻出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "向……寻求",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "seize": {
      "display": "seize",
      "prepositions": {
        "on": [
          "The press seized on his careless remark. 媒体抓住了他那句不经意的话大做文章。",
          "She seized on the chance to study abroad. 她抓住了出国留学的机会。"
        ],
        "up": [
          "The engine seized up in the cold. 发动机在严寒中卡死了。"
        ]
      },
      "prepositionOrder": [
        "on",
        "up"
      ],
      "zipf": 3.8,
      "senses": {
        "on": [
          {
            "zh": "抓住（机会、借口）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "（机器、关节）卡住；僵住",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sell": {
      "display": "sell",
      "prepositions": {
        "out": [
          "The concert tickets sold out in ten minutes. 演唱会门票十分钟就卖光了。",
          "Sorry, we've sold out of bread today. 抱歉，今天的面包已经卖完了。",
          "Fans accused the band of selling out. 歌迷们指责乐队为了钱出卖了原则。"
        ],
        "off": [
          "The company sold off its oldest factories. 公司变卖了最老的几家工厂。"
        ]
      },
      "prepositionOrder": [
        "out",
        "off"
      ],
      "zipf": 4.98,
      "senses": {
        "out": [
          {
            "zh": "卖光；售罄",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "背叛（原则）以谋利",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "off": [
          {
            "zh": "廉价出售；变卖",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "send": {
      "display": "send",
      "prepositions": {
        "for": [
          "The patient was worse, so they sent for a doctor. 病人情况恶化，于是他们派人去请医生。",
          "The king sent for his advisers. 国王召见了他的谋士。"
        ],
        "back": [
          "The soup was cold, so I sent it back. 汤是凉的，所以我把它退了回去。",
          "I sent back the shoes because they didn't fit. 鞋子不合脚，我就退回去了。"
        ],
        "off": [
          "Have you sent off your application yet? 你的申请寄出去了吗？",
          "The defender was sent off for a bad tackle. 那名后卫因恶意铲球被罚下场。"
        ],
        "out": [
          "We sent out invitations to all our friends. 我们给所有朋友都发了邀请。",
          "The tree is sending out new shoots. 这棵树正在长出新芽。"
        ]
      },
      "prepositionOrder": [
        "for",
        "back",
        "off",
        "out"
      ],
      "zipf": 5.11,
      "senses": {
        "for": [
          {
            "zh": "派人去请；召唤",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "退回；送回",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "寄出；发出",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "（体育比赛中）罚下场",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "发出；分发",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "sentence": {
      "display": "sentence",
      "prepositions": {
        "to": [
          "The judge sentenced him to ten years in prison. 法官判处他十年监禁。",
          "She was sentenced to community service. 她被判社区服务。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.58,
      "senses": {
        "to": [
          {
            "zh": "判处",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "separate": {
      "display": "separate",
      "prepositions": {
        "from": [
          "It's hard to separate fact from opinion in this article. 这篇文章里很难把事实和观点区分开来。",
          "The kittens were separated from their mother too early. 这些小猫过早地和母猫分开了。"
        ],
        "into": [
          "Separate the eggs into whites and yolks. 把鸡蛋的蛋清和蛋黄分开。"
        ]
      },
      "prepositionOrder": [
        "from",
        "into"
      ],
      "zipf": 4.83,
      "senses": {
        "from": [
          {
            "zh": "与……分开",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "分成",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "serve": {
      "display": "serve",
      "prepositions": {
        "as": [
          "The old church now serves as a library. 这座老教堂现在用作图书馆。",
          "She served as mayor for eight years. 她担任了八年市长。"
        ],
        "on": [
          "He serves on the board of several charities. 他是几家慈善机构的董事会成员。"
        ],
        "up": [
          "Grandma served up a huge dinner for the family. 奶奶为全家端上了一顿丰盛的晚餐。"
        ]
      },
      "prepositionOrder": [
        "as",
        "on",
        "up"
      ],
      "zipf": 4.85,
      "senses": {
        "as": [
          {
            "zh": "用作；担任",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "担任（委员会等）成员",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "端上（食物）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "set": {
      "display": "set",
      "prepositions": {
        "up": [
          "They set up a small business after graduation. 他们毕业后创办了一家小公司。",
          "The government has set up a committee to study the problem. 政府成立了一个委员会来研究这个问题。",
          "It took us an hour to set up the tent. 我们花了一个小时才把帐篷搭起来。",
          "Can you help me set up my new printer? 你能帮我安装新打印机吗？",
          "He claims that his partner set him up. 他声称是他的合伙人陷害了他。"
        ],
        "off": [
          "We set off early to avoid the traffic. 我们早早出发以避开堵车。",
          "The climbers set off before sunrise. 登山者在日出前就出发了。",
          "Burnt toast set off the smoke alarm. 烤焦的面包触发了烟雾报警器。",
          "His remark set off a heated argument. 他的话引发了一场激烈的争吵。"
        ],
        "out": [
          "The explorers set out for the mountains at dawn. 探险者们黎明时分向山区进发。",
          "She set out to prove them wrong. 她下定决心要证明他们错了。",
          "The book sets out to explain modern physics to beginners. 这本书旨在向初学者解释现代物理。",
          "The report sets out the main findings clearly. 这份报告清楚地阐述了主要发现。"
        ],
        "aside": [
          "Try to set aside some money every month. 尽量每个月存下一些钱。",
          "I set aside an hour each day for reading. 我每天留出一小时读书。"
        ],
        "back": [
          "The strike set the project back by several weeks. 罢工使项目延误了好几周。"
        ],
        "in": [
          "Winter set in early this year. 今年冬天来得早。",
          "Panic began to set in when the lights went out. 灯灭后，恐慌开始蔓延。"
        ],
        "about": [
          "He set about cleaning the whole house. 他开始打扫整栋房子。",
          "How should we set about solving this problem? 我们该如何着手解决这个问题？"
        ]
      },
      "prepositionOrder": [
        "up",
        "off",
        "out",
        "aside",
        "back",
        "in",
        "about"
      ],
      "zipf": 5.59,
      "senses": {
        "up": [
          {
            "zh": "建立；创办",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "安装；搭建",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          },
          {
            "zh": "陷害",
            "kind": "particle",
            "examples": [
              4
            ]
          }
        ],
        "off": [
          {
            "zh": "出发；动身",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "引发；触发",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "out": [
          {
            "zh": "出发；启程",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "着手；打算（做某事）",
            "kind": "particle",
            "examples": [
              1,
              2
            ]
          },
          {
            "zh": "阐述；陈列",
            "kind": "particle",
            "examples": [
              3
            ]
          }
        ],
        "aside": [
          {
            "zh": "留出；拨出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "延误；阻碍",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "（坏天气、情况等）开始并持续",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "开始做；着手",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "settle": {
      "display": "settle",
      "prepositions": {
        "down": [
          "He wants to settle down and start a family. 他想安定下来成家。",
          "Settle down, children, the lesson is starting. 孩子们安静下来，要上课了。"
        ],
        "in": [
          "It took her a few weeks to settle in at the new school. 她花了几个星期才适应新学校。"
        ],
        "for": [
          "We couldn't find a hotel, so we settled for a small inn. 我们找不到酒店，只好将就住在一家小旅馆。",
          "Don't settle for less than you deserve. 别满足于低于你应得的东西。"
        ],
        "on": [
          "After much discussion, they settled on a name for the baby. 经过反复讨论，他们终于给孩子定了名字。"
        ],
        "up": [
          "Let me settle up with the waiter. 我去跟服务员结账。"
        ]
      },
      "prepositionOrder": [
        "down",
        "in",
        "for",
        "on",
        "up"
      ],
      "zipf": 4.37,
      "senses": {
        "down": [
          {
            "zh": "安定下来；平静下来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "适应（新环境）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "勉强接受",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "决定；选定",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "结账；清偿",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "shake": {
      "display": "shake",
      "prepositions": {
        "off": [
          "I can't shake off this cold. 我的感冒怎么也好不了。",
          "The thief managed to shake off the police. 小偷成功甩掉了警察。"
        ],
        "up": [
          "The new manager shook up the whole department. 新经理对整个部门进行了大改组。",
          "The accident really shook him up. 那场事故让他深受震动。"
        ]
      },
      "prepositionOrder": [
        "off",
        "up"
      ],
      "zipf": 4.33,
      "senses": {
        "off": [
          {
            "zh": "摆脱；甩掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "重组；使震惊",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "share": {
      "display": "share",
      "prepositions": {
        "with": [
          "He shared his lunch with a hungry classmate. 他把午饭分给了一个饿肚子的同学。",
          "Thank you for sharing your story with us. 谢谢你和我们分享你的故事。"
        ],
        "in": [
          "All employees share in the profits of the company. 全体员工都分享公司的利润。"
        ],
        "out": [
          "The teacher shared out the sweets among the children. 老师把糖果分给了孩子们。"
        ]
      },
      "prepositionOrder": [
        "with",
        "in",
        "out"
      ],
      "zipf": 5.2,
      "senses": {
        "with": [
          {
            "zh": "与……分享",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "分享；分担",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "分配；分发",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "shelter": {
      "display": "shelter",
      "prepositions": {
        "from": [
          "We sheltered from the rain under a bridge. 我们在桥下避雨。",
          "The hut shelters climbers from the wind. 这间小屋为登山者遮挡风寒。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.25,
      "senses": {
        "from": [
          {
            "zh": "躲避",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "shift": {
      "display": "shift",
      "prepositions": {
        "to": [
          "Public attention has shifted to the economy. 公众的注意力已转向经济问题。",
          "The company shifted to online sales. 公司转向了网上销售。"
        ],
        "from": [
          "The focus has shifted from quantity to quality. 重点已从数量转向质量。"
        ]
      },
      "prepositionOrder": [
        "to",
        "from"
      ],
      "zipf": 4.57,
      "senses": {
        "to": [
          {
            "zh": "转向；转移到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "从……转移",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "shoot": {
      "display": "shoot",
      "prepositions": {
        "down": [
          "The plane was shot down over the sea. 那架飞机在海上被击落。",
          "My boss shot down every idea I suggested. 我提的每个主意都被老板否决了。"
        ],
        "up": [
          "Prices shot up after the storm. 暴风雨过后物价飞涨。",
          "Your son has really shot up this year. 你儿子今年真是长高了不少。"
        ],
        "at": [
          "The hunter shot at the deer but missed. 猎人朝鹿开了一枪，但没打中。"
        ],
        "for": [
          "We're shooting for a finish date in June. 我们争取在六月完工。"
        ]
      },
      "prepositionOrder": [
        "down",
        "up",
        "at",
        "for"
      ],
      "zipf": 4.73,
      "senses": {
        "down": [
          {
            "zh": "击落；驳回",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "猛增；迅速长高",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "at": [
          {
            "zh": "向……射击",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "力争；追求",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "shop": {
      "display": "shop",
      "prepositions": {
        "around": [
          "It pays to shop around for car insurance. 买车险时货比三家是值得的。"
        ],
        "for": [
          "We went shopping for a new sofa. 我们去逛店挑新沙发了。"
        ]
      },
      "prepositionOrder": [
        "around",
        "for"
      ],
      "zipf": 4.88,
      "senses": {
        "around": [
          {
            "zh": "货比三家",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "购买；选购",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "shout": {
      "display": "shout",
      "prepositions": {
        "at": [
          "Please don't shout at me. 请不要冲我大喊。"
        ],
        "down": [
          "The speaker was shouted down by angry protesters. 演讲者被愤怒的抗议者的喊声压了下去。"
        ],
        "out": [
          "She shouted out the answer before anyone else. 她抢在所有人前面大声喊出了答案。"
        ],
        "for": [
          "We heard someone shouting for help. 我们听见有人在大声呼救。"
        ]
      },
      "prepositionOrder": [
        "at",
        "down",
        "out",
        "for"
      ],
      "zipf": 4.06,
      "senses": {
        "at": [
          {
            "zh": "冲……叫嚷",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "用喊声压倒（某人）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "大声喊出",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "大声呼喊（求助）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "show": {
      "display": "show",
      "prepositions": {
        "off": [
          "He loves to show off his new car. 他喜欢炫耀自己的新车。",
          "Stop showing off and just answer the question. 别卖弄了，直接回答问题吧。"
        ],
        "up": [
          "Only half of the students showed up for the lecture. 只有一半学生来听了讲座。",
          "He showed up late again this morning. 他今天早上又迟到了。",
          "The young player showed up the veterans on the team. 这名年轻球员让队里的老将们相形见绌。",
          "She felt her brother had shown her up in front of her friends. 她觉得弟弟当着朋友的面让她下不来台。"
        ],
        "around": [
          "Let me show you around the office. 我带你参观一下办公室吧。",
          "A student volunteer showed the visitors around the campus. 一名学生志愿者带访客参观了校园。"
        ],
        "in": [
          "The secretary showed us in and offered us tea. 秘书把我们领进来，还给我们倒了茶。"
        ]
      },
      "prepositionOrder": [
        "off",
        "up",
        "around",
        "in"
      ],
      "zipf": 5.68,
      "senses": {
        "off": [
          {
            "zh": "炫耀",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "出现；到场",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "使难堪；使相形见绌",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "around": [
          {
            "zh": "带（某人）参观",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "领（某人）进来",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "shrink": {
      "display": "shrink",
      "prepositions": {
        "from": [
          "He never shrinks from hard work. 他从不逃避艰苦的工作。",
          "She did not shrink from telling the truth. 她毫不回避地说出了真相。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 3.73,
      "senses": {
        "from": [
          {
            "zh": "退缩；回避",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "shrug": {
      "display": "shrug",
      "prepositions": {
        "off": [
          "He shrugged off the criticism. 他对批评不以为然。",
          "She shrugged off her injury and kept playing. 她不顾伤痛继续比赛。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 3.3,
      "senses": {
        "off": [
          {
            "zh": "对……不屑一顾；摆脱",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "shut": {
      "display": "shut",
      "prepositions": {
        "down": [
          "The factory shut down last year. 这家工厂去年倒闭了。",
          "Please shut down your computer before you leave. 离开前请把电脑关机。"
        ],
        "up": [
          "Just shut up and listen for a moment! 闭嘴，听一会儿！"
        ],
        "off": [
          "They shut off the water to repair the pipe. 他们停水修理管道。"
        ],
        "out": [
          "Heavy curtains shut out the noise from the street. 厚窗帘隔绝了街上的噪音。",
          "He shuts out everyone who tries to help him. 他把所有想帮他的人都拒之门外。"
        ],
        "in": [
          "We shut the dog in while the guests were here. 客人在的时候，我们把狗关在了屋里。"
        ]
      },
      "prepositionOrder": [
        "down",
        "up",
        "off",
        "out",
        "in"
      ],
      "zipf": 4.78,
      "senses": {
        "down": [
          {
            "zh": "关闭；停业",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "住口",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "切断；关掉",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "把……关在外面；排斥",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "把……关在里面",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "shy": {
      "display": "shy",
      "prepositions": {
        "away from": [
          "Many people shy away from talking about money. 许多人都回避谈钱。",
          "The company has shied away from risky investments. 公司一直避开高风险投资。"
        ]
      },
      "prepositionOrder": [
        "away from"
      ],
      "zipf": 4.16,
      "senses": {
        "away from": [
          {
            "zh": "回避；躲开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "side": {
      "display": "side",
      "prepositions": {
        "with": [
          "My mother always sides with my sister. 我妈总是站在我姐那边。",
          "The court sided with the workers. 法院支持了工人一方。"
        ],
        "against": [
          "Most of the members sided against the proposal. 大多数成员都反对这项提案。"
        ]
      },
      "prepositionOrder": [
        "with",
        "against"
      ],
      "zipf": 5.5,
      "senses": {
        "with": [
          {
            "zh": "支持；站在……一边",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "反对；站在……对立面",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sift": {
      "display": "sift",
      "prepositions": {
        "through": [
          "Investigators sifted through the evidence. 调查人员仔细筛查了证据。",
          "I spent hours sifting through old emails. 我花了好几个小时翻查旧邮件。"
        ]
      },
      "prepositionOrder": [
        "through"
      ],
      "zipf": 3.02,
      "senses": {
        "through": [
          {
            "zh": "仔细筛查",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "sign": {
      "display": "sign",
      "prepositions": {
        "up for": [
          "I signed up for a Spanish course. 我报名参加了一门西班牙语课程。",
          "Over a hundred people signed up for the race. 有一百多人报名参加了这场赛跑。"
        ],
        "in": [
          "Visitors must sign in at the front desk. 访客必须在前台签到。",
          "You need to sign in to see your messages. 你需要登录才能查看消息。"
        ],
        "out": [
          "Remember to sign out when you leave the lab. 离开实验室时记得签退。"
        ],
        "off": [
          "The host signed off with a warm goodbye. 主持人亲切地道别后结束了节目。"
        ],
        "off on": [
          "The director has to sign off on the budget. 预算必须由主管签字批准。"
        ],
        "over": [
          "He signed the house over to his daughter. 他把房子过户给了女儿。"
        ]
      },
      "prepositionOrder": [
        "up for",
        "in",
        "out",
        "off",
        "off on",
        "over"
      ],
      "zipf": 5.08,
      "senses": {
        "up for": [
          {
            "zh": "报名参加",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "签到；登录",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "签退；退出登录",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "结束（广播、信件等）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off on": [
          {
            "zh": "批准；签字同意",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "转让（财产等）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "simmer": {
      "display": "simmer",
      "prepositions": {
        "down": [
          "Wait until he simmers down before you talk to him. 等他冷静下来再跟他说。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 3.27,
      "senses": {
        "down": [
          {
            "zh": "平静下来",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sing": {
      "display": "sing",
      "prepositions": {
        "along": [
          "Everyone sang along to the old songs. 大家都跟着老歌一起唱。"
        ],
        "along with": [
          "The children sang along with the radio. 孩子们跟着收音机一起唱。"
        ]
      },
      "prepositionOrder": [
        "along",
        "along with"
      ],
      "zipf": 4.54,
      "senses": {
        "along": [
          {
            "zh": "跟着唱",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "along with": [
          {
            "zh": "跟着……一起唱",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "single": {
      "display": "single",
      "prepositions": {
        "out": [
          "The teacher singled him out for praise. 老师单单表扬了他。",
          "Why was I singled out for criticism? 为什么偏偏挑出我来批评？"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 5.41,
      "senses": {
        "out": [
          {
            "zh": "挑出；选出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "sink": {
      "display": "sink",
      "prepositions": {
        "in": [
          "It took a while for the news to sink in. 过了好一会儿，大家才真正明白这个消息。",
          "The fact that she had won still hadn't sunk in. 她还没意识到自己赢了。"
        ],
        "into": [
          "He sank into a deep depression. 他陷入了深深的抑郁。",
          "She sank into the soft armchair. 她陷进了柔软的扶手椅里。"
        ]
      },
      "prepositionOrder": [
        "in",
        "into"
      ],
      "zipf": 4.21,
      "senses": {
        "in": [
          {
            "zh": "被充分理解",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "陷入；深陷",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "sit": {
      "display": "sit",
      "prepositions": {
        "down": [
          "Please sit down and make yourself comfortable. 请坐，别拘束。",
          "We sat down to discuss the plan. 我们坐下来讨论这个计划。"
        ],
        "back": [
          "Just sit back and enjoy the show. 你只管放松欣赏演出吧。",
          "We can't just sit back and wait for things to change. 我们不能坐等事情自己改变。"
        ],
        "up": [
          "The patient was well enough to sit up in bed. 病人已经好到可以在床上坐起来了。",
          "We sat up late talking about the old days. 我们坐着聊往事聊到很晚。"
        ],
        "in on": [
          "May I sit in on your class tomorrow? 我明天可以旁听你的课吗？"
        ],
        "through": [
          "We had to sit through a three hour meeting. 我们不得不熬过一场三小时的会议。",
          "I can't sit through another boring film. 我受不了再看完一部无聊的电影。"
        ],
        "on": [
          "She sits on the city council. 她是市议会的成员。"
        ],
        "for": [
          "He will sit for the bar exam next spring. 他明年春天要参加律师资格考试。"
        ]
      },
      "prepositionOrder": [
        "down",
        "back",
        "up",
        "in on",
        "through",
        "on",
        "for"
      ],
      "zipf": 4.9,
      "senses": {
        "down": [
          {
            "zh": "坐下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "放松；袖手旁观",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "坐起来；熬夜",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in on": [
          {
            "zh": "旁听",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "through": [
          {
            "zh": "耐着性子看完或听完",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "担任（委员会）成员",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "参加（考试）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "size": {
      "display": "size",
      "prepositions": {
        "up": [
          "The two boxers sized each other up. 两名拳击手互相打量着对方。",
          "She quickly sized up the situation. 她迅速判断了形势。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 5.13,
      "senses": {
        "up": [
          {
            "zh": "估量；打量",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "sketch": {
      "display": "sketch",
      "prepositions": {
        "out": [
          "She sketched out a plan on a napkin. 她在餐巾纸上草拟了一个计划。",
          "Let me sketch out the main ideas first. 我先简要讲一下主要思路。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.04,
      "senses": {
        "out": [
          {
            "zh": "草拟；概述",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "skip": {
      "display": "skip",
      "prepositions": {
        "over": [
          "You can skip over the introduction. 你可以跳过引言部分。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 4.21,
      "senses": {
        "over": [
          {
            "zh": "略过；跳过",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "slave": {
      "display": "slave",
      "prepositions": {
        "away": [
          "She slaved away in the kitchen all afternoon. 她整个下午都在厨房里辛苦忙碌。"
        ]
      },
      "prepositionOrder": [
        "away"
      ],
      "zipf": 4.31,
      "senses": {
        "away": [
          {
            "zh": "辛苦工作",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sleep": {
      "display": "sleep",
      "prepositions": {
        "in": [
          "I usually sleep in on Sundays. 我星期天通常睡懒觉。",
          "Sorry I'm late; I slept in. 对不起我迟到了，我睡过头了。"
        ],
        "on": [
          "It's a big decision, so let me sleep on it. 这是个重大决定，让我考虑一晚再说。"
        ],
        "off": [
          "He went to bed early to sleep off his headache. 他早早上床，想睡一觉缓解头痛。"
        ],
        "through": [
          "She slept through the whole storm. 她一觉睡过了整场暴风雨。",
          "I slept through my alarm this morning. 我今天早上没听见闹钟，一直睡着。"
        ],
        "over": [
          "Can my friend sleep over on Friday? 我朋友星期五可以在我们家过夜吗？"
        ]
      },
      "prepositionOrder": [
        "in",
        "on",
        "off",
        "through",
        "over"
      ],
      "zipf": 5.05,
      "senses": {
        "in": [
          {
            "zh": "睡懒觉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "把……留到第二天再决定",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "用睡觉消除（不适）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "through": [
          {
            "zh": "睡过（某段时间或声响）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "在别人家过夜",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "slip": {
      "display": "slip",
      "prepositions": {
        "away": [
          "She slipped away before the speeches began. 她在演讲开始前悄悄溜走了。",
          "The afternoon slipped away while we chatted. 我们聊着聊着，一下午就过去了。"
        ],
        "up": [
          "Someone slipped up and sent the wrong file. 有人弄错了，发错了文件。"
        ],
        "out": [
          "The secret just slipped out during dinner. 吃饭时一不留神秘密就说漏了嘴。",
          "I slipped out for a coffee during the break. 休息时我溜出去喝了杯咖啡。"
        ],
        "into": [
          "He slipped into the room without a sound. 他悄无声息地溜进了房间。",
          "The patient slipped into a coma. 病人陷入了昏迷。"
        ],
        "on": [
          "I slipped on the ice and hurt my wrist. 我在冰上滑倒，伤了手腕。"
        ]
      },
      "prepositionOrder": [
        "away",
        "up",
        "out",
        "into",
        "on"
      ],
      "zipf": 4.28,
      "senses": {
        "away": [
          {
            "zh": "悄悄离开；（时间）流逝",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "出差错",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "说漏嘴；溜出去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "悄悄进入；陷入",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "在……上滑倒",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "slow": {
      "display": "slow",
      "prepositions": {
        "down": [
          "Slow down! You're driving too fast. 慢一点！你开得太快了。",
          "The economy is slowing down this year. 今年经济增长正在放缓。",
          "The doctor told him to slow down and rest more. 医生叫他放慢生活节奏，多休息。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.85,
      "senses": {
        "down": [
          {
            "zh": "减速；放慢",
            "kind": "particle",
            "examples": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    "smell": {
      "display": "smell",
      "prepositions": {
        "of": [
          "The kitchen smelled of fresh bread. 厨房里飘着新鲜面包的香味。",
          "His coat smells of smoke. 他的外套有一股烟味。"
        ],
        "out": [
          "The dogs smelled out the hidden drugs. 警犬嗅出了藏起来的毒品。"
        ]
      },
      "prepositionOrder": [
        "of",
        "out"
      ],
      "zipf": 4.49,
      "senses": {
        "of": [
          {
            "zh": "有……的气味",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "用气味寻找出；察觉",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "smile": {
      "display": "smile",
      "prepositions": {
        "at": [
          "The baby smiled at me. 宝宝冲我笑了。",
          "She smiled at the memory. 想起那段回忆，她笑了。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 4.64,
      "senses": {
        "at": [
          {
            "zh": "对……微笑",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "smooth": {
      "display": "smooth",
      "prepositions": {
        "over": [
          "She tried to smooth over the disagreement between them. 她试图缓和他们之间的分歧。"
        ],
        "out": [
          "He smoothed out the creases in his shirt. 他把衬衫上的褶皱抚平。"
        ]
      },
      "prepositionOrder": [
        "over",
        "out"
      ],
      "zipf": 4.4,
      "senses": {
        "over": [
          {
            "zh": "缓和；平息",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "弄平；消除",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "snap": {
      "display": "snap",
      "prepositions": {
        "at": [
          "I'm sorry I snapped at you this morning. 对不起，我今天早上冲你发火了。"
        ],
        "out of": [
          "Come on, snap out of it! 行了，振作起来吧！",
          "She needs to snap out of this bad mood. 她得摆脱这种坏情绪。"
        ],
        "up": [
          "The cheap tickets were snapped up in minutes. 便宜的票几分钟就被抢光了。"
        ]
      },
      "prepositionOrder": [
        "at",
        "out of",
        "up"
      ],
      "zipf": 4.21,
      "senses": {
        "at": [
          {
            "zh": "厉声说话；冲……发火",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out of": [
          {
            "zh": "从（情绪中）摆脱出来",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "抢购",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sneak": {
      "display": "sneak",
      "prepositions": {
        "in": [
          "We sneaked in through the back door. 我们从后门溜了进去。"
        ],
        "out": [
          "The teenager sneaked out after his parents went to bed. 那个少年等父母睡了就溜了出去。"
        ],
        "up on": [
          "Don't sneak up on me like that! 别那样悄悄靠近吓我！"
        ]
      },
      "prepositionOrder": [
        "in",
        "out",
        "up on"
      ],
      "zipf": 3.99,
      "senses": {
        "in": [
          {
            "zh": "溜进",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "溜出",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up on": [
          {
            "zh": "悄悄走近",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "soak": {
      "display": "soak",
      "prepositions": {
        "up": [
          "The towel soaked up the water. 毛巾吸干了水。",
          "We spent the day soaking up the sun. 我们整天都在尽情享受阳光。"
        ],
        "in": [
          "Soak the beans in water overnight. 把豆子在水里泡一夜。"
        ]
      },
      "prepositionOrder": [
        "up",
        "in"
      ],
      "zipf": 3.61,
      "senses": {
        "up": [
          {
            "zh": "吸收；尽情享受",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "浸泡在",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sober": {
      "display": "sober",
      "prepositions": {
        "up": [
          "He drank strong coffee to sober up. 他喝浓咖啡来醒酒。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.94,
      "senses": {
        "up": [
          {
            "zh": "醒酒",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sort": {
      "display": "sort",
      "prepositions": {
        "out": [
          "Don't worry, we'll sort it out tomorrow. 别担心，我们明天会解决的。",
          "It took weeks to sort out the confusion over the contract. 花了好几周才理清合同上的混乱。",
          "I need to sort out my old clothes. 我得整理一下我的旧衣服。"
        ],
        "through": [
          "She sorted through the letters looking for the bill. 她翻遍了信件寻找那张账单。"
        ]
      },
      "prepositionOrder": [
        "out",
        "through"
      ],
      "zipf": 5.0,
      "senses": {
        "out": [
          {
            "zh": "解决；处理",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "整理；分类",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "through": [
          {
            "zh": "翻查；分拣",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sound": {
      "display": "sound",
      "prepositions": {
        "out": [
          "I'll sound out the manager before we make a proposal. 我们提建议之前，我先探探经理的口风。",
          "They sounded him out about joining the team. 他们试探他是否愿意加入团队。"
        ],
        "like": [
          "That sounds like a great idea. 这听起来是个好主意。",
          "You sound like you have a cold. 听你的声音好像感冒了。"
        ],
        "off": [
          "He is always sounding off about the government. 他总是对政府大放厥词。"
        ]
      },
      "prepositionOrder": [
        "out",
        "like",
        "off"
      ],
      "zipf": 5.15,
      "senses": {
        "out": [
          {
            "zh": "试探（意见）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "like": [
          {
            "zh": "听起来像",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "大发议论；发牢骚",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "space": {
      "display": "space",
      "prepositions": {
        "out": [
          "Sorry, I spaced out for a minute. What did you say? 抱歉，我刚才走神了。你说什么？",
          "Space out the plants so they have room to grow. 把植物间隔开，让它们有生长的空间。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 5.23,
      "senses": {
        "out": [
          {
            "zh": "走神；隔开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "spark": {
      "display": "spark",
      "prepositions": {
        "off": [
          "The decision sparked off protests across the country. 这一决定在全国引发了抗议。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 3.99,
      "senses": {
        "off": [
          {
            "zh": "引发",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "speak": {
      "display": "speak",
      "prepositions": {
        "up": [
          "Could you speak up? I can't hear you at the back. 你能大声点吗？我在后面听不见。",
          "If you disagree, you should speak up. 如果你不同意，就应该说出来。"
        ],
        "out against": [
          "Many doctors spoke out against the new policy. 许多医生公开反对这项新政策。",
          "She was brave enough to speak out against injustice. 她有勇气公开反对不公。"
        ],
        "for": [
          "I can't speak for the others, but I'm happy with it. 我不能代表别人，但我自己很满意。"
        ],
        "of": [
          "He often speaks of his childhood in the village. 他常常谈起自己在村里的童年。"
        ],
        "to": [
          "I need to speak to the manager. 我需要和经理谈谈。",
          "Have you spoken to your parents about this? 这事你跟父母谈过了吗？"
        ]
      },
      "prepositionOrder": [
        "up",
        "out against",
        "for",
        "of",
        "to"
      ],
      "zipf": 5.03,
      "senses": {
        "up": [
          {
            "zh": "大声点说",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "大胆说出（意见）",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "out against": [
          {
            "zh": "公开反对",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "代表……讲话",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "of": [
          {
            "zh": "谈到；提及",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "与……交谈",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "specialize": {
      "display": "specialize",
      "prepositions": {
        "in": [
          "She specializes in children's heart surgery. 她专攻儿童心脏外科。",
          "The shop specializes in second hand books. 这家店专营二手书。"
        ]
      },
      "prepositionOrder": [
        "in"
      ],
      "zipf": 3.28,
      "senses": {
        "in": [
          {
            "zh": "专攻；专门从事",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "speculate": {
      "display": "speculate",
      "prepositions": {
        "about": [
          "Reporters speculated about the reasons for his departure. 记者们对他离职的原因作了种种猜测。"
        ],
        "on": [
          "He lost a fortune speculating on the stock market. 他炒股亏了一大笔钱。"
        ]
      },
      "prepositionOrder": [
        "about",
        "on"
      ],
      "zipf": 3.48,
      "senses": {
        "about": [
          {
            "zh": "推测；猜测",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "投机；推测",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "speed": {
      "display": "speed",
      "prepositions": {
        "up": [
          "We need to speed up the process. 我们需要加快进度。",
          "The car speeded up as it left the town. 汽车驶出小镇后加快了速度。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 5.0,
      "senses": {
        "up": [
          {
            "zh": "加快；加速",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "spell": {
      "display": "spell",
      "prepositions": {
        "out": [
          "The contract spells out the rules clearly. 合同明确规定了各项规则。",
          "Do I have to spell it out for you? 难道还要我给你讲得清清楚楚吗？"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.37,
      "senses": {
        "out": [
          {
            "zh": "详细说明；讲清楚",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "spend": {
      "display": "spend",
      "prepositions": {
        "on": [
          "She spends too much money on clothes. 她在衣服上花钱太多。",
          "We spent a lot of time on this project. 我们在这个项目上花了很多时间。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.97,
      "senses": {
        "on": [
          {
            "zh": "在……上花费",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "spill": {
      "display": "spill",
      "prepositions": {
        "over": [
          "The crowd spilled over into the street. 人群涌到了街上。",
          "Their argument spilled over into the next meeting. 他们的争论延续到了下一次会议。"
        ],
        "on": [
          "I spilled coffee on my shirt. 我把咖啡洒在了衬衫上。"
        ]
      },
      "prepositionOrder": [
        "over",
        "on"
      ],
      "zipf": 3.84,
      "senses": {
        "over": [
          {
            "zh": "溢出；蔓延",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "洒在……上",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "spin": {
      "display": "spin",
      "prepositions": {
        "off": [
          "The firm spun off its software division. 公司把软件部门分拆了出去。"
        ],
        "out": [
          "The car spun out on the wet road. 汽车在湿滑的路上失控打转。"
        ]
      },
      "prepositionOrder": [
        "off",
        "out"
      ],
      "zipf": 4.38,
      "senses": {
        "off": [
          {
            "zh": "分拆出（公司）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "（车辆）失控打转",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "splash": {
      "display": "splash",
      "prepositions": {
        "out on": [
          "We splashed out on a luxury holiday. 我们大手笔地度了一个豪华假期。"
        ]
      },
      "prepositionOrder": [
        "out on"
      ],
      "zipf": 3.85,
      "senses": {
        "out on": [
          {
            "zh": "大肆花钱买",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "split": {
      "display": "split",
      "prepositions": {
        "up": [
          "They split up after five years together. 他们在一起五年后分手了。",
          "Let's split up and search both floors. 我们分头去搜两层楼吧。"
        ],
        "into": [
          "The teacher split the class into small groups. 老师把全班分成了几个小组。",
          "The book is split into three parts. 这本书分为三个部分。"
        ]
      },
      "prepositionOrder": [
        "up",
        "into"
      ],
      "zipf": 4.65,
      "senses": {
        "up": [
          {
            "zh": "分手；分开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "分成",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "spread": {
      "display": "spread",
      "prepositions": {
        "out": [
          "The search party spread out across the field. 搜索队在田野里分散开来。",
          "She spread the map out on the table. 她把地图摊在桌上。"
        ],
        "to": [
          "The fire quickly spread to the next building. 火势迅速蔓延到了隔壁楼。",
          "The news spread to every corner of the town. 消息传遍了镇上的每个角落。"
        ]
      },
      "prepositionOrder": [
        "out",
        "to"
      ],
      "zipf": 4.81,
      "senses": {
        "out": [
          {
            "zh": "散开；展开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "蔓延到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "spring": {
      "display": "spring",
      "prepositions": {
        "up": [
          "New cafes are springing up all over the city. 新咖啡馆在全城如雨后春笋般涌现。"
        ],
        "from": [
          "His interest in science sprang from a childhood visit to a museum. 他对科学的兴趣源于小时候的一次博物馆参观。",
          "Where did you spring from? 你是从哪儿冒出来的？"
        ],
        "on": [
          "I'm sorry to spring this on you so late. 抱歉这么晚才突然告诉你这件事。"
        ]
      },
      "prepositionOrder": [
        "up",
        "from",
        "on"
      ],
      "zipf": 4.92,
      "senses": {
        "up": [
          {
            "zh": "涌现；突然出现",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "from": [
          {
            "zh": "源自；突然出现",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "突然告诉；突然提出",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "spy": {
      "display": "spy",
      "prepositions": {
        "on": [
          "He suspected his neighbours were spying on him. 他怀疑邻居在暗中监视他。",
          "The app was secretly spying on its users. 这个应用在偷偷监视用户。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.24,
      "senses": {
        "on": [
          {
            "zh": "暗中监视",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "square": {
      "display": "square",
      "prepositions": {
        "with": [
          "His story doesn't square with the facts. 他的说法与事实不符。"
        ],
        "up": [
          "Let's square up before we leave. 我们走之前把账结清吧。"
        ]
      },
      "prepositionOrder": [
        "with",
        "up"
      ],
      "zipf": 4.84,
      "senses": {
        "with": [
          {
            "zh": "与……一致",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "结清账目",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "squeeze": {
      "display": "squeeze",
      "prepositions": {
        "in": [
          "The doctor can squeeze you in at noon. 医生中午可以抽空给你看。",
          "Can we squeeze in one more person? 还能再挤进一个人吗？"
        ],
        "into": [
          "Five of us squeezed into the tiny car. 我们五个人挤进了那辆小车。"
        ]
      },
      "prepositionOrder": [
        "in",
        "into"
      ],
      "zipf": 3.94,
      "senses": {
        "in": [
          {
            "zh": "挤进；抽空安排",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "挤进",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stack": {
      "display": "stack",
      "prepositions": {
        "up": [
          "Dirty dishes were stacking up in the sink. 水槽里的脏盘子越堆越多。"
        ],
        "up against": [
          "How does our product stack up against the competition? 我们的产品与竞争对手相比如何？"
        ]
      },
      "prepositionOrder": [
        "up",
        "up against"
      ],
      "zipf": 4.05,
      "senses": {
        "up": [
          {
            "zh": "堆积；累积",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up against": [
          {
            "zh": "与……相比",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stamp": {
      "display": "stamp",
      "prepositions": {
        "out": [
          "The government promised to stamp out corruption. 政府承诺要根除腐败。",
          "Health workers are trying to stamp out the disease. 医务工作者正努力消灭这种疾病。"
        ],
        "on": [
          "He stamped on the spider. 他一脚踩死了蜘蛛。"
        ]
      },
      "prepositionOrder": [
        "out",
        "on"
      ],
      "zipf": 4.11,
      "senses": {
        "out": [
          {
            "zh": "根除；消灭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "踩；跺",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stand": {
      "display": "stand",
      "prepositions": {
        "out": [
          "Her red coat stood out in the crowd. 她的红外套在人群中很显眼。",
          "Only a few applications really stand out. 只有少数几份申请真正出众。"
        ],
        "up": [
          "Everyone stood up when the judge entered. 法官进来时所有人都站了起来。",
          "His theory doesn't stand up to close examination. 他的理论经不起仔细推敲。"
        ],
        "up for": [
          "You should stand up for what you believe in. 你应该捍卫自己的信念。",
          "She always stands up for her younger brother. 她总是护着弟弟。"
        ],
        "by": [
          "How can you stand by and do nothing? 你怎么能袖手旁观、什么都不做？",
          "I will stand by you whatever happens. 无论发生什么，我都会支持你。",
          "The minister stood by his earlier statement. 部长坚持他之前的说法。"
        ],
        "for": [
          "What does this abbreviation stand for? 这个缩写代表什么？",
          "The dove stands for peace. 鸽子象征和平。"
        ],
        "down": [
          "The chairman stood down after the scandal. 丑闻发生后，主席辞职了。"
        ],
        "in for": [
          "Can you stand in for me at the meeting? 你能代我去开会吗？",
          "A young actor stood in for the injured star. 一名年轻演员代替受伤的明星上场。"
        ]
      },
      "prepositionOrder": [
        "out",
        "up",
        "up for",
        "by",
        "for",
        "down",
        "in for"
      ],
      "zipf": 5.14,
      "senses": {
        "out": [
          {
            "zh": "突出；显眼",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "站起来",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "经得起（检验）",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "up for": [
          {
            "zh": "支持；维护",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "by": [
          {
            "zh": "袖手旁观",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "支持；信守",
            "kind": "preposition",
            "examples": [
              1,
              2
            ]
          }
        ],
        "for": [
          {
            "zh": "代表；象征",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "辞职；下台",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "in for": [
          {
            "zh": "代替；代理",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "stare": {
      "display": "stare",
      "prepositions": {
        "at": [
          "It's rude to stare at people. 盯着别人看是不礼貌的。",
          "She stared at the screen for hours. 她盯着屏幕看了好几个小时。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 3.91,
      "senses": {
        "at": [
          {
            "zh": "盯着看",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "start": {
      "display": "start",
      "prepositions": {
        "off": [
          "Let's start off with a quick review. 我们先快速复习一下。",
          "She started off as a waitress and now owns the restaurant. 她起初是一名服务员，如今拥有了这家餐厅。"
        ],
        "out": [
          "The company started out in a small garage. 这家公司起步于一个小车库。",
          "He started out as a teacher before turning to politics. 他从政之前原本是个教师。"
        ],
        "over": [
          "I made too many mistakes, so I had to start over. 我错得太多，只好从头再来。",
          "After the divorce, she moved abroad to start over. 离婚后，她出国重新开始生活。"
        ],
        "up": [
          "The engine wouldn't start up this morning. 今天早上发动机打不着火。",
          "They started up an online bookstore last year. 他们去年开了一家网上书店。"
        ],
        "with": [
          "Let's start with the easiest question. 我们从最简单的问题开始吧。",
          "The meal started with a light soup. 这顿饭以一道清淡的汤开场。"
        ]
      },
      "prepositionOrder": [
        "off",
        "out",
        "over",
        "up",
        "with"
      ],
      "zipf": 5.56,
      "senses": {
        "off": [
          {
            "zh": "开始；以……开始",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "起初是；开始从事",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "重新开始",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "启动；创办",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "从……开始",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "stay": {
      "display": "stay",
      "prepositions": {
        "up": [
          "I stayed up all night to finish the essay. 我熬了一整夜才写完论文。",
          "Don't stay up too late; you have an exam tomorrow. 别熬太晚，你明天还有考试。"
        ],
        "away from": [
          "Stay away from the edge of the cliff. 离悬崖边远一点。",
          "The doctor told him to stay away from sugar. 医生叫他别吃糖。"
        ],
        "in": [
          "It was raining, so we stayed in and watched films. 下着雨，所以我们待在家里看电影。"
        ],
        "out": [
          "Her parents don't let her stay out after midnight. 她父母不许她半夜以后还在外面。"
        ],
        "on": [
          "He stayed on at the company after retirement age. 他过了退休年龄仍留在公司任职。"
        ],
        "with": [
          "The story stayed with me for days. 这个故事让我好几天都忘不了。",
          "If you stay with the course, you will improve. 只要你坚持学这门课，就会有进步。"
        ]
      },
      "prepositionOrder": [
        "up",
        "away from",
        "in",
        "out",
        "on",
        "with"
      ],
      "zipf": 5.33,
      "senses": {
        "up": [
          {
            "zh": "熬夜；不睡",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away from": [
          {
            "zh": "远离；避开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "待在家里；不外出",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "在外面过夜；晚归",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "留下；继续留任",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "坚持；与……待在一起",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "steal": {
      "display": "steal",
      "prepositions": {
        "from": [
          "Someone stole money from my wallet. 有人从我的钱包里偷了钱。",
          "He was caught stealing from the shop. 他在店里偷东西时被抓住了。"
        ],
        "away": [
          "We stole away while the others were still dancing. 趁别人还在跳舞，我们悄悄溜走了。"
        ]
      },
      "prepositionOrder": [
        "from",
        "away"
      ],
      "zipf": 4.41,
      "senses": {
        "from": [
          {
            "zh": "从……偷",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "悄悄离开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stem": {
      "display": "stem",
      "prepositions": {
        "from": [
          "Many of his problems stem from a lack of sleep. 他的许多问题都源于睡眠不足。",
          "The conflict stemmed from a simple misunderstanding. 这场冲突源于一个简单的误会。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.3,
      "senses": {
        "from": [
          {
            "zh": "源于；由……引起",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "step": {
      "display": "step",
      "prepositions": {
        "up": [
          "The police have stepped up their patrols in the area. 警方加强了该地区的巡逻。",
          "We need to step up production before the holidays. 我们需要在假期前加快生产。"
        ],
        "down": [
          "The coach stepped down after a poor season. 赛季表现不佳后，教练辞职了。",
          "She decided to step down as team leader. 她决定辞去组长一职。"
        ],
        "in": [
          "The teacher stepped in to stop the fight. 老师出面制止了打架。",
          "When the company failed, the state stepped in. 公司倒闭后，政府介入了。"
        ],
        "back": [
          "Sometimes you need to step back and look at the bigger picture. 有时你需要退一步，看看全局。"
        ],
        "on": [
          "Sorry, I didn't mean to step on your foot. 对不起，我不是故意踩你的脚的。"
        ]
      },
      "prepositionOrder": [
        "up",
        "down",
        "in",
        "back",
        "on"
      ],
      "zipf": 5.13,
      "senses": {
        "up": [
          {
            "zh": "加强；加快",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "辞职；让位",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "介入；插手",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "退一步（冷静看待）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "踩到",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stick": {
      "display": "stick",
      "prepositions": {
        "to": [
          "Let's stick to the plan. 我们还是按计划来吧。",
          "He finds it hard to stick to a diet. 他觉得坚持节食很难。"
        ],
        "with": [
          "If you stick with it, you'll get better. 只要坚持下去，你就会进步。",
          "Stick with me and you won't get lost. 跟着我，你就不会迷路。"
        ],
        "out": [
          "Don't stick your tongue out at people. 不要对别人吐舌头。",
          "A pen was sticking out of his pocket. 他的口袋里露出一支笔。"
        ],
        "up for": [
          "Thanks for sticking up for me yesterday. 谢谢你昨天为我说话。"
        ],
        "around": [
          "Stick around after class; I want to talk to you. 下课后留一下，我想和你谈谈。"
        ],
        "at": [
          "Learning a language is hard, but stick at it. 学语言很难，但要坚持下去。"
        ]
      },
      "prepositionOrder": [
        "to",
        "with",
        "out",
        "up for",
        "around",
        "at"
      ],
      "zipf": 4.76,
      "senses": {
        "to": [
          {
            "zh": "坚持；遵守",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "坚持做；跟随",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "伸出；突出",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up for": [
          {
            "zh": "维护；为……辩护",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "around": [
          {
            "zh": "留下；逗留",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "at": [
          {
            "zh": "坚持不懈地做",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stir": {
      "display": "stir",
      "prepositions": {
        "up": [
          "The article stirred up a lot of anger. 那篇文章激起了强烈的愤怒。",
          "He likes to stir up trouble at meetings. 他喜欢在会上挑事。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.96,
      "senses": {
        "up": [
          {
            "zh": "激起；挑起",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "stock": {
      "display": "stock",
      "prepositions": {
        "up on": [
          "We stocked up on water before the storm. 暴风雨来临前我们储备了很多水。",
          "Students stock up on snacks before exams. 学生们在考试前囤了很多零食。"
        ],
        "with": [
          "The shop is stocked with local products. 这家店备有各种本地产品。"
        ]
      },
      "prepositionOrder": [
        "up on",
        "with"
      ],
      "zipf": 4.93,
      "senses": {
        "up on": [
          {
            "zh": "大量购买；储备",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "备有（货物）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stop": {
      "display": "stop",
      "prepositions": {
        "by": [
          "Stop by my office when you have a minute. 有空的时候顺便来我办公室一趟。",
          "She stopped by the bakery on her way home. 她回家路上顺道去了趟面包店。"
        ],
        "over": [
          "We stopped over in Dubai for a night. 我们在迪拜中途停留了一晚。"
        ],
        "from": [
          "Nothing can stop him from trying again. 什么也阻止不了他再试一次。",
          "The fence stops the dog from running into the road. 这道围栏能防止狗跑到马路上。"
        ]
      },
      "prepositionOrder": [
        "by",
        "over",
        "from"
      ],
      "zipf": 5.52,
      "senses": {
        "by": [
          {
            "zh": "顺便拜访",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "中途停留",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "from": [
          {
            "zh": "阻止；防止",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "storm": {
      "display": "storm",
      "prepositions": {
        "off": [
          "He stormed off without saying goodbye. 他连再见都没说就气冲冲地走了。"
        ],
        "out of": [
          "She stormed out of the meeting. 她怒气冲冲地冲出了会议室。"
        ]
      },
      "prepositionOrder": [
        "off",
        "out of"
      ],
      "zipf": 4.66,
      "senses": {
        "off": [
          {
            "zh": "愤然离去",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out of": [
          {
            "zh": "怒气冲冲地冲出",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "straighten": {
      "display": "straighten",
      "prepositions": {
        "out": [
          "We need to straighten out this misunderstanding. 我们需要消除这个误会。"
        ],
        "up": [
          "Straighten up and look at the camera. 站直，看镜头。",
          "Please straighten up your room before dinner. 晚饭前请把你的房间收拾好。"
        ]
      },
      "prepositionOrder": [
        "out",
        "up"
      ],
      "zipf": 3.27,
      "senses": {
        "out": [
          {
            "zh": "解决；理顺",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "站直；整理",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "stress": {
      "display": "stress",
      "prepositions": {
        "out": [
          "Exams really stress me out. 考试真让我紧张。"
        ],
        "about": [
          "Don't stress about the small details. 别为小细节焦虑。"
        ]
      },
      "prepositionOrder": [
        "out",
        "about"
      ],
      "zipf": 4.73,
      "senses": {
        "out": [
          {
            "zh": "使紧张焦虑",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "about": [
          {
            "zh": "为……焦虑",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stretch": {
      "display": "stretch",
      "prepositions": {
        "out": [
          "He stretched out on the sofa and fell asleep. 他在沙发上躺平就睡着了。",
          "The desert stretched out before us. 沙漠在我们面前延伸开去。"
        ],
        "to": [
          "The forest stretches to the coast. 森林一直延伸到海岸。",
          "My salary won't stretch to a new car. 我的工资不够买新车。"
        ]
      },
      "prepositionOrder": [
        "out",
        "to"
      ],
      "zipf": 4.35,
      "senses": {
        "out": [
          {
            "zh": "伸展；躺平",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "延伸到；（钱）够用",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "strike": {
      "display": "strike",
      "prepositions": {
        "up": [
          "He struck up a conversation with the woman next to him. 他和身旁的女士攀谈起来。",
          "They struck up a friendship on the train. 他们在火车上结下了友谊。"
        ],
        "out": [
          "At eighteen, she struck out on her own. 十八岁时，她开始独自闯荡。"
        ],
        "off": [
          "The doctor was struck off for misconduct. 那名医生因行为不端被吊销执照。"
        ],
        "down": [
          "He was struck down by a serious illness. 他被一场重病击倒了。"
        ],
        "as": [
          "The plan strikes me as a bit risky. 我觉得这个计划有点冒险。"
        ]
      },
      "prepositionOrder": [
        "up",
        "out",
        "off",
        "down",
        "as"
      ],
      "zipf": 4.66,
      "senses": {
        "up": [
          {
            "zh": "开始（交谈、友谊）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "独立闯荡",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "除名；删除",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "击倒；（疾病）使病倒",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "as": [
          {
            "zh": "给……以印象",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "strip": {
      "display": "strip",
      "prepositions": {
        "off": [
          "The kids stripped off and jumped into the lake. 孩子们脱掉衣服跳进了湖里。",
          "We stripped off the old wallpaper. 我们把旧墙纸撕了下来。"
        ],
        "of": [
          "He was stripped of his medal after failing a drug test. 他因药检不合格被剥夺了奖牌。"
        ]
      },
      "prepositionOrder": [
        "off",
        "of"
      ],
      "zipf": 4.36,
      "senses": {
        "off": [
          {
            "zh": "脱去（衣服）；剥去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "of": [
          {
            "zh": "剥夺",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "struggle": {
      "display": "struggle",
      "prepositions": {
        "with": [
          "Many students struggle with maths. 许多学生数学学得很吃力。",
          "She has struggled with depression for years. 她多年来一直与抑郁症抗争。"
        ],
        "for": [
          "The workers struggled for better conditions. 工人们为争取更好的待遇而斗争。"
        ],
        "against": [
          "The small town struggled against poverty. 这个小镇一直在与贫困作斗争。"
        ]
      },
      "prepositionOrder": [
        "with",
        "for",
        "against"
      ],
      "zipf": 4.62,
      "senses": {
        "with": [
          {
            "zh": "努力应对；与……斗争",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "为……而奋斗",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "against": [
          {
            "zh": "与……抗争",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "stumble": {
      "display": "stumble",
      "prepositions": {
        "on": [
          "I stumbled on an old photo of my grandparents. 我偶然发现了一张祖父母的旧照片。"
        ],
        "upon": [
          "The hikers stumbled upon a hidden waterfall. 徒步者无意中发现了一处隐秘的瀑布。"
        ],
        "over": [
          "He stumbled over a root in the dark. 他在黑暗中被树根绊了一下。",
          "She stumbled over the difficult words in her speech. 她在演讲中念到难词时结结巴巴。"
        ]
      },
      "prepositionOrder": [
        "on",
        "upon",
        "over"
      ],
      "zipf": 3.42,
      "senses": {
        "on": [
          {
            "zh": "偶然发现",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "upon": [
          {
            "zh": "无意中发现",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "被……绊倒；说话结巴",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "subject": {
      "display": "subject",
      "prepositions": {
        "to": [
          "The prisoners were subjected to harsh treatment. 囚犯们遭受了残酷的对待。",
          "The samples were subjected to several tests. 这些样本经过了多项检测。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.96,
      "senses": {
        "to": [
          {
            "zh": "使遭受",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "submit": {
      "display": "submit",
      "prepositions": {
        "to": [
          "The prisoners refused to submit to the guards. 囚犯们拒绝向看守屈服。",
          "Everyone must submit to a security check at the gate. 每个人都必须在门口接受安检。",
          "All reports must be submitted to the committee by Friday. 所有报告须在周五前提交给委员会。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.28,
      "senses": {
        "to": [
          {
            "zh": "屈服于；服从",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "提交给",
            "kind": "preposition",
            "examples": [
              2
            ]
          }
        ]
      }
    },
    "subscribe": {
      "display": "subscribe",
      "prepositions": {
        "to": [
          "I subscribe to two science magazines. 我订阅了两本科学杂志。",
          "I don't subscribe to that theory. 我不赞同那种理论。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.02,
      "senses": {
        "to": [
          {
            "zh": "订阅；赞同",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "substitute": {
      "display": "substitute",
      "prepositions": {
        "for": [
          "You can substitute honey for sugar in this recipe. 在这个食谱里，你可以用蜂蜜代替糖。",
          "Nothing can substitute for real experience. 什么都代替不了实际经验。"
        ],
        "with": [
          "Try substituting the butter with olive oil. 试试用橄榄油代替黄油。"
        ]
      },
      "prepositionOrder": [
        "for",
        "with"
      ],
      "zipf": 4.17,
      "senses": {
        "for": [
          {
            "zh": "代替",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "用……代替",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "succeed": {
      "display": "succeed",
      "prepositions": {
        "in": [
          "She succeeded in passing the exam. 她成功通过了考试。",
          "They finally succeeded in reaching the summit. 他们终于成功登顶。"
        ],
        "to": [
          "The prince succeeded to the throne at twenty. 王子二十岁时继承了王位。"
        ]
      },
      "prepositionOrder": [
        "in",
        "to"
      ],
      "zipf": 4.29,
      "senses": {
        "in": [
          {
            "zh": "成功做成",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "继承；接替",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "succumb": {
      "display": "succumb",
      "prepositions": {
        "to": [
          "He finally succumbed to the pressure and resigned. 他最终顶不住压力辞职了。",
          "She succumbed to her injuries two days later. 两天后她因伤势过重去世。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.06,
      "senses": {
        "to": [
          {
            "zh": "屈服于；死于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "suck": {
      "display": "suck",
      "prepositions": {
        "up to": [
          "He's always sucking up to the boss. 他总是拍老板的马屁。"
        ],
        "in": [
          "She sucked in her stomach for the photo. 拍照时她收紧了小腹。"
        ],
        "into": [
          "I didn't want to get sucked into their argument. 我不想被卷进他们的争吵。"
        ]
      },
      "prepositionOrder": [
        "up to",
        "in",
        "into"
      ],
      "zipf": 4.42,
      "senses": {
        "up to": [
          {
            "zh": "巴结；拍马屁",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "吸入；收（腹）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "卷入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sue": {
      "display": "sue",
      "prepositions": {
        "for": [
          "She sued the company for damages. 她起诉公司，要求赔偿损失。",
          "He is suing his former partner for fraud. 他以欺诈罪起诉他以前的合伙人。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.22,
      "senses": {
        "for": [
          {
            "zh": "因……起诉；要求赔偿",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "suffer": {
      "display": "suffer",
      "prepositions": {
        "from": [
          "He suffers from asthma. 他患有哮喘。",
          "The region suffered from a long drought. 该地区遭受了长期干旱。",
          "Many workers suffer from back pain. 许多工人饱受背痛之苦。"
        ],
        "for": [
          "He suffered for his political beliefs. 他因政治信仰而受苦。"
        ]
      },
      "prepositionOrder": [
        "from",
        "for"
      ],
      "zipf": 4.45,
      "senses": {
        "from": [
          {
            "zh": "患（病）；受……之苦",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "for": [
          {
            "zh": "为……受苦",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "suit": {
      "display": "suit",
      "prepositions": {
        "up": [
          "The divers suited up and jumped into the water. 潜水员们穿好装备跳进了水里。"
        ],
        "to": [
          "The job is well suited to her skills. 这份工作很适合她的技能。"
        ]
      },
      "prepositionOrder": [
        "up",
        "to"
      ],
      "zipf": 4.7,
      "senses": {
        "up": [
          {
            "zh": "穿好（特殊服装）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "适合于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sum": {
      "display": "sum",
      "prepositions": {
        "up": [
          "To sum up, the plan has three main benefits. 总而言之，这个计划有三大好处。",
          "Can you sum up the article in one sentence? 你能用一句话概括这篇文章吗？",
          "She summed up the situation at a glance. 她一眼就看清了局势。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.34,
      "senses": {
        "up": [
          {
            "zh": "总结；概括",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "对……作出判断",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ]
      }
    },
    "summon": {
      "display": "summon",
      "prepositions": {
        "up": [
          "He finally summoned up the courage to ask her out. 他终于鼓起勇气约她出去。",
          "The smell summoned up memories of my childhood. 这股气味唤起了我童年的回忆。"
        ],
        "to": [
          "The ambassador was summoned to the ministry. 大使被召到外交部。"
        ]
      },
      "prepositionOrder": [
        "up",
        "to"
      ],
      "zipf": 3.55,
      "senses": {
        "up": [
          {
            "zh": "鼓起（勇气）；唤起",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "召唤到",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "supply": {
      "display": "supply",
      "prepositions": {
        "with": [
          "The farm supplies the town with fresh milk. 这家农场为镇上供应新鲜牛奶。",
          "Each student was supplied with a laptop. 每个学生都配发了一台笔记本电脑。"
        ],
        "to": [
          "The company supplies parts to car makers. 这家公司向汽车制造商供应零部件。"
        ]
      },
      "prepositionOrder": [
        "with",
        "to"
      ],
      "zipf": 4.81,
      "senses": {
        "with": [
          {
            "zh": "向……提供",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "供应给",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "surrender": {
      "display": "surrender",
      "prepositions": {
        "to": [
          "The rebels surrendered to the army. 叛军向军队投降了。",
          "He finally surrendered to temptation and ate the cake. 他最终经不住诱惑，吃了那块蛋糕。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.09,
      "senses": {
        "to": [
          {
            "zh": "向……投降",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "survive": {
      "display": "survive",
      "prepositions": {
        "on": [
          "They survived on rice and beans for weeks. 他们靠米饭和豆子撑了好几个星期。",
          "It's hard to survive on such a low salary. 靠这么低的工资很难过活。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.52,
      "senses": {
        "on": [
          {
            "zh": "靠……生存",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "suspect": {
      "display": "suspect",
      "prepositions": {
        "of": [
          "The police suspect him of stealing the car. 警方怀疑他偷了那辆车。",
          "She was suspected of lying to the court. 她被怀疑向法庭撒谎。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 4.51,
      "senses": {
        "of": [
          {
            "zh": "怀疑（某人）有……行为",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "swap": {
      "display": "swap",
      "prepositions": {
        "for": [
          "I swapped my sandwich for his apple. 我用三明治换了他的苹果。",
          "She swapped her car for a bike. 她把汽车换成了自行车。"
        ],
        "with": [
          "Can I swap seats with you? 我可以和你换个座位吗？"
        ]
      },
      "prepositionOrder": [
        "for",
        "with"
      ],
      "zipf": 3.94,
      "senses": {
        "for": [
          {
            "zh": "用……交换",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……交换",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "swear": {
      "display": "swear",
      "prepositions": {
        "by": [
          "My grandmother swears by honey for a sore throat. 我奶奶坚信蜂蜜能治喉咙痛。",
          "Many runners swear by these shoes. 许多跑步者都极力推崇这款鞋。"
        ],
        "at": [
          "The driver swore at the cyclist. 司机冲着骑车的人骂了起来。"
        ],
        "in": [
          "The new president was sworn in yesterday. 新总统昨天宣誓就职。"
        ],
        "to": [
          "I could swear to having locked the door. 我敢发誓我锁了门。"
        ]
      },
      "prepositionOrder": [
        "by",
        "at",
        "in",
        "to"
      ],
      "zipf": 4.51,
      "senses": {
        "by": [
          {
            "zh": "对……深信不疑",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "at": [
          {
            "zh": "咒骂",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "使宣誓就职",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "发誓保证",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sweat": {
      "display": "sweat",
      "prepositions": {
        "out": [
          "We had to sweat it out until the results were posted. 我们只好焦急地等着成绩公布。"
        ],
        "over": [
          "He sweated over his thesis all summer. 他整个夏天都在为论文绞尽脑汁。"
        ]
      },
      "prepositionOrder": [
        "out",
        "over"
      ],
      "zipf": 4.14,
      "senses": {
        "out": [
          {
            "zh": "焦急地等待（结果）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "为……费尽心思",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "sweep": {
      "display": "sweep",
      "prepositions": {
        "up": [
          "Could you sweep up the broken glass? 你能把碎玻璃扫一下吗？"
        ],
        "away": [
          "The flood swept away several houses. 洪水冲走了好几栋房子。",
          "The new government swept away the old laws. 新政府彻底废除了旧法律。"
        ]
      },
      "prepositionOrder": [
        "up",
        "away"
      ],
      "zipf": 3.97,
      "senses": {
        "up": [
          {
            "zh": "打扫；扫起",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "away": [
          {
            "zh": "冲走；彻底消除",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "swing": {
      "display": "swing",
      "prepositions": {
        "by": [
          "I'll swing by your place after work. 我下班后顺路去你那儿。"
        ],
        "around": [
          "She swung around to see who had called her name. 她转过身，想看看是谁叫她的名字。"
        ]
      },
      "prepositionOrder": [
        "by",
        "around"
      ],
      "zipf": 4.34,
      "senses": {
        "by": [
          {
            "zh": "顺道去",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "around": [
          {
            "zh": "转身",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "switch": {
      "display": "switch",
      "prepositions": {
        "off": [
          "Please switch off your phones during the film. 看电影时请关掉手机。",
          "Don't forget to switch the lights off. 别忘了关灯。",
          "I switch off when he starts talking about football. 他一开始聊足球我就走神。"
        ],
        "on": [
          "She switched on the radio to hear the news. 她打开收音机听新闻。"
        ],
        "over": [
          "Let's switch over to the other channel. 我们换到另一个频道吧。"
        ],
        "to": [
          "Many drivers have switched to electric cars. 许多司机已经改用电动汽车。",
          "He switched to English when he saw I was confused. 他看我没听懂，就改说英语了。"
        ]
      },
      "prepositionOrder": [
        "off",
        "on",
        "over",
        "to"
      ],
      "zipf": 4.6,
      "senses": {
        "off": [
          {
            "zh": "关掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "走神；不再注意",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "on": [
          {
            "zh": "打开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "转换；换台",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "改用；转向",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "sympathize": {
      "display": "sympathize",
      "prepositions": {
        "with": [
          "I sympathize with your situation. 我很同情你的处境。",
          "Many voters sympathize with the protesters' demands. 许多选民赞同抗议者的诉求。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.06,
      "senses": {
        "with": [
          {
            "zh": "同情；赞同",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "tag": {
      "display": "tag",
      "prepositions": {
        "along": [
          "My little brother always tags along when I go out. 我出门时弟弟总爱跟着。"
        ]
      },
      "prepositionOrder": [
        "along"
      ],
      "zipf": 4.44,
      "senses": {
        "along": [
          {
            "zh": "跟随；跟着去",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tailor": {
      "display": "tailor",
      "prepositions": {
        "to": [
          "The course is tailored to the needs of beginners. 这门课程是专为初学者的需求设计的。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.61,
      "senses": {
        "to": [
          {
            "zh": "使适合",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "take": {
      "display": "take",
      "prepositions": {
        "off": [
          "The plane took off an hour late because of the fog. 由于大雾，飞机晚点一小时起飞。",
          "We watched the helicopter take off from the roof. 我们看着直升机从楼顶起飞。",
          "Please take your shoes off before you come in. 进来之前请把鞋脱掉。",
          "He took off his coat and hung it by the door. 他脱下外套，挂在门边。",
          "Her online shop really took off last summer. 她的网店去年夏天一下子火了起来。",
          "Nobody expected the small startup to take off so quickly. 谁也没想到那家小公司会这么快就发展起来。"
        ],
        "up": [
          "My father took up painting after he retired. 我父亲退休后开始学画画。",
          "She is thinking of taking up yoga this year. 她打算今年开始练瑜伽。",
          "This old sofa takes up half the living room. 这张旧沙发占了客厅的一半。",
          "The meeting took up the whole morning. 这次会议占用了整个上午。"
        ],
        "after": [
          "Lucy really takes after her grandmother. 露西真像她奶奶。",
          "He takes after his father in both looks and temper. 他无论长相还是脾气都随他父亲。"
        ],
        "over": [
          "A larger company took over the local bakery. 一家更大的公司收购了本地那家面包店。",
          "Who will take over when the manager leaves? 经理走了以后谁来接手？"
        ],
        "on": [
          "I can't take on any more work this month. 这个月我不能再接更多工作了。",
          "She took on the role of team leader without complaint. 她毫无怨言地担起了组长的职责。",
          "The factory is taking on fifty new workers. 工厂正在招五十名新工人。"
        ],
        "back": [
          "I'm sorry, I take back what I said yesterday. 对不起，我收回昨天说的话。",
          "You can take the jacket back if it doesn't fit. 如果夹克不合身，你可以拿回去退掉。"
        ],
        "in": [
          "There was too much information to take in at once. 信息太多，一下子消化不了。",
          "She needed a moment to take in the bad news. 她需要一点时间来接受这个坏消息。",
          "Many people were taken in by the fake website. 很多人被那个假网站骗了。"
        ],
        "out": [
          "He took out his wallet to pay the bill. 他掏出钱包付账。",
          "Could you take the rubbish out tonight? 你今晚能把垃圾拿出去吗？",
          "He took his mother out for dinner on her birthday. 他在母亲生日那天带她出去吃饭。"
        ],
        "apart": [
          "The boy took the old radio apart to see how it worked. 男孩把旧收音机拆开，想看看它是怎么工作的。"
        ],
        "down": [
          "The secretary took down every word of the speech. 秘书把讲话的每一个字都记了下来。",
          "They took down the posters after the event. 活动结束后他们把海报取了下来。"
        ]
      },
      "prepositionOrder": [
        "off",
        "up",
        "after",
        "over",
        "on",
        "back",
        "in",
        "out",
        "apart",
        "down"
      ],
      "zipf": 5.92,
      "senses": {
        "off": [
          {
            "zh": "起飞",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "脱下（衣物）",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          },
          {
            "zh": "突然走红；迅速成功",
            "kind": "particle",
            "examples": [
              4,
              5
            ]
          }
        ],
        "up": [
          {
            "zh": "开始从事（爱好等）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "占用（时间或空间）",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          }
        ],
        "after": [
          {
            "zh": "长得像；性格像（长辈）",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "接管；接手",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "承担（工作、责任）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "雇用",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "back": [
          {
            "zh": "收回（说过的话）",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "退回（商品）",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "理解；吸收（信息）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "欺骗",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "out": [
          {
            "zh": "取出；带出去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "带（某人）出去（吃饭、游玩）",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "apart": [
          {
            "zh": "拆开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "记下",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "拆除；取下",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ]
      }
    },
    "talk": {
      "display": "talk",
      "prepositions": {
        "to": [
          "I need to talk to you about the rent. 我得跟你谈谈房租的事。",
          "She talked to her doctor before changing her diet. 她改变饮食之前先咨询了医生。"
        ],
        "with": [
          "He spent the evening talking with his neighbours. 他整晚都在和邻居聊天。",
          "You should talk with your manager about the problem. 你应该和经理谈谈这个问题。"
        ],
        "about": [
          "They talked about the match for hours. 他们把那场比赛聊了好几个小时。",
          "Let's not talk about work during dinner. 吃饭的时候别谈工作了。"
        ],
        "into": [
          "My friend talked me into buying a new bike. 朋友说服我买了一辆新自行车。"
        ],
        "out of": [
          "His wife talked him out of quitting his job. 他妻子劝他不要辞职。",
          "I tried to talk her out of the trip, but she went anyway. 我试图劝她别去旅行，但她还是去了。"
        ],
        "over": [
          "Let's talk it over with the team tomorrow. 我们明天和团队商量一下吧。"
        ],
        "back": [
          "The child was punished for talking back to his teacher. 那个孩子因为顶撞老师受了罚。"
        ],
        "down to": [
          "I hate it when people talk down to me. 我讨厌别人用居高临下的口气跟我说话。"
        ]
      },
      "prepositionOrder": [
        "to",
        "with",
        "about",
        "into",
        "out of",
        "over",
        "back",
        "down to"
      ],
      "zipf": 5.42,
      "senses": {
        "to": [
          {
            "zh": "跟……说话",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "with": [
          {
            "zh": "与……交谈",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "about": [
          {
            "zh": "谈论",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "说服（某人）做某事",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out of": [
          {
            "zh": "劝阻（某人）不做某事",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "商量；讨论",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "back": [
          {
            "zh": "顶嘴",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down to": [
          {
            "zh": "以居高临下的口气对……说话",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tally": {
      "display": "tally",
      "prepositions": {
        "with": [
          "His account of events doesn't tally with hers. 他对事情经过的描述与她的不符。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.62,
      "senses": {
        "with": [
          {
            "zh": "与……相符",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tamper": {
      "display": "tamper",
      "prepositions": {
        "with": [
          "Someone had tampered with the brakes. 有人动过刹车。",
          "It is illegal to tamper with the evidence. 篡改证据是违法的。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 2.89,
      "senses": {
        "with": [
          {
            "zh": "擅自篡改；乱动",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "tap": {
      "display": "tap",
      "prepositions": {
        "into": [
          "The company wants to tap into the Asian market. 这家公司想打入亚洲市场。",
          "Good teachers tap into their students' curiosity. 好老师善于调动学生的好奇心。"
        ],
        "on": [
          "Someone tapped on the window. 有人轻轻敲了敲窗户。"
        ]
      },
      "prepositionOrder": [
        "into",
        "on"
      ],
      "zipf": 4.28,
      "senses": {
        "into": [
          {
            "zh": "利用；开发",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "轻敲",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "taper": {
      "display": "taper",
      "prepositions": {
        "off": [
          "Sales tend to taper off after the holidays. 假期过后销量通常会逐渐下降。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 3.3,
      "senses": {
        "off": [
          {
            "zh": "逐渐减少",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "taste": {
      "display": "taste",
      "prepositions": {
        "of": [
          "This soup tastes of garlic. 这汤有股大蒜味。",
          "The water tasted of metal. 这水有一股金属味。"
        ]
      },
      "prepositionOrder": [
        "of"
      ],
      "zipf": 4.73,
      "senses": {
        "of": [
          {
            "zh": "有……的味道",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "team": {
      "display": "team",
      "prepositions": {
        "up with": [
          "The sports brand teamed up with a famous singer for a new campaign. 这个运动品牌与一位知名歌手联手推出了新的宣传活动。",
          "I teamed up with a classmate for the science project. 我和一位同学合作完成了科学课题。"
        ]
      },
      "prepositionOrder": [
        "up with"
      ],
      "zipf": 5.67,
      "senses": {
        "up with": [
          {
            "zh": "与……合作",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "tear": {
      "display": "tear",
      "prepositions": {
        "up": [
          "He tore up the letter without reading it. 他没看就把信撕了。",
          "She tore the contract up in anger. 她气得把合同撕了。"
        ],
        "down": [
          "The old cinema was torn down last year. 那家老电影院去年被拆了。"
        ],
        "apart": [
          "The war tore the family apart. 战争使这个家庭四分五裂。"
        ],
        "off": [
          "He tore off a piece of bread and gave it to me. 他撕下一块面包递给我。"
        ],
        "away from": [
          "I couldn't tear myself away from the book. 我对那本书爱不释手。"
        ]
      },
      "prepositionOrder": [
        "up",
        "down",
        "apart",
        "off",
        "away from"
      ],
      "zipf": 4.35,
      "senses": {
        "up": [
          {
            "zh": "撕碎",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "拆毁",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "apart": [
          {
            "zh": "使痛苦不堪；拆散",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "撕下",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "away from": [
          {
            "zh": "使离开（喜爱的东西）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tease": {
      "display": "tease",
      "prepositions": {
        "about": [
          "His friends teased him about his new haircut. 朋友们拿他的新发型开玩笑。"
        ],
        "out": [
          "The study tries to tease out the causes of the disease. 该研究试图理清这种疾病的成因。"
        ]
      },
      "prepositionOrder": [
        "about",
        "out"
      ],
      "zipf": 3.59,
      "senses": {
        "about": [
          {
            "zh": "就……取笑",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "梳理出；弄清",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tell": {
      "display": "tell",
      "prepositions": {
        "about": [
          "Tell me about your trip to the mountains. 跟我讲讲你去山里旅行的事。",
          "She told us about her new job. 她跟我们说了她的新工作。"
        ],
        "off": [
          "The coach told the players off for arriving late. 教练因为球员迟到训斥了他们。",
          "My mum told me off for leaving the door open. 我妈骂我没关门。"
        ],
        "apart": [
          "I can't tell the twins apart. 我分不清这对双胞胎。",
          "It is hard to tell the two brands apart. 这两个牌子很难区分。"
        ],
        "on": [
          "Please don't tell on me to the teacher! 求你别向老师告我的状！"
        ],
        "from": [
          "Can you tell real leather from fake leather? 你能分辨真皮和假皮吗？"
        ]
      },
      "prepositionOrder": [
        "about",
        "off",
        "apart",
        "on",
        "from"
      ],
      "zipf": 5.53,
      "senses": {
        "about": [
          {
            "zh": "告诉……关于……",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "责骂",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "apart": [
          {
            "zh": "分辨；区分",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "告发；打小报告",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "from": [
          {
            "zh": "区分；辨别",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tend": {
      "display": "tend",
      "prepositions": {
        "to": [
          "The nurse tended to the wounded soldiers. 护士照料受伤的士兵。",
          "I have some business to tend to this afternoon. 我今天下午有些事情要处理。"
        ],
        "towards": [
          "Young voters tend towards the left. 年轻选民倾向于左派。"
        ]
      },
      "prepositionOrder": [
        "to",
        "towards"
      ],
      "zipf": 4.57,
      "senses": {
        "to": [
          {
            "zh": "照料；处理",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "towards": [
          {
            "zh": "倾向于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "testify": {
      "display": "testify",
      "prepositions": {
        "against": [
          "The witness agreed to testify against his former boss. 证人同意出庭指证他的前老板。"
        ],
        "to": [
          "The long queues testify to the restaurant's popularity. 长长的队伍证明了这家餐厅很受欢迎。"
        ]
      },
      "prepositionOrder": [
        "against",
        "to"
      ],
      "zipf": 3.84,
      "senses": {
        "against": [
          {
            "zh": "作证指控",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "证明；表明",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "thank": {
      "display": "thank",
      "prepositions": {
        "for": [
          "Thank you for your help yesterday. 谢谢你昨天的帮忙。",
          "She thanked the nurses for their kindness. 她感谢护士们的悉心照顾。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 5.48,
      "senses": {
        "for": [
          {
            "zh": "为……感谢",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "thaw": {
      "display": "thaw",
      "prepositions": {
        "out": [
          "Leave the chicken to thaw out overnight. 把鸡肉放一整晚解冻。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 3.18,
      "senses": {
        "out": [
          {
            "zh": "解冻",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "think": {
      "display": "think",
      "prepositions": {
        "about": [
          "I often think about my old friends from school. 我常常想起上学时的老朋友。",
          "Have you thought about what you want to study? 你想过你想学什么吗？"
        ],
        "of": [
          "Can you think of a better name for the club? 你能想出一个更好的俱乐部名字吗？",
          "What do you think of the new teacher? 你觉得新老师怎么样？",
          "I can't think of his name right now. 我一时想不起他的名字。"
        ],
        "over": [
          "Take a few days to think it over before you decide. 做决定之前花几天时间好好考虑一下。",
          "She thought the offer over carefully. 她仔细考虑了这个提议。"
        ],
        "up": [
          "He thought up a clever excuse for being late. 他想出了一个巧妙的迟到借口。",
          "The children thought up a new game on the beach. 孩子们在海滩上想出了一个新游戏。"
        ],
        "through": [
          "We need to think this plan through before we start. 开始之前我们需要把这个计划全面考虑清楚。"
        ],
        "back to": [
          "When I think back to my childhood, I remember the river. 回想童年，我记得那条小河。"
        ]
      },
      "prepositionOrder": [
        "about",
        "of",
        "over",
        "up",
        "through",
        "back to"
      ],
      "zipf": 6.08,
      "senses": {
        "about": [
          {
            "zh": "考虑；想到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "of": [
          {
            "zh": "想出；想起；认为",
            "kind": "preposition",
            "examples": [
              0,
              1,
              2
            ]
          }
        ],
        "over": [
          {
            "zh": "仔细考虑",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "想出；编造",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "through": [
          {
            "zh": "通盘考虑",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "back to": [
          {
            "zh": "回想",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "threaten": {
      "display": "threaten",
      "prepositions": {
        "with": [
          "The manager threatened him with dismissal. 经理威胁要开除他。",
          "The species is threatened with extinction. 这个物种面临灭绝的威胁。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.94,
      "senses": {
        "with": [
          {
            "zh": "以……威胁",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "thrive": {
      "display": "thrive",
      "prepositions": {
        "on": [
          "Some people thrive on pressure. 有些人在压力下反而表现更好。",
          "This plant thrives on neglect. 这种植物越不管长得越好。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 3.73,
      "senses": {
        "on": [
          {
            "zh": "在……中茁壮成长；以……为乐",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "throw": {
      "display": "throw",
      "prepositions": {
        "away": [
          "Don't throw away those boxes; we can use them. 别把那些箱子扔了，我们还能用。",
          "She threw the old letters away. 她把旧信扔掉了。"
        ],
        "out": [
          "We threw out a lot of junk when we moved. 搬家时我们扔掉了很多杂物。",
          "He was thrown out of the bar for fighting. 他因打架被赶出了酒吧。"
        ],
        "up": [
          "The boy threw up after eating too much candy. 那个男孩吃了太多糖，吐了。"
        ],
        "at": [
          "Someone threw a stone at the window. 有人朝窗户扔了块石头。"
        ],
        "in": [
          "If you buy the phone, they'll throw in a free case. 你买这部手机的话，他们会送一个免费手机壳。"
        ],
        "together": [
          "I threw together a quick salad for lunch. 我午饭匆匆拌了个沙拉。"
        ]
      },
      "prepositionOrder": [
        "away",
        "out",
        "up",
        "at",
        "in",
        "together"
      ],
      "zipf": 4.83,
      "senses": {
        "away": [
          {
            "zh": "扔掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "扔掉；赶出去",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "呕吐",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "at": [
          {
            "zh": "向……扔",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "额外奉送",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "together": [
          {
            "zh": "匆匆拼凑",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tick": {
      "display": "tick",
      "prepositions": {
        "off": [
          "Tick off each item on the list as you pack it. 每装好一件就在清单上打个勾。",
          "It really ticks me off when people are late. 别人迟到真让我恼火。"
        ],
        "over": [
          "The business is just ticking over at the moment. 眼下生意只是勉强维持。"
        ]
      },
      "prepositionOrder": [
        "off",
        "over"
      ],
      "zipf": 3.8,
      "senses": {
        "off": [
          {
            "zh": "打勾标出；惹恼",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "（引擎）空转；维持运转",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tidy": {
      "display": "tidy",
      "prepositions": {
        "up": [
          "Tidy up your room before your friends arrive. 朋友来之前把你的房间收拾好。",
          "She spent an hour tidying up the kitchen. 她花了一个小时收拾厨房。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.53,
      "senses": {
        "up": [
          {
            "zh": "收拾整理",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "tie": {
      "display": "tie",
      "prepositions": {
        "up": [
          "The robbers tied up the guard and took the money. 劫匪把保安捆起来，拿走了钱。",
          "Tie your hair up before you start cooking. 做饭前把头发扎起来。",
          "I'm tied up in meetings all day. 我一整天都忙着开会。"
        ],
        "in with": [
          "His story doesn't tie in with the evidence. 他的说法与证据对不上。"
        ],
        "down": [
          "She doesn't want to be tied down by a mortgage. 她不想被房贷束缚住。"
        ],
        "to": [
          "He tied the boat to a tree. 他把船拴在一棵树上。",
          "Your salary is tied to your performance. 你的薪水和业绩挂钩。"
        ]
      },
      "prepositionOrder": [
        "up",
        "in with",
        "down",
        "to"
      ],
      "zipf": 4.51,
      "senses": {
        "up": [
          {
            "zh": "捆绑；系好",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "使忙碌；占用",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "in with": [
          {
            "zh": "与……相吻合；相关联",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "束缚；牵制",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "把……系在；与……相联系",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "tinker": {
      "display": "tinker",
      "prepositions": {
        "with": [
          "He spent Sunday tinkering with his old motorbike. 他星期天一直在捣鼓他的旧摩托车。",
          "The government keeps tinkering with the tax system. 政府总在对税收制度修修补补。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.28,
      "senses": {
        "with": [
          {
            "zh": "胡乱摆弄；小修小补",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "tip": {
      "display": "tip",
      "prepositions": {
        "off": [
          "Someone tipped off the police about the robbery. 有人向警方告发了这起抢劫。"
        ],
        "over": [
          "The dog tipped over its water bowl. 狗把它的水碗弄翻了。"
        ]
      },
      "prepositionOrder": [
        "off",
        "over"
      ],
      "zipf": 4.55,
      "senses": {
        "off": [
          {
            "zh": "向……告密",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "翻倒；使倾覆",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tire": {
      "display": "tire",
      "prepositions": {
        "of": [
          "Children soon tire of the same toys. 孩子们很快就会玩腻同样的玩具。"
        ],
        "out": [
          "The long hike tired us out. 长途徒步把我们累坏了。"
        ]
      },
      "prepositionOrder": [
        "of",
        "out"
      ],
      "zipf": 4.02,
      "senses": {
        "of": [
          {
            "zh": "厌倦",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "使筋疲力尽",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tone": {
      "display": "tone",
      "prepositions": {
        "down": [
          "You should tone down your language in the email. 你应该把邮件里的措辞缓和一些。",
          "The director was asked to tone the violence down. 导演被要求减少暴力镜头。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.49,
      "senses": {
        "down": [
          {
            "zh": "缓和；降低（语气等）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "top": {
      "display": "top",
      "prepositions": {
        "up": [
          "I need to top up my phone credit. 我得给手机充值了。",
          "Can I top up your glass? 我给你把杯子满上吧？"
        ],
        "off": [
          "We topped off the evening with a walk by the river. 我们以河边散步圆满结束了这个夜晚。"
        ]
      },
      "prepositionOrder": [
        "up",
        "off"
      ],
      "zipf": 5.57,
      "senses": {
        "up": [
          {
            "zh": "加满；充值",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "圆满结束",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "toss": {
      "display": "toss",
      "prepositions": {
        "out": [
          "I tossed out all my old magazines. 我把旧杂志全扔了。"
        ],
        "around": [
          "We tossed around a few ideas for the party. 我们随便讨论了几个派对点子。"
        ]
      },
      "prepositionOrder": [
        "out",
        "around"
      ],
      "zipf": 3.91,
      "senses": {
        "out": [
          {
            "zh": "扔掉",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "around": [
          {
            "zh": "随意讨论",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "touch": {
      "display": "touch",
      "prepositions": {
        "on": [
          "The lecture only touched on the causes of the war. 讲座只简要提到了战争的起因。"
        ],
        "down": [
          "The plane touched down safely in Beijing. 飞机在北京安全着陆。"
        ],
        "up": [
          "She touched up her makeup before the photo. 拍照前她补了补妆。"
        ]
      },
      "prepositionOrder": [
        "on",
        "down",
        "up"
      ],
      "zipf": 4.91,
      "senses": {
        "on": [
          {
            "zh": "简要提及",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "着陆",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "润色；修饰",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tower": {
      "display": "tower",
      "prepositions": {
        "over": [
          "The new skyscraper towers over the old town. 新摩天大楼高耸在老城之上。",
          "He towers over the other players on the court. 他在场上比其他球员高出一大截。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 4.5,
      "senses": {
        "over": [
          {
            "zh": "高耸于；远远超过",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "toy": {
      "display": "toy",
      "prepositions": {
        "with": [
          "I've been toying with the idea of moving abroad. 我一直在琢磨要不要搬到国外去。",
          "She toyed with her food but didn't eat much. 她拨弄着饭菜，没怎么吃。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 4.3,
      "senses": {
        "with": [
          {
            "zh": "考虑（但不认真）；摆弄",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "trace": {
      "display": "trace",
      "prepositions": {
        "back to": [
          "The tradition can be traced back to the tenth century. 这一传统可以追溯到十世纪。",
          "The problem was traced back to a faulty wire. 问题的根源被追查到一根有故障的电线。"
        ]
      },
      "prepositionOrder": [
        "back to"
      ],
      "zipf": 4.19,
      "senses": {
        "back to": [
          {
            "zh": "追溯到",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "track": {
      "display": "track",
      "prepositions": {
        "down": [
          "Police finally tracked down the missing girl. 警方终于找到了失踪的女孩。",
          "It took me weeks to track this book down. 我花了好几周才找到这本书。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 5.02,
      "senses": {
        "down": [
          {
            "zh": "追查到；找到",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "trade": {
      "display": "trade",
      "prepositions": {
        "in": [
          "He traded in his old car for a new one. 他用旧车折价换购了一辆新车。"
        ],
        "for": [
          "The kids traded their stickers for sweets. 孩子们用贴纸换了糖果。"
        ],
        "with": [
          "The country trades mainly with its neighbours. 这个国家主要与邻国进行贸易。"
        ],
        "on": [
          "The hotel trades on its famous history. 这家酒店打着其知名历史的招牌招揽生意。"
        ],
        "off": [
          "Engineers must trade off speed against safety. 工程师必须在速度与安全之间权衡取舍。"
        ]
      },
      "prepositionOrder": [
        "in",
        "for",
        "with",
        "on",
        "off"
      ],
      "zipf": 5.12,
      "senses": {
        "in": [
          {
            "zh": "以旧换新",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "用……交换",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "与……做生意",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "利用（名声等）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "权衡取舍",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "trail": {
      "display": "trail",
      "prepositions": {
        "off": [
          "Her voice trailed off as she saw his face. 看到他的脸色，她的声音越来越小。"
        ],
        "behind": [
          "The team is trailing behind its rivals by ten points. 这支球队落后对手十分。"
        ]
      },
      "prepositionOrder": [
        "off",
        "behind"
      ],
      "zipf": 4.45,
      "senses": {
        "off": [
          {
            "zh": "（声音）逐渐减弱",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "behind": [
          {
            "zh": "落后于",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "train": {
      "display": "train",
      "prepositions": {
        "for": [
          "He is training for the city marathon. 他正在为城市马拉松进行训练。",
          "The team trained hard for the final. 球队为决赛刻苦训练。"
        ],
        "as": [
          "She trained as a nurse in London. 她在伦敦接受了护士培训。"
        ]
      },
      "prepositionOrder": [
        "for",
        "as"
      ],
      "zipf": 4.96,
      "senses": {
        "for": [
          {
            "zh": "为……进行训练",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "as": [
          {
            "zh": "接受……的培训",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "trample": {
      "display": "trample",
      "prepositions": {
        "on": [
          "Please don't trample on the flowers. 请不要践踏花朵。",
          "The new law tramples on basic rights. 新法律践踏了基本权利。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 2.83,
      "senses": {
        "on": [
          {
            "zh": "践踏；无视",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "transfer": {
      "display": "transfer",
      "prepositions": {
        "to": [
          "He transferred to a school closer to home. 他转学到了离家更近的一所学校。",
          "She was transferred to the Paris office. 她被调到了巴黎办事处。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.72,
      "senses": {
        "to": [
          {
            "zh": "转到；调到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "translate": {
      "display": "translate",
      "prepositions": {
        "into": [
          "The novel has been translated into forty languages. 这部小说已被译成四十种语言。",
          "Good ideas don't always translate into profits. 好点子不一定能转化为利润。"
        ],
        "from": [
          "She translates from Spanish for a publishing company. 她为一家出版公司做西班牙语翻译。"
        ]
      },
      "prepositionOrder": [
        "into",
        "from"
      ],
      "zipf": 3.93,
      "senses": {
        "into": [
          {
            "zh": "翻译成；转化为",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "from": [
          {
            "zh": "从（某语言）翻译",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "treat": {
      "display": "treat",
      "prepositions": {
        "to": [
          "I'll treat you to lunch today. 今天我请你吃午饭。",
          "We treated ourselves to a weekend by the sea. 我们犒劳自己去海边度了个周末。"
        ],
        "for": [
          "He was treated for a broken leg. 他因腿骨骨折接受了治疗。"
        ],
        "as": [
          "Please don't treat me as a child. 请别把我当小孩对待。"
        ],
        "with": [
          "Everyone should be treated with respect. 每个人都应该受到尊重。"
        ]
      },
      "prepositionOrder": [
        "to",
        "for",
        "as",
        "with"
      ],
      "zipf": 4.75,
      "senses": {
        "to": [
          {
            "zh": "请（某人）享受",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "为……治疗",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "as": [
          {
            "zh": "把……当作",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "以……方式对待",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "trick": {
      "display": "trick",
      "prepositions": {
        "into": [
          "He tricked the old lady into giving him her savings. 他骗老太太把积蓄交给了他。",
          "The ad tricked me into signing up for a paid plan. 那个广告骗我订了付费套餐。"
        ],
        "out of": [
          "They tricked him out of his inheritance. 他们骗走了他的遗产。"
        ]
      },
      "prepositionOrder": [
        "into",
        "out of"
      ],
      "zipf": 4.48,
      "senses": {
        "into": [
          {
            "zh": "骗（某人）做某事",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out of": [
          {
            "zh": "骗取",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "trip": {
      "display": "trip",
      "prepositions": {
        "over": [
          "I tripped over a cable and fell. 我被一根电线绊倒了。",
          "Careful not to trip over the toys on the floor. 小心别被地上的玩具绊倒。"
        ],
        "up": [
          "The last question tripped up most students. 最后一道题难倒了大多数学生。"
        ]
      },
      "prepositionOrder": [
        "over",
        "up"
      ],
      "zipf": 4.9,
      "senses": {
        "over": [
          {
            "zh": "被……绊倒",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "使犯错；难倒",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "triumph": {
      "display": "triumph",
      "prepositions": {
        "over": [
          "She triumphed over many difficulties to become a doctor. 她战胜了重重困难成为一名医生。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 3.96,
      "senses": {
        "over": [
          {
            "zh": "战胜",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "trust": {
      "display": "trust",
      "prepositions": {
        "with": [
          "Can I trust you with a secret? 我能把一个秘密托付给你吗？",
          "She trusted her neighbour with her house keys. 她把家门钥匙托付给了邻居。"
        ],
        "in": [
          "They trust in their leader completely. 他们完全信任他们的领袖。"
        ]
      },
      "prepositionOrder": [
        "with",
        "in"
      ],
      "zipf": 5.13,
      "senses": {
        "with": [
          {
            "zh": "把……托付给",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "in": [
          {
            "zh": "信任；信赖",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "try": {
      "display": "try",
      "prepositions": {
        "on": [
          "Can I try these jeans on? 我可以试穿这条牛仔裤吗？",
          "She tried on five dresses before choosing one. 她试了五条裙子才挑中一条。"
        ],
        "out": [
          "We are trying out a new recipe tonight. 今晚我们试做一道新菜。",
          "Let's try the software out before we buy it. 我们先试用一下这个软件再买。"
        ],
        "out for": [
          "He tried out for the school football team. 他参加了校足球队的选拔。"
        ],
        "for": [
          "She is trying for a place at a top university. 她正在争取进入一所顶尖大学。"
        ]
      },
      "prepositionOrder": [
        "on",
        "out",
        "out for",
        "for"
      ],
      "zipf": 5.5,
      "senses": {
        "on": [
          {
            "zh": "试穿",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "试用；试验",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out for": [
          {
            "zh": "参加（选拔）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "争取；设法获得",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tuck": {
      "display": "tuck",
      "prepositions": {
        "in": [
          "Tuck your shirt in before the interview. 面试前把衬衫塞进裤子里。",
          "Dad tucked the children in and turned off the light. 爸爸给孩子们掖好被子后关了灯。",
          "Dinner is ready, so tuck in! 晚饭好了，开吃吧！"
        ],
        "away": [
          "She tucked the money away in a drawer. 她把钱藏在了抽屉里。"
        ]
      },
      "prepositionOrder": [
        "in",
        "away"
      ],
      "zipf": 3.55,
      "senses": {
        "in": [
          {
            "zh": "把……塞进；替（孩子）盖好被子",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "开始大吃",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "away": [
          {
            "zh": "藏起来；把……存放起来",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "tune": {
      "display": "tune",
      "prepositions": {
        "in": [
          "Millions tuned in to watch the final. 数百万人收看了决赛。"
        ],
        "out": [
          "He just tunes out when his parents start nagging. 父母一唠叨，他就充耳不闻。"
        ],
        "up": [
          "The orchestra was tuning up before the concert. 音乐会开始前，乐团正在调音。"
        ],
        "to": [
          "Stay tuned to this station for more news. 请继续锁定本台收听更多新闻。"
        ]
      },
      "prepositionOrder": [
        "in",
        "out",
        "up",
        "to"
      ],
      "zipf": 4.27,
      "senses": {
        "in": [
          {
            "zh": "收听；收看",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "不去理会",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "（乐器）调音",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "调到（频道）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "turn": {
      "display": "turn",
      "prepositions": {
        "on": [
          "Could you turn on the light, please? 请你把灯打开好吗？",
          "He turned the heater on because it was freezing. 太冷了，他把暖气打开了。"
        ],
        "off": [
          "Don't forget to turn off the oven. 别忘了关烤箱。",
          "Please turn your phones off during the film. 电影放映期间请关掉手机。"
        ],
        "up": [
          "Only ten people turned up for the meeting. 只有十个人来开会。",
          "My lost keys turned up in the washing machine. 我丢的钥匙在洗衣机里找到了。",
          "Can you turn up the radio? I love this song. 你能把收音机开大点吗？我喜欢这首歌。"
        ],
        "down": [
          "She turned down the job because the pay was too low. 她拒绝了那份工作，因为工资太低。",
          "They offered him a lift, but he turned it down. 他们提出载他一程，但他谢绝了。",
          "Please turn the music down, the baby is sleeping. 请把音乐关小点，宝宝在睡觉。"
        ],
        "into": [
          "The caterpillar turned into a beautiful butterfly. 毛毛虫变成了一只美丽的蝴蝶。",
          "The small argument turned into a serious fight. 小小的争吵演变成了激烈的打斗。"
        ],
        "to": [
          "When he lost his job, he turned to his family for help. 他失业后向家人求助。",
          "Many students turn to the internet for answers. 许多学生上网寻找答案。"
        ],
        "out": [
          "The stranger turned out to be my cousin. 原来那个陌生人是我表哥。",
          "It turned out that the shop was closed. 结果那家店关门了。"
        ],
        "around": [
          "She turned around and waved goodbye. 她转过身挥手告别。",
          "The new manager turned the company around in a year. 新经理在一年内扭转了公司的局面。"
        ],
        "back": [
          "The storm forced the climbers to turn back. 暴风雨迫使登山者折返。"
        ],
        "over": [
          "Turn the pancake over after a minute. 一分钟后把煎饼翻过来。",
          "The thief was turned over to the police. 小偷被移交给了警方。"
        ],
        "against": [
          "His closest friends turned against him. 他最亲密的朋友都跟他反目了。"
        ],
        "in": [
          "Please turn in your essays by Friday. 请在周五前交作文。",
          "I'm tired, so I think I'll turn in early. 我累了，想早点睡。"
        ],
        "away": [
          "Hundreds of fans were turned away at the gate. 数百名球迷在门口被拒之门外。"
        ]
      },
      "prepositionOrder": [
        "on",
        "off",
        "up",
        "down",
        "into",
        "to",
        "out",
        "around",
        "back",
        "over",
        "against",
        "in",
        "away"
      ],
      "zipf": 5.32,
      "senses": {
        "on": [
          {
            "zh": "打开（电器）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "关掉（电器）",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "出现；到场",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "调大（音量、温度）",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "down": [
          {
            "zh": "拒绝",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "调小（音量、温度）",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "into": [
          {
            "zh": "变成",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "求助于；转向",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out": [
          {
            "zh": "结果是；原来是",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "around": [
          {
            "zh": "转身；扭转局面",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "折返；往回走",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "over": [
          {
            "zh": "翻转；移交",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "against": [
          {
            "zh": "背叛；与……反目",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "上交；上床睡觉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "拒绝进入；把……打发走",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "type": {
      "display": "type",
      "prepositions": {
        "up": [
          "Could you type up these notes for me? 你能帮我把这些笔记打出来吗？"
        ],
        "in": [
          "Type in your password and press enter. 输入密码后按回车键。"
        ]
      },
      "prepositionOrder": [
        "up",
        "in"
      ],
      "zipf": 5.27,
      "senses": {
        "up": [
          {
            "zh": "打字录入",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "输入",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "understand": {
      "display": "understand",
      "prepositions": {
        "by": [
          "What do you understand by the word freedom? 你怎么理解自由这个词？"
        ]
      },
      "prepositionOrder": [
        "by"
      ],
      "zipf": 5.37,
      "senses": {
        "by": [
          {
            "zh": "把……理解为",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "upgrade": {
      "display": "upgrade",
      "prepositions": {
        "to": [
          "We upgraded to a bigger flat last year. 我们去年换了一套更大的公寓。",
          "The passenger was upgraded to business class. 那位乘客被升到了商务舱。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.24,
      "senses": {
        "to": [
          {
            "zh": "升级到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "urge": {
      "display": "urge",
      "prepositions": {
        "on": [
          "The crowd urged the runners on. 观众为赛跑者加油鼓劲。"
        ]
      },
      "prepositionOrder": [
        "on"
      ],
      "zipf": 4.11,
      "senses": {
        "on": [
          {
            "zh": "激励；鼓励",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "use": {
      "display": "use",
      "prepositions": {
        "up": [
          "We've used up all the milk. 我们把牛奶都用完了。",
          "Don't use up all the hot water. 别把热水都用光了。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 5.81,
      "senses": {
        "up": [
          {
            "zh": "用完",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "usher": {
      "display": "usher",
      "prepositions": {
        "in": [
          "The invention ushered in a new era of communication. 这项发明开创了通信的新时代。"
        ],
        "into": [
          "The guests were ushered into the dining hall. 客人们被引进了餐厅。"
        ]
      },
      "prepositionOrder": [
        "in",
        "into"
      ],
      "zipf": 3.51,
      "senses": {
        "in": [
          {
            "zh": "开创；引进",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "引领进入",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "vary": {
      "display": "vary",
      "prepositions": {
        "from": [
          "Prices vary from shop to shop. 各家店的价格不一样。"
        ],
        "in": [
          "The apples vary in size and colour. 这些苹果大小和颜色各不相同。"
        ],
        "with": [
          "The dress code varies with the occasion. 着装要求因场合而异。"
        ]
      },
      "prepositionOrder": [
        "from",
        "in",
        "with"
      ],
      "zipf": 4.25,
      "senses": {
        "from": [
          {
            "zh": "与……不同；从……到……不等",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "在……方面不同",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "随……而变化",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "veer": {
      "display": "veer",
      "prepositions": {
        "off": [
          "The car veered off the road and hit a tree. 汽车突然冲出路面撞上了一棵树。",
          "The conversation veered off into politics. 谈话突然转到了政治上。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 3.02,
      "senses": {
        "off": [
          {
            "zh": "突然转向；偏离",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "venture": {
      "display": "venture",
      "prepositions": {
        "into": [
          "The company is venturing into online education. 这家公司正在涉足在线教育。"
        ],
        "out": [
          "Few people ventured out in the snowstorm. 暴风雪中很少有人敢出门。"
        ]
      },
      "prepositionOrder": [
        "into",
        "out"
      ],
      "zipf": 4.26,
      "senses": {
        "into": [
          {
            "zh": "冒险进入；涉足",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "冒险外出",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "vie": {
      "display": "vie",
      "prepositions": {
        "for": [
          "Several cities are vying for the right to host the games. 几座城市正在争夺运动会的主办权。",
          "The two brothers vied for their father's attention. 两兄弟争着引起父亲的注意。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 3.35,
      "senses": {
        "for": [
          {
            "zh": "争夺",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "visit": {
      "display": "visit",
      "prepositions": {
        "with": [
          "We visited with our cousins over the weekend. 周末我们去看望了表亲们，和他们聊了聊。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 5.04,
      "senses": {
        "with": [
          {
            "zh": "拜访；与……聊天（美式）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "volunteer": {
      "display": "volunteer",
      "prepositions": {
        "for": [
          "She volunteered for the night shift. 她自愿值夜班。",
          "Several students volunteered for the beach cleanup. 几名学生主动报名参加海滩清洁活动。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 4.28,
      "senses": {
        "for": [
          {
            "zh": "自愿做",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "vote": {
      "display": "vote",
      "prepositions": {
        "for": [
          "Most people voted for the new mayor. 大多数人投票支持新市长。"
        ],
        "against": [
          "Two members voted against the plan. 两名成员投票反对该计划。"
        ],
        "on": [
          "The council will vote on the proposal next week. 议会将于下周就该提案进行表决。"
        ],
        "out": [
          "The chairman was voted out after the scandal. 丑闻之后，主席被投票罢免。"
        ]
      },
      "prepositionOrder": [
        "for",
        "against",
        "on",
        "out"
      ],
      "zipf": 5.11,
      "senses": {
        "for": [
          {
            "zh": "投票支持",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "against": [
          {
            "zh": "投票反对",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "就……投票表决",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "投票罢免",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "vouch": {
      "display": "vouch",
      "prepositions": {
        "for": [
          "I can vouch for his honesty. 我可以担保他为人诚实。",
          "Will anyone vouch for you? 有人能为你担保吗？"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 3.13,
      "senses": {
        "for": [
          {
            "zh": "为……担保",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "wade": {
      "display": "wade",
      "prepositions": {
        "through": [
          "I had to wade through hundreds of emails. 我不得不费劲地处理几百封邮件。",
          "The soldiers waded through the river. 士兵们蹚过了河。"
        ],
        "into": [
          "He waded into the argument without knowing the facts. 他不了解情况就贸然卷入了争论。"
        ]
      },
      "prepositionOrder": [
        "through",
        "into"
      ],
      "zipf": 3.98,
      "senses": {
        "through": [
          {
            "zh": "费力地读完；蹚过",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "into": [
          {
            "zh": "贸然介入；猛烈抨击",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wait": {
      "display": "wait",
      "prepositions": {
        "for": [
          "We waited for the bus in the rain. 我们在雨中等公交车。",
          "I can't wait for the summer holidays! 我等不及暑假到来了！"
        ],
        "up": [
          "Don't wait up for me; I'll be home late. 别熬夜等我，我会很晚才回家。"
        ],
        "on": [
          "The staff waited on the guests all evening. 员工整晚都在招待客人。"
        ],
        "around": [
          "I hate waiting around at airports. 我讨厌在机场干等。"
        ]
      },
      "prepositionOrder": [
        "for",
        "up",
        "on",
        "around"
      ],
      "zipf": 5.35,
      "senses": {
        "for": [
          {
            "zh": "等待",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "熬夜等候",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "on": [
          {
            "zh": "服侍；招待",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "around": [
          {
            "zh": "闲等",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wake": {
      "display": "wake",
      "prepositions": {
        "up": [
          "I woke up at six this morning. 我今天早上六点醒的。",
          "Please wake me up before you leave. 你走之前请叫醒我。"
        ],
        "up to": [
          "The government finally woke up to the problem of pollution. 政府终于意识到了污染问题。"
        ]
      },
      "prepositionOrder": [
        "up",
        "up to"
      ],
      "zipf": 4.76,
      "senses": {
        "up": [
          {
            "zh": "醒来；叫醒",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up to": [
          {
            "zh": "意识到",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "walk": {
      "display": "walk",
      "prepositions": {
        "out": [
          "Half the audience walked out during the speech. 演讲中途一半听众离席而去。",
          "The workers walked out over unpaid wages. 工人们因拖欠工资而罢工。"
        ],
        "out on": [
          "He walked out on his family when his son was a baby. 他在儿子还是婴儿时就抛下了家人。"
        ],
        "away from": [
          "You can't just walk away from your responsibilities. 你不能就这样逃避责任。"
        ],
        "into": [
          "I walked into a glass door yesterday. 我昨天撞到了一扇玻璃门上。",
          "She walked into a great job after graduation. 她毕业后轻松得到了一份好工作。"
        ],
        "over": [
          "Don't let people walk all over you. 别让人把你欺负得死死的。"
        ],
        "through": [
          "The trainer walked us through the new system. 培训师一步步给我们讲解了新系统。"
        ]
      },
      "prepositionOrder": [
        "out",
        "out on",
        "away from",
        "into",
        "over",
        "through"
      ],
      "zipf": 5.08,
      "senses": {
        "out": [
          {
            "zh": "离席以示抗议；罢工",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "out on": [
          {
            "zh": "抛弃",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "away from": [
          {
            "zh": "走开；放弃",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "into": [
          {
            "zh": "撞上；轻易得到",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "欺负；利用",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "through": [
          {
            "zh": "逐步讲解",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wall": {
      "display": "wall",
      "prepositions": {
        "off": [
          "Part of the garden was walled off for the dogs. 花园的一部分被墙隔开给狗用。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 5.04,
      "senses": {
        "off": [
          {
            "zh": "用墙隔开",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wander": {
      "display": "wander",
      "prepositions": {
        "off": [
          "The child wandered off while his mother was shopping. 母亲购物时，孩子走丢了。",
          "Don't wander off; stay close to the group. 别乱跑，跟紧队伍。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 3.67,
      "senses": {
        "off": [
          {
            "zh": "走失；走开",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "want": {
      "display": "want",
      "prepositions": {
        "for": [
          "The children never wanted for anything. 孩子们从来不缺什么。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 6.04,
      "senses": {
        "for": [
          {
            "zh": "缺少（多用于否定）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "ward": {
      "display": "ward",
      "prepositions": {
        "off": [
          "Garlic was once used to ward off evil spirits. 大蒜曾被用来驱邪。",
          "Regular exercise may help ward off colds. 经常锻炼或许有助于预防感冒。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 4.37,
      "senses": {
        "off": [
          {
            "zh": "避开；防止",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "warm": {
      "display": "warm",
      "prepositions": {
        "up": [
          "Always warm up before you go running. 跑步前一定要热身。",
          "I'll warm up the soup for you. 我给你把汤热一下。",
          "The room will warm up once the fire is lit. 生起火后房间就会暖和起来。"
        ],
        "to": [
          "At first she was shy, but she soon warmed to us. 起初她很害羞，但很快就和我们熟络起来。"
        ]
      },
      "prepositionOrder": [
        "up",
        "to"
      ],
      "zipf": 4.71,
      "senses": {
        "up": [
          {
            "zh": "热身",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "加热；变暖",
            "kind": "particle",
            "examples": [
              1,
              2
            ]
          }
        ],
        "to": [
          {
            "zh": "开始喜欢",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "warn": {
      "display": "warn",
      "prepositions": {
        "about": [
          "The teacher warned us about the difficult exam. 老师提醒我们考试会很难。"
        ],
        "of": [
          "The signs warn drivers of falling rocks. 标志提醒司机注意落石。"
        ],
        "against": [
          "Doctors warn against eating too much sugar. 医生告诫不要吃太多糖。",
          "My father warned me against lending him money. 我父亲告诫我不要借钱给他。"
        ]
      },
      "prepositionOrder": [
        "about",
        "of",
        "against"
      ],
      "zipf": 4.02,
      "senses": {
        "about": [
          {
            "zh": "就……提醒；警告",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "of": [
          {
            "zh": "警告（危险）",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "against": [
          {
            "zh": "告诫不要",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "wash": {
      "display": "wash",
      "prepositions": {
        "up": [
          "It's your turn to wash up after dinner. 晚饭后轮到你洗碗了。",
          "A dead whale washed up on the beach. 一头死鲸被冲上了海滩。"
        ],
        "off": [
          "Wash the mud off before you come inside. 进来之前先把泥洗掉。"
        ],
        "away": [
          "The flood washed away several houses. 洪水冲走了好几座房子。"
        ],
        "down": [
          "He washed down the pills with a glass of water. 他用一杯水把药片送服下去。"
        ]
      },
      "prepositionOrder": [
        "up",
        "off",
        "away",
        "down"
      ],
      "zipf": 4.46,
      "senses": {
        "up": [
          {
            "zh": "洗碗",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "被冲上岸",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "洗掉",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "away": [
          {
            "zh": "冲走",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "冲服；就着……咽下",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "waste": {
      "display": "waste",
      "prepositions": {
        "on": [
          "Don't waste your money on cheap shoes. 别把钱浪费在便宜的鞋子上。",
          "We wasted the whole afternoon on a pointless argument. 我们在一场毫无意义的争吵上浪费了整个下午。"
        ],
        "away": [
          "The patient was slowly wasting away. 那个病人日渐消瘦。"
        ]
      },
      "prepositionOrder": [
        "on",
        "away"
      ],
      "zipf": 4.81,
      "senses": {
        "on": [
          {
            "zh": "在……上浪费",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "away": [
          {
            "zh": "日渐消瘦",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "watch": {
      "display": "watch",
      "prepositions": {
        "out": [
          "Watch out! There's a car coming. 小心！有车来了。"
        ],
        "out for": [
          "Watch out for pickpockets in the market. 在市场里要提防扒手。",
          "Parents should watch out for signs of stress in their children. 父母应该留意孩子身上的压力迹象。"
        ],
        "over": [
          "The older sister watched over the baby while their mum cooked. 妈妈做饭时，姐姐照看着婴儿。"
        ],
        "for": [
          "The cat sat by the hole, watching for a mouse. 猫坐在洞口旁，等着老鼠出来。"
        ]
      },
      "prepositionOrder": [
        "out",
        "out for",
        "over",
        "for"
      ],
      "zipf": 5.34,
      "senses": {
        "out": [
          {
            "zh": "小心；当心",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out for": [
          {
            "zh": "留意；提防",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "over": [
          {
            "zh": "看护；照看",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "for": [
          {
            "zh": "等待；留意",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "water": {
      "display": "water",
      "prepositions": {
        "down": [
          "The final law was watered down by the opposition. 最终的法律被反对派削弱了不少。",
          "Someone had watered the juice down. 有人往果汁里掺了水。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 5.52,
      "senses": {
        "down": [
          {
            "zh": "冲淡；使（计划等）打折扣",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "wave": {
      "display": "wave",
      "prepositions": {
        "at": [
          "The little girl waved at the passing train. 小女孩向驶过的火车挥手。"
        ],
        "to": [
          "She waved to us from the balcony. 她在阳台上向我们招手。"
        ],
        "off": [
          "We waved him off at the station. 我们在车站挥手为他送行。"
        ],
        "aside": [
          "He waved aside all our objections. 他对我们的所有反对意见都不予理会。"
        ]
      },
      "prepositionOrder": [
        "at",
        "to",
        "off",
        "aside"
      ],
      "zipf": 4.62,
      "senses": {
        "at": [
          {
            "zh": "向……挥手",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "to": [
          {
            "zh": "向……挥手",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "挥手送别",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "aside": [
          {
            "zh": "对……置之不理",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wean": {
      "display": "wean",
      "prepositions": {
        "off": [
          "The doctor is weaning him off the painkillers. 医生正在让他逐步停用止痛药。"
        ]
      },
      "prepositionOrder": [
        "off"
      ],
      "zipf": 2.72,
      "senses": {
        "off": [
          {
            "zh": "使戒掉；使断奶",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wear": {
      "display": "wear",
      "prepositions": {
        "out": [
          "He wore out two pairs of shoes in one year. 他一年穿坏了两双鞋。",
          "These tyres are starting to wear out. 这些轮胎开始磨损了。",
          "Looking after three children wears me out. 照顾三个孩子让我精疲力竭。"
        ],
        "off": [
          "The effect of the painkiller wore off after two hours. 止痛药的药效两小时后就消退了。",
          "The excitement soon wore off. 兴奋劲很快就过去了。"
        ],
        "down": [
          "The constant noise wore down his patience. 持续的噪音渐渐消磨了他的耐心。",
          "The steps have been worn down by millions of visitors. 台阶被无数游客踩得磨平了。"
        ]
      },
      "prepositionOrder": [
        "out",
        "off",
        "down"
      ],
      "zipf": 4.92,
      "senses": {
        "out": [
          {
            "zh": "穿破；用坏",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "使筋疲力尽",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "off": [
          {
            "zh": "逐渐消失",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "down": [
          {
            "zh": "磨损；使逐渐削弱",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "weed": {
      "display": "weed",
      "prepositions": {
        "out": [
          "The first interview weeds out weak candidates. 第一轮面试会淘汰掉较弱的候选人。",
          "We need to weed out the errors in the data. 我们需要剔除数据中的错误。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.27,
      "senses": {
        "out": [
          {
            "zh": "清除；淘汰",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "weep": {
      "display": "weep",
      "prepositions": {
        "over": [
          "There's no point weeping over lost chances. 为错失的机会哭泣没有意义。"
        ]
      },
      "prepositionOrder": [
        "over"
      ],
      "zipf": 3.37,
      "senses": {
        "over": [
          {
            "zh": "为……哭泣",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "weigh": {
      "display": "weigh",
      "prepositions": {
        "up": [
          "You need to weigh up the pros and cons. 你需要权衡利弊。"
        ],
        "down": [
          "She was weighed down by heavy bags. 她被沉重的包压得够呛。",
          "He felt weighed down by his debts. 他感到被债务压得喘不过气。"
        ],
        "on": [
          "The decision weighed on her for weeks. 这个决定让她忧心了好几周。"
        ],
        "in": [
          "Everyone weighed in with their opinions. 每个人都纷纷发表了意见。"
        ]
      },
      "prepositionOrder": [
        "up",
        "down",
        "on",
        "in"
      ],
      "zipf": 3.99,
      "senses": {
        "up": [
          {
            "zh": "权衡",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "down": [
          {
            "zh": "使负担沉重",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "使担忧；压在心头",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "加入讨论；发表意见",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "while": {
      "display": "while",
      "prepositions": {
        "away": [
          "We whiled away the afternoon playing cards. 我们打牌消磨了一个下午。"
        ]
      },
      "prepositionOrder": [
        "away"
      ],
      "zipf": 5.86,
      "senses": {
        "away": [
          {
            "zh": "消磨（时间）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "whip": {
      "display": "whip",
      "prepositions": {
        "up": [
          "She whipped up a quick breakfast for us. 她很快给我们做了一顿早饭。",
          "The speaker tried to whip up anger against the new law. 演讲者试图煽起对新法律的愤怒。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.01,
      "senses": {
        "up": [
          {
            "zh": "迅速做（饭）；激起",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "whisk": {
      "display": "whisk",
      "prepositions": {
        "away": [
          "The singer was whisked away in a black car. 歌手被一辆黑色轿车迅速接走了。"
        ]
      },
      "prepositionOrder": [
        "away"
      ],
      "zipf": 3.11,
      "senses": {
        "away": [
          {
            "zh": "迅速带走",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "whisper": {
      "display": "whisper",
      "prepositions": {
        "to": [
          "She whispered something to her friend. 她对朋友低声说了些什么。",
          "He leaned over and whispered to me during the film. 看电影时他凑过来跟我耳语。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 3.74,
      "senses": {
        "to": [
          {
            "zh": "对……耳语",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "whittle": {
      "display": "whittle",
      "prepositions": {
        "down": [
          "We whittled down the list to three candidates. 我们把名单缩减到三名候选人。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 2.83,
      "senses": {
        "down": [
          {
            "zh": "削减",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "win": {
      "display": "win",
      "prepositions": {
        "over": [
          "She won over the audience with her humour. 她用幽默赢得了观众的好感。",
          "It took months to win my parents over. 我花了好几个月才说服了父母。"
        ],
        "back": [
          "The company is trying to win back its customers. 公司正在努力挽回顾客。"
        ],
        "through": [
          "Despite many problems, the team won through in the end. 尽管困难重重，球队最终还是取得了胜利。"
        ]
      },
      "prepositionOrder": [
        "over",
        "back",
        "through"
      ],
      "zipf": 5.39,
      "senses": {
        "over": [
          {
            "zh": "争取；说服",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "back": [
          {
            "zh": "重新赢得",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "through": [
          {
            "zh": "最终成功",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wind": {
      "display": "wind",
      "prepositions": {
        "down": [
          "I like to read a book to wind down before bed. 我喜欢睡前看书放松一下。",
          "The company is winding down its operations in Europe. 这家公司正在逐步收缩欧洲业务。"
        ],
        "up": [
          "Let's wind up the meeting; it's getting late. 时间不早了，我们结束会议吧。",
          "If you keep driving like that, you'll wind up in hospital. 你再这样开车，迟早会进医院。",
          "Stop winding your sister up! 别再逗你妹妹了！"
        ]
      },
      "prepositionOrder": [
        "down",
        "up"
      ],
      "zipf": 4.84,
      "senses": {
        "down": [
          {
            "zh": "放松；逐步结束",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "结束；以……告终",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "戏弄；惹恼",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ]
      }
    },
    "wink": {
      "display": "wink",
      "prepositions": {
        "at": [
          "The old man winked at me and smiled. 老人冲我眨了眨眼，笑了。",
          "She winked at her brother across the table. 她隔着桌子朝弟弟使了个眼色。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 3.5,
      "senses": {
        "at": [
          {
            "zh": "向……眨眼示意",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "wipe": {
      "display": "wipe",
      "prepositions": {
        "out": [
          "The disease almost wiped out the local population. 那场疾病几乎使当地人口灭绝。",
          "One bad investment wiped out all his savings. 一次失败的投资让他的积蓄化为乌有。",
          "The long flight completely wiped me out. 长途飞行让我彻底累垮了。"
        ],
        "off": [
          "Please wipe the crumbs off the table after eating. 吃完饭请把桌上的碎屑擦掉。",
          "She wiped the tears off her face. 她擦掉了脸上的泪水。"
        ],
        "up": [
          "Can you wipe up the milk you spilled? 你能把洒的牛奶擦干净吗？"
        ]
      },
      "prepositionOrder": [
        "out",
        "off",
        "up"
      ],
      "zipf": 4.01,
      "senses": {
        "out": [
          {
            "zh": "彻底消灭",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "使精疲力竭",
            "kind": "particle",
            "examples": [
              2
            ]
          }
        ],
        "off": [
          {
            "zh": "擦掉",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "擦干净（溢出物）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wise": {
      "display": "wise",
      "prepositions": {
        "up": [
          "It's time you wised up and saved some money. 你该醒悟过来存点钱了。"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 4.51,
      "senses": {
        "up": [
          {
            "zh": "醒悟；明白过来",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wish": {
      "display": "wish",
      "prepositions": {
        "for": [
          "What did you wish for on your birthday? 你过生日时许了什么愿？",
          "You couldn't wish for a better friend. 你找不到比他更好的朋友了。"
        ],
        "on": [
          "I wouldn't wish this illness on anyone. 我不希望任何人得这种病。"
        ]
      },
      "prepositionOrder": [
        "for",
        "on"
      ],
      "zipf": 5.18,
      "senses": {
        "for": [
          {
            "zh": "希望得到；渴望",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "on": [
          {
            "zh": "把（麻烦）强加给",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "withdraw": {
      "display": "withdraw",
      "prepositions": {
        "from": [
          "She withdrew from the race because of an injury. 她因伤退出了比赛。",
          "The troops withdrew from the city at dawn. 部队在黎明时撤出了城市。"
        ]
      },
      "prepositionOrder": [
        "from"
      ],
      "zipf": 4.05,
      "senses": {
        "from": [
          {
            "zh": "退出；撤离",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "wolf": {
      "display": "wolf",
      "prepositions": {
        "down": [
          "The boy wolfed down his dinner and ran outside. 男孩狼吞虎咽地吃完晚饭就跑了出去。"
        ]
      },
      "prepositionOrder": [
        "down"
      ],
      "zipf": 4.35,
      "senses": {
        "down": [
          {
            "zh": "狼吞虎咽",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wonder": {
      "display": "wonder",
      "prepositions": {
        "about": [
          "I sometimes wonder about my future. 我有时会想自己的将来会怎样。",
          "We began to wonder about his real motives. 我们开始怀疑他的真实动机。"
        ],
        "at": [
          "Visitors wonder at the size of the ancient temple. 游客们惊叹于那座古庙的规模。"
        ]
      },
      "prepositionOrder": [
        "about",
        "at"
      ],
      "zipf": 4.93,
      "senses": {
        "about": [
          {
            "zh": "对……感到好奇；怀疑",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "at": [
          {
            "zh": "对……感到惊奇",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "work": {
      "display": "work",
      "prepositions": {
        "out": [
          "I work out at the gym three times a week. 我每周去健身房锻炼三次。",
          "She works out every morning before breakfast. 她每天早饭前都锻炼。",
          "I can't work out how to open this box. 我搞不懂怎么打开这个盒子。",
          "We finally worked out a solution. 我们终于想出了一个解决方案。",
          "I hope everything works out for you. 希望你一切顺利。",
          "Their marriage didn't work out in the end. 他们的婚姻最终没有走下去。"
        ],
        "on": [
          "She is working on a new novel. 她正在写一部新小说。",
          "We need to work on our pronunciation. 我们需要在发音上下功夫。"
        ],
        "for": [
          "My brother works for a bank in the city. 我哥哥在城里一家银行工作。"
        ],
        "with": [
          "I enjoy working with young people. 我喜欢和年轻人一起工作。"
        ],
        "up": [
          "Don't get so worked up about a small mistake. 别为一个小错误这么激动。",
          "I need to work up the courage to ask her out. 我得鼓起勇气约她出去。"
        ],
        "off": [
          "He went for a run to work off his big lunch. 他去跑步消耗掉丰盛午餐的热量。"
        ],
        "towards": [
          "The two countries are working towards a peace deal. 两国正在为达成和平协议而努力。"
        ]
      },
      "prepositionOrder": [
        "out",
        "on",
        "for",
        "with",
        "up",
        "off",
        "towards"
      ],
      "zipf": 5.96,
      "senses": {
        "out": [
          {
            "zh": "锻炼",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          },
          {
            "zh": "想出；弄明白",
            "kind": "particle",
            "examples": [
              2,
              3
            ]
          },
          {
            "zh": "结果顺利；成功",
            "kind": "particle",
            "examples": [
              4,
              5
            ]
          }
        ],
        "on": [
          {
            "zh": "从事；致力于",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ],
        "for": [
          {
            "zh": "为……工作",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "with": [
          {
            "zh": "与……合作",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "up": [
          {
            "zh": "激起；使激动",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "逐渐培养",
            "kind": "particle",
            "examples": [
              1
            ]
          }
        ],
        "off": [
          {
            "zh": "通过运动消耗掉",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "towards": [
          {
            "zh": "为……而努力",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "worry": {
      "display": "worry",
      "prepositions": {
        "about": [
          "Don't worry about me; I'll be fine. 别担心我，我没事的。",
          "She worries about her son's health. 她担心儿子的健康。"
        ]
      },
      "prepositionOrder": [
        "about"
      ],
      "zipf": 4.84,
      "senses": {
        "about": [
          {
            "zh": "为……担心",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "wrap": {
      "display": "wrap",
      "prepositions": {
        "up": [
          "She wrapped up the present in red paper. 她用红纸把礼物包好。",
          "Let's wrap up this discussion and get some lunch. 我们结束讨论去吃午饭吧。",
          "The film crew wrapped up shooting last week. 摄制组上周完成了拍摄。",
          "Wrap up warm; it's snowing outside. 穿暖和点，外面在下雪。"
        ],
        "in": [
          "The baby was wrapped in a soft blanket. 婴儿被裹在一条柔软的毯子里。"
        ]
      },
      "prepositionOrder": [
        "up",
        "in"
      ],
      "zipf": 4.2,
      "senses": {
        "up": [
          {
            "zh": "包好",
            "kind": "particle",
            "examples": [
              0
            ]
          },
          {
            "zh": "结束；完成",
            "kind": "particle",
            "examples": [
              1,
              2
            ]
          },
          {
            "zh": "穿暖和",
            "kind": "particle",
            "examples": [
              3
            ]
          }
        ],
        "in": [
          {
            "zh": "用……包裹",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wrestle": {
      "display": "wrestle",
      "prepositions": {
        "with": [
          "The government is wrestling with rising prices. 政府正在努力应对物价上涨。",
          "I wrestled with the problem all night. 我整晚都在绞尽脑汁想这个问题。"
        ]
      },
      "prepositionOrder": [
        "with"
      ],
      "zipf": 3.48,
      "senses": {
        "with": [
          {
            "zh": "努力解决；与……搏斗",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "wriggle": {
      "display": "wriggle",
      "prepositions": {
        "out of": [
          "He always tries to wriggle out of doing the dishes. 他总想方设法逃避洗碗。"
        ]
      },
      "prepositionOrder": [
        "out of"
      ],
      "zipf": 2.59,
      "senses": {
        "out of": [
          {
            "zh": "设法逃避",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "wring": {
      "display": "wring",
      "prepositions": {
        "out": [
          "Wring out the towel and hang it up. 把毛巾拧干挂起来。"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 2.75,
      "senses": {
        "out": [
          {
            "zh": "拧干",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "write": {
      "display": "write",
      "prepositions": {
        "down": [
          "Write down your password somewhere safe. 把你的密码记在安全的地方。",
          "I wrote the address down on a napkin. 我把地址记在了一张餐巾纸上。"
        ],
        "to": [
          "He writes to his grandparents every month. 他每个月都给祖父母写信。"
        ],
        "about": [
          "She wrote about her travels in Africa. 她写了自己在非洲的游历。"
        ],
        "off": [
          "The bank wrote off the bad debt. 银行把那笔坏账核销了。",
          "Critics wrote the team off before the season began. 赛季开始前评论家就认定这支球队没戏了。"
        ],
        "up": [
          "I need to write up my notes before the exam. 考试前我得把笔记整理成文。"
        ],
        "back": [
          "I sent her an email, but she never wrote back. 我给她发了封邮件，但她一直没回。"
        ],
        "in": [
          "Many listeners wrote in to complain about the show. 许多听众写信投诉这档节目。"
        ]
      },
      "prepositionOrder": [
        "down",
        "to",
        "about",
        "off",
        "up",
        "back",
        "in"
      ],
      "zipf": 5.03,
      "senses": {
        "down": [
          {
            "zh": "写下；记下",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "to": [
          {
            "zh": "给……写信",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "about": [
          {
            "zh": "写关于……的内容",
            "kind": "preposition",
            "examples": [
              0
            ]
          }
        ],
        "off": [
          {
            "zh": "注销；认定……失败",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ],
        "up": [
          {
            "zh": "写成（报告等）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "back": [
          {
            "zh": "回信",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "in": [
          {
            "zh": "写信给（机构、媒体）",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    },
    "yearn": {
      "display": "yearn",
      "prepositions": {
        "for": [
          "Many people yearn for a quieter life. 很多人渴望更安静的生活。",
          "He yearned for home during his long trip. 长途旅行中他十分思念家乡。"
        ]
      },
      "prepositionOrder": [
        "for"
      ],
      "zipf": 2.97,
      "senses": {
        "for": [
          {
            "zh": "渴望",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "yell": {
      "display": "yell",
      "prepositions": {
        "at": [
          "Please stop yelling at the kids. 请别再冲孩子们大喊大叫了。",
          "The coach yelled at the referee. 教练冲裁判大声嚷嚷。"
        ]
      },
      "prepositionOrder": [
        "at"
      ],
      "zipf": 3.85,
      "senses": {
        "at": [
          {
            "zh": "冲……大喊大叫",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "yield": {
      "display": "yield",
      "prepositions": {
        "to": [
          "The government refused to yield to pressure. 政府拒绝屈服于压力。",
          "Drivers must yield to pedestrians at crossings. 在人行横道处，司机必须给行人让路。"
        ]
      },
      "prepositionOrder": [
        "to"
      ],
      "zipf": 4.16,
      "senses": {
        "to": [
          {
            "zh": "屈服于；让路给",
            "kind": "preposition",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "zero": {
      "display": "zero",
      "prepositions": {
        "in on": [
          "The researchers zeroed in on one key gene. 研究人员把焦点集中在一个关键基因上。",
          "The camera zeroes in on the actor's face. 镜头对准了演员的脸。"
        ]
      },
      "prepositionOrder": [
        "in on"
      ],
      "zipf": 4.63,
      "senses": {
        "in on": [
          {
            "zh": "瞄准；集中注意于",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "zip": {
      "display": "zip",
      "prepositions": {
        "up": [
          "Zip up your jacket; it's cold outside. 把夹克拉链拉上，外面很冷。",
          "Can you help me zip this dress up? 你能帮我把这条裙子的拉链拉上吗？"
        ]
      },
      "prepositionOrder": [
        "up"
      ],
      "zipf": 3.87,
      "senses": {
        "up": [
          {
            "zh": "拉上拉链",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "zone": {
      "display": "zone",
      "prepositions": {
        "out": [
          "I zoned out during the long lecture. 冗长的讲座中我走神了。",
          "Sorry, I zoned out for a second. What did you say? 抱歉，我刚才走神了。你说什么？"
        ]
      },
      "prepositionOrder": [
        "out"
      ],
      "zipf": 4.72,
      "senses": {
        "out": [
          {
            "zh": "走神；发呆",
            "kind": "particle",
            "examples": [
              0,
              1
            ]
          }
        ]
      }
    },
    "zoom": {
      "display": "zoom",
      "prepositions": {
        "in on": [
          "The camera zoomed in on the winner's face. 镜头拉近到获胜者的脸上。"
        ],
        "out": [
          "If we zoom out, the bigger picture becomes clear. 如果我们放眼全局，整体情况就清楚了。"
        ]
      },
      "prepositionOrder": [
        "in on",
        "out"
      ],
      "zipf": 3.83,
      "senses": {
        "in on": [
          {
            "zh": "放大；聚焦于",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ],
        "out": [
          {
            "zh": "拉远镜头；从宏观角度看",
            "kind": "particle",
            "examples": [
              0
            ]
          }
        ]
      }
    }
  },
  "prepositions": {
    "about": [
      "argue",
      "ask",
      "boast",
      "bother",
      "brag",
      "bring",
      "care",
      "chat",
      "complain",
      "disagree",
      "dream",
      "enquire",
      "feel",
      "forget",
      "fret",
      "fuss",
      "gossip",
      "grumble",
      "hear",
      "hesitate",
      "inform",
      "inquire",
      "joke",
      "know",
      "laugh",
      "learn",
      "lecture",
      "lie",
      "moan",
      "nag",
      "obsess",
      "preach",
      "protest",
      "quarrel",
      "quibble",
      "rant",
      "rave",
      "read",
      "remind",
      "see",
      "set",
      "speculate",
      "stress",
      "talk",
      "tease",
      "tell",
      "think",
      "warn",
      "wonder",
      "worry",
      "write"
    ],
    "at": [
      "aim",
      "arrive",
      "drive",
      "excel",
      "fire",
      "gaze",
      "get",
      "glance",
      "glare",
      "grin",
      "growl",
      "guess",
      "hint",
      "jump",
      "laugh",
      "look",
      "marvel",
      "nag",
      "nibble",
      "nod",
      "peer",
      "point",
      "poke",
      "rejoice",
      "scream",
      "shoot",
      "shout",
      "smile",
      "snap",
      "stare",
      "stick",
      "swear",
      "throw",
      "wave",
      "wink",
      "wonder",
      "yell"
    ],
    "for": [
      "account",
      "aim",
      "allow",
      "answer",
      "apologize",
      "appeal",
      "apply",
      "argue",
      "arrange",
      "ask",
      "atone",
      "bargain",
      "beg",
      "bid",
      "blame",
      "brace",
      "budget",
      "call",
      "care",
      "cater",
      "change",
      "charge",
      "check",
      "cheer",
      "compensate",
      "compete",
      "condemn",
      "contend",
      "cover",
      "cram",
      "die",
      "enter",
      "equip",
      "exchange",
      "fall",
      "fear",
      "feel",
      "fend",
      "fight",
      "file",
      "find",
      "fish",
      "forgive",
      "fumble",
      "go",
      "grieve",
      "head",
      "hope",
      "hunger",
      "hunt",
      "leave",
      "listen",
      "live",
      "long",
      "look",
      "make",
      "mistake",
      "mourn",
      "negotiate",
      "opt",
      "pass",
      "pay",
      "pine",
      "plan",
      "plead",
      "pose",
      "pray",
      "prepare",
      "press",
      "provide",
      "punish",
      "push",
      "qualify",
      "queue",
      "reach",
      "register",
      "root",
      "run",
      "scream",
      "search",
      "send",
      "settle",
      "shoot",
      "shop",
      "shout",
      "sit",
      "speak",
      "stand",
      "struggle",
      "substitute",
      "sue",
      "suffer",
      "swap",
      "thank",
      "trade",
      "train",
      "treat",
      "try",
      "vie",
      "volunteer",
      "vote",
      "vouch",
      "wait",
      "want",
      "watch",
      "wish",
      "work",
      "yearn"
    ],
    "from": [
      "abstain",
      "arise",
      "benefit",
      "borrow",
      "change",
      "choose",
      "come",
      "conceal",
      "conclude",
      "date",
      "derive",
      "descend",
      "deter",
      "detract",
      "deviate",
      "die",
      "differ",
      "differentiate",
      "dissuade",
      "distinguish",
      "eliminate",
      "emanate",
      "emerge",
      "emigrate",
      "escape",
      "evolve",
      "exclude",
      "exempt",
      "expect",
      "flee",
      "flow",
      "forbid",
      "free",
      "graduate",
      "hear",
      "hide",
      "infer",
      "inherit",
      "judge",
      "keep",
      "learn",
      "make",
      "order",
      "originate",
      "part",
      "prevent",
      "profit",
      "prohibit",
      "protect",
      "quote",
      "range",
      "recoil",
      "recover",
      "refrain",
      "resign",
      "result",
      "retire",
      "return",
      "save",
      "seek",
      "separate",
      "shelter",
      "shift",
      "shrink",
      "spring",
      "steal",
      "stem",
      "stop",
      "suffer",
      "tell",
      "translate",
      "vary",
      "withdraw"
    ],
    "in": [
      "abound",
      "absorb",
      "arrive",
      "assist",
      "believe",
      "blend",
      "book",
      "box",
      "break",
      "breathe",
      "bring",
      "butt",
      "call",
      "cash",
      "cave",
      "cheat",
      "check",
      "chip",
      "clock",
      "close",
      "come",
      "compete",
      "confide",
      "consist",
      "count",
      "creep",
      "cut",
      "dabble",
      "deal",
      "delight",
      "dig",
      "draw",
      "drop",
      "end",
      "engage",
      "engross",
      "enlist",
      "enroll",
      "excel",
      "factor",
      "fence",
      "figure",
      "fill",
      "fit",
      "get",
      "give",
      "graduate",
      "hand",
      "immerse",
      "increase",
      "indulge",
      "interest",
      "interfere",
      "intervene",
      "invest",
      "involve",
      "join",
      "jump",
      "key",
      "kick",
      "land",
      "let",
      "lie",
      "listen",
      "log",
      "major",
      "meddle",
      "move",
      "opt",
      "order",
      "originate",
      "pack",
      "participate",
      "persist",
      "phase",
      "pitch",
      "plug",
      "pop",
      "pour",
      "rake",
      "rein",
      "rejoice",
      "result",
      "revel",
      "roll",
      "rope",
      "rub",
      "set",
      "settle",
      "share",
      "show",
      "shut",
      "sign",
      "sink",
      "sleep",
      "sneak",
      "soak",
      "specialize",
      "squeeze",
      "stay",
      "step",
      "succeed",
      "suck",
      "swear",
      "take",
      "throw",
      "trade",
      "trust",
      "tuck",
      "tune",
      "turn",
      "type",
      "usher",
      "vary",
      "weigh",
      "wrap",
      "write"
    ],
    "into": [
      "be",
      "bite",
      "break",
      "bump",
      "burst",
      "buy",
      "change",
      "charge",
      "convert",
      "cram",
      "crowd",
      "delve",
      "dig",
      "dip",
      "dive",
      "divide",
      "drag",
      "drive",
      "ease",
      "eat",
      "empty",
      "enquire",
      "enter",
      "erupt",
      "evolve",
      "fade",
      "fall",
      "feed",
      "fit",
      "flow",
      "fly",
      "force",
      "frighten",
      "get",
      "go",
      "grow",
      "hack",
      "inject",
      "inquire",
      "insert",
      "integrate",
      "introduce",
      "knock",
      "lapse",
      "launch",
      "look",
      "make",
      "marry",
      "merge",
      "pack",
      "peer",
      "pile",
      "plunge",
      "pour",
      "pressure",
      "pry",
      "pump",
      "read",
      "run",
      "rush",
      "separate",
      "sink",
      "slip",
      "split",
      "squeeze",
      "suck",
      "talk",
      "tap",
      "translate",
      "trick",
      "turn",
      "usher",
      "venture",
      "wade",
      "walk"
    ],
    "of": [
      "accuse",
      "approve",
      "assure",
      "boast",
      "clear",
      "complain",
      "consist",
      "convict",
      "convince",
      "cure",
      "deprive",
      "despair",
      "die",
      "disapprove",
      "dispose",
      "dream",
      "expect",
      "hear",
      "inform",
      "know",
      "learn",
      "make",
      "notify",
      "relieve",
      "remind",
      "repent",
      "rid",
      "rob",
      "smell",
      "speak",
      "strip",
      "suspect",
      "taste",
      "think",
      "tire",
      "warn"
    ],
    "on": [
      "act",
      "add",
      "advise",
      "agree",
      "bank",
      "base",
      "bear",
      "bet",
      "blame",
      "border",
      "build",
      "call",
      "capitalize",
      "carry",
      "catch",
      "center",
      "cheat",
      "check",
      "cheer",
      "chew",
      "choke",
      "collaborate",
      "come",
      "comment",
      "concentrate",
      "confer",
      "congratulate",
      "cotton",
      "count",
      "dawn",
      "decide",
      "depend",
      "descend",
      "differ",
      "disagree",
      "dote",
      "drag",
      "draw",
      "dwell",
      "egg",
      "elaborate",
      "embark",
      "encroach",
      "expand",
      "experiment",
      "feast",
      "feed",
      "figure",
      "fix",
      "focus",
      "force",
      "found",
      "frown",
      "gamble",
      "get",
      "go",
      "grow",
      "hang",
      "harp",
      "have",
      "hinge",
      "hit",
      "hold",
      "hook",
      "hop",
      "impose",
      "impress",
      "improve",
      "inform",
      "insist",
      "jump",
      "keep",
      "land",
      "lead",
      "lean",
      "lecture",
      "let",
      "linger",
      "live",
      "look",
      "move",
      "muse",
      "operate",
      "pass",
      "pick",
      "pin",
      "plan",
      "pounce",
      "press",
      "prevail",
      "prey",
      "pride",
      "put",
      "rat",
      "reckon",
      "reflect",
      "rely",
      "remark",
      "report",
      "rest",
      "rule",
      "save",
      "seize",
      "serve",
      "settle",
      "sit",
      "sleep",
      "slip",
      "speculate",
      "spend",
      "spill",
      "spring",
      "spy",
      "stamp",
      "stay",
      "step",
      "stumble",
      "survive",
      "switch",
      "take",
      "tap",
      "tell",
      "thrive",
      "touch",
      "trade",
      "trample",
      "try",
      "turn",
      "urge",
      "vote",
      "wait",
      "waste",
      "weigh",
      "wish",
      "work"
    ],
    "onto": [
      "open"
    ],
    "to": [
      "accustom",
      "adapt",
      "add",
      "adhere",
      "adjust",
      "admit",
      "agree",
      "allude",
      "amount",
      "answer",
      "apologize",
      "appeal",
      "apply",
      "ascribe",
      "aspire",
      "attach",
      "attend",
      "attest",
      "attribute",
      "belong",
      "bow",
      "cater",
      "cling",
      "commit",
      "compare",
      "complain",
      "condemn",
      "confess",
      "confine",
      "conform",
      "connect",
      "consent",
      "contribute",
      "convert",
      "correspond",
      "dedicate",
      "defer",
      "devote",
      "donate",
      "draw",
      "drink",
      "elect",
      "emigrate",
      "entrust",
      "explain",
      "expose",
      "flock",
      "happen",
      "help",
      "hold",
      "introduce",
      "invite",
      "jump",
      "keep",
      "lead",
      "leak",
      "leave",
      "lend",
      "lie",
      "limit",
      "link",
      "listen",
      "look",
      "matter",
      "move",
      "object",
      "occur",
      "owe",
      "pander",
      "pertain",
      "point",
      "pray",
      "preach",
      "present",
      "proceed",
      "react",
      "reduce",
      "refer",
      "relate",
      "reply",
      "report",
      "resign",
      "resort",
      "respond",
      "restrict",
      "retire",
      "return",
      "revert",
      "rise",
      "see",
      "sentence",
      "shift",
      "speak",
      "spread",
      "stick",
      "stretch",
      "subject",
      "submit",
      "subscribe",
      "succeed",
      "succumb",
      "suit",
      "summon",
      "supply",
      "surrender",
      "swear",
      "switch",
      "tailor",
      "talk",
      "tend",
      "testify",
      "tie",
      "transfer",
      "treat",
      "tune",
      "turn",
      "upgrade",
      "warm",
      "wave",
      "whisper",
      "write",
      "yield"
    ],
    "with": [
      "acquaint",
      "agree",
      "argue",
      "assist",
      "associate",
      "bargain",
      "bear",
      "begin",
      "blend",
      "bless",
      "bother",
      "charge",
      "chat",
      "clash",
      "coincide",
      "collaborate",
      "collide",
      "communicate",
      "compare",
      "compete",
      "comply",
      "conclude",
      "concur",
      "confer",
      "confront",
      "confuse",
      "connect",
      "conspire",
      "consult",
      "contend",
      "contrast",
      "cooperate",
      "cope",
      "correspond",
      "cover",
      "deal",
      "differ",
      "disagree",
      "dispense",
      "do",
      "end",
      "endow",
      "engage",
      "entrust",
      "equate",
      "equip",
      "exchange",
      "experiment",
      "face",
      "familiarize",
      "fight",
      "fill",
      "finish",
      "fit",
      "flirt",
      "fool",
      "furnish",
      "glow",
      "go",
      "grapple",
      "help",
      "identify",
      "impress",
      "integrate",
      "interfere",
      "joke",
      "level",
      "liaise",
      "link",
      "live",
      "load",
      "match",
      "meet",
      "merge",
      "mess",
      "mingle",
      "mix",
      "negotiate",
      "open",
      "overflow",
      "pair",
      "part",
      "persist",
      "play",
      "plead",
      "present",
      "proceed",
      "provide",
      "quarrel",
      "reason",
      "reckon",
      "register",
      "rest",
      "share",
      "side",
      "square",
      "start",
      "stay",
      "stick",
      "stock",
      "struggle",
      "substitute",
      "supply",
      "swap",
      "sympathize",
      "talk",
      "tally",
      "tamper",
      "threaten",
      "tinker",
      "toy",
      "trade",
      "treat",
      "trust",
      "vary",
      "visit",
      "work",
      "wrestle"
    ],
    "against": [
      "advise",
      "appeal",
      "argue",
      "compete",
      "conspire",
      "decide",
      "discriminate",
      "fight",
      "find",
      "guard",
      "have",
      "hold",
      "insure",
      "lean",
      "play",
      "proceed",
      "prop",
      "protect",
      "protest",
      "race",
      "rail",
      "react",
      "rebel",
      "retaliate",
      "side",
      "struggle",
      "testify",
      "turn",
      "vote",
      "warn"
    ],
    "among": [
      "number",
      "rank"
    ],
    "as": [
      "act",
      "count",
      "double",
      "emerge",
      "identify",
      "label",
      "pose",
      "qualify",
      "rank",
      "regard",
      "serve",
      "strike",
      "train",
      "treat"
    ],
    "between": [
      "alternate",
      "choose",
      "differentiate",
      "discriminate",
      "distinguish",
      "divide",
      "oscillate"
    ],
    "by": [
      "abide",
      "divide",
      "drop",
      "get",
      "go",
      "increase",
      "judge",
      "multiply",
      "pass",
      "scrape",
      "stand",
      "stop",
      "swear",
      "swing",
      "understand"
    ],
    "like": [
      "feel",
      "look",
      "sound"
    ],
    "towards": [
      "count",
      "gear",
      "lean",
      "tend",
      "work"
    ],
    "under": [
      "go"
    ],
    "upon": [
      "depend",
      "happen",
      "stumble"
    ],
    "without": [
      "do",
      "go",
      "manage"
    ],
    "up": [
      "act",
      "add",
      "back",
      "bear",
      "beat",
      "blow",
      "book",
      "boot",
      "bottle",
      "break",
      "brighten",
      "bring",
      "buckle",
      "build",
      "bundle",
      "burn",
      "buy",
      "call",
      "carve",
      "catch",
      "chalk",
      "charge",
      "chase",
      "chat",
      "cheer",
      "chop",
      "clam",
      "clean",
      "clear",
      "climb",
      "clock",
      "come",
      "cough",
      "cover",
      "crack",
      "crank",
      "crop",
      "cuddle",
      "curl",
      "cut",
      "dig",
      "dish",
      "divide",
      "do",
      "double",
      "draw",
      "dream",
      "dress",
      "drink",
      "drive",
      "drum",
      "dry",
      "ease",
      "eat",
      "end",
      "fill",
      "finish",
      "fire",
      "fix",
      "flare",
      "fold",
      "follow",
      "gather",
      "get",
      "give",
      "go",
      "gobble",
      "grow",
      "hang",
      "heal",
      "heat",
      "hold",
      "hook",
      "hurry",
      "hush",
      "jack",
      "jazz",
      "join",
      "keep",
      "let",
      "light",
      "line",
      "load",
      "lock",
      "look",
      "make",
      "mark",
      "match",
      "measure",
      "meet",
      "mess",
      "mix",
      "mop",
      "mount",
      "move",
      "muddle",
      "offer",
      "open",
      "own",
      "pack",
      "pair",
      "pass",
      "patch",
      "perk",
      "pick",
      "pile",
      "play",
      "polish",
      "pop",
      "prop",
      "pull",
      "pump",
      "put",
      "queue",
      "rack",
      "ring",
      "rip",
      "roll",
      "round",
      "save",
      "screw",
      "seize",
      "serve",
      "set",
      "settle",
      "shake",
      "shoot",
      "show",
      "shut",
      "sit",
      "size",
      "slip",
      "snap",
      "soak",
      "sober",
      "speak",
      "speed",
      "split",
      "spring",
      "square",
      "stack",
      "stand",
      "start",
      "stay",
      "step",
      "stir",
      "straighten",
      "strike",
      "suit",
      "sum",
      "summon",
      "sweep",
      "take",
      "tear",
      "think",
      "throw",
      "tidy",
      "tie",
      "top",
      "touch",
      "trip",
      "tune",
      "turn",
      "type",
      "use",
      "wait",
      "wake",
      "warm",
      "wash",
      "weigh",
      "whip",
      "wind",
      "wipe",
      "wise",
      "work",
      "wrap",
      "write",
      "zip"
    ],
    "out": [
      "act",
      "ask",
      "average",
      "back",
      "bail",
      "bear",
      "black",
      "block",
      "blow",
      "bottom",
      "bow",
      "branch",
      "break",
      "breathe",
      "bring",
      "burn",
      "burst",
      "buy",
      "call",
      "carry",
      "carve",
      "catch",
      "check",
      "chill",
      "clean",
      "clear",
      "clock",
      "come",
      "count",
      "cross",
      "crowd",
      "cry",
      "cut",
      "deal",
      "die",
      "dig",
      "dine",
      "dish",
      "drag",
      "drop",
      "drown",
      "dry",
      "eat",
      "edge",
      "eke",
      "empty",
      "even",
      "fade",
      "fall",
      "fan",
      "figure",
      "fill",
      "find",
      "fish",
      "fit",
      "fizzle",
      "flesh",
      "force",
      "fork",
      "freak",
      "freeze",
      "give",
      "go",
      "hammer",
      "hand",
      "hang",
      "head",
      "hear",
      "help",
      "hire",
      "hold",
      "invite",
      "iron",
      "keep",
      "kick",
      "knock",
      "lay",
      "leak",
      "leave",
      "let",
      "lock",
      "log",
      "look",
      "lose",
      "make",
      "map",
      "mark",
      "miss",
      "move",
      "opt",
      "pan",
      "pass",
      "pay",
      "peter",
      "phase",
      "pick",
      "point",
      "pop",
      "pour",
      "print",
      "pull",
      "put",
      "reach",
      "read",
      "rent",
      "ride",
      "roll",
      "root",
      "rub",
      "rule",
      "seek",
      "sell",
      "send",
      "set",
      "share",
      "shout",
      "shut",
      "sign",
      "single",
      "sketch",
      "slip",
      "smell",
      "smooth",
      "sneak",
      "sort",
      "sound",
      "space",
      "spell",
      "spin",
      "spread",
      "stamp",
      "stand",
      "start",
      "stay",
      "stick",
      "straighten",
      "stress",
      "stretch",
      "strike",
      "sweat",
      "take",
      "tease",
      "thaw",
      "throw",
      "tire",
      "toss",
      "try",
      "tune",
      "turn",
      "venture",
      "vote",
      "walk",
      "watch",
      "wear",
      "weed",
      "wipe",
      "work",
      "wring",
      "zone",
      "zoom"
    ],
    "off": [
      "auction",
      "back",
      "be",
      "beat",
      "bite",
      "block",
      "bounce",
      "break",
      "call",
      "carry",
      "cast",
      "check",
      "close",
      "cool",
      "cordon",
      "cross",
      "cut",
      "dash",
      "die",
      "doze",
      "drift",
      "drive",
      "drop",
      "dry",
      "dust",
      "ease",
      "fall",
      "fence",
      "fend",
      "fight",
      "finish",
      "get",
      "give",
      "go",
      "head",
      "hit",
      "hold",
      "hop",
      "hurry",
      "keep",
      "kick",
      "kill",
      "knock",
      "laugh",
      "lay",
      "leave",
      "let",
      "level",
      "lift",
      "live",
      "nod",
      "pay",
      "peel",
      "polish",
      "pull",
      "put",
      "rain",
      "rattle",
      "rip",
      "round",
      "run",
      "rush",
      "scare",
      "seal",
      "see",
      "sell",
      "send",
      "set",
      "shake",
      "show",
      "shrug",
      "shut",
      "sign",
      "sleep",
      "sound",
      "spark",
      "spin",
      "start",
      "storm",
      "strike",
      "strip",
      "switch",
      "take",
      "taper",
      "tear",
      "tell",
      "tick",
      "tip",
      "top",
      "trade",
      "trail",
      "turn",
      "veer",
      "wall",
      "wander",
      "ward",
      "wash",
      "wave",
      "wean",
      "wear",
      "wipe",
      "work",
      "write"
    ],
    "down": [
      "back",
      "bend",
      "bog",
      "break",
      "bring",
      "buckle",
      "burn",
      "calm",
      "chop",
      "climb",
      "close",
      "cool",
      "count",
      "cut",
      "die",
      "dress",
      "face",
      "fall",
      "flag",
      "get",
      "go",
      "gulp",
      "hand",
      "hunt",
      "jot",
      "keep",
      "kneel",
      "knock",
      "lay",
      "let",
      "lie",
      "mark",
      "melt",
      "nail",
      "narrow",
      "note",
      "pass",
      "pin",
      "pipe",
      "play",
      "pull",
      "put",
      "quiet",
      "round",
      "run",
      "scribble",
      "settle",
      "shoot",
      "shout",
      "shut",
      "simmer",
      "sit",
      "slow",
      "stand",
      "step",
      "strike",
      "take",
      "tear",
      "tie",
      "tone",
      "touch",
      "track",
      "turn",
      "wash",
      "water",
      "wear",
      "weigh",
      "whittle",
      "wind",
      "wolf",
      "write"
    ],
    "away": [
      "back",
      "blow",
      "break",
      "carry",
      "chase",
      "clear",
      "drive",
      "explain",
      "fade",
      "fire",
      "fly",
      "frighten",
      "fritter",
      "gamble",
      "get",
      "give",
      "go",
      "hide",
      "idle",
      "keep",
      "melt",
      "move",
      "pass",
      "plug",
      "put",
      "run",
      "scare",
      "slave",
      "slip",
      "steal",
      "sweep",
      "throw",
      "tuck",
      "turn",
      "wash",
      "waste",
      "while",
      "whisk"
    ],
    "back": [
      "answer",
      "be",
      "bounce",
      "bring",
      "call",
      "choke",
      "come",
      "cut",
      "double",
      "draw",
      "fight",
      "get",
      "give",
      "go",
      "hand",
      "have",
      "head",
      "hit",
      "hold",
      "keep",
      "kick",
      "pay",
      "push",
      "ring",
      "send",
      "set",
      "sit",
      "step",
      "take",
      "talk",
      "turn",
      "win",
      "write"
    ],
    "over": [
      "be",
      "bend",
      "blow",
      "boil",
      "carry",
      "change",
      "chew",
      "clash",
      "cloud",
      "come",
      "cross",
      "cry",
      "do",
      "fall",
      "fight",
      "freeze",
      "fuss",
      "get",
      "gloss",
      "go",
      "grieve",
      "gush",
      "haggle",
      "hand",
      "have",
      "hesitate",
      "invite",
      "knock",
      "lean",
      "linger",
      "look",
      "loom",
      "move",
      "mull",
      "obsess",
      "ponder",
      "pore",
      "preside",
      "prevail",
      "pull",
      "puzzle",
      "quibble",
      "roll",
      "rule",
      "run",
      "sign",
      "skip",
      "sleep",
      "smooth",
      "spill",
      "start",
      "stop",
      "stumble",
      "sweat",
      "switch",
      "take",
      "talk",
      "think",
      "tick",
      "tip",
      "tower",
      "trip",
      "triumph",
      "turn",
      "walk",
      "watch",
      "weep",
      "win"
    ],
    "through": [
      "break",
      "browse",
      "fall",
      "flick",
      "flip",
      "follow",
      "get",
      "glance",
      "go",
      "leaf",
      "live",
      "look",
      "muddle",
      "plow",
      "pull",
      "put",
      "rifle",
      "run",
      "sail",
      "scrape",
      "scroll",
      "search",
      "see",
      "sift",
      "sit",
      "sleep",
      "sort",
      "think",
      "wade",
      "walk",
      "win"
    ],
    "around": [
      "ask",
      "boss",
      "center",
      "come",
      "crowd",
      "fool",
      "gather",
      "get",
      "hang",
      "kid",
      "look",
      "mess",
      "nose",
      "order",
      "poke",
      "push",
      "rally",
      "revolve",
      "shop",
      "show",
      "stick",
      "swing",
      "toss",
      "turn",
      "wait"
    ],
    "along": [
      "bring",
      "come",
      "move",
      "play",
      "sing",
      "tag"
    ],
    "across": [
      "come",
      "get",
      "run"
    ],
    "aside": [
      "cast",
      "lay",
      "put",
      "set",
      "wave"
    ],
    "apart": [
      "drift",
      "fall",
      "grow",
      "take",
      "tear",
      "tell"
    ],
    "ahead": [
      "forge",
      "get",
      "go",
      "lie",
      "plan",
      "push"
    ],
    "behind": [
      "fall",
      "lag",
      "leave",
      "trail"
    ],
    "forward": [
      "bring",
      "move",
      "put"
    ],
    "together": [
      "get",
      "hold",
      "huddle",
      "piece",
      "pull",
      "throw"
    ],
    "round": [
      "bring",
      "go"
    ],
    "after": [
      "ask",
      "chase",
      "hanker",
      "inquire",
      "look",
      "take"
    ],
    "above": [
      "rise"
    ],
    "out of": [
      "break",
      "cheat",
      "drop",
      "get",
      "grow",
      "run",
      "snap",
      "storm",
      "talk",
      "trick",
      "wriggle"
    ],
    "up on": [
      "bone",
      "catch",
      "check",
      "creep",
      "ease",
      "gang",
      "give",
      "hang",
      "read",
      "sneak",
      "stock"
    ],
    "up to": [
      "add",
      "be",
      "face",
      "feel",
      "lead",
      "live",
      "look",
      "measure",
      "suck",
      "wake"
    ],
    "up with": [
      "catch",
      "come",
      "fix",
      "follow",
      "hook",
      "keep",
      "make",
      "meet",
      "put",
      "team"
    ],
    "in on": [
      "cash",
      "close",
      "drop",
      "fill",
      "home",
      "let",
      "sit",
      "zero",
      "zoom"
    ],
    "out for": [
      "cry",
      "hold",
      "listen",
      "look",
      "try",
      "watch"
    ],
    "back to": [
      "date",
      "get",
      "hark",
      "think",
      "trace"
    ],
    "up for": [
      "gear",
      "make",
      "sign",
      "stand",
      "stick"
    ],
    "away from": [
      "shy",
      "stay",
      "tear",
      "walk"
    ],
    "down on": [
      "clamp",
      "crack",
      "cut",
      "look"
    ],
    "along with": [
      "get",
      "go",
      "sing"
    ],
    "away at": [
      "chip",
      "eat",
      "hammer"
    ],
    "back on": [
      "fall",
      "go",
      "look"
    ],
    "down to": [
      "boil",
      "get",
      "talk"
    ],
    "in with": [
      "fit",
      "move",
      "tie"
    ],
    "out on": [
      "miss",
      "splash",
      "walk"
    ],
    "away with": [
      "do",
      "get"
    ],
    "in for": [
      "fill",
      "stand"
    ],
    "off on": [
      "rub",
      "sign"
    ],
    "off with": [
      "go",
      "make"
    ],
    "on to": [
      "hold",
      "latch"
    ],
    "out with": [
      "go",
      "hang"
    ],
    "ahead with": [
      "go"
    ],
    "around to": [
      "get"
    ],
    "down with": [
      "come"
    ],
    "forward to": [
      "look"
    ],
    "on with": [
      "get"
    ],
    "out about": [
      "find"
    ],
    "out against": [
      "speak"
    ],
    "out at": [
      "lash"
    ],
    "out to": [
      "lose"
    ],
    "over with": [
      "get"
    ],
    "through to": [
      "get"
    ],
    "through with": [
      "go"
    ],
    "up against": [
      "stack"
    ],
    "up as": [
      "dress"
    ],
    "up in": [
      "mix"
    ]
  }
};
