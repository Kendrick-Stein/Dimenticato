// French vocabulary curriculum for the Dimenticato French module.
// The topic progression follows the A1-B1 scope visible in the user's
// "你好！法语 / Le nouveau Taxi!" course books. Definitions and notes are
// independently written for this application; scanned textbook pages are not
// redistributed.
// Structure: { french, display, meaning, chinese, notes, rank, source }

const FRENCH_VOCABULARY_DATA = `
être|是；存在|A1 · 核心动词
avoir|有；拥有|A1 · 核心动词
faire|做；制作|A1 · 核心动词
aller|去；前往|A1 · 核心动词
venir|来；来到|A1 · 核心动词
pouvoir|能够；可以|A1 · 核心动词
vouloir|想要；愿意|A1 · 核心动词
devoir|应该；必须|A1 · 核心动词
savoir|知道；会|A1 · 核心动词
dire|说；告诉|A1 · 核心动词
parler|说话；谈论|A1 · 核心动词
voir|看见；理解|A1 · 核心动词
prendre|拿；乘坐；吃喝|A1 · 核心动词
mettre|放置；穿戴|A1 · 核心动词
donner|给；给予|A1 · 核心动词
trouver|找到；觉得|A1 · 核心动词
aimer|喜欢；爱|A1 · 核心动词
penser|思考；认为|A1 · 核心动词
demander|询问；请求|A1 · 核心动词
répondre|回答|A1 · 核心动词
bonjour|你好；日安|A1 · 问候
bonsoir|晚上好|A1 · 问候
salut|你好；再见（非正式）|A1 · 问候
au revoir|再见|A1 · 问候
à bientôt|回头见；很快再见|A1 · 问候
merci|谢谢|A1 · 礼貌表达
s'il vous plaît|请（正式或复数）|A1 · 礼貌表达
s'il te plaît|请（非正式单数）|A1 · 礼貌表达
excusez-moi|劳驾；请原谅|A1 · 礼貌表达
pardon|对不起；请再说一遍|A1 · 礼貌表达
oui|是；对|A1 · 基础表达
non|不；不是|A1 · 基础表达
d'accord|好的；同意|A1 · 基础表达
peut-être|也许|A1 · 基础表达
bien sûr|当然|A1 · 基础表达
je|我|A1 · 人称代词
tu|你（非正式单数）|A1 · 人称代词
il|他；它（阳性）|A1 · 人称代词
elle|她；它（阴性）|A1 · 人称代词
on|人们；我们（口语）|A1 · 人称代词
nous|我们|A1 · 人称代词
vous|您；你们|A1 · 人称代词
ils|他们；它们（阳性或混合）|A1 · 人称代词
elles|她们；它们（阴性）|A1 · 人称代词
qui|谁；……的人|A1 · 疑问词
que|什么；……的事物|A1 · 疑问词
quoi|什么|A1 · 疑问词
où|哪里；在……的地方|A1 · 疑问词
quand|什么时候|A1 · 疑问词
comment|怎样；如何|A1 · 疑问词
pourquoi|为什么|A1 · 疑问词
combien|多少|A1 · 疑问词
quel|哪个；什么样的（阳性）|A1 · 疑问限定词
quelle|哪个；什么样的（阴性）|A1 · 疑问限定词
et|和；并且|A1 · 连接词
ou|或者|A1 · 连接词
mais|但是|A1 · 连接词
parce que|因为|A1 · 连接词
donc|所以|A2 · 连接词
si|如果；是否；是的（反驳否定）|A1 · 连接词
le|这；该（阳性定冠词）|A1 · 冠词
la|这；该（阴性定冠词）|A1 · 冠词
les|这些；那些（复数定冠词）|A1 · 冠词
un|一个（阳性）|A1 · 冠词与数字
une|一个（阴性）|A1 · 冠词与数字
des|一些；复数不定冠词|A1 · 冠词
du|一些；从这个（阳性缩合）|A1 · 冠词
de la|一些（阴性部分冠词）|A1 · 冠词
de l'|一些（元音前）|A1 · 冠词
ce|这个（阳性）|A1 · 指示词
cette|这个（阴性）|A1 · 指示词
ces|这些|A1 · 指示词
mon|我的（阳性）|A1 · 所有词
ma|我的（阴性）|A1 · 所有词
mes|我的（复数）|A1 · 所有词
ton|你的（阳性）|A1 · 所有词
ta|你的（阴性）|A1 · 所有词
son|他／她的（阳性）|A1 · 所有词
sa|他／她的（阴性）|A1 · 所有词
notre|我们的|A1 · 所有词
votre|您的；你们的|A1 · 所有词
leur|他们的；她们的|A1 · 所有词
homme|男人；人|A1 · 人物
femme|女人；妻子|A1 · 人物
personne|人；没有人|A1 · 人物
ami|男性朋友|A1 · 人际关系
amie|女性朋友|A1 · 人际关系
famille|家庭；家人|A1 · 家庭
père|父亲|A1 · 家庭
mère|母亲|A1 · 家庭
parents|父母；亲属|A1 · 家庭
frère|兄弟|A1 · 家庭
sœur|姐妹|A1 · 家庭
fils|儿子|A1 · 家庭
fille|女儿；女孩|A1 · 家庭
enfant|孩子|A1 · 家庭
mari|丈夫|A1 · 家庭
nom|姓；名称|A1 · 身份
prénom|名|A1 · 身份
âge|年龄|A1 · 身份
adresse|地址|A1 · 身份
nationalité|国籍|A1 · 身份
français|法语；法国的；法国人|A1 · 语言与国籍
française|法国的；法国女性|A1 · 语言与国籍
chinois|中文；中国的；中国人|A1 · 语言与国籍
anglais|英语；英国的|A1 · 语言与国籍
allemand|德语；德国的|A1 · 语言与国籍
italien|意大利语；意大利的|A1 · 语言与国籍
pays|国家；乡村|A1 · 地理
France|法国|A1 · 地理
Chine|中国|A1 · 地理
ville|城市|A1 · 城市
village|村庄|A1 · 城市
rue|街道|A1 · 城市
place|广场；位置；座位|A1 · 城市
quartier|街区|A2 · 城市
maison|房子；家|A1 · 住房
appartement|公寓|A1 · 住房
chambre|房间；卧室|A1 · 住房
cuisine|厨房；烹饪|A1 · 住房
salle de bains|浴室|A1 · 住房
salon|客厅|A1 · 住房
porte|门|A1 · 住房
fenêtre|窗户|A1 · 住房
table|桌子|A1 · 物品
chaise|椅子|A1 · 物品
lit|床|A1 · 物品
livre|书|A1 · 物品
téléphone|电话；手机|A1 · 物品
ordinateur|电脑|A1 · 物品
clé|钥匙|A1 · 物品
travail|工作|A1 · 工作
métier|职业|A1 · 工作
emploi|工作岗位；使用|A2 · 工作
entreprise|公司；企业|A2 · 工作
bureau|办公室；书桌|A1 · 工作
collègue|同事|A2 · 工作
étudiant|男学生；大学生|A1 · 学习
étudiante|女学生；大学生|A1 · 学习
école|学校|A1 · 学习
université|大学|A1 · 学习
cours|课程|A1 · 学习
professeur|老师|A1 · 学习
apprendre|学习；得知|A1 · 学习
comprendre|理解|A1 · 学习
lire|阅读|A1 · 学习
écrire|写|A1 · 学习
jour|天；白天|A1 · 时间
semaine|星期；周|A1 · 时间
mois|月份；月|A1 · 时间
année|年|A1 · 时间
aujourd'hui|今天|A1 · 时间
demain|明天|A1 · 时间
hier|昨天|A1 · 时间
matin|早晨|A1 · 时间
après-midi|下午|A1 · 时间
soir|晚上|A1 · 时间
nuit|夜晚|A1 · 时间
heure|小时；时间点|A1 · 时间
minute|分钟|A1 · 时间
lundi|星期一|A1 · 日期
mardi|星期二|A1 · 日期
mercredi|星期三|A1 · 日期
jeudi|星期四|A1 · 日期
vendredi|星期五|A1 · 日期
samedi|星期六|A1 · 日期
dimanche|星期日|A1 · 日期
temps|时间；天气|A1 · 时间与天气
soleil|太阳；阳光|A1 · 天气
pluie|雨|A1 · 天气
chaud|热的|A1 · 天气与形容词
froid|冷的|A1 · 天气与形容词
beau|漂亮的；天气好的|A1 · 形容词
bon|好的；美味的|A1 · 形容词
grand|大的；高的|A1 · 形容词
petit|小的；矮的|A1 · 形容词
nouveau|新的|A1 · 形容词
vieux|老的；旧的|A1 · 形容词
jeune|年轻的|A1 · 形容词
facile|容易的|A1 · 形容词
difficile|困难的|A1 · 形容词
important|重要的|A2 · 形容词
intéressant|有趣的|A1 · 形容词
content|高兴的；满意的|A1 · 情绪
heureux|幸福的；高兴的|A2 · 情绪
triste|悲伤的|A1 · 情绪
fatigué|疲惫的|A1 · 情绪
beaucoup|很多；非常|A1 · 数量副词
peu|少；不太|A1 · 数量副词
très|非常|A1 · 程度副词
trop|太；过多|A1 · 程度副词
assez|相当；足够|A1 · 程度副词
plus|更多；加|A1 · 数量副词
moins|更少；减|A1 · 数量副词
toujours|总是；仍然|A1 · 频率副词
souvent|经常|A1 · 频率副词
parfois|有时|A1 · 频率副词
jamais|从不；永不|A1 · 频率副词
ici|这里|A1 · 地点副词
là|那里|A1 · 地点副词
maintenant|现在|A1 · 时间副词
déjà|已经|A2 · 时间副词
encore|还；再一次|A1 · 时间副词
avec|和；用|A1 · 介词
sans|没有；不带|A1 · 介词
pour|为了；给；持续|A1 · 介词
chez|在……家／机构|A1 · 介词
dans|在……里面|A1 · 介词
sur|在……上面；关于|A1 · 介词
sous|在……下面|A1 · 介词
devant|在……前面|A1 · 介词
derrière|在……后面|A1 · 介词
entre|在……之间|A1 · 介词
près de|靠近|A1 · 介词短语
loin de|远离|A1 · 介词短语
à gauche|向左；在左边|A1 · 方位
à droite|向右；在右边|A1 · 方位
tout droit|一直向前|A1 · 方位
manger|吃|A1 · 饮食
boire|喝|A1 · 饮食
eau|水|A1 · 饮食
café|咖啡；咖啡馆|A1 · 饮食
thé|茶|A1 · 饮食
pain|面包|A1 · 饮食
fromage|奶酪|A1 · 饮食
viande|肉|A1 · 饮食
poisson|鱼|A1 · 饮食
légume|蔬菜|A1 · 饮食
fruit|水果|A1 · 饮食
repas|一餐；饭|A1 · 饮食
petit déjeuner|早餐|A1 · 饮食
déjeuner|午餐；吃午饭|A1 · 饮食
dîner|晚餐；吃晚饭|A1 · 饮食
restaurant|餐馆|A1 · 饮食
marché|市场|A1 · 购物
magasin|商店|A1 · 购物
acheter|购买|A1 · 购物
vendre|出售|A1 · 购物
prix|价格；奖项|A1 · 购物
argent|钱；银|A1 · 购物
cher|昂贵的；亲爱的|A1 · 购物
gratuit|免费的|A2 · 购物
vêtement|衣服|A1 · 购物
chemise|衬衫|A1 · 购物
pantalon|裤子|A1 · 购物
robe|连衣裙|A1 · 购物
chaussure|鞋|A1 · 购物
couleur|颜色|A1 · 描述
rouge|红色的|A1 · 颜色
bleu|蓝色的|A1 · 颜色
vert|绿色的|A1 · 颜色
blanc|白色的|A1 · 颜色
noir|黑色的|A1 · 颜色
voyager|旅行|A1 · 旅行
voyage|旅行|A1 · 旅行
vacances|假期|A1 · 旅行
train|火车|A1 · 交通
avion|飞机|A1 · 交通
voiture|汽车|A1 · 交通
bus|公交车|A1 · 交通
métro|地铁|A1 · 交通
vélo|自行车|A1 · 交通
gare|火车站|A1 · 交通
aéroport|机场|A1 · 交通
billet|票；纸币|A1 · 交通
partir|离开；出发|A1 · 旅行
arriver|到达；发生|A1 · 旅行
rester|停留；保持|A1 · 旅行
retourner|返回；翻转|A2 · 旅行
réserver|预订；保留|A1 · 旅行
hôtel|酒店|A1 · 旅行
plage|海滩|A1 · 旅行
montagne|山；山区|A1 · 旅行
mer|海|A1 · 旅行
loisir|休闲活动|A2 · 休闲
sport|运动|A1 · 休闲
musique|音乐|A1 · 休闲
cinéma|电影；电影院|A1 · 休闲
photo|照片；摄影|A1 · 休闲
fête|节日；聚会|A1 · 休闲
jouer|玩；演奏|A1 · 休闲
écouter|听|A1 · 休闲
regarder|看；观看|A1 · 休闲
sortir|出去；外出|A1 · 休闲
santé|健康|A2 · 健康
maladie|疾病|A2 · 健康
médecin|医生|A1 · 健康
hôpital|医院|A1 · 健康
pharmacie|药店|A1 · 健康
mal|疼；不好地|A1 · 健康
tête|头|A1 · 身体
main|手|A1 · 身体
œil|眼睛|A1 · 身体
corps|身体|A2 · 身体
dormir|睡觉|A1 · 日常生活
se lever|起床|A1 · 日常生活
se coucher|上床睡觉|A1 · 日常生活
commencer|开始|A1 · 日常生活
finir|结束；完成|A1 · 日常生活
attendre|等待|A1 · 日常生活
porter|穿；携带|A1 · 日常生活
ouvrir|打开|A1 · 日常生活
fermer|关闭|A1 · 日常生活
vivre|生活；活着|A2 · 社会生活
changer|改变；更换|A2 · 社会生活
choisir|选择|A1 · 社会生活
décider|决定|A2 · 社会生活
essayer|尝试；试穿|A2 · 社会生活
réussir|成功；通过|A2 · 学习与工作
perdre|丢失；输|A2 · 日常生活
gagner|赢；赚|A2 · 日常生活
rencontrer|遇见；会面|A1 · 人际关系
inviter|邀请|A1 · 人际关系
aider|帮助|A1 · 人际关系
envoyer|发送|A2 · 沟通
recevoir|收到；接待|A2 · 沟通
message|消息|A1 · 沟通
lettre|信；字母|A1 · 沟通
internet|互联网|A1 · 媒体
journal|报纸；日记|A2 · 媒体
télévision|电视|A1 · 媒体
information|信息；新闻|A2 · 媒体
article|文章；商品|A2 · 媒体
réseau social|社交网络|A2 · 媒体
opinion|意见；观点|A2 · 观点表达
avis|意见；评价|A2 · 观点表达
idée|想法；主意|A1 · 观点表达
raison|理由；理性|A2 · 观点表达
problème|问题|A1 · 观点表达
solution|解决办法|A2 · 观点表达
possible|可能的|A2 · 观点表达
nécessaire|必要的|A2 · 观点表达
différent|不同的|A2 · 观点表达
même|相同的；甚至|A2 · 观点表达
exemple|例子|A2 · 观点表达
environnement|环境|B1 · 社会议题
nature|自然|A2 · 环境
pollution|污染|B1 · 环境
énergie|能源；精力|B1 · 环境
protéger|保护|A2 · 环境
société|社会；公司|B1 · 社会
culture|文化|A2 · 文化
histoire|历史；故事|A2 · 文化
art|艺术|A2 · 文化
avenir|未来|A2 · 时间与社会
projet|计划；项目|A2 · 计划
rêve|梦想|A2 · 计划
expérience|经历；经验；实验|B1 · 经历
souvenir|回忆；纪念品|A2 · 经历
habitude|习惯|A2 · 日常生活
liberté|自由|B1 · 社会议题
égalité|平等|B1 · 社会议题
responsabilité|责任|B1 · 社会议题
relation|关系|A2 · 人际关系
accord|协议；一致|B1 · 观点表达
désaccord|分歧；不同意|B1 · 观点表达
cependant|然而|B1 · 连接词
pourtant|然而；可是|B1 · 连接词
en revanche|相反；另一方面|B1 · 连接词
d'abord|首先|A2 · 组织表达
ensuite|然后|A2 · 组织表达
enfin|最后；终于|A2 · 组织表达
par exemple|例如|A2 · 组织表达
en général|一般来说|A2 · 组织表达
à mon avis|在我看来|A2 · 观点表达
selon|根据；依照|B1 · 观点表达
malgré|尽管；不顾|B1 · 让步表达
grâce à|多亏；由于（积极原因）|B1 · 原因表达
à cause de|由于（消极原因）|A2 · 原因表达
afin de|为了|B1 · 目的表达
alors que|而；然而；当……时|B1 · 复杂连接
tandis que|而；同时|B1 · 复杂连接
`.trim().split('\n').map((line, index) => {
  const [french, meaning, notes] = line.split('|');
  return {
    french,
    display: french,
    meaning,
    chinese: meaning,
    notes,
    rank: index + 1,
    source: '课程整理：你好！法语 A1-B1 主题范围'
  };
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FRENCH_VOCABULARY_DATA;
}
