---
title: MBA Brand
tagline: 5 位评委合议给品牌做量化判断
url: https://mbabrand.com
tech: [Claude Skill, Multi-Agent, Cloudflare Pages]
year: 2026
featured: true
status: live
order: 1
---

## 是什么

一套基于 Claude Skill 的品牌判断流水线。给它一个品牌名，它会跑完 5 路并行调研、Lead 评委综合、再让 5 位真实评委（傅盛 / Steve Jobs / 李可佳 / 吴俊东 / 张一鸣）按各自的 mental model 独立打分，最后输出版本化的 Markdown + HTML 报告：

- 5 维度雷达图（reasoning / evidence / counter / falsifiability / real-world resilience）
- 评委异议热力图——哪一条结论分歧最大
- 影响力构造图——品牌资产怎么搭出来的
- 30 / 90 / 365 天 attribution checkpoint，事后回看能 attribute 到具体证据链
- 90 天可执行行动建议

## 为什么做

品牌影响力的判断长期靠"感觉"。两个常见失败模式：

1. **单一视角偏见**：找一个意见领袖问，他的盲区就是你的盲区。
2. **结论无法 attribute**：拍脑袋说"这个品牌挺强的"，半年后业绩崩了，不知道是哪一步错了。

把判断分解成 5 个维度 × 5 个 mental model 的评委 × 5 种打分镜头，每条结论都能追溯回证据。半年后回看，是评委判错、证据不全、还是世界变了，一目了然。

## 你能怎么用

**速读档（3 分钟）**：

```bash
/mba <brand> --quick --no-judges
```

只用 WebSearch + WebFetch，不需要 Mac host、不需要云浏览器、不需要预装 perspective skill。先验证管线再加重。

**完整合议（30 分钟）**：

```bash
/mba <brand>
```

召回默认 5 位评委，或 `--panel <name>` / `--industry <name>` 换行业评委 panel（汽车 / 教育 / 消费等）。

**最深档（含中文社媒）**：

去掉 `--quick`，加上 Wuying 云浏览器 leg，抓 X / 小红书 / Bilibili / 中文媒体的真实信号。

适合：创始人决定品牌方向、品牌 / 增长团队 PMF 复盘、投资人做尽调、AI 产品发布前的"反对意见预演"。
