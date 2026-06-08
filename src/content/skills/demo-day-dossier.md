---
name: "demo-day-dossier"
description: |
  End-to-end roadshow / demo-day dossier pipeline. Given a folder of project-card screenshots, a展区 wall photo, and/or an official article URL, produces:
  (1) a structured JSON dataset of all projects, (2) a panoramic interactive HTML landing page, (3) a sortable/filterable DD (due-diligence) table page powered by 7 parallel research agents, (4) a Word deep-report, (5) a CSV table for Excel/Numbers, and (6) one-click deploy to Cloudflare Pages.
  
  Use when the user has accelerator / VC fund / demo-day / pitch-day artifacts (multiple project cards, demo day photos, an official announcement article) and wants a one-shot research + DD + publishable dossier.
  
  显式触发：「把路演项目做成全景网页」「奇绩/YC/红杉/经纬路演 56 个项目梳理」「demo day projects 全部 DD 一遍」「做一个项目尽职调查表上线 Cloudflare」「analyze all roadshow projects and publish」。
  
  Also use when user has a directory of photos + WeChat/Substack article + maybe project-card mini-program screenshots and asks for "a panoramic page + Word report + DD table + deploy".
  
  NOT for: single-project research (use /research), single-company DD (use a focused prompt + WebSearch directly), live polling of investor meetings (no such tooling here).
source: local
featured: false
handwritten: false
synced_at: "2026-06-08"
---

本 skill 来源于本机 `~/.claude/skills/demo-day-dossier/SKILL.md`，由 `pnpm run sync:skills` 自动同步。

## 描述

End-to-end roadshow / demo-day dossier pipeline. Given a folder of project-card screenshots, a展区 wall photo, and/or an official article URL, produces:
(1) a structured JSON dataset of all projects, (2) a panoramic interactive HTML landing page, (3) a sortable/filterable DD (due-diligence) table page powered by 7 parallel research agents, (4) a Word deep-report, (5) a CSV table for Excel/Numbers, and (6) one-click deploy to Cloudflare Pages.

Use when the user has accelerator / VC fund / demo-day / pitch-day artifacts (multiple project cards, demo day photos, an official announcement article) and wants a one-shot research + DD + publishable dossier.

显式触发：「把路演项目做成全景网页」「奇绩/YC/红杉/经纬路演 56 个项目梳理」「demo day projects 全部 DD 一遍」「做一个项目尽职调查表上线 Cloudflare」「analyze all roadshow projects and publish」。

Also use when user has a directory of photos + WeChat/Substack article + maybe project-card mini-program screenshots and asks for "a panoramic page + Word report + DD table + deploy".

NOT for: single-project research (use /research), single-company DD (use a focused prompt + WebSearch directly), live polling of investor meetings (no such tooling here).
