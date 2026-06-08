# AGENTS.md — 给 AI 协作者的更新指南

> 本文档是 Claude Code / Codex / Hermes 等 agent 维护本仓库的**唯一权威指南**。
> 改任何内容前先读这里。

## 1. 项目长什么样

`zhanglu.net` — 张鲁的个人站。

- **框架**: Astro 5 + Tailwind 4 + Content Collections (Zod 校验)
- **托管**: Cloudflare Pages（直连 GitHub `zhanglunet/zhanglu.net`，push 即部署）
- **域名**: `zhanglu.net`

所有内容是**强类型 markdown / JSON 文件**。改一个文件 → 提交 → 推送 → 上线。

## 2. 加新项目

```bash
pnpm run new:project -- <slug> "项目名" "一句话标语" https://url.com 2026
```

或直接写 `src/content/projects/<slug>.md`：

```yaml
---
title: 项目名
tagline: 一句话标语
url: https://example.com           # 可选
repo: https://github.com/x/y       # 可选
cover: /covers/your-cover.png      # 可选
tech: [Astro, Tailwind, Cloudflare]
year: 2026
featured: false                    # true 才会上首页"精选项目"
status: live                       # live | beta | wip | archived
order: 99                          # 数字越小越靠前（首页和列表都用）
---

## 是什么

…

## 为什么做

…

## 你能怎么用

…
```

**Schema 在 `src/content/config.ts`，缺字段构建会失败。**

## 3. 加公众号 / 博客文章入口

写 `src/content/articles/<slug>.md`：

```yaml
---
title: 文章标题
source: wechat                     # wechat | substack | blog | x | other
url: https://mp.weixin.qq.com/...
date: 2026-05-20
summary: 一段话摘要（首页和列表都展示）
tags: [AI, 产品]
featured: false
---
```

正文 markdown 可有可无（这个 collection 主要是入口卡片，点击跳原文）。
首页"最近文章"按 `date` 倒序展示前 5 篇。

## 4. 同步本机 skills

```bash
pnpm run sync:skills
```

读 `~/.claude/skills/<name>/SKILL.md` 的 frontmatter（`name` + `description` + `category`），
生成 `src/content/skills/<name>.md`。

**保护机制**:
- 文件 frontmatter 含 `handwritten: true` → 同步会跳过（保留你的人化版本）
- 已有 `featured: true` 标志 → 同步保留

**给某个 skill 写人化介绍**:
1. 跑 `pnpm run sync:skills` 生成基础版
2. 改 `src/content/skills/<name>.md`：把 `handwritten: false` 改成 `true`，
   把正文改成你想写的（案例 / 截图 / 设计思路）
3. 以后 `sync:skills` 不会覆盖它

**首页精选展示**: 把 `featured: true` 设上，会上首页"Skills"区。

## 5. 改社交链接 / 关于页

- `src/data/social.json` — 社交链接（GitHub / X / 微信 / 邮箱）
  - 链接里有 `TODO` 字串的会被 Footer 隐藏，但仍在 about 页显示
- `src/data/about.json` — 名字 / 标语 / bio / 标签 / 头像路径
  - **首页 hero 文案就读这个文件**

## 6. 改首页排版 / 加新区块

`src/pages/index.astro` — 首页。改这一个文件即可。

页面结构: `Hero → 精选项目 → 最近文章 → Skills 概览`。
要加新区块（比如"演讲"、"获奖"），按其它 section 的模式复制即可。

## 7. 提交规范

```bash
git add -A
git commit -m "<type>: <短描述>"
git push origin main
```

`<type>` 建议: `add`（新内容） / `update`（改现有） / `fix`（修 bug） / `style`（视觉） / `chore`（脚手架）。

push 后 Cloudflare Pages 自动构建，~1-2 分钟上线。PR 自动出 preview URL。

## 8. 本地预览

```bash
pnpm dev          # http://localhost:4321
pnpm build        # 出 dist/ —— CF Pages 也跑这个
pnpm preview      # 起服看构建后产物
```

## 9. 不要做的事

- ❌ 不要直接改 `src/content/skills/` 下没有 `handwritten: true` 的文件（下次同步会覆盖）
- ❌ 不要把私密信息（API token / 私人邮箱）写进 `src/data/social.json`
- ❌ 不要删 `src/content/config.ts` 的字段——会让所有 markdown 校验失败
- ❌ 不要绕过 schema 偷偷加字段——加就在 `config.ts` 也加上

## 10. 部署链路全景

```
本地 edit
  ↓ git push origin main
GitHub: zhanglunet/zhanglu.net
  ↓ webhook
Cloudflare Pages
  ├─ pnpm install (用 packageManager 字段固定 pnpm@9)
  ├─ pnpm run build (= astro build)
  └─ 上线 → zhanglu-net.pages.dev + zhanglu.net (custom domain)
```

PR 自动 preview：`<branch>.zhanglu-net.pages.dev`

## 11. 初次部署到 CF Pages（一次性配置）

人来做：
1. Cloudflare dashboard → Pages → Create → Connect to Git
2. 选 `zhanglunet/zhanglu.net`，分支 `main`
3. Build command: `pnpm run build`
4. Build output dir: `dist`
5. Environment variable: `NODE_VERSION=22`
6. Save and deploy
7. 等首次构建完成，看 `<project>.pages.dev` 能否打开
8. Custom domains → add `zhanglu.net` → 按 CF 提示改 DNS（如果域名也在 CF，自动接管）
