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
| `index.html` | 应用本体，所有屏幕都在这一个文件里 |

### 为什么必须有 `.nojekyll`

GitHub Pages 默认用 Jekyll 处理整个站点，Jekyll 会**直接丢弃**以下划线开头的目录和文件
（`_data/`、`_config` 之类），并且会尝试解析 Markdown 与 Liquid 模板（`{{ }}`、`{% %}`）。
本项目的 `data/` 目录里既有 `.js` 也有 `.md`（语法书原文），一旦被 Jekyll 处理，
Markdown 会被渲染成 HTML，语法书就会加载到一堆 `<p>` 标签而不是原文。

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

站点会同步下载约 **35 MB** 的 JavaScript（未压缩体积；实际传输经 gzip 后约 31 MB），
其中绝大部分是词库和变位表：

| 文件 | 体积 |
| --- | --- |
| `data/it-conjugations.js` | 7.2 MB |
| `data/vocab/de.js` | 6.3 MB |
| `data/vocab/fr.js` | 4.6 MB |
| `data/vocab/it.js` | 4.1 MB |
| `data/vocab/en.js` | 3.8 MB |
| `data/en-conjugations.js` | 3.7 MB |

所有 `<script src>` 都带 `defer`：HTML 解析不再被脚本阻塞，加载动画能立刻画出来，
`defer` 之间严格保持文档顺序，依赖链和以前完全一致。

**尚未做**按语言拆包 / 懒加载 —— 目前打开意大利语也会下载德语、英语、法语的全部词库。
这需要改各语言模块自身的加载方式，属于下一轮工作。

对首次访问的用户来说，在慢网络下首屏之后仍会有可感知的等待。加载动画（`#loading`）
会一直显示进度文案，直到词库就绪。

---

## 6. 第三方 CDN

三个库来自 jsDelivr，全部锁定版本并带 SRI：

| 库 | 用途 | 挂掉时的表现 |
| --- | --- | --- |
| `chart.js@4.4.0` | 统计面板的图表 | 图表位置显示“图表库未能加载”，数据与其它功能不受影响 |
| `marked@9.1.6` | 语法书 Markdown 渲染 | 语法书退化成纯文本（`<pre>`），仍可阅读 |
| `@supabase/supabase-js@2.39.0` | 社区词本 | 社区词本进入不可用状态，本地词本不受影响 |

降级逻辑在 `index.html` 的 `window.CdnFallback` 里，通过 `<script onerror>` 触发，
并在 `DOMContentLoaded` 时再兜一次底（应对被拦截器静默替换、onerror 不触发的情况）。

离线自测降级效果：在 DevTools 的 Network 面板里屏蔽 `cdn.jsdelivr.net`，然后刷新。

---

## 7. 用户数据

- 全部存在浏览器 **localStorage**，不上传服务器、无需注册；
- 换设备、换浏览器、清除浏览器数据都会导致进度丢失；
- 备份走「设置与数据 → 导出数据」，恢复走「导入数据」（支持覆盖 / 合并两种模式）。

---

## 8. 移动端

站点是响应式的，iOS Safari / Android Chrome 都能正常使用。

> 说明：项目**没有** `manifest.json`，也没有 Service Worker，因此它**不是** PWA。
> 用 Safari 的「添加到主屏幕」只会得到一个书签图标，不会有独立的 App 窗口，
> 也**不支持离线访问**——每次打开都需要联网重新下载全部词库。
> 如果要做成真正可离线的 App，需要另外补 `manifest.json` + Service Worker 缓存策略。

---

## 9. 数据规模（以仓库内数据为准）

| 语言 | 系统词库 |
| --- | --- |
| 意大利语 | 27,117 条（其中同源词 1,587 条） |
| 英语 | 24,000 条 |
| 德语 | 15,507 条 |
| 法语 | 2,183 条（A1-B2 课程词表 + 词汇表去重后） |

页面上的数字由 `lib/router.js` 的 `syncDatasetCounts()` 在运行时从数据本身渲染，
HTML 里的数字只是占位，改数据不需要改文案。

校验命令：

```bash
node scripts/validate_vocab.js   # 打印四语言 data/vocab/<lang>.js 的条数与覆盖率
```

---

## 10. 故障排除

| 现象 | 排查方向 |
| --- | --- |
| 站点 404 | Pages 的 Source 分支/目录是否为 `main` + `/ (root)` |
| 语法书变成一堆 HTML 标签 | `.nojekyll` 是否真的提交上去了 |
| 改了代码线上没变 | 等满 10 分钟 + 硬刷新；用 `curl` 确认服务端内容 |
| 图表空白 | CDN 是否被拦截，控制台会有 `[cdn] chart.js 加载失败` |
| 法语板块整块消失 | `index.html` 里的 `#languageSkeletonPlaceholderScreen` 是否被删掉了 —— `french-app.js` 靠它定位插入点 |
| 打开很慢 | 见第 5 节，属于已知问题 |

祝学习愉快。Buono studio.
