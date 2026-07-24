# Design Doc — zhanglu.net Agent CLI

> **Status**: Shipped 2026-06-09
> **Author**: 张路 (with Claude Code, Opus 4.7)
> **Scope**: 给 Hermes / OpenClaw / Codex / Claude Code 等 AI agent 一个统一接口访问 zhanglu.net 内容

---

## 1. 问题

zhanglu.net 上的内容（30+ Claude Skill 索引、几个项目、公众号文章入口）目前只有 HTML 视图。Agent 想引用要么自己 parse HTML，要么放弃。三个具体痛点：

1. **没有结构化出口**：站内 sitemap 给搜索引擎，RSS 给 reader，但都不是 agent 想要的字段化数据。
2. **没有自发现机制**：agent 不知道这个站有什么、按什么 schema 组织。
3. **每个 agent 都要重新发明轮子**：Claude Code 要 MCP、Codex 要 function calling、Hermes 走 HTTP，三套接入逻辑没有共享。

## 2. 目标 / 非目标

**目标**：
- 任何 agent 用 HTTP GET 就能拿到结构化数据
- 一个 CLI 包装常用查询，agent 端零依赖
- 自发现：一份 `llms.txt` + 一份 `/api/index.json` manifest
- CDN 友好：build 时全静态生成，CF Pages 直接 cache

**非目标**：
- 不做服务端搜索（语料 < 100 项，客户端 substring 够了）
- 不做写入端点（站点是只读发布，写入走 git）
- 不做 MCP server（等生态再成熟一波）
- 不做鉴权（公开内容，无私密字段）

## 3. 架构

```
                       zhanglu.net (Cloudflare Pages, 静态)
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
   HTML 页面                  /api/*.json                  /llms.txt
   (给人看)                   (给 agent 看)                (自发现入口)
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
            curl / fetch                    npx zhanglu-net (CLI)
            (任何 agent)                     (Node 18+, 零运行时 deps)
```

**关键决策**：JSON 端点是单一事实源。CLI 只是它的薄包装。任何走 HTTP 的 agent 都能复用同一份数据。

## 4. 端点 schema

### `/api/index.json` — manifest

```json
{
  "version": "1",
  "site": "https://zhanglu.net",
  "name": "张路",
  "tagline": "...",
  "bio": "...",
  "generated_at": "2026-06-09T...",
  "counts": { "projects": 3, "articles": 1, "skills": 30 },
  "endpoints": {
    "projects": "https://zhanglu.net/api/projects.json",
    "project": "https://zhanglu.net/api/projects/{slug}.json",
    "...": "..."
  },
  "cli": "npx zhanglu-net --help",
  "docs": "https://zhanglu.net/llms.txt"
}
```

`version` 字段保留 schema 演进余地。当前 `"1"`。

### `/api/projects.json` 列表

```json
{
  "version": "1",
  "count": 3,
  "items": [
    {
      "slug": "qcc-agent",
      "title": "QCC Agent",
      "tagline": "...",
      "url": "https://...",
      "repo": "https://github.com/...",
      "tech": ["MCP", "Python", "..."],
      "year": 2026,
      "featured": true,
      "status": "live",
      "order": 3,
      "permalink": "https://zhanglu.net/projects/qcc-agent",
      "body_url": "https://zhanglu.net/api/projects/qcc-agent.json"
    }
  ]
}
```

### `/api/projects/{slug}.json` 单项

列表字段 + `body_md`（原始 markdown 正文）。

### `/api/articles.json`

```json
{
  "version": "1",
  "count": N,
  "items": [
    { "slug", "title", "source", "url", "date", "summary", "tags", "featured" }
  ]
}
```

文章是外链入口（公众号 / Substack），没有 `body_md` 端点。

### `/api/skills.json` + `/api/skills/{slug}.json`

```
slug, name, description, source, category, featured, handwritten, synced_at,
permalink, body_url, [body_md]
```

`description` 是 multi-line YAML scalar 字符串（含换行）。

### `/api/about.json`

直出 `src/data/about.json`，avatar 路径补全成绝对 URL。

### `/api/social.json`

`src/data/social.json` 脱敏：
- 过滤含 `email` / `mail` 字样的 label / icon
- url 含 "TODO" 转 null
- qrcode 路径补全成绝对 URL

### `/api/search.json`

扁平语料，给 CLI 客户端 substring 搜索：

```json
{
  "version": "1",
  "count": 35,
  "items": [
    {
      "type": "skill" | "project" | "article" | "about",
      "slug": "...",
      "title": "...",
      "text": "<拼接的 name + description + tagline + body>",
      "url": "..."
    }
  ]
}
```

**为什么不用 MiniSearch / lunr**：30 条语料、全文 < 100KB，本地 `text.toLowerCase().includes(needle)` + 简单评分（title 命中 +5、出现次数累加）就够了。语料涨到几百再换。

## 5. 实现

### 5.1 Astro 静态端点

`src/pages/api/*.json.ts` 文件用 Astro 5 的 `APIRoute` 接口，build 时生成静态 .json 文件。

```ts
export const GET: APIRoute = async ({ site }) => {
  const data = await getCollection('skills');
  return new Response(JSON.stringify({ ... }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
```

动态路由（`[slug].json.ts`）需要 `getStaticPaths`。

CORS：所有端点带 `Access-Control-Allow-Origin: *`，浏览器端 agent 也能用。

### 5.2 CLI 包

`cli/` 子目录，独立 `package.json`：

```
cli/
├── package.json   # name: "zhanglu-net", bin: { "zhanglu-net": "./bin/zhanglu-net.mjs" }
├── bin/
│   └── zhanglu.mjs  # 单文件, ~270 行
└── README.md
```

**零依赖**原则：
- 参数解析用 `node:util` 的 `parseArgs`（Node 18+ 内置）
- HTTP 用 global `fetch`（Node 18+ 内置）
- ANSI 颜色用 escape codes 手动拼
- 不要 `chalk` / `commander` / `node-fetch` / `axios`

**命令矩阵**：

| 命令 | 用途 |
|---|---|
| `list <kind>` | `kind`: skills / projects / articles |
| `get <kind> <slug>` | `kind`: skill / project / article |
| `search <kw>` | 跨所有 type 搜 |
| `about` | bio + tags |
| `social` | 公开社交链 |
| `endpoints` | 打印 manifest |
| `help` / `version` | 元命令 |

**通用 flags**：
- `--json` agent 模式（默认人类可读）
- `--featured` / `--source` / `--status` / `--type` / `--since` 过滤
- `--limit N` 截断
- `--md` get 时只输出 body_md
- `--base <url>` 覆盖默认 base

**环境**：
- `ZHANGLU_BASE_URL` 切换 base（本地 dev: `http://localhost:4321`）
- `NO_COLOR=1` 关 ANSI 颜色（agent 默认 stdout 非 TTY，自动关）

### 5.3 自发现

`/llms.txt` 在站根，参考 [llmstxt.org](https://llmstxt.org) 约定：

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

`/robots.txt` 顺手加，明确允许所有 user agent + sitemap 链接。

## 6. 安全 / 隐私

- 站点本来就是公开发布，无私密字段
- `social.json` 增加邮箱字段过滤，作为防御性默认
- 没有写入端点，没有 token，没有 rate limit 担心
- CORS 全开，方便浏览器端 agent

## 7. 可演进路径

按需求顺序排：

| 阶段 | 触发条件 | 加什么 |
|---|---|---|
| 现在 | — | 静态 JSON + npx CLI + llms.txt |
| 语料涨到 200+ | search 慢 | 改 MiniSearch 预生成 index |
| Claude Code 用户多 | MCP 需求 | 加一个 CF Worker 包装这些端点成 MCP server |
| 跨站聚合 | 不止 zhanglu | 抽 schema 成独立 npm package |
| 写入 | 评论 / 引用 | 走 GitHub issues API，不动这套 |

每一步都是单调增量，不破坏现有 API。

## 8. 测试 / 验证

1. `pnpm run build` 必须过，所有 `/api/*.json` 落到 `dist/api/`
2. `node cli/bin/zhanglu-net.mjs endpoints --base http://localhost:4321` 拿到 manifest
3. `node cli/bin/zhanglu-net.mjs list skills` 输出非空
4. `node cli/bin/zhanglu-net.mjs search "MCP" --json` JSON parsable
5. CF Pages 部署后，`curl https://zhanglu.net/api/index.json` 200 且 `Content-Type: application/json`

## 9. 时间盒子

总耗时 ~1.5h，含本设计文档：

- 端点 (9 个文件): 25min
- CLI (单文件 270 行): 30min
- llms.txt / robots.txt: 5min
- Skill (SKILL.md + sync): 10min
- 文档 (本文 + dev-log + 公众号 draft): 20min
- AGENTS.md / README 更新: 10min
- build + test + commit: 15min

## 10. 不做的事 (with reason)

- ❌ **MCP server** —— Claude Code 之外的 agent（Codex / Hermes / OpenClaw）还不一定都支持 MCP。HTTP JSON 是最大公约数。
- ❌ **OpenAPI / JSON Schema** —— 端点 9 个、字段不到 30 个，schema 写在本文档里足够。维护两份反而错位风险高。
- ❌ **GraphQL** —— overkill。语料 < 100 项，全量 < 200KB，直接 list + get 够了。
- ❌ **WebSocket / SSE** —— 内容更新走 git push，agent 拿快照即可，没有实时需求。
- ❌ **CLI 自动更新检查** —— `npx` 每次拉最新，全局装的人加个 `--latest` 自检即可。
- ~~❌ **i18n 端点** —— 站点 lang=zh-CN，agent 自己处理翻译。~~
  **已推翻（2026-07-24）**：站点上了中英双语（`/en/` 子路径），前提不成立了。
  现在英文数据有平行端点：把任意路径前面加 `/en`（`/en/api/projects.json`），读 `*En` 集合；
  每个响应带 `lang` 字段；CLI 用 `--lang zh|en` 切。字段形状由 `src/lib/api.ts` 单一定义，
  zh / en 共用同一份 builder，避免两套漂移。

---

**See also**:
- `docs/agent-cli/dev-log.md` — 实施记录、踩坑
- `docs/agent-cli/wechat-draft.md` — 公众号文章草稿
- `cli/README.md` — CLI 用户文档
- `AGENTS.md` §14 — 维护指南
