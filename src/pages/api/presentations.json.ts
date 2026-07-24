import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildPresentationList, jsonResponse, siteBase } from '../../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const presentations = await getCollection('presentations');
  return jsonResponse(buildPresentationList(presentations, siteBase(site), 'zh'));
};
