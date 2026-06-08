---
name: "cloudflare-email-service"
description: |
  用 Cloudflare Email Service（Email Sending + Email Routing）收发交易邮件。
  在 Workers / Node / Python / Go 集成邮件，或处理 SPF / DKIM / DMARC 投递性时用——即便看起来简单，这里有关键配置细节。
source: local
featured: false
handwritten: true
synced_at: "2026-06-08"
---

## 用途

用 Cloudflare Email Service 收发交易邮件，覆盖 Email Sending + Email Routing 两个产品。

## 何时用

- 邮件发送（Workers binding 或 REST API）
- 邮件路由
- Agents SDK 邮件处理
- 在 Workers、Node.js、Python、Go 等任何应用里集成邮件
- 邮件投递性（SPF / DKIM / DMARC）
- wrangler 邮件配置
- MCP 邮件工具
- 让 coding agent 自动发邮件

## 重要

即便看起来简单——"在我的 Worker 里加个发邮件"——也要加载这个 skill：里面有关键的配置细节。
