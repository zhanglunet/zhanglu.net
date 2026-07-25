# zhanglu.net 架构：这个站是怎么运作的

> 维护者 / agent 向的架构总览。站上有一份给读者看的版本：[`/how-it-works`](https://zhanglu.net/how-it-works)。
> 具体怎么改内容看 [`AGENTS.md`](../AGENTS.md)；本文讲**为什么是这个结构**。
> 数字截至站点 v0.3.0（2026-07-25）。

## 一句话

**内容是 git 仓库里的纯文本文件，`pnpm build` 把它们编译成一整套静态产物，`git push` 即部署。**
没有 CMS、没有数据库、没有服务端运行时 —— 线上只有静态文件和 CDN。

这条约束是所有其它设计的根源：因为没有服务端，所以搜索必须在客户端做、端点必须是构建时落盘的文件、
不能有鉴权、也不可能依赖外部 API 实时拉数据。

---

## 1. 全景数据流

```
┌─ 内容源（git 里的纯文本，唯一需要人手写的东西）──────────────────┐
│                                                                  │
│  src/content/<coll>/*.md      中文内容（5 个集合）                │
│  src/content/<coll>En/*.md    英文平行版（同 slug、同数量）        │
│  src/data/about.json          简介（+ about.en.json）             │
│  src/data/social.json         社交链接（+ social.en.json）        │
│  src/i18n/ui.ts               UI 文案字典（zh / en 两套）          │
│                                                                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
              ┌──────────▼───────────┐
              │  契约层（强制校验）   │   src/content/config.ts
              │  Zod schema          │   ← 缺字段 / 类型不对 = build 失败
              └──────────┬───────────┘
                         │
              ┌──────────▼───────────┐
              │  构建（pnpm build）   │   Astro 5 + Tailwind 4
              │                      │   字段形状：src/lib/api.ts（zh/en 共用）
              └──────────┬───────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│  产物（dist/，全部是静态文件）                                     │
│                                                                  │
│  107 个页面      HTML：中文 53 + 英文 53 + 404                    │
│  96 个 JSON      24 个端点类型（12 类 × 2 语言），[slug] 展开后    │
│  2 份 RSS        /rss.xml · /en/rss.xml                          │
│  2 份 llms.txt   /llms.txt · /en/llms.txt（agent 自发现）         │
│  1 份 sitemap    sitemap-index.xml（106 条，含 hreflang）         │
│  robots.txt      allow all + Content-Signal                     │
│  _headers        CF Pages 响应头（钉住 CORS）                     │
│                                                                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │  git push origin main
              ┌──────────▼───────────┐
              │  Cloudflare Pages     │   1–2 分钟
              └──────────┬───────────┘
                         │
        ┌────────────────┼────────────────┬──────────────────┐
        ▼                ▼                ▼                  ▼
     人（浏览器）      agent（JSON）    CLI（npm）        搜索引擎 / 爬虫
     zhanglu.net      /api/*.json      npx zhanglu-net   sitemap + robots
     /en/            /en/api/*.json    --lang zh|en      + Content-Signal
```

## 2. 五类内容 × 两种语言

| 集合 | 数量 | 页面 | 端点 | 说明 |
|---|---:|---|---|---|
| `projects` | 8 | 列表 + 详情 | 列表 + 详情（含 `body_md`） | 有 `loc` / `persona` / `cover` |
| `articles` | 5 | 仅列表 | 仅列表 | **写作索引** —— 链接指向原始出处，无站内详情页 |
| `presentations` | 4 | 仅列表 | 仅列表 | 卡片直接跳外链 |
| `skills` | 30 | 列表 + 详情 | 列表 + 详情（含 `body_md`） | 16 个 `sync:skills` 生成 + 14 个手写 |
| `weekly` | 1 | 列表 + 详情 | 列表 + 详情（含 `body_md`） | 脱敏公开周报 |

每个集合都有 `*En` 平行版，**数量 1:1**。改内容要两边都动。
另有站内长文 `src/pages/posts/*.astro`（不是集合，是原生页面）——见 `AGENTS.md` §14.7 三种"文章"的职责区分。

## 3. 一个文件，七处消费

这是整个架构的核心收益。以 `src/content/projects/boss.md` 为例，写一次，自动出现在：

| # | 产物 | 消费者 |
|---|---|---|
| 1 | `/projects/boss` 详情页 | 人 |
| 2 | `/projects` 列表页卡片 | 人 |
| 3 | 首页「精选项目」（`featured: true` 才上） | 人 |
| 4 | `/api/projects.json` 列表项 | agent |
| 5 | `/api/projects/boss.json`（含 `body_md` 全文） | agent |
| 6 | `/api/search.json` 语料 | agent / CLI 搜索 |
| 7 | `/rss.xml` + `sitemap` 条目 | 订阅者 / 搜索引擎 |

英文版 `projectsEn/boss.md` 同理再出 7 份。**没有任何一处需要手动同步** —— 这是"schema 是单一事实源"的实际含义。

## 4. 双语是怎么实现的

| 维度 | 做法 |
|---|---|
| 路由 | 中文在根 `/`，英文在 `/en/`（Astro `i18n`，`prefixDefaultLocale: false`） |
| 语言判定 | 组件里 `getLangFromUrl(Astro.url)` **自检**，不靠 props 层层传 |
| 内容 | 平行 `*En` 集合（不是同集合加 `lang` 字段）—— zh 消费端零改动，不需要到处 filter |
| UI 文案 | `src/i18n/ui.ts` 字典；**页面独有的长散文写在各自语言的页面文件里**，不进字典 |
| 数据 | `about.en.json` / `social.en.json` |
| 首访 | `Base.astro` 内联脚本按 `navigator.language` 跳转 |
| 手动切换 | 页头「中 / EN」写 `localStorage['site-lang']`，之后**以选择为准，不再自动跳** |
| SEO | `<html lang>`、`hreflang`（zh-CN / en / x-default）、`og:locale`、分语言 RSS、sitemap i18n |

**为什么用平行集合而不是同集合加语言字段**：后者要在 12+ 处消费端都加过滤，漏一处就串语言。
平行集合让 zh 侧代码完全不用改，代价是内容要写两份 —— 对一个内容量有限的个人站，这个取舍是值得的。

## 5. 机读层（给 agent）

```
自发现入口                    /llms.txt  ·  /en/llms.txt
      │
      ▼
manifest（counts + 全部端点 + 语言交叉链接）   /api/index.json
      │
      ├── 列表类   projects / articles / presentations / skills / weekly / about / social / search
      └── 详情类   projects/{slug} · skills/{slug} · weekly/{slug}   ← 含 body_md 全文
```

约定：

- 每个响应带 `lang` 字段（`"zh"` / `"en"`），agent 可自查拿到的是哪种语言。
- **不存在的路径返回真 404**（靠 `src/pages/404.astro`）。此前返回 200 + 首页 HTML，agent 无法用状态码判断。
- CORS 由 `public/_headers` **显式声明** —— 静态构建下端点代码里写的响应头不落盘，实际由托管层决定，不该依赖未声明的默认值。
- 字段形状**只在 `src/lib/api.ts` 定义一次**（389 行），zh / en 端点都只负责「取哪个集合 + 传哪种语言」。
- 搜索是客户端的：`/api/search.json` 一次拉完全部语料（49 条），substring 匹配。语料涨到 200+ 再考虑 MiniSearch。

CLI（`zhanglu-net`，npm，零依赖）是这层的薄包装，不是另一套 API。

## 6. 设计约束（为什么这么定）

| 约束 | 原因 |
|---|---|
| 没有服务端 | 静态站的全部好处：永远可用、零运维、CDN 天然分发、构建即快照 |
| schema 强校验 | 内容错了在 **build 时**失败，而不是线上出空白页 |
| 字段只定义一次 | 早期 10 个端点各自内联字段，漂过一次（列表有 `loc/persona/cover`、详情没有） |
| 会漂的数字 build 时算 | `/agents` 上的 CLI 行数与版本号是 `readFileSync` 出来的。写死过「270 行」，实际早已 500+ |
| 端点不依赖外部 fetch | 否则 CF Pages 构建会因为第三方抖动而不稳 |
| 不做鉴权 | 公开内容才进 `src/content/`；PII 在端点出口脱敏只是兜底 |
| 表驱动 | CLI 的 `KINDS` 表 —— 加一种内容类型只改一处，`list`/`get`/帮助文本自动跟上 |

## 7. 目录地图（哪个文件管什么）

| 路径 | 职责 |
|---|---|
| `src/content/config.ts` | **数据契约**。Zod schema，zh 与 `*En` 共用同一份常量 |
| `src/lib/api.ts` | **字段形状**。所有端点的 builder，zh/en 共用 |
| `src/i18n/{ui,utils}.ts` | 双语字典 + helpers（`getLangFromUrl` / `localizePath` / `altPath`） |
| `src/layouts/Base.astro` | 页面壳：SEO meta、hreflang、分语言 RSS、语言自适应脚本 |
| `src/components/*.astro` | 卡片与导航，**都自检语言** |
| `src/pages/**` | 文件系统路由；`src/pages/en/**` 是英文镜像（相对 import 深一层） |
| `src/pages/api/**` · `en/api/**` | 端点薄包装（只选集合 + 语言） |
| `public/**` | 原样拷贝：`llms.txt` ×2、`robots.txt`、`_headers`、图片、logo |
| `cli/` | 独立 npm 包，版本号与站点**不同步** |
| `docs/dev-log/` | 每次开发的过程记录（见 `AGENTS.md` §15） |

## 8. 技术栈

Node 22（CF Pages 构建用；本地 ≥18 即可） · pnpm 9.15 · Astro 5.18 · Tailwind 4.3（`@tailwindcss/vite`，CSS-first `@theme`，无 `tailwind.config.js`） · `@astrojs/{mdx,sitemap,rss}` · Cloudflare Pages。

CLI 零运行时依赖：只用 Node 内置 `fetch` / `parseArgs` / `createRequire`。

## 9. 从改一个字到上线

```
改 src/content/... 或 src/data/...
      │
      ├── pnpm dev      本地热更新看效果
      │
      ├── pnpm build    必过（schema 校验 + 产物生成）      ← AGENTS.md §15 的硬性要求
      │
      ├── docs/dev-log/ 留一条过程记录
      │
      └── git push main → CF Pages → 1–2 分钟上线
```

发版（可选的里程碑）见 `AGENTS.md` §8.1；CLI 发 npm 见 §14.3。

---

**相关文档**：[`AGENTS.md`](../AGENTS.md)（权威操作指南）· [`docs/agent-cli/design.md`](./agent-cli/design.md)（端点设计决策）· [`docs/dev-log/`](./dev-log/)（过程记录）· 站上版本 [`/how-it-works`](https://zhanglu.net/how-it-works)
