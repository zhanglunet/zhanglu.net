# 2026-11-28：八轮调优长文上站（/posts/hackathon-tuning）

## 改了什么

- 新增 `src/pages/posts/hackathon-tuning.mdx`：把已在微信公众号发布的《没有 GPU 的八轮调优》全文搬上站内，不再只留一个链到微信原文的卡片。
- `src/content/articles/hackathon-tuning.md`：`source: wechat` → `blog`，`url` → `https://zhanglu.net/posts/hackathon-tuning`（AGENTS.md §5.2：同一篇内容既在公众号也在原始博客发了，优先用博客 URL；站内长文是合法的“原始出处”）。
- 图片：6 张信息图 + 封面放 `public/posts/hackathon-tuning/`，正文用绝对路径引用；封面同时进 frontmatter `image`（og 图）。
- 正文与已发布版逐字一致，只做了三处站内适配：去掉 H1（Post 布局自己渲染标题）、首段钩子移到 frontmatter `lead`、文末来源改成仓库链接。微信链接全文 0 命中。

## 为什么

用户 2026-11-28 要求：已发布的稿子要在 zhanglu.net 有独立网页，能被搜索引擎索引，不要引用微信公众号链接。/posts 已有 sitemap（@astrojs/sitemap 自动收录）与 robots 全开，符合要求。

## 验证

- `pnpm run build` 通过；`dist/posts/hackathon-tuning/index.html` 已生成，6 张图与封面都在 `dist/posts/hackathon-tuning/` 下。
- 待确认（未改）：正文两处事实已过时——“四轮赛制”后组织方又加了第五轮（12-12–15）；“每队分 4 台机器，每台 8 张卡”与组织方通知“每队独占 4 台 6000D 服务器（8 卡）”口径不一致。等用户定改不改，再动正文。

## 坑

- 本机 Node 是 v24，仓库锁定 Node 22（.nvmrc），构建仍通过；pnpm 需 9.15.0（packageManager 字段），`npm i -g pnpm@9.15.0`。
- 构建中途 VM 重置过一次（uptime 归零），node_modules 未建完；重装后恢复，工作区文件都在 /home，未丢。
