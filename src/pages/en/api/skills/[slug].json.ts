import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { buildSkillDetail, jsonResponse, siteBase } from '../../../../lib/api';

export const getStaticPaths = (async () => {
  const skills = await getCollection('skillsEn');
  return skills.map((s) => ({ params: { slug: s.slug }, props: { entry: s } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const entry = props.entry as Awaited<ReturnType<typeof getCollection<'skillsEn'>>>[number];
  return jsonResponse(buildSkillDetail(entry, siteBase(site), 'en'));
};
