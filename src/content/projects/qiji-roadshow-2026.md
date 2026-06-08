---
title: 奇绩 2026 路演全景
tagline: 56 个路演项目，从现场照片到可发布的 DD 全景页，一条流水线打穿
url: https://qiji-roadshow-2026.pages.dev
tech: [Claude Skill, Multi-Agent, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 2
---

## 是什么

把一场路演 / demo day / 加速器毕业展的现场素材（项目卡片照片 + 展区墙照片 + 主办方公众号文章），一次性变成 6 件可分发的资产：

1. **结构化 JSON 数据集**——所有项目的标准化字段
2. **全景式交互 HTML landing page**——按板块/赛道可缩放浏览
3. **可排序筛选的 DD 表页**——7 路并行调研 agent 各自跑团队 / 市场 / 技术 / 财务 / 竞品 / 风险 / 同类对标
4. **Word 深度报告**——给基金 IC 看的版本
5. **CSV 表格**——Excel / Numbers 直接打开做二次分析
6. **一键部署 Cloudflare Pages**——`qiji-roadshow-2026.pages.dev` 就是这条流水线吐出来的

## 为什么做

路演现场信息密度极高，但散落在 200 张手机照片、3 条公众号链接和你的记忆里。一周后基本"看完就忘"。

让 Claude Skill 把照片 OCR + 文章解析 + 横向 DD 并行做完，结构化进数据库一次，**之后可索引、可对比、可发布**，能比"看完就忘"高出至少一个量级——尤其是想看完后写一份对外交付物（基金内参 / Newsletter / 行业速记）的人。

## 你能怎么用

把同类型素材（demo day / YC 路演 / VC 演示日 / 加速器毕业展）丢进：

```bash
/demo-day-dossier <事件名>
```

附上一个文件夹（cards + wall photo）和官方文章 URL，半小时跑完六件套，最后一步直接 push 上线。

适合：投资机构跑 demo day 复盘、研究员做赛道 mapping、媒体写行业速记、加速器做对外 showcase。
