# 2026-07-19 · tui3.com 存档项目 + 全项目网站截图封面 + 首页「往期作品」画廊

> 回溯补记（提交 `e84e18a`、`f44be04`）。

## 目标

- 把 tui3.com（1999–2007 的往期作品）作为 archived 项目加进来。
- 在首页宣传 tui3 往期作品，含几个子站截图。
- 给其他新项目也都配上网站截图封面。

## 改动

**tui3 存档（`e84e18a`）**
- `src/content/projects/tui3.md` — 新增，`status: archived`、`order: 9`、非 featured。

**截图封面 + 画廊（`f44be04`）**
- `public/covers/{boss,mbabrand,oaf,qcc-agent,qiji-roadshow-2026,shanghai,tui3}.webp` — 7 张项目封面。
- `public/tui3/{changyou,heibanbao,shuo3,sofaee,zhanglu}.webp` — tui3 5 个子站截图。
- `src/components/ProjectCard.astro` — cover 字段现在**会渲染**（顶部 banner，aspect-16/9，object-top）。
- 各 `projects/*.md` 补 `cover` 字段；`projects.json.ts` + `projects/[slug].astro` 带出/渲染。
- `src/pages/index.astro` — 首页加「往期作品」画廊（tui3 子站）。

## 验证

- `pnpm build` 过 → 推 main 部署。
- 首页画廊 + 各项目卡 banner 截图确认（`docs/screenshots/{home,projects}.png`）。

## 踩坑（已固化进 §9.9）

- **headless Chromium 直连外部站被 agent 代理 `ERR_CONNECTION_RESET`**（连 example.com 都挂；localhost 不走代理所以没事）。curl/wget 走代理是通的。
- 可行套路：`wget -e robots=off -p -k -H -nd` 把页面连 CSS/JS/图镜像到本地 → Playwright 截 `file://`（`page.route` abort 掉非 file:///data: 请求）→ `sharp` resize 1200 宽转 webp q78（sharp 根目录 require 不到，用 `node_modules/.pnpm/sharp@*/...` 全路径）。12 张 3.1MB → 633KB。

## 结论与交付物

projects 达 8（+tui3 存档）；全项目带截图封面 banner；首页多了往期作品画廊。
