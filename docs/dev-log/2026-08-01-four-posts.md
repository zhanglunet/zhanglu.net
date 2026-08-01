# 2026-08-01 · 给四个新站各写一篇长文，并把长文写作方式换成 MDX

## 目标

用户：「能不能把这四个网站分别都写一篇文章介绍，然后放到 articles」。

按 §14.7 的约定，`articles/` 是**写作索引**，站内长文是合法的「原始出处」。所以一篇文章 = 两个文件：
`/posts/<slug>` 的长文页 + `articles/<slug>.md` 索引条目（url 指向前者）。双语，共 16 个文件。

## 一个前置决定：新长文用 MDX，不再手写 .astro

既有两篇长文（`agent-cli` / `c-suite-design`）是手写 `.astro`，正文是一堆 `<p>` / `<h2>` / `<ul>`。
要再写 8 篇（4 × 双语）意味着手敲上千行 HTML —— 而且这类文件里写 markdown 的 `**粗体**`
会渲染成字面星号（之前踩过）。

三条路：

| 方案 | 评价 |
|---|---|
| 继续手写 `.astro` | 零风险，但 8 个文件上千行 HTML，且容易犯 markdown-in-astro 的错 |
| 迁到 `src/content/posts` 集合 + `[slug].astro` | §14.7 早写了这条演进路径，但要把既有两篇的定制排版迁过去，**收益不抵风险** |
| **`.mdx` 页面 + 一个 Post 布局** ← 选这个 | 仓库本来就装了 `@astrojs/mdx`；正文写 markdown；**不动既有两篇**，二者共存在同一目录 |

新增 `src/layouts/Post.astro`（长文的壳：meta 行 / h1 / lead / `.prose-zh`），mdx 在 frontmatter 里
`layout:` 指过去即可。既有 `.astro` 长文一行没改。

## 改动

**长文（双语各 4 篇，MDX）**
- `src/pages/posts/{siliconforge,excel-ai-analyst,ai-interview,brain-radar}.mdx`
- `src/pages/en/posts/` 同名 4 篇（英文重写，不是直译）

每篇都从一个**具体问题**切入，而不是罗列功能：

| 文章 | 切入点 |
|---|---|
| 需求进，软件出 | AI 写代码都在服务开发者，但每天被界面折磨的是业务人员 |
| 一张跑了多年的 Excel，就是一套没有文档的遗留代码 | 第一个坎不是算力是信任 —— 所以第 0 步做成断网可用 |
| 让不会讲的人也能被看见 | 评审的两种失真：会说的占便宜、把计划当成果 |
| 机会不是搜不到，是散且有时效 | 稀缺的不是清单，是顺序 |

各站自己声明的限制照写：两级交付口径会让一部分需求停在「执行未通过」、探测只能说「大概是什么」、
雷达是静态快照。**没有把 demo 说成 production。**

**索引（双语各 4 条）**
- `src/content/articles/` + `articlesEn/` 各 4 条，`source: blog`，url 指向各自语言的 `/posts/<slug>`

**顺手去掉一处硬编码**
- `src/pages/posts/index.astro` 与 en 版原本各维护一份**手写的 posts 数组** —— 加文章要改三处，
  必然漂。改成从 articles 集合按 url 前缀（`https://zhanglu.net/posts/`）派生。
  现在加一篇长文只要两个文件，列表页自动跟上。

**文档**
- `AGENTS.md` §14.7：写清 MDX 写法、Post 布局、派生式列表、以及 MDX 的两个坑
- `AGENTS.md` §11：articles 5 → 9、页面 141 → 149

## 验证

- `pnpm run build` → **Complete，149 页**（141 → +8）
- **两语长文页 8 个全部产出** ✓
- **`/posts` 与 `/en/posts` 各列出 6 篇**（2 篇既有 + 4 篇新增），标题计数「共 6 篇」/「6 in total」正确
- **端点**：`articles` zh=9 / en=9；`index.json` counts `articles:9`；search 语料 64 → **69**
- **中英对齐**：articles zh=9 / en=9，缺失 0、多出 0
- **移动端**：10 个页面（`/posts`、`/articles`、4 篇 zh 长文、2 篇 en 长文 × 双语组合）× 2 宽度
  **共 20 项全过**
- **内链可达性**：把 8 篇新长文里所有站内链接逐条 GET 一遍，**零死链**
- **ArticleCard 站内识别**：6 条 `zhanglu.net/posts/` 的 url 会按站内渲染、同 tab 打开（§5.2）
- **`astro check`**：4 个 error 全部落在既有文件（`ArticleCard` / `ProjectCard` / 两个
  `projects/[slug].astro` 的隐式 any），**新增文件零报错**；`build` 不跑 check，未动它们
- **截图**：长文页排版正确（meta 行 / 大标题 / 朱砂竖线 lead / `.prose-zh` 正文），
  内链与行内代码渲染正常

## 踩坑（三个都是 MDX 特有的）

1. **frontmatter 里英文散文的半角 `: ` 会炸 YAML**。
   `lead: Two distortions … in an achievement review: the smooth talker wins` →
   js-yaml 把 `review:` 当成了键。中文原文用全角「：」所以没事，英文版才炸 ——
   **和 07 月翻译全站时踩的是同一个坑**。已统一给 `title` / `description` / `lead` 加双引号，
   并写了个扫描脚本查「未加引号且含半角 `: `」的值。
2. **正文里的裸尖括号会被当成 JSX**：`"static snapshot as of <date>"` →
   `Expected a closing tag for <date>`。包进反引号解决。顺手扫了全部 mdx，只有这一处。
3. **`date: 2026-08-01` 会被 YAML 解析成 Date 对象**，直接渲染出
   `2026-08-01T00:00:00.000Z`。截图才看出来 —— build 不会报错，端点也不受影响
   （端点读的是 articles 集合，那边 schema 有 `z.coerce.date()`）。
   已在 `Post.astro` 里统一格式化，`string | Date` 两种都收。

第 3 条值得单独说：**这是唯一一个 build 绿、端点正确、只有肉眼能发现的问题**。
如果这次没截图，它就上线了。§15.1 那条「视觉/组件改动要截图看一眼」不是形式。

## 结论与交付物

- `/posts` 与 `/en/posts` 各 6 篇；四个新站各有一篇双语长文
- `/articles` 与 `/en/articles` 各 9 条，四条新的指向站内长文，同 tab 打开
- 长文写作方式换成 MDX：加一篇 = 一个 `.mdx` + 一条 `articles` 条目，列表页自动跟上
- 既有两篇手写 `.astro` 长文一行未动
