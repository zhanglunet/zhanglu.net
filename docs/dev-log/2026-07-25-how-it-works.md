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
