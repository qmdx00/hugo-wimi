# wimi

一个面向个人写作与摄影的 Hugo 主题。首页只呈现文字；文章、标签、相册与留言各有清晰的页面结构。没有前端框架、第三方主题或运行时构建依赖。

## 本地预览

需要 Hugo 0.166.0 或更新版本。在主题仓库运行：

```sh
hugo server --source exampleSite --themesDir "$(dirname "$PWD")" --port 1314
```

CI 会用同样的 `themesDir` 对 `exampleSite` 做一次 `--minify` 构建，确认主题能独立产出站点。

示例站点在 `exampleSite/`，包含完整的 `hugo.toml` 配置以及文章、相册、留言内容。部署自己的站点时，把本仓库作为 `themes/hugo-wimi` 子模块，并在站点配置中设置 `theme = 'hugo-wimi'`。

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
  - src: albums/2026/walk/02.webp
    preview: albums/2026/walk/02-960.webp
    width: 1600
    height: 1067
    alt: 清晨的树林
---

散步时拍下的一些风景。
```

`src` 是大图，`preview` 是照片墙用图，二者都可以是 R2 域名下的对象路径或完整 URL。省略 `preview` 时会直接使用原图；省略 `cover` 时相册列表使用第一张照片的预览图。建议上传约 960 像素宽的预览图、保留原图，并填写原图宽高；浏览器据此预留比例，避免滚动时布局跳动。主题不会在构建阶段下载远程照片。

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

  [params.home]
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
  name = '文章'
  pageRef = '/posts'
  weight = 10
[[menu.main]]
  name = '标签'
  pageRef = '/tags'
  weight = 20
[[menu.main]]
  name = '相册'
  pageRef = '/photos'
  weight = 30
[[menu.main]]
  name = '留言'
  pageRef = '/guestbook'
  weight = 40
```

`turnstileSiteKey` 是公开的站点密钥；私密密钥只配置在 Cloudflare Pages 环境变量中。本主题只约定评论 API 的请求形状，不包含 Worker 或 Pages Function。没有评论服务时，将 `comments.enabled` 设为 `false`，其余页面仍可正常使用。

界面文案在主题的 `i18n/zh.yaml` 与 `i18n/en.yaml`。站点 `defaultContentLanguage` 设为 `en` 即可切换英文界面；菜单名与文章内容仍由站点自己提供。

## R2 图片

推荐为 R2 存储桶配置自有域名，并填入 `params.photos.baseURL`。照片对象使用不可变的路径；更新图片时换对象名，预览图可以设置较长的缓存时间。主题不依赖 Cloudflare Image Resizing，因此没有启用该服务也能运行。文章里的 Markdown 图片和 `figure` shortcode 会走同一套 URL 规则：完整 `http(s)` 地址保持不变，相对路径会拼上 `params.photos.baseURL`。旧 `gallery` shortcode 可暂时使用，但新相册建议使用 `photos` 数据字段。

## 样式与脚本

样式分为 `assets/css/tokens.css`、`base.css`、`layout.css`、`content.css`、`gallery.css`、`comments.css`，由 Hugo Pipes 合并、压缩并生成指纹。颜色写在 token 里，并跟随系统的 `prefers-color-scheme` 切换浅色 / 深色。相册与评论脚本只在对应页面加载。链接默认无下划线，键盘聚焦仍有可见轮廓。
