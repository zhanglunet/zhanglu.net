---
name: "zhanglu"
description: |
  Look up Zhang Lu's local Claude Skill index, projects, and WeChat Official Account articles on zhanglu.net — no scraping;
  go through the static JSON API (/api/*.json), CDN-cache friendly, zero SDK and zero tokens on the agent side.

  When to use:
  - user asks "what skills does Zhang Lu have locally" / "how do I use the mba skill on zhanglu" / "let me see what projects Zhang Lu is working on"
  - user wants to cite content on zhanglu.net (WeChat Official Account article entries, project intros, skill descriptions)
  - an agent (Claude Code / Codex / Hermes / OpenClaw) needs zhanglu's structured data

  Actions (highest priority first):
  1) curl the site's `/api/*.json` directly — endpoints listed at https://zhanglu.net/llms.txt (most stable, always available)
  2) use the CLI `npx zhanglu-net <cmd>` — package name zhanglu-net, zero dependencies
     (the npm name zhanglu is taken, so zhanglu-net is used to match the domain)

  Common calls:
  - `npx zhanglu-net list skills [--featured] [--source local|plugin|custom]`
  - `npx zhanglu-net get skill <slug> [--md]` — get a single skill's description + body
  - `npx zhanglu-net list projects [--featured] [--status live|wip|...]`
  - `npx zhanglu-net get project <slug>`
  - `npx zhanglu-net list articles [--source wechat|...] [--since YYYY-MM-DD]`
  - `npx zhanglu-net search "<keyword>" [--type skill|project|article] [--json]`
  - `npx zhanglu-net about` / `npx zhanglu-net social` / `npx zhanglu-net endpoints`

  Endpoints (curl directly, usable by agents too):
  - GET /api/index.json   — manifest, includes counts + list of all endpoints
  - GET /api/skills.json  — full skill index (includes description / source / featured / handwritten)
  - GET /api/skills/{slug}.json  — full single skill (includes body_md)
  - GET /api/projects.json / /api/projects/{slug}.json
  - GET /api/articles.json
  - GET /api/about.json / /api/social.json
  - GET /api/search.json  — flat corpus [{type, slug, title, text, url}], substring search locally

  Default output is human-readable; agents wanting pure JSON add `--json`.

  Do not use for:
  - general web scraping (use WebFetch)
  - WeChat Official Account article bodies (zhanglu.net only stores the entry; the body lives on mp.weixin.qq.com, which is anti-scraping — WebFetch can't fetch the body either)
  - the real file paths under Zhang Lu's local ~/.claude/skills/ (this skill only sees the view published on zhanglu.net)

  Explicit triggers: "look up Zhang Lu's skills," "X on zhanglu," "let me see what's on zhanglu.net," "npx zhanglu-net," "what projects is Zhang Lu working on," "what did Suisuinian post."
source: local
category: "meta"
featured: true
handwritten: false
synced_at: "2026-06-09"
---

This skill originates from the local `~/.claude/skills/zhanglu/SKILL.md`, auto-synced by `pnpm run sync:skills`.

## Description

Look up Zhang Lu's local Claude Skill index, projects, and WeChat Official Account articles on zhanglu.net — no scraping;
go through the static JSON API (/api/*.json), CDN-cache friendly, zero SDK and zero tokens on the agent side.

When to use:
- user asks "what skills does Zhang Lu have locally" / "how do I use the mba skill on zhanglu" / "let me see what projects Zhang Lu is working on"
- user wants to cite content on zhanglu.net (WeChat Official Account article entries, project intros, skill descriptions)
- an agent (Claude Code / Codex / Hermes / OpenClaw) needs zhanglu's structured data

Actions (highest priority first):
1) curl the site's `/api/*.json` directly — endpoints listed at https://zhanglu.net/llms.txt (most stable, always available)
2) use the CLI `npx zhanglu-net <cmd>` — package name zhanglu-net, zero dependencies
   (the npm name zhanglu is taken, so zhanglu-net is used to match the domain)

Common calls:
- `npx zhanglu-net list skills [--featured] [--source local|plugin|custom]`
- `npx zhanglu-net get skill <slug> [--md]` — get a single skill's description + body
- `npx zhanglu-net list projects [--featured] [--status live|wip|...]`
- `npx zhanglu-net get project <slug>`
- `npx zhanglu-net list articles [--source wechat|...] [--since YYYY-MM-DD]`
- `npx zhanglu-net search "<keyword>" [--type skill|project|article] [--json]`
- `npx zhanglu-net about` / `npx zhanglu-net social` / `npx zhanglu-net endpoints`

Endpoints (curl directly, usable by agents too):
- GET /api/index.json   — manifest, includes counts + list of all endpoints
- GET /api/skills.json  — full skill index (includes description / source / featured / handwritten)
- GET /api/skills/{slug}.json  — full single skill (includes body_md)
- GET /api/projects.json / /api/projects/{slug}.json
- GET /api/articles.json
- GET /api/about.json / /api/social.json
- GET /api/search.json  — flat corpus [{type, slug, title, text, url}], substring search locally

Default output is human-readable; agents wanting pure JSON add `--json`.

Do not use for:
- general web scraping (use WebFetch)
- WeChat Official Account article bodies (zhanglu.net only stores the entry; the body lives on mp.weixin.qq.com, which is anti-scraping — WebFetch can't fetch the body either)
- the real file paths under Zhang Lu's local ~/.claude/skills/ (this skill only sees the view published on zhanglu.net)

Explicit triggers: "look up Zhang Lu's skills," "X on zhanglu," "let me see what's on zhanglu.net," "npx zhanglu-net," "what projects is Zhang Lu working on," "what did Suisuinian post."
