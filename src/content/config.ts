import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
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
  }),
});

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    source: z.enum(['wechat', 'substack', 'blog', 'x', 'other']).default('wechat'),
    url: z.string().url(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const presentations = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    url: z.string().url(),
    kind: z.enum(['slides', 'site']).default('slides'),
    cover: z.string().optional(),
    year: z.number(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const skills = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    source: z.enum(['local', 'plugin', 'custom']).default('local'),
    category: z.string().optional(),
    featured: z.boolean().default(false),
    handwritten: z.boolean().default(false),
    synced_at: z.string().optional(),
  }),
});

export const collections = { projects, articles, presentations, skills };
