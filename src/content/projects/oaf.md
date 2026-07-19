---
title: OAF
tagline: 卫星互联网决策 Agent + 美/A/港三市场 AI 投研工作台——数字来自工具、叙事由大模型、缺数留白不编造
url: https://oaf.world
cover: /covers/oaf.webp
tech: [FastAPI, Multi-Agent, MCP, Claude Opus, Claude Haiku, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 3
loc: 83831
persona: CFO
---

## 是什么

OAF（oaf.world）是一个同源双线的 AI 投研系统，logo 主题「轨道即趋势」把两条产品线拧成一个图形：

- **二级市场投研工作台**：覆盖美股 / A 股 / 港股三市场，把真实行情与财报交给确定性工具、只让大模型写叙事。个股深度（K 线 / KPI / 财务杜邦分解 / 可比公司 / 护城河多空辩论）、行业调研、跨市场板块对比、全 CSI300 多因子量化筛选、两阶段 DCF 估值、对话式调研，一站打通。后端已生产化上线 `api.oaf.world`。
- **卫星互联网产业决策 Agent**：把政策 / 订单 / 公告 / 新闻映射到核心网、终端、芯片、运营支撑、运载发射五条主线，输出 CEO 视角与投资视角的双视角决策，带证伪层（硬阈值 trigger / 看牛看熊清单 / red flag 自查）。

核心工程铁律：**数字来自工具（确定性）、叙事由大模型、缺数留白不编造**；全站强制免责，仅作研究效率工具、不构成投资建议。

## 最近进展

7 月内从 v0.33 一路迭到 v0.42，节奏很密：

- **行业异动预警 sector-pulse（v0.42）**：突发重大事件（只扫标题防误报）+ 板块成分今日中位涨跌两个确定性信号实时合成，一进站就显异动横幅。起因是 7-17 SpaceX 发射失败牵动全板块，而看板此前没有预警层。
- **卫星互联网专题群四张深度看板**：`/spacex`（含与 mbabrand 品牌·舆情·创始人三维内联卡片）、`/yuanxin`（垣信·千帆，未上市诚实留白）、`/xingwang`（中国星网·国网）、`/constellation`（星座竞赛九强 + 发射组网时间线），并加关键词监控，让未上市、无 ticker 的实体也能预警。
- **对话调研接真后端**（v0.39–0.41）：大模型只做意图路由 + 实体抽取、不产数字，按标的分派确定性 skill 取数作答；支持多轮上下文指代消解和「追问建议 chip」。
- **全市场标的模糊搜索 `/search`**：本地精选秒回 → A 股全量中文名 → 港美股 Yahoo，"表外标的也能搜"，名称 / 代码取自数据源事实而非大模型猜。
- **看板升级为可探索驾驶舱**（v0.36）：全局切片条 + 跨面板联动 + 列表下钻 + URL 深链 + ⌘K 搜索 + 自选关注 + 对比模式，纯前端零新增后端。
- **卫星 Agent 侧**（v0.23，828 tests）：market_model 自底向上 + 卫星互联网归因、时序回测（判增强后 5 日超额 +4.65% / 判削弱 −6.60%）、valuation 接 29 家真实财报、wiki 知识图谱 NER 落地（393 实体 / 392 概念）。

## 为什么做

投研的两个老问题：信息散、数字容易被大模型编造。OAF 的答案是把两件事分开——把取数、估值、量化筛选交给确定性工具和真实数据源（baostock / tushare / yfinance / SEC EDGAR），把叙事和多空辩论交给大模型，中间用 `data_quality_flag` 跨源校验标分歧、缺数就留白。凭证只在数据源 / 网关层，agent 经 MCP 也拿不到 key。

## 你能怎么用

- **看板**：`oaf.world` 首页实时看板每 6 小时自动刷新；`/web/app` 投研工作台切对话调研 / 行业调研 / 跨市场板块 / 知识图谱 / 卫星叙事股票池。
- **Agent CLI / MCP**：直读 `api.oaf.world` 的 `/quote /financials /dcf /research /ask /search /sector-pulse` 等端点，或用 4 个 MCP 投研工具（get_quote / get_financials / get_company_profile / run_dcf）。
- **Skills**：`fundamentals-research` 技能包；卫星 Agent 侧有 `satagent` CLI（init / ingest / fetch / report / decision）。
- **飞书**：每日 / 每周投研日报周报 webhook 推送。

适合：专业投资人、买方 / 卖方分析师、PM，以及卫星互联网产业决策者。
