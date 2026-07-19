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
│   ├── wechat-qr.jpg              ← 公众号「张路的碎碎念」二维码 (258×258)
│   ├── og/                        ← OG 分享图 (1200×630), <Base image="/og/xxx.png"> 挂载
│   └── brand/                     ← C-suite logo SVG 四变体 (设计文档 docs/brand/c-suite-logo.md)
│
├── src/
│   ├── content/
│   │   ├── config.ts              ← Zod schemas (改这里 = 改全站数据契约)
│   │   ├── projects/              ← 一个项目 = 一个 .md
│   │   ├── articles/              ← 公众号 / 博客文章入口 = 一个 .md
│   │   └── skills/                ← 30 个 skill, 16 个 sync 自动生成 + 14 个手写中文
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
│   │   ├── c-suite/{index,brand}.astro ← C-suite 专题页 + Logo 品牌页
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
loc?: number                # 源码行数 (可选), cloc 统计, 排除文档/数据/生成物; 卡片和详情页显示 "≈ N 行代码"
persona?: string            # 目标人群 (可选), 如 CEO / CMO / CFO; 卡片和详情页显示朱砂色徽章 "为 X 设计"
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

### presentations

```yaml
---
title: string               # 卡片标题
tagline: string             # 一句话标语 (whitespace-pre-line, YAML | 多行 OK)
url: string                 # 外链 (必填), 点卡片直接跳新 tab
kind: 'slides' | 'site' = 'slides'  # 网页 PPT vs 普通站点, 卡片上有 badge
cover?: string              # 封面 (可选, 暂未渲染)
year: number                # 出现在卡片右上
featured: boolean = false
order: number = 0           # 数字越小越靠前
---
正文 markdown (可选, 列表页不渲染, 只用作端点 body_md 参考)
```

不开详情页, 卡片直接跳外链。列表页: `src/pages/presentations/index.astro`。
端点: `/api/presentations.json` (含 cover/featured/order)。

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

### 5.2 加文章入口（写作索引）

`articles/` 是**写作索引**，链接指向**原始出处** —— 优先用原始博客 / 项目站点的 URL，
不要用公众号转载的 URL（公众号反爬，agent 抓不到正文；而且原始页通常排版更好）。
也可以指向 `/posts/<slug>` —— 站内长文也是合法的"原始出处"。

写 `src/content/articles/<slug>.md`(`articles/` 下每个 `.md` 都是真文章 —— 不放占位 / inline schema doc / README, 否则消费端 4 处都要 filter, 容易漏一处):

```yaml
---
title: "文章原标题"
source: blog          # blog | wechat | substack | x | other
url: https://your-original-url.com/path
                       # 优先原始博客 URL; 或 https://zhanglu.net/posts/<slug>
date: 2026-06-09
summary: 一两句话摘要, 列表卡片直接显示, <80 字。
tags: [skill, claude, 自动化]
featured: false       # true 可选, 暂未启用首页过滤
---
```

**ArticleCard 行为**：URL 起始为站点 origin（`https://zhanglu.net/...`）时按"站内"渲染、同 tab 打开；否则按 source 标签渲染、新 tab 打开。

**slug 命名**: 不要用 URL 的 hash，用 `日期-关键词` 或纯关键词。  
**特殊：公众号正文**: 公众号有反爬，WebFetch 抓不到。如果同一篇内容既在公众号也在原始博客发了，**优先用博客 URL**（agent 友好）。

### 5.3 加展示 (网页 PPT / 站点入口)

写 `src/content/presentations/<slug>.md`:

```yaml
---
title: 展示标题
tagline: 一句话标语
url: https://外链
kind: slides         # slides=网页 PPT, site=普通站点
year: 2026
order: 1             # 数字小靠前
featured: false
---
正文可选
```

- 不开详情页, 卡片直接跳外链 (新 tab)
- 列表页 `/presentations`, 顶部导航有「展示」入口
- 端点 `/api/presentations.json` build 时静态生成
- 改完 schema (`src/content/config.ts`) 要同步改对应的 `*.json.ts` 端点

### 5.4 同步本机 skills

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
**当前 30 个 skill 状态**:
- 16 个自动同步（中文版 SKILL.md 直接拿过来）
- 14 个手动翻译成中文（`handwritten: true`）：
  - agent-browser, agents-sdk, cloudflare, cloudflare-email-service,
  - demo-day-dossier, durable-objects, frontend-design, musk-perspective,
  - research, sandbox-sdk, turnstile-spin, web-perf,
  - workers-best-practices, wrangler

### 5.5 改首页 / about / socials

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
| 某页 OG 分享图 | 做 1200×630 图放 `public/og/`，页面 `<Base image="/og/xxx.png">`（Base 自动输出绝对 og:image / twitter:image）；无 image 则不出 og:image |

`social.json` 里：
- 有 `url` 且不含 `TODO` → Footer 显示链接
- `url` 空但有 `qrcode` → About 页可折叠显示二维码（Footer 不展示）

### 5.6 加新区块（演讲 / 获奖 / Now）

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

### 8.1 发版 / release（版本 tag + GitHub Release）

站点是 push main 自动部署，**发版只是可选的里程碑标记**，不影响上线。约定：

- 版本号在 `package.json` 的 `version`（语义化版本，`0.x` 阶段小步 bump minor）。
- 每次发版四步：① bump `package.json` → ② 在 `CHANGELOG.md` 顶部加 `## [x.y.z] - YYYY-MM-DD` 段落 → ③ 提交上 main → ④ 打 tag `vX.Y.Z` + 建 GitHub Release（正文照抄 CHANGELOG 对应段落）。
- `CHANGELOG.md` 是发布说明的单一事实源，Release 正文直接粘对应段落。

⚠️ **本会话类型（Claude Code on the web / 远程 agent 会话）建不了 Release、也推不了 tag**：GitHub API 返回 `Creating, editing, or deleting releases is not permitted for this session type`，git 代理对 tag ref push 返回 403。这是**会话类型的分类限制，放开仓库权限也没用**，别空转重试。第 ④ 步改走：

1. **GitHub UI 一键发**：`https://github.com/zhanglunet/zhanglu.net/releases/new?tag=vX.Y.Z&target=main`，正文粘 CHANGELOG 段落，Publish（tag 由 GitHub 自动在 main 上创建）。
2. **本地 gh**：先把本地 main 更到最新（`git fetch && git merge --ff-only origin/main` —— 光 `git fetch` 只更新远端引用、不动工作区，新加的 `CHANGELOG.md` 在本地可能还不存在），再**只抽本版段落**发布（`--notes-file CHANGELOG.md` 会把整个 changelog 连历史版本一起塞进 release）：
   ```bash
   git fetch && git merge --ff-only origin/main
   awk -v v="X.Y.Z" '$0 ~ "^## \\["v"\\]"{f=1;print;next} f&&/^## \[/{exit} f' CHANGELOG.md > /tmp/notes.md
   gh release create vX.Y.Z --target main --title "vX.Y.Z — ..." --notes-file /tmp/notes.md
   ```
   （已发布的 release 想改说明：`gh release edit vX.Y.Z --notes-file /tmp/notes.md`。）

agent 把能做的部分（①②③：bump + 写 CHANGELOG + 提交上 main）做完，第 ④ 步（tag / Release）留给人在 GitHub UI 或本地 gh 完成。

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

## 11. 当前内容快照（截至 2026-07-18）

| collection | 数量 | featured |
|---|---|---|
| projects | 6 | mbabrand, boss, oaf, qiji-roadshow-2026, qcc-agent, shanghai（order 1→6, 均 featured） |
| articles | 3 | agent-cli (站内 /posts/), qiji-56-projects-one-night, qcc-agent-origin |
| presentations | 4 | mbabrand (slides), boss-handbook (slides), oaf (slides), openagent (site) |
| skills | 30 | zhanglu（14 个 handwritten:true） |

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

---

## 14. Agent CLI 接口 (`/api/*.json` + `npx zhanglu-net`)

> **目的**：让任何 AI agent（Claude Code / Codex / Hermes / OpenClaw / 自己写的）能用 HTTP GET 读站内结构化内容，不用 parse HTML。

### 14.1 端点（build 时静态生成）

| 端点 | 实现文件 | 说明 |
|---|---|---|
| `/api/index.json` | `src/pages/api/index.json.ts` | manifest: counts + 所有端点 |
| `/api/projects.json` | `src/pages/api/projects.json.ts` | 项目列表 |
| `/api/projects/{slug}.json` | `src/pages/api/projects/[slug].json.ts` | 单项目（含 `body_md`）|
| `/api/articles.json` | `src/pages/api/articles.json.ts` | 公众号 / blog 入口 |
| `/api/presentations.json` | `src/pages/api/presentations.json.ts` | 网页 PPT / 站点入口 |
| `/api/skills.json` | `src/pages/api/skills.json.ts` | Skill 索引 |
| `/api/skills/{slug}.json` | `src/pages/api/skills/[slug].json.ts` | 单 skill（含 `body_md`）|
| `/api/about.json` | `src/pages/api/about.json.ts` | 简介 |
| `/api/social.json` | `src/pages/api/social.json.ts` | 公开社交（过滤邮箱）|
| `/api/search.json` | `src/pages/api/search.json.ts` | 扁平语料给 CLI 客户端搜 |
| `/llms.txt` | `public/llms.txt` | agent 自发现入口 |
| `/robots.txt` | `public/robots.txt` | 标明 sitemap + allow all |
| `/agents` | `src/pages/agents.astro` | 人类向的接入指南（端点表 + CLI + curl + Claude Code）|
| `/posts/agent-cli` | `src/pages/posts/agent-cli.astro` | 设计文章（在站站内长文版本）|
| `/posts` | `src/pages/posts/index.astro` | 长文索引 |

所有端点：
- 静态生成（`pnpm build` 时 → `dist/api/*.json`）
- `Content-Type: application/json; charset=utf-8`
- `Access-Control-Allow-Origin: *`（浏览器端 agent 也能用）

**改字段**：先改 `src/content/config.ts` schema，再改对应端点 `.json.ts` 文件。Schema 是单一事实源。

### 14.2 CLI（`cli/` 子目录）

独立 package，bin name `zhanglu-net`（npm 上 `zhanglu` 已被占），零运行时依赖。

```
cli/
├── package.json        # name: "zhanglu-net", bin: { "zhanglu-net": "./bin/zhanglu-net.mjs" }
├── bin/zhanglu-net.mjs # 单文件 ~270 行 ESM
└── README.md
```

调用方式：
- `npx zhanglu-net <cmd>` —— 推荐，不用装
- `npm i -g zhanglu-net` —— 全局装
- `node cli/bin/zhanglu-net.mjs <cmd>` —— 本地开发

环境变量：
- `ZHANGLU_BASE_URL=http://localhost:4321` 切到本地 dev
- `NO_COLOR=1` 关 ANSI 颜色

CLI 是端点的薄包装。改命令逻辑改 `cli/bin/zhanglu-net.mjs`，改数据形状改端点。

### 14.3 发布到 npm

第一次发：

```bash
cd cli
npm login                # 或 npm config set //registry.npmjs.org/:_authToken ...
npm publish --access public
```

后续 bump 版本：改 `cli/package.json` 的 `version`，`npm publish` 再发一次。

CLI 与站点端点松耦合 —— 改端点 schema 时若不破坏向下兼容，CLI 不需要发新版。

### 14.4 加新端点 / 字段（流程）

1. **数据源**：如果是新字段，先改 `src/content/config.ts` Zod schema；如果是新 collection，加 `defineCollection`
2. **markdown / JSON 落数据**：`src/content/<...>` 或 `src/data/*.json`
3. **端点**：复制现有的 `*.json.ts` 改字段
4. **CLI**（可选）：如果想让 CLI 也能拿，在 `bin/zhanglu.mjs` 加子命令
5. **manifest**：在 `src/pages/api/index.json.ts` 的 `endpoints` 里登记新端点
6. **llms.txt**：`public/llms.txt` 里加一行说明
7. **测**：`pnpm build` 过 → `curl localhost:4321/api/<新端点>.json` 看数据

### 14.5 不要做的事

- ❌ **不要在端点里塞业务逻辑**。端点只做"读 collection + JSON 序列化"。变换 / 过滤交给 CLI 或 agent。
- ❌ **不要给端点加鉴权**。站点公开，鉴权之外的内容不该出现在 `src/content/`。
- ❌ **不要把 `social.json` 的邮箱字段加回来再让端点出**。端点的脱敏过滤是兜底，别依赖它而推任意 PII 进 source。
- ❌ **不要让端点依赖外部 fetch**。所有数据来自仓库内 markdown / JSON，否则 CF Pages build 不稳定。
- ❌ **不要做服务端搜索**。语料 < 100 项，`/api/search.json` 客户端 substring 够用。要换 MiniSearch 等"语料涨到 200+"。
- ❌ **CLI 不要加运行时依赖**。`parseArgs` / `fetch` / ANSI 都是 Node 18+ 内置。加 `chalk` / `commander` 是品味问题不是必要。

### 14.6 文档

仓库里：

- `docs/agent-cli/design.md` —— 设计文档，端点 schema、决策记录、可演进路径
- `docs/agent-cli/dev-log.md` —— 开发记录，踩过的坑
- `docs/agent-cli/wechat-draft.md` —— 公众号文章草稿（markdown 版）
- `cli/README.md` —— CLI 用户文档
- `public/llms.txt` —— agent 自发现入口

站上（给读者看的）：

- `/agents` —— 人类向接入指南，含端点表 / CLI / curl / Claude Code 集成 / 其他 agent 接入思路
- `/posts/agent-cli` —— 设计文章站内版本（公众号也会发一份）
- `/posts` —— 长文索引

### 14.7 三种"文章"职责区分

| 集合 / 路径 | 内容 | URL 字段 |
|---|---|---|
| `src/content/articles/` | **写作索引** — 指向原始出处（外部博客 / 公众号 / 站内 `/posts/<slug>`） | 必填 URL（绝对地址）|
| `src/pages/posts/*.astro` | **站内长文** — 原生 post 页面 | 不适用 |
| `docs/*.md` | 仓库内部文档，不上站 | 不适用 |

`articles/` 不再只是"外链入口"。一篇站内 post 应该同时：
1. 写 `src/pages/posts/<slug>.astro`（站内渲染）
2. 写 `src/content/articles/<slug>.md`（写作索引，url 指向 `https://zhanglu.net/posts/<slug>`）

这样 `/articles/` 就是完整的写作索引，`/posts/` 是站内长文列表，两者互补。
`ArticleCard` 自动识别站内 URL，用同 tab 而非新 tab 打开。

如果未来 posts 多了，把 `src/pages/posts/*.astro` 改成 `src/content/posts/*.md` 集合 + `[slug].astro` 渲染，schema 加进 `config.ts`。
