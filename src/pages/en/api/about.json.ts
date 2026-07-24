import type { APIRoute } from 'astro';
import { buildAbout, jsonResponse, siteBase } from '../../../lib/api';
import about from '../../../data/about.en.json';

export const GET: APIRoute = async ({ site }) => {
  return jsonResponse(buildAbout(about, siteBase(site), 'en'));
};
