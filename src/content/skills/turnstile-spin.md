---
name: "turnstile-spin"
description: |
  在项目里端到端装好 Cloudflare Turnstile。
  扫描代码库 → 调 Cloudflare API 建 widget → 部署 managed siteverify Worker → 写前端片段 → 验证 → 固化 skill。
source: local
featured: false
handwritten: true
synced_at: "2026-06-08"
---

## 用途

端到端在项目里装好 Cloudflare Turnstile。

## 做哪些事

1. 扫描代码库
2. 调 Cloudflare API 创建 widget
3. 部署 managed siteverify Worker
4. 写前端片段
5. 验证
6. 固化 skill

## 何时加载

- 加 Turnstile
- 设置 CAPTCHA
- 保护表单防 bot
- 修 Turnstile 集成

## 参考

镜像 [developers.cloudflare.com/turnstile/spin](https://developers.cloudflare.com/turnstile/spin)。
