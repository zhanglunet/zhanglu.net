import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import about from '../../data/about.json';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

  const [projects, articles, presentations, skills] = await Promise.all([
    getCollection('projects'),
    getCollection('articles'),
    getCollection('presentations'),
    getCollection('skills'),
  ]);

  type Item = { type: 'skill' | 'project' | 'article' | 'presentation' | 'about'; slug: string; title: string; text: string; url: string };

  const items: Item[] = [];

  items.push({
    type: 'about',
    slug: 'about',
    title: about.name,
    text: [about.name, about.tagline, about.bio, ...about.tags].join('\n'),
    url: `${base}/about`,
  });

  for (const p of projects) {
    items.push({
      type: 'project',
      slug: p.slug,
      title: p.data.title,
      text: [p.data.title, p.data.tagline, p.data.tech.join(' '), p.body].join('\n'),
      url: `${base}/projects/${p.slug}`,
    });
  }

  for (const a of articles) {
    items.push({
      type: 'article',
      slug: a.slug,
      title: a.data.title,
      text: [a.data.title, a.data.summary, a.data.tags.join(' '), a.body].join('\n'),
      url: a.data.url,
    });
  }

  for (const p of presentations) {
    items.push({
      type: 'presentation',
      slug: p.slug,
      title: p.data.title,
      text: [p.data.title, p.data.tagline, p.data.kind, p.body].join('\n'),
      url: p.data.url,
    });
  }

  for (const s of skills) {
    items.push({
      type: 'skill',
      slug: s.slug,
      title: s.data.name,
      text: [s.data.name, s.data.description, s.body].join('\n'),
      url: `${base}/skills/${s.slug}`,
    });
  }

  return new Response(
    JSON.stringify({ version: '1', count: items.length, items }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
