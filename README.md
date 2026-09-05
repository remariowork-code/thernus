# MarketPulse

A sector-first intraday scanner. It does not rank stocks by how much they have
already moved; it watches for the *beginning* of coordinated sector movement —
breadth expanding, volume accelerating, leaders pulling away — and says so in a
sentence.

The distinction it is built around:

> Not `MU +4.7%`, but
> `SEMICONDUCTORS AWAKENING: 8/12 advancing. Sector +2.1%, avg RVOL 2.3x. Leaders: MU +4.7%, SNDK +5.1%. 2 new intraday highs.`

## Run it

```bash
npm install
npm run dev
```

That is the whole setup. With no API key, no Redis and no Postgres it starts on
simulated data with in-process state, and the UI says so in a banner it will not
let you dismiss. To watch the full lifecycle drive through a sector:

```bash
MARKETPULSE_FORCE_SESSION=REGULAR SIM_SCENARIO=semiconductors npm run dev
```

Within a couple of minutes the semiconductor sector moves IDLE → AWAKENING →
ACCELERATING → BREAKOUT, with one signal per transition.

## Architecture

```
Market data provider
        │  WebSocket: trades and quotes
        ▼
Persistent market worker            ← Railway / Fly.io, never Vercel
  ├── Stock analytics    1m/5m/15m, RVOL, VWAP, volatility, momentum score
  ├── Sector analytics   breadth, weighted score, acceleration, leaders
  ├── Signal state machine  IDLE → AWAKENING → ACCELERATING → BREAKOUT → COOLING
  └── News / catalyst    headline → tickers → sector → classify → correlate
        │  HSET / ZSET / XADD / PUBLISH
        ▼
Redis                               ← live state + broadcast channel
        │  SUBSCRIBE market:events
        ▼
Next.js on Vercel
  ├── /api/stream       SSE gateway; computes nothing
  └── REST + TanStack Query for hydration
        │  Server-Sent Events
        ▼
Browser
```

The worker is a separate process on purpose. A market-data WebSocket has to stay
open for six and a half hours; a serverless function cannot hold one. Redis
carries everything that changes tick by tick, and Postgres only ever sees
discrete events — signals, news, watchlists, alert history.

### Layout

```
shared/          Types, config, math and engines. Imported by both runtimes
  calculations/    RVOL, VWAP, volume acceleration, volatility, momentum
  engine/          StockMetrics, Sector, Signal, deduplication, news
  market/          Session awareness, the seed universe, fast NY clock
  redis/           Key schema, client interface, ioredis + in-memory impls
  data/            Universe repository (database-driven, static fallback)
worker/src/      The persistent worker
  providers/       IMarketDataProvider: Polygon, plus a simulator
  pipeline/        Orchestration and persistence
src/             Next.js application
  app/api/         SSE gateway and REST
  components/      Dashboard, sector, stock, alert, chart components
prisma/          Schema, migration, seed
tests/           108 tests
```

## Going live

Set these and the fallbacks switch off automatically:

| Variable | Effect when set |
|---|---|
| `ALPACA_API_KEY_ID` + `ALPACA_API_SECRET_KEY` | Live data via Alpaca; free tier includes a real-time websocket |
| `MARKET_DATA_API_KEY` | Live data via Polygon/Massive; needs a plan with websocket access |
| `REDIS_URL` | Worker and web share state; embedded worker turns itself off |
| `DATABASE_URL` | Database-driven universe, persisted signals, watchlists, alerts |

### Choosing a provider

Both implement `IMarketDataProvider`, so switching is one environment variable.

**Alpaca** is the cheapest route to live data — the free Basic plan includes a
real-time websocket. Two constraints, both handled in code and logged rather
than hidden: the free IEX feed is a single venue carrying roughly 2-3% of
consolidated volume, so absolute volume is a sample of the tape; and a
subscription is capped at 30 symbols, so narrow the universe:

```bash
UNIVERSE_SECTORS=semiconductors,memory   # 28 symbols, inside the cap
ALPACA_FEED=iex
```

Relative comparisons between symbols still hold on IEX, which is what breadth
and sector ranking depend on. Absolute RVOL does not — it is a sample ratio.
`ALPACA_FEED=sip` on a paid plan lifts both constraints.

**Polygon/Massive** needs a plan that includes stock websocket access. The free
tier serves historical aggregates but refuses the live stream, which no amount
of code works around.

```bash
# 1. Database
npm run db:migrate
npm run db:seed          # 17 sectors, 249 symbols

# 2. Worker — Railway, Fly.io, or any long-lived process host
fly deploy -c fly.worker.toml
# or: docker build -f Dockerfile.worker -t marketpulse-worker .

# 3. Web
vercel deploy
```

Run exactly one worker. Two against the same Redis would double every signal and
race on the state machine; scale by sharding the symbol universe instead.

## The parts worth knowing about

**RVOL is time-of-day normalised.** Comparing partial-day volume against a
full-day average is what makes ordinary scanners useless before 11am. Here,
volume by 09:45 is compared against the volume this symbol *normally* has by
09:45, built from a 20-day per-minute curve:

```
E[V(t)] = (1/N) · Σ_days Σ_{m≤t} V(m)      RVOL(t) = V(t) / E[V(t)]
```

**Breadth is the point.** One semiconductor stock up 6% is noise. Eight of
eleven up 1.5% on double volume is a sector waking up. Every stage gate requires
breadth above 50%, and the test suite asserts that a lone runner never wakes its
sector.

**Signals fire on transitions, not conditions.** A sector holding BREAKOUT for
twenty minutes emits one signal, not two hundred. Re-emission in the same stage
needs both a cooldown and a genuine score improvement.

**Thresholds are configuration.** Every weight and gate lives in
`shared/config.ts` and can be overridden from the environment with
`MARKETPULSE_CONFIG` — including per-sector overrides, which is how the
four-name memory group gets lower counts than a 28-name sector.

**The system says when it is not real.** No market-data key means a banner on
every page. A scanner quietly showing synthetic prices would be worse than one
that refuses to start.

## Commands

```bash
npm run dev          # Web app, with the embedded worker in development
npm run worker       # The worker on its own (needs REDIS_URL to be useful)
npm run verify       # typecheck + lint + tests
npm test             # 108 tests
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed sectors and symbols
```

## Known gaps

- **Authentication is not implemented.** Every request resolves to one seeded
  user via `src/lib/server/currentUser.ts`. That file is the only place that
  needs to change.
- **News ingestion has no provider wired.** The classification engine, ticker
  extraction and correlation logic are built and tested; `ingestHeadline` needs
  a Finnhub or Benzinga feed calling it.
- **`SignalOutcome` is modelled but not populated.** The schema supports the
  follow-through analysis the brief describes as the long-term differentiator;
  the job that revisits signals at 5/15/30/60 minutes is not written.
- **Migrations have not been run against a live database.** No Postgres was
  available here. The schema validates and the migration SQL is generated by
  Prisma from it, but `prisma migrate dev` has not been executed.
