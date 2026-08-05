# 2026-08-01 · 新增项目：OpenWorker 中文站（oaosf.cn）

## 目标

用户：「https://oaosf.cn，加到主站 zhanglu.net/projects/ 的项目下」。

## 先弄清它到底是谁的东西

抓站之后发现这个项目的**归属关系比前四个复杂**，写之前必须先厘清，否则很容易写成
「张路做了一个桌面 AI coworker」——那是错的。

| 层 | 归属 |
|---|---|
| OpenWorker 本体 | **`andrewyng/openworker`**，MIT，作者 Andrew Ng |
| 中文站 oaosf.cn | 本项目 |
| 中文版 macOS 构建（0.1.7） | 本项目，仓库 `zhanglunet/openworker-zh-localized` |
| 源码深度分析 + 交互式信息图 | 本项目 |

所以正文第一段就写「OpenWorker 是……（MIT，作者 Andrew Ng）」，再写「**这个项目是它的中文侧**，
三件东西」。`repo` 字段指 `openworker-zh-localized`（本项目真正维护的那个），上游在正文里带链接。

## 改动

- `src/content/projects/openworker-zh.md` + `projectsEn/openworker-zh.md`
  - `order: 12`（rebase 后避开远端新加的 `free-model-port`）、`featured: true`、`status: beta`
  - `tech: [Tauri 2, React, FastAPI, MCP, 本地优先]`
- `public/covers/openworker-zh.webp`（1200px / q78 / 38KB，走 §9.9 wget 镜像 → 截 `file://`）
- `AGENTS.md` §11：projects → **14**、页面 → **159**、JSON → **136**（rebase 合入远端的 `/npm` 页、`free-model-port` 与新周报之后重测）

正文里写进去的、站上自己给出的**技术判断与批评**（不是我编的，也没有美化）：

- 源码分析的总体判断：**不是「套壳聊天应用」，是一套本地 Agent 运行平台**，壁垒在工具循环、
  权限系统、连接器和持久化，不在某个模型
- `TurnEngine` 的取舍：**并发读取、串行写入** —— 低风险读取并发，写入 / Shell / 未标注工具保持严格顺序
- 权限四级：`READ` 直接执行 / `WRITE_LOCAL` 按模式批准且受可写目录约束 / `EXEC` 重点确认
  （复杂 Shell 不能自动命中白名单）/ `EXTERNAL` 目标级授权
- **工程热点（站上自己写的批评）**：`server/manager.py` 已超 4000 行、连接器执行层近 5000 行，
  后续维护需要继续拆分边界
- 统计取自 `main@01b6f83`，且**是代码资产数量，不代表本站跑过原项目测试**

以及四条边界，照抄不改口径：

1. **「本地优先」是一条边界，不是绝对承诺** —— 选云端模型或启用外部连接器时，数据仍会发出去；
   要完全本地就用 Ollama 且不启用外部连接器
2. 当前构建**未经公证**，首次打开可能要右键「打开」
3. 官方仍标 **Open Beta**
4. 0.1.7 才把自动更新源切到中文仓库 —— 在此之前**更新完会变回英文版**

第 4 条其实是这个项目存在的直接理由之一，所以放进了「为什么做」。

## 验证

- `pnpm run build` → **Complete，159 页**（rebase 后含远端改动；我这两个页面是其中 +2）
- **中英对齐**：projects `zh=14 en=14`，缺失 0、多出 0
- **端点**：两语 `projects.json` 均 `count=14`；`index.json` counts `{projects:14, articles:10, presentations:4, skills:42, weekly:3}`；search zh=en=**74**
- **产物齐全**：zh 页 / en 页 / zh 端点 / en 端点 / 封面 **5 项全 ✓**
- **order**：`1 2 3 4 4 5 6 7 8 9 10 11 12 99` —— 我占 12。
  **`aip` 与远端新加的 `free-model-port` 都是 order 4，撞号了**：这不是本次改动引入的，
  两者相对次序会取决于排序的 tiebreaker。只在 §11 标注了 ⚠️，没有替对方重排 —— 放 4 大概是
  有意的，往后挪谁应该由那位作者决定。
- **移动端**：5 个页面（项目列表双语、详情页双语、首页）× 2 宽度 **共 10 项全过**
- **详情页链接**：3 条外链均正确指向 `oaosf.cn` / `openworker-zh-localized` / `andrewyng/openworker`
- **首页封面**：滚到底后 12 张全部 `complete && naturalWidth>0`
- **截图**：详情页标题 / tagline / `beta` 徽章 / 访问站点 + 源码链接 / tech 标签 / 封面 banner 全部正常

## 踩坑

没有新坑 —— 前四个项目踩过的三条这次直接规避了：

- 镜像后先把带 `?query` 的文件名去掉问号再截图（否则 `file://` 下页面裸奔）
- 判断封面加载先滚到底（`loading="lazy"`）
- Chromium 经代理连不了外站，一开始就走 wget 镜像，没再试别的

## 结论与交付物

- `/projects` 与 `/en/projects` 各 13 个；`/projects/openworker-zh` 双语可达
- 归属关系写准：上游 `andrewyng/openworker`（MIT，Andrew Ng），本项目是中文站 +
  本地化构建 + 源码分析，没有把别人的项目说成自己的

## 追加：rebase 撞上远端的 `/npm` 页面提交

推送被拒，`git fetch` 后发现远端多了 `fb4ef32 add: npm cli guide page`（双语 `/npm` 页 + 导航 +
llms.txt + README），而且顺带还加了 `free-model-port` 项目、一篇长文和两篇周报。

`AGENTS.md` §11 两处冲突（projects 行、页面/JSON 计数）——**都以远端为基准合并**，
把 openworker-zh 加进去，计数一律推倒重来按重新构建后的实测填：
projects 13 → **14**、页面 → **159**、JSON → **136**、search → **74**。

顺手把 §11 的 projects 行改成**逐项标 order**（`mbabrand(1)…openworker-zh(12)`），
因为原来那种「order 8→12」的区间写法在多人并行加项目时**必然对不上**，
也正是它掩盖了 `aip` / `free-model-port` 的 4/4 撞号。

## 追加：按用户要求消掉 4/4 撞号

用户：「把 free-model-port 挪到 12，openworker-zh 排 13」。

`free-model-port` 4 → **12**、`openworker-zh` 12 → **13**（zh / en 四个文件一起改）。
先挪 openworker-zh 到 13、再挪 free-model-port 到 12，避免中途两者同时落在 12 上。

改后 order 序列 `1..13, 99` **无任何重复**，`aip` 独占 4。
两语 `/api/projects.json` 的 items 顺序完全一致，末位仍是 `tui3`（archived）。
§11 的逐项 order 标注同步更新，⚠️ 撞号标记撤掉。

---

## 追加（08-04）：给 free-model-port 与 openworker-zh 各写一篇长文

用户：「给 free-model-port 和 openworker-zh 也各写一篇文章」。

### 一个先要处理的岔路

`openworker-zh` 没有 articles 条目，直接按 §14.7 补「`/posts/<slug>` 长文 + articles 索引」即可。

但 **`free-model-port` 已经有一条 articles 条目**，指向 `https://oaf.asia/stories/free-model-port/`
——那是项目团队自己写的《免费大模型不该靠碰运气》，一篇完整的功能巡礼（七项服务 + 安装步骤），
实测 200、13KB，是货真价实的原始出处。

（我一开始误判成「有条目没页面 = 死链」，`curl` 之后才发现它指向的是外链，`/posts` 索引的
url 前缀过滤本来就把它排除在外，一切正常。**先验证再下结论**。）

三种处理：

| 方案 | 问题 |
|---|---|
| 覆盖它，改指站内 | §5.2 要求 articles 指向**原始出处**，oaf.asia 那篇就是原文，覆盖等于把它从索引里抹掉 |
| 不写站内长文，只留外链 | 用户明确要求「写一篇文章」 |
| **两条并存** ← 选这个 | 我这篇是**另一个角度**（设计取舍），不是原文的改写；两篇都该留在写作索引里 |

所以：`articles/free-model-port.md` **一字未动**（继续指 oaf.asia），
新增 `articles/free-model-port-design.md` 指向站内 `/posts/free-model-port`。
articles 的文件名不必等于 post slug —— 决定路由的是 `url` 字段。

### 两篇的角度

刻意跟已有材料错开，不做复述：

- **《「免费模型清单」是个错的抽象》** —— 不讲功能列表，讲那条设计主线：公开目录只产生**候选**，
  真实请求才产生**可运行**，中间隔着一次实际调用；以及统一路由天然是个高权限中心，
  所以控制面必须留在 `127.0.0.1`；以及「只在首字节前 fallback，流式开始后绝不重放」
  ——在「更高成功率」和「不撒谎」之间选了后者。开头用引用块把读者指回 oaf.asia 原文。
- **《本地化不是翻译：给一个 Agent 运行时做中文版》** —— 两个发现：① 自动更新会把本地化冲掉
  （0.1.7 之前更新一次就变回英文；由此推出「本地化」的完整定义要含**独立更新通道**）；
  ② 读完源码后判断变了，`TurnEngine` 的「并发读取 / 串行写入」和四级权限里
  「复杂 Shell 不能自动命中白名单」两条值得抄。也照写了批评（`manager.py` 超 4000 行）
  和「本地优先是边界不是承诺」。

### 验证

- `pnpm run build` → **Complete，163 页**（159 → +4）
- `/posts` 与 `/en/posts` 各 **8 篇**，索引里每一条都逐个核对**有对应页面，零死链**
- articles zh=12 / en=12，缺失 0、多出 0；`index.json` counts `articles:12`；search 74 → **76**
- **移动端 8 页 × 2 宽度 16 项全过**；两篇新长文里的站内链接逐条 GET **零死链**
- **日期渲染专门复查**（上次踩过 YAML Date 对象的坑）：三个页面都是 `2026-08-04`，没有 ISO 尾巴
- **JSON 文件数仍是 136** —— 一开始按惯性写了 140，实测发现 articles 没有 `[slug]` 详情端点，
  加文章不增 JSON。§11 已按实测改回并注明原因。
