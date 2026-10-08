# GitHub Pages 部署指南

Dimenticato 是一个**没有构建步骤**的纯静态站点：GitHub Pages 直接把 `main` 分支根目录
原样发布出去。改完代码 push 到 `main`，一两分钟后线上就是新版本，没有编译、没有产物目录。

线上地址：<https://kendrick-stein.github.io/Dimenticato/>

---

## 1. 首次配置

1. 仓库 → **Settings** → **Pages**
2. Source：**Deploy from a branch**
3. Branch：`main`，Folder：`/ (root)`
4. **Save**

配置完成后，每次 `git push origin main` 都会触发一次自动发布。

## 2. 日常更新

```bash
git add .
git commit -m "描述你的更改"
git push origin main
```

推送后等 1-2 分钟。仓库首页 **Actions** 里的 `pages build and deployment` 变绿即为发布完成。

---

## 3. 仓库里与部署直接相关的文件

| 文件 | 作用 |
| --- | --- |
| `.nojekyll` | **必须存在。** 关掉 GitHub Pages 默认的 Jekyll 处理 |
| `404.html` | 未知路径的兜底页，会把地址翻译成 hash 路由后跳回应用 |
| `index.html` | 应用本体：所有屏幕的骨架、引导脚本与 `CdnFallback` 都在这一个文件里；其余代码和数据由 `lib/lang-loader.js` 动态注入 |

### 为什么必须有 `.nojekyll`

GitHub Pages 默认用 Jekyll 处理整个站点，Jekyll 会**直接丢弃**以下划线开头的目录和文件
（`_data/`、`_config` 之类），并且会尝试解析 Markdown 与 Liquid 模板（`{{ }}`、`{% %}`）。
本项目的数据目前都是 `data/**/*.js`（语法书的 Markdown 以字符串形式内嵌在
`data/<code>-grammar.js` 里），站点本身不依赖任何 `.md` 文件；`.nojekyll` 让 Pages 原样
发布所有文件，不再经过 Jekyll 的过滤与渲染，以后无论加什么文件名都不会被悄悄吃掉或改写。

`.nojekyll` 是一个**空文件**，放在仓库根目录即可，它的存在本身就是开关。
注意：`.nojekyll` 以点开头，`git add .` 有时会漏掉它，第一次请显式确认：

```bash
git ls-files --error-unmatch .nojekyll   # 有输出 = 已被 git 跟踪
```

### 404.html 的行为

应用用的是 hash 路由（`#/it/vocab`、`#/de/grammar/book`），hash 部分不会发给服务器，
所以正常的深链接**不会**走到 404。会走到 404 的是拼错的路径或历史遗留的非 hash 链接，
`404.html` 会把 `/de/grammar` 这样的路径翻译成 `/#/de/grammar` 再跳回应用。

---

## 4. 缓存：为什么改了代码线上还是旧的

GitHub Pages 对静态资源返回的是 `Cache-Control: max-age=600`（10 分钟），
而且这个值**不能配置**——Pages 不支持自定义响应头，没有 `_headers`、没有 CDN 配置入口。

这意味着：

- 发布后最长 10 分钟内，老访客拿到的仍可能是旧文件；
- 更麻烦的是**部分更新**：`index.html` 已经是新版、某个 `.js` 还是缓存里的旧版，
  两者对不上时会出现“只有一半功能生效”的假象。

处理方式：

- 自测时一律硬刷新（macOS `Cmd+Shift+R`，Windows `Ctrl+Shift+R`）或用无痕窗口；
- 验证线上是否真的更新，用 `curl` 看内容而不是看浏览器：
  ```bash
  curl -sI https://kendrick-stein.github.io/Dimenticato/index.html | grep -i 'cache-control\|etag\|last-modified'
  ```
- 如果某次改动同时动了 `index.html` 和多个 `.js`，且新旧混用会出错，
  给受影响的 `<script src>` 加一个查询串（`?v=2026-08-04`）强制换 URL。
  目前**没有**这么做，因为现有模块对“新 HTML + 旧 JS”是容错的。

---

## 5. 首屏与体积

数据按语言、按模块两级懒加载（`lib/lang-loader.js`）：

- **首屏**只下载「共享代码 + 当前语言的词库」：共享代码 22 个文件约 0.5 MB，
  词库一门 3.9–6.3 MB（未压缩体积）。其他语言的词库只有切过去时才下载；
- **模块数据**（变位、语法、搭配、同源词、课程）在第一次打开对应模块时才下载，
  其中最大的是变位表。

| 文件 | 体积 | 何时下载 |
| --- | --- | --- |
| `data/vocab/de.js` | 6.3 MB | 进入德语 |
| `data/vocab/fr.js` | 4.6 MB | 进入法语 |
| `data/vocab/it.js` | 4.1 MB | 进入意大利语 |
| `data/vocab/en.js` | 3.9 MB | 进入英语 |
| `data/en-conjugations.js` | 4.5 MB | 打开英语动词变位 / 打字游戏变位模式 |
| `data/it-conjugations.js` | 4.3 MB | 同上（意大利语） |
| `data/fr-conjugations.js` | 4.3 MB | 同上（法语） |
| `data/de-conjugations.js` | 3.5 MB | 同上（德语） |

注入的脚本按顺序执行（`script.async = false`），依赖链与写在 `lib/lang-loader.js`
`CODE` 里的顺序一致。`index.html` 里只有 `lib/languages.js`、`lib/lang-loader.js`、
`lib/boot.js` 三个静态 `<script defer>`，HTML 解析不会被数据阻塞，加载动画能立刻画出来。

在慢网络下，首次进入一门语言或第一次打开变位模块仍会有可感知的等待；加载动画
（`#loading`）会显示进度文案，直到数据就绪。

---

## 6. 第三方 CDN

三个库来自 jsDelivr，全部锁定版本并带 SRI。页面里**没有**它们的 `<script>` 标签：
`index.html` 里的 `window.CdnFallback.load(name)` 在功能第一次用到时才注入，首屏不下载任何 CDN 脚本。

| 库 | 用途 | 挂掉时的表现 |
| --- | --- | --- |
| `chart.js@4.4.0` | 进度页的图表（进入进度页时加载） | 图表位置显示“图表库未能加载”，数据与其它功能不受影响 |
| `marked@9.1.6` | 语法书 Markdown 渲染（打开语法书时加载） | 语法书退化成纯文本（`<pre>`），仍可阅读 |
| `@supabase/supabase-js@2.39.0` | 社区词本（第一次连接社区词书时加载） | 社区词本进入不可用状态，本地词本不受影响 |

降级逻辑也在 `window.CdnFallback` 里：注入的脚本 `onerror`，或者 `onload` 了但全局变量
没出现（被拦截器静默替换），都会装上降级实现并在控制台打 `[cdn] … 加载失败`。
`load()` 返回的 Promise 成功失败都 resolve；supabase 失败后允许下次重试。

离线自测降级效果：在 DevTools 的 Network 面板里屏蔽 `cdn.jsdelivr.net`，然后刷新。

---

## 7. 用户数据

- 全部存在浏览器 **localStorage**，不上传服务器、无需注册；
- 换设备、换浏览器、清除浏览器数据都会导致进度丢失；
- 备份走「设置 → 导出数据」，恢复走「导入数据」（支持覆盖 / 合并两种模式）；
- 旧版本的存储布局会在第一次打开新版时自动迁移（`lib/storage.js` 的 `LegacyMigration`），旧备份也可直接导入。

---

## 8. 移动端

站点是响应式的，iOS Safari / Android Chrome 都能正常使用。

> 说明：项目**没有** `manifest.json`，也没有 Service Worker，因此它**不是** PWA。
> 用 Safari 的「添加到主屏幕」只会得到一个书签图标，不会有独立的 App 窗口，
> 也**不支持离线访问**——每次打开都需要联网（浏览器 HTTP 缓存有效期内可复用已下载的文件）。
> 如果要做成真正可离线的 App，需要另外补 `manifest.json` + Service Worker 缓存策略。

---

## 9. 数据规模（以仓库内数据为准）

| 语言 | 系统词库 | A1 | A2 | B1 | B2 | C1 | C2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 意大利语 | 27,117 条 | 600 | 900 | 1,500 | 3,000 | 6,000 | 15,117 |
| 德语 | 24,314 条 | 980 | 1,027 | 2,206 | 2,420 | 5,718 | 11,963 |
| 英语 | 24,000 条 | 600 | 900 | 1,500 | 3,000 | 6,000 | 12,000 |
| 法语 | 24,536 条 | 976 | 1,027 | 1,579 | 2,901 | 5,723 | 12,330 |

模块数据：动词变位 意 1,812 / 德 1,810 / 英 1,800 / 法 1,934 个动词；语法书 意 99 / 德 105 /
英 132 / 法 109 个专题；动词搭配 意 1,612 / 德 890 / 英 875 / 法 1,411 个动词；
同源词 意 1,586 / 德 2,349 / 法 4,269 条；德语课程 54 单元。

页面上的数字都由 `app.js` 在渲染时从已加载的数据本身算出（`Vocab.levelCounts` 等），
HTML 里没有写死的数字，改数据不需要改文案。

校验命令：

```bash
node scripts/validate_vocab.js     # 打印四语言 data/vocab/<code>.js 的条数与覆盖率
node scripts/validate_modules.js   # 全部模块数据对照 docs/data-schema.md
npm test                           # 推送到 main / 提 PR 时 CI 也会跑
```

---

## 10. 故障排除

| 现象 | 排查方向 |
| --- | --- |
| 站点 404 | Pages 的 Source 分支/目录是否为 `main` + `/ (root)` |
| 语法书变成一整块纯文本 | marked 没加载成功（CDN 被拦截），控制台会有 `[cdn] marked 加载失败` |
| 改了代码线上没变 | 等满 10 分钟 + 硬刷新；用 `curl` 确认服务端内容 |
| 图表空白 | CDN 是否被拦截，控制台会有 `[cdn] chart.js 加载失败` |
| 某个模块打不开 / 显示数据未加载 | Network 面板里对应的 `data/<code>-<module>.js` 是否 404 或被缓存成旧版；该语言档案（`lib/languages.js` 的 `files`）是否列了这个模块 |
| 打开很慢 | 见第 5 节：首次进入一门语言要下载 4–6 MB 词库 |

祝学习愉快。Buono studio.
