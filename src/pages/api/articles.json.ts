import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildArticleList, jsonResponse, siteBase } from '../../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const articles = await getCollection('articles');
  return jsonResponse(buildArticleList(articles, siteBase(site), 'zh'));
};
