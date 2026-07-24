import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildSearch, jsonResponse, siteBase } from '../../../lib/api';
import about from '../../../data/about.en.json';

export const GET: APIRoute = async ({ site }) => {
  const [projects, articles, presentations, skills] = await Promise.all([
    getCollection('projectsEn'),
    getCollection('articlesEn'),
    getCollection('presentationsEn'),
    getCollection('skillsEn'),
  ]);

  return jsonResponse(
    buildSearch({ projects, articles, presentations, skills, about }, siteBase(site), 'en')
  );
};
