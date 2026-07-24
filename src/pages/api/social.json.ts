import type { APIRoute } from 'astro';
import { buildSocial, jsonResponse, siteBase } from '../../lib/api';
import social from '../../data/social.json';

export const GET: APIRoute = async ({ site }) => {
  return jsonResponse(buildSocial(social.links, siteBase(site), 'zh'));
};
