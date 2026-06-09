# Dev Log — Agent CLI

> 2026-06-09，一个晚上把 zhanglu.net 接成 agent 友好的 CLI 接口。

## 起因

zhanglu.net 上线两周，站内已经聚了 30 个 Claude Skill、3 个项目、1 篇公众号文章入口。但是站点只有 HTML 视图 —— agent（Claude Code / Codex / Hermes / OpenClaw）想引用，要么 parse HTML，要么作罢。决定加一层 JSON API + CLI。

## 决策记录

### D1 — JSON 端点 or MCP server？

权衡：
- **MCP**：Claude Code 原生支持，深度集成。但 Codex / Hermes / 自己手搓的 agent 不一定走 MCP。
- **JSON HTTP**：任何 agent 都能用 `fetch` / `curl`。CF Pages 静态 cache 友好。零运行时成本。

**结论**：先做 JSON。如果未来 MCP 用户多，再写一个 CF Worker 把 JSON 端点包成 MCP，成本可控。

### D2 — 客户端搜索 or 服务端搜索？

语料 < 100 项，全文 < 100KB。
- 服务端：要 CF Worker / Pages Function，加运维 surface。
- 客户端：CLI 拉 `/api/search.json` 本地 substring，简单评分（title +5、出现次数累加）。

**结论**：客户端。语料涨到几百再换 MiniSearch。

### D3 — CLI 用什么依赖？

`commander` / `chalk` / `node-fetch` 是默认选择，但 Node 18+ 已经内置：
- `node:util` 的 `parseArgs` 替代 `commander`
- global `fetch` 替代 `node-fetch`
- ANSI escape codes 手拼替代 `chalk`

**结论**：零运行时 deps。`npx zhanglu` 启动快，agent 跑也不卡。

### D4 — Skill body 放哪？

两个选择：
- 列表端点 `/api/skills.json` 直接含 body —— 一次拉全，但每次列表都 ~50KB。
- 列表只含 metadata，单项端点 `/api/skills/<slug>.json` 才含 body —— 列表 ~10KB，按需取 body。

**结论**：拆开。列表给 `body_url` 指向单项端点。Agent 决定要不要进一步抓。

### D5 — 公众号文章要不要做正文端点？

**不做**：
- 公众号正文在 `mp.weixin.qq.com`，反爬，WebFetch 抓不到
- 站内只存入口（title / date / summary / url），正文跳外链
- 加一个 articles/{slug}.json 也只能装 summary，意义不大

文档里明说：agent 要 wechat 正文，去公众号扫码读。

## 实施顺序

1. **JSON 端点** (`src/pages/api/`) — 9 个文件，~250 行。最先做，后面都依赖它。
2. **`/llms.txt` + `/robots.txt`** —— 2 分钟。自发现入口。
3. **CLI 包** (`cli/`) —— 单文件 ~270 行 ESM。
4. **Skill** (`~/.claude/skills/zhanglu/SKILL.md`) —— 写完跑 `pnpm sync:skills` 自动推到 `src/content/skills/zhanglu.md`。
5. **设计文档 + 本文 + 公众号草稿** (`docs/agent-cli/`) —— 边做边记。
6. **AGENTS.md §14 + README** —— 让未来的 agent 知道这层接口在。
7. **build + test + commit** —— `pnpm run build` 验所有端点，CLI 起 preview 跑命令。

## 踩到的坑

### P1 — `pnpm sync:skills` 把所有自动同步的 skill 都 "updated"

```
[sync-skills] 1 created · 15 updated · 0 unchanged · 14 skipped · 0 error
```

期望是 1 created（新的 zhanglu）+ 29 unchanged。但 15 个自动同步的 skill 都被标为 updated。

**原因**：sync 脚本里 `synced_at` 每次都写当天日期，比对时虽然排除了 `synced_at` 字段，但脚本逻辑里 `normalize(JSON.stringify(oldKeep))` 对 frontmatter 顺序敏感。今天和昨天的 synced_at 不同 → 写入 → 看起来"变了"。

**影响**：构建结果一致，只是 git diff 噪音多。后续可以优化 sync 脚本的 diff 逻辑，但不在本次 scope。

### P2 — Astro 5 静态端点的 `props` 类型

`[slug].json.ts` 里用 `getStaticPaths` 注入 props，TypeScript 没法自动推导 `entry` 的具体类型。当前用：

```ts
const entry = props.entry as Awaited<ReturnType<typeof getCollection<'skills'>>>[number];
```

不优雅但能过类型检查。Astro 文档里有更优雅的写法，未来重构再说。

### P3 — `social.json` 脱敏

`src/data/social.json` 里现在没有邮箱条目（之前清理过），但端点的脱敏过滤仍然保留，防御性默认。如果用户回头加 email 进 social.json，端点不会泄露。

## 验证

- [x] `pnpm run build` 过，9 个端点都落到 `dist/api/`
- [x] CLI `endpoints` / `list skills` / `get skill mba --md` / `search MCP` 都正常输出
- [x] `--json` flag 输出 parsable JSON
- [x] `ZHANGLU_BASE_URL=http://localhost:4321` 对本地 dev server 工作
- [x] CORS header 在所有端点

## 后续 TODO

- [ ] 发 `zhanglu` 到 npm（`cd cli && npm publish`），让 `npx zhanglu` 一键可用
- [ ] 公众号文章发布后，加 `src/content/articles/agent-cli-design.md` 入口
- [ ] 观察 7 天的 `/api/*.json` 访问日志，看是否需要进一步优化
- [ ] 如果有人请求 MCP server，写一个 CF Worker 包装现有端点

## 元决策（怎么开发这个）

- **设计先行**：在 AskUserQuestion 里把 CLI 形态、用例都问清楚再动手，避免做完发现方向偏。
- **文档同步写**：设计文档 + dev log + 公众号草稿不是事后总结，是开发过程的一部分。一次性的认知比"做完再回忆"质量高。
- **TaskCreate 跟进度**：8 个任务标 in_progress → completed，自己也清楚卡在哪。
- **单 commit**：所有内容（端点 + CLI + skill + docs）一个 commit 推上去，CF Pages 构建一次到位。
