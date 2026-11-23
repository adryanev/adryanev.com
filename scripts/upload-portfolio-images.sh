#!/bin/sh
# Uploads assets/portfolio/<slug>/<n>.webp to the MEDIA R2 bucket under portfolio/<slug>/<n>.webp.
# Usage: scripts/upload-portfolio-images.sh --local|--remote
set -eu

target=${1:?usage: upload-portfolio-images.sh --local|--remote}
case "$target" in
  --local|--remote) ;;
  *) echo "target must be --local or --remote" >&2; exit 2 ;;
esac

cd "$(dirname "$0")/.."

find assets/portfolio -name '*.webp' | sort | while read -r file; do
  key=${file#assets/}
  echo "put $key"
  pnpm exec wrangler r2 object put "adryanev-com-media/$key" \
    --file "$file" --content-type image/webp "$target"
done
