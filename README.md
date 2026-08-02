# zhanglu.net

张路的个人站。聚合：项目、展示、公众号文章、周报、本机 Claude Skills、社交链接。**中英双语。**

- **线上**: https://zhanglu.net · 英文 https://zhanglu.net/en/
- **备用**: https://zhanglu-net.pages.dev
- **仓库**: https://github.com/zhanglunet/zhanglu.net
- **给 agent**: [`/llms.txt`](https://zhanglu.net/llms.txt) · [`/agents`](https://zhanglu.net/agents) · [`/npm`](https://zhanglu.net/npm) · `npx zhanglu-net`

## 预览

[![首页 — 精选项目 / 展示 / 最近文章 / Skills](docs/screenshots/home.png)](https://zhanglu.net)

[![C-suite 专题 — Boss·CEO / MBA Brand·CMO / OAF·CFO 决策智能体套件](docs/screenshots/c-suite.png)](https://zhanglu.net/c-suite)

| 英文版 `/en/`（页头「中 / EN」切换） | Agent 接入指南 `/agents` |
|---|---|
| [![English homepage](docs/screenshots/home-en.png)](https://zhanglu.net/en/) | [![For agents](docs/screenshots/agents.png)](https://zhanglu.net/agents) |

| 项目（每个标注源码行数） | Skills 列表 | 关于页 |
|---|---|---|
| [![项目](docs/screenshots/projects.png)](https://zhanglu.net/projects/) | [![Skills](docs/screenshots/skills.png)](https://zhanglu.net/skills/) | [![关于](docs/screenshots/about.png)](https://zhanglu.net/about/) |

## 技术栈

Astro 5 · Tailwind 4 · MDX · Cloudflare Pages · Node 22 · pnpm 9

所有内容是 markdown / JSON 文件，无 CMS、无数据库。`git push` 即部署。

**双语**：中文在根路径，英文在 `/en/`（Astro 原生 i18n）。每个内容集合有平行的 `*En` 版，
浏览器首访按语言自适应跳转，页头可手动切换并记住选择。详见 [AGENTS.md](./AGENTS.md) §16。

## 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # 出 dist/
pnpm preview      # 看构建结果
```

## 内容更新（速查）

| 想做什么 | 改什么 |
|---|---|
| 加项目 | `src/content/projects/<slug>.md` 或 `pnpm run new:project -- ...` |
| 加文章入口 | `src/content/articles/<slug>.md` |
| 同步本机 skills | `pnpm run sync:skills` |
| 改首页 tagline / bio | `src/data/about.json` |
| 改社交链接 | `src/data/social.json` |
| 改首页排版 / 加新区块 | `src/pages/index.astro` |
| 加英文版内容 | 同名文件写进 `src/content/<coll>En/`；页面镜像到 `src/pages/en/` |
| 改 UI 文案（双语） | `src/i18n/ui.ts`（zh / en 两处都加同一个 key） |
| 重截截图 | `agent-browser open <url> && agent-browser screenshot --full docs/screenshots/<name>.png` |

**整体架构**: [`docs/architecture.md`](./docs/architecture.md) · 站上图示版 [zhanglu.net/how-it-works](https://zhanglu.net/how-it-works)

**详细指南**: [AGENTS.md](./AGENTS.md)（必读，含 schema、踩过的坑、CF Pages 配置、排错表）

## 部署链路

```
git push origin main → Cloudflare Pages (project: zhanglu-net) → 1-2 min → zhanglu.net
```

`main` 分支自动部署，PR 自动出 preview URL。

## AI 协作

本仓库设计成可被多 agent（Claude Code / Codex / Hermes）维护：

- 所有内容是强类型 markdown + JSON，Zod schema 在 `src/content/config.ts` 校验
- `AGENTS.md` 是所有 agent 通用的权威指南
- `CLAUDE.md` 用 `@AGENTS.md` 导入，Claude Code 自动加载
- Codex / Hermes 等其它 agent 应在 system prompt / context 里挂上 `AGENTS.md`

改任何内容前先读 `AGENTS.md`。

## 给 AI agent 调用

zhanglu.net 是 agent-friendly 站点 —— 所有内容在 build 时落成静态 JSON，挂在 `/api/*.json`（中文）和 `/en/api/*.json`（英文）。任何 agent 用 HTTP GET 直接拿，**CORS 全开，无 token，无 SDK，无注册**。

- 每个响应带 `lang` 字段（`"zh"` / `"en"`），可自查拿到的是哪种语言。
- **不存在的路径返回真 `404`**（不是 200 + 首页），状态码可以直接用来判断。
- 授权立场写在 [`/robots.txt`](https://zhanglu.net/robots.txt)：全站放行，`Content-Signal: search=yes, ai-input=yes, ai-train=no`
  —— **可以读、可以引用，请别拿去训练**。

### TL;DR — 一行命令速查

| 想做 | 命令 |
|---|---|
| agent 第一跳，自发现 | `curl https://zhanglu.net/llms.txt` |
| 列出所有 skill | `curl -s https://zhanglu.net/api/skills.json \| jq '.items[].name'` |
| 拿单个 skill 全文（含 body） | `curl -s https://zhanglu.net/api/skills/boss.json \| jq -r .body_md` |
| 只看 featured | `curl -s https://zhanglu.net/api/skills.json \| jq '.items[] \| select(.featured)'` |
| 搜关键词（含全文） | `curl -s https://zhanglu.net/api/search.json \| jq '.items[] \| select(.text \| test("品牌"; "i"))'` |
| 列项目 / 文章 / 简介 | `curl https://zhanglu.net/api/{projects,articles,about}.json` |
| 列展示 / 周报 | `curl https://zhanglu.net/api/{presentations,weekly}.json` |
| **拿英文数据** | 路径前面加 `/en`：`curl https://zhanglu.net/en/api/projects.json` |

或者用零依赖 CLI（Node 18+，`npx` 直接跑）：

```bash
npx zhanglu-net endpoints                          # 看 manifest + counts
npx zhanglu-net list skills --featured             # 列 featured skill
npx zhanglu-net get skill boss --md                # 拿 boss skill 全文 markdown
npx zhanglu-net search "品牌判断" --type skill     # 在 skill 里搜
npx zhanglu-net list projects --status live --json # 列 live 项目，出 JSON
npx zhanglu-net list weekly                        # 周报
npx zhanglu-net --lang en list projects            # 英文数据
npx zhanglu-net help search                        # 看某个命令的详细帮助
```

已发布在 npm（[`zhanglu-net`](https://www.npmjs.com/package/zhanglu-net)），零运行时依赖。
站上有专门说明页：[`/npm`](https://zhanglu.net/npm) · 英文 [`/en/npm`](https://zhanglu.net/en/npm)。
CLI 是端点的薄包装：`--json` 出原始 JSON 给 agent pipe，`--lang zh|en` 切语言，
默认人类可读带颜色（非 TTY / `NO_COLOR` 自动关）。`list` / `get` 覆盖
skills / projects / articles / presentations / weekly 五类。

### 端点清单

所有端点 build 时静态生成，`Content-Type: application/json; charset=utf-8`，带 `Access-Control-Allow-Origin: *`。

所有端点都有英文平行版 —— 把路径前面加 `/en`（`/en/api/projects.json`）。

| 端点 | 用途 | 关键字段 |
|---|---|---|
| [`/api/index.json`](https://zhanglu.net/api/index.json) | manifest（agent 进站第一跳） | `counts`, `endpoints`, `languages`, `lang` |
| [`/api/skills.json`](https://zhanglu.net/api/skills.json) | 全部 Claude Skill 索引 | `items[].name/description/source/featured/handwritten` |
| `/api/skills/{slug}.json` | 单 skill（含正文） | 上述 + `body_md`、`skill_md`（拼好 frontmatter，可直接落盘） |
| [`/api/projects.json`](https://zhanglu.net/api/projects.json) | 项目列表 | `items[].slug/title/tagline/tech/year/status/loc/persona/cover` |
| `/api/projects/{slug}.json` | 单项目（含正文） | 上述 + `body_md` |
| [`/api/articles.json`](https://zhanglu.net/api/articles.json) | 写作索引（站内 + 外链） | `items[].title/source/url/date/summary/tags` |
| [`/api/presentations.json`](https://zhanglu.net/api/presentations.json) | 网页版 PPT / 站点入口 | `items[].slug/title/tagline/url/kind/year` |
| [`/api/weekly.json`](https://zhanglu.net/api/weekly.json) | 公开周报（脱敏版） | `items[].slug/title/week/date_range/summary` |
| `/api/weekly/{slug}.json` | 单篇周报（含正文） | 上述 + `body_md` |
| [`/api/about.json`](https://zhanglu.net/api/about.json) | 张路简介 | `name/tagline/bio/tags/permalink` |
| [`/api/social.json`](https://zhanglu.net/api/social.json) | 公开社交链接（邮箱脱敏） | `links[].label/url/handle/icon` |
| [`/api/search.json`](https://zhanglu.net/api/search.json) | 扁平语料给客户端搜 | `items[].type/slug/title/text/url` |
| [`/llms.txt`](https://zhanglu.net/llms.txt) · [`/en/llms.txt`](https://zhanglu.net/en/llms.txt) | [llmstxt.org](https://llmstxt.org) 约定，agent 自发现 | 文本 |

### 四种集成模式

**Claude Code** —— 我维护了 `/zhanglu` skill。把它拉到本地：

```bash
mkdir -p ~/.claude/skills/zhanglu
curl -s https://zhanglu.net/api/skills/zhanglu.json | jq -r .skill_md > ~/.claude/skills/zhanglu/SKILL.md
```

（用 `skill_md` 而不是 `body_md` —— 后者只有正文，写出来的 SKILL.md 缺 frontmatter，Claude Code 认不了。）

之后说「查张路的 skill」「zhanglu 上的 X」「张路在做什么项目」，Claude Code 自动调 `npx zhanglu-net`。

**Codex / OpenAI function calling** —— 把每个端点注册成一个 tool（一次 GET 调用），返回 JSON 直接喂回模型。manifest 给 LLM 看一眼就能 follow 下一跳。

**Hermes / OpenClaw / 任何支持 HTTP tool 的 agent 框架** —— 把 `/api/index.json` 塞进 system prompt，agent 自己找下一步。语料 < 100KB，全量塞 context 也行。

**浏览器端 / Node / Python / 任何语言** —— 普通 HTTP：

```js
// 浏览器或 Node 18+ —— CORS 全开，无 preflight
const { items } = await fetch('https://zhanglu.net/api/skills.json').then(r => r.json());
```

```python
import urllib.request, json
with urllib.request.urlopen('https://zhanglu.net/api/skills.json') as r:
    data = json.load(r)
```

```go
resp, _ := http.Get("https://zhanglu.net/api/skills.json")
defer resp.Body.Close()
```

### 设计原则（不会变的承诺）

- **端点是静态文件**。不依赖任何外部 fetch，CF Pages 重建即更新，永远可用。
- **schema 在 `src/content/config.ts`**。Zod 强类型，端点是 schema 的薄序列化。
- **不做服务端搜索**。语料 < 100 项，`/api/search.json` 一次拉完，客户端 substring 就够。
- **不做鉴权**。公开内容才放进 `src/content/`，邮箱等 PII 在端点出口脱敏兜底。
- **CLI 零运行时依赖**。Node 18+ 内置 `fetch` + `parseArgs` + 手拼 ANSI，启动快。
- **字段形状只定义一次**。`src/lib/api.ts` 是 zh / en 两套端点共用的 builder —— 早期各端点内联字段，
  漂过一次（列表有 `loc/persona/cover`、详情没有）。加字段改那一个文件。
- **状态码可信**。不存在的路径返回真 `404`，别再靠 body 猜。

### 延伸

- 站上接入指南（带交互）：[zhanglu.net/agents](https://zhanglu.net/agents) · 英文 [/en/agents](https://zhanglu.net/en/agents)
- 为什么这么做 / 1.5 小时上线全过程：[zhanglu.net/posts/agent-cli](https://zhanglu.net/posts/agent-cli)
- 维护者文档：[`AGENTS.md`](./AGENTS.md) §14、[`docs/agent-cli/design.md`](./docs/agent-cli/design.md)、[`docs/agent-cli/dev-log.md`](./docs/agent-cli/dev-log.md)
- CLI 用户文档：[`cli/README.md`](./cli/README.md)

## License

MIT
