# AGENTS.md — zhanglu.net 协作者权威指南

> 本文档是 Claude Code / Codex / Hermes 等 AI agent 维护本仓库的**唯一权威指南**。
> 改任何内容前先读这里。
> `CLAUDE.md` 用 `@AGENTS.md` 把本文导入到 Claude Code 的 system context。

---

## 1. 项目概览

**zhanglu.net** —— 张路的个人站。聚合：项目、展示、公众号文章入口、公开周报、本机 Claude Skills 索引、社交链接。
**中英双语**（中文在 `/`，英文在 `/en/`，见 §16），并对外提供 agent 机读接口（见 §14）。

| 维度 | 现状 |
|---|---|
| 工作目录 | `/Users/john/zhanglu/` |
| GitHub | https://github.com/zhanglunet/zhanglu.net （main 分支） |
| 主域名 | https://zhanglu.net |
| 备用域名 | https://zhanglu-net.pages.dev |
| 托管 | Cloudflare Pages（project name: `zhanglu-net`），DNS 同账号托管 |
| 部署触发 | push `main` → CF Pages 自动构建部署，~1-2 分钟上线 |
| PR 预览 | 自动出 `<branch>.zhanglu-net.pages.dev` |
| 语言 | **中英双语**：zh 在根路径（`lang="zh-CN"`），en 在 `/en/`（`lang="en"`）。首访按浏览器语言自适应，页头可手动切换 |
| 版本 | 站点 `package.json`（当前 0.3.0）；CLI 独立发布在 npm（`cli/package.json`），两者不同步 |
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
│   ├── _headers                   ← ★ CF Pages 响应头: 显式声明 /api/* 与 /en/api/* 的 CORS
│   ├── llms.txt                   ← agent 自发现入口 (中文)
│   ├── en/llms.txt                ← ★ 英文版
│   ├── robots.txt                 ← allow all + Content-Signal (见 §9.10)
│   ├── favicon.svg                ← 深底方形 + 反白 Z 路 + 朱砂句点 (zhanglu logo 简化版)
│   ├── wechat-qr.jpg              ← 公众号「张路的碎碎念」二维码 (258×258)
│   ├── og/                        ← OG 分享图 (1200×630), <Base image="/og/xxx.png"> 挂载
│   ├── brand/                     ← logo SVG: C-suite 印章四变体 + zhanglu 个人标识四变体 (设计文档 docs/brand/*.md)
│   ├── covers/                    ← 项目网站截图 (webp), projects frontmatter cover 字段引用
│   └── tui3/                      ← tui3 往期作品 5 个子站截图 (webp), 首页「往期作品」画廊用
│
├── src/
│   ├── content/
│   │   ├── config.ts              ← Zod schemas (改这里 = 改全站数据契约); zh 与 *En 共用同一份 schema
│   │   ├── projects/              ← 一个项目 = 一个 .md
│   │   ├── articles/              ← 写作索引 (指向原始出处) = 一个 .md
│   │   ├── presentations/         ← 网页版 PPT / 站点入口
│   │   ├── weekly/                ← 公开周报 (脱敏版)
│   │   ├── skills/                ← 30 个 skill, 16 个 sync 自动生成 + 14 个手写中文
│   │   └── <coll>En/              ← ★ 每个集合的英文平行版 (projectsEn / articlesEn / ...)
│   │
│   ├── i18n/                      ← ★ 双语基建 (见 §16)
│   │   ├── ui.ts                  ← UI 文案字典 (zh / en 两套, 加 key 要两边都加)
│   │   └── utils.ts               ← getLangFromUrl / localizePath / stripLang / altPath
│   │
│   ├── lib/
│   │   └── api.ts                 ← ★ 所有 API 端点的字段形状与 builder (zh/en 共用, 加字段只改这里)
│   │
│   ├── data/                      ← 静态 JSON, 给所有页面读
│   │   ├── about.json             ← 名字 / tagline / bio / tags (首页 hero 直接读)
│   │   ├── about.en.json          ← ★ 英文版
│   │   ├── social.json            ← GitHub / X / 公众号 (含 QR)
│   │   └── social.en.json         ← ★ 英文版
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
│   │   ├── 404.astro              ← ★ 双语 404 (让不存在路径返回真 404, 见 §9.10)
│   │   ├── api/                   ← JSON 端点 (薄包装, 字段在 src/lib/api.ts)
│   │   ├── en/                    ← ★ 英文镜像: 每个 zh 页一份, 含 en/api/ 与 en/rss.xml.ts
│   │   ├── weekly/{index,[slug]}.astro
│   │   ├── posts/                 ← 站内长文
│   │   ├── agents.astro           ← agent 接入指南
│   │   ├── how-it-works.astro     ← ★ 站点架构说明（双语，图示；文档版 docs/architecture.md）
│   │   ├── about.astro
│   │   ├── brand.astro            ← 本站 logo 品牌页「一条路，一个句点」(Footer 有入口)
│   │   ├── projects/{index,[slug]}.astro
│   │   ├── c-suite/{index,brand}.astro ← C-suite 专题页 + Logo 品牌页
│   │   ├── articles/index.astro   ← 列表; 无 [slug] 详情页, 文章只跳外链
│   │   ├── skills/{index,[slug]}.astro
│   │   └── rss.xml.ts             ← 合并 articles + projects 输出 RSS
│   │
│   └── styles/
│       └── global.css             ← Tailwind 4 import + @theme 自定义 + prose-zh 中文长文样式
│
├── cli/                           ← ★ 独立 npm 包 zhanglu-net (零依赖, 版本号独立于站点)
│   ├── package.json
│   ├── bin/zhanglu-net.mjs        ← 单文件; KINDS 表驱动 list/get/帮助
│   └── README.md
│
├── docs/
│   ├── architecture.md            ← ★ 架构总览（站上版本 /how-it-works）
│   ├── dev-log/                   ← ★ 每次开发的过程记录 (见 §15)
│   ├── agent-cli/                 ← 接口设计文档 / 开发记录
│   └── brand/                     ← logo 设计说明
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

### 5.4.1 站上的 /skills 不会自动更新（重要）

**`sync-skills.mjs` 读的是 `~/.claude/skills/`，只存在于你的 Mac 上。**
CF Pages 构建机没有这个目录 —— 所以 **`/skills` 是「最后一次手动同步并 push」的快照**，
不会随本机新增 skill 自动更新。想确认站上是不是最新的，看任意 skill 的 `synced_at` 字段。

三条路，按自动化程度排：

| 方式 | 命令 | 说明 |
|---|---|---|
| 手动 | `pnpm run sync:skills` → build → push | 最简单，但要记得做 |
| 先检查再决定 | `pnpm run sync:check` | **只读不写**，有漂移 exit 1。适合放进 git pre-commit hook 或定时提醒 |
| 全自动 | `pnpm run sync:auto` | 同步 → 校验 → 构建 → 提交 → 推送，一条龙。配 launchd 可定时跑 |

**定时自动跑（macOS launchd）** —— 整段可直接粘进终端（用 `$REPO` 生成 plist）。
**块里刻意不放行内 `#` 注释**：zsh 交互态默认不认 `#`（见 §9.11），行内注释会把第一行的 `REPO` 赋值整个搞坏。
三处自检：`plutil` 必须打印 OK；`launchctl print` 出的 arguments 必须是真实绝对路径；出错先看 `/tmp/zhanglu-sync-skills.err`。

```bash
REPO="$HOME/zhanglu"
ls "$REPO/scripts/auto-sync-skills.sh" || echo "路径不对：先改 REPO 再往下"

mkdir -p ~/Library/LaunchAgents
cat > ~/Library/LaunchAgents/net.zhanglu.sync-skills.plist <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>net.zhanglu.sync-skills</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$REPO/scripts/auto-sync-skills.sh</string>
  </array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>/tmp/zhanglu-sync-skills.log</string>
  <key>StandardErrorPath</key><string>/tmp/zhanglu-sync-skills.err</string>
  <key>RunAtLoad</key><false/>
</dict></plist>
PLIST

plutil -lint ~/Library/LaunchAgents/net.zhanglu.sync-skills.plist

launchctl bootout gui/$(id -u)/net.zhanglu.sync-skills 2>/dev/null
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/net.zhanglu.sync-skills.plist
launchctl print gui/$(id -u)/net.zhanglu.sync-skills | grep -A 3 arguments
```

立刻试跑一次（不等到 9:00）：

```bash
launchctl kickstart -p gui/$(id -u)/net.zhanglu.sync-skills
tail -f /tmp/zhanglu-sync-skills.log
```

卸载：`launchctl bootout gui/$(id -u)/net.zhanglu.sync-skills`。
没输出先 `cat /tmp/zhanglu-sync-skills.err` —— stdout 没内容时 `.log` 可能根本不存在。

⚠️ **`launchctl load` / `unload` 是遗留命令**，在新版 macOS 上报错极不透明
（最典型的就是 `Load failed: 5: Input/output error` —— 实际原因往往只是
**plist 文件不存在**或 XML 被富文本粘贴弄坏了）。一律用 `bootstrap` / `bootout`，
并且**先 `plutil -lint` 验一遍**。另外 LaunchAgents 是用户级的，**不要用 `sudo`**。

**不想折腾 launchd** —— 两个更省事的替代：

```bash
# 1) cron（macOS 仍支持）：crontab -e 加一行，每天 9:00
0 9 * * * cd $HOME/zhanglu && /bin/bash scripts/auto-sync-skills.sh >> /tmp/zhanglu-sync.log 2>&1

# 2) 干脆手动，想起来就跑（最不容易出错）
pnpm run sync:check    # 先看差多少
pnpm run sync:auto     # 确认后一条龙
```

`auto-sync-skills.sh` 的安全设计：**无改动不提交**（不产生空提交）、**构建不过就中止**（不推坏 commit）、
**`--ff-only` 拉取**（遇到分叉停下来让人处理）、**只 `git add src/content/skills`**（不会顺手提交你工作区里的半成品）。
仓库路径默认 `$HOME/zhanglu`，可用 `ZHANGLU_REPO` 覆盖。

### 5.4.2 sync 的四个坑（前三个 2026-07-27 真出过事故，见 dev-log）

1. **孤儿**：本机删掉一个 skill，`sync:skills` 默认**不会**删掉仓库里对应的 md —— 它只新增/更新。
   结果是站上永远留着一个已经不存在的 skill。脚本会列出孤儿，加 `--prune` 删除（zh + en 一起删）。
   **`featured: true` 或 `handwritten: true` 的孤儿只报告、永不自动删** —— 那是人工策展过的内容。
2. **「读不出来」≠「已删除」**（原来是**破坏性 bug**）：断链 symlink、SKILL.md 缺失、frontmatter
   解析失败、缺 description —— 这四种情况旧版都静默归入「本次没见到」，于是被 `--prune` 当成
   已删除**真的删掉**。07-27 那次一口气丢了 15 个（含 `featured: true` 的 `zhanglu`，导致
   `/agents` 上的链接和 README 的安装配方双双 404）。现在只要**目录还在**就永不 prune，
   只报告为「⚠️ 不可读」。改这段逻辑时别把 `present` 这个 Set 合回 `seen`。
3. **中英不对齐**：`sync` **只写中文侧**（`src/content/skills/`）。新同步进来的 skill 在
   `src/content/skillsEn/` 里没有对应文件 → `/en/skills` 会少内容，而且**不会构建失败**（没有 1:1 的强制约束）。
   脚本打印「⚠️ 英文版缺失」清单；**`sync:auto` 现在遇到不对齐直接 exit 1 不推送**
   （07-26/27 两次只警告不拦，结果 zh 从 30 涨到 57、en 还是 30，静默少了 27 条上线）。
4. **工作向 skill 会被无脑同步上公开站**：`~/.claude/skills` 里混着内部系统的 skill，
   description 写清了各服务职责与模块划分。07-27 那次把 17 个 `aic-*`（企业 CRM / 差旅 / 考勤后端）
   推上了 `/skills` 和 `/api/skills.json`。挡它的是 `sync-skills.mjs` 顶部的 `EXCLUDE`
   （glob，同时匹目录 slug 和 frontmatter 的 `name` —— 目录叫 `crm-saf`、name 才是 `aic-crm-saf`）。
   命中的既不写入，也会把仓库里已有的残留删掉（**不需要 `--prune`**：留着就等于留在公开站上）。
   **新增一类工作向 skill 就往 `EXCLUDE` 里加一条**，别指望每次同步都靠肉眼扫。

**首页精选**: `featured: true` 上首页 "Skills" 精选区（当前只有 `zhanglu` 一个）。  
**当前 41 个 skill 状态**（zh 41 / en 41，1:1 对齐）:
- 26 个自动同步（中文版 SKILL.md 直接拿过来），其中 25 个是 `lark-*` 飞书 OpenAPI 封装
- 15 个手写（`handwritten: true`，`sync` 不覆盖）：
  - agent-browser, agents-sdk, cloudflare, cloudflare-email-service,
  - demo-day-dossier, durable-objects, frontend-design, musk-perspective,
  - research, sandbox-sdk, turnstile-spin, web-perf,
  - workers-best-practices, wrangler,
  - **zhanglu**（`featured: true`，站点自己的 agent 接入说明；07-27 被误 prune 后
    改成 handwritten 以免再被自动删 —— 本机已无对应源目录，仓库就是它的事实源）

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

> 每次开发都走 **§15 的回路**（计划 → 改 → **验证** → 过程记录）；commit 前必须 `pnpm run build` 过，且在 `docs/dev-log/` 留一条过程记录。别跳这两步。

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

### 9.9 抓外部网站截图：Chromium 走不了代理，用 wget 镜像

想给项目卡片配"网站截图"时，**headless Chromium 直连外部站会被 agent 代理 `ERR_CONNECTION_RESET`**（连 example.com 都挂；本地 localhost 不走代理所以没事）。curl / wget 走代理是通的。可行套路：

1. `wget -e robots=off -p -k -H -nd -P <dir> --no-check-certificate <url>` 把页面连 CSS/JS/图片镜像到本地（这几个站都是静态托管，能镜像；纯 JS-SPA 只能拿到壳）。
2. Playwright 截 `file://<dir>/index.html`（本地渲染正常），截图时 `page.route` 把非 file:// / data: 的请求 abort 掉，避免它再去够外部资源。
3. `sharp`（`node_modules/.pnpm/sharp@*/node_modules/sharp`，根目录 require 不到要用全路径）resize 到宽 1200 + 转 webp q78，12 张 3.1MB → 633KB。放 `public/covers/`（项目）或 `public/tui3/`（往期子站）。

项目 `cover` 字段现在**会渲染**（ProjectCard 顶部 banner + 详情页），不再是"暂未渲染"。presentations 的 cover 仍未渲染。

### 9.10 线上 robots.txt 可能和仓库不一致（Cloudflare 会注入）

**症状**：`curl https://zhanglu.net/robots.txt` 的内容比 `public/robots.txt` 多出一大段，
以 `# BEGIN Cloudflare Managed content` / `# END Cloudflare Managed Content` 包裹，
里面对 `ClaudeBot` / `GPTBot` / `CCBot` / `Google-Extended` / `Applebot-Extended` /
`meta-externalagent` / `Bytespider` / `Amazonbot` / `CloudflareBrowserRenderingCrawler`
逐个 `Disallow: /`。

**为什么要在意**：本站整套 agent 接入层（§14）就是为了让 AI agent 来读 `/api/`，
这段注入等于把主流 AI 爬虫挡在门外 —— 意图直接冲突。而且**你在 `public/robots.txt` 里写
`User-agent: * / Allow: /` 是覆盖不掉它的**：robots.txt 规则里具体 UA 段优先于 `*`。

**它不在仓库里，改不到**。开关在 Cloudflare dashboard：
选账号 → 选 `zhanglu.net` 域 → **AI Crawl Control** →
`Crawlers` 标签页逐个爬虫设 Allow / Block，或 `Robots.txt` 标签页整体关掉 managed robots.txt。
（Content Signals 单独的开关在 Security → Settings。）

**当前状态（2026-07-25 起）**：已在 dashboard 关掉整段注入，线上 robots.txt 与仓库逐字一致。
关掉后 CF 的 `Content-Signal: ai-train=no` 也一并消失，所以**训练声明已改为写进
`public/robots.txt` 自己管**（`search=yes, ai-input=yes, ai-train=no`，含 Content Signals Policy
标准前言 —— 那段前言逐字保留，法律效力来自原文，别改措辞）。

**如果哪天线上又冒出 `BEGIN Cloudflare Managed content`**：就是那个 dashboard 开关被重新打开了，
不是仓库出了问题，别去改 `public/robots.txt` 试图绕过。

### 9.11 给人的「可粘贴命令块」里别放行内 # 注释

macOS 默认 zsh 的**交互态不把 `#` 当注释**（`interactivecomments` 默认关）。
`REPO="$HOME/zhanglu"  # 说明` 会被解析成「给命令 `#` 临时赋环境变量」——
`REPO` 根本没定义，后续 heredoc 里 `$REPO` 展开成空。实际踩过一次：
plist 里的脚本路径被写成 `/scripts/auto-sync-skills.sh`，服务装上了但永远跑不起来，
而且 `plutil -lint` 照样报 OK（XML 本身合法），特别难察觉。

规矩：**给用户粘贴的命令块，注释全部写在代码块外面的散文里**；
块内实在要注释，先加一行 `setopt interactive_comments`。
排查线索：`zsh: command not found: #` 出现 = 有人把带行内注释的块粘进了 zsh。

### 9.12 远程会话（容器）里只能跑 `sync:skills --check`，绝不能跑写模式

远程 agent 会话的容器**自己也有一个 `~/.claude/skills/`**（里面是容器的 docx / pdf / pptx /
skill-creator 之类），跟用户 Mac 上那套完全不同。在容器里跑 `pnpm run sync:skills`（写模式）
会把这十来个容器本地 skill 当成"新 skill"创建进 `src/content/skills/`，而且**看起来一切正常**
—— build 照过、`git status` 里只是多出一堆未跟踪文件，不留神就一起提交了。实际踩过一次
（07-27 验证 prune 修复时）。

规矩：容器里**只跑 `--check`**（只读，有漂移 exit 1）。要验证写路径的行为，用临时夹具
（在容器 `~/.claude/skills` 里造 `zz-*` 目录）**并在验证完立刻删掉夹具和被创建的文件**，
提交前 `git status --porcelain src/content/skills` 必须只剩你真正要改的那几个。
真正的同步只在有那套 skill 的机器上跑（见 §5.4）。

### 9.13 删内容 ≠ 下线：Cloudflare 会继续服务已删除 URL 的旧副本

**症状**：把某个 `.md` 删掉、build 过、push 上 main、CF Pages 部署成功、
`/api/<列表>.json` 里也确实没有它了 —— 但 `https://zhanglu.net/skills/<被删的 slug>/`
**照样返回 200，正文完整可读**。

**怎么确认是缓存而不是没部署成功**：给同一个 URL 加个 cache-buster query。

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://zhanglu.net/skills/<slug>/
curl -s -o /dev/null -w '%{http_code}\n' 'https://zhanglu.net/skills/<slug>/?cb=1'
```

前者 200、后者 404 = **源站已经干净，是 Cloudflare 侧在服务旧副本**。旧副本的响应头有两个特征：

```
cache-control: public, s-maxage=604800     ← 7 天，而现役页面是 max-age=0, must-revalidate
x-robots-tag: noindex                      ← CF 给「非当前版本」内容打的标记
age: 43875                                 ← 副本的年龄
```

对照组：**从来没存在过的** URL 返回 `404` + `cache-control: no-store`。所以 200 + `noindex` +
长 `s-maxage` 这组合专属于「曾经存在、现在被删」的路径。

**另外它按 PoP 命中**：同一个 URL 连着查几次可能一会儿 404 一会儿 200，不同机器上查结果也不同。
**不要用「我这里查是 404」判定已经下线** —— 要么加 cache-buster 对照，要么直接 purge 完再验。

**怎么修**：只能 purge，仓库里做不了。CF dashboard → 选 `zhanglu.net` 域 →
**Caching → Configuration → Purge Everything**（最省事，静态站无副作用）。
同一页上顺手确认 **Always Online 是关的** —— 它开着就会在源站报错/404 时继续吐存档副本，
purge 完也可能被重新填回来。

或者用 API（token 需要 Zone → Cache Purge → Purge 权限，Zone ID 在域名 Overview 页）：

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/purge_cache" \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

**规矩：凡是「下线/撤回内容」的改动，push 之后必须 purge 一次再验收。**
新增和修改不用管（现役页面是 `max-age=0, must-revalidate`，部署即生效）——
**只有删除会卡在这上面**。这条 2026-07-27 撤回 17 个内部 skill 时踩到：
push 成功、`/api/skills.json` 已经是 41 条干净数据，但 12 个 `/skills/crm-*/` 页面
还能读到内部服务的完整 description。

### 9.8 手机端横向溢出的三个惯犯

390px 视口下把页面撑破的三类元素（已修，新增内容别再犯）：

1. **grid 隐式轨道 + pre**：`grid md:grid-cols-2` 在手机端落到隐式单列，轨道会被 `<pre>` 的 max-content 撑破容器。写成显式 `grid grid-cols-1 md:grid-cols-2`（`grid-cols-1` = `minmax(0,1fr)`）。
2. **长英文 token 不断行**：URL / 路径 / `ZHANGLU_BASE_URL` 这类词在窄列（尤其 `grid-cols-[auto_1fr]`）里撑宽 min-content。容器加 `wrap-anywhere`（overflow-wrap 可继承）。skill description 的 `whitespace-pre-line` 已配套 `wrap-anywhere`，别删。
3. **导航换行**：Header 导航是单行横滑（`overflow-x-auto` + item `shrink-0` + 隐藏滚动条），新增导航项不需要处理换行，但**别删掉 nav 上那串 overflow/scrollbar class**。

排查工具：`global.css` 里 `html,body { overflow-x: clip }` 只是兜底；真出问题用 playwright evaluate 遍历 `getBoundingClientRect().right > 390` 找元凶（本仓库修复时的做法），不要靠猜。
另外 `.prose-zh` 表格在 ≤640px 整表横滑（th/td nowrap），长文里放表格不用管宽度。

---

## 10. 不要做的事

- ❌ 改 `src/content/skills/` 下 `handwritten: false` 的文件（下次 sync 覆盖）；要保留就先把 flag 翻成 `true`
- ❌ 把 secrets 写进 `src/data/*.json` 或 `public/`
- ❌ 删 `src/content/config.ts` 字段 → 所有 markdown 验证失败
- ❌ 改 schema 加新字段而不在 `config.ts` 一并加上 → 构建失败
- ❌ `git push --force` 到 main
- ❌ 推送前不本地 `pnpm run build` 验证（CF Pages 失败构建对外不可见但会延迟生效）
- ❌ 跳过 `Co-Authored-By` 行（约定）
- ❌ 开发完不写 `docs/dev-log/` 过程记录、或没 build 就宣布"完成"（见 §15）

---

## 11. 当前内容快照（截至 2026-07-27，站点 v0.3.0）

> **每个集合都有平行的英文版**（`src/content/<coll>En/`，同 slug、同数量）。下表是中文侧；
> 英文侧数量 1:1 对齐（见 §16）。改内容时**两边都要动**。

| collection | 数量 | featured |
|---|---|---|
| projects | 8 | mbabrand, boss, oaf, aip（第二大脑）, qiji-roadshow-2026, qcc-agent, shanghai（order 1→7, featured）+ tui3（网站存档, order 9, archived, 非 featured） |
| articles | 5 | agent-cli, qiji-56-projects-one-night, qcc-agent-origin, c-suite-design (站内 /posts/), weekly-2026-w29 (站内 /weekly/) |
| presentations | 4 | mbabrand (slides), boss-handbook (slides), oaf (slides), openagent (site) |
| weekly | 1 | 2026-w29 (脱敏公开周报, 集合 src/content/weekly + /weekly 索引 + [slug] 页) |
| skills | 41 | zhanglu（15 个 handwritten:true；25 个 `lark-*` 自动同步；`aic-*` 走 EXCLUDE 不上站，见 §5.4.2） |

`src/data/about.json` 当前 hero / bio 是基于公开项目信息撰写的占位描述，可随时替换为本人定义版
（英文版在 `about.en.json`）。

**页面规模**：`pnpm build` 产出 131 页 —— 中文 65 + 英文 65 + 404。
**机读层**：24 个端点类型（12 类 × 2 语言），`[slug]` 展开后共 118 个 JSON 文件 + 双语 `llms.txt` + 分语言 RSS。
> 这两个数字会随内容涨。**`/how-it-works` 与 `/agents` 上的对应数字是 build 时算出来的，
> 不用手改**（07-27 skills 30→41 那次，页面上 96→118 自己就跟上了）；只有本文这份快照要手动同步。
**CLI**：`zhanglu-net` 已发布 npm（版本号在 `cli/package.json`，与站点版本独立）。

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

分工：本指南（AGENTS.md）记"**以后该怎么做**"；`docs/dev-log/` 记"**这次是怎么做的**"（过程记录，见 §15）；新踩的坑同时补进 §9。三者别混。

---

## 14. Agent CLI 接口 (`/api/*.json` + `npx zhanglu-net`)

> **目的**：让任何 AI agent（Claude Code / Codex / Hermes / OpenClaw / 自己写的）能用 HTTP GET 读站内结构化内容，不用 parse HTML。

### 14.1 端点（build 时静态生成）

| 端点 | 实现文件 | 说明 |
|---|---|---|
> **双语**：下表是中文端点。英文有一整套平行端点 —— 把路径前面加 `/en`（`/en/api/projects.json`），
> 实现在 `src/pages/en/api/`，读 `*En` 集合。字段形状**只在 `src/lib/api.ts` 定义一次**，zh / en 共用
> 同一份 builder（曾因各自内联字段漂过一次：列表有 `loc/persona/cover`、详情没有）。**加字段改 `src/lib/api.ts`，别改端点文件。**
> 每个响应带 `lang` 字段（`"zh"` / `"en"`）。`src/pages/404.astro` 让不存在的路径返回真 404（以前是 200 + 首页）。

| `/api/index.json` | `src/pages/api/index.json.ts` | manifest: counts + 所有端点 + `languages` 交叉链接 |
| `/api/projects.json` | `src/pages/api/projects.json.ts` | 项目列表 |
| `/api/projects/{slug}.json` | `src/pages/api/projects/[slug].json.ts` | 单项目（含 `body_md`）|
| `/api/articles.json` | `src/pages/api/articles.json.ts` | 公众号 / blog 入口 |
| `/api/presentations.json` | `src/pages/api/presentations.json.ts` | 网页 PPT / 站点入口 |
| `/api/skills.json` | `src/pages/api/skills.json.ts` | Skill 索引 |
| `/api/skills/{slug}.json` | `src/pages/api/skills/[slug].json.ts` | 单 skill（含 `body_md`，以及 `skill_md` —— 拼好 frontmatter 的完整 SKILL.md，装 skill 的配方用它，别用 `body_md`）|
| `/api/weekly.json` | `src/pages/api/weekly.json.ts` | 公开周报列表 |
| `/api/weekly/{slug}.json` | `src/pages/api/weekly/[slug].json.ts` | 单篇周报（含 `body_md`）|
| `/api/about.json` | `src/pages/api/about.json.ts` | 简介 |
| `/api/social.json` | `src/pages/api/social.json.ts` | 公开社交（过滤邮箱）|
| `/api/search.json` | `src/pages/api/search.json.ts` | 扁平语料给 CLI 客户端搜 |
| `/llms.txt` · `/en/llms.txt` | `public/llms.txt` · `public/en/llms.txt` | agent 自发现入口（双语，互相指路）|
| `/robots.txt` | `public/robots.txt` | sitemap + allow all + 指向 `/api/`、`/en/api/` |
| `/404` | `src/pages/404.astro` | **双语** 404（CF Pages 只服务一个根 404.html）；让不存在路径返回真 404 |
| `/agents` · `/en/agents` | `src/pages/agents.astro` · `src/pages/en/agents.astro` | 人类向接入指南（端点表 + CLI + curl + Claude Code）|
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

**已发布**：`zhanglu-net@0.2.0`（2026-07-25 首发）。`npx zhanglu-net <cmd>` 对任何人可用，
所以站上 `/agents`、`llms.txt`、`skills/zhanglu` 里的 `npx` 文案都是真的 —— **别再退回"包还没发"的措辞**。
（`zhanglu` 这个名字在 npm 被别人占了，所以包名和 bin 名都是 `zhanglu-net`。）

后续 bump：**只改 `cli/package.json` 的 `version`** 一处（CLI 里的版本号是运行时 `createRequire`
读 package.json 的，不存在第二处要同步；这坑踩过一次），然后：

```bash
cd cli
npm publish --dry-run          # 先看要发什么：应是 3 个文件（bin/ + README.md + package.json）
npm publish --access public
```

- 需要 npm 登录态（`npm whoami` 验；没登录 `npm login`）。**远程 agent 会话做不了这步**，留给人。
- 开了发布 2FA 就加 `--otp=<6位码>`。
- 本地 Node 只要 ≥18 即可（CLI 零依赖、只用 `parseArgs` / `createRequire`）。`.nvmrc` 的 22 是给 CF Pages 构建的，与 publish 无关。

CLI 与站点端点松耦合 —— 改端点 schema 时若不破坏向下兼容，CLI 不需要发新版。
反过来：**给 CLI 加 `list`/`get` 新类型只需改 `KINDS` 表**（`list`/`get`/帮助文本都从它派生），
但如果那个类型的端点还没上线，得先加端点再发 CLI。

### 14.4 加新端点 / 字段（流程）

1. **数据源**：如果是新字段，先改 `src/content/config.ts` Zod schema（zh 与 `*En` 共用同一份 schema 常量）；如果是新 collection，加 `defineCollection` **两份**（`x` 和 `xEn`）
2. **markdown / JSON 落数据**：`src/content/<coll>/` + `src/content/<coll>En/`（或 `src/data/*.json` + `*.en.json`）
3. **字段形状**：改 `src/lib/api.ts` 的 builder —— **zh / en 同时生效，这是唯一该改字段的地方**
4. **端点**（只有新 collection 才需要）：在 `src/pages/api/` 和 `src/pages/en/api/` 各加一个薄包装，只负责「取哪个集合 + 传 `'zh'` / `'en'`」
5. **CLI**（可选）：`cli/bin/zhanglu-net.mjs` 顶部的 `KINDS` 表加一项即可（`list` / `get` / help 文本都是从它派生的）
6. **manifest**：`src/lib/api.ts` 的 `buildIndex` 里登记新端点（zh / en 一起生效）
7. **llms.txt**：`public/llms.txt` **和** `public/en/llms.txt` 各加一行
8. **文档**：`/agents` 与 `/en/agents` 的 `endpoints` 数组各加一行（数字别写死，`cliLines` 那种就地算）
9. **测**：`pnpm build` 过 → `curl localhost:4321/api/<新端点>.json` 和 `/en/api/<新端点>.json` 都看一眼

### 14.5 不要做的事

- ❌ **不要在端点文件里内联字段形状**。字段只在 `src/lib/api.ts` 定义一次，端点文件只做「取哪个集合 + 哪种语言」。曾因内联漂过一次（列表有 `loc/persona/cover`、详情没有）。
- ❌ **不要只加 zh 端点不加 en**（或反之）。两边都得有，否则 `/en/agents` 承诺的英文数据会落到中文 payload 上。
- ❌ **不要在页面文案里写死会漂的数字**（端点个数、CLI 行数）。`/agents` 的 `cliLines` 是 build 时 `readFileSync` 数出来的，照这个做。
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

---

## 15. 开发纪律与过程记录（Superpowers 式，原生落地）

> 本站**不装** Superpowers 插件（obra / Jesse Vincent 的 Claude Code 插件）：它是本地插件，装不进临时的远程 web 会话；且它完整的 `brainstorm → git worktree → 写计划 → 子 agent 执行 → TDD → 完成前验证` 流程是给"重代码、有测试"的项目设计的，对以内容为主的本站偏重。
> 但**采纳它的内核**——先想清楚、留下书面产物、完成前必须验证。纪律固化在本节，过程记录落在 `docs/dev-log/`（随 git 走，本地和远程会话都看得到）。

### 15.1 每次开发的固定回路

```
① 计划  →  ② 改  →  ③ 验证  →  ④ 过程记录
```

1. **计划** —— 动手前先想清楚"改哪些文件、为什么、怎么验证"。改动大就写进 dev-log 的「目标」段；小改一句话带过。碰 schema / 组件 / 构建，先读懂 §4 §9 再动手，别顺手扩大范围。
2. **改** —— 按计划改。
3. **验证（完成前必做，不可跳）**：
   - 任何改动 → `pnpm run build` 必须过（**别用 `| tail` 吞错误**，见 §9.1）。
   - 视觉 / 组件 / 布局 → 再 `pnpm preview` 或截图看一眼，手机端按 §9.8 查横向溢出。
   - 端点 / 数据 → build 后 `curl` 对应 `/api/*.json`（见 §14.4）。
   - **没验证 = 没完成。** 别把"应该没问题"当成"验证过了"。
4. **过程记录** —— 在 `docs/dev-log/` 留一条（格式见 §15.2 与 `docs/dev-log/README.md`）。

### 15.2 过程记录（dev-log）写什么

- **位置**：`docs/dev-log/YYYY-MM-DD-<关键词>.md`，一次开发一个文件。
- **五段式**：目标 / 改动（文件清单）/ 验证（build 结果 + 预览或截图）/ 踩坑（可选）/ 结论与交付物。
- **目的**：让未来的你和别的 agent 顺着记录复盘，而不是只能看 commit diff 猜意图。**踩到新坑 → 顺手也补进 §9。**
- 模板和更细的说明在 `docs/dev-log/README.md`。

### 15.3 按改动大小裁剪（别搞流程表演）

| 改动类型 | 计划 | 验证 | dev-log |
|---|---|---|---|
| 内容微调（改一句文案 / 加一篇 article） | 一句话 | `pnpm build` | 一小段（当天可合并）|
| 新增 项目 / presentation / skill | 列文件 | build + 列表页 / 首页扫一眼 | 一条 |
| 组件 / CSS / 布局 | 列文件 + 意图 | build + 截图（桌面 + 手机）| 一条，附截图 |
| schema / 端点 / 脚手架 / 构建配置 | 写清楚 + 影响面 | build + curl 端点 + 回归受影响页 | 一条，写明为什么这么改 |
| 纯仓库文档（`docs/`、本指南）| 一句话 | `pnpm build`（确认没误伤 `src/`）| 可选，重要决策才记 |

### 15.4 和既有约定的关系

- 「验证」那步就是 §9.1「build 单独跑、看到 Complete 再继续」的硬化，外加视觉 / 端点回归。
- 「过程记录」是 commit 之外的"过程"层，**不替代** commit message（§8）、也**不替代**本指南（§13）：dev-log 记"这次怎么做的"，本指南记"以后该怎么做"，新坑进 §9。
- 发版仍按 §8.1。

> 想上真插件走完整流程 → 本地 Claude Code 的 `/plugin` 里搜 **superpowers**（作者 obra / Jesse Vincent）安装；远程 web 会话装不住，仍以本节的原生纪律为准。

---

## 16. 双语（中文 / English）i18n

> 全站中英双语：中文默认在根路径 `/`，英文在 `/en/` 子路径。浏览器首访按语言自适应跳转，页头可手动切换。

### 16.1 架构一览

| 维度 | 做法 |
|---|---|
| URL | zh 在 `/`，en 在 `/en/`（`astro.config.mjs` 的 `i18n`，`prefixDefaultLocale: false`）|
| 语言检测 | 组件里 `getLangFromUrl(Astro.url)`（`/en` 前缀 → `'en'`，否则 `'zh'`）——**自检，不靠 props 层层传** |
| UI 文案 | `src/i18n/ui.ts` 字典（zh/en 两套）+ `useTranslations(lang)`；**页面独有的长散文不进字典，直接写在各自 en 页里** |
| helpers | `src/i18n/utils.ts`：`getLangFromUrl` / `localizePath(path,lang)` / `stripLang` / `altPath(pathname,target)` |
| 内容集合 | 每个集合有平行的 `*En` 版（`projectsEn` / `articlesEn` / `presentationsEn` / `skillsEn` / `weeklyEn`），同 schema，内容在 `src/content/<coll>En/`。**zh 集合完全不动，无需过滤** |
| 数据 | `about.en.json` / `social.en.json` 对应 `about.json` / `social.json` |
| 页面 | 每个 zh 页在 `src/pages/en/` 有一份镜像；**en 页比 zh 页深一层，相对 import 多一个 `../`**，且 `getCollection('x')` → `getCollection('xEn')` |
| SEO | `Base.astro` 输出 `<html lang>`、`hreflang`（zh-CN / en / x-default）、`og:locale`、分语言 RSS（`/rss.xml` 与 `/en/rss.xml`）；`sitemap()` 开了 i18n |
| 自适应 | `Base.astro` head 里的内联脚本：首访无偏好时按 `navigator.language` 跳；页头切换按钮把选择写进 `localStorage['site-lang']`，之后以选择为准、不再自动跳 |

### 16.2 常见双语更新

- **加一条 UI 文案**：`src/i18n/ui.ts` 的 `zh` 和 `en` **两处都加**同一个 key。
- **加一个项目 / skill / 文章**：先写 zh（`src/content/<coll>/x.md`），再写英文版到 `src/content/<coll>En/x.md`（同 slug，frontmatter 结构一致，只翻可译值）。
- **加一个新页面**：写 `src/pages/x.astro`，再在 `src/pages/en/x.astro` 建镜像（记得 import 多加一个 `../`、`getCollection` 换成 `*En`、站内导航链接前缀 `/en`、资源/外链/`/api`/锚点不加前缀）。
- **加导航项**：`Header.astro` 的 `nav` 数组用 `{ base:'/x', key:'nav.x' }`，再在 `ui.ts` 两语都加 `nav.x`。

### 16.3 不要做的事（双语专属，补充 §10）

- ❌ **别只写 zh 页不写 en 镜像就 ff 到 main**：自适应脚本假设每个路径两语都在，英文访客会被跳到不存在的 `/en/...` → 404。en 站没补全前，只推 branch，别 ff main。
- ❌ **别在组件里硬编码中文再指望双语**：UI 词进 `ui.ts`，页面散文写进对应语言的页面文件。
- ❌ **别改 `zh` 集合去塞英文**：英文一律进 `*En` 平行集合，zh 消费端保持零改动。
- ❌ **en 页里别把资源路径也加 `/en` 前缀**：`/brand/*.svg`、`/og/*.png`、`/favicon.svg`、`/covers/*`、`/api/*`、外链、`#锚点` 都原样。只有"页面路由"链接才加 `/en`。
