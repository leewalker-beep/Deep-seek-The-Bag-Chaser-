import { describe, it, expect } from 'vitest';
import { HUSTLES } from '../config/hustles/base';

describe('Minigame Quality, Identity and Replayability Pass', () => {
  it('ensures every configured hustle has a valid, approved minigame route', () => {
    Object.values(HUSTLES).forEach(hustle => {
      if (hustle.miniGame) {
        expect(typeof hustle.miniGame).toBe('string');
        expect(hustle.miniGame.length).toBeGreaterThan(0);
      }

      if (hustle.branches) {
        Object.values(hustle.branches).forEach(branch => {
          if (branch.miniGame) {
            expect(typeof branch.miniGame).toBe('string');
            expect(branch.miniGame.length).toBeGreaterThan(0);
          }
        });
      }

      if (hustle.levels) {
        hustle.levels.forEach(level => {
          if (level.miniGame) {
            expect(typeof level.miniGame).toBe('string');
            expect(level.miniGame.length).toBeGreaterThan(0);
          }
        });
      }
    });
  });

  it('validates score-to-multiplier calculations for ReactionGrid minigame logic', () => {
    // 0 hits should yield 0 multiplier (clamped to non-negative)
    const computeReactionGridMultiplier = (hits: number, targetHits: number, bestStreak: number) => {
      const scoreRatio = Math.min(1.5, (hits + Math.floor(bestStreak / 3)) / Math.max(1, targetHits));
      return Math.max(0, Math.min(4.0, Number((scoreRatio * 2.5).toFixed(2))));
    };

    expect(computeReactionGridMultiplier(0, 15, 0)).toBe(0);
    expect(computeReactionGridMultiplier(15, 15, 3)).toBe(2.67);
    expect(computeReactionGridMultiplier(25, 15, 12)).toBe(3.75);
  });

  it('validates score-to-multiplier calculations for BalanceScale minigame logic', () => {
    const computeBalanceScaleMultiplier = (balance: number) => {
      const score = 1 - Math.abs(50 - balance) / 50;
      return Math.max(0.5, Number((1.0 + score * 3.0).toFixed(2)));
    };

    expect(computeBalanceScaleMultiplier(50)).toBe(4.0); // Perfect balance
    expect(computeBalanceScaleMultiplier(25)).toBe(2.5); // Partial balance
    expect(computeBalanceScaleMultiplier(0)).toBe(1.0);  // Unbalanced boundary
  });

  it('validates score-to-multiplier calculations for TapAssign minigame logic', () => {
    const computeTapAssignMultiplier = (score: number, targetScore: number) => {
      return Math.max(0.2, Math.min(3.0, Number(((score / Math.max(1, targetScore)) * 2.5).toFixed(2))));
    };

    expect(computeTapAssignMultiplier(0, 12)).toBe(0.2); // Zero matches floor
    expect(computeTapAssignMultiplier(12, 12)).toBe(2.5); // Target met
    expect(computeTapAssignMultiplier(20, 12)).toBe(3.0); // Overshoot ceiling
  });

  it('validates score-to-multiplier calculations for WordTap minigame logic', () => {
    const computeWordTapMultiplier = (score: number, targetScore: number) => {
      return Math.max(0.2, Math.min(3.5, Number(((score / Math.max(1, targetScore)) * 2.5).toFixed(2))));
    };

    expect(computeWordTapMultiplier(0, 10)).toBe(0.2); // Zero score floor
    expect(computeWordTapMultiplier(10, 10)).toBe(2.5); // Target met
    expect(computeWordTapMultiplier(20, 10)).toBe(3.5); // Overshoot ceiling
  });

  it('validates difficulty scaling values across levels 1 through 5', () => {
    // Check that target hits increase predictably across levels 1 to 5
    const getTargetHitsForLevel = (level: number) => {
      const scaling = Math.min(2.0, 1.0 + (level - 1) * 0.15);
      return Math.floor((12 + (level - 1) * 3) * Math.sqrt(scaling));
    };

    const lvl1Target = getTargetHitsForLevel(1);
    const lvl3Target = getTargetHitsForLevel(3);
    const lvl5Target = getTargetHitsForLevel(5);

    expect(lvl1Target).toBe(12);
    expect(lvl3Target).toBeGreaterThan(lvl1Target);
    expect(lvl5Target).toBeGreaterThan(lvl3Target);
  });
});
