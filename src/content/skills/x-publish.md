---
name: "x-publish"
description: |
  把一篇已发布的长文（如公众号文章 / 博客）改写成 **X（Twitter）** 风格的 8-12 条英文 thread 并自动发布：
  (1) 长文 → thread JSON（hook + pain + approach + 4-6 步骤 + data + cta，每条 ≤280 字符），
  (2) 4 张 16:9 配图（cover + 流水线 + 数据 + cta），1200×675 @2x，
  (3) **双路径发布**：
      - 主路径：tweepy + OAuth 1.0a 全自动（X API Free Tier 每月 1500 条够用）
      - 兜底路径：osascript + 浏览器手动点 Tweet（没 dev 凭证时用）。
  
  适用场景：你已经在公众号 / 小红书 / 博客发了中文长文，想同步到 X 触达英文受众；或者你以英文受众为主，想要纯自动化的发文流程。
  
  显式触发：「同步到 X / Twitter」「发个 thread 推这件事」「把这篇推到 X 上」「the X / Twitter post」。
  
  不适用于：纯营销账号（X 也有低质量过滤）、视频推文（本 skill 只做图文）、Premium 长推文 25K 字（本 skill 走标准 280 字符 thread）、政治敏感内容。
source: local
featured: false
handwritten: false
synced_at: "2026-06-08"
---

本 skill 来源于本机 `~/.claude/skills/x-publish/SKILL.md`，由 `pnpm run sync:skills` 自动同步。

## 描述

把一篇已发布的长文（如公众号文章 / 博客）改写成 **X（Twitter）** 风格的 8-12 条英文 thread 并自动发布：
(1) 长文 → thread JSON（hook + pain + approach + 4-6 步骤 + data + cta，每条 ≤280 字符），
(2) 4 张 16:9 配图（cover + 流水线 + 数据 + cta），1200×675 @2x，
(3) **双路径发布**：
    - 主路径：tweepy + OAuth 1.0a 全自动（X API Free Tier 每月 1500 条够用）
    - 兜底路径：osascript + 浏览器手动点 Tweet（没 dev 凭证时用）。

适用场景：你已经在公众号 / 小红书 / 博客发了中文长文，想同步到 X 触达英文受众；或者你以英文受众为主，想要纯自动化的发文流程。

显式触发：「同步到 X / Twitter」「发个 thread 推这件事」「把这篇推到 X 上」「the X / Twitter post」。

不适用于：纯营销账号（X 也有低质量过滤）、视频推文（本 skill 只做图文）、Premium 长推文 25K 字（本 skill 走标准 280 字符 thread）、政治敏感内容。
