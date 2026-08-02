# 2026-08-03 · 新增模力自由港项目与文章入口

## 背景

将 `https://oaf.asia` 加入 zhanglu.net 的项目列表，并在文章索引中增加一篇介绍入口。

仓库中已有 `OAF` 项目指向 `https://oaf.world`，这是卫星互联网决策 Agent 与投研工作台；本次新增的 `oaf.asia` 使用项目名「模力自由港 / FreeModel Port」，作为独立项目处理，避免 slug 与语义混淆。

## 改动

- 新增中文项目：`src/content/projects/free-model-port.md`
- 新增英文项目：`src/content/projectsEn/free-model-port.md`
- 新增中文文章入口：`src/content/articles/free-model-port.md`
- 新增英文文章入口：`src/content/articlesEn/free-model-port.md`
- 新增项目封面：`public/covers/free-model-port.webp`

文章入口指向 `https://oaf.asia/stories/free-model-port/`，项目入口指向 `https://oaf.asia`。

## 验证

执行：

```bash
pnpm run build
```

结果：构建通过，生成了：

- `/projects/free-model-port/`
- `/en/projects/free-model-port/`
- `/api/projects/free-model-port.json`
- `/en/api/projects/free-model-port.json`
- `/articles/` 与 `/en/articles/` 中的新文章入口

构建期间仍出现 skills 相关 duplicate id 警告，来自本地工作区已有的 skills 同步改动，不是本次项目/文章新增引入。
