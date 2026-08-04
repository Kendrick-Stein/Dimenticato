// Original French grammar notes for Dimenticato.
// Topic scope is aligned with the A1-B1 progression identified in the user's
// "你好！法语" course books; explanations and examples are newly written.

const FRENCH_GRAMMAR_CONTENT = {
  'a1/pronunciation': `# 法语发音与拼写

法语拼写和读音并不是逐字母对应。学习新词时，应把**拼写、词性、读音和例句**一起记忆。

## 最重要的规律

- 词尾辅音通常不发音：petit 的 t、grand 的 d 通常不读。
- c 在 e、i、y 前多读 /s/，否则多读 /k/：cinéma、café。
- g 在 e、i、y 前多读 /ʒ/，否则多读 /g/：général、gare。
- eau、au 常读 /o/：beau、chaud。
- ou 常读 /u/：vous、bonjour。
- 鼻化元音常见于 an/en、on、in/ain：enfant、nom、pain。

## 联诵 liaison

当前一个词末尾原本不发音的辅音，遇到下一个以元音或哑音 h 开头的词时，有时会读出：

- les amis → /lezami/
- vous avez → /vuzave/

固定组合和人称代词 + 动词之间通常需要联诵；单数名词后一般不要随意联诵。`,

  'a1/articles-gender': `# 名词的性、数与冠词

法语名词分阳性和阴性。词性不能只靠词尾猜，建议始终连冠词记忆：**un livre、une table**。

| 类型 | 阳性 | 阴性 | 复数 |
|---|---|---|---|
| 定冠词 | le | la | les |
| 不定冠词 | un | une | des |

元音或哑音 h 前，le / la 缩合为 l'：l'ami、l'école。

## 复数

多数名词在书写时加 s，但词尾 s 通常不发音：

- un étudiant → des étudiants
- une voiture → des voitures

## 使用选择

- 首次提到、不确定对象：J'ai **un** livre.
- 已知对象、类别或泛指：J'aime **le** café.
- 身份或职业在 être 后通常不用冠词：Elle est médecin.`,

  'a1/present-pronouns': `# 主语人称与直陈式现在时

| 人称 | 含义 | parler |
|---|---|---|
| je | 我 | parle |
| tu | 你 | parles |
| il / elle / on | 他／她／人们、我们 | parle |
| nous | 我们 | parlons |
| vous | 您／你们 | parlez |
| ils / elles | 他们／她们 | parlent |

## 三类常见规则动词

- -er：parler → parle, parles, parle, parlons, parlez, parlent
- -ir（finir 型）：finis, finis, finit, finissons, finissez, finissent
- -re：vendre → vends, vends, vend, vendons, vendez, vendent

être、avoir、aller、faire 等高频动词不规则，应优先单独掌握。on 在口语中经常代替 nous，但动词仍使用第三人称单数：On va au cinéma.`,

  'a1/negation': `# 否定句

基本结构是 **ne + 变位动词 + pas**：

- Je parle français. → Je ne parle pas français.
- Il aime le café. → Il n'aime pas le café.

元音前 ne 变为 n'。口语中经常省略 ne，但正式写作应保留。

## 常见否定词

| 结构 | 含义 | 例句 |
|---|---|---|
| ne ... jamais | 从不 | Je ne fume jamais. |
| ne ... plus | 不再 | Elle ne travaille plus ici. |
| ne ... rien | 什么也不 | Je ne vois rien. |
| ne ... personne | 没有人 | Il ne connaît personne. |

复合时态中，否定通常夹住助动词：Je n'ai pas compris.`,

  'a1/questions': `# 提问方式

## 三种一般疑问句

1. 语调：Tu habites à Paris ?
2. est-ce que：Est-ce que tu habites à Paris ?
3. 主谓倒装：Habites-tu à Paris ?

从口语到正式书面语，三种方式依次更正式。

## 特殊疑问词

- Qui est-ce ? 谁？
- Qu'est-ce que tu fais ? 你做什么？
- Où habitez-vous ? 您住在哪里？
- Quand partez-vous ? 您什么时候出发？
- Pourquoi apprends-tu le français ? 你为什么学法语？
- Comment ça va ? 最近怎么样？

疑问词可放句首；口语里也常保留陈述语序：Tu pars quand ?`,

  'a1/adjectives': `# 形容词的性数配合与位置

形容词通常要与所修饰名词保持性、数一致：

- un étudiant français
- une étudiante française
- des étudiants français
- des étudiantes françaises

多数形容词阴性加 e，复数加 s；beau → belle、nouveau → nouvelle、vieux → vieille 等需要单独记忆。

## 位置

多数描述性形容词放在名词后：une voiture rouge、un film intéressant。

常见短形容词如 beau、bon、grand、petit、jeune、vieux、nouveau 常放在名词前：une petite maison。

有些形容词位置改变会改变含义：

- un grand homme：伟人
- un homme grand：高个子的男人`,

  'a1/possessive-demonstrative': `# 所有形容词与指示形容词

## 所有形容词

所有形容词与**被修饰名词**配合，不与拥有者的性别配合：

| 拥有者 | 阳性单数 | 阴性单数 | 复数 |
|---|---|---|---|
| je | mon | ma | mes |
| tu | ton | ta | tes |
| il / elle | son | sa | ses |
| nous | notre | notre | nos |
| vous | votre | votre | vos |
| ils / elles | leur | leur | leurs |

阴性名词以元音或哑音 h 开头时，为避免元音冲突使用 mon / ton / son：mon amie。

## 指示形容词

- ce livre
- cet ami（元音或哑音 h 前）
- cette maison
- ces livres / ces maisons`,

  'a1/prepositions': `# 地点介词与缩合

## à 和 de 的缩合

| 基本形式 | 缩合形式 |
|---|---|
| à + le | au |
| à + les | aux |
| de + le | du |
| de + les | des |

à la、à l'、de la、de l' 不缩合。

## 城市和国家

- à Paris / de Paris
- en France / de France（阴性国家）
- au Canada / du Canada（阳性国家）
- aux États-Unis / des États-Unis（复数国家）

## 位置

dans 在里面；sur 在上面；sous 在下面；devant 在前面；derrière 在后面；entre 在两者之间；chez 在某人家或某类专业场所。`,

  'a1/partitive': `# 部分冠词与数量

谈论不可数食物、饮料或不确定数量时，常用部分冠词：

- du pain
- de la viande
- de l'eau
- des légumes

## 否定与数量词之后

否定句中，du / de la / de l' / des 通常变为 de / d'：Je ne bois pas de café.

数量表达后也用 de：

- beaucoup de fruits
- un kilo de pommes
- une bouteille d'eau

但 être 后的冠词通常保留：Ce n'est pas du café.`,

  'a2/passe-compose': `# 复合过去时 passé composé

结构：**avoir 或 être 的现在时 + 过去分词**。

- J'ai visité Paris.
- Nous avons fini le travail.
- Elle est arrivée hier.

## 过去分词

- -er → -é：parler → parlé
- -ir → -i：finir → fini
- -re → -u：vendre → vendu

常见不规则形式：fait、eu、été、pris、mis、vu、lu、écrit、dit。

## 使用 être 的动词

常见移动或状态变化动词以及所有代词式动词使用 être：aller、venir、arriver、partir、entrer、sortir、naître、mourir、se lever。

使用 être 时，过去分词通常与主语配合：Elle est arrivée. Ils sont partis.`,

  'a2/imparfait-vs-pc': `# 未完成过去时与复合过去时

## imparfait 未完成过去时

取现在时 nous 形式去掉 -ons，加 -ais, -ais, -ait, -ions, -iez, -aient：nous parlons → je parlais。

être 是唯一常用特殊词干：ét- → j'étais。

## 怎么选择

- 背景、持续状态、习惯、天气：Quand j'étais petit, je jouais au foot.
- 完成事件、时间线推进：Hier, j'ai rencontré Paul.
- 背景中发生的事件：Je lisais quand le téléphone a sonné.

可以把 imparfait 想成故事的背景画面，把 passé composé 想成推动故事前进的事件。`,

  'a2/future': `# 最近将来与简单将来时

## futur proche 最近将来

aller 的现在时 + 不定式：

- Je vais partir.
- Nous allons étudier.

常表示已有计划或马上发生的事情。

## futur simple 简单将来时

不定式（-re 动词去掉末尾 e）加 -ai, -as, -a, -ons, -ez, -ont：

- parler → je parlerai
- vendre → nous vendrons

常见不规则词干：être ser-、avoir aur-、aller ir-、faire fer-、venir viendr-、pouvoir pourr-、vouloir voudr-、devoir devr-。`,

  'a2/object-pronouns': `# 直接宾语和间接宾语代词

## 直接宾语 COD

me, te, le / la, nous, vous, les，直接放在变位动词前：

- Je regarde le film. → Je le regarde.
- Tu connais Marie ? → Oui, je la connais.

## 间接宾语 COI

me, te, lui, nous, vous, leur，通常替代 à + 人：

- Je téléphone à Paul. → Je lui téléphone.
- Elle écrit à ses parents. → Elle leur écrit.

复合时态中代词仍放在助动词前：Je l'ai vu. Je lui ai parlé.`,

  'a2/y-en': `# 代词 y 和 en

## y

y 通常替代地点或 à + 事物：

- Tu vas à Paris ? → Oui, j'y vais.
- Tu penses à ce projet ? → Oui, j'y pense.

## en

en 通常替代 de + 名词、部分冠词或数量表达：

- Tu veux du café ? → Oui, j'en veux.
- Tu parles de ce film ? → Oui, j'en parle.
- Tu as trois frères ? → Oui, j'en ai trois.

y 和 en 通常放在变位动词前；肯定命令式中放在动词后：Vas-y ! Parles-en !`,

  'a2/relative-pronouns': `# 关系代词 qui、que、où、dont

关系代词把两个句子连接起来，并避免重复名词。

- qui 在从句中作主语：C'est un livre **qui** est intéressant.
- que 在从句中作直接宾语：C'est le livre **que** je lis.
- où 表示地点或时间：Voici la ville **où** je suis né.
- dont 替代 de + 名词：C'est le film **dont** je parle.

判断 qui 和 que 时，只看关系代词在从句中的功能：其后直接跟动词通常用 qui；其后已有主语通常用 que。`,

  'a2/comparison': `# 比较级与最高级

## 形容词和副词

- plus ... que：比……更
- aussi ... que：和……一样
- moins ... que：不如……

Paris est plus grand que Lyon. Elle parle aussi vite que toi.

## 名词和动词

- plus de / autant de / moins de + 名词 + que
- 动词 + plus / autant / moins + que

## 最高级

le / la / les plus 或 le / la / les moins：C'est la ville la plus visitée.

特殊形式：bon → meilleur；bien → mieux。`,

  'a2/stressed-pronouns': `# 重读人称代词

重读形式：moi, toi, lui, elle, nous, vous, eux, elles。

常见用途：

- 介词后：avec moi、chez eux、pour elle
- 强调或对比：Moi, j'aime le thé. Lui, il préfère le café.
- 无动词回答：Qui veut venir ? — Moi !
- c'est 后：C'est lui.

注意 lui 既可以是阳性重读代词，也可以是第三人称单数间接宾语代词，要根据位置判断。`,

  'b1/conditional': `# 条件式现在时 conditionnel présent

词干与简单将来时相同，词尾与未完成过去时相同：-ais, -ais, -ait, -ions, -iez, -aient。

- parler → je parlerais
- venir → nous viendrions
- être → vous seriez

## 主要用途

- 礼貌请求：Je voudrais un café. Pourriez-vous m'aider ?
- 建议：Tu devrais te reposer.
- 愿望：J'aimerais voyager davantage.
- 未经证实的信息：Le ministre serait à Paris.

条件式不仅表示“有条件才发生”，也是法语里降低语气强度的重要工具。`,

  'b1/si-clauses': `# si 条件句

## 现实或可能条件

si + 现在时，主句用现在时、将来时或命令式：

- Si tu as le temps, appelle-moi.
- S'il fait beau, nous irons à la plage.

## 与现实距离较远的假设

si + imparfait，主句用 conditionnel présent：

- Si j'avais plus de temps, je voyagerais davantage.

## 过去未实现的假设

si + plus-que-parfait，主句用 conditionnel passé：

- Si j'avais su, je serais venu.

标准法语中 si 后不要直接使用简单将来时或条件式。`,

  'b1/subjunctive': `# 虚拟式现在时 subjonctif présent

虚拟式常出现在 que 引导的从句中，表达愿望、必要性、情感、怀疑或主观评价。

- Il faut que tu viennes.
- Je veux qu'il fasse attention.
- Je suis content que vous soyez ici.
- Je ne pense pas que ce soit possible.

多数动词以 ils 的现在时词干去掉 -ent，再加 -e, -es, -e, -ions, -iez, -ent。

常见不规则：être → sois；avoir → aie；aller → aille；faire → fasse；pouvoir → puisse；savoir → sache。

同一主语通常使用不定式：Je veux partir. 不同主语才使用 que + 虚拟式：Je veux que tu partes.`,

  'b1/passive': `# 被动语态

结构：**être 的相应时态 + 过去分词**。过去分词与主语进行性数配合。

- La lettre est envoyée par Paul.
- Ces maisons ont été construites en 2010.

动作执行者常由 par 引出；描述状态或某些情感时也可能使用 de。

法语常用其他结构避免生硬的被动句：

- on + 主动句：On parle français ici.
- 代词式结构：Ce livre se vend bien.

只有在受事者确实是信息焦点时，被动语态才通常最自然。`,

  'b1/reported-speech': `# 间接引语

## 引述动词在现在时

时态通常不变：

- Il dit : « Je suis prêt. » → Il dit qu'il est prêt.
- Elle demande : « Tu viens ? » → Elle demande si tu viens.

## 引述动词在过去时

正式叙述中常发生时态呼应：现在时 → imparfait；passé composé → plus-que-parfait；futur → conditionnel。

- Il a dit : « Je partirai. » → Il a dit qu'il partirait.

还要根据说话视角调整人称、时间和地点词：aujourd'hui → ce jour-là；demain → le lendemain；ici → là。`,

  'b1/connectors': `# 组织论述的连接词

## 安排结构

d'abord 首先；ensuite 然后；enfin 最后；d'une part ... d'autre part 一方面……另一方面。

## 原因与结果

parce que / puisque / comme 因为；grâce à 多亏；à cause de 由于；donc / c'est pourquoi 因此。

## 对比与让步

mais 但是；pourtant / cependant 然而；en revanche 另一方面；même si 即使；bien que + 虚拟式 尽管。

## 目的与举例

pour / afin de + 不定式；pour que / afin que + 虚拟式；par exemple 例如；notamment 尤其。

写作时不要堆积连接词。每个连接词都应明确说明两句话之间的逻辑关系。`
};

function makeFrenchGrammarPart(title, level, topics) {
  return {
    title: `${level} · ${title}`,
    slug: level.toLowerCase(),
    chapters: [{
      title,
      slug: `${level.toLowerCase()}/${title}`,
      topics
    }]
  };
}

const FRENCH_GRAMMAR_DATA = {
  meta: {
    title: '法语语法',
    description: '从左侧目录选择 A1-B1 专题开始阅读'
  },
  tree: {
    parts: [
      makeFrenchGrammarPart('语音与名词基础', 'A1', [
        { title: '发音与拼写', slug: 'a1/pronunciation' },
        { title: '名词的性、数与冠词', slug: 'a1/articles-gender' }
      ]),
      makeFrenchGrammarPart('句子骨架', 'A1', [
        { title: '主语人称与现在时', slug: 'a1/present-pronouns' },
        { title: '否定句', slug: 'a1/negation' },
        { title: '提问方式', slug: 'a1/questions' }
      ]),
      makeFrenchGrammarPart('名词短语', 'A1', [
        { title: '形容词的配合与位置', slug: 'a1/adjectives' },
        { title: '所有词与指示词', slug: 'a1/possessive-demonstrative' },
        { title: '地点介词与缩合', slug: 'a1/prepositions' },
        { title: '部分冠词与数量', slug: 'a1/partitive' }
      ]),
      makeFrenchGrammarPart('过去与将来', 'A2', [
        { title: '复合过去时', slug: 'a2/passe-compose' },
        { title: '未完成过去时 vs 复合过去时', slug: 'a2/imparfait-vs-pc' },
        { title: '最近将来与简单将来时', slug: 'a2/future' }
      ]),
      makeFrenchGrammarPart('代词系统', 'A2', [
        { title: '直接与间接宾语代词', slug: 'a2/object-pronouns' },
        { title: '代词 y 和 en', slug: 'a2/y-en' },
        { title: '关系代词', slug: 'a2/relative-pronouns' },
        { title: '重读人称代词', slug: 'a2/stressed-pronouns' }
      ]),
      makeFrenchGrammarPart('描述与比较', 'A2', [
        { title: '比较级与最高级', slug: 'a2/comparison' }
      ]),
      makeFrenchGrammarPart('假设与主观表达', 'B1', [
        { title: '条件式现在时', slug: 'b1/conditional' },
        { title: 'si 条件句', slug: 'b1/si-clauses' },
        { title: '虚拟式现在时', slug: 'b1/subjunctive' }
      ]),
      makeFrenchGrammarPart('复杂表达', 'B1', [
        { title: '被动语态', slug: 'b1/passive' },
        { title: '间接引语', slug: 'b1/reported-speech' },
        { title: '论述连接词', slug: 'b1/connectors' }
      ])
    ]
  },
  content: FRENCH_GRAMMAR_CONTENT
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FRENCH_GRAMMAR_DATA;
}
