---
name: "boss"
description: |
  【中文】零依赖上手:装完直接 `/boss <议题>` 跑一份 5 评委独立合议判断 ——
  Phase 0 路由 → 5 维并行调研 → Lead 合成 → 1 锚点 (心证基线) + 4 维度评委独立打分 →
  panel_summary 含 anchor_delta + 30/90/365 attribution checkpoint.
  
  与单视角的 `*-perspective` skill 不同, `/boss` 是**完整流水线编排**:
  - 1 锚点评委 (锚点 mental_models: 触发-阈值-行动 / 跳步识别 / 反方排除)
  - 4 dim 评委按议题自动选 (panel auto-select: strategic/customer/organizational/product/brand/financial/cross_domain)
  - 5 镜头打分 (reasoning / evidence / counter / falsifiability / real_world_resilience)
  - adversarial_view 三字段强制 (CLAUDE.md §4.5)
  - 版本化冻结 (chmod 444) + Wiki 反向引用
  
  Router 行为内置:
  - 若 `reports/<brand-slug>/report.md` 已存在 → EVOLUTION 模式 (diff plan + 局部重跑)
  - 否则 → FRESH 模式 (完整 Phase 1-5)
  
  Trigger patterns:
  - `/boss <议题或 brand-slug>` — 标准调用
  - `/boss <议题> --quick` — 跳过 raw_evidence WebSearch leg, 仅本地 Wiki+raw
  - `/boss <议题> --refresh` — 强制 EVOLUTION (即使 brand 已有 report)
  - `/boss <议题> --no-judges` — Phase 4 跳过 (仅 synthesis 出)
  - `/boss <议题> --panel <name>` — 用指定 panel.yaml
  - `/boss list` — 列出已判断的议题 + version 计数
  - `/boss panels` — 列出 panel 配置 + 评委身份
  
  IF 用户问 "评估 X 业务剥离方案" / "判断 X 品牌隔离策略" / "让 5 评委评一下这个 SKU" /
  "跑一遍 boss" / "走一次判断流水线" / "5 评委合议" THEN 调用本 skill.
  
  NOT WHEN: 简单事实查询 (走 `mcp__sage-wiki__query`) / 单评委观点 (走 `*-perspective`) /
  纯技术研究 (走 `research`) / 日常闲聊. boss 是重型多评委合议, 不要拿来回答 2 行问题.
source: local
category: "ai-agents"
featured: false
handwritten: false
synced_at: "2026-06-08"
---

本 skill 来源于本机 `~/.claude/skills/boss/SKILL.md`，由 `pnpm run sync:skills` 自动同步。

## 描述

【中文】零依赖上手:装完直接 `/boss <议题>` 跑一份 5 评委独立合议判断 ——
Phase 0 路由 → 5 维并行调研 → Lead 合成 → 1 锚点 (心证基线) + 4 维度评委独立打分 →
panel_summary 含 anchor_delta + 30/90/365 attribution checkpoint.

与单视角的 `*-perspective` skill 不同, `/boss` 是**完整流水线编排**:
- 1 锚点评委 (锚点 mental_models: 触发-阈值-行动 / 跳步识别 / 反方排除)
- 4 dim 评委按议题自动选 (panel auto-select: strategic/customer/organizational/product/brand/financial/cross_domain)
- 5 镜头打分 (reasoning / evidence / counter / falsifiability / real_world_resilience)
- adversarial_view 三字段强制 (CLAUDE.md §4.5)
- 版本化冻结 (chmod 444) + Wiki 反向引用

Router 行为内置:
- 若 `reports/<brand-slug>/report.md` 已存在 → EVOLUTION 模式 (diff plan + 局部重跑)
- 否则 → FRESH 模式 (完整 Phase 1-5)

Trigger patterns:
- `/boss <议题或 brand-slug>` — 标准调用
- `/boss <议题> --quick` — 跳过 raw_evidence WebSearch leg, 仅本地 Wiki+raw
- `/boss <议题> --refresh` — 强制 EVOLUTION (即使 brand 已有 report)
- `/boss <议题> --no-judges` — Phase 4 跳过 (仅 synthesis 出)
- `/boss <议题> --panel <name>` — 用指定 panel.yaml
- `/boss list` — 列出已判断的议题 + version 计数
- `/boss panels` — 列出 panel 配置 + 评委身份

IF 用户问 "评估 X 业务剥离方案" / "判断 X 品牌隔离策略" / "让 5 评委评一下这个 SKU" /
"跑一遍 boss" / "走一次判断流水线" / "5 评委合议" THEN 调用本 skill.

NOT WHEN: 简单事实查询 (走 `mcp__sage-wiki__query`) / 单评委观点 (走 `*-perspective`) /
纯技术研究 (走 `research`) / 日常闲聊. boss 是重型多评委合议, 不要拿来回答 2 行问题.
