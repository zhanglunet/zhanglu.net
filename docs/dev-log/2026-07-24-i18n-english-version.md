# 2026-07-24 · 全站英文版：双语 i18n（浏览器自适应 + 手动切换）

## 目标

用户："全站做一个英文版本，可以浏览器自适应显示版本，也可以手动切换中文版本和英文版本。" 即：中文默认 + 英文全站 + 首访按浏览器语言自动切 + 页头手动切换。

## 架构决策（技术选型自定，用户确认了范围=全站）

- **URL**：zh 在根 `/`，en 在 `/en/` 子路径（Astro `i18n`，`prefixDefaultLocale:false`）。
- **内容**：每集合加平行 `*En` 集合（同 schema），en 内容进 `src/content/<coll>En/`。**zh 集合零改动**——不走"同集合 en/ 子目录 + 到处过滤"的方案，避免动 12+ 处 zh 消费端。
- **语言检测**：组件 `getLangFromUrl(Astro.url)` 自检，不层层传 props。
- **UI 文案**：`src/i18n/ui.ts` 字典（zh/en）；页面独有散文写各自 en 页。
- **自适应**：`Base.astro` head 内联脚本，首访无偏好按 `navigator.language` 跳；切换按钮写 `localStorage['site-lang']`，之后以选择为准。

## 改动（文件清单）

**框架**
- `astro.config.mjs`：i18n + sitemap i18n。
- `src/i18n/utils.ts`、`src/i18n/ui.ts`：helpers + 双语字典。
- `src/layouts/Base.astro`：lang 感知、hreflang 三链、og:locale、分语言 RSS、自适应脚本。
- `src/components/{Header,Footer,ProjectCard,ArticleCard,SkillCard,PresentationCard,SocialLinks}.astro`：自检语言 + 本地化链接/标签；Header 加中/EN 切换按钮。
- `src/content/config.ts`：加 5 个 `*En` 集合（复用 schema）。
- `src/data/about.en.json`、`src/data/social.en.json`。

**内容翻译（Workflow 并行，9 agents）** → `src/content/{projects,skills,presentations,articles,weekly}En/`：projects 8 + skills 30 + presentations 4 + articles 5 + weekly 1 = 48 个 md。

**en 页面镜像**（`src/pages/en/`，53 页）：手写 home + 各 list/detail + en RSS；Workflow（6 agents）翻 c-suite/index、c-suite/brand、brand、agents、posts/c-suite-design、posts/agent-cli 6 个散文重页。

**文档**：`AGENTS.md` §16（双语架构 + 常见更新 + 禁忌）。

## 验证

- `pnpm run build` → **Complete，106 页（53 zh + 53 en），无回归**。zh 输出不变。
- 全 en 页扫描：除 `中文` 切换按钮 + `en/brand` 里刻意保留的「张路 / 路」（解释名字含"路"=road 的 logo 用意）外，**零中文残留**。
- 链接：en 页内部导航→`/en/…`，资源/`/api`/外链/锚点原样，切换按钮双向正确。
- SEO：hreflang（zh-CN/en/x-default）+ sitemap i18n + `<html lang>` 全部生效。
- **Playwright 运行时测**（preview localhost）：① en 浏览器访问 `/`→自动跳 `/en/`；② zh 浏览器→留 `/`；③ 点「中文」→跳 `/` 并存 pref=zh；④ 存了 zh 后再访 `/en/`→跳 `/`（选择优先于浏览器语言）。四条全过。
- 截图：en 首页桌面 + 手机 + en/c-suite，排版正常、手机端无横向溢出。

## 踩坑

- **翻译引入 YAML 报错**：英文 frontmatter 单行值里出现半角 `: `（冒号+空格）被 YAML 当成嵌套 mapping → build 挂。中文原文用全角「：」所以没事。扫描 48 个 en md，命中 2 个（articlesEn/c-suite-design、presentationsEn/boss-handbook），给值加双引号解决。**教训：翻译产出的 frontmatter 要 YAML 校验一遍。**（已属可复现坑，见 §9 可补。）
- **恒定中文字数错觉**：每个 en 页恒有 34 个中文字，起初以为泄漏，实为 Base 自适应脚本的中文注释（32）+ 切换按钮「中文」（2）。注释改英文后基线归零，才看清唯一真实"残留"是 en/brand 的刻意保留。
- **半成品不能上 main**：自适应脚本假设每路径两语都在，en 站没补全前推 main 会让英文访客 404。所以框架+切片先只推 branch，等 53 en 页全齐、build 绿、运行时测过，才 ff main。

## 结论与交付物

全站中英双语上线：`/` 中文、`/en/` 英文，53×2 页。浏览器自适应 + 页头手动切换 + 记住选择，全部按用户要求实现并运行时验证。架构写进 AGENTS.md §16，后续加内容/页面按那里的双写约定走。
