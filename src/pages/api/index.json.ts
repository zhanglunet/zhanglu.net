import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import about from '../../data/about.json';

export const GET: APIRoute = async ({ site }) => {
  const [projects, articles, skills] = await Promise.all([
    getCollection('projects'),
    getCollection('articles'),
    getCollection('skills'),
  ]);

  const base = site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

  const body = {
    version: '1',
    site: base,
    name: about.name,
    tagline: about.tagline,
    bio: about.bio,
    generated_at: new Date().toISOString(),
    counts: {
      projects: projects.length,
      articles: articles.length,
      skills: skills.length,
    },
    endpoints: {
      projects: `${base}/api/projects.json`,
      project: `${base}/api/projects/{slug}.json`,
      articles: `${base}/api/articles.json`,
      skills: `${base}/api/skills.json`,
      skill: `${base}/api/skills/{slug}.json`,
      about: `${base}/api/about.json`,
      social: `${base}/api/social.json`,
      search: `${base}/api/search.json`,
    },
    cli: 'npx zhanglu-net --help',
    docs: `${base}/llms.txt`,
    rss: `${base}/rss.xml`,
    sitemap: `${base}/sitemap-index.xml`,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
