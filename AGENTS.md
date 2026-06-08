# AGENTS.md — zhanglu.net 协作者权威指南

> 本文档是 Claude Code / Codex / Hermes 等 AI agent 维护本仓库的**唯一权威指南**。
> 改任何内容前先读这里。
> `CLAUDE.md` 用 `@AGENTS.md` 把本文导入到 Claude Code 的 system context。

---

## 1. 项目概览

**zhanglu.net** —— 张路的个人站。聚合：项目、公众号文章入口、本机 Claude Skills 索引、社交链接。

| 维度 | 现状 |
|---|---|
| 工作目录 | `/Users/john/zhanglu/` |
| GitHub | https://github.com/zhanglunet/zhanglu.net （main 分支） |
| 主域名 | https://zhanglu.net |
| 备用域名 | https://zhanglu-net.pages.dev |
| 托管 | Cloudflare Pages（project name: `zhanglu-net`），DNS 同账号托管 |
| 部署触发 | push `main` → CF Pages 自动构建部署，~1-2 分钟上线 |
| PR 预览 | 自动出 `<branch>.zhanglu-net.pages.dev` |
| 语言 | 中文为主，前端 lang="zh-CN" |
| 视觉 | 书卷气、低饱和度、衬线标题（Source Serif / Noto Serif SC）、`#b14b3a` 朱砂色 accent |

---

## 2. 技术栈

```
Node 22 (.nvmrc / .node-version 锁定)
pnpm 9.15 (package.json packageManager 字段锁定, CF 走 Corepack)
Astro 5.18    框架 + 静态构建
Tailwind 4.3  用 @tailwindcss/vite 插件 (不是 @astrojs/tailwind, 二者不可混用)
@astrojs/mdx       支持 .mdx 内容
@astrojs/sitemap   自动生成 sitemap-index.xml
@astrojs/rss       /rss.xml 输出
gray-matter        scripts/sync-skills.mjs 读 SKILL.md frontmatter
```

关键配置:
- `astro.config.mjs` — `site: 'https://zhanglu.net'`，integrations 顺序 `mdx() → sitemap()`，vite plugins 里挂 `tailwindcss()`
- `tsconfig.json` — extends `astro/tsconfigs/strict`，paths `@/* → src/*`
- `src/content/config.ts` — Zod schemas（projects / articles / skills），缺字段或类型不对 **构建失败**
- `src/styles/global.css` — Tailwind 4 用 `@import "tailwindcss"` + `@theme { --color-... }` 自定义主题

---

## 3. 目录结构（注释版）

```
zhanglu/
├── AGENTS.md                      ← 你正在读的指南
├── CLAUDE.md                      ← 一行 @AGENTS.md, Claude Code 自动加载
├── README.md                      ← 人看的快速入口
├── LICENSE                        ← MIT (来自 GitHub init)
├── astro.config.mjs
├── tsconfig.json
├── package.json                   ← scripts: dev / build / sync:skills / new:project
├── pnpm-lock.yaml
├── .nvmrc / .node-version         ← node 22, CF Pages 也读
├── .gitignore
│
├── public/                        ← 原样拷贝到站点根
│   ├── favicon.svg                ← 含一个"路"字 + 朱砂圆点
│   └── wechat-qr.jpg              ← 公众号「张路的碎碎念」二维码 (258×258)
│
├── src/
│   ├── content/
│   │   ├── config.ts              ← Zod schemas (改这里 = 改全站数据契约)
│   │   ├── projects/              ← 一个项目 = 一个 .md
│   │   ├── articles/              ← 公众号 / 博客文章入口 = 一个 .md
│   │   └── skills/                ← 29 个 skill, 15 个 sync 自动生成 + 14 个手写中文
│   │
│   ├── data/                      ← 静态 JSON, 给所有页面读
│   │   ├── about.json             ← 名字 / tagline / bio / tags (首页 hero 直接读)
│   │   └── social.json            ← GitHub / X / 公众号 (含 QR)
│   │
│   ├── components/
│   │   ├── Header.astro           ← 导航栏 (首页/项目/文章/Skills/关于)
│   │   ├── Footer.astro           ← 版权 + 已配置的社交链
│   │   ├── ProjectCard.astro      ← 项目卡片 (列表 + 首页用)
│   │   ├── ArticleCard.astro      ← 文章入口卡片
│   │   ├── SkillCard.astro        ← Skill 卡片 (line-clamp-4 + whitespace-pre-line)
│   │   └── SocialLinks.astro      ← About 页用, 支持 url 链接 + qrcode 折叠展开
│   │
│   ├── layouts/
│   │   └── Base.astro             ← 所有页面壳: <head> 注入 SEO meta / sitemap / RSS link
│   │
│   ├── pages/                     ← Astro 文件系统路由
│   │   ├── index.astro            ← 首页: hero + 精选项目 + 最近 5 篇文章 + Skills 概览
│   │   ├── about.astro
│   │   ├── projects/{index,[slug]}.astro
│   │   ├── articles/index.astro   ← 列表; 无 [slug] 详情页, 文章只跳外链
│   │   ├── skills/{index,[slug]}.astro
│   │   └── rss.xml.ts             ← 合并 articles + projects 输出 RSS
│   │
│   └── styles/
│       └── global.css             ← Tailwind 4 import + @theme 自定义 + prose-zh 中文长文样式
│
└── scripts/
    ├── sync-skills.mjs            ← ~/.claude/skills 同步 (含 symlink 支持)
    └── new-project.mjs            ← 脚手架: 生成项目 md 骨架
```

---

## 4. 内容模型（schema 是单一事实源）

完整 schema 见 `src/content/config.ts`。下面是必填字段速查：

### projects

```yaml
---
title: string               # 项目名
tagline: string             # 一句话标语 (列表 + 首页 + 详情顶部)
url?: string                # 站点链接 (可选)
repo?: string               # 仓库链接 (可选)
cover?: string              # /covers/xxx.png (可选)
tech: string[]              # 技术栈 tag
year: number                # 出现在卡片右上 + 排序辅助
featured: boolean = false   # true 才上首页"精选项目"
status: 'live' | 'beta' | 'wip' | 'archived' = 'live'
order: number = 0           # 数字越小越靠前
---
正文 markdown (## 是什么 / ## 为什么做 / ## 你能怎么用)
```

### articles

```yaml
---
title: string
source: 'wechat' | 'substack' | 'blog' | 'x' | 'other' = 'wechat'
url: string                 # 外链, 卡片点击直接跳
date: ISO date              # YYYY-MM-DD, 列表和首页按此倒序
summary: string             # <80 字, 列表和首页都展示
tags: string[] = []
featured: boolean = false
---
正文可有可无 (列表只用 summary + 跳外链, 没有内部详情页)
```

### skills

```yaml
---
name: string                # 等于 skill 调用名 (例如 mba, frontend-design)
description: string         # 用 YAML | block 写多行, 自动 whitespace-pre-line 换行
source: 'local' | 'plugin' | 'custom' = 'local'
category?: string
featured: boolean = false   # true 上首页"Skills"区
handwritten: boolean = false  # true 表示这是手写中文版, sync:skills 不会覆盖
synced_at?: 'YYYY-MM-DD'    # sync 脚本写入
---
正文 markdown (用 ## 用途 / ## 何时用 / ## 不要用 等小节)
```

---

## 5. 常见更新（动作 → 文件 → 模板）

### 5.1 加项目

**最快**:
```bash
pnpm run new:project -- <slug> "项目名" "一句话标语" https://url.com 2026
# 生成 src/content/projects/<slug>.md, 然后改 tech/featured/order 等
```

**手动**: 复制现有 `src/content/projects/mbabrand.md` 作模板。

注意:
- `featured: true` 才上首页（首页只展示 featured 的）
- `order: 1` / `2` / ... 控制顺序（数字小靠前）
- `tech` 数组超过 4 个卡片上只显示前 4 个

### 5.2 加公众号文章

写 `src/content/articles/<slug>.md`:

```yaml
---
title: "文章原标题"
source: wechat
url: https://mp.weixin.qq.com/s/xxxxxxxxx
date: 2026-06-08
summary: 一两句话摘要, 列表卡片直接显示, <80 字。
tags: [skill, claude, 自动化]
---
```

**slug 命名**: 不要用 WeChat URL 的 hash（丑），用 `日期-关键词` 或纯关键词。  
**WebFetch 抓不到 WeChat**: 公众号有反爬，必须用户手喂标题 / 日期 / 摘要 / tags。

### 5.3 同步本机 skills

```bash
pnpm run sync:skills
```

**做什么**: 扫 `~/.claude/skills/<name>/SKILL.md`（含 symlink，支持 `~/mba/*-perspective` 那种符号链接进来的），读 frontmatter 的 `name` + `description` + `category`，生成 `src/content/skills/<name>.md`。

**保护机制**:
- `handwritten: true` → 跳过覆盖（当前 14 个英文 skill 翻译成中文后都打了这个标）
- 已有 `featured: true` → 保留该标志，但 description 仍会被覆盖（如果 sync 检测到内容变化）
- 文件首次创建时 `.gitkeep` 占位会被自动删除

**给某个 skill 写人化中文介绍**:
1. 跑一次 `pnpm run sync:skills` 拿到 base 版本
2. 改 `src/content/skills/<name>.md`：
   - `handwritten: false` → `true`
   - 改 `description`（多行用 YAML `|` block, 句号自带换行）
   - 改正文（用 `## 用途` / `## 何时用` 等小节）
3. 以后 `sync:skills` 不会覆盖它

**首页精选**: `featured: true` 上首页 "Skills" 精选区。  
**当前 29 个 skill 状态**:
- 15 个自动同步（中文版 SKILL.md 直接拿过来）
- 14 个手动翻译成中文（`handwritten: true`）：
  - agent-browser, agents-sdk, cloudflare, cloudflare-email-service,
  - demo-day-dossier, durable-objects, frontend-design, musk-perspective,
  - research, sandbox-sdk, turnstile-spin, web-perf,
  - workers-best-practices, wrangler

### 5.4 改首页 / about / socials

| 想改什么 | 改哪里 |
|---|---|
| 首页 hero 大字（tagline） | `src/data/about.json` 的 `tagline` |
| 首页 hero 下方 bio | `src/data/about.json` 的 `bio` |
| 浏览器标签里的 title | `tagline` 控制（`<title>张路 — {tagline}</title>`） |
| 首屏标签云 | `src/data/about.json` 的 `tags` |
| 头像 | 放 `public/avatar.png`，`avatar` 字段指过去 |
| GitHub / X / 邮箱 链接 | `src/data/social.json` |
| 微信公众号名 | `social.json` 里 label "微信公众号" 那条的 `handle` |
| 公众号二维码 | 放 `public/wechat-qr.jpg`（258×258 JPEG OK），`qrcode` 字段指过去 |

`social.json` 里：
- 有 `url` 且不含 `TODO` → Footer 显示链接
- `url` 空但有 `qrcode` → About 页可折叠显示二维码（Footer 不展示）

### 5.5 加新区块（演讲 / 获奖 / Now）

改 `src/pages/index.astro`。照着 "精选项目" / "最近文章" / "Skills" 三个 section 复制结构。如果需要类型化数据，先：
1. `src/content/config.ts` 加新 collection schema
2. `src/content/<name>/` 加 markdown 文件
3. `pages/<name>/index.astro` + `[slug].astro` 起列表 + 详情页

---

## 6. 本地开发

```bash
pnpm install              # 装依赖
pnpm dev                  # http://localhost:4321, 热更新
pnpm build                # 出 dist/, CF Pages 也跑这个
pnpm preview              # 起服看构建产物 (不是 dev)
pnpm check                # astro check, 类型检查 (可选)
```

**首次拉代码**: 必须 `pnpm install` 一次（pnpm-lock.yaml 在 repo）。

---

## 7. 部署链路（已配好）

```
你 git push origin main
   │
   ↓
GitHub: zhanglunet/zhanglu.net
   │ (CF Pages webhook)
   ↓
Cloudflare Pages "zhanglu-net" project
   │
   ├─ Clone repo
   ├─ Detect packageManager (pnpm@9.15) → corepack 拉 pnpm
   ├─ pnpm install
   ├─ pnpm run build                    ← astro build, 出 dist/
   └─ 部署 dist/ 到边缘
        │
        ├─ https://zhanglu-net.pages.dev  (default subdomain)
        └─ https://zhanglu.net            (custom domain, CF DNS 自动接管)
```

**CF Pages 项目设置**（首次配过，记录在此供恢复参考）:

| 字段 | 值 |
|---|---|
| Project name | `zhanglu-net` |
| Production branch | `main` |
| Framework preset | Astro |
| Build command | `pnpm run build` |
| Build output directory | `dist` |
| Root directory | (空) |
| Env: `NODE_VERSION` | `22` |
| Custom domain | `zhanglu.net`（DNS 同账号一键 activate） |

PR 自动 preview：`<sha>.zhanglu-net.pages.dev` 或 `<branch>.zhanglu-net.pages.dev`。

---

## 8. 提交规范

```bash
git add -A
git commit -m "<type>: <短描述>"
git push origin main
```

`<type>`:
- `add` — 新内容（项目 / 文章 / skill）
- `update` — 改现有内容（润色 / 替换文案）
- `fix` — 修 bug（构建错 / 链接错 / typo）
- `style` — 视觉 / CSS / 组件 layout
- `i18n` — 翻译 / 双语相关
- `chore` — 脚手架 / 配置 / 依赖

Commit message 用 HEREDOC 多行也行；末尾保留：
```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## 9. 历史踩过的坑（不要重蹈）

### 9.1 不要 `pnpm run build | tail && git push`

```bash
# ❌ 错: tail 退出码 0 吞掉 build 失败, bad commit 上 CF Pages
pnpm run build 2>&1 | tail -3 && git commit ... && git push

# ✅ 对: build 单独跑, 看到 "build Complete" 再继续
pnpm run build && git add -A && git commit ... && git push

# ✅ 或: 显式打开 pipefail
set -o pipefail   # bash; zsh 用 setopt pipefail
```

### 9.2 JSON 删字段当心 trailing comma

`src/data/social.json` 删最后一个对象时，前一个对象后面的逗号要一起删。JSON 不接受 trailing comma，构建会挂在 `vite:json plugin`。**改完 JSON 一定本地 `pnpm run build` 验证。**

### 9.3 sync-skills 必须认 symlink

`~/.claude/skills/` 有大量符号链接（boss / *-perspective / mba 等），不能只用 `isDirectory()`。`sync-skills.mjs` 已经处理（同时接受 symlink 和真实目录，并 stat 验证目标是 dir）。**改这个脚本时别删掉 symlink 分支**。

### 9.4 Tailwind 4 用 `@tailwindcss/vite` 不要混 `@astrojs/tailwind`

Tailwind 4 配置走 CSS-first（`@theme { ... }` 在 `src/styles/global.css`），没有 `tailwind.config.js`。两套插件混用会出诡异错误。

### 9.5 description 多行换行需要 `whitespace-pre-line`

YAML `|` block 在 frontmatter 里保留 `\n`，但 HTML 默认折叠空白。`SkillCard.astro` 和 `pages/skills/[slug].astro` 已加 `whitespace-pre-line`。**改这两个组件时不要去掉。**

### 9.6 公众号文章 WebFetch 抓不到

`mp.weixin.qq.com/s/...` 反爬，WebFetch 返回 "环境异常" 验证页。不要试图自动化抓取 → 让用户手喂 title/date/summary/tags 四件套。

### 9.7 X 链接 403 是正常的

`x.com/<handle>` 给无 cookies 请求返回 403，不代表 handle 错。不要用 curl 状态码判定 handle 有效性。

---

## 10. 不要做的事

- ❌ 改 `src/content/skills/` 下 `handwritten: false` 的文件（下次 sync 覆盖）；要保留就先把 flag 翻成 `true`
- ❌ 把 secrets 写进 `src/data/*.json` 或 `public/`
- ❌ 删 `src/content/config.ts` 字段 → 所有 markdown 验证失败
- ❌ 改 schema 加新字段而不在 `config.ts` 一并加上 → 构建失败
- ❌ `git push --force` 到 main
- ❌ 推送前不本地 `pnpm run build` 验证（CF Pages 失败构建对外不可见但会延迟生效）
- ❌ 跳过 `Co-Authored-By` 行（约定）

---

## 11. 当前内容快照（截至 2026-06-08）

| collection | 数量 | featured |
|---|---|---|
| projects | 2 | mbabrand, qiji-roadshow-2026 |
| articles | 1 | (none featured 字段未启用首页过滤) |
| skills | 29 | (none featured，14 个 handwritten:true) |

`src/data/about.json` 当前 hero / bio 是基于公开项目信息撰写的占位描述，可随时替换为本人定义版。

---

## 12. 快速排错

| 症状 | 大概率原因 | 怎么修 |
|---|---|---|
| 本地 build "Failed to parse JSON file" | data/*.json 有 trailing comma 或语法错 | 看错误行号, 修 JSON |
| 本地 build "content validation failed" | 某 .md frontmatter 缺字段或类型错 | 错误信息指明是哪个文件哪个字段 |
| CF Pages 构建过, 但页面没更新 | CF 边缘缓存 | 等 1-2 分钟; 或在 CF dashboard purge cache |
| skill 详情页 description 挤一行 | 组件少了 `whitespace-pre-line` | 加回 SkillCard.astro 和 skills/[slug].astro |
| sync:skills 只同步了一半 | symlink 处理被改坏 | 看 §9.3 |
| `pnpm dev` 起不来 | Node 版本不对 | `nvm use` 读 .nvmrc 切到 22 |

---

## 13. 文档同步

改完代码 / 内容如果发现本指南某条过时了：**直接改本文件**，不要单开 changelog。本文是给未来你和其它 agent 看的快照，保持准确比保持历史重要。
