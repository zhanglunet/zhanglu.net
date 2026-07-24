/**
 * 共享 API builder —— zh 与 en 两套端点共用同一份字段定义。
 *
 * 为什么存在：以前 10 个 zh 端点各自内联字段，已经漂过一次
 * （列表有 loc/persona/cover、详情没有）。加英文版会让漂移翻倍，
 * 所以字段形状只在这里定义一次，端点文件只做「取哪个集合 + 什么语言」。
 *
 * 加字段：改这里 → zh / en 同时生效。别在端点文件里内联字段。
 */

export type Lang = 'zh' | 'en';

/** 站内路径前缀：en 走 /en，zh 走根。 */
export const langPrefix = (lang: Lang) => (lang === 'en' ? '/en' : '');

export function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const siteBase = (site: URL | undefined) =>
  site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

// ── 结构化的最小 entry 形状（与 src/content/config.ts 的 schema 对齐）──

type ProjectEntry = {
  slug: string;
  body: string;
  data: {
    title: string; tagline: string; url?: string; repo?: string; cover?: string;
    tech: string[]; year: number; featured: boolean; status: string; order: number;
    loc?: number; persona?: string;
  };
};

type ArticleEntry = {
  slug: string;
  body: string;
  data: {
    title: string; source: string; url: string; date: Date;
    summary: string; tags: string[]; featured: boolean;
  };
};

type PresentationEntry = {
  slug: string;
  body: string;
  data: {
    title: string; tagline: string; url: string; kind: string;
    cover?: string; year: number; featured: boolean; order: number;
  };
};

type SkillEntry = {
  slug: string;
  body: string;
  data: {
    name: string; description: string; source: string; category?: string;
    featured: boolean; handwritten: boolean; synced_at?: string;
  };
};

type AboutData = {
  name: string; handle: string; tagline: string; bio: string;
  tags: string[]; location: string; avatar: string;
};

type SocialLink = {
  label: string; handle?: string; url?: string; qrcode?: string; icon?: string;
};

// ────────────────────────────── projects ──────────────────────────────

/** 项目公共字段（列表与详情共用，保证两边不漂）。 */
function projectCore(p: ProjectEntry, base: string, lang: Lang) {
  return {
    slug: p.slug,
    title: p.data.title,
    tagline: p.data.tagline,
    url: p.data.url ?? null,
    repo: p.data.repo ?? null,
    cover: p.data.cover ? new URL(p.data.cover, base).toString() : null,
    tech: p.data.tech,
    year: p.data.year,
    featured: p.data.featured,
    status: p.data.status,
    order: p.data.order,
    loc: p.data.loc ?? null,
    persona: p.data.persona ?? null,
    permalink: `${base}${langPrefix(lang)}/projects/${p.slug}`,
  };
}

export function buildProjectList(entries: ProjectEntry[], base: string, lang: Lang) {
  const items = entries
    .slice()
    .sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year)
    .map((p) => ({
      ...projectCore(p, base, lang),
      body_url: `${base}${langPrefix(lang)}/api/projects/${p.slug}.json`,
    }));
  return { version: '1', lang, count: items.length, items };
}

export function buildProjectDetail(entry: ProjectEntry, base: string, lang: Lang) {
  return {
    version: '1',
    lang,
    ...projectCore(entry, base, lang),
    body_md: entry.body,
  };
}

// ────────────────────────────── articles ──────────────────────────────

export function buildArticleList(entries: ArticleEntry[], base: string, lang: Lang) {
  const items = entries
    .slice()
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((a) => ({
      slug: a.slug,
      title: a.data.title,
      source: a.data.source,
      url: a.data.url,
      date: a.data.date.toISOString().slice(0, 10),
      summary: a.data.summary,
      tags: a.data.tags,
      featured: a.data.featured,
    }));
  return { version: '1', lang, count: items.length, items };
}

// ──────────────────────────── presentations ───────────────────────────

export function buildPresentationList(entries: PresentationEntry[], base: string, lang: Lang) {
  const items = entries
    .slice()
    .sort((a, b) => (a.data.order || 999) - (b.data.order || 999))
    .map((p) => ({
      slug: p.slug,
      title: p.data.title,
      tagline: p.data.tagline,
      url: p.data.url,
      kind: p.data.kind,
      cover: p.data.cover ?? null,
      year: p.data.year,
      featured: p.data.featured,
      order: p.data.order,
    }));
  return { version: '1', lang, count: items.length, items };
}

// ─────────────────────────────── skills ───────────────────────────────

function skillCore(s: SkillEntry, base: string, lang: Lang) {
  return {
    slug: s.slug,
    name: s.data.name,
    description: s.data.description,
    source: s.data.source,
    category: s.data.category ?? null,
    featured: s.data.featured,
    handwritten: s.data.handwritten,
    synced_at: s.data.synced_at ?? null,
    permalink: `${base}${langPrefix(lang)}/skills/${s.slug}`,
  };
}

export function buildSkillList(entries: SkillEntry[], base: string, lang: Lang) {
  const items = entries
    .slice()
    .sort((a, b) => a.data.name.localeCompare(b.data.name))
    .map((s) => ({
      ...skillCore(s, base, lang),
      body_url: `${base}${langPrefix(lang)}/api/skills/${s.slug}.json`,
    }));
  return { version: '1', lang, count: items.length, items };
}

export function buildSkillDetail(entry: SkillEntry, base: string, lang: Lang) {
  return {
    version: '1',
    lang,
    ...skillCore(entry, base, lang),
    body_md: entry.body,
  };
}

// ─────────────────────────── about / social ───────────────────────────

export function buildAbout(about: AboutData, base: string, lang: Lang) {
  return {
    version: '1',
    lang,
    name: about.name,
    handle: about.handle,
    tagline: about.tagline,
    bio: about.bio,
    tags: about.tags,
    location: about.location || null,
    avatar: about.avatar ? `${base}${about.avatar}` : null,
    permalink: `${base}${langPrefix(lang)}/about`,
  };
}

export function buildSocial(links: SocialLink[], base: string, lang: Lang) {
  const out = links
    // 兜底脱敏：邮箱一律不出（真正的约束是别把 PII 写进 source，见 AGENTS §14.5）
    .filter((l) => !/email|mail/i.test(l.label || '') && !/email|mail/i.test(l.icon || ''))
    .map((l) => {
      const row: Record<string, string | null> = {
        label: l.label,
        handle: l.handle ?? null,
        icon: l.icon ?? null,
      };
      row.url = l.url && !/TODO/i.test(l.url) ? l.url : null;
      if (l.qrcode) row.qrcode = `${base}${l.qrcode}`;
      return row;
    });
  return { version: '1', lang, count: out.length, links: out };
}

// ─────────────────────────────── search ───────────────────────────────

type SearchInput = {
  projects: ProjectEntry[];
  articles: ArticleEntry[];
  presentations: PresentationEntry[];
  skills: SkillEntry[];
  about: AboutData;
};

export function buildSearch(input: SearchInput, base: string, lang: Lang) {
  const prefix = langPrefix(lang);
  type Item = {
    type: 'skill' | 'project' | 'article' | 'presentation' | 'about';
    slug: string; title: string; text: string; url: string;
  };
  const items: Item[] = [];

  items.push({
    type: 'about',
    slug: 'about',
    title: input.about.name,
    text: [input.about.name, input.about.tagline, input.about.bio, ...input.about.tags].join('\n'),
    url: `${base}${prefix}/about`,
  });

  for (const p of input.projects) {
    items.push({
      type: 'project',
      slug: p.slug,
      title: p.data.title,
      text: [p.data.title, p.data.tagline, p.data.tech.join(' '), p.body].join('\n'),
      url: `${base}${prefix}/projects/${p.slug}`,
    });
  }

  for (const a of input.articles) {
    items.push({
      type: 'article',
      slug: a.slug,
      title: a.data.title,
      text: [a.data.title, a.data.summary, a.data.tags.join(' '), a.body].join('\n'),
      url: a.data.url,
    });
  }

  for (const p of input.presentations) {
    items.push({
      type: 'presentation',
      slug: p.slug,
      title: p.data.title,
      text: [p.data.title, p.data.tagline, p.data.kind, p.body].join('\n'),
      url: p.data.url,
    });
  }

  for (const s of input.skills) {
    items.push({
      type: 'skill',
      slug: s.slug,
      title: s.data.name,
      text: [s.data.name, s.data.description, s.body].join('\n'),
      url: `${base}${prefix}/skills/${s.slug}`,
    });
  }

  return { version: '1', lang, count: items.length, items };
}

// ─────────────────────────────── manifest ─────────────────────────────

type IndexInput = {
  counts: { projects: number; articles: number; presentations: number; skills: number };
  about: AboutData;
};

export function buildIndex(input: IndexInput, base: string, lang: Lang) {
  const p = langPrefix(lang);
  return {
    version: '1',
    site: base,
    lang,
    name: input.about.name,
    tagline: input.about.tagline,
    bio: input.about.bio,
    generated_at: new Date().toISOString(),
    counts: input.counts,
    endpoints: {
      projects: `${base}${p}/api/projects.json`,
      project: `${base}${p}/api/projects/{slug}.json`,
      articles: `${base}${p}/api/articles.json`,
      presentations: `${base}${p}/api/presentations.json`,
      skills: `${base}${p}/api/skills.json`,
      skill: `${base}${p}/api/skills/{slug}.json`,
      about: `${base}${p}/api/about.json`,
      social: `${base}${p}/api/social.json`,
      search: `${base}${p}/api/search.json`,
    },
    languages: {
      zh: `${base}/api/index.json`,
      en: `${base}/en/api/index.json`,
    },
    cli: lang === 'en' ? 'npx zhanglu-net --lang en --help' : 'npx zhanglu-net --help',
    docs: `${base}${p}/llms.txt`,
    rss: `${base}${p}/rss.xml`,
    sitemap: `${base}/sitemap-index.xml`,
  };
}
