# zhanglu-net

> Agent-friendly CLI for [zhanglu.net](https://zhanglu.net) — Claude Skills 索引、项目、文章、展示、搜索，全走静态 JSON 端点，零依赖。中英双语。
> npm 包名 `zhanglu-net`（`zhanglu` 在 npm 已被占），bin 名也是 `zhanglu-net`。

```bash
npx zhanglu-net --help
npx zhanglu-net list skills
npx zhanglu-net list projects --featured
npx zhanglu-net list presentations
npx zhanglu-net get skill mba --md
npx zhanglu-net search "品牌判断" --type skill
npx zhanglu-net --lang en search "brand judgment"
```

## 为什么

我把本机 30 多个 Claude Skill、几个公开项目、公众号文章入口都汇到 `zhanglu.net`。
这个 CLI 给 **任何 AI agent**（Claude Code / Codex / Hermes / OpenClaw / 自己写的）一个统一入口：

- 无 SDK，无注册，无 token
- 走 HTTP GET，纯静态 JSON
- `--json` 出原始 JSON 给 agent pipe
- 默认人类可读，带颜色（非 TTY / `NO_COLOR` 自动关）

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

拿不到 npm 包时直接跑源码（零依赖，不需要 install）：

```bash
git clone https://github.com/zhanglunet/zhanglu.net
node zhanglu.net/cli/bin/zhanglu-net.mjs list skills
```

## 命令

| 命令 | 用途 |
|---|---|
| `list <kind>` | 列表：`skills` / `projects` / `articles` / `presentations` |
| `get <kind> <slug>` | 取一条：`skill` / `project` / `article` / `presentation` |
| `search <kw>` | 在全语料里搜关键词 |
| `about` / `social` | 作者简介 / 公开社交 |
| `endpoints`（别名 `manifest`） | 打印 `/api/index.json` manifest |
| `help <command>` | 看某个命令的详细帮助 |
| `version` | 打印版本 |

通用 flags：`--lang <zh|en>` `--json` `--featured` `--source` `--status` `--type` `--since` `--limit` `--md` `--base`

`skill` / `project` 有独立端点（带 `body_md`）；`article` / `presentation` 从列表里取，没有正文。

## 双语

站点中英双语：中文数据在 `/api/*`，英文在 `/en/api/*`。CLI 用 `--lang` 切：

```bash
npx zhanglu-net list projects              # 中文
npx zhanglu-net --lang en list projects     # 英文
ZHANGLU_LANG=en npx zhanglu-net about       # 也可以用环境变量
```

语料是按语言分开的 —— 中文语料搜英文词基本搜不到，反之亦然。

## 端点

CLI 是 `https://zhanglu.net/api/*.json` 的薄包装。直接 `curl` 也行：

```bash
curl -s https://zhanglu.net/api/index.json | jq
curl -s https://zhanglu.net/api/skills.json | jq '.items[].name'
curl -s https://zhanglu.net/api/skills/mba.json | jq .body_md -r

# 英文
curl -s https://zhanglu.net/en/api/projects.json | jq '.items[].title'
```

每个响应都带 `lang` 字段（`"zh"` / `"en"`）。不存在的路径返回真 404。
完整 manifest 看 [`/llms.txt`](https://zhanglu.net/llms.txt) 或 [`/en/llms.txt`](https://zhanglu.net/en/llms.txt)。

## 环境变量

| 变量 | 默认 | 作用 |
|---|---|---|
| `ZHANGLU_BASE_URL` | `https://zhanglu.net` | 改成 `http://localhost:4321` 跑本地 dev |
| `ZHANGLU_LANG` | `zh` | 默认语言，等价于 `--lang` |
| `NO_COLOR` | (unset) | 设了就没 ANSI 颜色 |

## License

MIT
