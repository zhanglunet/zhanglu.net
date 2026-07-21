# 2026-07-21 · 开发纪律与 dev-log 约定落地（Superpowers 原生版）

## 目标

用户要求：「每次开发，要验证系统是否遵守了 Superpowers，并全程写好开发文档，做好过程记录。」

## 前置核查（Superpowers 是否在场）

查了四处，**确认未安装**：

- 仓库无 `.claude/`；
- `~/.claude/plugins` 为空；
- `~/.claude/skills` 只有 docx / pdf / pptx / xlsx / meeting-minutes / morning / skill-creator / pdf-to-epub / session-start-hook；
- 全盘 `grep -ri superpower ~` 唯一命中是本次会话自己的日志 + 一个无关 npm 缓存 blob。

所以"系统是否遵守 Superpowers"前提不成立——它不在场。核实了 Superpowers 是什么（obra / Jesse Vincent 的 Claude Code 插件，6 阶段方法论 + ~14 skills，强调写设计文档/计划、完成前验证），其内核与用户诉求高度重合。

## 决策

给用户三个落地选项，选定 **A：原生纪律 + 仓库过程记录**——不装重型插件（本地插件装不进临时远程会话，且完整 worktree/TDD 流程对内容站偏重），把内核纪律固化进 AGENTS.md，过程记录落 `docs/dev-log/`（随 git 双端持久）。

## 改动

- `AGENTS.md` — 新增 §15「开发纪律与过程记录（Superpowers 式，原生落地）」：固定回路（计划→改→验证→过程记录）、dev-log 五段式、按改动大小裁剪表、与既有 §8/§9/§13 的分工；§8 加回路指针；§10 加"不写 dev-log / 没 build 就说完成"禁令；§13 补 AGENTS.md vs dev-log vs §9 的分工。
- `docs/dev-log/README.md` — 新增。约定说明 + 五段式模板。
- `docs/dev-log/2026-07-21-wechat-typeset.md` — 补写今天公众号排版工作的过程记录（首个真实样例）。
- `docs/dev-log/2026-07-21-devlog-discipline.md` — 本文件。

## 验证

- `pnpm run build` → 见 build 步结果（本次只动 `docs/` + `AGENTS.md`，不参与站点构建，预期 Complete，跑一遍确认没误伤 `src/`）。

## 结论与交付物

- 纪律已进 AGENTS.md（`@AGENTS.md` → 每个会话的 system context 都会加载 → 未来任何 agent 默认遵守）。
- dev-log 约定 + 模板 + 两条真实记录已入库。
- 后续每次开发：走 §15 回路，`docs/dev-log/` 留记录，新坑补 §9。
- 可选后续：用户若想在**本地** Claude Code 上真跑 Superpowers 完整流程，`/plugin` 搜 superpowers（obra）安装。
