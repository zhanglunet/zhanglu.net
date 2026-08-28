# 2026-08-28 · 新增项目：智坊 Enterprise Agent Studio（openasf.club）

## 目标

用户：「项目里加上新的项目：https://openasf.club」。

## 抓站遇到的新情况：这是个纯 SPA

前面几个站 `curl` 直接就能拿到正文。openasf.club 不行 —— 首页只有 **898 字节**：

```html
<div id="root"></div>
<script type="module" crossorigin src="/assets/index-BIm4CBDr.js"></script>
```

纯 React SPA，服务端不渲染任何内容。§9.9 里那句「纯 JS-SPA 只能拿到壳」这次是主角。

### 解法：镜像 → 本地起 HTTP → 渲染

按 §9.9 先 `wget -p -k` 镜像（拿到 427KB 的 JS + 81KB 的 CSS），然后截 `file://` —— **失败**：

```
Access to script at 'file:///tmp/mir3/index-BIm4CBDr.js' from origin 'null'
has been blocked by CORS policy
渲染出的文字长度: 0
```

`file://` 协议下 **ES module 会被 CORS 拦掉**（`type="module"` 的脚本按 CORS 规则加载，
`file://` 的 origin 是 `null`）。前几个站是普通 `<script>` 或纯 CSS，所以没撞上。

改成**在本地起一个静态服务器再渲染**就通了：

```bash
cd /tmp/mir3 && python3 -m http.server 8899 &
# Playwright 访问 http://127.0.0.1:8899/index.html
# 用 page.route 只放行 127.0.0.1:8899 与 data:，掐掉 Google Fonts 等外域
```

渲染出 1992 字符正文 + 完整封面截图。**这条应该补进 §9.9**：
SPA 走「wget 镜像 → 本地 HTTP → 渲染」，不是 `file://`。

## 站在做什么

| 维度 | 内容 |
|---|---|
| 定位 | harness-native 企业 Agent 工作室 |
| 输入 | 业务决定、专业任务、责任边界 |
| 输出 | ① 企业 Agent 源码（System Prompt / Skills / 运行契约 / 评测用例 / 可核对清单）② UI 产品设计包（PRODUCT、DESIGN、设计令牌、高保真静态原型、质量审计）③ 联合评审与恢复 |
| 关键约束 | 三者来自**同一个 Application Manifest** |
| 流程 | 七步、**四次确认**（任务需求 / Grounding / Agent 专业设计 / Manifest 与 UI）|
| 运行 | Cloudflare Agent + GLM-5.3，30 天私有保存，事件账本可回放 |
| 准入 | **邀请码登录** |

## 值得单独写的一点：它拒绝声称自己能做什么

首页直接挂成熟度分布：**可用 10 / 受控 Beta 5 / 受限 1 / 规划中 1**，每条能力旁边写着自己的限制。
最狠的一条是 Stage 4 招聘管理试点：

> 当前暂停；不进入七步可用流程；**不得对外声称已交付**

「不得对外声称已交付」印在自家官网首页上，这在 AI 产品里非常罕见。站上把这条原则叫
**HONEST BY DESIGN —— 不把生成，写成已经上线**，并给了三条具体边界：未连接的企业系统只生成契约；
自动评审不冒充独立 Source Gate；生成的 UI 只在隔离环境中静态预览。

这些**原样写进了项目正文**，包括每条能力的限制条款 —— 项目页不该比产品自己更乐观。

## 改动

- `src/content/projects/enterprise-agent-studio.md` + `projectsEn/` 同名
  - `order: 15`、`featured: true`、`status: beta`（受控 Beta + 邀请码）
  - `tech: [Cloudflare Agent, GLM-5.3, Application Manifest, 行为评测]`
  - 注明**联合开发者 wangwpino / zhanglunet**，不写成一个人的项目
- `public/covers/enterprise-agent-studio.webp`（1200px / q78 / 23KB）
- `AGENTS.md` §11：projects → 16、weekly → 5、页面 → 181、JSON → 154、快照日期 → 08-28

## 验证

- `pnpm run build` → **Complete，181 页**
- **中英对齐**：projects `zh=16 en=16`；各集合 zh/en 全部 1:1（articles 12/12、presentations 4/4、weekly 5/5、skills 47/47）
- **端点**：两语 `projects.json` 均 `count=16`；`index.json` counts
  `{projects:16, articles:12, presentations:4, skills:47, weekly:5}`；search zh=**85**
- **产物齐全**：zh 页 / en 页 / zh 端点 / en 端点 / 封面 **5 项全 ✓**
- **order 无撞号**：`1..15 + 99`
- **移动端**：5 页 × 2 宽度 **10 项全过**
- **详情页外链 4 条**均正确：`openasf.club` / `enterprise-agent-studio` / `wangwpino` / `zhanglunet`
- **首页封面**：滚到底后 15 张全部加载成功
- **截图**：标题 / tagline / `beta` 徽章 / 访问站点 + 源码链接 / tech 标签 / 封面 banner 正常

## 踩坑

1. **`file://` 下 ES module 被 CORS 拦**（见上）。SPA 必须本地起 HTTP 服务再渲染。
2. **`node_modules` 在会话中途消失了**。`sharp` 找不到 → `pnpm install` 重装（4.3s）即可。
   容器的工作区不保证跨命令持久，**build 前先确认依赖在**。
3. **rebase 撞上远端两批新内容**：`feishu-move` 项目（占 order 14）+ 周报 w32/w34 + skills 41→47。
   我原本占 14，让到 **15**。这已经是第三次因为并行加项目而撞 order ——
   §11 改成逐项标 order 之后至少能一眼看出来。

## 结论与交付物

- `/projects` 与 `/en/projects` 各 16 个；`/projects/enterprise-agent-studio` 双语可达
- 项目正文照抄了产品自己的成熟度标注与「不得对外声称已交付」，没有替它美化
- 联合开发者署名写清楚
