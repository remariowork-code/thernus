/**
 * Signal deduplication.
 *
 * The requirement is blunt: "if MU remains above +3% for 20 minutes, I should
 * not receive 100 identical alerts." So emission is gated on *transitions*, not
 * on conditions. A sector that stays in BREAKOUT emits once on entry and then
 * goes quiet unless it materially improves.
 *
 * Three ways a signal is allowed out:
 *   1. Escalation      — the stage rank went up. Always emits.
 *   2. De-escalation   — an active sector entered COOLING. Emits once.
 *   3. Same-stage      — only after the cooldown AND a real score improvement.
 */

import { STAGE_RANK, type MarketPulseConfig } from '../config';

export type Stage = 'IDLE' | 'AWAKENING' | 'ACCELERATING' | 'BREAKOUT' | 'COOLING';

export interface TrackedState {
  key: string;
  stage: Stage;
  lastSignalTimestamp: number;
  lastUpdateTimestamp: number;
  highScore: number;
}

export interface EmitDecision {
  emit: boolean;
  reason: 'ESCALATION' | 'COOLING' | 'SAME_STAGE_IMPROVEMENT' | 'SUPPRESSED_COOLDOWN' | 'SUPPRESSED_NO_CHANGE';
  previousStage: Stage;
}

export class SignalDeduplicator {
  private readonly states = new Map<string, TrackedState>();

  constructor(private readonly config: MarketPulseConfig) {}

  peek(key: string): TrackedState | undefined {
    return this.states.get(key);
  }

  private stateFor(key: string): TrackedState {
    let state = this.states.get(key);
    if (!state) {
      state = { key, stage: 'IDLE', lastSignalTimestamp: 0, lastUpdateTimestamp: 0, highScore: 0 };
      this.states.set(key, state);
    }
    return state;
  }

  /**
   * Decide whether a transition to `targetStage` should surface, and record the
   * outcome. Calling this mutates tracking state — it is the single place stage
   * transitions are committed.
   */
  shouldEmit(key: string, targetStage: Stage, currentScore: number, now = Date.now()): EmitDecision {
    const state = this.stateFor(key);
    const previousStage = state.stage;
    const sinceLast = now - state.lastSignalTimestamp;

    // 1. Escalation.
    if (STAGE_RANK[targetStage] > STAGE_RANK[previousStage]) {
      state.stage = targetStage;
      state.lastSignalTimestamp = now;
      state.lastUpdateTimestamp = now;
      state.highScore = Math.max(state.highScore, currentScore);
      return { emit: true, reason: 'ESCALATION', previousStage };
    }

    // 2. Falling out of an active stage into cooling.
    if (targetStage === 'COOLING' && previousStage !== 'COOLING' && previousStage !== 'IDLE') {
      state.stage = 'COOLING';
      state.lastSignalTimestamp = now;
      state.lastUpdateTimestamp = now;
      // Reset the high-water mark so the next run up can re-emit.
      state.highScore = currentScore;
      return { emit: true, reason: 'COOLING', previousStage };
    }

    // Returning to idle is bookkeeping, not news.
    if (targetStage === 'IDLE') {
      state.stage = 'IDLE';
      state.highScore = 0;
      return { emit: false, reason: 'SUPPRESSED_NO_CHANGE', previousStage };
    }

    // 3. Same stage — needs both the cooldown and a genuine improvement.
    if (targetStage === previousStage) {
      const pastCooldown = sinceLast > this.config.dedup.cooldownMs;
      const improved = currentScore > state.highScore + this.config.dedup.sameStageScoreDelta;
      if (pastCooldown && improved) {
        state.lastSignalTimestamp = now;
        state.lastUpdateTimestamp = now;
        state.highScore = currentScore;
        return { emit: true, reason: 'SAME_STAGE_IMPROVEMENT', previousStage };
      }
      return {
        emit: false,
        reason: pastCooldown ? 'SUPPRESSED_NO_CHANGE' : 'SUPPRESSED_COOLDOWN',
        previousStage,
      };
    }

    // De-escalation that is not cooling: hold the recorded stage, stay silent.
    state.stage = targetStage;
    return { emit: false, reason: 'SUPPRESSED_NO_CHANGE', previousStage };
  }

  /**
   * Rate limit for intra-stage colour ("a 4th stock just made a new high")
   * that is not itself a transition.
   */
  allowIntraStageUpdate(key: string, now = Date.now()): boolean {
    const state = this.stateFor(key);
    if (now - state.lastUpdateTimestamp < this.config.dedup.intraStageUpdateMs) return false;
    state.lastUpdateTimestamp = now;
    return true;
  }

  reset(): void {
    this.states.clear();
  }
}
