# Thernus Trader

An automated momentum trading bot. It scans the whole US equity market every
few minutes, applies explicit entry rules, sizes positions against a fixed risk
budget, and manages exits with a stop, a target, a trailing stop and several
time limits. It executes through Interactive Brokers.

Every trade it takes is recorded with the reasons it took it, in plain English.

---

## Status: simulation only

**No live trading has been run, and live mode is disabled by default.** The
system has been verified against historical data and unit tests. It has not
traded a real account.

Enabling live execution takes two deliberate steps and is described at the end.

---

## What the backtest found

Over fifteen sessions (August–September 2026), replaying the live rules against
real minute bars with commissions modelled:

```
9 trades, 0 winners (0%), net -$3.68
Equity: $100.00 → $96.37 (-3.6%)

Gross P&L -$0.91, commission -$2.71 over 9 trades ($0.30 each)
Commission is 0.66R per trade against a 2R target
Break-even win rate: 55% (it would be 33% with no costs)
```

Read that carefully, because the headline number is not the interesting part.

**Three-quarters of the loss is commission, not the strategy.** The trading
decisions lost $0.91. Costs took $2.71. At $100 of capital with a $20 maximum
position, IBKR's 1%-of-value commission cap applies on the way in and again on
the way out, so every trade starts 2% behind. In risk terms that is 0.66R of
friction per trade, which moves the win rate needed to break even from 33% to
55% — the strategy has to be substantially better than a coin flip just to
stand still.

One trade makes this concrete. BTBT was entered at $1.58 and exited at $1.60 —
a **+0.53R gross winner** — and still lost money after commission.

Two other observations from the same run:

- **The sample is nine trades.** That is far too small to judge an edge. It is
  large enough to expose structural problems, which is what it was used for.
- **The original exit rules were broken and the backtest found it.** Seven of
  nine exits fired on `MOMENTUM_REVERSAL` within minutes, and not one trade
  reached its stop or its target. The entry condition requires a stock to be
  near its high with strong one-minute momentum — a moment, not a state — so
  the score collapsed the instant the stock paused and the position was sold
  into an ordinary pullback, every time. A grace period
  (`exit.momentumGraceMinutes`) now lets the stop define early risk instead.

### Stop width

The stop started at 3% and that was wrong. Replaying 2026-09-15 — a day when
RETO ran +819% — the bot entered three times and was stopped out three times
inside twenty minutes, then hit its daily trade limit and sat out the move from
$2.04 to $4.46.

The cause is a conflict between two rules. Entry selects stocks already up 3%+
on 2× volume; a single five-minute RETO bar ranged $1.62–$1.90, or 17%. A 3%
stop is inside the noise of the instruments the entry rules deliberately seek
out.

Widening it, on two independent samples:

| Stop | 15 sessions, whole market | 2026-09-15, the four movers |
|---|---|---|
| 3% | -3.6%, 0/9 winners | -3.0%, 0/3 winners |
| 8% | -2.5%, 0/9 winners | +3.0%, 2/3 winners |
| 12% | **+0.7%, 2/10 winners** | +2.1%, 2/3 winners |
| 15% | +1.6%, 3/10 winners | +2.8%, 3/3 winners |
| 20% | not run | +0.3%, 1/3 winners |

It also cuts friction, for a reason worth understanding. At a 3% stop the $20
capital cap binds, giving a large position with a small R, so commission is
0.66R. At 12% the risk budget binds instead, giving a smaller position with a
larger R, and commission falls to **0.17R**. The break-even win rate drops from
55% to 39%.

The default is now 12%. It is **not** a tuned optimum — 9 and 10 trades are far
too few to optimise against, and 15% scored better on both samples. 12% was
chosen because the mechanism is understood, not because it won.

### What this means

At $100, the cost structure is the dominant term, not the strategy. Options, in
descending order of honesty:

1. **Treat it as an experiment, not an income source.** This is what the brief
   describes and what the code is built for.
2. **Raise the capital.** Costs scale with position size until the per-share
   rate takes over, so the friction per trade falls as size rises. The 1% cap
   stops binding around $35 per position.
3. **Trade less often.** Fewer, better entries pay the toll fewer times.
4. **Use a zero-commission broker for this size.** Alpaca charges no commission
   on US equities. The broker interface is one file; this is the single change
   with the largest effect on the numbers above.

The code does not choose for you and does not hide the arithmetic.

---

## How it works

### The cycle

Every five minutes during regular hours:

1. **Manage open positions first, unconditionally.** Exits are evaluated before
   entries are even considered, so a failure to find candidates can never leave
   a losing position past its stop.
2. **Check the kill switch.** If tripped, close everything and stop.
3. **Check the entry window.** Nothing is bought in the first 35 minutes (the
   widest spreads of the day) or the last 30 (no time to work).
4. **Scan, rank, size, buy.**

### Entry

A stock is bought only if it passes every one of these:

| Condition | Default | Why |
|---|---|---|
| Price | $1–$100 | Below $1 the spread dominates; above $100 a $20 position cannot buy a share |
| Volume today | ≥ 500,000 | Liquidity floor |
| Change from previous close | ≥ 3% | Something is happening |
| Relative volume | ≥ 2× | Against *this symbol's own* volume for this time of day |
| Momentum score | ≥ 60 | The scanner's nine-component score |
| Above VWAP | yes | Today's buyers are ahead, not underwater |
| Distance from day high | ≤ 2% | Not buying from someone already taking profit |
| 5-minute change | positive | Still rising, not stalling |

When several qualify, they are ranked with volume conviction weighted above raw
price movement: a stock up 4% on 8× volume is a better entry than one up 12% on
2×, because the second has already spent its move.

### Sizing

Risk 1% of equity per trade, capped at 20% of equity or $20 per position,
whichever binds first — and never more than available buying power.

At $100 this usually produces **one or two shares**, and frequently refuses the
trade entirely because the size rounds to zero. That refusal is reported in
plain language rather than skipped silently: the constraint is the account, not
the signal.

### Exit

Checked in this order, and the order is the safety property:

1. **Kill switch** — nothing outranks it.
2. **Stop loss** — 12% below entry. Checked *before* the target, because when a
   bar straddles both, assuming the good outcome is how a backtest flatters
   itself. The width is not arbitrary: entry selects stocks already up 3%+ on
   2× volume, which are violent by construction. See *Stop width* below.
3. **Profit target** — 2R.
4. **End of day** — flattened 10 minutes before the close. Nothing is held
   overnight: a gap against an unattended position can exceed the stop by more
   than the entire risk budget.
5. **Max hold** — 120 minutes. A thesis that was going to work has usually
   started working.
6. **Momentum reversal** — score below 35, but only after a 15-minute grace
   period (see above).

The stop only ever moves up. At 1R it moves to break-even; past that it trails
2% below the high-water mark, and the higher of the two wins.

### Safety

- **Kill switch**: `trader/STOP`. Create the file and the bot stops opening
  positions and closes what it holds on the next cycle. A file, deliberately —
  it works from a phone over SSH and does not require the process to be healthy
  enough to accept a command.
- **Consecutive-failure trip**: five broker or data failures in a row halts
  trading. A failed *exit* counts, because that is the most dangerous state the
  system can be in.
- **Daily loss limit**: 5% of equity, then no new entries.
- **Limits**: 3 trades/day, 2 positions at once.
- **Pattern day trader**: under $25,000 equity, FINRA allows three day trades
  per rolling five *business* days. The engine counts its own and stops before
  the broker has to reject one — a limit discovered through a rejection is
  discovered too late. The count survives restarts because it is read back from
  the trade log.
- **Shutdown does not liquidate.** Ctrl-C leaves open positions open and says
  so. Stopping a process is not the same instruction as selling. Use the kill
  switch to flatten deliberately.

### Notifications

Telegram is optional and structurally incapable of blocking a trade: every
notifier method returns `void`, nothing is awaited for a result, and
implementations are forbidden from throwing. It queues, times out after 10
seconds, backs off after five consecutive failures, and drops its backlog
rather than growing without bound. Unset, it logs to the console.

```bash
export TELEGRAM_BOT_TOKEN=...
export TELEGRAM_CHAT_ID=...
```

---

## Running it

Market data comes from Alpaca (free tier, IEX feed) and is independent of
execution. Reuses the scanner's existing credentials:

```bash
export ALPACA_API_KEY_ID=...
export ALPACA_API_SECRET_KEY=...
```

### Phase 1 — backtest

```bash
npm run trader:backtest -- --days 15
npm run trader:backtest -- --days 30 --symbols VEEA,MYSZ,TNON
```

Replays the *same* rule and risk modules the live engine uses, with fills
simulated by the same broker. Only the clock and the data source are replaced.

### Phase 2 — simulation against the live market

```bash
npm run trader:sim
```

Real-time data, simulated fills, no account and no broker connection. This is
where to watch it for a few sessions.

### Phase 3 — IBKR paper

Start TWS or IB Gateway, enable the API (*Settings → API → Enable ActiveX and
Socket Clients*), then:

```bash
npm run trader:paper
```

The broker refuses to start if the port disagrees with the mode: 7496 and 4001
are live ports, 7497 and 4002 are paper. Connecting to a live port believing it
is paper is an error that only announces itself by spending money.

### Phase 4 — live

Not recommended at $100 given the findings above. It requires two independent
switches:

```bash
export TRADER_LIVE=I_UNDERSTAND_THIS_TRADES_REAL_MONEY
npm run trader:live
```

Live mode without both exits rather than quietly running as paper.

---

## Configuration

Every rule and limit is in [`src/config.ts`](src/config.ts), overridable as
JSON:

```bash
export TRADER_CONFIG='{"entry":{"minRvol":3},"risk":{"maxTradesPerDay":2}}'
```

A malformed override falls back to defaults rather than to something
half-applied. The active rules are printed as prose at startup.

## Logs

- `trader/logs/events.jsonl` — everything, including *rejected* candidates and
  why. JSON Lines, appended synchronously so that if the process dies mid-trade
  the reason for the last action is already on disk.
- `trader/logs/trades.jsonl` — closed trades only, for performance review, and
  read back at startup to restore the day-trade count.

## Layout

```
trader/src/
  index.ts              entry point, mode selection, the loop
  backtest.ts           Phase 1 historical replay
  config.ts             every rule, limit and cost
  types.ts              domain types
  broker/
    IBroker.ts          the only thing the engine may ask a broker to do
    PaperBroker.ts      in-memory fills, used by sim and backtest
    IbkrBroker.ts       Interactive Brokers via @stoqey/ib
  data/AlpacaScanner.ts two-stage market scan
  engine/
    EntryRules.ts       pure; returns reasons, not just a boolean
    ExitRules.ts        pure; stop, target, trail, time, momentum
    RiskManager.ts      sizing, limits, PDT, kill switch — the component that says no
    TradingEngine.ts    the cycle
  notify/Notifier.ts    optional, non-blocking
  audit/TradeLog.ts     append-only record
```

The engine is written against `IBroker` and nothing else, so the same code runs
against the simulator, paper and live. That is what makes the phases meaningful:
a phase that runs different code from the one before it has not tested anything
the next phase relies on.

## Market data

Two stages, for cost reasons. A snapshot call returns 500 symbols, so the whole
tradable universe (~13,400 names) costs about 27 calls and a couple of seconds
— but a snapshot has no intraday history, so it cannot produce a 5-minute
change, a real RVOL or a momentum score. The first stage scans everything
cheaply; the second pulls minute bars for the top 20 only. The universe stays
complete while the expensive work stays proportional to how many stocks are
actually moving.

This uses REST rather than the websocket deliberately: the free tier caps a
stream at 30 symbols, which would mean deciding in advance which stocks are
allowed to move.

## Known limitations

- **Backtest fills are modelled.** Whole order at the bar close plus 0.15%
  slippage. For thin small-caps this is optimistic, and those are exactly the
  names the entry rules select.
- **Bars hide the path within them.** A minute that pierced the stop and
  recovered still stops out here, as it would live — but the reverse case
  cannot be modelled at all.
- **Survivorship bias.** Candidates come from symbols that exist today.
- **IEX is a sample** of the consolidated tape (~2–3%). RVOL is internally
  consistent because baseline and live both come from IEX, but absolute volumes
  are not comparable to other sources.
- **No partial fills.** The simulator fills all or nothing. Real IBKR fills can
  be partial, and the engine handles a partial as a failed entry rather than
  managing the fragment.
- **Nine trades is not evidence of anything** about profitability.

## Tests

```bash
npm test
```

79 tests cover the trader specifically: sizing arithmetic, every entry rejection
path, exit ordering (including the stop-and-target straddle), stop monotonicity,
PDT business-day counting, kill-switch behaviour, commission edges, broker
guards, and a full cycle end-to-end including "the scan failed but the exit
still ran".
