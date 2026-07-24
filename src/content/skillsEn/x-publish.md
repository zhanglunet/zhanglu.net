---
name: "x-publish"
description: |
  Rewrite a published long-form piece (e.g. a WeChat Official Account article / blog post) into an 8-12-tweet English **X (Twitter)** thread and publish it automatically:
  (1) long-form → thread JSON (hook + pain + approach + 4-6 steps + data + cta, each ≤280 characters),
  (2) 4 16:9 images (cover + pipeline + data + cta), 1200×675 @2x,
  (3) **dual-path publishing**:
      - primary path: tweepy + OAuth 1.0a, fully automated (X API Free Tier's 1500 tweets/month is enough),
      - fallback path: osascript + browser to manually click Tweet (used when there are no dev credentials).

  When to use: you've already published a Chinese long-form piece on a WeChat Official Account / Xiaohongshu / blog and want to sync it to X to reach an English audience; or your audience is primarily English and you want a fully automated posting flow.

  Explicit triggers: "sync to X / Twitter," "post a thread about this," "push this piece to X," "the X / Twitter post."

  Not for: pure marketing accounts (X also filters low-quality content), video tweets (this skill only does image + text), Premium long tweets of 25K characters (this skill uses the standard 280-character thread), politically sensitive content.
source: local
featured: false
handwritten: false
synced_at: "2026-06-09"
---

This skill originates from the local `~/.claude/skills/x-publish/SKILL.md`, auto-synced by `pnpm run sync:skills`.

## Description

Rewrite a published long-form piece (e.g. a WeChat Official Account article / blog post) into an 8-12-tweet English **X (Twitter)** thread and publish it automatically:
(1) long-form → thread JSON (hook + pain + approach + 4-6 steps + data + cta, each ≤280 characters),
(2) 4 16:9 images (cover + pipeline + data + cta), 1200×675 @2x,
(3) **dual-path publishing**:
    - primary path: tweepy + OAuth 1.0a, fully automated (X API Free Tier's 1500 tweets/month is enough),
    - fallback path: osascript + browser to manually click Tweet (used when there are no dev credentials).

When to use: you've already published a Chinese long-form piece on a WeChat Official Account / Xiaohongshu / blog and want to sync it to X to reach an English audience; or your audience is primarily English and you want a fully automated posting flow.

Explicit triggers: "sync to X / Twitter," "post a thread about this," "push this piece to X," "the X / Twitter post."

Not for: pure marketing accounts (X also filters low-quality content), video tweets (this skill only does image + text), Premium long tweets of 25K characters (this skill uses the standard 280-character thread), politically sensitive content.
