#!/usr/bin/env bash
# Sync partner-store scrapers into Supabase.
#
# Usage:
#   ./sync.sh [prataprint|bhumisprint|uiclap|all] [options]
#
# Options:
#   --dry-run        Scrape only, never write to DB/Storage
#   --full           Force full re-sync (default: incremental, only changed products)
#   --sync-to-db     Write products to Supabase (default when SUPABASE_URL is set)
#   --upload-images  Upload product images to Supabase Storage
#   --help           Show this help
#
# Required environment:
#   SUPABASE_URL
#   SUPABASE_SERVICE_ROLE_KEY
#
# Examples:
#   ./sync.sh prataprint --full --sync-to-db --upload-images
#   ./sync.sh uiclap --dry-run

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STORE="${1:-all}"
if [ $# -gt 0 ]; then shift; fi

DRY_RUN=""
FULL=""
SYNC_TO_DB=""
UPLOAD_IMAGES=""

for arg in "$@"; do
  case "$arg" in
    --dry-run)      DRY_RUN="--dry-run" ;;
    --full)         FULL="--full" ;;
    --sync-to-db)   SYNC_TO_DB="--sync-to-db" ;;
    --upload-images) UPLOAD_IMAGES="--upload-images" ;;
    --help|-h) sed -n '2,22p' "$0"; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [ -n "$SYNC_TO_DB" ] || [ -n "$UPLOAD_IMAGES" ]; then
  : "${SUPABASE_URL:?SUPABASE_URL is required for DB/storage sync}"
  : "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY is required for DB/storage sync}"
  export SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY
fi

# Stores that are currently reachable and synced.
ACTIVE_STORES=("prataprint" "uiclap")
# Stores waiting for a fix (broken/changed upstream URL). Listed so the run
# reports them instead of silently forgetting about them.
PENDING_STORES=("bhumisprint")

url_reachable() {
  local url="$1" code
  code=$(curl -sS -o /dev/null -w '%{http_code}' -L --max-time 20 \
    -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36" \
    "$url" 2>/dev/null || echo "000")
  [ "$code" = "200" ]
}

sync_prataprint() {
  local url="https://prataprint.bhumisparshaschool.org"
  echo "=== Syncing prataprint ==="
  echo "  URL: $url"
  if ! url_reachable "$url"; then
    echo "  ERROR: store unreachable ($url)" >&2
    return 1
  fi
  python3 "${SCRIPT_DIR}/umapenca.py" \
    --url "$url" \
    --store-id "11210" \
    --collection "prata-print" \
    --subcollection "uma-penca" \
    --output "${SCRIPT_DIR}/prataprint/output/products.json" \
    ${DRY_RUN} ${FULL} ${SYNC_TO_DB} ${UPLOAD_IMAGES}
}

sync_bhumisprint() {
  local url="https://umapenca.com/bhumisprint"
  echo "=== bhumisprint (pending) ==="
  echo "  URL: $url"
  if ! url_reachable "$url"; then
    echo "  SKIPPED: store URL is not serving the catalogue (upstream fix pending)."
    return 0
  fi
  python3 "${SCRIPT_DIR}/umapenca.py" \
    --url "$url" \
    --store-id "11205" \
    --collection "bhumi-print" \
    --subcollection "uma-penca" \
    --output "${SCRIPT_DIR}/bhumisprint/output/products.json" \
    ${DRY_RUN} ${FULL} ${SYNC_TO_DB} ${UPLOAD_IMAGES}
}

sync_uiclap() {
  local url="https://uiclap.bio/levikarmadrum"
  echo "=== Syncing uiclap ==="
  echo "  URL: $url"
  if ! url_reachable "$url"; then
    echo "  ERROR: store unreachable ($url)" >&2
    return 1
  fi
  python3 "${SCRIPT_DIR}/uiclap.py" \
    --bio-url "$url" \
    --collection "bhumi-livros" \
    --subcollection "uiclap" \
    --fetch-details \
    --output "${SCRIPT_DIR}/uiclap/output/products.json" \
    ${DRY_RUN} ${FULL} ${SYNC_TO_DB} ${UPLOAD_IMAGES}
}

sync_store() {
  case "$1" in
    prataprint)  sync_prataprint ;;
    bhumisprint) sync_bhumisprint ;;
    uiclap)      sync_uiclap ;;
    *) echo "Unknown store: $1" >&2; return 2 ;;
  esac
}

mkdir -p "${SCRIPT_DIR}/prataprint/output" \
         "${SCRIPT_DIR}/bhumisprint/output" \
         "${SCRIPT_DIR}/uiclap/output"

failures=0

case "$STORE" in
  all)
    targets=("${ACTIVE_STORES[@]}")
    for s in "${PENDING_STORES[@]}"; do
      echo "Note: '$s' is pending an upstream fix — attempting health check only."
      targets+=("$s")
    done
    ;;
  *)
    targets=("$STORE")
    ;;
esac

for s in "${targets[@]}"; do
  if ! sync_store "$s"; then
    echo "FAILED: $s" >&2
    failures=$((failures + 1))
  fi
  echo ""
done

echo "=== Sync finished ==="
echo "  Active stores : ${ACTIVE_STORES[*]}"
echo "  Pending stores: ${PENDING_STORES[*]}"
if [ "$failures" -gt 0 ]; then
  echo "  Failures      : $failures" >&2
  exit 1
fi
