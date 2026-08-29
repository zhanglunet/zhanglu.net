# 2026-08-28 · 代码块深灰字压近黑底，18 个页面全站不可读

## 目标

用户发来一张 `/projects/enterprise-agent-studio` 的截图：「这里背景太黑了，看不清」。
截图里「七步，四次确认」那个代码块的文字几乎与背景同色。

## 不是这一页的问题，是全站的

先量血缘再动手。查生成的 HTML：

```html
<pre class="astro-code github-light"
     style="background-color:#fff;color:#24292e; …">
```

两处配置互相不知道对方存在：

| 位置 | 内容 |
|---|---|
| `astro.config.mjs` 的 `shikiConfig.theme` | `github-light` —— Shiki 给**每个 token 写内联 `style="color:#24292e"`** |
| `src/styles/global.css` 的 `.prose-zh pre` | 强制 `background: #1a1a1a !important` |

**内联样式优先级高于 class**，所以 `.prose-zh pre code { color: inherit }` 根本盖不住。
结果是深灰字 `#24292e` 压在近黑底 `#1a1a1a` 上，对比度 **≈ 1.2:1**。

`grep -rl 'astro-code github-light' dist` → **18 个页面**（两语的 5 个项目详情、
3 篇 MDX 长文、`/skills/zhanglu`）。

**为什么一直没被发现**：手写 `.astro` 的老长文（`agent-cli` / `c-suite-design`）和
`/agents`、`/npm` 里的代码块是纯 `<pre><code>`，不走 Shiki，用的是 `.prose-zh pre` 那套
`#1a1a1a` + `#f3f1ea`，看着完全正常 —— **正好掩盖了这个问题**。
我前几次加项目时截的图也刚好没框到 markdown 代码块。

## 选哪个主题：实测，不靠猜

站上其它代码块（`/agents`、`/npm`）都是 `bg-[#1a1a1a] text-[#f3f1ea]`，
所以方向是**让 Shiki 跟上这个暗底**，而不是把背景改亮。

第一版换 `github-dark` —— 大部分好了，但**浏览器实测发现 6 个代码块仍不达标**：

```
✗ /projects/openworker-zh/  对比度 3.61  rgb(106,115,125) on rgb(26,26,26)  「git clone …」
```

`#6a737d` 是 github-dark 的**注释色**，它是按该主题自己的背景 `#24292e` 调的；
我们强制成更暗的 `#1a1a1a`，bash 里的 `# 注释` 就掉到 3.61:1，低于 WCAG AA 的 4.5。

（顺带：直接静态扫主题 JSON 里的颜色**不可靠** —— 会把主题声明的背景色也当成前景算进去，
噪声很大。真正的判据是浏览器里 `getComputedStyle` 出来的实际值。）

换 `github-dark-high-contrast` 后再测：**26 个代码块最低 8.21:1**，AA（4.5）和 AAA（7）都过。

## 改动

- `astro.config.mjs`：`github-light` → `github-dark-high-contrast`，并写清**为什么**
  （含两处配置的绑定关系、3.61 那个数字、以及「改完必须重测」的做法）
- `src/styles/global.css`：`.prose-zh pre` 上方加注释，指明背景色与 shikiConfig 绑定
- `AGENTS.md` 新增 **§9.14**，含可直接复用的对比度测量代码

## 验证

- `pnpm run build` → Complete，181 页
- **对比度实测**：18 个页面 / **26 个代码块**，逐个 token 算
  `(max(L1,L2)+0.05)/(min(L1,L2)+0.05)` 取最小值 → **最低 8.21:1，全部 ≥ 4.5** ✓
- `grep -rl 'astro-code github-light' dist` → **0**；`github-dark` 系 → 18 ✓
- **移动端**：6 个含代码块的页面 × 2 宽度（390/360）**12 项无横向溢出**（`wrap: true` 生效）
- **截图复核**：用户截图的那一段现在清晰可读；带 bash 注释的块语法高亮正常，
  `# 另一个终端` 清楚可辨

## 教训

1. **两处配置耦合但互不引用 = 定时炸弹。** 修完在两边都写了注释互指，
   下次谁动其中一个都会看到另一个。
2. **「有一类内容看着正常」会掩盖问题。** 手写 `.astro` 代码块正常，
   让这个 bug 活到了 18 个页面。以后加视觉检查要**按渲染路径分类**取样，
   不能只挑手边顺眼的页面截图。
3. **对比度要算，不要看。** 第一版 `github-dark` 肉眼看着"挺好"，实测才发现注释色不达标。
   眼睛对暗底上的中灰特别宽容。
