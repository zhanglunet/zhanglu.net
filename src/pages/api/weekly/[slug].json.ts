import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { buildWeeklyDetail, jsonResponse, siteBase } from '../../../lib/api';

export const getStaticPaths = (async () => {
  const weekly = await getCollection('weekly');
  return weekly.map((w) => ({ params: { slug: w.slug }, props: { entry: w } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const entry = props.entry as Awaited<ReturnType<typeof getCollection<'weekly'>>>[number];
  return jsonResponse(buildWeeklyDetail(entry, siteBase(site), 'zh'));
};
