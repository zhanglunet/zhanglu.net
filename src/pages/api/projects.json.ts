import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection('projects');
  const base = site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

  const items = projects
    .sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year)
    .map((p) => ({
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
      permalink: `${base}/projects/${p.slug}`,
      body_url: `${base}/api/projects/${p.slug}.json`,
    }));

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
