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
 *   - 跳过 EXCLUDE 命中的 skill（工作向 / 内部系统，不该上公开站），并清掉仓库里的残留
 *   - 报告**孤儿**（仓库里有、~/.claude/skills 里已经没了）
 *   - 报告**不可读**（目录还在但 SKILL.md 读不到 / 解析失败）—— 这类**永不删**
 *   - 报告**中英不对齐**（src/content/skillsEn/ 缺对应文件 —— sync 只管中文侧）
 *   - Prints a summary (created / updated / unchanged / skipped)
 *
 * Flags:
 *   --check   只报告不写入；有任何漂移则 exit 1（给 git hook / 定时任务用）
 *   --prune   删除孤儿（zh + en 一起删，保持对齐）。featured / handwritten 的孤儿只报告，需人工决定
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import matter from 'gray-matter';

const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');
const PRUNE = ARGS.includes('--prune');

/**
 * 不上站的 skill —— glob 模式（只支持 `*`），同时匹配目录 slug 和 frontmatter 的 name。
 *
 * 为什么要有这个：~/.claude/skills 里混着工作向的内部系统 skill，描述里写清了各服务职责与
 * 模块划分。sync 是无脑全量同步，2026-07-27 那次就把 17 个 `aic-*`（企业 CRM / 差旅 / 考勤后端）
 * 推上了公开站和 /api/skills.json。这里挡住，命中的既不写入、也会清掉仓库里已有的残留。
 *
 * 注意目录名和 name 可能不一样：目录是 `crm-saf`，frontmatter 里是 `aic-crm-saf` —— 所以两个都匹。
 */
const EXCLUDE = ['aic-*'];

function isExcluded(...names) {
  return EXCLUDE.some((pat) => {
    const re = new RegExp(`^${pat.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
    return names.some((n) => n && re.test(n));
  });
}

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
  const seen = new Set(); // 读到并解析成功的 slug
  const present = new Set(); // ~/.claude/skills 里**目录还在**的 slug（能不能读另说）
  const unreadable = []; // 目录在、但 SKILL.md 读不到 / 解析失败 / 缺 description
  const excluded = new Set(); // EXCLUDE 命中，不上站

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    // Accept directories AND symlinks (many skills are symlinked into ~/.claude/skills)
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const skillDir = path.join(SKILLS_SRC, entry.name);

    // ⚠️ 关键区分：「目录还在但读不出来」≠「本机已删除」。
    // 断链 symlink（比如 symlink 指向的仓库被移走 / 卷没挂载）、SKILL.md 缺失、frontmatter
    // 解析失败、缺 description —— 这四种旧版都会静默落到「未见到」，然后被 --prune 删掉。
    // 2026-07-27 那次就这么丢了 15 个 skill（含 featured 的 zhanglu）。
    // 现在只要目录还在，就进 present，永不 prune，只报告为「不可读」。
    present.add(entry.name);

    if (entry.isSymbolicLink()) {
      try {
        const st = await fs.stat(skillDir);
        if (!st.isDirectory()) {
          unreadable.push(`${entry.name}（symlink 目标不是目录）`);
          continue;
        }
      } catch {
        unreadable.push(`${entry.name}（symlink 断链，目标读不到）`);
        continue;
      }
    }
    const skillFile = path.join(skillDir, 'SKILL.md');
    let raw;
    try {
      raw = await fs.readFile(skillFile, 'utf8');
    } catch {
      // 目录里没有 SKILL.md —— 可能压根不是 skill 目录，也可能是 SKILL.md 被误删。
      // 只有仓库里存在同名 md 时才值得报告（否则就是普通目录，跟我们无关）。
      try {
        await fs.access(path.join(SKILLS_DST, `${entry.name}.md`));
        unreadable.push(`${entry.name}（目录在，但没有 SKILL.md）`);
      } catch {
        present.delete(entry.name); // 与本仓库无关的普通目录
      }
      continue;
    }
    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      stats.error += 1;
      errors.push(`${entry.name}: ${err.message}`);
      unreadable.push(`${entry.name}（frontmatter 解析失败）`);
      continue;
    }
    const fmName = (parsed.data?.name || entry.name).toString();
    const description = (parsed.data?.description || '').toString().trim();
    if (!description) {
      stats.error += 1;
      errors.push(`${entry.name}: missing description`);
      unreadable.push(`${entry.name}（缺 description）`);
      continue;
    }

    if (isExcluded(entry.name, fmName)) {
      excluded.add(entry.name);
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

  // ── 仓库残留分类 ──
  // 孤儿 = 仓库里有、~/.claude/skills 里**目录都没了**（不是「读不出来」，见上面 present 的注释）。
  // featured / handwritten 的孤儿是人工策展过的，只报告不删 —— 自动删人工内容是错的。
  const orphans = { plain: [], curated: [] };
  const excludedInRepo = [];
  for (const f of await fs.readdir(SKILLS_DST)) {
    if (!f.endsWith('.md')) continue;
    const slug = f.slice(0, -3);
    const existing = await readExistingTarget(path.join(SKILLS_DST, f));
    // EXCLUDE 命中的残留（可能源目录已经不在了，所以要按仓库文件自己的 name 再判一次）
    if (excluded.has(slug) || isExcluded(slug, existing?.data?.name)) {
      excludedInRepo.push(slug);
      continue;
    }
    if (present.has(slug) || seen.has(slug)) continue;
    const curated = existing?.data?.handwritten === true || existing?.data?.featured === true;
    (curated ? orphans.curated : orphans.plain).push(slug);
  }

  // 删除时 zh / en 一起删，否则会留下「en 有 zh 无」的残影（2026-07-27 踩过）。
  const rmBoth = async (slug) => {
    for (const dir of [SKILLS_DST, SKILLS_DST_EN]) {
      await fs.unlink(path.join(dir, `${slug}.md`)).catch(() => {});
    }
  };
  if (!CHECK) {
    // 排除项无论有没有 --prune 都清掉：它们留在仓库里就是留在公开站上。
    for (const slug of excludedInRepo) await rmBoth(slug);
    if (PRUNE) for (const slug of orphans.plain) await rmBoth(slug);
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

  if (excluded.size || excludedInRepo.length) {
    const all = [...new Set([...excluded, ...excludedInRepo])].sort();
    console.log(
      `\n🚫 排除（EXCLUDE=${EXCLUDE.join(', ')}，不上公开站）：${all.join(', ')}` +
        (excludedInRepo.length ? `\n   仓库残留 ${excludedInRepo.length} 个${CHECK ? '（--check 不删）' : ' → 已删除（zh + en）'}` : '')
    );
  }
  if (unreadable.length) {
    console.log(`\n⚠️ 不可读（目录还在，**不会被 prune**）：`);
    for (const u of unreadable) console.log(`  - ${u}`);
    console.log(`   这些 skill 在本机还在，只是读不出来。修好源文件再同步，别当成「已删除」。`);
  }
  if (orphans.plain.length) {
    console.log(
      `\n孤儿（本机目录已不存在，仓库仍在）：${orphans.plain.join(', ')}` +
        (PRUNE && !CHECK ? '  → 已删除（zh + en）' : '  → 加 --prune 删除')
    );
  }
  if (orphans.curated.length) {
    console.log(`\n孤儿（featured / handwritten，人工策展过，永不自动删）：${orphans.curated.join(', ')}`);
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
    stats.created +
    stats.updated +
    stats.error +
    orphans.plain.length +
    excludedInRepo.length +
    enMissing.length +
    enExtra.length;
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
