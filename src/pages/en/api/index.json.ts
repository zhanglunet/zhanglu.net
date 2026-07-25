import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildIndex, jsonResponse, siteBase } from '../../../lib/api';
import about from '../../../data/about.en.json';

export const GET: APIRoute = async ({ site }) => {
  const [projects, articles, presentations, skills, weekly] = await Promise.all([
    getCollection('projectsEn'),
    getCollection('articlesEn'),
    getCollection('presentationsEn'),
    getCollection('skillsEn'),
    getCollection('weeklyEn'),
  ]);

  return jsonResponse(
    buildIndex(
      {
        counts: {
          projects: projects.length,
          articles: articles.length,
          presentations: presentations.length,
          skills: skills.length,
          weekly: weekly.length,
        },
        about,
      },
      siteBase(site),
      'en'
    )
  );
};
