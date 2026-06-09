# 公众号草稿 — 给 AI Agent 写一个 CLI

> 这是一篇草稿。发到「张路的碎碎念」之后，把真实 URL 填进 `src/content/articles/`，让首页和 RSS 自动收。
>
> **预估阅读**: 6 分钟  ·  **配图建议**: 1) `llms.txt` 截图 2) `npx zhanglu-net list skills` 终端截图 3) 端点架构图

---

## 标题候选

1. **给 agent 写了个 CLI：用一行 `npx zhanglu-net` 替代 HTML 抓取**
2. zhanglu.net 现在能被 AI agent 直接读了：JSON API + 一个 270 行的 CLI
3. 不是 MCP，不是 SDK，是 30 个 Skill 的 JSON 接口

我选第一个。

---

## 副标题

> 不做 MCP，不做 SDK，做 9 个静态 JSON 端点和一个零依赖 CLI。1.5 小时上线。

---

## 正文

### 起因

zhanglu.net 昨天上线。开站第一版就装了 30 个 Claude Skill 索引、3 个项目、1 篇公众号文章入口。问题来了：

> AI agent 想引用我站上的内容，怎么办？

目前的选项很糟糕：

1. **抓 HTML** —— agent 拿到的是给人看的版式，要解析。Token 浪费、字段不稳。
2. **MCP server** —— Claude Code 支持，但 Codex / Hermes / OpenClaw / 我自己写的小 agent 不一定支持。
3. **不接** —— 那我建这个站干嘛。

我选了第四条：**给站点加一层 JSON API + 一个 CLI**。

### 设计的两层

```
       zhanglu.net (Cloudflare Pages，全静态)
                  │
   ┌──────────────┼──────────────┐
   │              │              │
HTML 页面     /api/*.json     /llms.txt
(给人看)      (给 agent)      (自发现)
                  │
       ┌──────────┴──────────┐
       │                     │
   curl / fetch         npx zhanglu-net (CLI)
   (任何 agent)         (Node 18+，零运行时依赖)
```

**第一层：9 个静态 JSON 端点**

```
/api/index.json       manifest（counts + 所有端点）
/api/projects.json    项目列表
/api/projects/{slug}.json  单项目（含 body_md）
/api/articles.json    公众号文章入口
/api/skills.json      Claude Skill 索引
/api/skills/{slug}.json    单 skill（含 body_md）
/api/about.json       简介
/api/social.json      公开社交（脱敏过滤邮箱）
/api/search.json      扁平语料，CLI 客户端搜
```

**第二层：CLI**

```bash
npx zhanglu-net list skills --featured
npx zhanglu-net get skill mba --md
npx zhanglu-net search "品牌判断" --type skill
npx zhanglu-net about --json
```

CLI 是 JSON 端点的薄包装。`--json` 给 agent pipe，默认人类可读带 ANSI 颜色。

### 几个明确不做的决策

**不做 MCP server**。Claude Code 之外的 agent 还不一定支持 MCP。HTTP + JSON 是最大公约数。如果未来 MCP 用户多了，加一个 CF Worker 把现有端点包成 MCP server，成本可控。

**不做服务端搜索**。语料就 30 条 skill + 3 个项目 + 几篇文章，全文 < 100KB。CLI 拉一份 `/api/search.json`，本地 `text.toLowerCase().includes(needle)` 就够。简单评分：title 命中 +5、出现次数累加。语料涨到几百再换 MiniSearch。

**CLI 零运行时依赖**。Node 18+ 内置的 `fetch` 替代 `node-fetch`，`node:util` 的 `parseArgs` 替代 `commander`，ANSI escape codes 手拼替代 `chalk`。`npx zhanglu-net` 启动快，agent 调也不卡。

**公众号正文不做端点**。公众号 URL 反爬，WebFetch 抓不到。站内只存入口（title / date / summary / url），正文跳外链。

### 自发现：`/llms.txt`

llmstxt.org 在推一份约定 —— 站点根放 `llms.txt`，告诉 AI agent "我这有啥、怎么读"。我跟了：

```
# zhanglu.net

> 张路的个人站。

## For AI agents
- /api/index.json — manifest
- /api/skills.json — Claude Skills 索引
- ...

## CLI
npx zhanglu-net --help
```

任何 agent 拿到 `https://zhanglu.net`，先 `GET /llms.txt`，自己就知道下一步去哪了。

### 怎么用

**Claude Code 里**：我写了个 `/zhanglu` skill，触发词包括「查张路的 skill」「zhanglu 上的 X」。skill 会自动调 `npx zhanglu-net`。

**其他 agent**：

```bash
# 列出我所有 featured 的 skill
curl -s https://zhanglu.net/api/skills.json | jq '.items[] | select(.featured)'

# 拿 mba skill 的全文
curl -s https://zhanglu.net/api/skills/mba.json | jq -r .body_md

# 全文搜
curl -s https://zhanglu.net/api/search.json | jq '.items[] | select(.text | test("品牌"; "i"))'
```

或者直接：

```bash
npx zhanglu-net list skills --featured --json
npx zhanglu-net get skill mba --md
npx zhanglu-net search "品牌"
```

### 实施时间

```
端点 (9 个文件):           25 分钟
CLI (单文件 270 行):       30 分钟
llms.txt / robots.txt:     5 分钟
Skill (SKILL.md + sync):   10 分钟
设计文档 + 本文 + 草稿:    20 分钟
AGENTS.md / README 更新:   10 分钟
build + test + commit:     15 分钟
─────────────────────────────────
合计:                      ~1.5 小时
```

包括写这篇文章的草稿。**给自己留够时间写文档，比代码本身重要。**

### 现在拿走

- 站点端点：https://zhanglu.net/llms.txt
- CLI：`npx zhanglu-net --help`
- 源码：https://github.com/zhanglunet/zhanglu.net
- 设计文档：repo 的 `docs/agent-cli/design.md`

如果你也维护一个内容站，强烈建议加一层 JSON API + `/llms.txt`。不需要框架升级，不需要新服务。Astro / Next / Hugo 都能 build 时生成静态 JSON。Cloudflare Pages 自动 cache。零成本。

下一个 agent 来抓你站时，不会再卡在 HTML parse 上了。

---

## 末尾

公众号末尾常规：
- 关注「张路的碎碎念」
- 站点：zhanglu.net
- GitHub：@zhanglunet

## 现状（2026-06-10 更新）

**已在站上发表**：站内长文路径 `/posts/agent-cli`，对应的写作索引条目
`src/content/articles/agent-cli.md` 已经入库，URL 指向站内 `https://zhanglu.net/posts/agent-cli`。

**还没发的话**：可以把本文作为公众号底稿，但不要再额外加一份 `articles/` 入口，
因为 `articles/` 只收"原始出处"——站内 post 就是原始出处，公众号是转载。
（如果同一篇内容公众号阅读量很大、想单独列出来，可以把现有 `articles/agent-cli.md`
的 url 改成公众号链接。但这样 ArticleCard 会把它标成"公众号"而不是"站内"，并新 tab 打开。
不推荐：原始出处优先。）
