# 2026-07-20 · 第二大脑 (aip.cab) 项目

> 回溯补记（提交 `96c216d`）。

## 目标

用户："https://aip.cab 加到项目里。"

## 改动

- `src/content/projects/aip.md` — 新增，「第二大脑」，`order: 4`、featured。私有仓库，无 `repo` 链接。
- `public/covers/aip.webp` — 网站截图封面（wget 镜像 + file:// 截图 + sharp webp，套路见 §9.9）。
- `src/content/projects/{qcc-agent,qiji-roadshow-2026,shanghai}.md` — order 下移让位（aip 插到 order 4：mbabrand1/boss2/oaf3/aip4/qiji5/qcc6/shanghai7/tui9）。
- `AGENTS.md` — §11 快照更新到 8 projects。

## 验证

- `pnpm build` 过 → 推 main 部署。
- 用户当时要求"检查是否生效"，抓线上确认 aip 卡片 + 封面 + 排序。

## 踩坑

- 插入 `order: 4` 要把后面项目的 order 顺移，否则排序冲突（数字小靠前）。
- aip 是私有仓库 → 不给 `repo` 外链（同 boss/oaf/tui3）。

## 结论与交付物

projects 达 8（含 aip）；封面 + 排序 + 快照同步，线上生效。
