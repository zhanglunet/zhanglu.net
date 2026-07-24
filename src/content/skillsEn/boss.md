---
name: "boss"
description: |
  Zero-dependency onboarding: install it and run `/boss <topic>` for a verdict deliberated independently by 5 judges —
  Phase 0 routing → 5-dimension parallel research → Lead synthesis → 1 anchor (baseline conviction) + 4 dimension judges scoring independently →
  panel_summary with anchor_delta + 30/90/365 attribution checkpoints.

  Unlike the single-lens `*-perspective` skills, `/boss` is a **full pipeline orchestration**:
  - 1 anchor judge (anchor mental_models: trigger-threshold-action / step-skip detection / counter-party elimination)
  - 4 dim judges auto-selected per topic (panel auto-select: strategic/customer/organizational/product/brand/financial/cross_domain)
  - 5-lens scoring (reasoning / evidence / counter / falsifiability / real_world_resilience)
  - adversarial_view three fields enforced (CLAUDE.md §4.5)
  - Versioned freeze (chmod 444) + Wiki back-references

  Router behavior is built in:
  - If `reports/<brand-slug>/report.md` already exists → EVOLUTION mode (diff plan + partial re-run)
  - Otherwise → FRESH mode (full Phase 1-5)

  Trigger patterns:
  - `/boss <topic or brand-slug>` — standard invocation
  - `/boss <topic> --quick` — skip the raw_evidence WebSearch leg, local Wiki+raw only
  - `/boss <topic> --refresh` — force EVOLUTION (even if the brand already has a report)
  - `/boss <topic> --no-judges` — skip Phase 4 (synthesis only)
  - `/boss <topic> --panel <name>` — use the specified panel.yaml
  - `/boss list` — list judged topics + version counts
  - `/boss panels` — list panel configs + judge identities

  IF the user asks "evaluate the X business carve-out plan" / "judge the X brand isolation strategy" / "have the 5 judges rate this SKU" /
  "run boss" / "run the verdict pipeline" / "5-judge deliberation" THEN invoke this skill.

  NOT WHEN: simple fact lookups (use `mcp__sage-wiki__query`) / single-judge opinions (use `*-perspective`) /
  pure technical research (use `research`) / everyday chitchat. boss is a heavyweight multi-judge deliberation — don't use it to answer 2-line questions.
source: local
category: "ai-agents"
featured: false
handwritten: false
synced_at: "2026-06-09"
---

This skill comes from the local `~/.claude/skills/boss/SKILL.md` and is synced automatically by `pnpm run sync:skills`.

## Description

Zero-dependency onboarding: install it and run `/boss <topic>` for a verdict deliberated independently by 5 judges —
Phase 0 routing → 5-dimension parallel research → Lead synthesis → 1 anchor (baseline conviction) + 4 dimension judges scoring independently →
panel_summary with anchor_delta + 30/90/365 attribution checkpoints.

Unlike the single-lens `*-perspective` skills, `/boss` is a **full pipeline orchestration**:
- 1 anchor judge (anchor mental_models: trigger-threshold-action / step-skip detection / counter-party elimination)
- 4 dim judges auto-selected per topic (panel auto-select: strategic/customer/organizational/product/brand/financial/cross_domain)
- 5-lens scoring (reasoning / evidence / counter / falsifiability / real_world_resilience)
- adversarial_view three fields enforced (CLAUDE.md §4.5)
- Versioned freeze (chmod 444) + Wiki back-references

Router behavior is built in:
- If `reports/<brand-slug>/report.md` already exists → EVOLUTION mode (diff plan + partial re-run)
- Otherwise → FRESH mode (full Phase 1-5)

Trigger patterns:
- `/boss <topic or brand-slug>` — standard invocation
- `/boss <topic> --quick` — skip the raw_evidence WebSearch leg, local Wiki+raw only
- `/boss <topic> --refresh` — force EVOLUTION (even if the brand already has a report)
- `/boss <topic> --no-judges` — skip Phase 4 (synthesis only)
- `/boss <topic> --panel <name>` — use the specified panel.yaml
- `/boss list` — list judged topics + version counts
- `/boss panels` — list panel configs + judge identities

IF the user asks "evaluate the X business carve-out plan" / "judge the X brand isolation strategy" / "have the 5 judges rate this SKU" /
"run boss" / "run the verdict pipeline" / "5-judge deliberation" THEN invoke this skill.

NOT WHEN: simple fact lookups (use `mcp__sage-wiki__query`) / single-judge opinions (use `*-perspective`) /
pure technical research (use `research`) / everyday chitchat. boss is a heavyweight multi-judge deliberation — don't use it to answer 2-line questions.
