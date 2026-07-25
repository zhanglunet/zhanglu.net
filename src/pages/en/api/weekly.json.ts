import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildWeeklyList, jsonResponse, siteBase } from '../../../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const weekly = await getCollection('weeklyEn');
  return jsonResponse(buildWeeklyList(weekly, siteBase(site), 'en'));
};
