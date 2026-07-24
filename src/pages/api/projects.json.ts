import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildProjectList, jsonResponse, siteBase } from '../../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection('projects');
  return jsonResponse(buildProjectList(projects, siteBase(site), 'zh'));
};
