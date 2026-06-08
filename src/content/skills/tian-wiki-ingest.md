---
name: "tian-wiki-ingest"
description: |
  在 laotian/ 项目里，把 `backups/feishu/runs/` 下**新增的飞书备份**
  增量抽进 `wiki/` 知识库 — 不是从头重建，是补差。
  
  做的是 /notes-wiki 那条流水线的 *增量版*：
  - 自动 diff 「新 run 里的 .md」vs 「wiki/data/extracted.json 已有 slug」
  - 默认只收 anchor (tian-zong) 相关的；非相关的留作 background 不动
  - greedy bin-pack 切 ≤290KB / batch（远低于 350KB prompt-too-long 红线）
  - 4 路并行派 sub-agent → fix_json → merge → render → 起服抽检
  
  显式触发：「检查 backups 新增文件用 /notes-wiki 风格抽进 wiki」
  「跑一遍 /tian-wiki-ingest」「增量入库田总 wiki」「把 06-XX run 合进 wiki」。
  
  适用场景：
  - 飞书定期 crawl 出新 run，需要把田总相关的部分合并到现有 wiki
  - wiki 已经存在、schema/glossary 已稳定、只需补差量
  
  不要用本 skill 的情况：
  - wiki 还不存在 → 用 /notes-wiki 从头建
  - 想换 anchor（不是田总）→ 用 /notes-wiki，不要复用本 skill 的硬编码默认
  - 想加非 laotian 项目的语料 → 本 skill 路径硬编码在 laotian/
source: local
category: "knowledge-base"
featured: false
handwritten: false
synced_at: "2026-06-08"
---

本 skill 来源于本机 `~/.claude/skills/tian-wiki-ingest/SKILL.md`，由 `pnpm run sync:skills` 自动同步。

## 描述

在 laotian/ 项目里，把 `backups/feishu/runs/` 下**新增的飞书备份**
增量抽进 `wiki/` 知识库 — 不是从头重建，是补差。

做的是 /notes-wiki 那条流水线的 *增量版*：
- 自动 diff 「新 run 里的 .md」vs 「wiki/data/extracted.json 已有 slug」
- 默认只收 anchor (tian-zong) 相关的；非相关的留作 background 不动
- greedy bin-pack 切 ≤290KB / batch（远低于 350KB prompt-too-long 红线）
- 4 路并行派 sub-agent → fix_json → merge → render → 起服抽检

显式触发：「检查 backups 新增文件用 /notes-wiki 风格抽进 wiki」
「跑一遍 /tian-wiki-ingest」「增量入库田总 wiki」「把 06-XX run 合进 wiki」。

适用场景：
- 飞书定期 crawl 出新 run，需要把田总相关的部分合并到现有 wiki
- wiki 已经存在、schema/glossary 已稳定、只需补差量

不要用本 skill 的情况：
- wiki 还不存在 → 用 /notes-wiki 从头建
- 想换 anchor（不是田总）→ 用 /notes-wiki，不要复用本 skill 的硬编码默认
- 想加非 laotian 项目的语料 → 本 skill 路径硬编码在 laotian/
