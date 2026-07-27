---
name: "zhanglu"
description: |
  在 zhanglu.net 上查张路的项目、展示、公众号文章入口、公开周报和本机 Claude Skill 索引 ——
  不抓站，走构建期生成的静态 JSON API（/api/*.json），agent 端零 SDK 零 token。
  中英双语：中文 /api/*，英文 /en/api/*。

  适用场景：
  - 用户问"张路有哪些 skill"/"zhanglu 上的 boss skill 怎么用"/"看下张路在做啥项目"
  - 用户想引用 zhanglu.net 上的内容（文章入口、项目介绍、skill description、周报）
  - agent（Claude Code / Codex / Hermes / OpenClaw）需要查 zhanglu 的结构化数据

  动作（优先级由高到低）：
  1) 直接 curl 站点 `/api/*.json` —— 端点见 https://zhanglu.net/llms.txt（最稳，永远可用）
  2) 用 CLI `npx zhanglu-net <cmd>` —— 包名 zhanglu-net，零依赖
     （npm 包名 zhanglu 被占用，所以用 zhanglu-net 匹配域名）

  常用调用：
  - `npx zhanglu-net list skills [--featured] [--source local|plugin|custom]`
  - `npx zhanglu-net get skill <slug> [--md]` —— 拿单 skill 的 description + body
  - `npx zhanglu-net list projects [--featured] [--status live|beta|wip|archived]`
  - `npx zhanglu-net get project <slug>`
  - `npx zhanglu-net list articles [--source wechat|blog|...] [--since YYYY-MM-DD]`
  - `npx zhanglu-net list presentations` / `list weekly` / `get weekly <slug>`
  - `npx zhanglu-net search "<关键词>" [--type skill|project|article|presentation|weekly]`
  - `npx zhanglu-net about` / `social` / `endpoints` / `version`
  - 英文数据加 `--lang en`（或 `ZHANGLU_LANG=en`）；本地 dev 加 `--base http://localhost:4321`

  端点（直 curl，agent 也能用；英文把路径前面加 /en）：
  - GET /api/index.json   —— manifest，含 counts + 所有端点 + 双语交叉链接
  - GET /api/skills.json  —— 全 skill 索引（含 description / source / featured / handwritten）
  - GET /api/skills/{slug}.json  —— 单 skill 全量（含 body_md、可直接落盘的 skill_md）
  - GET /api/projects.json / /api/projects/{slug}.json
  - GET /api/articles.json / /api/presentations.json
  - GET /api/weekly.json / /api/weekly/{slug}.json
  - GET /api/about.json / /api/social.json
  - GET /api/search.json  —— 扁平语料 [{type, slug, title, text, url}]，本地 substring 搜

  默认输出人类可读；agent 想要纯 JSON 加 `--json`。

  不要用：
  - 通用网页抓取（用 WebFetch）
  - 公众号文章正文（zhanglu.net 上只存入口，正文在 mp.weixin.qq.com，反爬，WebFetch 也抓不到）
  - 张路本机 ~/.claude/skills/ 的真实文件路径（这个 skill 只看 zhanglu.net 发布出来的视图）

  显式触发：「查张路的 skill」「zhanglu 上的 X」「看一下 zhanglu.net 有什么」「npx zhanglu-net」「张路在做什么项目」「碎碎念发了啥」。
source: local
category: "meta"
featured: true
handwritten: true
synced_at: "2026-07-27"
---

## 用途

把 zhanglu.net 当**结构化数据源**读，而不是当网页抓。站点在构建期把每篇 markdown 同时渲染成
HTML 页面和 JSON 端点，所以 agent 拿到的永远是干净字段，不用 parse DOM、不会被改版打断。

## 何时用

- 需要引用 zhanglu.net 上的任何一条内容（项目 / 文章 / 展示 / 周报 / skill）
- 想知道张路本机有哪些 Claude Skill、某个 skill 的 description 怎么写的
- 需要英文数据（`--lang en`，或直接读 `/en/api/*.json`）

## 怎么用

最省事：

```bash
npx zhanglu-net list skills --featured
npx zhanglu-net get project boss --json
npx zhanglu-net --lang en search "brand judgment"
```

不想装任何东西，直接 curl：

```bash
curl -s https://zhanglu.net/api/index.json      # manifest，从这里 follow 下一跳
curl -s https://zhanglu.net/api/search.json     # 全站语料，本地 substring 搜
```

把这个 skill 装到自己机器上（`skill_md` 字段是拼好 frontmatter 的完整 SKILL.md）：

```bash
mkdir -p ~/.claude/skills/zhanglu
curl -s https://zhanglu.net/api/skills/zhanglu.json | jq -r .skill_md > ~/.claude/skills/zhanglu/SKILL.md
```

## 不要用

- 抓公众号正文 —— 站上只有入口链接，正文在 mp.weixin.qq.com，反爬
- 当通用网页抓取工具用 —— 那是 WebFetch 的活
- 指望它反映本机 `~/.claude/skills/` 的实时状态 —— 站上是最后一次 `pnpm run sync:skills` 的快照
