# 听力精选

独立于阅读的四语导听目录。首页导览及顶部“听力”入口进入当前语言，可在目录选择意/法/德/英。

## 内容与权利

初版采用官方原站链接，不存储音视频、完整字幕、第三方缩略图或原站练习副本，不加载 iframe。链接可公开访问不等于取得再发布许可。未来嵌入必须逐条确认官方嵌入入口、条款及网站使用条件，不能自行拼接播放器地址。

每条包含 `id/lang/title/titleZh/provider/url/level/levelBasis/kind/addedAt/guideZh/verificationZh/vocabulary/questions`。`levelBasis` 为 `provider` 或 `editorial`，不能把母语儿童节目笼统标为 A2。`kind` 为 `lesson/news/directory`；已知来源日期 `sourcePublishedAt` 与本站整理日独立；时长未知则省略 `duration`。

题目为本站原创，四个同语平行选项、唯一 `answerIndex`、中文 `explanationZh`；仅依据实际听看或官方逐字稿核查，不从标题/简介猜测。证据不足时 `questions: []`，页面明确仅为导听资源。文字依据核查不等于实测音视频播放或音质。词义和导听为教学补充，不是逐字翻译。

## 交互与存储

路由 `#/<code>/listening`、`#/<code>/listening/lesson/<id>`。原站新标签打开，用户听完返回答题。答案与解析提交后显示；重做清空；无本地/远端进度写入，不影响原词汇或阅读数据。离开/切换语言时未提交答案不保留。

## 检查

运行 `node tests/test-listening.js`、`TZ=UTC npm test`。浏览器检查导览入口、四语切换、深链接、返回/前进、筛选空结果、原站跳转、未答/重复提交/重做，以及窄屏布局。检查播放器时区分可见入口、播放请求成功与实际音质核验，不夸大测试。
