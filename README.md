# MarketPulse

A sector-first intraday stock scanner. It does not rank stocks by how much they
have already moved; it watches for the *beginning* of coordinated sector
movement — breadth expanding, volume accelerating, leaders pulling away — and
states what it found in a sentence.

The distinction the whole system is built around:

> Not `MU +4.7%`, but
> `SEMICONDUCTORS AWAKENING: 8/12 advancing. Sector +2.1%, avg RVOL 2.3x.
> Leaders: MU +4.7%, SNDK +5.1%. 2 new intraday highs.`

---

## Current status

| Component | State |
|---|---|
| Next.js app | Deployed on Vercel, behind a password gate |
| Market worker | Runs locally or on GitHub Actions (weekdays, ~09:20 ET) |
| Data provider | Alpaca, free tier, real-time IEX websocket |
| Redis | Redis Cloud (shared live state) |
| Postgres | Neon (universe, signals, watchlists) — migrated and seeded |
| Universe | 249 symbols / 17 sectors seeded; **28 / 2 actively scanned** |
| Tests | 138 across 9 files |

**What is not built:** news ingestion (the classifier exists, no feed is wired),
signal outcome tracking (schema exists, no job), and per-user identity
(everyone who signs in shares one account).

---

## Architecture

```
Alpaca / Polygon / Simulator          market data vendor
        │  WebSocket: trades
        ▼
Market worker                          long-lived Node process — NOT on Vercel
  ├── StockMetricsEngine   per symbol: 1m/5m/15m, RVOL, VWAP, volatility, score
  ├── SectorEngine         breadth, weighted score, acceleration, leaders
  ├── SignalStateMachine   IDLE → AWAKENING → ACCELERATING → BREAKOUT → COOLING
  └── NewsCatalystEngine   headline → tickers → sector → classify → correlate
        │  HSET / ZSET / XADD / PUBLISH
        ▼
Redis                                  live state + broadcast channel
        │  SUBSCRIBE market:events
        ▼
Next.js on Vercel
  ├── /api/stream         SSE gateway — relays only, computes nothing
  └── REST + TanStack Query for first paint
        │  Server-Sent Events
        ▼
Browser
```

### Why the worker is a separate process

A market feed is a WebSocket held open for the whole session. Vercel runs
serverless functions that live for seconds per request. You cannot hold a
six-hour connection inside something that exists for ten. This is the constraint
the entire design follows from — it is why Redis exists (the two halves never
talk directly), and why the worker can run anywhere with a network connection,
including a laptop.

**Exactly one worker may run at a time.** Two would double every signal and race
the state machine, and Alpaca refuses a second websocket per account outright.

---

## Technology

**Application** — Next.js 16 (App Router, Turbopack), React 19, TypeScript 5,
Tailwind 4, TanStack Query, Lightweight Charts.

**Worker** — Node 22, `tsx`, `ws`, `ioredis`.

**Data** — Redis for anything that changes tick by tick; Postgres via Prisma 7
(driver adapter, `@prisma/adapter-pg`) for the universe, signals, watchlists and
alert rules.

**Testing** — Vitest. No mocked engines: the acceptance test pushes synthetic
trades through the real pipeline.

---

## Repository layout

```
shared/                  Imported by BOTH the worker and the web app
  types.ts                 The contract between them
  config.ts                Every weight and threshold, overridable by env
  ranking.ts               Sector ordering (acceleration and breadth, not gain)
  calculations/            RVOL, VWAP, volume acceleration, volatility, momentum
  engine/                  StockMetrics, Sector, Signal, dedup, news
  market/                  Session awareness, seed universe, cached NY clock
  redis/                   Key schema, client interface, ioredis + in-memory
  data/                    Universe repository (database, static fallback)

worker/src/              The long-lived process
  index.ts                 Entry: reconnect, backoff, stall detection
  embedded.ts              Same pipeline, started inside Next.js for local dev
  providers/               IMarketDataProvider: Alpaca, Polygon, Simulator
  pipeline/                Orchestration and Postgres persistence

src/                     Next.js application
  middleware.ts            Password gate over every page and API route
  instrumentation.ts       Optionally starts the worker in-process (dev only)
  app/api/                 SSE gateway and REST
  components/              Dashboard, sector, stock, alerts, charts
  lib/                     Auth, formatting, Prisma, server-only helpers

prisma/                  Schema, migration, seed
scripts/                 Worker runner, setup, diagnostics
tests/                   138 tests
.github/workflows/       Scheduled worker + preflight CI
```

**Where to make changes**

| To change | Edit |
|---|---|
| Weights, thresholds, stage rules | `shared/config.ts` |
| How a metric is computed | `shared/calculations/` |
| When a sector counts as moving | `shared/engine/SectorEngine.ts` |
| When a signal fires or repeats | `shared/engine/SignalEngine.ts`, `SignalStateMachine.ts` |
| Dashboard ordering | `shared/ranking.ts` |
| Add a data vendor | New file in `worker/src/providers/`, one branch in `index.ts` |
| Which symbols are scanned | `UNIVERSE_SECTORS`, or `npm run universe` |
| Who the current user is | `src/lib/server/currentUser.ts` — the only place |

### Changing what is scanned

Two different operations.

**Which sectors are scanned** — `UNIVERSE_SECTORS`, a comma-separated list of
sector ids. Set it in `.env.worker` for a local worker, or in the `env:` block
of `.github/workflows/market-worker.yml` for the scheduled one. Restart the
worker afterwards; the universe is read once at startup.

**What a sector contains** — the universe lives in Postgres, not in code. The
seed file only populates a fresh install, so edit the database:

```bash
npm run universe -- list                    # sectors, sizes, which are scanned
npm run universe -- show semiconductors     # its constituents
npm run universe -- set my-focus "My Focus" MU,NVDA,DELL,AVGO
npm run universe -- delete my-focus
```

`set` replaces a sector's membership wholesale and creates it if absent, so it
is idempotent. Symbols the database has not seen get a `Stock` row
automatically. It warns when a sector exceeds the provider's stream cap, since
that is rejected rather than truncated.

Sector granularity is deliberate. Breadth over a partial sector is misleading —
"6 of 18 advancing" is a lie when only 6 are subscribed — so to watch an
arbitrary set of symbols, make them their own sector.

---

## Running locally

```bash
npm install
npm run dev
```

With no configuration at all this starts on **simulated data** with in-process
Redis and the seed universe, and says so in a banner. To watch the full
lifecycle:

```bash
MARKETPULSE_FORCE_SESSION=REGULAR SIM_SCENARIO=semiconductors npm run dev
```

Within a couple of minutes the semiconductor sector moves IDLE → AWAKENING →
ACCELERATING → BREAKOUT, one signal per transition.

### Running against live data

The worker is separate from the app. Configure it once:

```bash
./scripts/setup-worker.sh      # prompts for credentials, verifies, writes .env.worker
caffeinate -i ./scripts/run-worker.sh
```

`caffeinate` matters — a sleeping laptop is a stopped worker, and missed minutes
are not backfilled.

---

## Configuration

Every variable is optional. Absent ones degrade to a documented fallback.

### Market data

| Variable | Meaning |
|---|---|
| `MARKET_DATA_PROVIDER` | `alpaca` \| `polygon` \| `simulated`. Inferred from credentials when unset |
| `ALPACA_API_KEY_ID` / `ALPACA_API_SECRET_KEY` | Alpaca credentials |
| `ALPACA_FEED` | `iex` (free) or `sip` (paid, full tape). Default `iex` |
| `ALPACA_MAX_SYMBOLS` | Stream cap. Defaults to 30 on IEX, unlimited on SIP |
| `MARKET_DATA_API_KEY` | Polygon/Massive key — needs a plan with websocket access |

### Infrastructure

| Variable | Effect when absent |
|---|---|
| `REDIS_URL` | In-process Redis; the worker and app cannot see each other |
| `DATABASE_URL` | Static seed universe; signals not persisted; watchlists 503 |
| `APP_PASSWORD` | **No access gate — the deployment is publicly readable** |
| `AUTH_SECRET` | Derived from `APP_PASSWORD` |

### Scope and tuning

| Variable | Meaning |
|---|---|
| `UNIVERSE_SECTORS` | Comma-separated sector ids. Narrows the scan |
| `MARKETPULSE_CONFIG` | JSON, deep-merged over `shared/config.ts` |
| `SUBSCRIBE_QUOTES` | Persist the NBBO feed. Off by default — see note below |

### Worker behaviour

| Variable | Default |
|---|---|
| `WORKER_MAX_RETRIES` | 10 |
| `WORKER_STALL_TIMEOUT_MS` | 30000 — no prints for this long during REGULAR means reconnect |
| `LOG_LEVEL` | `info` |
| `EMBEDDED_WORKER` | Run the pipeline inside Next.js. On by default in dev without `REDIS_URL` |

### Development only

`MARKETPULSE_FORCE_SESSION` pins the market session regardless of the clock.
`SIM_SCENARIO`, `SIM_AWAKEN_SECONDS`, `SIM_BREAKOUT_SECONDS`, `SIM_TICK_RATE_HZ`
and `SIM_SEED` drive the simulator. None belong in production.

---

## How the analysis works

**RVOL is time-of-day normalised.** Comparing partial-day volume against a
full-day average is what makes ordinary scanners useless before 11am. Volume by
09:45 is compared against the volume this symbol *normally* has by 09:45, from a
20-day per-minute curve:

```
E[V(t)] = (1/N) · Σ_days Σ_{m≤t} V(m)        RVOL(t) = V(t) / E[V(t)]
```

**Momentum** is nine weighted components summing to 100 — price acceleration,
5m and 15m movement, RVOL, volume acceleration, VWAP position, distance from
day high, new high, volatility expansion. The spec's formula as literally
written pins every stock at 100; weights are applied to the normalised band
instead, documented at the call site in `shared/calculations/momentum.ts`.

**Breadth is the point.** One semiconductor up 6% is noise; eight of eleven up
1.5% on double volume is a sector waking up. Every stage gate requires breadth
above 50%, and a test asserts a lone runner never wakes its sector.

**Signals fire on transitions, not conditions.** A sector holding BREAKOUT for
twenty minutes emits one signal, not two hundred. Re-emission in the same stage
needs both a cooldown and a genuine score improvement.

**Per-sector overrides** let a four-name memory group use different counts from
a 28-name semiconductor sector. See `sector.overrides` in `shared/config.ts`.

---

## Deployment

**Application** — pushes to `main` deploy automatically via the connected
GitHub repository. Set `APP_PASSWORD` in the Vercel dashboard, then redeploy:
environment variables are bound at deploy time, so adding one to an existing
deployment has no effect.

**Worker** — needs a long-lived process, not a server. It accepts no inbound
traffic.

| Where | Cost | Continuous |
|---|---|---|
| Local machine | free | while awake |
| GitHub Actions (`.github/workflows/market-worker.yml`) | free, no card | ~6h/day |
| Oracle Cloud Always Free | free (card for ID) | yes |
| Railway / Fly.io | ~$5/mo | yes |

The Actions workflow fires two cron entries and a timezone guard selects the
correct one, so it needs no seasonal editing. Its limits are real: a job caps at
six hours against a six-and-a-half hour session, scheduled runs can start late,
and each run begins with empty deduplication state.

Avoid free tiers that sleep on inactivity — a scanner asleep at 09:30 is worse
than no scanner.

---

## Troubleshooting

Two diagnostics answer most questions:

```bash
npm run check:redis      # host, encryption, what the worker last wrote
npm run check:alpaca     # entitlements, and the plan's real symbol cap
```

### Dashboard is empty but nothing reports an error

Almost always the worker and the app are on **different Redis instances**. Both
connections succeed, so nothing errors. Compare the host the worker logs at
startup with `redisHost` from `/api/health`. A project with more than one Redis
integration attached makes this easy to do by accident.

### `Alpaca error 406: connection limit exceeded`

Two workers are running. Alpaca permits one websocket per account. Check for a
local worker (`pgrep -f worker/src/index.ts`) while the scheduled job is also
active. The worker retries with backoff and eventually wins, but the open is
lost in the meantime.

### `405 symbol limit exceeded`

The universe is larger than the plan streams — 30 symbols on Alpaca's free tier,
verified against the live API. Narrow `UNIVERSE_SECTORS` rather than letting a
sector compute breadth over a truncated constituent set.

### Every RVOL reads near zero

The warm-up could not build baselines. The worker logs an error when more than
half the symbols fail. Usually the provider rejects the historical aggregates
request, or the plan lacks that entitlement.

### `database: none` despite `DATABASE_URL` being set

Connection strings contain shell metacharacters — a Neon URL ends
`&sslmode=require`, and `&` is a command separator. Do not `source` a dotenv
file; `scripts/run-worker.sh` parses it instead. Symptom: the worker silently
falls back to the seed universe.

### `authEnabled: false` on a deployed site

`APP_PASSWORD` is not reaching the deployment — usually because it was added
*after* the last deploy. Redeploy.

### Type errors mentioning `routes.d 2.ts`

Duplicate build artifacts, typically from a cloud-synced folder creating
`file 2.ts` copies. `rm -rf .next`. Keeping the project outside a synced
directory avoids it.

### Nothing is moving

Check `session` at `/api/health`. Outside `REGULAR` there is nothing to react
to, and market holidays are in `shared/market/session.ts`. The cron schedule
does not know about holidays; the scanner does.

---

## Testing

```bash
npm test          # 138 tests
npm run verify    # typecheck + lint + tests
```

`tests/simulation.test.ts` is the acceptance fixture: real trades through the
real engines, asserting IDLE → AWAKENING → ACCELERATING → BREAKOUT, one signal
per transition, and that re-injecting an identical tape emits nothing further.

---

## Known limitations

- **One shared identity.** The password gate controls access, not identity.
  Everyone who signs in resolves to the same user, so watchlists and alert rules
  are common. Real accounts mean changing `src/lib/server/currentUser.ts` and
  nothing else.
- **IEX is one venue**, roughly 2-3% of consolidated volume. RVOL and volume
  acceleration remain valid — the baseline is built from the same feed, so the
  venue's share cancels out of the ratio. *Absolute* share counts read far below
  a consolidated quote screen, and thin names are noisier.
- **The quote feed is off by default.** Nothing computes from quotes, and a live
  open across a few hundred symbols produces tens of thousands of messages a
  second. `SUBSCRIBE_QUOTES=true` enables it, throttled per symbol.
- **News is not ingested.** Classification, ticker extraction and correlation
  are built and tested; `MarketPipeline.ingestHeadline` needs a feed calling it.
  Until then the Catalysts tab stays empty and no signal reaches CRITICAL, which
  requires a correlated headline.
- **`SignalOutcome` is modelled but not populated.** The follow-through analysis
  needs a job revisiting signals at 5/15/30/60 minutes.
- **A restarted worker does not backfill.** It counts only volume it observed,
  so a mid-session gap understates RVOL until the next session. Restarting
  re-reads the provider snapshot and recovers what that exposes.
