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

---

## 追加：上线后核验发现「删了但还在」—— CF 在服务旧副本

push 上 main、CF Pages 部署成功后逐条核验，结果**只有一半是好的**。

### 好的部分（源站已干净）

| 检查 | 结果 |
|---|---|
| `/api/skills.json` | `lang=zh count=41`，`aic-` 命中 **0**，含 `zhanglu` ✓ |
| `/en/api/skills.json` | `lang=en count=41`，`aic-` 命中 **0**，含 `zhanglu` ✓ |
| `/api/index.json` counts | `{projects:8, articles:5, presentations:4, skills:41, weekly:1}` ✓ |
| `/api/search.json`、`/en/api/search.json`、`/llms.txt` | `aic-` 命中 0 ✓ |
| `/api/skills/zhanglu.json`、`/en/api/skills/zhanglu.json`、`boss.json` 双语 | 200 ✓ |

### 坏的部分：13+ 个已删 URL 仍返回 200 且内容完整可读

```
https://zhanglu.net/skills/crm-saf/        → 200
  正文可读：「crm-saf 服务 CLI skill：该服务用于企业CRM中的销售预测管理，
            支持销售预测实例的新增、变更、合并、版本生成、审批流转以及批量导入…」
https://zhanglu.net/api/skills/bt.json     → 200（完整 JSON，含美团/高德/滴滴对接那句）
```

**判定为缓存而非部署失败的证据** —— 同 URL 加 cache-buster：

```
/skills/crm-saf/       → 200
/skills/crm-saf/?cb=1  → 404      ← 源站干净
/api/skills/bt.json    → 200
/api/skills/bt.json?cb=zzz1 → 404
```

旧副本的响应头特征，和现役页面/从未存在过的 URL 三方对照：

| URL 类型 | 状态 | cache-control | 其它 |
|---|---|---|---|
| 现役（`/skills/`、`/api/skills.json`） | 200 | `public, max-age=0, must-revalidate` | `cf-cache-status: DYNAMIC` |
| **已删**（`/skills/crm-saf/`） | **200** | **`public, s-maxage=604800`** | **`x-robots-tag: noindex`**, `age: 43875` |
| 从未存在（`/api/skills/never-existed-xyz.json`） | 404 | `no-store` | — |

`x-robots-tag: noindex` + 7 天 `s-maxage` 这组合专属于「曾经存在、现在被删」的路径。
`age: 43875`（≈12.2 小时）对得上 07-27 那次自动同步部署的时间。

**而且按 PoP 命中，结果不稳定**：第一轮扫描 `crm-saf` 页面是 404、第二轮同一条是 200；
`bt` / `checkin-paas` / `crm-agent` / `crm-contract` / `crm-linker` 的页面这轮 404、别的轮次可能 200。
**所以「我这里查是 404」不能当成已下线的证据**，必须加 cache-buster 对照，或 purge 完再验。

穷举 17 个 `aic-*` × 4 条路径 + 14 个已删 skill × 4 条路径（共 124 次请求），
本轮抓到 **38 条仍返回 200**，其中 **13 条含内部内容**（12 个 `/skills/crm-*/` 页面 + `/api/skills/bt.json`），
另 25 条是非敏感的旧 skill 页面。

### 结论：这不是仓库能修的

purge 只能在 Cloudflare 侧做，本会话无 CF 凭据。已把机制、判定方法和 purge 步骤写进
**AGENTS §9.13**，并定下规矩：**凡是「下线 / 撤回内容」的改动，push 之后必须 purge 一次再验收**。
新增和修改不受影响（现役页面 `max-age=0, must-revalidate`，部署即生效），**只有删除会卡住**。

需要 purge 的敏感 URL（34 条，17 个 slug × 页面 + 端点）：

```
https://zhanglu.net/skills/{bt,checkin-paas,crm-agent,crm-contract,crm-cust,crm-customer,
  crm-customer2,crm-home,crm-linker,crm-log,crm-prf,crm-report,crm-saf,crm-saf2,
  crm-search,crm-tab,crm-third}/
https://zhanglu.net/api/skills/{同上 17 个}.json
```

实际建议直接 **Purge Everything**（静态站无副作用，也顺手清掉 25 条非敏感残留）。

---

## 追加 2：purge 完全没用 —— 真凶是 Always Online，不是缓存

用户执行了 Purge Everything。复验 124 条已删 URL：**仍然 38 条返回 200，一条没少**。

`age` 从 `43875` 涨到 `46481`（+2606s ≈ 43 分钟，正好是两次核验的间隔）——
**purge 没有重置它**，说明这个副本压根不在被 purge 的那个存储里。响应头早就写着答案：

```
cf-cache-status: DYNAMIC      ← 不是缓存命中，所以清缓存当然没用
cache-control: public, s-maxage=604800
x-robots-tag: noindex
age: 46481
```

我上一轮把 `s-maxage=604800` 当成边缘缓存的证据，**这是误判** ——
`DYNAMIC` 明摆着不是 HIT，我当时没给这条足够权重，导致给用户的第一版修法（purge）是错的。

### 一步定位：拿 Pages 默认域做对照

| URL | `zhanglu-net.pages.dev`（Pages 源） | `zhanglu.net`（走 zone） |
|---|---|---|
| `/skills/crm-saf/` | **404** | **200** |
| `/api/skills/bt.json` | **404** | **200** |
| `/skills/`（现役） | 200 | 200 |

**Pages 源是干净的，问题 100% 在 zone 层。** 这个对照应该是第一步就做的 ——
它一次就把「构建产物有问题」和「托管层有问题」分开了，比反复猜 header 语义快得多。

结论：**Always Online**（Caching → Configuration → Always Online）。它把快照存在普通缓存之外，
源站返 404 时顶上去，并打 `noindex` 免得存档副本被搜索引擎收录。**关掉它，再 purge 一次，再复验。**

AGENTS §9.13 已按这个结论重写：把「purge 就能修」改成「purge 治不了，先关 Always Online」，
并把 `pages.dev` 对照法写成定位第一步。

### 教训

- **`cf-cache-status: DYNAMIC` 时不要谈缓存。** 它直接排除了「边缘缓存」这个解释，
  剩下的可能性（Always Online / WAF / Workers / 存档）都不受 purge 影响。
- **有两个入口的时候先做 A/B**（`pages.dev` vs 自定义域），别在单一入口上反复读 header 猜机制。
- purge 完必须**复验**才能说修好了。这次如果只报「已 purge」就收工，等于把一个仍在外泄的状态
  当成已解决 —— 而 12 个 `/skills/crm-*/` 页面此刻仍能读到内部服务的完整 description。

---

## 追加 3（收尾）：两轮「还在外泄」的报告都是我测错了 —— 容器代理在缓存

用户关掉 Always Online 又 purge 了一次。复验：**还是同样的 38 条 200，一条没变。**
到这里三次结果完全一致（purge 前 38、purge 后 38、关 Always Online 后 38），
说明变量根本不在 Cloudflare 侧 —— 我一直在动错的旋钮。

于是换了两个真正能判定的测试：

```
测试 A：cf-ray 每次请求是否变      → 变（a21c7a5d…/a21c7a61…/a21c7a62…）
测试 B：绕过本地 agent 代理         → 经代理 200，--noproxy '*' 404   ← 决定性
```

**根因是远程会话的 agent 代理（`HTTPS_PROXY`）在缓存响应。** 它 MITM TLS
（环境里那个 `/root/.ccr/ca-bundle.crt` 就是为此），所以能缓存 HTTPS body。
它的缓存副本几乎完美地伪装成了「CDN 旧副本」：

| 观察到的现象 | 我当时的（错误）解读 | 实际 |
|---|---|---|
| 已删 URL 返回 200，正文完整 | CF 在服务存档副本 | 代理缓存命中 |
| `?cb=1` → 404 | 源站干净，CDN 有旧副本 | **代理**的 cache key 变了 |
| `age` 跟真实时间涨 | CDN 对象在老化 | 代理对象在老化 |
| 扛过 Purge Everything | 不是普通缓存 → 猜 Always Online | 压根不在 CF |
| 扛过关 Always Online | 继续往下猜 | 同上 |
| `cf-cache-status: DYNAMIC` | （权重给得不够） | **这条早就排除了 CF 边缘缓存** |
| `cf-ray` 每次都变 | 每次都真到了 CF | 代理条件回源：头是新的，body 是旧的 |

`pages.dev` 那次 A/B 也被这层污染了 —— 它显示 404 不是因为「Pages 源干净」，
而是因为**代理没缓存过 `pages.dev` 那几条 URL**。结论碰巧对了一半，推理过程是错的。

### 直连复验的真实结果

```
124 条已删 URL（17 个 aic-* × 4 路径 + 14 个旧 skill × 4 路径）
  经代理：38 条 200
  直连：   1 条 200          ← 37 条是幻觉
```

| 检查（全部 `--noproxy '*'`） | 结果 |
|---|---|
| 17 个 `aic-*` × 4 条路径（zh/en × 页面/端点） | **全部 404** ✓ 敏感内容彻底下线 |
| 14 个旧 skill × 4 条路径 | 13 个全 404；仅 `/api/skills/mba.json` 仍 200 |
| `/api/skills.json` · `/en/api/skills.json` | `count=41`，`aic-` 命中 0，含 `zhanglu` ✓ |
| `/api/search.json` · `/en/api/search.json` | `count=60`，`aic-` 命中 0 ✓ |
| `/api/index.json` counts | `{projects:8, articles:5, presentations:4, skills:41, weekly:1}` ✓ |
| `sitemap-0.xml` | 130 条 URL，其中 skill URL **82 条 = 41 × 2** ✓，无已删 slug |
| `/skills/zhanglu/`、`/en/skills/zhanglu/`、两语 `api/skills/zhanglu.json`、`boss.json`、两语 `/agents/` | 全 200 ✓ |

唯一残留 `/api/skills/mba.json`：`age` ≈ 2.6 天，`s-maxage=604800` + `x-robots-tag: noindex` +
`cf-cache-status: DYNAMIC`，`?cb=` 和 `pages.dev` 都是 404，**扛过 Purge Everything 也扛过
`Cache-Control: no-cache` 请求头**。内容是个人的 MBA 品牌速读 skill，非敏感；7 天 `s-maxage`
到期自然消失，急就按单 URL purge。

### 代价与教训

**代价**：让用户白做了两件事 —— Purge Everything（无害）和**关掉 Always Online（需要恢复）**。
敏感内容其实在第一次 push + 部署完成时就已经下线了。

**教训**：
1. **容器里核验线上状态一律 `--noproxy '*'`。** 不加就是在读十几小时前的快照。已写成 AGENTS §9.13
   并列了那张「现象 → 误判」对照表，因为每一条单独看都很像 CDN 行为。
2. **三次改动、三次同样的结果 = 变量不在你动的那一侧。** 我第二次拿到「38 条一条没变」时就该
   停下来质疑测量方法，而不是换个 CF 旋钮再试。「改了没变化」是关于**因果链**的信息，不是噪声。
3. **`cf-cache-status: DYNAMIC` 时不要谈边缘缓存。** 这条证据从第一轮就在手里，我给的权重太低，
   反而去追 `s-maxage=604800` 这个更显眼但更弱的信号。
4. **报「还在外泄」的门槛要和报「已修好」一样高。** 误报外泄不是安全的一侧 ——
   它会让人去改生产配置。
