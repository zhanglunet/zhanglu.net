---
title: 智坊 · Enterprise Agent Studio
tagline: 先把任务想清楚，再设计 Agent 与 UI
url: https://openasf.club
repo: https://github.com/zhanglunet/enterprise-agent-studio
cover: /covers/enterprise-agent-studio.webp
tech: [Cloudflare Agent, GLM-5.3, Application Manifest, 行为评测]
year: 2026
featured: true
status: beta
order: 15
---

## 是什么

一个 harness-native 的企业 Agent 工作室。从**业务决定、专业任务和责任边界**出发，在连续会话里同时产出两样东西：

- **企业 Agent 源码** —— System Prompt、核心 Skills、运行契约、评测用例和可核对清单
- **UI 产品设计包** —— PRODUCT、DESIGN、设计令牌、高保真静态原型和质量审计

再加第三块：**联合评审与恢复** —— 对齐对象、权限、状态与错误恢复，局部失败不抹掉已经可靠的产物。

三者来自同一个 Application Manifest，所以 Agent 和 UI 不会各说各话。

## 七步，四次确认

连续对话不取消正式确认。七步里有四处保留用户决定权：

```
01 登录并创建项目              读取状态
02 描述并确认任务需求          ← 需要确认
03 上传材料并确认 Grounding     ← 需要确认
04 确认 Agent 专业设计          ← 需要确认
05 运行行为评测并取得 L1        读取状态
06 确认 Application Manifest 与任务型 UI  ← 需要确认
07 联合编译、预览并下载        读取状态
```

对话式产品最容易滑向「一路聊下去，最后发现生成了一堆你没同意过的东西」。把四个确认点钉死在流程里，是这套设计的骨架。

## 为什么值得看

真正让我觉得这个项目不一样的，不是它能生成什么，是**它拒绝声称自己能生成什么**。

首页上直接挂着成熟度分布：**可用 10 / 受控 Beta 5 / 受限 1 / 规划中 1**。每一条能力旁边都写着它的限制：

- 「Agent 专业设计清单」可用 —— 但**上游 Grounding 或系统形态变化会使旧修订失效**
- 「规则夹具行为评测」受控 Beta —— **尚无真实客户生产记录**
- 「Application Manifest 与任务型 UI」受控 Beta —— **不得绕过有效 L1 前置门**
- 「Agent/UI 联合编译」受控 Beta —— **静态预览不代表客户应用已上线**
- 「Stage 4 招聘管理试点」规划中 —— **当前暂停；不进入七步可用流程；不得对外声称已交付**

最后那句「不得对外声称已交付」写在自己的官网首页上。这在 AI 产品里非常罕见。

站上把这条原则叫 **HONEST BY DESIGN — 不把生成，写成已经上线**，并给了三条具体边界：未连接的企业系统只生成契约；自动评审不冒充独立 Source Gate；生成的 UI 只在隔离环境中静态预览。

## 你能怎么用

打开 [openasf.club](https://openasf.club) —— 目前是**邀请码登录**。

第一次用建议先读站上的图文用户指南：七步、四次确认、十三张图，说明它解决什么问题、怎么用、最后拿到什么。指南有网页版，也有从同一事实源生成的 Markdown 和 Word 下载。

运行环境：Cloudflare Agent + GLM-5.3，30 天私有保存，支持可恢复交付（事件账本可回放）。

## 边界

- **受控 Beta**，邀请码准入
- Stage 2/3 仍需真实业务验证；桌面 Preset 仍有发行限制；**Stage 4 保持暂停**
- 静态 UI 预览 ≠ 客户应用已部署

联合开发者：[wangwpino](https://github.com/wangwpino) · [zhanglunet](https://github.com/zhanglunet)。
