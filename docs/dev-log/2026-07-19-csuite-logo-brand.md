# 2026-07-19 · C-suite logo「三弧一点，一枚印」+ 品牌页

> 回溯补记（提交 `7a2dd4f`、`1a15bab`）。

## 目标

给 C-suite 决策智能体套件做一枚标识，并建品牌页讲设计理念；长文里也补一节把 logo 讲进去。

## 改动

- `public/brand/c-suite-mark.svg`（阳刻）+ `c-suite-mark-solid.svg`（阴刻反白）+ `c-suite-mark-mono.svg`（单色）+ `c-suite-lockup.svg`（横向锁版）— 新增。三段断开的弧合成一个 C（三席位独立而合议）+ 中心一点墨（锚点：拍板的人）+ 印框（版本化冻结）。
- `docs/brand/c-suite-logo.md` — 设计说明文档。
- `src/pages/c-suite/index.astro` + `src/pages/c-suite/brand.astro` — 专题页从单文件 `c-suite.astro` 重构成目录，新增品牌子页。
- `public/og/c-suite.png` — OG 图更新带 logo。
- `src/pages/posts/c-suite-design.astro`（`1a15bab`）— 长文加「把这套骨架压成一个图形」一节，逐条讲三个图形元素的信条。

## 验证

- `pnpm build` 过。
- 品牌页 + 长文 logo 节截图确认；SVG 用 CSS 变量取朱砂色，深浅底都测。

## 踩坑

- 专题页由 `c-suite.astro` 单文件改成 `c-suite/index.astro` + `c-suite/brand.astro` 目录结构 —— 注意 Astro 文件路由改名后旧路径失效，导航/内链要一起改。

## 结论与交付物

`/c-suite/brand` 品牌页上线；logo 四变体入库，后来公众号配图（`c-suite-mark.png`）就是从 `c-suite-mark.svg` 渲染的。
