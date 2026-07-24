import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildSearch, jsonResponse, siteBase } from '../../lib/api';
import about from '../../data/about.json';

export const GET: APIRoute = async ({ site }) => {
  const [projects, articles, presentations, skills] = await Promise.all([
    getCollection('projects'),
    getCollection('articles'),
    getCollection('presentations'),
    getCollection('skills'),
  ]);

  return jsonResponse(
    buildSearch({ projects, articles, presentations, skills, about }, siteBase(site), 'zh')
  );
};
