# zhanglu.net

张路的个人站。Astro 5 + Tailwind 4 + Cloudflare Pages。

## 开发

```bash
pnpm install
pnpm dev          # 本地起服 http://localhost:4321
pnpm build        # 产出 dist/
pnpm preview      # 看构建结果
```

## 内容更新

所有内容是 markdown / JSON 文件，无 CMS。

| 想做什么            | 改什么文件                              |
| ------------------- | --------------------------------------- |
| 加项目              | `src/content/projects/<slug>.md`        |
| 加文章入口          | `src/content/articles/<slug>.md`        |
| 同步本机 skills     | `pnpm run sync:skills`                  |
| 改首页文案 / bio    | `src/data/about.json`                   |
| 改社交链接          | `src/data/social.json`                  |
| 改首页排版          | `src/pages/index.astro`                 |

详细指南：[AGENTS.md](./AGENTS.md)

## 部署

push 到 `main` → Cloudflare Pages 自动构建部署。

## 协作

AI agent (Claude Code / Codex / Hermes / ...) 用 `AGENTS.md` 作为更新指南。
