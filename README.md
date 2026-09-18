# wimi

一个面向个人写作与摄影的 Hugo 主题。首页只呈现文字；文章、标签、相册与留言各有清晰的页面结构。没有前端框架、第三方主题或运行时构建依赖。

## 本地预览

需要 Hugo 0.166.0 或更新版本。在主题仓库运行：

```sh
hugo server --source exampleSite --themesDir "$(dirname "$PWD")" --port 1314
```

CI 会用同样的 `themesDir` 对 `exampleSite` 做一次 `--minify` 构建，并做简单冒烟检查，确认主题能独立产出站点。

示例站点在 `exampleSite/`，包含完整的 `hugo.toml` 配置以及文章、相册、留言内容。部署自己的站点时，把本仓库作为 `themes/hugo-wimi` 子模块，并在站点配置中设置 `theme = 'hugo-wimi'`。

请设置 `defaultContentLanguage`（如 `zh` 或 `en`），并可用 `locale`（如 `zh-CN`）补充 `html lang`。界面文案跟 `defaultContentLanguage` 走；菜单名与正文仍由站点自己提供。

## 内容结构

```text
content/
  _index.md                 首页补充内容，可留空
  posts/                    文章
  photos/_index.md          相册列表
  photos/<album>/index.md   一篇相册
  guestbook/_index.md       留言页
```

文章 front matter 可使用 Hugo 标准的 `date`、`tags`、`categories`，以及 `toc: true` 开启目录。相册正文只写一小段介绍，照片数据放在 front matter，不必插入图片 shortcode：

```yaml
---
title: 山间散步
date: 2026-09-01
description: 九月的一次散步。
photos:
  - src: albums/2026/walk/01.webp
    preview: albums/2026/walk/01-960.webp
    width: 1600
    height: 1067
    alt: 山谷中的小路
    caption: 山谷
    # 可选：浏览器响应式加载
    # srcset: https://photos.example.com/albums/2026/walk/01-480.webp 480w, https://photos.example.com/albums/2026/walk/01-960.webp 960w
    # sizes: (max-width: 640px) 100vw, 50vw
  - src: albums/2026/walk/02.webp
    preview: albums/2026/walk/02-960.webp
    width: 1600
    height: 1067
    alt: 清晨的树林
---

散步时拍下的一些风景。
```

`src` 是大图，`preview` 是照片墙用图，二者都可以是 R2 域名下的对象路径或完整 URL。省略 `preview` 时会直接使用原图；省略 `cover` 时相册列表使用第一张照片的预览图。可选 `srcset` / `sizes`（原样写入 `<img>`）；未写 `sizes` 时相册列表与详情默认按手机一列、平板两列、桌面三列设置。照片墙保留图片原始比例，建议上传约 960 像素宽的预览图并填写宽高，减少加载时的布局跳动。主题不会在构建阶段下载远程照片。

## 主要配置

完整可运行示例见 `exampleSite/hugo.toml`。正式站点可按需修改：

```toml
baseURL = 'https://wimi.space/'
defaultContentLanguage = 'zh'
locale = 'zh-CN'
title = 'Wimi 的个人空间'
theme = 'hugo-wimi'

[params]
  brand = 'wimi.'
  author = 'Wimi'
  description = '关于技术、生活和那些值得记录的瞬间。'
  dateFormat = '2006/01/02'
  footer = '用 Hugo 构建。'
  colorMode = 'dark'   # system | light | dark
  # ogImage = 'https://wimi.space/og.png'  # 无封面时的 OG / Twitter 图

  [params.home]
    heading = 'Wimi'
    intro = '写一些关于技术和生活的文字。'
    recentPosts = 8

  [params.article]
    tocOpen = true
    tocTitle = '目录'
    showAuthor = true
    showTaxonomies = true

  [params.photos]
    baseURL = 'https://photos.example.com/'

  [params.comments]
    enabled = true
    apiBase = '/api/comments'
    turnstileSiteKey = 'YOUR_PUBLIC_SITE_KEY'

[[menu.main]]
  name = '首页'
  pageRef = '/'
  weight = 10
[[menu.main]]
  name = '相册'
  pageRef = '/photos'
  weight = 20
[[menu.main]]
  name = '文章'
  pageRef = '/posts'
  weight = 30
[[menu.main]]
  name = '留言'
  pageRef = '/guestbook'
  weight = 40
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `defaultContentLanguage` | 界面语言（`zh` / `en`）。菜单与正文内容仍由站点提供。 |
| `params.colorMode` | 初始颜色模式：`system`（默认）、`light`、`dark`。访客可用页头按钮在三者间循环；选择写入 `localStorage` 键 `wimi-color-mode`。 |
| `params.home.heading` | 首页标题；未设置时使用站点 `title`。首页不自动插入照片。 |
| `params.ogImage` | 页面无封面 / 首图时的 Open Graph / Twitter 图（绝对 URL 或站内路径）。 |
| `params.photos.baseURL` | 相对路径图片前缀；相册页会对图片主机发出 `preconnect` / `dns-prefetch`。 |
| `params.comments.enabled` | 是否启用评论 / 留言。单页可用 `comments: false` 关闭。 |
| `params.comments.apiBase` | 评论 API 路径，默认 `/api/comments`。 |
| `params.comments.turnstileSiteKey` | Cloudflare Turnstile 公开站点密钥。 |

### 评论后端清单（Pages Functions + D1 + Turnstile + Access）

本主题只约定评论 API 的请求形状，不包含 Worker / Pages Function。启用前请自行准备：

1. Cloudflare Pages Function（或 Worker）实现 `GET/POST` 到 `apiBase`
2. D1（或其它存储）保存待审 / 已审评论
3. Turnstile：公开 `turnstileSiteKey` 放进站点配置；私密密钥只放在 Pages 环境变量
4. （可选）Cloudflare Access 保护审核后台
5. 没有评论服务时，将 `comments.enabled` 设为 `false`，其余页面仍可正常使用

`turnstileSiteKey` 是公开的站点密钥；私密密钥只配置在 Cloudflare Pages 环境变量中。Turnstile 脚本在评论表单进入视口时由 `comments.js` 懒加载，不会在 HTML 里默认注入。

界面文案在主题的 `i18n/zh.yaml` 与 `i18n/en.yaml`。站点 `defaultContentLanguage` 设为 `en` 即可切换英文界面。

## R2 图片

推荐为 R2 存储桶配置自有域名，并填入 `params.photos.baseURL`。照片对象使用不可变的路径；更新图片时换对象名，预览图可以设置较长的缓存时间。主题不依赖 Cloudflare Image Resizing，因此没有启用该服务也能运行。文章里的 Markdown 图片和 `figure` shortcode 会走同一套 URL 规则：完整 `http(s)` 地址保持不变，相对路径会拼上 `params.photos.baseURL`。`figure` 支持可选 `srcset`、`sizes`、`width`、`height`。旧 `gallery` shortcode 可暂时使用，但新相册建议使用 `photos` 数据字段。

## 样式与脚本（条件加载）

| 资源 | 何时加载 |
|------|----------|
| `tokens` + `base` + `layout` + `content` | 全站基础 CSS 包 |
| `gallery.css` | 相册列表与详情页 |
| `gallery.js` | 相册详情页的全屏灯箱 |
| `comments.css` / `comments.js` | 评论启用且当前页会渲染评论区时 |
| `theme.js` | 全站（小体积，defer） |
| `i18n-js` 数据节点 | 相册详情或评论页 |

首页、文章、标签与留言使用窄版心纸面；相册列表与详情使用圆角自适应照片墙。颜色 token 支持系统 `prefers-color-scheme`，以及 `html[data-theme=light|dark]` 覆盖。页头有防闪烁内联脚本读取 `wimi-color-mode`。Open Graph / Twitter 卡片使用页面封面、相册首图或 `params.ogImage`（绝对 URL）。正文链接有下划线，键盘聚焦保留可见轮廓。
