import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildPresentationList, jsonResponse, siteBase } from '../../../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const presentations = await getCollection('presentationsEn');
  return jsonResponse(buildPresentationList(presentations, siteBase(site), 'en'));
};
