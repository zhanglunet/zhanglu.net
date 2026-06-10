# zhanglu-net

> Agent-friendly CLI for [zhanglu.net](https://zhanglu.net) — Claude Skills 索引、项目、文章、搜索，全走静态 JSON 端点，零依赖。
> npm 包名 `zhanglu-net`（`zhanglu` 在 npm 已被占），bin 名也是 `zhanglu-net`。

```bash
npx zhanglu-net --help
npx zhanglu-net list skills
npx zhanglu-net list projects --featured
npx zhanglu-net get skill mba --md
npx zhanglu-net search "品牌判断" --type skill
npx zhanglu-net about --json
```

## 为什么

我把本机 30 多个 Claude Skill、几个公开项目、公众号文章入口都汇到 `zhanglu.net`。  
这个 CLI 给 **任何 AI agent**（Claude Code / Codex / Hermes / OpenClaw / 自己写的）一个统一入口：

- 无 SDK，无注册，无 token
- 走 HTTP GET，纯静态 JSON，CDN cache 友好
- `--json` 出原始 JSON 给 agent pipe
- 默认人类可读，带颜色

## 安装

不用装，直接：

```bash
npx zhanglu-net <cmd>
```

或全局：

```bash
npm i -g zhanglu-net
zhanglu-net <cmd>
```

## 命令

| 命令 | 用途 |
|---|---|
| `list skills` / `list projects` / `list articles` | 列表 |
| `get skill <slug>` / `get project <slug>` / `get article <slug>` | 取一条 |
| `search <kw>` | 在所有内容里搜关键词 |
| `about` / `social` | 作者简介 / 公开社交 |
| `endpoints` | 打印 `/api/index.json` manifest |

通用 flags：`--json` `--featured` `--source` `--status` `--type` `--since` `--limit` `--md` `--base`

## 端点

CLI 是 `https://zhanglu.net/api/*.json` 的薄包装。直接 `curl` 也行：

```bash
curl -s https://zhanglu.net/api/index.json | jq
curl -s https://zhanglu.net/api/skills.json | jq '.items[].name'
curl -s https://zhanglu.net/api/skills/mba.json | jq .body_md -r
```

完整 manifest 看 [`/llms.txt`](https://zhanglu.net/llms.txt)。

## 环境变量

| 变量 | 默认 | 作用 |
|---|---|---|
| `ZHANGLU_BASE_URL` | `https://zhanglu.net` | 改成 `http://localhost:4321` 跑本地 dev |
| `NO_COLOR` | (unset) | 设了就没 ANSI 颜色 |

## License

MIT
