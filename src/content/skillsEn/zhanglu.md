---
name: "zhanglu"
description: |
  Look up Zhang Lu's projects, presentations, article entry points, public weeklies and local Claude Skill index
  on zhanglu.net — no scraping; go through the static JSON API (/api/*.json) generated at build time,
  zero SDK and zero tokens on the agent side. Bilingual: Chinese under /api/*, English under /en/api/*.

  When to use:
  - user asks "what skills does Zhang Lu have" / "how do I use the boss skill on zhanglu" / "what projects is Zhang Lu working on"
  - user wants to cite content on zhanglu.net (article entries, project intros, skill descriptions, weeklies)
  - an agent (Claude Code / Codex / Hermes / OpenClaw) needs zhanglu's structured data

  Actions (highest priority first):
  1) curl the site's `/api/*.json` directly — endpoints listed at https://zhanglu.net/llms.txt (most reliable, always available)
  2) use the CLI `npx zhanglu-net <cmd>` — package name zhanglu-net, zero dependencies
     (the npm name zhanglu was already taken, so the package matches the domain instead)

  Common calls:
  - `npx zhanglu-net list skills [--featured] [--source local|plugin|custom]`
  - `npx zhanglu-net get skill <slug> [--md]` — a single skill's description + body
  - `npx zhanglu-net list projects [--featured] [--status live|beta|wip|archived]`
  - `npx zhanglu-net get project <slug>`
  - `npx zhanglu-net list articles [--source wechat|blog|...] [--since YYYY-MM-DD]`
  - `npx zhanglu-net list presentations` / `list weekly` / `get weekly <slug>`
  - `npx zhanglu-net search "<keyword>" [--type skill|project|article|presentation|weekly]`
  - `npx zhanglu-net about` / `social` / `endpoints` / `version`
  - add `--lang en` for English data (or `ZHANGLU_LANG=en`); add `--base http://localhost:4321` for local dev

  Endpoints (plain curl works; prefix the path with /en for English):
  - GET /api/index.json   — manifest with counts, every endpoint, and cross-language links
  - GET /api/skills.json  — full skill index (description / source / featured / handwritten)
  - GET /api/skills/{slug}.json  — one skill in full (includes body_md and a ready-to-write skill_md)
  - GET /api/projects.json / /api/projects/{slug}.json
  - GET /api/articles.json / /api/presentations.json
  - GET /api/weekly.json / /api/weekly/{slug}.json
  - GET /api/about.json / /api/social.json
  - GET /api/search.json  — flat corpus [{type, slug, title, text, url}] for local substring search

  Output is human-readable by default; add `--json` when an agent wants raw JSON.

  Not for:
  - general web scraping (use WebFetch)
  - WeChat Official Account article bodies (zhanglu.net only stores entry links; the body lives on
    mp.weixin.qq.com, which blocks crawlers — WebFetch can't get it either)
  - real file paths under Zhang Lu's local ~/.claude/skills/ (this skill only sees what zhanglu.net publishes)

  Explicit triggers: "look up Zhang Lu's skills", "the X on zhanglu", "show me what's on zhanglu.net",
  "npx zhanglu-net", "what projects is Zhang Lu working on".
source: local
category: "meta"
featured: true
handwritten: true
synced_at: "2026-07-27"
---

## What it's for

Read zhanglu.net as a **structured data source** rather than scraping it as a web page. At build time the
site renders every markdown file into both an HTML page and a JSON endpoint, so an agent always gets clean
fields — no DOM parsing, and no breakage when the design changes.

## When to use it

- You need to cite anything on zhanglu.net (project / article / presentation / weekly / skill)
- You want to know which Claude Skills Zhang Lu runs locally, or how a given skill's description is written
- You need the English data (`--lang en`, or read `/en/api/*.json` directly)

## How to use it

Easiest path:

```bash
npx zhanglu-net list skills --featured
npx zhanglu-net get project boss --json
npx zhanglu-net --lang en search "brand judgment"
```

Nothing to install — just curl:

```bash
curl -s https://zhanglu.net/api/index.json      # manifest; follow it to the next hop
curl -s https://zhanglu.net/api/search.json     # whole-site corpus for local substring search
```

Install this skill on your own machine (the `skill_md` field is a complete SKILL.md with frontmatter already assembled):

```bash
mkdir -p ~/.claude/skills/zhanglu
curl -s https://zhanglu.net/api/skills/zhanglu.json | jq -r .skill_md > ~/.claude/skills/zhanglu/SKILL.md
```

## Not for

- Fetching WeChat article bodies — the site only holds entry links; the body lives on mp.weixin.qq.com, which blocks crawlers
- Using as a general-purpose web scraper — that's WebFetch's job
- Expecting it to mirror the live state of the local `~/.claude/skills/` — the site is a snapshot of the last `pnpm run sync:skills`
