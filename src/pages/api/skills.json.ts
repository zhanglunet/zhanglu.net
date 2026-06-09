import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const skills = await getCollection('skills');
  const base = site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

  const items = skills
    .sort((a, b) => a.data.name.localeCompare(b.data.name))
    .map((s) => ({
      slug: s.slug,
      name: s.data.name,
      description: s.data.description,
      source: s.data.source,
      category: s.data.category ?? null,
      featured: s.data.featured,
      handwritten: s.data.handwritten,
      synced_at: s.data.synced_at ?? null,
      permalink: `${base}/skills/${s.slug}`,
      body_url: `${base}/api/skills/${s.slug}.json`,
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
