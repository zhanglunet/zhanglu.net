# 2026-08-03 · 回补近期周报

## 背景

线上 `/weekly/` 只有 `2026-W29`，缺少之后两周的公开周报。

按仓库约定，周报基于本仓库 Git 历史和 dev-log 事实生成，不把计划写成已经完成的事实。

## 证据

- `2026-W30`：`git log --since=2026-07-20 --until=2026-07-26`，结合 `docs/dev-log/2026-07-24-i18n-english-version.md`、`2026-07-25-how-it-works.md`、`2026-07-25-release-v0.3.0.md`。
- `2026-W31`：`git log --since=2026-07-27 --until=2026-08-02`，结合 `docs/dev-log/2026-07-27-skills-sync-incident.md`、`2026-08-01-four-new-projects.md`、`2026-08-01-four-posts.md`。

## 改动

- 新增中文周报：`src/content/weekly/2026-w30.md`
- 新增英文周报：`src/content/weeklyEn/2026-w30.md`
- 新增中文周报：`src/content/weekly/2026-w31.md`
- 新增英文周报：`src/content/weeklyEn/2026-w31.md`

不补 `2026-W32`，因为 2026-08-03 才进入新周，周报还不完整。

## 验证

执行：

```bash
pnpm run build
```

结果：构建通过，共生成 157 个页面，新增以下路由：

- `/weekly/2026-w30/`
- `/weekly/2026-w31/`
- `/en/weekly/2026-w30/`
- `/en/weekly/2026-w31/`
- `/api/weekly/2026-w30.json`
- `/api/weekly/2026-w31.json`
- `/en/api/weekly/2026-w30.json`
- `/en/api/weekly/2026-w31.json`
