# 2026-07-21 · C-suite 长文的公众号排版版 + 标题迭代

## 目标

用户要把站内长文 `/posts/c-suite-design` 发到自己的微信公众号，且"秀米这些太难用了"，要我直接把版排好、他贴到公众号后台即可。随后要求"标题换一个更抓人的"。

## 改动

- `docs/c-suite/wechat-draft.md` — 新增。把 `/posts/c-suite-design` 改写成适合公众号的 markdown：外链转纯文本、表格转列表、logo 段落留配图占位、末尾补三个产品入口 + 「阅读原文」指引。沿用 `docs/agent-cli/wechat-draft.md` 的先例（公众号草稿入库）。
- `docs/c-suite/wechat-draft.md` — 第二次改：标题 `AI 原生组织的 C-suite，需要一套什么样的决策智能体` → `当整个公司都跑在 AI 上，唯独老板还在拍脑袋`（全文最尖锐的那句，和正文"唯独顶层判断还停留在会议室的直觉里"呼应）。
- **临时产物（scratchpad，未入库）**：
  - `gen-wechat.mjs` — 生成器，把内容按"全内联样式"渲染成公众号可粘贴 HTML。
  - `csuite-wechat-ready.html` — 发布成 artifact 的内容（打开→全选→复制→贴后台）。
  - `公众号-C-suite-排版版.html` — 发给用户的独立文件（同内容，可本地打开复制）。
  - `c-suite-mark.png`（1200×1200）— 正文配图，由 `public/brand/c-suite-mark.svg` 经 sharp 渲染，并 data-URI 内嵌进排版 HTML。

## 验证

- 无 `pnpm build`：本次只动 `docs/`（不参与站点构建），src/public 未改。
- 用 Playwright 截 `file://` 全页预览（`wechat-preview.png`）确认排版：标题 / 导语面板 / 朱砂左边框小节标题 / 骨架 ASCII 面板 / 三张产品卡 / logo 配图 / 边界 bullet / 页脚入口都正常。
- 换标题后再截顶部（`wechat-top.png`）确认新标题生效。

## 踩坑

- **公众号编辑器只保留内联 `style=""`**，会丢弃 `<style>` 块、class、id。所以排版必须把每个元素的样式全内联（等价于 mdnice/秀米 的产物）。这是"帮你排版直接贴"能成立的关键。
- **正文配图**：从浏览器复制含 data-URI `<img>` 的内容粘进公众号，图片能否自动上传不稳定。已把 `c-suite-mark.png` 单独发给用户兜底（破图就手动传）。
- 外部 Chromium 走不了代理（§9.9），但本次截的是 `file://` 本地页，不受影响。

## 结论与交付物

- **artifact（可粘贴排版版）**：`https://claude.ai/code/artifact/0a7fe961-607a-4cda-9a09-0d7d3d43f790`（换标题后原地更新，URL 不变）。
- 独立 HTML 文件 + `c-suite-mark.png` 已发用户。
- `docs/c-suite/wechat-draft.md` 入库（含新标题）。
- 尾巴：公众号的标题字段 / 作者 / 封面 / 「阅读原文」（填 `zhanglu.net/posts/c-suite-design`）需用户在后台手动填；发布动作本身 agent 做不了（无公众号 API）。
