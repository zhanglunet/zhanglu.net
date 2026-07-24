import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { buildProjectDetail, jsonResponse, siteBase } from '../../../../lib/api';

export const getStaticPaths = (async () => {
  const projects = await getCollection('projectsEn');
  return projects.map((p) => ({ params: { slug: p.slug }, props: { entry: p } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const entry = props.entry as Awaited<ReturnType<typeof getCollection<'projectsEn'>>>[number];
  return jsonResponse(buildProjectDetail(entry, siteBase(site), 'en'));
};
