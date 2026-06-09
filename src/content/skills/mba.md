---
name: "mba"
description: |
  【中文】零依赖上手:装完直接 `/mba <brand> --quick --no-judges` 跑一份单视角品牌速读 ——
  只用 WebSearch + WebFetch,不需要 Mac host、不需要 Wuying 云浏览器、不需要预装 5 个
  perspective skill。先验证管线再加重。
  
  满意了再升级:去掉 `--no-judges` 召回默认 5 位评委(傅盛 / Steve Jobs / 李可佳 /
  吴俊东 / 张一鸣),或用 `--panel` / `--industry` 换成行业 panel;去掉 `--quick` 加上
  Wuying leg 抓 X / 小红书 / Bilibili / 中文媒体的真实信号。完整管线输出版本化 Markdown +
  HTML 报告,含雷达图、异议热力图、影响力构造图、90 天行动建议。适合创始人、品牌/增长团队、
  投资人、竞品研究、AI 产品发布前复盘。
  
  [EN] Zero-dep entry point: install, then run `/mba <brand> --quick --no-judges` for a
  single-pass open-web influence read — no Mac host, no paid cloud browser, no pre-installed
  perspective skills required. Validate the pipeline first, then scale up.
  
  Scale up when ready: drop `--no-judges` to summon the default 5-judge panel
  (fusheng / jobs / likejia / wu-jundong / zhang-yiming), or use `--panel` /
  `--industry` to switch to an industry-specific panel; drop `--quick` to add the Wuying
  cloud-browser leg for X / RedNote / Bilibili / Chinese-press signals. Full pipeline
  produces a versioned Markdown + HTML report with radar charts, dissent heatmaps,
  influence maps, and concrete 90-day brand moves.
  
  IF user asks "分析 X 品牌的影响力如何构建 / 用 5 个名人评一下这个品牌 / brand review for X /
  以 OpenClaw 为例评估品牌影响力 / 让 5 个评委给这个项目打分 / 竞品品牌审计 / 跑一下 MBA"
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
category: "ai-agents"
featured: false
handwritten: false
synced_at: "2026-06-09"
---

本 skill 来源于本机 `~/.claude/skills/mba/SKILL.md`，由 `pnpm run sync:skills` 自动同步。

## 描述

【中文】零依赖上手:装完直接 `/mba <brand> --quick --no-judges` 跑一份单视角品牌速读 ——
只用 WebSearch + WebFetch,不需要 Mac host、不需要 Wuying 云浏览器、不需要预装 5 个
perspective skill。先验证管线再加重。

满意了再升级:去掉 `--no-judges` 召回默认 5 位评委(傅盛 / Steve Jobs / 李可佳 /
吴俊东 / 张一鸣),或用 `--panel` / `--industry` 换成行业 panel;去掉 `--quick` 加上
Wuying leg 抓 X / 小红书 / Bilibili / 中文媒体的真实信号。完整管线输出版本化 Markdown +
HTML 报告,含雷达图、异议热力图、影响力构造图、90 天行动建议。适合创始人、品牌/增长团队、
投资人、竞品研究、AI 产品发布前复盘。

[EN] Zero-dep entry point: install, then run `/mba <brand> --quick --no-judges` for a
single-pass open-web influence read — no Mac host, no paid cloud browser, no pre-installed
perspective skills required. Validate the pipeline first, then scale up.

Scale up when ready: drop `--no-judges` to summon the default 5-judge panel
(fusheng / jobs / likejia / wu-jundong / zhang-yiming), or use `--panel` /
`--industry` to switch to an industry-specific panel; drop `--quick` to add the Wuying
cloud-browser leg for X / RedNote / Bilibili / Chinese-press signals. Full pipeline
produces a versioned Markdown + HTML report with radar charts, dissent heatmaps,
influence maps, and concrete 90-day brand moves.

IF user asks "分析 X 品牌的影响力如何构建 / 用 5 个名人评一下这个品牌 / brand review for X /
以 OpenClaw 为例评估品牌影响力 / 让 5 个评委给这个项目打分 / 竞品品牌审计 / 跑一下 MBA"
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
