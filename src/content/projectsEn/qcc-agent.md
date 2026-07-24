---
title: QCC Agent
tagline: Drop Qichacha into any AI agent
url: https://qcc-agent.pages.dev
repo: https://github.com/zhanglunet/qcc
cover: /covers/qcc-agent.webp
tech: [MCP, Claude Skill, Python, TypeScript, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 6
loc: 1874
---

## What it is

An open-source Qichacha integration layer built for AI agents. It wraps Qichacha's 146 query APIs into MCP (Model Context Protocol) Streamable HTTP, so the agent side calls them directly without having to handle signing, pagination, rate limiting, and field semantics itself.

- **Protocol layer**: 6 MCP servers, 146 atomic tools
- **Clients**: `qcc-py` (Python) + `qcc-ts` (TypeScript), with matching APIs on both sides
- **Business layer**: 8 skills organized by "due-diligence action" (KYB / supplier onboarding / post-investment monitoring / relationship graph / risk scan, etc.), not 146 tools laid out in a row
- **Runtimes**: Claude Code, OpenClaw, Hermes, plain CLI—the same `skills/` directory reused across four forms

## Why build it

Qichacha's API has two layers of friction:

1. **Too many scattered endpoints**: 146 of them, a full due-diligence run chains 7–10, each time starting from the field table, and the agent's context window fills up with signing boilerplate.
2. **Missing business semantics**: the API returns a "business-registration change record," but what you actually want to ask is "has this company's control been stable over the past 12 months." Nobody built that mapping layer in between.

Splitting protocol, client, and business flow into three layers means the agent only needs to call a Skill, the Skill calls a Server, and the Server calls the API. Any layer can be swapped on its own—swap the agent runtime without touching the Skill, swap the API provider without touching the business logic.

## How you can use it

**Use it directly in Claude Code**:

```bash
pip install qcc-py
# configure the MCP server, then:
/kyb <company>          # one-click KYB report
/supplier-check <list>  # batch supplier onboarding
/post-investment <portfolio> # monthly post-investment monitoring
```

**Integrate it yourself**: use `qcc-py` or `qcc-ts` as an ordinary SDK, without going through MCP.

Best for: teams building B2B due-diligence / risk-control / supply-chain SaaS, investment firms wanting to automate post-investment monitoring, and internal corporate audit wanting to turn "looking things up on Qichacha" from manual work into an agent's job.
