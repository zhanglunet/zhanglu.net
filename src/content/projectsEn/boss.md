---
title: Boss
tagline: A strategic OS for the CEO—hand your important judgments to a multi-juror deliberation that is citable, scorable, and falsifiable, with 30/90/365-day attribution checks
url: https://bossagent.cc
cover: /covers/boss.webp
tech: [Claude Skill, Multi-agent, MCP, HTTP Service, Python, Feishu Bot]
year: 2026
featured: true
status: beta
order: 2
loc: 87943
persona: CEO
---

## What it is

Boss (bossagent.cc) is a **strategic OS** for leaders—a decision agent that engineers "an anchor's (a given leader's / decision-maker's) judgment methodology." You submit a strategic question, or attach a document, and the system uses **one anchor conviction + N dimensional jurors, each holding a distinct doctrine** to score independently and mandatorily argue the counter-position, producing in minutes a judgment report that is citable, scorable, and falsifiable.

- **Independent multi-juror deliberation**: one juror each for industry trends / strategic goals / customers / product / organization / operations, each holding their own methodology and scoring blind to the others
- **5-lens scoring**: reasoning / evidence / counter-argument / falsifiability / resilience, with every judgment required to carry a falsifiable metric
- **anchor_delta mechanism**: the gap between the jurors' weighted score and the anchor's conviction serves as a "mirror," and too large a deviation raises an alarm
- **30 / 90 / 365-day attribution checks**: when a judgment comes due, its prediction is automatically compared against the actual outcome, and hits / falsifications are written to the scoreboard
- **Versioned freezing**: every judgment brief generates an immutable snapshot (chmod 444) for after-the-fact verification by investment committees / auditors; falsified judgments are archived to a Failure Card

## Recent progress

- **v1.17 boss-as-a-Service launched**: the judgment engine went from a single-machine CLI to a service external programs and visitors can call directly, with MCP + HTTP **dual protocols over one core**, a closed loop from proposal to public trial.
- **Zero-config online demo bench**: visitors run the full multi-juror deliberation with no signup and no API key, just by posting a question on the homepage, backstopped by three cost guardrails (off by default + daily quota + single-concurrency).
- **Engine extracted into a library** (the `boss_core` pure-function core): error handling, document IO, prompt assembly, score aggregation, and knowledge-base queries all pushed down into a standalone package—CLI and service share the core but not the shell, with byte-level snapshots proving zero drift.
- **Public site rebuild**: navigation trimmed from 11 items to 7, with a new MCP integration guide, a Feishu bot landing page, and a case library (submitted questions and reports kept public for 7 days).
- **Engineering guardrails maxed out**: adversarial security audit of all scripts (60 findings closed), LLM multi-endpoint redundancy with automatic failover, dual-gate fail-close outbound redaction; test suite of 1,787 passing, around 56,000 lines of code.

## Why build it

Important decisions are often "a gut call → no way to review it afterward → judgment never accumulates." Boss breaks a single judgment into a structured deliberation: instead of asking one person, it has a set of jurors with distinct positions score independently and mandatorily argue the counter-position; instead of stopping at a conclusion, it marks each conclusion with a falsifiable point and an attribution-check date, then comes back at term to verify whether the original judgment held. Judgment thus turns from "a feeling" into an asset that accumulates.

Data is confidential by default: real cases, reports, and internal knowledge bases never leave the intranet, and the public layer holds only methodology.

## How you can use it

- **Online demo bench**: post a question straight from the homepage and run a multi-juror deliberation with zero config.
- **MCP / HTTP service**: run unlimited with your own model (under the service tier, Boss doesn't call the LLM—the caller's model runs the deliberation).
- **Claude Code Skill**: install the `/boss` skill locally + CLI deployment.
- **Feishu bot**: @-mention the bot in a direct message or group to trigger it, ingesting PDF / Word / PPT / MD documents directly.

Best for: founders / executives who need to accumulate personal judgment (serving as the "anchor"), project leads who chair decisions, and investment committees and external auditors doing after-the-fact audits.
