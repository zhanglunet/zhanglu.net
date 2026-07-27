# Changelog

本文件记录 [zhanglu.net](https://zhanglu.net) 站点的版本更新，采用 [Keep a Changelog](https://keepachangelog.com/zh-CN/) 风格，遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

> 版本号说明：本文件记的是**站点**版本（`package.json`）。CLI 是独立发布的 npm 包，
> 版本号在 `cli/package.json`，与站点版本不同步（当前 `zhanglu-net@0.2.0`）。

## [未发布]

修 skills 自动同步造成的三起事故（详见 `docs/dev-log/2026-07-27-skills-sync-incident.md`）。

### 修复

- **`sync:skills --prune` 会误删还存在的 skill**。断链 symlink / 读不到 `SKILL.md` /
  frontmatter 解析失败 / 缺 `description` 这四种情况以前都被当成「本机已删除」删掉，
  07-27 一次丢了 15 个（含 `featured: true` 的 `zhanglu`，导致 `/skills/zhanglu` 与
  `/api/skills/zhanglu.json` 线上 404，而 `/agents` 和 README 还链着它）。
  现在只要源目录还在就永不删，只报告为「⚠️ 不可读」；`featured` / `handwritten` 的孤儿也永不自动删。
- **`sync:auto` 遇到中英不对齐会照样推上线**。07-26/27 两次同步把 zh 从 30 推到 57、en 还是 30，
  `/en/skills` 静默少 27 条且构建不报错。现在直接 `exit 1` 不推送。
- **恢复 `zhanglu` skill**（改 `handwritten: true` 以免再被自动删），内容更新到当前端点集，
  并删掉「CDN cache 友好」这句与线上响应头不符的说法。
- **21 处文档和页面引用了已删除的 `mba` skill**（`/agents`、`/posts/agent-cli`、`llms.txt`、
  README、CLI 帮助里的 curl 与 `get skill` 示例），统一换成 `boss`。
- **README 的「装 skill」配方产出的是非法 skill**：`jq -r .body_md` 没有 frontmatter，
  Claude Code 认不了。

### 新增

- `/api/skills/{slug}.json` 与 `/en/api/skills/{slug}.json` 增加 **`skill_md`** 字段 ——
  拼好 frontmatter 的完整 `SKILL.md`，一行 `jq -r .skill_md` 即可落盘安装。
- `sync-skills.mjs` 增加 **`EXCLUDE`** 名单（glob，同时匹目录 slug 和 frontmatter `name`）。
  07-27 那次把 17 个 `aic-*` 内部服务 skill（企业 CRM / 差旅 / 考勤后端）推上了公开站，
  现已下线并由此拦住。25 个 `lark-*` 保留。
- `src/content/skillsEn/lark-*.md` —— 25 个英文平行版，`/skills` 与 `/en/skills` 恢复 1:1（各 41 个）。

### 变更

- 页面数 109 → **131**；JSON 端点文件 96 → **118**（端点类型仍 24）。
  `/how-it-works` 与 `/agents` 上的数字是 build 时算的，自动跟上，无需手改。

## [0.3.0] - 2026-07-25

站点最大的一次改动：**全站中英双语**，外加把 agent 接入层补成双语、CLI 正式发到 npm。

### 新增

- **全站英文版**（`/en/` 子路径，53 页）—— 中文默认在根路径，英文在 `/en/`。
  - 浏览器**首访按语言自适应**跳转；页头「中 / EN」手动切换并**记住选择**（之后以选择为准）。
  - 每个集合有平行 `*En` 版（projects / articles / presentations / skills / weekly），zh 集合零改动。
  - SEO：`<html lang>`、`hreflang`（zh-CN / en / x-default）、`og:locale`、分语言 RSS（`/en/rss.xml`）、sitemap i18n。
  - UI 文案进 `src/i18n/ui.ts` 字典；helpers 在 `src/i18n/utils.ts`。
- **C-suite 决策智能体专题**（`/c-suite`）—— Boss（CEO）· MBA Brand（CMO）· OAF（CFO）三件套定位「为 AI 原生组织而设计」，含
  三个席位介绍、共同方法论、[设计思想长文](https://zhanglu.net/posts/c-suite-design)、
  [品牌页](https://zhanglu.net/c-suite/brand)（logo「三弧一点，一枚印」四变体）与 OG 分享图。
- **本站 logo「一条路，一个句点」** + [品牌页 `/brand`](https://zhanglu.net/brand)（四变体 + 新 favicon），
  首页 hero 换成带绘制动画的标识版式，配首页 OG 分享图。
- **第二大脑**（<https://aip.cab>）项目。
- **往期作品 · tui3.com** 网站存档项目（archived），首页加 5 个子站截图画廊。
- **公开周报**（`/weekly`）—— 新增 `weekly` 集合 + 索引 + 单页，首篇 2026-W29 脱敏版。
- **全项目网站截图封面** —— `projects` 的 `cover` 字段现在会渲染（卡片顶部 banner + 详情页）。
- **项目人群标注** —— `projects` schema 加 `persona`，卡片 / 详情页显示朱砂徽章「为 CEO/CMO/CFO 设计」。
- **Agent 接入层双语化**：`/en/api/*` 一整套英文端点（读 `*En` 集合），响应带 `lang` 字段，
  `/api/index.json` 加 `languages` 交叉链接；新增 `/en/llms.txt`。
- **`/api/weekly.json` + `/api/weekly/{slug}.json`**（zh/en 各一对），weekly 同时进 `/api/search.json` 语料。
- **`zhanglu-net` CLI 发布到 npm**（`0.2.0`）—— `npx zhanglu-net <cmd>` 对任何人可用；
  新增 `--lang zh|en`、`list/get presentations`、`list/get weekly`、真正分命令的 `help <command>`。
- **真 404** —— 新增双语 `src/pages/404.astro`。此前不存在的路径返回 `200` + 中文首页，
  agent 无法用状态码判断端点是否存在；现在返回 `404`。
- **`public/_headers`** —— 显式声明 `/api/*` 与 `/en/api/*` 的 `Access-Control-Allow-Origin: *`
  （静态构建下端点代码里设的响应头不落盘，CORS 实际由托管层决定，不该依赖未声明的默认值）。
- **`Content-Signal`**（`public/robots.txt`）—— `search=yes, ai-input=yes, ai-train=no`：
  欢迎索引、欢迎 agent 实时读取引用，不同意用于模型训练。含 Content Signals Policy 标准前言。
- **开发纪律与过程记录**（`AGENTS.md` §15 + `docs/dev-log/`）—— 采纳 Superpowers 内核的原生版：
  计划 → 改 → **验证** → 过程记录；并回溯补写了 07-18→07-25 共 12 条 dev-log。

### 变更

- 首页标语改为「用 Harness + Loop 把复杂判断变成可追溯的流水线」（同步 `about.json` / `llms.txt` / OG 图）。
- **手机阅读优化** —— 导航改单行横滑；修 390px 视口下三处横向溢出（grid 隐式轨道 + `<pre>`、
  长英文 token 不断行、导航换行）；`.prose-zh` 表格 ≤640px 整表横滑。
- **端点字段收敛到 `src/lib/api.ts` 单一定义** —— 原来 10 个端点各自内联字段形状，已经漂过一次
  （列表有 `loc/persona/cover`、详情没有）。现在 zh / en 共用同一份 builder，加字段只改一处。
- `/agents` 与 `/en/agents` 补 `presentations` / `weekly` 端点、双语说明、`--lang`；
  **CLI 行数改为 build 时 `readFileSync` 数出来**（此前文案写死「270 行」，实际早已不是）。
- `docs/agent-cli/design.md` 中「❌ 不做 i18n 端点」的决策标记为**已推翻**（前提「站点单语 zh-CN」不再成立）。

### 修复

- `/en/agents` 端点表原本指向 `/api/*`（中文 payload）却在页面上承诺英文样例（`"name": "Zhang Lu"`）
  —— 现指向 `/en/api/*`，实际返回英文。
- 英文搜索此前几乎必然 0 命中（`/api/search.json` 只含中文语料）—— 现在 `/en/api/search.json` 含英文正文。
- `/api/projects/{slug}.json` 补回列表里有、详情里缺的 `loc` / `persona` / `cover`。
- CLI：`| head` 触发未捕获 EPIPE 打一屏堆栈（对主要在管道里调用的 CLI 是硬伤）；
  版本号两处硬编码会漂（改为运行时读 `package.json`）；`--limit abc` / `--source` 用错类型等
  非法用法此前静默返回空 = 假成功，现在一律明确报错 + exit 1。
- 移除 README / skill 描述里「CDN cache 友好」的错误说法（端点实际响应头是
  `cache-control: public, max-age=0, must-revalidate`，`cf-cache-status: DYNAMIC`，边缘并未缓存）。

### 已知限制

- 项目卡片上的**网站截图仍是中文**（三个产品本身是中文界面），`articles` 的外链同样指向中文原文
  —— 英文版翻的是站内文案与正文，不是被链接的外部原文。
- `/en/brand` 刻意保留「张路 / 路」二字：整个 logo 概念就是解释名字里的「路」= road。

## [0.2.0] - 2026-07-18

### 新增

- **Boss 项目**（<https://bossagent.cc>）—— 领导者决策智能体：1 锚点心证 + N 维度评委独立合议、必答反方，产出可引用 / 可打分 / 可证伪的判断报告，带 30/90/365 天归因校验。
- **OAF 项目**（<https://oaf.world>）—— 卫星互联网决策 Agent + 美/A/港三市场 AI 投研工作台，工程铁律「数字来自工具、叙事由大模型、缺数留白不编造」。
- **AI 愿景论坛 · 上海回顾**（<https://agentic-ai-shanghai-2026.pages.dev>）—— 2026 AI 愿景论坛（上海站）非官方回顾站：知识星图（99 实体 / 288 边）+ 30 场智能纪要 + 100+ 词条知识库 + 131 张幻灯片。
- **展示区**新增 Boss handbook、OAF slides 两张卡片。
- **全项目源码行数标注**：`projects` schema 加可选 `loc` 字段，卡片 + 详情页 + `/api/projects.json` 显示 `≈ N 行代码`（cloc 统计，排除文档 / 数据 / 生成物）。

### 变更

- 刷新 **mbabrand** 最近进展：v0.5 品牌 + 创始人 + 产业 + 组合关系宇宙、Brand Watch 舆情监控、全维度知识星图、mba-mcp-server（16 工具）等；补开源仓库链接。
- 精选项目排序调整为 mbabrand → boss → oaf → qiji-roadshow → qcc → shanghai（order 1–6）；展示排序 mbabrand → boss → oaf → openagent（order 1–4）。
- 刷新 `about.json` bio / tags、`public/llms.txt` 首段、`AGENTS.md` 内容快照与 schema 文档。

### 源码行数（cloc 统计，截至发布日）

| 项目 | 行数 | 主要构成 |
|---|---|---|
| boss | 87,943 | Python 50.9k · HTML 33.1k |
| oaf | 83,831 | HTML 42.8k · Python 40.5k |
| mbabrand | 22,311 | HTML 7.7k · TS 6.9k · Python 6.9k |
| shanghai | 6,376 | HTML 5.8k · JS · CSS |
| qcc-agent | 1,874 | HTML 1.2k · Python · TS |

> qiji-roadshow-2026 是 demo-day-dossier skill 生成的静态站，无独立代码仓库，故不标注。

## [0.1.0] - 2026-06

初始站点：个人主页、项目 / 文章 / 展示 / Skills 索引、Agent CLI 接口（`/api/*.json` + `npx zhanglu-net`）、RSS / sitemap / llms.txt。
