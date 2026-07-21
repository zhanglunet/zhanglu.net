# 2026-07-19 · 手机阅读优化 —— 导航单行横滑 + 修 3 处横向溢出

> 回溯补记（提交 `9a85169`）。

## 目标

用户："网站为手机阅读浏览优化一下。"重点是 390px 视口下别横向溢出、导航别换行、长文表格能看。

## 改动

- `src/components/Header.astro` — 导航改单行横滑（`overflow-x-auto` + item `shrink-0` + 隐藏滚动条），新增项不再挤换行。
- `src/components/SkillCard.astro`、`src/pages/skills/[slug].astro`、`src/pages/agents.astro` — 修横向溢出。
- `src/styles/global.css` — 兜底 `overflow-x: clip`；`.prose-zh` 表格 ≤640px 整表横滑（th/td nowrap）。

## 验证

- `pnpm build` 过。
- **用 Playwright evaluate 遍历 `getBoundingClientRect().right > 390`** 逐个揪出溢出元素，修完再跑一遍确认清零（不靠猜）。

## 踩坑（已固化进 §9.8）

390px 下撑破页面的三个惯犯：
1. **grid 隐式轨道 + `<pre>`**：`grid md:grid-cols-2` 手机端落到隐式单列，被 pre 的 max-content 撑破 → 写显式 `grid-cols-1 md:grid-cols-2`。
2. **长英文 token 不断行**：URL / 路径 / `ZHANGLU_BASE_URL` 在窄列撑宽 min-content → 容器加 `wrap-anywhere`。
3. **导航换行** → 单行横滑（见上）。

## 结论与交付物

390px 视口零横向溢出；三个惯犯写进 AGENTS.md §9.8 供后续避坑。
