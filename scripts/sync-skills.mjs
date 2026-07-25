#!/usr/bin/env node
/**
 * Sync ~/.claude/skills/<name>/SKILL.md → src/content/skills/<name>.md
 *
 * ⚠️ 只能在**有 ~/.claude/skills 的那台机器**上跑（= 本机 Mac）。
 * CF Pages 构建机没有这个目录，所以站上的 /skills 是「最后一次手动同步」的快照，
 * 不会自动更新。自动化方案见 AGENTS.md §5.4。
 *
 * Behavior:
 *   - Reads each skill's frontmatter (name + description + category)
 *   - Writes a markdown file with normalized frontmatter
 *   - Skips files that have `handwritten: true` in their frontmatter
 *   - Preserves manual `featured: true` flag if already set in target
 *   - 报告**孤儿**（仓库里有、~/.claude/skills 里已经没了）
 *   - 报告**中英不对齐**（src/content/skillsEn/ 缺对应文件 —— sync 只管中文侧）
 *   - Prints a summary (created / updated / unchanged / skipped)
 *
 * Flags:
 *   --check   只报告不写入；有任何漂移则 exit 1（给 git hook / 定时任务用）
 *   --prune   删除非 handwritten 的孤儿文件（handwritten 的只报告，需人工决定）
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import matter from 'gray-matter';

const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');
const PRUNE = ARGS.includes('--prune');

const SKILLS_SRC = path.join(os.homedir(), '.claude', 'skills');
const SKILLS_DST = path.join(process.cwd(), 'src', 'content', 'skills');
const SKILLS_DST_EN = path.join(process.cwd(), 'src', 'content', 'skillsEn');

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
  const seen = new Set(); // 本次在 ~/.claude/skills 里真实见到的 slug

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

    seen.add(entry.name);

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
      if (!CHECK) await fs.writeFile(targetPath, newContent);
      stats.updated += 1;
    } else {
      if (!CHECK) await fs.writeFile(targetPath, newContent);
      stats.created += 1;
    }
  }

  // ── 孤儿检测：仓库里有、~/.claude/skills 里已经没了 ──
  // 原来的脚本只会新增/更新，删掉的 skill 会永远留在站上。
  const orphans = { plain: [], handwritten: [] };
  for (const f of await fs.readdir(SKILLS_DST)) {
    if (!f.endsWith('.md')) continue;
    const slug = f.slice(0, -3);
    if (seen.has(slug)) continue;
    const existing = await readExistingTarget(path.join(SKILLS_DST, f));
    (existing?.data?.handwritten ? orphans.handwritten : orphans.plain).push(slug);
  }
  if (PRUNE && !CHECK) {
    for (const slug of orphans.plain) {
      await fs.unlink(path.join(SKILLS_DST, `${slug}.md`));
    }
  }

  // ── 中英对齐检测：sync 只写中文侧，英文侧要人工补 ──
  let enMissing = [];
  let enExtra = [];
  try {
    const zhSlugs = new Set(
      (await fs.readdir(SKILLS_DST)).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3))
    );
    const enSlugs = new Set(
      (await fs.readdir(SKILLS_DST_EN)).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3))
    );
    enMissing = [...zhSlugs].filter((x) => !enSlugs.has(x)).sort();
    enExtra = [...enSlugs].filter((x) => !zhSlugs.has(x)).sort();
  } catch { /* skillsEn 不存在就跳过 */ }

  // Try to remove the placeholder .gitkeep once we have at least one synced file
  if (stats.created + stats.updated + stats.unchanged > 0) {
    try {
      await fs.unlink(path.join(SKILLS_DST, '.gitkeep'));
    } catch { /* ok */ }
  }

  const mode = CHECK ? ' [check]' : PRUNE ? ' [prune]' : '';
  console.log(`[sync-skills]${mode} ${stats.created} created · ${stats.updated} updated · ${stats.unchanged} unchanged · ${stats.skipped} skipped · ${stats.error} error`);

  if (orphans.plain.length) {
    console.log(
      `\n孤儿（本机已删除，仓库仍在）：${orphans.plain.join(', ')}` +
        (PRUNE && !CHECK ? '  → 已删除' : '  → 加 --prune 删除')
    );
  }
  if (orphans.handwritten.length) {
    console.log(`\n孤儿（handwritten，需人工决定去留）：${orphans.handwritten.join(', ')}`);
  }
  if (enMissing.length) {
    console.log(`\n⚠️ 英文版缺失：${enMissing.join(', ')}`);
    console.log(`   sync 只写中文侧。补 src/content/skillsEn/<slug>.md，否则 /en/skills 会少内容（见 AGENTS §16.3）。`);
  }
  if (enExtra.length) {
    console.log(`\n⚠️ 英文版多出（中文侧已无）：${enExtra.join(', ')}`);
  }
  if (errors.length) {
    console.log(`\nErrors:`);
    for (const e of errors) console.log(`  - ${e}`);
  }

  const drift =
    stats.created + stats.updated + stats.error + orphans.plain.length + enMissing.length + enExtra.length;
  if (CHECK && drift > 0) {
    console.log(`\n[sync-skills] --check：检测到 ${drift} 处漂移，需要跑一次 pnpm run sync:skills`);
    process.exit(1);
  }
  if (stats.error > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
