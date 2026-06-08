---
name: "workers-best-practices"
description: |
  按生产环境最佳实践评审和编写 Cloudflare Workers 代码。
  新写 Worker、评审 Worker、配 wrangler.jsonc，或查常见反模式（streaming、悬空 promise、全局状态、密钥、bindings、可观测性）时用。
source: local
featured: false
handwritten: true
synced_at: "2026-06-08"
---

## 用途

按生产环境最佳实践评审和编写 Cloudflare Workers 代码。

## 何时加载

- 新写 Worker
- 评审 Worker 代码
- 配置 `wrangler.jsonc`
- 检查常见 Workers 反模式

## 关注的反模式

- streaming
- 悬空 promise（floating promises）
- 全局状态
- 密钥处理
- bindings
- 可观测性

## 知识倾向

偏向检索 Cloudflare 文档，而非依赖预训练知识。
