import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const presentations = await getCollection('presentations');

  const items = presentations
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
