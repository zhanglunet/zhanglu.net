import { defineCollection, z } from 'astro:content';

const projectSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  url: z.string().url().optional(),
  repo: z.string().url().optional(),
  cover: z.string().optional(),
  tech: z.array(z.string()).default([]),
  year: z.number(),
  featured: z.boolean().default(false),
  status: z.enum(['live', 'beta', 'archived', 'wip']).default('live'),
  order: z.number().default(0),
  loc: z.number().optional(),
  persona: z.string().optional(),
});

const articleSchema = z.object({
  title: z.string(),
  source: z.enum(['wechat', 'substack', 'blog', 'x', 'other']).default('wechat'),
  url: z.string().url(),
  date: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

const presentationSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  url: z.string().url(),
  kind: z.enum(['slides', 'site']).default('slides'),
  cover: z.string().optional(),
  year: z.number(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

const skillSchema = z.object({
  name: z.string(),
  description: z.string(),
  source: z.enum(['local', 'plugin', 'custom']).default('local'),
  category: z.string().optional(),
  featured: z.boolean().default(false),
  handwritten: z.boolean().default(false),
  synced_at: z.string().optional(),
});

const weeklySchema = z.object({
  title: z.string(),
  week: z.string(),
  dateRange: z.string(),
  date: z.coerce.date(),
  summary: z.string(),
});

const content = (schema: z.ZodTypeAny) => defineCollection({ type: 'content', schema });

export const collections = {
  // 中文（默认，根路径）
  projects: content(projectSchema),
  articles: content(articleSchema),
  presentations: content(presentationSchema),
  skills: content(skillSchema),
  weekly: content(weeklySchema),
  // English (/en) — same schemas, parallel content dirs
  projectsEn: content(projectSchema),
  articlesEn: content(articleSchema),
  presentationsEn: content(presentationSchema),
  skillsEn: content(skillSchema),
  weeklyEn: content(weeklySchema),
};
