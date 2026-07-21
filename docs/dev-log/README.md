# docs/dev-log/ — 开发过程记录

> 这里存**每次开发的过程记录**。约定和它在整体纪律里的位置见 `AGENTS.md` §15。
> 一句话：AGENTS.md 记"**以后该怎么做**"，dev-log 记"**这次是怎么做的**"，`docs/*/dev-log.md` 那种专题开发记录（如 `docs/agent-cli/dev-log.md`）继续保留、互不冲突。

## 为什么要写

commit message 记的是"改了什么"，diff 记的是"改成什么样"，但**"当时为什么这么决定、验证到什么程度、踩了哪个坑"** 只有过程记录能留住。目的是让未来的你和别的 agent 能顺着记录复盘，而不是对着 diff 猜意图。

## 什么时候写

按 `AGENTS.md` §15.3 裁剪，别搞流程表演：

| 改动 | 要不要 dev-log |
|---|---|
| 改一句文案 / 加一篇 article | 一小段，当天可合并进一个文件 |
| 新增 项目 / presentation / skill | 一条 |
| 组件 / CSS / 布局 | 一条，附截图 |
| schema / 端点 / 脚手架 / 构建配置 | 一条，写清楚**为什么这么改** |
| 纯仓库文档 | 可选，重要决策才记 |

## 文件命名

```
docs/dev-log/YYYY-MM-DD-<关键词>.md
```

- 一次开发一个文件；同一天多次就用不同关键词区分（`2026-07-21-wechat-typeset.md`、`2026-07-21-devlog-discipline.md`）。
- 关键词用短横线小写英文或拼音，别用空格。

## 五段式模板

复制下面这块，填完删掉提示：

```markdown
# YYYY-MM-DD · <标题>

## 目标
这次要解决什么 / 用户原话诉求。一两句。

## 改动
- `path/to/file` — 改了什么
- `path/to/another` — 改了什么
（临时产物、scratchpad 脚本、artifact 链接也在这里点一句，标明是否入库）

## 验证
- `pnpm run build` → 结果（Complete / 报错行）
- 视觉改动：截图 / preview 看了哪几屏、桌面 + 手机
- 端点改动：curl 了哪个 `/api/*.json`
（没验证就别写"完成"）

## 踩坑（可选）
这次新踩的坑 + 结论。**如果是会重犯的坑，同时补进 AGENTS.md §9。**

## 结论与交付物
最终状态 + 交付物（线上 URL / 文件 / artifact 链接）。留没留尾巴。
```

## 已有记录

- `2026-07-21-wechat-typeset.md` — C-suite 长文的公众号排版版 + 标题迭代
- `2026-07-21-devlog-discipline.md` — 本套开发纪律与 dev-log 约定的落地
