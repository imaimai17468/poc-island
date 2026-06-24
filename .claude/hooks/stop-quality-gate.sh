#!/usr/bin/env bash
# Stop quality gate: run typecheck / lint / format in order,
# all treated as blocking.

set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT"

if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

OUT=$(bun run typecheck 2>&1 && bun run lint 2>&1 && bun run format 2>&1)
RC=$?
if [ $RC -ne 0 ]; then
  printf '%s' "$OUT" | jq -Rs '{
    systemMessage: "⛔ Stop block: typecheck / lint / format failed",
    decision: "block",
    reason: ("Stop hook: typecheck / lint / format failed. Fix before ending the turn.\n\n" + .)
  }'
  exit 0
fi

echo '{"systemMessage":"✅ Stop quality gate: typecheck / lint / format pass"}'
exit 0
