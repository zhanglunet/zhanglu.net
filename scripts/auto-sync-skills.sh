#!/usr/bin/env bash
#
# 自动同步本机 Claude Skills 到 zhanglu.net 并上线。
#
# 为什么需要它：sync-skills.mjs 读的是 ~/.claude/skills/，只存在于你的 Mac 上。
# CF Pages 构建机没有这个目录，所以站上的 /skills 不会自动更新 ——
# 必须在本机跑一次同步再推。这个脚本把「同步 → 校验 → 构建 → 提交 → 推送」串起来，
# 配合 launchd 就能定时自动跑（安装方法见 AGENTS.md §5.4）。
#
# 安全设计：
#   - 只有 src/content/skills/ 真的有改动才提交，否则安静退出（不会产生空提交）
#   - 构建不过就中止，绝不推坏的 commit 上线
#   - 用 --ff-only 拉取，遇到分叉就停下来让人处理，不会自动 merge 出乱子
#   - 只 add src/content/skills/，不会把你工作区里其它半成品一起提交
#
# 手动跑：bash scripts/auto-sync-skills.sh
# 只看会发生什么：bash scripts/auto-sync-skills.sh --dry-run

set -euo pipefail

REPO="${ZHANGLU_REPO:-$HOME/zhanglu}"
DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

log() { printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

cd "$REPO" || { log "❌ 找不到仓库：$REPO（可用 ZHANGLU_REPO 环境变量指定）"; exit 1; }

# Homebrew / nvm 装的 node 在 launchd 的最小 PATH 里找不到，显式补上
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
command -v node >/dev/null || { log "❌ PATH 里没有 node"; exit 1; }
command -v pnpm >/dev/null || { log "❌ PATH 里没有 pnpm"; exit 1; }

log "▶ 开始同步 skills"

SELF="$REPO/scripts/auto-sync-skills.sh"
self_sum() { command md5sum "$SELF" 2>/dev/null | awk '{print $1}' || command md5 -q "$SELF" 2>/dev/null; }
BEFORE=$(self_sum)

# 1) 拉到最新，避免和远端分叉
git fetch --quiet origin main
if ! git merge --ff-only origin/main --quiet 2>/dev/null; then
  log "⚠️ 本地与 origin/main 分叉，先人工处理再跑（本次中止）"
  exit 1
fi

# 1.5) ⚠️ 上面那个 merge 可能把**这个脚本自己**换掉。
# bash 是按字节偏移增量读脚本的：文件在执行途中被替换，后续读取会落到新文件的
# 错误位置上 —— 轻则跑到别的分支，重则语法碎掉。2026-07-28 那次就是这样：
# 07-27 加的「中英不对齐就 exit 1」明明已经在树里，那一跑却照样 push 了一个
# zh=42 / en=41 的状态上线（ego-browser 没有英文版）。
# 所以：检测到自身变化就用新版本重新 exec，且只 exec 一次防打转。
if [[ "${ZHANGLU_REEXEC:-0}" != "1" && "$(self_sum)" != "$BEFORE" ]]; then
  log "↻ 拉取更新了本脚本，用新版本重新执行"
  ZHANGLU_REEXEC=1 exec bash "$SELF" "$@"
fi

# 2) 同步（--prune 会删掉本机已经不存在的 skill；不想删就去掉这个 flag）
pnpm run sync:skills -- --prune

# 3) 有改动才继续
if git diff --quiet -- src/content/skills; then
  log "✓ 无变化，退出"
  exit 0
fi

CHANGED=$(git diff --name-only -- src/content/skills | wc -l | tr -d ' ')
log "检测到 ${CHANGED} 个 skill 文件变化"

# 中英对齐：sync 只写中文侧，新 skill 的英文版要人工补。
# 这里**硬停**而不是只警告 —— 2026-07-26/27 两次自动同步只 log 了一行警告就照样推上线，
# 结果 zh 从 30 涨到 57、en 还是 30，/en/skills 静默少了 27 条，构建也不会失败。
# 宁可让定时任务停下来等人补翻译，也别再推一次半边的内容上线。
ZH=$(ls src/content/skills/*.md 2>/dev/null | wc -l | tr -d ' ')
EN=$(ls src/content/skillsEn/*.md 2>/dev/null | wc -l | tr -d ' ')
if [[ "$ZH" != "$EN" ]]; then
  log "❌ 中英不对齐：zh=${ZH} en=${EN} —— 本次不推送。"
  log "   缺哪些：pnpm run sync:check（看「英文版缺失」清单）"
  log "   补完 src/content/skillsEn/<slug>.md 再跑一次即可。中文侧的改动已留在工作区。"
  exit 1
fi

if [[ "$DRY_RUN" == "1" ]]; then
  log "[dry-run] 到此为止，不构建不提交"
  git diff --stat -- src/content/skills
  exit 0
fi

# 4) 构建必须过（AGENTS §15：没验证 = 没完成）
log "▶ pnpm build"
if ! pnpm run build > /tmp/zhanglu-autosync-build.log 2>&1; then
  log "❌ 构建失败，已中止（日志：/tmp/zhanglu-autosync-build.log）"
  tail -20 /tmp/zhanglu-autosync-build.log
  exit 1
fi
log "✓ 构建通过"

# 5) 提交并推送（只提交 skills 目录）
git add src/content/skills
git commit -q -m "$(cat <<EOF
chore: 同步本机 Claude Skills（${CHANGED} 个文件）

由 scripts/auto-sync-skills.sh 自动执行。
EOF
)"
git push --quiet origin main
log "✅ 已推送，CF Pages 1–2 分钟后上线"
