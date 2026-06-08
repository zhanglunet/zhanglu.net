---
name: "demo-day-dossier"
description: |
  端到端的路演 / demo day dossier 流水线。
  项目卡片截图 + 展区墙照片 + 官方文章 → 结构化 JSON + 全景 HTML + DD 表（7 路并行调研）+ Word 报告 + CSV + 一键部署 Cloudflare Pages。
source: local
featured: false
handwritten: true
synced_at: "2026-06-08"
---

## 用途

端到端的路演 / demo day dossier 流水线。

## 输入

- 项目卡片截图文件夹
- 展区墙照片
- 主办方官方文章 URL（任意组合）

## 输出

1. 所有项目的结构化 JSON 数据集
2. 全景式交互 HTML landing page
3. 可排序筛选的 DD（尽调）表页——7 路并行调研 agent 驱动
4. Word 深度报告
5. CSV 表格（Excel / Numbers 直接打开）
6. 一键部署到 Cloudflare Pages

## 何时用

加速器 / VC 路演 / pitch day 现场素材（多张项目卡片 + demo day 照片 + 官方公告文章），想要一次性完成调研 + DD + 可发布 dossier。

## 显式触发

- "把路演项目做成全景网页"
- "奇绩 / YC / 红杉 / 经纬路演 56 个项目梳理"
- "demo day projects 全部 DD 一遍"
- "做一个项目尽职调查表上线 Cloudflare"
- "analyze all roadshow projects and publish"

## 不要用

- 单个项目深度研究 → 用 `/research`
- 单家公司 DD → 直接写一个聚焦的 prompt + WebSearch
- 实时投资人会议跟踪 → 暂无此工具
