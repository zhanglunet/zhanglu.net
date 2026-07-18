---
title: QCC Agent
tagline: 把企查查塞进任何一个 AI Agent
url: https://qcc-agent.pages.dev
repo: https://github.com/zhanglunet/qcc
tech: [MCP, Claude Skill, Python, TypeScript, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 5
loc: 1874
---

## 是什么

一套面向 AI Agent 的企查查接入层，开源。把企查查的 146 个查询接口封装成 MCP（Model Context Protocol）Streamable HTTP，Agent 端直接调用，不用自己再处理签名、分页、限流和字段语义。

- **协议层**：6 个 MCP Server，146 个原子 tool
- **客户端**：`qcc-py`（Python）+ `qcc-ts`（TypeScript），两边 API 对齐
- **业务层**：8 个按"尽调动作"组织的 Skill（KYB / 供应商准入 / 投后监控 / 关系图谱 / 风险扫描 等），不是 146 个工具一字排开
- **运行时**：Claude Code、OpenClaw（龙虾）、Hermes、纯 CLI，同一套 `skills/` 目录四种形态复用

## 为什么做

企查查 API 用起来有两层摩擦：

1. **接口太散**：146 个 endpoint，做一次完整尽调要串 7-10 个，每次都从字段表查起，Agent 上下文窗口直接被签名样板填满。
2. **业务语义缺失**：API 返回的是"工商变更记录"，但你真正想问的是"这家公司过去 12 个月控制权稳不稳"。中间那层 mapping 没人做。

把协议、客户端、业务流程分成三层，Agent 只需要调 Skill，Skill 调 Server，Server 调 API。任何一层都能单独换——换 Agent 运行时不用动 Skill，换 API 提供商不用动业务逻辑。

## 你能怎么用

**Claude Code 里直接用**：

```bash
pip install qcc-py
# 配置 MCP server, 然后:
/kyb <公司名>          # 一键 KYB 报告
/supplier-check <名单> # 批量供应商准入
/post-investment <组合> # 投后月度监控
```

**自己集成**：把 `qcc-py` 或 `qcc-ts` 当普通 SDK 用，不走 MCP 也行。

适合：做 B 端尽调 / 风控 / 供应链 SaaS 的团队、投资机构想把投后监控自动化、企业内部审计想把"翻企查查"这件事从人工变 Agent。
