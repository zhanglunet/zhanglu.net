#!/usr/bin/env node
/**
 * zhanglu-net — CLI for AI agents to read zhanglu.net structured content.
 *
 * Zero runtime deps. Pure HTTP GET against /api/*.json endpoints.
 *
 *   ZHANGLU_BASE_URL   override default https://zhanglu.net
 *   ZHANGLU_LANG       zh | en   (same as --lang)
 *   NO_COLOR           disable ANSI colors
 */
import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';

// 管道场景（`... | head`）下游会提前关闭 stdout。默认行为是抛未捕获的
// EPIPE 并打一整屏堆栈 —— 对一个主要在管道里被调用的 CLI 是硬伤。静默退出。
for (const stream of [process.stdout, process.stderr]) {
  stream.on('error', (err) => {
    if (err?.code === 'EPIPE') process.exit(0);
    throw err;
  });
}

// 版本单一来源 = package.json（别再在这里硬编码第二份，会漂）
let VERSION = '0.0.0';
try {
  VERSION = createRequire(import.meta.url)('../package.json').version;
} catch {
  // 极端情况（被打包进单文件）下退回未知版本，不影响功能
}

const DEFAULT_BASE = process.env.ZHANGLU_BASE_URL || 'https://zhanglu.net';
const DEFAULT_LANG = process.env.ZHANGLU_LANG || 'zh';

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

/** list/get 支持的类型。单一来源 —— 加一种类型只改这里。 */
const KINDS = {
  skills: { singular: 'skill', perSlug: true },
  projects: { singular: 'project', perSlug: true },
  articles: { singular: 'article', perSlug: false },
  presentations: { singular: 'presentation', perSlug: false },
};
const KIND_LIST = Object.keys(KINDS);
const SINGULAR_TO_PLURAL = Object.fromEntries(
  Object.entries(KINDS).map(([plural, v]) => [v.singular, plural])
);

const HELP = `${c.bold('zhanglu-net')} ${c.dim('v' + VERSION)}  — agent-friendly CLI for zhanglu.net

${c.bold('USAGE')}
  npx zhanglu-net <command> [args] [--flags]

${c.bold('COMMANDS')}
  list <kind>          列出 ${KIND_LIST.join(' | ')}
  get  <kind> <slug>   读一条 ${Object.values(KINDS).map((k) => k.singular).join(' | ')}
  search <keyword>     全语料搜索
  about                作者简介 + 链接
  social               社交链接（脱敏）
  endpoints            打印 /api/index.json manifest
  version              打印 CLI 版本
  help [command]       看某个命令的详细帮助

${c.bold('FLAGS')}
  --lang <zh|en>       取哪种语言的数据（默认 ${DEFAULT_LANG}）
  --json               输出原始 JSON（agent 默认想要的）
  --featured           只看 featured 项
  --source <s>         按 source 过滤（list skills/articles）
  --status <s>         按 status 过滤（list projects）
  --type <t>           只搜某类型（search）：skill|project|article|presentation|about
  --since <YYYY-MM-DD> 按日期过滤（list articles）
  --limit <N>          最多 N 项
  --md                 get 时只输出 body_md
  --base <url>         覆盖站点根（默认 ${DEFAULT_BASE}）

${c.bold('EXAMPLES')}
  npx zhanglu-net list skills --featured
  npx zhanglu-net list projects --status live --json
  npx zhanglu-net list presentations
  npx zhanglu-net get skill mba --md
  npx zhanglu-net search "品牌判断" --type skill
  npx zhanglu-net --lang en search "brand judgment"
  npx zhanglu-net --lang en about --json

${c.bold('ENV')}
  ZHANGLU_BASE_URL=http://localhost:4321   # 本地 dev 改这里
  ZHANGLU_LANG=en                          # 默认取英文数据
  NO_COLOR=1                               # 关掉 ANSI 颜色

${c.dim('docs: https://zhanglu.net/llms.txt')}
`;

/** 每个命令的详细帮助 —— help <command> 真的会用到它。 */
const CMD_HELP = {
  list: `${c.bold('list <kind>')} — 列出某一类内容

  kind:  ${KIND_LIST.join(' | ')}

  相关 flags:
    --featured           只看 featured
    --source <s>         按 source 过滤（skills / articles）
    --status <s>         按 status 过滤（projects：live|beta|wip|archived）
    --since <date>       按日期过滤（articles）
    --limit <N>          最多 N 项
    --lang <zh|en>       语言
    --json               原始 JSON

  例:
    npx zhanglu-net list skills --featured
    npx zhanglu-net list projects --status live --limit 3 --json
    npx zhanglu-net --lang en list presentations`,

  get: `${c.bold('get <kind> <slug>')} — 读一条内容（含正文）

  kind:  ${Object.values(KINDS).map((k) => k.singular).join(' | ')}
  ${c.dim(`skill / project 有独立端点；article / presentation 从列表里取（无 body_md）`)}

  相关 flags:
    --md                 只输出 body_md（适合喂给模型；优先于 --json）
    --json               原始 JSON
    --lang <zh|en>       语言

  例:
    npx zhanglu-net get skill mba --md
    npx zhanglu-net get project qcc-agent
    npx zhanglu-net --lang en get project boss --md`,

  search: `${c.bold('search <keyword>')} — 在全语料里做子串搜索

  打 /api/search.json（约 48 条：projects + articles + presentations + skills + about），
  客户端匹配。标题命中额外加权。

  相关 flags:
    --type <t>           skill | project | article | presentation | about
    --limit <N>          最多 N 项
    --lang <zh|en>       语言 ${c.dim('（中文语料搜中文词，英文语料搜英文词）')}
    --json               原始 JSON

  例:
    npx zhanglu-net search "品牌判断" --type skill
    npx zhanglu-net --lang en search "brand judgment"`,

  about: `${c.bold('about')} — 作者简介（name / tagline / bio / tags）

  flags: --lang <zh|en>  --json
  例:    npx zhanglu-net --lang en about --json`,

  social: `${c.bold('social')} — 公开社交链接（邮箱已脱敏）

  flags: --lang <zh|en>  --json
  例:    npx zhanglu-net social`,

  endpoints: `${c.bold('endpoints')} ${c.dim('(别名 manifest)')} — 打印 /api/index.json

  含 counts、全部端点地址、languages 交叉链接。
  非 TTY（管道里）会自动输出 JSON。

  flags: --lang <zh|en>  --json
  例:    npx zhanglu-net endpoints | jq .counts`,

  version: `${c.bold('version')} — 打印 CLI 版本（当前 v${VERSION}）`,
};

function die(msg, code = 1) {
  process.stderr.write(c.red(`error: ${msg}\n`));
  process.exit(code);
}

/** --lang → API 路径前缀 */
function langPrefix(lang) {
  if (lang !== 'zh' && lang !== 'en') die(`unknown --lang "${lang}". try: zh / en`);
  return lang === 'en' ? '/en' : '';
}

/** --limit 校验：非法值直接报错，而不是静默返回 0 条 */
function parseLimit(raw) {
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) die(`--limit expects a positive integer, got "${raw}"`);
  return n;
}

async function fetchJson(base, prefix, path) {
  const url = `${base.replace(/\/$/, '')}${prefix}${path}`;
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

async function cmdList(ctx, kind, flags) {
  if (!kind) die(`missing <kind>. try: ${KIND_LIST.join(' / ')}`);
  if (!KINDS[kind]) die(`unknown kind "${kind}". try: ${KIND_LIST.join(' / ')}`);

  const data = await fetchJson(ctx.base, ctx.prefix, `/api/${kind}.json`);
  let items = data.items;

  if (flags.featured) items = items.filter((x) => x.featured);
  if (flags.source) {
    if (kind !== 'skills' && kind !== 'articles') {
      die(`--source only applies to: skills / articles (got "${kind}")`);
    }
    items = items.filter((x) => x.source === flags.source);
  }
  if (flags.status) {
    if (kind !== 'projects') die(`--status only applies to: projects (got "${kind}")`);
    items = items.filter((x) => x.status === flags.status);
  }
  if (flags.since) {
    if (kind !== 'articles') die(`--since only applies to: articles (got "${kind}")`);
    items = items.filter((x) => x.date >= flags.since);
  }
  const limit = parseLimit(flags.limit);
  if (limit) items = items.slice(0, limit);

  if (flags.json) {
    out({ version: data.version, lang: data.lang ?? ctx.lang, count: items.length, items });
    return;
  }

  process.stdout.write(
    c.bold(kind.toUpperCase()) +
      c.dim(` (${items.length}${data.count !== items.length ? '/' + data.count : ''})`) +
      (ctx.lang === 'en' ? c.dim(' [en]') : '') +
      '\n'
  );
  process.stdout.write(c.dim('─'.repeat(tableWidth())) + '\n');

  if (items.length === 0) {
    process.stdout.write(c.dim('  (no items)\n'));
    return;
  }

  const width = tableWidth();
  for (const item of items) {
    const marks = [
      item.featured ? c.accent('★') : ' ',
      item.handwritten ? c.cyan('✎') : ' ',
    ].join('');
    const slug = item.slug.padEnd(28).slice(0, 28);
    const desc = truncate(
      item.description || item.tagline || item.summary,
      Math.max(20, width - 28 - 4 - 2)
    );
    process.stdout.write(`${c.bold(slug)} ${marks} ${c.dim(desc)}\n`);
  }
  const hintLang = ctx.lang === 'en' ? '--lang en ' : '';
  process.stdout.write(
    '\n' + c.dim('hint: ') + `npx zhanglu-net ${hintLang}get ${KINDS[kind].singular} <slug>\n`
  );
}

async function cmdGet(ctx, kind, slug, flags) {
  const plural = SINGULAR_TO_PLURAL[kind];
  if (!plural) {
    die(`unknown kind "${kind}". try: ${Object.values(KINDS).map((k) => k.singular).join(' / ')}`);
  }
  if (!slug) die(`missing <slug>. try: npx zhanglu-net list ${plural}`);

  // 没有独立端点的类型（articles / presentations）→ 拉列表再过滤
  if (!KINDS[plural].perSlug) {
    const list = await fetchJson(ctx.base, ctx.prefix, `/api/${plural}.json`);
    const item = list.items.find((x) => x.slug === slug);
    if (!item) die(`${kind} "${slug}" not found. try: npx zhanglu-net list ${plural}`);
    if (flags.md) {
      // 这两类没有 body_md，明确说清楚而不是静默输出空行
      die(`${kind} has no body_md (no per-slug endpoint). drop --md, or use --json`);
    }
    if (flags.json) return out(item);
    process.stdout.write(c.bold(item.title) + '\n');
    const meta = [item.source, item.date, item.kind, item.year].filter(Boolean).join(' · ');
    if (meta) process.stdout.write(c.dim(meta) + '\n');
    process.stdout.write('\n' + (item.summary || item.tagline || '') + '\n\n');
    process.stdout.write(c.cyan(item.url) + '\n');
    return;
  }

  const item = await fetchJson(ctx.base, ctx.prefix, `/api/${plural}/${slug}.json`);

  if (flags.md) {
    process.stdout.write(item.body_md || '');
    if (!String(item.body_md || '').endsWith('\n')) process.stdout.write('\n');
    return;
  }
  if (flags.json) return out(item);

  if (kind === 'skill') {
    process.stdout.write(
      c.bold(`/${item.name}`) +
        ' ' +
        c.dim(`(${item.source}${item.handwritten ? ', handwritten' : ''})`) +
        '\n'
    );
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
    if (item.persona) process.stdout.write(c.dim(`built for: ${item.persona}`) + '\n');
    if (item.loc) process.stdout.write(c.dim(`loc: ≈ ${item.loc.toLocaleString()}`) + '\n');
    if (item.tech?.length) process.stdout.write(c.dim('tech: ' + item.tech.join(' · ')) + '\n');
    process.stdout.write(c.dim('─'.repeat(tableWidth())) + '\n');
    if (item.body_md) process.stdout.write(item.body_md.trim() + '\n');
    process.stdout.write('\n');
    if (item.url) process.stdout.write(c.cyan('  url:  ' + item.url) + '\n');
    if (item.repo) process.stdout.write(c.cyan('  repo: ' + item.repo) + '\n');
    process.stdout.write(c.cyan('  page: ' + item.permalink) + '\n');
  }
}

async function cmdSearch(ctx, kw, flags) {
  if (!kw) {
    die('usage: npx zhanglu-net search <keyword> [--type skill|project|article|presentation|about] [--limit N]');
  }
  const data = await fetchJson(ctx.base, ctx.prefix, '/api/search.json');
  const needle = kw.toLowerCase();

  const TYPES = ['skill', 'project', 'article', 'presentation', 'about'];
  if (flags.type && !TYPES.includes(flags.type)) {
    die(`unknown --type "${flags.type}". try: ${TYPES.join(' / ')}`);
  }

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

  const limit = parseLimit(flags.limit);
  if (limit) hits = hits.slice(0, limit);

  if (flags.json) {
    out({ version: data.version, lang: data.lang ?? ctx.lang, query: kw, count: hits.length, items: hits });
    return;
  }

  process.stdout.write(
    c.bold(`search "${kw}"`) +
      c.dim(` — ${hits.length} hit${hits.length === 1 ? '' : 's'}`) +
      (ctx.lang === 'en' ? c.dim(' [en]') : '') +
      '\n'
  );
  process.stdout.write(c.dim('─'.repeat(tableWidth())) + '\n');
  if (hits.length === 0) {
    process.stdout.write(c.dim('  (no matches)\n'));
    const other = ctx.lang === 'en' ? 'zh' : 'en';
    process.stdout.write(
      c.dim(`  hint: 语料是按语言分开的，试 --lang ${other}\n`)
    );
    return;
  }
  for (const h of hits) {
    const badge =
      { skill: '[skill]  ', project: '[project]', article: '[article]', presentation: '[deck]   ', about: '[about]  ' }[
        h.type
      ] || `[${h.type}]`;
    process.stdout.write(
      `${c.dim(badge)} ${c.bold(h.slug.padEnd(28).slice(0, 28))} ${c.dim(truncate(h.title, 40))}\n`
    );
    process.stdout.write(`            ${c.cyan(h.url)}\n`);
  }
}

async function cmdAbout(ctx, flags) {
  const data = await fetchJson(ctx.base, ctx.prefix, '/api/about.json');
  if (flags.json) return out(data);
  process.stdout.write(c.bold(data.name) + ' ' + c.dim('@' + data.handle) + '\n');
  process.stdout.write(c.accent(data.tagline) + '\n\n');
  process.stdout.write(data.bio + '\n\n');
  if (data.tags?.length) process.stdout.write(c.dim('tags: ' + data.tags.join(' · ')) + '\n');
  process.stdout.write(c.cyan(data.permalink) + '\n');
}

async function cmdSocial(ctx, flags) {
  const data = await fetchJson(ctx.base, ctx.prefix, '/api/social.json');
  if (flags.json) return out(data);
  for (const l of data.links) {
    const handle = l.handle ? c.dim(' ' + l.handle) : '';
    if (l.url) process.stdout.write(`${l.label.padEnd(12)}${handle}  ${c.cyan(l.url)}\n`);
    else if (l.qrcode)
      process.stdout.write(`${l.label.padEnd(12)}${handle}  ${c.dim('(qrcode: ' + l.qrcode + ')')}\n`);
    else process.stdout.write(`${l.label.padEnd(12)}${handle}\n`);
  }
}

async function cmdEndpoints(ctx, flags) {
  const data = await fetchJson(ctx.base, ctx.prefix, '/api/index.json');
  if (flags.json || !process.stdout.isTTY) return out(data);
  process.stdout.write(c.bold(data.name) + ' ' + c.dim('— ' + data.tagline) + '\n');
  process.stdout.write(c.dim(`lang ${data.lang} · generated ${data.generated_at}`) + '\n\n');
  process.stdout.write(c.bold('counts') + '\n');
  for (const [k, v] of Object.entries(data.counts)) process.stdout.write(`  ${k.padEnd(12)} ${v}\n`);
  process.stdout.write('\n' + c.bold('endpoints') + '\n');
  for (const [k, v] of Object.entries(data.endpoints))
    process.stdout.write(`  ${k.padEnd(12)} ${c.cyan(v)}\n`);
  if (data.languages) {
    process.stdout.write('\n' + c.bold('languages') + '\n');
    for (const [k, v] of Object.entries(data.languages))
      process.stdout.write(`  ${k.padEnd(12)} ${c.cyan(v)}\n`);
  }
}

function printHelp(topic) {
  if (!topic) return process.stdout.write(HELP);
  const key = topic === 'manifest' ? 'endpoints' : topic;
  const text = CMD_HELP[key];
  if (!text) {
    process.stderr.write(
      c.red(`error: no help for "${topic}". known: ${Object.keys(CMD_HELP).join(' / ')}\n`)
    );
    process.exit(1);
  }
  process.stdout.write(text + '\n');
}

// ────────────────────────────── main ──────────────────────────────

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0) return printHelp();
  if (argv[0] === 'version' || argv[0] === '--version' || argv[0] === '-v') {
    return process.stdout.write(`zhanglu-net v${VERSION}\n`);
  }

  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: false,
      options: {
        lang: { type: 'string' },
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
  const cmd = pos[0];

  // help / --help / -h —— 在任意位置都认，且认命令名
  if (cmd === 'help' || flags.help || argv[0] === '--help') {
    return printHelp(cmd === 'help' ? pos[1] : cmd);
  }

  const lang = flags.lang || DEFAULT_LANG;
  const ctx = {
    base: flags.base || DEFAULT_BASE,
    lang,
    prefix: langPrefix(lang),
  };

  switch (cmd) {
    case 'list':
      return cmdList(ctx, pos[1], flags);
    case 'get':
      return cmdGet(ctx, pos[1], pos[2], flags);
    case 'search':
      return cmdSearch(ctx, pos.slice(1).join(' '), flags);
    case 'about':
      return cmdAbout(ctx, flags);
    case 'social':
      return cmdSocial(ctx, flags);
    case 'endpoints':
    case 'manifest':
      return cmdEndpoints(ctx, flags);
    default:
      die(`unknown command "${cmd}". try: npx zhanglu-net --help`);
  }
}

main().catch((err) => die(err?.stack || String(err)));
