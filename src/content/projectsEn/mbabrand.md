---
title: MBA Brand
tagline: Turn brand influence into a monitorable / scorable / reviewable intelligent asset—43-juror deliberation with sentiment-driven versioned re-audits
url: https://mbabrand.com
repo: https://github.com/zhanglunet/mba
cover: /covers/mbabrand.webp
tech: [Claude Skill, Multi-agent, MCP Server, TypeScript, Python, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 1
loc: 22311
persona: CMO
---

## What it is

A brand-judgment pipeline built on a Claude Skill. Give it a brand name and it runs a 7-dimension parallel investigation, a Lead juror synthesis, then has a panel of "persona jurors" (Fu Sheng / Steve Jobs / Zhang Yiming / Musk, and others) score independently across 5 lenses using their own mental models, finally producing a versioned Markdown + HTML report:

- A 5-dimension radar chart (originality / category naming / leverage quality / identity consistency / authentic signal)
- A juror-dissent heatmap—which conclusion drew the most disagreement
- An influence-construction diagram—how the brand asset was built up
- 30 / 90 / 365-day attribution checkpoints, so that on later review you can attribute back to a specific evidence chain
- 90-day actionable recommendations

It started as a single skill and is now a **continuously running brand-monitoring dashboard online** (mbabrand.com), already monitoring 24 brands, with NVIDIA at the top on 8.88.

## Recent progress

- **Upgraded from "monitoring" to a "relationship universe" (v0.5)**: brand + founder + industry + portfolio, all four layers connected. Each brand links to its founder, founders can be seated at a "founders' dinner" to war-game collaboration, and brands are categorized into 6 major industries and filterable on the homepage.
- **Seven global tech giants added at once**: NVIDIA / Apple / Google / Microsoft / Amazon / Huawei / DeepSeek, each with a full audit report; monitoring scale expanded from 15 to 24.
- **The full Brand Watch sentiment-monitoring chain landed**: event collection → trigger-rule evaluation → EVOLUTION automatic re-audit, where watch only suggests and never changes a score; paired with a sentiment cockpit dashboard + Feishu L1/L2/L3 tiered alerts.
- **A full-dimension knowledge starmap**: a pure-SVG constellation chart laying out the 184 real relationship edges across 5 lenses × 9 dimensions × brands × 10 panels × 43 jurors; each brand also has its own ego starmap.
- **Released a standalone MCP server** (`npx -y mba-mcp-server`): 16 tools (8 core audit + 6 evolution tracking + 2 sentiment), pluggable into any MCP agent such as Claude Desktop / Cursor; incremental reruns cut the cost of an evolution audit from ~$3 to ~$0.4 per run.

## Why build it

Judging brand influence has long relied on "a feeling." Two common failure modes:

1. **Single-perspective bias**: ask one thought leader, and their blind spot becomes yours.
2. **Conclusions can't be attributed**: you make a gut call that "this brand is pretty strong," the numbers crater half a year later, and you don't know which step was wrong.

Decomposing the judgment into multiple dimensions × 43 jurors with distinct mental models × 5 scoring lenses lets every conclusion trace back to evidence. Half a year later, whether a juror misjudged, the evidence was incomplete, or the world changed is plain to see. The core stance is **anti-fabrication**: cite only public first-hand sources, mark what can't be obtained as N/A instead of inventing it, and verbatim-check juror citations through a hard CI gate.

## How you can use it

**Quick read (3 minutes)**:

```bash
/mba <brand> --quick --no-judges
```

Uses only WebSearch + WebFetch—validate the pipeline before adding weight.

**Full deliberation (30 minutes)**:

```bash
/mba <brand>
```

Convenes the default 5 jurors, or use `--panel <name>` / `--industry <name>` to swap in an industry juror panel (automotive / education / consumer, etc.—10 panels in all).

**Consume it as a service**: mount `npx -y mba-mcp-server@latest` into any MCP agent, or read the site's `/api/*.json` directly.

Best for: founders deciding brand direction, brand / growth teams doing PMF reviews, investors doing due diligence and sentiment tracking, and "objection rehearsals" before an AI product launch.
