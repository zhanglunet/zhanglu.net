import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildSkillList, jsonResponse, siteBase } from '../../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const skills = await getCollection('skills');
  return jsonResponse(buildSkillList(skills, siteBase(site), 'zh'));
};
