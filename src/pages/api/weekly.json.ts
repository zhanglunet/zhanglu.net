import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildWeeklyList, jsonResponse, siteBase } from '../../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const weekly = await getCollection('weekly');
  return jsonResponse(buildWeeklyList(weekly, siteBase(site), 'zh'));
};
