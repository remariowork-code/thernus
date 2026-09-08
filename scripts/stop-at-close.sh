#!/usr/bin/env bash
#
# Stop the market worker at the close.
#
# Detached on purpose: it outlives the shell that started it, so the worker is
# not left holding the provider's single connection overnight — which is what
# a scheduled run would then be refused with.
#
#   ./scripts/stop-at-close.sh &        # stops at 16:05 New York today

set -uo pipefail
cd "$(dirname "$0")/.."

LOG="worker-stop.log"
STOP_HOUR=16
STOP_MINUTE=5

say() { printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG"; }

say "waiting for $(printf '%02d:%02d' "$STOP_HOUR" "$STOP_MINUTE") New York"

# Re-check the clock in a loop rather than sleeping one long interval, so a
# laptop suspending and resuming cannot overshoot the stop time.
while :; do
  now=$(( 10#$(TZ=America/New_York date +%H) * 60 + 10#$(TZ=America/New_York date +%M) ))
  target=$(( STOP_HOUR * 60 + STOP_MINUTE ))

  if (( now >= target )); then break; fi

  remaining=$(( (target - now) * 60 ))
  # Cap each sleep so the loop re-reads the wall clock regularly.
  (( remaining > 300 )) && remaining=300
  sleep "$remaining"
done

if pgrep -f 'worker/src/index.ts' > /dev/null; then
  # SIGTERM, so the worker's shutdown handler runs and the socket closes cleanly.
  pkill -TERM -f 'worker/src/index.ts'
  sleep 3
  if pgrep -f 'worker/src/index.ts' > /dev/null; then
    say "worker ignored SIGTERM; sending SIGKILL"
    pkill -KILL -f 'worker/src/index.ts'
  fi
  say "worker stopped at the close"
else
  say "no worker was running"
fi
