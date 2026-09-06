#!/usr/bin/env bash
#
# Interactive setup for .env.worker.
#
# Prompts for the values that cannot be recovered automatically — Vercel stores
# REDIS_URL as a Secret and refuses to export it — writes them to a gitignored
# file, verifies them against the provider, and offers to start the worker.
#
# Secrets are read with a hidden prompt and never echoed.

set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=".env.worker"

# This script is interactive by design — it exists so credentials are typed by
# their owner rather than passed around. Without a usable terminal it would
# write empty values, so prove one can actually be opened and refuse otherwise.
# `test -r /dev/tty` is not enough: the node exists even where it cannot be read.
if ! { exec 3< /dev/tty; } 2>/dev/null; then
  echo "setup-worker.sh needs a terminal. Run it directly in Terminal, not piped or from an editor." >&2
  exit 1
fi
exec 3<&-

# Both write to stderr so they are not captured by the $( ) around ask().
say()  { printf '\n\033[1m%s\033[0m\n' "$1" >&2; }
note() { printf '  %s\n' "$1" >&2; }

# Reuse anything already on disk rather than asking twice.
#
# .env.local is checked as well as .env.worker: `vercel env pull` writes the
# infrastructure connection strings there, and retyping a Redis URL by hand is
# an easy way to introduce a typo nobody will find until the dashboard is
# silently empty. Placeholder values are ignored.
existing() {
  local var=$1 file v
  for file in "$ENV_FILE" ".env.local"; do
    [[ -f "$file" ]] || continue
    v=$(grep -E "^$var=" "$file" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' || true)
    if [[ -n "$v" && "$v" != "[SENSITIVE]" ]]; then
      printf '%s' "$v"
      return 0
    fi
  done
  return 1
}

ask() {                       # ask VAR "prompt" [secret]
  local var=$1 prompt=$2 secret=${3:-} current value
  current=$(existing "$var" || true)

  if [[ -n "$current" ]]; then
    note "$var found — reusing it."
    printf '%s' "$current"
    return
  fi

  if [[ -n "$secret" ]]; then
    printf '  %s: ' "$prompt" >&2
    read -r -s value < /dev/tty
    printf '\n' >&2
  else
    printf '  %s: ' "$prompt" >&2
    read -r value < /dev/tty
  fi
  printf '%s' "$value"
}

say "MarketPulse worker setup"
note "Credentials are written to $ENV_FILE, which is gitignored."
note "Which sectors are scanned lives in scan.config.json, not here."
note "Secret prompts are hidden as you type."

say "1. Alpaca — https://alpaca.markets (Paper Trading account is enough)"
ALPACA_ID=$(ask ALPACA_API_KEY_ID "Alpaca Key ID (starts PK)")
ALPACA_SECRET=$(ask ALPACA_API_SECRET_KEY "Alpaca Secret Key" secret)

say "2. Shared state — reused from .env.local where present"
REDIS=$(ask REDIS_URL "REDIS_URL (Upstash, starts rediss://)" secret)
DB=$(ask DATABASE_URL "DATABASE_URL (Neon, starts postgresql://)" secret)

umask 077   # the file holds credentials; do not create it world-readable
cat > "$ENV_FILE" <<EOF
# Local worker credentials. Gitignored — never commit this file.
# Regenerate with ./scripts/setup-worker.sh

ALPACA_API_KEY_ID=$ALPACA_ID
ALPACA_API_SECRET_KEY=$ALPACA_SECRET
ALPACA_FEED=iex

REDIS_URL=$REDIS
DATABASE_URL=$DB

MARKET_DATA_PROVIDER=alpaca
LOG_LEVEL=info
EOF

say "Wrote $ENV_FILE"
note "permissions: $(stat -f '%Sp' "$ENV_FILE" 2>/dev/null || stat -c '%A' "$ENV_FILE")"

say "3. Verifying credentials against Alpaca"
if npm run --silent check:alpaca; then
  say "Start the worker with:"
  note "caffeinate -i ./scripts/run-worker.sh"
  note ""
  note "caffeinate keeps the Mac awake — a sleeping laptop is a stopped worker."
else
  say "Verification reported problems above. Fix them before starting the worker."
  exit 1
fi
