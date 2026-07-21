# 2026-07-18→19 · C-suite 三件套：persona → 首页小节 → 专题页 → 设计长文 → 定位升维

> 回溯补记（提交 `a9035f9`、`71cde6f`、`6b96d5e`、`3fe9744`、`ed67a69`、`bd1c303`）。一条概念线，多次提交，合成一条记录。

## 目标

用户点出 Boss=给 CEO、MBA Brand=给 CMO、OAF=给 CFO，觉得"C-suite 这个概念很好"，要求：标注人群 → 建专题页 → 写设计思想长文 → 配 OG 分享图 → 把定位升维成"一套面向 C-suite 的决策智能体，为 AI 原生组织而设计"。

## 改动（按迭代顺序）

1. **persona 标注（`a9035f9`）** — `config.ts` 加 `persona` 字段；`ProjectCard.astro` + `projects/[slug].astro` 渲染朱砂徽章"为 X 设计"；boss/mbabrand/oaf 三个 md 填 CEO/CMO/CFO；`projects.json.ts` 带出。
2. **首页三件套小节（`71cde6f`）** — `src/pages/index.astro` 加 C-suite 定位 section。
3. **专题页（`6b96d5e`）** — `src/pages/c-suite.astro` 新增；`Header.astro` 加导航入口。
4. **设计长文 + OG + 定位升维（`3fe9744`）** — `src/pages/posts/c-suite-design.astro`（站内长文）+ `src/pages/posts/index.astro`（长文索引）+ `src/content/articles/c-suite-design.md`（写作索引）；`public/og/c-suite.png`（1200×630）；`Base.astro` 支持 `image` prop 输出 og:image/twitter:image；定位落定"为 AI 原生组织而设计"。
5. **收口（`ed67a69`、`bd1c303`）** — 长文时间线"去年到今年"改「最近一个月」（用户纠正实际就一个月左右）；Boss 项目页 + 长文补「战略 OS」定位。

## 验证

- 每步 `pnpm build` 过 → 推 main 部署。
- OG 图为 HTML → Playwright 1200×630 截图；专题页/首页/长文逐屏截图确认（`docs/screenshots/{c-suite,home}.png`）。

## 踩坑

- OG 分享图是**分享时才出现**，不是页面可见头图 —— 用户后来问"首页头图没换?"即源于此，另立 hero（见 `2026-07-19-site-logo-hero-og.md`）。
- 长文既要站内页（`posts/*.astro`）又要写作索引（`articles/*.md`，url 指向 `/posts/<slug>`），两者互补（§14.7）。

## 结论与交付物

`/c-suite` 专题 + `/posts/c-suite-design` 长文 + persona 徽章 + OG 图上线；这套长文正是后来发公众号的那篇（见 `2026-07-21-wechat-typeset.md`）。
