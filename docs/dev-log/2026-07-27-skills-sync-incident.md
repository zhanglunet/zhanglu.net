# 2026-07-27 · skills 自动同步的三起事故：误删、内部内容外泄、中英静默不对齐

## 背景

07-25 我在回答「`/skills` 是不是最新的、如何自动保持更新」时，做了 `sync:check` / `sync:auto`
和 launchd 定时任务，并在 dev-log 里**预言**了两个静默缺陷（孤儿永不消失、中英会不对齐）。
07-26 和 07-27 用户的 Mac 各自动跑了一次并成功推送：

```
70165a3 chore: 同步本机 Claude Skills（43 个文件）   2026-07-27
5610983 chore: 同步本机 Claude Skills（16 个文件）   2026-07-26
```

自动化本身跑通了。但两次同步实际造成三个问题，**其中两个比我预言的更严重**。

## 事故一：`--prune` 把「读不出来」当成「已删除」，删掉 15 个 skill

`git diff 4042ebe..HEAD -- src/content/skills` → **42 added / 15 deleted / 1 modified**。
删掉的 15 个里包括 `mba`、9 个 `*-perspective`、`x-publish`、`notes-wiki`、`tian-wiki-ingest`、
`dws`，以及 **`zhanglu`（`featured: true`）**。

`zhanglu` 是站点自己的 agent 接入说明 skill。它一被删：

| 线上 URL | 状态 |
|---|---|
| `https://zhanglu.net/skills/zhanglu` | **404**（`/agents` 页面上还挂着这个链接） |
| `https://zhanglu.net/api/skills/zhanglu.json` | **404**（README 的安装配方就是 curl 它） |
| `https://zhanglu.net/en/skills/zhanglu` | 200 —— en 侧没被删，两语不一致 |

**根因**：`sync-skills.mjs` 的主循环里有四条 `continue` 路径不会把 slug 加进 `seen`：
断链 symlink、读不到 `SKILL.md`、frontmatter 解析失败、缺 `description`。
孤儿检测用的是 `!seen.has(slug)` —— 于是「目录还在，只是读不出来」被判成「本机已删除」，
`--prune` 直接删。AGENTS §9.3 早就写了「`~/.claude/skills/` 有大量符号链接（boss / *-perspective /
mba 等）」，这批 symlink 一旦目标目录被移走就集体断链，删除清单和这个假设高度吻合。

**修**：引入 `present` Set —— **只要目录还在就进 `present`，永不 prune**，读不出来的单独报告为
「⚠️ 不可读」。另外 `featured: true` 与 `handwritten: true` 的孤儿归为「人工策展过」，只报告不删。
删除时 zh / en 一起删，避免留下「en 有 zh 无」的残影。

## 事故二：17 个内部服务 skill 被推上公开站

新增的 42 个里，**17 个 frontmatter `name` 带 `aic-` 前缀**，是雇主内部系统的服务 CLI skill：

- `aic-crm-saf` 企业 CRM 销售预测（新增/变更/合并/版本/审批流转/批量导入）
- `aic-crm-customer2` 客户信息与联系人、归属人、签约信息、申请单审批流转、财务确认
- `aic-bt` 差旅管理平台后端，含美团 / 高德 / 滴滴对接
- `aic-checkin-paas` 考勤打卡平台，含组织架构代理查询
- 另外 13 个 `aic-crm-*` 子服务

description 里写清了各服务职责与模块划分 —— 等于把内部系统清单发布到 `zhanglu.net/skills`
和 `/api/skills.json`，任何人可读。已确认线上确实有（`curl /api/skills.json | grep aic-` 出 17 个）。

**注意目录名和 name 不一样**：目录是 `crm-saf` / `bt` / `checkin-paas`，只有 frontmatter 的
`name` 带 `aic-` 前缀。按目录名过滤会全部漏掉。

**决策（问过用户）**：下掉 17 个 `aic-*`；保留 25 个 `lark-*`（飞书 OpenAPI 通用封装，公开无妨）。

**修**：`sync-skills.mjs` 顶部加 `EXCLUDE = ['aic-*']`，glob 同时匹目录 slug 和 frontmatter `name`。
命中的既不写入，**也会删掉仓库里已有的残留，且不需要 `--prune`** —— 留着就等于留在公开站上。

## 事故三：中英静默不对齐（预言中的那个，但没被拦住）

zh 从 30 涨到 57，en 还是 30 → `/en/skills` 静默少 27 条，**构建照过**（没有 1:1 强制约束）。
`auto-sync-skills.sh` 里明明有检查，但只 `log` 一行警告就继续 build / commit / push。
**能推上线的警告等于没有警告。**

**修**：改成 `exit 1` 不推送，并打印「跑 `pnpm run sync:check` 看缺哪些」。
宁可让定时任务停下来等人补翻译，也别再推半边内容上线。

## 顺带修的两个衍生问题

1. **21 处文档/页面引用了已被删除的 `mba` skill** —— `/agents`、`/posts/agent-cli`、`llms.txt`、
   `README`、`cli/README`、CLI 帮助文本里的 `curl .../api/skills/mba.json` 和
   `npx zhanglu-net get skill mba --md` 全部变成死例子。统一换成 `boss`（双语都在）。
   历史记录（`docs/dev-log/`、`docs/agent-cli/dev-log.md`、公众号草稿）保持原样。
2. **README 的「装 skill」配方产出的是非法 skill** —— `jq -r .body_md > SKILL.md` 只有正文，
   没有 frontmatter，Claude Code 认不了。给端点加 `skill_md` 字段（frontmatter + body 拼好），
   配方改用它。实测：`matter(body_md).data` → `{}`；`matter(skill_md).data` → `{name, category}` ✓

## 改动

**内容**
- 删 `src/content/skills/{bt,checkin-paas,crm-*}.md` —— 17 个 `aic-*`
- 删 `src/content/skillsEn/` 里 14 个 zh 侧已 prune 的残留（`mba` / 9 个 perspective / `x-publish` /
  `dws` / `notes-wiki` / `tian-wiki-ingest`）
- 新增 `src/content/skillsEn/lark-*.md` —— 25 个英文平行版（人工翻译，保留「何时用 / 不负责」路由结构）
- 恢复 `src/content/skills/zhanglu.md`：改 `handwritten: true`（prune 不动 handwritten，
  本机已无源目录，仓库就是事实源）；内容更新到当前真实端点集（补 presentations / weekly /
  `/en/api/*` / `--lang en`）；**删掉「CDN cache 友好」这句假声明**（线上是
  `cache-control: max-age=0, must-revalidate`、`cf-cache-status: DYNAMIC`，07-25 已从 README 里删过一次）
- 同步更新 `src/content/skillsEn/zhanglu.md`

**脚本**
- `scripts/sync-skills.mjs`：`present` Set（不可读永不 prune）+ `EXCLUDE` glob + 策展孤儿保护 +
  prune 时 zh/en 一起删 + 新报告段落（🚫 排除 / ⚠️ 不可读）+ drift 计入排除残留
- `scripts/auto-sync-skills.sh`：中英不对齐 `exit 1`

**接口 / 文档**
- `src/lib/api.ts`：`buildSkillDetail` 加 `skill_md`（zh / en 同时生效，符合 §14.4「字段只在这里定义一次」）
- `README.md`：安装配方改 `skill_md` + 端点表补字段 + `mba` → `boss`
- `AGENTS.md`：§5.4.2 两个坑 → **四个坑**；新增 §9.12（容器里只能跑 `--check`）；
  §11 快照（skills 30 → 41、107 → 131 页、96 → 118 个 JSON）；§14.1 端点表补 `skill_md`
- `public/llms.txt`、`public/en/llms.txt`、`cli/README.md`、`cli/bin/zhanglu-net.mjs`、
  `src/pages/{agents,posts/agent-cli}.astro` 及 en 镜像：`mba` → `boss`
- `CHANGELOG.md`：未发布段落

## 验证

- `pnpm run build` → **Complete，131 页**（109 → +22，即 41-30=11 个新 skill × 2 语言）
- **计数对齐**：`dist/api/skills.json` 41 项 / `dist/en/api/skills.json` 41 项；
  `zh=41 en=41`，缺失 0、多出 0
- **排除彻底**：`grep -ro 'aic-' dist/` → **0**；`dist/skills/crm-*` 等目录不存在
- **`skill_md` 端到端**：`jq -r .skill_md dist/api/skills/zhanglu.json > SKILL.md`（4393 字节）→
  `gray-matter` 解析出 `name=zhanglu` / `category=meta` / description 44 行 / 正文首行 `## 用途`；
  对照 `matter(body_md).data` 为空 `{}`，证明旧配方确实是坏的
- **死链清零**：遍历 dist 里所有 `api/skills/<x>.json` 与 `get skill <x>` 示例，逐个核对
  `dist/api/skills/<x>.json` 是否存在 → 只剩 `boss` / `zhanglu`，全部 ✓
- **prune 安全性用夹具实测**（容器 `~/.claude/skills` 造 `zz-*`）：
  - 断链 symlink → 报「symlink 断链，目标读不到」，**不在孤儿清单** ✓
  - 目录在但无 SKILL.md → 报「目录在，但没有 SKILL.md」，不在孤儿清单 ✓
  - `name: aic-zz-crm-fixture`（目录名不带 aic-）→ 报「🚫 排除」，不创建；仓库残留被删（zh+en）✓
  - `--check` 真实 exit code = 1，且不写任何文件 ✓
- **移动端**：6 个页面（`/skills`、`/skills/lark-apps`、`/skills/zhanglu` × 双语）× 2 宽度
  （390 / 360）**共 12 项全过**，判据是 `scrollWidth vs clientWidth` + 「溢出元素是否被 overflow
  容器兜住」（§9.8）。`lark-apps` 的 description 特别长，是最坏情况，也没撑破。
- **截图**：`/skills` 与 `/en/skills` 桌面端渲染正常，`zhanglu` 排第一且 ★（featured）+ ✎（handwritten）
  角标都在；页头计数「共 41 个」/「41 in total」正确
- **build 时算的数字自己跟上了**：`/how-it-works` 上 96 → **118 个 JSON 文件**、「共 48 篇」→
  「共 59 篇」全自动更新，一处没手改 —— 07-25 那个「数字 build 时算」的决定这次直接兑现了

## 踩坑

- **我自己在容器里跑了写模式的 `sync:skills`**（本想验证 prune 行为），容器**自己也有
  `~/.claude/skills/`**（docx / pdf / pptx / skill-creator 之类），于是 10 个容器本地 skill
  被创建进 `src/content/skills/`。build 照过、`git status` 里只是多出一堆未跟踪文件，
  差一点就一起提交了。已删除并写进 **AGENTS §9.12**：容器里只跑 `--check`，用 `zz-*` 夹具验证写路径，
  验完立刻清理，提交前 `git status --porcelain src/content/skills` 必须只剩要改的那几个。
- **`printf '---\n...'` 在 bash 里报 `printf: --: invalid option`** —— 格式串以 `--` 开头被当成选项。
  写 frontmatter 夹具用 `cat <<'EOF'` heredoc，别用 `printf`。
- **`node script | head` 之后 `$?` 是 `head` 的退出码**，不是脚本的（§9.1 那条 pipefail 坑的又一变体）。
  验 `--check` 的 exit 1 时必须重定向到文件再读 `$?`。
- **Playwright 的 chromium 路径不是 `/opt/pw-browsers/chromium/`**，实际是
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`（另有 `chromium_headless_shell-1194`）。
  先 `find /opt/pw-browsers -maxdepth 3 -name chrome` 再写死路径。

## 结论与交付物

线上（下次部署后）：
- `/skills` 41 个、`/en/skills` 41 个，1:1 对齐
- 17 个内部 `aic-*` 下线，且以后不会再被同步上来
- `/skills/zhanglu` 与 `/api/skills/zhanglu.json` 恢复，`/agents` 与 README 的链接不再 404
- `/api/skills/{slug}.json` 多一个 `skill_md`，一行 jq 就能装 skill

机制上：
- prune 从「按未见到就删」改成「按目录是否存在删」，人工策展内容（featured / handwritten）永不自动删
- 工作向 skill 由 `EXCLUDE` 拦在门外，加一类就加一条模式
- `sync:auto` 遇到中英不对齐硬停 —— **不再有「能推上线的警告」**

留给人的一步：**`~/.claude/skills/zhanglu/` 在本机已经不存在了**。想让本机也能用这个 skill，
跑 README 里那条配方即可（现在用 `skill_md`，产出的是合法 SKILL.md）：

```bash
mkdir -p ~/.claude/skills/zhanglu
curl -s https://zhanglu.net/api/skills/zhanglu.json | jq -r .skill_md > ~/.claude/skills/zhanglu/SKILL.md
```

注意这样装回去之后它在本机是 `handwritten: false` 的普通 skill，但仓库里那份是
`handwritten: true` —— **sync 不会用本机版覆盖仓库版**，这是故意的（仓库是这个 skill 的事实源）。
