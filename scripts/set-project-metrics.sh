#!/bin/sh
# Writes the metrics in src/db/portfolio-metrics.ts to portfolio_projects by slug.
# Safe to run again: each UPDATE sets the same values. Needs migration 0003_project_metrics.
# Usage: scripts/set-project-metrics.sh --local|--remote
set -eu

target=${1:?usage: set-project-metrics.sh --local|--remote}
case "$target" in
  --local|--remote) ;;
  *) echo "target must be --local or --remote" >&2; exit 2 ;;
esac

cd "$(dirname "$0")/.."

sql_file=$(mktemp)
trap 'rm -f "$sql_file"' EXIT
pnpm exec tsx src/db/print-project-metrics-sql.ts > "$sql_file"
cat "$sql_file"
pnpm exec wrangler d1 execute DB "$target" --file "$sql_file"
