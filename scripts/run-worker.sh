#!/usr/bin/env bash
#
# Run the market worker against the shared Upstash Redis.
#
# This is the same process that would run on Railway or Fly — same code, same
# Redis, same everything. The only difference is which machine it sits on. The
# deployed Vercel app reads the state it writes, so the dashboard works from
# anywhere while this runs here.

set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env.worker ]]; then
  cat >&2 <<'MSG'
Missing .env.worker

Create it with your credentials (it is gitignored):

  REDIS_URL=rediss://...            # from Vercel > Storage > Upstash
  DATABASE_URL=postgresql://...     # from Vercel > Storage > Neon
  ALPACA_API_KEY_ID=...
  ALPACA_API_SECRET_KEY=...
  UNIVERSE_SECTORS=semiconductors,memory

MSG
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.worker
set +a

: "${REDIS_URL:?REDIS_URL is required — without it the worker writes to memory that Vercel cannot read}"

echo "Starting MarketPulse worker"
echo "  provider : ${MARKET_DATA_PROVIDER:-inferred from credentials}"
echo "  universe : ${UNIVERSE_SECTORS:-all sectors}"
echo "  redis    : external"
echo

exec npx tsx worker/src/index.ts
