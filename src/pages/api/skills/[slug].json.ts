import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths = (async () => {
  const skills = await getCollection('skills');
  return skills.map((s) => ({ params: { slug: s.slug }, props: { entry: s } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const entry = props.entry as Awaited<ReturnType<typeof getCollection<'skills'>>>[number];
  const base = site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

  const body = {
    version: '1',
    slug: entry.slug,
    name: entry.data.name,
    description: entry.data.description,
    source: entry.data.source,
    category: entry.data.category ?? null,
    featured: entry.data.featured,
    handwritten: entry.data.handwritten,
    synced_at: entry.data.synced_at ?? null,
    permalink: `${base}/skills/${entry.slug}`,
    body_md: entry.body,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
