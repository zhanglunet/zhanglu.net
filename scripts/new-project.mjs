#!/usr/bin/env node
/**
 * Scaffold a new project markdown file.
 * Usage:
 *   pnpm run new:project -- <slug> "Title" "Tagline" [url] [year]
 *
 * Example:
 *   pnpm run new:project -- new-thing "新东西" "一句话介绍" https://example.com 2026
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const [, , slug, title, tagline, url, yearArg] = process.argv;

if (!slug || !title || !tagline) {
  console.error('Usage: pnpm run new:project -- <slug> "Title" "Tagline" [url] [year]');
  process.exit(1);
}

const year = yearArg ? Number(yearArg) : new Date().getFullYear();
const target = path.join(process.cwd(), 'src', 'content', 'projects', `${slug}.md`);

const fm = [
  '---',
  `title: ${JSON.stringify(title)}`,
  `tagline: ${JSON.stringify(tagline)}`,
  url ? `url: ${url}` : '# url:',
  '# repo:',
  '# cover: /covers/your-cover.png',
  'tech: []',
  `year: ${year}`,
  'featured: false',
  'status: live  # live | beta | wip | archived',
  'order: 99',
  '---',
  '',
  '## 是什么',
  '',
  'TODO',
  '',
  '## 为什么做',
  '',
  'TODO',
  '',
  '## 你能怎么用',
  '',
  'TODO',
  '',
].join('\n');

try {
  await fs.access(target);
  console.error(`File exists: ${target}`);
  process.exit(1);
} catch {
  await fs.writeFile(target, fm);
  console.log(`Created ${target}`);
}
