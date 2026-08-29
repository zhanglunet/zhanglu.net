import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://zhanglu.net',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'zh',
        locales: { zh: 'zh-CN', en: 'en' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      // ⚠️ 这一行和 global.css 的 `.prose-zh pre { background: #1a1a1a }` 是**绑定**的。
      // Shiki 把每个 token 的颜色写成**内联 style**，内联优先级高于我们的 class 规则，
      // 所以主题必须是暗色系 —— 曾经是 github-light，深灰字(#24292e) 落在近黑底上，
      // 对比度约 1.2:1，18 个页面的代码块全部读不出来。
      //
      // 为什么是 high-contrast 而不是普通 github-dark：普通版的注释色 #6a737d
      // 在 #1a1a1a 上只有 3.61:1，低于 WCAG AA 的 4.5:1（bash 注释首当其冲）。
      // 换成 high-contrast 后实测 26 个代码块**最低 8.21:1**，AAA 也过。
      //
      // 改这一行之后必须重测，别只看一眼截图：
      //   起 preview → 遍历含代码块的页面 → 逐个 token 算
      //   (max(L1,L2)+0.05)/(min(L1,L2)+0.05)，取最小值。
      theme: 'github-dark-high-contrast',
      wrap: true,
    },
  },
});
