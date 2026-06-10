import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const articles = await getCollection('articles');

  const items = articles
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
