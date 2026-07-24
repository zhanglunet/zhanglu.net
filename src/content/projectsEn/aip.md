---
title: Second Brain
tagline: A compounding personal Wiki knowledge base continuously written and maintained by an LLM—knowledge is compiled once, then kept fresh forever (a Wiki is not RAG)
url: https://aip.cab
cover: /covers/aip.webp
tech: [Claude Code, Markdown, Wiki, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 4
---

## What it is

[aip.cab](https://aip.cab) is a **compounding personal Wiki knowledge base** continuously written and maintained by an LLM. The core claim is that **a Wiki is not RAG**: when a new source comes in, the LLM doesn't index it—it **reads it, distills it, and integrates it into the existing Wiki**, updating entity pages, revising summaries, and flagging contradictions. The knowledge base thus becomes an asset that keeps compounding: knowledge is compiled once, cross-references are built, contradictions are flagged, and it stays fresh from there on.

An analogy: **Obsidian is the IDE, the LLM is the programmer, the Wiki is the codebase.** The theoretical foundation is Karpathy's "LLM Wiki" × *Building a Second Brain*. Everything is human-readable Markdown, and the architecture is radically simple—"just markdown, full-text search, and grep."

## Why build it

Knowledge workers face four structural pain points:

1. **Knowledge doesn't compound** — RAG retrieves from scratch on every question; what you've read never settles into an asset.
2. **Input is disconnected from output** — flomo / clippings / local PDFs are each their own island, and you can't pull them up when it actually comes time to write or decide.
3. **Organizing is a burden** — humans do the categorizing, tagging, and linking, and maintenance cost rises with scale.
4. **It rots at scale** — the bigger the base, the more contradictions, duplicates, and orphaned pages appear, yet there's no mechanism to find and fix them.

The answer is to replace "ad hoc retrieval" with "continuous compilation": every conclusion is traceable to its source, and a periodic lint proactively finds and fixes contradictions and drift to fight rot. A versionable Schema (`CLAUDE.md`) serves as the "constitution," clearly delineating the responsibilities of the compilation engine, the LLM, and the human—this is the key to keeping the system from drifting or overstepping.

## Six capabilities + two supports

- **C1 Ingest** — clippings auto-land and compile, important articles are ingested through deep dialogue, flomo processes only the delta
- **C2 Compile** — sources are compiled into structured, interlinked Wiki pages; watch monitors, incremental and idempotent, indexes update automatically
- **C3 Query** — read the index first, then dive into relevant pages, synthesize an answer with source citations, and write valuable output back to compound
- **C4 Health check** — lint finds contradictions / orphaned pages / missing cross-references, auto-fixing the safe ones
- **C5 Material** — a dual-track framework: extraction of six kinds of writing material + five-dimension decision retrieval
- **C6 Writing** — extract from the material library before writing → dig deeper in real time while writing → write back afterward, a complete loop
- **S1 Governance** — versionable responsibility-boundary config that prevents the LLM from overstepping and the structure from drifting
- **S2 Automation** — directory watching, incremental detection, post-compilation archival, fixed weekly / monthly cadence

## How you can use it

Follow the install guide to stand up the skeleton in 30 minutes → clippings / flomo deltas auto-land and compile → read the index first and then dive in when querying, writing output back to compound → weekly lint to stay fresh. It suits people who build up knowledge over the long term and also need to pull that knowledge out to write or make decisions.
