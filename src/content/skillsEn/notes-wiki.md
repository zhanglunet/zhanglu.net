---
name: "notes-wiki"
description: |
  Turn a pile of markdown documents (meeting notes / articles / logs / study notes) into a
  locally browsable HTML knowledge base — people / concepts / entities / documents, four
  dimensions cross-linking to each other.

  Pipeline: N sub-agents extract in parallel via LLM (batched by time or lexical order) →
  a shared slug dictionary keeps the batches mergeable → Python merge & dedup → static HTML
  rendering (bookish CSS + client-side search + type filtering) → serve locally via
  http.server for acceptance.

  Explicit triggers: "use /notes-wiki to turn dir X into a wiki", "build a local knowledge
  base from this pile of markdown", "extract these meeting notes / articles / notes into
  cross-linked HTML", "entity extraction → wiki".

  When to use:
  - Company meeting notes accumulate over time and need lookup by person / concept / project
  - Personal flomo / journal / long-form writing piles up and needs a topical index
  - A literature / paper / document collection needs fast retrieval of high-frequency concepts
  - Any markdown corpus that wants a three-dimensional "people / concept / project" index view

  When not to use this skill:
  - Single-document summary (just use Read + write a summary)
  - Presenting already-structured data (that's frontend-design's job)
  - You need semantic retrieval / RAG (this skill only does keyword indexing, no embeddings)
  - You need continuous incremental updates (this skill does one-shot full regeneration)
source: local
category: "knowledge-base"
featured: false
handwritten: false
synced_at: "2026-06-09"
---

This skill comes from the local `~/.claude/skills/notes-wiki/SKILL.md`, auto-synced by `pnpm run sync:skills`.

## Description

Turn a pile of markdown documents (meeting notes / articles / logs / study notes) into a
locally browsable HTML knowledge base — people / concepts / entities / documents, four
dimensions cross-linking to each other.

Pipeline: N sub-agents extract in parallel via LLM (batched by time or lexical order) →
a shared slug dictionary keeps the batches mergeable → Python merge & dedup → static HTML
rendering (bookish CSS + client-side search + type filtering) → serve locally via
http.server for acceptance.

Explicit triggers: "use /notes-wiki to turn dir X into a wiki", "build a local knowledge
base from this pile of markdown", "extract these meeting notes / articles / notes into
cross-linked HTML", "entity extraction → wiki".

When to use:
- Company meeting notes accumulate over time and need lookup by person / concept / project
- Personal flomo / journal / long-form writing piles up and needs a topical index
- A literature / paper / document collection needs fast retrieval of high-frequency concepts
- Any markdown corpus that wants a three-dimensional "people / concept / project" index view

When not to use this skill:
- Single-document summary (just use Read + write a summary)
- Presenting already-structured data (that's frontend-design's job)
- You need semantic retrieval / RAG (this skill only does keyword indexing, no embeddings)
- You need continuous incremental updates (this skill does one-shot full regeneration)
