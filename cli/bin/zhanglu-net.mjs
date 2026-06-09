#!/usr/bin/env node
/**
 * zhanglu — CLI for AI agents to read zhanglu.net structured content.
 *
 * Zero runtime deps. Pure HTTP GET against /api/*.json endpoints.
 *
 *   ZHANGLU_BASE_URL   override default https://zhanglu.net
 *   NO_COLOR           disable ANSI colors
 */
import { parseArgs } from 'node:util';

const VERSION = '0.1.0';
const DEFAULT_BASE = process.env.ZHANGLU_BASE_URL || 'https://zhanglu.net';

const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  dim: (s) => (COLOR ? `\x1b[2m${s}\x1b[0m` : s),
  bold: (s) => (COLOR ? `\x1b[1m${s}\x1b[0m` : s),
  accent: (s) => (COLOR ? `\x1b[38;5;167m${s}\x1b[0m` : s),
  cyan: (s) => (COLOR ? `\x1b[36m${s}\x1b[0m` : s),
  green: (s) => (COLOR ? `\x1b[32m${s}\x1b[0m` : s),
  yellow: (s) => (COLOR ? `\x1b[33m${s}\x1b[0m` : s),
  red: (s) => (COLOR ? `\x1b[31m${s}\x1b[0m` : s),
};

const HELP = `${c.bold('zhanglu-net')} ${c.dim('v' + VERSION)}  — agent-friendly CLI for zhanglu.net

${c.bold('USAGE')}
  npx zhanglu-net <command> [args] [--flags]

${c.bold('COMMANDS')}
  list <kind>          列出 skills | projects | articles
  get  <kind> <slug>   读一条 skill | project | article
  search <keyword>     在 skills/projects/articles 全文搜
  about                作者简介 + 链接
  social               社交链接（脱敏）
  endpoints            打印 /api/index.json manifest
  version              打印 CLI 版本
  help [command]       看帮助

${c.bold('FLAGS')}
  --json               输出原始 JSON（agent 默认想要的）
  --featured           只看 featured 项
  --source <s>         按 source 过滤（list skills/articles）
  --status <s>         按 status 过滤（list projects）
  --type <t>           只搜 skill / project / article（search）
  --since <YYYY-MM-DD> 按日期过滤（list articles）
  --limit <N>          最多 N 项
  --md                 get 时只输出 body_md
  --base <url>         覆盖站点根（默认 ${DEFAULT_BASE}）

${c.bold('EXAMPLES')}
  npx zhanglu-net list skills --featured
  npx zhanglu-net list projects --status live --json
  npx zhanglu-net get skill mba --md
  npx zhanglu-net get project qcc-agent
  npx zhanglu-net search "品牌判断" --type skill
  npx zhanglu-net about --json

${c.bold('ENV')}
  ZHANGLU_BASE_URL=http://localhost:4321   # 本地 dev 改这里
  NO_COLOR=1                                # 关掉 ANSI 颜色

${c.dim('docs: https://zhanglu.net/llms.txt')}
`;

function die(msg, code = 1) {
  process.stderr.write(c.red(`error: ${msg}\n`));
  process.exit(code);
}

async function fetchJson(base, path) {
  const url = `${base.replace(/\/$/, '')}${path}`;
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    die(`fetch failed: ${url}\n  ${err.message}`);
  }
  if (!res.ok) die(`${res.status} ${res.statusText} — ${url}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('json')) die(`expected JSON, got ${ct} — ${url}`);
  return res.json();
}

function out(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function truncate(s, n) {
  if (!s) return '';
  const flat = String(s).replace(/\s+/g, ' ').trim();
  return flat.length > n ? flat.slice(0, n - 1) + '…' : flat;
}

function tableWidth() {
  return Math.max(60, Math.min(process.stdout.columns || 100, 120));
}

// ────────────────────────────── commands ──────────────────────────────

async function cmdList(base, kind, flags) {
  const valid = ['skills', 'projects', 'articles'];
  if (!valid.includes(kind)) die(`unknown kind "${kind}". try: ${valid.join(' / ')}`);

  const data = await fetchJson(base, `/api/${kind}.json`);
  let items = data.items;

  if (flags.featured) items = items.filter((x) => x.featured);
  if (flags.source) items = items.filter((x) => x.source === flags.source);
  if (flags.status && kind === 'projects') items = items.filter((x) => x.status === flags.status);
  if (flags.since && kind === 'articles') {
    items = items.filter((x) => x.date >= flags.since);
  }
  if (flags.limit) items = items.slice(0, Number(flags.limit));

  if (flags.json) {
    out({ version: data.version, count: items.length, items });
    return;
  }

  process.stdout.write(c.bold(`${kind.toUpperCase()}`) + c.dim(` (${items.length}${data.count !== items.length ? '/' + data.count : ''})`) + '\n');
  process.stdout.write(c.dim('─'.repeat(tableWidth())) + '\n');

  if (items.length === 0) {
    process.stdout.write(c.dim('  (no items)\n'));
    return;
  }

  const width = tableWidth();
  for (const item of items) {
    const name = item.name || item.title || item.slug;
    const marks = [
      item.featured ? c.accent('★') : ' ',
      item.handwritten ? c.cyan('✎') : ' ',
    ].join('');
    const slug = item.slug.padEnd(28).slice(0, 28);
    const desc = truncate(item.description || item.tagline || item.summary, Math.max(20, width - 28 - 4 - 2));
    process.stdout.write(`${c.bold(slug)} ${marks} ${c.dim(desc)}\n`);
  }
  process.stdout.write('\n' + c.dim('hint: ') + `npx zhanglu-net get ${kind.replace(/s$/, '')} <slug>\n`);
}

async function cmdGet(base, kind, slug, flags) {
  const map = { skill: 'skills', project: 'projects', article: 'articles' };
  if (!map[kind]) die(`unknown kind "${kind}". try: skill / project / article`);
  if (!slug) die(`missing <slug>. try: npx zhanglu-net list ${map[kind]}`);

  if (kind === 'article') {
    // articles don't have a per-slug endpoint; pull from list and filter
    const list = await fetchJson(base, '/api/articles.json');
    const item = list.items.find((x) => x.slug === slug);
    if (!item) die(`article "${slug}" not found`);
    if (flags.json) return out(item);
    process.stdout.write(c.bold(item.title) + '\n');
    process.stdout.write(c.dim(`${item.source} · ${item.date}`) + '\n\n');
    process.stdout.write(item.summary + '\n\n');
    process.stdout.write(c.cyan(item.url) + '\n');
    return;
  }

  const item = await fetchJson(base, `/api/${map[kind]}/${slug}.json`);

  if (flags.md) {
    process.stdout.write(item.body_md || '');
    if (!String(item.body_md || '').endsWith('\n')) process.stdout.write('\n');
    return;
  }
  if (flags.json) return out(item);

  if (kind === 'skill') {
    process.stdout.write(c.bold(`/${item.name}`) + ' ' + c.dim(`(${item.source}${item.handwritten ? ', handwritten' : ''})`) + '\n');
    process.stdout.write(c.dim('─'.repeat(tableWidth())) + '\n');
    process.stdout.write((item.description || '').trim() + '\n\n');
    if (item.body_md) {
      process.stdout.write(c.dim('── body ──') + '\n');
      process.stdout.write(item.body_md.trim() + '\n');
    }
    process.stdout.write('\n' + c.cyan(item.permalink) + '\n');
  } else {
    // project
    process.stdout.write(c.bold(item.title) + ' ' + c.dim(`(${item.year}, ${item.status})`) + '\n');
    process.stdout.write(c.dim(item.tagline) + '\n');
    if (item.tech?.length) process.stdout.write(c.dim('tech: ' + item.tech.join(' · ')) + '\n');
    process.stdout.write(c.dim('─'.repeat(tableWidth())) + '\n');
    if (item.body_md) process.stdout.write(item.body_md.trim() + '\n');
    process.stdout.write('\n');
    if (item.url) process.stdout.write(c.cyan('  url:  ' + item.url) + '\n');
    if (item.repo) process.stdout.write(c.cyan('  repo: ' + item.repo) + '\n');
    process.stdout.write(c.cyan('  page: ' + item.permalink) + '\n');
  }
}

async function cmdSearch(base, kw, flags) {
  if (!kw) die('usage: npx zhanglu-net search <keyword> [--type skill|project|article] [--limit N]');
  const data = await fetchJson(base, '/api/search.json');
  const needle = kw.toLowerCase();

  let hits = data.items.filter((x) => x.text.toLowerCase().includes(needle));
  if (flags.type) hits = hits.filter((x) => x.type === flags.type);

  // crude score: title match > many occurrences
  hits = hits
    .map((x) => {
      const t = x.text.toLowerCase();
      const title = (x.title || '').toLowerCase();
      let score = 0;
      let i = 0;
      while ((i = t.indexOf(needle, i)) !== -1) {
        score += 1;
        i += needle.length;
      }
      if (title.includes(needle)) score += 5;
      return { ...x, score };
    })
    .sort((a, b) => b.score - a.score);

  if (flags.limit) hits = hits.slice(0, Number(flags.limit));

  if (flags.json) {
    out({ version: data.version, query: kw, count: hits.length, items: hits });
    return;
  }

  process.stdout.write(c.bold(`search "${kw}"`) + c.dim(` — ${hits.length} hit${hits.length === 1 ? '' : 's'}`) + '\n');
  process.stdout.write(c.dim('─'.repeat(tableWidth())) + '\n');
  if (hits.length === 0) {
    process.stdout.write(c.dim('  (no matches)\n'));
    return;
  }
  for (const h of hits) {
    const badge = ({ skill: '[skill]  ', project: '[project]', article: '[article]', about: '[about]  ' })[h.type] || `[${h.type}]`;
    process.stdout.write(`${c.dim(badge)} ${c.bold(h.slug.padEnd(28).slice(0, 28))} ${c.dim(truncate(h.title, 40))}\n`);
    process.stdout.write(`            ${c.cyan(h.url)}\n`);
  }
}

async function cmdAbout(base, flags) {
  const data = await fetchJson(base, '/api/about.json');
  if (flags.json) return out(data);
  process.stdout.write(c.bold(data.name) + ' ' + c.dim('@' + data.handle) + '\n');
  process.stdout.write(c.accent(data.tagline) + '\n\n');
  process.stdout.write(data.bio + '\n\n');
  if (data.tags?.length) process.stdout.write(c.dim('tags: ' + data.tags.join(' · ')) + '\n');
  process.stdout.write(c.cyan(data.permalink) + '\n');
}

async function cmdSocial(base, flags) {
  const data = await fetchJson(base, '/api/social.json');
  if (flags.json) return out(data);
  for (const l of data.links) {
    const handle = l.handle ? c.dim(' ' + l.handle) : '';
    if (l.url) process.stdout.write(`${l.label.padEnd(12)}${handle}  ${c.cyan(l.url)}\n`);
    else if (l.qrcode) process.stdout.write(`${l.label.padEnd(12)}${handle}  ${c.dim('(qrcode: ' + l.qrcode + ')')}\n`);
    else process.stdout.write(`${l.label.padEnd(12)}${handle}\n`);
  }
}

async function cmdEndpoints(base, flags) {
  const data = await fetchJson(base, '/api/index.json');
  if (flags.json || !process.stdout.isTTY) return out(data);
  process.stdout.write(c.bold(data.name) + ' ' + c.dim('— ' + data.tagline) + '\n');
  process.stdout.write(c.dim(`generated ${data.generated_at}`) + '\n\n');
  process.stdout.write(c.bold('counts') + '\n');
  for (const [k, v] of Object.entries(data.counts)) process.stdout.write(`  ${k.padEnd(12)} ${v}\n`);
  process.stdout.write('\n' + c.bold('endpoints') + '\n');
  for (const [k, v] of Object.entries(data.endpoints)) process.stdout.write(`  ${k.padEnd(12)} ${c.cyan(v)}\n`);
}

// ────────────────────────────── main ──────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h' || argv[0] === 'help') {
    process.stdout.write(HELP);
    return;
  }
  if (argv[0] === 'version' || argv[0] === '--version' || argv[0] === '-v') {
    process.stdout.write(`zhanglu-net v${VERSION}\n`);
    return;
  }

  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: false,
      options: {
        json: { type: 'boolean' },
        featured: { type: 'boolean' },
        md: { type: 'boolean' },
        source: { type: 'string' },
        status: { type: 'string' },
        type: { type: 'string' },
        since: { type: 'string' },
        limit: { type: 'string' },
        base: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (err) {
    die(`flag parse error: ${err.message}`);
  }

  const flags = parsed.values;
  const pos = parsed.positionals;
  const base = flags.base || DEFAULT_BASE;

  const cmd = pos[0];
  switch (cmd) {
    case 'list':
      return cmdList(base, pos[1], flags);
    case 'get':
      return cmdGet(base, pos[1], pos[2], flags);
    case 'search':
      return cmdSearch(base, pos.slice(1).join(' '), flags);
    case 'about':
      return cmdAbout(base, flags);
    case 'social':
      return cmdSocial(base, flags);
    case 'endpoints':
    case 'manifest':
      return cmdEndpoints(base, flags);
    default:
      die(`unknown command "${cmd}". try: npx zhanglu-net --help`);
  }
}

main().catch((err) => die(err?.stack || String(err)));
