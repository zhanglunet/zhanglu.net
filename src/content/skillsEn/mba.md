---
name: "mba"
category: "ai-agents"
description: |
  [EN] Zero-dep entry point: install, then run `/mba <brand> --quick --no-judges` for a
  single-pass open-web influence read — no Mac host, no paid cloud browser, no pre-installed
  perspective skills required. Validate the pipeline first, then scale up.

  Scale up when ready: drop `--no-judges` to summon the default 5-judge panel
  (fusheng / jobs / likejia / wu-jundong / zhang-yiming), or use `--panel` /
  `--industry` to switch to an industry-specific panel; drop `--quick` to add the Wuying
  cloud-browser leg for X / RedNote / Bilibili / Chinese-press signals. Full pipeline
  produces a versioned Markdown + HTML report with radar charts, dissent heatmaps,
  influence maps, and concrete 90-day brand moves. Ideal for founders, brand/growth teams,
  investors, competitive research, and pre-launch reviews of AI products.

  IF user asks "how is brand X's influence built / rate this brand with 5 famous figures /
  brand review for X / assess brand influence with OpenClaw as the example / have 5 judges
  score this project / competitive brand audit / run MBA"
  THEN invoke this skill.

  Router behavior is built in:
  - If `reports/<brand-slug>/report.md` already exists → EVOLUTION mode (delta research +
    re-judge changed dimensions, version the report — do not start over).
  - Otherwise → FRESH mode (full 5-phase pipeline from scratch).

  Trigger patterns:
  - `/mba <brand>` — explicit invocation (canonical)
  - `/mba OpenClaw` — the demo case the skill is built around
  - `/mba <brand> --quick` — skip Wuying cloud-browser leg, web-only
  - `/mba <brand> --refresh` — force EVOLUTION mode (or rebuild from scratch if combined with --fresh)
  - `/mba <brand> --no-judges` — synthesis only, skip the 5-judge panel
  - `/mba list` — list previously-audited brands and their version counts

  NOT WHEN: user wants a single perspective (`/fusheng-perspective ...` directly), generic
  technology research (`/research`), or a one-off web lookup. MBA is the heavyweight multi-agent
  panel audit — do not invoke it for a 2-line answer.
source: local
featured: false
handwritten: false
synced_at: "2026-06-09"
---

This skill originates from the local `~/.claude/skills/mba/SKILL.md`, synced automatically by `pnpm run sync:skills`.

## Description

Zero-dep entry point: install, then run `/mba <brand> --quick --no-judges` for a single-pass
open-web influence read — using only WebSearch + WebFetch, with no Mac host, no Wuying cloud
browser, and no need to pre-install the 5 perspective skills. Validate the pipeline first,
then scale up.

Scale up once you're satisfied: drop `--no-judges` to recall the default 5-judge panel
(Fu Sheng / Steve Jobs / Ethan Li / Wu Jundong / Zhang Yiming), or use `--panel` / `--industry`
to switch to an industry panel; drop `--quick` to add the Wuying leg that captures real signals
from X / RedNote / Bilibili / Chinese media. The full pipeline outputs a versioned Markdown +
HTML report with radar charts, dissent heatmaps, influence maps, and concrete 90-day brand
moves. Ideal for founders, brand/growth teams, investors, competitive research, and pre-launch
reviews of AI products.

[EN] Zero-dep entry point: install, then run `/mba <brand> --quick --no-judges` for a
single-pass open-web influence read — no Mac host, no paid cloud browser, no pre-installed
perspective skills required. Validate the pipeline first, then scale up.

Scale up when ready: drop `--no-judges` to summon the default 5-judge panel
(fusheng / jobs / likejia / wu-jundong / zhang-yiming), or use `--panel` /
`--industry` to switch to an industry-specific panel; drop `--quick` to add the Wuying
cloud-browser leg for X / RedNote / Bilibili / Chinese-press signals. Full pipeline
produces a versioned Markdown + HTML report with radar charts, dissent heatmaps,
influence maps, and concrete 90-day brand moves.

IF user asks "how is brand X's influence built / rate this brand with 5 famous figures /
brand review for X / assess brand influence with OpenClaw as the example / have 5 judges
score this project / competitive brand audit / run MBA"
THEN invoke this skill.

Router behavior is built in:
- If `reports/<brand-slug>/report.md` already exists → EVOLUTION mode (delta research +
  re-judge changed dimensions, version the report — do not start over).
- Otherwise → FRESH mode (full 5-phase pipeline from scratch).

Trigger patterns:
- `/mba <brand>` — explicit invocation (canonical)
- `/mba OpenClaw` — the demo case the skill is built around
- `/mba <brand> --quick` — skip Wuying cloud-browser leg, web-only
- `/mba <brand> --refresh` — force EVOLUTION mode (or rebuild from scratch if combined with --fresh)
- `/mba <brand> --no-judges` — synthesis only, skip the 5-judge panel
- `/mba list` — list previously-audited brands and their version counts

NOT WHEN: user wants a single perspective (`/fusheng-perspective ...` directly), generic
technology research (`/research`), or a one-off web lookup. MBA is the heavyweight multi-agent
panel audit — do not invoke it for a 2-line answer.
