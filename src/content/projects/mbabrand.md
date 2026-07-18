---
title: MBA Brand
tagline: 把品牌影响力做成可监控 / 可打分 / 可复盘的智能资产——43 位评委合议，舆情驱动版本化重审
url: https://mbabrand.com
repo: https://github.com/zhanglunet/mba
tech: [Claude Skill, Multi-Agent, MCP Server, TypeScript, Python, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 1
loc: 22311
persona: CMO
---

## 是什么

一套基于 Claude Skill 的品牌判断流水线。给它一个品牌名，它会跑完 7 维度并行调研、Lead 评委综合，再让一组「人物评委」（傅盛 / Steve Jobs / 张一鸣 / 马斯克 等）按各自的 mental model、在 5 个镜头上独立打分，最后输出版本化的 Markdown + HTML 报告：

- 5 维度雷达图（原创性 / 范畴命名 / 杠杆质量 / 身份一致性 / 真实信号）
- 评委异议热力图——哪一条结论分歧最大
- 影响力构造图——品牌资产怎么搭出来的
- 30 / 90 / 365 天 attribution checkpoint，事后回看能 attribute 到具体证据链
- 90 天可执行行动建议

从一个 skill 起步，现在它是**线上持续运行的品牌监控台**（mbabrand.com），已监控 24 个品牌，榜首 NVIDIA 8.88。

## 最近进展

- **从「监控」升级为「关系宇宙」（v0.5）**：品牌 + 创始人 + 产业 + 组合四层打通。每个品牌接上创始人，创始人之间能摆「创始人晚餐」推演合作，品牌按 6 大产业归类、首页可筛选。
- **一次纳入 7 家全球科技巨头**：NVIDIA / Apple / Google / Microsoft / Amazon / Huawei / DeepSeek，各含完整审计报告；监控规模从 15 扩到 24。
- **Brand Watch 舆情监控整条链路落地**：事件采集 → 触发规则评估 → EVOLUTION 自动重审，watch 只建议、永不改分；配舆情驾驶舱看板 + 飞书 L1/L2/L3 分层预警。
- **全维度知识星图**：纯 SVG 星座图，铺开 5 镜头 × 9 维度 × 品牌 × 10 面板 × 43 评委的 184 条真实关系边；每个品牌还有自己的 ego 星图。
- **发布独立 MCP server**（`npx -y mba-mcp-server`）：16 个工具（8 核心审计 + 6 演化追踪 + 2 舆情），可接进 Claude Desktop / Cursor 等任意 MCP agent；增量重跑把演化审计成本从 ~$3 压到 ~$0.4/次。

## 为什么做

品牌影响力的判断长期靠"感觉"。两个常见失败模式：

1. **单一视角偏见**：找一个意见领袖问，他的盲区就是你的盲区。
2. **结论无法 attribute**：拍脑袋说"这个品牌挺强的"，半年后业绩崩了，不知道是哪一步错了。

把判断分解成多个维度 × 43 位 mental model 的评委 × 5 种打分镜头，每条结论都能追溯回证据。半年后回看，是评委判错、证据不全、还是世界变了，一目了然。核心立场是**反捏造**：只引用公开一手资料，拿不到的标 N/A 不编造，评委引用经 CI 硬 gate 逐字校验。

## 你能怎么用

**速读档（3 分钟）**：

```bash
/mba <brand> --quick --no-judges
```

只用 WebSearch + WebFetch，先验证管线再加重。

**完整合议（30 分钟）**：

```bash
/mba <brand>
```

召回默认 5 位评委，或 `--panel <name>` / `--industry <name>` 换行业评委 panel（汽车 / 教育 / 消费等，共 10 套 panel）。

**当成服务接**：`npx -y mba-mcp-server@latest` 挂进任意 MCP agent，或直接读站点 `/api/*.json`。

适合：创始人决定品牌方向、品牌 / 增长团队 PMF 复盘、投资人做尽调与舆情追踪、AI 产品发布前的"反对意见预演"。
