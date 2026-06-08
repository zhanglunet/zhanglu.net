import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import about from '../data/about.json';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ id }) => id !== 'README.md');
  const projects = await getCollection('projects');

  const items = [
    ...articles.map((a) => ({
      title: a.data.title,
      pubDate: a.data.date,
      description: a.data.summary,
      link: a.data.url,
      categories: a.data.tags,
    })),
    ...projects.map((p) => ({
      title: `[项目] ${p.data.title}`,
      pubDate: new Date(`${p.data.year}-01-01`),
      description: p.data.tagline,
      link: `${context.site}projects/${p.slug}`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: about.name,
    description: about.bio,
    site: context.site!,
    items,
  });
}
