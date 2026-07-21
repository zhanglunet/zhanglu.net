# 2026-07-18 · 项目扩充：boss/oaf 上站 + mbabrand 刷进展 + shanghai + 全项目 loc

> 回溯补记（提交 `94d1732`、`c9cb515`）。

## 目标

- 把 mbabrand.com / oaf.world / bossagent.cc 三个产品的最近进展补上站（从对应仓库、重大更新、网站截图、功能说明）。
- 给所有项目标注最新源码行数。
- 新增 shanghai 项目（`github.com/zhanglunet/shanghai`）。

## 改动

**加 boss/oaf 项目 + 刷 mbabrand（`94d1732`）**
- `src/content/projects/boss.md`、`oaf.md` — 新增（分别对应 boss-vault、InvesResearch 仓库）。
- `src/content/projects/mbabrand.md`、`qcc-agent.md`、`qiji-roadshow-2026.md` — 刷新进展。
- `src/content/presentations/{boss-handbook,mbabrand,oaf,openagent}.md` — 对齐。
- `src/data/about.json`、`public/llms.txt`、`AGENTS.md` — 快照同步。

**shanghai + 全项目 loc（`c9cb515`）**
- `src/content/config.ts` — projects schema 加 `loc: z.number().optional()`。
- `src/content/projects/shanghai.md` — 新增（loc 6376）。
- `src/content/projects/{boss,mbabrand,oaf,qcc-agent}.md` — 补 loc。
- `src/components/ProjectCard.astro`、`src/pages/projects/[slug].astro` — 渲染"≈ N 行代码"。
- `src/pages/api/projects.json.ts` — 端点带出 loc。

## 验证

- `pnpm build` 过 → 推 main 自动部署。
- 用户当时要求"检查是否上线"，抓线上 `/api/projects.json` 确认字段生效。

## 踩坑

- **loc 用 cloc**，但环境未装 → 下载 perl 版 cloc 到 `/usr/local/bin`；克隆各仓库统计，排除文档/数据/生成物。
- **私有仓库项目（boss/oaf）不放 `repo` 链接** —— 仓库不公开，卡片给外链会 404。
- 改了 schema 字段**必须同步端点**（§14.4），否则字段进不了 `/api/*.json`。
- 公众号正文抓不到（§9.6），进展信息从 GitHub 仓库取。

## 结论与交付物

projects 从 5 → 8（+boss/oaf/shanghai），全项目带 loc 徽章；线上生效。
