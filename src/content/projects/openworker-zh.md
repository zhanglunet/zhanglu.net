---
title: OpenWorker 中文站
tagline: 把结果交给 AI，不只得到回答
url: https://oaosf.cn
repo: https://github.com/zhanglunet/openworker-zh-localized
cover: /covers/openworker-zh.webp
tech: [Tauri 2, React, FastAPI, MCP, 本地优先]
year: 2026
featured: true
status: beta
order: 12
---

## 是什么

[OpenWorker](https://github.com/andrewyng/openworker) 是运行在桌面的开源 AI coworker（MIT，作者 Andrew Ng）——它读取文件、连接日常工具、分解任务、请求批准，把工作推进成真正可用的交付物，而不只是回一段话。

**这个项目是它的中文侧**，三件东西：

1. **中文站** [oaosf.cn](https://oaosf.cn) —— 中文介绍、能力说明、工作方式、安全边界、常见问题
2. **中文版 macOS 构建** —— 当前 0.1.7，Apple Silicon / aarch64 的 DMG，Bundle ID `com.openworker.desktop.zh`，与英文版并存
3. **源码深度分析** —— 对上游仓库做的架构拆解与成熟度判断，含交互式信息图

上游源码在 `andrewyng/openworker`，中文资料与本地化构建在 `zhanglunet/openworker-zh-localized`。

## 为什么做

OpenWorker 值得单独做一份中文侧，有两个原因。

**第一，它不是「套壳聊天应用」。** 源码分析给出的判断是：这是一套本地 Agent 运行平台，壁垒来自工具循环、权限系统、连接器和持久化，而不是某个模型。桌面壳是 React + Tauri 2，本地服务是 FastAPI + WebSocket 的 Python sidecar，`SessionManager` 协调会话、Inbox、自动化、审计与持久化。想研究 Agent 架构的人，它是一份可运行的参考实现。

一些能说明设计取向的细节：`TurnEngine` 会先逐个授权工具调用，再**并发执行明确标记为低风险的读取**；写入、Shell 和未标注工具**保持严格顺序**，降低竞态与意外副作用。权限分四级 —— `READ` 直接执行、`WRITE_LOCAL` 按模式批准且受可写目录约束、`EXEC` 重点确认（复杂 Shell 不能自动命中白名单）、`EXTERNAL` 目标级授权。

**第二，中文版更新之后会变回英文版。** 0.1.7 把自动更新源切到了中文仓库，这个坑才算填上。

## 你能怎么用

**当普通 App 装**：站上下载 DMG，拖进「应用程序」即可，可与英文版并存。自带模型密钥，OpenAI / Anthropic / Gemini / GLM / DeepSeek / Kimi / Qwen / MiniMax / Mistral / Ollama 任选。

**从源码跑**（研究架构用）：

```bash
git clone https://github.com/zhanglunet/openworker-zh-localized
cd openworker-zh-localized
bash packaging/setup_dev_env.sh
.venv/bin/openworker-server --cwd ~/project --port 8765
# 另一个终端
cd surfaces/gui && npm install && npm run dev
```

后端需要 Python 3.10+，前端 Node 20+，完整桌面壳还要 Rust 工具链。

**只想看分析**：站上有交互式信息图和源码深度分析页。

## 几条得先说清楚的边界

站上把这些写在显眼位置，这里照抄：

- **「本地优先」是一条边界，不是绝对承诺。** 会话、记忆、密钥和主要运行状态留在设备上；但你一旦选择云端模型或启用外部连接器，完成任务所需的数据仍会发送到对应服务。想完全本地，用 Ollama 并且不启用外部连接器。
- **当前构建未经公证。** 首次打开如遇 macOS 安全提示，右键 App 选「打开」一次。
- **官方仍标注 Open Beta。** 建议先在低风险工作流里试，逐项检查连接器权限、审批模式和模型数据政策。
- **源码分析里也有批评**：`server/manager.py` 已超过 4000 行、连接器执行层接近 5000 行 —— 功能闭环完整，但后续维护需要继续拆分边界。统计取自 `main@01b6f83`，且**是代码资产数量，不代表本站跑过原项目的测试**。
