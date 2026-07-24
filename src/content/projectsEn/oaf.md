---
title: OAF
tagline: A satellite-internet decision agent + an AI investment-research workbench for the US / A-share / HK markets—numbers come from tools, narrative from the model, gaps left blank not fabricated
url: https://oaf.world
cover: /covers/oaf.webp
tech: [FastAPI, Multi-agent, MCP, Claude Opus, Claude Haiku, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 3
loc: 83831
persona: CFO
---

## What it is

OAF (oaf.world) is an AI investment-research system with two product lines from one source, and the logo theme "orbit is the trend" twists the two lines into a single figure:

- **Secondary-market research workbench**: covering the US, A-share, and HK markets, it hands real quotes and financials to deterministic tools and lets the model write only the narrative. Deep single-stock analysis (candlesticks / KPIs / DuPont financial decomposition / comparable companies / bull-bear moat debate), industry research, cross-market sector comparison, full-CSI300 multi-factor quant screening, two-stage DCF valuation, and conversational research—all in one place. The backend is production-live at `api.oaf.world`.
- **Satellite-internet industry decision agent**: it maps policy / orders / filings / news onto five main threads—core network, terminals, chips, operational support, and launch vehicles—and outputs dual-perspective decisions from the CEO's and the investor's view, with a falsification layer (hard-threshold triggers / bull and bear checklists / red-flag self-checks).

The core engineering iron law: **numbers come from tools (deterministic), narrative from the model, gaps left blank not fabricated**; a mandatory disclaimer sitewide—research-efficiency tool only, not investment advice.

## Recent progress

A dense cadence, iterating from v0.33 all the way to v0.42 within July:

- **Sector-pulse anomaly alerts (v0.42)**: a real-time synthesis of two deterministic signals—breaking major events (scanning titles only to avoid false positives) + today's median move of a sector's constituents—showing an anomaly banner the moment you land. The trigger was SpaceX's July 17 launch failure rippling across the whole sector while the dashboard had no alert layer.
- **Four deep dashboards for the satellite-internet cluster**: `/spacex` (with three-dimension inline cards linking mbabrand's brand / sentiment / founder), `/yuanxin` (Yuanxin · Qianfan, honestly left blank as not yet public), `/xingwang` (China SatNet · GuoWang), and `/constellation` (the nine leaders in the constellation race + a launch-and-networking timeline), plus keyword monitoring so that unlisted, tickerless entities can also raise alerts.
- **Conversational research wired to a real backend** (v0.39–0.41): the model only does intent routing + entity extraction and produces no numbers, dispatching a deterministic skill per instrument to fetch data and answer; it supports multi-turn coreference resolution and "follow-up suggestion chips."
- **All-market instrument fuzzy search `/search`**: local picks answer instantly → full A-share Chinese names → HK/US via Yahoo, so "off-list instruments are searchable too," with names / codes taken from data-source facts rather than model guesses.
- **Dashboard upgraded into an explorable cockpit** (v0.36): a global slice bar + cross-panel linkage + list drill-down + URL deep links + ⌘K search + watchlist + comparison mode, pure front-end with zero new backend.
- **On the satellite agent side** (v0.23, 828 tests): a bottom-up market_model + satellite-internet attribution, time-series backtesting (+4.65% 5-day excess after a strengthening call / −6.60% after a weakening call), valuation wired to 29 real financial reports, and a wiki knowledge-graph NER landing (393 entities / 392 concepts).

## Why build it

Investment research has two old problems: information is scattered, and numbers are easily fabricated by the model. OAF's answer is to separate the two—hand data fetching, valuation, and quant screening to deterministic tools and real data sources (baostock / tushare / yfinance / SEC EDGAR), hand narrative and bull-bear debate to the model, and in between flag disagreements via `data_quality_flag` cross-source checks and leave gaps blank. Credentials live only at the data-source / gateway layer; even an agent going through MCP can't get the key.

## How you can use it

- **Dashboards**: the `oaf.world` homepage real-time dashboard auto-refreshes every 6 hours; `/web/app` is the research workbench, switching between conversational research / industry research / cross-market sectors / knowledge graph / satellite-narrative stock pool.
- **Agent CLI / MCP**: read `api.oaf.world` endpoints like `/quote /financials /dcf /research /ask /search /sector-pulse` directly, or use the 4 MCP research tools (get_quote / get_financials / get_company_profile / run_dcf).
- **Skills**: the `fundamentals-research` skill pack; on the satellite agent side, a `satagent` CLI (init / ingest / fetch / report / decision).
- **Feishu**: daily / weekly research briefings pushed via webhook.

Best for: professional investors, buy-side / sell-side analysts, PMs, and satellite-internet industry decision-makers.
