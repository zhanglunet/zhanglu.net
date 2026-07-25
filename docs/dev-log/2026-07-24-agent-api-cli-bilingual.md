# 2026-07-24 · Agent 接入层：CLI 名副其实（A）+ API 支持英文（B）

## 目标

用户问「zhanglu.net 现在能不能用 CLI 访问」，5 路并行核验后发现接口和指南都在、但 `npx zhanglu-net` **包从没发到 npm**（registry 404），站上到处教用户用它。用户要求 A、B 都做：

- **A 让 CLI 名副其实**：修 version 双处漂移、`list presentations` 缺失、`help <command>` 假承诺 + 文档漂移。
- **B 让 API 支持英文**：`/en/api/*`、英文语料进 search、llms.txt 标双语、补 404。

## 关键决策：先抽共享 builder，再加英文

10 个 zh 端点各自内联字段形状，已经漂过一次（列表有 `loc/persona/cover`、详情没有）。
直接手抄一套英文端点 = 漂移翻倍。所以先建 `src/lib/api.ts`：字段只定义一次，
zh / en 端点都只负责「取哪个集合 + 传哪种语言」。20 个端点文件由一份模板生成，结构逐字一致。

## 改动

**新增共享层 + 端点**
- `src/lib/api.ts` — 全部字段形状与 builder（含 `langPrefix` / `jsonResponse` / `siteBase`）。
- `src/pages/api/*`（10 个，重写成薄包装）+ `src/pages/en/api/*`（10 个新增）。
- 顺手修好字段漂移：`projects/{slug}.json` 现在也有 `loc` / `persona` / `cover`。
- 每个响应新增 `lang` 字段；`index.json` 新增 `languages` 交叉链接。

**CLI（`cli/bin/zhanglu-net.mjs`，330 → 534 行）**
- version 改为 `createRequire` 读 `package.json` —— 单一来源，不再双处漂移。bump 0.1.0 → **0.2.0**。
- `KINDS` 表驱动：新增 `presentations`（`list` + `get` 都支持），加类型只改一处。
- `--lang zh|en` + `ZHANGLU_LANG`，打 `/en/api/*`。
- `help <command>` 真的分命令（原来忽略参数）；`-h` 在任意位置都认（原来只认 argv[0]）。
- 校验：`--limit abc`、`--source` 用错类型、`--lang de`、`--md` 用在无正文类型 —— 全部明确报错 + exit 1（原来静默返回空 = 假成功）。
- **修 EPIPE 崩溃**：`... | head` 会让 Node 抛未捕获 EPIPE 打一屏堆栈。对一个主要在管道里被调用的 CLI 是硬伤。
- `cli/README.md` 重写（双语用法 + 无 npm 时跑源码的路径）。

**404 / 自发现 / 头**
- `src/pages/404.astro` — **双语**（CF Pages 只服务一个根 404.html）。不存在路径从 200+首页变成真 404。
- `Base.astro` 加 `noLangRedirect` prop，错误页不按语言自动跳。
- `public/llms.txt` 重写 + 新增 `public/en/llms.txt`，互相指路 + 说明 `/en` 前缀规律。
- `public/robots.txt` 提到两套 API。
- `public/_headers` — 显式钉住 `Access-Control-Allow-Origin: *`（原来线上 ACAO 靠 CF 默认行为，未声明）。

**文档去漂移**
- `/agents` + `/en/agents`：补 `presentations` 端点行、加双语说明框、加 `--lang` flag、加 `help <command>`、npm 不可用时的源码跑法。
- **行数改为 build 时 `readFileSync` 数出来**（原写死 270，实际 534）—— 从此不可能再漂。
- `/en/agents` 端点表全部指向 `/en/api/*`（原来指向中文端点，页面却承诺英文样例，是审计发现的实锤不一致）。
- `posts/agent-cli`（中英）：**不改写历史**（9 端点 / 270 行是 2026-06-09 当天的史实），改为加一条「后续更新」注记，指向 `/agents` 与 `/llms.txt` 为准。
- `docs/agent-cli/design.md`：`❌ i18n 端点` 这条决策标记为**已推翻**并写清新方案。
- `AGENTS.md` §14：双语说明、§14.4 流程改成双写 9 步、§14.5 新增 3 条禁令（别内联字段 / 别只加一边 / 别写死会漂的数字）、§14.1 表补 404 与双语行。

## 验证

- `pnpm run build` → **Complete，107 页**（zh 46 + en 46 个 API 文件）。
- 端点：zh / en × 10 类全部 **200**；`/llms.txt`、`/en/llms.txt` 200；`/api/bogus.json`、`/nope` → **404**（软 404 已修）。
- 内容：`/api/about.json` = `张路`，`/en/api/about.json` = `Zhang Lu`（审计发现的「承诺英文实际中文」已修）。
- 搜索：`--lang en search "brand judgment"` → **3 hits**（原来 0）；中文语料搜英文词时给出「试 --lang en」提示。
- CLI：**27 条实跑全过**（12 命令 × 2 语言 + help/help list/version）；错误路径 6 条全部 exit 1 且信息明确；`| head` 不再崩。
- 文档：`/agents` 与 `/en/agents` 渲染出 `534`（与 `wc -l` 一致）。

## 踩坑

- **静态构建吞掉端点里设的响应头**。Astro static 只把 body 写成文件，`new Response(..., {headers})` 的头不落盘 —— 所以 CORS 实际由托管层给。线上此前正常纯属 CF 默认行为。已用 `public/_headers` 显式声明。别再假设端点里写了头就一定生效。
- **EPIPE**：任何给 agent / 管道用的 Node CLI 都该在开头吞掉 stdout/stderr 的 EPIPE，否则 `| head` 必崩。
- `pnpm preview` 用 `&` 起在某些情况下会被 shell 回收（exit 144），改 `nohup ... &` 稳定。

## 结论与交付物

Agent 接入层现在双语齐备：`/api/*`（中）+ `/en/api/*`（英），CLI 一个 `--lang` 切换，
不存在路径给真 404，自发现文件双语互链，文案里会漂的数字改成 build 时计算。

**留给人做的一步**：`cd cli && npm publish --access public`（需要 npm 登录态，agent 做不了）。
名字 `zhanglu-net` 在 npm 仍空闲。发布后站上所有 `npx zhanglu-net` 文案立即成真；
在此之前 `/agents`、`llms.txt`、README 都已给出 `node cli/bin/zhanglu-net.mjs` 的替代跑法，
所以文案不再是空头承诺。

> **✅ 已完成（2026-07-25）**：用户在本机发布了 `zhanglu-net@0.2.0`。
> 独立复核：registry `latest = 0.2.0`、`bin.zhanglu-net` 完好、零依赖、unpacked 24,335 bytes；
> 从干净环境 `npx -y zhanglu-net@latest` 拉包打线上，中/英文命令与英文搜索全部正常。
> 至此站上所有 `npx zhanglu-net` 文案对外成立。AGENTS §14.3 已从"第一次发"的待办口气改为
> "已发布 + bump 流程"。
>
> 过程中的一个环境细节：本机没装 nvm、Node 是 Homebrew 的 v25.8.2。查证后确认无需装版本管理器 ——
> CLI 只要 `>=18`，且 v25 落在 Astro 声明的 `>=22.0.0` 内，`.nvmrc` 的 22 只服务 CF Pages 构建。

**已知未做**：线上 `robots.txt` 被 Cloudflare 注入的 Managed content 段仍对 ClaudeBot / GPTBot 等 `Disallow: /`
—— 那是 CF dashboard 的设置，改不到仓库里。

---

## 追加（同日）：`/api/weekly.json`

用户要求把漏掉的 weekly 端点补上。因为字段形状已经收在 `src/lib/api.ts`，这次是**照流程走**而不是再造轮子：

- `src/lib/api.ts` — 加 `buildWeeklyList` / `buildWeeklyDetail`（`weeklyCore` 保证列表与详情不漂），
  `buildSearch` 加 weekly 语料，`buildIndex` 加 `weekly` count + `weekly` / `weekly_entry` 端点。
- 生成器加两个模板 → `api/weekly.json.ts`、`api/weekly/[slug].json.ts` × zh/en（共 24 个端点文件）。
- CLI：`KINDS` 表加一行 `weekly: { singular: 'weekly', perSlug: true }` —— `list` / `get` / 帮助文本
  **全部自动跟上**（这就是上一轮把它做成表驱动的回报）。另加 weekly 显示分支
  （否则会掉进 project 分支打出 `(undefined, undefined)`）、`--type weekly`、badge。
- 文档：`llms.txt` ×2、`/agents` ×2 端点表、AGENTS §14.1 表。

**顺带修好一个没人提的漏**：weekly 原本**不在 `/api/search.json` 语料里**（48 条 = 8+5+4+30+1，
漏了 weekly）。现在 49 条，zh/en 都含。

验证：build Complete（107 页）；`weekly.json` + `weekly/2026-w29.json` × zh/en 全 200；
zh 列表 `本周做了什么 · 2026-W29`，en 详情 `What I Shipped This Week`；
search 两语各含 1 条 weekly；CLI `list weekly` / `get weekly` / `--lang en get weekly --md` /
`search --type weekly` 全过，`list <kind>` 五类 × 两语回归全绿。
（`search "周报"` 是 0 命中 —— 那篇周报正文里确实没有"周报"这个词，`"本周"` 能命中，属正确行为。）
