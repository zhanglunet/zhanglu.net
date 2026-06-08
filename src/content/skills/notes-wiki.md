---
name: "notes-wiki"
description: |
  把一堆 markdown 文档（会议纪要 / 文章 / 日志 / 学习笔记）抽成一个本地可浏览的
  HTML 知识库 — 人物 / 概念 / 实体 / 文档四个维度互相跳转。
  
  流程：N 个 sub-agent 并行 LLM 抽取（按时间或字典序分批）→ 共享 slug 词典保证可合并 →
  Python merge dedup → 静态 HTML 渲染（书卷风 CSS + 客户端搜索 + 类型筛选）→
  本地 http.server 起服验收。
  
  显式触发：「用 /notes-wiki 把 X 目录做成 wiki」「从这堆 markdown 建个本地知识库」
  「把会议纪要 / 文章 / 笔记 抽成互链 HTML」「entity extraction → wiki」。
  
  适用场景：
  - 公司会议纪要长期沉淀，需要按人 / 概念 / 项目反查
  - 个人 flomo / 日记 / 长文累积，需要主题索引
  - 文献 / 论文 / 文档集合，需要快速检索高频概念
  - 任何 markdown 语料库想要"人物 / 概念 / 项目"三维度的索引视图
  
  不要用本 skill 的情况：
  - 单文档总结（直接用 Read + 写一份 summary 即可）
  - 已有结构化数据的展示（这是 frontend-design 的事）
  - 需要语义检索 / RAG（本 skill 只做关键词索引，不做 embedding）
  - 需要持续增量更新（本 skill 是一次性全量重生成）
source: local
category: "knowledge-base"
featured: false
handwritten: false
synced_at: "2026-06-08"
---

本 skill 来源于本机 `~/.claude/skills/notes-wiki/SKILL.md`，由 `pnpm run sync:skills` 自动同步。

## 描述

把一堆 markdown 文档（会议纪要 / 文章 / 日志 / 学习笔记）抽成一个本地可浏览的
HTML 知识库 — 人物 / 概念 / 实体 / 文档四个维度互相跳转。

流程：N 个 sub-agent 并行 LLM 抽取（按时间或字典序分批）→ 共享 slug 词典保证可合并 →
Python merge dedup → 静态 HTML 渲染（书卷风 CSS + 客户端搜索 + 类型筛选）→
本地 http.server 起服验收。

显式触发：「用 /notes-wiki 把 X 目录做成 wiki」「从这堆 markdown 建个本地知识库」
「把会议纪要 / 文章 / 笔记 抽成互链 HTML」「entity extraction → wiki」。

适用场景：
- 公司会议纪要长期沉淀，需要按人 / 概念 / 项目反查
- 个人 flomo / 日记 / 长文累积，需要主题索引
- 文献 / 论文 / 文档集合，需要快速检索高频概念
- 任何 markdown 语料库想要"人物 / 概念 / 项目"三维度的索引视图

不要用本 skill 的情况：
- 单文档总结（直接用 Read + 写一份 summary 即可）
- 已有结构化数据的展示（这是 frontend-design 的事）
- 需要语义检索 / RAG（本 skill 只做关键词索引，不做 embedding）
- 需要持续增量更新（本 skill 是一次性全量重生成）
