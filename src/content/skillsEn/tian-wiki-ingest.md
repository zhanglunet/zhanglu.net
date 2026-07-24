---
name: "tian-wiki-ingest"
description: |
  Inside the laotian/ project, incrementally extract the **newly added Feishu backups**
  under `backups/feishu/runs/` into the `wiki/` knowledge base — not a rebuild from scratch,
  just filling the delta.

  This is the *incremental version* of the /notes-wiki pipeline:
  - Auto-diff "the .md files in new runs" vs "the slugs already in wiki/data/extracted.json"
  - By default only take those related to the anchor (tian-zong); unrelated ones stay as
    untouched background
  - Greedy bin-pack into ≤290KB / batch (well under the 350KB prompt-too-long red line)
  - Dispatch sub-agents 4-way in parallel → fix_json → merge → render → serve for spot check

  Explicit triggers: "check the newly added files in backups and extract them into the wiki
  in /notes-wiki style", "run /tian-wiki-ingest", "incrementally ingest Tian's wiki", "merge
  the 06-XX run into the wiki".

  When to use:
  - Feishu crawls new runs periodically, and the Tian-related parts need merging into the
    existing wiki
  - The wiki already exists, the schema/glossary is stable, and only the delta needs filling

  When not to use this skill:
  - The wiki doesn't exist yet → use /notes-wiki to build from scratch
  - You want a different anchor (not Tian) → use /notes-wiki, don't reuse this skill's
    hardcoded defaults
  - You want to add corpus from a non-laotian project → this skill's paths are hardcoded to
    laotian/
source: local
category: "knowledge-base"
featured: false
handwritten: false
synced_at: "2026-06-09"
---

This skill comes from the local `~/.claude/skills/tian-wiki-ingest/SKILL.md`, auto-synced by `pnpm run sync:skills`.

## Description

Inside the laotian/ project, incrementally extract the **newly added Feishu backups**
under `backups/feishu/runs/` into the `wiki/` knowledge base — not a rebuild from scratch,
just filling the delta.

This is the *incremental version* of the /notes-wiki pipeline:
- Auto-diff "the .md files in new runs" vs "the slugs already in wiki/data/extracted.json"
- By default only take those related to the anchor (tian-zong); unrelated ones stay as untouched background
- Greedy bin-pack into ≤290KB / batch (well under the 350KB prompt-too-long red line)
- Dispatch sub-agents 4-way in parallel → fix_json → merge → render → serve for spot check

Explicit triggers: "check the newly added files in backups and extract them into the wiki in /notes-wiki style"
"run /tian-wiki-ingest", "incrementally ingest Tian's wiki", "merge the 06-XX run into the wiki".

When to use:
- Feishu crawls new runs periodically, and the Tian-related parts need merging into the existing wiki
- The wiki already exists, the schema/glossary is stable, and only the delta needs filling

When not to use this skill:
- The wiki doesn't exist yet → use /notes-wiki to build from scratch
- You want a different anchor (not Tian) → use /notes-wiki, don't reuse this skill's hardcoded defaults
- You want to add corpus from a non-laotian project → this skill's paths are hardcoded to laotian/
