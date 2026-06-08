#!/usr/bin/env node
/**
 * Sync ~/.claude/skills/<name>/SKILL.md → src/content/skills/<name>.md
 *
 * Behavior:
 *   - Reads each skill's frontmatter (name + description + category)
 *   - Writes a markdown file with normalized frontmatter
 *   - Skips files that have `handwritten: true` in their frontmatter
 *   - Preserves manual `featured: true` flag if already set in target
 *   - Prints a summary (created / updated / unchanged / skipped)
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import matter from 'gray-matter';

const SKILLS_SRC = path.join(os.homedir(), '.claude', 'skills');
const SKILLS_DST = path.join(process.cwd(), 'src', 'content', 'skills');

const today = new Date().toISOString().slice(0, 10);

function escapeYamlString(str) {
  if (typeof str !== 'string') return JSON.stringify(str);
  // Single-line: just quote with double quotes, escape backslashes and quotes
  return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function buildFrontmatter(data) {
  const lines = ['---'];
  lines.push(`name: ${escapeYamlString(data.name)}`);
  // description as YAML block scalar (>) to preserve multi-line
  lines.push('description: |');
  const desc = (data.description || '').trim();
  for (const line of desc.split('\n')) {
    lines.push(`  ${line}`);
  }
  lines.push(`source: ${data.source}`);
  if (data.category) lines.push(`category: ${escapeYamlString(data.category)}`);
  lines.push(`featured: ${data.featured ? 'true' : 'false'}`);
  lines.push(`handwritten: ${data.handwritten ? 'true' : 'false'}`);
  lines.push(`synced_at: ${escapeYamlString(data.synced_at)}`);
  lines.push('---');
  return lines.join('\n');
}

function buildBody(data, name) {
  return `\n本 skill 来源于本机 \`~/.claude/skills/${name}/SKILL.md\`，由 \`pnpm run sync:skills\` 自动同步。\n\n## 描述\n\n${(data.description || '').trim()}\n`;
}

async function readExistingTarget(targetPath) {
  try {
    const raw = await fs.readFile(targetPath, 'utf8');
    return matter(raw);
  } catch {
    return null;
  }
}

function normalize(s) {
  return s.replace(/\s+/g, ' ').trim();
}

async function main() {
  await fs.mkdir(SKILLS_DST, { recursive: true });
  let entries;
  try {
    entries = await fs.readdir(SKILLS_SRC, { withFileTypes: true });
  } catch (err) {
    console.error(`[sync-skills] cannot read ${SKILLS_SRC}: ${err.message}`);
    process.exit(1);
  }

  const stats = { created: 0, updated: 0, unchanged: 0, skipped: 0, error: 0 };
  const errors = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    // Accept directories AND symlinks (many skills are symlinked into ~/.claude/skills)
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const skillDir = path.join(SKILLS_SRC, entry.name);
    // For symlinks, verify the target resolves to a readable dir
    if (entry.isSymbolicLink()) {
      try {
        const st = await fs.stat(skillDir);
        if (!st.isDirectory()) continue;
      } catch {
        continue; // dangling symlink
      }
    }
    const skillFile = path.join(skillDir, 'SKILL.md');
    let raw;
    try {
      raw = await fs.readFile(skillFile, 'utf8');
    } catch {
      continue; // not a skill dir
    }
    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      stats.error += 1;
      errors.push(`${entry.name}: ${err.message}`);
      continue;
    }
    const fmName = (parsed.data?.name || entry.name).toString();
    const description = (parsed.data?.description || '').toString().trim();
    if (!description) {
      stats.error += 1;
      errors.push(`${entry.name}: missing description`);
      continue;
    }

    const targetPath = path.join(SKILLS_DST, `${entry.name}.md`);
    const existing = await readExistingTarget(targetPath);

    if (existing?.data?.handwritten) {
      stats.skipped += 1;
      continue;
    }

    const featured = existing?.data?.featured === true;

    const newFm = {
      name: fmName,
      description,
      source: 'local',
      category: parsed.data?.category,
      featured,
      handwritten: false,
      synced_at: today,
    };
    const newContent = `${buildFrontmatter(newFm)}\n${buildBody({ description }, entry.name)}`;

    if (existing) {
      // Compare ignoring synced_at
      const oldKeep = { ...existing.data };
      delete oldKeep.synced_at;
      const newKeep = { ...newFm };
      delete newKeep.synced_at;
      const oldKey = normalize(JSON.stringify(oldKeep) + '|' + existing.content);
      const newKey = normalize(JSON.stringify(newKeep) + '|' + buildBody({ description }, entry.name));
      if (oldKey === newKey) {
        stats.unchanged += 1;
        continue;
      }
      await fs.writeFile(targetPath, newContent);
      stats.updated += 1;
    } else {
      await fs.writeFile(targetPath, newContent);
      stats.created += 1;
    }
  }

  // Try to remove the placeholder .gitkeep once we have at least one synced file
  if (stats.created + stats.updated + stats.unchanged > 0) {
    try {
      await fs.unlink(path.join(SKILLS_DST, '.gitkeep'));
    } catch { /* ok */ }
  }

  console.log(`[sync-skills] ${stats.created} created · ${stats.updated} updated · ${stats.unchanged} unchanged · ${stats.skipped} skipped · ${stats.error} error`);
  if (errors.length) {
    console.log(`\nErrors:`);
    for (const e of errors) console.log(`  - ${e}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
