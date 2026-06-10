# 给 agent 写了个 CLI:用一行 `npx zhanglu-net` 替代 HTML 抓取

> 不做 MCP,不做 SDK,做 9 个静态 JSON 端点和一个 270 行的 CLI。1.5 小时上线。

## 起因

zhanglu.net 昨天上线。开站第一版就装了 30 个 Claude Skill 索引、3 个项目、1 篇公众号文章入口。问题来了:

> AI agent 想引用我站上的内容,怎么办?

目前的选项很糟糕:

1. **抓 HTML** —— agent 拿到的是给人看的版式,要解析。Token 浪费、字段不稳。
2. **MCP server** —— Claude Code 支持,但 Codex / Hermes / OpenClaw / 我自己写的小 agent 不一定支持。
3. **不接** —— 那我建这个站干嘛。

我选了第四条:**给站点加一层 JSON API + 一个 CLI**。

## 设计的两层

```
       zhanglu.net (Cloudflare Pages,全静态)
                  │
   ┌──────────────┼──────────────┐
   │              │              │
HTML 页面     /api/*.json     /llms.txt
(给人看)      (给 agent)      (自发现)
                  │
       ┌──────────┴──────────┐
       │                     │
   curl / fetch         npx zhanglu-net (CLI)
   (任何 agent)         (Node 18+,零运行时依赖)
```

### 第一层:9 个静态 JSON 端点

```
/api/index.json              manifest(counts + 所有端点)
/api/projects.json           项目列表
/api/projects/{slug}.json    单项目(含 body_md)
/api/articles.json           公众号文章入口
/api/skills.json             Claude Skill 索引
/api/skills/{slug}.json      单 skill(含 body_md)
/api/about.json              简介
/api/social.json             公开社交(脱敏过滤邮箱)
/api/search.json             扁平语料,CLI 客户端搜
```

build 时一次性生成静态文件,CF Pages 边缘 cache 友好,`Access-Control-Allow-Origin: *`,浏览器端 agent 也能直接用。

### 第二层:CLI

```bash
npx zhanglu-net list skills --featured
npx zhanglu-net get skill mba --md
npx zhanglu-net search "品牌判断" --type skill
npx zhanglu-net about --json
```

CLI 是 JSON 端点的薄包装。`--json` 给 agent pipe,默认人类可读带 ANSI 颜色(agent 端非 TTY 自动关)。

## 几个明确不做的决策

**不做 MCP server。** Claude Code 之外的 agent 还不一定支持 MCP。HTTP + JSON 是最大公约数。如果未来 MCP 用户多了,加一个 CF Worker 把现有端点包成 MCP server,成本可控。

**不做服务端搜索。** 语料就 30 条 skill + 3 个项目 + 几篇文章,全文 < 100KB。CLI 拉一份 `/api/search.json`,本地 `text.toLowerCase().includes(needle)` 就够。简单评分:title 命中 +5、出现次数累加。语料涨到几百再换 MiniSearch。

**CLI 零运行时依赖。** Node 18+ 内置的 `fetch` 替代 `node-fetch`,`node:util` 的 `parseArgs` 替代 `commander`,ANSI escape codes 手拼替代 `chalk`。`npx zhanglu-net` 启动快,agent 调也不卡。

**公众号正文不做端点。** 公众号 URL 反爬,WebFetch 抓不到。站内只存入口(title / date / summary / url),正文跳外链。

## 自发现:`/llms.txt`

llmstxt.org 在推一份约定 —— 站点根放 `llms.txt`,告诉 AI agent "我这有啥、怎么读"。我跟了:

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

任何 agent 拿到 `https://zhanglu.net`,先 `GET /llms.txt`,自己就知道下一步去哪了。

## 怎么用

**Claude Code 里**:我写了个 `/zhanglu` skill,触发词包括「查张路的 skill」「zhanglu 上的 X」。skill 会自动调 `npx zhanglu-net`。

**其他 agent**:

```bash
# 列出我所有 featured 的 skill
curl -s https://zhanglu.net/api/skills.json | jq '.items[] | select(.featured)'

# 拿 mba skill 的全文
curl -s https://zhanglu.net/api/skills/mba.json | jq -r .body_md

# 全文搜
curl -s https://zhanglu.net/api/search.json | jq '.items[] | select(.text | test("品牌"; "i"))'
```

或者直接:

```bash
npx zhanglu-net list skills --featured --json
npx zhanglu-net get skill mba --md
npx zhanglu-net search "品牌"
```

## 实施时间

```
端点 (9 个文件):           25 分钟
CLI (单文件 270 行):       30 分钟
llms.txt / robots.txt:      5 分钟
Skill (SKILL.md + sync):   10 分钟
设计文档 + 本文 + 草稿:    20 分钟
AGENTS.md / README 更新:   10 分钟
build + test + commit:     15 分钟
─────────────────────────────────
合计:                      ~1.5 小时
```

包括写这篇文章的草稿。**给自己留够时间写文档,比代码本身重要。**

## 现在拿走

- 站点接入指南: https://zhanglu.net/agents
- 自发现入口: https://zhanglu.net/llms.txt
- Manifest: https://zhanglu.net/api/index.json
- CLI: `npx zhanglu-net --help`
- 源码: https://github.com/zhanglunet/zhanglu.net
- 设计文档: 仓库内 `docs/agent-cli/design.md`

如果你也维护一个内容站,强烈建议加一层 JSON API + `/llms.txt`。不需要框架升级,不需要新服务。Astro / Next / Hugo 都能 build 时生成静态 JSON。Cloudflare Pages 自动 cache。零成本。

下一个 agent 来抓你站时,不会再卡在 HTML parse 上了。

---

> 张路 · 2026-06-09
> 原文(站内长文,排版更好): https://zhanglu.net/posts/agent-cli
> 站点: zhanglu.net · GitHub: @zhanglunet
