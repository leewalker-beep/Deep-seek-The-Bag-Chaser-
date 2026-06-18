import { describe, it, expect } from 'vitest';
import { calculateLegacyScore } from '../../engine/legacyEngine';
import type { PlayerStats } from '../../types/game';

describe('Legacy Momentum', () => {
  const baseStats: PlayerStats = {
    bag: 1000,
    clout: 100,
    aura: 100,
    mentalHealth: 100,
    heat: 0,
    month: 12,
    currentTier: 'MUD',
    hustleLevels: {},
    hustleBranchIds: {},
    masteredHustles: [],
    flexAssets: {},
    unlockedAchievements: [],
    rentalCount: 0,
    flipCount: 0,
    vendingCount: 0,
    passiveLaborYield: 0,
    mentalShieldTurns: 0,
    artists: [],
    grammyCount: 0,
    recordLabelLevel: 1,
    realEstateType: 'residential',
    realEstateLeverage: 0,
    realEstateStrategy: 'hold',
    vcStage: 'seed',
    vcSector: 'tech',
    vcInvestment: 0,
    marketCycle: { realEstate: 'normal', vc: {} },
    monthsSinceCycleChange: 0,
    dynamicPassives: {},
    rivals: [],
    actionLog: [],
    milestones: [],
    events: [],
    collectedDeathBadges: [],
    completedDailyChallengesCount: 0,
    totalChallengesCompleted: 0,
    loginStreak: 0,
    stats: {
      lifetimeEarnings: 100000,
      successfulHustles: 10,
      totalHustles: 10
    }
  };

  it('calculates score with 0 momentum boost', () => {
    // profitPoints: 100,000
    // hustlePoints: 10 * 10 = 100
    // timePoints: 12 * 10 = 120
    // baseScore = 100,220
    // streakBonus = 0
    // multiplier = 1
    // momentumBoost = 0
    // Total = 100,220
    const score = calculateLegacyScore({ ...baseStats, totalChallengesCompleted: 5 });
    expect(score).toBe(100220);
  });

  it('applies 0.1% boost for 10 challenges', () => {
    // baseScore = 100,220
    // momentumBoost = 10 / 10 * 0.001 = 0.001
    // Total = 100,220 * 1.001 = 100,320.22 -> 100,320
    const score = calculateLegacyScore({ ...baseStats, totalChallengesCompleted: 10 });
    expect(score).toBe(100320);
  });

  it('applies 0.2% boost for 20 challenges', () => {
    // baseScore = 100,220
    // momentumBoost = 20 / 10 * 0.001 = 0.002
    // Total = 100,220 * 1.002 = 100,420.44 -> 100,420
    const score = calculateLegacyScore({ ...baseStats, totalChallengesCompleted: 20 });
    expect(score).toBe(100420);
  });

  it('handles 25 challenges (still 0.2% boost)', () => {
    const score = calculateLegacyScore({ ...baseStats, totalChallengesCompleted: 25 });
    expect(score).toBe(100420);
  });
});
