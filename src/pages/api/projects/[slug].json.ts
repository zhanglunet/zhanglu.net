import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths = (async () => {
  const projects = await getCollection('projects');
  return projects.map((p) => ({ params: { slug: p.slug }, props: { entry: p } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const entry = props.entry as Awaited<ReturnType<typeof getCollection<'projects'>>>[number];
  const base = site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

  const body = {
    version: '1',
    slug: entry.slug,
    title: entry.data.title,
    tagline: entry.data.tagline,
    url: entry.data.url ?? null,
    repo: entry.data.repo ?? null,
    tech: entry.data.tech,
    year: entry.data.year,
    featured: entry.data.featured,
    status: entry.data.status,
    order: entry.data.order,
    permalink: `${base}/projects/${entry.slug}`,
    body_md: entry.body,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
