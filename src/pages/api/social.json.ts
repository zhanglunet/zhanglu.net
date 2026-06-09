import type { APIRoute } from 'astro';
import social from '../../data/social.json';

type RawLink = {
  label: string;
  handle?: string;
  url?: string;
  qrcode?: string;
  icon?: string;
};

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://zhanglu.net';

  const links = (social.links as RawLink[])
    .filter((l) => !/email|mail/i.test(l.label || '') && !/email|mail/i.test(l.icon || ''))
    .map((l) => {
      const out: Record<string, string | null> = {
        label: l.label,
        handle: l.handle ?? null,
        icon: l.icon ?? null,
      };
      if (l.url && !/TODO/i.test(l.url)) out.url = l.url;
      else out.url = null;
      if (l.qrcode) out.qrcode = `${base}${l.qrcode}`;
      return out;
    });

  return new Response(
    JSON.stringify({ version: '1', count: links.length, links }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
