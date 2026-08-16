---
title: Feishu Move
tagline: Safely migrate personal Feishu content to a new account
url: https://openasf.space
tech: [Node.js, Python, SQLite, "@larksuite/cli"]
year: 2026
featured: true
status: beta
order: 14
persona: CTO
---

## What it is

[Feishu Move](https://openasf.space) is a **local-first personal Feishu account migration tool**. It copies and rebuilds personal content you have permission to migrate from Company A's Feishu account to Company B's account. Every step runs locally, and every discrepancy is explainable.

## Why build it

When you change companies, all your personal Feishu docs, wikis, sheets, files, and chat history stay locked in the old tenant. Manual export and import is slow and error-prone. Feishu Move applies four iron principles — **source read-only, local execution, no conflict overwrite, fully auditable** — turning migration into a trusted, auditable automated workflow.

## Core principles

- **Source read-only** — triple-locked at the strategy, command, and test layers; never writes to side A
- **Local execution** — listens only on `127.0.0.1`; credentials never uploaded or logged
- **No conflict overwrite** — conflicts escalated to human judgment; no data auto-overwritten
- **Fully auditable** — every step has state, checkpoints, and traceable results

## What it migrates

| Category | Capability |
|---|---|
| Files | Cross-tenant copy and rebuild, byte-level SHA-256 consistency |
| Docs | Native round-trip for body text; images via media re-upload pipeline |
| Wiki | Preserves nodes and obj_type; body migrated via docx path |
| Sheets | Value matrix cell-by-cell consistency; formulas fall back to values |
| Bitable | Migrates records and single-select options |
| Collaborators | Verified collaborator writes; unmatched personnel handled per receiver strategy |
| Chats | Generates self-contained HTML + JSON archive packages |

## How you can use it

Install via WorkBuddy SkillHub or `npm install -g feishu-move-cli`, connect A/B Feishu CLI profiles, then scan → plan → execute → verify → resolve conflicts, and finally download the verification report. Designed for anyone leaving a company who needs to take their personal Feishu assets with them.
