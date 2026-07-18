# Changelog

本文件记录 [zhanglu.net](https://zhanglu.net) 站点的版本更新，采用 [Keep a Changelog](https://keepachangelog.com/zh-CN/) 风格，遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.2.0] - 2026-07-18

### 新增

- **Boss 项目**（<https://bossagent.cc>）—— 领导者决策智能体：1 锚点心证 + N 维度评委独立合议、必答反方，产出可引用 / 可打分 / 可证伪的判断报告，带 30/90/365 天归因校验。
- **OAF 项目**（<https://oaf.world>）—— 卫星互联网决策 Agent + 美/A/港三市场 AI 投研工作台，工程铁律「数字来自工具、叙事由大模型、缺数留白不编造」。
- **AI 愿景论坛 · 上海回顾**（<https://agentic-ai-shanghai-2026.pages.dev>）—— 2026 AI 愿景论坛（上海站）非官方回顾站：知识星图（99 实体 / 288 边）+ 30 场智能纪要 + 100+ 词条知识库 + 131 张幻灯片。
- **展示区**新增 Boss handbook、OAF slides 两张卡片。
- **全项目源码行数标注**：`projects` schema 加可选 `loc` 字段，卡片 + 详情页 + `/api/projects.json` 显示 `≈ N 行代码`（cloc 统计，排除文档 / 数据 / 生成物）。

### 变更

- 刷新 **mbabrand** 最近进展：v0.5 品牌 + 创始人 + 产业 + 组合关系宇宙、Brand Watch 舆情监控、全维度知识星图、mba-mcp-server（16 工具）等；补开源仓库链接。
- 精选项目排序调整为 mbabrand → boss → oaf → qiji-roadshow → qcc → shanghai（order 1–6）；展示排序 mbabrand → boss → oaf → openagent（order 1–4）。
- 刷新 `about.json` bio / tags、`public/llms.txt` 首段、`AGENTS.md` 内容快照与 schema 文档。

### 源码行数（cloc 统计，截至发布日）

| 项目 | 行数 | 主要构成 |
|---|---|---|
| boss | 87,943 | Python 50.9k · HTML 33.1k |
| oaf | 83,831 | HTML 42.8k · Python 40.5k |
| mbabrand | 22,311 | HTML 7.7k · TS 6.9k · Python 6.9k |
| shanghai | 6,376 | HTML 5.8k · JS · CSS |
| qcc-agent | 1,874 | HTML 1.2k · Python · TS |

> qiji-roadshow-2026 是 demo-day-dossier skill 生成的静态站，无独立代码仓库，故不标注。

## [0.1.0] - 2026-06

初始站点：个人主页、项目 / 文章 / 展示 / Skills 索引、Agent CLI 接口（`/api/*.json` + `npx zhanglu-net`）、RSS / sitemap / llms.txt。
