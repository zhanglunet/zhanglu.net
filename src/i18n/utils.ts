export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh';

/** Detect locale from a URL. `/en` or `/en/...` => 'en', otherwise 'zh'. */
export function getLangFromUrl(url: URL): Locale {
  return url.pathname.split('/')[1] === 'en' ? 'en' : 'zh';
}

/** Prefix a canonical (zh) path for the target locale. `/projects` -> `/en/projects`. */
export function localizePath(path: string, lang: Locale): string {
  if (lang === 'zh') return path;
  if (path === '/' || path === '') return '/en/';
  return '/en' + path;
}

/** Strip any `/en` prefix, returning the canonical (zh) path. */
export function stripLang(pathname: string): string {
  if (pathname === '/en' || pathname === '/en/') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  return pathname;
}

/** Map any current pathname to its equivalent in the target locale (for toggle + hreflang). */
export function altPath(pathname: string, target: Locale): string {
  const bare = stripLang(pathname);
  return target === 'en' ? localizePath(bare, 'en') : bare;
}
