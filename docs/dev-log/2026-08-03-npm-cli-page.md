# 2026-08-03 · npm / CLI 专门说明页

## 背景

用户要求把本站 npm 包详细展开解释：怎么使用、怎么运行，并做一个专门页面。

已有 `/agents` 页面包含 CLI 段落，但它同时讲端点、curl、Claude Code、权限信号等内容；本次新增独立 `/npm` 页面，专门解释 `zhanglu-net` npm 包与 `npx` 用法。

## 事实核验

本地源码：

- `cli/package.json`：`name = zhanglu-net`，`version = 0.2.0`，`engines.node >= 18`，MIT。
- `cli/bin/zhanglu-net.mjs`：零运行时依赖，命令覆盖 `endpoints`、`list`、`get`、`search`、`about`、`social`、`help`、`version`。

npm registry：

```bash
npm view zhanglu-net version name bin dependencies repository.url license --json
npm view zhanglu version name description time --json
```

确认 `zhanglu-net` 指向本仓库且当前为 `0.2.0`；`zhanglu` 是别人 2021 年发布的空包，页面需要提醒不要装错。

## 改动

- 新增中文页面：`src/pages/npm.astro`
- 新增英文页面：`src/pages/en/npm.astro`
- 顶部导航增加 `npm`
- `/agents` 与 `/en/agents` 增加到 npm 专页的入口
- `README.md`、`public/llms.txt`、`public/en/llms.txt` 增加 npm 专页链接
- `AGENTS.md` 补目录树与 agent CLI 文档入口

## 验证

已执行：

```bash
pnpm run build
git diff --check
```

结果：

- `pnpm run build` 通过，当前本地工作区生成 159 个页面；包含 `/npm/` 与 `/en/npm/`。
- 临时 stash 未暂存内容后，干净发布树 `pnpm run build` 通过，生成 157 个页面。
- 本地工作区已有未提交的 skills 变更和新增 skill 文件，本次提交不纳入这些内容；所以本地脏工作区页面数略高于发布树。
- `git diff --check` 无输出。
- 构建产物中已能检索到 `/agents`、`/en/agents`、`README.md` 与 `llms.txt` 指向 npm 专页的入口。
