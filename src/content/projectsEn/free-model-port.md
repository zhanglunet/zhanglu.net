---
title: FreeModel Port
tagline: A discovery, live-verification, and local access layer for free LLMs worldwide, built to connect Codex and other AI CLIs safely
url: https://oaf.asia
repo: https://github.com/zhanglunet/open-free-router
cover: /covers/free-model-port.webp
tech: [Python, FastAPI, Model Routing, Local-first, AI CLI, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 4
persona: AI developers
---

## What it is

FreeModel Port is an open-source, local-first routing and discovery system for free LLMs. It turns scattered free-model resources from providers such as OpenRouter, NVIDIA NIM, Google AI Studio, and Groq into a verifiable map: which models are registered, which are only candidates, which have passed live requests, and which are currently unavailable because of credentials, quota, or upstream status.

It is not another model platform. It is a local control plane. Codex, Claude Code, OpenCode, Kimi CLI, OpenClaw, WorkBuddy, Hermes, Pi / OMP, and similar clients only talk to one local endpoint; model routing, protocol adaptation, tool calls, streaming responses, and client configuration sync are handled by the port.

## Why build it

The hard part of free models is not finding another list. Lists go stale, access paths are fragmented, and every provider has its own model IDs and API behavior. A model being labeled "free" does not mean your account can complete a real request right now; region rules, account eligibility, rate limits, and upstream policy changes all matter.

FreeModel Port separates the workflow into three layers: public catalogs only create candidates, live requests decide what can enter the runnable registry, and clients access everything through a local proxy. That lowers trial-and-error cost while keeping credentials and usage records on your own machine.

## How you can use it

- Visit `oaf.asia` to browse the free-model catalog, live status, global map, benchmarks, and tool comparison.
- Use the installer to create an isolated Python environment and Codex profile without overwriting normal OpenAI settings.
- Connect Codex, Claude Code, OpenCode, and other AI coding tools through one local proxy endpoint.
- Inspect success rate, latency, fallback, and token metrics locally; the public site publishes only redacted model metadata and verification state.

Best for AI coding-tool users, independent developers, students, and model evaluators who want low-cost access to more models without constantly reworking configuration.
