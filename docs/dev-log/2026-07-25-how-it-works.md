# 2026-07-25 · 站点架构说明：文档 + 双语页面 + 主页入口

## 目标

用户：「整个网站如何运作，是什么结构，做一个清晰的图示，生成文档和网页，放到主页上」。
即四件事：讲清结构、画图、出**文档**、出**网页**并从主页可达。

## 先量后写（避免又写死数字）

动手前先数了一遍真实产物，结果纠正了我自己之前说过的两个数字：

| | 之前说的 | 实际 |
|---|---|---|
| JSON 端点 | 「22 个（11 类 × 2）」 | **24 个端点类型（12 类 × 2）** —— weekly 加进来后类型从 11 变 12 |
| 生成的 JSON 文件 | 没提 | **96 个**（每语 48：9 个平铺 + 8 项目 + 30 skill + 1 周报详情） |

`AGENTS.md` §11 里那句「22 个 JSON 端点」因此过时了，一并修正。
**教训重复验证了一次**：凡是我口头报过的数字，落到文档前都要重新量。

## 改动

**文档（维护者向）**
- `docs/architecture.md` — 新增。9 节：一句话结论、全景数据流（ASCII 图）、五类内容矩阵、
  一个文件七处消费、双语实现、机读层、设计约束表（每条写清**为什么**）、目录地图、从改字到上线。

**页面（读者向，双语）**
- `src/pages/how-it-works.astro` + `src/pages/en/how-it-works.astro` — 新增。
  - **主图**：四层（内容源 → 契约 → 构建 → 产物）+ push → CF Pages → 四类消费者。
    产物层用朱砂框强调，内含 6 个计数块。
  - **fan-out 图**：`projects/boss.md` → 7 处产物（页面 / 列表卡 / 首页精选 / 两个端点 / 搜索语料 / RSS+sitemap），
    每处标出消费者是人还是 agent。这是解释「为什么值得这么组织」最有力的一块。
  - 内容矩阵表、双语机制表（7 行）、机读层图、6 条设计约束、上线流程。
  - **所有数字 build 时算**：集合篇数、端点类型数、JSON 文件数都从 `getCollection` 与常量列表推出来。

**入口**
- 首页（双语）：「往期作品」之前插一张卡片 —— 一句话结论 + 一条 mini 流水线
  （markdown → Zod 校验 → Astro build → 页面·JSON·RSS → CF Pages）+「看架构 →」。
- Footer（双语）：新增「架构 / Architecture」链接；`src/i18n/ui.ts` 两语各加 `footer.arch`。
- `AGENTS.md`：§3 目录树补 `how-it-works.astro` 与 `docs/architecture.md`；§11 端点计数修正。

## 验证

- `pnpm run build` → **Complete，109 页**（107 → +2 个 how-it-works）。
- 计数正确性：两语页面都渲染出 `24 个端点类型` / `12 类 × 2 语言 → 96 个 JSON 文件` / `共 48 篇 × 2`，与实际产物一致。
- 入口：两语首页各 1 张卡片；Footer 两语链接指向各自语言版本；hreflang 三链正确
  （zh-CN → `/how-it-works/`、en → `/en/how-it-works/`、x-default → zh）。
- **移动端：4 个页面（zh/en × how-it-works/首页）× 2 个宽度（390 / 360）共 8 项全过** ——
  判据是 `scrollWidth vs clientWidth` + 「溢出元素是否被 overflow 容器兜住」，不看单元素 rect（那会把
  横滑导航和 `<pre>` 里的 code 全报成假阳性）。
- 截图确认：主图、产物层、fan-out、首页卡片渲染正常。

## 踩坑

- **Playwright `clip` 容易算错**：用 `boundingBox` 手算 clip 区域会撞
  「Clipped area is either empty or outside the resulting image」。
  改用 **element-scoped 截图**（`locator.screenshot()`，配合 `xpath=..` / `following-sibling` 定位祖先或兄弟节点）
  就完全不用算坐标，更稳。
- 想用字符串替换从中文页"生成"英文页失败了：一处 note 文案记错（`脱敏公开版` 写成 `脱敏公开周报`）导致断言失败。
  **长模板文件直接整写英文版更可靠**，字符串外科手术只适合少量精确替换。

## 结论与交付物

- 文档：`docs/architecture.md`
- 页面：`/how-it-works` · `/en/how-it-works`
- 入口：双语首页卡片 + 双语 Footer 链接
- 两个数字口径被纠正并写进 AGENTS，避免继续传播

---

## 追加（同日）：导航入口 + skills 自动更新

用户追问两点：`/how-it-works` 找不到；`/skills` 是不是最新、怎么自动保持更新。

### 导航

`Header.astro` 的 nav 数组加 `{ base:'/how-it-works', key:'nav.arch' }`，`ui.ts` 两语加 `nav.arch`
（架构 / Architecture）。现在共 11 项，导航本就是单行横滑（§9.8），390/360px 页面均无横向滚动。

### /skills 的真相：它不会自动更新

`sync-skills.mjs` 读 `~/.claude/skills/` —— **只存在于本机 Mac**。CF Pages 构建机没有这个目录，
所以站上 `/skills` 是「最后一次手动同步并 push」的快照。
实测 `synced_at` 全是 **2026-06-08 / 06-09**，距今约 6-7 周 —— 期间本机新增的 skill 站上都没有。

顺带查出**两个此前没人提的静默缺陷**：

1. **孤儿永不消失**：脚本只新增/更新，本机删掉的 skill 会永远留在仓库和站上。
2. **中英会静默不对齐**：`sync` 只写中文侧，新 skill 在 `skillsEn/` 没有对应文件 →
   `/en/skills` 少内容，而且**不会构建失败**（没有 1:1 强制约束）。

### 改动

- `scripts/sync-skills.mjs` 升级：
  - `--check` 只读不写、有漂移 exit 1（给 hook / 定时任务用）
  - `--prune` 删除非 handwritten 的孤儿（handwritten 的只报告，去留由人定）
  - 始终报告孤儿清单与中英缺失清单
- `scripts/auto-sync-skills.sh` 新增：同步 → 校验 → 构建 → 提交 → 推送一条龙。
  安全设计：无改动不提交、构建不过即中止、`--ff-only` 拉取、只 `git add src/content/skills`。
- `package.json`：加 `sync:check` / `sync:auto`
- `AGENTS.md` §5.4.1（不会自动更新 + 三条自动化路径 + launchd plist 模板）、§5.4.2（两个坑）

### 验证

- `--check` 在本容器实跑：报出 10 created + 16 孤儿 + 14 handwritten 孤儿，exit 1，
  **且 `git status` 干净 —— 确认只读不写**。（容器的 `~/.claude/skills` 与用户 Mac 不同，正好当测试夹具。）
- `bash -n` 通过；`pnpm build` Complete（109 页）；导航两语渲染正确，移动端 4 项检查无横滑。

### 留给人的一步

同步必须在有 `~/.claude/skills` 的那台机器上跑 —— agent 在远程会话里做不到。
建议先 `pnpm run sync:check` 看漂移，再决定手动跑还是装 launchd 定时任务。

### 追加 2：launchd 粘贴块在 zsh 里翻车（真实用户复现）

用户粘贴 §5.4.1 的块，撞出 `zsh: command not found: #`：macOS 默认 zsh 交互态
**不认行内 `#` 注释**，`REPO=… # 注释` 变成给命令 `#` 的临时赋值 → `REPO` 为空 →
plist 里脚本路径写成 `/scripts/auto-sync-skills.sh`（`launchctl print` 的 arguments 铁证），
服务装上了但 kickstart 立刻失败，错误落在 `.err`（stdout 无内容，`.log` 不存在，tail 报 no such file）。
`plutil -lint` 全程报 OK —— XML 合法、路径错误，静默得很。

修复：§5.4.1 的命令块去掉全部行内注释（说明移到块外散文），`launchctl print` 改 grep arguments
以便一眼核对路径；新增 §9.11 记这个坑。另外提醒了用户：**`launchctl print` 会连继承的环境变量
一起打印**，这次粘贴因此把一个 API key 的明文带进了对话（值没进过仓库，已建议轮换）。
以后要贴 `launchctl print` 的输出，先 `grep` 出你要看的那几行，别整段贴。
