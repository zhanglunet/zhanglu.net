---
title: 模力自由港
tagline: 全球免费大模型发现、实测与接入入口：持续发现免费模型，真实验证可用性，再安全接入 Codex 与各种 AI CLI
url: https://oaf.asia
repo: https://github.com/zhanglunet/open-free-router
cover: /covers/free-model-port.webp
tech: [Python, FastAPI, Model Routing, Local-first, AI CLI, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 4
persona: AI 开发者
---

## 是什么

模力自由港（FreeModel Port）是一套开源、本地优先的免费大模型路由与发现系统。它把散落在 OpenRouter、NVIDIA NIM、Google AI Studio、Groq 等提供商里的免费模型整理成一张可验证的航图：哪些已经接入，哪些只是候选，哪些通过真实请求验证，哪些因为密钥、额度或上游状态暂时不可用。

它不是另一个模型平台，而是一个本机控制面。Codex、Claude Code、OpenCode、Kimi CLI、OpenClaw、WorkBuddy、Hermes、Pi / OMP 等客户端只需要面对一个本地入口；模型路由、协议适配、工具调用、流式响应和客户端配置同步都由自由港处理。

## 为什么做

免费模型的难点不是“名单不够多”，而是名单容易失效、接入路径分散、模型 ID 和接口协议各不相同。静态清单写着免费，不代表当前账户真的能完成一次请求；社区里看到的额度，也可能受地区、资格、限流和上游策略影响。

模力自由港把这个过程拆成三层：公开目录只生成候选，真实请求验证后才进入可运行目录，客户端通过本地代理统一接入。这样既能降低试错成本，也能保持关键凭据和使用记录留在本机。

## 你能怎么用

- 打开 `oaf.asia` 查看免费模型目录、实时状态、全球分布、模型评测和工具对比。
- 用安装脚本创建独立 Python 环境和 Codex profile，不覆盖正常 OpenAI 配置。
- 通过本地单端口代理，把免费模型接入 Codex、Claude Code、OpenCode 等 AI 编程工具。
- 在本机查看成功率、延迟、Fallback 和 Token 统计；公开站点只发布脱敏后的模型元数据与验证状态。

适合想低成本体验不同大模型、又不想反复折腾配置的 AI 编程工具用户、独立开发者、学生和模型评测者。
