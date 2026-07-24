import type { Locale } from './utils';

/** Shared UI strings. Page-unique prose lives in each page/en page file, not here. */
export const ui = {
  zh: {
    'nav.home': '首页',
    'nav.projects': '项目',
    'nav.csuite': 'C-suite',
    'nav.presentations': '展示',
    'nav.writing': '文章',
    'nav.weekly': '周报',
    'nav.skills': 'Skills',
    'nav.agents': 'Agents',
    'nav.about': '关于',

    'toggle.label': 'EN',
    'toggle.aria': '切换到 English 版本',

    'footer.built': '用 Astro + Cloudflare Pages 搭建。',
    'footer.brand': '品牌',
    'footer.rss': 'RSS',

    'common.all': '全部 →',
    'common.details': '详情',
    'common.visit': '访问 →',
    'common.open': '打开 →',
    'common.onsite': '站内',
    'common.back': '← 返回',

    'card.builtFor': '为 {x} 设计',
    'card.loc': '≈ {x} 行',
    'card.locTitle': '源码行数（cloc 统计，排除文档/数据/生成物）',
    'card.shot': '{x} 网站截图',

    'pres.deck': '网页 PPT',
    'pres.site': '站点',

    'src.wechat': '公众号',
    'src.substack': 'Substack',
    'src.blog': '博客',
    'src.x': 'X',
    'src.other': '其它',

    'social.wechat': '微信公众号',
    'social.qropen': '[展开二维码]',
    'social.qrclose': '[收起]',
    'social.qralt': '{x} 二维码',
    'about.contact': '联系',
  },
  en: {
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.csuite': 'C-suite',
    'nav.presentations': 'Decks',
    'nav.writing': 'Writing',
    'nav.weekly': 'Weekly',
    'nav.skills': 'Skills',
    'nav.agents': 'Agents',
    'nav.about': 'About',

    'toggle.label': '中文',
    'toggle.aria': 'Switch to Chinese',

    'footer.built': 'Built with Astro + Cloudflare Pages.',
    'footer.brand': 'Brand',
    'footer.rss': 'RSS',

    'common.all': 'All →',
    'common.details': 'Details',
    'common.visit': 'Visit →',
    'common.open': 'Open →',
    'common.onsite': 'On-site',
    'common.back': '← Back',

    'card.builtFor': 'Built for {x}',
    'card.loc': '≈ {x} LOC',
    'card.locTitle': 'Lines of code (cloc; excludes docs/data/generated files)',
    'card.shot': '{x} screenshot',

    'pres.deck': 'Web deck',
    'pres.site': 'Site',

    'src.wechat': 'WeChat',
    'src.substack': 'Substack',
    'src.blog': 'Blog',
    'src.x': 'X',
    'src.other': 'Other',

    'social.wechat': 'WeChat Official Account',
    'social.qropen': '[show QR]',
    'social.qrclose': '[hide]',
    'social.qralt': '{x} QR code',
    'about.contact': 'Contact',
  },
} as const;

export type UIKey = keyof (typeof ui)['zh'];

export function useTranslations(lang: Locale) {
  return function t(key: UIKey, vars?: Record<string, string | number>): string {
    let s: string = ((ui[lang] as Record<string, string>)[key]) ?? (ui.zh as Record<string, string>)[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace('{' + k + '}', String(v));
    return s;
  };
}
