import type { APIRoute } from 'astro';
import about from '../../data/about.json';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

  const body = {
    version: '1',
    name: about.name,
    handle: about.handle,
    tagline: about.tagline,
    bio: about.bio,
    tags: about.tags,
    location: about.location || null,
    avatar: about.avatar ? `${base}${about.avatar}` : null,
    permalink: `${base}/about`,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
