---
name: "zhanglu"
description: |
  在 zhanglu.net 上查张路本机的 Claude Skill 索引、项目、公众号文章 —— 不抓站，
  走静态 JSON API（/api/*.json），CDN cache 友好，agent 端零 SDK 零 token。
  
  适用场景：
  - 用户问"张路本机有哪些 skill"/"zhanglu 上的 mba skill 怎么用"/"看下张路在做啥项目"
  - 用户想引用 zhanglu.net 上的内容（公众号文章入口、项目介绍、skill description）
  - agent（Claude Code / Codex / Hermes / OpenClaw）需要查 zhanglu 的结构化数据
  
  动作（优先级由高到低）：
  1) 直接 curl 站点 `/api/*.json` —— 端点见 https://zhanglu.net/llms.txt（最稳，永远可用）
  2) 用 CLI `npx zhanglu-net <cmd>` —— 包名 zhanglu-net，零依赖
     （npm 包名 zhanglu 被占用，所以用 zhanglu-net 匹配域名）
  
  常用调用：
  - `npx zhanglu-net list skills [--featured] [--source local|plugin|custom]`
  - `npx zhanglu-net get skill <slug> [--md]` —— 拿单 skill 的 description + body
  - `npx zhanglu-net list projects [--featured] [--status live|wip|...]`
  - `npx zhanglu-net get project <slug>`
  - `npx zhanglu-net list articles [--source wechat|...] [--since YYYY-MM-DD]`
  - `npx zhanglu-net search "<关键词>" [--type skill|project|article] [--json]`
  - `npx zhanglu-net about` / `npx zhanglu-net social` / `npx zhanglu-net endpoints`
  
  端点（直 curl，agent 也能用）：
  - GET /api/index.json   —— manifest，含 counts + 所有端点列表
  - GET /api/skills.json  —— 全 skill 索引（含 description / source / featured / handwritten）
  - GET /api/skills/{slug}.json  —— 单 skill 全量（含 body_md）
  - GET /api/projects.json / /api/projects/{slug}.json
  - GET /api/articles.json
  - GET /api/about.json / /api/social.json
  - GET /api/search.json  —— 扁平语料 [{type, slug, title, text, url}]，本地 substring 搜
  
  默认输出人类可读；agent 想要纯 JSON 加 `--json`。
  
  不要用：
  - 通用网页抓取（用 WebFetch）
  - 公众号文章正文（zhanglu.net 上只存入口，正文在 mp.weixin.qq.com，反爬，要正文用 WebFetch 也抓不到）
  - 张路本机 ~/.claude/skills/ 的真实文件路径（这个 skill 只看 zhanglu.net 发布出来的视图）
  
  显式触发：「查张路的 skill」「zhanglu 上的 X」「看一下 zhanglu.net 有什么」「npx zhanglu-net」「张路在做什么项目」「碎碎念发了啥」。
source: local
category: "meta"
featured: true
handwritten: false
synced_at: "2026-06-09"
---

本 skill 来源于本机 `~/.claude/skills/zhanglu/SKILL.md`，由 `pnpm run sync:skills` 自动同步。

## 描述

在 zhanglu.net 上查张路本机的 Claude Skill 索引、项目、公众号文章 —— 不抓站，
走静态 JSON API（/api/*.json），CDN cache 友好，agent 端零 SDK 零 token。

适用场景：
- 用户问"张路本机有哪些 skill"/"zhanglu 上的 mba skill 怎么用"/"看下张路在做啥项目"
- 用户想引用 zhanglu.net 上的内容（公众号文章入口、项目介绍、skill description）
- agent（Claude Code / Codex / Hermes / OpenClaw）需要查 zhanglu 的结构化数据

动作（优先级由高到低）：
1) 直接 curl 站点 `/api/*.json` —— 端点见 https://zhanglu.net/llms.txt（最稳，永远可用）
2) 用 CLI `npx zhanglu-net <cmd>` —— 包名 zhanglu-net，零依赖
   （npm 包名 zhanglu 被占用，所以用 zhanglu-net 匹配域名）

常用调用：
- `npx zhanglu-net list skills [--featured] [--source local|plugin|custom]`
- `npx zhanglu-net get skill <slug> [--md]` —— 拿单 skill 的 description + body
- `npx zhanglu-net list projects [--featured] [--status live|wip|...]`
- `npx zhanglu-net get project <slug>`
- `npx zhanglu-net list articles [--source wechat|...] [--since YYYY-MM-DD]`
- `npx zhanglu-net search "<关键词>" [--type skill|project|article] [--json]`
- `npx zhanglu-net about` / `npx zhanglu-net social` / `npx zhanglu-net endpoints`

端点（直 curl，agent 也能用）：
- GET /api/index.json   —— manifest，含 counts + 所有端点列表
- GET /api/skills.json  —— 全 skill 索引（含 description / source / featured / handwritten）
- GET /api/skills/{slug}.json  —— 单 skill 全量（含 body_md）
- GET /api/projects.json / /api/projects/{slug}.json
- GET /api/articles.json
- GET /api/about.json / /api/social.json
- GET /api/search.json  —— 扁平语料 [{type, slug, title, text, url}]，本地 substring 搜

默认输出人类可读；agent 想要纯 JSON 加 `--json`。

不要用：
- 通用网页抓取（用 WebFetch）
- 公众号文章正文（zhanglu.net 上只存入口，正文在 mp.weixin.qq.com，反爬，要正文用 WebFetch 也抓不到）
- 张路本机 ~/.claude/skills/ 的真实文件路径（这个 skill 只看 zhanglu.net 发布出来的视图）

显式触发：「查张路的 skill」「zhanglu 上的 X」「看一下 zhanglu.net 有什么」「npx zhanglu-net」「张路在做什么项目」「碎碎念发了啥」。
