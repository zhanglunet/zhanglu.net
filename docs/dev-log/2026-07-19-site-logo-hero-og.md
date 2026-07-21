# 2026-07-19 · 本站 logo「一条路，一个句点」+ 首页 OG + hero 头图迭代 + tagline

> 回溯补记（提交 `9db6f51`、`c34a9cb`、`716d063`、`de03aea`、`ed184d9`、`01d8254`）。多次迭代，合成一条。

## 目标

用户："给本网站设计一个 logo，并把设计说明做成品牌页" → "做首页 OG 分享图" → 看到线上"首页头图没换?"→ 选择加一张**可见的** hero 头图 → "换个构图（路直接『流进』张路两个字）" → 改 tagline → "参考首页 OG 的样式，把头图做成那样"。

## 改动（按迭代顺序）

1. **站点 logo + 品牌页（`9db6f51`）** — `public/brand/zhanglu-mark.svg` + `-inverse`/`-mono` + `zhanglu-lockup.svg`；`public/favicon.svg` 换成 Z 路新标；`docs/brand/zhanglu-logo.md` 设计说明；`src/pages/brand.astro` 品牌页「一条路，一个句点」；`Header.astro`/`Footer.astro` 挂 logo + 品牌页入口。
2. **首页 OG 分享图（`c34a9cb`）** — `public/og/home.png`（新 logo + tagline + 三产品域名）；`index.astro` 挂 `<Base image>`。
3. **可见 hero banner（`716d063`）** — `index.astro` 加盘山路 hero。
4. **改构图（`de03aea`）** — 路直接「流进」张路两字。
5. **改 tagline（`ed184d9`）** — 「用 Claude Skill…」→「用 Harness + Loop 把复杂判断变成可追溯的流水线」；同步 `about.json` + `llms.txt` + OG 图。
6. **hero 对齐 OG 样式（`01d8254`）** — 首页头图改成 OG 分享图的视觉（朱砂顶条 + hero-mark SVG + 张路. + tagline，`可追溯` 高亮）。

## 验证

- 每步 `pnpm build` 过 → 推 main 部署。
- OG 图 HTML → Playwright 1200×630 截图；hero 逐版截图对比（`docs/screenshots/home.png`）。

## 踩坑

- **OG 分享图 ≠ 页面可见头图**：OG 只在别处分享时出现，页面本身不显示 —— 这正是用户"头图没换?"的来由。要页面上能看见就得单独做 hero。
- tagline 改字牵连三处：`about.json`（hero + `<title>`）、`llms.txt`、OG 图，别漏。

## 结论与交付物

站点 logo 四变体 + 新 favicon + `/brand` 品牌页；首页 OG 分享图；可见 hero（最终对齐 OG 样式）；tagline 落定「Harness + Loop…可追溯的流水线」。
